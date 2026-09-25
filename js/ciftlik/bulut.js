/* Çiftçi Fare — bulut taşıması (Aşama 1c): depo.js'teki TAŞIMA ARAYÜZÜ'nün /api/* uygulaması.
   Sunucu: sunucu/isleyiciler.mjs (Cloudflare Worker + D1). Plan: docs/ciftci-fare-plani.md "API".

   - Kimlik yalnız başlıkta: Authorization: Sinif KOD.anahtar (bu cihazın anahtarı),
     X-Oyuncu: oid (oynayan çocuk), öğretmen işlerinde Authorization: Ogretmen <oturum>.
     URL'de ve sorgu dizgisinde kimlik bilgisi YOK.
   - Öğretmen oturumu (8 saat) sessionStorage'da durur; sekme kapanınca gider.
   - Hata: Error{durum: HTTP kodu, kod}. Ağ hatasında durum yok → depo kuyruğu sonra yeniden dener.
   - GET çiftlik ETag'li: 304 gelince son gövde kullanılır.

   bulutTasima({kok, fetch?, oturumDepo?}) → taşıma; depo bağlanınca tasima.kimlikBagla(() => depo.cihaz). */

const OTURUM_ANAHTAR = kod => `ciftci-ogretmen:${kod}`;

function oturumDeposu() {
  let d = null;
  try { d = globalThis.sessionStorage; } catch {}
  const bellek = new Map();
  return {
    al(k) { try { return d ? d.getItem(k) : bellek.get(k) ?? null; } catch { return bellek.get(k) ?? null; } },
    yaz(k, v) { try { d ? d.setItem(k, v) : bellek.set(k, v); } catch { bellek.set(k, v); } },
    sil(k) { try { d?.removeItem(k); } catch {} bellek.delete(k); }
  };
}

export function bulutTasima({ kok, fetch: getir = (...a) => globalThis.fetch(...a), oturumDepo = oturumDeposu() }) {
  if (!kok) throw new Error('bulutTasima: API kökü gerekli');
  const taban = String(kok).replace(/\/+$/, '');
  let cihazAl = () => null;
  const etagler = new Map();   // yol → {etag, govde}

  const cihazYetkisi = kod => {
    const c = cihazAl();
    return c?.anahtar && c.sinifKod === kod ? { Authorization: `Sinif ${kod}.${c.anahtar}` } : {};
  };
  const ogretmenYetkisi = kod => {
    const o = oturumDepo.al(OTURUM_ANAHTAR(kod));
    return o ? { Authorization: `Ogretmen ${o}` } : {};
  };

  async function istek(yontem, yol, { govde, basliklar = {} } = {}) {
    const h = { ...basliklar };
    if (govde !== undefined) h['Content-Type'] = 'application/json';
    let r;
    try {
      r = await getir(taban + yol, {
        method: yontem, headers: h, body: govde === undefined ? undefined : JSON.stringify(govde),
        cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', mode: 'cors'
      });
    } catch (e) {
      const h2 = new Error('ag'); h2.ag = true; h2.neden = e; throw h2;
    }
    if (r.status === 304) return { durum: 304, govde: null, etag: r.headers.get('ETag') };
    let g = null;
    try { g = await r.json(); } catch {}
    if (!r.ok) {
      const e = new Error(g?.hata || `http-${r.status}`);
      e.durum = r.status; e.kod = g?.hata; e.govde = g;
      throw e;
    }
    return { durum: r.status, govde: g, etag: r.headers.get('ETag') };
  }
  const zaman = g => ({ simdi: g?.simdi, bugun: g?.bugun });

  return {
    kip: 'bulut',
    kok: taban,
    kimlikBagla(fn) { cihazAl = fn; },

    async saglik() { return (await istek('GET', '/api/saglik')).govde; },

    async sinifAl(kod) {
      const { govde } = await istek('GET', `/api/sinif/${encodeURIComponent(kod)}`, { basliklar: { ...ogretmenYetkisi(kod), ...cihazYetkisi(kod) } });
      return { sinif: govde.sinif, ozet: govde.ozet || [], ...zaman(govde) };
    },

    /** Yeni sınıf: sunucu kodu ve başlangıç gününü kendisi verir; bu cihazın anahtarı döner. */
    async sinifKur(sinif, { pin, kurulumKodu } = {}) {
      const { govde } = await istek('POST', '/api/sinif', { govde: { sinif, pin: String(pin ?? '') }, basliklar: { 'X-Kurulum-Kodu': String(kurulumKodu ?? '') } });
      return { sinif: govde.sinif, anahtar: govde.anahtar, cihaz: govde.cihaz, ...zaman(govde) };
    },

    /** Bu cihazı var olan sınıfa bağlar (sınıf kodu + öğretmen PIN'i) → bu cihaza özel anahtar. */
    async bagla(kod, pin) {
      const { govde } = await istek('POST', `/api/sinif/${encodeURIComponent(kod)}/bagla`, { govde: { pin: String(pin ?? '') } });
      return { sinif: govde.sinif, anahtar: govde.anahtar, cihaz: govde.cihaz, ...zaman(govde) };
    },

    async sinifGuncelle(kod, yama) {
      const { govde } = await istek('PATCH', `/api/sinif/${encodeURIComponent(kod)}`, { govde: yama, basliklar: ogretmenYetkisi(kod) });
      return { sinif: govde.sinif, ...zaman(govde) };
    },

    async sinifSil(kod) {
      const { govde } = await istek('DELETE', `/api/sinif/${encodeURIComponent(kod)}`, { basliklar: ogretmenYetkisi(kod) });
      oturumDepo.sil(OTURUM_ANAHTAR(kod));
      return { silindi: true, ...zaman(govde) };
    },

    async ciftlikAl(kod, oid) {
      const yol = `/api/ciftlik/${encodeURIComponent(kod)}/${encodeURIComponent(oid)}`;
      const onceki = etagler.get(yol);
      const r = await istek('GET', yol, { basliklar: { ...cihazYetkisi(kod), ...(onceki ? { 'If-None-Match': onceki.etag } : {}) } });
      if (r.durum === 304 && onceki) return { ciftlik: onceki.govde.ciftlik };
      if (r.etag) etagler.set(yol, { etag: r.etag, govde: r.govde });
      return { ciftlik: r.govde.ciftlik, ...zaman(r.govde) };
    },

    async islem(kod, oid, komutlar, { oyuncu } = {}) {
      const yol = `/api/ciftlik/${encodeURIComponent(kod)}/${encodeURIComponent(oid)}`;
      const r = await istek('POST', yol + '/islem', { govde: { komutlar }, basliklar: { ...cihazYetkisi(kod), 'X-Oyuncu': oyuncu || oid } });
      if (r.etag) etagler.set(yol, { etag: r.etag, govde: { ciftlik: r.govde.ciftlik } });
      return { ciftlik: r.govde.ciftlik, sonuclar: r.govde.sonuclar, ...zaman(r.govde) };
    },

    /** Öğretmen girişi: doğruysa oturum bu sekmede saklanır (PATCH/DELETE onu kullanır). */
    async pinDogrula(kod, pin) {
      try {
        const { govde } = await istek('POST', `/api/sinif/${encodeURIComponent(kod)}/ogretmen`, { govde: { pin: String(pin ?? '') } });
        if (govde?.oturum) oturumDepo.yaz(OTURUM_ANAHTAR(kod), govde.oturum);
        return { tamam: !!govde?.oturum, ...zaman(govde) };
      } catch (e) {
        if (e.durum === 403 || e.durum === 400) return { tamam: false };
        if (e.durum === 423) return { tamam: false, kilitli: true, kilitBitis: e.govde?.kilitBitis };
        throw e;
      }
    },
    oturumVar(kod) { return !!oturumDepo.al(OTURUM_ANAHTAR(kod)); },
    oturumKapat(kod) { oturumDepo.sil(OTURUM_ANAHTAR(kod)); }
  };
}

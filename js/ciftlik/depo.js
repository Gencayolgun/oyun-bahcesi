/* Çiftçi Fare — depo (depo.js): arayüz + YerelDepo.

   Plan: docs/ciftci-fare-plani.md "Veri modeli", "Eşitleme", "API".

   İKİ KATMAN
   1) İstemci (IstemciDepo): yerel önbellek + komut kuyruğu + iyimser
      uygulama + abonelik. YerelDepo ile BulutDepo'nun ORTAK gövdesi.
      - Komut {cihaz}:{sıra} kimliğiyle üretilir, ortak/uygula.js ile
        önbelleğe HEMEN uygulanır (dünya hemen değişir), kuyruğa yazılır.
      - Kuyruk taşımaya (tasima.islem) gönderilir; yanıttaki yetkili belge
        önbelleğin yerine geçer, henüz gönderilmemiş komutlar onun üstüne
        yeniden uygulanır (komutlar idempotent). Reddedilen komut kuyruktan
        düşer, etkisi sessizce geri alınır; çocuğa hata gösterilmez.
      - Kuyruk: 'Günü bitir'de (bosalt), 'online' olayında ve kuyruk
        doluyken 30 sn'de bir boşalır; kuyruk boşken hiç istek atılmaz.
        anindaGonder (YerelDepo'da açık) komuttan hemen sonra da boşaltır.
   2) Taşıma (tasima): yetkili durumun tutulduğu yer.
      YerelDepo = IstemciDepo + yerelTasima (anında gönderir); BulutDepo = IstemciDepo + bulutTasima.
      - yerelTasima: 'yalnız bu cihaz'. Sunucunun yapacağını bu cihazın
        localStorage'ında yapar (aynı uygula, aynı doğrulama).
      - bulutTasima (Aşama 1c): /api/* uçları; imzalar aşağıdaki TAŞIMA
        ARAYÜZÜ ile birebir aynı olacak. BulutDepo = IstemciDepo + bulutTasima.

   DEPO ARAYÜZÜ (YerelDepo ve BulutDepo aynı; kabuk.js, kimOynuyor.js,
   ogretmen.js, ziyaret.js yalnız bunları kullanır):
     await depo.hazirla()               → {cihaz, sinif}: önbellekten + taşımadan yükler
     depo.kurulumVar()                  → bu cihaz bir sınıfa bağlı mı
     depo.cihaz                         → {id:'c_xxxxxxxx', sinifKod, anahtar, kip, seq} | null
     depo.sinif                         → sınıf belgesi (ad YOK) | null
     depo.bugun()                       → gün numarası (saat.js)
     await depo.sinifKur(ayar)          → sınıf ('yalnız bu cihaz'; 1c: POST /api/sinif)
     await depo.sinifGuncelle(yama)     → sınıf (öğretmen; 1c: PATCH /api/sinif/:kod)
     depo.ciftlik(oid)                  → çiftlik (önbellek + bekleyen komutlar; senkron) | null
     await depo.ciftlikAc(oid)          → çiftlik (taşımadan taze okur)
     depo.komut(oid, {tur, hedef, hediye?}, {rol='sahip', kim}?)
                                        → {sonuc: 'tamam'|'zaten'|{red}, durum, komut}
     await depo.bosalt()                → {gonderilen, kalan}
     depo.bekleyen()                    → kuyruktaki komut sayısı
     depo.ozet(oid)                     → ciftlikOzet (ortak/uygula.js)
     depo.sinifOzet()                   → [{oid, sembol, renk, yas, konuTur, konuEvre, ihtiyaclar, sonGun}]
     depo.oynadi(oid) / depo.bugunOynayanlar()
                                        → bu cihazda bugün oynayanlar (Kim oynuyor soluk kartlar)
     depo.adlar() / depo.adYaz(oid, ad) → adlar YALNIZ bu cihazda ('ciftci-adlar:{KOD}')
     await depo.pinDogrula(pin)         → boolean (öğretmen dişlisi)
     depo.abone(fn)                     → çıkış işlevi. Olaylar:
                                          {tip:'ciftlik', oid, durum, neden:'komut'|'eslesme'|'yukleme'}
                                          {tip:'sinif', sinif} · {tip:'kuyruk', bekleyen}
     depo.sifirla()                     → bu cihazdaki ciftci-* anahtarlarını siler

   TAŞIMA ARAYÜZÜ (Promise döner; hepsi {simdi, bugun} de taşır):
     kip                                'yerel' | 'bulut'
     sinifAl(kod)                    → {sinif, ozet:[...]}          GET  /api/sinif/:kod
     sinifKur(sinif, {pin})          → {sinif, anahtar}             POST /api/sinif
     sinifGuncelle(kod, yama)        → {sinif}                      PATCH /api/sinif/:kod
     ciftlikAl(kod, oid)             → {ciftlik}                    GET  /api/ciftlik/:kod/:oid
     islem(kod, oid, komutlar, {oyuncu}) → {ciftlik, sonuclar}      POST /api/ciftlik/:kod/:oid/islem
     pinDogrula(kod, pin)            → {tamam, oturum?}             POST /api/sinif/:kod/ogretmen

   YEREL ANAHTARLAR (localStorage; hepsine erişim try/catch içinde):
     ciftci-cihaz            {id, sinifKod, anahtar, kip, seq}
     ciftci-sinif:{KOD}      sınıf önbelleği
     ciftci:{KOD}:{oid}      çiftlik önbelleği (son YETKİLİ belge)
     ciftci-kuyruk           gönderilmemiş komutlar [{kod, oid, rol, kim, komut}]
     ciftci-adlar:{KOD}      {oid: ad} (yalnız öğretmenin cihazı)
     ciftci-oynayan:{KOD}    {gun, oidler} (bu cihazda bugün oynayanlar)
     ciftci-yerel:*          yerelTasima'nın yetkili belgeleri ('yalnız bu cihaz')
   Sunucuya (ve yerelTasima'ya) çocuk ADI gitmez: öğrenci = oid + sembol + renk + yaş. */

import {uygula, uygulaHepsi, konuEsitle, ciftlikOzet} from './ortak/uygula.js';
import {yeniCiftlik, goc, klon} from './ortak/sema.js';
import {ciftlikDogrula, sinifDogrula, OID_DESEN, CIHAZ_DESEN, SINIF_KOD_DESEN, KOMUT_ID_DESEN} from './ortak/dogrula.js';
import {
  SEMA, SEMBOLLER, RENKLER, YAS_GRUPLARI, TAKVIMLER, KONU_TURLERI, UNITE_GUNLERI, VARSAYILAN_UNITE, SINIR
} from './ortak/turler.js';
import {tzGecerli, VARSAYILAN_TZ} from './ortak/zaman.js';

export const ANAHTAR = Object.freeze({
  cihaz: 'ciftci-cihaz',
  kuyruk: 'ciftci-kuyruk',
  sinif: kod => `ciftci-sinif:${kod}`,
  ciftlik: (kod, oid) => `ciftci:${kod}:${oid}`,
  adlar: kod => `ciftci-adlar:${kod}`,
  oynayan: kod => `ciftci-oynayan:${kod}`,
  yerelSinif: kod => `ciftci-yerel:sinif:${kod}`,
  yerelCiftlik: (kod, oid) => `ciftci-yerel:ciftlik:${kod}:${oid}`,
  yerelPin: kod => `ciftci-yerel:pin:${kod}`
});
const GONDERIM_ARALIGI = 30000;   // kuyruk doluyken 30 sn'de bir

/* ——————————————————————————————— depolama ——————————————————————————————— */

/** localStorage sarmalayıcı: JSON, try/catch (gizli pencere, kota, kapalı depo). */
export function yerelDepolama(ls) {
  let d = ls;
  if (d === undefined) { try { d = globalThis.localStorage; } catch { d = null; } }
  return {
    al(k) { try { const s = d?.getItem(k); return s == null ? null : JSON.parse(s); } catch { return null; } },
    yaz(k, v) { try { d?.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    sil(k) { try { d?.removeItem(k); } catch {} },
    anahtarlar() {
      try { const a = []; for (let i = 0; i < (d?.length || 0); i++) a.push(d.key(i)); return a; } catch { return []; }
    }
  };
}

/** Bellekte depolama: deneme açılışı ve node testleri. Hiçbir şey kalıcı değil. */
export function bellekDepolama(ilk = {}) {
  const m = new Map(Object.entries(ilk).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    al: k => (m.has(k) ? JSON.parse(m.get(k)) : null),
    yaz: (k, v) => { m.set(k, JSON.stringify(v)); return true; },
    sil: k => { m.delete(k); },
    anahtarlar: () => [...m.keys()]
  };
}

/* ——————————————————————————————— kimlikler ——————————————————————————————— */

const KUCUK = 'abcdefghijklmnopqrstuvwxyz0123456789';
const BUYUK = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // karışan I/O/0/1 yok
function rastgele(n, abece) {
  const a = new Uint32Array(n);
  try { globalThis.crypto.getRandomValues(a); } catch { for (let i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 2 ** 32); }
  let s = '';
  for (let i = 0; i < n; i++) s += abece[a[i] % abece.length];
  return s;
}
export const yeniCihazId = () => 'c_' + rastgele(8, KUCUK);
export const yeniOid = () => 'o_' + rastgele(8, KUCUK);
export const yeniSinifKod = () => rastgele(6, BUYUK);

/* ——————————————————————————————— PIN ——————————————————————————————— */

const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
/** PIN karması: PBKDF2-SHA256 (tarayıcı ve node'da crypto.subtle). Yoksa zayıf yedek. */
export async function pinKarma(pin, tuz) {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    try {
      const anahtar = await subtle.importKey('raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveBits']);
      const bit = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(tuz), iterations: 60000 }, anahtar, 256);
      return 'p2:' + hex(bit);
    } catch {}
  }
  let h = 0x811c9dc5;
  const s = tuz + ':' + pin;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return 'f1:' + (h >>> 0).toString(16);
}
export const PIN_DESEN = /^[0-9]{6,12}$/;

/* ——————————————————————————————— sınıf ——————————————————————————————— */

/** Kurulum ayarından yeni sınıf belgesi (ad YOK). Öğrencilere sembol ve renk sırayla verilir. */
export function yeniSinif({
  kod = yeniSinifKod(), bugun, tz, takvim = 'okul-gunleri', tahtaIs = 2, ziyaret = true,
  konu = null, uniteGun = VARSAYILAN_UNITE, ogrenciSayisi = 20, yas = '3-4', ogrenciler = null
} = {}) {
  if (!Number.isInteger(bugun)) throw new TypeError('yeniSinif: bugun gerekli');
  const n = Math.max(1, Math.min(SINIR.ogrenci, Math.floor(ogrenciSayisi) || 1));
  const liste = ogrenciler || Array.from({ length: n }, (_, i) => ({
    id: yeniOid(), sembol: SEMBOLLER[i], renk: RENKLER[i % RENKLER.length], yas: YAS_GRUPLARI.includes(yas) ? yas : '3-4'
  }));
  return {
    sema: SEMA,
    kod,
    olusturmaGun: bugun,
    ayarlar: {
      tz: tzGecerli(tz) ? tz : VARSAYILAN_TZ,
      takvim: TAKVIMLER.includes(takvim) ? takvim : 'okul-gunleri',
      tahtaIs: tahtaIs === 3 ? 3 : 2,
      ziyaret: ziyaret !== false
    },
    konu: KONU_TURLERI.includes(konu)
      ? { tur: konu, basGun: bugun, uniteGun: UNITE_GUNLERI.includes(uniteGun) ? uniteGun : VARSAYILAN_UNITE }
      : null,
    eskiKonular: [],
    donmalar: [],
    ogrenciler: liste
  };
}

/**
 * Sınıf yaması (saf; yerelTasima ve 1c sunucusu aynı kuralı kullanır). Yeni belge döner.
 * yama: {ayarlar?: {takvim, tahtaIs, ziyaret, tz}, konu?: {tur, uniteGun} | null,
 *        ogrenciEkle?: [{sembol?, renk?, yas?}], ogrenciCikar?: [oid], ogrenciGuncelle?: [{id, sembol?, renk?, yas?}]}
 * Konu değişince eski konu eskiKonular'a geçer; yeni konunun başlangıcı bugündür.
 */
export function sinifYamala(sinif, yama = {}, bugun) {
  const s = klon(sinif);
  const a = yama.ayarlar;
  if (a && typeof a === 'object') {
    if (TAKVIMLER.includes(a.takvim)) s.ayarlar.takvim = a.takvim;
    if (a.tahtaIs === 2 || a.tahtaIs === 3) s.ayarlar.tahtaIs = a.tahtaIs;
    if (typeof a.ziyaret === 'boolean') s.ayarlar.ziyaret = a.ziyaret;
    if (tzGecerli(a.tz)) s.ayarlar.tz = a.tz;
  }
  if ('konu' in yama) {
    const k = yama.konu;
    const eski = s.konu;
    if (k === null) {
      if (eski) s.eskiKonular = [...(s.eskiKonular || []), eski].slice(-40);
      s.konu = null;
    } else if (k && KONU_TURLERI.includes(k.tur)) {
      const unite = UNITE_GUNLERI.includes(k.uniteGun) ? k.uniteGun : (eski?.uniteGun ?? VARSAYILAN_UNITE);
      if (!eski || eski.tur !== k.tur) {
        if (eski) s.eskiKonular = [...(s.eskiKonular || []), eski].slice(-40);
        s.konu = { tur: k.tur, basGun: Number.isInteger(k.basGun) ? k.basGun : bugun, uniteGun: unite };
      } else {
        s.konu = { ...eski, uniteGun: unite };   // aynı tür: yalnız süre değişir, bitki yerinde kalır
      }
    }
  }
  const cikar = new Set(Array.isArray(yama.ogrenciCikar) ? yama.ogrenciCikar : []);
  if (cikar.size) s.ogrenciler = s.ogrenciler.filter(o => !cikar.has(o.id));
  for (const g of Array.isArray(yama.ogrenciGuncelle) ? yama.ogrenciGuncelle : []) {
    const o = s.ogrenciler.find(x => x.id === g?.id);
    if (!o) continue;
    if (YAS_GRUPLARI.includes(g.yas)) o.yas = g.yas;
    if (RENKLER.includes(g.renk)) o.renk = g.renk;
    if (SEMBOLLER.includes(g.sembol) && !s.ogrenciler.some(x => x !== o && x.sembol === g.sembol)) o.sembol = g.sembol;
  }
  for (const e of Array.isArray(yama.ogrenciEkle) ? yama.ogrenciEkle : []) {
    if (s.ogrenciler.length >= SINIR.ogrenci) break;
    const kullanilan = new Set(s.ogrenciler.map(o => o.sembol));
    const sembol = SEMBOLLER.includes(e?.sembol) && !kullanilan.has(e.sembol) ? e.sembol : SEMBOLLER.find(x => !kullanilan.has(x));
    if (!sembol) break;
    const renk = RENKLER.includes(e?.renk) ? e.renk : RENKLER[SEMBOLLER.indexOf(sembol) % RENKLER.length];
    s.ogrenciler.push({ id: OID_DESEN.test(e?.id || '') ? e.id : yeniOid(), sembol, renk, yas: YAS_GRUPLARI.includes(e?.yas) ? e.yas : '3-4' });
  }
  return s;
}

/* ——————————————————————————————— yerel taşıma ('yalnız bu cihaz') ——————————————————————————————— */

/** Çiftlik belgesini okurken: şema geçişi + doğrulama. Bozuksa null. */
function ciftlikOku(ham) {
  if (!ham || typeof ham !== 'object') return null;
  try {
    const d = goc(ham);
    return ciftlikDogrula(d).tamam ? d : null;
  } catch { return null; }
}

/**
 * Sunucunun yapacağını bu cihazda yapan taşıma. Aynı uygula ve doğrulama; ad yok.
 * saat: saat.js (bugün), depolama: yerelDepolama()/bellekDepolama().
 */
export function yerelTasima({ depolama, saat }) {
  const zaman = () => ({ simdi: saat.ms(), bugun: saat.bugun() });
  const sinifOku = kod => {
    const s = depolama.al(ANAHTAR.yerelSinif(kod));
    return s && sinifDogrula(s).tamam ? s : null;
  };
  const ciftlikYukle = (kod, oid, olusturmaGun) => {
    const d = ciftlikOku(depolama.al(ANAHTAR.yerelCiftlik(kod, oid)));
    if (d) return d;
    const yeni = yeniCiftlik(oid, olusturmaGun);
    depolama.yaz(ANAHTAR.yerelCiftlik(kod, oid), yeni);
    return yeni;
  };
  const ozetCikar = (sinif, bugun) => sinif.ogrenciler.map(o => {
    const d = ciftlikYukle(sinif.kod, o.id, bugun);
    let oz = { konuTur: null, konuEvre: null, ihtiyaclar: [], sonGun: null };
    try { oz = ciftlikOzet(d, bugun, sinif); } catch {}
    return { oid: o.id, sembol: o.sembol, renk: o.renk, yas: o.yas, ...oz };
  });
  return {
    kip: 'yerel',
    async sinifAl(kod) {
      const z = zaman();
      const sinif = sinifOku(kod);
      if (!sinif) { const e = new Error('sinif-yok'); e.durum = 404; throw e; }
      return { sinif, ozet: ozetCikar(sinif, z.bugun), ...z };
    },
    async sinifKur(sinif, { pin } = {}) {
      const z = zaman();
      const v = sinifDogrula(sinif);
      if (!v.tamam) { const e = new Error('gecersiz-sinif:' + v.red + (v.yol ? '@' + v.yol : '')); e.durum = 400; throw e; }
      depolama.yaz(ANAHTAR.yerelSinif(sinif.kod), sinif);
      for (const o of sinif.ogrenciler) ciftlikYukle(sinif.kod, o.id, z.bugun);
      if (pin !== undefined && pin !== null && pin !== '') {
        const tuz = rastgele(16, KUCUK);
        depolama.yaz(ANAHTAR.yerelPin(sinif.kod), { tuz, karma: await pinKarma(pin, tuz) });
      }
      return { sinif, anahtar: null, ...z };
    },
    async sinifGuncelle(kod, yama) {
      const z = zaman();
      const eski = sinifOku(kod);
      if (!eski) { const e = new Error('sinif-yok'); e.durum = 404; throw e; }
      const s = sinifYamala(eski, yama, z.bugun);
      const v = sinifDogrula(s);
      if (!v.tamam) { const e = new Error('gecersiz-sinif:' + v.red); e.durum = 400; throw e; }
      depolama.yaz(ANAHTAR.yerelSinif(kod), s);
      const kalan = new Set(s.ogrenciler.map(o => o.id));
      for (const o of eski.ogrenciler) if (!kalan.has(o.id)) depolama.sil(ANAHTAR.yerelCiftlik(kod, o.id));
      for (const o of s.ogrenciler) ciftlikYukle(kod, o.id, z.bugun);
      return { sinif: s, ...z };
    },
    async ciftlikAl(kod, oid) {
      const z = zaman();
      const sinif = sinifOku(kod);
      if (!sinif || !sinif.ogrenciler.some(o => o.id === oid)) { const e = new Error('ciftlik-yok'); e.durum = 404; throw e; }
      return { ciftlik: ciftlikYukle(kod, oid, z.bugun), ...z };
    },
    /* Sunucudaki POST .../islem'in aynısı: rol X-Oyuncu'dan (oyuncu === oid → sahip). */
    async islem(kod, oid, komutlar, { oyuncu } = {}) {
      const z = zaman();
      const sinif = sinifOku(kod);
      if (!sinif || !sinif.ogrenciler.some(o => o.id === oid)) { const e = new Error('ciftlik-yok'); e.durum = 404; throw e; }
      const rol = oyuncu === oid ? 'sahip' : 'ziyaretci';
      const once = ciftlikYukle(kod, oid, z.bugun);
      const r = uygulaHepsi(once, komutlar.slice(0, SINIR.komut), { rol, kim: rol === 'sahip' ? null : oyuncu, bugun: z.bugun, sinif });
      const d = ciftlikDogrula(r.durum).tamam ? r.durum : once;
      depolama.yaz(ANAHTAR.yerelCiftlik(kod, oid), d);
      return { ciftlik: d, sonuclar: r.sonuclar, ...z };
    },
    async pinDogrula(kod, pin) {
      const kayit = depolama.al(ANAHTAR.yerelPin(kod));
      if (!kayit) return { tamam: true };               // PIN konmamış yerel sınıf: dişli yeter
      return { tamam: (await pinKarma(pin, kayit.tuz)) === kayit.karma };
    }
  };
}

/* ——————————————————————————————— istemci depo (ortak gövde) ——————————————————————————————— */

export class IstemciDepo {
  /**
   * @param tasima       yerelTasima(...) ya da (1c) bulutTasima(...)
   * @param saat         saat.js
   * @param depolama     yerelDepolama() / bellekDepolama()
   * @param anindaGonder komuttan hemen sonra kuyruğu boşalt (YerelDepo: true)
   */
  constructor({ tasima, saat, depolama = yerelDepolama(), anindaGonder = false, aralik = GONDERIM_ARALIGI } = {}) {
    this.tasima = tasima;
    this.saat = saat;
    this.depolama = depolama;
    this.anindaGonder = anindaGonder;
    this.aralik = aralik;
    this.cihaz = null;
    this.sinif = null;
    this._onbellek = new Map();   // oid → son yetkili belge
    this._gorunum = new Map();    // oid → yetkili + bekleyen komutlar
    this._ozet = new Map();       // oid → sınıf özeti satırı
    this._kuyruk = [];
    this._abonelar = new Set();
    this._zamanlayici = null;
    this._gonderiyor = null;
    this._online = null;
  }

  /* ——— olaylar ——— */
  abone(fn) { this._abonelar.add(fn); return () => this._abonelar.delete(fn); }
  _yay(olay) {
    for (const fn of [...this._abonelar]) { try { fn(olay); } catch (e) { console.error(e); } }
  }

  bugun() { return this.saat.bugun(); }
  kurulumVar() { return !!(this.cihaz?.sinifKod && this.sinif); }
  bekleyen() { return this._kuyruk.length; }
  get kod() { return this.cihaz?.sinifKod || null; }

  _cihazYaz() { this.depolama.yaz(ANAHTAR.cihaz, this.cihaz); }
  _kuyrukYaz() {
    // Başka sınıfın kuyruğu (cihaz yeniden bağlandıysa) korunur.
    const baska = (this.depolama.al(ANAHTAR.kuyruk) || []).filter(k => k?.kod !== this.kod);
    this.depolama.yaz(ANAHTAR.kuyruk, [...baska, ...this._kuyruk]);
    this._yay({ tip: 'kuyruk', bekleyen: this._kuyruk.length });
  }
  _zaman(r) { if (this.tasima.kip === 'bulut' && typeof r?.simdi === 'number') this.saat.esitle(r.simdi); }

  async hazirla() {
    const c = this.depolama.al(ANAHTAR.cihaz);
    this.cihaz = c && CIHAZ_DESEN.test(c.id) ? { id: c.id, sinifKod: c.sinifKod ?? null, anahtar: c.anahtar ?? null, kip: c.kip || this.tasima.kip, seq: Number.isInteger(c.seq) ? c.seq : 0 } : null;
    if (!this.cihaz?.sinifKod || !SINIF_KOD_DESEN.test(this.cihaz.sinifKod)) return { cihaz: this.cihaz, sinif: null };
    const kod = this.kod;
    const onbellekSinif = this.depolama.al(ANAHTAR.sinif(kod));
    if (onbellekSinif && sinifDogrula(onbellekSinif).tamam) this.sinif = onbellekSinif;
    this._kuyruk = (this.depolama.al(ANAHTAR.kuyruk) || []).filter(k => k?.kod === kod && KOMUT_ID_DESEN.test(k?.komut?.id || ''));
    try {
      const r = await this.tasima.sinifAl(kod);
      this._zaman(r);
      this._sinifAyarla(r.sinif);
      for (const o of r.ozet || []) this._ozet.set(o.oid, o);
    } catch (e) {
      if (e?.durum === 404 && !this.sinif) { this.cihaz = { ...this.cihaz, sinifKod: null }; this._cihazYaz(); return { cihaz: this.cihaz, sinif: null }; }
    }
    if (!this.sinif) return { cihaz: this.cihaz, sinif: null };
    // Önbellekteki çiftlikler + bekleyen komutlar
    for (const o of this.sinif.ogrenciler) {
      const d = ciftlikOku(this.depolama.al(ANAHTAR.ciftlik(kod, o.id)));
      if (d) { this._onbellek.set(o.id, d); this._gorunumKur(o.id, 'yukleme', false); }
    }
    this._seqKurtar();
    if (this._kuyruk.length) this._planla(this.anindaGonder ? 0 : this.aralik);
    this._onlineBagla();
    return { cihaz: this.cihaz, sinif: this.sinif };
  }

  /* Cihaz sırası hiç geri gitmesin: depo silinip yeniden yazılamadıysa bile
     bilinen en büyük sıra (çiftliklerin cihazSeq'i, kuyruk) aşılır. */
  _seqKurtar() {
    if (!this.cihaz) return;
    let en = this.cihaz.seq || 0;
    for (const d of this._onbellek.values()) en = Math.max(en, d.cihazSeq?.[this.cihaz.id] || 0);
    for (const k of this._kuyruk) {
      const m = KOMUT_ID_DESEN.exec(k.komut.id);
      if (m && m[1] === this.cihaz.id) en = Math.max(en, Number(m[2]));
    }
    if (en !== this.cihaz.seq) { this.cihaz.seq = en; this._cihazYaz(); }
  }

  _onlineBagla() {
    if (this._online || typeof addEventListener !== 'function') return;
    this._online = () => { this.bosalt(); };
    try { addEventListener('online', this._online); } catch {}
  }

  _sinifAyarla(s) {
    if (!s || !sinifDogrula(s).tamam) return;
    const onceki = this.sinif?.kod === s.kod ? this.sinif.ogrenciler.map(o => o.id) : [];
    this.sinif = s;
    this.depolama.yaz(ANAHTAR.sinif(s.kod), s);
    // Sınıftan çıkan öğrencinin önbelleği gider: bellekte ve bu cihazdaki 'ciftci*…:{oid}' kayıtları
    // (çiftlik önbelleği, 'Sen yokken' görülenleri). Adı öğretmen paneli ayrıca siler.
    const kalan = new Set(s.ogrenciler.map(o => o.id));
    for (const oid of [...this._onbellek.keys()]) if (!kalan.has(oid)) { this._onbellek.delete(oid); this._gorunum.delete(oid); this._ozet.delete(oid); }
    const cikan = onceki.filter(oid => !kalan.has(oid));
    if (cikan.length) {
      for (const k of this.depolama.anahtarlar()) {
        if (k.startsWith('ciftci') && cikan.some(oid => k.endsWith(':' + oid))) this.depolama.sil(k);
      }
    }
    for (const oid of this._gorunum.keys()) this._ozetGuncelle(oid);
    this._yay({ tip: 'sinif', sinif: s });
  }

  /** 'Yalnız bu cihaz' sınıfı kurar (1c'de BulutDepo aynı imzayla POST /api/sinif). */
  async sinifKur(ayar = {}) {
    const bugun = this.bugun();
    let tz = ayar.tz;
    if (!tzGecerli(tz)) { try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { tz = VARSAYILAN_TZ; } }
    const sinif = yeniSinif({ ...ayar, tz, bugun });
    if (ayar.pin !== undefined && ayar.pin !== '' && !PIN_DESEN.test(String(ayar.pin))) throw new Error('pin');
    const r = await this.tasima.sinifKur(sinif, { pin: ayar.pin });
    this._zaman(r);
    const eski = this.cihaz;
    this.cihaz = { id: eski?.id && CIHAZ_DESEN.test(eski.id) ? eski.id : yeniCihazId(), sinifKod: r.sinif.kod, anahtar: r.anahtar ?? null, kip: this.tasima.kip, seq: eski?.seq || 0 };
    this._cihazYaz();
    this._onbellek.clear(); this._gorunum.clear(); this._ozet.clear(); this._kuyruk = [];
    this._sinifAyarla(r.sinif);
    await this._hepsiniYukle();
    this._onlineBagla();
    return this.sinif;
  }

  /** Öğretmen: ayarlar, konu, öğrenci ekle/çıkar (bkz. sinifYamala). */
  async sinifGuncelle(yama) {
    if (!this.kod) throw new Error('sinif-yok');
    await this.bosalt();
    const r = await this.tasima.sinifGuncelle(this.kod, yama);
    this._zaman(r);
    this._sinifAyarla(r.sinif);
    await this._hepsiniYukle();
    return this.sinif;
  }

  async _hepsiniYukle() {
    try {
      const r = await this.tasima.sinifAl(this.kod);
      for (const o of r.ozet || []) this._ozet.set(o.oid, o);
    } catch {}
    if (this.tasima.kip === 'yerel') for (const o of this.sinif.ogrenciler) await this.ciftlikAc(o.id).catch(() => null);
  }

  ogrenci(oid) { return this.sinif?.ogrenciler.find(o => o.id === oid) || null; }

  /** Görünen belge: son yetkili belge + henüz onaylanmamış komutlar. */
  ciftlik(oid) {
    if (this._gorunum.has(oid)) return this._gorunum.get(oid);
    if (!this.kod) return null;
    const d = ciftlikOku(this.depolama.al(ANAHTAR.ciftlik(this.kod, oid)));
    if (!d) return null;
    this._onbellek.set(oid, d);
    return this._gorunumKur(oid, 'yukleme', false);
  }

  async ciftlikAc(oid) {
    if (!this.kod) throw new Error('sinif-yok');
    try {
      const r = await this.tasima.ciftlikAl(this.kod, oid);
      this._zaman(r);
      const d = ciftlikOku(r.ciftlik);
      if (d) { this._onbellek.set(oid, d); this.depolama.yaz(ANAHTAR.ciftlik(this.kod, oid), d); }
    } catch (e) {
      if (!this._onbellek.has(oid) && !this.ciftlik(oid)) throw e;
    }
    if (!this._onbellek.has(oid)) this._onbellek.set(oid, yeniCiftlik(oid, this.bugun()));
    return this._gorunumKur(oid, 'yukleme');
  }

  _gorunumKur(oid, neden, yay = true) {
    const taban = this._onbellek.get(oid);
    const bekleyen = this._kuyruk.filter(k => k.oid === oid);
    let d = taban;
    const bugun = this.bugun();
    for (const k of bekleyen) d = uygula(d, k.komut, { rol: k.rol, kim: k.kim, bugun, sinif: this.sinif }).durum;
    this._gorunum.set(oid, d);
    this._ozetGuncelle(oid);
    if (yay) this._yay({ tip: 'ciftlik', oid, durum: d, neden });
    return d;
  }

  _ozetGuncelle(oid) {
    const o = this.ogrenci(oid), d = this._gorunum.get(oid);
    if (!o || !d || !this.sinif) return;
    try {
      this._ozet.set(oid, { oid, sembol: o.sembol, renk: o.renk, yas: o.yas, ...ciftlikOzet(d, this.bugun(), this.sinif) });
    } catch {}
  }

  ozet(oid) {
    const d = this.ciftlik(oid);
    return d && this.sinif ? ciftlikOzet(d, this.bugun(), this.sinif) : null;
  }

  /** Kim oynuyor ve öğretmen paneli için: sınıfın her öğrencisi (sınıf listesi sırasıyla). */
  sinifOzet() {
    if (!this.sinif) return [];
    return this.sinif.ogrenciler.map(o => {
      if (this._gorunum.has(o.id)) this._ozetGuncelle(o.id);
      return this._ozet.get(o.id) || { oid: o.id, sembol: o.sembol, renk: o.renk, yas: o.yas, konuTur: null, konuEvre: null, ihtiyaclar: [], sonGun: null };
    });
  }

  /**
   * Komut: iyimser uygula → kuyruk → abonelere 'ciftlik' olayı. Reddedilen komut kuyruğa girmez.
   * @param oid     çiftlik sahibi
   * @param istek   {tur, hedef, hediye?}  (tur/hedef sabit listeden: ortak/turler.js)
   * @param secenek {rol: 'sahip' | 'ziyaretci', kim: ziyaretçinin oid'i}
   */
  komut(oid, istek, { rol = 'sahip', kim = null } = {}) {
    if (!this.kurulumVar()) return { sonuc: { red: 'sinif-yok' }, durum: null, komut: null };
    let d = this.ciftlik(oid);
    if (!d) {
      if (!this.ogrenci(oid)) return { sonuc: { red: 'ogrenci-yok' }, durum: null, komut: null };
      this._onbellek.set(oid, yeniCiftlik(oid, this.bugun()));
      d = this._gorunumKur(oid, 'yukleme', false);
    }
    const bugun = this.bugun();
    this.cihaz.seq = (this.cihaz.seq || 0) + 1;
    this._cihazYaz();
    const komut = { id: `${this.cihaz.id}:${this.cihaz.seq}`, tur: istek?.tur, hedef: istek?.hedef, gun: bugun };
    if (istek?.tur === 'hediye') komut.hediye = istek.hediye;
    const r = uygula(d, komut, { rol, kim: rol === 'ziyaretci' ? kim : null, bugun, sinif: this.sinif });
    if (r.sonuc !== 'tamam') return { sonuc: r.sonuc, durum: d, komut };
    this._kuyruk.push({ kod: this.kod, oid, rol, kim: rol === 'ziyaretci' ? kim : null, komut });
    this._kuyrukYaz();
    this._gorunum.set(oid, r.durum);
    this._ozetGuncelle(oid);
    this._yay({ tip: 'ciftlik', oid, durum: r.durum, neden: 'komut', komut });
    this._planla(this.anindaGonder ? 0 : this.aralik);
    return { sonuc: 'tamam', durum: r.durum, komut };
  }

  _planla(ms) {
    if (!this._kuyruk.length) return;
    if (this._zamanlayici && ms > 0) return;
    if (this._zamanlayici) clearTimeout(this._zamanlayici);
    this._zamanlayici = setTimeout(() => { this._zamanlayici = null; this.bosalt(); }, ms);
    this._zamanlayici?.unref?.();                          // node (testler): süreç açık kalmasın
  }

  /** Kuyruğu gönderir. Aynı anda tek gönderim; sürerken gelen çağrı onu bekler. */
  async bosalt() {
    while (this._gonderiyor) await this._gonderiyor.catch(() => {});
    if (!this._kuyruk.length) return { gonderilen: 0, kalan: 0 };
    const is = this._gonder();
    this._gonderiyor = is;
    try { return await is; } finally { if (this._gonderiyor === is) this._gonderiyor = null; }
  }

  async _gonder() {
    let gonderilen = 0;
    const gruplar = [];
    for (const k of this._kuyruk) {
      const oyuncu = k.rol === 'ziyaretci' ? k.kim : k.oid;
      let g = gruplar.find(x => x.oid === k.oid && x.oyuncu === oyuncu);
      if (!g) gruplar.push(g = { oid: k.oid, oyuncu, liste: [] });
      g.liste.push(k);
    }
    let hata = null;
    for (const g of gruplar) {
      for (let i = 0; i < g.liste.length; i += SINIR.komut) {
        const parca = g.liste.slice(i, i + SINIR.komut);
        try {
          const r = await this.tasima.islem(this.kod, g.oid, parca.map(k => k.komut), { oyuncu: g.oyuncu });
          this._zaman(r);
          const gid = new Set(parca.map(k => k.komut.id));
          this._kuyruk = this._kuyruk.filter(k => !gid.has(k.komut.id));
          this._kuyrukYaz();
          const d = ciftlikOku(r.ciftlik);
          if (d) { this._onbellek.set(g.oid, d); this.depolama.yaz(ANAHTAR.ciftlik(this.kod, g.oid), d); }
          gonderilen += parca.length;
          this._gorunumKur(g.oid, 'eslesme');
        } catch (e) {
          hata = e;
          if (e?.durum === 403 || e?.durum === 400 || e?.durum === 404) {
            // Kalıcı red: komutlar düşer, etkisi sessizce geri alınır.
            const gid = new Set(parca.map(k => k.komut.id));
            this._kuyruk = this._kuyruk.filter(k => !gid.has(k.komut.id));
            this._kuyrukYaz();
            if (this._onbellek.has(g.oid)) this._gorunumKur(g.oid, 'eslesme');
          } else break;
        }
      }
    }
    if (this._kuyruk.length) this._planla(this.aralik);
    else if (this._zamanlayici) { clearTimeout(this._zamanlayici); this._zamanlayici = null; }   // kuyruk boşken istek yok
    return { gonderilen, kalan: this._kuyruk.length, hata: hata ? String(hata.message || hata) : null };
  }

  /* ——— bu cihazdaki yardımcı kayıtlar ——— */
  oynadi(oid) {
    if (!this.kod) return;
    const bugun = this.bugun();
    const k = this.depolama.al(ANAHTAR.oynayan(this.kod));
    const oidler = k?.gun === bugun && Array.isArray(k.oidler) ? k.oidler : [];
    if (!oidler.includes(oid)) oidler.push(oid);
    this.depolama.yaz(ANAHTAR.oynayan(this.kod), { gun: bugun, oidler });
  }
  bugunOynayanlar() {
    if (!this.kod) return [];
    const bugun = this.bugun();
    const k = this.depolama.al(ANAHTAR.oynayan(this.kod));
    const yerel = k?.gun === bugun && Array.isArray(k.oidler) ? k.oidler : [];
    const ozet = this.sinifOzet().filter(o => o.sonGun === bugun).map(o => o.oid);
    return [...new Set([...yerel, ...ozet])];
  }
  adlar() { return (this.kod && this.depolama.al(ANAHTAR.adlar(this.kod))) || {}; }
  adYaz(oid, ad) {
    if (!this.kod) return;
    const a = this.adlar();
    const temiz = String(ad ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (temiz) a[oid] = temiz; else delete a[oid];
    this.depolama.yaz(ANAHTAR.adlar(this.kod), a);
  }
  async pinDogrula(pin) {
    if (!this.kod) return false;
    try { return !!(await this.tasima.pinDogrula(this.kod, String(pin ?? ''))).tamam; } catch { return false; }
  }

  /** Bu cihazdaki bütün ciftci-* kayıtlarını siler ('sınıfı kapat', testler). */
  sifirla() {
    for (const k of this.depolama.anahtarlar()) if (k === ANAHTAR.cihaz || k === ANAHTAR.kuyruk || k.startsWith('ciftci')) this.depolama.sil(k);
    if (this._zamanlayici) clearTimeout(this._zamanlayici);
    this._zamanlayici = null;
    this.cihaz = null; this.sinif = null;
    this._onbellek.clear(); this._gorunum.clear(); this._ozet.clear(); this._kuyruk = [];
  }

  kapat() {
    if (this._zamanlayici) clearTimeout(this._zamanlayici);
    this._zamanlayici = null;
    if (this._online) { try { removeEventListener('online', this._online); } catch {} this._online = null; }
  }
}

/** 'Yalnız bu cihaz' deposu: yetkili durum bu cihazın localStorage'ında. */
export class YerelDepo extends IstemciDepo {
  constructor({ saat, depolama = yerelDepolama(), anindaGonder = true } = {}) {
    super({ tasima: yerelTasima({ depolama, saat }), saat, depolama, anindaGonder });
  }
}

/**
 * Çevrimiçi depo (Aşama 1c): AYNI gövde, yalnız taşıma farklı. 1c yalnız bulutTasima'yı yazar
 * (TAŞIMA ARAYÜZÜ; kip: 'bulut'; her yanıtta simdi → saat.esitle). Kuyruk 30 sn'de bir, 'online'
 * olayında ve 'Günü bitir'de boşalır; kuyruk boşken istek atılmaz.
 */
export class BulutDepo extends IstemciDepo {
  constructor({ saat, tasima, depolama = yerelDepolama(), aralik = GONDERIM_ARALIGI } = {}) {
    if (!tasima || tasima.kip !== 'bulut') throw new Error('BulutDepo: bulut taşıması gerekli (Aşama 1c)');
    super({ tasima, saat, depolama, anindaGonder: false, aralik });
  }
}

/** Görüntü için: konu parseli sınıfın güncel konusuna eşitlenmiş kopya (depo belgesi değişmez). */
export function gorunenCiftlik(durum, sinif, bugun) {
  if (!durum) return null;
  try { return konuEsitle(durum, sinif, bugun); } catch { return klon(durum); }
}

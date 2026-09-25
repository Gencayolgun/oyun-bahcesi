/* Çiftçi Fare — öğretmen paneli (ogretmen.js). Plan: "Sınıf akışı / ÖĞRETMEN",
   "Konu tohumları", "Gizlilik".

   Giriş kabukta (kabuk.js): köşedeki dişliye 2 sn basılı tutmak + PIN
   (en az 6 rakam; cihazda PBKDF2 ile karmalı saklanır, düz PIN hiçbir yerde
   durmaz). PIN doğruysa kabuk kancalar.ogretmenPaneli(baglam) ile bu paneli açar.

   Panelde (yerel; 1c/1d'de aynı depo arayüzü sunucuya yazar):
   - Şimdi: takılan çocuk için 'Birlikte bitir' (iş tamam sayılır) ve 'Eve getir'.
   - Konu tohumu (ceviz / buğday / domates), ünite süresi (1, 2, 4 hafta),
     takvim (okul günleri / her gün), tahtada iş sayısı (2 / 3), ziyaret (açık / kapalı).
     Konu değişince yeni konu BUGÜN başlar: çocukların konu parselinde yeni tohum
     ihtiyacı çıkar, eski bitki 'anılar'a taşınır, kaybolmaz (ortak/uygula.js konuEsitle).
   - Sınıf listesi: sembol ekle / çıkar, yaş grubu (3-4 / 5-6), İSTEĞE BAĞLI ad.
     Ad YALNIZ bu cihazda ('ciftci-adlar:{KOD}', depo.adYaz); sınıf belgesine ve
     sunucuya gitmez. 'Sembol ↔ ad' listesi yazdırılıp sınıfa asılabilir.

   Panel öğretmen içindir: yazı ve rakam burada serbest (çocuk ekranı değil).
   Çocuk verisi (ad) yalnız textContent ve value ile yazılır, innerHTML'e asla.

   Dışa açık: ogretmenPaneliAc(baglam) → {el, kapat()}
     baglam (kabuk.js baglam() + kapat): {depo, aktif(), birlikteBitir(), eveGetir(),
       kimOynuyor(), sayfa, kapat()} */

import {KONU_TURLERI, UNITE_GUNLERI, TAKVIMLER, YAS_GRUPLARI, SEMBOLLER, SINIR} from './ortak/turler.js';
import {sembolSvg, sembolAdi} from './semboller.js';

const KONU_ADI = { ceviz: 'Ceviz', bugday: 'Buğday', domates: 'Domates' };
const UNITE_ADI = { 5: '1 hafta', 10: '2 hafta', 20: '4 hafta' };
const TAKVIM_ADI = { 'okul-gunleri': 'Okul günleri', 'her-gun': 'Her gün' };
const YAS_ADI = { '3-4': '3-4 yaş', '5-6': '5-6 yaş' };
/* Çevrimiçi sınıfta öğretmen oturumu 8 saat geçerli; dolunca sunucu 401 döner. */
const kayitHatasi = h => (h?.durum === 401 ? 'Öğretmen oturumu doldu. Paneli kapatıp dişliyle yeniden açın.' : 'Kaydedilemedi. Lütfen yeniden deneyin.');
const EN_AZ = 2;                                         // sınıfta en az iki çocuk

const el = (tag, cls, ek = {}) => { const e = document.createElement(tag); if (cls) e.className = cls; Object.assign(e, ek); return e; };
const bolum = (cls, baslik) => { const s = el('section', `panel-bolum ${cls}`); s.append(el('h3', '', { textContent: baslik })); return s; };

function secimKur(ad, etiket, secenekler, secili) {
  const f = el('fieldset', 'kurulum-secim panel-secim');
  f.append(el('legend', '', { textContent: etiket }));
  for (const [deger, yazi] of secenekler) {
    const l = el('label');
    const r = el('input', '', { type: 'radio', name: ad, value: String(deger), checked: String(deger) === String(secili) });
    l.append(r, el('span', '', { textContent: yazi }));
    f.append(l);
  }
  return f;
}

/**
 * Paneli açar (kabuk: PIN doğrulanınca).
 * @returns {el, kapat()}
 */
export function ogretmenPaneliAc(baglam) {
  const { depo } = baglam;
  const kok = baglam.sayfa || document.body;
  kok.querySelector('.ciftlik-panel')?.remove();
  const p = el('div', 'ciftlik-panel');
  p.setAttribute('role', 'dialog');
  p.setAttribute('aria-modal', 'true');
  p.setAttribute('aria-label', 'Öğretmen paneli');
  const kart = el('div', 'panel-kart');
  p.append(kart);
  let degisti = false;                                   // ad ya da liste değişti: Kim oynuyor yenilensin

  const kapat = () => {
    if (!p.isConnected) return;
    p.remove();
    document.removeEventListener('keydown', tus, true);
    try { baglam.kapat?.(); } catch (e) { console.error(e); }
    if (degisti && baglam.aktif?.().ekran === 'kim') baglam.kimOynuyor?.();
  };
  const tus = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); kapat(); } };
  document.addEventListener('keydown', tus, true);

  /* ——— üst ——— */
  const ust = el('header', 'panel-ust');
  ust.append(el('h2', '', { textContent: 'Öğretmen paneli' }));
  const kapatD = el('button', 'pin-ac panel-kapat', { type: 'button', textContent: 'Kapat' });
  kapatD.addEventListener('click', kapat);
  ust.append(kapatD);
  kart.append(ust);

  /* ——— şimdi oynayan: kısayollar ——— */
  const a = baglam.aktif?.() || {};
  if (a.ekran === 'ciftlik' && a.oid) {
    const s = bolum('panel-simdi', a.rol === 'ziyaretci' ? 'Şimdi: arkadaş ziyareti' : 'Şimdi oynayan');
    const kisayol = el('div', 'panel-kisayollar');
    const isVar = baglam.isVarMi ? baglam.isVarMi() : true;
    const birlikte = el('button', 'pin-vazgec panel-birlikte', { type: 'button', textContent: 'Birlikte bitir', disabled: !isVar });
    birlikte.title = 'Takılan çocuğun şimdiki işi tamam sayılır';
    birlikte.addEventListener('click', () => { kapat(); baglam.birlikteBitir(); });
    const eve = el('button', 'pin-vazgec panel-eve', { type: 'button', textContent: 'Eve getir' });
    eve.title = 'Fare verandaya döner';
    eve.addEventListener('click', () => { kapat(); baglam.eveGetir(); });
    kisayol.append(birlikte, eve);
    s.append(kisayol);
    kart.append(s);
  }

  /* ——— ayarlar ——— */
  const ayarForm = el('form', 'panel-bolum panel-ayarlar');
  ayarForm.noValidate = true;
  ayarForm.append(el('h3', '', { textContent: 'Konu ve ayarlar' }));
  const simdiki = () => ({
    konu: depo.sinif?.konu?.tur ?? null,
    unite: depo.sinif?.konu?.uniteGun ?? 10,
    takvim: depo.sinif?.ayarlar?.takvim ?? 'okul-gunleri',
    tahtaIs: depo.sinif?.ayarlar?.tahtaIs === 3 ? 3 : 2,
    ziyaret: depo.sinif?.ayarlar?.ziyaret !== false
  });
  const s0 = simdiki();
  ayarForm.append(
    secimKur('konu', 'Konu tohumu', KONU_TURLERI.map(t => [t, KONU_ADI[t] || t]), s0.konu),
    secimKur('unite', 'Ünite süresi', UNITE_GUNLERI.map(u => [u, UNITE_ADI[u] || `${u} gün`]), s0.unite),
    secimKur('takvim', 'Takvim', TAKVIMLER.map(t => [t, TAKVIM_ADI[t] || t]), s0.takvim),
    secimKur('tahtaIs', 'Tahtada iş sayısı', [[2, '2 iş'], [3, '3 iş']], s0.tahtaIs),
    secimKur('ziyaret', 'Arkadaş ziyareti', [['acik', 'Açık'], ['kapali', 'Kapalı']], s0.ziyaret ? 'acik' : 'kapali')
  );
  const konuUyari = el('p', 'panel-uyari', { hidden: true });
  const kaydet = el('button', 'kurulum-dugme panel-kaydet', { type: 'submit', textContent: 'Kaydet' });
  const ayarDurum = el('output', 'panel-durum');
  ayarDurum.setAttribute('role', 'status');
  const dugmeler = el('div', 'panel-dugmeler'); dugmeler.append(kaydet, ayarDurum);
  ayarForm.append(konuUyari, dugmeler);
  const deger = ad => ayarForm.querySelector(`input[name="${ad}"]:checked`)?.value;
  const uyariGuncelle = () => {
    const tur = deger('konu');
    const eski = simdiki().konu;
    const farkli = !!tur && tur !== eski;
    konuUyari.hidden = !farkli;
    konuUyari.textContent = farkli
      ? `Konu ${KONU_ADI[tur] || tur} olacak ve bugün başlayacak. Her çocuğun konu parselinde yeni tohum ekilecek; şimdiki ${KONU_ADI[eski] || 'konu'} bitkisi çocuğun anılarına taşınır, silinmez.`
      : '';
  };
  ayarForm.addEventListener('change', () => { ayarDurum.value = ''; uyariGuncelle(); });
  ayarForm.addEventListener('submit', async e => {
    e.preventDefault();
    const once = simdiki();
    const yama = {
      ayarlar: { takvim: deger('takvim'), tahtaIs: Number(deger('tahtaIs')) === 3 ? 3 : 2, ziyaret: deger('ziyaret') !== 'kapali' }
    };
    const tur = deger('konu'), unite = Number(deger('unite'));
    if (tur && (tur !== once.konu || unite !== once.unite)) yama.konu = { tur, uniteGun: unite };
    kaydet.disabled = true;
    try {
      await depo.sinifGuncelle(yama);
      ayarDurum.value = yama.konu && tur !== once.konu ? 'Kaydedildi. Yeni konu bugün başladı.' : 'Kaydedildi.';
    } catch (hata) {
      console.error(hata);
      ayarDurum.value = kayitHatasi(hata);
    }
    kaydet.disabled = false;
    uyariGuncelle();
  });
  kart.append(ayarForm);

  /* ——— sınıf listesi ——— */
  const liste = bolum('panel-sinif', 'Sınıf listesi');
  liste.append(el('p', 'panel-not', { textContent: 'Çocuklar oyunda yalnız sembolleriyle tanınır. Ad yazmak isteğe bağlıdır; adlar yalnız bu cihazda saklanır, hiçbir yere gönderilmez.' }));
  const tablo = el('div', 'panel-liste');
  tablo.setAttribute('role', 'list');
  const listeDurum = el('output', 'panel-durum');
  listeDurum.setAttribute('role', 'status');
  const ekleKutu = el('div', 'panel-ekle');
  const ekleD = el('button', 'pin-vazgec panel-cocuk-ekle', { type: 'button', textContent: 'Çocuk ekle' });
  const secici = el('div', 'panel-sembol-sec', { hidden: true });
  const yazdirD = el('button', 'pin-vazgec panel-yazdir', { type: 'button', textContent: 'Sembol ↔ ad listesini yazdır' });
  ekleKutu.append(ekleD, yazdirD);
  liste.append(tablo, ekleKutu, secici, listeDurum);
  kart.append(liste);

  const guncelle = async (yama, mesaj) => {
    try {
      await depo.sinifGuncelle(yama);
      degisti = true;
      listeDurum.value = mesaj;
    } catch (hata) {
      console.error(hata);
      listeDurum.value = kayitHatasi(hata);
    }
    listeCiz();
  };

  function listeCiz() {
    const s = depo.sinif;
    const adlar = depo.adlar();
    const akt = baglam.aktif?.() || {};
    const kilitli = new Set([akt.oid, akt.kim].filter(Boolean));
    tablo.replaceChildren(...(s?.ogrenciler || []).map(o => {
      const satir = el('div', 'panel-cocuk');
      satir.setAttribute('role', 'listitem');
      satir.dataset.oid = o.id;
      satir.dataset.sembol = o.sembol;
      satir.style.setProperty('--renk', o.renk);
      const resim = el('span', 'panel-cocuk-sembol');
      resim.innerHTML = sembolSvg(o.sembol);                      // sabit çizim
      const adi = el('span', 'panel-cocuk-adi', { textContent: sembolAdi(o.sembol) });
      const yas = el('select', 'panel-yas');
      yas.setAttribute('aria-label', `${sembolAdi(o.sembol)}: yaş grubu`);
      for (const y of YAS_GRUPLARI) yas.append(el('option', '', { value: y, textContent: YAS_ADI[y] || y, selected: o.yas === y }));
      yas.addEventListener('change', () => guncelle({ ogrenciGuncelle: [{ id: o.id, yas: yas.value }] }, `${sembolAdi(o.sembol)}: yaş grubu kaydedildi.`));
      const ad = el('input', 'panel-ad', { type: 'text', maxLength: 40, value: adlar[o.id] || '', placeholder: 'Ad (isteğe bağlı)', autocomplete: 'off' });
      ad.setAttribute('aria-label', `${sembolAdi(o.sembol)}: ad (yalnız bu cihazda)`);
      ad.addEventListener('change', () => {
        depo.adYaz(o.id, ad.value);
        degisti = true;
        listeDurum.value = ad.value.trim() ? 'Ad yalnız bu cihaza kaydedildi.' : 'Ad silindi.';
      });
      const cikar = el('button', 'pin-vazgec panel-cikar', { type: 'button', textContent: 'Çıkar' });
      cikar.setAttribute('aria-label', `${sembolAdi(o.sembol)}: sınıftan çıkar`);
      cikar.disabled = kilitli.has(o.id) || (s.ogrenciler.length <= EN_AZ);
      if (kilitli.has(o.id)) cikar.title = 'Şu an oynayan çocuk çıkarılamaz';
      cikar.addEventListener('click', () => {
        if (!cikar.classList.contains('onay')) {
          cikar.classList.add('onay');
          cikar.textContent = 'Emin misiniz? Çıkar';
          cikar.setAttribute('aria-label', `${sembolAdi(o.sembol)}: çiftliğiyle birlikte çıkarmayı onayla`);
          listeDurum.value = 'Çocuk çıkarılınca çiftliği de silinir. Onaylamak için yeniden basın.';
          return;
        }
        depo.adYaz(o.id, '');
        guncelle({ ogrenciCikar: [o.id] }, `${sembolAdi(o.sembol)} sınıftan çıkarıldı.`);
      });
      satir.append(resim, adi, yas, ad, cikar);
      return satir;
    }));
    ekleD.disabled = (s?.ogrenciler.length || 0) >= SINIR.ogrenci;
    if (!secici.hidden) seciciCiz();
  }

  function seciciCiz() {
    const s = depo.sinif;
    const kullanilan = new Set((s?.ogrenciler || []).map(o => o.sembol));
    secici.replaceChildren();
    secici.append(el('p', 'panel-not', { textContent: 'Yeni çocuğun sembolünü seçin. Semboller çıkartmalardan ve iş resimlerinden ayrı bir kümedir.' }));
    const yasSec = secimKur('yeniYas', 'Yaş grubu', YAS_GRUPLARI.map(y => [y, YAS_ADI[y] || y]), '3-4');
    secici.append(yasSec);
    const izgara = el('div', 'panel-sembol-izgara');
    for (const sembol of SEMBOLLER.filter(x => !kullanilan.has(x))) {
      const b = el('button', 'panel-sembol', { type: 'button' });
      b.dataset.sembol = sembol;
      b.setAttribute('aria-label', `${sembolAdi(sembol)} sembolüyle çocuk ekle`);
      b.title = sembolAdi(sembol);
      b.innerHTML = sembolSvg(sembol);                            // sabit çizim
      b.addEventListener('click', () => {
        const yas = secici.querySelector('input[name="yeniYas"]:checked')?.value || '3-4';
        secici.hidden = true;
        guncelle({ ogrenciEkle: [{ sembol, yas }] }, `${sembolAdi(sembol)} sınıfa eklendi.`);
      });
      izgara.append(b);
    }
    secici.append(izgara);
  }
  ekleD.addEventListener('click', () => {
    secici.hidden = !secici.hidden;
    if (!secici.hidden) seciciCiz();
  });
  yazdirD.addEventListener('click', () => yazdir(depo));
  listeCiz();

  /* ——— sınıf: kayıt yeri, sınıf kodu (öteki cihazları bağlamak için), sınıfı kapat ——— */
  const sb = bolum('panel-kayit', 'Sınıf');
  const cevrimici = depo.kip?.() === 'bulut';
  sb.append(el('p', 'panel-not', {
    textContent: cevrimici
      ? 'Kayıt çevrimiçi: tahta, tablet ve ev aynı çiftlikleri görür. Başka bir cihazı bağlamak için o cihazda “Bu cihazı bağla”yı seçip sınıf kodunu ve PIN’i girin.'
      : 'Kayıt yalnız bu cihazda (internetsiz).'
  }));
  if (cevrimici && depo.kod) {
    const kodSatir = el('p', 'panel-sinif-kod');
    kodSatir.append(el('span', '', { textContent: 'Sınıf kodu: ' }), el('strong', '', { textContent: depo.kod }));
    sb.append(kodSatir);
  }
  const kapatSinifD = el('button', 'pin-vazgec panel-sinif-kapat', { type: 'button', textContent: 'Sınıfı sil…' });
  const onay = el('form', 'panel-onay', { hidden: true });
  onay.noValidate = true;
  const onayGiris = el('input', '', { type: 'text', name: 'onayKod', autocomplete: 'off', autocapitalize: 'characters', maxLength: 14 });
  const onayEtiket = el('label', 'kurulum-alan');
  onayEtiket.append(el('span', '', { textContent: `Bütün çiftlikler ${cevrimici ? 'sunucudan ve ' : ''}bu cihazdan silinir. Onaylamak için sınıf kodunu (${depo.kod || ''}) yazın.` }), onayGiris);
  const onayD = el('button', 'pin-vazgec panel-sinif-sil', { type: 'submit', textContent: 'Evet, sınıfı sil' });
  const sinifDurum = el('output', 'panel-durum');
  sinifDurum.setAttribute('role', 'status');
  onay.append(onayEtiket, onayD);
  kapatSinifD.addEventListener('click', () => { onay.hidden = !onay.hidden; if (!onay.hidden) onayGiris.focus({ preventScroll: true }); });
  onay.addEventListener('submit', async e => {
    e.preventDefault();
    if (onayGiris.value.trim().toUpperCase() !== depo.kod) { sinifDurum.value = 'Sınıf kodu eşleşmedi.'; return; }
    onayD.disabled = true;
    try {
      await depo.sinifKapat();
      kapat();
      baglam.kurulum?.();
    } catch (hata) {
      console.error(hata);
      sinifDurum.value = 'Sınıf kapatılamadı. Lütfen yeniden deneyin.';
      onayD.disabled = false;
    }
  });
  sb.append(kapatSinifD, onay, sinifDurum);
  kart.append(sb);

  kok.append(p);
  kapatD.focus({ preventScroll: true });
  return { el: p, kapat };
}

/**
 * 'Sembol ↔ ad' listesi: yazdırılıp sınıfa asılır. Adı yazılmamış çocuğun satırı boş kalır
 * (öğretmen elle yazar). Sayfa yazdırılınca kaldırılır.
 */
export function yazdir(depo) {
  document.querySelector('.ciftlik-yazdir')?.remove();
  const s = depo.sinif;
  if (!s) return null;
  const adlar = depo.adlar();
  const kagit = el('section', 'ciftlik-yazdir');
  kagit.setAttribute('aria-label', 'Sembol ve ad listesi');
  kagit.append(el('h1', '', { textContent: 'Çiftçi Fare — sınıfımızın sembolleri' }));
  const izgara = el('div', 'yazdir-izgara');
  for (const o of s.ogrenciler) {
    const k = el('div', 'yazdir-kart');
    k.dataset.oid = o.id;
    k.style.setProperty('--renk', o.renk);
    const r = el('span', 'yazdir-sembol');
    r.innerHTML = sembolSvg(o.sembol);                              // sabit çizim
    k.append(r, el('strong', 'yazdir-ad', { textContent: adlar[o.id] || '' }), el('span', 'yazdir-sembol-adi', { textContent: sembolAdi(o.sembol) }));
    izgara.append(k);
  }
  kagit.append(izgara);
  document.body.append(kagit);
  const kaldir = () => { kagit.remove(); removeEventListener('afterprint', kaldir); };
  addEventListener('afterprint', kaldir);
  try { window.print(); } catch (e) { console.error(e); }
  setTimeout(kaldir, 60000);                                       // afterprint gelmezse
  return kagit;
}

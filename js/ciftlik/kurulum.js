/* Çiftçi Fare — kurulum ekranı (kurulum.js): sınıf kur / cihazı bağla / yalnız bu cihaz.

   Plan: docs/ciftci-fare-plani.md "Aşama 1c". Bu ekran ÖĞRETMEN içindir (okuma gerektirir).
   - Çevrimiçi kayıt yoksa (API kökü boş: js/ciftlik/api-adres.js) yalnız 'bu cihaz' formu gösterilir.
   - Çevrimiçiyse üç seçenek:
       Yeni sınıf kur   → kurulum kodu + PIN (sunucuda sınıf; bu cihaza özel anahtar)
       Bu cihazı bağla  → sınıf kodu + PIN (tablet, ev bilgisayarı…)
       Yalnız bu cihaz  → kayıt yalnız bu tarayıcıda
   - Çevrimiçi sınıf kurulunca sınıf kodu bir kez büyük yazılır; öteki cihazlar onunla bağlanır.
   - Kod ve çocuk verisi innerHTML'e yazılmaz; hepsi textContent. PIN alanı iş bitince DOM'dan gider.

   kurulumAc(kap, {depo, bitti}) → {kapat()} */

import { PIN_DESEN } from './depo.js';
import { KONU_TURLERI, SINIR } from './ortak/turler.js';

const el = (tag, cls, ek = {}) => { const e = document.createElement(tag); if (cls) e.className = cls; Object.assign(e, ek); return e; };
const KONU_ADI = { ceviz: 'Ceviz', bugday: 'Buğday', domates: 'Domates' };

const HATA_METNI = {
  'kurulum-kodu': 'Kurulum kodu yanlış.',
  'kurulum-kapali': 'Sunucuda kurulum kapalı (CIFTLIK_KURULUM_KODU girilmemiş).',
  'pin-yanlis': 'Sınıf kodu ya da PIN yanlış.',
  'sinif-yok': 'Bu kodla bir sınıf bulunamadı.',
  'kilitli': 'Çok fazla hatalı deneme. 15 dakika sonra yeniden deneyin.',
  'hiz': 'Çok fazla deneme. Birkaç dakika sonra yeniden deneyin.',
  'kod': 'Sınıf kodu geçersiz.',
  'ag': 'Sunucuya ulaşılamadı. İnternet bağlantısını denetleyin.'
};
const hataMetni = (e, yedek) => HATA_METNI[e?.kod] || HATA_METNI[e?.message] || (e?.ag ? HATA_METNI.ag : yedek);
/* Beklenen öğretmen hataları (yanlış PIN, kilit, ağ) konsola yazılmaz; yalnız beklenmeyenler. */
const gunluk = e => { if (!HATA_METNI[e?.kod] && !HATA_METNI[e?.message] && !e?.ag) console.error(e); };

export function kurulumAc(kap, { depo, bitti }) {
  const bulut = !!depo.bulutVar?.();
  let kapali = false;
  const goster = kart => { if (!kapali) kap.replaceChildren(kart); };

  function secimKarti() {
    const kart = el('div', 'kurulum-kart');
    kart.append(el('h1', '', { textContent: 'Çiftçi Fare' }));
    kart.append(el('p', 'kurulum-not', { textContent: 'Çocuk adı sorulmaz; her çocuk bir sembolle tanınır. Çevrimiçi sınıfta tahta, tablet ve ev aynı çiftliği görür.' }));
    const secenekler = el('div', 'kurulum-secenekler');
    const secenek = (yazi, aciklama, fn) => {
      const d = el('button', 'kurulum-secenek', { type: 'button' });
      d.append(el('strong', '', { textContent: yazi }), el('span', '', { textContent: aciklama }));
      d.addEventListener('click', fn);
      secenekler.append(d);
    };
    secenek('Yeni sınıf kur', 'Çevrimiçi: kayıt sunucuda, her cihazdan', () => goster(sinifFormu('bulut')));
    secenek('Bu cihazı bağla', 'Kurulmuş sınıfa: sınıf kodu ve PIN ile', () => goster(baglaFormu()));
    secenek('Yalnız bu cihaz', 'İnternetsiz: kayıt bu tarayıcıda kalır', () => goster(sinifFormu('yerel')));
    kart.append(secenekler);
    return kart;
  }

  const geriDugmesi = () => {
    const g = el('button', 'kurulum-geri', { type: 'button', textContent: 'Geri' });
    g.addEventListener('click', () => goster(secimKarti()));
    return g;
  };
  const alan = (etiket, girdi) => { const l = el('label', 'kurulum-alan'); l.append(el('span', '', { textContent: etiket }), girdi); return l; };

  function sinifFormu(kip) {
    const kart = el('form', 'kurulum-kart');
    kart.noValidate = true;
    kart.append(el('h1', '', { textContent: 'Çiftçi Fare' }));
    kart.append(el('p', 'kurulum-not', {
      textContent: kip === 'bulut'
        ? 'Çevrimiçi yeni sınıf kurulur. Sunucuda çocuk adı tutulmaz: her çocuk bir sembol, şapka rengi ve yaş grubudur.'
        : 'Bu cihazda yeni bir sınıf kurulur. Kayıt yalnız bu cihazda tutulur; çocuk adı sorulmaz, her çocuk bir sembolle tanınır.'
    }));
    const secim = (ad, secenekler, secili) => {
      const f = el('fieldset', 'kurulum-secim');
      f.append(el('legend', '', { textContent: ad.etiket }));
      for (const [deger, yazi] of secenekler) {
        const l = el('label');
        const r = el('input', '', { type: 'radio', name: ad.ad, value: String(deger), checked: deger === secili });
        l.append(r, el('span', '', { textContent: yazi }));
        f.append(l);
      }
      return f;
    };
    const sayi = el('input', '', { type: 'number', min: '2', max: String(SINIR.ogrenci), value: '20', name: 'sayi', inputMode: 'numeric' });
    kart.append(alan('Çocuk sayısı', sayi));
    kart.append(secim({ ad: 'yas', etiket: 'Yaş grubu' }, [['3-4', '3-4 yaş'], ['5-6', '5-6 yaş']], '3-4'));
    kart.append(secim({ ad: 'konu', etiket: 'Konu tohumu' }, KONU_TURLERI.map(t => [t, KONU_ADI[t] || t]), 'ceviz'));
    kart.append(secim({ ad: 'unite', etiket: 'Ünite süresi' }, [[5, '1 hafta'], [10, '2 hafta'], [20, '4 hafta']], 10));
    kart.append(secim({ ad: 'takvim', etiket: 'Takvim' }, [['okul-gunleri', 'Okul günleri'], ['her-gun', 'Her gün']], 'okul-gunleri'));
    const pin = el('input', '', { type: 'password', name: 'pin', inputMode: 'numeric', autocomplete: 'new-password', minLength: 6, maxLength: 12 });
    kart.append(alan('Öğretmen PIN’i (en az 6 rakam)', pin));
    const kurulumKodu = el('input', '', { type: 'password', name: 'kurulumKodu', autocomplete: 'off', maxLength: 128 });
    if (kip === 'bulut') kart.append(alan('Kurulum kodu (sunucuyu kuran kişiden)', kurulumKodu));
    const uyari = el('p', 'kurulum-uyari', { role: 'alert' });
    const kur = el('button', 'kurulum-dugme', { type: 'submit', textContent: 'Sınıfı kur' });
    kart.append(uyari, kur);
    if (bulut) kart.append(geriDugmesi());
    kart.addEventListener('submit', async e => {
      e.preventDefault();
      const n = Math.round(Number(sayi.value));
      if (!(n >= 2 && n <= SINIR.ogrenci)) { uyari.textContent = `Çocuk sayısı 2 ile ${SINIR.ogrenci} arasında olmalı.`; return; }
      if (!PIN_DESEN.test(pin.value)) { uyari.textContent = 'PIN en az 6 rakam olmalı.'; return; }
      if (kip === 'bulut' && !kurulumKodu.value.trim()) { uyari.textContent = 'Kurulum kodunu yazın.'; return; }
      const deger = ad => kart.querySelector(`input[name="${ad}"]:checked`)?.value;
      kur.disabled = true;
      uyari.textContent = '';
      try {
        await depo.sinifKur({
          ogrenciSayisi: n, yas: deger('yas'), konu: deger('konu'), uniteGun: Number(deger('unite')),
          takvim: deger('takvim'), pin: pin.value, ...(kip === 'bulut' ? { kip, kurulumKodu: kurulumKodu.value.trim() } : {})
        });
        pin.value = ''; kurulumKodu.value = '';
        if (kip === 'bulut') goster(kodKarti(depo.sinif.kod));
        else bitti();
      } catch (hata) {
        gunluk(hata);
        uyari.textContent = hataMetni(hata, 'Sınıf kurulamadı. Lütfen yeniden deneyin.');
        kur.disabled = false;
      }
    });
    queueMicrotask(() => sayi.focus({ preventScroll: true }));
    return kart;
  }

  function baglaFormu({ oncekiKod = null } = {}) {
    const kart = el('form', 'kurulum-kart kurulum-bagla');
    kart.noValidate = true;
    kart.append(el('h1', '', { textContent: 'Bu cihazı bağla' }));
    kart.append(el('p', 'kurulum-not', {
      textContent: oncekiKod
        ? 'Bu cihazın sınıf bağlantısı sona erdi. Öğretmen PIN’iyle yeniden bağlayın; bu cihazda gönderilmemiş işler ve adlar korunur.'
        : 'Sınıfı kuran cihazdaki öğretmen panelinde yazan sınıf kodunu ve öğretmen PIN’ini girin.'
    }));
    const kod = el('input', '', { type: 'text', name: 'sinifKod', autocomplete: 'off', autocapitalize: 'characters', spellcheck: false, maxLength: 14, value: oncekiKod || '' });
    const pin = el('input', '', { type: 'password', name: 'pin', inputMode: 'numeric', autocomplete: 'off', maxLength: 12 });
    kart.append(alan('Sınıf kodu', kod), alan('Öğretmen PIN’i', pin));
    const uyari = el('p', 'kurulum-uyari', { role: 'alert' });
    const bagla = el('button', 'kurulum-dugme', { type: 'submit', textContent: 'Bağla' });
    kart.append(uyari, bagla, geriDugmesi());
    kart.addEventListener('submit', async e => {
      e.preventDefault();
      if (!/^[A-Za-z0-9 -]{4,14}$/.test(kod.value.trim())) { uyari.textContent = 'Sınıf kodunu yazın.'; return; }
      if (!PIN_DESEN.test(pin.value)) { uyari.textContent = 'PIN en az 6 rakam olmalı.'; return; }
      bagla.disabled = true;
      uyari.textContent = '';
      try {
        await depo.cihazBagla(kod.value, pin.value);
        pin.value = '';
        bitti();
      } catch (hata) {
        gunluk(hata);
        uyari.textContent = hataMetni(hata, 'Bağlanamadı. Lütfen yeniden deneyin.');
        bagla.disabled = false;
      }
    });
    queueMicrotask(() => (oncekiKod ? pin : kod).focus({ preventScroll: true }));
    return kart;
  }

  function kodKarti(kod) {
    const kart = el('div', 'kurulum-kart kurulum-kod');
    kart.append(el('h1', '', { textContent: 'Sınıf kuruldu' }));
    kart.append(el('p', 'kurulum-not', { textContent: 'Tahtayı, tableti ya da ev bilgisayarını bu sınıfa bağlamak için o cihazda “Bu cihazı bağla”yı seçip bu kodu ve PIN’inizi girin. Kod öğretmen panelinde de yazar.' }));
    kart.append(el('p', 'kurulum-sinif-kod', { textContent: kod }));
    const devam = el('button', 'kurulum-dugme', { type: 'button', textContent: 'Devam' });
    devam.addEventListener('click', () => bitti());
    kart.append(devam);
    queueMicrotask(() => devam.focus({ preventScroll: true }));
    return kart;
  }

  const oncekiKod = depo.cihaz?.oncekiKod;
  goster(bulut ? (oncekiKod ? baglaFormu({ oncekiKod }) : secimKarti()) : sinifFormu('yerel'));
  return { kapat() { kapali = true; } };
}

/* Çiftçi Fare — 'Kim oynuyor?' ızgarası (kimOynuyor.js).

   Plan: "Oyun döngüsü" 1) GİRİŞ ve "Sınıf akışı".
   - Çocuk kendi SEMBOLÜNE dokunur. Kartlar ≥170 px; kartın halkası çocuğun
     şapka rengi.
   - Bugün oynayanların kartı soluk (yine seçilebilir: öğretmen isterse).
   - Sıradaki ÖNERİLEN kart büyük (2×2) ve hafifçe nabız gibi atar. Öneri
     belirlenimcidir, zar yok (siraOner). Öğretmen istediği karta dokunarak
     sırayı değiştirir.
   - Kartların yeri HER GÜN AYNI (sınıf listesi sırası): çocuk sembolünü hep
     aynı yerde bulur. Sıralama, rakam, puan YOK; kartta evre ikonu yok.
   - Ad yalnız öğretmenin bu cihaza yazdığı adlardan ('ciftci-adlar:{KOD}')
     küçük bir altyazı olarak gelir; sunucuya gitmez. */

import {sembolSvg, sembolAdi} from './semboller.js';
import {siraOner} from './sira.js';

/* Sıra önerisi (saf, belirlenimci): sira.js. Buradan da dışa açık kalır (eski içe aktarımlar). */
export {siraOner};

const el = (tag, cls, ek = {}) => { const e = document.createElement(tag); if (cls) e.className = cls; Object.assign(e, ek); return e; };

/**
 * Izgarayı açar.
 * @param kok   ekranın konacağı kap
 * @param depo  depo.js arayüzü (sinifOzet, bugunOynayanlar, adlar, bugun)
 * @param sec   (oid) => {} çocuk seçilince
 * @returns {el, yenile(), kapat(), onerilen()}
 */
export function kimOynuyorAc(kok, { depo, sec }) {
  const ekran = el('section', 'kim-oynuyor');
  ekran.setAttribute('aria-label', 'Kim oynuyor?');
  const ust = el('header', 'kim-ust');
  const baslik = el('h1', 'gorunmez-baslik', { textContent: 'Kim oynuyor?' });
  ust.append(baslik);
  const izgara = el('div', 'kim-izgara');
  izgara.setAttribute('role', 'list');
  ekran.append(ust, izgara);
  kok.append(ekran);
  let onerilen = null;

  function yenile() {
    const ozet = depo.sinifOzet();
    const oynayanlar = depo.bugunOynayanlar();
    const adlar = depo.adlar();
    onerilen = siraOner(ozet, oynayanlar, depo.bugun());
    izgara.replaceChildren(...ozet.map(o => {
      const kart = el('button', 'kim-kart');
      kart.type = 'button';
      kart.setAttribute('role', 'listitem');
      kart.dataset.oid = o.oid;
      kart.dataset.sembol = o.sembol;
      kart.style.setProperty('--renk', o.renk);
      const ad = adlar[o.oid];
      kart.setAttribute('aria-label', ad ? `${sembolAdi(o.sembol)}, ${ad}` : sembolAdi(o.sembol));
      if (oynayanlar.includes(o.oid)) kart.classList.add('oynadi');
      if (o.oid === onerilen) kart.classList.add('onerilen');
      const resim = el('span', 'kim-sembol');
      resim.innerHTML = sembolSvg(o.sembol);
      kart.append(resim);
      if (ad) kart.append(el('span', 'kim-ad', { textContent: ad }));   // yalnız bu cihazdaki ad (öğretmen için)
      kart.addEventListener('click', () => sec?.(o.oid));
      return kart;
    }));
  }
  yenile();
  // Önerilen karta odak: klavyeyle/uzaktan kumandayla Enter yeter.
  requestAnimationFrame(() => izgara.querySelector('.onerilen')?.focus({ preventScroll: true }));
  return {
    el: ekran,
    yenile,
    onerilen: () => onerilen,
    kapat() { ekran.remove(); }
  };
}

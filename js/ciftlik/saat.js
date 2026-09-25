/* Çiftçi Fare — istemci saati (saat.js).

   Plan: docs/ciftci-fare-plani.md "Eşitleme / ZAMAN".
   - Gün numarası ortak/zaman.js'in gunNo'suyla, sınıfın saat diliminde.
   - Zaman oturum boyunca performance.now ile ilerler: taban (ms) bir kez
     alınır, sonra yalnız monoton sayaçla büyür. Böylece oyun sürerken
     cihaz saatini elle değiştirmek günü değiştirmez.
   - Sunucu YOKKEN (YerelDepo, 'yalnız bu cihaz') taban cihaz saatidir;
     sekme yeniden görünür olunca cihaz saatine yeniden eşitlenir.
   - Sunucu VARKEN (BulutDepo, Aşama 1c) her yanıttaki 'simdi' ile
     esitle(ms) çağrılır; o andan sonra cihaz saatine hiç bakılmaz.
   - Test için saat kaynakları enjekte edilebilir: saatKur({simdi, perf}).
     Playwright page.clock Date.now'ı ve performance.now'ı birlikte
     ilerlettiği için tarayıcıda enjekte etmeye gerek kalmaz.

   API:
     const saat = saatKur({simdi?, perf?, tz?})
     saat.ms()            → şimdiki zaman (ms, epoch)
     saat.bugun()         → gün numarası (sınıfın saat diliminde)
     saat.tz(yeni?)       → saat dilimi (geçerliyse değiştirir)
     saat.esitle(ms)      → sunucu zamanına eşitle (kaynak: 'sunucu')
     saat.cihazaEsitle()  → kaynak 'cihaz' ise cihaz saatine yeniden eşitle
     saat.kaynak()        → 'cihaz' | 'sunucu'
     saat.denetle()       → günü yeniden hesaplar; değiştiyse abonelere
                            {onceki, bugun} bildirir; bugünü döner
     saat.abone(fn)       → gün değişince fn({onceki, bugun}); çıkış işlevi döner
     saat.baslat({aralik}) / saat.durdur()
                          → tarayıcıda: aralıklı denetim + görünürlük
                            değişiminde yeniden eşitleme */

import {gunNo, tzGecerli, VARSAYILAN_TZ} from './ortak/zaman.js';

const varsayilanPerf = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

export function saatKur({ simdi = () => Date.now(), perf = varsayilanPerf, tz = VARSAYILAN_TZ } = {}) {
  let tabanMs = simdi();
  let tabanPerf = perf();
  let kaynak = 'cihaz';
  let dilim = tzGecerli(tz) ? tz : VARSAYILAN_TZ;
  let sonGun = null;
  let zamanlayici = null;
  let gorunurluk = null;
  const abonelar = new Set();

  const ms = () => tabanMs + (perf() - tabanPerf);
  const bugun = () => gunNo(ms(), dilim);

  const saat = {
    ms,
    bugun,
    tz(yeni) {
      if (yeni !== undefined && tzGecerli(yeni) && yeni !== dilim) { dilim = yeni; saat.denetle(); }
      return dilim;
    },
    kaynak: () => kaynak,
    /** Sunucunun 'simdi' değeriyle eşitle (BulutDepo her yanıtta çağırır). */
    esitle(sunucuMs) {
      if (typeof sunucuMs !== 'number' || !Number.isFinite(sunucuMs)) return saat;
      tabanMs = sunucuMs; tabanPerf = perf(); kaynak = 'sunucu';
      saat.denetle();
      return saat;
    },
    /** Sunucu yokken: cihaz saatine yeniden eşitle (sekme görünür olunca). */
    cihazaEsitle() {
      if (kaynak === 'cihaz') { tabanMs = simdi(); tabanPerf = perf(); }
      saat.denetle();
      return saat;
    },
    denetle() {
      const g = bugun();
      if (sonGun === null) { sonGun = g; return g; }
      if (g !== sonGun) {
        const onceki = sonGun;
        sonGun = g;
        for (const fn of [...abonelar]) {
          try { fn({ onceki, bugun: g }); } catch (e) { console.error(e); }
        }
      }
      return g;
    },
    abone(fn) {
      abonelar.add(fn);
      return () => abonelar.delete(fn);
    },
    /** Tarayıcıda aralıklı gün denetimi ve görünürlük eşitlemesi. */
    baslat({ aralik = 2000 } = {}) {
      saat.durdur();
      saat.denetle();
      zamanlayici = setInterval(() => saat.denetle(), aralik);
      if (typeof document !== 'undefined') {
        gorunurluk = () => { if (!document.hidden) saat.cihazaEsitle(); };
        document.addEventListener('visibilitychange', gorunurluk);
      }
      return saat;
    },
    durdur() {
      if (zamanlayici) clearInterval(zamanlayici);
      zamanlayici = null;
      if (gorunurluk && typeof document !== 'undefined') document.removeEventListener('visibilitychange', gorunurluk);
      gorunurluk = null;
    }
  };
  saat.denetle();
  return saat;
}

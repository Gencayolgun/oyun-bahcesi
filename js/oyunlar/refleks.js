/* REFLEKS — tepki hızı ve dürtü denetimi (git / gitme).
   Yapı: nesneler tek tek ve kısa süre görünür. Çocuk ARANANA dokunmalı,
   ötekine DOKUNMAMALI. Asıl beceri dokunmak değil, dokunmamayı bilmek —
   anaokulunda dürtü denetiminin temel alıştırması.

   CEZA YOK: yanlış dokunuş açıklama verir, kaçan tekrar gelir. */
export default {
  kod: 'refleks', ad: 'Refleks', ozet: 'Doğru olana dokun, ötekine dokunma.',
  ikon: 'yildiz', renk: '#E0965C', bolge: 'deniz', beceri: 'Tepki hızı · dürtü denetimi',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Olgun olanı topla.', yonerge: 'Yalnızca elmaya dokun. Başka bir şey gelirse elini çek.',
      cozum: 'Yalnızca olgunları topladın; sepet tertemiz.',
      hedef: 6, gorunme: 1400, ara: 420, aranan: { sekil: 'elma', ad: 'Elma' },
      digerleri: [{ sekil: 'yaprak', ad: 'Yaprak' }, { sekil: 'tas', ad: 'Taş' }] },
    { ad: 'Orta', baslik: 'Daha çabuk geçiyorlar.', yonerge: 'Süre kısaldı. Görür görmez karar ver.',
      cozum: 'Hızlandılar ama sen daha hızlıydın.',
      hedef: 8, gorunme: 1000, ara: 320, aranan: { sekil: 'tohum', ad: 'Buğday' },
      digerleri: [{ sekil: 'kozalak', ad: 'Kozalak' }, { sekil: 'tas', ad: 'Taş' }, { sekil: 'yaprak', ad: 'Yaprak' }] },
    { ad: 'Zor', baslik: 'Benzeyenler karışıyor.', yonerge: 'Bu sefer birbirine benziyorlar. İyi bak, sonra dokun.',
      cozum: 'Benzeyenleri bile ayırdın.',
      hedef: 10, gorunme: 820, ara: 260, aranan: { sekil: 'palamut', ad: 'Palamut' },
      digerleri: [{ sekil: 'kozalak', ad: 'Kozalak' }, { sekil: 'tohum', ad: 'Buğday' }, { sekil: 'tas', ad: 'Taş' }] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const bilgi = yap('div', 'refleks-aranan');
    const ik = yap('span', ''); ik.innerHTML = ctx.ikon(v.aranan.sekil);
    bilgi.append(yap('small', '', 'ARANAN'), ik, yap('strong', '', v.aranan.ad));
    const sahne = yap('div', 'refleks-sahne');
    const dugme = yap('button', 'refleks-nesne'); dugme.type = 'button';
    dugme.setAttribute('aria-live', 'polite');
    sahne.append(dugme);
    const sayac = yap('div', 'oyun-durumu');
    ctx.alan.append(bilgi, sahne, sayac);
    ctx.ipucu(`Yalnızca ${v.aranan.ad.toLocaleLowerCase('tr')} gelince dokun.`);

    let bulunan = 0, simdiki = null, bitti = false, zaman1 = 0, zaman2 = 0;
    const yaz = () => sayac.textContent = `${bulunan} / ${v.hedef} doğru dokunuş`;
    yaz();
    const bekle = (fn, ms) => { const t = setTimeout(() => { if (!ctx.signal.aborted && !bitti) fn(); }, ms); ctx.signal.addEventListener('abort', () => clearTimeout(t)); return t; };

    function goster() {
      if (bitti) return;
      // Aranan yaklaşık yarı yarıya gelsin ki beklemek de karar olsun
      const aranan = Math.random() < .5;
      simdiki = aranan ? { ...v.aranan, dogru: true }
                       : { ...v.digerleri[Math.floor(Math.random() * v.digerleri.length)], dogru: false };
      dugme.innerHTML = ctx.ikon(simdiki.sekil);
      dugme.setAttribute('aria-label', simdiki.ad);
      dugme.className = 'refleks-nesne gorundu';
      zaman1 = bekle(sakla, v.gorunme);
    }
    function sakla() {
      dugme.className = 'refleks-nesne';
      dugme.innerHTML = ''; dugme.removeAttribute('aria-label');
      const kacan = simdiki?.dogru;
      simdiki = null;
      if (kacan) ctx.ipucu('Bu kaçtı — merak etme, yenisi gelecek.');
      zaman2 = bekle(goster, v.ara);
    }
    dugme.addEventListener('click', () => {
      if (bitti || !simdiki) return;
      if (!simdiki.dogru) {
        ctx.titret(dugme);
        ctx.ipucu(`O ${simdiki.ad.toLocaleLowerCase('tr')}. Yalnızca ${v.aranan.ad.toLocaleLowerCase('tr')} bekliyoruz.`);
        return;
      }
      clearTimeout(zaman1);
      dugme.classList.add('tuttu');
      bulunan++; ctx.adim(); yaz();
      simdiki = null;
      if (bulunan >= v.hedef) { bitti = true; clearTimeout(zaman2); ctx.basar(); return; }
      bekle(sakla, 220);
    }, { signal: ctx.signal });
    bekle(goster, 700);
  }
};

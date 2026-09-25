/* NE KAYBOLDU — görsel bellek.
   Yapı: iki fazlı. Önce bak, sonra örtül, sonra hatırla.
   Saat yok: örtme anını çocuk kendi seçiyor. */
export default {
  kod: 'kayip', ad: 'Ne Kayboldu?', ozet: 'Bak, gözünü kapa, eksileni bul.',
  ikon: 'kutu', renk: '#C98A4E', bolge: 'ciftlik', beceri: 'Görsel bellek',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Sepetten bir şey eksiliyor.', yonerge: 'Sepete iyi bakalım. Gözümüzü kapayıp açınca ne eksildi, bulalım mı?',
      cozum: 'Sepet yeniden tamam; hiçbir şey kaybolmadı.', tur: 2,
      ogeler: [{ ad: 'Yumurta', sekil: 'yumurta' }, { ad: 'Elma', sekil: 'elma' }, { ad: 'Ot', sekil: 'ot' }, { ad: 'Saman', sekil: 'saman' }] },
    { ad: 'Orta', baslik: 'Rafta bir şey yerinde yok.', yonerge: 'Beş şeye birden bakmak zor. Yine de deneyelim mi?',
      cozum: 'Raf yeniden düzenli; her şey yerli yerinde.', tur: 2,
      ogeler: [{ ad: 'Şişe', sekil: 'sise' }, { ad: 'Elma', sekil: 'elma' }, { ad: 'Yumurta', sekil: 'yumurta' }, { ad: 'Fırça', sekil: 'firca' }, { ad: 'Kozalak', sekil: 'kozalak' }] },
    { ad: 'Zor', baslik: 'Altı şey, keskin bir göz gerek.', yonerge: 'Bu sefer altı tane var. Hepsini akılda tutabilir miyiz?',
      cozum: 'Altısını da hatırladın; hafızan çok güçlü.', tur: 3,
      ogeler: [{ ad: 'Kabuk', sekil: 'kabuk' }, { ad: 'Yıldız', sekil: 'yildiz' }, { ad: 'Taş', sekil: 'tas' }, { ad: 'Yaprak', sekil: 'yaprak' }, { ad: 'Palamut', sekil: 'palamut' }, { ad: 'Kozalak', sekil: 'kozalak' }] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const sayac = yap('div', 'tur-basligi');
    const raf = yap('div', 'nesneler kayip-raf');
    const alt = yap('div', 'kayip-alt');
    ctx.alan.append(sayac, raf, alt);
    let tur = 0;
    function ciz() {
      sayac.textContent = `${tur + 1}. bilmece · ${v.tur} bilmeceden`;
      raf.replaceChildren(); alt.replaceChildren();
      ctx.ipucu('Hepsine iyi bakalım. Hazır olunca düğmeye basalım.');
      const kartlar = v.ogeler.map(o => { const k = ctx.kart(o.sekil, o.ad); k.disabled = true; raf.append(k); return k; });
      const hazir = yap('button', 'btn secondary kayip-dugme'); hazir.type = 'button';
      hazir.append(yap('span', '', 'Gözlerimizi kapatalım'));
      alt.append(hazir);
      hazir.addEventListener('click', () => {
        hazir.remove();
        kartlar.forEach(k => k.classList.add('ortulu'));
        ctx.ipucu('Gözler kapalı…');
        ctx.bekle(() => {
          const kayip = Math.floor(Math.random() * v.ogeler.length);
          kartlar.forEach((k, i) => { k.classList.remove('ortulu'); if (i === kayip) k.classList.add('kayboldu'); });
          ctx.ipucu('Gözler açık! Hangisi kayboldu?');
          const secim = yap('div', 'nesneler kayip-secenek');
          ctx.karistir(v.ogeler).forEach(o => {
            const b = ctx.kart(o.sekil, o.ad);
            b.addEventListener('click', () => {
              if (b.disabled) return;
              if (o.sekil !== v.ogeler[kayip].sekil) { ctx.titret(b); ctx.ipucu('O hâlâ rafta duruyor. Bir daha bakalım.'); return; }
              Array.from(secim.children).forEach(k => k.disabled = true);
              b.classList.add('bulundu');
              kartlar[kayip].classList.remove('kayboldu');
              kartlar[kayip].classList.add('geri-geldi');
              ctx.adim(); ctx.ipucu(`Evet! ${o.ad} kaybolmuştu.`);
              tur++;
              ctx.bekle(() => { if (tur < v.tur) ciz(); else ctx.basar(); }, 1050);
            }, { signal: ctx.signal });
            secim.append(b);
          });
          alt.append(secim);
        }, 1150);
      }, { signal: ctx.signal });
    }
    ciz();
  }
};

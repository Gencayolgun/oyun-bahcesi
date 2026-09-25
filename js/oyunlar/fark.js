/* FARKI BUL — sınıflandırma.
   Yapı: tek karar. Her turda sahne tamamen yenilenir; toplama yok. */
export default {
  kod: 'fark', ad: 'Farkı Bul', ozet: 'Hangisi diğerlerine benzemiyor?',
  ikon: 'yildiz', renk: '#E0965C', bolge: 'deniz', beceri: 'Sınıflandırma · akıl yürütme',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Dört şeyden biri farklı.', yonerge: 'Her turda bir tanesi diğerlerine benzemiyor. Onu birlikte bulalım.',
      cozum: 'Üç bilmeceyi de çözdün.',
      turlar: [
        { soru: 'Hangisi denizde yaşamaz?', digerleri: [{ ad: 'Balık', sekil: 'balik' }, { ad: 'Yengeç', sekil: 'yengec' }, { ad: 'Ahtapot', sekil: 'ahtapot' }], yabanci: { ad: 'Sincap', sekil: 'sincap' }, neden: 'Sincap ormanda yaşar, denizde değil.' },
        { soru: 'Hangisi yiyecek değil?', digerleri: [{ ad: 'Elma', sekil: 'elma' }, { ad: 'Ot', sekil: 'ot' }, { ad: 'Yumurta', sekil: 'yumurta' }], yabanci: { ad: 'Taş', sekil: 'tas' }, neden: 'Taş yenmez; diğer üçü yiyecek.' },
        { soru: 'Hangisi ağaçta bulunmaz?', digerleri: [{ ad: 'Yaprak', sekil: 'yaprak' }, { ad: 'Kozalak', sekil: 'kozalak' }, { ad: 'Palamut', sekil: 'palamut' }], yabanci: { ad: 'Kabuk', sekil: 'kabuk' }, neden: 'Deniz kabuğu kıyıda bulunur, ağaçta değil.' }
      ] },
    { ad: 'Orta', baslik: 'Beş şeyden biri farklı.', yonerge: 'Bu sefer beş tane var. Hepsine tek tek bakalım.',
      cozum: 'Beşli bilmecelerin üçünü de çözdün.',
      turlar: [
        { soru: 'Hangisi doğada kendiliğinden bulunmaz?', digerleri: [{ ad: 'Yaprak', sekil: 'yaprak' }, { ad: 'Kozalak', sekil: 'kozalak' }, { ad: 'Kabuk', sekil: 'kabuk' }, { ad: 'Taş', sekil: 'tas' }], yabanci: { ad: 'Şişe', sekil: 'sise' }, neden: 'Şişeyi insanlar yapar; onu toplayıp geri dönüşüme vermeliyiz.' },
        { soru: 'Hangisi uçamaz?', digerleri: [{ ad: 'Kuş', sekil: 'kus' }, { ad: 'Baykuş', sekil: 'baykus' }, { ad: 'Kartal', sekil: 'kartal' }, { ad: 'Bulut', sekil: 'bulut' }], yabanci: { ad: 'Kaplumbağa', sekil: 'kaplumbaga' }, neden: 'Kaplumbağa ağır ağır yürür; uçamaz.' },
        { soru: 'Hangisi çiftlikte yaşamaz?', digerleri: [{ ad: 'İnek', sekil: 'inek' }, { ad: 'Koyun', sekil: 'koyun' }, { ad: 'Tavuk', sekil: 'tavuk' }, { ad: 'Tavşan', sekil: 'tavsan' }], yabanci: { ad: 'Ahtapot', sekil: 'ahtapot' }, neden: 'Ahtapot denizde yaşar, çiftlikte değil.' }
      ] },
    { ad: 'Zor', baslik: 'Altı şey, ince bir fark.', yonerge: 'Fark bu sefer daha ince. Soruyu iyi okuyalım.',
      cozum: 'En zor bilmeceleri de çözdün.',
      turlar: [
        { soru: 'Hangisi su değildir?', digerleri: [{ ad: 'Damla', sekil: 'su' }, { ad: 'Bulut', sekil: 'bulut' }, { ad: 'Deniz kabuğu', sekil: 'kabuk' }, { ad: 'Balık', sekil: 'balik' }, { ad: 'Fok', sekil: 'fok' }], yabanci: { ad: 'Işık', sekil: 'isik' }, neden: 'Işık güneşten gelir; suyla ilgisi yok.' },
        { soru: 'Hangisi tohumdan büyümez?', digerleri: [{ ad: 'Filiz', sekil: 'filiz' }, { ad: 'Ağaç', sekil: 'agac' }, { ad: 'Fidan', sekil: 'fidan' }, { ad: 'Ot', sekil: 'ot' }, { ad: 'Yaprak', sekil: 'yaprak' }], yabanci: { ad: 'Taş', sekil: 'tas' }, neden: 'Taş canlı değildir; büyümez.' },
        { soru: 'Hangisi bir yuva değil?', digerleri: [{ ad: 'Kuş yuvası', sekil: 'yuva' }, { ad: 'Ağaç kovuğu', sekil: 'kovuk' }, { ad: 'Tavşan ini', sekil: 'in' }, { ad: 'Deniz kabuğu', sekil: 'kabuk' }, { ad: 'Kutu', sekil: 'kutu' }], yabanci: { ad: 'Şemsiye', sekil: 'semsiye' }, neden: 'Şemsiye yağmurdan korur ama kimse içinde yaşamaz.' }
      ] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const sayac = yap('div', 'tur-basligi');
    const sahne = yap('div', 'nesneler fark-sirasi');
    ctx.alan.append(sayac, sahne);
    let tur = 0;
    function ciz() {
      const t = v.turlar[tur];
      sayac.textContent = `${tur + 1}. bilmece · ${v.turlar.length} bilmeceden`;
      sahne.replaceChildren();
      ctx.ipucu(t.soru);
      ctx.karistir(t.digerleri.map(o => ({ ...o, yabanci: false })).concat([{ ...t.yabanci, yabanci: true }])).forEach(o => {
        const b = ctx.kart(o.sekil, o.ad);
        b.addEventListener('click', () => {
          if (b.disabled) return;
          if (!o.yabanci) { ctx.titret(b); ctx.ipucu('Bu diğerlerine benziyor. Birlikte bir daha bakalım.'); return; }
          Array.from(sahne.children).forEach(k => { k.disabled = true; if (k !== b) k.classList.add('solgun'); });
          b.classList.add('bulundu'); ctx.adim(); ctx.ipucu(t.neden);
          tur++;
          ctx.bekle(() => { if (tur < v.turlar.length) ciz(); else ctx.basar(); }, 1200);
        }, { signal: ctx.signal });
        sahne.append(b);
      });
    }
    ciz();
  }
};

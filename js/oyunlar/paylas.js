/* EŞİT PAYLAŞTIR — erken bölme.
   Yapı: geri alınabilir durum. Kazanç koşulu sıra değil, EŞİTLİK.
   Çocuk istediği kadar taşır, geri alır; oyun ancak herkes eşit olunca biter. */
export default {
  kod: 'paylas', ad: 'Eşit Paylaştır', ozet: 'Yemi dostlara eşit böl.',
  ikon: 'elma', renk: '#E29A4E', bolge: 'ciftlik', beceri: 'Eşit bölme · erken matematik',
  seviyeler: [
    { ad: 'Kolay', baslik: 'İki dost aynı yemliğe üşüşmüş.', yonerge: 'Yemi ikisine eşit paylaştıralım mı? Kimse aç kalmasın.',
      cozum: 'İkisi de eşit pay aldı; yemlikte kavga kalmadı.',
      dostlar: [{ sekil: 'inek', ad: 'Boncuk' }, { sekil: 'koyun', ad: 'Yumak' }], yem: 'ot', yemAd: 'Ot demeti', adet: 6 },
    { ad: 'Orta', baslik: 'Üç dost sofraya oturdu.', yonerge: 'Elmaları üç dostumuza eşit dağıtalım. Fazla gelirse geri alırız.',
      cozum: 'Üçü de eşit pay aldı; sofrada herkes mutlu.',
      dostlar: [{ sekil: 'inek', ad: 'Boncuk' }, { sekil: 'koyun', ad: 'Yumak' }, { sekil: 'tavuk', ad: 'Fındık' }], yem: 'elma', yemAd: 'Elma', adet: 9 },
    { ad: 'Zor', baslik: 'Dört dost, bir sepet dolusu yem.', yonerge: 'Dördüne de eşit düşsün. Acele yok, deneye deneye bulalım.',
      cozum: 'Dördü de eşit pay aldı; sepet adaletle boşaldı.',
      dostlar: [{ sekil: 'inek', ad: 'Boncuk' }, { sekil: 'koyun', ad: 'Yumak' }, { sekil: 'tavuk', ad: 'Fındık' }, { sekil: 'tavsan', ad: 'Pamuk' }], yem: 'ot', yemAd: 'Ot demeti', adet: 12 }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap, pay = v.adet / v.dostlar.length;
    ctx.ipucu('Bir yem seç, sonra bir dostun tabağına dokun. Geri de alabilirsin.');
    const tabaklar = yap('div', 'paylas-tabaklar');
    tabaklar.style.gridTemplateColumns = `repeat(${v.dostlar.length},1fr)`;
    const havuz = yap('div', 'paylas-havuz');
    const durum = yap('div', 'oyun-durumu');
    let secili = null, bitti = false;
    const yer = v.dostlar.map(d => {
      const t = yap('button', 'hedef-karti paylas-tabak'); t.type = 'button';
      t.setAttribute('aria-label', `${d.ad} için tabak`);
      const r = yap('span', 'hedef-resmi'); r.innerHTML = ctx.ikon(d.sekil);
      const kutu = yap('span', 'paylas-yigin'), sayi = yap('span', 'paylas-sayi', '0');
      t.append(r, yap('span', 'hedef-adi', d.ad), kutu, sayi);
      tabaklar.append(t);
      return { el: t, kutu, sayi, liste: [] };
    });
    function guncelle() {
      yer.forEach(y => y.sayi.textContent = String(y.liste.length));
      const kalan = havuz.querySelectorAll('.paylas-yem').length;
      const s = yer.map(y => y.liste.length);
      if (!bitti && kalan === 0 && s.every(n => n === s[0])) {
        bitti = true;
        durum.className = 'oyun-durumu basarili-durum';
        durum.textContent = `Her tabakta ${pay} tane — tam eşit!`;
        yer.forEach(y => y.el.disabled = true);
        ctx.basar();
        return;
      }
      if (bitti) return;
      durum.className = 'oyun-durumu';
      durum.textContent = kalan ? `Dağıtılacak ${kalan} tane kaldı · şu an ${s.join(' · ')}`
                                : `Şu an ${s.join(' · ')} — henüz eşit değil, biraz taşıyalım.`;
    }
    function koy(yem, i) {
      if (bitti) return;
      yem.classList.remove('secili'); secili = null;
      yer.forEach(y => { y.liste = y.liste.filter(x => x !== yem); });
      yem.classList.add('tabakta');
      yer[i].kutu.append(yem); yer[i].liste.push(yem);
      ctx.adim(); guncelle();
    }
    for (let i = 0; i < v.adet; i++) {
      const b = ctx.kart(v.yem, null, 'paylas-yem');
      b.setAttribute('aria-label', v.yemAd);
      b.addEventListener('click', () => {
        if (bitti) return;
        if (b.classList.contains('tabakta')) {
          yer.forEach(y => { y.liste = y.liste.filter(x => x !== b); });
          b.classList.remove('tabakta', 'secili');
          if (secili === b) secili = null;
          havuz.append(b); ctx.ipucu('Geri aldık. Başka bir tabağa koyabilirsin.'); guncelle(); return;
        }
        if (secili === b) { secili = null; b.classList.remove('secili'); return; }
        if (secili) secili.classList.remove('secili');
        secili = b; b.classList.add('secili');
        ctx.ipucu('Şimdi bir dostun tabağına dokun.');
      }, { signal: ctx.signal });
      havuz.append(b);
    }
    yer.forEach((y, i) => y.el.addEventListener('click', () => {
      if (secili) koy(secili, i); else ctx.ipucu('Önce aşağıdan bir tane seç.');
    }, { signal: ctx.signal }));
    ctx.alan.append(tabaklar, havuz, durum);
    guncelle();
  }
};

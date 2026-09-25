/* GİZLİ DOSTLAR — görsel tarama.
   Yapı: kart dizisi yok, bir manzara var.

   GİZLEMENİN ŞARTI: benzer biçimlerden oluşan bir kalabalık. Boş zeminde
   duran ikon gizli değildir. O yüzden sahneye onlarca yaprak, ot, taş ve
   kozalak serpiliyor; aranan HAYVANLAR bunların arasında, kimi yan dönmüş,
   kimi çalının arkasında kalıyor.
   Kural çocuğa da net: süsler bitki, aranan şeyler hayvan. */

/* Dağılım her açılışta aynı olsun diye küçük bir üreteç: öğretmen aynı
   sahneyi ikinci kez açtığında çocuklar yerleri hatırlayabilsin. */
function uretec(tohum) {
  let s = tohum;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}
const SUSLER = ['yaprak', 'ot', 'tas', 'kozalak', 'palamut', 'fidan'];

export default {
  kod: 'gizli', ad: 'Gizli Dostlar', ozet: 'Yaprakların arasındaki hayvanları bul.',
  ikon: 'sincap', renk: '#6FA86C', bolge: 'orman', beceri: 'Görsel tarama · dikkat',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Üç hayvan yaprakların arasına saklanmış.', yonerge: 'Süslerin hepsi bitki. Aradığımız şeyler hayvan — üçünü de bulalım mı?',
      cozum: 'Üçünü de buldun; orman yeniden şenlendi.', tohum: 7, sus: 20, susBoy: [5, 9], boy: 13,
      gizli: [{ sekil: 'sincap', ad: 'Sincap', x: 20, y: 62, a: -9 },
              { sekil: 'baykus', ad: 'Baykuş', x: 74, y: 30, a: 7 },
              { sekil: 'kaplumbaga', ad: 'Kaplumbağa', x: 49, y: 76, a: 12 }] },
    { ad: 'Orta', baslik: 'Dört hayvan, daha kalabalık bir orman.', yonerge: 'Yapraklar çoğaldı ve hayvanlar küçüldü. Köşelere de bakalım.',
      cozum: 'Dördünü de buldun; hiçbiri gözünden kaçmadı.', tohum: 23, sus: 34, susBoy: [4, 8], boy: 10,
      gizli: [{ sekil: 'sincap', ad: 'Sincap', x: 14, y: 34, a: -13 },
              { sekil: 'baykus', ad: 'Baykuş', x: 83, y: 22, a: 9 },
              { sekil: 'kaplumbaga', ad: 'Kaplumbağa', x: 41, y: 80, a: 18 },
              { sekil: 'kus', ad: 'Kuş', x: 63, y: 57, a: -15 }] },
    { ad: 'Zor', baslik: 'Beş hayvan, sık bir orman.', yonerge: 'Bu sefer çok kalabalık. Acele etmeyelim, bölüm bölüm tarayalım.',
      cozum: 'Beşini de buldun; ormanın en keskin gözü sensin.', tohum: 91, sus: 48, susBoy: [3, 7], boy: 8,
      gizli: [{ sekil: 'sincap', ad: 'Sincap', x: 11, y: 28, a: -16 },
              { sekil: 'baykus', ad: 'Baykuş', x: 87, y: 18, a: 11 },
              { sekil: 'kaplumbaga', ad: 'Kaplumbağa', x: 37, y: 83, a: 22 },
              { sekil: 'kus', ad: 'Kuş', x: 67, y: 64, a: -19 },
              { sekil: 'tavsan', ad: 'Tavşan', x: 54, y: 24, a: 14 }] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap, rnd = uretec(v.tohum);
    /* Paket süsleri ve ipucunu kendisi verebilir (v.susler, v.ipucu). Aranan
       şekil süslerin arasında da varsa ayırt edilemezdi: süslerden çıkarılır. */
    const SUS = (v.susler?.length ? v.susler : SUSLER).filter(s => !v.gizli.some(g => g.sekil === s));
    const susSec = () => SUS.length ? SUS[Math.floor(rnd() * SUS.length)] : 'yaprak';
    ctx.ipucu(v.ipucu || 'Aradıklarımız aşağıda yazıyor. Bulduğunu işaretleyeceğiz.');
    const sahne = yap('div', 'gizli-sahne');

    // Arka çalılar: zemine derinlik verir, kimi hayvanın bir kenarını örter.
    for (let i = 0; i < 7; i++) {
      const c = yap('i', 'gizli-cali');
      c.style.cssText = `left:${(rnd() * 96 - 6).toFixed(1)}%;top:${(rnd() * 88 - 6).toFixed(1)}%;` +
        `width:${(16 + rnd() * 22).toFixed(1)}%;height:${(26 + rnd() * 26).toFixed(1)}%;` +
        `transform:rotate(${(rnd() * 26 - 13).toFixed(1)}deg);opacity:${(.32 + rnd() * .22).toFixed(2)}`;
      sahne.append(c);
    }
    // Süs kalabalığı: hepsi bitki ve taş, hiçbiri tıklanabilir değil.
    for (let i = 0; i < v.sus; i++) {
      const s = yap('i', 'gizli-sus');
      s.innerHTML = ctx.ikon(susSec());
      const b = v.susBoy[0] + rnd() * (v.susBoy[1] - v.susBoy[0]);
      s.style.cssText = `left:${(rnd() * 94 + 3).toFixed(1)}%;top:${(rnd() * 88 + 6).toFixed(1)}%;` +
        `width:${b.toFixed(1)}%;transform:translate(-50%,-50%) rotate(${(rnd() * 180 - 90).toFixed(1)}deg);` +
        `opacity:${(.55 + rnd() * .35).toFixed(2)}`;
      sahne.append(s);
    }

    const liste = yap('div', 'gizli-liste'), rozet = {};
    v.gizli.forEach(g => {
      const r = yap('span', 'gizli-rozet');
      const i = yap('span', ''); i.innerHTML = ctx.ikon(g.sekil);
      r.append(i, yap('small', '', g.ad)); liste.append(r); rozet[g.ad] = r;
    });

    let bulunan = 0;
    v.gizli.forEach(g => {
      const b = yap('button', 'gizli-hedef'); b.type = 'button';
      b.setAttribute('aria-label', g.ad);
      b.style.cssText = `left:${g.x}%;top:${g.y}%;width:${v.boy}%;transform:translate(-50%,-50%) rotate(${g.a || 0}deg)`;
      b.innerHTML = ctx.ikon(g.sekil);
      b.addEventListener('click', () => {
        if (b.disabled) return;
        b.disabled = true; b.classList.add('bulundu');
        rozet[g.ad].classList.add('bulundu');
        bulunan++; ctx.adim();
        if (bulunan < v.gizli.length) ctx.ipucu(`${g.ad} bulundu! ${v.gizli.length - bulunan} tane kaldı.`);
        else ctx.basar();
      }, { signal: ctx.signal });
      sahne.append(b);
    });
    // Birkaç süs hayvanların üstüne düşsün: kenarları örtülünce gerçekten aranır.
    for (let i = 0; i < Math.round(v.sus / 3); i++) {
      const s = yap('i', 'gizli-sus gizli-on');
      s.innerHTML = ctx.ikon(susSec());
      const b = v.susBoy[0] + rnd() * (v.susBoy[1] - v.susBoy[0]);
      s.style.cssText = `left:${(rnd() * 94 + 3).toFixed(1)}%;top:${(rnd() * 88 + 6).toFixed(1)}%;` +
        `width:${b.toFixed(1)}%;transform:translate(-50%,-50%) rotate(${(rnd() * 180 - 90).toFixed(1)}deg);` +
        `opacity:${(.6 + rnd() * .3).toFixed(2)}`;
      sahne.append(s);
    }
    ctx.alan.append(sahne, liste);
  }
};

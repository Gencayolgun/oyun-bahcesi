/* ÖRÜNTÜ — örüntü mantığı.
   Yapı: şerit soldan sağa okunur. Sayaç değil, dizinin kendisi yol gösterir. */
export default {
  kod: 'oruntu', ad: 'Örüntü', ozet: 'Şeridi oku, boşluğu tamamla.',
  ikon: 'yaprak', renk: '#7FA86B', bolge: 'orman', beceri: 'Örüntü · mantık',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Şeritte bir boşluk var.', yonerge: 'Baştan okuyalım: yaprak, kozalak, yaprak… sonra hangisi geliyor?',
      cozum: 'Örüntü tamamlandı; şerit yeniden düzene girdi.',
      dizi: ['yaprak', 'kozalak', 'yaprak', 'kozalak', null], cevaplar: ['yaprak'],
      secenekler: [{ sekil: 'yaprak', ad: 'Yaprak' }, { sekil: 'kozalak', ad: 'Kozalak' }, { sekil: 'palamut', ad: 'Palamut' }] },
    { ad: 'Orta', baslik: 'Bu sefer iki boşluk var.', yonerge: 'Örüntüyü birlikte söyleyelim, sonra boşlukları sırayla dolduralım.',
      cozum: 'İki boşluk da doğru doldu; örüntü kusursuz.',
      dizi: ['yaprak', 'yaprak', 'kozalak', 'yaprak', 'yaprak', null, null, 'yaprak'], cevaplar: ['kozalak', 'yaprak'],
      secenekler: [{ sekil: 'yaprak', ad: 'Yaprak' }, { sekil: 'kozalak', ad: 'Kozalak' }, { sekil: 'palamut', ad: 'Palamut' }] },
    { ad: 'Zor', baslik: 'Üç şeyli bir örüntü.', yonerge: 'Üçlü örüntü daha zor. Parmağınla baştan takip edelim.',
      cozum: 'Üçlü örüntüyü çözdün; bu gerçekten zordu.',
      dizi: ['yaprak', 'kozalak', 'palamut', 'yaprak', 'kozalak', null, 'yaprak', null, 'palamut'], cevaplar: ['palamut', 'kozalak'],
      secenekler: [{ sekil: 'yaprak', ad: 'Yaprak' }, { sekil: 'kozalak', ad: 'Kozalak' }, { sekil: 'palamut', ad: 'Palamut' }] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    ctx.ipucu('Şeridi baştan okuyalım. Boşluğa hangisi gelmeli?');
    const serit = yap('div', 'oruntu-serit');
    const yuva = v.dizi.map((k, i) => {
      const h = yap('div', 'oruntu-kare' + (k === null ? ' bos' : ''));
      if (k === null) h.append(yap('span', 'oruntu-soru', '?')); else h.innerHTML = ctx.ikon(k);
      serit.append(h);
      if (i < v.dizi.length - 1) serit.append(yap('i', 'oruntu-ok'));
      return h;
    });
    const bos = v.dizi.map((k, i) => k === null ? i : -1).filter(i => i >= 0);
    const secenekler = yap('div', 'nesneler oruntu-secenekler');
    let sira = 0;
    ctx.karistir(v.secenekler).forEach(o => {
      const b = ctx.kart(o.sekil, o.ad);
      b.addEventListener('click', () => {
        if (sira >= bos.length) return;
        if (o.sekil !== v.cevaplar[sira]) { ctx.titret(b); ctx.ipucu('Örüntüyü baştan söyleyelim: sonra hangisi geliyor?'); return; }
        const h = yuva[bos[sira]];
        h.classList.remove('bos'); h.classList.add('doldu'); h.innerHTML = ctx.ikon(o.sekil);
        sira++; ctx.adim();
        if (sira < bos.length) ctx.ipucu('Güzel! Bir boşluk daha var.'); else ctx.basar();
      }, { signal: ctx.signal });
      secenekler.append(b);
    });
    ctx.alan.append(serit, secenekler);
  }
};

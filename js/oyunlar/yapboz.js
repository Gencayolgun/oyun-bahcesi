/* YAPBOZ — uzamsal kurma.
   Yapı: sıra yok. Parçalar istenen sırayla konur; resim gözle tamamlanır. */
export default {
  kod: 'yapboz', ad: 'Yapboz', ozet: 'Parçaları yerine koy, resmi tamamla.',
  ikon: 'kabuk', renk: '#5EA8B2', bolge: 'deniz', beceri: 'Uzamsal düşünme',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Dört parçalık bir deniz kabuğu.', yonerge: 'Parçaya dokun, sonra resimde ait olduğu boş yere dokun.',
      cozum: 'Kabuk yeniden bütün oldu.', resim: 'kabuk', satir: 2, sutun: 2 },
    { ad: 'Orta', baslik: 'Altı parçalık bir yengeç.', yonerge: 'Altı parça biraz daha zor. Kenarlardan başlamayı deneyebilirsin.',
      cozum: 'Yengeç yeniden bir araya geldi.', resim: 'yengec', satir: 2, sutun: 3 },
    { ad: 'Zor', baslik: 'Dokuz parçalık bir ahtapot.', yonerge: 'Dokuz parça gerçek bir yapboz. Renklere ve çizgilere bakalım.',
      cozum: 'Dokuz parçayı da yerleştirdin; ahtapot yeniden tamam.', resim: 'ahtapot', satir: 3, sutun: 3 }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap, adet = v.satir * v.sutun;
    ctx.ipucu('Parçaya dokun, sonra resimde ait olduğu boş yere dokun.');
    const cerceve = yap('div', 'yapboz-cerceve');
    cerceve.style.gridTemplateColumns = `repeat(${v.sutun},1fr)`;
    cerceve.style.aspectRatio = `${v.sutun}/${v.satir}`;
    const havuz = yap('div', 'yapboz-havuz');
    function gorsel(i) {
      const satir = Math.floor(i / v.sutun), sutun = i % v.sutun;
      const kap = yap('span', 'yapboz-kare'), ic = yap('span', 'yapboz-resim');
      ic.innerHTML = ctx.ikon(v.resim);
      ic.style.width = (v.sutun * 100) + '%'; ic.style.height = (v.satir * 100) + '%';
      ic.style.left = (-sutun * 100) + '%'; ic.style.top = (-satir * 100) + '%';
      kap.append(ic); return kap;
    }
    let secili = null, yerlesen = 0;
    const yuva = [];
    for (let i = 0; i < adet; i++) {
      const h = yap('button', 'hedef-karti yapboz-yuva'); h.type = 'button';
      h.setAttribute('aria-label', `${i + 1}. yapboz yeri`);
      h.addEventListener('click', () => {
        if (!secili) { ctx.ipucu('Önce aşağıdan bir parça seç.'); return; }
        if (Number(secili.dataset.parca) !== i) { ctx.ipucu('Bu parça başka bir yere ait. Resmi düşünelim.'); ctx.titret(secili); return; }
        h.replaceChildren(gorsel(i)); h.classList.add('oturdu'); h.disabled = true;
        secili.classList.add('yerlesti'); secili.disabled = true;
        secili.classList.remove('secili'); secili = null;
        yerlesen++; ctx.adim();
        if (yerlesen === adet) ctx.basar(); else ctx.ipucu('Güzel! Sıradaki parçaya geçelim.');
      }, { signal: ctx.signal });
      cerceve.append(h); yuva.push(h);
    }
    ctx.karistir([...Array(adet).keys()]).forEach(i => {
      const b = yap('button', 'nesne-karti yapboz-parca'); b.type = 'button';
      b.dataset.parca = String(i); b.setAttribute('aria-label', `${i + 1}. parça`);
      b.append(gorsel(i));
      b.addEventListener('click', () => {
        if (b.disabled) return;
        if (secili) secili.classList.remove('secili');
        secili = b; b.classList.add('secili');
        ctx.ipucu('Şimdi resimde ait olduğu boş yere dokun.');
      }, { signal: ctx.signal });
      havuz.append(b);
    });
    ctx.alan.append(cerceve, havuz);
  }
};

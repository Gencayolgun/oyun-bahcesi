/* TAM ZAMANINDA — zamanlama.
   Yapı: sürekli hareket, tek dokunuş. Saat yok, puan yok, sınırsız deneme. */
export default {
  kod: 'zaman', ad: 'Tam Zamanında', ozet: 'Tohumu tam toprağın üstünde bırak.',
  ikon: 'tohum', renk: '#D5A64F', bolge: 'dag', beceri: 'Zamanlama · odaklanma',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Işık tohumu taşıyor.', yonerge: 'Tam toprağın üstündeyken düğmeye bas. Acelemiz yok, istediğin kadar dene.',
      cozum: 'Üç tohum da toprağa düştü; zirvede yeni filizler var.', genislik: 34, hiz: .95, hedefSayisi: 3 },
    { ad: 'Orta', baslik: 'Toprak parçası küçüldü.', yonerge: 'Bu sefer alan daha dar. Işık’ı gözünle takip et.',
      cozum: 'Dar alana üç kez isabet ettirdin.', genislik: 24, hiz: 1.25, hedefSayisi: 3 },
    { ad: 'Zor', baslik: 'Rüzgâr hızlandı.', yonerge: 'Işık daha hızlı gidip geliyor ve alan çok dar. Sabırla bekleyelim.',
      cozum: 'Rüzgâra rağmen dördünü de tutturdun.', genislik: 17, hiz: 1.6, hedefSayisi: 4 }
  ],
  /* Hikâye paketi taşıyıcıyı, düşeni ve hedefi kendisi verebilir:
       tasiyici/tasiyiciAd, yuk (ya da dusen), hedef (ya da bolgeIkon)/hedefAd,
       sayac (sayaç yazısı). Eskiden bunlar okunmuyordu: her masalda kuş, tohum
       ve "Verimli toprak" çiziliyordu. Verilmezse eski görünüm aynen kalır. */
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const tasiyiciIkon = v.tasiyici || 'kus', yukIkon = v.yuk || v.dusen || 'tohum';
    const hedefIkon = v.hedef || v.bolgeIkon || 'toprak', hedefAd = v.hedefAd || 'Verimli toprak';
    const ozel = tasiyiciIkon !== 'kus' || yukIkon !== 'tohum' || hedefIkon !== 'toprak' || !!v.hedefAd;
    ctx.ipucu(ozel ? `${v.tasiyiciAd || 'Taşıyıcı'} sağa sola gidiyor. ${hedefAd} hizasına gelince bırak.`
                   : 'Işık sağa sola gidiyor. Tam toprağın üstündeyken bırak.');
    const sahne = yap('div', 'zaman-sahne');
    const bolge = yap('div', 'zaman-bolgesi');
    bolge.innerHTML = ctx.ikon(hedefIkon); bolge.append(yap('span', 'zaman-bolge-ad', hedefAd));
    bolge.style.width = v.genislik + '%';
    const tasiyici = yap('div', 'zaman-tasiyici'); tasiyici.innerHTML = ctx.ikon(tasiyiciIkon);
    if (v.tasiyiciAd) tasiyici.setAttribute('aria-label', v.tasiyiciAd);
    const dusen = yap('div', 'zaman-dusen'); dusen.innerHTML = ctx.ikon(yukIkon);
    const sayac = yap('div', 'oyun-durumu');
    sahne.append(bolge, tasiyici, dusen);
    const dugme = yap('button', 'btn primary zaman-dugme'); dugme.type = 'button';
    dugme.append(yap('span', '', 'Şimdi bırak!'));
    ctx.alan.append(sahne, dugme, sayac);

    let merkez = 50, konum = 50, kilit = false, bulunan = 0, cerceve = 0;
    const t0 = performance.now();
    const yaz = () => sayac.textContent = `${bulunan} / ${v.hedefSayisi} ${v.sayac || (ozel ? 'tam yerinde' : 'tohum toprakta')}`;
    bolge.style.left = merkez + '%'; yaz();
    function dongu(t) {
      if (ctx.signal.aborted) return;
      konum = 50 + 42 * Math.sin((t - t0) / 1000 * v.hiz);
      if (!kilit) tasiyici.style.left = konum + '%';
      cerceve = requestAnimationFrame(dongu);
    }
    cerceve = requestAnimationFrame(dongu);
    ctx.signal.addEventListener('abort', () => cancelAnimationFrame(cerceve));

    dugme.addEventListener('click', () => {
      if (kilit || bulunan >= v.hedefSayisi) return;
      const isabet = Math.abs(konum - merkez) <= v.genislik / 2;
      kilit = true;
      dusen.style.left = konum + '%';
      dusen.classList.add(isabet ? 'dustu-tam' : 'dustu-yana');
      ctx.bekle(() => {
        dusen.classList.remove('dustu-tam', 'dustu-yana');
        kilit = false;
        if (!isabet) { ctx.ipucu('Az kaldı! Acelemiz yok, bir daha deneyelim.'); return; }
        bulunan++; ctx.adim(); yaz(); bolge.classList.add('doldu');
        if (bulunan >= v.hedefSayisi) { ctx.basar(); return; }
        merkez = 30 + Math.random() * 40;
        ctx.bekle(() => { bolge.classList.remove('doldu'); bolge.style.left = merkez + '%';
          ctx.ipucu(ozel ? `Bir tane daha — ${hedefAd} yer değiştirdi.` : 'Bir tane daha — toprak yer değiştirdi.'); }, 340);
      }, 640);
    }, { signal: ctx.signal });
  }
};

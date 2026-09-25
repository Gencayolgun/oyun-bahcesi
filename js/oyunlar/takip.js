/* TAKİP — düzgün izleme (smooth pursuit) ve ince motor denetimi.
   Yapı: parmağını hareket eden bir canlının üstünde TUTMAK. Dokunup
   bırakmak değil, temas etmeyi sürdürmek. Göz ve el birlikte çalışır.

   CEZA YOK: temas kopunca ilerleme durur ama geri gitmez. */
export default {
  kod: 'takip', ad: 'Takip Et', ozet: 'Parmağını üstünde tut, kaçmasın.',
  ikon: 'kus', renk: '#6FA86C', bolge: 'orman', beceri: 'İzleme · ince motor denetimi',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Ateşböceği yolu gösteriyor.', yonerge: 'Parmağını ateşböceğinin üstüne koy ve kaldırmadan takip et.',
      cozum: 'Ateşböceği yolu gösterdi; patika aydınlandı.', sekil: 'isik', sure: 5000, hiz: .55, boy: 17 },
    { ad: 'Orta', baslik: 'Kelebek daha hızlı.', yonerge: 'Bu daha hızlı ve daha küçük. Gözünle önden takip etmeyi dene.',
      cozum: 'Kelebek yorulup omzuna kondu.', sekil: 'yaprak', sure: 6500, hiz: .85, boy: 13 },
    { ad: 'Zor', baslik: 'Kuş dallar arasında uçuyor.', yonerge: 'Ani dönüşler yapıyor. Acelemiz yok — kopsa da kaldığın yerden devam.',
      cozum: 'Kuşu yuvasına kadar takip ettin.', sekil: 'kus', sure: 8000, hiz: 1.15, boy: 11 }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    ctx.ipucu('Parmağını üstüne koy ve kaldırmadan takip et.');
    const sahne = yap('div', 'takip-sahne');
    const canli = yap('div', 'takip-canli'); canli.innerHTML = ctx.ikon(v.sekil);
    canli.style.width = v.boy + '%';
    const halka = yap('div', 'takip-halka'); const yay = yap('i');
    halka.append(yay);
    const sayac = yap('div', 'oyun-durumu');
    sahne.append(canli, halka);
    ctx.alan.append(sahne, sayac);

    let x = 50, y = 50, t0 = 0, birikim = 0, temas = false, kare = 0, bitti = false;
    // İki farklı frekansta salınım: yolu tahmin edilebilir ama ezberlenemez yapar
    const f = [.7 + Math.random() * .4, .5 + Math.random() * .4, .9 + Math.random() * .5, .6 + Math.random() * .4];
    const yaz = () => sayac.textContent = temas
      ? `Takip ediyorsun — ${Math.round(birikim / v.sure * 100)}%`
      : `Parmağını üstüne koy · ${Math.round(birikim / v.sure * 100)}%`;
    yaz();

    const uzerinde = e => {
      const r = canli.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      return Math.hypot(e.clientX - cx, e.clientY - cy) < r.width * .78;
    };
    function kontrol(e) {
      if (bitti) return;
      const yeni = uzerinde(e);
      if (yeni !== temas) { temas = yeni; sahne.classList.toggle('temasta', temas); canli.classList.toggle('yakalandi', temas); }
    }
    sahne.addEventListener('pointerdown', e => { try { sahne.setPointerCapture(e.pointerId); } catch {} kontrol(e); }, { signal: ctx.signal });
    sahne.addEventListener('pointermove', e => { if (e.buttons || e.pointerType !== 'mouse') kontrol(e); else if (temas) { temas = false; sahne.classList.remove('temasta'); canli.classList.remove('yakalandi'); } }, { signal: ctx.signal });
    const birak = () => { if (temas) { temas = false; sahne.classList.remove('temasta'); canli.classList.remove('yakalandi'); ctx.ipucu('Kopardık — kaldığın yerden devam edebilirsin.'); yaz(); } };
    sahne.addEventListener('pointerup', birak, { signal: ctx.signal });
    sahne.addEventListener('pointercancel', birak, { signal: ctx.signal });

    function dongu(ms) {
      if (ctx.signal.aborted || bitti) return;
      if (!t0) t0 = ms;
      const s = (ms - t0) / 1000 * v.hiz;
      x = 50 + Math.sin(s * f[0]) * 34 + Math.sin(s * f[2]) * 8;
      y = 50 + Math.cos(s * f[1]) * 28 + Math.cos(s * f[3]) * 7;
      canli.style.left = x + '%'; canli.style.top = y + '%';
      if (temas) {
        birikim += 16.7;
        yay.style.width = Math.min(100, birikim / v.sure * 100) + '%';
        if (birikim % 500 < 20) { ctx.adim(); yaz(); }
        if (birikim >= v.sure) { bitti = true; cancelAnimationFrame(kare); sayac.className = 'oyun-durumu basarili-durum'; sayac.textContent = 'Takip tamam!'; ctx.basar(); return; }
      }
      kare = requestAnimationFrame(dongu);
    }
    kare = requestAnimationFrame(dongu);
    ctx.signal.addEventListener('abort', () => cancelAnimationFrame(kare));
  }
};

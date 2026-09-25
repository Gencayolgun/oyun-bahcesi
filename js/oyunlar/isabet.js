/* İSABET — hareketli hedefe nişan alma.
   Yapı: hedefler sahnede GEZİNİR, çocuk doğrudan üstlerine dokunur.
   Zamanlamadan farkı: orada tek bir düğmeye doğru anda basılıyordu,
   burada elin gideceği YER de sürekli değişiyor.

   CEZA YOK: ıskalamak bir şey kaybettirmez. */
export default {
  kod: 'isabet', ad: 'İsabet', ozet: 'Gezinen hedeflere dokun.',
  ikon: 'balik', renk: '#4E9AB5', bolge: 'deniz', beceri: 'El-göz isabeti',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Balıklar yavaş süzülüyor.', yonerge: 'Gezinen balıklara dokun. Iskalamak bir şey kaybettirmez.',
      cozum: 'Bütün balıklar sürüye katıldı.', sekil: 'balik', hedef: 5, adet: 3, hiz: .45, boy: 15 },
    { ad: 'Orta', baslik: 'Sürü hızlandı.', yonerge: 'Daha hızlı ve daha küçükler. Gözünle önden takip et.',
      cozum: 'Hızlı sürüyü de topladın.', sekil: 'balik', hedef: 7, adet: 4, hiz: .8, boy: 12 },
    { ad: 'Zor', baslik: 'Akıntı sertleşti.', yonerge: 'Yön değiştiriyorlar. Acelemiz yok, hepsi geri geliyor.',
      cozum: 'Akıntıya rağmen hepsini yakaladın.', sekil: 'balik', hedef: 9, adet: 5, hiz: 1.2, boy: 10 }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    ctx.ipucu('Gezinen hedeflere dokun.');
    const sahne = yap('div', 'isabet-sahne');
    const sayac = yap('div', 'oyun-durumu');
    ctx.alan.append(sahne, sayac);

    let vurulan = 0, kare = 0, bitti = false;
    const yaz = () => sayac.textContent = `${vurulan} / ${v.hedef} isabet`;
    yaz();

    const hedefler = [];
    for (let i = 0; i < v.adet; i++) {
      const b = yap('button', 'isabet-hedef'); b.type = 'button';
      b.style.width = v.boy + '%';
      b.innerHTML = ctx.ikon(v.sekil);
      b.setAttribute('aria-label', 'Hedef');
      const h = { el: b, x: 12 + Math.random() * 76, y: 14 + Math.random() * 72,
                  a: Math.random() * Math.PI * 2, s: v.hiz * (.7 + Math.random() * .6) };
      b.addEventListener('click', () => {
        if (bitti || b.disabled) return;
        b.classList.add('vuruldu'); b.disabled = true;
        vurulan++; ctx.adim(); yaz();
        if (vurulan >= v.hedef) { bitti = true; cancelAnimationFrame(kare); sayac.className = 'oyun-durumu basarili-durum'; ctx.basar(); return; }
        // Vurulan hedef biraz sonra başka bir yerden geri gelir
        ctx.bekle(() => {
          if (bitti) return;
          h.x = 12 + Math.random() * 76; h.y = 14 + Math.random() * 72; h.a = Math.random() * Math.PI * 2;
          b.classList.remove('vuruldu'); b.disabled = false;
        }, 700);
      }, { signal: ctx.signal });
      sahne.append(b); hedefler.push(h);
    }
    function dongu() {
      if (ctx.signal.aborted || bitti) return;
      for (const h of hedefler) {
        h.a += (Math.random() - .5) * .14;                 // yumuşak yön değişimi
        h.x += Math.cos(h.a) * h.s; h.y += Math.sin(h.a) * h.s * .7;
        if (h.x < 8 || h.x > 88) { h.a = Math.PI - h.a; h.x = Math.max(8, Math.min(88, h.x)); }
        if (h.y < 10 || h.y > 84) { h.a = -h.a; h.y = Math.max(10, Math.min(84, h.y)); }
        h.el.style.left = h.x + '%'; h.el.style.top = h.y + '%';
        h.el.style.transform = `translate(-50%,-50%) scaleX(${Math.cos(h.a) < 0 ? -1 : 1})`;
      }
      kare = requestAnimationFrame(dongu);
    }
    kare = requestAnimationFrame(dongu);
    ctx.signal.addEventListener('abort', () => cancelAnimationFrame(kare));
  }
};

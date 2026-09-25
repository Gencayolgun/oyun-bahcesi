/* YAKALA — el-göz koordinasyonu, takip ve öngörü.
   Yapı: SÜREKLİ HAREKET. Sepet parmağı takip eder, nesneler yukarıdan düşer.
   Çocuk hedefi görüp nereye düşeceğini kestirmek ve elini oraya götürmek
   zorunda. "Dokun, sonra hedefe dokun" değil; elin gözle birlikte çalışması.

   CEZA YOK: kaçan tekrar gelir, yanlışı yakalamak yalnızca açıklama verir.
   Saat yok — sayı dolana kadar oynanır. */
export default {
  kod: 'yakala', ad: 'Yakala', ozet: 'Sepeti kaydır, düşenleri tut.',
  ikon: 'kutu', renk: '#E2A34E', bolge: 'ciftlik', beceri: 'El-göz koordinasyonu · öngörü',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Rüzgâr başakları savuruyor.', yonerge: 'Parmağını aşağıda gezdir, sepeti kaydır. Düşen taneleri tut.',
      cozum: 'Bütün taneler sepette; hiçbiri toprağa düşmedi.',
      hedef: 8, hiz: .16, sikayet: 1250, iyi: ['tohum', 'ot'], kotu: [] },
    { ad: 'Orta', baslik: 'Aralarına yaprak karışıyor.', yonerge: 'Yalnızca taneleri tut. Yaprak gelirse sepeti kenara çek.',
      cozum: 'Sepet tane doldu, yapraklar kenarda kaldı.',
      hedef: 10, hiz: .2, sikayet: 980, iyi: ['tohum', 'ot'], kotu: ['yaprak'] },
    { ad: 'Zor', baslik: 'Rüzgâr sertleşti.', yonerge: 'Daha hızlı düşüyorlar ve çöp de var. Acelemiz yok, kaçan geri gelir.',
      cozum: 'Zor rüzgârda bile hepsini topladın.',
      hedef: 12, hiz: .28, sikayet: 760, iyi: ['tohum', 'ot', 'elma'], kotu: ['yaprak', 'sise'] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    ctx.ipucu('Parmağını aşağıda gezdir — sepet seni takip ediyor.');
    const sahne = yap('div', 'yakala-sahne');
    const sepet = yap('div', 'yakala-sepet'); sepet.innerHTML = ctx.ikon('kutu');
    const sayac = yap('div', 'oyun-durumu');
    sahne.append(sepet);
    ctx.alan.append(sahne, sayac);

    let sepetX = 50, tutulan = 0, bitti = false, kare = 0, sonDogus = 0;
    const dusenler = [];
    const yaz = () => sayac.textContent = `${tutulan} / ${v.hedef} tane sepette`;
    yaz();

    const yerelX = e => {
      const r = sahne.getBoundingClientRect();
      return Math.max(6, Math.min(94, (e.clientX - r.left) / r.width * 100));
    };
    function surukle(e) { if (bitti) return; sepetX = yerelX(e); sepet.style.left = sepetX + '%'; }
    /* Sepet parmağı/imleci HER durumda takip eder. Düğme basılı şartı
       koyarsak akıllı tahtada sorun çıkmaz ama fareyle veya dizüstünde
       oynayan sepeti hiç kımıldatamaz. */
    sahne.addEventListener('pointerdown', e => { surukle(e); try { sahne.setPointerCapture(e.pointerId); } catch {} }, { signal: ctx.signal });
    sahne.addEventListener('pointermove', surukle, { signal: ctx.signal });

    function dogur() {
      const kotuMu = v.kotu.length && Math.random() < .3;
      const havuz = kotuMu ? v.kotu : v.iyi;
      const d = yap('i', 'yakala-nesne' + (kotuMu ? ' kotu' : ''));
      d.innerHTML = ctx.ikon(havuz[Math.floor(Math.random() * havuz.length)]);
      const x = 8 + Math.random() * 84;
      d.style.left = x + '%'; d.style.top = '-12%';
      sahne.append(d);
      dusenler.push({ el: d, x, y: -12, kotu: kotuMu });
    }
    function dongu(t) {
      if (ctx.signal.aborted || bitti) return;
      if (t - sonDogus > v.sikayet) { sonDogus = t; dogur(); }
      for (let i = dusenler.length - 1; i >= 0; i--) {
        const n = dusenler[i];
        n.y += v.hiz * 1.6;
        n.el.style.top = n.y + '%';
        // Sepet ağzı: alt %16'da, ±9 genişlik
        if (n.y > 74 && n.y < 92 && Math.abs(n.x - sepetX) < 11) {
          n.el.remove(); dusenler.splice(i, 1);
          if (n.kotu) { ctx.ipucu('O bize lazım değil — sepeti kenara çekebilirsin.'); sepet.classList.add('sasirdi'); ctx.bekle(() => sepet.classList.remove('sasirdi'), 400); }
          else {
            tutulan++; ctx.adim(); yaz();
            sepet.classList.remove('tuttu'); void sepet.offsetWidth; sepet.classList.add('tuttu');
            if (tutulan >= v.hedef) { bitti = true; cancelAnimationFrame(kare); ctx.basar(); return; }
          }
        } else if (n.y > 108) { n.el.remove(); dusenler.splice(i, 1); }
      }
      kare = requestAnimationFrame(dongu);
    }
    kare = requestAnimationFrame(dongu);
    ctx.signal.addEventListener('abort', () => cancelAnimationFrame(kare));
  }
};

/* YOL ÇİZ — planlama ve ince motor.
   Yapı: analog. Tek kesintisiz parmak hareketi; adım yok, sayaç yok.
   Engele değince çizgi kopar ve baştan başlanır — ceza değil, yeni deneme. */
export default {
  kod: 'yol', ad: 'Yol Çiz', ozet: 'Parmağını kaldırmadan yolu bul.',
  ikon: 'tavsan', renk: '#5E9E86', bolge: 'orman', beceri: 'Planlama · ince motor',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Patikada iki diken yığını var.', yonerge: 'Parmağını Pamuk’un üstüne koy ve kaldırmadan yuvaya götür.',
      cozum: 'Yol açıldı; Pamuk yuvasına rahatça ulaştı.',
      baslangic: { x: 105, y: 220 }, bitis: { x: 900, y: 220, sekil: 'yuva', ad: 'Yuva' },
      engeller: [{ x: 400, y: 130, r: 88, sekil: 'kozalak', ad: 'Diken' }, { x: 620, y: 320, r: 88, sekil: 'tas', ad: 'Kaya' }] },
    { ad: 'Orta', baslik: 'Dört engel, dar bir koridor.', yonerge: 'Bu sefer daha dikkatli dolaşmak gerek. Yavaş yavaş çizelim.',
      cozum: 'Dört engelin arasından geçtin; yol tertemiz.',
      baslangic: { x: 100, y: 220 }, bitis: { x: 905, y: 220, sekil: 'yuva', ad: 'Yuva' },
      engeller: [{ x: 330, y: 120, r: 86, sekil: 'kozalak', ad: 'Diken' }, { x: 420, y: 330, r: 82, sekil: 'tas', ad: 'Kaya' },
                 { x: 640, y: 160, r: 88, sekil: 'kozalak', ad: 'Diken' }, { x: 700, y: 360, r: 78, sekil: 'tas', ad: 'Kaya' }] },
    { ad: 'Zor', baslik: 'Altı engel, kıvrımlı bir yol.', yonerge: 'Önce gözünle yolu bul, sonra parmağınla çiz. Acelemiz yok.',
      cozum: 'Altı engelin arasından geçtin; bu gerçek bir ustalık.',
      baslangic: { x: 95, y: 220 }, bitis: { x: 910, y: 220, sekil: 'yuva', ad: 'Yuva' },
      engeller: [{ x: 265, y: 108, r: 78, sekil: 'kozalak', ad: 'Diken' }, { x: 300, y: 348, r: 76, sekil: 'tas', ad: 'Kaya' },
                 { x: 500, y: 225, r: 80, sekil: 'tas', ad: 'Kaya' }, { x: 505, y: 32, r: 62, sekil: 'kozalak', ad: 'Diken' },
                 { x: 700, y: 110, r: 76, sekil: 'kozalak', ad: 'Diken' }, { x: 730, y: 352, r: 74, sekil: 'tas', ad: 'Kaya' }] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap, W = 1000, H = 440;
    ctx.ipucu('Parmağını başlangıcın üstüne koy ve kaldırmadan hedefe götür.');
    const sahne = yap('div', 'yol-sahne');
    sahne.innerHTML = `<svg class="yol-tuval" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path class="yol-cizgi" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const cizgi = sahne.querySelector('.yol-cizgi');
    const koy = (el, x, y) => { el.style.left = (x / W * 100) + '%'; el.style.top = (y / H * 100) + '%'; };
    v.engeller.forEach(e => {
      const d = yap('div', 'yol-engel');
      d.style.width = (e.r * 2 / W * 100) + '%';
      d.innerHTML = ctx.ikon(e.sekil); d.append(yap('span', 'yol-engel-ad', e.ad));
      koy(d, e.x, e.y); sahne.append(d);
    });
    // Başlangıçtaki karakter veriden gelir; masal motoru kendi kahramanını geçirir.
    const basSekil = v.baslangic.sekil || 'tavsan', basAd = v.baslangic.ad || 'Pamuk';
    const bas = yap('div', 'yol-ucu yol-baslangic');
    bas.innerHTML = ctx.ikon(basSekil); bas.append(yap('span', 'yol-ucu-ad', basAd));
    koy(bas, v.baslangic.x, v.baslangic.y);
    const son = yap('div', 'yol-ucu yol-bitis');
    son.innerHTML = ctx.ikon(v.bitis.sekil); son.append(yap('span', 'yol-ucu-ad', v.bitis.ad));
    koy(son, v.bitis.x, v.bitis.y);
    sahne.append(bas, son);
    ctx.alan.append(sahne);

    let ciziyor = false, nokta = [], bitti = false;
    const yerel = e => { const r = sahne.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; };
    const uzak = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const yaz = () => cizgi.setAttribute('d', nokta.length ? 'M' + nokta.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('L') : '');
    function kop(mesaj) {
      ciziyor = false; nokta = []; yaz();
      sahne.classList.remove('yol-ciziliyor'); sahne.classList.add('yol-koptu');
      ctx.bekle(() => sahne.classList.remove('yol-koptu'), 420);
      ctx.ipucu(mesaj);
    }
    sahne.addEventListener('pointerdown', e => {
      if (bitti) return;
      const p = yerel(e);
      if (uzak(p, v.baslangic) > 80) { ctx.ipucu(`Çizgiye ${basAd} üstünden başlayalım.`); return; }
      ciziyor = true; nokta = [p]; yaz(); sahne.classList.add('yol-ciziliyor');
      try { sahne.setPointerCapture(e.pointerId); } catch {}
    }, { signal: ctx.signal });
    sahne.addEventListener('pointermove', e => {
      if (!ciziyor || bitti) return;
      const p = yerel(e);
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) { kop('Yolu çerçevenin içinde tutalım. Baştan deneyelim mi?'); return; }
      nokta.push(p); yaz();
      const carpan = v.engeller.find(en => uzak(p, en) < en.r - 8);
      if (carpan) { kop(`${carpan.ad} çizgimizi durdurdu. Etrafından dolaşalım mı?`); return; }
      if (uzak(p, v.bitis) < 64) {
        bitti = true; ciziyor = false;
        sahne.classList.remove('yol-ciziliyor'); sahne.classList.add('yol-acildi');
        son.classList.add('ulasildi'); ctx.adim(); ctx.basar();
      }
    }, { signal: ctx.signal });
    const kes = () => { if (ciziyor && !bitti) kop('Parmağını kaldırdın. Baştan, kesintisiz deneyelim.'); };
    sahne.addEventListener('pointerup', kes, { signal: ctx.signal });
    sahne.addEventListener('pointercancel', kes, { signal: ctx.signal });
  }
};

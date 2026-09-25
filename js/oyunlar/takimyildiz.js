/* TAKIMYILDIZ — uzamsal hafıza.
   Yapı: ışıklar bir DESEN olarak yanar (sıra değil, ŞEKİL). Çocuk hangi
   noktaların yandığını hatırlayıp aynı yerlere dokunur. Dizi hafızasından
   farkı: burada sıra değil, YER akılda tutulur.

   CEZA YOK: yanlış nokta desenden düşmez, desen yeniden gösterilir. */
export default {
  kod: 'takimyildiz', ad: 'Takımyıldız', ozet: 'Yanan yıldızları aklında tut.',
  ikon: 'yildiz', renk: '#D5A64F', bolge: 'dag', beceri: 'Uzamsal hafıza',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Gökyüzünde üç yıldız parladı.', yonerge: 'İyi bak. Işıklar sönünce aynı yıldızlara dokun.',
      cozum: 'Takımyıldız yeniden çizildi.', nokta: 9, yanan: 3, tur: 2, bakma: 2200 },
    { ad: 'Orta', baslik: 'Dört yıldızlı bir şekil.', yonerge: 'Şeklin tamamını aklında tutmayı dene, tek tek değil.',
      cozum: 'Dört yıldızlı şekli hatırladın.', nokta: 12, yanan: 4, tur: 2, bakma: 2400 },
    { ad: 'Zor', baslik: 'Beş yıldız, kalabalık gök.', yonerge: 'Beş yıldız ve daha çok nokta var. Acelemiz yok.',
      cozum: 'Kalabalık gökte beş yıldızı buldun.', nokta: 16, yanan: 5, tur: 3, bakma: 2800 }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const sayac = yap('div', 'tur-basligi');
    const gok = yap('div', 'yildiz-gok');
    const durum = yap('div', 'oyun-durumu');
    ctx.alan.append(sayac, gok, durum);

    // Noktalar ızgaraya değil, hafifçe dağınık yerleşir: gerçek bir gök gibi
    const yerler = [];
    const sutun = Math.ceil(Math.sqrt(v.nokta));
    for (let i = 0; i < v.nokta; i++) {
      const sx = i % sutun, sy = Math.floor(i / sutun);
      yerler.push({ x: 8 + sx * (84 / (sutun - 1)) + (Math.random() - .5) * 7,
                    y: 12 + sy * (76 / Math.max(1, Math.ceil(v.nokta / sutun) - 1)) + (Math.random() - .5) * 7 });
    }
    const dugmeler = yerler.map((p, i) => {
      const b = yap('button', 'yildiz-nokta'); b.type = 'button';
      b.style.left = p.x + '%'; b.style.top = p.y + '%';
      b.setAttribute('aria-label', `${i + 1}. yıldız`);
      b.innerHTML = ctx.ikon(v.sekil || 'yildiz');        // paket başka bir pırıltı seçebilir
      gok.append(b); return b;
    });

    let tur = 0, desen = [], secilen = new Set(), gosteriyor = false;
    const bekle = (fn, ms) => { const t = setTimeout(() => { if (!ctx.signal.aborted) fn(); }, ms); ctx.signal.addEventListener('abort', () => clearTimeout(t)); };

    function goster() {
      gosteriyor = true; secilen.clear();
      dugmeler.forEach(b => { b.disabled = true; b.classList.remove('secili', 'dogru'); });
      durum.textContent = 'İyi bak…';
      desen.forEach(i => dugmeler[i].classList.add('parlak'));
      bekle(() => {
        desen.forEach(i => dugmeler[i].classList.remove('parlak'));
        dugmeler.forEach(b => b.disabled = false);
        gosteriyor = false;
        durum.textContent = `Sıra sende — ${desen.length} yıldıza dokun`;
        ctx.ipucu('Hangi yıldızlar parlamıştı?');
      }, v.bakma);
    }
    function yeniTur() {
      sayac.textContent = `${tur + 1}. desen · ${v.tur} desenden · ${v.yanan} yıldız`;
      const sira = [...dugmeler.keys()].sort(() => Math.random() - .5);
      desen = sira.slice(0, v.yanan);
      bekle(goster, 550);
    }
    dugmeler.forEach((b, i) => b.addEventListener('click', () => {
      if (gosteriyor || b.disabled) return;
      if (!desen.includes(i)) {
        ctx.titret(b);
        ctx.ipucu('O parlamamıştı. Deseni bir daha gösterelim.');
        bekle(goster, 800);
        return;
      }
      if (secilen.has(i)) return;
      secilen.add(i); b.classList.add('dogru'); b.disabled = true; ctx.adim();
      durum.textContent = `${secilen.size} / ${desen.length} yıldız`;
      if (secilen.size === desen.length) {
        dugmeler.forEach(x => x.disabled = true);
        tur++;
        if (tur < v.tur) { ctx.ipucu('Tam isabet! Yeni bir desen geliyor.'); bekle(yeniTur, 900); }
        else { durum.className = 'oyun-durumu basarili-durum'; durum.textContent = 'Bütün desenler tamam!'; bekle(() => ctx.basar(), 400); }
      }
    }, { signal: ctx.signal }));
    yeniTur();
  }
};

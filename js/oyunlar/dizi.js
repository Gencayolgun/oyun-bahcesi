/* DİNLE VE TEKRARLA — işitsel bellek.
   Yapı: dizi tur tur uzar. Yanlışta ceza yok; aynı dizi yeniden çalınır.
   Dört ada dostu kullanılır, çünkü ses motorunda ayırt edilebilir dört ses var. */
export default {
  kod: 'dizi', ad: 'Dinle ve Tekrarla', ozet: 'Sırayı dinle, aynısını yap.',
  ikon: 'fok', renk: '#4E9AB5', bolge: 'deniz', beceri: 'İşitsel bellek · sıralama',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Üç dost sırayla seslendi.', yonerge: 'Önce dinleyelim, sonra aynı sırayla dokunalım.',
      cozum: 'Sırayı hatırladın; üç dost da çok sevindi.',
      dostlar: [{ sekil: 'inek', ad: 'Boncuk' }, { sekil: 'tavsan', ad: 'Pamuk' }, { sekil: 'fok', ad: 'Köpük' }], uzunluklar: [2, 3] },
    { ad: 'Orta', baslik: 'Dört dost, daha uzun bir şarkı.', yonerge: 'Dört dost var şimdi. Gözünü ve kulağını birlikte kullan.',
      cozum: 'Dört sesli şarkıyı eksiksiz tekrarladın.',
      dostlar: [{ sekil: 'inek', ad: 'Boncuk' }, { sekil: 'tavsan', ad: 'Pamuk' }, { sekil: 'fok', ad: 'Köpük' }, { sekil: 'kus', ad: 'Işık' }], uzunluklar: [3, 4] },
    { ad: 'Zor', baslik: 'Beş sesli uzun bir dizi.', yonerge: 'Bu uzun. İçinden tekrar ederek aklında tutmayı deneyebilirsin.',
      cozum: 'Beş sesi sırasıyla hatırladın; hafızan çok güçlü.',
      dostlar: [{ sekil: 'inek', ad: 'Boncuk' }, { sekil: 'tavsan', ad: 'Pamuk' }, { sekil: 'fok', ad: 'Köpük' }, { sekil: 'kus', ad: 'Işık' }], uzunluklar: [4, 5] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const sayac = yap('div', 'tur-basligi');
    const tahta = yap('div', 'dizi-tahtasi');
    ctx.alan.append(sayac, tahta);
    const ped = v.dostlar.map((d, i) => {
      const b = yap('button', 'dizi-ped'); b.type = 'button'; b.setAttribute('aria-label', d.ad);
      const r = yap('span', 'nesne-resmi'); r.innerHTML = ctx.ikon(d.sekil);
      b.append(r, yap('span', 'nesne-adi', d.ad)); tahta.append(b); return b;
    });
    let tur = 0, dizi = [], beklenen = 0, oynatiliyor = false;
    function yak(i, sure = 480) {
      ped[i].classList.add('parlak');
      ctx.ses.playAnimal(v.dostlar[i].sekil);
      ctx.bekle(() => ped[i].classList.remove('parlak'), sure);
    }
    function oynat() {
      oynatiliyor = true; beklenen = 0;
      ped.forEach(p => p.disabled = true);
      ctx.ipucu('Şimdi dinle ve izle…');
      dizi.forEach((d, k) => ctx.bekle(() => yak(d), 520 + k * 780));
      ctx.bekle(() => { oynatiliyor = false; ped.forEach(p => p.disabled = false); ctx.ipucu('Sıra sende — aynı sırayla dokun.'); }, 520 + dizi.length * 780);
    }
    function yeniTur() {
      // Dizi çalmaya başlayana kadar pedler kapalı: çocuk daha duymadan
      // dokunup yanlışlıkla cevap vermiş sayılmasın.
      ped.forEach(p => p.disabled = true);
      beklenen = 0;
      sayac.textContent = `${tur + 1}. dizi · ${v.uzunluklar.length} diziden · ${v.uzunluklar[tur]} ses`;
      dizi = Array.from({ length: v.uzunluklar[tur] }, () => Math.floor(Math.random() * v.dostlar.length));
      ctx.bekle(oynat, 520);
    }
    ped.forEach((b, i) => b.addEventListener('click', () => {
      if (oynatiliyor || b.disabled) return;
      yak(i, 300);
      if (i !== dizi[beklenen]) { ctx.titret(b); ctx.ipucu('Karışmış olabilir — aynı diziyi bir daha dinleyelim.'); ctx.bekle(oynat, 950); return; }
      beklenen++;
      if (beklenen === dizi.length) {
        ped.forEach(p => p.disabled = true);
        ctx.adim(); tur++;
        if (tur < v.uzunluklar.length) { ctx.ipucu('Tam sırasıyla! Şimdi biraz daha uzun bir dizi geliyor.'); ctx.bekle(yeniTur, 900); }
        else ctx.bekle(() => ctx.basar(), 500);
      }
    }, { signal: ctx.signal }));
    yeniTur();
  }
};

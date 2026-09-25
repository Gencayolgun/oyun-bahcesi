/* ÇİFT BUL — çalışma belleği.
   Yapı: kartlar kapalı. İkisi açılır, eşleşmezse kapanır. Çocuk gördüğü
   kartın YERİNİ aklında tutmak zorunda. Takımyıldızdan farkı: burada bilgi
   tek seferde değil, oyun boyunca parça parça birikir.

   CEZA YOK: hamle sınırı yok, saat yok. */
export default {
  kod: 'cift', ad: 'Çift Bul', ozet: 'Kartları çevir, eşleri bul.',
  ikon: 'kabuk', renk: '#5EA8B2', bolge: 'deniz', beceri: 'Çalışma belleği',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Dört çift kabuk.', yonerge: 'İki kart çevir. Aynıysa açık kalır, değilse kapanır.',
      cozum: 'Bütün kabuklar eşini buldu.',
      cift: [ 'kabuk', 'yildiz', 'balik', 'yengec' ] },
    { ad: 'Orta', baslik: 'Altı çift.', yonerge: 'Daha çok kart var. Açılan kartın yerini aklında tut.',
      cozum: 'Altı çifti de buldun.',
      cift: [ 'kabuk', 'yildiz', 'balik', 'yengec', 'ahtapot', 'fok' ] },
    { ad: 'Zor', baslik: 'Sekiz çift.', yonerge: 'Bu gerçek bir hafıza sınavı. Acelemiz yok.',
      cozum: 'Sekiz çift — hafızan çok güçlü.',
      cift: [ 'kabuk', 'yildiz', 'balik', 'yengec', 'ahtapot', 'fok', 'kaplumbaga', 'su' ] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    ctx.ipucu('İki kart çevir. Aynıysa açık kalır.');
    const tahta = yap('div', 'cift-tahtasi');
    const durum = yap('div', 'oyun-durumu');
    const sutun = v.cift.length <= 4 ? 4 : v.cift.length <= 6 ? 4 : 4;
    tahta.style.gridTemplateColumns = `repeat(${sutun},1fr)`;
    ctx.alan.append(tahta, durum);

    const kagitlar = ctx.karistir(v.cift.concat(v.cift));
    let acik = [], kilit = false, bulunan = 0;
    const yaz = () => durum.textContent = `${bulunan} / ${v.cift.length} çift bulundu`;
    yaz();

    kagitlar.forEach((sekil, i) => {
      const k = yap('button', 'cift-kart'); k.type = 'button';
      k.dataset.sekil = sekil;
      k.setAttribute('aria-label', `${i + 1}. kart`);
      const on = yap('span', 'cift-on'); on.innerHTML = ctx.ikon(sekil);
      const arka = yap('span', 'cift-arka');
      k.append(arka, on);
      k.addEventListener('click', () => {
        if (kilit || k.classList.contains('acik') || k.classList.contains('esletti')) return;
        k.classList.add('acik'); acik.push(k);
        if (acik.length < 2) return;
        kilit = true;
        const [a, b] = acik;
        if (a.dataset.sekil === b.dataset.sekil) {
          ctx.bekle(() => {
            a.classList.add('esletti'); b.classList.add('esletti');
            a.disabled = b.disabled = true;
            acik = []; kilit = false; bulunan++; ctx.adim(); yaz();
            if (bulunan === v.cift.length) { durum.className = 'oyun-durumu basarili-durum'; durum.textContent = 'Bütün çiftler bulundu!'; ctx.basar(); }
            else ctx.ipucu('Eşleşti! Devam edelim.');
          }, 420);
        } else {
          ctx.ipucu('Bunlar eş değil — yerlerini aklında tut.');
          ctx.bekle(() => { a.classList.remove('acik'); b.classList.remove('acik'); acik = []; kilit = false; }, 950);
        }
      }, { signal: ctx.signal });
      tahta.append(k);
    });
  }
};

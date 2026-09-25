/* TERAZİ — denge ve erken toplama.
   Yapı: analog. Kiriş her dokunuşta canlı tepki verir; fazla gelirse geri alınır.
   Sayı yazmıyoruz: ağırlık taşın BOYUTUYLA anlatılıyor. */
export default {
  kod: 'terazi', ad: 'Terazi', ozet: 'İki tarafı eşitle, kirişi düzelt.',
  ikon: 'tas', renk: '#9A8E77', bolge: 'dag', beceri: 'Denge · erken toplama',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Terazi hafifçe eğik.', yonerge: 'Sağ kefeye taş ekleyip kirişi düzeltelim. Fazla gelirse geri alırız.',
      cozum: 'Terazi dengelendi.',
      sol: [{ sekil: 'tas', agirlik: 2 }],
      havuz: [{ ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 }] },
    { ad: 'Orta', baslik: 'Sol kefede iki taş var.', yonerge: 'Büyük taş iki küçüğe, orta taş da iki küçüğe bedel. Deneyerek bulalım.',
      cozum: 'Dört birimlik dengeyi kurdun.',
      sol: [{ sekil: 'tas', agirlik: 2 }, { sekil: 'tas', agirlik: 2 }],
      havuz: [{ ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 }, { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 }] },
    { ad: 'Zor', baslik: 'Ağır bir yük, birden çok çözüm.', yonerge: 'Bunun birden fazla doğru cevabı var. İstediğin yolu seçebilirsin.',
      cozum: 'Yedi birimlik dengeyi kurdun; birden çok yolu vardı, sen birini buldun.',
      sol: [{ sekil: 'tas', agirlik: 3 }, { sekil: 'tas', agirlik: 2 }, { sekil: 'tas', agirlik: 2 }],
      havuz: [{ ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 }, { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 }, { ad: 'Büyük', agirlik: 3 }] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const solAgirlik = v.sol.reduce((t, s) => t + s.agirlik, 0);
    ctx.ipucu('Bir taşa dokununca sağ kefeye gider. Tekrar dokunursan geri alınır.');
    const sahne = yap('div', 'terazi-sahne');
    sahne.innerHTML = '<i class="terazi-ayak"></i><i class="terazi-direk"></i><div class="terazi-kiris"><i class="terazi-ip terazi-ip-sol"></i><i class="terazi-ip terazi-ip-sag"></i></div>';
    const kiris = sahne.querySelector('.terazi-kiris');
    const solKefe = yap('div', 'terazi-kefe terazi-sol');
    const sagKefe = yap('div', 'terazi-kefe terazi-sag');
    v.sol.forEach(s => { const t = yap('span', 'terazi-tas boy-' + s.agirlik); t.innerHTML = ctx.ikon(s.sekil); solKefe.append(t); });
    sahne.append(solKefe, sagKefe);
    const havuz = yap('div', 'terazi-havuz');
    const durum = yap('div', 'oyun-durumu');
    let sag = 0, bitti = false;
    function guncelle() {
      const fark = sag - solAgirlik, aci = Math.max(-15, Math.min(15, fark * 6));
      kiris.style.transform = `rotate(${aci}deg)`;
      solKefe.style.transform = `translateX(-50%) translateY(${-aci * 2.6}px)`;
      sagKefe.style.transform = `translateX(-50%) translateY(${aci * 2.6}px)`;
      if (!bitti && fark === 0 && sag > 0) {
        bitti = true; sahne.classList.add('dengede');
        durum.className = 'oyun-durumu basarili-durum';
        durum.textContent = 'Denge! İki taraf da tam eşit.';
        havuz.querySelectorAll('button').forEach(b => { if (!b.classList.contains('kefede')) b.disabled = true; });
        ctx.basar(); return;
      }
      if (bitti) return;
      durum.className = 'oyun-durumu';
      durum.textContent = sag === 0 ? 'Sağ kefe boş. Hadi başlayalım.'
        : fark < 0 ? 'Sağ taraf hâlâ hafif — biraz daha ekleyelim.'
        : 'Sağ taraf ağır kaçtı — bir taşı geri alalım mı?';
    }
    v.havuz.forEach(s => {
      const b = yap('button', 'nesne-karti terazi-adayi'); b.type = 'button';
      b.dataset.agirlik = String(s.agirlik); b.setAttribute('aria-label', s.ad + ' taş');
      const r = yap('span', 'nesne-resmi boy-' + s.agirlik); r.innerHTML = ctx.ikon('tas');
      b.append(r, yap('span', 'nesne-adi', s.ad));
      b.addEventListener('click', () => {
        if (bitti) return;
        if (b.classList.contains('kefede')) { b.classList.remove('kefede'); sag -= s.agirlik; havuz.append(b); }
        else { b.classList.add('kefede'); sag += s.agirlik; sagKefe.append(b); ctx.adim(); }
        guncelle();
      }, { signal: ctx.signal });
      havuz.append(b);
    });
    ctx.alan.append(sahne, havuz, durum);
    guncelle();
  }
};

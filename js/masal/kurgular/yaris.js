/* KURGU · YARIŞ — iki yarışçı, tek pist.

   Yolculuktan farkı yapısal: halka yok, armağan yok, "durak topla" yok.
   Sınıfın çözdüğü her görev BİZİM yarışçıyı bir adım ilerletir. Rakip
   kendi başına ilerler — ve masalın gerektirdiği yerde uyuyakalır.

   RAKİP TAKVİMİ dramayı taşır ve sınıf mevcuduna göre hesaplanır:
     · ilk %30 tur    rakip iki adım atar, açık ara öne geçer
     · %30–%75 arası  uyur, hiç ilerlemez  → bizimki yavaş yavaş yaklaşır
     · son %25        uyanır, hızlanır ama bir adım geriden bitirir

   Kaybetme yok: rakip her zaman bir adım geriden gelir. Ama sınıf bunu
   sonuna kadar bilmez — gerilim gerçek, yenilgi yok. */

function rakipYeri(tur, n) {
  const kos = Math.max(2, Math.round(n * .3));
  const uyan = Math.max(kos + 2, Math.round(n * .75));
  const zirve = Math.min(n - 1, kos * 2);
  if (tur <= kos) return Math.min(zirve, tur * 2);
  if (tur <= uyan) return zirve;                               // uyku
  const kalan = Math.max(1, n - uyan);
  return Math.min(n - 1, zirve + Math.round((tur - uyan) / kalan * (n - 1 - zirve)));
}
function uyuyorMu(tur, n) {
  const kos = Math.max(2, Math.round(n * .3));
  const uyan = Math.max(kos + 2, Math.round(n * .75));
  return tur > kos && tur <= uyan;
}
function durumYazisi(biz, rakip, uyku, adlar) {
  if (rakip > biz) return uyku
    ? `${adlar.rakip} bir gölgede uyuyakaldı. ${adlar.biz} durmadan geliyor…`
    : `${adlar.rakip} açık ara önde. Ama daha yol uzun.`;
  if (rakip === biz) return `Yan yanalar! ${adlar.biz} yetişti.`;
  return uyku
    ? `${adlar.biz} öne geçti — ve ${adlar.rakip} hâlâ uyuyor!`
    : `${adlar.rakip} uyandı ve hızlanıyor. ${adlar.biz} durmuyor.`;
}

export default {
  kod: 'yaris',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Yarışçımız bir adım ilerledi.', devam: 'Piste dön', final: 'Etabı bitir' },
  geriEtiket: 'Piste dön',

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, simge, ses } = api;
    const liste = duraklar(), durak = liste[durum.sira], b = durak.bolum, bol = masal.bolumler[b];
    const n = liste.length, biz = durum.sira, rakip = rakipYeri(biz, n), uyku = uyuyorMu(biz, n);
    const adlar = { biz: masal.yaris.bizim.ad, rakip: masal.yaris.rakip.ad };
    ses.setRegion(['ciftlik', 'orman', 'deniz', 'dag'][b] || 'orman');

    const sayfa = el('main', 'sayfa harita yaris-sayfasi');
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());
    const icerik = el('div', 'harita-icerik'), yan = el('aside', 'yolculuk-paneli');
    yan.append(el('span', 'eyebrow', `${String(b + 1).padStart(2, '0')}. ETAP · ${bol.ad.toLocaleUpperCase('tr')}`),
               el('h1', '', bol.baslik), el('p', 'bolum-hikaye', bol.hikaye));
    const dostKart = el('div', 'dost-karti'), resim = el('div', 'dost-resmi');
    resim.innerHTML = ikon(bol.karakter.kod);
    const konus = el('div'); konus.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    dostKart.append(resim, konus); yan.append(dostKart);
    const gorev = el('div', 'siradaki-gorev');
    const ad = durum.adlar[durum.sira % durum.adlar.length];
    gorev.append(el('span', 'eyebrow', 'BU ADIMI SEN ATACAKSIN'), el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final'
        ? `${bol.karakter.ad} ile ilgilen; ${adlar.biz} bir adım daha atsın.`
        : durak.veri.yonerge));
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    gorev.append(cocuk); yan.append(gorev); icerik.append(yan);

    const gorunum = el('section', 'ada-gorunumu'); gorunum.setAttribute('aria-label', masal.ad + ' pisti');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik');
    baslik.append(el('span', 'eyebrow', 'YARIŞ SÜRÜYOR'), el('h2', '', masal.ad));
    gorunum.append(baslik);
    gorunum.append(api.kameraKontrolleri({ sol: 'Pisti sola döndür', sag: 'Pisti sağa döndür' })); icerik.append(gorunum); sayfa.append(icerik);

    /* Alt bar yolculuktakinden bambaşka: armağan torbası yok,
       yan yana iki yarış şeridi ve anlık durum var. */
    const alt = el('footer', 'yolculuk-alt yaris-alt');
    const pist = el('div', 'yaris-seritleri');
    [[masal.yaris.bizim, biz, 'bizim'], [masal.yaris.rakip, rakip, 'rakip']].forEach(([kisi, yer, sinif]) => {
      const satir = el('div', `yaris-serit ${sinif}` + (uyku && sinif === 'rakip' ? ' uyuyor' : ''));
      const yuz = el('span', 'yaris-yuz'); yuz.innerHTML = ikon(kisi.kod);
      const iz = el('div', 'yaris-iz'); const dolgu = el('i');
      dolgu.style.width = `${yer / n * 100}%`;
      const isaret = el('b', 'yaris-isaret'); isaret.style.left = `${yer / n * 100}%`;
      isaret.innerHTML = ikon(kisi.kod);
      iz.append(dolgu, isaret);
      const sayi = el('span', 'yaris-sayi', `${yer} / ${n}`);
      satir.append(yuz, el('span', 'yaris-ad', kisi.ad), iz, sayi);
      if (uyku && sinif === 'rakip') satir.append(el('span', 'yaris-zzz', 'zzz'));
      pist.append(satir);
    });
    alt.append(pist);
    const durumKutu = el('div', 'yaris-durum');
    durumKutu.innerHTML = simge('leaf');
    durumKutu.append(el('span', '', durumYazisi(biz, rakip, uyku, adlar)));
    alt.append(durumKutu);
    const eylemler = el('div', 'harita-eylemler');
    if (durum.sira > 0) eylemler.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Sıradaki adımı at', gorevEkrani));
    alt.append(eylemler); sayfa.append(alt); kok.append(sayfa);
    dunyayaKur(kap, durum.sira, gorevEkrani, { yaris: { bizim: biz, rakip, n, uyku } });
  },

  /* Etap sonunda armağan ekranı değil, yarış durumu ekranı gelir. */
  sonra(durak, api) {
    if (durak.tip !== 'final') return;
    const { durum, masal, kok, el, dugme, ustBar, duraklar, ikon } = api;
    api.temizle();
    const liste = duraklar(), n = liste.length;
    const biz = durum.sira, rakip = rakipYeri(biz, n), uyku = uyuyorMu(biz, n);
    const etap = masal.bolumler[durak.bolum];
    const sayfa = el('main', 'sayfa hikaye odul'); sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti'), resim = el('div', 'hikaye-resim');
    resim.innerHTML = ikon(masal.yaris.bizim.kod);
    kutu.append(resim, el('span', 'eyebrow', `${durak.bolum + 1}. ETAP TAMAMLANDI`),
      el('h1', '', etap.etapSonu || `${etap.ad} geçildi!`),
      el('p', '', etap.final.cozum),
      el('p', 'odul-gecis', durumYazisi(biz, rakip, uyku,
        { biz: masal.yaris.bizim.ad, rakip: masal.yaris.rakip.ad })),
      dugme(durak.bolum === masal.bolumler.length - 1 ? 'Bitişi gör' : 'Yarışa devam', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    return 'beklet';
  }
};

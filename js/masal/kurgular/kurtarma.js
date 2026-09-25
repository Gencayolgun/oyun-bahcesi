/* KURGU · KURTARMA — tek hedef, geri sayan bir engel.

   Yolculuktan da yarıştan da farkı yapısal:
     · Armağan toplama yok. Toplanacak bir şey yok; ÇÖZÜLECEK bir şey var.
     · İlerleme çubuğu "kaç durak geçtik" demiyor, "kaç ip kaldı" diyor.
     · Sayı ARTMIYOR, AZALIYOR. Sınıf bir şeyi biriktirmiyor, söküyor.
     · Bölüm sonunda armağan ekranı değil, kurtarma durumu ekranı geliyor.

   Aslan ile Fare bunu kullanır: Kösele ağın altında, her çözülen görev bir
   ipi kesiyor, koloni kayanın çevresinde birikiyor. */

const kalanIp = (sira, toplam, dugum) => Math.max(0, dugum - Math.round(sira / toplam * dugum));

function durumYazisi(kalan, dugum, ad) {
  if (kalan === dugum) return `${ad} ağın altında. Tek bir ip bile kesilmedi.`;
  if (kalan > dugum * .6) return `İlk ipler koptu. ${ad} kıpırdayabiliyor ama hâlâ sıkışık.`;
  if (kalan > dugum * .3) return `Ağ gevşiyor. ${ad} başını kaldırdı.`;
  if (kalan > 1) return `Son birkaç ip kaldı. Koloni hepsi burada.`;
  if (kalan === 1) return `Tek bir ip kaldı. Herkes nefesini tutuyor.`;
  return `${ad} özgür!`;
}

export default {
  kod: 'kurtarma',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Bir ip daha gevşedi.', devam: 'Kayaya dön', final: 'Aşamayı bitir' },
  geriEtiket: 'Kayaya dön',

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, simge, ses } = api;
    const liste = duraklar(), durak = liste[durum.sira], b = durak.bolum, bol = masal.bolumler[b];
    const K = masal.kurtarma, dugum = K.dugum || 12;
    const kalan = kalanIp(durum.sira, liste.length, dugum);
    const kesilen = dugum - kalan;
    ses.setRegion(['ciftlik', 'orman', 'deniz', 'dag'][b] || 'ciftlik');

    const sayfa = el('main', 'sayfa harita kurtarma-sayfasi');
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());
    const icerik = el('div', 'harita-icerik'), yan = el('aside', 'yolculuk-paneli');
    yan.append(el('span', 'eyebrow', `${String(b + 1).padStart(2, '0')}. AŞAMA · ${bol.ad.toLocaleUpperCase('tr')}`),
               el('h1', '', bol.baslik), el('p', 'bolum-hikaye', bol.hikaye));
    const dostKart = el('div', 'dost-karti'), resim = el('div', 'dost-resmi');
    resim.innerHTML = ikon(bol.karakter.kod);
    const konus = el('div'); konus.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    dostKart.append(resim, konus); yan.append(dostKart);
    const gorev = el('div', 'siradaki-gorev');
    const ad = durum.adlar[durum.sira % durum.adlar.length];
    gorev.append(el('span', 'eyebrow', 'BU İPİ SEN KESECEKSİN'), el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final'
        ? `${bol.karakter.ad} ile ilgilen; kurtarma bir adım daha ilerlesin.`
        : durak.veri.yonerge));
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    gorev.append(cocuk); yan.append(gorev); icerik.append(yan);

    const gorunum = el('section', 'ada-gorunumu'); gorunum.setAttribute('aria-label', masal.ad + ' kurtarma alanı');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik');
    baslik.append(el('span', 'eyebrow', 'KURTARMA SÜRÜYOR'), el('h2', '', masal.ad));
    gorunum.append(baslik);
    gorunum.append(api.kameraKontrolleri({ sol: 'Sola döndür', sag: 'Sağa döndür' })); icerik.append(gorunum); sayfa.append(icerik);

    /* Alt bar: armağan torbası yok. Geri sayan bir ip sayacı var. */
    const alt = el('footer', 'yolculuk-alt kurtarma-alt');
    const sayac = el('div', 'kurtarma-sayac');
    sayac.append(el('span', 'eyebrow', 'AĞDAKİ İPLER'));
    const buyuk = el('strong', '');
    buyuk.append(el('b', 'kurtarma-kalan', String(kalan)), el('small', '', ` / ${dugum} ip kaldı`));
    sayac.append(buyuk);
    const iz = el('div', 'kurtarma-ipleri');
    for (let i = 0; i < dugum; i++) iz.append(el('i', i < kesilen ? 'kesildi' : ''));
    sayac.append(iz); alt.append(sayac);

    const hedef = el('div', 'kurtarma-hedef');
    const hres = el('span', 'kurtarma-yuz'); hres.innerHTML = ikon(K.hedef.kod);
    const hyazi = el('div');
    hyazi.append(el('strong', '', K.hedef.ad), el('small', '', durumYazisi(kalan, dugum, K.hedef.ad)));
    hedef.append(hres, hyazi);
    if (kalan === 0) hedef.classList.add('ozgur');
    alt.append(hedef);

    const eylemler = el('div', 'harita-eylemler');
    if (durum.sira > 0) eylemler.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Sıradaki ipi kes', gorevEkrani));
    alt.append(eylemler); sayfa.append(alt); kok.append(sayfa);
    dunyayaKur(kap, durum.sira, gorevEkrani);
  },

  /* Aşama sonunda armağan değil, kurtarmanın nerede olduğu gösterilir. */
  sonra(durak, api) {
    if (durak.tip !== 'final') return;
    const { durum, masal, kok, el, dugme, ustBar, duraklar, ikon } = api;
    api.temizle();
    const liste = duraklar(), K = masal.kurtarma, dugum = K.dugum || 12;
    const kalan = kalanIp(durum.sira, liste.length, dugum);
    const asama = masal.bolumler[durak.bolum];
    const sayfa = el('main', 'sayfa hikaye odul'); sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti'), resim = el('div', 'hikaye-resim');
    resim.innerHTML = ikon(kalan === 0 ? K.hedef.kod : K.dugumIkon || 'kazik2');
    kutu.append(resim, el('span', 'eyebrow', `${durak.bolum + 1}. AŞAMA TAMAMLANDI`),
      el('h1', '', asama.asamaSonu || `${asama.ad} bitti!`),
      el('p', '', asama.final.cozum),
      el('p', 'odul-gecis', durumYazisi(kalan, dugum, K.hedef.ad)),
      dugme(durak.bolum === masal.bolumler.length - 1 ? 'Sonu gör' : 'Kurtarmaya devam', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    return 'beklet';
  }
};

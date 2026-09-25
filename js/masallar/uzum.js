/* MASAL — TİLKİ İLE ÜZÜMLER (Ezop)
   ─────────────────────────────────
   Kaynak kamu malı (Ezop, ~MÖ 600). Metin bize ait, çeviri değil.

   FİNALİ YUMUŞATTIM: Ezop'ta tilki üzüme yetişemez, "Zaten ekşiydi" deyip
   gider; masal orada biter. Burada o cümle masalın SONU değil, İLK
   BÖLÜMÜN sonu. Kızıl pes eder ama bağdaki dostları onu bırakmaz:
     · sincap Fıstık ona yeniden denemeyi ve alıştırmayı,
     · kirpi Yumak sabretmeyi ve yardım istemeyi,
     · arı Vızvız beklemeyi ve paylaşmayı gösterir.
   Önce sandık üstüne sandık, sonra bir merdiven. Üzümler olgunlaşınca
   birlikte toplanır ve bağın bütün dostlarına paylaştırılır. Kızıl'ın
   "ekşi" dediği üzüm aslında tatlıdır. Kimse ayıplanmaz, kimse cezalanmaz.

   KURGU: deneme. Tahtanın ana ekseni DİKEY: yerde Kızıl, en tepede salkım.
   Her durak bir deneme; her deneme merdivene bir basamak ekler. Bölümler
   merdivenin malzemesini değiştirir: zıplama izi → alıştırma taşı →
   sandık → merdiven basamağı. Bölüm sonunda "salkıma kaç basamak kaldı".

   HARİTA: bağ yamaca kurulu. Patika önden (aşağıdan) başlar, asma
   sıralarının arasında kıvrıla kıvrıla iki teras yukarı tırmanır.
   Her bölüm bir kat: ön bağ, çardak önü, alt teras, üst teras. */

/* Patikanın kıvrımları (dünya koordinatı). Teras kenarlarındaki taş
   basamaklara durak konmaz: oradan yalnızca geçilir. */
export const PATIKA = [
  [[-10.8, 7.7], [10.8, 7.7]],          // ön bağ
  [[10.8, 7.7], [10.8, 3.9]],
  [[10.8, 3.9], [-10.8, 3.9]],          // çardak önü
  [[-10.8, 3.9], [-10.8, -2.0]],
  [[-10.8, -3.8], [-10.8, -4.5]],       // alt terasa çıkış (−2.9'da basamak)
  [[-10.8, -4.5], [10.8, -4.5]],        // alt teras
  [[10.8, -4.5], [10.8, -5.2]],
  [[10.8, -7.0], [10.8, -7.7]],         // üst terasa çıkış (−6.1'de basamak)
  [[10.8, -7.7], [-10.8, -7.7]]         // üst teras
];
/* Terasların kenarları ve yükseklikleri (mekân da bunları kullanır). */
export const TERAS = { kenar1: -2.9, kenar2: -6.1, ust1: .3, ust2: .6 };

/* Durak yerleri: dört bölüm patikanın dört çeyreğine düşer; her bölümün
   durakları kendi çeyreğine eşit aralıkla dizilir. Sınıf mevcudu 4 de
   olsa 40 da olsa noktalar patikanın üstünde ve birbirinden uzak kalır. */
function yerlesim(duraklar) {
  const parcalar = PATIKA.map(([a, b]) => ({ a, b, u: Math.hypot(b[0] - a[0], b[1] - a[1]) }));
  const L = parcalar.reduce((t, p) => t + p.u, 0);
  const nokta = s => {
    for (const p of parcalar) {
      if (s <= p.u) { const t = s / p.u; return { x: +(p.a[0] + (p.b[0] - p.a[0]) * t).toFixed(2), z: +(p.a[1] + (p.b[1] - p.a[1]) * t).toFixed(2) }; }
      s -= p.u;
    }
    const son = parcalar[parcalar.length - 1].b; return { x: son[0], z: son[1] };
  };
  const B = Math.max(1, ...duraklar.map(d => d.bolum + 1));
  const yer = [];
  for (let b = 0; b < B; b++) {
    const grup = duraklar.map((d, i) => ({ d, i })).filter(x => x.d.bolum === b);
    grup.forEach(({ i }, j) => { yer[i] = nokta((b + (j + .5) / grup.length) * L / B); });
  }
  return yer;
}

export default {
  kod: 'uzum',
  ad: 'Tilki ile Üzümler',
  kaynak: 'Ezop fablı',
  ders: 'Yetişemediğini küçümseme; yeniden dene, yardım iste',
  sure: '40 dakika · bütün sınıf',
  ozet: 'Kızıl tilki çardağın tepesindeki salkıma yetişemeyince “Zaten ekşiydi!” der. Sınıf onunla birlikte yeniden dener, dostlarından yardım ister ve salkıma basamak basamak tırmanır.',
  renk: '#C8663B',
  ikon: 'uzum-salkim',

  /* KURGU: deneme. Armağan toplanmaz; her durak salkıma giden merdivene
     bir basamak ekler. Tahta dikey bir tırmanış gösterir. */
  kurgu: 'deneme',
  deneme: {
    kahraman: { kod: 'tilki-kizil', ad: 'Kızıl' },
    hedef: { kod: 'uzum-salkim', ham: 'uzum-yesil', ad: 'Salkım', olgunBolum: 3 },   // 4. bölümde olgunlaşır
    /* Her bölümün basamağı başka bir şeyden yapılır. */
    basamaklar: [
      { ad: 'zıplama', ikon: 'tilki-kizil', renk: '#E08A4A', not: 'Kızıl tek başına zıplıyor.' },
      { ad: 'alıştırma taşı', ikon: 'tas', renk: '#A7A99B', not: 'Fıstık’la her gün biraz alıştırma.' },
      { ad: 'sandık', ikon: 'uzum-sandik', renk: '#C69558', not: 'Yumak’la sandık üstüne sandık.' },
      { ad: 'merdiven', ikon: 'uzum-merdiven', renk: '#9C6B3E', not: 'Vızvız’la merdivenden salkıma.' }
    ]
  },

  /* Mekân: yamaçta bir bağ. Ortada yüksek çardak; sınıf ilerledikçe
     altına sandıklar, sonra merdiven geliyor; en sonda üzümler morarıyor. */
  dunya: { mekan: 'bag', gok: 0xf2e9d8, cevre: 0xa6bd7f, cekirdek: 50923, yol: 0xe9d7b0,
    yansima: 0x8e9f6e,
    piyonTur: 'sincap', piyon: 0xc97b3f, piyonKarin: 0xf7e6c8, piyonIc: 0xeaa48c,   // çocuk küçük bir sincap olarak dolaşır
    yerlesim, yolKapali: false,
    /* Çözülen her durak, durağın yanına bir salkım bırakır: patika
       sınıf ilerledikçe üzümle doluyor. */
    izNotu: { bos: 'Patika henüz bomboş', dolu: '{n} deneme · salkıma tırmanıyoruz' },
    iz: 'uzum-salkimi', izRenk: 0x7b4f9d, kesifRenk: 0xc8663b,
    kesif: [
      { x: -11.0, z: 10.2, ikon: 'uzum-ceviz', ad: 'Fıstık’ın ceviz ağacı',
        metin: 'Fıstık bu ceviz ağacında doğmuş. İlk kez dala zıpladığında düşmüş, sonra bir daha denemiş. Şimdi dallar arasında uçar gibi gider; kovuğunda kış için saklanmış cevizler var.' },
      { x: 1.1, z: 9.7, ikon: 'uzum-kovan', ad: 'Vızvız’ın kovanı',
        metin: 'Hasırdan örülmüş üç kovan. Vızvız her sabah buradan çıkar, bağın bütün çiçeklerini gezer. Arılar bir çiçeği bulunca kovana dönüp dans eder; dans, çiçeğin yolunu anlatır.' },
      { x: 6.6, z: .8, ikon: 'uzum-yaprak', ad: 'Yumak’ın yaprak yuvası',
        metin: 'Yumak kuru asma yapraklarından bir yuva yapmış. Gündüz burada uyur, akşam olunca yavaş yavaş dışarı çıkar. Acele etmez; ama bir işe başladı mı bitirir.' },
      { x: -5.2, z: 1.5, ikon: 'uzum-kuyu', ad: 'Eski kuyu',
        metin: 'Bağın en eski kuyusu. Kovası ip ile iner, serin suyla dolu çıkar. Bağcılar sıcakta yorulunca buraya gelir, bir yudum su içip gölgede dinlenirmiş.' },
      { x: 10.3, z: 10.5, ikon: 'in', ad: 'Kızıl’ın ini',
        metin: 'Kızıl yamacın dibindeki bu inde yaşar. Kapısından bütün bağ görünür. Her sabah çardağın tepesindeki salkıma bakar ve “Bugün olacak!” der.' }
    ]},

  acilis: [
    { tag: 'BİR VARMIŞ, BİR YOKMUŞ', baslik: 'Yamaçta bir bağ.', ikon: 'uzum-asma',
      metin: 'Tepelerin arasında sıra sıra asmaları olan bir bağ varmış. Bağın ortasında yüksek bir çardak, çardağın en tepesinde de güneşe bakan bir salkım üzüm sallanıyormuş. Bir sabah oradan Kızıl adında genç bir tilki geçmiş.' },
    { tag: 'KIZIL', baslik: 'Hop! Olmadı.', ikon: 'tilki-kizil',
      metin: 'Kızıl salkımı görünce burnunu havaya dikmiş. Uzanmış, parmak uçlarında yükselmiş, hop diye zıplamış. Olmamış; salkım çok yüksekmiş. Kızıl biraz bozulmuş ama “Bir daha!” demiş.' },
    { tag: 'BU MASALIN KAHRAMANI SİZSİNİZ', baslik: 'Her deneme bir basamak.', ikon: 'uzum-merdiven',
      metin: 'Bugün sırayla tahtaya geleceğiz. Her birimiz Kızıl için bir deneme yapacağız; her deneme salkıma giden yola bir basamak ekleyecek. Bakalım Kızıl pes mi edecek, yoksa yeniden denemeyi ve yardım istemeyi mi öğrenecek?' }
  ],

  bolumler: [
    /* ═══ 1 · EKŞİ ANI — Kızıl tek başına ═══ */
    {
      kod: 'eksi', ad: 'Tek başına', baslik: 'Hop, bir daha hop', asamaSonu: '“Zaten ekşiydi!”',
      renk: '#D9793A', acik: '#F8DFC9', gok: '#FBEFE2', zemin: '#E3C28F',
      hikaye: 'Kızıl salkımı gözüne kestirdi. Uzandı, zıpladı, taş yığdı… Her denemede biraz yaklaşıyor ama sabrı çabuk tükeniyor. İlk denemelerinde ona eşlik edelim.',
      soz: '“Hop! Bir daha! Hop!”',
      karakter: { kod: 'tilki-kizil', ad: 'Kızıl', tur: 'Tilki' },
      sozler: [ 'Ben Kızıl! O salkıma bir zıplayışta yetişirim!', 'Hop! Biraz daha yükseğe!', 'Olmadı… ama bu da bir deneme sayılır!' ],
      armagan: { kod: 'uzum-yesil', ad: 'Ham salkım', renk: '#9CC46A' },
      engeller: [
        { engel: 'Bağda Kızıl’ı izleyen biri var.',
          sahne: { tip: 'gelis', nesne: 'uzum-yaprak', adet: 5, kisi: 'tilki-kizil', dekor: ['uzum-asma', 'uzum-yaprak', 'agac'],
            metin: 'Kızıl bağa girdi, burnuna tatlı bir koku geldi. Kimse yok sanıyor ama yaprakların arasından onu izleyen üç çift göz var.', soz: 'Burada kimse yok… değil mi?' }, gorev: 'gizli',
          yonerge: 'Yaprakların arasına iyi bakalım; Kızıl’ı izleyen üç dostu bulalım.',
          tohum: 53, sus: 26, susBoy: [4, 8], boy: 12,
          gizli: [ { sekil: 'sincap-fistik', ad: 'Sincap', x: 20, y: 60, a: -8 },
                   { sekil: 'kirpi-yumak', ad: 'Kirpi', x: 76, y: 32, a: 6 },
                   { sekil: 'ari-vizvi', ad: 'Arı', x: 50, y: 76, a: 10 } ],
          cozum: 'Sincap, kirpi ve arı bulundu. Üçü de gülümsüyor: “Biz buradayız, Kızıl!”' },
        { engel: 'Salkım rüzgârda sallanıyor.',
          sahne: { tip: 'sorun', nesne: 'uzum-yesil', adet: 3, kisi: 'tilki-kizil', dekor: ['uzum-asma', 'uzum-yaprak', 'ot'],
            metin: 'Kızıl parmak uçlarında yükseldi, patisini uzattı. Tam o sırada rüzgâr esti; salkımlar bir sağa bir sola sallanmaya başladı.', soz: 'Dur, kaçma! Yakalayacağım!' }, gorev: 'isabet',
          yonerge: 'Salkımlar rüzgârda sallanıyor. Gezinen salkımlara tam üstünden dokun.',
          sekil: 'uzum-yesil', hedef: 7, adet: 4, hiz: .7, boy: 12,
          cozum: 'Kızıl’ın patisi salkımlara değdi ama koparmaya yetmedi. Yine de ilk deneme tamam!' },
        { engel: 'Zıplamanın tam zamanı ne zaman?',
          sahne: { tip: 'istek', nesne: 'uzum-yesil', adet: 3, kisi: 'tilki-kizil', dekor: ['uzum-asma', 'bulut', 'ot'],
            metin: 'Salkım bir görünüyor bir yaprakların arkasına saklanıyor. Kızıl dizlerini büktü: tam salkım aşağı sarktığında zıplayacak.', soz: 'Salkımı görünce bana söyleyin!' }, gorev: 'refleks',
          yonerge: 'Resimler hızlı hızlı geçiyor. Yalnızca salkım görünce dokun; başka bir şey gelirse elini çek.',
          /* 4 doğru dokunuş. Aranan yazı-tura ile geliyor; 7'de (1250 ms) bir
             oyun ortalama ~18 sn sürüyor ve ortak çözücünün ~19 sn'lik tur
             bütçesini her dört koşudan birinde aşıyordu (test 6/7'de, sonra
             5 ile 4/5'te kaldı). 4 ile ortalama ~9 sn; asıl beceri olan
             "çeldiriciye dokunmamak" aynen duruyor. */
          hedef: 4, gorunme: 1150, ara: 250,
          aranan: { sekil: 'uzum-yesil', ad: 'Salkım' },
          digerleri: [ { sekil: 'uzum-yaprak', ad: 'Yaprak' }, { sekil: 'bulut', ad: 'Bulut' }, { sekil: 'kus', ad: 'Serçe' } ],
          cozum: 'Kızıl tam zamanında zıpladı. Salkıma bir burun boyu kaldı!' },
        { engel: 'Kızıl taşları üst üste koyacak.',
          sahne: { tip: 'sorun', nesne: 'kaya2', adet: 4, kisi: 'tilki-kizil', dekor: ['tas', 'uzum-asma', 'ot'],
            metin: 'Kızıl bir fikir buldu: taşları üst üste koyup üstüne çıkacak. Ama küçük taşı alta koyunca yığın tıkırdayıp devrildi.', soz: 'Hangisi alta, hangisi üste?' }, gorev: 'sirala',
          yonerge: 'Taşları küçükten büyüğe dizelim; en büyüğü en alta gidecek.',
          ogeler: [ { ad: 'En küçük', sekil: 'kaya1' }, { ad: 'Küçük', sekil: 'kaya2' },
                    { ad: 'Büyük', sekil: 'kaya3' }, { ad: 'En büyük', sekil: 'kaya4' } ],
          cozum: 'Taşlar sıraya girdi. Kızıl üstüne çıktı… salkıma yine bir karış kaldı.' },
        { engel: 'Kızıl duvardan atlamayı deneyecek.',
          sahne: { tip: 'kesif', nesne: 'tas', adet: 4, kisi: 'tilki-kizil', dekor: ['tas', 'uzum-diken', 'agac'],
            metin: 'Bağın kenarında eski bir taş duvar var. Kızıl düşündü: duvarın üstünden koşup atlarsa belki salkıma uzanabilir. Ama yol dikenli çalılarla dolu.', soz: 'Dikenlere değmeden duvara varabilir miyim?' }, gorev: 'yol',
          yonerge: 'Dikenli çalılara değmeden Kızıl’ı taş duvara götürelim.',
          baslangic: { x: 105, y: 220, sekil: 'tilki-kizil', ad: 'Kızıl' },
          bitis: { x: 900, y: 220, sekil: 'tas', ad: 'Taş duvar' },
          engeller: [ { x: 400, y: 130, r: 88, sekil: 'uzum-diken', ad: 'Dikenli çalı' },
                      { x: 620, y: 320, r: 88, sekil: 'uzum-diken', ad: 'Dikenli çalı' } ],
          cozum: 'Kızıl duvara vardı, koştu, atladı… ve yumuşacık otların üstüne kondu. Salkım hâlâ yukarıda.' },
        { engel: 'Kızıl asmayı sarstı, yapraklar döküldü.',
          sahne: { tip: 'sorun', nesne: 'uzum-yaprak', adet: 6, kisi: 'tilki-kizil', dekor: ['uzum-asma', 'uzum-yaprak', 'ot'],
            metin: 'Kızıl sabırsızlandı, çardağın direğini iki patisiyle sarstı. Salkım düşmedi; yalnızca yapraklar dökülüp her yere saçıldı.', soz: 'Eyvah, bağı dağıttım!' }, gorev: 'yakala',
          yonerge: 'Yapraklar yukarıdan düşüyor. Parmağını aşağıda gezdir, sepeti kaydır ve yakala.',
          hedef: 8, hiz: .18, sikayet: 1150, iyi: [ 'uzum-yaprak', 'yaprak' ], kotu: [],
          cozum: 'Yapraklar sepete toplandı; bağ yine derli toplu. Ama Kızıl çok yoruldu.' }
      ],
      final: { engel: 'Kızıl “Zaten ekşiydi!” deyip arkasını döndü.',
               sahne: { tip: 'istek', nesne: 'uzum-yesil', adet: 3, kisi: 'tilki-kizil', dekor: ['uzum-asma', 'uzum-yaprak', 'tas'],
               metin: 'Kızıl yere oturdu, burnunu havaya dikti. “Ben o üzümü zaten istemiyordum. Kesin ekşidir!” dedi. Ama kuyruğu yere düşmüş, gözleri hâlâ salkımda.', soz: 'Zaten ekşiydi… herhalde.' }, etkinlik: 'sev',
               cozum: 'Kızıl biraz yumuşadı. “Belki… belki bir daha denerim,” dedi. Tam o sırada ceviz ağacından biri seslendi.' }
    },

    /* ═══ 2 · ALIŞTIRMA — Fıstık ile yeniden denemek ═══ */
    {
      kod: 'alistirma', ad: 'Alıştırma', baslik: 'Her gün biraz daha', asamaSonu: '“Yarın bir daha deneriz!”',
      renk: '#B8743A', acik: '#F2DEC7', gok: '#F8EEE1', zemin: '#D8B98C',
      hikaye: 'Ceviz ağacından Fıstık indi. “Ben de ilk zıpladığımda dala yetişemezdim,” dedi. “Düştüm, kalktım, her gün biraz alıştırma yaptım.” Kızıl kulaklarını dikti: yeniden denemek mi?',
      soz: '“Düşmek de denemenin bir parçası.”',
      karakter: { kod: 'sincap-fistik', ad: 'Fıstık', tur: 'Sincap' },
      sozler: [ 'Ben Fıstık! Gel, birlikte alıştırma yapalım.', 'Gördün mü? Her denemede biraz daha iyi!', 'Bugünlük bu kadar. Yarın yine deneriz!' ],
      armagan: { kod: 'uzum-ceviz', ad: 'Ceviz', renk: '#A57A4A' },
      engeller: [
        { engel: 'Fıstık dal dal zıplıyor.',
          sahne: { tip: 'gelis', nesne: 'uzum-ceviz', adet: 3, kisi: 'sincap-fistik', dekor: ['agac', 'uzum-yaprak', 'uzum-ceviz'],
            metin: 'Fıstık ceviz ağacının dalları arasında zıplamaya başladı: bir dal, bir dal daha, hop! Kızıl onu izliyor; nasıl yaptığını görmek istiyor.', soz: 'Gözünü benden ayırma!' }, gorev: 'takip',
          yonerge: 'Fıstık dalların arasında zıplıyor. Parmağını üstüne koy ve kaldırmadan takip et.',
          sekil: 'sincap-fistik', sure: 5200, hiz: .75, boy: 14,
          cozum: 'Kızıl gördü: Fıstık zıplamadan önce hep bir an duruyor ve dalına bakıyor.' },
        { engel: 'Alıştırma taşları bir düzene göre dizilmiş.',
          sahne: { tip: 'kesif', nesne: 'tas', adet: 5, kisi: 'sincap-fistik', dekor: ['tas', 'uzum-yaprak', 'ot'],
            metin: 'Fıstık yere bir alıştırma yolu dizdi: bir taş, bir yaprak, bir taş, bir yaprak… Taşın üstünde zıplanır, yaprakta durulur. Ama arada iki boşluk var.', soz: 'Buraya hangisi gelecek?' }, gorev: 'oruntu',
          yonerge: 'Sıraya bak: taş, yaprak, taş, yaprak… Boşluğa hangisi geliyor?',
          dizi: [ 'tas', 'uzum-yaprak', 'tas', 'uzum-yaprak', null, null, 'tas' ],
          cevaplar: [ 'tas', 'uzum-yaprak' ],
          secenekler: [ { sekil: 'tas', ad: 'Taş' }, { sekil: 'uzum-yaprak', ad: 'Yaprak' }, { sekil: 'uzum-ceviz', ad: 'Ceviz' } ],
          cozum: 'Alıştırma yolu tamam. Kızıl hop-dur, hop-dur diye sonuna kadar gitti.' },
        { engel: 'Fıstık yukarıdan ceviz atıyor.',
          sahne: { tip: 'istek', nesne: 'uzum-ceviz', adet: 5, kisi: 'sincap-fistik', dekor: ['agac', 'uzum-ceviz', 'ot'],
            metin: 'Fıstık dalın üstüne çıktı: “Ben ceviz atacağım, sen sepetle tut. Gözün yukarıda, patin aşağıda!” Kızıl sepeti kaptı.', soz: 'Hazır mısın? Geliyor!' }, gorev: 'yakala',
          yonerge: 'Cevizler yukarıdan düşüyor. Parmağını aşağıda gezdir, sepeti kaydır ve yakala.',
          hedef: 8, hiz: .19, sikayet: 1100, iyi: [ 'uzum-ceviz', 'palamut' ], kotu: [],
          cozum: 'Sepet cevizle doldu. Kızıl ilk kez gülümsedi: “Bu iş alıştırmayla oluyor!”' },
        { engel: 'Fıstık’ın zıplama tekerlemesi.',
          sahne: { tip: 'istek', nesne: 'uzum-ceviz', adet: 4, kisi: 'sincap-fistik', dekor: ['agac', 'tas', 'uzum-yaprak'],
            metin: 'Fıstık bir tekerleme biliyor. Her hareketin bir sesi var: bak, eğil, zıpla, tut! Sırayı karıştırmayan dala hep yetişirmiş.', soz: 'Dinle ve aynı sırayla yap!' }, gorev: 'dizi',
          yonerge: 'Hareketler sırayla gösteriliyor. Dinleyip aynı sırayla dokunalım.',
          dostlar: [ { sekil: 'sincap-fistik', ad: 'Bak' }, { sekil: 'tilki-kizil', ad: 'Eğil' },
                     { sekil: 'kus', ad: 'Zıpla' }, { sekil: 'uzum-ceviz', ad: 'Tut' } ],
          uzunluklar: [ 3, 4 ],
          cozum: 'Bak, eğil, zıpla, tut! Kızıl tekerlemeyi ezberledi, dala ilk kez yetişti.' },
        { engel: 'Fıstık cevizlerini nereye sakladı?',
          sahne: { tip: 'kesif', nesne: 'uzum-ceviz', adet: 5, kisi: 'sincap-fistik', dekor: ['agac', 'yaprak', 'uzum-ceviz'],
            metin: 'Fıstık kış için cevizlerini yaprakların altına saklamış ama nerelere sakladığını unutmuş. “Hatırlamak da alıştırmayla olur,” dedi.', soz: 'Hangisi neredeydi?' }, gorev: 'cift',
          yonerge: 'Yapraklar kapalı duruyor. İki yaprak çevir, aynıysa açık kalır. Yerlerini aklında tut.',
          cift: [ 'uzum-ceviz', 'palamut', 'kozalak', 'elma', 'uzum-yaprak', 'uzum-yesil' ],
          cozum: 'Bütün eşler bulundu. Fıstık’ın cevizleri yerli yerinde.' },
        { engel: 'Akşam oldu, ilk yıldızlar çıktı.',
          sahne: { tip: 'cozuldu', nesne: 'yildiz', adet: 5, kisi: 'sincap-fistik', dekor: ['agac', 'bulut', 'uzum-asma'],
            metin: 'Gün boyu alıştırma yaptılar. Şimdi çimenlere uzanıp gökyüzüne bakıyorlar. Fıstık yıldızları gösteriyor: “Bak, hangileri parlıyor?”', soz: 'Parlayanları aklında tut!' }, gorev: 'takimyildiz',
          yonerge: 'Yıldızlar tek tek parlıyor. Hangileri parladıysa aynılarına dokun.',
          nokta: 12, yanan: 4, tur: 2, bakma: 2400,
          cozum: 'Yıldızlar yerini buldu. Kızıl esnedi: “Yarın salkımı bir daha deneyeceğim.”' }
      ],
      final: { engel: 'Fıstık’ın kuyruğu dikenlerle doldu.',
               sahne: { tip: 'cozuldu', nesne: 'uzum-ceviz', adet: 4, kisi: 'sincap-fistik', dekor: ['agac', 'uzum-yaprak', 'ot'],
               metin: 'Bütün gün dallarda, çalılarda, taşlarda zıpladılar. Fıstık’ın gür kuyruğuna dikenli tohumlar takılmış; kuyruk kabarık bir yumak olmuş.', soz: 'Kuyruğumu tarar mısınız?' }, etkinlik: 'timarla',
               cozum: 'Fıstık’ın kuyruğu yine yumuşacık. “Yarın bir daha deneriz!” dedi Kızıl. Bu sözü ilk kez kendisi söyledi.' }
    },

    /* ═══ 3 · SANDIK KULE — Yumak ile sabır ve yardım ═══ */
    {
      kod: 'sandik', ad: 'Sandık kule', baslik: 'Yardım istemek', asamaSonu: 'Sandıklar ve bir merdiven!',
      renk: '#9C7A4E', acik: '#EEE1CC', gok: '#F5EEE3', zemin: '#CDB48C',
      hikaye: 'Kızıl ne kadar alıştırma yapsa da salkım bir tilki boyundan yüksek. Yavaş yavaş yürüyen Yumak geldi: “Tek başına yetişemiyorsan, yardım iste. Acele etme; sandık üstüne sandık koyarız.”',
      soz: '“Yavaş yavaş giden de varır.”',
      karakter: { kod: 'kirpi-yumak', ad: 'Yumak', tur: 'Kirpi' },
      sozler: [ 'Ben Yumak. Acele yok; önce bir nefes alalım.', 'Bak, sandıklar yükseliyor. Sabır iyi gelir.', 'Kule hazır, merdiven de. Yardım istemek iyi fikirdi!' ],
      armagan: { kod: 'uzum-sandik', ad: 'Sandık', renk: '#C69558' },
      engeller: [
        { engel: 'Bağ evinin önünde boş sandıklar var.',
          sahne: { tip: 'gelis', nesne: 'uzum-sandik', adet: 5, kisi: 'kirpi-yumak', dekor: ['uzum-sandik', 'uzum-asma', 'ot'],
            metin: 'Yumak, Kızıl’ı bağ evinin önüne götürdü. Hasat için getirilmiş boş sandıklar orada duruyor. “Beş tane yeter,” dedi Yumak.', soz: 'Birlikte taşıyalım mı?' }, gorev: 'say',
          yonerge: 'Sandıkları birlikte taşıyalım; birer birer çardağa götürelim.',
          sayi: 5, sekil: 'uzum-sandik',
          cozum: 'Beş sandık çardağın altında. Kızıl tek başına bunu yapamazdı.' },
        { engel: 'Sandık kule bir yana yatıyor.',
          sahne: { tip: 'sorun', nesne: 'uzum-sandik', adet: 4, kisi: 'kirpi-yumak', dekor: ['uzum-sandik', 'uzum-asma', 'tas'],
            metin: 'Kızıl sandıkları hemen üst üste yığdı. Kule bir yana yattı, sallandı. Yumak sakin sakin söyledi: “Önce iki yanı eşitleyelim.”', soz: 'Acele eden yorulur.' }, gorev: 'terazi',
          yonerge: 'Sağ kefeye ekleyip iki yanı eşitleyelim. Fazla gelirse geri alırız.',
          sol: [ { sekil: 'uzum-sandik', agirlik: 3 }, { sekil: 'uzum-sandik', agirlik: 2 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 } ],
          cozum: 'Kule dimdik duruyor. Kızıl ilk sandığa çıktı, sonra ikincisine.' },
        { engel: 'Yumak’ın dikenlerinden bir şey düşmüş.',
          sahne: { tip: 'kesif', nesne: 'elma', adet: 3, kisi: 'kirpi-yumak', dekor: ['uzum-yaprak', 'elma', 'ot'],
            metin: 'Yumak yolda ne bulursa dikenlerine takıp taşır: elma, yaprak, ceviz, çiçek, salkım. Sandık taşırken biri düşmüş. Hangisi?', soz: 'Bir şeyim eksik gibi…' }, gorev: 'kayip',
          yonerge: 'Yumak’ın sırtına iyi bakalım. Gözümüzü kapayıp açınca ne eksildi, bulalım.',
          tur: 2,
          ogeler: [ { ad: 'Elma', sekil: 'elma' }, { ad: 'Yaprak', sekil: 'uzum-yaprak' },
                    { ad: 'Ceviz', sekil: 'uzum-ceviz' }, { ad: 'Çiçek', sekil: 'uzum-cicek' },
                    { ad: 'Salkım', sekil: 'uzum-yesil' } ],
          cozum: 'Eksilen bulundu. Yumak gülümsedi: “Yardım edince her şey çabuk bulunuyor.”' },
        { engel: 'Kule yetmedi; eski merdiven kırık.',
          sahne: { tip: 'sorun', nesne: 'uzum-merdiven', adet: 3, kisi: 'kirpi-yumak', dekor: ['uzum-sandik', 'uzum-merdiven', 'ot'],
            metin: 'Kızıl en üst sandığa çıktı, uzandı… salkıma bir patilik yol kaldı. Yumak bağ evinin arkasında eski bir merdiven hatırladı. Ama merdivenin parçaları dağılmış.', soz: 'Parçaları birleştirebilir miyiz?' }, gorev: 'yapboz',
          yonerge: 'Parçaları yerine koyup merdivenin resmini tamamlayalım.',
          resim: 'uzum-merdiven', satir: 2, sutun: 3,
          cozum: 'Merdiven tamam! Yumak basamakları tek tek yokladı: hepsi sağlam.' },
        { engel: 'Merdiveni çardağa taşıyalım.',
          sahne: { tip: 'gelis', nesne: 'uzum-merdiven', adet: 2, kisi: 'kirpi-yumak', dekor: ['uzum-asma', 'uzum-kovan', 'ot'],
            metin: 'Merdiven uzun, yol dar. Asma sıraları ve arı kovanları arasından geçmek gerek. Yumak önden gidiyor, Kızıl arkadan tutuyor.', soz: 'Kovanlara çarpmayalım!' }, gorev: 'yol',
          yonerge: 'Asmalara ve kovanlara değmeden merdiveni çardağa götürelim.',
          baslangic: { x: 100, y: 220, sekil: 'kirpi-yumak', ad: 'Yumak' },
          bitis: { x: 905, y: 220, sekil: 'uzum-asma', ad: 'Çardak' },
          engeller: [ { x: 330, y: 120, r: 86, sekil: 'uzum-asma', ad: 'Asma' },
                      { x: 420, y: 330, r: 82, sekil: 'uzum-kovan', ad: 'Kovan' },
                      { x: 640, y: 160, r: 88, sekil: 'uzum-asma', ad: 'Asma' },
                      { x: 700, y: 360, r: 78, sekil: 'uzum-kovan', ad: 'Kovan' } ],
          cozum: 'Merdiven çardağa yaslandı. Sandık kulenin yanında, dimdik.' },
        { engel: 'Herkesin bir işi var.',
          sahne: { tip: 'istek', nesne: 'kalp', adet: 3, kisi: 'kirpi-yumak', dekor: ['uzum-merdiven', 'uzum-asma', 'uzum-sandik'],
            metin: 'Kızıl merdivene çıkmadan durdu. “Tek başıma yapamam,” dedi, “bana yardım eder misiniz?” Yumak sevindi: “İşte en zor basamak buydu.” Şimdi kim ne yapacak?', soz: 'Kim neyi iyi yapar?' }, gorev: 'eslestir',
          yonerge: 'Her dostu en iyi yaptığı işle eşleştirelim.',
          ciftler: [ { a: 'Fıstık', asekil: 'sincap-fistik', b: 'Ağaca tırmanır', bsekil: 'agac' },
                     { a: 'Yumak', asekil: 'kirpi-yumak', b: 'Sırtında taşır', bsekil: 'elma' },
                     { a: 'Vızvız', asekil: 'ari-vizvi', b: 'Çiçeği bulur', bsekil: 'uzum-cicek' },
                     { a: 'Kızıl', asekil: 'tilki-kizil', b: 'Kokuyu alır', bsekil: 'uzum-salkim' } ],
          cozum: 'Herkes işini aldı. Fıstık merdivenin tepesini, Yumak dibini tutacak; Kızıl çıkacak.' }
      ],
      final: { engel: 'Yumak bütün gün sandık taşıdı.',
               sahne: { tip: 'cozuldu', nesne: 'uzum-sandik', adet: 4, kisi: 'kirpi-yumak', dekor: ['uzum-sandik', 'uzum-merdiven', 'uzum-asma'],
               metin: 'Sandık kule ve merdiven çardağın altında hazır. Yumak yavaşça yere çöktü; dikenleri bile yorulmuş. Kirpiler dikenli olsa da sevilmeyi çok sever.', soz: 'Başımı okşar mısınız? Yavaşça ama.' }, etkinlik: 'sev',
               cozum: 'Yumak mutlu mutlu kıvrıldı. Kızıl merdivenin ilk basamağına ayağını koydu. Ama salkım hâlâ yeşil…' }
    },

    /* ═══ 4 · HASAT — Vızvız ile beklemek ve paylaşmak ═══ */
    {
      kod: 'hasat', ad: 'Hasat', baslik: 'Tatlı mı, ekşi mi?', asamaSonu: 'Salkıma ulaştık!',
      renk: '#7B4F9D', acik: '#E8DDF1', gok: '#F3EEF6', zemin: '#C9B6D6',
      hikaye: 'Vızvız vızıldayarak geldi: “Dur, dur! Bu salkım daha yeşil, gerçekten ekşi. Birkaç gün güneş görsün, mor olsun; ben tatlısını bilirim.” Beklediler. Ve bir sabah bütün bağ mor oldu.',
      soz: '“Beklemek de denemenin bir parçası.”',
      karakter: { kod: 'ari-vizvi', ad: 'Vızvız', tur: 'Bal arısı' },
      sozler: [ 'Vız vız! Ben Vızvız. Tatlıyı ben bulurum!', 'Olgun olanlar mor ve tatlı kokuyor.', 'Herkese yetti! Paylaşınca daha tatlı.' ],
      armagan: { kod: 'uzum-sepet', ad: 'Üzüm sepeti', renk: '#7B4F9D' },
      engeller: [
        { engel: 'Hangi salkım olgun?',
          sahne: { tip: 'kesif', nesne: 'uzum-salkim', adet: 4, kisi: 'ari-vizvi', dekor: ['uzum-asma', 'uzum-cicek', 'uzum-yaprak'],
            metin: 'Vızvız çardağın çevresinde dönüyor, salkımları tek tek kokluyor. “Bilmecelerimi bilirsen,” dedi, “tatlı salkımı da bulursun.”', soz: 'Hangisi ötekilere benzemiyor?' }, gorev: 'fark',
          yonerge: 'Her bilmecede bir tanesi ötekilere benzemiyor. Onu birlikte bulalım.',
          turlar: [
            { soru: 'Hangisi olgun?', digerleri: [ { ad: 'Yeşil salkım', sekil: 'uzum-yesil' }, { ad: 'Yeşil salkım', sekil: 'uzum-yesil' }, { ad: 'Yeşil salkım', sekil: 'uzum-yesil' } ],
              yabanci: { ad: 'Mor salkım', sekil: 'uzum-salkim' }, neden: 'Mor salkım güneşi çok görmüş; olgun ve tatlı.' },
            { soru: 'Hangisi uçabilir?', digerleri: [ { ad: 'Kızıl', sekil: 'tilki-kizil' }, { ad: 'Yumak', sekil: 'kirpi-yumak' }, { ad: 'Fıstık', sekil: 'sincap-fistik' } ],
              yabanci: { ad: 'Vızvız', sekil: 'ari-vizvi' }, neden: 'Vızvız bir arı; kanatlarıyla uçar.' },
            { soru: 'Hangisi yenmez?', digerleri: [ { ad: 'Üzüm', sekil: 'uzum-salkim' }, { ad: 'Elma', sekil: 'elma' }, { ad: 'Ceviz', sekil: 'uzum-ceviz' } ],
              yabanci: { ad: 'Sandık', sekil: 'uzum-sandik' }, neden: 'Sandık yenmez; içine üzüm konur.' }
          ],
          cozum: 'Üç bilmece de bilindi. Vızvız en tepedeki salkımın üstüne kondu: “İşte bu!”' },
        { engel: 'Vızvız en tatlı salkıma uçuyor.',
          sahne: { tip: 'gelis', nesne: 'uzum-cicek', adet: 4, kisi: 'ari-vizvi', dekor: ['uzum-asma', 'uzum-cicek', 'uzum-yaprak'],
            metin: 'Vızvız havalandı, salkımdan salkıma, çiçekten çiçeğe uçuyor. Onu gözden kaçırmazsak en tatlı salkımı bize gösterecek.', soz: 'Peşimden gelin, vız vız!' }, gorev: 'takip',
          yonerge: 'Vızvız uçuyor. Parmağını üstüne koy ve gözden kaçırmadan takip et.',
          sekil: 'ari-vizvi', sure: 5400, hiz: .85, boy: 13,
          cozum: 'Vızvız en tepedeki salkıma kondu. Kızıl merdivene çıktı, Fıstık tepeyi tuttu, Yumak dibi.' },
        { engel: 'Salkımlar dalda sallanıyor.',
          sahne: { tip: 'istek', nesne: 'uzum-salkim', adet: 4, kisi: 'tilki-kizil', dekor: ['uzum-merdiven', 'uzum-asma', 'uzum-yaprak'],
            metin: 'Kızıl merdivenin tepesinde! Salkımlar karşısında sallanıyor; bu kez patisi yetişiyor. Tek yapması gereken salkımı tam ortasından tutmak.', soz: 'Bu kez yetişiyorum!' }, gorev: 'isabet',
          yonerge: 'Olgun salkımlar sallanıyor. Gezinen salkımlara tam üstünden dokun.',
          sekil: 'uzum-salkim', hedef: 7, adet: 4, hiz: .7, boy: 12,
          cozum: 'Salkımlar bir bir sepete indi. Kızıl merdivenden sevinçle seslendi: “Yetiştim!”' },
        { engel: 'Hasat herkese eşit paylaşılacak.',
          sahne: { tip: 'istek', nesne: 'uzum-salkim', adet: 6, kisi: 'tilki-kizil', dekor: ['uzum-sepet', 'uzum-asma', 'uzum-sandik'],
            metin: 'Sepetler üzümle doldu. Kızıl bir an durdu: “Bunları tek başıma toplayamazdım. Hepimizin hakkı var.” Dört dost sofraya oturdu.', soz: 'Herkese eşit düşsün!' }, gorev: 'paylas',
          yonerge: 'Salkımları dört dosta eşit paylaştıralım; kimse eksik kalmasın.',
          dostlar: [ { sekil: 'tilki-kizil', ad: 'Kızıl' }, { sekil: 'sincap-fistik', ad: 'Fıstık' },
                     { sekil: 'kirpi-yumak', ad: 'Yumak' }, { sekil: 'ari-vizvi', ad: 'Vızvız' } ],
          yem: 'uzum-salkim', yemAd: 'Salkım', adet: 12,
          cozum: 'Dördüne de eşit düştü. Kızıl ilk taneyi tattı… ve gözleri kocaman oldu: “Tatlıymış!”' },
        { engel: 'Vızvız sevinç dansı yapıyor.',
          sahne: { tip: 'cozuldu', nesne: 'uzum-cicek', adet: 5, kisi: 'ari-vizvi', dekor: ['uzum-kovan', 'uzum-cicek', 'uzum-asma'],
            metin: 'Arılar sevinince dans eder; dansla bulduklarının yerini anlatır. Vızvız bir sağa, bir sola döndü ve bağın hazinelerini yaprakların altına sakladı.', soz: 'Nereye sakladım, bil bakalım!' }, gorev: 'cift',
          yonerge: 'Yapraklar kapalı duruyor. İki yaprak çevir, aynıysa açık kalır. Vızvız’ın sakladıklarının yerini aklında tut.',
          cift: [ 'uzum-cicek', 'uzum-salkim', 'uzum-kovan', 'uzum-sepet', 'uzum-yaprak', 'elma' ],
          cozum: 'Bütün eşler bulundu. Vızvız bir tur daha döndü; Kızıl bile kuyruğunu sallayarak dansa katıldı.' },
        { engel: 'Üzüm çekirdekleri toprağa ekilecek.',
          sahne: { tip: 'gelis', nesne: 'tohum', adet: 4, kisi: 'ari-vizvi', dekor: ['toprak', 'uzum-asma', 'kus'],
            metin: 'Üzümler afiyetle bitti, geriye çekirdekler kaldı. Yumak bir fikir buldu: “Bunları ekelim, yeni asmalar büyüsün.” Bağın serçesi çekirdekleri tek tek taşımaya gönüllü oldu.', soz: 'Tam toprağın üstünde bırakalım!' }, gorev: 'zaman',
          yonerge: 'Serçe çekirdeği taşıyor. Tam toprağın üstündeyken düğmeye basalım; acelemiz yok.',
          tasiyici: 'kus', tasiyiciAd: 'Serçe', yuk: 'tohum',
          hedef: 'toprak', hedefAd: 'Yeni bağ', genislik: 30, hiz: 1.05, hedefSayisi: 3,
          cozum: 'Çekirdekler toprakta. Gelecek yıl yeni asmalar olacak; bu kez biraz daha alçak!' }
      ],
      final: { engel: 'Vızvız’ın tüyleri üzüm suyuna bulandı.',
               sahne: { tip: 'cozuldu', nesne: 'uzum-salkim', adet: 5, kisi: 'ari-vizvi', dekor: ['uzum-sepet', 'uzum-asma', 'uzum-cicek'],
               metin: 'Sofra bitti. Herkes doydu, herkes güldü. Vızvız sepetin içine dalıp çıkmış; tüyleri üzüm suyuyla yapış yapış olmuş.', soz: 'Tüylerimi fırçalar mısınız?' }, etkinlik: 'timarla',
               cozum: 'Vızvız tertemiz oldu ve bağın üstünde bir tur attı. Kızıl gülümsedi: “Ekşi dediğim üzüm meğer ne tatlıymış.”' }
    }
  ],

  kapanis: {
    baslik: 'Ekşi dediği üzüm, tatlıymış.',
    metin: 'Kızıl o gün bir şey öğrendi: yetişemediği bir şeye “zaten ekşi” demek kolaydı ama doğru değildi. Bir daha denemek, sabretmek ve “Bana yardım eder misiniz?” demek onu salkıma kadar götürdü.\n\nO akşam dört dost çardağın altında üzümleri paylaştı. Ertesi sabah Kızıl tepede küçük, yeşil bir salkım daha gördü. “Bu daha ham,” dedi gülerek. “Olgunlaşınca birlikte toplarız.”',
    ders: 'Yetişemediğini küçümseme; yeniden dene, yardım iste.'
  }
};

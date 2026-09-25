/* MASAL — YALANCI ÇOBAN (Ezop)
   ────────────────────────────
   Kaynak kamu malı: Ezop (~MÖ 600). Metin bize ait, çeviri değil.

   NEDEN 40 DAKİKA TAŞIR: Fablın kendisi üç bağırıştan ibaret. Ama bir
   çobanın günü iş dolu (su, ot, süt, yün, çit) ve masalın asıl konusu
   olan GÜVEN tek seferde kaybolup tek seferde gelmez. Sınıf bu yüzden
   dört bölümde güvenin yükselişini, sönüşünü, sınanışını ve yavaş
   yavaş onarılışını yaşar.

   FİNALİ YUMUŞATTIM: Ezop'ta kurt sürüyü dağıtır, bazı anlatımlarda
   çocuğu da yer. Burada kurt aç ve yalnız bir hayvandır, kimseye zarar
   vermez: Karabaş ile Oğuz kuzuları ağıla toplar, kurt köylülerin
   yaylada düşürdüğü tencere tava sesinden ürküp ormana döner. Ceza yok;
   Oğuz özür diler ve güveni her gün bir doğru sözle yeniden kurar.

   KURGU: güven. Tahta köyün gece görünüşüdür; her penceredeki fener
   köyün Oğuz'a güveni. Sayı HEP ARTMAZ: ikinci bölümde çocuklar görevi
   başarsa da şakalar yüzünden fenerler söner. */

/* Durakların haritadaki yeri: sürü sabah ağıldan çıkıp yaylaya (sol üst)
   gider, gözcü kayasının eteğinden (sağ üst) geçer, orman kenarındaki
   derenin boyunca iner (sağ alt) ve köyün sokağında kapı kapı dolaşarak
   biter (sol alt). Açık bir yol: halka değil, bir günün yürüyüşü.
   Her bölüm kendi kırık çizgisinin üstüne eşit aralıkla dizilir; sınıf
   mevcudu ne olursa olsun (4–28) duraklar birbirinden ≥1.6 birim uzak. */
const YOL = [
  [[-4.9, -.9], [-8.3, -1.9], [-10.3, -4.7], [-8.7, -7.6], [-5.1, -8.0], [-1.9, -6.7]],   // yayla
  [[-1.9, -6.7], [1.7, -7.9], [5.0, -7.5], [7.4, -5.3], [8.4, -2.2]],                     // gözcü kayası eteği
  [[8.4, -2.2], [10.0, 1.3], [9.5, 4.6], [6.8, 6.4], [3.6, 7.7]],                         // dere ve orman kenarı
  [[3.6, 7.7], [.2, 6.8], [-3.2, 6.3], [-6.4, 6.6], [-9.6, 5.8], [-10.8, 2.8]]            // köy sokağı
];
function cizgideNokta(cizgi, t) {
  const parca = cizgi.slice(1).map((p, i) => Math.hypot(p[0] - cizgi[i][0], p[1] - cizgi[i][1]));
  let kalan = t * parca.reduce((a, b) => a + b, 0);
  for (let i = 0; i < parca.length; i++) {
    if (kalan <= parca[i] || i === parca.length - 1) {
      const u = Math.min(1, kalan / parca[i]), [a, b] = [cizgi[i], cizgi[i + 1]];
      return { x: a[0] + (b[0] - a[0]) * u, z: a[1] + (b[1] - a[1]) * u };
    }
    kalan -= parca[i];
  }
  return { x: cizgi[0][0], z: cizgi[0][1] };
}
function yerlesim(duraklar) {
  const yerler = [];
  for (let b = 0; b < 4; b++) {
    const grup = duraklar.map((d, i) => ({ d, i })).filter(x => x.d.bolum === b);
    grup.forEach(({ i }, j) => { yerler[i] = cizgideNokta(YOL[b], (j + .5) / grup.length); });
  }
  return yerler;
}

export default {
  kod: 'coban',
  ad: 'Yalancı Çoban',
  kaynak: 'Ezop fablı',
  ders: 'Güven bir kere kırılınca yavaş yavaş onarılır',
  sure: '40 dakika · bütün sınıf',
  ozet: 'Yaylada sıkılan çoban Oğuz “Kurt geliyor!” diye şaka yapar. Kurt gerçekten gelince kimse inanmaz; köyün fenerlerini birlikte, yavaş yavaş yeniden yakarsınız.',
  renk: '#5F7FA6',
  ikon: 'coban-fener',

  /* KURGU: güven. Armağan torbası yok; köyün pencerelerindeki fenerler
     var. Yanar, söner, yeniden yanar. Üçüncü bölümde bir de sürü sayacı.
     Engellerdeki iki ek alan kurgu içindir:
       onem       hikâyenin omurgası (1 en önemli). Sınıf küçükse bölümün
                  bütün engelleri sığmaz; kurgu önce bunları seçer ki iki
                  şaka, kurdun gelişi ve özür hiçbir sınıfta eksik kalmasın.
       guvenNotu  ikinci bölümde görev başarıldığı hâlde fener NEDEN söndü:
                  tahtaya dönüşte bu cümle okunur. */
  kurgu: 'guven',
  guven: { fener: 12, kuzu: 12, koy: 'Yayla köyü' },

  /* Mekân: yayla. Ortada ağıl; sol altta fenerli köy evleri ve çan kulesi,
     sağ üstte tırmanılan gözcü kayası, sağ altta dere ve orman kenarı. */
  dunya: { mekan: 'yayla', gok: 0xd9e6ee, cevre: 0x9cbd7a, yol: 0xe9dcbc, cekirdek: 55021,
    yerlesim, yolKapali: false,
    piyonTur: 'coban-kopek', piyon: 0xe2bd86, piyonKarin: 0xf8ecd2, piyonIc: 0x2f2520,   // çocuk Karabaş olarak dolaşır
    /* Çözülen her durak yolun kenarına bir fener bırakır: köyün güveni
       inip çıksa da çocukların yaktığı fenerler sönmez. */
    izNotu: { bos: 'Yolda henüz fener yok', dolu: '{n} fener yandı · köy izliyor' },
    iz: 'coban-fener', izRenk: 0xf2c14e, kesifRenk: 0xe0a04a,
    kesif: [
      { x: 12.75, z: -9.45, ikon: 'tas', ad: 'Gözcü kayası',
        metin: 'Oğuz’un en sevdiği yer. Tepesinden bütün yayla, köyün damları, hatta ormanın ucu görünür. Kayanın dibinde küçük bir pınar kaynar; dere buradan doğar.' },
      { x: 0, z: 3.6, ikon: 'coban-agil', ad: 'Ağıl',
        metin: 'Ağılın çitini Oğuz’un dedesi çakmış. Kapısı hep güneye bakar: sabah güneşi kuzuları ilk burada ısıtsın diye. Geceleri Karabaş kapının önünde yatar.' },
      { x: -9.7, z: 8.7, ikon: 'coban-can', ad: 'Çan kulesi',
        metin: 'Köyün büyük çanı yalnızca önemli günlerde çalınır: düğünde, bayramda, bir de biri yardım istediğinde. Oğuz’un heybesindeki küçük çan bu büyük çanın yavrusu sayılır.' },
      { x: 13.4, z: 4.8, ikon: 'agac', ad: 'Orman kenarı',
        metin: 'Çam ormanı yaylanın bittiği yerde başlar. Kurtlar ormanın derinlerinde yaşar ve insanlardan çekinir. Yalnız, sürüsünden ayrı düşmüş genç bir kurt; o yüzden aç ve tek başına.' },
      { x: -6.2, z: 5.0, ikon: 'su', ad: 'Köy çeşmesi',
        metin: 'Köyün bütün haberleri çeşme başında konuşulur: kim ne gördü, kim ne dedi. Oğuz’un şakaları da buradan bütün köye yayıldı. Özrü de.' }
    ]},

  acilis: [
    { tag: 'BİR VARMIŞ, BİR YOKMUŞ', baslik: 'Bulutlara yakın bir yayla.', ikon: 'coban-ev',
      metin: 'Dağların arasında, bulutlara yakın bir yayla varmış. Yaylanın eteğinde küçük bir köy, köyün evlerinde her akşam yanan fenerler… Köylüler birbirine güvenir, kapılarını hiç kilitlemezmiş.' },
    { tag: 'KÜÇÜK ÇOBAN', baslik: 'Oğuz ilk kez sürüyü güdüyor.', ikon: 'coban-oguz',
      metin: 'Bu yaz köyün koyunlarını Oğuz otlatacak. Yanında çoban köpeği Karabaş, peşinde en küçük kuzu Bulut var. Köylüler ona bir söz vermiş: “Bir kurt görürsen bağır, hemen koşarız.”' },
    { tag: 'BU MASALIN KAHRAMANI SİZSİNİZ', baslik: 'Köyün fenerlerine iyi bakın.', ikon: 'coban-fener',
      metin: 'Her evin penceresinde bir fener var: bu fenerler köyün Oğuz’a güveni. Sırayla tahtaya gelip yaylada Oğuz’a yardım edeceğiz. Ama dikkat: bu masalda fenerler hep yanmaz. Bazen söner — ve yeniden yakmak zaman ister.' }
  ],

  bolumler: [
    {
      kod: 'yayla', ad: 'Yayla sabahı', baslik: 'Sürü yaylaya çıkıyor',
      guvenSonu: 'Köyün fenerleri yandı',
      renk: '#76A865', acik: '#DDEFC8', gok: '#EAF5E4', zemin: '#B9D98A',
      hikaye: 'Güneş doğarken Oğuz ağılın kapısını açtı. Karabaş havladı, kuzular sekerek çıktı. Yaylada bugün çok iş var: su, ot, süt, yün. Oğuz işini iyi yaptıkça köyün pencerelerinde fenerler bir bir yanıyor.',
      soz: '“Çoban sürüye, sürü çobana güvenir.”',
      karakter: { kod: 'koyun-bulut', ad: 'Bulut', tur: 'Kuzu' },
      sozler: [ 'Meee! Ben Bulut. Yaylaya ilk ben çıkacağım!', 'Mee! Oğuz ağabey bugün çok çalışkan!', 'Karnım zil çalıyor ama çok mutluyum!' ],
      armagan: { kod: 'coban-fener', ad: 'Yanan fener', renk: '#E7B04F' },
      engeller: [
        { engel: 'Oğuz yayla heybesini hazırlıyor.',
          sahne: { tip: 'gelis', nesne: 'coban-ekmek', adet: 4, kisi: 'coban-oguz', dekor: ['coban-ev', 'agac', 'ot'],
            metin: 'Horozlar öttü, Oğuz gözlerini ovuşturarak kalktı. Heybesine yayla için ne gerekiyorsa koyuyor. Ama uykulu gözle bir şeyi unutmak çok kolay.', soz: 'Kaval, su, bazlama… Hepsi tamam mı?' }, gorev: 'kayip',
          yonerge: 'Heybeye iyi bakalım. Gözümüzü kapayıp açınca ne eksildi, bulalım.',
          tur: 2,
          ogeler: [ { ad: 'Kaval', sekil: 'coban-kaval' }, { ad: 'Su', sekil: 'su' },
                    { ad: 'Bazlama', sekil: 'coban-ekmek' }, { ad: 'Çan', sekil: 'coban-can' },
                    { ad: 'Fener', sekil: 'coban-fener' } ],
          cozum: 'Heybe tamam. Oğuz sürüyü ağıldan çıkardı; köyden el sallayanlar var.' },
        { engel: 'Bulut susadı ama dereye giden yol dikenli.',
          sahne: { tip: 'istek', nesne: 'su', adet: 3, kisi: 'koyun-bulut', dekor: ['ot', 'tas', 'fidan'],
            metin: 'Güneş yükseldi, kuzular susadı. Bulut dereye koşmak istiyor ama yolda dikenli çalılar ve sivri kayalar var.', soz: 'Meee! Çok susadım!' }, gorev: 'yol',
          yonerge: 'Parmağını Bulut’un üstüne koy; dikenlere değmeden onu dereye götür.',
          baslangic: { x: 105, y: 220, sekil: 'koyun-bulut', ad: 'Bulut' }, bitis: { x: 900, y: 220, sekil: 'su', ad: 'Dere' },
          engeller: [ { x: 360, y: 140, r: 84, sekil: 'coban-diken', ad: 'Diken' },
                      { x: 560, y: 320, r: 84, sekil: 'tas', ad: 'Kaya' },
                      { x: 740, y: 150, r: 76, sekil: 'coban-diken', ad: 'Diken' } ],
          cozum: 'Bulut dereye vardı ve kana kana içti.' },
        { engel: 'Ağılın önündeki çıplak toprağa çayır tohumu serpilecek.',
          sahne: { tip: 'kesif', nesne: 'tohum', adet: 5, kisi: 'coban-oguz', dekor: ['toprak', 'ot', 'bulut'],
            metin: 'Geçen kış kar, ağılın önündeki otları alıp götürmüş. Bir serçe gagasında tohumla toprağın üstünde dolanıyor. Tam zamanında bırakırsa orası yeniden çayır olur.' }, gorev: 'zaman',
          yonerge: 'Serçe tam toprağın üstündeyken “Şimdi bırak!” düğmesine basalım.',
          tasiyici: 'kus', tasiyiciAd: 'Serçe', yuk: 'tohum',
          hedef: 'toprak', hedefAd: 'Çıplak toprak', genislik: 32, hiz: 1, hedefSayisi: 3,
          cozum: 'Tohumlar toprağa düştü; ağılın önü yakında yemyeşil olacak.' },
        { engel: 'Kırkılan yünler eşeğin iki yanına eşit yüklenmeli.',
          sahne: { tip: 'sorun', nesne: 'bulut', adet: 4, kisi: 'koyun-bulut', dekor: ['saman', 'ot', 'coban-agil'],
            metin: 'Yazın koyunların yünü kırkılır, köye indirilir. Ama heybenin bir yanı ağır gelirse eşek yan yatar, yünler yere dökülür.', soz: 'Mee, benim yünüm de orada!' }, gorev: 'terazi',
          yonerge: 'Sağ kefeye yün ekleyip terazi düzelene kadar deneyelim.',
          sol: [ { sekil: 'bulut', agirlik: 3 }, { sekil: 'bulut', agirlik: 2 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Büyük', agirlik: 3 }, { ad: 'Büyük', agirlik: 3 } ],
          cozum: 'İki heybe eşitlendi; eşek yükünü dengeyle taşıdı.' },
        { engel: 'Oğuz kavalıyla bir ezgi çalıyor; Bulut ezberlemek istiyor.',
          sahne: { tip: 'gelis', nesne: 'coban-kaval', adet: 3, kisi: 'coban-oguz', dekor: ['agac', 'ot', 'tas'],
            metin: 'Öğle gölgesinde Oğuz kavalını çıkardı. Ezgisi bir kaval sesi, bir çan sesi diye gidiyor. Bulut kulaklarını dikti.', soz: 'Dinle Bulut: kaval, çan, kaval, çan…' }, gorev: 'oruntu',
          yonerge: 'Sıraya bak: kaval, çan, kaval, çan… boşluklara hangisi geliyor?',
          dizi: [ 'coban-kaval', 'coban-can', 'coban-kaval', 'coban-can', null, null, 'coban-kaval' ],
          cevaplar: [ 'coban-kaval', 'coban-can' ],
          secenekler: [ { sekil: 'coban-kaval', ad: 'Kaval' }, { sekil: 'coban-can', ad: 'Çan' }, { sekil: 'coban-fener', ad: 'Fener' } ],
          cozum: 'Ezgi tamamlandı. Bulut bütün öğleden sonra aynı ezgiyle sekti.' },
        { engel: 'Akşam sütü üç komşuya eşit dağıtılacak.',
          sahne: { tip: 'istek', nesne: 'coban-sut', adet: 5, kisi: 'coban-oguz', dekor: ['coban-ev', 'agac', 'ot'],
            metin: 'Sürü akşam ağıla döndü, koyunlar sağıldı. Oğuz süt güğümlerini köye taşıyacak. Üç komşu bekliyor; birine az giderse sabah kahvaltısı eksik kalır.', soz: 'Herkese aynı pay, söz!' }, gorev: 'paylas',
          yonerge: 'Sütü üç eve eşit paylaştıralım; hiçbir kahvaltı eksik kalmasın.',
          dostlar: [ { sekil: 'coban-ev', ad: 'Ayşe Nine' }, { sekil: 'coban-ev', ad: 'Hasan Amca' }, { sekil: 'coban-ev', ad: 'Fadime Teyze' } ],
          yem: 'coban-sut', yemAd: 'Süt', adet: 9,
          cozum: 'Üç evin de kabı doldu. Komşular pencereden seslendi: “Sağ ol Oğuz!”' }
      ],
      final: { engel: 'Bulut bütün gün sekti, şimdi karnı zil çalıyor.',
               sahne: { tip: 'cozuldu', nesne: 'coban-fener', adet: 4, kisi: 'koyun-bulut', dekor: ['coban-ev', 'coban-agil', 'ot'],
               metin: 'İlk gün bitti. Köyün pencerelerinde fenerler bir bir yandı: “Oğuz sürüye iyi bakıyor,” diyorlar. Ağılda Bulut, Oğuz’un kepeneğini çekiştiriyor.', soz: 'Mee… Biraz ot kaldı mı?' }, etkinlik: 'besle',
               cozum: 'Bulut karnını doyurup kıvrıldı. Köylüler o akşam Oğuz’a güvenle “İyi geceler” dedi.' }
    },
    {
      kod: 'saka', ad: 'Kurt geliyor!', baslik: 'Oğuz sıkılıyor',
      guvenSonu: 'Fenerler birer birer söndü',
      renk: '#C98B4C', acik: '#F6DDBE', gok: '#FBEEDC', zemin: '#D9C37F',
      hikaye: 'Öğle oldu. Sürü gölgede uyukluyor, yayla sessiz. Oğuz sıkıldı, çok sıkıldı. Sonra aklına bir şaka geldi: gözcü kayasına çıkıp “Kurt geliyor!” diye bağırsa, köylüler ne yapardı?',
      soz: '“Yalancının mumu yatsıya kadar yanar.”',
      karakter: { kod: 'coban-oguz', ad: 'Oğuz', tur: 'Küçük çoban' },
      sozler: [ 'Of, çok sıkıldım… Bir şaka yapsam mı?', 'Köylüler koşa koşa geldi… ama kimse gülmüyor.', 'Galiba şakam hiç komik değildi.' ],
      armagan: { kod: 'coban-fener-sonuk', ad: 'Sönen fener', renk: '#8E97A3' },
      engeller: [
        { engel: 'Öğle sıcağı: Oğuz sıkıldı, elma ağacını silkeliyor.',
          guvenNotu: 'Ama Oğuz elma toplarken sürüyü gölgede yalnız bıraktı; köylüler uzaktan gördü.',
          sahne: { tip: 'gelis', nesne: 'elma', adet: 5, kisi: 'coban-oguz', dekor: ['agac', 'ot', 'bulut'],
            metin: 'Sürü gölgede uyukluyor, yayla sessiz. Oğuz sıkıldı, çok sıkıldı. Oyalanmak için elma ağacını silkelemeye başladı.', soz: 'Offf… Burada hiçbir şey olmuyor.' }, gorev: 'yakala',
          yonerge: 'Elmalar düşüyor. Parmağını aşağıda gezdir, sepeti kaydır ve elmaları tut.',
          hedef: 8, hiz: .18, sikayet: 1100, iyi: [ 'elma' ], kotu: [],
          cozum: 'Sepet elmayla doldu. Ama Oğuz hâlâ sıkılıyor…' },
        { engel: 'Oğuz kelebek kovalarken sürüden uzaklaşıyor.',
          guvenNotu: 'Ama Oğuz kelebek kovalarken sürüden çok uzaklaştı; köylüler kaşlarını çattı.',
          sahne: { tip: 'kesif', nesne: 'coban-kelebek', adet: 5, kisi: 'coban-oguz', dekor: ['ot', 'fidan', 'agac'],
            metin: 'Çayırda rengârenk kelebekler uçuşuyor. Oğuz peşlerinden koştu, koştu… Arkasına dönüp baktığında sürü epey uzakta kalmıştı.', soz: 'Bir tane daha yakalarsam dönerim!' }, gorev: 'isabet',
          yonerge: 'Kelebekler uçuşuyor. Gezinen kelebeklere tam üstünden dokun.',
          sekil: 'coban-kelebek', hedef: 6, adet: 4, hiz: .65, boy: 13,
          cozum: 'Kelebekler çiçeklere kondu. Oğuz sürünün yanına geri koştu.' },
        { engel: 'Oğuz bağırdı: “Kurt geliyor!” Köylüler koşa koşa geldi.', onem: 1,
          guvenNotu: 'Ama kurt yokmuş! Köylüler işini bırakıp boşuna koştu; şaka onları üzdü.',
          sahne: { tip: 'sorun', nesne: 'coban-tencere', adet: 5, kisi: 'coban-oguz', dekor: ['tas', 'ot', 'coban-ev'],
            metin: 'Oğuz gözcü kayasına çıktı ve avazı çıktığı kadar bağırdı: “Kurt geliyor!” Köylüler ellerinde tencere, tava, ne bulduysa yaylaya tırmandı. Nefes nefese sürüye baktılar.', soz: 'Kurt geliyooor! …Şaka şaka!' }, gorev: 'refleks',
          yonerge: 'Köylüler sürüyü sayıyor. Yalnızca koyun görünce dokun; başka bir şey gelirse elini çek.',
          hedef: 8, gorunme: 1100, ara: 330,
          aranan: { sekil: 'coban-kuzu', ad: 'Koyun' },
          digerleri: [ { sekil: 'tas', ad: 'Taş' }, { sekil: 'agac', ad: 'Ağaç' }, { sekil: 'bulut', ad: 'Bulut' } ],
          cozum: 'Bütün koyunlar yerindeydi; kurt falan yoktu. Oğuz kahkahayla güldü. Köylüler gülmedi.' },
        { engel: 'Köylüler aceleyle koşarken eşyalarını düşürmüş.', onem: 3,
          guvenNotu: 'Ama köylüler telaştan eşyalarını düşürecek kadar acele etmişti; çok kırgınlar.',
          sahne: { tip: 'kesif', nesne: 'coban-tava', adet: 4, kisi: 'kopek-karabas', dekor: ['ot', 'tas', 'ot'],
            metin: 'Köylüler başlarını sallayarak köye döndü. Karabaş otları kokluyor: acele eden köylüler bir tencere, bir tava, bir de tahta kaşık düşürmüş.', soz: 'Hav! Burada bir şey var!' }, gorev: 'gizli',
          yonerge: 'Otların arasına iyi bakalım; düşen eşyaları bulalım.',
          tohum: 53, sus: 26, susBoy: [4, 8], boy: 12,
          gizli: [ { sekil: 'coban-tencere', ad: 'Tencere', x: 20, y: 62, a: -8 },
                   { sekil: 'coban-tava', ad: 'Tava', x: 76, y: 30, a: 7 },
                   { sekil: 'coban-kasik', ad: 'Tahta kaşık', x: 47, y: 75, a: 13 } ],
          cozum: 'Üçü de bulundu. Oğuz onları gözcü kayasının dibine koydu; belki biri almaya gelir.' },
        { engel: 'Oğuz bir kez daha bağırdı. Köylüler yine geldi: “Hani kurt?”', onem: 2,
          guvenNotu: 'Ama bu ikinci şakaydı; köylüler artık Oğuz’a inanmıyor.',
          sahne: { tip: 'sorun', nesne: 'coban-can', adet: 4, kisi: 'coban-oguz', dekor: ['tas', 'bulut', 'ot'],
            metin: 'Ertesi gün Oğuz aynı şakayı bir daha yaptı. Köylüler yine koştu ama bu sefer yorgun ve kırgın geldiler. Etrafa bakıyorlar: kurt nerede?', soz: 'Kurt geliyor! …Yine kandırdım!' }, gorev: 'fark',
          yonerge: 'Köylüler yaylayı arıyor. Her turda biri diğerlerine benzemiyor; onu bulalım.',
          turlar: [
            { soru: 'Hangisi yaylada yaşamaz?',
              digerleri: [ { ad: 'Koyun', sekil: 'coban-kuzu' }, { ad: 'Kuş', sekil: 'kus' }, { ad: 'Sincap', sekil: 'sincap' } ],
              yabanci: { ad: 'Ahtapot', sekil: 'ahtapot' }, neden: 'Ahtapot denizde yaşar. Yaylada ahtapot yok; bugün kurt da yok.' },
            { soru: 'Köylüler ne kapıp gelmişti? Hangisi mutfaktan değil?',
              digerleri: [ { ad: 'Tencere', sekil: 'coban-tencere' }, { ad: 'Tava', sekil: 'coban-tava' }, { ad: 'Kaşık', sekil: 'coban-kasik' } ],
              yabanci: { ad: 'Kaval', sekil: 'coban-kaval' }, neden: 'Kaval Oğuz’un. Köylüler mutfaktan ne bulduysa kapıp gelmişti.' },
            { soru: 'Köylüler başını kaldırdı. Hangisi yerde değil, gökte?',
              digerleri: [ { ad: 'Taş', sekil: 'tas' }, { ad: 'Ot', sekil: 'ot' }, { ad: 'Fidan', sekil: 'fidan' } ],
              yabanci: { ad: 'Bulut', sekil: 'bulut' }, neden: 'Gökte yalnızca bulut vardı. Kurt yoktu; ikinci kez.' }
          ],
          cozum: 'Köylüler bu sefer hiçbir şey demeden döndü. Köyde bir fener daha söndü.' },
        { engel: 'Akşam oldu. Oğuz tepede tek başına yıldızlara bakıyor.',
          guvenNotu: 'Gökte yıldızlar yandı ama köyde pencereler kararıyor.',
          sahne: { tip: 'istek', nesne: 'yildiz', adet: 5, kisi: 'coban-oguz', dekor: ['tas', 'coban-ev', 'agac'],
            metin: 'Gökte yıldızlar birer birer yandı. Aşağıda, köyde ise fenerler birer birer sönüyor. Oğuz ilk kez biraz yalnız hissetti.', soz: 'Yıldızlar yanıyor… köydeki fenerler neden sönüyor?' }, gorev: 'takimyildiz',
          yonerge: 'İyi bak: hangi yıldızlar parladıysa, ışıklar sönünce aynılarına dokun.',
          nokta: 12, yanan: 4, tur: 2, bakma: 2400,
          cozum: 'Yıldızlar yerli yerinde. Ama köyde yalnızca birkaç fener yanıyor.' }
      ],
      final: { engel: 'Oğuz kayanın dibinde oturmuş, içi burkuluyor.',
               sahne: { tip: 'istek', nesne: 'coban-fener-sonuk', adet: 5, kisi: 'coban-oguz', dekor: ['tas', 'coban-ev', 'bulut'],
               metin: 'İki şaka, iki boşuna koşu. Köyde fenerlerin çoğu söndü. Oğuz şakalarının kimseyi güldürmediğini anladı ama ne diyeceğini bilemiyor.', soz: 'Ben sadece biraz eğlenmek istemiştim…' }, etkinlik: 'sev',
               cozum: 'Oğuz biraz rahatladı. “Bir daha şaka yapmayacağım,” dedi. Ama köylüler artık ona inanmıyordu.' }
    },
    {
      kod: 'kurt', ad: 'Kurt gerçekten geldi', baslik: 'Kuzuları ağıla topla',
      guvenSonu: 'Bütün kuzular ağılda',
      renk: '#6F8FA8', acik: '#DCE7EE', gok: '#E8EFF4', zemin: '#AFC39A',
      hikaye: 'Ertesi akşam orman kenarında gri bir gölge belirdi. Bu sefer şaka değildi: aç ve yalnız bir kurt. Oğuz bağırdı: “Kurt geliyor! Gerçekten!” Ama köyden kimse gelmedi. Kuzular ürküp dört bir yana dağıldı. Şimdi Karabaş ile Oğuz onları tek tek ağıla toplayacak.',
      soz: '“Bir elin nesi var, iki elin sesi var.”',
      karakter: { kod: 'kopek-karabas', ad: 'Karabaş', tur: 'Çoban köpeği' },
      sozler: [ 'Hav! Korkma Oğuz, kuzuları birlikte toplarız!', 'Hav hav! Biri daha ağılda!', 'Hepsi içeride. Kapıyı sıkıca kapatalım!' ],
      armagan: { kod: 'coban-agil', ad: 'Dolu ağıl', renk: '#B08455' },
      engeller: [
        { engel: 'Orman kenarında gri bir gölge: bu sefer gerçekten kurt!', onem: 1,
          sahne: { tip: 'sorun', nesne: 'agac', adet: 4, kisi: 'kurt-yalniz', dekor: ['agac', 'agac', 'fidan'],
            metin: 'Orman kenarında iki kehribar göz parladı. Aç ve yalnız bir kurt ağaçların arasında dolaşıyor. Oğuz bağırdı: “Kurt geliyor! Gerçekten!” Ama köyden kimse gelmedi.', soz: 'Hım… Burada koyun kokusu var.' }, gorev: 'takip',
          yonerge: 'Kurt ağaçların arasında dolaşıyor. Parmağını üstüne koy ve kaldırmadan takip et; onu gözden kaybetmeyelim.',
          sekil: 'kurt-yalniz', sure: 5200, hiz: .7, boy: 15,
          cozum: 'Kurdu gözden kaybetmedik. Uzakta duruyor ama kuzular kokusunu aldı ve dağıldı.' },
        { engel: 'Kuzular ürküp çalıların ardına saklandı.',
          sahne: { tip: 'kesif', nesne: 'coban-kuzu', adet: 5, kisi: 'kopek-karabas', dekor: ['fidan', 'ot', 'tas'],
            metin: 'Kuzular dört bir yana kaçtı; her biri bir çalının ardına sindi. Karabaş burnunu yere dayadı. Hangi çalının ardında ne var, aklında tutan bulur.', soz: 'Hav! Kokularını alıyorum!' }, gorev: 'cift',
          yonerge: 'İki kart çevir. Aynı ikisini bulursan açık kalır; yerlerini aklında tut.',
          cift: [ 'coban-kuzu', 'coban-can', 'coban-fener', 'coban-kaval', 'coban-sut', 'su' ],
          cozum: 'Çalıların ardındaki kuzular tek tek çıktı ve Karabaş’ın peşine takıldı.' },
        { engel: 'Ürken kuzular ağılın kapısını devirmiş.',
          sahne: { tip: 'sorun', nesne: 'kazik3', adet: 4, kisi: 'kopek-karabas', dekor: ['coban-agil', 'ot', 'tas'],
            metin: 'Kuzular kaçarken ağılın kapısına çarpmış; tahtalar yerinden çıkmış. Kapı onarılmadan hiçbir kuzu içeride güvende olmaz.', soz: 'Hav hav! Kapıyı onaralım!' }, gorev: 'yapboz',
          yonerge: 'Parçaya dokun, sonra ağıl resminde ait olduğu boş yere dokun.',
          resim: 'coban-agil', satir: 2, sutun: 3,
          cozum: 'Kapı yerine oturdu; ağıl yeniden sağlam.' },
        { engel: 'Kurt ağıla yaklaşıyor. Tencere tava sesi onu ürkütür!', onem: 2,
          sahne: { tip: 'gelis', nesne: 'coban-tencere', adet: 4, kisi: 'coban-oguz', dekor: ['tas', 'agac', 'coban-agil'],
            metin: 'Oğuz köylülerin düşürdüğü tencereyi, tavayı ve kaşığı hatırladı. Karabaş havlarken Oğuz tencereye kaşıkla vurmaya başladı: güm güm, tın tın! Ses yamaçlarda yankılandı.', soz: 'Ne kadar gürültü, o kadar iyi!' }, gorev: 'dizi',
          yonerge: 'Sesler sırayla geliyor. Dinleyip aynı sırayla dokunalım; gürültü büyüsün!',
          dostlar: [ { sekil: 'coban-tencere', ad: 'Tencere' }, { sekil: 'coban-tava', ad: 'Tava' },
                     { sekil: 'coban-can', ad: 'Çan' }, { sekil: 'kopek-karabas', ad: 'Karabaş' } ],
          uzunluklar: [ 2, 3, 4 ],
          cozum: 'Kurt kulaklarını kıstı ve ormana geri koştu. Kimseye dokunmadı; o da çok korkmuştu.' },
        { engel: 'Karabaş kuzuları ağıla sürdü. Kaçı içeride?',
          sahne: { tip: 'cozuldu', nesne: 'coban-kuzu', adet: 6, kisi: 'kopek-karabas', dekor: ['coban-agil', 'ot', 'fidan'],
            metin: 'Karabaş kuzuları bir sağdan bir soldan dolaşıp ağılın kapısına doğru sürdü. Kuzular birer birer içeri girdi. Şimdi saymak lazım: eksik var mı?', soz: 'Hav! Hepsini saydın mı?' }, gorev: 'say',
          yonerge: 'Ağıla giren kuzulara tek tek dokunup sayalım.',
          sayi: 6, sekil: 'coban-kuzu',
          cozum: 'Kuzular içeride… Ama biri eksik: Bulut yok!' },
        { engel: 'Bulut dikenli çalıların arasında kalmış.', onem: 3,
          sahne: { tip: 'istek', nesne: 'coban-diken', adet: 4, kisi: 'koyun-bulut', dekor: ['fidan', 'tas', 'ot'],
            metin: 'Karanlıkta ince bir “meee” duyuldu. Bulut çalıların ortasına sıkışmış, titriyor. Onu dikenlere değmeden ağıla getirmek gerek.', soz: 'Meee… Oğuz ağabey, neredesin?' }, gorev: 'yol',
          yonerge: 'Parmağını Bulut’un üstüne koy; dikenlere değmeden onu ağıla götür.',
          baslangic: { x: 100, y: 220, sekil: 'koyun-bulut', ad: 'Bulut' }, bitis: { x: 905, y: 220, sekil: 'coban-agil', ad: 'Ağıl' },
          engeller: [ { x: 320, y: 120, r: 84, sekil: 'coban-diken', ad: 'Diken' },
                      { x: 430, y: 330, r: 80, sekil: 'tas', ad: 'Kaya' },
                      { x: 640, y: 150, r: 86, sekil: 'coban-diken', ad: 'Diken' },
                      { x: 710, y: 360, r: 74, sekil: 'fidan', ad: 'Çalı' } ],
          cozum: 'Bulut ağılda, annesinin yanında. Bütün kuzular içeride!' }
      ],
      final: { engel: 'Karabaş’ın tüyleri pıtırak ve dikenle dolmuş.',
               sahne: { tip: 'cozuldu', nesne: 'coban-kuzu', adet: 6, kisi: 'kopek-karabas', dekor: ['coban-agil', 'fidan', 'agac'],
               metin: 'Bütün kuzular ağılda, kapı sıkıca kapalı. Kurt ormana döndü; kimseye zarar vermedi. Karabaş yorgun ama gururlu; tüyleri çalı çırpı dolu.', soz: 'Hav… Biraz taranmak iyi gelir.' }, etkinlik: 'timarla',
               cozum: 'Karabaş’ın tüyleri parladı. Oğuz ona sarıldı: “Sen olmasan ne yapardım?” Sonra köye baktı. Yarın söylemesi gereken bir şey vardı.' }
    },
    {
      kod: 'ozur', ad: 'Doğru söz', baslik: 'Fener fener güven',
      guvenSonu: 'Köy yeniden ışıl ışıl',
      renk: '#D9A441', acik: '#F8E8C0', gok: '#FDF4DE', zemin: '#CFD99A',
      hikaye: 'Sabah olunca Oğuz köye indi ve herkese söyledi: “Size iki kez yalan söyledim. Dün gece kurt gerçekten geldi ve kimse gelmedi, çünkü bana inanmadınız. Haklıydınız. Özür dilerim.” Güven bir günde gelmez: her gün söylenen bir doğru sözle, fener fener yeniden yanar.',
      soz: '“Doğru söz karanlıkta fener gibidir.”',
      karakter: { kod: 'coban-oguz', ad: 'Oğuz', tur: 'Küçük çoban' },
      sozler: [ 'Size yalan söyledim. Özür dilerim.', 'Bundan sonra hep doğruyu söyleyeceğim.', 'Fenerler yeniden yanıyor. Teşekkür ederim!' ],
      armagan: { kod: 'coban-ev', ad: 'Aydınlık köy', renk: '#E7B04F' },
      engeller: [
        { engel: 'Oğuz özür dilemeden önce devrilen çiti onarıyor.',
          sahne: { tip: 'gelis', nesne: 'kazik2', adet: 4, kisi: 'coban-oguz', dekor: ['coban-agil', 'ot', 'coban-ev'],
            metin: 'Sabah oldu. Oğuz bütün gece düşündü. Köye inmeden önce kuzuların devirdiği çiti onarmaya başladı. Köylüler uzaktan izliyor.', soz: 'Önce işimi düzgün yapayım.' }, gorev: 'sirala',
          yonerge: 'Çit kazıklarını kısadan uzuna dizelim ki çit düzgün dursun.',
          ogeler: [ { ad: 'En kısa', sekil: 'kazik1' }, { ad: 'Kısa', sekil: 'kazik2' },
                    { ad: 'Uzun', sekil: 'kazik3' }, { ad: 'En uzun', sekil: 'kazik4' } ],
          cozum: 'Çit dimdik ayakta. Köylülerden biri başını salladı.' },
        { engel: 'Oğuz artık ne görürse onu söylüyor.', onem: 1,
          sahne: { tip: 'istek', nesne: 'coban-fener', adet: 3, kisi: 'coban-oguz', dekor: ['coban-ev', 'agac', 'ot'],
            metin: 'Oğuz köy meydanında herkesin önünde söyledi: “Size iki kez yalan söyledim. Özür dilerim. Bundan sonra ne görürsem onu söyleyeceğim.” Köylüler onu biraz sınamak istedi.', soz: 'Sorun bakalım; doğrusunu söyleyeceğim.' }, gorev: 'kayip',
          yonerge: 'Rafa iyi bakalım. Gözümüzü kapayıp açınca ne eksildi? Doğrusunu söyleyelim.',
          tur: 2,
          ogeler: [ { ad: 'Tencere', sekil: 'coban-tencere' }, { ad: 'Tava', sekil: 'coban-tava' },
                    { ad: 'Kaşık', sekil: 'coban-kasik' }, { ad: 'Süt', sekil: 'coban-sut' },
                    { ad: 'Bazlama', sekil: 'coban-ekmek' } ],
          cozum: 'Oğuz her seferinde doğrusunu söyledi. Köylüler birbirine baktı: “Bu sefer doğru söylüyor.”' },
        { engel: 'İki şakanın ağırlığı doğru sözlerle dengelenecek.',
          sahne: { tip: 'kesif', nesne: 'tas', adet: 3, kisi: 'coban-oguz', dekor: ['coban-ev', 'tas', 'ot'],
            metin: 'Ayşe Nine Oğuz’a eski terazisini gösterdi: “Bir kefede iki şakan var. Öbür kefeye doğru sözler koydukça güven düzelir. Ama bir günde değil.”', soz: 'Kaç doğru söz gerekiyor acaba?' }, gorev: 'terazi',
          yonerge: 'Sağ kefeye doğru sözleri ekleyelim; terazi dengelenene kadar sabırla deneyelim.',
          sol: [ { sekil: 'tas', agirlik: 3 }, { sekil: 'tas', agirlik: 3 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 }, { ad: 'Büyük', agirlik: 3 } ],
          cozum: 'Terazi dengelendi. Ayşe Nine gülümsedi: “İşte güven böyle geri gelir; yavaş yavaş.”' },
        { engel: 'Akşam fenerleri bir düzenle yakılıyor.',
          sahne: { tip: 'gelis', nesne: 'coban-fener', adet: 5, kisi: 'coban-oguz', dekor: ['coban-ev', 'coban-ev', 'agac'],
            metin: 'Akşam oldu. Köylüler yeni bir âdet başlattı: her doğru söz için bir fener. Oğuz köy yolunun fenerlerini bir yanık, bir sönük diye sırayla yakıyor.', soz: 'Bir yanık, bir sönük… sıradaki hangisi?' }, gorev: 'oruntu',
          yonerge: 'Sıraya bak: yanık fener, sönük fener… boşluklara hangisi geliyor?',
          dizi: [ 'coban-fener', 'coban-fener-sonuk', 'coban-fener', 'coban-fener-sonuk', null, 'coban-fener-sonuk', null ],
          cevaplar: [ 'coban-fener', 'coban-fener' ],
          secenekler: [ { sekil: 'coban-fener', ad: 'Yanık fener' }, { sekil: 'coban-fener-sonuk', ad: 'Sönük fener' }, { sekil: 'coban-can', ad: 'Çan' } ],
          cozum: 'Köy yolu fener fener aydınlandı.' },
        { engel: 'Oğuz yayladan getirdiği elmaları dört komşuya paylaştırıyor.',
          sahne: { tip: 'istek', nesne: 'elma', adet: 6, kisi: 'coban-oguz', dekor: ['coban-ev', 'agac', 'coban-ev'],
            metin: 'Oğuz boşuna koşturduğu her komşuya yayladan elma götürmek istiyor. Kimse eksik kalmamalı; herkes aynı yokuşu tırmanmıştı.', soz: 'Hepinize teşekkür ederim; bir de özür.' }, gorev: 'paylas',
          yonerge: 'Elmaları dört eve eşit paylaştıralım.',
          dostlar: [ { sekil: 'coban-ev', ad: 'Ayşe Nine' }, { sekil: 'coban-ev', ad: 'Hasan Amca' },
                     { sekil: 'coban-ev', ad: 'Fadime Teyze' }, { sekil: 'coban-ev', ad: 'Ali Dede' } ],
          yem: 'elma', yemAd: 'Elma', adet: 12,
          cozum: 'Dört ev de eşit elma aldı. Ali Dede kapıda Oğuz’un saçını okşadı.' },
        { engel: 'Ateşböcekleri köyün üstünde uçuşuyor.',
          sahne: { tip: 'cozuldu', nesne: 'coban-atesbocegi', adet: 6, kisi: 'coban-oguz', dekor: ['coban-ev', 'agac', 'coban-ev'],
            metin: 'Yaz gecesi köyün üstünde ateşböcekleri uçuşuyor. Çocuklar bir oyun uydurdu: dokunduğun her ateşböceği bir pencereye ışık taşır.', soz: 'Bakın, fenerler yeniden yanıyor!' }, gorev: 'isabet',
          yonerge: 'Uçuşan ateşböceklerine tam üstünden dokun; her biri bir pencereye ışık taşısın.',
          sekil: 'coban-atesbocegi', hedef: 7, adet: 4, hiz: .75, boy: 12,
          cozum: 'Köyün pencereleri ışıl ışıl. Fenerler eskisinden de parlak.' }
      ],
      final: { engel: 'Köylüler Oğuz’u meydanda bekliyor.',
               sahne: { tip: 'cozuldu', nesne: 'coban-fener', adet: 7, kisi: 'coban-oguz', dekor: ['coban-ev', 'coban-ev', 'agac'],
               metin: 'Günler geçti. Oğuz her gün doğruyu söyledi, her gün işini iyi yaptı. Bir akşam köylüler meydanda toplandı ve Oğuz’a kendi fenerini verdiler.', soz: 'Bana yeniden güvendiğiniz için teşekkür ederim.' }, etkinlik: 'sev',
               cozum: 'Köylüler Oğuz’a sarıldı. O gece köyde bütün fenerler yandı; hem de hiç olmadığı kadar parlak.' }
    }
  ],

  kapanis: {
    baslik: 'Köyün fenerleri yeniden yandı.',
    metin: 'Oğuz iki kez şaka yaptı, köylüler iki kez boşuna koştu. Üçüncüsünde kurt gerçekten geldi ama kimse inanmadı. Neyse ki Karabaş yanındaydı: kuzular ağıla toplandı, kurt tencere tava sesinden ürküp ormana döndü. Kimseye bir şey olmadı.\n\nErtesi sabah Oğuz özür diledi. Güven bir günde gelmedi: her gün bir doğru söz, her gün bir fener. Sonunda bir akşam Oğuz yayladan seslendi: “Orman kenarında bir kurt dolaşıyor, ağılın kapısını kapatalım!” Bu sefer bütün köy ona inandı.',
    ders: 'Güven bir kere kırılınca yavaş yavaş onarılır.'
  }
};

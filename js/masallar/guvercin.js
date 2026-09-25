/* MASAL 04 — KARINCA İLE GÜVERCİN (Ezop)
   ─────────────────────────────────────
   Kaynak kamu malı: Ezop (~MÖ 600). Metin bize ait, çeviri değil.

   NEDEN AÇILABİLİYOR: Fablın iki yarısı birbirinin aynası. Önce güvercin
   karıncayı dereden kurtarır; sonra karınca, güvercini kurtararak iyiliği
   geri verir. Bu ikilik oyunun kendisi oluyor: sınıf 1–2. bölümde Pamuk’un
   iyiliklerini yapıyor, 3–4. bölümde her durak bu iyiliklerden birinin
   KARŞILIĞI. Kurgu 'karsilik' iki halkayı birbirine köprüyle bağlıyor.

   FİNALİ YUMUŞATTIM: Ezop’ta bir avcı güvercini vurmak ister, karınca
   ayağını ısırır. Burada avcı yok, ısırık yok: uykucu bir tekir kedi,
   uyuyan güvercinle “oynamak” ister; Minik onun burnunu bir tüyle
   gıdıklar, Tekir hapşırır, Pamuk uyanıp havalanır. Kimse incinmez.
   Tekir utanır, özür diler; hepsi dere kenarında birlikte güneşlenir.

   YAPI: dört bölüm × (6 engel + final). Engeller hikâye sırasıyla oynanır
   (kurgunun kendi tahtaKur’u); ardışık iki durak asla aynı mekaniği
   kullanmaz. İlk yarıdaki her durağın bir 'id'si, ikinci yarıdakinin bir
   'es'i var: karşılık, eşleştiği iyiliğe bağlanır.
   'halka': zincir defterinde halkanın altında yazan kısa ad. */

/* Durakların haritadaki yeri. Dört bölüm dört köşede (bölge etiketleri
   köşelerde): 01 Akıntı dere boyunca kuzeybatıda, 02 Kıyı karınca
   yuvasının çevresinde kuzeydoğuda, 03 Çınar güneydoğudan çınara doğru,
   04 Hapşırık sazlıktan çınarın batısına. Her bölümün yedi yuvası var;
   sınıf küçükse yuvaların arasından eşit aralıklı seçilir (bölümün son
   durağı hep son yuvada), büyükse bölümün yolu boyunca araya eklenir. */
const YUVALAR = [
  [[-10.6, -4.6], [-8.6, -5.6], [-6.4, -6.0], [-4.2, -5.4], [-2.2, -6.1], [-0.2, -5.4], [1.9, -5.9]],
  [[4.0, -5.6], [6.0, -5.0], [8.0, -3.6], [8.2, -1.4], [6.8, 0.6], [4.6, -0.6], [3.4, -2.4]],
  [[5.4, 2.6], [7.4, 3.7], [7.0, 6.0], [4.8, 7.0], [2.6, 7.6], [0.4, 7.0], [1.4, 4.9]],
  [[-2.2, 5.8], [-4.4, 6.8], [-6.6, 5.9], [-7.2, 3.6], [-5.6, 1.9], [-3.6, 3.0], [-3.4, 0.6]]
];
function yolUstunde(noktalar, t) {                 // t: 0..1, kırık çizgi boyunca
  const boy = [];
  let top = 0;
  for (let i = 1; i < noktalar.length; i++) {
    const d = Math.hypot(noktalar[i][0] - noktalar[i - 1][0], noktalar[i][1] - noktalar[i - 1][1]);
    boy.push(d); top += d;
  }
  let kalan = t * top;
  for (let i = 0; i < boy.length; i++) {
    if (kalan <= boy[i] || i === boy.length - 1) {
      const f = boy[i] ? Math.min(1, kalan / boy[i]) : 0, a = noktalar[i], b = noktalar[i + 1];
      return { x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f };
    }
    kalan -= boy[i];
  }
  const s = noktalar[noktalar.length - 1];
  return { x: s[0], z: s[1] };
}
function yerlesim(duraklar) {
  const yerler = [];
  for (let b = 0; b < 4; b++) {
    const sira = duraklar.map((d, i) => ({ d, i })).filter(x => x.d.bolum === b);
    const k = sira.length, yuva = YUVALAR[b];
    sira.forEach(({ i }, j) => {
      if (k <= yuva.length) {
        const n = k === 1 ? yuva.length - 1 : Math.round(j * (yuva.length - 1) / (k - 1));
        yerler[i] = { x: yuva[n][0], z: yuva[n][1] };
      } else yerler[i] = yolUstunde(yuva, j / (k - 1));
    });
  }
  return yerler;
}

export default {
  kod: 'guvercin',
  ad: 'Karınca ile Güvercin',
  kaynak: 'Ezop fablı',
  ders: 'Yapılan iyilik unutulmaz',
  sure: '40 dakika · bütün sınıf',
  ozet: 'Bir güvercin dereye düşen karıncayı kurtarır; günler sonra minicik karınca o iyiliğin karşılığını verir.',
  renk: '#5FA8B8',
  ikon: 'guvercin-yaprakkayik',

  /* KURGU: karşılık. Armağan torbası yok, yarış yok, geri sayım yok.
     Tahta bir iyilik defteri: solda Pamuk’un iyilikleri birikir, sağda
     Minik’in karşılıkları eşlerine köprüyle bağlanır. */
  kurgu: 'karsilik',
  karsilik: {
    veren: { kod: 'guvercin-pamuk', ad: 'Pamuk', iyelik: 'Pamuk’un' },
    donen: { kod: 'karinca-minik', ad: 'Minik', iyelik: 'Minik’in', bulunma: 'Minik’te' }
  },

  /* Mekân: dere kıyısı. Kuzeybatıdaki şelaleden dökülen dere haritanın
     kuzeyinden ve doğusundan dolanır; ortada Pamuk’un çınarı. Sınıf
     ilerledikçe çınarın gövdesine yapraktan bir merdiven-köprü dolanıyor,
     dalda yuva beliriyor. */
  dunya: {
    mekan: 'dere', gok: 0xdfeef2, cevre: 0x94c07c, yol: 0xeadfbf, cekirdek: 50417,
    piyonTur: 'karinca3b', piyon: 0x8e3b22,          // çocuk Minik olarak dolaşır
    iz: 'yaprak-kayik', izRenk: 0x86bd5a, kesifRenk: 0x5fa8b8,
    izNotu: { bos: 'Dere kıyısı henüz sessiz', dolu: '{n} yaprak bırakıldı · zincir uzuyor' },
    yerlesim, yolKapali: false,
    kesif: [
      { x: 3.0, z: 2.0, ikon: 'agac', ad: 'Büyük çınar',
        metin: 'Bu çınar dereden de, karınca yuvasından da yaşlı. Pamuk’un annesi de, annesinin annesi de bu dallarda büyümüş. Gövdesine dolanan yapraklar Minik’in merdiveni: her iyilikle bir basamak daha uzuyor.' },
      { x: -11.4, z: -5.8, ikon: 'guvercin-selale', ad: 'Küçük şelale',
        metin: 'Dere buradan doğar. Kayalardan dökülen su çağıl çağıl ses çıkarır; Minik o sabah bu sesi dinlerken ayağının kaydığını fark etmemişti.' },
      { x: 5.6, z: -3.0, ikon: 'guvercin-karincayuvasi', ad: 'Karınca yuvası',
        metin: 'Toprak tepeciğin içinde yüzlerce oda var. Minik’in odası en üstte, kapının hemen yanında: sabah ilk güneşi o görür. Tepeye çıkıp içeri bakabilirsin.' },
      { x: -9.2, z: 7.2, ikon: 'guvercin-sazlik', ad: 'Sazlık',
        metin: 'Uzun kamışların arası serin ve gölgeli. Tekir öğle uykusunu hep burada çeker; kamışlar kıpırdıyorsa bil ki Tekir rüyasında kelebek kovalıyordur.' },
      { x: 10.2, z: 4.8, ikon: 'guvercin-gunestas', ad: 'Güneşli taş',
        metin: 'Dere kenarındaki bu düz taş öğleden sonra ısınır ve akşama kadar sıcak kalır. Masalın sonunda kimlerin burada yan yana uzandığını göreceksin.' }
    ]
  },

  acilis: [
    { tag: 'BİR VARMIŞ, BİR YOKMUŞ', baslik: 'Kıvrılan bir dere varmış.', ikon: 'guvercin-selale',
      metin: 'Küçük bir şelaleden dökülüp taşların arasında kıvrıla kıvrıla akan bir dere varmış. Kıyısında kocaman bir çınar, çınarın dalında da Pamuk adında bir güvercin yaşarmış.' },
    { tag: 'İKİ KOMŞU', baslik: 'Biri minicik, biri kanatlı.', ikon: 'karinca-minik',
      metin: 'Derenin öbür ucunda, toprak bir tepeciğin içinde Minik adında bir karınca yaşarmış. Pamuk ile Minik birbirini hiç tanımazmış. Ta ki sıcak bir yaz sabahına kadar…' },
    { tag: 'BU MASALIN KAHRAMANI SİZSİNİZ', baslik: 'Her iyilik bir halka.', ikon: 'kalp',
      metin: 'Sırayla tahtaya gelip önce Pamuk’un iyiliklerini, sonra Minik’in karşılıklarını yapacağız. Her durak zincire bir halka ekleyecek. Bakalım zincir tamamlanınca dere kenarında ne olacak?' }
  ],

  bolumler: [
    /* ═══════════ 01 · AKINTI — Pamuk Minik’i kurtarır ═══════════ */
    {
      kod: 'akinti', ad: 'Akıntı', baslik: 'Dereye düşen karınca', bolumSonu: 'Minik kurtuldu!',
      renk: '#5FA8B8', acik: '#D6EEF1', gok: '#EAF6F7', zemin: '#A9D39A',
      hikaye: 'Sıcak bir yaz sabahı. Minik dere kenarında su içerken ayağı kaydı ve — şıp! — dereye düştü. Akıntı onu bir yaprak gibi sürüklüyor. Çınarın dalında oturan Pamuk her şeyi gördü.',
      soz: '“Yardım etmek için önce iyi bakmak gerekir.”',
      karakter: { kod: 'guvercin-pamuk', ad: 'Pamuk', tur: 'Güvercin' },
      sozler: [ 'Ben Pamuk! Minik’i birlikte kurtaralım mı?', 'Çok iyi gidiyoruz, Minik’e yaklaştık!', 'Minik kıyıda! Hepinize teşekkür ederim.' ],
      armagan: { kod: 'guvercin-cinar', ad: 'Çınar yaprağı', renk: '#86BD5A' },
      engeller: [
        { id: 'izledi', halka: 'Minik’i gözden kaçırmadı',
          engel: 'Akıntı Minik’i sürüklüyor.',
          sahne: { tip: 'sorun', nesne: 'su', adet: 5, kisi: 'karinca-minik', dekor: ['guvercin-sazlik', 'guvercin-nilufer', 'tas'],
            metin: 'Minik dere kenarında su içerken ayağı kaydı. Şıp! Dereye düştü. Akıntı onu yavaş yavaş aşağı götürüyor.', soz: 'Eyvah, su beni götürüyor!' }, gorev: 'takip',
          yonerge: 'Pamuk Minik’i gözden kaçırmamalı. Parmağını Minik’in üstüne koy ve kaldırmadan takip et.',
          sekil: 'karinca-minik', sure: 5200, hiz: .72, boy: 14,
          cozum: 'Pamuk Minik’i hiç gözden kaçırmadı; nereye gittiğini biliyor.' },
        { id: 'yaprak-secti', halka: 'Sağlam bir yaprak seçti',
          engel: 'Minik’e bir sal lazım.',
          sahne: { tip: 'kesif', nesne: 'guvercin-cinar', adet: 6, kisi: 'guvercin-pamuk', dekor: ['agac', 'guvercin-cinar', 'ot'],
            metin: 'Pamuk çınarın dalına kondu ve aklına bir fikir geldi: Minik’e bir sal lazım! Ama her yaprak olmaz. Geniş ve sağlam olmalı.', soz: 'En geniş yaprağı bulmalıyım.' }, gorev: 'refleks',
          yonerge: 'Yalnızca geniş çınar yaprağına dokun. Kozalak, taş ya da tüy gelirse elini çek.',
          hedef: 7, gorunme: 1150, ara: 330,
          aranan: { sekil: 'guvercin-cinar', ad: 'Çınar yaprağı' },
          digerleri: [ { sekil: 'kozalak', ad: 'Kozalak' }, { sekil: 'tas', ad: 'Taş' }, { sekil: 'guvercin-tuy', ad: 'Tüy' } ],
          cozum: 'Pamuk gagasıyla en geniş çınar yaprağını kopardı.' },
        { id: 'yaprak-birakti', halka: 'Yaprağı tam önüne bıraktı',
          engel: 'Yaprak tam Minik’in önüne düşmeli.',
          sahne: { tip: 'istek', nesne: 'guvercin-cinar', adet: 3, kisi: 'guvercin-pamuk', dekor: ['guvercin-nilufer', 'guvercin-sazlik', 'su'],
            metin: 'Pamuk yaprağı gagasında taşıyarak derenin üstünde uçuyor. Akıntı Minik’i bir sağa bir sola götürüyor. Yaprak tam Minik’in önüne düşmeli.', soz: 'Minik nerede? Bana gösterin!' }, gorev: 'isabet',
          yonerge: 'Akıntı Minik’i sağa sola götürüyor. Minik’e tam üstünden dokun: Pamuk yaprağı onun önüne bıraksın. Iskalamak bir şey kaybettirmez.',
          sekil: 'karinca-minik', hedef: 4, adet: 1, hiz: .62, boy: 15,
          cozum: 'Yaprak süzülerek tam Minik’in önüne kondu.' },
        { id: 'tutunma', halka: 'Tutunacak yerleri gösterdi',
          engel: 'Minik yaprağa nereden tutunacak?',
          sahne: { tip: 'kesif', nesne: 'guvercin-cinar', adet: 2, kisi: 'karinca-minik', dekor: ['su', 'guvercin-nilufer', 'guvercin-sazlik'],
            metin: 'Yaprak yanında ama ıslak ve kaygan. Pamuk alçaktan uçup gagasıyla yaprağın sağlam damarlarını tek tek gösteriyor.', soz: 'Gösterdiğim yerlere basarsan kaymazsın!' }, gorev: 'takimyildiz',
          yonerge: 'Pamuk yaprağın sağlam yerlerini gösteriyor. Işıklar sönünce aynı yerlere dokun.',
          nokta: 12, yanan: 4, tur: 2, bakma: 2400,
          cozum: 'Minik sağlam damarlara basıp yaprağın üstüne tırmandı.' },
        { id: 'kiyi-yolu', halka: 'Kıyıya yol gösterdi',
          engel: 'Yaprak kayık kıyıya ulaşmalı.',
          sahne: { tip: 'gelis', nesne: 'guvercin-yaprakkayik', adet: 1, kisi: 'guvercin-pamuk', dekor: ['tas', 'guvercin-girdap', 'guvercin-sazlik'],
            metin: 'Minik yaprağın üstünde ama akıntı hâlâ güçlü. Önde kayalar ve küçük girdaplar var. Pamuk kanatlarıyla rüzgâr yapıp yaprağı yönlendirecek.', soz: 'Yolu siz gösterin, ben kanat çırparım!' }, gorev: 'yol',
          yonerge: 'Kayalara ve girdaplara değmeden yaprak kayığı kıyıya götüren bir yol çiz.',
          baslangic: { x: 105, y: 220, sekil: 'guvercin-yaprakkayik', ad: 'Yaprak kayık' }, bitis: { x: 900, y: 220, sekil: 'guvercin-sazlik', ad: 'Kıyı' },
          engeller: [ { x: 360, y: 130, r: 84, sekil: 'tas', ad: 'Kaya' },
                      { x: 520, y: 330, r: 80, sekil: 'guvercin-girdap', ad: 'Girdap' },
                      { x: 700, y: 150, r: 84, sekil: 'tas', ad: 'Kaya' } ],
          cozum: 'Yaprak kayık yavaşça kıyıya yanaştı.' },
        { id: 'basamak', halka: 'Basamak taşlarını dizdi',
          engel: 'Kıyıya çıkan basamaklar karışmış.',
          sahne: { tip: 'sorun', nesne: 'guvercin-nilufer', adet: 4, kisi: 'karinca-minik', dekor: ['guvercin-nilufer', 'tas', 'guvercin-sazlik'],
            metin: 'Yaprak kıyıya yanaştı ama arada biraz su kaldı. Pamuk nilüfer yapraklarını ve taşları sırayla dizip Minik’e basamak yapıyor.', soz: 'Nilüfer, nilüfer, taş… Sonra hangisi?' }, gorev: 'oruntu',
          yonerge: 'Baştan okuyalım: nilüfer, nilüfer, taş… Boşluklara hangisi geliyor?',
          dizi: [ 'guvercin-nilufer', 'guvercin-nilufer', 'tas', 'guvercin-nilufer', 'guvercin-nilufer', 'tas', 'guvercin-nilufer', null, null ],
          cevaplar: [ 'guvercin-nilufer', 'tas' ],
          secenekler: [ { sekil: 'guvercin-nilufer', ad: 'Nilüfer' }, { sekil: 'tas', ad: 'Taş' }, { sekil: 'guvercin-cinar', ad: 'Yaprak' } ],
          cozum: 'Minik nilüferden nilüfere, taştan taşa zıplayıp kıyıya çıktı!' }
      ],
      final: { id: 'islak-tuy', halka: 'Islanmayı dert etmedi',
               engel: 'Pamuk’un tüyleri sırılsıklam oldu.',
               sahne: { tip: 'cozuldu', nesne: 'su', adet: 4, kisi: 'guvercin-pamuk', dekor: ['guvercin-sazlik', 'guvercin-nilufer', 'agac'],
               metin: 'Minik kıyıda, güvende. Pamuk ona yardım ederken suya o kadar yaklaşmış ki tüyleri ıslanıp birbirine yapışmış. Ama hiç yakınmıyor.', soz: 'Biraz ıslandım ama değdi!' }, etkinlik: 'timarla',
               cozum: 'Pamuk’un tüyleri kurudu, yine pamuk gibi oldu. Minik ona bakıp “Teşekkür ederim,” dedi.' }
    },

    /* ═══════════ 02 · KIYI — Pamuk Minik’i evine götürür ═══════════ */
    {
      kod: 'kiyi', ad: 'Kıyı', baslik: 'Eve dönüş yolu', bolumSonu: 'Minik evinde!',
      renk: '#7FB069', acik: '#DDEFC4', gok: '#EFF7E6', zemin: '#BFDB8A',
      hikaye: 'Minik kıyıda ama üşüyor, yorgun ve yuvası uzakta. Akıntı sırtındaki heybeyi de dağıtmış. Pamuk onu yalnız bırakmıyor: “Seni evine kadar götüreceğim,” diyor.',
      soz: '“İyilik yarım bırakılmaz.”',
      karakter: { kod: 'karinca-minik', ad: 'Minik', tur: 'Karınca' },
      sozler: [ 'Ben Minik. Biraz üşüdüm ama iyiyim!', 'Pamuk’la yol çok kısa geliyor!', 'İşte yuvam! Bu iyiliği hiç unutmayacağım.' ],
      armagan: { kod: 'guvercin-karincayuvasi', ad: 'Karınca yuvası', renk: '#B48A5E' },
      engeller: [
        { id: 'yorgan', halka: 'Yapraktan yorgan yaptı',
          engel: 'Minik titriyor; sıcak bir örtü lazım.',
          sahne: { tip: 'istek', nesne: 'guvercin-kuruyaprak', adet: 5, kisi: 'karinca-minik', dekor: ['agac', 'guvercin-kuruyaprak', 'ot'],
            metin: 'Minik kıyıda titriyor. Pamuk çınarın dalını hafifçe sallıyor; güneşte ısınmış kuru yapraklar süzülerek düşüyor.', soz: 'Kuru yapraklar sıcacık tutar!' }, gorev: 'yakala',
          yonerge: 'Parmağını aşağıda gezdir, sepeti kaydır. Kuru yaprakları tut; su damlası gelirse sepeti kenara çek.',
          hedef: 8, hiz: .18, sikayet: 1100, iyi: [ 'guvercin-kuruyaprak', 'guvercin-cinar' ], kotu: [ 'su' ],
          cozum: 'Minik kuru yapraklara sarındı; titremesi geçti.' },
        { id: 'heybe', halka: 'Kaybolanları buldu',
          engel: 'Minik’in heybesinden bir şey eksik.',
          sahne: { tip: 'kesif', nesne: 'tohum', adet: 5, kisi: 'guvercin-pamuk', dekor: ['guvercin-sazlik', 'tas', 'ot'],
            metin: 'Akıntı Minik’in heybesini dağıtmış. Pamuk kıyıya vuranları tek tek toplayıp yan yana dizdi. Ama Minik sayınca bir şey hep eksik çıkıyor.', soz: 'Bir şey kayboldu ama ne?' }, gorev: 'kayip',
          yonerge: 'Dizilenlere iyi bakalım. Gözümüzü kapayıp açınca ne eksildi, bulalım.',
          tur: 2,
          ogeler: [ { ad: 'Buğday', sekil: 'tohum' }, { ad: 'Palamut', sekil: 'palamut' },
                    { ad: 'Ceviz', sekil: 'guvercin-ceviz' }, { ad: 'Elma', sekil: 'elma' },
                    { ad: 'Kozalak', sekil: 'kozalak' } ],
          cozum: 'Eksik olan bulundu; Minik’in heybesi yeniden tamam.' },
        { id: 'tohum-bolustu', halka: 'Buğdayını paylaştı',
          engel: 'Pamuk buğday tanelerini paylaştırıyor.',
          sahne: { tip: 'istek', nesne: 'tohum', adet: 6, kisi: 'guvercin-pamuk', dekor: ['ot', 'tohum', 'guvercin-nilufer'],
            metin: 'Yolda bir avuç buğday buldular. Tam o sırada Minik’in kardeşi Nokta da onu aramaya gelmiş! Pamuk tanelere bakıyor: kimse eksik kalmamalı.', soz: 'Herkese aynı sayıda, olur mu?' }, gorev: 'paylas',
          yonerge: 'Taneleri Minik’e, Nokta’ya ve Pamuk’a eşit bölelim.',
          dostlar: [ { sekil: 'karinca-minik', ad: 'Minik' }, { sekil: 'karinca-minik', ad: 'Nokta' }, { sekil: 'guvercin-pamuk', ad: 'Pamuk' } ],
          yem: 'tohum', yemAd: 'Buğday', adet: 9,
          cozum: 'Üçü de eşit pay aldı. Pamuk kendi payından bile Minik’e vermek istedi.' },
        { id: 'yol-sordu', halka: 'Yolu dostlara sordu',
          engel: 'Minik’in yuvası hangi yönde?',
          sahne: { tip: 'gelis', nesne: 'kus', adet: 3, kisi: 'guvercin-pamuk', dekor: ['agac', 'ot', 'guvercin-sazlik'],
            metin: 'Pamuk yukarıdan bakıyor ama karınca yuvası otların arasında görünmüyor. Dere kenarındaki dostlara soruyor; her biri sırayla bir ipucu söylüyor.', soz: 'Dinleyin, sırayı unutmayalım!' }, gorev: 'dizi',
          yonerge: 'Dostlar sırayla seslendi. Önce dinleyelim, sonra aynı sırayla dokunalım.',
          dostlar: [ { sekil: 'inek', ad: 'Benek' }, { sekil: 'tavsan', ad: 'Kulak' }, { sekil: 'kus', ad: 'Limon' } ],
          uzunluklar: [ 2, 3, 4 ],
          cozum: 'Benek, Kulak ve kanarya Limon yolu tarif etti: yuva büyük taşın arkasındaymış.' },
        { id: 'sirtinda', halka: 'Minik’i sırtında taşıdı',
          engel: 'Pamuk Minik’i sırtında taşıyacak.',
          sahne: { tip: 'istek', nesne: 'tohum', adet: 4, kisi: 'guvercin-pamuk', dekor: ['ot', 'tas', 'agac'],
            metin: 'Yuva uzak, Minik’in bacakları yorgun. Pamuk sırtını uzattı: “Bin!” Ama heybe bir yana ağır gelirse Pamuk uçarken yan yatar.', soz: 'İki yanım eşit olsun.' }, gorev: 'terazi',
          yonerge: 'Sağ kefeye ekleyip terazi düzelene kadar deneyelim.',
          sol: [ { sekil: 'tohum', agirlik: 3 }, { sekil: 'guvercin-ceviz', agirlik: 2 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Büyük', agirlik: 3 }, { ad: 'Büyük', agirlik: 3 } ],
          cozum: 'Yük dengelendi; Pamuk Minik’i sırtında süzülerek taşıdı.' },
        { id: 'komsular', halka: 'Komşularla tanıştırdı',
          engel: 'Yolda dere komşularıyla tanıştılar.',
          sahne: { tip: 'kesif', nesne: 'yuva', adet: 4, kisi: 'karinca-minik', dekor: ['guvercin-nilufer', 'agac', 'guvercin-karincayuvasi'],
            metin: 'Pamuk uçarken Minik’e aşağıyı gösteriyor: “Bak, orada Zıpzıp yaşar, şurada balıklar…” Minik herkesin evini aklında tutmak istiyor.', soz: 'Kim nerede yaşıyor?' }, gorev: 'eslestir',
          yonerge: 'Her dostu kendi eviyle eşleştirelim.',
          ciftler: [ { a: 'Pamuk', asekil: 'guvercin-pamuk', b: 'Dal yuvası', bsekil: 'yuva' },
                     { a: 'Zıpzıp', asekil: 'kurbaga-zipzip', b: 'Nilüfer', bsekil: 'guvercin-nilufer' },
                     { a: 'Minik', asekil: 'karinca-minik', b: 'Toprak tepecik', bsekil: 'guvercin-karincayuvasi' },
                     { a: 'Balık', asekil: 'balik', b: 'Dere', bsekil: 'su' } ],
          cozum: 'Minik artık derenin bütün komşularını tanıyor.' }
      ],
      final: { id: 'karni-doydu', halka: 'Minik’i doyurdu',
               engel: 'Minik yuvasına vardı ama karnı guruldadı.',
               sahne: { tip: 'cozuldu', nesne: 'tohum', adet: 4, kisi: 'karinca-minik', dekor: ['guvercin-karincayuvasi', 'ot', 'tohum'],
               metin: 'İşte karınca yuvası! Kardeşleri kapıya koştu. Minik sabahtan beri hiçbir şey yememiş; Pamuk heybeden taneleri çıkardı.', soz: 'Karnım çok acıktı!' }, etkinlik: 'besle', yem: 'tohum',
               cozum: 'Minik’in karnı doydu. Pamuk’a sarılıp “Bu iyiliği hiç unutmayacağım,” dedi.' }
    },

    /* ═══════════ 03 · ÇINAR — Günler sonra, karşılık başlar ═══════════ */
    {
      kod: 'cinar', ad: 'Çınar', baslik: 'Günler sonra', bolumSonu: 'Karşılıklar birikiyor',
      renk: '#D9A54A', acik: '#F7E6BC', gok: '#FBF3DE', zemin: '#D7CE8A',
      hikaye: 'Günler geçti. Minik Pamuk’u hiç unutmadı. Bir sabah Zıpzıp haber getirdi: dün geceki rüzgâr Pamuk’un yuvasını dağıtmış! Minik hemen yola çıktı. Bu sefer yardım etme sırası onda.',
      soz: '“Küçük eller de büyük iyilik yapar.”',
      karakter: { kod: 'kurbaga-zipzip', ad: 'Zıpzıp', tur: 'Kurbağa' },
      sozler: [ 'Vrak! Ben Zıpzıp. Pamuk’a bir sürpriz yapalım mı?', 'Harika gidiyoruz, vrak vrak!', 'Pamuk buna çok sevinecek!' ],
      armagan: { kod: 'yuva', ad: 'Onarılmış yuva', renk: '#B58E60' },
      engeller: [
        { es: 'yorgan', halka: 'Yuvasını onardı',
          engel: 'Rüzgâr Pamuk’un yuvasını dağıtmış.',
          sahne: { tip: 'sorun', nesne: 'yuva', adet: 4, kisi: 'kurbaga-zipzip', dekor: ['agac', 'guvercin-kuruyaprak', 'ot'],
            metin: 'Minik ile Zıpzıp çınarın dibine geldi. Yerde dal parçaları, tüyler, yapraklar var: Pamuk’un yuvası dağılmış. Pamuk tohum toplamaya gitmiş, daha haberi yok.', soz: 'Pamuk dönmeden onaralım!' }, gorev: 'yapboz',
          yonerge: 'Parçaya dokun, sonra resimde ait olduğu boş yere dokun. Yuvayı birlikte onaralım.',
          resim: 'yuva', satir: 2, sutun: 3,
          cozum: 'Yuva eskisinden de sağlam oldu. Pamuk Minik’i sıcak tutmuştu; şimdi Minik ona sıcak bir yuva kurdu.' },
        { es: 'heybe', halka: 'Kayıp tüylerini buldu',
          engel: 'Yuvanın yumuşak tüyleri sazlığa uçmuş.',
          sahne: { tip: 'kesif', nesne: 'guvercin-tuy', adet: 5, kisi: 'karinca-minik', dekor: ['guvercin-sazlik', 'ot', 'guvercin-kuruyaprak'],
            metin: 'Yuvanın içini döşeyen yumuşak tüyler rüzgârla sazlığa savrulmuş. Minik kamışların arasına daldı; tüyler yaprakların altına saklanmış.', soz: 'Pamuk benim kaybolanlarımı bulmuştu. Şimdi sıra bende!' }, gorev: 'gizli',
          yonerge: 'Sazlığa iyi bakalım: yaprakların arasına saklanan dört tüyü bulalım.',
          tohum: 61, sus: 30, susBoy: [4, 8], boy: 11,
          gizli: [ { sekil: 'guvercin-tuy', ad: 'Birinci tüy', x: 16, y: 58, a: -12 },
                   { sekil: 'guvercin-tuy', ad: 'İkinci tüy', x: 72, y: 30, a: 18 },
                   { sekil: 'guvercin-tuy', ad: 'Üçüncü tüy', x: 46, y: 76, a: -24 },
                   { sekil: 'guvercin-tuy', ad: 'Dördüncü tüy', x: 84, y: 66, a: 9 } ],
          cozum: 'Dört tüy de bulundu; yuvanın içi yine yumuşacık.' },
        { es: 'tohum-bolustu', halka: 'Teşekkür sepeti hazırladı',
          engel: 'Minik Pamuk için bir teşekkür sepeti hazırlıyor.',
          sahne: { tip: 'istek', nesne: 'guvercin-sepet', adet: 1, kisi: 'karinca-minik', dekor: ['tohum', 'guvercin-sepet', 'ot'],
            metin: 'Pamuk bir gün buğdayını Minik’le paylaşmıştı. Minik de ona bir sepet hazırlamak istiyor. Zıpzıp elinden geleni getirmiş ama bazıları sepete hiç uymuyor!', soz: 'Bunlardan hangisi olmaz?' }, gorev: 'fark',
          yonerge: 'Her turda bir tanesi diğerlerine benzemiyor. Onu birlikte bulalım.',
          turlar: [
            { soru: 'Hangisi güvercinin yemi değil?',
              digerleri: [ { ad: 'Buğday', sekil: 'tohum' }, { ad: 'Başak', sekil: 'basak' }, { ad: 'Ot tohumu', sekil: 'ot' } ],
              yabanci: { ad: 'Taş', sekil: 'tas' }, neden: 'Taş yenmez! Diğer üçü güvercinlerin sevdiği tohumlar.' },
            { soru: 'Hangisi yuvaya konmaz?',
              digerleri: [ { ad: 'Tüy', sekil: 'guvercin-tuy' }, { ad: 'Kuru ot', sekil: 'saman' }, { ad: 'İnce dal', sekil: 'dal2' } ],
              yabanci: { ad: 'Şişe', sekil: 'sise' }, neden: 'Şişe yuvaya konmaz; ötekiler yuvayı yumuşak ve sıcak yapar.' },
            { soru: 'Hangisi uçamaz?',
              digerleri: [ { ad: 'Pamuk', sekil: 'guvercin-pamuk' }, { ad: 'Limon', sekil: 'kus' }, { ad: 'Yusufçuk', sekil: 'guvercin-yusufcuk' } ],
              yabanci: { ad: 'Zıpzıp', sekil: 'kurbaga-zipzip' }, neden: 'Zıpzıp gülüyor: “Ben zıplarım ama uçamam!”' }
          ],
          cozum: 'Sepet hazır: içinde yalnızca Pamuk’un sevdiği tohumlar var.' },
        { es: 'basamak', halka: 'Daldan merdiven kurdu',
          engel: 'Yuva yüksek dalda; sepet oraya nasıl çıkacak?',
          sahne: { tip: 'gelis', nesne: 'dal3', adet: 4, kisi: 'kurbaga-zipzip', dekor: ['agac', 'dal2', 'ot'],
            metin: 'Sepet hazır ama Pamuk’un dalı çok yüksek. Zıpzıp bir fikir buldu: dalları boylarına göre dizip merdiven yapmak. Tıpkı Pamuk’un kıyıda dizdiği basamaklar gibi.', soz: 'Kısadan uzuna dizersek çıkarız!' }, gorev: 'sirala',
          yonerge: 'Dalları en kısadan en uzuna doğru sıraya dizelim.',
          ogeler: [ { ad: 'En kısa', sekil: 'dal1' }, { ad: 'Kısa', sekil: 'dal2' },
                    { ad: 'Uzun', sekil: 'dal3' }, { ad: 'En uzun', sekil: 'dal4' } ],
          cozum: 'Merdiven kuruldu; Minik sepeti basamak basamak yukarı taşıdı.' },
        { es: 'komsular', halka: 'İzlerin sahibini buldu',
          engel: 'Çınarın dibinde yumuşak izler var.',
          sahne: { tip: 'kesif', nesne: 'guvercin-pati', adet: 5, kisi: 'karinca-minik', dekor: ['agac', 'guvercin-pati', 'ot'],
            metin: 'Minik merdivenden inerken yerde izler gördü: yuvarlak, yumuşak, dört parmaklı. Pamuk ona bütün komşuları tanıtmıştı. Bu izler hangisinin?', soz: 'Kim geçmiş buradan?' }, gorev: 'cift',
          yonerge: 'Yere düşen yaprakları çevir. İki kart aynıysa açık kalır; yerlerini aklında tut.',
          cift: [ 'guvercin-pati', 'guvercin-tuy', 'guvercin-nilufer', 'guvercin-cinar', 'guvercin-ceviz', 'kozalak' ],
          cozum: 'İzler Tekir’inmiş! Sazlıkta uyuyan kocaman tekir kedi.' },
        { es: 'yol-sordu', halka: 'Limon’la buğday ekti',
          engel: 'Pamuk’un sofrası hiç boş kalmasın.',
          sahne: { tip: 'gelis', nesne: 'tohum', adet: 5, kisi: 'kus', dekor: ['agac', 'ot', 'tohum'],
            metin: 'Pamuk bir zamanlar yolu dostlara sormuştu. O dostlardan sarı kanarya Limon da yardıma geldi: çınarın dibine buğday ekecekler. Bahar gelince Pamuk’un kapısının önünde taze başaklar olacak.', soz: 'Cik cik! Tohumu nereye bırakayım?' }, gorev: 'zaman',
          yonerge: 'Limon tohumu taşıyarak sağa sola uçuyor. Tam toprağın üstündeyken düğmeye bas. Acelemiz yok, istediğin kadar dene.',
          tasiyici: 'kus', tasiyiciAd: 'Limon', yuk: 'tohum', hedefAd: 'Verimli toprak',
          genislik: 30, hiz: 1, hedefSayisi: 3,
          cozum: 'Üç tohum da toprağa düştü. Minik üstlerini örttü; bahar gelince burada başaklar sallanacak.' }
      ],
      final: { es: 'karni-doydu', halka: 'Zıpzıp’a teşekkür etti',
               engel: 'Zıpzıp bütün gün Minik’e yardım etti.',
               sahne: { tip: 'istek', nesne: 'kalp', adet: 3, kisi: 'kurbaga-zipzip', dekor: ['guvercin-nilufer', 'agac', 'ot'],
               metin: 'Güneş batarken Pamuk yuvasına döndü. Onarılmış yuvayı ve sepeti görünce çok sevindi. Zıpzıp nilüferin üstünde yorgun ama mutlu.', soz: 'Bana da bir sarılma var mı?' }, etkinlik: 'sev',
               cozum: 'Zıpzıp’a kocaman sarıldık. Pamuk o gece yuvasında mışıl mışıl uyudu.' }
    },

    /* ═══════════ 04 · HAPŞIRIK — İyilik geri döner ═══════════ */
    {
      kod: 'hapsirik', ad: 'Hapşırık', baslik: 'Karşılık zamanı', bolumSonu: 'İyilik geri döndü!',
      renk: '#C48A5C', acik: '#F5DCC4', gok: '#FBEEE2', zemin: '#D9C39A',
      hikaye: 'Öğle sıcağında Pamuk dalında uyuyor. Sazlıktan Tekir çıktı: sessiz sessiz, pati pati çınara yaklaşıyor. Aklında bir oyun var ama Pamuk ürkerse daldan düşebilir. Onu yalnızca Minik gördü.',
      soz: '“İyilik unutulmaz; bir gün mutlaka geri döner.”',
      karakter: { kod: 'kedi-tekir', ad: 'Tekir', tur: 'Tekir kedi' },
      sozler: [ 'Mırr… Ben Tekir. Uykum var ama aklıma bir oyun takıldı.', 'Hapşuu! Burnum neden bu kadar kaşınıyor?', 'Özür dilerim. Sormadan oynamak olmazdı.' ],
      armagan: { kod: 'guvercin-gunestas', ad: 'Güneşli taş', renk: '#C4C9CE' },
      engeller: [
        { es: 'izledi', halka: 'Tekir’i gözden kaçırmadı',
          engel: 'Tekir sessizce çınara yaklaşıyor.',
          sahne: { tip: 'gelis', nesne: 'guvercin-pati', adet: 5, kisi: 'kedi-tekir', dekor: ['guvercin-sazlik', 'agac', 'ot'],
            metin: 'Tekir sazlıktan çıktı. Kuyruğu havada, patileri sessiz. Otların arasında bir görünüp bir kayboluyor. Minik ondan gözünü ayırmamalı.', soz: 'Mırr… Şu uyuyan güvercinle biraz oynasam?' }, gorev: 'takip',
          yonerge: 'Tekir otların arasında geziyor. Parmağını Tekir’in üstüne koy ve kaldırmadan takip et.',
          sekil: 'kedi-tekir', sure: 6000, hiz: .85, boy: 13,
          cozum: 'Minik Tekir’i hiç gözden kaçırmadı: Tekir çınarın dibinde durdu.' },
        { es: 'kiyi-yolu', halka: 'Sessiz yolu buldu',
          engel: 'Minik Tekir’e hışırtı yapmadan varmalı.',
          sahne: { tip: 'sorun', nesne: 'guvercin-kuruyaprak', adet: 6, kisi: 'karinca-minik', dekor: ['guvercin-kuruyaprak', 'ot', 'tas'],
            metin: 'Çınarın dibi kuru yapraklarla dolu. Minik bir yaprağa basarsa hışır hışır ses çıkar; Pamuk ürküp uyanır, daldan düşebilir.', soz: 'Pamuk bana yolu göstermişti. Şimdi yolu ben bulacağım!' }, gorev: 'yol',
          yonerge: 'Kuru yapraklara değmeden Minik’i Tekir’e götüren bir yol çiz.',
          baslangic: { x: 100, y: 220, sekil: 'karinca-minik', ad: 'Minik' }, bitis: { x: 905, y: 220, sekil: 'kedi-tekir', ad: 'Tekir' },
          engeller: [ { x: 330, y: 120, r: 84, sekil: 'guvercin-kuruyaprak', ad: 'Kuru yaprak' },
                      { x: 420, y: 330, r: 80, sekil: 'guvercin-kuruyaprak', ad: 'Kuru yaprak' },
                      { x: 640, y: 160, r: 86, sekil: 'guvercin-kuruyaprak', ad: 'Kuru yaprak' },
                      { x: 700, y: 360, r: 76, sekil: 'guvercin-kuruyaprak', ad: 'Kuru yaprak' } ],
          cozum: 'Minik tek bir yaprağa bile basmadan Tekir’in patisinin dibine vardı.' },
        { es: 'tutunma', halka: 'Tekir’e usulca tırmandı',
          engel: 'Minik Tekir’in burnuna nasıl ulaşacak?',
          sahne: { tip: 'kesif', nesne: 'guvercin-pati', adet: 2, kisi: 'karinca-minik', dekor: ['agac', 'ot', 'guvercin-sazlik'],
            metin: 'Tekir kocaman, Minik minicik. Patiden omza, omuzdan başa tırmanmalı. Zıpzıp nilüferden bakıp tutunacak yerleri fısıldıyor.', soz: 'Gösterdiğim yerlere bas, Minik!' }, gorev: 'takimyildiz',
          yonerge: 'Zıpzıp tutunacak yerleri gösteriyor. Hangi noktalar parladıysa aynılarına dokun.',
          nokta: 16, yanan: 5, tur: 2, bakma: 2800,
          cozum: 'Minik usulca tırmandı; Tekir hiçbir şey hissetmedi. İşte burnun ucu!' },
        { es: 'yaprak-birakti', halka: 'Tam zamanında gıdıkladı',
          engel: 'Tam zamanında gıdıklamak gerek.',
          sahne: { tip: 'istek', nesne: 'guvercin-tuy', adet: 2, kisi: 'karinca-minik', dekor: ['guvercin-sazlik', 'guvercin-tuy', 'ot'],
            metin: 'Minik sazlıkta bulduğu bir tüyü getirmiş. Tekir’in başı kamışların arasından bir görünüp bir kayboluyor. Pamuk bir zamanlar yaprağı tam Minik’in önüne bırakmıştı; şimdi sıra Minik’te.', soz: 'Tekir görünür görünmez!' }, gorev: 'refleks',
          yonerge: 'Tekir görünür görünmez dokun: tüy burnunu gıdıklasın. Kurbağa, yusufçuk ya da kamış çıkarsa bekle.',
          hedef: 5, gorunme: 1250, ara: 380,
          aranan: { sekil: 'kedi-tekir', ad: 'Tekir' },
          digerleri: [ { sekil: 'kurbaga-zipzip', ad: 'Kurbağa' }, { sekil: 'guvercin-yusufcuk', ad: 'Yusufçuk' }, { sekil: 'guvercin-sazlik', ad: 'Kamış' } ],
          cozum: 'Gıdı gıdı… HAPŞUUU! Tekir öyle bir hapşırdı ki bütün çınar sallandı.' },
        { es: 'yaprak-secti', halka: 'Pamuk’u uyandırdı',
          engel: 'Hapşırıkla çınarın yaprakları döküldü.',
          sahne: { tip: 'sorun', nesne: 'guvercin-cinar', adet: 6, kisi: 'guvercin-pamuk', dekor: ['agac', 'guvercin-cinar', 'guvercin-kuruyaprak'],
            metin: 'Hapşırık o kadar güçlüydü ki çınarın yaprakları yağmur gibi döküldü. Pamuk uyandı ve pırr diye havalandı. Güvende! Minik düşen yeşil yaprakları toplamaya koştu.', soz: 'Minik! Beni sen mi uyandırdın?' }, gorev: 'yakala',
          yonerge: 'Parmağını aşağıda gezdir, sepeti kaydır. Yeşil yaprakları tut; kuru yaprak gelirse sepeti kenara çek.',
          hedef: 10, hiz: .22, sikayet: 950, iyi: [ 'guvercin-cinar' ], kotu: [ 'guvercin-kuruyaprak' ],
          cozum: 'Pamuk dalında, güvende. Yeşil yapraklar da yuvasına çatı oldu.' },
        { es: 'sirtinda', halka: 'Tekir’le barıştırdı',
          engel: 'Tekir utandı ve özür diledi.',
          sahne: { tip: 'istek', nesne: 'guvercin-yusufcuk', adet: 4, kisi: 'kedi-tekir', dekor: ['guvercin-nilufer', 'guvercin-sazlik', 'agac'],
            metin: 'Tekir başını eğdi: “Özür dilerim. Sadece oynamak istemiştim ama sormadan olmazdı.” Pamuk gülümsedi. Tekir, Minik’le Zıpzıp’ı sırtına aldı; dere boyunca yusufçuklarla bir oyun başladı.', soz: 'Bu sefer sorarak oynayalım!' }, gorev: 'isabet',
          yonerge: 'Yusufçuklarla ebelemece! Gezinen yusufçuklara tam üstünden dokunup ebeleyelim. Iskalamak bir şey kaybettirmez.',
          sekil: 'guvercin-yusufcuk', hedef: 7, adet: 4, hiz: .75, boy: 12,
          cozum: 'Kimse korkmadı, kimse incinmedi. Tekir artık derenin yeni dostu.' }
      ],
      final: { es: 'islak-tuy', halka: 'Tekir’in tüylerini taradı',
               engel: 'Tekir’in tüyleri karmakarışık.',
               sahne: { tip: 'cozuldu', nesne: 'kalp', adet: 5, kisi: 'kedi-tekir', dekor: ['guvercin-gunestas', 'guvercin-nilufer', 'agac'],
               metin: 'Hapşırık, oyun, koşturmaca… Tekir’in tüyleri diken diken, kulağına bir yaprak takılmış. Güneşli taşın üstünde herkes yerini aldı.', soz: 'Beni de tarar mısınız? Mırr…' }, etkinlik: 'timarla',
               cozum: 'Tekir’in tüyleri parlıyor. Pamuk, Minik ve Tekir güneşli taşın üstüne yan yana uzandı.' }
    }
  ],

  kapanis: {
    baslik: 'İyilik unutulmadı.',
    metin: 'O günden sonra dere kenarında herkes birbirini tanıdı. Pamuk sabahları dalından Minik’e seslendi; Minik öğleden sonra Zıpzıp’la nilüferlerde zıpladı. Tekir mi? Artık oynamak istediğinde önce soruyor.\n\nAkşamüstleri üçü güneşli taşın üstünde yan yana uzanıyor: Pamuk, Minik ve Tekir. Zıpzıp da hemen yanlarında, nilüferinin üstünde. Pamuk bir gün Minik’e bir yaprak bırakmıştı; Minik de bir gün Pamuk için bir burnu gıdıkladı. İkisi de karşılık beklemeden yaptı. Ama ikisi de hiç unutmadı.',
    ders: 'Yapılan iyilik unutulmaz.'
  }
};

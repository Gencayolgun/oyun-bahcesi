/* MASAL — ŞEHİR FARESİ İLE TARLA FARESİ (Ezop)
   ─────────────────────────────────────────────
   Kaynak kamu malı: Ezop (~MÖ 600), sonra Horatius ve La Fontaine.
   Metin bana ait, çeviri değil.

   NEDEN AÇILABİLİYOR: Fabl iki ziyaretten ibaret ama her ziyaret bir
   DÜNYA demek. Tarlada arpa toplanır, kök çıkarılır, sofra kurulur; yolda
   patika, araba, kalabalık; şehirde dolaplar, ziller, kapılar, ışıklar;
   dönüşte hatıralar ve mektuplar. 40 dakikayı dolduran şey iki evin kendisi.

   FİNALİ YUMUŞATTIM: Ezop'ta şehirde köpekler saldırır, fareler canını
   zor kurtarır. Burada kimse kovalanmaz: "miyav" diyen, evin uykucu kedisi
   Mestan'dır — esner, sevilmek ister, yine uyur. Başak şehrin renklerini
   sever ama evini özler; Lokum tarlanın huzurunu ilk kez fark eder. Kimse
   haksız çıkmaz: iki kuzen birbirine mektup yazar, sırayla ziyaret eder.

   KURGU: karşılaştırma. Tahta ikiye bölünmüş bir pano — sol yarı Tarla,
   sağ yarı Şehir. Her durak bir yarıya bir kart ekler ("Tarlada: sessizlik",
   "Şehirde: ışıklar"), kartın güzel mi zor mu olduğu işaretlidir. Ortada
   iki kefeli bir terazi: kart düştükçe eğilir. 28 durakta 14'e 14 biter;
   son durakta terazi dengeye gelir — iki ev de aynı ağırlıkta.

   ÖNEM: her engelin 'onem' alanı (1 en önemli) sınıf küçükken kurgunun
   hangi durakları seçeceğini söyler. Omurga: Lokum tarlaya gelir (dizi),
   sade sofraya burun kıvırır (paylas); şehrin kapısı kalabalık (takip);
   dolaplar dolu (cift) ama ziller çalar (isabet); dönüşte Lokum ilk kez
   arpa toplar (refleks). Seçilenler yine yazıldığı sırayla oynanır. */

/* ——— Harita: durakların yeri ———
   Halka değil, dört parçalı bir yolculuk: 1. bölüm tarlanın içinde
   (sol üst), 2. bölüm üstten şehre doğru, 3. bölüm şehrin sokaklarında
   (sağ alt), 4. bölüm alttan tarlaya geri. Her bölümün durakları kendi
   parçasına eşit aralıkla dağıtılır; sınıf kaç kişi olursa olsun. */
const PARCALAR = [
  [[-9.2, -1.6], [-10.3, -3.8], [-10.2, -6.2], [-8.6, -7.9], [-6.3, -7.4], [-4.2, -8.1], [-1.4, -7.0]],
  [[-1.4, -7.0], [0.8, -5.6], [3.2, -6.4], [5.6, -5.6], [8.0, -6.2], [9.8, -4.8], [10.0, -2.2]],
  [[10.0, -2.2], [8.6, 0.2], [6.0, 0.8], [4.6, 3.2], [6.0, 5.4], [8.6, 4.6], [9.6, 6.8], [7.4, 8.0]],
  [[7.4, 8.0], [4.6, 7.2], [2.0, 8.0], [-0.8, 7.0], [-3.6, 7.8], [-6.2, 6.8], [-8.8, 7.6], [-10.4, 5.6], [-10.2, 2.8]]
];
function parcadaNokta(p, t) {
  const boylar = [];
  let toplam = 0;
  for (let i = 1; i < p.length; i++) { const b = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); boylar.push(b); toplam += b; }
  let kalan = t * toplam;
  for (let i = 0; i < boylar.length; i++) {
    if (kalan <= boylar[i] || i === boylar.length - 1) {
      const k = Math.max(0, Math.min(1, kalan / boylar[i]));
      return { x: p[i][0] + (p[i + 1][0] - p[i][0]) * k, z: p[i][1] + (p[i + 1][1] - p[i][1]) * k };
    }
    kalan -= boylar[i];
  }
  return { x: p[0][0], z: p[0][1] };
}
export function kasabaYerlesimi(duraklar) {
  const yer = [];
  for (let b = 0; b < PARCALAR.length; b++) {
    const grup = duraklar.map((d, i) => ({ d, i })).filter(x => x.d.bolum === b);
    grup.forEach(({ i }, j) => { yer[i] = parcadaNokta(PARCALAR[b], (j + .5) / grup.length); });
  }
  return yer;
}

export default {
  kod: 'sehirfaresi',
  ad: 'Şehir Faresi ile Tarla Faresi',
  kaynak: 'Ezop fablı',
  ders: 'Herkesin evi kendine güzel',
  sure: '40 dakika · bütün sınıf',
  ozet: 'Tarla faresi Başak ile şehir faresi Lokum birbirinin evini gezer; her durakta iki dünyayı karşılaştıran panoya bir kart eklersiniz.',
  renk: '#C6934B',
  ikon: 'sehirfaresi-ikiev',

  /* KURGU: karşılaştırma. Pano iki yarı, terazi iki kefe. */
  kurgu: 'karsilastirma',
  karsilastirma: {
    sol: { ad: 'Tarla', yer: 'Tarlada', ikon: 'in', ev: 'Başak’ın yuvası' },
    sag: { ad: 'Şehir', yer: 'Şehirde', ikon: 'sehirfaresi-ev', ev: 'Lokum’un evi' },
    yolcu: 'fare-basak',
    terazi: 'Ne güzel · ne zor'
  },

  /* Mekân: kasaba. Sol yarı buğday tarlası, ahır, saman; sağ yarı küçük
     bir şehir: evler, fırın, sokak lambaları, arnavut kaldırımı, çeşme.
     Ortada iki dünyayı bağlayan kavşak; ilerledikçe mektup kutusu ve
     bayraklar geliyor. */
  dunya: { mekan: 'kasaba', gok: 0xe3ecef, cevre: 0xa9bf85, yol: 0xeadcbc, cekirdek: 51123,
    yerlesim: kasabaYerlesimi, yolKapali: false,
    piyonTur: 'tarla-faresi', piyon: 0xc08a52, piyonKarin: 0xf7ecd6, piyonIc: 0xefa99c,   // çocuk Başak olarak dolaşır
    /* Çözülen her durak yolun kenarına bir mektup bırakır — iki kuzenin
       yazışması harita boyunca uzuyor. */
    izNotu: { bos: 'Henüz mektup yazılmadı', dolu: '{n} mektup yazıldı · iki dünya yaklaşıyor' },
    iz: 'mektup', izRenk: 0xfbf4e3, kesifRenk: 0xd9714f,
    kesif: [
      { x: -9.6, z: -0.1, ikon: 'in', ad: 'Başak’ın yuvası',
        metin: 'Başak’ın yuvası çitin dibinde, toprağın altında. Üç odası var: biri arpa ambarı, biri yatak odası, biri de misafir odası — Lokum gelsin diye dün süpürüldü.' },
      { x: -5.4, z: 5.2, ikon: 'saman', ad: 'Eski ahır',
        metin: 'Ahırın samanlığı Başak’ın saklambaç yeri. Yağmur yağınca tarlanın bütün fareleri burada toplanır ve damdaki yağmur sesini dinler.' },
      { x: 0, z: 2.75, ikon: 'sehirfaresi-tabela', ad: 'Yol tabelası',
        metin: 'Bir kolu tarlayı, öbür kolu şehri gösterir. Kurşun her sabah tabelanın tepesine konar ve iki yana da bakar: bir yanda sarı başaklar, öbür yanda kırmızı çatılar.' },
      { x: 7.0, z: -8.0, ikon: 'sehirfaresi-simit', ad: 'Fırın',
        metin: 'Şehrin fırını gün doğmadan yanar. Fırıncı her sabah kapının önüne bir avuç susam düşürür — Lokum’un kahvaltısı o susamlardır.' },
      { x: 11.4, z: 5.6, ikon: 'sehirfaresi-cesme', ad: 'Meydan çeşmesi',
        metin: 'Çeşme hiç susmaz. Güvercinler gündüz kenarında su içer, fareler gece herkes uyuyunca. Lokum’a göre şehrin en serin yeri burası.' }
    ]},

  acilis: [
    { tag: 'BİR VARMIŞ, BİR YOKMUŞ', baslik: 'Tarlada küçük bir yuva.', ikon: 'in',
      metin: 'Sarı bir buğday tarlasının kenarında Başak adında bir tarla faresi yaşarmış. Yuvası küçükmüş ama sıcacıkmış. Sabahları serçeler, akşamları cırcır böcekleri şarkı söylermiş.' },
    { tag: 'İKİ KUZEN', baslik: 'Biri tarlada, biri şehirde.', ikon: 'sehirfaresi-ev',
      metin: 'Başak’ın bir kuzeni varmış: Lokum. Lokum şehirde, büyük bir evin duvarında yaşarmış. Bir gün Başak ona bir mektup yollamış: “Gel, sana tarlamı göstereyim!”' },
    { tag: 'BU MASALIN KAHRAMANI SİZSİNİZ', baslik: 'İki dünya, tek bir pano.', ikon: 'sehirfaresi-ikiev',
      metin: 'Sırayla tahtaya gelip önce tarlayı, sonra şehri gezeceğiz. Her durakta panoya bir kart ekleyeceğiz: tarlada ne güzel, şehirde ne zor? Sonunda terazinin hangi yana eğildiğine birlikte bakacağız.' }
  ],

  bolumler: [
    /* ═══ 1 · TARLA — Başak misafir bekliyor ═══ */
    {
      kod: 'tarla', ad: 'Tarla', baslik: 'Başak’ın sessiz yuvası', konum: 'sol',
      bolumSonu: 'Tarla gezildi — sıra şehirde!',
      renk: '#C9A24A', acik: '#F5E6B8', gok: '#FBF3DC', zemin: '#D9C27A',
      hikaye: 'Buğday tarlasının kenarında, bir çitin dibinde Başak’ın yuvası var. Bugün kuzeni Lokum şehirden geliyor. Başak sabahtan beri koşturuyor: arpa toplanacak, kök çıkarılacak, kapı süslenecek.',
      soz: '“Küçük yuvanın kapısı misafire hep açıktır.”',
      karakter: { kod: 'fare-basak', ad: 'Başak', tur: 'Tarla faresi' },
      sozler: [ 'Ben Başak! Kuzenim geliyor, bana yardım eder misin?', 'Ne güzel gidiyor, yuva şenlendi!', 'Her şey hazır. Tarlanın en güzel sofrası bu!' ],
      armagan: { kod: 'sehirfaresi-arpa', ad: 'Arpa demeti', renk: '#D9B356' },
      engeller: [
        { engel: 'Rüzgâr arpa başaklarını savuruyor.',
          sahne: { tip: 'sorun', nesne: 'sehirfaresi-arpa', adet: 6, kisi: 'fare-basak', dekor: ['basak', 'ot', 'sehirfaresi-cicek'],
            metin: 'Başak sabah erkenden tarlaya çıktı: kuzeni geliyor, sofraya taze arpa lazım. Ama rüzgâr esti ve başaklar dört bir yana savruldu.', soz: 'Arpalarım uçuyor!' }, gorev: 'yakala', onem: 3,
          yonerge: 'Rüzgâr arpaları ve yaprakları savuruyor. Parmağını aşağıda gezdir, sepeti kaydır; yalnız arpaları tut.',
          hedef: 8, hiz: .18, sikayet: 1150, iyi: [ 'sehirfaresi-arpa', 'tohum' ], kotu: [ 'yaprak' ],
          kart: { yan: 'sol', metin: 'bol arpa', ikon: 'sehirfaresi-arpa', tip: 'guzel' },
          cozum: 'Sepet arpayla doldu; sofraya yetecek kadar var.' },
        { engel: 'Tatlı kökler toprağın altında saklanıyor.',
          sahne: { tip: 'kesif', nesne: 'sehirfaresi-kok', adet: 4, kisi: 'fare-basak', dekor: ['ot', 'toprak', 'sehirfaresi-cicek'],
            metin: 'Başak burnunu toprağa yaklaştırdı. Buralarda bir yerde tatlı kökler var — ama otların arasına saklanmışlar.', soz: 'Kokusunu alıyorum, buradalar!' }, gorev: 'gizli', onem: 4,
          yonerge: 'Otların arasına saklanan iki kökü ve bir gelinciği bulalım.',
          tohum: 57, sus: 26, susBoy: [4, 8], boy: 11,
          gizli: [ { sekil: 'sehirfaresi-kok', ad: 'Birinci kök', x: 22, y: 58, a: -12 },
                   { sekil: 'sehirfaresi-kok', ad: 'İkinci kök', x: 71, y: 34, a: 10 },
                   { sekil: 'sehirfaresi-cicek', ad: 'Gelincik', x: 52, y: 76, a: 6 } ],
          kart: { yan: 'sol', metin: 'taze kökler', ikon: 'sehirfaresi-kok', tip: 'guzel' },
          cozum: 'Kökler çıktı, bir de gelincik bulundu — sofraya süs olacak.' },
        { engel: 'Yuvanın kapısı misafire süslenecek.',
          sahne: { tip: 'gelis', nesne: 'sehirfaresi-cicek', adet: 5, kisi: 'fare-basak', dekor: ['sehirfaresi-cicek', 'ot', 'basak'],
            metin: 'Başak’ın kapısı toprakta küçük bir delik. Lokum ilk kez gelecek; Başak kapının çevresini çiçek ve başakla süslemek istiyor — ama bir düzenle.', soz: 'Çiçek, başak, çiçek, başak…' }, gorev: 'oruntu', onem: 6,
          yonerge: 'Sıraya bak: çiçek, başak, çiçek, başak… boşluklara hangisi geliyor?',
          dizi: [ 'sehirfaresi-cicek', 'basak', 'sehirfaresi-cicek', 'basak', null, null, 'sehirfaresi-cicek' ],
          cevaplar: [ 'sehirfaresi-cicek', 'basak' ],
          secenekler: [ { sekil: 'sehirfaresi-cicek', ad: 'Gelincik' }, { sekil: 'basak', ad: 'Başak' }, { sekil: 'tas', ad: 'Taş' } ],
          kart: { yan: 'sol', metin: 'çiçekli kapı', ikon: 'sehirfaresi-cicek', tip: 'guzel' },
          cozum: 'Kapı çiçek çiçek süslendi; yuva misafire hazır.' },
        { engel: 'Lokum geldi! Komşular sırayla selam veriyor.',
          sahne: { tip: 'gelis', nesne: 'sehirfaresi-bavul', adet: 2, kisi: 'fare-lokum', dekor: ['basak', 'in', 'ot'],
            metin: 'Tozlu yoldan şık bir fare göründü: bereli, papyonlu, elinde bavul. Lokum geldi! Tarlanın komşuları “hoş geldin” demek için sıraya girdi.', soz: 'Merhaba kuzen! Burası… çok sessizmiş.' }, gorev: 'dizi', onem: 1,
          yonerge: 'Komşular sırayla selam veriyor. Dinleyip aynı sırayla selam verelim.',
          dostlar: [ { sekil: 'inek', ad: 'İnek' }, { sekil: 'koyun', ad: 'Kuzu' },
                     { sekil: 'tavuk', ad: 'Tavuk' }, { sekil: 'kus', ad: 'Serçe' } ],
          uzunluklar: [ 3, 4 ],
          kart: { yan: 'sol', metin: 'dost komşular', ikon: 'koyun', tip: 'guzel' },
          cozum: 'Lokum bütün komşularla tanıştı. Serçe ona bir tüy hediye etti.' },
        { engel: 'Sofra kuruldu: arpalar üç tabağa bölünecek.',
          sahne: { tip: 'istek', nesne: 'sehirfaresi-arpa', adet: 6, kisi: 'fare-basak', dekor: ['in', 'basak', 'sehirfaresi-kok'],
            metin: 'Yuvada sofra kuruldu: arpa, kök, bir damla bal. Serçe komşu da geldi. Lokum tabağa baktı ve burnunu kıvırdı: “Hepsi bu mu?”', soz: 'Herkese eşit düşsün, olur mu?' }, gorev: 'paylas', onem: 2,
          yonerge: 'Arpaları üç tabağa eşit bölelim; kimseye az, kimseye çok düşmesin.',
          dostlar: [ { sekil: 'fare-basak', ad: 'Başak' }, { sekil: 'fare-lokum', ad: 'Lokum' }, { sekil: 'kus', ad: 'Serçe' } ],
          yem: 'sehirfaresi-arpa', yemAd: 'Arpa', adet: 9,
          kart: { yan: 'sol', metin: 'sade sofra', ikon: 'sehirfaresi-arpa', tip: 'zor' },
          cozum: 'Üç tabak da eşit doldu. Lokum yine de fısıldadı: “Şehirde pasta var…”' },
        { engel: 'Gece oldu; tarlada tek ışık ateşböcekleri.',
          sahne: { tip: 'kesif', nesne: 'yildiz', adet: 6, kisi: 'fare-lokum', dekor: ['basak', 'ot', 'in'],
            metin: 'Tarlaya gece çöktü. Ne sokak lambası var ne pencere. Lokum şaşırdı: “Ne kadar karanlık!” Başak gülümseyip yukarıyı gösterdi: ateşböcekleri yanıp sönüyordu.', soz: 'Aaa… bak, ışıklar dans ediyor!' }, gorev: 'takimyildiz', onem: 5,
          yonerge: 'Ateşböcekleri yanıp sönüyor. Hangileri parladıysa aynılarına dokunalım.',
          nokta: 12, yanan: 4, tur: 2, bakma: 2400,
          kart: { yan: 'sol', metin: 'karanlık gece', ikon: 'yildiz', tip: 'zor' },
          cozum: 'Ateşböcekleri bir daha parladı. Lokum karanlığı ilk kez biraz güzel buldu.' }
      ],
      final: { engel: 'Başak bütün gün koşturdu, kendisi hiç yemedi.',
               sahne: { tip: 'istek', nesne: 'sehirfaresi-kok', adet: 3, kisi: 'fare-basak', dekor: ['in', 'basak', 'sehirfaresi-cicek'],
               metin: 'Sofra toplandı, misafir yattı. Başak yuvanın kapısına oturdu: sabahtan beri arpa taşıdı, kök çıkardı, kapı süsledi — ama kendisi tek lokma yemedi.', soz: 'Karnım biraz acıktı…' }, etkinlik: 'besle', yem: 'tohum',
               kart: { yan: 'sol', metin: 'derin huzur', ikon: 'in', tip: 'guzel' },
               cozum: 'Başak doydu. Lokum yanına geldi: “Kuzen, tarla güzel ama çok sessiz. Gel, sana şehri göstereyim!”' }
    },

    /* ═══ 2 · YOLCULUK — şehre giden yol ═══ */
    {
      kod: 'yolculuk', ad: 'Yolculuk', baslik: 'Şehre giden uzun yol', konum: 'saga',
      bolumSonu: 'Yol bitti — şehre vardık!',
      renk: '#6F9BB0', acik: '#D6E6EE', gok: '#EAF3F7', zemin: '#C9CFA8',
      hikaye: 'Lokum’un bir arkadaşı var: çatıların üstünden her yolu gören güvercin Kurşun. Kurşun iki fareye yol gösterecek. Tarladan çıkıp köprüyü geçecek, bir arabaya binip şehrin kapısına varacaklar.',
      soz: '“Yol uzunsa, iyi bir arkadaş onu kısaltır.”',
      karakter: { kod: 'guvercin-kursun', ad: 'Kurşun', tur: 'Şehirli güvercin' },
      sozler: [ 'Gurr gurr! Ben Kurşun. Yolu yukarıdan görürüm, peşimden gelin!', 'Harika, yarı yolu geçtik!', 'İşte şehir! Hoş geldiniz!' ],
      armagan: { kod: 'sehirfaresi-tuy', ad: 'Kurşun’un tüyü', renk: '#9AA6B3' },
      engeller: [
        { engel: 'Tarladan çıkan patika taşlarla dolu.',
          sahne: { tip: 'gelis', nesne: 'tas', adet: 5, kisi: 'guvercin-kursun', dekor: ['ot', 'tas', 'sehirfaresi-tabela'],
            metin: 'Sabah çitin üstüne bir güvercin kondu: Kurşun, Lokum’un şehirli arkadaşı. “Yolu yukarıdan görürüm,” dedi. Ama tarladan çıkan patika taşla ve su birikintisiyle dolu.', soz: 'Gurr gurr! Beni izleyin, taşlara basmayın.' }, gorev: 'yol', onem: 2,
          yonerge: 'Taşlara ve su birikintisine değmeden Başak’a köprüye kadar bir yol çizelim.',
          baslangic: { x: 105, y: 220, sekil: 'fare-basak', ad: 'Başak' }, bitis: { x: 900, y: 220, sekil: 'sehirfaresi-kopru', ad: 'Köprü' },
          engeller: [ { x: 330, y: 128, r: 84, sekil: 'tas', ad: 'Taş' },
                      { x: 480, y: 322, r: 80, sekil: 'su', ad: 'Su birikintisi' },
                      { x: 690, y: 140, r: 86, sekil: 'tas', ad: 'Taş' } ],
          kart: { yan: 'sol', metin: 'taşlı patikalar', ikon: 'tas', tip: 'zor' },
          cozum: 'Patika geçildi, köprüye varıldı. Başak dönüp tarlasına el salladı.' },
        { engel: 'Dönüş yolu unutulmasın diye iz bırakılacak.',
          sahne: { tip: 'istek', nesne: 'tohum', adet: 5, kisi: 'guvercin-kursun', dekor: ['ot', 'toprak', 'sehirfaresi-tabela'],
            metin: 'Başak birden durdu: “Ya dönüşte yolu bulamazsam?” Kurşun bir fikir buldu: yol boyunca yumuşak toprağa tohum bırakacak. Dönüşte filizler yolu gösterecek.', soz: 'Tam toprağın üstündeyken söyleyin, bırakayım!' }, gorev: 'zaman', onem: 5,
          yonerge: 'Kurşun tohumu taşıyor. Tam yumuşak toprağın üstündeyken bıraktıralım.',
          genislik: 30, hiz: 1, hedefSayisi: 3,
          kart: { yan: 'sol', metin: 'yumuşak toprak', ikon: 'toprak', tip: 'guzel' },
          cozum: 'Üç tohum toprağa düştü. Dönüş yolu artık kaybolmaz.' },
        { engel: 'Şehre giden arabanın yükü bir yana kaymış.',
          sahne: { tip: 'sorun', nesne: 'sehirfaresi-bavul', adet: 3, kisi: 'fare-lokum', dekor: ['kutu', 'ot', 'sehirfaresi-tabela'],
            metin: 'Şehre sebze götüren bir arabaya atladılar. Ama Lokum’un bavulları hep bir yana yığılmış; araba yalpalıyor.', soz: 'Aman! Bavullarım devrilecek!' }, gorev: 'terazi', onem: 4,
          yonerge: 'Sağ kefeye yük ekleyip arabayı dengeleyelim.',
          sol: [ { sekil: 'sehirfaresi-bavul', agirlik: 3 }, { sekil: 'sehirfaresi-bavul', agirlik: 2 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 } ],
          kart: { yan: 'sag', metin: 'ağır bavullar', ikon: 'sehirfaresi-bavul', tip: 'zor' },
          cozum: 'Araba dengelendi; tıkır tıkır şehre doğru ilerliyor.' },
        { engel: 'Şehrin kapısı kalabalık; Kurşun gözden kaybolmasın.',
          sahne: { tip: 'gelis', nesne: 'ayakkabi', adet: 6, kisi: 'guvercin-kursun', dekor: ['sehirfaresi-ev', 'sehirfaresi-lamba', 'sehirfaresi-ev'],
            metin: 'Araba şehrin kapısında durdu. Her yerde ayak, tekerlek, ses! Kurşun önden uçuyor; onu kaybeden bu kalabalıkta yolunu bulamaz.', soz: 'Gözünüz bende olsun!' }, gorev: 'takip', onem: 1,
          yonerge: 'Kurşun kalabalığın üstünden uçuyor. Parmağını üstüne koy ve kaldırmadan takip et.',
          sekil: 'guvercin-kursun', sure: 5000, hiz: .7, boy: 15,
          kart: { yan: 'sag', metin: 'kalabalık sokaklar', ikon: 'ayakkabi', tip: 'zor' },
          cozum: 'Kurşun’u hiç kaybetmedik; kalabalığın öbür ucuna çıktık.' },
        { engel: 'Pazar yerinde her şey aynı anda geçiyor.',
          sahne: { tip: 'kesif', nesne: 'sehirfaresi-simit', adet: 5, kisi: 'fare-basak', dekor: ['sehirfaresi-lamba', 'sehirfaresi-ev', 'sehirfaresi-cesme'],
            metin: 'Pazar yeri rengârenk: simitler, çiçekler, şemsiyeler… Başak’ın gözleri kamaştı. Kurşun arada bir başını uzatıp “Buradan!” diyor.', soz: 'Ne kadar çok renk var!' }, gorev: 'refleks', onem: 6,
          yonerge: 'Kurşun başını uzatınca dokun, öyle ilerleyelim. Başka bir şey geçerken bekle.',
          hedef: 4, gorunme: 1200, ara: 260,
          aranan: { sekil: 'guvercin-kursun', ad: 'Kurşun' },
          digerleri: [ { sekil: 'ayakkabi', ad: 'Ayakkabı' }, { sekil: 'semsiye', ad: 'Şemsiye' }, { sekil: 'sehirfaresi-simit', ad: 'Simit' } ],
          kart: { yan: 'sag', metin: 'renkli pazar', ikon: 'sehirfaresi-simit', tip: 'guzel' },
          cozum: 'Pazar geçildi. Başak yerde bir susam tanesi buldu ve cebine koydu.' },
        { engel: 'Yol tabelası kırılmış: Lokum’un evi hangi yolda?',
          sahne: { tip: 'sorun', nesne: 'sehirfaresi-tabela', adet: 3, kisi: 'fare-lokum', dekor: ['sehirfaresi-ev', 'sehirfaresi-lamba', 'sehirfaresi-ev'],
            metin: 'Kavşaktaki tabela rüzgârda düşmüş, parçaları dağılmış. Lokum bile karıştırdı: evi hangi sokaktaydı?', soz: 'Bütün sokaklar birbirine benziyor!' }, gorev: 'yapboz', onem: 3,
          yonerge: 'Tabelanın parçalarını yerine koyup yolu bulalım.',
          resim: 'sehirfaresi-tabela', satir: 2, sutun: 3,
          kart: { yan: 'sag', metin: 'yüksek evler', ikon: 'sehirfaresi-ev', tip: 'guzel' },
          cozum: 'Tabela tamamlandı: Lokum’un evi fırının arkasındaki sokakta!' }
      ],
      final: { engel: 'Kurşun bütün yolu önden uçtu.',
               sahne: { tip: 'istek', nesne: 'sehirfaresi-tuy', adet: 4, kisi: 'guvercin-kursun', dekor: ['sehirfaresi-ev', 'sehirfaresi-lamba', 'sehirfaresi-cesme'],
               metin: 'İşte Lokum’un sokağı! Kurşun çeşmenin kenarına kondu. Rüzgâr bütün yol tüylerini karıştırmış; boynundaki renkler görünmüyor bile.', soz: 'Gurr… Tüylerim darmadağın!' }, etkinlik: 'timarla',
               kart: { yan: 'sag', metin: 'parlak güvercinler', ikon: 'guvercin-kursun', tip: 'guzel' },
               cozum: 'Kurşun’un tüyleri parladı, boynu gökkuşağı gibi ışıldadı. Bir tüyünü Başak’a verdi: “Yol hatıran olsun.”' }
    },

    /* ═══ 3 · ŞEHİR — ışıklar, pastalar ve bir miyav ═══ */
    {
      kod: 'sehir', ad: 'Şehir', baslik: 'Işıklar, pastalar ve bir miyav', konum: 'sag',
      bolumSonu: 'Şehir gezildi — Başak evini özledi',
      renk: '#C9785D', acik: '#F6DCD0', gok: '#FBEFE8', zemin: '#D9C3B0',
      hikaye: 'Şehir parlak ve kalabalık. Lokum’un evi büyük bir mutfağın duvarında: rafta peynir, masada pasta, her yerde ışık. Ama her lokmada bir kapı çarpıyor, bir zil çalıyor… ve bir yerden bir miyav geliyor.',
      soz: '“Her yerin bir ışığı, bir de gürültüsü vardır.”',
      karakter: { kod: 'kedi-mestan', ad: 'Mestan', tur: 'Uykucu ev kedisi' },
      sozler: [ 'Miyaav… Merhaba! Ben bu evin uykucu kedisi Mestan.', 'Hııı… çok güzel gidiyorsunuz. Ben biraz daha uyuyayım.', 'Mırr mırr… Artık dostuz, değil mi?' ],
      armagan: { kod: 'sehirfaresi-lokum', ad: 'Pembe lokum', renk: '#E79AB0' },
      engeller: [
        { engel: 'Mutfağın dolapları neler saklıyor?',
          sahne: { tip: 'kesif', nesne: 'sehirfaresi-peynir', adet: 4, kisi: 'fare-lokum', dekor: ['sehirfaresi-lamba', 'kutu', 'sehirfaresi-ev'],
            metin: 'Lokum’un evi kocaman bir mutfağın duvarında. Delikten çıkınca dolaplar, raflar, kavanozlar… Lokum göz kırptı: “Hepsinde bir şey saklı!”', soz: 'Hangi kapakta ne var, aklında tut!' }, gorev: 'cift', onem: 1,
          yonerge: 'İki kapak aç; içlerinden aynısı çıkarsa açık kalır. Yerlerini aklında tut.',
          cift: [ 'sehirfaresi-peynir', 'sehirfaresi-pasta', 'sehirfaresi-simit', 'sehirfaresi-lokum', 'elma', 'yumurta' ],
          kart: { yan: 'sag', metin: 'dolu dolaplar', ikon: 'sehirfaresi-peynir', tip: 'guzel' },
          cozum: 'Bütün dolaplar açıldı: peynir, pasta, simit, lokum… Başak’ın ağzı açık kaldı.' },
        { engel: 'Tam sofraya oturunca ziller çalmaya başladı.',
          sahne: { tip: 'sorun', nesne: 'sehirfaresi-zil', adet: 5, kisi: 'fare-basak', dekor: ['sehirfaresi-ev', 'kutu', 'sehirfaresi-lamba'],
            metin: 'Başak peynire uzandı — tam o anda kapı zili çaldı. Sonra saat çaldı, sonra bir bisiklet zili… Başak kulaklarını kapattı.', soz: 'Bu ne gürültü!' }, gorev: 'isabet', onem: 2,
          yonerge: 'Çalan ziller oraya buraya sallanıyor. Gezinen zillere dokunup susturalım.',
          sekil: 'sehirfaresi-zil', hedef: 7, adet: 4, hiz: .7, boy: 12,
          kart: { yan: 'sag', metin: 'çalan ziller', ikon: 'sehirfaresi-zil', tip: 'zor' },
          cozum: 'Ziller sustu. Başak derin bir nefes aldı ve peynirinden bir ısırık aldı.' },
        { engel: 'Kapı çarptı, masadaki her şey sallandı.',
          sahne: { tip: 'sorun', nesne: 'sehirfaresi-pasta', adet: 4, kisi: 'fare-lokum', dekor: ['kutu', 'sehirfaresi-lamba', 'sehirfaresi-ev'],
            metin: 'Bir kapı güm diye çarptı; masa sallandı, fareler hopladı. Bir de baktılar: masadan bir şey eksilmiş — yere mi yuvarlandı?', soz: 'Az önce buradaydı!' }, gorev: 'kayip', onem: 3,
          yonerge: 'Masaya iyi bakalım. Gözümüzü kapayıp açınca ne eksildi, bulalım.',
          tur: 2,
          ogeler: [ { ad: 'Peynir', sekil: 'sehirfaresi-peynir' }, { ad: 'Pasta', sekil: 'sehirfaresi-pasta' },
                    { ad: 'Simit', sekil: 'sehirfaresi-simit' }, { ad: 'Lokum', sekil: 'sehirfaresi-lokum' },
                    { ad: 'Elma', sekil: 'elma' } ],
          kart: { yan: 'sag', metin: 'çarpan kapılar', ikon: 'sehirfaresi-kapi', tip: 'zor' },
          cozum: 'Bulundu: masanın altına yuvarlanmış. Başak kulaklarını ovuşturdu: “Şehirde her şey ne kadar gürültülü!”' },
        { engel: 'Peynirler küçükten büyüğe dizilecek.',
          sahne: { tip: 'istek', nesne: 'sehirfaresi-peynir', adet: 4, kisi: 'fare-lokum', dekor: ['kutu', 'sehirfaresi-lamba', 'sehirfaresi-ev'],
            metin: 'Lokum bir raf dolusu peynir gösterdi: minicik, küçük, büyük, kocaman. “Şehirde her şeyin bir büyüğü var,” dedi gururla.', soz: 'Önce en küçüğünü tadalım!' }, gorev: 'sirala', onem: 4,
          yonerge: 'Peynirleri küçükten büyüğe sıralayalım.',
          ogeler: [ { ad: 'Minicik', sekil: 'sehirfaresi-peynir1' }, { ad: 'Küçük', sekil: 'sehirfaresi-peynir2' },
                    { ad: 'Büyük', sekil: 'sehirfaresi-peynir3' }, { ad: 'Kocaman', sekil: 'sehirfaresi-peynir4' } ],
          kart: { yan: 'sag', metin: 'kocaman peynirler', ikon: 'sehirfaresi-peynir', tip: 'guzel' },
          cozum: 'Peynirler sıraya girdi. Başak minicik olanı tattı: “Çok lezzetli!”' },
        { engel: 'Pasta dilimleri kaygan tepsiden kayıyor.',
          sahne: { tip: 'sorun', nesne: 'sehirfaresi-pasta', adet: 5, kisi: 'fare-basak', dekor: ['kutu', 'sehirfaresi-lamba', 'sehirfaresi-ev'],
            metin: 'Masanın ucunda bir tepsi pasta duruyordu. Bir kedi kuyruğu hafifçe değince tepsi eğildi ve dilimler kaymaya başladı!', soz: 'Tutalım, yere düşmesin!' }, gorev: 'yakala', onem: 5,
          yonerge: 'Pastalar kayıyor. Parmağını aşağıda gezdir, tabağı kaydır, düşenleri tut.',
          hedef: 9, hiz: .2, sikayet: 1050, iyi: [ 'sehirfaresi-pasta', 'sehirfaresi-simit' ], kotu: [],
          kart: { yan: 'sag', metin: 'tatlı pastalar', ikon: 'sehirfaresi-pasta', tip: 'guzel' },
          cozum: 'Tabak doldu; tek dilim bile yere düşmedi.' },
        { engel: 'Gece oldu; şehrin pencereleri tek tek yanıyor.',
          sahne: { tip: 'kesif', nesne: 'sehirfaresi-lamba', adet: 5, kisi: 'fare-lokum', dekor: ['sehirfaresi-ev', 'sehirfaresi-lamba', 'sehirfaresi-ev'],
            metin: 'Lokum Başak’ı çatıya çıkardı. Aşağıda yüzlerce pencere yanıp sönüyordu. “Şehrin yıldızları bunlar,” dedi Lokum.', soz: 'Bak, şu pencere yandı, şimdi şu!' }, gorev: 'takimyildiz', onem: 6,
          yonerge: 'Pencereler yanıp sönüyor. Hangileri yandıysa aynılarına dokunalım.',
          nokta: 12, yanan: 5, tur: 2, bakma: 2600,
          kart: { yan: 'sag', metin: 'parlak ışıklar', ikon: 'sehirfaresi-lamba', tip: 'guzel' },
          cozum: 'Işıklar bir bir söndü, şehir uykuya daldı… neredeyse.' }
      ],
      final: { engel: 'Gece yarısı kocaman bir esneme: Mestan uyandı.',
               sahne: { tip: 'sorun', nesne: 'sehirfaresi-zil', adet: 2, kisi: 'kedi-mestan', dekor: ['sehirfaresi-ev', 'kutu', 'sehirfaresi-lamba'],
               metin: 'Gece yarısı mutfaktan bir ses geldi: “Miyaaav!” Bu, evin uykucu kedisi Mestan’dı. Kocaman esnedi, gözlerini ovuşturdu ve iki fareye bakıp gülümsedi.', soz: 'Hııı… uykum kaçtı. Beni biraz sever misiniz?' }, etkinlik: 'sev',
               kart: { yan: 'sag', metin: 'gece yarısı miyavlar', ikon: 'kedi-mestan', tip: 'zor' },
               cozum: 'Mestan mırladı, kıvrılıp yine uyudu. Ama Başak’ın uykusu kaçmıştı: “Lokum, ben evimi özledim.”' }
    },

    /* ═══ 4 · DÖNÜŞ — iki kuzen, iki mektup ═══ */
    {
      kod: 'donus', ad: 'Dönüş', baslik: 'Eve dönüş, iki mektup', konum: 'sola',
      bolumSonu: 'Eve dönüldü — iki ev, iki dost',
      renk: '#8AA66B', acik: '#E1ECCF', gok: '#EEF5E6', zemin: '#C4D59A',
      hikaye: 'Sabah Başak yavaşça söyledi: “Şehrin ışıkları çok güzel ama ben evimi özledim.” Lokum ona kızmadı. “Seni yolcu edeyim,” dedi. İki kuzen, yeşil filizlerle dolu yoldan tarlaya yürüyor.',
      soz: '“Uzak da olsa iyi bir dost, bir mektup kadar yakındır.”',
      karakter: { kod: 'fare-lokum', ad: 'Lokum', tur: 'Şehir faresi' },
      sozler: [ 'Başak, seni yolcu etmeye geldim. Birlikte yürüyelim mi?', 'Tarla sabahları ne sessizmiş… hiç fark etmemişim.', 'Sana her hafta mektup yazacağım. Söz!' ],
      armagan: { kod: 'sehirfaresi-mektup', ad: 'İlk mektup', renk: '#E8C07A' },
      engeller: [
        { engel: 'Yola çıkarken kuzenler bir oyun kurdu.',
          sahne: { tip: 'gelis', nesne: 'sehirfaresi-bavul', adet: 2, kisi: 'fare-lokum', dekor: ['sehirfaresi-ev', 'sehirfaresi-lamba', 'ot'],
            metin: 'Sabah oldu. Lokum ne kızdı ne küstü: “Seni yolcu edeyim,” dedi. Şehrin kapısından çıkarken bir oyun kurdular: hangisi diğerlerine benzemiyor?', soz: 'Bil bakalım, hangisi farklı?' }, gorev: 'fark', onem: 2,
          yonerge: 'Her bilmecede bir tanesi diğerlerine benzemiyor. Onu birlikte bulalım.',
          turlar: [
            { soru: 'Hangisi tarlada bulunmaz?',
              digerleri: [ { ad: 'Arpa', sekil: 'sehirfaresi-arpa' }, { ad: 'Kök', sekil: 'sehirfaresi-kok' }, { ad: 'Gelincik', sekil: 'sehirfaresi-cicek' } ],
              yabanci: { ad: 'Sokak lambası', sekil: 'sehirfaresi-lamba' }, neden: 'Sokak lambası şehirde yanar; tarlayı ateşböcekleri aydınlatır.' },
            { soru: 'Hangisi yenmez?',
              digerleri: [ { ad: 'Peynir', sekil: 'sehirfaresi-peynir' }, { ad: 'Simit', sekil: 'sehirfaresi-simit' }, { ad: 'Arpa', sekil: 'sehirfaresi-arpa' } ],
              yabanci: { ad: 'Zil', sekil: 'sehirfaresi-zil' }, neden: 'Zil yenmez — sadece çalar, hem de çok!' },
            { soru: 'Hangisi bir ev değil?',
              digerleri: [ { ad: 'Tarla yuvası', sekil: 'in' }, { ad: 'Şehir evi', sekil: 'sehirfaresi-ev' }, { ad: 'Kuş yuvası', sekil: 'yuva' } ],
              yabanci: { ad: 'Bavul', sekil: 'sehirfaresi-bavul' }, neden: 'Bavulla yolculuk yapılır; ama kimse bavulun içinde oturmaz.' }
          ],
          kart: { yan: 'sag', metin: 'çeşit çeşit şey', ikon: 'sehirfaresi-pasta', tip: 'guzel' },
          cozum: 'Üç bilmece de çözüldü. İki kuzen gülüşe gülüşe şehrin kapısından çıktı.' },
        { engel: 'Başak şehirden hatıra götürmek istiyor.',
          sahne: { tip: 'istek', nesne: 'sehirfaresi-bavul', adet: 3, kisi: 'fare-basak', dekor: ['sehirfaresi-lamba', 'ot', 'sehirfaresi-ev'],
            metin: 'Başak’ın bavulu boştu. Lokum her şeyi vermek istedi: lokum, simit, hatta sokak lambası! Başak güldü: bazıları bavula sığar, bazıları şehirde kalmalı.', soz: 'Lambayı nasıl taşırım ki?' }, gorev: 'ayir', onem: 3,
          yonerge: 'Hangisi bavula girer, hangisi şehirde kalır? Birlikte ayıralım.',
          kutular: [ 'Bavula girer', 'Şehirde kalır' ],
          ogeler: [ { ad: 'Lokum', sekil: 'sehirfaresi-lokum', dogru: 0 }, { ad: 'Simit', sekil: 'sehirfaresi-simit', dogru: 0 },
                    { ad: 'Güvercin tüyü', sekil: 'sehirfaresi-tuy', dogru: 0 }, { ad: 'Sokak lambası', sekil: 'sehirfaresi-lamba', dogru: 1 },
                    { ad: 'Çeşme', sekil: 'sehirfaresi-cesme', dogru: 1 }, { ad: 'Kapı zili', sekil: 'sehirfaresi-zil', dogru: 1 } ],
          kart: { yan: 'sag', metin: 'tatlı hatıralar', ikon: 'sehirfaresi-lokum', tip: 'guzel' },
          cozum: 'Bavula tatlı hatıralar girdi; lamba, çeşme ve zil şehirde kaldı.' },
        { engel: 'Tarla yolunda bir kelebek yol gösteriyor.',
          sahne: { tip: 'gelis', nesne: 'filiz', adet: 5, kisi: 'fare-lokum', dekor: ['filiz', 'ot', 'sehirfaresi-cicek'],
            metin: 'Şehir geride kaldı. Yol kenarında minik filizler çıkmış; tarla yakında demek. Önlerinden bir kelebek uçtu ve Lokum peşine takıldı.', soz: 'Kelebek! Şehirde hiç kelebek görmemiştim!' }, gorev: 'takip', onem: 5,
          yonerge: 'Kelebek tarlaya doğru uçuyor. Parmağını üstüne koy ve kaldırmadan takip et.',
          sekil: 'sehirfaresi-kelebek', sure: 5400, hiz: .75, boy: 13,
          kart: { yan: 'sol', metin: 'uçan kelebekler', ikon: 'sehirfaresi-kelebek', tip: 'guzel' },
          cozum: 'Kelebek bir gelinciğe kondu. Lokum ilk kez durup bir çiçeği kokladı.' },
        { engel: 'Lokum ilk kez arpa toplamak istiyor.',
          sahne: { tip: 'istek', nesne: 'sehirfaresi-arpa', adet: 6, kisi: 'fare-lokum', dekor: ['basak', 'ot', 'sehirfaresi-cicek'],
            metin: 'Tarlaya vardılar. Lokum kollarını sıvadı: “Bu sefer sofrayı ben hazırlayacağım!” Ama arpanın hangisi olduğunu karıştırıyor.', soz: 'Arpa bu mu? Yoksa bu mu?' }, gorev: 'refleks', onem: 1,
          yonerge: 'Tarlada her şey geçiyor. Yalnızca arpaya dokun; başka bir şey gelirse bekle.',
          hedef: 4, gorunme: 1200, ara: 260,
          aranan: { sekil: 'sehirfaresi-arpa', ad: 'Arpa' },
          digerleri: [ { sekil: 'ot', ad: 'Ot' }, { sekil: 'tas', ad: 'Taş' }, { sekil: 'sehirfaresi-cicek', ad: 'Gelincik' } ],
          kart: { yan: 'sol', metin: 'kendi topladığın arpa', ikon: 'sehirfaresi-arpa', tip: 'guzel' },
          cozum: 'Lokum’un sepeti arpayla doldu. Kendi topladığı arpa ona çok güzel göründü.' },
        { engel: 'Akşam yuvada bir oyun: iki dünyanın kartları.',
          sahne: { tip: 'istek', nesne: 'yildiz', adet: 4, kisi: 'fare-basak', dekor: ['in', 'basak', 'yildiz'],
            metin: 'Akşam yuvada oturdular. Dışarıda ateşböcekleri, içeride sıcacık bir sessizlik. Başak bir kart oyunu çıkardı: yarısı tarladan, yarısı şehirden.', soz: 'Kartları çevir, eşini bul!' }, gorev: 'cift', onem: 6,
          yonerge: 'İki kart çevir, aynıysa açık kalır. Yerlerini aklında tut.',
          cift: [ 'sehirfaresi-arpa', 'sehirfaresi-kok', 'sehirfaresi-cicek', 'sehirfaresi-lokum', 'sehirfaresi-simit', 'sehirfaresi-lamba' ],
          kart: { yan: 'sol', metin: 'sessiz akşamlar', ikon: 'in', tip: 'guzel' },
          cozum: 'Bütün çiftler bulundu. Lokum esnedi: “Burada ne güzel uyunur…”' },
        { engel: 'Rüzgâr mektupları havalandırdı!',
          sahne: { tip: 'sorun', nesne: 'sehirfaresi-mektup', adet: 5, kisi: 'guvercin-kursun', dekor: ['in', 'basak', 'sehirfaresi-tabela'],
            metin: 'Sabah iki kuzen birbirine mektup yazdı. Kurşun onları almaya geldi ama rüzgâr esti; zarflar havalanıp dört bir yana uçuştu.', soz: 'Gurr! Mektuplar uçuyor!' }, gorev: 'isabet', onem: 4,
          yonerge: 'Zarflar rüzgârda uçuşuyor. Gezinen zarflara dokunup toplayalım.',
          sekil: 'sehirfaresi-mektup', hedef: 7, adet: 4, hiz: .75, boy: 12,
          kart: { yan: 'sol', metin: 'rüzgârlı sabahlar', ikon: 'sehirfaresi-mektup', tip: 'zor' },
          cozum: 'Bütün mektuplar toplandı. Kurşun hepsini çantasına yerleştirdi.' }
      ],
      /* İlk bölümde sade sofraya burun kıvıran Lokum, son bölümde aynı
         sofradan afiyetle yer. (Küçük sınıfta finaller art arda gelir:
         besle · tımarla · sev · besle — iki komşu final aynı olmaz.) */
      final: { engel: 'Ayrılık vakti: son bir tarla sofrası.',
               sahne: { tip: 'cozuldu', nesne: 'sehirfaresi-mektup', adet: 4, kisi: 'fare-lokum', dekor: ['in', 'basak', 'sehirfaresi-cicek'],
               metin: 'Kurşun mektup çantasını takıp çitin üstüne kondu. Başak son bir sofra kurdu: arpa, kök, bir damla bal. Lokum bu sefer burnunu kıvırmadı. “Tarlan çok güzelmiş,” dedi. Başak gülümsedi: “Şehrin de.”', soz: 'Bu sefer ben de yiyeceğim — hem de afiyetle!' }, etkinlik: 'besle', yem: 'tohum',
               kart: { yan: 'sol', metin: 'kendi evin', ikon: 'in', tip: 'guzel' },
               cozum: 'Lokum tabağını silip süpürdü, sonra kuzenine sarıldı. “Gelecek ay sıra bende,” dedi. “Ben tarlaya gelirim, sonra sen şehre!”' }
    }
  ],

  kapanis: {
    baslik: 'İki ev, iki kuzen, bir sürü mektup.',
    metin: 'Başak tarlasına döndü. Yuvası yine küçüktü, sofrası yine sadeydi — ama sessizdi, huzurluydu ve tam ona göreydi. Lokum da şehre döndü; ışıklarını, pastalarını, renklerini yine çok sevdi.\n\nO günden sonra Kurşun her hafta iki mektup taşıdı: biri tarladan şehre, biri şehirden tarlaya. Bir ay Başak şehre gitti, bir ay Lokum tarlaya geldi. Mestan mı? O hâlâ uyuyor.',
    ders: 'Herkesin evi kendine güzel.'
  }
};

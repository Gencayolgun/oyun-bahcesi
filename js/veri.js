/* Küçük Tohum — masal, engeller ve görevler.

   YAPISAL KURALLAR
   - Zar yok. Yolculuk düz ilerler: her durak bir çocuk.
   - Durak sayısı = sınıf mevcudu. 20 çocuk → 20 durak. Herkes tam bir kez
     tahtaya çıkar; sıra adaleti için ayrı mekanizmaya gerek yok.
   - Her durak bir ENGEL. Çocuk çözmeden hikâye ilerlemiyor — görev süs değil.
   - Her çözülen engelde tohum gözle görülür biçimde büyür. Skor tablosu yok;
     sınıfın emeği tohumun kendisinde birikiyor.
   - Bölüm sonundaki hayvan durağı atlanamaz, armağan oradan gelir.

   SINIR: ders içeriği burada YOK. Öğretmen panelleri boş açılır; soruları
   ve açıklamaları öğretmen kendisi koyar. Burada yalnızca olay örgüsü ve
   çocuğun tahtada yapacağı iş var. */

window.VERI = {

  masal: {
    ad: 'Küçük Tohum',
    acilis: 'Adanın tam ortasında boş bir açıklık var. Oraya dikilecek minik bir tohum bulundu — büyüyüp herkese gölge verecek. Ama tohumun dört şeye ihtiyacı var ve dördü de adanın başka bir köşesinde. Yola çıkıp bir tur dönmeniz gerek.',
    kapanis: 'Adayı bir tur dolaştınız ve dördünü de topladınız. Tohum ortadaki açıklığa dikildi — toprak, hava, su ve ışık bir araya gelince kocaman bir ağaç oldu.'
  },

  bolumler: [
    {
      kod: 'ciftlik', ad: 'Çiftlik',
      renk: '#F0A431', acik: '#FFE3AC', gok: '#FFF4DC', zemin: '#BFDB7A',
      hayvan: { kod: 'inek', ad: 'Boncuk', tur: 'İnek' },
      armagan: { kod: 'toprak', ad: 'Toprak', renk: '#9A6B3F' },
      konu: 'Çiftlik',
      engeller: [
        { engel: 'Yolu saman balyaları kapatmış.', gorev: 'say', yonerge: 'Hadi yolu birlikte açalım — balyaları kenara çekelim.',
          sayi: 5, sekil: 'saman', cozum: 'Yol açıldı.' },
        { engel: 'Boncuk acıkmış, yerinden kımıldamıyor.', gorev: 'ayir', yonerge: 'Boncuk acıkmış. Yiyebileceklerini birlikte ayıralım mı?',
          kutular: ['Boncuk yer', 'Boncuk yemez'],
          ogeler: [ { ad: 'Ot', sekil: 'ot', dogru: 0 }, { ad: 'Saman', sekil: 'saman', dogru: 0 },
                    { ad: 'Elma', sekil: 'elma', dogru: 0 }, { ad: 'Ayakkabı', sekil: 'ayakkabi', dogru: 1 },
                    { ad: 'Taş', sekil: 'tas', dogru: 1 }, { ad: 'Kalem', sekil: 'kalem', dogru: 1 } ],
          cozum: 'Boncuk karnını doyurdu ve yürümeye başladı.' },
        { engel: 'Kuzular annelerini kaybetmiş.', gorev: 'eslestir', yonerge: 'Yavruları annelerine kavuşturmama yardım eder misin?',
          ciftler: [ { a: 'Kuzu', asekil: 'kuzu', b: 'Koyun', bsekil: 'koyun' },
                     { a: 'Civciv', asekil: 'civciv', b: 'Tavuk', bsekil: 'tavuk' },
                     { a: 'Buzağı', asekil: 'buzagi', b: 'İnek', bsekil: 'inek' } ],
          cozum: 'Yavrular annelerini buldu.' },
        { engel: 'Yumurtalar sepetten dökülmüş.', gorev: 'say', yonerge: 'Yumurtaları sepete birlikte yerleştirelim mi?',
          sayi: 6, sekil: 'yumurta', cozum: 'Sepet doldu.' },
        { engel: 'Çit devrilmiş, hayvanlar kaçacak.', gorev: 'sirala', yonerge: 'Çiti onaralım mı? Kazıkları kısadan uzuna dizelim.',
          ogeler: [ { ad: 'Kısa', sekil: 'kazik1' }, { ad: 'Orta', sekil: 'kazik2' },
                    { ad: 'Uzun', sekil: 'kazik3' }, { ad: 'En uzun', sekil: 'kazik4' } ],
          cozum: 'Çit onarıldı.' }
      ],
      bakim: { engel: 'Boncuk toprağı verecek — ama önce ilgi istiyor.', etkinlik: 'besle',
               cozum: 'Boncuk toprağı verdi. Tohumun kökleri artık tutunabilir.' }
    },

    {
      kod: 'orman', ad: 'Orman',
      renk: '#3E9B5F', acik: '#C7EFD3', gok: '#EAF8EE', zemin: '#8FCFA3',
      hayvan: { kod: 'tavsan', ad: 'Pamuk', tur: 'Tavşan' },
      armagan: { kod: 'hava', ad: 'Hava', renk: '#8FD4E8' },
      konu: 'Orman',
      engeller: [
        { engel: 'Devrilen dallar patikayı kapatmış.', gorev: 'sirala', yonerge: 'Patikayı açalım — dalları kısadan uzuna dizelim.',
          ogeler: [ { ad: 'Kısa dal', sekil: 'dal1' }, { ad: 'Orta dal', sekil: 'dal2' },
                    { ad: 'Uzun dal', sekil: 'dal3' }, { ad: 'En uzun dal', sekil: 'dal4' } ],
          cozum: 'Patika açıldı.' },
        { engel: 'Bir tohumun ağaç olması için sırayı bilmek gerek.', gorev: 'sirala', yonerge: 'Tohum nasıl ağaç olur? Hadi birlikte sıralayalım.',
          ogeler: [ { ad: 'Tohum', sekil: 'tohum' }, { ad: 'Filiz', sekil: 'filiz' },
                    { ad: 'Fidan', sekil: 'fidan' }, { ad: 'Ağaç', sekil: 'agac' } ],
          cozum: 'Sıra doğru. Büyümek zaman ister.' },
        { engel: 'Kuş yuvaları rüzgârda dağılmış.', gorev: 'eslestir', yonerge: 'Herkesi evine götürmeme yardım eder misin?',
          ciftler: [ { a: 'Kuş yavrusu', asekil: 'kusyavru', b: 'Yuva', bsekil: 'yuva' },
                     { a: 'Sincap', asekil: 'sincap', b: 'Ağaç kovuğu', bsekil: 'kovuk' },
                     { a: 'Tavşan', asekil: 'tavsan', b: 'Kovuk', bsekil: 'in' } ],
          cozum: 'Herkes evine döndü.' },
        { engel: 'Ormana çöp atılmış.', gorev: 'ayir', yonerge: 'Ormanı birlikte toparlayalım mı? Çöpü ayıralım.',
          kutular: ['Çöp', 'Doğaya ait'],
          ogeler: [ { ad: 'Poşet', sekil: 'poset', dogru: 0 }, { ad: 'Şişe', sekil: 'sise', dogru: 0 },
                    { ad: 'Kutu', sekil: 'kutu', dogru: 0 }, { ad: 'Kozalak', sekil: 'kozalak', dogru: 1 },
                    { ad: 'Yaprak', sekil: 'yaprak', dogru: 1 }, { ad: 'Meşe palamudu', sekil: 'palamut', dogru: 1 } ],
          cozum: 'Orman temizlendi.' },
        { engel: 'Fidanlar susuz kalmış.', gorev: 'say', yonerge: 'Fidanlar susamış. Her birine bir damla verelim mi?',
          sayi: 5, sekil: 'fidan', cozum: 'Fidanlar canlandı.' }
      ],
      bakim: { engel: 'Pamuk\'un tüyleri karışmış.', etkinlik: 'timarla',
               cozum: 'Pamuk zıpladı, ağaçlar sallandı, temiz hava tohuma karıştı.' }
    },

    {
      kod: 'deniz', ad: 'Deniz',
      renk: '#2E8FD0', acik: '#C3E6FA', gok: '#E6F5FE', zemin: '#7FC8EE',
      hayvan: { kod: 'fok', ad: 'Köpük', tur: 'Fok' },
      armagan: { kod: 'su', ad: 'Su', renk: '#3FA9E0' },
      konu: 'Deniz',
      engeller: [
        { engel: 'Kıyıya çöp vurmuş.', gorev: 'ayir', yonerge: 'Köpük üzgün. Kıyıyı birlikte temizleyelim mi?',
          kutular: ['Çöp kutusu', 'Denize geri'],
          ogeler: [ { ad: 'Poşet', sekil: 'poset', dogru: 0 }, { ad: 'Şişe', sekil: 'sise', dogru: 0 },
                    { ad: 'Kutu', sekil: 'kutu', dogru: 0 }, { ad: 'Denizyıldızı', sekil: 'yildiz', dogru: 1 },
                    { ad: 'Yengeç', sekil: 'yengec', dogru: 1 }, { ad: 'Kabuk', sekil: 'kabuk', dogru: 1 } ],
          cozum: 'Kıyı temizlendi.' },
        { engel: 'Kim suda yaşar, kim karada — karışmış.', gorev: 'ayir', yonerge: 'Kim suda yaşar, kim karada? Birlikte ayıralım.',
          kutular: ['Suda', 'Karada'],
          ogeler: [ { ad: 'Balık', sekil: 'balik', dogru: 0 }, { ad: 'Yengeç', sekil: 'yengec', dogru: 0 },
                    { ad: 'Ahtapot', sekil: 'ahtapot', dogru: 0 }, { ad: 'Tavşan', sekil: 'tavsan', dogru: 1 },
                    { ad: 'Kuş', sekil: 'kus', dogru: 1 }, { ad: 'İnek', sekil: 'inek', dogru: 1 } ],
          cozum: 'Herkes kendi yerine döndü.' },
        { engel: 'Kabuklar dalgayla karışmış.', gorev: 'sirala', yonerge: 'Kabukları küçükten büyüğe dizmeme yardım eder misin?',
          ogeler: [ { ad: 'Minik', sekil: 'kabuk1' }, { ad: 'Küçük', sekil: 'kabuk2' },
                    { ad: 'Orta', sekil: 'kabuk3' }, { ad: 'Büyük', sekil: 'kabuk4' } ],
          cozum: 'Kabuklar sıraya girdi.' },
        { engel: 'Balık sürüsü dağılmış.', gorev: 'say', yonerge: 'Dağılan balıkları sürüye geri getirelim mi?',
          sayi: 6, sekil: 'balik', cozum: 'Sürü toplandı.' },
        { engel: 'Yavrular annelerini kaybetmiş.', gorev: 'eslestir', yonerge: 'Yavruları annelerine kavuşturalım mı?',
          ciftler: [ { a: 'Yavru fok', asekil: 'fokyavru', b: 'Fok', bsekil: 'fok' },
                     { a: 'Yavru balık', asekil: 'balikyavru', b: 'Balık', bsekil: 'balik' },
                     { a: 'Yavru kaplumbağa', asekil: 'kaplumbagayavru', b: 'Kaplumbağa', bsekil: 'kaplumbaga' } ],
          cozum: 'Yavrular annelerini buldu.' }
      ],
      bakim: { engel: 'Köpük yorulmuş, biraz ilgi istiyor.', etkinlik: 'sev',
               cozum: 'Köpük bir bulut çağırdı, bulut tatlı suyu tohuma damlattı.' }
    },

    {
      kod: 'dag', ad: 'Dağ',
      renk: '#E8A317', acik: '#FFEFC4', gok: '#FFF8E4', zemin: '#E5D28F',
      hayvan: { kod: 'kus', ad: 'Işık', tur: 'Kuş' },
      armagan: { kod: 'isik', ad: 'Işık', renk: '#FFC53D' },
      konu: 'Dağ',
      engeller: [
        { engel: 'Dağ yolunu kayalar kapatmış.', gorev: 'sirala', yonerge: 'Dağ yolunu açalım — kayaları küçükten büyüğe dizelim.',
          ogeler: [ { ad: 'Çakıl', sekil: 'kaya1' }, { ad: 'Taş', sekil: 'kaya2' },
                    { ad: 'Kaya', sekil: 'kaya3' }, { ad: 'Büyük kaya', sekil: 'kaya4' } ],
          cozum: 'Yol açıldı.' },
        { engel: 'Bulutlar güneşi kapatmış.', gorev: 'say', yonerge: 'Güneşi görebilmemiz için bulutları aralayalım mı?',
          sayi: 5, sekil: 'bulut', cozum: 'Güneş göründü.' },
        { engel: 'Tohumun neye ihtiyacı var, karışmış.', gorev: 'ayir', yonerge: 'Tohumumuza ne gerekli? Hadi birlikte ayıralım.',
          kutular: ['Gerekli', 'Gereksiz'],
          ogeler: [ { ad: 'Toprak', sekil: 'toprak', dogru: 0 }, { ad: 'Su', sekil: 'su', dogru: 0 },
                    { ad: 'Işık', sekil: 'isik', dogru: 0 }, { ad: 'Hava', sekil: 'hava', dogru: 0 },
                    { ad: 'Oyuncak', sekil: 'oyuncak', dogru: 1 }, { ad: 'Şemsiye', sekil: 'semsiye', dogru: 1 } ],
          cozum: 'Dört şey: toprak, su, hava, ışık.' },
        { engel: 'Zirveye giden basamaklar dağılmış.', gorev: 'say', yonerge: 'Zirveye çıkabilmemiz için basamakları yerine koyalım.',
          sayi: 4, sekil: 'basamak', cozum: 'Basamaklar hazır.' },
        { engel: 'Kuşlar yuvalarını bulamıyor.', gorev: 'eslestir', yonerge: 'Kuşları yuvalarına götürmeme yardım eder misin?',
          ciftler: [ { a: 'Serçe', asekil: 'serce', b: 'Küçük yuva', bsekil: 'yuva1' },
                     { a: 'Kartal', asekil: 'kartal', b: 'Kaya yuvası', bsekil: 'yuva2' },
                     { a: 'Baykuş', asekil: 'baykus', b: 'Ağaç kovuğu', bsekil: 'kovuk' } ],
          cozum: 'Kuşlar yuvalarına döndü.' }
      ],
      bakim: { engel: 'Işık son yolculuk için güç topluyor.', etkinlik: 'besle',
               cozum: 'Işık kanatlarını açtı, güneş tam tohumun üstüne düştü.' }
    }
  ],

  bakimlar: {
    besle:   { ad: 'Besle',   yonerge: '{ad} acıkmış. Yemi ona birlikte verelim mi?' },
    timarla: { ad: 'Tımarla', yonerge: '{ad} biraz dağınık. Hadi tüylerini birlikte tarayalım.' },
    sev:     { ad: 'Sev',     yonerge: '{ad} sarılmak istiyor. Dokunup sevelim mi?' }
  },

  ornekSinif: ['Ada','Arda','Bulut','Ceren','Defne','Deniz','Ela','Emir','Kaan','Kerem',
               'Lina','Mira','Nil','Ömer','Poyraz','Selin','Tuna','Yaz','Zehra','Zeynep'],
  rozetRenkleri: ['#F0603A','#8B7BF0','#2FA86B','#E8A317','#2E8FD0','#E05A8A','#5FBF6A','#9A6BD6'],

  /* Tahtayı sınıf mevcudundan kurar: her çocuğa bir durak.
     Her bölümün son durağı hayvan bakımı — atlanamaz, armağan oradan gelir. */
  tahtaKur: function (mevcut) {
    var V = window.VERI;
    var n = Math.max(4, mevcut), b = V.bolumler.length;
    var duraklar = [], temel = Math.floor(n / b), fazla = n % b;
    for (var i = 0; i < b; i++) {
      var adet = temel + (i < fazla ? 1 : 0);
      var bol = V.bolumler[i];
      for (var k = 0; k < adet - 1; k++) {
        duraklar.push({ bolum: i, tip: 'engel', veri: bol.engeller[k % bol.engeller.length] });
      }
      duraklar.push({ bolum: i, tip: 'bakim', veri: bol.bakim });
    }
    return duraklar;
  }
};

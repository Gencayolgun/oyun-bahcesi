/* MASAL — TİLKİ İLE LEYLEK (Ezop / La Fontaine)
   ─────────────────────────────────────────────
   Kaynak kamu malı: Ezop (~MÖ 600), La Fontaine (ö. 1695). Metin bize ait,
   çeviri değil.

   NEDEN 40 DAKİKA DOLUYOR: Fabl iki akşam yemeğidir; ama iki yemek demek
   iki davet, iki hazırlık, iki sofra demek. Davetiye yazılır, sebze
   toplanır, çorba pişer, sofra kurulur, misafir karşılanır. Her iş bir
   durak. Dördüncü bölümde üçüncü bir sofra kurulur: herkesinki.

   SONU YUMUŞATTIK: Ezop'ta leylek tilkiye "aynı oyunla" karşılık verir;
   ders bir öç dersidir. 3-6 yaş için bu bir kin hikâyesi olmamalı. Bizde
   Lale bilerek öç almaz — o da Alev gibi yalnızca KENDİ ağzını düşünür.
   İkinci akşam Alev de aç kalınca ikisi aynı şeyi görür, kimse küsmez;
   birbirinden özür dileyip güler ve Diken ile Bilge'yle birlikte herkesin
   ağzına uygun kaplarla ORTAK bir sofra kurarlar. Ders: "Başkasını da
   düşünerek davran."

   KURGU: konukluk. Tahtada yukarıdan görülen bir sofra var: her durak
   sofraya bir şey koyar ve o şeyin KİME UYGUN olduğu işaretlenir
   (tilki ağzı, leylek gagası ya da ikisi). Her engelin ve finalin
   'sofra' alanı bunu taşır. Bölüm sonunda "Misafir doydu mu?" karnesi
   gelir ('karne' alanı).

   DURAK SIRASI = HİKÂYE SIRASI. Konukluk kurgusu durakları paketteki
   sırayla dizer (kurgunun kendi tahtaKur'u). Sınıf 28'den küçükse her
   bölümden en önemli işler kalır: 'oncelik' 1 masalın kalbidir (düz
   tabak, gaga tabağa girmez, burun testiye girmez, herkese bir kap) ve
   hiç düşmez; sayı büyüdükçe iş hikâyeden daha kolay çıkarılır. */

/* Durakların haritadaki yeri: dört bölüm dört ayrı yer.
     1 · Alev'in mutfağı  sol ve sol üst: yuva, ocak, sebze bahçesi
     2 · Alev'in sofrası  üst ve sağ üst: Alev'in bahçe masası
     3 · Lale'nin evi     sağ ve sağ alt: bacalı ev, çardak, çınar
     4 · Ortak sofra      alttan sola dönüp içeri kıvrılır ve köyün
                          ortasındaki uzun sofrada biter.
   Dördüncü bölüm bir sarmal: sınıf kenardan ortaya, sofraya doğru yürür.
   Her bölüm kendi eğrisinde eşit aralıkla dizilir; sınıf mevcudu ne olursa
   olsun duraklar birbirinden en az ~1.7 birim uzak kalır. */
function yerlesim(duraklar) {
  const A = 10.6, B = 7.9;
  const egri = [
    t => { const a = -3.44 + 1.62 * t; return [Math.cos(a) * A, Math.sin(a) * B]; },
    t => { const a = -1.57 + 1.52 * t; return [Math.cos(a) * A, Math.sin(a) * B]; },
    t => { const a = .15 + 1.57 * t; return [Math.cos(a) * A, Math.sin(a) * B]; },
    t => { const a = 2 + 1.9 * t, r = 1 - .55 * t; return [Math.cos(a) * A * r, Math.sin(a) * B * r]; }
  ];
  const gruplar = [[], [], [], []];
  duraklar.forEach((d, i) => gruplar[Math.max(0, Math.min(3, d.bolum))].push(i));
  const yer = [];
  gruplar.forEach((liste, b) => {
    /* Az durak varsa eğrinin ortasına toplanmasın: uçlara yayılsın. */
    liste.forEach((i, j) => {
      const t = liste.length === 1 ? .5 : .06 + .88 * j / (liste.length - 1);
      const [x, z] = egri[b](t);
      yer[i] = { x: +x.toFixed(2), z: +z.toFixed(2) };
    });
  });
  return yer;
}

export default {
  kod: 'leylek',
  ad: 'Tilki ile Leylek',
  kaynak: 'Ezop fablı',
  ders: 'Başkasını da düşünerek davran',
  sure: '40 dakika · bütün sınıf',
  ozet: 'Tilki Alev ile leylek Lale birbirini yemeğe çağırır. İkisi de önce yalnız kendi ağzını düşünür; sonunda herkese uygun bir sofra kurarlar.',
  renk: '#D8743E',
  ikon: 'leylek-testi',

  /* KURGU: konukluk. İki ev, iki davet, bir sofra. */
  kurgu: 'konukluk',
  konukluk: {
    ev: { kod: 'tilki-alev', ad: 'Alev' },
    misafir: { kod: 'leylek-lale', ad: 'Lale' }
  },

  /* Mekân: köy. Alev'in toprak yuvası ve sebze bahçesi, Lale'nin yüksek
     bacalı evi ve çardağı, kuyu, sazlıklı gölet. Ortada uzun ortak sofra:
     sınıf ilerledikçe üstüne tabaklar, testiler diziliyor. */
  dunya: { mekan: 'koy', gok: 0xf2eadb, cevre: 0x9fbe78, yol: 0xefdcb8, cekirdek: 50417,
    yerlesim, yolKapali: false,
    piyonTur: 'leylek', piyon: 0xf8f7f2, piyonKarin: 0x2a2b30, piyonIc: 0xe0532f,   // çocuk bir leylek yavrusu olarak dolaşır
    /* Çözülen her durak yolun kenarına bir tabak bırakır. */
    izNotu: { bos: 'Sofrada henüz hiçbir şey yok', dolu: '{n} şey sofraya kondu' },
    iz: 'leylek-tabak', izRenk: 0xf3efe4, kesifRenk: 0xd8743e,
    kesif: [
      { x: -11.4, z: -4.6, ikon: 'in', ad: 'Alev’in yuvası',
        metin: 'Alev’in evi bir tepeciğin altında. Kapısı yuvarlak, içi serin. Tilkiler toprağı kazıp yuva yapar; Alev’inki üç odalı ve bir de kileri var.' },
      { x: 9.6, z: 8.6, ikon: 'leylek-baca', ad: 'Lale’nin bacası',
        metin: 'Leylekler yuvalarını yüksek yerlere kurar: bacalara, direklere, çatılara. Lale’nin yuvası dallardan örülü, kocaman. Her bahar aynı bacaya geri döner.' },
      { x: 5.2, z: 3.2, ikon: 'leylek-testi', ad: 'Çardak',
        metin: 'Lale sofrasını buraya, yükseğe kurar. Basamakları Bilge ile birlikte çakmışlar. Tepeden bütün köy görünür — Alev’in yuvası bile.' },
      { x: -8.3, z: 7.4, ikon: 'su', ad: 'Sazlıklı gölet',
        metin: 'Lale sabahları burada, uzun bacaklarıyla suyun içinde yavaş yavaş yürür. Sazlar rüzgârda hışırdar; kurbağalar akşamları şarkı söyler.' },
      { x: -.6, z: 4.6, ikon: 'leylek-kuyu', ad: 'Kuyu',
        metin: 'Köyün tek kuyusu. Diken çorbanın suyunu hep buradan çeker. Kovayı çekerken şarkı söylerse çorbanın daha lezzetli olduğuna inanır.' }
    ]},

  acilis: [
    { tag: 'BİR VARMIŞ, BİR YOKMUŞ', baslik: 'Bir köyde iki komşu.', ikon: 'in',
      metin: 'Küçük bir köyün kenarında, bir tepeciğin altındaki sıcacık yuvada Alev adında bir tilki yaşarmış. Bir sabah köyün en yüksek bacasına bir leylek konmuş. Adı Lale’ymiş.' },
    { tag: 'BİR DAVET', baslik: 'Alev çok heyecanlı.', ikon: 'leylek-mektup',
      metin: 'Alev yeni komşusunu akşam yemeğine çağırmak istedi. Çok iyi kalpliydi ama bir huyu vardı: her şeyi kendine göre düşünürdü. “Bana uygun olan herkese uygundur,” sanırdı.' },
    { tag: 'BU MASALIN KAHRAMANI SİZSİNİZ', baslik: 'İki ev, iki davet, bir sofra.', ikon: 'leylek-sofra',
      metin: 'Sırayla tahtaya gelip sofraya birer şey koyacağız: tabak, testi, kaşık, yemek. Her şeyin kime uygun olduğuna birlikte bakacağız. Bakalım misafirler doyacak mı?' }
  ],

  bolumler: [
    {
      kod: 'mutfak', ad: 'Alev’in mutfağı', baslik: 'Davet hazırlığı',
      renk: '#E07A36', acik: '#FADCC0', gok: '#FFF2E4', zemin: '#E6C08E',
      hikaye: 'Alev bir karar verdi: yeni komşusu Lale’yi akşam yemeğine çağıracak! Ama davetiye yazılmadı, tencere boş, sofra kurulmadı. Akşama kadar çok iş var.',
      soz: '“Misafir gelecekse ev güler.”',
      karakter: { kod: 'tilki-alev', ad: 'Alev', tur: 'Tilki' },
      sozler: [ 'Ben Alev! Bu akşam ilk kez misafirim var.', 'Mutfak toparlanıyor, harika gidiyoruz!', 'Her şey hazır. Lale gelsin artık!' ],
      armagan: { kod: 'leylek-tencere', ad: 'Çorba tenceresi', renk: '#8B98A3' },
      karne: { baslik: 'Sofra hazır, misafir yolda!',
        notlar: [ { kod: 'tilki-alev', ad: 'Alev', durum: 'hazir', metin: 'Çorba pişti, tabaklar dizildi.' },
                  { kod: 'leylek-lale', ad: 'Lale', durum: 'bekliyor', metin: 'Davetiyeyi aldı, yola çıkıyor.' } ],
        son: 'Alev bütün tabakları kendi ağzına göre seçti. Lale’nin gagası ise upuzun…' },
      engeller: [
        { oncelik: 2, engel: 'Davetiye rüzgârda parçalandı.',
          sahne: { tip: 'sorun', nesne: 'leylek-mektup', adet: 4, kisi: 'tilki-alev', dekor: ['agac', 'ot', 'fidan'],
            metin: 'Alev, Lale’ye süslü bir davetiye yazdı. Tam kapıdan çıkarken bir rüzgâr esti ve kâğıt dört parçaya ayrıldı.', soz: 'Eyvah, davetiyem!' }, gorev: 'yapboz',
          yonerge: 'Parçaları yerine koyup davetiyeyi birlikte tamamlayalım.',
          resim: 'leylek-mektup', satir: 2, sutun: 2,
          sofra: { sekil: 'leylek-mektup', ad: 'Davetiye', kime: 'ikisi' },
          cozum: 'Davetiye tamamlandı. Alev onu Lale’nin kapısına bıraktı.' },
        { oncelik: 4, engel: 'Kilerin rafı devrildi, sebzeler yağıyor.',
          sahne: { tip: 'sorun', nesne: 'leylek-havuc', adet: 6, kisi: 'tilki-alev', dekor: ['kutu', 'ot', 'leylek-havuc'],
            metin: 'Alev çorba için kilerin en üst rafına uzandı. Raf sallandı; havuçlar, domatesler aşağı yuvarlanmaya başladı.', soz: 'Tutun, düşmesinler!' }, gorev: 'yakala',
          yonerge: 'Sebzeler düşüyor. Parmağını aşağıda gezdir, sepeti kaydır ve yakala.',
          hedef: 8, hiz: .18, sikayet: 1150, iyi: [ 'leylek-havuc', 'leylek-domates' ], kotu: [],
          sofra: { sekil: 'leylek-havuc', ad: 'Sebze sepeti', kime: 'ikisi' },
          cozum: 'Sepet doldu; tek bir sebze bile ezilmedi.' },
        { oncelik: 5, engel: 'Çorbanın malzemeleri bahçede saklanıyor.',
          sahne: { tip: 'kesif', nesne: 'yaprak', adet: 5, kisi: 'kirpi-diken', dekor: ['ot', 'fidan', 'yaprak'],
            metin: 'Aşçı Diken tarifini fısıldadı: “Bir havuç, bir domates, bir avuç mercimek…” Ama bahçe öyle gür ki her şey yaprakların arasında kaybolmuş.', soz: 'İyi bakan bulur.' }, gorev: 'gizli',
          yonerge: 'Bahçeye iyi bakalım — çorbaya lazım olanları bulalım.',
          tohum: 47, sus: 34, susBoy: [4, 8], boy: 9,
          gizli: [ { sekil: 'leylek-havuc', ad: 'Havuç', x: 20, y: 62, a: -12 },
                   { sekil: 'leylek-domates', ad: 'Domates', x: 74, y: 30, a: 8 },
                   { sekil: 'tohum', ad: 'Mercimek', x: 48, y: 76, a: 14 } ],
          sofra: { sekil: 'leylek-domates', ad: 'Domates', kime: 'ikisi' },
          cozum: 'Hepsi bulundu. Mutfak şimdi bahçe gibi kokuyor.' },
        { oncelik: 6, engel: 'Tarifin ölçüsü tutmalı.',
          sahne: { tip: 'istek', nesne: 'tohum', adet: 5, kisi: 'kirpi-diken', dekor: ['kutu', 'ot', 'leylek-tencere'],
            metin: 'Diken tarifin sırrını söyledi: “Mercimekle suyun ağırlığı eşit olmalı.” Terazinin bir kefesinde mercimek var, öbür kefe boş.', soz: 'Kefeler dengede olsun!' }, gorev: 'terazi',
          yonerge: 'Sağ kefeye ekleyip terazi düzelene kadar deneyelim.',
          sol: [ { sekil: 'tohum', agirlik: 2 }, { sekil: 'tohum', agirlik: 3 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 } ],
          sofra: { sekil: 'tohum', ad: 'Mercimek', kime: 'ikisi' },
          cozum: 'Terazi dengede; tarif tamam.' },
        { oncelik: 3, engel: 'Sebzeler tencereye tam zamanında girmeli.',
          sahne: { tip: 'gelis', nesne: 'leylek-havuc', adet: 4, kisi: 'tilki-alev', dekor: ['leylek-tencere', 'kutu', 'ot'],
            metin: 'Tencere ocakta fokur fokur kaynıyor. Alev kepçeyi bir o yana bir bu yana sallıyor; sebze tam tencerenin üstündeyken düşmeli, yoksa yere saçılır.', soz: 'Şimdi mi? Şimdi mi?' }, gorev: 'zaman',
          yonerge: 'Kepçe tam tencerenin üstündeyken bırakalım — acelemiz yok.',
          tasiyici: 'tilki-alev', tasiyiciAd: 'Alev', yuk: 'leylek-havuc',
          hedef: 'leylek-tencere', hedefAd: 'Tencere', genislik: 30, hiz: 1, hedefSayisi: 3,
          sofra: { sekil: 'leylek-tencere', ad: 'Çorba tenceresi', kime: 'ikisi' },
          cozum: 'Üç sebze de tencerede. Çorba mis gibi kokuyor.' },
        { oncelik: 1, engel: 'Sofra düz tabaklarla kuruluyor.',
          sahne: { tip: 'istek', nesne: 'leylek-tabak', adet: 5, kisi: 'tilki-alev', dekor: ['leylek-tabak', 'ot', 'agac'],
            metin: 'Alev dolabını açtı: içinde yalnızca dümdüz, sığ tabaklar var. Kendisi hep böyle tabaktan yer. Hiç düşünmeden sofraya dizmeye başladı.', soz: 'Tabak, kaşık, tabak, kaşık…' }, gorev: 'oruntu',
          yonerge: 'Sıraya bak: tabak, kaşık, tabak, kaşık… Boşluğa hangisi geliyor?',
          dizi: [ 'leylek-tabak', 'leylek-kasik', 'leylek-tabak', 'leylek-kasik', null, null, 'leylek-tabak' ],
          cevaplar: [ 'leylek-tabak', 'leylek-kasik' ],
          secenekler: [ { sekil: 'leylek-tabak', ad: 'Tabak' }, { sekil: 'leylek-kasik', ad: 'Kaşık' }, { sekil: 'leylek-testi', ad: 'Testi' } ],
          sofra: { sekil: 'leylek-tabak', ad: 'Düz tabaklar', kime: 'tilki' },
          cozum: 'Sofra kuruldu — ama hep düz tabaklarla.' }
      ],
      final: { engel: 'Alev’in kuyruğu una bulandı.',
               sahne: { tip: 'cozuldu', nesne: 'leylek-tabak', adet: 4, kisi: 'tilki-alev', dekor: ['leylek-tencere', 'ot', 'agac'],
               metin: 'Çorba pişti, sofra kuruldu, davetiye gitti. Alev aynaya baktı: gür kuyruğu una, maydanoza, havuç kabuğuna bulanmış!', soz: 'Misafir gelmeden bir taransam…' }, etkinlik: 'timarla',
               sofra: { sekil: 'leylek-ekmek', ad: 'Taze ekmek', kime: 'ikisi' },
               cozum: 'Alev’in kuyruğu pırıl pırıl oldu. Tam o sırada kapı çalındı: Lale geldi!' }
    },
    {
      kod: 'alevsofra', ad: 'Alev’in sofrası', baslik: 'Lale sofrada',
      renk: '#C95F4B', acik: '#F7D6CC', gok: '#FDEFEA', zemin: '#E6B7A1',
      hikaye: 'Lale uzun bacaklarıyla kapıdan eğilerek girdi. Sofra hazır, çorba sıcak. Alev çok heyecanlı — ama tabakların ne kadar düz olduğunu hiç düşünmedi.',
      soz: '“Sofrayı kuran, oturanı da düşünür.”',
      karakter: { kod: 'leylek-lale', ad: 'Lale', tur: 'Leylek' },
      sozler: [ 'Merhaba, ben Lale! Davetin için teşekkürler.', 'Ne güzel bir sofra… ama bu tabak çok düz.', 'Gagam boş kaldı ama gönlüm kırılmadı.' ],
      armagan: { kod: 'leylek-tabak', ad: 'Düz tabak', renk: '#C9D6DC' },
      karne: { baslik: 'Misafir doydu mu?',
        notlar: [ { kod: 'tilki-alev', ad: 'Alev', durum: 'doydu', metin: 'Tabağını yalayıp bitirdi.' },
                  { kod: 'leylek-lale', ad: 'Lale', durum: 'ac', metin: 'Alev’in sofrasında düz tabaktan tek yudum alamadı.' } ],
        son: 'Alev ise hiçbir şey fark etmedi; çok güzel bir akşam geçirdiklerini sandı.' },
      engeller: [
        { oncelik: 3, engel: 'Lale’nin yolu su birikintilerinden geçiyor.',
          sahne: { tip: 'gelis', nesne: 'su', adet: 4, kisi: 'leylek-lale', dekor: ['ot', 'su', 'agac'],
            metin: 'Lale davetiyeyi okudu ve hemen yola çıktı. Ama Alev’in yuvasına giden patikada su birikintileri, dikenli çalılar var.', soz: 'Ayaklarım ıslanmasın!' }, gorev: 'yol',
          yonerge: 'Birikintilere ve çalılara değmeden Lale’yi Alev’in kapısına götürelim.',
          baslangic: { x: 100, y: 220, sekil: 'leylek-lale', ad: 'Lale' }, bitis: { x: 905, y: 220, sekil: 'in', ad: 'Alev’in yuvası' },
          engeller: [ { x: 330, y: 120, r: 86, sekil: 'su', ad: 'Su birikintisi' },
                      { x: 420, y: 330, r: 82, sekil: 'ot', ad: 'Çalı' },
                      { x: 640, y: 160, r: 88, sekil: 'su', ad: 'Su birikintisi' },
                      { x: 700, y: 360, r: 78, sekil: 'ot', ad: 'Çalı' } ],
          sofra: { sekil: 'leylek-minder', ad: 'Misafir minderi', kime: 'ikisi' },
          cozum: 'Lale kapıya vardı; ayakları kupkuru.' },
        { oncelik: 6, engel: 'Herkes sırayla “Hoş geldin!” diyor.',
          sahne: { tip: 'istek', nesne: 'kalp', adet: 4, kisi: 'leylek-lale', dekor: ['agac', 'ot', 'leylek-vazo'],
            metin: 'Kapıda Diken ile Bilge de vardı; sesleri duyup merak etmişler. Herkes sırayla “Hoş geldin!” diyor ama Lale kimin önce söylediğini kaçırdı.', soz: 'Bir daha söyler misiniz?' }, gorev: 'dizi',
          yonerge: 'Dostlar sırayla selam veriyor. Dinleyip aynı sırayla tekrarlayalım.',
          dostlar: [ { sekil: 'tilki-alev', ad: 'Alev' }, { sekil: 'leylek-lale', ad: 'Lale' },
                     { sekil: 'kirpi-diken', ad: 'Diken' }, { sekil: 'baykus-bilge', ad: 'Bilge' } ],
          uzunluklar: [ 2, 3, 4 ],
          sofra: { sekil: 'leylek-vazo', ad: 'Çiçekli vazo', kime: 'ikisi' },
          cozum: 'Selamlar tamam; herkes birbirini tanıdı.' },
        { oncelik: 2, engel: 'Çorba iki tabağa eşit konacak.',
          sahne: { tip: 'istek', nesne: 'leylek-kepce', adet: 4, kisi: 'tilki-alev', dekor: ['leylek-tencere', 'leylek-tabak', 'ot'],
            metin: 'Alev kepçeyi aldı. Bir tabak kendine, bir tabak Lale’ye. Birine çok, birine az olmasın.', soz: 'Misafirin payı eksik olmaz!' }, gorev: 'paylas',
          yonerge: 'Çorbayı iki tabağa eşit paylaştıralım.',
          dostlar: [ { sekil: 'tilki-alev', ad: 'Alev' }, { sekil: 'leylek-lale', ad: 'Lale' } ],
          yem: 'leylek-kepce', yemAd: 'Kepçe çorba', adet: 8,
          sofra: { sekil: 'leylek-corba', ad: 'Düz tabakta çorba', kime: 'tilki' },
          cozum: 'İki tabak da eşit doldu. Ama Lale’nin tabağı da… dümdüz.' },
        { oncelik: 1, engel: 'Lale gagasını tabağa daldıramıyor.',
          sahne: { tip: 'sorun', nesne: 'leylek-corba', adet: 3, kisi: 'leylek-lale', dekor: ['leylek-tabak', 'ot', 'agac'],
            metin: 'Lale uzun gagasını tabağa eğdi: tık! Gaganın ucu tabağa değdi ama çorba kenara kaçtı. Bir daha denedi, yine olmadı.', soz: 'Bu tabak benim gagama göre değil…' }, gorev: 'fark',
          yonerge: 'Lale’yi düşünelim: her turda farklı olanı bulalım.',
          turlar: [
            { soru: 'Hangisi uzun bir gagaya uymaz?',
              digerleri: [ { ad: 'Testi', sekil: 'leylek-testi' }, { ad: 'Şişe', sekil: 'sise' }, { ad: 'Vazo', sekil: 'leylek-vazo' } ],
              yabanci: { ad: 'Düz tabak', sekil: 'leylek-tabak' }, neden: 'Düz tabaktan uzun gagayla yudum alınmaz. Derin ve dar bir kap gerek.' },
            { soru: 'Hangisi derin değil?',
              digerleri: [ { ad: 'Kase', sekil: 'leylek-kase' }, { ad: 'Tencere', sekil: 'leylek-tencere' }, { ad: 'Fincan', sekil: 'leylek-fincan' } ],
              yabanci: { ad: 'Çorba tabağı', sekil: 'leylek-corba' }, neden: 'Düz tabak sığdır; çorba hemen kenara kaçar.' },
            { soru: 'Hangisi sofraya ait değil?',
              digerleri: [ { ad: 'Kaşık', sekil: 'leylek-kasik' }, { ad: 'Ekmek', sekil: 'leylek-ekmek' }, { ad: 'Tabak', sekil: 'leylek-tabak' } ],
              yabanci: { ad: 'Ayakkabı', sekil: 'ayakkabi' }, neden: 'Ayakkabı kapıda kalır, sofraya gelmez!' } ],
          sofra: { sekil: 'leylek-kasik', ad: 'Kısa kaşık', kime: 'tilki' },
          cozum: 'Lale’nin neden içemediği anlaşıldı — ama Alev hâlâ fark etmedi.' },
        { oncelik: 5, engel: 'Lale tabaktan tek damla yakalamaya çalışıyor.',
          sahne: { tip: 'kesif', nesne: 'leylek-damla', adet: 5, kisi: 'leylek-lale', dekor: ['leylek-tabak', 'ot', 'agac'],
            metin: 'Lale pes etmedi. Gagasının ucuyla tabaktaki çorbadan bir damla kapmayı deniyor; damla bir görünüp bir kayboluyor.', soz: 'Bir damla… yalnızca bir damla!' }, gorev: 'refleks',
          yonerge: 'Çorba damlası görününce hemen dokun; başka bir şey çıkarsa elini çek.',
          hedef: 8, gorunme: 1100, ara: 330,
          aranan: { sekil: 'leylek-damla', ad: 'Çorba damlası' },
          digerleri: [ { sekil: 'yaprak', ad: 'Maydanoz' }, { sekil: 'leylek-kasik', ad: 'Kaşık' }, { sekil: 'tohum', ad: 'Mercimek' } ],
          sofra: { sekil: 'leylek-corba', ad: 'Lale’nin dolu tabağı', kime: 'tilki' },
          cozum: 'Lale birkaç damla yakaladı — ama tabağı hâlâ dopdolu.' },
        { oncelik: 4, engel: 'Sofra toplanırken kaplar karıştı.',
          sahne: { tip: 'kesif', nesne: 'leylek-tabak', adet: 6, kisi: 'tilki-alev', dekor: ['leylek-tencere', 'kutu', 'ot'],
            metin: 'Alev tabağını yalayıp bitirdi. “Çok güzeldi, değil mi?” dedi. Lale nazikçe gülümsedi. Sofra toplanırken bütün kaplar birbirine karıştı.', soz: 'Her kabın eşi nerede?' }, gorev: 'cift',
          yonerge: 'Kaplar ters duruyor. İki kart çevir, aynıysa açık kalır — yerlerini aklında tut.',
          cift: [ 'leylek-tabak', 'leylek-kasik', 'leylek-kase', 'leylek-tencere', 'leylek-fincan', 'leylek-kepce' ],
          sofra: { sekil: 'leylek-tabak', ad: 'Yalanmış tabak', kime: 'tilki' },
          cozum: 'Mutfak toparlandı. Lale teşekkür edip evine döndü — karnı guruldayarak.' }
      ],
      final: { engel: 'Lale evine aç döndü.',
               sahne: { tip: 'istek', nesne: 'kalp', adet: 3, kisi: 'leylek-lale', dekor: ['agac', 'ot', 'leylek-baca'],
               metin: 'Lale evine vardı ve bacanın tepesindeki yuvasına kondu. Karnı guruldadı ama Alev’e hiç kızmadı. Yalnızca düşündü: “Alev benim gagamı hiç düşünmedi.”', soz: 'Biraz yiyecek bulabilir miyiz?' }, etkinlik: 'besle', yem: 'balik',
               sofra: { sekil: 'kalp', ad: 'Lale’nin nezaketi', kime: 'ikisi' },
               cozum: 'Evinde birkaç lokma yiyince Lale’nin karnı doydu. Gülümseyerek bir karar verdi: “Yarın akşam da Alev bana gelsin!”' }
    },
    {
      kod: 'laleev', ad: 'Lale’nin evi', baslik: 'Testide yemek',
      renk: '#4F86A6', acik: '#D5E6F0', gok: '#EAF2F7', zemin: '#A9C4CF',
      hikaye: 'Ertesi akşam sıra Lale’de. Evinin bacası köyün en yükseği; komşusu Bilge hemen yanındaki çınarda oturur. Lale de kendi ağzına göre bir sofra kuruyor — tıpkı Alev gibi, hiç düşünmeden.',
      soz: '“Herkesin ağzı başka, kabı da başka olur.”',
      karakter: { kod: 'baykus-bilge', ad: 'Bilge', tur: 'Baykuş' },
      sozler: [ 'Ben Bilge, Lale’nin komşusuyum. Dalımdan her şeyi görürüm.', 'Hım hım… çok dikkatlisiniz.', 'Gördünüz mü? Herkesin ağzı başka.' ],
      armagan: { kod: 'leylek-testi', ad: 'Uzun testi', renk: '#CF7A4C' },
      karne: { baslik: 'Bu sefer kim aç kaldı?',
        notlar: [ { kod: 'leylek-lale', ad: 'Lale', durum: 'doydu', metin: 'Gagasını testiye daldırıp afiyetle yedi.' },
                  { kod: 'tilki-alev', ad: 'Alev', durum: 'ac', metin: 'Burnu dar testiye sığmadı.' } ],
        son: 'Alev önce bozuldu, sonra güldü: “Dün akşam Lale de böyle hissetti!” Kimse kimseye küsmedi.' },
      engeller: [
        { oncelik: 3, engel: 'Lale davetiyeyi uçarak götürüyor.',
          sahne: { tip: 'gelis', nesne: 'leylek-mektup', adet: 3, kisi: 'leylek-lale', dekor: ['agac', 'bulut', 'leylek-baca'],
            metin: 'Lale sabah erkenden gagasına bir davetiye aldı ve Alev’in evine doğru havalandı. Bilge dalından seslendi: “Gözünüzü ondan ayırmayın, rüzgâr var!”', soz: 'Alev, bu akşam sen bana gel!' }, gorev: 'takip',
          yonerge: 'Lale uçuyor. Parmağını üstüne koy ve kaldırmadan takip et.',
          sekil: 'leylek-lale', sure: 5200, hiz: .7, boy: 15,
          sofra: { sekil: 'leylek-mektup', ad: 'Karşı davetiye', kime: 'ikisi' },
          cozum: 'Davetiye Alev’e ulaştı. Alev sevinçle zıpladı.' },
        { oncelik: 2, engel: 'Testilerin ağzı çok dar.',
          sahne: { tip: 'sorun', nesne: 'leylek-testi', adet: 4, kisi: 'leylek-lale', dekor: ['leylek-testi', 'ot', 'agac'],
            metin: 'Lale yemeği ince, uzun testilere dolduruyor. Testiler rüzgârda sallanıyor; mercimeği tam ağzından atmak gerek.', soz: 'Tam ortasına!' }, gorev: 'isabet',
          yonerge: 'Sallanan testilerin tam üstüne dokunalım.',
          sekil: 'leylek-testi', hedef: 7, adet: 4, hiz: .7, boy: 12,
          sofra: { sekil: 'leylek-testi', ad: 'Testide yemek', kime: 'leylek' },
          cozum: 'Testiler doldu. Lale için harika — peki Alev için?' },
        { oncelik: 5, engel: 'Testiler kısadan uzuna dizilecek.',
          sahne: { tip: 'istek', nesne: 'leylek-testi2', adet: 4, kisi: 'baykus-bilge', dekor: ['leylek-testi', 'agac', 'ot'],
            metin: 'Bilge dalından aşağı süzüldü, Lale’ye yardıma geldi. Rafta büyüklü küçüklü testiler karmakarışık duruyor.', soz: 'Kısadan uzuna dizelim.' }, gorev: 'sirala',
          yonerge: 'Testileri en kısadan en uzuna dizelim.',
          ogeler: [ { ad: 'En kısa', sekil: 'leylek-testi1' }, { ad: 'Kısa', sekil: 'leylek-testi2' },
                    { ad: 'Uzun', sekil: 'leylek-testi3' }, { ad: 'En uzun', sekil: 'leylek-testi4' } ],
          sofra: { sekil: 'leylek-testi4', ad: 'Uzun testiler', kime: 'leylek' },
          cozum: 'Testiler sıraya girdi; en uzunu sofranın başına kondu.' },
        { oncelik: 6, engel: 'Akşam oldu, çardağın yolu yıldızlarda.',
          sahne: { tip: 'kesif', nesne: 'yildiz', adet: 5, kisi: 'baykus-bilge', dekor: ['agac', 'bulut', 'yildiz'],
            metin: 'Akşam oldu. Lale’nin sofrası çardağın tepesinde. Bilge gökyüzünü gösterdi: “Şu parlayan yıldızlar tam çardağın üstünde. Onlara bakarak yürüyün, yolu şaşırmazsınız.”', soz: 'Hangileri parladı, aklınızda tutun.' }, gorev: 'takimyildiz',
          yonerge: 'Yıldızlar parlayıp sönüyor. Hangileri parladıysa aynılarına dokunalım.',
          nokta: 12, yanan: 4, tur: 2, bakma: 2400,
          sofra: { sekil: 'isik', ad: 'Fener', kime: 'ikisi' },
          cozum: 'Yıldızlar yolu gösterdi; Alev basamakları tırmanıp çardağa vardı.' },
        { oncelik: 4, engel: 'Lale’nin sofrasından bir şey eksik.',
          sahne: { tip: 'kesif', nesne: 'leylek-testi', adet: 5, kisi: 'baykus-bilge', dekor: ['leylek-testi', 'agac', 'bulut'],
            metin: 'Bilge sofraya göz gezdirdi: testi, ekmek, vazo, fincan… Gözünü kırptı, bir daha baktı. Bir şey kaybolmuş gibi.', soz: 'Hım… ne eksildi?' }, gorev: 'kayip',
          yonerge: 'Sofraya iyi bakalım. Gözümüzü kapayıp açınca ne eksildi, bulalım.',
          tur: 2,
          ogeler: [ { ad: 'Testi', sekil: 'leylek-testi' }, { ad: 'Ekmek', sekil: 'leylek-ekmek' },
                    { ad: 'Vazo', sekil: 'leylek-vazo' }, { ad: 'Fincan', sekil: 'leylek-fincan' },
                    { ad: 'Mektup', sekil: 'leylek-mektup' } ],
          sofra: { sekil: 'leylek-vazo', ad: 'Çiçekli vazo', kime: 'ikisi' },
          cozum: 'Asıl eksik sonunda anlaşıldı: Alev’e bir kase! Lale onu hiç düşünmemiş.' },
        { oncelik: 1, engel: 'Alev burnunu testiye sokamıyor.',
          sahne: { tip: 'sorun', nesne: 'leylek-testi', adet: 3, kisi: 'tilki-alev', dekor: ['leylek-testi', 'agac', 'bulut'],
            metin: 'Lale gagasını testiye daldırdı, afiyetle yedi. Alev de burnunu testiye uzattı — ama testinin ağzı dar, burnu ancak ucuna kadar girdi.', soz: 'Hiç… yetişemiyorum.' }, gorev: 'fark',
          yonerge: 'Bu sefer Alev’i düşünelim: her turda farklı olanı bulalım.',
          turlar: [
            { soru: 'Alev hangisinden yiyebilir?',
              digerleri: [ { ad: 'Testi', sekil: 'leylek-testi' }, { ad: 'Şişe', sekil: 'sise' }, { ad: 'Vazo', sekil: 'leylek-vazo' } ],
              yabanci: { ad: 'Kase', sekil: 'leylek-kase' }, neden: 'Kasenin ağzı geniş; Alev dilini rahatça uzatır.' },
            { soru: 'Hangisinin ağzı dar değil?',
              digerleri: [ { ad: 'Uzun testi', sekil: 'leylek-testi4' }, { ad: 'Kısa testi', sekil: 'leylek-testi2' }, { ad: 'Şişe', sekil: 'sise' } ],
              yabanci: { ad: 'Düz tabak', sekil: 'leylek-tabak' }, neden: 'Düz tabak geniştir; tilki ağzına uygundur.' },
            { soru: 'Hangisi yiyecek değil?',
              digerleri: [ { ad: 'Havuç', sekil: 'leylek-havuc' }, { ad: 'Domates', sekil: 'leylek-domates' }, { ad: 'Ekmek', sekil: 'leylek-ekmek' } ],
              yabanci: { ad: 'Testi', sekil: 'leylek-testi' }, neden: 'Testi yenmez; içine yemek konur.' } ],
          sofra: { sekil: 'leylek-testi3', ad: 'Alev’in testisi', kime: 'leylek' },
          cozum: 'Alev kendi hâlini tanıdı: “Dün akşam Lale de böyle hissetti!”' }
      ],
      final: { engel: 'Bilge iki ev arasında uçmaktan yoruldu.',
               sahne: { tip: 'cozuldu', nesne: 'kalp', adet: 4, kisi: 'baykus-bilge', dekor: ['agac', 'bulut', 'leylek-baca'],
               metin: 'Alev yüzünü buruşturdu, sonra kahkahayı bastı. Lale de güldü: “Dün ben de aynı hâldeydim!” Bilge bütün gece iki ev arasında uçtu; tüyleri darmadağın.', soz: 'Bir fikrim var… ama önce tüylerim.' }, etkinlik: 'timarla',
               sofra: { sekil: 'yildiz', ad: 'Bilge’nin fikri', kime: 'ikisi' },
               cozum: 'Bilge tüylerini kabarttı: “Yarın köyün ortasına bir sofra kuralım. Herkesin ağzına uygun kaplarla!”' }
    },
    {
      kod: 'ortak', ad: 'Ortak sofra', baslik: 'Herkese uygun sofra',
      renk: '#5F9A55', acik: '#DCEECB', gok: '#EEF7E4', zemin: '#B9D78C',
      hikaye: 'Köyün ortasına uzun bir sofra kuruluyor. Aşçı Diken tencerenin başında, Bilge davetlileri sayıyor. Bu kez kimse aç kalmayacak: her kap, oturanın ağzına göre seçilecek.',
      soz: '“Sofra geniş olursa gönül de geniş olur.”',
      karakter: { kod: 'kirpi-diken', ad: 'Diken', tur: 'Aşçı kirpi' },
      sozler: [ 'Ben Diken! Bugün herkese göre pişiriyorum.', 'Kaplar yerini buluyor, aferin!', 'Sofra hazır — herkes buyursun!' ],
      armagan: { kod: 'leylek-sofra', ad: 'Ortak sofra', renk: '#E8D3AD' },
      karne: { baslik: 'Herkes doydu!',
        notlar: [ { kod: 'tilki-alev', ad: 'Alev', durum: 'doydu', metin: 'Düz tabağından yaladı.' },
                  { kod: 'leylek-lale', ad: 'Lale', durum: 'doydu', metin: 'Gagasını testisine daldırdı.' },
                  { kod: 'kirpi-diken', ad: 'Diken', durum: 'doydu', metin: 'Kasesinden kaşıkladı.' },
                  { kod: 'baykus-bilge', ad: 'Bilge', durum: 'doydu', metin: 'Fincanından yudumladı.' } ],
        son: 'Bu sofrada herkesin önünde kendi ağzına uygun bir kap vardı.' },
      engeller: [
        { oncelik: 1, engel: 'Kim hangi kaptan yer?',
          sahne: { tip: 'istek', nesne: 'leylek-kase', adet: 4, kisi: 'kirpi-diken', dekor: ['leylek-tabak', 'leylek-testi', 'ot'],
            metin: 'Diken dört kabı sofraya dizdi: düz tabak, uzun testi, küçük kase, bir de fincan. Şimdi her birinin sahibini bulmak gerek.', soz: 'Herkes kendi ağzına uygun kaptan!' }, gorev: 'eslestir',
          yonerge: 'Her dostu kendi ağzına uygun kapla eşleştirelim.',
          ciftler: [ { a: 'Alev', asekil: 'tilki-alev', b: 'Düz tabak', bsekil: 'leylek-tabak' },
                     { a: 'Lale', asekil: 'leylek-lale', b: 'Uzun testi', bsekil: 'leylek-testi' },
                     { a: 'Diken', asekil: 'kirpi-diken', b: 'Küçük kase', bsekil: 'leylek-kase' },
                     { a: 'Bilge', asekil: 'baykus-bilge', b: 'Fincan', bsekil: 'leylek-fincan' } ],
          sofra: { sekil: 'leylek-kase', ad: 'Herkese bir kap', kime: 'ikisi' },
          cozum: 'Her kap sahibini buldu. Kimse boş gagayla, boş ağızla kalmayacak.' },
        { oncelik: 4, engel: 'Tatlı için elmalar ağaçtan düşüyor.',
          sahne: { tip: 'sorun', nesne: 'elma', adet: 6, kisi: 'kirpi-diken', dekor: ['agac', 'elma', 'ot'],
            metin: 'Diken elmalı tatlı yapacak. Bilge elma ağacının dalına konup silkeledi; elmalar pıt pıt yere yağıyor.', soz: 'Sepete, sepete!' }, gorev: 'yakala',
          yonerge: 'Elmalar düşüyor. Parmağını aşağıda gezdir, sepeti kaydır ve tut. Yaprakları bırak.',
          hedef: 8, hiz: .2, sikayet: 1100, iyi: [ 'elma' ], kotu: [ 'yaprak' ],
          sofra: { sekil: 'elma', ad: 'Elmalar', kime: 'ikisi' },
          cozum: 'Sepet elma doldu; tatlı yapılabilir.' },
        { oncelik: 3, engel: 'Çorba tabakla testiye eşit bölünecek.',
          sahne: { tip: 'istek', nesne: 'leylek-kepce', adet: 4, kisi: 'kirpi-diken', dekor: ['leylek-tencere', 'leylek-testi', 'leylek-tabak'],
            metin: 'Bu kez çorba hem Alev’in düz tabağına hem Lale’nin testisine konacak. İkisi de aynı doysun diye Diken teraziyi getirdi.', soz: 'Kimsenin payı az olmasın.' }, gorev: 'terazi',
          yonerge: 'Sağ kefeye ekleyip iki payı dengeleyelim.',
          sol: [ { sekil: 'leylek-kepce', agirlik: 3 }, { sekil: 'leylek-kepce', agirlik: 2 }, { sekil: 'leylek-kepce', agirlik: 1 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 }, { ad: 'Büyük', agirlik: 3 } ],
          sofra: { sekil: 'leylek-tencere', ad: 'Tabakta ve testide çorba', kime: 'ikisi' },
          cozum: 'Tabak da testi de tam doldu; iki pay eşit.' },
        { oncelik: 5, engel: 'Sofraya tabak ve testi sırayla dizilecek.',
          sahne: { tip: 'gelis', nesne: 'leylek-testi', adet: 5, kisi: 'baykus-bilge', dekor: ['leylek-tabak', 'leylek-testi', 'ot'],
            metin: 'Bilge uzun sofranın başına geçti: “Bir tabak, bir testi; bir tabak, bir testi. Böylece herkesin önüne kendi kabı gelir.”', soz: 'Sırayı bozmayalım.' }, gorev: 'oruntu',
          yonerge: 'Sıraya bak: tabak, testi, tabak, testi… Boşluğa hangisi geliyor?',
          dizi: [ 'leylek-tabak', 'leylek-testi', 'leylek-tabak', null, 'leylek-tabak', null, 'leylek-tabak' ],
          cevaplar: [ 'leylek-testi', 'leylek-testi' ],
          secenekler: [ { sekil: 'leylek-tabak', ad: 'Tabak' }, { sekil: 'leylek-testi', ad: 'Testi' }, { sekil: 'leylek-kase', ad: 'Kase' } ],
          sofra: { sekil: 'leylek-testi', ad: 'Lale’ye testi', kime: 'leylek' },
          cozum: 'Sofra düzenle kuruldu; her yerin önünde uygun bir kap var.' },
        { oncelik: 6, engel: 'Tatlı tepsisi sofraya taşınacak.',
          sahne: { tip: 'gelis', nesne: 'elma', adet: 4, kisi: 'kirpi-diken', dekor: ['leylek-tencere', 'ot', 'agac'],
            metin: 'Elmalı tatlı fırından çıktı! Diken tepsiyi sofraya götürecek. Ama yolda tavuklar dolaşıyor, taşlar var; tepsi devrilmemeli.', soz: 'Dökmeden götüreyim!' }, gorev: 'yol',
          yonerge: 'Tavuklara ve taşlara değmeden Diken’i sofraya götürelim.',
          baslangic: { x: 100, y: 220, sekil: 'kirpi-diken', ad: 'Diken' }, bitis: { x: 905, y: 220, sekil: 'leylek-sofra', ad: 'Ortak sofra' },
          /* 2. bölümdeki yolun kopyası değil: tavuklarla taşlar sırayla bir
             aşağıda bir yukarıda; tepsi zikzak çizerek taşınır. */
          engeller: [ { x: 260, y: 290, r: 72, sekil: 'tavuk', ad: 'Tavuk' },
                      { x: 430, y: 140, r: 72, sekil: 'tas', ad: 'Taş' },
                      { x: 600, y: 300, r: 72, sekil: 'tavuk', ad: 'Tavuk' },
                      { x: 760, y: 150, r: 70, sekil: 'tas', ad: 'Taş' } ],
          sofra: { sekil: 'leylek-tabak', ad: 'Alev’e düz tabak', kime: 'tilki' },
          cozum: 'Tatlı sofraya ulaştı; tek dilim bile düşmedi.' },
        { oncelik: 2, engel: 'Elmalı tatlı dört dosta paylaşılacak.',
          sahne: { tip: 'istek', nesne: 'elma', adet: 6, kisi: 'kirpi-diken', dekor: ['leylek-tencere', 'elma', 'ot'],
            metin: 'Tatlı sofrada, mis gibi kokuyor. Diken onu dört kaba bölmek istiyor: tabağa, testiye, kaseye, fincana.', soz: 'Herkese eşit, herkese uygun!' }, gorev: 'paylas',
          yonerge: 'Tatlıyı dört dosta eşit paylaştıralım.',
          dostlar: [ { sekil: 'tilki-alev', ad: 'Alev' }, { sekil: 'leylek-lale', ad: 'Lale' },
                     { sekil: 'kirpi-diken', ad: 'Diken' }, { sekil: 'baykus-bilge', ad: 'Bilge' } ],
          yem: 'elma', yemAd: 'Elma dilimi', adet: 12,
          sofra: { sekil: 'leylek-ekmek', ad: 'Elmalı tatlı', kime: 'ikisi' },
          cozum: 'Dördü de eşit pay aldı; kimse aç kalmadı.' }
      ],
      final: { engel: 'Diken bütün gün herkese pişirdi, şimdi biraz sevgi istiyor.',
               sahne: { tip: 'cozuldu', nesne: 'kalp', adet: 6, kisi: 'kirpi-diken', dekor: ['leylek-tabak', 'leylek-testi', 'kalp'],
               metin: 'Sofrada kahkahalar var. Alev tabağından, Lale testisinden, Bilge fincanından yiyor. Diken ise bütün gün pişirmekten yorgun düşmüş.', soz: 'Bana da sarılır mısınız? Dikenlerimi yatırdım!' }, etkinlik: 'sev',
               sofra: { sekil: 'kalp', ad: 'Dostluk', kime: 'ikisi' },
               cozum: 'Diken’e kocaman sarıldık. Diken güldü: “Herkes doydu, ben de doydum!”' }
    }
  ],

  kapanis: {
    baslik: 'Herkes doydu, herkes güldü.',
    metin: 'O akşam köyün ortasındaki sofrada kimse aç kalmadı. Alev düz tabağından yaladı, Lale gagasını testisine daldırdı, Diken kasesinden, Bilge fincanından yedi.\n\nAlev, Lale’ye döndü: “İlk akşam seni hiç düşünmemişim. Özür dilerim.” Lale güldü: “Ben de seni düşünmedim. Ben de özür dilerim.” İkisi kıkır kıkır güldü.\n\nO günden sonra köyde bir sofra kurulunca herkes önce şunu sordu: “Bu sofraya kim oturacak?”',
    ders: 'Başkasını da düşünerek davran.'
  }
};

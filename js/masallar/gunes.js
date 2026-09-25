/* MASAL 04 — GÜNEŞ İLE RÜZGÂR (Ezop)
   ─────────────────────────────────
   Kaynak kamu malı: Ezop (~MÖ 600). Metin bize ait, çeviri değil.

   NEDEN AÇILABİLİYOR: Fablın kendisi bir YARIŞMA: iki güç, tek yolcu,
   sırayla iki deneme. Sırayla denemek demek, sınıfın her çocuğunun bir
   "deneme"yi oynaması demek. Rüzgâr'ın iki turu, Güneş'in iki turu —
   dört bölüm kendiliğinden çıkıyor.

   KURGU: yarisma (bkz. masal/kurgular/yarisma.js). Tahta bir gökyüzü
   panosu: bir yanda Rüzgâr, bir yanda Güneş, ortada sallanan bir ibre ve
   yolcunun üstündeki giysiler. Rüzgâr'ın turlarında ibre Rüzgâr'a gider
   ama giysiler ARTAR; Güneş'in turlarında giysiler birer birer ÇIKAR.
   Sınıf dersi panodan kendisi okur: sertlik sarındırır, sıcaklık açar.

   FİNALİ YUMUŞATTIM: Ezop'ta Rüzgâr yenilir ve iş orada biter. Burada
   Rüzgâr kızmaz, öğrenir: akşamüstü sıcakta Pofuduk'u usul usul serinletir.
   İkisi de işe yarar; kazanan sertlik değil, nezaket.

   MEKÂN: yayla yolu. Yol dört yamaçta zikzak çizer: arkadaki iki yamaç
   Rüzgâr'ın (yel değirmeni, eğilen ağaçlar, kaya tepesi), öndeki güneye
   bakan iki yamaç Güneş'in (ayçiçeği tarlaları). Ortada ninenin kulübesi ve çeşmesi;
   Güneş'in turlarında çıkarılan giysiler çamaşır ipine asılıyor. */

/* Durakların haritadaki yeri: dört tur, dört yamaç. Yol halka değil, bir
   dağ yolu: her yamaçta zikzak çizen kısa virajlar (serpantin). Önce
   Rüzgâr'ın iki yamacı (arkadaki sırt: soldan sağa), sonra yol sağ kenardan
   aşağı iner ve Güneş'in iki yamacında (öndeki güney yamacı: sağdan sola)
   devam eder; iki güney yamacı arasında dereyi taş köprüyle geçer.
   Sınıf mevcudu kaç olursa olsun (4–28) her yamaca o bölümün durakları
   eşit aralıkla dizilir; komşu duraklar en az ~2 birim uzak kalır. */
const YAMAC = [
  { z: -6.8, x0: -9.4, x1: -3.2 },           // 01 Rüzgâr · sol arka
  { z: -6.8, x0: 3.2, x1: 9.4 },             // 02 Rüzgâr · sağ arka
  { z: 6.8, x0: 9.4, x1: 3.2 },              // 03 Güneş · sağ ön
  { z: 6.8, x0: -3.2, x1: -9.4 }             // 04 Güneş · sol ön
];
function yaylaYerlesimi(duraklar) {
  const say = [0, 0, 0, 0], sira = [];
  duraklar.forEach(d => { sira.push(say[d.bolum % 4]++); });
  return duraklar.map((d, i) => {
    const y = YAMAC[d.bolum % 4], n = say[d.bolum % 4], j = sira[i];
    const t = n === 1 ? .5 : j / (n - 1);
    /* 28'den kalabalık sınıfta (yamaç başına 8+ durak) yamaç biraz uzar:
       bir atlayan iki durak da 1.6 birimden yakın düşmesin. */
    const uza = n > 9 ? .52 : n > 7 ? .4 : 0, kay = v => v + Math.sign(v) * (Math.abs(v) > 6 ? uza : -uza);
    const x0 = kay(y.x0), x1 = kay(y.x1);
    return { x: x0 + (x1 - x0) * t, z: y.z + (n === 1 ? 0 : j % 2 ? .8 : -.8) };
  });
}

export default {
  kod: 'gunes',
  ad: 'Güneş ile Rüzgâr',
  kaynak: 'Ezop fablı',
  ders: 'Nezaket, zorlamaktan güçlüdür',
  sure: '40 dakika · bütün sınıf',
  ozet: 'Güneş ile Rüzgâr, yayla yolundaki Pofuduk’un paltosunu kimin çıkartacağına dair yarışır. Önce Rüzgâr eser, sonra Güneş ısıtır.',
  renk: '#E6A83E',
  ikon: 'isik',

  /* KURGU: yarışma. İki güç, tek yolcu. Armağan toplanmaz; panodaki ibre
     ve yolcunun giysileri yarışmanın nasıl gittiğini gösterir. */
  kurgu: 'yarisma',
  yarisma: {
    ruzgar: { kod: 'ruzgar-savrun', ad: 'Savrun', unvan: 'Rüzgâr', eylem: 'esti', sirada: 'Sıra Rüzgâr’da' },
    gunes: { kod: 'gunes-parlak', ad: 'Parlak', unvan: 'Güneş', eylem: 'ısıttı', sirada: 'Sıra Güneş’te' },
    yolcu: { kod: 'ayi-pofuduk', ad: 'Pofuduk' },
    /* Giysiler. Yolculuk palto ve atkıyla başlar; Rüzgâr'ın turlarında
       yolcu üşüdükçe şapka, eldiven, battaniye eklenir. Güneş'in turlarında
       ısınan yolcu hepsini kendiliğinden çıkarır — palto en son. */
    giysiler: {
      palto: { kod: 'gunes-palto', ad: 'Palto', takti: 'paltosunun düğmelerini ilikledi', cikardi: 'paltosunu da çıkardı' },
      atki: { kod: 'gunes-atki', ad: 'Atkı', takti: 'atkısını doladı', cikardi: 'atkısını çözdü' },
      sapka: { kod: 'gunes-sapka', ad: 'Şapka', takti: 'şapkasını başına geçirdi', cikardi: 'şapkasını çıkardı' },
      eldiven: { kod: 'gunes-eldiven', ad: 'Eldiven', takti: 'eldivenlerini giydi', cikardi: 'eldivenlerini çıkardı' },
      battaniye: { kod: 'gunes-battaniye', ad: 'Battaniye', takti: 'battaniyeye sarındı', cikardi: 'battaniyeyi katladı' }
    },
    baslangic: ['palto', 'atki'],
    ruzgarEkler: ['sapka', 'eldiven', 'battaniye'],
    gunesCikarir: ['battaniye', 'eldiven', 'atki', 'sapka', 'palto']
  },

  /* Mekân: yayla yolu. Arka yarı Rüzgâr'ın sırtı, ön yarı Güneş'in yamacı. */
  dunya: { mekan: 'yayla-yolu', gok: 0xd8eaf2, cevre: 0x9fbf86, yol: 0xeadcb6, cekirdek: 50817,
    yerlesim: yaylaYerlesimi, yolKapali: false,
    piyonTur: 'kirlangic', piyon: 0x2c4478, piyonKarin: 0xfff4e4, piyonIc: 0xc8553d,   // çocuk bir kırlangıç olarak dolaşır
    /* Çözülen her durak yol kenarında bir ayçiçeği açtırır — yolculuk
       ilerledikçe yayla sarıya boyanıyor. */
    izNotu: { bos: 'Yol kenarında henüz çiçek yok', dolu: '{n} ayçiçeği açtı · yolculuk sürüyor' },
    iz: 'aycicegi', izRenk: 0xf2c230, kesifRenk: 0xe0a23c,
    kesif: [
      { x: -7, z: -.6, ikon: 'gunes-degirmen', ad: 'Yel değirmeni',
        metin: 'Yaylanın en eski değirmeni. Savrun estikçe kanatları döner, içindeki taş buğdayı un eder. Fırtına günü öyle hızlı döner ki uğultusu köye kadar duyulur.' },
      { x: -16.4, z: -10.4, ikon: 'tas', ad: 'Rüzgâr tepesi',
        metin: 'Yaylanın en yüksek kayası. Savrun sabahları buradan kalkar; tepede durunca saçların uçuşur. Aşağıda bütün yol, dört yamaç bir arada görünür.' },
      { x: 3.4, z: 2.5, ikon: 'gunes-cesme', ad: 'Ninenin çeşmesi',
        metin: 'Pofuduk’un ninesi bu çeşmenin başında çamaşır yıkar, kulübenin önündeki ipe asar. Suyu buz gibidir; öğle sıcağında bir avuç içen serinler.' },
      { x: 2.9, z: 9.3, ikon: 'gunes-kopru', ad: 'Taş köprü',
        metin: 'Çeşmeden taşan su bir dere olup bu köprünün altından akar. Köprünün taşlarını yayladaki herkes birer birer taşımış; ortadaki büyük taşı bir ayı koymuş.' },
      { x: -7.6, z: 3.4, ikon: 'gunes-aycicegi', ad: 'Ayçiçeği tarlası',
        metin: 'Ayçiçekleri başlarını gün boyu Parlak’a çevirir: sabah doğuya, akşam batıya. Cik tarlanın üstünde alçaktan uçar; burada sinek bol, gölge serin.' }
    ]},

  acilis: [
    { tag: 'BİR VARMIŞ, BİR YOKMUŞ', baslik: 'Gökyüzünde iki komşu varmış.', ikon: 'bulut',
      metin: 'Yüksek bir yaylanın gökyüzünde iki komşu yaşarmış: sıcacık Güneş Parlak ile kabarık yanaklı Rüzgâr Savrun. Bir sabah bir konuda hiç anlaşamamışlar: hangisi daha güçlü?' },
    { tag: 'BİR YOLCU', baslik: 'Paltolu bir ayı yola çıkıyor.', ikon: 'ayi-pofuduk',
      metin: 'Aşağıda, kıvrılan yayla yolunda Pofuduk adında bir ayı yürüyormuş. Kalın paltosunu giymiş, atkısını dolamış, ninesine bal götürüyormuş. Savrun, “Onun paltosunu kim çıkartırsa en güçlü odur!” demiş. Parlak da gülümseyip kabul etmiş.' },
    { tag: 'BU MASALIN KAHRAMANI SİZSİNİZ', baslik: 'Önce Rüzgâr, sonra Güneş.', ikon: 'isik',
      metin: 'Dört tur var. İlk iki turda Savrun esecek, son iki turda Parlak ısıtacak. Sırayla tahtaya gelip Pofuduk’un yolculuğuna yardım edeceğiz. Panodaki ibreye ve Pofuduk’un giysilerine iyi bakın: sizce kim kazanacak?' }
  ],

  bolumler: [
    {
      kod: 'sabah', ad: 'Sabah esintisi', baslik: 'Rüzgâr ilk kez esiyor', sira: 'ruzgar',
      turSonu: 'Rüzgâr’ın ilk turu bitti!',
      renk: '#6F9DB8', acik: '#DCEBF3', gok: '#EAF3F8', zemin: '#BFD3A2',
      hikaye: 'Sabah erkenden Pofuduk yayla yoluna çıktı; sırtında ninesine götürdüğü bal sepeti var. Savrun yanaklarını şişirdi: “İlk sıra benim! Bir üflerim, o palto uçar gider.” Cik bir dala kondu, izlemeye başladı.',
      soz: '“Rüzgâr eserse yolcu yakasını kaldırır.”',
      karakter: { kod: 'ruzgar-savrun', ad: 'Savrun', tur: 'Rüzgâr' },
      sozler: [ 'Ben Savrun! Şimdi bir üfleyeceğim, görürsünüz!', 'Hıııh! Biraz daha sert eseyim mi?', 'Tuhaf… Ben estikçe o daha sıkı sarınıyor!' ],
      armagan: { kod: 'hava', ad: 'Sabah esintisi', renk: '#8FB6CF' },
      engeller: [
        { engel: 'Savrun üfledi, sepetteki elmalar havalandı.',
          sahne: { tip: 'sorun', nesne: 'elma', adet: 6, kisi: 'ruzgar-savrun', dekor: ['agac', 'ot', 'bulut'],
            metin: 'Savrun ilk kez var gücüyle üfledi. Pofuduk’un sepetinin kapağı açıldı; elmalar havada uçuşuyor!', soz: 'Hıııh! İşte böyle eserim ben!' }, gorev: 'yakala',
          yonerge: 'Rüzgâr elmaları savuruyor. Parmağını aşağıda gezdir, sepeti kaydır ve düşen elmaları tut; yapraklara aldırma.',
          hedef: 8, hiz: .2, sikayet: 1100, iyi: [ 'elma' ], kotu: [ 'yaprak' ],
          cozum: 'Elmalar sepete döndü. Pofuduk kapağı sıkıca bağladı, yakasını kaldırdı.' },
        { engel: 'Rüzgâr yola kırık dallar savurdu.',
          sahne: { tip: 'gelis', nesne: 'dal3', adet: 4, kisi: 'ayi-pofuduk', dekor: ['agac', 'tas', 'ot'],
            metin: 'Pofuduk yokuşa vardığında gördü: Savrun’un kırdığı dallar yolu kapatmış. Sepetle üstlerinden atlanmaz.', soz: 'Dallara takılmadan geçmeliyim.' }, gorev: 'yol',
          yonerge: 'Pofuduk için dallara ve kayaya değmeden bir yol çizelim.',
          baslangic: { x: 105, y: 220, sekil: 'ayi-pofuduk', ad: 'Pofuduk' }, bitis: { x: 900, y: 220, sekil: 'gunes-degirmen', ad: 'Yel değirmeni' },
          engeller: [ { x: 400, y: 130, r: 88, sekil: 'dal3', ad: 'Kırık dal' },
                      { x: 620, y: 320, r: 88, sekil: 'tas', ad: 'Kaya' } ],
          cozum: 'Pofuduk dalların arasından geçip yel değirmenine vardı. Rüzgâr hâlâ esiyor; palto hâlâ üstünde.' },
        { engel: 'Rüzgâr her şeyi birbirine kattı.',
          sahne: { tip: 'kesif', nesne: 'yaprak', adet: 6, kisi: 'kirlangic-cik', dekor: ['bulut', 'ot', 'agac'],
            metin: 'Esintiden sonra yolun kenarı karmakarışık. Cik havadan bakıyor: neyi rüzgâr uçurur, neyi uçuramaz?' }, gorev: 'fark',
          yonerge: 'Her bilmecede biri ötekilere benzemiyor. Cik ile birlikte onu bulalım.',
          turlar: [
            { soru: 'Hangisini rüzgâr uçuramaz?', digerleri: [ { ad: 'Yaprak', sekil: 'yaprak' }, { ad: 'Bulut', sekil: 'bulut' }, { ad: 'Poşet', sekil: 'poset' } ],
              yabanci: { ad: 'Kaya', sekil: 'tas' }, neden: 'Kaya çok ağırdır; rüzgâr onu kıpırdatamaz.' },
            { soru: 'Hangisi giyilmez?', digerleri: [ { ad: 'Şapka', sekil: 'gunes-sapka' }, { ad: 'Atkı', sekil: 'gunes-atki' }, { ad: 'Eldiven', sekil: 'gunes-eldiven' } ],
              yabanci: { ad: 'Elma', sekil: 'elma' }, neden: 'Elma yenir; ötekiler üşümemek için giyilir.' },
            { soru: 'Hangisi gökyüzünde gezmez?', digerleri: [ { ad: 'Bulut', sekil: 'bulut' }, { ad: 'Kuş', sekil: 'kus' }, { ad: 'Güneş', sekil: 'isik' } ],
              yabanci: { ad: 'Balık', sekil: 'balik' }, neden: 'Balık suda yüzer; gökyüzünde gezmez.' }
          ],
          cozum: 'Bilmeceler çözüldü. Cik güldü: “Rüzgâr hafif şeyleri uçurur, ağırları uçuramaz!”' },
        { engel: 'Savrun dört bir yandan esmeye başladı.',
          sahne: { tip: 'istek', nesne: 'hava', adet: 4, kisi: 'ruzgar-savrun', dekor: ['bulut', 'agac', 'ot'],
            metin: 'Savrun bir değirmeni, bir ağacı, bir bulutu sallıyor. Pofuduk hangi yandan korunacağını şaşırdı.', soz: 'Bakalım sıramı aklınızda tutabilecek misiniz?' }, gorev: 'dizi',
          yonerge: 'Savrun sırayla neyi salladı? Dinleyelim, sonra aynı sırayla dokunalım.',
          dostlar: [ { sekil: 'gunes-degirmen', ad: 'Değirmen' }, { sekil: 'agac', ad: 'Ağaç' },
                     { sekil: 'bulut', ad: 'Bulut' }, { sekil: 'gunes-sapka', ad: 'Şapka' } ],
          uzunluklar: [ 2, 3, 4 ],
          cozum: 'Sıra aklımızda kaldı. Pofuduk her esintiye hazırdı; sırtını rüzgâra verip sarındı.' },
        { engel: 'Rüzgâr sepeti bir yana yatırıyor.',
          sahne: { tip: 'sorun', nesne: 'elma', adet: 5, kisi: 'ayi-pofuduk', dekor: ['ot', 'tas', 'agac'],
            metin: 'Sepetin bir yanında bal kavanozları, öbür yanı boş. Savrun her estiğinde sepet ağır yana yatıyor, Pofuduk sendeliyor.', soz: 'Böyle giderse devrileceğim!' }, gorev: 'terazi',
          yonerge: 'Bal kavanozlarının karşısına taş koyalım; iki kefe eşit olunca sepet dengede durur.',
          sol: [ { sekil: 'gunes-bal', agirlik: 3 }, { sekil: 'gunes-bal', agirlik: 2 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 } ],
          cozum: 'Sepet dengelendi. Rüzgâr ne kadar esse de Pofuduk artık sendelemiyor — ama paltosunu da hiç bırakmıyor.' },
        { engel: 'Savrun kozalakları yola saçtı.',
          sahne: { tip: 'sorun', nesne: 'kozalak', adet: 6, kisi: 'ruzgar-savrun', dekor: ['agac', 'kozalak', 'ot'],
            metin: 'Çam ağacının altından bir esinti geçti; kozalaklar yuvarlana yuvarlana yola saçıldı. Pofuduk’un ayağı kayabilir.', soz: 'Ben sadece biraz oynadım!' }, gorev: 'say',
          yonerge: 'Yoldaki kozalakları tek tek sayarak kenara alalım.',
          sayi: 6, sekil: 'kozalak',
          cozum: 'Altı kozalak kenara kondu; yol temizlendi. Pofuduk yakasını kaldırıp yürümeye devam etti.' }
      ],
      final: { engel: 'Savrun’un soluğu kesildi.',
               sahne: { tip: 'istek', nesne: 'hava', adet: 3, kisi: 'ruzgar-savrun', dekor: ['bulut', 'agac', 'ot'],
               metin: 'Savrun bütün sabah üfledi, üfledi. Şimdi yanakları söndü, soluk soluğa bir tepeye kondu. Palto hâlâ Pofuduk’un üstünde.', soz: 'Of… Biraz dinlensem mi?' }, etkinlik: 'sev',
               cozum: 'Savrun dinlendi ve gülümsedi. “Bir tur daha hakkım var,” dedi. “Bu kez fırtına gibi eseceğim!”' }
    },
    {
      kod: 'firtina', ad: 'Fırtına', baslik: 'Rüzgâr var gücüyle esiyor', sira: 'ruzgar',
      turSonu: 'Rüzgâr’ın ikinci turu bitti!',
      renk: '#5B7C99', acik: '#D5DFE8', gok: '#E3E9EF', zemin: '#AEC19A',
      hikaye: 'Savrun ikinci turda bulutları topladı, kocaman bir fırtına oldu. Ağaçlar eğildi, değirmen deli gibi döndü. Ama Pofuduk ne yaptı? Durdu, sepetinde ne varsa üstüne giydi.',
      soz: '“Fırtına ne kadar sert eserse, palto o kadar sıkı tutulur.”',
      karakter: { kod: 'ayi-pofuduk', ad: 'Pofuduk', tur: 'Yolcu ayı' },
      sozler: [ 'Brrr! Bu rüzgâr beni üşüttü. Bana yardım eder misiniz?', 'Sıkı sarındım, artık üşümüyorum.', 'Fırtına bitti. Palto hâlâ üstümde!' ],
      armagan: { kod: 'bulut', ad: 'Fırtına bulutu', renk: '#7F9BB2' },
      engeller: [
        { engel: 'Fırtına Pofuduk’un şapkasını kaptı!',
          sahne: { tip: 'sorun', nesne: 'gunes-sapka', adet: 3, kisi: 'ayi-pofuduk', dekor: ['bulut', 'agac', 'ot'],
            metin: 'Bir fırtına esti ve Pofuduk’un şapkası başından uçtu! Şapka havada takla atarak tarlaya doğru gidiyor.', soz: 'Şapkam! Gözünüzü ondan ayırmayın!' }, gorev: 'takip',
          yonerge: 'Uçan şapkanın üstüne parmağını koy ve kaldırmadan takip et.',
          sekil: 'gunes-sapka', sure: 5200, hiz: .75, boy: 14,
          cozum: 'Şapka yakalandı! Pofuduk onu başına geçirip kulaklarına kadar çekti.' },
        { engel: 'Fırtına sepetten bir şey uçurdu.',
          sahne: { tip: 'kesif', nesne: 'elma', adet: 5, kisi: 'kirlangic-cik', dekor: ['bulut', 'tas', 'ot'],
            metin: 'Cik sepetin içine bakıyor. Her rüzgârda bir şey eksiliyor gibi. Ama ne?' }, gorev: 'kayip',
          yonerge: 'Sepete iyi bakalım. Gözümüzü kapayıp açınca ne eksildi, bulalım.',
          tur: 2,
          ogeler: [ { ad: 'Elma', sekil: 'elma' }, { ad: 'Bal', sekil: 'gunes-bal' },
                    { ad: 'Eldiven', sekil: 'gunes-eldiven' }, { ad: 'Kozalak', sekil: 'kozalak' },
                    { ad: 'Su şişesi', sekil: 'sise' } ],
          cozum: 'Eksilenler bulundu. Pofuduk hepsini sepete koydu, kapağı bir de iple bağladı.' },
        { engel: 'Fırtınada elma ağacı sallanıyor.',
          sahne: { tip: 'gelis', nesne: 'elma', adet: 6, kisi: 'ruzgar-savrun', dekor: ['agac', 'agac', 'ot'],
            metin: 'Yol kenarındaki elma ağacı fırtınada bir o yana bir bu yana sallanıyor. Elmalar yere düşerse ezilecek.', soz: 'Sallarım, sallarım!' }, gorev: 'isabet',
          yonerge: 'Sallanan elmalara tam üstünden dokun; düşmeden toplayalım.',
          sekil: 'elma', hedef: 7, adet: 4, hiz: .7, boy: 12,
          cozum: 'Elmalar toplandı. Pofuduk üşüyen patilerini ceplerine soktu.' },
        { engel: 'Fırtına herkesin eşyasını birbirine kattı.',
          sahne: { tip: 'kesif', nesne: 'yaprak', adet: 6, kisi: 'kirlangic-cik', dekor: ['bulut', 'agac', 'tas'],
            metin: 'Rüzgâr biraz dinince yolun kenarı darmadağın. Kimin neyi nereye uçtu, kimse bilemiyor.' }, gorev: 'eslestir',
          yonerge: 'Her eşyayı sahibiyle eşleştirelim.',
          ciftler: [ { a: 'Pofuduk', asekil: 'ayi-pofuduk', b: 'Palto', bsekil: 'gunes-palto' },
                     { a: 'Cik', asekil: 'kirlangic-cik', b: 'Yuva', bsekil: 'yuva' },
                     { a: 'Parlak', asekil: 'gunes-parlak', b: 'Işık', bsekil: 'isik' },
                     { a: 'Savrun', asekil: 'ruzgar-savrun', b: 'Bulut', bsekil: 'bulut' } ],
          cozum: 'Herkes eşyasına kavuştu. Pofuduk paltosunun düğmelerini tek tek ilikledi.' },
        { engel: 'Fırtına atkının ilmeklerini söktü.',
          sahne: { tip: 'sorun', nesne: 'gunes-atki', adet: 4, kisi: 'ayi-pofuduk', dekor: ['bulut', 'ot', 'agac'],
            metin: 'Savrun atkının ucunu çekiştirdi; ninesinin ördüğü desen yer yer söküldü. Pofuduk üzüldü.', soz: 'Ninem bunu kalp ve yıldızla örmüştü.' }, gorev: 'oruntu',
          yonerge: 'Atkının desenine bak: kalp, yıldız, kalp, yıldız… boşluğa hangisi geliyor?',
          dizi: [ 'kalp', 'yildiz', 'kalp', 'yildiz', null, null, 'kalp' ],
          cevaplar: [ 'kalp', 'yildiz' ],
          secenekler: [ { sekil: 'kalp', ad: 'Kalp' }, { sekil: 'yildiz', ad: 'Yıldız' }, { sekil: 'yaprak', ad: 'Yaprak' } ],
          cozum: 'Desen tamamlandı. Pofuduk atkısını boynuna iki kez doladı; fırtına içeri giremiyor.' },
        { engel: 'Fırtına ayçiçeği tohumlarını savurdu.',
          sahne: { tip: 'gelis', nesne: 'tohum', adet: 5, kisi: 'kus', dekor: ['bulut', 'ot', 'agac'],
            metin: 'Fırtına geçen yılın ayçiçeği tohumlarını yola savurdu. Yaylanın minik sarı kuşu bir tohumu gagasına aldı; rüzgâr onu bir o yana bir bu yana sürüklüyor. Tohum verimli toprağa düşerse filizlenir.', soz: 'Şimdi mi bırakayım? Siz söyleyin!' }, gorev: 'zaman',
          yonerge: 'Sarı kuş tam verimli toprağın üstündeyken “Şimdi bırak!” düğmesine basalım.',
          tasiyici: 'kus', tasiyiciAd: 'Sarı kuş', yuk: 'tohum',
          hedef: 'toprak', hedefAd: 'Verimli toprak', genislik: 30, hiz: 1, hedefSayisi: 3,
          cozum: 'Üç tohum da toprağa düştü. Güneş çıkınca filizlenecekler!' }
      ],
      final: { engel: 'Fırtına Pofuduk’un tüylerini birbirine kattı.',
               sahne: { tip: 'istek', nesne: 'hava', adet: 3, kisi: 'ayi-pofuduk', dekor: ['bulut', 'agac', 'ot'],
               metin: 'Fırtına dindi. Pofuduk bir taşa oturdu; üstünde ne varsa giymiş, top gibi olmuş. Kulaklarının tüyleri diken diken.', soz: 'Rüzgâr beni fena dağıttı…' }, etkinlik: 'timarla',
               cozum: 'Pofuduk’un tüyleri tarandı. Savrun mahcup bir sesle, “Paltoyu çıkaramadım,” dedi. “Tersine, daha çok giydi.”' }
    },
    {
      kod: 'ogle', ad: 'Öğle ılıklığı', baslik: 'Sıra Güneş’te', sira: 'gunes',
      turSonu: 'Güneş’in ilk turu bitti!',
      renk: '#DC9A30', acik: '#FCEBC6', gok: '#FFF6E0', zemin: '#DDD08A',
      hikaye: 'Savrun kenara çekildi. Parlak bulutların arkasından usulca çıktı; bağırmadı, üflemedi, sadece gülümsedi. Yayla yavaş yavaş ısınmaya başladı.',
      soz: '“Sabırlı güneş, sert rüzgârın açamadığını açar.”',
      karakter: { kod: 'gunes-parlak', ad: 'Parlak', tur: 'Güneş' },
      sozler: [ 'Ben Parlak. Acele etmeyeceğim; yavaş yavaş ısıtacağım.', 'Bakın, Pofuduk gülümsemeye başladı!', 'Kimseyi zorlamadım. Kendi istedi!' ],
      armagan: { kod: 'isik', ad: 'Öğle ışığı', renk: '#F2C14E' },
      engeller: [
        { engel: 'Parlak derenin suyunda pırıldıyor.',
          sahne: { tip: 'gelis', nesne: 'yildiz', adet: 5, kisi: 'gunes-parlak', dekor: ['bulut', 'ot', 'gunes-kopru'],
            metin: 'Parlak bulutların arasından usulca göründü. Işığı derenin suyuna vurunca suyun üstünde yıldız gibi pırıltılar yanıp sönmeye başladı.', soz: 'Bakın, su bile gülümsüyor!' }, gorev: 'takimyildiz',
          yonerge: 'Suyun üstünde bazı pırıltılar yandı. Hangileri parladıysa aynılarına dokunalım.',
          nokta: 12, yanan: 4, tur: 2, bakma: 2400,
          cozum: 'Pırıltıların hepsini bulduk. Dere ışıl ışıl, yayla ılık ılık ısındı.' },
        { engel: 'Pofuduk ısınınca sepetini açtı.',
          sahne: { tip: 'istek', nesne: 'elma', adet: 6, kisi: 'ayi-pofuduk', dekor: ['gunes-aycicegi', 'ot', 'agac'],
            metin: 'Güneşte ısınan Pofuduk keyiflendi. Yolda üç dost gördü ve sepetindeki elmaları onlarla bölüşmek istedi.', soz: 'Herkese eşit düşsün, olur mu?' }, gorev: 'paylas',
          yonerge: 'Elmaları üç dosta eşit bölelim; kimse eksik kalmasın.',
          dostlar: [ { sekil: 'sincap', ad: 'Sincap' }, { sekil: 'tavsan', ad: 'Tavşan' }, { sekil: 'koyun', ad: 'Kuzu' } ],
          yem: 'elma', yemAd: 'Elma', adet: 9,
          cozum: 'Üç dosta da eşit düştü. Pofuduk’un içi de dışı da ısındı.' },
        { engel: 'Fırtınada saklanan dostlar ısınmaya çıkıyor.',
          sahne: { tip: 'kesif', nesne: 'gunes-aycicegi', adet: 6, kisi: 'kirlangic-cik', dekor: ['gunes-aycicegi', 'ot', 'gunes-aycicegi'],
            metin: 'Sabahki fırtınada küçük dostlar yaprakların arasına saklanmıştı. Parlak tarlayı ısıtınca birer birer başlarını çıkarıyorlar. Cik alçaktan uçup onları arıyor.' }, gorev: 'gizli',
          yonerge: 'Yaprakların, otların arasında saklanan dört dostu bulalım. Kimse onları zorlamadı; güneşte ısınınca kendileri çıktılar.',
          tohum: 52, sus: 30, susBoy: [4, 8], boy: 10,
          gizli: [ { sekil: 'tavsan', ad: 'Tavşan', x: 18, y: 58, a: -8 },
                   { sekil: 'sincap', ad: 'Sincap', x: 77, y: 28, a: 10 },
                   { sekil: 'kaplumbaga', ad: 'Kaplumbağa', x: 46, y: 78, a: -12 },
                   { sekil: 'kus', ad: 'Serçe', x: 62, y: 52, a: 14 } ],
          cozum: 'Dördü de güneşe çıktı. Zorla değil, sıcacık bir ışıkla!' },
        { engel: 'Pofuduk ısındı ve susadı.',
          sahne: { tip: 'istek', nesne: 'su', adet: 4, kisi: 'ayi-pofuduk', dekor: ['gunes-cesme', 'ot', 'gunes-aycicegi'],
            metin: 'Öğle sıcağı bastırdı. Pofuduk yol kenarındaki eski çeşmeye vardı ama oluktan suyla birlikte yapraklar, dallar da akıyor.', soz: 'Bir yudum serin su…' }, gorev: 'refleks',
          yonerge: 'Oluktan her şey akıyor. Yalnızca suya dokun; başka bir şey gelirse elini çek. Beş yudum yeter.',
          hedef: 5, gorunme: 1250, ara: 280,
          aranan: { sekil: 'su', ad: 'Su' },
          digerleri: [ { sekil: 'yaprak', ad: 'Yaprak' }, { sekil: 'dal2', ad: 'Dal' }, { sekil: 'tas', ad: 'Taş' } ],
          cozum: 'Pofuduk kana kana su içti. “Ohh,” dedi, “ne güzel ısındım.”' },
        { engel: 'Yol kenarındaki çeşmenin taşları devrilmiş.',
          sahne: { tip: 'sorun', nesne: 'tas', adet: 4, kisi: 'gunes-parlak', dekor: ['gunes-cesme', 'tas', 'ot'],
            metin: 'Sabahki fırtına yol kenarındaki eski çeşmenin taşlarını devirmiş. Parlak ısıttıkça taşlar kuruyor; şimdi yerlerine konabilir.' }, gorev: 'yapboz',
          yonerge: 'Parçaları yerine koyup çeşmeyi birlikte onaralım.',
          resim: 'gunes-cesme', satir: 2, sutun: 3,
          cozum: 'Çeşme onarıldı; suyu yeniden şırıl şırıl akıyor.' },
        { engel: 'Çıkan giysiler çamaşır ipine eş eş asılacak.',
          sahne: { tip: 'cozuldu', nesne: 'gunes-eldiven', adet: 4, kisi: 'ayi-pofuduk', dekor: ['gunes-cesme', 'ot', 'gunes-aycicegi'],
            metin: 'Pofuduk öyle ısındı ki üstündekileri birer birer çıkarıyor. Cik hepsini ninenin çamaşır ipine taşıyacak; ama eşleri karışmasın.', soz: 'Oh be! Ne kadar hafifledim.' }, gorev: 'cift',
          yonerge: 'İki kart çevir; aynıysa açık kalır. Eşlerin yerini aklında tut.',
          cift: [ 'gunes-eldiven', 'gunes-atki', 'gunes-sapka', 'gunes-palto', 'gunes-battaniye', 'gunes-aycicegi' ],
          cozum: 'Bütün eşler bulundu; çamaşır ipi rengârenk oldu.' }
      ],
      final: { engel: 'Parlak sarılmak istiyor.',
               sahne: { tip: 'gelis', nesne: 'isik', adet: 5, kisi: 'gunes-parlak', dekor: ['bulut', 'gunes-aycicegi', 'ot'],
               metin: 'Parlak bütün öğle yayla yolunu usul usul ısıttı. Kimseyi zorlamadı, kimseye bağırmadı. Şimdi sıcacık bir kucaklaşma istiyor.', soz: 'Gelin, biraz ısınalım!' }, etkinlik: 'sev',
               cozum: 'Parlak ışıl ışıl gülümsedi. Savrun uzaktan izliyor: “Hiç üflemedin, ama bak — Pofuduk kendi çıkarıyor!”' }
    },
    {
      kod: 'aksam', ad: 'Akşamüstü', baslik: 'Palto kendiliğinden çıkıyor', sira: 'gunes',
      turSonu: 'Güneş’in ikinci turu bitti!',
      renk: '#DE7C4C', acik: '#FADBC6', gok: '#FDEBDD', zemin: '#D9C189',
      hikaye: 'Parlak ısıtmayı sürdürdü. Pofuduk battaniyeyi katladı, eldivenlerini ve atkısını çıkardı. Kimse ona “çıkar” demedi; ısınınca kendi istedi. Sırada şapka var… ya palto? Akşamüstü sıcak bastırınca Savrun da güzel bir şey düşündü.',
      soz: '“Zorla açılmayan kapı, tatlı sözle açılır.”',
      karakter: { kod: 'kirlangic-cik', ad: 'Cik', tur: 'Kırlangıç' },
      sozler: [ 'Cik cik! Ben Cik, Pofuduk’un yol arkadaşıyım. Son tura hazır mısınız?', 'Bakın, palto çıkıyor! Hem de kendiliğinden!', 'Yolculuk bitti; herkes kazandı!' ],
      armagan: { kod: 'gunes-aycicegi', ad: 'Akşam ayçiçeği', renk: '#E9B949' },
      engeller: [
        { engel: 'Giysiler çamaşır ipine sırayla asılacak.',
          sahne: { tip: 'istek', nesne: 'gunes-eldiven', adet: 4, kisi: 'kirlangic-cik', dekor: ['gunes-cesme', 'ot', 'gunes-aycicegi'],
            metin: 'Cik, Pofuduk’un çıkardıklarını ninenin çamaşır ipine taşıyor. İp kısa; küçükten büyüğe asarsak hepsi sığar. Palto mu? O hâlâ Pofuduk’un üstünde!', soz: 'En küçüğünden başlayalım mı?' }, gorev: 'sirala',
          yonerge: 'Giysileri küçükten büyüğe dizelim ki ipe hepsi sığsın.',
          ogeler: [ { ad: 'Eldiven', sekil: 'gunes-eldiven' }, { ad: 'Şapka', sekil: 'gunes-sapka' },
                    { ad: 'Atkı', sekil: 'gunes-atki' }, { ad: 'Battaniye', sekil: 'gunes-battaniye' } ],
          cozum: 'Giysiler küçükten büyüğe dizildi; ip tam yetti.' },
        { engel: 'Ayçiçekleri tohumlarını döküyor.',
          sahne: { tip: 'gelis', nesne: 'tohum', adet: 6, kisi: 'kirlangic-cik', dekor: ['gunes-aycicegi', 'gunes-aycicegi', 'ot'],
            metin: 'Akşam güneşinde ayçiçekleri başlarını eğdi; olgun tohumlar pıtır pıtır dökülüyor. Pofuduk ninesine bir sepet çekirdek götürmek istiyor.', soz: 'Cik cik! Sepeti tutun, tohumlar yağıyor!' }, gorev: 'yakala',
          yonerge: 'Tohumlar yağıyor. Parmağını aşağıda gezdir, sepeti kaydır ve tohumları tut; yapraklara aldırma.',
          hedef: 9, hiz: .2, sikayet: 1050, iyi: [ 'tohum' ], kotu: [ 'yaprak' ],
          cozum: 'Sepet çekirdekle doldu; ninesine de, yaylanın kuşlarına da yetecek kadar.' },
        { engel: 'Cik akşam göğünde dönüp duruyor.',
          sahne: { tip: 'gelis', nesne: 'isik', adet: 4, kisi: 'kirlangic-cik', dekor: ['bulut', 'gunes-aycicegi', 'ot'],
            metin: 'Kırlangıçlar akşamüstü alçaktan uçar. Cik ninenin evinin yolunu biliyor; ama öyle hızlı dönüyor ki gözden kaçabilir.', soz: 'Beni izleyin, yolu göstereyim!' }, gorev: 'takip',
          yonerge: 'Parmağını Cik’in üstüne koy ve kaldırmadan takip et; ninenin evinin yolunu göstersin.',
          sekil: 'kirlangic-cik', sure: 5600, hiz: .8, boy: 13,
          cozum: 'Cik’i hiç kaçırmadık. Ninenin kulübesinin bacası uzaktan göründü.' },
        { engel: 'Akşam göğünde ilk yıldızlar yanıyor.',
          sahne: { tip: 'kesif', nesne: 'yildiz', adet: 5, kisi: 'gunes-parlak', dekor: ['bulut', 'gunes-degirmen', 'gunes-aycicegi'],
            metin: 'Parlak dağların ardına iniyor. Savrun bulutları usulca kenara çekti; gökyüzünde ilk yıldızlar birer birer göründü. Cik yolu onlara bakarak buluyor.', soz: 'Hangileri yandı, aklınızda tutun!' }, gorev: 'takimyildiz',
          yonerge: 'Bazı yıldızlar bir an parladı. Hangileri parladıysa aynılarına dokunalım.',
          nokta: 12, yanan: 5, tur: 2, bakma: 2600,
          cozum: 'Yıldızlar yerini buldu. Cik onlara bakarak ninenin kulübesinin yolunu gösterdi.' },
        { engel: 'Savrun bu kez serinletmek için esiyor.',
          sahne: { tip: 'istek', nesne: 'yaprak', adet: 5, kisi: 'ruzgar-savrun', dekor: ['agac', 'gunes-aycicegi', 'ot'],
            metin: 'Akşamüstü sıcak bastırdı; Pofuduk terledi. Savrun bu kez sert değil, usul usul esiyor. Havada süzülen yapraklardan bir yelpaze yapılabilir.', soz: 'Bu kez yardım etmek için esiyorum.' }, gorev: 'isabet',
          yonerge: 'Süzülen yaprakların tam üstüne dokun; yelpaze için yedi yaprak toplayalım.',
          sekil: 'yaprak', hedef: 7, adet: 4, hiz: .6, boy: 12,
          cozum: 'Yelpaze hazır. Savrun hafifçe esti, Pofuduk serinledi: “İkiniz de iyisiniz!”' },
        { engel: 'Kestirme patika ayçiçeklerinin arasından geçiyor.',
          sahne: { tip: 'gelis', nesne: 'gunes-aycicegi', adet: 6, kisi: 'ayi-pofuduk', dekor: ['gunes-aycicegi', 'gunes-aycicegi', 'ot'],
            metin: 'Pofuduk hafif adımlarla yürüyor. Ninesinin kulübesinin bacası tarlanın ardından görünüyor. Kestirmeden gidecek; ama çiçekleri ezmeden geçmek gerek.', soz: 'Hiçbirini kırmayalım.' }, gorev: 'yol',
          yonerge: 'Ayçiçeklerine değmeden Pofuduk’u tarlanın öbür ucuna, kulübeye giden yola götürelim.',
          baslangic: { x: 100, y: 220, sekil: 'ayi-pofuduk', ad: 'Pofuduk' }, bitis: { x: 905, y: 220, sekil: 'gunes-kulube', ad: 'Kulübeye giden yol' },
          engeller: [ { x: 330, y: 120, r: 86, sekil: 'gunes-aycicegi', ad: 'Ayçiçeği' },
                      { x: 420, y: 330, r: 82, sekil: 'gunes-aycicegi', ad: 'Ayçiçeği' },
                      { x: 640, y: 160, r: 88, sekil: 'gunes-aycicegi', ad: 'Ayçiçeği' },
                      { x: 700, y: 360, r: 78, sekil: 'gunes-aycicegi', ad: 'Ayçiçeği' } ],
          cozum: 'Tek bir çiçek bile kırılmadı. Ninenin kulübesi artık çok yakın.' }
      ],
      final: { engel: 'Cik bütün gün Pofuduk’a yol gösterdi.',
               sahne: { tip: 'cozuldu', nesne: 'gunes-aycicegi', adet: 5, kisi: 'kirlangic-cik', dekor: ['gunes-aycicegi', 'gunes-cesme', 'ot'],
               metin: 'Akşam oldu. Pofuduk ninesinin kulübesine vardı; paltosunu kendi eliyle çamaşır ipine astı, çeşmenin başına oturdu. Cik omzuna kondu; bütün gün rüzgârda uçmaktan tüyleri karmakarışık olmuş.', soz: 'Cik cik! Tüylerim darmadağın.' }, etkinlik: 'timarla',
               cozum: 'Cik’in tüyleri yumuşacık düzeldi. Pofuduk yol arkadaşına teşekkür etti; Parlak ile Savrun akşam göğünde yan yana gülümsüyor.' }
    }
  ],

  kapanis: {
    baslik: 'Nezaket kazandı. Ama kimse kaybetmedi.',
    metin: 'Savrun bütün gücüyle esti; Pofuduk paltosuna daha sıkı sarıldı. Parlak ise hiç acele etmeden ısıttı; Pofuduk atkısını, şapkasını, sonunda paltosunu kendi isteğiyle çıkardı.\n\nSavrun kızmadı, öğrendi. Akşamüstü sıcak bastırınca usul usul esip Pofuduk’u serinletti. O günden beri yayla yolunda ikisi birlikte çalışır: biri ısıtır, biri serinletir.',
    ders: 'Nezaket, zorlamaktan güçlüdür.'
  }
};

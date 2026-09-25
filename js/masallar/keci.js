/* MASAL — İKİ KEÇİ (La Fontaine / halk masalı)
   ─────────────────────────────────────────────
   Kaynak kamu malı. Metin bize ait, çeviri değil.

   FİNALİ YUMUŞATTIM: Masalın bir anlatımında iki keçi köprünün ortasında
   inatlaşır ve ikisi de dereye düşer. Burada kimse düşmez, kimse
   korkmaz. Köprü yalnızca sallanır; serçe Cıkcık ile kunduz Usta bir yol
   gösterir: Ak yere çöker, Kara dikkatle üstünden atlar. Sonra ikisi
   birlikte köprüyü genişletir. Ders: sıra vermek de kazanmaktır.

   KURGU: uzlasma. Duraklar SIRAYLA bir Ak'a bir Kara'ya aittir; bölüm
   sonları ikisinin ortak anıdır. Tahta iki yakadan ortaya doğru büyüyen
   iki çubuk gösterir. Her engelin 'yaka' alanı kimin sırasında
   çıkacağını söyler (kurgunun kendi tahtaKur'u bunu kullanır).

   HARİTA: dere kuzeyden güneye akar, köprü ortada. Ak'ın durakları batı
   yakasında, Kara'nınkiler doğu yakasında; köprüye doğru yaklaşırlar.
   Birbirini izleyen iki durak karşılıklı durduğu için yol her sırada
   köprünün üstünden geçer: sıra, köprüden karşıya taşınır. Dördüncü
   bölümde ikisi de karşıya geçmiş olur; yakalar yer değiştirir. */

/* Durak yeri: C köprünün ortası. Batı yakası için (yarıçap, açı°)
   kalıpları; doğu yakası bunların C'ye göre ayna görüntüsüdür. */
const C = { x: 0, z: .2 };
const bati = (r, a) => ({ x: +(-r * Math.cos(a * Math.PI / 180)).toFixed(2), z: +(C.z - r * Math.sin(a * Math.PI / 180)).toFixed(2) });
const ayna = p => ({ x: +(2 * C.x - p.x).toFixed(2), z: +(2 * C.z - p.z).toFixed(2) });
/* Yaklaşma yolu: uzaktan köprüye, kıvrılarak (kuzeybatı kaması). */
const YAKLASMA = [[11.2, 8], [11.2, 20], [11.2, 32], [8.8, 36], [8.8, 22], [8.8, 8],
                  [6.4, 10], [6.4, 25], [6.4, 41], [4.3, 36], [3.4, 14]].map(([r, a]) => bati(r, a));
/* Karşıya geçtikten sonra: köprüden dışarı (güneybatı kaması). */
const UZAKLASMA = [[3.4, -16], [5.6, -24], [7.9, -30], [10.2, -34]].map(([r, a]) => bati(r, a));
/* Bölüm sonları ortak anlardır: köprünün üstünde ve Usta'nın barajında. */
const ORTAK = [{ x: -1.65, z: .2 }, { x: 1.65, z: .2 }, { x: 0, z: .2 }, { x: 2.3, z: 4.6 }];
/* Kalabalık sınıf (29–40 çocuk): kalıplar yetmezse bu yedek yerler
   eklenir. İki yaka simetrik değil (doğuda atölye, duvar, baraj), bu
   yüzden yedekler aynalanmıyor; her biri kendi yakasında seçildi ve
   ötekilerden en az 1.6 birim uzak. */
const YEDEK = {
  bati: { yak: [{ x: -10.37, z: .93 }, { x: -7.34, z: -6.89 }, { x: -2.94, z: -4.33 }],
          uz: [{ x: -4.75, z: 4.19 }, { x: -10.2, z: 4.2 }] },
  dogu: { yak: [{ x: 10.37, z: -.53 }, { x: 6, z: 7.4 }, { x: 2.95, z: -4.1 }],
          uz: [{ x: 4.6, z: -5.2 }, { x: 10.3, z: -3.2 }] }
};

/* Mekân, iki yakanın patikasını bu kalıplardan çizer (hangi yerin dolu
   olduğunu yolaYakin ile sorarak). */
export const DURAK_KALIPLARI = { YAKLASMA, UZAKLASMA, ORTAK, ayna, C };

/* Kimin sırası? Engeller bir Ak'a bir Kara'ya; bölüm sonu ikisinin. */
export function sirayiBul(duraklar) {
  let k = 0;
  return duraklar.map(d => d.sira || (d.tip === 'final' ? 'ortak' : (k++ % 2 ? 'kara' : 'ak')));
}

function yerlesim(duraklar) {
  const sira = sirayiBul(duraklar);
  // Batı yakası: Ak (1-3. bölüm) ve karşıya geçmiş Kara (4. bölüm)
  const yaka = (d, i) => sira[i] === 'ortak' ? 'ortak'
    : (sira[i] === 'ak') === (d.bolum < 3) ? 'bati' : 'dogu';
  const gruplar = { bati: { yak: [], uz: [] }, dogu: { yak: [], uz: [] } };
  duraklar.forEach((d, i) => { const y = yaka(d, i); if (y !== 'ortak') gruplar[y][d.bolum < 3 ? 'yak' : 'uz'].push(i); });
  const yer = [];
  const sec = (liste, kalip, yedek) => {
    if (liste.length > kalip.length) kalip = [...kalip, ...yedek];     // kalabalık sınıf
    liste.forEach((i, k) => {
      const n = liste.length, j = n === 1 ? Math.floor(kalip.length / 2)
        : n >= kalip.length ? k : Math.round(k * (kalip.length - 1) / (n - 1));
      yer[i] = kalip[Math.min(kalip.length - 1, j)];
    });
  };
  for (const taraf of ['bati', 'dogu']) {
    const ay = taraf === 'dogu' ? ayna : p => p;
    sec(gruplar[taraf].yak, YAKLASMA.map(ay), YEDEK[taraf].yak);
    // Uzaklaşma kalıbı kısa; ilk n yeri sırayla kullan (köprüden dışarı)
    const uz = gruplar[taraf].uz.length > UZAKLASMA.length ? [...UZAKLASMA.map(ay), ...YEDEK[taraf].uz] : UZAKLASMA.map(ay);
    gruplar[taraf].uz.forEach((i, k) => { yer[i] = uz[Math.min(uz.length - 1, k)]; });
  }
  duraklar.forEach((d, i) => { if (sira[i] === 'ortak') yer[i] = ORTAK[Math.min(3, d.bolum)]; });
  return yer;
}

export default {
  kod: 'keci',
  ad: 'İki Keçi',
  kaynak: 'La Fontaine · halk masalı',
  ders: 'Sıra vermek de kazanmaktır',
  sure: '40 dakika · bütün sınıf',
  ozet: 'Dar bir kütük köprünün iki ucundan iki keçi aynı anda geçmek ister. Sınıf sırayla ikisine de yardım eder ve köprünün ortasında bir yol bulur.',
  renk: '#7FA77A',
  ikon: 'keci-ak',

  /* KURGU: uzlaşma. Armağan toplanmaz; iki yakadan ortaya doğru iki çubuk
     büyür. Her durak kimin sırası olduğunu söyler, sıra beklemek oyunun
     kendisidir. */
  kurgu: 'uzlasma',
  uzlasma: {
    ak: { kod: 'keci-ak', ad: 'Ak', yaka: 'Batı yakası', karsi: 'Doğu yakası', renk: '#7FB3C8' },
    kara: { kod: 'keci-kara', ad: 'Kara', yaka: 'Doğu yakası', karsi: 'Batı yakası', renk: '#D65A4A' },
    kopru: 'keci-kopru',
    gecis: 3          // bu bölümden sonra ikisi de karşı yakada
  },

  /* Mekân: dağ geçidi. Ortada kütük köprü; sınıf ilerledikçe korkuluk
     ve yeni tahtalar ekleniyor, köprü genişliyor. */
  dunya: { mekan: 'gecit', gok: 0xe3eef0, cevre: 0x9fbf86, cekirdek: 50611, yol: 0xe4d6b2,
    yansima: 0x86a07a,
    piyonTur: 'keci', piyon: 0xd8ab78, piyonKarin: 0xf3e2c6, piyonIc: 0xe8a898,   // çocuk ela bir oğlak olarak dolaşır (Ak beyaz, Kara siyah)
    yerlesim, yolKapali: false, yolCiz: false,     // patikaları mekân çiziyor (iki yaka)
    /* Çözülen her durak, o durağın yanına bir çiçek demeti bırakır:
       iki yaka sınıf ilerledikçe çiçekleniyor. */
    izNotu: { bos: 'Yamaçlar henüz çiçeksiz', dolu: '{n} çiçek demeti · köprü genişliyor' },
    iz: 'cicek-demeti', izRenk: 0xf2c14a, kesifRenk: 0x7fa77a,
    kesif: [
      { x: 1.9, z: -6.9, ikon: 'su', ad: 'Çağıl Dere',
        metin: 'Dere dağın tepesindeki kardan doğar. Taşların üstünden atlarken çıkardığı sesten ötürü ona Çağıl Dere derler. Yazın bile suyu buz gibidir.' },
      { x: -12.7, z: -9.6, ikon: 'tas', ad: 'Ak’ın kayalığı',
        metin: 'Ak her sabah bu kayalara basamak basamak tırmanır. Tepeden bakınca bütün geçit görünür: dere, köprü, karşı yamaç ve orada otlayan Kara.' },
      { x: -3.5, z: 3.9, ikon: 'keci-baraj', ad: 'Kunduz yuvası',
        metin: 'Usta’nın evi göletin içinde, dallardan örülmüş bir tepecik. Kapısı suyun altındadır; Usta dalıp öyle girer. İçi kupkuru ve sıcacıktır.' },
      { x: 6.4, z: 8.2, ikon: 'kutu', ad: 'Eski taş duvar',
        metin: 'Bu duvarı çok eskiden çobanlar örmüş. Taşların arasında kertenkeleler güneşlenir. Keçiler duvarın üstünde yürümeyi, en ucundan aşağı zıplamayı çok sever.' },
      { x: -9.7, z: 2.3, ikon: 'keci-cicek', ad: 'Papatya yamacı',
        metin: 'Batı yakası güneşi erken alır; papatyalar burada herkesten önce açar. Kara karşı yamaçtan bakıp hep “Oradaki çiçekler ne güzel,” der.' }
    ]},

  acilis: [
    { tag: 'BİR VARMIŞ, BİR YOKMUŞ', baslik: 'Dağın ortasında bir dere.', ikon: 'su',
      metin: 'Yüksek bir dağ geçidinde, iki yamacın arasından Çağıl Dere akarmış. Derenin batısında Ak adında beyaz bir keçi, doğusunda Kara adında siyah bir keçi yaşarmış. İkisi de tırmanmayı, zıplamayı ve taze otu çok severmiş.' },
    { tag: 'DAR BİR KÖPRÜ', baslik: 'Tek kişilik bir kütük.', ikon: 'keci-kopru',
      metin: 'Dereyi geçmenin tek yolu, kunduz Usta’nın yaptığı kütük köprüymüş. Köprü öyle darmış ki üstünden bir seferde yalnızca bir keçi geçebilirmiş. Bir sabah Ak karşıdaki yoncaları, Kara da karşıdaki papatyaları çok canı çekmiş…' },
    { tag: 'BU MASALIN KAHRAMANI SİZSİNİZ', baslik: 'Bir Ak’ın, bir Kara’nın sırası.', ikon: 'kalp',
      metin: 'Bugün sırayla tahtaya geleceğiz. Bir sıra Ak’a, bir sıra Kara’ya yardım edeceğiz. Sıra beklemek bazen zordur. Bakalım köprünün ortasında ne öğreneceğiz?' }
  ],

  bolumler: [
    /* ═══ 1 · SABAH — iki yakada ═══ */
    {
      kod: 'sabah', ad: 'Sabah', baslik: 'İki yakada sabah', asamaSonu: 'İkisi de köprünün ucunda',
      renk: '#8DB86B', acik: '#E4F1D2', gok: '#EEF6E4', zemin: '#B9D58E',
      hikaye: 'Güneş geçide doğdu. Batı yakasında Ak, doğu yakasında Kara uyandı. Ak karşıdaki yoncaları, Kara karşıdaki papatyaları düşlüyor. İkisinin aklında aynı şey var: “Hemen köprüye gideyim!”',
      soz: '“Karşı yakanın otu hep daha yeşil görünür.”',
      karakter: { kod: 'keci-ak', ad: 'Ak', tur: 'Beyaz keçi' },
      sozler: [ 'Ben Ak! Karşıdaki yoncalar beni çağırıyor.', 'Siz yardım edince yol kısalıyor!', 'Hazırım! Köprüye ilk ben varacağım… herhalde.' ],
      armagan: { kod: 'keci-cicek', ad: 'Papatya', renk: '#F2C14A' },
      engeller: [
        { yaka: 'ak', engel: 'Ak’ın yamacında dikenli çalılar var.',
          sahne: { tip: 'gelis', nesne: 'kozalak', adet: 4, kisi: 'keci-ak', dekor: ['keci-cicek', 'tas', 'ot'],
            metin: 'Ak sabah otlağından dereye inmek istiyor. Ama yamaçta dikenli çalılar büyümüş; tüylerine takılırsa bütün gün ayıklar.', soz: 'Dikenlere değmeden inebilir miyim?' }, gorev: 'yol',
          yonerge: 'Dikenlere değmeden Ak’ı dere kıyısına götürelim.',
          baslangic: { x: 105, y: 220, sekil: 'keci-ak', ad: 'Ak' },
          bitis: { x: 900, y: 220, sekil: 'su', ad: 'Dere kıyısı' },
          engeller: [ { x: 400, y: 130, r: 88, sekil: 'kozalak', ad: 'Diken' },
                      { x: 620, y: 320, r: 88, sekil: 'kozalak', ad: 'Diken' } ],
          cozum: 'Ak dikenlere hiç değmeden dere kıyısına indi.' },
        { yaka: 'kara', engel: 'Rüzgâr Kara’nın yoncalarını savuruyor.',
          sahne: { tip: 'sorun', nesne: 'keci-yonca', adet: 6, kisi: 'keci-kara', dekor: ['keci-yonca', 'ot', 'agac'],
            metin: 'Kara yol için bir demet yonca toplamıştı. Tam o sırada geçitten serin bir rüzgâr esti; yoncalar havalanıp dört yana dağıldı.', soz: 'Yoncalarım uçuyor!' }, gorev: 'yakala',
          yonerge: 'Yoncalar yukarıdan düşüyor. Parmağını aşağıda gezdir, sepeti kaydır ve yakala.',
          hedef: 8, hiz: .18, sikayet: 1150, iyi: [ 'keci-yonca', 'ot' ], kotu: [],
          cozum: 'Yoncaların hepsi sepette; rüzgâra bir yaprak bile kaptırmadık.' },
        { yaka: 'ak', engel: 'Sisin içinde Ak’ın dostları saklanmış.',
          sahne: { tip: 'kesif', nesne: 'bulut', adet: 4, kisi: 'keci-ak', dekor: ['keci-cicek', 'ot', 'tas'],
            metin: 'Sabah sisi yavaş yavaş dağılıyor. Ak, yola çıkmadan önce yamaçtaki dostlarına günaydın demek istiyor. Ama hepsi otların arasına saklanmış.', soz: 'Neredesiniz? Günaydın!' }, gorev: 'gizli',
          yonerge: 'Otların arasına iyi bakalım — saklanan dostları bulalım.',
          tohum: 47, sus: 26, susBoy: [4, 8], boy: 12,
          gizli: [ { sekil: 'tavsan', ad: 'Tavşan', x: 22, y: 60, a: -8 },
                   { sekil: 'sincap', ad: 'Sincap', x: 74, y: 32, a: 9 },
                   { sekil: 'kus', ad: 'Kuş', x: 48, y: 76, a: 12 } ],
          cozum: 'Üç dost da bulundu. Hepsi Ak’a “İyi yolculuklar!” dedi.' },
        { yaka: 'kara', engel: 'Kara’nın heybesinden bir şey eksiliyor.',
          sahne: { tip: 'kesif', nesne: 'keci-can', adet: 3, kisi: 'keci-kara', dekor: ['keci-yonca', 'tas', 'ot'],
            metin: 'Kara yola çıkmadan heybesini bir taşın üstüne boşalttı: çanı, yoncası, suyu, elması, kozalağı. Saydı, bir daha saydı; biri kayıp gibi.', soz: 'Bir şey eksik ama ne?' }, gorev: 'kayip',
          yonerge: 'Heybeye iyi bakalım. Gözümüzü kapayıp açınca ne eksildi, bulalım.',
          tur: 2,
          ogeler: [ { ad: 'Çan', sekil: 'keci-can' }, { ad: 'Yonca', sekil: 'keci-yonca' },
                    { ad: 'Su', sekil: 'su' }, { ad: 'Elma', sekil: 'elma' },
                    { ad: 'Kozalak', sekil: 'kozalak' } ],
          cozum: 'Eksilen bulundu; heybe yeniden tamam.' },
        { yaka: 'ak', engel: 'Dereye inen taş basamaklar karışmış.',
          sahne: { tip: 'sorun', nesne: 'kaya2', adet: 4, kisi: 'keci-ak', dekor: ['tas', 'su', 'ot'],
            metin: 'Gece yağan yağmur dereye inen taş basamakları yerinden oynatmış. Ak tırmanmayı çok sever ama basamaklar sırasız olunca ayağı nereye basacağını şaşırıyor.', soz: 'Küçükten büyüğe dizelim mi?' }, gorev: 'sirala',
          yonerge: 'Basamakları küçükten büyüğe dizelim ki Ak rahat insin.',
          ogeler: [ { ad: 'En küçük', sekil: 'kaya1' }, { ad: 'Küçük', sekil: 'kaya2' },
                    { ad: 'Büyük', sekil: 'kaya3' }, { ad: 'En büyük', sekil: 'kaya4' } ],
          cozum: 'Basamaklar dizildi. Ak tıp tıp inip köprü başına vardı.' },
        { yaka: 'kara', engel: 'Kara’nın yamacında sabah sesleri karışmış.',
          sahne: { tip: 'gelis', nesne: 'kus', adet: 3, kisi: 'keci-kara', dekor: ['agac', 'ot', 'keci-yonca'],
            metin: 'Kara yamaçtan inerken çevresinden sesler geliyor: yayladaki inek, çalıdaki tavşan, daldaki kuş. Hepsi ona bir şey söylüyor ama sesler birbirine karıştı.', soz: 'Kim ne dedi, bir daha söyler misiniz?' }, gorev: 'dizi',
          yonerge: 'Sesler sırayla geliyor. Dinleyip aynı sırayla dokunalım.',
          dostlar: [ { sekil: 'inek', ad: 'Yayla ineği' }, { sekil: 'tavsan', ad: 'Tavşan' }, { sekil: 'kus', ad: 'Kuş' } ],
          uzunluklar: [ 2, 3, 4 ],
          cozum: 'Sesler ayrıldı. Hepsi aynı şeyi söylüyormuş: “Köprüde dikkatli ol!”' }
      ],
      final: { engel: 'Ak köprünün ucunda Kara’yı görünce huysuzlandı.',
               sahne: { tip: 'istek', nesne: 'kalp', adet: 3, kisi: 'keci-ak', dekor: ['keci-kopru', 'su', 'tas'],
               metin: 'Ak köprünün batı ucuna vardığında karşı uçta Kara’yı gördü. Kulakları dikildi, burnundan “Hıh!” diye bir ses çıktı. Kalbi pıt pıt atıyor.', soz: 'Ben önce geldim… değil mi?' }, etkinlik: 'sev',
               cozum: 'Ak biraz sakinleşti ama gözü hâlâ köprüde. “Yine de önce ben geçeceğim,” diye mırıldandı.' }
    },

    /* ═══ 2 · KÖPRÜ BAŞI — iki uçtan adım adım ═══ */
    {
      kod: 'koprubasi', ad: 'Köprü başı', baslik: 'Adım adım köprüye', asamaSonu: 'İkisi de köprüye çıktı',
      renk: '#C99A5B', acik: '#F3E4CB', gok: '#F7EFE0', zemin: '#D8BE8E',
      hikaye: 'Ak batı ucunda, Kara doğu ucunda. İkisi de köprüye bir adım atıyor, sonra bir adım daha. Kütük gıcırdıyor. Aşağıdaki baraj başından kunduz Usta sesleniyor: “Yavaş olun! Köprü tek kişilik!”',
      soz: '“Acele eden, köprünün ortasında kalır.”',
      karakter: { kod: 'keci-kara', ad: 'Kara', tur: 'Siyah keçi' },
      sozler: [ 'Ben Kara. Papatyalar karşıda, ben buradayım!', 'Adım adım… iyi gidiyoruz.', 'Köprünün ortasına az kaldı!' ],
      armagan: { kod: 'keci-yonca', ad: 'Yonca', renk: '#6FA85A' },
      engeller: [
        { yaka: 'ak', engel: 'Ak kütüğün üstünde dengede kalmalı.',
          sahne: { tip: 'gelis', nesne: 'keci-kutuk', adet: 3, kisi: 'serce-cikcik', dekor: ['keci-kopru', 'su', 'tas'],
            metin: 'Ak kütüğe ilk adımını attı. Serçe Cıkcık hemen önüne kondu: “Beni izle, kütüğün en sağlam yerinden uçacağım!”', soz: 'Cik! Gözün bende olsun!' }, gorev: 'takip',
          yonerge: 'Cıkcık kütüğün sağlam yerlerini gösteriyor. Parmağını üstüne koy ve onu gözden kaçırma.',
          sekil: 'serce-cikcik', sure: 5400, hiz: .8, boy: 13,
          cozum: 'Ak, Cıkcık’ı izleyerek dengesini hiç kaybetmedi.' },
        { yaka: 'kara', engel: 'Dere kenarında yalnızca yonca yenir.',
          sahne: { tip: 'kesif', nesne: 'keci-yonca', adet: 5, kisi: 'keci-kara', dekor: ['su', 'ot', 'keci-yonca'],
            metin: 'Kara köprüye çıkmadan karnını biraz doyurmak istiyor. Dere kenarında yoncalar var ama aralarında dikenler, taşlar, kuru yapraklar da var.', soz: 'Ben yalnızca yonca yerim!' }, gorev: 'refleks',
          yonerge: 'Otlar hızlı hızlı görünüyor. Yalnızca yoncaya dokun; başkası gelirse elini çek.',
          hedef: 8, gorunme: 1050, ara: 320,
          aranan: { sekil: 'keci-yonca', ad: 'Yonca' },
          digerleri: [ { sekil: 'kozalak', ad: 'Diken' }, { sekil: 'tas', ad: 'Taş' }, { sekil: 'yaprak', ad: 'Kuru yaprak' } ],
          cozum: 'Kara yalnızca yonca yedi; dikenlere hiç dokunmadı.' },
        { yaka: 'ak', engel: 'Köprünün tahtaları bir düzene göre dizilmiş.',
          sahne: { tip: 'kesif', nesne: 'keci-tahta', adet: 4, kisi: 'keci-ak', dekor: ['keci-kopru', 'tas', 'ot'],
            metin: 'Köprünün batı ucunda Usta’nın döşediği tahtalar var: bir tahta, bir kütük, bir tahta, bir kütük… Ama arada iki boşluk kalmış.', soz: 'Buraya hangisi gelecek?' }, gorev: 'oruntu',
          yonerge: 'Sıraya bak: tahta, kütük, tahta, kütük… Boşluğa hangisi geliyor?',
          dizi: [ 'keci-tahta', 'keci-kutuk', 'keci-tahta', 'keci-kutuk', null, null, 'keci-tahta' ],
          cevaplar: [ 'keci-tahta', 'keci-kutuk' ],
          secenekler: [ { sekil: 'keci-tahta', ad: 'Tahta' }, { sekil: 'keci-kutuk', ad: 'Kütük' }, { sekil: 'tas', ad: 'Taş' } ],
          cozum: 'Boşluklar doldu; köprünün batı ucu sapasağlam.' },
        { yaka: 'kara', engel: 'Köprü başındaki tabela kırılmış.',
          sahne: { tip: 'sorun', nesne: 'keci-tahta', adet: 4, kisi: 'keci-kara', dekor: ['keci-kopru', 'agac', 'ot'],
            metin: 'Usta köprünün başına bir tabela dikmişti. Gece esen rüzgâr tabelayı devirmiş, parçaları çimenlere saçılmış. Üstünde bir resim var ama ne olduğu anlaşılmıyor.', soz: 'Burada ne yazıyordu acaba?' }, gorev: 'yapboz',
          yonerge: 'Parçaları yerine koyup tabelanın resmini tamamlayalım.',
          resim: 'keci-kopru', satir: 2, sutun: 3,
          cozum: 'Tabela tamam: kütük köprünün resmi. Altında “Tek kişiliktir” yazıyor.' },
        { yaka: 'ak', engel: 'Köprü başındaki taşlar birbirine çok benziyor.',
          sahne: { tip: 'kesif', nesne: 'tas', adet: 5, kisi: 'keci-ak', dekor: ['tas', 'su', 'keci-cicek'],
            metin: 'Köprünün başında yassı taşlar dizili. Usta her taşın altına bir işaret saklamış; hangi taşın altında ne olduğunu hatırlayan, güvenle basar.', soz: 'Aklımda tutabilir miyim?' }, gorev: 'cift',
          yonerge: 'Taşlar kapalı duruyor. İki taş çevir, aynıysa açık kalır — yerlerini aklında tut.',
          cift: [ 'keci-cicek', 'keci-yonca', 'keci-can', 'su', 'kozalak', 'keci-kutuk' ],
          cozum: 'Bütün eşler bulundu. Ak köprüye iki adım daha attı.' },
        { yaka: 'kara', engel: 'Kara yoncalarını dere kıyısındakilerle paylaşıyor.',
          sahne: { tip: 'istek', nesne: 'keci-yonca', adet: 6, kisi: 'keci-kara', dekor: ['su', 'ot', 'agac'],
            metin: 'Köprü başında üç küçük dost Kara’nın sepetine bakıyor. Kara biraz düşündü: “Yolum uzun ama paylaşırsam sepetim hafifler.”', soz: 'Herkese eşit düşsün.' }, gorev: 'paylas',
          yonerge: 'Üç dosta eşit yonca düşsün; kimse eksik kalmasın.',
          dostlar: [ { sekil: 'tavsan', ad: 'Tavşan' }, { sekil: 'sincap', ad: 'Sincap' }, { sekil: 'serce-cikcik', ad: 'Cıkcık' } ],
          yem: 'keci-yonca', yemAd: 'Yonca', adet: 9,
          cozum: 'Üç dost da eşit pay aldı. Kara’nın sepeti hafifledi, içi ısındı.' }
      ],
      final: { engel: 'Kara bütün sabah yürüdü, karnı guruldadı.',
               sahne: { tip: 'istek', nesne: 'ot', adet: 4, kisi: 'keci-kara', dekor: ['keci-kopru', 'ot', 'su'],
               metin: 'Kara köprünün doğu ucuna vardı. Yoncalarını paylaştı, kendine pek bir şey kalmadı. Karnından “gur gur” diye bir ses geldi.', soz: 'Biraz taze ot bulabilir miyiz?' }, etkinlik: 'besle',
               cozum: 'Kara karnını doyurdu ve köprüye çıktı. Tam o anda Ak da karşıdan köprüye çıktı…' }
    },

    /* ═══ 3 · KÖPRÜNÜN ORTASI — burun buruna, sonra pazarlık ═══ */
    {
      kod: 'orta', ad: 'Köprünün ortası', baslik: 'Burun buruna', asamaSonu: 'Ak çöktü, Kara atladı!',
      renk: '#6FA3B8', acik: '#D9ECF2', gok: '#E8F4F7', zemin: '#9CC4C9',
      hikaye: 'Ak ile Kara köprünün tam ortasında burun buruna geldi. “Önce ben!” dedi Ak. “Hayır, önce ben!” dedi Kara. İkisi de geri adım atmadı; kütük sallanmaya başladı. Serçe Cıkcık telaşla aralarına kondu.',
      soz: '“İnatlaşınca köprü sallanır; konuşunca durur.”',
      karakter: { kod: 'serce-cikcik', ad: 'Cıkcık', tur: 'Serçe' },
      sozler: [ 'Cik cik! Durun, durun! Birlikte düşünelim.', 'Bakın, köprü sakinleşiyor.', 'Bir yolu var: sıra vermek!' ],
      armagan: { kod: 'keci-can', ad: 'Barış çanı', renk: '#E8B84A' },
      engeller: [
        { yaka: 'ak', engel: 'İnatlaşınca köprü bir yana yattı.',
          sahne: { tip: 'sorun', nesne: 'tas', adet: 4, kisi: 'serce-cikcik', dekor: ['keci-kopru', 'su', 'tas'],
            metin: 'Ak ile Kara “Önce ben!” diye aynı anda bir adım daha atınca kütük bir yana yattı. Cıkcık hemen bir fikir buldu: “Öbür uca taş koyalım, köprü dengelensin!”', soz: 'Sakin olun, önce denge!' }, gorev: 'terazi',
          yonerge: 'Sağ kefeye taş ekleyip dengeleyelim. Fazla gelirse geri alırız.',
          sol: [ { sekil: 'tas', agirlik: 2 }, { sekil: 'tas', agirlik: 3 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 } ],
          cozum: 'Köprü dengelendi. Ak ile Kara bir an durup nefes aldı.' },
        { yaka: 'kara', engel: 'Akşam oluyor; Cıkcık yıldızları gösteriyor.',
          sahne: { tip: 'kesif', nesne: 'yildiz', adet: 5, kisi: 'serce-cikcik', dekor: ['bulut', 'keci-kopru', 'tas'],
            metin: 'Gökyüzünde ilk yıldızlar çıktı. Cıkcık kanadıyla yukarıyı gösterdi: “Kavgayı bir dakika bırakın. Bakın, hangi yıldızlar parlıyor?” Kara istemeye istemeye başını kaldırdı.', soz: 'Hangi yıldızlar parladı, hatırla!' }, gorev: 'takimyildiz',
          yonerge: 'Yıldızlar tek tek parlıyor. Hangileri parladıysa aynılarına dokun.',
          nokta: 12, yanan: 4, tur: 2, bakma: 2400,
          cozum: 'Kara yıldızlara bakarken sinirinin geçtiğini fark etti.' },
        { yaka: 'ak', engel: 'Cıkcık bilmece soruyor.',
          sahne: { tip: 'istek', nesne: 'yildiz', adet: 3, kisi: 'serce-cikcik', dekor: ['keci-kopru', 'su', 'bulut'],
            metin: 'Cıkcık, Ak’ın boynuzunun üstüne kondu. “Sana üç bilmece soracağım,” dedi. “Bilirsen köprüde ne yapacağımızı da birlikte buluruz.”', soz: 'Hangisi ötekilere benzemiyor?' }, gorev: 'fark',
          yonerge: 'Her bilmecede bir tanesi ötekilere benzemiyor. Onu birlikte bulalım.',
          turlar: [
            { soru: 'Hangisi suda yaşar?', digerleri: [ { ad: 'Keçi', sekil: 'keci-ak' }, { ad: 'Sincap', sekil: 'sincap' }, { ad: 'Tavşan', sekil: 'tavsan' } ],
              yabanci: { ad: 'Balık', sekil: 'balik' }, neden: 'Balık derede yaşar; ötekiler karada.' },
            { soru: 'Hangisi uçabilir?', digerleri: [ { ad: 'Kara', sekil: 'keci-kara' }, { ad: 'Kaplumbağa', sekil: 'kaplumbaga' }, { ad: 'Usta', sekil: 'kunduz-usta' } ],
              yabanci: { ad: 'Cıkcık', sekil: 'serce-cikcik' }, neden: 'Cıkcık bir serçedir; kanatlarıyla uçar.' },
            { soru: 'Hangisi yenmez?', digerleri: [ { ad: 'Ot', sekil: 'ot' }, { ad: 'Yonca', sekil: 'keci-yonca' }, { ad: 'Yaprak', sekil: 'yaprak' } ],
              yabanci: { ad: 'Taş', sekil: 'tas' }, neden: 'Taş yenmez; keçiler otu, yoncayı, yaprağı sever.' }
          ],
          cozum: 'Ak üç bilmeceyi de bildi ve gülümsedi. Kavga biraz unutuldu.' },
        { yaka: 'kara', engel: 'Korkuluk için dal lazım.',
          sahne: { tip: 'gelis', nesne: 'dal2', adet: 5, kisi: 'kunduz-usta', dekor: ['keci-kopru', 'su', 'agac'],
            metin: 'Kunduz Usta barajdan koşup geldi. “Köprüye bir korkuluk yapalım,” dedi. “Ama rüzgâr dalları sallıyor; tam üstlerine dokunup yakalamak gerek.”', soz: 'Hangi dalı tutarsan onu bağlarım!' }, gorev: 'isabet',
          yonerge: 'Dallar rüzgârda sallanıyor. Gezinen dallara tam üstünden dokun.',
          sekil: 'dal2', hedef: 7, adet: 4, hiz: .7, boy: 12,
          cozum: 'Dallar toplandı; Usta köprüye ilk korkuluğu bağladı.' },
        { yaka: 'ak', engel: 'Cıkcık köprü başına barış tohumları ekiyor.',
          sahne: { tip: 'istek', nesne: 'tohum', adet: 4, kisi: 'serce-cikcik', dekor: ['keci-cicek', 'keci-yonca', 'ot'],
            metin: 'Cıkcık’ın aklına güzel bir şey geldi: “Köprünün iki başına da çiçek ekelim. Papatya da yonca da her iki yakada bitsin; kimse karşıya bakıp içini çekmesin.”', soz: 'Tohumu tam toprağa bırakayım!' }, gorev: 'zaman',
          yonerge: 'Cıkcık tohumu taşıyor. Tam toprağın üstündeyken bırakalım — acelemiz yok.',
          tasiyici: 'serce-cikcik', tasiyiciAd: 'Cıkcık', yuk: 'tohum',
          hedef: 'toprak', hedefAd: 'Köprü başı', genislik: 30, hiz: 1.1, hedefSayisi: 3,
          cozum: 'Tohumlar toprakta. Yakında iki yaka da çiçek açacak.' },
        { yaka: 'kara', engel: 'Herkesin bir yeri var.',
          sahne: { tip: 'kesif', nesne: 'yuva', adet: 3, kisi: 'serce-cikcik', dekor: ['keci-baraj', 'su', 'tas'],
            metin: 'Cıkcık Kara’ya sordu: “Benim evim yuva, Usta’nınki baraj. Seninki kayalık. Peki köprü kimin?” Kara düşündü, düşündü…', soz: 'Köprü… herkesin mi?' }, gorev: 'eslestir',
          yonerge: 'Her dostu kendi eviyle eşleştirelim.',
          ciftler: [ { a: 'Keçi', asekil: 'keci-kara', b: 'Kayalık', bsekil: 'tas' },
                     { a: 'Kunduz', asekil: 'kunduz-usta', b: 'Baraj', bsekil: 'keci-baraj' },
                     { a: 'Serçe', asekil: 'serce-cikcik', b: 'Yuva', bsekil: 'yuva' },
                     { a: 'Balık', asekil: 'balik', b: 'Dere', bsekil: 'su' } ],
          cozum: 'Herkes evini buldu. “Köprü hepimizin,” dedi Kara yavaşça.' }
      ],
      final: { engel: 'Cıkcık o kadar çırpındı ki tüyleri diken diken oldu.',
               sahne: { tip: 'cozuldu', nesne: 'kalp', adet: 4, kisi: 'keci-ak', dekor: ['keci-kopru', 'su', 'keci-cicek'],
               metin: 'Sonunda Ak bir karar verdi: köprünün üstüne yavaşça çöktü. Kara da dikkatle, tıp tıp, onun üstünden atladı. Köprü sallanmayı bıraktı! Cıkcık sevinçten öyle çırpındı ki tüyleri karmakarışık oldu.', soz: 'Sen geç, ben beklerim.' }, etkinlik: 'timarla',
               cozum: 'Cıkcık tüylerini düzeltti. Kara karşı uçtan seslendi: “İnat ettiğim için özür dilerim. Teşekkürler Ak!” Ak gülümsedi: “Ben de özür dilerim. Artık dostuz.” İkisi de karşıya geçmişti.' }
    },

    /* ═══ 4 · BİRLİKTE — köprüyü genişletmek ═══ */
    {
      kod: 'birlikte', ad: 'Birlikte', baslik: 'Köprüyü genişletelim', asamaSonu: 'Köprü genişledi!',
      renk: '#B58A5A', acik: '#EEDFCB', gok: '#F5EDE2', zemin: '#CDB08A',
      hikaye: 'İkisi de karşıya geçti. Ama yarın sabah yine karşılaşırlarsa? Kunduz Usta gülümsedi: “Gelin, köprüyü birlikte genişletelim. Bu sefer ikiniz de çalışacaksınız — sırayla.”',
      soz: '“Tek başına dar olan köprü, birlikte genişler.”',
      karakter: { kod: 'kunduz-usta', ad: 'Usta', tur: 'Kunduz' },
      sozler: [ 'Ben Usta. Kütük bende, fikir sizde!', 'Tahtalar yan yana diziliyor…', 'Oldu! Artık iki keçi yan yana geçer.' ],
      armagan: { kod: 'keci-kopru', ad: 'Geniş köprü', renk: '#B58A5A' },
      engeller: [
        { yaka: 'ak', engel: 'Köprüyü genişletmek için kütük lazım.',
          sahne: { tip: 'gelis', nesne: 'keci-kutuk', adet: 5, kisi: 'kunduz-usta', dekor: ['keci-baraj', 'agac', 'su'],
            metin: 'Usta’nın barajının yanında kış için biriktirdiği kütükler var. Ak onları köprüye taşımaya gönüllü oldu.', soz: 'Beşini de getirebilir misin?' }, gorev: 'say',
          yonerge: 'Kütükleri birlikte taşıyalım — birer birer köprüye götürelim.',
          sayi: 5, sekil: 'keci-kutuk',
          cozum: 'Beş kütük köprünün başında. Usta ellerini ovuşturdu.' },
        { yaka: 'kara', engel: 'Dereden bir kütük akıp gidiyor.',
          sahne: { tip: 'sorun', nesne: 'keci-kutuk', adet: 3, kisi: 'keci-kara', dekor: ['su', 'keci-baraj', 'tas'],
            metin: 'Kütüklerden biri kıyıdan kayıp suya düştü. Akıntı onu barajdan yana sürüklüyor. Kara gözünü ondan ayırmazsa Usta onu barajda yakalayabilir.', soz: 'Gözümü ondan ayırmayacağım!' }, gorev: 'takip',
          yonerge: 'Kütük suda yüzüyor. Parmağını üstüne koy ve gözden kaçırmadan takip et.',
          sekil: 'keci-kutuk', sure: 5400, hiz: .8, boy: 14,
          cozum: 'Kütük barajda durdu; Usta onu kıyıya çekti.' },
        { yaka: 'ak', engel: 'Ak kütükleri çamura bulamadan getirmeli.',
          sahne: { tip: 'gelis', nesne: 'toprak', adet: 4, kisi: 'keci-ak', dekor: ['keci-kutuk', 'su', 'ot'],
            metin: 'Göletin kıyısı çamur içinde. Ak kütüğü sırtında taşıyor; çamura basarsa kayar, kütük de çamura bulanır.', soz: 'Nereden geçeyim?' }, gorev: 'yol',
          yonerge: 'Çamura değmeden Ak’ı köprüye götürelim.',
          baslangic: { x: 100, y: 220, sekil: 'keci-ak', ad: 'Ak' },
          bitis: { x: 905, y: 220, sekil: 'keci-kopru', ad: 'Köprü' },
          engeller: [ { x: 330, y: 120, r: 86, sekil: 'toprak', ad: 'Çamur' },
                      { x: 420, y: 330, r: 82, sekil: 'tas', ad: 'Kaygan taş' },
                      { x: 640, y: 160, r: 88, sekil: 'toprak', ad: 'Çamur' },
                      { x: 700, y: 360, r: 78, sekil: 'tas', ad: 'Kaygan taş' } ],
          cozum: 'Ak kütüğü tertemiz getirdi. Usta onu köprünün yanına yerleştirdi.' },
        { yaka: 'kara', engel: 'Cıkcık yeni köprünün kıyısına yonca ekiyor.',
          sahne: { tip: 'istek', nesne: 'tohum', adet: 4, kisi: 'serce-cikcik', dekor: ['keci-kopru', 'keci-yonca', 'ot'],
            metin: 'Köprü genişledikçe iki ucunda yeni toprak açıldı. Cıkcık gagasında yonca tohumlarıyla geldi: “Köprünün ayakları sağlam dursun; yoncanın kökü toprağı tutar.”', soz: 'Toprağın üstünde söyleyin!' }, gorev: 'zaman',
          yonerge: 'Cıkcık toprağın tam üstündeyken tohumu bırakalım — acelemiz yok.',
          tasiyici: 'serce-cikcik', tasiyiciAd: 'Cıkcık', yuk: 'tohum',
          hedef: 'toprak', hedefAd: 'Yeni kıyı', genislik: 28, hiz: 1.2, hedefSayisi: 3,
          cozum: 'Tohumlar yerinde. Köprünün iki ucu yeşerecek.' },
        { yaka: 'ak', engel: 'Yeni tahtalar iki yana eşit gelmeli.',
          sahne: { tip: 'istek', nesne: 'keci-tahta', adet: 4, kisi: 'kunduz-usta', dekor: ['keci-kopru', 'su', 'tas'],
            metin: 'Usta yeni tahtaları kütüğün iki yanına çakacak. Ama bir yan ağır gelirse köprü yine bir yana yatar. Önce tartmak gerek.', soz: 'İki yan da eşit olmalı.' }, gorev: 'terazi',
          yonerge: 'Sağ kefeye ekleyip iki yanı eşitleyelim.',
          sol: [ { sekil: 'keci-tahta', agirlik: 3 }, { sekil: 'keci-tahta', agirlik: 2 }, { sekil: 'keci-tahta', agirlik: 1 } ],
          havuz: [ { ad: 'Küçük', agirlik: 1 }, { ad: 'Küçük', agirlik: 1 }, { ad: 'Orta', agirlik: 2 },
                   { ad: 'Orta', agirlik: 2 }, { ad: 'Büyük', agirlik: 3 }, { ad: 'Büyük', agirlik: 3 } ],
          cozum: 'İki yan eşit. Köprü dimdik duruyor, hem de iki kat geniş.' },
        { yaka: 'kara', engel: 'Usta köprü başına yeni bir tabela yaptı.',
          sahne: { tip: 'cozuldu', nesne: 'keci-tahta', adet: 4, kisi: 'kunduz-usta', dekor: ['keci-kopru', 'keci-cicek', 'keci-yonca'],
            metin: 'Eski tabelada tek bir keçi vardı. Usta yeni tabelayı çizdi ama boyası kurusun diye parçalara ayırıp güneşe dizdi. Şimdi birleştirme zamanı.', soz: 'Bakalım bu sefer ne çizdim!' }, gorev: 'yapboz',
          yonerge: 'Parçaları yerine koyup yeni tabelanın resmini tamamlayalım.',
          resim: 'keci-yanyana', satir: 2, sutun: 3,
          cozum: 'Yeni tabela hazır: iki keçi, yan yana. Kara gülümsedi.' }
      ],
      final: { engel: 'Usta bütün gün çalıştı, karnı acıktı.',
               sahne: { tip: 'cozuldu', nesne: 'keci-tahta', adet: 5, kisi: 'kunduz-usta', dekor: ['keci-kopru', 'keci-baraj', 'keci-cicek'],
               metin: 'Son tahta da yerine oturdu. Köprü artık iki keçinin yan yana geçeceği kadar geniş, üstelik iki yanında korkuluk var. Usta barajına oturdu; dişleri bile yorulmuş.', soz: 'Biraz taze dal ve ot bulur musunuz?' }, etkinlik: 'besle',
               cozum: 'Usta karnını doyurdu. Ak ile Kara yeni köprünün ortasında yan yana durdu; bu kez kimse “önce ben” demedi.' }
    }
  ],

  kapanis: {
    baslik: 'Köprünün ortasında iki dost.',
    metin: 'Ertesi sabah Ak ile Kara yine köprüde karşılaştı. Ama bu sefer ikisi de durdu, gülümsedi ve aynı anda “Buyur, önce sen geç,” dedi. Sonra ikisi birden güldü; çünkü köprü artık ikisine de yetiyordu.\n\nO günden sonra geçitte güzel bir alışkanlık başladı: köprüye kim önce gelirse öbürüne yol verir. Cıkcık buna “sıra şarkısı” diyor ve her sabah köprünün korkuluğunda söylüyor.\n\nUsta’nın yeni tabelası hâlâ orada duruyor: iki keçi, yan yana.',
    ders: 'Sıra vermek de kazanmaktır.'
  }
};

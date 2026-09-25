// Çiftçi Fare — tür kataloğu ve sabit listeler (saf, bağımlılıksız ES modülü).
// Tarayıcıda ve Node'da (Netlify Function) aynı kod çalışır.
// Serbest metin yok: komut türü, hedef, sembol, renk ve hediye yalnız bu listelerden gelir.

const dondur = (x) => Object.freeze(x);

// ---------------------------------------------------------------- süreler
export const SEMA = 1;
export const UNITE_GUNLERI = dondur([5, 10, 20]); // 1, 2, 4 hafta (okul günü)
export const VARSAYILAN_UNITE = 10;
export const TARLA_UNITE_GUN = 5; // t1/t2 ekinleri: 1 haftada olgun (ekimde bitkiye yazılır)
export const SUSAMA_GUN = 3; // son sulamadan beri ≥3 aktif gün → susamış (yalnız görünüş)
export const OT_GUN = 2; // 2 aktif günde bir ot
export const OT_TAVAN = 3; // en çok 3 ot
export const YUMURTA_TAVAN = 3; // follukta en çok 3 yumurta bekler
export const GECMIS_GUN = 7; // çevrimdışı komutun günü [bugün−7, bugün] aralığına kırpılır
export const SIKISTIR_GUN = 120; // bundan eski gün kümeleri özete iner
export const ZIYARET_KAYIT = 50; // ziyaretler halka tamponu
export const ANI_TAVAN = 40; // anılar listesi üst sınırı
export const CIHAZ_TAVAN = 200; // cihazSeq'te tutulan en çok cihaz (en uzun süre kullanılmayan düşer)
export const ZIYARET_KOTA = dondur({ kisiSula: 1, ciftlikSula: 3, kisiHediye: 1 });
export const SINIR = dondur({ ciftlik: 64 * 1024, sinif: 32 * 1024, govde: 16 * 1024, komut: 20, ogrenci: 40 });

// ---------------------------------------------------------------- sabit listeler
export const TAKVIMLER = dondur(['okul-gunleri', 'her-gun']);
export const YAS_GRUPLARI = dondur(['3-4', '5-6']);
export const TOPRAKLAR = dondur(['sert', 'yumusak', 'aniz']);
export const PARSELLER = dondur(['konu', 't1', 't2']);
export const HEDEFLER = dondur(['konu', 't1', 't2', 'dede', 'kumes', 'pano']);
export const KOMUT_TURLERI = dondur([
  'capa', 'ek', 'sula', 'ot', 'destek', 'hasat',
  'yem', 'suluk', 'yumurta', 'gordu', 'ziyaretSula', 'hediye',
]);
// Hangi komut hangi hedefe gidebilir.
export const KOMUT_HEDEF = dondur({
  capa: dondur([...PARSELLER]),
  ek: dondur([...PARSELLER]),
  sula: dondur([...PARSELLER]),
  ot: dondur([...PARSELLER]),
  destek: dondur([...PARSELLER]),
  hasat: dondur([...PARSELLER, 'dede']),
  yem: dondur(['kumes']),
  suluk: dondur(['kumes']),
  yumurta: dondur(['kumes']),
  gordu: dondur([...PARSELLER, 'pano']),
  ziyaretSula: dondur([...PARSELLER]),
  hediye: dondur(['pano']),
});
export const ZIYARETCI_KOMUTLARI = dondur(['ziyaretSula', 'hediye']);
export const SAHIP_KOMUTLARI = dondur(KOMUT_TURLERI.filter((t) => !ZIYARETCI_KOMUTLARI.includes(t)));

// Ziyaretçi çıkartmaları (8 sabit, havuz sınırsız).
export const HEDIYELER = dondur(['kalp', 'yildiz', 'cicek', 'gunes', 'yaprak', 'kus', 'elma', 'bulut']);

// Çocuk sembolleri: çıkartma ve iş ikonlarından AYRI bir küme (kalp/yıldız/su/elma yok).
export const SEMBOLLER = dondur([
  'semsiye', 'ayakkabi', 'balik', 'baykus', 'kaplumbaga', 'sincap', 'tavsan', 'kalem',
  'firca', 'kutu', 'oyuncak', 'ahtapot', 'fok', 'kartal', 'yengec', 'fener',
  'kozalak', 'palamut', 'araba', 'top', 'gemi', 'ucurtma', 'tren', 'anahtar',
  'kupa', 'zil', 'davul', 'trompet', 'bardak', 'kasik', 'penguen', 'zurafa',
  'fil', 'aslan', 'zebra', 'kelebek', 'kirpi', 'ayi', 'kurbaga', 'bisiklet',
]);

// Şapka bandı renkleri (küçük harf #rrggbb).
export const RENKLER = dondur([
  '#d9714f', '#e0a930', '#6aa84f', '#3d85c6', '#8e7cc3', '#c27ba0',
  '#45a29e', '#b45f06', '#e06666', '#274e13', '#1c4587', '#7f6000',
]);

// ---------------------------------------------------------------- türler
// esik10: 10 aktif günlük ünitede her evrenin BAŞLADIĞI aktif gün (artan, ilki 0, sonu 10).
// Başka ünite süresinde ölçeklenir: esik = tavan(esik10 · unite / 10) → son evre tam unite. gününde.
// sabit: true → eşikler ölçeklenmez (Dede Ceviz gibi).
// suIstemez: bu evrede susamaz (sararmış buğday, olgun ağaç).
// destek: bu evreden itibaren destek çubuğu gerekir (büyümeyi DURDURMAZ, yalnız ihtiyaç listesinde görünür).
// hasat: 'yok' | 'tek' (hasatta bitki kalkar, toprak anıza döner) | 'yeniden' (bitki kalır, ürün yeniden olgunlaşır).
// yeniden: hasattan sonraki ürün döngüsü; esik = hasattan bu yana aktif gün, hazir = hasat edilebilir.
export const TURLER = dondur({
  ceviz: dondur({
    kod: 'ceviz',
    evreler: dondur(['tohum', 'cimlenme', 'filiz', 'fidan', 'genc-agac']),
    esik10: dondur([0, 2, 4, 7, 10]),
    destek: 3,
    hasat: 'yok', // çocuğun cevizi ünite boyunca meyve vermez
    suIstemez: dondur([]),
    konu: true,
  }),
  'dede-ceviz': dondur({
    kod: 'dede-ceviz',
    evreler: dondur(['olgun-agac']),
    esik10: dondur([0]),
    sabit: true,
    hasat: 'yeniden',
    ambar: 'ceviz',
    miktar: 1,
    suIstemez: dondur([0]),
    otYok: true, // tek evreli olgun ağaç: çiftlik kurulduğunda hasada hazırdır
    yeniden: dondur([
      dondur({ esik: 0, ad: 'puskul-cicek' }),
      dondur({ esik: 1, ad: 'yesil-kabuk' }),
      dondur({ esik: 3, ad: 'catlak-kabuk', hazir: true }),
    ]),
  }),
  bugday: dondur({
    kod: 'bugday',
    evreler: dondur(['serpme-ekim', 'cimlenme', 'yesil-sap', 'basak', 'sararma']),
    esik10: dondur([0, 2, 4, 7, 10]),
    hasat: 'tek',
    ambar: 'bugday',
    miktar: 1,
    suIstemez: dondur([4]),
    konu: true,
  }),
  domates: dondur({
    kod: 'domates',
    evreler: dondur(['fide', 'buyume', 'destek', 'cicek', 'yesil', 'kirmizi']),
    esik10: dondur([0, 2, 4, 6, 8, 10]),
    destek: 2,
    hasat: 'yeniden',
    ambar: 'domates',
    miktar: 1,
    suIstemez: dondur([]),
    konu: true,
    yeniden: dondur([
      dondur({ esik: 0, ad: 'cicek' }),
      dondur({ esik: 1, ad: 'yesil' }),
      dondur({ esik: 2, ad: 'kirmizi', hazir: true }),
    ]),
  }),
});
export const TUR_KODLARI = dondur(Object.keys(TURLER));
export const KONU_TURLERI = dondur(TUR_KODLARI.filter((k) => TURLER[k].konu));
// MVP tarla parselleri sabit ekinli (harita: t1 buğday, t2 domates).
export const TARLA_TURU = dondur({ t1: 'bugday', t2: 'domates' });
export const AMBAR_ANAHTARLARI = dondur(['ceviz', 'bugday', 'domates', 'yumurta']);

/**
 * Tür kaydı; yalnız katalogdaki KENDİ anahtarlar. 'constructor', 'toString', '__proto__' gibi
 * prototip adları tür sayılmaz (TURLER[x] bunlar için Object.prototype üyesini döndürürdü).
 */
export function turAl(kod) {
  return typeof kod === 'string' && Object.prototype.hasOwnProperty.call(TURLER, kod) ? TURLER[kod] : null;
}

/** Evre eşiklerini (başlangıç aktif günleri) ünite süresine göre verir. */
export function esikler(tur, uniteGun = VARSAYILAN_UNITE) {
  const t = typeof tur === 'string' ? turAl(tur) : tur;
  if (!t) throw new Error('bilinmeyen tur: ' + tur);
  if (t.sabit) return t.esik10.slice();
  const u = UNITE_GUNLERI.includes(uniteGun) ? uniteGun : VARSAYILAN_UNITE;
  return t.esik10.map((e) => Math.floor((e * u + 9) / 10)); // tam sayı tavanı
}

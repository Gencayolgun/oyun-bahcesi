/* Çiftçi Fare — işler (Aşama 1b). Plan: docs/ciftci-fare-plani.md,
   "Oyun döngüsü" → İŞ → MEKANİK EŞLEMESİ.

   Her çiftlik işi bir el-göz / hafıza mikro-oyunudur (sürükle-bırak değil):
     capa → refleks        ek → zaman           sula, suluk → doldur (yeni)
     ot → gizli            destek → zaman       bugdayHasat → yakala
     domatesHasat → refleks                     dedeHasat → silkele (3 dokunuş) + yakala
     yem → js/gorev.js 'besle'                  yumurta → gizli
   Parametreler iki yaş takımıyla gelir: Küçük (3-4) ve Büyük (5-6).
   Mekaniğin verisi HER ZAMAN {...mekanik.seviyeler[0], ...ayar}: böylece
   mekaniğin okuduğu bütün anahtarlar (yakala'da sikayet, refleks'te ara...)
   eksiksiz gelir, oyun takılmaz.

   Dışa açık:
     ISLER                     iş kataloğu {kod, ad, ikon, mekanik, aile, komut, hedefler, hayalet, yedek}
     isVerisi(kod, yas, baglam) → {mekanik, veri}  (saf; node testleri bunu sınar)
     komutIcin(is, hedef)      → {tur, hedef}      (ortak/turler.js komut türü; kimlik/gün kabuğun işi)
     isKodu(ihtiyac, {hedef, tur}) · isAdaylari(ihtiyaclar, {turler}) · isListesi(adaylar, {n})
     isAc(is, {yas, alan, bitince, ...}) → tutamak   (DOM: katman + mekanik yaşam döngüsü)
     islerHazirla()            DOM modüllerini ve stili önceden yükler (isteğe bağlı)
   Dünyayı DURAKLATMAK kabuğun işidir: isAc yalnız katmanı açar, mekaniği kurar,
   bitince katmanı kapatır ve bitince(sonuc) çağırır.

   Bu dosya node'da da içe aktarılır (tests/birim/isler.birim.mjs): tepede
   yalnız saf modüller var; gorev.js, masal/gorev.js ve ses.js (window
   isteyenler) isAc'in içinde dinamik olarak yüklenir. */

import zaman from '../oyunlar/zaman.js';
import refleks from '../oyunlar/refleks.js';
import yakala from '../oyunlar/yakala.js';
import gizli from '../oyunlar/gizli.js';
import doldur from './isler/doldur.js';
import silkele from './isler/silkele.js';
import {hayaletGoster} from './hayalet.js';
import {ciftlikIkonlariniKaydet} from './ikonlar.js';
import {ikon} from '../ikon.js';
import {KOMUT_HEDEF, TARLA_TURU} from './ortak/turler.js';

/* ---------------------------------------------------------------- mekanikler */

export const MEKANIKLER = Object.freeze({ zaman, refleks, yakala, gizli, doldur, silkele });

/* 'besle' js/gorev.js'in yerleşik türüdür (mekanik nesnesi yok). Taban verisi: */
const BESLE_TEMEL = Object.freeze({
  gorev: 'besle', ad: 'Besle', baslik: 'Tavuklar acıkmış.', yonerge: 'Bir avuç yem seç, sonra tavuğa dokun.',
  cozum: 'Tavuklar doydu; kümes şenlendi.'
});

/* Mekaniğin OKUDUĞU anahtarlar (node testi her işin birleşik verisinde arar). */
export const MEKANIK_ANAHTARLARI = Object.freeze({
  yakala: Object.freeze(['hedef', 'hiz', 'sikayet', 'iyi', 'kotu']),
  refleks: Object.freeze(['hedef', 'gorunme', 'ara', 'aranan', 'digerleri']),
  zaman: Object.freeze(['genislik', 'hiz', 'hedefSayisi']),
  gizli: Object.freeze(['tohum', 'sus', 'susBoy', 'boy', 'gizli']),
  doldur: Object.freeze(['bant', 'tekrar', 'hiz', 'kap', 'hedef']),
  silkele: Object.freeze(['dokunus', 'hedef', 'hiz', 'sikayet', 'iyi', 'kotu']),
  besle: Object.freeze(['gorev', 'yem', 'hayvan', 'cozum'])
});

/* "Art arda aynı mekanik yok" kuralı AİLEYE bakar: silkele sonunda yakala oynatır. */
export const MEKANIK_AILESI = Object.freeze({
  zaman: 'zaman', refleks: 'refleks', yakala: 'yakala', gizli: 'gizli', doldur: 'doldur', silkele: 'yakala', besle: 'besle'
});

/* Öğretmen için kısa yönerge (çocuğa yazı gösterilmez). */
const YONERGE = Object.freeze({
  refleks: 'Aranan gelince dokun; ötekine dokunma.',
  zaman: 'Taşıyıcı hedefin üstüne gelince büyük düğmeye bas.',
  doldur: 'Basılı tut; su sarı şeride gelince bırak.',
  gizli: 'Saklananları bul, dokun.',
  yakala: 'Sepeti kaydır, düşenleri tut.',
  silkele: 'Gövdeye üç kez dokun, sonra düşen cevizleri sepetle tut.',
  besle: 'Bir avuç yem seç, sonra tavuğa dokun.'
});

/* Hayalet elin hareketi ve hedefi (katmandaki seçici). */
const HAYALET = Object.freeze({
  refleks: { tip: 'dokun', hedef: '.refleks-nesne' },
  zaman: { tip: 'bekle-bas', hedef: '.zaman-dugme' },
  yakala: { tip: 'kaydir', hedef: '.yakala-sepet' },
  gizli: { tip: 'tara', hedef: '.gizli-sahne' },
  doldur: { tip: 'basili', hedef: '.doldur-dugme' },
  silkele: { tip: 'dokun', hedef: '.silkele-agac' },
  besle: { tip: 'sec-dokun', hedef: '.bakim-araclari .nesne-karti', hedef2: '.bakim-hayvani' }
});
/* Katman açılınca odağın gideceği ana denetim: yalnız tek düğmeli ve klavyeyle
   basılı tutulan oyunlarda (Boşluk hemen çalışsın). Ötekilerde odak katmanda. */
const ODAK = Object.freeze({ zaman: '.zaman-dugme', doldur: '.doldur-dugme' });

/* ---------------------------------------------------------------- yaş takımı */

/** '3-4' | 'kucuk' → 'kucuk'; '5-6' | 'buyuk' → 'buyuk'. Bilinmeyen → 'kucuk'. */
export function takimAl(yas) {
  const y = String(yas ?? '').toLowerCase();
  return y === '5-6' || y === 'buyuk' || y === 'büyük' ? 'buyuk' : 'kucuk';
}

/* ---------------------------------------------------------------- katalog */

const nesne = (sekil, ad) => ({ sekil, ad });
const KESEK = nesne('ciftlik-kesek', 'Kesek');
const TAS = nesne('tas', 'Taş');
const FILIZ = nesne('ciftlik-filiz', 'Filiz');
const OLGUN = nesne('ciftlik-domates', 'Olgun domates');
const HAM = nesne('ciftlik-domates-ham', 'Ham domates');
const OT = nesne('ot', 'Ot');
const BASAK = nesne('basak', 'Başak');
const YUMURTA = nesne('ciftlik-yumurta', 'Yumurta');
const SAMAN = nesne('saman', 'Saman');

/* Gizli nesnelerin sabit yerleri (aynı sahne her açılışta aynı: öğretmen
   ikinci kez açınca çocuklar hatırlayabilir). Adları yerden gelir ve
   benzersizdir: gizli.js rozetleri ada göre işaretler. */
const gizliler = (sekil, ad, yerler) => yerler.map(([yer, x, y, a]) => ({ sekil, ad: `${yer} ${ad}`, x, y, a }));
const OT_YERLERI = {
  kucuk: [['Soldaki', 22, 64, -8], ['Sağdaki', 74, 34, 10], ['Alttaki', 50, 80, 6]],
  buyuk: [['Soldaki', 15, 36, -12], ['Sağdaki', 84, 26, 9], ['Alttaki', 40, 82, 14], ['Ortadaki', 63, 58, -10]]
};
const YUMURTA_YERLERI = {
  kucuk: [['Soldaki', 26, 60, -10], ['Sağdaki', 72, 40, 12], ['Alttaki', 52, 80, -4]],
  buyuk: [['Soldaki', 17, 30, -14], ['Sağdaki', 82, 68, 16], ['Ortadaki', 46, 50, -8]]
};

/* Konu tohumuna göre görünüş: ekilen şey, desteklenen fidan, sulanan bitki. */
const EKILEN = { ceviz: 'ciftlik-ceviz', bugday: 'ciftlik-tane', domates: 'ciftlik-fide' };
const EKILEN_AD = { ceviz: 'Ceviz', bugday: 'Buğday tanesi', domates: 'Domates fidesi' };
const DESTEKLENEN = { ceviz: 'fidan', domates: 'ciftlik-fide' };
const SULANAN = { ceviz: 'ciftlik-filiz', bugday: 'ciftlik-filiz', domates: 'ciftlik-fide' };
const turBul = baglam => baglam.tur || (baglam.hedef && TARLA_TURU[baglam.hedef]) || null;

/* Her iş: ortak ayar + kucuk/buyuk ayarı + (isteğe bağlı) bağlama göre ayar.
   yedek: aynı mekanikli iki iş art arda gelecekse ikincisi yedek mekaniğiyle oynar. */
const TANIM = {
  capa: {
    ad: 'Toprağı çapala', ikon: 'ciftlik-capa', komut: 'capa', hedefler: ['konu', 't1', 't2'],
    mekanik: 'refleks',
    ortak: { aranan: KESEK, cozum: 'Kesekler ufalandı; toprak yumuşadı.' },
    kucuk: { hedef: 4, gorunme: 1800, ara: 500, digerleri: [TAS] },
    buyuk: { hedef: 6, gorunme: 1200, ara: 350, digerleri: [TAS, FILIZ] },    // filizi çapalama
    yedek: {
      mekanik: 'gizli',
      ortak: { susler: ['tas', 'ot', 'yaprak'], ipucu: 'Sert kesekleri bul, dokun; toprak yumuşasın.', cozum: 'Bütün kesekler ufalandı.' },
      kucuk: { tohum: 13, sus: 14, susBoy: [7, 11], boy: 15, gizli: gizliler('ciftlik-kesek', 'kesek', OT_YERLERI.kucuk) },
      buyuk: { tohum: 31, sus: 24, susBoy: [5, 9], boy: 12, gizli: gizliler('ciftlik-kesek', 'kesek', OT_YERLERI.buyuk) }
    }
  },
  ek: {
    ad: 'Tohum ek', ikon: 'ciftlik-kese', komut: 'ek', hedefler: ['konu', 't1', 't2'],
    mekanik: 'zaman',
    ortak: { tasiyici: 'ciftlik-kese', tasiyiciAd: 'Tohum kesesi', dusen: 'ciftlik-tane', bolgeIkon: 'toprak', hedefAd: 'Yumuşak toprak',
      cozum: 'Tohumlar yumuşak toprağa düştü.' },
    kucuk: { genislik: 40, hiz: .8, hedefSayisi: 2 },
    buyuk: { genislik: 28, hiz: 1.1, hedefSayisi: 3 },
    baglam: b => { const t = turBul(b); return t && EKILEN[t] ? { dusen: EKILEN[t], yuk: EKILEN[t], tasiyiciAd: `${EKILEN_AD[t]} kesesi` } : {}; }
  },
  sula: {
    ad: 'Sula', ikon: 'ciftlik-kova', komut: 'sula', hedefler: ['konu', 't1', 't2'],
    mekanik: 'doldur',
    ortak: { kap: 'kova', hedef: 'ciftlik-filiz', hedefAd: 'Bitki', cozum: 'Bitki suyunu içti.' },
    kucuk: { bant: 30, tekrar: 2, hiz: 18 },
    buyuk: { bant: 18, tekrar: 3, hiz: 24 },
    baglam: b => { const t = turBul(b); return t && SULANAN[t] ? { hedef: SULANAN[t] } : {}; },
    yedek: {
      mekanik: 'zaman',
      ortak: { tasiyici: 'ciftlik-kova', tasiyiciAd: 'Sulama kabı', dusen: 'su', yuk: 'su', bolgeIkon: 'ciftlik-filiz', hedefAd: 'Bitki',
        cozum: 'Damlalar tam bitkinin dibine düştü.' },
      kucuk: { genislik: 40, hiz: .8, hedefSayisi: 2 },
      buyuk: { genislik: 28, hiz: 1.1, hedefSayisi: 3 }
    }
  },
  suluk: {
    ad: 'Suluğu doldur', ikon: 'ciftlik-suluk', komut: 'suluk', hedefler: ['kumes'],
    mekanik: 'doldur',
    ortak: { kap: 'suluk', hedef: 'ciftlik-tavuk', hedefAd: 'Tavuk', cozum: 'Suluk doldu; tavuklar su içiyor.' },
    kucuk: { bant: 30, tekrar: 2, hiz: 18 },
    buyuk: { bant: 18, tekrar: 3, hiz: 24 },
    yedek: {
      mekanik: 'zaman',
      ortak: { tasiyici: 'ciftlik-kova', tasiyiciAd: 'Su kabı', dusen: 'su', yuk: 'su', bolgeIkon: 'ciftlik-suluk', hedefAd: 'Suluk',
        cozum: 'Suluk doldu; tavuklar su içiyor.' },
      kucuk: { genislik: 40, hiz: .8, hedefSayisi: 2 },
      buyuk: { genislik: 28, hiz: 1.1, hedefSayisi: 3 }
    }
  },
  ot: {
    ad: 'Ot ayıkla', ikon: 'ot', komut: 'ot', hedefler: ['konu', 't1', 't2'],
    mekanik: 'gizli',
    ortak: { susler: ['ciftlik-filiz', 'yaprak'], ipucu: 'Filizlerin arasındaki otları bul, dokun.', cozum: 'Otlar ayıklandı; filizler rahatladı.' },
    kucuk: { tohum: 11, sus: 14, susBoy: [7, 11], boy: 15, gizli: gizliler('ot', 'ot', OT_YERLERI.kucuk) },
    buyuk: { tohum: 29, sus: 24, susBoy: [5, 9], boy: 12, gizli: gizliler('ot', 'ot', OT_YERLERI.buyuk) },
    yedek: {
      mekanik: 'refleks',
      ortak: { aranan: OT, cozum: 'Otlar ayıklandı; filizler rahatladı.' },
      kucuk: { hedef: 3, gorunme: 1800, ara: 500, digerleri: [FILIZ] },
      buyuk: { hedef: 4, gorunme: 1200, ara: 350, digerleri: [FILIZ, nesne('yaprak', 'Yaprak')] }
    }
  },
  destek: {
    ad: 'Destek çubuğu çak', ikon: 'ciftlik-cubuk', komut: 'destek', hedefler: ['konu', 't1', 't2'],
    mekanik: 'zaman',
    ortak: { tasiyici: 'ciftlik-fare', tasiyiciAd: 'Çiftçi fare', dusen: 'ciftlik-cubuk', yuk: 'ciftlik-cubuk', bolgeIkon: 'fidan', hedefAd: 'Fidan',
      cozum: 'Fidan çubuğuna yaslandı; rüzgârda eğilmez.' },
    kucuk: { genislik: 40, hiz: .8, hedefSayisi: 2 },
    buyuk: { genislik: 28, hiz: 1.1, hedefSayisi: 3 },
    baglam: b => { const t = turBul(b); return t && DESTEKLENEN[t] ? { bolgeIkon: DESTEKLENEN[t] } : {}; }
  },
  bugdayHasat: {
    ad: 'Buğday hasadı', ikon: 'basak', komut: 'hasat', hedefler: ['t1', 'konu'],
    mekanik: 'yakala',
    ortak: { iyi: ['basak'], cozum: 'Başaklar sepette; ambara gidiyor.' },
    kucuk: { kotu: [], hedef: 5, hiz: .14, sikayet: 1400 },
    buyuk: { kotu: ['yaprak'], hedef: 8, hiz: .18, sikayet: 1100 },
    yedek: {
      mekanik: 'refleks',
      ortak: { aranan: BASAK, cozum: 'Başaklar toplandı; ambara gidiyor.' },
      kucuk: { hedef: 4, gorunme: 1800, ara: 500, digerleri: [OT] },
      buyuk: { hedef: 6, gorunme: 1200, ara: 350, digerleri: [OT, nesne('yaprak', 'Yaprak')] }
    }
  },
  domatesHasat: {
    ad: 'Domates hasadı', ikon: 'ciftlik-domates', komut: 'hasat', hedefler: ['t2', 'konu'],
    mekanik: 'refleks',
    /* Olgun: iri, parlak, yıldız saplı. Ham: küçük, mat, yaprak gölgeli.
       Renk tek ipucu değil (kırmızı-yeşil renk körü çocuk da ayırır). */
    ortak: { aranan: OLGUN, digerleri: [HAM], cozum: 'Yalnız olgunları topladın; hamlar dalda büyüyor.' },
    kucuk: { hedef: 4, gorunme: 1800, ara: 500 },
    buyuk: { hedef: 6, gorunme: 1200, ara: 350 },
    yedek: {
      mekanik: 'yakala',
      ortak: { iyi: ['ciftlik-domates'], cozum: 'Olgun domatesler sepette.' },
      kucuk: { kotu: [], hedef: 4, hiz: .14, sikayet: 1400 },
      buyuk: { kotu: ['ciftlik-domates-ham'], hedef: 6, hiz: .18, sikayet: 1100 }
    }
  },
  dedeHasat: {
    ad: 'Dede Ceviz hasadı', ikon: 'ciftlik-dede', komut: 'hasat', hedefler: ['dede'],
    mekanik: 'silkele',
    ortak: { dokunus: 3, agac: 'ciftlik-dede', iyi: ['ciftlik-ceviz'], cozum: 'Cevizler sepette; Dede Ceviz rahatladı.' },
    kucuk: { kotu: [], hedef: 4, hiz: .14, sikayet: 1400 },
    buyuk: { kotu: ['yaprak'], hedef: 6, hiz: .18, sikayet: 1100 }
  },
  yem: {
    ad: 'Tavukları besle', ikon: 'ciftlik-yem', komut: 'yem', hedefler: ['kumes'],
    mekanik: 'besle',
    ortak: { yem: 'ciftlik-yem', hayvan: { kod: 'ciftlik-tavuk', ad: 'Tavuk', yem: 'ciftlik-yem' } },
    kucuk: {}, buyuk: {}
  },
  yumurta: {
    ad: 'Yumurta topla', ikon: 'ciftlik-folluk', komut: 'yumurta', hedefler: ['kumes'],
    mekanik: 'gizli',
    ortak: { susler: ['saman', 'ot'], ipucu: 'Samanın arasındaki yumurtaları bul, dokun.', cozum: 'Yumurtalar toplandı; ambara gidiyor.' },
    kucuk: { tohum: 5, sus: 12, susBoy: [8, 12], boy: 14, gizli: gizliler('ciftlik-yumurta', 'yumurta', YUMURTA_YERLERI.kucuk) },
    buyuk: { tohum: 17, sus: 22, susBoy: [6, 10], boy: 11, gizli: gizliler('ciftlik-yumurta', 'yumurta', YUMURTA_YERLERI.buyuk) },
    /* Follukta kaç yumurta varsa (1-3) o kadar saklanır. */
    baglam: (b, takim) => Number.isInteger(b.adet)
      ? { gizli: gizliler('ciftlik-yumurta', 'yumurta', YUMURTA_YERLERI[takim]).slice(0, Math.max(1, Math.min(3, b.adet))) } : {},
    yedek: {
      mekanik: 'refleks',
      ortak: { aranan: YUMURTA, cozum: 'Yumurtalar toplandı; ambara gidiyor.' },
      kucuk: { hedef: 3, gorunme: 1800, ara: 500, digerleri: [SAMAN] },
      buyuk: { hedef: 3, gorunme: 1200, ara: 350, digerleri: [SAMAN, OT] }
    }
  }
};

const dondur = x => Object.freeze(x);
/** İş kataloğu (dışa açık, değişmez): kabuk iş şeridini ve istemi bundan kurar. */
export const ISLER = dondur(Object.fromEntries(Object.entries(TANIM).map(([kod, t]) => [kod, dondur({
  kod, ad: t.ad, ikon: t.ikon, komut: t.komut, hedefler: dondur([...t.hedefler]),
  mekanik: t.mekanik, aile: MEKANIK_AILESI[t.mekanik], hayalet: HAYALET[t.mekanik].tip,
  yedek: t.yedek ? dondur({ mekanik: t.yedek.mekanik, aile: MEKANIK_AILESI[t.yedek.mekanik] }) : null
})])));
export const IS_KODLARI = dondur(Object.keys(ISLER));

/* Derin kopya: veri mekaniğe giderken katalog değişmesin. */
const kopya = x => Array.isArray(x) ? x.map(kopya) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, kopya(v)])) : x;

/**
 * İşin birleşik verisi. SAF.
 * @param kod    ISLER anahtarı
 * @param yas    '3-4' | '5-6' (ya da 'kucuk' | 'buyuk')
 * @param baglam {tur?, hedef?, adet?, yedek?, ayar?}  tur: konu tohumu; adet: yumurta sayısı;
 *               yedek: true → yedek mekanik; ayar: en son uygulanan ek alanlar
 * @returns {mekanik, aile, veri}  veri = {...mekanik.seviyeler[0], ...ayar}
 */
export function isVerisi(kod, yas = '3-4', baglam = {}) {
  const t = TANIM[kod];
  if (!t) throw new Error('isVerisi: bilinmeyen iş ' + kod);
  const takim = takimAl(yas);
  const kaynak = baglam.yedek && t.yedek ? t.yedek : t;
  const mekanikKod = kaynak.mekanik;
  const temel = mekanikKod === 'besle' ? BESLE_TEMEL : MEKANIKLER[mekanikKod].seviyeler[0];
  const ayar = {
    ...kaynak.ortak, ...kaynak[takim],
    ...(kaynak === t && t.baglam ? t.baglam(baglam, takim) : {}),
    ...(baglam.ayar || {})
  };
  /* gorev: js/gorev.js türü buradan okur (koprule'lu mekanik ya da yerleşik 'besle').
     baslik/yonerge çocuğa gösterilmez (yazı yok); öğretmen ve ekran okuyucu içindir. */
  return {
    mekanik: mekanikKod, aile: MEKANIK_AILESI[mekanikKod],
    veri: kopya({ ...temel, baslik: t.ad, yonerge: YONERGE[mekanikKod], ...ayar, gorev: mekanikKod })
  };
}

/** İşin çiftlik komutu (ortak/turler.js). Kimlik ve gün kabukta eklenir. */
export function komutIcin(is, hedef) {
  const kod = typeof is === 'string' ? is : is?.kod;
  const t = TANIM[kod];
  if (!t) throw new Error('komutIcin: bilinmeyen iş ' + kod);
  const h = hedef ?? (typeof is === 'object' ? is.hedef : undefined) ?? t.hedefler[0];
  if (!t.hedefler.includes(h) || !KOMUT_HEDEF[t.komut]?.includes(h)) throw new Error(`komutIcin: ${kod} için geçersiz hedef ${h}`);
  return { tur: t.komut, hedef: h };
}

/* ---------------------------------------------------------------- ihtiyaç → iş, iş listesi */

/** Bir ihtiyacı işe çevirir: ('hasat', {hedef:'t1'}) → 'bugdayHasat'. Karşılığı yoksa null. */
export function isKodu(ihtiyac, { hedef = null, tur = null } = {}) {
  if (ihtiyac === 'hasat') {
    if (hedef === 'dede') return 'dedeHasat';
    const t = tur || (hedef && TARLA_TURU[hedef]);
    return t === 'bugday' ? 'bugdayHasat' : t === 'domates' ? 'domatesHasat' : null;   // çocuğun cevizi hasat edilmez
  }
  if (hedef === 'kumes') return ['yem', 'suluk', 'yumurta'].includes(ihtiyac) ? ihtiyac : null;
  return ['capa', 'ek', 'sula', 'ot', 'destek'].includes(ihtiyac) ? ihtiyac : null;
}

/* Öncelik: konu bitkisinin ihtiyacı > hazır hasat > kümes > tarla hazırlığı (ve tarla bakımı). */
function oncelik(a) {
  if (a.hedef === 'konu') return 0;
  if (ISLER[a.kod].komut === 'hasat') return 1;
  if (a.hedef === 'kumes') return 2;
  return 3;
}

/**
 * ciftlikOzet().ihtiyaclar biçimindeki listeyi ('konu:sula', 't1:hasat', 'kumes:yem'...)
 * öncelik sırasına dizilmiş iş adaylarına çevirir: [{kod, hedef, tur}].
 * turler: {konu: 'ceviz', t1: 'bugday', t2: 'domates'} (t1/t2 verilmezse harita ekinleri).
 */
export function isAdaylari(ihtiyaclar = [], { turler = {} } = {}) {
  const tur = { ...TARLA_TURU, ...turler };
  const liste = [];
  for (const s of ihtiyaclar) {
    const [hedef, ihtiyac] = String(s).split(':');
    const kod = isKodu(ihtiyac, { hedef, tur: tur[hedef] });
    if (!kod || liste.some(a => a.kod === kod && a.hedef === hedef)) continue;
    liste.push({ kod, hedef, tur: tur[hedef] ?? null });
  }
  return liste.map((a, i) => ({ a, i })).sort((x, y) => oncelik(x.a) - oncelik(y.a) || x.i - y.i).map(x => x.a);
}

/* Adayın o listede oynayacağı mekanik ailesi. */
const aileOf = a => a.yedek ? ISLER[a.kod].yedek.aile : ISLER[a.kod].aile;

/**
 * Bir çocuğun iş listesi: en çok n iş, ART ARDA İKİ İŞ AYNI MEKANİĞİ (ailesini) KULLANMAZ.
 * Öncelik sırası korunur: sıradaki aday bir öncekiyle çakışırsa önce kendi yedek
 * mekaniğiyle alınır; yedeği yoksa (ya da o da çakışırsa) sonraki uygun aday öne
 * geçer; hiçbiri uymuyorsa liste orada biter (kalanlar dünyada balon olarak durur).
 * @param adaylar  [{kod, hedef?, tur?, adet?}] ya da iş kodları, öncelik sırasıyla
 * @returns [{kod, hedef, tur, yedek, mekanik, aile, ...}]
 */
export function isListesi(adaylar = [], { n = 2 } = {}) {
  const kalan = adaylar.map(a => typeof a === 'string' ? { kod: a } : { ...a })
    .filter(a => TANIM[a.kod]).map(a => ({ ...a, yedek: false }));
  const secilen = [];
  while (secilen.length < n && kalan.length) {
    const son = secilen.length ? aileOf(secilen[secilen.length - 1]) : null;
    const ilk = kalan[0];
    if (aileOf(ilk) !== son) { secilen.push(kalan.shift()); continue; }
    const y = ISLER[ilk.kod].yedek;
    if (y && y.aile !== son) { kalan.shift(); secilen.push({ ...ilk, yedek: true }); continue; }
    const i = kalan.findIndex(a => aileOf(a) !== son || (ISLER[a.kod].yedek && ISLER[a.kod].yedek.aile !== son));
    if (i < 0) break;
    const a = kalan.splice(i, 1)[0];
    secilen.push(aileOf(a) !== son ? a : { ...a, yedek: true });
  }
  return secilen.map(a => {
    const t = ISLER[a.kod];
    const mekanik = a.yedek ? t.yedek.mekanik : t.mekanik;
    return { ...a, hedef: a.hedef ?? t.hedefler[0], mekanik, aile: MEKANIK_AILESI[mekanik], ikon: t.ikon, ad: t.ad };
  });
}

/** Yardımcı: liste art arda aynı mekanik ailesi içeriyor mu? (test ve kabuk için) */
export function ardisikTekrar(liste) {
  return liste.some((a, i) => i > 0 && (a.aile || aileOf(a)) === (liste[i - 1].aile || aileOf(liste[i - 1])));
}

/** Mekaniğin kaç adımda bittiği (yazısız ilerleme noktaları için). */
export function adimSayisi(mekanik, veri) {
  switch (mekanik) {
    case 'zaman': return veri.hedefSayisi;
    case 'refleks': case 'yakala': case 'silkele': return veri.hedef;
    case 'gizli': return veri.gizli.length;
    case 'doldur': return veri.tekrar;
    case 'besle': return 3;
    default: return 1;
  }
}

/* ---------------------------------------------------------------- DOM: katman */

let yukleme = null;
/** DOM modüllerini (gorev.js, masal/gorev.js, ses.js) ve iş stilini yükler. Önbellekli. */
export function islerHazirla(doc = globalThis.document) {
  if (!yukleme) {
    yukleme = Promise.all([
      import('../gorev.js'), import('../masal/gorev.js'), import('../ses.js'), stilYukle(doc)
    ]).then(([g, m, s]) => ({ baslatGorev: g.baslatGorev, koprule: m.koprule, ses: s.ses }));
    yukleme.catch(() => { yukleme = null; });
  }
  return yukleme;
}
function stilYukle(doc) {
  if (!doc) return Promise.resolve();
  const var_ = [...doc.querySelectorAll('link[rel="stylesheet"]')].find(l => /ciftlik-isler\.css(\?|$)/.test(l.getAttribute('href') || ''));
  if (var_) return var_.sheet ? Promise.resolve() : new Promise(r => { var_.addEventListener('load', r, { once: true }); var_.addEventListener('error', r, { once: true }); setTimeout(r, 1500); });
  const l = doc.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL('../../css/ciftlik-isler.css', import.meta.url).href;
  const p = new Promise(r => { l.addEventListener('load', r, { once: true }); l.addEventListener('error', r, { once: true }); });
  doc.head.append(l);
  return p;
}

const KAPAT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const BIRAK_SVG = '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 16v62" stroke="#fff" stroke-width="14" stroke-linecap="round"/><path d="M32 58l28 30 28-30" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 102h64" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/></svg>';

/* Mekaniği saran ince katman: adımları (yazısız noktalar) ve ilk etkileşimi izler. */
function sar(mekanik, k) {
  return {
    ...mekanik,
    kur(ctx) {
      mekanik.kur({ ...ctx, adim() { k.adim(); ctx.adim(); } });
      k.kuruldu(ctx.alan);
    }
  };
}

/**
 * İşi bir katmanda açar ve mekaniğin yaşam döngüsünü yönetir.
 * @param is  iş kodu ('capa') ya da {kod, hedef?, tur?, adet?, yedek?} (isListesi öğesi)
 * @param secenek
 *   yas        '3-4' | '5-6'  (varsayılan '3-4')
 *   alan       katmanın ekleneceği öğe (varsayılan document.body)
 *   bitince    (sonuc) => {}  iş bitince, katman kapandıktan sonra.
 *              sonuc = {is, hedef, komut:{tur, hedef}, mekanik, yas, birlikte}
 *   kapaninca  (sonuc|null) => {}  katman her kapandığında (vazgeçince null)
 *   hayalet    false → hayalet el gösterilmez (varsayılan true)
 *   hayaletSure hayalet elin en uzun süresi, ms (varsayılan 2000; ilk dokunuşta zaten kalkar)
 *   azHareket  true/false; verilmezse prefers-reduced-motion
 *   kutlamaMs  bitişten katmanın kapanmasına (varsayılan 900; azaltılmış harekette 350)
 *   ayar       mekanik verisine en son eklenecek alanlar
 * @returns tutamak {katman, kod, mekanik, veri, bitti: Promise<sonuc|null>, bitir(), kapat()}
 */
export function isAc(is, secenek = {}) {
  const baglam = typeof is === 'string' ? { kod: is } : { ...is };
  const kod = baglam.kod;
  if (!TANIM[kod]) throw new Error('isAc: bilinmeyen iş ' + kod);
  const { yas = '3-4', alan = document.body, bitince, kapaninca, hayalet = true, ayar } = secenek;
  const doc = alan.ownerDocument || document;
  const pencere = doc.defaultView || globalThis;
  const azHareket = secenek.azHareket ?? !!pencere.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const kutlamaMs = secenek.kutlamaMs ?? (azHareket ? 350 : 900);
  const { mekanik, veri } = isVerisi(kod, yas, { ...baglam, ayar: { ...(baglam.ayar || {}), ...(ayar || {}) } });
  const hedef = baglam.hedef ?? TANIM[kod].hedefler[0];
  const komut = komutIcin(kod, hedef);                     // geçersiz hedef burada, erkenden hata verir
  const t = ISLER[kod];
  ciftlikIkonlariniKaydet();

  const yap = (tag, cls) => { const e = doc.createElement(tag); if (cls) e.className = cls; return e; };
  const katman = yap('div', 'ciftlik-is');
  katman.hidden = true;                                    // stil yüklenmeden görünmesin
  katman.setAttribute('role', 'dialog');
  katman.setAttribute('aria-modal', 'true');
  katman.setAttribute('aria-label', t.ad);
  katman.tabIndex = -1;
  Object.assign(katman.dataset, { is: kod, mekanik, yas: takimAl(yas) === 'buyuk' ? '5-6' : '3-4', durum: 'yukleniyor' });
  if (azHareket) katman.classList.add('az-hareket');
  const kart = yap('div', 'ciftlik-is-kart');
  const ust = yap('div', 'ciftlik-is-ust');
  const isIkon = yap('span', 'ciftlik-is-ikon'); isIkon.setAttribute('aria-hidden', 'true');
  const pipler = yap('div', 'ciftlik-is-pipler'); pipler.setAttribute('aria-hidden', 'true');
  const toplamAdim = Math.max(1, adimSayisi(mekanik, veri) | 0);
  for (let i = 0; i < toplamAdim; i++) pipler.append(yap('i'));
  const kapatD = yap('button', 'ciftlik-is-kapat'); kapatD.type = 'button';
  kapatD.setAttribute('aria-label', 'İşi bırak'); kapatD.innerHTML = KAPAT_SVG;
  ust.append(isIkon, pipler, kapatD);
  const govde = yap('div', 'ciftlik-is-govde');
  kart.append(ust, govde);
  const parilti = yap('div', 'ciftlik-is-kutlama'); parilti.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 10; i++) parilti.append(yap('i'));
  katman.append(kart, parilti);
  alan.append(katman);

  const oncekiOdak = doc.activeElement;
  let gorev = null, h = null, durum = 'yukleniyor', adim = 0, kapanmaZamani = 0, modul = null, sonAcik = null, gozcu = null;
  let coz;
  const bitti = new Promise(r => { coz = r; });
  const durumYaz = d => { durum = d; katman.dataset.durum = d; };
  const pipDoldur = n => {
    adim = Math.min(toplamAdim, n);
    [...pipler.children].forEach((p, i) => p.classList.toggle('dolu', i < adim));
  };

  function temizle() {
    clearTimeout(kapanmaZamani);
    gozcu?.disconnect();
    h?.kaldir();
    try { gorev?.dispose(); } catch {}
    gorev = null;
    katman.remove();
    doc.removeEventListener('keydown', tus, true);
    if (oncekiOdak && oncekiOdak.isConnected && typeof oncekiOdak.focus === 'function') {
      try { oncekiOdak.focus({ preventScroll: true }); } catch {}
    }
  }
  function tamamla(birlikte) {
    if (durum === 'bitti' || durum === 'kapandi') return;
    durumYaz('bitti');
    h?.kaldir();
    pipDoldur(toplamAdim);
    katman.classList.add('kutlama');
    if (birlikte) modul?.ses?.celebrate?.();
    const sonuc = { is: kod, hedef, komut: { ...komut }, mekanik, yas: katman.dataset.yas, birlikte: !!birlikte };
    sonAcik = sonuc;
    kapanmaZamani = setTimeout(() => {
      temizle();
      durumYaz('kapandi');
      try { bitince?.(sonuc); } finally { kapaninca?.(sonuc); coz(sonuc); }
    }, Math.max(0, kutlamaMs));
  }
  function kapat() {
    if (durum === 'kapandi') return;
    const tamamdi = durum === 'bitti';                     // kutlama sürerken kapatıldı: iş yine de tamam
    temizle();
    durumYaz('kapandi');
    if (!tamamdi) { kapaninca?.(null); coz(null); return; }
    try { bitince?.(sonAcik); } finally { kapaninca?.(sonAcik); coz(sonAcik); }
  }
  function tus(e) {
    if (e.key === 'Escape' && durum === 'acik') { e.preventDefault(); kapat(); }
  }
  kapatD.addEventListener('click', () => kapat());
  doc.addEventListener('keydown', tus, true);

  islerHazirla(doc).then(m => {
    if (durum !== 'yukleniyor') return;
    modul = m;
    isIkon.innerHTML = ikon(t.ikon);
    const kanca = {
      adim() { pipDoldur(adim + 1); h?.kaldir(); },
      kuruldu() { yamala(); }
    };
    /* Mekaniklerin çiftliğe uymayan iki ayrıntısı katmanda düzeltilir
       (js/oyunlar'a dokunmadan): zaman düğmesinin yazısı yerine büyük ok
       (okuma bilmeyen çocuk) ve yakala'nın kutusu yerine hasat sepeti.
       Silkele yakala'yı sonradan kurduğu için gözlemciyle de bakılır. */
    function yamala() {
      const zd = govde.querySelector('.zaman-dugme:not([data-yamali])');
      if (zd) { zd.dataset.yamali = ''; zd.setAttribute('aria-label', 'Şimdi bırak'); zd.innerHTML = BIRAK_SVG; }
      const sp = govde.querySelector('.yakala-sepet:not([data-yamali])');
      if (sp) {
        sp.dataset.yamali = ''; sp.innerHTML = ikon('ciftlik-sepet');
        /* Silkele'nin ikinci adımı yeni bir hareket: hayalet el onu da gösterir. */
        if (mekanik === 'silkele' && hayalet && durum === 'acik') {
          h?.kaldir();
          katman.dataset.hayalet = 'kaydir';
          h = hayaletGoster(katman, { tip: 'kaydir', azHareket, sure: secenek.hayaletSure ?? 2000, hedef: () => govde.querySelector('.yakala-sepet') });
        }
      }
    }
    gozcu = new pencere.MutationObserver(yamala);
    gozcu.observe(govde, { childList: true, subtree: true });
    const turler = {};
    for (const [k, mk] of Object.entries(MEKANIKLER)) turler[k] = m.koprule(sar(mk, kanca));
    const chapter = { hayvan: veri.hayvan || { kod: 'ciftlik-tavuk', ad: 'Tavuk', yem: 'ciftlik-yem' } };
    gorev = m.baslatGorev(govde, { tip: 'is', veri }, chapter, () => tamamla(false), p => {
      if (mekanik === 'besle') { pipDoldur(p); if (p > 0) h?.kaldir(); }
    }, { turler });
    katman.hidden = false;
    durumYaz('acik');
    const odak = ODAK[mekanik] && govde.querySelector(ODAK[mekanik]);
    try { (odak || katman).focus({ preventScroll: true }); } catch {}
    if (hayalet) {
      const hd = HAYALET[mekanik];
      katman.dataset.hayalet = hd.tip;
      h = hayaletGoster(katman, {
        tip: hd.tip, azHareket, sure: secenek.hayaletSure ?? 2000,
        hedef: () => govde.querySelector(hd.hedef),
        hedef2: hd.hedef2 ? () => govde.querySelector(hd.hedef2) : null
      });
    }
  }).catch(hata => {
    console.error(hata);
    if (durum === 'yukleniyor') kapat();
  });

  return {
    katman, kod, hedef, mekanik, veri,
    bitti,
    get durum() { return durum; },
    /** Öğretmenin 'birlikte bitir' kısayolu: iş tamam sayılır. */
    bitir() { if (durum === 'acik' || durum === 'yukleniyor') { katman.hidden = false; tamamla(true); } },
    /** Vazgeç: iş yapılmadan katman kapanır (bitince çağrılmaz). */
    kapat
  };
}

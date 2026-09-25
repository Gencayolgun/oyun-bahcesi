// Çiftçi Fare — belge ve komut doğrulama (SAF). Sunucu her yazımdan önce, istemci önbellekten okurken kullanır.
// Dönüş: {tamam: true} ya da {red: 'kod', yol?: 'alan.yolu'}.
import {
  KOMUT_TURLERI, HEDEFLER, KOMUT_HEDEF, HEDIYELER, SEMBOLLER, RENKLER, YAS_GRUPLARI, TAKVIMLER,
  TOPRAKLAR, PARSELLER, TARLA_TURU, KONU_TURLERI, UNITE_GUNLERI, AMBAR_ANAHTARLARI,
  SINIR, SEMA, ZIYARET_KAYIT, ANI_TAVAN, CIHAZ_TAVAN,
} from './turler.js';
import { tzGecerli } from './zaman.js';

export const OID_DESEN = /^o_[a-z0-9]{6,16}$/;
export const CIHAZ_DESEN = /^c_[a-z0-9]{8}$/;
export const KOMUT_ID_DESEN = /^(c_[a-z0-9]{8}):([1-9][0-9]{0,8})$/;
export const SINIF_KOD_DESEN = /^[A-Z0-9]{4,12}$/;
const GUN_UST = 1e6; // ~ yıl 4700: makul üst sınır
const DERINLIK_TAVAN = 16; // geçerli belgeler en çok ~5 düzey derin; çok derin iç içe yapı yığını taşırmasın

// Adı taşıyabilecek her alan yasak (sunucuda çocuk adı YOK).
export const YASAK_ANAHTARLAR = Object.freeze([
  'ad', 'adi', 'soyad', 'soyadi', 'isim', 'ismi', 'adsoyad', 'ogrenciadi', 'takmaad', 'lakap',
  'name', 'firstname', 'lastname', 'fullname', 'nickname', 'displayname', 'username',
]);

const TAMAM = Object.freeze({ tamam: true });
const red = (kod, yol) => (yol ? { red: kod, yol } : { red: kod });

/** JSON bayt boyu. Serileştirilemeyen (döngülü, BigInt, aşırı derin) değer → Infinity (boyut reddi). */
export function bayt(x) {
  try {
    const s = typeof x === 'string' ? x : JSON.stringify(x);
    return typeof s === 'string' ? new TextEncoder().encode(s).length : 0;
  } catch {
    return Infinity;
  }
}

/**
 * Yığın kullanmadan (döngüyle) iç içe derinliği ölçer; tavan aşılınca true. Ortak başvurulu bellek içi
 * yapılar (aynı dizi her düzeyde birkaç kez) üstel gezinmesin diye nesne bütçesi de vardır: 64 KB'lık
 * bir JSON belgesinde en çok ~22 bin nesne olabilir.
 */
export function cokDerin(x, tavan = DERINLIK_TAVAN, butce = 100000) {
  const yigin = [[x, 0]];
  while (yigin.length) {
    const [v, d] = yigin.pop();
    if (!v || typeof v !== 'object') continue;
    if (d >= tavan || --butce < 0) return true;
    for (const k of Object.keys(v)) yigin.push([v[k], d + 1]);
  }
  return false;
}

const nesneMi = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
const gunMu = (x) => Number.isInteger(x) && x >= 0 && x <= GUN_UST;
const gunYaNull = (x) => x === null || gunMu(x);
const sayacMi = (x) => Number.isInteger(x) && x >= 0 && x <= 1e9;

function fazlaAlan(x, izinli) {
  for (const k of Object.keys(x)) if (!izinli.includes(k)) return k;
  return null;
}

// Anahtarı karşılaştırma için sadeleştirir: küçük harf, Türkçe harfler ASCII'ye, ayraçlar atılır.
function anahtarSade(k) {
  return k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/[_\-\s.]/g, '');
}

// Anahtar → yasak mı? Belgelerde aynı anahtarlar tekrar tekrar geçer; sonuç yalnız anahtara bağlı (saf),
// o yüzden sınırlı bir önbellek güvenlidir. (Her doğrulamada NFD normalleştirmesi sunucuda da pahalı.)
const yasakOnbellek = new Map();
function yasakMi(k) {
  let v = yasakOnbellek.get(k);
  if (v === undefined) {
    v = yasakAnahtar(anahtarSade(k));
    if (yasakOnbellek.size >= 4096) yasakOnbellek.clear();
    yasakOnbellek.set(k, v);
  }
  return v;
}

// Listede olmayan bileşik adlar da yakalanır: cocukAdi, veliIsmi, childName, ogrenciSoyadi…
// (Geçerli şemada hiçbir alan bu kalıplara uymaz.)
function yasakAnahtar(sade) {
  return YASAK_ANAHTARLAR.includes(sade) || /isim|ismi|name|soyad/.test(sade) || /[a-z]adi$/.test(sade);
}

/** Derin tarama: yasak ad alanı var mı? Yol döndürür. */
export function adAlaniBul(x, yol = '') {
  if (Array.isArray(x)) {
    for (let i = 0; i < x.length; i++) {
      const v = x[i];
      if (!v || typeof v !== 'object') continue; // gün dizileri: sayı, yol dizesi kurmaya gerek yok
      const y = adAlaniBul(v, `${yol}[${i}]`);
      if (y) return y;
    }
    return null;
  }
  if (!nesneMi(x)) return null;
  for (const k of Object.keys(x)) {
    if (yasakMi(k)) return yol ? `${yol}.${k}` : k;
    const v = x[k];
    if (v && typeof v === 'object') {
      const y = adAlaniBul(v, yol ? `${yol}.${k}` : k);
      if (y) return y;
    }
  }
  return null;
}

function gunKumesiHata(a, yol) {
  if (!Array.isArray(a)) return red('gun-kumesi', yol);
  for (const g of a) if (!gunMu(g)) return red('gun', yol);
  return null;
}

function ozetHata(o, izinli, yol) {
  if (o === undefined) return null;
  if (!nesneMi(o)) return red('ozet', yol);
  const f = fazlaAlan(o, izinli);
  if (f) return red('alan', `${yol}.${f}`);
  for (const k of Object.keys(o)) {
    const z = o[k];
    if (!nesneMi(z) || fazlaAlan(z, ['sayi', 'ilk', 'son']) || !sayacMi(z.sayi) || !gunYaNull(z.ilk) || !gunYaNull(z.son)) {
      return red('ozet', `${yol}.${k}`);
    }
  }
  return null;
}

// ------------------------------------------------------------------ komut

/** Tek komut: {id:'c_ab12cd34:118', tur, hedef, gun?, hediye?} — serbest metin yok. */
export function komutDogrula(k) {
  if (!nesneMi(k)) return red('komut');
  const f = fazlaAlan(k, ['id', 'tur', 'hedef', 'gun', 'hediye']);
  if (f) return red('alan', f);
  if (typeof k.id !== 'string' || !KOMUT_ID_DESEN.test(k.id)) return red('id');
  if (!KOMUT_TURLERI.includes(k.tur)) return red('tur');
  if (!HEDEFLER.includes(k.hedef)) return red('hedef');
  if (!KOMUT_HEDEF[k.tur].includes(k.hedef)) return red('hedef');
  if (k.gun !== undefined && k.gun !== null && !gunMu(k.gun)) return red('gun'); // null = gün yok (bugün)
  if (k.tur === 'hediye') {
    if (!HEDIYELER.includes(k.hediye)) return red('hediye');
  } else if (k.hediye !== undefined) {
    return red('alan', 'hediye');
  }
  return TAMAM;
}

/** POST .../islem gövdesi: {komutlar:[en çok 20]}, ≤16 KB. */
export function islemGovdeDogrula(govde) {
  if (cokDerin(govde)) return red('derinlik');
  if (bayt(govde) > SINIR.govde) return red('boyut');
  if (!nesneMi(govde)) return red('govde');
  const f = fazlaAlan(govde, ['komutlar']);
  if (f) return red('alan', f);
  if (!Array.isArray(govde.komutlar) || govde.komutlar.length === 0 || govde.komutlar.length > SINIR.komut) {
    return red('komutlar');
  }
  for (let i = 0; i < govde.komutlar.length; i++) {
    const s = komutDogrula(govde.komutlar[i]);
    if (s.red) return red(s.red, `komutlar[${i}]${s.yol ? '.' + s.yol : ''}`);
  }
  return TAMAM;
}

// ------------------------------------------------------------------ çiftlik

const CIFTLIK_ALANLARI = [
  'sema', 'surum', 'sahip', 'olusturmaGun', 'parseller', 'dede', 'kumes', 'ambar',
  'ziyaretler', 'gorulenZiyaret', 'anilar', 'cihazSeq',
];
const BITKI_ALANLARI = ['tur', 'ekimGun', 'uniteGun', 'su', 'otAyiklama', 'isler', 'hasat', 'gorulenEvre', 'ozet'];

function bitkiHata(b, parsel, yol) {
  if (!nesneMi(b)) return red('bitki', yol);
  const f = fazlaAlan(b, BITKI_ALANLARI);
  if (f) return red('alan', `${yol}.${f}`);
  const izinli = parsel === 'konu' ? KONU_TURLERI : [TARLA_TURU[parsel]];
  if (!izinli.includes(b.tur)) return red('tur', `${yol}.tur`);
  if (!gunMu(b.ekimGun)) return red('gun', `${yol}.ekimGun`);
  if (b.uniteGun !== null && b.uniteGun !== undefined && !UNITE_GUNLERI.includes(b.uniteGun)) {
    return red('unite', `${yol}.uniteGun`);
  }
  return (
    gunKumesiHata(b.su, `${yol}.su`) ||
    gunKumesiHata(b.hasat, `${yol}.hasat`) ||
    (gunYaNull(b.otAyiklama ?? null) ? null : red('gun', `${yol}.otAyiklama`)) ||
    (!nesneMi(b.isler) || fazlaAlan(b.isler, ['destek']) || !gunYaNull(b.isler.destek ?? null)
      ? red('isler', `${yol}.isler`) : null) ||
    (Number.isInteger(b.gorulenEvre) && b.gorulenEvre >= 0 && b.gorulenEvre < 32 ? null : red('evre', `${yol}.gorulenEvre`)) ||
    ozetHata(b.ozet, ['su', 'hasat'], `${yol}.ozet`)
  );
}

/** Çiftlik belgesi: yapı, sabit listeler, ≤64 KB, ad alanı yok. */
export function ciftlikDogrula(d) {
  if (!nesneMi(d)) return red('belge');
  if (cokDerin(d)) return red('derinlik');
  if (bayt(d) > SINIR.ciftlik) return red('boyut');
  const ad = adAlaniBul(d);
  if (ad) return red('ad-alani', ad);
  const f = fazlaAlan(d, CIFTLIK_ALANLARI);
  if (f) return red('alan', f);
  if (d.sema !== SEMA) return red('sema', 'sema');
  if (!sayacMi(d.surum)) return red('surum', 'surum');
  if (typeof d.sahip !== 'string' || !OID_DESEN.test(d.sahip)) return red('oid', 'sahip');
  if (!gunMu(d.olusturmaGun)) return red('gun', 'olusturmaGun');

  if (!nesneMi(d.parseller)) return red('parseller', 'parseller');
  const fp = fazlaAlan(d.parseller, PARSELLER);
  if (fp) return red('hedef', `parseller.${fp}`);
  for (const p of PARSELLER) {
    const x = d.parseller[p];
    const yol = `parseller.${p}`;
    if (!nesneMi(x)) return red('parsel', yol);
    const fx = fazlaAlan(x, p === 'konu' ? ['toprak', 'capaGun', 'bitki', 'konuBas'] : ['toprak', 'capaGun', 'bitki']);
    if (fx) return red('alan', `${yol}.${fx}`);
    if (!TOPRAKLAR.includes(x.toprak)) return red('toprak', `${yol}.toprak`);
    if (!gunYaNull(x.capaGun ?? null)) return red('gun', `${yol}.capaGun`);
    if (p === 'konu' && !gunYaNull(x.konuBas ?? null)) return red('gun', `${yol}.konuBas`);
    if (x.bitki !== null && x.bitki !== undefined) {
      const h = bitkiHata(x.bitki, p, `${yol}.bitki`);
      if (h) return h;
    }
  }

  if (!nesneMi(d.dede) || fazlaAlan(d.dede, ['hasat', 'ozet'])) return red('dede', 'dede');
  const hd = gunKumesiHata(d.dede.hasat, 'dede.hasat') || ozetHata(d.dede.ozet, ['hasat'], 'dede.ozet');
  if (hd) return hd;

  if (!nesneMi(d.kumes) || fazlaAlan(d.kumes, ['yem', 'su', 'sonToplama', 'ozet'])) return red('kumes', 'kumes');
  const hk = gunKumesiHata(d.kumes.yem, 'kumes.yem') || gunKumesiHata(d.kumes.su, 'kumes.su') ||
    (gunMu(d.kumes.sonToplama) ? null : red('gun', 'kumes.sonToplama')) ||
    ozetHata(d.kumes.ozet, ['yem', 'su'], 'kumes.ozet');
  if (hk) return hk;

  if (!nesneMi(d.ambar)) return red('ambar', 'ambar');
  const fa = fazlaAlan(d.ambar, AMBAR_ANAHTARLARI);
  if (fa) return red('alan', `ambar.${fa}`);
  for (const k of AMBAR_ANAHTARLARI) if (!sayacMi(d.ambar[k])) return red('ambar', `ambar.${k}`);

  if (!Array.isArray(d.ziyaretler) || d.ziyaretler.length > ZIYARET_KAYIT) return red('ziyaretler', 'ziyaretler');
  for (let i = 0; i < d.ziyaretler.length; i++) {
    const z = d.ziyaretler[i];
    const yol = `ziyaretler[${i}]`;
    if (!nesneMi(z) || fazlaAlan(z, ['kim', 'gun', 'sula', 'hediye'])) return red('ziyaret', yol);
    if (typeof z.kim !== 'string' || !OID_DESEN.test(z.kim)) return red('oid', `${yol}.kim`);
    if (!gunMu(z.gun)) return red('gun', `${yol}.gun`);
    if (z.sula !== null && !PARSELLER.includes(z.sula)) return red('hedef', `${yol}.sula`);
    if (z.hediye !== null && !HEDIYELER.includes(z.hediye)) return red('hediye', `${yol}.hediye`);
  }

  if (!gunYaNull(d.gorulenZiyaret ?? null)) return red('gun', 'gorulenZiyaret');

  if (!Array.isArray(d.anilar) || d.anilar.length > ANI_TAVAN) return red('anilar', 'anilar');
  for (let i = 0; i < d.anilar.length; i++) {
    const a = d.anilar[i];
    const yol = `anilar[${i}]`;
    if (!nesneMi(a) || fazlaAlan(a, ['tur', 'ekimGun', 'sonEvre'])) return red('ani', yol);
    if (!KONU_TURLERI.includes(a.tur)) return red('tur', `${yol}.tur`);
    if (!gunMu(a.ekimGun)) return red('gun', `${yol}.ekimGun`);
    if (!Number.isInteger(a.sonEvre) || a.sonEvre < 0 || a.sonEvre >= 32) return red('evre', `${yol}.sonEvre`);
  }

  if (!nesneMi(d.cihazSeq)) return red('cihazSeq', 'cihazSeq');
  const cihazlar = Object.keys(d.cihazSeq);
  if (cihazlar.length > CIHAZ_TAVAN) return red('cihazSeq', 'cihazSeq');
  for (const c of cihazlar) {
    if (!CIHAZ_DESEN.test(c) || !sayacMi(d.cihazSeq[c])) return red('cihazSeq', `cihazSeq.${c}`);
  }
  return TAMAM;
}

// ------------------------------------------------------------------ sınıf

const SINIF_ALANLARI = [
  'sema', 'kod', 'olusturmaGun', 'anahtarKarma', 'pin', 'pinHata', 'ayarlar', 'konu', 'eskiKonular',
  'donmalar', 'ogrenciler',
];

function konuHata(k, yol) {
  if (!nesneMi(k) || fazlaAlan(k, ['tur', 'basGun', 'uniteGun'])) return red('konu', yol);
  if (!KONU_TURLERI.includes(k.tur)) return red('tur', `${yol}.tur`);
  if (!gunMu(k.basGun)) return red('gun', `${yol}.basGun`);
  if (!UNITE_GUNLERI.includes(k.uniteGun)) return red('unite', `${yol}.uniteGun`);
  return null;
}

/** Sınıf belgesi: ≤32 KB, en çok 40 öğrenci, öğrenci = {id, sembol, renk, yas} (AD YOK). */
export function sinifDogrula(s) {
  if (!nesneMi(s)) return red('belge');
  if (cokDerin(s)) return red('derinlik');
  if (bayt(s) > SINIR.sinif) return red('boyut');
  const ad = adAlaniBul(s);
  if (ad) return red('ad-alani', ad);
  const f = fazlaAlan(s, SINIF_ALANLARI);
  if (f) return red('alan', f);
  if (s.sema !== SEMA) return red('sema', 'sema');
  if (typeof s.kod !== 'string' || !SINIF_KOD_DESEN.test(s.kod)) return red('kod', 'kod');
  if (s.olusturmaGun !== undefined && !gunMu(s.olusturmaGun)) return red('gun', 'olusturmaGun');
  if (s.anahtarKarma !== undefined && (typeof s.anahtarKarma !== 'string' || !/^[0-9a-f]{64}$/.test(s.anahtarKarma))) {
    return red('anahtar', 'anahtarKarma');
  }
  if (s.pin !== undefined) {
    const p = s.pin;
    if (!nesneMi(p) || fazlaAlan(p, ['tip', 'N', 'r', 'p', 'tuz', 'karma']) || p.tip !== 'scrypt' ||
      !Number.isInteger(p.N) || !Number.isInteger(p.r) || !Number.isInteger(p.p) ||
      typeof p.tuz !== 'string' || p.tuz.length > 128 || typeof p.karma !== 'string' || p.karma.length > 256) {
      return red('pin', 'pin');
    }
  }
  if (s.pinHata !== undefined) {
    const h = s.pinHata;
    if (!nesneMi(h) || fazlaAlan(h, ['sayi', 'kilitBitis']) || !sayacMi(h.sayi) ||
      !(h.kilitBitis === null || h.kilitBitis === undefined || sayacMi(h.kilitBitis) || (Number.isFinite(h.kilitBitis) && h.kilitBitis >= 0))) {
      return red('pin', 'pinHata');
    }
  }

  const a = s.ayarlar;
  if (!nesneMi(a)) return red('ayarlar', 'ayarlar');
  const fa = fazlaAlan(a, ['tz', 'takvim', 'tahtaIs', 'ziyaret']);
  if (fa) return red('alan', `ayarlar.${fa}`);
  if (!tzGecerli(a.tz)) return red('tz', 'ayarlar.tz');
  if (!TAKVIMLER.includes(a.takvim)) return red('takvim', 'ayarlar.takvim');
  if (a.tahtaIs !== undefined && a.tahtaIs !== 2 && a.tahtaIs !== 3) return red('tahtaIs', 'ayarlar.tahtaIs');
  if (a.ziyaret !== undefined && typeof a.ziyaret !== 'boolean') return red('ziyaret', 'ayarlar.ziyaret');

  if (s.konu !== null && s.konu !== undefined) {
    const h = konuHata(s.konu, 'konu');
    if (h) return h;
  }
  if (s.eskiKonular !== undefined) {
    if (!Array.isArray(s.eskiKonular) || s.eskiKonular.length > ANI_TAVAN) return red('eskiKonular', 'eskiKonular');
    for (let i = 0; i < s.eskiKonular.length; i++) {
      const h = konuHata(s.eskiKonular[i], `eskiKonular[${i}]`);
      if (h) return h;
    }
  }
  if (s.donmalar !== undefined) {
    if (!Array.isArray(s.donmalar) || s.donmalar.length > 64) return red('donmalar', 'donmalar');
    for (let i = 0; i < s.donmalar.length; i++) {
      const d = s.donmalar[i];
      if (!nesneMi(d) || fazlaAlan(d, ['bas', 'bit']) || !gunMu(d.bas) || !gunMu(d.bit) || d.bas > d.bit) {
        return red('donma', `donmalar[${i}]`);
      }
    }
  }

  if (!Array.isArray(s.ogrenciler) || s.ogrenciler.length > SINIR.ogrenci) return red('ogrenciler', 'ogrenciler');
  const idler = new Set();
  const semboller = new Set();
  for (let i = 0; i < s.ogrenciler.length; i++) {
    const o = s.ogrenciler[i];
    const yol = `ogrenciler[${i}]`;
    if (!nesneMi(o)) return red('ogrenci', yol);
    const fo = fazlaAlan(o, ['id', 'sembol', 'renk', 'yas']);
    if (fo) return red('alan', `${yol}.${fo}`);
    if (typeof o.id !== 'string' || !OID_DESEN.test(o.id)) return red('oid', `${yol}.id`);
    if (!SEMBOLLER.includes(o.sembol)) return red('sembol', `${yol}.sembol`);
    if (!RENKLER.includes(o.renk)) return red('renk', `${yol}.renk`);
    if (!YAS_GRUPLARI.includes(o.yas)) return red('yas', `${yol}.yas`);
    if (idler.has(o.id)) return red('tekrar', `${yol}.id`);
    if (semboller.has(o.sembol)) return red('tekrar', `${yol}.sembol`);
    idler.add(o.id);
    semboller.add(o.sembol);
  }
  return TAMAM;
}

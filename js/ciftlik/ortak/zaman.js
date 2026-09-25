// Çiftçi Fare — gün hesabı (saf). Saat dışarıdan ms olarak verilir; burada "şimdi" okunmaz.
// Gün numarası: sınıfın saat diliminde takvim günü → Date.UTC(yıl, ay, gün) / 864e5.

export const VARSAYILAN_TZ = 'Europe/Istanbul';
const GUN_MS = 864e5;

const bicimler = new Map();
function bicim(tz) {
  let b = bicimler.get(tz);
  if (!b) {
    b = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', era: 'short',
    });
    bicimler.set(tz, b);
  }
  return b;
}

/** Geçerli bir IANA saat dilimi mi? */
export function tzGecerli(tz) {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false;
  try { bicim(tz); return true; } catch { return false; }
}

/** ms (epoch) → sınıfın saat dilimindeki gün numarası. */
export function gunNo(ms, tz = VARSAYILAN_TZ) {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) throw new TypeError('gunNo: ms sayı olmalı');
  let yil = 0, ay = 0, gun = 0, era = 'AD';
  for (const p of bicim(tz).formatToParts(new Date(ms))) {
    if (p.type === 'year') yil = Number(p.value);
    else if (p.type === 'month') ay = Number(p.value);
    else if (p.type === 'day') gun = Number(p.value);
    else if (p.type === 'era') era = p.value;
  }
  if (era === 'BC' || era === 'B') yil = 1 - yil;
  return utcGun(yil, ay, gun);
}

// Date.UTC(yıl, …) 0–99 yıllarını 1900'e kaydırır; setUTCFullYear kaydırmaz.
function utcGun(yil, ay, gun) {
  const t = new Date(0);
  t.setUTCFullYear(yil, ay - 1, gun);
  return Math.round(t.getTime() / GUN_MS);
}

/** Gün numarası → 'YYYY-AA-GG'. */
export function gunTarih(g) {
  return new Date(g * GUN_MS).toISOString().slice(0, 10);
}

/** 'YYYY-AA-GG' → gün numarası. */
export function tarihGun(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  if (!m) throw new TypeError('tarihGun: YYYY-AA-GG bekleniyor');
  const g = utcGun(+m[1], +m[2], +m[3]);
  // 2026-02-31 gibi olmayan tarihler sessizce 3 Mart'a kaymasın.
  if (gunTarih(g) !== m[0]) throw new RangeError('tarihGun: geçersiz tarih ' + m[0]);
  return g;
}

/** ISO haftanın günü: 1 = Pazartesi … 7 = Pazar. (Gün 0 = 1970-01-01, Perşembe.) */
export function haftaGunu(g) {
  return (((g + 3) % 7) + 7) % 7 + 1;
}

/** Sınıf belgesinden takvim ayarı. */
export function takvimAl(sinif) {
  const takvim = sinif?.ayarlar?.takvim === 'her-gun' ? 'her-gun' : 'okul-gunleri';
  const donmalar = Array.isArray(sinif?.donmalar) ? sinif.donmalar : [];
  return { takvim, donmalar };
}

function ayarAl(ayar) {
  if (!ayar) return { takvim: 'okul-gunleri', donmalar: [] };
  if (ayar.ayarlar || ayar.konu !== undefined) return takvimAl(ayar); // sınıf belgesi verilmiş
  return {
    takvim: ayar.takvim === 'her-gun' ? 'her-gun' : 'okul-gunleri',
    donmalar: Array.isArray(ayar.donmalar) ? ayar.donmalar : [],
  };
}

// Donma (tatil) aralıklarını sıralayıp birleştirir. ÖNBELLEK YOK: dizi yerinde değiştirilirse
// (öğretmen paneli push ederse) dizi kimliğine bağlı bir önbellek bayat sonuç verirdi. En çok 64 kayıt.
function donmaBirlestir(donmalar) {
  if (!donmalar.length) return [];
  const a = donmalar
    .filter((d) => d && Number.isInteger(d.bas) && Number.isInteger(d.bit) && d.bas <= d.bit)
    .map((d) => [d.bas, d.bit])
    .sort((x, y) => x[0] - y[0]);
  const s = [];
  for (const [b, e] of a) {
    const son = s[s.length - 1];
    if (son && b <= son[1] + 1) son[1] = Math.max(son[1], e);
    else s.push([b, e]);
  }
  return s;
}

// Pazartesi hizalı bir çıpadan (gün −3 = 1969-12-29 Pazartesi) g'ye kadar (dahil) hafta içi günü sayısı.
// Farkları doğru olduğu sürece negatif değer alması sorun değildir.
function haftaIciBirikim(g) {
  const n = g + 3 + 1; // [−3, g] aralığındaki gün sayısı
  const hafta = Math.floor(n / 7);
  const kalan = n - hafta * 7;
  return hafta * 5 + Math.min(kalan, 5);
}

function hamSay(bas, bit, takvim) {
  if (bit <= bas) return 0;
  return takvim === 'her-gun' ? bit - bas : haftaIciBirikim(bit) - haftaIciBirikim(bas);
}

function aktifMiIc(g, takvim, birlesik) {
  if (takvim !== 'her-gun' && haftaGunu(g) > 5) return false;
  for (const [b, e] of birlesik) if (g >= b && g <= e) return false;
  return true;
}

/** Tek bir gün aktif mi (okul günü / her gün, donma dışı)? */
export function aktifMi(g, ayar) {
  const a = ayarAl(ayar);
  return aktifMiIc(g, a.takvim, donmaBirlestir(a.donmalar));
}

/** (bas, bit] aralığındaki aktif günleri artan sırayla verir; en çok 'tavan' gün (tatilde döngü kısa kesilir). */
export function aktifGunler(bas, bit, ayar, tavan = Infinity) {
  const a = ayarAl(ayar);
  const birlesik = donmaBirlestir(a.donmalar);
  const out = [];
  for (let g = bas + 1; g <= bit && out.length < tavan; g++) {
    if (a.takvim !== 'her-gun' && haftaGunu(g) > 5) continue;
    const d = birlesik.find(([b, e]) => g >= b && g <= e);
    if (d) { g = d[1]; continue; } // tatilin sonuna atla
    out.push(g);
  }
  return out;
}

/**
 * (bas, bit] aralığındaki aktif gün sayısı: bas günü sayılmaz, bit günü sayılır.
 * Örnek: Cuma ekilen tohum Pazartesi 'okul-gunleri'nde 1, 'her-gun'de 3 aktif gün.
 */
export function aktifGunSay(bas, bit, ayar) {
  if (!Number.isInteger(bas) || !Number.isInteger(bit)) throw new TypeError('aktifGunSay: tam sayı gün bekleniyor');
  if (bit <= bas) return 0;
  const a = ayarAl(ayar);
  let n = hamSay(bas, bit, a.takvim);
  for (const [b, e] of donmaBirlestir(a.donmalar)) {
    const lo = Math.max(b - 1, bas);
    const hi = Math.min(e, bit);
    if (hi > lo) n -= hamSay(lo, hi, a.takvim);
  }
  return n;
}

/** bas'tan sonraki n. aktif gün (n ≥ 1). n ≤ 0 → bas. */
export function aktifGunEkle(bas, n, ayar) {
  if (!Number.isInteger(bas) || typeof n !== 'number' || Number.isNaN(n)) throw new TypeError('aktifGunEkle: tam sayı bekleniyor');
  if (n <= 0) return bas;
  n = Math.ceil(n); // 1.5 → 2: kesirli n sonsuz döngüye girmesin
  const a = ayarAl(ayar);
  const birlesik = donmaBirlestir(a.donmalar);
  let g = bas;
  let say = 0;
  for (let i = 0; i < 100000; i++) {
    g += 1;
    if (aktifMiIc(g, a.takvim, birlesik) && ++say === n) return g;
  }
  throw new Error('aktifGunEkle: aktif gün bulunamadı');
}

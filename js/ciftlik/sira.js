/* Çiftçi Fare — sıra ve ziyaret önerileri (sira.js). SAF: DOM, three ve Date.now yok.

   Plan: "Sınıf akışı" (tahtada sıra) ve "ZİYARET" (arkadaş seçimi).
   Zar YOK: aynı veri her seferinde aynı öneriyi verir.

   siraOner(ozet, oynayanlar, bugun) → oid | null
     'Kim oynuyor?' ekranının büyük (önerilen) kartı. Öncelik: bugün oynamamış
     olmak > en uzun süredir oynamamış olmak (sonGun; hiç oynamamış en önde) >
     eşitlikte haftaya göre dönen liste sırası (hep aynı çocuk ilk olmasın).

   ziyaretSayilari(ciftlikler, bugun, {gun}) → {oid: son 'gun' günde alınan ziyaret}
   ziyaretOner(adaylar, {ben, bugun, n}) → oid listesi (hepsi, öneri sırasıyla)
     Arkadaş ızgarasının ilk n kartı (varsayılan 3) EN AZ ZİYARET ALAN
     çiftliklerdir: kimse hep unutulmasın, sınıf önünde sıralama gibi
     okunmasın (ızgarada sayı ya da evre gösterilmez). Eşitlikte sıra
     ziyaretçiye ve güne göre döner: aynı gün iki çocuk aynı üç arkadaşı
     görmez, aynı çocuk da her gün aynı üçü görmez. */

/** Metinden 32 bit karma (FNV-1a): belirlenimci dönüş için. */
function karma(s) {
  let h = 0x811c9dc5;
  const t = String(s);
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/**
 * Sıra önerisi (saf, belirlenimci).
 * @param ozet       depo.sinifOzet(): [{oid, sonGun, ...}] (sınıf listesi sırasıyla)
 * @param oynayanlar bugün oynayan oid'ler
 * @param bugun      gün numarası
 * @returns oid | null (herkes oynadıysa)
 */
export function siraOner(ozet, oynayanlar = [], bugun = 0) {
  const n = ozet.length;
  if (!n) return null;
  const oynadi = new Set(oynayanlar);
  const hafta = Math.floor((bugun + 3) / 7);            // Pazartesi başlayan hafta numarası
  const kaydir = ((hafta % n) + n) % n;
  const adaylar = ozet.map((o, i) => ({ o, sira: (i - kaydir + n) % n })).filter(x => !oynadi.has(x.o.oid));
  if (!adaylar.length) return null;
  const son = x => (Number.isInteger(x.o.sonGun) ? x.o.sonGun : -Infinity);
  adaylar.sort((a, b) => son(a) - son(b) || a.sira - b.sira);
  return adaylar[0].o.oid;
}

/** Ziyaret önerisinin baktığı pencere: son 7 gün (bir hafta). */
export const ZIYARET_PENCERE = 7;

/**
 * Her çiftliğin son 'gun' günde aldığı ziyaret sayısı (kişi-gün: aynı ziyaretçinin
 * aynı günkü sulama ve çıkartması tek ziyarettir; ortak/uygula.js zaten tek kayıtta birleştirir).
 * @param ciftlikler {oid: çiftlik belgesi | null}
 */
export function ziyaretSayilari(ciftlikler, bugun, { gun = ZIYARET_PENCERE } = {}) {
  const out = {};
  for (const [oid, d] of Object.entries(ciftlikler || {})) {
    let n = 0;
    for (const z of Array.isArray(d?.ziyaretler) ? d.ziyaretler : []) {
      if (Number.isInteger(z?.gun) && z.gun <= bugun && z.gun > bugun - gun) n++;
    }
    out[oid] = n;
  }
  return out;
}

/**
 * Arkadaş önerisi (saf, belirlenimci).
 * @param adaylar [{oid, ziyaret}] — ziyaret: alınan ziyaret sayısı (ziyaretSayilari); sınıf listesi sırasıyla
 * @param ben     ziyaret eden çocuğun oid'i (listeden çıkarılır)
 * @param bugun   gün numarası
 * @returns bütün arkadaşların oid listesi, öneri sırasıyla (ilk n'i ızgarada büyük kart)
 */
export function ziyaretOner(adaylar = [], { ben = null, bugun = 0 } = {}) {
  const liste = adaylar.filter(a => a && a.oid && a.oid !== ben);
  const n = liste.length;
  if (!n) return [];
  // Eşitlikte dönüş: ziyaretçiye ve güne bağlı başlangıç (liste sırasında kaydırma).
  const kaydir = (karma(`${ben}`) + Math.imul(bugun | 0, 7)) % n;
  const sayi = a => (Number.isFinite(a.ziyaret) ? a.ziyaret : 0);
  return liste
    .map((a, i) => ({ a, sira: (i - kaydir + n) % n }))
    .sort((x, y) => sayi(x.a) - sayi(y.a) || x.sira - y.sira)
    .map(x => x.a.oid);
}

// Çiftçi Fare — parsel toprak durumu (SAF). Girdiyi değiştirmez, yeni parsel döndürür.
// Döngü: sert → çapa → yumuşak → ek → (büyür) → hasat
//   'tek' hasatlı ekin (buğday): hasat → anız → çapa → yumuşak → yeniden ekim
//   'yeniden' hasatlı ekin (domates): bitki kalır, ürün yeniden olgunlaşır
//   çocuğun cevizi hasat edilmez.
import { turAl, TOPRAKLAR } from './turler.js';

export function bosParsel(toprak = 'sert', capaGun = null) {
  return { toprak, capaGun, bitki: null };
}

/** Parselin toprak görünüşü ve yapılabilecek toprak işleri. */
export function toprakDurum(parsel) {
  const toprak = TOPRAKLAR.includes(parsel?.toprak) ? parsel.toprak : 'sert';
  const bitkiVar = !!parsel?.bitki;
  return {
    toprak,
    bitkiVar,
    capaGerek: !bitkiVar && toprak !== 'yumusak',
    ekilebilir: !bitkiVar && toprak === 'yumusak',
    aniz: !bitkiVar && toprak === 'aniz',
  };
}

/** Çapa: sert ya da anız toprağı yumuşatır. Zaten yumuşaksa değişiklik yok (tamam). */
export function capala(parsel, gun) {
  if (parsel.bitki) return { red: 'dolu' };
  if (parsel.toprak === 'yumusak') return { parsel: { ...parsel }, degisti: false };
  return { parsel: { ...parsel, toprak: 'yumusak', capaGun: gun }, degisti: true };
}

/** Yeni bitki kaydı. */
export function yeniBitki(tur, ekimGun, uniteGun) {
  const t = turAl(tur);
  if (!t) throw new Error('yeniBitki: bilinmeyen tür ' + tur);
  return {
    tur,
    ekimGun,
    uniteGun: t.sabit ? null : uniteGun,
    su: [],
    otAyiklama: null,
    isler: {},
    hasat: [],
    gorulenEvre: 0,
  };
}

/** Ekim: yalnız yumuşak, boş toprağa. */
export function ek(parsel, tur, gun, uniteGun) {
  if (!turAl(tur)) return { red: 'tur' };
  if (parsel.bitki) return { red: 'dolu' };
  if (parsel.toprak !== 'yumusak') return { red: 'toprak-sert' };
  return { parsel: { ...parsel, bitki: yeniBitki(tur, gun, uniteGun) } };
}

/** Tek hasatlı ekinden sonra: bitki kalkar, anız kalır. */
export function anizaDon(parsel) {
  return { ...parsel, toprak: 'aniz', bitki: null };
}

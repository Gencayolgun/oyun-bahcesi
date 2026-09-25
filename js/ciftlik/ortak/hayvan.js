// Çiftçi Fare — kümes (SAF). Yem ve su gün kümesi olarak tutulur; yumurta sayısı SAKLANMAZ, hesaplanır.
// Yumurta: her aktif gün 1–3 (sahip kimliği ve güne bağlı, belirlenimci), follukta en çok YUMURTA_TAVAN bekler.
// Bakım yumurtayı durdurmaz: 'Günü bitir'de çiftlik ailesi aç kalan hayvanı besler.
import { YUMURTA_TAVAN } from './turler.js';
import { aktifGunler, takvimAl } from './zaman.js';

/** FNV-1a 32 bit — belirlenimci küçük karma. */
export function karma(s) {
  let h = 0x811c9dc5;
  const str = String(s);
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Bir aktif günde yumurtlanan sayı: 1..3. */
export function gunlukYumurta(tohum, gun) {
  return 1 + (karma(tohum + ':' + gun) % 3);
}

/** (sonToplama, bugun] aralığındaki aktif günlerde birikmiş yumurta (tavanla). */
export function yumurtaSayisi(kumes, bugun, sinif, tohum) {
  const ayar = takvimAl(sinif);
  const bas = Number.isInteger(kumes?.sonToplama) ? kumes.sonToplama : bugun;
  if (!Number.isInteger(bugun)) return 0;
  let n = 0;
  // Her aktif gün en az 1 yumurta verir: tavana ulaşmak için en çok YUMURTA_TAVAN aktif güne bakmak yeter.
  for (const g of aktifGunler(bas, bugun, ayar, YUMURTA_TAVAN)) n += gunlukYumurta(tohum, g);
  return Math.min(n, YUMURTA_TAVAN);
}

export function acMi(kumes, bugun) {
  return !(Array.isArray(kumes?.yem) && kumes.yem.includes(bugun));
}

export function susuzMu(kumes, bugun) {
  return !(Array.isArray(kumes?.su) && kumes.su.includes(bugun));
}

/** Kümesin bugünkü durumu. Ölü ya da hasta durumu yoktur. */
export function kumesDurum(kumes, bugun, sinif, tohum) {
  const ac = acMi(kumes, bugun);
  const susuz = susuzMu(kumes, bugun);
  const yumurta = yumurtaSayisi(kumes, bugun, sinif, tohum);
  const ihtiyaclar = [];
  if (ac) ihtiyaclar.push('yem');
  if (susuz) ihtiyaclar.push('suluk');
  if (yumurta > 0) ihtiyaclar.push('yumurta');
  return { ac, susuz, yumurta, ihtiyaclar };
}

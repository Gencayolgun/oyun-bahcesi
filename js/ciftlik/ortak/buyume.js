// Çiftçi Fare — büyüme hesabı (SAF). Evre, susuzluk, ot ve olgunluk SAKLANMAZ; her yerde buradan hesaplanır.
// Kurallar:
// - Büyüme takvimle yürür: evre yalnız ekim gününden bu yana geçen aktif güne bağlıdır.
// - Bakım (su, ot, destek) büyümeyi ne durdurur ne hızlandırır; susuzluk yalnız görünüştür.
// - Evre asla azalmaz; ölü durumu yoktur; olgun ürün süresiz bekler.
import {
  turAl, esikler, SUSAMA_GUN, OT_GUN, OT_TAVAN,
} from './turler.js';
import { aktifGunSay, takvimAl } from './zaman.js';

/** Gün kümesinde (ve varsa sıkıştırma özetinde) g'den büyük olmayan en son gün; yoksa null. */
export function sonGun(gunler, ozet, g) {
  let son = null;
  if (Array.isArray(gunler)) {
    for (const x of gunler) if (x <= g && (son === null || x > son)) son = x;
  }
  if (ozet && Number.isInteger(ozet.son) && ozet.son <= g && (son === null || ozet.son > son)) son = ozet.son;
  return son;
}

function evreNo(es, a) {
  for (let i = es.length - 1; i > 0; i--) if (a >= es[i]) return i;
  return 0;
}

/**
 * evre(bitki, bugun, sinif) → görünüş ve ihtiyaçlar.
 * bitki: {tur, ekimGun, uniteGun, su:[gün], otAyiklama, isler:{destek}, hasat:[gün], gorulenEvre, ozet?}
 */
export function evre(bitki, bugun, sinif) {
  const t = turAl(bitki?.tur);
  if (!t) throw new Error('evre: bilinmeyen tür ' + bitki?.tur);
  const ayar = takvimAl(sinif);
  const ekim = bitki.ekimGun;
  const aktifGun = aktifGunSay(ekim, bugun, ayar);
  const es = esikler(t, bitki.uniteGun);
  const son = t.evreler.length - 1;
  // Taban: çocuğun GÖRDÜĞÜ evre (gorulenEvre) asla geri gitmez. Öğretmen takvimi 'her-gun' → 'okul-gunleri'
  // yaparsa ya da geçmişe tatil eklerse aktif gün sayısı düşer; hesap tabanın altına inemez.
  const taban = Number.isInteger(bitki.gorulenEvre) ? Math.min(Math.max(bitki.gorulenEvre, 0), son) : 0;
  const no = Math.max(evreNo(es, aktifGun), taban);
  const olgun = no === son;

  // Hasat ve ürün döngüsü
  let hasatHazir = false;
  let urun = null;
  let sonrakiUrunGun = null; // hasattan bu yana kaç aktif gün sonra ürün hazır olur
  if (t.hasat === 'tek') {
    hasatHazir = olgun;
  } else if (t.hasat === 'yeniden') {
    const sonHasat = sonGun(bitki.hasat, bitki.ozet?.hasat, bugun);
    const dongu = t.yeniden;
    if (sonHasat === null) {
      if (olgun) { urun = dongu[dongu.length - 1].ad; hasatHazir = true; }
    } else {
      const h = aktifGunSay(sonHasat, bugun, ayar);
      let d = dongu[0];
      for (const x of dongu) if (h >= x.esik) d = x;
      urun = d.ad;
      hasatHazir = !!d.hazir;
      if (!hasatHazir) sonrakiUrunGun = dongu[dongu.length - 1].esik - h;
    }
  }

  // Susuzluk (yalnız görünüş)
  let susamis = false;
  if (!t.suIstemez.includes(no)) {
    const sonSu = sonGun(bitki.su, bitki.ozet?.su, bugun);
    const ref = sonSu === null || sonSu < ekim ? ekim : sonSu;
    susamis = aktifGunSay(ref, bugun, ayar) >= SUSAMA_GUN;
  }

  // Ot (bitkiye zarar vermez)
  let ot = 0;
  if (!t.otYok) {
    const ay = Number.isInteger(bitki.otAyiklama) && bitki.otAyiklama <= bugun && bitki.otAyiklama > ekim
      ? bitki.otAyiklama : ekim;
    ot = Math.min(OT_TAVAN, Math.floor(aktifGunSay(ay, bugun, ayar) / OT_GUN));
  }

  const destekGerek = Number.isInteger(t.destek) && no >= t.destek && !Number.isInteger(bitki.isler?.destek);
  const gorulen = taban;

  const ihtiyaclar = [];
  if (susamis) ihtiyaclar.push('sula');
  if (ot > 0) ihtiyaclar.push('ot');
  if (destekGerek) ihtiyaclar.push('destek');
  if (hasatHazir) ihtiyaclar.push('hasat');

  return {
    tur: t.kod,
    no,
    ad: t.evreler[no],
    son,
    olgun,
    aktifGun,
    susamis,
    ot,
    destekGerek,
    destekVar: Number.isInteger(bitki.isler?.destek),
    hasatHazir,
    urun,
    sonrakiUrunGun,
    gorulenEvre: gorulen,
    yeniEvre: no > gorulen, // 'sabah sürprizi'
    ihtiyaclar,
  };
}

/** Dede Ceviz'i büyüme hesabı için bitki gibi gösterir (çiftlik kuruluşundan beri olgun ağaç). */
export function dedeBitki(durum) {
  return {
    tur: 'dede-ceviz',
    ekimGun: durum.olusturmaGun,
    uniteGun: null,
    hasat: durum.dede?.hasat ?? [],
    ozet: durum.dede?.ozet,
  };
}

export function dedeEvre(durum, bugun, sinif) {
  return evre(dedeBitki(durum), bugun, sinif);
}

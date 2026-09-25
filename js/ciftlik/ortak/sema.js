// Çiftçi Fare — çiftlik belgesi şeması (SAF): yeni belge, şema geçişi, sıkıştırma.
import {
  SEMA, SIKISTIR_GUN, PARSELLER, AMBAR_ANAHTARLARI, turAl, VARSAYILAN_UNITE, UNITE_GUNLERI,
} from './turler.js';
import { bosParsel } from './toprak.js';

/** JSON belgesinin derin kopyası (anahtar sırası korunur → bayt bayt aynı yazılır). */
export function klon(x) {
  return x === undefined ? undefined : JSON.parse(JSON.stringify(x));
}

/** Gün kümesine gün ekler: yeni, sıralı, tekrarsız dizi. Birleşim sıradan bağımsız ve tekrara dayanıklıdır. */
export function gunEkle(dizi, g) {
  const a = Array.isArray(dizi) ? dizi : [];
  if (a.includes(g)) return a.slice();
  return [...a, g].sort((x, y) => x - y);
}

/** İki gün kümesinin birleşimi (sıralı, tekrarsız). */
export function gunBirlesim(a, b) {
  return [...new Set([...(a || []), ...(b || [])])].sort((x, y) => x - y);
}

/** Yeni çiftlik belgesi. Adsız: yalnız rastgele oid. */
export function yeniCiftlik(oid, bugun) {
  if (!Number.isInteger(bugun)) throw new TypeError('yeniCiftlik: bugun tam sayı gün olmalı');
  return {
    sema: SEMA,
    surum: 0,
    sahip: oid,
    olusturmaGun: bugun,
    parseller: {
      konu: { ...bosParsel('sert'), konuBas: null },
      t1: bosParsel('sert'),
      t2: bosParsel('sert'),
    },
    dede: { hasat: [] },
    kumes: { yem: [], su: [], sonToplama: bugun },
    ambar: { ceviz: 0, bugday: 0, domates: 0, yumurta: 0 },
    ziyaretler: [],
    gorulenZiyaret: null,
    anilar: [],
    cihazSeq: {},
  };
}

function nesne(x) {
  return x && typeof x === 'object' && !Array.isArray(x) ? x : null;
}
function gunDizisi(x) {
  return Array.isArray(x) ? [...new Set(x.filter(Number.isInteger))].sort((a, b) => a - b) : [];
}
function tamSayiYaNull(x) {
  return Number.isInteger(x) ? x : null;
}

function bitkiGoc(b) {
  const x = nesne(b);
  const t = turAl(x?.tur); // 'constructor' gibi prototip adları tür değildir
  if (!x || !t || !Number.isInteger(x.ekimGun)) return null;
  const out = {
    tur: x.tur,
    ekimGun: x.ekimGun,
    // Liste dışı süre (ör. 7) varsayılana iner: evre zaten öyle hesaplanıyordu, belge yeniden geçerli olur.
    uniteGun: t.sabit ? null : (UNITE_GUNLERI.includes(x.uniteGun) ? x.uniteGun : VARSAYILAN_UNITE),
    su: gunDizisi(x.su),
    otAyiklama: tamSayiYaNull(x.otAyiklama),
    isler: nesne(x.isler) ? { ...x.isler } : {},
    hasat: gunDizisi(x.hasat),
    gorulenEvre: Number.isInteger(x.gorulenEvre) ? x.gorulenEvre : 0,
  };
  if (nesne(x.ozet)) out.ozet = klon(x.ozet);
  return out;
}

function parselGoc(p, varsayilan) {
  const x = nesne(p) || {};
  const out = {
    toprak: ['sert', 'yumusak', 'aniz'].includes(x.toprak) ? x.toprak : varsayilan.toprak,
    capaGun: tamSayiYaNull(x.capaGun),
    bitki: bitkiGoc(x.bitki),
  };
  if ('konuBas' in varsayilan) out.konuBas = tamSayiYaNull(x.konuBas);
  return out;
}

/**
 * Şema geçişi: eski ya da eksik alanlı belgeyi güncel şemaya getirir (yeni nesne).
 * Güncel ve eksiksiz bir belge JSON olarak aynen döner. İleri sürüm belge reddedilir.
 */
export function goc(durum) {
  const d = nesne(durum);
  if (!d) throw new TypeError('goc: belge nesne değil');
  const sema = Number.isInteger(d.sema) ? d.sema : 0;
  if (sema > SEMA) throw new Error('sema-ileri');
  const olusturmaGun = Number.isInteger(d.olusturmaGun) ? d.olusturmaGun : 0;
  const sablon = yeniCiftlik(typeof d.sahip === 'string' ? d.sahip : '', olusturmaGun);

  const parseller = {};
  for (const p of PARSELLER) parseller[p] = parselGoc(d.parseller?.[p], sablon.parseller[p]);

  const dede = { hasat: gunDizisi(d.dede?.hasat) };
  if (nesne(d.dede?.ozet)) dede.ozet = klon(d.dede.ozet);

  const kumes = {
    yem: gunDizisi(d.kumes?.yem),
    su: gunDizisi(d.kumes?.su),
    sonToplama: Number.isInteger(d.kumes?.sonToplama) ? d.kumes.sonToplama : olusturmaGun,
  };
  if (nesne(d.kumes?.ozet)) kumes.ozet = klon(d.kumes.ozet);

  const ambar = {};
  for (const k of AMBAR_ANAHTARLARI) {
    const v = d.ambar?.[k];
    ambar[k] = Number.isInteger(v) && v >= 0 ? v : 0;
  }

  return {
    sema: SEMA,
    surum: Number.isInteger(d.surum) ? d.surum : 0,
    sahip: sablon.sahip,
    olusturmaGun,
    parseller,
    dede,
    kumes,
    ambar,
    ziyaretler: Array.isArray(d.ziyaretler) ? klon(d.ziyaretler) : [],
    gorulenZiyaret: tamSayiYaNull(d.gorulenZiyaret),
    anilar: Array.isArray(d.anilar) ? klon(d.anilar) : [],
    cihazSeq: nesne(d.cihazSeq) ? { ...d.cihazSeq } : {},
  };
}

// Bir gün kümesini sıkıştırır: sınırdan eski günler özete iner, özet en son eski günü (son) tutar.
// Büyüme hesabı yalnız 'bugüne kadarki en son gün'e baktığı için sonuç değişmez.
function kumeSikistir(gunler, ozet, sinir) {
  const a = Array.isArray(gunler) ? gunler : [];
  const eski = a.filter((g) => g < sinir);
  if (!eski.length) return null;
  const kalan = a.filter((g) => g >= sinir);
  const o = nesne(ozet) || { sayi: 0, ilk: null, son: null };
  return {
    gunler: kalan,
    ozet: {
      sayi: (o.sayi || 0) + eski.length,
      ilk: o.ilk === null || o.ilk === undefined ? Math.min(...eski) : Math.min(o.ilk, ...eski),
      son: o.son === null || o.son === undefined ? Math.max(...eski) : Math.max(o.son, ...eski),
    },
  };
}

function sahibiSikistir(sahip, alanlar, sinir) {
  let degisti = false;
  const yeni = { ...sahip };
  for (const alan of alanlar) {
    const s = kumeSikistir(sahip[alan], sahip.ozet?.[alan], sinir);
    if (!s) continue;
    degisti = true;
    yeni[alan] = s.gunler;
    yeni.ozet = { ...(yeni.ozet || {}), [alan]: s.ozet };
  }
  return degisti ? yeni : sahip;
}

/**
 * 120 günden eski gün kümelerini özete indirir (yeni nesne). Evre, susuzluk, ot, hasat ve kümes
 * hesapları bugün ve sonrası için DEĞİŞMEZ.
 */
export function sikistir(durum, bugun) {
  const d = klon(durum);
  sikistirYerinde(d, bugun);
  return d;
}

/** sikistir'in yerinde çalışanı (uygula kendi klonu üstünde her başarılı komuttan sonra çağırır). */
export function sikistirYerinde(d, bugun) {
  if (!Number.isInteger(bugun)) throw new TypeError('sikistir: bugun tam sayı gün olmalı');
  const sinir = bugun - SIKISTIR_GUN;
  for (const p of PARSELLER) {
    const parsel = d.parseller?.[p];
    if (parsel?.bitki) parsel.bitki = sahibiSikistir(parsel.bitki, ['su', 'hasat'], sinir);
  }
  if (d.dede) d.dede = sahibiSikistir(d.dede, ['hasat'], sinir);
  if (d.kumes) d.kumes = sahibiSikistir(d.kumes, ['yem', 'su'], sinir);
  return d;
}

/* Çiftçi Fare — bitki evre modelleri (bitki3b.js).

   Plan: "Konu tohumları" ve "Harita/KURALLAR" (ekin bitkileri parsel başına
   parça-InstancedMesh). Bitkiler GERÇEĞİNE benzesin:

   CEVİZ (çocuğun kendi fidanı; ünite boyunca meyve VERMEZ)
     tohum     toprakta yarı gömülü buruşuk ceviz, küçük tümsek
     cimlenme  yüzeyde çatlamış toprak, açılmış kabuk, kıvrık beyaz-yeşil filiz
     filiz     ince gövde, karşılıklı iki yaprak
     fidan     boylanan gövde, bileşik (tüysü) yapraklar; destek çubuğu (iş)
     genc-agac gri-kahve gövde, dallar, tüysü yaprak tacı; destek çubuğu kalır
   BUĞDAY (serpme ekim)
     serpme-ekim toprağa saçılmış taneler · cimlenme ince yeşil iğneler ·
     yesil-sap kardeşlenen yeşil sap demetleri · basak yeşil başaklar ·
     sararma altın sarısı, eğik başaklar · (hasattan sonra anız: parsel.js)
   DOMATES
     fide · buyume · destek (sırık yoksa bitki yana yatar) · cicek (sarı
     yıldız çiçekler) · yesil (yeşil domates) · kirmizi (iri, parlak, YILDIZ
     SAPLI kırmızı domates: renk tek ipucu değil)
     Hasattan sonra ürün yeniden olgunlaşır: çiçek → yeşil → kırmızı.
   DEDE CEVİZ (çiftliğin olgun ağacı; gövde ve taç mekan.js'te)
     puskul-cicek sarkık yeşil püsküller (rüzgârla tozlaşır, ARI YOK) ·
     yesil-kabuk yeşil kabuklu cevizler · catlak-kabuk kabuğu çatlamış,
     içinden kahverengi ceviz görünen, yere de düşmüş cevizler
   SUSAMIŞ görünüş: yapraklar sarkık ve soluk (ölüm yok; tek sulamayla geçer).
   OT: küçük yabani ot kümeleri (karahindiba yaprağı + çim).

   Parça sistemi: her model yerel koordinatta bir PARÇA listesidir
   {g: geometri, r: renk, p: [x,y,z], yon?: [dx,dy,dz] (+Y bu yöne),
    don?: kendi ekseni etrafında dönüş, yuz?: yaprak yüzü yukarı, boy: [sx,sy,sz]}.
   ornekCiz() parçaları (geometri, renk) çiftine göre toplar ve her çift için
   TEK InstancedMesh kurar: bir parseldeki 9 bitki 3-6 çizim çağrısıdır.
   three yalnız a.THREE'den gelir (dunya.js dışında three içe aktarılmaz). */

import {karma} from './ortak/hayvan.js';

/* ——————————————————————————— rastgele (belirlenimci) ——————————————————————————— */
export function tohumlu(tohum) {
  let a = (typeof tohum === 'number' ? tohum : karma(String(tohum))) >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.ara = (a0, b0) => a0 + r() * (b0 - a0);
  return r;
}

/* ——————————————————————————— geometriler (kalıcı, paylaşılan) ——————————————————————————— */
const GEO = new Map();
const CIFT_YUZ = new Set(['yaprak', 'bicak', 'yildiz']);

function yaprakGeo(THREE) {
  // Taban (0,0,0), uç (0,1,0); genişlik x'te, yüz normali +z; orta damar hafif kabarık.
  const c = [[0, 0, 0], [0, .2, .03], [0, .47, .045], [0, .74, .03], [0, 1, 0]];
  const s = [[0, 0, 0], [-.2, .2, -.015], [-.27, .47, -.02], [-.19, .74, -.015], [0, 1, 0]];
  const k = [];
  const tri = (a, b, d) => k.push(...a, ...b, ...d);
  for (const yan of [1, -1]) {
    const e = s.map(([x, y, z]) => [x * yan, y, z]);
    for (let i = 0; i < 4; i++) {
      if (yan > 0) { tri(c[i], e[i + 1], e[i]); tri(c[i], c[i + 1], e[i + 1]); }
      else { tri(c[i], e[i], e[i + 1]); tri(c[i], e[i + 1], c[i + 1]); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(k, 3));
  g.computeVertexNormals();
  return g;
}
function bicakGeo(THREE) {
  // Çim/buğday yaprağı: taban genişliği 1 (x), boy 1 (y), uca doğru daralır ve +z'ye kıvrılır.
  const sira = [0, .34, .68, 1].map(t => ({ w: t < 1 ? .5 * (1 - t) + .03 : 0, y: t, z: t * t }));
  const k = [];
  const tri = (a, b, d) => k.push(...a, ...b, ...d);
  for (let i = 0; i < 3; i++) {
    const a0 = sira[i], b0 = sira[i + 1];
    const la = [-a0.w, a0.y, a0.z], ra = [a0.w, a0.y, a0.z], lb = [-b0.w, b0.y, b0.z], rb = [b0.w, b0.y, b0.z];
    tri(la, ra, rb);
    if (b0.w > 0) tri(la, rb, lb);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(k, 3));
  g.computeVertexNormals();
  return g;
}
function yildizGeo(THREE) {
  // Düz beş köşeli yıldız (xz düzleminde, normal +y): domates çanağı ve çiçeği.
  const k = [];
  const orta = [0, .12, 0];
  for (let i = 0; i < 10; i++) {
    const a0 = i / 10 * Math.PI * 2, a1 = (i + 1) / 10 * Math.PI * 2;
    const r0 = i % 2 ? .42 : 1, r1 = i % 2 ? 1 : .42;
    k.push(...orta, Math.cos(a1) * r1, 0, Math.sin(a1) * r1, Math.cos(a0) * r0, 0, Math.sin(a0) * r0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(k, 3));
  g.computeVertexNormals();
  return g;
}

export function geometri(THREE, ad) {
  let g = GEO.get(ad);
  if (g) return g;
  switch (ad) {
    case 'kure0': g = new THREE.IcosahedronGeometry(1, 0); break;
    case 'kure1': g = new THREE.IcosahedronGeometry(1, 1); break;
    case 'sap': g = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true).translate(0, .5, 0); break;
    case 'govde': g = new THREE.CylinderGeometry(.62, 1, 1, 7, 1, true).translate(0, .5, 0); break;
    case 'koni': g = new THREE.ConeGeometry(1, 1, 6, 1).translate(0, .5, 0); break;
    case 'kutu': g = new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0); break;
    case 'disk': g = new THREE.CylinderGeometry(1, 1, 1, 12, 1).translate(0, .5, 0); break;
    case 'sepet': g = new THREE.CylinderGeometry(1, .78, 1, 12, 1, true).translate(0, .5, 0); break;
    case 'yaprak': g = yaprakGeo(THREE); break;
    case 'bicak': g = bicakGeo(THREE); break;
    case 'yildiz': g = yildizGeo(THREE); break;
    default: throw new Error('bitki3b: bilinmeyen geometri ' + ad);
  }
  g.userData.kalici = true;             // dunya.js dispose'u paylaşılan geometriyi atmasın
  GEO.set(ad, g);
  return g;
}

/* ——————————————————————————— vektör yardımcıları ——————————————————————————— */
const norm = ([x, y, z]) => { const u = Math.hypot(x, y, z) || 1; return [x / u, y / u, z / u]; };
/** Eğik bir sapın ucu: taban p, yön, boy h. */
export const uc = (p, yon, h) => { const d = norm(yon); return [p[0] + d[0] * h, p[1] + d[1] * h, p[2] + d[2] * h]; };
/** Açı (yatay yön a) ve eğim (dikeyden e) → birim yön. */
export const yonAl = (a, e) => [Math.sin(e) * Math.sin(a), Math.cos(e), Math.sin(e) * Math.cos(a)];
const karis = (r1, r2, t) => {
  const c = (s) => [(r1 >> s) & 255, (r2 >> s) & 255];
  const [a0, b0] = c(16), [a1, b1] = c(8), [a2, b2] = c(0);
  return (Math.round(a0 + (b0 - a0) * t) << 16) | (Math.round(a1 + (b1 - a1) * t) << 8) | Math.round(a2 + (b2 - a2) * t);
};

/* ——————————————————————————— renkler ——————————————————————————— */
export const BR = {
  tane: 0xd4ae68, filizAcik: 0x98cc62, bugdayYesil: 0x5f9e45, bugdayBasak: 0x9ebf5c, bugdaySap: 0x6fa24b,
  altinSap: 0xd7b257, altinBasak: 0xe4c267, altinKilcik: 0xead08a, kuruYaprak: 0xc8a552,
  domatesSap: 0x5d8a3a, domatesYaprak: 0x4d8a3b, domatesCicek: 0xf3d23a, domatesYesil: 0x86b24c,
  domatesKirmizi: 0xd8352a, canak: 0x3f7a2e, sirik: 0xa9804f, bag: 0xe9e0c0,
  ceviz: 0x8d6a3f, cevizKoyu: 0x6e4f2e, tumsek: 0x6b4a33, catlak: 0x3a281c, kok: 0xd9d6a8,
  cevizSap: 0x7b8a49, cevizGovde: 0x847865, cevizYaprak: 0x5c9a41, cevizYaprakAcik: 0x6fae4c,
  ot: 0x6aac3c, otYaprak: 0x5b983a, karahindiba: 0xf2cf36,
  puskul: 0xb8bd58, yesilKabuk: 0x7f9d4c, sariKabuk: 0xb6c35e
};
/* Susamış yaprak rengi: soluk, sarımsı-gri yeşil. */
const SOLUK = 0xb3b27a;
const soluk = (r, susamis) => (susamis ? karis(r, SOLUK, .55) : r);

/* ——————————————————————————— modeller ——————————————————————————— */

/* Yaprak ekle (yüzü yukarı bakan, yöne doğru uzanan). sarkik: susamış görünüş. */
function yaprak(liste, p, a, egim, boy, en, renk, susamis) {
  const e = susamis ? Math.min(2.5, egim + .75) : egim;
  liste.push({ g: 'yaprak', r: soluk(renk, susamis), p, yon: yonAl(a, e), yuz: true, boy: [en, boy, 1] });
}
/* Bileşik (tüysü) yaprak: sap + karşılıklı yaprakçıklar + uçta tek yaprakçık (ceviz). */
function tuysuYaprak(liste, p, a, egim, uzun, cift, yb, renk, susamis) {
  const e = susamis ? Math.min(2.4, egim + .7) : egim;
  const d = yonAl(a, e);
  liste.push({ g: 'sap', r: soluk(BR.cevizSap, susamis), p, yon: d, boy: [.006, uzun, .006] });
  for (let i = 1; i <= cift; i++) {
    const q = uc(p, d, uzun * (i / (cift + 1)));
    for (const s of [-1, 1]) yaprak(liste, q, a + s * 1.25, Math.max(.55, e + .15), yb, yb * .48, renk, susamis);
  }
  yaprak(liste, uc(p, d, uzun), a, Math.max(.4, e - .1), yb * 1.1, yb * .52, renk, susamis);
}

function bugdayModeli(ad, { susamis, rng }) {
  const L = [];
  if (ad === 'serpme-ekim' || ad === 'cimlenme') {
    const n = ad === 'serpme-ekim' ? 8 : 4;
    for (let i = 0; i < n; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * .34;
      L.push({ g: 'kure0', r: BR.tane, p: [Math.cos(a) * r, .015, Math.sin(a) * r], don: rng() * 3, boy: [.03, .018, .018] });
    }
  }
  if (ad === 'cimlenme') {
    for (let i = 0; i < 10; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * .3;
      L.push({ g: 'bicak', r: soluk(BR.filizAcik, susamis), p: [Math.cos(a) * r, 0, Math.sin(a) * r], yon: yonAl(rng() * 6.283, rng() * .25 + (susamis ? .5 : 0)), don: rng() * 6, boy: [.03, .14 + rng() * .08, .04] });
    }
  }
  if (ad === 'yesil-sap') {
    for (let k = 0; k < 3; k++) {                                    // kardeşlenen demetler
      const ka = rng() * 6.283, kr = .1 + rng() * .16, kp = [Math.cos(ka) * kr, 0, Math.sin(ka) * kr];
      for (let i = 0; i < 4; i++) {
        const a = rng() * 6.283;
        L.push({ g: 'bicak', r: soluk(BR.bugdayYesil, susamis), p: kp, yon: yonAl(a, .18 + rng() * .3 + (susamis ? .6 : 0)), don: a, boy: [.045, .3 + rng() * .14, .12] });
      }
    }
  }
  if (ad === 'basak' || ad === 'sararma') {
    const altin = ad === 'sararma';
    for (let i = 0; i < 6; i++) {
      const a = rng() * 6.283, r = Math.sqrt(rng()) * .24, p = [Math.cos(a) * r, 0, Math.sin(a) * r];
      const e = rng() * .16 + (susamis ? .3 : 0), d = yonAl(rng() * 6.283, e), h = .72 + rng() * .18;
      L.push({ g: 'sap', r: altin ? BR.altinSap : soluk(BR.bugdaySap, susamis), p, yon: d, boy: [.011, h, .011] });
      const tepe = uc(p, d, h);
      const basakYon = altin ? yonAl(rng() * 6.283, .45 + rng() * .25) : d;   // olgun başak ağırlaşır, eğilir
      L.push({ g: 'kure0', r: altin ? BR.altinBasak : soluk(BR.bugdayBasak, susamis), p: uc(tepe, basakYon, .07), yon: basakYon, boy: [.032, .1, .026] });
      L.push({ g: 'bicak', r: altin ? BR.altinKilcik : soluk(0xb7d07c, susamis), p: uc(tepe, basakYon, .15), yon: basakYon, don: rng() * 6, boy: [.012, .09, .01] });
      const ya = rng() * 6.283;
      L.push({ g: 'bicak', r: altin ? BR.kuruYaprak : soluk(BR.bugdayYesil, susamis), p: uc(p, d, h * .3), yon: yonAl(ya, .7 + (susamis ? .5 : 0)), don: ya, boy: [.035, .28, .14] });
    }
  }
  return L;
}

function domatesModeli(no, { susamis, destek, urun, rng }) {
  const L = [];
  const boylar = [.16, .38, .58, .7, .78, .84];
  const h = boylar[no] ?? .84;
  const yatik = no >= 2 && !destek;                                   // sırıksız domates yana yatar
  const ga = rng() * 6.283;
  const d = yatik ? yonAl(ga, .55) : yonAl(ga, .05);
  L.push({ g: 'sap', r: BR.domatesSap, p: [0, 0, 0], yon: d, boy: [no ? .016 : .01, h, no ? .016 : .01] });
  if (no === 0) {
    for (let i = 0; i < 4; i++) {
      const a = ga + i * 1.57;
      yaprak(L, uc([0, 0, 0], d, h * (i < 2 ? .7 : 1)), a, i < 2 ? 1.2 : .7, i < 2 ? .06 : .08, .035, BR.domatesYaprak, susamis);
    }
    return L;
  }
  const kume = [0, 4, 5, 7, 7, 7][no] ?? 7;
  for (let i = 0; i < kume; i++) {
    const t = .22 + .74 * (i / Math.max(1, kume - 1));
    const q = uc([0, 0, 0], d, h * t), a = ga + i * 2.4;
    // Bileşik, girintili domates yaprağı: üç yaprakçık, alttakiler daha iri
    const b = (1.25 - t * .5) * (no === 1 ? .8 : 1);
    for (let j = -1; j <= 1; j++) yaprak(L, q, a + j * .6, .95 + Math.abs(j) * .25, (.13 + rng() * .05) * b, .08 * b, BR.domatesYaprak, susamis);
  }
  if (destek && no >= 2) {
    L.push({ g: 'kutu', r: BR.sirik, p: [.07, 0, .02], boy: [.024, h + .22, .024] });
    for (const t of [.35, .7]) L.push({ g: 'kure0', r: BR.bag, p: [.045, h * t, .02], boy: [.03, .014, .03] });
  }
  const meyve = urun || (no >= 3 ? ['cicek', 'yesil', 'kirmizi'][Math.min(2, no - 3)] : null);
  if (!meyve) return L;
  for (let i = 0; i < 3; i++) {
    const q = uc([0, 0, 0], d, h * (.45 + i * .15)), a = ga + 1 + i * 2.1;
    const m = [q[0] + Math.sin(a) * .09, q[1] - .05, q[2] + Math.cos(a) * .09];
    if (meyve === 'cicek') {
      L.push({ g: 'yildiz', r: BR.domatesCicek, p: m, yon: yonAl(a, 1.1), boy: [.058, .05, .058] });
      L.push({ g: 'kure0', r: 0xe39a1c, p: m, boy: [.016, .016, .016] });
    } else {
      const kirmizi = meyve === 'kirmizi', r = kirmizi ? .07 : .058;
      L.push({ g: 'kure1', r: kirmizi ? BR.domatesKirmizi : BR.domatesYesil, p: [m[0], m[1] - r * .5, m[2]], boy: [r, r * .88, r], mal: kirmizi ? 'parlak' : undefined });
      L.push({ g: 'yildiz', r: BR.canak, p: [m[0], m[1] + r * .38, m[2]], boy: [r * .62, r * .6, r * .62] });
    }
  }
  return L;
}

function cevizModeli(ad, { susamis, destek, rng }) {
  const L = [];
  const tumsek = h => L.push({ g: 'kure0', r: BR.tumsek, p: [0, -.01, 0], don: .4, boy: [.24, h, .22] });
  if (ad === 'tohum') {
    tumsek(.05);
    L.push({ g: 'kure1', r: BR.ceviz, p: [0, .045, 0], don: .5, boy: [.085, .07, .075] });
    L.push({ g: 'sap', r: BR.cevizKoyu, p: [0, .045, 0], yon: [1, 0, .2], boy: [.01, .09, .08] });   // ceviz dikişi
    return L;
  }
  if (ad === 'cimlenme') {
    tumsek(.045);
    for (let i = 0; i < 5; i++) {                                         // yüzeyde çatlaklar
      const a = i * 1.26 + rng() * .4;
      L.push({ g: 'kutu', r: BR.catlak, p: [Math.cos(a) * .05, .03, Math.sin(a) * .05], yon: [Math.cos(a), .12, Math.sin(a)], don: 0, boy: [.014, .15 + rng() * .06, .01] });
    }
    for (const s of [-1, 1]) L.push({ g: 'kure0', r: BR.ceviz, p: [s * .05, .045, .02], don: s, boy: [.055, .03, .05] });   // açılmış kabuk
    L.push({ g: 'sap', r: BR.kok, p: [0, .03, 0], yon: [.2, 1, 0], boy: [.012, .07, .012] });
    L.push({ g: 'sap', r: BR.kok, p: uc([0, .03, 0], [.2, 1, 0], .07), yon: [1, -.25, 0], boy: [.011, .045, .011] });  // kıvrık filiz ucu
    L.push({ g: 'kure0', r: soluk(0xb8d27a, susamis), p: [.06, .09, 0], boy: [.018, .016, .018] });
    return L;
  }
  if (ad === 'filiz') {
    tumsek(.04);
    L.push({ g: 'sap', r: BR.cevizSap, p: [0, 0, 0], yon: [0, 1, 0], boy: [.014, .26, .014] });
    for (const s of [0, Math.PI]) yaprak(L, [0, .24, 0], s + .3, 1.05, .12, .075, BR.cevizYaprakAcik, susamis);
    L.push({ g: 'kure0', r: soluk(0x8fbf5a, susamis), p: [0, .27, 0], boy: [.02, .03, .02] });
    return L;
  }
  const genc = ad === 'genc-agac';
  const h = genc ? 1.3 : .72;
  if (genc) {
    L.push({ g: 'govde', r: BR.cevizGovde, p: [0, 0, 0], yon: [0, 1, 0], boy: [.055, h, .055] });
    const dallar = 4;
    for (let i = 0; i < dallar; i++) {
      const a = i * 1.57 + .4 + rng() * .3, b = [0, h * (.62 + i * .08), 0], dy = yonAl(a, .85), du = .4 + rng() * .1;
      L.push({ g: 'govde', r: BR.cevizGovde, p: b, yon: dy, boy: [.022, du, .022] });
      tuysuYaprak(L, uc(b, dy, du), a, .95, .34, 3, .14, i % 2 ? BR.cevizYaprak : BR.cevizYaprakAcik, susamis);
      tuysuYaprak(L, uc(b, dy, du * .55), a + 1.2, 1.1, .28, 2, .12, BR.cevizYaprak, susamis);
    }
    tuysuYaprak(L, [0, h, 0], 0, .15, .32, 3, .14, BR.cevizYaprakAcik, susamis);
    tuysuYaprak(L, [0, h * .96, 0], 2.6, .5, .3, 3, .13, BR.cevizYaprak, susamis);
  } else {
    L.push({ g: 'sap', r: 0x756c4b, p: [0, 0, 0], yon: [0, 1, 0], boy: [.02, h, .02] });
    [[.34, .3], [.5, 2.4], [.63, 4.4]].forEach(([t, a], i) => tuysuYaprak(L, [0, h * t + .1, 0], a, .95, .26, 2, .1, i % 2 ? BR.cevizYaprak : BR.cevizYaprakAcik, susamis));
    tuysuYaprak(L, [0, h, 0], 1.3, .2, .2, 2, .1, BR.cevizYaprakAcik, susamis);
  }
  if (destek) {                                                            // destek çubuğu + bağ
    const ch = genc ? 1.05 : .95;
    L.push({ g: 'kutu', r: BR.sirik, p: [.11, 0, .03], boy: [.032, ch, .032] });
    L.push({ g: 'kure0', r: BR.bag, p: [.075, ch * .62, .02], boy: [.05, .018, .04] });
  }
  return L;
}

/**
 * Bir bitkinin parça listesi (yerel koordinat, taban 0).
 * @param tur    'ceviz' | 'bugday' | 'domates'
 * @param no     gösterilen evre numarası (ortak/turler.js evreler dizisinde)
 * @param secenek {susamis, destek, urun, tohum}
 */
export const EVRELER = {
  ceviz: ['tohum', 'cimlenme', 'filiz', 'fidan', 'genc-agac'],
  bugday: ['serpme-ekim', 'cimlenme', 'yesil-sap', 'basak', 'sararma'],
  domates: ['fide', 'buyume', 'destek', 'cicek', 'yesil', 'kirmizi']
};
export function bitkiParcalari(tur, no, { susamis = false, destek = false, urun = null, tohum = 1 } = {}) {
  const rng = tohumlu(tohum);
  const ad = EVRELER[tur]?.[Math.max(0, Math.min(no, EVRELER[tur].length - 1))];
  if (tur === 'bugday') return bugdayModeli(ad, { susamis, rng });
  if (tur === 'domates') return domatesModeli(Math.max(0, Math.min(no, 5)), { susamis, destek, urun, rng });
  if (tur === 'ceviz') return cevizModeli(ad, { susamis, destek, rng });
  return [];
}

/** Yabani ot kümesi: karahindiba yaprak rozeti + birkaç çim (bitkiye zarar vermez). */
export function otParcalari(tohum) {
  const rng = tohumlu(tohum), L = [];
  for (let i = 0; i < 5; i++) {
    const a = i * 1.26 + rng() * .3;
    L.push({ g: 'yaprak', r: BR.otYaprak, p: [0, .01, 0], yon: yonAl(a, 1.35), yuz: true, boy: [.05, .12 + rng() * .04, 1] });
  }
  for (let i = 0; i < 4; i++) L.push({ g: 'bicak', r: BR.ot, p: [(rng() - .5) * .08, 0, (rng() - .5) * .08], yon: yonAl(rng() * 6.283, .2 + rng() * .3), don: rng() * 6, boy: [.03, .14 + rng() * .06, .05] });
  if (rng() < .6) {
    L.push({ g: 'sap', r: BR.ot, p: [0, 0, 0], yon: [0, 1, 0], boy: [.006, .14, .006] });
    L.push({ g: 'kure0', r: BR.karahindiba, p: [0, .15, 0], boy: [.028, .018, .028] });
  }
  return L;
}

/* ——————————————————————————— Dede Ceviz'in meyveleri ———————————————————————————
   Taç verisi mekan.js'teki dede yapısıyla AYNI (orada taç ve gövde, burada
   değişen meyve). Koordinatlar ağacın yerel çerçevesinde (dönüş .3). */
export const DEDE_TAC = [[0, 3.35, 0, 2.5, 1.2], [1.8, 2.95, .7, 1.6, .95], [-1.8, 3.05, -.3, 1.7, 1], [.3, 3.0, -1.8, 1.6, .95], [-.5, 2.9, 1.8, 1.6, .9], [.3, 4.15, .2, 1.5, .85], [1.3, 3.5, -1.2, 1.2, .8]];
function dedeYerleri() {
  const alt = [], ust = [], yer = [];
  for (let i = 0; i < 18; i++) {
    const ac = i * 2.4, r = 1.6 + (i % 4) * .32;
    alt.push([Math.cos(ac) * r, 2.12 + (i % 3) * .12, Math.sin(ac) * r]);
  }
  for (let i = 0; i < 16; i++) {
    const [x, y, z, r, h] = DEDE_TAC[i % DEDE_TAC.length], ac = i * 2.1 + .5, egim = .35 + (i % 3) * .22;
    ust.push([x + Math.cos(ac) * r * Math.cos(egim) * .97, y + Math.sin(egim) * h * .97, z + Math.sin(ac) * r * Math.cos(egim) * .97]);
  }
  for (let i = 0; i < 6; i++) {
    const ac = i * 1.3 + .2, r = 1.3 + (i % 3) * .5;
    yer.push([Math.cos(ac) * r, .08, Math.sin(ac) * r]);
  }
  return { alt, ust, yer };
}
/** urun: 'puskul-cicek' | 'yesil-kabuk' | 'catlak-kabuk' */
export function dedeParcalari(urun) {
  const { alt, ust, yer } = dedeYerleri(), L = [];
  if (urun === 'puskul-cicek') {
    // Erkek çiçekler: dal uçlarından sarkan uzun yeşil-sarı püsküller (rüzgârla tozlaşır; arı yok)
    alt.forEach((p, i) => L.push({ g: 'kure0', r: BR.puskul, p: [p[0], p[1] - .12, p[2]], don: i, boy: [.03, .15, .03] }));
    ust.forEach((p, i) => L.push({ g: 'kure0', r: i % 2 ? BR.puskul : 0x9fb04c, p, don: i, boy: [.028, .12, .028] }));
    return L;
  }
  const catlak = urun === 'catlak-kabuk';
  alt.forEach((p, i) => {
    if (catlak && i % 2 === 0) {
      L.push({ g: 'kure0', r: BR.sariKabuk, p, don: i, boy: [.1, .09, .1] });
      L.push({ g: 'kure0', r: BR.ceviz, p: [p[0], p[1] - .07, p[2]], don: i, boy: [.07, .065, .07] });   // çatlaktan görünen ceviz
    } else L.push({ g: 'kure0', r: catlak ? BR.sariKabuk : BR.yesilKabuk, p, don: i, boy: [.11, .11, .11] });
  });
  ust.forEach((p, i) => L.push({ g: 'kure0', r: catlak ? (i % 3 ? BR.sariKabuk : BR.ceviz) : BR.yesilKabuk, p, don: i, boy: [.13, .12, .13] }));
  if (catlak) yer.forEach((p, i) => L.push({ g: 'kure0', r: BR.ceviz, p, don: i, boy: [.1, .09, .1] }));
  return L;
}

/* ——————————————————————————— yerleştirme ve örnekleme ——————————————————————————— */

/** Parçaları bir yuvaya taşır: yuva = {x, z, y?, ry?, s?}. Yeni liste. */
export function yerlestir(parcalar, { x = 0, y = 0, z = 0, ry = 0, s = 1 } = {}) {
  const c = Math.cos(ry), si = Math.sin(ry);
  const don = ([a, b, d]) => [a * c + d * si, b, -a * si + d * c];
  return parcalar.map(q => {
    const p = don(q.p.map(v => v * s));
    return {
      ...q,
      p: [p[0] + x, p[1] + y, p[2] + z],
      yon: q.yon ? don(q.yon) : undefined,
      don: (q.don || 0) + ry,
      boy: q.boy.map(v => v * s)
    };
  });
}

/**
 * Parçaları (geometri, renk, malzeme) çiftine göre toplayıp her çift için
 * TEK InstancedMesh kurar ve ebeveyne ekler. Kurulan mesh'ler döner.
 * arac: {THREE, mal}. Malzemeler a.mal önbelleğinden (dunya.js dispose eder).
 */
export function ornekCiz(arac, ebeveyn, parcalar, { golge = true, ad = 'bitki' } = {}) {
  const { THREE, mal } = arac;
  const gruplar = new Map();
  for (const q of parcalar) {
    const k = `${q.g}|${q.r}|${q.mal || ''}`;
    let l = gruplar.get(k);
    if (!l) gruplar.set(k, l = []);
    l.push(q);
  }
  const Y = new THREE.Vector3(0, 1, 0), YUKARI = new THREE.Vector3(0, 1, 0);
  const m = new THREE.Matrix4(), q0 = new THREE.Quaternion(), qd = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const d = new THREE.Vector3(), xa = new THREE.Vector3(), za = new THREE.Vector3();
  const meshler = [];
  for (const [k, liste] of gruplar) {
    const [g] = k.split('|');
    const ek = {};
    if (CIFT_YUZ.has(g)) ek.side = THREE.DoubleSide;
    if (liste[0].mal === 'parlak') { ek.roughness = .38; ek.name = 'parlak'; }
    const im = new THREE.InstancedMesh(geometri(THREE, g), mal(liste[0].r, ek), liste.length);
    liste.forEach((x, i) => {
      if (x.yon) { d.set(...x.yon).normalize(); q0.setFromUnitVectors(Y, d); } else { d.set(0, 1, 0); q0.identity(); }
      let spin = x.don || 0;
      if (x.yuz) {                                              // yaprak yüzü göğe baksın
        xa.set(1, 0, 0).applyQuaternion(q0); za.set(0, 0, 1).applyQuaternion(q0);
        spin = Math.atan2(xa.dot(YUKARI), za.dot(YUKARI));
      }
      qd.setFromAxisAngle(Y, spin);
      q0.multiply(qd);
      p.set(...x.p); s.set(...x.boy);
      m.compose(p, q0, s);
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = golge; im.receiveShadow = true;
    im.computeBoundingSphere();
    im.name = ad;
    ebeveyn.add(im);
    meshler.push(im);
  }
  return meshler;
}

/** ornekCiz'in kurduklarını kaldırır (geometriler paylaşılan: atılmaz). */
export function ornekTemizle(ebeveyn) {
  for (const o of [...ebeveyn.children]) {
    if (o.isInstancedMesh) { ebeveyn.remove(o); o.dispose(); }
  }
}

/** Test/ölçüm: bir gruptaki örnek sayısı. */
export function ornekSay(ebeveyn) {
  let n = 0;
  ebeveyn.traverse(o => { if (o.isInstancedMesh) n += o.count; });
  return n;
}

/* Çiftliğin hayvanları — 3B modeller (Aşama 1a: tavuk ve horoz; inek Aşama 2).

   Sözleşme (dunya.js / itilebilir.js ile aynı): ileri +z, ayaklar y=0,
   a = { THREE, mal }. Geometriler modül düzeyinde bir kez kurulur ve dünya
   dağıtılırken atılmaz (userData.kalici).

   Her hayvan GERÇEK hayvanına benzemeli; 3-6 yaşındaki çocuk uzaktan
   "tavuk" ve "horoz" diye tanımalı:

     tavuk   dolgun, arkası kalkık yumurta biçimli gövde; göğüs önde dolgun;
             küçük kafa, tepede KÜÇÜK kırmızı İBİK (4 tümsek), gagadan
             sarkan iki kırmızı GERDAN (sakal), SİVRİ sarı GAGA, gözün
             çevresinde kırmızı yüz derisi; iki yanda katlı KANAT (uçta koyu
             uçuş tüyleri); arkada yukarı kalkık, yelpaze KUYRUK TÜYLERİ;
             sarı bacaklar, öne üç arkaya bir PARMAK.
     horoz   tavuktan iri ve dik duruşlu; BÜYÜK, dik, dişli kırmızı İBİK;
             uzun kırmızı gerdan; boynundan omuzlarına dökülen altın-turuncu
             YELE tüyleri; koyu kızıl sırt, turuncu omuz; siyah-yeşil göğüs;
             arkada yukarı çıkıp aşağı KIVRILAN parlak yeşil-siyah ORAK
             tüyleri ve aralarında bakır renkli tüyler (renkli, kıvrık
             kuyruk); bacakta mahmuz.

   Canlılık (onBeforeRender, ek çizim yok): yürürken bacaklar adım atar,
   kafa tavuk gibi ileri-geri gider; dururken arada yere gagalar.

   Çizim bütçesi: her hayvan ~30 parça. Gövde, kafa ve iki bacak ayrı ayrı
   birleştirilir (birlestir.js): hayvan başına 4 mesh. */

import {birlestir} from './birlestir.js';

const GEO = new Map();
function geo(THREE, anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}
const kure = THREE => geo(THREE, 'kure', () => new THREE.IcosahedronGeometry(1, 1));
const silindirG = THREE => geo(THREE, 'silindir', () => new THREE.CylinderGeometry(1, 1, 1, 5, 1, true));
const koniIleri = THREE => geo(THREE, 'koniIleri', () => new THREE.ConeGeometry(1, 1, 6).rotateX(Math.PI / 2));   // ucu +z
const tuy = THREE => geo(THREE, 'tuy', () => new THREE.IcosahedronGeometry(1, 0));

/* Küçük yapım atölyesi: parça ekleme kısayolları. */
function atolye(a, g) {
  const { THREE } = a;
  const Y = new THREE.Vector3(0, 1, 0);
  const ekle = (m, e) => { m.castShadow = true; m.receiveShadow = true; e.add(m); return m; };
  return {
    top(renk, x, y, z, sx, sy = sx, sz = sx, e = g) {
      const m = new THREE.Mesh(kure(THREE), a.mal(renk)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); return ekle(m, e);
    },
    tuy(renk, x, y, z, sx, sy, sz, e = g) {
      const m = new THREE.Mesh(tuy(THREE), a.mal(renk)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); return ekle(m, e);
    },
    /* İki nokta arasında çubuk (bacak, parmak). */
    cubuk(renk, p, q, r, e = g) {
      const a0 = new THREE.Vector3(...p), b0 = new THREE.Vector3(...q), yon = b0.clone().sub(a0);
      const m = new THREE.Mesh(silindirG(THREE), a.mal(renk));
      m.scale.set(r, yon.length(), r); m.position.copy(a0).add(b0).multiplyScalar(.5);
      m.quaternion.setFromUnitVectors(Y, yon.normalize());
      return ekle(m, e);
    },
    gaga(renk, x, y, z, r, boy, e = g) {
      const m = new THREE.Mesh(koniIleri(THREE), a.mal(renk)); m.position.set(x, y, z); m.scale.set(r, r * .8, boy); return ekle(m, e);
    },
    /* Kıvrık tüy: yay biçimli ince tüp (horozun orak tüyleri). */
    orak(renk, noktalar, kalinlik, e = g, anahtar) {
      const tg = geo(THREE, 'orak-' + anahtar, () => new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(noktalar.map(p => new THREE.Vector3(...p))), 10, kalinlik, 4, false));
      const m = new THREE.Mesh(tg, a.mal(renk)); return ekle(m, e);
    }
  };
}

/* Bacak: kalçadan dönen grup; incik, ayak parmakları (3 önde, 1 arkada). */
function bacakKur(a, g, k, s, { kalcaY, renk, kalin, mahmuz = false }) {
  const { THREE } = a;
  const kalca = new THREE.Group(); kalca.position.set(s * .062, kalcaY, 0); g.add(kalca);
  k.cubuk(renk, [0, 0, 0], [0, -kalcaY + .03, .012], kalin, kalca);
  const ay = -kalcaY + .012;
  for (const p of [-.5, 0, .5]) k.cubuk(renk, [0, ay, .012], [Math.sin(p) * .06, ay - .006, .012 + Math.cos(p) * .06], kalin * .55, kalca);
  k.cubuk(renk, [0, ay, .012], [0, ay - .004, -.035], kalin * .5, kalca);
  if (mahmuz) k.cubuk(0xd9c9a0, [0, ay + .07, -.004], [0, ay + .05, -.045], kalin * .5, kalca);
  return kalca;
}

/* Canlandırma: grubun dünyadaki yer değişiminden hız, oradan adım ve kafa.
   Dururken 2-5 sn'de bir gagalar (kafayı yere indirir). Aynı karede gölge
   ve ana çizim iki kez çağırır: 4 ms'den kısa arayla gelen atlanır. */
function canlandir(mesh, { kafa, bacaklar, kafa0, tohum }) {
  let onceki = null, sonMs = 0, faz = 0, hiz = 0, gaga = 0, sonraki = 1.5 + (tohum % 7) * .45;
  let sn = 0;
  mesh.onBeforeRender = () => {
    const ms = performance.now();
    if (ms - sonMs < 4) return;
    const dt = Math.min(.1, (ms - sonMs) / 1000 || .016); sonMs = ms; sn += dt;
    const e = mesh.matrixWorld.elements, x = e[12], z = e[14];
    if (onceki) {
      const v = Math.hypot(x - onceki.x, z - onceki.z) / dt;
      hiz += (Math.min(1, v / 2.2) - hiz) * Math.min(1, dt * 10);
    }
    onceki = { x, z };
    faz += dt * 15 * hiz;
    bacaklar.forEach((b, i) => { b.rotation.x = Math.sin(faz + i * Math.PI) * .55 * hiz; });
    // Gagalama: dururken zaman zaman, .7 sn sürer
    if (hiz < .12) {
      if (gaga <= 0 && sn > sonraki) { gaga = .7; sonraki = sn + 2 + ((tohum * 7 + Math.floor(sn)) % 5) * .7; }
    } else gaga = 0;
    let ileri = Math.sin(faz * 2) * .035 * hiz, egil = 0;
    if (gaga > 0) {
      gaga -= dt;
      const o = 1 - gaga / .7, t = Math.sin(Math.min(1, o) * Math.PI);
      egil = t * 1.05; ileri += t * .06;
    }
    kafa.position.set(kafa0.x, kafa0.y - egil * .1, kafa0.z + ileri);
    kafa.rotation.x = egil;
  };
}

/* ═══════════════ TAVUK ═══════════════ */
export const TAVUK_RENKLERI = {
  kizil:  { tuy: 0xa9582d, kanat: 0x8c4320, uc: 0x4b2513, kuyruk: 0x3f2415, boyun: 0xbb6a38, karin: 0xb86a3c },
  beyaz:  { tuy: 0xf3eee2, kanat: 0xe3dccb, uc: 0xcfc6b2, kuyruk: 0xece5d4, boyun: 0xf7f3ea, karin: 0xf6f1e6 },
  sari:   { tuy: 0xd9a55e, kanat: 0xc58c43, uc: 0x8e5e2a, kuyruk: 0x7a4f25, boyun: 0xe4b774, karin: 0xe0b16e }
};
const IBIK = 0xd8362b, GAGA = 0xe9b13f, BACAK = 0xe2aa35, YUZ = 0xdc4a3a, GOZ = 0x241a14;

export function tavukModeli(a, ebeveyn, { renkler = TAVUK_RENKLERI.kizil, olcek = 1, tohum = 1, birlesik = true } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.name = 'tavuk'; g.scale.setScalar(olcek); ebeveyn.add(g);
  const k = atolye(a, g);
  const R = renkler;
  const bacaklar = [-1, 1].map(s => bacakKur(a, g, k, s, { kalcaY: .19, renk: BACAK, kalin: .016 }));

  // Gövde: yumurta biçimi, arka yukarı kalkık; önde dolgun göğüs, altta açık karın
  const gv = k.top(R.tuy, 0, .31, -.03, .19, .17, .25); gv.rotation.x = -.18;
  k.top(R.karin, 0, .27, .1, .15, .14, .13);
  k.top(R.tuy, 0, .36, .12, .135, .14, .12);                               // göğüs
  k.top(R.tuy, 0, .38, -.2, .13, .12, .12);                                // sağrı (kuyruk kökü)
  // Kanatlar: yanlarda katlı, uçta koyu birincil tüyler geriye uzanır
  for (const s of [-1, 1]) {
    const kn = k.top(R.kanat, s * .165, .33, -.04, .055, .12, .19); kn.rotation.set(-.2, s * .08, s * .12);
    const uc = k.tuy(R.uc, s * .15, .32, -.22, .035, .07, .1); uc.rotation.set(-.35, s * .1, s * .15);
  }
  // Kuyruk tüyleri: yukarı-geriye kalkık yelpaze
  for (const [x, r, y, boy] of [[-.055, -.3, .5, .12], [-.02, -.1, .53, .14], [.02, .1, .53, .14], [.055, .3, .5, .12]]) {
    const t = k.tuy(R.kuyruk, x, y, -.28, .028, boy, .06); t.rotation.set(-.55, 0, r);
  }
  // Boyun: kafaya doğru daralan, göğüsten yukarı
  k.top(R.boyun, 0, .45, .13, .092, .12, .09).rotation.x = .25;

  // Kafa
  const kafa0 = new THREE.Vector3(0, .54, .17);
  const kafa = new THREE.Group(); kafa.position.copy(kafa0); g.add(kafa);
  k.top(R.boyun, 0, 0, 0, .075, .078, .08, kafa);
  // İbik: tepede küçük, 4 yuvarlak diş (önden arkaya)
  for (const [z, y, s] of [[.045, .07, .022], [.018, .088, .027], [-.012, .09, .027], [-.04, .077, .022]])
    k.top(IBIK, 0, y, z, .014, s, .02, kafa);
  // Gaga: sivri, hafif aşağı bakar
  const gg = k.gaga(GAGA, 0, -.012, .085, .024, .06, kafa); gg.rotation.x = .25;
  // Gerdan (sakal): gaganın altından sarkan iki kırmızı damla
  for (const s of [-1, 1]) k.top(IBIK, s * .013, -.065, .058, .014, .026, .013, kafa);
  // Yüz derisi ve gözler (gözün çevresi kırmızı)
  for (const s of [-1, 1]) {
    k.top(YUZ, s * .05, .012, .038, .018, .026, .026, kafa);
    k.top(GOZ, s * .062, .02, .045, .013, .014, .012, kafa);
    k.top(0xffffff, s * .066, .026, .05, .004, .004, .004, kafa);
  }

  if (birlesik) {
    const parcalar = birlestir(a, g, { korunan: [kafa, ...bacaklar], ad: 'tavuk' });
    canlandir(parcalar.find(m => m.parent === g) || g.children.find(c => c.isMesh), { kafa, bacaklar, kafa0, tohum });
  }
  g.userData = { kafa, bacaklar, tur: 'tavuk' };
  return g;
}

/* ═══════════════ HOROZ ═══════════════ */
export const HOROZ_RENKLERI = {
  sirt: 0x8e2f1c, omuz: 0xd26a24, yele: 0xe79a3a, gogus: 0x1d2b25, kanatUc: 0x16261f,
  orak: 0x173a2c, orak2: 0x245a3e, bakir: 0xb5541f
};

export function horozModeli(a, ebeveyn, { renkler = HOROZ_RENKLERI, olcek = 1, tohum = 5, birlesik = true } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.name = 'horoz'; g.scale.setScalar(olcek); ebeveyn.add(g);
  const k = atolye(a, g);
  const R = renkler;
  const bacaklar = [-1, 1].map(s => bacakKur(a, g, k, s, { kalcaY: .25, renk: BACAK, kalin: .02, mahmuz: true }));

  // Gövde: tavuktan dik; sırt koyu kızıl, göğüs siyah-yeşil
  const gv = k.top(R.sirt, 0, .38, -.04, .18, .18, .25); gv.rotation.x = -.38;
  k.top(R.gogus, 0, .37, .1, .15, .17, .13);
  k.top(R.gogus, 0, .3, .02, .14, .12, .15);                                // karın
  k.top(R.sirt, 0, .47, -.19, .12, .11, .12);                               // sağrı
  // Kanatlar: turuncu omuz, siyah-yeşil uç tüyleri
  for (const s of [-1, 1]) {
    const kn = k.top(R.omuz, s * .16, .41, -.02, .055, .11, .17); kn.rotation.set(-.35, s * .08, s * .1);
    const uc = k.tuy(R.kanatUc, s * .15, .36, -.2, .04, .07, .12); uc.rotation.set(-.4, s * .1, s * .12);
  }
  // Yele: boyundan omuzlara dökülen altın-turuncu sivri tüyler
  for (const [x, z, r] of [[-.07, .06, -.35], [.07, .06, .35], [-.05, -.03, -.2], [.05, -.03, .2], [0, -.06, 0], [0, .11, 0]]) {
    const t = k.tuy(R.yele, x, .5, z, .05, .11, .05); t.rotation.set(-.5, 0, r);
  }
  // Boyun: uzun, dik, yele renginde
  k.top(R.yele, 0, .56, .12, .085, .13, .085).rotation.x = .12;

  // Kuyruk: yukarı çıkıp aşağı kıvrılan orak tüyleri (yeşil-siyah) + bakır tüyler
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .5, -.24); g.add(kuyruk);
  const orak = (renk, x, yukseklik, uzun, kal, ad) =>
    k.orak(renk, [[x * .3, 0, 0], [x * .6, yukseklik * .75, -uzun * .35], [x, yukseklik, -uzun * .75], [x * 1.1, yukseklik * .7, -uzun], [x * 1.1, yukseklik * .25, -uzun * .95]], kal, kuyruk, ad);
  orak(R.orak, -.04, .36, .36, .018, 'o1');
  orak(R.orak2, .04, .38, .38, .018, 'o2');
  orak(R.orak, 0, .43, .42, .02, 'o3');
  orak(R.bakir, -.08, .27, .3, .015, 'o4');
  orak(R.bakir, .08, .28, .31, .015, 'o5');
  orak(R.orak2, -.02, .31, .26, .015, 'o6');
  // Kuyruk kökündeki kısa örtü tüyleri
  for (const [x, r] of [[-.05, -.25], [0, 0], [.05, .25]]) {
    const t = k.tuy(R.orak, x, .06, -.02, .04, .11, .06, kuyruk); t.rotation.set(-.7, 0, r);
  }

  // Kafa
  const kafa0 = new THREE.Vector3(0, .69, .17);
  const kafa = new THREE.Group(); kafa.position.copy(kafa0); g.add(kafa);
  k.top(R.yele, 0, 0, 0, .075, .08, .085, kafa);
  // İbik: BÜYÜK, dik, dişli (5 diş), kırmızı; tabanı kafa boyunca
  k.top(IBIK, 0, .07, .005, .018, .035, .075, kafa);
  for (const [z, y, s] of [[.06, .115, .04], [.03, .14, .05], [0, .15, .055], [-.032, .14, .05], [-.062, .115, .042]]) {
    const d = k.top(IBIK, 0, y, z, .016, s, .02, kafa); d.rotation.x = z * 2.5;
  }
  // Gaga: sivri, kalın, hafif kıvrık
  const gg = k.gaga(GAGA, 0, -.01, .09, .027, .065, kafa); gg.rotation.x = .28;
  // Gerdan: uzun kırmızı sakal
  for (const s of [-1, 1]) k.top(IBIK, s * .016, -.085, .06, .017, .045, .015, kafa);
  // Yüz, kulak memesi, gözler
  for (const s of [-1, 1]) {
    k.top(YUZ, s * .052, .012, .04, .02, .03, .03, kafa);
    k.top(0xf2eee0, s * .066, -.035, .0, .012, .018, .012, kafa);           // beyaz kulak memesi
    k.top(GOZ, s * .064, .022, .048, .014, .015, .013, kafa);
    k.top(0xffe7a8, s * .068, .028, .052, .005, .005, .005, kafa);
  }

  if (birlesik) {
    const parcalar = birlestir(a, g, { korunan: [kafa, ...bacaklar], ad: 'horoz' });
    canlandir(parcalar.find(m => m.parent === g) || g.children.find(c => c.isMesh), { kafa, bacaklar, kafa0, tohum });
  }
  g.userData = { kafa, bacaklar, kuyruk, tur: 'horoz' };
  return g;
}

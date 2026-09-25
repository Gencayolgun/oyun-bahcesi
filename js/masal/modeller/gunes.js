/* Güneş ile Rüzgâr için 3B modeller — tür → kurucu(a, ebeveyn, secenek) (bkz. modeller.js).

   kirlangic  Oyuncu karakteri. Bir kırlangıcı kırlangıç yapan şeyler:
              · parlak LACİVERT sırt ve baş, krem/beyaz göğüs
              · kiremit kırmızısı ALIN ve GERDAN
              · kısa, geniş, minik siyah gaga
              · gövdeden uzun, SİVRİ, kuyruğun ötesine uzanan kanatlar
              · derin ÇATAL kuyruk: iki uzun ince tel (kırlangıcın imzası)
              · çok kısa bacaklar (kırlangıç yerde az durur)
   aycicegi   Durak izi: her çözülen durak yol kenarında bir ayçiçeği açtırır.

   Adlandırılmış dışa aktarımlar (mekân kullanır, deftere girmez):
   koyunModeli (yaylada otlayan, yaklaşınca kaçan koyunlar) ve ayiModeli
   (yolculuk sonunda paltosuz, çeşme başında oturan Pofuduk).

   İleri +z, ayaklar y=0. Bu dosya three'yi kendisi yüklemez (a.THREE).
   Geometriler modül düzeyinde bir kez kurulur ve atılmaz (userData.kalici). */

const GEO = new Map();
function geo(THREE, anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}
const kure = THREE => geo(THREE, 'gunes-kure', () => new THREE.IcosahedronGeometry(1, 2));
const kureKaba = THREE => geo(THREE, 'gunes-kureKaba', () => new THREE.IcosahedronGeometry(1, 1));
/* Ucu -z'ye bakan koni: kanat ve kuyruk telleri. */
const geriKoni = THREE => geo(THREE, 'gunes-geriKoni', () => new THREE.ConeGeometry(1, 1, 10).rotateX(-Math.PI / 2).translate(0, 0, -.5));
/* Ucu +z'ye bakan koni: gaga, burun. */
const ileriKoni = THREE => geo(THREE, 'gunes-ileriKoni', () => new THREE.ConeGeometry(1, 1, 10).rotateX(Math.PI / 2));
const disk = THREE => geo(THREE, 'gunes-disk', () => new THREE.CylinderGeometry(1, 1, 1, 20).rotateX(Math.PI / 2));
/* Ayçiçeği taç yaprakları: yuvarlak uçlu 14 yapraklı yıldız levha (z'ye bakar). */
const tacGeo = THREE => geo(THREE, 'gunes-tac', () => {
  const sekil = new THREE.Shape(), n = 14, dis = .27, ic = .11;
  for (let i = 0; i <= n; i++) {
    const a = i / n * Math.PI * 2, b = (i + .5) / n * Math.PI * 2, c = (i + 1) / n * Math.PI * 2;
    if (i === 0) sekil.moveTo(Math.cos(a) * ic, Math.sin(a) * ic);
    if (i === n) break;
    sekil.quadraticCurveTo(Math.cos(b - .12) * dis * 1.05, Math.sin(b - .12) * dis * 1.05, Math.cos(b) * dis, Math.sin(b) * dis);
    sekil.quadraticCurveTo(Math.cos(b + .12) * dis * 1.05, Math.sin(b + .12) * dis * 1.05, Math.cos(c) * ic, Math.sin(c) * ic);
  }
  return new THREE.ExtrudeGeometry(sekil, { depth: .015, bevelEnabled: false, curveSegments: 3 }).translate(0, 0, -.008);
});

function yapici(a, g) {
  return (geometri, renk, x, y, z, ebeveyn = g, ek) => {
    const m = new a.THREE.Mesh(geometri, a.mal(renk, ek)); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; ebeveyn.add(m); return m;
  };
}

/* ——— Kırlangıç ——— renk: sırt, karin: göğüs, ic: alın ve gerdan */
export function kirlangicModeli(a, ebeveyn, { renk = 0x2c4478, karin = 0xfff4e4, ic = 0xc8553d, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const p = yapici(a, g), K = kure(THREE);
  const sirt = new THREE.Color(renk), parlak = sirt.clone().lerp(new THREE.Color(0x7fa4e0), .28).getHex();

  // Gövde: öne-yukarı kalkık bir damla; sırt lacivert, göğüs krem
  const govde = new THREE.Group(); govde.position.set(0, .3, 0); govde.rotation.x = -.32; g.add(govde);
  p(K, renk, 0, 0, -.02, govde).scale.set(.2, .19, .34);
  p(K, karin, 0, -.055, .05, govde).scale.set(.165, .15, .26);
  p(K, parlak, 0, .1, -.04, govde).scale.set(.13, .06, .22);           // sırttaki parlama

  // Baş: yuvarlak, lacivert; alın ve gerdan kiremit kırmızısı
  const kafa = new THREE.Group(); kafa.position.set(0, .5, .22); g.add(kafa);
  p(K, renk, 0, 0, 0, kafa).scale.set(.145, .14, .15);
  p(K, ic, 0, -.07, .085, kafa).scale.set(.1, .085, .075);             // gerdan
  p(K, ic, 0, .045, .125, kafa).scale.set(.065, .035, .04);            // alın
  p(K, karin, 0, -.12, .02, kafa).scale.set(.09, .05, .08);            // gerdanın altı açık
  p(ileriKoni(THREE), 0x2b2320, 0, -.005, .17, kafa).scale.set(.035, .022, .08);   // kısa geniş gaga
  for (const yon of [-1, 1]) {
    p(K, 0x151218, yon * .085, .03, .095, kafa).scale.setScalar(.03);
    p(kureKaba(THREE), 0xffffff, yon * .092, .042, .115, kafa).scale.setScalar(.01);
  }

  // Kanatlar: uzun, sivri, gövdenin yanlarına katlanmış; ucu kuyruğun ötesinde
  const kanatlar = [];
  for (const yon of [-1, 1]) {
    const k = new THREE.Group(); k.position.set(yon * .15, .4, .1); k.rotation.set(-.2, yon * .1, yon * .22); g.add(k);
    p(geriKoni(THREE), renk, 0, 0, 0, k).scale.set(.12, .035, .64);
    p(geriKoni(THREE), parlak, 0, .016, -.02, k).scale.set(.07, .02, .42);
    kanatlar.push(k);
  }

  // Çatal kuyruk: iki uzun ince tel; kökünden sallanır
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .24, -.3); g.add(kuyruk);
  p(K, renk, 0, 0, -.04, kuyruk).scale.set(.08, .035, .12);
  for (const yon of [-1, 1]) {
    const tel = new THREE.Group(); tel.rotation.set(.2, yon * .26, 0); kuyruk.add(tel);
    p(geriKoni(THREE), renk, 0, 0, -.04, tel).scale.set(.035, .012, .5);
    p(K, 0xffffff, yon * .012, .012, -.2, tel).scale.set(.012, .006, .025);   // kuyruktaki beyaz benek
  }

  // Bacaklar: çok kısa, koyu; minik ayaklar
  for (const yon of [-1, 1]) {
    p(geo(THREE, 'gunes-bacak', () => new THREE.CylinderGeometry(.012, .014, .14, 5)), 0x3a2e2a, yon * .06, .07, .03);
    p(K, 0x3a2e2a, yon * .06, .008, .06).scale.set(.028, .01, .045);
  }
  g.userData = { kafa, kuyruk, kanatlar };
  return g;
}

/* ——— Ayçiçeği ——— renk: taç yaprak rengi. Başı hafif yukarı, güneşe bakar. */
export function aycicegiModeli(a, ebeveyn, { renk = 0xf2c230, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const p = yapici(a, g), K = kure(THREE);
  /* Dört parça: her durak bir çiçek açtırıyor, 28 çiçek hafif kalmalı. */
  p(geo(THREE, 'gunes-sap', () => new THREE.CylinderGeometry(.022, .03, .92, 6)), 0x5c8f45, 0, .46, 0);
  const y1 = p(K, 0x6fa655, .12, .42, 0); y1.scale.set(.13, .025, .07); y1.rotation.z = -.4; y1.castShadow = false;
  const bas = new THREE.Group(); bas.position.set(0, .98, .02); bas.rotation.x = -.35; g.add(bas);
  p(tacGeo(THREE), renk, 0, 0, 0, bas);                                           // taç yapraklar (tek levha)
  p(disk(THREE), 0x5e3719, 0, 0, .012, bas).scale.set(.115, .115, .035);          // göbek
  g.userData = { bas };
  return g;
}

/* ——— Koyun ——— kıvırcık krem yün, SİYAH yüz ve bacaklar, yana açılan kulaklar. */
export function koyunModeli(a, ebeveyn, { yun = 0xf2ecdc, yuz = 0x2f2a28, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const p = yapici(a, g), K = kure(THREE), KK = kureKaba(THREE);
  const bacak = geo(THREE, 'gunes-koyun-bacak', () => new THREE.CylinderGeometry(.04, .035, .34, 6));
  for (const [x, z] of [[-.14, .2], [.14, .2], [-.14, -.22], [.14, -.22]]) p(bacak, yuz, x, .17, z);
  p(K, yun, 0, .5, 0).scale.set(.3, .24, .4);
  // Kıvırcık yün: gövdenin üstünde topaklar (gölgeyi gövde düşürür)
  for (const [x, y, z, r] of [[0, .68, .12, .16], [0, .7, -.14, .17], [-.2, .6, 0, .15], [.2, .6, 0, .15], [0, .58, .3, .13]])
    { const m = p(KK, yun, x, y, z); m.scale.setScalar(r); m.castShadow = false; }
  // Baş: uzunca, SİYAH, öne ve hafif aşağı bakar; kulaklar yana açılır
  const kafa = new THREE.Group(); kafa.position.set(0, .64, .4); kafa.rotation.x = .35; g.add(kafa);
  p(K, yuz, 0, -.01, .07, kafa).scale.set(.1, .11, .2);
  const percem = p(KK, yun, 0, .1, -.02, kafa); percem.scale.setScalar(.09); percem.castShadow = false;   // tepedeki yün perçemi
  for (const yon of [-1, 1]) { const k = p(K, yuz, yon * .13, .03, -.02, kafa); k.scale.set(.08, .025, .04); k.rotation.z = yon * .3; k.castShadow = false; }
  g.userData = { kafa };
  return g;
}

/* ——— Ayı (Pofuduk) ——— paltosuz, çeşme başında oturuyor. Yuvarlak kulaklar
   kafanın TEPESİNDE, öne uzanan açık renk burun ve iri siyah burun ucu. */
export function ayiModeli(a, ebeveyn, { renk = 0x7a4f2e, burun = 0xc9a57a, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const p = yapici(a, g), K = kure(THREE);
  const koyu = new THREE.Color(renk).multiplyScalar(.72).getHex();
  p(K, renk, 0, .44, -.04).scale.set(.4, .42, .36);                   // oturan iri gövde
  p(K, renk, 0, .74, -.1).scale.set(.3, .2, .26);                     // omuz tümseği (ayının kamburu)
  for (const yon of [-1, 1]) {
    p(K, renk, yon * .21, .14, .2).scale.set(.14, .13, .26);          // arka bacaklar öne uzanmış
    p(K, koyu, yon * .21, .13, .44).scale.set(.1, .1, .05);           // taban
    p(K, renk, yon * .27, .42, .2).scale.set(.11, .24, .11);          // kalın ön kollar
    p(K, koyu, yon * .27, .2, .28).scale.set(.1, .06, .1);            // pençe
  }
  const kafa = new THREE.Group(); kafa.position.set(0, .92, .16); kafa.rotation.x = .12; g.add(kafa);
  p(K, renk, 0, 0, 0, kafa).scale.set(.24, .21, .22);
  p(K, renk, 0, -.03, .16, kafa).scale.set(.14, .12, .14);            // alından buruna inen çizgi
  p(K, burun, 0, -.06, .27, kafa).scale.set(.1, .085, .12);           // UZUN, öne çıkan burun
  p(K, 0x1c1411, 0, -.03, .38, kafa).scale.set(.055, .038, .035);     // iri siyah burun ucu
  for (const yon of [-1, 1]) {
    p(K, renk, yon * .17, .16, -.04, kafa).scale.set(.065, .065, .045);  // küçük yuvarlak kulak
    p(K, koyu, yon * .17, .16, -.015, kafa).scale.set(.035, .035, .025);
    p(K, 0x120e10, yon * .085, .05, .17, kafa).scale.setScalar(.022);  // küçük boncuk göz
  }
  g.userData = { kafa };
  return g;
}

export default {
  kirlangic: kirlangicModeli,
  aycicegi: aycicegiModeli
};

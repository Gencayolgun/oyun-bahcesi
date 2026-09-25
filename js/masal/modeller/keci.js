/* İki Keçi için 3B modeller — tür → kurucu(a, ebeveyn, secenek) (bkz. modeller.js).

   keci          oyuncunun karakteri: bir OĞLAK (çocuk keçi). Geçitteki sürü
                 hayvanları da aynı modelden, başka renkte.
   cicek-demeti  çözülen her durağın yanına bırakılan iz.

   Bir oğlağı oğlak yapan şeyler (yuvarlak bir "hayvancık" değil):
     · fıçı gibi uzun gövde, ince uzun bacaklar, uçlarında koyu TOYNAK
     · öne uzanan, uca doğru daralan yüz; pembe burun ucu
     · yanlara açılıp hafif yukarı kalkan dik kulaklar
     · başın tepesinden geriye kıvrılan iki küçük boynuz
     · çenenin altında sivri sakal
     · kehribar göz, YATAY göz bebeği
     · kısa, yukarı kalkık kuyruk (sallanır: userData.kuyruk)

   three araç kutusundan gelir (a.THREE). Geometriler bir kez kurulur,
   dünya dağıtılırken atılmaz (userData.kalici). İleri +z, ayaklar y=0. */

const GEO = new Map();
function geo(anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}

/* Parçaları tek çizime indir: bir grubun altındaki bütün mesh'ler (haric
   verilen oynayan alt gruplar dışında) renkleri köşe rengine yazılarak
   TEK geometride birleştirilir. Bir oğlak ~45, bir çiçek demeti ~30 ayrı
   çizim çağrısıydı; haritada 27 demet ve 6 keçi olunca bu binlerce çağrı
   demekti. Birleşik geometri renk takımına göre önbellekte tutulur. */
function duzlestir(a, kok, anahtar, haric = []) {
  const { THREE } = a;
  kok.updateMatrixWorld(true);
  const ters = new THREE.Matrix4().copy(kok.matrixWorld).invert();
  const altinda = (o, h) => { for (let p = o; p; p = p.parent) if (p === h) return true; return false; };
  const meshler = [];
  kok.traverse(o => { if (o.isMesh && !haric.some(h => altinda(o, h))) meshler.push(o); });
  const g = geo(anahtar, () => {
    const konum = [], normal = [], renk = [], m = new THREE.Matrix4();
    for (const o of meshler) {
      m.multiplyMatrices(ters, o.matrixWorld);
      const p = o.geometry.clone().applyMatrix4(m);
      const d = p.index ? p.toNonIndexed() : p;
      const c = o.material.color;
      konum.push(...d.attributes.position.array); normal.push(...d.attributes.normal.array);
      for (let i = 0; i < d.attributes.position.count; i++) renk.push(c.r, c.g, c.b);
      p.dispose(); if (d !== p) d.dispose();
    }
    const b = new THREE.BufferGeometry();
    b.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
    b.setAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
    b.setAttribute('color', new THREE.Float32BufferAttribute(renk, 3));
    b.computeBoundingSphere();
    return b;
  });
  for (const o of meshler) o.parent.remove(o);
  const tek = new THREE.Mesh(g, a.mal(0xffffff, { vertexColors: true }));
  tek.castShadow = true; tek.receiveShadow = true; kok.add(tek);
  return tek;
}

export function keciModeli(a, ebeveyn, { renk = 0xf4efe6, karin = 0xe9e2d4, ic = 0xe8b3a8, olcek = 1,
  boynuz = null, toynak = 0x4a3f36, sakal = null } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const kure = geo('kure', () => new THREE.IcosahedronGeometry(1, 2));
  const kureKaba = geo('kureKaba', () => new THREE.IcosahedronGeometry(1, 1));
  const silindir = geo('bacak', () => new THREE.CylinderGeometry(1, .8, 1, 8));
  const koni = geo('koni', () => new THREE.ConeGeometry(1, 1, 8));
  const kutu = geo('kutu', () => new THREE.BoxGeometry(1, 1, 1));
  const koyuMu = new THREE.Color(renk).getHSL({}).l < .35;
  const boynuzRengi = boynuz ?? (koyuMu ? 0xa89a86 : 0xb8a27c);
  const sakalRengi = sakal ?? new THREE.Color(renk).multiplyScalar(koyuMu ? .7 : .93).getHex();
  const parca = (geometri, r, x, y, z, ebe = g) => {
    const m = new THREE.Mesh(geometri, a.mal(r)); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; ebe.add(m); return m;
  };

  // Gövde: fıçı gibi uzun; göğüs biraz dolgun, karın altı açık
  parca(kure, renk, 0, .4, -.03).scale.set(.18, .16, .29);
  parca(kure, renk, 0, .42, .14).scale.set(.16, .16, .16);
  parca(kure, karin, 0, .31, 0).scale.set(.13, .07, .22);

  // Bacaklar: ince, uzun; uçlarında iki parçalı koyu toynak
  for (const [x, z] of [[-.09, .17], [.09, .17], [-.09, -.2], [.09, -.2]]) {
    parca(silindir, renk, x, .16, z).scale.set(.036, .27, .036);
    parca(kure, renk, x, .15, z).scale.set(.037, .032, .037);         // diz
    parca(silindir, toynak, x, .025, z + .006).scale.set(.034, .05, .04);
    parca(kutu, 0x2c2622, x, .025, z + .044).scale.set(.006, .05, .012);  // toynak yarığı
  }

  // Boyun: öne ve yukarı uzanır
  const boyun = parca(silindir, renk, 0, .52, .23);
  boyun.scale.set(.075, .22, .075); boyun.rotation.x = .55;

  // Baş
  const kafa = new THREE.Group(); kafa.position.set(0, .63, .3); g.add(kafa);
  parca(kure, renk, 0, 0, 0, kafa).scale.set(.085, .09, .1);
  // Yüz: öne uzanan ve uca doğru daralan burun
  const burun = parca(kure, renk, 0, -.035, .1, kafa); burun.scale.set(.06, .062, .105); burun.rotation.x = .25;
  /* Burun ucu: küçük, yassı, soluk bir burun yastığı; iki yana açılan
     YARIK burun delikleri ve altında burundan ağza inen çizgi. (Önceki
     iri pembe yuvarlak disk ve yuvarlak delikler önden domuz burnu gibi
     görünüyordu.) */
  const yastik = new THREE.Color(ic).lerp(new THREE.Color(0x4a3a36), .42).getHex();
  parca(kure, yastik, 0, -.048, .197, kafa).scale.set(.026, .017, .014);
  for (const yon of [-1, 1]) {
    const d = parca(kutu, 0x2e2320, yon * .012, -.047, .209, kafa);
    d.scale.set(.005, .013, .004); d.rotation.set(-.3, 0, yon * .75);
  }
  parca(kutu, 0x3a2c28, 0, -.071, .197, kafa).scale.set(.003, .02, .004);           // burun-ağız çizgisi
  const agiz = parca(kutu, 0x3a2c28, 0, -.083, .188, kafa); agiz.scale.set(.03, .003, .004);
  // Sakal: çenenin altında sivri
  const sak = parca(koni, sakalRengi, 0, -.12, .13, kafa); sak.scale.set(.022, .085, .022); sak.rotation.x = Math.PI - .25;
  // Gözler: kehribar, yatay bebek
  for (const yon of [-1, 1]) {
    const goz = parca(kure, 0xe6a93c, yon * .066, .015, .05, kafa); goz.scale.setScalar(.024);
    const bebek = parca(kutu, 0x231f1c, yon * .087, .015, .054, kafa); bebek.scale.set(.004, .008, .026);
    parca(kureKaba, 0xffffff, yon * .085, .028, .062, kafa).scale.setScalar(.005);
  }
  // Kulaklar: yanlara açılan, hafif kalkık, içi pembe
  for (const yon of [-1, 1]) {
    const k = new THREE.Group(); k.position.set(yon * .075, .04, -.015); k.rotation.set(0, yon * .3, yon * .6); kafa.add(k);
    parca(kure, renk, yon * .065, 0, 0, k).scale.set(.08, .016, .032);
    parca(kure, ic, yon * .067, .006, 0, k).scale.set(.058, .009, .02);
  }
  // Boynuzlar: başın tepesinden geriye kıvrılan iki küçük boynuz (iki boğum)
  for (const yon of [-1, 1]) {
    const b1 = parca(silindir, boynuzRengi, yon * .038, .115, -.02, kafa); b1.scale.set(.02, .08, .024); b1.rotation.set(-.45, 0, yon * -.16);
    const b2 = parca(koni, boynuzRengi, yon * .046, .16, -.06, kafa); b2.scale.set(.02, .08, .022); b2.rotation.set(-1.15, 0, yon * -.2);
    for (const y of [.09, .115, .14]) parca(kure, new THREE.Color(boynuzRengi).multiplyScalar(.82).getHex(), yon * .038, y, -.02 - (y - .09) * .45, kafa).scale.set(.024, .006, .026);
  }
  // Perçem: boynuzların arasında bir tutam
  parca(kure, sakalRengi, 0, .075, .035, kafa).scale.set(.03, .016, .035);

  // Kuyruk: kısa, yukarı kalkık; kökünden sallanır
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .5, -.3); g.add(kuyruk);
  const kk = parca(koni, renk, 0, .045, -.015, kuyruk); kk.scale.set(.03, .1, .02); kk.rotation.x = -.45;

  // Tek çizime indir: gövde, baş ve kuyruk ayrı (baş ve kuyruk oynuyor)
  const takim = [renk, karin, ic, boynuzRengi, toynak, sakalRengi].join(',');
  duzlestir(a, kafa, 'keci-kafa:' + takim);
  duzlestir(a, kuyruk, 'keci-kuyruk:' + takim);
  duzlestir(a, g, 'keci-govde:' + takim, [kafa, kuyruk]);
  g.userData = { kafa, kuyruk };
  return g;
}

/* Çiçek demeti: papatyalar, yoncalar, bir iki renkli çiçek; saplar
   kurdeleyle bağlı. Ayakları y=0; olcek 1'de ~0.7 boy. */
export function cicekDemeti(a, ebeveyn, { renk = 0xf2c14a, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const kure = geo('kureKaba', () => new THREE.IcosahedronGeometry(1, 1));   // küçük: kaba küre yeter
  const sap = geo('sap', () => new THREE.CylinderGeometry(1, 1, 1, 5));
  const disk = geo('disk', () => new THREE.CylinderGeometry(1, 1, 1, 12));
  const parca = (geometri, r, x, y, z) => {
    const m = new THREE.Mesh(geometri, a.mal(r)); m.position.set(x, y, z);
    m.castShadow = true; g.add(m); return m;
  };
  const cicekler = [
    [0, .62, 0, 'papatya'], [-.13, .55, .05, 'papatya'], [.13, .56, -.03, 'pembe'],
    [.05, .5, .13, 'papatya'], [-.06, .52, -.12, 'mavi'], [.14, .47, .1, 'yonca']
  ];
  for (const [x, y, z, tur] of cicekler) {
    const s = parca(sap, 0x5f9a4d, x / 2, y / 2, z / 2); s.scale.set(.012, y, .012);
    s.rotation.set(z * 1.4, 0, -x * 1.4);
    if (tur === 'papatya') {
      const t = parca(disk, 0xffffff, x, y, z); t.scale.set(.07, .012, .07);
      parca(kure, 0xf2c14a, x, y + .012, z).scale.set(.03, .018, .03);
    } else if (tur === 'yonca') {
      for (let i = 0; i < 3; i++) {
        const ac = i / 3 * Math.PI * 2;
        parca(kure, 0x5fa05a, x + Math.cos(ac) * .035, y, z + Math.sin(ac) * .035).scale.set(.035, .012, .035);
      }
    } else {
      const c = tur === 'pembe' ? 0xf0a6b8 : 0x8fb3e8;
      for (let i = 0; i < 5; i++) {
        const ac = i / 5 * Math.PI * 2;
        parca(kure, c, x + Math.cos(ac) * .03, y, z + Math.sin(ac) * .03).scale.set(.03, .016, .03);
      }
      parca(kure, 0xfff2c4, x, y + .01, z).scale.setScalar(.018);
    }
  }
  // Yapraklar ve kurdele
  for (const [x, z, r] of [[-.08, .06, .5], [.08, -.05, -.6]]) {
    const y = parca(kure, 0x77b25f, x, .22, z); y.scale.set(.05, .014, .1); y.rotation.set(0, r, .6 * Math.sign(x));
  }
  parca(disk, renk, 0, .2, 0).scale.set(.035, .05, .035);
  const f1 = parca(kure, renk, .05, .19, .02); f1.scale.set(.05, .02, .025); f1.rotation.z = -.5;
  const f2 = parca(kure, renk, -.05, .19, .02); f2.scale.set(.05, .02, .025); f2.rotation.z = .5;
  const olc = g.scale.x; g.scale.setScalar(1);            // geometri ölçeksiz birleşsin, ölçek grupta kalsın
  duzlestir(a, g, 'demet:' + renk).castShadow = false;   // küçük iz: gölgesi görünmüyor, çizimi boşa
  g.scale.setScalar(olc);
  return g;
}

export default {
  keci: keciModeli,
  'cicek-demeti': cicekDemeti
};

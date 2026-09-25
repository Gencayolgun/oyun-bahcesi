/* Tilki ile Üzümler için 3B modeller — tür → kurucu(a, ebeveyn, secenek) (bkz. modeller.js).

   sincap         oyuncunun karakteri: çocuk bir SİNCAP. Bağın kaçan
                  sincapları da aynı modelden, başka renkte.
   tilki          çardağın altındaki Kızıl (bölüme göre zıplıyor, sandığa,
                  merdivene çıkıyor).
   uzum-salkimi   çözülen her durağın yanına dikilen küçük asma kazığı ve
                  ondan sarkan salkım.

   Bir sincabı sincap yapan şeyler (yuvarlak bir "hayvancık" değil):
     · gövdesi kadar büyük, sırtından yukarı kıvrılan GÜR kuyruk
       (sallanır: userData.kuyruk)
     · dik, sivri kulaklar ve uçlarında koyu PÜSKÜL
     · kısa, küt burun; iri, parlak kara gözler ve çevresinde açık halka
     · güçlü arka bacaklar ve uzun arka ayaklar, minik ön patiler
     · krem göğüs ve karın
   Bir tilkiyi tilki yapan şeyler:
     · öne doğru uzanan SİVRİ burun ve ucunda kara burun
     · iri, üçgen, uçları kara kulaklar
     · beyaz yanak, çene ve göğüs; bacaklarda kara "çorap"
     · gür, uzun, BEYAZ UÇLU kuyruk

   three araç kutusundan gelir (a.THREE). Geometriler bir kez kurulur,
   dünya dağıtılırken atılmaz (userData.kalici). İleri +z, ayaklar y=0. */

const GEO = new Map();
function geo(anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}

/* Parçaları tek çizime indir: bir grubun altındaki mesh'ler (haric verilen
   oynayan alt gruplar dışında) köşe rengiyle TEK geometride birleşir.
   Haritada 28 salkım ve birkaç sincap olunca yüzlerce çizim çağrısı
   yerine birkaç tane kalır. Birleşik geometri renk takımına göre önbellekte. */
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

function araclar(a) {
  const { THREE } = a;
  return {
    kure: geo('kure', () => new THREE.IcosahedronGeometry(1, 2)),
    kureKaba: geo('kureKaba', () => new THREE.IcosahedronGeometry(1, 1)),
    silindir: geo('silindir', () => new THREE.CylinderGeometry(1, 1, 1, 8)),
    koni: geo('koni', () => new THREE.ConeGeometry(1, 1, 10)),
    kutu: geo('kutu', () => new THREE.BoxGeometry(1, 1, 1))
  };
}
const parcaci = (a, varsayilan) => (geometri, r, x, y, z, ebe = varsayilan) => {
  const m = new a.THREE.Mesh(geometri, a.mal(r)); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; ebe.add(m); return m;
};

/* Gür kuyruk: eğri boyunca kalınlığı değişen yumuşak bir tüp. Top top
   dizilmiş küreler tırtıl gibi görünüyordu; gerçek kuyruk kökte ince,
   ortada kabarık, uçta sivri. t0..t1: eğrinin hangi kısmı (uç rengi ayrı
   bir tüple çizilebilsin diye). */
function kalinTup(THREE, noktalar, yaricap, t0 = 0, t1 = 1, n = 36, m = 12) {
  const egri = new THREE.CatmullRomCurve3(noktalar.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  const cer = egri.computeFrenetFrames(n, false);
  const konum = [], index = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * i / n, P = egri.getPointAt(t);
    const k = Math.min(n, Math.round(t * n)), N = cer.normals[k], B = cer.binormals[k];
    const r = yaricap(t);
    for (let j = 0; j < m; j++) {
      const a = j / m * Math.PI * 2;
      konum.push(P.x + r * (Math.cos(a) * N.x + Math.sin(a) * B.x), P.y + r * (Math.cos(a) * N.y + Math.sin(a) * B.y), P.z + r * (Math.cos(a) * N.z + Math.sin(a) * B.z));
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const a = i * m + j, b = i * m + (j + 1) % m, c = (i + 1) * m + j, d = (i + 1) * m + (j + 1) % m;
    index.push(a, b, c, b, d, c);
  }
  // Uçları kapat
  const bas = egri.getPointAt(t0), son = egri.getPointAt(t1), s0 = konum.length / 3;
  konum.push(bas.x, bas.y, bas.z, son.x, son.y, son.z);
  for (let j = 0; j < m; j++) { index.push(s0, (j + 1) % m, j); index.push(s0 + 1, n * m + j, n * m + (j + 1) % m); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(konum, 3));
  g.setIndex(index); g.computeVertexNormals();
  return g;
}

/* ——— SİNCAP ——— */
export function sincapModeli(a, ebeveyn, { renk = 0xc97b3f, karin = 0xf7e6c8, ic = 0xeaa48c, olcek = 1, puskul = null } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { kure, kureKaba, silindir, koni } = araclar(a);
  const parca = parcaci(a, g);
  const koyu = new THREE.Color(renk).multiplyScalar(.62).getHex();
  const puskulRengi = puskul ?? new THREE.Color(renk).multiplyScalar(.5).getHex();

  // Gövde: çömelmiş, önü hafif kalkık; güçlü arka kalçalar
  const govde = parca(kure, renk, 0, .27, -.02); govde.scale.set(.15, .16, .23); govde.rotation.x = -.35;
  for (const yon of [-1, 1]) parca(kure, renk, yon * .09, .19, -.11).scale.set(.085, .11, .13);
  parca(kure, karin, 0, .27, .1).scale.set(.1, .12, .09);                    // krem göğüs
  // Arka ayaklar uzun, ön patiler minik
  for (const yon of [-1, 1]) {
    parca(kure, renk, yon * .1, .08, -.07).scale.set(.045, .07, .06);        // arka baldır
    parca(kure, koyu, yon * .1, .025, -.03).scale.set(.045, .025, .1);       // uzun arka ayak
    parca(kure, renk, yon * .055, .1, .14).scale.set(.035, .09, .035);       // ön bacak
    parca(kure, koyu, yon * .055, .02, .17).scale.set(.032, .02, .042);
  }

  // Baş: yuvarlak ama küt bir burun; gözlerin çevresinde açık halka
  const kafa = new THREE.Group(); kafa.position.set(0, .43, .17); g.add(kafa);
  parca(kure, renk, 0, 0, 0, kafa).scale.set(.12, .11, .12);
  parca(kure, renk, 0, -.025, .1, kafa).scale.set(.075, .065, .07);        // burun
  parca(kure, karin, 0, -.055, .09, kafa).scale.set(.06, .04, .06);         // çene altı
  parca(kure, 0x5a3527, 0, -.01, .17, kafa).scale.set(.022, .017, .014);    // burun ucu
  for (const yon of [-1, 1]) {
    parca(kure, karin, yon * .07, .025, .075, kafa).scale.set(.036, .038, .025);    // göz halkası
    parca(kure, 0x221a16, yon * .075, .027, .088, kafa).scale.set(.026, .028, .02);
    parca(kureKaba, 0xffffff, yon * .08, .038, .104, kafa).scale.setScalar(.007);
    parca(kure, karin, yon * .06, -.04, .09, kafa).scale.set(.035, .03, .03);       // yanak
  }
  // Kulaklar: dik, sivri; uçta koyu püskül
  for (const yon of [-1, 1]) {
    const k = new THREE.Group(); k.position.set(yon * .06, .09, -.01); k.rotation.set(-.12, 0, yon * -.18); kafa.add(k);
    parca(koni, renk, 0, .055, 0, k).scale.set(.042, .115, .026);
    parca(koni, ic, 0, .05, .01, k).scale.set(.024, .08, .01);
    const p = parca(koni, puskulRengi, 0, .135, 0, k); p.scale.set(.03, .09, .022);
  }
  // Kuyruk: gövde kadar büyük, sırttan yukarı kıvrılan gür bir S; kökte ince,
  // ortada kabarık, ucu öne kıvrılıyor. Kenarında açık renkli bir saçak.
  // Omuz görünümünde kamera tam arkada: kuyruk başın ÜSTÜNE çıkarsa çocuk
  // ekranda yalnız kahverengi bir fasulye görüyordu. Kuyruk sırtın arkasında
  // kalkıyor ve tepesi başın altında kalıyor; arkadan bakınca püsküllü
  // kulaklar ve baş kuyruğun üstünden görünür.
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .17, -.25); g.add(kuyruk);
  const KY = [[0, 0, 0], [0, .02, -.1], [0, .08, -.2], [0, .17, -.28], [0, .27, -.32], [0, .36, -.3], [0, .41, -.23], [0, .4, -.15]];
  const kalinlik = t => .03 + .13 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.1)), .8) * (1 - .35 * t);
  const kg = geo('sincap-kuyruk', () => kalinTup(THREE, KY, kalinlik));
  // Yandan yassıca (gerçek sincap kuyruğu gibi): arkadan bakınca başın yanları görünsün.
  parca(kg, new THREE.Color(renk).lerp(new THREE.Color(0xf5e2c8), .12).getHex(), 0, 0, 0, kuyruk).scale.x = .8;
  // Kuyruğun sırt çizgisinde koyu, uçta açık tutamlar: tüylü görünsün
  for (const [t, r, c] of [[.93, .05, 0xf5e2c8]]) {
    const i = Math.min(KY.length - 1, Math.round(t * (KY.length - 1))), [x, y, z] = KY[i];
    parca(kure, c, x, y + .02, z - .06, kuyruk).scale.set(r * 1.4, r, r);
  }

  const takim = [renk, karin, ic, puskulRengi].join(',');
  duzlestir(a, kafa, 'sincap-kafa:' + takim);
  duzlestir(a, kuyruk, 'sincap-kuyruk:' + takim);
  duzlestir(a, g, 'sincap-govde:' + takim, [kafa, kuyruk]);
  g.userData = { kafa, kuyruk };
  return g;
}

/* ——— TİLKİ (Kızıl) ——— */
export function tilkiModeli(a, ebeveyn, { renk = 0xe0762f, beyaz = 0xfbf3e7, kara = 0x3a2a24, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { kure, kureKaba, silindir, koni } = araclar(a);
  const parca = parcaci(a, g);

  // Gövde: uzun, ince; beyaz göğüs
  const govde = parca(kure, renk, 0, .42, -.02); govde.scale.set(.14, .13, .3);
  parca(kure, beyaz, 0, .38, .2).scale.set(.1, .12, .1);
  parca(kure, beyaz, 0, .33, .02).scale.set(.09, .06, .2);
  // Bacaklar: ince; alt yarısı kara "çorap"
  for (const [x, z] of [[-.075, .19], [.075, .19], [-.075, -.22], [.075, -.22]]) {
    parca(silindir, renk, x, .24, z).scale.set(.034, .2, .034);
    parca(silindir, kara, x, .08, z).scale.set(.033, .16, .033);
    parca(kure, kara, x, .015, z + .02).scale.set(.04, .02, .05);
  }
  // Boyun ve baş
  const boyun = parca(silindir, renk, 0, .54, .26); boyun.scale.set(.075, .18, .075); boyun.rotation.x = .6;
  const kafa = new THREE.Group(); kafa.position.set(0, .64, .34); g.add(kafa);
  parca(kure, renk, 0, 0, 0, kafa).scale.set(.12, .1, .11);
  for (const yon of [-1, 1]) parca(kure, beyaz, yon * .075, -.035, .04, kafa).scale.set(.06, .05, .06);   // beyaz yanak
  // Sivri burun: üstü turuncu, altı beyaz, ucu kara
  const burun = parca(koni, renk, 0, -.01, .15, kafa); burun.scale.set(.06, .17, .05); burun.rotation.x = Math.PI / 2;
  const cene = parca(koni, beyaz, 0, -.04, .13, kafa); cene.scale.set(.045, .13, .03); cene.rotation.x = Math.PI / 2;
  parca(kure, 0x1f1714, 0, -.005, .235, kafa).scale.set(.022, .018, .018);
  // Gözler: kehribar
  for (const yon of [-1, 1]) {
    parca(kure, 0xd98a1f, yon * .052, .035, .085, kafa).scale.set(.022, .02, .015);
    parca(kure, 0x1f1714, yon * .054, .035, .096, kafa).scale.set(.009, .015, .008);
    parca(kureKaba, 0xffffff, yon * .058, .045, .1, kafa).scale.setScalar(.005);
  }
  // Kulaklar: iri, üçgen, uçları kara
  for (const yon of [-1, 1]) {
    const k = new THREE.Group(); k.position.set(yon * .06, .08, -.01); k.rotation.set(-.15, 0, yon * -.3); kafa.add(k);
    parca(koni, renk, 0, .07, 0, k).scale.set(.055, .14, .025);
    parca(koni, beyaz, 0, .06, .012, k).scale.set(.034, .09, .01);
    parca(koni, kara, 0, .125, 0, k).scale.set(.028, .05, .026);
  }
  // Kuyruk: gür, uzun, hafif sarkık; ucu BEYAZ
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .45, -.28); g.add(kuyruk);
  const TY = [[0, 0, 0], [0, -.06, -.16], [0, -.12, -.34], [0, -.13, -.52], [0, -.08, -.68]];
  const tk = t => .035 + .1 * Math.pow(Math.sin(Math.PI * Math.min(1, t * .95 + .05)), .7);
  parca(geo('tilki-kuyruk', () => kalinTup(THREE, TY, tk, 0, .8)), renk, 0, 0, 0, kuyruk);
  parca(geo('tilki-kuyruk-uc', () => kalinTup(THREE, TY, t => tk(t) * 1.02, .78, 1)), beyaz, 0, 0, 0, kuyruk);

  const takim = [renk, beyaz, kara].join(',');
  duzlestir(a, kafa, 'tilki-kafa:' + takim);
  duzlestir(a, kuyruk, 'tilki-kuyruk:' + takim);
  duzlestir(a, g, 'tilki-govde:' + takim, [kafa, kuyruk]);
  g.userData = { kafa, kuyruk };
  return g;
}

/* ——— ÜZÜM SALKIMI (durak izi) ———
   Küçük bir asma kazığı: tepede çapraz çıta ve iki yaprak, çıtanın ucundan
   sarkan salkım. Ayakları y=0; olcek 1'de ~0.7 boy. */
export function uzumSalkimi(a, ebeveyn, { renk = 0x7b4f9d, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); ebeveyn.add(g);
  const { kure, kureKaba, silindir, kutu } = araclar(a);
  const parca = parcaci(a, g);
  const koyu = new THREE.Color(renk).multiplyScalar(.82).getHex();
  parca(silindir, 0x8e6344, 0, .34, 0).scale.set(.022, .68, .022);                 // kazık
  parca(kutu, 0x9c7048, .06, .64, 0).scale.set(.26, .025, .025);                  // çıta
  for (const [x, z, r] of [[-.06, .03, .5], [.1, -.03, -.6], [.02, .05, .1]]) {    // yapraklar
    const y = parca(kureKaba, 0x6f9f4a, x, .68, z); y.scale.set(.075, .02, .065); y.rotation.set(0, r, .3 * Math.sign(x || 1));
  }
  parca(silindir, 0x6f5132, .17, .6, 0).scale.set(.006, .07, .006);              // sap
  const taneler = [[.17, .54, 0], [.14, .53, .03], [.2, .53, .025], [.15, .525, -.03], [.2, .52, -.025],
                   [.17, .47, .02], [.14, .47, -.015], [.2, .47, -.01], [.17, .41, 0], [.155, .42, .03], [.185, .41, -.03], [.17, .36, .005]];
  taneler.forEach(([x, y, z], i) => parca(kureKaba, i % 3 ? renk : koyu, x, y, z).scale.setScalar(.03));
  const olc = olcek;
  duzlestir(a, g, 'salkim:' + renk).castShadow = false;
  g.scale.setScalar(olc);
  return g;
}

export default {
  sincap: sincapModeli,
  'uzum-tilki': tilkiModeli,          // ad çakışmasın: Tilki ile Leylek'in de tilkisi var
  'uzum-salkimi': uzumSalkimi
};

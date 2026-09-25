/* Yalancı Çoban için 3B modeller — tür → kurucu(a, ebeveyn, secenek) (bkz. modeller.js).

   Sözleşme: ileri +z, ayaklar y=0, a = { THREE, mal }. Geometriler modül
   düzeyinde bir kez kurulur, dünya dağıtılırken atılmaz (userData.kalici).
   Her hayvan GERÇEK hayvanına benzemeli:

   (Defterdeki adları: coban-kopek, coban-koyun, coban-kurt, coban-fener,
   coban-cocuk.)

     kopek   Karabaş, Kangal çoban köpeği (oyuncunun karakteri): uzun gövde,
             açık buğday rengi post, SİYAH maske ve öne uzanan uzun burun,
             yanlardan SARKAN koyu kulaklar, sırtına kıvrılan gür kuyruk
             (userData.kuyruk: sallanır), çivili tasma. Ayı değil: kulak
             sarkık, burun uzun, bacaklar ince ve uzun.
     koyun   sürünün koyunu (mekânda itilebilir hayvan): kıvırcık, topak
             topak yün gövde; koyu renk UZUN yüz, yana açılan kulaklar,
             alında yün perçemi, ince koyu bacaklar, küçük kuyruk.
             kuzu: true ile daha küçük ve iri başlı.
     kurt    gri kurt: sırtı koyu gri, altı krem, uzun sivri burun, DİK
             üçgen kulaklar, boyunda kabarık yele, ucu koyu gür kuyruk
             aşağı sarkık, ince uzun bacaklar.
     fener   durak izi: yere bırakılmış yanan bir gaz feneri (sapı, kapağı,
             ışıyan camı, telleri).
     cocuk   Oğuz: kare omuzlu keçe kepenek, kırmızı örgü bere, ucu kıvrık
             çoban değneği. */

const GEO = new Map();
function geo(THREE, anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}
const kure = THREE => geo(THREE, 'kure', () => new THREE.IcosahedronGeometry(1, 2));
const topak = THREE => geo(THREE, 'topak', () => new THREE.IcosahedronGeometry(1, 1));   // yün: köşeli, kabarık
const silindirG = THREE => geo(THREE, 'silindir', () => new THREE.CylinderGeometry(1, 1, 1, 10));
const koniG = THREE => geo(THREE, 'koni', () => new THREE.ConeGeometry(1, 1, 10));

/* Ortak parça kurucusu. */
function atolye(a, g) {
  const { THREE } = a;
  const Y = new THREE.Vector3(0, 1, 0);
  const koy = (m, x, y, z, ebeveyn) => { m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (ebeveyn || g).add(m); return m; };
  return {
    top: (renk, x, y, z, sx, sy = sx, sz = sx, ebeveyn, ek) => {
      const m = koy(new THREE.Mesh(kure(THREE), a.mal(renk, ek)), x, y, z, ebeveyn); m.scale.set(sx, sy, sz); return m;
    },
    yun: (renk, x, y, z, s, ebeveyn) => {
      const m = koy(new THREE.Mesh(topak(THREE), a.mal(renk)), x, y, z, ebeveyn); m.scale.setScalar(s);
      m.rotation.set(x * 7, y * 5, z * 3); return m;
    },
    koni: (renk, x, y, z, r, h, ebeveyn) => {
      const m = koy(new THREE.Mesh(koniG(THREE), a.mal(renk)), x, y, z, ebeveyn); m.scale.set(r, h, r); return m;
    },
    /* İki nokta arasında çubuk (bacak, değnek). */
    cubuk: (renk, p, q, r, ebeveyn, ek) => {
      const a0 = new THREE.Vector3(...p), b0 = new THREE.Vector3(...q), yon = b0.clone().sub(a0);
      const m = new THREE.Mesh(silindirG(THREE), a.mal(renk, ek));
      m.scale.set(r, yon.length(), r); m.position.copy(a0).add(b0).multiplyScalar(.5);
      m.quaternion.setFromUnitVectors(Y, yon.normalize());
      m.castShadow = true; (ebeveyn || g).add(m); return m;
    }
  };
}

/* ═══════════════ KÖPEK — Karabaş (Kangal) ═══════════════ */
function kopek(a, ebeveyn, { renk = 0xe2bd86, karin = 0xf8ecd2, ic = 0x2f2520, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { top, cubuk, koni } = atolye(a, g);
  const koyu = ic, pati = new THREE.Color(renk).lerp(new THREE.Color(0xffffff), .35).getHex();

  // Gövde: uzun ve derin göğüslü; sırt düz
  top(renk, 0, .44, -.04, .2, .19, .4);
  top(renk, 0, .47, .2, .2, .2, .22);                 // omuz
  top(karin, 0, .38, .3, .15, .16, .12);              // göğüs
  top(renk, 0, .45, -.3, .19, .18, .17);              // kalça
  // Bacaklar: uzun, ince; önde düz, arkada hafif dirsekli
  for (const x of [-.11, .11]) {
    cubuk(renk, [x, .4, .24], [x, .05, .27], .055);
    top(pati, x, .035, .29, .06, .035, .075);
    cubuk(renk, [x, .42, -.3], [x * 1.05, .2, -.36], .065);
    top(renk, x * 1.05, .2, -.36, .06);                  // diz (arka bacak eklemi): çubuklar kopuk görünmesin
    cubuk(renk, [x * 1.05, .2, -.36], [x, .05, -.3], .05);
    top(pati, x, .035, -.28, .06, .035, .075);
  }
  // Boyun ve tasma
  top(renk, 0, .58, .32, .13, .15, .13).rotation.x = -.5;
  const tasma = new THREE.Mesh(geo(THREE, 'tasma', () => new THREE.TorusGeometry(1, .22, 6, 18)), a.mal(0x7b3a2d));
  tasma.scale.setScalar(.12); tasma.position.set(0, .58, .34); tasma.rotation.x = Math.PI / 2 - .5; tasma.castShadow = true; g.add(tasma);
  for (let i = 0; i < 7; i++) {
    const ac = i / 7 * Math.PI * 2;
    const c = koni(0xdfe3e6, Math.cos(ac) * .15, .58 + Math.sin(ac) * .07, .34 + Math.sin(ac) * .12, .018, .05);
    c.rotation.z = -ac + Math.PI / 2;
  }
  // Kafa: geniş alın, uzun siyah burun (Kangal maskesi)
  const kafa = new THREE.Group(); kafa.position.set(0, .7, .44); g.add(kafa);
  top(renk, 0, 0, 0, .15, .14, .15, kafa);
  top(koyu, 0, -.03, .11, .088, .076, .08, kafa);              // maske: gözlerin altından başlar
  top(koyu, 0, -.05, .19, .063, .057, .1, kafa);               // uzun, siyah burun (Kangal): kökü
  top(koyu, 0, -.056, .27, .047, .044, .08, kafa);             // …ucuna doğru incelir (basık yüz değil)
  top(0x151110, 0, -.036, .345, .034, .027, .024, kafa);       // burun ucu
  top(0xe98a93, 0, -.105, .25, .026, .01, .045, kafa);         // dil ucu: dost, hafif açık ağız
  for (const yon of [-1, 1]) {
    top(0x3a2c24, yon * .064, .035, .122, .03, .028, .016, kafa);   // göz çevresi koyu
    top(0x14100e, yon * .064, .037, .133, .02, .02, .01, kafa);
    top(0xffffff, yon * .058, .045, .141, .007, .007, .004, kafa);
    top(0xf7e6c2, yon * .06, .078, .11, .025, .012, .018, kafa);   // kaş: açık lekeler
    // Sarkık kulak: kafanın yanından yanağa doğru sarkan yassı, uzun kulak
    const k = new THREE.Group(); k.position.set(yon * .135, .07, -.01); k.rotation.set(.15, 0, yon * .22); kafa.add(k);
    top(koyu, 0, -.085, 0, .028, .105, .058, k);
  }
  // Kuyruk: gür, sırtına doğru kıvrılan; kökünden sallanır
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .54, -.44); g.add(kuyruk);
  const egri = geo(THREE, 'kopek-kuyruk', () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, .12, -.08), new THREE.Vector3(0, .24, -.04),
    new THREE.Vector3(0, .27, .08), new THREE.Vector3(.02, .19, .13)]), 20, .05, 7, false));
  const km = new THREE.Mesh(egri, a.mal(renk)); km.castShadow = true; kuyruk.add(km);
  top(pati, .02, .19, .13, .05, .05, .05, kuyruk);
  g.userData = { kafa, kuyruk };
  return g;
}

/* ═══════════════ KOYUN ═══════════════ */
export function koyunModeli(a, ebeveyn, { renk = 0xf4efe4, yuz = 0x3b3531, olcek = 1, kuzu = false } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek * (kuzu ? .62 : 1)); ebeveyn.add(g);
  const { top, yun, cubuk } = atolye(a, g);
  const golge = new THREE.Color(renk).multiplyScalar(.9).getHex();
  // Bacaklar: ince ve koyu, yünün altından çıkar
  const bacakBoy = kuzu ? .3 : .26;
  for (const [x, z] of [[-.1, .17], [.1, .17], [-.1, -.17], [.1, -.17]]) {
    cubuk(yuz, [x, bacakBoy + .02, z], [x, .03, z], .032);
    top(0x1f1b19, x, .025, z + .01, .036, .025, .042);
  }
  // Yün: topak topak kabarık gövde
  const y0 = bacakBoy + .18;
  top(renk, 0, y0, 0, .24, .2, .32);
  [[0, .12, .02, .15], [-.13, .05, .12, .13], [.13, .05, .12, .13], [-.14, .04, -.13, .14], [.14, .04, -.13, .14],
   [0, .1, -.2, .14], [0, .08, .2, .13], [-.17, -.03, 0, .12], [.17, -.03, 0, .12], [0, -.06, -.26, .1]]
    .forEach(([x, y, z, s], i) => yun(i % 3 ? renk : golge, x, y0 + y, z, s));
  top(renk, 0, y0 + .02, -.33, .06);                                    // kuyruk
  // Baş: koyu, uzun; alında yün perçemi
  const bas = new THREE.Group(); bas.position.set(0, y0 + .08, .32); bas.rotation.x = .35; g.add(bas);
  top(yuz, 0, 0, .02, .075, .085, .12, bas);
  top(yuz, 0, -.03, .11, .055, .06, .07, bas);                          // burun: ince, uzun
  top(0x1a1614, 0, -.02, .17, .02, .012, .012, bas);
  for (const yon of [-1, 1]) {
    top(0x141110, yon * .055, .03, .07, .014, .016, .012, bas);          // göz
    const k = top(yuz, yon * .1, .02, -.01, .065, .022, .035, bas);      // kulak: yana açılır
    k.rotation.z = yon * -.35;
  }
  yun(renk, 0, .075, -.02, .075, bas); yun(renk, .03, .09, .03, .05, bas);
  g.userData = { bas };
  return g;
}

/* ═══════════════ KURT ═══════════════ */
export function kurtModeli(a, ebeveyn, { renk = 0x8d949b, sirt = 0x5f666d, karin = 0xece3d0, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { top, cubuk, koni } = atolye(a, g);
  // Gövde: ince uzun; sırt koyu, karın krem
  top(renk, 0, .5, -.02, .17, .17, .4);
  top(sirt, 0, .6, -.04, .12, .08, .34);
  top(karin, 0, .43, .08, .12, .1, .22);
  top(renk, 0, .55, .24, .19, .21, .2);                       // omuz ve yele
  top(karin, 0, .5, .34, .1, .13, .08);                       // göğüs
  // Bacaklar: uzun, ince
  for (const x of [-.09, .09]) {
    cubuk(renk, [x, .48, .26], [x, .04, .3], .042);
    top(karin, x, .03, .32, .045, .03, .06);
    cubuk(renk, [x, .5, -.3], [x, .24, -.38], .055);
    top(renk, x, .24, -.38, .05);
    cubuk(renk, [x, .24, -.38], [x, .04, -.32], .04);
    top(karin, x, .03, -.3, .045, .03, .06);
  }
  // Kafa: sivri burun, dik üçgen kulaklar, açık yanaklar
  const kafa = new THREE.Group(); kafa.position.set(0, .74, .42); g.add(kafa);
  top(renk, 0, 0, 0, .12, .11, .13, kafa);
  top(karin, 0, -.04, .05, .1, .07, .1, kafa);
  top(renk, 0, -.01, .15, .055, .05, .13, kafa);             // uzun burun
  top(karin, 0, -.04, .17, .045, .03, .1, kafa);
  top(0x1c1a1a, 0, 0, .28, .025, .02, .02, kafa);
  for (const yon of [-1, 1]) {
    top(0xd99a2e, yon * .055, .035, .105, .02, .016, .012, kafa);          // kehribar göz
    top(0x201c1a, yon * .058, .035, .114, .01, .01, .006, kafa);
    const k = koni(renk, yon * .07, .13, -.01, .045, .13, kafa);          // dik kulak
    k.rotation.z = yon * -.2;
    koni(0xe6c9bf, yon * .07, .125, .012, .026, .08, kafa).rotation.z = yon * -.2;
    top(karin, yon * .085, -.05, 0, .035, .045, .05, kafa);                // yanak tüyü
  }
  // Kuyruk: gür, aşağı sarkık, ucu koyu
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .56, -.42); kuyruk.rotation.x = .55; g.add(kuyruk);
  top(renk, 0, -.2, -.02, .075, .24, .075, kuyruk);
  top(0x3c4046, 0, -.42, -.03, .055, .07, .055, kuyruk);
  g.userData = { kafa, kuyruk };
  return g;
}

/* ═══════════════ FENER (durak izi) ═══════════════ */
function fener(a, ebeveyn, { renk = 0xf2c14e, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { top, cubuk } = atolye(a, g);
  const metal = 0x5d5448;
  const taban = new THREE.Mesh(silindirG(THREE), a.mal(metal)); taban.scale.set(.2, .08, .2); taban.position.y = .04; taban.castShadow = true; g.add(taban);
  const cam = new THREE.Mesh(silindirG(THREE), a.mal(0xfff1b8, { emissive: renk, emissiveIntensity: .9, transparent: true, opacity: .92 }));
  cam.scale.set(.15, .32, .15); cam.position.y = .25; g.add(cam);
  top(0xffb43c, 0, .24, 0, .045, .08, .045, undefined, { emissive: 0xff9a2a, emissiveIntensity: 1.2 });
  for (let i = 0; i < 4; i++) {                                         // tel kafes
    const ac = i / 4 * Math.PI * 2 + .4;
    cubuk(metal, [Math.cos(ac) * .16, .09, Math.sin(ac) * .16], [Math.cos(ac) * .16, .41, Math.sin(ac) * .16], .012);
  }
  const kapak = new THREE.Mesh(koniG(THREE), a.mal(metal)); kapak.scale.set(.2, .12, .2); kapak.position.y = .47; kapak.castShadow = true; g.add(kapak);
  const halka = new THREE.Mesh(geo(THREE, 'fener-halka', () => new THREE.TorusGeometry(1, .12, 6, 16, Math.PI)), a.mal(metal));
  halka.scale.setScalar(.1); halka.position.y = .53; g.add(halka);
  // Yere düşen ışık lekesi
  const leke = new THREE.Mesh(geo(THREE, 'fener-leke', () => new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2)),
    a.mal(0xffe3a0, { transparent: true, opacity: .35, emissive: 0xffc24a, emissiveIntensity: .5, depthWrite: false }));
  leke.scale.setScalar(.34); leke.position.y = .005; g.add(leke);
  return g;
}

/* ═══════════════ ÇOCUK — Oğuz ═══════════════ */
export function cocukModeli(a, ebeveyn, { olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { top, cubuk } = atolye(a, g);
  const ten = 0xf4c9a0, kepenek = 0xd9bb84;
  for (const x of [-.07, .07]) { cubuk(0x6f5a4a, [x, .3, 0], [x, .05, 0], .045); top(0x8a5a36, x, .03, .03, .05, .03, .08); }
  top(0xd8674f, 0, .42, 0, .12, .14, .09);                               // gömlek
  // Kepenek: kare omuzlu keçe pelerin
  const kp = new THREE.Mesh(geo(THREE, 'kepenek', () => new THREE.CylinderGeometry(.13, .22, .42, 4, 1, true)), a.mal(kepenek, { side: THREE.DoubleSide }));
  kp.position.set(0, .4, -.02); kp.rotation.y = Math.PI / 4; kp.castShadow = true; g.add(kp);
  top(kepenek, 0, .6, -.02, .2, .05, .1);                                 // omuzlar
  top(ten, 0, .76, 0, .12, .12, .11);                                     // baş
  top(0x2a2322, -.04, .78, .1, .013); top(0x2a2322, .04, .78, .1, .013);
  top(0xf29d85, -.07, .74, .08, .02, .012, .01); top(0xf29d85, .07, .74, .08, .02, .012, .01);
  const bere = top(0xd9544a, 0, .83, -.01, .125, .08, .12); bere.scale.y = .08;
  top(0xd9544a, 0, .85, -.01, .12, .07, .115);
  top(0xf3e2c2, 0, .93, -.02, .04);                                       // ponpon
  top(ten, .17, .5, .06, .035);                                           // el
  // Çoban değneği: uzun, ucu kıvrık
  cubuk(0x8a6034, [.19, .02, .08], [.19, .98, .08], .018);
  const kanca = new THREE.Mesh(geo(THREE, 'degnek', () => new THREE.TorusGeometry(1, .16, 6, 14, Math.PI * 1.2)), a.mal(0x8a6034));
  kanca.scale.setScalar(.07); kanca.position.set(.26, .98, .08); kanca.rotation.z = -.15; g.add(kanca);
  return g;
}

/* Adların önünde masal kodu var: model defteri bütün masallarda ortak,
   başka bir masalın 'kurt'u ya da 'koyun'u bizimkini ezmesin. */
export default {
  'coban-kopek': kopek,
  'coban-koyun': (a, ebeveyn, s) => koyunModeli(a, ebeveyn, s),
  'coban-kurt': (a, ebeveyn, s) => kurtModeli(a, ebeveyn, s),
  'coban-fener': fener,
  'coban-cocuk': (a, ebeveyn, s) => cocukModeli(a, ebeveyn, s)
};

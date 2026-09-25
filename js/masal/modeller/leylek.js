/* Tilki ile Leylek için 3B modeller — tür → kurucu(a, ebeveyn, secenek) (bkz. modeller.js).

   Sözleşme: ileri +z, ayaklar y=0, a = { THREE, mal }. Geometriler modül
   düzeyinde bir kez kurulur, dünya dağıtılırken atılmaz (userData.kalici).
   Her hayvan GERÇEK hayvanına benzer:

     leylek   çocuğun oyuncu karakteri (leylek yavrusu): beyaz gövde, kanadın
              arka kenarında SİYAH uçuş tüyleri, uzun S boyun, küçük baş,
              UZUN KIRMIZI GAGA, uzun kırmızı bacaklar ve öne açılan üç
              parmak. Kuyruk sallanmaz; userData.kuyruk BOYUNDUR: dunya.js
              onu sallar, baş hafifçe sağa sola gider. Yürürken bacaklar
              adım atar (kendi onBeforeRender'ında: grubun dünyadaki yeri
              değişiyorsa yürüyordur).
     tabak    durak izi ('leylek-tabak'): kenarı mavi şeritli, içinde çorba olan düz tabak.
     tilki    turuncu gövde, beyaz göğüs ve çene, sivri burun ve siyah
              burun ucu, üçgen kulaklar (ucu siyah), siyah çoraplı ince
              bacaklar, gür ve UCU BEYAZ kuyruk.
     tavuk    köyde gezen tavuk: dolgun gövde, yukarı kalkık kuyruk
              tüyleri, kırmızı ibik ve sakal, sarı gaga ve bacaklar. */

const GEO = new Map();
function geo(THREE, anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}
const kure = THREE => geo(THREE, 'kure', () => new THREE.IcosahedronGeometry(1, 2));
const kureKaba = THREE => geo(THREE, 'kureKaba', () => new THREE.IcosahedronGeometry(1, 1));
const silindirG = THREE => geo(THREE, 'silindir', () => new THREE.CylinderGeometry(1, 1, 1, 8));
const koniIleri = THREE => geo(THREE, 'koniIleri', () => new THREE.ConeGeometry(1, 1, 12).rotateX(Math.PI / 2));   // ucu +z
const koniYukari = THREE => geo(THREE, 'koniYukari', () => new THREE.ConeGeometry(1, 1, 4));

function atolye(a, g) {
  const { THREE } = a;
  const Y = new THREE.Vector3(0, 1, 0);
  const ekle = (m, e) => { m.castShadow = true; m.receiveShadow = true; e.add(m); return m; };
  return {
    top: (renk, x, y, z, sx, sy = sx, sz = sx, e = g, ek) => {
      const m = new THREE.Mesh(kure(THREE), a.mal(renk, ek)); m.position.set(x, y, z); m.scale.set(sx, sy, sz); return ekle(m, e);
    },
    kaba: (renk, x, y, z, s, e = g) => {
      const m = new THREE.Mesh(kureKaba(THREE), a.mal(renk)); m.position.set(x, y, z); m.scale.setScalar(s); return ekle(m, e);
    },
    /* İki nokta arasında çubuk (bacak, parmak). */
    cubuk: (renk, p, q, r, e = g) => {
      const a0 = new THREE.Vector3(...p), b0 = new THREE.Vector3(...q), yon = b0.clone().sub(a0);
      const m = new THREE.Mesh(silindirG(THREE), a.mal(renk));
      m.scale.set(r, yon.length(), r); m.position.copy(a0).add(b0).multiplyScalar(.5);
      m.quaternion.setFromUnitVectors(Y, yon.normalize());
      return ekle(m, e);
    },
    koni: (renk, x, y, z, r, boy, e = g) => {
      const m = new THREE.Mesh(koniIleri(THREE), a.mal(renk)); m.position.set(x, y, z); m.scale.set(r, r, boy); return ekle(m, e);
    },
    kulak: (renk, x, y, z, r, boy, e = g) => {
      const m = new THREE.Mesh(koniYukari(THREE), a.mal(renk)); m.position.set(x, y, z); m.scale.set(r, boy, r * .55); return ekle(m, e);
    }
  };
}

/* Yürüyüş: grubun dünyadaki yeri kareden kareye değişiyorsa hayvan yürüyordur.
   Bacaklar burada, çizimden hemen önce oynatılır; durunca yerine döner. */
function yurumeKur(mesh, adim) {
  let onceki = null, sonMs = 0, faz = 0, hiz = 0;
  mesh.onBeforeRender = () => {
    const ms = performance.now();
    if (ms - sonMs < 4) return;                     // aynı karede gölge + ana çizim
    const dt = Math.min(.1, (ms - sonMs) / 1000 || .016); sonMs = ms;
    const e = mesh.matrixWorld.elements, x = e[12], z = e[14];
    if (onceki) {
      const v = Math.hypot(x - onceki.x, z - onceki.z) / dt;
      hiz += (Math.min(1, v / 3) - hiz) * Math.min(1, dt * 10);
    }
    onceki = { x, z };
    faz += dt * 13 * hiz;
    adim(faz, hiz);
  };
}

/* ═══════════════ LEYLEK ═══════════════ */
function leylek(a, ebeveyn, { renk = 0xf8f7f2, karin = 0x2a2b30, ic = 0xe0532f, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const k = atolye(a, g);
  const beyaz = renk ?? 0xf8f7f2, siyah = karin ?? 0x2a2b30, kirmizi = ic ?? 0xe0532f;

  // Bacaklar: kalçadan dizine (geriye kırık), dizden ayağa; öne açılan üç parmak
  const bacaklar = [];
  for (const s of [-1, 1]) {
    const kalca = new THREE.Group(); kalca.position.set(s * .06, .33, -.02); g.add(kalca);
    k.cubuk(kirmizi, [0, 0, 0], [0, -.15, -.035], .014, kalca);
    k.top(kirmizi, 0, -.15, -.035, .02, .02, .02, kalca);
    k.cubuk(kirmizi, [0, -.15, -.035], [0, -.325, .01], .012, kalca);
    for (const p of [-.5, 0, .5]) k.cubuk(kirmizi, [0, -.325, .01], [Math.sin(p) * .06, -.33, .01 + Math.cos(p) * .06], .007, kalca);
    k.cubuk(kirmizi, [0, -.325, .01], [0, -.33, -.035], .006, kalca);
    bacaklar.push({ kalca, s });
  }
  // Gövde: yumurta, önü hafif yukarıda; kısa beyaz kuyruk
  const govde = k.top(beyaz, 0, .42, -.02, .15, .14, .25); govde.rotation.x = -.18;
  k.top(beyaz, 0, .44, -.25, .07, .04, .09).rotation.x = .3;
  // Katlanmış kanatlar: beyaz örtü tüyleri, arka kenarda siyah uçuş tüyleri
  for (const s of [-1, 1]) {
    const kanat = new THREE.Group(); kanat.position.set(s * .125, .45, -.04); kanat.rotation.set(-.2, s * .08, 0); g.add(kanat);
    k.top(beyaz, 0, 0, .03, .045, .1, .2, kanat);
    k.top(siyah, s * .004, -.03, -.11, .04, .075, .17, kanat).rotation.x = .12;
    k.top(siyah, s * .002, -.055, -.2, .03, .05, .1, kanat).rotation.x = .3;
  }
  // Uzun S boyun: kökünden döner (dunya.js'in "kuyruk" sallaması boynu sallar)
  const boyun = new THREE.Group(); boyun.position.set(0, .5, .16); g.add(boyun);
  const boyunGeo = geo(THREE, 'leylekBoyun', () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -.04, -.03), new THREE.Vector3(0, .05, .03), new THREE.Vector3(0, .12, .01), new THREE.Vector3(0, .18, .04)]), 16, .042, 8, false));
  const bm = new THREE.Mesh(boyunGeo, a.mal(beyaz)); bm.castShadow = true; boyun.add(bm);
  const kafa = new THREE.Group(); kafa.position.set(0, .2, .05); boyun.add(kafa);
  k.top(beyaz, 0, 0, 0, .062, .058, .07, kafa);
  // Göz: siyah boncuk, çevresinde ince koyu halka; üstünde parlama
  for (const s of [-1, 1]) {
    k.top(0x1f2024, s * .045, .015, .03, .016, .018, .014, kafa);
    k.kaba(0xffffff, s * .05, .022, .04, .005, kafa);
  }
  // Uzun kırmızı gaga: düz, sivri, hafif aşağı
  const gaga = k.koni(kirmizi, 0, -.012, .2, .022, .28, kafa); gaga.rotation.x = .12;
  k.koni(new THREE.Color(kirmizi).multiplyScalar(.8).getHex(), 0, -.019, .19, .016, .25, kafa).rotation.x = .16;

  yurumeKur(govde, (faz, hiz) => {
    for (const b of bacaklar) b.kalca.rotation.x = Math.sin(faz + (b.s < 0 ? 0 : Math.PI)) * .5 * hiz;
    kafa.rotation.x = Math.sin(faz * 2) * .06 * hiz;
  });
  g.userData = { kafa, kuyruk: boyun, bacaklar };
  return g;
}

/* ═══════════════ TABAK (durak izi) ═══════════════ */
function tabak(a, ebeveyn, { renk = 0xf3efe4, olcek = .42 } = {}) {
  const { THREE } = a;
  /* dunya.js izi .42 ölçekle ister ve grubu ~2 kat büyütür: tabak yerde ~.28 birim yarıçapta kalsın. */
  const g = new THREE.Group(); g.scale.setScalar(olcek / .42 * .26); ebeveyn.add(g);
  const tabakGeo = geo(THREE, 'tabakGeo', () => new THREE.LatheGeometry([
    [0, 0], [.34, 0], [.36, .02], [.5, .07], [.53, .09], [.5, .1], [.36, .05], [0, .05]
  ].map(([r, y]) => new THREE.Vector2(r, y)), 28));
  const t = new THREE.Mesh(tabakGeo, a.mal(renk ?? 0xf3efe4)); t.castShadow = true; t.receiveShadow = true; g.add(t);
  const serit = new THREE.Mesh(geo(THREE, 'tabakSerit', () => new THREE.TorusGeometry(.44, .012, 4, 32).rotateX(Math.PI / 2)), a.mal(0x7fb0c9));
  serit.position.y = .085; g.add(serit);
  const corba = new THREE.Mesh(geo(THREE, 'tabakCorba', () => new THREE.CylinderGeometry(.33, .33, .012, 24)), a.mal(0xe9a24a));
  corba.position.y = .062; g.add(corba);
  /* Yalnız üç parça: tabak, şerit, çorba. İz her durakta bir tane; çizim sayısı az kalsın. */
  return g;
}

/* ═══════════════ TİLKİ ═══════════════ */
function tilki(a, ebeveyn, { renk = 0xe27a32, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const k = atolye(a, g);
  const turuncu = renk ?? 0xe27a32, beyaz = 0xfbf5ea, siyah = 0x2e2522;
  // Bacaklar: ince, alt yarısı siyah çorap
  const bacaklar = [];
  for (const [x, z] of [[-.08, .13], [.08, .13], [-.08, -.13], [.08, -.13]]) {
    const kalca = new THREE.Group(); kalca.position.set(x, .24, z); g.add(kalca);
    k.cubuk(turuncu, [0, 0, 0], [0, -.11, 0], .03, kalca);
    k.cubuk(siyah, [0, -.11, 0], [0, -.235, .01], .026, kalca);
    k.top(siyah, 0, -.235, .03, .03, .018, .045, kalca);
    bacaklar.push({ kalca, faz: (x < 0) === (z > 0) ? 0 : Math.PI });
  }
  // Gövde ve beyaz göğüs
  const govde = k.top(turuncu, 0, .31, 0, .13, .12, .25);
  k.top(beyaz, 0, .28, .15, .085, .095, .095);
  // Baş: yanaklar geniş, öne sivrilen burun; burnun altı ve çene beyaz, ucu siyah
  const kafa = new THREE.Group(); kafa.position.set(0, .45, .24); g.add(kafa);
  k.top(turuncu, 0, 0, 0, .1, .085, .09, kafa);
  for (const s of [-1, 1]) k.top(turuncu, s * .062, -.02, .005, .05, .05, .055, kafa);        // gür yanaklar
  k.koni(turuncu, 0, -.005, .115, .052, .15, kafa);                                            // burun sırtı
  k.top(beyaz, 0, -.05, .06, .075, .035, .07, kafa);                                            // beyaz çene
  k.koni(beyaz, 0, -.03, .11, .038, .13, kafa).scale.y = .026;                                 // burnun beyaz altı
  for (const s of [-1, 1]) k.top(beyaz, s * .085, -.04, .02, .03, .026, .04, kafa);             // yanak ucu beyaz
  k.top(siyah, 0, -.008, .19, .02, .017, .017, kafa);
  for (const s of [-1, 1]) {
    k.top(0x2a2320, s * .047, .022, .07, .014, .016, .012, kafa);
    // Kulak: geniş üçgen, arkası turuncu, içi krem, ucu siyah
    const kulak = new THREE.Group(); kulak.position.set(s * .058, .07, -.015); kulak.rotation.z = -s * .28; kafa.add(kulak);
    k.kulak(turuncu, 0, .045, 0, .062, .1, kulak);
    k.kulak(0xfbe3c6, 0, .04, .014, .04, .07, kulak);
    k.kulak(siyah, 0, .083, .001, .026, .03, kulak);
  }
  // Gür kuyruk: kökten yukarı kıvrılır, ucu beyaz
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .34, -.22); kuyruk.rotation.x = -.6; g.add(kuyruk);
  k.top(turuncu, 0, 0, -.12, .075, .075, .16, kuyruk);
  k.top(turuncu, 0, .02, -.25, .085, .085, .1, kuyruk);
  k.top(beyaz, 0, .03, -.34, .06, .06, .06, kuyruk);
  yurumeKur(govde, (faz, hiz) => { for (const b of bacaklar) b.kalca.rotation.x = Math.sin(faz + b.faz) * .45 * hiz; });
  g.userData = { kafa, kuyruk, bacaklar };
  return g;
}

/* ═══════════════ TAVUK ═══════════════ */
function tavuk(a, ebeveyn, { renk = 0xf4efe2, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const k = atolye(a, g);
  const tuy = renk ?? 0xf4efe2, sari = 0xe9b44c, kirmizi = 0xd9483a;
  for (const s of [-1, 1]) {
    k.cubuk(sari, [s * .05, .14, 0], [s * .05, .01, .02], .012);
    for (const p of [-.5, 0, .5]) k.cubuk(sari, [s * .05, .01, .02], [s * .05 + Math.sin(p) * .05, .005, .02 + Math.cos(p) * .05], .006);
  }
  k.top(tuy, 0, .23, 0, .13, .11, .16);
  for (const s of [-1, 1]) k.top(new THREE.Color(tuy).multiplyScalar(.92).getHex(), s * .1, .24, -.01, .04, .075, .12);
  // Kuyruk tüyleri: arkada yukarı kalkık
  for (const [x, r] of [[-.035, -.25], [0, 0], [.035, .25]]) {
    const t = k.top(tuy, x, .33, -.15, .03, .08, .045); t.rotation.set(-.5, 0, r);
  }
  const kafa = new THREE.Group(); kafa.position.set(0, .36, .12); g.add(kafa);
  k.top(tuy, 0, 0, 0, .07, .075, .07, kafa);
  for (const [z, y] of [[-.03, .085], [0, .095], [.03, .085]]) k.top(kirmizi, 0, y, z, .018, .03, .02, kafa);   // ibik
  k.koni(sari, 0, -.01, .085, .02, .05, kafa);
  k.top(kirmizi, 0, -.05, .06, .016, .026, .014, kafa);                                                     // sakal
  for (const s of [-1, 1]) k.top(0x2a2320, s * .045, .015, .045, .012, .014, .01, kafa);
  g.userData = { kafa };
  return g;
}

/* Dünyanın defterine yalnız bu masala özgü adlar girer (piyonTur, iz).
   Defter bütün masallarda ortak: iz 'leylek-tabak' adıyla kayıtlı ki başka
   bir masalın 'tabak'ı ile çakışmasın. Tilki ve tavuk başka masallarda da
   olabilir; onları mekân doğrudan alır. */
export { leylek, tabak, tilki as leylekTilki, tavuk as leylekTavuk };
export default { leylek, 'leylek-tabak': tabak };

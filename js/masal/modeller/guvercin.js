/* Karınca ile Güvercin için 3B modeller — tür → kurucu(a, ebeveyn, secenek) (bkz. modeller.js).

   Hepsinde aynı sözleşme: ileri +z, ayaklar y=0, a = { THREE, mal }.
   Geometriler modül düzeyinde bir kez kurulur ve dünya dağıtılırken
   atılmaz (userData.kalici). Her hayvan GERÇEK hayvanına benzemeli:

     karinca3b    üç bölüm gövde (baş, göğüs, karın) ve ince bel düğümü,
                  göğüsten çıkan altı eklemli bacak, dirsekli iki duyarga,
                  iki çene. Yürürken bacaklar üçlü adımla oynar.
     guvercin3b   küçük baş, tombul gri gövde, yeşil-mor parlayan boyun,
                  kanatta iki siyah bant, koyu kuyruk ucu, kırmızı bacak,
                  turuncu göz, gagada beyaz et.
     kedi3b       tekir: üçgen kulak, bıyık, alında "M", sırtta çizgiler,
                  halkalı uzun kuyruk, yeşil göz (uyurken kapalı).
     kurbaga3b    basık gövde, başın ÜSTÜNDE patlak gözler, geniş ağız,
                  katlanmış uzun arka bacak, perdeli ayak, sırtta benek.
     yaprak-kayik dereye bırakılan çınar yaprağı: beş uçlu, ortası çukur,
                  damarlı, sapı kıvrık. */

const GEO = new Map();
function geo(THREE, anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}
const kure = THREE => geo(THREE, 'kure', () => new THREE.IcosahedronGeometry(1, 2));
const kureKaba = THREE => geo(THREE, 'kureKaba', () => new THREE.IcosahedronGeometry(1, 1));
const silindirG = THREE => geo(THREE, 'silindir', () => new THREE.CylinderGeometry(1, 1, 1, 8));
const koniG = THREE => geo(THREE, 'koni', () => new THREE.ConeGeometry(1, 1, 10));

/* Ortak parça kurucusu: bir gruba küre/silindir/çubuk ekler. */
function atolye(a, g) {
  const { THREE } = a;
  const Y = new THREE.Vector3(0, 1, 0);
  const parca = (geometri, renk, x, y, z, ek) => {
    const m = new THREE.Mesh(geometri, a.mal(renk, ek)); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  return {
    parca,
    top: (renk, x, y, z, sx, sy = sx, sz = sx, ebeveyn = g, ek) => {
      const m = new THREE.Mesh(kure(THREE), a.mal(renk, ek)); m.position.set(x, y, z); m.scale.set(sx, sy, sz);
      m.castShadow = true; m.receiveShadow = true; ebeveyn.add(m); return m;
    },
    /* İki nokta arasında ince çubuk (bacak, duyarga, bıyık). */
    cubuk: (renk, p, q, r, ebeveyn = g, rUc = r) => {
      const a0 = new THREE.Vector3(...p), b0 = new THREE.Vector3(...q), yon = b0.clone().sub(a0);
      const boy = yon.length();
      const m = new THREE.Mesh(rUc === r ? silindirG(THREE)
        : geo(THREE, `sivri${(rUc / r).toFixed(2)}`, () => new THREE.CylinderGeometry(rUc / r, 1, 1, 7)), a.mal(renk));
      m.scale.set(r, boy, r); m.position.copy(a0).add(b0).multiplyScalar(.5);
      m.quaternion.setFromUnitVectors(Y, yon.normalize());
      m.castShadow = true; ebeveyn.add(m); return m;
    }
  };
}

/* ═══════════════ KARINCA ═══════════════ */
function karinca3b(a, ebeveyn, { renk = 0x8e3b22, koyu, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek * 1.12); ebeveyn.add(g);
  const { top, cubuk } = atolye(a, g);
  const govde = renk, bacakRenk = koyu ?? new THREE.Color(renk).multiplyScalar(.55).getHex();
  const parlak = new THREE.Color(renk).lerp(new THREE.Color(0xffe2c8), .35).getHex();
  const cila = { roughness: .38, metalness: .08 };

  // 3 · KARIN (gaster): en büyük bölüm, arkaya ve biraz aşağı sarkık
  /* Karın bel düğümüne DEĞMELİ: eskiden yandan bakınca arada boşluk
     kalıyor, karın havada asılı bir yumurta gibi duruyordu. */
  const karin = new THREE.Group(); karin.position.set(0, .31, -.225); g.add(karin);
  top(govde, 0, 0, -.12, .19, .17, .24, karin, cila).rotation.x = .28;
  top(parlak, -.05, .1, -.08, .07, .04, .09, karin, { roughness: .3 });         // parlama
  for (const [z, s] of [[-.02, .98], [-.14, 1], [-.25, .82]]) {                  // halka çizgileri
    const h = top(bacakRenk, 0, .005 - z * .28, z, .185 * s, .166 * s, .018, karin, cila); h.rotation.x = .28;
  }
  // bel: ince sap, sivri tek düğüm (petiole) ve karnın ağzına inen kısa boyun
  top(govde, 0, .305, -.075, .042, .062, .045, g, cila);
  cubuk(bacakRenk, [0, .28, -.03], [0, .29, .03], .024);
  cubuk(bacakRenk, [0, .29, -.1], [0, .275, -.155], .026);
  // 2 · GÖĞÜS (mesosoma): uzun ve dar, önü yükselir
  const gogus = top(govde, 0, .31, .08, .085, .085, .15, g, cila); gogus.rotation.x = -.35;
  // 1 · BAŞ: büyük, yuvarlak ama önden bakınca kalp gibi geniş
  const bas = new THREE.Group(); bas.position.set(0, .38, .3); g.add(bas);
  top(govde, 0, 0, 0, .135, .12, .125, bas, cila);
  top(parlak, -.04, .07, .02, .05, .025, .05, bas, { roughness: .3 });
  // gözler: iki yanda iri, parlak siyah; üstünde ışık
  for (const s of [-1, 1]) {
    top(0x1f1a1c, s * .1, .025, .055, .045, .055, .045, bas, { roughness: .2 });
    top(0xffffff, s * .112, .05, .09, .014, .016, .012, bas);
  }
  // çeneler: ağzın iki yanında içe kıvrılan iki küçük orak
  for (const s of [-1, 1]) {
    cubuk(bacakRenk, [s * .055, -.06, .1], [s * .075, -.075, .17], .016, bas, .008);
    cubuk(bacakRenk, [s * .075, -.075, .17], [s * .02, -.08, .2], .01, bas, .006);
  }
  // duyargalar: kafadan yukarı çıkan uzun sap, dirsek, öne uzanan kamçı, uçta topuz
  const duyarga = new THREE.Group(); duyarga.position.set(0, .07, .06); bas.add(duyarga);
  for (const s of [-1, 1]) {
    cubuk(bacakRenk, [s * .04, 0, 0], [s * .1, .19, .04], .014, duyarga);
    cubuk(bacakRenk, [s * .1, .19, .04], [s * .2, .16, .22], .012, duyarga, .009);
    top(bacakRenk, s * .205, .158, .228, .022, .022, .03, duyarga);
  }

  // Bacaklar: göğüsten çıkan üç çift; kalça → uyluk (yukarı) → diz → baldır (yere)
  const bacaklar = [];
  [[.14, -.62], [.07, -.08], [0, .58]].forEach(([z, aci], i) => {
    for (const s of [-1, 1]) {
      const kalca = new THREE.Group(); kalca.position.set(s * .06, .27, z); g.add(kalca);
      const baz = s * aci; kalca.rotation.y = baz;
      cubuk(bacakRenk, [0, 0, 0], [s * .17, .12, 0], .02, kalca);
      top(bacakRenk, s * .17, .12, 0, .024, .024, .024, kalca);
      cubuk(bacakRenk, [s * .17, .12, 0], [s * .31, -.26, 0], .016, kalca, .011);
      top(bacakRenk, s * .315, -.265, 0, .018, .014, .026, kalca);
      // üçlü yürüyüş: sol-ön, sağ-orta, sol-arka birlikte; öbür üçü ters fazda
      const takim = (i + (s < 0 ? 0 : 1)) % 2;
      bacaklar.push({ kalca, baz, s, faz: takim * Math.PI });
    }
  });

  /* Yürüyüş: dunya.js yalnız kuyruğu sallar. Bacaklar burada, çizimden
     hemen önce oynatılır: grubun dünyadaki yeri kareden kareye değişiyorsa
     karınca yürüyordur. Durunca bacaklar yavaşça yerine döner. */
  const baskafa = bas.children[0];
  let onceki = null, sonMs = 0, faz = 0, hiz = 0;
  baskafa.onBeforeRender = () => {
    const ms = performance.now();
    if (ms - sonMs < 4) return;                     // aynı karede gölge + ana çizim
    const dt = Math.min(.1, (ms - sonMs) / 1000 || .016); sonMs = ms;
    const e = baskafa.matrixWorld.elements, x = e[12], z = e[14];
    if (onceki) {
      const v = Math.hypot(x - onceki.x, z - onceki.z) / dt;
      hiz += (Math.min(1, v / 3) - hiz) * Math.min(1, dt * 10);
    }
    onceki = { x, z };
    faz += dt * 15 * hiz;
    for (const b of bacaklar) {
      const f = faz + b.faz, sal = Math.sin(f) * .42 * hiz, kalk = Math.max(0, Math.cos(f)) * .38 * hiz;
      b.kalca.rotation.y = b.baz - b.s * sal;
      b.kalca.rotation.z = b.s * kalk;
    }
    karin.rotation.y = Math.sin(faz * .5) * .06 * hiz;
    bas.rotation.x = -Math.abs(Math.sin(faz)) * .05 * hiz;
  };
  g.userData = { kafa: bas, kuyruk: duyarga, bacaklar };
  return g;
}

/* ═══════════════ GÜVERCİN ═══════════════ */
function guvercin3b(a, ebeveyn, { renk = 0xa7afba, olcek = 1, uyku = false } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { top, cubuk, parca } = atolye(a, g);
  const gri = renk, koyuGri = new THREE.Color(renk).multiplyScalar(.72).getHex(), bant = 0x2f3238;
  // Gövde: tombul, göğüs öne dolgun
  top(gri, 0, .32, -.04, .19, .18, .29);
  top(0xb9b1bf, 0, .33, .13, .165, .17, .15);                                      // pembemsi gri göğüs
  // Boyun: yeşil ve mor parlayan halka
  top(0x4f9a86, 0, .46, .16, .12, .11, .1, g, { roughness: .28, metalness: .4 });
  top(0x86609b, 0, .42, .19, .115, .08, .085, g, { roughness: .28, metalness: .4 });
  // Baş: gövdeye göre küçük, koyuca gri
  const bas = new THREE.Group(); bas.position.set(0, .6, .2); g.add(bas);
  top(koyuGri, 0, 0, 0, .09, .088, .095, bas);
  for (const s of [-1, 1]) {                                                        // turuncu göz
    top(0xe5892f, s * .062, .02, .05, .024, .024, .016, bas);
    top(uyku ? koyuGri : 0x151515, s * .07, .02, .056, uyku ? .026 : .012, uyku ? .008 : .012, .01, bas);
  }
  const gaga = parca(koniG(THREE), 0x3b3538, 0, -.018, .13); gaga.scale.set(.018, .075, .02);
  gaga.rotation.x = Math.PI / 2 + .12; bas.add(gaga);
  top(0xf2efe8, 0, .002, .1, .02, .016, .022, bas);                                 // gaga üstündeki beyaz et
  // Kanatlar: iki siyah bant, koyu uç tüyler
  for (const s of [-1, 1]) {
    const k = new THREE.Group(); k.position.set(s * .165, .35, -.06); k.rotation.set(-.12, s * .08, s * .1); g.add(k);
    top(0x9ea6b1, 0, 0, 0, .05, .13, .25, k);
    top(bant, s * .012, -.02, .02, .045, .11, .022, k);
    top(bant, s * .012, -.03, -.09, .045, .1, .022, k);
    top(0x4d535c, 0, -.03, -.22, .04, .08, .1, k);
  }
  // Kuyruk: yelpaze, ucunda koyu bant
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .3, -.3); kuyruk.rotation.x = .3; g.add(kuyruk);
  top(0x98a0ab, 0, 0, -.1, .11, .025, .15, kuyruk);
  top(bant, 0, -.004, -.23, .105, .022, .04, kuyruk);
  // Bacaklar: kısa, kırmızımsı pembe; öne üç parmak
  for (const s of [-1, 1]) {
    cubuk(0xd65f66, [s * .07, .17, .04], [s * .075, .02, .07], .018);
    for (const p of [-.35, 0, .35]) cubuk(0xd65f66, [s * .075, .015, .07], [s * .075 + Math.sin(p) * .06, .01, .07 + Math.cos(p) * .07], .01);
    cubuk(0xd65f66, [s * .075, .015, .07], [s * .075, .01, .01], .009);
  }
  g.userData = { kafa: bas, kuyruk };
  return g;
}

/* ═══════════════ TEKİR KEDİ ═══════════════ */
function kedi3b(a, ebeveyn, { renk = 0x9a8a76, olcek = 1, uyku = false } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { top, cubuk, parca } = atolye(a, g);
  const cizgi = 0x4c4136, acik = 0xeae1d3, pembe = 0xe9a3a0;
  // Gövde: yere uzanmış (sfenks duruşu), arkada dolgun kalça
  top(renk, 0, .2, -.06, .22, .19, .4);
  for (const s of [-1, 1]) top(renk, s * .13, .15, -.26, .1, .12, .15);             // arka kalçalar
  top(acik, 0, .14, .22, .13, .12, .12);                                             // beyaz göğüs
  // Sırt çizgileri: tekirin enine koyu bantları
  for (let i = 0; i < 5; i++) {
    const z = .2 - i * .13;
    const b = top(cizgi, 0, .365 - Math.abs(z + .05) * .08, z, .15, .035, .026); b.rotation.x = -.1;
  }
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {                              // yan çizgiler
    const b = top(cizgi, s * .205, .22, .12 - i * .15, .018, .07, .025); b.rotation.z = s * .5;
  }
  // Ön patiler öne uzanmış
  for (const s of [-1, 1]) {
    top(renk, s * .1, .06, .26, .06, .055, .14);
    top(acik, s * .1, .045, .38, .058, .045, .06);
    for (let i = 0; i < 2; i++) top(cizgi, s * .1, .085, .2 + i * .08, .062, .012, .016);
  }
  // Baş
  const bas = new THREE.Group(); bas.position.set(0, .38, .38); g.add(bas);
  top(renk, 0, 0, 0, .17, .15, .15, bas);
  top(renk, 0, -.03, .02, .19, .11, .13, bas);                                       // yanaklar
  top(acik, 0, -.06, .12, .085, .06, .06, bas);                                     // ağız çevresi
  // Burun: pembe üçgen
  const burun = parca(koniG(THREE), pembe, 0, -.02, .165); burun.scale.set(.025, .03, .015);
  burun.rotation.x = Math.PI; bas.add(burun);
  // Gözler: yeşil badem, dikey siyah göz bebeği (uykuda kapalı çizgi)
  for (const s of [-1, 1]) {
    if (uyku) {
      const k = top(cizgi, s * .07, .035, .135, .04, .007, .01, bas); k.rotation.z = s * -.15;
    } else {
      top(0x86b852, s * .07, .035, .13, .038, .03, .02, bas, { roughness: .25 });
      top(0x151515, s * .072, .035, .145, .009, .026, .008, bas);
      top(0xffffff, s * .06, .05, .148, .007, .007, .005, bas);
    }
  }
  // Alında "M" çizgileri
  for (const [x, aci] of [[-.05, .5], [-.017, -.4], [.017, .4], [.05, -.5]]) {
    const c = top(cizgi, x, .1, .1, .008, .04, .01, bas); c.rotation.z = aci; c.rotation.x = -.5;
  }
  // Kulaklar: sivri üçgen, içi pembe
  const kulak = geo(THREE, 'kulakKoni', () => new THREE.ConeGeometry(1, 1, 4));
  for (const s of [-1, 1]) {
    const k = new THREE.Group(); k.position.set(s * .1, .12, -.01); k.rotation.set(-.1, s * -.45, s * -.28); bas.add(k);
    const d = new THREE.Mesh(kulak, a.mal(renk)); d.scale.set(.065, .12, .035); d.position.y = .05; d.castShadow = true; k.add(d);
    const ic = new THREE.Mesh(kulak, a.mal(pembe)); ic.scale.set(.04, .085, .02); ic.position.set(0, .04, .015); k.add(ic);
  }
  // Bıyıklar
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++)
    cubuk(0xf6f1e8, [s * .04, -.05, .15], [s * .22, -.03 - i * .035 + .03, .12 - i * .02], .0035, bas);
  // Kuyruk: uzun, gövdenin yanına kıvrılır, koyu halkalı; kökünden sallanır
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .16, -.42); g.add(kuyruk);
  const egri = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(.12, -.08, -.18), new THREE.Vector3(.32, -.11, -.12),
    new THREE.Vector3(.42, -.11, .12), new THREE.Vector3(.38, -.1, .36)]);
  const kuyrukGeo = geo(THREE, 'kediKuyruk', () => new THREE.TubeGeometry(egri, 30, .045, 8, false));
  const km = new THREE.Mesh(kuyrukGeo, a.mal(renk)); km.castShadow = true; kuyruk.add(km);
  for (let i = 1; i < 6; i++) {
    const p = egri.getPoint(i / 6.2), t = egri.getTangent(i / 6.2);
    const h = new THREE.Mesh(geo(THREE, 'halka', () => new THREE.TorusGeometry(1, .38, 6, 12)), a.mal(cizgi));
    h.scale.setScalar(.042); h.position.copy(p); h.lookAt(p.clone().add(t)); kuyruk.add(h);
  }
  top(cizgi, .38, -.1, .37, .05, .05, .05, kuyruk);
  g.userData = { kafa: bas, kuyruk };
  return g;
}

/* ═══════════════ KURBAĞA ═══════════════ */
function kurbaga3b(a, ebeveyn, { renk = 0x6fae4a, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const { top, cubuk } = atolye(a, g);
  const koyu = new THREE.Color(renk).multiplyScalar(.6).getHex(), karin = 0xe3e7b4;
  const ton = { roughness: .45 };
  // Gövde: basık, önü geniş; arkası kalçalara iner
  top(renk, 0, .16, -.02, .2, .13, .24, g, ton);
  top(karin, 0, .1, .04, .17, .08, .2, g);
  // Baş: gövdeyle kaynaşık, geniş ağız
  top(renk, 0, .2, .15, .19, .1, .13, g, ton);
  top(karin, 0, .14, .19, .15, .05, .09, g);                                        // gıdı
  const agiz = new THREE.Mesh(geo(THREE, 'agiz', () => new THREE.TorusGeometry(1, .06, 5, 20, Math.PI)), a.mal(0x3e5a2a));
  agiz.scale.set(.15, .09, .1); agiz.position.set(0, .18, .19); agiz.rotation.set(Math.PI / 2 + .15, 0, Math.PI); g.add(agiz);
  for (const s of [-1, 1]) top(0x2e4020, s * .03, .235, .275, .008, .006, .006);     // burun delikleri
  // Gözler: başın ÜSTÜNDE patlak; altın iris, yatay siyah göz bebeği
  for (const s of [-1, 1]) {
    top(renk, s * .095, .29, .15, .07, .065, .065, g, ton);
    top(0xd8b23e, s * .11, .305, .19, .045, .045, .035, g, { roughness: .2 });
    top(0x111111, s * .118, .305, .215, .03, .012, .01, g);
    top(0xffffff, s * .1, .325, .215, .01, .01, .008, g);
  }
  // Sırt benekleri
  for (const [x, z, r] of [[-.08, -.02, .04], [.07, .04, .035], [.02, -.13, .045], [-.1, -.16, .03], [.11, -.12, .03]])
    top(koyu, x, .27 - Math.abs(z) * .25, z, r, .012, r);
  // Ön bacaklar: kısa, dirsekli; perdeli parmaklar
  for (const s of [-1, 1]) {
    cubuk(renk, [s * .13, .12, .14], [s * .17, .03, .22], .028);
    for (const p of [-.5, 0, .5]) cubuk(renk, [s * .17, .02, .22], [s * .17 + Math.sin(p) * .06 * s, .012, .22 + Math.cos(p) * .06], .012);
  }
  // Arka bacaklar: kalçada katlanmış uzun bacak, önde yatan uzun ayak
  for (const s of [-1, 1]) {
    top(renk, s * .17, .11, -.12, .08, .075, .15, g, ton);
    top(koyu, s * .19, .15, -.12, .03, .012, .1);                                   // bacak çizgisi
    top(renk, s * .22, .05, .02, .05, .04, .12, g, ton);
    const ayak = top(renk, s * .24, .015, .14, .055, .012, .1, g, ton); ayak.rotation.y = s * .3;
    for (const p of [-.4, 0, .4]) cubuk(renk, [s * .25, .012, .2], [s * .25 + Math.sin(p) * .07 * s + s * .02, .01, .2 + Math.cos(p) * .07], .01);
  }
  g.userData = { kuyruk: null };
  return g;
}

/* ═══════════════ YAPRAK KAYIK ═══════════════ */
/* Çınar yaprağının yarım dış çizgisi (sağ yarı, sap dibinden uca):
   iki alt loblu, iki yan loblu, sivri uçlu — beş uçlu el biçimi. */
const YAPRAK_YARI = [[0, -.05], [.12, -.11], [.32, -.08], [.22, .03], [.34, .21], [.17, .21], [.11, .34], [0, .43]];
function yaprakKayik(a, ebeveyn, { renk = 0x86bd5a, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek * 1.9); ebeveyn.add(g);
  const { top, cubuk } = atolye(a, g);
  const damar = new THREE.Color(renk).multiplyScalar(.68).getHex();
  const ic = new THREE.Color(renk).lerp(new THREE.Color(0xe4ef9a), .22).getHex();
  /* İki yarı, orta damar boyunca V biçiminde kalkık: dereye bırakılmış
     bir kayık gibi. Şekil XY düzleminde kurulur, yere yatırılır. */
  const yari = geo(THREE, 'yaprakYari', () => {
    const sekil = new THREE.Shape();
    YAPRAK_YARI.forEach(([x, z], i) => i ? sekil.lineTo(x, -z) : sekil.moveTo(x, -z));
    sekil.lineTo(0, -YAPRAK_YARI[0][1]);
    return new THREE.ShapeGeometry(sekil).rotateX(-Math.PI / 2);
  });
  const KALK = .32;
  for (const s of [1, -1]) {
    const kanat = new THREE.Group(); kanat.position.y = .035; kanat.rotation.z = s * KALK; g.add(kanat);
    const m = new THREE.Mesh(yari, a.mal(s > 0 ? renk : ic, { side: THREE.DoubleSide, roughness: .62 }));
    m.scale.x = s; m.castShadow = true; m.receiveShadow = true; kanat.add(m);
    // damarlar: orta damardan lob uçlarına
    for (const [x, z] of [[.3, -.07], [.31, .2], [.1, .32]]) {
      const d = cubuk(damar, [0, .004, .0], [s * x * .92, .004, z * .92], .005, kanat);
      d.castShadow = false;
    }
  }
  cubuk(damar, [0, .03, -.05], [0, .03, .42], .008);                    // orta damar
  cubuk(damar, [0, .03, -.05], [0, .05, -.15], .01);                    // sap
  cubuk(damar, [0, .05, -.15], [0, .1, -.19], .009);
  // Üstünde bir damla su
  top(0xcfeaf2, .06, .075, .1, .022, .02, .022, g, { roughness: .1, transparent: true, opacity: .8 });
  g.userData = { kuyruk: null };
  return g;
}

export default {
  karinca3b,
  guvercin3b,
  kedi3b,
  kurbaga3b,
  'yaprak-kayik': yaprakKayik
};

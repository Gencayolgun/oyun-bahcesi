/* Yalancı Çoban mekânı — mekân adı → kurucu işlev (bkz. mekanlar.js).

   YAYLA. Ortada çitli, kapılı AĞIL (koyunlar içine sürülebilir). Sol üstte
   yayla çayırı ve gölet; sağ üstte basamak basamak tırmanılan GÖZCÜ
   KAYASI (Oğuz buradan bağırır); sağ altta kayadan doğan DERE, üstünde
   tahta köprü ve ötesinde çam ORMANI; sol altta KÖY: altı ev, bir çan
   kulesi, bir çeşme.

   Sınıf ilerledikçe (a.dolu) dünya hikâyeyi gösterir — aynı hesap
   kurgudaki gibi (guvenDolu):
     · Köy evlerinin pencereleri: tahtadaki fener sayısı kadarı yanar.
       Dördüncü bölümde daha parlak yanar, kapı fenerleri de yakılır.
     · Sürü: 1–2. bölümde çayırda otlar; 3. bölümde kurt yüzünden bütün
       yaylaya dağılmıştır; 4. bölümde ağılın çevresinde huzurla otlar.
     · Ağıl: 3. bölümde toplanan kuzular içeride birikir (sürü sayacı);
       kapı önce yıkık, kuzuların yarısı gelince onarılmış.
     · Kurt: yalnız 3. bölümde orman kenarında; kuzular toplandıkça
       ormanın içine çekilir. Kimseye yaklaşmaz.
     · Oğuz: 2. bölümde gözcü kayasının tepesinde; 4. bölümde köyde.

   NOT: mekanlar.js'ten hiçbir şey içe aktarılmaz. mekan/liste.js bu
   dosyayı mekanlar.js değerlendirilirken dinamik olarak yüklüyor; buradan
   mekanlar.js'e bağlanmak döngüye girer. Ağaç, çit, kaya burada kendi
   küçük yardımcılarıyla kuruluyor. */

import {guvenDolu, yanikMi} from '../kurgular/guven.js';
import {koyunModeli, kurtModeli, cocukModeli} from '../modeller/coban.js';

function yayla(a) {
  const { THREE } = a;
  const Z = a.ZEMIN, h = guvenDolu(a.dolu);
  a.ceyrek([0xa9cc7a, 0xcdc38c, 0x92b980, 0xc8bb90]);

  /* ——— küçük yardımcılar ——— */
  const grup = (x, y, z, aci = 0, hareketli = false) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = aci;
    if (hareketli) g.userData.hareketli = true;
    a.dunya.add(g); return g;
  };
  const kutuGeo = new Map();
  const kutuE = (x, y, z, w, hh, d, renk, e, ek) => {        // kutu, istenirse ışıyan malzemeyle
    const k = `${w},${hh},${d}`;
    if (!kutuGeo.has(k)) kutuGeo.set(k, new THREE.BoxGeometry(w, hh, d));
    return a.cisim(kutuGeo.get(k), renk, x, y, z, e, ek);
  };
  function agac(x, z, tur = 'yaprak', o = 1, elma = false) {
    if (a.yolaYakin(x, z, .8 * o + .35)) return null;
    const g = grup(x, Z - .1, z); g.scale.setScalar(o);
    a.engelEkle(x, z, .5 * o, 1.2 * o);                       // taç alçak: altından geçilmez
    a.silindir(0, .8, 0, .14, .24, 1.6, 0x8e6a47, g, 7);
    if (tur === 'cam') for (let i = 0; i < 3; i++) a.silindir(0, 1.55 + i * .62, 0, 0, 1.05 - i * .22, 1.5, i % 2 ? 0x4c9268 : 0x3f8560, g, 8);
    else {
      a.top(0, 2.1, 0, 1.02, 0x5f9e5f, g); a.top(-.48, 1.92, .28, .66, 0x74b06c, g); a.top(.42, 2.34, -.14, .62, 0x5f9e5f, g);
      if (elma) [[.6, 2.0, .6], [-.7, 1.7, .5], [.2, 2.5, .8], [-.3, 1.6, -.8], [.8, 2.2, -.3], [-.1, 2.9, .2]]
        .forEach(([p, q, r]) => a.top(p, q, r, .1, 0xd9533f, g, 1));
    }
    return g;
  }
  function kaya(x, z, r, renk = 0xb3b3a4) {
    if (a.yolaYakin(x, z, r + .45)) return null;
    const k = a.top(x, Z + r * .42, z, r, renk, a.dunya, 0);
    k.scale.set(1.25, .6, .9); k.rotation.y = a.rast() * 3;
    if (r > .3) a.engelEkle(x, z, r * .9, 0, r * 1.05);
    return k;
  }
  /* Çit: iki nokta arasında direkler ve iki kuşak; alçak, üstünden zıplanır. */
  function cit(x1, z1, x2, z2, renk = 0xc9a06a) {
    const dx = x2 - x1, dz = z2 - z1, L = Math.hypot(dx, dz), aci = Math.atan2(-dz, dx);
    const g = grup((x1 + x2) / 2, Z - .1, (z1 + z2) / 2, aci);
    const n = Math.max(1, Math.round(L / .95));
    for (let i = 0; i <= n; i++) a.kutu(-L / 2 + i * L / n, .45, 0, .12, .9, .12, 0xa47c4c, g);
    a.kutu(0, .4, 0, L + .08, .1, .08, renk, g);
    a.kutu(0, .72, 0, L + .08, .1, .08, renk, g);
    a.kutuEngel((x1 + x2) / 2, (z1 + z2) / 2, L + .1, .16, aci, .84, false);
    return g;
  }
  /* Şerit: kıvrılan bir eğri boyunca düz bir yüzey (dere, kıyı). */
  function serit(egri, genislik, renk, y) {
    const n = 60, sol = [], sag = [];
    egri.getPoints(n).forEach((p, i) => {
      const t = egri.getTangent(i / n), nx = -t.z, nz = t.x;
      sol.push(new THREE.Vector2(p.x + nx * genislik, -p.z - nz * genislik));
      sag.unshift(new THREE.Vector2(p.x - nx * genislik, -p.z + nz * genislik));
    });
    const m = a.cisim(new THREE.ShapeGeometry(new THREE.Shape([...sol, ...sag])), renk, 0, y, 0);
    m.rotation.x = -Math.PI / 2; m.castShadow = false; return m;
  }
  const oynayan = [];      // tik() ile oynatılanlar

  /* ═══ 01 · Yayla çayırı (sol üst): gölet, gölge ağacı, çiçekler ═══ */
  const golet = [-5.7, -4.9, 1.75, 1.1];
  {
    const [gx, gz, rx, rz] = golet;
    const daire = new THREE.CircleGeometry(1, 36);
    const kiyi = a.cisim(daire, 0xd8cfa4, gx, Z + .008, gz); kiyi.rotation.x = -Math.PI / 2; kiyi.scale.set(rx + .45, rz + .4, 1); kiyi.castShadow = false;
    const su = a.cisim(daire, 0x6fb2c4, gx, Z + .016, gz); su.rotation.x = -Math.PI / 2; su.scale.set(rx, rz, 1); su.castShadow = false;
    const parla = a.cisim(daire, 0x93cfda, gx - .3, Z + .022, gz - .15); parla.rotation.x = -Math.PI / 2; parla.scale.set(rx * .45, rz * .4, 1); parla.castShadow = false;
    for (let i = 0; i < 9; i++) {                               // sazlar
      const ac = i / 9 * Math.PI * 2, x = gx + Math.cos(ac) * (rx + .25), z = gz + Math.sin(ac) * (rz + .2);
      if (i % 3 === 1) continue;
      for (let j = 0; j < 3; j++) a.silindir(x + j * .07, Z + .28, z + (j - 1) * .06, .018, .026, .56, 0x6f9a52, a.dunya, 4).rotation.z = (j - 1) * .15;
    }
  }
  agac(-8.6, -4.3, 'yaprak', 1.15);
  agac(-12.4, -7.6, 'yaprak', 1.05); agac(-12.8, -1.4, 'yaprak', .95); agac(-3.2, -9.6, 'yaprak', .9);
  for (let i = 0; i < 60; i++) {                                // çayır çiçekleri
    const x = -11.5 + a.rast() * 10, z = -9 + a.rast() * 8.2;
    if (Math.hypot((x - golet[0]) / (golet[2] + .6), (z - golet[1]) / (golet[3] + .6)) < 1 || a.yolaYakin(x, z, .35)) continue;
    a.top(x, Z + .08, z, .07, [0xf2de9d, 0xf4c9d6, 0xfff2e0, 0xc9b8e8][i % 4], a.dunya, 0);
  }

  /* ═══ 02 · Gözcü kayası (sağ üst) ═══
     Basamaklı sekiler: her biri bir öncekinden ~0.46 yüksek, tırmanılır.
     Tepesinde Oğuz'un küçük çanı asılı bir direk. */
  const KX = 11.3, KZ = -8.3;
  let kayaTepe = null;
  for (let i = 0; i < 5; i++) {
    const x = KX + i * .33, z = KZ - i * .26, r = 3.1 - i * .52;
    const t = a.silindir(x, Z + .12 + i * .46, z, r, r + .3, .5, [0xc3b8a0, 0xb9ad93, 0xafa287, 0xa5977c, 0x9b8d72][i], a.dunya, 7);
    t.scale.z = .76; t.rotation.y = i * .5;
    const rr = r * .93;
    a.yukseltiEkle(x, z, rr, rr * .76, Z + .36 + i * .46, { aci: i * .5 });
    kayaTepe = { x, z, y: Z + .36 + i * .46 };
  }
  {
    const d = grup(kayaTepe.x - .5, kayaTepe.y, kayaTepe.z - .35, 0, true);
    a.silindir(0, .6, 0, .05, .06, 1.2, 0x8a6034, d, 6);
    a.kutu(.18, 1.16, 0, .42, .06, .06, 0x8a6034, d);
    const can = new THREE.Group(); can.position.set(.34, 1.1, 0); d.add(can);
    a.silindir(0, -.12, 0, .05, .11, .16, 0xd9a441, can, 10);
    oynayan.push(t => { can.rotation.z = Math.sin(t * 3.2) * (h.b === 1 ? .45 : .08); });
    a.engelEkle(kayaTepe.x - .5, kayaTepe.z - .35, .1, 0);
    if (h.b === 1) {                                           // şakaların bölümü: Oğuz kayanın tepesinde
      const o = grup(kayaTepe.x - .3, kayaTepe.y, kayaTepe.z + .4, Math.atan2(-kayaTepe.x, -kayaTepe.z), true);
      cocukModeli(a, o, { olcek: 1.05 });
      oynayan.push(t => { o.position.y = kayaTepe.y + Math.abs(Math.sin(t * 5)) * .08; });
    }
  }
  for (const [x, z, r] of [[8.8, -8.9, .42], [9.6, -5.2, .36], [13.6, -4.6, .5], [6.6, -9.6, .38], [3.6, -4.4, .34]]) kaya(x, z, r);
  /* Çayırın ortasında Oğuz'un sıkılıp oturduğu tümsek ve elma ağacı */
  {
    const t = a.top(4.4, Z - .5, -4.3, 1.9, 0xb9bd83, a.dunya, 2); t.scale.set(1, .5, .72); t.receiveShadow = true;
    a.yukseltiEkle(4.4, -4.3, 1.8, 1.3, Z + .42, { yumusak: true });
    agac(6.6, -2.9, 'yaprak', 1, true);
  }
  /* Köylülerin düşürdüğü tencere, tava, kaşık: 2–3. bölümde kayanın dibinde */
  if (h.b === 1 || h.b === 2) {
    const k = grup(9.3, Z, -6.4);
    a.silindir(0, .13, 0, .2, .17, .26, 0x8f9aa5, k, 12); a.silindir(0, .28, 0, .21, .21, .04, 0xaab4be, k, 12);
    a.silindir(.55, .03, .15, .2, .2, .05, 0x4d5560, k, 12);
    a.kutu(.85, .04, .3, .38, .03, .06, 0x8a5f33, k).rotation.y = -.5;
  }

  /* ═══ 03 · Dere, köprü ve orman kenarı (sağ alt) ═══ */
  const dere = new THREE.CatmullRomCurve3([
    new THREE.Vector3(12.9, 0, -6.4), new THREE.Vector3(12.3, 0, -2.6), new THREE.Vector3(12.7, 0, 1.2),
    new THREE.Vector3(12.1, 0, 4.4), new THREE.Vector3(10.7, 0, 7.4), new THREE.Vector3(9.9, 0, 10.8)]);
  serit(dere, 1.25, 0xd9cfa4, Z + .008); serit(dere, .82, 0x6fb2c4, Z + .016); serit(dere, .38, 0x8ecbd6, Z + .022);
  for (let i = 0; i < 7; i++) {                                 // derede taşlar
    const p = dere.getPoint((i + .5) / 7.5);
    a.top(p.x + (a.rast() - .5) * .8, Z + .06, p.z + (a.rast() - .5) * .6, .16 + a.rast() * .1, 0xa9b0a0, a.dunya, 0).scale.y = .5;
  }
  {                                                             // tahta köprü: üstüne çıkılır
    const u = .42, p = dere.getPoint(u), tg = dere.getTangent(u);
    const aci = Math.atan2(tg.x, tg.z) + Math.PI / 2;
    const k = grup(p.x, Z - .1, p.z, aci);
    for (let i = 0; i < 6; i++) a.kutu(0, .34, -1.25 + i * .5, 1.7, .12, .42, 0xc7a77a, k);
    for (const x of [-.8, .8]) {
      a.kutu(x, .72, 0, .08, .08, 3, 0xa9916d, k);
      for (const z of [-1.3, 0, 1.3]) a.kutu(x, .5, z, .1, .5, .1, 0xa9916d, k);
    }
    a.yukseltiEkle(p.x, p.z, .85, 1.55, Z + .36, { aci, kutu: true });
  }
  /* Orman: derenin ötesinde çamlar, biri ormanın ucunda keşif noktası. */
  for (const [x, z, o] of [[14.6, 2.6, 1.1], [15.4, 6.0, 1.2], [13.8, 8.6, 1.05], [11.6, 10.6, 1], [16.2, 9.4, 1.2],
                           [14.4, 11.6, 1.1], [15.8, -.8, 1], [12.4, 12.4, .95]]) agac(x, z, 'cam', o);
  agac(6.2, 9.8, 'cam', .9); agac(2.4, 10.4, 'yaprak', .9);
  /* Kurt: yalnız kurdun geldiği bölümde. Önce orman kenarında, kuzular
     toplandıkça ormanın içine çekilir. Kimseye yaklaşmaz, çarpışmaz. */
  if (h.b === 2) {
    const ice = h.kuzu >= 7;
    const [x, z] = ice ? [15.2, 11.2] : [13.7, 6.9];
    const k = grup(x, Z, z, Math.atan2(-x, -z) + (ice ? Math.PI * .8 : 0), true);
    const kurt = kurtModeli(a, k, { olcek: 1.1 });
    a.engelEkle(x, z, .45, 0);
    oynayan.push(t => {
      kurt.userData.kafa.rotation.y = Math.sin(t * .7) * .5;
      kurt.userData.kuyruk.rotation.z = Math.sin(t * 1.6) * .12;
    });
  }

  /* ═══ 04 · Köy (sol alt): altı ev, çan kulesi, çeşme ═══
     Her evin iki penceresi var: ev i'nin pencereleri 2i ve 2i+1 — tahtadaki
     köy resmiyle aynı sıra (yanikMi). */
  const parlak = h.evre === 'parlar';
  const isikMal = { emissive: 0xffb43c, emissiveIntensity: parlak ? 1.35 : .85 };
  const pencereler = [];
  const EVLER = [
    // x, z, aci (ön yüz +z yerel), duvar, çatı
    [-12.2, 5.6, Math.PI / 2, 0xf0e2c4, 0xb5644c],
    [-7.8, 3.8, 0, 0xeee0c0, 0xa8523f],
    [-7.8, 8.9, Math.PI, 0xf3e6cc, 0xc06a50],
    [-4.6, 3.9, 0, 0xefe3c8, 0xb5644c],
    [-4.6, 9.2, Math.PI, 0xf0e0c0, 0xa8523f],
    [-1.4, 9.0, Math.PI, 0xf3e6cc, 0xc06a50]
  ];
  EVLER.forEach(([x, z, aci, duvar, cati], i) => {
    const g = grup(x, Z - .02, z, aci, true);
    a.kutu(0, .66, 0, 2.0, 1.32, 1.6, duvar, g);
    a.kutu(0, .06, 0, 2.1, .12, 1.7, 0xb9ad96, g);
    for (const yon of [-1, 1]) { const e = a.kutu(yon * .55, 1.66, 0, 1.28, .12, 1.86, cati, g); e.rotation.z = -yon * .62; }
    const alin = new THREE.Shape(); alin.moveTo(-1, 0); alin.lineTo(1, 0); alin.lineTo(0, .72); alin.closePath();
    const alinGeo = new THREE.ShapeGeometry(alin);
    for (const zz of [-.8, .8]) a.cisim(alinGeo, duvar, 0, 1.32, zz, g, { side: THREE.DoubleSide });
    a.kutu(.62, 1.95, -.35, .24, .55, .24, 0x9a8a78, g);            // baca
    a.kutu(0, .44, .81, .42, .82, .05, 0x8a5a36, g);                // kapı
    for (let p = 0; p < 2; p++) {
      const no = i * 2 + p, yanik = yanikMi(no, h.fener), px = p ? .62 : -.62;
      const cam = kutuE(px, .84, .815, .38, .34, .04, yanik ? (parlak ? 0xfff0a8 : 0xffd36b) : 0x2a3346, g, yanik ? isikMal : undefined);
      a.kutu(px, .84, .84, .04, .36, .02, 0x6e4a2a, g); a.kutu(px, .84, .84, .4, .04, .02, 0x6e4a2a, g);
      if (yanik) {
        const hale = a.top(px, .84, .9, parlak ? .34 : .24, 0xffd76e, g, 1);
        hale.material = a.mal(0xffd76e, { transparent: true, opacity: parlak ? .3 : .18, depthWrite: false, emissive: 0xffc24a, emissiveIntensity: .6 });
        hale.castShadow = false;
      }
      pencereler.push({ cam, yanik });
    }
    // Kapı feneri: güven tam dönünce (4. bölümde) her evin kapısında da yanar
    const kf = parlak && yanikMi(i * 2, h.fener) && yanikMi(i * 2 + 1, h.fener);
    a.kutu(.34, 1.08, .86, .05, .05, .12, 0x5d5448, g);
    const fener = a.top(.34, .98, .93, .07, kf ? 0xfff1b8 : 0x8a8f96, g, 1);
    if (kf) fener.material = a.mal(0xfff1b8, { emissive: 0xffb43c, emissiveIntensity: 1.4 });
    a.kutuEngel(x, z, 2.0, 1.6, aci);
  });
  oynayan.push(t => {                                          // fener alevi hafifçe titrer
    const m = pencereler.find(p => p.yanik)?.cam.material;
    if (m) m.emissiveIntensity = isikMal.emissiveIntensity * (.9 + Math.sin(t * 7.3) * .05 + Math.sin(t * 13.1) * .04);
  });

  /* Çan kulesi */
  {
    const x = -11.4, z = 8.7, g = grup(x, Z - .02, z, .08, true);
    a.kutu(0, 1.1, 0, 1.3, 2.2, 1.3, 0xd2c6aa, g);
    a.kutu(0, 2.24, 0, 1.44, .12, 1.44, 0xb9ad93, g);
    for (const [p, q] of [[-.55, -.55], [.55, -.55], [-.55, .55], [.55, .55]]) a.kutu(p, 2.72, q, .14, .84, .14, 0x9a7a56, g);
    const cati = a.silindir(0, 3.5, 0, 0, 1.1, .8, 0xa8523f, g, 4); cati.rotation.y = Math.PI / 4;
    a.kutu(0, .6, .66, .5, 1, .04, 0x8a5a36, g);
    const can = new THREE.Group(); can.position.set(0, 3.08, 0); g.add(can);
    a.silindir(0, -.22, 0, .12, .28, .34, 0xd9a441, can, 12);
    a.top(0, -.42, 0, .06, 0x8a6424, can, 1);
    const salla = h.b === 1 ? .1 : parlak ? .35 : 0;
    oynayan.push(t => { can.rotation.z = Math.sin(t * 2.4) * salla; });
    a.kutuEngel(x, z, 1.4, 1.4, .08);
  }
  /* Çeşme */
  {
    const g = grup(-6.2, Z - .02, 4.0);
    a.kutu(0, .5, -.28, .7, 1, .22, 0xcfc3a8, g);
    a.silindir(0, .22, .12, .55, .6, .44, 0xbdb193, g, 14);
    const su = a.silindir(0, .44, .12, .47, .47, .02, 0x7fc0cf, g, 14); su.castShadow = false;
    a.silindir(0, .78, -.1, .04, .04, .3, 0x9aa4ad, g, 6).rotation.x = Math.PI / 2;
    a.engelEkle(-6.2, 4.1, .6, .6, .5);
  }
  agac(-12.6, 1.4, 'yaprak', 1); agac(-2.8, 11.2, 'yaprak', .9); agac(-9.4, 11.0, 'yaprak', .95);
  kaya(-12.8, 10.4, .44); kaya(1.6, 11.0, .36);
  if (h.b === 3) {                                              // özür bölümü: Oğuz köyün meydanında, fener elinde
    const o = grup(-3.0, Z, 5.2, Math.PI * .85, true);
    cocukModeli(a, o, { olcek: 1.05 });
    const f = a.top(.2, .45, .12, .06, 0xfff1b8, o, 1);
    f.material = a.mal(0xfff1b8, { emissive: 0xffb43c, emissiveIntensity: 1.4 });
    a.engelEkle(-3.0, 5.2, .25, 0, .95);
    oynayan.push(t => { o.rotation.y = Math.PI * .85 + Math.sin(t * .8) * .25; });
  }

  /* ═══ MERKEZ · Ağıl ═══
     Çitli ve kapılı; içeride saman altlık, bir yem yalağı ve sundurma.
     Kapı güneye bakar. Üçüncü bölümde kuzular içeride birikir. */
  const AX0 = -2.6, AX1 = 2.6, AZ0 = -1.9, AZ1 = 2.3, KAPI = .8;
  {
    const altlik = a.cisim(new THREE.PlaneGeometry(5.1, 4.1), 0xd9c690, 0, Z + .014, .2);
    altlik.rotation.x = -Math.PI / 2; altlik.castShadow = false;
    cit(AX0, AZ0, AX1, AZ0); cit(AX0, AZ0, AX0, AZ1); cit(AX1, AZ0, AX1, AZ1);
    cit(AX0, AZ1, -KAPI, AZ1); cit(KAPI, AZ1, AX1, AZ1);
    for (const x of [-KAPI, KAPI]) a.kutu(x, Z + .5, AZ1, .18, 1.12, .18, 0x8a6a42);
    /* Kapı: 1–2. bölümde açık (sürü dışarıda), 3. bölümde önce yıkık sonra
       onarılmış ve kapalı, 4. bölümde kapalı. */
    const kapiG = new THREE.Group(); kapiG.position.set(-KAPI, Z - .1, AZ1); a.dunya.add(kapiG);
    const kapali = h.b === 3 || (h.b === 2 && h.kuzu >= 6);
    const yikik = h.b === 2 && h.kuzu < 6;
    for (const y of [.36, .66]) a.kutu(KAPI, y, 0, KAPI * 2, .1, .08, 0xd2a86e, kapiG);
    a.kutu(KAPI, .52, 0, .08, .5, .06, 0xa47c4c, kapiG).rotation.z = .9;
    if (kapali) a.kutuEngel(0, AZ1, KAPI * 2, .16, 0, .84, false);
    else if (yikik) { kapiG.position.set(-.2, Z - .06, AZ1 + 1.1); kapiG.rotation.set(-Math.PI / 2 + .08, .5, 0); }
    else kapiG.rotation.y = Math.PI / 2 + .25;                 // açık: dışa doğru dönmüş
    // Sundurma (arka çitin önünde) ve yalak
    const s = grup(-1.2, Z - .02, -1.35);
    for (const [p, q] of [[-.9, -.3], [.9, -.3], [-.9, .3], [.9, .3]]) a.kutu(p, .7, q, .1, 1.4, .1, 0x8a6a42, s);
    const c = a.kutu(0, 1.45, 0, 2.1, .1, 1.05, 0xb5644c, s); c.rotation.x = .18;
    for (let i = 0; i < 3; i++) a.silindir(-.6 + i * .6, .3, 0, .3, .3, .6, 0xe3c46e, s, 12).rotation.z = Math.PI / 2;
    a.kutuEngel(-1.2, -1.35, 2.0, .8, 0, 1.3);
    a.kutu(1.35, Z + .18, -1.4, 1.4, .36, .42, 0x9c7a52);
    a.kutu(1.35, Z + .33, -1.4, 1.2, .06, .3, 0x7fc0cf).castShadow = false;
    a.kutuEngel(1.35, -1.4, 1.4, .42, 0, .4);
    // Ağıldaki kuzular: sürü sayacı
    const kuzu = h.kuzu ?? 0;
    for (let i = 0; i < kuzu; i++) {
      const sira = Math.floor(i / 4), sut = i % 4;
      const x = -1.7 + sut * 1.12 + (sira % 2) * .45, z = .15 + sira * .62;
      const k = grup(x, Z, z, (a.rast() - .5) * 1.4 + (sut % 2 ? .4 : -.4));
      koyunModeli(a, k, { kuzu: true, olcek: .95 });
    }
  }

  /* ═══ Sürü ve balyalar: itilebilir ═══
     Koyun gerçek bir hayvan gibi davranır: karakter yaklaşınca kaçar,
     boşta kalınca evinin çevresinde otlar. Ağılın kapısından içeri
     sürülebilir. Bölüm değişince sürünün dizilişi de değişir (her
     bölümün nesne sayısı farklı: dünya durumu bölüm bölüm saklanır). */
  const koyun = grup => koyunModeli(a, grup, { olcek: .95 });
  const SURU = h.b <= 1
    ? [[-7.2, -3.0], [-5.0, -3.0], [-3.6, -4.4], [-7.4, -6.2], [-5.4, -6.6], [-3.4, -6.0],
       [-4.0, -2.4], [-6.6, -2.4], [3.8, .6], [4.2, 2.2], [3.6, -.9], [-3.9, 1.2]]
    : h.b === 2
      ? [[-11.6, -.6], [-11.8, -9.2], [4.6, -9.6], [10.4, -4.4], [7.8, .4], [4.4, 4.4],
         [10.2, 9.4], [-3.2, -9.8], [-12.4, -5.4], [1.8, -5.2], [6.4, 2.8], [-1.2, 4.2]]
      : [[3.8, .6], [4.2, 2.2], [3.6, -.9], [5.4, 3.4], [5.6, -.2], [3.4, 4.4],
         [-3.9, 1.2], [-4.0, -1.8], [-3.6, -3.4], [-5.4, -3.2], [-7.2, -3.0], [-5.0, -6.4]];
  SURU.forEach(([x, z], i) => a.itilebilir({ x, z, r: .36, tip: 'hayvan', model: koyun, yon: (i * 1.7) % 6.28 }));
  const BALYA = [[-3.2, -3.6, .3], [5.4, 1.4, 1.2], [-6.8, -6.8, .6], [5.8, -1.8, 2]]
    .slice(0, h.b <= 1 ? 3 : h.b === 2 ? 2 : 4);
  BALYA.forEach(([x, z, yon]) => a.itilebilir({ x, z, r: .5, tip: 'balya', renk: 0xe3c46e, ikinci: 0xc49a4a, yon }));

  return { tik: t => oynayan.forEach(f => f(t)) };
}

export default { yayla };

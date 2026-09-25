/* Karınca ile Güvercin mekânı — mekân adı → kurucu işlev (bkz. mekanlar.js).

   ═══════════════════ 04 · DERE — Karınca ile Güvercin ═══════════════════
   Kuzeybatı köşesindeki küçük şelaleden dökülen dere haritanın kuzeyinden
   geçip doğusundan güneydoğuya kıvrılıyor. Ortada Pamuk’un büyük çınarı.

     Kuzeybatı (01 Akıntı)   şelale kayalığı (seki seki tırmanılır), dere
                             boyunca nilüfer yaprakları ve basamak taşları
     Kuzeydoğu (02 Kıyı)     Minik’in karınca yuvası tepeciği (tırmanılır,
                             tepesinde keşif), çevresinde dolaşan karıncalar
     Güneydoğu (03 Çınar)    dere kenarındaki güneşli taş (üstüne çıkılır)
     Güneybatı (04 Hapşırık) sazlık: Tekir’in uyuduğu serin kamışlar

   Merkez DOLAR ama ambar gibi değil: sınıf ilerledikçe çınarın gövdesine
   yapraktan bir merdiven-köprü dolanıyor (basamakları tırmanılır) ve
   ikinci yarıda dalda onarılmış yuva beliriyor. Masalın sonunda Pamuk,
   Minik ve Tekir güneşli taşın üstünde yan yana güneşleniyor.

   İtilebilir: dere kenarında yuvarlanan cevizler, devrilen çam kozalakları
   ve yaklaşınca zıplayıp kaçan küçük kurbağalar.

   NOT: mekanlar.js’i içe aktarmıyoruz (döngüsel içe aktarma). Ağaç, kaya,
   çalı yardımcıları burada; ZEMIN yerine a.ZEMIN. */
import modeller from '../modeller/guvercin.js';

/* Derenin orta çizgisi: şelaleden (kuzeybatı) güneydoğuya. */
const DERE = [[-12.9, -7.3], [-11.0, -7.7], [-7.8, -8.0], [-4.4, -7.7], [-1.0, -8.1], [2.6, -7.7],
              [5.8, -7.1], [8.8, -5.9], [10.8, -3.2], [11.6, 0.2], [11.4, 3.4], [12.2, 6.4], [12.9, 8.8]];
const CINAR = { x: 0, z: .2 };
const YUVA = { x: 5.6, z: -3.0 };             // karınca yuvası tepeciği
const GUNES_TASI = { x: 9.6, z: 5.4 };
const SAZLIK = { x: -9.6, z: 6.2 };

function dere(a) {
  const { THREE } = a, Z = a.ZEMIN, dolu = a.dolu;
  a.ceyrek([0x9bcd86, 0xaecb7c, 0xc8c888, 0x8fbb7c]);

  /* ——— Yardımcılar (mekanlar.js’inkilerin yerel eşleri) ——— */
  const kaya = (x, z, r, renk = 0xa9b1a6) => {
    if (a.yolaYakin(x, z, r + .45)) return null;
    const k = a.top(x, Z + r * .42, z, r, renk, a.dunya, 0);
    k.scale.set(1.25, .6, .92); k.rotation.y = a.rast() * 3;
    if (r > .32) a.engelEkle(x, z, r * .9, 0, r * 1.05);
    return k;
  };
  const cali = (x, z, r, renk = 0x6f9e63) => {
    if (a.yolaYakin(x, z, r + .3)) return null;
    const c = a.top(x, Z + r * .5, z, r, renk, a.dunya, 1); c.scale.y = .62; return c;
  };
  /* Söğüt: dereye eğilen, dalları sarkan ağaç. Taç yüksek, altından geçilir. */
  const sogut = (x, z, olcek = 1) => {
    if (a.yolaYakin(x, z, 1.1 * olcek)) return;
    const g = new THREE.Group(); g.position.set(x, Z - .1, z); g.scale.setScalar(olcek); a.dunya.add(g);
    a.engelEkle(x, z, .28 * olcek, .6 * olcek);
    a.silindir(0, 1.1, 0, .2, .32, 2.2, 0x8b7355, g, 7);
    for (const [p, q, r, yc, renk] of [[0, 2.7, 0, 1.25, 0x7fae5c], [-.7, 2.45, .3, .85, 0x93bd6a], [.7, 2.5, -.2, .9, 0x86b562]]) {
      const t = a.top(p, q, r, yc, renk, g, 1); t.scale.y = .8;
    }
    for (let i = 0; i < 9; i++) {                         // sarkan ince dallar
      const ac = i / 9 * Math.PI * 2;
      const d = a.silindir(Math.cos(ac) * 1.05, 1.75, Math.sin(ac) * 1.05, .035, .05, 1.3, 0x9cc775, g, 4);
      d.rotation.z = Math.cos(ac) * .12; d.rotation.x = -Math.sin(ac) * .12;
    }
  };
  const cam = (x, z, olcek = 1) => {
    if (a.yolaYakin(x, z, .9 * olcek)) return;
    const g = new THREE.Group(); g.position.set(x, Z - .1, z); g.scale.setScalar(olcek); a.dunya.add(g);
    a.engelEkle(x, z, .22 * olcek, .5 * olcek);
    a.silindir(0, .6, 0, .12, .2, 1.2, 0x8e6a47, g, 6);
    for (let i = 0; i < 3; i++) a.silindir(0, 1.4 + i * .62, 0, 0, 1.05 - i * .22, 1.4, [0x3f8560, 0x4f9468, 0x3f8560][i], g, 8);
  };

  /* ——— DERE ———
     Üç şerit: kumlu kıyı, su, parlayan orta akıntı. Çeyrek boyalarının
     üstünde dursun diye biraz yukarıda ve derinlik öncelikli. */
  const egri = new THREE.CatmullRomCurve3(DERE.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', .5);
  const serit = (genislik, renk, y, ek = {}) => {
    const n = 90, sol = [], sag = [];
    egri.getPoints(n).forEach((p, i) => {
      const t = egri.getTangent(i / n), nx = -t.z, nz = t.x;
      sol.push(new THREE.Vector2(p.x + nx * genislik, -p.z - nz * genislik));
      sag.unshift(new THREE.Vector2(p.x - nx * genislik, -p.z + nz * genislik));
    });
    const m = a.cisim(new THREE.ShapeGeometry(new THREE.Shape([...sol, ...sag])), renk, 0, y, 0, a.dunya,
      { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4, ...ek });
    m.rotation.x = -Math.PI / 2; m.castShadow = false; m.receiveShadow = true; return m;
  };
  serit(1.35, 0xdccfa2, Z + .026);                         // kum
  serit(.86, 0x62adc2, Z + .034, { roughness: .35 });      // su
  serit(.42, 0x8fd0dc, Z + .04, { roughness: .25 });       // orta akıntı
  // Kıyı çakılları: kumun kenarında küçük taşlar
  for (let i = 0; i < 26; i++) {
    const u = (i + a.rast() * .6) / 26, p = egri.getPoint(u), t = egri.getTangent(u);
    const yan = (i % 2 ? 1 : -1) * (1.05 + a.rast() * .3);
    const x = p.x - t.z * yan, z = p.z + t.x * yan;
    if (a.yolaYakin(x, z, .35)) continue;
    const c = a.top(x, Z + .06, z, .1 + a.rast() * .08, [0xb9b3a2, 0xcac3b0, 0xa7a597][i % 3], a.dunya, 0);
    c.scale.y = .5; c.castShadow = false;
  }

  /* Nilüfer yaprakları: suyun üstünde, üstlerine basılır (alçak yükselti). */
  const niluferler = [];
  [[.06, -.3], [.12, .35], [.2, -.25], [.29, .3], [.36, -.35], [.44, .28], [.52, -.2], [.6, .32], [.7, -.3], [.8, .25], [.9, -.28]]
    .forEach(([u, yan], i) => {
      const p = egri.getPoint(u), t = egri.getTangent(u);
      const x = p.x - t.z * yan, z = p.z + t.x * yan;
      const r = .3 + (i % 3) * .06;
      const n = a.silindir(x, Z + .07, z, r, r, .04, i % 2 ? 0x6fba68 : 0x5fa85a, a.dunya, 14);
      n.castShadow = false; n.rotation.y = a.rast() * 6;
      a.yukseltiEkle(x, z, r * .9, r * .9, Z + .09);
      if (i % 3 === 1) {                                    // pembe nilüfer çiçeği
        a.top(x + .08, Z + .15, z - .05, .09, 0xf3b8d0, a.dunya, 0).scale.y = .8;
        a.top(x + .08, Z + .19, z - .05, .04, 0xf2cf5d, a.dunya, 0);
      }
      niluferler.push({ x, z });
    });

  /* Basamak taşları: derenin kuzeyindeki güneşli kıyıya geçit. */
  for (let i = 0; i < 5; i++) {
    const x = -3.2 + (i % 2) * .35, z = -6.3 - i * .62;
    const b = a.silindir(x, Z + .1, z, .34, .4, .2, 0xb8b6a8, a.dunya, 9);
    b.scale.z = .8; b.castShadow = false;
    a.yukseltiEkle(x, z, .36, .3, Z + .2);
  }
  // Kuzey kıyısı: küçük bir kum düzlüğü ve üstünde alçak düz taş (oturulur)
  {
    const t = a.top(-2.2, Z + .08, -9.3, .75, 0xc4c9ce, a.dunya, 1); t.scale.set(1.3, .28, .8);
    a.yukseltiEkle(-2.2, -9.3, .92, .6, Z + .26, { yumusak: true });
  }

  /* ——— ŞELALE (kuzeybatı köşe) ———
     Seki seki kayalar: her biri öncekinden ~0.42 yüksek, tırmanılır.
     Tepeden dökülen su perdesi ve dipte köpük. */
  for (let i = 0; i < 4; i++) {
    const x = -12.6 - i * .32, z = -9.0 - i * .28, r = 2.2 - i * .42;
    const t = a.silindir(x, Z + .12 + i * .42, z, r, r + .25, .5, [0xa7aeb3, 0x9ea6ab, 0x959ca2, 0x8c9399][i], a.dunya, 8);
    t.scale.z = .72; t.rotation.y = i * .45;
    a.yukseltiEkle(x, z, r * .92, r * .66, Z + .36 + i * .42, { aci: i * .45 });
  }
  const selale = new THREE.Group(); selale.userData.hareketli = true; a.dunya.add(selale);
  {
    const perde = a.cisim(new THREE.PlaneGeometry(.9, 1.75), 0x9ad8e2, -12.25, Z + 1.2, -7.95, selale,
      { transparent: true, opacity: .78, side: THREE.DoubleSide, roughness: .2 });
    perde.rotation.y = -.55; perde.castShadow = false;
    for (let i = 0; i < 3; i++) {
      const c = a.cisim(new THREE.PlaneGeometry(.08, 1.7), 0xe6f7fa, -12.5 + i * .22, Z + 1.2, -7.8 - i * .14, selale,
        { transparent: true, opacity: .7, side: THREE.DoubleSide });
      c.rotation.y = -.55; c.castShadow = false;
    }
  }
  const kopuk = [];
  for (let i = 0; i < 6; i++) {
    const k = a.top(-12.0 + (i % 3) * .3 - .2, Z + .12, -7.55 + Math.floor(i / 3) * .3, .14 + (i % 2) * .05, 0xf4fbfc, selale, 1);
    k.castShadow = false; k.userData.y0 = k.position.y; kopuk.push(k);
  }

  /* ——— KARINCA YUVASI TEPECİĞİ (kuzeydoğu) ——— */
  {
    const g = new THREE.Group(); g.position.set(YUVA.x, Z, YUVA.z); a.dunya.add(g);
    const m = a.top(0, 0, 0, 1, 0xb48a5e, g, 2); m.scale.set(1.55, .95, 1.35);
    const m2 = a.top(.1, .05, .15, .8, 0xc9a276, g, 2); m2.scale.set(1.2, .85, 1.05);
    a.silindir(0, .93, 0, .2, .26, .06, 0x5b3d26, g, 12);                    // kapı
    for (let i = 0; i < 14; i++) {                                              // toprak taneleri
      const ac = a.rast() * 6.28, r = .5 + a.rast() * .9;
      a.top(Math.cos(ac) * r, .55 - r * .25, Math.sin(ac) * r * .85, .05, 0x9c7552, g, 0);
    }
    a.yukseltiEkle(YUVA.x, YUVA.z, 1.55, 1.35, Z + .95, { yumusak: true });
  }
  const karincalar = [];
  if (modeller.karinca3b) for (let i = 0; i < 5; i++) {
    const g = new THREE.Group(); g.userData.hareketli = true; a.dunya.add(g);
    modeller.karinca3b(a, g, { renk: [0x8e3b22, 0x6c2c1b, 0x9c4a33][i % 3], olcek: .26 });
    karincalar.push({ g, faz: i / 5 * Math.PI * 2, r: 1.75 + (i % 2) * .22, hiz: .32 + (i % 3) * .05 });
  }

  /* ——— GÜNEŞLİ TAŞ (güneydoğu, dere kenarı) ——— */
  {
    const t = a.top(GUNES_TASI.x, Z + .1, GUNES_TASI.z, 1, 0xb9bfc4, a.dunya, 1); t.scale.set(1.35, .38, 1.0);
    const t2 = a.top(GUNES_TASI.x - .2, Z + .16, GUNES_TASI.z - .1, .7, 0xc9ced2, a.dunya, 1); t2.scale.set(1.3, .32, 1.0);
    a.yukseltiEkle(GUNES_TASI.x, GUNES_TASI.z, 1.3, .96, Z + .45, { yumusak: true });
  }

  /* ——— SAZLIK (güneybatı) ——— Kamışlar çarpışmaz: içinden yürünür. */
  for (let i = 0; i < 46; i++) {
    const ac = a.rast() * Math.PI * 2, r = Math.sqrt(a.rast()) * 2.1;
    const x = SAZLIK.x + Math.cos(ac) * r * 1.2, z = SAZLIK.z + Math.sin(ac) * r;
    if (a.yolaYakin(x, z, .25)) continue;
    const boy = 1 + a.rast() * .9;
    const k = a.silindir(x, Z + boy / 2, z, .025, .04, boy, i % 3 ? 0x7aa653 : 0x8fbb62, a.dunya, 4);
    k.rotation.z = (a.rast() - .5) * .2; k.rotation.x = (a.rast() - .5) * .2;
    if (i % 3 === 0) { const p = a.silindir(x, Z + boy - .12, z, .06, .06, .3, 0x8a5a33, a.dunya, 6); p.rotation.copy(k.rotation); }
  }
  for (let i = 0; i < 10; i++) {                 // doğu kıyısında da birkaç kamış
    const u = .7 + i * .025, p = egri.getPoint(u), t = egri.getTangent(u);
    const x = p.x + t.z * 1.2, z = p.z - t.x * 1.2;
    if (a.yolaYakin(x, z, .3)) continue;
    const boy = .9 + a.rast() * .7;
    a.silindir(x, Z + boy / 2, z, .025, .04, boy, 0x7aa653, a.dunya, 4).rotation.z = (a.rast() - .5) * .25;
  }

  /* ——— ÇINAR (merkez) ——— */
  const cinar = new THREE.Group(); cinar.position.set(CINAR.x, Z, CINAR.z); a.dunya.add(cinar);
  cinar.userData.hareketli = true;                          // Pamuk ve yuva tik() ile oynuyor
  a.silindir(0, 2.3, 0, .7, .98, 4.6, 0x9a8c78, cinar, 12);
  for (let i = 0; i < 7; i++) {                             // çınarın alacalı kabuğu
    const ac = i * .9, y = .6 + (i * .47) % 3;
    const l = a.top(Math.cos(ac) * .8, y, Math.sin(ac) * .8, .26, i % 2 ? 0xc9c0a8 : 0xb8ad94, cinar, 0);
    l.scale.set(.5, 1, .5);
  }
  for (let i = 0; i < 4; i++) {                             // kökler
    const ac = i * Math.PI / 2 + .4;
    const k = a.top(Math.cos(ac) * .95, .1, Math.sin(ac) * .95, .4, 0x8f8270, cinar, 1); k.scale.set(1.2, .45, .7);
    k.rotation.y = -ac;
  }
  // Taç: geniş ve yüksek; altından ve çevresinden dolaşılır
  // (taç, dala çıkan karakterin kamerası yaprakların içinde kalmasın diye yüksekte)
  for (const [x, y, z, r, renk] of [[0, 6.5, 0, 2.5, 0x5f9e5f], [-1.7, 5.9, .7, 1.7, 0x6fae62], [1.6, 6.1, -.6, 1.8, 0x74b06c],
                                     [.3, 7.4, .4, 1.7, 0x7cb56c], [.8, 5.8, 1.5, 1.4, 0x5f9e5f], [-.9, 6.2, -1.4, 1.5, 0x6aa65e]]) {
    const t = a.top(x, y, z, r, renk, cinar, 1); t.scale.y = .78;
  }
  a.engelEkle(CINAR.x, CINAR.z, .98, 1.3);
  // Doğuya uzanan kalın dal: ucunda düz bir yer, yuva orada
  const dal = a.silindir(1.25, 2.46, 0, .14, .22, 1.9, 0x8f8270, cinar, 8); dal.rotation.z = Math.PI / 2 - .12;
  a.top(2.15, 2.5, 0, .36, 0x8f8270, cinar, 1).scale.set(1.5, .32, 1.2);
  a.yukseltiEkle(CINAR.x + 2.05, CINAR.z, .6, .45, Z + 2.62);

  /* Yapraktan merdiven-köprü: her iyilik bir basamak. Gövdeye dolanarak
     yükselir; altıncı basamak doğudaki dala, yuvaya ulaşır. */
  const BASAMAK = 7, ADIM_Y = .37, R = 1.5, DAC = .62;
  const acik = Math.min(BASAMAK, Math.floor(dolu * 9 + .001));
  for (let i = 0; i < acik; i++) {
    const ac = (i - 6) * DAC, x = Math.cos(ac) * R, z = Math.sin(ac) * R, y = ADIM_Y * (i + 1);
    const y0 = a.top(x, y - .03, z, .62, i % 2 ? 0x86bd5a : 0x78b04e, cinar, 1);
    y0.scale.set(1, .09, .78); y0.rotation.y = -ac;
    const damar = a.kutu(x, y + .03, z, .9, .02, .04, 0x5e9440, cinar); damar.rotation.y = -ac + Math.PI / 2;
    const sap = a.silindir(x * .6, y - .06, z * .6, .03, .03, .7, 0x6f8a45, cinar, 5);
    sap.rotation.z = Math.PI / 2; sap.rotation.y = -ac;
    a.yukseltiEkle(CINAR.x + x, CINAR.z + z, .6, .6, Z + y);
  }

  /* Yuva: ikinci yarıda (Minik onardıktan sonra) dalda. */
  if (dolu >= .5) {
    const yv = new THREE.Group(); yv.position.set(2.15, 2.6, 0); cinar.add(yv);
    const halka = a.cisim(new THREE.TorusGeometry(.36, .14, 7, 16), 0x9c7a52, 0, .1, 0, yv); halka.rotation.x = Math.PI / 2;
    a.silindir(0, .02, 0, .34, .26, .1, 0x8a6a45, yv, 12);
    for (let i = 0; i < 8; i++) {
      const c = a.silindir(Math.cos(i) * .34, .14, Math.sin(i) * .34, .015, .015, .5, 0xb58e60, yv, 3);
      c.rotation.z = Math.PI / 2 - .3; c.rotation.y = i * .8;
    }
    a.top(.1, .2, .12, .07, 0xf2efe8, yv, 1).scale.set(.8, .6, 1);                  // yumuşak tüy
  }

  /* ——— Karakterler ——— */
  const G = (x, y, z, ry = 0, ebeveyn = a.dunya) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.userData.hareketli = true; ebeveyn.add(g); return g;
  };
  const sonu = dolu >= .999;
  let pamuk = null;
  if (modeller.guvercin3b && !sonu) {
    const yuvada = dolu >= .5;
    pamuk = G(yuvada ? 2.15 : 2.1, yuvada ? 2.68 : 2.6, 0, 0, cinar);
    modeller.guvercin3b(a, pamuk, { olcek: .95, uyku: dolu >= .75 });
    pamuk.userData.y0 = pamuk.position.y;
  }
  if (modeller.kedi3b && !sonu) {
    if (dolu < .75) {                                         // sazlıkta uyuyor
      const k = G(SAZLIK.x - .5, Z, SAZLIK.z - .4, .8);
      modeller.kedi3b(a, k, { olcek: 1.1, uyku: true });
      a.engelEkle(SAZLIK.x - .5, SAZLIK.z - .4, .45, .5, .7);
    } else {                                                  // çınarın dibine sokulmuş
      const k = G(-2.9, Z, -1.9, Math.atan2(2.9, 2.1));
      modeller.kedi3b(a, k, { olcek: 1.1 });
      a.engelEkle(-2.9, -1.9, .45, .5, .7);
    }
  }
  // Zıpzıp: şelaleye yakın bir nilüferin üstünde
  if (modeller.kurbaga3b && niluferler[2]) {
    const n = niluferler[2];
    modeller.kurbaga3b(a, G(n.x, Z + .09, n.z, .6), { olcek: 1.0 });
  }
  // Son: üçü güneşli taşın üstünde yan yana
  if (sonu) {
    const tx = GUNES_TASI.x, tz = GUNES_TASI.z, ty = Z + .42;
    if (modeller.kedi3b) modeller.kedi3b(a, G(tx + .15, ty, tz + .3, -.4), { olcek: 1.05, uyku: true });
    if (modeller.guvercin3b) modeller.guvercin3b(a, G(tx - .75, ty, tz + .4, .2), { olcek: .9 });
    if (modeller.karinca3b) modeller.karinca3b(a, G(tx - .3, ty, tz + .72, .1), { olcek: .55 });
    if (modeller.kurbaga3b) modeller.kurbaga3b(a, G(tx + 1.3, Z + .08, tz + .9, -.9), { olcek: .9 });
  }

  /* ——— Süsler: ağaçlar, çalılar, kayalar ——— */
  [[-11.6, 1.6, 1.05], [-6.2, -9.4, .9], [7.6, -8.8, .95], [3.6, 9.4, .9], [-5.6, 9.2, 1.0], [12.3, -6.6, .85]]
    .forEach(([x, z, o]) => sogut(x, z, o));
  [[-11.8, 4.0, .9], [9.8, 8.8, .95], [-12.2, -1.4, .8], [12.4, 2.6, .8], [1.2, -9.6, .85]]
    .forEach(([x, z, o]) => cam(x, z, o));
  for (let i = 0; i < 16; i++) {
    const x = -11 + a.rast() * 22, z = -8.6 + a.rast() * 17.2;
    if (Math.hypot(x - CINAR.x, z - CINAR.z) < 3.2 || Math.hypot(x - YUVA.x, z - YUVA.z) < 2.2) continue;
    cali(x, z, .26 + a.rast() * .26, [0x6f9e63, 0x7fae6a, 0x5f9058][i % 3]);
  }
  for (let i = 0; i < 10; i++) {
    const x = -11 + a.rast() * 22, z = -8.6 + a.rast() * 17.2;
    if (Math.hypot(x - CINAR.x, z - CINAR.z) < 3.2 || Math.hypot(x - YUVA.x, z - YUVA.z) < 2.2
        || Math.hypot(x - GUNES_TASI.x, z - GUNES_TASI.z) < 2) continue;
    kaya(x, z, .2 + a.rast() * .3);
  }
  // Çiçekler: kıyı boyunca sarı, beyaz
  for (let i = 0; i < 34; i++) {
    const x = -11.5 + a.rast() * 23, z = -8.8 + a.rast() * 17.6;
    if (a.yolaYakin(x, z, .3) || Math.hypot(x - CINAR.x, z - CINAR.z) < 2.4) continue;
    a.silindir(x, Z + .1, z, .02, .025, .2, 0x6f9c56, a.dunya, 4);
    a.top(x, Z + .22, z, .07, [0xf2de9d, 0xfff2e0, 0xf4c9d6][i % 3], a.dunya, 0);
  }

  /* ——— Uçan ve yüzen canlılar ——— */
  const yapraklar = [];
  if (modeller['yaprak-kayik']) for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); g.userData.hareketli = true; a.dunya.add(g);
    modeller['yaprak-kayik'](a, g, { olcek: .32, renk: [0x86bd5a, 0x9ccf6c, 0xc9a24e, 0x86bd5a][i] });
    yapraklar.push({ g, faz: i / 4 });
  }
  const yusufcuklar = [];
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group(); g.userData.hareketli = true; a.dunya.add(g);
    a.silindir(0, 0, 0, .025, .018, .42, 0x3a8fa8, g, 5).rotation.x = Math.PI / 2;
    a.top(0, 0, .22, .045, 0x2f7890, g, 0);
    const kanatlar = [];
    for (const [s, zz] of [[-1, .08], [1, .08], [-1, -.02], [1, -.02]]) {
      const k = a.cisim(new THREE.PlaneGeometry(.28, .07), 0xd9f0f5, s * .15, .01, zz, g,
        { transparent: true, opacity: .7, side: THREE.DoubleSide });
      k.rotation.x = -Math.PI / 2; k.castShadow = false; kanatlar.push({ k, s });
    }
    yusufcuklar.push({ g, kanatlar, u: .15 + i * .3 });
  }

  /* ——— İtilebilir ——— */
  if (a.itilebilir) {
    // Cevizler: yuvarlanır (dilimli kabak gövdesi kahverengi, sap koyu)
    [[-6.0, -2.0, .3], [-8.8, -0.8, .26], [2.8, -3.8, .28], [4.4, 4.4, .3], [-1.6, 8.6, .27]]
      .forEach(([x, z, r]) => a.itilebilir({ x, z, r, tip: 'kabak', renk: 0xb88b5a, ikinci: 0x6b4f33 }));
    // Çam kozalakları: çarpınca devrilir
    [[-6.6, .4], [9.4, 1.2], [2.0, 9.2], [-10.6, 3.2]]
      .forEach(([x, z]) => a.itilebilir({ x, z, r: .26, tip: 'koni', renk: 0x9c7552, ikinci: 0x7d5a3a }));
    // Küçük kurbağalar: yaklaşınca zıplayıp kaçar, boşta dere kıyısında gezinir
    if (modeller.kurbaga3b) [[-5.2, -6.8], [3.9, -6.6], [9.6, -1.2]]
      .forEach(([x, z], i) => a.itilebilir({ x, z, r: .28, tip: 'hayvan', yon: i * 2,
        model: grup => modeller.kurbaga3b(a, grup, { olcek: .5, renk: [0x8cc063, 0x7cb556, 0x98c46a][i] }) }));
  }

  return {
    tik(t) {
      kopuk.forEach((k, i) => { k.position.y = k.userData.y0 + Math.abs(Math.sin(t * 3 + i * 1.3)) * .07; });
      karincalar.forEach(({ g, faz, r, hiz }) => {
        const ac = faz + t * hiz;
        g.position.set(YUVA.x + Math.cos(ac) * r, Z, YUVA.z + Math.sin(ac) * r * .88);
        g.rotation.y = -ac;                                     // teğet yönünde yürür
      });
      yapraklar.forEach(({ g, faz }, i) => {
        const u = (faz + t * .012) % 1, p = egri.getPoint(u), d = egri.getTangent(u);
        g.position.set(p.x, Z + .06 + Math.sin(t * 2 + i) * .02, p.z);
        g.rotation.y = Math.atan2(d.x, d.z) + Math.sin(t * .7 + i) * .3;
      });
      yusufcuklar.forEach(({ g, kanatlar, u }, i) => {
        const v = (u + Math.sin(t * .09 + i) * .08 + 1) % 1, p = egri.getPoint(v);
        g.position.set(p.x + Math.sin(t * .8 + i * 2) * 1.1, Z + .9 + Math.sin(t * 1.7 + i) * .25, p.z + Math.cos(t * .6 + i) * .9);
        g.rotation.y = t * .5 + i;
        kanatlar.forEach(({ k, s }) => { k.rotation.z = s * Math.sin(t * 40 + i) * .5; });
      });
      if (pamuk) pamuk.position.y = pamuk.userData.y0 + Math.sin(t * 1.4) * .015;
    }
  };
}

export default { dere };

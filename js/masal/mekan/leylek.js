/* Tilki ile Leylek mekânı — mekân adı → kurucu işlev (bkz. mekanlar.js).

   KÖY. Dört köşe dört yer, ortada herkesin sofrası:
     sol üst   Alev'in toprak yuvası (üstüne tırmanılan çimenli tepecik,
               yuvarlak kapı, bacadan duman), taş ocak, sebze bahçesi
     sağ üst   Alev'in bahçe masası: üstünde iki DÜZ tabak — Lale'ninki
               hâlâ dolu
     sağ alt   Lale'nin evi: köyün en yüksek bacası ve tepesinde leylek
               yuvası; yanında Bilge'nin çınarı (dalında baykuş) ve üç
               basamakla çıkılan çardak — üstünde ince uzun testiler
     sol alt   sazlıklı gölet (leylek yavrusu suyun içinde yürüyebilir)
     ortada    uzun ortak sofra. Sınıf ilerledikçe (a.dolu) üstüne sırayla
               tabak ve testi diziliyor, bayrak dizisi uzuyor; son bölümde
               Alev ile Lale sofranın iki ucunda oturuyor.
   Kuyu sofranın güneyinde. İtilebilir: kabaklar, testiler, toplar ve
   ortalıkta dolaşan üç tavuk (yaklaşınca kaçarlar).

   Bu dosya mekanlar.js'ten hiçbir şey içe aktarmaz: o dosya bu listeyi
   kendisi yüklüyor (döngüsel içe aktarma). Yardımcılar burada. */

import {leylek as leylekModeli, leylekTilki, leylekTavuk} from '../modeller/leylek.js';

export default {
  koy(a) {
    const { THREE } = a;
    const Z = a.ZEMIN;
    const grup = (x, y, z, hareketli = false) => {
      const g = new THREE.Group(); g.position.set(x, y, z); a.dunya.add(g);
      if (hareketli) g.userData.hareketli = true;
      return g;
    };
    a.ceyrek([0xbcc77f, 0xcdcf8a, 0x9fc19d, 0xa9cc80]);

    /* ——— Yardımcılar ——— */
    function agac(x, z, { olcek = 1, renk = [0x5f9e5f, 0x7cb56c], meyve = null } = {}) {
      const g = grup(x, Z, z); g.scale.setScalar(olcek);
      a.engelEkle(x, z, .3 * olcek, 1.3 * olcek);
      a.silindir(0, .8, 0, .15, .25, 1.6, 0x9b7550, g, 7);
      a.top(0, 2.1, 0, 1.05, renk[0], g); a.top(-.55, 1.9, .3, .7, renk[1], g); a.top(.45, 2.35, -.2, .68, renk[0], g);
      if (meyve) for (let i = 0; i < 9; i++) {
        const ac = i / 9 * Math.PI * 2, y = 1.8 + (i % 3) * .3;
        a.top(Math.cos(ac) * .95, y, Math.sin(ac) * .95, .1, meyve, g, 1);
      }
      return g;
    }
    function cit(x, z, boy, aci = 0, renk = 0xf1e0ba) {
      const g = grup(x, Z, z); g.rotation.y = aci;
      for (let i = 0; i <= boy; i++) a.kutu(i - boy / 2, .38, 0, .1, .76, .1, renk, g);
      a.kutu(0, .3, 0, boy + .1, .09, .08, 0xdfc79c, g); a.kutu(0, .6, 0, boy + .1, .09, .08, renk, g);
      a.kutuEngel(x, z, boy + .1, .14, aci, .78, false);        // alçak: üstünden zıplanır
    }
    function kaya(x, z, r, renk = 0xb3b5a4) {
      if (a.yolaYakin(x, z, r + .4)) return;
      const k = a.top(x, Z + r * .4, z, r, renk, a.dunya, 0); k.scale.set(1.25, .6, .95); k.rotation.y = a.rast() * 3;
      if (r > .3) a.engelEkle(x, z, r * .9, 0, r * .9);
    }
    function cicek(x, z) {
      if (a.yolaYakin(x, z, .35)) return;
      a.silindir(x, Z + .12, z, .02, .025, .24, 0x6f9c56, a.dunya, 4);
      a.top(x, Z + .26, z, .075, [0xf2de9d, 0xf4c9d6, 0xfff2e0, 0xe98a7a][Math.floor(a.rast() * 4)], a.dunya, 0);
    }
    /* Testi: ince boyun, şişkin gövde. Tornada çekilmiş gibi (Lathe). */
    const testiGeo = new THREE.LatheGeometry([
      [0, 0], [.1, 0], [.15, .06], [.17, .16], [.15, .26], [.08, .34], [.05, .4], [.05, .5], [.07, .53], [0, .53]
    ].map(([r, y]) => new THREE.Vector2(r, y)), 14);
    const testi = (x, y, z, olcek, e = a.dunya) => {
      const m = a.cisim(testiGeo, 0xcf7a4c, x, y, z, e); m.scale.setScalar(olcek); return m;
    };
    /* Düz tabak (içinde çorba olabilir). */
    const tabak = (x, y, z, olcek, e = a.dunya, corba = true) => {
      const t = a.silindir(x, y + .015 * olcek, z, .22 * olcek, .16 * olcek, .03 * olcek, 0xf7f9fa, e, 18);
      if (corba) a.silindir(x, y + .032 * olcek, z, .15 * olcek, .15 * olcek, .006, 0xe9a24a, e, 16);
      return t;
    };

    /* ═════════ ORTA: uzun ortak sofra ═════════ */
    const sofra = grup(0, Z, .2, true);
    a.silindir(0, .02, 0, 3.6, 3.7, .04, 0xe8d8b4, sofra, 40).scale.z = .78;           // taş avlu
    a.kutu(0, .72, 0, 5.4, .1, 1.5, 0xb98a55, sofra);                                     // tabla
    a.kutu(0, .78, 0, 5.5, .025, 1.36, 0xf7efe0, sofra);                                  // örtü
    a.kutu(0, .795, 0, 5.52, .02, .34, 0xd8743e, sofra);                                  // ortada şerit
    for (const [x, z] of [[-2.5, -.56], [2.5, -.56], [-2.5, .56], [2.5, .56]]) a.kutu(x, .34, z, .13, .68, .13, 0x9c7048, sofra);
    for (const yon of [-1, 1]) {                                                           // iki uzun bank
      a.kutu(0, .4, yon * 1.2, 5, .1, .42, 0xc39a66, sofra);
      for (const x of [-2.2, 0, 2.2]) a.kutu(x, .18, yon * 1.2, .12, .36, .3, 0x9c7048, sofra);
    }
    a.kutuEngel(0, .2, 5.5, 1.55);                                                        // masa: etrafından dolaşılır
    for (const yon of [-1, 1]) a.yukseltiEkle(0, .2 + yon * 1.2, 2.5, .22, Z + .45, { kutu: true });   // banka çıkılır
    /* Sınıf ilerledikçe sofraya tabak ve testi diziliyor: bir tabak, bir testi. */
    const kap = Math.round(a.dolu * 16);
    for (let i = 0; i < kap; i++) {
      const k = i % 8, yan = i < 8 ? -1 : 1, x = -2.31 + k * .66, z = yan * .42;
      if ((k + (i < 8 ? 0 : 1)) % 2 === 0) tabak(x, .8, z, 1, sofra);
      else testi(x, .8, z, .72, sofra);
    }
    const buhar = [];
    if (a.dolu > .4) {                                                                    // ortada çorba tenceresi
      a.silindir(0, .98, 0, .3, .26, .34, 0x8b98a3, sofra, 16);
      a.silindir(0, 1.16, 0, .31, .31, .03, 0xe9a24a, sofra, 16);
      for (let i = 0; i < 3; i++) {
        const b = a.top(0, 1.3 + i * .22, 0, .1 + i * .03, 0xf2f4f2, sofra, 1);
        b.castShadow = false; b.material = a.mal(0xf2f4f2, { transparent: true, opacity: .7 - i * .18 });
        buhar.push(b);
      }
    }
    /* Bayrak dizisi: arka bankın gerisinde iki direk; bayraklar ilerledikçe çoğalır. */
    for (const x of [-2.9, 2.9]) {
      a.silindir(x, 1.2, -1.75, .05, .06, 2.4, 0xa5794d, sofra, 6);
      a.engelEkle(x, .2 - 1.75, .1, .2);
    }
    const bayraklar = [];
    const bayrakSay = 3 + Math.round(a.dolu * 11);
    const ucgen = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-.13, 0, 0), new THREE.Vector3(.13, 0, 0), new THREE.Vector3(0, -.26, 0)]);
    ucgen.computeVertexNormals();
    for (let i = 0; i < bayrakSay; i++) {
      const t = (i + .5) / 14, x = -2.8 + t * 5.6, y = 2.28 - Math.sin(t * Math.PI) * .35;
      const b = a.cisim(ucgen, [0xd8743e, 0xf0c86a, 0x6fa8c4, 0xcf4535, 0x5f9a55][i % 5], x, y, -1.75, sofra, { side: THREE.DoubleSide });
      b.userData.y0 = y; bayraklar.push(b);
    }
    /* Son bölümde Alev ile Lale sofranın iki ucunda. */
    if (a.dolu > .74) {
      const sol = grup(-3.25, Z, .2, true); sol.rotation.y = Math.PI / 2;
      leylekTilki({ THREE, mal: a.mal }, sol, { olcek: 1.25 });
      const sag = grup(3.3, Z, .2, true); sag.rotation.y = -Math.PI / 2;
      leylekModeli({ THREE, mal: a.mal }, sag, { olcek: 1.35 });
      a.engelEkle(-3.25, .2, .4, .5); a.engelEkle(3.3, .2, .35, .5);
    }

    /* ═════════ SOL ÜST: Alev'in yuvası, ocak, bahçe ═════════ */
    const yx = -11.2, yz = -7;
    const yuva = grup(yx, Z, yz, true);
    const tepe = a.top(0, 0, 0, 1, 0x8fb46a, yuva, 2); tepe.scale.set(2.1, 1.25, 1.7);
    a.top(-.6, .55, -.5, .7, 0x9dbf73, yuva, 1).scale.set(1.1, .6, .9);
    a.yukseltiEkle(yx, yz, 2.06, 1.66, Z + 1.22, { yumusak: true });                       // tepeciğe tırmanılır
    // Kapı: yuvarlak, ahşap, taş kemerli; tepeciğin güney yüzünde
    const kapi = new THREE.Group(); kapi.position.set(0, .42, 1.42); kapi.rotation.x = -.35; yuva.add(kapi);
    a.silindir(0, 0, 0, .56, .56, .1, 0xb8ad98, kapi, 20).rotation.x = Math.PI / 2;
    a.silindir(0, 0, .05, .44, .44, .1, 0x8b5a34, kapi, 20).rotation.x = Math.PI / 2;
    a.top(.24, 0, .12, .05, 0xe0b054, kapi, 1);
    a.silindir(.95, .5, 1.18, .2, .2, .06, 0xbfe0ea, yuva, 14).rotation.x = Math.PI / 2 - .5;   // yuvarlak pencere
    a.engelEkle(yx, yz + 1.35, .5, .6);                                                   // kapının önü dik
    a.silindir(.7, 1.25, -.3, .09, .11, .6, 0x8b98a3, yuva, 8);                           // baca borusu
    const duman = [];
    for (let i = 0; i < 3; i++) {
      const d = a.top(.7 + i * .15, 1.7 + i * .3, -.3, .13 + i * .04, 0xeef2f0, yuva, 1);
      d.castShadow = false; d.material = a.mal(0xeef2f0, { transparent: true, opacity: .75 - i * .2 });
      duman.push(d);
    }
    for (let i = 0; i < 10; i++) {                                                        // tepecikte çiçekler
      const ac = a.rast() * Math.PI * 2, r = .3 + a.rast() * .55;
      const x = Math.cos(ac) * 2.1 * r, z = Math.sin(ac) * 1.7 * r, y = 1.25 * Math.sqrt(1 - r * r);
      a.top(x, y, z, .07, [0xf2de9d, 0xf4c9d6, 0xfff2e0][i % 3], yuva, 0);
    }
    // Taş ocak: üstünde tencere, tencereden buhar
    const ocak = grup(-8.4, Z, -8.6, true);
    a.kutu(0, .35, 0, 1.2, .7, .9, 0xb9ae9c, ocak);
    a.kutu(0, .36, .46, .5, .34, .04, 0x3e3a36, ocak);
    a.top(0, .3, .5, .12, 0xf0a14a, ocak, 1).material = a.mal(0xf0a14a, { emissive: 0xd8742e, emissiveIntensity: .6 });
    a.silindir(0, .86, 0, .32, .28, .32, 0x8b98a3, ocak, 16);
    a.silindir(0, 1.03, 0, .33, .33, .03, 0xe9a24a, ocak, 16);
    a.kutuEngel(-8.4, -8.6, 1.3, 1);
    const ocakBuhar = [];
    for (let i = 0; i < 3; i++) {
      const d = a.top(0, 1.2 + i * .24, 0, .1 + i * .03, 0xf4f6f4, ocak, 1);
      d.castShadow = false; d.material = a.mal(0xf4f6f4, { transparent: true, opacity: .7 - i * .2 });
      ocakBuhar.push(d);
    }
    // Sebze bahçesi: dört sıra; havuç ve lahana. Yolun üstüne ekilmez.
    for (let s = 0; s < 4; s++) {
      const z = -2.7 - s * .56;
      const sira = a.kutu(-6.3, Z + .04, z, 2.3, .08, .3, 0x8a6a48); sira.castShadow = false;
      for (let k = 0; k < 5; k++) {
        const x = -7.3 + k * .5;
        if (a.yolaYakin(x, z, .45)) continue;
        if (s % 2) { const l = a.top(x, Z + .2, z, .17, 0x7fb86a, a.dunya, 1); l.scale.y = .8; }
        else {
          a.silindir(x, Z + .12, z, .05, .015, .18, 0xec8a3a, a.dunya, 6);
          const y = a.top(x, Z + .27, z, .09, 0x6fae4e, a.dunya, 0); y.scale.set(.8, 1.4, .8);
        }
      }
    }

    /* ═════════ SAĞ ÜST: Alev'in bahçe masası — iki düz tabak ═════════ */
    const masa = grup(5.2, Z, -3.6);
    a.silindir(0, .6, 0, .78, .78, .07, 0xc39a66, masa, 22);
    a.silindir(0, .3, 0, .08, .12, .6, 0x9c7048, masa, 8);
    a.silindir(0, .02, 0, .35, .4, .04, 0x9c7048, masa, 12);
    tabak(-.32, .64, .1, 1.4, masa, false);             // Alev'in tabağı: yalanmış, boş
    tabak(.34, .64, -.05, 1.4, masa);                   // Lale'nin tabağı: hâlâ dolu
    a.silindir(-.05, .7, -.38, .05, .05, .14, 0xf6f1e2, masa, 8);    // tuzluk
    a.engelEkle(5.2, -3.6, .8, .9);
    for (const [x, z] of [[-1.15, .45], [1.15, .1]]) {                                  // tabureler
      a.silindir(x, .2, z, .26, .26, .4, 0xb98a55, masa, 12);
      a.engelEkle(5.2 + x, -3.6 + z, .26, .3, .42);
    }
    agac(9.4, -8.2, { olcek: 1.05, meyve: 0xe2553f });   // elma ağacı
    agac(2.6, -9.4, { olcek: .9 });

    /* ═════════ SAĞ ALT: Lale'nin evi, bacası, Bilge'nin çınarı, çardak ═════════ */
    const lx = 11.3, lz = 6.9;
    const ev = grup(lx, Z, lz, true);
    a.kutu(0, .9, 0, 2.6, 1.8, 2.2, 0xf1ebdc, ev);
    const cati = new THREE.Shape(); cati.moveTo(-1.45, 0); cati.lineTo(1.45, 0); cati.lineTo(0, 1.05); cati.closePath();
    for (const z of [-1.1, 1.1]) a.cisim(new THREE.ShapeGeometry(cati), 0xf1ebdc, 0, 1.8, z, ev, { side: THREE.DoubleSide });
    for (const yon of [-1, 1]) {
      const e = a.kutu(yon * .74, 2.33, 0, 1.78, .12, 2.5, 0xc0674c, ev); e.rotation.z = -yon * .62;
    }
    a.kutu(-1.31, .6, .2, .06, 1.2, .7, 0x8b5a34, ev);                                   // kapı (batıya bakar)
    a.top(-1.36, .6, .44, .045, 0xe0b054, ev, 1);
    a.kutu(-1.31, 1.2, -.6, .06, .5, .5, 0xbfe0ea, ev);                                  // pencere
    a.kutu(-1.31, 1.2, -.6, .07, .06, .56, 0x8b5a34, ev);
    a.kutuEngel(lx, lz, 2.7, 2.3);
    // Köyün en yüksek bacası; tepesinde dallardan leylek yuvası ve Lale
    a.kutu(.85, 2.6, .7, .62, 4.2, .62, 0xc0674c, ev);
    for (let i = 0; i < 9; i++) a.kutu(.85, .9 + i * .42, .7, .64, .04, .64, 0xa4523b, ev);
    a.kutu(.85, 4.74, .7, .76, .1, .76, 0x9e4b36, ev);
    const yuvaOrgu = a.cisim(new THREE.TorusGeometry(.5, .16, 8, 22), 0xa98158, .85, 4.9, .7, ev);
    yuvaOrgu.rotation.x = Math.PI / 2;
    a.silindir(.85, 4.86, .7, .48, .48, .1, 0x8a6644, ev, 18);
    const lale = new THREE.Group(); lale.position.set(.85, 4.92, .7); lale.rotation.y = -1.2; ev.add(lale);
    leylekModeli({ THREE, mal: a.mal }, lale, { olcek: 1.5 });
    a.engelEkle(lx + .85, lz + .7, .45, .5);
    cit(lx - 1.6, lz + 2.1, 3, 0);                                                        // ön bahçe çiti
    // Bilge'nin çınarı ve dalında baykuş
    const cinar = agac(12.3, 3.4, { olcek: 1.25, renk: [0x4f8f5a, 0x6aa566] });
    const dal = a.silindir(-.55, 1.55, .25, .05, .07, .9, 0x9b7550, cinar, 5); dal.rotation.z = 1.2;
    const baykus = new THREE.Group(); baykus.position.set(-.85, 1.7, .3); baykus.rotation.y = -.9; cinar.add(baykus);
    cinar.userData.hareketli = true;
    const bG = a.top(0, .2, 0, .2, 0x8f6c4d, baykus, 2); bG.scale.set(1, 1.25, .95);
    a.top(0, .18, .12, .13, 0xe9d7b4, baykus, 1).scale.set(1, 1.2, .5);
    for (const yon of [-1, 1]) {
      a.top(yon * .08, .32, .15, .065, 0xf4c74a, baykus, 1);
      a.top(yon * .08, .32, .2, .03, 0x2a2320, baykus, 0);
      const k = a.silindir(yon * .1, .5, 0, 0, .05, .14, 0x7a5a3f, baykus, 4); k.rotation.z = -yon * .3;
    }
    a.top(0, .26, .2, .03, 0xd9a043, baykus, 0);
    // Çardak: üç basamakla çıkılan yüksek sofra; üstünde uzun testiler
    const cx = 5.2, cz = 3.2, H = 1.2;
    const cardak = grup(cx, Z, cz);
    a.kutu(0, H - .06, 0, 2.4, .12, 2, 0xc9a26f, cardak);
    for (const [x, z] of [[-1.1, -.9], [1.1, -.9], [-1.1, .9], [1.1, .9]]) {
      a.kutu(x, (H + 1.4) / 2, z, .14, H + 1.4, .14, 0x9c7048, cardak);
      a.engelEkle(cx + x, cz + z, .12, .2);
    }
    for (const z of [-.9, 0, .9]) a.kutu(0, H + 1.42, z, 2.5, .08, .1, 0x9c7048, cardak);
    for (let i = 0; i < 14; i++) {                                                        // üstte asma yaprakları
      const y = a.top(-1.1 + a.rast() * 2.2, H + 1.5, -.9 + a.rast() * 1.8, .22, 0x6fae5a, cardak, 1); y.scale.y = .5;
    }
    a.kutu(-1.18, H + .35, 0, .06, .06, 2, 0x9c7048, cardak);                             // korkuluk
    a.kutu(1.18, H + .35, 0, .06, .06, 2, 0x9c7048, cardak);
    a.kutu(0, H + .35, -.98, 2.4, .06, .06, 0x9c7048, cardak);
    a.yukseltiEkle(cx, cz, 1.2, 1, Z + H, { kutu: true });
    for (let s = 0; s < 3; s++) {                                                         // basamaklar (güneye iner)
      const h = H * (3 - s) / 4, z = 1.2 + s * .4;
      a.kutu(0, h / 2, z, 1, h, .4, 0xb58c5c, cardak);
      a.yukseltiEkle(cx, cz + z, .5, .2, Z + h, { kutu: true });
    }
    a.silindir(-.45, H + .3, -.35, .3, .3, .05, 0xc39a66, cardak, 16);                    // Lale'nin sofrası
    a.silindir(-.45, H + .14, -.35, .05, .05, .28, 0x9c7048, cardak, 6);
    testi(-.55, H + .33, -.35, .9, cardak); testi(-.3, H + .33, -.3, .75, cardak);
    a.engelEkle(cx - .45, cz - .35, .34, .3);

    /* ═════════ SOL ALT: sazlıklı gölet ═════════ */
    const gx = -10.2, gz = 6.9;
    const kiyi = a.silindir(gx, Z + .01, gz, 2.8, 2.8, .02, 0xd9cfa4, a.dunya, 32); kiyi.scale.z = .66; kiyi.castShadow = false;
    const su = a.silindir(gx, Z + .025, gz, 2.3, 2.3, .02, 0x6fb2c4, a.dunya, 32); su.scale.z = .62; su.castShadow = false;
    const parilti = a.silindir(gx - .3, Z + .035, gz - .2, 1.3, 1.3, .01, 0x8ecbd6, a.dunya, 24); parilti.scale.z = .5; parilti.castShadow = false;
    for (let i = 0; i < 5; i++) {
      const n = a.silindir(gx - 1.2 + i * .6, Z + .05, gz + (i % 2 ? .4 : -.3), .2, .2, .02, 0x77b06a, a.dunya, 10);
      n.castShadow = false;
      if (i % 2 === 0) a.top(gx - 1.2 + i * .6, Z + .1, gz + (i % 2 ? .4 : -.3), .07, 0xf0d5e4, a.dunya, 0);
    }
    /* Sazlar sabit: hareket etmeyince dunya.js onları tek çizimde topluyor. */
    const sazlar = grup(gx, Z, gz);
    for (let i = 0; i < 26; i++) {
      const ac = (i / 26) * Math.PI * 2 + a.rast() * .2, r = .92 + a.rast() * .12;
      const x = Math.cos(ac) * 2.4 * r, z = Math.sin(ac) * 1.5 * r;
      if (Math.sin(ac) > .2 && Math.cos(ac) > -.2) continue;                              // güneydoğu yüzü açık
      const boy = .7 + a.rast() * .5;
      const s = new THREE.Group(); s.position.set(x, 0, z); sazlar.add(s);
      a.silindir(0, boy / 2, 0, .018, .03, boy, 0x6f9c56, s, 4);
      a.silindir(0, boy + .08, 0, .045, .045, .18, 0x8a5a36, s, 6);
      s.rotation.z = (a.rast() - .5) * .16;
    }
    cit(-12.4, 8.9, 3, 0);

    /* ═════════ KUYU ═════════ */
    const kuyu = grup(.6, Z, 4.9);
    a.silindir(0, .35, 0, .62, .66, .7, 0xb9ae9c, kuyu, 16);
    a.silindir(0, .69, 0, .5, .5, .03, 0x4f7f8a, kuyu, 16);
    for (const x of [-.55, .55]) a.kutu(x, 1.05, 0, .1, .8, .1, 0x9c7048, kuyu);
    a.silindir(0, 1.3, 0, .06, .06, 1.2, 0x9c7048, kuyu, 6).rotation.z = Math.PI / 2;
    for (const yon of [-1, 1]) { const c = a.kutu(0, 1.62, yon * .3, 1.4, .06, .7, 0xc0674c, kuyu); c.rotation.x = yon * .55; }
    a.silindir(.15, .95, 0, .12, .1, .18, 0x8b98a3, kuyu, 10);
    a.engelEkle(.6, 4.9, .7, .8);

    /* ═════════ Süsler: ağaçlar, kayalar, çiçekler ═════════ */
    agac(-1.4, -4.8, { olcek: .85 });
    agac(3.0, 5.6, { olcek: .8, renk: [0x6aa566, 0x86bb72] });
    agac(-3.4, 4.8, { olcek: .9, meyve: 0xf0c86a });
    for (let i = 0; i < 8; i++) kaya(-12 + a.rast() * 24, (a.rast() > .5 ? 1 : -1) * (8.6 + a.rast() * .9), .2 + a.rast() * .2);
    for (let i = 0; i < 40; i++) {
      const ac = a.rast() * Math.PI * 2, r = .35 + a.rast() * .85;
      const x = Math.cos(ac) * 12 * r, z = Math.sin(ac) * 9 * r;
      if (Math.hypot(x, (z - .2) * 1.2) < 4.4) continue;
      cicek(x, z);
    }

    /* ═════════ İtilebilir nesneler ═════════ */
    // Kabaklar bahçenin çevresinde (ilki açık alanda: itilip yuvarlanabilsin)
    [[-1.6, -5.9, .4], [-8.2, -1.8, .42], [-4.6, -4.3, .36], [-2.6, -3.6, .34], [-6.1, -5.3, .3]]
      .forEach(([x, z, r]) => a.itilebilir({ x, z, r, tip: 'kabak', renk: 0xe08a3c }));
    // Testiler Lale'nin evinin çevresinde: çarpınca devrilir
    [[7.6, 2.0], [8.4, 7.6], [3.0, 3.0], [6.6, -.6]]
      .forEach(([x, z]) => a.itilebilir({ x, z, r: .32, tip: 'fici', renk: 0xcf7a4c, ikinci: 0xa8552f }));
    [[-2.8, 2.8, 0xd8743e], [1.8, -2.6, 0x6fa8c4]]
      .forEach(([x, z, renk]) => a.itilebilir({ x, z, r: .36, tip: 'top', renk, ikinci: 0xf6f1e2 }));
    // Tavuklar: yaklaşınca kaçar, boşta kendi kendine gezinir
    [[-1.8, 6.4, .3], [-4.4, 2.4, 2.2], [2.0, 6.8, 4]]
      .forEach(([x, z, yon]) => a.itilebilir({ x, z, r: .3, tip: 'hayvan', yon,
        model: g => leylekTavuk({ THREE, mal: a.mal }, g, { olcek: .95 }) }));

    return {
      tik(t) {
        duman.forEach((d, i) => { d.position.y = 1.7 + i * .3 + Math.sin(t * .9 + i) * .08; d.position.x = .7 + i * .15 + Math.sin(t * .5 + i) * .06; });
        ocakBuhar.forEach((d, i) => { d.position.y = 1.2 + i * .24 + Math.sin(t * 1.2 + i) * .06; });
        buhar.forEach((d, i) => { d.position.y = 1.3 + i * .22 + Math.sin(t * 1.1 + i) * .06; });
        bayraklar.forEach((b, i) => { b.rotation.x = Math.sin(t * 2.2 + i * .7) * .35; });
        baykus.rotation.y = -.9 + Math.sin(t * .6) * .35;
        lale.rotation.y = -1.2 + Math.sin(t * .4) * .5;
      }
    };
  }
};

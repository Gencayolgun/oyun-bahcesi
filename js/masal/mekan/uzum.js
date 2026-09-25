/* Tilki ile Üzümler mekânı — mekân adı → kurucu işlev (bkz. mekanlar.js).

   ═══════════════════ BAĞ — Tilki ile Üzümler ═══════════════════
   Yamaca kurulmuş bir üzüm bağı. Önde (aşağıda) ön bağ: ceviz ağacı, arı
   kovanları, saman yığını, sandık yığını, Kızıl'ın ini. Ortada yüksek bir
   çardak; tepesinde masalın salkımı sallanıyor. Arkada taş duvarlı iki
   teras yukarı çıkıyor; en üst terasta bağ evi. Aralarda sıra sıra asma.

   MERKEZ DEĞİŞİR (a.dolu): 1. bölümde Kızıl salkımın altında zıplıyor;
   2. bölümde yanında alıştırma taşları beliriyor; 3. bölümde altına
   sandıklar basamak basamak diziliyor (üstüne çıkılır); 4. bölümde bir
   merdiven dayanıyor ve salkım yeşilden mora dönüyor. Masalın sonunda
   salkımlar sepetlerde, çardağın önünde paylaşılıyor.

   AÇIK DÜNYA: asma sıraları gerçek kutu çarpışmalı; aralarındaki
   boşluklardan geçilir. Teraslara (her biri bir basamak yüksekliğinde)
   yürüyerek çıkılır; taş duvarın, saman yığınının, inin tümseğinin ve
   sandık yığınlarının üstüne tırmanılır. Kuyunun, kovanların, bağ evinin
   ETRAFINDAN dolaşılır. Fıçılar ve sepetler devrilir, kabaklar yuvarlanır;
   bağın sincapları yaklaşınca kaçar.

   Döngüsel içe aktarma olmasın diye mekanlar.js'ten hiçbir şey almıyoruz;
   süs yardımcıları burada. */

import {sincapModeli, tilkiModeli} from '../modeller/uzum.js';
import {TERAS} from '../../masallar/uzum.js';

function bag(a) {
  const { THREE, ZEMIN } = a;
  const dolu = a.dolu || 0;
  const Y1 = ZEMIN + TERAS.ust1, Y2 = ZEMIN + TERAS.ust2;
  a.ceyrek([0xb4c587, 0xb1c283, 0xbccb8c, 0xb8c889]);

  /* ——— Süs yardımcıları (yolun ve durakların üstüne süs koymazlar) ——— */
  const kaya = (x, z, r, taban = ZEMIN, renk = 0xb3ae9c) => {
    if (a.yolaYakin(x, z, r + .45)) return null;
    const k = a.top(x, taban + r * .42, z, r, renk, a.dunya, 0);
    k.scale.set(1.25, .6, .92); k.rotation.y = a.rast() * 3;
    if (r > .3) a.engelEkle(x, z, r * .9, 0, taban - ZEMIN + r * 1.0);
    return k;
  };
  const cali = (x, z, r, taban = ZEMIN, renk = 0x7aa35f) => {
    if (a.yolaYakin(x, z, r + .3)) return null;
    const c = a.top(x, taban + r * .5, z, r, renk, a.dunya, 1); c.scale.y = .62; return c;
  };
  const cicek = (x, z, renk) => {
    if (a.yolaYakin(x, z, .5)) return;
    a.silindir(x, ZEMIN + .12, z, .018, .024, .24, 0x6f9c56, a.dunya, 4);
    a.top(x, ZEMIN + .26, z, .07, renk, a.dunya, 0);
  };
  /* Sandık: tahta, çıtalı. taban: altının y'si. */
  const sandik = (x, z, taban, ebe = a.dunya, aci = 0) => {
    const g = new THREE.Group(); g.position.set(x, taban, z); g.rotation.y = aci; ebe.add(g);
    a.kutu(0, .21, 0, .66, .4, .66, 0xc8955a, g);
    a.kutu(0, .12, .335, .68, .06, .02, 0x9c6b3e, g); a.kutu(0, .3, .335, .68, .06, .02, 0x9c6b3e, g);
    a.kutu(0, .12, -.335, .68, .06, .02, 0x9c6b3e, g); a.kutu(0, .3, -.335, .68, .06, .02, 0x9c6b3e, g);
    return g;
  };

  /* ——— TERASLAR: yamaç iki basamak yukarı çıkıyor ———
     Her teras kutu bir yükselti; ön yüzü kuru taş duvar. Basamak 0.3:
     her yerinden yürüyerek çıkılır (adım yüksekliği 0.46). */
  const T1 = { z0: TERAS.kenar2, z1: TERAS.kenar1 }, T2 = { z0: -13.4, z1: TERAS.kenar2 };
  const tasDuvar = (z, x0, x1, taban, ust) => {
    const h = ust - taban;
    a.kutu((x0 + x1) / 2, taban + h / 2, z, x1 - x0, h + .02, .16, 0xc9bfa8);
    for (let x = x0 + .3; x < x1 - .1; x += .62 + a.rast() * .2) {
      // Birkaç sabit boy: aynı boydaki taşlar toplu çizilir
      const t = a.kutu(x, taban + h * (.3 + a.rast() * .4), z + .07, [.44, .52, .6][Math.floor(a.rast() * 3)], h * .42, .06, [0xb8ae96, 0xd4cab3, 0xaea48d][Math.floor(a.rast() * 3)]);
      t.castShadow = false;
    }
  };
  a.kutu(0, ZEMIN + TERAS.ust1 / 2, (T1.z0 + T1.z1) / 2, 26.8, TERAS.ust1, T1.z1 - T1.z0, 0xb3c180).castShadow = false;
  a.kutu(0, ZEMIN + TERAS.ust2 / 2, (T2.z0 + T2.z1) / 2, 26.8, TERAS.ust2, T2.z1 - T2.z0, 0xadbd7c).castShadow = false;
  a.yukseltiEkle(0, (T1.z0 + T1.z1) / 2, 13.4, (T1.z1 - T1.z0) / 2, Y1, { kutu: true });
  a.yukseltiEkle(0, (T2.z0 + T2.z1) / 2, 13.4, (T2.z1 - T2.z0) / 2, Y2, { kutu: true });
  tasDuvar(T1.z1 + .02, -13.4, 13.4, ZEMIN, Y1);
  tasDuvar(T2.z1 + .02, -13.4, 13.4, Y1, Y2);
  // Patikanın teras kenarından geçtiği yerde taş basamaklar
  for (const [x, z, taban] of [[-10.8, T1.z1, ZEMIN], [10.8, T2.z1, Y1]]) {
    for (let i = 0; i < 2; i++) {
      const b = a.kutu(x, taban + .08 + i * .12, z + .45 - i * .3, 1.3, .16, .34, 0xd8cfb8); b.castShadow = false;
    }
  }

  /* ——— ASMA SIRALARI ———
     Direkler, iki tel, telin üstünde yaprak kümeleri ve sarkan salkımlar.
     Her parça gerçek bir kutu engel; parçalar arasındaki boşluklardan
     geçilir. Yolun geçtiği parça hiç kurulmaz (sınıf küçükse yol kestirir). */
  const olgun = Math.max(0, Math.min(1, (dolu - .72) / .25));
  const salkimRengi = new THREE.Color(0xa9cf6a).lerp(new THREE.Color(0x6e4590), olgun).getHex();
  const salkimKoyu = new THREE.Color(salkimRengi).multiplyScalar(.85).getHex();
  function asmaParcasi(x0, x1, z, taban) {
    for (let x = x0; x <= x1; x += .5) if (a.yolaYakin(x, z, .6)) return false;
    const L = x1 - x0, orta = (x0 + x1) / 2;
    const direk = Math.max(2, Math.round(L / 1.6) + 1);
    for (let i = 0; i < direk; i++) {
      const x = x0 + L * i / (direk - 1);
      a.silindir(x, taban + .62, z, .05, .06, 1.24, 0x8e6344, a.dunya, 6);
    }
    for (const h of [.62, 1.08]) { const t = a.kutu(orta, taban + h, z, L, .02, .02, 0x6d6a60); t.castShadow = false; }
    for (let x = x0 + .25; x < x1 - .1; x += .42) {
      const y = a.top(x, taban + 1.1 + a.rast() * .1, z + (a.rast() - .5) * .12, .26, a.rast() > .5 ? 0x6ea24c : 0x7fb257, a.dunya, 1);
      y.scale.set(1.2, .8, 1);
      if (a.rast() > .45) {
        const s = a.top(x + .1, taban + .78, z + (a.rast() > .5 ? .16 : -.16), .1, a.rast() > .5 ? salkimRengi : salkimKoyu, a.dunya, 1);
        s.scale.set(.85, 1.35, .85);
      }
    }
    a.kutuEngel(orta, z, L + .14, .36, 0);
    return true;
  }
  function asmaSirasi(x0, x1, z, taban = ZEMIN, parca = 3.4, bosluk = 1.1) {
    for (let x = x0; x < x1 - .6; x += parca + bosluk) asmaParcasi(x, Math.min(x1, x + parca), z, taban);
  }
  asmaSirasi(-11.8, 9.0, 5.8);                  // ön bağ ile çardak önü arası
  asmaSirasi(3.6, 9.9, 2.1, ZEMIN, 3.2, 1.0);   // çardağın doğusu
  asmaSirasi(3.6, 9.9, -.6, ZEMIN, 3.2, 1.0);
  asmaSirasi(-9.6, -3.4, -1.7, ZEMIN, 3.0, 1.0); // çardağın batısı
  asmaSirasi(-10.6, 5.2, -9.5, Y2, 3.4, 1.0);   // üst teras
  asmaSirasi(-10.6, 5.2, -11.2, Y2, 3.4, 1.0);

  /* ——— TAŞ DUVAR (batı kenarı): üstünde yürünür ——— */
  {
    const x = -12.9, z0 = -2.3, z1 = 6.8, h = .42;
    a.kutu(x, ZEMIN + h / 2, (z0 + z1) / 2, .62, h, z1 - z0, 0xc4baa2);
    for (let z = z0 + .3; z < z1; z += .55 + a.rast() * .2) {
      const t = a.kutu(x + (a.rast() - .5) * .1, ZEMIN + h + .03, z, .66, .08, [.46, .54][Math.floor(a.rast() * 2)], [0xb4aa92, 0xd2c8b1, 0xbdb39b][Math.floor(a.rast() * 3)]);
      t.castShadow = false;
    }
    a.yukseltiEkle(x, (z0 + z1) / 2, .31, (z1 - z0) / 2, ZEMIN + h + .06, { kutu: true });
  }

  /* ——— KUYU ——— */
  {
    const kx = -6.8, kz = 1.2;
    const g = new THREE.Group(); g.position.set(kx, ZEMIN, kz); a.dunya.add(g);
    a.silindir(0, .35, 0, .78, .82, .7, 0xb3b0a2, g, 16);
    a.silindir(0, .71, 0, .8, .8, .05, 0xcfcbbd, g, 16);
    a.silindir(0, .72, 0, .6, .6, .04, 0x4f6a72, g, 16);
    for (const s of [-1, 1]) a.silindir(s * .7, 1.2, 0, .06, .07, 1.1, 0x8e6344, g, 6);
    a.kutu(0, 1.55, 0, 1.6, .08, .08, 0xa5794d, g);
    for (const s of [-1, 1]) { const c = a.kutu(0, 1.92, s * .34, 1.8, .06, .82, 0xb8573f, g); c.rotation.x = s * .72; }
    a.silindir(0, 1.18, 0, .006, .006, .7, 0x6f5132, g, 4);
    a.silindir(0, .85, 0, .12, .1, .16, 0x9aa4ab, g, 10);
    a.engelEkle(kx, kz, .86, 1);
  }

  /* ——— ÖN BAĞ: ceviz ağacı, kovanlar, saman, sandıklar, Kızıl'ın ini ——— */
  // Fıstık'ın ceviz ağacı: kalın gövde, geniş yuvarlak taç, bir kovuk. Köşede:
  // üstten bakınca tacı patikayı örtmesin.
  {
    const g = new THREE.Group(); g.position.set(-12.3, ZEMIN, 9.4); g.scale.setScalar(.9); a.dunya.add(g);
    a.silindir(0, .9, 0, .22, .34, 1.8, 0x7d5a3c, g, 8);
    a.silindir(0, 1.1, .27, .1, .1, .04, 0x3e2c20, g, 10).rotation.x = Math.PI / 2;
    for (const [x, y, z, r, c] of [[0, 2.5, 0, 1.25, 0x5f9a4f], [-.8, 2.2, .3, .8, 0x6ea85a], [.8, 2.3, -.2, .85, 0x68a257], [0, 3.2, 0, .8, 0x74ae5f]])
      a.top(x, y, z, r, c, g, 1);
    for (const [x, y, z] of [[.9, 1.9, .6], [-.7, 1.7, .8], [.3, 1.8, 1.1]]) a.top(x, y, z, .09, 0x9c7a4e, g, 1);
    /* Kamera yarıçapı tacın kendisi kadar (1.55): 1. durakta kamera tam bu
       ağacın arkasına düşüyordu ve omuz görünümünde ekranın yarısı yeşil
       bir taçtı. Artık araya taç girince kamera karaktere yaklaşır. */
    a.engelEkle(-12.3, 9.4, .34, 1.55);
  }
  // Arı kovanları: tahta bir sehpanın üstünde üç hasır kovan
  const kovan = new THREE.Group(); kovan.position.set(1.6, ZEMIN, 11.3); a.dunya.add(kovan);
  // Yalnız arılar oynuyor; kovanlar durağan kalsın ki toplu çizilsin
  const ariGrubu = new THREE.Group(); ariGrubu.position.copy(kovan.position); ariGrubu.userData.hareketli = true; a.dunya.add(ariGrubu);
  a.kutu(0, .28, 0, 2.6, .08, .8, 0x9c7a4e, kovan);
  for (const x of [-1.1, 1.1]) a.kutu(x, .13, 0, .1, .26, .7, 0x8e6344, kovan);
  const arilar = [];
  for (const x of [-.8, 0, .8]) {
    const k = a.top(x, .6, 0, .42, 0xe2b85e, kovan, 2); k.scale.set(.9, 1.05, .9);
    for (let i = 0; i < 4; i++) { const b = a.silindir(x, .42 + i * .13, 0, .39 - i * .06, .4 - i * .06, .035, 0xc28f35, kovan, 16); b.castShadow = false; }
    a.silindir(x, .37, .33, .07, .07, .03, 0x4a3420, kovan, 10).rotation.x = Math.PI / 2;
  }
  for (let i = 0; i < 7; i++) {
    const ari = new THREE.Group(); ariGrubu.add(ari);
    a.top(0, 0, 0, .06, 0xf2b92f, ari, 1).scale.set(1, .9, 1.3);
    a.kutu(0, 0, 0, .125, .02, .03, 0x2e241d, ari);
    for (const s of [-1, 1]) { const k = a.top(s * .05, .05, 0, .04, 0xe6f3f8, ari, 0); k.scale.set(1.2, .3, .8); k.userData.kanat = s; }
    arilar.push({ ari, faz: i * .9, r: .9 + (i % 3) * .35, h: .9 + (i % 4) * .18 });
  }
  a.kutuEngel(1.6, 11.3, 2.7, .9, 0);
  // Arı çiçekleri
  for (let i = 0; i < 26; i++) {
    const x = -1.6 + a.rast() * 6.4, z = 9.0 + a.rast() * 3.6;
    if (Math.abs(x - 1.6) < 1.6 && Math.abs(z - 11.3) < .7) continue;
    cicek(x, z, [0xf3a6c0, 0xfff2e0, 0xf2c14a, 0xc9a3e0][i % 4]);
  }
  // Saman yığını: iki katlı; tırmanılır
  {
    const x = 5.6, z = 10.9;
    const alt = a.top(x, ZEMIN + .02, z, 1.45, 0xe2c46e, a.dunya, 2); alt.scale.set(1, .32, 1);
    const ust = a.top(x + .1, ZEMIN + .42, z - .05, .9, 0xeacf7d, a.dunya, 2); ust.scale.set(1, .5, 1);
    for (let i = 0; i < 8; i++) {
      const ac = i / 8 * Math.PI * 2;
      const s = a.silindir(x + Math.cos(ac) * 1.35, ZEMIN + .08, z + Math.sin(ac) * 1.35, .012, .012, .3, 0xd9b75c, a.dunya, 3);
      s.rotation.set(Math.sin(ac) * .7, 0, -Math.cos(ac) * .7); s.castShadow = false;
    }
    a.yukseltiEkle(x, z, 1.45, 1.45, ZEMIN + .44, { yumusak: true });
    a.yukseltiEkle(x + .1, z - .05, .9, .9, ZEMIN + .86, { yumusak: true, taban: ZEMIN + .4 });
  }
  // Sandık yığını: basamak basamak üç sütun; en üste çıkılır
  for (const [x, kat] of [[-3.7, 1], [-3.0, 2], [-2.3, 3]]) {
    for (let k = 0; k < kat; k++) sandik(x, 11.3, ZEMIN + k * .42, a.dunya, (a.rast() - .5) * .08);
    a.yukseltiEkle(x, 11.3, .33, .33, ZEMIN + kat * .42, { kutu: true });
  }
  // Kızıl'ın ini: tümsek, önünde kapı deliği; tümseğin üstüne çıkılır
  {
    const x = 11.5, z = 11.5;
    const t1 = a.top(x, ZEMIN - .1, z, 1.8, 0xa8b46f, a.dunya, 2); t1.scale.set(1, .32, 1);
    const t2 = a.top(x + .15, ZEMIN + .3, z + .15, 1.1, 0x9eab66, a.dunya, 2); t2.scale.set(1, .45, 1);
    // Kapı: tümseğin bağa bakan yüzünde koyu, oval bir delik; çevresinde taşlar
    const kapi = a.top(x - .98, ZEMIN + .2, z - .98, .4, 0x33261d, a.dunya, 2);
    kapi.scale.set(1, .75, .45); kapi.rotation.y = Math.PI / 4;
    for (let i = 0; i < 5; i++) {
      const ac = Math.PI / 4 + (i - 2) * .38;
      a.top(x - 1.18 * Math.sin(ac) - .12, ZEMIN + .06, z - 1.18 * Math.cos(ac) - .12, .13, 0xb3ae9c, a.dunya, 0).scale.set(1.2, .6, 1);
    }
    a.yukseltiEkle(x, z, 1.7, 1.7, ZEMIN + .44, { yumusak: true });
    a.yukseltiEkle(x + .15, z + .15, 1.05, 1.05, ZEMIN + .8, { yumusak: true, taban: ZEMIN + .4 });
  }

  /* ——— ÜST TERAS: bağ evi ——— */
  {
    const x = 8.8, z = -10.4, w = 3.2, d = 2.4;
    const ev = new THREE.Group(); ev.position.set(x, Y2, z); a.dunya.add(ev);
    a.kutu(0, .85, 0, w, 1.7, d, 0xeadcc0, ev);
    a.kutu(0, .06, 0, w + .12, .12, d + .12, 0xb8ae96, ev);
    for (const s of [-1, 1]) { const c = a.kutu(0, 2.02, s * .66, w + .3, .1, 1.62, 0xb8573f, ev); c.rotation.x = s * .62; }
    const alin = new THREE.Shape(); alin.moveTo(-w / 2, 0); alin.lineTo(w / 2, 0); alin.lineTo(0, .82); alin.closePath();
    for (const zz of [-d / 2, d / 2]) a.cisim(new THREE.ShapeGeometry(alin), 0xe2d2b2, 0, 1.7, zz + (zz > 0 ? .005 : -.005), ev, { side: THREE.DoubleSide });
    a.kutu(-.6, .6, d / 2 + .02, .72, 1.2, .05, 0x8e6344, ev);                    // kapı
    a.kutu(.75, 1.0, d / 2 + .02, .6, .5, .05, 0x9fc1cf, ev);                     // pencere
    a.kutu(.75, 1.0, d / 2 + .04, .64, .05, .03, 0x8e6344, ev);
    a.kutu(1.0, 2.3, -.3, .3, .7, .3, 0xb3a58a, ev);                              // baca
    a.kutuEngel(x, z, w + .1, d + .1, 0);
    // Evin önünde hasat için boş sandıklar
    sandik(6.0, -9.0, Y2, a.dunya, .3); sandik(6.3, -8.4, Y2, a.dunya, -.2); sandik(6.1, -8.7, Y2 + .42, a.dunya, .1);
    a.kutuEngel(6.15, -8.7, 1.2, 1.3, 0, TERAS.ust2 + .85, false);
  }

  /* ——— Doğal süsler ——— */
  for (let i = 0; i < 10; i++) kaya(-12 + a.rast() * 24, 8.8 + a.rast() * 3.2, .18 + a.rast() * .25);
  for (let i = 0; i < 8; i++) cali(-12.4 + a.rast() * 2, -1.8 + a.rast() * 8, .3 + a.rast() * .25);
  for (let i = 0; i < 10; i++) cali(-12 + a.rast() * 24, -3.4 - a.rast() * 2.4, .22 + a.rast() * .22, Y1, 0x86ad62);
  for (let i = 0; i < 6; i++) kaya(-12 + a.rast() * 24, -12.4 + a.rast() * .8, .25 + a.rast() * .3, Y2);
  // Yumak'ın yaprak yuvası: kuru asma yapraklarından alçak bir yığın
  for (let i = 0; i < 9; i++) {
    const ac = i / 9 * Math.PI * 2;
    const y = a.top(6.6 + Math.cos(ac) * .32, ZEMIN + .08, .8 + Math.sin(ac) * .26, .2, [0xc9914a, 0xb77a3c, 0xd9a55a][i % 3], a.dunya, 1);
    y.scale.set(1.2, .35, .9); y.rotation.y = ac;
  }
  a.top(6.6, ZEMIN + .16, .8, .22, 0xa86f36, a.dunya, 1).scale.set(1, .5, 1);

  /* ═══ MERKEZ: ÇARDAK ═══
     Dört direk, kiriş kafes, üstü yaprak. Ortasında sarkan salkım. */
  const merkez = new THREE.Group(); merkez.position.set(0, ZEMIN, .2); a.dunya.add(merkez);
  /* Oynayanlar (salkım, Kızıl) ayrı grupta: çardağın durağan parçaları
     toplu çizime girsin, oynayanlar girmesin. */
  const canli = new THREE.Group(); canli.position.copy(merkez.position); canli.userData.hareketli = true; a.dunya.add(canli);
  const DX = 1.9, DZ = 1.5, H = 2.75;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    a.silindir(sx * DX, H / 2, sz * DZ, .09, .11, H, 0x8e6344, merkez, 8);
    a.silindir(sx * DX, .06, sz * DZ, .18, .2, .12, 0xb8ae96, merkez, 10);
    a.engelEkle(sx * DX, .2 + sz * DZ, .16, .2);
    // Direğe sarılan asma
    for (let i = 0; i < 5; i++) a.top(sx * DX + Math.cos(i * 1.9) * .12, .5 + i * .45, sz * DZ + Math.sin(i * 1.9) * .12, .13, 0x6ea24c, merkez, 1);
  }
  for (const sz of [-1, 1]) a.kutu(0, H, sz * DZ, DX * 2 + .5, .12, .14, 0xa5794d, merkez);
  for (const x of [-DX, -DX / 2, 0, DX / 2, DX]) a.kutu(x, H + .1, 0, .1, .08, DZ * 2 + .5, 0x9c7048, merkez);
  /* Yapraklar yalnız kenarlarda: ortası açık, ki üstten bakınca salkım ve
     ona uzanan Kızıl görünsün (masalın asıl resmi bu). */
  for (let i = 0; i < 16; i++) {
    const ix = i % 4, iz = Math.floor(i / 4);
    if (ix > 0 && ix < 3 && iz > 0 && iz < 3) continue;
    const x = -DX - .2 + ix * (DX * 2 + .4) / 3, z = -DZ - .1 + iz * (DZ * 2 + .2) / 3;
    const y = a.top(x + (a.rast() - .5) * .3, H + .22, z + (a.rast() - .5) * .3, .55, i % 3 ? 0x6ea24c : 0x7fb257, merkez, 1);
    y.scale.set(1.05, .42, 1);
  }
  // Ortadaki kirişlere sarılan ince asma dalları ve birkaç yaprak
  for (const [x, z] of [[-.9, -.5], [.9, .45], [-.3, .6], [.2, -.7]]) {
    const y = a.top(x, H + .16, z, .2, 0x7fb257, merkez, 1); y.scale.set(1.3, .35, 1);
  }
  // Kenarlardan sarkan yapraklar ve küçük salkımlar
  for (let i = 0; i < 10; i++) {
    const kenar = i % 2 ? 1 : -1, x = -DX + (i >> 1) * DX / 2;
    a.top(x, H - .2, kenar * (DZ + .1), .2, 0x7fb257, merkez, 1).scale.set(1, 1.3, .6);
    if (i % 3 === 0) a.top(x + .15, H - .45, kenar * (DZ + .12), .1, salkimRengi, merkez, 1).scale.set(.8, 1.4, .8);
  }

  /* Masalın salkımı: çardağın ortasından sarkıyor. Olgunlaştıkça morarır. */
  const SX = .35;
  const salkim = new THREE.Group(); salkim.position.set(SX, H - .05, 0); canli.add(salkim);
  const hasatBitti = dolu >= .97;
  if (!hasatBitti) {
    a.silindir(0, -.12, 0, .015, .015, .24, 0x6f5132, salkim, 4);
    const siralar = [[5, .26], [5, .19], [4, .13], [3, .09], [2, .06], [1, .03]];
    siralar.forEach(([n, r], k) => {
      for (let i = 0; i < n; i++) {
        const ac = i / n * Math.PI * 2 + k * .5;
        a.top(Math.cos(ac) * r * .8, -.3 - k * .1, Math.sin(ac) * r * .8, .075, (i + k) % 3 ? salkimRengi : salkimKoyu, salkim, 1);
      }
    });
    const yaprak = a.top(.12, -.06, .05, .18, 0x79ad52, salkim, 1); yaprak.scale.set(1.2, .25, 1); yaprak.rotation.z = .5;
  }

  /* 2. bölümden sonra: alıştırma taşları (çardağın önünde üç yassı taş). */
  if (dolu >= .25) for (const [x, z] of [[-1.3, 1.05], [-.4, 1.15], [.5, 1.05]]) {
    const t = a.silindir(x, .06, z, .3, .34, .12, 0xc9cabc, merkez, 12); t.scale.z = .8; t.castShadow = false;
  }
  /* 3. bölüm: sandıklar basamak basamak (üstlerine çıkılır). */
  const SANDIK = [[-1.05, 1, .52], [-.35, 2, .6], [SX, 3, .67]];
  let enUst = 0;
  for (const [x, kat, esik] of SANDIK) {
    if (dolu < esik) continue;
    for (let k = 0; k < kat; k++) sandik(x, 0, k * .42, merkez, (a.rast() - .5) * .1);
    a.yukseltiEkle(x, .2, .33, .33, ZEMIN + kat * .42, { kutu: true });
    enUst = Math.max(enUst, kat);
  }
  /* 4. bölüm: merdiven çardağın kirişine dayanıyor. */
  const merdivenVar = dolu >= .72;
  if (merdivenVar) {
    const m = new THREE.Group(); m.position.set(1.35, 0, -.35); m.rotation.z = .3; merkez.add(m);
    for (const s of [-1, 1]) a.kutu(0, 1.4, s * .22, .07, 2.85, .07, 0x9c6b3e, m);
    for (let i = 0; i < 8; i++) a.kutu(0, .25 + i * .34, 0, .05, .05, .44, 0xb5824f, m);
    a.engelEkle(1.1, -.15, .22, .3);
  }
  /* Masalın sonunda: salkımlar sepetlerde, çardağın önünde paylaşılıyor. */
  if (hasatBitti) for (const [x, z] of [[-1.3, 1.9], [-.45, 2.1], [.45, 2.1], [1.3, 1.9]]) {
    const s = new THREE.Group(); s.position.set(x, 0, z); merkez.add(s);
    a.silindir(0, .16, 0, .26, .2, .32, 0xd6a563, s, 12);
    a.silindir(0, .32, 0, .27, .27, .04, 0xc28c4c, s, 12);
    for (let i = 0; i < 6; i++) a.top(Math.cos(i) * .12, .38 + (i % 2) * .05, Math.sin(i) * .12, .08, i % 2 ? 0x6e4590 : 0x7b4f9d, s, 1);
  }

  /* Kızıl: bölüme göre salkımın altında zıplar, sandığa çıkar, merdivende
     uzanır; sonunda sepetlerin başında oturur. */
  const tilki = new THREE.Group(); canli.add(tilki);
  const kizil = tilkiModeli({ THREE, mal: a.mal }, tilki, { olcek: 1.25 });
  let kip = 'zipla';
  if (hasatBitti) { tilki.position.set(0, 0, 3.0 - .2 - .2); tilki.rotation.y = Math.PI; kip = 'otur'; }
  else if (merdivenVar) { tilki.position.set(1.0, 1.55, -.3); tilki.rotation.y = -Math.PI / 2; kip = 'uzan'; }
  else if (enUst) { const [x, kat] = SANDIK[enUst - 1]; tilki.position.set(x, kat * .42, 0); tilki.rotation.y = Math.PI / 2; kip = 'bak'; }
  else { tilki.position.set(SX, 0, .65); tilki.rotation.y = Math.PI; kip = dolu >= .25 ? 'alistir' : 'zipla'; }
  if (kizil.userData.kafa && kip !== 'otur') kizil.userData.kafa.rotation.x = -.55;

  /* ——— İtilebilir nesneler ——— */
  // Fıçılar doğu kenarında, sepetler ön bağda, kabaklar ceviz ağacının dibinde
  [[12.1, 2.4], [12.4, .9], [11.9, -.7]]
    .forEach(([x, z]) => a.itilebilir({ x, z, r: .36, tip: 'fici', renk: 0x9c6b43 }));
  [[-6.2, 12.0], [3.3, 9.6], [8.2, 9.3]]
    .forEach(([x, z]) => a.itilebilir({ x, z, r: .3, tip: 'fici', renk: 0xd0a263, ikinci: 0x7b4f9d }));
  [[-5.6, 9.8, .38], [-10.4, 9.6, .34], [-7.4, 12.2, .3], [8.9, 12.0, .36]]
    .forEach(([x, z, r]) => a.itilebilir({ x, z, r, tip: 'kabak', renk: 0xe08a3c, ikinci: 0x7a8a45 }));
  // Bağın sincapları: yaklaşınca kaçar, boşta ot arar
  [[-7.6, .0, 0x9a7a62, 0xe9dcc8], [3.6, -10.4, 0xb8733c, 0xf3e0c2], [-1.2, 12.6, 0x8d8580, 0xe6e0d8]]
    .forEach(([x, z, renk, karin]) => a.itilebilir({ x, z, r: .3, tip: 'hayvan', yon: a.rast() * 6,
      model: grup => sincapModeli({ THREE, mal: a.mal }, grup, { renk, karin, olcek: .8 }) }));

  return {
    tik(t) {
      if (!hasatBitti) { salkim.rotation.z = Math.sin(t * .9) * .07; salkim.rotation.x = Math.sin(t * .7 + 1) * .04; }
      const { kafa, kuyruk } = kizil.userData;
      if (kuyruk) kuyruk.rotation.y = Math.sin(t * (kip === 'otur' ? 3 : 1.6)) * .35;
      if (kip === 'zipla' || kip === 'alistir') {
        // Hop… dur… hop: salkıma uzanıp yetişemiyor
        const d = (t * (kip === 'zipla' ? .9 : 1.3)) % 2;
        tilki.position.y = d < .7 ? Math.sin(d / .7 * Math.PI) * (kip === 'zipla' ? .75 : .35) : 0;
      } else if (kip === 'uzan' && kafa) kafa.rotation.x = -.7 + Math.sin(t * 1.4) * .1;
      else if (kip === 'otur') tilki.position.y = Math.abs(Math.sin(t * 2.2)) * .05;
      for (const { ari, faz, r, h } of arilar) {
        const ac = t * 1.3 + faz;
        ari.position.set(Math.cos(ac) * r, h + Math.sin(t * 3 + faz) * .12, Math.sin(ac) * r * .6);
        ari.rotation.y = -ac;
        ari.children.forEach(c => { if (c.userData.kanat) c.rotation.z = c.userData.kanat * Math.sin(t * 40) * .6; });
      }
    }
  };
}

export default { bag };

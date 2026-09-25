/* İki Keçi mekânı — mekân adı → kurucu işlev (bkz. mekanlar.js).

   ═══════════════════ GEÇİT — İki Keçi ═══════════════════
   Bir dağ geçidi. Kuzeyden güneye Çağıl Dere akar; ortada, derenin en dar
   yerinde kunduz Usta'nın kütük köprüsü. Batı yakası Ak'ın papatyalı
   yamacı, doğu yakası Kara'nın yoncalı yamacı. Köprünün güneyinde Usta'nın
   göleti ve barajı, dört köşede basamak basamak tırmanılan kayalıklar.

   MERKEZ BÜYÜR: köprü başta iki kütükten ibaret, dar. Sınıf ilerledikçe
   önce korkuluk bağlanıyor, sonra yanlarına yeni kütükler ve üstüne
   tahtalar ekleniyor; masalın sonunda iki keçi yan yana geçecek kadar
   genişliyor. Ak ile Kara köprünün üstünde masalın neresindeysek orada:
   iki uçta → köprüde → burun buruna → karşı uçlarda → yan yana.

   AÇIK DÜNYA: dere geçilmez (üstünden zıplanmaz da); karşıya ya köprüden
   ya barajın üstünden geçilir. Kayalıklara seki seki tırmanılır, eski taş
   duvarın ve barajın üstünde yüründüğü gibi. Ot balyaları, taş toplar ve
   kütükler itilir; geçidin keçileri yaklaşınca kaçar.

   Döngüsel içe aktarma olmasın diye mekanlar.js'ten hiçbir şey almıyoruz;
   süs yardımcıları burada. */

import {keciModeli} from '../modeller/keci.js';
import {DURAK_KALIPLARI} from '../../masallar/keci.js';

function gecit(a) {
  const { THREE, ZEMIN } = a;
  const dolu = a.dolu || 0;
  a.ceyrek([0xb4cf88, 0xa2c283, 0x9cbd7c, 0xb0cc86]);

  /* ——— Dere ———
     Köprünün çevresinde dümdüz (köprü tam dik geçsin), uzaklaştıkça hafifçe
     kıvrılır. Gölet köprünün güneyinde, baraj göletin güney ucunda. */
  const koprude = z => { const t = Math.min(1, Math.max(0, (Math.abs(z - .2) - 1.4) / 3)); return t * t * (3 - 2 * t); };
  const dereX = z => koprude(z) * .55 * Math.sin(z * .42 + .6);
  const GOL = { x: .2, z: 2.95, rx: 1.95, rz: 1.3 };
  const BARAJ = { x: .2, z: 4.55, yari: 2.55 };
  const SU = .72;                                        // suyun yarı genişliği

  /* Katman: 1 kıyı, 2 su, 3 akıntı. dunya.js'in bölge boyası (ceyrek)
     ZEMIN+.012'de ve derinlik öncelikli (polygonOffset -1/-2) çiziliyor;
     su ondan daha öncelikli olmazsa bölge boyası dereyi ve göleti
     tümüyle örtüyordu (köprü görünmez bir şeyin üstünden geçiyordu).
     Güvercin'in deresi de aynı yolu kullanıyor. */
  const katman = k => ({ polygonOffset: true, polygonOffsetFactor: -1 - k, polygonOffsetUnits: -2 - 2 * k });
  const KAT_Y = [0, ZEMIN + .026, ZEMIN + .034, ZEMIN + .04];
  function serit(z0, z1, genislik, renk, k) {
    const n = Math.max(8, Math.round(Math.abs(z1 - z0) * 4)), sol = [], sag = [];
    for (let i = 0; i <= n; i++) {
      const z = z0 + (z1 - z0) * i / n, x = dereX(z);
      sol.push(new THREE.Vector2(x - genislik, -z)); sag.unshift(new THREE.Vector2(x + genislik, -z));
    }
    const m = a.cisim(new THREE.ShapeGeometry(new THREE.Shape([...sol, ...sag])), renk, 0, KAT_Y[k], 0, a.dunya, katman(k));
    m.rotation.x = -Math.PI / 2; m.castShadow = false; return m;
  }
  function elips(x, z, rx, rz, renk, k) {
    const s = new THREE.Shape(); s.absellipse(x, -z, rx, rz, 0, Math.PI * 2);
    const m = a.cisim(new THREE.ShapeGeometry(s, 40), renk, 0, KAT_Y[k], 0, a.dunya, katman(k));
    m.rotation.x = -Math.PI / 2; m.castShadow = false; return m;
  }
  for (const [z0, z1] of [[-15, GOL.z - .6], [BARAJ.z - .2, 15]]) {
    serit(z0, z1, 1.2, 0xd6cda6, 1);                     // çakıllı kıyı
    serit(z0, z1, SU, 0x6fb2c4, 2);                      // su
    serit(z0, z1, .3, 0x93cfd9, 3);                      // parlayan akıntı
  }
  elips(GOL.x, GOL.z, GOL.rx + .45, GOL.rz + .4, 0xd6cda6, 1);
  elips(GOL.x, GOL.z, GOL.rx, GOL.rz, 0x62a8bd, 2);
  elips(GOL.x - .3, GOL.z - .2, GOL.rx * .55, GOL.rz * .5, 0x86c3d0, 3);

  /* Suyun çarpışması: yüksekliği sınırsız daireler — dere yürüyerek de
     zıplayarak da geçilmez. Köprünün altı ve baraj boş kalır. */
  const satir = Math.max(0, Math.min(4, Math.round((dolu - .72) / .28 * 4)));   // eklenen kütük sırası
  const yari = .42 + satir * .14;                                                // köprü döşemesinin yarı eni
  for (let z = -15; z <= 15; z += .45) {
    if (Math.abs(z - .2) < yari + SU + .02) continue;                  // köprü
    if (z > GOL.z - 1.2 && z < BARAJ.z + .9) continue;                 // gölet ve baraj ayrı
    a.engelEkle(dereX(z), z, SU, 0);
  }
  for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) {
    const x = GOL.x + i * .62, z = GOL.z + j * .5;
    if (((x - GOL.x) / (GOL.rx - .55)) ** 2 + ((z - GOL.z) / (GOL.rz - .5)) ** 2 > 1.05) continue;
    a.engelEkle(x, z, .72, 0);
  }
  // Gölet ile köprü arasındaki kısa dere parçası
  for (let z = .2 + yari + SU + .02; z < GOL.z - .9; z += .4) a.engelEkle(dereX(z), z, SU, 0);

  // Derenin içinde çakıl taşları ve kıyıda sazlar
  for (let i = 0; i < 26; i++) {
    const z = -14 + a.rast() * 28;
    if (Math.abs(z - .2) < 2 || (z > GOL.z - 1.6 && z < BARAJ.z + .8)) continue;
    const t = a.top(dereX(z) + (a.rast() - .5) * 1.1, ZEMIN + .05, z, [.12, .18][i % 2], [0xb9bdb2, 0xa3a99c, 0xc9c3b0][i % 3], a.dunya, 0);
    t.scale.y = .45; t.castShadow = false;
  }
  for (let i = 0; i < 40; i++) {
    const z = -13 + a.rast() * 26, yon = a.rast() > .5 ? 1 : -1;
    if (Math.abs(z - .2) < 1.6) continue;
    const x = dereX(z) + yon * (1 + a.rast() * .3);
    if (a.yolaYakin(x, z, .25)) continue;
    const s = a.silindir(x, ZEMIN + .22, z, .015, .03, .44, a.rast() > .5 ? 0x7d9a52 : 0x6b8a47, a.dunya, 4);
    s.rotation.z = (a.rast() - .5) * .4; s.castShadow = false;
  }

  /* ——— Süs yardımcıları ——— */
  function cam(x, z, o = 1) {
    if (a.yolaYakin(x, z, 1.1 * o)) return null;
    const g = new THREE.Group(); g.position.set(x, ZEMIN - .1, z); g.scale.setScalar(o); a.dunya.add(g);
    a.engelEkle(x, z, .62 * o, 1.2 * o);
    a.silindir(0, .5, 0, .11, .17, 1, 0x8a6446, g, 6);
    [[1.05, 1.1, .95], [.84, 1.6, .85], [.6, 2.08, .75], [.36, 2.5, .6]].forEach(([r, y, h], i) =>
      a.silindir(0, y, 0, 0, r, h, [0x3f7f5a, 0x4b8c63, 0x3f7f5a, 0x55966a][i], g, 8));
    return g;
  }
  function kaya(x, z, r, renk = 0xb0b3a6, cikilir = false) {
    if (a.yolaYakin(x, z, r + .4)) return null;
    const k = a.top(x, ZEMIN + r * .4, z, r, renk, a.dunya, 1);
    k.scale.set(1.2, .55, .95); k.rotation.y = a.rast() * 3;
    // Yassı kayalar bir basamak: üstüne çıkılır. Diğerleri dolaşılır.
    if (cikilir) a.yukseltiEkle(x, z, r * 1.08, r * .86, ZEMIN + r * .52, { aci: k.rotation.y, yumusak: true });
    else if (r > .3) a.engelEkle(x, z, r * .9, 0, r * .5);
    return k;
  }
  function cali(x, z, r, renk = 0x6f9e63) {
    if (a.yolaYakin(x, z, r + .3)) return null;
    const c = a.top(x, ZEMIN + r * .5, z, r, renk, a.dunya, 1); c.scale.y = .62; return c;
  }
  function papatya(x, z) {
    a.silindir(x, ZEMIN + .08, z, .012, .015, .16, 0x6f9c56, a.dunya, 4);
    const t = a.silindir(x, ZEMIN + .17, z, .075, .075, .02, 0xffffff, a.dunya, 8); t.castShadow = false;
    a.top(x, ZEMIN + .185, z, .03, 0xf2c14a, a.dunya, 0).castShadow = false;
  }
  function yonca(x, z) {
    for (let i = 0; i < 3; i++) {
      const ac = i / 3 * Math.PI * 2 + x;
      const y = a.top(x + Math.cos(ac) * .07, ZEMIN + .06, z + Math.sin(ac) * .07, .07, 0x5fa05a, a.dunya, 0);
      y.scale.y = .3; y.castShadow = false;
    }
  }

  /* ——— Kayalıklar: keçilerin sevdiği seki seki tırmanılan taşlar ———
     Kuzey köşelerde beş, güney köşelerde üç kat. Her kat bir öncekinden
     ~0.46 yüksek: adım yüksekliğinin altında, tırmanılır. */
  function kayalik(cx, cz, yx, yz, kat, r0, renkler) {
    for (let i = 0; i < kat; i++) {
      const x = cx + yx * i * .38, z = cz + yz * i * .3, r = r0 - i * (r0 / (kat + 1.2));
      const t = a.silindir(x, ZEMIN + .12 + i * .46, z, r, r + .3, .48, renkler[i % renkler.length], a.dunya, 7);
      t.scale.z = .74; t.rotation.y = i * .5 + cx;
      a.yukseltiEkle(x, z, r * .93, r * .74 * .93, ZEMIN + .36 + i * .46, { aci: t.rotation.y });
      // Sekilerin üstünde birkaç ot tutamı
      for (let k = 0; k < 3; k++) {
        const ac = a.rast() * 6.28, u = r * .5 * a.rast();
        const o = a.silindir(x + Math.cos(ac) * u, ZEMIN + .44 + i * .46, z + Math.sin(ac) * u * .7, .02, .03, .2, 0x7fa65c, a.dunya, 4);
        o.castShadow = false;
      }
    }
  }
  const KAYA_RENK = [0xc4bea9, 0xb8b29c, 0xaea892, 0xa49e88, 0x9a947e];
  kayalik(-11.3, -8.5, -1, -1, 5, 3.3, KAYA_RENK);          // Ak'ın kayalığı
  kayalik(11.3, -8.5, 1, -1, 5, 3.3, KAYA_RENK);            // Kara'nın kayalığı
  kayalik(-11.4, 8.6, -1, 1, 3, 2.3, KAYA_RENK.slice(1));
  kayalik(11.4, 8.6, 1, 1, 3, 2.2, KAYA_RENK.slice(1));
  // Yassı kaya basamakları: tek sıçrayışta üstüne çıkılır
  [[-7.6, 8.1, .8], [8.8, -1.4, .7], [-2.6, -8.9, .75], [3.4, -8.6, .8], [-10.8, 4.9, .7], [10.9, 4.9, .7], [-5.6, -8.1, .6]]
    .forEach(([x, z, r]) => kaya(x, z, r, 0xbab5a2, true));
  for (let i = 0; i < 22; i++) {
    const x = (a.rast() - .5) * 24, z = (a.rast() - .5) * 18;
    if (Math.abs(x - dereX(z)) < 1.8) continue;
    kaya(x, z, [.2, .28, .36, .44][Math.floor(a.rast() * 4)], [0xb0b3a6, 0xa6a99b, 0xbcb8a8][i % 3]);
  }

  // Çam ağaçları yamaçlarda; çalılar arada
  [[-6.4, -8.8, 1], [-3.9, -7.2, .8], [4.9, -8.9, .95], [7.4, -7.6, .8], [12, -2.8, .9], [-12.2, 1.4, .85],
   [-3.2, 8.7, .9], [2.4, 9.2, .8], [12.3, 2, .8], [-12.4, -3.6, .75], [-5.4, 9.4, .7], [9.2, 9.6, .7]]
    .forEach(([x, z, o]) => cam(x, z, o));
  for (let i = 0; i < 16; i++) {
    const x = (a.rast() - .5) * 23, z = (a.rast() - .5) * 17;
    if (Math.abs(x - dereX(z)) < 1.9 || Math.hypot(x - GOL.x, z - GOL.z) < 3) continue;
    cali(x, z, [.28, .38, .48][Math.floor(a.rast() * 3)], x < 0 ? 0x7aa765 : 0x6b9a5e);
  }
  // Batı yakasında papatyalar, doğu yakasında yonca öbekleri
  for (let i = 0; i < 90; i++) {
    const bati = i % 2 === 0;
    const x = bati ? -1.9 - a.rast() * 10.4 : 1.9 + a.rast() * 10.4, z = (a.rast() - .5) * 18;
    if (Math.abs(x - dereX(z)) < 1.6 || a.yolaYakin(x, z, .15)) continue;
    bati ? papatya(x, z) : yonca(x, z);
  }

  /* ——— Eski taş duvar: güneydoğu yamacında, ortasında bir aralık.
     Alçak: üstüne çıkılır, üstünde yürünür (keçiler bayılır). ——— */
  for (const [x0, x1] of [[3, 5.7], [7.1, 9.8]]) {
    for (let x = x0; x < x1 - .1; x += .42) for (let kat = 0; kat < 2; kat++) {
      const t = a.kutu(x + .21 + (kat ? .18 : 0), ZEMIN + .13 + kat * .25, 8.95 + (a.rast() - .5) * .06,
        .4, .24, .44, [0xb9b4a2, 0xa9a491, 0xc4bfae][(Math.round(x * 3) + kat) % 3]);
      t.rotation.y = (a.rast() - .5) * .12;
    }
    a.yukseltiEkle((x0 + x1) / 2, 8.95, (x1 - x0) / 2, .24, ZEMIN + .5, { kutu: true });
  }

  /* ——— Usta'nın atölyesi: barajın doğusunda küçük bir kulübe.
     Gerçek kutu çarpışması: etrafından dolaşılır. ——— */
  {
    const x = 3.9, z = 6.7;
    const g = new THREE.Group(); g.position.set(x, ZEMIN, z); g.rotation.y = -.25; a.dunya.add(g);
    a.kutu(0, .5, 0, 1.6, 1, 1.1, 0xa8784a, g);
    for (let i = 0; i < 5; i++) a.kutu(0, .12 + i * .2, .56, 1.62, .04, .02, 0x8e6238, g);
    a.kutu(0, .42, .56, .42, .7, .04, 0x6b4a2c, g);                          // kapı
    for (const yon of [-1, 1]) { const e = a.kutu(yon * .45, 1.2, 0, 1.02, .08, 1.3, 0x7d5a3a, g); e.rotation.z = -yon * .5; }
    a.kutuEngel(x, z, 1.62, 1.12, -.25);
    // Yanında kütük yığını
    for (let i = 0; i < 5; i++) {
      const k = a.silindir(1.2, .12 + (i > 2 ? .22 : 0), -.35 + (i % 3) * .26 + (i > 2 ? .13 : 0), .12, .12, .9, 0x9c7446, g, 8);
      k.rotation.x = Math.PI / 2;
    }
    a.engelEkle(x + 1.1, z - .3, .5, .4, .45);
  }

  /* ——— Göletin içinde Usta'nın yuvası ——— */
  {
    const x = GOL.x - 1.2, z = GOL.z + .15;
    const y = a.top(x, ZEMIN, z, .8, 0x7b5a3a, a.dunya, 1); y.scale.set(1, .62, .9);
    for (let i = 0; i < 14; i++) {
      const d = a.silindir(x + (a.rast() - .5) * 1.2, ZEMIN + .2 + a.rast() * .25, z + (a.rast() - .5) * 1, .03, .03, .9, [0x6b4a2c, 0x8e6a45, 0xb58a5a][i % 3], a.dunya, 5);
      d.rotation.set(a.rast() * 3, a.rast() * 3, a.rast() * 3);
    }
    a.engelEkle(x, z, .8, .8);
  }

  /* ——— Baraj: göletin güney ucunda, dallardan örülü. Üstünde yürünür. ——— */
  {
    const { x: bx, z: bz, yari: by } = BARAJ;
    const govde = a.top(bx, ZEMIN - .05, bz, 1, 0x7b5a3a, a.dunya, 1); govde.scale.set(by + .15, .42, .55);
    for (let i = 0; i < 46; i++) {
      const t = i / 45, x = bx - by + t * by * 2 + (a.rast() - .5) * .2;
      const d = a.silindir(x, ZEMIN + .18 + a.rast() * .14, bz + (a.rast() - .5) * .7, [.035, .045][i % 2], .045, [.75, .95, 1.15][i % 3],
        [0x6b4a2c, 0x8e6a45, 0xb58a5a, 0x5a3e26][i % 4], a.dunya, 5);
      d.rotation.set(Math.PI / 2 + (a.rast() - .5) * .5, (a.rast() - .5) * 1.4, (a.rast() - .5) * .6);
    }
    a.yukseltiEkle(bx, bz, by, .5, ZEMIN + .3, { kutu: true });
    // Barajın üstünden taşan ince su
    const kopuk = a.kutu(bx, ZEMIN + .03, bz + .7, by * 1.1, .02, .3, 0xe6f4f5); kopuk.castShadow = false;
  }

  /* ═══ MERKEZ: KÜTÜK KÖPRÜ ═══ */
  const merkez = new THREE.Group(); merkez.position.set(0, ZEMIN, .2); a.dunya.add(merkez);
  merkez.userData.hareketli = true;                     // Ak, Kara ve Cıkcık tik() ile oynuyor
  const BOY = 5.8, UST = .36;
  // Taş ayaklar
  for (const yon of [-1, 1]) {
    for (let i = 0; i < 3; i++) a.kutu(yon * 2.55, .07 + i * .1, (i - 1) * .34, .6, .14, .36, [0xb9b4a2, 0xa9a491, 0xc4bfae][i], merkez);
  }
  // Temel iki kütük
  for (const z of [-.2, .2]) {
    const k = a.silindir(0, .19, z, .2, .2, BOY, 0xa4784c, merkez, 12); k.rotation.z = Math.PI / 2;
    for (const yon of [-1, 1]) {
      const u = a.silindir(yon * BOY / 2, .19, z, .185, .185, .02, 0xe2c08d, merkez, 12); u.rotation.z = Math.PI / 2;
    }
  }
  // Genişleyen kütük sıraları (4. bölüm)
  for (let s = 0; s < satir; s++) {
    const yon = s % 2 ? 1 : -1, z = yon * (.4 + Math.floor(s / 2) * .28 + .02);
    const k = a.silindir(0, .16, z, .15, .15, BOY - .3, 0xb18656, merkez, 10); k.rotation.z = Math.PI / 2;
  }
  // Tahta döşeme: köprü genişledikçe gelir
  if (dolu >= .9) {
    for (let x = -BOY / 2 + .2; x <= BOY / 2 - .2; x += .34)
      a.kutu(x, UST - .01, 0, .3, .05, yari * 2, [0xd7a96c, 0xc99c60][Math.round(x * 3) & 1], merkez);
  }
  // Döşemenin üstü yürünür
  a.yukseltiEkle(0, .2, BOY / 2, yari, ZEMIN + UST, { kutu: true });
  // Korkuluk: önce kuzey, sonra güney yanı
  const korkuluk = [dolu >= .5 ? -1 : 0, dolu >= .65 ? 1 : 0].filter(Boolean);
  for (const yon of korkuluk) {
    const z = yon * (yari + .02);
    for (let x = -2.6; x <= 2.61; x += 1.3) a.silindir(x, UST + .32, z, .045, .055, .66, 0x8e6a45, merkez, 6);
    a.kutu(0, UST + .62, z, 5.3, .06, .06, 0xa98257, merkez);
    a.kutu(0, UST + .36, z, 5.3, .045, .045, 0xa98257, merkez);
    a.kutuEngel(0, .2 + z, 5.4, .1, 0, 1.05, false);
  }
  // Köprü başlarında Cıkcık'ın ektiği çiçekler (3. bölümün sonundan itibaren)
  if (dolu >= .7) {
    for (let i = 0; i < 26; i++) {
      const yon = i % 2 ? 1 : -1, x = yon * (2.9 + a.rast() * 1.1), z = .2 + (a.rast() - .5) * 3.2;
      if (a.yolaYakin(x, z, .08)) continue;
      yon < 0 ? papatya(x, z) : yonca(x, z);
    }
  }

  /* Ak ile Kara köprüde: masalın neresindeysek orada.
       1. bölüm  iki uçta          2. bölüm  köprüde, birbirine doğru
       3. bölüm  burun buruna      4. bölüm  yer değiştirmiş, karşı uçlarda
       son       yan yana */
  const bolum = dolu >= 1 ? 4 : Math.min(3, Math.floor(dolu * 4 + 1e-6));
  const yerler = [
    { ak: [-2.45, 0, 1], kara: [2.45, 0, -1] },
    { ak: [-1.05, 0, 1], kara: [1.05, 0, -1] },
    { ak: [-.5, 0, 1], kara: [.5, 0, -1] },
    { ak: [2.45, 0, 1], kara: [-2.45, 0, -1] },
    { ak: [0, -.34, 0], kara: [0, .34, 0] }
  ][bolum];
  const keciler = [];
  for (const [kim, renk, karin, ic] of [['ak', 0xf6f2ea, 0xece6d9, 0xeab3a8], ['kara', 0x3e3b43, 0x4a4650, 0xa3717c]]) {
    const [x, dz, yon] = yerler[kim];
    const g = new THREE.Group(); g.position.set(x, UST, dz); g.rotation.y = yon > 0 ? Math.PI / 2 : yon < 0 ? -Math.PI / 2 : 0;
    merkez.add(g);
    const m = keciModeli({ THREE, mal: a.mal }, g, { renk, karin, ic, olcek: 1.35 });
    if (kim === 'kara') {                                                 // kırmızı tasma ve çan
      const t = a.silindir(0, .58, .2, .075, .085, .04, 0xd65a4a, m, 12); t.rotation.x = .55;
      a.top(0, .5, .26, .03, 0xe8b84a, m, 1);
    } else {
      const t = a.silindir(0, .58, .2, .075, .085, .04, 0x7fb3c8, m, 12); t.rotation.x = .55;
    }
    keciler.push({ g, m, faz: kim === 'ak' ? 0 : 1.7 });
  }

  /* Cıkcık: 3. bölümden sonra köprünün üstünde daireler çizer. */
  let cikcik = null;
  if (dolu >= .45) {
    cikcik = new THREE.Group(); merkez.add(cikcik);
    const govde = a.top(0, 0, 0, .1, 0xa5774b, cikcik, 1); govde.scale.set(.85, .8, 1.2);
    a.top(0, .02, -.02, .07, 0xece6da, cikcik, 1).scale.set(.9, .8, 1);
    a.top(0, .07, .1, .065, 0x9aa0a6, cikcik, 1);
    a.top(0, .045, .13, .04, 0x2e2b2a, cikcik, 0);
    const gaga = a.silindir(0, .06, .18, 0, .02, .05, 0x4a4540, cikcik, 5); gaga.rotation.x = Math.PI / 2;
    for (const yon of [-1, 1]) { const k = a.top(yon * .09, .03, 0, .07, 0x8a5d36, cikcik, 1); k.scale.set(.3, .15, 1); k.userData.kanat = yon; }
  }

  /* Usta barajın batı ucunda oturur, köprüye bakar: yassı kürek kuyruk, turuncu dişler. */
  const usta = new THREE.Group(); usta.userData.hareketli = true;
  usta.position.set(BARAJ.x - BARAJ.yari + .45, ZEMIN + .3, BARAJ.z - .05); usta.rotation.y = 2.73; a.dunya.add(usta);
  {
    a.top(0, .26, 0, .24, 0x8a5d36, usta, 1).scale.set(1, 1.1, 1.15);
    a.top(0, .24, .1, .15, 0xc49a6a, usta, 1).scale.set(.9, 1.1, .8);
    a.top(0, .52, .1, .16, 0x8a5d36, usta, 1);
    a.top(0, .48, .24, .08, 0xb88a5a, usta, 1).scale.set(1.1, .8, 1);
    a.top(0, .5, .3, .03, 0x2a1d16, usta, 0);
    a.kutu(0, .42, .29, .05, .05, .02, 0xf2a23a, usta);
    for (const yon of [-1, 1]) {
      a.top(yon * .11, .64, .06, .04, 0x6e4a2c, usta, 0);
      a.top(yon * .07, .56, .22, .022, 0x1c1714, usta, 0);
    }
    const kuyruk = a.top(0, .06, -.36, .22, 0x5b4638, usta, 1); kuyruk.scale.set(.75, .16, 1.2);
    a.engelEkle(usta.position.x, usta.position.z, .32, .4, .7);
  }

  /* ——— İki yakanın patikaları ———
     Motorun yolu durakları sırayla birleştirir; bu masalda ardışık iki
     durak karşı yakalarda olduğu için o yol köprünün üstünde bir yıldız
     gibi kümeleniyordu. Onun yerine her yakanın KENDİ patikası çiziliyor:
     Ak'ınki batıdan, Kara'nınki doğudan köprüye iner; dördüncü bölümün
     patikaları köprüden dışarı çıkar. Koşu yine köprünün üstünden geçer.
     Hangi yerde durak olduğunu yolaYakin(x, z, 0) söyler (yalnız durak). */
  {
    const { YAKLASMA, UZAKLASMA, ayna } = DURAK_KALIPLARI;
    const dolu_ = p => a.yolaYakin(p.x, p.z, 0);
    const TOPRAK = 0xd3bc8c, TAS = 0xc2bca8;
    const diskGeo = new THREE.CylinderGeometry(.27, .27, .02, 12);
    const tasGeo = new THREE.CylinderGeometry(.13, .15, .03, 7);
    function patika(noktalar) {
      if (noktalar.length < 2) return;
      const egri = new THREE.CatmullRomCurve3(noktalar.map(p => new THREE.Vector3(p.x, 0, p.z)), false, 'catmullrom', .5);
      const uzun = egri.getLength(), n = Math.ceil(uzun / .2);
      for (let i = 0; i <= n; i++) {
        const p = egri.getPointAt(i / n);
        const d = a.cisim(diskGeo, TOPRAK, p.x, ZEMIN + .018, p.z); d.castShadow = false;
        if (i % 5 === 2) {
          const t = a.cisim(tasGeo, TAS, p.x + (a.rast() - .5) * .18, ZEMIN + .03, p.z + (a.rast() - .5) * .18);
          t.castShadow = false; t.rotation.y = a.rast() * 3;
        }
      }
    }
    const inis = { bati: { x: -3.05, z: .2 }, dogu: { x: 3.05, z: .2 } };
    for (const [taraf, ay] of [['bati', p => p], ['dogu', ayna]]) {
      const yak = YAKLASMA.map(ay).filter(dolu_), uz = UZAKLASMA.map(ay).filter(dolu_);
      if (yak.length) patika([...yak, inis[taraf]]);
      if (uz.length) patika([inis[taraf], ...uz]);
    }
    // Baraja inen patika: doğu köprü başından göletin kıyısı boyunca
    patika([inis.dogu, { x: 3.35, z: 1.5 }, { x: 3.1, z: 3.4 }, { x: BARAJ.x + BARAJ.yari, z: BARAJ.z }]);
    // Motorun yol tüpü çizilmiyor (paketteki yolCiz: false); patikalar burada.
  }

  /* ——— İtilebilir nesneler ——— */
  // Ot balyaları otlaklarda, taş toplar kayalıkların dibinde, kütükler atölyenin yanında
  [[-7.2, 7.4, .4], [-6.4, -7.6, 1.2], [7.6, 7.3, .2], [9.4, -5.8, 1.6]]
    .forEach(([x, z, yon]) => a.itilebilir({ x, z, r: .46, tip: 'balya', renk: 0xe3c46e, yon }));
  [[-4.4, -6.2, .3], [-8.8, -8.2, .36], [5.9, -6.1, .32], [9.2, 7.6, .34], [-9.4, 6.9, .3]]
    .forEach(([x, z, r]) => a.itilebilir({ x, z, r, tip: 'top', renk: 0xb3b3a8, ikinci: 0x8f8f86 }));
  [[2.7, 6.2, .3], [5.6, 5.6, 1.4]]
    .forEach(([x, z, yon]) => a.itilebilir({ x, z, r: .34, tip: 'balya', renk: 0x9c7446, ikinci: 0xe2c08d, yon }));
  // Geçidin keçileri: karakter yaklaşınca kaçar, boşta otlar
  [[-9.2, 4.3, 0xb07a4a, 0xe6cfae], [8.9, -2.4, 0xd9cbb3, 0xf2e8d8], [5.3, -7.4, 0x8a7f78, 0xcfc7bd]]
    .forEach(([x, z, renk, karin]) => a.itilebilir({ x, z, r: .38, tip: 'hayvan', yon: a.rast() * 6,
      model: grup => keciModeli({ THREE, mal: a.mal }, grup, { renk, karin, olcek: .95 }) }));

  return {
    tik(t) {
      for (const { m, faz } of keciler) {
        const { kafa, kuyruk } = m.userData;
        if (kafa) kafa.rotation.x = Math.sin(t * 1.3 + faz) * .08 + (bolum === 2 ? .12 : 0);
        if (kuyruk) kuyruk.rotation.y = Math.sin(t * 5 + faz) * .35;
      }
      if (cikcik) {
        const ac = t * .9;
        cikcik.position.set(Math.cos(ac) * 1.6, 1.55 + Math.sin(t * 2.3) * .12, Math.sin(ac) * .9);
        cikcik.rotation.y = -ac;
        cikcik.children.forEach(c => { if (c.userData.kanat) c.rotation.z = c.userData.kanat * Math.sin(t * 22) * .6; });
      }
      usta.position.y = ZEMIN + .3 + Math.abs(Math.sin(t * 1.1)) * .02;
    }
  };
}

export default { gecit };

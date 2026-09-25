/* Şehir Faresi ile Tarla Faresi mekânı — mekân adı → kurucu işlev (bkz. mekanlar.js).

   ═══════════════════ KASABA ═══════════════════
   Tek haritada iki dünya. Sol yarı TARLA: buğday sıraları, Başak'ın
   tümsek yuvası, kırmızı ahır ve yanında tırmanılan saman yığını, çitler,
   kabak tarlası. Sağ yarı ŞEHİR: arnavut kaldırımı, evler (gerçek kutu
   çarpışması — köşesinden dönülür, arkasına geçilir), fırın ve basamağı,
   sokak lambaları, meydan çeşmesi, uyuyan kedi Mestan, meydanda insan
   görünce kaçışan güvercinler.

   Ortada iki dünyayı bağlayan KAVŞAK: bir kolu tarlayı, öbür kolu şehri
   gösteren yol tabelası. Sınıf ilerledikçe (a.dolu) kavşak şenlenir:
   önce bir mektup kutusu, sonra iki dünyanın renginde bayraklar, bir bank,
   sonunda tabelanın tepesine konan Kurşun ve kutunun üstünde uçuşan bir zarf.

   Bu dosya mekanlar.js'i İÇE AKTARMAZ: mekan/liste.js bu dosyayı üst düzey
   await ile yüklerken mekanlar.js hâlâ liste.js'i bekliyor; buradan
   mekanlar.js'e bağlanmak iki modülü birbirini bekler hâle getirip bütün
   masal defterini kilitler. Ağaç, çit, kaya ve çalı bu yüzden aşağıda,
   kurucunun içinde, aynı araç kutusuyla (a.*) kuruluyor. Zemin yüksekliği
   a.ZEMIN'den okunur. */

import {kediModeli, guvercinModeli} from '../modeller/sehirfaresi.js';

/* ——— Ortak süsler (mekanlar.js'tekilerle aynı dil, yerel kopya) ——— */
function agacKur(a, x, z) {
  const g = new a.THREE.Group(); g.position.set(x, .45, z); a.dunya.add(g);
  a.engelEkle(x, z, .85, 1.3);
  a.silindir(0, .8, 0, .16, .26, 1.6, 0x9b7550, g, 7);
  a.top(0, 2.1, 0, 1.05, 0x5f9e5f, g); a.top(-.5, 1.95, .25, .68, 0x7cb56c, g); a.top(.42, 2.35, -.15, .66, 0x5f9e5f, g);
  return g;
}
/* Çit: eksen 'z' ise +z yönünde uzanır; kapi birimlik aralık bırakır. Alçak: üstünden zıplanır. */
function citKur(a, x, z, boy, eksen = 'x', kapi = 3) {
  const renk = 0xf1e0ba;
  const g = new a.THREE.Group(); g.position.set(x, .45, z);
  if (eksen === 'z') g.rotation.y = -Math.PI / 2; a.dunya.add(g);
  const k1 = boy / 2 - kapi / 2, k2 = boy / 2 + kapi / 2;
  for (let i = 0; i <= boy; i++) if (!kapi || i <= k1 || i >= k2) a.kutu(i, .42, 0, .1, .84, .11, renk, g);
  for (const [b, s] of (kapi ? [[0, k1], [k2, boy]] : [[0, boy]])) {
    const u = s - b + .1, m = (b + s) / 2;
    a.kutu(m, .36, 0, u, .1, .1, 0xdfc79c, g);
    a.kutu(m, .66, 0, u, .1, .1, renk, g);
    const wx = eksen === 'z' ? x : x + m, wz = eksen === 'z' ? z + m : z;
    a.kutuEngel(wx, wz, eksen === 'z' ? .14 : u, eksen === 'z' ? u : .14, 0, .84, false);
  }
  if (kapi) for (const t of [k1, k2]) a.kutu(t, .55, 0, .16, 1.1, .16, 0xdfc79c, g);
}
function kayaKur(a, x, z, r, renk) {
  if (a.yolaYakin(x, z, r + .45)) return null;
  const k = a.top(x, a.ZEMIN + r * .45, z, r, renk, a.dunya, 0);
  k.scale.set(1.25, .62, .9); k.rotation.y = a.rast() * 3;
  if (r > .32) a.engelEkle(x, z, r * .9, 0, r * 1.05);
  return k;
}
function calilikKur(a, x, z, r, renk) {
  if (a.yolaYakin(x, z, r + .3)) return null;
  const c = a.top(x, a.ZEMIN + r * .5, z, r, renk, a.dunya, 1); c.scale.y = .62; return c;
}

/* ——— Yerleşim verisi (test ve denetim için dışa açık) ———
   Evler: { x, z, en, der, boy, renk, cati, aci } — en/der evin kendi ekseninde; kapı yerel +z
   yüzünde, aci ile döner (0 güneye, -π/2 batıya, π kuzeye bakar). Bütün katı yapılar
   yolun DIŞINDA, harita kenarında: sınıf küçükken duraklar seyrekleşir ve yol
   içeriden kısa keser; iç taraf yürünen meydan, tarla ve kavşak olarak boş kalır. */
export const KASABA_EVLER = [
  { ad: 'firin', x: 5.2, z: -9.5, en: 2.8, der: 1.8, boy: 1.9, renk: 0xf0dcc0, cati: 0xb9573f, aci: 0 },
  { ad: 'ev-mavi', x: 8.6, z: -9.3, en: 2.0, der: 1.6, boy: 2.1, renk: 0xcfe0e6, cati: 0x9c4a38, aci: 0 },
  { ad: 'ev-yesil', x: 12.1, z: -4.6, en: 2.0, der: 1.6, boy: 1.8, renk: 0xd7e6c9, cati: 0xa55442, aci: -Math.PI / 2 },
  { ad: 'ev-krem', x: 12.2, z: -.6, en: 2.4, der: 1.8, boy: 2.4, renk: 0xf3e1b8, cati: 0xc9573f, aci: -Math.PI / 2 },
  { ad: 'ev-pembe', x: 12.1, z: 2.9, en: 2.0, der: 1.6, boy: 2.0, renk: 0xf1cfc6, cati: 0x8e4a3a, aci: -Math.PI / 2 },
  { ad: 'ev-sari', x: 6.6, z: 10.1, en: 2.2, der: 1.6, boy: 2.0, renk: 0xf5e2a6, cati: 0xa55442, aci: Math.PI },
  { ad: 'ev-lila', x: 3.2, z: 10.1, en: 2.0, der: 1.6, boy: 2.2, renk: 0xe2d6ea, cati: 0x9c4a38, aci: Math.PI }
];
export const KASABA_AHIR = { x: -5.4, z: 3.0, en: 3.2, der: 2.2 };
export const KASABA_CESME = { x: 11.6, z: 7.6, r: 1.0 };
export const KASABA_YUVA = { x: -11.4, z: -0.4, rx: 1.3, rz: 1.15 };
export const KASABA_SAMAN = { x: -2.5, z: 3.7 };
export const KASABA_MESTAN = { x: 13.9, z: -.6 };
export const KASABA_AGACLAR = [[-6.6, -3.6], [-8.4, .9]];
export const KASABA_ARABA = { x: 1.8, z: -9.3, aci: .15 };
export const KASABA_LAMBALAR = [[3.0, -8.4], [10.6, -8.2], [11.4, -2.6], [11.2, 1.2], [11.0, 4.6], [5.0, 9.4], [9.2, 9.0], [1.2, 9.4]];
/* İtilebilirler: [x, z, r, tip, yön] */
export const KASABA_ITILEBILIR = [
  [-8.2, -5.2, .5, 'balya', .3], [-4.9, -5.0, .5, 'balya', 1.4], [-11.0, -7.8, .5, 'balya', .6],
  [-3.3, 6.0, .44, 'kabak'], [-1.2, 5.6, .36, 'kabak'], [-7.4, 5.3, .46, 'kabak'], [-8.4, 3.9, .38, 'kabak'],
  [6.4, -3.0, .34, 'fici'], [2.4, -3.6, .34, 'fici'], [10.4, 8.8, .34, 'fici'],
  [8.2, 2.6, .36, 'top'], [3.0, 5.6, .36, 'top'], [3.4, 1.6, .36, 'top'],
  [6.9, 2.0, .28, 'hayvan', .4], [7.6, 3.4, .28, 'hayvan', 2.2], [7.4, -2.0, .28, 'hayvan', 4.1]
];

function kasaba(a) {
  const T = a.THREE, Z = a.ZEMIN;
  a.ceyrek([0xdfc576, 0xd6cfbd, 0xcbbfac, 0xbccb80]);
  const hareketliler = [];

  /* ═══════════ TARLA ═══════════ */
  // Buğday sıraları (sol üst): yolun, durakların, yuvanın üstüne bitmez
  for (let i = 0; i < 22; i++) for (let j = 0; j < 14; j++) {
    const x = -12 + i * .5 + (a.rast() - .5) * .2, z = -9 + j * .56 + (a.rast() - .5) * .2;
    if (a.yolaYakin(x, z, .5) || Math.hypot(x - KASABA_YUVA.x, z - KASABA_YUVA.z) < 2.6 || Math.hypot(x + 9.6, z + .1) < 1.2) continue;
    if (KASABA_AGACLAR.some(([ax, az]) => Math.hypot(x - ax, z - az) < 1.1) || KASABA_ITILEBILIR.some(([ix, iz, r]) => Math.hypot(x - ix, z - iz) < r + .3)) continue;
    const s = a.silindir(x, Z + .36, z, .022, .034, .72, 0xd6b25a, a.dunya, 4);
    s.rotation.z = (a.rast() - .5) * .2;
    a.top(x, Z + .78, z, .085, i % 3 ? 0xeed48a : 0xe5c270, a.dunya, 0).scale.set(.62, 1.7, .62);
  }
  // Çitler: tarlanın üst ve alt kenarı kapılı; sol kenar yuvanın iki yanında
  citKur(a, -12.4, -9.4, 11); citKur(a, -12.4, 9.4, 11);
  citKur(a, -12.4, -9.4, 7, 'z', 0);
  citKur(a, -12.4, 2.4, 7, 'z', 0);
  KASABA_AGACLAR.forEach(([x, z]) => agacKur(a, x, z));
  for (let i = 0; i < 6; i++) kayaKur(a, -12 + a.rast() * 10, 5.6 + a.rast() * 3.4, .2 + a.rast() * .2, 0xb9b39c);
  for (let i = 0; i < 7; i++) calilikKur(a, -11.6 + a.rast() * 9, 4.6 + a.rast() * 4.2, .28 + a.rast() * .22, 0x86a860);

  /* Başak'ın yuvası: çimenli bir tümsek, doğuya bakan yuvarlak kapı.
     Tümseğin üstüne yürüyerek çıkılır. */
  {
    const Y = KASABA_YUVA;
    const tumsek = a.top(Y.x, Z, Y.z, 1, 0x9fbd6c, a.dunya, 2); tumsek.scale.set(Y.rx, .75, Y.rz);
    a.yukseltiEkle(Y.x, Y.z, Y.rx * .96, Y.rz * .96, Z + .7, { yumusak: true });
    const kapi = a.silindir(Y.x + Y.rx * .82, Z + .3, Y.z, .3, .3, .1, 0x4a3a28, a.dunya, 18);
    kapi.rotation.z = Math.PI / 2; kapi.rotation.y = 0;
    const cerceve = a.cisim(new T.TorusGeometry(.32, .05, 6, 18, Math.PI), 0x9c7a52, Y.x + Y.rx * .86, Z + .3, Y.z);
    cerceve.rotation.y = Math.PI / 2;
    for (let i = 0; i < 5; i++) {                                    // kapının iki yanında gelincikler
      const yz = Y.z + (i - 2) * .32 + (i === 2 ? .9 : 0), yx = Y.x + Y.rx * .9 + (i % 2) * .12;
      if (Math.abs(yz - Y.z) < .4) continue;
      a.silindir(yx, Z + .14, yz, .012, .014, .28, 0x5f9a52, a.dunya, 4);
      a.top(yx, Z + .3, yz, .07, 0xe2503f, a.dunya, 0).scale.y = .6;
    }
    a.silindir(Y.x + .3, Z + .78, Y.z - .3, .03, .03, .5, 0x9c7a52, a.dunya, 5);   // minik baca
    a.engelEkle(Y.x - .2, Y.z, .7, 0, .45);                          // tümseğin kalın yeri
  }

  /* Ahır: kırmızı, beyaz çerçeveli; çarpışması gerçek kutu. */
  {
    const H = KASABA_AHIR;
    const g = new T.Group(); g.position.set(H.x, Z, H.z); a.dunya.add(g);
    a.kutu(0, 1.05, 0, H.en, 2.1, H.der, 0xb84a3a, g);
    const s = new T.Shape(); s.moveTo(-H.der / 2 - .2, 0); s.lineTo(H.der / 2 + .2, 0); s.lineTo(0, 1.25); s.closePath();
    const cati = new T.ExtrudeGeometry(s, { depth: H.en + .3, bevelEnabled: false });
    cati.translate(0, 0, -(H.en + .3) / 2); cati.rotateY(Math.PI / 2);
    a.cisim(cati, 0x6f3a2e, 0, 2.1, 0, g);
    for (const x of [-H.en / 2, H.en / 2]) a.kutu(x, 1.05, H.der / 2 + .01, .12, 2.1, .06, 0xf6efe0, g);
    a.kutu(0, 2.1, H.der / 2 + .02, H.en, .12, .06, 0xf6efe0, g);
    a.kutu(0, .78, H.der / 2 + .03, 1.3, 1.56, .05, 0x9c3a2e, g);              // kapı
    for (const yon of [-1, 1]) { const c = a.kutu(0, .78, H.der / 2 + .06, .1, 1.9, .04, 0xf6efe0, g); c.rotation.z = yon * .7; }
    a.kutu(0, 2.55, H.der / 2 + .1, .6, .55, .06, 0x4a2a22, g);               // samanlık kapağı
    a.kutu(0, 2.42, H.der / 2 + .12, .5, .22, .06, 0xe6c46e, g);             // içinden saman görünüyor
    a.kutuEngel(H.x, H.z, H.en + .05, H.der + .05);
  }
  /* Saman yığını: üç basamak, her biri bir öncekinden ~.36 yüksek;
     yürüyerek tırmanılır, tepeden kavşak görünür. */
  {
    const S = KASABA_SAMAN;
    [[1.9, 1.7, .36], [1.35, 1.2, .72], [.9, .8, 1.08]].forEach(([en, der, ust], i) => {
      const b = a.kutu(S.x + i * .12, Z + ust - .18, S.z - i * .1, en, .36, der, [0xe3c46e, 0xebcf7e, 0xf1d98f][i]);
      b.rotation.y = i * .08;
      a.yukseltiEkle(S.x + i * .12, S.z - i * .1, en / 2, der / 2, Z + ust, { aci: i * .08, kutu: true });
    });
  }

  /* ═══════════ ŞEHİR ═══════════ */
  // Arnavut kaldırımı: sağ yarıda küçük yassı taşlar (otomatik tek çizime toplanır)
  for (let i = 0; i < 360; i++) {
    const x = 1.8 + a.rast() * 11.4, z = -8.4 + a.rast() * 17.6;
    if (KASABA_EVLER.some(e => { const yan = Math.abs(Math.sin(e.aci || 0)) > .5, w = yan ? e.der : e.en, d = yan ? e.en : e.der;
      return Math.abs(x - e.x) < w / 2 + .15 && Math.abs(z - e.z) < d / 2 + .15; })) continue;
    if (Math.hypot(x - KASABA_CESME.x, z - KASABA_CESME.z) < 1.15 || Math.hypot(x, z - .2) < 2.8) continue;
    const t = a.silindir(x, Z + .018, z, i % 2 ? .17 : .13, i % 2 ? .19 : .15, .03, [0xb9ae9c, 0xc6bba8, 0xa9a08f][i % 3], a.dunya, 6);
    t.castShadow = false;
  }
  const pencereGeo = new T.BoxGeometry(.4, .42, .05);
  /* Ev: gövde, beşik çatı, pencereler (akşam ışığı), kapı, baca, çiçeklik. */
  function evKur(e) {
    const g = new T.Group(); g.position.set(e.x, Z, e.z); g.rotation.y = e.aci || 0; a.dunya.add(g);
    a.kutu(0, e.boy / 2, 0, e.en, e.boy, e.der, e.renk, g);
    a.kutu(0, .12, 0, e.en + .08, .24, e.der + .08, 0xa9a08f, g);             // taş temel
    const s = new T.Shape(); s.moveTo(-e.der / 2 - .18, 0); s.lineTo(e.der / 2 + .18, 0); s.lineTo(0, .95); s.closePath();
    const cati = new T.ExtrudeGeometry(s, { depth: e.en + .26, bevelEnabled: false });
    cati.translate(0, 0, -(e.en + .26) / 2); cati.rotateY(Math.PI / 2);
    a.cisim(cati, e.cati, 0, e.boy, 0, g);
    a.kutu(e.en * .28, e.boy + .7, -e.der * .12, .26, .7, .26, 0x8e5a44, g);    // baca
    const on = e.der / 2 + .02;
    const kapiX = e.ad === 'firin' ? -e.en * .28 : 0;
    a.kutu(kapiX, .55, on, .5, 1.1, .05, 0x7a4e34, g);                          // kapı
    a.top(kapiX + .15, .55, on + .04, .035, 0xefc54f, g, 0);
    const pencereler = e.boy > 2 ? [[-e.en * .3, 1.55], [e.en * .3, 1.55]] : [[e.en * .28, 1.35]];
    if (e.ad !== 'firin' && e.boy <= 2) pencereler.push([-e.en * .3, 1.35]);
    for (const [px, py] of pencereler) {
      if (Math.abs(px - kapiX) < .45) continue;
      a.cisim(pencereGeo, 0xffe39a, px, py, on, g, { emissive: 0xffc860, emissiveIntensity: .35 });
      a.kutu(px, py - .25, on + .05, .52, .08, .12, 0xf6efe0, g);          // pervaz
      for (let k = 0; k < 3; k++) a.top(px - .14 + k * .14, py - .19, on + .08, .06, [0xe2503f, 0xf0a0b8, 0xe2503f][k], g, 0);
    }
    // Yan pencereler
    for (const yan of [-1, 1]) a.cisim(pencereGeo, 0xffe39a, yan * (e.en / 2 + .02), e.boy * .62, 0, g,
      { emissive: 0xffc860, emissiveIntensity: .35 }).rotation.y = Math.PI / 2;
    a.kutuEngel(e.x, e.z, e.en + .04, e.der + .04, e.aci || 0);
    return g;
  }
  const evler = KASABA_EVLER.map(evKur);
  /* Fırın: tenteli, tabelasında simit, bacası tüter; önünde bir basamak. */
  const firin = KASABA_EVLER[0], firinG = evler[0];
  {
    const on = firin.der / 2;
    for (let i = 0; i < 6; i++) {                                               // çizgili tente
      const t = a.kutu(-firin.en / 2 + .22 + i * .45, 1.42, on + .32, .45, .06, .66, i % 2 ? 0xf6efe0 : 0xd9714f, firinG);
      t.rotation.x = .38;
    }
    const simit = a.cisim(new T.TorusGeometry(.26, .09, 8, 18), 0xdd9a52, firin.en * .3, 1.05, on + .12, firinG);
    simit.castShadow = true;
    a.yukseltiEkle(firin.x, firin.z + on + .45, firin.en / 2, .42, Z + .2, { kutu: true });
    a.kutu(0, .1, on + .45, firin.en, .2, .84, 0xc6bba8, firinG);               // basamak
  }
  const duman = new T.Group(); duman.userData.hareketli = true;
  duman.position.set(firin.x + firin.en * .28, Z + firin.boy + 1.2, firin.z - firin.der * .12); a.dunya.add(duman);
  for (let i = 0; i < 4; i++) {
    const d = a.top(i * .1, i * .36, -i * .06, .14 + i * .05, 0xeef2f0, duman, 1);
    d.castShadow = false; d.material = a.mal(0xeef2f0, { transparent: true, opacity: .8 - i * .15 });
    d.userData.y0 = d.position.y;
  }
  hareketliler.push(t => duman.children.forEach((d, i) => { d.position.y = d.userData.y0 + ((t * .35 + i * .25) % 1) * .5; }));

  /* Sokak lambaları: sıcak ışıklı fener. */
  function lamba(x, z) {
    if (a.yolaYakin(x, z, .55)) return;
    const g = new T.Group(); g.position.set(x, Z, z); a.dunya.add(g);
    a.silindir(0, 1.05, 0, .045, .065, 2.1, 0x3f4a52, g, 8);
    a.silindir(0, .08, 0, .14, .16, .16, 0x3f4a52, g, 8);
    a.cisim(new T.BoxGeometry(.24, .3, .24), 0xffe7a0, 0, 2.2, 0, g, { emissive: 0xffd06a, emissiveIntensity: .9 });
    a.silindir(0, 2.42, 0, .02, .2, .14, 0x3f4a52, g, 4);
    a.engelEkle(x, z, .1, .15);
  }
  KASABA_LAMBALAR.forEach(([x, z]) => lamba(x, z));

  /* Meydan çeşmesi: taş havuz, ortada sütun, fışkıran sular. */
  {
    const C = KASABA_CESME;
    const g = new T.Group(); g.position.set(C.x, Z, C.z); a.dunya.add(g);
    a.silindir(0, .22, 0, C.r, C.r + .06, .44, 0xbcc5cc, g, 24);
    a.silindir(0, .43, 0, C.r - .1, C.r - .1, .02, 0x6bbfc8, g, 24);
    a.silindir(0, .9, 0, .12, .16, 1.0, 0xbcc5cc, g, 10);
    a.silindir(0, 1.42, 0, .42, .3, .14, 0xcfd6dc, g, 16);
    a.silindir(0, 1.5, 0, .36, .36, .02, 0x6bbfc8, g, 16);
    const sular = new T.Group(); sular.userData.hareketli = true; g.add(sular);
    for (let i = 0; i < 6; i++) {
      const ac = i / 6 * Math.PI * 2;
      const d = a.top(Math.cos(ac) * .38, 1.5, Math.sin(ac) * .38, .05, 0x8ed3dc, sular, 1);
      d.castShadow = false; d.userData.ac = ac;
    }
    hareketliler.push(t => sular.children.forEach((d, i) => {
      const k = (t * .9 + i / 6) % 1;
      const r = .38 + k * .5;
      d.position.set(Math.cos(d.userData.ac) * r, 1.5 + Math.sin(k * Math.PI) * .45 - k * .9, Math.sin(d.userData.ac) * r);
    }));
    a.engelEkle(C.x, C.z, C.r + .02, C.r + .1, .46);                           // kenarına zıplanır
  }

  /* Mestan: ev-krem'in arka bahçesinde, paspasının üstünde kıvrılıp uyuyor.
     Evin etrafından dolaşan onu bulur. Kimseyi kovalamaz; nefes alıp verir,
     kuyruğunun ucu arada bir kıpırdar. */
  {
    const { x, z } = KASABA_MESTAN;
    const g = new T.Group(); g.position.set(x, Z, z); g.rotation.y = -Math.PI / 2 - .4; g.userData.hareketli = true; a.dunya.add(g);
    const paspas = a.kutu(0, .015, 0, 1.3, .03, 1.7, 0xc9463f, g); paspas.castShadow = false;
    const kedi = kediModeli(a, g, { olcek: .95 });
    a.engelEkle(x, z, .62, .7, .55);
    hareketliler.push(t => {
      const n = 1 + Math.sin(t * 1.6) * .025;
      kedi.userData.nefes.scale.set(n, n, 1);
      kedi.userData.kuyrukUcu.rotation.y = Math.sin(t * .7) > .8 ? Math.sin(t * 9) * .4 : 0;
    });
  }

  /* Sebze arabası: şehre giden yolda park etmiş. */
  {
    const R = KASABA_ARABA;
    const g = new T.Group(); g.position.set(R.x, Z, R.z); g.rotation.y = R.aci; a.dunya.add(g);
    a.kutu(0, .62, 0, 2.0, .16, 1.1, 0xa5794d, g);
    for (const x of [-1, 1]) a.kutu(x * .98, .82, 0, .06, .36, 1.1, 0x8e6a44, g);
    for (const z of [-1, 1]) a.kutu(0, .82, z * .53, 2.0, .36, .06, 0x8e6a44, g);
    for (const [x, z] of [[-.6, -.6], [-.6, .6], [.6, -.6], [.6, .6]]) {
      const t = a.silindir(x, .32, z, .32, .32, .08, 0x6f4e34, g, 14); t.rotation.x = Math.PI / 2;
    }
    for (let i = 0; i < 6; i++) a.top(-.6 + (i % 3) * .55, .88, -.22 + Math.floor(i / 3) * .44, .2, i % 2 ? 0x7cae63 : 0xe08a3c, g, 1);
    a.kutu(1.45, .6, 0, .9, .06, .08, 0x8e6a44, g);
    a.kutuEngel(R.x, R.z, 2.1, 1.2, R.aci, 1.0);
  }

  /* ═══════════ KAVŞAK (merkez) ═══════════ */
  const merkez = new T.Group(); merkez.position.set(0, Z, .2); a.dunya.add(merkez);
  merkez.userData.hareketli = true;                        // zarf ve bayraklar tik() ile oynuyor
  {
    const yari = (renk, bas) => {
      const m = a.cisim(new T.CylinderGeometry(2.5, 2.6, .12, 28, 1, false, bas, Math.PI), renk, 0, .06, 0, merkez);
      m.castShadow = false; return m;
    };
    yari(0xd9c28a, Math.PI);                              // batı yarısı: toprak
    yari(0xc9c0b0, 0);                                    // doğu yarısı: taş
    a.yukseltiEkle(0, .2, 2.5, 2.5, Z + .12);
  }
  // Tabela direği ve iki kol
  a.silindir(0, 1.4, 0, .1, .13, 2.8, 0xa5794d, merkez, 8);
  a.silindir(0, 2.86, 0, .2, .02, .2, 0x8e6a44, merkez, 8);
  function kol(yon, renk, y, egim) {
    const s = new T.Shape();
    s.moveTo(0, -.2); s.lineTo(1.25, -.2); s.lineTo(1.55, 0); s.lineTo(1.25, .2); s.lineTo(0, .2); s.closePath();
    const geo = new T.ExtrudeGeometry(s, { depth: .07, bevelEnabled: false }); geo.translate(0, 0, -.035);
    const m = a.cisim(geo, renk, 0, y, 0, merkez);
    m.rotation.y = yon > 0 ? 0 : Math.PI; m.rotation.z = egim;
    return m;
  }
  kol(-1, 0xe0b054, 2.3, .03);                            // tarlaya
  kol(1, 0xc9573f, 1.8, -.03);                            // şehre
  // Kol uçlarında iki dünyanın küçük simgeleri
  a.top(-1.2, 2.62, 0, .12, 0xefd98f, merkez, 0).scale.set(.6, 1.6, .6);
  const minikEv = a.kutu(1.25, 2.12, 0, .26, .22, .1, 0xf3dfc0, merkez); void minikEv;
  a.engelEkle(0, .2, .2, .35);
  const d = a.dolu;
  /* Mektup kutusu: sınıfın dörtte biri geçince gelir. */
  let zarf = null;
  if (d >= .2) {
    const g = new T.Group(); g.position.set(1.5, 0, .9); merkez.add(g);
    a.silindir(0, .5, 0, .05, .06, 1.0, 0x6f4e34, g, 6);
    a.kutu(0, 1.12, 0, .5, .36, .34, 0xc9463f, g);
    a.silindir(0, 1.3, 0, .17, .17, .5, 0xc9463f, g, 12).rotation.z = Math.PI / 2;
    a.kutu(0, 1.14, .175, .24, .04, .02, 0x3a2a22, g);
    const bayrak = a.kutu(.29, 1.28 + (d >= .5 ? .14 : 0), .05, .04, .26, .12, 0xefc54f, g);
    bayrak.rotation.z = d >= .5 ? 0 : Math.PI / 2;
    a.engelEkle(1.5, 1.1, .24, .3);
    if (d >= .85) {
      zarf = new T.Group(); zarf.position.set(1.5, 1.9, .9); merkez.add(zarf);
      a.kutu(0, 0, 0, .34, .22, .02, 0xfbf4e3, zarf);
      a.top(0, -.01, .02, .03, 0xd9404f, zarf, 0);
    }
  }
  /* Bayraklar: iki direk arasında, iki dünyanın renkleri sırayla. */
  const bayrakSayisi = Math.round(d * 18);
  const bayraklar = [];
  if (bayrakSayisi) {
    for (const x of [-2.2, 2.2]) { a.silindir(x, 1.2, -1.4, .04, .05, 2.4, 0xa5794d, merkez, 6); a.engelEkle(x, -1.2, .08, .1); }
    const uc1 = new T.Vector3(-2.2, 2.3, -1.4), uc2 = new T.Vector3(2.2, 2.3, -1.4), orta = new T.Vector3(0, 2.55, -.1);
    const ip = new T.QuadraticBezierCurve3(uc1, orta, uc2);
    a.cisim(new T.TubeGeometry(ip, 24, .012, 4, false), 0xf6efe0, 0, 0, 0, merkez).castShadow = false;
    const ucgen = new T.ConeGeometry(.12, .24, 3);
    for (let i = 0; i < bayrakSayisi; i++) {
      const p = ip.getPoint((i + .5) / 18);
      const b = a.cisim(ucgen, i % 2 ? 0xc9573f : 0xe0b054, p.x, p.y - .14, p.z, merkez);
      b.rotation.x = Math.PI; b.scale.z = .25; b.userData.x0 = b.rotation.z;
      bayraklar.push(b);
    }
  }
  /* Bank: sınıfın yarısı geçince. Oturağına çıkılır. */
  if (d >= .5) {
    const g = new T.Group(); g.position.set(-1.6, 0, 1.3); g.rotation.y = .5; merkez.add(g);
    a.kutu(0, .42, 0, 1.2, .08, .4, 0xa5794d, g);
    a.kutu(0, .72, -.18, 1.2, .3, .06, 0xa5794d, g);
    for (const x of [-.5, .5]) a.kutu(x, .2, 0, .08, .4, .36, 0x6f4e34, g);
    a.yukseltiEkle(-1.6, 1.5, .62, .22, Z + .46, { aci: .5, kutu: true });
  }
  /* Kurşun: son çeyrekte tabelanın tepesine konar. */
  let kursun = null;
  if (d >= .75) {
    const g = new T.Group(); g.position.set(0, 2.94, 0); g.rotation.y = .6; merkez.add(g);
    kursun = guvercinModeli(a, g, { olcek: 1.3 });
  }

  /* ——— İtilebilir nesneler ———
     Tarlada saman balyaları ve kabaklar, şehirde fıçılar ve toplar,
     meydanda insan görünce kaçışan güvercinler. */
  const guvercinler = [];
  if (a.itilebilir) {
    const renk = { balya: 0xe3c46e, kabak: 0xe08a3c, fici: 0x9c6b43 };
    const topRenk = [0xd9714f, 0x6fa8c4, 0xe0b054];
    let t = 0;
    for (const [x, z, r, tip, yon = 0] of KASABA_ITILEBILIR) {
      if (tip === 'hayvan') a.itilebilir({ x, z, r, tip, yon, model: grup => {
        guvercinler.push(guvercinModeli(a, grup, { renk: [0xa2adba, 0x9aa0a8, 0xb3b8bf][guvercinler.length % 3] }));
      } });
      else if (tip === 'top') a.itilebilir({ x, z, r, tip, renk: topRenk[t++ % 3], ikinci: 0xf6f1e2 });
      else a.itilebilir({ x, z, r, tip, renk: renk[tip], yon });
    }
  }

  return {
    tik: t => {
      hareketliler.forEach(f => f(t));
      bayraklar.forEach((b, i) => { b.rotation.z = Math.sin(t * 2.4 + i * .7) * .18; });
      if (zarf) { zarf.position.y = 1.9 + Math.sin(t * 1.8) * .12; zarf.rotation.y = t * .8; }
      if (kursun) kursun.userData.bas.rotation.x = Math.max(0, Math.sin(t * 2.2)) * .35;
      guvercinler.forEach((p, i) => { p.userData.bas.rotation.x = Math.max(0, Math.sin(t * 5 + i * 2)) * .45; });
    }
  };
}

export default { kasaba };

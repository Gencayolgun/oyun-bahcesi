/* Masal mekânları.

   Ortak iskelet (ışık, kamera, yol halkası, duraklar, piyon) dunya.js'te.
   Burada her masalın KENDİ yeri kuruluyor: zemin renkleri, dört bölgenin
   arazisi, süsler ve ortadaki "büyüyen şey".

   Her mekân bir araç kutusu alır:
     kutu/top/silindir/cisim  geometri kısayolları
     dunya                    ana grup      rast()  sabit rastgelelik
     RX/RZ                    tarla yarıçapları     ZEMIN  üst yüzey y'si
     ceyrek(renkler)          dört bölgeyi boyar
     dolu                     0..1, sınıfın ilerlemesi
   ve döndürdüğü nesnede istenirse { tik(t) } ile kendi animasyonunu sürdürür.

   Açık dünya için üç araç daha (bkz. dunya.js):
     engelEkle(x, z, r, kameraR, h)        daire engel (gövde, direk, kaya)
     kutuEngel(x, z, en, derinlik, aci, h) döndürülmüş kutu (duvar, tribün, çit)
     yukseltiEkle(x, z, rx, rz, ustY, {aci, yumusak, kutu})
                                           üstüne çıkılan tümsek / seki / köprü
     itilebilir({x, z, r, tip, renk})      top, kabak, koni, fıçı, balya
   h verilirse engel o yükseklikte biter: üstünden zıplanır.

   ÖNEMLİ: dunya.js hareket etmeyen, aynı geometri+malzemeyi paylaşan
   mesh'leri tek InstancedMesh'e topluyor. tik() içinde oynatılan bir
   nesnenin grubuna userData.hareketli = true koy; yoksa toplanır ve
   animasyon sessizce durur.
   Çarpışması verilmeyen merkez yapısına dunya.js yedek bir daire koyar. */

import {fareModeli} from './modeller.js';

export const ZEMIN = .55;

/* ——— Ortak süsler ——— */
export function agacKur(a, x, z, mevsim = 'yaz') {
  const g = new a.THREE.Group(); g.position.set(x, .45, z); a.dunya.add(g);
  a.engelEkle?.(x, z, .85, 1.3);    // taç alçak: altına girilmez
  a.silindir(0, .8, 0, .16, .26, 1.6, 0x9b7550, g, 7);
  if (mevsim === 'kis') for (const [p, q, r, yc] of [[0, 1.9, 0, .8], [-.6, 1.6, .2, .5], [.5, 1.8, -.1, .5]]) {
    const t = a.top(p, q, r, yc, 0xe9eef0, g, 1); t.scale.y = .6;
  } else {
    const renk = { ilkbahar: [0x84c073, 0x9ed081], yaz: [0x5f9e5f, 0x7cb56c], sonbahar: [0xd39247, 0xe0ac5c],
                   cam: [0x3f8560, 0x54996c] }[mevsim] || [0x5f9e5f, 0x7cb56c];
    if (mevsim === 'cam') for (let i = 0; i < 3; i++) a.silindir(0, 1.5 + i * .62, 0, 0, 1.05 - i * .2, 1.5, renk[i % 2], g, 7);
    else { a.top(0, 2.1, 0, 1.05, renk[0], g); a.top(-.5, 1.95, .25, .68, renk[1], g); a.top(.42, 2.35, -.15, .66, renk[0], g); }
  }
  return g;
}
/* Çit: ortasında bir kapı aralığı var (kapi birim). Çarpışır ama alçak:
   karakter üstünden zıplayabilir. eksen 'z' ise çit +z yönünde uzanır. */
export function citKur(a, x, z, boy, eksen = 'x', renk = 0xf1e0ba, kapi = 3) {
  const g = new a.THREE.Group(); g.position.set(x, .45, z);
  if (eksen === 'z') g.rotation.y = -Math.PI / 2; a.dunya.add(g);
  const k1 = boy / 2 - kapi / 2, k2 = boy / 2 + kapi / 2;
  for (let i = 0; i <= boy; i++) if (!kapi || i <= k1 || i >= k2) a.kutu(i, .42, 0, .1, .84, .11, renk, g);
  const parcalar = kapi ? [[0, k1], [k2, boy]] : [[0, boy]];
  for (const [b, s] of parcalar) {
    const u = s - b + .1, m = (b + s) / 2;
    a.kutu(m, .36, 0, u, .1, .1, 0xdfc79c, g);
    a.kutu(m, .66, 0, u, .1, .1, renk, g);
    // dünya koordinatında parçanın ortası
    const wx = eksen === 'z' ? x : x + m, wz = eksen === 'z' ? z + m : z;
    a.kutuEngel?.(wx, wz, eksen === 'z' ? .14 : u, eksen === 'z' ? u : .14, 0, .84, false);
  }
  if (kapi) {                                            // kapı direkleri biraz daha uzun
    for (const t of [k1, k2]) a.kutu(t, .55, 0, .16, 1.1, .16, 0xdfc79c, g);
  }
}
export function siraKur(a, x, z, uzun, renk, h, yatay = true) {
  const m = a.kutu(x, ZEMIN + .01 + h / 2, z, yatay ? uzun : .17, h, yatay ? .17 : uzun, renk);
  m.castShadow = h > .12; return m;
}
export function kayaKur(a, x, z, r, renk = 0xa9b2a2) {
  if (a.yolaYakin?.(x, z, r + .45)) return null;       // yolun, durağın üstüne kaya yok
  const k = a.top(x, ZEMIN + r * .45, z, r, renk, a.dunya, 0);
  k.scale.set(1.25, .62, .9); k.rotation.y = a.rast() * 3;
  if (r > .32) a.engelEkle?.(x, z, r * .9, 0, r * 1.05);
  return k;
}
export function calilikKur(a, x, z, r, renk = 0x6f9e63) {
  if (a.yolaYakin?.(x, z, r + .3)) return null;
  const c = a.top(x, ZEMIN + r * .5, z, r, renk, a.dunya, 1); c.scale.y = .62; return c;
}

/* ═══════════════════ 01 · TARLA — Ağustos Böceği ile Karınca ═══════════════════
   Dört çeyrek dört mevsim. Ortada ambar; her görevde bir çuval daha doluyor. */
function tarla(a) {
  a.ceyrek([0xa9c96f, 0xe6cb72, 0xc98a4c, 0xdfe9ec]);

  // İlkbahar: taze filizler
  for (let i = 0; i < 7; i++) {
    siraKur(a, -7.4, -7.2 + i * .82, 7.2, 0x86a85f, .1);
    for (let j = 0; j < 5; j++) { const f = a.top(-10.3 + j * 1.5, .72, -7.2 + i * .82, .15, 0x7db563, a.dunya, 0); f.scale.set(.7, 1.5, .7); }
  }
  // Yaz: başaklar
  for (let i = 0; i < 7; i++) {
    siraKur(a, 7.4, -7.2 + i * .82, 7.2, 0xd9b45f, .12);
    for (let j = 0; j < 6; j++) {
      const s = a.silindir(4.4 + j * 1.3, .94, -7.2 + i * .82, .04, .07, .78, 0xe5c877, a.dunya, 4);
      s.rotation.z = (a.rast() - .5) * .22;
      a.top(4.4 + j * 1.3, 1.32, -7.2 + i * .82, .12, 0xefd98f, a.dunya, 0).scale.set(.6, 1.5, .6);
    }
  }
  // Sonbahar: anız ve çuvallar
  for (let i = 0; i < 7; i++) siraKur(a, 7.4, 1.2 + i * .82, 7.2, 0xc08a52, .07);
  for (let i = 0; i < 9; i++) {
    const x = 4 + (i % 3) * 1.25, z = 2.4 + Math.floor(i / 3) * 1.3;
    const c = a.top(x, .88, z, .38, 0xdcc18d, a.dunya, 1);
    c.scale.set(.85, 1.05, .85);
    a.engelEkle?.(x, z, .3, 0, .72);
  }
  // Kış: kar yamaları
  for (let i = 0; i < 7; i++) siraKur(a, -7.4, 1.2 + i * .82, 7.2, 0xb9bfae, .07);
  for (let i = 0; i < 22; i++) {
    const k = a.silindir(-11.4 + a.rast() * 8.8, ZEMIN + .025, 1.5 + a.rast() * 7.6, .3 + a.rast() * .5, .34 + a.rast() * .55, .05, 0xeef3f3, a.dunya, 10);
    k.castShadow = false; k.scale.z = .74;
  }
  citKur(a, -12.4, -9.4, 25); citKur(a, -12.4, 9.4, 25);
  citKur(a, -12.4, -9.4, 19, 'z'); citKur(a, 12.4, -9.4, 19, 'z');
  agacKur(a, -9.8, -6.6, 'ilkbahar'); agacKur(a, 10, -6.2, 'yaz');
  agacKur(a, 9.6, 6.4, 'sonbahar'); agacKur(a, -9.4, 6.8, 'kis');

  // Korkuluk
  const k = new a.THREE.Group(); k.position.set(-4.6, .45, -5.4); a.dunya.add(k);
  a.engelEkle?.(-4.6, -5.4, .14, .3);
  a.silindir(0, 1.1, 0, .09, .11, 2.2, 0xa5804f, k, 6);
  a.kutu(0, 1.55, 0, 1.9, .11, .11, 0xa5804f, k);
  a.top(0, 2.34, 0, .38, 0xeddcae, k, 1).scale.y = 1.05;
  a.top(-.14, 2.4, .3, .045, 0x3d4a40, k, 0); a.top(.14, 2.4, .3, .045, 0x3d4a40, k, 0);
  a.silindir(0, 2.72, 0, .06, .5, .34, 0xc98f4e, k, 12);
  a.silindir(0, 2.57, 0, .62, .62, .06, 0xc98f4e, k, 14);

  /* Merkez: ambar */
  const ambar = new a.THREE.Group(); ambar.position.set(0, .45, .2); a.dunya.add(ambar);
  ambar.userData.hareketli = true;                      // duman tik() ile oynuyor
  a.silindir(0, .08, 0, 2.7, 2.8, .18, 0xdccba0, ambar, 40).scale.z = .88;
  a.kutu(0, .92, 0, 3, 1.7, 2.2, 0xc4674f, ambar);
  a.kutu(0, 1.8, 0, 3.12, .16, 2.32, 0xf3e6c8, ambar);
  for (const yon of [-1, 1]) {
    const e = a.kutu(yon * .78, 2.33, 0, 1.74, .16, 2.36, 0xa8523f, ambar); e.rotation.z = -yon * .72;
  }
  const alin = new a.THREE.Shape();
  alin.moveTo(-1.5, 0); alin.lineTo(1.5, 0); alin.lineTo(0, 1.18); alin.closePath();
  for (const z of [-1.1, 1.1])
    a.cisim(new a.THREE.ShapeGeometry(alin), 0xcf7357, 0, 1.88, z, ambar, { side: a.THREE.DoubleSide });
  a.kutu(0, .68, 1.13, 1.15, 1.35, .08, 0xf0e2c0, ambar);
  a.kutu(0, .68, 1.18, .1, 1.35, .04, 0xa8523f, ambar);
  a.kutu(0, 1.26, 1.18, 1.15, .1, .04, 0xa8523f, ambar);
  a.kutu(0, 2.02, 1.02, .62, .52, .1, 0x8e4536, ambar);
  const cuval = Math.round(a.dolu * 12);
  for (let i = 0; i < cuval; i++) {
    const kat = Math.floor(i / 4), sut = i % 4;
    const c = a.top(-1.6 + sut * 1.07, .34 + kat * .48, 1.95 + kat * .26, .26,
      [0xe8cf9d, 0xdcc18d, 0xd3b47c][kat % 3], ambar, 1);
    c.scale.set(.9, 1.1, .9); c.rotation.y = a.rast() * 3;
  }
  a.silindir(1.85, 1.35, -.8, .2, .24, 1.1, 0xb4926a, ambar, 8);
  /* Çarpışma: ambarın duvarları gerçek bir kutu — köşesinden dönülür,
     arkasına geçilir. Kaidesine çıkılır. Önündeki çuval sırası alçak:
     tek sıra varken üstünden zıplanır. */
  a.yukseltiEkle?.(0, .2, 2.75, 2.42, .62);
  a.kutuEngel?.(0, .2, 3.14, 2.34);
  a.engelEkle?.(1.85, -.6, .26, .3);
  if (cuval) a.kutuEngel?.(0, 2.42, 4, .8, 0, .62 + Math.floor((cuval - 1) / 4) * .48, false);
  /* İtilebilir: sonbaharda kabaklar, yazda saman rulosu, ilkbaharda su
     fıçıları, kışın kar topları. Çocuk koşarak çarpınca yuvarlanıyorlar. */
  if (a.itilebilir) {
    [[7.6, 3.4, .42], [8.8, 5.6, .5], [6.2, 6.8, .36], [9.8, 2.2, .4], [3.4, 6.2, .46]]
      .forEach(([x, z, r]) => a.itilebilir({ x, z, r, tip: 'kabak', renk: 0xe08a3c }));
    [[8.2, -1.6, 0], [5.4, -1.4, 1.2], [10.2, -3.8, .5]]
      .forEach(([x, z, yon]) => a.itilebilir({ x, z, r: .52, tip: 'balya', renk: 0xe3c46e, yon }));
    [[-3.2, -4.2], [-6.4, -3.2], [-2.6, -6.6]]
      .forEach(([x, z]) => a.itilebilir({ x, z, r: .36, tip: 'fici', renk: 0x9c6b43 }));
    [[-5.4, 3.6, .34], [-7.4, 4.9, .46], [-3.8, 5.8, .28], [-9, 2.6, .38]]
      .forEach(([x, z, r]) => a.itilebilir({ x, z, r, tip: 'top', renk: 0xf4f7f7, ikinci: 0xdbe8ee }));
  }
  const duman = [];
  if (a.dolu > .7) for (let i = 0; i < 4; i++) {
    const d = a.top(1.85 + i * .28, 2.05 + i * .46, -.8 - i * .16, .2 + i * .05, 0xeef2f0, ambar, 1);
    d.castShadow = false; d.material = a.mal(0xeef2f0, { transparent: true, opacity: .8 - i * .16 });
    duman.push(d);
  }
  return { tik: t => duman.forEach((d, i) => { d.position.y = 2.05 + i * .46 + Math.sin(t * .8 + i) * .1; }) };
}

/* ═══════════════════ 02 · PARKUR — Kaplumbağa ile Tavşan ═══════════════════
   Dört etap: çayır, dere, orman, tepe. Ortada bitiş kürsüsü; sınıf
   ilerledikçe bayraklar dikiliyor ve kürsü süsleniyor. */
function parkur(a) {
  a.ceyrek([0xa8c974, 0x8fc2ae, 0x7ea86a, 0xc3c49a]);

  // 01 Çayır (sol üst): çiçekler ve seyirci taşları
  for (let i = 0; i < 46; i++) {
    const x = -12 + a.rast() * 10.5, z = -9 + a.rast() * 8;
    a.silindir(x, ZEMIN + .12, z, .022, .028, .26, 0x6f9c56, a.dunya, 4);
    a.top(x, ZEMIN + .27, z, .085, [0xf2de9d, 0xf4c9d6, 0xfff2e0][i % 3], a.dunya, 0);
  }
  for (let i = 0; i < 5; i++) kayaKur(a, -11 + i * 2.2, -9.4, .3 + a.rast() * .16);

  // 02 Dere (sağ üst): kıvrılan bir su şeridi, nilüferler, köprü
  const egri = new a.THREE.CatmullRomCurve3([
    new a.THREE.Vector3(.4, 0, -8.8), new a.THREE.Vector3(2.4, 0, -6.4),
    new a.THREE.Vector3(5.4, 0, -5.4), new a.THREE.Vector3(8.2, 0, -3.4),
    new a.THREE.Vector3(10.2, 0, -1.4), new a.THREE.Vector3(11.4, 0, .2)]);
  function serit(genislik, renk, y) {
    const n = 60, sol = [], sag = [];
    egri.getPoints(n).forEach((p, i) => {
      const t = egri.getTangent(i / n), nx = -t.z, nz = t.x;
      sol.push(new a.THREE.Vector2(p.x + nx * genislik, -p.z - nz * genislik));
      sag.unshift(new a.THREE.Vector2(p.x - nx * genislik, -p.z + nz * genislik));
    });
    /* Zemin boyasından (dunya.js ceyrek: polygonOffset -1/-2) daha güçlü derinlik
       önceliği: yoksa boya derenin üstüne çıkıp dereyi görünmez yapıyordu. */
    const m = a.cisim(new a.THREE.ShapeGeometry(new a.THREE.Shape([...sol, ...sag])), renk, 0, y, 0, a.dunya,
      { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 - y * 40 });
    m.rotation.x = -Math.PI / 2; m.castShadow = false; return m;
  }
  serit(1.55, 0xd9cfa4, ZEMIN + .008);          // kumlu kıyı
  serit(1.05, 0x6fb2c4, ZEMIN + .016);          // su
  serit(.52, 0x8ecbd6, ZEMIN + .022);           // parlayan orta akıntı
  for (let i = 0; i < 8; i++) {
    const p = egri.getPoint((i + .6) / 9);
    const n = a.silindir(p.x, ZEMIN + .04, p.z, .34, .34, .05, 0x77b06a, a.dunya, 12);
    n.castShadow = false;
    if (i % 2) a.top(p.x, ZEMIN + .13, p.z, .12, 0xf0d5e4, a.dunya, 0);
  }
  const koprupt = egri.getPoint(.62), kt = egri.getTangent(.62);
  const kopru = new a.THREE.Group();
  kopru.position.set(koprupt.x, .45, koprupt.z);
  kopru.rotation.y = Math.atan2(kt.x, kt.z) + Math.PI / 2;
  a.dunya.add(kopru);
  for (let i = 0; i < 7; i++) a.kutu(0, .34, -1.5 + i * .5, 2.6, .12, .4, 0xc7a77a, kopru);
  a.yukseltiEkle?.(koprupt.x, koprupt.z, 1.3, 1.75, .86, { aci: kopru.rotation.y, kutu: true });
  for (const x of [-1.2, 1.2]) { a.kutu(x, .62, 0, .09, .5, 3.4, 0xa9916d, kopru);
    for (const z of [-1.4, 0, 1.4]) a.kutu(x, .34, z, .12, .62, .12, 0xa9916d, kopru); }

  // 03 Orman (sağ alt): ağaçlar ve uyuyan tavşanın gölgeliği
  for (const [x, z, m] of [[4.6, 3.4, 'cam'], [7.2, 5.6, 'yaz'], [10.4, 3.2, 'cam'], [5.8, 7.6, 'yaz'],
                           [9.4, 8, 'cam'], [11.6, 6.2, 'yaz'], [3.4, 6.2, 'yaz']]) agacKur(a, x, z, m);
  for (let i = 0; i < 14; i++) calilikKur(a, 3 + a.rast() * 9, 2.6 + a.rast() * 6.6, .3 + a.rast() * .3);
  // Kütük: Şimşek'in şekerleme yeri
  const kutuk = a.silindir(6.4, ZEMIN + .3, 4.6, .58, .62, .6, 0xa27a52, a.dunya, 12);
  a.engelEkle?.(6.4, 4.6, .6, .7, .9);            // üstünden zıplanır
  kutuk.rotation.z = Math.PI / 2; kutuk.rotation.y = .4;
  a.silindir(6.4, ZEMIN + .3, 4.6, .46, .46, .62, 0xd7b184, a.dunya, 12).rotation.z = Math.PI / 2;

  // 04 Tepe (sol alt): yumuşak bir tümsek, üstünde kayalar ve patika taşları
  for (let i = 0; i < 4; i++) {
    const r = 4.4 - i * .85, x = -7.2 + i * .35, y = ZEMIN + .1 + i * .52, z = 6.4 - i * .3;
    const t = a.top(x, y, z, r, [0xc6c79b, 0xbdbf93, 0xb4b98c, 0xaab183][i], a.dunya, 1);
    t.scale.set(1.15, .42, .95); t.rotation.y = i * .7;
    // Tepeye yürüyerek çıkılır: her katman bir kubbe
    a.yukseltiEkle?.(x, z, 1.15 * r * .98, .95 * r * .98, y + .42 * r - .05, { aci: i * .7, yumusak: true, taban: i ? y : ZEMIN });
  }
  for (let i = 0; i < 12; i++) kayaKur(a, -11.6 + a.rast() * 8.4, 2.4 + a.rast() * 6.8, .24 + a.rast() * .34, 0xb3b9a8);
  for (let i = 0; i < 9; i++) {                   // zirveye giden basamak taşları
    const t = i / 8, x = -10.6 + t * 4.6, z = 8.6 - t * 3.4;
    const b = a.silindir(x, ZEMIN + .06 + t * 1.5, z, .42, .46, .16, 0xd8d3ab, a.dunya, 14);
    b.scale.z = .8; b.castShadow = false;
  }

  /* Merkez: seyirci alanı. Bitiş çizgisi artık pistin ucunda —
     burada yarışı izleyenler var ve etap tamamlandıkça kalabalıklaşıyor. */
  const alan = new a.THREE.Group(); alan.position.set(0, .45, .2); a.dunya.add(alan);
  alan.userData.hareketli = true;                       // seyirciler tik() ile oynuyor
  a.silindir(0, .06, 0, 2.5, 2.6, .14, 0xe2dcbc, alan, 40).scale.z = .88;
  for (let i = 0; i < 3; i++) {                       // tribün basamakları
    a.kutu(0, .2 + i * .3, -1 - i * .55, 4 - i * .5, .3, .5, [0xdfd3ab, 0xd5c89c, 0xcabd8e][i], alan);
  }
  for (const yon of [-1, 1]) {                        // gölgelik direkleri
    a.silindir(yon * 1.9, .9, .9, .08, .1, 1.7, 0xb98f5e, alan, 6);
    a.engelEkle?.(yon * 1.9, 1.1, .1, .2);
  }
  a.kutuEngel?.(0, -1.35, 4.05, 1.75);                // tribün: etrafından dolaşılır
  if (a.itilebilir) {
    /* Parkur konileri ve toplar: koşarak çarpınca koni devrilir. */
    [[-6.4, -6.6], [-5.2, -7.6], [-7.8, -7.8], [-10.4, -5.4], [-3, -2.4], [1.4, -3.4]]
      .forEach(([x, z]) => a.itilebilir({ x, z, r: .34, tip: 'koni', renk: 0xe8773d }));
    [[1.8, 5.6, 0x6fa8c4], [-2.6, 4.6, 0xd9714f], [3.8, -2.6, 0xe0b054], [-1.2, -4.2, 0x7cae63]]
      .forEach(([x, z, renk]) => a.itilebilir({ x, z, r: .4, tip: 'top', renk }));
  }
  a.kutu(0, 1.78, .9, 4.4, .12, 1.5, 0xe0b054, alan);
  const seyirci = [];
  const kalabalik = 4 + Math.round(a.dolu * 10);
  for (let i = 0; i < kalabalik; i++) {
    const kat = Math.floor(i / 5), sut = i % 5;
    const s1 = a.top(-1.6 + sut * .8, .48 + kat * .3, -1 - kat * .55, .22,
      [0xd9714f, 0x6fa8c4, 0x7cae63, 0xe0b054, 0xc48fb0][i % 5], alan, 1);
    s1.scale.y = 1.2; s1.userData.y0 = s1.position.y; seyirci.push(s1);
  }
  // Mutlak konum: eskiden her kare += ile ekleniyordu ve 40 dakikada kayıyordu
  return { tik: t => seyirci.forEach((s1, i) => { s1.position.y = s1.userData.y0 + Math.max(0, Math.sin(t * 3 + i)) * .05; }) };
}

/* ═══════════════════ 03 · SAVAN — Aslan ile Fare ═══════════════════
   Otlak, kayalık, nehir ve ağın bulunduğu çalılık. Ortada Kösele'nin
   kayası. Burada merkez DOLMAZ, TERSİNE ÇÖZÜLÜR: sınıf ilerledikçe
   aslanın üstündeki ip teker teker kayboluyor. */
function savan(a) {
  a.ceyrek([0xe3ca6c, 0xbcae8c, 0x8ec4b8, 0xa89168]);

  function akasya(x, z, olcek = 1) {
    const g = new a.THREE.Group(); g.position.set(x, .45, z); g.scale.setScalar(olcek); a.dunya.add(g);
    a.engelEkle?.(x, z, .2 * olcek, .3);          // taç yüksek: altından geçilir
    a.silindir(0, .95, 0, .14, .26, 1.9, 0xa08256, g, 7);
    a.silindir(-.3, 1.5, .1, .08, .12, .9, 0xa08256, g, 5).rotation.z = .5;
    a.silindir(0, 2.15, 0, 2.05, 1.5, .34, 0x6f9c5e, g, 16);
    a.silindir(0, 2.42, 0, 1.45, 1.9, .3, 0x84b06d, g, 16);
    a.top(-.9, 2.3, .5, .5, 0x7aa864, g, 1).scale.y = .4;
    return g;
  }
  // 01 Otlak: uzun sarı otlar, akasya, fare yuvaları
  for (let i = 0; i < 70; i++) {
    const x = -12.2 + a.rast() * 10.8, z = -9.2 + a.rast() * 8.2;
    const o = a.silindir(x, ZEMIN + .18, z, .02, .035, .38, a.rast() > .5 ? 0xb99f45 : 0xc9b25e, a.dunya, 4);
    o.rotation.z = (a.rast() - .5) * .5; o.castShadow = false;
  }
  akasya(-9.6, -6.8, 1.05); akasya(-4.2, -8.4, .78);
  for (let i = 0; i < 3; i++) {
    const y = a.silindir(-10.6 + i * 1.9, ZEMIN + .12, -2.4 + i * .7, .5, .62, .26, 0xb8965f, a.dunya, 14);
    y.scale.z = .8;
    a.top(-10.6 + i * 1.9, ZEMIN + .16, -2.1 + i * .7, .17, 0x6b5638, a.dunya, 0).scale.y = .7;
  }

  /* 02 Kayalık: basamaklı kaya çıkıntıları. Köşede, yolun dışında; sekiler
     dışarıya doğru yükseliyor, yani oyun alanı tarafından basamak basamak
     tırmanılıyor. Tepesi Gözcü kayalığı keşif noktası. (Eskiden durakların
     üstüne oturuyordu.) */
  for (let i = 0; i < 5; i++) {
    const x = 11.3 + i * .38, z = -8.5 - i * .3;
    const t = a.silindir(x, ZEMIN + .12 + i * .46, z, 3.3 - i * .56, 3.6 - i * .56, .48,
      [0xc6b99c, 0xbcae90, 0xb2a485, 0xa89a7b, 0x9e9071][i], a.dunya, 7);
    t.scale.z = .74; t.rotation.y = i * .5;
    // Her seki bir öncekinden ~0.46 yüksek: adım yüksekliğinin altında, tırmanılır
    const r = (3.3 - i * .56) * .93;
    a.yukseltiEkle?.(x, z, r, r * .74, ZEMIN + .36 + i * .46, { aci: i * .5 });
  }
  for (let i = 0; i < 12; i++) kayaKur(a, 2.6 + a.rast() * 9.6, -9.2 + a.rast() * 7.4, .26 + a.rast() * .34, 0xb6ab92);
  akasya(11.2, -3.2, .72);

  // 03 Nehir: kıvrılan su
  const egri = new a.THREE.CatmullRomCurve3([
    new a.THREE.Vector3(12.4, 0, .4), new a.THREE.Vector3(10.2, 0, 2.6),
    new a.THREE.Vector3(7.4, 0, 4.2), new a.THREE.Vector3(5.4, 0, 6.6),
    new a.THREE.Vector3(3.4, 0, 8.4), new a.THREE.Vector3(1.2, 0, 9.4)]);
  function serit(genislik, renk, y) {
    const n = 60, sol = [], sag = [];
    egri.getPoints(n).forEach((p, i) => {
      const t = egri.getTangent(i / n), nx = -t.z, nz = t.x;
      sol.push(new a.THREE.Vector2(p.x + nx * genislik, -p.z - nz * genislik));
      sag.unshift(new a.THREE.Vector2(p.x - nx * genislik, -p.z + nz * genislik));
    });
    /* Zemin boyasından (dunya.js ceyrek: polygonOffset -1/-2) daha güçlü derinlik
       önceliği: yoksa boya derenin üstüne çıkıp dereyi görünmez yapıyordu. */
    const m = a.cisim(new a.THREE.ShapeGeometry(new a.THREE.Shape([...sol, ...sag])), renk, 0, y, 0, a.dunya,
      { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 - y * 40 });
    m.rotation.x = -Math.PI / 2; m.castShadow = false; return m;
  }
  serit(1.5, 0xd9cfa4, ZEMIN + .008); serit(1.02, 0x6fb2c4, ZEMIN + .016); serit(.5, 0x8ecbd6, ZEMIN + .022);
  for (let i = 0; i < 7; i++) {
    const p = egri.getPoint((i + .5) / 8);
    kayaKur(a, p.x + (a.rast() - .5) * 3.4, p.z + (a.rast() - .5) * 2, .2 + a.rast() * .22, 0xa9b0a0);
  }
  akasya(8.6, 7.6, .9);

  // 04 Ağ çalılığı: alçak çalılar ve kazıklar
  for (let i = 0; i < 16; i++) calilikKur(a, -12 + a.rast() * 9.4, 2.2 + a.rast() * 7, .3 + a.rast() * .32, 0x8a9a63);
  for (let i = 0; i < 4; i++) {
    const k = a.silindir(-10.4 + i * 2.3, ZEMIN + .5, 8.4 - i * .4, .09, .12, 1, 0x9c7a52, a.dunya, 6);
    a.engelEkle?.(-10.4 + i * 2.3, 8.4 - i * .4, .1, 0, 1);
    k.rotation.z = (a.rast() - .5) * .3;
  }

  /* Merkez: Kösele'nin kayası. Ağ ilerledikçe çözülüyor. */
  const merkez = new a.THREE.Group(); merkez.position.set(0, .45, .2); a.dunya.add(merkez);
  merkez.userData.hareketli = true;                     // ipler tik() ile oynuyor
  const kaya = a.top(0, .42, 0, 2.45, 0xb5ab93, merkez, 1); kaya.scale.set(1.3, .4, 1.05);
  a.top(-2.1, .3, 1.05, .95, 0xc0b69d, merkez, 1).scale.set(1.1, .45, .9);
  a.top(2.2, .26, -.95, .82, 0xaaa189, merkez, 1).scale.set(1.15, .45, .95);
  /* Kösele'nin kayası aşılmaz (üstünde ağa takılı aslan var); yanındaki
     iki alçak kayaya ise tırmanılıp oradan aslana bakılır. */
  for (const [x, z, r] of [[-1.3, .2, 1.85], [1.3, .2, 1.85], [0, .2, 2.25]]) a.engelEkle?.(x, z, r, r + .2);
  a.yukseltiEkle?.(-2.1, 1.25, 1.02, .84, .45 + .3 + .95 * .45, { yumusak: true });
  a.yukseltiEkle?.(2.2, -.75, .92, .76, .45 + .26 + .82 * .45, { yumusak: true });
  if (a.itilebilir) {
    /* Su kabakları otlakta, kütükler nehir kıyısında. */
    [[-7, -4.6, .36], [-5.6, -6.2, .3], [-8.6, -3.2, .4], [-3.4, -4.4, .32], [-2.2, -7.2, .34]]
      .forEach(([x, z, r]) => a.itilebilir({ x, z, r, tip: 'kabak', renk: 0xd8b25a, ikinci: 0x7a8a45 }));
    [[4.2, 3.4, .3], [8.4, 1.4, 1.1]]
      .forEach(([x, z, yon]) => a.itilebilir({ x, z, r: .46, tip: 'balya', renk: 0x9c7a52, ikinci: 0xd7b184, yon }));
    [[-6.6, 4.2], [-4.2, 6.2]].forEach(([x, z]) => a.itilebilir({ x, z, r: .38, tip: 'top', renk: 0xc98f4e, ikinci: 0x8a9a63 }));
  }
  const aslan = new a.THREE.Group(); aslan.position.set(0, .92, .1); aslan.scale.setScalar(1.65); merkez.add(aslan);
  const govde = a.top(-.2, .34, 0, .78, 0xdcac5f, aslan, 1); govde.scale.set(1.35, .82, .9);
  for (const [x, z] of [[-.85, .45], [-.85, -.45], [.45, .5], [.45, -.5]])
    a.silindir(x, .1, z, .16, .18, .42, 0xcf9f56, aslan, 6);
  const yele = new a.THREE.Group(); yele.position.set(.86, .5, 0); aslan.add(yele);
  for (let i = 0; i < 10; i++) {
    const ac = i / 10 * Math.PI * 2;
    a.top(Math.cos(ac) * .54, Math.sin(ac) * .54, 0, .32, 0xc97f2e, yele, 0);
  }
  a.top(.86, .5, 0, .5, 0xf6dfa5, aslan, 1);
  a.top(.7, .56, .3, .05, 0x3b4940, aslan, 0); a.top(.7, .56, -.3, .05, 0x3b4940, aslan, 0);
  a.top(1.2, .42, 0, .17, 0xe0a58c, aslan, 1).scale.set(.8, .7, 1);
  a.silindir(-1.05, .34, 0, .05, .06, .9, 0xcf9f56, aslan, 5).rotation.z = 1.1;

  /* Ağ: 12 ip. Sınıf ilerledikçe kalanı azalıyor. */
  const kalan = Math.max(0, 12 - Math.round(a.dolu * 12));
  const ipler = [];
  for (let i = 0; i < kalan; i++) {
    const yatay = i % 2 === 0, k = Math.floor(i / 2);
    const ip = yatay
      ? a.kutu(0, 1.95 + k * .1, -1.7 + k * .58, 5.2, .08, .08, 0xf0e6ca, merkez)
      : a.kutu(-1.7 + k * .58, 1.95 + k * .1, 0, .08, .08, 3.9, 0xf0e6ca, merkez);
    ip.rotation.y = (a.rast() - .5) * .12;
    ip.userData.y0 = ip.position.y;
    ipler.push(ip);
  }
  if (a.dolu > .85) for (let i = 0; i < 5; i++) {         // koloni kayanın çevresinde, aslana bakıyor
    const ac = i / 5 * Math.PI * 2;
    const yer = new a.THREE.Group(); yer.position.set(Math.cos(ac) * 3.2, .17, Math.sin(ac) * 2.6); merkez.add(yer);
    yer.rotation.y = Math.atan2(-Math.cos(ac), -Math.sin(ac));
    fareModeli(a, yer, { renk: [0xd9cdb6, 0xb8a58c, 0xc9b49b, 0xa9a39a, 0xdcc6a8][i], olcek: .62 });
  }
  return { tik: t => ipler.forEach((ip, i) => { ip.position.y = ip.userData.y0 + Math.sin(t * .9 + i) * .03; }) };
}

import {EK_MEKANLAR} from './mekan/liste.js';
export const MEKANLAR = Object.assign({ tarla, parkur, savan }, EK_MEKANLAR);

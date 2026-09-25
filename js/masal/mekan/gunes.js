/* Güneş ile Rüzgâr mekânı — mekân adı → kurucu işlev (bkz. mekanlar.js).

   ═══════════════════ 04 · YAYLA YOLU — Güneş ile Rüzgâr ═══════════════════
   Yol dört yamaçta zikzak çizer (durak yerleri masal paketinde:
   dunya.yerlesim). Arka yarı RÜZGÂR'ın sırtı: dönen yel değirmeni,
   rüzgârda sallanan ağaçlar, elma ağacı, otlayan koyunlar, köşede
   tırmanılan kaya tepesi. Ön yarı GÜNEŞ'in güneye bakan yamacı: iki
   ayçiçeği tarlası. Ortada ninenin kulübesi ve çeşmesi; çeşmeden taşan
   dere güneye akar, yol onu taş köprüyle geçer.

   Merkez sınıfın ilerlemesiyle değişir (a.dolu):
     · Rüzgâr'ın yarısında değirmen deli gibi döner, ağaçlar eğilir,
       çamaşır ipi boş sallanır.
     · Güneş'in yarısında değirmen yavaşlar; Pofuduk'un çıkardığı giysiler
       (battaniye, eldiven, atkı, şapka, en son palto) ipe birer birer asılır.
     · Yolculuk bitince Pofuduk paltosuz, çeşmenin başında oturur.

   Döngüsel içe aktarma olmasın diye mekanlar.js'ten hiçbir şey alınmaz;
   yalnız araç kutusu (a) kullanılır. */

import {koyunModeli, ayiModeli} from '../modeller/gunes.js';

function yaylaYolu(a) {
  const { THREE } = a, Z = a.ZEMIN;
  const ruzgarda = a.dolu < .5;                      // sıra hâlâ Rüzgâr'da mı
  const hareketli = [];                              // tik() ile oynayanlar

  /* Dört çeyrek: arka ikisi Rüzgâr'ın serin çayırı, ön ikisi Güneş'in sarı yamacı. */
  a.ceyrek([0xa3c28c, 0x9dbd86, 0xd6c47a, 0xdccb80]);

  /* ——— Yardımcılar (yalnız kurucu içinde) ——— */
  const grup = (x, y, z, ebeveyn = a.dunya) => { const g = new THREE.Group(); g.position.set(x, y, z); ebeveyn.add(g); return g; };
  /* Ayrılmış yerler: yapılar, keşif noktaları, itilebilir nesneler. Süsler
     (kaya, çalı, çiçek, ağaç) bunların ve yolun üstüne düşmez. */
  const rezerv = [[-7, -2.6, 1.4], [0, .2, 3.3], [1, 6.8, 2], [-14.4, -8.8, 2.8], [-15.3, -9.6, 2.2], [-16.4, -10.4, 1.4],
    [7.8, -3.2, 1.2], [-7, -.6, .9], [3.4, 2.5, .9], [2.9, 9.3, .9], [-9.8, -1.6, .8], [-4.6, -1.4, .8], [6, -1.2, .8],
    [3.7, -.9, .6], [3.6, 1.3, .6], [-3.4, 4.4, .7], [1.2, -4, .7], [-1.4, -4.8, .8], [.8, -4.4, .8], [2.6, -5.2, .8]];
  const bosMu = (x, z, r) => !a.yolaYakin(x, z, r + .3) && rezerv.every(([rx, rz, rr]) => Math.hypot(x - rx, z - rz) > r + rr);
  function kaya(x, z, r, renk = 0xa9ae9c) {
    if (!bosMu(x, z, r + .15)) return;
    const k = a.top(x, Z + r * .42, z, r, renk, a.dunya, 0);
    k.scale.set(1.2, .6, .95); k.rotation.y = a.rast() * 3;
    if (r > .32) a.engelEkle(x, z, r * .9, 0, r * 1.05);
    rezerv.push([x, z, r]);
  }
  function cali(x, z, r, renk = 0x7ea668) {
    if (!bosMu(x, z, r)) return;
    const c = a.top(x, Z + r * .5, z, r, renk, a.dunya, 1); c.scale.y = .62;
  }
  function cicek(x, z, renk) {
    if (!bosMu(x, z, .1)) return;
    a.silindir(x, Z + .12, z, .02, .025, .24, 0x6f9c56, a.dunya, 4);
    a.top(x, Z + .26, z, .07, renk, a.dunya, 0);
  }
  /* Rüzgârda sallanan ağaç: gövde sabit, taç tik() ile eğilip doğrulur.
     Rüzgâr'ın yarısında sert, Güneş'in yarısında hafif. */
  function sallananAgac(x, z, olcek = 1, renkler = [0x5f9e5f, 0x78b169]) {
    if (!bosMu(x, z, .7 * olcek)) return;
    rezerv.push([x, z, .9 * olcek]);
    const g = grup(x, .45, z); g.scale.setScalar(olcek);
    a.engelEkle(x, z, .28 * olcek, 1.1 * olcek);
    a.silindir(0, .8, 0, .15, .25, 1.6, 0x94704c, g, 7);
    const tac = grup(0, 1.55, 0, g); tac.userData.hareketli = true;
    a.top(0, .6, 0, 1, renkler[0], tac); a.top(-.48, .42, .2, .66, renkler[1], tac); a.top(.44, .8, -.12, .62, renkler[0], tac);
    hareketli.push({ tip: 'agac', o: tac, faz: a.rast() * 6 });
  }
  /* Ayçiçeği: gövde + yaprak + taç + göbek. Hareket etmez; dunya.js aynı
     parçaları tek çizimde toplar, tarla yüzlerce çiçek olsa da hafif kalır. */
  const petalGeo = new THREE.CylinderGeometry(.34, .34, .07, 14).rotateX(Math.PI / 2);
  const gobekGeo = new THREE.CylinderGeometry(.18, .18, .09, 12).rotateX(Math.PI / 2);
  function aycicegi(x, z, boy = 1) {
    if (a.yolaYakin(x, z, .4)) return;
    const g = grup(x, Z, z); g.scale.setScalar(boy); g.rotation.y = -.5 + (a.rast() - .5) * .5;
    a.silindir(0, .7, 0, .035, .05, 1.4, 0x5c8f45, g, 5);
    const y = a.top(.16, .62, 0, .16, 0x6fa655, g, 0); y.scale.set(1.2, .22, .6); y.rotation.z = -.4;
    const bas = grup(0, 1.45, .05, g); bas.rotation.x = -.45;
    a.cisim(petalGeo, 0xf2bf2c, 0, 0, 0, bas);
    a.cisim(gobekGeo, 0x6b3f1e, 0, 0, .04, bas);
  }

  /* ═════ SOL YARI · RÜZGÂR'IN YAMACI ═════ */
  // Yel değirmeni: taş gövde, kırmızı külah çatı, dört kafes kanat
  {
    const x = -7, z = -2.6;
    const dg = grup(x, .45, z);
    a.silindir(0, 1.15, 0, .7, .95, 2.3, 0xefe5d0, dg, 14);
    a.silindir(0, .2, 0, 1, 1, .12, 0xd6cab0, dg, 14);
    a.silindir(0, 1.5, 0, .88, .88, .08, 0xd6cab0, dg, 14);
    a.cisim(new THREE.ConeGeometry(.92, .95, 14), 0xb5573f, 0, 2.77, 0, dg);
    a.kutu(0, .5, .86, .44, .8, .1, 0x8e6344, dg);
    a.kutu(0, 1.9, .74, .3, .3, .1, 0x6f8fa6, dg);
    const kanat = grup(0, 2.3, .95, dg); kanat.userData.hareketli = true;
    a.silindir(0, 0, 0, .13, .13, .22, 0x6e4a2c, kanat, 10).rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) {
      const k = grup(0, 0, .08, kanat); k.rotation.z = i * Math.PI / 2;
      a.kutu(0, .88, 0, .07, 1.76, .05, 0x8e6d45, k);
      a.kutu(.21, 1.02, 0, .36, 1.3, .03, 0xe9dcc0, k);
      for (let j = 0; j < 2; j++) a.kutu(.21, .7 + j * .6, .02, .38, .03, .03, 0x8e6d45, k).castShadow = false;
    }
    hareketli.push({ tip: 'degirmen', o: kanat });
    a.engelEkle(x, z, 1.02, 1.25);
  }
  // Rüzgârda eğilen ağaçlar
  for (const [x, z, o] of [[-12.4, -3.2, 1], [-12.9, 1.2, .9], [-4.2, -4.2, .85], [4.4, -3.6, .85], [12.9, -2.8, 1], [-10.2, -4.6, .8], [0, -9.9, .9]])
    sallananAgac(x, z, o);
  // Elma ağacı: fırtınada dalları sallanır (masaldaki elma ağacı bu)
  {
    const x = 7.8, z = -3.2;
    const g = grup(x, .45, z); a.engelEkle(x, z, .3, 1.2);
    a.silindir(0, .75, 0, .16, .26, 1.5, 0x8e6a47, g, 7);
    const tac = grup(0, 1.5, 0, g); tac.userData.hareketli = true;
    a.top(0, .55, 0, 1.05, 0x5e9a52, tac); a.top(-.55, .35, .25, .62, 0x6fae5c, tac); a.top(.5, .7, -.1, .6, 0x5e9a52, tac);
    for (let i = 0; i < 9; i++) {
      const aci = i * 2.4, r = .75 + (i % 3) * .12;
      a.top(Math.cos(aci) * r, .25 + (i % 4) * .22, Math.sin(aci) * r, .12, 0xd9483c, tac, 1).castShadow = false;
    }
    hareketli.push({ tip: 'agac', o: tac, faz: 1.3 });
  }
  // Rüzgâr tepesi: dışarıya doğru yükselen kaya sekileri; basamak basamak tırmanılır
  for (let i = 0; i < 5; i++) {
    const x = -14.4 - i * .5, z = -8.8 - i * .4, r = 2.4 - i * .38;
    const t = a.silindir(x, Z + .12 + i * .46, z, r, r + .28, .48, [0xbfc2b4, 0xb3b7a8, 0xa8ad9d, 0x9da392, 0x939986][i], a.dunya, 8);
    t.scale.z = .8; t.rotation.y = i * .45;
    a.yukseltiEkle(x, z, r * .93, r * .8 * .93, Z + .36 + i * .46, { aci: i * .45 });
  }
  {
    // Tepedeki rüzgâr gülü: Savrun'un her sabah kalktığı yer
    const tx = -16.4, tz = -10.4, ty = Z + .36 + 4 * .46;
    const direk = grup(tx + .45, ty, tz - .2);
    a.silindir(0, .55, 0, .04, .05, 1.1, 0x6e5a48, direk, 6);
    const gul = grup(0, 1.12, 0, direk); gul.userData.hareketli = true;
    a.kutu(0, 0, 0, .7, .05, .05, 0xd9483c, gul); a.kutu(0, 0, 0, .05, .05, .7, 0xefe5d0, gul);
    const ok = a.cisim(new THREE.ConeGeometry(.08, .22, 8), 0xd9483c, .42, 0, 0, gul); ok.rotation.z = -Math.PI / 2;
    hareketli.push({ tip: 'gul', o: gul });
    a.engelEkle(tx + .45, tz - .2, .08, 0);
  }
  for (let i = 0; i < 14; i++) kaya(-12.6 + a.rast() * 25, -9 + a.rast() * 7.4, .2 + a.rast() * .28, 0xb3b7a8);
  for (let i = 0; i < 18; i++) cali(-12.4 + a.rast() * 24.8, -8.8 + a.rast() * 8, .2 + a.rast() * .26);
  for (let i = 0; i < 30; i++) cicek(-12.6 + a.rast() * 25, -8.8 + a.rast() * 8, [0xf4f1e6, 0xc9d4ef, 0xf2de9d][i % 3]);

  /* ═════ SAĞ YARI · GÜNEŞ'İN YAMACI ═════ */
  // İki ayçiçeği tarlası: kulübenin iki yanında, güneye bakan yamaçta
  for (const yon of [-1, 1]) for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++)
    aycicegi(yon * (4.6 + c * .74 + (r % 2) * .2), 2.2 + r * .8, .82 + a.rast() * .3);
  for (let i = 0; i < 12; i++) aycicegi(-10.6 + i * 1.9, 9.3 + (i % 2) * .4, .9 + a.rast() * .25);
  for (let i = 0; i < 8; i++) cali(-12 + a.rast() * 24, 8.6 + a.rast() * 1.2, .2 + a.rast() * .22, 0x9fae5f);
  for (const [x, z] of [[12.9, 3.6], [-12.9, 5.2]]) sallananAgac(x, z, .9, [0x7aa55a, 0x93bb68]);

  /* ═════ ORTA · NİNENİN KULÜBESİ, ÇEŞME, ÇAMAŞIR İPİ ═════ */
  const merkez = grup(0, .45, .2);                   // oynayanlar (ip, duman, Pofuduk) kendi gruplarında
  a.silindir(0, .08, 0, 2.9, 3, .18, 0xd8cdb0, merkez, 36).scale.z = .9;
  a.yukseltiEkle(0, .2, 2.85, 2.55, .62);
  // Kulübe: taş duvar, ahşap çatı, kapı, pencereler, baca
  const ev = grup(-.3, 0, -.8, merkez);
  a.kutu(0, .92, 0, 2.8, 1.5, 2, 0xdcd2bb, ev);
  for (const y of [.5, .95, 1.4]) a.kutu(0, y, 1.005, 2.8, .04, .02, 0xc4b89c, ev);
  for (const yon of [-1, 1]) {
    const cati = a.kutu(0, 2.05, yon * .56, 3.1, .14, 1.42, 0xa8583f, ev); cati.rotation.x = yon * .62;
  }
  const alin = new THREE.Shape(); alin.moveTo(-1, 0); alin.lineTo(1, 0); alin.lineTo(0, .78); alin.closePath();
  for (const yon of [-1, 1]) {
    const m = a.cisim(new THREE.ShapeGeometry(alin), 0xc9b48f, yon * 1.4, 1.66, 0, ev, { side: THREE.DoubleSide });
    m.rotation.y = Math.PI / 2;
  }
  a.kutu(0, .66, 1.02, .6, 1.02, .06, 0x8e6344, ev);
  a.kutu(-.85, 1.08, 1.02, .46, .38, .05, 0xf3d27a, ev); a.kutu(.85, 1.08, 1.02, .46, .38, .05, 0xf3d27a, ev);
  a.kutu(.8, 2.45, -.45, .32, .7, .32, 0x9c8f7a, ev);
  a.kutuEngel(-.3, -.6, 2.95, 2.15);
  // Bacadan duman: yolculuk bitince ninenin ocağı yanar
  const duman = [], bacaDumani = grup(0, 0, 0, merkez); bacaDumani.userData.hareketli = true;
  if (a.dolu > .72) for (let i = 0; i < 4; i++) {
    const d = a.top(.5 + i * .12, 2.95 + i * .42, -1.25 - i * .1, .18 + i * .05, 0xeef2f0, bacaDumani, 1);
    d.castShadow = false; d.material = a.mal(0xeef2f0, { transparent: true, opacity: .8 - i * .16 });
    duman.push(d);
  }
  // Çeşme: taş ayna, lüle, yalak ve akan su
  const ce = grup(1.95, 0, .5, merkez);
  a.kutu(0, .8, -.1, 1, 1.4, .36, 0xbdb6a4, ce);
  a.silindir(0, 1.5, -.1, .5, .5, .36, 0xbdb6a4, ce, 16).rotation.x = Math.PI / 2;
  a.kutu(0, .95, .09, .56, .7, .04, 0xa39d8c, ce);
  a.silindir(0, 1.02, .16, .04, .04, .2, 0x8e8a7e, ce, 6).rotation.x = Math.PI / 2;
  a.silindir(0, .74, .26, .025, .025, .5, 0x8fd3dc, ce, 6);
  a.kutu(0, .3, .42, 1.3, .36, .6, 0xa39d8c, ce);
  a.kutu(0, .47, .42, 1.14, .04, .46, 0x6bbfc8, ce);
  a.engelEkle(1.95, .8, .78, .8);
  // Çamaşır ipi: iki direk arasında; Güneş'in turlarında çıkarılan giysiler asılır
  for (const x of [-2.55, -.25]) {
    a.silindir(x, .85, 1.75, .05, .06, 1.7, 0x8e6d45, merkez, 6);
    a.engelEkle(x, 1.95, .1, 0);
  }
  const ip = grup(-1.4, 1.6, 1.75, merkez); ip.userData.hareketli = true;
  a.kutu(0, 0, 0, 2.3, .02, .02, 0xefe7d6, ip);
  const cikarilanlar = a.masal?.yarisma?.gunesCikarir || ['battaniye', 'eldiven', 'atki', 'sapka', 'palto'];
  const asili = ruzgarda ? 0 : Math.min(cikarilanlar.length, Math.round((a.dolu - .5) / .5 * cikarilanlar.length));
  const GIYSI = {
    battaniye: g => { a.kutu(0, -.3, 0, .52, .56, .04, 0x9e5a8e, g); a.kutu(0, -.3, .025, .52, .06, .01, 0xe6c55c, g); a.kutu(0, -.3, .025, .06, .56, .01, 0xe6c55c, g); },
    eldiven: g => { for (const yon of [-1, 1]) { a.kutu(yon * .09, -.16, 0, .13, .22, .05, 0x5f9c5f, g); a.kutu(yon * .09, -.04, 0, .14, .05, .06, 0xf1e6c8, g); } },
    atki: g => { a.kutu(0, -.34, 0, .12, .64, .03, 0xd9483c, g); for (const y of [-.18, -.34, -.5]) a.kutu(0, y, .018, .12, .05, .01, 0xfff1e2, g); },
    sapka: g => { const s = a.top(0, -.14, 0, .15, 0x4f86b8, g, 1); s.scale.y = .9; a.silindir(0, -.24, 0, .16, .16, .06, 0x3a6c9b, g, 12); a.top(0, .03, 0, .06, 0xf2efe4, g, 1); },
    palto: g => { a.kutu(0, -.38, 0, .5, .7, .07, 0xe39a37, g); for (const yon of [-1, 1]) { const k = a.kutu(yon * .32, -.3, 0, .14, .5, .07, 0xc47824, g); k.rotation.z = yon * .25; }
                  for (const y of [-.22, -.38, -.54]) a.top(.06, y, .04, .025, 0x6e4a2c, g, 0); }
  };
  const asilanlar = [];
  cikarilanlar.slice(0, asili).forEach((k, i) => {
    const g = grup(-.9 + i * .46, 0, 0, ip);
    a.kutu(0, .02, 0, .05, .08, .04, 0xd9b27a, g);           // mandal
    (GIYSI[k] || GIYSI.palto)(g);
    asilanlar.push({ g, faz: i * .9 });
  });
  // Rüzgâr'ın yarısında boş ipte sallanan mandallar
  if (!asili) for (let i = 0; i < 4; i++) {
    const g = grup(-.8 + i * .52, 0, 0, ip); a.kutu(0, -.02, 0, .05, .09, .04, 0xd9b27a, g); asilanlar.push({ g, faz: i });
  }
  // Yolculuk bitti: Pofuduk paltosuz, çeşmenin başında oturuyor
  let pofuduk = null;
  if (a.dolu > .96) {
    const yer = grup(.9, .16, 1.65, merkez); yer.rotation.y = .35; yer.userData.hareketli = true;
    pofuduk = ayiModeli(a, yer, { olcek: .95 });
    a.engelEkle(.9, 1.85, .42, .5);
  }

  /* ——— Dere ve taş köprü ———
     Çeşmeden taşan su güneye akar; yol onu geniş bir taş köprüyle geçer. */
  const egri = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.95, 0, 1.4), new THREE.Vector3(1.7, 0, 3.2), new THREE.Vector3(1.2, 0, 5),
    new THREE.Vector3(1, 0, 6.8), new THREE.Vector3(1.2, 0, 8.6), new THREE.Vector3(1.7, 0, 10.6), new THREE.Vector3(2.2, 0, 12.6)]);
  function serit(genislik, renk, y) {
    const n = 60, sol = [], sag = [];
    egri.getPoints(n).forEach((p, i) => {
      const t = egri.getTangent(i / n), nx = -t.z, nz = t.x;
      sol.push(new THREE.Vector2(p.x + nx * genislik, -p.z - nz * genislik));
      sag.unshift(new THREE.Vector2(p.x - nx * genislik, -p.z + nz * genislik));
    });
    const m = a.cisim(new THREE.ShapeGeometry(new THREE.Shape([...sol, ...sag])), renk, 0, y, 0);
    m.rotation.x = -Math.PI / 2; m.castShadow = false; return m;
  }
  serit(.95, 0xcfc6a2, Z + .03); serit(.62, 0x6fb2c4, Z + .04); serit(.28, 0x9ad4de, Z + .05);
  {
    const kx = 1, kz = 6.8;
    const kopru = grup(kx, .45, kz);
    a.kutu(0, .36, 0, 2.6, .12, 3, 0xc9c1ab, kopru);                    // tabliye
    for (const yon of [-1, 1]) {
      a.kutu(0, .2, yon * 1.52, 2.6, .4, .16, 0xb5ad9a, kopru);          // kemerli yüzler
      a.kutu(0, .58, yon * 1.4, 2.6, .32, .18, 0xa9a18d, kopru);         // alçak korkuluk
      for (const x of [-1, 0, 1]) a.kutu(x, .78, yon * 1.4, .22, .12, .22, 0xcfc7b2, kopru);
    }
    a.yukseltiEkle(kx, kz, 1.3, 1.5, .86, { kutu: true });
    /* Korkuluklar gerçek duvar: köprüden dereye yandan yürünmez, alçak
       olduğu için üstünden zıplanır (tepesi yerden ~.64). */
    for (const yon of [-1, 1]) a.kutuEngel(kx, kz + yon * 1.4, 2.6, .2, 0, .64, false);
  }

  /* ——— Arka orta: koyunların otladığı çayır ——— */
  for (let i = 0; i < 14; i++) cicek(-3.2 + a.rast() * 6.4, -5.8 + a.rast() * 2.8, [0xf4f1e6, 0xf2de9d, 0xf4c9d6][i % 3]);

  /* ——— Uçan gökyüzü komşuları: arkada Savrun bulutu, Parlak güneşi ———
     Uzakta, oyun alanının gerisinde: yukarıdan bakınca haritayı örtmez. */
  const savrun = grup(-9.5, 6.2, -14);
  savrun.userData.hareketli = true;
  for (const [x, y, z, r] of [[0, 0, 0, 1.3], [1.2, .3, -.2, 1], [-1.1, .1, -.1, .95], [.3, .8, -.3, .9], [2.1, -.1, -.3, .7]]) {
    const m = a.top(x, y, z, r, 0xf6f8f6, savrun, 2); m.castShadow = false;
  }
  for (const yon of [-1, 1]) {
    a.top(-.3 + yon * .45, .25, 1.05, .14, 0x3b4a52, savrun, 1).castShadow = false;
    a.top(-.3 + yon * .8, -.2, .95, .26, 0xf2b8b2, savrun, 1).castShadow = false;
  }
  a.top(-1.25, -.15, .9, .16, 0xc9716a, savrun, 1).castShadow = false;
  const parlak = grup(9.5, 6.8, -14);
  parlak.userData.hareketli = true;
  const disk = a.top(0, 0, 0, 1.25, 0xffd45c, parlak, 2); disk.castShadow = false; disk.material = a.mal(0xffd45c, { emissive: 0xf2a23a, emissiveIntensity: .35 });
  const isinlar = grup(0, 0, -.1, parlak);
  for (let i = 0; i < 12; i++) {
    const r = a.cisim(new THREE.ConeGeometry(.2, .7, 6), 0xf6b544, 0, 0, 0, isinlar);
    const aci = i / 12 * Math.PI * 2; r.position.set(Math.cos(aci) * 1.65, Math.sin(aci) * 1.65, 0);
    r.rotation.z = aci - Math.PI / 2; r.castShadow = false;
  }
  for (const yon of [-1, 1]) a.top(yon * .42, .2, 1.1, .13, 0x3b3226, parlak, 1).castShadow = false;
  a.top(0, -.35, 1.12, .2, 0xd9633f, parlak, 1).scale.set(1.4, .5, .5);

  /* ——— İtilebilir nesneler: saman balyaları, su fıçıları, toplar, koyunlar ——— */
  if (a.itilebilir) {
    const koy = (o) => { if (!a.yolaYakin(o.x, o.z, (o.r || .4) + .2)) a.itilebilir(o); };
    [[-9.8, -1.6, .3], [-4.6, -1.4, 1.2], [6, -1.2, .6]].forEach(([x, z, yon]) => koy({ x, z, r: .5, tip: 'balya', renk: 0xe3c46e, yon }));
    [[3.7, -.9], [3.6, 1.3]].forEach(([x, z]) => koy({ x, z, r: .34, tip: 'fici', renk: 0x9c6b43 }));
    [[-3.4, 4.4, 0xd9483c], [1.2, -4, 0x4f86b8]].forEach(([x, z, renk]) => koy({ x, z, r: .38, tip: 'top', renk, ikinci: 0xfff1e2 }));
    [[-1.4, -4.8, .4], [.8, -4.4, -.6], [2.6, -5.2, 2.4]].forEach(([x, z, yon]) =>
      koy({ x, z, r: .42, tip: 'hayvan', yon, model: g => koyunModeli(a, g, { olcek: .95 }) }));
  }

  return {
    tik: t => {
      /* Değirmen: Rüzgâr'ın yarısında hızlı, Güneş'in yarısında usul usul. Mutlak açı: kayma olmaz. */
      const hiz = ruzgarda ? 2.6 : .55, sallanma = ruzgarda ? .16 : .045;
      for (const h of hareketli) {
        if (h.tip === 'degirmen') h.o.rotation.z = -t * hiz;
        else if (h.tip === 'agac') { h.o.rotation.z = Math.sin(t * (ruzgarda ? 2.2 : 1) + h.faz) * sallanma - (ruzgarda ? .08 : 0); h.o.rotation.x = Math.cos(t * 1.3 + h.faz) * sallanma * .4; }
        else if (h.tip === 'gul') h.o.rotation.y = Math.sin(t * .4) * 1.4 + t * (ruzgarda ? .6 : .1);
      }
      for (const s of asilanlar) s.g.rotation.x = Math.sin(t * (ruzgarda ? 4 : 1.6) + s.faz) * (ruzgarda ? .5 : .14);
      duman.forEach((d, i) => { d.position.y = 2.95 + i * .42 + Math.sin(t * .8 + i) * .1; });
      savrun.position.y = 6.2 + Math.sin(t * .9) * .25; savrun.rotation.z = Math.sin(t * .7) * .06;
      parlak.position.y = 6.8 + Math.sin(t * .6 + 1) * .15; isinlar.rotation.z = t * .15;
      if (pofuduk) pofuduk.userData.kafa.rotation.y = Math.sin(t * .5) * .3;
    }
  };
}

export default { 'yayla-yolu': yaylaYolu };

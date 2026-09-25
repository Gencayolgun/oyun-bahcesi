/* Çiftçi Fare — çiftlik haritası (MEKANLAR.ciftlik).

   giris.js bunu ÇALIŞMA ANINDA MEKANLAR'a kaydeder (mekanlar.js'e
   dokunulmaz). Harita docs/ciftci-fare-plani.md "Harita" bölümüne göre:

     ölçek 1.8 (tarif.olcek): düz alan x ±32 z ±24.6, yürünebilir x ±47 z ±35.8
     dış çit x ±22, z ±17 (h .84: üstünden zıplanır), güneyde ziyaret kapısı (6,17)
     veranda (0,10): başlangıç, arkasında çiftlik evi (0,13.9)
     konu köşesi (0,0): taş halka, konu parseli, boy çubuğu, tabela (gerçek engel)
     tarla (batı): t1 (-10,-3) buğday, t2 (-6,-3) domates, korkuluk (-15,-8)
     kuyu (-6,4), ambar (-12,7) ve güney duvarında hasat rafı
     kümes ve avlu (x 9..16, z 3..10), kapısı batıda (kapalı); yemlik, suluk
       ve folluk çitin DIŞ yüzünde (x≈8.3); 3 tavuk + 1 horoz avluda
     Dede Ceviz (10,-8); ahır ve otlak için boş yer (x -2..8, z -16..-11)
     komşu yolu: kapıdan tepelere çıkan toprak yol, uzakta komşu çatıları

   KURALLAR (plan):
   - Çit içi DÜZ: çitin içinde hiçbir yükselti yok (test: 1 birimlik
     ızgaranın her noktasında zeminY === ZEMIN). Tırmanılacak yerler
     (saman yığını) çitin dışında.
   - Binalar kutuEngel ile gerçek çarpışmalı; kamerayı çekmezler (kamera
     yüksek ve eğik, binaların üstünden bakar: kamera=false).
   - Değişecek her şey (parseller, tabela, raf, bayrak, folluk kapağı)
     userData.hareketli taşıyan gruplarda: otomatik instancing onları
     toplamasın. Parsel malzemeleri a.mal(renk, {name:'parsel-<id>'}).
   - Yollar, parseller, binalar ve komşu yolu otYok(x, z) ile işaretli:
     motor oraya ot, ağaç, kaya ve çim saçmaz.

   ÇİZİM BÜTÇESİ: her bina/yapı kendi grubunda kurulur ve birlestir.js
   ile tek mesh'e iner (renkler köşe renginde). Tekrarlayan küçük parçalar
   (çit direkleri, kazıklar, çiçekler) ortak birim geometriyle kurulur;
   motorun otomatik instancing'i onları tek çizime toplar.

   Dışarıya: a.masal.ciftlik = tutamak (giris.js ve 1b için): hayvanlar,
   parsel grupları, raf, tabela, noktalar, arac ({THREE, mal, ZEMIN}: 1b'de
   yansit.js durumu bu gruplara çizer: bitkiler, yem, yumurta, hasat yığını,
   Dede Ceviz'in meyveleri), zeminY (sınama için), kare(),
   örten yapılar (ortuculer, ortucuGuncelle) ve kurulum sonrası düzeltmeler
   (sadelestir, tacKamerasi, bulutlariTasi).

   KAMERA KUZEYE SABİT: çiftlikte tuval sürüklemesi kamerayı döndürmez ve
   motorun omuz kamerası yürürken yönü izlemez; kamera hep farenin
   güneyinde, ~6 birim yukarıda. Bu yüzden (1) fare bir yapının kuzeyinde
   kalınca yapı saydamlaşır, (2) tepe ormanındaki ağaç taçları kamerayı
   fareye yaklaştırır, (3) motorun alçak süs bulutları yukarı taşınır. */

import {birlestir} from './birlestir.js';
import {tavukModeli, horozModeli, TAVUK_RENKLERI} from './hayvan3b.js';
import {SAMAN, SAMAN_KOYU, SAMAN_ORGU} from './fare.js';

export const OLCEK = 1.8;
export const CIT = { x: 22, z: 17, h: .84 };
export const KAPI = { x: 6, z: 17, en: 3 };
export const AVLU = { x0: 9, x1: 16, z0: 3, z1: 10, kapiZ0: 5.8, kapiZ1: 7.2 };
export const KUMES_EVI = { x: 14.5, z: 8.5, w: 3, d: 3 };
export const EV = { x: 0, z: 13.9, w: 5.4, d: 3.2 };
export const AMBAR = { x: -12, z: 7, w: 4.6, d: 5.2 };
export const PARSEL_YERI = {
  konu: { x: 0, z: 0, en: 2.4 },
  t1: { x: -10, z: -3, en: 3.2 },
  t2: { x: -6, z: -3, en: 3.2 }
};
/* İş ve yer noktaları (dünya koordinatı). 1b'de yakınlık ve otomatik yürüyüş
   hedefleri buradan okunur. Hiçbiri çitle kapalı bir alanın içinde değil. */
export const NOKTALAR = Object.freeze({
  veranda: { x: 0, z: 10 },
  konu: { x: 0, z: 1.9 },
  t1: { x: -10, z: -.9 },
  t2: { x: -6, z: -.9 },
  kuyu: { x: -6, z: 5.2 },
  ambar: { x: -9.1, z: 7 },
  kumes: { x: 7.6, z: 6.5 },
  yemlik: { x: 7.7, z: 5.05 },
  suluk: { x: 7.7, z: 8 },
  folluk: { x: 7.7, z: 3.9 },
  dede: { x: 10, z: -6.7 },
  pano: { x: 4.2, z: 9.7 },
  kapi: { x: 6, z: 16.2 },
  korkuluk: { x: -15, z: -7 }
});
/* Toprak yollar: [genişlik, noktalar]. */
export const YOLLAR = [
  { en: 1.5, n: [[0, 10.7], [0, 2.35]] },                                  // veranda → konu köşesi
  { en: 1.5, n: [[-9.4, 6.95], [0, 6.8], [8.15, 6.5]] },                  // ambar → kümes kapısı
  { en: 1.4, n: [[-2.1, .35], [-5.5, .1], [-12.2, .1]] },                  // konu köşesi → tarla
  { en: 1.3, n: [[2.9, 11.2], [5.1, 12.4], [6, 14.4], [6, 17.3]] }         // evin sağından ziyaret kapısına
];
/* Komşu yolu: kapıdan güneye, tepelere tırmanıp uzaktaki komşu evlerine. */
export const KOMSU_YOLU = [[6, 16.6], [6, 24], [6.8, 30], [8.4, 36], [10, 42], [11, 48]];

/* ——— otYok: motor bu noktalara ot, ağaç, kaya, çim saçmaz ——— */
const DIKDORTGENLER = [
  [-3.2, 10.1, 3.2, 16],        // ev + veranda
  [2.9, 9.7, 5.4, 11.3],        // posta kutusu + pano
  [-3.7, 9.8, -2.3, 11.2],      // sembol bayrağı
  [-14.9, 3.8, -8.4, 10.2],     // ambar + önündeki raf
  [7.4, 2.4, 16.7, 10.7],       // avlu + çitin dışındaki yemlik, suluk, folluk
  [-12.3, -5.3, -3.7, -.7],     // tarla parselleri t1, t2
  [-28.6, 1.9, -24.4, 6.1]      // saman yığını (çitin dışında)
];
const DAIRELER = [
  [0, 0, 2.8],                  // konu köşesi (taş halka)
  [-2.45, 1.35, .7],            // tabela
  [-6, 4, 1.35],                // kuyu
  [-15, -8, .9],                // korkuluk
  [10, -8, 1.4],                // Dede Ceviz'in gövdesi
  [4.5, 17, 1], [7.5, 17, 1]    // kapı direkleri
];
function parcayaUzaklik(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
  const t = L2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)) : 0;
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
}
function hattaYakin(x, z, n, pay) {
  for (let i = 0; i + 1 < n.length; i++) if (parcayaUzaklik(x, z, n[i][0], n[i][1], n[i + 1][0], n[i + 1][1]) < pay) return true;
  return false;
}
export function otYok(x, z) {
  for (const [x0, z0, x1, z1] of DIKDORTGENLER) if (x > x0 && x < x1 && z > z0 && z < z1) return true;
  for (const [cx, cz, r] of DAIRELER) if (Math.hypot(x - cx, z - cz) < r) return true;
  for (const y of YOLLAR) if (hattaYakin(x, z, y.n, y.en / 2 + .35)) return true;
  if (z > 15.5 && hattaYakin(x, z, KOMSU_YOLU, 1.9)) return true;
  return false;
}

/* ——— Arazi: dunya.js'in yükseklik işlevinin BİREBİR kopyası ———
   Komşu yolu tepeye çıkarken arazinin üstünde dursun diye. Motor değişirse
   burası da değişmeli (tests/ciftlik-dunya.spec.js motorun yürüyüşte ölçtüğü
   yükseklikle karşılaştırır). */
export function araziYuksekligi(x, z, olcek = OLCEK) {
  const RX = 13.4 * olcek, RZ = 10.2 * olcek;
  const r = Math.hypot(x / RX, z / RZ);
  const d = Math.max(0, Math.min(1, (r - 1.34) / .95));
  if (d === 0) return 0;
  const yumusak = d * d * (3 - 2 * d);
  const KI = 34 * olcek, KD = 46 * olcek, KE = 12 * olcek;
  const u = Math.hypot(x, z), kenar = u < KI ? 1 : u > KD ? 0 : 1 - (u - KI) / KE;
  return kenar * yumusak * ((Math.sin(x * .085) * Math.cos(z * .105) * 2.2 +
                    Math.sin(x * .19 + 1.3) * Math.cos(z * .16 + .7) * .95 +
                    Math.sin(x * .41 + 2.1) * .35) * .72 + 2.6);
}
/* Arazi mesh'inin (150×150 bölüt) o noktadaki GERÇEK çizilen yüksekliği:
   üçgen içi doğrusal ara değer. Yol şeridi mesh'in içine gömülmesin. */
function araziMeshYuksekligi(x, z, olcek = OLCEK) {
  const yari = 48 * olcek, hucre = 96 * olcek / 150;
  const fx = (x + yari) / hucre, fz = (z + yari) / hucre;
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const h = (ii, jj) => araziYuksekligi(-yari + ii * hucre, -yari + jj * hucre, olcek);
  if (u + v <= 1) { const a = h(i, j); return a + (h(i + 1, j) - a) * u + (h(i, j + 1) - a) * v; }
  const c = h(i + 1, j + 1);
  return c + (h(i, j + 1) - c) * (1 - u) + (h(i + 1, j) - c) * (1 - v);
}

/* ——— Ortak geometriler (modül düzeyinde, kalıcı) ——— */
const GEO = new Map();
function geo(anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}
/* Üçgen prizma: x boyunca uzanır (-.5..5), taban y=0'da z -.5..5, tepe y=1.
   Çatı altı üçgeni (alınlık), kuyu çatısı, komşu evleri. */
function prizmaGeo(THREE) {
  const p = [[-.5, 0, -.5], [-.5, 0, .5], [-.5, 1, 0], [.5, 0, -.5], [.5, 0, .5], [.5, 1, 0]];
  const yuzler = [[0, 1, 2], [3, 5, 4], [0, 4, 1], [0, 3, 4], [1, 5, 2], [1, 4, 5], [0, 5, 3], [0, 2, 5]];   // dışa bakar
  const k = [];
  for (const f of yuzler) for (const i of f) k.push(...p[i]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(k, 3));
  g.computeVertexNormals();
  return g;
}

function atolye(a) {
  const { THREE } = a;
  const kutuG = geo('kutu', () => new THREE.BoxGeometry(1, 1, 1));
  const silG = (n, ust = 1, acik = false) => geo(`sil${n}|${ust}|${acik}`, () => new THREE.CylinderGeometry(ust, 1, 1, n, 1, acik));
  const kureG = d => geo('kure' + d, () => new THREE.IcosahedronGeometry(1, d));
  const koniG = n => geo('koni' + n, () => new THREE.ConeGeometry(1, 1, n));
  const prizmaG = geo('prizma', () => prizmaGeo(THREE));
  const ekle = (g, renk, e, ek) => {
    const m = new THREE.Mesh(g, a.mal(renk, ek)); m.castShadow = true; m.receiveShadow = true; e.add(m); return m;
  };
  return {
    /* Kutu: (x, y, z) merkez; w×h×d; ry: y ekseninde dönüş. */
    blok(e, renk, x, y, z, w, h, d, ry = 0) {
      const m = ekle(kutuG, renk, e); m.position.set(x, y, z); m.scale.set(w, h, d); m.rotation.y = ry; return m;
    },
    /* Silindir: (x, y, z) merkez, alt yarıçap r, üst yarıçap r*ust, boy h. */
    sil(e, renk, x, y, z, r, h, n = 8, ust = 1, acik = false) {
      const m = ekle(silG(n, ust, acik), renk, e); m.position.set(x, y, z); m.scale.set(r, h, r); return m;
    },
    kure(e, renk, x, y, z, sx, sy = sx, sz = sx, d = 1) {
      const m = ekle(kureG(d), renk, e); m.position.set(x, y, z); m.scale.set(sx, sy, sz); return m;
    },
    /* Yatay halka (leğen ağzı, kova kenarı): R ana yarıçap, r boru kalınlığı. */
    halka(e, renk, x, y, z, R, r) {
      const m = ekle(geo(`halka${R}|${r}`, () => new THREE.TorusGeometry(R, r, 5, 20).rotateX(Math.PI / 2)), renk, e); m.position.set(x, y, z); return m;
    },
    koni(e, renk, x, y, z, r, h, n = 6) {
      const m = ekle(koniG(n), renk, e); m.position.set(x, y, z); m.scale.set(r, h, r); return m;
    },
    /* Prizma: tabanı y'de, boy L (x), yükseklik H, genişlik W (z). */
    prizma(e, renk, x, y, z, L, H, W, ry = 0) {
      const m = ekle(prizmaG, renk, e); m.position.set(x, y, z); m.scale.set(L, H, W); m.rotation.y = ry; return m;
    },
    /* İki nokta arasında çubuk. */
    cubuk(e, renk, p, q, r, n = 5) {
      const a0 = new THREE.Vector3(...p), b0 = new THREE.Vector3(...q), yon = b0.clone().sub(a0);
      const m = ekle(silG(n), renk, e);
      m.scale.set(r, yon.length(), r); m.position.copy(a0).add(b0).multiplyScalar(.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), yon.normalize());
      return m;
    },
    grup(x, z, ry = 0, ebeveyn = a.dunya, y = a.ZEMIN) {
      const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; ebeveyn.add(g); return g;
    }
  };
}

/* Beşgen gövde (duvar + alınlık) — ExtrudeGeometry ile, x boyunca uzanır.
   profil: [[z, y], ...] kesit; uzunluk: x yönünde. Merkezde (0, 0, 0). */
function govdeGeo(THREE, anahtar, profil, uzunluk) {
  return geo('govde-' + anahtar, () => {
    const s = new THREE.Shape(profil.map(([u, v]) => new THREE.Vector2(u, v)));
    const g = new THREE.ExtrudeGeometry(s, { depth: uzunluk, bevelEnabled: false });
    g.translate(0, 0, -uzunluk / 2);
    g.rotateY(Math.PI / 2);               // derinlik (yerel z) → dünya x; kesit u → -z
    return g;
  });
}

/* Düz şerit (yol, kenar): çoklu çizgiden XZ düzleminde üçgenler; köşeler yuvarlak. */
function seritGeo(THREE, hatlar, y) {
  const k = [];
  const tri = (a, b, c) => k.push(a[0], y, a[1], b[0], y, b[1], c[0], y, c[1]);
  for (const { en, n } of hatlar) {
    const r = en / 2;
    for (let i = 0; i + 1 < n.length; i++) {
      const [ax, az] = n[i], [bx, bz] = n[i + 1];
      const L = Math.hypot(bx - ax, bz - az) || 1, nx = -(bz - az) / L * r, nz = (bx - ax) / L * r;
      const p1 = [ax + nx, az + nz], p2 = [bx + nx, bz + nz], p3 = [bx - nx, bz - nz], p4 = [ax - nx, az - nz];
      tri(p1, p2, p3); tri(p1, p3, p4);                 // üstten bakınca saat yönü tersi
    }
    for (const [cx, cz] of n) {                         // uç ve köşe yuvarlakları
      const S = 12;
      for (let s = 0; s < S; s++) {
        const a0 = s / S * Math.PI * 2, a1 = (s + 1) / S * Math.PI * 2;
        tri([cx, cz], [cx + Math.cos(a1) * r, cz + Math.sin(a1) * r], [cx + Math.cos(a0) * r, cz + Math.sin(a0) * r]);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(k, 3));
  const nrm = new Float32Array(k.length); for (let i = 1; i < nrm.length; i += 3) nrm[i] = 1;
  g.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
  g.computeBoundingSphere();
  return g;
}
/* Araziye oturan şerit (komşu yolu): her örnekte iki kenar noktası, arazi mesh'inin yüksekliğinde. */
function tepeSeridiGeo(THREE, n, en, olcek) {
  const egri = new THREE.CatmullRomCurve3(n.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', .5);
  const S = Math.ceil(egri.getLength() / .5), k = [], idx = [];
  for (let i = 0; i <= S; i++) {
    const p = egri.getPoint(i / S), t = egri.getTangent(i / S), nx = -t.z * en / 2, nz = t.x * en / 2;
    for (const s of [1, -1]) {
      const x = p.x + nx * s, z = p.z + nz * s;
      k.push(x, .55 + araziMeshYuksekligi(x, z, olcek) + .045, z);
    }
    if (i) { const b = (i - 1) * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(k, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* ——— Renkler ——— */
const R = {
  toprakYol: 0xc9a473, yolOrta: 0xd8bb8a, avlu: 0xcdb183,
  tahta: 0xb88a5a, tahtaKoyu: 0x94683f, tahtaAcik: 0xd6b27f, direk: 0x9c7348,
  duvar: 0xf3e7cc, duvarTaban: 0xb3a58c, kiremit: 0xc2553c, kiremitKoyu: 0xa4452f,
  pencere: 0x9fcbd8, cerceve: 0xfbf6ea, panjur: 0x6f9e63, kapi: 0x8a5a36, tugla: 0xb46a4c,
  ambar: 0xb3402e, ambarKoyu: 0x8f3325, ambarCati: 0x5f4a42, beyaz: 0xf4ecdc,
  kumes: 0xc4874f, kumesCati: 0x7d4a36,
  tas: 0xaaa99b, tasKoyu: 0x8e8d80, su: 0x5f8f9c,
  toprakYatak: 0x5f3e2a, toprakTumsek: 0x7b5337, kenarTahta: 0x857056,
  yaprak: 0x55874a, yaprakAcik: 0x6f9e56, yaprakKoyu: 0x46733f, kabuk: 0x6f5a47,
  ceviz: 0x7f9d4c, cevizKabuk: 0xb6c35e, cevizKahve: 0x8d6a3f, saman: 0xe6c66e, samanKoyu: 0xc9a44e, cicek: [0xe8636b, 0xf2c14e, 0xf4f1e8, 0xc58fd6, 0xf29b54]
};

/* ═══════════════════ ÇİFTLİK ═══════════════════ */
export function ciftlikMekani(a) {
  const basla = performance.now();
  const { THREE, ZEMIN } = a;
  const olcek = a.RX / 13.4;
  const k = atolye(a);
  const yukseltiler = [];
  const yukselti = (x, z, rx, rz, ust, ek) => { yukseltiler.push({ x, z, rx, rz, ust, ...(ek || {}) }); a.yukseltiEkle(x, z, rx, rz, ust, ek); };
  const hareketliGrup = (x, z, ry = 0, ad = '') => { const g = k.grup(x, z, ry); g.userData.hareketli = true; g.name = ad; return g; };
  /* Statik yapı: kur(g) içinde yerel koordinatla çizilir, sonra tek mesh'e iner. */
  const yapi = (ad, x, z, ry, kur) => { const g = k.grup(x, z, ry); g.name = ad; kur(g); birlestir(a, g, { ad }); return g; };

  /* ——— Zemin boyaları: yollar, avlu, veranda önü ——— */
  /* Zemin boyası: arazinin bir tık üstünde ve derinlik öncelikli (okulun GPU'sunda benek benek titremesin). */
  const boya = kat => ({ polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 - kat * 2 });
  {
    const yol = new THREE.Mesh(seritGeo(THREE, YOLLAR, ZEMIN + .008), a.mal(R.toprakYol, boya(0)));
    yol.receiveShadow = true; yol.castShadow = false; a.dunya.add(yol);
    const orta = new THREE.Mesh(seritGeo(THREE, YOLLAR.map(y => ({ en: y.en * .42, n: y.n })), ZEMIN + .012), a.mal(R.yolOrta, boya(1)));
    orta.receiveShadow = true; orta.castShadow = false; a.dunya.add(orta);
    // Avlunun sıkışmış toprağı ve kapı önü
    const avlu = new THREE.Mesh(seritKare(THREE, AVLU.x0, AVLU.z0, AVLU.x1, AVLU.z1, ZEMIN + .01), a.mal(R.avlu, boya(1)));
    avlu.receiveShadow = true; avlu.castShadow = false; a.dunya.add(avlu);
    // Komşu yolu: kapıdan tepelere
    const komsu = new THREE.Mesh(tepeSeridiGeo(THREE, KOMSU_YOLU, 1.6, olcek), a.mal(R.toprakYol, boya(2)));
    komsu.receiveShadow = true; komsu.castShadow = false; a.dunya.add(komsu);
  }

  /* ——— Dış çit (x ±22, z ±17), güneyde ziyaret kapısı ——— */
  const citHatti = (x0, z0, x1, z1, { bosluk = [], direkRenk = R.direk, renk = R.tahta, adim = 1.1, kalin = .14 } = {}) => {
    const L = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / L, dz = (z1 - z0) / L, ry = Math.atan2(-dz, dx);
    const direkler = new Set([0, L]);
    for (let t = adim; t < L - .3; t += adim) direkler.add(+t.toFixed(3));
    const bolumler = []; let bas = 0;
    for (const [b0, b1] of bosluk) { bolumler.push([bas, b0]); bas = b1; direkler.add(b0); direkler.add(b1); }
    bolumler.push([bas, L]);
    for (const t of direkler) {
      if (bosluk.some(([b0, b1]) => t > b0 + .01 && t < b1 - .01)) continue;
      k.blok(a.dunya, direkRenk, x0 + dx * t, ZEMIN + .4, z0 + dz * t, .13, .9, .13, ry);
    }
    for (const [s0, s1] of bolumler) {
      if (s1 - s0 < .05) continue;
      const m = (s0 + s1) / 2, cx = x0 + dx * m, cz = z0 + dz * m, u = s1 - s0;
      k.blok(a.dunya, renk, cx, ZEMIN + .3, cz, u, .1, .07, ry);
      k.blok(a.dunya, renk, cx, ZEMIN + .64, cz, u, .11, .07, ry);
      a.kutuEngel(cx, cz, u, kalin, ry, CIT.h, false);
    }
  };
  citHatti(-CIT.x, -CIT.z, CIT.x, -CIT.z);                                     // kuzey
  citHatti(CIT.x, -CIT.z, CIT.x, CIT.z);                                       // doğu
  citHatti(-CIT.x, -CIT.z, -CIT.x, CIT.z);                                     // batı
  citHatti(-CIT.x, CIT.z, CIT.x, CIT.z, { bosluk: [[CIT.x + KAPI.x - KAPI.en / 2, CIT.x + KAPI.x + KAPI.en / 2]] });   // güney

  /* Ziyaret kapısı: iki uzun direk, üstte kiriş, dışa açılmış iki kanat. */
  yapi('ziyaret-kapisi', KAPI.x, KAPI.z, 0, g => {
    for (const s of [-1, 1]) {
      k.blok(g, R.tahtaKoyu, s * KAPI.en / 2, .85, 0, .22, 1.7, .22);
      k.kure(g, R.tahtaKoyu, s * KAPI.en / 2, 1.74, 0, .14, .1, .14, 0);
    }
    k.blok(g, R.tahta, 0, 1.62, 0, KAPI.en + .5, .16, .18);
    k.blok(g, R.tahtaAcik, 0, 1.86, 0, 1.3, .36, .08);                        // küçük tabela (1d: iki fare)
    for (const s of [-1, 1]) {                                               // kanatlar dışa (güneye) açık
      const aci = s < 0 ? Math.PI * .42 : Math.PI - Math.PI * .42;
      const dx = Math.cos(aci), dz = Math.sin(aci), ry = Math.atan2(-dz, dx), L = KAPI.en / 2 - .1;
      const cx = s * KAPI.en / 2 + dx * (L / 2 + .12), cz = dz * (L / 2 + .12);
      for (const y of [.3, .66]) k.blok(g, R.tahta, cx, y, cz, L, .1, .06, ry);
      for (let i = 0; i < 4; i++) {
        const t = .12 + i * (L - .1) / 3;
        k.blok(g, R.tahtaAcik, s * KAPI.en / 2 + dx * (t + .12), .48, dz * (t + .12), .08, .62, .05, ry);
      }
      a.kutuEngel(KAPI.x + cx, KAPI.z + cz, L, .12, ry, CIT.h, false);
    }
  });
  for (const s of [-1, 1]) a.engelEkle(KAPI.x + s * KAPI.en / 2, KAPI.z, .16, 0);

  /* ——— Çiftlik evi ve veranda ——— */
  const evGovde = govdeGeo(THREE, 'ev', [[-EV.d / 2, 0], [EV.d / 2, 0], [EV.d / 2, 1.75], [0, 2.75], [-EV.d / 2, 1.75]], EV.w);
  const evYapi = yapi('ev', EV.x, EV.z, 0, g => {
    const m = new THREE.Mesh(evGovde, a.mal(R.duvar)); m.castShadow = m.receiveShadow = true; g.add(m);
    k.blok(g, R.duvarTaban, 0, .16, 0, EV.w + .06, .32, EV.d + .06);          // taş taban
    // Çatı: iki eğik kiremit yüzey, saçak taşar
    const egim = Math.atan2(1, EV.d / 2), yuzey = Math.hypot(1, EV.d / 2) + .45;
    for (const s of [-1, 1]) {
      const c = k.blok(g, R.kiremit, 0, 2.27, s * (EV.d / 4 + .1), EV.w + .7, .14, yuzey);
      c.rotation.x = s * egim;
      for (let i = 0; i < 4; i++) {                                          // kiremit sıraları
        const sr = k.blok(g, R.kiremitKoyu, 0, 2.27, s * (EV.d / 4 + .1), EV.w + .72, .04, .1);
        sr.rotation.x = s * egim; sr.translateY(.085); sr.translateZ(-yuzey / 2 + .3 + i * (yuzey - .5) / 3);
      }
    }
    k.blok(g, R.kiremitKoyu, 0, 2.83, 0, EV.w + .76, .12, .2);               // mahya
    k.blok(g, R.tugla, 1.4, 2.8, .55, .45, 1.2, .45);                        // baca
    k.blok(g, R.tasKoyu, 1.4, 3.42, .55, .55, .1, .55);
    // Ön yüz (z = -d/2): kapı, iki pencere, çiçeklik
    const on = -EV.d / 2 - .02;
    k.blok(g, R.cerceve, 0, .78, on, 1.02, 1.54, .06);
    k.blok(g, R.kapi, 0, .75, on - .02, .86, 1.44, .06);
    k.kure(g, 0xe6c04a, .28, .75, on - .07, .04, .04, .04, 0);                 // kapı tokmağı
    for (const s of [-1, 1]) {
      const px = s * 1.65;
      k.blok(g, R.cerceve, px, 1.12, on, .98, .86, .06);
      k.blok(g, R.pencere, px, 1.12, on - .02, .8, .7, .05);
      k.blok(g, R.cerceve, px, 1.12, on - .045, .06, .7, .03);
      k.blok(g, R.cerceve, px, 1.12, on - .045, .8, .06, .03);
      for (const t of [-1, 1]) k.blok(g, R.panjur, px + t * .64, 1.12, on - .03, .3, .86, .05);
      k.blok(g, R.tahtaKoyu, px, .62, on - .14, .96, .18, .26);               // çiçeklik
      for (let i = 0; i < 5; i++) k.kure(g, R.cicek[(i + (s > 0 ? 2 : 0)) % 5], px - .36 + i * .18, .77, on - .15, .085, .07, .085, 0);
    }
    // Yan pencereler
    for (const s of [-1, 1]) {
      k.blok(g, R.cerceve, s * (EV.w / 2 + .02), 1.12, 0, .06, .8, .9);
      k.blok(g, R.pencere, s * (EV.w / 2 + .04), 1.12, 0, .05, .64, .74);
    }
  });
  /* Veranda ayrı yapı: ev saydamlaşınca (ortucu) farenin bastığı döşeme saydamlaşmasın. */
  yapi('veranda', EV.x, EV.z, 0, g => {
    const on = -EV.d / 2 - .02;
    // Veranda: yere oturan tahta döşeme (yükselti değil: çit içi düz kalır)
    for (let i = 0; i < 9; i++) k.blok(g, i % 2 ? R.tahtaAcik : R.tahta, 0, .035, -EV.d / 2 - .15 - i * .29, 5.2, .07, .28);
    k.blok(g, 0xb0584a, 0, .075, on - .5, .9, .02, .55);                      // kapı paspası
    // Bank ve saksılar
    k.blok(g, R.tahtaKoyu, 1.9, .42, on - .35, 1.3, .08, .42);
    for (const x of [1.35, 2.45]) k.blok(g, R.tahtaKoyu, x, .2, on - .35, .08, .4, .36);
    k.blok(g, R.tahtaKoyu, 1.9, .7, on - .15, 1.3, .36, .06);
    for (const x of [-2.25, 2.25]) {                                          // verandanın ön köşelerinde saksılar
      k.sil(g, 0xc0643f, x, .2, -3.85, .2, .4, 8, 1.25);
      k.kure(g, R.yaprakAcik, x, .52, -3.85, .26, .22, .26);
      k.kure(g, R.cicek[x < 0 ? 0 : 1], x + .08, .66, -3.8, .09, .08, .09, 0);
    }
  });
  a.kutuEngel(EV.x, EV.z, EV.w, EV.d, 0, undefined, false);
  /* Ev kamerayı biraz çeker: fare verandada kuzeye bakarken kamera evin
     çatısının üstünde kalıp ekranın yarısını kiremitle doldurmasın; fareye
     yaklaşır (çatı kameranın arkasında kalır), fare evden uzaklaşınca
     kamera yine açılır. Çarpışma dairesi evin kutusunun içinde (etkisiz).
     Kamera dairesi 1.75: açılışta (0, 10) kamera saçağın ÖNÜNDE durur
     (1.35'te ekranın altında düz turuncu bir saçak şeridi kalıyordu).
     Fare kapıya daha çok yaklaşınca kamera en yakın sınırına (.34) dayanır;
     o zaman ev saydamlaşır (aşağıda "Örten yapılar"). */
  a.engelEkle(EV.x, EV.z, .05, 1.75);
  a.kutuEngel(EV.x + 1.9, EV.z - EV.d / 2 - .37, 1.35, .45, 0, .75, false);  // bank (üstüne zıplanır)
  for (const x of [-2.25, 2.25]) a.engelEkle(x, EV.z - 3.85, .26, 0, .7);

  /* Duman: bacadan (saydam, tik ile oynar) */
  const duman = [];
  {
    const g = hareketliGrup(EV.x + 1.4, EV.z + .55, 0, 'duman');
    g.position.y = ZEMIN + 3.5;
    for (let i = 0; i < 3; i++) {
      const d = new THREE.Mesh(geo('duman', () => new THREE.IcosahedronGeometry(1, 1)), a.mal(0xf1f1ec, { transparent: true, opacity: .62 - i * .15 }));
      d.scale.setScalar(.2 + i * .08); d.position.set(i * .12, .2 + i * .42, -i * .08); g.add(d); duman.push(d);
    }
  }

  /* Posta kutusu ve ziyaretçi panosu (3.5, 10.5) */
  yapi('posta', 3.5, 10.5, 0, g => {
    k.blok(g, R.direk, 0, .5, 0, .1, 1, .1);
    k.blok(g, 0x4d7fb0, 0, 1.08, 0, .34, .26, .46);
    k.sil(g, 0x4d7fb0, 0, 1.2, 0, .17, .46, 10).rotation.x = Math.PI / 2;
    k.blok(g, 0xd9483a, .19, 1.22, .08, .03, .28, .06);                       // bayrakçık
  });
  a.engelEkle(3.5, 10.5, .2, 0);
  const pano = hareketliGrup(4.65, 10.75, -.25, 'pano');                    // ziyaretçi çıkartmaları (1d)
  for (const s of [-1, 1]) k.blok(pano, R.direk, s * .6, .65, 0, .09, 1.3, .09);
  k.blok(pano, R.tahtaKoyu, 0, 1.05, 0, 1.36, .82, .08);
  k.blok(pano, 0xd7b27a, 0, 1.05, -.03, 1.2, .66, .05);                      // mantar pano
  k.prizma(pano, R.kiremit, 0, 1.46, 0, 1.55, .26, .28);
  a.kutuEngel(4.65, 10.75, 1.4, .2, -.25, undefined, false);

  /* Sembol bayrağı (-3, 10.5): direk + çocuğun renginde bayrak (dalgalanır) */
  const bayrak = hareketliGrup(-3, 10.5, 0, 'bayrak');
  k.sil(bayrak, R.cerceve, 0, 1.3, 0, .045, 2.6, 6);
  k.kure(bayrak, 0xe6c04a, 0, 2.63, 0, .07, .07, .07, 0);
  const bez = new THREE.Group(); bez.position.set(0, 2.25, 0); bayrak.add(bez);
  const bayrakBez = k.blok(bez, 0xd9714f, .4, 0, 0, .8, .5, .03);
  bayrakBez.material = a.mal(0xd9714f, { name: 'bayrak' });
  a.engelEkle(-3, 10.5, .08, 0);

  /* ——— Konu köşesi (0,0): taş halka, konu parseli, boy çubuğu, tabela ——— */
  yapi('tas-halka', 0, 0, 0, g => {
    const n = 18;
    for (let i = 0; i < n; i++) {
      const ac = i / n * Math.PI * 2 + .1, r = 2.05 + (a.rast() - .5) * .08;
      const t = k.kure(g, i % 3 ? R.tas : R.tasKoyu, Math.cos(ac) * r, .07, Math.sin(ac) * r, .3, .17, .22, 0);
      t.rotation.y = -ac + (a.rast() - .5) * .4;
    }
  });
  const parseller = {};
  /* Parsel: koyu toprak yatak (adlı malzeme: 1b'de rengi toprağın durumuna
     göre değişir, yalnız bu parseli boyar), üstünde üç sıra kabarık
     tümsek (bitki yuvaları 3×3), çevresinde alçak kenar. Yatak dışındaki
     parçalar tek mesh'e iner; yatak ayrı kalır (birlesme: false). */
  const parselKur = (id, { x, z, en }, konu) => {
    const g = hareketliGrup(x, z, 0, 'parsel-' + id);
    const yatak = k.blok(g, R.toprakYatak, 0, .03, 0, en, .06, en);
    yatak.material = a.mal(R.toprakYatak, { name: 'parsel-' + id });
    yatak.castShadow = false; yatak.userData.birlesme = false; yatak.name = 'yatak';
    for (const s of [-1, 1]) {                                                // alçak kenar: kabarık toprak / tahta
      const renk = konu ? R.toprakTumsek : R.kenarTahta;
      k.blok(g, renk, s * (en / 2 + .05), .07, 0, .12, .14, en + .22);
      k.blok(g, renk, 0, .07, s * (en / 2 + .05), en, .14, .12);
    }
    let karikG = null;
    if (!konu) {
      /* Üç sıra tümsek (karık) kendi alt grubunda tek mesh'e iner ve ADLI malzeme
         ('parsel-<id>-karik') alır: tarlanın çoğunu karıklar kapladığı için toprağın
         durumu (sert, yumuşak, ıslak...) onların renginde de görünsün (parsel.js boyar). */
      karikG = new THREE.Group(); karikG.name = 'karik'; g.add(karikG);
      for (const dx of [-1, 0, 1]) {
        const t = k.sil(karikG, R.toprakTumsek, dx * 1.02, .06, 0, .34, en - .34, 10);
        t.rotation.x = Math.PI / 2; t.scale.z = .15; t.userData.karik = true;
      }
    } else {
      const t = k.kure(g, R.toprakTumsek, 0, .05, 0, .8, .1, .8, 1);           // ortada kabarık yuva
      t.userData.yuva = true;
    }
    for (let i = 0; i < (konu ? 5 : 9); i++) {                                 // kesekler
      const u = (a.rast() - .5) * (en - .5), v = (a.rast() - .5) * (en - .5);
      k.kure(g, R.toprakTumsek, u, .1, v, .07 + a.rast() * .04, .05, .07, 0).rotation.y = a.rast() * 3;
    }
    birlestir(a, g, { ad: 'parsel-' + id, korunan: [karikG] });
    const karik = karikG?.children.find(o => o.isMesh);
    if (karik) {
      // Köşe renkleri beyaz: rengi yalnız adlı malzeme verir (başlangıçta tümsek rengi).
      const c = karik.geometry.getAttribute('color');
      if (c) { c.array.fill(1); c.needsUpdate = true; }
      karik.material = a.mal(R.toprakTumsek, { vertexColors: !!c, roughness: karik.material.roughness, name: 'parsel-' + id + '-karik' });
      karik.name = 'karik-mesh';
    }
    parseller[id] = g;
    return g;
  };
  parselKur('konu', PARSEL_YERI.konu, true);
  parselKur('t1', PARSEL_YERI.t1, false);
  parselKur('t2', PARSEL_YERI.t2, false);

  // Boy çubuğu: renk bantlı (bitkinin boyu buna göre okunur)
  yapi('boy-cubugu', 1.35, -1.35, 0, g => {
    [0xd9483a, 0xef8a3a, 0xf1c74a, 0x6aa84f, 0x3d85c6].forEach((r, i) => k.sil(g, r, 0, .22 + i * .4, 0, .06, .4, 8));
    k.kure(g, R.cerceve, 0, 2.08, 0, .09, .09, .09, 1);
  });
  a.engelEkle(1.35, -1.35, .08, 0);
  // Tabela direği (gerçek engel: motorun merkezdeki görünmez yedek dairesi devreye girmesin)
  const tabela = hareketliGrup(-2.45, 1.35, .45, 'tabela');
  k.blok(tabela, R.direk, 0, .8, 0, .14, 1.6, .14);
  k.blok(tabela, R.tahtaKoyu, 0, 1.45, .06, 1.04, .72, .08);
  k.blok(tabela, 0xf4ead2, 0, 1.45, .11, .88, .56, .03);
  const filiz = new THREE.Group(); filiz.position.set(0, 1.35, .14); tabela.add(filiz);  // 1b: konu tohumunun resmi
  k.blok(filiz, R.toprakTumsek, 0, -.1, 0, .44, .07, .02);
  k.blok(filiz, R.yaprak, 0, .04, 0, .04, .26, .02);
  k.kure(filiz, R.yaprakAcik, -.08, .14, 0, .1, .05, .02, 0);
  k.kure(filiz, R.yaprakAcik, .08, .18, 0, .1, .05, .02, 0);
  a.engelEkle(-2.45, 1.35, .14, 0);

  /* ——— Tarla: korkuluk ——— */
  yapi('korkuluk', -15, -8, .5, g => {
    k.blok(g, R.direk, 0, 1.1, 0, .12, 2.2, .12);
    k.blok(g, R.direk, 0, 1.55, 0, 1.7, .1, .1);
    k.blok(g, 0xc2553c, 0, 1.4, 0, .62, .72, .34);                          // gömlek
    for (const s of [-1, 1]) {
      k.blok(g, 0xc2553c, s * .52, 1.55, 0, .44, .22, .24);
      for (let i = 0; i < 3; i++) k.koni(g, SAMAN, s * (.8 + i * .02), 1.52 + (i - 1) * .06, (i - 1) * .06, .05, .2, 4).rotation.z = s * -1.5;
    }
    k.blok(g, 0x5b6f8c, 0, .95, 0, .5, .3, .3);                              // pantolon
    k.kure(g, 0xe7d3a4, 0, 2.08, 0, .27, .29, .25, 1);                      // çuval kafa
    for (const s of [-1, 1]) k.kure(g, 0x3d3a34, s * .1, 2.13, .22, .035, .035, .02, 0);
    k.blok(g, 0x3d3a34, 0, 1.99, .235, .16, .025, .02);
    k.sil(g, SAMAN, 0, 2.28, 0, .46, .04, 14, .95);                          // hasır şapka
    k.sil(g, SAMAN_KOYU, 0, 2.4, 0, .21, .22, 12, .85);
    k.sil(g, SAMAN_ORGU, 0, 2.33, 0, .225, .06, 12);
  });
  a.engelEkle(-15, -8, .16, 0);

  /* ——— Kuyu (-6, 4) ——— */
  yapi('kuyu', -6, 4, .3, g => {
    k.sil(g, R.tas, 0, .38, 0, .78, .76, 12);
    k.sil(g, R.su, 0, .775, 0, .6, .02, 12);                                  // taş bileziğin içinde su
    for (let i = 0; i < 10; i++) {                                           // taş örgü
      const ac = i / 10 * Math.PI * 2;
      k.blok(g, i % 2 ? R.tasKoyu : R.tas, Math.cos(ac) * .79, .3 + (i % 2) * .22, Math.sin(ac) * .79, .22, .18, .1, -ac + Math.PI / 2);
    }
    for (const s of [-1, 1]) k.blok(g, R.direk, s * .7, 1.15, 0, .12, 1.6, .12);
    k.prizma(g, R.kiremit, 0, 1.9, 0, 1.9, .55, 1.3);
    k.sil(g, R.tahtaKoyu, 0, 1.45, 0, .06, 1.5, 6).rotation.z = Math.PI / 2;   // çıkrık mili
    k.blok(g, R.tahtaKoyu, .82, 1.33, 0, .06, .3, .06);                       // kol
    k.cubuk(g, 0x8a7a66, [0, 1.42, 0], [0, 1.02, 0], .012, 3);               // ip
    k.sil(g, 0x9c7148, 0, .92, 0, .15, .2, 8, 1.15);                          // kova
  });
  a.engelEkle(-6, 4, .82, 0);

  /* ——— Ambar (-12, 7): kırmızı ahşap, kapısı doğuda; önünde hasat rafı ——— */
  const ambarGovde = govdeGeo(THREE, 'ambar', [[-AMBAR.d / 2, 0], [AMBAR.d / 2, 0], [AMBAR.d / 2, 2.2], [1.55, 3.25], [0, 3.8], [-1.55, 3.25], [-AMBAR.d / 2, 2.2]], AMBAR.w);
  const ambarYapi = yapi('ambar', AMBAR.x, AMBAR.z, 0, g => {
    const m = new THREE.Mesh(ambarGovde, a.mal(R.ambar)); m.castShadow = m.receiveShadow = true; g.add(m);
    // Gambrel çatı: iki yanda dik alt yüzey + yatık üst yüzey
    for (const s of [-1, 1]) {
      const alt = k.blok(g, R.ambarCati, 0, 2.72, s * 2.14, AMBAR.w + .5, .12, 1.7);
      alt.rotation.x = s * Math.atan2(1.05, 1.05);
      const ust = k.blok(g, R.ambarCati, 0, 3.55, s * .8, AMBAR.w + .5, .12, 1.72);
      ust.rotation.x = s * Math.atan2(.55, 1.55);
    }
    k.blok(g, R.ambarCati, 0, 3.84, 0, AMBAR.w + .54, .1, .22);
    // Beyaz köşe tahtaları
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) k.blok(g, R.beyaz, sx * (AMBAR.w / 2 + .01), 1.1, sz * (AMBAR.d / 2 + .01), .16, 2.2, .16);
    // Doğu cephesi: büyük çift kapı (beyaz çerçeve, X kuşak), üstünde samanlık kapağı
    const ex = AMBAR.w / 2 + .03;
    k.blok(g, R.beyaz, ex, 1.08, 0, .06, 2.16, 2.36);
    k.blok(g, R.ambarKoyu, ex + .01, 1.02, 0, .06, 2, 2.2);
    k.blok(g, R.beyaz, ex + .03, 1.02, 0, .03, 2, .1);
    for (const s of [-1, 1]) {
      const cz = s * .55;
      for (const d of [-1, 1]) { const x = k.blok(g, R.beyaz, ex + .04, 1.02, cz, .03, 2.05, .1); x.rotation.x = d * .5; }
      k.blok(g, R.beyaz, ex + .04, 1.02, cz, .03, .1, 1.1);
    }
    k.blok(g, R.beyaz, ex, 2.72, 0, .06, .92, .92);
    k.blok(g, 0x5a3a2a, ex + .01, 2.72, 0, .06, .76, .76);
    k.blok(g, R.samanKoyu, ex + .02, 2.52, 0, .05, .3, .68);                 // samanlıktan taşan saman
    // Yan duvarda iki pencere
    for (const s of [-1, 1]) {
      k.blok(g, R.beyaz, s * 1.1, 1.5, -AMBAR.d / 2 - .02, .72, .72, .05);
      k.blok(g, 0x5a3a2a, s * 1.1, 1.5, -AMBAR.d / 2 - .035, .56, .56, .04);
    }
    // Kapı önü toprak
    k.blok(g, R.toprakYol, ex + .9, .012, 0, 1.8, .02, 2.6).castShadow = false;
  });
  a.kutuEngel(AMBAR.x, AMBAR.z, AMBAR.w, AMBAR.d, 0, undefined, false);
  // Rüzgârgülü: çatıda küçük horoz figürü (yavaş döner)
  const ruzgargulu = hareketliGrup(AMBAR.x, AMBAR.z, 0, 'ruzgargulu');
  ruzgargulu.position.y = ZEMIN + 3.88;
  k.sil(ruzgargulu, 0x3f3b36, 0, .4, 0, .025, .8, 5);
  const gul = new THREE.Group(); gul.position.y = .82; ruzgargulu.add(gul);
  k.blok(gul, 0x3f3b36, 0, 0, 0, .7, .03, .03);
  k.koni(gul, 0x3f3b36, .38, 0, 0, .07, .16, 4).rotation.z = -Math.PI / 2;
  k.kure(gul, 0x3f3b36, -.05, .16, 0, .14, .1, .03, 0);                       // horoz gövdesi
  k.kure(gul, 0x3f3b36, .08, .28, 0, .06, .07, .03, 0);                        // kafa
  k.blok(gul, 0xb3402e, .08, .36, 0, .08, .05, .025);                          // ibik
  k.blok(gul, 0x3f3b36, -.2, .26, 0, .08, .22, .03).rotation.z = .5;           // kuyruk
  // Hasat rafı: ambarın GÜNEY duvarına dayalı, önü güneye (1b: çuvallar, domates kasası, ceviz ve
  // yumurta sepetleri). Kamera kuzeye sabit bakar: raf önden görünür, yığın yan yana dizilir
  // (doğu duvarına dayalıyken raf kameraya ucundan bakıyor, çuvallar birbirinin ardında kalıyordu).
  // Yerel eksen: +x ön (güney), z rafın boyu (doğu-batı); rafa sığmayan çuvallar doğusunda yerde.
  const RAF_X = AMBAR.x + AMBAR.w / 2 - 1.1, RAF_Z = AMBAR.z + AMBAR.d / 2 + .3;
  const raf = hareketliGrup(RAF_X, RAF_Z, -Math.PI / 2, 'ambar-raf');
  for (const [x, z] of [[-.22, -.62], [-.22, .62], [.22, -.62], [.22, .62]]) k.blok(raf, R.tahtaKoyu, x, .75, z, .08, 1.5, .08);
  for (const y of [.12, .62, 1.12]) k.blok(raf, R.tahta, 0, y, 0, .54, .06, 1.34);
  k.blok(raf, R.tahtaKoyu, -.24, 1.5, 0, .06, .06, 1.34);
  a.kutuEngel(RAF_X, RAF_Z, 1.36, .56, 0, undefined, false);

  /* ——— Kümes ve avlu (x 9..16, z 3..10) ———
     Tavuklar avludan çıkmasın: kapı kapalı. Fare çitin üstünden zıplayıp
     girebilir. Koşan fare bir tavuğu ince çite dayayıp iterse tavuk
     çitin öbür yanına geçebiliyordu (itilebilir.js tavuğu fareden en+r
     uzağa koyar). Bu yüzden çitin dış yüzüne yalnız yerdeki nesnelere
     çarpan (h .01: farenin ayağı hep üstünde kalır) görünmez birer şerit
     kondu; şerit çitten ÖNCE kaydedilir ki itilen tavuk içeri dönsün. */
  const serit = (x, z, w, d) => a.kutuEngel(x, z, w, d, 0, .01, false);
  serit(AVLU.x0 - .35, (AVLU.z0 + AVLU.z1) / 2, 1.1, AVLU.z1 - AVLU.z0 + 1.4);       // batı
  serit((AVLU.x0 + AVLU.x1) / 2, AVLU.z0 - .35, AVLU.x1 - AVLU.x0 + 1.4, 1.1);       // kuzey
  serit(AVLU.x1 + .35, (AVLU.z0 + 7) / 2, 1.1, 7 - AVLU.z0 + 1.4);                   // doğu (kümese kadar)
  serit((AVLU.x0 + 13) / 2, AVLU.z1 + .35, 13 - AVLU.x0 + 1.4, 1.1);                 // güney (kümese kadar)
  const citler = (x0, z0, x1, z1, bosluk = []) => {
    const L = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / L, dz = (z1 - z0) / L, ry = Math.atan2(-dz, dx);
    for (let t = .12; t < L - .05; t += .26) {
      if (bosluk.some(([b0, b1]) => t > b0 && t < b1)) continue;
      k.blok(a.dunya, R.cerceve, x0 + dx * t, ZEMIN + .44, z0 + dz * t, .09, .88, .05, ry);
    }
    for (const t of [0, L]) k.blok(a.dunya, R.direk, x0 + dx * t, ZEMIN + .48, z0 + dz * t, .14, .96, .14, ry);
    const bolumler = []; let bas = 0;
    for (const [b0, b1] of bosluk) { bolumler.push([bas, b0]); bas = b1; }
    bolumler.push([bas, L]);
    for (const [s0, s1] of bolumler) {
      const m = (s0 + s1) / 2, u = s1 - s0;
      k.blok(a.dunya, R.tahtaAcik, x0 + dx * m, ZEMIN + .6, z0 + dz * m, u, .08, .06, ry);
      a.kutuEngel(x0 + dx * m, z0 + dz * m, u + .02, .14, ry, CIT.h, false);
    }
  };
  citler(AVLU.x0, AVLU.z0, AVLU.x1, AVLU.z0);                         // kuzey
  citler(AVLU.x1, AVLU.z0, AVLU.x1, 7);                               // doğu (kümes evine kadar)
  citler(AVLU.x0, AVLU.z1, 13, AVLU.z1);                              // güney (kümes evine kadar)
  citler(AVLU.x0, AVLU.z0, AVLU.x0, AVLU.z1, [[AVLU.kapiZ0 - AVLU.z0, AVLU.kapiZ1 - AVLU.z0]]);   // batı, kapı aralığı
  // Kapı: kapalı, çerçeveli çıta kanat (tavuk çıkmasın), çapraz kuşak ve mandal
  yapi('avlu-kapisi', AVLU.x0, (AVLU.kapiZ0 + AVLU.kapiZ1) / 2, Math.PI / 2, g => {
    const L = AVLU.kapiZ1 - AVLU.kapiZ0;
    for (const s of [-1, 1]) k.blok(g, R.direk, s * L / 2, .55, 0, .16, 1.1, .16);
    for (const y of [.18, .78]) k.blok(g, R.tahta, 0, y, 0, L - .16, .1, .07);
    for (let i = 0; i < 5; i++) k.blok(g, R.cerceve, -L / 2 + .25 + i * (L - .5) / 4, .48, .02, .1, .76, .05);
    const kus = k.blok(g, R.tahta, 0, .48, -.04, Math.hypot(L - .2, .6), .08, .05); kus.rotation.z = Math.atan2(.6, L - .2);
    k.blok(g, 0x6d6a62, L / 2 - .2, .55, -.07, .16, .06, .04);
  });
  a.kutuEngel(AVLU.x0, (AVLU.kapiZ0 + AVLU.kapiZ1) / 2, .14, AVLU.kapiZ1 - AVLU.kapiZ0 + .02, 0, CIT.h, false);
  // Kümes evi: avlu çitinin güneydoğu köşesi
  const kumesGovde = govdeGeo(THREE, 'kumes', [[-1.5, 0], [1.5, 0], [1.5, 1.45], [0, 2.25], [-1.5, 1.45]], 3);
  const kumesYapi = yapi('kumes', KUMES_EVI.x, KUMES_EVI.z, 0, g => {
    const m = new THREE.Mesh(kumesGovde, a.mal(R.kumes)); m.castShadow = m.receiveShadow = true; g.add(m);
    const egim = Math.atan2(.8, 1.5), yuzey = Math.hypot(.8, 1.5) + .35;
    for (const s of [-1, 1]) { const c = k.blok(g, R.kumesCati, 0, 1.88, s * .78, 3.5, .12, yuzey); c.rotation.x = s * egim; }
    k.blok(g, R.kumesCati, 0, 2.27, 0, 3.54, .1, .18);
    for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) k.blok(g, R.beyaz, sx * 1.51, .73, sz * 1.51, .12, 1.46, .12);
    for (let i = 0; i < 5; i++) k.blok(g, 0xae7443, -1.52, .2 + i * .27, 0, .02, .04, 2.9);   // tahta çizgileri (batı yüzü)
    // Batı yüzünde (avluya bakan) tavuk kapısı ve rampa
    k.blok(g, 0x4a3326, -1.53, .55, .3, .04, .55, .42);
    k.blok(g, R.beyaz, -1.54, .86, .3, .04, .08, .56);
    const rampa = k.blok(g, R.tahta, -1.9, .22, .3, .9, .06, .42); rampa.rotation.z = .5;
    for (let i = 0; i < 3; i++) { const c = k.blok(g, R.tahtaKoyu, -2.18 + i * .24, .1 + i * .13, .3, .04, .04, .42); c.rotation.z = .5; }
    // Kuzey yüzünde (avluya bakan) yuvarlak pencere
    k.sil(g, R.beyaz, .2, 1.1, -1.52, .26, .04, 12).rotation.x = Math.PI / 2;
    k.sil(g, 0x4a3326, .2, 1.1, -1.54, .2, .03, 12).rotation.x = Math.PI / 2;
    // Avluya dökülmüş saman ve yem
    for (let i = 0; i < 7; i++) k.blok(g, R.samanKoyu, -2.1 - (i % 4) * .45, .012, -.9 + Math.floor(i / 4) * .8 + (i % 2) * .2, .22, .02, .08, i * .9).castShadow = false;
  });
  a.kutuEngel(KUMES_EVI.x, KUMES_EVI.z, KUMES_EVI.w, KUMES_EVI.d, 0, undefined, false);
  a.kutuEngel(KUMES_EVI.x - 1.95, KUMES_EVI.z + .3, .8, .5, 0, .35, false);        // rampa: tavuklar dolanır

  /* Yemlik, suluk, folluk: çitin DIŞ yüzünde (x≈8.3), kapı ağzında. */
  yapi('yemlik', 8.38, 5.05, 0, g => {
    k.blok(g, R.tahtaKoyu, 0, .24, 0, .5, .08, .9);
    for (const s of [-1, 1]) k.blok(g, R.tahta, s * .23, .34, 0, .06, .24, .92);
    for (const s of [-1, 1]) k.blok(g, R.tahta, 0, .34, s * .45, .5, .24, .05);
    // Yem (dolu/boş) yansit.js'te: çiftliğin durumuna göre çizilir.
    for (const [x, z] of [[-.18, -.36], [-.18, .36], [.18, -.36], [.18, .36]]) k.blok(g, R.direk, x, .1, z, .06, .2, .06);
  });
  a.kutuEngel(8.38, 5.05, .52, .94, 0, .5, false);
  /* Suluk: içinde mavi su görünen galvaniz leğen (1b: 'doldur' ile su yükselir). */
  const suluk = hareketliGrup(8.35, 8, 0, 'suluk');
  k.sil(suluk, 0x9fb1b8, 0, .17, 0, .36, .34, 16, 1.18, true);             // üstü açık leğen
  k.sil(suluk, 0x879aa2, 0, .01, 0, .36, .02, 16);                         // dip
  k.halka(suluk, 0x879aa2, 0, .34, 0, .425, .028);                         // ağız kenarı
  const suYuzu = k.sil(suluk, 0x4f9fc4, 0, .29, 0, .405, .02, 16);
  suYuzu.name = 'su'; suYuzu.material = a.mal(0x4f9fc4, { name: 'suluk-su', roughness: .35 });
  for (const s of [-1, 1]) k.blok(suluk, 0x879aa2, s * .44, .3, 0, .05, .1, .16);   // kulplar
  a.engelEkle(8.35, 8, .44, 0, .45);
  const folluk = hareketliGrup(8.4, 3.9, 0, 'folluk');
  k.blok(folluk, R.kumes, 0, .55, 0, .62, .5, .7);
  for (const [x, z] of [[-.25, -.3], [-.25, .3], [.25, -.3], [.25, .3]]) k.blok(folluk, R.direk, x, .15, z, .07, .3, .07);
  k.blok(folluk, R.saman, 0, .79, 0, .5, .04, .58).castShadow = false;
  const kapak = new THREE.Group(); kapak.name = 'folluk-kapagi'; kapak.position.set(.31, .82, 0); folluk.add(kapak);
  k.blok(kapak, R.kumesCati, -.31, .04, 0, .7, .06, .78).rotation.z = .12;
  k.blok(kapak, 0x6d6a62, -.62, .02, 0, .05, .08, .12);
  a.kutuEngel(8.4, 3.9, .64, .72, 0, .85, false);

  /* ——— Tavuklar ve horoz: itilebilir hayvanlar (kaçar, itme tavanı 3) ——— */
  const hayvanlar = [];
  const hayvanEkle = (x, z, yon, tur, renkler, tohum) => {
    const n = a.itilebilir({
      x, z, r: tur === 'horoz' ? .34 : .3, tip: 'hayvan', yon, kacar: true, itmeTavan: 3,
      model: g => tur === 'horoz'
        ? horozModeli({ THREE, mal: a.mal }, g, { olcek: 1.25, tohum })
        : tavukModeli({ THREE, mal: a.mal }, g, { renkler, olcek: 1.12, tohum })
    });
    n.tur = tur;
    hayvanlar.push(n);
  };
  hayvanEkle(10.6, 4.6, .8, 'tavuk', TAVUK_RENKLERI.kizil, 1);
  hayvanEkle(12.3, 6.2, 2.4, 'tavuk', TAVUK_RENKLERI.beyaz, 2);
  hayvanEkle(10.9, 8.5, -.9, 'tavuk', TAVUK_RENKLERI.sari, 3);
  hayvanEkle(13.6, 4.8, -1.8, 'horoz', null, 4);

  /* ——— Dede Ceviz (10, -8): yaşlı, kalın gövdeli, geniş taçlı, baştan olgun ———
     Taç alçak ve geniş: yüksek, eğik kamera tacı görsün, cevizler (yeşil
     kabuklu) tacın altında, dal uçlarında sallansın. */
  const dedeYapi = yapi('dede-ceviz', 10, -8, .3, g => {
    k.sil(g, R.kabuk, 0, .95, 0, .62, 1.9, 9, .7);
    for (let i = 0; i < 5; i++) {                                             // kök çıkıntıları
      const ac = i / 5 * Math.PI * 2 + .4;
      const kok = k.sil(g, R.kabuk, Math.cos(ac) * .55, .12, Math.sin(ac) * .55, .22, .55, 6, .4);
      kok.rotation.set(Math.sin(ac) * .9, 0, -Math.cos(ac) * .9);
    }
    for (let i = 0; i < 5; i++) {                                             // dallar: gövdeden dışa ve yukarı
      const ac = i / 5 * Math.PI * 2 + .9, u = 1.25;
      k.cubuk(g, R.kabuk, [Math.cos(ac) * .2, 1.7, Math.sin(ac) * .2], [Math.cos(ac) * u, 2.55, Math.sin(ac) * u], .15, 6);
    }
    const tac = [[0, 3.35, 0, 2.5, 1.2], [1.8, 2.95, .7, 1.6, .95], [-1.8, 3.05, -.3, 1.7, 1], [.3, 3.0, -1.8, 1.6, .95], [-.5, 2.9, 1.8, 1.6, .9], [.3, 4.15, .2, 1.5, .85], [1.3, 3.5, -1.2, 1.2, .8]];
    tac.forEach(([x, y, z, r, h], i) => k.kure(g, [R.yaprak, R.yaprakKoyu, R.yaprakAcik][i % 3], x, y, z, r, h, r, 1));
    // Meyveler (püskül → yeşil kabuk → çatlak kabuk) yansit.js'te, çiftliğin durumuna göre (bitki3b.js dedeParcalari).
  });
  a.engelEkle(10, -8, .6, 0);

  /* ——— Çiçekler ve süsler (tekrarlayan küçük parçalar: otomatik instancing) ——— */
  {
    const cicekYeri = [];
    for (let i = 0; i < 70; i++) {
      const x = -21 + a.rast() * 42, z = -16 + a.rast() * 32;
      if (otYok(x, z) || Math.hypot(x - 10, z + 8) < 1.5 || Math.hypot(x, z - 10) < 1.2) continue;
      cicekYeri.push([x, z]);
    }
    cicekYeri.forEach(([x, z], i) => {
      k.sil(a.dunya, 0x6f9c56, x, ZEMIN + .13, z, .018, .26, 4);
      k.kure(a.dunya, R.cicek[i % 5], x, ZEMIN + .28, z, .075, .06, .075, 0);
    });
  }

  /* ——— Çitin dışı: saman yığını (tırmanılır), balyalar, top ——— */
  yapi('saman-yigini', -26.5, 4, 0, g => {
    const kat = [[2.2, 2.8, .55], [1.6, 1.8, .55], [.9, 1.0, .55]];
    let y = 0;
    kat.forEach(([w, d, h], i) => {
      k.blok(g, i % 2 ? R.samanKoyu : R.saman, 0, y + h / 2, 0, w, h, d);
      for (const s of [-1, 1]) k.blok(g, 0xa47a3a, s * w * .25, y + h / 2, 0, .04, h + .01, d + .01);   // balya ipleri
      y += h;
    });
  });
  { let y = ZEMIN; for (const [w, d, h] of [[2.2, 2.8, .55], [1.6, 1.8, .55], [.9, 1.0, .55]]) { y += h; yukselti(-26.5, 4, w / 2, d / 2, y, { kutu: true }); } }
  if (a.itilebilir) {
    a.itilebilir({ x: -8.4, z: 10.2, r: .5, tip: 'balya', renk: R.saman, ikinci: R.samanKoyu, yon: .4 });
    a.itilebilir({ x: -6.6, z: 11.3, r: .5, tip: 'balya', renk: R.saman, ikinci: R.samanKoyu, yon: 1.3 });
    a.itilebilir({ x: 4.5, z: 3.6, r: .36, tip: 'top', renk: 0xe8636b, ikinci: 0xf6f1e2 });
  }

  /* ——— Uzakta komşu evleri (yolun ucunda, yürünebilir sınırın ötesinde) ——— */
  const komsuEvi = (x, z, ry, duvar, cati) => {
    const y = ZEMIN + araziMeshYuksekligi(x, z, olcek) - .1;
    const g = k.grup(x, z, ry, a.dunya, y);
    k.blok(g, duvar, 0, .9, 0, 3, 1.8, 2.4);
    k.prizma(g, cati, 0, 1.8, 0, 3.4, 1.1, 2.9);
    k.blok(g, R.tugla, .8, 2.3, .4, .35, .9, .35);
    k.blok(g, R.pencere, -.6, 1.05, -1.22, .6, .55, .05);
    k.blok(g, R.kapi, .5, .6, -1.22, .55, 1.1, .05);
    birlestir(a, g, { ad: 'komsu' });
  };
  komsuEvi(7.5, 51, .2, 0xf1e2c4, 0xb9533b);
  komsuEvi(15.5, 48, -.4, 0xe9ead8, 0x8b5a44);
  komsuEvi(-2.5, 54, .5, 0xf4dcc4, 0xc0654a);

  /* ——— Örten yapılar ———
     Kamera kuzeye SABİT bakar (sürükleme kamerayı döndürmez), yani hep
     farenin güneyinde, yüksekte durur. Fare bir binanın ya da Dede Ceviz'in
     KUZEYİNDE kalınca (verandada kapıya yürürken, ambarın ve kümesin
     arkasında, cevizin altında) araya o yapı giriyor, çocuk fareyi
     kaybediyordu. Bu yapılar kendi (saydamlığa hazır) malzemeleriyle
     çizilir; her karede kameradan farenin gövdesine, iki yanına ya da
     ayağına giden ışınlardan biri yapıya çarpıyorsa yapı yumuşakça
     saydamlaşır (.3), çarpmıyorsa geri gelir (tutamak.ortucuGuncelle).
     Opaklık 1'de görünüşte fark yok; çizim çağrısı sayısı değişmez. */
  const ortuculer = [];
  for (const [ad, g] of [['ev', evYapi], ['ambar', ambarYapi], ['kumes', kumesYapi], ['dede-ceviz', dedeYapi]]) {
    const meshler = [], malzemeler = new Set();
    g.traverse(o => { if (o.isMesh) meshler.push(o); });
    for (const m of meshler) {
      const e = m.material, ek = { roughness: e.roughness, metalness: e.metalness, transparent: true, name: 'ortucu-' + ad };
      if (e.vertexColors) ek.vertexColors = true;
      if (e.side !== THREE.FrontSide) ek.side = e.side;
      if (e.flatShading) ek.flatShading = true;
      m.material = a.mal(e.vertexColors ? 0xffffff : e.color.getHex(), ek);
      malzemeler.add(m.material);
    }
    g.updateMatrixWorld(true);
    ortuculer.push({ ad, meshler, malzemeler: [...malzemeler], kutu: new THREE.Box3().setFromObject(g), opak: 1 });
  }
  const isin = new THREE.Raycaster(), ray = new THREE.Ray(), gK = new THREE.Vector3(), gF = new THREE.Vector3(), gP = new THREE.Vector3();

  /* ——— Tutamak: giris.js ve sonraki aşamalar için ——— */
  const tutamak = {
    dunya: a.dunya, hayvanlar, parseller, raf, tabela, pano, bayrak, folluk, suluk, noktalar: NOKTALAR, ortuculer,
    arac: { THREE, mal: a.mal, ZEMIN },                                      // 1b: yansit.js (durum → dünya)
    sadelestir: () => sahneyiSadelestir(THREE, a.dunya),
    tacKamerasi: () => taclariKameraEngeliYap(a),
    bulutlariTasi: () => bulutlariTasi(a.dunya, olcek),
    kacis: 0, hizAsimi: 0,
    /* Sınama için zemin yüksekliği: motorun zeminY'siyle aynı formül
       (arazi + bu mekânın yükseltileri). Test bunu yürüyüşte motorun
       ölçtüğüyle karşılaştırır. */
    zeminY(x, z) {
      let y = ZEMIN + araziYuksekligi(x, z, olcek);
      for (const t of yukseltiler) if (t.kutu && Math.abs(x - t.x) <= t.rx && Math.abs(z - t.z) <= t.rz && t.ust > y) y = t.ust;
      return y;
    },
    yukseltiler,
    bayrakRengi(renk) { bayrakBez.material.color.setHex(renk); },
    /* Örten yapıların saydamlığı. kamera: etkin kameranın konumu (Vector3)
       ya da null (1. şahıs görünüm: hepsi opak). fare: {x, y, z} ayak.
       ani: azaltılmış hareket (geçiş yok). */
    ortucuGuncelle(kamera, fare, dt = 1 / 60, ani = false) {
      /* Dört ışın: farenin gövdesine, iki yanına ve ayağına. Fare bir
         köşenin ardında YARIM kalınca da yapı saydamlaşır; ayak ışını,
         kameranın hemen altındaki saçağın ekranın alt yarısını kapladığı
         (fare henüz görünürken) durumu da yakalar: verandada kapıya yürürken.
         Kamera kuzeye sabit baktığı için yanlar dünyada ±x. */
      const isinlar = [];
      if (kamera && fare) {
        gK.set(kamera.x, kamera.y, kamera.z);
        for (const [dx, h] of [[0, .5], [0, .15], [-.28, .42], [.28, .42]]) {
          gF.set(fare.x + dx, fare.y + h, fare.z);
          const L = gK.distanceTo(gF);
          if (L > .5) isinlar.push({ L, yon: gF.clone().sub(gK).divideScalar(L) });
        }
      }
      for (const o of ortuculer) {
        let orter = false;
        for (const { L, yon } of isinlar) {
          ray.set(gK, yon);
          if (!ray.intersectBox(o.kutu, gP) || gP.distanceTo(gK) > L - .3) continue;
          isin.set(gK, yon); isin.far = L - .3;
          if (isin.intersectObjects(o.meshler, false).length) { orter = true; break; }
        }
        o.orter = orter;
        const hedef = orter ? .3 : 1;
        o.opak = ani ? hedef : o.opak + (hedef - o.opak) * Math.min(1, dt * 7);
        if (Math.abs(o.opak - hedef) < .01) o.opak = hedef;
        for (const m of o.malzemeler) m.opacity = o.opak;
      }
    },
    /* Her kare (giris.js çağırır): avlu güvenliği. Tavuklar fiziksel
       olarak çıkamıyor (şerit + çit); yine de bir tavuk avlunun dışında
       bulunursa evine konur ve sayılır (test bunun 0 kaldığını denetler).
       Tavuğun yatay hızı itmeTavan'ı aşarsa (tavuk-tavuk çarpışması)
       tavana indirilir; o da sayılır. */
    kare(t, dt = 1 / 60, kamera = null, fare = null, ani = false) {
      tutamak.ortucuGuncelle(kamera, fare, dt, ani);
      for (const n of hayvanlar) {
        const h = Math.hypot(n.vx, n.vz);
        if (h > 3 + 1e-6) { n.vx *= 3 / h; n.vz *= 3 / h; tutamak.hizAsimi++; }   // pay: tavanla'nın kayan nokta artığı (3.0000000000000004)
        const icinde = n.x > AVLU.x0 && n.x < AVLU.x1 && n.z > AVLU.z0 && n.z < AVLU.z1;
        if (!icinde) { n.x = n.ev.x; n.z = n.ev.z; n.vx = n.vz = 0; tutamak.kacis++; }
      }
    }
  };
  tutamak.kurulumMs = +(performance.now() - basla).toFixed(1);
  if (a.masal) a.masal.ciftlik = tutamak;

  /* Kanca: motor her karede çağırır (azaltılmış harekette çağırmaz). */
  return {
    tik(t) {
      bez.rotation.y = Math.sin(t * 2.1) * .28;
      bayrakBez.rotation.x = Math.sin(t * 3.3) * .08;
      gul.rotation.y = t * .25 + Math.sin(t * .7) * .6;
      duman.forEach((d, i) => {
        const o = ((t * .25 + i / 3) % 1);
        d.position.set(o * .5, .15 + o * 1.3, -o * .2);
        d.scale.setScalar(.14 + o * .3);
        d.material.opacity = .65 * (1 - o);
      });
    }
  };
}

/* Düz dikdörtgen boya (avlu toprağı). */
function seritKare(THREE, x0, z0, x1, z1, y) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, y, z0, x0, y, z1, x1, y, z1, x0, y, z0, x1, y, z1, x1, y, z0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.computeBoundingSphere();
  return g;
}

/* Sahne kurulduktan SONRA (giris.js çağırır): motorun tepe çimi, iç ot ve
   ağaç gövdesi örnekleri bu dünyada daha ucuz geometriyle çizilir.
   Neden: ölçek 1.8'de motor ağaçları ×1.8, çimi ×3.24 çoğaltıyor; boş
   çiftlik bile karınca masalının üçgen sayısının 1.33 katına çıkıyordu.
   Çim ve ot konileri 4 yerine 3 yüzlü ve tabansız (taban yerin içinde,
   hiç görünmüyor), ağaç gövdesi uçları kapaksız (üstü tacın, altı toprağın
   içinde). Görüntü aynı, üçgen yarıya iner. Yalnız bu dünyanın örnek
   mesh'lerine dokunur; motor ve masallar değişmez. */
export function sahneyiSadelestir(THREE, dunya) {
  const koni = (r, h) => geo(`sade-koni${r}|${h}`, () => new THREE.ConeGeometry(r, h, 3, 1, true));
  const govde = (rt, rb, h, n) => geo(`sade-govde${rt}|${rb}|${h}|${n}`, () => new THREE.CylinderGeometry(rt, rb, h, n, 1, true));
  let n = 0;
  for (const o of dunya.children) {
    if (!o.isInstancedMesh) continue;
    const g = o.geometry, p = g.parameters || {};
    if (g.type === 'ConeGeometry' && p.radialSegments === 4 && !p.openEnded) { o.geometry = koni(p.radius, p.height); n++; }
    else if (g.type === 'CylinderGeometry' && p.radialSegments === 6 && !p.openEnded && p.radiusTop < p.radiusBottom && p.height > 1) {
      o.geometry = govde(p.radiusTop, p.radiusBottom, p.height, p.radialSegments); n++;
    }
  }
  return n;
}

/* Sahne kurulduktan SONRA (giris.js çağırır): tepe ormanındaki ağaç
   TAÇLARI da kamerayı çeksin.
   Neden: motor ağacı kameraya yalnız gövdesi kadar (.46·o) engel yazar;
   masalların alçak omuz kamerası (eğim .36) tacın altından baktığı için
   yeter. Çiftliğin yüksek kamerası (eğim .8, uzaklık 7.5: yerden ~6
   birim) ise tam taç yüksekliğinde duruyor. Çitin dışında çiftliğe geri
   dönen çocuk fareyi taç kütlesinin arkasında kaybediyordu (ölçüm: ekranın
   %54'ü taç, fare görünmüyor). Bu işlev her tacın yerine, gövdenin AYNI
   çarpışma dairesiyle (.16·o: yürüyüş, itilebilirler ve denetim
   değişmez) taç genişliğinde bir kamera dairesi ekler; motorun Goat
   Simulator kamerası ("araya ağaç girerse kamera karaktere yaklaşır")
   gerisini yapar. Motor değişmez; yalnız bu dünyanın a.engelEkle'si.
   Taçlar: motorun tepe halkasındaki, örnek rengi olan Icosahedron(1, 1)
   InstancedMesh'leri (taç ölçeği 1.35·o, gövde yarıçapı .16·o). */
export function taclariKameraEngeliYap(a) {
  const { THREE } = a;
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  let n = 0;
  for (const o of a.dunya.children) {
    const g = o.geometry;
    if (!o.isInstancedMesh || !o.instanceColor || g?.type !== 'IcosahedronGeometry' || g.parameters?.detail !== 1) continue;
    for (let i = 0; i < o.count; i++) {
      o.getMatrixAt(i, m); m.decompose(p, q, s);
      const boy = s.x / 1.35;
      a.engelEkle(p.x, p.z, .16 * boy, s.x);
      n++;
    }
  }
  return n;
}

/* Sahne kurulduktan SONRA (giris.js çağırır): motorun üç süs bulutu
   ölçeksiz haritaya göre alçakta (y 5.5-8) ve merkeze yakın duruyor. Büyük
   çiftlikte bu, yüksek omuz kamerasının yüksekliği: kamera ambarın,
   korkuluğun ve Dede Ceviz'in üstünde bulutun İÇİNE giriyor, ekran bembeyaz
   oluyordu (ölçüldü: ambarın batısında fare hiç görünmüyor). Bulutlar
   haritayla birlikte dışarı ve yukarı taşınır, biraz büyür; omuz kamerası
   aşağı baktığı için artık kadraja girmez (çizim de azalır), 1. şahıs
   görünümde gökte görünür. Motorun bulut canlandırması x0'ı kullanır. */
export function bulutlariTasi(dunya, olcek = OLCEK) {
  let n = 0;
  for (const g of dunya.children) {
    if (!g.isGroup || !g.userData.hareketli || g.userData.x0 === undefined || g.children.length !== 3) continue;
    if (!g.children.every(m => m.isMesh && m.geometry?.type === 'IcosahedronGeometry' && m.material?.color?.getHex() === 0xf6f6ec)) continue;
    g.userData.x0 *= olcek * 1.25;
    g.position.x = g.userData.x0;
    g.position.z *= olcek * 1.25;
    g.position.y = 15 + n * 1.6;
    g.scale.setScalar(2.2);
    n++;
  }
  return n;
}

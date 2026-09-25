/* Şehir Faresi ile Tarla Faresi için 3B modeller — tür → kurucu(a, ebeveyn, secenek) (bkz. modeller.js).

   Deftere giren iki tür:
     'tarla-faresi'  oyuncunun karakteri: Başak. Ortak fareModeli'nin gövdesi
                     (sivri burun, büyük ince kulak, boncuk göz, uzun çıplak
                     kuyruk) altın-kahve kürkle; omzunda bir arpa başağı,
                     kulağının dibinde bir gelincik.
     'mektup'        durak izi: yol kenarına dikilmiş küçük bir direkte,
                     kırmızı kalp mühürlü bir zarf. Kuzenlerin yazışması.

   Deftere girmeyen ama mekânın kullandığı iki model (adlı dışa aktarım):
     kediModeli      Mestan — kıvrılıp uyuyan tekir ev kedisi: üçgen kulak,
                     pembe burun, kapalı gözler, gövdeye dolanan çizgili kuyruk.
     guvercinModeli  meydan güvercinleri: küçük baş, gri tüy, yeşil-mor
                     boyun, kanatta iki siyah bant, koyu kuyruk ucu, kırmızı
                     ayak, gaganın dibinde beyaz tümsek.

   a = { THREE, mal }. İleri +z, ayaklar y=0. Geometriler bir kez kurulur
   ve dünya dağıtılırken atılmaz (userData.kalici). */

import {fareModeli} from '../modeller.js';

const GEO = new Map();
function geo(anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}
function parcaci(a, ebeveyn) {
  return (geometri, renk, x, y, z, ek) => {
    const m = new a.THREE.Mesh(geometri, a.mal(renk, ek)); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; ebeveyn.add(m); return m;
  };
}
const kureGeo = T => geo('kure', () => new T.IcosahedronGeometry(1, 2));
const silGeo = T => geo('sil', () => new T.CylinderGeometry(1, 1, 1, 10));
const kutuGeo = T => geo('kutu', () => new T.BoxGeometry(1, 1, 1));
const koniGeo = T => geo('koni4', () => new T.ConeGeometry(1, 1, 4));

/* ——— Başak: tarla faresi ——— */
function tarlaFaresi(a, ebeveyn, s = {}) {
  const T = a.THREE;
  const g = fareModeli(a, ebeveyn, { renk: s.renk ?? 0xc08a52, karin: s.karin ?? 0xf7ecd6, ic: s.ic ?? 0xefa99c, olcek: s.olcek ?? 1 });
  const p = parcaci(a, g), kure = kureGeo(T);
  /* Arpa başağı: sağ omzun arkasından yukarı çıkan sap, tepede taneler
     ve uzun kılçıklar. Gövdeyle birlikte yürür. */
  const basak = new T.Group(); basak.position.set(.2, .18, -.02); basak.rotation.set(-.35, 0, -.28); g.add(basak);
  const pb = parcaci(a, basak);
  pb(silGeo(T), 0xb98d3f, 0, .3, 0).scale.set(.014, .62, .014);
  for (let i = 0; i < 5; i++) for (const yon of [-1, 1]) {
    const t = pb(kure, i % 2 ? 0xf0d488 : 0xe7c168, yon * .026, .5 + i * .045, 0);
    t.scale.set(.024, .036, .02); t.rotation.z = yon * -.4;
    const kilcik = pb(silGeo(T), 0xd9b45e, yon * .06, .54 + i * .045, 0);
    kilcik.scale.set(.004, .1, .004); kilcik.rotation.z = yon * -.7;
  }
  pb(kure, 0xf3dc98, 0, .74, 0).scale.set(.02, .04, .02);
  /* Kulağın dibinde bir gelincik */
  const kafa = g.userData.kafa;
  const cicek = new T.Group(); cicek.position.set(-.11, .15, .08); kafa.add(cicek);
  const pc = parcaci(a, cicek);
  for (let i = 0; i < 4; i++) {
    const ac = i / 4 * Math.PI * 2;
    pc(kure, i % 2 ? 0xe2503f : 0xef6a57, Math.cos(ac) * .028, Math.sin(ac) * .028, 0).scale.set(.034, .034, .012);
  }
  pc(kure, 0x2f2a2a, 0, 0, .012).scale.setScalar(.014);
  void p;
  return g;
}

/* ——— Durak izi: mektup direği ——— */
function mektup(a, ebeveyn, s = {}) {
  const T = a.THREE;
  const g = new T.Group(); g.scale.setScalar(s.olcek ?? 1); ebeveyn.add(g);
  const p = parcaci(a, g), kutu = kutuGeo(T);
  p(silGeo(T), 0xa5794d, 0, .2, 0).scale.set(.022, .4, .022);             // direk
  const zarf = new T.Group(); zarf.position.set(0, .5, .03); zarf.rotation.z = -.08; g.add(zarf);
  const pz = parcaci(a, zarf);
  pz(kutu, s.renk ?? 0xfbf4e3, 0, 0, 0).scale.set(.46, .3, .025);
  // Kapak: zarfın önünde ters bir V
  for (const yon of [-1, 1]) {
    const k = pz(kutu, 0xe8dcc0, yon * .116, .064, .016); k.scale.set(.27, .016, .008); k.rotation.z = yon * .5;
  }
  // Kalp mühür
  const kalp = new T.Group(); kalp.position.set(0, -.01, .026); zarf.add(kalp);
  const pk = parcaci(a, kalp);
  pk(kureGeo(T), 0xd9404f, -.018, .012, 0).scale.set(.026, .026, .012);
  pk(kureGeo(T), 0xd9404f, .018, .012, 0).scale.set(.026, .026, .012);
  const uc = pk(geo('kalpUc', () => new T.ConeGeometry(1, 1, 3)), 0xd9404f, 0, -.018, 0);
  uc.scale.set(.036, .04, .012); uc.rotation.z = Math.PI;
  return g;
}

/* ——— Mestan: kıvrılıp uyuyan tekir kedi ———
   Uzunluğu ~1.5, yüksekliği ~.6. userData.nefes gövdedir (tik ile şişer),
   userData.kuyrukUcu kuyruğun ucu (arada bir kıpırdar). */
export function kediModeli(a, ebeveyn, s = {}) {
  const T = a.THREE;
  const g = new T.Group(); g.scale.setScalar(s.olcek ?? 1); ebeveyn.add(g);
  const kurk = s.renk ?? 0xe59c52, cizgi = 0xb8692c, acik = 0xfff4e2, pembe = 0xeea3a0;
  const kure = kureGeo(T);
  const govde = new T.Group(); g.add(govde);
  const pg = parcaci(a, govde);
  pg(kure, kurk, 0, .3, -.1).scale.set(.46, .3, .62);                         // somun gibi gövde
  /* Tekir çizgileri: gövdenin o noktadaki kesitiyle aynı, bir tık büyük ince
     dilimler. Sırttan yanlara sarılan bant gibi görünür; kulp gibi dışarı
     taşmaz (eskiden sırtın üstünde yatay çubuklar gibi duruyordu). */
  for (let i = 0; i < 5; i++) {
    const z = -.52 + i * .17, k = Math.sqrt(Math.max(0, 1 - ((z + .1) / .62) ** 2)) * 1.045;
    pg(kure, 0xa85a22, 0, .3, z).scale.set(.46 * k, .3 * k, .045);
  }
  pg(kure, acik, 0, .22, .34).scale.set(.3, .18, .16);                        // göğüs
  for (const yon of [-1, 1]) pg(kure, acik, yon * .14, .08, .5).scale.set(.1, .07, .16);   // ön patiler (beyaz çorap)
  // Kafa patilerin üstünde, uyuyor
  const kafa = new T.Group(); kafa.position.set(0, .26, .52); kafa.scale.setScalar(1.22); g.add(kafa);
  const pk = parcaci(a, kafa);
  pk(kure, kurk, 0, .06, 0).scale.set(.24, .2, .21);
  pk(kure, acik, 0, 0, .15).scale.set(.13, .09, .08);                         // ağız çevresi
  pk(kure, pembe, 0, .04, .21).scale.set(.028, .02, .018);                    // burun
  for (const yon of [-1, 1]) {
    const kulak = pk(koniGeo(T), kurk, yon * .13, .26, -.02); kulak.scale.set(.1, .17, .07); kulak.rotation.set(0, Math.PI / 4, yon * -.28);
    const ic = pk(koniGeo(T), pembe, yon * .13, .25, .018); ic.scale.set(.06, .12, .03); ic.rotation.set(0, Math.PI / 4, yon * -.28);
    const goz = pk(kutuGeo(T), 0x4a3a33, yon * .085, .09, .19); goz.scale.set(.07, .012, .01); goz.rotation.z = yon * .18;   // kapalı göz
    for (let i = 0; i < 3; i++) {                                               // bıyık
      const b = pk(silGeo(T), 0xf6efe6, yon * .15, .02 - i * .018, .18); b.scale.set(.004, .16, .004);
      b.rotation.z = yon * (Math.PI / 2 + (i - 1) * .15); b.rotation.y = yon * .3;
    }
  }
  pk(kutuGeo(T), cizgi, 0, .2, .06).scale.set(.03, .012, .12);                // alında "M"
  pk(kutuGeo(T), cizgi, -.05, .19, .08).scale.set(.02, .01, .08);
  pk(kutuGeo(T), cizgi, .05, .19, .08).scale.set(.02, .01, .08);
  // Kuyruk: gövdenin çevresine dolanır, ucu koyu
  const kuyruk = new T.Group(); kuyruk.position.set(0, .08, -.1); g.add(kuyruk);
  const egri = new T.CatmullRomCurve3([new T.Vector3(-.05, .1, -.66), new T.Vector3(-.4, .05, -.52),
    new T.Vector3(-.52, .05, -.05), new T.Vector3(-.42, .05, .38), new T.Vector3(-.16, .05, .56)]);
  const km = new T.Mesh(geo('kediKuyruk', () => new T.TubeGeometry(egri, 30, .075, 8, false)), a.mal(kurk));
  km.castShadow = true; kuyruk.add(km);
  for (let i = 1; i < 4; i++) {
    const q = egri.getPoint(i / 4.4);
    const halka = new T.Mesh(kure, a.mal(cizgi)); halka.position.copy(q); halka.scale.set(.082, .082, .05); kuyruk.add(halka);
  }
  const uc = new T.Group(); uc.position.copy(egri.getPoint(1)); kuyruk.add(uc);
  const ucM = new T.Mesh(kure, a.mal(cizgi)); ucM.scale.setScalar(.085); ucM.castShadow = true; uc.add(ucM);
  // Tasma ve zil
  const tasma = new T.Mesh(geo('tasma', () => new T.TorusGeometry(.2, .025, 6, 20)), a.mal(0xc9463f));
  tasma.position.set(0, .2, .38); tasma.rotation.x = Math.PI / 2.3; g.add(tasma);
  const zil = new T.Mesh(kure, a.mal(0xefc54f, { metalness: .4, roughness: .4 })); zil.position.set(0, .12, .5); zil.scale.setScalar(.035); g.add(zil);
  g.userData = { nefes: govde, kuyrukUcu: uc, kafa };
  return g;
}

/* ——— Şehir güvercini ———
   Boyu ~.42. userData.bas başı: tik ile öne arkaya "güvercin yürüyüşü". */
export function guvercinModeli(a, ebeveyn, s = {}) {
  const T = a.THREE;
  const g = new T.Group(); g.scale.setScalar(s.olcek ?? 1); ebeveyn.add(g);
  const p = parcaci(a, g), kure = kureGeo(T), kutu = kutuGeo(T);
  const gri = s.renk ?? 0xa2adba, koyu = 0x2f343b;
  const govde = p(kure, gri, 0, .22, -.02); govde.scale.set(.13, .12, .2); govde.rotation.x = -.18;
  p(kure, 0xc3cbd4, 0, .2, .08).scale.set(.1, .1, .1);                        // göğüs
  for (const yon of [-1, 1]) {
    const kanat = p(kure, 0x8f9aa7, yon * .1, .24, -.05); kanat.scale.set(.04, .09, .17); kanat.rotation.x = -.2;
    for (const [y, z] of [[.245, -.07], [.21, -.1]]) {                          // iki siyah kanat bandı
      const bant = p(kutu, koyu, yon * .136, y, z); bant.scale.set(.012, .022, .11); bant.rotation.x = -.45;
    }
    const bacak = p(silGeo(T), 0xd9534f, yon * .04, .05, .02); bacak.scale.set(.012, .1, .012);
    p(kure, 0xd9534f, yon * .04, .006, .05).scale.set(.022, .008, .04);
  }
  const kuyruk = p(kutu, 0x8a95a3, 0, .2, -.26); kuyruk.scale.set(.1, .02, .14); kuyruk.rotation.x = .25;
  const ucBant = p(kutu, 0x3f4650, 0, .185, -.33); ucBant.scale.set(.1, .022, .04); ucBant.rotation.x = .25;
  // Boyun: yeşil-mor parıltı; baş küçük
  const bas = new T.Group(); bas.position.set(0, .31, .12); g.add(bas);
  const pb = parcaci(a, bas);
  /* Boyun: yanlarda yeşil, göğse doğru mor bir parıltı — ince bir yaka,
     göğüste kocaman bir mor top değil. */
  pb(kure, 0x78a8a2, 0, -.03, -.02, { metalness: .3, roughness: .4 }).scale.set(.072, .08, .068);
  pb(kure, 0x9a86b4, 0, -.065, .005, { metalness: .3, roughness: .4 }).scale.set(.064, .042, .056);
  pb(kure, gri, 0, .04, .02).scale.set(.06, .06, .065);
  const gaga = pb(geo('gaga', () => new T.ConeGeometry(1, 1, 8).rotateX(Math.PI / 2)), 0x4a4f57, 0, .03, .1); gaga.scale.set(.014, .012, .05);
  pb(kure, 0xf4f1ea, 0, .042, .08).scale.set(.015, .01, .014);                // gagadaki beyaz tümsek
  for (const yon of [-1, 1]) {
    pb(kure, 0xf08a3a, yon * .045, .055, .045).scale.setScalar(.014);
    pb(kure, 0x2a2626, yon * .052, .056, .05).scale.setScalar(.007);
  }
  g.userData = { bas };
  return g;
}

export default {
  'tarla-faresi': tarlaFaresi,
  mektup
};

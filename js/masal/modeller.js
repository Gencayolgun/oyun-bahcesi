/* Dünyada tekrar kullanılan canlı modelleri.

   Fare: Aslan ile Fare'de oyuncunun karakteri, durak izleri ve finaldeki
   koloni. Eskiden oyuncu karakteri fare renginde bir KARINCA idi (duyargası
   bile vardı), izler iki küreydi. Bir fareyi fare yapan şeyler:
     · öne doğru sivrilen burun, ucunda pembe burun
     · kafanın üst yanlarında büyük, ince, içi pembe kulaklar
     · küçük parlak boncuk gözler, uzun bıyıklar
     · armut biçimli gövde (arkası dolgun)
     · uzun, ince, çıplak, kıvrılan kuyruk
     · pembe patiler

   Bu dosya three'yi kendisi yüklemez, araç kutusundan alır (a.THREE),
   dolayısıyla derleme betiğinin three yol listesine eklenmesi gerekmez.
   Geometriler modül düzeyinde bir kez kurulur ve dünya dağıtılırken
   atılmaz (userData.kalici). */

const GEO = new Map();
function geo(THREE, anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}

/* ebeveyn: THREE.Group. İleri +z, ayaklar y=0'da. Boyu ~0.75 birim (olcek 1).
   renk: kürk, ic: kulak içi/pati/burun, karin: göğüs. */
export function fareModeli(a, ebeveyn, { renk = 0xb8895a, karin = 0xeedcc2, ic = 0xeaa9a0, olcek = 1 } = {}) {
  const { THREE } = a;
  const g = new THREE.Group(); g.scale.setScalar(olcek); ebeveyn.add(g);
  const parca = (geometri, r, x, y, z, ek) => {
    const m = new THREE.Mesh(geometri, a.mal(r, ek)); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  const kure = geo(THREE, 'kure', () => new THREE.IcosahedronGeometry(1, 2));
  const kureKaba = geo(THREE, 'kureKaba', () => new THREE.IcosahedronGeometry(1, 1));

  // Gövde: armut — arkada dolgun kalça, önde daha dar göğüs
  parca(kure, renk, 0, .27, -.12).scale.set(.3, .27, .36);
  parca(kure, renk, 0, .32, .1).scale.set(.23, .23, .24);
  parca(kure, karin, 0, .26, .2).scale.set(.15, .16, .12);

  // Kafa: yuvarlak arka, öne sivrilen burun
  const kafa = new THREE.Group(); kafa.position.set(0, .45, .3); g.add(kafa);
  const kp = (geometri, r, x, y, z) => {
    const m = new THREE.Mesh(geometri, a.mal(r)); m.position.set(x, y, z);
    m.castShadow = true; kafa.add(m); return m;
  };
  kp(kure, renk, 0, 0, 0).scale.set(.19, .18, .2);
  const burunGeo = geo(THREE, 'burun', () => new THREE.ConeGeometry(1, 1, 14).rotateX(Math.PI / 2));
  kp(burunGeo, renk, 0, -.03, .2).scale.set(.13, .115, .24);
  kp(kure, ic, 0, -.03, .33).scale.setScalar(.04);                 // pembe burun ucu
  kp(kure, karin, 0, -.08, .16).scale.set(.08, .05, .1);             // çene altı açık
  // Boncuk gözler: siyah, üstünde parlama
  for (const yon of [-1, 1]) {
    kp(kure, 0x2a2626, yon * .1, .045, .14).scale.setScalar(.038);
    kp(kureKaba, 0xffffff, yon * .105, .06, .17).scale.setScalar(.012);
  }
  // Kulaklar: büyük, ince disk, içi pembe; hafif dışa ve geriye yatık
  const disk = geo(THREE, 'disk', () => new THREE.CylinderGeometry(1, 1, 1, 22).rotateX(Math.PI / 2));
  for (const yon of [-1, 1]) {
    const k = new THREE.Group(); k.position.set(yon * .15, .17, -.03); k.rotation.set(-.08, yon * -.5, yon * -.32); kafa.add(k);
    const dis = new THREE.Mesh(disk, a.mal(renk)); dis.scale.set(.17, .165, .025); dis.castShadow = true; k.add(dis);
    const icK = new THREE.Mesh(disk, a.mal(ic)); icK.scale.set(.12, .115, .02); icK.position.set(0, -.01, .012); k.add(icK);
  }
  // Bıyıklar: burnun iki yanından yelpaze gibi açılan üçer ince tel.
  // Her tel burundaki bir eksenden döner; eskiden ortalarından çaprazlanıyordu.
  const tel = geo(THREE, 'biyik', () => new THREE.CylinderGeometry(.004, .002, 1, 3).rotateZ(Math.PI / 2).translate(.5, 0, 0));
  for (const yon of [-1, 1]) for (let i = 0; i < 3; i++) {
    const eksen = new THREE.Group(); eksen.position.set(yon * .045, -.035, .27); kafa.add(eksen);
    eksen.rotation.set(0, yon * (.32 + i * .06), yon * (.22 - i * .22));
    const b = new THREE.Mesh(tel, a.mal(0x5d5048)); b.scale.set(yon * .26, 1, 1); eksen.add(b);
  }
  // Kuyruk: uzun, ince, kıvrık; çıplak olduğu için pembemsi. Kökünden
  // döner (sallanırken gövdeden kopmasın diye eğri köke göre kurulu).
  const kuyrukGeo = geo(THREE, 'kuyruk', () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -.1, -.22), new THREE.Vector3(.1, -.12, -.46),
    new THREE.Vector3(.26, -.04, -.6), new THREE.Vector3(.3, .12, -.58)]), 24, .022, 6, false));
  const kuyruk = new THREE.Group(); kuyruk.position.set(0, .2, -.44); g.add(kuyruk);
  const kuyrukM = new THREE.Mesh(kuyrukGeo, a.mal(new THREE.Color(ic).lerp(new THREE.Color(renk), .45).getHex()));
  kuyrukM.castShadow = true; kuyruk.add(kuyrukM);
  // Patiler: uzun pembe arka ayaklar, minik ön patiler
  for (const yon of [-1, 1]) {
    parca(kure, ic, yon * .17, .03, -.14).scale.set(.06, .03, .12);
    parca(kure, ic, yon * .1, .04, .22).scale.set(.04, .03, .06);
  }
  g.userData = { kafa, kuyruk };
  return g;
}

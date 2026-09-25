/* Statik parça birleştirme (Çiftçi Fare).

   Neden: dunya.js'in otomatik instancing'i yalnız AYNI geometri + AYNI
   malzemeyi paylaşan, hareket etmeyen mesh'leri topluyor. Bir tavuk, bir
   ev ya da çiftçi fare ise onlarca farklı renkli küçük parçadan oluşuyor:
   her parça bir çizim çağrısı (+ gölge geçişinde bir tane daha). Burada
   bir grubun parçaları renkleri köşe rengine (vertex color) yazılarak
   malzeme türü başına TEK mesh'e indiriliyor. Görüntü aynı kalıyor.

   BufferGeometryUtils kullanılamıyor: 'three'yi çıplak adla içe aktarıyor,
   paket ise three'yi yalnız dunya.js'ten (yolla) yüklüyor. THREE burada da
   dışarıdan (a.THREE) gelir; derleme betiğinin yol listesi değişmez.

   korunan: ayrı kalması gereken alt gruplar (kafa, kuyruk, bacak...).
   Onların içindeki parçalar kendi gruplarında birleşir; grup dönmeye,
   sallanmaya devam eder.

   sade: true ise ayrıntılı küreler (IcosahedronGeometry detail ≥ 2) bir
   kademe kaba küreyle çizilir: üçgen sayısı dörtte bire iner. Uzaktan
   bakılan hayvanlarda fark görünmez. */

const KABA = new Map();
function kabaKure(THREE, geo) {
  const p = geo.parameters || {};
  const anahtar = `${p.radius}|${p.detail}`;
  let g = KABA.get(anahtar);
  if (!g) { g = new THREE.IcosahedronGeometry(p.radius, Math.max(1, p.detail - 1)); g.userData.kalici = true; KABA.set(anahtar, g); }
  return g;
}

/* a: { THREE, mal } (dünya araç kutusu). grup: THREE.Group (sahnede olması gerekmez).
   Dönen: oluşturulan birleşik mesh'lerin listesi. */
export function birlestir(a, grup, { korunan = [], sade = false, ad = '' } = {}) {
  const { THREE } = a;
  const hedefler = [grup, ...korunan.filter(Boolean)];
  const hedefSet = new Set(hedefler);
  grup.updateMatrixWorld(true);
  const kumeler = new Map();                 // hedef → (malzeme anahtarı → parçalar)
  const bul = m => { for (let p = m.parent; p; p = p.parent) if (hedefSet.has(p)) return p; return null; };
  grup.traverse(o => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return;
    const mt = o.material;
    if (!mt || Array.isArray(mt) || mt.transparent || mt.map || !mt.color || o.userData.birlesme === false) return;
    const h = bul(o); if (!h) return;
    const anahtar = [mt.type, mt.roughness, mt.metalness, mt.side, mt.flatShading, mt.emissive?.getHex?.() ?? 0].join('|');
    let k = kumeler.get(h); if (!k) kumeler.set(h, k = new Map());
    let l = k.get(anahtar); if (!l) k.set(anahtar, l = { mt, parcalar: [] });
    l.parcalar.push(o);
  });
  const sonuc = [];
  const ters = new THREE.Matrix4(), M = new THREE.Matrix4(), N = new THREE.Matrix3();
  const v = new THREE.Vector3(), n = new THREE.Vector3();
  for (const [hedef, k] of kumeler) {
    ters.copy(hedef.matrixWorld).invert();
    for (const { mt, parcalar } of k.values()) {
      if (parcalar.length < 2 && !sade) continue;             // tek parça: birleştirmenin kazancı yok
      let kose = 0, dizin = 0;
      const bilgi = parcalar.map(m => {
        const geo = (sade && m.geometry.type === 'IcosahedronGeometry' && (m.geometry.parameters?.detail ?? 0) >= 2)
          ? kabaKure(THREE, m.geometry) : m.geometry;
        const say = geo.attributes.position.count;
        const isay = geo.index ? geo.index.count : say;
        kose += say; dizin += isay;
        return { m, geo, say, isay };
      });
      const konum = new Float32Array(kose * 3), normal = new Float32Array(kose * 3), renk = new Float32Array(kose * 3);
      const indeks = kose > 65535 ? new Uint32Array(dizin) : new Uint16Array(dizin);
      let ko = 0, io = 0, golge = false;
      for (const { m, geo, say, isay } of bilgi) {
        M.multiplyMatrices(ters, m.matrixWorld);
        N.getNormalMatrix(M);
        const P = geo.attributes.position, Nr = geo.attributes.normal, c = m.material.color;
        for (let i = 0; i < say; i++) {
          v.fromBufferAttribute(P, i).applyMatrix4(M);
          konum[(ko + i) * 3] = v.x; konum[(ko + i) * 3 + 1] = v.y; konum[(ko + i) * 3 + 2] = v.z;
          if (Nr) { n.fromBufferAttribute(Nr, i).applyMatrix3(N).normalize(); } else n.set(0, 1, 0);
          normal[(ko + i) * 3] = n.x; normal[(ko + i) * 3 + 1] = n.y; normal[(ko + i) * 3 + 2] = n.z;
          renk[(ko + i) * 3] = c.r; renk[(ko + i) * 3 + 1] = c.g; renk[(ko + i) * 3 + 2] = c.b;
        }
        /* Aynalı ölçek (bıyığın -x ölçeği gibi) üçgenlerin dönüş yönünü
           çevirir; yoksa o yüzler içten görünür. */
        const ayna = M.determinant() < 0;
        const I = geo.index;
        for (let t = 0; t < isay; t += 3) {
          const a0 = I ? I.getX(t) : t, a1 = I ? I.getX(t + 1) : t + 1, a2 = I ? I.getX(t + 2) : t + 2;
          indeks[io + t] = ko + a0;
          indeks[io + t + 1] = ko + (ayna ? a2 : a1);
          indeks[io + t + 2] = ko + (ayna ? a1 : a2);
        }
        ko += say; io += isay;
        if (m.castShadow) golge = true;
        m.parent.remove(m);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(konum, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(renk, 3));
      geo.setIndex(new THREE.BufferAttribute(indeks, 1));
      geo.computeBoundingSphere(); geo.computeBoundingBox();
      const ek = { vertexColors: true, roughness: mt.roughness, metalness: mt.metalness };
      if (mt.side !== THREE.FrontSide) ek.side = mt.side;
      if (mt.flatShading) ek.flatShading = true;
      const e = mt.emissive?.getHex?.() ?? 0;
      if (e) ek.emissive = e;
      const birlesik = new THREE.Mesh(geo, a.mal(0xffffff, ek));
      birlesik.name = ad ? `${ad}-birlesik` : 'birlesik';
      birlesik.castShadow = golge; birlesik.receiveShadow = true;
      hedef.add(birlesik);
      sonuc.push(birlesik);
    }
  }
  return sonuc;
}

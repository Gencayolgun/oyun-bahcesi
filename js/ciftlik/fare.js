/* Çiftçi Fare — oyuncunun karakteri.

   Masallardaki fare (js/masal/modeller.js fareModeli) aynen kullanılır:
   sivri burun, pembe burun ucu, iri ince kulaklar, boncuk gözler, bıyık,
   armut gövde, uzun çıplak kuyruk. Kürkü DOĞAL renkte kalır (kahve-gri);
   çocuğu ayıran şey kıyafeti:
     · geniş kenarlı HASIR ŞAPKA: açık saman rengi kenar, biraz koyu tepe,
       kenarda örgü halkası; kulaklar şapkanın iki yanından dışarı çıkar
     · şapka bandı ve BOYUN MENDİLİ çocuğun sembol renginde (ortak/turler.js
       RENKLER; varsayılan ilk renk). Mendil boynu saran bir halka ve göğse
       sarkan üçgen uçtan oluşur.

   dunya.js kancası (tarif.piyonModel) bunu çağırır: a = { THREE, mal, ... },
   piyon: içine eklenecek grup, secenek: { olcek, sembolRenk, ... }.
   Dönen grubun userData.kuyruk'u dünya tarafından sallanır.

   Çizim bütçesi: fareModeli ~30 ayrı parça. Kafa (şapka ve mendilin
   kafaya bağlı kısmı dahil), gövde ve kuyruk ayrı ayrı TEK mesh'e
   birleştirilir (birlestir.js): ~60 çizim çağrısı yerine 6. */

import {fareModeli} from '../masal/modeller.js';
import {RENKLER} from './ortak/turler.js';
import {birlestir} from './birlestir.js';

const GEO = new Map();
function geo(anahtar, kur) {
  let g = GEO.get(anahtar);
  if (!g) { g = kur(); g.userData.kalici = true; GEO.set(anahtar, g); }
  return g;
}

export const SAMAN = 0xe9cc7a, SAMAN_KOYU = 0xd4ae5a, SAMAN_ORGU = 0xc79a45;

/* Hasır şapka: kafa grubuna eklenir (kafa oynarsa şapka da oynar).
   Ölçüler fareModeli'nin kafa ölçüsüne göre (kafa küresi ~0.19). */
export function hasirSapka(a, kafa, bantRenk) {
  const { THREE } = a;
  const s = new THREE.Group(); s.name = 'sapka';
  s.position.set(0, .135, .0); s.rotation.x = -.14;                // hafif geriye yatık: yüz görünsün
  kafa.add(s);
  const parca = (g, renk, x, y, z) => {
    const m = new THREE.Mesh(g, a.mal(renk)); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; s.add(m); return m;
  };
  /* Kenar: üstü hafif içe eğik geniş disk (hasır şapkanın düşük konisi). */
  parca(geo('kenar', () => new THREE.CylinderGeometry(.24, .285, .024, 22)), SAMAN, 0, 0, 0);
  // Kenar örgüsü: dış çevrede ince, koyu halka (hasır dokusu okunur)
  const orgu = parca(geo('orgu', () => new THREE.TorusGeometry(.28, .012, 4, 26)), SAMAN_ORGU, 0, -.004, 0);
  orgu.rotation.x = Math.PI / 2;
  // Tepe: yuvarlatılmış silindir + üstte basık kubbe
  parca(geo('tepe', () => new THREE.CylinderGeometry(.11, .128, .13, 14)), SAMAN_KOYU, 0, .075, 0);
  parca(geo('kubbe', () => new THREE.SphereGeometry(.11, 14, 5, 0, Math.PI * 2, 0, Math.PI / 2)), SAMAN_KOYU, 0, .138, 0).scale.y = .42;
  // Bant: sembol renginde, tepenin dibinde
  parca(geo('bant', () => new THREE.CylinderGeometry(.13, .132, .045, 14)), bantRenk, 0, .035, 0);
  return s;
}

/* Boyun mendili: boynu saran kalın halka + göğse sarkan üçgen uç + ensede
   düğüm. Ölçüler fareModeli'ne göre (göğüs küresi (0,.32,.1) ~.23, kafa
   (0,.45,.3) ~.19). Halka boynun eksenine dik (boyun göğüsten kafaya
   öne-yukarı uzanır: eğim ~57°); üst-arka yayı ve yanları kürkün DIŞINDA
   kalır, yüksek omuz kamerası (arkadan-üstten) halkayı ve düğümü görür.
   Üçgen uç göğsün önünde, çenenin altında: önden bakınca görünür.
   (Eskiden halka ve uç kafanın içine gömülüyordu; renk yalnız kulağın
   arkasında küçük bir kanat gibi seçiliyordu.) */
export function boyunMendili(a, g, renk) {
  const { THREE } = a;
  const m = new THREE.Group(); m.name = 'mendil'; g.add(m);
  const parca = (geometri, x, y, z) => {
    const p = new THREE.Mesh(geometri, a.mal(renk)); p.position.set(x, y, z);
    p.castShadow = true; p.receiveShadow = true; m.add(p); return p;
  };
  const halka = parca(geo('mendilHalka2', () => new THREE.TorusGeometry(.2, .048, 6, 20)), 0, .44, .2);
  halka.rotation.x = -.58;                        // halkanın ekseni boyun ekseni (0, .55, .84)
  /* Üçgen uç: 3 kenarlı basık koni, ucu aşağı, düz yüzü öne. */
  const uc = parca(geo('mendilUc2', () => new THREE.ConeGeometry(.13, .21, 3)), 0, .27, .345);
  uc.rotation.x = Math.PI - .22; uc.scale.z = .28;
  const dugum = parca(geo('mendilDugum', () => new THREE.IcosahedronGeometry(.055, 0)), 0, .6, .085);
  dugum.scale.set(1.2, .9, .9);
  return m;
}

/* Kulaklar şapkanın ALTINDAN yana çıksın: fareModeli kulakları kafanın
   tepesinde dik tutuyor, şapka kenarı onları ortadan kesiyordu. Kulak
   grupları (iki disk içeren gruplar) biraz aşağı ve dışa yatırılır. */
function kulaklariYatir(kafa) {
  for (const k of kafa.children) {
    if (!k.isGroup || k.children.length !== 2 || !k.children.every(c => c.isMesh && c.geometry?.type === 'CylinderGeometry')) continue;
    const s = Math.sign(k.position.x) || 1;
    k.position.set(s * .165, .085, -.02);
    k.rotation.set(-.1, s * -.3, s * -.95);
  }
}

/* tarif.piyonModel: dunya.js çağırır. Kürk doğal, kıyafet sembol renginde. */
export function ciftciFare(a, piyon, secenek = {}) {
  const bant = secenek.sembolRenk ?? parseInt(RENKLER[0].slice(1), 16);
  const f = fareModeli(a, piyon, {
    renk: secenek.renk ?? 0xa98463,          // doğal tarla faresi kürkü: sıcak kahve-gri
    karin: secenek.karin ?? 0xecdcc4,
    ic: secenek.ic ?? 0xe9a79c,
    olcek: secenek.olcek ?? 1.05
  });
  const { kafa, kuyruk } = f.userData;
  kulaklariYatir(kafa);
  hasirSapka(a, kafa, bant);
  boyunMendili(a, f, bant);
  f.name = 'ciftci-fare';
  if (secenek.birlestir !== false) birlestir(a, f, { korunan: [kafa, kuyruk], ad: 'fare' });
  f.userData = { kafa, kuyruk, sapka: kafa.getObjectByName('sapka') || true };
  return f;
}

/* Çiftçi Fare — parseller (parsel.js): toprak durumu ve ekin bitkileri.

   Plan: "Harita/KURALLAR" ve "Aşama 1b".
   - Toprak görünüşü parselin ADLI malzemesiyle ('parsel-<id>', mekan.js)
     boyanır: yalnız o parsel değişir. Durumlar:
       sert      açık, tozlu kahve + kuru çatlaklar     (çapa bekler)
       yumusak   koyu, kabarık, keseklerle              (çapalandı, ekim bekler)
       ekili     orta kahve                             (bitki var)
       islak     çok koyu, parlak                       (bugün sulandı)
       kuru      soluk + çatlaklar, bitki sarkık        (susamış: yalnız görünüş)
       aniz      saman sarısı toprak + anız saplakları  (buğday hasadından sonra)
   - Bitkiler parsel başına parça-InstancedMesh (bitki3b.js): t1/t2'de 3×3
     yuva, konu parselinde tek ağaç/tek domates ya da buğday öbeği.
   - Durum değişince HEMEN güncellenir (tik/kare beklenmez): azaltılmış
     harekette de, dünya duraklatılmışken de yeni görünüş hazırdır.
     Kare yalnız 'sabah sürprizi' sekmesini (0,8 sn) oynatır; azaltılmış
     harekette sekme yoktur, bitki doğrudan yeni evrede durur.
   - Değişen her şey parselin hareketli grubunda (mekan.js): motorun
     otomatik instancing'i onlara dokunmaz. */

import {ornekCiz, ornekTemizle, bitkiParcalari, otParcalari, yerlestir, ornekSay, tohumlu} from './bitki3b.js';

export const TOPRAK_RENK = Object.freeze({
  sert: 0xa3876a, yumusak: 0x5a3a27, ekili: 0x6b4830, islak: 0x3a2518, kuru: 0xa8906e, aniz: 0x9a7d52
});
/* Karıklar (t1/t2'nin üç sıra tümseği) yatağın biraz açığı: ışığı daha çok alırlar. */
const KARIK_RENK = Object.freeze({
  sert: 0x9c8264, yumusak: 0x6a4630, ekili: 0x7a5639, islak: 0x4a3222, kuru: 0xa48d6c, aniz: 0xa08658
});
const PURUZ = { islak: .48 };
const CATLAK = 0x6a513a, KESEK = 0x4a3020, ANIZ = 0xd8bd6a;

/* Bitki yuvaları (parselin yerel koordinatı). t1/t2 karıkları x = -1.02, 0, 1.02 boyunca
   (karığın sırtı y ≈ .21: tohum ve filiz sırtın ÜSTÜNDE dursun). Konu parselindeki ortadaki
   kabarık yuvanın tepesi y ≈ .15. Konu köşesi sınıfın gözlem yeri: tek bitki iri çizilir,
   boy çubuğunun yanında büyümesi okunsun (genç ceviz ≈ çubuk boyu). */
function yuvalar(id, tur) {
  const r = tohumlu('yuva:' + id + ':' + tur);
  if (id === 'konu') {
    if (tur === 'bugday') {
      const l = [];
      for (const x of [-.62, 0, .62]) for (const z of [-.62, 0, .62]) l.push({ x: x + (r() - .5) * .08, z: z + (r() - .5) * .08, y: x || z ? .1 : .13, ry: r() * 6.28, s: .9 });
      return l;
    }
    return [{ x: 0, z: 0, y: .14, ry: .6, s: tur === 'domates' ? 1.5 : 1.6 }];
  }
  const l = [];
  for (const x of [-1.02, 0, 1.02]) for (const z of [-1, 0, 1]) l.push({ x: x + (r() - .5) * .06, z: z + (r() - .5) * .1, y: .2, ry: r() * 6.28, s: .92 + r() * .16 });
  return l;
}
const OT_YERI = {
  konu: [[-.72, .62], [.7, -.55], [.62, .72]],
  t1: [[-.5, -.5], [.52, .55], [-.55, .48]],
  t2: [[.5, -.5], [-.52, .52], [.55, .45]]
};

/* Karığın o x'teki sırt yüksekliği (t1/t2: üç tümsek x = -1.02, 0, 1.02; yarıçap .34, tepe .21).
   Konu parselinde karık yok: yatak yüzü. İzler görünsün diye tümseğin üstüne oturur. */
function sirtY(id, x, taban = .062) {
  if (id === 'konu') return taban;
  const d = Math.min(...[-1.02, 0, 1.02].map(k => Math.abs(x - k)));
  return d >= .34 ? taban : Math.max(taban, .06 + .15 * Math.sqrt(1 - (d / .34) ** 2) + .005);
}
/* Toprak izleri: çatlaklar (sert/kuru), kesekler (yumusak), anız (aniz). */
function izParcalari(id, en, durum) {
  const r = tohumlu('iz:' + id + ':' + durum), L = [], yari = en / 2 - .18;
  if (durum === 'sert' || durum === 'kuru') {
    for (let i = 0; i < (id === 'konu' ? 7 : 12); i++) {
      const x = (r() - .5) * 2 * yari, z = (r() - .5) * 2 * yari, a = r() * 6.283, y = sirtY(id, x);
      L.push({ g: 'kutu', r: CATLAK, p: [x, y, z], yon: [Math.cos(a), 0, Math.sin(a)], boy: [.02, .22 + r() * .3, .006] });
      const b = a + (r() - .5) * 1.6;
      L.push({ g: 'kutu', r: CATLAK, p: [x, y, z], yon: [Math.cos(b), 0, Math.sin(b)], boy: [.016, .12 + r() * .16, .006] });
    }
  } else if (durum === 'yumusak') {
    for (let i = 0; i < (id === 'konu' ? 9 : 16); i++) {
      const x = (r() - .5) * 2 * yari;
      L.push({ g: 'kure0', r: KESEK, p: [x, sirtY(id, x, .07), (r() - .5) * 2 * yari], don: r() * 3, boy: [.06 + r() * .04, .04, .05 + r() * .03] });
    }
  } else if (durum === 'aniz') {
    // Biçilmiş sapların dipleri karık sırtlarında sıra sıra (konu parselinde yatak yüzünde)
    for (const x0 of [-1.02, 0, 1.02]) for (let i = 0; i < 12; i++) {
      const x = (id === 'konu' ? x0 * .6 : x0) + (r() - .5) * .36;
      L.push({ g: 'sap', r: ANIZ, p: [x, sirtY(id, x, .06) - .01, (r() - .5) * 2 * yari], yon: [(r() - .5) * .3, 1, (r() - .5) * .3], boy: [.014, .09 + r() * .06, .014] });
    }
  }
  return L;
}

/**
 * @param arac    {THREE, mal}
 * @param tutamak mekan.js tutamağı (parseller: {konu, t1, t2} grupları)
 * @param azHareket azaltılmış hareket: sekme yok
 */
export function parselCizici(arac, tutamak, { azHareket = false, enler = { konu: 2.4, t1: 3.2, t2: 3.2 } } = {}) {
  const { THREE } = arac;
  const kayit = {};
  for (const id of ['konu', 't1', 't2']) {
    const grup = tutamak.parseller?.[id];
    if (!grup) continue;
    const yatak = grup.getObjectByName('yatak');
    const katman = ad => { const g = new THREE.Group(); g.name = ad; grup.add(g); return g; };
    kayit[id] = {
      grup, yatak, karik: grup.getObjectByName('karik-mesh') || null, en: enler[id] ?? 3.2,
      izG: katman('toprak-izi'), otG: katman('ot'), bitkiG: katman('bitki'),
      toprak: null, bitkiAnahtar: null, otAnahtar: null, gosterilen: null, tur: null, anim: null, son: null, sekme: 0
    };
  }

  /**
   * Bir parseli durumuna göre çizer.
   * @param pd  ortak/uygula.js parselDurum(parsel, bugun, sinif) sonucu
   * @param ek  {suBugun: bugün sulandı mı, rol: 'sahip'|'ziyaretci'|'ogretmen'}
   */
  function ciz(id, pd, { suBugun = false, rol = 'sahip' } = {}) {
    const k = kayit[id];
    if (!k || !pd) return null;
    const ev = pd.evre;
    const toprak = !pd.bitkiVar ? (pd.toprak === 'yumusak' || pd.toprak === 'aniz' ? pd.toprak : 'sert')
      : ev?.susamis ? 'kuru' : suBugun ? 'islak' : 'ekili';
    if (toprak !== k.toprak) {
      k.toprak = toprak;
      if (k.yatak) {
        k.yatak.material.color.setHex(TOPRAK_RENK[toprak]);
        k.yatak.material.roughness = PURUZ[toprak] ?? .87;
      }
      if (k.karik) {
        k.karik.material.color.setHex(KARIK_RENK[toprak]);
        k.karik.material.roughness = PURUZ[toprak] ?? .87;
      }
      ornekTemizle(k.izG);
      const iz = izParcalari(id, k.en, toprak);
      if (iz.length) ornekCiz(arac, k.izG, iz, { golge: false, ad: 'toprak-izi' });
    }

    // Sabah sürprizi: sahip, son gördüğü evreyi görür; ilk bakımda ('gordu') yeni evreye seker.
    const gosterilen = ev ? (rol === 'sahip' && ev.yeniEvre ? ev.gorulenEvre : ev.no) : null;
    const bitkiAnahtar = ev ? [ev.tur, gosterilen, ev.susamis, ev.destekVar, ev.urun].join('|') : '';
    if (bitkiAnahtar !== k.bitkiAnahtar) {
      const buyudu = ev && k.tur === ev.tur && k.gosterilen !== null && gosterilen > k.gosterilen;
      k.bitkiAnahtar = bitkiAnahtar;
      ornekTemizle(k.bitkiG);
      if (ev) {
        const hepsi = [];
        yuvalar(id, ev.tur).forEach((y, i) => hepsi.push(...yerlestir(
          bitkiParcalari(ev.tur, gosterilen, { susamis: ev.susamis, destek: ev.destekVar, urun: ev.urun, tohum: `${id}:${i}:${ev.tur}` }), y)));
        ornekCiz(arac, k.bitkiG, hepsi, { ad: 'bitki-' + id });
      }
      k.anim = buyudu && !azHareket ? { t: 0, sure: .8 } : null;
      if (k.anim) k.sekme++;                             // sabah sürprizi sekmesi sayacı (sınama)
      k.bitkiG.scale.set(1, k.anim ? .55 : 1, 1);
      k.tur = ev?.tur ?? null;
      k.gosterilen = gosterilen;
    }

    const ot = ev?.ot || 0;
    if (ot !== k.otAnahtar) {
      k.otAnahtar = ot;
      ornekTemizle(k.otG);
      const L = [];
      for (let i = 0; i < ot; i++) {
        const [x, z] = OT_YERI[id][i % OT_YERI[id].length];
        L.push(...yerlestir(otParcalari(`ot:${id}:${i}`), { x, z, y: .06, ry: i * 2 }));
      }
      if (L.length) ornekCiz(arac, k.otG, L, { ad: 'ot-' + id });
    }
    k.son = {
      toprak, renk: k.yatak ? k.yatak.material.color.getHex() : null, karikRenk: k.karik ? k.karik.material.color.getHex() : null,
      bitki: ev ? { tur: ev.tur, no: gosterilen, gercek: ev.no, ad: ev.ad, yeniEvre: !!ev.yeniEvre, susamis: ev.susamis, destek: ev.destekVar, urun: ev.urun, ornek: ornekSay(k.bitkiG) } : null,
      ot, izOrnek: ornekSay(k.izG), sekme: k.sekme
    };
    return k.son;
  }

  /* Sekme: boy .55 → 1.12 → 1 (0,8 sn). Kare yoksa (duraklatma) bitki yine yeni evrede, yalnız küçük kalır;
     duraklatma bitince tamamlanır. */
  function kare(t, dt) {
    for (const k of Object.values(kayit)) {
      if (!k.anim) continue;
      k.anim.t += dt;
      const o = Math.min(1, k.anim.t / k.anim.sure);
      const s = o < .6 ? .55 + (1.12 - .55) * Math.sin(o / .6 * Math.PI / 2) : 1.12 - .12 * Math.sin((o - .6) / .4 * Math.PI / 2);
      k.bitkiG.scale.set(1, o >= 1 ? 1 : s, 1);          // topraktan yukarı sekerek uzar
      if (o >= 1) k.anim = null;
    }
  }
  /** Sekmeyi hemen bitir (azaltılmış hareket açıldıysa ya da test). */
  function animBitir() { for (const k of Object.values(kayit)) { if (k.anim) { k.anim = null; k.bitkiG.scale.set(1, 1, 1); } } }
  const gorunus = () => Object.fromEntries(Object.entries(kayit).map(([id, k]) => [id, k.son]));
  const sekiyorMu = () => Object.values(kayit).some(k => k.anim);
  return { ciz, kare, gorunus, animBitir, sekiyorMu, kayit };
}

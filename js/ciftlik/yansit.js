/* Çiftçi Fare — durumu dünyaya yansıtma (yansit.js).

   Çiftlik belgesini 3B dünyaya yansıtan TEK yol: ciz(durum, bugun, {sinif, rol}).
   Depodaki her değişiklikte (iyimser komut, eşitleme, gün dönümü, konu
   değişimi) kabuk bunu çağırır; yalnız değişen parçalar yeniden kurulur.

   Yansıtılanlar:
   - Parseller (parsel.js): toprak rengi/izleri, bitkinin evre modeli
     (bitki3b.js), ot kümeleri, destek çubuğu, 'sabah sürprizi'.
   - Konu tabelası: öğretmenin seçtiği konu tohumunun küçük resmi.
   - Dede Ceviz: püskül → yeşil kabuk → çatlak kabuk (+ yere düşen ceviz).
   - Kümes: yemlik dolu/boş, suluk dolu/az, follukta 1-3 yumurta (kapak açık).
     Yem verildiği an tavuklar yemliğin dibine (çitin iç yüzü) koşar.
   - Ambar rafı: hasat FİZİKSEL YIĞIN olarak (çuval, domates kasası, ceviz ve
     yumurta sepeti). Sayı hiçbir yerde gösterilmez.
   - Ziyaret izleri (ziyaret.js izlerKur): kapı panosunda son 12 çıkartma,
     misafirin bugün suladığı bitkinin dibinde onun renginde bayrak.
   - Hasat komutunun hemen ardından ürün (çuval, kasa, sepet) tarladan ambar
     rafına kavis çizerek UÇAR (~1,2 sn; azaltılmış harekette uçuş yok, yığın
     zaten rafta).
   Hepsi hemen uygulanır (tik'e bağlı değil). kare(t, dt) yalnız
   canlandırmaları (bitki sekmesi, tavukların yemliğe koşması) oynatır.

   Hesaplar ortak çekirdekten: parselDurum/konuEsitle (uygula.js),
   dedeEvre (buyume.js), kumesDurum (hayvan.js). Evre, susuzluk, ot,
   olgunluk ve yumurta sayısı SAKLANMAZ; her çizimde hesaplanır. */

import {parselDurum, konuEsitle} from './ortak/uygula.js';
import {dedeEvre} from './ortak/buyume.js';
import {kumesDurum} from './ortak/hayvan.js';
import {PARSELLER} from './ortak/turler.js';
import {parselCizici} from './parsel.js';
import {ornekCiz, ornekTemizle, ornekSay, dedeParcalari, yonAl, BR} from './bitki3b.js';
import {AVLU, PARSEL_YERI} from './mekan.js';
import {izlerKur} from './ziyaret.js';

/* Yığın yerleri (ambar rafının yerel koordinatı; raf ~.54 derin, 1.34 uzun).
   Raf katları y .12 / .62 / 1.12 (üst yüzeyleri +.03). Raf grubu dünyada
   büyütülür (mekan.js RAF_OLCEK): yığın onunla birlikte büyür, yerler aynı kalır. */
const RAF = { alt: .15, orta: .65, ust: 1.15 };
const CAP = { cuval: 28, domates: 20, ceviz: 22, yumurta: 22 };

function cuvalYerleri() {
  const l = [];
  for (const x of [.125, -.125]) for (let i = 0; i < 6; i++) l.push([x, RAF.alt, -.55 + i * .22]);
  for (const kat of [0, 1]) for (const x of [.22, -.02]) for (let i = 0; i < 4; i++) {
    l.push([x + kat * .01, kat * .22, -.98 - i * .23 - kat * .1]);
  }
  return l;
}
/* Sepette yığın: halkalar halinde, üst üste daralarak. */
function yiginYerleri(cx, cz, taban, r, adim) {
  const l = [];
  const katlar = [[7, r], [7, r * .92], [5, r * .7], [3, r * .45]];
  katlar.forEach(([n, rr], k) => {
    for (let i = 0; i < n; i++) {
      if (i === 0 && n === 7) { l.push([cx, taban + k * adim, cz]); continue; }
      const a = i / (n === 7 ? 6 : n) * Math.PI * 2 + k * .5;
      l.push([cx + Math.cos(a) * rr, taban + k * adim, cz + Math.sin(a) * rr]);
    }
  });
  return l;
}
function domatesYerleri() {
  const l = [], y0 = RAF.orta + .12 + .05;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) l.push([-.12 + i * .12, y0, -.52 + j * .12]);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) l.push([-.06 + i * .12, y0 + .08, -.46 + j * .12]);
  l.push([0, y0 + .15, -.4], [0, y0 + .15, -.28]);
  return l;
}

/* Uçuşun kalkış yeri (dünya koordinatı): hasadın yapıldığı yer. */
const UCUS_KAYNAGI = {
  konu: { x: PARSEL_YERI.konu.x, z: PARSEL_YERI.konu.z }, t1: { x: PARSEL_YERI.t1.x, z: PARSEL_YERI.t1.z },
  t2: { x: PARSEL_YERI.t2.x, z: PARSEL_YERI.t2.z }, dede: { x: 10, z: -7.2 }, kumes: { x: 8.4, z: 3.9 }
};
/* Uçan ürün: rafdakinin iri hâli (uzaktan da seçilsin). */
function ucanParcalar(tur) {
  if (tur === 'bugday') return [
    { g: 'kure1', r: 0xd8c393, p: [0, .2, 0], boy: [.24, .3, .22] },
    { g: 'sap', r: 0xc9b07a, p: [0, .44, 0], boy: [.08, .12, .08] },
    { g: 'kure0', r: 0x8a6a3c, p: [0, .48, 0], boy: [.1, .03, .1] }
  ];
  if (tur === 'domates') return [
    { g: 'kutu', r: 0xb88a5a, p: [0, .08, 0], boy: [.5, .16, .36] },
    ...[[-.13, -.06], [.02, .06], [.15, -.05], [-.05, .08]].map(([x, z], i) => ({ g: 'kure1', r: BR.domatesKirmizi, p: [x, .22, z], don: i, boy: [.09, .08, .09], mal: 'parlak' }))
  ];
  const yumurta = tur === 'yumurta';
  return [
    { g: 'sepet', r: yumurta ? 0xb08850 : 0x9c7148, p: [0, 0, 0], boy: [.32, .2, .32] },
    ...[[0, 0], [.1, .05], [-.09, .06], [.03, -.1]].map(([x, z], i) => yumurta
      ? { g: 'kure1', r: i === 1 ? 0xe2c29a : 0xf5ecdc, p: [x, .2, z], don: i, yon: yonAl(i, .4), boy: [.06, .08, .06] }
      : { g: 'kure0', r: BR.ceviz, p: [x, .19, z], don: i, boy: [.07, .06, .07] })
  ];
}

export function yansitKur({ arac, tutamak, azHareket = false }) {
  const { THREE } = arac;
  const ZEMIN = tutamak.zeminY ? tutamak.zeminY(0, 0) : .55;
  const parsel = parselCizici(arac, tutamak, { azHareket });
  const hareketli = (x, z, ry, ad) => {
    const g = new THREE.Group(); g.position.set(x, ZEMIN, z); g.rotation.y = ry; g.name = ad; g.userData.hareketli = true;
    tutamak.dunya.add(g); return g;
  };
  const katman = (ebeveyn, ad) => { const g = new THREE.Group(); g.name = ad; ebeveyn.add(g); return g; };

  const dedeG = hareketli(10, -8, .3, 'dede-meyve');
  const yemG = hareketli(8.38, 5.05, 0, 'yemlik-ici');
  const yumurtaG = tutamak.folluk ? katman(tutamak.folluk, 'yumurtalar') : null;
  const kapak = tutamak.folluk?.getObjectByName('folluk-kapagi') || null;
  const suYuzu = tutamak.suluk?.getObjectByName('su') || null;
  const hasatG = tutamak.raf ? katman(tutamak.raf, 'hasat') : null;
  const tabelaResim = tutamak.tabela?.children.find(o => o.isGroup) || null;
  const izler = izlerKur({ arac, tutamak });

  const tavuklar = (tutamak.hayvanlar || []).filter(n => n.tur === 'tavuk');
  const tavukEvi = tavuklar.map(n => ({ ...n.ev }));
  /* Yemliğin dibi: çitin iç yüzü (çit x0'da; tavuk yarıçapı .3), yemliğe ~1,2 birim. */
  const YEM_YERI = tavuklar.map((_, i) => ({ x: AVLU.x0 + .42 + (i % 2) * .15, z: 4.5 + i * .55 }));
  const YEMEK_SN = 12;                                 // yem yiyen tavuk yanındaki fareden kaçmaz

  const son = { anahtar: {}, gorunus: null, ac: null, cagri: 0, yemek: 0, ambarHam: null };
  const ucanlar = [];                                  // {g, t, sure, a, b, yuk}
  let ucusSay = 0;                                     // başlayan uçuşlar (sınama)

  /* ——— Dede Ceviz ——— */
  function dedeCiz(ev) {
    const urun = ev.urun || 'catlak-kabuk';
    if (son.anahtar.dede === urun) return;
    son.anahtar.dede = urun;
    ornekTemizle(dedeG);
    ornekCiz(arac, dedeG, dedeParcalari(urun), { ad: 'dede-meyve' });
  }

  /* ——— Kümes ——— */
  function kumesCiz(k) {
    const yemAnahtar = k.ac ? 'bos' : 'dolu';
    if (son.anahtar.yem !== yemAnahtar) {
      son.anahtar.yem = yemAnahtar;
      ornekTemizle(yemG);
      const L = [];
      if (!k.ac) {
        L.push({ g: 'kutu', r: 0xd9b45a, p: [0, .37, 0], boy: [.4, .06, .82] });                       // yem yığını
        for (let i = 0; i < 10; i++) L.push({ g: 'kure0', r: i % 2 ? 0xe6c46a : 0xc99a3c, p: [(i % 3 - 1) * .11, .45, -.35 + i * .075], don: i, boy: [.04, .03, .035] });
      } else {
        for (let i = 0; i < 4; i++) L.push({ g: 'kure0', r: 0xc99a3c, p: [(i % 2 - .5) * .15, .29, -.25 + i * .16], don: i, boy: [.025, .015, .02] });   // dipte kalan birkaç tane
      }
      ornekCiz(arac, yemG, L, { ad: 'yem' });
    }
    const suAnahtar = k.susuz ? 'az' : 'dolu';
    if (suYuzu && son.anahtar.su !== suAnahtar) {
      son.anahtar.su = suAnahtar;
      suYuzu.position.y = k.susuz ? .05 : .29;
      suYuzu.scale.set(k.susuz ? .3 : .405, .02, k.susuz ? .3 : .405);
      suYuzu.material.color.setHex(k.susuz ? 0x7f9ea4 : 0x4f9fc4);
    }
    if (yumurtaG && son.anahtar.yumurta !== k.yumurta) {
      son.anahtar.yumurta = k.yumurta;
      ornekTemizle(yumurtaG);
      const yer = [[-.1, -.13], [.06, .06], [-.13, .16]];
      const L = [];
      for (let i = 0; i < Math.min(3, k.yumurta); i++) {
        L.push({ g: 'kure1', r: i === 1 ? 0xe2c29a : 0xf5ecdc, p: [yer[i][0], .86, yer[i][1]], don: i, yon: yonAl(i * 2, 1.2), boy: [.045, .06, .045] });
      }
      if (L.length) ornekCiz(arac, yumurtaG, L, { ad: 'folluk-yumurta' });
      if (kapak) kapak.rotation.z = k.yumurta > 0 ? -1.15 : 0;     // yumurta varsa kapak açık: görünsün
    }
    // Yem verildiği an tavuklar yemliğin dibine koşar; aç günlerde avlunun kendi yerlerine döner.
    if (son.ac === true && !k.ac) {
      son.cagri = azHareket ? 0 : 4;
      son.yemek = YEMEK_SN;
      tavuklar.forEach(n => { n.kacar = false; });
      if (azHareket) tavuklar.forEach((n, i) => { n.x = YEM_YERI[i].x; n.z = YEM_YERI[i].z; n.vx = n.vz = 0; });
    }
    tavuklar.forEach((n, i) => { n.ev = k.ac ? { ...tavukEvi[i] } : { ...YEM_YERI[i] }; });
    son.ac = k.ac;
  }

  /* ——— Hasat ambara uçar ——— */
  function ucur(tur, kaynak) {
    if (azHareket || !hasatG) return;
    const k0 = UCUS_KAYNAGI[kaynak];
    if (!k0) return;
    const b = new THREE.Vector3();
    tutamak.raf.getWorldPosition(b);
    const a = { x: k0.x, y: ZEMIN + .5, z: k0.z };
    const g = hareketli(a.x, a.z, 0, 'ucan-hasat');
    g.position.y = a.y;
    ornekCiz(arac, g, ucanParcalar(tur), { ad: 'ucan-hasat' });
    const uzak = Math.hypot(b.x - a.x, b.z - a.z);
    ucusSay++;
    const olcek = tutamak.raf.scale.y;                            // raf büyütülmüş olabilir (mekan.js RAF_OLCEK)
    ucanlar.push({ g, t: 0, sure: Math.min(1.6, .8 + uzak / 40), a, b: { x: b.x, y: b.y + (RAF.orta + .3) * olcek, z: b.z }, yuk: 1.6 + uzak * .12 });
  }
  function ucusKare(dt) {
    for (let i = ucanlar.length - 1; i >= 0; i--) {
      const u = ucanlar[i];
      u.t += dt;
      const o = Math.min(1, u.t / u.sure), e = o * o * (3 - 2 * o);
      u.g.position.set(u.a.x + (u.b.x - u.a.x) * e, u.a.y + (u.b.y - u.a.y) * e + Math.sin(Math.PI * o) * u.yuk, u.a.z + (u.b.z - u.a.z) * e);
      u.g.rotation.y = o * Math.PI * 2;
      const s = 1 - Math.max(0, o - .8) * 2.5;                     // rafa inerken küçülür (yığına karışır)
      u.g.scale.setScalar(Math.max(.4, s));
      if (o >= 1) { ornekTemizle(u.g); u.g.removeFromParent(); ucanlar.splice(i, 1); }
    }
  }

  /* ——— Ambar ——— */
  function ambarCiz(ambar) {
    if (!hasatG) return;
    const n = {
      cuval: Math.min(CAP.cuval, ambar?.bugday || 0), domates: Math.min(CAP.domates, ambar?.domates || 0),
      ceviz: Math.min(CAP.ceviz, ambar?.ceviz || 0), yumurta: Math.min(CAP.yumurta, ambar?.yumurta || 0)
    };
    const anahtar = JSON.stringify(n);
    if (son.anahtar.ambar === anahtar) return;
    son.anahtar.ambar = anahtar;
    ornekTemizle(hasatG);
    const L = [];
    cuvalYerleri().slice(0, n.cuval).forEach(([x, y, z], i) => {
      L.push({ g: 'kure1', r: 0xd8c393, p: [x, y + .155, z], don: i * .7, boy: [.12, .16, .11] });
      L.push({ g: 'sap', r: 0xc9b07a, p: [x, y + .29, z], boy: [.04, .07, .04] });
      L.push({ g: 'kure0', r: 0x8a6a3c, p: [x, y + .31, z], boy: [.048, .014, .048] });
    });
    if (n.domates) {
      L.push({ g: 'kutu', r: 0xb88a5a, p: [0, RAF.orta, -.33], boy: [.42, .12, .52] });
      domatesYerleri().slice(0, n.domates).forEach(([x, y, z], i) => {
        L.push({ g: 'kure1', r: BR.domatesKirmizi, p: [x, y, z], don: i, boy: [.06, .055, .06], mal: 'parlak' });
        L.push({ g: 'yildiz', r: BR.canak, p: [x, y + .045, z], don: i, boy: [.03, .03, .03] });
      });
    }
    if (n.ceviz) {
      L.push({ g: 'sepet', r: 0x9c7148, p: [0, RAF.orta, .33], boy: [.23, .14, .23] });
      L.push({ g: 'disk', r: 0x8a6440, p: [0, RAF.orta, .33], boy: [.19, .01, .19] });
      yiginYerleri(0, .33, RAF.orta + .05, .14, .062).slice(0, n.ceviz).forEach(([x, y, z], i) => L.push({ g: 'kure0', r: i % 3 ? BR.ceviz : 0x7a5a34, p: [x, y, z], don: i, boy: [.054, .048, .054] }));
    }
    if (n.yumurta) {
      L.push({ g: 'sepet', r: 0xb08850, p: [0, RAF.ust, -.2], boy: [.24, .13, .24] });
      L.push({ g: 'disk', r: 0x9a7444, p: [0, RAF.ust, -.2], boy: [.19, .01, .19] });
      yiginYerleri(0, -.2, RAF.ust + .065, .14, .07).slice(0, n.yumurta).forEach(([x, y, z], i) => L.push({ g: 'kure1', r: i % 4 === 1 ? 0xe2c29a : 0xf5ecdc, p: [x, y, z], don: i, yon: yonAl(i, .4), boy: [.043, .056, .043] }));
    }
    if (L.length) ornekCiz(arac, hasatG, L, { ad: 'ambar-yigin' });
    son.ambar = n;
  }

  /* ——— Konu tabelası: konu tohumunun resmi ——— */
  function tabelaCiz(tur) {
    if (!tabelaResim || son.anahtar.tabela === tur) return;
    son.anahtar.tabela = tur;
    if (!tur) return;                                               // konu yok: mekan.js'in filizi kalır
    for (const o of [...tabelaResim.children]) { tabelaResim.remove(o); if (o.isInstancedMesh) o.dispose(); }
    const L = [];
    if (tur === 'ceviz') {
      L.push({ g: 'kure1', r: BR.ceviz, p: [-.08, .05, .02], boy: [.12, .1, .05] });
      L.push({ g: 'yaprak', r: BR.cevizYaprak, p: [.02, .02, .03], yon: [.7, .7, 0], boy: [.1, .2, 1] });
      L.push({ g: 'yaprak', r: BR.cevizYaprakAcik, p: [.02, .02, .03], yon: [.2, 1, 0], boy: [.09, .18, 1] });
    } else if (tur === 'bugday') {
      L.push({ g: 'sap', r: BR.altinSap, p: [0, -.12, .02], yon: [.15, 1, 0], boy: [.012, .22, .012] });
      L.push({ g: 'kure0', r: BR.altinBasak, p: [.035, .12, .02], yon: [.15, 1, 0], boy: [.04, .11, .02] });
      L.push({ g: 'bicak', r: BR.kuruYaprak, p: [0, -.06, .02], yon: [-.8, .6, 0], boy: [.04, .16, .02] });
    } else if (tur === 'domates') {
      L.push({ g: 'kure1', r: BR.domatesKirmizi, p: [0, .02, .03], boy: [.12, .11, .05], mal: 'parlak' });
      L.push({ g: 'yildiz', r: BR.canak, p: [0, .12, .06], yon: [0, .3, 1], boy: [.07, .07, .07] });
    }
    ornekCiz(arac, tabelaResim, L, { golge: false, ad: 'tabela-resim' });
  }

  /**
   * Tek yansıtma yolu.
   * @param durum  çiftlik belgesi (depo.ciftlik(oid))
   * @param bugun  gün numarası (saat.bugun())
   * @param secenek {sinif, rol: 'sahip' | 'ziyaretci' | 'ogretmen'}
   * @returns gorunus() özeti
   */
  function ciz(durum, bugun, { sinif = null, rol = 'sahip', komut = null } = {}) {
    if (!durum || !Number.isInteger(bugun)) return son.gorunus;
    const d = konuEsitle(durum, sinif, bugun);
    // Hasat/yumurta komutu ambarı artırdıysa ürün kalkış yerinden rafa uçar.
    if (komut && son.ambarHam && (komut.tur === 'hasat' || komut.tur === 'yumurta')) {
      for (const tur of ['bugday', 'domates', 'ceviz', 'yumurta']) {
        if ((d.ambar?.[tur] || 0) > (son.ambarHam[tur] || 0)) { ucur(tur, komut.hedef); break; }
      }
    }
    son.ambarHam = { ...(d.ambar || {}) };
    const parseller = {};
    for (const p of PARSELLER) {
      const pd = parselDurum(d.parseller[p], bugun, sinif);
      const suBugun = !!d.parseller[p].bitki?.su?.includes(bugun);
      parseller[p] = parsel.ciz(p, pd, { suBugun, rol });
    }
    const dede = dedeEvre(d, bugun, sinif);
    dedeCiz(dede);
    const k = kumesDurum(d.kumes, bugun, sinif, d.sahip);
    kumesCiz(k);
    ambarCiz(d.ambar);
    tabelaCiz(sinif?.konu?.tur || null);
    const iz = izler.ciz(d, bugun, sinif);
    son.gorunus = {
      bugun, rol, konu: sinif?.konu?.tur || null, parseller,
      izler: iz,
      dede: { urun: dede.urun, hazir: dede.hasatHazir, meyve: ornekSay(dedeG) },
      kumes: { ac: k.ac, susuz: k.susuz, yumurta: k.yumurta, yemlikDolu: !k.ac, suDolu: !k.susuz, follukYumurta: yumurtaG ? ornekSay(yumurtaG) : 0, kapakAcik: !!kapak && kapak.rotation.z !== 0 },
      ucan: ucanlar.length, ucus: ucusSay,
      ambar: { ...(son.ambar || { cuval: 0, domates: 0, ceviz: 0, yumurta: 0 }), cuvalMesh: hasatG ? hasatG.children.filter(o => o.isInstancedMesh && o.geometry.type === 'IcosahedronGeometry' && o.material.color.getHex() === 0xd8c393).reduce((a, o) => a + o.count, 0) : 0 }
    };
    return son.gorunus;
  }

  function kare(t, dt) {
    parsel.kare(t, dt);
    if (ucanlar.length) ucusKare(Math.min(dt, .1));
    if (son.yemek > 0 && (son.yemek -= dt) <= 0) tavuklar.forEach(n => { n.kacar = true; });
    if (son.cagri > 0) {
      son.cagri -= dt;
      tavuklar.forEach((n, i) => {
        const h = YEM_YERI[i], dx = h.x - n.x, dz = h.z - n.z, u = Math.hypot(dx, dz);
        if (u < .12) { n.vx = n.vz = 0; return; }
        const adim = Math.min(u, 1.9 * dt);
        n.x += dx / u * adim; n.z += dz / u * adim;
        n.vx = dx / u * .9; n.vz = dz / u * .9; n.uyku = false;
      });
    }
  }

  return {
    ciz, kare,
    gorunus: () => son.gorunus,
    sekiyorMu: parsel.sekiyorMu,
    animBitir: parsel.animBitir,
    parsel,
    /** Tavukların yemliğe çağrılması sürüyor mu (test). */
    tavukCagrisi: () => son.cagri > 0,
    /** Ambara uçmakta olan hasat sayısı (test). */
    ucanSay: () => ucanlar.length
  };
}

/* İtilebilir nesneler.

   Goat Simulator'ın asıl duygusu "dünya bana tepki veriyor". Gerçek fizik
   motoru (ragdoll, zincirleme yıkım) bu paketin boyutuna ve çevrimdışı
   çalışma şartına sığmıyor; ama o duygunun ulaşılabilir parçası şu:
   karakter koşarak çarpınca kabak yuvarlanır, koni devrilir, top tepeden
   aşağı kayar, iki top birbirine vurur.

   Model bilerek basit: her nesne yerde kayan bir daire. Hız, sürtünme,
   eğimden gelen ivme, zıplama ve daireler arası çarpışma. Görünen dönüş
   hızdan türetilir (yuvarlanma), devrilme ayrı bir durum.

   Bu dosya three'yi kendisi yüklemez, dunya.js'ten alır. Derleme betiğinin
   three yol listesine eklenmesi gerekmez. */

const TIPLER = {
  //        yuvarlanır  kütle  sürtünme(1 sn'de kalan hız)  devrilir
  top:    { yuvarlanir: true,  kutle: .6, surtunme: .5,  devrilir: false },
  kabak:  { yuvarlanir: true,  kutle: 1.2, surtunme: .32, devrilir: false },
  koni:   { yuvarlanir: false, kutle: .5, surtunme: .12, devrilir: true },
  fici:   { yuvarlanir: false, kutle: 1.4, surtunme: .1,  devrilir: true },
  balya:  { yuvarlanir: false, kutle: 2.2, surtunme: .06, devrilir: false },
  /* Hayvan: kuzu, keçi, tavuk... Yuvarlanmaz, devrilmez; gittiği yöne
     döner. Karakter yaklaşınca kaçar (sürü gütmek böyle çalışır), boşta
     kalınca evinin çevresinde kendi kendine birkaç adım atar. Görünüşü
     mekânın verdiği model işlevinden gelir: itilebilir({ tip: 'hayvan', model }). */
  hayvan: { yuvarlanir: false, kutle: .9, surtunme: .2, devrilir: false, hayvan: true }
};
const YERCEKIMI = 16;

export function itilebilirSistemi({ THREE, dunya, mal, zeminY, engeller, sinir, ses, tohum = 918273 }) {
  const liste = [];
  /* Hayvanların gezintisi için kendi tohumlu üreteci: aynı dünya her açılışta
     aynı davranır (Math.random başka kodla paylaşıldığı için kayıt testlerinde
     ve iki cihaz arasında sonuç tutarsızdı). */
  let rastDurum = tohum >>> 0;
  const rast = () => (rastDurum = (rastDurum * 1664525 + 1013904223) >>> 0) / 4294967296;
  const geo = {
    kure: new THREE.IcosahedronGeometry(1, 2),
    bant: new THREE.TorusGeometry(1, .16, 6, 24),
    silindir: new THREE.CylinderGeometry(1, 1, 1, 14),
    koni: new THREE.ConeGeometry(1, 1, 14),
    kutu: new THREE.BoxGeometry(1, 1, 1)
  };
  const parca = (g, renk, ebeveyn, x = 0, y = 0, z = 0) => {
    const m = new THREE.Mesh(g, mal(renk)); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; ebeveyn.add(m); return m;
  };

  /* Her tipin görünüşü. Pivot nesnenin ağırlık merkezinde; y = zemin + taban. */
  function ciz(tip, r, renk, ikinci, model) {
    const kok = new THREE.Group();          // konum + yere oturma
    kok.userData.hareketli = true;          // otomatik instancing'e girmesin
    const govde = new THREE.Group();        // dönüş (yuvarlanma / devrilme)
    kok.add(govde); dunya.add(kok);
    let taban = r, boy = r * 2;
    if (tip === 'hayvan') {
      if (model) model(govde); else parca(geo.kure, renk, govde, 0, r, 0).scale.setScalar(r);
      taban = 0; boy = r * 2.2;
    } else if (tip === 'top') {
      parca(geo.kure, renk, govde).scale.setScalar(r);
      const b = parca(geo.bant, ikinci ?? 0xf6f1e2, govde); b.scale.setScalar(r * .98);
      const b2 = parca(geo.bant, ikinci ?? 0xf6f1e2, govde); b2.scale.setScalar(r * .98); b2.rotation.y = Math.PI / 2;
    } else if (tip === 'kabak') {
      for (let i = 0; i < 6; i++) {                  // dilimli kabak
        const d = parca(geo.kure, i % 2 ? renk : new THREE.Color(renk).multiplyScalar(.88).getHex(), govde);
        const a = i / 6 * Math.PI * 2;
        d.position.set(Math.cos(a) * r * .32, 0, Math.sin(a) * r * .32);
        d.scale.set(r * .7, r * .78, r * .7);
      }
      parca(geo.silindir, ikinci ?? 0x6f8a45, govde, 0, r * .85, 0).scale.set(r * .1, r * .4, r * .1);
      taban = r * .78; boy = r * 1.6;
    } else if (tip === 'koni') {
      parca(geo.koni, renk, govde, 0, r * .3, 0).scale.set(r * .62, r * 1.9, r * .62);
      parca(geo.silindir, ikinci ?? 0xf6f1e2, govde, 0, r * .45, 0).scale.set(r * .38, r * .28, r * .38);
      parca(geo.kutu, renk, govde, 0, -r * .62, 0).scale.set(r * 1.4, r * .12, r * 1.4);
      taban = r * .68; boy = r * 2;
    } else if (tip === 'fici') {
      parca(geo.silindir, renk, govde).scale.set(r * .8, r * 1.8, r * .8);
      for (const y of [-.55, .55]) parca(geo.silindir, ikinci ?? 0x6b5a45, govde, 0, y * r, 0).scale.set(r * .84, r * .14, r * .84);
      taban = r * .9; boy = r * 1.8;
    } else {                                          // balya
      parca(geo.silindir, renk, govde).scale.set(r * .9, r * 1.4, r * .9);
      for (const y of [-.4, .4]) parca(geo.silindir, ikinci ?? 0xb88f4a, govde, 0, y * r, 0).scale.set(r * .92, r * .08, r * .92);
      govde.rotation.z = Math.PI / 2;               // yan yatık rulo
      taban = r * .9; boy = r * 1.8;
    }
    return { kok, govde, taban, boy };
  }

  /* kacar (varsayılan true): hayvan tipi yaklaşan karakterden kaçar mı.
     itmeTavan (birim/sn, varsayılan yok): karakter çarpınca ya da kovalayınca
     nesnenin kazanabileceği en yüksek yatay hız. Çiftlikte tavuk kaçar ama
     koşan fare çarpınca fırlamaz (itmeTavan: 3). Verilmezse eski davranış. */
  function ekle({ x, z, r = .4, tip = 'top', renk = 0xe0b054, ikinci, yon = 0, model, kacar = true, itmeTavan }) {
    const t = TIPLER[tip] || TIPLER.top;
    const { kok, govde, taban, boy } = ciz(tip, r, renk, ikinci, model);
    const n = {
      tip, t, r, x, z, y: zeminY(x, z) + taban, vx: 0, vz: 0, vy: 0,
      kok, govde, taban, boy, yon, devrik: 0, devrikEksen: new THREE.Vector3(1, 0, 0),
      q: new THREE.Quaternion(), uyku: true, ev: { x, z }, bekle: 2 + rast() * 4,
      kacar: kacar !== false, itmeTavan: itmeTavan > 0 ? itmeTavan : undefined
    };
    if (tip === 'balya' || tip === 'hayvan') n.q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yon);
    n.yaw = yon;
    liste.push(n); yerlestir(n);
    return n;
  }

  const eksenY = new THREE.Vector3(0, 1, 0), gq = new THREE.Quaternion(), ge = new THREE.Vector3();
  function yerlestir(n) {
    n.kok.position.set(n.x, n.y, n.z);
    if (n.tip === 'balya') { n.kok.quaternion.copy(n.q); return; }
    n.kok.quaternion.copy(n.q);
  }

  /* Devrilme: nesne vuruş yönüne doğru 90° yatar, sonra yatık hâlde kayar. */
  function devir(n, nx, nz) {
    if (!n.t.devrilir || n.devrik) return;
    n.devrik = .001;
    n.devrikEksen.set(nz, 0, -nx).normalize();
  }

  function carpismaSesi(hiz, kutle) {
    if (hiz > 1.4) ses?.carpma?.(Math.min(1, hiz / 6) * Math.min(1.2, kutle));
  }

  /* Karakterle etkileşim. Karakter DURMAZ — keçi gibi iter.
     kx,kz: karakter konumu; kvx,kvz: karakterin bu karedeki hızı (birim/sn);
     ky: ayak yüksekliği; KR: karakter yarıçapı. */
  function karakter(kx, kz, ky, kvx, kvz, KR) {
    for (const n of liste) {
      if (ky > n.y + n.boy * .5 - .05) continue;      // üstünden atladı
      const dx = n.x - kx, dz = n.z - kz, d = Math.hypot(dx, dz), en = n.r + KR;
      if (n.t.hayvan && n.kacar && d < en + 1.4 && d > 1e-4) {    // yaklaşan karakterden kaçar: sürü gütme
        let nx = dx / d, nz = dz / d;
        if (n.itmeTavan !== undefined) [nx, nz] = kacisYonu(n, nx, nz, kx, kz, kvx, kvz);
        const mevcut = n.vx * nx + n.vz * nz, hedef = 2.4 * (1 - (d - en) / 1.4) + .6;
        if (hedef > mevcut) { n.vx += nx * (hedef - mevcut); n.vz += nz * (hedef - mevcut); }
        n.uyku = false;
        if (n.itmeTavan !== undefined) tavanla(n);
      }
      if (d >= en) continue;
      const nx = d > 1e-4 ? dx / d : 1, nz = d > 1e-4 ? dz / d : 0;
      if (n.itmeTavan === undefined) { n.x = kx + nx * en; n.z = kz + nz * en; }
      else if (yumusakIt(n, kx, kz, kvx, kvz, nx, nz, en)) { n.uyku = false; continue; }
      const vn = kvx * nx + kvz * nz;                 // karakterin nesneye doğru hızı
      const mevcut = n.vx * nx + n.vz * nz;
      if (vn > .2) {
        const hedef = (vn * 1.45 + 1.1) / Math.sqrt(n.t.kutle);
        if (hedef > mevcut) { n.vx += nx * (hedef - mevcut); n.vz += nz * (hedef - mevcut); }
        // yana doğru küçük bir sapma: hep aynı çizgide gitmesin
        n.vx += -nz * (kvx * -nz + kvz * nx) * .25; n.vz += nx * (kvx * -nz + kvz * nx) * .25;
        if (vn > 3.2 && n.t.yuvarlanir) n.vy = Math.max(n.vy, Math.min(3.6, vn * .5));
        if (vn > 1.1) devir(n, nx, nz);
        carpismaSesi(vn, n.t.kutle);
        if (n.itmeTavan !== undefined) tavanla(n);
      }
      n.uyku = false;
    }
  }
  /* itmeTavan: yatay hız bu sınırı aşmasın (yön korunur, zıplama hızı ayrı). */
  function tavanla(n) {
    const h = Math.hypot(n.vx, n.vz);
    if (h > n.itmeTavan) { n.vx *= n.itmeTavan / h; n.vz *= n.itmeTavan / h; }
  }

  /* ——— Kaçan hayvanın duvar ve çitle ilişkisi (YALNIZ itmeTavan tanımlı
     nesnelerde; masallarda hiç çalışmaz, altın kayıt aynı kalır) ———
     Sorun: karakter nesneyi kendinden en (= r + KR) uzağa koyuyor. Tavuk
     ince bir çite dayanmışken bu nokta çitin ÖTE yanına düşüyordu; sonraki
     adımda çit (ya da çiftliğin görünmez şeridi) onu en yakın yüze, yani
     çoğu kez farenin içinden geçirip geri atıyordu: bir karede .6-.8 birim
     "ışınlanma" (60 sn kovalamacada 25 kez). Çözüm üç parça:
     - kacisYonu: kaçış yönü bir duvara dayanıyorsa kaçış duvar boyunca
       (gerçek tavuk gibi çitin dibinden yana kaçar); sıkışma seyrekleşir.
     - yumusakIt: yine de sıkışırsa nesne duvarın GELDİĞİ yanında kalır ve
       karakterden kurtulacak kadar duvar boyunca kayar; bir karede en çok
       ~9 birim/sn'lik yol alır (ışınlanmaz, akar).
     - nesneler arası çarpışmadan sonra da tavanla (tavuk tavuğa çarpınca
       3 birim/sn aşılıyordu).
     duvarCakisma: (x, z) noktasındaki nesne bir engele giriyorsa dışarı
     çıkarılmış konum ve duvarın normali (nesneye doğru). ox, oz: nesnenin
     önceki konumu; ince duvarın içinden geçildiyse ÖNCEKİ yana çıkarılır. */
  function duvarCakisma(n, x, z, ox, oz) {
    let sonuc = null;
    for (let tur = 0; tur < 2; tur++) {
      let degisti = false;
      for (const o of engeller) {
        if (o.h !== undefined && n.y - n.taban > zeminY(o.x, o.z) + o.h) continue;
        let nx, nz;
        if (o.tip === 'kutu') {
          let lx = (x - o.x) * o.c + (z - o.z) * o.s, lz = -(x - o.x) * o.s + (z - o.z) * o.c;
          const cx = Math.max(-o.hw, Math.min(o.hw, lx)), cz = Math.max(-o.hd, Math.min(o.hd, lz));
          const ax = lx - cx, az = lz - cz, u = Math.hypot(ax, az);
          if (u >= n.r) continue;
          const olx = (ox - o.x) * o.c + (oz - o.z) * o.s, olz = -(ox - o.x) * o.s + (oz - o.z) * o.c;
          const disX = Math.abs(olx) >= o.hw - 1e-6, disZ = Math.abs(olz) >= o.hd - 1e-6;
          let yx = 0, yz = 0;
          if (disX && (Math.sign(lx) !== Math.sign(olx) || Math.abs(lx) < o.hw) && !(disZ && Math.abs(olz) - o.hd > Math.abs(olx) - o.hw)) {
            yx = Math.sign(olx) || 1; lx = yx * (o.hw + n.r);                   // geldiği yana
          } else if (disZ && (Math.sign(lz) !== Math.sign(olz) || Math.abs(lz) < o.hd)) {
            yz = Math.sign(olz) || 1; lz = yz * (o.hd + n.r);
          } else if (u > 1e-4) {
            yx = ax / u; yz = az / u; lx = cx + yx * n.r; lz = cz + yz * n.r;
          } else {                                                            // içeride: en yakın yüz
            const kx = o.hw - Math.abs(lx), kz = o.hd - Math.abs(lz);
            if (kx < kz) { yx = Math.sign(lx) || 1; lx = yx * (o.hw + n.r); } else { yz = Math.sign(lz) || 1; lz = yz * (o.hd + n.r); }
          }
          nx = yx * o.c - yz * o.s; nz = yx * o.s + yz * o.c;
          x = o.x + lx * o.c - lz * o.s; z = o.z + lx * o.s + lz * o.c;
        } else {
          const dx = x - o.x, dz = z - o.z, u = Math.hypot(dx, dz), en = o.r + n.r;
          if (u >= en) continue;
          nx = u > 1e-4 ? dx / u : 1; nz = u > 1e-4 ? dz / u : 0;
          x = o.x + nx * en; z = o.z + nz * en;
        }
        sonuc = { x, z, nx, nz }; degisti = true;
      }
      if (!degisti) break;
    }
    return sonuc;
  }
  /* Kaçış yönü (nx, nz: karakterden uzağa) duvara dayanıyorsa duvar boyunca
     kaçılır; hangi yana: karakterden uzak olan, eşitse karakterin yana
     kaydığı yönün tersi. */
  function kacisYonu(n, nx, nz, kx, kz, kvx, kvz) {
    const ileri = n.r + .35;
    const c = duvarCakisma(n, n.x + nx * ileri, n.z + nz * ileri, n.x, n.z);
    if (!c) return [nx, nz];
    const ic = nx * c.nx + nz * c.nz;
    if (ic >= 0) return [nx, nz];                                    // duvardan uzaklaşıyor
    const tx = -c.nz, tz = c.nx;
    let yon = Math.sign((n.x - kx) * tx + (n.z - kz) * tz);
    if (Math.abs((n.x - kx) * tx + (n.z - kz) * tz) < .05) yon = -Math.sign(kvx * tx + kvz * tz) || 1;
    let fx = nx - ic * c.nx, fz = nz - ic * c.nz;                    // duvara giren bileşen atılır
    if (fx * tx * yon + fz * tz * yon < .5) { fx = tx * yon; fz = tz * yon; }
    const u = Math.hypot(fx, fz) || 1;
    return [fx / u, fz / u];
  }
  /* Karakterin ittiği kaçan hayvan (itmeTavan): nesne karakterden en uzağa
     konacak, ama (1) bir duvara bastırılıyorsa duvarın GELDİĞİ yanında kalır
     ve karakterden kurtulacak kadar duvar boyunca kayar (köşede iki yandan
     köşeden dışarı çıkanı seçilir); (2) bir karede en çok ~9 birim/sn'lik yol
     alır: sıkışmadan kurtulurken bile ışınlanmaz, akarak kayar. Sıkıştıysa
     kayış yönünde kaçar ve true döner (olağan itme hızı eklenmez). */
  function yumusakIt(n, kx, kz, kvx, kvz, nx, nz, en) {
    let hx = kx + nx * en, hz = kz + nz * en, kacis = null;
    const c = duvarCakisma(n, hx, hz, n.x, n.z);
    if (c) {
      hx = c.x; hz = c.z;
      const qx = hx - kx, qz = hz - kz, q2 = qx * qx + qz * qz;
      if (q2 < en * en - 1e-6) {
        const tx = -c.nz, tz = c.nx, qt = qx * tx + qz * tz, kok = Math.sqrt(Math.max(0, qt * qt - q2 + en * en));
        const ilk = Math.abs(qt) > .02 ? Math.sign(qt) : (Math.sign((n.x - kx) * tx + (n.z - kz) * tz) || -Math.sign(kvx * tx + kvz * tz) || 1);
        let enIyi = null;
        for (const yon of [ilk, -ilk]) {
          const s = -qt + yon * kok;
          let px = hx + tx * s, pz = hz + tz * s;
          const c2 = duvarCakisma(n, px, pz, hx, hz);                   // köşe: öbür duvar
          if (c2) { px = c2.x; pz = c2.z; }
          const kalan = Math.max(0, en - Math.hypot(px - kx, pz - kz));
          const bedel = kalan * 10 + Math.abs(s);
          if (!enIyi || bedel < enIyi.bedel - 1e-6) enIyi = { px, pz, yon, bedel };
        }
        hx = enIyi.px; hz = enIyi.pz; kacis = { x: tx * enIyi.yon, z: tz * enIyi.yon };
      }
    }
    const dx = hx - n.x, dz = hz - n.z, L = Math.hypot(dx, dz), sinir = Math.max(.1, 9 * sonDt);
    if (L > sinir) {
      const ax = n.x + dx / L * sinir, az = n.z + dz / L * sinir;
      const c3 = duvarCakisma(n, ax, az, n.x, n.z);
      n.x = c3 ? c3.x : ax; n.z = c3 ? c3.z : az;
    } else { n.x = hx; n.z = hz; }
    if (!kacis) return false;
    const h = Math.max(1.8, n.vx * kacis.x + n.vz * kacis.z);
    n.vx = kacis.x * h; n.vz = kacis.z * h;
    tavanla(n);
    return true;
  }

  const egimOrnek = .25;
  let sonDt = 1 / 60;                               // yalnız yumusakIt okur (itmeTavan)
  function adim(dt) {
    sonDt = dt;
    /* Boştaki hayvanlar arada bir birkaç adım atar; evinden uzaklaştıysa eve doğru.
       Eşdeğerlik testi (tests/dunya-esdeger.spec.js) bunu kapatır: gezinme
       ortam süsüdür ve kare zamanlamasına duyarlıdır. */
    const gezintiYok = typeof window !== 'undefined' && window.__gezintiYok;
    for (const n of liste) {
      if (gezintiYok) break;
      if (!n.t.hayvan || !n.uyku || (n.bekle -= dt) > 0) continue;
      n.bekle = 3 + rast() * 5;
      const ex = n.ev.x - n.x, ez = n.ev.z - n.z, u = Math.hypot(ex, ez);
      const a = u > 2.5 ? Math.atan2(ex, ez) + (rast() - .5) * .6 : rast() * Math.PI * 2;
      const h = .7 + rast() * .6;
      n.vx = Math.sin(a) * h; n.vz = Math.cos(a) * h; n.uyku = false;
    }
    let alt = Math.ceil(dt / (1 / 90));
    const h = dt / alt;
    while (alt-- > 0) altAdim(h);
    for (const n of liste) gorunus(n, dt);
  }

  function altAdim(dt) {
    for (const n of liste) {
      if (n.uyku) continue;
      const yer = zeminY(n.x, n.z) + (n.devrik >= 1 ? n.r * .62 : n.taban);
      const yerde = n.y <= yer + .02;
      if (yerde) {
        /* Eğim: yuvarlanan nesne tepeden aşağı iner. Yatık koni de kayar
           ama ancak eğim belirginse (statik sürtünme). */
        const gx = (zeminY(n.x + egimOrnek, n.z) - zeminY(n.x - egimOrnek, n.z)) / (2 * egimOrnek);
        const gz = (zeminY(n.x, n.z + egimOrnek) - zeminY(n.x, n.z - egimOrnek)) / (2 * egimOrnek);
        const e = Math.hypot(gx, gz);
        const kay = n.t.yuvarlanir ? 7.5 : (n.devrik && e > .22 ? 3 : 0);
        n.vx -= gx * kay * dt; n.vz -= gz * kay * dt;
        const s = Math.pow(n.t.surtunme, dt);
        n.vx *= s; n.vz *= s;
      }
      n.x += n.vx * dt; n.z += n.vz * dt;
      n.vy -= YERCEKIMI * dt; n.y += n.vy * dt;
      const yer2 = zeminY(n.x, n.z) + (n.devrik >= 1 ? n.r * .62 : n.taban);
      if (n.y <= yer2) {
        if (n.vy < -3) { carpismaSesi(-n.vy * .6, n.t.kutle); n.vy = -n.vy * .32; }
        else n.vy = 0;
        n.y = Math.max(n.y, yer2);
        if (n.y < yer2 + .001) n.y = yer2;
      }
      /* Duvarlar ve ağaçlar: dışa it, hızı yansıt (biraz enerji kaybıyla). */
      for (const o of engeller) {
        if (o.h !== undefined && n.y - n.taban > zeminY(o.x, o.z) + o.h) continue;
        let px, pz, u, nx, nz;
        if (o.tip === 'kutu') {
          const lx = (n.x - o.x) * o.c + (n.z - o.z) * o.s, lz = -(n.x - o.x) * o.s + (n.z - o.z) * o.c;
          const cx = Math.max(-o.hw, Math.min(o.hw, lx)), cz = Math.max(-o.hd, Math.min(o.hd, lz));
          let ax = lx - cx, az = lz - cz; u = Math.hypot(ax, az);
          if (u >= n.r) continue;
          if (u < 1e-4) {                             // merkez kutunun içinde: en yakın kenardan çık
            const kx = o.hw - Math.abs(lx), kz = o.hd - Math.abs(lz);
            if (kx < kz) { ax = Math.sign(lx) || 1; az = 0; u = -kx; } else { ax = 0; az = Math.sign(lz) || 1; u = -kz; }
          } else { ax /= u; az /= u; }
          nx = ax * o.c - az * o.s; nz = ax * o.s + az * o.c;
          const it = n.r - u; px = n.x + nx * it; pz = n.z + nz * it;
        } else {
          const dx = n.x - o.x, dz = n.z - o.z; u = Math.hypot(dx, dz);
          const en = o.r + n.r; if (u >= en) continue;
          nx = u > 1e-4 ? dx / u : 1; nz = u > 1e-4 ? dz / u : 0;
          px = o.x + nx * en; pz = o.z + nz * en;
        }
        n.x = px; n.z = pz;
        const vn = n.vx * nx + n.vz * nz;
        if (vn < 0) { n.vx -= 1.5 * vn * nx; n.vz -= 1.5 * vn * nz; carpismaSesi(-vn, n.t.kutle); }
      }
      const s = sinir(n.x, n.z);
      if (s) { n.x = s.x; n.z = s.z; n.vx *= -.4; n.vz *= -.4; }
    }
    /* Nesneler arası: eşit olmayan kütleli esnek çarpışma. */
    for (let i = 0; i < liste.length; i++) for (let j = i + 1; j < liste.length; j++) {
      const a = liste[i], b = liste[j];
      if (a.uyku && b.uyku) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), en = a.r + b.r;
      if (d >= en || d < 1e-5) continue;
      const nx = dx / d, nz = dz / d, it = (en - d) / 2;
      a.x -= nx * it; a.z -= nz * it; b.x += nx * it; b.z += nz * it;
      const rel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (rel < 0) {
        const ma = a.t.kutle, mb = b.t.kutle, j2 = -(1.6) * rel / (1 / ma + 1 / mb);
        a.vx -= j2 / ma * nx; a.vz -= j2 / ma * nz; b.vx += j2 / mb * nx; b.vz += j2 / mb * nz;
        if (a.itmeTavan !== undefined) tavanla(a);
        if (b.itmeTavan !== undefined) tavanla(b);
        if (-rel > 1.2) { devir(a, -nx, -nz); devir(b, nx, nz); }
        carpismaSesi(-rel, Math.min(ma, mb));
      }
      a.uyku = b.uyku = false;
    }
    for (const n of liste) {
      if (!n.uyku && Math.hypot(n.vx, n.vz) < .03 && Math.abs(n.vy) < .05 && (n.devrik === 0 || n.devrik >= 1)) {
        n.vx = n.vz = n.vy = 0; n.uyku = true;
      }
    }
  }

  function gorunus(n, dt) {
    const hiz = Math.hypot(n.vx, n.vz);
    if (n.t.hayvan) {                                   // gittiği yöne döner
      if (hiz > .08) {
        const hedef = Math.atan2(n.vx, n.vz);
        let fark = ((hedef - n.yaw + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
        n.yaw += fark * Math.min(1, dt * 8);
        n.q.setFromAxisAngle(eksenY, n.yaw);
      }
      n.govde.position.y = hiz > .3 ? Math.abs(Math.sin(performance.now() * .014)) * .06 : 0;   // seker
    } else if (n.t.yuvarlanir && hiz > .01) {
      ge.set(n.vz / hiz, 0, -n.vx / hiz);
      gq.setFromAxisAngle(ge, hiz * dt / (n.taban));
      n.q.premultiply(gq);
    } else if (n.devrik > 0 && n.devrik < 1) {
      n.devrik = Math.min(1, n.devrik + dt * 3.2);
      n.uyku = false;
      const e = n.devrik * n.devrik * (3 - 2 * n.devrik);
      n.q.setFromAxisAngle(n.devrikEksen, e * Math.PI / 2);
      if (n.devrik >= 1) carpismaSesi(2.5, n.t.kutle);
    } else if (n.devrik >= 1 && hiz > .01) {
      // yatık koni kendi etrafında döner gibi kayar
      gq.setFromAxisAngle(eksenY, hiz * dt * .8); n.q.premultiply(gq);
    } else if (n.tip === 'balya' && hiz > .01) {
      gq.setFromAxisAngle(eksenY, hiz * dt * .15); n.q.premultiply(gq);
    }
    yerlestir(n);
  }

  /* Dünya her durakta yeniden kuruluyor. Çocuğun devirdiği koni,
     yuvarladığı kabak oradan devam etsin diye durum saklanıp geri yükleniyor. */
  function durum() {
    return liste.map(n => ({ x: n.x, z: n.z, devrik: n.devrik >= 1 ? 1 : 0, q: n.q.toArray() }));
  }
  function yukle(d) {
    if (!Array.isArray(d) || d.length !== liste.length) return;
    liste.forEach((n, i) => {
      const k = d[i]; if (!k) return;
      n.x = k.x; n.z = k.z; n.devrik = k.devrik ? 1 : 0; n.q.fromArray(k.q);
      n.y = zeminY(n.x, n.z) + (n.devrik ? n.r * .62 : n.taban);
      yerlestir(n);
    });
  }
  function hareketliMi() { return liste.some(n => !n.uyku); }
  function dispose() { Object.values(geo).forEach(g => g.dispose()); }

  return { ekle, karakter, adim, durum, yukle, liste, hareketliMi, dispose };
}

import * as THREE from '../vendor/three.module.js';
import {MEKANLAR, ZEMIN} from './mekanlar.js';
import {itilebilirSistemi} from './itilebilir.js';
import {fareModeli} from './modeller.js';
import {EK_MODELLER} from './modeller/liste.js';
/* 3B model defteri: oyuncu karakteri (piyonTur), durak izi (iz) ve sürü hayvanları. */
const MODELLER = Object.assign({ fare: fareModeli }, EK_MODELLER);
import {ses} from '../ses.js';

/* Masal dünyası — ortak iskelet.

   Işık, kameralar, sürekli arazi, çarpışma, yol, duraklar, karakter,
   itilebilir nesneler ve çizim döngüsü burada. Masalın KENDİ yeri
   mekanlar.js'te (ya da mekan/<kod>.js'te) kurulur; hangi mekân olduğunu
   hikâye paketi söyler (masal.dunya.mekan).

   Üç görünüm: omuz üstü (varsayılan, Goat Simulator düzeni), birinci şahıs
   ve üstten harita. Tamamen yerel geometri: CDN, doku dosyası, dış servis
   yok — paket çevrimdışı açılır. */

/* Arazi her mekânda aynı biçimde; yalnız rengi değişiyor. Dünya her durak
   dönüşünde yeniden kuruluyor (40 dakikada ~28 kez) ve 22 bin tepeli araziyi
   her seferinde baştan hesaplamak tablette yarım saniyelik takılma demekti. */
const ARAZI_ONBELLEK = new Map();
/* Çocuğun devirdiği koni, yuvarladığı kabak bir sonraki durakta da orada. */
const NESNE_DURUMU = new Map();

/* Zemin dokusu — dosya değil, kodla üretilir (paket çevrimdışı kalır).
   Düz boyalı zemin "plastik" okunuyordu; bu ince gren ve lekeler toprağı,
   çimi toprak gibi gösteriyor. Değerler 1'e yakın: köşe renkleriyle
   çarpılınca mekânın rengini bozmaz, yalnız dokulandırır. Döşenebilir
   (kenarları birbirine bağlanır). Bir kez üretilir, hiç atılmaz. */
let ZEMIN_DOKU = null;
function zeminDokusu(THREE) {
  if (ZEMIN_DOKU) return ZEMIN_DOKU;
  const N = 256, tuval = document.createElement('canvas'); tuval.width = tuval.height = N;
  const ctx = tuval.getContext('2d'), resim = ctx.createImageData(N, N);
  let t = 918273645;
  const r = () => (t = (t * 1664525 + 1013904223) >>> 0) / 4294967296;
  const katman = k => { const g = new Float32Array(k * k); for (let i = 0; i < g.length; i++) g[i] = r(); return g; };
  const oktavlar = [[4, .34], [8, .28], [16, .2], [32, .12], [64, .06]].map(([k, a]) => ({ k, a, g: katman(k) }));
  const yumu = v => v * v * (3 - 2 * v);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let v = 0;
    for (const { k, a, g } of oktavlar) {
      const fx = x / N * k, fy = y / N * k, x0 = Math.floor(fx), y0 = Math.floor(fy);
      const tx = yumu(fx - x0), ty = yumu(fy - y0), x1 = (x0 + 1) % k, y1 = (y0 + 1) % k;
      const a0 = g[y0 * k + x0] + (g[y0 * k + x1] - g[y0 * k + x0]) * tx;
      const a1 = g[y1 * k + x0] + (g[y1 * k + x1] - g[y1 * k + x0]) * tx;
      v += (a0 + (a1 - a0) * ty) * a;
    }
    const gren = (r() - .5) * .07;
    const l = Math.min(1, .8 + v * .24 + gren);
    const i = (y * N + x) * 4;
    resim.data[i] = 255 * l; resim.data[i + 1] = 255 * Math.min(1, l * 1.005); resim.data[i + 2] = 255 * l * .97; resim.data[i + 3] = 255;
  }
  ctx.putImageData(resim, 0, 0);
  const doku = new THREE.CanvasTexture(tuval);
  doku.wrapS = doku.wrapT = THREE.RepeatWrapping;       // yoksa repeat işe yaramaz
  doku.colorSpace = THREE.SRGBColorSpace;
  ZEMIN_DOKU = doku;
  return doku;
}

export function kurMasalDunyasi(container, secenekler = {}) {
  const masal = secenekler.masal;
  const duraklar = secenekler.duraklar || [];
  const simdi = secenekler.simdi || 0;
  const dolu = Math.max(0, Math.min(1, secenekler.dolu || 0));
  const tarif = masal?.dunya || {};

  /* ——— KANCALAR (Çiftçi Fare için; docs/ciftci-fare-plani.md "MOTOR YAMASI") ———
     Hepsi isteğe bağlı. Tanımlı değilken davranış ve rast() tüketim sırası
     yamadan öncekiyle birebir aynı (tests/dunya-esdeger.spec.js, 10 masalın
     altın kaydı). Yeni bir kanca eklerken bu kurala uy.

     masal.dunya (tarif) alanları:
     a) olcek: sayı > 0, varsayılan 1. Haritayı büyütür: RX/RZ (düz alan ve
        yürünebilir sınır RX·1.95 ile birlikte), tepe kenar sönümü (34/46),
        arazi düzlemi 96·olcek (bölüt sayısı 150 sabit), ağaç/kaya ×olcek,
        tepe çimi ve iç ot ×olcek², sis (46/132) ve yakın kameranın görüş
        mesafesi (far 200) ×olcek; zemin dokusu karosu 2 birimde kalır.
        Arazi önbellek anahtarı olcek 1 iken değişmez. olcek ≠ 1
        iken üstten görünüm ('ustten') desteklenmez: omuz görünümüne düşer.
     b) otYok(x, z) → boolean: true dönen noktalara iç ot (bosMu), tepe
        ağacı, kaya ve çimi (kapali) saçılmaz. Yol, parsel, bina, komşu yolu.
     c) kipAnahtar: görünüm tercihinin localStorage anahtarı (varsayılan
        'masal-gorunum'). kamera: { egim, uzak, surukleDondur } omuz
        kamerasının başlangıç eğimi (rad, varsayılan .36) ve uzaklığı
        (varsayılan 4.4); reset() de bunlara döner. surukleDondur === false
        ise tuval sürüklemesi kamerayı döndürmez/eğmez (dokunarak yürüme ile
        sürükleme yine 8 px eşiğiyle ayrılır).
     d) piyonModel(a, piyon, secenek) → THREE.Object3D: oyuncu karakterini
        masal kendisi çizer (MODELLER'e dışarıdan kayıt yapılamıyor).
        a = { THREE, mal, cisim, kutu, top, silindir, MODELLER }; piyon: içine
        eklenecek grup; secenek: MODELLER modellerine giden aynı nesne
        ({ renk, karin, ic, olcek: 1.05, ...piyonSecenek }). Ayaklar y=0'da,
        ileri +z. Dönen nesne -.34 indirilir; userData.kuyruk varsa sallanır.
        Tanımlıysa piyonTur'dan önce gelir.
     e) baslangic: { x, z, yon? }: durak yokken doğuş noktası ve eveDon()
        hedefi (eskiden (0, 8)). yon: başlangıç bakışı (rad, 0 = +z); yoksa
        haritanın merkezine bakar.

     secenekler alanları:
     g) kare(t, dt): her çizilen kareden SONRA çağrılır (t: sn, dt: sn).
        Duraklatılmışken ya da sekme gizliyken çağrılmaz. Atılan hata döngüyü
        durdurmaz (ilki konsola yazılır).

     Dönen API'deki yeni işlevler:
     f) duraklat(b) → boolean: true dünyayı dondurur (çizim, hareket,
        nesneler, kare()). visibilitychange bunu ezmez. Duraklatılınca
        joystick bırakılır; duraklatılmışken keydown, joystick, Zıpla ve
        tuval dokunuşları yok sayılır (keyup işlenir). Otomatik yürüyüş
        hedefi korunur: duraklat(false) sonrası yürüme sürer. Argümansız
        çağrı yalnız durumu döner.
     g) izdus(x, y, z) → { x, y, gorunur, uzak }: dünya noktasının etkin
        kamerada kaba (container) göre piksel konumu; gorunur: kameranın
        önünde ve ekranın içinde; uzak: kameraya uzaklık (birim).
     h) olcum().kare: cizer.info.render.frame (duraklatma testleri için). */
  const olcek = Number(tarif.olcek) > 0 ? Number(tarif.olcek) : 1;

  const sahne = new THREE.Scene();
  const gokRengi = tarif.gok ?? 0xdce9ef;
  sahne.background = new THREE.Color(gokRengi);
  sahne.fog = new THREE.Fog(gokRengi, 46 * olcek, 132 * olcek);
  /* 4K akıllı tahtada kenar yumuşatma (MSAA) entegre GPU'nun en pahalı
     tek kalemi. Büyük ekranda kapatılıp piksel oranı düşürülüyor. */
  const buyukEkran = (screen.width * screen.height * devicePixelRatio * devicePixelRatio) > 6e6;
  const cizer = new THREE.WebGLRenderer({ antialias: !buyukEkran, alpha: false, powerPreference: 'high-performance' });
  cizer.setPixelRatio(Math.min(devicePixelRatio, buyukEkran ? 1.25 : 1.7));
  // PCFSoftShadowMap bu sürümde uyarı veriyor ve PCF'e düşüyor; doğrudan PCF.
  cizer.shadowMap.enabled = true; cizer.shadowMap.type = THREE.PCFShadowMap;
  cizer.outputColorSpace = THREE.SRGBColorSpace;
  cizer.toneMapping = THREE.ACESFilmicToneMapping; cizer.toneMappingExposure = 1.02;
  cizer.domElement.className = 'dunya-tuvali';
  cizer.domElement.setAttribute('aria-label', `${masal?.ad || 'Masal'} haritası, üç boyutlu`);
  container.append(cizer.domElement);

  const kamera = new THREE.OrthographicCamera(-19, 19, 16, -16, .1, 150);
  /* İkinci kamera: yerden, karakterin arkasından. Koşu sırasında devreye
     girer. Öğretmen kipi seçer ve seçim cihazda saklanır. */
  const yakinKamera = new THREE.PerspectiveCamera(64, 1.6, .08, 200 * olcek);
  const KIP_ANAHTAR = tarif.kipAnahtar || 'masal-gorunum';            // kanca c
  let kip = (() => { try { return localStorage.getItem(KIP_ANAHTAR) || 'omuz'; } catch { return 'omuz'; } })();
  if (olcek !== 1 && kip === 'ustten') kip = 'omuz';                  // kanca a: büyük haritada üstten yok
  let kosuyor = false, kosuT = 0, kosuBas = 0, kosuSon = 0, kosuSure = 0, kosuBitince = null;
  /* SERBEST DOLAŞIM — karakteri oyuncu yönetir.
     Üç girdi birden: akıllı tahta için sanal joystick, dizüstü için ok
     tuşları/WASD, ve yere dokununca oraya yürüme. Hangisi kullanılırsa
     otomatik koşu iptal olur — kontrol oyuncuya geçer. */
  const konum = new THREE.Vector3(0, .9, 0);
  let bakis = 0, yuruyor = false, kolYon = { x: 0, z: 0 }, tusYon = { x: 0, z: 0 };
  let varisNoktasi = null, yakinDurak = -1, yakinKesif = -1;
  /* Üçüncü şahıs kamerası: yönünü oyuncu sürükleyerek belirler, hareket
     kameraya göredir (ileri = ekranın içine). Goat Simulator düzeni. */
  /* Kanca c: masal omuz kamerasının eğimini, uzaklığını ve sürüklemeyle
     dönüp dönmediğini verebilir (çiftlik: yüksek, sabit açı). */
  const EGIM0 = tarif.kamera?.egim ?? .36, UZAK0 = tarif.kamera?.uzak ?? 4.4;
  const surukleDondur = tarif.kamera?.surukleDondur !== false;
  let kameraYaw = 0, kameraEgim = EGIM0, kameraUzak = UZAK0;
  const kameraKonum = new THREE.Vector3(), kameraBak = new THREE.Vector3();
  let kameraHazir = false;
  const HIZ = 6.2;                                        // birim/saniye
  sahne.add(new THREE.HemisphereLight(0xfff6d9, tarif.yansima ?? 0x7f9b76, 2.2));
  const gunes = new THREE.DirectionalLight(0xffe4b1, 3.3);
  /* Gölge kamerası karakteri izler (yakın görünümde): gölge her yerde
     keskin kalır ve karakter tepelere çıkınca kendi gölgesini kaybetmez.
     Üstten görünümde bütün oyun alanını kapsayan sabit çerçeveye döner. */
  const GUNES_YON = new THREE.Vector3(-13, 26, 10);
  gunes.position.copy(GUNES_YON); gunes.castShadow = true;
  Object.assign(gunes.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 1, far: 80 });
  gunes.shadow.mapSize.set(2048, 2048); gunes.shadow.normalBias = .045; gunes.shadow.bias = -.0003;
  sahne.add(gunes); sahne.add(gunes.target);
  let golgeKip = '';
  function golgeIzle() {
    const yakin = kip !== 'ustten';
    const k = yakin ? 15 : 19;
    if (golgeKip !== kip) {
      golgeKip = kip;
      Object.assign(gunes.shadow.camera, { left: -k, right: k, top: k, bottom: -k });
      gunes.shadow.camera.updateProjectionMatrix();
    }
    let hx = 0, hz = 0;
    if (yakin) {
      // Gölge haritası teksel adımına oturtulur; yoksa yürürken gölge kenarları titrer.
      const adim = (2 * k) / gunes.shadow.mapSize.x * 4;
      hx = Math.round(konum.x / adim) * adim; hz = Math.round(konum.z / adim) * adim;
    }
    gunes.target.position.set(hx, 0, hz);
    gunes.position.set(hx + GUNES_YON.x, GUNES_YON.y, hz + GUNES_YON.z);
  }
  const dolgu = new THREE.DirectionalLight(0xd0eeff, 1.2); dolgu.position.set(16, 9, -14); sahne.add(dolgu);

  const iptal = new AbortController();
  const dunya = new THREE.Group(); sahne.add(dunya);
  const malzemeler = new Map();
  const mal = (renk, ek = {}) => {
    const anahtar = renk + JSON.stringify(ek);
    if (!malzemeler.has(anahtar)) malzemeler.set(anahtar, new THREE.MeshStandardMaterial({ color: renk, roughness: .87, ...ek }));
    return malzemeler.get(anahtar);
  };
  const cisim = (geo, renk, x = 0, y = 0, z = 0, ebeveyn = dunya, ek = {}) => {
    const m = new THREE.Mesh(geo, mal(renk, ek)); m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true; ebeveyn.add(m); return m;
  };
  /* Aynı ölçülü geometri bir kez kurulur. Eskiden her çağrı yeni bir
     geometri demekti: 300 prop = 300 ayrı GPU tamponu. */
  const geoOnbellek = new Map();
  const geoAl = (anahtar, kur) => { let g = geoOnbellek.get(anahtar); if (!g) geoOnbellek.set(anahtar, g = kur()); return g; };
  const kutu = (x, y, z, w, h, d, renk, e = dunya) =>
    cisim(geoAl(`k${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d)), renk, x, y, z, e);
  const top = (x, y, z, r, renk, e = dunya, d = 1) =>
    cisim(geoAl(`t${r},${d}`, () => new THREE.IcosahedronGeometry(r, d)), renk, x, y, z, e);
  const silindir = (x, y, z, rt, rb, h, renk, e = dunya, n = 10) =>
    cisim(geoAl(`s${rt},${rb},${h},${n}`, () => new THREE.CylinderGeometry(rt, rb, h, n)), renk, x, y, z, e);
  /* mal() önbelleğinin dışında kurulan malzemeler; dispose'da unutulmasınlar. */
  const ekMalzemeler = [];
  const yeniMalzeme = ayar => { const m = new THREE.MeshStandardMaterial(ayar); ekMalzemeler.push(m); return m; };
  let cekirdek = tarif.cekirdek ?? 20260921;
  const rast = () => (cekirdek = (cekirdek * 1664525 + 1013904223) >>> 0) / 4294967296;

  /* ——— ZEMİN ———
     Tek bir sürekli arazi, ufka kadar. Oyun alanı bir vadinin tabanında:
     içi DÜZ (tarlalar, yollar, duraklar, çitler aynı yükseklikte dursun
     diye), dışarı çıktıkça tepeler yükseliyor ve karakter oralara tırmanıyor.

     Düzlük sınırı çitlerin de dışında (r=1.34): eskiden .92'ydi ve köşedeki
     çit direkleri bir yerde havada, bir yerde yarı gömülü duruyordu.
     Tepeler hep POZİTİF: vadiler uzak zemin düzleminin altına inip düz,
     gölgesiz bir "kapak" gibi görünmesin. */
  const RX = 13.4 * olcek, RZ = 10.2 * olcek;   // kanca a: olcek 1 iken 13.4 / 10.2
  const OYUN_ICI = 1.34;                      // bu orana kadar düz
  const KENAR_IC = 34 * olcek, KENAR_DIS = 46 * olcek, KENAR_EN = 12 * olcek;
  function yukseklik(x, z) {
    const r = Math.hypot(x / RX, z / RZ);
    const d = Math.max(0, Math.min(1, (r - OYUN_ICI) / .95));
    if (d === 0) return 0;
    const yumusak = d * d * (3 - 2 * d);       // kenarda ani sıçrama olmasın
    const u = Math.hypot(x, z), kenar = u < KENAR_IC ? 1 : u > KENAR_DIS ? 0 : 1 - (u - KENAR_IC) / KENAR_EN;
    return kenar * yumusak * ((Math.sin(x * .085) * Math.cos(z * .105) * 2.2 +
                      Math.sin(x * .19 + 1.3) * Math.cos(z * .16 + .7) * .95 +
                      Math.sin(x * .41 + 2.1) * .35) * .72 + 2.6);
  }
  /* Yakın arazi: tepeleri gösterecek kadar bölütlü. Mekân rengine göre önbellekte. */
  const araziAnahtar = String(tarif.cevre ?? 0x9dbb7e) + (olcek !== 1 ? `@${olcek}` : '');
  let yakinGeo = ARAZI_ONBELLEK.get(araziAnahtar);
  if (!yakinGeo) {
    yakinGeo = new THREE.PlaneGeometry(96 * olcek, 96 * olcek, 150, 150);
    const k = yakinGeo.attributes.position, renk = new Float32Array(k.count * 3);
    /* Çayır her yerde aynı ton; tepeler yükseldikçe biraz koyulaşıyor,
       lekeler doğal duruyor. Tek bir geçici renk: 45 bin nesne ayırmıyoruz. */
    const cayir = new THREE.Color(tarif.cevre ?? 0x9dbb7e);
    const koyu = cayir.clone().multiplyScalar(.8), acik = cayir.clone().lerp(new THREE.Color(0xe8e6b8), .25);
    const c = new THREE.Color();
    for (let i = 0; i < k.count; i++) {
      const x = k.getX(i), y = k.getY(i), z = -y;
      const h = yukseklik(x, z);
      k.setZ(i, h);
      const leke = Math.sin(x * .33 + Math.cos(z * .21) * 2) * Math.cos(z * .29) * .5 + .5;
      c.copy(cayir).lerp(acik, leke * .45).lerp(koyu, Math.max(0, Math.min(1, (h - .6) / 3.6)));
      renk[i * 3] = c.r; renk[i * 3 + 1] = c.g; renk[i * 3 + 2] = c.b;
    }
    yakinGeo.setAttribute('color', new THREE.BufferAttribute(renk, 3));
    yakinGeo.computeVertexNormals();
    yakinGeo.userData.kalici = true;
    ARAZI_ONBELLEK.set(araziAnahtar, yakinGeo);
  }
  const doku = zeminDokusu(THREE);
  doku.anisotropy = Math.min(8, cizer.capabilities.getMaxAnisotropy());   // eğik bakışta titremesin
  const araziDoku = doku.clone(); araziDoku.repeat.set(48 * olcek, 48 * olcek);   // 2 birimlik karo
  const ceyrekDoku = doku.clone(); ceyrekDoku.repeat.set(.5, .5);         // şekil UV'si birim cinsinden
  const arazi = new THREE.Mesh(yakinGeo, yeniMalzeme({ vertexColors: true, roughness: .93, map: araziDoku }));
  arazi.rotation.x = -Math.PI / 2; arazi.position.y = ZEMIN;
  arazi.receiveShadow = true; dunya.add(arazi);
  /* Uzak zemin: ufka kadar gider, sisin içinde kaybolur. Arazi hiçbir
     yerde bunun altına inmiyor. */
  const uzak = cisim(new THREE.PlaneGeometry(700, 700), tarif.cevre ?? 0x9dbb7e, 0, ZEMIN - .06, 0);
  uzak.rotation.x = -Math.PI / 2; uzak.castShadow = false; uzak.receiveShadow = false;

  /* Dört bölgeyi boyar. Yerel XY'de kurulur; rotation.x=-90° sonrası
     yerel y dünyada -z olur. Dış köşe tarlanın yuvarlaklığıyla kapanır. */
  const ceyrekRenkleri = [];
  function ceyrek(renkler) {
    ceyrekRenkleri.push(...renkler);
    function sekil(sx, sy) {
      const rx = RX * .956, rz = RZ * .956, k = 2.6 * .956, c = new THREE.Shape();
      c.moveTo(0, 0); c.lineTo(sx * rx, 0); c.lineTo(sx * rx, sy * (rz - k));
      c.quadraticCurveTo(sx * rx, sy * rz, sx * (rx - k), sy * rz);
      c.lineTo(0, sy * rz); c.closePath(); return c;
    }
    [[-1, 1], [1, 1], [1, -1], [-1, -1]].forEach(([sx, sy], b) => {
      /* Arazinin tam üstünde değil, bir tık yukarıda ve derinlik öncelikli:
         aynı düzlemde duran iki yüzey okulun GPU'sunda benek benek titrer. */
      const m = new THREE.Mesh(new THREE.ShapeGeometry(sekil(sx, sy)), yeniMalzeme({ color: renkler[b] ?? 0xb59066,
        roughness: .9, map: ceyrekDoku, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
      m.position.set(0, ZEMIN + .012, 0); dunya.add(m);
      m.rotation.x = -Math.PI / 2; m.castShadow = false; m.receiveShadow = true;
    });
  }

  /* ——— ÇARPIŞMA VE YÜKSELTİ ———
     Engeller iki biçimde: daire (ağaç gövdesi, kaya, direk) ve döndürülmüş
     kutu (ambar duvarı, tribün, çit). Böylece karakter bir binanın ETRAFINDA,
     köşesinden dönerek dolaşıyor; eskiden bina görünmez bir daireydi.

     h: engelin yerden yüksekliği. Ayakları bunun üstündeyse karakter
     geçer — çitin üstünden zıplamak böyle çalışıyor. Verilmezse sonsuz.

     Yükseltiler (tümsek, taş seki, köprü) zemine eklenir: karakter üstüne
     çıkar, iner, düşer. Adım yüksekliğinden dik olanı duvar sayılır. */
  const engeller = [], kameraEngelleri = [];
  const engelEkle = (x, z, r, kr = r, h) => {
    engeller.push({ tip: 'daire', x, z, r, h });
    if (kr > 0) kameraEngelleri.push({ x, z, r: kr });
  };
  const kutuEngel = (x, z, w, d, aci = 0, h, kamera = true) => {
    const c = Math.cos(aci), s2 = -Math.sin(aci);      // aci = three'deki rotation.y
    engeller.push({ tip: 'kutu', x, z, hw: w / 2, hd: d / 2, c, s: s2, h });
    if (kamera) kameraEngelleri.push({ x, z, r: Math.min(w, d) / 2 + .1 });
  };
  const yukseltiler = [];
  /* ust: dünya y'si. yumusak: kubbe (tümsek) mi, düz seki mi. */
  const yukseltiEkle = (x, z, rx, rz, ust, { aci = 0, yumusak = false, kutu = false, taban = ZEMIN } = {}) =>
    yukseltiler.push({ x, z, rx, rz, ust, c: Math.cos(aci), s: -Math.sin(aci), yumusak, kutu, taban });
  function zeminY(x, z) {
    let y = ZEMIN + yukseklik(x, z);
    for (const t of yukseltiler) {
      const lx = (x - t.x) * t.c + (z - t.z) * t.s, lz = -(x - t.x) * t.s + (z - t.z) * t.c;
      let h;
      if (t.kutu) { if (Math.abs(lx) > t.rx || Math.abs(lz) > t.rz) continue; h = t.ust; }
      else {
        const q = (lx / t.rx) ** 2 + (lz / t.rz) ** 2;
        if (q >= 1) continue;
        h = t.yumusak ? t.taban + (t.ust - t.taban) * Math.sqrt(1 - q) : t.ust;
      }
      if (h > y) y = h;
    }
    return y;
  }

  /* ——— Durak yerleşimi: halka ya da pist ———
     Mekândan ÖNCE hesaplanır: mekân süslerini (kaya, çalı, ağaç) yolun ve
     durakların üstüne koymasın diye yolaYakin() ile sorabiliyor. Eskiden
     savanda kayalık sekiler durakların üstüne oturuyordu. */
  const pistMi = tarif.yerlesim === 'pist';
  /* Masal durakların yerini kendisi belirleyebilir: yerlesim bir işlevse
     (duraklar, {RX, RZ}) => [{x, z}] döner; yol o noktalardan geçer.
     yolKapali: halka gibi başa döner mi. Böylece her masalın haritası
     kendi kurgusuna göre biçimlenir (iki yaka, iki mahalle, tırmanan patika). */
  const ozelMi = typeof tarif.yerlesim === 'function';
  const acikYol = pistMi || (ozelMi && !tarif.yolKapali);
  let yolEgri = null;
  const durakT = i => pistMi ? (i + .5) / Math.max(1, duraklar.length)
    : acikYol ? i / Math.max(1, yerler.length - 1)
    : (i % Math.max(1, yerler.length)) / Math.max(1, yerler.length);
  const pistEgri = pistMi ? new THREE.CatmullRomCurve3([
    new THREE.Vector3(-11.6, .52, 7.8), new THREE.Vector3(-7.4, .52, 4.2),
    new THREE.Vector3(-8.6, .52, -1.4), new THREE.Vector3(-3.4, .52, -5.6),
    new THREE.Vector3(2.4, .52, -6.2), new THREE.Vector3(5.6, .52, -1.8),
    new THREE.Vector3(3.8, .52, 3.6), new THREE.Vector3(8.4, .52, 7.2),
    new THREE.Vector3(12.2, .52, 4.4)]) : null;
  const yerler = [];
  if (pistMi) {
    const n = Math.max(1, duraklar.length);
    duraklar.forEach((_, i) => {
      const p = pistEgri.getPoint((i + .5) / n);
      yerler[i] = new THREE.Vector3(p.x, .6, p.z);
    });
  } else if (ozelMi) {
    (tarif.yerlesim(duraklar, { RX, RZ }) || []).forEach((p, i) => { if (p && i < duraklar.length) yerler[i] = new THREE.Vector3(p.x, .6, p.z); });
  } else {
    for (let b = 0; b < 4; b++) {
      const grup = duraklar.map((v, i) => ({ v, i })).filter(x => x.v.bolum === b);
      grup.forEach(({ i }, j) => {
        const aci = -Math.PI + b * Math.PI / 2 + (j + .45) / grup.length * Math.PI / 2;
        yerler[i] = new THREE.Vector3(Math.cos(aci) * 10.6, .6, Math.sin(aci) * 7.9);
      });
    }
  }
  if (pistMi) yolEgri = pistEgri;
  else if (yerler.length > 1) yolEgri = new THREE.CatmullRomCurve3(yerler.map(p => p.clone().setY(.52)), !acikYol, 'catmullrom', .45);
  const yolNoktalari = yolEgri ? yolEgri.getSpacedPoints(200) : [];
  function yolaYakin(x, z, pay = 1) {
    for (const p of yerler) if (p && Math.hypot(p.x - x, p.z - z) < pay + .45) return true;
    for (const p of yolNoktalari) if (Math.abs(p.x - x) < pay && Math.abs(p.z - z) < pay && Math.hypot(p.x - x, p.z - z) < pay) return true;
    return false;
  }

  /* ——— İtilebilir nesneler (bkz. itilebilir.js) ——— */
  const YURUME_RX = RX * 1.95, YURUME_RZ = RZ * 1.95;
  const nesneler = itilebilirSistemi({
    THREE, dunya, mal, zeminY, engeller, ses, tohum: (tarif.cekirdek ?? 20260921) ^ 0x5bd1e995,
    sinir(x, z) {
      const u = Math.hypot(x / YURUME_RX, z / YURUME_RZ);
      return u > 1 ? { x: x / u, z: z / u } : null;
    }
  });

  const mekanKur = MEKANLAR[tarif.mekan] || MEKANLAR.tarla;
  const engelOnce = engeller.length;
  const mekan = mekanKur({ THREE, dunya, mal, cisim, kutu, top, silindir, rast, RX, RZ, ZEMIN, ceyrek, dolu, masal,
    engelEkle, kutuEngel, yukseltiEkle, yolaYakin, itilebilir: nesneler.ekle,
    yerler: yerler.map(p => p && { x: p.x, z: p.z }), duraklar }) || {};
  // Merkez yapısını (ambar, tribün, kaya) çarpışmaya kaydetmemiş bir mekân için yedek
  if (!engeller.slice(engelOnce).some(e => Math.hypot(e.x, e.z - .2) < 3)) engelEkle(0, .2, 2.3, 2.6);
  // Hiç itilebilir nesne koymamış bir mekânda birkaç top olsun: dünya her yerde tepki versin
  if (!nesneler.liste.length) {
    [[-3.6, -4.2, 0xe0b054], [4.2, -3.8, 0x6fa8c4], [3.8, 4.4, 0xd9714f], [-4.4, 3.9, 0x7cae63]]
      .forEach(([x, z, renk]) => nesneler.ekle({ x, z, r: .38, tip: 'top', renk }));
  }
  const nesneAnahtar = (masal?.kod || masal?.ad || 'masal') + ':' + nesneler.liste.length;
  nesneler.yukle(NESNE_DURUMU.get(nesneAnahtar));

  const onOrman = [];
  /* ——— TEPELER: oyun alanının dışını dolduran dünya ———
     Tek tek mesh yerine InstancedMesh: yüzlerce ağaç ve binlerce çim tek
     çizim çağrısında. Entegre GPU'da da kasmasın diye. */
  {
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), olc = new THREE.Vector3(), yer = new THREE.Vector3();
    const eksenY = new THREE.Vector3(0, 1, 0);
    /* Mekân kurulduktan SONRA saçılır: ağaç çitin, kayanın, sekinin,
       yolun içinden çıkmasın. pay: gövdenin engelden uzaklığı. */
    const mekanEngelleri = engeller.slice();
    const otYok = typeof tarif.otYok === 'function' ? tarif.otYok : null;   // kanca b
    const kapali = (x, z, pay) => {
      if (otYok && otYok(x, z)) return true;
      if (zeminY(x, z) > ZEMIN + yukseklik(x, z) + .02) return true;
      if (yolaYakin(x, z, pay + .5)) return true;
      for (const e of mekanEngelleri) {
        if (e.tip === 'kutu') {
          const dx = x - e.x, dz = z - e.z;
          if (Math.abs(dx * e.c + dz * e.s) < e.hw + pay && Math.abs(-dx * e.s + dz * e.c) < e.hd + pay) return true;
        } else if (Math.hypot(x - e.x, z - e.z) < e.r + pay) return true;
      }
      return false;
    };
    const disNokta = (min, max, pay = .6) => {
      for (let deneme = 0; deneme < 40; deneme++) {
        const a = rast() * Math.PI * 2, r = min + rast() * (max - min);
        const x = Math.cos(a) * RX * r, z = Math.sin(a) * RZ * r;
        if (Math.hypot(x / RX, z / RZ) > min && !kapali(x, z, pay)) return { x, z, y: ZEMIN + yukseklik(x, z) };
      }
      return null;
    };
    // kanca a: büyük haritada tepe halkası da büyür; olcek 1 iken 150 / 110 / 1400
    const AGAC = Math.round(150 * olcek), KAYA = Math.round(110 * olcek), CIM = Math.round(1400 * olcek * olcek);
    const govdeGeo = new THREE.CylinderGeometry(.13, .22, 1.6, 6);
    const tacGeo = new THREE.IcosahedronGeometry(1, 1);
    const kayaGeo = new THREE.IcosahedronGeometry(1, 0);
    const cimGeo = new THREE.ConeGeometry(.07, .42, 4);
    /* İki orman: üstten görünümde kameraya bakan ön şerit gizlenir, yoksa
       uzun ağaçlar oyun alanının alt yarısını örtüyor. */
    const govdeler = new THREE.InstancedMesh(govdeGeo, mal(0x8e6a47), AGAC);
    const tacMal = yeniMalzeme({ roughness: .9 });
    const taclar = new THREE.InstancedMesh(tacGeo, tacMal, AGAC);
    const onGovde = new THREE.InstancedMesh(govdeGeo, mal(0x8e6a47), AGAC);
    const onTac = new THREE.InstancedMesh(tacGeo, tacMal, AGAC);
    const kayalar = new THREE.InstancedMesh(kayaGeo, mal(0xa9ae9c), KAYA);
    const cimler = new THREE.InstancedMesh(cimGeo, yeniMalzeme({ roughness: .95 }), CIM);
    const tacRenk = [0x4f9463, 0x5fa46b, 0x3f8560, 0x74b06c, 0x6a9e58];
    const cimRenk = new THREE.Color(tarif.cevre ?? 0x9dbb7e);
    let ai = 0, oi = 0;
    for (let i = 0; i < AGAC; i++) {
      /* 1.22'den başlar: oyun alanıyla orman arasında açık bir çayır
         kuşağı kalır; kamera durağın arkasında ağaç gövdeleri arasına sıkışmaz. */
      const n = disNokta(1.22, 1.98, 1); if (!n) continue;
      /* Gerçek ormanda ağaçlar karakterden uzundur: taç kameranın ÜSTÜNDE
         durur, altından geçilir. Kısa ağaçta kamera tacın içinde kalıyordu. */
      const o = .9 + rast() * .8;
      const onde = n.z > 4 && Math.hypot(n.x / RX, n.z / RZ) < 1.8;
      const [gv, tc, j] = onde ? [onGovde, onTac, oi++] : [govdeler, taclar, ai++];
      yer.set(n.x, n.y + 1.7 * o, n.z); olc.set(o, 2.15 * o, o); q.setFromAxisAngle(eksenY, rast() * 6);
      gv.setMatrixAt(j, m4.compose(yer, q, olc));
      yer.set(n.x, n.y + 4.6 * o, n.z); olc.set(1.35 * o, (1.05 + rast() * .45) * o, 1.35 * o);
      tc.setMatrixAt(j, m4.compose(yer, q, olc));
      tc.setColorAt(j, new THREE.Color(tacRenk[i % tacRenk.length]));
      engelEkle(n.x, n.z, .16 * o, .46 * o);
      if (onde) engeller[engeller.length - 1].onde = true;   // üstten görünmezken çarpmasın
    }
    govdeler.count = taclar.count = ai;
    onGovde.count = onTac.count = oi;
    onOrman.push(onGovde, onTac);
    /* Sayaçla doldur: yer bulunamayan örnek boş kalırsa birim matrisle
       (0,0,0)'da, ambarın içinde bir kaya olarak çiziliyordu. */
    let ki = 0;
    for (let i = 0; i < KAYA; i++) {
      const n = disNokta(1.02, 1.98, .9); if (!n) continue;
      const o = .25 + rast() * .7;
      yer.set(n.x, n.y + o * .35, n.z); olc.set(o * 1.3, o * .7, o); q.setFromAxisAngle(eksenY, rast() * 6);
      kayalar.setMatrixAt(ki++, m4.compose(yer, q, olc));
      if (o > .6) engelEkle(n.x, n.z, o * .85, o * 1.1);
    }
    kayalar.count = ki;
    let ci = 0;
    for (let i = 0; i < CIM; i++) {
      const n = disNokta(.97, 1.99, .15); if (!n) continue;
      const o = .6 + rast() * .9;
      yer.set(n.x, n.y + .2 * o, n.z); olc.set(o, o, o);
      q.setFromAxisAngle(new THREE.Vector3(rast() - .5, 0, rast() - .5).normalize(), (rast() - .5) * .5);
      cimler.setMatrixAt(ci, m4.compose(yer, q, olc));
      cimler.setColorAt(ci++, cimRenk.clone().multiplyScalar(.72 + rast() * .38));
    }
    cimler.count = ci;
    for (const im of [govdeler, taclar, onGovde, onTac, kayalar]) { im.castShadow = true; im.receiveShadow = true; dunya.add(im); }
    cimler.receiveShadow = true; dunya.add(cimler);
  }

  /* Yol ve pist çizimi (tarif.yolCiz === false ise çizilmez: masal kendi
     patikalarını mekânda çiziyor, koşu yine bu eğriyi izler). Duraklar ve yol zemine oturur: parkurun ilk etabı
     tepenin üstünden geçiyor, eskiden tepenin içinden geçiyordu. Koşunun
     parametresi (durakT) özgün eğride kalır; yalnız çizim yeniden örneklenir. */
  for (const p of yerler) if (p) p.y = zeminY(p.x, p.z);
  const zemineOturt = (egri, n, kapali) => {
    const nk = egri.getPoints(n).map(p => new THREE.Vector3(p.x, zeminY(p.x, p.z) - .03, p.z));
    if (kapali) nk.pop();
    return new THREE.CatmullRomCurve3(nk, kapali, 'catmullrom', .5);
  };
  if (tarif.yolCiz === false) {
    /* çizim yok */
  } else if (pistMi) {
    cisim(new THREE.TubeGeometry(zemineOturt(pistEgri, 160, false), 260, .5, 8, false), tarif.yol ?? 0xefe2c0).castShadow = false;
    // Bitiş çizgisi
    const son = pistEgri.getPoint(1), teg = pistEgri.getTangent(1);
    const cizgi = new THREE.Group();
    cizgi.position.set(son.x, zeminY(son.x, son.z) + .01, son.z); cizgi.rotation.y = Math.atan2(teg.x, teg.z);
    dunya.add(cizgi);
    for (let i = 0; i < 6; i++) kutu(-1.1 + i * .44, 0, 0, .44, .04, .5, i % 2 ? 0xf6f1e2 : 0x4d5a4f, cizgi);
    for (const x of [-1.5, 1.5]) silindir(x, .9, 0, .09, .11, 1.8, 0xb98f5e, cizgi, 8);
    kutu(0, 1.85, 0, 3.3, .22, .24, 0xd8a34f, cizgi);
  } else if (yolEgri) {
    cisim(new THREE.TubeGeometry(zemineOturt(yolEgri, 160, !acikYol), 200, .26, 8, !acikYol), tarif.yol ?? 0xefe2c0).castShadow = false;
  }



  /* ——— Oyun alanının içinde yer örtüsü ———
     Tepelerde binlerce ot vardı ama oyun alanının içi çıplak boyalı bir
     yüzeydi; göz tam o sınırda "tepsi kenarı" görüyordu. Şimdi içeride de
     ot kümeleri var — yolun, durakların ve merkezin üstünde değil. Rengi
     bulunduğu bölgenin renginden türüyor (kışın yeşil ot bitmesin). */
  {
    const yolNoktalari = yolEgri ? yolEgri.getSpacedPoints(160) : [];
    const kesifler = tarif.kesif || [];
    const otYok = typeof tarif.otYok === 'function' ? tarif.otYok : null;   // kanca b
    const bosMu = (x, z) => {
      if (otYok && otYok(x, z)) return false;
      if (Math.hypot(x, z - .2) < 3.6) return false;
      for (const p of yerler) if (p && Math.hypot(p.x - x, p.z - z) < 1.1) return false;
      for (const n of kesifler) if (Math.hypot(n.x - x, n.z - z) < 1) return false;
      for (const p of yolNoktalari) if (Math.abs(p.x - x) < .8 && Math.abs(p.z - z) < .8) return false;
      return true;
    };
    const ICOT = Math.round(900 * olcek * olcek);   // kanca a; olcek 1 iken 900
    const icCim = new THREE.InstancedMesh(geoAl('icot', () => new THREE.ConeGeometry(.06, .34, 4)),
      yeniMalzeme({ roughness: .95 }), ICOT);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), olc = new THREE.Vector3(), yer = new THREE.Vector3();
    const eksen = new THREE.Vector3(), renk = new THREE.Color();
    const varsayilan = new THREE.Color(tarif.cevre ?? 0x9dbb7e);
    let n = 0;
    for (let deneme = 0; deneme < ICOT * 3 && n < ICOT; deneme++) {
      const a = rast() * Math.PI * 2, r = Math.sqrt(rast()) * 1.3;
      const x = Math.cos(a) * RX * r, z = Math.sin(a) * RZ * r;
      if (!bosMu(x, z)) continue;
      const bolge = x < 0 ? (z < 0 ? 0 : 3) : (z < 0 ? 1 : 2);
      const r2 = Math.hypot(x / RX, z / RZ);
      if (ceyrekRenkleri.length && r2 < .95) {
        renk.setHex(ceyrekRenkleri[bolge]);
        const hsl = renk.getHSL({});
        if (hsl.l > .72) continue;                       // karın, kumun üstünde ot bitmez
        renk.multiplyScalar(.74);
      } else renk.copy(varsayilan).multiplyScalar(.78);
      // kümeler: her noktaya 1-3 ot
      const kume = 1 + Math.floor(rast() * 3);
      for (let k = 0; k < kume && n < ICOT; k++) {
        const o = .5 + rast() * .7;
        yer.set(x + (rast() - .5) * .3, ZEMIN + .012 + .15 * o, z + (rast() - .5) * .3);
        olc.set(o, o, o);
        q.setFromAxisAngle(eksen.set(rast() - .5, 0, rast() - .5).normalize(), (rast() - .5) * .45);
        icCim.setMatrixAt(n, m4.compose(yer, q, olc));
        icCim.setColorAt(n, renk.clone().multiplyScalar(.85 + rast() * .3));
        n++;
      }
    }
    icCim.count = n; icCim.receiveShadow = true; dunya.add(icCim);
  }

  /* Yarış kurgusu: iki yarışçı pistte kendi yerinde durur. */
  const yarisci = [];
  if (pistMi && secenekler.yaris) {
    const y = secenekler.yaris;
    [[masal.yaris.bizim, y.bizim, false], [masal.yaris.rakip, y.rakip, y.uyku]].forEach(([kisi, yer, uyuyor]) => {
      /* Yarışçılar pistin iki yanında: ortadaki durak taşı çocuğa açık kalsın. */
      const tt = Math.max(.02, Math.min(.99, (yer + .5) / y.n));
      const p0 = pistEgri.getPoint(tt), tg = pistEgri.getTangent(tt), yan = uyuyor === undefined ? 0 : (kisi === masal.yaris.bizim ? -.95 : .95);
      const p = new THREE.Vector3(p0.x - tg.z * yan, 0, p0.z + tg.x * yan);
      const g = new THREE.Group(); g.position.set(p.x, zeminY(p.x, p.z) + .17, p.z); g.userData.y0 = g.position.y; g.userData.hareketli = true; dunya.add(g);
      engelEkle(p.x, p.z, .5, .6, .95);                 // yarışçıya çarpılır, üstünden zıplanır
      const govde = top(0, .3, 0, .46, kisi.renk ?? 0xc98f4e, g, 1); govde.scale.set(1.2, .9, 1);
      top(.34, .42, 0, .3, kisi.bas ?? 0xe0a55c, g, 1);
      top(.3, .48, .16, .05, 0x3b4940, g, 0); top(.3, .48, -.16, .05, 0x3b4940, g, 0);
      if (uyuyor) for (let i = 0; i < 3; i++) {
        const z = top(.1 + i * .22, .95 + i * .3, 0, .1 - i * .02, 0xf2f6f4, g, 1);
        z.castShadow = false; z.material = mal(0xf2f6f4, { transparent: true, opacity: .75 - i * .18 });
      }
      yarisci.push({ g, uyuyor });
    });
  }

  const etiketler = document.createElement('div'); etiketler.className = 'dunya-etiketleri'; container.append(etiketler);
  const izdusum = [], kesifIsaretleri = [];
  yerler.forEach((p, i) => {
    const gecildi = i < simdi, aktif = i === simdi;
    silindir(p.x, p.y + .05, p.z, .37, .43, .22, gecildi ? 0x8aa35f : aktif ? 0xdbb465 : 0xf6eed5, dunya, 24);
    yukseltiEkle(p.x, p.z, .4, .4, p.y + .16);      // durak taşının üstüne çıkılır
    if (aktif) { const halka = cisim(new THREE.TorusGeometry(.55, .055, 6, 40), 0xffe9a6, p.x, p.y + .03, p.z); halka.rotation.x = -Math.PI / 2; }
    const d = duraklar[i], bolum = masal.bolumler[d.bolum];
    const dugme = document.createElement('button');
    dugme.className = 'durak-noktasi' + (gecildi ? ' tamam' : '') + (aktif ? ' aktif' : '');
    dugme.textContent = gecildi ? '✓' : String(i + 1);
    dugme.title = `${i + 1}. durak · ${bolum.ad}${d.tip === 'final' ? ' · Bölüm sonu' : ''}`;
    dugme.setAttribute('aria-label', dugme.title + (aktif ? ' · Görevi aç' : ''));
    dugme.disabled = !aktif || !secenekler.basla;
    if (aktif && secenekler.basla) dugme.onclick = secenekler.basla;
    etiketler.append(dugme); izdusum.push({ el: dugme, p: p.clone().setY(p.y + .35) });
  });
  /* ——— KEŞİF NOKTALARI ———
     Öğretmen geri bildirimi: haritada duraklardan başka tıklanacak bir şey
     yoktu. Bunlar dünyanın içindeki küçük ayrıntılar: tıklanınca kısa bir
     kart açılıyor. Aynı zamanda öğretmenin duraklar arası anlatacağı
     hazır konular — oyunu durdurmadan, istediği zaman. */
  (tarif.kesif || []).forEach((n, i) => {
    /* Keşif noktası neredeyse orada durur: bir kayanın, tepenin üstündeyse
       çocuk oraya tırmanarak ulaşır. */
    const taban = Math.max(.62, zeminY(n.x, n.z) + .07);
    const g = new THREE.Group(); g.position.set(n.x, taban, n.z); g.userData.y0 = taban; g.userData.hareketli = true; dunya.add(g);
    const ayak = silindir(0, .06, 0, .3, .34, .12, 0xf3ead1, g, 16);
    yukseltiEkle(n.x, n.z, .32, .32, taban + .12);
    const isaret = cisim(new THREE.TorusGeometry(.3, .05, 6, 22), tarif.kesifRenk ?? 0xe0b054, 0, .34, 0, g);
    isaret.rotation.x = -Math.PI / 2;
    top(0, .5, 0, .13, tarif.kesifRenk ?? 0xe0b054, g, 1);
    kesifIsaretleri.push(g);
    const d = document.createElement('button');
    d.className = 'kesif-noktasi';
    d.textContent = n.ad;
    d.title = `${n.ad} — keşfet`;
    d.setAttribute('aria-label', `${n.ad}, keşif noktası`);
    d.onclick = () => secenekler.kesfet?.(n);
    if (!secenekler.kesfet) d.disabled = true;
    etiketler.append(d);
    izdusum.push({ el: d, p: new THREE.Vector3(n.x, taban + .53, n.z) });
  });

  /* Bölge etiketleri: halka ve pistte mekânın dört köşesi (bölgeler
     köşelerde kurulu). Masal kendi yerleşimini veriyorsa etiket o bölümün
     duraklarının ortasına konur; paket dunya.bolgeEtiketleri ile de verebilir.
     Eskiden özel yerleşimde de sabit köşeler kullanılıyordu ve yanlış bölümü
     gösteriyordu ("04 Hasat" 1. durağın yanında). */
  const koseler = [[-11.5, -7.8], [11.5, -7.8], [11.5, 8], [-11.5, 8]];
  const bolgeYeri = i => {
    if (tarif.bolgeEtiketleri?.[i]) return tarif.bolgeEtiketleri[i];
    if (!ozelMi) return koseler[i];
    const bu = yerler.filter((p, j) => p && duraklar[j]?.bolum === i);
    if (!bu.length) return null;
    return [bu.reduce((t, p) => t + p.x, 0) / bu.length, bu.reduce((t, p) => t + p.z, 0) / bu.length];
  };
  masal.bolumler.forEach((bolum, i) => {
    const yer = i < 4 || tarif.bolgeEtiketleri ? bolgeYeri(i) : null; if (!yer) return;
    const [x, z] = yer;
    const e = document.createElement('div'); e.className = 'bolge-etiketi';
    e.innerHTML = `<span>0${i + 1}</span> ${bolum.ad}`;
    etiketler.append(e); izdusum.push({ el: e, p: new THREE.Vector3(x, (ozelMi ? zeminY(x, z) - ZEMIN : 0) + 2.2, z) });
  });

  /* ——— İZ: her tamamlanan durak dünyada kalıcı bir şey bırakır ———
     Öğretmen geri bildirimi: "görevi yaptım ve tik geldi" yerine
     "ben bunu yaptım ve dünya gerçekten değişti" hissi olmalı. Bu yüzden
     çözülen her durak, tam o noktanın yanına bir şey dikiyor. Sonuncusu
     haritaya dönüldüğünde gözün önünde beliriyor. */
  const izler = [];
  function izCiz(tip, x, z, olcek) {
    const g = new THREE.Group(); g.position.set(x, zeminY(x, z) + .03, z); g.scale.setScalar(olcek); dunya.add(g);
    if (tip === 'bayrak') {
      silindir(0, .42, 0, .04, .05, .84, 0xb08a5c, g, 6);
      const bez = kutu(.26, .68, 0, .48, .3, .04, tarif.izRenk ?? 0xd9714f, g);
      bez.userData.dalga = true;
    } else if (MODELLER[tip]) {
      MODELLER[tip]({ THREE, mal }, g, { renk: tarif.izRenk, olcek: .42, iz: true });
    } else {                                              // filiz
      silindir(0, .26, 0, .035, .05, .52, 0x7d9a52, g, 5);
      const y1 = top(-.16, .44, 0, .17, tarif.izRenk ?? 0x86c06a, g, 1); y1.scale.set(1.2, .42, .8); y1.rotation.z = .5;
      const y2 = top(.15, .56, .04, .15, tarif.izRenk ?? 0x9ed081, g, 1); y2.scale.set(1.2, .42, .8); y2.rotation.z = -.55;
    }
    return g;
  }
  const izTipi = tarif.iz || 'filiz';
  yerler.forEach((p, i) => {
    if (i >= simdi) return;
    // Halkanın/pistin biraz iç tarafına, durağın yanına
    const ic = pistMi ? .78 : .86;
    const x = p.x * ic + (rast() - .5) * .7, z = p.z * ic + (rast() - .5) * .7;
    const g = izCiz(izTipi, pistMi ? p.x + (rast() - .5) * 1.8 : x, pistMi ? p.z + 1.5 + rast() * .6 : z, 1.9 + rast() * .5);
    g.rotation.y = rast() * 6;
    /* Yalnız en yeni iz canlı (büyüyerek belirir). Eskiler durağan kalır ki
       otomatik instancing onları toplasın: 27 ayrıntılı fare izi tek tek
       çizilince Aslan'ın son bölümü 1300 çizim çağrısına çıkıyordu. */
    const yeni = i === simdi - 1;
    if (yeni) g.userData.hareketli = true;
    izler.push({ g, olcek: g.scale.x, yeni, r0: g.rotation.y });
  });
  const yeniIz = izler.find(x => x.yeni);
  if (yeniIz) yeniIz.g.scale.setScalar(0);        // haritaya dönünce büyüyerek belirir

  /* ——— Piyon: sırası gelen çocuğun simgesi ———
     Yarışta da görünür: açık dünyada gezen çocuğun kendini görmesi gerek.
     Yarışçılar pistte kendi yerlerinde duruyor, piyon onların arasında. */
  const piyon = new THREE.Group(); piyon.userData.hareketli = true;
  const baslangicSira = secenekler.oncekiSira != null ? secenekler.oncekiSira : simdi;
  /* Kanca e: durak yoksa masalın verdiği doğuş noktası (yoksa eskisi gibi (0, 8)). */
  const dogusNoktasi = () => tarif.baslangic ? new THREE.Vector3(tarif.baslangic.x, .6, tarif.baslangic.z) : new THREE.Vector3(0, .6, 8);
  const dogusBakisi = p => (!yerler.length && Number.isFinite(tarif.baslangic?.yon)) ? tarif.baslangic.yon : Math.atan2(-p.x, -p.z);
  const nerede = yerler[Math.min(baslangicSira, Math.max(0, yerler.length - 1))] || dogusNoktasi();
  piyon.position.copy(nerede); piyon.position.y = 1.02; dunya.add(piyon);
  piyon.rotation.order = 'YXZ';                    // önce yön, sonra araziye eğilme
  konum.set(nerede.x, zeminY(nerede.x, nerede.z), nerede.z);
  // Başlangıçta karakter (ve kamera) adanın merkezine baksın: ilk kare boş ufuk olmasın
  bakis = kameraYaw = dogusBakisi(nerede);
  const pRenk = tarif.piyon ?? 0xc98f4e;
  let piyonKuyruk = null;
  const piyonSecenek = () => ({ renk: tarif.piyon, karin: tarif.piyonKarin, ic: tarif.piyonIc, olcek: 1.05, ...(tarif.piyonSecenek || {}) });
  if (typeof tarif.piyonModel === 'function') {
    /* Kanca d: karakteri masal kendisi çizer (çiftçi fare: fare + hasır şapka). */
    const f = tarif.piyonModel({ THREE, mal, cisim, kutu, top, silindir, MODELLER }, piyon, piyonSecenek());
    if (f) { f.position.y = -.34; piyonKuyruk = f.userData?.kuyruk || null; }
  } else if (MODELLER[tarif.piyonTur]) {
    /* Masalın kendi 3B karakteri (bkz. modeller.js, modeller/<kod>.js):
       Aslan ile Fare'de çocuk bir fare olarak dolaşır, başka masalda bir
       kırlangıç, bir oğlak... Ayakları y=0'da, ileri +z. */
    const f = MODELLER[tarif.piyonTur]({ THREE, mal }, piyon, piyonSecenek());
    f.position.y = -.34; piyonKuyruk = f.userData?.kuyruk || null;
  } else {
    top(0, .34, -.22, .3, pRenk, piyon, 1).scale.set(.9, .85, 1);
    top(0, .4, .12, .19, pRenk, piyon, 1);
    top(0, .5, .42, .26, tarif.piyonBas ?? 0xe0a55c, piyon, 1);
    top(-.1, .56, .62, .04, 0x3b4940, piyon, 0); top(.1, .56, .62, .04, 0x3b4940, piyon, 0);
    for (const yon of [-1, 1]) {
      const d = silindir(yon * .12, .78, .46, .022, .022, .34, 0x8d5c2f, piyon, 5);
      d.rotation.z = yon * .4;
    }
  }

  const bulutlar = [];
  [[-14, -9, 7.5], [12, -10, 8], [-16, 8, 5.5]].forEach(([x, z, y]) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.userData.x0 = x; g.userData.hareketli = true; dunya.add(g);
    [[0, 0, 0, 1.1], [1, .1, 0, .8], [-.9, -.05, 0, .7]].forEach(([p, q, r, yc]) => {
      const m = top(p, q, r, yc, 0xf6f6ec, g, 2); m.castShadow = false; m.scale.y = .5;
    });
    bulutlar.push(g);
  });

  let en = 1, boy = 1, yakin = 1, aci = 0, kare = 0, kapandi = false, durdu = false, baslangicT = 0;
  /* Kanca f: dışarıdan duraklatma (çiftlikte mikro-oyun açıkken). durdu'dan
     ayrı: sekme görünür olunca (visibilitychange) duraklama bozulmaz. */
  let disDurdu = false, kareHatasi = false;
  const azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function kamerayiGuncelle() {
    const oran = en / boy, acim = oran < 1 ? 32 / oran : Math.max(24, 34 / oran);
    kamera.left = -acim * oran / 2; kamera.right = acim * oran / 2; kamera.top = acim / 2; kamera.bottom = -acim / 2;
    kamera.zoom = yakin; kamera.position.set(Math.sin(aci) * 36, 30, Math.cos(aci) * 36);
    kamera.lookAt(0, 0, 0); kamera.updateProjectionMatrix(); kamera.updateMatrixWorld();
    for (const { el, p } of izdusum) {
      el.style.visibility = ''; el.style.opacity = '';
      const v = p.clone().project(kamera), pay = el.offsetWidth / 2 + 8;
      el.style.left = `${Math.max(pay, Math.min(en - pay, (v.x * .5 + .5) * en))}px`;
      el.style.top = `${Math.max(15, Math.min(boy - 15, (-v.y * .5 + .5) * boy))}px`;
    }
  }
  /* ——— Girdi: joystick, klavye, yere dokunma ——— */
  const kol = document.createElement('div');
  kol.className = 'dunya-kolu';
  kol.setAttribute('aria-label', 'Karakteri yönlendir');
  kol.innerHTML = '<i class="kol-taban"></i><i class="kol-basi"></i>';
  container.append(kol);
  const kolBasi = kol.querySelector('.kol-basi');
  let kolId = null;

  function kolBirak() {
    kolId = null; kolYon = { x: 0, z: 0 };
    kolBasi.style.transform = 'translate(-50%,-50%)';
    kol.classList.remove('tutuluyor');
  }
  function kolSurukle(e) {
    const r = kol.getBoundingClientRect(), yari = r.width / 2;
    let dx = e.clientX - (r.left + yari), dy = e.clientY - (r.top + yari);
    const u = Math.hypot(dx, dy), enCok = yari * .62;
    if (u > enCok) { dx = dx / u * enCok; dy = dy / u * enCok; }
    kolBasi.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    kolYon = { x: dx / enCok, z: dy / enCok };
    if (u > 4) oyuncuDevraldi();
  }
  kol.addEventListener('pointerdown', e => {
    if (disDurdu) return;                                  // kanca f
    kolId = e.pointerId; kol.classList.add('tutuluyor');
    try { kol.setPointerCapture(e.pointerId); } catch {}
    kolSurukle(e);
  }, { signal: iptal.signal });
  kol.addEventListener('pointermove', e => { if (kolId === e.pointerId) kolSurukle(e); }, { signal: iptal.signal });
  kol.addEventListener('pointerup', kolBirak, { signal: iptal.signal });
  kol.addEventListener('pointercancel', kolBirak, { signal: iptal.signal });

  /* Zıplama: çitlerin, kütüklerin üstünden aşmak için. Akıllı tahtada
     çocuk bir eliyle joystick'i tutarken ötekiyle basabilsin diye sağda,
     büyük. Klavyede boşluk tuşu. */
  const ziplaDugme = document.createElement('button');
  ziplaDugme.type = 'button'; ziplaDugme.className = 'dunya-zipla';
  ziplaDugme.setAttribute('aria-label', 'Zıpla');
  ziplaDugme.innerHTML = '<span>Zıpla</span>';
  container.append(ziplaDugme);
  ziplaDugme.addEventListener('pointerdown', e => { e.preventDefault(); if (!disDurdu) zipla(); }, { signal: iptal.signal });

  const TUSLAR = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
                   w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
                   W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0] };
  const basili = new Set();
  function tusHesapla() {
    let x = 0, z = 0;
    for (const t of basili) { const v = TUSLAR[t]; if (v) { x += v[0]; z += v[1]; } }
    const u = Math.hypot(x, z);
    tusYon = u ? { x: x / u, z: z / u } : { x: 0, z: 0 };
  }
  window.addEventListener('keydown', e => {
    if (disDurdu) return;                                  // kanca f: mikro-oyun tuşları kendine alsın
    const bosluk = e.key === ' ' || e.code === 'Space';
    if (!TUSLAR[e.key] && !bosluk) return;
    // Yazı alanındayken ve bir düğme odaktayken tuşları çalmayalım
    const h = document.activeElement;
    if (h && (h.tagName === 'TEXTAREA' || h.tagName === 'INPUT')) return;
    if (bosluk) {
      if (h && h.tagName === 'BUTTON' && h !== ziplaDugme) return;
      e.preventDefault(); if (!e.repeat) zipla(); return;
    }
    e.preventDefault(); basili.add(e.key); tusHesapla(); oyuncuDevraldi();
  }, { signal: iptal.signal });
  window.addEventListener('keyup', e => { basili.delete(e.key); tusHesapla(); }, { signal: iptal.signal });
  window.addEventListener('blur', () => { basili.clear(); tusHesapla(); kolBirak(); }, { signal: iptal.signal });

  /* Tuval: SÜRÜKLE = kamerayı karakterin etrafında çevir (Goat Simulator
     düzeni), DOKUN = oraya yürü. İkisini 8 piksellik hareket eşiği ayırır. */
  const isin = new THREE.Raycaster();
  const kenar = e => {
    const r = cizer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  let surukle = null;
  cizer.domElement.addEventListener('pointerdown', e => {
    if (disDurdu) return;                                  // kanca f
    surukle = { id: e.pointerId, x: e.clientX, y: e.clientY, yaw: kameraYaw, egim: kameraEgim, oynadi: false };
    try { cizer.domElement.setPointerCapture(e.pointerId); } catch {}
  }, { signal: iptal.signal });
  cizer.domElement.addEventListener('pointermove', e => {
    if (!surukle || surukle.id !== e.pointerId) return;
    const dx = e.clientX - surukle.x, dy = e.clientY - surukle.y;
    if (!surukle.oynadi && Math.hypot(dx, dy) > 8) surukle.oynadi = true;
    if (surukle.oynadi && kip !== 'ustten' && surukleDondur) {   // kanca c
      kameraYaw = surukle.yaw - dx * .0065;
      kameraEgim = Math.max(.06, Math.min(1.15, surukle.egim + dy * .0042));
    }
  }, { signal: iptal.signal });
  cizer.domElement.addEventListener('pointerup', e => {
    if (!surukle || surukle.id !== e.pointerId) return;
    const dokunus = !surukle.oynadi;
    surukle = null;
    if (!dokunus || disDurdu) return;
    // Dokunulan noktayı araziye göre bul: kaba ışın + birkaç adım yüzey düzeltmesi
    isin.setFromCamera(kenar(e), etkinKamera());
    const r = isin.ray, nokta = new THREE.Vector3();
    let t = 0, bulundu = false;
    for (let i = 0; i < 240; i++) {
      r.at(t, nokta);
      if (nokta.y <= zeminY(nokta.x, nokta.z)) { bulundu = true; break; }
      t += .35;
    }
    if (!bulundu) return;
    varisKur(sinirla(nokta.x, nokta.z));
    oyuncuDevraldi();
  }, { signal: iptal.signal });
  cizer.domElement.addEventListener('pointercancel', () => { surukle = null; }, { signal: iptal.signal });
  cizer.domElement.addEventListener('wheel', e => {
    if (kip === 'ustten' || disDurdu) return;
    e.preventDefault();
    kameraUzak = Math.max(1.8, Math.min(10, kameraUzak + e.deltaY * .005));
  }, { passive: false, signal: iptal.signal });

  function oyuncuDevraldi() {
    if (kosuyor) { kosuyor = false; etiketler.classList.remove('kosuda'); kamerayiGuncelle(); }
  }
  /* Yürünebilir alan: oyun alanının iki katı. Karakter tepelere çıkabiliyor.

     Çarpışma: karakter KR yarıçaplı bir daire. Engelin içine girerse en
     yakın kenara itilir; böylece ağaca/duvara çarpınca durmaz, yanından
     kayarak geçer. İki engelin arasında bir itme ötekinin içine sokabildiği
     için üç geçiş yapılıyor. ayak: karakterin ayak yüksekliği; alçak engelin
     (çit, kütük) üstündeyse o engel yok sayılır. */
  const KR = .3, ADIM = .62, YERCEKIMI = 18, ZIPLAMA_HIZI = 6.6;
  const engelTabani = e => e.y0 ?? (e.y0 = ZEMIN + yukseklik(e.x, e.z));
  function sinirla(x, z, ayak = -Infinity) {
    for (let tur = 0; tur < 3; tur++) {
      let itildi = false;
      const u = Math.hypot(x / YURUME_RX, z / YURUME_RZ);
      if (u > 1) { x /= u; z /= u; }
      for (const e of engeller) {
        if (e.h !== undefined && ayak > engelTabani(e) + e.h - .02) continue;
        if (e.onde && kip === 'ustten') continue;
        if (e.tip === 'kutu') {
          const dx = x - e.x, dz = z - e.z;
          let lx = dx * e.c + dz * e.s, lz = -dx * e.s + dz * e.c;
          if (Math.abs(lx) > e.hw + KR || Math.abs(lz) > e.hd + KR) continue;
          const cx = Math.max(-e.hw, Math.min(e.hw, lx)), cz = Math.max(-e.hd, Math.min(e.hd, lz));
          const ax = lx - cx, az = lz - cz, d = Math.hypot(ax, az);
          if (d >= KR) continue;
          if (d < 1e-4) {                                   // merkez kutunun içinde
            if (e.hw - Math.abs(lx) < e.hd - Math.abs(lz)) lx = (Math.sign(lx) || 1) * (e.hw + KR);
            else lz = (Math.sign(lz) || 1) * (e.hd + KR);
          } else { lx = cx + ax / d * KR; lz = cz + az / d * KR; }
          x = e.x + lx * e.c - lz * e.s; z = e.z + lx * e.s + lz * e.c;
          itildi = true;
        } else {
          const dx = x - e.x, dz = z - e.z, d = Math.hypot(dx, dz), en = e.r + KR;
          if (d >= en) continue;
          if (d > 1e-4) { x = e.x + dx / d * en; z = e.z + dz / d * en; } else z = e.z + en;
          itildi = true;
        }
      }
      if (!itildi) break;
    }
    return { x, z };
  }
  /* Bir adım: önce istenen yöne, olmazsa eksenler boyunca kay. Adım
     yüksekliğinden dik bir basamak (ambarın kaidesi değil, seki duvarı)
     duvar sayılır. */
  function adimAt(dx, dz) {
    for (const [ax, az] of [[dx, dz], [dx, 0], [0, dz]]) {
      if (Math.abs(ax) + Math.abs(az) < 1e-6) continue;
      const k = sinirla(konum.x + ax, konum.z + az, konum.y);
      if (zeminY(k.x, k.z) - konum.y <= ADIM) { konum.x = k.x; konum.z = k.z; return true; }
    }
    return false;
  }
  /* Dikey: yerdeyken zemine yapışır (yokuş inerken sekmesin), kenardan
     düşünce ya da zıplayınca yerçekimi devreye girer. */
  let dikeyHiz = 0, yerde = true, inis = 0;
  let dolanYon = 1, enYakinVaris = Infinity, takili = 0, araNokta = null, dolanma = 0;
  const varisKur = n => { varisNoktasi = n; enYakinVaris = Infinity; takili = 0; araNokta = null; dolanma = 0; };
  /* Yol bulma yok; ama dokunulan yer uzun bir binanın ya da duvarın ardındaysa
     karakter yanında takılıp vazgeçiyordu. Takılınca yakındaki kutu engelin
     köşelerinden, karakterden köşeye + köşeden hedefe en kısa olanı ara
     nokta seçilir; oraya varınca hedefe devam edilir (en çok 4 kez). */
  function koseBul(hedef) {
    let en = null, enD = Infinity;
    for (const e of engeller) {
      if (e.tip !== 'kutu' || (e.onde && kip === 'ustten')) continue;
      if (e.h !== undefined && konum.y > engelTabani(e) + e.h - .02) continue;
      const dx = konum.x - e.x, dz = konum.z - e.z;
      const lx = dx * e.c + dz * e.s, lz = -dx * e.s + dz * e.c;
      if (Math.abs(lx) > e.hw + 1.4 || Math.abs(lz) > e.hd + 1.4) continue;
      const pay = KR + .45;
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const cx = sx * (e.hw + pay), cz = sz * (e.hd + pay);
        const x = e.x + cx * e.c - cz * e.s, z = e.z + cx * e.s + cz * e.c;
        const k = sinirla(x, z, konum.y);
        if (Math.hypot(k.x - x, k.z - z) > .3) continue;              // köşe başka bir engelin içinde
        if (Math.hypot(x - konum.x, z - konum.z) < .5) continue;      // zaten oradayız
        const d = Math.hypot(x - konum.x, z - konum.z) + Math.hypot(hedef.x - x, hedef.z - z);
        if (d < enD) { enD = d; en = { x, z }; }
      }
    }
    return en;
  }
  function dikeyAdim(dt) {
    const yer = zeminY(konum.x, konum.z);
    if (yerde) {
      if (konum.y - yer > .35) { yerde = false; dikeyHiz = 0; }
      else { konum.y = yer; return; }
    }
    dikeyHiz -= YERCEKIMI * dt; konum.y += dikeyHiz * dt;
    if (konum.y <= yer) {
      if (dikeyHiz < -4) inis = 1;
      konum.y = yer; dikeyHiz = 0; yerde = true;
    }
  }
  function zipla() {
    if (!yerde || kosuyor) return;
    yerde = false; dikeyHiz = ZIPLAMA_HIZI;
    ses.zipla?.();
  }
  const etkinKamera = () => kip !== 'ustten' ? yakinKamera : kamera;

  /* ——— Yakınlık ———
     Karakter bir şeyin yanına gelince ne yapabileceğini söyleyen tek bir
     istem çıkar. Otomatik açılmaz: çocuk yanlışlıkla göreve girmesin diye
     bir dokunuş ister. */
  const istem = document.createElement('button');
  istem.className = 'dunya-istemi'; istem.type = 'button'; istem.hidden = true;
  container.append(istem);
  let istemEylem = null;
  istem.addEventListener('click', () => istemEylem?.(), { signal: iptal.signal });

  function istemGoster(metin, eylem) {
    if (istem.textContent !== metin) istem.textContent = metin;
    istem.hidden = false; istemEylem = eylem;
  }
  function istemGizle() { istem.hidden = true; istemEylem = null; }

  function yakinlikBak() {
    const ayni = (x, z) => Math.abs(zeminY(x, z) - konum.y) < 1.1;   // tepenin öbür yüzünden değil
    const yeniDurak = yerler.findIndex(p => p && Math.hypot(p.x - konum.x, p.z - konum.z) < 1.5 && ayni(p.x, p.z));
    const kesifler = tarif.kesif || [];
    const yeniKesif = kesifler.findIndex(n => Math.hypot(n.x - konum.x, n.z - konum.z) < 1.6 && ayni(n.x, n.z));
    if (yeniDurak === yakinDurak && yeniKesif === yakinKesif) return;
    yakinDurak = yeniDurak; yakinKesif = yeniKesif;
    etiketler.querySelectorAll('.yakinda').forEach(e => e.classList.remove('yakinda'));
    if (yakinDurak >= 0) {
      const d = etiketler.querySelectorAll('.durak-noktasi')[yakinDurak];
      d?.classList.add('yakinda');
      if (yakinDurak === simdi && secenekler.basla) return istemGoster('Göreve gir', secenekler.basla);
      return istemGoster(yakinDurak < simdi ? 'Burası tamamlandı' : 'Sıra buraya gelmedi', null);
    }
    if (yakinKesif >= 0 && secenekler.kesfet) {
      const n = kesifler[yakinKesif];
      etiketler.querySelectorAll('.kesif-noktasi')[yakinKesif]?.classList.add('yakinda');
      return istemGoster(`${n.ad} — keşfet`, () => secenekler.kesfet(n));
    }
    istemGizle();
  }

  function boyutla() {
    if (kapandi) return;
    en = Math.max(1, container.clientWidth); boy = Math.max(1, container.clientHeight);
    cizer.setSize(en, boy);
    yakinKamera.aspect = en / boy; yakinKamera.updateProjectionMatrix();
    kamerayiGuncelle();
  }

  /* ——— KOŞU ———
     Görev bitince karakter yol boyunca bir duraktan ötekine kendiliğinden
     koşar (1.5–4 sn). Oyuncu joystick'e, bir tuşa ya da yere dokunduğu an
     koşu biter ve kontrol ona geçer. Kamera kipi öğretmenin seçimi;
     varsayılan omuz üstü, cihazda saklanır. */
  function yolUstu(t) {
    if (!yolEgri) return null;
    const tt = acikYol ? Math.max(0, Math.min(1, t)) : ((t % 1) + 1) % 1;
    return yolEgri.getPoint(tt);
  }
  function kameraTikanma(tx, tz, cx, cz) {
    const dx = cx - tx, dz = cz - tz, L2 = dx * dx + dz * dz;
    if (L2 < 1e-6) return 1;
    let oran = 1;
    for (const o of kameraEngelleri) {
      const t = ((o.x - tx) * dx + (o.z - tz) * dz) / L2;
      if (t <= .02 || t > 1.25) continue;
      const px = tx + dx * t, pz = tz + dz * t, u = Math.hypot(o.x - px, o.z - pz);
      if (u < o.r) oran = Math.min(oran, Math.max(.34, t - Math.sqrt(o.r * o.r - u * u) / Math.sqrt(L2) - .04));
    }
    return oran;
  }
  const aciYaklas = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };
  const hk = new THREE.Vector3(), hb = new THREE.Vector3();
  function takipKamerasi(ani, kareOrani = 1) {
    const fx = Math.sin(kameraYaw), fz = Math.cos(kameraYaw), y0 = konum.y;
    if (kip === 'birinci') {
      hk.set(konum.x + fx * .05, y0 + .78, konum.z + fz * .05);
      hb.set(konum.x + fx * 6, y0 + .78 - (kameraEgim - EGIM0) * 5, konum.z + fz * 6);   // EGIM0: kanca c
    } else {
      /* Araya ağaç ya da bina girerse kamera karaktere yaklaşır; gövdenin,
         tacın içinden bakmayız. Goat Simulator'daki davranış. */
      const e = kameraEgim;
      const d = kameraUzak * kameraTikanma(konum.x, konum.z, konum.x - fx * kameraUzak * Math.cos(e), konum.z - fz * kameraUzak * Math.cos(e));
      hk.set(konum.x - fx * d * Math.cos(e), y0 + .55 + d * Math.sin(e), konum.z - fz * d * Math.cos(e));
      const alt = zeminY(hk.x, hk.z) + .4;                    // kamera toprağın içine girmesin
      if (hk.y < alt) hk.y = alt;
      hb.set(konum.x, y0 + .72, konum.z);
    }
    if (ani) { kameraKonum.copy(hk); kameraBak.copy(hb); kameraHazir = true; }
    else {
      const iceri = kameraKonum.distanceTo(hb) > hk.distanceTo(hb) + .15;
      const y = k => 1 - Math.pow(1 - k, kareOrani);
      kameraKonum.lerp(hk, y(iceri ? .4 : .12)); kameraBak.lerp(hb, y(.22));
    }
    yakinKamera.position.copy(kameraKonum); yakinKamera.lookAt(kameraBak);
  }
  /* Dünyanın içindeyken etiketler 3B'deki yerlerine izdüşer; kameranın
     arkasında ya da çok uzakta kalanlar gizlenir, uzaklaştıkça solar. */
  const gecici = new THREE.Vector3();
  function etiketleriYansit() {
    for (const { el, p } of izdusum) {
      gecici.copy(p).project(yakinKamera);
      const u = yakinKamera.position.distanceTo(p);
      if (gecici.z > 1 || gecici.z < -1 || u > 30 || Math.abs(gecici.x) > 1.15 || Math.abs(gecici.y) > 1.15) {
        el.style.visibility = 'hidden'; continue;
      }
      el.style.visibility = '';
      el.style.left = `${(gecici.x * .5 + .5) * en}px`;
      el.style.top = `${(-gecici.y * .5 + .5) * boy}px`;
      el.style.opacity = u > 18 ? String(Math.max(.2, 1 - (u - 18) / 12)) : '';
    }
  }

  function kos(bas, son, bitince) {
    if (!yolEgri || bas === son) { bitince?.(); return; }
    let a = durakT(bas), b = durakT(son);
    if (!acikYol) {                                  // halkada kısa yönden git
      if (b - a > .5) b -= 1; else if (a - b > .5) b += 1;
    }
    kosuBas = a; kosuSon = b; kosuT = 0;
    kosuSure = Math.max(1.5, Math.min(4.2, Math.abs(b - a) * 22));
    kosuyor = true; kosuBitince = bitince;
    etiketler.classList.add('kosuda');
  }

  const gozlemci = new ResizeObserver(boyutla); gozlemci.observe(container); boyutla();
  let oncekiMs = 0, egimP = 0, egimR = 0;
  const karakterHizi = new THREE.Vector2();
  /* Küçük, düz şeyler (tarla sıraları, kar yamaları, nilüferler) gölge
     atmasın: görünmeyen gölge için her kare ikinci kez çiziliyorlardı. */
  {
    dunya.updateMatrixWorld(true);
    const kutu3 = new THREE.Box3();
    const olc = new THREE.Vector3();
    dunya.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || !o.castShadow || o.parent === piyon) return;
      kutu3.setFromObject(o).getSize(olc);
      if (olc.y < .13 || Math.max(olc.x, olc.y, olc.z) < .3) o.castShadow = false;
    });
  }
  /* ——— Otomatik instancing ———
     Mekânlar süsleri tek tek mesh olarak kuruyor (çit direkleri, başaklar,
     çiçekler, otlar...): tarlada 300'den fazla ayrı çizim çağrısı. Aynı
     geometri + aynı malzemeyi paylaşan ve HAREKET ETMEYEN mesh'ler burada
     tek InstancedMesh'e toplanıyor; görüntü birebir aynı kalıyor.
     Hareket edenler (userData.hareketli olan bir grubun içindekiler:
     piyon, izler, keşif işaretleri, bulutlar, yarışçılar, itilebilir
     nesneler, mekânın tik() ile oynattıkları) dokunulmadan kalır. */
  const toplanan = (() => {
    dunya.updateMatrixWorld(true);
    const kume = new Map();
    dunya.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.material.transparent) return;
      for (let p = o; p && p !== dunya; p = p.parent) if (p.userData.hareketli) return;
      const k = `${o.geometry.uuid}|${o.material.uuid}|${o.castShadow}`;
      let l = kume.get(k); if (!l) kume.set(k, l = []); l.push(o);
    });
    let n = 0;
    for (const liste of kume.values()) {
      if (liste.length < 5) continue;
      const im = new THREE.InstancedMesh(liste[0].geometry, liste[0].material, liste.length);
      liste.forEach((m, i) => im.setMatrixAt(i, m.matrixWorld));
      im.castShadow = liste[0].castShadow; im.receiveShadow = true;
      im.computeBoundingSphere();
      dunya.add(im);
      for (const m of liste) m.parent.remove(m);
      n += liste.length - 1;
    }
    return n;
  })();
  function sisAyarla() {
    sahne.fog.near = (kip === 'ustten' ? 88 : 46) * olcek;       // kanca a
    sahne.fog.far = (kip === 'ustten' ? 210 : 132) * olcek;
    for (const im of onOrman) im.visible = kip !== 'ustten';
  }
  sisAyarla();
  function dongu(ms) {
    if (kapandi) return;
    if (!durdu && !disDurdu) {
      const t = ms * .001;
      /* Gerçek zaman adımı. Eskiden her şey 60 fps varsayıyordu: 30 fps çalışan
         bir akıllı tahtada karakter yarı hızda yürüyordu. Üst sınır, sekme
         arkaplandan dönünce karakterin ışınlanmasını önler. */
      const dt = oncekiMs ? Math.min(.05, (ms - oncekiMs) / 1000) : 1 / 60;
      oncekiMs = ms;
      const kareOrani = dt * 60;
      if (!baslangicT) baslangicT = t;
      if (!azHareket) {
        // piyonun yeri artık serbest dolaşımda belirleniyor (aşağıda)
        bulutlar.forEach((c, i) => { c.position.x = c.userData.x0 + Math.sin(t * .05 + i) * 1.4; });
        yarisci.forEach((y, i) => { y.g.position.y = y.g.userData.y0 + (y.uyuyor ? 0 : Math.sin(t * 2 + i) * .05); });
        if (yeniIz) {                                  // son iz gözün önünde büyür
          const o = Math.min(1, (t - baslangicT) / .8);
          const y = o < 1 ? Math.sin(o * Math.PI * .5) * (1 + .3 * (1 - o)) : 1;
          yeniIz.g.scale.setScalar(yeniIz.olcek * y);
        }
        kesifIsaretleri.forEach((g, i) => { g.position.y = g.userData.y0 + Math.sin(t * 1.4 + i * 1.7) * .05; });
        mekan.tik?.(t);
      }
      /* ——— Hareket: tek sistem. Koşu (otomatik) ya da serbest dolaşım (oyuncu). ——— */
      let adimda = false;
      if (kosuyor) {
        kosuT += dt / kosuSure;
        const o = Math.min(1, kosuT);
        const yumusak = o < .5 ? 2 * o * o : 1 - Math.pow(-2 * o + 2, 2) / 2;   // yavaş başla, yavaş dur
        const tt = kosuBas + (kosuSon - kosuBas) * yumusak;
        const p = yolUstu(tt), n = yolUstu(tt + (kosuSon > kosuBas ? .01 : -.01));
        if (p && n) {
          karakterHizi.set((p.x - konum.x) / dt, (p.z - konum.z) / dt);
          konum.x = p.x; konum.z = p.z;
          konum.y = zeminY(konum.x, konum.z); yerde = true; dikeyHiz = 0;
          bakis = Math.atan2(n.x - p.x, n.z - p.z);
          kameraYaw = aciYaklas(kameraYaw, bakis, 1 - Math.pow(.93, kareOrani));   // koşarken kamera arkasına geçer
          adimda = true;
        }
        if (o >= 1) {
          kosuyor = false;
          etiketler.classList.remove('kosuda');
          if (kip === 'ustten') kamerayiGuncelle();
          const f = kosuBitince; kosuBitince = null; f?.();
        }
      } else {
        const ix = kolYon.x + tusYon.x, iz = kolYon.z + tusYon.z;
        let wx = 0, wz = 0;
        if (kip === 'birinci') {
          // 1. şahıs: sağ-sol döndürür, ileri-geri yürütür
          kameraYaw -= ix * 2.5 * dt;
          wx = Math.sin(kameraYaw) * -iz; wz = Math.cos(kameraYaw) * -iz;
        } else if (kip === 'omuz') {
          // 3. şahıs: yön KAMERAYA göre — "ileri" her zaman ekranın içine
          const fx = Math.sin(kameraYaw), fz = Math.cos(kameraYaw);
          wx = fx * -iz + -fz * ix; wz = fz * -iz + fx * ix;
        } else {
          wx = ix; wz = iz;                                     // harita: dünya eksenleri
        }
        const elle = Math.hypot(wx, wz) > .06;
        if (varisNoktasi) {
          const h = araNokta || varisNoktasi;
          const dx = h.x - konum.x, dz = h.z - konum.z, u = Math.hypot(dx, dz);
          if (u < .45) { if (araNokta) { araNokta = null; enYakinVaris = Infinity; takili = 0; } else varisNoktasi = null; }
          else { wx += dx / u; wz += dz / u; }
        }
        const g = Math.hypot(wx, wz);
        yuruyor = g > .06;
        const ox = konum.x, oz = konum.z;
        if (yuruyor) {
          const hiz = HIZ * dt * Math.min(1, g);
          const ix2 = wx / g * hiz, iz2 = wz / g * hiz;
          adimAt(ix2, iz2);
          /* Dokunarak yürürken yol bir duvara dayanırsa karakter orada
             bekleyip durmasın: engelin etrafından dolaşsın. Önce hep aynı
             yana döner (sağa-sola titremesin), olmazsa öbür yana. İki buçuk
             saniye hiç yaklaşamazsa vazgeçer. */
          if (varisNoktasi && !elle && Math.hypot(konum.x - ox, konum.z - oz) < hiz * .45) {
            for (const a of [.7, 1.2, 1.7, -.7, -1.2, -1.7].map(a => a * dolanYon)) {
              konum.x = ox; konum.z = oz;
              const c = Math.cos(a), sn = Math.sin(a);
              adimAt(ix2 * c - iz2 * sn, ix2 * sn + iz2 * c);
              if (Math.hypot(konum.x - ox, konum.z - oz) > hiz * .5) { if (Math.sign(a) !== dolanYon) dolanYon = Math.sign(a); break; }
            }
          }
          if (varisNoktasi) {
            const h = araNokta || varisNoktasi;
            const u = Math.hypot(h.x - konum.x, h.z - konum.z);
            if (u < enYakinVaris - .05) { enYakinVaris = u; takili = 0; }
            else if ((takili += dt) > .6 && !araNokta && dolanma < 4 && (araNokta = koseBul(varisNoktasi))) {
              dolanma++; enYakinVaris = Infinity; takili = 0;
            } else if (takili > 2.5) varisKur(null);
          }
          bakis = kip === 'birinci' ? kameraYaw : aciYaklas(bakis, Math.atan2(wx, wz), 1 - Math.pow(.7, kareOrani));
          adimda = true;
        }
        karakterHizi.set((konum.x - ox) / dt, (konum.z - oz) / dt);
        yakinlikBak();
      }
      dikeyAdim(dt);
      /* Karakter nesnelere çarpar (durmaz, iter), nesneler kendi yollarına gider. */
      nesneler.karakter(konum.x, konum.z, konum.y, karakterHizi.x, karakterHizi.y, KR);
      nesneler.adim(dt);

      /* Karakter: yürürken seker, havadayken sekmez, yere inince ezilir,
         yokuşta araziye göre eğilir. */
      const sek = !yerde ? .05 : adimda ? Math.abs(Math.sin(ms * .013)) * .16 : .12 + Math.sin(t * 2) * .06;
      piyon.position.set(konum.x, konum.y + .35 + sek, konum.z);
      let pitch = 0, roll = 0;
      if (yerde) {
        const fx = Math.sin(bakis), fz = Math.cos(bakis), o = .35;
        pitch = -Math.atan2(zeminY(konum.x + fx * o, konum.z + fz * o) - zeminY(konum.x - fx * o, konum.z - fz * o), 2 * o) * .7;
        roll = Math.atan2(zeminY(konum.x + fz * o, konum.z - fx * o) - zeminY(konum.x - fz * o, konum.z + fx * o), 2 * o) * .6;
        pitch = Math.max(-.35, Math.min(.35, pitch)); roll = Math.max(-.3, Math.min(.3, roll));
      } else pitch = dikeyHiz > 0 ? -.18 : .12;               // zıplarken burun yukarı, inerken aşağı
      egimP += (pitch - egimP) * Math.min(1, dt * 12); egimR += (roll - egimR) * Math.min(1, dt * 12);
      piyon.rotation.set(egimP, bakis, egimR + (adimda && yerde ? Math.sin(ms * .013) * .07 : 0));
      if (inis > 0) inis = Math.max(0, inis - dt * 5);
      piyon.scale.set(1 + inis * .22, 1 - inis * .3, 1 + inis * .22);
      if (piyonKuyruk) piyonKuyruk.rotation.y = Math.sin(t * (adimda ? 9 : 2.2)) * (adimda ? .28 : .12);
      piyon.visible = kip !== 'birinci';
      golgeIzle();
      if (kip !== 'ustten') { takipKamerasi(!kameraHazir, kareOrani); etiketleriYansit(); }
      cizer.render(sahne, etkinKamera());
      /* Kanca g: masalın kendi karesi (dünya balonları, yakınlık). Hata
         döngüyü durdurmasın; yalnız ilki konsola yazılır. */
      if (secenekler.kare) {
        try { secenekler.kare(t, dt); } catch (hata) { if (!kareHatasi) { kareHatasi = true; console.error(hata); } }
      }
    }
    kare = requestAnimationFrame(dongu);
  }
  kare = requestAnimationFrame(dongu);
  const gorunurluk = () => { durdu = document.hidden; };
  document.addEventListener('visibilitychange', gorunurluk);

  return {
    kos, kosuyorMu: () => kosuyor,
    nerede: () => ({ x: +konum.x.toFixed(2), z: +konum.z.toFixed(2) }),
    yuruyorMu: () => yuruyor,
    gorunum(yeni) {
      if (yeni && !(olcek !== 1 && yeni === 'ustten')) {        // kanca a: büyük haritada üstten yok
        kip = yeni; kameraHazir = false; sisAyarla();
        try { localStorage.setItem(KIP_ANAHTAR, kip); } catch {}
        if (kip === 'ustten') kamerayiGuncelle();
      }
      return kip;
    },
    /* Öğretmen için: çocuk bir tepenin ardında kaybolursa ya da bir köşeye
       sıkışırsa karakter tek dokunuşla sıradaki durağa döner. */
    eveDon() {
      const p = yerler[Math.min(simdi, Math.max(0, yerler.length - 1))] || dogusNoktasi();   // kanca e
      kosuyor = false; etiketler.classList.remove('kosuda'); varisKur(null);
      konum.set(p.x, zeminY(p.x, p.z), p.z); dikeyHiz = 0; yerde = true;
      bakis = kameraYaw = dogusBakisi(p); kameraHazir = false;
      yakinDurak = -2; yakinKesif = -2;
      if (kip === 'ustten') kamerayiGuncelle();
    },
    zipla,
    /* Belirlenimci ölçüm (testler için): çizim çağrısı ana + gölge geçişinin
       toplamıdır; three gölge geçişinden önce sayacı sıfırlamıyor. */
    olcum: () => ({ cizim: cizer.info.render.calls, ucgen: cizer.info.render.triangles,
      geo: cizer.info.memory.geometries, doku: cizer.info.memory.textures, toplanan,
      kare: cizer.info.render.frame }),                    // kanca h: çizilen kare sayacı
    /* Denetim: her durak ve keşif noktası ulaşılabilir mi? Bir engelin
       içinde kalan ya da bir kayanın altına gömülen durağa çocuk
       yürüyemez — "Göreve gir" hiç çıkmaz. Testler bunu her mekânda arar. */
    denetle() {
      const sorunlar = [];
      /* pay: karakterin itildiği yerden istem hâlâ çıkıyor mu? Durağın
         üstüne basılabilmeli; keşif noktası bir ağacın dibi olabilir. */
      const bak = (ad, x, z, taban, pay) => {
        const k = sinirla(x, z, taban);
        if (Math.hypot(k.x - x, k.z - z) > pay) sorunlar.push(`${ad} bir engelin içinde (${x.toFixed(1)}, ${z.toFixed(1)})`);
        const y = zeminY(x, z);
        if (y > taban + .25) sorunlar.push(`${ad} ${(y - taban).toFixed(2)} birim gömülü`);
      };
      yerler.forEach((p, i) => p && bak(`${i + 1}. durak`, p.x, p.z, p.y + .16, .6));
      (tarif.kesif || []).forEach(n => bak(`Keşif "${n.ad}"`, n.x, n.z, zeminY(n.x, n.z), 1.35));
      return sorunlar;
    },
    /* Dokunarak yürümenin aynısı; testler ve öğretmen kısayolları için. */
    yuru(x, z) { varisKur(sinirla(x, z)); oyuncuDevraldi(); },
    yerdeMi: () => yerde,
    yukseklik: () => +konum.y.toFixed(2),
    nesneler: () => nesneler.liste.map(n => ({ tip: n.tip, x: +n.x.toFixed(2), z: +n.z.toFixed(2), devrik: n.devrik >= 1 })),
    zoom(d) {
      if (kip !== 'ustten') { kameraUzak = Math.max(1.8, Math.min(10, kameraUzak - d * 12)); return; }
      yakin = Math.max(.8, Math.min(1.4, yakin + d)); kamerayiGuncelle();
    },
    rotate(d) {
      if (kip !== 'ustten') { kameraYaw -= d * 2.2; return; }
      aci = Math.max(-.5, Math.min(.5, aci + d)); kamerayiGuncelle();
    },
    reset() { yakin = 1; aci = 0; kameraUzak = UZAK0; kameraEgim = EGIM0; kameraYaw = bakis; kamerayiGuncelle(); },   // kanca c
    /* Kanca f: dışarıdan duraklatma. true: çizim, hareket, nesneler ve
       secenekler.kare durur; joystick bırakılır, girdiler yok sayılır.
       Yürüyüş hedefi ve basılı tuşlar korunur (keyup işlenmeye devam eder). */
    duraklat(b) {
      if (b !== undefined) {
        disDurdu = !!b;
        if (disDurdu) { kolBirak(); surukle = null; }
      }
      return disDurdu;
    },
    /* Kanca g: dünya noktası → kaba göre piksel (etkin kamerayla).
       gorunur: kameranın önünde ve ekranın içinde. uzak: kameraya uzaklık. */
    izdus(x, y, z) {
      const k = etkinKamera(), v = new THREE.Vector3(x, y, z);
      const uzak = +k.position.distanceTo(v).toFixed(2);
      v.project(k);
      const gorunur = v.z > -1 && v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1;
      return { x: (v.x * .5 + .5) * en, y: (-v.y * .5 + .5) * boy, gorunur, uzak };
    },
    dispose() {
      kapandi = true; iptal.abort(); cancelAnimationFrame(kare); gozlemci.disconnect();
      document.removeEventListener('visibilitychange', gorunurluk);
      NESNE_DURUMU.set(nesneAnahtar, nesneler.durum());
      sahne.traverse(o => {
        if (o.isInstancedMesh) o.dispose();
        if (o.geometry && !o.geometry.userData.kalici) o.geometry.dispose();
      });
      malzemeler.forEach(m => m.dispose()); ekMalzemeler.forEach(m => m.dispose()); nesneler.dispose();
      cizer.forceContextLoss(); cizer.dispose(); cizer.domElement.remove();
      etiketler.remove(); kol.remove(); istem.remove(); ziplaDugme.remove();
    }
  };
}

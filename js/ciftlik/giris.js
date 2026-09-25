/* Çiftçi Fare — giriş (ciftlik.html).

   Aşama 1a: DÜNYA. Şapkalı çiftçi fare büyük, çitli, yollu çiftlikte
   joystick, dokunarak yürüme ve zıplamayla gezer.
   Aşama 1b: akış kabuk.js'te (kurulum → Kim oynuyor? → çiftlik → Günü bitir);
   işlerin mikro-oyunları isler.js'te, kabuğa burada (kancalar) bağlanır.
   Plan: docs/ciftci-fare-plani.md.

   Burada:
   - Çalışma anında kayıt: MEKANLAR.ciftlik (mekan.js) ve 'ciftlik-'
     önekli ikonlar (ikonlar.js). Masalların dosyalarına dokunulmaz.
   - Sayfanın kalıcı iskeleti (ciftlikSayfasi): üst köşedeki ikon düğmeler,
     dünya kabı, ölçüm göstergesi. Dünya bu kabın içinde dunyaKur() ile
     kurulur; her çocuk için yeniden kurulur (masal.kod = 'ciftlik-<sınıf>-<oid>':
     itilebilir nesnelerin belleği çiftlikler arasında karışmaz; farenin
     şapka bandı ve mendili çocuğun renginde).
   - Dünya, masallarla AYNI motorla (js/masal/dunya.js) ve onun isteğe
     bağlı kancalarıyla kurulur: olcek, otYok, kipAnahtar + kamera,
     piyonModel, baslangic, duraklat, izdus, kare.
   - Okuma bilmeyen çocuk için ekranda yazı yok: düğmeler ikon, adları
     aria-label'da.
   - ?olcum=1: kare süresi göstergesi (öğretmen/geliştirici).
   - ?deneme=1: deneme açılışı: ses kilidi açılmaz, Kim oynuyor atlanır,
     çiftlik bellekteki (kaydedilmeyen) bir deneme sınıfıyla açılır.
   Testler için window.__sahne (dünya API'si) ve window.__ciftlik. */

import {kurMasalDunyasi} from '../masal/dunya.js';
import {MEKANLAR} from '../masal/mekanlar.js';
import {ses} from '../ses.js';
import {ikon, simge} from '../ikon.js';
import {ciftlikMekani, otYok, OLCEK, NOKTALAR} from './mekan.js';
import {ciftciFare} from './fare.js';
import {ciftlikIkonlariniKaydet} from './ikonlar.js';
import {RENKLER} from './ortak/turler.js';
import {kabukBaslat, kancaKaydet} from './kabuk.js';
import {isAc, isListesi, islerHazirla} from './isler.js';
import {ogretmenPaneliAc} from './ogretmen.js';
import {ziyaretBagla} from './ziyaret.js';
import {anlatimHazirla, anlatimDurum} from './anlatim.js';

MEKANLAR.ciftlik = ciftlikMekani;
ciftlikIkonlariniKaydet();
/* Ses bölgesi şimdiden çiftlik: ses bağlamı ilk dokunuşta açılınca ortam
   kaydı olarak çiftlik yüklensin (varsayılan bölge ormandı). */
ses.setRegion?.('ciftlik');

const parametre = new URLSearchParams(location.search);
const DENEME = parametre.get('deneme') === '1';
const OLCUM = parametre.get('olcum') === '1';
export const renkSayi = hex => parseInt(String(hex).replace('#', ''), 16);

/* Çiftliğin "masal" nesnesi: motorun okuduğu alanlar. bolumler boş (motor
   bölüm etiketlerini bundan okuyor), durak ve keşif noktası yok. kod,
   motorun itilebilir nesne belleğinin anahtarı: sınıf/çocuk kimliğiyle
   ('ciftlik-<sinif>-<oid>') çiftlikler karışmaz. */
export function ciftlikMasali({ kod = 'ciftlik-yerel', sembolRenk = renkSayi(RENKLER[0]), piyonModel = ciftciFare } = {}) {
  return {
    kod, ad: 'Çiftçi Fare', bolumler: [],
    dunya: {
      mekan: 'ciftlik', olcek: OLCEK, cekirdek: 20260925,
      cevre: 0x9fbe78, gok: 0xd9e9f1,
      otYok,
      kipAnahtar: 'ciftlik-gorunum',
      /* Yüksek, sabit açılı omuz kamerası; tuval sürüklemesi kamerayı
         döndürmez: 3 yaşın titrek dokunuşu çocuğa yön kaybettirmesin. */
      kamera: { egim: .8, uzak: 7.5, surukleDondur: false },
      piyonModel, piyonSecenek: { sembolRenk },
      baslangic: { x: NOKTALAR.veranda.x, z: NOKTALAR.veranda.z, yon: Math.PI }   // kuzeye (−z) bakar
    }
  };
}

const el = (tag, cls, ek = {}) => { const e = document.createElement(tag); if (cls) e.className = cls; Object.assign(e, ek); return e; };
export function ikonDugme(cls, etiket, svg, fn) {
  const b = el('button', `ciftlik-dugme ${cls}`, { type: 'button' });
  b.setAttribute('aria-label', etiket); b.title = etiket;
  b.innerHTML = svg;
  b.addEventListener('click', e => { e.stopPropagation(); fn?.(b); });
  return b;
}
const GOZ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.8"/></svg>';
const SESSIZ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9Zm12 0 5 6m0-6-5 6"/></svg>';

/**
 * Sayfanın kalıcı iskeleti. Dönen nesne (kabuk.js kullanır):
 *   sayfa, kap, ust, araclar          DOM
 *   dunyaKur({kod, sembolRenk})       eski dünyayı dağıtır, yenisini kurar → dunya | null
 *   dunya()                           etkin dünya {sahne, masal, durum, tutamak, fare}
 *   kareEkle(fn)                      her çizilen kareden sonra fn(t, dt, sahne); çıkış işlevi döner
 *   sesAcik()                         ses çocuğun dokunuşuyla açıldı mı
 */
export function ciftlikSayfasi(kok = document.querySelector('#kok')) {
  const sayfa = el('main', 'ciftlik-sayfa');
  sayfa.setAttribute('aria-label', 'Çiftçi Fare, çiftlik');
  const kap = el('div', 'dunya ciftlik-dunya');
  sayfa.append(kap);

  /* Üst köşeler: sol geri, sağda öğretmen araçları. Hepsi ikon. */
  const ust = el('nav', 'ciftlik-ust');
  const geri = el('a', 'ciftlik-dugme ciftlik-geri', { href: 'index.html' });
  geri.setAttribute('aria-label', 'Oyun Bahçesine dön'); geri.title = 'Oyun Bahçesine dön';
  geri.innerHTML = simge('back');
  const araclar = el('div', 'ciftlik-araclar');
  const sesSvg = () => ses.isMuted() ? SESSIZ : simge('sound');
  const sesD = ikonDugme('ciftlik-ses', ses.isMuted() ? 'Sesleri aç' : 'Sesleri kapat', sesSvg(), b => {
    ses.start(); const acik = ses.toggle();
    b.innerHTML = sesSvg(); b.setAttribute('aria-label', acik ? 'Sesleri kapat' : 'Sesleri aç');
  });
  const eveD = ikonDugme('ciftlik-eve', 'Fareyi verandaya getir', simge('home'), () => etkin.sahne?.eveDon());
  const gorD = ikonDugme('ciftlik-gorunum', 'Görünümü değiştir', GOZ, b => {
    const sahne = etkin.sahne;
    if (!sahne) return;
    const yeni = sahne.gorunum() === 'omuz' ? 'birinci' : 'omuz';
    sahne.gorunum(yeni);
    b.classList.toggle('secili', yeni === 'birinci');
  });
  const tamD = ikonDugme('ciftlik-tam', 'Tam ekran', simge('expand'), () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  });
  araclar.append(sesD, eveD, gorD, tamD);
  ust.append(geri, araclar);
  sayfa.append(ust);
  const olcumKutu = el('output', 'ciftlik-olcum'); olcumKutu.hidden = !OLCUM;
  sayfa.append(olcumKutu);
  kok.replaceChildren(sayfa);

  const kareKancalari = new Set();
  /* Etkin dünya. Testler window.__ciftlik üzerinden okur (getter: dünya yeniden kurulunca da güncel). */
  let etkin = { sahne: null, masal: null, durum: { kurulumMs: 0, kareSay: 0 }, tutamak: null, fare: null };
  const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Tavuk sesi: bir hayvan kaçmaya başlayınca (en çok 4 sn'de bir). Ses
     ancak çocuğun ilk dokunuşundan sonra (tarayıcı kuralı); öncesinde
     ses.playAnimal ses bağlamını dokunuşsuz açmaya çalışırdı. */
  let sonGit = -9, kacanlar = new WeakSet(), sesAcik = false;
  const hayvanSesi = (t, durum) => {
    if (!sesAcik) return;
    for (const n of durum.tutamak?.hayvanlar || []) {
      const h = Math.hypot(n.vx, n.vz);
      if (h > 2 && !kacanlar.has(n)) {
        kacanlar.add(n);
        if (t - sonGit > 4) { sonGit = t; ses.playAnimal?.(n.tur); }
      } else if (h < .5) kacanlar.delete(n);
    }
  };

  /** Dünyayı (yeniden) kurar. kod: itilebilir belleği anahtarı; sembolRenk: şapka bandı ve mendil. */
  function dunyaKur({ kod = 'ciftlik-yerel', sembolRenk = renkSayi(RENKLER[0]) } = {}) {
    if (etkin.sahne) { try { etkin.sahne.dispose(); } catch (e) { console.error(e); } }
    kap.querySelector('.webgl-fallback')?.remove();
    const durum = { kurulumMs: 0, sadelesen: 0, kareSay: 0, fare: null, tutamak: null, deneme: DENEME, kod };
    const masal = ciftlikMasali({ kod, sembolRenk, piyonModel: (a, piyon, secenek) => (durum.fare = ciftciFare(a, piyon, secenek)) });
    const dunya = { sahne: null, masal, durum, tutamak: null, fare: null };
    etkin = dunya;

    /* Kare süresi göstergesi: son yarım saniyenin ortalaması. */
    let olcT = 0, olcN = 0, olcTop = 0;
    const olcumYaz = dt => {
      olcTop += dt; olcN++; olcT += dt;
      if (olcT < .5) return;
      const o = dunya.sahne.olcum(), ms = olcTop / olcN * 1000;
      olcumKutu.value = `${ms.toFixed(1)} ms · ${Math.round(1000 / ms)} fps · ${o.cizim} çizim · ${(o.ucgen / 1000).toFixed(0)}k üçgen`;
      olcT = olcN = olcTop = 0;
    };
    const t0 = performance.now();
    /* Etkin kameranın konumu: farenin çizimi sırasında yakalanır (motor
       kamerayı dışarı açmıyor). Örten yapılar (ev, ambar...) buna göre
       saydamlaşır. 1. şahıs görünümde fare çizilmez: yapılar opak kalır. */
    const kam = { x: 0, y: 0, z: 0, var: false };
    durum.kamera = kam;                                               // testler: etkin kameranın konumu
    const az = azHareket();
    try {
      dunya.sahne = kurMasalDunyasi(kap, {
        masal, duraklar: [], simdi: 0, dolu: 0,
        kare(t, dt) {
          if (!durum.kareSay++) durum.kurulumMs = +(performance.now() - t0).toFixed(1);
          const sahne = dunya.sahne;
          if (sahne) {
            const p = sahne.nerede();
            durum.tutamak?.kare(t, dt, kam.var && sahne.gorunum() === 'omuz' ? kam : null, { x: p.x, y: sahne.yukseklik(), z: p.z }, az);
          }
          hayvanSesi(t, durum);
          if (OLCUM) olcumYaz(dt);
          if (dunya !== etkin) return;
          for (const f of kareKancalari) { try { f(t, dt, sahne); } catch (e) { console.error(e); } }
        }
      });
      durum.insaMs = +(performance.now() - t0).toFixed(1);           // kurMasalDunyasi'nin kendisi (ilk kareden önce)
      durum.tutamak = dunya.tutamak = masal.ciftlik || null;
      dunya.fare = durum.fare;
      let bagli = false;
      durum.fare?.traverse(o => {
        if (bagli || !o.isMesh) return;
        bagli = true;
        o.onBeforeRender = (r, s, c) => { if (c.isPerspectiveCamera) { kam.x = c.position.x; kam.y = c.position.y; kam.z = c.position.z; kam.var = true; } };
      });
      durum.sadelesen = durum.tutamak?.sadelestir() ?? 0;
      durum.tacEngeli = durum.tutamak?.tacKamerasi?.() ?? 0;          // yüksek kamera taçların içinde kalmasın
      durum.bulut = durum.tutamak?.bulutlariTasi?.() ?? 0;           // alçak süs bulutları kameranın yolundan
      /* Çiftliğin kendi görünüm anahtarını yaz (masalların 'masal-gorunum'
         tercihi değişmez). Kayıtlı kip varsa aynen korunur. */
      dunya.sahne.gorunum(dunya.sahne.gorunum());
      gorD.classList.toggle('secili', dunya.sahne.gorunum() === 'birinci');
    } catch (hata) {
      console.error(hata);
      dunya.sahne = null;
      const yedek = el('div', 'webgl-fallback');
      yedek.innerHTML = `<div class="ciftlik-yedek-resim">${ikon('ciftlik-fare')}</div>`;
      yedek.append(el('h2', '', { textContent: 'Çiftlik açılamadı' }),
                   el('p', '', { textContent: 'Tarayıcıda donanım hızlandırmayı açıp sayfayı yenileyebilirsin.' }));
      kap.append(yedek);
    }
    window.__sahne = dunya.sahne;
    return dunya.sahne ? dunya : null;
  }

  /* Ses: tarayıcı ancak ilk dokunuştan sonra çalar. İlk dokunuşta çiftlik
     ortamı açılır (horozu kabuk, çiftlik açılınca öttürür). */
  if (!DENEME) {
    const ilkDokunus = () => {
      window.removeEventListener('pointerdown', ilkDokunus, true);
      window.removeEventListener('keydown', ilkDokunus, true);
      ses.start(); sesAcik = true;
    };
    window.addEventListener('pointerdown', ilkDokunus, true);
    window.addEventListener('keydown', ilkDokunus, true);
  }
  /* Sayfadan çıkarken dünyayı dağıt; geri-ileri önbelleğine giriyorsa
     (persisted) dokunma: geri dönülünce çizim kaldığı yerden sürer. */
  addEventListener('pagehide', e => { if (!e.persisted) { etkin.sahne?.dispose(); etkin.sahne = null; window.__sahne = null; } });

  const iskelet = {
    sayfa, kap, ust, araclar, deneme: DENEME,
    dunyaKur,
    dunya: () => etkin,
    kareEkle(fn) { kareKancalari.add(fn); return () => kareKancalari.delete(fn); },
    sesAcik: () => sesAcik
  };
  window.__ciftlik = {
    iskelet,
    get sahne() { return etkin.sahne; },
    get masal() { return etkin.masal; },
    get durum() { return etkin.durum; },
    get tutamak() { return etkin.durum.tutamak; },
    get fare() { return etkin.durum.fare; },
    get kurulumMs() { return etkin.durum.kurulumMs; }
  };
  return iskelet;
}

/* Geriye uyumluluk: eski tek-çağrılık açılış (dünya varsayılan renkle). */
export function ciftligiAc(kok) {
  const iskelet = ciftlikSayfasi(kok);
  const dunya = iskelet.dunyaKur();
  return { sahne: dunya?.sahne ?? null, durum: dunya?.durum ?? null, iskelet };
}

/* İşler (isler.js) kabuğa burada bağlanır: iş şeridi 'art arda aynı mekanik
   yok' kuralıyla seçilir, iş dokunuşunda mikro-oyun katmanı açılır. Kabuk
   dünyayı duraklatır; oyun bitince b.bitir() komutu depoya yazar, dünya hemen
   değişir; vazgeçilirse b.iptal() dünyayı sürdürür. */
kancaKaydet('seritSec', (adaylar, n) => isListesi(
  adaylar.filter(a => a.kod).map(a => ({ kod: a.kod, hedef: a.hedef, tur: a.bitki, adet: a.adet, kaynak: a })), { n }
).map(x => ({ ...x.kaynak, yedek: !!x.yedek })));
kancaKaydet('isBaslat', (is, b) => {
  if (!is.kod) { b.bitir(); return null; }                 // mekaniği olmayan iş: doğrudan tamam
  return isAc({ kod: is.kod, hedef: is.hedef, tur: is.bitki, adet: is.adet, yedek: !!is.yedek }, {
    yas: b.yas, alan: b.alan,
    bitince: () => b.bitir(),
    kapaninca: s => { if (!s) b.iptal(); }
  });
});
islerHazirla().catch(e => console.error(e));                // ilk iş beklemeden açılsın

/* Öğretmen paneli (dişli 2 sn + PIN) ve arkadaş ziyareti (kapı, misafir kipi,
   çıkartma, 'Sen yokken'). Anlatım kayıtlarının listesi (ses/anlatim/ciftlik.json)
   baştan okunur: kayıt yoksa oyun sessiz kalır. */
kancaKaydet('ogretmenPaneli', ogretmenPaneliAc);
ziyaretBagla(kancaKaydet);
anlatimHazirla();

const iskelet = ciftlikSayfasi();
window.__ciftlik.anlatim = anlatimDurum;
kabukBaslat({ iskelet, deneme: DENEME }).catch(e => console.error(e));

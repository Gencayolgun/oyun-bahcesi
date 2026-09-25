import {ikon,simge} from '../ikon.js';
import {ses} from '../ses.js';
import {baslatGorev} from '../gorev.js';
import {kurMasalDunyasi} from './dunya.js';
import {MASAL_EKLERI} from './gorev.js';
import {KURGULAR} from './kurgular/liste.js';
import {sahneOynat} from './sahne.js';

/* Masal motoru — ortak kabuk.

   Burada olan: sınıf kurulumu, açılış masalı, görev ekranı, final ve kayıt.
   Burada OLMAYAN: oyunun kurgusu. Her masal kendi KURGU'sunu seçer
   (masal.kurgu) ve tahtanın nasıl kurulduğunu, tahta ekranının neye
   benzediğini, bir görev bitince ne olduğunu o belirler:

     yolculuk  halka haritada durak durak ilerle, armağan topla
     yaris     iki yarışçı pistte; senin işin birini ilerletiyor
     kurtarma  tek hedef, geri sayan bir engel

   Böylece on masal on tema değil, on ayrı oyun oluyor.
   Ortak kalan: görev türleri, karakter çizimi, ses, tasarım dili.
   Zar yok, puan yok, süre yok, kaybetme yok. Ders içeriği yok. */

/* Tahtayı sınıftan kurar — ve ARDIŞIK İKİ DURAĞIN ASLA AYNI MEKANİĞİ
   kullanmamasını garanti eder. Bir çocuk taş taşıdıysa sıradaki çocuk
   taş taşımaz; her adım öncekinden farklı bir beceri ister.

   Yöntem: her adımda önceki mekanikten farklı adaylar arasından, en uzun
   süredir kullanılmayanı seçeriz. Böylece tekrar kaçınılmaz olduğunda
   (sınıf, engel havuzundan büyükse) bile mümkün olan en uzağa düşer.
   Seçim tamamen belirlenimci: aynı sınıf her açılışta aynı tahtayı verir. */
export function tahtaKur(mevcut, masal) {
  const n = Math.max(4, mevcut), b = masal.bolumler.length;
  const duraklar = [], temel = Math.floor(n / b), fazla = n % b;
  const turSon = new Map(), engelSon = new Map();
  let onceki = null;
  for (let i = 0; i < b; i++) {
    const adet = temel + (i < fazla ? 1 : 0), bol = masal.bolumler[i];
    for (let k = 0; k < adet - 1; k++) {
      let adaylar = bol.engeller.filter(e => e.gorev !== onceki);
      if (!adaylar.length) adaylar = bol.engeller.slice();   // başka çare yok
      adaylar = adaylar.slice().sort((x, y) => {
        const t = (turSon.get(x.gorev) ?? -1) - (turSon.get(y.gorev) ?? -1);
        if (t) return t;
        return (engelSon.get(x) ?? -1) - (engelSon.get(y) ?? -1);
      });
      const sec = adaylar[0];
      duraklar.push({ bolum: i, tip: 'engel', veri: sec });
      turSon.set(sec.gorev, duraklar.length);
      engelSon.set(sec, duraklar.length);
      onceki = sec.gorev;
    }
    duraklar.push({ bolum: i, tip: 'final', veri: bol.final });
    onceki = bol.final.etkinlik;
  }
  return duraklar;
}

const ORNEK_SINIF = ['Ada','Arda','Bulut','Ceren','Defne','Ege','Elif','Eymen','Kuzey','Lena',
                     'Mavi','Mert','Nehir','Ömer','Poyraz','Rüzgâr','Selin','Toprak','Yağmur','Zeynep'];

export function masaliBaslat(kok, masal, cikis) {
  const KAYIT = 'masal-' + masal.kod;
  let durum = { adlar: ORNEK_SINIF.slice(), sira: 0 };
  let sahne = null, oyun = null, hikayeNo = 0;

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  function dugme(metin, fn, cls = 'primary', isaret = 'arrow', sesAc = true) {
    const b = el('button', `btn ${cls}`); b.type = 'button';
    b.setAttribute('aria-label', metin); b.append(el('span', '', metin));
    if (isaret) b.insertAdjacentHTML('beforeend', simge(isaret));
    b.onclick = e => { if (sesAc) ses.start(); fn?.(e); };
    return b;
  }
  const kurgu = KURGULAR[masal.kurgu] || KURGULAR.yolculuk;
  const duraklar = () => (kurgu.tahtaKur || tahtaKur)(durum.adlar.length, masal);
  const armaganlar = () => duraklar().slice(0, durum.sira).filter(d => d.tip === 'final').map(d => d.bolum);
  const bolumNesnesi = i => ({ ...masal.bolumler[i], hayvan: masal.bolumler[i].karakter });

  function oku() {
    try {
      const s = JSON.parse(localStorage.getItem(KAYIT));
      if (s?.surum !== 1 || !Array.isArray(s.adlar) || s.adlar.length < 2 || s.adlar.length > 40) return null;
      const enCok = (kurgu.tahtaKur || tahtaKur)(s.adlar.length, masal).length;
      if (!Number.isInteger(s.sira) || s.sira < 0 || s.sira > enCok) return null;
      return { adlar: s.adlar, sira: s.sira };
    } catch { return null; }
  }
  const yaz = () => { try { localStorage.setItem(KAYIT, JSON.stringify({ surum: 1, ...durum })); } catch {} };
  function temizle() { sahne?.dispose(); sahne = null; oyun?.dispose(); oyun = null; kok.replaceChildren(); }

  function ustBar(ekran = 'harita') {
    const h = el('header', 'ust-bar');
    const marka = dugme(masal.ad, () => cikis(), 'marka', 'leaf', false);
    marka.append(el('span', 'marka-alt', masal.kaynak.toLocaleUpperCase('tr')));
    h.append(marka);
    if (ekran !== 'kurulum') {
      const nav = el('div', 'bolum-nav');
      masal.bolumler.forEach((b, i) => {
        const simdi = duraklar()[durum.sira]?.bolum ?? masal.bolumler.length - 1;
        nav.append(el('span', `nav-adim ${i === simdi ? 'simdi' : ''} ${armaganlar().includes(i) ? 'gecildi' : ''}`,
          `${String(i + 1).padStart(2, '0')}  ${b.ad}`));
      });
      h.append(nav);
    }
    const eylem = el('div', 'ust-eylemler');
    const sesD = dugme(ses.label(), () => {
      const acik = ses.toggle();
      sesD.querySelector('span').textContent = acik ? 'Sesleri kapat' : 'Sesleri aç';
    }, 'icon-btn', 'sound', false);
    eylem.append(sesD, dugme('Tam ekran', () => {
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      else document.documentElement.requestFullscreen?.().catch(() => {});
    }, 'icon-btn', 'expand'));
    h.append(eylem); return h;
  }

  /* Kamera kontrolleri. Görünüm düğmesi burada: koşu sırasında kameranın
     nerede duracağını öğretmen seçer ve seçim cihazda saklanır.
       Üstten     — kuş bakışı kalır, karakter aşağıda koşar (varsayılan)
       Omuz üstü  — kamera karakterin arkasına iner
       1. şahıs   — kamera karakterin gözünde */
  const GORUNUM = { ustten: 'Üstten', omuz: 'Omuz üstü', birinci: '1. şahıs' };
  function kameraKontrolleri(etiketler = {}) {
    const k = el('div', 'kamera-kontrolleri');
    k.append(dugme('−', () => sahne?.zoom(-.1), 'camera-btn', null),
             dugme('+', () => sahne?.zoom(.1), 'camera-btn', null),
             dugme(etiketler.sol || 'Sola döndür', () => sahne?.rotate(-.15), 'camera-btn reset', 'back'),
             dugme(etiketler.sag || 'Sağa döndür', () => sahne?.rotate(.15), 'camera-btn reset', 'arrow'),
             dugme('Görünümü sıfırla', () => sahne?.reset(), 'camera-btn reset', 'reset'));
    /* Karakter bir tepenin ardında kaybolursa ya da bir köşeye sıkışırsa:
       sınıf beklemesin, tek dokunuşla sıradaki durağa. */
    const don = dugme('Karakteri durağa getir', () => sahne?.eveDon?.(), 'camera-btn reset', 'home');
    don.title = 'Karakteri sıradaki durağa getir';
    k.append(don);
    k.children[0].ariaLabel = 'Uzaklaştır'; k.children[1].ariaLabel = 'Yakınlaştır';
    const sirali = Object.keys(GORUNUM);
    /* Düğme sahneden ÖNCE kuruluyor; kipi doğrudan kayıttan okumalı. */
    const kipOku = () => { try { return localStorage.getItem('masal-gorunum') || 'omuz'; } catch { return 'omuz'; } };
    const g = dugme(GORUNUM[kipOku()], () => {
      const su = sahne?.gorunum?.() || kipOku();
      const yeni = sirali[(sirali.indexOf(su) + 1) % sirali.length];
      sahne?.gorunum(yeni);
      try { localStorage.setItem('masal-gorunum', yeni); } catch {}
      g.querySelector('span').textContent = GORUNUM[yeni];
      g.setAttribute('aria-label', `Koşu görünümü: ${GORUNUM[yeni]}`);
    }, 'camera-btn gorunum-dugmesi', 'expand', false);
    g.setAttribute('aria-label', 'Koşu görünümünü değiştir');
    g.title = 'Karakter durağa koşarken kameranın yeri';
    k.append(g);
    return k;
  }

  /* Keşif kartı: haritayı kapatmadan açılan küçük bir ayrıntı paneli.
     Öğretmen duraklar arasında bunu açıp anlatabilir. */
  function kesfet(nokta) {
    document.querySelector('.kesif-karti')?.remove();
    const kart = el('aside', 'kesif-karti');
    kart.setAttribute('role', 'dialog');
    kart.setAttribute('aria-label', nokta.ad);
    const resim = el('div', 'kesif-resmi'); resim.innerHTML = ikon(nokta.ikon || masal.ikon);
    const govde = el('div', 'kesif-govde');
    govde.append(el('span', 'eyebrow', 'KEŞİF'), el('strong', '', nokta.ad), el('p', '', nokta.metin));
    const kapat = dugme('Kapat', () => kart.remove(), 'text-btn', null, false);
    kapat.classList.add('kesif-kapat');
    kart.append(resim, govde, kapat);
    document.querySelector('.ada-gorunumu')?.append(kart);
    ses.correct();
  }

  /* Karakterin en son bulunduğu durak. Harita yeniden kurulduğunda
     buradan yenisine koşar — sınıf yolculuğun kendisini görüyor. */
  let sonKonum = null;

  function dunyayaKur(kap, simdi = durum.sira, basla, ek = {}) {
    const onceki = sonKonum;
    const kosacak = onceki != null && onceki !== simdi && ek.kossuz !== true;
    sonKonum = simdi;
    try {
      sahne = kurMasalDunyasi(kap, { masal, duraklar: duraklar(), simdi, dolu: simdi / duraklar().length,
        basla, kesfet, oncekiSira: kosacak ? onceki : simdi, ...ek });
      if (kosacak) sahne.kos(onceki, simdi);
      if (typeof window !== 'undefined') window.__sahne = sahne;   // test ölçümü için
    } catch (hata) {
      console.error(hata);
      const yedek = el('div', 'webgl-fallback'); yedek.innerHTML = ikon(masal.ikon);
      yedek.append(el('h2', '', 'Harita görünümü açılamadı'),
                   el('p', '', 'Tarayıcıda donanım hızlandırmayı açıp sayfayı yenileyebilirsin. Görevler oynamaya hazır.'));
      kap.append(yedek);
    }
  }

  /* ——— 1 · Sınıf ——— */
  function kurulum() {
    temizle();
    const sayfa = el('main', 'sayfa kurulum'); sayfa.append(ustBar('kurulum'));
    const icerik = el('div', 'kurulum-icerik'), metin = el('section', 'kurulum-metin');
    metin.append(el('span', 'eyebrow', masal.kaynak.toLocaleUpperCase('tr') + ' · ' + masal.sure.toLocaleUpperCase('tr')),
                 el('h1', '', masal.ad), el('p', 'lead', masal.ozet));
    const form = el('form', 'sinif-formu');
    const etiket = el('label', '', 'Maceraya kimler katılıyor?'); etiket.htmlFor = 'adlar';
    const alan = el('textarea', 'ad-alani'); alan.id = 'adlar'; alan.rows = 3;
    alan.value = durum.adlar.join('\n'); alan.placeholder = 'Her satıra bir çocuk adı'; alan.spellcheck = false;
    form.append(etiket, alan);
    const bilgi = el('div', 'form-meta'), sayi = el('span');
    bilgi.append(sayi, dugme('Örnek sınıf', () => { alan.value = ORNEK_SINIF.join('\n'); say(); }, 'text-btn', null));
    form.append(bilgi);
    const hataKutu = el('div', 'form-error'); hataKutu.setAttribute('role', 'alert'); form.append(hataKutu);
    const adlar = () => alan.value.split('\n').map(a => a.trim()).filter(Boolean);
    function say() { const n = adlar().length; sayi.textContent = `${n} çocuk · ${Math.max(4, n)} durak`; }
    alan.addEventListener('input', say); say();
    const basla = dugme('Masalı başlat', null, 'primary'); basla.type = 'submit'; form.append(basla);
    form.onsubmit = e => {
      e.preventDefault(); const liste = adlar();
      if (liste.length < 2 || liste.length > 40 || liste.some(a => a.length > 40)) {
        hataKutu.textContent = '2–40 çocuk adı yaz. Her ad en fazla 40 karakter olsun.'; alan.focus(); return;
      }
      durum = { adlar: liste, sira: 0, ek: {} }; yaz(); hikayeNo = 0; hikaye();
    };
    const kayitli = oku();
    if (kayitli) form.append(dugme(
      kayitli.sira >= (kurgu.tahtaKur || tahtaKur)(kayitli.adlar.length, masal).length ? 'Tamamlanan masalı gör' : `Kaldığımız yerden · ${kayitli.sira + 1}. durak`,
      () => { durum = kayitli; durum.sira >= duraklar().length ? final() : tahta(); }, 'secondary', 'arrow'));
    metin.append(form, el('p', 'tiny', `${masal.ders}  ·  Süre baskısı yok  ·  Dokunarak oyna`));
    icerik.append(metin);
    const gorsel = el('div', 'kurulum-dunya'), kap = el('div', 'dunya'); gorsel.append(kap);
    const damga = el('div', 'ada-damga');
    damga.append(el('span', 'eyebrow', 'BU MASALIN DERSİ'), el('strong', '', masal.ders));
    gorsel.append(damga); icerik.append(gorsel); sayfa.append(icerik); kok.append(sayfa);
    dunyayaKur(kap, 0);
  }

  /* ——— 2 · Açılış masalı ——— */
  function hikaye() {
    temizle();
    const sayfa = el('main', 'sayfa hikaye'); sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti'), s = masal.acilis[hikayeNo];
    const resim = el('div', 'hikaye-resim'); resim.innerHTML = ikon(s.ikon);
    kutu.append(resim, el('span', 'eyebrow', s.tag), el('h1', '', s.baslik), el('p', '', s.metin));
    const noktalar = el('div', 'hikaye-noktalar');
    masal.acilis.forEach((_, i) => noktalar.append(el('i', i === hikayeNo ? 'aktif' : '')));
    kutu.append(noktalar);
    const kontrol = el('div', 'hikaye-kontroller');
    if (hikayeNo > 0) kontrol.append(dugme('Geri', () => { hikayeNo--; hikaye(); }, 'secondary', 'back'));
    kontrol.append(dugme(hikayeNo === masal.acilis.length - 1 ? 'Yolculuğa başla' : 'Masala devam et',
      () => { if (hikayeNo < masal.acilis.length - 1) { hikayeNo++; hikaye(); } else tahta(); }));
    kutu.append(kontrol); sayfa.append(kutu); kok.append(sayfa);
  }

  /* ——— 3 · Tahta ekranı — kurgu belirler ——— */
  function tahta() {
    if (durum.sira >= duraklar().length) return final();
    temizle();
    kurgu.ekran(api);
  }

  /* ——— 4 · Görev ——— */
  /* Her durak önce bir sahneyle açılır: görevin çözdüğü sorunu çocuk
     önce görür, sonra tahtaya gelir. Sahne oyunun kendi karakterleriyle
     canlandırılır, öğretmen istediğinde geçebilir. */
  function gorevEkrani() {
    const liste = duraklar(), durak = liste[durum.sira];
    if (!durak) return final();
    const sahne = durak.veri.sahne;
    if (!sahne) return gorevKur();
    temizle();
    const bol = bolumNesnesi(durak.bolum);
    const kap = el('div', 'sahne-kabi'); kok.append(kap);
    sahneOynat(kap, sahne, bol, gorevKur);
  }

  function gorevKur() {
    const liste = duraklar(), durak = liste[durum.sira];
    if (!durak) return final();
    temizle();
    const bol = bolumNesnesi(durak.bolum), ad = durum.adlar[durum.sira % durum.adlar.length];
    ses.setRegion(['ciftlik', 'orman', 'deniz', 'dag'][durak.bolum] || 'ciftlik');
    const sayfa = el('main', 'sayfa gorev-sayfasi'); sayfa.style.setProperty('--accent', bol.renk);
    sayfa.dataset.region = ['ciftlik', 'orman', 'deniz', 'dag'][durak.bolum] || 'ciftlik';
    sayfa.append(ustBar());
    const dekor = el('div', 'gorev-dekor'); dekor.setAttribute('aria-hidden', 'true');
    dekor.innerHTML = '<i class="dekor-bulut bulut-1"></i><i class="dekor-bulut bulut-2"></i><i class="dekor-yaprak yaprak-1"></i><i class="dekor-yaprak yaprak-2"></i><i class="dekor-cicek cicek-1"></i><i class="dekor-cicek cicek-2"></i>';
    sayfa.append(dekor);
    const tepe = el('div', 'gorev-ust');
    tepe.append(dugme(kurgu.geriEtiket || 'Haritaya dön', tahta, 'text-btn', 'back'),
                el('span', 'eyebrow', `${bol.ad.toLocaleUpperCase('tr')} · DURAK ${durum.sira + 1} / ${liste.length}`));
    sayfa.append(tepe);
    const baslik = el('div', 'gorev-baslik');
    const cocuk = el('div', 'oyuncu-etiketi');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sıra sende, ${ad}`));
    const turAdi = { say: 'SAYMA', ayir: 'AYIRMA', eslestir: 'EŞLEŞTİRME', sirala: 'SIRALAMA',
      besle: 'DOSTUNU BESLE', timarla: 'DOSTUNU FIRÇALA', sev: 'SEVGİNİ GÖSTER',
      paylas: 'EŞİT PAYLAŞTIR', kayip: 'NE KAYBOLDU?', gizli: 'GİZLİ DOSTLAR', oruntu: 'ÖRÜNTÜ',
      yol: 'YOL ÇİZ', yapboz: 'YAPBOZ', dizi: 'DİNLE VE TEKRARLA', fark: 'FARKI BUL',
      zaman: 'TAM ZAMANINDA', terazi: 'TERAZİ',
      yakala: 'YAKALA', takip: 'TAKİP ET', refleks: 'REFLEKS',
      takimyildiz: 'TAKIMYILDIZ', cift: 'ÇİFT BUL', isabet: 'İSABET' };
    const tur = durak.tip === 'final' ? durak.veri.etkinlik : durak.veri.gorev;
    const ustSatir = el('div', 'gorev-baslik-ust');
    ustSatir.append(el('span', 'gorev-tur', turAdi[tur] || 'BUGÜNKÜ İŞ'), cocuk);
    const yonerge = durak.tip === 'final'
      ? { besle: `${bol.karakter.ad} acıkmış. Yemi ona birlikte verelim mi?`,
          timarla: `${bol.karakter.ad} biraz dağınık. Hadi tüylerini birlikte tarayalım.`,
          sev: `${bol.karakter.ad} sarılmak istiyor. Dokunup sevelim mi?` }[durak.veri.etkinlik]
      : durak.veri.yonerge;
    baslik.append(ustSatir, el('h1', '', durak.veri.engel), el('p', '', yonerge));
    sayfa.append(baslik);
    const alan = el('section', 'gorev-sahnesi'); alan.setAttribute('aria-label', 'Görev oyun alanı'); sayfa.append(alan);
    const alt = el('footer', 'gorev-alt'), durumKutu = el('div', 'gorev-durumu');
    durumKutu.innerHTML = simge('leaf');
    const durumYazi = el('span', '', 'Acelemiz yok. İstediğin kadar deneyebilirsin.');
    durumKutu.append(durumYazi); alt.append(durumKutu);
    let cozuldu = false, gecti = false;
    const sonraki = dugme('Görevi tamamlayalım', () => {
      if (!cozuldu || gecti) return;
      gecti = true; durum.sira++; yaz();
      const sonra = kurgu.sonra?.(durak, api);
      if (sonra !== 'beklet') (durak.tip === 'final' ? odul(durak.bolum) : tahta());
    });
    sonraki.disabled = true; alt.append(sonraki); sayfa.append(alt); kok.append(sayfa);
    // Bakım görevi gorev.js'te 'bakim' adıyla biliniyor.
    const gorevDurak = { tip: durak.tip === 'final' ? 'bakim' : 'engel', veri: durak.veri };
    oyun = baslatGorev(alan, gorevDurak, bol,
      () => {
        cozuldu = true; sonraki.disabled = false;
        /* Etiketler kurgudan (ve istenirse masaldan) gelir. Eskiden bütün
           masallarda Karınca'ya özgü "Ambar biraz daha doldu" ve "Armağanı al"
           yazıyordu; kurtarma, konukluk, güven kurgularında ne ambar ne armağan var. */
        const et = { basari: 'Başardın!', devam: 'Devam et', final: 'Bölümü bitir',
                     ...(kurgu.etiketler || {}), ...(masal.etiketler || {}) };
        sonraki.querySelector('span').textContent = durak.tip === 'final' ? et.final : et.devam;
        sonraki.setAttribute('aria-label', sonraki.textContent);
        durumYazi.textContent = typeof et.basari === 'function' ? et.basari(durak, api) : et.basari;
        alt.classList.add('tamamlandi');
      },
      (n, toplam, etiket) => {
        sonraki.querySelector('span').textContent = etiket || `Önce görevi tamamlayalım · ${n}/${toplam}`;
        sonraki.setAttribute('aria-label', sonraki.textContent);
      }, MASAL_EKLERI);
  }

  /* ——— 5 · Bölüm armağanı ——— */
  function odul(i) {
    temizle();
    const bol = masal.bolumler[i];
    const sayfa = el('main', 'sayfa hikaye odul'); sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti'), resim = el('div', 'hikaye-resim');
    resim.innerHTML = ikon(bol.armagan.kod);
    kutu.append(resim, el('span', 'eyebrow', `${i + 1} / ${masal.bolumler.length} ARMAĞAN TAMAMLANDI`),
      el('h1', '', `${bol.armagan.ad} bizimle!`), el('p', '', bol.final.cozum),
      el('p', 'odul-gecis', i < masal.bolumler.length - 1
        ? `Sırada ${masal.bolumler[i + 1].ad.toLocaleLowerCase('tr')} var.`
        : 'Dört mevsim tamamlandı. Şimdi masalın sonuna.'),
      dugme(i === masal.bolumler.length - 1 ? 'Masalın sonunu gör' : 'Masala devam et', tahta));
    sayfa.append(kutu); kok.append(sayfa);
  }

  /* ——— 6 · Final ——— */
  function final() {
    temizle();
    const sayfa = el('main', 'sayfa final'); sayfa.append(ustBar());
    const icerik = el('div', 'final-icerik'), sol = el('section', 'final-metin');
    sol.append(el('span', 'eyebrow', masal.kaynak.toLocaleUpperCase('tr') + ' · MASALIN SONU'),
               el('h1', '', masal.kapanis.baslik));
    masal.kapanis.metin.split('\n\n').forEach((p, i) => sol.append(el('p', i ? '' : 'lead', p)));
    const ders = el('p', 'masal-dersi'); ders.textContent = masal.kapanis.ders; sol.append(ders);
    const adlar = el('div', 'yapraklar');
    durum.adlar.forEach(a => adlar.append(el('span', 'yaprak', a)));
    sol.append(adlar, dugme('Yeni bir sınıfla oyna', kurulum, 'primary'),
               el('span', 'save-status tiny', 'Masalınız bu cihazda saklandı.'));
    const gorunum = el('div', 'final-dunya'); icerik.append(sol, gorunum);
    sayfa.append(icerik); kok.append(sayfa);
    dunyayaKur(gorunum, duraklar().length, null, { kossuz: true });
  }

  const api = {
    get durum() { return durum; }, get sahne() { return sahne; }, kameraKontrolleri,
    masal, kok, el, dugme, ustBar, dunyayaKur,
    duraklar, armaganlar, bolumNesnesi, gorevEkrani, final, tahta, temizle, yaz,
    ikon, simge, ses
  };

  const kayitli = oku();
  if (kayitli) durum = kayitli;
  kurulum();
  return { dispose: temizle };
}

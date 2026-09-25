/* KURGU · KARŞILIK — iyilik zinciri.

   Yolculuktan, yarıştan, kurtarmadan farkı yapısal:
     · Toplanan armağan yok, rakip yok, geri sayan engel yok. Tahta bir
       İYİLİK DEFTERİ: iki sütun, her durak bir halka.
     · İlk yarıda (1–2. bölüm) yalnız sol sütun dolar: verenin iyilikleri.
       Sağ sütun boş halkalarla bekler — karşılık henüz gelmedi.
     · İkinci yarıda (3–4. bölüm) her durak, ilk yarıdaki EŞ bir iyiliğe
       bağlanır (paketteki 'es' → 'id'). Durak çözülünce iki halka arasına
       köprü çizilir. Tahta her seferinde sorar: “Hatırla: 5. durakta Pamuk
       ne yapmıştı?” — cevap önce gizli, öğretmen sınıfa sorduktan sonra açar.
     · Durak sonrası: tahtaya dönünce az önce eklenen halka deftere
       takılır; ikinci yarıda eşine uzanan köprü soldan sağa çizilir ve
       dünyanın üstünde iki halkayı birbirine bağlayan küçük bir kart
       açılır (“10 ⟷ 17 · köprü kuruldu”).
     · Bölüm sonunda armağan ekranı yok; zincirin o anki hâli gelir.
     · Engeller hikâye sırasıyla oynanır (kendi tahtaKur’u): ikinci yarıdaki
       her karşılık, anlattığı iyilikten sonra gelmeli.

   Karınca ile Güvercin bunu kullanır: Pamuk Minik’i dereden kurtarır,
   günler sonra Minik iyiliği geri verir. */

const ILK_YARI = 2;                         // 0–1. bölüm verenin, 2–3. bölüm dönenin

/* Az önce eklenen halkanın sırası: sonra() yazar, tahta bir kez oynatır. */
let yeniHalka = -1;

/* Hikâye sırası. Motorun tahtaKur’u en uzun süredir kullanılmayan mekaniği
   öne alır; bu masalda engeller bir hikâye anlattığı için sıra paketteki
   sıradır. Sınıf küçükse bölümün engelleri arasından eşit aralıklı seçilir
   (baştaki ve sondaki hep kalır); büyükse sırayla başa sarılır. Ardışık iki
   durak asla aynı mekaniği kullanmaz: gerekirse bir sonraki engele geçilir. */
export function hikayeSirasi(mevcut, masal) {
  const n = Math.max(4, mevcut), b = masal.bolumler.length;
  const temel = Math.floor(n / b), fazla = n % b, duraklar = [];
  let onceki = null;
  for (let i = 0; i < b; i++) {
    const bol = masal.bolumler[i], E = bol.engeller, k = temel + (i < fazla ? 1 : 0) - 1;
    let secim;
    if (k <= 0) secim = [];
    else if (k <= E.length) secim = Array.from({ length: k }, (_, j) => k === 1 ? 0 : Math.round(j * (E.length - 1) / (k - 1)));
    else secim = Array.from({ length: k }, (_, j) => j % E.length);
    secim.forEach(ix => {
      let e = E[ix];
      for (let d = 1; e.gorev === onceki && d < E.length; d++) e = E[(ix + d) % E.length];
      duraklar.push({ bolum: i, tip: 'engel', veri: e });
      onceki = e.gorev;
    });
    duraklar.push({ bolum: i, tip: 'final', veri: bol.final });
    onceki = bol.final.etkinlik;
  }
  return duraklar;
}

/* Zincir: soldaki halkalar (iyilikler) ve sağdakiler (karşılıklar).
   Her sağ halka önce paketteki eşini arar; eşi bu sınıfın tahtasında yoksa
   (küçük sınıf) boşta kalan ilk iyiliğe bağlanır. */
function zincirKur(liste) {
  const sol = [], sag = [];
  liste.forEach((d, sira) => (d.bolum < ILK_YARI ? sol : sag).push({ d, sira }));
  const bagli = new Set();
  sag.forEach(h => {
    let i = sol.findIndex((s, k) => !bagli.has(k) && s.d.veri.id && s.d.veri.id === h.d.veri.es);
    if (i < 0) i = sol.findIndex((s, k) => !bagli.has(k) && s.d.tip === h.d.tip);
    if (i < 0) i = sol.findIndex((_, k) => !bagli.has(k));
    h.es = i; if (i >= 0) bagli.add(i);
  });
  return { sol, sag };
}

function durumYazisi(liste, sira, K) {
  const { sol, sag } = zincirKur(liste);
  if (sira < sol.length) return sira === 0
    ? `Defter boş. ${K.veren.iyelik} ilk iyiliği birazdan başlıyor.`
    : `${K.veren.iyelik} ${sira} iyiliği deftere yazıldı. ${K.donen.ad} hepsini aklında tutuyor.`;
  const verilen = sira - sol.length;
  if (verilen === 0) return `${sol.length} iyilik birikti. Şimdi karşılık sırası ${K.donen.bulunma || K.donen.ad}.`;
  if (verilen < sag.length) return `${verilen} köprü kuruldu. ${sag.length - verilen} iyilik karşılığını bekliyor.`;
  return 'Zincir tamam: her iyiliğin bir karşılığı var.';
}

/* İyilik defteri. dikey: tahtanın sağ sütunu (etiketli satırlar);
   yatay: bölüm sonu ekranı (iki sıra halka, aralarında köprüler). */
function defterCiz(api, liste, sira, { yatay = false, yeni = -1 } = {}) {
  const { el, ikon, masal } = api, K = masal.karsilik;
  const { sol, sag } = zincirKur(liste);
  const kok = el('section', 'karsilik-defter' + (yatay ? ' yatay' : ''));
  kok.dataset.kurguDurak = String(sira);
  kok.dataset.kurguToplam = String(liste.length);
  kok.setAttribute('aria-label', `İyilik defteri: ${sira} / ${liste.length} halka`);
  const bas = el('header', 'defter-baslik');
  const verilen = Math.max(0, Math.min(sag.length, sira - sol.length));
  [[K.veren, `${K.veren.iyelik} iyilikleri`, Math.min(sira, sol.length), sol.length, 'sol'],
   [K.donen, `${K.donen.iyelik} karşılıkları`, verilen, sag.length, 'sag']].forEach(([kisi, baslik, n, top, yan]) => {
    const s = el('div', `defter-sutun ${yan}`), yuz = el('span', 'defter-yuz');
    yuz.innerHTML = ikon(kisi.kod);
    const y = el('div'); y.append(el('strong', '', baslik), el('small', '', `${n} / ${top}`));
    s.append(yuz, y); bas.append(s);
  });
  kok.append(bas);

  const hal = (h, yan) => {
    const durum = h.sira < sira ? 'dolu' : h.sira === sira ? 'simdi' : 'bos';
    const d = el('div', `halka ${yan} ${durum}${h.sira === yeni ? ' yeni' : ''}`);
    d.dataset.durak = String(h.sira + 1);
    const numara = el('b', '', String(h.sira + 1));
    const ad = h.d.veri.halka || h.d.veri.engel;
    // Sağdaki gelecek halkalar sürpriz: karşılık yapılmadan adı görünmez.
    const gizli = yan === 'sag' && durum === 'bos';
    d.append(numara);
    if (!yatay) d.append(el('span', 'halka-adi', gizli ? '…' : ad));
    d.title = `${h.sira + 1}. durak · ${gizli ? 'karşılık bekliyor' : ad}`;
    return d;
  };
  const satirlar = el('ol', 'defter-satirlar');
  const sagEs = new Map(sag.filter(h => h.es >= 0).map(h => [h.es, h]));
  const satir = (s, h) => {
    const li = el('li', 'defter-satir');
    const kopru = el('i', 'kopru');
    if (s && h && h.sira < sira) li.classList.add('koprulu');
    if (s && h && h.sira === yeni) li.classList.add('kopru-yeni');
    if (h && h.sira === sira) li.classList.add('es-vurgu');
    li.append(s ? hal(s, 'sol') : el('div', 'halka sol yok'), kopru, h ? hal(h, 'sag') : el('div', 'halka sag yok'));
    satirlar.append(li);
  };
  sol.forEach((s, i) => satir(s, sagEs.get(i)));
  sag.filter(h => h.es < 0).forEach(h => satir(null, h));
  kok.append(satirlar);
  return kok;
}

/* Alt çubuktaki küçük defter: çift çift sütunlar. */
function miniDefter(api, liste, sira, yeni = -1) {
  const { el } = api, { sol, sag } = zincirKur(liste);
  const mini = el('div', 'karsilik-mini');
  mini.setAttribute('aria-hidden', 'true');
  const sagEs = new Map(sag.filter(h => h.es >= 0).map(h => [h.es, h]));
  const nokta = (h, yan) => {
    if (!h) return el('i', 'yok');
    const d = h.sira < sira ? 'dolu' : h.sira === sira ? 'simdi' : '';
    return el('i', `${yan} ${d}${h.sira === yeni ? ' yeni' : ''}`);
  };
  const sutun = (s, h) => {
    const c = el('span', 'mini-cift');
    if (s && h && h.sira < sira) c.classList.add('bagli');
    if (s && h && h.sira === yeni) c.classList.add('kopru-yeni');
    c.append(nokta(s, 'sol'), el('b', 'mini-kopru'), nokta(h, 'sag'));
    return c;
  };
  sol.forEach((s, i) => mini.append(sutun(s, sagEs.get(i))));
  sag.filter(h => h.es < 0).forEach(h => mini.append(sutun(null, h)));
  return mini;
}

/* Durak sonrası dünyanın üstünde açılan kart. İlk yarıda: “Yeni halka”.
   İkinci yarıda: iki halka yan yana, aralarında köprü. */
function halkaHaberi(api, liste, yeni) {
  const { el, ikon, masal } = api, K = masal.karsilik;
  const d = liste[yeni]; if (!d) return null;
  const { sol, sag } = zincirKur(liste);
  const ad = h => h.d.veri.halka || h.d.veri.engel;
  const kart = el('div', 'karsilik-haber');
  kart.setAttribute('role', 'status');
  const yuz = kod => { const f = el('span', 'kh-yuz'); f.innerHTML = ikon(kod); return f; };
  const halka = (h, yan) => {
    const k = el('div', `kh-halka ${yan}`);
    k.append(el('b', '', String(h.sira + 1)), el('span', '', ad(h)));
    return k;
  };
  if (d.bolum < ILK_YARI) {
    const h = sol.find(x => x.sira === yeni);
    kart.classList.add('ilk');
    kart.append(yuz(K.veren.kod), el('small', 'kh-baslik', 'Deftere yeni halka'), halka(h, 'sol'));
  } else {
    const h = sag.find(x => x.sira === yeni), es = h && h.es >= 0 ? sol[h.es] : null;
    if (!h) return null;
    kart.classList.add('karsi');
    kart.append(el('small', 'kh-baslik', es ? 'Köprü kuruldu' : 'Yeni karşılık'));
    const sira = el('div', 'kh-sira');
    if (es) sira.append(yuz(K.veren.kod), halka(es, 'sol'), el('i', 'kh-kopru'));
    sira.append(halka(h, 'sag'), yuz(K.donen.kod));
    kart.append(sira);
  }
  return kart;
}

export default {
  kod: 'karsilik',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Zincire bir halka eklendi.', devam: 'Deftere dön', final: 'Bölümü bitir' },
  geriEtiket: 'Deftere dön',
  tahtaKur: hikayeSirasi,

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, ses } = api;
    const liste = duraklar(), durak = liste[durum.sira], b = durak.bolum, bol = masal.bolumler[b];
    const K = masal.karsilik, ikinci = b >= ILK_YARI;
    const yeni = yeniHalka === durum.sira - 1 ? yeniHalka : -1;
    yeniHalka = -1;
    ses.setRegion(['orman', 'ciftlik', 'orman', 'deniz'][b] || 'orman');

    const sayfa = el('main', 'sayfa harita karsilik-sayfasi' + (ikinci ? ' ikinci-yari' : ''));
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());
    const icerik = el('div', 'harita-icerik karsilik-icerik');

    /* Sol: bölümün hikâyesi ve sıradaki iş */
    const yan = el('aside', 'yolculuk-paneli karsilik-paneli');
    yan.append(el('span', 'eyebrow', `${String(b + 1).padStart(2, '0')}. BÖLÜM · ${bol.ad.toLocaleUpperCase('tr')}`),
               el('h1', '', bol.baslik), el('p', 'bolum-hikaye', bol.hikaye));
    const dostKart = el('div', 'dost-karti'), resim = el('div', 'dost-resmi');
    resim.innerHTML = ikon(bol.karakter.kod);
    const konus = el('div'); konus.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    dostKart.append(resim, konus); yan.append(dostKart);

    const gorev = el('div', 'siradaki-gorev');
    const ad = durum.adlar[durum.sira % durum.adlar.length];
    gorev.append(el('span', 'eyebrow', ikinci ? 'KARŞILIĞI SEN VERECEKSİN' : 'BU İYİLİĞİ SEN YAPACAKSIN'),
      el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final'
        ? `${bol.karakter.ad} ile ilgilen; zincire bir halka daha eklensin.`
        : durak.veri.yonerge));

    /* İkinci yarı: bu karşılığın eşi olan iyiliği hatırlat. Cevap gizli
       başlar; öğretmen sınıfa sorar, sonra açar. */
    if (ikinci) {
      const { sol, sag } = zincirKur(liste);
      const bu = sag.find(h => h.sira === durum.sira), es = bu && bu.es >= 0 ? sol[bu.es] : null;
      if (es) {
        const hatirla = el('div', 'hatirla-karti');
        const soru = el('p', 'hatirla-soru');
        soru.append(el('span', 'eyebrow', 'HATIRLA'), el('strong', '', `${es.sira + 1}. durakta ${K.veren.ad} ne yapmıştı?`));
        const cevap = el('div', 'hatirla-cevap');
        const cr = el('span', 'hatirla-resim'); cr.innerHTML = ikon(es.d.tip === 'final' ? masal.bolumler[es.d.bolum].karakter.kod : (es.d.veri.sahne?.nesne || K.veren.kod));
        const cy = el('div'); cy.append(el('strong', '', es.d.veri.halka || es.d.veri.engel), el('small', '', es.d.veri.cozum || ''));
        cevap.append(cr, cy); cevap.hidden = true;
        const goster = dugme('Cevabı göster', () => {
          cevap.hidden = false; goster.remove(); hatirla.classList.add('acildi');
          sayfa.querySelector(`.halka.sol[data-durak="${es.sira + 1}"]`)?.classList.add('parilti');
        }, 'text-btn hatirla-dugmesi', null);
        hatirla.append(soru, goster, cevap);
        gorev.append(hatirla);
      }
    }
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    gorev.append(cocuk); yan.append(gorev); icerik.append(yan);

    /* Orta: açık dünya */
    const gorunum = el('section', 'ada-gorunumu'); gorunum.setAttribute('aria-label', masal.ad + ' dere kıyısı');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik');
    baslik.append(el('span', 'eyebrow', ikinci ? 'KARŞILIK ZAMANI' : 'İYİLİK ZAMANI'), el('h2', '', masal.ad));
    gorunum.append(baslik);
    gorunum.append(api.kameraKontrolleri({ sol: 'Sola döndür', sag: 'Sağa döndür' }));
    const haber = yeni >= 0 ? halkaHaberi(api, liste, yeni) : null;
    if (haber) gorunum.append(haber);
    icerik.append(gorunum);

    /* Sağ: iyilik defteri */
    const defterKap = el('aside', 'karsilik-yan');
    defterKap.append(defterCiz(api, liste, durum.sira, { yeni }));
    icerik.append(defterKap);
    sayfa.append(icerik);

    /* Alt: zincirin kısa hâli ve düğme. Armağan torbası yok. */
    const alt = el('footer', 'yolculuk-alt karsilik-alt');
    const sayac = el('div', 'karsilik-sayac');
    sayac.append(el('span', 'eyebrow', 'İYİLİK ZİNCİRİ'));
    const buyuk = el('strong', '');
    buyuk.append(el('b', 'karsilik-sayi', String(durum.sira)), el('small', '', ` / ${liste.length} halka`));
    sayac.append(buyuk);
    /* Defterin küçüğü: her sütun bir çift — üstte verenin halkası, altta
       onun karşılığı; karşılık verilince aralarına köprü kurulur. Dar
       ekranda defter sütunu gizlenince eşleşme burada görünmeye devam eder. */
    sayac.append(miniDefter(api, liste, durum.sira, yeni)); alt.append(sayac);

    const durumKutu = el('div', 'karsilik-durum');
    const yuzler = el('span', 'karsilik-yuzler');
    yuzler.innerHTML = ikon(K.veren.kod) + ikon(K.donen.kod);
    durumKutu.append(yuzler, el('span', '', durumYazisi(liste, durum.sira, K)));
    alt.append(durumKutu);

    const eylemler = el('div', 'harita-eylemler');
    if (durum.sira > 0) eylemler.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Zincire halka ekle', gorevEkrani));
    alt.append(eylemler); sayfa.append(alt); kok.append(sayfa);
    dunyayaKur(kap, durum.sira, gorevEkrani);
    /* Yeni halka defterin görünen yerinde olsun (uzun sınıfta defter kayar). */
    const hedef = defterKap.querySelector('.halka.yeni') || defterKap.querySelector('.halka.simdi');
    if (hedef) defterKap.scrollTop = Math.max(0, hedef.offsetTop - defterKap.clientHeight / 2);
  },

  /* Bölüm sonunda armağan değil, zincirin o anki hâli gelir. */
  sonra(durak, api) {
    yeniHalka = api.durum.sira - 1;
    if (durak.tip !== 'final') return;
    const { durum, masal, kok, el, dugme, ustBar, duraklar, ikon } = api;
    api.temizle();
    const liste = duraklar(), K = masal.karsilik, bol = masal.bolumler[durak.bolum];
    const son = durak.bolum === masal.bolumler.length - 1;
    const sayfa = el('main', 'sayfa hikaye odul karsilik-odul');
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti'), resim = el('div', 'hikaye-resim');
    resim.innerHTML = ikon(bol.karakter.kod);
    kutu.append(resim, el('span', 'eyebrow', `${durak.bolum + 1}. BÖLÜM TAMAMLANDI · ${durum.sira} / ${liste.length} HALKA`),
      el('h1', '', bol.bolumSonu || `${bol.ad} bitti!`),
      el('p', '', bol.final.cozum),
      defterCiz(api, liste, durum.sira, { yatay: true }),
      el('p', 'odul-gecis', durumYazisi(liste, durum.sira, K)),
      dugme(son ? 'Masalın sonunu gör' : 'Deftere dön', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    return 'beklet';
  }
};

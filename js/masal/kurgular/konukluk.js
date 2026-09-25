/* KURGU · KONUKLUK — iki ev, iki davet, bir sofra.

   Yolculuktan, yarıştan, kurtarmadan farkı yapısal:
     · Toplanan bir armağan, ilerleyen bir yarışçı, azalan bir ip yok.
       Tahtanın altında YUKARIDAN GÖRÜLEN BİR SOFRA var. Her durak o
       sofraya bir şey koyar: tabak, testi, kaşık, yemek.
     · Konan her şey KİME UYGUN diye işaretlenir: tilki ağzı (turuncu),
       leylek gagası (kırmızı) ya da herkes (yeşil). Sınıf sofraya bakınca
       masalın sorununu görür: Alev'in sofrasında her şey turuncu,
       Lale'ninkinde kırmızı; ortak sofrada hepsi yeşil.
     · Sofranın iki ucunda Alev ile Lale oturur; "ev sahibi" ve "misafir"
       rolleri bölüme göre yer değiştirir.
     · İlerleme "kaçıncı durak" değil: "sofrada 12 / 28 şey hazır".
     · Durak bitince tahtaya dönülür ve konan şey sofraya düşer; dünyanın
       üstünde "… sofraya kondu" notu çıkar.
     · Bölüm sonunda armağan ekranı değil, "Misafir doydu mu?" karnesi gelir.
     · Tahtayı kendisi kurar (hikayeSirasi): duraklar paketteki hikâye
       sırasıyla gelir; küçük sınıfta masalın kalbi olan duraklar düşmez.

   Paket her engelde ve finalde bir 'sofra' alanı taşır:
     sofra: { sekil, ad, kime: 'tilki' | 'leylek' | 'ikisi' }
   ve her bölümde bir 'karne': { baslik, notlar: [{kod, ad, durum, metin}], son }.
   durum: doydu · ac · hazir · bekliyor. */

const KIME = {
  tilki:  { sinif: 'tilki',  etiket: ad => `${ad.ev}’e uygun` },
  leylek: { sinif: 'leylek', etiket: ad => `${ad.misafir}’ye uygun` },
  ikisi:  { sinif: 'ikisi',  etiket: () => 'Herkese uygun' }
};
const DURUM = { doydu: 'Doydu', ac: 'Aç kaldı', hazir: 'Hazır', bekliyor: 'Yolda' };

/* Bölüme göre roller: ilk iki bölüm Alev'in evinde, üçüncüsü Lale'nin,
   dördüncüsü köyün ortasında — orada herkes hem ev sahibi hem misafir. */
const ROLLER = [['EV SAHİBİ', 'MİSAFİR'], ['EV SAHİBİ', 'MİSAFİR'], ['MİSAFİR', 'EV SAHİBİ'], ['DOST', 'DOST']];

/* DURAK SIRASI = HİKÂYE SIRASI (kurgunun kendi tahtaKur'u).
   Motorun tahtaKur'u en uzun süredir kullanılmayan mekaniği öne alır ve
   küçük sınıfta her bölümün İLK engellerini tutar. Bu masal ise iki
   yemeğin hikâyesi: küçük bir sınıfta Lale'nin gagasının tabağa, Alev'in
   burnunun testiye girmediği duraklar düşerse masalın kendisi düşer —
   karne "aç kaldı" der ama sınıf bunu hiç görmemiş olur.
   Burada her bölümden paketteki 'oncelik'e göre en önemli işler seçilir
   ve PAKETTEKİ SIRAYLA oynanır. 'oncelik: 1' hiç düşmez. Öncelik eşitse
   (ya da daha önce oynanmış bir mekanikse, küçük bir cezayla) sınıf başka
   bir beceri görsün diye ötekine geçilir. 28 kişilik sınıfta her bölümün
   altı engelinin hepsi paketteki sırayla gelir. Ardışık iki durak asla
   aynı mekaniği kullanmaz: bir bölümün engelleri birbirinden farklı
   türdedir, bölüm aralarında da final etkinliği (bakım) durur; yine de
   bir güvenlik kilidi aynı tür art arda gelirse sıradakine kayar. */
export function hikayeSirasi(mevcut, masal) {
  const n = Math.max(4, mevcut), B = masal.bolumler.length;
  const temel = Math.floor(n / B), fazla = n % B, duraklar = [], kullanilan = new Set();
  let onceki = null;
  masal.bolumler.forEach((bol, i) => {
    const E = bol.engeller, k = temel + (i < fazla ? 1 : 0) - 1;
    let secim = [];
    if (k > 0 && k <= E.length) {
      secim = E.map((e, j) => ({ j, puan: (e.oncelik ?? 9) + ((e.oncelik ?? 9) > 1 && kullanilan.has(e.gorev) ? 2.5 : 0) }))
        .sort((a, b) => a.puan - b.puan || a.j - b.j).slice(0, k).map(x => x.j).sort((a, b) => a - b);
    } else if (k > E.length) secim = Array.from({ length: k }, (_, j) => j % E.length);   // 28'den büyük sınıf
    secim.forEach(ix => {
      let e = E[ix];
      for (let d = 1; e.gorev === onceki && d < E.length; d++) e = E[(ix + d) % E.length];
      duraklar.push({ bolum: i, tip: 'engel', veri: e });
      kullanilan.add(e.gorev); onceki = e.gorev;
    });
    duraklar.push({ bolum: i, tip: 'final', veri: bol.final });
    onceki = bol.final.etkinlik;
  });
  return duraklar;
}

/* Az önce tamamlanan durak: tahtaya dönülünce sofraya "düşer". */
let yeniKonan = -1;

function sofraOgesi(durak) {
  const s = durak?.veri?.sofra;
  return s && s.sekil ? s : { sekil: 'leylek-tabak', ad: 'Tabak', kime: 'ikisi' };
}

/* Yukarıdan görülen sofra. Dört bölüm dört parça; her parçada o bölümün
   durakları iki sıra hâlinde. */
function sofraCiz(api, liste, sira, { yeni = -1, bolum = null } = {}) {
  const { el, ikon, masal } = api;
  const adlar = { ev: masal.konukluk?.ev?.ad || 'Alev', misafir: masal.konukluk?.misafir?.ad || 'Lale' };
  const masa = el('div', 'ks-masa');
  /* Yerlerin boyu CSS'te sofranın genişliğinden hesaplanır (1280 piksellik
     bir tahtada da dört bölüm sığsın): kaç sütun, kaç bölüm var? */
  let sutun = 0, parcaSayisi = 0;
  masal.bolumler.forEach((b, i) => {
    if (bolum != null && i !== bolum) return;
    const adet = liste.filter(d => d.bolum === i).length;
    if (!adet) return;
    sutun += Math.ceil(adet / 2); parcaSayisi++;
  });
  masa.style.setProperty('--sutun', String(Math.max(1, sutun)));
  masa.style.setProperty('--parca', String(Math.max(1, parcaSayisi)));
  masal.bolumler.forEach((b, i) => {
    if (bolum != null && i !== bolum) return;
    const parca = el('div', 'ks-bolum');
    parca.style.setProperty('--bolum', b.renk);
    parca.title = b.ad;
    liste.forEach((d, k) => {
      if (d.bolum !== i) return;
      const o = sofraOgesi(d), dolu = k < sira;
      const yer = el('span', 'ks-yer' + (dolu ? ` dolu kime-${KIME[o.kime]?.sinif || 'ikisi'}` : '') +
        (k === sira && bolum == null ? ' simdi' : '') + (k === yeni ? ' yeni' : '') + (d.tip === 'final' ? ' final' : ''));
      if (dolu || k === sira) yer.innerHTML = ikon(o.sekil);
      yer.title = dolu ? `${o.ad} · ${(KIME[o.kime] || KIME.ikisi).etiket(adlar)}` : k === sira ? `Sıradaki: ${o.ad}` : `${k + 1}. durak`;
      yer.setAttribute('aria-label', yer.title);
      parca.append(yer);
    });
    masa.append(parca);
  });
  return masa;
}

function sayim(liste, sira) {
  const s = { tilki: 0, leylek: 0, ikisi: 0 };
  liste.slice(0, sira).forEach(d => { const k = sofraOgesi(d).kime; s[k in s ? k : 'ikisi']++; });
  return s;
}

export default {
  kod: 'konukluk',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Sofraya bir şey daha geldi.', devam: 'Sofraya dön', final: 'Misafiri ağırla' },
  geriEtiket: 'Sofraya dön',
  tahtaKur: hikayeSirasi,

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, ses } = api;
    const liste = duraklar(), durak = liste[durum.sira], b = durak.bolum, bol = masal.bolumler[b];
    const n = liste.length, sira = durum.sira;
    const ev = masal.konukluk?.ev || { kod: 'tilki-alev', ad: 'Alev' };
    const misafir = masal.konukluk?.misafir || { kod: 'leylek-lale', ad: 'Lale' };
    const adlar = { ev: ev.ad, misafir: misafir.ad };
    const yeni = yeniKonan; yeniKonan = -1;
    ses.setRegion(['ciftlik', 'ciftlik', 'orman', 'ciftlik'][b] || 'ciftlik');

    const sayfa = el('main', 'sayfa harita konukluk-sayfasi');
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());
    const icerik = el('div', 'harita-icerik'), yan = el('aside', 'yolculuk-paneli konukluk-paneli');
    yan.append(el('span', 'eyebrow', `${b + 1}. SOFRA · ${bol.ad.toLocaleUpperCase('tr')}`),
               el('h1', '', bol.baslik), el('p', 'bolum-hikaye', bol.hikaye));
    const dostKart = el('div', 'dost-karti'), resim = el('div', 'dost-resmi');
    resim.innerHTML = ikon(bol.karakter.kod);
    const konus = el('div'); konus.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    dostKart.append(resim, konus); yan.append(dostKart);

    /* Sıradaki iş: çocuğun sofraya ne getireceği önceden görünür. */
    const o = sofraOgesi(durak), kime = KIME[o.kime] || KIME.ikisi;
    const gorev = el('div', 'siradaki-gorev');
    const ad = durum.adlar[sira % durum.adlar.length];
    gorev.append(el('span', 'eyebrow', 'SOFRAYA SEN KOYACAKSIN'), el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final'
        ? `${bol.karakter.ad} ile ilgilen; bu sofra tamamlansın.`
        : durak.veri.yonerge));
    const getir = el('div', `ks-getir kime-${kime.sinif}`);
    const gi = el('span', 'ks-getir-ikon'); gi.innerHTML = ikon(o.sekil);
    const gy = el('div'); gy.append(el('strong', '', o.ad), el('small', '', kime.etiket(adlar)));
    getir.append(gi, gy); gorev.append(getir);
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    gorev.append(cocuk); yan.append(gorev); icerik.append(yan);

    const gorunum = el('section', 'ada-gorunumu'); gorunum.setAttribute('aria-label', masal.ad + ' köyü');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik');
    baslik.append(el('span', 'eyebrow', 'KONUKLUK'), el('h2', '', masal.ad));
    gorunum.append(baslik);
    gorunum.append(api.kameraKontrolleri({ sol: 'Köyü sola döndür', sag: 'Köyü sağa döndür' }));
    /* Durak sonrası: az önce konan şey dünyanın üstünde duyurulur. */
    if (yeni >= 0 && liste[yeni]) {
      const y = sofraOgesi(liste[yeni]), yk = KIME[y.kime] || KIME.ikisi;
      const haber = el('div', `konukluk-haber kime-${yk.sinif}`);
      haber.setAttribute('role', 'status');
      const hi = el('span', 'ks-haber-ikon'); hi.innerHTML = ikon(y.sekil);
      const hy = el('div'); hy.append(el('strong', '', `${y.ad} sofraya kondu`), el('small', '', yk.etiket(adlar)));
      haber.append(hi, hy); gorunum.append(haber);
    }
    icerik.append(gorunum); sayfa.append(icerik);

    /* Alt bar: sofranın kendisi. */
    const alt = el('footer', 'yolculuk-alt konukluk-alt');
    const sayac = el('div', 'konukluk-sayac');
    sayac.dataset.kurguDurak = String(sira);
    sayac.dataset.kurguToplam = String(n);
    sayac.append(el('span', 'eyebrow', 'SOFRADA'));
    const buyuk = el('strong', '');
    buyuk.append(el('b', 'ks-hazir', String(sira)), el('small', '', ` / ${n} şey hazır`));
    sayac.append(buyuk);
    const s = sayim(liste, sira);
    const sayimKutu = el('div', 'ks-sayim');
    [['tilki', ev.kod, s.tilki, `${ev.ad}’e`], ['leylek', misafir.kod, s.leylek, `${misafir.ad}’ye`], ['ikisi', null, s.ikisi, 'Herkese']]
      .forEach(([k, kod, sayi, etiket]) => {
        const c = el('span', `ks-cip kime-${k}`);
        if (kod) { const f = el('i', 'ks-cip-yuz'); f.innerHTML = ikon(kod); c.append(f); }
        else c.append(el('i', 'ks-cip-nokta'));
        c.append(el('span', '', `${etiket} ${sayi}`)); c.title = `${etiket} uygun: ${sayi}`;
        sayimKutu.append(c);
      });
    sayac.append(sayimKutu);
    alt.append(sayac);

    const sofra = el('div', 'konukluk-sofra');
    sofra.setAttribute('aria-label', `Sofra: ${sira} / ${n} şey hazır`);
    const roller = ROLLER[b] || ROLLER[3];
    const uc = (kisi, rol, yon) => {
      const u = el('div', `ks-uc ${yon}`);
      const f = el('span', 'ks-uc-yuz'); f.innerHTML = ikon(kisi.kod);
      u.append(el('small', '', rol), f, el('b', '', kisi.ad));
      return u;
    };
    sofra.append(uc(ev, roller[0], 'sol'), sofraCiz(api, liste, sira, { yeni }), uc(misafir, roller[1], 'sag'));
    alt.append(sofra);

    const eylemler = el('div', 'harita-eylemler');
    if (sira > 0) eylemler.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Sofraya bir şey getir', gorevEkrani));
    alt.append(eylemler); sayfa.append(alt); kok.append(sayfa);
    dunyayaKur(kap, sira, gorevEkrani);
  },

  /* Engel bitince tahtaya dönülür ve konan şey sofraya düşer. Bölüm
     finali bitince "Misafir doydu mu?" karnesi gelir. */
  sonra(durak, api) {
    const { durum, masal, kok, el, dugme, ustBar, duraklar, ikon } = api;
    const liste = duraklar();
    yeniKonan = durum.sira - 1;
    if (durak.tip !== 'final') return;
    api.temizle();
    const i = durak.bolum, bol = masal.bolumler[i], karne = bol.karne || {};
    const son = i === masal.bolumler.length - 1;
    const sayfa = el('main', 'sayfa hikaye odul konukluk-karne'); sayfa.append(ustBar());
    sayfa.style.setProperty('--accent', bol.renk);
    const kutu = el('section', 'hikaye-karti');
    kutu.append(el('span', 'eyebrow', `${i + 1} / ${masal.bolumler.length} · ${bol.ad.toLocaleUpperCase('tr')} · SOFRA KALKTI`),
                el('h1', '', karne.baslik || 'Misafir doydu mu?'));
    const satirlar = el('div', 'karne-satirlari');
    (karne.notlar || []).forEach(n => {
      const k = el('div', `karne-kisi durum-${n.durum}`);
      const f = el('span', 'karne-yuz'); f.innerHTML = ikon(n.kod);
      const y = el('div', 'karne-yazi');
      y.append(el('strong', '', n.ad), el('em', 'karne-damga', DURUM[n.durum] || n.durum), el('small', '', n.metin));
      k.append(f, y); satirlar.append(k);
    });
    kutu.append(satirlar);
    /* Bu bölümde sofraya konanlar, kime uygun olduklarıyla. */
    const bu = el('div', 'konukluk-sofra karne-sofrasi');
    bu.append(sofraCiz(api, liste, durum.sira, { bolum: i }));
    kutu.append(bu, el('p', '', bol.final.cozum));
    if (karne.son) kutu.append(el('p', 'odul-gecis', karne.son));
    kutu.append(dugme(son ? 'Masalın sonunu gör' : 'Sofraya devam', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    yeniKonan = -1;
    return 'beklet';
  }
};

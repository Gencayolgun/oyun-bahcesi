/* KURGU · UZLAŞMA — iki yakadan ortaya.

   Yolculuktan, yarıştan ve kurtarmadan farkı yapısal:
     · Tahtayı KENDİSİ kurar. Engeller bir Ak'a bir Kara'ya ait; her
       engelin 'yaka' alanı kimin sırasında çıkacağını söyler. Bölüm
       sonları ikisinin ortak anıdır. (Ardışık iki durak yine asla aynı
       mekaniği kullanmaz.)
     · İlerleme tek bir çubuk değil: iki uçtan ortaya doğru büyüyen iki
       çubuk. Ak'ınki batıdan, Kara'nınki doğudan; masalın sonunda ortada
       buluşurlar.
     · Sıra beklemek yapının parçası: tahta her zaman kimin sırası
       olduğunu ve kimin sabırla beklediğini gösterir; alttaki sıra
       şeridi gelecek sıraları dizer. Sıra el değiştirdiğinde haritada
       bir "sıra geçti" bayrağı dalgalanır.
     · Durak sonrası: tahtaya dönülünce az önce yardım edilen yakanın
       çubuğu eski yerinden yenisine uzar, işareti bir adım köprüye
       yürür ve haritanın üstüne bir "köprü haberi" düşer: kim, kime
       yardım etti, ne oldu. Ardından sıra karşıya geçer.
     · Bölüm sonunda armağan değil, ikisinin köprüdeki yeri gösterilir:
       iki uçta → köprüde → burun buruna, biri çöker öbürü atlar → yan yana.

   Masal ayarı (masal.uzlasma):
     ak, kara  { kod, ad, yaka, karsi, renk }   iki yaka; karsi: geçtikten sonraki yakası
     kopru     ikon kodu (ortak anın ve buluşma noktasının simgesi)
     gecis     bu bölümden (0'dan sayılır) sonra ikisi de karşı yakada
   Her engelde 'yaka' ('ak' | 'kara'): kimin sırasında çıkacağı.

   İki Keçi bunu kullanır. */

/* Az önce çözülen engel: sonra() yazar, tahta bir kez oynatır. */
let sonYardim = null;

const ORTAK = 'ortak';

/* Tahta: sınıf mevcudu kadar durak. Dağılım motorunkiyle aynı (bölüm
   başına eşit, artan öndeki bölümlere), ama engel seçimi sıranın sahibine
   göre. Seçim belirlenimci: aynı sınıf her açılışta aynı tahtayı verir. */
export function tahtaKur(mevcut, masal) {
  const n = Math.max(4, mevcut), b = masal.bolumler.length;
  const duraklar = [], temel = Math.floor(n / b), fazla = n % b;
  const turSon = new Map(), engelSon = new Map();
  let onceki = null, k = 0;
  for (let i = 0; i < b; i++) {
    const adet = temel + (i < fazla ? 1 : 0), bol = masal.bolumler[i];
    for (let j = 0; j < adet - 1; j++) {
      const sira = k++ % 2 ? 'kara' : 'ak';
      let adaylar = bol.engeller.filter(e => (e.yaka || sira) === sira && e.gorev !== onceki);
      if (!adaylar.length) adaylar = bol.engeller.filter(e => e.gorev !== onceki);
      if (!adaylar.length) adaylar = bol.engeller.slice();          // başka çare yok
      adaylar = adaylar.slice().sort((x, y) => {
        const t = (turSon.get(x.gorev) ?? -1) - (turSon.get(y.gorev) ?? -1);
        if (t) return t;
        return (engelSon.get(x) ?? -1) - (engelSon.get(y) ?? -1);
      });
      const sec = adaylar[0];
      duraklar.push({ bolum: i, tip: 'engel', veri: sec, sira });
      turSon.set(sec.gorev, duraklar.length);
      engelSon.set(sec, duraklar.length);
      onceki = sec.gorev;
    }
    duraklar.push({ bolum: i, tip: 'final', veri: bol.final, sira: ORTAK });
    onceki = bol.final.etkinlik;
  }
  return duraklar;
}

/* Bir yakanın ilerlemesi: kendi sıraları + ortak anlar. İkisi de 1'e
   ulaştığında çubuklar ortada buluşur. */
function yakaSayimi(liste, gecen) {
  const s = { ak: { gecen: 0, toplam: 0 }, kara: { gecen: 0, toplam: 0 } };
  liste.forEach((d, i) => {
    for (const kim of ['ak', 'kara']) if (d.sira === kim || d.sira === ORTAK) {
      s[kim].toplam++; if (i < gecen) s[kim].gecen++;
    }
  });
  return s;
}

const BOLUM_DURUMU = [
  (U) => `${U.ak.ad} ${U.ak.yaka.toLocaleLowerCase('tr')}nda, ${U.kara.ad} ${U.kara.yaka.toLocaleLowerCase('tr')}nda. İkisi de köprüye yürüyor.`,
  (U) => `İkisi de köprünün ucunda. Bir adım ${U.ak.ad}, bir adım ${U.kara.ad}.`,
  () => 'Burun buruna! Köprü sallanıyor; sıra vermenin yolunu arıyoruz.',
  () => 'İkisi de karşıya geçti. Şimdi köprüyü birlikte, sırayla genişletiyoruz.'
];

/* Bölüm sonunda ikisinin köprüdeki yeri (yüzde, soldan). */
const KOPRUDE = [
  { ak: 7, kara: 93, not: 'İkisi de köprünün bir ucunda duruyor.' },
  { ak: 33, kara: 67, not: 'İkisi de köprüde; aralarında birkaç adım kaldı.' },
  { ak: 78, kara: 22, not: 'Şimdi ikisi de karşı yakada; köprü sallanmayı bıraktı.', atlayis: true },
  { ak: 44, kara: 56, not: 'Köprü genişledi: ikisi yan yana duruyor.', genis: true }
];

const kimAdi = (U, kim) => kim === ORTAK ? `${U.ak.ad} ile ${U.kara.ad}` : U[kim].ad;
/* Türkçe ekler: ünlü uyumu ve kaynaştırma harfi (Ak’ın / Kara’nın, Ak’a / Kara’ya). */
const UNLU = 'aeıioöuü';
const sonUnlu = ad => [...ad.toLocaleLowerCase('tr')].reverse().find(h => UNLU.includes(h)) || 'a';
const unluyleBiter = ad => UNLU.includes(ad.toLocaleLowerCase('tr').slice(-1));
const sahiplik = ad => `${ad}’${unluyleBiter(ad) ? 'n' : ''}${{ a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' }[sonUnlu(ad)]}n`;
const yonelme = ad => `${ad}’${unluyleBiter(ad) ? 'y' : ''}${'aıou'.includes(sonUnlu(ad)) ? 'a' : 'e'}`;
const siraBasligi = (U, kim) => kim === ORTAK ? 'İKİSİNİN ORTAK ANI' : `${sahiplik(U[kim].ad).toLocaleUpperCase('tr')} SIRASI`;

export default {
  kod: 'uzlasma',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Köprüde bir adım daha atıldı.', devam: 'Köprüye dön', final: 'Bölümü bitir' },
  geriEtiket: 'Köprüye dön',
  tahtaKur,

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, simge, ses } = api;
    const liste = duraklar(), n = liste.length, durak = liste[durum.sira], b = durak.bolum, bol = masal.bolumler[b];
    const U = masal.uzlasma;
    const yakaAdi = kimK => b >= (U.gecis ?? Infinity) && U[kimK].karsi ? U[kimK].karsi : U[kimK].yaka;
    const kim = durak.sira || ORTAK;
    /* Durak sonrası: bir engelden yeni dönüldüyse çubuklar eski yerinden başlar. */
    const yeni = sonYardim && sonYardim.i === durum.sira - 1 ? sonYardim : null;
    sonYardim = null;
    const eski = yeni ? yakaSayimi(liste, durum.sira - 1) : null;
    const bekleyen = kim === 'ak' ? 'kara' : kim === 'kara' ? 'ak' : null;
    const sayim = yakaSayimi(liste, durum.sira);
    ses.setRegion(['orman', 'ciftlik', 'deniz', 'dag'][b] || 'dag');

    const sayfa = el('main', `sayfa harita uzlasma-sayfasi sira-${kim}`);
    sayfa.style.setProperty('--accent', bol.renk);
    sayfa.style.setProperty('--uz-ak', U.ak.renk); sayfa.style.setProperty('--uz-kara', U.kara.renk);
    sayfa.append(ustBar());
    const icerik = el('div', 'harita-icerik'), yan = el('aside', 'yolculuk-paneli');
    yan.append(el('span', 'eyebrow', `${String(b + 1).padStart(2, '0')}. BÖLÜM · ${bol.ad.toLocaleUpperCase('tr')}`),
               el('h1', '', bol.baslik), el('p', 'bolum-alt', BOLUM_DURUMU[b]?.(U) || ''), el('p', 'bolum-hikaye', bol.hikaye));
    const dostKart = el('div', 'dost-karti'), resim = el('div', 'dost-resmi');
    resim.innerHTML = ikon(bol.karakter.kod);
    const konus = el('div'); konus.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    dostKart.append(resim, konus); yan.append(dostKart);

    /* Sıradaki iş: kimin sırası olduğu kartın rengini ve başlığını belirler. */
    const gorev = el('div', `siradaki-gorev uzlasma-kart sira-${kim}`);
    gorev.dataset.sira = kim;
    const ust = el('div', 'uzlasma-kart-ust');
    const yuz = el('span', 'uzlasma-kart-yuz');
    yuz.innerHTML = kim === ORTAK ? ikon(U.kopru) : ikon(U[kim].kod);
    ust.append(yuz, el('span', 'eyebrow', siraBasligi(U, kim)));
    gorev.append(ust, el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final'
        ? `${bol.karakter.ad} ile ilgilenelim; ${kimAdi(U, ORTAK)} bu anı birlikte yaşıyor.`
        : durak.veri.yonerge));
    const bekle = el('p', 'uzlasma-bekleyen');
    bekle.innerHTML = simge('leaf');
    bekle.append(el('span', '', bekleyen
      ? `${U[bekleyen].ad} karşı yakada sırasını bekliyor.`
      : 'Bu sıra ikisinin birden. Kimse beklemiyor.'));
    gorev.append(bekle);
    const ad = durum.adlar[durum.sira % durum.adlar.length];
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    gorev.append(cocuk); yan.append(gorev); icerik.append(yan);

    const gorunum = el('section', 'ada-gorunumu'); gorunum.setAttribute('aria-label', masal.ad + ' geçidi');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik');
    baslik.append(el('span', 'eyebrow', 'UZLAŞMA KÖPRÜSÜ'), el('h2', '', masal.ad));
    gorunum.append(baslik);
    /* Haritanın üstünde sıranın kimde olduğu; sıra el değiştirdiyse
       "sıra geçti" diye dalgalanır. */
    const bayrak = el('div', `uzlasma-bayrak sira-${kim}`);
    const byuz = el('span', 'uzlasma-bayrak-yuz'); byuz.innerHTML = kim === ORTAK ? ikon(U.kopru) : ikon(U[kim].kod);
    const onceki = durum.sira > 0 ? liste[durum.sira - 1].sira : null;
    const devir = onceki && onceki !== kim;
    bayrak.append(byuz, el('span', '', devir
      ? (kim === ORTAK ? 'Şimdi ikisinin ortak anı' : `Sıra ${yonelme(U[kim].ad)} geçti`)
      : (kim === ORTAK ? 'İkisinin ortak anı' : `${sahiplik(U[kim].ad)} sırası`)));
    if (devir) bayrak.classList.add('devir');
    gorunum.append(bayrak);
    /* Köprü haberi: az önce kim, kime yardım etti. Birkaç saniye sonra söner. */
    if (yeni && (yeni.kim === 'ak' || yeni.kim === 'kara')) {
      const haber = el('div', `uzlasma-haber sira-${yeni.kim}`);
      haber.setAttribute('role', 'status');
      const hy = el('span', 'uzlasma-haber-yuz'); hy.innerHTML = ikon(U[yeni.kim].kod);
      const hm = el('div');
      hm.append(el('strong', '', `${yeni.ad} ${yonelme(U[yeni.kim].ad)} yardım etti`), el('p', '', yeni.cozum || ''));
      haber.append(hy, hm);
      gorunum.append(haber);
      setTimeout(() => haber.classList.add('sonuyor'), 7000);
    }
    gorunum.append(api.kameraKontrolleri({ sol: 'Geçidi sola döndür', sag: 'Geçidi sağa döndür' }));
    icerik.append(gorunum); sayfa.append(icerik);

    /* Alt bar: iki uçtan ortaya büyüyen iki çubuk + sıra şeridi. */
    const alt = el('footer', 'yolculuk-alt uzlasma-alt');
    const kopru = el('div', 'uzlasma-kopru');
    kopru.dataset.kurguDurak = String(durum.sira);
    kopru.dataset.kurguToplam = String(n);
    kopru.setAttribute('role', 'img');
    const oranAk = sayim.ak.toplam ? sayim.ak.gecen / sayim.ak.toplam : 0;
    const oranKara = sayim.kara.toplam ? sayim.kara.gecen / sayim.kara.toplam : 0;
    kopru.setAttribute('aria-label', `${U.ak.ad} ${sayim.ak.gecen}/${sayim.ak.toplam}, ${U.kara.ad} ${sayim.kara.gecen}/${sayim.kara.toplam} · ${durum.sira} / ${n} durak geçildi`);
    const uc = kimK => {
      const u = el('div', `uzlasma-uc ${kimK}` + (kim === kimK || kim === ORTAK ? ' simdi' : ''));
      const r = el('span', 'uzlasma-uc-yuz'); r.innerHTML = ikon(U[kimK].kod);
      const y = el('div');
      y.append(el('strong', '', U[kimK].ad), el('small', '', `${yakaAdi(kimK)} · ${sayim[kimK].gecen}/${sayim[kimK].toplam}`));
      u.append(r, y); return u;
    };
    const serit = el('div', 'uzlasma-serit');
    const dAk = el('i', 'uzlasma-dolgu ak'), dKara = el('i', 'uzlasma-dolgu kara');
    const iAk = el('b', 'uzlasma-isaret ak'), iKara = el('b', 'uzlasma-isaret kara');
    iAk.innerHTML = ikon(U.ak.kod); iKara.innerHTML = ikon(U.kara.kod);
    const oran = (s, k) => s[k].toplam ? s[k].gecen / s[k].toplam : 0;
    const cubukYaz = (ak, kara) => {
      dAk.style.width = `${ak * 50}%`; iAk.style.left = `${ak * 50}%`;
      dKara.style.width = `${kara * 50}%`; iKara.style.left = `${100 - kara * 50}%`;
    };
    if (eski) {
      /* Eski yerden başla, bir kare sonra yenisine uzan (CSS geçişi oynatır). */
      cubukYaz(oran(eski, 'ak'), oran(eski, 'kara'));
      if (yeni.kim === 'ak' || yeni.kim === 'kara') serit.classList.add('uzuyor-' + yeni.kim);
      requestAnimationFrame(() => requestAnimationFrame(() => cubukYaz(oranAk, oranKara)));
    } else cubukYaz(oranAk, oranKara);
    const orta = el('span', 'uzlasma-bulusma' + (durum.sira >= n ? ' tamam' : '')); orta.innerHTML = ikon(U.kopru);
    orta.title = 'Buluşma noktası: köprünün ortası';
    serit.append(dAk, dKara, orta, iAk, iKara);
    const sayi = el('span', 'uzlasma-sayi', `${durum.sira} / ${n}`);
    kopru.append(uc('ak'), serit, uc('kara'), sayi);
    alt.append(kopru);

    /* Sıra şeridi: şimdiki ve sonraki sıralar. Bekleyen de görünüyor. */
    const seridi = el('div', 'uzlasma-sira-seridi');
    seridi.append(el('span', 'eyebrow', 'SIRA ŞERİDİ'));
    const cipler = el('ol', 'uzlasma-cipler');
    liste.slice(durum.sira, durum.sira + 6).forEach((d, j) => {
      const c = el('li', `sira-cip sira-${d.sira}` + (j === 0 ? ' simdi' : ''));
      const cy = el('span', 'sira-cip-yuz'); cy.innerHTML = d.sira === ORTAK ? ikon(U.kopru) : ikon(U[d.sira].kod);
      c.append(cy, el('span', 'sira-cip-ad', j === 0 ? 'Şimdi' : d.sira === ORTAK ? 'İkisi' : U[d.sira].ad));
      cipler.append(c);
    });
    seridi.append(cipler); alt.append(seridi);

    const eylemler = el('div', 'harita-eylemler');
    if (durum.sira > 0) eylemler.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Sırayı al', gorevEkrani));
    alt.append(eylemler); sayfa.append(alt); kok.append(sayfa);
    dunyayaKur(kap, durum.sira, gorevEkrani);
  },

  /* Bölüm sonunda: armağan değil, ikisinin köprüdeki yeri. */
  sonra(durak, api) {
    if (durak.tip !== 'final') {
      /* Engel: motor tahtaya döner; tahta bu kaydı bir kez oynatır. */
      const { durum } = api, i = durum.sira - 1;
      sonYardim = { i, kim: durak.sira, cozum: durak.veri.cozum, ad: durum.adlar[i % durum.adlar.length] };
      return;
    }
    sonYardim = null;
    const { durum, masal, kok, el, dugme, ustBar, duraklar, ikon, ses } = api;
    api.temizle();
    const U = masal.uzlasma, b = durak.bolum, bol = masal.bolumler[b];
    const liste = duraklar(), sayim = yakaSayimi(liste, durum.sira);
    const yer = KOPRUDE[Math.min(KOPRUDE.length - 1, b)];
    const sayfa = el('main', 'sayfa hikaye odul uzlasma-odul');
    sayfa.style.setProperty('--accent', bol.renk);
    sayfa.style.setProperty('--uz-ak', U.ak.renk); sayfa.style.setProperty('--uz-kara', U.kara.renk);
    sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti');

    /* Köprü sahnesi: dere, kütük, iki keçi. */
    const sahne = el('div', 'uzlasma-sahne' + (yer.genis ? ' genis' : '') + (yer.atlayis ? ' atlayis' : ''));
    sahne.setAttribute('role', 'img');
    sahne.setAttribute('aria-label', yer.not);
    sahne.append(el('i', 'uz-yaka bati'), el('i', 'uz-yaka dogu'), el('i', 'uz-dere'), el('i', 'uz-kutuk'));
    if (b >= 2) sahne.append(el('i', 'uz-korkuluk'));
    const keci = (kimK, sol) => {
      const k = el('span', `uz-keci ${kimK}`); k.style.left = `${sol}%`; k.innerHTML = ikon(U[kimK].kod); return k;
    };
    sahne.append(keci('ak', yer.ak), keci('kara', yer.kara));
    if (yer.atlayis) sahne.append(el('i', 'uz-yay'));

    kutu.append(sahne, el('span', 'eyebrow', `${b + 1}. BÖLÜM TAMAMLANDI · ${bol.ad.toLocaleUpperCase('tr')}`),
      el('h1', '', bol.asamaSonu || `${bol.ad} bitti!`),
      el('p', '', bol.final.cozum),
      el('p', 'odul-gecis', `${yer.not} ${U.ak.ad} ${sayim.ak.gecen}/${sayim.ak.toplam} · ${U.kara.ad} ${sayim.kara.gecen}/${sayim.kara.toplam}`),
      dugme(b === masal.bolumler.length - 1 ? 'Masalın sonunu gör' : 'Köprüye devam', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    ses.celebrate?.();
    return 'beklet';
  }
};

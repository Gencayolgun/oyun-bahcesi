/* KURGU · DENEME — yukarı doğru ilerleme.

   Öbür kurguların hepsi YATAY bir çubuk, şerit ya da pist gösterir. Bu
   kurgunun ana ekseni DİKEY:
     · Tahtanın sağında boydan boya bir tırmanış direği var. En altta
       yerde Kızıl, en tepede salkım. Sınıf mevcudu kadar basamak.
     · Her durak bir DENEME ve bir BASAMAK: çözülen görev merdivene bir
       basamak ekler, Kızıl bir basamak yukarı çıkar. Sayı "kaç durak
       geçtik" değil, "salkıma kaç basamak kaldı" der.
     · Basamağın malzemesi bölümden bölüme değişir; masalın kendisi
       budur: tek başına zıplamak → alıştırma taşları → dostlarla sandık
       üstüne sandık → merdiven. (masal.deneme.basamaklar)
     · Göreve götüren düğme de bu yüzden "Bir daha dene".
     · Alt bar yok: düğme direğin dibinde, Kızıl'ın ayağının altında.
     · Bölüm sonunda armağan değil, tırmanışın o anki fotoğrafı ve
       "salkıma kaç basamak kaldı" gelir.
     · Tahtayı kendisi kurar: hikâyenin sırası korunur (bir deneme bir
       öncekinin üstüne kurulur), ardışık iki durak yine asla aynı
       mekaniği kullanmaz.

   Tilki ile Üzümler bunu kullanır. */

/* Tahta: sınıf mevcudu kadar durak, bölüm başına eşit (artan öndekilere).
   Engeller YAZILDIĞI SIRAYLA gelir: az durakta eşit aralıkla seçilir, çok
   durakta başa dönülür. Sonra ardışık aynı mekanik varsa yer değiştirilir.
   Seçim belirlenimci: aynı sınıf her açılışta aynı tahtayı verir. */
export function tahtaKur(mevcut, masal) {
  const n = Math.max(4, mevcut), B = masal.bolumler.length;
  const temel = Math.floor(n / B), fazla = n % B;
  const duraklar = [];
  let onceki = null;
  for (let i = 0; i < B; i++) {
    const bol = masal.bolumler[i], E = bol.engeller, k = temel + (i < fazla ? 1 : 0) - 1;
    const secim = [];
    if (E.length) for (let j = 0; j < k; j++)
      secim.push(k <= E.length ? E[Math.min(E.length - 1, Math.floor((j + .5) * E.length / k))] : E[j % E.length]);
    /* Ardışık aynı mekanik olmasın: sırayı koruyarak, her adımda bir
       öncekinden farklı olan ilk engeli al (başka çare yoksa sıradakini). */
    const sirali = [];
    for (let son = onceki; secim.length;) {
      let x = secim.findIndex(e => e.gorev !== son);
      if (x < 0) x = 0;
      sirali.push(secim.splice(x, 1)[0]); son = sirali[sirali.length - 1].gorev;
    }
    secim.push(...sirali);
    for (const e of secim) duraklar.push({ bolum: i, tip: 'engel', veri: e });
    if (secim.length) onceki = secim[secim.length - 1].gorev;
    duraklar.push({ bolum: i, tip: 'final', veri: bol.final });
    onceki = bol.final.etkinlik;
  }
  return duraklar;
}

/* Kızıl'ın direkte en son görüldüğü basamak: haritaya dönünce oradan
   yenisine tırmanır. (Geri adımda da aşağı iner.) */
let sonBasamak = null;

const bolumBasamagi = (D, b) => D.basamaklar[Math.min(D.basamaklar.length - 1, b)] || {};
/* Salkım masalın başında ham (yeşil); olgunlaştığı bölümden sonra mor. */
const hedefIkonu = (D, b, bitti) => (bitti || b >= (D.hedef.olgunBolum ?? 0)) ? D.hedef.kod : (D.hedef.ham || D.hedef.kod);

function kalanYazisi(kalan, hedef) {
  if (kalan <= 0) return `${hedef} elimizde!`;
  if (kalan === 1) return `${hedef}a tek basamak kaldı!`;
  return `${hedef}a ${kalan} basamak kaldı`;
}

/* Direk: her durak bir basamak. Aşağıdan yukarı; geçilenler dolu, sıradaki
   parlıyor, en son eklenen "yeni" diye büyüyerek beliriyor. */
function direkKur(api, liste, sira, D) {
  const { el, ikon } = api;
  const n = liste.length;
  const direk = el('div', 'deneme-direk');
  const basamaklar = el('ol', 'deneme-basamaklar');
  liste.forEach((d, i) => {
    const li = el('li', `deneme-basamak kat-${Math.min(3, d.bolum)}` + (d.tip === 'final' ? ' sahanlik' : '') +
      (i < sira ? ' gecildi' : i === sira ? ' simdi' : '') + (i === sira - 1 && sonBasamak !== sira ? ' yeni' : ''));
    li.append(el('i', 'deneme-basamak-govde'));
    basamaklar.append(li);
  });
  /* Merdiven rayları yalnız son bölümün boyunca: merdiven orada başlıyor. */
  const ilkMerdiven = liste.findIndex(d => d.bolum >= 3);
  if (ilkMerdiven >= 0) {
    const ray = el('span', 'deneme-ray');
    ray.style.bottom = `${ilkMerdiven / n * 100}%`;
    direk.append(ray);
  }
  direk.append(basamaklar);
  /* Bölüm katları: her bölümün başladığı yerde küçük bir etiket. */
  liste.forEach((d, i) => {
    if (i && liste[i - 1].bolum === d.bolum) return;
    const bs = bolumBasamagi(D, d.bolum);
    const kat = el('span', `deneme-kat kat-${Math.min(3, d.bolum)}` + (d.bolum === liste[Math.min(sira, n - 1)].bolum ? ' simdi' : ''));
    kat.style.bottom = `${i / n * 100}%`;
    const r = el('b', 'deneme-kat-ikon'); r.innerHTML = ikon(bs.ikon || 'yaprak');
    kat.append(r, el('small', '', bs.ad || ''));
    direk.append(kat);
  });
  /* Kızıl: basamağın üstünde. Bir önceki gösterimden buraya tırmanır. */
  const kahraman = el('b', 'deneme-kahraman' + (sira >= n ? ' vardi' : ''));
  kahraman.innerHTML = ikon(D.kahraman.kod);
  const yuzde = s => `${Math.min(n, s) / n * 100}%`;
  kahraman.style.setProperty('--dn-simdi', yuzde(sira));
  kahraman.style.setProperty('--dn-once', yuzde(sonBasamak ?? sira));
  if (sonBasamak != null && sonBasamak !== sira) kahraman.classList.add('tirmaniyor');
  kahraman.title = `${D.kahraman.ad}: ${sira}. basamakta`;
  direk.append(kahraman);
  return direk;
}

export default {
  kod: 'deneme',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Merdivene bir basamak eklendi.', devam: 'Asmaya dön', final: 'Bölümü bitir' },
  geriEtiket: 'Asmaya dön',
  tahtaKur,

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, simge, ses } = api;
    const liste = duraklar(), n = liste.length, sira = durum.sira, durak = liste[sira], b = durak.bolum, bol = masal.bolumler[b];
    const D = masal.deneme, bs = bolumBasamagi(D, b), kalan = n - sira;
    /* Tırmanış yalnız bir basamaklık adımda oynar (görevden dönüş ya da
       "Bir adım geri"). Masal baştan başlarsa ya da kayıttan açılırsa Kızıl
       tepeden aşağı kaymasın. */
    if (sonBasamak != null && Math.abs(sonBasamak - sira) > 1) sonBasamak = null;
    ses.setRegion(['ciftlik', 'orman', 'ciftlik', 'dag'][b] || 'ciftlik');

    const sayfa = el('main', `sayfa harita deneme-sayfasi kat-${Math.min(3, b)}`);
    sayfa.style.setProperty('--accent', bol.renk);
    sayfa.style.setProperty('--dn-renk', bs.renk || bol.renk);
    sayfa.append(ustBar());
    const icerik = el('div', 'harita-icerik deneme-icerik');

    /* ——— Sol: bölüm ve sıradaki deneme ——— */
    const yan = el('aside', 'yolculuk-paneli deneme-paneli');
    yan.append(el('span', 'eyebrow', `${String(b + 1).padStart(2, '0')}. BÖLÜM · ${bol.ad.toLocaleUpperCase('tr')}`),
               el('h1', '', bol.baslik), el('p', 'bolum-alt', bs.not || ''), el('p', 'bolum-hikaye', bol.hikaye));
    const dostKart = el('div', 'dost-karti'), resim = el('div', 'dost-resmi');
    resim.innerHTML = ikon(bol.karakter.kod);
    const konus = el('div'); konus.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    dostKart.append(resim, konus); yan.append(dostKart);
    const gorev = el('div', 'siradaki-gorev deneme-kart');
    const ust = el('div', 'deneme-kart-ust');
    const no = el('span', 'deneme-no', String(sira + 1));
    ust.append(no, el('span', 'eyebrow', durak.tip === 'final' ? 'BÖLÜMÜN SON DENEMESİ' : `${sira + 1}. DENEME · ${(bs.ad || 'basamak').toLocaleUpperCase('tr')}`));
    gorev.append(ust, el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final'
        ? `${bol.karakter.ad} ile ilgilenelim; bu bölümün son basamağı onunla.`
        : durak.veri.yonerge));
    const ad = durum.adlar[sira % durum.adlar.length];
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    gorev.append(cocuk); yan.append(gorev); icerik.append(yan);

    /* ——— Orta: açık dünya ——— */
    const gorunum = el('section', 'ada-gorunumu'); gorunum.setAttribute('aria-label', masal.ad + ' bağı');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik');
    baslik.append(el('span', 'eyebrow', 'SALKIMA TIRMANIŞ'), el('h2', '', masal.ad));
    gorunum.append(baslik);
    /* Kızıl haritanın üstünden konuşur: bu bölümde tırmanış neyle oluyor. */
    const balon = el('div', 'deneme-balon' + (sonBasamak != null && sonBasamak < sira ? ' yeni' : ''));
    const byuz = el('span', 'deneme-balon-yuz'); byuz.innerHTML = ikon(D.kahraman.kod);
    balon.append(byuz, el('span', '', sira === 0 ? bol.soz.replace(/[“”]/g, '')
      : sonBasamak != null && sonBasamak < sira ? `Bir basamak daha! ${kalanYazisi(kalan, D.hedef.ad)}.` : bs.not || ''));
    gorunum.append(balon);
    gorunum.append(api.kameraKontrolleri({ sol: 'Bağı sola döndür', sag: 'Bağı sağa döndür' }));
    icerik.append(gorunum);

    /* ——— Sağ: dikey tırmanış direği (tahtanın ana ekseni) ——— */
    const kule = el('aside', 'deneme-kule');
    kule.dataset.kurguDurak = String(sira);
    kule.dataset.kurguToplam = String(n);
    kule.setAttribute('aria-label', `Tırmanış: ${sira} / ${n} basamak · ${kalanYazisi(kalan, D.hedef.ad)}`);
    const tepe = el('div', 'deneme-hedef' + (kalan <= 0 ? ' ulasildi' : ''));
    const hres = el('span', 'deneme-hedef-ikon'); hres.innerHTML = ikon(hedefIkonu(D, b, kalan <= 0));
    const hyazi = el('div');
    hyazi.append(el('strong', 'deneme-kalan', String(Math.max(0, kalan))), el('small', '', kalan > 0 ? `basamak kaldı · ${D.hedef.ad.toLocaleLowerCase('tr')}a` : `${D.hedef.ad.toLocaleLowerCase('tr')} elimizde`));
    tepe.append(hres, hyazi);
    kule.append(tepe, direkKur(api, liste, sira, D));
    const zemin = el('div', 'deneme-zemin');
    zemin.append(el('span', 'deneme-sayi', `${sira} / ${n}`), el('small', '', 'deneme'));
    kule.append(zemin);
    const eylem = el('div', 'deneme-eylem');
    eylem.append(dugme('Bir daha dene', gorevEkrani, 'primary deneme-dugme', 'arrow'));
    if (sira > 0) eylem.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    kule.append(eylem);
    icerik.append(kule);

    sayfa.append(icerik); kok.append(sayfa);
    sonBasamak = sira;
    dunyayaKur(kap, sira, gorevEkrani);
  },

  /* Bölüm sonu: armağan değil, tırmanışın fotoğrafı ve kalan basamak. */
  sonra(durak, api) {
    if (durak.tip !== 'final') return;
    const { durum, masal, kok, el, dugme, ustBar, duraklar, ikon, ses } = api;
    api.temizle();
    const liste = duraklar(), n = liste.length, sira = durum.sira, kalan = n - sira;
    const D = masal.deneme, b = durak.bolum, bol = masal.bolumler[b];
    const sayfa = el('main', `sayfa hikaye odul deneme-odul kat-${Math.min(3, b)}`);
    sayfa.style.setProperty('--accent', bol.renk);
    sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti');

    /* Küçük dikey sahne: yer, o ana kadar kurulan basamaklar, Kızıl ve salkım. */
    const sahne = el('div', 'deneme-foto');
    sahne.setAttribute('role', 'img');
    sahne.setAttribute('aria-label', `${D.kahraman.ad} ${sira} basamak tırmandı. ${kalanYazisi(kalan, D.hedef.ad)}.`);
    const hedef = el('span', 'deneme-foto-hedef' + (kalan <= 0 ? ' ulasildi' : '')); hedef.innerHTML = ikon(hedefIkonu(D, b, kalan <= 0));
    const yigin = el('div', 'deneme-foto-yigin');
    for (let k = 0; k <= b; k++) {
      const bs = bolumBasamagi(D, k);
      const kat = el('div', `deneme-foto-kat kat-${Math.min(3, k)}`);
      kat.title = bs.ad || '';
      const r = el('span'); r.innerHTML = ikon(bs.ikon || 'yaprak');
      kat.append(r, el('small', '', bs.ad || ''));
      yigin.append(kat);
    }
    const kahraman = el('span', 'deneme-foto-kahraman'); kahraman.innerHTML = ikon(D.kahraman.kod);
    yigin.append(kahraman);
    sahne.append(hedef, yigin, el('i', 'deneme-foto-zemin'));

    const sonraki = masal.bolumler[b + 1];
    kutu.append(sahne, el('span', 'eyebrow', `${b + 1}. BÖLÜM TAMAMLANDI · ${bol.ad.toLocaleUpperCase('tr')}`),
      el('h1', '', bol.asamaSonu || `${bol.ad} bitti!`),
      el('p', '', bol.final.cozum),
      el('p', 'odul-gecis deneme-kalan-yazi', kalan > 0
        ? `${kalanYazisi(kalan, D.hedef.ad)}. Sırada ${sonraki ? sonraki.ad.toLocaleLowerCase('tr') : 'son basamaklar'}: ${bolumBasamagi(D, b + 1).not || ''}`
        : `${kalanYazisi(kalan, D.hedef.ad)} Hiç basamak kalmadı.`),
      dugme(b === masal.bolumler.length - 1 ? 'Masalın sonunu gör' : 'Tırmanmaya devam', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    ses.celebrate?.();
    return 'beklet';
  }
};

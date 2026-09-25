/* KURGU · GÜVEN — köyün fenerleri (Yalancı Çoban).

   Yolculuktan, yarıştan ve kurtarmadan farkı yapısal:
     · Tahta bir harita paneli değil, köyün GECE GÖRÜNÜŞÜ. Her evin
       penceresinde bir fener var; yanan fener sayısı köyün Oğuz'a güveni.
     · İlerleme göstergesi TEKDÜZE ARTMAYAN tek kurgu bu:
         1. bölüm (yayla işleri)   fenerler yanar       3 → 10
         2. bölüm (şakalar)        fenerler SÖNER       10 → 3
            Çocuklar görevi başarsa bile hikâye gereği söner: görevi
            siz başardınız, feneri söndüren Oğuz'un şakası.
         3. bölüm (kurt geldi)     güven dipte kalır, SÜRÜ SAYACI çalışır:
                                   dağılan kuzular ağıla toplanır 0 → 12
         4. bölüm (özür)           fenerler yeniden ve DAHA PARLAK yanar 3 → 12
     · Durak sonrası: değişen pencere tahtaya dönüldüğünde gözün önünde
       yanar ya da söner, altında nedeni yazar.
     · Bölüm sonunda armağan değil, köyün güven durumu gösterilir.
     · Tahtayı KENDİSİ kurar (hikâye sırası): engeller paketteki sırayla
       oynanır; sınıf küçükse önce hikâyenin omurgası (paketteki 'onem')
       seçilir. Böylece 12 kişilik bir sınıfta da Oğuz iki kez şaka yapar,
       kurt gelir, ürküp kaçar ve Oğuz özür diler.

   Aynı hesap mekânda da kullanılır (guvenDolu): 3B köyün pencereleri
   ve ağıldaki kuzular tahtadaki sayıyla aynı. */

const FENER = 12, KUZU = 12;

/* Pencerelerin yanma sırası: fenerler tek evde yığılmasın, köyün her
   yanına dağılsın. Ev i'nin pencereleri 2i ve 2i+1. */
const YANMA_SIRASI = [2, 7, 4, 11, 0, 9, 5, 1, 10, 6, 3, 8];

export function guvenHali(b, oran) {
  const o = Math.max(0, Math.min(1, oran));
  if (b <= 0) return { b: 0, fener: 3 + Math.round(7 * o), kuzu: null, evre: 'yanar' };
  if (b === 1) return { b, fener: 10 - Math.round(7 * o), kuzu: null, evre: 'soner' };
  if (b === 2) return { b, fener: 3, kuzu: Math.round(KUZU * o), evre: 'suru' };
  return { b: 3, fener: 3 + Math.round(9 * o), kuzu: KUZU, evre: 'parlar' };
}
/* Tahtadaki durum: sıradaki durağın bölümü ve o bölümde geçilen durak oranı. */
export function guvenSira(liste, sira) {
  if (sira >= liste.length) return { ...guvenHali(3, 1), k: 1, m: 1 };
  const b = liste[sira].bolum, ilk = liste.findIndex(d => d.bolum === b);
  const m = liste.filter(d => d.bolum === b).length, k = sira - ilk;
  return { ...guvenHali(b, k / m), k, m };
}
/* Mekân yalnız dolu (0..1) bilir. Tahta dünyayı kurmadan hemen önce
   kesin hâli buraya bırakır; mekân aynı doluyu sorarsa onu alır. Böylece
   bölümler eşit bölünmese de (ör. 10 kişilik sınıf: 3-3-2-2) 3B köyün
   pencereleri tahtadaki fenerlerle birebir aynı. Başka yerden kurulan
   dünyalar (kurulum, final) yaklaşık hesabı kullanır. */
let tahtaHali = null;
export function guvenDolu(dolu) {
  if (tahtaHali && Math.abs(tahtaHali.dolu - dolu) < 1e-9) return tahtaHali.h;
  const x = Math.max(0, Math.min(3.999, dolu * 4)), b = Math.floor(x);
  return guvenHali(b, dolu >= 1 ? 1 : x - b);
}

/* Hikâye sırası. Motorun tahtaKur'u en uzun süredir kullanılmayan
   mekaniği öne alır; küçük bir sınıfta bu, fablın kendisini atlayabilir
   (12 kişide ikinci bölüm elma ve kelebekle biter, hiç şaka yapılmaz).
   Burada her bölümün engelleri PAKETTEKİ SIRAYLA oynanır. Yer azsa önce
   'onem' taşıyanlar (küçük sayı önce), sonra oyunda henüz görülmemiş
   mekanikler, sonra paketteki sıra. Bir bölümün engelleri hep farklı
   mekanik; bölümler arasında bakım etkinliği var: ardışık iki durak asla
   aynı mekaniği kullanmaz (yine de denetlenir). Sınıf 28'den büyükse
   omurga dışındaki engeller sona eklenir. Seçim belirlenimci. */
export function tahtaKur(mevcut, masal) {
  const n = Math.max(4, mevcut), B = masal.bolumler.length;
  const temel = Math.floor(n / B), fazla = n % B, duraklar = [], gorulen = new Set();
  let onceki = null;
  for (let i = 0; i < B; i++) {
    const bol = masal.bolumler[i], E = bol.engeller, k = temel + (i < fazla ? 1 : 0) - 1;
    let secim;
    if (k >= E.length) {
      secim = E.map((_, j) => j);
      const ek = secim.filter(j => !E[j].onem);
      for (let j = 0; secim.length < k; j++) secim.push((ek.length ? ek : secim)[j % (ek.length || E.length)]);
    } else {
      secim = E.map((_, j) => j).sort((a, b) =>
        ((E[a].onem || 99) - (E[b].onem || 99)) ||
        ((gorulen.has(E[a].gorev) ? 1 : 0) - (gorulen.has(E[b].gorev) ? 1 : 0)) || (a - b)
      ).slice(0, Math.max(0, k)).sort((a, b) => a - b);
    }
    for (let s = 0; s < secim.length; s++) {
      if (E[secim[s]].gorev === onceki) {                      // yalnız 28'i aşan sınıfta olabilir
        const t = secim.findIndex((j, u) => u > s && E[j].gorev !== onceki);
        if (t > 0) [secim[s], secim[t]] = [secim[t], secim[s]];
      }
      const e = E[secim[s]];
      duraklar.push({ bolum: i, tip: 'engel', veri: e });
      gorulen.add(e.gorev); onceki = e.gorev;
    }
    duraklar.push({ bolum: i, tip: 'final', veri: bol.final });
    onceki = bol.final.etkinlik;
  }
  return duraklar;
}
export const yanikMi = (pencere, fener) => YANMA_SIRASI.indexOf(pencere) < fener;

/* ——— Köyün gece görünüşü (SVG) ———
   Altı ev, on iki pencere, tepede ağıl. yeni: bu dönüşte değişen pencere. */
let svgNo = 0;
export function koyGecesi(h, { yeni = [], yon = 0, buyuk = false } = {}) {
  const id = 'guven-gece-' + (++svgNo);
  const parlak = h.evre === 'parlar';
  const yildiz = [[22, 20], [58, 34], [96, 14], [150, 28], [196, 12], [236, 36], [284, 18], [304, 44], [128, 46], [40, 54]]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.1 : 1.7}" fill="#fdf6d8" opacity="${.5 + (i % 4) * .12}"/>`).join('');
  // Evler: [x, y (taban), en, boy, çatı rengi]
  const evler = [[18, 160, 44, 30, '#9c5b45'], [70, 168, 50, 34, '#a8674c'], [128, 158, 42, 28, '#8f5040'],
                 [178, 170, 48, 32, '#a45f47'], [232, 160, 40, 28, '#935443'], [276, 168, 36, 30, '#a8674c']];
  let ev = '';
  evler.forEach(([x, y, w, hh, cati], i) => {
    const ust = y - hh;
    ev += `<rect x="${x}" y="${ust}" width="${w}" height="${hh}" fill="#3a4660" stroke="#26304a" stroke-width="1"/>
      <path d="M${x - 4} ${ust + 1}L${x + w / 2} ${ust - 16}L${x + w + 4} ${ust + 1}z" fill="${cati}" opacity=".78"/>`;
    for (let p = 0; p < 2; p++) {
      const no = i * 2 + p, yanik = yanikMi(no, h.fener);
      const px = x + (p ? w * .62 : w * .14), py = ust + hh * .28, pw = w * .24, ph = hh * .36;
      const sinif = `guven-pencere${yanik ? ' yanik' : ''}${yeni.includes(no) ? (yon > 0 ? ' yeni-yandi' : ' yeni-sondu') : ''}`;
      ev += `<g class="${sinif}" data-pencere="${no}">` +
        (yanik ? `<circle cx="${px + pw / 2}" cy="${py + ph / 2}" r="${parlak ? 17 : 11}" fill="url(#${id}-isik)"/>` : '') +
        `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="1.5" fill="${yanik ? (parlak ? '#fff0a8' : '#ffd36b') : '#1d263b'}" stroke="#56627d" stroke-width="1"/>` +
        `<path d="M${px + pw / 2} ${py}v${ph}" stroke="${yanik ? '#d69a3a' : '#3b4660'}" stroke-width="1"/></g>`;
    }
  });
  // Ağıl ve kuzular: üçüncü bölümden sonra görünür
  let agil = '';
  if (h.kuzu != null) {
    agil += `<path d="M236 92h60M236 104h60" stroke="#8a7456" stroke-width="2.4"/>
      ${[236, 248, 260, 284, 296].map(x => `<path d="M${x} 86v22" stroke="#8a7456" stroke-width="3"/>`).join('')}`;
    for (let i = 0; i < KUZU; i++) {
      const icerde = i < h.kuzu;
      const x = icerde ? 240 + (i % 6) * 9.4 : [18, 44, 88, 120, 160, 202, 30, 70, 110, 150, 196, 226][i];
      const y = icerde ? 96 + Math.floor(i / 6) * 7 : [84, 96, 80, 92, 86, 96, 104, 110, 100, 108, 104, 88][i];
      agil += `<g class="guven-kuzu${icerde ? ' icerde' : ''}"><ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.2" fill="#f4efe2"/><circle cx="${x + 3.6}" cy="${y - 1.2}" r="1.8" fill="#3a3532"/></g>`;
    }
    if (h.evre === 'suru' && h.kuzu < 7) agil += `<g class="guven-kurt"><path d="M12 120l6-9 3 6 8-1 9 4-4 5H14z" fill="#59616a"/><circle cx="16" cy="113" r="1.2" fill="#f2b33d"/></g>`;
  }
  return `<svg class="guven-gece${buyuk ? ' buyuk' : ''} evre-${h.evre}" viewBox="0 0 320 200" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Köyün gece görünüşü: ${h.fener} fener yanıyor">
    <defs>
      <linearGradient id="${id}-gok" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${parlak ? '#2a3a66' : '#18223c'}"/><stop offset="1" stop-color="${parlak ? '#5a6d9c' : '#3a4a70'}"/></linearGradient>
      <radialGradient id="${id}-isik"><stop offset="0" stop-color="#ffe08a" stop-opacity=".85"/><stop offset="1" stop-color="#ffc24a" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="320" height="200" fill="url(#${id}-gok)"/>
    ${yildiz}
    <circle cx="272" cy="30" r="13" fill="#fdf1c4"/><circle cx="278" cy="26" r="11" fill="url(#${id}-gok)"/>
    <path d="M0 118Q60 70 130 96T250 78T320 88V200H0z" fill="#2c3b55"/>
    <path d="M0 140Q80 112 160 128T320 118V200H0z" fill="#33445f"/>
    ${agil}
    <path d="M0 176h320v24H0z" fill="#26334a"/>
    ${ev}
  </svg>`;
}

const SAYI = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
/* biten: az önce çözülen durak (tahtaya o durağın ardından dönüldüyse). */
function durumYazisi(h, onceki, biten) {
  const fark = onceki ? h.fener - onceki.fener : 0;
  if (h.evre === 'yanar') return h.k === 0
    ? 'Oğuz yeni çoban. Köyde birkaç fener yanıyor; köylüler onu izliyor.'
    : fark > 0
      ? `Oğuz işini iyi yaptı: ${SAYI[fark].toLocaleLowerCase('tr')} pencerede daha fener yandı.`
      : 'Oğuz işini iyi yapıyor; köylüler pencereden izliyor.';
  if (h.evre === 'soner') {
    if (h.k === 0) return 'Köy ışıl ışıl: herkes Oğuz’a güveniyor. Ama Oğuz sıkılmaya başladı…';
    return fark < 0
      ? `Görevi siz başardınız! ${biten?.veri?.guvenNotu || 'Ama Oğuz’un şakası köylüleri üzdü.'} ${SAYI[-fark] || 'Bir'} fener söndü.`
      : 'Görevi başardınız. Köylüler Oğuz’a kuşkuyla bakıyor; fenerler titriyor.';
  }
  if (h.evre === 'suru') return h.k === 0
    ? 'Köyde yalnızca birkaç fener kaldı. Bu gece Oğuz’un sesine kimse gelmeyecek.'
    : `${h.kuzu} kuzu ağılda. Köyden hâlâ kimse gelmedi; Karabaş ile Oğuz tek başına.`;
  return h.k === 0
    ? 'Kuzular güvende. Şimdi sıra kırılan güveni onarmakta.'
    : 'Bir doğru söz, bir fener. Güven yavaş yavaş geri geliyor.';
}

/* Bir görev bitince tahtaya dönüşte hangi pencerenin değiştiği. */
let gecis = null;

export default {
  kod: 'guven',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Köy bunu gördü.', devam: 'Köye dön', final: 'Bölümü bitir' },
  geriEtiket: 'Köye dön',
  tahtaKur,

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, ses } = api;
    const liste = duraklar(), durak = liste[durum.sira], b = durak.bolum, bol = masal.bolumler[b];
    const h = guvenSira(liste, durum.sira);
    const onceki = gecis && gecis.sira === durum.sira ? gecis.onceki : null;
    gecis = null;
    ses.setRegion(['ciftlik', 'orman', 'dag', 'ciftlik'][b] || 'ciftlik');

    /* Değişen pencere: yanan fener sayısı arttıysa yeni yanan, azaldıysa sönen. */
    let yeni = [], yon = 0;
    const [alt0, ust0] = onceki ? [Math.min(onceki.fener, h.fener), Math.max(onceki.fener, h.fener)] : [0, 0];
    if (onceki && onceki.fener !== h.fener) {
      yon = h.fener > onceki.fener ? 1 : -1;
      for (let i = alt0; i < ust0; i++) yeni.push(YANMA_SIRASI[i]);
    }

    const sayfa = el('main', `sayfa harita guven-sayfasi evre-${h.evre}`);
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());
    const icerik = el('div', 'guven-icerik');

    /* Sol: dünya. Açık dünyada Karabaş olarak dolaşılır. */
    const gorunum = el('section', 'ada-gorunumu guven-dunya'); gorunum.setAttribute('aria-label', masal.ad + ' yaylası');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik');
    baslik.append(el('span', 'eyebrow', 'YAYLA'), el('h2', '', masal.guven?.koy || masal.ad));
    gorunum.append(baslik, api.kameraKontrolleri({ sol: 'Yaylayı sola döndür', sag: 'Yaylayı sağa döndür' }));

    /* Sağ: köyün gecesi ve sıradaki iş. */
    const yan = el('aside', 'guven-paneli');
    const gece = el('div', 'guven-gece-kabi'); gece.innerHTML = koyGecesi(h, { yeni, yon });
    const geceNotu = el('p', 'guven-gece-notu', h.evre === 'parlar' ? 'Fenerler eskisinden parlak yanıyor.'
      : h.evre === 'suru' ? 'Köy uyuyor. Yaylada kuzular dağıldı.' : 'Köyün pencereleri: her fener bir güven.');
    gece.append(geceNotu);
    const bas = el('div', 'guven-bolum');
    bas.append(el('span', 'eyebrow', `${String(b + 1).padStart(2, '0')}. BÖLÜM · ${bol.ad.toLocaleUpperCase('tr')}`),
               el('h1', '', bol.baslik), el('p', 'bolum-hikaye', bol.hikaye));
    const dost = el('div', 'guven-dost'), yuz = el('span', 'guven-dost-yuz');
    yuz.innerHTML = ikon(bol.karakter.kod);
    const konus = el('div'); konus.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    dost.append(yuz, konus);
    const is = el('div', 'guven-siradaki');
    const ad = durum.adlar[durum.sira % durum.adlar.length];
    is.append(el('span', 'eyebrow', durak.tip === 'final' ? 'BÖLÜMÜN SON İŞİ' : 'SIRADAKİ İŞ'), el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final' ? `${bol.karakter.ad} ile ilgilenelim; bu bölüm onunla kapanıyor.` : durak.veri.yonerge));
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    is.append(cocuk);
    yan.append(gece, bas, dost, is);
    icerik.append(gorunum, yan); sayfa.append(icerik);

    /* Alt bar: KÖYÜN GÜVENİ ölçeri. Tek kurgu ki bu sayı inebilir. */
    const alt = el('footer', 'guven-alt');
    const olcer = el('div', 'guven-olcer');
    olcer.dataset.kurguDurak = String(durum.sira);
    olcer.dataset.kurguToplam = String(liste.length);
    const ust = el('div', 'guven-olcer-ust');
    ust.append(el('span', 'eyebrow', 'KÖYÜN GÜVENİ'));
    const sayi = el('strong', 'guven-sayi');
    sayi.append(el('b', '', String(h.fener)), el('small', '', ` / ${FENER} fener`));
    if (yon) sayi.append(el('span', `guven-ok ${yon > 0 ? 'yukari' : 'asagi'}`, yon > 0 ? '▲' : '▼'));
    ust.append(sayi);
    const fenerler = el('div', 'guven-fenerler');
    for (let i = 0; i < FENER; i++) {
      const f = el('i', 'guven-fener' + (i < h.fener ? ' yanik' : '') + (h.evre === 'parlar' && i < h.fener ? ' parlak' : ''));
      if (yon && i >= alt0 && i < ust0) f.classList.add(yon > 0 ? 'yeni-yandi' : 'yeni-sondu');
      f.innerHTML = ikon(i < h.fener ? 'coban-fener' : 'coban-fener-sonuk');
      fenerler.append(f);
    }
    olcer.append(ust, fenerler);
    alt.append(olcer);

    if (h.kuzu != null) {
      const suru = el('div', 'guven-suru');
      suru.append(el('span', 'eyebrow', 'AĞILDAKİ KUZULAR'));
      const s = el('strong', 'guven-sayi'); s.append(el('b', '', String(h.kuzu)), el('small', '', ` / ${KUZU}`));
      const noktalar = el('div', 'guven-kuzular');
      for (let i = 0; i < KUZU; i++) noktalar.append(el('i', i < h.kuzu ? 'icerde' : ''));
      suru.append(s, noktalar); alt.append(suru);
    }

    const not = el('div', 'guven-durum' + (yon < 0 ? ' sondu' : yon > 0 ? ' yandi' : ''));
    not.append(el('span', '', durumYazisi(h, onceki, onceki ? liste[durum.sira - 1] : null)));
    alt.append(not);

    const eylemler = el('div', 'harita-eylemler');
    if (durum.sira > 0) eylemler.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Yaylaya koş', gorevEkrani));
    alt.append(eylemler); sayfa.append(alt); kok.append(sayfa);
    if (yon > 0) ses.correct();
    tahtaHali = { dolu: durum.sira / liste.length, h };      // 3B köy tahtayla aynı fener sayısını yaksın
    dunyayaKur(kap, durum.sira, gorevEkrani);
  },

  sonra(durak, api) {
    const liste = api.duraklar(), sira = api.durum.sira;
    if (durak.tip !== 'final') {
      gecis = { sira, onceki: guvenSira(liste, sira - 1) };
      return;
    }
    /* Bölüm sonu: armağan değil, köyün güven durumu. */
    const { masal, kok, el, dugme, ustBar } = api;
    api.temizle();
    const bol = masal.bolumler[durak.bolum], son = durak.bolum === masal.bolumler.length - 1;
    const h = guvenHali(durak.bolum, 1);                     // biten bölümün son hâli
    const sayfa = el('main', `sayfa hikaye odul guven-odul evre-${h.evre}`); sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti');
    const resim = el('div', 'guven-odul-koy'); resim.innerHTML = koyGecesi(h, { buyuk: true });
    const durumMetni = h.kuzu != null && durak.bolum === 2
      ? `Bütün kuzular ağılda. Ama köyde yalnızca ${h.fener} fener yanıyor.`
      : `Köyde ${h.fener} fener yanıyor.`;
    kutu.append(resim, el('span', 'eyebrow', `${durak.bolum + 1}. BÖLÜM BİTTİ · KÖYÜN GÜVENİ ${h.fener} / ${FENER}`),
      el('h1', '', bol.guvenSonu || `${bol.ad} bitti`),
      el('p', '', bol.final.cozum),
      el('p', 'odul-gecis', son ? `${durumMetni} Hepsi yandı; hem de eskisinden parlak.`
        : `${durumMetni} Sırada: ${masal.bolumler[durak.bolum + 1].ad}.`),
      dugme(son ? 'Masalın sonunu gör' : 'Masala devam et', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    return 'beklet';
  }
};

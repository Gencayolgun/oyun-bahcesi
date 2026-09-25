/* KURGU · KARŞILAŞTIRMA — iki dünya, bölünmüş tahta.

   Yolculuktan, yarıştan, kurtarmadan farkı yapısal:
     · Armağan torbası yok, ip sayacı yok, rakip yok. Tahta İKİYE BÖLÜNMÜŞ
       bir pano: sol yarı bir dünya (Tarla), sağ yarı öbürü (Şehir).
     · Her durak panoya bir KART ekler — hangi yarıya düşeceğini hikâye
       belirler ("Tarlada: sessizlik", "Şehirde: ışıklar"). Kart ya
       güzel (güneş) ya zor (bulut) işaretlidir.
     · Ortada iki kefeli bir terazi: kart hangi yarıya düştüyse o kefe
       ağır basar. Durak bitip panoya dönülünce yeni kart yerine uçar ve
       terazi eski konumundan yenisine sallanır. 28 durakta 14'e 14 biter:
       son kartla terazi dengeye gelir.
     · İlerleme bir yol: solda bir ev, sağda öbür ev, arada yolcu. 1. bölüm
       solda kalır, 2. bölüm sağa yürür, 3. bölüm sağda kalır, 4. bölüm
       geri döner. (bölümün 'konum' alanı: sol · saga · sag · sola)
     · Bölüm sonunda armağan ekranı yerine iki sütunlu bir karşılaştırma:
       o ana kadar iki yarıya düşen bütün kartlar yan yana.
     · Tahtayı KENDİSİ kurar (tahtaKur): engeller hikâye sırasıyla gelir;
       sınıf küçükse önce hikâyenin omurgası seçilir (engelin 'onem'
       alanı, 1 en önemli), sonra iki kefe dengeye yaklaştırılır.

   Masal ayarı (masal.karsilastirma):
     sol/sag: { ad, yer, ikon, ev }   iki dünya
     yolcu:   ikon kodu               ilerleme yolundaki yolcu
     terazi:  başlık                  terazinin adı
   Her durak (engel ve final) kart taşır: kart: { yan, metin, ikon, tip }. */

/* ——— Tahta ———
   Motorun paylaştırması (sınıf mevcudu kadar durak, bölüm başına eşit,
   artan öndeki bölümlere) ama seçim farklı:
     1. Her bölümde önem sırasına göre gereken sayıda engel seçilir.
        Motorun "en uzun süredir kullanılmayan tür" seçimi 16 kişilik bir
        sınıfta Lokum'un tarlaya gelişini ve sade sofraya burun kıvırışını
        atlıyordu — fablın kendisi o iki durak.
     2. Terazi: iki kefe arasında 2 ya da daha çok kart fark varsa, iki
        yarıya da kart düşüren bölümlerde (yolculuk, dönüş) en az önemli
        seçili kart karşı yarıya düşen en önemli seçilmemiş kartla
        değiştirilir. Böylece her sınıf büyüklüğünde masal dengeye yakın biter.
     3. Seçilenler bölüm içinde YAZILDIĞI SIRAYLA dizilir: hikâye akar.
     4. Ardışık iki durak aynı mekaniği kullanmaz. Bir bölümdeki engellerin
        türleri birbirinden, finallerin türü de engellerden farklı olduğu
        için bu kendiliğinden sağlanır; yine de (sınıf 28'den büyükse ve
        engeller ikinci kez dönerse) bir tekrar kalırsa bölüm içinde yer
        değiştirilerek giderilir. */
const turOf = d => d.tip === 'final' ? d.veri.etkinlik : d.veri.gorev;
const yanOf = e => e?.kart?.yan;

function tahtaKur(mevcut, masal) {
  const n = Math.max(4, mevcut), B = masal.bolumler.length;
  const temel = Math.floor(n / B), fazla = n % B;
  const secim = masal.bolumler.map((bol, b) => {
    const adet = Math.max(0, temel + (b < fazla ? 1 : 0) - 1);
    const sirali = bol.engeller.map((e, i) => ({ e, i }))
      .sort((x, y) => (x.e.onem ?? 99) - (y.e.onem ?? 99) || x.i - y.i);
    const secili = [];                                // engeller yetmezse başa dönülür (t: kaçıncı tur)
    for (let t = 0; sirali.length && secili.length < adet; t++)
      secili.push(...sirali.slice(0, adet - secili.length).map(x => ({ ...x, t })));
    return { bol, sirali, secili };
  });

  // Terazi dengesi: yalnız engeller ilk turdayken (tekrar yokken) takas yapılır
  const say = yan => secim.reduce((a, { bol, secili }) => a + secili.filter(x => yanOf(x.e) === yan).length + (yanOf(bol.final) === yan ? 1 : 0), 0);
  for (let deneme = 0; deneme < 12; deneme++) {
    const fark = say('sol') - say('sag');
    if (Math.abs(fark) < 2) break;
    const agir = fark > 0 ? 'sol' : 'sag', hafif = fark > 0 ? 'sag' : 'sol';
    let takas = null;
    for (const s of secim) {
      if (s.secili.some(x => x.t > 0)) continue;
      const cik = s.secili.filter(x => yanOf(x.e) === agir && (x.e.onem ?? 99) > 1).pop();          // en az önemlisi
      const gir = s.sirali.find(x => yanOf(x.e) === hafif && !s.secili.some(y => y.i === x.i));
      if (cik && gir && (!takas || (gir.e.onem ?? 99) < (takas.gir.e.onem ?? 99))) takas = { s, cik, gir };
    }
    if (!takas) break;
    takas.s.secili = takas.s.secili.map(x => x === takas.cik ? { ...takas.gir, t: 0 } : x);
  }

  const duraklar = [];
  secim.forEach(({ bol, secili }, b) => {
    secili.slice().sort((x, y) => x.t - y.t || x.i - y.i)
      .forEach(x => duraklar.push({ bolum: b, tip: 'engel', veri: x.e }));
    duraklar.push({ bolum: b, tip: 'final', veri: bol.final });
  });
  // Güvenlik: ardışık aynı tür kaldıysa aynı bölümde ileride bir engelle yer değiştir
  const cakisir = k => k > 0 && k < duraklar.length && turOf(duraklar[k]) === turOf(duraklar[k - 1]);
  const temizMi = (...ks) => ks.every(k => !cakisir(k) && !cakisir(k + 1));
  for (let i = 1; i < duraklar.length; i++) {
    if (!cakisir(i) || duraklar[i].tip === 'final') continue;
    for (let j = i + 1; j < duraklar.length && duraklar[j].bolum === duraklar[i].bolum && duraklar[j].tip === 'engel'; j++) {
      [duraklar[i], duraklar[j]] = [duraklar[j], duraklar[i]];
      if (temizMi(i, j)) break;
      [duraklar[i], duraklar[j]] = [duraklar[j], duraklar[i]];
    }
  }
  return duraklar;
}

/* Panoya en son hangi durakta bakıldı: bir durak bitip dönülünce yeni
   kart canlanarak gelir; geri adımda ya da kaldığı yerden açılışta gelmez. */
let sonBakilan = null;

const kartOf = d => d?.veri?.kart || null;
const aciHesapla = (sol, sag) => Math.max(-16, Math.min(16, (sag - sol) * 2.4));

function yolcuYeri(konum, p) {
  switch (konum) {
    case 'saga': return .12 + .76 * p;
    case 'sag': return .9 + .05 * p;
    case 'sola': return .94 - .88 * p;
    default: return .05 + .05 * p;
  }
}

function teraziYazisi(sol, sag, K) {
  if (!sol && !sag) return 'İki kefe de boş. İlk kart hangi yana düşecek?';
  if (sol === sag) return `Dengede! ${K.sol.ad} de ${K.sag.ad.toLocaleLowerCase('tr')} de aynı ağırlıkta.`;
  return sol > sag ? `${K.sol.ad} ağır basıyor · ${sol} kart` : `${K.sag.ad} ağır basıyor · ${sag} kart`;
}

export default {
  kod: 'karsilastirma',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Panoya bir kart eklendi.', devam: 'Panoya dön', final: 'Bölümü bitir' },
  geriEtiket: 'Panoya dön',
  tahtaKur,

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, ses } = api;
    const K = masal.karsilastirma;
    const liste = duraklar(), n = liste.length, sira = durum.sira;
    const durak = liste[sira], b = durak.bolum, bol = masal.bolumler[b];
    ses.setRegion(['ciftlik', 'orman', 'dag', 'ciftlik'][b] || 'ciftlik');

    const gecilen = liste.slice(0, sira).map((d, i) => ({ d, i, k: kartOf(d) })).filter(x => x.k);
    const yeniGeldi = sonBakilan === sira - 1 && sira > 0;
    sonBakilan = sira;
    const say = (dizi, yan) => dizi.filter(x => x.k.yan === yan).length;
    const solSay = say(gecilen, 'sol'), sagSay = say(gecilen, 'sag');
    const onceki = yeniGeldi ? gecilen.filter(x => x.i < sira - 1) : gecilen;
    const aciOnce = aciHesapla(say(onceki, 'sol'), say(onceki, 'sag'));
    const aciSimdi = aciHesapla(solSay, sagSay);

    const sayfa = el('main', 'sayfa harita karsilastirma-sayfasi');
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());

    /* ——— Pano: sol yarı · harita · sağ yarı ——— */
    const pano = el('div', 'kars-pano');
    pano.dataset.kurguDurak = String(sira);
    pano.dataset.kurguToplam = String(n);

    function sutun(yan) {
      const D = K[yan];
      const s = el('aside', `kars-sutun kars-${yan}`);
      s.setAttribute('aria-label', `${D.ad} yarısı`);
      const bas = el('header', 'kars-sutun-bas');
      const res = el('span', 'kars-sutun-ikon'); res.innerHTML = ikon(D.ikon);
      const yazi = el('div');
      const adet = say(gecilen, yan);
      yazi.append(el('span', 'eyebrow', yan === 'sol' ? 'SOL YARI' : 'SAĞ YARI'), el('h2', '', D.ad),
                  el('small', 'kars-sutun-sayi', adet ? `${adet} kart` : 'Henüz kart yok'));
      bas.append(res, yazi); s.append(bas);
      const kartlar = el('ol', 'kars-kartlar');
      const buYan = gecilen.filter(x => x.k.yan === yan).reverse();          // en yenisi üstte
      if (buYan.length > 8) kartlar.classList.add('sik');                    // 14 kart da sığsın
      buYan.forEach(({ k, i }) => {
        const li = el('li', `kars-kart ${k.tip === 'zor' ? 'zor' : 'guzel'}`);
        if (yeniGeldi && i === sira - 1) li.classList.add('yeni');
        const r = el('span', 'kars-kart-ikon'); r.innerHTML = ikon(k.ikon);
        const m = el('div', 'kars-kart-metin');
        m.append(el('small', '', D.yer + ':'), el('strong', '', k.metin));
        const isaret = el('span', 'kars-isaret'); isaret.innerHTML = ikon(k.tip === 'zor' ? 'bulut' : 'isik');
        isaret.title = k.tip === 'zor' ? 'Zor' : 'Güzel';
        isaret.setAttribute('aria-label', k.tip === 'zor' ? 'zor' : 'güzel');
        li.append(r, m, isaret); kartlar.append(li);
      });
      s.append(kartlar);
      if (!buYan.length) s.append(el('p', 'kars-bos', `İlk “${D.yer.toLocaleLowerCase('tr')}” kartı buraya düşecek.`));
      return s;
    }

    const gorunum = el('section', 'ada-gorunumu kars-harita');
    gorunum.setAttribute('aria-label', masal.ad + ' haritası');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik kars-baslik');
    baslik.append(el('span', 'eyebrow', `${String(b + 1).padStart(2, '0')}. BÖLÜM · ${bol.ad.toLocaleUpperCase('tr')}`),
                  el('h2', '', bol.baslik), el('p', 'kars-hikaye', bol.hikaye), el('p', 'kars-soz', bol.soz));
    gorunum.append(baslik, api.kameraKontrolleri({ sol: 'Sola döndür', sag: 'Sağa döndür' }));
    pano.append(sutun('sol'), gorunum, sutun('sag'));
    sayfa.append(pano);

    /* ——— Alt şerit: yol · terazi · sıradaki kart · eylemler ——— */
    const alt = el('footer', 'kars-alt');

    // 1) İlerleme: iki ev arasında bir yol
    const yol = el('div', 'kars-yol');
    const yolBas = el('div', 'kars-yol-bas');
    yolBas.append(el('span', 'eyebrow', 'YOLCULUK'), el('strong', '', `Durak ${String(sira + 1).padStart(2, '0')} / ${n}`));
    const serit = el('div', 'kars-yol-serit');
    const evSol = el('span', 'kars-ev'); evSol.innerHTML = ikon(K.sol.ikon); evSol.title = K.sol.ev;
    const evSag = el('span', 'kars-ev'); evSag.innerHTML = ikon(K.sag.ikon); evSag.title = K.sag.ev;
    const iz = el('div', 'kars-yol-iz');
    liste.forEach((d, i) => {
      const k = kartOf(d);
      iz.append(el('i', `${k?.yan === 'sag' ? 'sag' : 'sol'}${i < sira ? ' gecti' : ''}${i === sira ? ' simdi' : ''}`));
    });
    // Yolcunun yeri: bölümün konumu ve bölüm içindeki ilerleme
    const bolumDuraklari = liste.map((d, i) => ({ d, i })).filter(x => x.d.bolum === b);
    const icSira = bolumDuraklari.findIndex(x => x.i === sira);
    const p = bolumDuraklari.length > 1 ? icSira / (bolumDuraklari.length - 1) : .5;
    const yolcu = el('span', 'kars-yolcu'); yolcu.innerHTML = ikon(K.yolcu);
    yolcu.style.left = `${(yolcuYeri(bol.konum, p) * 100).toFixed(1)}%`;
    if (bol.konum === 'sola') yolcu.classList.add('geri');
    const yolIc = el('div', 'kars-yol-ic'); yolIc.append(iz, yolcu);
    serit.append(evSol, yolIc, evSag);
    const nerede = { sol: K.sol.yer, saga: `${K.sag.ad} yolunda`, sag: K.sag.yer, sola: `${K.sol.ad} yolunda` }[bol.konum] || K.sol.yer;
    const izNot = masal.dunya?.izNotu;
    yol.append(yolBas, serit, el('small', 'kars-yol-not', `Şimdi: ${nerede}` +
      (izNot ? ` · ${sira ? izNot.dolu.replace('{n}', sira) : izNot.bos}` : '')));
    alt.append(yol);

    // 2) Terazi
    const terazi = el('div', 'kars-terazi');
    terazi.style.setProperty('--aci', `${aciOnce}deg`);
    const tBas = el('span', 'eyebrow', (K.terazi || 'Ne güzel · ne zor').toLocaleUpperCase('tr'));
    const govde = el('div', 'kars-terazi-govde');
    govde.setAttribute('role', 'img');
    const kol = el('div', 'kars-terazi-kol');
    function kefe(yan) {
      const kf = el('div', `kars-kefe ${yan}`);
      const tas = el('div', 'kars-kefe-tas');
      gecilen.filter(x => x.k.yan === yan).forEach(({ k, i }) => {
        const t = el('i', k.tip === 'zor' ? 'zor' : 'guzel');
        if (yeniGeldi && i === sira - 1) t.classList.add('yeni');
        tas.append(t);
      });
      kf.append(tas, el('span', 'kars-kefe-ad', `${K[yan].ad} ${say(gecilen, yan)}`));
      return kf;
    }
    kol.append(kefe('sol'), kefe('sag'));
    govde.append(el('i', 'kars-terazi-direk'), el('i', 'kars-terazi-ayak'), kol);
    const tYazi = el('small', 'kars-terazi-yazi', teraziYazisi(solSay, sagSay, K));
    govde.setAttribute('aria-label', teraziYazisi(solSay, sagSay, K));
    terazi.append(tBas, govde, tYazi);
    if (solSay === sagSay && solSay) terazi.classList.add('dengede');
    alt.append(terazi);

    // 3) Sıradaki kart
    const gorev = el('div', 'kars-siradaki');
    const yuz = el('span', 'kars-dost'); yuz.innerHTML = ikon(bol.karakter.kod);
    yuz.title = `${bol.karakter.ad}, ${bol.karakter.tur.toLocaleLowerCase('tr')}`;
    const g = el('div', 'kars-siradaki-metin');
    const ad = durum.adlar[sira % durum.adlar.length];
    const kk = kartOf(durak);
    g.append(el('span', 'eyebrow', kk ? `BU KART ${K[kk.yan].ad.toLocaleUpperCase('tr')} YARISINA DÜŞECEK` : 'SIRADAKİ KART'),
             el('h2', '', durak.veri.engel),
             el('p', '', durak.tip === 'final'
               ? `${bol.karakter.ad} ile ilgilen; bölümün son kartı panoya düşsün.`
               : durak.veri.yonerge));
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    g.append(cocuk);
    gorev.append(yuz, g);
    alt.append(gorev);

    // 4) Eylemler
    const eylemler = el('div', 'harita-eylemler');
    if (sira > 0) eylemler.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Sıradaki kartı aç', gorevEkrani));
    alt.append(eylemler);
    sayfa.append(alt); kok.append(sayfa);

    dunyayaKur(kap, sira, gorevEkrani);

    /* Durak sonrası: yeni kart yerine uçar, terazi sallanır. */
    if (yeniGeldi) {
      const son = gecilen[gecilen.length - 1]?.k;
      if (son) {
        const bildiri = el('div', `kars-bildiri ${son.yan}`);
        bildiri.setAttribute('role', 'status');
        bildiri.append(el('span', 'eyebrow', 'YENİ KART'), el('strong', '', `${K[son.yan].yer}: ${son.metin}`));
        terazi.append(bildiri);
      }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setTimeout(() => { terazi.style.setProperty('--aci', `${aciSimdi}deg`); ses.correct?.(); }, 420);
      }));
    } else terazi.style.setProperty('--aci', `${aciSimdi}deg`);
  },

  /* Bölüm sonu: iki sütunun karşılaştırması. */
  sonra(durak, api) {
    if (durak.tip !== 'final') return;
    const { durum, masal, kok, el, dugme, ustBar, duraklar, ikon } = api;
    api.temizle();
    const K = masal.karsilastirma, liste = duraklar();
    const b = durak.bolum, bol = masal.bolumler[b], son = b === masal.bolumler.length - 1;
    const gecilen = liste.slice(0, durum.sira).map((d, i) => ({ d, i, k: kartOf(d) })).filter(x => x.k);
    const sayfa = el('main', 'sayfa hikaye odul kars-odul');
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti'), resim = el('div', 'hikaye-resim');
    resim.innerHTML = ikon(bol.armagan.kod);
    kutu.append(resim,
      el('span', 'eyebrow', `${b + 1}. BÖLÜM TAMAMLANDI · HATIRA: ${bol.armagan.ad.toLocaleUpperCase('tr')}`),
      el('h1', '', bol.bolumSonu || `${bol.ad} bitti!`),
      el('p', '', bol.final.cozum));

    const kiyas = el('div', 'kars-kiyas');
    const solSay = gecilen.filter(x => x.k.yan === 'sol').length, sagSay = gecilen.length - solSay;
    function yarim(yan) {
      const D = K[yan], kutu2 = el('div', `kars-kiyas-yan ${yan}`);
      const bas = el('div', 'kars-kiyas-bas');
      const r = el('span', 'kars-sutun-ikon'); r.innerHTML = ikon(D.ikon);
      const bunlar = gecilen.filter(x => x.k.yan === yan);
      const guzel = bunlar.filter(x => x.k.tip !== 'zor').length;
      bas.append(r, el('strong', '', D.yer), el('small', '', `${guzel} güzel · ${bunlar.length - guzel} zor`));
      const ul = el('ul', 'kars-kiyas-liste');
      bunlar.forEach(({ k, d }) => {
        const li = el('li', `${k.tip === 'zor' ? 'zor' : 'guzel'}${d.bolum === b ? ' bu-bolum' : ''}`);
        const i = el('span', 'kars-kart-ikon'); i.innerHTML = ikon(k.ikon);
        li.append(i, el('span', '', k.metin)); ul.append(li);
      });
      if (!bunlar.length) ul.append(el('li', 'bos', 'Henüz kart yok'));
      kutu2.append(bas, ul); return kutu2;
    }
    const orta = el('div', 'kars-kiyas-orta');
    orta.style.setProperty('--aci', `${aciHesapla(solSay, sagSay)}deg`);
    const mini = el('div', 'kars-mini-terazi'); mini.append(el('i', 'kol'), el('i', 'direk'));
    orta.append(mini, el('strong', '', `${solSay} · ${sagSay}`), el('small', '', teraziYazisi(solSay, sagSay, K)));
    kiyas.append(yarim('sol'), orta, yarim('sag'));
    kutu.append(kiyas,
      el('p', 'odul-gecis', son
        ? 'Dört bölüm tamamlandı. İki yarıya bakın: ikisinde de güzel şeyler, ikisinde de zor şeyler var.'
        : `Sırada ${masal.bolumler[b + 1].ad.toLocaleLowerCase('tr')} var: ${masal.bolumler[b + 1].baslik.toLocaleLowerCase('tr')}.`),
      dugme(son ? 'Masalın sonunu gör' : 'Masala devam et', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    return 'beklet';
  }
};

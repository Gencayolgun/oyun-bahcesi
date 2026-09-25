/* KURGU · YARIŞMA — iki güç, tek yolcu.

   Yolculuktan, yarıştan ve kurtarmadan farkı yapısal:
     · Tahtanın başında bir GÖKYÜZÜ PANOSU var: bir yanda Rüzgâr, bir
       yanda Güneş, ortada iki yöne sallanan bir ibre. İbre "kimin
       sırası, kimin gücü işliyor" sorusunu gösterir.
     · İlerleme bir sayaç ya da şerit değil, YOLCUNUN ÜSTÜNDEKİ GİYSİLER.
       Rüzgâr'ın turlarında ibre Rüzgâr'a gider ama giysiler ARTAR (yolcu
       üşüdükçe sarınır); Güneş'in turlarında giysiler birer birer ÇIKAR.
       Sınıf dersi panodan kendisi okur: sertlik sarındırır, sıcaklık açar.
     · Tahtanın rengi sıraya göre değişir: Rüzgâr'da serin mavi,
       Güneş'te sıcak altın. Başlık sıranın kimde olduğunu söyler.
     · Her deneme bitince tahtaya dönüldüğünde o denemenin ETKİSİ
       oynar: ibre eski yerinden yenisine sallanır, değişen giysi parlar,
       "Savrun esti; Pofuduk eldivenlerini giydi" gibi bir haber düşer.
     · Bölüm sonunda armağan ekranı değil, bir TUR SONUCU skorbordu gelir:
       dört turun her birinde kim denedi, yolcunun üstünde ne değişti.

   Kaybetme yok, puan yok: Rüzgâr "yenilmez", öğrenir. Pano bir skor değil,
   masalın kendisini gösterir.

   Masal paketi masal.yarisma ile ayarlar (bkz. masallar/gunes.js):
     ruzgar, gunes   { kod, ad, unvan, eylem, sirada }
     yolcu           { kod, ad }
     giysiler        { anahtar: { kod, ad, takti, cikardi } }
     baslangic       yolculuğun başında giyili olanlar
     ruzgarEkler     Rüzgâr'ın turlarında sırayla eklenenler
     gunesCikarir    Güneş'in turlarında sırayla çıkanlar
   Bölümlerin her biri sira: 'ruzgar' | 'gunes' ve turSonu taşır. */

/* Bir önceki tahtanın sırası: durak bitip tahtaya dönüldüğünde etkiyi
   (ibre salınımı, değişen giysi, haber) oynatmak için. */
const SON = { sira: null, kod: null };

const kimin = bol => (bol?.sira === 'gunes' ? 'gunes' : 'ruzgar');
const siradaMetni = kisi => kisi.sirada || `Sıra ${kisi.unvan}’da`;

/* Rüzgâr'ın durak sayısı: Güneş'in ilk durağına kadar olan her şey. */
function ruzgarPayi(liste, masal) {
  const i = liste.findIndex(d => kimin(masal.bolumler[d.bolum]) === 'gunes');
  return i < 0 ? liste.length : i;
}

/* Sıradaki (sira) duruma göre yolcunun üstünde ne var? */
function giyili(sira, liste, masal) {
  const Y = masal.yarisma, n = liste.length, W = ruzgarPayi(liste, masal), G = Math.max(1, n - W);
  if (sira <= W) {
    const ek = Math.round(Math.min(1, sira / Math.max(1, W)) * Y.ruzgarEkler.length);
    return [...Y.baslangic, ...Y.ruzgarEkler.slice(0, ek)];
  }
  const cik = Math.round(Math.min(1, (sira - W) / G) * Y.gunesCikarir.length);
  const cikan = new Set(Y.gunesCikarir.slice(0, cik));
  return [...Y.baslangic, ...Y.ruzgarEkler].filter(k => !cikan.has(k));
}

/* İbre: -1 tamamen Rüzgâr'da, +1 tamamen Güneş'te. Rüzgâr denedikçe
   ibre ona doğru yatar; Güneş'in sırası gelince yavaş yavaş öbür yana döner. */
function ibre(sira, liste, masal) {
  const n = liste.length, W = ruzgarPayi(liste, masal), G = Math.max(1, n - W);
  if (sira <= W) return -.9 * Math.min(1, sira / Math.max(1, W));
  return -.9 + 1.9 * Math.min(1, (sira - W) / G);
}

/* Bölümün duraklarındaki yeri: kaçıncı tur, turda kaçıncı deneme. */
function turBilgisi(liste, masal, sira) {
  const d = liste[Math.min(sira, liste.length - 1)], b = d.bolum;
  const turdakiler = liste.map((x, i) => ({ x, i })).filter(o => o.x.bolum === b);
  const kimde = kimin(masal.bolumler[b]);
  const gucTur = masal.bolumler.slice(0, b + 1).filter(x => kimin(x) === kimde).length;
  return { b, kimde, gucTur, deneme: turdakiler.findIndex(o => o.i === sira) + 1, toplam: turdakiler.length,
           bas: turdakiler[0].i, son: turdakiler[turdakiler.length - 1].i + 1 };
}

/* Çıkanlar Güneş'in sırasıyla yazılır: palto hep en sonda ("şapka, palto"). */
function degisim(once, simdi, Y) {
  const sira = k => (Y?.gunesCikarir || []).indexOf(k);
  return { eklenen: simdi.filter(k => !once.includes(k)),
           cikan: once.filter(k => !simdi.includes(k)).sort((a, b) => sira(a) - sira(b)) };
}

/* Bir denemenin haberi: kim ne yaptı, yolcu ne yaptı. */
function haber(masal, kimde, fark) {
  const Y = masal.yarisma, guc = Y[kimde], yolcu = Y.yolcu.ad, g = k => Y.giysiler[k];
  if (kimde === 'ruzgar') {
    if (fark.eklenen.length) return `${guc.ad} ${guc.eylem}; ${yolcu} üşüdü ve ${fark.eklenen.map(k => g(k).takti).join(', ')}.`;
    return `${guc.ad} ${guc.eylem}; ${yolcu} paltosuna daha sıkı sarıldı.`;
  }
  if (fark.cikan.length) return `${guc.ad} ${guc.eylem}; ${yolcu} ısındı ve ${fark.cikan.map(k => g(k).cikardi).join(', ')}.`;
  return `${guc.ad} ${guc.eylem}; ${yolcu} gülümsedi, biraz daha ısındı.`;
}

/* Tur sonucunun kısa özeti: skorbordda bir satır. */
function turOzeti(masal, kimde, fark) {
  const Y = masal.yarisma, g = k => Y.giysiler[k].ad.toLocaleLowerCase('tr');
  if (kimde === 'ruzgar') return fark.eklenen.length
    ? `${Y.yolcu.ad} sarındı: +${fark.eklenen.map(g).join(', +')}`
    : `${Y.yolcu.ad} paltosuna sıkıca sarıldı`;
  return fark.cikan.length
    ? `${Y.yolcu.ad} kendi çıkardı: ${fark.cikan.map(g).join(', ')}`
    : `${Y.yolcu.ad} ısınmaya başladı`;
}

export default {
  kod: 'yarisma',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Deneme tamamlandı.', devam: 'Panoya dön', final: 'Turu bitir' },
  geriEtiket: 'Panoya dön',

  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, gorevEkrani, ikon, simge, ses } = api;
    const Y = masal.yarisma, liste = duraklar(), n = liste.length, s = durum.sira;
    const durak = liste[s], bol = masal.bolumler[durak.bolum];
    const t = turBilgisi(liste, masal, s), guc = Y[t.kimde];
    ses.setRegion(['dag', 'dag', 'ciftlik', 'orman'][durak.bolum] || 'dag');

    /* Durak bitip dönüldüyse etkisini oynat; ileri-geri atlamada oynatma. */
    const onceki = SON.kod === masal.kod && SON.sira === s - 1 ? s - 1 : null;
    SON.sira = null; SON.kod = masal.kod;

    const sayfa = el('main', `sayfa harita yarisma-sayfasi sira-${t.kimde}`);
    sayfa.style.setProperty('--accent', bol.renk);
    sayfa.append(ustBar());

    /* ——— Gökyüzü panosu ——— */
    const pano = el('section', 'yarisma-pano');
    pano.dataset.kurguDurak = String(s);
    pano.dataset.kurguToplam = String(n);
    pano.setAttribute('aria-label', `Yarışma panosu: ${siradaMetni(guc)}, ${s} / ${n} deneme`);
    const bitenTur = kod => masal.bolumler.map((x, i) => ({ x, i })).filter(o => kimin(o.x) === kod);
    const taraf = kod => {
      const kisi = Y[kod], aktif = kod === t.kimde;
      const k = el('div', `yarisma-taraf ${kod}` + (aktif ? ' aktif' : ''));
      const yuz = el('span', 'yarisma-yuz'); yuz.innerHTML = ikon(kisi.kod);
      const yazi = el('div', 'yarisma-taraf-yazi');
      yazi.append(el('small', '', kisi.unvan.toLocaleUpperCase('tr')), el('strong', '', kisi.ad));
      const turlar = el('div', 'yarisma-turlari');
      bitenTur(kod).forEach(o => {
        const bitti = liste.findLastIndex(d => d.bolum === o.i) < s;
        turlar.append(el('i', bitti ? 'bitti' : o.i === durak.bolum ? 'simdi' : '', ''));
      });
      yazi.append(turlar);
      yazi.append(el('span', 'yarisma-rozet', aktif ? 'SIRADA' : (kod === 'ruzgar' && t.kimde === 'gunes' ? 'DENEDİ' : 'BEKLİYOR')));
      k.append(yuz, yazi);
      return k;
    };
    const orta = el('div', 'yarisma-orta');
    const kadran = el('div', 'yarisma-kadran');
    kadran.innerHTML = `<svg viewBox="0 0 200 110" aria-hidden="true">
      <path d="M16 100A84 84 0 0 1 100 16" fill="none" stroke="#9cc1d8" stroke-width="16" stroke-linecap="round"/>
      <path d="M100 16A84 84 0 0 1 184 100" fill="none" stroke="#f2c35a" stroke-width="16" stroke-linecap="round"/>
      <path d="M40 100A60 60 0 0 1 160 100" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="3 7" opacity=".8"/>
    </svg>`;
    const deger = ibre(s, liste, masal), eski = onceki != null ? ibre(onceki, liste, masal) : deger;
    const ok = el('i', 'yarisma-ibre'); ok.style.setProperty('--aci', `${(eski * 78).toFixed(1)}deg`);
    kadran.append(ok, el('b', 'yarisma-mil'),
      el('span', 'yarisma-uc sol', 'Sert esinti'), el('span', 'yarisma-uc sag', 'Tatlı sıcak'));
    if (onceki != null) requestAnimationFrame(() => requestAnimationFrame(() => ok.style.setProperty('--aci', `${(deger * 78).toFixed(1)}deg`)));

    const yolcu = el('div', 'yarisma-yolcu');
    const yolcuYuz = el('span', 'yarisma-yolcu-yuz'); yolcuYuz.innerHTML = ikon(Y.yolcu.kod);
    const simdiGiyili = giyili(s, liste, masal), onceGiyili = onceki != null ? giyili(onceki, liste, masal) : simdiGiyili;
    const fark = degisim(onceGiyili, simdiGiyili, Y);
    const giysiler = el('div', 'yarisma-giysiler');
    Object.entries(Y.giysiler).forEach(([anahtar, g]) => {
      const c = el('span', 'yarisma-giysi' + (simdiGiyili.includes(anahtar) ? ' giyili' : '') +
        (fark.eklenen.includes(anahtar) ? ' yeni' : '') + (fark.cikan.includes(anahtar) ? ' cikti' : ''));
      c.innerHTML = ikon(g.kod); c.title = g.ad; c.setAttribute('aria-label', `${g.ad}: ${simdiGiyili.includes(anahtar) ? 'üstünde' : 'üstünde değil'}`);
      giysiler.append(c);
    });
    const yolcuYazi = el('div', 'yarisma-yolcu-yazi');
    yolcuYazi.append(el('strong', '', `${Y.yolcu.ad}’un üstünde ${simdiGiyili.length} giysi`),
      el('small', '', simdiGiyili.includes('palto') ? 'Palto hâlâ üstünde' : 'Palto çıktı!'));
    yolcu.append(yolcuYuz, yolcuYazi, giysiler);
    orta.append(el('span', 'yarisma-pano-baslik', 'KİM DAHA GÜÇLÜ?'), kadran, yolcu);
    pano.append(taraf('ruzgar'), orta, taraf('gunes'));
    sayfa.append(pano);

    /* ——— Harita ve deneme kartı ——— */
    const icerik = el('div', 'yarisma-icerik');
    const gorunum = el('section', 'ada-gorunumu'); gorunum.setAttribute('aria-label', masal.ad + ' yayla yolu');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    /* Harita başlığı yok: masalın adı üst çubukta, yarışmanın durumu panoda.
       Sol üst köşe Rüzgâr tepesinin keşif etiketine kalıyor. */
    gorunum.append(api.kameraKontrolleri({ sol: 'Yaylayı sola döndür', sag: 'Yaylayı sağa döndür' }));
    if (onceki != null) {
      const etkiSahibi = kimin(masal.bolumler[liste[onceki].bolum]);
      const kutu = el('div', `yarisma-haber ${etkiSahibi}`);
      kutu.setAttribute('role', 'status');
      const r = el('span', 'yarisma-haber-yuz'); r.innerHTML = ikon(Y[etkiSahibi].kod);
      /* Sıra el değiştirdiyse haber de onu söyler. */
      const metin = etkiSahibi !== t.kimde
        ? `${Y[etkiSahibi].ad} sırasını bitirdi; ${Y.yolcu.ad} hâlâ paltosuna sarılı. ${siradaMetni(guc)}!`
        : haber(masal, etkiSahibi, fark);
      kutu.append(r, el('span', '', metin));
      gorunum.append(kutu);
      setTimeout(() => kutu.classList.add('gitti'), 5200);
    }

    const kart = el('aside', 'yarisma-kart');
    const ad = durum.adlar[durum.sira % durum.adlar.length];
    kart.append(el('span', 'eyebrow yarisma-sira', `${siradaMetni(guc).toLocaleUpperCase('tr')} · ${t.gucTur}. TUR · ${t.deneme}. DENEME`),
      el('h1', '', bol.baslik), el('p', 'bolum-hikaye', bol.hikaye));
    const konus = el('div', 'yarisma-konusma');
    const kr = el('span', 'yarisma-konusma-yuz'); kr.innerHTML = ikon(bol.karakter.kod);
    const kk = el('div'); kk.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    konus.append(kr, kk); kart.append(konus);
    const deneme = el('div', 'yarisma-deneme');
    deneme.append(el('span', 'eyebrow', 'BU DENEMEYİ SEN YAPACAKSIN'), el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final'
        ? `${bol.karakter.ad} ile ilgilen; tur böyle tamamlansın.`
        : durak.veri.yonerge));
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    deneme.append(cocuk);
    const eylemler = el('div', 'yarisma-eylemler');
    if (s > 0) eylemler.append(dugme('Bir adım geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Denemeyi başlat', gorevEkrani));
    deneme.append(eylemler);
    kart.append(deneme);
    icerik.append(gorunum, kart);
    sayfa.append(icerik);
    kok.append(sayfa);
    dunyayaKur(kap, s, gorevEkrani);
    void simge;
  },

  /* Her deneme sonrası: tahtaya dönüldüğünde etkisini oynatmak için işaretle.
     Tur sonunda armağan yerine TUR SONUCU skorbordu gelir. */
  sonra(durak, api) {
    const { durum, masal, kok, el, dugme, ustBar, duraklar, ikon } = api;
    SON.sira = durum.sira - 1; SON.kod = masal.kod;
    if (durak.tip !== 'final') return;
    api.temizle();
    const Y = masal.yarisma, liste = duraklar(), b = durak.bolum, bol = masal.bolumler[b];
    const kimde = kimin(bol), guc = Y[kimde];
    const sayfa = el('main', `sayfa hikaye odul yarisma-skor sira-${kimde}`);
    sayfa.style.setProperty('--accent', bol.renk);
    sayfa.append(ustBar());
    const kutu = el('section', 'hikaye-karti'), resim = el('div', 'hikaye-resim');
    resim.innerHTML = ikon(guc.kod);
    kutu.append(resim, el('span', 'eyebrow', `${b + 1}. TUR SONUCU · ${guc.unvan.toLocaleUpperCase('tr')}`),
      el('h1', '', bol.turSonu || `${bol.ad} bitti!`), el('p', '', bol.final.cozum));

    /* Skorbord: her tur bir satır. Oynanmamış turlar "sırada" bekler. */
    const tablo = el('div', 'yarisma-skorbord');
    tablo.setAttribute('role', 'table'); tablo.setAttribute('aria-label', 'Tur sonuçları');
    masal.bolumler.forEach((x, i) => {
      const ilk = liste.findIndex(d => d.bolum === i), son = liste.findLastIndex(d => d.bolum === i) + 1;
      const kod = kimin(x), oynandi = son <= durum.sira, simdi = i === b;
      const satir = el('div', `yarisma-skor-satir ${kod}` + (oynandi ? ' oynandi' : ' sirada') + (simdi ? ' simdi' : ''));
      satir.setAttribute('role', 'row');
      const yuz = el('span', 'yarisma-skor-yuz'); yuz.innerHTML = ikon(Y[kod].kod);
      const ad = el('div', 'yarisma-skor-ad');
      ad.append(el('small', '', `${i + 1}. TUR`), el('strong', '', `${Y[kod].ad} · ${x.ad}`));
      const once = giyili(Math.max(0, ilk), liste, masal), sonra = giyili(son, liste, masal);
      const f = degisim(once, sonra, Y);
      const sonuc = el('div', 'yarisma-skor-sonuc');
      if (oynandi) {
        sonuc.append(el('span', '', turOzeti(masal, kod, f)));
        const simgeler = el('span', 'yarisma-skor-giysiler');
        [...f.eklenen.map(k => [k, 'eklendi']), ...f.cikan.map(k => [k, 'cikti'])].forEach(([k, c]) => {
          const g = el('i', c); g.innerHTML = ikon(Y.giysiler[k].kod); g.title = Y.giysiler[k].ad; simgeler.append(g);
        });
        sonuc.append(simgeler);
      } else sonuc.append(el('span', 'yarisma-skor-bekliyor', 'Sırada'));
      const palto = el('b', 'yarisma-skor-palto', !oynandi ? '—' : sonra.includes('palto') ? 'Palto üstünde' : 'Palto çıktı!');
      if (oynandi && !sonra.includes('palto')) palto.classList.add('cikti');
      satir.append(yuz, ad, sonuc, palto);
      tablo.append(satir);
    });
    kutu.append(tablo);
    const sonTur = b === masal.bolumler.length - 1, sonraki = masal.bolumler[b + 1];
    kutu.append(el('p', 'odul-gecis', sonTur
      ? 'Dört tur bitti. Şimdi masalın sonuna.'
      : `Sırada ${Y[kimin(sonraki)].ad} var: ${sonraki.ad.toLocaleLowerCase('tr')}.`),
      dugme(sonTur ? 'Masalın sonunu gör' : 'Yarışmaya devam et', api.tahta));
    sayfa.append(kutu); kok.append(sayfa);
    return 'beklet';
  }
};

/* KURGU · YOLCULUK — halka haritada durak durak ilerle, armağan topla.
   Umut Adası'nın kurgusu. Dört bölge, her bölüm sonunda bir armağan;
   dördü toplanınca masal biter. Ağustos Böceği ile Karınca bunu kullanır. */

export default {
  kod: 'yolculuk',
  /* Görev ekranının alt çubuğu: çözülünce yazan cümle ve düğmeler. */
  etiketler: { basari: 'Başardın! Ambar biraz daha doldu.', devam: 'Yolculuğa devam et', final: 'Armağanı al' },
  geriEtiket: 'Haritaya dön',
  ekran(api) {
    const { durum, masal, kok, el, dugme, ustBar, dunyayaKur, duraklar, armaganlar, gorevEkrani, ikon, simge, ses } = api;
    const liste = duraklar(), durak = liste[durum.sira], b = durak.bolum, bol = masal.bolumler[b];
    ses.setRegion(['ciftlik', 'orman', 'deniz', 'dag'][b] || 'ciftlik');
    const sayfa = el('main', 'sayfa harita');
    sayfa.style.setProperty('--accent', bol.renk); sayfa.append(ustBar());
    const icerik = el('div', 'harita-icerik'), yan = el('aside', 'yolculuk-paneli');
    yan.append(el('span', 'eyebrow', `BÖLÜM ${String(b + 1).padStart(2, '0')} / ${String(masal.bolumler.length).padStart(2, '0')}`),
               el('h1', '', bol.baslik), el('p', 'bolum-alt', bol.ad), el('p', 'bolum-hikaye', bol.hikaye));
    const dostKart = el('div', 'dost-karti'), resim = el('div', 'dost-resmi');
    resim.innerHTML = ikon(bol.karakter.kod);
    const konus = el('div'); konus.append(el('strong', '', bol.karakter.ad), el('p', '', bol.soz));
    dostKart.append(resim, konus); yan.append(dostKart);
    const gorev = el('div', 'siradaki-gorev');
    const ad = durum.adlar[durum.sira % durum.adlar.length];
    gorev.append(el('span', 'eyebrow', 'SIRADAKİ İŞ'), el('h2', '', durak.veri.engel),
      el('p', '', durak.tip === 'final'
        ? `${bol.karakter.ad} ile ilgilen, ${bol.armagan.ad.toLocaleLowerCase('tr')} armağanını kazan.`
        : durak.veri.yonerge));
    const cocuk = el('div', 'siradaki-cocuk');
    cocuk.append(el('span', 'cocuk-avatar', ad.charAt(0).toLocaleUpperCase('tr')), el('span', '', `Sırada: ${ad}`));
    gorev.append(cocuk); yan.append(gorev); icerik.append(yan);

    const gorunum = el('section', 'ada-gorunumu');
    gorunum.setAttribute('aria-label', masal.ad + ' haritası');
    const kap = el('div', 'dunya'); gorunum.append(kap);
    const baslik = el('div', 'harita-baslik');
    baslik.append(el('span', 'eyebrow', masal.kaynak.toLocaleUpperCase('tr')), el('h2', '', masal.ad));
    gorunum.append(baslik);
    gorunum.append(api.kameraKontrolleri({ sol: 'Haritayı sola döndür', sag: 'Haritayı sağa döndür' }));
    const not = el('div', 'buyume-notu'); not.innerHTML = simge('leaf');
    const izNot = masal.dunya?.izNotu;
    not.append(el('span', '', durum.sira === 0
      ? (izNot?.bos || 'Henüz başlamadık')
      : (izNot?.dolu ? izNot.dolu.replace('{n}', durum.sira) : `${durum.sira} işle biraz daha ilerledik`)));
    gorunum.append(not); icerik.append(gorunum); sayfa.append(icerik);

    const alt = el('footer', 'yolculuk-alt'), ilerleme = el('div', 'yolculuk-ilerleme');
    ilerleme.append(el('span', 'eyebrow', 'YOLCULUĞUMUZ'),
      el('strong', '', `${String(durum.sira + 1).padStart(2, '0')} / ${liste.length} durak`));
    const iz = el('div', 'progress-track'), cubuk = el('i');
    cubuk.style.width = `${durum.sira / liste.length * 100}%`; iz.append(cubuk); ilerleme.append(iz); alt.append(ilerleme);
    const canta = el('div', 'armaganlar');
    masal.bolumler.forEach((v, i) => {
      const alindi = armaganlar().includes(i);
      const parca = el('div', 'armagan' + (alindi ? ' kazanildi' : ''));
      const img = el('span', 'armagan-ikon'); img.innerHTML = ikon(v.armagan.kod);
      const yazi = el('div'); yazi.append(el('strong', '', v.armagan.ad), el('small', '', alindi ? 'Kazanıldı ✓' : 'Keşfedilecek'));
      parca.append(img, yazi); canta.append(parca);
    });
    alt.append(canta);
    const eylemler = el('div', 'harita-eylemler');
    if (durum.sira > 0) eylemler.append(dugme('Bir durak geri', () => { durum.sira--; api.yaz(); api.tahta(); }, 'text-btn', 'back'));
    eylemler.append(dugme('Göreve başlayalım', gorevEkrani));
    alt.append(eylemler); sayfa.append(alt); kok.append(sayfa);
    dunyayaKur(kap, durum.sira, gorevEkrani);
  }
};

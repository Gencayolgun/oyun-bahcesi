import {ikon,simge} from './ikon.js';
import {ses} from './ses.js';
import {oyunuBaslat,ilerlemeOku,yap} from './kabuk.js';
import {MASALLAR} from './masallar/liste.js';
import {ciftlikIkonlariniKaydet} from './ciftlik/ikonlar.js';

import paylas from './oyunlar/paylas.js';
import kayip  from './oyunlar/kayip.js';
import gizli  from './oyunlar/gizli.js';
import oruntu from './oyunlar/oruntu.js';
import yol    from './oyunlar/yol.js';
import yapboz from './oyunlar/yapboz.js';
import dizi   from './oyunlar/dizi.js';
import fark   from './oyunlar/fark.js';
import zaman  from './oyunlar/zaman.js';
import terazi from './oyunlar/terazi.js';
import cift   from './oyunlar/cift.js';

/* Oyun Bahçesi — anaokulu oyunları için giriş ekranı.

   Umut Adası uzun soluklu sınıf yolculuğu (40 dk, bütün sınıf sırayla).
   Diğer on oyun kendi başına açılır, 5-10 dakikalık, üçer seviyeli.
   Hepsi aynı tasarım dilini paylaşır; ikonlar ve sesler ortak. */

/* Kısa oyunlar menüsü. yakala/takip/refleks/takimyildiz/cift/isabet burada
   YOK — onlar masalların içindeki bölümler, ayrı oyun değil. Kodları
   js/oyunlar/ altında duruyor ve masal motoru oradan kullanıyor. */
export const OYUNLAR = [paylas, kayip, gizli, oruntu, yol, yapboz, dizi, fark, zaman, terazi];

const kok = document.querySelector('#kok');

function dugme(metin, fn, cls = 'primary', isaret = 'arrow', sesBaslat = true) {
  const b = yap('button', `btn ${cls}`); b.type = 'button';
  b.setAttribute('aria-label', metin); b.append(yap('span', '', metin));
  if (isaret) b.insertAdjacentHTML('beforeend', simge(isaret));
  b.onclick = e => { if (sesBaslat) ses.start(); fn?.(e); };
  return b;
}

function bahce() {
  const ilerleme = ilerlemeOku();
  const sayfa = yap('main', 'sayfa bahce');

  const ust = yap('header', 'ust-bar');
  const marka = yap('div', 'btn marka');
  marka.insertAdjacentHTML('afterbegin', simge('leaf'));
  marka.append(yap('span', '', 'Oyun Bahçesi'), yap('span', 'marka-alt', 'ANAOKULU OYUNLARI'));
  ust.append(marka);
  const eylem = yap('div', 'ust-eylemler');
  const sesDugme = dugme(ses.label(), () => {
    const acik = ses.toggle();
    sesDugme.querySelector('span').textContent = acik ? 'Sesleri kapat' : 'Sesleri aç';
  }, 'icon-btn', 'sound');
  eylem.append(sesDugme, dugme('Tam ekran', () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, 'icon-btn', 'expand'));
  ust.append(eylem); sayfa.append(ust);

  const govde = yap('div', 'bahce-govde');

  const giris = yap('section', 'bahce-giris');
  giris.append(
    yap('span', 'eyebrow', 'AKILLI TAHTA İÇİN HAZIR'),
    yap('h1', '', 'Masallar ve oyunlar.\nHepsi aynı bahçede.'),
    yap('p', 'lead', 'Saat yok, puan yok, kaybetme yok. Yanlış seçim yalnızca birlikte düşünmeyi getirir. Dokunarak oynanır; akıllı tahtada da tablette de aynı çalışır.')
  );
  govde.append(giris);

  const uzunBaslik = yap('div', 'bahce-baslik bahce-baslik-ilk');
  uzunBaslik.append(yap('span', 'eyebrow', 'UZUN OYUNLAR · HER BİRİ BİR DERS SAATİ'),
                    yap('p', '', 'Senaryolu, bütün sınıfın birlikte oynadığı masallar. Sınıf mevcudu kadar durak; her çocuk bir kez tahtaya gelir.'));
  govde.append(uzunBaslik);

  /* Umut Adası: tek oturumluk değil, bütün sınıfın 40 dakikalık yolculuğu. */
  const one = yap('a', 'ada-karti'); one.href = 'umut-adasi.html';
  const oneResim = yap('span', 'ada-resmi'); oneResim.innerHTML = ikon('agac');
  const oneMetin = yap('span', 'ada-metin');
  oneMetin.append(
    yap('span', 'eyebrow', 'UZUN OYUN · BÜTÜN SINIF'),
    yap('strong', '', 'Küçük Tohum · Umut Adası'),
    yap('span', 'ada-ozet', 'Dört doğa diyarında geçen, sınıfın birlikte oynadığı 40 dakikalık bir masal. Her çocuk sırayla tahtaya gelir; dört armağan toplanınca Umut Ağacı büyür.'),
    yap('span', 'ada-etiket', 'Sınıf mevcudu kadar durak · 3B harita · öğretmen anlatımı için aralar')
  );
  one.append(oneResim, oneMetin);
  one.insertAdjacentHTML('beforeend', simge('arrow'));
  govde.append(one);

  /* Fabl uyarlamaları — aynı ölçek, klasik masallardan. */
  MASALLAR.forEach(m => {
    const k = yap('a', 'ada-karti masal-karti'); k.href = `masal.html?m=${m.kod}`;
    k.style.setProperty('--kart-renk', m.renk);
    const resim = yap('span', 'ada-resmi'); resim.innerHTML = ikon(m.ikon);
    const metin = yap('span', 'ada-metin');
    metin.append(yap('span', 'eyebrow', `${m.kaynak.toLocaleUpperCase('tr')} · ${m.sure.toLocaleUpperCase('tr')}`),
                 yap('strong', '', m.ad), yap('span', 'ada-ozet', m.ozet),
                 yap('span', 'ada-etiket', `Ders: ${m.ders} · ${m.bolumler.map(b => b.ad).join(' → ')}`));
    k.append(resim, metin);
    k.insertAdjacentHTML('beforeend', simge('arrow'));
    govde.append(k);
  });

  /* Çiftçi Fare: ayrı oyun (ciftlik.html). Sınıfın her gün birkaç dakika
     döndüğü, gerçek günlerle büyüyen çiftlik. Kart .ada-karti DEĞİL:
     bahce.spec.js ders saatlik oyunları o sınıfla sayıyor. */
  ciftlikIkonlariniKaydet();
  const ciftlikBaslik = yap('div', 'bahce-baslik');
  ciftlikBaslik.append(yap('span', 'eyebrow', 'ÇİFTLİK · HER GÜN BİRKAÇ DAKİKA'),
                       yap('p', '', 'Her çocuğun kendi çiftliği. Bitkiler gerçek günlerle büyür; sıra gelen çocuk tahtada birkaç iş yapar.'));
  govde.append(ciftlikBaslik);
  const ciftlik = yap('a', 'ciftlik-karti'); ciftlik.href = 'ciftlik.html';
  const ciftlikResim = yap('span', 'ada-resmi'); ciftlikResim.innerHTML = ikon('ciftlik-fare');
  const ciftlikMetin = yap('span', 'ada-metin');
  ciftlikMetin.append(
    yap('span', 'eyebrow', 'YENİ · 3B ÇİFTLİK'),
    yap('strong', '', 'Çiftçi Fare'),
    yap('span', 'ada-ozet', 'Hasır şapkalı fare çitli, yollu çiftliğinde dolaşır: ev, tarla, ambar, kümesteki tavuklar ve Dede Ceviz. Çocuk joystick ile yürür, dokunduğu yere gider, çitlerin üstünden zıplar.'),
    yap('span', 'ada-etiket', 'Okuma gerektirmez · Toprak ve kümes işleri sonraki adımda')
  );
  ciftlik.append(ciftlikResim, ciftlikMetin);
  ciftlik.insertAdjacentHTML('beforeend', simge('arrow'));
  govde.append(ciftlik);

  const baslik = yap('div', 'bahce-baslik');
  baslik.append(yap('span', 'eyebrow', 'KISA OYUNLAR · HER BİRİ ÜÇ SEVİYE'),
                yap('p', '', 'Tek başına açılır, beş on dakika sürer. Bir çocuk da oynayabilir, sınıf da sırayla.'));
  govde.append(baslik);

  const izgara = yap('div', 'oyun-izgara');
  OYUNLAR.forEach(oyun => {
    const k = yap('button', 'oyun-karti'); k.type = 'button';
    k.style.setProperty('--kart-renk', oyun.renk);
    k.dataset.region = oyun.bolge;
    k.setAttribute('aria-label', `${oyun.ad} — ${oyun.ozet}`);
    const resim = yap('span', 'oyun-karti-resmi'); resim.innerHTML = ikon(oyun.ikon);
    const metin = yap('span', 'oyun-karti-metin');
    metin.append(yap('strong', '', oyun.ad), yap('span', 'oyun-karti-ozet', oyun.ozet), yap('span', 'oyun-karti-beceri', oyun.beceri));
    const sv = yap('span', 'oyun-karti-seviye');
    const gecilen = ilerleme[oyun.kod] || 0;
    oyun.seviyeler.forEach((s, i) => {
      const n = yap('i', i < gecilen ? 'gecildi' : '');
      n.title = `${i + 1}. seviye · ${s.ad}`;
      sv.append(n);
    });
    if (gecilen >= oyun.seviyeler.length) sv.append(yap('small', 'tamamlandi-rozet', 'Tamamlandı'));
    else if (gecilen) sv.append(yap('small', '', `${gecilen}/${oyun.seviyeler.length} seviye`));
    else sv.append(yap('small', '', `${oyun.seviyeler.length} seviye`));
    metin.append(sv);
    k.append(resim, metin);
    k.onclick = () => { ses.start(); oyunuBaslat(kok, oyun, Math.min(gecilen, oyun.seviyeler.length - 1), bahce); };
    izgara.append(k);
  });
  govde.append(izgara);

  const dip = yap('footer', 'bahce-dip');
  dip.append(yap('span', 'tiny', 'Dokunarak oynanır · Süre baskısı yok · Kaybetme yok · Masallar ve kısa oyunlar internet gerektirmez'));
  govde.append(dip);

  sayfa.append(govde);
  kok.replaceChildren(sayfa);
}

bahce();

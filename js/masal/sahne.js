import {ikon} from '../ikon.js';
import {ses} from '../ses.js';

/* DURAK SAHNESİ — her durakta hikâyeyi ilerleten kısa bir animasyon.

   NEDEN MOTOR İÇİ, AI FİLMİ DEĞİL: masal başına 28 durak var. 10 masal
   280 klip demek; hem bütçe yetmez hem de AI, oyunun elle çizilmiş
   karakterlerini birebir üretemez — çocuk filmde başka, oyunda başka bir
   kaplumbağa görür. Burada sahneyi oyunun KENDİ karakterleriyle
   canlandırıyoruz: tutarlı, çevrimdışı, anında.
   (Açılış ve final filmleri ayrı: onlar AI ile üretiliyor.)

   Sahne hikâyeye katkı yapar: görevin çözdüğü SORUNU gösterir. Çocuk
   tahtaya geldiğinde neyi neden yaptığını görmüş olur.

   Şablonlar:
     gelis    karakter sahneye girer, etrafına bakar
     sorun    nesneler dağılır/düşer, karakter irkilir
     istek    karakter öne gelir, konuşma balonu açılır
     kesif    kamera sahneyi tarar, saklı olan belirir
     cozuldu  nesneler yerine uçar, karakter sevinir

   Öğretmen her zaman atlayabilir; sahne 6-7 saniye sürer. */

const yap = (t, c, m) => { const e = document.createElement(t); if (c) e.className = c; if (m != null) e.textContent = m; return e; };

export function sahneOynat(kap, sahne, bolum, bitince) {
  const s = sahne || {};
  const tip = s.tip || 'gelis';
  const kisi = s.kisi || bolum.karakter?.kod || 'kus';
  const sure = s.sure || 6200;

  const perde = yap('div', `durak-sahnesi sahne-${tip}`);
  perde.dataset.bolge = bolum.kod || 'orman';
  /* Renkler bölümün kendisinden gelir: kış soğuk, yaz altın görünsün.
     Böylece her masal ve her bölüm kendi paletiyle oynar. */
  if (bolum.gok) perde.style.setProperty('--oyun-gok', bolum.gok);
  if (bolum.zemin) perde.style.setProperty('--oyun-zemin', bolum.zemin);
  if (bolum.renk) perde.style.setProperty('--oyun-canli', bolum.renk);
  if (bolum.acik) perde.style.setProperty('--oyun-acik', bolum.acik);
  perde.setAttribute('role', 'group');
  perde.setAttribute('aria-label', 'Hikâye sahnesi');

  /* Arka plan: uzaktan yakına katmanlar. Sıra önemli — zemin dekordan
     ÖNCE çizilir, yoksa ağaçlar toprağın arkasında kalır. */
  const uzak = yap('div', 'sahne-katman sahne-uzak');
  for (let i = 0; i < 7; i++) {
    const t = yap('i', 'sahne-tepe');
    t.style.left = (i * 17 - 10) + '%';
    t.style.setProperty('--g', (.5 + (i % 3) * .28).toFixed(2));
    t.style.setProperty('--w', (26 + (i % 4) * 9) + '%');
    t.style.setProperty('--h', (18 + (i % 3) * 9) + '%');
    uzak.append(t);
  }
  const zeminKat = yap('div', 'sahne-katman sahne-zeminkat');
  zeminKat.append(yap('i', 'sahne-zemin'), yap('i', 'sahne-zemin sahne-zemin-on'));
  const orta = yap('div', 'sahne-katman sahne-orta');
  const dekorlar = s.dekor || ['agac', 'kozalak', 'ot'];
  for (let i = 0; i < 11; i++) {
    const e = yap('i', 'sahne-dekor');
    e.innerHTML = ikon(dekorlar[i % dekorlar.length]);
    e.style.left = (-2 + i * 9.6) + '%';
    e.style.setProperty('--b', (24 + (i % 3) * 7) + '%');
    e.style.setProperty('--s', (i % 3 === 1 ? 1.25 : i % 3 === 2 ? .72 : 1).toFixed(2));
    e.style.setProperty('--d', (i * .19).toFixed(2) + 's');
    orta.append(e);
  }
  const yakin = yap('div', 'sahne-katman sahne-yakin');
  for (let i = 0; i < 5; i++) {                     // ön plandaki otlar
    const o = yap('i', 'sahne-on-ot');
    o.style.left = (4 + i * 23) + '%';
    o.style.setProperty('--d', (i * .27).toFixed(2) + 's');
    yakin.append(o);
  }
  const gok = yap('div', 'sahne-katman sahne-gok');
  gok.append(yap('i', 'sahne-gunes'));
  for (let i = 0; i < 3; i++) {
    const bl = yap('i', 'sahne-bulut');
    bl.style.left = (6 + i * 32) + '%'; bl.style.top = (7 + (i % 2) * 9) + '%';
    bl.style.setProperty('--s', (.7 + (i % 3) * .28).toFixed(2));
    bl.style.setProperty('--d', (i * 5) + 's');
    gok.append(bl);
  }
  perde.append(gok, uzak, zeminKat, orta, yakin);

  /* Oyuncu */
  const oyuncu = yap('div', 'sahne-oyuncu');
  oyuncu.innerHTML = ikon(kisi);
  perde.append(oyuncu);

  /* Nesneler: sorunun kendisi */
  const nesneler = yap('div', 'sahne-nesneler');
  const adet = Math.min(8, s.adet || 5);
  for (let i = 0; i < adet; i++) {
    const n = yap('i', 'sahne-nesne');
    n.innerHTML = ikon(s.nesne || 'tas');
    n.style.left = (18 + i * (64 / Math.max(1, adet - 1))) + '%';
    n.style.setProperty('--d', (i * .13).toFixed(2) + 's');
    n.style.setProperty('--r', ((i % 2 ? 1 : -1) * (8 + i * 5)) + 'deg');
    nesneler.append(n);
  }
  if (s.nesne) perde.append(nesneler);

  /* Konuşma balonu ve anlatı */
  if (s.soz) { const b = yap('div', 'sahne-balon', s.soz); perde.append(b); }
  const alt = yap('div', 'sahne-alt');
  const metin = yap('p', 'sahne-metin', s.metin || '');
  const atla = yap('button', 'btn text-btn sahne-atla'); atla.type = 'button';
  atla.append(yap('span', '', 'Sahneyi geç'));
  alt.append(metin, atla);
  perde.append(alt);

  const iz = yap('div', 'sahne-izi'); const dolgu = yap('i');
  dolgu.style.animationDuration = sure + 'ms'; iz.append(dolgu); perde.append(iz);

  kap.append(perde);
  requestAnimationFrame(() => perde.classList.add('acik'));
  if (s.sesi) ses.playAnimal(s.sesi);

  let bitti = false, zaman = 0;
  function kapat() {
    if (bitti) return; bitti = true;
    clearTimeout(zaman);
    perde.classList.add('kapaniyor');
    setTimeout(() => { perde.remove(); bitince?.(); }, 340);
  }
  atla.addEventListener('click', kapat);
  perde.addEventListener('click', e => { if (e.target === perde) kapat(); });
  zaman = setTimeout(kapat, sure);
  return { kapat, el: perde };
}

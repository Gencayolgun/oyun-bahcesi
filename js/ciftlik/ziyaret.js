/* Çiftçi Fare — arkadaş ziyareti (ziyaret.js). Plan: "Sınıf akışı / ZİYARET",
   "Veri modeli" (ziyaretler, gorulenZiyaret), "Aşama 1b" ve "Aşama 1d".

   Bu dilimde ziyaret AYNI CİHAZDAKİ çiftliklerle (YerelDepo); depo arayüzü
   BulutDepo ile aynı olduğu için 1c/1d'de aynı kod cihazlar arasında çalışır.

   AKIŞ
   - Güney kapısına yaklaşınca 'iki fare' istemi (yakinlik.js 'kapi:ziyaret'),
     dokununca ARKADAŞ IZGARASI (ziyaretAc). Izgarada YALNIZ semboller: evre,
     sayı, sıralama yok. İlk 3 kart en az ziyaret alan arkadaşlar
     (sira.js ziyaretOner); 'Başka arkadaş' bütün listeyi açar. Öğretmen
     ziyareti kapattıysa ızgara açılmaz (sunucu da ziyaretçi komutunu reddeder).
   - MİSAFİR KİPİ: kabuk dünyayı ARKADAŞIN kayıtlı durumuyla kurar; ziyaretçi
     kendi şapka rengindeki faresiyle gezer (kabuk.ciftlikAc(oid, {rol:'ziyaretci', kim})).
     Yapabildikleri: bakmak, hayvan sevmek, SUSAMIŞ bitkiyi günde bir kez sulamak
     (ziyaretSula), panoya 8 sabit çıkartmadan birini bırakmak (hediyeAc).
     Ek/çapa/hasat/yem istemleri misafirde hiç oluşmaz (yakinlik.noktaIsleri).
   - Sahibi kendi çiftliğine dönünce 'SEN YOKKEN' kartı (ciftlikAcildi):
     ziyaretçi sembolleri + çıkartmalar (+ sulama izi); en çok 7 sn, 'Atla' ile
     kapanır. Kapanınca 'gordu pano' komutu yazılır.
   - Dünyada kalıcı izler (izlerKur; yansit.js çizer): kapı panosunda son 12
     çıkartma; sulanan bitkinin dibinde ziyaretçinin renginde bayrak (1 gün).

   Çocuk ekranlarında YAZI ve RAKAM yok: düğmeler resimli, adları aria-label'da.
   Kod ve çocuk verisi innerHTML'e yazılmaz; innerHTML yalnız sabit SVG çizimleri alır.

   Dışa açık:
     ziyaretBagla(kancaKaydet)      kabuğa bağlar: ziyaretAc, hediyeAc, ciftlikAcildi, oturumKapandi
     ziyaretAc(baglam) · hediyeAc(is, baglam) · ciftlikAcildi(baglam) · kapat()
     izDurumu(durum, bugun, sinif)  → {pano:[hediye…], bayraklar:{parsel:[renk…]}} (saf)
     yeniZiyaretler(durum, gorulen) → 'Sen yokken' kartına girecek kayıtlar (saf)
     izlerKur({arac, tutamak})      → {ciz(durum, bugun, sinif), dispose()} (3B izler)
     hediyeSvg(h) · HEDIYE_CIZIMLERI · SEN_YOKKEN_MS · PANO_TAVAN */

import {HEDIYELER, PARSELLER, ZIYARET_KOTA} from './ortak/turler.js';
import {sembolSvg, sembolAdi} from './semboller.js';
import {isSvg} from './isIkonlari.js';
import {ziyaretOner, ziyaretSayilari} from './sira.js';
import {hediyeAdi} from './metinler.js';
import {anlat} from './anlatim.js';
import {ornekCiz, ornekTemizle} from './bitki3b.js';

export const SEN_YOKKEN_MS = 7000;              // kart en çok 7 sn
export const PANO_TAVAN = 12;                   // panoda son 12 çıkartma
const ONERI = 3;                                // ızgaranın ilk 3 kartı
const GOREN_TAVAN = 80;                         // bu cihazda hatırlanan görülmüş kayıt imzası

/* ——————————————————————————— çıkartma çizimleri ———————————————————————————
   120×120; her parça {d: yol, f: dolgu, s: çizgi rengi, w: kalınlık}. Aynı veri
   hem SVG (düğmeler, kart) hem tuval (panodaki çıkartmalar, Path2D) olarak çizilir. */
const C = '#33403a';
const daire = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const yapraklar = (() => {
  let d = '';
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; d += daire(+(60 + Math.cos(a) * 25).toFixed(1), +(56 + Math.sin(a) * 25).toFixed(1), 19); }
  return d;
})();
export const HEDIYE_CIZIMLERI = Object.freeze({
  kalp: [
    { d: 'M60 104C22 78 8 56 15 37 22 19 46 15 60 34 74 15 98 19 105 37 112 56 98 78 60 104Z', f: '#e2453c' },
    { d: 'M30 42q4-12 16-12', s: '#f7b4ae', w: 6 }
  ],
  yildiz: [{ d: 'M60 10 74 43 110 46 83 69 92 105 60 86 28 105 37 69 10 46 46 43Z', f: '#f6c12d' }],
  cicek: [
    { d: 'M60 80v30', s: '#4f9a3c', w: 7 },
    { d: yapraklar, f: '#f28bb0' },
    { d: daire(60, 56, 14), f: '#f6c12d' }
  ],
  gunes: [
    { d: 'M60 10v16M60 94v16M10 60h16M94 60h16M25 25l11 11M84 84l11 11M95 25 84 36M25 95l11-11', s: '#f39c12', w: 8 },
    { d: daire(60, 60, 25), f: '#f7c33a' }
  ],
  yaprak: [
    { d: 'M18 104C16 54 48 18 106 14 106 70 74 104 18 104Z', f: '#5fae4a' },
    { d: 'M22 100C48 74 70 52 98 22', s: '#3e7d31', w: 4 }
  ],
  kus: [
    { d: 'M28 66 8 54l4 26z', f: '#2f78b0' },
    { d: 'M24 70C24 44 52 34 72 44 84 36 100 38 104 46L92 52C96 72 80 92 56 92 38 92 24 84 24 70Z', f: '#4f9fd6' },
    { d: 'M40 62C50 50 66 52 72 64 60 72 48 72 40 62Z', f: '#2f78b0' },
    { d: 'M103 45 117 50 102 55z', f: '#f2a13a' },
    { d: daire(87, 48, 4), f: C }
  ],
  elma: [
    { d: 'M60 36C40 24 16 34 18 62 20 90 40 106 60 98 80 106 100 90 102 62 104 34 80 24 60 36Z', f: '#d8352a' },
    { d: 'M60 36C60 26 62 18 68 12', s: '#6e4f2e', w: 5 },
    { d: 'M64 24C74 12 90 12 96 18 88 28 74 30 64 24Z', f: '#5fae4a' },
    { d: 'M34 56q2-12 12-16', s: '#f19a90', w: 5 }
  ],
  bulut: [{ d: 'M28 88C10 88 10 62 30 62 30 40 58 34 66 50 76 34 102 42 96 62 114 62 114 88 94 88Z', f: '#f4f8fb' }]
});

function yolSvg(parcalar) {
  return parcalar.map(p => `<path d="${p.d}" fill="${p.f || 'none'}" stroke="${p.s || C}" stroke-width="${p.w || 3.5}"/>`).join('');
}
const svgSar = (govde, ek = '') => `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"${ek}><g stroke-linejoin="round" stroke-linecap="round">${govde}</g></svg>`;
/** Çıkartmanın SVG'si (sabit çizim; yazı yok). */
export function hediyeSvg(h) {
  const p = HEDIYE_CIZIMLERI[h];
  return svgSar(p ? yolSvg(p) : `<path d="${daire(60, 60, 30)}" fill="#e7e2d4" stroke="${C}" stroke-width="3.5"/>`);
}
/* Silinmiş öğrencinin izi 'bir arkadaş': gri, adsız fare başı. */
const ARKADAS_SVG = svgSar(yolSvg([
  { d: daire(34, 40, 17) + daire(86, 40, 17), f: '#b9b3a7' },
  { d: 'M60 104C30 104 20 84 24 66 28 50 44 42 60 42 76 42 92 50 96 66 100 84 90 104 60 104Z', f: '#cfc9bd' },
  { d: daire(48, 72, 4) + daire(72, 72, 4) + daire(60, 86, 5), f: C }
]));
const KAPAT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
/* 'Atla': büyük ileri oku (yazı yok). */
const ATLA_SVG = svgSar(yolSvg([{ d: 'M30 30 60 60 30 90M62 30 92 60 62 90', s: '#3f5a45', w: 13 }]));
/* 'Başka arkadaş': küçük fare başlarından bir küme. */
const BASKA_SVG = svgSar(yolSvg([
  ...[[34, 40, '#d9714f'], [86, 40, '#3d85c6'], [34, 86, '#6aa84f'], [86, 86, '#e0a930']].map(([x, y, f]) => ({ d: daire(x - 10, y - 11, 7) + daire(x + 10, y - 11, 7) + daire(x, y + 2, 15), f })),
  { d: 'M60 48v24M48 60h24', s: '#3f5a45', w: 7 }
]));

/* ——————————————————————————— saf: izler ve 'Sen yokken' ——————————————————————————— */

const renkBul = (sinif, oid) => sinif?.ogrenciler?.find(o => o.id === oid)?.renk || null;

/**
 * Dünyada kalan izler (saf).
 * pano: son 12 çıkartma (eskiden yeniye); bayraklar: bugün misafirin suladığı parsel → ziyaretçi renkleri.
 * Silinmiş öğrencinin bayrağı gri ('bir arkadaş').
 */
export function izDurumu(durum, bugun, sinif) {
  const liste = Array.isArray(durum?.ziyaretler) ? durum.ziyaretler : [];
  const pano = liste.filter(z => HEDIYELER.includes(z?.hediye)).map(z => z.hediye).slice(-PANO_TAVAN);
  const bayraklar = {};
  for (const z of liste) {
    if (z?.gun !== bugun || !PARSELLER.includes(z.sula)) continue;
    (bayraklar[z.sula] ||= []).push(renkBul(sinif, z.kim) || '#9aa4a8');
  }
  for (const p of Object.keys(bayraklar)) bayraklar[p] = bayraklar[p].slice(0, ZIYARET_KOTA.ciftlikSula);
  return { pano, bayraklar };
}

/** Kaydın imzası: aynı ziyaretçinin aynı günkü kaydı sonradan çıkartmayla güncellenirse yeniden gösterilir. */
export const ziyaretImzasi = z => `${z.gun}|${z.kim}|${z.sula || ''}|${z.hediye || ''}`;

/**
 * 'Sen yokken' kartına girecek kayıtlar (saf). Sahibin son gördüğü günden (gorulenZiyaret)
 * önceki kayıtlar görülmüştür; o günkü ve sonrakiler bu cihazda görülmediyse yenidir.
 * @param gorulen Set<imza> (bu cihazda gösterilmiş kayıtlar)
 */
export function yeniZiyaretler(durum, gorulen = new Set()) {
  const g = Number.isInteger(durum?.gorulenZiyaret) ? durum.gorulenZiyaret : -Infinity;
  return (Array.isArray(durum?.ziyaretler) ? durum.ziyaretler : [])
    .filter(z => z && Number.isInteger(z.gun) && z.gun >= g && (z.sula || z.hediye) && !gorulen.has(ziyaretImzasi(z)));
}

/* Bu cihazda görülmüş kayıt imzaları ('ciftci-gorulen:{KOD}:{oid}'). Hepsi try/catch içinde. */
const gorulenAnahtar = (kod, oid) => `ciftci-gorulen:${kod}:${oid}`;
function gorulenOku(kod, oid) {
  try { const l = JSON.parse(localStorage.getItem(gorulenAnahtar(kod, oid)) || '[]'); return new Set(Array.isArray(l) ? l : []); } catch { return new Set(); }
}
function gorulenYaz(kod, oid, set) {
  try { localStorage.setItem(gorulenAnahtar(kod, oid), JSON.stringify([...set].slice(-GOREN_TAVAN))); } catch {}
}

/* ——————————————————————————— DOM yardımcıları ——————————————————————————— */

const el = (tag, cls, ek = {}) => { const e = document.createElement(tag); if (cls) e.className = cls; Object.assign(e, ek); return e; };
function dugme(cls, etiket, svg) {
  const b = el('button', cls, { type: 'button' });
  b.setAttribute('aria-label', etiket);
  b.innerHTML = svg;                                         // sabit çizim
  return b;
}
/* Açık katmanlar: ekran değişince (oturum kapanınca) hepsi kapanır. */
const aciklar = new Set();
function katmanAc(baglam, cls, etiket) {
  const k = el('section', `ziyaret-katman ${cls}`);
  k.setAttribute('role', 'dialog');
  k.setAttribute('aria-modal', 'true');
  k.setAttribute('aria-label', etiket);
  const kart = el('div', 'ziyaret-kart');
  k.append(kart);
  (baglam.sayfa || document.body).append(k);
  let kapandi = false;
  const h = {
    el: k, kart,
    kapat(neden = 'kapat') {
      if (kapandi) return; kapandi = true;
      aciklar.delete(h);
      k.remove();
      try { h.kapaninca?.(neden); } catch (e) { console.error(e); }
      baglam.duraklat?.(false);
    },
    kapaninca: null
  };
  aciklar.add(h);
  baglam.duraklat?.(true);
  return h;
}
/** Açık ziyaret katmanlarını (ızgara, çıkartma seçimi, 'Sen yokken') kapatır. */
export function kapat() { for (const h of [...aciklar]) h.kapat('oturum'); }

function sembolKarti(o, cls = 'ziyaret-arkadas') {
  const b = el('button', cls, { type: 'button' });
  b.dataset.oid = o.id;
  b.dataset.sembol = o.sembol;
  b.style.setProperty('--renk', o.renk);
  b.setAttribute('aria-label', sembolAdi(o.sembol));
  const r = el('span', 'ziyaret-sembol');
  r.innerHTML = sembolSvg(o.sembol);                         // sabit çizim (sembol sabit listeden)
  b.append(r);
  return b;
}

/* ——————————————————————————— arkadaş ızgarası ——————————————————————————— */

/**
 * Kapıdaki 'iki fare' istemi: arkadaş ızgarası. baglam: kabuk baglam() (depo, aktif, ciftlikAc, sayfa, duraklat).
 * @returns katman tutamağı ya da null (ziyaret kapalı / arkadaş yok / misafirken)
 */
export function ziyaretAc(baglam) {
  const { depo } = baglam;
  const { oid, rol } = baglam.aktif();
  const sinif = depo.sinif;
  if (!oid || rol !== 'sahip' || !sinif || sinif.ayarlar?.ziyaret === false) return null;
  if (document.querySelector('.ziyaret-izgara')) return null;
  const arkadaslar = sinif.ogrenciler.filter(o => o.id !== oid);
  if (!arkadaslar.length) return null;
  const bugun = depo.bugun();
  const sayilar = ziyaretSayilari(Object.fromEntries(arkadaslar.map(o => [o.id, depo.ciftlik(o.id)])), bugun);
  const sira = ziyaretOner(arkadaslar.map(o => ({ oid: o.id, ziyaret: sayilar[o.id] })), { ben: oid, bugun });
  const bul = id => arkadaslar.find(o => o.id === id);

  const h = katmanAc(baglam, 'ziyaret-izgara', 'Arkadaş seç');
  const ust = el('div', 'ziyaret-ust');
  const kapatD = dugme('ziyaret-kapat', 'Vazgeç', KAPAT_SVG);
  kapatD.addEventListener('click', e => { e.stopPropagation(); h.kapat('vazgec'); });
  ust.append(kapatD);
  const oneriler = el('div', 'ziyaret-oneriler');
  const hepsi = el('div', 'ziyaret-hepsi');
  hepsi.hidden = true;
  const sec = id => {
    h.kapat('secildi');
    baglam.ciftlikAc(id, { rol: 'ziyaretci', kim: oid });
  };
  const kart = (o, cls) => {
    const b = sembolKarti(o, cls);
    b.addEventListener('click', e => { e.stopPropagation(); sec(o.id); });
    return b;
  };
  for (const id of sira.slice(0, ONERI)) oneriler.append(kart(bul(id), 'ziyaret-arkadas onerilen'));
  const kalan = sira.slice(ONERI);
  for (const id of kalan) hepsi.append(kart(bul(id), 'ziyaret-arkadas'));
  h.kart.append(ust, oneriler);
  if (kalan.length) {
    const baska = dugme('ziyaret-baska', 'Başka arkadaş', BASKA_SVG);
    baska.addEventListener('click', e => {
      e.stopPropagation();
      hepsi.hidden = false; baska.hidden = true;
      anlat('ciftlik-ziyaret-baska');
      hepsi.querySelector('button')?.focus({ preventScroll: true });
    });
    h.kart.append(baska, hepsi);
  }
  anlat('ciftlik-ziyaret-sec');
  requestAnimationFrame(() => oneriler.querySelector('button')?.focus({ preventScroll: true }));
  return h;
}

/* ——————————————————————————— çıkartma bırakma ——————————————————————————— */

/** Panodaki 'Çıkartma bırak' istemi (misafir): 8 sabit çıkartmadan biri seçilir → hediye komutu. */
export function hediyeAc(is, baglam) {
  if (baglam.aktif().rol !== 'ziyaretci' || document.querySelector('.hediye-secim')) return null;
  const h = katmanAc(baglam, 'hediye-secim', 'Çıkartma seç');
  const ust = el('div', 'ziyaret-ust');
  const kapatD = dugme('ziyaret-kapat', 'Vazgeç', KAPAT_SVG);
  kapatD.addEventListener('click', e => { e.stopPropagation(); h.kapat('vazgec'); });
  ust.append(kapatD);
  const izgara = el('div', 'hediye-izgara');
  for (const x of HEDIYELER) {
    const b = dugme('hediye-dugme', hediyeAdi(x), hediyeSvg(x));
    b.dataset.hediye = x;
    b.addEventListener('click', e => {
      e.stopPropagation();
      h.kapat('secildi');
      const r = baglam.isBitti({ ...is, hediye: x });
      if (r?.sonuc === 'tamam') anlat('ciftlik-hediye-asildi');
    });
    izgara.append(b);
  }
  h.kart.append(ust, izgara);
  anlat('ciftlik-hediye-sec');
  requestAnimationFrame(() => izgara.querySelector('button')?.focus({ preventScroll: true }));
  return h;
}

/* ——————————————————————————— 'Sen yokken' ——————————————————————————— */

/**
 * Çiftlik açılınca (kabuk kancası). Sahipse ve görmediği ziyaret varsa 'Sen yokken' kartı;
 * misafirse karşılama anlatımı.
 */
export function ciftlikAcildi(baglam) {
  const { oid, rol } = baglam.aktif();
  if (!oid) return null;
  if (rol === 'ziyaretci') { anlat('ciftlik-ziyaret-geldin'); return null; }
  return senYokkenGoster(baglam);
}

export function senYokkenGoster(baglam, { sure = SEN_YOKKEN_MS } = {}) {
  const { depo } = baglam;
  const { oid } = baglam.aktif();
  const d = depo.ciftlik(oid);
  if (!d || document.querySelector('.sen-yokken')) return null;
  const kod = depo.kod;
  const gorulen = gorulenOku(kod, oid);
  const yeni = yeniZiyaretler(d, gorulen);
  if (!yeni.length) return null;
  const sinif = depo.sinif;

  // Ziyaretçi başına tek satır: sembol + bıraktığı çıkartmalar (+ sulama izi). Sıra: ilk gelen önce.
  const kisiler = new Map();
  for (const z of yeni) {
    let k = kisiler.get(z.kim);
    if (!k) kisiler.set(z.kim, k = { kim: z.kim, hediyeler: [], sula: false });
    if (z.hediye) k.hediyeler.push(z.hediye);
    if (z.sula) k.sula = true;
  }
  const h = katmanAc(baglam, 'sen-yokken', 'Sen yokken');
  const liste = el('div', 'sen-yokken-liste');
  liste.setAttribute('role', 'list');
  for (const k of [...kisiler.values()].slice(0, 8)) {
    const satir = el('div', 'sen-yokken-kim');
    satir.setAttribute('role', 'listitem');
    const o = sinif?.ogrenciler.find(x => x.id === k.kim) || null;
    satir.dataset.sembol = o?.sembol || 'arkadas';
    satir.dataset.oid = k.kim;
    const resim = el('span', 'ziyaret-sembol');
    resim.style.setProperty('--renk', o?.renk || '#b9b3a7');
    resim.setAttribute('role', 'img');
    resim.setAttribute('aria-label', o ? sembolAdi(o.sembol) : 'Bir arkadaş');
    resim.innerHTML = o ? sembolSvg(o.sembol) : ARKADAS_SVG;
    satir.append(resim);
    for (const x of k.hediyeler.slice(-4)) {
      const c = el('span', 'sen-yokken-hediye');
      c.dataset.hediye = x;
      c.setAttribute('role', 'img');
      c.setAttribute('aria-label', hediyeAdi(x));
      c.innerHTML = hediyeSvg(x);
      satir.append(c);
    }
    if (k.sula) {
      const s = el('span', 'sen-yokken-sula');
      s.setAttribute('role', 'img');
      s.setAttribute('aria-label', 'Bitkini suladı');
      s.innerHTML = isSvg({ tur: 'sula' });
      satir.append(s);
    }
    liste.append(satir);
  }
  const atla = dugme('sen-yokken-atla', 'Atla', ATLA_SVG);
  atla.addEventListener('click', e => { e.stopPropagation(); h.kapat('atla'); });
  h.kart.append(liste, atla);
  const zaman = setTimeout(() => h.kapat('sure'), Math.max(0, Math.min(sure, SEN_YOKKEN_MS)));
  h.kapaninca = () => {
    clearTimeout(zaman);
    for (const z of yeni) gorulen.add(ziyaretImzasi(z));
    gorulenYaz(kod, oid, gorulen);
    // Sahip gördü: sunucudaki işaret bugüne ilerler (öteki cihazlarda da eski kayıtlar yeniden çıkmaz).
    if (baglam.aktif().oid === oid && baglam.aktif().rol === 'sahip') {
      try { depo.komut(oid, { tur: 'gordu', hedef: 'pano' }); } catch (e) { console.error(e); }
    }
  };
  anlat('ciftlik-sen-yokken');
  requestAnimationFrame(() => atla.focus({ preventScroll: true }));
  return h;
}

/** Kabuğa bağlar (giris.js çağırır). */
export function ziyaretBagla(kancaKaydet) {
  kancaKaydet('ziyaretAc', ziyaretAc);
  kancaKaydet('hediyeAc', hediyeAc);
  kancaKaydet('ciftlikAcildi', ciftlikAcildi);
  kancaKaydet('oturumKapandi', kapat);
}

/* ——————————————————————————— 3B izler: pano ve bayraklar ——————————————————————————— */

/* Panodaki çıkartmalar TEK tuval dokusunda: pano başına bir ya da iki çizim çağrısı;
   çıkartma yoksa hiç mesh yok (boş çiftliğin çizim bütçesi değişmez). Az çıkartma iri
   çizilir (uzaktan seçilsin); en çok 4×3 = 12 hücre. */
const PANO = { en: 1.16, boy: .62, y: 1.05, onZ: .047, arkaZ: -.058, px: 960, py: 512 };
const panoIzgara = n => (n <= 3 ? [Math.max(1, n), 1] : n <= 6 ? [3, 2] : n <= 8 ? [4, 2] : [4, 3]);
/* Bayrağın yeri (dünya): konu parselinde bitkinin dibi, tarlada ön sıranın önü. */
const BAYRAK_YERI = { konu: { x: .72, z: .6 }, t1: { x: -9.5, z: -1.6 }, t2: { x: -5.5, z: -1.6 } };

function panoTuvaliCiz(tuval, liste) {
  const c = tuval.getContext('2d');
  if (!c) return;
  c.clearRect(0, 0, tuval.width, tuval.height);
  const [sutun, satir] = panoIzgara(liste.length);
  const hw = tuval.width / sutun, hh = tuval.height / satir, boy = Math.min(hw, hh) * .86;
  liste.forEach((x, i) => {
    const sat = Math.floor(i / sutun), bu = Math.min(sutun, liste.length - sat * sutun);   // son satır ortalanır
    const cx = tuval.width / 2 + (i % sutun - (bu - 1) / 2) * hw, cy = hh * (sat + .5);
    c.save();
    c.translate(cx, cy);
    c.rotate(((i * 37) % 11 - 5) * .035);                    // biraz yamuk: elle yapıştırılmış
    // Çıkartmanın beyaz kenarı
    c.fillStyle = '#fffdf4'; c.strokeStyle = '#d8ccae'; c.lineWidth = 4;
    c.beginPath(); c.arc(0, 0, boy * .5, 0, Math.PI * 2); c.fill(); c.stroke();
    const s = boy * .82 / 120;
    c.scale(s, s); c.translate(-60, -60);
    c.lineJoin = 'round'; c.lineCap = 'round';
    for (const p of HEDIYE_CIZIMLERI[x] || []) {
      const yol = new Path2D(p.d);
      if (p.f) { c.fillStyle = p.f; c.fill(yol); }
      c.strokeStyle = p.s || C; c.lineWidth = p.w || 3.5; c.stroke(yol);
    }
    c.restore();
  });
}

/**
 * yansit.js çağırır: ciz(durum, bugun, sinif) izleri günceller, izDurumu'nu döner.
 * arac: {THREE, mal, ZEMIN}; tutamak: mekan.js (dunya, pano).
 */
export function izlerKur({ arac, tutamak }) {
  const { THREE } = arac;
  const ZEMIN = tutamak.zeminY ? tutamak.zeminY(0, 0) : (arac.ZEMIN ?? .55);
  const son = { pano: null, bayrak: null };
  let tuval = null, doku = null, malzeme = null;
  const panoMesh = [];
  const bayrakG = new THREE.Group();
  bayrakG.name = 'ziyaret-bayraklari'; bayrakG.userData.hareketli = true; bayrakG.position.y = ZEMIN;
  tutamak.dunya.add(bayrakG);

  function panoCiz(liste) {
    const anahtar = liste.join(',');
    if (son.pano === anahtar || !tutamak.pano) return;
    son.pano = anahtar;
    if (!liste.length) {
      for (const m of panoMesh) m.removeFromParent();
      return;
    }
    if (typeof document === 'undefined' || typeof Path2D === 'undefined') return;
    if (!tuval) {
      tuval = document.createElement('canvas');
      tuval.width = PANO.px; tuval.height = PANO.py;
      doku = new THREE.CanvasTexture(tuval);
      doku.colorSpace = THREE.SRGBColorSpace;
      doku.anisotropy = 4;
      malzeme = new THREE.MeshStandardMaterial({ map: doku, transparent: true, alphaTest: .04, roughness: .82, name: 'pano-cikartma' });
      const geo = new THREE.PlaneGeometry(PANO.en, PANO.boy);
      for (const [z, ry] of [[PANO.onZ, 0], [PANO.arkaZ, Math.PI]]) {
        const m = new THREE.Mesh(geo, malzeme);
        m.position.set(0, PANO.y, z); m.rotation.y = ry;
        m.name = 'pano-cikartmalar'; m.castShadow = false; m.receiveShadow = true;
        panoMesh.push(m);
      }
    }
    panoTuvaliCiz(tuval, liste);
    doku.needsUpdate = true;
    for (const m of panoMesh) if (!m.parent) tutamak.pano.add(m);
  }

  function bayrakCiz(bayraklar) {
    const anahtar = JSON.stringify(bayraklar);
    if (son.bayrak === anahtar) return;
    son.bayrak = anahtar;
    ornekTemizle(bayrakG);
    const L = [];
    for (const [p, renkler] of Object.entries(bayraklar)) {
      const yer = BAYRAK_YERI[p];
      if (!yer) continue;
      renkler.forEach((r, i) => {
        const x = yer.x + i * .3, z = yer.z;
        L.push({ g: 'sap', r: 0xf3e7cc, p: [x, .04, z], boy: [.022, .64, .022] });
        L.push({ g: 'kure0', r: 0xe6c04a, p: [x, .69, z], boy: [.035, .035, .035] });
        L.push({ g: 'kutu', r: parseInt(String(r).replace('#', ''), 16) || 0x9aa4a8, p: [x + .13, .47, z], boy: [.24, .16, .014] });
      });
    }
    if (L.length) ornekCiz(arac, bayrakG, L, { ad: 'ziyaret-bayrak' });
  }

  return {
    ciz(durum, bugun, sinif) {
      const iz = izDurumu(durum, bugun, sinif);
      panoCiz(iz.pano);
      bayrakCiz(iz.bayraklar);
      return {
        ...iz,
        panoMesh: panoMesh.filter(m => !!m.parent).length,
        bayrakSay: bayrakG.children.reduce((a, o) => a + (o.isInstancedMesh && o.geometry.type === 'BoxGeometry' ? o.count : 0), 0)
      };
    },
    dispose() {
      ornekTemizle(bayrakG); bayrakG.removeFromParent();
      for (const m of panoMesh) m.removeFromParent();
      panoMesh[0]?.geometry.dispose(); malzeme?.dispose(); doku?.dispose();
    }
  };
}

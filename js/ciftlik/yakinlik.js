/* Çiftçi Fare — yakınlık, istem, iş şeridi ve dünya balonları (yakinlik.js).

   Plan: "Oyun döngüsü" 4) İŞLER ve 3) SABAH SÜRPRİZİ.
   - Her iş noktası (mekan.js NOKTALAR) için durumdan o noktada yapılabilecek
     işler çıkarılır (noktaIsleri: saf, testte de kullanılır).
   - Fare, işi olan EN YAKIN noktaya gelince altta ≥120 px ikonlu İSTEM
     çıkar: alet + eylem resmi, görünür metin YOK (adı aria-label'da).
     Dokununca kabuk işi başlatır (mekanik başka modülde; bkz. kabuk.js
     kancalar.isBaslat).
   - Dünyada ihtiyaç BALONLARI: noktanın üstünde küçük ikon (sahne.izdus
     ile ekrana izdüşürülür); dokununca fare oraya yürür (sahne.yuru).
     Sahibin gördüğünden bu yana büyüyen bitkinin üstünde '?' balonu; bitki
     kameranın önünde ama ekranın dışındaysa (verandadan açılış) '?' ekranın
     kenarına iğnelenir. Balonlar üst düğmelerin altında, alt şeridin üstünde kalır.
   - İŞ ŞERİDİ: oturum başında öncelik sırasıyla en çok N iş (tahtada 2,
     tablette 3; sınıf ayarı tahtaIs). Yapılan iş şeritten düşer; şerit
     boşalınca kabuk 'Günü bitir'i nabız gibi attırır. Sayaç, puan yok.
   Öncelik: konu bitkisinin ihtiyacı > hazır hasat > kümes > tarla hazırlığı.
   Misafir (ziyaretçi) rolünde ek/çapa/hasat/yem istemleri HİÇ oluşmaz; yalnız
   susamış bitkiye 'ziyaretSula' ve (kim verilince) kapı panosuna 'hediye'
   (çıkartma) ile kümes kapısında 'sev' (tavukları sevmek; durum değişmez,
   şeride girmez). Kotası dolan iş (bugün zaten suladı / çıkartma bıraktı, çiftliğe
   bugün 3 misafir sulaması yapıldı) istem olarak da çıkmaz. */

import {parselDurum, konuEsitle} from './ortak/uygula.js';
import {dedeEvre} from './ortak/buyume.js';
import {kumesDurum} from './ortak/hayvan.js';
import {TARLA_TURU, PARSELLER, ZIYARET_KOTA} from './ortak/turler.js';
import {NOKTALAR} from './mekan.js';
import {isSvg, isAdi, SURPRIZ_SVG} from './isIkonlari.js';

/* Nokta: durulacak yer (nokta) ve balonun dünyadaki yeri (balon, y: yerden yükseklik). */
export const IS_NOKTALARI = Object.freeze([
  { id: 'konu', nokta: NOKTALAR.konu, balon: { x: 0, y: 3.3, z: 0 } },       // genç ceviz ağacının (≈2,8) tacının üstünde
  { id: 't1', nokta: NOKTALAR.t1, balon: { x: -10, y: 1.7, z: -3 } },
  { id: 't2', nokta: NOKTALAR.t2, balon: { x: -6, y: 1.7, z: -3 } },
  { id: 'dede', nokta: NOKTALAR.dede, balon: { x: 10, y: 5.1, z: -8 } },
  { id: 'yemlik', nokta: NOKTALAR.yemlik, balon: { x: 8.38, y: 1.25, z: 5.05 } },
  { id: 'suluk', nokta: NOKTALAR.suluk, balon: { x: 8.35, y: 1.2, z: 8 } },
  { id: 'folluk', nokta: NOKTALAR.folluk, balon: { x: 8.4, y: 1.6, z: 3.9 } },
  { id: 'kapi', nokta: NOKTALAR.kapi, balon: { x: 6, y: 2.7, z: 17 } },
  { id: 'pano', nokta: NOKTALAR.pano, balon: { x: 4.65, y: 2.05, z: 10.75 } },
  { id: 'kumes', nokta: NOKTALAR.kumes, balon: { x: 9.3, y: 1.7, z: 6.5 } }
]);
const PARSEL_ISLERI = ['capa', 'ek', 'sula', 'ot', 'destek', 'hasat'];
/* Bakım işleri: sabah sürprizi ilk BAKIMDA oynar. Noktada bakım yoksa (yalnız hasat
   ya da hiç iş) fare yaklaşınca oynar: olgun başağı eski filiz görünüşünde biçmesin. */
const BAKIM = new Set(['sula', 'ot', 'destek', 'ziyaretSula']);

/* İş kodu: mekanik modülünün (isler.js ISLER) anahtarıyla aynı. Hasat bitkiye göre ayrılır. */
export function isKoduBul(tur, hedef, bitki) {
  if (tur === 'hasat') return hedef === 'dede' ? 'dedeHasat' : bitki === 'bugday' ? 'bugdayHasat' : bitki === 'domates' ? 'domatesHasat' : null;
  if (tur === 'ziyaretSula') return 'sula';
  return ['capa', 'ek', 'sula', 'ot', 'destek', 'yem', 'suluk', 'yumurta'].includes(tur) ? tur : null;
}

/**
 * Saf: her noktada yapılabilecek işler ve sabah sürprizleri.
 * @returns {isler: {noktaId: [is]}, surpriz: {parselId: true}}
 *   is = {id:'konu:sula', tur, hedef, nokta, bitki, kod, adet?}
 *   tur: komut türü (ortak/turler.js); kod: mekanik iş kodu (isler.js); adet: yumurta sayısı
 * @param kim  misafirin oid'i (rol 'ziyaretci'): kotalar ve panodaki çıkartma işi için
 */
export function noktaIsleri(durum, bugun, sinif, { rol = 'sahip', ziyaretVar = false, kim = null } = {}) {
  const isler = {}, surpriz = {};
  for (const n of IS_NOKTALARI) isler[n.id] = [];
  if (!durum || !Number.isInteger(bugun)) return { isler, surpriz };
  const d = konuEsitle(durum, sinif, bugun);
  // Misafirin bugünkü hakları (ortak/uygula.js ile aynı kotalar; öğretmen ziyareti kapattıysa hiç)
  const misafirAcik = rol === 'ziyaretci' && sinif?.ayarlar?.ziyaret !== false;
  const bugunku = (d.ziyaretler || []).filter(z => z?.gun === bugun);
  const sulayan = bugunku.filter(z => z.sula);
  const sulaHakki = misafirAcik && (!kim || (!sulayan.some(z => z.kim === kim) && sulayan.length < ZIYARET_KOTA.ciftlikSula));
  const hediyeHakki = misafirAcik && !!kim && !bugunku.some(z => z.kim === kim && z.hediye);
  const ekle = (nokta, tur, hedef, bitki = null, ek = {}) => isler[nokta].push({ id: `${nokta}:${tur}`, tur, hedef, nokta, bitki, kod: isKoduBul(tur, hedef, bitki), ...ek });
  for (const p of PARSELLER) {
    if (p === 'konu' && !sinif?.konu) continue;
    const parsel = d.parseller[p];
    const pd = parselDurum(parsel, bugun, sinif);
    const bitki = pd.evre?.tur || (p === 'konu' ? sinif?.konu?.tur : TARLA_TURU[p]) || null;
    if (rol === 'sahip') {
      const ihtiyac = new Set(pd.ihtiyaclar);
      // Ekildiği gün sulanmamış tohum: ilk günün işleri 'ek + sula' (plan, Konu tohumları).
      const b = parsel.bitki;
      if (b && b.ekimGun === bugun && !(b.su || []).includes(bugun)) ihtiyac.add('sula');
      for (const tur of PARSEL_ISLERI) if (ihtiyac.has(tur)) ekle(p, tur, p, bitki);
      if (pd.evre?.yeniEvre) surpriz[p] = true;
    } else if (rol === 'ziyaretci' && sulaHakki && pd.evre?.susamis) {
      ekle(p, 'ziyaretSula', p, bitki);
    }
  }
  if (rol === 'sahip') {
    if (dedeEvre(d, bugun, sinif).hasatHazir) ekle('dede', 'hasat', 'dede', 'dede');
    const k = kumesDurum(d.kumes, bugun, sinif, d.sahip);
    if (k.ac) ekle('yemlik', 'yem', 'kumes');
    if (k.susuz) ekle('suluk', 'suluk', 'kumes');
    if (k.yumurta > 0) ekle('folluk', 'yumurta', 'kumes', null, { adet: k.yumurta });
  }
  if (ziyaretVar && rol === 'sahip') ekle('kapi', 'ziyaret', null);
  if (hediyeHakki) ekle('pano', 'hediye', 'pano');
  if (misafirAcik && kim) ekle('kumes', 'sev', null);
  return { isler, surpriz };
}

/** Öncelik sırasıyla düz liste: konu > hazır hasat > kümes > tarla (hazırlık ve bakım). Ziyaret ve 'sev' şeride girmez. */
export function isSirala({ isler }) {
  const tum = Object.values(isler).flat().filter(is => is.tur !== 'ziyaret' && is.tur !== 'sev');
  const derece = is => {
    if (is.hedef === 'konu') return 0;
    if (is.tur === 'hasat') return 1;
    if (is.hedef === 'kumes') return 2;
    return 3;
  };
  const sira = ['capa', 'ek', 'sula', 'ot', 'destek', 'hasat', 'yem', 'suluk', 'yumurta', 'ziyaretSula', 'hediye'];
  return tum.map((is, i) => ({ is, i })).sort((a, b) => derece(a.is) - derece(b.is) || sira.indexOf(a.is.tur) - sira.indexOf(b.is.tur) || a.i - b.i).map(x => x.is);
}

const el = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

/**
 * DOM ve kare tarafı.
 * @param istemYeri   istem düğmesinin konacağı kap (alt şerit ortası)
 * @param seritYeri   iş şeridi kabı
 * @param balonYeri   dünya balonları katmanı (dünya kabının üstünde, tam ekran)
 * @param sahne       () => dünya API'si (nerede, izdus, yuru)
 * @param zemin       zemin yüksekliği (ZEMIN)
 * @param kancalar    {isSec(is), yaklasti(noktaId), seritBitti(), istemGosterildi(is)}
 */
export function yakinlikKur({ istemYeri, seritYeri, balonYeri, sahne, zemin = .55, kancalar = {}, yaricap = 1.5 }) {
  let son = { isler: {}, surpriz: {} };
  let etkin = true, yakinNokta = null, istemIs = null;
  let serit = [];                   // [{is, el}]
  const sonYaklasma = new Map();    // surpriz bildirimi bir kez
  const balonlar = new Map();       // noktaId → {el, anahtar}

  const istem = el('button', 'is-istem');
  istem.type = 'button';
  istem.hidden = true;
  istem.addEventListener('click', e => { e.stopPropagation(); if (istemIs && etkin) kancalar.isSec?.(istemIs); });
  istemYeri?.append(istem);

  const noktaTanim = id => IS_NOKTALARI.find(n => n.id === id);
  const yuru = id => { const n = noktaTanim(id); const s = sahne(); if (n && s && etkin) s.yuru(n.nokta.x, n.nokta.z); };

  function istemGoster(is) {
    if (istemIs?.id === is?.id && !istem.hidden) return;
    istemIs = is;
    if (!is) { istem.hidden = true; istem.removeAttribute('data-is'); return; }
    istem.innerHTML = isSvg(is);
    istem.setAttribute('aria-label', isAdi(is));
    istem.dataset.is = is.id;
    istem.hidden = false;
    istem.classList.remove('yeni'); void istem.offsetWidth; istem.classList.add('yeni');
    try { kancalar.istemGosterildi?.(is); } catch (e) { console.error(e); }
  }

  function balonKur(n, anahtar, svg, etiket) {
    let b = balonlar.get(n.id);
    if (!b) {
      const e = el('button', 'ihtiyac-balonu');
      e.type = 'button';
      e.addEventListener('click', ev => { ev.stopPropagation(); yuru(n.id); });
      balonYeri?.append(e);
      b = { el: e, anahtar: null };
      balonlar.set(n.id, b);
    }
    if (b.anahtar !== anahtar) {
      b.anahtar = anahtar;
      b.el.innerHTML = svg;
      b.el.setAttribute('aria-label', etiket);
      b.el.dataset.nokta = n.id;
      b.el.classList.toggle('surpriz', anahtar === 'surpriz');
    }
    return b;
  }
  function balonSil(id) { const b = balonlar.get(id); if (b) { b.el.remove(); balonlar.delete(id); } }

  /** Durum değişince (kabuk, her ciz'den sonra). */
  function guncelle(sonuc) {
    son = sonuc;
    for (const n of IS_NOKTALARI) {
      const liste = son.isler[n.id] || [];
      if (son.surpriz[n.id]) balonKur(n, 'surpriz', SURPRIZ_SVG, 'Bak, büyümüş mü?');
      else if (liste.length) balonKur(n, liste[0].id, isSvg(liste[0]), isAdi(liste[0]));
      else balonSil(n.id);
      if (!son.surpriz[n.id]) sonYaklasma.delete(n.id);
    }
    // Şeritten yapılmış (artık gerekmeyen) işler düşer. Planlı iş (ekimden sonraki sulama gibi,
    // 'sonra' işaretli) henüz ortada yoksa, öncülü şeritte durdukça bekler.
    const mevcut = new Set(Object.values(son.isler).flat().map(i => i.id));
    const once = serit.length;
    serit = serit.filter(s => {
      if (mevcut.has(s.is.id)) { s.goruldu = true; return true; }
      if (!s.goruldu && s.is.sonra && serit.some(x => x.is.id === s.is.sonra)) return true;
      s.el.remove(); return false;
    });
    if (once && !serit.length) kancalar.seritBitti?.();
    // İstem: yakındaki noktanın ilk işi yenilensin
    if (yakinNokta) istemGoster((son.isler[yakinNokta] || [])[0] || null);
  }

  /** Oturum başında şeridi kurar: liste (seçilmiş işler) ya da n (öncelikli en çok n iş). */
  function seritKur(liste) {
    for (const s of serit) s.el.remove();
    const secilen = Array.isArray(liste) ? liste : isSirala(son).slice(0, Math.max(0, liste | 0));
    serit = secilen.map(is => {
      const b = el('button', 'is-serit-dugme');
      b.type = 'button';
      b.innerHTML = isSvg(is);
      b.setAttribute('aria-label', isAdi(is));
      b.dataset.is = is.id;
      b.addEventListener('click', e => { e.stopPropagation(); yuru(is.nokta); });
      seritYeri?.append(b);
      return { is, el: b, goruldu: !is.sonra };
    });
    return serit.map(s => s.is);
  }

  /** Her kare: en yakın işli nokta → istem; balonların ekran yeri. */
  function kare() {
    const s = sahne();
    if (!s) return;
    const p = s.nerede();
    let en = null, enU = Infinity;
    for (const n of IS_NOKTALARI) {
      const u = Math.hypot(p.x - n.nokta.x, p.z - n.nokta.z);
      if (u > yaricap) continue;
      if (son.surpriz[n.id] && !sonYaklasma.has(n.id) && !(son.isler[n.id] || []).some(is => BAKIM.has(is.tur))) {
        sonYaklasma.set(n.id, true);
        kancalar.yaklasti?.(n.id);                // bakım gerekmiyorsa yaklaşınca sabah sürprizi
      }
      if ((son.isler[n.id] || []).length && u < enU) { en = n.id; enU = u; }
    }
    if (en !== yakinNokta) {
      yakinNokta = en;
      istemGoster(en && etkin ? son.isler[en][0] : null);
    }
    // Kabın boyu karede BİR kez, yazmalardan önce okunur (her balonda okumak düzeni zorlardı).
    alanW = balonYeri?.clientWidth || 0; alanH = balonYeri?.clientHeight || 0;
    for (const [id, b] of balonlar) {
      const n = noktaTanim(id);
      let ekran = s.izdus(n.balon.x, zemin + n.balon.y, n.balon.z);
      let kenarda = false;
      if (!ekran.gorunur && son.surpriz[id]) {
        const k = kenaraIgne(s, n, ekran);
        if (k) { ekran = k; kenarda = true; }
      } else if (ekran.gorunur) ekran = guvenliAlan(ekran, son.surpriz[id] ? 86 : 76);
      const gizli = !ekran.gorunur || id === yakinNokta || !etkin;
      if (gizli !== b.el.hidden) b.el.hidden = gizli;
      if (kenarda !== b.el.classList.contains('kenarda')) b.el.classList.toggle('kenarda', kenarda);
      if (!gizli) b.el.style.transform = `translate3d(${ekran.x.toFixed(1)}px, ${ekran.y.toFixed(1)}px, 0) translate(-50%, -100%)`;
    }
  }

  /* Sabah sürprizi '?' balonu AÇILIŞTA da görünsün: verandadan bakınca konu köşesi ekranın
     üst kenarında, balonu kenarın dışında kalıyor. Noktası kameranın ÖNÜNDE ama ekranın
     dışındaysa balon ekranın kenarına iğnelenir (üst düğmelerin altı, alt şeridin, joystick'in
     ve Zıpla'nın üstü). Önde mi: aynı noktanın biraz yukarısı ekranda daha yukarıda görünür;
     kameranın arkasındaki nokta izdüşümde ters döner. Arkadaki balon gizli kalır. */
  let alanW = 0, alanH = 0;
  function kenaraIgne(s, n, ekran) {
    if (!alanW || !alanH) return null;
    const yukari = s.izdus(n.balon.x, zemin + n.balon.y + 3, n.balon.z);
    if (!(yukari.y < ekran.y)) return null;
    return guvenliAlan(ekran, 86);
  }
  /* Balon (alt ortası ekran noktasında) dokunulabilir alanda kalsın: üst düğmelerin (z 7)
     altına, ekranın yan kenarlarından taşmasın; alt şeridin, joystick'in ve Zıpla'nın üstünde. */
  function guvenliAlan(ekran, boy) {
    const W = alanW, H = alanH;
    if (!W || !H) return ekran;
    const ust = 96, alt = 190, yan = 14;
    const x = Math.min(Math.max(ekran.x, yan + boy / 2), W - yan - boy / 2);
    const y = Math.min(Math.max(ekran.y, ust + boy + 13), Math.max(ust + boy + 13, H - alt));
    return { ...ekran, x, y, gorunur: true };
  }

  return {
    guncelle, kare, seritKur,
    etkin(b) {
      if (b !== undefined) {
        etkin = !!b;
        if (!etkin) istemGoster(null);
        else if (yakinNokta) istemGoster((son.isler[yakinNokta] || [])[0] || null);
        for (const bl of balonlar.values()) if (!etkin) bl.el.hidden = true;
      }
      return etkin;
    },
    yakin: () => (yakinNokta ? { nokta: yakinNokta, is: istemIs } : null),
    serit: () => serit.map(s => s.is),
    isler: () => son,
    dispose() {
      istem.remove();
      for (const s of serit) s.el.remove();
      serit = [];
      for (const id of [...balonlar.keys()]) balonSil(id);
    }
  };
}

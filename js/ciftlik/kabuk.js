/* Çiftçi Fare — kabuk (kabuk.js): sayfanın akışı.

   Plan: "Oyun döngüsü", "Sınıf akışı", "Eşitleme".

     kurulum yok → 'yalnız bu cihaz' sınıfı kur (öğretmen)
          ↓
     Kim oynuyor? (çocuk sembolüne dokunur)
          ↓
     çiftlik (çocuğun dünyası; işler, istem, balonlar)
          ↓  'Günü bitir' (alttaki ev): çiftlik ailesi aç kalan hayvanı besler,
          ↓  kuyruk boşalır
     Kim oynuyor? …

   Öğretmen: sağ üstteki dişliye 2 sn basılı tutunca PIN sorulur; doğruysa
   öğretmen paneli açılır (panelin içeriği ogretmen.js'te: kancalar.ogretmenPaneli).

   DURUM → DÜNYA: depodaki her değişiklik (komut, eşitleme, gün dönümü,
   sınıf/konu değişimi) TEK yoldan dünyaya yansır: yenidenCiz() →
   yansit.ciz(durum, bugun, {sinif, rol}) + yakinlik.guncelle(...).

   İŞ AKIŞI (mekanik oyunlar isler.js'te; giris.js kancalarla bağlar):
     şerit ikonu / dünya balonu → fare yürür (sahne.yuru) → yaklaşınca istem
     istem dokunuşu → isSec(is)
       kancalar.isBaslat varsa: dünya DURAKLATILIR, isBaslat(is, baglam) çağrılır
         (isler.js isAc: katman + mikro-oyun + hayalet el; dönen tutamak saklanır);
         mekanik bitince baglam.bitir() → isBitti(is) → komut → depo (iyimser) →
         yenidenCiz; vazgeçilirse baglam.iptal(). İkisinde de dünya sürer.
       kanca yoksa: iş doğrudan tamam sayılır (isBitti).
     isBitti(is) → depo.komut(oid, {tur: is.tur, hedef: is.hedef}) → 'tamam' ise
       kutlama (fare zıplar; ses.correct, şeritteki son işte ses.celebrate);
       bitkinin 'sabah sürprizi' varsa 'gordu' komutu (bitki yeni evresine seker).
     Öğretmen kısayolları (panel): birlikteBitir() açık oyunu (yoksa yakındaki ya da
       şeritteki ilk işi) tamam sayar; eveGetir() açık oyundan vazgeçip fareyi verandaya getirir.

   MİSAFİR KİPİ (ziyaret.js): kapıdaki 'iki fare' istemi → kancalar.ziyaretAc (arkadaş
   ızgarası) → ciftlikAc(arkadas, {rol:'ziyaretci', kim: ben}). Dünya arkadaşın durumuyla
   kurulur; fare ziyaretçinin şapka renginde, sembol bayrağı ve üstteki rozet arkadaşın.
   Şeritte ve istemde yalnız ziyaretçi işleri (susamış bitkiye ziyaretSula, panoya çıkartma:
   kancalar.hediyeAc). Alttaki ev düğmesi misafirde 'Eve dön': ziyaretçinin kendi çiftliği açılır.

   ANLATIM (anlatim.js): istem, iş başı, ızgara, 'Sen yokken'... ses/anlatim/ciftlik-*.mp3
   kayıtlıysa çalar, yoksa sessiz; cümle ekran okuyucu için aria-live alanına yazılır.

   Dışa açık: kabukBaslat({iskelet, deneme, depo?, saat?}) → api,
              kancalar, kancaKaydet(ad, fn). */

import {saatKur} from './saat.js';
import {YerelDepo, yerelDepolama, bellekDepolama, PIN_DESEN} from './depo.js';
import {kimOynuyorAc} from './kimOynuyor.js';
import {yansitKur} from './yansit.js';
import {yakinlikKur, noktaIsleri, isSirala} from './yakinlik.js';
import {GUNU_BITIR_SVG, DISLI_SVG} from './isIkonlari.js';
import {kumesDurum} from './ortak/hayvan.js';
import {sembolSvg, sembolAdi} from './semboller.js';
import {anlat, anlatimBagla} from './anlatim.js';
import {istemKodu, isYonergeKodu} from './metinler.js';
import {PARSELLER, KONU_TURLERI, SINIR} from './ortak/turler.js';
import {ses} from '../ses.js';

/**
 * Başka modüllerin (mekanikler, öğretmen paneli, ziyaret) bağlandığı kancalar.
 * Hepsi isteğe bağlı; kayıtlı değilse kabuk kendi basit davranışını uygular.
 *
 *   isBaslat(is, baglam)
 *     is     = {id:'konu:sula', tur:'sula', hedef:'konu', nokta:'konu', bitki:'ceviz', kod:'sula', adet?}
 *              tur: komut türü (ortak/turler.js) · kod: mekanik iş kodu (isler.js ISLER anahtarı)
 *     baglam = {yas:'3-4'|'5-6', alan: katman kabı, oid, rol, sahne,
 *               bitir(): işi tamam say → isBitti(is) sonucu döner,
 *               iptal(): vazgeç (komut yok)}
 *     Dünya kabuk tarafından duraklatılmış olarak çağrılır; bitir/iptal dünyayı sürdürür.
 *     Örnek (isler.js ile):
 *       kancaKaydet('isBaslat', (is, b) => isAc({kod: is.kod, hedef: is.hedef, tur: is.bitki, adet: is.adet},
 *         {yas: b.yas, alan: b.alan, bitince: () => b.bitir(), kapaninca: s => { if (!s) b.iptal(); }}));
 *   seritSec(adaylar, n) → adaylardan şeride girecekler (ör. isler.js isListesi: art arda aynı mekanik yok)
 *   ogretmenPaneli(baglam) → PIN doğrulanınca; baglam = {depo, saat, kapat(), aktif(), yenidenCiz(),
 *                            isBitti(is), birlikteBitir(), eveGetir(), gunuBitir(), kimOynuyor()}
 *   ziyaretAc(baglam)      → kapıdaki 'iki fare' istemi (misafir kipi ziyaret.js'te)
 *   hediyeAc(is, baglam)   → misafirin panodaki 'çıkartma bırak' istemi; seçilince
 *                            baglam.isBitti({...is, hediye}) (ziyaret.js)
 *   ciftlikAcildi(baglam)  → çiftlik açılınca (sahipse 'Sen yokken' kartı, ziyaret.js)
 *   oturumKapandi()        → çiftlik oturumu kapanırken (açık ziyaret katmanları kapansın)
 * baglam (baglam()): {depo, saat, kancalar, sayfa, aktif() → {oid, rol, kim, ekran},
 *   yenidenCiz, isBitti, birlikteBitir, eveGetir, gunuBitir, kimOynuyor, ciftlikAc,
 *   duraklat(b): dünyayı katman açıkken durdur/sürdür (sayaçlı), isVarMi()}
 */
export const kancalar = { isBaslat: null, seritSec: null, ogretmenPaneli: null, ziyaretAc: null, hediyeAc: null, ciftlikAcildi: null, oturumKapandi: null };
export function kancaKaydet(ad, fn) {
  if (!(ad in kancalar)) throw new Error('kabuk: bilinmeyen kanca ' + ad);
  kancalar[ad] = typeof fn === 'function' ? fn : null;
  if (ad === 'ziyaretAc') etkinApi?.yenidenCiz();
}
let etkinApi = null;

const el = (tag, cls, ek = {}) => { const e = document.createElement(tag); if (cls) e.className = cls; Object.assign(e, ek); return e; };
const renkSayi = hex => parseInt(String(hex).replace('#', ''), 16);
const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const KONU_ADI = { ceviz: 'Ceviz', bugday: 'Buğday', domates: 'Domates' };

export async function kabukBaslat({ iskelet, deneme = false, depo = null, saat = null }) {
  saat ??= saatKur();
  depo ??= new YerelDepo({ saat, depolama: deneme ? bellekDepolama() : yerelDepolama() });

  const k = { ekran: null, oid: null, rol: 'sahip', kim: null, yansit: null, yakinlik: null, gorunus: null, kimEkrani: null, isAcik: false, panelAcik: false, bekleyenDurdur: false,
    isTutamak: null, kutlama: 0, sevgi: 0, durdurSay: 0 };
  const sahne = () => iskelet.dunya()?.sahne || null;

  /* ——— kalıcı DOM: balonlar, alt şerit, ekran katmanı, dişli ——— */
  const balonKatmani = el('div', 'ciftlik-balonlar');
  const alt = el('div', 'ciftlik-alt'); alt.hidden = true;
  const serit = el('div', 'is-seridi');
  const istemYeri = el('div', 'istem-yeri');
  const gunuBitirD = el('button', 'gunu-bitir', { type: 'button' });
  gunuBitirD.setAttribute('aria-label', 'Günü bitir');
  gunuBitirD.innerHTML = GUNU_BITIR_SVG;
  gunuBitirD.addEventListener('click', e => { e.stopPropagation(); gunuBitir(); });
  alt.append(serit, istemYeri, gunuBitirD);
  const ekranKatmani = el('div', 'ciftlik-ekran'); ekranKatmani.hidden = true;
  /* Misafirken üstte arkadaşın sembolü (kimin çiftliğinde olduğunu çocuk resimden anlar). */
  const rozet = el('div', 'ziyaret-rozet'); rozet.hidden = true;
  rozet.setAttribute('role', 'img');
  iskelet.sayfa.append(balonKatmani, alt, ekranKatmani, rozet);
  anlatimBagla({ kok: iskelet.sayfa, sesAcik: () => iskelet.sesAcik() && !ses.isMuted?.() });

  const disli = el('button', 'ciftlik-dugme ciftlik-disli', { type: 'button' });
  disli.setAttribute('aria-label', 'Öğretmen: iki saniye basılı tut');
  disli.title = 'Öğretmen: iki saniye basılı tut';
  disli.innerHTML = DISLI_SVG;
  disliBagla(disli);
  iskelet.araclar.append(disli);

  /* ——— dünya duraklatma (ekran katmanı açıkken GPU boşa çizmesin) ——— */
  function dunyaDurdur(b) {
    const s = sahne();
    k.bekleyenDurdur = false;
    if (!s) return;
    if (!b) { s.duraklat(false); return; }
    // İlk kare çizilmeden durdurma: menüden açılışta dünyanın ilk karesi (kurulumMs) yine ölçülsün.
    if (iskelet.dunya().durum.kareSay > 0) s.duraklat(true); else k.bekleyenDurdur = true;
  }
  iskelet.kareEkle((t, dt) => {
    if (k.bekleyenDurdur) { k.bekleyenDurdur = false; sahne()?.duraklat(true); return; }
    k.yansit?.kare(t, dt);
    k.yakinlik?.kare(t, dt);
  });

  /* ——— durum → dünya: tek yol ——— */
  /* komut: bu çizime yol açan (iyimser) komut; yansit onunla hasadın ambara uçuşunu başlatır. */
  function yenidenCiz(komut = null) {
    if (!k.oid || !k.yansit) return null;
    const durum = depo.ciftlik(k.oid), bugun = depo.bugun(), sinif = depo.sinif;
    if (!durum) return null;
    k.gorunus = k.yansit.ciz(durum, bugun, { sinif, rol: k.rol, komut });
    const ziyaretVar = !!kancalar.ziyaretAc && sinif?.ayarlar?.ziyaret !== false && (sinif?.ogrenciler?.length || 0) > 1;
    k.yakinlik?.guncelle(noktaIsleri(durum, bugun, sinif, { rol: k.rol, kim: k.kim, ziyaretVar }));
    return k.gorunus;
  }
  depo.abone(o => {
    if (o.tip === 'ciftlik' && o.oid === k.oid) yenidenCiz(o.neden === 'komut' ? o.komut : null);
    else if (o.tip === 'sinif') { yenidenCiz(); if (k.ekran === 'kim') k.kimEkrani?.yenile(); }
  });
  saat.abone(() => {                                   // gün dönümü (oyun sürerken ya da sekme dönünce)
    if (k.oid && k.rol === 'sahip' && k.ekran === 'ciftlik') depo.oynadi(k.oid);   // gece yarısını oynayarak geçen de bugün oynamıştır
    yenidenCiz();
    if (k.ekran === 'kim') k.kimEkrani?.yenile();
  });

  /* ——— işler ——— */
  /* Fare sevinçle zıplar; şeritteki son iş de bittiyse büyük kutlama sesi. */
  function kutla() {
    k.kutlama++;
    const seritBos = !!k.yakinlik && !k.yakinlik.serit().length;
    try { if (iskelet.sesAcik()) (seritBos ? ses.celebrate : ses.correct)?.(); } catch {}
    sahne()?.zipla?.();
  }
  /** İş bitti: komut → depo (iyimser) → dünya. Mekanik modülü (ya da öğretmenin 'birlikte bitir'i) çağırır. */
  function isBitti(is) {
    if (!k.oid || !is) return { sonuc: { red: 'oyuncu-yok' } };
    const surprizVardi = PARSELLER.includes(is.hedef) && !!k.yakinlik?.isler().surpriz?.[is.hedef];
    const istek = { tur: is.tur, hedef: is.hedef };
    if (is.tur === 'hediye') istek.hediye = is.hediye;
    const r = depo.komut(k.oid, istek, { rol: k.rol, kim: k.kim });
    if (r.sonuc === 'tamam') {
      // Sabah sürprizi: ilk bakımda bitki yeni evresine seker ('gordu').
      if (surprizVardi && k.rol === 'sahip') depo.komut(k.oid, { tur: 'gordu', hedef: is.hedef });
      kutla();
    }
    return { sonuc: r.sonuc, gorunus: k.gorunus };
  }
  function isSec(is) {
    if (!is || k.isAcik) return;
    if (is.tur === 'ziyaret') { kancalar.ziyaretAc?.(baglam()); return; }
    if (is.tur === 'hediye') { kancalar.hediyeAc?.(is, baglam()); return; }
    if (is.tur === 'sev') { sev(); return; }
    // İstem dünyadaki işi taşır; şeritte aynı iş yedek mekaniğiyle seçildiyse o korunur.
    const seritte = k.yakinlik?.serit().find(x => x.id === is.id);
    if (seritte?.yedek && !is.yedek) is = { ...is, yedek: true };
    if (!kancalar.isBaslat) { isBitti(is); return; }
    if (is.kod) anlat(isYonergeKodu(is.kod));
    const s = sahne();
    k.isAcik = true;
    s?.duraklat(true);
    k.yakinlik?.etkin(false);
    alt.classList.add('is-acik');
    iskelet.sayfa.classList.add('is-acik');
    let bitti = false;
    const sur = () => {
      k.isAcik = false; k.isTutamak = null;
      alt.classList.remove('is-acik'); iskelet.sayfa.classList.remove('is-acik');
      if (k.ekran === 'ciftlik' && !k.panelAcik) sahne()?.duraklat(false);
      k.yakinlik?.etkin(true);
    };
    const ogr = depo.ogrenci(k.rol === 'ziyaretci' ? k.kim : k.oid);
    try {
      const t = kancalar.isBaslat(is, {
        yas: ogr?.yas || '3-4', alan: iskelet.sayfa, oid: k.oid, rol: k.rol, sahne: s,
        bitir: () => { if (bitti) return null; bitti = true; sur(); return isBitti(is); },
        iptal: () => { if (bitti) return; bitti = true; sur(); }
      });
      if (!bitti) k.isTutamak = t || null;                  // öğretmenin 'birlikte bitir'i ve vazgeç için
    } catch (e) {
      console.error(e);
      if (!bitti) { bitti = true; sur(); }
    }
  }
  /* Hayvan sevmek (misafirin kümes kapısındaki istemi): durum DEĞİŞMEZ, komut yok.
     Tavuk sesi, fare zıplar, avlunun üstünde kalpler süzülür. */
  const KALP = '<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20 35C6 26 3 18 6 12 9 6 16 6 20 12 24 6 31 6 34 12 37 18 34 26 20 35Z" fill="#e2453c" stroke="#33403a" stroke-width="2.5" stroke-linejoin="round"/></svg>';
  function sev() {
    k.sevgi++;
    try { if (iskelet.sesAcik()) ses.playAnimal?.('tavuk'); } catch {}
    sahne()?.zipla?.();
    anlat('ciftlik-sev');
    const s = sahne(), zemin = iskelet.dunya()?.tutamak?.arac?.ZEMIN ?? .55;
    const e = s?.izdus?.(12.4, zemin + .9, 6.5);
    if (!e?.gorunur) return;
    const kutu = el('div', 'sev-kalpler');
    kutu.setAttribute('aria-hidden', 'true');
    kutu.style.transform = `translate(${e.x.toFixed(0)}px, ${e.y.toFixed(0)}px)`;
    for (let i = 0; i < 5; i++) { const c = el('i'); c.style.setProperty('--dx', `${(i - 2) * 26}px`); c.style.animationDelay = `${i * .09}s`; c.innerHTML = KALP; kutu.append(c); }
    iskelet.sayfa.append(kutu);
    setTimeout(() => kutu.remove(), azHareket() ? 900 : 1700);
  }

  /** Açık iş katmanını vazgeçerek kapatır (öğretmen 'eve getir', ekran değişimi). */
  function isKapat() { try { k.isTutamak?.kapat?.(); } catch (e) { console.error(e); } }
  function yaklasti(noktaId) {
    if (k.rol !== 'sahip' || !PARSELLER.includes(noktaId)) return;
    const r = depo.komut(k.oid, { tur: 'gordu', hedef: noktaId });
    if (r.sonuc === 'tamam') anlat('ciftlik-surpriz');
  }

  /* İlk günün işleri 'ek + sula' (plan, Konu tohumları): ekimin ardından aynı parselin
     sulaması şeride PLANLI iş olarak girer (tohum ekilince ortaya çıkar). */
  function seritPlanla(adaylar) {
    const out = [];
    for (const is of adaylar) {
      out.push(is);
      const sula = `${is.nokta}:sula`;
      if (is.tur === 'ek' && !adaylar.some(x => x.id === sula)) out.push({ ...is, id: sula, tur: 'sula', kod: 'sula', sonra: is.id });
    }
    return out;
  }

  /* ——— çiftlik oturumu ——— */
  function oturumKapat() {
    isKapat();
    try { kancalar.oturumKapandi?.(); } catch (e) { console.error(e); }
    rozet.hidden = true; rozet.replaceChildren();
    gunuBitirD.setAttribute('aria-label', 'Günü bitir');
    k.yakinlik?.dispose();
    k.yakinlik = null;
    alt.hidden = true;
    gunuBitirD.classList.remove('nabiz');
    k.oid = null;
  }
  function ekranTemizle() {
    k.kimEkrani?.kapat(); k.kimEkrani = null;
    ekranKatmani.replaceChildren();
    ekranKatmani.hidden = true;
  }

  /**
   * Bir çocuğun çiftliğini açar: dünya onun kimliği ve rengiyle yeniden kurulur.
   * Misafir kipi (rol 'ziyaretci', kim = ziyaretçi): dünya arkadaşın (oid) durumuyla,
   * fare ziyaretçinin şapka renginde; itilebilir bellek anahtarı rastgele
   * ('ciftlik-ziyaret-…': ziyaretçinin itip kaktığı tavuklar sahibin çiftliğine taşınmaz).
   */
  async function ciftlikAc(oid, { rol = 'sahip', kim = null } = {}) {
    const ogr = depo.ogrenci(oid);
    if (!ogr) return null;
    const misafir = rol === 'ziyaretci';
    const ziyaretci = misafir ? depo.ogrenci(kim) : null;
    if (misafir && (!ziyaretci || kim === oid || depo.sinif?.ayarlar?.ziyaret === false)) return null;
    oturumKapat();
    ekranTemizle();
    k.yansit = null;
    k.durdurSay = 0; k.panelAcik = false;
    const renk = renkSayi(ogr.renk);
    const kod = misafir ? `ciftlik-ziyaret-${Math.random().toString(36).slice(2, 10)}` : `ciftlik-${depo.kod}-${oid}`;
    const dunya = iskelet.dunyaKur({ kod, sembolRenk: misafir ? renkSayi(ziyaretci.renk) : renk });
    k.ekran = 'ciftlik';
    if (!dunya) return null;
    dunya.tutamak?.bayrakRengi?.(renk);                    // sembol bayrağı: çiftliğin sahibi
    k.yansit = dunya.tutamak ? yansitKur({ arac: dunya.tutamak.arac, tutamak: dunya.tutamak, azHareket: azHareket() }) : null;
    k.oid = oid; k.rol = misafir ? 'ziyaretci' : 'sahip'; k.kim = misafir ? kim : null;
    if (!misafir) depo.oynadi(oid);
    if (misafir) {
      rozet.innerHTML = sembolSvg(ogr.sembol);            // sabit çizim (sembol sabit listeden)
      rozet.style.setProperty('--renk', ogr.renk);
      rozet.setAttribute('aria-label', `Arkadaşının çiftliği: ${sembolAdi(ogr.sembol)}`);
      rozet.hidden = false;
      gunuBitirD.setAttribute('aria-label', 'Eve dön');
    }
    k.yakinlik = yakinlikKur({
      istemYeri, seritYeri: serit, balonYeri: balonKatmani, sahne, zemin: dunya.tutamak?.arac?.ZEMIN ?? .55,
      kancalar: {
        isSec, yaklasti,
        istemGosterildi: is => anlat(istemKodu(is.tur)),
        seritBitti: () => { gunuBitirD.classList.add('nabiz'); anlat(k.rol === 'ziyaretci' ? 'ciftlik-eve-don' : 'ciftlik-gunu-bitir'); }
      }
    });
    yenidenCiz();                                         // önbellekten hemen
    try { await depo.ciftlikAc(oid); } catch (e) { console.error(e); }
    if (k.oid !== oid) return null;                        // bu arada başka çocuk seçildi
    yenidenCiz();                                         // taşımadan taze
    const n = depo.sinif?.ayarlar?.tahtaIs === 3 ? 3 : 2;
    let secilen;
    if (misafir) secilen = isSirala(k.yakinlik.isler()).slice(0, n);          // misafirin işleri: sula, çıkartma
    else {
      const adaylar = seritPlanla(isSirala(k.yakinlik.isler()));
      secilen = adaylar.slice(0, n);
      if (kancalar.seritSec) { try { secilen = kancalar.seritSec(adaylar, n) || secilen; } catch (e) { console.error(e); } }
    }
    k.yakinlik.seritKur(secilen);
    if (!secilen.length) gunuBitirD.classList.add('nabiz');
    alt.hidden = false;
    if (iskelet.sesAcik()) setTimeout(() => { try { ses.playAnimal?.('horoz'); } catch {} }, 250);
    try { kancalar.ciftlikAcildi?.(baglam()); } catch (e) { console.error(e); }
    return k.gorunus;
  }

  /** 'Günü bitir': çiftlik ailesi aç/susuz hayvanı besler, kuyruk boşalır, Kim oynuyor'a dönülür. */
  async function gunuBitir() {
    if (k.oid && k.rol === 'ziyaretci' && k.kim) {       // misafir: 'Eve dön' → kendi çiftliği
      const ev = k.kim;
      try { await depo.bosalt(); } catch (e) { console.error(e); }
      anlat('ciftlik-eve-don');
      return ciftlikAc(ev);
    }
    if (k.oid && k.rol === 'sahip') {
      const d = depo.ciftlik(k.oid);
      if (d) {
        const kd = kumesDurum(d.kumes, depo.bugun(), depo.sinif, d.sahip);
        if (kd.ac) depo.komut(k.oid, { tur: 'yem', hedef: 'kumes' });
        if (kd.susuz) depo.komut(k.oid, { tur: 'suluk', hedef: 'kumes' });
      }
    }
    try { await depo.bosalt(); } catch (e) { console.error(e); }
    kimGoster();
  }

  /* ——— ekranlar ——— */
  function kimGoster() {
    oturumKapat();
    ekranTemizle();
    k.ekran = 'kim';
    ekranKatmani.hidden = false;
    k.kimEkrani = kimOynuyorAc(ekranKatmani, { depo, sec: oid => ciftlikAc(oid) });
    dunyaDurdur(true);
    anlat('ciftlik-kim');
  }

  function kurulumGoster() {
    oturumKapat();
    ekranTemizle();
    k.ekran = 'kurulum';
    ekranKatmani.hidden = false;
    dunyaDurdur(true);
    const kart = el('form', 'kurulum-kart');
    kart.noValidate = true;
    kart.append(el('h1', '', { textContent: 'Çiftçi Fare' }));
    kart.append(el('p', 'kurulum-not', { textContent: 'Bu cihazda yeni bir sınıf kurulur. Kayıt yalnız bu cihazda tutulur; çocuk adı sorulmaz, her çocuk bir sembolle tanınır.' }));
    const alan = (etiket, girdi) => { const l = el('label', 'kurulum-alan'); l.append(el('span', '', { textContent: etiket }), girdi); return l; };
    const secim = (ad, secenekler, secili) => {
      const f = el('fieldset', 'kurulum-secim');
      f.append(el('legend', '', { textContent: ad.etiket }));
      for (const [deger, yazi] of secenekler) {
        const l = el('label');
        const r = el('input', '', { type: 'radio', name: ad.ad, value: String(deger), checked: deger === secili });
        l.append(r, el('span', '', { textContent: yazi }));
        f.append(l);
      }
      return f;
    };
    const sayi = el('input', '', { type: 'number', min: '2', max: String(SINIR.ogrenci), value: '20', name: 'sayi', inputMode: 'numeric' });
    kart.append(alan('Çocuk sayısı', sayi));
    kart.append(secim({ ad: 'yas', etiket: 'Yaş grubu' }, [['3-4', '3-4 yaş'], ['5-6', '5-6 yaş']], '3-4'));
    kart.append(secim({ ad: 'konu', etiket: 'Konu tohumu' }, KONU_TURLERI.map(t => [t, KONU_ADI[t] || t]), 'ceviz'));
    kart.append(secim({ ad: 'unite', etiket: 'Ünite süresi' }, [[5, '1 hafta'], [10, '2 hafta'], [20, '4 hafta']], 10));
    kart.append(secim({ ad: 'takvim', etiket: 'Takvim' }, [['okul-gunleri', 'Okul günleri'], ['her-gun', 'Her gün']], 'okul-gunleri'));
    const pin = el('input', '', { type: 'password', name: 'pin', inputMode: 'numeric', autocomplete: 'new-password', minLength: 6, maxLength: 12 });
    kart.append(alan('Öğretmen PIN’i (en az 6 rakam)', pin));
    const uyari = el('p', 'kurulum-uyari', { role: 'alert' });
    const kur = el('button', 'kurulum-dugme', { type: 'submit', textContent: 'Sınıfı kur' });
    kart.append(uyari, kur);
    kart.addEventListener('submit', async e => {
      e.preventDefault();
      const n = Math.round(Number(sayi.value));
      if (!(n >= 2 && n <= SINIR.ogrenci)) { uyari.textContent = `Çocuk sayısı 2 ile ${SINIR.ogrenci} arasında olmalı.`; return; }
      if (!PIN_DESEN.test(pin.value)) { uyari.textContent = 'PIN en az 6 rakam olmalı.'; return; }
      const deger = ad => kart.querySelector(`input[name="${ad}"]:checked`)?.value;
      kur.disabled = true;
      try {
        await depo.sinifKur({
          ogrenciSayisi: n, yas: deger('yas'), konu: deger('konu'), uniteGun: Number(deger('unite')),
          takvim: deger('takvim'), pin: pin.value
        });
        saat.tz(depo.sinif?.ayarlar?.tz);
        kimGoster();
      } catch (hata) {
        console.error(hata);
        uyari.textContent = 'Sınıf kurulamadı. Lütfen yeniden deneyin.';
        kur.disabled = false;
      }
    });
    ekranKatmani.append(kart);
    sayi.focus({ preventScroll: true });
  }

  /* ——— öğretmen: dişliye 2 sn basılı tut + PIN ——— */
  function disliBagla(d) {
    let zaman = null;
    const birak = () => { clearTimeout(zaman); zaman = null; d.classList.remove('basili'); };
    d.addEventListener('pointerdown', e => {
      e.stopPropagation();
      birak();
      d.classList.add('basili');
      zaman = setTimeout(() => { birak(); pinSor(); }, 2000);
    });
    for (const o of ['pointerup', 'pointerleave', 'pointercancel']) d.addEventListener(o, birak);
    d.addEventListener('click', e => e.stopPropagation());
    d.addEventListener('contextmenu', e => e.preventDefault());
  }
  /* Sayaçlı: PIN, panel ve ziyaret katmanları (ızgara, çıkartma, 'Sen yokken') üst üste
     açılabilir; dünya sonuncusu kapanınca sürer. */
  function panelDurdur(b) {
    k.durdurSay = Math.max(0, k.durdurSay + (b ? 1 : -1));
    k.panelAcik = k.durdurSay > 0;
    if (k.ekran !== 'ciftlik') return;
    // İlk kare çizilmeden durdurulmasın: çiftlik açılır açılmaz çıkan katmanın ('Sen yokken') ardında dünya görünsün.
    if (k.panelAcik) { dunyaDurdur(true); k.yakinlik?.etkin(false); }
    else if (!k.isAcik) { dunyaDurdur(false); k.yakinlik?.etkin(true); }
  }
  function pinSor() {
    if (document.querySelector('.ciftlik-pin') || !depo.kurulumVar()) return;
    panelDurdur(true);
    const kutu = el('div', 'ciftlik-pin');
    kutu.setAttribute('role', 'dialog'); kutu.setAttribute('aria-modal', 'true'); kutu.setAttribute('aria-label', 'Öğretmen girişi');
    const f = el('form', 'ciftlik-pin-kart');
    const giris = el('input', '', { type: 'password', inputMode: 'numeric', autocomplete: 'off', name: 'pin', maxLength: 12 });
    giris.setAttribute('aria-label', 'Öğretmen PIN’i');
    const l = el('label'); l.append(el('span', '', { textContent: 'Öğretmen PIN’i' }), giris);
    const ac = el('button', 'pin-ac', { type: 'submit', textContent: 'Aç' });
    const vazgec = el('button', 'pin-vazgec', { type: 'button', textContent: 'Vazgeç' });
    const dugmeler = el('div', 'pin-dugmeler'); dugmeler.append(vazgec, ac);
    f.append(l, dugmeler);
    kutu.append(f);
    iskelet.sayfa.append(kutu);
    const kapat = () => { kutu.remove(); };           // DOM'da PIN alanı kalmasın
    vazgec.addEventListener('click', () => { kapat(); panelDurdur(false); });
    f.addEventListener('submit', async e => {
      e.preventDefault();
      ac.disabled = true;
      const tamam = await depo.pinDogrula(giris.value);
      ac.disabled = false;
      if (!tamam) {
        giris.value = '';
        f.classList.remove('salla'); void f.offsetWidth; f.classList.add('salla');
        giris.focus();
        return;
      }
      kapat();
      panelAc();
    });
    giris.focus({ preventScroll: true });
  }
  function panelAc() {
    let kapandi = false;
    const kapat = () => { document.querySelector('.ciftlik-panel-yedek')?.remove(); if (!kapandi) { kapandi = true; panelDurdur(false); } };
    if (kancalar.ogretmenPaneli) {
      try { kancalar.ogretmenPaneli({ ...baglam(), kapat }); return; } catch (e) { console.error(e); }
    }
    // Yer tutucu: panelin asıl içeriği ogretmen.js'te (kancalar.ogretmenPaneli). Burada
    // yalnız takılan çocuk için iki kısayol: 'birlikte bitir' (iş tamam sayılır) ve 'eve getir'.
    const p = el('div', 'ciftlik-panel-yedek');
    p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'true'); p.setAttribute('aria-label', 'Öğretmen paneli');
    const kart = el('div', 'ciftlik-pin-kart');
    kart.append(el('h2', '', { textContent: 'Öğretmen paneli' }));
    if (k.ekran === 'ciftlik' && k.oid) {
      const kisayol = el('div', 'panel-kisayollar');
      const isVar = !!(k.isTutamak || k.yakinlik?.yakin()?.is || k.yakinlik?.serit().length);
      const birlikte = el('button', 'pin-vazgec panel-birlikte', { type: 'button', textContent: 'Birlikte bitir', disabled: !isVar });
      birlikte.addEventListener('click', () => { kapat(); birlikteBitir(); });
      const eve = el('button', 'pin-vazgec panel-eve', { type: 'button', textContent: 'Eve getir' });
      eve.addEventListener('click', () => { kapat(); eveGetir(); });
      kisayol.append(birlikte, eve);
      kart.append(kisayol);
    }
    const kapatD = el('button', 'pin-ac', { type: 'button', textContent: 'Kapat' });
    kapatD.addEventListener('click', kapat);
    kart.append(kapatD);
    p.append(kart);
    iskelet.sayfa.append(p);
    kapatD.focus({ preventScroll: true });
  }

  /* Öğretmen kısayolları. 'Birlikte bitir': açık mikro-oyun varsa o tamam sayılır
     (kutlamayla kapanır, komut depoya gider); yoksa yakındaki, o da yoksa şeritteki
     ilk iş. 'Eve getir': açık iş varsa vazgeçilir, fare verandaya döner. */
  function birlikteBitir() {
    if (k.isTutamak?.bitir) { k.isTutamak.bitir(); return { sonuc: 'katman' }; }
    const is = k.yakinlik?.yakin()?.is || k.yakinlik?.serit()[0];
    // Seçim isteyen işler (çıkartma, arkadaş) tamam sayılamaz: seçim katmanı açılır, öğretmen çocukla seçer.
    if (is?.tur === 'hediye' || is?.tur === 'ziyaret') { isSec(is); return { sonuc: 'katman' }; }
    return is ? isBitti(is) : null;
  }
  function eveGetir() {
    isKapat();
    sahne()?.eveDon();
  }

  function baglam() {
    return {
      depo, saat, kancalar, sayfa: iskelet.sayfa,
      aktif: () => ({ oid: k.oid, rol: k.rol, kim: k.kim, ekran: k.ekran }),
      yenidenCiz, isBitti,
      birlikteBitir, eveGetir,
      gunuBitir, kimOynuyor: kimGoster, ciftlikAc,
      duraklat: panelDurdur,
      isVarMi: () => !!(k.isTutamak || k.yakinlik?.yakin()?.is || k.yakinlik?.serit().length)
    };
  }

  /* ——— başlangıç ——— */
  await depo.hazirla();
  if (depo.sinif?.ayarlar?.tz) saat.tz(depo.sinif.ayarlar.tz);
  saat.baslat();

  const api = {
    depo, saat, kancalar, kancaKaydet,
    ekran: () => k.ekran,
    aktif: () => ({ oid: k.oid, rol: k.rol, kim: k.kim }),
    /** Etkin çiftliğe komut (testler, öğretmen). Dünya depo olayıyla hemen güncellenir. */
    komut(istek, secenek = {}) {
      if (!k.oid) return { sonuc: { red: 'oyuncu-yok' }, gorunus: null };
      const r = depo.komut(k.oid, istek, { rol: k.rol, kim: k.kim, ...secenek });
      return { sonuc: r.sonuc, gorunus: k.gorunus };
    },
    gorunus: () => k.yansit?.gorunus() ?? null,
    isler: () => k.yakinlik?.isler() ?? null,
    serit: () => k.yakinlik?.serit() ?? [],
    yakin: () => k.yakinlik?.yakin() ?? null,
    isBitti, isSec, gunuBitir, ciftlikAc, kimOynuyor: kimGoster, kurulum: kurulumGoster, yenidenCiz,
    birlikteBitir, eveGetir,
    /** Açık iş katmanının tutamağı (isler.js isAc) ya da null. */
    isTutamak: () => k.isTutamak,
    isAcik: () => k.isAcik,
    /** Kaç iş kutlandı (fare zıpladı): sınama. */
    kutlamalar: () => k.kutlama,
    /** Misafirin kaç kez hayvan sevdiği (durum değişmez; sınama). */
    sevgiler: () => k.sevgi,
    sekiyorMu: () => !!k.yansit?.sekiyorMu(),
    _yansit: () => k.yansit                                // sınama: yapay durumla çizim
  };
  etkinApi = api;
  if (window.__ciftlik) Object.assign(window.__ciftlik, { kabuk: api, depo, saat, komut: api.komut, gorunus: api.gorunus, isler: api.isler, isBitti });

  if (deneme) {
    // Deneme: bellekte (kaydedilmeyen) küçük bir sınıf; Kim oynuyor atlanır.
    if (!depo.kurulumVar()) await depo.sinifKur({ ogrenciSayisi: 4, yas: '3-4', konu: 'ceviz', uniteGun: 10 });
    await ciftlikAc(depo.sinif.ogrenciler[0].id);
    return api;
  }
  iskelet.dunyaKur({ kod: 'ciftlik-bekleme' });            // perde arkasında çiftlik (ilk kareden sonra durur)
  if (!depo.kurulumVar()) kurulumGoster(); else kimGoster();
  return api;
}

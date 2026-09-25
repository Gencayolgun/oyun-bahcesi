// Çiftçi Fare — komut uygulama (SAF). İstemcinin iyimser uygulaması ve sunucunun yetkili uygulaması AYNI işlevdir.
// uygula(durum, komut, {rol, kim, bugun, sinif}) → {durum, sonuc: 'tamam' | 'zaten' | {red}}
// - Girdi belgesi DEĞİŞTİRİLMEZ; her zaman yeni nesne döner.
// - İdempotent: komut kimliği 'c_xxxxxxxx:sıra'; sıra ≤ cihazSeq[cihaz] ise 'zaten' ve belge bayt bayt aynı.
//   Reddedilen komut belgeyi (cihazSeq dahil) hiç değiştirmez.
// - Bakım kayıtları gün kümesidir (birleşim: sıradan bağımsız, tekrara dayanıklı).
// - Komut günü [bugün−7, bugün] aralığına kırpılır; ileri tarihli komut reddedilir. Ziyaretçi komutu hep bugüne sayılır.
// - Red kodları sunucuda: 'rol' / 'kim' / 'ziyaret-kapali' → 403, 'gecersiz-*' → 400, ötekiler → sonuclar[] içinde.
import {
  turAl, TARLA_TURU, TARLA_UNITE_GUN, GECMIS_GUN, ZIYARET_KAYIT, ZIYARET_KOTA, ANI_TAVAN,
  SAHIP_KOMUTLARI, ZIYARETCI_KOMUTLARI, PARSELLER, CIHAZ_TAVAN, SINIR, UNITE_GUNLERI, VARSAYILAN_UNITE,
} from './turler.js';
import { evre, dedeEvre, sonGun } from './buyume.js';
import { capala, ek as ekParsel, anizaDon, toprakDurum } from './toprak.js';
import { yumurtaSayisi, kumesDurum } from './hayvan.js';
import { komutDogrula, bayt, KOMUT_ID_DESEN, OID_DESEN, CIHAZ_DESEN } from './dogrula.js';
import { klon, gunEkle, sikistirYerinde } from './sema.js';

const RED = (kod) => ({ red: kod });
const TAMAM = Object.freeze({});

// ------------------------------------------------------------------ konu eşitleme

// Sınıfın konusu değiştiyse (ya da ilk kez başladıysa) konu parselini yeni konuya hazırlar (yerinde).
// Eski bitki 'anılar'a taşınır, kaybolmaz. Toprak hazır (yumuşak) gelir: ilk günün işleri 'ek + sula'.
// Konu değişimi: başlangıç günü (basGun) ya da TÜR değişti (öğretmen aynı gün yanlış tohumu düzeltirse
// basGun aynı kalır; eski tür parselde kalsaydı yeni tohum hiç ekilemezdi: 'dolu').
// Başlangıcı gelecekte olan konu bugün uygulanmaz: eski bitki başlangıç gününe kadar yerinde kalır.
function konuEsitleYerinde(d, sinif, bugun) {
  const konu = sinif?.konu;
  if (!konu || !Number.isInteger(konu.basGun) || !turAl(konu.tur)) return false;
  if (konu.basGun > bugun) return false;
  const p = d.parseller.konu;
  const b = p.bitki;
  if (p.konuBas === konu.basGun && (!b || b.tur === konu.tur)) return false;
  if (b && b.tur === konu.tur && Number.isInteger(b.ekimGun) && b.ekimGun >= konu.basGun) {
    // Bu konuda ekilmiş bitki (konuBas'sız eski belge): taşınmaz, yalnız işaretlenir.
    d.parseller.konu = { ...p, konuBas: konu.basGun };
    return true;
  }
  if (b) {
    // Anının evresi yeni konunun başlamasından bir önceki güne göre: eşitlemenin HANGİ GÜN yapıldığına
    // bağlı değildir (sunucu ve her cihaz aynı sonucu bulur). Aynı konuda tür düzeltmesinde bugüne göre.
    const sonGunu = konu.basGun > b.ekimGun ? konu.basGun - 1 : bugun;
    const sonEvre = evre(b, Math.max(b.ekimGun, sonGunu), sinif).no;
    d.anilar = [...(d.anilar || []), { tur: b.tur, ekimGun: b.ekimGun, sonEvre }].slice(-ANI_TAVAN);
  }
  d.parseller.konu = { toprak: 'yumusak', capaGun: konu.basGun, bitki: null, konuBas: konu.basGun };
  return true;
}

/** Konu parselini sınıfın güncel konusuna eşitler (yeni nesne). İstemci açılışta görüntü için kullanır. */
export function konuEsitle(durum, sinif, bugun) {
  const d = klon(durum);
  konuEsitleYerinde(d, sinif, bugun);
  return d;
}

// ------------------------------------------------------------------ ziyaret

function bugunkuZiyaretler(d, g) {
  return (d.ziyaretler || []).filter((z) => z.gun === g);
}

function ziyaretKaydet(d, kim, g, alan) {
  const liste = (d.ziyaretler || []).slice();
  const i = liste.findIndex((z) => z.kim === kim && z.gun === g);
  if (i >= 0) {
    liste[i] = { ...liste[i], ...alan };
  } else {
    liste.push({ kim, gun: g, sula: null, hediye: null, ...alan });
  }
  d.ziyaretler = liste.slice(-ZIYARET_KAYIT);
}

// ------------------------------------------------------------------ işleyiciler (klon üstünde yerinde çalışır)

function bitkiAl(d, hedef) {
  return d.parseller[hedef]?.bitki || null;
}

function tumGunlerinSonu(gunler, ozet) {
  return sonGun(gunler, ozet, Infinity);
}

const ISLEYICILER = {
  capa(d, hedef, g) {
    const r = capala(d.parseller[hedef], g);
    if (r.red) return r;
    d.parseller[hedef] = r.parsel;
    return TAMAM;
  },

  ek(d, hedef, g, { sinif, bugun }) {
    let tur, unite, gun = g;
    if (hedef === 'konu') {
      const konu = sinif?.konu;
      if (!konu || !turAl(konu.tur)) return RED('konu-yok');
      if (Number.isInteger(konu.basGun) && konu.basGun > bugun) return RED('konu-baslamadi');
      tur = konu.tur;
      // Liste dışı süre bitkiye yazılırsa belge ciftlikDogrula'dan geçmez (sunucu bir daha yazamaz).
      // Evre hesabı (esikler) zaten varsayılana düşüyordu; kayıt da aynı değeri taşısın.
      unite = UNITE_GUNLERI.includes(konu.uniteGun) ? konu.uniteGun : VARSAYILAN_UNITE;
      if (Number.isInteger(konu.basGun) && gun < konu.basGun) gun = konu.basGun;
    } else {
      tur = TARLA_TURU[hedef];
      unite = TARLA_UNITE_GUN;
    }
    const r = ekParsel(d.parseller[hedef], tur, gun, unite);
    if (r.red) return r;
    d.parseller[hedef] = r.parsel;
    return TAMAM;
  },

  sula(d, hedef, g) {
    const b = bitkiAl(d, hedef);
    if (!b) return RED('bitki-yok');
    b.su = gunEkle(b.su, g);
    return TAMAM;
  },

  ot(d, hedef, g) {
    const b = bitkiAl(d, hedef);
    if (!b) return RED('bitki-yok');
    if (!Number.isInteger(b.otAyiklama) || g > b.otAyiklama) b.otAyiklama = g;
    return TAMAM;
  },

  destek(d, hedef, g, { sinif }) {
    const b = bitkiAl(d, hedef);
    if (!b) return RED('bitki-yok');
    const t = turAl(b.tur);
    if (!t || !Number.isInteger(t.destek)) return RED('destek-yok');
    if (evre(b, g, sinif).no < t.destek) return RED('erken');
    b.isler = { ...(b.isler || {}) };
    // En erken gün kalır: iki cihazın destek komutu hangi sırayla gelirse gelsin sonuç aynı.
    if (!Number.isInteger(b.isler.destek) || g < b.isler.destek) b.isler.destek = g;
    return TAMAM;
  },

  hasat(d, hedef, g, { sinif }) {
    if (hedef === 'dede') {
      const t = turAl('dede-ceviz');
      const son = tumGunlerinSonu(d.dede.hasat, d.dede.ozet?.hasat);
      if (son !== null && son >= g) return RED('hazir-degil');
      if (!dedeEvre(d, g, sinif).hasatHazir) return RED('hazir-degil');
      d.dede = { ...d.dede, hasat: gunEkle(d.dede.hasat, g) };
      d.ambar[t.ambar] += t.miktar;
      return TAMAM;
    }
    const b = bitkiAl(d, hedef);
    if (!b) return RED('bitki-yok');
    const t = turAl(b.tur);
    if (!t || t.hasat === 'yok') return RED('hasat-yok');
    if (t.hasat === 'yeniden') {
      const son = tumGunlerinSonu(b.hasat, b.ozet?.hasat);
      if (son !== null && son >= g) return RED('hazir-degil');
    }
    if (!evre(b, g, sinif).hasatHazir) return RED('hazir-degil');
    d.ambar[t.ambar] += t.miktar;
    if (t.hasat === 'tek') d.parseller[hedef] = anizaDon(d.parseller[hedef]);
    else b.hasat = gunEkle(b.hasat, g);
    return TAMAM;
  },

  yem(d, hedef, g) {
    d.kumes = { ...d.kumes, yem: gunEkle(d.kumes.yem, g) };
    return TAMAM;
  },

  suluk(d, hedef, g) {
    d.kumes = { ...d.kumes, su: gunEkle(d.kumes.su, g) };
    return TAMAM;
  },

  yumurta(d, hedef, g, { sinif }) {
    const n = yumurtaSayisi(d.kumes, g, sinif, d.sahip);
    if (n <= 0) return RED('yumurta-yok');
    d.ambar.yumurta += n;
    d.kumes = { ...d.kumes, sonToplama: g };
    return TAMAM;
  },

  gordu(d, hedef, g, { sinif }) {
    if (hedef === 'pano') {
      if (!Number.isInteger(d.gorulenZiyaret) || g > d.gorulenZiyaret) d.gorulenZiyaret = g;
      return TAMAM;
    }
    const b = bitkiAl(d, hedef);
    if (!b) return RED('bitki-yok');
    const no = evre(b, g, sinif).no;
    if (!Number.isInteger(b.gorulenEvre) || no > b.gorulenEvre) b.gorulenEvre = no;
    return TAMAM;
  },

  ziyaretSula(d, hedef, g, { sinif, kim }) {
    const b = bitkiAl(d, hedef);
    if (!b) return RED('bitki-yok');
    if (!evre(b, g, sinif).susamis) return RED('susamamis');
    const bugunku = bugunkuZiyaretler(d, g).filter((z) => z.sula !== null);
    if (bugunku.filter((z) => z.kim === kim).length >= ZIYARET_KOTA.kisiSula) return RED('kota');
    if (bugunku.length >= ZIYARET_KOTA.ciftlikSula) return RED('kota');
    b.su = gunEkle(b.su, g);
    ziyaretKaydet(d, kim, g, { sula: hedef });
    return TAMAM;
  },

  hediye(d, hedef, g, { kim, komut }) {
    const bugunku = bugunkuZiyaretler(d, g).filter((z) => z.kim === kim && z.hediye !== null);
    if (bugunku.length >= ZIYARET_KOTA.kisiHediye) return RED('kota');
    ziyaretKaydet(d, kim, g, { hediye: komut.hediye });
    return TAMAM;
  },
};

// ------------------------------------------------------------------ uygula

/**
 * @param durum   çiftlik belgesi (değiştirilmez)
 * @param komut   {id:'c_ab12cd34:118', tur, hedef, gun?, hediye?}
 * @param secenek {rol:'sahip'|'ziyaretci', kim: ziyaretçi oid, bugun: gün no, sinif: sınıf belgesi}
 */
export function uygula(durum, komut, secenek = {}) {
  const { rol = 'sahip', kim = null, bugun, sinif = null } = secenek;
  if (!Number.isInteger(bugun)) throw new TypeError('uygula: bugun tam sayı gün olmalı');
  const reddet = (kod) => ({ durum: klon(durum), sonuc: RED(kod) });

  const v = komutDogrula(komut);
  if (v.red) return reddet('gecersiz-' + v.red);

  const [, cihaz, sira] = KOMUT_ID_DESEN.exec(komut.id);
  const seq = Number(sira);
  const onceki = durum.cihazSeq?.[cihaz];
  if (Number.isInteger(onceki) && seq <= onceki) return { durum: klon(durum), sonuc: 'zaten' };

  if (rol === 'sahip') {
    if (!SAHIP_KOMUTLARI.includes(komut.tur)) return reddet('rol');
  } else if (rol === 'ziyaretci') {
    if (!ZIYARETCI_KOMUTLARI.includes(komut.tur)) return reddet('rol');
    if (typeof kim !== 'string' || !OID_DESEN.test(kim) || kim === durum.sahip) return reddet('kim');
    // Aynı sınıftan olmalı. Sınıf listesi yoksa üyelik doğrulanamaz → red (boş liste 'herkes' demek değildir).
    const liste = sinif?.ogrenciler;
    if (!Array.isArray(liste) || !liste.some((o) => o?.id === kim)) return reddet('kim');
    if (sinif?.ayarlar?.ziyaret === false) return reddet('ziyaret-kapali');
  } else {
    return reddet('rol');
  }

  let g = komut.gun === undefined || komut.gun === null ? bugun : komut.gun;
  if (g > bugun) return reddet('ileri-tarih');
  if (Object.is(g, -0)) g = 0;
  if (g < bugun - GECMIS_GUN) g = bugun - GECMIS_GUN;
  // Ziyaret taze okumayla, çevrimiçi yapılır: ziyaretçi komutu hep bugüne sayılır (geçmiş günle kota aşılamaz).
  if (rol === 'ziyaretci') g = bugun;

  const d = klon(durum);
  konuEsitleYerinde(d, sinif, bugun);
  const r = ISLEYICILER[komut.tur](d, komut.hedef, g, { rol, kim, bugun, sinif, komut });
  if (r.red) return reddet(r.red);

  // cihazSeq: en son kullanılan cihaz sona taşınır; CIHAZ_TAVAN aşılınca en uzun süre kullanılmayan düşer.
  // (Gizli sekme ya da silinen tarayıcı deposu her açılışta yeni cihaz kimliği üretir; sınırsız büyüyen harita
  // ciftlikDogrula'dan geçmez ve çiftlik bir daha yazılamazdı.) Düşen cihazın eski komutu yeniden gelse bile
  // hasat/yumurta gibi sayaç artıran işler durum denetimiyle ('hazir-degil', 'yumurta-yok') çift sayılmaz.
  const seqYeni = {};
  for (const [c, v] of Object.entries(d.cihazSeq || {})) {
    if (c !== cihaz && CIHAZ_DESEN.test(c) && Number.isInteger(v)) seqYeni[c] = v;
  }
  seqYeni[cihaz] = seq;
  const cihazlar = Object.keys(seqYeni);
  for (let i = 0; i < cihazlar.length - CIHAZ_TAVAN; i++) delete seqYeni[cihazlar[i]];
  d.cihazSeq = seqYeni;
  d.surum = (Number.isInteger(d.surum) ? d.surum : 0) + 1;
  // Gün kümeleri 120 günden eskiyse özete iner: belge yıllarca oynansa da 64 KB sınırına yaklaşmaz.
  sikistirYerinde(d, bugun);
  if (bayt(d) > SINIR.ciftlik) return reddet('boyut');
  return { durum: d, sonuc: 'tamam' };
}

/** Komut listesini sırayla uygular (sunucu gövdesi ve istemci kuyruğu için). */
export function uygulaHepsi(durum, komutlar, secenek) {
  let d = durum;
  const sonuclar = [];
  for (const k of komutlar) {
    const r = uygula(d, k, secenek);
    d = r.durum;
    sonuclar.push(r.sonuc);
  }
  return { durum: d, sonuclar };
}

// ------------------------------------------------------------------ özet (öğretmen paneli, iş listesi)

/** Parselin bugünkü görünüşü ve ihtiyaçları. */
export function parselDurum(parsel, bugun, sinif) {
  const t = toprakDurum(parsel);
  const ev = parsel?.bitki ? evre(parsel.bitki, bugun, sinif) : null;
  const ihtiyaclar = [];
  if (t.capaGerek) ihtiyaclar.push('capa');
  else if (t.ekilebilir) ihtiyaclar.push('ek');
  if (ev) ihtiyaclar.push(...ev.ihtiyaclar);
  return { ...t, evre: ev, ihtiyaclar };
}

/** Çiftliğin bugünkü özeti: {konuTur, konuEvre, ihtiyaclar:['konu:sula', ...], sonGun}. Ad yok. */
export function ciftlikOzet(durum, bugun, sinif) {
  const d = konuEsitle(durum, sinif, bugun);
  const ihtiyaclar = [];
  let konuEvre = null, konuTur = null;
  for (const p of PARSELLER) {
    if (p === 'konu' && !sinif?.konu) continue;
    const pd = parselDurum(d.parseller[p], bugun, sinif);
    if (p === 'konu' && pd.evre) { konuEvre = pd.evre.no; konuTur = pd.evre.tur; }
    for (const x of pd.ihtiyaclar) ihtiyaclar.push(`${p}:${x}`);
  }
  if (dedeEvre(d, bugun, sinif).hasatHazir) ihtiyaclar.push('dede:hasat');
  for (const x of kumesDurum(d.kumes, bugun, sinif, d.sahip).ihtiyaclar) ihtiyaclar.push(`kumes:${x}`);

  // Sahibin son etkinlik günü (gün hassasiyetinde).
  let son = null;
  const al = (x) => { if (Number.isInteger(x) && x <= bugun && (son === null || x > son)) son = x; };
  for (const p of PARSELLER) {
    const x = d.parseller[p];
    if (x.capaGun !== x.konuBas) al(x.capaGun);
    const b = x.bitki;
    if (b) { al(b.ekimGun); al(sonGun(b.su, b.ozet?.su, bugun)); al(b.otAyiklama); al(b.isler?.destek); al(sonGun(b.hasat, b.ozet?.hasat, bugun)); }
  }
  al(sonGun(d.dede.hasat, d.dede.ozet?.hasat, bugun));
  al(sonGun(d.kumes.yem, d.kumes.ozet?.yem, bugun));
  al(sonGun(d.kumes.su, d.kumes.ozet?.su, bugun));
  if (d.kumes.sonToplama !== d.olusturmaGun) al(d.kumes.sonToplama);
  return { konuTur, konuEvre, ihtiyaclar, sonGun: son };
}

/* Çiftçi Fare — sınıf belgesi kuralları (SAF): yeni sınıf, öğretmen yaması, kimlik üretimi.
   İstemci (depo.js: yerelTasima) ve sunucu (sunucu/isleyiciler.mjs) AYNI kuralı kullanır.
   İçinde DOM, 3B kitaplığı ve saat yok; rastgelelik crypto.getRandomValues'tan (tarayıcı, node, Worker). */
import {
  SEMA, SEMBOLLER, RENKLER, YAS_GRUPLARI, TAKVIMLER, KONU_TURLERI, UNITE_GUNLERI, VARSAYILAN_UNITE, SINIR
} from './turler.js';
import { OID_DESEN } from './dogrula.js';
import { klon } from './sema.js';
import { tzGecerli, VARSAYILAN_TZ } from './zaman.js';

/* ——————————————————————————————— kimlikler ——————————————————————————————— */

export const KUCUK = 'abcdefghijklmnopqrstuvwxyz0123456789';
const BUYUK = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // karışan I/O/0/1 yok
export function rastgele(n, abece) {
  const a = new Uint32Array(n);
  globalThis.crypto.getRandomValues(a);   // tarayıcı, node ≥19 ve Worker'da hep var; zayıf yedeğe düşülmez
  let s = '';
  for (let i = 0; i < n; i++) s += abece[a[i] % abece.length];
  return s;
}
export const yeniCihazId = () => 'c_' + rastgele(8, KUCUK);
export const yeniOid = () => 'o_' + rastgele(8, KUCUK);
export const yeniSinifKod = () => rastgele(6, BUYUK);

/* ——————————————————————————————— sınıf ——————————————————————————————— */

/** Kurulum ayarından yeni sınıf belgesi (ad YOK). Öğrencilere sembol ve renk sırayla verilir. */
export function yeniSinif({
  kod = yeniSinifKod(), bugun, tz, takvim = 'okul-gunleri', tahtaIs = 2, ziyaret = true,
  konu = null, uniteGun = VARSAYILAN_UNITE, ogrenciSayisi = 20, yas = '3-4', ogrenciler = null
} = {}) {
  if (!Number.isInteger(bugun)) throw new TypeError('yeniSinif: bugun gerekli');
  const n = Math.max(1, Math.min(SINIR.ogrenci, Math.floor(ogrenciSayisi) || 1));
  const liste = ogrenciler || Array.from({ length: n }, (_, i) => ({
    id: yeniOid(), sembol: SEMBOLLER[i], renk: RENKLER[i % RENKLER.length], yas: YAS_GRUPLARI.includes(yas) ? yas : '3-4'
  }));
  return {
    sema: SEMA,
    kod,
    olusturmaGun: bugun,
    ayarlar: {
      tz: tzGecerli(tz) ? tz : VARSAYILAN_TZ,
      takvim: TAKVIMLER.includes(takvim) ? takvim : 'okul-gunleri',
      tahtaIs: tahtaIs === 3 ? 3 : 2,
      ziyaret: ziyaret !== false
    },
    konu: KONU_TURLERI.includes(konu)
      ? { tur: konu, basGun: bugun, uniteGun: UNITE_GUNLERI.includes(uniteGun) ? uniteGun : VARSAYILAN_UNITE }
      : null,
    eskiKonular: [],
    donmalar: [],
    ogrenciler: liste
  };
}

/**
 * Sınıf yaması (saf; yerelTasima ve 1c sunucusu aynı kuralı kullanır). Yeni belge döner.
 * yama: {ayarlar?: {takvim, tahtaIs, ziyaret, tz}, konu?: {tur, uniteGun} | null,
 *        ogrenciEkle?: [{sembol?, renk?, yas?}], ogrenciCikar?: [oid], ogrenciGuncelle?: [{id, sembol?, renk?, yas?}]}
 * Konu değişince eski konu eskiKonular'a geçer; yeni konunun başlangıcı bugündür.
 */
export function sinifYamala(sinif, yama = {}, bugun) {
  const s = klon(sinif);
  const a = yama.ayarlar;
  if (a && typeof a === 'object') {
    if (TAKVIMLER.includes(a.takvim)) s.ayarlar.takvim = a.takvim;
    if (a.tahtaIs === 2 || a.tahtaIs === 3) s.ayarlar.tahtaIs = a.tahtaIs;
    if (typeof a.ziyaret === 'boolean') s.ayarlar.ziyaret = a.ziyaret;
    if (tzGecerli(a.tz)) s.ayarlar.tz = a.tz;
  }
  if ('konu' in yama) {
    const k = yama.konu;
    const eski = s.konu;
    if (k === null) {
      if (eski) s.eskiKonular = [...(s.eskiKonular || []), eski].slice(-40);
      s.konu = null;
    } else if (k && KONU_TURLERI.includes(k.tur)) {
      const unite = UNITE_GUNLERI.includes(k.uniteGun) ? k.uniteGun : (eski?.uniteGun ?? VARSAYILAN_UNITE);
      if (!eski || eski.tur !== k.tur) {
        if (eski) s.eskiKonular = [...(s.eskiKonular || []), eski].slice(-40);
        s.konu = { tur: k.tur, basGun: Number.isInteger(k.basGun) ? k.basGun : bugun, uniteGun: unite };
      } else {
        s.konu = { ...eski, uniteGun: unite };   // aynı tür: yalnız süre değişir, bitki yerinde kalır
      }
    }
  }
  const cikar = new Set(Array.isArray(yama.ogrenciCikar) ? yama.ogrenciCikar : []);
  if (cikar.size) s.ogrenciler = s.ogrenciler.filter(o => !cikar.has(o.id));
  for (const g of Array.isArray(yama.ogrenciGuncelle) ? yama.ogrenciGuncelle : []) {
    const o = s.ogrenciler.find(x => x.id === g?.id);
    if (!o) continue;
    if (YAS_GRUPLARI.includes(g.yas)) o.yas = g.yas;
    if (RENKLER.includes(g.renk)) o.renk = g.renk;
    if (SEMBOLLER.includes(g.sembol) && !s.ogrenciler.some(x => x !== o && x.sembol === g.sembol)) o.sembol = g.sembol;
  }
  for (const e of Array.isArray(yama.ogrenciEkle) ? yama.ogrenciEkle : []) {
    if (s.ogrenciler.length >= SINIR.ogrenci) break;
    const kullanilan = new Set(s.ogrenciler.map(o => o.sembol));
    const sembol = SEMBOLLER.includes(e?.sembol) && !kullanilan.has(e.sembol) ? e.sembol : SEMBOLLER.find(x => !kullanilan.has(x));
    if (!sembol) break;
    const renk = RENKLER.includes(e?.renk) ? e.renk : RENKLER[SEMBOLLER.indexOf(sembol) % RENKLER.length];
    s.ogrenciler.push({ id: OID_DESEN.test(e?.id || '') ? e.id : yeniOid(), sembol, renk, yas: YAS_GRUPLARI.includes(e?.yas) ? e.yas : '3-4' });
  }
  return s;
}


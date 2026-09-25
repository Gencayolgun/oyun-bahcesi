/* Çiftçi Fare — anlatım (anlatim.js): kayıtlı insan sesi + ekran okuyucu.

   anlat('ciftlik-istem-sula'):
   1) Cümleyi (metinler.js) görünmez bir aria-live alanına yazar: ekran okuyucu okur.
   2) ses/anlatim/<kod>.mp3 KAYITLIYSA çalar; yoksa sessiz kalır, hata vermez.
      Robotik (sentez) ses yok: plan, "Kullanıcının yapması gerekenler".

   Hangi kayıtların olduğu ses/anlatim/ciftlik.json listesinden okunur
   (scripts/seslendirme.mjs klasördeki ciftlik-*.mp3 dosyalarından yeniden
   yazar). Olmayan dosyayı denemek tarayıcıda 404 hatası (konsolda kırmızı
   satır) bıraktığı için oyun yalnız listedekileri ister.

   Ses ancak çocuğun ilk dokunuşundan sonra ve ses kısık değilse çalar
   (anlatimBagla({sesAcik})). Yeni anlatım eskisini keser.

   Dışa açık:
     anlatimHazirla()          → Promise<Set> (liste bir kez okunur)
     anlatimBagla({kok, sesAcik}) aria-live alanını kurar, ses koşulunu bağlar
     anlat(kod)                → true: kayıt çalmaya başladı
     anlatimSustur()
     anlatimDurum()            → {son, calinan, mevcut} (sınama) */

import {metin} from './metinler.js';

export const ANLATIM_TABAN = 'ses/anlatim/';
export const ANLATIM_LISTE = 'ses/anlatim/ciftlik.json';
const KOD_DESEN = /^ciftlik-[A-Za-z0-9-]+$/;

let mevcut = null;               // Set<kod> | null (liste henüz okunmadı)
let hazirlik = null;
let calan = null;
let canli = null;
let sesAcik = () => true;
const kayit = { son: null, calinan: [] };

/** Kayıt listesini bir kez okur. Liste yoksa ya da bozuksa: hiç kayıt yok (sessiz). */
export function anlatimHazirla({ getir = globalThis.fetch?.bind(globalThis) } = {}) {
  if (hazirlik) return hazirlik;
  hazirlik = (async () => {
    try {
      if (!getir) return new Set();
      const r = await getir(ANLATIM_LISTE, { cache: 'no-cache' });
      if (!r.ok) return new Set();
      const j = await r.json();
      const l = Array.isArray(j) ? j : Array.isArray(j?.kodlar) ? j.kodlar : [];
      return new Set(l.filter(k => typeof k === 'string' && KOD_DESEN.test(k)));
    } catch { return new Set(); }
  })().then(s => (mevcut = s));
  return hazirlik;
}

/**
 * @param kok      aria-live alanının konacağı kap (çiftlik sayfası)
 * @param sesAcik  () => boolean: çocuk dokundu mu ve ses kısık değil mi
 */
export function anlatimBagla({ kok = null, sesAcik: f = null } = {}) {
  if (typeof f === 'function') sesAcik = f;
  if (kok && !canli?.isConnected) {
    canli = kok.ownerDocument.createElement('p');
    canli.className = 'anlatim-canli';
    canli.setAttribute('aria-live', 'polite');
    canli.setAttribute('role', 'status');
    kok.append(canli);
  }
  return canli;
}

/** Cümleyi duyurur; kayıt varsa çalar. */
export function anlat(kod) {
  if (typeof kod !== 'string' || !KOD_DESEN.test(kod)) return false;
  kayit.son = kod;
  const m = metin(kod);
  if (canli && m) canli.textContent = m;
  if (!mevcut?.has(kod)) return false;
  let acik = false;
  try { acik = !!sesAcik(); } catch {}
  if (!acik || typeof Audio !== 'function') return false;
  anlatimSustur();
  try {
    const a = new Audio(ANLATIM_TABAN + kod + '.mp3');
    calan = a;
    kayit.calinan.push(kod);
    a.play()?.catch?.(() => {});                    // otomatik çalma engeli: sessiz geç
    return true;
  } catch { return false; }
}

export function anlatimSustur() {
  try { calan?.pause(); } catch {}
  calan = null;
}

export const anlatimDurum = () => ({ son: kayit.son, calinan: [...kayit.calinan], mevcut: mevcut ? [...mevcut] : null });

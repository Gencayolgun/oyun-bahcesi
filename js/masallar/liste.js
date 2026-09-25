import karinca from './karinca.js';
import tavsan from './tavsan.js';
import aslan from './aslan.js';

/* Her masal kendi dosyasında. Biri bozuksa (yarım kalmış, sözdizimi hatalı)
   yalnız o atlanır; uygulamanın geri kalanı açılmaya devam eder. */
const yukle = async ad => {
  try { return (await import(`./${ad}.js`)).default; }
  catch (hata) { console.warn(`[masal] ${ad}.js yüklenemedi, atlandı:`, hata); return null; }
};

/* Masal defteri. Her masal 40 dakikalık, senaryolu, kendi kadrosu ve
   dünyası olan tam bir oyundur. Kaynaklar kamu malı; metinler bize ait.
   Henüz yazılmamış (null) masal listeye girmez. */
const yeniler = await Promise.all(['gunes', 'guvercin', 'leylek', 'keci', 'sehirfaresi', 'coban', 'uzum'].map(yukle));
export const MASALLAR = [karinca, tavsan, aslan, ...yeniler].filter(m => m && m.bolumler?.length);
export const masalBul = kod => MASALLAR.find(m => m.kod === kod) || MASALLAR[0];

import yolculuk from './yolculuk.js';
import yaris from './yaris.js';
import kurtarma from './kurtarma.js';

/* Her masal kendi dosyasında. Biri bozuksa (yarım kalmış, sözdizimi hatalı)
   yalnız o atlanır; uygulamanın geri kalanı açılmaya devam eder. */
const yukle = async ad => {
  try { return (await import(`./${ad}.js`)).default; }
  catch (hata) { console.warn(`[masal] ${ad}.js yüklenemedi, atlandı:`, hata); return null; }
};

/* Kurgu defteri. Her masal kendi kurgusunu seçer; aynı motorun teması
   değil, ayrı bir oyun olur. Taslak (null) kurgular kayda girmez. */
const yeniler = await Promise.all(['yarisma', 'karsilik', 'konukluk', 'uzlasma', 'karsilastirma', 'guven', 'deneme'].map(yukle));
export const KURGULAR = Object.fromEntries([yolculuk, yaris, kurtarma, ...yeniler].filter(Boolean).map(k => [k.kod, k]));

/* Her masal kendi dosyasında. Biri bozuksa (yarım kalmış, sözdizimi hatalı)
   yalnız o atlanır; uygulamanın geri kalanı açılmaya devam eder. */
const yukle = async ad => {
  try { return (await import(`./${ad}.js`)).default; }
  catch (hata) { console.warn(`[masal] ${ad}.js yüklenemedi, atlandı:`, hata); return null; }
};

/* Masalların ek ikonları. Aynı ad iki masalda olmasın: ad önüne masal kodu gelir. */
export const EK_CIZIMLER = Object.assign({}, ...(await Promise.all(['gunes', 'guvercin', 'leylek', 'keci', 'sehirfaresi', 'coban', 'uzum'].map(yukle))).filter(Boolean));

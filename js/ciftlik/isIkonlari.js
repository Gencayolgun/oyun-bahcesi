/* Çiftçi Fare — iş ikonları (isIkonlari.js): ALET + EYLEM.

   Okuma bilmeyen çocuk için istem, iş şeridi, dünya balonları ve 'Günü
   bitir' düğmesi YALNIZ bu resimlerle konuşur (adları aria-label'da).
   Her ikon bir aleti ve yaptığı işi birlikte gösterir: çapa + uçan kesek,
   kese + düşen tohum, kova + su damlaları, el + kökleriyle ot...
   120×120, kalın koyu çizgi, düz renk; degrade/desen/url(#) ve yazı yok. */

const C = '#33403a';
const G = g => `<g stroke="${C}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round">${g}</g>`;
const toprak = '<path d="M8 104q52-14 104 0v10H8z" fill="#7a5236"/>';
const damla = (x, y, s = 1) => `<path d="M${x} ${y}q${-7 * s} ${10 * s} 0 ${15 * s}q${7 * s}-${5 * s} 0-${15 * s}z" fill="#4fa3d6"/>`;

/* Tohum rozetleri (ekim ve hasat ikonlarının köşesinde, hangi bitki olduğunu gösterir). */
const TOHUM = {
  ceviz: '<ellipse cx="98" cy="24" rx="15" ry="13" fill="#8d6a3f"/><path d="M98 12v24M88 20q10 4 20 0M88 30q10-4 20 0" fill="none" stroke-width="2.5"/>',
  bugday: '<path d="M98 42V10" fill="none" stroke="#c89b3c" stroke-width="4"/><path d="M98 14q-8 2-8 8 8 0 8-8zm0 0q8 2 8 8-8 0-8-8zm0 10q-8 2-8 8 8 0 8-8zm0 0q8 2 8 8-8 0-8-8z" fill="#e4c267"/>',
  domates: '<circle cx="98" cy="26" r="15" fill="#d8352a"/><path d="M98 12l3 7 7-3-4 7 6 3-8 1" fill="#3f7a2e" stroke-width="2"/>'
};

export const IS_IKONLARI = {
  capa: () => G(toprak +
    '<path d="M28 18l52 62" stroke="#a9804f" stroke-width="9"/><path d="M28 18l52 62" fill="none" stroke-width="2.5"/>' +
    '<path d="M70 66l26-6 4 14-24 10z" fill="#9aa4a8"/>' +
    '<path d="M44 96l-10-8m26 6 4-12m18 12 12-6" fill="none" stroke="#7a5236" stroke-width="6"/>' +
    '<circle cx="30" cy="84" r="5" fill="#7a5236"/><circle cx="94" cy="86" r="5" fill="#7a5236"/>'),
  ek: (bitki) => G(toprak +
    '<path d="M24 58q-10-30 18-36l12 4 12-4q24 8 16 36-4 14-28 14T24 58z" fill="#d7b27a"/>' +
    '<path d="M40 26q14 8 28 0" fill="none" stroke="#9c6a3a" stroke-width="5"/>' +
    '<path d="M54 72l-4 12m10-10 4 12m-16 4-2 8" fill="none" stroke-width="3"/>' +
    '<ellipse cx="48" cy="92" rx="5" ry="3.5" fill="#8d6a3f"/><ellipse cx="66" cy="90" rx="5" ry="3.5" fill="#8d6a3f"/>' +
    (TOHUM[bitki] || '')),
  sula: () => G(toprak +
    '<path d="M22 44h52v40q0 10-10 10H32q-10 0-10-10z" fill="#5aa6d8"/>' +
    '<path d="M74 54l28-22 6 6-26 26" fill="#5aa6d8"/><path d="M98 30l12-6 4 12-10 2z" fill="#3f86b8"/>' +
    '<path d="M30 44q18-24 36 0" fill="none" stroke="#3f86b8" stroke-width="6"/>') +
    damla(104, 48) + damla(94, 66, .8) + damla(110, 70, .7),
  ziyaretSula: () => IS_IKONLARI.sula(),
  ot: () => G(toprak +
    '<path d="M58 70q-18-30-6-44m6 44q2-34 18-40m-18 40q-22-10-30-2" fill="none" stroke="#5b983a" stroke-width="6"/>' +
    '<path d="M50 30q-8 10 2 14 8-6-2-14zm28 2q-8 10 2 14 8-6-2-14z" fill="#6aac3c"/>' +
    '<path d="M58 70v22m0-8-8 12m8-6 8 10" fill="none" stroke="#e6d8b0" stroke-width="4"/>' +
    '<path d="M40 70q2-14 16-12l20 2q10 2 8 12l-6 12H44z" fill="#f1c7a4"/>'),
  destek: () => G(toprak +
    '<path d="M50 104V30" stroke="#a9804f" stroke-width="10"/><path d="M50 104V30" fill="none" stroke-width="2.5"/>' +
    '<path d="M50 30l-5-8h10z" fill="#a9804f"/>' +
    '<path d="M50 70q14-6 20 6" fill="none" stroke="#5c9a41" stroke-width="5"/><path d="M62 60q12-10 20 0-10 8-20 0z" fill="#6fae4c"/>' +
    '<path d="M76 16l22 22" stroke="#8a6534" stroke-width="7"/><rect x="62" y="6" width="26" height="16" rx="4" transform="rotate(45 75 14)" fill="#b88a5a"/>'),
  hasat: (bitki) => {
    if (bitki === 'bugday') return G(
      '<path d="M40 104V40m12 64V34m12 70V42" fill="none" stroke="#c89b3c" stroke-width="5"/>' +
      '<path d="M40 40q-7-10 0-22 7 12 0 22zm12-6q-7-10 0-22 7 12 0 22zm12 8q-7-10 0-22 7 12 0 22z" fill="#e4c267"/>' +
      '<path d="M86 30q-26 8-24 38" fill="none" stroke="#9aa4a8" stroke-width="8"/><path d="M86 30q-26 8-24 38" fill="none" stroke-width="2.5"/>' +
      '<path d="M84 30l20 36" stroke="#8a6534" stroke-width="8"/>');
    if (bitki === 'domates') return G(
      '<path d="M18 62h84l-8 42H26z" fill="#c9954f"/><path d="M22 76h76M26 90h68" fill="none" stroke="#9c6a3a" stroke-width="3"/>' +
      '<circle cx="46" cy="54" r="15" fill="#d8352a"/><circle cx="74" cy="52" r="15" fill="#d8352a"/><circle cx="60" cy="42" r="14" fill="#e0493a"/>' +
      '<path d="M60 30l3 5 6-2-3 5 5 3-7 1M46 41l3 4 5-1-3 4" fill="#3f7a2e" stroke-width="2"/>');
    // Dede Ceviz: ağacı silkele, sepete cevizler
    return G(
      '<path d="M18 62h84l-8 42H26z" fill="#c9954f"/><path d="M22 76h76M26 90h68" fill="none" stroke="#9c6a3a" stroke-width="3"/>' +
      '<ellipse cx="44" cy="56" rx="13" ry="11" fill="#8d6a3f"/><ellipse cx="72" cy="54" rx="13" ry="11" fill="#8d6a3f"/><ellipse cx="58" cy="44" rx="12" ry="10" fill="#b6c35e"/>' +
      '<path d="M58 34v20M44 46v20M72 44v20" fill="none" stroke="#6e4f2e" stroke-width="2.5"/>' +
      '<path d="M30 14q-8 6-2 14M92 14q8 6 2 14" fill="none" stroke="#6aac3c" stroke-width="5"/>');
  },
  yem: () => G(
    '<path d="M16 80h88l-10 24H26z" fill="#a9804f"/><path d="M22 80h76v6H22z" fill="#d9b45a" stroke="none"/>' +
    '<path d="M40 22l40 8-6 26-38-6z" fill="#b8c2c6"/><path d="M80 30l20-4" stroke="#8a6534" stroke-width="7"/>' +
    '<circle cx="44" cy="62" r="3.5" fill="#e6c46a"/><circle cx="52" cy="70" r="3.5" fill="#e6c46a"/><circle cx="40" cy="74" r="3.5" fill="#e6c46a"/><circle cx="58" cy="60" r="3.5" fill="#e6c46a"/>'),
  suluk: () => G(
    '<path d="M14 84h92l-8 20H22z" fill="#9fb1b8"/><path d="M22 86h76v6H22z" fill="#4fa3d6" stroke="none"/>' +
    '<path d="M48 18h40l-6 40H54z" fill="#b8c2c6"/><path d="M52 20q16-14 32 0" fill="none" stroke-width="4"/>' +
    '<path d="M50 50l-14 12" stroke="#4fa3d6" stroke-width="9"/>') + damla(34, 66, .9),
  yumurta: () => G(
    '<path d="M14 64h92l-10 40H24z" fill="#c9954f"/><path d="M18 78h84M22 92h76" fill="none" stroke="#9c6a3a" stroke-width="3"/>' +
    '<path d="M24 64q36-60 72 0" fill="none" stroke="#9c6a3a" stroke-width="6"/>' +
    '<ellipse cx="44" cy="58" rx="12" ry="15" fill="#f5ecdc"/><ellipse cx="62" cy="54" rx="12" ry="15" fill="#e2c29a"/><ellipse cx="80" cy="58" rx="12" ry="15" fill="#f5ecdc"/>'),
  /* Çıkartma bırak (misafir): kapı panosu + üstünde bir çıkartma. Yıldız çıkartmasıyla karışmasın diye pano çizilir. */
  hediye: () => G(
    '<path d="M28 104V80M92 104V80" fill="none" stroke="#8a6534" stroke-width="7"/>' +
    '<rect x="12" y="32" width="96" height="54" rx="6" fill="#9c6a3a"/><rect x="21" y="40" width="78" height="38" rx="4" fill="#e6c98f"/>' +
    '<path d="M6 34 60 12l54 22z" fill="#e0683c"/>' +
    '<circle cx="60" cy="59" r="16" fill="#fffdf4" stroke-width="2.5"/>' +
    '<path d="M60 70C49 63 46 56 50 52 54 48 58 51 60 54 62 51 66 48 70 52 74 56 71 63 60 70Z" fill="#e2453c" stroke-width="2.5"/>'),
  /* Hayvan sev (misafir; durumu değiştirmez): tavuğun başını okşayan el + kalp. */
  sev: () => G(
    '<path d="M58 40q4-14 12-5 5-11 13-2 7-6 10 6" fill="#e2453c" stroke-width="3"/>' +
    '<circle cx="74" cy="64" r="26" fill="#f3ecdc"/>' +
    '<path d="M98 62l14 6-14 6z" fill="#f2a13a"/><path d="M96 78q3 12-6 12-4-6 0-12z" fill="#e2453c" stroke-width="3"/>' +
    '<circle cx="84" cy="57" r="3.5" fill="#33403a"/>' +
    '<path d="M10 70q2-16 18-18l24 2q10 2 8 12l-8 10H18z" fill="#f1c7a4"/>' +
    '<path d="M34 30C22 22 20 14 25 10 29 7 33 10 34 13 35 10 39 7 43 10 48 14 46 22 34 30Z" fill="#e2453c" stroke-width="2.5"/>'),
  ziyaret: () => G(
    '<circle cx="30" cy="44" r="12" fill="#a98463"/><circle cx="58" cy="44" r="12" fill="#a98463"/><circle cx="44" cy="66" r="24" fill="#a98463"/>' +
    '<circle cx="66" cy="50" r="10" fill="#8e6d52"/><circle cx="90" cy="50" r="10" fill="#8e6d52"/><circle cx="78" cy="70" r="21" fill="#8e6d52"/>' +
    '<circle cx="38" cy="64" r="3" fill="#33403a"/><circle cx="50" cy="64" r="3" fill="#33403a"/><circle cx="72" cy="68" r="3" fill="#33403a"/><circle cx="84" cy="68" r="3" fill="#33403a"/>' +
    '<path d="M8 104h104" stroke="#8a6534" stroke-width="6"/>')
};

/* Ekranda işin adı yok; aria-label için Türkçe adlar (ses kaydı gelene kadar öğretmen okur). */
export const IS_ADLARI = {
  capa: 'Toprağı çapala', ek: 'Tohum ek', sula: 'Sula', ziyaretSula: 'Arkadaşının bitkisini sula', ot: 'Otları ayıkla',
  destek: 'Destek çubuğu çak', hasat: 'Hasat et', yem: 'Tavukları besle', suluk: 'Suluğu doldur',
  yumurta: 'Yumurtaları topla', hediye: 'Çıkartma bırak', ziyaret: 'Arkadaşını ziyaret et', sev: 'Tavukları sev'
};

/** İşin SVG'si: is = {tur, bitki?}. */
export function isSvg(is, { boy } = {}) {
  const f = IS_IKONLARI[is?.tur];
  const govde = f ? f(is.bitki) : '<circle cx="60" cy="60" r="36" fill="#e7e2d4"/>';
  const olcu = boy ? ` width="${boy}" height="${boy}"` : '';
  return `<svg viewBox="0 0 120 120"${olcu} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${govde}</svg>`;
}
export const isAdi = is => IS_ADLARI[is?.tur] || 'İş';

/* Düğme simgeleri */
export const GUNU_BITIR_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${G(
  '<path d="M60 14 12 54h14v50h68V54h14z" fill="#f3e7cc"/><path d="M12 54 60 14l48 40" fill="none" stroke="#c2553c" stroke-width="10"/>' +
  '<path d="M50 104V76h20v28z" fill="#8a5a36"/><path d="M78 30h12v18L78 38z" fill="#b46a4c"/>' +
  '<circle cx="90" cy="84" r="18" fill="#f6c12d"/><path d="M84 76q14 2 8 18-10-4-8-18z" fill="#fff8d8" stroke="none"/>')}</svg>`;
export const DISLI_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3m0 13v3M4.6 4.6l2.1 2.1m10.6 10.6 2.1 2.1M2.5 12h3m13 0h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/><circle cx="12" cy="12" r="6.6"/></svg>';
/* Sabah sürprizi balonu: soru işareti (çizim; yazı değil) + filiz. */
export const SURPRIZ_SVG = `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${G(
  '<path d="M40 44q0-24 22-24t22 20q0 12-12 18-10 5-10 16v6" fill="none" stroke="#f2a13a" stroke-width="15"/>' +
  '<path d="M40 44q0-24 22-24t22 20q0 12-12 18-10 5-10 16v6" fill="none" stroke-width="3"/>' +
  '<circle cx="62" cy="98" r="9" fill="#f2a13a"/>')}</svg>`;

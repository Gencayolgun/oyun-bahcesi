/* Şehir Faresi ile Tarla Faresi için ek ikonlar — ad → 120×120 SVG gövdesi (bkz. ikon.js).
   Her ad 'sehirfaresi-' ile başlar. Mevcut çizimlerle (in, basak, kus, tas…)
   karşılanamayanlar burada: iki dünyanın yiyecekleri, eşyaları ve yerleri. */

const e = (x, y, rx, ry, renk, ek = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${renk}" ${ek}/>`;

/* Arpa: buğdaydan (basak) farkı uzun kılçıkları. */
const arpa = '<path d="M60 114V52" stroke="#b98d3f" stroke-width="6" stroke-linecap="round"/>' +
  [0, 1, 2, 3].map(i => {
    const y = 44 + i * 16;
    return e(50, y + 6, 8, 11, '#e7c168', `transform="rotate(-22 50 ${y + 6})"`) +
           e(70, y + 6, 8, 11, '#f0d488', `transform="rotate(22 70 ${y + 6})"`) +
           `<path d="M47 ${y - 4}L30 ${y - 30}M73 ${y - 4}L90 ${y - 30}" stroke="#d9b45e" stroke-width="2.4" stroke-linecap="round"/>`;
  }).join('') + e(60, 36, 7, 11, '#f3dc98') + '<path d="M60 26V4" stroke="#d9b45e" stroke-width="2.4" stroke-linecap="round"/>';

const peynir = '<path d="M14 82 94 40 108 58 108 96 14 96Z" fill="#e9b640"/><path d="M14 82 94 40 108 58 28 90Z" fill="#f7d36b"/>' +
  '<path d="M14 82h94v14H14z" fill="#e0a632"/>' +
  e(52, 76, 7, 4, '#d69a2a') + e(80, 66, 5, 3, '#d69a2a') + e(40, 90, 5, 3.5, '#c98e22') + e(74, 88, 7, 4, '#c98e22') + e(98, 84, 4, 5, '#c98e22');

/* Sıralama görevi için dört boy peynir. */
const boyPeynir = n => { const s = .4 + n * .15; return `<g transform="translate(${60 * (1 - s)} ${104 * (1 - s)}) scale(${s})">${peynir}</g>`; };

export default {
  'sehirfaresi-arpa': arpa,

  'sehirfaresi-kok': '<path d="M60 44q-18-26-30-24 4 18 26 28M60 44q2-30 14-36 6 20-10 38M62 46q20-22 34-18-8 18-30 22" fill="#6fae5a"/>' +
    '<path d="M42 46q18-8 38 0-2 30-18 64-4 4-6 0-16-30-14-64z" fill="#e89a4f"/>' +
    '<path d="M48 60h12M56 74h12M52 88h10" stroke="#c9763a" stroke-width="3" stroke-linecap="round"/>',

  /* Gelincik: tarlanın kırmızı çiçeği. */
  'sehirfaresi-cicek': '<path d="M60 112V60" stroke="#5f9a52" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M60 92q-18-6-24-20 16-2 24 14" fill="#78b163"/>' +
    '<circle cx="42" cy="46" r="20" fill="#e2503f"/><circle cx="78" cy="46" r="20" fill="#ea6250"/>' +
    '<circle cx="60" cy="30" r="20" fill="#ef7563"/><circle cx="60" cy="60" r="18" fill="#dd4636"/>' +
    '<circle cx="60" cy="46" r="9" fill="#2f2a2a"/><g fill="#2f2a2a"><circle cx="50" cy="38" r="2"/><circle cx="70" cy="38" r="2"/><circle cx="52" cy="56" r="2"/><circle cx="68" cy="56" r="2"/></g>',

  'sehirfaresi-peynir': peynir,
  'sehirfaresi-peynir1': boyPeynir(1), 'sehirfaresi-peynir2': boyPeynir(2),
  'sehirfaresi-peynir3': boyPeynir(3), 'sehirfaresi-peynir4': boyPeynir(4),

  'sehirfaresi-pasta': '<path d="M16 66 88 38 104 60 104 98 16 98Z" fill="#f3e6d2"/>' +
    '<path d="M16 66 88 38 104 60 30 80Z" fill="#fff8ee"/>' +
    '<path d="M16 80h88v6H16zM16 92h88v6H16z" fill="#e7849a"/>' +
    '<path d="M16 66q6 10 14 14 8-6 16 0 8-6 16 0 8-6 16 0 8-6 16 0 6-4 10-10" fill="#fff" stroke="#f1d7dd" stroke-width="2"/>' +
    '<circle cx="84" cy="34" r="11" fill="#d9404f"/><path d="M84 23q2-10 10-12" stroke="#5f9a52" stroke-width="3" fill="none"/>',

  'sehirfaresi-lokum': '<ellipse cx="60" cy="96" rx="48" ry="11" fill="#f4f1ea"/><ellipse cx="60" cy="93" rx="38" ry="6" fill="#e3ddd2"/>' +
    '<rect x="18" y="56" width="34" height="34" rx="8" fill="#ef8fae"/><rect x="46" y="44" width="34" height="46" rx="8" fill="#f6a8c0"/>' +
    '<rect x="74" y="58" width="30" height="32" rx="8" fill="#e97b9c"/>' +
    '<g fill="#fff" opacity=".9"><circle cx="28" cy="62" r="2.4"/><circle cx="40" cy="70" r="2"/><circle cx="56" cy="50" r="2.4"/>' +
    '<circle cx="70" cy="56" r="2"/><circle cx="62" cy="66" r="2.2"/><circle cx="84" cy="64" r="2.4"/><circle cx="94" cy="72" r="2"/><circle cx="32" cy="78" r="2"/></g>',

  'sehirfaresi-simit': '<circle cx="60" cy="62" r="40" fill="#c9803e"/><circle cx="60" cy="58" r="38" fill="#dd9a52"/>' +
    '<circle cx="60" cy="60" r="16" fill="#fbf6ea"/><circle cx="60" cy="60" r="16" fill="none" stroke="#b36e32" stroke-width="3"/>' +
    '<g fill="#f6e3b5">' + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => {
      const r = a * Math.PI / 180, d = i % 2 ? 24 : 32;
      return `<ellipse cx="${(60 + Math.cos(r) * d).toFixed(1)}" cy="${(58 + Math.sin(r) * d).toFixed(1)}" rx="3" ry="1.8" transform="rotate(${a} ${(60 + Math.cos(r) * d).toFixed(1)} ${(58 + Math.sin(r) * d).toFixed(1)})"/>`;
    }).join('') + '</g>',

  'sehirfaresi-mektup': '<rect x="14" y="30" width="92" height="64" rx="8" fill="#fbf4e3"/><rect x="14" y="30" width="92" height="64" rx="8" fill="none" stroke="#d9c9a6" stroke-width="3"/>' +
    '<path d="M16 36l44 32 44-32" fill="#efe2c4" stroke="#d9c9a6" stroke-width="3" stroke-linejoin="round"/>' +
    '<path d="M60 76C44 64 50 50 60 58 70 50 76 64 60 76" fill="#d9404f"/>',

  'sehirfaresi-lamba': '<path d="M58 112V40" stroke="#3f4a52" stroke-width="7" stroke-linecap="round"/><path d="M44 112h30" stroke="#3f4a52" stroke-width="7" stroke-linecap="round"/>' +
    '<circle cx="60" cy="34" r="30" fill="#ffe7a0" opacity=".45"/>' +
    '<path d="M44 20h32l-6 28H50z" fill="#ffd66e"/><path d="M40 20h40l-8-10H48z" fill="#3f4a52"/><path d="M48 48h24v6H48z" fill="#3f4a52"/>' +
    '<path d="M55 24v20M65 24v20" stroke="#e8b54a" stroke-width="2"/>',

  'sehirfaresi-ev': '<path d="M18 52 60 18 102 52Z" fill="#c9573f"/><rect x="24" y="50" width="72" height="58" fill="#f3dfc0"/>' +
    '<rect x="78" y="22" width="10" height="20" fill="#9c4a38"/>' +
    '<rect x="32" y="60" width="18" height="16" rx="2" fill="#ffd66e"/><rect x="70" y="60" width="18" height="16" rx="2" fill="#ffd66e"/>' +
    '<path d="M41 60v16M79 60v16M32 68h18M70 68h18" stroke="#c99a52" stroke-width="2"/>' +
    '<rect x="50" y="82" width="20" height="26" rx="9" fill="#6f8fb3"/><circle cx="65" cy="96" r="2" fill="#f3dfc0"/>',

  /* Masalın simgesi: solda tarla yuvası, sağda şehir evi, ortada bir yol. */
  'sehirfaresi-ikiev': '<path d="M4 108q0-40 26-40t26 40z" fill="#c9a86a"/><path d="M18 108v-14a12 12 0 0 1 24 0v14z" fill="#6b5638"/>' +
    '<path d="M10 70l6-16M22 66l2-18M34 68l4-16" stroke="#d9b45e" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M64 60 88 38 112 60Z" fill="#c9573f"/><rect x="68" y="58" width="40" height="50" fill="#f3dfc0"/>' +
    '<rect x="74" y="66" width="10" height="10" fill="#ffd66e"/><rect x="92" y="66" width="10" height="10" fill="#ffd66e"/><rect x="82" y="88" width="12" height="20" rx="5" fill="#6f8fb3"/>' +
    '<path d="M42 110q20-10 36 0" stroke="#e8dcc0" stroke-width="6" fill="none" stroke-linecap="round"/>',

  'sehirfaresi-cesme': '<ellipse cx="60" cy="96" rx="48" ry="14" fill="#a9b2ba"/><path d="M12 84h96v12H12z" fill="#bcc5cc"/><ellipse cx="60" cy="84" rx="48" ry="12" fill="#cfd6dc"/>' +
    '<ellipse cx="60" cy="84" rx="40" ry="8" fill="#6bbfc8"/><rect x="54" y="36" width="12" height="48" fill="#bcc5cc"/>' +
    '<ellipse cx="60" cy="38" rx="22" ry="7" fill="#cfd6dc"/>' +
    '<path d="M60 30q-18-14-28 16M60 30q18-14 28 16M60 30V8" stroke="#8ed3dc" stroke-width="4" fill="none" stroke-linecap="round"/>',

  'sehirfaresi-tabela': '<rect x="54" y="20" width="10" height="92" rx="4" fill="#a5794d"/>' +
    '<path d="M18 30h50v20H18l-10-10z" fill="#e0b054"/><path d="M52 58h52l10 10-10 10H52z" fill="#c9573f"/>' +
    '<path d="M24 40h30" stroke="#a37a2c" stroke-width="3" stroke-linecap="round"/><path d="M62 68h32" stroke="#8e3a2a" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M22 108h76" stroke="#8fae6a" stroke-width="6" stroke-linecap="round"/>',

  /* Çarpan kapı: aralık bir kapı ve "güm" çizgileri. */
  'sehirfaresi-kapi': '<rect x="26" y="12" width="68" height="100" rx="4" fill="#8e5a3a"/><path d="M34 20h40v88H34z" fill="#5a3a26"/>' +
    '<path d="M34 20l30 8v84l-30-4z" fill="#b8744a"/><path d="M40 34l18 5v26l-18-4zM40 72l18 4v24l-18-3z" fill="#c98556"/>' +
    '<circle cx="58" cy="70" r="3.4" fill="#efc54f"/>' +
    '<path d="M82 34l18-10M86 54h20M82 74l18 10" stroke="#d9714f" stroke-width="5" stroke-linecap="round"/>',

  'sehirfaresi-bavul': '<rect x="18" y="38" width="84" height="64" rx="10" fill="#b8744a"/><rect x="18" y="38" width="84" height="22" rx="10" fill="#c98556"/>' +
    '<path d="M44 38V26q0-6 6-6h20q6 0 6 6v12" fill="none" stroke="#7d4a2e" stroke-width="7"/>' +
    '<path d="M36 40v60M84 40v60" stroke="#e8c07a" stroke-width="6"/><rect x="54" y="56" width="12" height="10" rx="2" fill="#e8c07a"/>',

  'sehirfaresi-kopru': '<path d="M4 92q56-50 112 0" stroke="#a5794d" stroke-width="12" fill="none"/>' +
    '<path d="M10 86q50-40 100 0" stroke="#c9a06a" stroke-width="6" fill="none"/>' +
    '<path d="M24 76v18M42 64v28M60 60v32M78 64v28M96 76v18" stroke="#8e6a44" stroke-width="5"/>' +
    '<path d="M0 100q30 8 60 0t60 0v20H0z" fill="#6bbfc8"/>',

  'sehirfaresi-zil': '<path d="M60 16v10" stroke="#8a6a1f" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M30 84q2-54 30-58 28 4 30 58z" fill="#efc54f"/><path d="M40 70q4-30 18-36" stroke="#fbe6a0" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<rect x="22" y="82" width="76" height="10" rx="5" fill="#d9a93a"/><circle cx="60" cy="100" r="8" fill="#b8902b"/>' +
    '<path d="M14 50q-6 12 0 24M106 50q6 12 0 24M6 44q-8 18 0 36M114 44q8 18 0 36" stroke="#d9a93a" stroke-width="3" fill="none" stroke-linecap="round"/>',

  'sehirfaresi-kelebek': '<path d="M60 36v56" stroke="#4a3a33" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M58 54Q20 10 12 44q-4 22 46 20M62 54Q100 10 108 44q4 22-46 20" fill="#f0a64a"/>' +
    '<path d="M58 66Q24 70 26 92q6 14 32-16M62 66Q96 70 94 92q-6 14-32-16" fill="#e9854a"/>' +
    '<circle cx="30" cy="40" r="5" fill="#fff4dc"/><circle cx="90" cy="40" r="5" fill="#fff4dc"/>' +
    '<path d="M58 36q-8-14-16-18M62 36q8-14 16-18" stroke="#4a3a33" stroke-width="3" fill="none" stroke-linecap="round"/>',

  'sehirfaresi-tuy': '<path d="M26 104Q30 40 96 14Q96 70 26 104" fill="#b3bcc6"/><path d="M26 104Q48 60 90 22" stroke="#6f7b89" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<path d="M40 82l-10-8M50 70l-10-10M62 58l-8-12M74 46l-6-12M52 84l12 0M64 72l12-2M76 58l10-4" stroke="#8f9aa7" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M86 22Q96 30 96 14" fill="#86cfae"/><path d="M72 30q12-6 22-14q-2 14-10 22z" fill="#9d72b4" opacity=".75"/>'
};

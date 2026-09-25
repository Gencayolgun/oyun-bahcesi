/* İki Keçi için ek ikonlar — ad → 120×120 SVG gövdesi (bkz. ikon.js).
   Mevcut çizimler (su, tas, ot, kozalak, yuva, dal2…) önce kullanıldı;
   burada yalnız masala özgü olanlar var. */

const e = (x, y, rx, ry, f, ek = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${ek}/>`;
const keciYuzu = (x, y, kurk, bez, boynuz) =>
  `<path d="M${x - 7} ${y - 9}q-2-9-8-13M${x + 7} ${y - 9}q2-9 8-13" stroke="${boynuz}" stroke-width="4.5" stroke-linecap="round" fill="none"/>` +
  e(x - 13, y - 3, 8, 3.5, kurk, `transform="rotate(-15 ${x - 13} ${y - 3})"`) + e(x + 13, y - 3, 8, 3.5, kurk, `transform="rotate(15 ${x + 13} ${y - 3})"`) +
  `<path d="M${x} ${y - 12}c11 0 13 9 11 16-2 8-5 13-11 13s-9-5-11-13c-2-7 0-16 11-16z" fill="${kurk}"/>` +
  e(x, y + 12, 6, 4, bez) + `<path d="M${x - 4} ${y + 16}q4 10 4 10q0 0 4-10z" fill="${kurk}"/>` +
  `<rect x="${x - 8}" y="${y - 2}" width="5" height="2.4" rx="1.2" fill="#2b2622"/><rect x="${x + 3}" y="${y - 2}" width="5" height="2.4" rx="1.2" fill="#2b2622"/>`;

export default {
  /* Dar kütük köprü: iki yakanın arasında tek bir kütük. */
  'keci-kopru':
    '<path d="M0 80q15-6 30 0t30 0 30 0 30 0v40H0z" fill="#6bbfc8"/>' +
    '<path d="M10 94q9-4 18 0M50 104q9-4 18 0M88 94q9-4 18 0" stroke="#c5eff0" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<path d="M0 58q16-4 26 8l5 22H0z" fill="#a98357"/><path d="M0 56q16-4 26 8l-2 4Q12 60 0 64z" fill="#8fbc73"/>' +
    '<path d="M120 58q-16-4-26 8l-5 22h31z" fill="#a98357"/><path d="M120 56q-16-4-26 8l2 4q12-8 24-4z" fill="#8fbc73"/>' +
    '<rect x="10" y="60" width="100" height="16" rx="8" fill="#b58a5a"/>' +
    '<path d="M18 64h84" stroke="#d9b67f" stroke-width="3" stroke-linecap="round"/>' +
    e(12, 68, 6, 8, '#e5c692') + e(12, 68, 2.6, 3.6, '#b58a5a') +
    '<path d="M34 60V38M86 60V38" stroke="#8e6a45" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M34 42q26 10 52 0" stroke="#d8c08c" stroke-width="3.5" fill="none"/>',

  /* Papatya: Ak'ın yamacında biter. */
  'keci-cicek':
    '<path d="M60 108V62" stroke="#5f9a4d" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M60 92q-22-2-26-18q18-2 26 18M61 84q18-10 28-2q-12 12-28 2" fill="url(#leaf)"/>' +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => {
      const a = i / 12 * 360;
      return e(60, 22, 7, 17, '#ffffff', `transform="rotate(${a} 60 40)" stroke="#e6e0d2" stroke-width="1.2"`);
    }).join('') +
    e(60, 40, 12, 12, '#f2c14a') + e(56, 36, 5, 5, '#f8dc86'),

  /* Yonca: Kara'nın yamacında. Üç yürek yaprak. */
  'keci-yonca':
    '<path d="M60 108q2-26 0-50" stroke="#4f8f4f" stroke-width="6" stroke-linecap="round" fill="none"/>' +
    [0, 120, 240].map(a =>
      `<g transform="rotate(${a} 60 52)"><path d="M60 52C44 40 36 22 48 16C56 12 60 20 60 24C60 20 64 12 72 16C84 22 76 40 60 52Z" fill="url(#leaf)"/>` +
      `<path d="M60 50V26" stroke="#e7f3d4" stroke-width="2" opacity=".7"/></g>`).join('') +
    e(60, 52, 5, 5, '#3f7d45'),

  /* Kara'nın çanı. */
  'keci-can':
    '<path d="M28 26q32 20 64 0" stroke="#d65a4a" stroke-width="9" fill="none" stroke-linecap="round"/>' +
    '<rect x="54" y="30" width="12" height="12" rx="3" fill="#b98a2c"/>' +
    '<path d="M60 40c-20 0-26 18-26 34 0 10-6 14-6 18h64c0-4-6-8-6-18 0-16-6-34-26-34z" fill="#e8b84a"/>' +
    '<path d="M46 56q-4 14-4 30" stroke="#fbe1a0" stroke-width="5" stroke-linecap="round" opacity=".8"/>' +
    '<path d="M28 92h64" stroke="#b98a2c" stroke-width="5" stroke-linecap="round"/>' + e(60, 100, 8, 8, '#8a6420'),

  /* Kütük: köprüyü genişletmek için. */
  'keci-kutuk':
    '<path d="M22 44h72q14 0 14 22t-14 22H22z" fill="#a8764a"/>' +
    '<path d="M30 54h56M34 66h60M30 78h50" stroke="#8a5d36" stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
    e(22, 66, 14, 22, '#e5c692') + e(22, 66, 9, 15, 'none', 'stroke="#c49a62" stroke-width="2.4"') +
    e(22, 66, 4, 7, 'none', 'stroke="#c49a62" stroke-width="2.4"') +
    '<path d="M94 44q-4-12 6-16" stroke="#6b8f4a" stroke-width="4" fill="none" stroke-linecap="round"/>' + e(102, 26, 7, 4, '#8fbc73'),

  /* Tahta: yeni köprünün döşemesi. */
  'keci-tahta':
    '<g transform="rotate(-12 60 60)"><rect x="12" y="46" width="96" height="26" rx="5" fill="#d7a96c"/>' +
    '<path d="M18 54q30-4 60 0t26 0M18 64q24 4 50 0t36 2" stroke="#b5854c" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
    e(24, 59, 3, 3, '#8a6a44') + e(96, 59, 3, 3, '#8a6a44') + e(54, 60, 5, 3, '#b5854c', 'opacity=".6"') + '</g>',

  /* Kunduz barajı: dallardan örülü set, arkasında gölet. */
  'keci-baraj':
    '<path d="M0 50q30-8 60 0t60 0v20H0z" fill="#6bbfc8"/><path d="M14 56q10-4 20 0M76 58q10-4 20 0" stroke="#c5eff0" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M4 104q4-40 56-44q52 4 56 44z" fill="#8e6a45"/>' +
    '<g stroke="#6b4a2c" stroke-width="5" stroke-linecap="round">' +
    '<path d="M12 96l30-30M28 100l34-36M52 100l30-34M78 100l26-28M20 80l86 4M14 92l92 2"/></g>' +
    '<g stroke="#b58a5a" stroke-width="4" stroke-linecap="round"><path d="M36 74l40 8M60 66l30 22M24 88l30-10"/></g>',

  /* Yeni tabela: iki keçi yan yana. */
  'keci-yanyana':
    '<rect x="55" y="70" width="10" height="44" rx="4" fill="#8e6a45"/>' +
    '<rect x="10" y="16" width="100" height="62" rx="10" fill="#d7a96c"/><rect x="16" y="22" width="88" height="50" rx="7" fill="#f1dcb2"/>' +
    '<path d="M22 62h76" stroke="#b58a5a" stroke-width="4" stroke-linecap="round"/>' +
    keciYuzu(42, 42, '#ffffff', '#f0d8cf', '#cdb58c') + keciYuzu(78, 42, '#46434b', '#6a6570', '#a89a86')
};

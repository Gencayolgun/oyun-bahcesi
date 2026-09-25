/* Tilki ile Leylek için ek ikonlar — ad → 120×120 SVG gövdesi (bkz. ikon.js).

   Masalın asıl nesneleri kaplar: DÜZ TABAK (tilki ağzına uygun) ve UZUN,
   DAR AĞIZLI TESTİ (leylek gagasına uygun). İkisi ilk bakışta ayırt
   edilsin diye tabak hep yayvan ve açık renk, testi hep uzun ve kiremit
   renginde. Adların hepsi 'leylek-' ile başlar. */

const e = (x, y, rx, ry, renk, ek = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${renk}" ${ek}/>`;

/* Düz tabak: yayvan, sığ, kenarında mavi bir şerit. */
const tabak = (ic = '') =>
  e(60, 76, 52, 17, '#b9c7ce') + e(60, 70, 52, 17, '#f7f9fa') +
  e(60, 70, 46, 14, 'none', 'stroke="#7fb0c9" stroke-width="3"') +
  e(60, 71, 33, 9.5, '#e6ecef') + ic;

/* Testi: dar boyun, şişkin gövde, kulp, kiremit rengi. Ölçek tabanı sabit tutar. */
const testiGovde = '<path d="M71 26q22-2 22 22 0 10-8 16" fill="none" stroke="#a8552f" stroke-width="7" stroke-linecap="round"/>' +
  '<path d="M49 10h22v7q-4 2-4 7v14q0 5 9 12c14 10 20 24 18 38-2 15-10 22-17 25H43c-7-3-15-10-17-25-2-14 4-28 18-38 9-7 9-7 9-12V24q0-5-4-7z" fill="#cf7a4c"/>' +
  '<path d="M49 10h22v7H49z" fill="#b5623a"/>' +
  '<path d="M30 80h60M33 92h54" stroke="#f1d3a9" stroke-width="4" stroke-linecap="round"/>' +
  '<path d="M40 66q-6 14 0 30" stroke="#f0b38b" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>';
const testi = olcek => `<g transform="translate(${60 * (1 - olcek)} ${110 * (1 - olcek)}) scale(${olcek})"><g transform="translate(7.8 0) scale(.87 1)">${testiGovde}</g></g>`;

export default {
  'leylek-tabak': tabak(),
  'leylek-corba': tabak(e(60, 71, 31, 8.5, '#e9a24a') + e(52, 69, 9, 2.6, '#f4c378') +
    '<g fill="#6fae4e"><circle cx="46" cy="72" r="2.6"/><circle cx="68" cy="68" r="2.4"/><circle cx="74" cy="73" r="2"/></g>' +
    '<path d="M44 52q-7-9 0-17M60 50q-7-9 0-17M76 52q-7-9 0-17" stroke="#dfe6e8" stroke-width="4" fill="none" stroke-linecap="round"/>'),
  'leylek-testi': testi(1),
  'leylek-testi1': testi(.5),
  'leylek-testi2': testi(.66),
  'leylek-testi3': testi(.82),
  'leylek-testi4': testi(1),
  'leylek-kase': '<path d="M14 54h92q-2 42-46 44Q16 96 14 54z" fill="#6fa8c4"/>' + e(60, 54, 46, 12, '#8fc2d8') +
    e(60, 55, 39, 8, '#e9a24a') + '<rect x="44" y="94" width="32" height="9" rx="4" fill="#5a93ae"/>' +
    '<path d="M24 66q8 20 24 26" stroke="#b8dcea" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>',
  'leylek-kasik': '<g transform="rotate(-38 60 60)">' + e(60, 30, 16, 22, '#aeb6bd') + e(60, 29, 11, 16, '#dde2e6') +
    '<rect x="55.5" y="48" width="9" height="62" rx="4.5" fill="#9ea6ad"/><rect x="57.5" y="52" width="3" height="50" rx="1.5" fill="#c9cfd4"/></g>',
  'leylek-kepce': '<g transform="rotate(-24 60 60)"><rect x="56" y="6" width="8" height="66" rx="4" fill="#9ea6ad"/>' +
    '<path d="M28 72h64q0 30-32 30T28 72z" fill="#aeb6bd"/>' + e(60, 72, 32, 8, '#c9cfd4') + e(60, 73, 27, 5.5, '#e9a24a') + '</g>',
  'leylek-damla': '<path d="M60 12C50 38 26 52 26 76a34 34 0 0 0 68 0C94 52 70 36 60 12" fill="#e99a45"/>' +
    '<path d="M42 70q-8 20 8 26" stroke="#f8cf93" stroke-width="7" fill="none" stroke-linecap="round"/>' +
    '<circle cx="70" cy="84" r="4" fill="#6fae4e"/>',
  'leylek-tencere': '<path d="M44 34q-8-10 0-20M60 32q-8-10 0-20M76 34q-8-10 0-20" stroke="#dfe6e8" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M22 48h76v40q0 16-16 16H38q-16 0-16-16z" fill="#8b98a3"/>' +
    '<rect x="15" y="41" width="90" height="12" rx="6" fill="#aab6c0"/>' + e(60, 44, 40, 4, '#e9a24a') +
    '<rect x="4" y="58" width="20" height="8" rx="4" fill="#6f7c86"/><rect x="96" y="58" width="20" height="8" rx="4" fill="#6f7c86"/>' +
    '<path d="M30 62q2 26 18 32" stroke="#b7c2ca" stroke-width="4" fill="none" stroke-linecap="round"/>',
  'leylek-havuc': '<path d="M33 45Q47 33 62 46L94 101Q97 108 90 105L36 70Q20 58 33 45Z" fill="#ec8a3a"/>' +
    '<path d="M45 58l9 4M58 72l8 3M70 86l7 3" stroke="#c96a26" stroke-width="3.2" stroke-linecap="round"/>' +
    '<path d="M36 44Q18 26 24 12q12 10 16 28M42 40Q38 16 50 10q6 14-2 30M48 46q10-22 28-20-4 16-24 24" fill="#6fae4e"/>',
  'leylek-domates': e(60, 68, 38, 34, '#e2553f') + e(46, 56, 10, 7, '#f08a72', 'opacity=".75"') +
    '<path d="M60 38l-8-12 8 6 6-10 2 12 12-4-10 10 12 4-14 2 2 10-10-8-10 8 2-10-14-2 12-4z" fill="#5f9e46"/>' +
    '<path d="M60 36V20" stroke="#4f8a3a" stroke-width="4" stroke-linecap="round"/>',
  'leylek-mektup': '<rect x="12" y="28" width="96" height="66" rx="8" fill="#fbf1d8"/>' +
    '<path d="M12 36l48 36 48-36" fill="none" stroke="#e1cda2" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M16 90l32-28M104 90L72 62" stroke="#ecdcb6" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M60 84c-20-12-12-28 0-19 12-9 20 7 0 19z" fill="#e0706b"/>',
  'leylek-vazo': '<path d="M60 58V22M60 58q-4-24-24-34M60 58q4-26 26-32" stroke="#5f9e46" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    [[60, 20, '#f2a7c3'], [34, 24, '#f6d36b'], [86, 26, '#e98a7a']].map(([x, y, r]) =>
      [0, 72, 144, 216, 288].map(a => e(x + Math.cos(a * Math.PI / 180) * 6.5, y + Math.sin(a * Math.PI / 180) * 6.5, 5.6, 5.6, r)).join('') + e(x, y, 4, 4, '#fff3c4')).join('') +
    '<path d="M46 56h28q-3 8 4 18 8 12 6 22-2 10-14 12H50q-12-2-14-12-2-10 6-22 7-10 4-18z" fill="#7fb0c9"/>' +
    '<path d="M44 84h32" stroke="#d7eaf2" stroke-width="4" stroke-linecap="round"/>',
  'leylek-ekmek': '<path d="M14 80q0-38 46-38t46 38v8q0 10-10 10H24q-10 0-10-10z" fill="#d49a53"/>' +
    '<path d="M18 78q0-30 42-30t42 30" fill="#e6b36d"/>' +
    '<path d="M38 58l8 14M56 52l6 16M76 56l2 16" stroke="#f6d9a3" stroke-width="5" stroke-linecap="round"/>',
  'leylek-fincan': e(56, 96, 44, 10, '#d7dde1') + e(56, 94, 36, 7, '#eef2f4') +
    '<path d="M24 44h64v26q0 24-32 24T24 70z" fill="#f4f6f7"/>' + e(56, 44, 32, 8, '#d7dde1') + e(56, 45, 27, 5.5, '#b77a4a') +
    '<path d="M88 52q18 0 16 14-2 12-18 12" fill="none" stroke="#e5e9ec" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M30 60h52" stroke="#e0706b" stroke-width="4"/>',
  'leylek-minder': '<path d="M14 64q46-26 92 0-2 22-46 30-44-8-46-30z" fill="#b76aa0"/>' +
    '<path d="M14 60q46-30 92 0-46 26-92 0z" fill="#d38bbd"/>' +
    '<path d="M36 56q24-12 48 0" stroke="#efc3e0" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<circle cx="60" cy="60" r="5" fill="#9c5286"/>' +
    '<path d="M14 62l-8 8M106 62l8 8" stroke="#f0c86a" stroke-width="5" stroke-linecap="round"/>',
  'leylek-baca': '<path d="M40 50h40v62H40z" fill="#c0674c"/>' +
    '<path d="M40 64h40M40 80h40M40 96h40M60 50v14M50 64v16M70 64v16M60 80v16M50 96v16M70 96v16" stroke="#a4523b" stroke-width="3"/>' +
    '<rect x="34" y="44" width="52" height="10" rx="3" fill="#9e4b36"/>' +
    '<path d="M16 44q44 14 88 0-4-18-44-18T16 44z" fill="#a98158"/>' +
    '<path d="M22 38l18 6M34 30l10 12M58 26l2 16M80 30l-8 12M98 38l-18 6" stroke="#8a6644" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M24 42q36 8 72 0" stroke="#c9a57b" stroke-width="3" fill="none"/>',
  /* Köyün kuyusu: taş bilezik, iki direk, kiremit çatı, makara ve kova. */
  'leylek-kuyu': '<path d="M14 36L60 12l46 24z" fill="#c0674c"/><path d="M14 36h92v6H14z" fill="#a4523b"/>' +
    '<rect x="26" y="40" width="8" height="42" fill="#9c7048"/><rect x="86" y="40" width="8" height="42" fill="#9c7048"/>' +
    '<path d="M18 78h84v24q0 10-42 10T18 102z" fill="#b9ae9c"/>' +
    '<path d="M18 92h84M40 80v12M62 80v12M84 80v12M29 92v16M51 92v18M73 92v18M93 92v14" stroke="#a39884" stroke-width="2.5"/>' +
    e(60, 78, 42, 10, '#d3cabb') + e(60, 78, 32, 6, '#4f7f8a') +
    '<rect x="24" y="48" width="72" height="6" rx="3" fill="#7d5a3a"/><circle cx="99" cy="51" r="5" fill="#7d5a3a"/>' +
    '<path d="M60 54v12" stroke="#b89a6a" stroke-width="2.5"/><path d="M50 65h20l-3 13H53z" fill="#8b98a3"/>' +
    '<path d="M50 65h20" stroke="#6f7c86" stroke-width="2.5" stroke-linecap="round"/>',
  'leylek-sofra': '<path d="M8 60h104l-10 22H18z" fill="#c9a26f"/><path d="M22 82v26M98 82v26" stroke="#a98158" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M6 58h108l-6 16H12z" fill="#f3e3c3"/><path d="M20 58l-4 16M44 58l-2 16M76 58l2 16M100 58l4 16" stroke="#e4c99a" stroke-width="3"/>' +
    e(34, 56, 18, 6, '#f7f9fa') + e(34, 56, 12, 3.6, '#e9a24a') +
    '<g transform="translate(66 12) scale(.4)">' + testiGovde + '</g>' +
    e(96, 54, 9, 5, '#8fc2d8')
};

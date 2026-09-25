import {dostCiz} from './dostlar.js';
import {kadroCiz,KADRO_KODLARI} from './masal/kadro.js';
import {EK_CIZIMLER} from './masal/ikonlar/liste.js';
/* Yerel, ölçeklenebilir oyun çizimleri. Harici görsel veya yazı tipi isteği yok. */
const base = (body) => `<svg viewBox="0 0 120 120" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="leaf" x2="1" y2="1"><stop stop-color="#9bdd70"/><stop offset="1" stop-color="#329368"/></linearGradient></defs>${body}</svg>`;
const ellipse = (x,y,rx,ry,color) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}"/>`;
const face = '<g fill="#283e3b"><circle cx="47" cy="58" r="4"/><circle cx="73" cy="58" r="4"/><path d="M52 72q8 8 16 0" fill="none" stroke="#283e3b" stroke-width="3" stroke-linecap="round"/></g>';
const drawings = {
  saman: '<rect x="17" y="31" width="86" height="61" rx="15" fill="#d39a37"/><rect x="17" y="26" width="86" height="57" rx="14" fill="#edc765"/><path d="M22 42h76M22 53h76M22 66h76" stroke="#f6da85" stroke-width="3"/><path d="M36 28v56M82 28v56" stroke="#ab7838" stroke-width="6"/>',
  ot: '<path d="M60 98Q10 69 25 29q28 18 35 48Q50 23 75 13q11 34-7 64 19-34 39-31-1 40-47 52" fill="url(#leaf)"/>',
  elma: '<path d="M61 36c-33-26-54 9-43 36 13 35 33 32 43 25 24 15 48-23 43-43-5-24-26-25-43-18" fill="#e56d4e"/><path d="M60 39q-4-23 6-27" stroke="#77553b" stroke-width="7"/><path d="M67 29q0-22 25-16-5 20-25 16" fill="#6fa64e"/>',
  yumurta: ellipse(60,65,29,39,'#e7d5b3') + ellipse(57,60,27,38,'#fff5d8'),
  tohum: '<path d="M67 20C17 38 26 100 62 101c39-6 41-53 5-81" fill="#bd8451"/><path d="M64 31q-28 27-19 50" stroke="#e5ba7f" stroke-width="8" fill="none" stroke-linecap="round"/>',
  filiz: '<path d="M60 100V56" stroke="#4d9860" stroke-width="7"/><path d="M59 68Q20 71 22 33q40-3 37 35M62 56q-2-35 37-32 0 34-37 32" fill="url(#leaf)"/>',
  agac: '<path d="M60 105V40" stroke="#8e6344" stroke-width="14"/><path d="m58 72-20-20m24 8 20-18" stroke="#8e6344" stroke-width="7"/>' + ellipse(60,41,38,32,'#3b9970') + ellipse(43,30,24,22,'#7cc46f'),
  inek: '<path d="m29 39-16-14 1 22 19 5m58-13 16-14-1 22-19 5" fill="#d8b485"/><rect x="23" y="27" width="74" height="71" rx="29" fill="#faf2df"/><path d="M25 44q18-25 29-2t-24 24" fill="#495759"/>' + ellipse(60,81,27,16,'#eaa5a0') + face,
  tavsan: ellipse(43,29,12,27,'#efe6d3') + ellipse(77,29,12,27,'#efe6d3') + ellipse(43,26,6,18,'#ecb6ad') + ellipse(77,26,6,18,'#ecb6ad') + ellipse(60,70,37,32,'#f9f3e4') + face,
  fok: ellipse(24,85,20,10,'#86afbe') + ellipse(96,85,20,10,'#86afbe') + ellipse(60,66,35,37,'#a5c9d3') + ellipse(60,80,24,17,'#d7e9e7') + face,
  kus: '<path d="M81 45q25-14 21 21L83 78" fill="#d28c36"/>' + ellipse(58,65,32,32,'#edc76d') + '<path d="m34 70-20 18 24 4m43-34 21 7-20 7" fill="#da9050"/>' + ellipse(53,73,18,12,'#e4a953') + '<circle cx="72" cy="54" r="4" fill="#28443c"/>',
  koyun: ellipse(60,64,43,32,'#f5edda') + ellipse(60,65,25,27,'#8c7868') + face,
  tavuk: ellipse(60,64,35,33,'#f9e9c4') + '<path d="M47 35q-13-30 4-24 5-16 13 0 22-7 10 23" fill="#dc755d"/><path d="m53 66 14 0-7 12" fill="#e2a43b"/>' + face,
  balik: ellipse(58,63,35,24,'#ebaf56') + '<path d="m86 62 23-24v49z" fill="#e29641"/><circle cx="39" cy="58" r="4" fill="#25473e"/><path d="M60 42 69 28 77 47" fill="#e29641"/>',
  kaplumbaga: ellipse(95,66,17,14,'#99bc73') + ellipse(39,87,12,10,'#99bc73') + ellipse(75,87,12,10,'#99bc73') + ellipse(58,62,36,27,'#4f936b') + '<path d="m58 39 17 21-15 22-22-20z" fill="#8eb771"/><circle cx="101" cy="63" r="3" fill="#29473d"/>',
  tas: '<path d="m15 78 13-35 37-17 34 27 9 34-62 8z" fill="#a2aaba"/><path d="m28 43 34 10 3-27 34 27-37 0-16 42-31-17z" fill="#c2c6cc"/>',
  bulut: '<path d="M26 86c-28-7-22-43 5-44 3-29 47-36 60-4 35-5 43 45 11 48z" fill="#e5f3f1"/><path d="M28 83h70" stroke="#bddedc" stroke-width="6" stroke-linecap="round"/>',
  su: '<path d="M60 13C50 37 25 51 25 75a35 35 0 0 0 70 0C95 52 69 31 60 13" fill="#6bbfc8"/><path d="M41 66q-10 21 8 25" stroke="#c5eff0" stroke-width="7" fill="none" stroke-linecap="round"/>',
  isik: '<g stroke="#dfad45" stroke-width="5" stroke-linecap="round"><path d="M60 8v13m0 78v13M8 60h13m78 0h13M23 23l10 10m54 54 10 10M23 97l10-10m54-54 10-10"/></g><circle cx="60" cy="60" r="28" fill="#f3cf6c"/>',
  hava: '<g fill="none" stroke="#9bcad0" stroke-width="9" stroke-linecap="round"><path d="M16 42h61q29 0 15-22-12-11-20 3M12 61h89M26 80h47q25 0 15 21"/></g>',
  toprak: '<path d="m14 69 20-24 25-8 25 11 22 24-3 26H18z" fill="#aa815c"/><path d="m14 69 40-9 23 8 29 4-22-24-25-11-25 8z" fill="#cba276"/><g fill="#8f6a4b"><circle cx="42" cy="79" r="5"/><circle cx="77" cy="86" r="4"/></g>',
  yaprak: '<path d="M22 95C4 45 49 15 101 22c1 58-39 89-79 73" fill="url(#leaf)"/><path d="m18 105 62-61" stroke="#458b53" stroke-width="5"/>',
  kabuk: '<path d="M60 97 18 61C-1 17 42 14 51 29 68-2 95 24 89 35c41-8 36 31 17 36L60 97" fill="#ebc1a0"/><path d="m60 90-9-59m9 59 28-52m-28 52-35-33" stroke="#cd957e" stroke-width="4" fill="none"/>',
  yildiz: '<path d="m60 12 14 29 33 1-23 25 9 35-33-17-31 17 6-35-23-25 34-1z" fill="#e9a079"/>',
  sise: '<path d="M47 12h26v23l15 18v48H32V53l15-18z" fill="#8fbdb4"/><rect x="43" y="8" width="34" height="13" rx="4" fill="#658e96"/><rect x="33" y="60" width="54" height="22" rx="3" fill="#e5e4c3"/>',
  poset: '<path d="M25 39h70l8 65H17z" fill="#d4c6d4"/><path d="M39 46V26q21-20 42 0v20" fill="none" stroke="#b8a6ba" stroke-width="9"/>',
  kutu: '<path d="m20 37 42-16 39 16-40 17z" fill="#d9b98b"/><path d="M20 37v53l41 18V54z" fill="#bf966c"/><path d="M61 54v54l40-19V37z" fill="#d0a67c"/>',
  kalem: '<g transform="rotate(28 60 60)"><path d="M49 18h22v68L60 107 49 86z" fill="#ecc564"/><path d="m49 86 11 21 11-21" fill="#d4b996"/><path d="m56 99 4 8 4-8" fill="#3e5149"/><rect x="49" y="12" width="22" height="16" rx="5" fill="#dc8c80"/></g>',
  ayakkabi: '<path d="M28 35h34v31q5 11 31 9 16 4 11 23H16V69z" fill="#8d9aa5"/><path d="M17 92h89" stroke="#efdfbb" stroke-width="10"/>',
  yuva: '<path d="M14 54q46 44 92 0-2 51-46 51T14 54" fill="#ac8155"/><ellipse cx="60" cy="55" rx="46" ry="14" fill="#d4ad7a"/><ellipse cx="60" cy="53" rx="30" ry="8" fill="#7b6247"/>',
  kovuk: '<path d="M25 13h70v96H25z" fill="#a98357"/><ellipse cx="60" cy="67" rx="24" ry="32" fill="#584e39"/><path d="M32 16v90m55-90v90" stroke="#c6a370" stroke-width="4"/>',
  in: '<path d="M6 103q0-93 54-93 54 0 54 93" fill="#b3bc82"/><path d="M35 103V76a25 25 0 0 1 50 0v27" fill="#667b58"/>',
  firca: '<g transform="rotate(-30 60 60)"><rect x="49" y="51" width="22" height="61" rx="10" fill="#b1875a"/><rect x="29" y="15" width="62" height="50" rx="16" fill="#d2af7d"/><path d="M40 22v30m13-30v30m14-30v30m13-30v30" stroke="#846b50" stroke-width="5"/></g>',
  kalp: '<path d="M60 102C-13 62 16 2 60 35 104 2 133 62 60 102" fill="#df9b9c"/>',
  oyuncak: '<rect x="24" y="35" width="72" height="63" rx="14" fill="#d7a6aa"/><path d="m28 49 65 34m-65 0 65-34" stroke="#f5dbbf" stroke-width="7"/>',
  semsiye: '<path d="M9 61a51 51 0 0 1 102 0z" fill="#8bb2b6"/><path d="M60 61v37q-15 25-26 1" fill="none" stroke="#ad8857" stroke-width="6"/>'
};
Object.assign(drawings, {
  basak: '<path d="M60 112V44" stroke="#c9a151" stroke-width="7" stroke-linecap="round"/>' +
    [0,1,2,3].map(function(i){var y=40+i*17;return ellipse(44,y+6,11,8,'#e7c268')+ellipse(76,y+6,11,8,'#e7c268')+ellipse(60,y-2,11,9,'#f0d489');}).join('') +
    '<path d="M60 44q-16-16-6-28 12 6 6 28" fill="#dcb45e"/>',
  ambar: '<path d="m60 14 46 30v62H14V44z" fill="#c4674f"/><path d="m60 14 46 30H14z" fill="#a8523f"/>' +
    '<path d="M14 44h92v9H14z" fill="#f3e6c8"/><rect x="44" y="62" width="32" height="44" rx="3" fill="#f0e2c0"/>' +
    '<path d="M60 62v44M44 78h32" stroke="#a8523f" stroke-width="4"/><rect x="50" y="30" width="20" height="14" rx="3" fill="#8e4536"/>',
  dostluk: '<path d="M60 102C-13 62 16 2 60 35 104 2 133 62 60 102" fill="#df9b9c"/>' +
    '<path d="M60 35v67" stroke="#f2c3c2" stroke-width="5" opacity=".7"/>',
  bayrak: '<rect x="30" y="10" width="9" height="100" rx="4" fill="#a5794d"/><path d="M39 18h62l-17 21 17 21H39z" fill="#d9714f"/><path d="M39 22h54l-13 17 13 17H39z" fill="#e88a68"/>',
  celenk: '<circle cx="60" cy="64" r="36" fill="none" stroke="#7fae68" stroke-width="13"/><circle cx="60" cy="64" r="36" fill="none" stroke="#9cc57f" stroke-width="6"/>' + [0,60,120,180,240,300].map(function(a){var r=a*Math.PI/180;return ellipse(60+Math.cos(r)*36,64+Math.sin(r)*36,11,7,'#8fbc73');}).join('') + '<path d="M42 18h36l-6 16H48z" fill="#e0b054"/>',
  fidan: '<path d="M60 108V30" stroke="#8e774c" stroke-width="7"/><path d="M59 84Q25 81 24 53q35-2 35 31M62 66q-1-30 33-33 2 30-33 33M59 47Q39 42 40 21q24 0 19 26" fill="url(#leaf)"/>',
  sincap: '<path d="M77 87C116 90 120 28 94 19c-30-10-37 18-17 30 21 12 3 19-5 20" fill="#bb8150"/>' + ellipse(53,75,25,26,'#c39260') + ellipse(46,48,24,22,'#c39260') + '<path d="m29 34 1-24 17 16m4 0 16-16-3 25" fill="#bb8150"/>' + ellipse(48,79,13,17,'#f0d6a0') + '<circle cx="35" cy="46" r="4" fill="#36483c"/><circle cx="54" cy="46" r="4" fill="#36483c"/><circle cx="43" cy="57" r="4" fill="#63513c"/>',
  yengec: '<path d="M32 61 13 42m16 34L9 66m27 20L15 92m70-31 20-19M92 77l20-10M86 89l20 6" stroke="#d88767" stroke-width="7" fill="none" stroke-linecap="round"/>' + ellipse(61,73,33,24,'#e69c78') + '<path d="M18 42Q-2 28 14 16l5 12 13-12q10 23-14 26m83 0q22-14 6-26l-5 12-14-12q-10 23 13 26" fill="#d98a69"/><path d="M48 56V43m25 13V43" stroke="#d98a69" stroke-width="6"/><circle cx="48" cy="41" r="6" fill="#344e43"/><circle cx="73" cy="41" r="6" fill="#344e43"/>',
  ahtapot: '<path d="M29 64q-24 39-8 41 13 0 19-33m7 0q-13 34 1 36 12 0 12-36m9 0q1 34 15 34 9-2-3-35m5-8q26 42 29 29" stroke="#ad99ba" stroke-width="12" fill="none" stroke-linecap="round"/>' + ellipse(60,47,34,34,'#b7a3c3') + face,
  baykus: '<path d="m28 45-4-28 25 14m22 0 25-14-4 28" fill="#a18b67"/>' + ellipse(60,68,36,37,'#ad9874') + ellipse(44,51,20,22,'#e9dab3') + ellipse(77,51,20,22,'#e9dab3') + '<circle cx="44" cy="51" r="6" fill="#35463c"/><circle cx="77" cy="51" r="6" fill="#35463c"/><path d="m53 66 14 0-7 13" fill="#ce9c55"/>',
  kartal: '<path d="M42 59Q9 35 3 50l29 42m47-33q32-24 38-9L88 92" fill="#8a7459"/>' + ellipse(60,77,26,29,'#9e896d') + ellipse(60,44,24,24,'#f1e8d6') + '<circle cx="51" cy="42" r="4" fill="#354c40"/><circle cx="70" cy="42" r="4" fill="#354c40"/><path d="m55 51 15 4-13 10" fill="#dca553"/>',
  kozalak: '<path d="M60 12C24 37 24 87 60 106c36-19 36-69 0-94" fill="#a0835d"/><path d="m36 40 24 13 24-13M31 57l29 15 29-15M37 78l23 14 23-14" fill="none" stroke="#d0ae7a" stroke-width="6"/>',
  palamut: ellipse(60,68,25,31,'#c5a06a') + '<path d="M30 52q2-35 30-35t30 35z" fill="#8a7854"/><path d="M60 19V8" stroke="#87704d" stroke-width="6"/>'
});
const aliases = {kuzu:'koyun',civciv:'tavuk',buzagi:'inek',kusyavru:'kus',serce:'kus',fokyavru:'fok',balikyavru:'balik',kaplumbagayavru:'kaplumbaga',basamak:'kutu'};
export function ikon(key) {
  if(['inek','tavsan','fok','kus'].includes(key))return dostCiz(key);
  if(KADRO_KODLARI.includes(key))return kadroCiz(key);
  const size = key.match(/^(kazik|dal|kabuk|kaya|yuva)([1-4])$/);
  if (size) {
    const scale = .35 + Number(size[2]) * .16;
    const part = size[1] === 'kazik' || size[1] === 'dal' ? '<rect x="43" y="9" width="34" height="100" rx="8" fill="#b58e60"/><path d="M54 19v77" stroke="#d9b67f" stroke-width="5"/>' : drawings[{kabuk:'kabuk',kaya:'tas',yuva:'yuva'}[size[1]]];
    return base(`<g transform="translate(${60*(1-scale)} ${110*(1-scale)}) scale(${scale})">${part}</g>`);
  }
  // Masalların kendi ikonları (js/masal/ikonlar/<kod>.js) önce bakılır
  const content=EK_CIZIMLER[key] || drawings[aliases[key] || key] || drawings.yaprak;
  return base(/yavru|kuzu|civciv|buzagi/.test(key)?`<g transform="translate(18 25) scale(.7)">${content}</g>`:content);
}
export function simge(name) {
 const paths={leaf:'M19 4C8 2 2 8 5 17c9 3 15-3 14-13ZM4 20 15 9',arrow:'M4 12h15m-6-6 6 6-6 6',back:'M20 12H5m6-6-6 6 6 6',check:'m5 12 4 4L19 6',sound:'M4 9v6h4l5 4V5L8 9Zm12-1q6 4 0 8',expand:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',home:'m3 10 9-7 9 7M6 9v12h12V9',reset:'M4 10a8 8 0 1 1 0 6m0-13v7h7',book:'M12 6Q6 2 2 5v15q5-3 10 1 5-4 10-1V5q-4-3-10 1Zm0 0v15'};
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.leaf}"/></svg>`;
}

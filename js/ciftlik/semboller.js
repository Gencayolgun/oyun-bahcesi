/* Çiftçi Fare — çocuk sembolleri (semboller.js).

   Okuma bilmeyen çocuk kendini SEMBOLÜYLE tanır: 'Kim oynuyor?' kartı,
   sembol bayrağı, ziyaret ızgarası. Liste ortak/turler.js'teki SEMBOLLER
   ile BİREBİR aynıdır (sunucu da o listeyi doğrular); burada yalnız
   çizimler ve (ekran okuyucu/öğretmen için) adlar var.

   Çizim kuralları:
   - 120×120 kutu, kalın koyu çizgi, düz ve doygun renkler: uzaktan
     (tahtanın önünden) ve küçük boyda bile tek bakışta seçilsin.
   - Her sembol ayrı bir siluet ve baskın renk: benzer ikiler (ayı/aslan,
     kupa/bardak, kalem/fırça) şekil ve renkle ayrılır.
   - Degrade, desen, <defs>, url(#...) YOK (sayfada çözülmeyen başvuru
     kalmaz); yazı ve rakam YOK.
   - Çıkartma (kalp, yıldız...) ve iş ikonlarıyla karışmasın diye bu küme
     onlardan ayrıdır (turler.js). */

import {SEMBOLLER} from './ortak/turler.js';

export {SEMBOLLER};

const C = '#33403a';                                   // çizgi rengi
const G = (govde, kalin = 3.5) => `<g stroke="${C}" stroke-width="${kalin}" stroke-linejoin="round" stroke-linecap="round">${govde}</g>`;
const goz = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C}" stroke="none"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .32}" fill="#fff" stroke="none"/>`;

/* Kozalak pulları: satır satır aşağı bakan yarım daireler (desen/clipPath yok). */
const KOZALAK_PUL = [[32, [60]], [46, [48, 72]], [60, [38, 60, 82]], [74, [36, 55, 74, 88]], [88, [42, 60, 78]], [101, [52, 68]]]
  .map(([y, xs]) => xs.map(x => `M${x - 8} ${y}q8 12 16 0q-8-5-16 0z`).join('')).join('');

/* Türkçe adlar (aria-label, öğretmen listesi). */
export const SEMBOL_ADLARI = Object.freeze({
  semsiye: 'Şemsiye', ayakkabi: 'Ayakkabı', balik: 'Balık', baykus: 'Baykuş', kaplumbaga: 'Kaplumbağa',
  sincap: 'Sincap', tavsan: 'Tavşan', kalem: 'Kalem', firca: 'Fırça', kutu: 'Kutu', oyuncak: 'Oyuncak',
  ahtapot: 'Ahtapot', fok: 'Fok', kartal: 'Kartal', yengec: 'Yengeç', fener: 'Fener', kozalak: 'Kozalak',
  palamut: 'Palamut', araba: 'Araba', top: 'Top', gemi: 'Gemi', ucurtma: 'Uçurtma', tren: 'Tren',
  anahtar: 'Anahtar', kupa: 'Kupa', zil: 'Zil', davul: 'Davul', trompet: 'Trompet', bardak: 'Bardak',
  kasik: 'Kaşık', penguen: 'Penguen', zurafa: 'Zürafa', fil: 'Fil', aslan: 'Aslan', zebra: 'Zebra',
  kelebek: 'Kelebek', kirpi: 'Kirpi', ayi: 'Ayı', kurbaga: 'Kurbağa', bisiklet: 'Bisiklet'
});

export const SEMBOL_CIZIMLERI = Object.freeze({
  semsiye: G(
    '<path d="M60 16v-7" stroke-width="6"/>' +
    '<path d="M11 62Q14 16 60 15q46 1 49 47-12-9-24 0-12-9-25 0-12-9-25 0-12-9-24 0z" fill="#e24b3b"/>' +
    '<path d="M60 15q-17 18-13 47m13-47q17 18 13 47" fill="none" stroke-width="3"/>' +
    '<path d="M60 62v36q0 12-11 12t-11-11" fill="none" stroke="#5a4535" stroke-width="7"/>'),
  ayakkabi: G(
    '<path d="M14 80V50q0-9 9-9h13q7 17 27 20l30 6q17 4 17 21v4z" fill="#3a7fd0"/>' +
    '<rect x="9" y="80" width="103" height="15" rx="7.5" fill="#f4f1e8"/>' +
    '<path d="M44 52l10 -6m-2 12 11-7m-1 12 11-6" stroke="#fff" stroke-width="4"/>' +
    '<circle cx="24" cy="62" r="5" fill="#f4f1e8" stroke="none"/>'),
  balik: G(
    '<path d="M83 60l26-22v44z" fill="#f08a24"/>' +
    '<ellipse cx="50" cy="60" rx="37" ry="25" fill="#f7a53a"/>' +
    '<path d="M42 36q10-14 24-6l-6 8M44 84q9 10 20 4" fill="#f08a24"/>' +
    '<path d="M64 44q-8 16 0 32" fill="none" stroke-width="3"/>') + goz(32, 55, 5.5),
  baykus: G(
    '<path d="M28 42l-6-26 22 13m34 0 22-13-6 26" fill="#8a6a45"/>' +
    '<ellipse cx="60" cy="68" rx="38" ry="41" fill="#a07b50"/>' +
    '<ellipse cx="60" cy="80" rx="22" ry="24" fill="#e9d6ae"/>' +
    '<circle cx="43" cy="50" r="15" fill="#fff"/><circle cx="77" cy="50" r="15" fill="#fff"/>' +
    '<path d="M54 60h12l-6 11z" fill="#f2a33a"/>') + goz(43, 50, 7) + goz(77, 50, 7),
  kaplumbaga: G(
    '<ellipse cx="102" cy="72" rx="11" ry="9" fill="#8cc06a"/>' +
    '<path d="M26 84l-8 14h14zm60 0 8 14H80z" fill="#8cc06a"/>' +
    '<path d="M14 84q2-50 44-52 44 2 46 52z" fill="#3f8f45"/>' +
    '<path d="M36 84l8-22h28l8 22M44 62l-8-18m36 18 8-18M58 34v28" fill="none" stroke-width="3"/>' +
    '<rect x="10" y="82" width="98" height="9" rx="4.5" fill="#2f6f35"/>') + goz(104, 70, 3),
  sincap: G(
    '<path d="M70 98q40 2 38-40-2-32-30-40-20-4-22 14 18 2 22 20 6 28-8 46z" fill="#c26a2c"/>' +
    '<ellipse cx="50" cy="80" rx="22" ry="24" fill="#d9823e"/>' +
    '<circle cx="40" cy="48" r="18" fill="#d9823e"/>' +
    '<path d="M28 36l-2-14 12 9m6-4 6-12 4 15" fill="#d9823e"/>' +
    '<ellipse cx="46" cy="84" rx="10" ry="13" fill="#f1d3a6"/>' +
    '<ellipse cx="44" cy="100" rx="10" ry="6" fill="#b25b22"/>') + goz(36, 46, 4.5) + '<circle cx="24" cy="54" r="3.5" fill="#33403a"/>',
  tavsan: G(
    '<path d="M42 50q-16-40 -2-44 12 2 12 42m16 2q0-40 12-42 14 4-2 44" fill="#ecebe6"/>' +
    '<path d="M44 44q-8-30 -2-32 6 2 6 30m24 2q0-28 6-30 6 2-2 32" fill="#f3b3bd" stroke="none"/>' +
    '<ellipse cx="60" cy="76" rx="34" ry="30" fill="#ecebe6"/>' +
    '<path d="M56 84h8l-4 5z" fill="#f08a9a"/><path d="M60 89v6m0 0q-6 5-11 1m11-1q6 5 11 1" fill="none" stroke-width="3"/>') +
    goz(46, 72, 5) + goz(74, 72, 5),
  kalem: G(
    '<path d="M24 96l-12 14 18-6z" fill="#33403a"/>' +
    '<path d="M24 96l6 8 10-4-12-12z" fill="#f2d3a0"/>' +
    '<path d="M28 88 88 28l14 14-60 60z" fill="#f6c12d"/>' +
    '<path d="M88 28l10-10q5-4 9 0l5 5q4 5 0 9l-10 10z" fill="#f08aa0"/>' +
    '<path d="M84 32l14 14" fill="none" stroke="#b9b9b0" stroke-width="7"/>'),
  firca: G(
    '<path d="M10 108q2-26 22-30l10 10q-4 20-32 20z" fill="#3d7fd6"/>' +
    '<path d="M30 76l10-10 14 14-10 10z" fill="#c9ced2"/>' +
    '<path d="M48 64 98 14q8-6 12 0 4 5-2 12L56 76z" fill="#b8733c"/>'),
  kutu: G(
    '<path d="M20 50h80v54H20z" fill="#d4a15f"/>' +
    '<path d="M20 50l-10-18h40l10 18zm80 0 10-18H70l-10 18z" fill="#e7bc7c"/>' +
    '<path d="M60 50v54" fill="none" stroke-width="3"/>' +
    '<path d="M34 78h16" stroke="#8a6534" stroke-width="5"/>'),
  oyuncak: G(
    '<path d="M60 16v84" stroke="#8a6534" stroke-width="7"/>' +
    '<ellipse cx="60" cy="96" rx="40" ry="10" fill="#e24b3b"/>' +
    '<ellipse cx="60" cy="80" rx="33" ry="9" fill="#f2a13a"/>' +
    '<ellipse cx="60" cy="65" rx="26" ry="8" fill="#f6d33a"/>' +
    '<ellipse cx="60" cy="51" rx="20" ry="7" fill="#58b05a"/>' +
    '<ellipse cx="60" cy="38" rx="14" ry="6" fill="#3a82d4"/>' +
    '<circle cx="60" cy="22" r="9" fill="#9b6bc9"/>'),
  ahtapot: G(
    '<path d="M28 64q-22 34-6 40 12 2 16-30M46 70q-10 34 4 36 12 0 10-34m10 0q-2 34 10 34 14-2 4-36m10-6q4 32 16 30 16-6-6-40" fill="#a970c8"/>' +
    '<ellipse cx="60" cy="48" rx="36" ry="34" fill="#b982d4"/>' +
    '<path d="M50 66q10 7 20 0" fill="none" stroke-width="3"/>') + goz(46, 50, 6) + goz(74, 50, 6),
  fok: G(
    '<path d="M22 98q-4-40 22-60 16-12 30-2 10 8 6 24-4 12-10 22 30 6 38 16H22z" fill="#7d8b95"/>' +
    '<path d="M34 98q6-14 20-12M80 84q14-8 24 2" fill="#66747e"/>' +
    '<ellipse cx="80" cy="44" rx="10" ry="7" fill="#a7b3ba"/>' +
    '<circle cx="84" cy="40" r="3" fill="#33403a" stroke="none"/>' +
    '<path d="M86 46l18-4m-18 8 18 4" fill="none" stroke-width="2.5"/>') + goz(64, 34, 5),
  kartal: G(
    '<path d="M24 110q-4-54 22-74 20-14 38-6l-6 20q-6 30 4 60z" fill="#6b4a2c"/>' +
    '<path d="M34 64q-2-36 26-40 24-2 30 16l-10 18q-24 10-46 6z" fill="#f7f4ec"/>' +
    '<path d="M86 34q20 2 24 20 0 10-8 12-2-10-10-12l-10 6z" fill="#f2b22e"/>') + goz(72, 40, 5),
  yengec: G(
    '<path d="M22 74l-14 8m14 4-12 14m88-26 14 8m-14 4 12 14" fill="none" stroke-width="5"/>' +
    '<ellipse cx="60" cy="76" rx="38" ry="24" fill="#e0492f"/>' +
    '<path d="M30 56q-22-8-18-30 16-2 22 12l-8 4q6 6 14 4z" fill="#e0492f"/>' +
    '<path d="M90 56q22-8 18-30-16-2-22 12l8 4q-6 6-14 4z" fill="#e0492f"/>' +
    '<path d="M48 56V42m24 14V42" stroke-width="4"/>' +
    '<path d="M48 84q12 8 24 0" fill="none" stroke-width="3"/>') + goz(48, 40, 6) + goz(72, 40, 6),
  fener: G(
    '<path d="M44 26q0-16 16-16t16 16" fill="none" stroke-width="6"/>' +
    '<path d="M36 26h48l-6 12H42z" fill="#3b4a45"/>' +
    '<rect x="38" y="38" width="44" height="54" rx="8" fill="#ffd54a"/>' +
    '<path d="M60 44v42M40 64h40" fill="none" stroke-width="3"/>' +
    '<path d="M32 92h56l-4 14H36z" fill="#3b4a45"/>'),
  kozalak: G(
    '<path d="M60 6v12" stroke="#6b4a2c" stroke-width="6"/>' +
    '<path d="M60 16q-36 24-32 62 4 28 32 34 28-6 32-34 4-38-32-62z" fill="#9c6a3a"/>' +
    '<path d="' + KOZALAK_PUL + '" fill="#c08850" stroke-width="2.5"/>'),
  palamut: G(
    '<path d="M60 12q2-6 8-6" fill="none" stroke="#6b4a2c" stroke-width="6"/>' +
    '<path d="M32 54q0 50 28 58 28-8 28-58z" fill="#c9954f"/>' +
    '<path d="M20 56q0-40 40-40t40 40q-40 10-80 0z" fill="#7a5a36"/>' +
    '<path d="M34 40l10 8m10-18 6 12m16-10-6 12m22-2-10 8" fill="none" stroke="#b08a5a" stroke-width="3"/>'),
  araba: G(
    '<path d="M10 82V64q0-8 8-10l16-4 14-18q4-4 10-4h26q6 0 10 5l14 17q12 2 12 12v20z" fill="#e2463a"/>' +
    '<path d="M50 34h16v18H38zM72 34h12l12 18H72z" fill="#bfe2f0"/>' +
    '<circle cx="34" cy="86" r="13" fill="#3b4a45"/><circle cx="88" cy="86" r="13" fill="#3b4a45"/>' +
    '<circle cx="34" cy="86" r="5" fill="#d8dcde"/><circle cx="88" cy="86" r="5" fill="#d8dcde"/>' +
    '<rect x="104" y="62" width="8" height="8" rx="2" fill="#ffd54a" stroke="none"/>'),
  top: G(
    '<circle cx="60" cy="60" r="48" fill="#f7f4ec"/>' +
    '<path d="M60 12q-30 20-30 48t30 48q-44-4-48-48 4-44 48-48z" fill="#e2463a"/>' +
    '<path d="M60 12q30 20 30 48t-30 48q44-4 48-48-4-44-48-48z" fill="#3a7fd0"/>' +
    '<path d="M60 12q-12 20-12 48t12 48q12-20 12-48t-12-48z" fill="#f6c12d"/>'),
  gemi: G(
    '<path d="M50 20h14v26H50z" fill="#e2463a"/>' +
    '<path d="M30 46h58v22H30z" fill="#f7f4ec"/>' +
    '<circle cx="46" cy="57" r="4" fill="#9fcbe0"/><circle cx="60" cy="57" r="4" fill="#9fcbe0"/><circle cx="74" cy="57" r="4" fill="#9fcbe0"/>' +
    '<path d="M8 68h104l-16 26H24z" fill="#23508c"/>' +
    '<path d="M6 104q9-8 18 0t18 0 18 0 18 0 18 0 18 0" fill="none" stroke="#3a9bd0" stroke-width="5"/>'),
  ucurtma: G(
    '<path d="M58 8 94 46 58 84 22 46z" fill="#f6c12d"/>' +
    '<path d="M58 8v76M22 46h72" fill="none" stroke-width="3"/>' +
    '<path d="M58 8 94 46H58zM22 46h36v38z" fill="#e2463a"/>' +
    '<path d="M58 84q-10 10 0 16t2 16" fill="none" stroke-width="3"/>' +
    '<path d="M50 96l8-6 2 10zm8 14 8-4-2 10z" fill="#3a7fd0"/>'),
  tren: G(
    '<path d="M18 30h14v18H18z" fill="#3b4a45"/>' +
    '<path d="M10 48h56V88H10z" fill="#3f9a4f"/>' +
    '<path d="M66 28h36v60H66z" fill="#2f7a3f"/>' +
    '<rect x="74" y="38" width="20" height="18" rx="3" fill="#bfe2f0"/>' +
    '<path d="M6 88h104" stroke-width="5"/>' +
    '<circle cx="26" cy="94" r="10" fill="#e2463a"/><circle cx="52" cy="94" r="10" fill="#e2463a"/><circle cx="86" cy="94" r="12" fill="#e2463a"/>' +
    '<circle cx="26" cy="94" r="3" fill="#33403a"/><circle cx="52" cy="94" r="3" fill="#33403a"/><circle cx="86" cy="94" r="4" fill="#33403a"/>'),
  anahtar: G(
    '<circle cx="36" cy="44" r="26" fill="#f2c230"/>' +
    '<circle cx="36" cy="44" r="10" fill="#f7f4ec"/>' +
    '<path d="M54 62l46 46m-18-18 10-10m0 20 10-10" fill="none" stroke="#f2c230" stroke-width="12"/>' +
    '<path d="M54 62l46 46m-18-18 10-10m0 20 10-10" fill="none" stroke-width="3"/>'),
  kupa: G(
    '<path d="M44 14q-6 8 0 14t0 14M62 12q-6 8 0 14t0 14" fill="none" stroke="#a8b2b0" stroke-width="4"/>' +
    '<path d="M86 58h8q14 0 14 16t-14 16h-8" fill="none" stroke="#f08a24" stroke-width="9"/>' +
    '<path d="M86 58h8q14 0 14 16t-14 16h-8" fill="none" stroke-width="3"/>' +
    '<path d="M22 48h66v48q0 14-14 14H36q-14 0-14-14z" fill="#f08a24"/>' +
    '<ellipse cx="55" cy="48" rx="33" ry="7" fill="#6b3f22"/>'),
  zil: G(
    '<path d="M60 10v8" stroke-width="6"/>' +
    '<path d="M60 18q-30 0-32 38-2 26-14 34h92q-12-8-14-34-2-38-32-38z" fill="#f2c230"/>' +
    '<path d="M14 90h92v10H14z" fill="#d9a520"/>' +
    '<circle cx="60" cy="104" r="9" fill="#b07c14"/>' +
    '<path d="M44 34q-8 12-8 30" fill="none" stroke="#fff3b0" stroke-width="5"/>'),
  davul: G(
    '<path d="M86 12 60 44M34 12l26 32" fill="none" stroke="#8a6534" stroke-width="6"/>' +
    '<circle cx="87" cy="11" r="6" fill="#f7f4ec"/><circle cx="33" cy="11" r="6" fill="#f7f4ec"/>' +
    '<path d="M16 52v42q44 22 88 0V52z" fill="#e2463a"/>' +
    '<path d="M16 58l16 30 14-30 14 32 14-32 14 30 16-30" fill="none" stroke="#f6c12d" stroke-width="4"/>' +
    '<ellipse cx="60" cy="52" rx="44" ry="14" fill="#f7f0dc"/>'),
  trompet: G(
    '<path d="M14 54h10v12H14z" fill="#d9a520"/>' +
    '<path d="M24 56h44v8H24z" fill="#f2c230"/>' +
    '<path d="M40 64q0 18 16 18h14q12 0 12-12v-6" fill="none" stroke="#f2c230" stroke-width="7"/>' +
    '<path d="M40 64q0 18 16 18h14q12 0 12-12v-6" fill="none" stroke-width="2.5"/>' +
    '<path d="M68 56l40-24v56L68 64z" fill="#f2c230"/>' +
    '<path d="M44 44v12m10-12v12m10-12v12" stroke-width="5"/>'),
  bardak: G(
    '<path d="M64 38 80 6h10" fill="none" stroke="#3a9bd0" stroke-width="6"/>' +
    '<path d="M30 30h60l-8 80H38z" fill="#e7f4f8"/>' +
    '<path d="M33 52h54l-6 58H38z" fill="#f59a2a"/>' +
    '<ellipse cx="54" cy="70" rx="5" ry="9" fill="#ffd08a" stroke="none"/>'),
  kasik: G(
    '<ellipse cx="80" cy="36" rx="22" ry="28" transform="rotate(40 80 36)" fill="#c9ced2"/>' +
    '<ellipse cx="76" cy="38" rx="9" ry="14" transform="rotate(40 76 38)" fill="#eef1f2" stroke="none"/>' +
    '<path d="M64 56 18 104q-6 6-10 0 0-4 4-8l46-46z" fill="#c9ced2"/>'),
  penguen: G(
    '<path d="M36 102h20l-4 8H30zm28 0h20l6 8H68z" fill="#f2a13a"/>' +
    '<ellipse cx="60" cy="64" rx="34" ry="44" fill="#2e3638"/>' +
    '<path d="M60 36q-26 6-24 40 2 26 24 30 22-4 24-30 2-34-24-40z" fill="#f7f4ec"/>' +
    '<path d="M26 60q-14 18-6 30M94 60q14 18 6 30" fill="#2e3638"/>' +
    '<path d="M52 44h16l-8 10z" fill="#f2a13a"/>') + goz(48, 34, 4.5) + goz(72, 34, 4.5),
  zurafa: G(
    '<path d="M44 110V56q-2-22 4-30h18q4 8 2 30v54z" fill="#f2c24a"/>' +
    '<path d="M50 20l-4-12m18 12 4-12" stroke-width="4"/><circle cx="46" cy="8" r="4" fill="#8a5a2c"/><circle cx="68" cy="8" r="4" fill="#8a5a2c"/>' +
    '<path d="M44 18h28q16 2 18 14 0 10-12 10H44q-6 0-6-12t6-12z" fill="#f2c24a"/>' +
    '<ellipse cx="82" cy="36" rx="8" ry="6" fill="#e0a860"/>' +
    '<path d="M50 60h8v8h-8zm6 20h8v10h-8zm-6 18h8v8h-8zm8-60h8v8h-8z" fill="#b2702e" stroke="none"/>') + goz(62, 28, 4),
  fil: G(
    '<ellipse cx="38" cy="54" rx="28" ry="34" fill="#8f9aa3"/>' +
    '<ellipse cx="68" cy="54" rx="34" ry="32" fill="#a3aeb6"/>' +
    '<path d="M84 70q10 10 10 26 0 10 8 10 6 0 6-6-6 2-6-8 0-20-10-30z" fill="#a3aeb6"/>' +
    '<path d="M76 80q10 4 6 14" fill="none" stroke="#f7f4ec" stroke-width="6"/>' +
    '<path d="M34 40q-10 14 0 30" fill="none" stroke="#76828b" stroke-width="3"/>') + goz(82, 46, 5),
  aslan: G(
    '<circle cx="60" cy="60" r="50" fill="#c8702a"/>' +
    '<path d="M60 10l8 12 12-8 2 14 14-2-4 14 14 4-8 12 10 10-12 6 6 12-14 2 2 14-14-4-4 14-12-8-10 12-8-12-12 8-4-14-14 4 2-14-14-2 6-12-12-6 10-10-8-12 14-4-4-14 14 2 2-14 12 8z" fill="#c8702a" stroke="none"/>' +
    '<circle cx="60" cy="62" r="32" fill="#f2b64a"/>' +
    '<ellipse cx="60" cy="78" rx="14" ry="10" fill="#fbe0a8"/>' +
    '<path d="M54 70h12l-6 7z" fill="#6b3f22"/><path d="M60 77v5q-5 4-10 1m10-1q5 4 10 1" fill="none" stroke-width="3"/>') +
    goz(48, 56, 5) + goz(72, 56, 5),
  zebra: G(
    '<path d="M30 30l-6-20 16 12m40 0 16-12-6 20" fill="#f7f4ec"/>' +
    '<path d="M36 20q24-12 48 0 10 30 2 58-6 32-26 32t-26-32q-8-28 2-58z" fill="#f7f4ec"/>' +
    '<path d="M60 12v22M42 22l8 16m28-16-8 16M34 44l14 8m38-8-14 8M36 64l12 2m36-2-12 2" fill="none" stroke="#2e3638" stroke-width="6"/>' +
    '<ellipse cx="60" cy="96" rx="20" ry="15" fill="#4d4f52"/>' +
    '<circle cx="53" cy="96" r="3" fill="#f7f4ec" stroke="none"/><circle cx="67" cy="96" r="3" fill="#f7f4ec" stroke="none"/>') + goz(44, 60, 4.5) + goz(76, 60, 4.5),
  kelebek: G(
    '<path d="M58 56Q30 8 12 26q-10 22 46 34z" fill="#f2a13a"/>' +
    '<path d="M62 56Q90 8 108 26q10 22-46 34z" fill="#f2a13a"/>' +
    '<path d="M58 62Q20 70 24 94q12 16 34-26zm4 0q38 8 34 32-12 16-34-26z" fill="#e2463a"/>' +
    '<circle cx="32" cy="32" r="7" fill="#fff3c0"/><circle cx="88" cy="32" r="7" fill="#fff3c0"/>' +
    '<ellipse cx="60" cy="62" rx="6" ry="30" fill="#3b4a45"/>' +
    '<path d="M56 34q-8-16-16-20m24 20q8-16 16-20" fill="none" stroke-width="3"/>'),
  kirpi: G(
    '<path d="M14 90l2-18-10-8 14-6-4-16 16 2 2-16 14 8 8-14 10 12 12-10 4 16 16-6-2 16 16 2-8 14 10 10-14 6z" fill="#7a5433"/>' +
    '<path d="M64 94q34 2 48-16-12-24-46-24z" fill="#e3bf8e"/>' +
    '<ellipse cx="54" cy="92" rx="44" ry="12" fill="#9b7249"/>') + '<circle cx="108" cy="78" r="5" fill="#33403a"/>' + goz(90, 72, 4),
  ayi: G(
    '<circle cx="28" cy="30" r="16" fill="#8a5a33"/><circle cx="92" cy="30" r="16" fill="#8a5a33"/>' +
    '<circle cx="28" cy="30" r="7" fill="#c89464"/><circle cx="92" cy="30" r="7" fill="#c89464"/>' +
    '<circle cx="60" cy="64" r="44" fill="#9b6a3e"/>' +
    '<ellipse cx="60" cy="82" rx="20" ry="16" fill="#d9ab7a"/>' +
    '<ellipse cx="60" cy="74" rx="8" ry="6" fill="#33403a"/>' +
    '<path d="M60 80v6q-6 5-11 1m11-1q6 5 11 1" fill="none" stroke-width="3"/>') + goz(44, 56, 5) + goz(76, 56, 5),
  kurbaga: G(
    '<circle cx="36" cy="36" r="18" fill="#5fb44a"/><circle cx="84" cy="36" r="18" fill="#5fb44a"/>' +
    '<ellipse cx="60" cy="72" rx="50" ry="36" fill="#6fc255"/>' +
    '<path d="M24 78q36 28 72 0" fill="none" stroke-width="4"/>' +
    '<circle cx="36" cy="36" r="10" fill="#fff"/><circle cx="84" cy="36" r="10" fill="#fff"/>' +
    '<circle cx="26" cy="64" r="4" fill="#f59aa8" stroke="none"/><circle cx="94" cy="64" r="4" fill="#f59aa8" stroke="none"/>') +
    goz(37, 37, 5.5) + goz(85, 37, 5.5),
  bisiklet: G(
    '<circle cx="28" cy="80" r="22" fill="none" stroke-width="7"/><circle cx="92" cy="80" r="22" fill="none" stroke-width="7"/>' +
    '<circle cx="28" cy="80" r="4" fill="#33403a"/><circle cx="92" cy="80" r="4" fill="#33403a"/>' +
    '<path d="M28 80l20-32h36L92 80M48 48l14 32 22-32M58 80h4" fill="none" stroke="#3a9bd0" stroke-width="7"/>' +
    '<path d="M28 80l20-32h36L92 80M48 48l14 32 22-32" fill="none" stroke-width="2"/>' +
    '<path d="M40 40h16M84 48l-4-14h12" fill="none" stroke-width="6"/>')
});

/** Sembolün SVG'si (120×120). Bilinmeyen anahtar → boş daire (çökmez). */
export function sembolSvg(anahtar, { boy } = {}) {
  const govde = SEMBOL_CIZIMLERI[anahtar] || `<circle cx="60" cy="60" r="40" fill="#e7e2d4" stroke="${C}" stroke-width="3.5"/>`;
  const olcu = boy ? ` width="${boy}" height="${boy}"` : '';
  return `<svg viewBox="0 0 120 120"${olcu} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${govde}</svg>`;
}

export const sembolAdi = anahtar => SEMBOL_ADLARI[anahtar] || 'Sembol';

/** Liste denetimi: turler.js'teki her sembolün çizimi ve adı var mı (testler). */
export function sembolEksikleri() {
  return SEMBOLLER.filter(s => !SEMBOL_CIZIMLERI[s] || !SEMBOL_ADLARI[s]);
}

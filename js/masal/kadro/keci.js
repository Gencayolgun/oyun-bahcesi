/* İki Keçi kadrosu — karakter kodu → çizim tarifi (bkz. kadro.js).

   Hepsi 280×270 tuvalde, dostlar.js'in tasarım dilinde. Ama her biri
   GERÇEK hayvanına benzemeli; bir keçiyi keçi yapan şeyler:
     · uzun, öne doğru daralan bir yüz ve ucunda burun delikli bir ağız
     · yanlara açılan dik kulaklar (sarkık değil)
     · başın tepesinden geriye kıvrılan boğumlu boynuzlar
     · çenenin altında sivri bir SAKAL
     · kehribar göz ve YATAY, dikdörtgen göz bebeği (keçinin imzası)
     · ince bacaklar, ucunda iki parçalı toynak
     · kısa, yukarı kalkık kuyruk
   Ak ile Kara aynı iskeleti paylaşır; renk ve aksesuar ayırır.

   Kunduz: yassı, pullu, kürek gibi kuyruk; turuncu, iri iki ön diş;
   küçük yuvarlak kulaklar; perdeli arka ayaklar.
   Serçe: gri tepe, gözden enseye kestane şerit, beyaz yanak, siyah
   gerdanlık, kısa konik gaga, çizgili kahverengi kanat. */

import {oval, gozler, gulus} from './ortak.js';

/* Keçi gözü: kehribar iris, yatay dikdörtgen bebek, ışıltı. */
const keciGozu = (x, y) =>
  oval(x, y, 11.5, 12.5, '#fffaf0') +
  oval(x, y + 1, 9.5, 10.5, '#e6a93c') +
  oval(x, y - 2, 7, 5, '#f3c96a', 'opacity=".8"') +
  `<rect x="${x - 5}" y="${y - .8}" width="10" height="4.2" rx="2.1" fill="#2b2622"/>` +
  oval(x + 4, y - 5, 3.4, 3.2, 'white') + oval(x - 4, y + 5.5, 1.6, 1.4, 'white', 'opacity=".7"');

/* Keçi iskeleti. Yandan duran gövde, izleyiciye dönmüş baş.
   ton: renkler; g: degrade adı → url. */
function keciGovde(g, t, aksesuar = '') {
  const bacak = (x, arka) => `
    <path d="M${x} 186v44q0 4 2 6h11q2-2 2-6v-44z" fill="${arka ? t.bacakArka : g('kurk')}"/>
    <path d="M${x - 1} 232h17v7q0 4-4 4h-9q-4 0-4-4z" fill="${t.toynak}"/>
    <path d="M${x + 7.5} 234v9" stroke="${t.toynakCizgi}" stroke-width="2"/>`;
  return `
  <path class="dost-kuyruk" d="M214 152q6-20 20-30q2 16-10 32z" fill="${g('kurk')}"/>
  <path d="M222 136q6-8 10-12" stroke="${t.cizgi}" stroke-width="2" opacity=".35" fill="none"/>
  ${bacak(186, true)}${bacak(106, true)}
  ${oval(162, 168, 64, 38, g('kurk'))}
  ${oval(160, 186, 46, 16, g('karin'), 'opacity=".9"')}
  <path d="M128 150q30-12 70-6" stroke="${t.cizgi}" stroke-width="3" opacity=".18" fill="none" stroke-linecap="round"/>
  ${bacak(200, false)}${bacak(122, false)}
  <path d="M86 128q-4 30 22 50q26 6 34-14q-4-26-26-40z" fill="${g('kurk')}"/>
  ${aksesuar.boyun || ''}
  <g transform="rotate(-16 50 92)">${oval(50, 92, 25, 10, g('kurk'))}${oval(52, 93, 16, 5.5, g('ic'))}</g>
  <g transform="rotate(16 142 92)">${oval(142, 92, 25, 10, g('kurk'))}${oval(140, 93, 16, 5.5, g('ic'))}</g>
  <g stroke="${t.boynuz}" stroke-width="11" stroke-linecap="round" fill="none">
    <path d="M86 76q-4-22-20-32"/><path d="M106 76q4-22 20-32"/>
  </g>
  <g stroke="${t.boynuzCizgi}" stroke-width="2.4" stroke-linecap="round" opacity=".75">
    <path d="M78 64l8-4M74 56l8-5M104 60l8 4M108 52l8 5"/>
  </g>
  <path d="M96 68C121 68 131 86 129 104C127 122 118 134 114 146C109 157 83 157 78 146C74 134 65 122 63 104C61 86 71 68 96 68Z" fill="${g('bas')}"/>
  <path d="M88 70q8-10 16 0q-2 8-8 9q-6-1-8-9z" fill="${t.perce}"/>
  ${oval(96, 140, 20, 14, g('burun'))}
  <path d="M90 138q-3-4 1-6M102 138q3-4-1-6" stroke="${t.burunDelik}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M90 147q6 5 12 0" stroke="${t.agiz}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M86 152Q90 170 96 184Q102 170 106 152Z" fill="${g('sakal')}"/>
  <path d="M93 158l3 18M99 158l-2 16" stroke="${t.cizgi}" stroke-width="1.6" opacity=".25"/>
  <g class="dost-gozleri">${keciGozu(80, 104)}${keciGozu(112, 104)}</g>
  ${oval(71, 124, 7, 4.5, t.yanak, 'opacity=".55"')}${oval(121, 124, 7, 4.5, t.yanak, 'opacity=".55"')}
  ${aksesuar.bas || ''}`;
}

const AK_TON = { bacakArka: '#e6dfd0', toynak: '#6f5d4c', toynakCizgi: '#4f4136', cizgi: '#8c8272',
  boynuz: '#dccaa6', boynuzCizgi: '#b09a72', perce: '#ffffff', burunDelik: '#b9867c', agiz: '#8f6b61', yanak: '#f0a79a' };
const KARA_TON = { bacakArka: '#2c2a30', toynak: '#1c1a1e', toynakCizgi: '#4c4852', cizgi: '#c9c2cf',
  boynuz: '#a89a86', boynuzCizgi: '#7c705f', perce: '#3a373f', burunDelik: '#2a262a', agiz: '#d9cfc6', yanak: '#b57886' };

const KUNDUZ_KUYRUK = () => {
  /* Yassı kürek kuyruk: pullu çapraz desen elipsin içinde kalacak biçimde hesaplanır. */
  const cx = 214, cy = 224, rx = 50, ry = 20;
  let cizgi = '';
  for (let k = -5; k <= 5; k++) {
    // 45° iki yönde doğrular: y - cy = ±(x - cx) + k*9
    for (const yon of [1, -1]) {
      const pts = [];
      for (let x = cx - rx; x <= cx + rx; x += 1) {
        const y = cy + yon * (x - cx) * .42 + k * 7;
        if (((x - cx) / (rx - 4)) ** 2 + ((y - cy) / (ry - 3)) ** 2 <= 1) pts.push([x, y]);
      }
      if (pts.length > 2) cizgi += `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}L${pts[pts.length - 1][0].toFixed(1)} ${pts[pts.length - 1][1].toFixed(1)}`;
    }
  }
  return `<g class="dost-kuyruk" transform="rotate(-16 ${cx} ${cy})">
    ${oval(cx, cy, rx, ry, '#5b4638')}${oval(cx - 4, cy - 3, rx - 8, ry - 6, '#6d5646')}
    <path d="${cizgi}" stroke="#3f3129" stroke-width="1.8" opacity=".7" fill="none"/>
    <path d="M${cx - rx + 6} ${cy}q-10 2-14 6" stroke="#5b4638" stroke-width="10" stroke-linecap="round" fill="none"/></g>`;
};

export default {
  /* Ak — beyaz keçi. Kulağının arkasında bir papatya. */
  'keci-ak': {
    degrade: { kurk: ['#ffffff', '#f2ede3', '#d6cebd'], bas: ['#ffffff', '#f6f2ea', '#ddd5c4'],
               karin: ['#fffdf8', '#ece6d9'], ic: ['#f8d3ca', '#e5a99c'], burun: ['#f6e3dc', '#e3c3b8'],
               sakal: ['#fbf8f2', '#e2dacb'] },
    ozel: g => keciGovde(g, AK_TON, {
      boyun: `<path d="M98 160q16 10 36 4" stroke="#7fb3c8" stroke-width="7" fill="none" stroke-linecap="round"/>`,
      bas: `<g transform="translate(138 74)">
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => oval(Math.cos(i / 8 * Math.PI * 2) * 9, Math.sin(i / 8 * Math.PI * 2) * 9, 6, 3.6, '#ffffff',
          `transform="rotate(${i * 45} ${Math.cos(i / 8 * Math.PI * 2) * 9} ${Math.sin(i / 8 * Math.PI * 2) * 9})" stroke="#e9e1d0" stroke-width=".8"`)).join('')}
        ${oval(0, 0, 5.5, 5.5, '#f2c94c')}${oval(-1.5, -1.5, 2, 2, '#fbe29a')}</g>` })
  },

  /* Kara — siyah keçi. Kırmızı tasmasında pirinç bir çan. */
  'keci-kara': {
    degrade: { kurk: ['#6c6873', '#403d45', '#242227'], bas: ['#77737e', '#46434b', '#2a282d'],
               karin: ['#5a5660', '#35323a'], ic: ['#c79aa2', '#95697a'], burun: ['#6a6570', '#4a4650'],
               sakal: ['#3e3b43', '#1d1b20'] },
    ozel: g => keciGovde(g, KARA_TON, {
      boyun: `<path d="M96 158q18 12 40 4" stroke="#d65a4a" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M110 166q-9 0-9 11q0 7 9 7t9-7q0-11-9-11z" fill="#e8b84a"/>
        <path d="M102 180h16" stroke="#b98a2c" stroke-width="2.4"/>${oval(110, 186, 3, 3, '#8a6420')}
        ${oval(107, 171, 2.4, 3, '#fbe1a0', 'opacity=".8"')}` })
  },

  /* Usta — köprüyü ve barajı yapan kunduz. Kulağında marangoz kalemi,
     kucağında bir kütük. */
  'kunduz-usta': {
    degrade: { kurk: ['#c99a6a', '#9a6a42', '#6e4a2c'], karin: ['#e2c197', '#bf966a'], yuz: ['#d8b286', '#b58658'] },
    ozel: g => `
      ${KUNDUZ_KUYRUK()}
      ${oval(104, 240, 30, 11, '#4a372b')}${oval(176, 240, 30, 11, '#4a372b')}
      <path d="M80 240h12M92 244h12M176 244h12M188 240h12" stroke="#2f231c" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>
      <path d="M140 136C96 136 80 188 86 216C90 244 190 244 194 216C200 188 184 136 140 136Z" fill="${g('kurk')}"/>
      ${oval(140, 204, 36, 34, g('karin'))}
      <g transform="rotate(-6 140 188)">
        <rect x="94" y="178" width="92" height="24" rx="12" fill="#b88a58"/>
        ${oval(186, 190, 8, 12, '#e9cfa3')}<path d="M186 184a3 3 0 1 1 0 12a6 6 0 1 1 0-12" stroke="#b88a58" stroke-width="1.6" fill="none"/>
        <path d="M104 186h60M110 194h50" stroke="#946c42" stroke-width="2" opacity=".6"/>
      </g>
      ${oval(106, 190, 11, 9, '#4a372b')}${oval(174, 188, 11, 9, '#4a372b')}
      ${oval(102, 78, 13, 13, '#7c5436')}${oval(178, 78, 13, 13, '#7c5436')}
      ${oval(102, 80, 7, 7, '#5a3b26')}${oval(178, 80, 7, 7, '#5a3b26')}
      ${oval(140, 114, 52, 44, g('kurk'))}
      ${oval(140, 140, 28, 20, g('yuz'))}
      ${gozler(118, 162, 104, .72)}
      ${oval(140, 128, 12, 8.5, '#3a2a22')}${oval(137, 125, 4, 2.5, 'white', 'opacity=".45"')}
      <path d="M140 136v6M140 142q-8 6-14 2M140 142q8 6 14 2" stroke="#5a3b26" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <rect x="131" y="146" width="18" height="20" rx="3" fill="#f2a23a"/>
      <path d="M140 146v20" stroke="#c97a22" stroke-width="2"/>
      <rect x="131" y="146" width="18" height="20" rx="3" fill="none" stroke="#c97a22" stroke-width="1.6"/>
      <g stroke="#7a5a44" stroke-width="2" stroke-linecap="round" opacity=".75" fill="none">
        <path d="M122 134q-26-6-40-2M122 140q-24 2-38 8M158 134q26-6 40-2M158 140q24 2 38 8"/>
      </g>
      ${oval(106, 130, 8, 5, '#e3a07c', 'opacity=".6"')}${oval(174, 130, 8, 5, '#e3a07c', 'opacity=".6"')}
      <g transform="rotate(-38 186 74)">
        <rect x="160" y="70" width="46" height="8" rx="2" fill="#f0c64a"/>
        <path d="M206 70l9 4-9 4z" fill="#e8cfa0"/><path d="M212 72.6l3 1.4-3 1.4z" fill="#3b3b3b"/>
        <rect x="156" y="70" width="6" height="8" rx="1.5" fill="#e59a8c"/>
      </g>`
  },

  /* Cıkcık — erkek ev serçesi. Yandan, sağa bakıyor; bir dala konmuş
     gibi yatay duruş (önden, dik duran bir kuş baykuşa benziyordu).
     Serçeyi serçe yapanlar: gri tepe, gözün arkasından enseye inen
     KESTANE bant, açık gri yanak, gagadan göğse inen SİYAH gerdanlık,
     kısa kalın KONİK gaga, siyah çizgili kahverengi sırt ve kanat,
     kanatta beyaz bir şerit, yukarı kalkık kısa kuyruk, pembemsi bacak. */
  'serce-cikcik': {
    degrade: { govde: ['#c9a27a', '#a5774b', '#7a5433'], karin: ['#f1ede6', '#dcd5ca', '#c4bcb0'],
               kanat: ['#c08d5c', '#95643b', '#6e4829'], tepe: ['#bcc1c6', '#9aa0a6', '#7f858b'],
               bas: ['#b27447', '#955630', '#743f20'] },
    ozel: g => `
      <g class="dost-kuyruk">
        <path d="M100 168Q66 150 30 134Q24 146 30 158Q62 178 104 190Z" fill="#6f4c30"/>
        <path d="M44 146q28 12 56 30M36 154q30 14 64 28" stroke="#4d3421" stroke-width="2.4" opacity=".55" fill="none"/>
      </g>
      <path d="M96 240h112" stroke="#8a6446" stroke-width="7" stroke-linecap="round"/>
      <g stroke="#c9937e" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M144 214l-5 26M168 212l1 28"/>
        <path d="M128 240h22M139 240l-6 7M159 240h22M170 240l6 7"/>
      </g>
      ${oval(148, 180, 68, 44, g('govde'), 'transform="rotate(-14 148 180)"')}
      ${oval(182, 194, 42, 30, g('karin'), 'transform="rotate(-24 182 194)"')}
      <g class="dost-kanat-sag">
        ${oval(128, 174, 56, 31, g('kanat'), 'transform="rotate(-12 128 174)"')}
        <path d="M98 166q16-9 34-7M104 180q18-9 38-7M112 194q16-7 34-5" stroke="#3a2618" stroke-width="5.5" stroke-linecap="round" opacity=".6" fill="none"/>
        <path d="M158 156q9 12 5 30" stroke="#f6f1e8" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M84 180Q70 190 64 198Q94 200 116 190Z" fill="#4d3421"/>
      </g>
      ${oval(186, 146, 28, 26, g('bas'))}
      ${oval(200, 116, 35, 33, g('bas'))}
      <path d="M166 110Q168 80 200 80Q228 80 234 104Q222 98 206 99Q186 100 166 110Z" fill="${g('tepe')}"/>
      ${oval(197, 131, 19, 13, '#eeebe5', 'transform="rotate(-10 197 131)"')}
      <path d="M216 134Q226 138 224 150Q218 168 200 176Q190 162 200 148Q206 138 216 134Z" fill="#2b2826"/>
      <path d="M218 106q7 2 13 8" stroke="#2b2826" stroke-width="5" stroke-linecap="round"/>
      ${oval(211, 105, 10, 10.5, '#2a1f19')}${oval(214, 101, 3.6, 3.8, 'white')}${oval(208, 110, 1.6, 1.6, 'white', 'opacity=".7"')}
      <path d="M229 108Q246 110 254 118Q246 126 229 126Q224 117 229 108Z" fill="#4a4540"/>
      <path d="M230 117H252" stroke="#2f2b28" stroke-width="1.6"/>
      <path d="M232 111q9 1 15 5" stroke="#8a8279" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${oval(196, 136, 7, 4, '#eab0a0', 'opacity=".5"')}`
  }
};

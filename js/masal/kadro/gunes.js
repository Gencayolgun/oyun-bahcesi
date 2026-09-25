/* Güneş ile Rüzgâr kadrosu — karakter kodu → çizim tarifi (bkz. kadro.js).

   Dört karakter, dördü de "gerçeğine" benzemeli:
     gunes-parlak    Güneş: yuvarlak, sıcak, çevresinde ışın ışın parlayan bir yüz
     ruzgar-savrun   Rüzgâr: yanaklarını şişirip üfleyen kabarık bir bulut;
                     ağzından kıvrılan rüzgâr çizgileri çıkar
     ayi-pofuduk     Yolcu ayı: kafanın tepesinde iki YUVARLAK kulak, öne
                     çıkan açık renk burun (ucunda iri siyah burun), küçük
                     boncuk gözler, iri gövde, pençeli patiler. Üstünde kalın
                     bir palto ve çizgili bir atkı var — masal onun paltosunu
                     konu alıyor.
     kirlangic-cik   Kırlangıç: sırtı parlak lacivert, alnı ve gerdanı kiremit
                     kırmızısı, göğsü krem; uzun sivri kanatlar ve derin
                     ÇATAL kuyruk (kırlangıcı kırlangıç yapan şey). Minik
                     gaga; bir telin üstüne tünemiş. */

import {oval, gozler} from './ortak.js';

/* Güneş ışınları: dairenin çevresinde uzun-kısa sıralanan yuvarlak uçlu dilimler. */
function isinlar(cx, cy, ic, uzun, kisa, adet, dolgu) {
  let s = '';
  for (let i = 0; i < adet; i++) {
    const a = i / adet * Math.PI * 2 - Math.PI / 2, d = i % 2 ? kisa : uzun, en = i % 2 ? .1 : .13;
    const p = (r, t) => `${(cx + Math.cos(t) * r).toFixed(1)} ${(cy + Math.sin(t) * r).toFixed(1)}`;
    s += `<path d="M${p(ic, a - en)}L${p(d, a - .02)}Q${p(d + 7, a)} ${p(d, a + .02)}L${p(ic, a + en)}Z" fill="${dolgu}"/>`;
  }
  return s;
}

/* Kırlangıç ve ayının küçük, parlak boncuk gözleri (gerçek hayvanda göz aklı görünmez). */
const boncuk = (x, y, r = 8) => oval(x, y, r, r * 1.1, '#221c22') + oval(x + r * .35, y - r * .4, r * .36, r * .4, 'white') +
  oval(x - r * .3, y + r * .45, r * .16, r * .16, 'white', 'opacity=".6"');

export default {
  /* Güneş — Parlak. Sıcak, yavaş, sabırlı. */
  'gunes-parlak': {
    degrade: { yuz: ['#fff6c4', '#ffd75e', '#f2a23a'], isin: ['#ffe79a', '#f6b544'], hale: ['#fff3c9', '#ffe7a1'] },
    ozel: g => `
      ${oval(140, 132, 112, 112, g('hale'), 'opacity=".35"')}
      <g class="gunes-isinlari">${isinlar(140, 132, 66, 110, 92, 16, g('isin'))}</g>
      ${oval(140, 132, 70, 70, g('yuz'))}
      ${oval(118, 104, 30, 20, '#fffbe3', 'opacity=".45" transform="rotate(-28 118 104)"')}
      <path d="M100 108q10-9 20-2M160 106q10-7 20 2" stroke="#c9832e" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      ${gozler(114, 166, 128, .8)}
      ${oval(98, 154, 13, 8, '#f39a6b', 'opacity=".7"')}${oval(182, 154, 13, 8, '#f39a6b', 'opacity=".7"')}
      <path d="M122 158q18 20 36 0" fill="#d9633f" stroke="#b4512f" stroke-width="3" stroke-linecap="round"/>
      <path d="M130 164q10 7 20 0" fill="#f5a38c"/>`
  },

  /* Rüzgâr — Savrun. Kabarık bir bulut; yanakları şişik, dudakları büzük,
     ağzından sola doğru kıvrılan rüzgâr çizgileri çıkıyor. Kızgın değil,
     hevesli: kaşları yukarıda. */
  'ruzgar-savrun': {
    degrade: { bulut: ['#ffffff', '#e4eff6', '#aec7d8'], golge: ['#d3e2ec', '#9fb9cb'], yanak: ['#f8c9c4', '#eea39e'] },
    ozel: g => `
      <g fill="${g('golge')}">
        ${oval(176, 196, 70, 30)}${oval(110, 196, 52, 26)}
      </g>
      <g fill="${g('bulut')}">
        ${oval(206, 150, 50, 46)}${oval(164, 104, 58, 54)}${oval(110, 118, 50, 48)}
        ${oval(226, 108, 32, 30)}${oval(150, 166, 82, 44)}${oval(92, 160, 44, 38)}
      </g>
      ${oval(150, 86, 30, 16, 'white', 'opacity=".7"')}
      <g class="ruzgar-cizgileri" fill="none" stroke="#8fb6cf" stroke-width="6" stroke-linecap="round">
        <path d="M58 150q-22 2-40-4"/>
        <path d="M60 166q-26 8-44 4q-12-4-6-14q8-6 14 4"/>
        <path d="M62 182q-20 16-38 20"/>
      </g>
      <g fill="none" stroke="#bcd6e6" stroke-width="3.4" stroke-linecap="round" opacity=".9">
        <path d="M34 132q-14-2-20 4"/><path d="M40 210q-10 8-22 6"/>
      </g>
      <path d="M100 112q12-12 26-4M148 108q14-8 26 4" stroke="#5f7f94" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      ${gozler(114, 160, 132, .78)}
      ${oval(84, 160, 20, 18, g('yanak'))}${oval(170, 164, 22, 18, g('yanak'), 'opacity=".85"')}
      ${oval(80, 154, 6, 4, 'white', 'opacity=".6"')}
      <g>${oval(62, 166, 12, 11, '#c9716a')}${oval(62, 166, 6, 6, '#7a3a3a')}</g>`
  },

  /* Yolcu ayı — Pofuduk. Kalın paltolu, çizgili atkılı. */
  'ayi-pofuduk': {
    degrade: { kurk: ['#b98556', '#8c5a34', '#6a4226'], burun: ['#f1d7b0', '#d8b58a'], palto: ['#e8a23f', '#c97e27', '#a86219'],
               atki: ['#e3584a', '#bf3b33'] },
    ozel: g => `
      ${oval(96, 66, 18, 17, g('kurk'))}${oval(184, 66, 18, 17, g('kurk'))}
      ${oval(97, 68, 9, 8, '#a2724c')}${oval(183, 68, 9, 8, '#a2724c')}
      ${oval(106, 236, 30, 13, '#6a4226')}${oval(174, 236, 30, 13, '#6a4226')}
      ${oval(106, 238, 13, 6, '#caa27a', 'opacity=".75"')}${oval(174, 238, 13, 6, '#caa27a', 'opacity=".75"')}
      <path d="M140 150C98 150 78 176 76 204C74 232 90 238 140 238C190 238 206 232 204 204C202 176 182 150 140 150Z" fill="${g('palto')}"/>
      <path d="M140 156v80" stroke="#9a5a17" stroke-width="3" opacity=".6"/>
      <path d="M118 158l22 30 22-30" fill="#c77b25" stroke="#a0621c" stroke-width="3" stroke-linejoin="round"/>
      <g fill="#6e4a2c">${oval(152, 196, 6, 6)}${oval(152, 216, 6, 6)}</g>
      <path d="M96 212h24M160 212h24" stroke="#a0621c" stroke-width="3" stroke-linecap="round"/>
      <path d="M80 176q-20 18-16 44" stroke="${g('palto')}" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M200 176q20 18 16 44" stroke="${g('palto')}" stroke-width="26" fill="none" stroke-linecap="round"/>
      ${oval(64, 224, 14, 12, '#7a4c2c')}${oval(216, 224, 14, 12, '#7a4c2c')}
      <path d="M57 230v5M64 232v5M71 230v5M209 230v5M216 232v5M223 230v5" stroke="#f3e2c6" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M92 152q48 22 96 0l-2 16q-46 20-92 0z" fill="${g('atki')}"/>
      <path d="M108 160l-4 14M126 166l-2 14M146 168v14M166 164l2 14" stroke="#fff4e6" stroke-width="5" opacity=".9"/>
      <path d="M168 164q10 30 2 54l-20-2q8-24 0-50z" fill="${g('atki')}"/>
      <path d="M156 186l18 2M154 200l18 2" stroke="#fff4e6" stroke-width="5" opacity=".9"/>
      <path d="M152 216l-2 10M158 217l-1 10M164 217v10M170 218l1 10" stroke="#bf3b33" stroke-width="3" stroke-linecap="round"/>
      ${oval(88, 124, 18, 16, g('kurk'))}${oval(192, 124, 18, 16, g('kurk'))}
      <path d="M74 122l-6 6 8 2-5 7 9 0M206 122l6 6-8 2 5 7-9 0" fill="#7a4c2c"/>
      ${oval(140, 106, 62, 52, g('kurk'))}
      ${oval(116, 80, 18, 9, '#c89566', 'opacity=".45" transform="rotate(-20 116 80)"')}
      ${oval(140, 112, 15, 22, '#b07e52', 'opacity=".55"')}
      ${oval(140, 136, 29, 24, g('burun'))}
      <path d="M125 122q15-13 30 0q-2 13-15 15q-13-2-15-15z" fill="#2e201a"/>
      ${oval(135, 122, 5, 2.6, 'white', 'opacity=".5"')}
      <path d="M140 137v6M131 146q9 7 9-2q0 9 9 2" stroke="#4a3226" stroke-width="3" fill="none" stroke-linecap="round"/>
      <g class="dost-gozleri">${boncuk(121, 101, 6.2)}${boncuk(159, 101, 6.2)}</g>
      <path d="M112 90q8-5 15 0M153 90q8-5 15 0" stroke="#5a3820" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55"/>
      ${oval(104, 130, 8, 4.5, '#e89a7c', 'opacity=".45"')}${oval(176, 130, 8, 4.5, '#e89a7c', 'opacity=".45"')}
      <path d="M94 244v-6M104 246v-7M114 244v-6M166 244v-6M176 246v-7M186 244v-6" stroke="#f3e2c6" stroke-width="2.4" stroke-linecap="round"/>`
  },

  /* Kırlangıç — Cik. Yol arkadaşı; bir telin üstüne tünemiş, çatal kuyruklu. */
  'kirlangic-cik': {
    degrade: { sirt: ['#4f6fa8', '#2c4478', '#1a2a50'], kanat: ['#3e5c95', '#1f3262'], gogus: ['#fffaf0', '#f3e4cc'],
               gerdan: ['#e0774f', '#b9492f'] },
    ozel: g => `
      <path d="M40 232H250" stroke="#8a7a66" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M160 188C186 204 214 226 252 262C218 246 190 228 168 208Z" fill="${g('kanat')}"/>
      <path d="M150 196C166 216 180 240 196 268C170 250 156 230 146 210Z" fill="${g('kanat')}"/>
      <g opacity=".85">${oval(200, 230, 4, 2.4, 'white', 'transform="rotate(38 200 230)"')}${oval(172, 234, 3.6, 2.2, 'white', 'transform="rotate(58 172 234)"')}</g>
      <path d="M126 222l-4 12M142 222l2 12" stroke="#3a2e2a" stroke-width="4" stroke-linecap="round"/>
      <path d="M114 234h14M136 234h14" stroke="#3a2e2a" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M92 150C88 118 110 96 138 98C172 100 190 130 186 164C182 200 160 224 132 224C104 224 94 184 92 150Z" fill="${g('sirt')}"/>
      <path d="M98 150C100 184 112 220 134 222C154 222 168 196 164 166C160 140 142 132 124 134C108 136 97 142 98 150Z" fill="${g('gogus')}"/>
      <path class="dost-kanat-sag" d="M150 118C184 130 218 170 244 222C214 204 184 188 162 174C146 162 140 132 150 118Z" fill="${g('kanat')}"/>
      <path d="M170 146q24 22 44 52M164 162q22 18 40 40" stroke="#6f8cc2" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="M92 100C92 70 114 54 136 56C160 58 172 78 168 100C166 124 146 138 124 138C104 138 92 124 92 100Z" fill="${g('sirt')}"/>
      ${oval(126, 70, 16, 8, '#6f8cc2', 'opacity=".45" transform="rotate(-14 126 70)"')}
      <path d="M92 104C98 124 112 138 128 138C136 138 142 132 140 124C130 124 118 118 112 106Z" fill="${g('gerdan')}"/>
      <path d="M94 84C98 76 104 72 110 74C106 80 102 88 100 96Z" fill="${g('gerdan')}"/>
      <path d="M94 92L70 100L94 106Z" fill="#2b2320"/>
      <path d="M94 99L76 100" stroke="#57463d" stroke-width="1.4" opacity=".6"/>
      <g class="dost-gozleri">${boncuk(116, 92, 8.5)}</g>
      ${oval(132, 112, 8, 5, '#f09a80', 'opacity=".45"')}`
  }
};

/* Tilki ile Üzümler kadrosu — karakter kodu → çizim tarifi (bkz. kadro.js).

   Hepsi 280×270 tuvalde, dostlar.js'in tasarım dilinde. Ama her biri
   GERÇEK hayvanına benzemeli (yuvarlak kafalı bir "hayvancık" değil):

   Tilki (Kızıl): üçgen, iri, arkası ve ucu KARA kulaklar; öne doğru
     sivrilen burun ve ucunda kara burun; yanaklarda ve göğüste BEYAZ;
     kehribar gözler; bacaklarda kara "çorap"; gür, BEYAZ UÇLU kuyruk.
   Sincap (Fıstık): kulak uçlarında PÜSKÜL; sırtından yukarı kıvrılan,
     gövdesi kadar büyük gür kuyruk; gözün çevresinde açık halka; kısa
     burun ve önde iki kesici diş; ön patilerinde tuttuğu ceviz.
   Kirpi (Yumak): sırtı baştan kuyruğa DİKENLERLE kaplı kubbe (koyu kök,
     açık uç); diken olmayan açık renk yüz; uzun, sivri burun ve ucunda
     parlak kara burun; küçük yuvarlak kulak; kısa bacaklar. Dikenlerinde
     taşıdığı bir elma (kirpiler böyle anlatılır).
   Arı (Vızvız): sarı-kara ÇİZGİLİ tüylü gövde; iki çift saydam kanat;
     iri kara bileşik gözler; dirsekli iki duyarga; altı ince bacak;
     ucunda küçük, yumuşak iğne. */

import {oval, gulus} from './ortak.js';

const halka = (x, y) => oval(x + 3.5, y - 4, 3.6, 4, 'white') + oval(x - 3, y + 4.5, 1.6, 1.6, 'white', 'opacity=".7"');

/* Tilki gözü: kehribar iris, kara bebek, ışıltı. Hafif çekik. */
const tilkiGozu = (x, y, yon) =>
  `<g transform="rotate(${yon * 8} ${x} ${y})">` +
  oval(x, y, 12.5, 11, '#fffaf0') + oval(x, y + .5, 9.5, 9.5, '#d98a1f') + oval(x, y - 2, 6.5, 4, '#f2b64e', 'opacity=".8"') +
  oval(x, y + 1, 5.2, 6.8, '#2a1d17') + halka(x, y) + '</g>';

/* Sincap gözü: iri, parlak, çevresinde açık bir halka. */
const sincapGozu = (x, y) =>
  oval(x, y, 13, 14, '#f6e7cf') + oval(x, y + 1, 10, 11, '#2b211c') + oval(x + 3.5, y - 3.5, 3.8, 4.2, 'white') + oval(x - 3, y + 5, 1.5, 1.5, 'white', 'opacity=".7"');

/* Kirpi dikenleri: bir kubbenin çevresine dışa bakan ince sivri üçgenler.
   İki katman: koyu kökler ve açık uçlu dikenler (kirpiyi kirpi yapan şey). */
function dikenler(cx, cy, rx, ry, a0, a1, adet, boy, renk, uc) {
  let koyu = '', acik = '';
  for (let i = 0; i < adet; i++) {
    const t = a0 + (a1 - a0) * (i / (adet - 1));
    const s = (i * 37 % 11) / 11;                          // sabit "rastgele" oynama
    const aci = t + (s - .5) * .12;
    const bx = cx + Math.cos(aci) * rx * .9, by = cy + Math.sin(aci) * ry * .9;
    const L = boy * (.8 + s * .45);
    const tx = bx + Math.cos(aci) * L, ty = by + Math.sin(aci) * L;
    const nx = -Math.sin(aci) * 4.2, ny = Math.cos(aci) * 4.2;
    const ux = bx + Math.cos(aci) * L * .62, uy = by + Math.sin(aci) * L * .62;
    koyu += `M${(bx + nx).toFixed(1)} ${(by + ny).toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}L${(bx - nx).toFixed(1)} ${(by - ny).toFixed(1)}Z`;
    acik += `M${ux.toFixed(1)} ${uy.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}`;
  }
  return `<path d="${koyu}" fill="${renk}"/><path d="${acik}" stroke="${uc}" stroke-width="2.2" stroke-linecap="round"/>`;
}

/* Sırt dikenleri: kubbenin İÇİNİ de kaplayan kısa, dışa yatık dikenler.
   Yalnız kenarda diken olunca sırt düz kahverengi bir taş gibi duruyordu;
   kirpinin sırtı baştan kuyruğa dikendir. Dikenler kubbenin altındaki bir
   merkezden dışa doğru yatar; koyu gövde, açık uç. */
function sirtDikenleri(cx, cy, rx, ry, adet) {
  let koyu = '', acik = '';
  const mx = cx, my = cy + ry * .75;
  for (let i = 0; i < adet; i++) {
    const u = ((i * 61) % adet) / adet, v = ((i * 17) % 7) / 7;            // sabit "rastgele" dağılım
    const t = Math.PI * (1.08 + u * .84), k = .25 + v * .6;
    const x = cx + Math.cos(t) * rx * k, y = cy + Math.sin(t) * ry * k;
    if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 > .7) continue;
    const a = Math.atan2(y - my, x - mx), L = 15 + v * 7;
    const ux = x + Math.cos(a) * L, uy = y + Math.sin(a) * L, nx = -Math.sin(a) * 2.6, ny = Math.cos(a) * 2.6;
    koyu += `M${(x + nx).toFixed(1)} ${(y + ny).toFixed(1)}L${ux.toFixed(1)} ${uy.toFixed(1)}L${(x - nx).toFixed(1)} ${(y - ny).toFixed(1)}Z`;
    acik += `M${(x + Math.cos(a) * L * .55).toFixed(1)} ${(y + Math.sin(a) * L * .55).toFixed(1)}L${ux.toFixed(1)} ${uy.toFixed(1)}`;
  }
  return `<path d="${koyu}" fill="#4a3727"/><path d="${acik}" stroke="#f1e4cc" stroke-width="1.8" stroke-linecap="round"/>`;
}

export default {
  /* Kızıl — hevesli ama çabuk pes eden tilki. Oturmuş, başı bize dönük,
     gür kuyruğu yanından dolanıyor. Boynunda yeşil bir asma yaprağı. */
  'tilki-kizil': {
    degrade: { kurk: ['#f4a25a', '#e0762f', '#b2511c'], bas: ['#f6ac66', '#e27a33', '#b8561f'],
               beyaz: ['#ffffff', '#fbf3e7', '#eadbc6'], kuyruk: ['#f09a4f', '#d86a27', '#a94a19'],
               kara: ['#4a3830', '#2c211c'] },
    ozel: g => `
      <g class="dost-kuyruk">
        <path d="M168 232C214 240 256 218 258 176C260 138 240 112 214 106C198 104 188 116 198 126C222 132 236 150 232 178C228 206 200 216 172 210Z" fill="${g('kuyruk')}"/>
        <path d="M214 106C198 104 188 116 198 126C212 130 224 136 230 146C240 138 238 116 214 106Z" fill="${g('beyaz')}"/>
        <path d="M206 150q14 14 12 34M190 206q20-2 32-14" stroke="#b9561e" stroke-width="3" fill="none" stroke-linecap="round" opacity=".45"/>
      </g>
      ${oval(106, 238, 20, 9, g('kara'))}${oval(174, 238, 20, 9, g('kara'))}
      <path d="M140 136C104 138 92 184 97 218C101 244 179 244 183 218C188 184 176 138 140 136Z" fill="${g('kurk')}"/>
      <path d="M140 146C121 152 115 184 122 212Q140 226 158 212C165 184 159 152 140 146Z" fill="${g('beyaz')}"/>
      <g>
        <path d="M117 196v36q0 8 9 8h4q8 0 8-8v-36z" fill="${g('kurk')}"/>
        <path d="M142 196v36q0 8 9 8h4q8 0 8-8v-36z" fill="${g('kurk')}"/>
        <path d="M117 216v16q0 8 9 8h4q8 0 8-8v-16z" fill="${g('kara')}"/>
        <path d="M142 216v16q0 8 9 8h4q8 0 8-8v-16z" fill="${g('kara')}"/>
        <path d="M124 240v-6M131 240v-6M149 240v-6M156 240v-6" stroke="#6b5448" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g class="dost-kulaklar">
        <path d="M84 84L90 16L132 62Z" fill="${g('kara')}"/>
        <path d="M88 84L93 36L126 64Z" fill="${g('bas')}"/>
        <path d="M96 78L98 44L120 66Z" fill="${g('beyaz')}"/>
        <path d="M196 84L190 16L148 62Z" fill="${g('kara')}"/>
        <path d="M192 84L187 36L154 64Z" fill="${g('bas')}"/>
        <path d="M184 78L182 44L160 66Z" fill="${g('beyaz')}"/>
      </g>
      <path d="M140 150L110 124C90 116 76 100 78 82C80 62 104 52 140 52C176 52 200 62 202 82C204 100 190 116 170 124Z" fill="${g('bas')}"/>
      <path d="M79 90C86 112 112 122 140 150C168 122 194 112 201 90C186 104 168 108 153 107C148 116 132 116 127 107C112 108 94 104 79 90Z" fill="${g('beyaz')}"/>
      <path d="M80 94l-8 10 12-2-6 12 14-6M200 94l8 10-12-2 6 12-14-6" fill="${g('beyaz')}"/>
      <g class="dost-gozleri">${tilkiGozu(114, 90, 1)}${tilkiGozu(166, 90, -1)}</g>
      <path d="M100 76q12-8 24 2M180 76q-12-8-24 2" stroke="#9e4718" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>
      ${oval(140, 140, 10, 7.5, '#2a1f1b')}${oval(137, 137.5, 3.4, 2.2, 'white', 'opacity=".6"')}
      <path d="M140 147v4M133 153q7 5 14 0" stroke="#6a4a3c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <g stroke="#5a4038" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".7">
        <path d="M128 138q-24-6-40-4M128 142q-22 2-36 10"/><path d="M152 138q24-6 40-4M152 142q22 2 36 10"/>
      </g>
      ${oval(102, 118, 7, 4, '#f0a58a', 'opacity=".55"')}${oval(178, 118, 7, 4, '#f0a58a', 'opacity=".55"')}
      <g transform="translate(166 158) rotate(18)">
        <path d="M0 0C-14-2-22 8-18 18C-14 10-6 10 0 14C6 10 14 10 18 18C22 8 14-2 0 0Z" fill="#7fae5a"/>
        <path d="M0 0v16" stroke="#5d8c43" stroke-width="2"/>
      </g>`
  },

  /* Fıstık — kızıl sincap. Oturmuş, ön patilerinde bir ceviz; kuyruğu
     sırtından yukarı kıvrılıyor; kulak uçlarında püskül. */
  'sincap-fistik': {
    degrade: { kurk: ['#d98b4e', '#b86a31', '#8a4a1f'], kuyruk: ['#e0955a', '#c0703a', '#8e4c22'],
               karin: ['#fbecd2', '#efd4ae'], ceviz: ['#c99a62', '#9b6c3c', '#6f4b28'] },
    ozel: g => `
      <g class="dost-kuyruk">
        <path d="M166 232C226 236 254 180 240 128C230 88 196 64 170 78C150 90 158 118 180 112C196 108 206 124 206 146C206 176 190 198 162 210Z" fill="${g('kuyruk')}"/>
        <path d="M178 96q22-6 34 16M214 132q10 24 0 48M196 200q16-10 22-28M170 86q-8 10 0 20" stroke="#8e4c22" stroke-width="3" fill="none" stroke-linecap="round" opacity=".4"/>
        <path d="M226 110q12 18 12 40M236 176q-6 22-24 38" stroke="#f0b27a" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/>
      </g>
      ${oval(118, 238, 24, 9, g('kurk'))}${oval(166, 238, 22, 9, g('kurk'))}
      <path d="M140 130C106 132 94 176 99 212C103 240 177 240 181 212C186 176 174 132 140 130Z" fill="${g('kurk')}"/>
      ${oval(108, 214, 22, 26, g('kurk'))}
      ${oval(140, 196, 25, 34, g('karin'))}
      <g>
        ${oval(140, 176, 17, 15, g('ceviz'))}
        <path d="M140 162v28M130 168q4 8 0 16M150 168q-4 8 0 16" stroke="#6a4424" stroke-width="2" fill="none" opacity=".6"/>
        ${oval(124, 174, 9, 7, g('kurk'))}${oval(156, 174, 9, 7, g('kurk'))}
      </g>
      <g class="dost-kulaklar">
        <g transform="rotate(-14 108 62)">${oval(108, 64, 13, 20, g('kurk'))}${oval(108, 67, 7, 12, '#e8a98e')}
          <path d="M100 50C96 38 98 28 104 22C104 30 106 34 108 36C109 28 113 22 118 20C116 30 116 40 114 50Z" fill="#7a3e19"/></g>
        <g transform="rotate(14 172 62)">${oval(172, 64, 13, 20, g('kurk'))}${oval(172, 67, 7, 12, '#e8a98e')}
          <path d="M180 50C184 38 182 28 176 22C176 30 174 34 172 36C171 28 167 22 162 20C164 30 164 40 166 50Z" fill="#7a3e19"/></g>
      </g>
      <path d="M140 138C112 138 96 124 96 100C96 76 116 62 140 62C164 62 184 76 184 100C184 124 168 138 140 138Z" fill="${g('kurk')}"/>
      ${oval(140, 122, 22, 15, g('karin'))}
      ${oval(108, 114, 10, 8, g('karin'), 'opacity=".75"')}${oval(172, 114, 10, 8, g('karin'), 'opacity=".75"')}
      <g class="dost-gozleri">${sincapGozu(118, 98)}${sincapGozu(162, 98)}</g>
      ${oval(140, 116, 7, 5, '#5a3527')}${oval(138, 114.5, 2.4, 1.6, 'white', 'opacity=".6"')}
      <path d="M140 121v5M132 126q8 5 16 0" stroke="#5a3527" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M136 128h8v7q0 2-2 2h-4q-2 0-2-2z" fill="#fffaf0" stroke="#e1d3bd" stroke-width="1"/>
      <path d="M140 128v9" stroke="#e1d3bd" stroke-width="1"/>
      <g stroke="#5a3a2c" stroke-width="1.5" stroke-linecap="round" fill="none" opacity=".6">
        <path d="M128 118q-18-6-30-4M128 122q-16 2-26 8"/><path d="M152 118q18-6 30-4M152 122q16 2 26 8"/>
      </g>
      ${oval(106, 124, 6, 3.6, '#ee9f89', 'opacity=".55"')}${oval(174, 124, 6, 3.6, '#ee9f89', 'opacity=".55"')}`
  },

  /* Yumak — kirpi. Yandan, başı sola dönük. Sırtı dikenli bir kubbe;
     dikenlerinin arasına bir elma takılmış. */
  'kirpi-yumak': {
    degrade: { sirt: ['#a08466', '#735a42', '#4c3a2a'], yuz: ['#f3dfc2', '#dcc09a', '#b99a72'],
               karin: ['#f8ead6', '#e6d0b0'] },
    ozel: g => `
      ${oval(196, 236, 16, 8, '#8a6a52')}${oval(160, 240, 14, 7, '#8a6a52')}
      ${dikenler(162, 176, 84, 64, Math.PI * .98, Math.PI * 2.02, 44, 30, '#4f3c2c', '#efe2cc')}
      ${oval(162, 180, 86, 62, g('sirt'))}
      ${dikenler(162, 180, 70, 48, Math.PI * 1.02, Math.PI * 1.98, 30, 26, '#6b543f', '#f4e8d4')}
      ${sirtDikenleri(164, 182, 80, 56, 46)}
      <g transform="translate(196 118) rotate(12)">
        ${oval(0, 0, 18, 16, '#dd4f3d')}${oval(-5, -4, 6, 5, '#f39a86', 'opacity=".7"')}
        <path d="M0-14q-2-10 3-14" stroke="#6f4e30" stroke-width="3" stroke-linecap="round"/>
        <path d="M2-16q10-12 20-4-8 8-20 4z" fill="#78b04f"/>
      </g>
      <path d="M126 150C104 140 76 150 58 172C46 184 34 192 28 196C24 199 26 204 31 204C50 206 78 214 104 216C122 216 134 206 136 190C138 174 136 158 126 150Z" fill="${g('yuz')}"/>
      ${oval(28, 198, 8.5, 7, '#2a2220')}${oval(25.5, 195.5, 2.8, 2, 'white', 'opacity=".7"')}
      <path d="M38 206q14 6 26 2" stroke="#8f6f58" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <g class="dost-gozleri">${oval(78, 170, 9, 10, '#2a2220')}${oval(81, 166, 3.2, 3.6, 'white')}${oval(76, 174, 1.4, 1.4, 'white', 'opacity=".7"')}</g>
      <path d="M68 158q10-6 20-1" stroke="#9c7a5c" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".6"/>
      ${oval(108, 150, 11, 10, '#c7a47c')}${oval(108, 151, 6.5, 6, '#e8b9a4')}
      ${oval(84, 190, 8, 5, '#eea08d', 'opacity=".55"')}
      <g stroke="#6f5646" stroke-width="1.3" stroke-linecap="round" fill="none" opacity=".6">
        <path d="M36 196q-14-6-22-4M36 200q-14 2-20 8"/>
      </g>
      <g fill="#b89272">
        ${oval(96, 232, 13, 7)}${oval(128, 238, 13, 7)}
      </g>
      <path d="M86 234h6M92 236h6M118 240h6M124 241h6" stroke="#6b5140" stroke-width="2" stroke-linecap="round" opacity=".6"/>`
  },

  /* Vızvız — bal arısı. Tüylü, çizgili gövde; saydam kanatlar; dirsekli
     duyargalar. Havada, kanat çırpıyor. */
  'ari-vizvi': {
    degrade: { tuy: ['#ffe07a', '#f2b92f', '#c98a14'], bas: ['#ffd25e', '#e9a91f', '#b97f12'],
               kanat: ['#ffffff', '#e6f3f8', '#bfdbe6'], kara: ['#4a3a2c', '#231b16'] },
    ozel: g => `
      <g class="dost-kuyruk" opacity=".82">
        <path d="M150 128C168 72 214 40 244 56C264 68 250 108 204 132C184 142 164 142 150 128Z" fill="${g('kanat')}" stroke="#9cc3d2" stroke-width="2"/>
        <path d="M156 138C190 124 236 124 248 146C256 164 226 176 196 168C176 162 162 152 156 138Z" fill="${g('kanat')}" stroke="#9cc3d2" stroke-width="2"/>
        <path d="M162 124q30-30 64-50M168 138q34-2 64 10" stroke="#a9ccd8" stroke-width="1.6" fill="none"/>
      </g>
      <g stroke="#2e241d" stroke-width="4.5" stroke-linecap="round" fill="none">
        <path d="M122 206l-10 22-8 6M146 212l-2 24-8 6M170 208l8 22 8 4"/>
        <path d="M112 196l-24 14-6 12M184 198l20 12 4 12"/>
      </g>
      <path d="M232 186l20 8-20 6z" fill="#3a2d23"/>
      ${oval(170, 180, 66, 50, g('tuy'))}
      <path d="M150 132C160 150 162 212 150 228M186 134C198 152 200 208 188 226M218 146C228 164 228 200 220 214" stroke="${'#2b211a'}" stroke-width="15" fill="none" stroke-linecap="round"/>
      <path d="M130 148q-10 16-6 34" stroke="#fff3c4" stroke-width="5" stroke-linecap="round" fill="none" opacity=".6"/>
      <g class="dost-kuyruk" opacity=".85">
        <path d="M120 130C100 80 110 36 138 30C160 26 164 70 150 110C144 124 132 134 120 130Z" fill="${g('kanat')}" stroke="#9cc3d2" stroke-width="2"/>
        <path d="M128 118q4-40 14-74" stroke="#a9ccd8" stroke-width="1.6" fill="none"/>
      </g>
      ${oval(96, 156, 50, 46, g('bas'))}
      <path d="M58 132q-6 20 4 40M134 132q6 20-4 40" stroke="#d99a1a" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>
      <g stroke="#2e241d" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M84 116q-6-24-24-34-8-2-12 4"/><path d="M108 114q4-26 22-38 8-2 12 4"/>
      </g>
      ${oval(46, 86, 7, 7, '#2e241d')}${oval(144, 84, 7, 7, '#2e241d')}
      <g class="dost-gozleri">
        ${oval(74, 150, 15, 19, g('kara'))}${oval(118, 150, 15, 19, g('kara'))}
        ${oval(79, 142, 5, 6, 'white')}${oval(123, 142, 5, 6, 'white')}
        ${oval(70, 158, 2, 2.4, 'white', 'opacity=".6"')}${oval(114, 158, 2, 2.4, 'white', 'opacity=".6"')}
      </g>
      ${oval(70, 178, 8, 5, '#f08a6e', 'opacity=".5"')}${oval(122, 178, 8, 5, '#f08a6e', 'opacity=".5"')}
      ${gulus(96, 180, 8)}`
  }
};

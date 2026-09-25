/* Karınca ile Güvercin kadrosu — karakter kodu → çizim tarifi (bkz. kadro.js).

   Dördü de GERÇEK hayvanına benzemeli (sevimli ama tanınır):
     guvercin-pamuk  yandan duran bir kaya güvercini: gövdeye göre KÜÇÜK baş,
                     tombul gri gövde, boyunda yeşil-mor parlayan tüyler,
                     katlı kanatta iki siyah bant, koyu uçlu kuyruk, turuncu
                     göz, gaganın dibinde beyaz et, kısa kırmızı bacaklar.
     karinca-minik   yandan bir karınca: baş, göğüs, ince bel düğümü ve
                     iri karın — üç ayrı bölüm; göğüsten çıkan altı eklemli
                     bacak, dirsekli iki duyarga, iki küçük çene.
     kedi-tekir      oturan tekir kedi: üçgen kulak (içi pembe), alında "M",
                     yanaklarda ve gövdede çizgiler, bıyık, yeşil badem göz
                     (uykulu, göz kapağı yarı inik), halkalı uzun kuyruk.
     kurbaga-zipzip  dere kurbağası: başın ÜSTÜNDE patlak gözler, kocaman
                     geniş ağız, sırtta benekler, açık krem karın, yanlara
                     katlanmış uzun arka bacaklar ve perdeli ayaklar.
   280×270 tuval, zemin gölgesi y≈247 (kadro.js çizer). */
import {oval, gulus} from './ortak.js';

/* Güvercin ve karınca için tek gözler: iri, parlak, sevimli. */
const tekGoz = (x, y, r, iris, bebek = '#1f2328') =>
  oval(x, y, r, r * 1.05, iris) + oval(x + r * .12, y + r * .05, r * .58, r * .62, bebek) +
  oval(x + r * .34, y - r * .32, r * .24, r * .26, 'white') + oval(x - r * .3, y + r * .4, r * .12, r * .12, 'white', 'opacity=".7"');

export default {
  /* ——— Pamuk — kaya güvercini. Sağa bakıyor. ——— */
  'guvercin-pamuk': {
    degrade: {
      govde: ['#dfe4ec', '#b3bcc9', '#8793a3'],
      gogus: ['#ece2ea', '#cdbfcd', '#a99bb0'],
      boyun: ['#8fd1b4', '#4f9d86', '#7a5c98'],
      bas: ['#c9d0da', '#a2abb9', '#7f8998'],
      kanat: ['#e6eaf0', '#bcc4cf', '#98a3b2']
    },
    ozel: (g) => `
      <g class="dost-kuyruk">
        <path d="M92 176Q52 170 26 190Q48 204 94 202Z" fill="#8d97a6"/>
        <path d="M40 184Q30 190 28 191Q34 197 48 199L52 186Z" fill="#3b3f47"/>
        <path d="M94 186Q66 184 44 192" stroke="#aeb7c3" stroke-width="2" fill="none" opacity=".6"/>
      </g>
      <g stroke="#d8606a" stroke-width="7" stroke-linecap="round" fill="none">
        <path d="M128 222l-3 20M156 222l2 20"/>
        <path d="M112 244h16M128 244l8 2M146 244h16M162 244l8 2"/>
      </g>
      ${oval(138, 180, 72, 50, g('govde'), 'transform="rotate(-8 138 180)"')}
      ${oval(178, 176, 36, 42, g('gogus'))}
      <path d="M150 104Q186 92 204 118Q214 150 196 170Q170 184 150 164Q136 140 150 104Z" fill="${g('boyun')}"/>
      <path d="M160 126q18 10 30 2M158 146q20 12 34 0" stroke="#a9e2c7" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
      <g class="dost-kanat-sag">
        ${oval(122, 176, 58, 34, g('kanat'), 'transform="rotate(-10 122 176)"')}
        <path d="M78 196Q64 206 60 212Q88 214 118 206Z" fill="#5b616c"/>
        <path d="M112 152q-6 22 2 46" stroke="#2f333a" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M138 150q-6 24 2 48" stroke="#2f333a" stroke-width="9" fill="none" stroke-linecap="round"/>
        <path d="M86 170q20-6 44 0" stroke="#f3f5f8" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/>
      </g>
      ${oval(196, 96, 31, 29, g('bas'))}
      ${oval(188, 108, 10, 6, '#e6a4ae', 'opacity=".75"')}
      ${tekGoz(206, 90, 11, '#f09a36')}
      <path d="M224 96Q244 98 252 106Q240 110 224 106Z" fill="#454a52"/>
      ${oval(229, 96, 7, 5, '#f4f1ea')}
      <path d="M226 108q6 4 12 2" stroke="#6a5148" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
  },

  /* ——— Minik — karınca. Yandan, sağa bakıyor. ——— */
  'karinca-minik': {
    degrade: {
      karin: ['#b8664a', '#8a3c26', '#5a2216'],
      gogus: ['#c47252', '#944430', '#652a1a'],
      bas: ['#cf7c5a', '#9c4a33', '#6c2c1b']
    },
    ozel: (g) => {
      const bacak = '#5a2618';
      /* Altı bacak göğüsten çıkar: kalça → yukarı kalkan uyluk → diz → yere
         inen ince baldır. Uzak yandaki üçü biraz koyu ve geride. */
      const bacaklar = (renk, dx, op) => `<g stroke="${renk}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${op}">
        <path d="M${178 + dx} 176l${22} -18l${18} 72"/>
        <path d="M${164 + dx} 180l${2} -22l${-8} 76"/>
        <path d="M${150 + dx} 180l${-20} -16l${-34} 70"/>
      </g>`;
      return `
      ${bacaklar('#3e170e', 10, '.75')}
      <g class="dost-kuyruk">
        <g stroke="${bacak}" stroke-width="5" stroke-linecap="round" fill="none">
          <path d="M206 86l6-40l30 -8"/><path d="M220 90l18-34l28 2"/>
        </g>
        ${oval(244, 37, 6, 7, bacak)}${oval(268, 58, 6, 7, bacak)}
      </g>
      ${oval(82, 178, 56, 44, g('karin'), 'transform="rotate(-14 82 178)"')}
      <path d="M46 160q10 30 4 50M66 146q14 36 6 66M88 140q12 36 6 70" stroke="#4d1c11" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>
      ${oval(66, 158, 20, 10, '#e8a489', 'opacity=".4" transform="rotate(-20 66 158)"')}
      ${oval(136, 176, 9, 13, g('gogus'))}
      <path d="M128 178h20" stroke="#6c2c1b" stroke-width="6" stroke-linecap="round"/>
      ${oval(166, 166, 30, 18, g('gogus'), 'transform="rotate(-18 166 166)"')}
      ${bacaklar(bacak, 0, '1')}
      ${oval(214, 124, 42, 40, g('bas'))}
      ${oval(198, 104, 14, 8, '#eaa58a', 'opacity=".45"')}
      ${tekGoz(206, 118, 12, '#1f1b1d', '#1f1b1d')}
      ${tekGoz(234, 120, 10, '#1f1b1d', '#1f1b1d')}
      ${oval(214, 142, 9, 5, '#ef9b86', 'opacity=".8"')}
      <path d="M242 146q14 8 10 22q-8-4-14-12" fill="${bacak}"/>
      <path d="M232 150q10 10 2 22q-6-6-8-14" fill="#6c2c1b"/>
      ${gulus(224, 142, 6)}`;
    }
  },

  /* ——— Tekir — oturan tekir kedi, uykulu gözlerle. ——— */
  'kedi-tekir': {
    degrade: {
      kurk: ['#e3cfae', '#c3a37a', '#94744e'],
      beyaz: ['#fffaf0', '#f0e6d4'],
      ic: ['#f6c3bd', '#e29a92'],
      goz: ['#c8e58a', '#86b84f']
    },
    ozel: (g) => {
      const cizgi = '#6b4f33';
      return `
      <g class="dost-kuyruk">
        <path d="M188 232Q244 236 246 196Q248 168 226 160" stroke="#b08f66" stroke-width="18" fill="none" stroke-linecap="round"/>
        <g stroke="${cizgi}" stroke-width="18" fill="none" stroke-dasharray="7 13" opacity=".85">
          <path d="M188 232Q244 236 246 196Q248 168 226 160"/>
        </g>
      </g>
      ${oval(140, 204, 62, 46, g('kurk'))}
      <g stroke="${cizgi}" stroke-width="7" stroke-linecap="round" fill="none" opacity=".7">
        <path d="M86 188q12 4 18 16M84 208q12 2 18 12M194 188q-12 4-18 16M196 208q-12 2-18 12"/>
      </g>
      ${oval(140, 206, 30, 36, g('beyaz'))}
      ${oval(112, 244, 20, 12, g('beyaz'))}${oval(168, 244, 20, 12, g('beyaz'))}
      <path d="M106 244v-6M114 246v-6M162 246v-6M170 244v-6" stroke="#d8c8ae" stroke-width="2" stroke-linecap="round"/>
      <path d="M86 94L96 36L134 76Z" fill="${g('kurk')}"/>
      <path d="M194 94L184 36L146 76Z" fill="${g('kurk')}"/>
      <path d="M96 84L101 52L122 76Z" fill="${g('ic')}"/>
      <path d="M184 84L179 52L158 76Z" fill="${g('ic')}"/>
      ${oval(140, 124, 64, 54, g('kurk'))}
      <g stroke="${cizgi}" stroke-width="6" stroke-linecap="round" fill="none">
        <path d="M122 96l6-18 6 14 6-14 6 14 6-14 6 18" stroke-width="5"/>
        <path d="M80 118h16M78 132h18M200 118h-16M202 132h-18"/>
      </g>
      ${oval(140, 150, 34, 24, g('beyaz'))}
      <g class="dost-gozleri">
        ${oval(112, 126, 15, 11, g('goz'))}${oval(168, 126, 15, 11, g('goz'))}
        ${oval(113, 128, 3.2, 9, '#1d2420')}${oval(169, 128, 3.2, 9, '#1d2420')}
        ${oval(117, 124, 2.6, 2.6, 'white')}${oval(173, 124, 2.6, 2.6, 'white')}
        <path d="M96 124q16-12 32 0L128 118Q112 108 96 118Z" fill="${g('kurk')}"/>
        <path d="M152 124q16-12 32 0L184 118Q168 108 152 118Z" fill="${g('kurk')}"/>
        <path d="M96 124q16-10 32 0M152 124q16-10 32 0" stroke="#5a4330" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
      ${oval(98, 146, 10, 6, '#eea99a', 'opacity=".7"')}${oval(182, 146, 10, 6, '#eea99a', 'opacity=".7"')}
      <path d="M132 140h16l-8 9z" fill="#e2877e"/>
      <path d="M140 149v5M140 154q-7 7-13 1M140 154q7 7 13 1" stroke="#6a5148" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <g stroke="#fbf6ea" stroke-width="2.2" stroke-linecap="round" fill="none">
        <path d="M122 148q-30-6-52-4M122 153q-30 2-50 10M124 157q-24 10-40 22"/>
        <path d="M158 148q30-6 52-4M158 153q30 2 50 10M156 157q24 10 40 22"/>
      </g>`;
    }
  },

  /* ——— Zıpzıp — dere kurbağası. ——— */
  'kurbaga-zipzip': {
    degrade: {
      deri: ['#b7df7d', '#79b64c', '#4f8a34'],
      karin: ['#fbf6d6', '#e6e2a8'],
      goz: ['#ffe79a', '#e2b63f']
    },
    ozel: (g) => `
      <g fill="${g('deri')}">
        ${oval(78, 214, 40, 28, g('deri'), 'transform="rotate(-18 78 214)"')}
        ${oval(202, 214, 40, 28, g('deri'), 'transform="rotate(18 202 214)"')}
      </g>
      <g fill="#6aa843">
        <path d="M56 236q-26 4-36 14 18 4 30-2-6 8 2 12 10-6 12-14 4 8 14 6 0-12-8-16z"/>
        <path d="M224 236q26 4 36 14-18 4-30-2 6 8-2 12-10-6-12-14-4 8-14 6 0-12 8-16z"/>
      </g>
      <path d="M40 246q-10 2-16 6M234 250q10 2 16 6" stroke="#4f8a34" stroke-width="2" opacity=".5"/>
      ${oval(140, 190, 66, 54, g('deri'))}
      ${oval(140, 206, 42, 36, g('karin'))}
      <g fill="#3f7a2a" opacity=".55">
        ${oval(94, 176, 8, 6)}${oval(186, 172, 9, 6)}${oval(104, 204, 6, 5)}${oval(178, 206, 7, 5)}
      </g>
      <g stroke="#6aa843" stroke-width="12" stroke-linecap="round" fill="none">
        <path d="M110 216q-6 18-14 26M170 216q6 18 14 26"/>
      </g>
      <g fill="#8cc35c">${oval(92, 244, 9, 6)}${oval(102, 247, 8, 5)}${oval(188, 244, 9, 6)}${oval(178, 247, 8, 5)}</g>
      ${oval(140, 140, 68, 44, g('deri'))}
      ${oval(98, 100, 28, 27, g('deri'))}${oval(182, 100, 28, 27, g('deri'))}
      <g class="dost-gozleri">
        ${oval(98, 98, 19, 18, g('goz'))}${oval(182, 98, 19, 18, g('goz'))}
        ${oval(99, 99, 12, 6, '#1f2a1c')}${oval(183, 99, 12, 6, '#1f2a1c')}
        ${oval(104, 92, 4, 4, 'white')}${oval(188, 92, 4, 4, 'white')}
      </g>
      <g fill="#355f24">${oval(130, 128, 3, 2)}${oval(150, 128, 3, 2)}</g>
      <path d="M86 146Q140 186 194 146" stroke="#355f24" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M110 158q30 16 60 0" stroke="#e98c7c" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55"/>
      ${oval(88, 136, 11, 6, '#f0a58f', 'opacity=".65"')}${oval(192, 136, 11, 6, '#f0a58f', 'opacity=".65"')}`
  }
};

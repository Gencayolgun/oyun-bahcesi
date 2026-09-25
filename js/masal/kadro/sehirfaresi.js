/* Şehir Faresi ile Tarla Faresi kadrosu — karakter kodu → çizim tarifi (bkz. kadro.js).

   Dört karakter, dördü de GERÇEK hayvanına benzemeli:
     · İki fare ortak fareGovde iskeletini kullanır (sivri burun, büyük ince
       kulaklar, boncuk gözler, uzun çıplak kuyruk, pembe patiler — bkz.
       kadro/ortak.js). Renk ve aksesuar ayırır:
         Başak  — tarla faresi: altın-kahve sırt, keskin çizgiyle beyaz karın,
                  kulağında bir gelincik, elinde arpa başağı.
         Lokum  — şehir faresi: gri ev faresi, göğsünde papyon, başında bere,
                  elinde tabakla pembe lokum.
     · Mestan — ev kedisi: üçgen kulak (içi pembe), üçgen pembe burun, bıyık,
       alında "M" çizgisi, çizgili tekir kürk, gövdeye dolanan çizgili kuyruk,
       tasmasında zil. Uykulu: gözler kapalı yay, esneyen ağız, "z".
     · Kurşun — şehir güvercini: gövdeye göre KÜÇÜK baş, gri tüy, yeşil-mor
       parlayan boyun, kanatta iki siyah bant, ucu koyu kuyruk, turuncu göz,
       gaganın dibinde beyaz tümsek (ağız mumu), kırmızı ayaklar. Postacı
       çantası taşır — masalın sonunda mektupları o götürecek. */

import {oval, fareGovde} from './ortak.js';

/* ——— İki fare: aynı iskelet, iki ayrı hayat ——— */
const BASAK = {
  ton: { kuyruk: '#d6a88c', ayak: '#edb7a3', yanak: '#f0a38a', burun: '#dc8577', biyik: '#8a6a4a' },
  /* Elinde arpa başağı (uzun kılçıklı), kulağında bir gelincik. */
  aksesuar: `
    <g transform="rotate(-14 214 170)">
      <path d="M212 238V132" stroke="#b98d3f" stroke-width="5" stroke-linecap="round"/>
      ${[0, 1, 2, 3, 4].map(i => {
        const y = 136 + i * 13;
        return `<ellipse cx="205" cy="${y}" rx="6" ry="9" fill="#e7c168" transform="rotate(-24 205 ${y})"/>` +
               `<ellipse cx="219" cy="${y}" rx="6" ry="9" fill="#f0d488" transform="rotate(24 219 ${y})"/>` +
               `<path d="M203 ${y - 8}l-12-26M221 ${y - 8}l12-26" stroke="#d9b45e" stroke-width="1.6" stroke-linecap="round"/>`;
      }).join('')}
      <ellipse cx="212" cy="128" rx="5" ry="8" fill="#f3dc98"/>
    </g>
    <ellipse cx="206" cy="196" rx="11" ry="9" fill="#edb7a3"/>
    <g transform="translate(58 70)">
      <path d="M8 22q-4 14 2 24" stroke="#5f9a52" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="0" cy="10" r="11" fill="#e2503f"/><circle cx="16" cy="8" r="11" fill="#ea6250"/>
      <circle cx="8" cy="-2" r="11" fill="#ef7563"/><circle cx="8" cy="12" r="10" fill="#dd4636"/>
      <circle cx="8" cy="8" r="5" fill="#2f2a2a"/>
    </g>`
};

const LOKUM = {
  ton: { kuyruk: '#c9aab0', ayak: '#e9b6bd', yanak: '#ef9fb0', burun: '#e08a9a', biyik: '#6f6a75' },
  /* Şehirli: bere, papyon, tabakta pembe lokum. */
  aksesuar: `
    <g transform="rotate(-8 140 98)">
      <ellipse cx="140" cy="100" rx="30" ry="10" fill="#c8475a"/>
      <ellipse cx="136" cy="95" rx="24" ry="8" fill="#d95a6c"/>
      <rect x="137" y="82" width="6" height="9" rx="3" fill="#a93a4b"/>
    </g>
    <g transform="translate(140 214)">
      <path d="M-4 0L-22 -10Q-26 0 -22 10ZM4 0L22 -10Q26 0 22 10Z" fill="#3d7fa8"/>
      <circle r="6" fill="#2f6a90"/>
    </g>
    <g transform="rotate(-6 210 188)">
      <ellipse cx="210" cy="200" rx="30" ry="7" fill="#f4f1ea"/>
      <ellipse cx="210" cy="198" rx="24" ry="4" fill="#e3ddd2"/>
      <rect x="192" y="174" width="20" height="20" rx="5" fill="#ef8fae"/>
      <rect x="208" y="170" width="20" height="24" rx="5" fill="#f6a8c0"/>
      <g fill="#ffffff" opacity=".85"><circle cx="198" cy="178" r="1.6"/><circle cx="205" cy="184" r="1.4"/>
        <circle cx="214" cy="174" r="1.6"/><circle cx="222" cy="180" r="1.4"/><circle cx="216" cy="188" r="1.3"/></g>
    </g>
    <ellipse cx="190" cy="200" rx="10" ry="8" fill="#e9b6bd"/><ellipse cx="230" cy="199" rx="9" ry="7" fill="#e9b6bd"/>`
};

export default {
  /* Başak — tarla faresi. Altın-kahve sırt, beyaz karın, büyük kara gözler. */
  'fare-basak': {
    degrade: { kurk: ['#e9c592', '#c8955a', '#976538'], karin: ['#fff8e8', '#f0dfc1'], ic: ['#f7c8ba', '#e19d8d'] },
    ozel: g => fareGovde(g, BASAK.ton, BASAK.aksesuar)
  },

  /* Lokum — şehir faresi. Gri ev faresi; şık ve biraz havalı. */
  'fare-lokum': {
    degrade: { kurk: ['#dcd9de', '#aba7b1', '#7c7884'], karin: ['#f8f6f8', '#e4e0e7'], ic: ['#f3c4c9', '#da9ca4'] },
    ozel: g => fareGovde(g, LOKUM.ton, LOKUM.aksesuar)
  },

  /* Mestan — uykucu ev kedisi. Tekir, oturmuş, esniyor. Kimseyi kovalamaz. */
  'kedi-mestan': {
    degrade: { kurk: ['#f8cf92', '#e59c52', '#b8692c'], acik: ['#fff7e8', '#f3dfc2'], ic: ['#f8c6bb', '#e39c90'] },
    ozel: g => `
      <path class="dost-kuyruk" d="M204 222q44-2 40-40q-3-22-20-24" stroke="${g('kurk')}" stroke-width="20" fill="none" stroke-linecap="round"/>
      <g stroke="#a85f27" stroke-width="5" stroke-linecap="round" opacity=".75" fill="none">
        <path d="M232 214l10-6M240 196l12 2M238 176l12-4"/>
      </g>
      ${oval(141, 200, 72, 50, g('kurk'))}
      <g stroke="#b8692c" stroke-width="6" stroke-linecap="round" fill="none" opacity=".6">
        <path d="M80 190q8-10 18-12M78 208q10-8 20-8M196 178q10 2 18 12M198 198q12 0 20 10"/>
      </g>
      ${oval(141, 212, 40, 32, g('acik'))}
      ${oval(113, 240, 20, 11, g('acik'))}${oval(169, 240, 20, 11, g('acik'))}
      <path d="M104 244v-5M112 245v-6M120 244v-5M160 244v-5M168 245v-6M176 244v-5" stroke="#e3c7a3" stroke-width="2" stroke-linecap="round"/>
      <path d="M84 96L92 42L130 80Z" fill="${g('kurk')}"/><path d="M196 96L188 42L150 80Z" fill="${g('kurk')}"/>
      <path d="M93 88L97 56L119 80Z" fill="${g('ic')}"/><path d="M187 88L183 56L161 80Z" fill="${g('ic')}"/>
      <path d="M80 136q-20 4-24 14q16 2 26 -4M200 136q20 4 24 14q-16 2-26-4" fill="${g('kurk')}"/>
      ${oval(140, 130, 64, 52, g('kurk'))}
      <g stroke="#a85f27" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".8">
        <path d="M128 84l4 16M140 80v18M152 84l-4 16"/><path d="M80 124h14M186 124h14"/>
      </g>
      ${oval(140, 154, 32, 22, g('acik'))}
      <path d="M104 128q14 10 28 0M148 128q14 10 28 0" stroke="#4a3a33" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M103 124l-4-4M177 124l4-4" stroke="#4a3a33" stroke-width="2.5" stroke-linecap="round"/>
      ${oval(110, 146, 10, 6, '#f2a88f', 'opacity=".75"')}${oval(170, 146, 10, 6, '#f2a88f', 'opacity=".75"')}
      <path d="M132 142h16l-8 9z" fill="#e58a95"/>
      <path d="M140 151v4" stroke="#6a4a42" stroke-width="2.4" stroke-linecap="round"/>
      ${oval(140, 164, 9, 8, '#8f3f47')}${oval(140, 168, 6, 4, '#ef8e9c')}
      <g stroke="#6d5a50" stroke-width="2" stroke-linecap="round" fill="none" opacity=".75">
        <path d="M120 152q-26-6-46-4M120 158q-24 2-44 10M160 152q26-6 46-4M160 158q24 2 44 10"/>
      </g>
      <path d="M96 180q44 14 88 0" stroke="#c9463f" stroke-width="9" fill="none" stroke-linecap="round"/>
      <circle cx="140" cy="194" r="9" fill="#efc54f"/><path d="M134 196h12" stroke="#b8902b" stroke-width="2"/>
      <circle cx="140" cy="199" r="2" fill="#8a6a1f"/>
      <g fill="#8fb6d3" font-family="ui-rounded,sans-serif" font-weight="800">
        <text x="206" y="74" font-size="20">z</text><text x="224" y="52" font-size="26">z</text>
      </g>`
  },

  /* Kurşun — şehir güvercini ve postacı. Küçük baş, gri tüy, gökkuşağı boyun. */
  'guvercin-kursun': {
    degrade: { tuy: ['#d3dae2', '#a2adba', '#737f8d'], boyun: ['#86cfae', '#6f93c6', '#9d72b4'],
               gogus: ['#e0e5ea', '#b3bcc6'], kanat: ['#bcc5cf', '#8f9aa7'] },
    ozel: g => `
      <path d="M198 176l52-6q8 12 2 24l-50 4z" fill="#8a95a3"/>
      <path d="M236 172l14-2q8 12 2 24l-14 1q6-12-2-23z" fill="#3f4650"/>
      ${oval(150, 186, 74, 54, g('tuy'))}
      ${oval(118, 196, 40, 40, g('gogus'))}
      <path d="M86 150q-4 40 30 58q-30-8-40-40z" fill="${g('boyun')}" opacity=".9"/>
      ${oval(104, 146, 30, 32, g('boyun'))}
      <g transform="rotate(-8 170 182)">
        ${oval(172, 178, 52, 32, g('kanat'))}
        <path d="M146 170q26-8 52 2" stroke="#2f343b" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M152 188q26-8 52 2" stroke="#2f343b" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M200 162q20 8 24 26q-14-6-24-6" fill="#8793a0"/>
      </g>
      <path d="M150 150L128 214" stroke="#9c6a3c" stroke-width="5" stroke-linecap="round"/>
      <g transform="rotate(-10 132 222)">
        <rect x="110" y="206" width="44" height="30" rx="6" fill="#b98550"/>
        <path d="M110 212q22 14 44 0" fill="#a3713f"/>
        <rect x="118" y="198" width="26" height="16" rx="2" fill="#fbf6ea" transform="rotate(-8 131 206)"/>
        <path d="M121 201l10 7 11-8" stroke="#d6c9b0" stroke-width="1.6" fill="none" transform="rotate(-8 131 206)"/>
        <circle cx="132" cy="222" r="4" fill="#e0b054"/>
      </g>
      <path d="M126 238l-12 8M126 238v10M126 238l10 8M162 238l-12 8M162 238v10M162 238l10 8" stroke="#d9534f" stroke-width="4" stroke-linecap="round"/>
      <path d="M126 226v12M162 228v10" stroke="#d9534f" stroke-width="5" stroke-linecap="round"/>
      ${oval(96, 112, 30, 28, g('tuy'))}
      <path d="M68 112l-20 6l20 6z" fill="#4a4f57"/>
      ${oval(70, 110, 6, 5, '#f4f1ea')}
      <circle cx="90" cy="104" r="8" fill="#f08a3a"/><circle cx="89" cy="104" r="4.2" fill="#2a2626"/>
      <circle cx="91" cy="102" r="1.6" fill="#ffffff"/>
      ${oval(104, 124, 8, 5, '#e8a5a0', 'opacity=".55"')}`
  }
};

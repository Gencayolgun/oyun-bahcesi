import {oval, gozler, gulus, karincaGovde, fareGovde, seri} from './kadro/ortak.js';
import {EK_KADROLAR} from './kadro/liste.js';

/* Masal kadroları — dostlar.js ile aynı tasarım dili:
   280×270 tuval, radyal degradeli gövde, ışıklı gözler, zemin gölgesi.
   Mevcut üç masalın kadrosu burada; yeni masallar kendi dosyalarını
   js/masal/kadro/<kod>.js altına koyar ve liste.js'e kaydolur. */

const TEMEL = {
  /* İlkbahar — işçi karınca, sırtında minik bir kürek */
  'karinca-isci': {
    degrade: { bas: ['#f0c485', '#d79a55', '#a96f38'], govde: ['#e8b877', '#c98f4c'], karin: ['#dda868', '#b07b3c'] },
    ton: { bacak: '#8d5c2f', yanak: '#e9a071', parlak: '#f6d6a3' },
    aksesuar: `<g transform="rotate(-16 198 180)"><rect x="193" y="118" width="10" height="62" rx="5" fill="#a5794d"/>
      <rect x="186" y="112" width="24" height="9" rx="4" fill="#8d6640"/>
      <path d="M176 178h44v22q0 26-22 26t-22-26z" fill="#c3ccd3"/>
      <path d="M176 178h44v10h-44z" fill="#9fa9b3"/>
      <path d="M198 192v26" stroke="#a8b2ba" stroke-width="3" stroke-linecap="round"/></g>`
  },
  /* Yaz — bekçi karınca, kask ve daha koyu kabuk */
  'karinca-asker': {
    degrade: { bas: ['#e0a077', '#bd6f45', '#8e4b2b'], govde: ['#d2905f', '#a9663c'], karin: ['#c8824f', '#96562f'] },
    ton: { bacak: '#734022', yanak: '#dd8a6b', parlak: '#eeb98c' },
    aksesuar: `<path d="M92 104q48-46 96 0q-48-20-96 0" fill="#8d9aa5"/>
      <path d="M92 104q48-30 96 0" fill="none" stroke="#6f7c88" stroke-width="4"/>
      <rect x="134" y="58" width="12" height="20" rx="5" fill="#c9a24e"/>`
  },
  /* Sonbahar — taşıyıcı karınca, sırtında buğday çuvalı */
  'karinca-tasiyici': {
    degrade: { bas: ['#f4d3a3', '#dcae72', '#b4854b'], govde: ['#ecc68f', '#c69a5f'], karin: ['#e3b97f', '#b78a51'] },
    ton: { bacak: '#956c3e', yanak: '#eab08a', parlak: '#fae3bb' },
    aksesuar: `<g transform="rotate(10 198 190)">
      <path d="M198 148q-34 10-34 44 0 34 34 34t34-34q0-34-34-44z" fill="#e3cb95"/>
      <path d="M198 148q-20 6-27 22 26 12 54 0-7-16-27-22z" fill="#f1dcae"/>
      <path d="M184 146q14-8 28 0l-6 10h-16z" fill="#c9a86b"/>
      <path d="M182 144q16-9 32 0" stroke="#a98a55" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M180 196q18 8 36 0" stroke="#c9ad76" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="190" cy="180" r="3.2" fill="#c2a267"/><circle cx="206" cy="188" r="3.2" fill="#c2a267"/>
      <circle cx="199" cy="170" r="2.8" fill="#c2a267"/></g>`
  },

  /* ——— Masal 02 · Kaplumbağa ile Tavşan ——— */

  /* Ağır — yarışçı kaplumbağa. Kubbe kabuk, kısa bacaklar, kararlı bakış. */
  'kaplumbaga-agir': {
    degrade: { kabuk: ['#a8cf86', '#6ba15f', '#47784a'], desen: ['#cbe3a6', '#8cb76f'],
               ten: ['#e8dcae', '#c9b781', '#a18f5d'] },
    ozel: (g) => `
      <path class="dost-kuyruk" d="M212 200q26 8 22 28" stroke="#c9b781" stroke-width="11" fill="none" stroke-linecap="round"/>
      ${oval(140, 178, 92, 68, g('kabuk'))}
      ${oval(140, 170, 74, 50, g('desen'))}
      <g fill="none" stroke="#5c8f55" stroke-width="4" opacity=".65">
        <path d="M140 122v106M78 172h124M96 138l88 70M184 138l-88 70"/>
      </g>
      ${oval(140, 170, 26, 22, '#7fae68')}
      ${oval(140, 214, 62, 15, '#ddd0a0')}
      <g fill="${g('ten')}">
        ${oval(82, 226, 23, 16)}${oval(198, 226, 23, 16)}${oval(112, 238, 19, 13)}${oval(168, 238, 19, 13)}
      </g>
      ${oval(60, 128, 34, 31, g('ten'))}
      ${gozler(48, 74, 120, .78)}
      ${oval(40, 146, 9, 5, '#dcae8f')}${oval(80, 146, 9, 5, '#dcae8f')}
      ${gulus(60, 150, 7)}
      <g class="dost-kuyruk" stroke="#c9b781" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M46 98q-6-22 6-30"/><path d="M74 98q6-22 18-26"/>
      </g>`
  },

  /* Şimşek — yarışçı tavşan. Uzun kulaklar, yarış forması, hızlı duruş. */
  'tavsan-simsek': {
    degrade: { kurk: ['#fdf6e6', '#ebdcc0', '#cdbb99'], ic: ['#f6cfc4', '#dfa79b'],
               forma: ['#7fb9d4', '#4d8fae'] },
    ozel: (g) => `
      <g class="dost-kuyruk">
        ${oval(96, 62, 17, 50, g('kurk'), 'transform="rotate(-12 96 62)"')}
        ${oval(184, 62, 17, 50, g('kurk'), 'transform="rotate(12 184 62)"')}
        ${oval(96, 60, 9, 36, g('ic'), 'transform="rotate(-12 96 60)"')}
        ${oval(184, 60, 9, 36, g('ic'), 'transform="rotate(12 184 60)"')}
      </g>
      ${oval(78, 232, 30, 15, g('kurk'))}${oval(202, 232, 30, 15, g('kurk'))}
      ${oval(140, 196, 58, 54, g('kurk'))}
      <path d="M96 176q44-16 88 0l-8 54h-72z" fill="${g('forma')}"/>
      ${oval(140, 200, 20, 20, '#f4f7f2')}
      <text x="140" y="209" font-family="ui-rounded,sans-serif" font-size="24" font-weight="800"
            text-anchor="middle" fill="#3f6a80">1</text>
      ${oval(140, 134, 50, 45, g('kurk'))}
      ${gozler(118, 160, 130)}
      ${oval(104, 158, 11, 6, '#f0b0a0')}${oval(176, 158, 11, 6, '#f0b0a0')}
      ${oval(140, 156, 9, 7, '#e2938c')}
      ${gulus(140, 166)}
      ${oval(214, 214, 17, 15, g('kurk'))}`
  },

  /* Bıdık — parkur görevlisi salyangoz. Sarmal kabuk, göz sapları, bayrak. */
  'salyangoz-bidik': {
    degrade: { kabuk: ['#f3d9a4', '#dbab63', '#b07f3f'], ten: ['#f7e3d2', '#e2c0a8', '#c49d84'] },
    ozel: (g) => `
      ${oval(150, 232, 74, 18, g('ten'))}
      <path d="M76 232q-14 0-14-12t16-12" stroke="#d9b79f" stroke-width="10" fill="none" stroke-linecap="round"/>
      ${oval(178, 170, 62, 60, g('kabuk'))}
      <path d="M178 170m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" fill="none" stroke="#b07f3f" stroke-width="0"/>
      <path d="M216 170a38 38 0 1 1-38-38 30 30 0 0 1 30 30 23 23 0 0 1-23 23 17 17 0 0 1-17-17 12 12 0 0 1 12-12"
            fill="none" stroke="#c1974f" stroke-width="9" stroke-linecap="round"/>
      ${oval(92, 196, 40, 38, g('ten'))}
      <g class="dost-kuyruk" stroke="#e2c0a8" stroke-width="7" stroke-linecap="round" fill="none">
        <path d="M78 168q-10-32 2-44"/><path d="M108 168q10-30 26-38"/>
      </g>
      ${oval(80, 118, 12, 13, '#fffdf4')}${oval(136, 126, 12, 13, '#fffdf4')}
      ${oval(81, 120, 7, 8, '#334b46')}${oval(137, 128, 7, 8, '#334b46')}
      ${oval(83, 117, 3, 3.5, 'white')}${oval(139, 125, 3, 3.5, 'white')}
      ${oval(74, 210, 9, 5, '#e9ada0')}
      ${gulus(96, 208, 8)}
      <g transform="rotate(14 224 120)">
        <rect x="220" y="86" width="7" height="86" rx="3" fill="#a5794d"/>
        <path d="M227 90h44l-12 15 12 15h-44z" fill="#d9714f"/>
      </g>`
  },

  /* Tüy — müjdeci kuş. Yuvarlak gövde, açık kanat, düdük. */
  'kus-tuy': {
    degrade: { tuy: ['#ffe7a0', '#ecc266', '#c88e42'], kanat: ['#fff3cd', '#e8bf76'],
               karin: ['#fff8e2', '#f3dfae'] },
    ozel: (g) => `
      <g stroke="#d89a45" stroke-width="7" stroke-linecap="round" fill="none">
        <path d="M122 236v16M158 236v16"/><path d="M114 254h18M150 254h18"/>
      </g>
      <g class="dost-kanat-sol">${oval(78, 182, 24, 44, g('kanat'), 'transform="rotate(26 78 182)"')}
        <path d="m66 158 10 42m8-44 8 38" stroke="#d3a95e" stroke-width="2" opacity=".7"/></g>
      <g class="dost-kanat-sag">${oval(202, 182, 24, 44, g('kanat'), 'transform="rotate(-26 202 182)"')}
        <path d="m214 158-10 42m-8-44-8 38" stroke="#d3a95e" stroke-width="2" opacity=".7"/></g>
      ${oval(140, 182, 62, 60, g('tuy'))}
      ${oval(140, 198, 38, 38, g('karin'))}
      ${oval(140, 126, 52, 47, g('tuy'))}
      <path d="M118 78q-16-20-2-28l11 19q-1-27 15-25 1 18-7 28 14-18 21-7-7 12-23 14" fill="#dca949"/>
      ${gozler(118, 160, 122)}
      ${oval(103, 148, 10, 6, '#eaa77e')}${oval(177, 148, 10, 6, '#eaa77e')}
      <path d="M128 152q12-12 24 0l-12 14z" fill="#d68f45"/>
      ${gulus(140, 176, 8)}
      <g transform="rotate(-20 196 196)">
        <rect x="186" y="178" width="30" height="16" rx="7" fill="#c9ccd2"/>
        <circle cx="212" cy="186" r="5" fill="#9aa1a9"/>
        <path d="M186 186h-16" stroke="#e4c88f" stroke-width="4" stroke-linecap="round"/>
      </g>`
  },


  /* ——— Masal 03 · Aslan ile Fare ——— */

  /* Fındık — meraklı küçük fare. */
  'fare-findik': {
    govde: 'fare',
    degrade: { kurk: ['#e8d9c4', '#c9b49b', '#a08d76'], karin: ['#fbf3e4', '#eadfc9'], ic: ['#f5c9bd', '#dfa396'] },
    ton: { kuyruk: '#c0ab92', ayak: '#e4b9a8', yanak: '#eda994', burun: '#d98a7c', biyik: '#9d8b76' },
    aksesuar: `<g transform="rotate(-10 208 182)">
      <path d="M186 196h44l-22-34z" fill="#f0cf74"/>
      <path d="M186 196h44l-3-6H189z" fill="#d9b356"/>
      <circle cx="200" cy="186" r="3.4" fill="#d9b356"/><circle cx="214" cy="190" r="2.8" fill="#d9b356"/>
      <circle cx="207" cy="176" r="2.2" fill="#d9b356"/></g>`
  },

  /* Toz — bilge yaşlı fare, bastonlu. */
  'fare-toz': {
    govde: 'fare',
    degrade: { kurk: ['#d9dde0', '#b4bbc1', '#8d959c'], karin: ['#f0f3f5', '#dde2e6'], ic: ['#e6c3bb', '#c99d95'] },
    ton: { kuyruk: '#aab2b8', ayak: '#d7c0b6', yanak: '#dda393', burun: '#c98a7c', biyik: '#8f979d' },
    aksesuar: `<g transform="rotate(12 214 190)"><rect x="210" y="134" width="8" height="98" rx="4" fill="#9c7a52"/>
      <path d="M214 134q-16 0-16 14t16 8" fill="none" stroke="#9c7a52" stroke-width="8" stroke-linecap="round"/></g>
      <g fill="none" stroke="#7d868c" stroke-width="4">
        <circle cx="120" cy="144" r="17" fill="#eef4f7" fill-opacity=".38"/>
        <circle cx="160" cy="144" r="17" fill="#eef4f7" fill-opacity=".38"/>
        <path d="M143 142h-6" stroke-linecap="round"/>
        <path d="M103 140q-8-4-12 2M177 140q8-4 12 2" stroke-linecap="round" stroke-width="3.4"/>
      </g>`
  },

  /* Kösele — kocaman ama yumuşak bir aslan. Yele halka halka. */
  'aslan-kosele': {
    degrade: { yele: ['#f0b96a', '#d8923f', '#a8672c'], yuz: ['#f7dda9', '#e4bd7d', '#c09a5c'],
               burun: ['#e8a98e', '#cf8570'] },
    ozel: (g) => {
      let yele = '';
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        yele += oval(140 + Math.cos(a) * 76, 152 + Math.sin(a) * 72, 25, 25, g('yele'));
      }
      return `
      ${oval(72, 240, 26, 15, '#e4bd7d')}${oval(208, 240, 26, 15, '#e4bd7d')}
      <path class="dost-kuyruk" d="M214 214q46 6 42-40" stroke="#d8a25a" stroke-width="9" fill="none" stroke-linecap="round"/>
      ${oval(246, 172, 13, 16, '#c08a45')}
      ${oval(140, 214, 62, 44, g('yuz'))}
      ${yele}
      ${oval(140, 152, 60, 56, g('yuz'))}
      ${oval(96, 104, 18, 18, '#d8923f')}${oval(184, 104, 18, 18, '#d8923f')}
      ${oval(96, 106, 10, 10, '#e8b98e')}${oval(184, 106, 10, 10, '#e8b98e')}
      ${gozler(118, 160, 142)}
      ${oval(104, 172, 12, 7, '#e8a98e')}${oval(176, 172, 12, 7, '#e8a98e')}
      <path d="M128 168q12-11 24 0l-12 13z" fill="${g('burun')}"/>
      <path d="M140 181v8" stroke="#c98a72" stroke-width="3" stroke-linecap="round"/>
      <path d="M140 189q-12 11-22 1M140 189q12 11 22 1" fill="none" stroke="#6a5148" stroke-width="3" stroke-linecap="round"/>
      <g stroke="#c9a373" stroke-width="2.4" stroke-linecap="round" opacity=".8">
        <path d="M122 178q-26 0-34-6M122 185q-26 4-32 2M158 178q26 0 34-6M158 185q26 4 32 2"/>
      </g>`;
    }
  },

  /* Kanat — gözcü kartal. Keskin gaga, açık kanatlar, sert ama dost bakış. */
  'kartal-kanat': {
    degrade: { tuy: ['#bcab90', '#8d7b60', '#63543f'], bas: ['#fbf6ea', '#e6decc', '#c7bea9'],
               kanat: ['#a89279', '#7d6e55'] },
    ozel: (g) => `
      <g class="dost-kanat-sol">${oval(66, 176, 26, 56, g('kanat'), 'transform="rotate(24 66 176)"')}
        <path d="m52 146 12 56m10-58 10 50" stroke="#6f6046" stroke-width="2.4" opacity=".55" fill="none"/></g>
      <g class="dost-kanat-sag">${oval(214, 176, 26, 56, g('kanat'), 'transform="rotate(-24 214 176)"')}
        <path d="m228 146-12 56m-10-58-10 50" stroke="#6f6046" stroke-width="2.4" opacity=".55" fill="none"/></g>
      <g stroke="#d9a24f" stroke-width="7" stroke-linecap="round" fill="none">
        <path d="M122 238v14M158 238v14"/><path d="M112 252h20M148 252h20"/>
      </g>
      ${oval(140, 190, 58, 56, g('tuy'))}
      ${oval(140, 204, 34, 34, '#cbbfa6')}
      ${oval(140, 130, 52, 48, g('bas'))}
      ${gozler(118, 160, 126)}
      <path d="M110 110q16-10 28-3" stroke="#8d7b60" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M170 110q-16-10-28-3" stroke="#8d7b60" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${oval(104, 152, 10, 6, '#e6b28f')}${oval(176, 152, 10, 6, '#e6b28f')}
      <path d="M129 150h22l-8 20q-3 5-6 0z" fill="#d99f4e"/>
      ${gulus(140, 182, 7)}`
  },

  /* Kış — ağustos böceği, kemanıyla */
  'agustos-bocegi': {
    ozel: (g) => `
      <g class="dost-bacaklar" stroke="#5c8552" stroke-width="7" stroke-linecap="round" fill="none">
        <path d="M112 176q-34 8-42 32M170 176q34 8 42 32"/>
        <path d="M118 198q-16 16-10 40M162 198q16 16 10 40"/>
      </g>
      <path d="M104 206q-30 4-38 34" stroke="#5c8552" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M176 206q30 4 38 34" stroke="#5c8552" stroke-width="9" fill="none" stroke-linecap="round"/>
      <g class="dost-kuyruk" stroke="#4f7a49" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M120 72q-14-34-40-40"/><path d="M160 72q14-34 40-40"/>
      </g>
      ${oval(78, 30, 7, 7, '#4f7a49')}${oval(202, 30, 7, 7, '#4f7a49')}
      <g class="dost-kanat-sol">${oval(104, 196, 26, 46, g('kanat'), 'transform="rotate(14 104 196)"')}
        <path d="m92 172 10 44m8-46 8 40" stroke="#7fae6e" stroke-width="2" opacity=".6"/></g>
      <g class="dost-kanat-sag">${oval(176, 196, 26, 46, g('kanat'), 'transform="rotate(-14 176 196)"')}
        <path d="m188 172-10 44m-8-46-8 40" stroke="#7fae6e" stroke-width="2" opacity=".6"/></g>
      ${oval(140, 202, 40, 46, g('karin'))}
      ${oval(140, 190, 26, 26, '#b7dc9a', 'opacity=".4"')}
      ${oval(140, 140, 34, 30, g('govde'))}
      ${oval(140, 100, 46, 42, g('bas'))}
      ${gozler(119, 159, 98)}
      ${oval(106, 122, 10, 6, '#e6a98e')}${oval(174, 122, 10, 6, '#e6a98e')}
      ${gulus(140, 128)}
      <g transform="rotate(-24 206 168)">
        <path d="M196 132q18 0 18 22 0 16-9 22 9 8 9 24 0 22-18 22t-18-22q0-16 9-24-9-6-9-22 0-22 18-22z" fill="#a8703f"/>
        <path d="M196 148v76" stroke="#f0d9ae" stroke-width="2"/><path d="M191 150v72M201 150v72" stroke="#f0d9ae" stroke-width="1.4"/>
        <rect x="192" y="106" width="8" height="30" rx="3" fill="#7d5330"/>
      </g>
      <path d="M232 104 176 190" stroke="#e5cfa6" stroke-width="5" stroke-linecap="round"/>`,
    degrade: { bas: ['#c9e6a4', '#8cc472', '#5f9a52'], govde: ['#bcdd97', '#7fb466'], karin: ['#aed489', '#6fa657'], kanat: ['#d6ecbd', '#9cc684'] }
  }
};

const KADRO = Object.assign({}, TEMEL, EK_KADROLAR);

export function kadroCiz(kod) {
  const k = KADRO[kod];
  if (!k) return '';
  const id = 'kadro-' + (++seri.n), g = n => `url(#${id}-${n})`;
  const defs = `<defs>${Object.entries(k.degrade).map(([ad, renkler]) =>
    `<radialGradient id="${id}-${ad}" cx="32%" cy="24%" r="80%">${renkler.map((r, i) =>
      `<stop offset="${(i / (renkler.length - 1)).toFixed(2)}" stop-color="${r}"/>`).join('')}</radialGradient>`).join('')}</defs>`;
  /* Gövde seçimi. Bu satır eksikti: bütün karakterler karınca gövdesinden
     geçiyordu, farelerde karıncanın istediği degradeler olmadığı için
     parçalar boş kalıyordu. */
  const GOVDELER = { karinca: karincaGovde, fare: fareGovde };
  const cizim = k.ozel ? k.ozel(g) : (GOVDELER[k.govde] || karincaGovde)(g, k.ton, k.aksesuar || '');
  return `<svg class="dost-cizimi dost-${kod}" viewBox="0 0 280 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}` +
    oval(141, 247, 68, 9, '#537b5e', 'opacity=".13"') +
    `<g class="dost-vucut">${cizim}</g>` +
    `<g class="dost-sevinc" fill="#e2b45f"><path d="m45 60 3 9 9 3-9 3-3 9-3-9-9-3 9-3zm187 62 3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/>` +
    `<path d="M218 77c-19-12-7-25 0-15 9-11 20 3 0 15" fill="#e7aa9b"/></g></svg>`;
}

export const KADRO_KODLARI = Object.keys(KADRO);

/* Görev sırasında çocukla kalan panel — dostPaneli ile aynı sözleşme. */
export function kadroPaneli(karakter, sozler) {
  const panel = document.createElement('aside');
  panel.className = 'gorev-dostu'; panel.dataset.character = karakter.kod; panel.dataset.mood = 'bekliyor';
  const unvan = document.createElement('span'); unvan.className = 'dost-unvani'; unvan.textContent = 'YOL ARKADAŞIN';
  const resim = document.createElement('div'); resim.className = 'dost-portresi';
  resim.setAttribute('role', 'img');
  resim.setAttribute('aria-label', `${karakter.ad}, sevimli ${karakter.tur.toLocaleLowerCase('tr')}`);
  resim.innerHTML = kadroCiz(karakter.kod);
  const ad = document.createElement('strong'); ad.className = 'dost-ismi'; ad.textContent = karakter.ad;
  const balon = document.createElement('p'); balon.className = 'dost-sozu'; balon.setAttribute('aria-live', 'polite');
  const satir = sozler && sozler.length === 3 ? sozler
    : ['Hadi birlikte başlayalım!', 'Çok iyi gidiyoruz!', 'Başardık, teşekkür ederim!'];
  balon.textContent = satir[0];
  panel.append(unvan, resim, ad, balon);
  return { el: panel, update(ilerleme, toplam) {
    panel.dataset.mood = ilerleme === toplam ? 'mutlu' : ilerleme ? 'seviniyor' : 'bekliyor';
    balon.textContent = satir[ilerleme === toplam ? 2 : ilerleme ? 1 : 0];
  } };
}

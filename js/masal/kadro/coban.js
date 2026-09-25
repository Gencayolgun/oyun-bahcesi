/* Yalancı Çoban kadrosu — karakter kodu → çizim tarifi (bkz. kadro.js).

   Dört karakter, dördü de GERÇEK hâline benzemeli:
     coban-oguz     çoban çocuk Oğuz: kare omuzlu keçe kepenek, örgü bere,
                    ucu kıvrık çoban değneği, çarık. İnsan çocuk.
     kopek-karabas  çoban köpeği (Kangal): açık buğday rengi kalın post,
                    SİYAH MASKE (adı buradan: kara baş), yanlardan sarkan
                    koyu kulaklar, öne uzanan uzun burun, sırtına kıvrılan
                    kuyruk, çivili tasma. Ayıcık değil: kulak sarkık, burun uzun.
     koyun-bulut    kuzu: kıvırcık yün bulutu, koyu renk uzun yüz ve ince
                    koyu bacaklar, yana açılan sarkık kulaklar, alında yün
                    perçemi, boynunda çan.
     kurt-yalniz    gri kurt: dik ve sivri üçgen kulaklar, uzun burun, yüzde
                    ve göğüste krem maske, boyunda kabarık yele, kehribar
                    gözler, ucu koyu gür kuyruk. Aç ve yalnız ama korkutucu
                    değil: diş yok, kaşları hüzünlü. */

import {oval, gozler, gulus} from './ortak.js';

/* Kurt gözü: badem, kehribar. Kadronun kocaman parlak gözlerinden daha
   küçük ve daha "vahşi" ama yumuşak bakan. */
const kurtGozu = (x, y, yon) => `
  <path d="M${x - 13} ${y}q13 -10 26 ${yon * 2}q-13 11 -26 ${-yon * 2}z" fill="#fbf4df"/>
  ${oval(x + 1, y, 7.5, 7.5, '#d99a2e')}${oval(x + 1, y, 4.2, 5.4, '#2b2420')}
  ${oval(x + 3.5, y - 3, 2.2, 2.2, 'white')}`;

export default {
  /* ——— Oğuz: çoban çocuk ——— */
  'coban-oguz': {
    degrade: { ten: ['#ffe6c9', '#f4c9a0', '#d9a077'], kepenek: ['#efdcb0', '#d4b37a', '#a9854c'],
               gomlek: ['#ea8a68', '#c75f45'], bere: ['#e0655a', '#b0413a'], sac: ['#93603a', '#5e3a22'] },
    ozel: (g) => `
      <path d="M216 246V98q0-32-24-32q-20 0-20 20" stroke="#8a6034" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M216 246V98q0-32-24-32q-20 0-20 20" stroke="#b58853" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
      <rect x="114" y="214" width="20" height="30" rx="8" fill="#6f5a4a"/>
      <rect x="146" y="214" width="20" height="30" rx="8" fill="#6f5a4a"/>
      ${oval(122, 244, 17, 8, '#8a5a36')}${oval(158, 244, 17, 8, '#8a5a36')}
      <path d="M110 244q12-8 24 0M146 244q12-8 24 0" stroke="#b07a4c" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M126 150h28l6 80h-40z" fill="${g('gomlek')}"/>
      <path d="M131 162h18M130 178h20M129 194h22" stroke="#f4b393" stroke-width="3" stroke-linecap="round" opacity=".7"/>
      <path d="M84 148h40l2 88q-30 6-58-2l10-70q2-16 6-16z" fill="${g('kepenek')}"/>
      <path d="M196 148h-40l-2 88q30 6 58-2l-10-70q-2-16-6-16z" fill="${g('kepenek')}"/>
      <path d="M80 148h40M160 148h40" stroke="#b8935a" stroke-width="6" stroke-linecap="round"/>
      <path d="M90 170l-6 52M190 170l6 52" stroke="#c2a067" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/>
      <path d="M100 196q8 6 16 0M164 196q8 6 16 0" stroke="#b25a44" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${oval(94, 210, 11, 12, g('ten'))}
      ${oval(210, 164, 11, 12, g('ten'))}
      <path d="M204 160q6-4 12 0" stroke="#d9a077" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      ${oval(140, 146, 13, 9, g('ten'))}
      ${oval(92, 110, 10, 13, g('ten'))}${oval(188, 110, 10, 13, g('ten'))}
      ${oval(92, 111, 5, 7, '#eba98a')}${oval(188, 111, 5, 7, '#eba98a')}
      ${oval(140, 106, 48, 46, g('ten'))}
      <path d="M96 94q10-22 44-24q34 2 44 24q-14-8-24-6q-6-8-20-8q-16 0-22 10q-12-2-22 4z" fill="${g('sac')}"/>
      <path d="M92 90q0-40 48-42q48 2 48 42q-48-16-96 0z" fill="${g('bere')}"/>
      <path d="M92 90q48-16 96 0v8q-48-15-96 0z" fill="#f3e2c2"/>
      <path d="M104 80l-2-14M120 72l-1-16M140 68v-16M160 72l1-16M176 80l2-14" stroke="#a93a34" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      ${oval(140, 46, 13, 12, '#f3e2c2')}
      ${gozler(121, 159, 112, .78)}
      ${oval(106, 130, 10, 6, '#f29d85', 'opacity=".75"')}${oval(174, 130, 10, 6, '#f29d85', 'opacity=".75"')}
      ${oval(140, 124, 5, 4, '#e0a27d')}
      ${gulus(140, 134, 9)}`
  },

  /* ——— Karabaş: Kangal çoban köpeği ——— */
  'kopek-karabas': {
    degrade: { kurk: ['#f7e1b6', '#e0bb84', '#b88c55'], karin: ['#fdf4e2', '#efdcb8'],
               maske: ['#54443b', '#2b221e'], kulak: ['#5e4a3d', '#2f2520'] },
    ozel: (g) => `
      <path class="dost-kuyruk" d="M186 206q48-4 48-46q0-28-24-28q-20 0-16 20q4 14 18 8" stroke="#e0bb84" stroke-width="17" fill="none" stroke-linecap="round"/>
      <path d="M206 136q18-2 22 16" stroke="#f7e1b6" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
      ${oval(98, 222, 30, 23, g('kurk'))}${oval(182, 222, 30, 23, g('kurk'))}
      ${oval(84, 242, 21, 9, '#ecd2a2')}${oval(196, 242, 21, 9, '#ecd2a2')}
      <path d="M140 136C104 136 92 178 94 212C96 240 184 240 186 212C188 178 176 136 140 136Z" fill="${g('kurk')}"/>
      ${oval(140, 194, 27, 36, g('karin'))}
      <rect x="114" y="186" width="20" height="56" rx="10" fill="${g('kurk')}"/>
      <rect x="146" y="186" width="20" height="56" rx="10" fill="${g('kurk')}"/>
      ${oval(124, 243, 14, 8, '#f6e6c6')}${oval(156, 243, 14, 8, '#f6e6c6')}
      <path d="M119 244v-5M124 245v-6M129 244v-5M151 244v-5M156 245v-6M161 244v-5" stroke="#c9a877" stroke-width="2" stroke-linecap="round"/>
      <path d="M104 150q36 22 72 0" stroke="#7b3a2d" stroke-width="11" fill="none" stroke-linecap="round"/>
      <g fill="#e6eaec">${[112, 124, 140, 156, 168].map((x, i) => {
        const y = 150 + [5, 10, 12, 10, 5][i];
        return `<path d="M${x - 4} ${y}l4 -8 4 8z"/>`;
      }).join('')}</g>
      ${oval(140, 164, 6, 7, '#e0b454')}
      <g class="dost-kulak-sol"><path d="M104 72q-30 4-32 42q-2 30 16 38q12-2 16-30q4-24 0-50z" fill="${g('kulak')}"/></g>
      <g class="dost-kulak-sag"><path d="M176 72q30 4 32 42q2 30-16 38q-12-2-16-30q-4-24 0-50z" fill="${g('kulak')}"/></g>
      ${oval(140, 94, 42, 38, g('kurk'))}
      <path d="M104 98Q106 84 123 85Q140 91 157 85Q174 84 176 98Q176 114 159 121L157 158Q140 173 123 158L121 121Q104 114 104 98Z" fill="${g('maske')}"/>
      <path d="M140 108v34" stroke="#6b5a4e" stroke-width="7" stroke-linecap="round" opacity=".35"/>
      ${oval(123, 84, 6, 3.4, '#f7e1b6', 'opacity=".7"')}${oval(157, 84, 6, 3.4, '#f7e1b6', 'opacity=".7"')}
      ${gozler(122, 158, 101, .68)}
      ${oval(140, 145, 12.5, 8.5, '#1a1412')}${oval(136, 142, 3.6, 2.2, 'white', 'opacity=".6"')}
      <path d="M140 153v6M140 159q-9 7-16 2M140 159q9 7 16 2" stroke="#0f0b0a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      ${oval(140, 170, 6.5, 8.5, '#ea8a93')}<path d="M140 164v10" stroke="#cf6b76" stroke-width="1.6"/>`
  },

  /* ——— Bulut: kuzu ——— */
  'koyun-bulut': {
    degrade: { yun: ['#ffffff', '#f3eee2', '#d6cdb8'], yuz: ['#6a625c', '#3b3531'], kulak: ['#5a524c', '#35302c'] },
    ozel: (g) => {
      let yun = '';
      for (let i = 0; i < 14; i++) {
        const a = i / 14 * Math.PI * 2;
        yun += oval((140 + Math.cos(a) * 60).toFixed(1), (180 + Math.sin(a) * 30).toFixed(1), 24, 23, g('yun'));
      }
      let kivrim = '';
      [[104, 176], [126, 196], [154, 172], [176, 194], [140, 206], [118, 162], [164, 206]].forEach(([x, y]) => {
        kivrim += `<path d="M${x - 7} ${y}q7 -9 14 0q-2 7 -7 4" stroke="#d2c8b3" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      });
      return `
      <g stroke-linecap="round">
        <path d="M108 206v34M128 210v32M152 210v32M172 206v34" stroke="#3b3531" stroke-width="10"/>
        <path d="M108 236v6M128 238v6M152 238v6M172 236v6" stroke="#1f1b19" stroke-width="12"/>
      </g>
      <path class="dost-kuyruk" d="M198 172q20-6 22 10q-4 12-18 8" fill="${g('yun')}"/>
      ${yun}
      ${oval(140, 180, 62, 36, g('yun'))}
      ${kivrim}
      <g class="dost-kulak-sol">
        <ellipse cx="96" cy="112" rx="24" ry="10" transform="rotate(20 96 112)" fill="${g('kulak')}"/>
        <ellipse cx="98" cy="112" rx="15" ry="5" transform="rotate(20 98 112)" fill="#e7a9a4"/></g>
      <g class="dost-kulak-sag">
        <ellipse cx="184" cy="112" rx="24" ry="10" transform="rotate(-20 184 112)" fill="${g('kulak')}"/>
        <ellipse cx="182" cy="112" rx="15" ry="5" transform="rotate(-20 182 112)" fill="#e7a9a4"/></g>
      <path d="M140 84C114 84 106 110 112 132C117 152 128 162 140 162C152 162 163 152 168 132C174 110 166 84 140 84Z" fill="${g('yuz')}"/>
      ${oval(122, 86, 15, 13, g('yun'))}${oval(140, 78, 17, 14, g('yun'))}${oval(158, 86, 15, 13, g('yun'))}${oval(140, 92, 13, 9, g('yun'))}
      ${gozler(127, 153, 116, .6)}
      ${oval(140, 146, 15, 11, '#7a716a')}
      <path d="M134 142q3 3 0 6M146 142q-3 3 0 6" stroke="#2a2522" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M140 150v4M140 154q-5 4-9 1M140 154q5 4 9 1" stroke="#2a2522" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      ${oval(118, 138, 6, 4, '#e7a0a0', 'opacity=".55"')}${oval(162, 138, 6, 4, '#e7a0a0', 'opacity=".55"')}
      <path d="M118 162q22 12 44 0" stroke="#d2554b" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M131 168h18l3 14q-12 5-24 0z" fill="#e2b04f"/>
      ${oval(140, 183, 5, 3, '#b98b2e')}`;
    }
  },

  /* ——— Yalnız: gri kurt ——— */
  'kurt-yalniz': {
    degrade: { kurk: ['#d3d8dc', '#a0a7ae', '#6e767d'], acik: ['#fbf6ea', '#e6dcc8'], kuyruk: ['#b8bec4', '#838a91'],
               kulakIc: ['#efcfc4', '#cfa294'] },
    ozel: (g) => `
      <path class="dost-kuyruk" d="M182 224q56 6 66-30q4-20-10-24q-8 26-58 32z" fill="${g('kuyruk')}"/>
      <path d="M238 170q14 4 10 24q-3 10-10 14q6-18 0-38z" fill="#454b51"/>
      ${oval(100, 222, 28, 22, g('kurk'))}${oval(180, 222, 28, 22, g('kurk'))}
      ${oval(88, 242, 19, 8, '#e6dcc8')}${oval(192, 242, 19, 8, '#e6dcc8')}
      <path d="M140 142C110 142 100 180 102 214C104 240 176 240 178 214C180 180 170 142 140 142Z" fill="${g('kurk')}"/>
      <path d="M140 150C124 150 118 180 120 206C122 226 158 226 160 206C162 180 156 150 140 150Z" fill="${g('acik')}"/>
      <rect x="117" y="188" width="17" height="54" rx="8.5" fill="${g('kurk')}"/>
      <rect x="146" y="188" width="17" height="54" rx="8.5" fill="${g('kurk')}"/>
      ${oval(125, 243, 13, 7, '#efe7d7')}${oval(155, 243, 13, 7, '#efe7d7')}
      <path d="M96 136l12 6-4-14 14 10 2-14 12 12 8-12 8 12 12-12 2 14 14-10-4 14 12-6-8 22H104z" fill="${g('kurk')}"/>
      <g class="dost-kulak-sol"><path d="M100 94L106 32L136 72Z" fill="${g('kurk')}"/><path d="M106 84L109 48L126 72Z" fill="${g('kulakIc')}"/></g>
      <g class="dost-kulak-sag"><path d="M180 94L174 32L144 72Z" fill="${g('kurk')}"/><path d="M174 84L171 48L154 72Z" fill="${g('kulakIc')}"/></g>
      ${oval(140, 100, 44, 38, g('kurk'))}
      <path d="M100 100l-22 12 16 2-14 12 22-2q6-10 6-20z" fill="${g('kurk')}"/>
      <path d="M180 100l22 12-16 2 14 12-22-2q-6-10-6-20z" fill="${g('kurk')}"/>
      <path d="M108 106q32-12 64 0l-6 30q-26 20-52 0z" fill="${g('acik')}"/>
      <path d="M126 70q14-6 28 0l-4 26q-10 6-20 0z" fill="#8a9198" opacity=".55"/>
      <g class="dost-gozleri">${kurtGozu(121, 100, 1)}${kurtGozu(157, 100, -1)}</g>
      <path d="M108 86q10-8 22 -2M172 86q-10-8 -22 -2" stroke="#50575d" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path d="M126 114q14-6 28 0l-2 26q-12 10-24 0z" fill="${g('acik')}"/>
      ${oval(140, 120, 11, 8, '#2a2626')}${oval(136, 117, 3.2, 2, 'white', 'opacity=".6"')}
      <path d="M140 128v8M140 136q-7 5-13 1M140 136q7 5 13 1" stroke="#3a3535" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <g stroke="#9aa1a8" stroke-width="1.8" stroke-linecap="round" opacity=".7">
        <path d="M128 126q-18-2-26-8M152 126q18-2 26-8"/></g>`
  }
};

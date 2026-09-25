/* Tilki ile Leylek kadrosu — karakter kodu → çizim tarifi (bkz. kadro.js).

   Dört karakter, dördü de GERÇEK hayvanına benziyor (280×270 tuval):
     tilki-alev    turuncu tilki: üçgen, ucu siyah büyük kulaklar; beyaz
                   yanaklarla aşağı sivrilen burun ve siyah burun ucu;
                   beyaz göğüs; alt bacaklar siyah "çorap"; gür, ucu BEYAZ
                   kuyruk. Ev sahibi: boynunda yeşil bir fular.
     leylek-lale   beyaz leylek: küçük baş, uzun S boyun, UZUN KIRMIZI GAGA,
                   uzun kırmızı bacaklar (diz geriye kırılır), kanadın
                   arka ucunda SİYAH uçuş tüyleri. Başında küçük bir çiçek.
     kirpi-diken   aşçı kirpi, dörtte üç yandan: alından sırta DİKEN kubbesi
                   (koyu kök, açık uç), öne SİVRİLEN uzun burun ve iri siyah
                   burun ucu, boncuk gözler, dikene gömülü küçük kulak.
                   Aşçı şapkası ve tahta kepçe.
     baykus-bilge  baykuş: yumurta gövde, başın üstünde TÜY KULAKLAR, kalp
                   biçimli yüz diski, iri SARI gözler, kısa kanca gaga,
                   göğüste V benekler, sarı pençeler. Bilge: yuvarlak gözlük. */

import {oval, gozler} from './ortak.js';

/* Kirpi dikenleri: bir kubbenin kenarından dışa bakan sivri üçgenler.
   İki katman — koyu kök ve ucu açık renk çizgi — kirpiyi kirpi yapar.
   Açılar derece; oynama sabit (her çizimde aynı). */
function dikenKatmani(cx, cy, rx, ry, bas, son, adet, boy, renk, uc) {
  let kok = '', ucl = '';
  for (let i = 0; i < adet; i++) {
    const oyna = ((i * 53) % 13) / 13;
    const a = (bas + (son - bas) * i / (adet - 1) + (oyna - .5) * 5) * Math.PI / 180;
    const L = boy * (.78 + oyna * .5);
    const bx = cx + Math.cos(a) * rx * .92, by = cy + Math.sin(a) * ry * .92;
    const tx = bx + Math.cos(a) * L, ty = by + Math.sin(a) * L;
    const nx = -Math.sin(a) * 4.6, ny = Math.cos(a) * 4.6;
    const ux = bx + Math.cos(a) * L * .6, uy = by + Math.sin(a) * L * .6;
    const f = v => v.toFixed(1);
    kok += `M${f(bx + nx)} ${f(by + ny)}L${f(tx)} ${f(ty)}L${f(bx - nx)} ${f(by - ny)}Z`;
    ucl += `M${f(ux)} ${f(uy)}L${f(tx)} ${f(ty)}`;
  }
  return `<path d="${kok}" fill="${renk}"/><path d="${ucl}" stroke="${uc}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
}

export default {
  /* Alev — tilki. Düşüncesiz ama iyi kalpli ev sahibi. */
  'tilki-alev': {
    degrade: { kurk: ['#f6a45a', '#e27a32', '#b8551f'], kuyruk: ['#f7ad63', '#e2782f', '#b9561f'],
               beyaz: ['#fffdf6', '#f3eadb'], kulak: ['#f19a4f', '#d56c2a'] },
    ozel: g => `
      <g class="dost-kuyruk">
        <path d="M168 236C224 252 266 212 258 160C254 132 232 118 214 128C206 134 210 144 218 150C232 170 222 206 176 214Z" fill="${g('kuyruk')}"/>
        <path d="M214 128C230 118 256 128 259 154C252 146 238 140 226 146C220 140 214 134 214 128Z" fill="#fffaf0"/>
        <path d="M226 146C238 140 252 146 259 154" fill="none" stroke="#efe3cf" stroke-width="3" stroke-linecap="round"/>
      </g>
      <path d="M140 146C104 146 90 196 94 230C97 252 183 252 186 230C190 196 176 146 140 146Z" fill="${g('kurk')}"/>
      <path d="M140 156C118 166 114 204 122 236L158 236C166 204 162 166 140 156Z" fill="${g('beyaz')}"/>
      <g>
        <path d="M110 196h18v30h-18z" fill="#e27a32"/><path d="M152 196h18v30h-18z" fill="#e27a32"/>
        <path d="M110 222h18v16q0 8-9 8t-9-8z" fill="#3b2a25"/><path d="M152 222h18v16q0 8-9 8t-9-8z" fill="#3b2a25"/>
        ${oval(119, 244, 13, 6, '#3b2a25')}${oval(161, 244, 13, 6, '#3b2a25')}
      </g>
      <path d="M100 90L84 26L132 64Z" fill="${g('kulak')}"/>
      <path d="M180 90L196 26L148 64Z" fill="${g('kulak')}"/>
      <path d="M86 34L84 26L100 38Q92 36 86 34Z" fill="#3b2a25"/><path d="M84 26L90 50L102 40Z" fill="#3b2a25"/>
      <path d="M196 26L190 50L178 40Z" fill="#3b2a25"/>
      <path d="M102 84L92 44L124 68Z" fill="#fbe3c6"/><path d="M178 84L188 44L156 68Z" fill="#fbe3c6"/>
      <path d="M140 62C178 62 200 86 201 114C202 128 190 136 176 142C164 150 152 160 140 166C128 160 116 150 104 142C90 136 78 128 79 114C80 86 102 62 140 62Z" fill="${g('kurk')}"/>
      <path d="M80 116C94 126 110 128 122 136C130 146 136 156 140 160C144 156 150 146 158 136C170 128 186 126 200 116C198 132 184 140 172 146C160 154 150 164 140 170C130 164 120 154 108 146C96 140 82 132 80 116Z" fill="${g('beyaz')}"/>
      <path d="M140 96C128 110 126 132 132 150L148 150C154 132 152 110 140 96Z" fill="#fff4e4" opacity=".55"/>
      ${gozler(116, 164, 106, .74)}
      ${oval(102, 132, 9, 5, '#f0a07f', 'opacity=".8"')}${oval(178, 132, 9, 5, '#f0a07f', 'opacity=".8"')}
      ${oval(140, 160, 10, 7.5, '#2f2522')}${oval(136, 157, 3.4, 2.2, 'white', 'opacity=".6"')}
      <path d="M131 172q9 7 18 0" fill="none" stroke="#6a5148" stroke-width="2.6" stroke-linecap="round"/>
      <g stroke="#8a6a58" stroke-width="1.8" stroke-linecap="round" opacity=".55" fill="none">
        <path d="M126 162q-22-4-36 0M127 167q-20 4-32 12"/><path d="M154 162q22-4 36 0M153 167q20 4 32 12"/>
      </g>
      <path d="M110 170Q140 188 170 170L162 184Q140 196 118 184Z" fill="#5f9b6a"/>
      <path d="M134 184l6 22 6-22z" fill="#4f8a5b"/>`
  },

  /* Lale — beyaz leylek. Uzun kırmızı gaga, uzun kırmızı bacak, siyah kanat ucu. */
  'leylek-lale': {
    degrade: { tuy: ['#ffffff', '#f1f1ec', '#d9dcd6'], kanat: ['#fbfbf8', '#e5e7e1'],
               gaga: ['#f58a5c', '#e0532f', '#b93f22'] },
    ozel: g => `
      <g class="dost-bacaklar" stroke="#e25a36" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="M134 184L128 214L136 244" stroke-width="7"/><path d="M162 184L168 214L160 244" stroke-width="7"/>
        <path d="M136 244l-16 4M136 244l2 7M136 244l14 3M160 244l-14 4M160 244l-2 7M160 244l16 3" stroke-width="4.5"/>
      </g>
      ${oval(128, 214, 5, 5, '#c94a2c')}${oval(168, 214, 5, 5, '#c94a2c')}
      <path d="M92 150C94 118 132 106 170 112C204 118 228 138 236 160C222 176 190 190 150 190C114 190 90 176 92 150Z" fill="${g('tuy')}"/>
      <g class="dost-kanat-sag">
        <path d="M136 128C170 116 212 128 232 156C218 170 190 178 160 174C142 164 132 146 136 128Z" fill="${g('kanat')}"/>
        <path d="M180 170C204 172 232 166 252 150C246 164 238 172 226 178C214 184 196 184 180 180Z" fill="#26272b"/>
        <path d="M188 160C212 162 236 154 256 136C250 152 240 164 226 170C212 174 198 172 186 170Z" fill="#303136"/>
        <path d="M196 150C218 150 238 140 252 124C248 140 238 152 224 158C214 162 204 160 194 158Z" fill="#3a3b40"/>
        <path d="M150 140q30-8 58 4M154 154q28-4 52 8" stroke="#d8dbd3" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      </g>
      <path d="M112 132C100 118 96 98 104 82C110 70 116 62 114 52" fill="none" stroke="#f4f4ef" stroke-width="24" stroke-linecap="round"/>
      <path d="M112 132C100 118 96 98 104 82" fill="none" stroke="#e1e3dc" stroke-width="3" opacity=".5" stroke-linecap="round"/>
      ${oval(112, 56, 29, 27, g('tuy'))}
      <path d="M92 58C74 62 44 70 14 84C44 82 74 78 94 72Z" fill="${g('gaga')}"/>
      <path d="M92 66C74 70 46 76 14 84C46 80 74 76 94 72Z" fill="#c9462a" opacity=".55"/>
      <g class="dost-gozleri">
        ${oval(106, 52, 7.5, 9, '#fffdf4')}${oval(107, 53, 4.6, 6, '#2f3a36')}${oval(108.6, 50.6, 1.8, 2.2, 'white')}
        ${oval(126, 50, 8.5, 10, '#fffdf4')}${oval(127.5, 51, 5.2, 6.6, '#2f3a36')}${oval(129.5, 48.4, 2, 2.4, 'white')}
      </g>
      <path d="M100 44q6-5 12-2M120 40q7-4 13 0" stroke="#3a3b40" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      ${oval(118, 70, 7, 4, '#f3b3a4', 'opacity=".75"')}
      <g transform="translate(130 32)">
        ${[0, 72, 144, 216, 288].map(a => oval(Math.cos(a * Math.PI / 180) * 7, Math.sin(a * Math.PI / 180) * 7, 6, 6, '#f2a7c3')).join('')}
        ${oval(0, 0, 4.5, 4.5, '#f6d36b')}
      </g>`
  },

  /* Diken — aşçı kirpi. Dörtte üç yandan, başı sola dönük. Bir kirpiyi
     kirpi yapan şeyler: alından başlayıp bütün sırtı örten DİKEN kubbesi
     (koyu kök, açık uç); dikenlerin önünde açık renk, öne doğru SİVRİLEN
     uzun bir burun ve ucunda iri siyah burun; küçük boncuk gözler; diken
     kenarına gömülü küçük yuvarlak kulak; kısa bacaklar. (İlk çizimde yüz
     kocaman yuvarlak bir tabaktı, burun minicikti: dikenli giysili bir
     ayıcığa benziyordu.) Aşçı şapkası dikenlerin üstünde, elinde kepçe. */
  'kirpi-diken': {
    degrade: { diken: ['#9b7552', '#6f4e33', '#4a3322'], yuz: ['#f6e2c2', '#e3c396', '#c29d6c'],
               karin: ['#fcf0dc', '#ecd6b2'] },
    ozel: g => `
      ${oval(118, 242, 17, 7, '#8a6a52')}${oval(178, 244, 17, 7, '#8a6a52')}
      ${dikenKatmani(160, 158, 82, 76, 188, 418, 46, 30, '#4a3322', '#f1e4cc')}
      ${oval(160, 160, 82, 74, g('diken'))}
      ${dikenKatmani(164, 150, 60, 54, 196, 404, 30, 24, '#6f4e33', '#f6ecd8')}
      <path d="M132 208C124 240 204 244 204 210C206 186 186 168 162 168C144 170 134 186 132 208Z" fill="${g('karin')}"/>
      <path d="M150 88C134 90 118 102 106 114C92 126 72 136 58 144C48 150 48 158 58 160C76 162 94 168 112 174C132 180 154 178 164 162C174 146 172 118 162 100C158 92 154 88 150 88Z" fill="${g('yuz')}"/>
      <path d="M150 88C144 100 144 112 150 122C156 132 166 136 172 132C170 118 164 100 150 88Z" fill="#6f4e33"/>
      ${dikenKatmani(158, 118, 16, 30, 250, 330, 5, 14, '#5b4029', '#f1e4cc')}
      ${oval(56, 150, 9.5, 8, '#2a2220')}${oval(53, 147, 3.2, 2.2, 'white', 'opacity=".7"')}
      <path d="M66 160q12 6 24 3" stroke="#8f6f58" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <g stroke="#6f5646" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".55">
        <path d="M66 150q-16-8-26-6M66 155q-16 0-24 6"/>
      </g>
      <g class="dost-gozleri">
        ${oval(98, 126, 6.5, 7.5, '#2a2220')}${oval(100.4, 123.4, 2.3, 2.6, 'white')}
        ${oval(128, 124, 8, 9, '#2a2220')}${oval(131, 120.6, 2.8, 3.2, 'white')}${oval(126, 128, 1.3, 1.3, 'white', 'opacity=".7"')}
      </g>
      <path d="M90 114q8-5 16-2M120 110q9-4 18 1" stroke="#9c7a5c" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".55"/>
      ${oval(142, 100, 11, 10, '#c7a47c')}${oval(142, 101, 6.5, 6, '#e8b0a0')}
      ${oval(122, 148, 10, 6, '#eea08d', 'opacity=".6"')}
      <g transform="rotate(14 176 64)">
        <path d="M144 80C136 56 154 40 168 48C172 32 196 32 198 50C214 44 224 64 210 80Z" fill="#fffdf8"/>
        <path d="M146 78h62v13q-31 7-62 0z" fill="#f1ece0"/>
        <path d="M158 68q4-12 10-15M180 62q2-11 8-15" stroke="#e6e0d2" stroke-width="3" fill="none" stroke-linecap="round"/>
      </g>
      <g transform="rotate(20 196 196)">
        <rect x="192" y="152" width="8" height="86" rx="4" fill="#b98a55"/>
        ${oval(196, 146, 14, 19, '#c99a62')}${oval(196, 146, 9, 13, '#b98a55')}
      </g>
      ${oval(150, 200, 11, 9, '#dcc09a')}${oval(186, 204, 11, 9, '#dcc09a')}
      <path d="M143 204l-3 5M150 206v5M157 204l3 5M180 208l-3 5M187 210v5M194 208l3 5" stroke="#8f6f58" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>`
  },

  /* Bilge — komşu baykuş. Tüy kulaklar, yüz diski, iri sarı gözler, gözlük. */
  'baykus-bilge': {
    degrade: { tuy: ['#b89572', '#8f6c4d', '#684b33'], disk: ['#f6ead3', '#e5d2b0'],
               gogus: ['#f1e2c4', '#dcc59c'], kanat: ['#9c7858', '#6f5139'] },
    ozel: g => `
      <g stroke="#e0a93f" stroke-width="6" stroke-linecap="round" fill="none">
        <path d="M122 236l-8 12M122 236v14M122 236l8 12M158 236l-8 12M158 236v14M158 236l8 12"/>
      </g>
      <path d="M64 250h152" stroke="#8e6a45" stroke-width="10" stroke-linecap="round"/>
      <g class="dost-kanat-sol"><path d="M84 132C60 150 58 204 88 232C98 206 100 166 96 136Z" fill="${g('kanat')}"/>
        <path d="M74 176q10 6 20 4M72 196q10 6 22 4" stroke="#5b4230" stroke-width="2.4" fill="none" opacity=".6"/></g>
      <g class="dost-kanat-sag"><path d="M196 132C220 150 222 204 192 232C182 206 180 166 184 136Z" fill="${g('kanat')}"/>
        <path d="M206 176q-10 6-20 4M208 196q-10 6-22 4" stroke="#5b4230" stroke-width="2.4" fill="none" opacity=".6"/></g>
      <path d="M140 76C92 76 78 124 82 170C86 222 110 242 140 242C170 242 194 222 198 170C202 124 188 76 140 76Z" fill="${g('tuy')}"/>
      <path d="M140 150C112 150 104 178 108 204C112 228 126 236 140 236C154 236 168 228 172 204C176 178 168 150 140 150Z" fill="${g('gogus')}"/>
      <g fill="#8f6c4d" opacity=".75">
        <path d="M122 176l6 7 6-7M146 176l6 7 6-7M130 194l6 7 6-7M138 212l2 0M154 194l-2 0"/>
      </g>
      <g stroke="#8f6c4d" stroke-width="3" stroke-linecap="round" fill="none" opacity=".75">
        <path d="M122 176l6 7 6-7M146 176l6 7 6-7M130 196l6 7 6-7M154 196l-6 7-6-7M138 216l2 4 2-4"/>
      </g>
      <path d="M96 92L88 54L118 80Z" fill="#7a5a3f"/><path d="M184 92L192 54L162 80Z" fill="#7a5a3f"/>
      <path d="M98 86L94 64L112 80Z" fill="#a6835f"/><path d="M182 86L186 64L168 80Z" fill="#a6835f"/>
      <path d="M140 102C124 88 94 92 94 122C94 146 118 156 140 146C162 156 186 146 186 122C186 92 156 88 140 102Z" fill="${g('disk')}"/>
      <g class="dost-gozleri">
        ${oval(117, 122, 17, 17, '#f4c74a')}${oval(117, 123, 8.5, 9, '#2a2320')}${oval(120, 119, 3, 3.2, 'white')}
        ${oval(163, 122, 17, 17, '#f4c74a')}${oval(163, 123, 8.5, 9, '#2a2320')}${oval(166, 119, 3, 3.2, 'white')}
      </g>
      <g fill="none" stroke="#5a4a3d" stroke-width="3.2">
        <circle cx="117" cy="122" r="21"/><circle cx="163" cy="122" r="21"/><path d="M138 120q2-4 4 0" stroke-linecap="round"/>
      </g>
      <path d="M132 136h16l-8 16z" fill="#d9a043"/><path d="M140 152l-3-4h6z" fill="#b98232"/>
      ${oval(104, 146, 7, 4, '#e6a58c', 'opacity=".6"')}${oval(176, 146, 7, 4, '#e6a58c', 'opacity=".6"')}
      <path d="M100 100q18-12 36-2M180 100q-18-12-36-2" stroke="#6b4e36" stroke-width="3" fill="none" stroke-linecap="round"/>`
  }
};


/* Kadro çizim yardımcıları. Her masalın kendi kadro dosyası bunları
   kullanır; böylece yeni masal eklemek mevcut dosyalara dokunmaz. */

export let seri = { n: 0 };
export const oval = (x, y, rx, ry, fill, rest = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${rest}/>`;
export const gozler = (x1, x2, y, r = 1) => `<g class="dost-gozleri">${[x1, x2].map(x =>
  oval(x, y, 13 * r, 17 * r, '#fffdf4') + oval(x + 2, y + 2, 8 * r, 11 * r, '#334b46') +
  oval(x + 4, y - 3, 3.5 * r, 4.5 * r, 'white') + oval(x - 1, y + 8 * r, 1.6, 2, '#a7c1b3')).join('')}</g>`;
export const gulus = (x, y, w = 9) => `<path d="M${x - w} ${y}q${w} 11 ${w * 2} 0" fill="none" stroke="#6a5148" stroke-width="3" stroke-linecap="round"/>`;

/* Karınca gövdesi: baş + göğüs + karın, altı bacak, iki duyarga.
   Üç karınca aynı iskeleti paylaşır; renk ve aksesuar ayırır. */
export function karincaGovde(g, ton, aksesuar = '') {
  return `
  <g class="dost-bacaklar" stroke="${ton.bacak}" stroke-width="7" stroke-linecap="round" fill="none">
    <path d="M112 168q-34 6-44 30M112 186q-38 14-44 40M116 200q-30 22-30 44"/>
    <path d="M168 168q34 6 44 30M168 186q38 14 44 40M164 200q30 22 30 44"/>
  </g>
  <g class="dost-kuyruk" stroke="${ton.bacak}" stroke-width="6" stroke-linecap="round" fill="none">
    <path d="M118 74q-16-30-38-34"/><path d="M162 74q16-30 38-34"/>
  </g>
  ${oval(80, 38, 8, 8, ton.bacak)}${oval(200, 38, 8, 8, ton.bacak)}
  ${oval(140, 212, 44, 35, g('karin'))}
  ${oval(140, 205, 30, 22, ton.parlak, 'opacity=".45"')}
  <path d="M100 206h80M104 224h72" stroke="${ton.bacak}" stroke-width="3" opacity=".35" stroke-linecap="round"/>
  ${oval(140, 166, 33, 28, g('govde'))}
  ${oval(140, 114, 50, 45, g('bas'))}
  ${gozler(118, 160, 112)}
  ${oval(104, 136, 11, 6, ton.yanak)}${oval(176, 136, 11, 6, ton.yanak)}
  ${gulus(140, 142)}
  ${aksesuar}`;
}

/* Fare gövdesi. Gerçek bir fareyi fare yapan şeyler: kafa yuvarlak değil,
   öne doğru SİVRİLEN bir damla ve ucunda pembe burun; kulaklar büyük, ince,
   kafanın üst yanlarında; gözler küçük parlak boncuk; uzun bıyıklar; armut
   biçimli oturan gövde; uzun, ince, çıplak kuyruk; uzun pembe arka ayaklar
   ve göğüste tutulan minik ön patiler. (İlk sürüm yuvarlak kafalı bir
   ayıcığa benziyordu.) İki fare aynı iskeleti paylaşır; renk ve aksesuar ayırır. */
const boncukGoz = (x, y) => oval(x, y, 9, 10.5, '#2f2a2a') + oval(x + 3, y - 3.5, 3.2, 3.6, 'white') + oval(x - 2.5, y + 4, 1.4, 1.4, '#ffffff', 'opacity=".6"');
export function fareGovde(g, ton, aksesuar = '') {
  return `
  <path class="dost-kuyruk" d="M178 226q46 14 60-18q12-30-10-44q-14-8-22 4" stroke="${ton.kuyruk}" stroke-width="6" fill="none" stroke-linecap="round"/>
  ${oval(104, 238, 26, 10, ton.ayak)}${oval(176, 238, 26, 10, ton.ayak)}
  <path d="M84 240h6M90 242h6M190 242h6M196 240h6" stroke="${ton.burun}" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>
  <path d="M140 160C106 160 88 196 92 222C95 244 185 244 188 222C192 196 174 160 140 160Z" fill="${g('kurk')}"/>
  ${oval(140, 212, 30, 28, g('karin'))}
  ${oval(126, 196, 9, 7, ton.ayak)}${oval(154, 196, 9, 7, ton.ayak)}
  <g transform="rotate(-18 86 100)">${oval(86, 100, 38, 36, g('kurk'))}${oval(88, 103, 26, 25, g('ic'))}</g>
  <g transform="rotate(18 194 100)">${oval(194, 100, 38, 36, g('kurk'))}${oval(192, 103, 26, 25, g('ic'))}</g>
  <path d="M140 196Q126 196 115 182Q97 160 97 136Q99 104 140 102Q181 104 183 136Q183 160 165 182Q154 196 140 196Z" fill="${g('kurk')}"/>
  ${oval(140, 176, 21, 17, g('karin'), 'opacity=".85"')}
  <g class="dost-gozleri">${boncukGoz(120, 144)}${boncukGoz(160, 144)}</g>
  ${oval(108, 164, 8, 5, ton.yanak, 'opacity=".7"')}${oval(172, 164, 8, 5, ton.yanak, 'opacity=".7"')}
  <g stroke="${ton.biyik}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8">
    <path d="M126 180q-30-8-50-16M125 185q-32-1-54 2M127 189q-28 8-44 18"/>
    <path d="M154 180q30-8 50-16M155 185q32-1 54 2M153 189q28 8 44 18"/>
  </g>
  ${oval(140, 190, 9, 7, ton.burun)}${oval(137, 187, 3, 2.2, 'white', 'opacity=".55"')}
  <path d="M132 199q4 5 8 0q4 5 8 0" fill="none" stroke="#6a5148" stroke-width="2.4" stroke-linecap="round"/>
  ${aksesuar}`;
}


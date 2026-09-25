/* Çiftçi Fare — 'ciftlik-' önekli ikonlar.

   ikon.js'in EK_CIZIMLER defterine ÇALIŞMA ANINDA eklenir (ikonlar/liste.js
   değiştirilmez). Kurallar:
   - Ad 'ciftlik-' ile başlar: masalların ikonlarıyla çakışmaz.
   - Adda 'yavru', 'kuzu', 'civciv', 'buzagi' geçmez: ikon.js onları
     küçültüyor.
   - Degrade/desen yok (düz renk): sayfada çözülmeyen url(#...) kalmaz.
   - 120×120 kutu (ikon.js'in base() çerçevesi). */

import {EK_CIZIMLER} from '../masal/ikonlar/liste.js';

const e = (x, y, rx, ry, renk, ek = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${renk}"${ek}/>`;

export const CIFTLIK_IKONLARI = {
  /* Çiftçi fare: iri kulaklar, sivri burun, bıyık, hasır şapka (kırmızı bant) ve boyun mendili. */
  'ciftlik-fare':
    e(31, 50, 19, 19, '#a98463') + e(31, 51, 12, 12, '#e9a79c') +
    e(89, 50, 19, 19, '#a98463') + e(89, 51, 12, 12, '#e9a79c') +
    e(60, 70, 29, 27, '#a98463') +
    '<path d="M44 80q16 26 32 0q-8 18-16 19q-8-1-16-19z" fill="#ecdcc4"/>' +
    e(60, 86, 6, 5, '#e9a79c') +
    '<circle cx="49" cy="70" r="4.2" fill="#2a2626"/><circle cx="71" cy="70" r="4.2" fill="#2a2626"/>' +
    '<circle cx="50.4" cy="68.6" r="1.4" fill="#fff"/><circle cx="72.4" cy="68.6" r="1.4" fill="#fff"/>' +
    '<path d="M50 88l-20-4m20 7l-20 4m40-7l20-4m-20 7l20 4" stroke="#5d5048" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M38 98q22 14 44 0l-4 10q-18 9-36 0z" fill="#d9714f"/><path d="M54 104l6 12 6-12z" fill="#c45f40"/>' +
    e(60, 40, 44, 10, '#e9cc7a') + e(60, 41, 44, 10, 'none', ' stroke="#c79a45" stroke-width="2.4"') +
    '<path d="M38 40q0-24 22-24t22 24z" fill="#d4ae5a"/>' +
    '<path d="M38.5 36h43v6h-43z" fill="#d9714f"/>',
  /* Çiftlik evi (menüde ve düğmelerde). */
  'ciftlik-ev':
    '<path d="M14 58 60 20l46 38z" fill="#c2553c"/><path d="M24 56h72v46H24z" fill="#f3e7cc"/>' +
    '<path d="M52 72h16v30H52z" fill="#8a5a36"/><path d="M31 66h14v14H31zm44 0h14v14H75z" fill="#9fcbd8" stroke="#fbf6ea" stroke-width="3"/>' +
    '<path d="M76 26h10v20H76z" fill="#b46a4c"/><path d="M18 102h84v6H18z" fill="#b88a5a"/>'
};

/* İŞLERİN İKONLARI (Aşama 1b, js/ciftlik/isler.js). Gerçeğine benzer:
   - Olgun domates yalnız renkle ayrılmaz (kırmızı-yeşil renk körü çocuk):
     İRİ, PARLAK (beyaz parıltı) ve YILDIZ biçimli yeşil saplı. Ham domates
     KÜÇÜK, mat, üstünü bir yaprak örtüyor (yaprak gölgesi), sapı kapalı.
   - Tavuk yandan: kızıl tüy, küçük kırmızı ibik, gerdan, sarı gaga ve
     bacaklar, kalkık koyu kuyruk (hayvan3b.js'teki 'kizil' tavukla aynı).
   - Ceviz kabuklu: kırışık açık kahve kabuk, ortada dikiş. */
const yildiz = (cx, cy, R, r, n = 5) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / n, u = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + (cx + Math.cos(a) * u).toFixed(1) + ' ' + (cy + Math.sin(a) * u).toFixed(1);
  }
  return d + 'z';
};
const yumurtaYolu = (cx, cy, g, b) =>
  `M${cx} ${cy - b}c${-g * .66} 0 ${-g} ${b * .8} ${-g} ${b * 1.3}c0 ${b * .5} ${g * .45} ${b * .8} ${g} ${b * .8}s${g} ${-b * .3} ${g} ${-b * .8}c0 ${-b * .5} ${-g * .34} ${-b * 1.3} ${-g} ${-b * 1.3}z`;

Object.assign(CIFTLIK_IKONLARI, {
  /* Sert toprak keseği: kahverengi, çatlak, kırıntılı (gri taştan ayrı). */
  'ciftlik-kesek':
    '<path d="M14 84q-4-22 14-34 8-18 30-19 22-1 32 13 18 7 16 27 1 17-18 21H32q-16 0-18-8z" fill="#9c6b43"/>' +
    '<path d="M24 72q3-15 16-22 10-12 26-11 14 1 22 11 11 6 12 18" fill="none" stroke="#b98659" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M46 50l6 14-8 11m25-27-5 14 10 9m-46 7 13-5" fill="none" stroke="#5e3d24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    e(26, 99, 6, 3, '#7c5434') + e(96, 100, 5, 3, '#7c5434') + e(84, 104, 3, 2, '#7c5434'),
  /* Filiz: topraktan çıkan iki çenek yaprak. */
  'ciftlik-filiz':
    e(60, 102, 34, 9, '#8b5e3c') +
    '<path d="M60 100V58" stroke="#5f9a45" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M59 68Q30 72 25 45q31-6 34 23z" fill="#79b85a"/><path d="M61 60q2-29 33-31 2 29-33 31z" fill="#8fcc68"/>' +
    '<path d="M57 66 36 51m27-8 21-12" stroke="#4f8a3b" stroke-width="2.5" stroke-linecap="round"/>',
  /* Tohum kesesi: bağcıklı çuval, üstünde tohum resmi. */
  'ciftlik-kese':
    '<path d="M34 44q-14 20-12 40 2 22 38 24 36-2 38-24 2-20-12-40z" fill="#d7b27a"/>' +
    '<path d="M40 45q-7-13 4-21 8 6 16 0 8 6 16 0 11 8 4 21z" fill="#c69a5c"/>' +
    '<path d="M36 46q24 9 48 0" stroke="#8a5a2b" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M84 46q9 5 6 14" stroke="#8a5a2b" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<path d="M38 66h44M34 96h52" stroke="#c49a62" stroke-width="3" stroke-dasharray="5 5"/>' +
    e(60, 82, 9, 12, '#9a6a3c') + e(57, 78, 3, 5, '#c79d66'),
  /* Destek çubuğu: sivri uçlu tahta kazık, iki sicim bağı. */
  'ciftlik-cubuk':
    e(61, 110, 18, 4, '#8b5e3c') +
    '<path d="M55 10h12l-1 92-5 10-5-10z" fill="#b8874f"/><path d="M59 14v86" stroke="#d6a86a" stroke-width="3"/>' +
    '<path d="M50 40q11 7 22 0M50 64q11 7 22 0" stroke="#efe0a8" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M72 40l7 5m-7 19 7 5" stroke="#efe0a8" stroke-width="3.5" stroke-linecap="round"/>',
  /* OLGUN domates: iri, parlak, yıldız saplı. */
  'ciftlik-domates':
    e(60, 70, 43, 38, '#d8352a') +
    '<path d="M30 58q5-17 22-21M90 58q-5-17-22-21" fill="none" stroke="#b7291f" stroke-width="5" stroke-linecap="round"/>' +
    e(41, 57, 12, 7, '#fff4ef', ' opacity=".85" transform="rotate(-24 41 57)"') + e(33, 73, 4, 6, '#fff4ef', ' opacity=".6"') +
    `<path d="${yildiz(60, 35, 24, 8)}" fill="#3f8a3a" stroke="#2f6d2b" stroke-width="2" stroke-linejoin="round"/>` +
    '<path d="M60 34V14q1-6 8-7" stroke="#3f7a32" stroke-width="6" fill="none" stroke-linecap="round"/>',
  /* HAM domates: küçük, mat yeşil, üstünde yaprak ve yaprağın gölgesi. */
  'ciftlik-domates-ham':
    e(62, 80, 26, 23, '#8fbf55') + e(58, 70, 22, 10, '#6f9c43') +
    '<path d="M44 86q4 10 14 12" fill="none" stroke="#a9d06f" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M57 58l5-6 5 6-5 3z" fill="#557f36"/>' +
    '<path d="M18 50q34-34 84-12-30 26-84 12z" fill="#4c8a3c"/><path d="M26 49q34-6 66-10" stroke="#3a6d2e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M60 44l-6-10m20 6 4-12" stroke="#3a6d2e" stroke-width="2.5" stroke-linecap="round"/>',
  /* Ceviz: kabuklu, kırışık, ortada dikiş. */
  'ciftlik-ceviz':
    e(60, 65, 37, 41, '#b88a5a') +
    '<path d="M60 25q-7 40 0 81" stroke="#8a6238" stroke-width="5" fill="none"/>' +
    '<path d="M37 45q8 6 4 14t6 14q-6 8 2 16M83 45q-8 6-4 14t-6 14q6 8-2 16M47 34q4 8 0 12M73 34q-4 8 0 12" stroke="#94693f" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
    e(46, 50, 6, 9, '#cfa575') + '<path d="M56 26l4-9 4 9z" fill="#8a6238"/>',
  /* Tavuk yemi: tas içinde karışık tane (mısır, buğday). */
  'ciftlik-yem':
    '<path d="M22 60q38-36 76 0z" fill="#e2b85c"/>' +
    [[40, 52, '#f2d27a'], [52, 44, '#c9923e'], [64, 42, '#f2d27a'], [76, 50, '#e8c46a'], [58, 54, '#c9923e'], [46, 58, '#f6dc8e'], [70, 58, '#f2d27a'], [84, 57, '#c9923e'], [34, 58, '#c9923e']]
      .map(([x, y, r]) => e(x, y, 4.5, 3.4, r)).join('') +
    '<path d="M14 62h92q-4 38-46 40-42-2-46-40z" fill="#8f9da5"/>' + e(60, 62, 46, 8, '#b3c0c7') + e(60, 62, 40, 5, '#e2b85c') +
    '<path d="M30 76q30 14 60 0" stroke="#a9b6bd" stroke-width="4" fill="none" stroke-linecap="round"/>',
  /* Tavuk (yandan, sola bakar). */
  'ciftlik-tavuk':
    '<path d="M84 62q2-32 20-40-2 14 5 20-7 3-4 13-6 2-9 12z" fill="#3f2415"/><path d="M88 56q6-20 14-26" stroke="#5a3520" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M52 92v16m-7 0h13M68 92v16m-7 0h13" stroke="#e2aa35" stroke-width="4.5" stroke-linecap="round"/>' +
    '<path d="M22 62q0-16 14-22 18-6 32 1 22-6 34 9 6 18-6 31-12 15-38 15-34-2-36-34z" fill="#a9582d"/>' +
    e(34, 66, 12, 15, '#b86a3c') +
    '<path d="M50 66q18-12 36 0-4 19-24 19-13-4-12-19z" fill="#8c4320"/><path d="M58 76q12 5 22-2M56 70q14 3 26-3" stroke="#4b2513" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    e(34, 38, 14, 13, '#bb6a38') +
    '<path d="M25 27q1-8 6-5 2-8 7-3 4-6 7 2 2 5-2 7H25z" fill="#d8362b"/>' +
    '<path d="M22 36 9 41l13 4z" fill="#e9b13f"/>' +
    '<path d="M23 46q-3 11 4 11 5-2 2-11z" fill="#d8362b"/>' +
    e(31, 38, 6.5, 5.5, '#dc4a3a') + '<circle cx="30" cy="37" r="2.8" fill="#241a14"/><circle cx="29.2" cy="36.2" r=".9" fill="#fff"/>',
  /* Yumurta: kremsi kahve, parıltılı. */
  'ciftlik-yumurta':
    `<path d="${yumurtaYolu(60, 60, 31, 42)}" fill="#ecd3ad"/>` +
    '<path d="M80 40q14 24 11 38-3 22-27 25 30-12 16-63z" fill="#d9b98c"/>' +
    e(48, 48, 6, 11, '#fbf0dc', ' transform="rotate(-18 48 48)"'),
  /* Çapa: tahta sap, demir ağız. */
  'ciftlik-capa':
    e(38, 110, 26, 5, '#8b5e3c') +
    '<path d="M96 10 44 90" stroke="#b07f4a" stroke-width="9" stroke-linecap="round"/><path d="M93 16 50 82" stroke="#cf9e66" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M40 82l12 8-2 6-30 12q-10-10 2-20z" fill="#7f8f98"/><path d="M22 104l26-10" stroke="#5f6d75" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M40 82l14 10" stroke="#5f6d75" stroke-width="6" stroke-linecap="round"/>',
  /* Sulama kabı (emzikli kova), süzgecinden damlalar. */
  'ciftlik-kova':
    '<path d="M36 50q0-26 18-26t18 26" fill="none" stroke="#4a8499" stroke-width="7"/>' +
    '<path d="M76 66 100 38" stroke="#5f9fb5" stroke-width="9" stroke-linecap="round"/><path d="M95 30l14 9-6 7-13-7z" fill="#4a8499"/>' +
    '<path d="M28 48h52l-5 56H33z" fill="#5f9fb5"/><path d="M30 64h48" stroke="#8cc3d4" stroke-width="5"/>' +
    '<path d="M110 52q3 5 0 8-3-3 0-8zM102 58q3 5 0 8-3-3 0-8zM112 66q3 5 0 8-3-3 0-8z" fill="#6bbfc8"/>',
  /* Tavuk suluğu: çan biçimli kap ve altında su tablası. */
  'ciftlik-suluk':
    '<path d="M52 24q8-13 16 0" stroke="#8f9da5" stroke-width="5" fill="none"/>' +
    '<path d="M36 94V50q0-26 24-26t24 26v44z" fill="#dfe6e9"/><path d="M38 94V62h44v32z" fill="#7cc4d0"/>' +
    '<path d="M46 44v44" stroke="#f7fbfc" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M16 92h88q-2 16-16 16H32q-14 0-16-16z" fill="#e0a13c"/>' + e(60, 93, 38, 4, '#7cc4d0'),
  /* Buğday tanesi (serpme ekim). */
  'ciftlik-tane':
    [[42, 62, -24], [70, 54, 18], [58, 84, -6]].map(([x, y, a]) =>
      `<g transform="rotate(${a} ${x} ${y})">${e(x, y, 12, 21, '#d9a95a')}<path d="M${x} ${y - 16}v32" stroke="#b0803c" stroke-width="3" stroke-linecap="round"/>${e(x - 4, y - 6, 3, 7, '#ecc783')}</g>`).join(''),
  /* Domates fidesi: saksıda tırtıklı yapraklı fide. */
  'ciftlik-fide':
    '<path d="M60 82V34" stroke="#5f9a45" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M59 66q-14-10-30-4 4-4 0-8 8-2 12 2 2-6 8-6 0 6 4 8 4 4 6 8zM61 52q12-12 30-8-4 4 0 8-8 1-12-2-1 6-7 6 0-6-4-7-5-2-7-7z" fill="#6aa84f"/>' +
    '<path d="M60 38q-10-8-8-18 8 4 8 18z" fill="#7fbf5a"/>' +
    '<path d="M36 78h48v8H36z" fill="#a06a45"/><path d="M40 86h40l-5 24H45z" fill="#8a5a3a"/>',
  /* Dede Ceviz: kalın gövde, geniş taç, yeşil kabuklu cevizler. */
  'ciftlik-dede':
    '<path d="M50 114V72q-10-6-22-4 12-7 22-1V56h18v11q10-6 22 1-12-2-22 4v42z" fill="#7a5638"/>' +
    '<path d="M56 110V76m8 36V80" stroke="#5e4029" stroke-width="3" stroke-linecap="round"/>' +
    e(60, 42, 50, 32, '#4f8f4a') + e(36, 50, 26, 18, '#468442') + e(84, 50, 26, 18, '#468442') + e(56, 30, 32, 20, '#63a656') + e(80, 34, 16, 12, '#63a656') +
    [[34, 40], [52, 50], [74, 44], [88, 56], [44, 26], [68, 24], [26, 56]].map(([x, y]) =>
      `<circle cx="${x}" cy="${y}" r="5.5" fill="#a9cf6e" stroke="#6f9a3f" stroke-width="2"/>`).join(''),
  /* Hasat sepeti. */
  'ciftlik-sepet':
    '<path d="M30 58q30-52 60 0" fill="none" stroke="#a8733a" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M20 62h80l-9 42H29z" fill="#c8924f"/><path d="M16 56h88v10H16z" fill="#a8733a"/>' +
    '<path d="M26 78h68M30 92h60M40 66l-4 38M60 66v38M80 66l4 38" stroke="#a8733a" stroke-width="3.5"/>',
  /* Folluk: saman yuva, içinde yumurtalar. */
  'ciftlik-folluk':
    `<path d="${yumurtaYolu(44, 60, 14, 19)}" fill="#ecd3ad"/><path d="${yumurtaYolu(74, 58, 14, 19)}" fill="#e3c49a"/><path d="${yumurtaYolu(60, 66, 14, 19)}" fill="#f2dfbf"/>` +
    '<path d="M12 70q48 42 96 0-2 38-48 38T12 70z" fill="#d6ad55"/>' + e(60, 71, 48, 11, '#c89a45', ' opacity=".55"') +
    '<path d="M20 80l14 6m8 10 12-4m10 6 10-8m10 6 14-10M26 92l10-2" stroke="#f0cd78" stroke-width="3.5" stroke-linecap="round"/>'
});

let kayitli = false;
export function ciftlikIkonlariniKaydet() {
  if (kayitli) return;
  Object.assign(EK_CIZIMLER, CIFTLIK_IKONLARI);
  kayitli = true;
}

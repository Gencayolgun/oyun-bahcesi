/* Güneş ile Rüzgâr için ek ikonlar — ad → 120×120 SVG gövdesi (bkz. ikon.js).
   Düz renkler: degrade kimliği yok, sayfada kaç kez çizilirse çizilsin
   kimlik çakışması olmaz. Pofuduk'un giysileri kadrodaki paltoyla aynı
   renkte ki çocuk panoda gördüğü giysiyi karakterin üstünde tanısın. */

/* Ayçiçeği başı: sarı taç yapraklar, kahverengi göbek, göbekte tohum benekleri. */
const aycicegiBasi = (cx, cy, r) => {
  let s = '';
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * 360;
    s += `<ellipse cx="${cx}" cy="${cy - r * .78}" rx="${r * .2}" ry="${r * .42}" fill="${i % 2 ? '#f6c338' : '#eeb12a'}" transform="rotate(${a} ${cx} ${cy})"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * .5}" fill="#7a4a24"/><circle cx="${cx}" cy="${cy}" r="${r * .36}" fill="#5e3719"/>`;
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2;
    s += `<circle cx="${(cx + Math.cos(a) * r * .24).toFixed(1)}" cy="${(cy + Math.sin(a) * r * .24).toFixed(1)}" r="${(r * .05).toFixed(1)}" fill="#a07040"/>`;
  }
  return s;
};

export default {
  /* Palto: Pofuduk'un hardal rengi kalın paltosu. */
  'gunes-palto': '<path d="M40 22 16 46l8 48h14l4-40z" fill="#c47824"/><path d="M80 22l24 24-8 48H82l-4-40z" fill="#c47824"/>' +
    '<path d="M40 20h40l8 90H32z" fill="#e39a37"/><path d="M44 20l16 28 16-28" fill="#b86d1f"/>' +
    '<path d="M60 48v60" stroke="#a8621a" stroke-width="3"/><g fill="#6e4a2c"><circle cx="67" cy="60" r="4"/><circle cx="67" cy="76" r="4"/><circle cx="67" cy="92" r="4"/></g>' +
    '<path d="M38 84h14M68 84h14" stroke="#a8621a" stroke-width="3" stroke-linecap="round"/><path d="M18 92h18M84 92h18" stroke="#8c5a34" stroke-width="7" stroke-linecap="round"/>',
  /* Atkı: kırmızı, beyaz çizgili, iki ucu püsküllü. */
  'gunes-atki': '<path d="M20 34q40 24 80 0l-2 18q-38 22-76 0z" fill="#d9483c"/>' +
    '<path d="M34 42l-3 14M50 48l-2 14M68 48l1 14M85 42l2 14" stroke="#fff1e2" stroke-width="5"/>' +
    '<path d="M66 50l12 52H60l-4-50z" fill="#e3584a"/><path d="M62 66l14 2M64 82l14 2" stroke="#fff1e2" stroke-width="5"/>' +
    '<path d="M61 102l-1 10M66 102v10M71 102l1 10M76 102l2 10" stroke="#bf3b33" stroke-width="3" stroke-linecap="round"/>',
  /* Şapka: ponponlu yün bere. */
  'gunes-sapka': '<path d="M24 80q0-52 36-52t36 52z" fill="#4f86b8"/><path d="M40 40q4 20 2 38M60 30v48M80 40q-4 20-2 38" stroke="#6d9fcc" stroke-width="4" fill="none"/>' +
    '<rect x="18" y="74" width="84" height="20" rx="9" fill="#3a6c9b"/><path d="M28 78v12M40 78v12M52 78v12M64 78v12M76 78v12M88 78v12" stroke="#2f5a82" stroke-width="3"/>' +
    '<circle cx="60" cy="26" r="12" fill="#f2efe4"/><circle cx="56" cy="22" r="4" fill="white"/>',
  /* Eldiven: bir çift yün eldiven. */
  'gunes-eldiven': '<path d="M18 96V56q0-20 18-20t18 20v40z" fill="#5f9c5f"/><path d="M20 66q-12-4-12 8t14 10" fill="#5f9c5f"/>' +
    '<rect x="16" y="88" width="40" height="16" rx="5" fill="#f1e6c8"/><path d="M24 90v12M32 90v12M40 90v12M48 90v12" stroke="#d8c8a2" stroke-width="3"/>' +
    '<path d="M66 96V56q0-20 18-20t18 20v40z" fill="#6fae6c"/><path d="M100 66q12-4 12 8t-14 10" fill="#6fae6c"/>' +
    '<rect x="64" y="88" width="40" height="16" rx="5" fill="#f1e6c8"/><path d="M72 90v12M80 90v12M88 90v12M96 90v12" stroke="#d8c8a2" stroke-width="3"/>' +
    '<path d="M28 52q8-6 16 0M76 52q8-6 16 0" stroke="#8cc488" stroke-width="3" fill="none" stroke-linecap="round"/>',
  /* Battaniye: katlanmış ekose battaniye. */
  'gunes-battaniye': '<rect x="14" y="30" width="92" height="64" rx="10" fill="#9e5a8e"/><rect x="14" y="30" width="92" height="20" rx="8" fill="#b36fa2"/>' +
    '<path d="M36 30v64M60 30v64M84 30v64" stroke="#e6c55c" stroke-width="5" opacity=".8"/><path d="M14 62h92M14 80h92" stroke="#e6c55c" stroke-width="4" opacity=".7"/>' +
    '<path d="M18 94v10M28 94v10M38 94v10M48 94v10M58 94v10M68 94v10M78 94v10M88 94v10M98 94v10" stroke="#9e5a8e" stroke-width="3" stroke-linecap="round"/>',
  /* Bal: bezle bağlanmış bir kavanoz bal. */
  'gunes-bal': '<path d="M30 40h60l4 60q0 10-10 10H36q-10 0-10-10z" fill="#f1ad2f"/><path d="M36 50h48l2 48H34z" fill="#f7c64f" opacity=".7"/>' +
    '<path d="M24 30q36-12 72 0l-4 12q-32-8-64 0z" fill="#e0dccc"/><path d="M26 40q34-8 68 0" stroke="#c9483a" stroke-width="5" fill="none"/>' +
    '<rect x="42" y="62" width="36" height="24" rx="5" fill="#fff7e4"/><path d="M52 70q8 10 16 0" stroke="#c98f2e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M86 44q6 8 0 16" stroke="#e39a1f" stroke-width="5" stroke-linecap="round" fill="none"/>',
  /* Çeşme: taş duvar, lüle, yalak ve akan su. */
  'gunes-cesme': '<path d="M20 100V38q40-30 80 0v62z" fill="#b9b3a3"/><path d="M28 100V42q32-22 64 0v58z" fill="#cfc9b8"/>' +
    '<path d="M28 58h64M28 78h64M48 42v16M72 42v16M40 58v20M60 58v20M80 58v20" stroke="#a8a291" stroke-width="3"/>' +
    '<rect x="54" y="60" width="12" height="7" rx="2" fill="#8e8a7e"/><path d="M60 67q0 14 0 24" stroke="#6bbfc8" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M14 88h92v14q0 8-8 8H22q-8 0-8-8z" fill="#9f9989"/><path d="M20 90h80v6H20z" fill="#6bbfc8"/>',
  /* Taş köprü: kemerli, altından dere geçer. */
  'gunes-kopru': '<path d="M6 92q28 10 54 6t54 6v12H6z" fill="#6bbfc8"/>' +
    '<path d="M6 52h108v20q-16 0-22 24H28q-6-24-22-24z" fill="#b5ad9a"/><path d="M28 96q6-30 32-30t32 30" fill="#7fa9b3"/>' +
    '<path d="M6 52h108" stroke="#9c9481" stroke-width="6"/><path d="M20 60v10M40 58v8M80 58v8M100 60v10M60 56v8" stroke="#9c9481" stroke-width="3"/>' +
    '<path d="M10 44h100" stroke="#cfc7b2" stroke-width="5" stroke-linecap="round"/><path d="M14 44v8M36 44v8M60 44v8M84 44v8M106 44v8" stroke="#cfc7b2" stroke-width="4"/>',
  /* Yel değirmeni: taş gövde, sivri çatı, dört kanat. */
  'gunes-degirmen': '<path d="M44 110l6-58h20l6 58z" fill="#efe5d0"/><path d="M50 52h20l-10-16z" fill="#b5573f"/><rect x="54" y="88" width="12" height="22" rx="5" fill="#8e6344"/>' +
    '<g transform="rotate(20 60 46)"><path d="M60 46 56 6h8z" fill="#c9a877"/><path d="M60 46 100 42v8z" fill="#c9a877"/><path d="M60 46 64 86h-8z" fill="#c9a877"/><path d="M60 46 20 50v-8z" fill="#c9a877"/>' +
    '<path d="M57 12h6M57 22h6M57 32h6M94 43v6M84 43v6M74 43v6M57 80h6M57 70h6M57 60h6M26 43v6M36 43v6M46 43v6" stroke="#8e6d45" stroke-width="2"/></g>' +
    '<circle cx="60" cy="46" r="5" fill="#6e4a2c"/>',
  /* Ayçiçeği: uzun sap, iri yapraklar, sarı taç yapraklı baş. */
  'gunes-aycicegi': '<path d="M60 112V60" stroke="#5c8f45" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M58 92q-30 4-38-16 26-8 38 16M62 80q30-6 38 12-26 8-38-12" fill="#6fa655"/>' + aycicegiBasi(60, 40, 30),
  /* Ninenin kulübesi: taş duvar, ahşap çatı, kapı, bacadan duman. */
  'gunes-kulube': '<path d="M78 22q10-8 6-16M86 26q12-8 8-18" stroke="#dfe3e0" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<rect x="74" y="26" width="12" height="22" fill="#8e6344"/><path d="M20 62h80v46H20z" fill="#d9cfb8"/>' +
    '<path d="M20 76h80M20 92h80M40 62v14M72 62v14M30 76v16M56 76v16M86 76v16" stroke="#bfb49b" stroke-width="3"/>' +
    '<path d="M10 64 60 26l50 38z" fill="#a8583f"/><path d="M10 64 60 26l50 38" stroke="#8a4532" stroke-width="5" fill="none" stroke-linejoin="round"/>' +
    '<rect x="50" y="80" width="20" height="28" rx="9" fill="#8e6344"/><rect x="28" y="80" width="14" height="12" rx="2" fill="#f3d27a"/><rect x="80" y="80" width="14" height="12" rx="2" fill="#f3d27a"/>'
};

/* Yalancı Çoban için ek ikonlar — ad → 120×120 SVG gövdesi (bkz. ikon.js).
   Mevcut çizimlerle karşılanamayanlar: fener (yanık/sönük), çan, kaval,
   köylülerin yaylada düşürdüğü tencere-tava-kaşık, ağıl, köy evi,
   kelebek, bazlama ve süt güğümü.

   Ortak defterde karşılığı olup GERÇEK hâline benzemeyenler de burada:
     coban-kuzu        ortak 'kuzu'/'koyun' yalnız yün içinde bir yüz; bu
                       yandan görülen bir kuzu: kıvırcık yün gövde, koyu
                       uzun yüz, yana sarkan kulak, ince koyu bacaklar.
     coban-atesbocegi  ateşböceği ortak defterde yok ('isik' bir güneş):
                       turuncu boyun kalkanı, koyu kanat, ışıyan karın.
     coban-diken       dikenli çalı ('kozalak' bir çam kozalağı): dikenli
                       dallar ve böğürtlenli yaprak kümesi. */

const fenerGovde = (yanik) => `
  ${yanik ? '<circle cx="60" cy="62" r="50" fill="#ffd76e" opacity=".2"/><circle cx="60" cy="62" r="34" fill="#ffd76e" opacity=".25"/>' : ''}
  <path d="M46 20q14-16 28 0" stroke="#5d5448" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M38 30h44l-6 11H44z" fill="#6d6356"/>
  <rect x="43" y="40" width="34" height="47" rx="13" fill="${yanik ? '#fff1b8' : '#aeb9c6'}" stroke="#7d6f58" stroke-width="3"/>
  ${yanik
    ? '<path d="M60 50q11 14 0 28q-11-14 0-28z" fill="#f29b38"/><path d="M60 60q5 7 0 14q-5-7 0-14z" fill="#fff6c2"/>'
    : '<path d="M60 72v-9" stroke="#4a4038" stroke-width="3" stroke-linecap="round"/><path d="M50 50q4-4 8-3" stroke="#dfe6ee" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>'}
  <path d="M43 60h34M51 40v47M69 40v47" stroke="#7d6f58" stroke-width="2.2" opacity=".65"/>
  <path d="M35 87h50l-4 14H39z" fill="#6d6356"/>
  <rect x="32" y="99" width="56" height="9" rx="3" fill="#51483e"/>`;

export default {

  'coban-kuzu': `
    <g transform="translate(60 70) scale(1.1) translate(-60 -70)">
    <ellipse cx="58" cy="106" rx="38" ry="5" fill="#8a8f7a" opacity=".18"/>
    <g stroke="#3b3531" stroke-width="6.5" stroke-linecap="round">
      <path d="M36 80v22M48 82v21M72 82v21M83 80v22"/></g>
    <g fill="#1f1b19"><rect x="32.5" y="100" width="7" height="5" rx="2"/><rect x="44.5" y="100" width="7" height="5" rx="2"/>
      <rect x="68.5" y="100" width="7" height="5" rx="2"/><rect x="79.5" y="100" width="7" height="5" rx="2"/></g>
    <g fill="#f6f1e5" stroke="#d9cfba" stroke-width="2">
      <circle cx="24" cy="62" r="7"/>
      <circle cx="34" cy="54" r="13"/><circle cx="50" cy="48" r="14"/><circle cx="66" cy="50" r="13"/>
      <circle cx="30" cy="72" r="12"/><circle cx="46" cy="76" r="13"/><circle cx="64" cy="76" r="13"/><circle cx="76" cy="66" r="12"/></g>
    <ellipse cx="52" cy="63" rx="26" ry="16" fill="#f6f1e5"/>
    <g stroke="#d9cfba" stroke-width="2.2" fill="none" stroke-linecap="round">
      <path d="M38 60q5-6 10 0M56 58q5-6 10 0M46 70q5-6 10 0"/></g>
    <path d="M76 48q4-12 16-12q14 0 17 13q2 10-6 14q-8 3-15-2q-9-5-12-13z" fill="#4a423d"/>
    <ellipse cx="79" cy="52" rx="10" ry="4.2" transform="rotate(28 79 52)" fill="#3b3531"/>
    <ellipse cx="80" cy="52" rx="6" ry="2.2" transform="rotate(28 80 52)" fill="#e7a9a4"/>
    <g fill="#f6f1e5" stroke="#d9cfba" stroke-width="1.6"><circle cx="86" cy="36" r="5.5"/><circle cx="94" cy="34" r="5"/></g>
    <circle cx="96" cy="46" r="3.4" fill="#fbf6ea"/><circle cx="96.8" cy="46.4" r="2" fill="#141110"/>
    <path d="M106 54q-1 3-4 3" stroke="#1a1614" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M99 60q3 2 6 0" stroke="#1a1614" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>`,

  'coban-atesbocegi': `
    <circle cx="60" cy="80" r="36" fill="#fff4a3" opacity=".28"/>
    <circle cx="60" cy="80" r="23" fill="#fff08a" opacity=".45"/>
    <g stroke="#3a302a" stroke-width="2.6" stroke-linecap="round" fill="none">
      <path d="M53 58l-12-4M52 66l-13 2M67 58l12-4M68 66l13 2"/>
      <path d="M56 30q-6-12-15-14M64 30q6-12 15-14"/></g>
    <ellipse cx="60" cy="82" rx="12" ry="17" fill="#f3f07a"/>
    <path d="M49 76h22M49 84h22M51 92h18" stroke="#c9c24a" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="60" cy="82" rx="7" ry="11" fill="#fffbd0" opacity=".85"/>
    <path d="M60 46Q42 54 44 80Q52 76 60 52z" fill="#4a3f36"/>
    <path d="M60 46Q78 54 76 80Q68 76 60 52z" fill="#4a3f36"/>
    <path d="M58 50l-10 26M62 50l10 26" stroke="#f0c44a" stroke-width="1.6" opacity=".6"/>
    <ellipse cx="40" cy="58" rx="12" ry="6" transform="rotate(-25 40 58)" fill="#e2ecf4" opacity=".75"/>
    <ellipse cx="80" cy="58" rx="12" ry="6" transform="rotate(25 80 58)" fill="#e2ecf4" opacity=".75"/>
    <ellipse cx="60" cy="42" rx="11" ry="8" fill="#e98a4a"/>
    <ellipse cx="60" cy="42" rx="4.5" ry="4" fill="#3a302a"/>
    <circle cx="60" cy="33" r="6" fill="#3a302a"/>`,

  'coban-diken': `
    <ellipse cx="60" cy="104" rx="46" ry="6" fill="#7d8a5f" opacity=".22"/>
    <g fill="#5d8a4c"><circle cx="34" cy="80" r="20"/><circle cx="60" cy="70" r="24"/><circle cx="86" cy="80" r="20"/><rect x="18" y="80" width="84" height="22" rx="10"/></g>
    <g fill="#74a05c"><circle cx="46" cy="66" r="10"/><circle cx="74" cy="62" r="9"/><circle cx="30" cy="84" r="7"/></g>
    <g stroke="#7a4e2c" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M22 100Q24 58 60 40"/><path d="M98 100Q98 62 70 44"/><path d="M60 102Q58 76 44 60"/></g>
    <g fill="#7a4e2c">
      <path d="M27 76l-9-3 8-4z"/><path d="M36 58l-6-8 9 1z"/><path d="M50 46l-2-9 7 5z"/>
      <path d="M95 80l9-3-8-5z"/><path d="M90 60l7-7-9 0z"/><path d="M78 48l3-9-8 5z"/>
      <path d="M55 82l-9 1 6-7z"/><path d="M49 67l-8-3 8-3z"/></g>
    <g fill="#7b2e4a"><circle cx="70" cy="84" r="4"/><circle cx="76" cy="88" r="3.6"/><circle cx="40" cy="92" r="3.6"/></g>`,
  'coban-fener': fenerGovde(true),
  'coban-fener-sonuk': fenerGovde(false),

  'coban-can': `
    <circle cx="60" cy="15" r="7" fill="none" stroke="#7a5b33" stroke-width="4"/>
    <path d="M60 21v6" stroke="#7a5b33" stroke-width="6"/>
    <path d="M60 26c-20 0-28 18-28 36v16l-9 12h74l-9-12V62c0-18-8-36-28-36z" fill="#d9a441"/>
    <path d="M41 62c0-14 6-25 15-29" stroke="#f3d27a" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M23 90h74" stroke="#b07d2a" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="99" r="8" fill="#8a6424"/>
    <path d="M98 44q10 8 8 20M22 44q-10 8-8 20" stroke="#e7b958" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>`,

  'coban-kaval': `
    <g transform="rotate(-38 60 60)">
      <rect x="52" y="6" width="16" height="108" rx="7" fill="#c89458"/>
      <rect x="52" y="6" width="16" height="15" rx="5" fill="#8a5f33"/>
      <path d="M56 24v84" stroke="#e5bd84" stroke-width="3" opacity=".6"/>
      <g fill="#553820"><circle cx="60" cy="42" r="3.4"/><circle cx="60" cy="54" r="3.4"/><circle cx="60" cy="66" r="3.4"/><circle cx="60" cy="78" r="3.4"/><circle cx="60" cy="90" r="3.4"/></g>
      <rect x="50" y="102" width="20" height="7" rx="2" fill="#8a5f33"/>
    </g>`,

  'coban-tencere': `
    <path d="M22 50h76v33q0 21-20 21H42q-20 0-20-21z" fill="#8f9aa5"/>
    <path d="M22 50h76v8H22z" fill="#6f7a86"/>
    <path d="M13 58h11M96 58h11" stroke="#5d6772" stroke-width="7" stroke-linecap="round"/>
    <path d="M17 47q43-24 86 0z" fill="#aab4be"/>
    <circle cx="60" cy="32" r="6" fill="#5d6772"/>
    <path d="M31 68q2 18 16 25" stroke="#c7cfd6" stroke-width="4" fill="none" stroke-linecap="round" opacity=".75"/>`,

  'coban-tava': `
    <path d="M82 54l30-18" stroke="#8a5f33" stroke-width="11" stroke-linecap="round"/>
    <ellipse cx="50" cy="67" rx="39" ry="31" fill="#454c56"/>
    <ellipse cx="50" cy="63" rx="32" ry="24" fill="#6a7380"/>
    <path d="M80 56l9-5" stroke="#454c56" stroke-width="12"/>
    <path d="M33 56q7-9 18-10" stroke="#9ea7b1" stroke-width="4" fill="none" stroke-linecap="round"/>`,

  'coban-kasik': `
    <g transform="rotate(35 60 60)">
      <ellipse cx="60" cy="30" rx="17" ry="23" fill="#cf9c5f"/>
      <ellipse cx="60" cy="31" rx="11" ry="16" fill="#a8763f"/>
      <rect x="55" y="50" width="10" height="64" rx="5" fill="#cf9c5f"/>
      <path d="M58 60v46" stroke="#e7bf87" stroke-width="2.5" stroke-linecap="round"/>
    </g>`,

  'coban-agil': `
    <path d="M6 100h108" stroke="#8fae6a" stroke-width="8" stroke-linecap="round"/>
    <path d="M64 42l24-17 24 17v28H64z" fill="#c29460"/>
    <path d="M60 44l28-21 28 21" stroke="#8a5a36" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="80" y="52" width="14" height="18" fill="#6e4a2a"/>
    <ellipse cx="44" cy="68" rx="17" ry="12" fill="#f5efe2"/>
    <circle cx="36" cy="62" r="6" fill="#f5efe2"/><circle cx="52" cy="61" r="6" fill="#f5efe2"/>
    <ellipse cx="28" cy="66" rx="6" ry="8" fill="#3b3531"/>
    <g fill="#b58853">
      <rect x="8" y="58" width="7" height="42" rx="2"/><rect x="30" y="58" width="7" height="42" rx="2"/>
      <rect x="52" y="58" width="7" height="42" rx="2"/><rect x="74" y="58" width="7" height="42" rx="2"/>
      <rect x="98" y="58" width="7" height="42" rx="2"/></g>
    <g fill="#d2a86e"><rect x="6" y="66" width="102" height="6" rx="2"/><rect x="6" y="84" width="102" height="6" rx="2"/></g>
    <path d="M59 68l15 20M74 68L59 88" stroke="#9c7447" stroke-width="3.4" stroke-linecap="round"/>`,

  'coban-ev': `
    <circle cx="45" cy="75" r="17" fill="#ffd36b" opacity=".22"/>
    <rect x="74" y="24" width="11" height="22" fill="#9a8a78"/>
    <path d="M20 58L60 23l40 35z" fill="#c06a50"/>
    <rect x="27" y="56" width="66" height="50" fill="#f1e4c8"/>
    <path d="M14 61L60 19l46 42" stroke="#8e4536" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="35" y="66" width="20" height="18" rx="2" fill="#ffd36b" stroke="#8a6a3a" stroke-width="3"/>
    <path d="M45 66v18M35 75h20" stroke="#8a6a3a" stroke-width="2"/>
    <rect x="64" y="72" width="19" height="34" rx="2" fill="#8a5a36"/>
    <circle cx="79" cy="90" r="2" fill="#e0b454"/>
    <path d="M22 106h76" stroke="#b9a684" stroke-width="4" stroke-linecap="round"/>`,

  'coban-kelebek': `
    <path d="M60 44Q34 10 18 26Q6 42 36 58Q14 66 20 84Q32 98 58 64z" fill="#f0a35c"/>
    <path d="M60 44Q86 10 102 26Q114 42 84 58Q106 66 100 84Q88 98 62 64z" fill="#f0a35c"/>
    <g fill="#fbe3b8"><circle cx="34" cy="34" r="7"/><circle cx="86" cy="34" r="7"/><circle cx="32" cy="76" r="5"/><circle cx="88" cy="76" r="5"/></g>
    <g fill="#6b4a2c"><circle cx="46" cy="46" r="3.4"/><circle cx="74" cy="46" r="3.4"/></g>
    <rect x="56" y="36" width="8" height="46" rx="4" fill="#4a3b33"/>
    <path d="M58 38q-6-15-15-20M62 38q6-15 15-20" stroke="#4a3b33" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="43" cy="18" r="3" fill="#4a3b33"/><circle cx="77" cy="18" r="3" fill="#4a3b33"/>`,

  'coban-ekmek': `
    <ellipse cx="60" cy="68" rx="47" ry="30" fill="#cf9a55"/>
    <ellipse cx="60" cy="63" rx="45" ry="26" fill="#f0c98a"/>
    <g fill="#c98e4a"><ellipse cx="38" cy="58" rx="7" ry="4"/><ellipse cx="64" cy="51" rx="6" ry="3.4"/>
      <ellipse cx="80" cy="66" rx="7" ry="4"/><ellipse cx="52" cy="72" rx="6" ry="3.6"/><ellipse cx="28" cy="70" rx="4" ry="2.6"/></g>
    <path d="M30 52q12-10 30-10" stroke="#f8dfb0" stroke-width="4" fill="none" stroke-linecap="round"/>`,

  'coban-sut': `
    <path d="M36 42q-17 4-15 22" stroke="#8e9aa5" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M45 18h30v10l9 10v60q0 10-10 10H46q-10 0-10-10V38l9-10z" fill="#c9d2d9"/>
    <rect x="41" y="11" width="38" height="10" rx="4" fill="#98a4ae"/>
    <path d="M36 54h48M36 88h48" stroke="#a6b1ba" stroke-width="5"/>
    <path d="M60 62q9 11 0 19q-9-8 0-19z" fill="#ffffff"/>
    <path d="M43 40q2-5 6-7" stroke="#eef2f5" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
};

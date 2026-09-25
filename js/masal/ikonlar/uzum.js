/* Tilki ile Üzümler için ek ikonlar — ad → 120×120 SVG gövdesi (bkz. ikon.js).
   Aynı ad iki masalda olmasın diye hepsi 'uzum-' ile başlıyor. */

const tane = (x, y, r, a, b) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${a}"/>` +
  `<circle cx="${(x - r * .34).toFixed(1)}" cy="${(y - r * .36).toFixed(1)}" r="${(r * .3).toFixed(1)}" fill="${b}" opacity=".8"/>`;

/* Asma yaprağı: beş dilimli, dişli kenar, damarlar. (cx, cy) merkez, o ölçek. */
function yaprak(cx, cy, o, renk = '#79ad52', damar = '#5a8a3a', aci = 0) {
  return `<g transform="translate(${cx} ${cy}) rotate(${aci}) scale(${o})">
    <path d="M0-30C-6-38-18-38-21-29C-30-32-38-24-34-16C-42-12-40 0-31 0C-32 8-22 13-15 7C-12 14-4 16 0 10C4 16 12 14 15 7C22 13 32 8 31 0C40 0 42-12 34-16C38-24 30-32 21-29C18-38 6-38 0-30Z" fill="${renk}"/>
    <path d="M0 10V-26M0-2L-22-18M0-2L22-18M0 4L-24 0M0 4L24 0" stroke="${damar}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
}

/* Salkım: yukarıdan aşağı daralan tane sıraları, sap ve bir yaprak. */
function salkim(a, b, koyu) {
  const siralar = [[5, 48], [4, 61], [4, 73], [3, 85], [2, 96], [1, 106]];
  let t = '';
  siralar.forEach(([n, y], k) => {
    for (let i = 0; i < n; i++) {
      const x = 60 + (i - (n - 1) / 2) * 15 + (k % 2 ? 0 : 0);
      t += tane(x, y, 9, k % 2 ? koyu : a, b);
    }
  });
  return `<path d="M60 42q-3-16 9-28" stroke="#6f5132" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    yaprak(82, 24, .62, '#79ad52', '#5a8a3a', 20) + t;
}

export default {
  'uzum-salkim': salkim('#7b4f9d', '#c4a3e0', '#6a3f8b'),
  'uzum-yesil': salkim('#a9cf6a', '#e6f5b8', '#96c05a'),
  'uzum-yaprak': yaprak(60, 64, 1.45) + '<path d="M60 78q4 18-6 32" stroke="#6f8a40" stroke-width="5" fill="none" stroke-linecap="round"/>',

  'uzum-sandik': `
    <path d="M16 44L60 30L104 44L60 58Z" fill="#e2bd87"/>
    <path d="M16 44L60 58V106L16 92Z" fill="#c99459"/>
    <path d="M60 58L104 44V92L60 106Z" fill="#ad7a43"/>
    <path d="M16 60L60 74M16 76L60 90M60 74L104 60M60 90L104 76" stroke="#8f6232" stroke-width="3"/>
    <path d="M22 50L54 60M66 60L98 50" stroke="#f1d6a8" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 60q8 4 16 5" stroke="#6f4a24" stroke-width="5" stroke-linecap="round"/>
    <path d="M74 64q8-2 16-6" stroke="#5f3f1f" stroke-width="5" stroke-linecap="round"/>`,

  'uzum-merdiven': `
    <g transform="rotate(8 60 60)">
      <path d="M38 8L30 112M82 8L90 112" stroke="#9c6b3e" stroke-width="9" stroke-linecap="round"/>
      <path d="M38 8L30 112" stroke="#c29160" stroke-width="3" stroke-linecap="round"/>
      ${[20, 36, 52, 68, 84, 100].map((y, i) => `<path d="M${37 - i * 1.3} ${y}H${83 + i * 1.3}" stroke="#b5824f" stroke-width="7" stroke-linecap="round"/>`).join('')}
    </g>`,

  'uzum-sepet': `
    <path d="M26 58q34-44 68 0" stroke="#a7773f" stroke-width="7" fill="none" stroke-linecap="round"/>
    ${tane(44, 56, 9, '#7b4f9d', '#c4a3e0')}${tane(60, 50, 9, '#6a3f8b', '#c4a3e0')}${tane(76, 56, 9, '#7b4f9d', '#c4a3e0')}
    ${tane(52, 62, 9, '#6a3f8b', '#c4a3e0')}${tane(68, 62, 9, '#7b4f9d', '#c4a3e0')}
    ${yaprak(88, 50, .42, '#79ad52', '#5a8a3a', 30)}
    <path d="M16 64H104L94 104Q60 112 26 104Z" fill="#d6a563"/>
    <path d="M18 74H102M21 86H99M24 98H96" stroke="#b07d3f" stroke-width="3"/>
    <path d="M36 66l4 38M52 66l2 42M68 66l-2 42M84 66l-4 38" stroke="#b98848" stroke-width="3" opacity=".8"/>
    <path d="M14 64H106" stroke="#c28c4c" stroke-width="7" stroke-linecap="round"/>`,

  'uzum-asma': `
    <path d="M22 110V36M98 110V36" stroke="#8e6344" stroke-width="8" stroke-linecap="round"/>
    <path d="M12 34H108" stroke="#a5794d" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="60" cy="28" rx="50" ry="14" fill="#6ea24c"/>
    <ellipse cx="36" cy="24" rx="22" ry="12" fill="#86b95e"/><ellipse cx="80" cy="22" rx="24" ry="12" fill="#7cb055"/>
    <path d="M30 38q6 18 0 34M88 38q-4 16 2 28" stroke="#6f9a45" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M60 36v8" stroke="#6f5132" stroke-width="4"/>
    ${[[52, 50], [60, 50], [68, 50], [56, 59], [64, 59], [60, 68]].map(([x, y]) => tane(x, y, 5.5, '#7b4f9d', '#c4a3e0')).join('')}
    <path d="M22 110h14M84 110h14" stroke="#b09a7a" stroke-width="5" stroke-linecap="round"/>`,

  'uzum-ceviz': `
    <path d="M60 18C34 18 20 40 22 64C24 92 42 106 60 106C78 106 96 92 98 64C100 40 86 18 60 18Z" fill="#c29560"/>
    <path d="M60 18C48 30 48 94 60 106C72 94 72 30 60 18Z" fill="#a67a47" opacity=".5"/>
    <path d="M60 20V104" stroke="#7d5731" stroke-width="3.5"/>
    <path d="M36 40q10 6 8 16M34 66q12 2 12 14M84 40q-10 6-8 16M86 66q-12 2-12 14M44 90q6-6 12-2M76 90q-6-6-12-2" stroke="#8a6238" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="44" cy="36" rx="6" ry="9" fill="#e0bb88" opacity=".6"/>`,

  'uzum-kovan': `
    <path d="M18 100C14 56 34 18 60 18C86 18 106 56 102 100Z" fill="#e2b85e"/>
    <path d="M24 88H96M22 74H98M26 60H94M32 46H88M42 32H78" stroke="#c28f35" stroke-width="5" stroke-linecap="round"/>
    <path d="M60 18C74 18 86 30 92 46" stroke="#f3d68d" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M48 100a12 12 0 0 1 24 0Z" fill="#5a3f22"/>
    <path d="M10 102H110" stroke="#9c7a4e" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="94" cy="30" rx="7" ry="5" fill="#f2b92f"/><path d="M92 26v8M96 26v8" stroke="#2e241d" stroke-width="2"/>
    <ellipse cx="94" cy="24" rx="5" ry="3" fill="#e6f3f8" opacity=".9"/>`,

  'uzum-cicek': `
    <path d="M60 64Q56 90 62 112" stroke="#5f9a4d" stroke-width="6" fill="none" stroke-linecap="round"/>
    <path d="M60 96q-20-12-28 2 16 10 28-2z" fill="#79ad52"/>
    ${[0, 72, 144, 216, 288].map(a => `<ellipse cx="60" cy="30" rx="13" ry="20" fill="#f3a6c0" transform="rotate(${a} 60 50)"/>`).join('')}
    ${[36, 108, 180, 252, 324].map(a => `<ellipse cx="60" cy="36" rx="7" ry="11" fill="#fbd3e0" transform="rotate(${a} 60 50)"/>`).join('')}
    <circle cx="60" cy="50" r="12" fill="#f2c14a"/><circle cx="56" cy="46" r="4" fill="#fbe29a"/>`,

  /* Dikenli çalı (böğürtlen): kubbe biçimli koyu yeşil çalı, her yanından
     dışarı bakan sivri kahverengi dikenler, aralarda birkaç böğürtlen. 'yol'
     görevinde "değme" denen şey bu; eskiden yerinde kozalak çiziliyordu. */
  'uzum-diken': (() => {
    let d = '';
    for (let i = 0; i < 15; i++) {
      const a = Math.PI * (1.02 + i / 14 * .96), cx = 60 + Math.cos(a) * 44, cy = 84 + Math.sin(a) * 40;
      const ux = 60 + Math.cos(a) * 58, uy = 84 + Math.sin(a) * 53, nx = -Math.sin(a) * 5, ny = Math.cos(a) * 5;
      d += `M${(cx + nx).toFixed(1)} ${(cy + ny).toFixed(1)}L${ux.toFixed(1)} ${uy.toFixed(1)}L${(cx - nx).toFixed(1)} ${(cy - ny).toFixed(1)}Z`;
    }
    return `<path d="${d}" fill="#8a5a33"/>
      <path d="M12 96C8 62 30 36 60 36C90 36 112 62 108 96Z" fill="#4f7d3a"/>
      <path d="M22 92C20 70 38 50 60 50C82 50 100 70 98 92" fill="#5f9146"/>
      <path d="M30 70l-9-5M44 56l-6-8M76 56l6-8M90 70l9-5M60 60v-9M38 84l-9 1M82 84l9 1" stroke="#8a5a33" stroke-width="3.2" stroke-linecap="round"/>
      <circle cx="46" cy="76" r="6" fill="#3a2440"/><circle cx="44" cy="74" r="2" fill="#8d6aa0"/>
      <circle cx="72" cy="70" r="5.5" fill="#3a2440"/><circle cx="70" cy="68" r="1.8" fill="#8d6aa0"/>
      <circle cx="62" cy="86" r="5" fill="#3a2440"/><circle cx="60" cy="84" r="1.7" fill="#8d6aa0"/>
      <path d="M8 98H112" stroke="#8a7a5a" stroke-width="5" stroke-linecap="round"/>`;
  })(),

  'uzum-kuyu': `
    <path d="M30 46V80M90 46V80" stroke="#8e6344" stroke-width="6" stroke-linecap="round"/>
    <path d="M18 48L60 20L102 48Z" fill="#b8573f"/><path d="M18 48L60 20L102 48" stroke="#8e3f2e" stroke-width="5" fill="none" stroke-linejoin="round"/>
    <path d="M30 58H90" stroke="#a5794d" stroke-width="5"/>
    <path d="M60 58V70" stroke="#6f5132" stroke-width="2.5"/>
    <path d="M52 70h16l-2 12h-12z" fill="#9aa4ab"/>
    <path d="M20 80H100V104Q60 114 20 104Z" fill="#b3b0a2"/>
    <ellipse cx="60" cy="80" rx="40" ry="8" fill="#cfcbbd"/><ellipse cx="60" cy="80" rx="30" ry="5" fill="#4f6a72"/>
    <path d="M26 90h18M52 92h16M76 90h18M36 100h16M62 102h16" stroke="#8f8b7e" stroke-width="3" stroke-linecap="round"/>`
};

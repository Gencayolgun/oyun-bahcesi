/* Hayalet el — işin ilk ~2 saniyesinde NE yapılacağını gösterir.

   Okuma bilmeyen 3-6 yaş için yönerge yazı değil, bir el hareketidir:
     'dokun'      hedefe iki kez dokunur (refleks, silkele)
     'basili'     hedefe basar ve basılı tutar, halka dolar, bırakır (doldur)
     'bekle-bas'  hedefin üstünde bekler, sonra basar (zaman: "doğru anı bekle")
     'kaydir'     basılıyken sağa sola kayar (yakala: sepeti kaydır)
     'sec-dokun'  önce birinciye, sonra ikinciye dokunur (besle: yem → tavuk)
     'tara'       alanın üstünde dolaşıp arar (gizli: bak, bul)
   El yarı saydam ve tıklanamaz (pointer-events:none): çocuk el oynarken de
   başlayabilir. İlk dokunuşta ya da tuşta, yoksa `sure` sonunda kaybolur.
   Oyunun durumunu DEĞİŞTİRMEZ; yalnız gösterir.

   Azaltılmış hareket: el hareket etmez; hedefin üstünde DURAĞAN bir ok ve
   hareketin küçük işareti (halka, iki yönlü ok) görünür.

   Kullanım: const h = hayaletGoster(katman, {tip:'basili', hedef: el});
             h.kaldir();   // erken kaldırmak için */

export const HAYALET_TIPLERI = Object.freeze(['dokun', 'basili', 'bekle-bas', 'kaydir', 'sec-dokun', 'tara']);

/* İşaret parmağı yukarıda bir el; parmak ucu (38,6)'da. Düz renk, yazısız. */
const EL_SVG = '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M38 6c-5 0-9 4-9 9v48l-6-6c-5-5-13-2-13 5 0 2 1 4 2 6l18 24c6 8 12 12 22 12h10c13 0 22-9 22-22V58c0-5-4-9-8-9-3 0-5 1-6 3 0-5-4-8-8-8-3 0-5 1-6 3-1-4-4-7-8-7-2 0-3 0-5 1V15c0-5-4-9-9-9z" fill="#fffaf0" stroke="#5b4a3a" stroke-width="5" stroke-linejoin="round"/>' +
  '<path d="M33 14q5-3 10 0" fill="none" stroke="#e8cdb0" stroke-width="3" stroke-linecap="round"/></svg>';
const OK_SVG = '<svg viewBox="0 0 60 80" aria-hidden="true"><path d="M20 4h20v38h16L30 76 4 42h16z" fill="#f4c542" stroke="#8a5a1c" stroke-width="4" stroke-linejoin="round"/></svg>';
const IKI_YON_SVG = '<svg viewBox="0 0 120 50" aria-hidden="true"><path d="M4 25 28 6v12h64V6l24 19-24 19V32H28v12z" fill="#f4c542" stroke="#8a5a1c" stroke-width="4" stroke-linejoin="round"/></svg>';

const bul = (kok, h) => typeof h === 'function' ? h() : typeof h === 'string' ? kok.querySelector(h) : h;

/* Hedefin kok'a göre merkez noktası (px). Hedef yoksa kok'un ortası. */
function nokta(kok, el) {
  const k = kok.getBoundingClientRect();
  if (!el || !el.isConnected) return { x: k.width / 2, y: k.height / 2, g: 0 };
  const r = el.getBoundingClientRect();
  return { x: r.left - k.left + r.width / 2, y: r.top - k.top + r.height / 2, g: r.width };
}

export function hayaletGoster(kok, { tip = 'dokun', hedef = null, hedef2 = null, sure = 2000, azHareket = null } = {}) {
  if (!HAYALET_TIPLERI.includes(tip)) tip = 'dokun';
  const durgun = azHareket ?? (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const doc = kok.ownerDocument;
  const h = doc.createElement('div');
  h.className = `hayalet hayalet-${tip}${durgun ? ' durgun' : ''}`;
  h.dataset.tip = tip;
  h.setAttribute('aria-hidden', 'true');
  const kol = doc.createElement('div'); kol.className = 'hayalet-kol';
  const el = doc.createElement('div'); el.className = 'hayalet-el'; el.innerHTML = EL_SVG;
  const dalga = doc.createElement('i'); dalga.className = 'hayalet-dalga';
  kol.append(dalga, el);
  h.append(kol);
  if (tip === 'basili') { const halka = doc.createElement('i'); halka.className = 'hayalet-halka'; kol.prepend(halka); }
  if (durgun) {
    const ok = doc.createElement('div'); ok.className = 'hayalet-ok'; ok.innerHTML = OK_SVG; h.append(ok);
    if (tip === 'kaydir') { const iki = doc.createElement('div'); iki.className = 'hayalet-iki-yon'; iki.innerHTML = IKI_YON_SVG; h.append(iki); }
    if (tip === 'sec-dokun') { const ok2 = doc.createElement('div'); ok2.className = 'hayalet-ok ikinci'; ok2.innerHTML = OK_SVG; h.append(ok2); }
  }
  kok.append(h);

  const yerlestir = () => {
    const p = nokta(kok, bul(kok, hedef));
    h.style.left = p.x.toFixed(1) + 'px'; h.style.top = p.y.toFixed(1) + 'px';
    // İkinci hedef (sec-dokun) ya da tarama/kaydırma genişliği: CSS değişkenleri.
    const q = hedef2 ? nokta(kok, bul(kok, hedef2)) : null;
    h.style.setProperty('--dx', (q ? q.x - p.x : 0).toFixed(1) + 'px');
    h.style.setProperty('--dy', (q ? q.y - p.y : 0).toFixed(1) + 'px');
    const gen = Math.max(60, Math.min(260, (p.g || 240) * .32));
    h.style.setProperty('--kay', gen.toFixed(0) + 'px');
    h.style.setProperty('--tara', Math.max(40, Math.min(200, (p.g || 240) * .22)).toFixed(0) + 'px');
  };
  yerlestir();

  let bitti = false, zaman = 0, cerceve = 0;
  const pencere = doc.defaultView;
  const kaldir = () => {
    if (bitti) return;
    bitti = true;
    clearTimeout(zaman); pencere?.cancelAnimationFrame?.(cerceve);
    kok.removeEventListener('pointerdown', kaldir, true);
    kok.removeEventListener('keydown', kaldir, true);
    pencere?.removeEventListener('resize', yerlestir);
    if (durgun) { h.remove(); return; }
    h.classList.add('gidiyor');
    setTimeout(() => h.remove(), 260);
  };
  kok.addEventListener('pointerdown', kaldir, true);
  kok.addEventListener('keydown', kaldir, true);
  pencere?.addEventListener('resize', yerlestir);
  // Yerleşim bir kare sonra (yazı tipi, görseller) yeniden ölçülür.
  cerceve = pencere?.requestAnimationFrame?.(yerlestir) || 0;
  zaman = setTimeout(kaldir, Math.max(300, sure));
  return { el: h, kaldir, get bitti() { return bitti; } };
}

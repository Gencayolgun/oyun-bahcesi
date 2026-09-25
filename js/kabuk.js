import {ikon,simge} from './ikon.js';
import {ses} from './ses.js';

/* Ortak oyun kabuğu.

   Her oyun kendi ritmini kurar; kabuk yalnızca çerçeveyi tutar:
   üst bar, seviye şeridi, ipucu balonu, kutlama ve "yeniden / sonraki".

   Tasarım dili Umut Adası'ndan aynen gelir — sayfa kökü .gorev-sayfasi
   sınıfını taşıdığı için css/stil.css'teki kart, hedef ve renk kuralları
   hiç kopyalanmadan geçerli olur.

   KURALLAR (Umut Adası ile aynı)
   - Saat yok, puan yok, kaybetme yok. Yanlış seçim yalnızca açıklama verir.
   - Ders içeriği yok; oyunun kendisi var.
   - Her oyun dokunarak da, sürükleyerek de oynanır.
*/

export const yap = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
export const karistir = list => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if (a.length > 1 && a.every((x, i) => x === list[i])) a.push(a.shift()); return a; };
export const kart = (sekil, ad, cls) => {
  const b = yap('button', 'nesne-karti' + (cls ? ' ' + cls : ''));
  b.type = 'button'; b.setAttribute('aria-label', ad || sekil);
  const r = yap('span', 'nesne-resmi'); r.innerHTML = ikon(sekil);
  b.append(r); if (ad) b.append(yap('span', 'nesne-adi', ad));
  return b;
};
export const titret = el => { el.classList.remove('yanlis-sallan'); void el.offsetWidth; el.classList.add('yanlis-sallan'); };

const ILERLEME = 'oyun-bahcesi-ilerleme';
export function ilerlemeOku() { try { return JSON.parse(localStorage.getItem(ILERLEME)) || {}; } catch { return {}; } }
export function ilerlemeYaz(kod, seviye) {
  try { const d = ilerlemeOku(); d[kod] = Math.max(d[kod] || 0, seviye + 1); localStorage.setItem(ILERLEME, JSON.stringify(d)); } catch {}
}

function dugme(metin, fn, cls = 'primary', isaret = 'arrow') {
  const b = yap('button', `btn ${cls}`); b.type = 'button';
  b.setAttribute('aria-label', metin); b.append(yap('span', '', metin));
  if (isaret) b.insertAdjacentHTML('beforeend', simge(isaret));
  b.onclick = e => { ses.start(); fn?.(e); };
  return b;
}

/* Kabuk oyunu çalıştırır; oyun bittiğinde kutlama ve sonraki seviye buradan gelir. */
export function oyunuBaslat(kok, oyun, seviyeNo, bahceyeDon) {
  const seviye = oyun.seviyeler[seviyeNo];
  let iptal = new AbortController();
  let bitti = false;

  const sayfa = yap('main', 'sayfa gorev-sayfasi bahce-oyun');
  sayfa.dataset.region = oyun.bolge || 'orman';
  sayfa.style.setProperty('--accent', oyun.renk);
  sayfa.style.setProperty('--oyun-canli', oyun.renk);

  const ust = yap('header', 'ust-bar');
  const marka = dugme('Oyun Bahçesi', bahceyeDon, 'marka', 'leaf');
  marka.append(yap('span', 'marka-alt', 'ANAOKULU OYUNLARI'));
  ust.append(marka);
  const eylem = yap('div', 'ust-eylemler');
  const sesDugme = dugme(ses.label(), () => {
    const acik = ses.toggle();
    sesDugme.querySelector('span').textContent = acik ? 'Sesleri kapat' : 'Sesleri aç';
  }, 'icon-btn', 'sound');
  eylem.append(sesDugme, dugme('Tam ekran', () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }, 'icon-btn', 'expand'));
  ust.append(eylem); sayfa.append(ust);

  const dekor = yap('div', 'gorev-dekor'); dekor.setAttribute('aria-hidden', 'true');
  dekor.innerHTML = '<i class="dekor-bulut bulut-1"></i><i class="dekor-bulut bulut-2"></i><i class="dekor-yaprak yaprak-1"></i><i class="dekor-yaprak yaprak-2"></i><i class="dekor-cicek cicek-1"></i><i class="dekor-cicek cicek-2"></i>';
  sayfa.append(dekor);

  const tepe = yap('div', 'gorev-ust');
  tepe.append(dugme('Bahçeye dön', bahceyeDon, 'text-btn', 'back'));
  const seviyeSerit = yap('div', 'seviye-serit');
  oyun.seviyeler.forEach((sv, i) => {
    const s = yap('button', 'seviye-nokta' + (i === seviyeNo ? ' simdi' : '') + (i < seviyeNo ? ' gecildi' : ''));
    s.type = 'button'; s.textContent = String(i + 1);
    s.setAttribute('aria-label', `${i + 1}. seviye · ${sv.ad}`);
    s.onclick = () => { if (i !== seviyeNo) { temizle(); oyunuBaslat(kok, oyun, i, bahceyeDon); } };
    seviyeSerit.append(s);
  });
  tepe.append(seviyeSerit);
  sayfa.append(tepe);

  const baslik = yap('div', 'gorev-baslik');
  const ustSatir = yap('div', 'gorev-baslik-ust');
  ustSatir.append(yap('span', 'gorev-tur', oyun.ad.toLocaleUpperCase('tr')),
                  yap('span', 'seviye-etiketi', `${seviyeNo + 1}. seviye · ${seviye.ad}`));
  baslik.append(ustSatir, yap('h1', '', seviye.baslik), yap('p', '', seviye.yonerge));
  sayfa.append(baslik);

  const sahne = yap('section', 'gorev-sahnesi');
  const govde = yap('div', `oyun oyun-${oyun.kod}`);
  const parilti = yap('div', 'oyun-parilti'); parilti.setAttribute('aria-hidden', 'true');
  parilti.innerHTML = '<i></i><i></i><i></i><i></i><i></i><i></i>';
  const alan = yap('div', 'oyun-alani');
  const mesaj = yap('div', 'oyun-mesaj');
  mesaj.setAttribute('role', 'status'); mesaj.setAttribute('aria-live', 'polite');
  govde.append(parilti, alan, mesaj); sahne.append(govde); sayfa.append(sahne);

  const alt = yap('footer', 'gorev-alt');
  const durum = yap('div', 'gorev-durumu'); durum.innerHTML = simge('leaf');
  const durumYazi = yap('span', '', 'Acelemiz yok. İstediğin kadar deneyebilirsin.');
  durum.append(durumYazi);
  const dugmeler = yap('div', 'alt-dugmeler');
  const yeniden = dugme('Yeniden', () => { temizle(); oyunuBaslat(kok, oyun, seviyeNo, bahceyeDon); }, 'text-btn', 'reset');
  const sonraki = dugme(seviyeNo < oyun.seviyeler.length - 1 ? 'Sonraki seviye' : 'Bahçeye dön', () => {
    temizle();
    if (seviyeNo < oyun.seviyeler.length - 1) oyunuBaslat(kok, oyun, seviyeNo + 1, bahceyeDon);
    else bahceyeDon();
  });
  sonraki.disabled = true;
  dugmeler.append(yeniden, sonraki); alt.append(durum, dugmeler);
  sayfa.append(alt);

  kok.replaceChildren(sayfa);
  ses.setRegion(oyun.bolge || 'orman');

  function ipucu(metin) { mesaj.textContent = metin; mesaj.classList.remove('basarili'); }
  function basar(metin) {
    if (bitti) return;
    bitti = true;
    ses.celebrate();
    mesaj.textContent = metin || seviye.cozum;
    mesaj.classList.add('basarili');
    govde.classList.add('oyun-bitti');
    durumYazi.textContent = 'Harikaydı! Bu seviyeyi bitirdin.';
    alt.classList.add('tamamlandi');
    sonraki.disabled = false;
    ilerlemeYaz(oyun.kod, seviyeNo);
  }
  function adim() {
    if (bitti) return;
    ses.correct();
    govde.classList.remove('adim-sevinci'); void govde.offsetWidth; govde.classList.add('adim-sevinci');
  }
  function temizle() { iptal.abort(); }

  oyun.kur({
    veri: seviye, alan, kok: govde, signal: iptal.signal,
    ipucu, basar, adim, seviyeNo,
    ses, ikon, yap, karistir, kart, titret,
    bekle: (fn, ms) => { const t = setTimeout(() => { if (!iptal.signal.aborted) fn(); }, ms); iptal.signal.addEventListener('abort', () => clearTimeout(t)); }
  });

  return { temizle };
}

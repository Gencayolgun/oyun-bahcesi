import {ikon} from '../ikon.js';
import {ses} from '../ses.js';
import {kadroPaneli} from './kadro.js';

import paylas from '../oyunlar/paylas.js';
import kayip  from '../oyunlar/kayip.js';
import gizli  from '../oyunlar/gizli.js';
import oruntu from '../oyunlar/oruntu.js';
import yol    from '../oyunlar/yol.js';
import yapboz from '../oyunlar/yapboz.js';
import dizi   from '../oyunlar/dizi.js';
import fark   from '../oyunlar/fark.js';
import zaman  from '../oyunlar/zaman.js';
import terazi from '../oyunlar/terazi.js';
import yakala from '../oyunlar/yakala.js';
import takip  from '../oyunlar/takip.js';
import refleks from '../oyunlar/refleks.js';
import takimyildiz from '../oyunlar/takimyildiz.js';
import cift   from '../oyunlar/cift.js';
import isabet from '../oyunlar/isabet.js';

/* Masal görev adaptörü.

   Klasik yedi tür (say, ayır, eşleştir, sırala, besle, tımarla, sev)
   Umut Adası'nın kanıtlanmış motorunda çalışır — tek satırı kopyalanmadı.
   Diğer on tür Oyun Bahçesi'nden aynen gelir; burada yalnızca iki farklı
   bağlam nesnesi birbirine çevriliyor.

   Böylece bir masal 17 farklı görev türü kullanabiliyor — 40 dakika boyunca
   hiçbir çocuk aynı işi iki kez yapmıyor. */

const yap = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const karistir = list => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if (a.length > 1 && a.every((x, i) => x === list[i])) a.push(a.shift()); return a; };
const kart = (sekil, ad, cls) => {
  const b = yap('button', 'nesne-karti' + (cls ? ' ' + cls : '')); b.type = 'button';
  b.setAttribute('aria-label', ad || sekil);
  const r = yap('span', 'nesne-resmi'); r.innerHTML = ikon(sekil);
  b.append(r); if (ad) b.append(yap('span', 'nesne-adi', ad));
  return b;
};
const titret = el => { el.classList.remove('yanlis-sallan'); void el.offsetWidth; el.classList.add('yanlis-sallan'); };

/* Bahçe oyunları "adim()=geri bildirim, basar()=bitti" diliyle konuşur.
   gorev.js ise "finishOne()=bir adım ilerle" diliyle. Çeviri burada.
   Dışa açık: Çiftçi Fare işleri (js/ciftlik/isler.js) aynı mekanikleri
   bu köprüyle kurar. */
export function koprule(mekanik) {
  return {
    adimli: false,
    adet: () => 1,
    kur(g) {
      let bitti = false;
      mekanik.kur({
        veri: g.veri, alan: g.alan, kok: g.kok, signal: g.signal, seviyeNo: 0,
        ipucu: g.ipucu,
        adim() {                                   // yalnızca sevinç: sayaç ilerlemez
          if (bitti) return;
          ses.correct();
          g.kok.classList.remove('adim-sevinci'); void g.kok.offsetWidth; g.kok.classList.add('adim-sevinci');
        },
        basar(mesaj) {                             // asıl tamamlanma
          if (bitti) return; bitti = true;
          g.adim('masal-gorevi', null);
          if (mesaj) g.ipucu(mesaj);
        },
        surukle: g.surukle,
        ses, ikon, yap, karistir, kart, titret,
        bekle: (fn, ms) => { const t = setTimeout(() => { if (!g.signal.aborted) fn(); }, ms); g.signal.addEventListener('abort', () => clearTimeout(t)); }
      });
    }
  };
}

export const MASAL_TURLERI = Object.fromEntries(
  [paylas, kayip, gizli, oruntu, yol, yapboz, dizi, fark, zaman, terazi,
   yakala, takip, refleks, takimyildiz, cift, isabet].map(m => [m.kod, koprule(m)])
);

/* Masal karakterleri ada dostlarının yerine geçer. */
export function masalDostu(bolum) {
  return kadroPaneli(bolum.hayvan, bolum.sozler);
}

export const MASAL_EKLERI = { turler: MASAL_TURLERI, dost: masalDostu };

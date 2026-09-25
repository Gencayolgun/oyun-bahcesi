/* SİLKELE + YAKALA — Dede Ceviz hasadı.

   İki adım, tek oyun:
   1) Ağacın gövdesine DOKUN (v.dokunus kez, varsayılan 3). Her dokunuşta
      ağaç sallanır, dallardan birkaç ceviz düşer. Gerçekte de olgun ceviz
      dal silkelenerek (ya da sırıkla) toplanır; ağaca arı konmaz.
   2) Sonra YAKALA: düşen cevizleri sepetle tut (js/oyunlar/yakala.js aynen,
      aynı ctx ile kurulur; bitişi o bildirir).

   Sözleşme js/oyunlar/*.js ile aynı. Okunan veri: dokunus, agac + yakala'nın
   bütün anahtarları (hedef, hiz, sikayet, iyi, kotu). */

import yakala from '../../oyunlar/yakala.js';

export default {
  kod: 'silkele', ad: 'Silkele ve Yakala', ozet: 'Ağacı silkele, düşen cevizleri tut.',
  ikon: 'ciftlik-ceviz', renk: '#8a6a3f', bolge: 'ciftlik', beceri: 'El-göz koordinasyonu · sıra',
  seviyeler: [
    { ...yakala.seviyeler[0], ad: 'Kolay', baslik: 'Dede Ceviz silkelenmeyi bekliyor.',
      yonerge: 'Gövdeye üç kez dokun, sonra düşen cevizleri sepetle tut.', cozum: 'Cevizler sepette; Dede Ceviz rahatladı.',
      dokunus: 3, agac: 'ciftlik-dede', hedef: 4, hiz: .14, sikayet: 1400, iyi: ['ciftlik-ceviz'], kotu: [] }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const gerek = Math.max(1, Math.round(Number(v.dokunus) || 3));
    ctx.ipucu('Ağacın gövdesine dokun; cevizler düşsün.');
    const sahne = yap('div', 'silkele-sahne');
    const agac = yap('button', 'silkele-agac'); agac.type = 'button';
    agac.setAttribute('aria-label', 'Dede Ceviz ağacının gövdesi: silkele');
    agac.innerHTML = ctx.ikon(v.agac || 'ciftlik-dede');
    const yer = yap('div', 'silkele-yer'); yer.setAttribute('aria-hidden', 'true');
    sahne.append(agac, yer);
    ctx.alan.append(sahne);

    let n = 0, gecti = false;
    const dus = () => {
      for (let i = 0; i < 2; i++) {
        const c = yap('i', 'silkele-ceviz'); c.innerHTML = ctx.ikon((v.iyi && v.iyi[0]) || 'ciftlik-ceviz');
        c.style.left = (26 + Math.random() * 48).toFixed(1) + '%';
        c.style.setProperty('--r', (Math.random() * 60 - 30).toFixed(0) + 'deg');
        yer.append(c);
      }
    };
    agac.addEventListener('click', () => {
      if (gecti || n >= gerek) return;
      n++;
      sahne.dataset.dokunus = String(n);
      agac.classList.remove('sallan'); void agac.offsetWidth; agac.classList.add('sallan');
      ctx.ses?.carpma?.(.7);
      dus();
      if (n < gerek) { ctx.ipucu(n === 1 ? 'Sallandı! Bir daha dokun.' : 'Az kaldı, bir daha!'); return; }
      gecti = true;
      ctx.ipucu('Cevizler düşüyor! Sepeti kaydırıp tut.');
      ctx.bekle(() => {
        sahne.remove();
        yakala.kur(ctx);                                  // aynı ctx: basar() yakala'dan gelir
      }, 650);
    }, { signal: ctx.signal });
  }
};

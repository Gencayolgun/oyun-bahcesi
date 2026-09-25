/* DOLDUR — dürtü denetimi ve zamanlama (bekle, sonra bırak).

   Yapı: basılı tutunca kap dolar. Su işaretli BANDIN içine gelince
   bırakırsan kap tam kararında dolmuş olur ve su bitkiye (ya da tavuğa)
   gider. Asıl beceri basmak değil, BEKLEYİP doğru anda BIRAKMAK: refleks
   oyununun "dokunmamayı bilmek"i gibi, bu da "elini çekmeyi bilmek".

   CEZA YOK, SAAT YOK, PUAN YOK:
   - Bant altında bırakırsan su yerinde kalır; yeniden basıp sürdürürsün.
   - Bandı geçip bırakırsan fazlası dökülür, kap biraz boşalır.
   - Kap taşarsa su dökülür, kap boşalır ve yeniden dolar.
   Ekranda sayı yok; kaç kez kaldığını katman (isler.js) yazısız gösterir.

   Sözleşme js/oyunlar/*.js ile aynı: {kod, ad, seviyeler, kur(ctx)}.
   ctx: veri, alan, signal, ipucu, adim, basar, bekle, ikon, yap, ses.
   Okunan veri: bant (%), tekrar, hiz (%/sn), kap ('kova'|'suluk'),
   hedef (suyun gittiği şeyin ikonu). İsteğe bağlı: hedefAd, kapAd.

   Dokunmatik, fare ve klavye: pointer olayları (setPointerCapture ile;
   parmak düğmeden kaysa da bırakma kaçmaz) ve Boşluk/Enter basılı tutma.
   Testler için sahnede data-seviye / data-alt / data-ust / data-durum. */

const KAP_ADI = { kova: 'Sulama kabı', suluk: 'Suluk' };

/* Musluk ve el-pompası çizimi (düz renk, yazısız). */
const MUSLUK = '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M20 30h52q16 0 16 16v16H74V48q0-4-4-4H20z" fill="#8aa2ad"/>' +
  '<rect x="10" y="24" width="16" height="26" rx="5" fill="#6f8792"/><rect x="72" y="60" width="18" height="8" rx="3" fill="#6f8792"/>' +
  '<path d="M46 30V14" stroke="#6f8792" stroke-width="8" stroke-linecap="round"/><rect x="30" y="6" width="32" height="10" rx="5" fill="#d9714f"/></svg>';
const EL = '<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M60 16c-7 0-11 5-11 11v34l-6-6c-6-6-15-3-15 5 0 3 1 5 3 7l20 24c6 8 13 12 24 12h4c14 0 24-10 24-24V58c0-6-4-10-9-10-3 0-5 1-7 3 0-6-4-10-9-10-3 0-6 1-7 4-1-5-4-8-9-8-1 0-2 0-3 1V27c0-6-4-11-9-11z" fill="#fff6e3" stroke="#6b5a48" stroke-width="5" stroke-linejoin="round"/>' +
  '<path d="M60 86q8 8 18 0" fill="none" stroke="#d6b28a" stroke-width="4" stroke-linecap="round"/></svg>';

export default {
  kod: 'doldur', ad: 'Doldur', ozet: 'Basılı tut, kap dolsun; su işarete gelince bırak.',
  ikon: 'su', renk: '#5ea8b2', bolge: 'ciftlik', beceri: 'Dürtü denetimi · bekle ve bırak',
  seviyeler: [
    { ad: 'Kolay', baslik: 'Sulama kabı doluyor.', yonerge: 'Düğmeye basılı tut. Su sarı şeride gelince bırak.',
      cozum: 'Kap tam kararında doldu; su yerine ulaştı.', bant: 30, tekrar: 2, hiz: 18, kap: 'kova', hedef: 'ciftlik-filiz' },
    { ad: 'Orta', baslik: 'Şerit inceldi.', yonerge: 'Bu sefer şerit daha dar. Suyu gözünle takip et.',
      cozum: 'Dar şeride üç kez tutturdun.', bant: 18, tekrar: 3, hiz: 24, kap: 'kova', hedef: 'ciftlik-filiz' },
    { ad: 'Zor', baslik: 'Su hızlı akıyor.', yonerge: 'Su daha hızlı doluyor ve şerit çok dar. Acelemiz yok.',
      cozum: 'Hızlı suda bile tam kararında doldurdun.', bant: 12, tekrar: 4, hiz: 30, kap: 'kova', hedef: 'ciftlik-filiz' }
  ],
  kur(ctx) {
    const v = ctx.veri, yap = ctx.yap;
    const bant = Math.max(6, Math.min(60, Number(v.bant) || 30));
    const tekrar = Math.max(1, Math.round(Number(v.tekrar) || 2));
    const hiz = Math.max(4, Number(v.hiz) || 18);
    const kapTur = v.kap === 'suluk' ? 'suluk' : 'kova';
    const kapAd = v.kapAd || KAP_ADI[kapTur];
    const hedefAd = v.hedefAd || 'Bitki';

    ctx.ipucu(`Düğmeye basılı tut. Su sarı şeride gelince bırak; ${hedefAd.toLocaleLowerCase('tr')} suyunu alsın.`);

    const sahne = yap('div', 'doldur-sahne');
    sahne.dataset.kap = kapTur;
    const hedef = yap('div', 'doldur-hedef'); hedef.innerHTML = ctx.ikon(v.hedef || 'ciftlik-filiz');
    hedef.setAttribute('aria-hidden', 'true');
    const kapKutu = yap('div', 'doldur-kapkutu');
    const musluk = yap('div', 'doldur-musluk'); musluk.innerHTML = MUSLUK; musluk.setAttribute('aria-hidden', 'true');
    const akis = yap('i', 'doldur-akis'); akis.setAttribute('aria-hidden', 'true');
    const kap = yap('div', 'doldur-kap'); kap.setAttribute('role', 'img'); kap.setAttribute('aria-label', kapAd);
    const govde = yap('div', 'doldur-govde');
    const su = yap('i', 'doldur-su');
    const serit = yap('i', 'doldur-bant');
    const sacilan = yap('i', 'doldur-sacilan'); sacilan.setAttribute('aria-hidden', 'true');
    govde.append(su, serit);
    kap.append(govde, sacilan);
    kapKutu.append(musluk, akis, kap);
    const dugme = yap('button', 'doldur-dugme'); dugme.type = 'button';
    dugme.setAttribute('aria-label', `Basılı tut: ${kapAd.toLocaleLowerCase('tr')} dolsun`);
    dugme.innerHTML = EL;
    const tasma = yap('i', 'doldur-tasma'); tasma.setAttribute('aria-hidden', 'true');
    sahne.append(hedef, kapKutu, dugme, tasma);
    ctx.alan.append(sahne);

    /* Durum: 'bos' (bekliyor) · 'doluyor' (basılı) · 'dokuluyor' (taşma/fazla)
       · 'dogru' (su hedefe gidiyor) · 'bitti'. */
    let durum = 'bos', seviye = 0, dolum = 0, alt = 0, ust = 0, cerceve = 0, onceki = 0;
    let tutan = null, klavye = false, birakmaBekle = false;

    function bantKur() {
      // Bandın ortası %55–%72 arası; üstünde taşmadan önce pay kalır.
      const orta = 55 + Math.random() * 17;
      alt = Math.max(18, orta - bant / 2); ust = Math.min(92, alt + bant);
      alt = +(ust - bant).toFixed(1); ust = +ust.toFixed(1);
      serit.style.bottom = alt + '%'; serit.style.height = (ust - alt) + '%';
      sahne.dataset.alt = String(alt); sahne.dataset.ust = String(ust);
    }
    function ciz() {
      su.style.height = seviye.toFixed(2) + '%';
      const icinde = seviye >= alt && seviye <= ust;
      serit.classList.toggle('icinde', icinde);
      sahne.dataset.seviye = seviye.toFixed(1);
    }
    function durumYaz(d) { durum = d; sahne.dataset.durum = d; sahne.classList.toggle('akiyor', d === 'doluyor'); }
    bantKur(); durumYaz('bos'); ciz();

    function dongu(t) {
      if (ctx.signal.aborted) return;
      const dt = onceki ? Math.min(.1, (t - onceki) / 1000) : 0;
      onceki = t;
      if (durum === 'doluyor') {
        seviye = Math.min(100, seviye + hiz * dt);
        ciz();
        if (seviye >= 100) tas();
      }
      cerceve = requestAnimationFrame(dongu);
    }
    cerceve = requestAnimationFrame(dongu);
    ctx.signal.addEventListener('abort', () => cancelAnimationFrame(cerceve));

    /* Kap boşalır (yumuşak, CSS geçişiyle) ve yeniden doldurulabilir. */
    function bosalt(hedefSeviye, sure, sonra) {
      su.classList.add('iniyor');
      seviye = hedefSeviye; ciz();
      ctx.bekle(() => { su.classList.remove('iniyor'); sonra(); }, sure);
    }
    function tas() {
      durumYaz('dokuluyor');
      birakmaBekle = tutan !== null || klavye;          // hâlâ basılıysa önce bırakması beklenir
      sahne.classList.remove('tasti'); void sahne.offsetWidth; sahne.classList.add('tasti');
      ctx.ses?.carpma?.(.5);
      ctx.ipucu('Taştı! Su döküldü. Boşaltıp yeniden dolduralım.');
      ctx.bekle(() => bosalt(0, 520, () => { sahne.classList.remove('tasti'); durumYaz('bos'); }), 620);
    }
    function basla() {
      if (durum !== 'bos' || birakmaBekle) return;
      onceki = 0;
      durumYaz('doluyor');
    }
    function birak() {
      if (birakmaBekle && tutan === null && !klavye) { birakmaBekle = false; return; }
      if (durum !== 'doluyor') return;
      if (seviye < alt) {                                 // az: su yerinde kalır, yeniden basılır
        durumYaz('bos');
        ctx.ipucu('Biraz daha doldur. Su sarı şeride gelsin.');
        return;
      }
      if (seviye > ust) {                                 // fazla: fazlası dökülür
        durumYaz('dokuluyor');
        sahne.classList.remove('fazla'); void sahne.offsetWidth; sahne.classList.add('fazla');
        ctx.ipucu('Biraz fazla oldu, fazlasını döktük. Şeride gelince bırak.');
        ctx.bekle(() => bosalt(Math.max(0, alt - 14), 460, () => { sahne.classList.remove('fazla'); durumYaz('bos'); }), 380);
        return;
      }
      /* Tam kararında: su hedefe gider. */
      durumYaz('dogru');
      dolum++;
      sahne.classList.remove('dogru'); void sahne.offsetWidth; sahne.classList.add('dogru');
      hedef.classList.remove('icti'); void hedef.offsetWidth; hedef.classList.add('icti');
      ctx.adim();
      if (dolum >= tekrar) {
        ctx.bekle(() => { durumYaz('bitti'); ctx.basar(); }, 700);
        return;
      }
      ctx.bekle(() => bosalt(0, 420, () => {
        sahne.classList.remove('dogru'); hedef.classList.remove('icti');
        bantKur(); ciz(); durumYaz('bos');
        ctx.ipucu('Bir kez daha! Şerit yer değiştirdi.');
      }), 760);
    }

    /* Basılı tutma: sahnenin her yeri (akıllı tahtada büyük hedef) ve düğme. */
    const opt = { signal: ctx.signal };
    sahne.addEventListener('pointerdown', e => {
      if (e.button > 0 || tutan !== null) return;
      e.preventDefault();
      tutan = e.pointerId;
      try { sahne.setPointerCapture(e.pointerId); } catch {}
      dugme.classList.add('basili');
      basla();
    }, opt);
    const pointerBirak = e => {
      if (tutan === null || e.pointerId !== tutan) return;
      tutan = null;
      dugme.classList.remove('basili');
      try { if (sahne.hasPointerCapture(e.pointerId)) sahne.releasePointerCapture(e.pointerId); } catch {}
      birak();
    };
    sahne.addEventListener('pointerup', pointerBirak, opt);
    sahne.addEventListener('pointercancel', pointerBirak, opt);
    sahne.addEventListener('lostpointercapture', pointerBirak, opt);
    window.addEventListener('pointerup', pointerBirak, { capture: true, signal: ctx.signal });
    window.addEventListener('pointercancel', pointerBirak, { capture: true, signal: ctx.signal });
    /* Uzun basışta dokunmatik menü ve metin seçimi çıkmasın. */
    sahne.addEventListener('contextmenu', e => e.preventDefault(), opt);
    /* Klavye: Boşluk ya da Enter basılı tutulur. */
    dugme.addEventListener('keydown', e => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (e.repeat || klavye) return;
      klavye = true; dugme.classList.add('basili'); basla();
    }, opt);
    dugme.addEventListener('keyup', e => {
      if (e.key !== ' ' && e.key !== 'Enter') return;
      e.preventDefault();
      if (!klavye) return;
      klavye = false; dugme.classList.remove('basili'); birak();
    }, opt);
    /* Düğmenin tıklaması (klavye/pointer zaten işlendi) bir şey yapmaz. */
    dugme.addEventListener('click', e => e.preventDefault(), opt);
    /* Pencere odağı kaçarsa (sekme değişti) basılı sayılmaz. */
    const odakKacti = () => {
      if (tutan === null && !klavye) return;
      tutan = null; klavye = false; dugme.classList.remove('basili'); birak();
    };
    window.addEventListener('blur', odakKacti, opt);
    document.addEventListener('visibilitychange', () => { if (document.hidden) odakKacti(); }, opt);
  }
};

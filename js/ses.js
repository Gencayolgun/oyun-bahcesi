/*
 * Küçük Tohum — ses manzarası.
 *
 * Neden baştan yazıldı: eski sürüm 8 notalık sabit bir sinüs döngüsünü
 * sonsuza kadar tekrar ediyordu (~6 sn'de bir başa sarıyor) ve hayvan sesleri
 * düz osilatör bipleriydi. 40 dakikalık bir derste ikisi de çekilmez.
 *
 * Bu sürümün üç farkı var:
 *   1. Gerçek reverb — ucuz sentezi dinlenebilir kılan tek şey budur.
 *   2. Üretken müzik — cümleler kuruluyor, aralarda susuluyor, hiç birebir
 *      tekrar etmiyor. Arka planda 40 dakika çalabilir.
 *   3. Karakterli tınılar — hayvanlar için formant süzgeçli, perde kaydırmalı
 *      "yaratık sesi"; düz nota değil.
 *
 * Sınıf kuralı: müzik öğretmenin sesiyle yarışmaz. Seviye bilerek çok kısık
 * ve tiz bileşenler süzülmüş durumda.
 */

const Context = window.AudioContext || window.webkitAudioContext;

/* Gerçek saha kayıtları — 57 sn, dikişsiz döngü, konuşmanın altında kalacak
   seviyede. Sentezlenmiş rüzgâr yalnızca dosya yüklenemezse devreye giriyor. */
const ORTAM_DOSYA = {
  ciftlik: 'ses/ciftlik.mp3',
  orman:   'ses/orman.mp3',
  deniz:   'ses/deniz.mp3',
  dag:     'ses/dag.mp3'
};
const ortamTampon = new Map();
let ortamCalan = null, ortamKazanc2 = null, ortamBolge = null;

/* Her bölge kendi tonalitesinde: aynı motifler farklı renk alıyor. */
const BOLGELER = {
  ciftlik: { kok: 261.63, dizi: [0, 2, 4, 7, 9], ruzgar: .012, sure: 3200, kesim: 1400, renk: 'sicak' },
  orman:   { kok: 220.00, dizi: [0, 3, 5, 7, 10], ruzgar: .016, sure: 2600, kesim: 1100, renk: 'yaprak' },
  deniz:   { kok: 196.00, dizi: [0, 2, 5, 7, 9], ruzgar: .022, sure: 4200, kesim: 900,  renk: 'dalga' },
  dag:     { kok: 174.61, dizi: [0, 2, 3, 7, 9], ruzgar: .014, sure: 3600, kesim: 1600, renk: 'ruzgar' }
};

/* Hayvanlar: perde eğrisi + formant. Gerçek kayıt değil ama "bip" de değil. */
const SESLER = {
  inek:   { bas: 168, son: 112, sure: .95, formant: 520, doku: 'sawtooth', titre: 5,  gurultu: .10 },
  tavsan: { bas: 640, son: 780, sure: .16, formant: 1900, doku: 'triangle', titre: 0,  gurultu: .35, tekrar: 3 },
  fok:    { bas: 300, son: 240, sure: .55, formant: 780, doku: 'sawtooth', titre: 14, gurultu: .18, tekrar: 2 },
  kus:    { bas: 1500, son: 2300, sure: .13, formant: 3200, doku: 'sine',  titre: 22, gurultu: .06, tekrar: 4 },
  /* Masalların ve çiftliğin hayvanları. Eskiden bunların hepsi kuş sesine
     düşüyordu: 'dinle ve tekrarla' pedleri aynı sesi çalınca oyun bozuluyordu. */
  kedi:    { bas: 560, son: 380, sure: .55, formant: 1400, doku: 'sawtooth', titre: 6,  gurultu: .08 },
  kopek:   { bas: 330, son: 190, sure: .17, formant: 900,  doku: 'sawtooth', titre: 0,  gurultu: .3, tekrar: 2 },
  keci:    { bas: 390, son: 360, sure: .7,  formant: 1150, doku: 'sawtooth', titre: 11, gurultu: .12 },
  koyun:   { bas: 290, son: 270, sure: .85, formant: 900,  doku: 'sawtooth', titre: 7,  gurultu: .1 },
  tavuk:   { bas: 720, son: 520, sure: .12, formant: 1800, doku: 'square',   titre: 0,  gurultu: .25, tekrar: 3 },
  horoz:   { bas: 480, son: 900, sure: .9,  formant: 1600, doku: 'sawtooth', titre: 7,  gurultu: .1 },
  guvercin:{ bas: 240, son: 200, sure: .45, formant: 520,  doku: 'sine',     titre: 3,  gurultu: .05, tekrar: 2 },
  kurbaga: { bas: 180, son: 140, sure: .16, formant: 620,  doku: 'square',   titre: 30, gurultu: .2, tekrar: 2 },
  fare:    { bas: 2400, son: 3000, sure: .08, formant: 3500, doku: 'sine',   titre: 0,  gurultu: .05, tekrar: 3 },
  ayi:     { bas: 115, son: 90,  sure: .7,  formant: 360,  doku: 'sawtooth', titre: 18, gurultu: .25 },
  aslan:   { bas: 135, son: 80,  sure: 1.0, formant: 420,  doku: 'sawtooth', titre: 9,  gurultu: .3 },
  kartal:  { bas: 1800, son: 1200, sure: .45, formant: 2600, doku: 'sawtooth', titre: 20, gurultu: .15 },
  ari:     { bas: 220, son: 232, sure: .8,  formant: 700,  doku: 'sawtooth', titre: 40, gurultu: .1 },
  tilki:   { bas: 900, son: 600, sure: .22, formant: 1500, doku: 'sawtooth', titre: 0,  gurultu: .2, tekrar: 2 },
  kurt:    { bas: 350, son: 520, sure: 1.2, formant: 800,  doku: 'triangle', titre: 5,  gurultu: .05 },
  sincap:  { bas: 1800, son: 1500, sure: .07, formant: 2800, doku: 'square', titre: 0,  gurultu: .2, tekrar: 4 },
  leylek:  { bas: 250, son: 240, sure: .05, formant: 1200, doku: 'square',   titre: 0,  gurultu: .6, tekrar: 5 },
  ordek:   { bas: 420, son: 300, sure: .25, formant: 1100, doku: 'sawtooth', titre: 0,  gurultu: .25, tekrar: 2 },
  /* Sesi olmayan hayvanlar (kaplumbağa, salyangoz, karınca...): yumuşak bir "pıt". */
  sessiz:  { bas: 520, son: 640, sure: .14, formant: 1300, doku: 'sine',     titre: 0,  gurultu: .02 }
};
const SES_ESLERI = { kuzu: 'koyun', oglak: 'keci', civciv: 'tavuk', serce: 'kus', kirlangic: 'kus', kanarya: 'kus',
  kaplumbaga: 'sessiz', salyangoz: 'sessiz', karinca: 'sessiz', kirpi: 'sessiz', karinca3b: 'sessiz', dost: 'kus' };
/* 'keci-ak', 'coban-kuzu', 'kedi-tekir' gibi adlardan türü bulur. */
function sesBul(ad = '') {
  if (SESLER[ad]) return SESLER[ad];
  for (const parca of String(ad).split('-')) {
    if (SESLER[parca]) return SESLER[parca];
    if (SES_ESLERI[parca]) return SESLER[SES_ESLERI[parca]];
  }
  return SESLER.kus;
}

let ctx = null, master = null, muzikBus = null, ortamBus = null, efektBus = null;
let reverb = null, reverbSend = null, ruzgarKaynak = null, ruzgarSuzgec = null, ruzgarKazanc = null;
let zamanlayici = null, sonrakiOlay = 0, cumleKalan = 0, arayaKadar = 0, sonPerde = 0;
let akorZamani = 0;
let basladi = false, kisik = false, bolge = 'orman';

/* ——— Yardımcılar ——— */

function nota(derece, oktav = 0) {
  const b = BOLGELER[bolge] || BOLGELER.orman;
  const d = b.dizi[((derece % b.dizi.length) + b.dizi.length) % b.dizi.length];
  const atlama = Math.floor(derece / b.dizi.length) + oktav;
  return b.kok * Math.pow(2, (d + atlama * 12) / 12);
}

/* Reverb: üstel sönümlü gürültüden üretilmiş darbe yanıtı.
   Hazır dosya gerektirmiyor, ama sesi "bir yerde" gibi yapıyor. */
function reverbKur(saniye = 2.6, sonum = 2.4) {
  const n = Math.floor(ctx.sampleRate * saniye);
  const buf = ctx.createBuffer(2, n, ctx.sampleRate);
  for (let k = 0; k < 2; k++) {
    const d = buf.getChannelData(k);
    for (let i = 0; i < n; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, sonum);
    }
  }
  const c = ctx.createConvolver();
  c.buffer = buf;
  return c;
}

/* Tek ses: iki hafif akortsuz osilatör + süzgeç. Sinüsten çok daha sıcak. */
function calNota(frekans, { sure = .6, seviye = .05, doku = 'triangle', kesim = 1800,
                            cikis = muzikBus, gecikme = 0, islak = .35, kayma = 0 } = {}) {
  if (!ctx || !cikis) return;
  const t = ctx.currentTime + gecikme;
  const zarf = ctx.createGain();
  const suz = ctx.createBiquadFilter();
  suz.type = 'lowpass';
  suz.frequency.setValueAtTime(kesim, t);
  suz.Q.value = .7;

  [0, 1].forEach(i => {
    const o = ctx.createOscillator();
    o.type = doku;
    const akortsuz = frekans * (1 + (i ? .004 : -.004));
    o.frequency.setValueAtTime(akortsuz, t);
    if (kayma) o.frequency.exponentialRampToValueAtTime(Math.max(40, akortsuz * kayma), t + sure);
    o.connect(suz);
    o.start(t); o.stop(t + sure + .1);
  });

  // Yumuşak giriş/çıkış: tık sesi olmasın
  zarf.gain.setValueAtTime(.0001, t);
  zarf.gain.exponentialRampToValueAtTime(seviye, t + Math.min(.12, sure * .25));
  zarf.gain.exponentialRampToValueAtTime(.0001, t + sure);
  suz.connect(zarf);
  zarf.connect(cikis);
  if (reverbSend && islak) {
    const gonder = ctx.createGain();
    gonder.gain.value = islak * seviye;
    zarf.connect(gonder).connect(reverbSend);
  }
}

/* FM çan — "doğru cevap" için. Saf sinüsten çok daha tatmin edici. */
function calCan(frekans, { sure = 1.2, seviye = .09, gecikme = 0, cikis = efektBus } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + gecikme;
  const tasiyici = ctx.createOscillator(), modulator = ctx.createOscillator();
  const modKazanc = ctx.createGain(), zarf = ctx.createGain();
  tasiyici.frequency.setValueAtTime(frekans, t);
  modulator.frequency.setValueAtTime(frekans * 2.01, t);
  modKazanc.gain.setValueAtTime(frekans * 1.8, t);
  modKazanc.gain.exponentialRampToValueAtTime(1, t + sure * .5);
  modulator.connect(modKazanc).connect(tasiyici.frequency);
  zarf.gain.setValueAtTime(.0001, t);
  zarf.gain.exponentialRampToValueAtTime(seviye, t + .012);
  zarf.gain.exponentialRampToValueAtTime(.0001, t + sure);
  tasiyici.connect(zarf).connect(cikis);
  if (reverbSend) { const g = ctx.createGain(); g.gain.value = seviye * .5; zarf.connect(g).connect(reverbSend); }
  modulator.start(t); tasiyici.start(t);
  modulator.stop(t + sure + .05); tasiyici.stop(t + sure + .05);
}

/* Gürültü patlaması: hışırtı, nefes, su. Formant süzgeçle karaktere bürünüyor. */
function calGurultu({ sure = .2, seviye = .05, merkez = 1200, q = 1.2, gecikme = 0, cikis = efektBus } = {}) {
  if (!ctx) return;
  const t = ctx.currentTime + gecikme;
  const n = Math.floor(ctx.sampleRate * sure);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.setValueAtTime(merkez, t); bp.Q.value = q;
  const zarf = ctx.createGain();
  zarf.gain.setValueAtTime(.0001, t);
  zarf.gain.exponentialRampToValueAtTime(seviye, t + .015);
  zarf.gain.exponentialRampToValueAtTime(.0001, t + sure);
  src.connect(bp).connect(zarf).connect(cikis);
  if (reverbSend) { const g = ctx.createGain(); g.gain.value = seviye * .4; zarf.connect(g).connect(reverbSend); }
  src.start(t); src.stop(t + sure + .05);
}

/* ——— Ortam: rüzgâr/dalga dokusu ——— */
function ortamKur() {
  const n = ctx.sampleRate * 6;
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let onceki = 0;
  for (let i = 0; i < n; i++) { onceki = onceki * .992 + (Math.random() * 2 - 1) * .05; d[i] = onceki * 2.4; }
  ruzgarKaynak = ctx.createBufferSource();
  ruzgarKaynak.buffer = buf; ruzgarKaynak.loop = true;
  ruzgarSuzgec = ctx.createBiquadFilter(); ruzgarSuzgec.type = 'lowpass';
  ruzgarKazanc = ctx.createGain(); ruzgarKazanc.gain.value = .012;

  // Yavaş kabarma: rüzgâr/dalga sabit değil, nefes alıyor
  const lfo = ctx.createOscillator(), lfoKazanc = ctx.createGain();
  lfo.frequency.value = .07; lfoKazanc.gain.value = .006;
  lfo.connect(lfoKazanc).connect(ruzgarKazanc.gain);
  lfo.start();

  ruzgarKaynak.connect(ruzgarSuzgec).connect(ruzgarKazanc).connect(ortamBus);
  ruzgarKaynak.start();
}

/* ——— Üretken müzik ———
   Cümle kur, sonra sus. Bu "nefes" olmadan hiçbir arka plan müziği
   40 dakika dinlenmez. Notalar beşli diziden seçildiği için yanlış nota yok. */
/* Artık sürekli çalmıyor; bölüm geçişlerinde tek seferlik çağrılabilir. */
function muzikZamanla() {
  if (!ctx || !basladi) return;
  const simdi = ctx.currentTime;
  const b = BOLGELER[bolge] || BOLGELER.orman;

  if (!sonrakiOlay || sonrakiOlay < simdi - 1) sonrakiOlay = simdi + .2;

  while (sonrakiOlay < simdi + 2.5) {
    if (arayaKadar > 0) {                       // sessizlik
      arayaKadar -= 1;
      sonrakiOlay += .85;
    } else {
      if (cumleKalan <= 0) {                    // yeni cümle
        cumleKalan = 3 + Math.floor(Math.random() * 4);
        sonPerde = 2 + Math.floor(Math.random() * 3);
      }
      // Küçük adımlarla dolaş, ara sıra sıçra
      const adim = Math.random() < .75 ? (Math.random() < .5 ? -1 : 1) : (Math.random() < .5 ? -2 : 2);
      sonPerde = Math.max(0, Math.min(9, sonPerde + adim));
      calNota(nota(sonPerde), {
        sure: 1.1 + Math.random() * .7, seviye: .022 + Math.random() * .008,
        doku: 'triangle', kesim: b.kesim, gecikme: sonrakiOlay - simdi, islak: .5
      });
      cumleKalan -= 1;
      if (cumleKalan === 0) arayaKadar = 3 + Math.floor(Math.random() * 4);
      sonrakiOlay += .62 + Math.random() * .5;
    }
  }

  // Akor yastığı: 12-16 saniyede bir değişiyor, hep altta
  if (simdi > akorZamani) {
    const kok = Math.random() < .5 ? 0 : (Math.random() < .5 ? 2 : 4);
    [0, 2, 4].forEach((d, i) => {
      calNota(nota(kok + d, -1), {
        sure: 13, seviye: .013, doku: 'sine', kesim: 620,
        gecikme: i * .08, islak: .7
      });
    });
    akorZamani = simdi + 12 + Math.random() * 4;
  }

  zamanlayici = window.setTimeout(muzikZamanla, 900);
}

/* ——— Kurulum ——— */
function kur() {
  if (!Context) return false;
  try { ctx = new Context(); } catch { return false; }

  master = ctx.createGain();
  // Sınıfta konuşmanın üstüne çıkmasın diye genel seviye bilerek düşük
  master.gain.value = kisik ? 0 : .5;

  // Yumuşak sıkıştırıcı: ani tepe sesleri çocukları ürkütmesin
  const sinirla = ctx.createDynamicsCompressor();
  sinirla.threshold.value = -18; sinirla.ratio.value = 4;
  sinirla.attack.value = .006; sinirla.release.value = .25;

  reverb = reverbKur();
  reverbSend = ctx.createGain(); reverbSend.gain.value = 1;
  const reverbDon = ctx.createGain(); reverbDon.gain.value = .5;
  reverbSend.connect(reverb).connect(reverbDon).connect(master);

  muzikBus = ctx.createGain(); muzikBus.gain.value = .55;
  ortamBus = ctx.createGain(); ortamBus.gain.value = .9;
  efektBus = ctx.createGain(); efektBus.gain.value = .85;
  muzikBus.connect(master); ortamBus.connect(master); efektBus.connect(master);
  master.connect(sinirla).connect(ctx.destination);

  ortamKur();
  bolgeAyarla(bolge);
  return true;
}

function basla() {
  if (basladi && ctx) { ctx.resume?.().catch(() => {}); return true; }
  if (!ctx && !kur()) return false;
  basladi = true;
  ctx.resume?.().catch(() => {});
  // Sürekli müzik yok: 40 dakikalık derste aralıksız müzik yorar ve
  // öğretmenin sesiyle yarışır. Zemin doğa kaydı; müzik olayları işaretliyor.
  ortamYukle(bolge);
  return true;
}

async function ortamYukle(hangi) {
  if (!ctx || !ORTAM_DOSYA[hangi]) return;
  if (ortamBolge === hangi && ortamCalan) return;
  let tampon = ortamTampon.get(hangi);
  if (!tampon) {
    try {
      const cevap = await fetch(ORTAM_DOSYA[hangi]);
      if (!cevap.ok) throw new Error('bulunamadı');
      tampon = await ctx.decodeAudioData(await cevap.arrayBuffer());
      ortamTampon.set(hangi, tampon);
    } catch {
      // Dosya yoksa oyun sessiz kalmasın: sentez rüzgâra düş
      if (ruzgarKazanc) ruzgarKazanc.gain.setTargetAtTime(.02, ctx.currentTime, 1);
      return;
    }
  }
  const t = ctx.currentTime;
  // Eskisini söndür, yenisini aç — geçiş duyulmasın
  if (ortamCalan) {
    const eskiKazanc = ortamKazanc2, eskiKaynak = ortamCalan;
    eskiKazanc.gain.cancelScheduledValues(t);
    eskiKazanc.gain.setTargetAtTime(0, t, .6);
    setTimeout(() => { try { eskiKaynak.stop(); } catch {} }, 2600);
  }
  if (ruzgarKazanc) ruzgarKazanc.gain.setTargetAtTime(0, t, .8);

  const kaynak = ctx.createBufferSource();
  kaynak.buffer = tampon; kaynak.loop = true;
  const kazanc = ctx.createGain();
  kazanc.gain.setValueAtTime(.0001, t);
  kazanc.gain.setTargetAtTime(.85, t + .1, .8);
  kaynak.connect(kazanc).connect(ortamBus);
  kaynak.start();
  ortamCalan = kaynak; ortamKazanc2 = kazanc; ortamBolge = hangi;
}

function bolgeAyarla(sonraki) {
  bolge = sonraki || bolge;
  if (!ctx) return;
  ortamYukle(bolge);
}

/* Hayvan: perde kaydırmalı gövde + formant süzgeçli nefes.
   Gerçek kayıt değil — ama düz nota yerine "yaratık" gibi duyuluyor. */
function hayvanCal(hayvan) {
  if (!basla()) return;
  const s = sesBul(hayvan);
  const tekrar = s.tekrar || 1;
  for (let i = 0; i < tekrar; i++) {
    const gecikme = i * (s.sure * .85 + .05);
    const t = ctx.currentTime + gecikme;

    // Gövde: perde başlangıçtan sona kayıyor
    const o = ctx.createOscillator(), zarf = ctx.createGain();
    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass'; formant.frequency.value = s.formant; formant.Q.value = 2.2;
    o.type = s.doku;
    o.frequency.setValueAtTime(s.bas, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, s.son), t + s.sure);
    if (s.titre) {                                   // vibrato: canlılık
      const v = ctx.createOscillator(), vk = ctx.createGain();
      v.frequency.value = s.titre; vk.gain.value = s.bas * .035;
      v.connect(vk).connect(o.frequency); v.start(t); v.stop(t + s.sure + .1);
    }
    zarf.gain.setValueAtTime(.0001, t);
    zarf.gain.exponentialRampToValueAtTime(.075, t + s.sure * .18);
    zarf.gain.exponentialRampToValueAtTime(.0001, t + s.sure);
    o.connect(formant).connect(zarf).connect(efektBus);
    if (reverbSend) { const g = ctx.createGain(); g.gain.value = .04; zarf.connect(g).connect(reverbSend); }
    o.start(t); o.stop(t + s.sure + .1);

    // Nefes dokusu
    if (s.gurultu) {
      calGurultu({ sure: s.sure * .7, seviye: s.gurultu * .09, merkez: s.formant * 1.4, q: 1.6, gecikme });
    }
  }
}

function dogru() {
  if (!basla()) return;
  calCan(nota(4, 1), { sure: .9, seviye: .07 });
  calCan(nota(6, 1), { sure: 1.1, seviye: .05, gecikme: .1 });
  calGurultu({ sure: .12, seviye: .02, merkez: 5200, q: .8, gecikme: .02 });
}

function kutla() {
  if (!basla()) return;
  [0, 2, 4, 6].forEach((d, i) => calCan(nota(d, 1), { sure: 1.4, seviye: .075, gecikme: i * .11 }));
  calNota(nota(0, -1), { sure: 2.2, seviye: .05, doku: 'sine', kesim: 500, cikis: efektBus, islak: .8 });
  for (let i = 0; i < 5; i++) {
    calGurultu({ sure: .1, seviye: .016, merkez: 3200 + Math.random() * 3500, q: 1.4, gecikme: .25 + i * .09 });
  }
}

/* Dünyadaki çarpışmalar: yuvarlanan kabağın, devrilen koninin sesi.
   Ses kapalıysa ya da hiç başlatılmadıysa sessiz kalır — çarpışma
   müziği kendiliğinden açmasın. */
let sonCarpma = 0;
function carpma(guc = 1) {
  if (!ctx || !basladi || kisik) return;
  const t = ctx.currentTime;
  if (t - sonCarpma < .07) return;                  // aynı anda on çarpışma tek ses
  sonCarpma = t;
  const g = Math.max(.2, Math.min(1, guc));
  calNota(140 + Math.random() * 60, { sure: .16, seviye: .05 * g, doku: 'sine', kesim: 700, cikis: efektBus, islak: .15 });
  calGurultu({ sure: .05, seviye: .018 * g, merkez: 900 + Math.random() * 500, q: 1.1 });
}
function zipla() {
  if (!ctx || !basladi || kisik) return;
  calNota(nota(0, 1), { sure: .14, seviye: .035, doku: 'triangle', kesim: 2400, cikis: efektBus, islak: .2 });
  calNota(nota(2, 1), { sure: .12, seviye: .03, doku: 'triangle', kesim: 2400, cikis: efektBus, islak: .2, gecikme: .05 });
}

function degistir() {
  if (!basla()) return false;
  kisik = !kisik;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setTargetAtTime(kisik ? 0 : .5, t, .15);
  return !kisik;
}

function etiket() { return basladi && !kisik ? 'Sesleri kapat' : 'Sesleri aç'; }

export const ses = {
  start: basla,
  setRegion: bolgeAyarla,
  playAnimal: hayvanCal,
  correct: dogru,
  celebrate: kutla,
  toggle: degistir,
  carpma,
  zipla,
  label: etiket,
  isMuted: () => kisik
};

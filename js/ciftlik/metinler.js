/* Çiftçi Fare — metinler (metinler.js). SAF: DOM yok.

   Okuma bilmeyen çocuk ekranda YAZI görmez. Bu cümleler iki yere gider:
   1) Seslendirme: scripts/seslendirme.mjs bunları 'ciftlik-*' satırları olarak
      kayıt listesine ekler. İnsan sesiyle kaydedilen dosya
      ses/anlatim/<kod>.mp3 adıyla konunca anlatim.js onu çalar (robotik ses yok).
   2) Ekran okuyucu: anlatim.js aynı cümleyi görünmez bir aria-live alanına yazar.

   Kurallar: kısa, davetkâr ("…yapalım mı?"), rakam yok, ders içeriği YOK
   (bitkinin neden böyle büyüdüğünü anlatmak öğretmenin işi; oyun yalnız ne
   yapılacağını söyler). Kodlar küçük harf, tire ve iş/mekanik adlarıyla. */

/* oncelik: 1 = çocuğun oyunu tek başına oynaması için gerekli,
   2 = yönerge (mikro-oyunun başında), 3 = süs. */
const S = (metin, tur, not, oncelik) => Object.freeze({ metin, tur, not, oncelik });

export const METINLER = Object.freeze({
  'ciftlik-baslik': S('Çiftçi Fare', 'Çiftlik adı', 'Menüde ve açılışta', 1),
  'ciftlik-kim': S('Kim oynuyor? Kendi resmine dokun.', 'Çiftlik ekranı', '"Kim oynuyor?" ızgarası açılınca', 1),
  'ciftlik-gunaydin': S('Günaydın çiftçi! Çiftliğine hoş geldin.', 'Çiftlik ekranı', 'Çocuk kendi çiftliğine girince', 3),
  'ciftlik-surpriz': S('Bak! Bitkin büyümüş mü?', 'Çiftlik ekranı', 'Soru işaretli balonun olduğu bitkiye yaklaşınca', 3),
  'ciftlik-gunu-bitir': S('Bugünün işleri bitti. Günü bitirmek için eve dokun.', 'Çiftlik ekranı', 'Alt şeritteki işler bitince', 1),

  /* İstemler: fare bir işin yanına gelince (alttaki büyük resimli düğme) */
  'ciftlik-istem-capa': S('Toprak sertleşmiş. Çapalayalım mı?', 'Çiftlik istemi', 'Tarla parselinde sert toprak', 1),
  'ciftlik-istem-ek': S('Tohumu ekelim mi?', 'Çiftlik istemi', 'Yumuşak toprakta', 1),
  'ciftlik-istem-sula': S('Bitkiyi sulayalım mı?', 'Çiftlik istemi', 'Ekim günü ya da susamış bitki', 1),
  'ciftlik-istem-ot': S('Otlar çıkmış. Ayıklayalım mı?', 'Çiftlik istemi', 'Parselde ot', 1),
  'ciftlik-istem-destek': S('Fidan destek istiyor. Çubuk çakalım mı?', 'Çiftlik istemi', 'Fidan evresinde', 1),
  'ciftlik-istem-hasat': S('Ürün olgunlaşmış. Toplayalım mı?', 'Çiftlik istemi', 'Olgun buğday, domates ya da Dede Ceviz', 1),
  'ciftlik-istem-yem': S('Tavuklar acıkmış. Yem verelim mi?', 'Çiftlik istemi', 'Kümesin yemliği', 1),
  'ciftlik-istem-suluk': S('Suluk boşalmış. Dolduralım mı?', 'Çiftlik istemi', 'Kümesin suluğu', 1),
  'ciftlik-istem-yumurta': S('Folluğa bakalım mı?', 'Çiftlik istemi', 'Follukta yumurta varken', 1),
  'ciftlik-istem-ziyaret': S('Arkadaşını ziyaret etmek ister misin?', 'Çiftlik istemi', 'Güneydeki ziyaret kapısında', 1),
  'ciftlik-istem-ziyaretSula': S('Arkadaşının bitkisi susamış. Sulayalım mı?', 'Çiftlik istemi', 'Misafirken, susamış bitkinin yanında', 1),
  'ciftlik-istem-hediye': S('Panoya bir çıkartma bırakalım mı?', 'Çiftlik istemi', 'Misafirken, evin yanındaki panoda', 1),
  'ciftlik-istem-sev': S('Tavukları sevelim mi?', 'Çiftlik istemi', 'Misafirken, kümesin kapısında', 3),

  /* Mikro-oyun yönergeleri (iş katmanı açılınca; hayalet el aynı anda gösterir) */
  'ciftlik-is-capa': S('Kesek görünce dokun. Taşlara dokunma.', 'Çiftlik yönergesi', 'Çapa: refleks oyunu', 2),
  'ciftlik-is-ek': S('Kese toprağın üstüne gelince düğmeye bas.', 'Çiftlik yönergesi', 'Ekim: zaman oyunu', 2),
  'ciftlik-is-sula': S('Düğmeye basılı tut. Su sarı çizgiye gelince bırak.', 'Çiftlik yönergesi', 'Sulama: doldur oyunu', 2),
  'ciftlik-is-suluk': S('Basılı tut. Su sarı çizgiye gelince bırak.', 'Çiftlik yönergesi', 'Suluk doldurma: doldur oyunu', 2),
  'ciftlik-is-ot': S('Saklanan otları bul, dokun.', 'Çiftlik yönergesi', 'Ot ayıklama: gizli oyunu', 2),
  'ciftlik-is-destek': S('Çubuk fidanın yanına gelince düğmeye bas.', 'Çiftlik yönergesi', 'Destek çubuğu: zaman oyunu', 2),
  'ciftlik-is-bugdayHasat': S('Sepeti kaydır, düşen başakları tut.', 'Çiftlik yönergesi', 'Buğday hasadı: yakala oyunu', 2),
  'ciftlik-is-domatesHasat': S('İri, parlak domates görünce dokun.', 'Çiftlik yönergesi', 'Domates hasadı: refleks oyunu', 2),
  'ciftlik-is-dedeHasat': S('Ağaca dokun, salla! Sonra düşen cevizleri sepetle tut.', 'Çiftlik yönergesi', 'Dede Ceviz hasadı: silkele ve yakala', 2),
  'ciftlik-is-yem': S('Bir avuç yem al, sonra tavuğa dokun.', 'Çiftlik yönergesi', 'Tavuk yemleme', 2),
  'ciftlik-is-yumurta': S('Samanın arasındaki yumurtaları bul.', 'Çiftlik yönergesi', 'Yumurta toplama: gizli oyunu', 2),
  'ciftlik-aferin': S('Aferin!', 'Çiftlik süsü', 'Bir iş bitince (kısa)', 3),
  'ciftlik-sev': S('Tavuklar sevindi!', 'Çiftlik süsü', 'Misafir tavukları sevince', 3),

  /* Ziyaret */
  'ciftlik-ziyaret-sec': S('Kimin çiftliğine gidelim? Arkadaşının resmine dokun.', 'Çiftlik ekranı', 'Arkadaş ızgarası açılınca', 1),
  'ciftlik-ziyaret-baska': S('Başka arkadaşlar.', 'Çiftlik ekranı', 'Izgaradaki "başka arkadaş" düğmesi', 3),
  'ciftlik-ziyaret-geldin': S('Arkadaşının çiftliğine geldin. Etrafa bakabilir, hayvanları sevebilirsin.', 'Çiftlik ekranı', 'Misafir olarak girince', 1),
  'ciftlik-hediye-sec': S('Hangi çıkartmayı bırakalım?', 'Çiftlik ekranı', 'Çıkartma seçimi açılınca', 1),
  'ciftlik-hediye-asildi': S('Çıkartman panoda! Arkadaşın görünce sevinecek.', 'Çiftlik süsü', 'Çıkartma bırakılınca', 3),
  'ciftlik-eve-don': S('Haydi, kendi çiftliğine dönelim.', 'Çiftlik ekranı', 'Misafirken eve dönüş düğmesi', 1),
  'ciftlik-sen-yokken': S('Sen yokken arkadaşların seni ziyaret etti!', 'Çiftlik ekranı', '"Sen yokken" kartı', 1),
  'ciftlik-sen-yokken-sula': S('Bir arkadaşın bitkini suladı.', 'Çiftlik süsü', '"Sen yokken" kartında sulama izi varsa', 3),

  /* Çıkartmalar (ekran okuyucu adı; kayıt isteğe bağlı) */
  'ciftlik-hediye-kalp': S('Kalp', 'Çiftlik süsü', 'Çıkartma adı', 3),
  'ciftlik-hediye-yildiz': S('Yıldız', 'Çiftlik süsü', 'Çıkartma adı', 3),
  'ciftlik-hediye-cicek': S('Çiçek', 'Çiftlik süsü', 'Çıkartma adı', 3),
  'ciftlik-hediye-gunes': S('Güneş', 'Çiftlik süsü', 'Çıkartma adı', 3),
  'ciftlik-hediye-yaprak': S('Yaprak', 'Çiftlik süsü', 'Çıkartma adı', 3),
  'ciftlik-hediye-kus': S('Kuş', 'Çiftlik süsü', 'Çıkartma adı', 3),
  'ciftlik-hediye-elma': S('Elma', 'Çiftlik süsü', 'Çıkartma adı', 3),
  'ciftlik-hediye-bulut': S('Bulut', 'Çiftlik süsü', 'Çıkartma adı', 3)
});

/** Kodun cümlesi; bilinmeyen kod için boş dizgi. */
export const metin = kod => (Object.prototype.hasOwnProperty.call(METINLER, kod) ? METINLER[kod].metin : '');
/** İstem kodu: iş türünden (ortak/turler.js komut türü ya da 'ziyaret'). */
export const istemKodu = tur => `ciftlik-istem-${tur}`;
/** Mikro-oyun yönergesinin kodu: isler.js iş kodundan. */
export const isYonergeKodu = kod => `ciftlik-is-${kod}`;
/** Çıkartmanın adı (aria-label). */
export const hediyeAdi = h => metin(`ciftlik-hediye-${h}`) || 'Çıkartma';

/** Seslendirme listesi (scripts/seslendirme.mjs): [{kod, tur, metin, not, oncelik}]. */
export function seslendirmeSatirlari() {
  return Object.entries(METINLER).map(([kod, s]) => ({ kod, tur: s.tur, metin: s.metin, not: s.not, oncelik: s.oncelik }));
}

import {kurDunya} from './tahta.js';
import {baslatGorev} from './gorev.js';
import {ikon,simge} from './ikon.js';
import {ses} from './ses.js';

const V=window.VERI;
const CHAPTERS=[
 {title:'Boncuk’un çiftliği',short:'Çiftlik',subtitle:'İlk iyilik, ilk kök',text:'Geceki fırtına çiftliğin yolunu kapattı. Boncuk ve yavrular yardım bekliyor. Yolu açıp dostlarını buluşturursak verimli toprağı bizimle paylaşacak.',quote:'“Küçük bir yardım, kocaman bir başlangıçtır.”',color:'#bb8950'},
 {title:'Fısıltı ormanı',short:'Orman',subtitle:'Ormanın sesini dinle',text:'Patikaya dallar düşmüş, ormanın yuvaları dağılmış. Pamuk’a ulaşmak için ormanı birlikte toparlayalım. Yapraklar yeniden dans edince temiz hava tohumumuza ulaşacak.',quote:'“Bir orman, içindeki bütün dostlarıyla güzeldir.”',color:'#568b72'},
 {title:'İnci koyu',short:'Kıyı',subtitle:'Her damla bir umut',text:'Fırtına kıyıya çöpler taşımış. Köpük, deniz dostlarının güvenle evlerine dönmesini istiyor. Koyu temizleyelim; Köpük bizi tohuma can verecek tatlı su bulutuna götürsün.',quote:'“Denize yaptığın iyilik, bütün adaya ulaşır.”',color:'#488e9c'},
 {title:'Güneş tepesi',short:'Dağ',subtitle:'Işığa son birkaç adım',text:'Bulutlar zirveyi örtmüş ve dağ yolu dağılmış. Işık adlı küçük kuşla yolu açıp güneşe ulaşacağız. Dört armağan birleşince Umut Ağacı hepimize gölge verecek.',quote:'“Birlikte çıkınca en yüksek tepe bile yakındır.”',color:'#bb9544'}
];
const STORIES=[
 {tag:'BİR VARMIŞ, BİR YOKMUŞ',title:'Bir adanın umudu.',text:'Umut Adası’nda bütün dostlar yaşlı bir ağacın gölgesinde buluşurdu. Bir gece çıkan fırtınadan sonra buluşma yeri sessiz kaldı. Sabah, toprağın üzerinde minik bir tohum bulundu.',icon:'tohum'},
 {tag:'DÖRT DOST · DÖRT ARMAĞAN',title:'İyilikle büyüyen bir yol.',text:'Boncuk toprağı, Pamuk temiz havayı, Köpük tatlı suyu, Işık ise güneşi bulmamıza yardım edecek. Ama önce onların bize ihtiyacı var. Her durakta bir arkadaşımız yardım eli uzatacak.',icon:'filiz'},
 {tag:'BU MASALIN KAHRAMANI SİZSİNİZ',title:'Birlikte büyüteceğiz.',text:'Sırayla sayacak, eşleştirecek, düzenleyecek ve dostlarımızla ilgileneceğiz. Acelemiz yok. Her yardım tohuma güç verecek. Yolculuğun sonunda bu adada hepimizin bir yaprağı olacak.',icon:'agac'}
];
const SAVE_KEY='kucuk-tohum-v2';
let state={names:V.ornekSinif.slice(),index:0},scene=null,game=null,narration='',storyIndex=0;
const root=document.querySelector('#kok');
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;};
function button(text,fn,cls='primary',icon='arrow',startAudio=true){const e=el('button',`btn ${cls}`);e.type='button';e.setAttribute('aria-label',text);e.append(el('span','',text));if(icon)e.insertAdjacentHTML('beforeend',simge(icon));e.onclick=event=>{if(startAudio)ses.start();fn?.(event);};return e;}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s?.version!==2||!Array.isArray(s.names)||s.names.length<2||s.names.length>40||s.names.some(n=>typeof n!=='string'||!n.trim()||n.length>40))return null;const max=V.tahtaKur(s.names.length).length;if(!Number.isInteger(s.index)||s.index<0||s.index>max)return null;return {names:s.names,index:s.index};}catch{return null;}}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:2,...state}));}catch{document.querySelector('.save-status')?.replaceChildren('Kayıt kullanılamıyor; bu sekmeyi açık tut.');}}
function stops(){return V.tahtaKur(state.names.length);}
function gifts(){return stops().slice(0,state.index).filter(s=>s.tip==='bakim').map(s=>s.bolum);}
function clear(){scene?.dispose();scene=null;game?.dispose();game=null;root.replaceChildren();}
function narrationButton(label){
  const listen=button(label,null,'icon-btn','sound',false);
  listen.disabled=true;listen.title='Gerçek seslendirme kaydı eklenecek';
  return listen;
}
function header(screen='map'){
  const h=el('header','ust-bar');const brand=button('Küçük Tohum',()=>setup(),'marka','leaf');brand.setAttribute('aria-label','Küçük Tohum · Sınıf ekranı');
  const subtitle=el('span','marka-alt','BİRLİKTE BÜYÜYEN BİR MASAL');brand.append(subtitle);h.append(brand);
  const nav=el('div','bolum-nav');CHAPTERS.forEach((c,i)=>{const b=el('span',`nav-adim ${i===(stops()[state.index]?.bolum??3)?'simdi':''} ${gifts().includes(i)?'gecildi':''}`,`${String(i+1).padStart(2,'0')}  ${c.short}`);nav.append(b);});if(screen!=='setup')h.append(nav);
  const actions=el('div','ust-eylemler');
  actions.append(narrationButton('Masalı dinle'));
  const ambience=button(ses.label(),()=>{const active=ses.toggle();ambience.querySelector('span').textContent=active?'Sesleri kapat':'Sesleri aç';ambience.setAttribute('aria-label',active?'Sesleri kapat':'Sesleri aç');},'icon-btn','sound',false);actions.append(ambience);
  const full=button('Tam ekran',()=>{if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else document.documentElement.requestFullscreen?.().catch(()=>{});},'icon-btn','expand');actions.append(full);h.append(actions);return h;
}
function world(container,current=state.index,onStart){
  try{scene=kurDunya(container,{stops:stops(),current,growth:current/stops().length,onStart});}
  catch(error){console.error(error);const fallback=el('div','webgl-fallback');fallback.innerHTML=ikon('agac');fallback.append(el('h2','', 'Ada görünümü açılamadı'),el('p','','Tarayıcıda donanım hızlandırmayı açıp sayfayı yenileyebilirsin. Görevler oynamaya hazır.'));container.append(fallback);}
}
function setup(){
  clear();const page=el('main','sayfa kurulum');page.append(header('setup'));
  const content=el('div','kurulum-icerik');const copy=el('section','kurulum-metin');copy.append(el('span','eyebrow','UMUT ADASI’NA HOŞ GELDİN'),el('h1','','Küçük bir tohum.\nKocaman bir macera.'),el('p','lead','Dört doğa diyarı, dört sevimli dost ve sınıfınızın birlikte yazacağı bir hikâye.'));
  const form=el('form','sinif-formu');const label=el('label','','Maceraya kimler katılıyor?');label.htmlFor='names';const area=el('textarea','ad-alani');area.id='names';area.rows=3;area.value=state.names.join('\n');area.placeholder='Her satıra bir çocuk adı';area.spellcheck=false;form.append(label,area);
  const meta=el('div','form-meta');const number=el('span');const example=button('Örnek sınıf',()=>{area.value=V.ornekSinif.join('\n');updateCount();},'text-btn',null);meta.append(number,example);form.append(meta);
  const error=el('div','form-error');error.setAttribute('role','alert');form.append(error);
  function names(){return area.value.split('\n').map(n=>n.trim()).filter(Boolean);}
  function updateCount(){const n=names().length;number.textContent=`${n} çocuk · ${Math.max(4,n)} durak${n<4?' · ortak bakım durakları':''}`;}
  area.addEventListener('input',updateCount);updateCount();
  const start=button('Macerayı başlat',null,'primary');start.type='submit';form.append(start);
  form.onsubmit=e=>{e.preventDefault();const list=names();if(list.length<2||list.length>40||list.some(n=>n.length>40)){error.textContent='2–40 çocuk adı yaz. Her ad en fazla 40 karakter olsun.';area.focus();return;}state={names:list,index:0};save();storyIndex=0;story();};
  const saved=load();if(saved){const resume=button(saved.index>=V.tahtaKur(saved.names.length).length?'Tamamlanan masalı gör':`Kaldığımız yerden · ${saved.index+1}. durak`,()=>{state=saved;state.index>=stops().length?finale():map();},'secondary','arrow');form.append(resume);}
  copy.append(form,el('p','tiny','2–40 çocuk  ·  Süre baskısı yok  ·  Dokunarak veya sürükleyerek oyna'));content.append(copy);
  const visual=el('div','kurulum-dunya');const container=el('div','dunya');visual.append(container);const stamp=el('div','ada-damga');stamp.append(el('span','eyebrow','KEŞFEDİLMEYİ BEKLEYEN'),el('strong','','Umut Adası'),el('span','','Her iyilik burada iz bırakır.'));visual.append(stamp);content.append(visual);page.append(content);root.append(page);narration='Küçük Tohum. '+copy.querySelector('.lead').textContent;world(container,0);
}
function story(){
  clear();const page=el('main','sayfa hikaye');page.append(header());const box=el('section','hikaye-karti');const s=STORIES[storyIndex];const art=el('div','hikaye-resim');art.innerHTML=ikon(s.icon);box.append(art,el('span','eyebrow',s.tag),el('h1','',s.title),el('p','',s.text));
  const dots=el('div','hikaye-noktalar');STORIES.forEach((_,i)=>dots.append(el('i',i===storyIndex?'aktif':'')));box.append(dots);
  const controls=el('div','hikaye-kontroller');controls.append(narrationButton('Hikâyeyi dinle'));if(storyIndex>0)controls.append(button('Geri',()=>{storyIndex--;story();},'secondary','back'));controls.append(button(storyIndex===2?'Adayı keşfet':'Masala devam et',()=>{if(storyIndex<2){storyIndex++;story();}else map();}));box.append(controls);page.append(box);root.append(page);narration=s.title+' '+s.text;
}
function map(){
  if(state.index>=stops().length)return finale();clear();
  const list=stops(),stop=list[state.index],b=stop.bolum,c=CHAPTERS[b],friend=V.bolumler[b];
  ses.setRegion(friend.kod); 
  const page=el('main','sayfa harita');page.style.setProperty('--accent',c.color);page.append(header());
  const content=el('div','harita-icerik');const aside=el('aside','yolculuk-paneli');
  aside.append(el('span','eyebrow',`BÖLÜM ${String(b+1).padStart(2,'0')} / 04`),el('h1','',c.title),el('p','bolum-alt',c.subtitle),el('p','bolum-hikaye',c.text));
  const friendCard=el('div','dost-karti');const art=el('div','dost-resmi');art.innerHTML=ikon(friend.hayvan.kod);const speech=el('div');speech.append(el('strong','',friend.hayvan.ad),el('p','',c.quote));friendCard.append(art,speech);aside.append(friendCard);
  const task=el('div','siradaki-gorev');task.append(el('span','eyebrow','SIRADAKİ İYİLİK'),el('h2','',stop.veri.engel),el('p','',stop.tip==='bakim'?`${friend.hayvan.ad} ile ilgilen, ${friend.armagan.ad.toLocaleLowerCase('tr')} armağanını kazan.`:stop.veri.yonerge));
  const child=el('div','siradaki-cocuk');child.append(el('span','cocuk-avatar',state.names[state.index%state.names.length].charAt(0).toLocaleUpperCase('tr')),el('span','',`Sırada: ${state.names[state.index%state.names.length]}`));task.append(child);aside.append(task);content.append(aside);
  const view=el('section','ada-gorunumu');view.setAttribute('aria-label','Umut Adası haritası');const container=el('div','dunya');view.append(container);
  const heading=el('div','harita-baslik');heading.append(el('span','eyebrow','BÜYÜK KEŞİF'),el('h2','','Umut Adası'));view.append(heading);
  const controls=el('div','kamera-kontrolleri');controls.append(button('−',()=>scene?.zoom(-.1),'camera-btn',null),button('+',()=>scene?.zoom(.1),'camera-btn',null),button('Haritayı sola döndür',()=>scene?.rotate(-.15),'camera-btn reset','back'),button('Haritayı sağa döndür',()=>scene?.rotate(.15),'camera-btn reset','arrow'),button('Görünümü sıfırla',()=>scene?.reset(),'camera-btn reset','reset'));controls.children[0].ariaLabel='Haritayı uzaklaştır';controls.children[1].ariaLabel='Haritayı yakınlaştır';view.append(controls);
  const growth=el('div','buyume-notu');growth.innerHTML=simge('leaf');growth.append(el('span','',state.index===0?'Birlikte büyümeyi bekliyor':`${state.index} iyilikle biraz daha büyüdü`));view.append(growth);content.append(view);page.append(content);
  const footer=el('footer','yolculuk-alt');const progress=el('div','yolculuk-ilerleme');progress.append(el('span','eyebrow','YOLCULUĞUMUZ'),el('strong','',`${String(state.index+1).padStart(2,'0')} / ${list.length} durak`));const track=el('div','progress-track');const bar=el('i');bar.style.width=`${state.index/list.length*100}%`;track.append(bar);progress.append(track);footer.append(progress);
  const bag=el('div','armaganlar');V.bolumler.forEach((v,i)=>{const got=gifts().includes(i);const item=el('div','armagan'+(got?' kazanildi':''));const img=el('span','armagan-ikon');img.innerHTML=ikon(v.armagan.kod);const text=el('div');text.append(el('strong','',v.armagan.ad),el('small','',got?'Kazanıldı ✓':'Keşfedilecek'));item.append(img,text);bag.append(item);});footer.append(bag);
  const actions=el('div','harita-eylemler');if(state.index>0)actions.append(button('Bir durak geri',()=>{state.index--;save();map();},'text-btn','back'));actions.append(button('Göreve başlayalım',mission));footer.append(actions);page.append(footer);root.append(page);narration=c.title+'. '+c.text+' '+task.textContent;world(container,state.index,mission);
}
function mission(){
  const list=stops(),stop=list[state.index];if(!stop)return finale();clear();
  const chapter=V.bolumler[stop.bolum],c=CHAPTERS[stop.bolum],name=state.names[state.index%state.names.length];
  ses.setRegion(chapter.kod);ses.playAnimal(chapter.hayvan.kod);
  const page=el('main','sayfa gorev-sayfasi');page.style.setProperty('--accent',c.color);page.append(header());
  page.dataset.region=chapter.kod;
  const decor=el('div','gorev-dekor');decor.setAttribute('aria-hidden','true');
  decor.innerHTML='<i class="dekor-bulut bulut-1"></i><i class="dekor-bulut bulut-2"></i><i class="dekor-yaprak yaprak-1"></i><i class="dekor-yaprak yaprak-2"></i><i class="dekor-cicek cicek-1"></i><i class="dekor-cicek cicek-2"></i>';
  page.append(decor);
  const top=el('div','gorev-ust');top.append(button('Haritaya dön',map,'text-btn','back'),el('span','eyebrow',`${c.title.toLocaleUpperCase('tr')} · DURAK ${state.index+1} / ${list.length}`));page.append(top);
  const title=el('div','gorev-baslik');const child=el('div','oyuncu-etiketi');child.append(el('span','cocuk-avatar',name.charAt(0).toLocaleUpperCase('tr')),el('span','',`Sıra sende, ${name}`));
  const kinds={say:'SAYMA OYUNU',ayir:'AYIRMA OYUNU',eslestir:'EŞLEŞTİRME OYUNU',sirala:'SIRALAMA OYUNU',besle:'DOSTUNU BESLE',timarla:'DOSTUNU FIRÇALA',sev:'SEVGİNİ GÖSTER'};
  const missionType=stop.tip==='bakim'?stop.veri.etkinlik:stop.veri.gorev;
  const titleTop=el('div','gorev-baslik-ust');titleTop.append(el('span','gorev-tur',kinds[missionType]||'BUGÜNKÜ OYUN'),child);
  title.append(titleTop,el('h1','',stop.veri.engel));
  const instruction=stop.tip==='bakim'?V.bakimlar[stop.veri.etkinlik].yonerge.replace('{ad}',chapter.hayvan.ad):stop.veri.yonerge;
  title.append(el('p','',instruction));page.append(title);
  const area=el('section','gorev-sahnesi');area.setAttribute('aria-label','Görev oyun alanı');page.append(area);
  const footer=el('footer','gorev-alt');const status=el('div','gorev-durumu');status.innerHTML=simge('leaf');const statusText=el('span','','Her küçük yardım, tohumumuzu büyütür.');status.append(statusText);footer.append(status);
  let solved=false,advanced=false;
  const next=button('Görevi tamamlayalım',()=>{if(!solved||advanced)return;advanced=true;state.index++;save();if(stop.tip==='bakim')reward(chapter,stop.bolum);else map();});next.disabled=true;footer.append(next);page.append(footer);root.append(page);
  narration=`Sıra sende ${name}. ${stop.veri.engel} ${instruction}`;
  game=baslatGorev(area,stop,chapter,()=>{solved=true;next.disabled=false;next.querySelector('span').textContent=stop.tip==='bakim'?'Armağanı al':'Yolculuğa devam et';next.setAttribute('aria-label',next.textContent);statusText.textContent='Başardın! Tohum bir iyilik daha kazandı.';footer.classList.add('tamamlandi');},(n,total)=>{next.querySelector('span').textContent=`Önce görevi tamamlayalım · ${n}/${total}`;next.setAttribute('aria-label',next.textContent);});
}
function reward(chapter,index){
  clear();const page=el('main','sayfa hikaye odul');page.append(header());const box=el('section','hikaye-karti');const art=el('div','hikaye-resim');art.innerHTML=ikon(chapter.armagan.kod);box.append(art,el('span','eyebrow',`${index+1} / 4 ARMAĞAN TAMAMLANDI`),el('h1','',`${chapter.armagan.ad} bizimle!`),el('p','',chapter.bakim.cozum),el('p','odul-gecis',index<3?`Sırada ${CHAPTERS[index+1].title.toLocaleLowerCase('tr')} var. Yeni dostlar bizi bekliyor.`:'Dört armağan bir arada. Şimdi adanın kalbine dönelim.'),button(index===3?'Umut Ağacı’nı büyüt':'Maceraya devam et',map));page.append(box);root.append(page);narration=chapter.bakim.cozum;
}
function finale(){
  clear();const page=el('main','sayfa final');page.append(header());const content=el('div','final-icerik');const left=el('section','final-metin');left.append(el('span','eyebrow','BİR SINIF DOLUSU İYİLİK'),el('h1','','Birlikte bir orman kadar güçlüyüz.'),el('p','lead','Toprak, hava, su ve ışık bir araya geldi. Umut Ağacı büyüdü, dostlar yeniden gölgesinde buluştu. Bu ağacın her yaprağında sizin emeğiniz var.'));
  const names=el('div','yapraklar');state.names.forEach(n=>names.append(el('span','yaprak',n)));left.append(names,button('Yeni bir macera',setup,'primary'),el('span','save-status tiny','Masalınız bu cihazda saklandı.'));const view=el('div','final-dunya');content.append(left,view);page.append(content);root.append(page);narration=left.textContent;world(view,stops().length);
}
setup();

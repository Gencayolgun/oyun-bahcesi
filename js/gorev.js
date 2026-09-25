import {ikon} from './ikon.js';
import {dostPaneli} from './dostlar.js';
import {ses} from './ses.js';

const make = (tag,cls,text) => { const el=document.createElement(tag);el.className=cls||'';if(text!=null)el.textContent=text;return el; };
function shuffle(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(a.length>1&&a.every((x,i)=>x===items[i]))a.push(a.shift());return a;}

/* Aynı doğrulama yolu fare, dokunmatik sürükleme ve klavye için kullanılır. */
/* ekler: masal motorunun kullandığı iki isteğe bağlı kanca. Verilmezse
   davranış bugünküyle birebir aynıdır — Umut Adası hiçbir şey fark etmez.
     ekler.dost    → görev boyunca duran karakter paneli (varsayılan: ada dostları)
     ekler.turler  → ek görev türleri {adimli, adet(veri), kur(ctx)} */
export function baslatGorev(container,stop,chapter,onComplete,onProgress=()=>{},ekler={}) {
  const data=stop.veri,type=stop.tip==='bakim'?data.etkinlik:data.gorev;
  const ekTur=ekler.turler&&ekler.turler[type];
  const abort=new AbortController(),signal=abort.signal;
  let completed=false,selected=null,progress=0,disposed=false,activeDrag=null;
  const suppressedClicks=new WeakSet();
  const companion=stop.tip==='engel'?(ekler.dost||dostPaneli)(chapter):null;
  const cards=[],completedItems=new Set();
  let total=ekTur?ekTur.adet(data):type==='say'?data.sayi:type==='eslestir'?data.ciftler.length:type==='sirala'||type==='ayir'?data.ogeler.length:type==='besle'?3:type==='timarla'?5:6;
  // Önceki sayfa beklenmedik biçimde kapanmış olsa bile ekranda taşıma kopyası kalmasın.
  document.querySelectorAll('.suruklenen').forEach(el=>el.remove());
  container.innerHTML='';
  const root=make('div',`oyun oyun-${type}`);container.append(root);
  const message=make('div','oyun-mesaj');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
  const progressBar=make('div','oyun-ilerleme');
  const progressText=make('span','ilerleme-sayi');const track=make('div','ilerleme-iz');const fill=make('i');track.append(fill);
  const progressMarks=make('div','ilerleme-adimlari');
  for(let i=0;i<total;i++){const mark=make('span');mark.setAttribute('aria-hidden','true');progressMarks.append(mark);}
  progressBar.append(progressText,track,progressMarks);
  const sparkle=make('div','oyun-parilti');sparkle.setAttribute('aria-hidden','true');sparkle.innerHTML='<i></i><i></i><i></i><i></i><i></i><i></i>';
  root.append(sparkle);
  function update(){
    progressText.textContent=`${progress} / ${total}`;fill.style.width=`${progress/total*100}%`;
    Array.from(progressMarks.children).forEach((mark,i)=>mark.classList.toggle('tamam',i<progress));
    onProgress(progress,total,ekTur&&!ekTur.adimli?'Önce görevi tamamlayalım':null);companion?.update(progress,total);root.dataset.mood=progress===total?'mutlu':progress?'seviniyor':'bekliyor';
  }
  function hint(text){message.textContent=text;message.classList.remove('basarili');}
  function select(card){if(completed||card.disabled)return;if(selected)selected.classList.remove('secili');selected=card;card.classList.add('secili');hint('Şimdi gideceği yere dokun.');}
  function finishOne(id,card){
    if(completed||completedItems.has(id))return;
    completedItems.add(id);progress++;
    if(card){card.classList.remove('secili');card.classList.add('yerlesti');card.disabled=true;card.setAttribute('aria-label',`${card.getAttribute('aria-label')||card.textContent} · Tamamlandı`);}
    selected=null;update();
    ses.correct();
    root.classList.remove('adim-sevinci');void root.offsetWidth;root.classList.add('adim-sevinci');
    if(progress===total){completed=true;clearDrag();ses.celebrate();message.textContent=data.cozum;message.classList.add('basarili');root.classList.add('oyun-bitti');onComplete();}
    else hint(['Harika, bir adım daha!','Çok güzel! Devam edelim.','Birlikte başarıyoruz!'][progress%3]);
  }
  function card(item,id){
    const button=make('button','nesne-karti');button.type='button';button.dataset.item=String(id);button.setAttribute('aria-label',item.ad);
    const picture=make('span','nesne-resmi');picture.innerHTML=ikon(item.sekil);button.append(picture,make('span','nesne-adi',item.ad));cards.push(button);return button;
  }
  function destination(name,id,graphic){
    const button=make('button','hedef-karti');button.type='button';button.dataset.drop=String(id);
    if(graphic){const picture=make('span','hedef-resmi');picture.innerHTML=ikon(graphic);button.append(picture);}
    button.append(make('span','hedef-adi',name),make('span','hedef-alt','Buraya bırak veya dokun'));return button;
  }
  // Tek sürükleme sahibi: ikinci parmak ve odak kaybı sahipsiz kopya üretemez.
  function clearDrag(){
    const current=activeDrag;activeDrag=null;
    if(!current)return;
    root.querySelectorAll('.surukleme-hedefi').forEach(el=>el.classList.remove('surukleme-hedefi'));
    current.button.classList.remove('surukleniyor');
    current.ghost?.remove();
    if(current.dragged)suppressedClicks.add(current.button);
    try{if(current.button.hasPointerCapture(current.id))current.button.releasePointerCapture(current.id);}catch{}
  }
  function dropTargetAt(x,y){
    const direct=document.elementFromPoint(x,y)?.closest('[data-drop]');
    if(direct&&root.contains(direct)&&!direct.disabled)return direct;

    // Akıllı tahtada parmak hedefi örter. Kutunun 44 px çevresini de kabul edip
    // çakışma varsa en yakın kutuyu seçiyoruz.
    let nearest=null,best=Infinity;
    root.querySelectorAll('[data-drop]:not(:disabled)').forEach(target=>{
      const rect=target.getBoundingClientRect(),padding=44;
      if(x<rect.left-padding||x>rect.right+padding||y<rect.top-padding||y>rect.bottom+padding)return;
      const cx=Math.max(rect.left,Math.min(x,rect.right));
      const cy=Math.max(rect.top,Math.min(y,rect.bottom));
      const distance=(x-cx)**2+(y-cy)**2;
      if(distance<best){best=distance;nearest=target;}
    });
    return nearest;
  }
  function showDropTarget(x,y){
    const target=dropTargetAt(x,y);
    root.querySelectorAll('.surukleme-hedefi').forEach(el=>{
      if(el!==target)el.classList.remove('surukleme-hedefi');
    });
    target?.classList.add('surukleme-hedefi');
    return target;
  }
  function endDrag(e,cancelled=false){
    const current=activeDrag;
    if(!current||current.id!==e.pointerId)return;
    const x=Number.isFinite(e.clientX)&&e.clientX!==0?e.clientX:current.lastX;
    const y=Number.isFinite(e.clientY)&&e.clientY!==0?e.clientY:current.lastY;
    const target=current.dragged&&!cancelled?dropTargetAt(x,y):null;
    // Tamamlanma kaynak düğmeyi devre dışı bırakmadan önce kopyayı kaldır.
    clearDrag();
    if(target&&root.contains(target)&&!target.disabled&&!completed){
      current.drop(target.dataset.drop);
    }else if(current.dragged&&!cancelled&&!completed){
      current.button.classList.remove('secili');
      if(selected===current.button)selected=null;
      current.button.classList.add('geri-donuyor');
      current.button.addEventListener('animationend',()=>current.button.classList.remove('geri-donuyor'),{once:true,signal});
      hint('Biraz daha yaklaştırıp kutunun üstünde bırakabilir veya nesneye ve kutuya sırayla dokunabilirsin.');
    }
  }
  window.addEventListener('pointerup',e=>endDrag(e),{capture:true,signal});
  window.addEventListener('pointercancel',e=>endDrag(e,true),{capture:true,signal});
  window.addEventListener('blur',clearDrag,{signal});
  window.addEventListener('pagehide',clearDrag,{signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearDrag();},{signal});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')clearDrag();},{signal});
  function drag(button,drop){
    button.addEventListener('pointerdown',e=>{
      if(button.disabled||completed||disposed||e.button>0||activeDrag)return;
      suppressedClicks.delete(button);
      activeDrag={button,drop,id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,dragged:false,ghost:null};
      try{button.setPointerCapture(e.pointerId);}catch{}
    },{signal});
    button.addEventListener('pointermove',e=>{
      const current=activeDrag;
      if(!current||current.button!==button||current.id!==e.pointerId)return;
      current.lastX=e.clientX;current.lastY=e.clientY;
      if(e.pointerType==='mouse'&&e.buttons===0){clearDrag();return;}
      if(!current.dragged&&Math.hypot(e.clientX-current.x,e.clientY-current.y)>9){
        current.dragged=true;select(button);
        button.classList.add('surukleniyor');
        // Göreve bağlı bir sunum öğesi: buton kimliklerini/girdi davranışını kopyalamaz.
        current.ghost=make('div','suruklenen');current.ghost.innerHTML=button.innerHTML;
        current.ghost.setAttribute('aria-hidden','true');current.ghost.inert=true;
        // backdrop-filter kullanan görev paneli sabit öğeler için ayrı bir koordinat
        // alanı oluşturur. Kopyayı body'ye ekleyerek clientX/clientY ile aynı
        // ekran koordinatlarında tutuyoruz.
        document.body.append(current.ghost);
      }
      if(current.ghost){
        current.ghost.style.left=e.clientX+'px';current.ghost.style.top=e.clientY+'px';
        showDropTarget(e.clientX,e.clientY);
      }
    },{signal});
    button.addEventListener('lostpointercapture',e=>{if(activeDrag?.id===e.pointerId)clearDrag();},{signal});
    button.addEventListener('click',e=>{
      if(activeDrag&&activeDrag.button!==button){e.stopImmediatePropagation();e.preventDefault();return;}
      if(suppressedClicks.has(button)){suppressedClicks.delete(button);if(e.detail!==0){e.stopImmediatePropagation();e.preventDefault();}}
    },{capture:true,signal});
  }
  const field=make('div','oyun-alani');
  if(companion){const body=make('div','gorev-oyun-govde');body.append(companion.el,field);root.classList.add('dostlu-oyun');root.append(progressBar,body,message);}
  else root.append(progressBar,field,message);
  if(ekTur){
    if(!ekTur.adimli)progressBar.classList.add('ilerleme-gizli');
    ekTur.kur({
      veri:data,bolum:chapter,alan:field,kok:root,signal,
      ipucu:hint,adim:(id,button)=>finishOne(id,button),
      surukle:(button,birak)=>drag(button,birak),toplam:total
    });
  }else if(type==='say'){
    hint('Her nesneye dokun veya toplama alanına sürükle.');
    const row=make('div','nesneler');const bucket=destination(data.sekil==='fidan'?'Canlanan fidanlar':data.sekil==='bulut'?'Açılan gökyüzü':'Toplama alanı','collect',data.sekil==='bulut'?'isik':data.sekil==='fidan'?'su':'kutu');
    const count=make('strong','toplama-sayisi','0');bucket.append(count);
    for(let i=0;i<total;i++){
      const b=card({ad:`${i+1}. ${ {saman:'balya',yumurta:'yumurta',fidan:'fidan',balik:'balık',bulut:'bulut',basamak:'basamak'}[data.sekil]||'nesne'}`,sekil:data.sekil},i);
      const collect=()=>{finishOne(i,b);count.textContent=String(progress);};drag(b,id=>{if(id==='collect')collect();});b.addEventListener('click',collect,{signal});row.append(b);
    }
    field.append(row,bucket);
  }else if(type==='ayir'){
    hint('Bir nesne seç, ardından doğru kutuya dokun. Sürükleyebilirsin de.');
    const row=make('div','nesneler');const bins=make('div','hedefler');
    function place(button,bin){
      if(!button||button.disabled||completed)return;const id=Number(button.dataset.item);
      if(data.ogeler[id].dogru!==Number(bin)){hint('Bir daha düşünelim. Bu nesne hangi kutuya ait?');return;}
      const miniature=make('span','toplanan-ikon');miniature.innerHTML=ikon(data.ogeler[id].sekil);bins.children[bin].querySelector('.toplananlar').append(miniature);finishOne(id,button);
    }
    shuffle(data.ogeler.map((item,i)=>({item,i}))).forEach(({item,i})=>{const b=card(item,i);drag(b,id=>place(b,id));b.addEventListener('click',()=>select(b),{signal});row.append(b);});
    data.kutular.forEach((name,i)=>{const b=destination(name,i);b.append(make('span','toplananlar'));b.addEventListener('click',()=>selected?place(selected,i):hint('Önce bir nesne seç.'),{signal});bins.append(b);});field.append(row,bins);
  }else if(type==='eslestir'){
    hint('Soldaki dostunu seç, sağdaki eşine dokun veya sürükle.');
    const left=make('div','esler'),right=make('div','esler');
    function match(button,target){if(!button||button.disabled||completed)return;const id=Number(button.dataset.item);if(id!==Number(target)){hint('Bu onun eşi değil. Birlikte tekrar bakalım.');return;}const dest=right.querySelector(`[data-drop="${target}"]`);dest.classList.add('eslesti');dest.disabled=true;dest.querySelector('.hedef-alt').textContent='Birbirlerini buldular ✓';finishOne(id,button);}
    data.ciftler.forEach((pair,i)=>{const b=card({ad:pair.a,sekil:pair.asekil},i);drag(b,id=>match(b,id));b.addEventListener('click',()=>select(b),{signal});left.append(b);});
    shuffle(data.ciftler.map((pair,i)=>({pair,i}))).forEach(({pair,i})=>{const b=destination(pair.b,i,pair.bsekil);b.addEventListener('click',()=>selected?match(selected,i):hint('Önce soldaki dostunu seç.'),{signal});right.append(b);});field.append(left,right);
  }else if(type==='sirala'){
    hint('En küçükten başla. Nesnelere sırayla dokun veya sıradaki yere sürükle.');
    const row=make('div','nesneler'),slots=make('div','sira-yuvalari');
    function place(button,slot=progress){if(button.disabled||completed)return;const id=Number(button.dataset.item);if(Number(slot)!==progress||id!==progress){hint('Önce en küçük boş sırayı dolduralım. Hangi parça gelmeli?');return;}const target=slots.children[progress];target.innerHTML=ikon(data.ogeler[id].sekil);target.append(make('span','sira-adi',data.ogeler[id].ad));target.classList.add('dolu');target.disabled=true;finishOne(id,button);}
    data.ogeler.forEach((_,i)=>{const b=destination(String(i+1),i);b.addEventListener('click',()=>{if(selected)place(selected,i);else hint('Önce bir nesne seç veya nesnelere sırayla dokun.');},{signal});slots.append(b);});
    shuffle(data.ogeler.map((item,i)=>({item,i}))).forEach(({item,i})=>{const b=card(item,i);drag(b,id=>place(b,id));b.addEventListener('click',()=>place(b),{signal});row.append(b);});field.append(row,slots);
  }else{
    const animal=destination(chapter.hayvan.ad,'animal',chapter.hayvan.kod);animal.classList.add('bakim-hayvani');animal.querySelector('.hedef-alt').textContent=type==='besle'?'Yemini buraya getir':type==='timarla'?'Fırçayı seç, sonra beş kez dokun veya üzerinde gezdir':'Altı kez nazikçe dokun';
    const row=make('div','bakim-araclari');
    if(type==='besle'){
      hint('Bir yem seçip dostuna dokun veya yemi sürükle.');
      const food=data.yem||chapter.hayvan.yem||(chapter.hayvan.kod==='kus'?'tohum':'ot'); // masal finali yemi kendisi verebilir
      function feed(button,id){if(id!=='animal'||!button||button.disabled)return;finishOne(button.dataset.item,button);}
      for(let i=0;i<3;i++){const b=card({ad:`${i+1}. yem`,sekil:food},i);drag(b,id=>feed(b,id));b.addEventListener('click',()=>select(b),{signal});row.append(b);}
      animal.addEventListener('click',()=>selected?feed(selected,'animal'):hint('Önce aşağıdan bir yem seç.'),{signal});
    }else if(type==='timarla'){
      hint('Önce yumuşak fırçayı seç, sonra beş kez dokun veya üzerinde gezdir.');
      const brush=card({ad:'Yumuşak fırça',sekil:'firca'},'brush');let brushing=false,last=null,distance=0,suppressTap=false;
      brush.addEventListener('click',()=>{brushing=true;select(brush);hint('Şimdi dostumuza dokun veya parmağını üzerinde gezdir.');},{signal});
      drag(brush,id=>{if(id==='animal'){brushing=true;select(brush);finishOne('brush-'+progress,null);}});row.append(brush);
      animal.addEventListener('pointerdown',e=>{if(!brushing||completed)return;last={x:e.clientX,y:e.clientY};distance=0;suppressTap=false;animal.setPointerCapture(e.pointerId);},{signal});
      animal.addEventListener('pointermove',e=>{if(!last||completed)return;const rect=animal.getBoundingClientRect();if(e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom){distance+=Math.hypot(e.clientX-last.x,e.clientY-last.y);if(distance>65){distance=0;suppressTap=true;finishOne('brush-'+progress,null);}}last={x:e.clientX,y:e.clientY};},{signal});
      animal.addEventListener('pointerup',()=>{last=null;},{signal});animal.addEventListener('pointercancel',()=>{last=null;suppressTap=true;},{signal});
      animal.addEventListener('click',()=>{if(!brushing){hint('Önce yumuşak fırçayı seç.');return;}if(suppressTap){suppressTap=false;return;}finishOne('brush-'+progress,null);},{signal});
    }else{
      hint('Dostumuza altı kez nazikçe dokun.');
      animal.addEventListener('click',()=>finishOne('pet-'+progress,null),{signal});
      for(let i=0;i<6;i++){const heart=make('span','bakim-kalbi');heart.innerHTML=ikon('kalp');row.append(heart);}
    }
    field.append(animal,row);
  }
  update();
  return {dispose(){if(disposed)return;disposed=true;clearDrag();abort.abort();container.innerHTML='';}};
}

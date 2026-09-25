/* Aynı dört karakter haritada, görevlerde ve bakımda ortak bir tasarım kullanır. */
let serial=0;
const oval=(x,y,rx,ry,fill,rest='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${rest}/>`;
function eyes(x1,x2,y){return `<g class="dost-gozleri">${[x1,x2].map(x=>oval(x,y,13,17,'#fffdf4')+oval(x+2,y+2,8,11,'#334b46')+oval(x+4,y-3,3.5,4.5,'white')+oval(x-1,y+8,1.6,2,'#a7c1b3')).join('')}</g>`;}
const smile=(x,y)=>`<path d="M${x-9} ${y}q9 11 18 0" fill="none" stroke="#6a5148" stroke-width="3" stroke-linecap="round"/>`;
export function dostCiz(code){
 const id='dost-'+(++serial),g=n=>`url(#${id}-${n})`;
 const defs=`<defs>
 <radialGradient id="${id}-cream" cx="32%" cy="25%" r="80%"><stop stop-color="#fffdf2"/><stop offset=".65" stop-color="#f5e8cc"/><stop offset="1" stop-color="#d7bd98"/></radialGradient>
 <radialGradient id="${id}-pink" cx="35%" cy="25%"><stop stop-color="#f9c5b7"/><stop offset="1" stop-color="#de998d"/></radialGradient>
 <radialGradient id="${id}-blue" cx="30%" cy="20%" r="80%"><stop stop-color="#cce7e8"/><stop offset=".62" stop-color="#8ebfc9"/><stop offset="1" stop-color="#668f9f"/></radialGradient>
 <radialGradient id="${id}-gold" cx="30%" cy="22%" r="80%"><stop stop-color="#ffe7a0"/><stop offset=".63" stop-color="#ecc266"/><stop offset="1" stop-color="#c88e42"/></radialGradient>
 <linearGradient id="${id}-brown" x2=".8" y2="1"><stop stop-color="#92705b"/><stop offset="1" stop-color="#655547"/></linearGradient>
 <linearGradient id="${id}-mint" x2=".9" y2="1"><stop stop-color="#93c0a3"/><stop offset="1" stop-color="#508976"/></linearGradient>
 </defs>`;
 let drawing='';
 if(code==='inek'){
 drawing=`<path class="dost-kuyruk" d="M183 204q45 8 35-31" stroke="#bda583" stroke-width="7" fill="none" stroke-linecap="round"/>${oval(218,170,7,12,g('brown'))}
 ${oval(108,231,17,13,g('brown'))}${oval(171,231,17,13,g('brown'))}
 ${oval(140,199,48,42,g('cream'))}${oval(168,194,17,21,g('brown'),'transform="rotate(25 168 194)"')}
 <path d="M94 104q-28-23-48-10 2 32 43 34m97-24q28-23 48-10-2 32-43 34" fill="${g('cream')}"/>
 <path d="M81 109q-15-14-27-10 6 18 28 21m117-11q15-14 27-10-6 18-28 21" fill="${g('pink')}"/>
 <path d="M105 93q-19-16-9-38 3 22 19 25m60 13q19-16 9-38-3 22-19 25" fill="#c1a279"/>
 ${oval(140,129,63,59,g('cream'))}
 <path d="M86 103q4-27 31-29 30-1 26 19-5 11-25 9-17 2-21 25z" fill="${g('brown')}"/>
 <path d="M129 76q-5-23 8-23 3 15 8 20 1-19 12-14 4 11-9 21" fill="#f4e5c6"/>
 ${eyes(117,165,123)}${oval(95,149,10,6,'#efb8a4')}${oval(184,149,10,6,'#efb8a4')}
 ${oval(140,160,41,24,g('pink'))}${oval(124,153,4,6,'#bd7e75')}${oval(156,153,4,6,'#bd7e75')}${smile(140,170)}
 <path d="M105 188q36 17 70 0l-15 27-25-17-15 17z" fill="${g('mint')}"/>
 ${oval(141,208,8,9,g('gold'))}<path d="M137 211h8" stroke="#a78246" stroke-width="2"/>
 ${oval(100,204,12,19,g('cream'),'transform="rotate(24 100 204)"')}${oval(183,203,12,19,g('cream'),'transform="rotate(-28 183 203)"')}`;
 }else if(code==='tavsan'){
 drawing=`${oval(184,206,16,17,'#eee7d4')}
 <g class="dost-kulak-sol">${oval(111,68,19,49,g('cream'),'transform="rotate(-12 111 68)"')}${oval(111,66,9,34,g('pink'),'transform="rotate(-12 111 66)"')}</g>
 <g class="dost-kulak-sag">${oval(171,67,19,49,g('cream'),'transform="rotate(12 171 67)"')}${oval(171,65,9,34,g('pink'),'transform="rotate(12 171 65)"')}</g>
 ${oval(140,201,44,38,g('cream'))}${oval(111,232,23,12,g('cream'))}${oval(169,232,23,12,g('cream'))}
 ${oval(140,203,28,26,'#fff8e6')}${oval(140,136,58,52,g('cream'))}${eyes(118,162,128)}
 ${oval(104,151,12,7,'#efc0ac')}${oval(177,151,12,7,'#efc0ac')}
 <path d="M133 146q7-5 14 0l-7 8z" fill="#d99c91"/><path d="M140 153v5m-9 0q4 10 9 0 5 10 9 0" stroke="#a48270" stroke-width="2.6" fill="none" stroke-linecap="round"/>
 <path d="M110 181q31 12 59-1l-17 24-18-13-16 12z" fill="${g('mint')}"/>
 ${oval(102,202,12,20,g('cream'),'transform="rotate(-18 102 202)"')}${oval(178,202,12,20,g('cream'),'transform="rotate(18 178 202)"')}
 <path d="M135 211q-5-16 5-18 10 6 0 18 7-17 17-11-3 14-17 17z" fill="#84ae71"/>`;
 }else if(code==='fok'){
 drawing=`<path d="M188 210q26-26 48-15-6 24-34 31z" fill="${g('blue')}"/>
 ${oval(140,199,62,39,g('blue'))}${oval(129,138,58,61,g('blue'))}
 ${oval(141,201,39,25,'#d6e9e4')}${oval(80,211,17,31,g('blue'),'transform="rotate(59 80 211)"')}${oval(195,211,17,29,g('blue'),'transform="rotate(-55 195 211)"')}
 ${eyes(107,153,131)}${oval(87,156,11,6,'#c4b8b2')}${oval(172,156,11,6,'#c4b8b2')}
 ${oval(130,163,29,18,'#e3efea')}<path d="M122 152q8-5 16 0-1 10-8 10t-8-10" fill="#597686"/>${smile(130,169)}
 <g stroke="#75929b" stroke-width="2" stroke-linecap="round"><path d="m111 163-28-6m28 12-29 3m67-9 29-6m-29 12 29 3"/></g>
 <path d="M93 188q39 13 79-2l-10 15-45-2z" fill="#d3ad62"/>${oval(137,202,8,10,g('gold'))}
 <path d="M115 87q10-14 20-12m-9 12q8-10 16-8" stroke="#bfd9d7" stroke-width="4" fill="none" stroke-linecap="round"/>`;
 }else {
 drawing=`<path d="m103 220-9 21m18-17-1 18m51-18 1 18m8-21 9 20" stroke="#b88842" stroke-width="6" stroke-linecap="round"/>
 <path d="m94 209-33-10 12 22 30 2m77-14 34-10-12 22-29 2" fill="#be9147"/>
 ${oval(140,170,66,62,g('gold'))}${oval(140,188,40,38,'#f8dea1')}
 ${oval(140,126,54,48,g('gold'))}
 <path d="M132 84q-18-18-3-26l12 20q-1-29 16-27 1 19-8 30 15-19 23-8-8 13-25 15" fill="#ddae52"/>
 <g class="dost-kanat-sol">${oval(85,177,20,34,g('gold'),'transform="rotate(22 85 177)"')}<path d="m77 171 6 18m1-22 7 16" stroke="#c49646" stroke-width="2" stroke-linecap="round"/></g>
 <g class="dost-kanat-sag">${oval(195,173,20,34,g('gold'),'transform="rotate(-30 195 173)"')}<path d="m198 165-5 19m12-12-6 15" stroke="#c49646" stroke-width="2" stroke-linecap="round"/></g>
 ${eyes(119,161,122)}${oval(99,144,11,6,'#e9b180')}${oval(181,144,11,6,'#e9b180')}
 <path d="M127 147q13-13 26 0l-13 15z" fill="#cc8a46"/><path d="m132 148 8 3 8-3" stroke="#f6ce77" stroke-width="2" fill="none"/>
 <path d="M107 164q34 16 67 0l-9 18-35-3-11 20-10-5 8-20z" fill="#8aa98e"/>
 <circle cx="149" cy="180" r="5" fill="#f5e6ad"/>`;
 }
 return `<svg class="dost-cizimi dost-${code}" viewBox="0 0 280 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}${oval(141,245,71,9,'#537b5e','opacity=".13"')}<g class="dost-vucut">${drawing}</g><g class="dost-sevinc" fill="#e2b45f"><path d="m45 60 3 9 9 3-9 3-3 9-3-9-9-3 9-3zm187 62 3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/><path d="M218 77c-19-12-7-25 0-15 9-11 20 3 0 15" fill="#e7aa9b"/></g></svg>`;
}

export function dostPaneli(chapter){
 const panel=document.createElement('aside');panel.className='gorev-dostu';panel.dataset.character=chapter.hayvan.kod;panel.dataset.mood='bekliyor';
 const label=document.createElement('span');label.className='dost-unvani';label.textContent='YOL ARKADAŞIN';
 const picture=document.createElement('div');picture.className='dost-portresi';picture.setAttribute('role','img');picture.setAttribute('aria-label',`${chapter.hayvan.ad}, sevimli ${chapter.hayvan.tur.toLocaleLowerCase('tr')}`);picture.innerHTML=dostCiz(chapter.hayvan.kod);
 const name=document.createElement('strong');name.className='dost-ismi';name.textContent=chapter.hayvan.ad;
 const bubble=document.createElement('p');bubble.className='dost-sozu';bubble.setAttribute('aria-live','polite');
 const texts={inek:['Merhaba! Birlikte çiftliği toparlayalım mı?','Möö! Yardımların bana çok iyi geliyor.','Möö! Sayende çok mutluyum!'],tavsan:['Ben Pamuk! Ormanı birlikte koruyalım.','Biraz daha, başarabiliriz!','Yaşasın! Sana kocaman bir teşekkür!'],fok:['Merhaba! Koyumuz için el ele verelim.','Harika gidiyoruz, küçük dostum!','Şıp şıp! Birlikte başardık!'],kus:['Ben Işık! Güneşe birlikte ulaşalım.','Cik cik! Her yardım içimi ısıtıyor.','Kanatlarım sevinçle çırpınıyor!']};
 const lines=texts[chapter.hayvan.kod]||texts.kus;bubble.textContent=lines[0];
 panel.append(label,picture,name,bubble);
 return {el:panel,update(progress,total){panel.dataset.mood=progress===total?'mutlu':progress?'seviniyor':'bekliyor';bubble.textContent=lines[progress===total?2:progress?1:0];}};
}

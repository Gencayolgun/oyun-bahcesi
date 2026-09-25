import * as THREE from './vendor/three.module.js';

/* Gerçek zamanlı 3D diorama. Geometri, malzeme ve ışıklar tamamen yerel. */
export function kurDunya(container, options = {}) {
  const scene = new THREE.Scene();
  const background = 0xb9deda;
  scene.background = new THREE.Color(background);
  scene.fog = new THREE.Fog(background, 55, 105);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.shadowMap.enabled = true;
  // three 0.186 PCFSoftShadowMap'i kaldırdı; renderer zaten buna düşüyordu.
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.domElement.className = 'dunya-tuvali';
  renderer.domElement.setAttribute('aria-label', 'Çiftlik, orman, kıyı ve dağlardan oluşan üç boyutlu Umut Adası');
  container.append(renderer.domElement);
  const camera = new THREE.OrthographicCamera(-19,19,16,-16,.1,150);
  const hemi = new THREE.HemisphereLight(0xfff6d9,0x6a9696,2.2); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe4b1,3.3);
  sun.position.set(-13,26,10); sun.castShadow = true;
  Object.assign(sun.shadow.camera,{left:-19,right:19,top:19,bottom:-19,near:1,far:70});
  sun.shadow.mapSize.set(2048,2048); sun.shadow.normalBias=.045; sun.shadow.bias=-.0003;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd0eeff,1.2); fill.position.set(16,9,-14); scene.add(fill);
  const world = new THREE.Group(); scene.add(world);
  const materials = new Map();
  function mat(color, extra={}) {
    const key = color + JSON.stringify(extra);
    if (!materials.has(key)) materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.87,...extra}));
    return materials.get(key);
  }
  function mesh(geometry,color,x=0,y=0,z=0,parent=world,extra={}) {
    const m = new THREE.Mesh(geometry,mat(color,extra)); m.position.set(x,y,z);
    m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
  }
  function box(x,y,z,w,h,d,color,parent=world) { return mesh(new THREE.BoxGeometry(w,h,d),color,x,y,z,parent); }
  function ball(x,y,z,r,color,parent=world,detail=1) { return mesh(new THREE.IcosahedronGeometry(r,detail),color,x,y,z,parent); }
  function cylinder(x,y,z,rt,rb,h,color,parent=world,n=10) { return mesh(new THREE.CylinderGeometry(rt,rb,h,n),color,x,y,z,parent); }
  const water=mesh(new THREE.PlaneGeometry(240,240),0x75b7bf,0,-1.15,0); water.rotation.x=-Math.PI/2; water.castShadow=false;
  const shore=mesh(new THREE.CylinderGeometry(13.8,13.9,.18,80),0x8bc3bd,0,-.88,0); shore.scale.z=.77; shore.castShadow=false;
  let seed=91823;
  function rand(){seed=(seed*1664525+1013904223)>>>0; return seed/4294967296;}
  const outline=[];
  for(let i=0;i<64;i++){const a=i/64*Math.PI*2;const r=1+Math.sin(a*5)*.035+Math.sin(a*9)*.02;outline.push(new THREE.Vector2(Math.cos(a)*12.8*r,-Math.sin(a)*9.8*r));}
  function island(scale,depth,y,color,side,bevel) {
    const shape=new THREE.Shape(outline.map(p=>p.clone().multiplyScalar(scale)));
    const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel});
    const m=new THREE.Mesh(geo,[mat(color),mat(side)]);m.rotation.x=-Math.PI/2;m.position.y=y;m.receiveShadow=true;m.castShadow=true;world.add(m);
  }
  island(1,1.15,-1,0xead7ac,0xc2ad85,.24);
  island(.956,.38,-.03,0x9cbd76,0x83a064,.18);
  const field=box(-6,.57,-4,6.5,.08,3.9,0xbdc881);field.rotation.y=-.12;
  const grove=cylinder(4,.57,-4,4,4,.08,0x80ad79);grove.scale.z=.78;
  const beach=cylinder(7.2,.56,3.4,3.8,3.8,.08,0xe8d3a5,world,48);beach.scale.z=.82;
  const mountainGround=cylinder(-5.7,.55,4.8,4,4,.08,0xadc29b,world,32);mountainGround.scale.z=.72;

  // Tepeler ve karlı, yüzeyleri ışıkla ayrışan zirveler.
  function mountain(x,z,r,h) {
    cylinder(x,.45+h/2,z,0,r,h,0x93a7a4,world,5);
    cylinder(x,.45+h*.86,z,0,r*.31,h*.31,0xf4f1de,world,5);
  }
  mountain(-5.5,4.2,2.3,4.7); mountain(-8.4,3.2,1.65,3.2); mountain(-3.4,5.5,1.4,2.8);
  function tree(x,z,s=1,pine=false,parent=world) {
    const g=new THREE.Group();g.position.set(x,.46,z);g.scale.setScalar(s);parent.add(g);
    cylinder(0,.65,0,.12,.19,1.3,0x9e7950,g,7);
    if(pine){for(let i=0;i<3;i++)cylinder(0,1.25+i*.49,0,0,.85-i*.16,1.25,[0x367a60,0x438d65,0x67a16e][i],g,7);}
    else{ball(0,1.8,0,1.05,0x4b9466,g);ball(-.48,1.7,.25,.7,0x79b275,g);ball(.35,2.1,-.15,.7,0x63a16b,g);}
    return g;
  }
  [[2,-4,1.3],[4,-5.8,1.2],[6,-4.5,1.3],[7.3,-2.6,.85],[3.8,-2.6,.9],[1,-6.4,.85],[7,-6,.8],[8,-4,.72],[2.4,-2,.7]].forEach((p,i)=>tree(...p,i%3===0));
  [[-10,-1,.75],[-9,-5,.65],[-3,-6.3,.65],[-9.7,1.8,.7],[-1.6,6.8,.6]].forEach(p=>tree(...p));

  function barn(x,z) {
    const g=new THREE.Group();g.position.set(x,.46,z);g.rotation.y=-.22;world.add(g);
    box(0,1,0,2.75,2,2.2,0xcd7862,g);
    const roofShape=new THREE.Shape();roofShape.moveTo(-1.6,0);roofShape.lineTo(0,1.05);roofShape.lineTo(1.6,0);roofShape.closePath();
    mesh(new THREE.ExtrudeGeometry(roofShape,{depth:2.65,bevelEnabled:false}),0x725d59,0,1.93,-1.325,g);
    box(0,.7,1.13,.95,1.4,.07,0xf5e5bd,g);box(0,.7,1.18,.78,1.23,.05,0x8b7260,g);
    for(const x0 of [-.38,.38]){const beam=box(x0/2,.72,1.23,.045,1.36,.04,0xf1dfba,g);beam.rotation.z=x0>0?-.49:.49;}
    for(const x0 of [-1.08,1.08])box(x0,1.25,1.14,.37,.48,.06,0xc6e3d6,g);
    box(0,1.88,1.14,2.75,.1,.07,0xf2dbb0,g);
    return g;
  }
  barn(-5.8,-3.5);
  for(let row=0;row<4;row++){
    box(-5.6,.51,-.5+row*.47,3.3,.12,.3,0x94785a);
    for(let col=0;col<8;col++){
      const x=-7+col*.39,z=-.5+row*.47;
      cylinder(x,.69,z,0,.12,.3,0x7b9d49,world,5);
      if(row%2===0)ball(x,.78,z,.12,0xd2ad48,world,0);
    }
  }
  function fence(x,z,length,axis='x') {
    const g=new THREE.Group();g.position.set(x,.45,z);if(axis==='z')g.rotation.y=Math.PI/2;world.add(g);
    for(let i=0;i<=length;i++){box(i,.44,0,.12,.88,.13,0xf3e3be,g);}
    box(length/2,.38,0,length+.15,.12,.12,0xe3cea4,g);box(length/2,.69,0,length+.15,.12,.12,0xf5e4bf,g);
  }
  fence(-8.5,-5.4,5);fence(-8.5,-5.4,3,'z');
  for(let i=0;i<3;i++){const bale=cylinder(-8+i*.58,.76,-1.4,.32,.32,.55,0xe4bd67);bale.rotation.z=Math.PI/2;}
  // Yel değirmeni.
  const mill=new THREE.Group();mill.position.set(-2.2,.46,-5.7);world.add(mill);
  cylinder(0,1,0,.36,.66,2,0xf5e5c5,mill);cylinder(0,2.24,0,0,.67,.67,0x957b64,mill,6);
  const blades=new THREE.Group();blades.position.set(0,1.95,.56);mill.add(blades);
  for(let i=0;i<4;i++){const arm=new THREE.Group();arm.rotation.z=i*Math.PI/2;blades.add(arm);box(0,.57,0,.12,1.3,.08,0x886c4f,arm);box(.12,.87,.01,.36,.62,.09,0xf9ecd0,arm);}
  ball(0,1.95,.66,.15,0xc59c62,mill);

  // Kıyı: liman, yelkenli ve deniz feneri.
  const dock=new THREE.Group();dock.position.set(8.3,.48,5);dock.rotation.y=-.25;world.add(dock);
  for(let i=0;i<8;i++)box(0,.1,i*.34,1.55,.17,.3,0xb28c64,dock);
  for(const x of [-.67,.67])for(const z of [0,2.4])cylinder(x,-.1,z,.1,.12,.8,0x806c54,dock);
  const tower=new THREE.Group();tower.position.set(9.2,.47,1.2);world.add(tower);
  cylinder(0,1.3,0,.38,.65,2.6,0xf6ebcf,tower,12);cylinder(0,1.28,0,.51,.55,.48,0xda8b73,tower,12);
  cylinder(0,2.72,0,.55,.55,.5,0x96bdba,tower,12);cylinder(0,3.12,0,0,.76,.45,0x6c8380,tower,12);
  const boat=new THREE.Group();boat.position.set(10.9,-.75,7.2);boat.rotation.y=-.25;world.add(boat);
  const hull=ball(0,0,0,1,0x956e54,boat);hull.scale.set(.46,.35,1.25);
  cylinder(0,1,0,.045,.045,2.3,0xd4b27d,boat);
  const sailShape=new THREE.Shape();sailShape.moveTo(.1,.35);sailShape.lineTo(.1,2.1);sailShape.lineTo(1.2,.4);sailShape.closePath();
  const sail=mesh(new THREE.ShapeGeometry(sailShape),0xffefd2,0,0,0,boat,{side:THREE.DoubleSide});sail.rotation.y=.5;
  // Küçük kayalar, çiçekler ve kıyı dalgaları.
  for(let i=0;i<65;i++){
    const a=rand()*Math.PI*2,r=.84+rand()*.1,x=Math.cos(a)*12*r,z=Math.sin(a)*9*r;
    if(z>1&&x>5)continue;
    if(i%4===0){const rock=ball(x,.62,z,.14+rand()*.22,0xb5bda1,world,0);rock.scale.y=.65;}
    else {cylinder(x,.57,z,.02,.02,.24,0x789461,world,4);ball(x,.71,z,.06+rand()*.05,i%2?0xf2de9d:0xf0eee0,world,0);}
  }
  const ripples=[];
  for(let i=0;i<24;i++){
    const x=(rand()-.5)*44,z=(rand()-.5)*34;
    if(x*x/210+z*z/135<1)continue;
    const line=mesh(new THREE.TorusGeometry(.6+rand(),.027,4,24,Math.PI*.65),0xd4efdf,x,-1.02,z,world);line.rotation.x=-Math.PI/2;line.rotation.z=rand()*6;ripples.push(line);
  }
  // Ormanın kaynağından koya kıvrılan sığ dere.
  const riverCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(3,-.0,-1.8),new THREE.Vector3(2.7,0,0),new THREE.Vector3(4.7,0,1.8),new THREE.Vector3(4.5,0,3.5),new THREE.Vector3(7.3,0,5),new THREE.Vector3(8.6,0,7.2)]);
  function ribbon(width,color,height){const pts=riverCurve.getPoints(60),left=[],right=[];pts.forEach((p,i)=>{const tangent=riverCurve.getTangent(i/60);const nx=-tangent.z,nz=tangent.x;left.push(new THREE.Vector2(p.x+nx*width,-p.z-nz*width));right.unshift(new THREE.Vector2(p.x-nx*width,-p.z+nz*width));});const river=mesh(new THREE.ShapeGeometry(new THREE.Shape([...left,...right])),color,0,height,0);river.rotation.x=-Math.PI/2;river.castShadow=false;}
  ribbon(.6,0xd5ccaa,.62);ribbon(.42,0x6ba9b5,.64);
  for(let i=0;i<8;i++){const p=riverCurve.getPoint((i+.4)/9);const ripple=box(p.x,.652,p.z,.25,.01,.035,0xb5d9d3);ripple.rotation.y=-riverCurve.getTangent((i+.4)/9).x;}
  const bridge=new THREE.Group();bridge.position.set(7.6,.74,5.55);bridge.rotation.y=-.9;world.add(bridge);
  for(let i=0;i<7;i++)box(-.9+i*.3,0,0,.27,.13,.85,0xc7a77a,bridge);
  for(const z of [-.48,.48]){box(0,.44,z,2.15,.09,.09,0xe2c69c,bridge);for(const x of [-.96,.96])box(x,.2,z,.1,.62,.1,0xa9916d,bridge);}
  // Dostlar haritanın içinde de yaşıyor.
  const cow=new THREE.Group();cow.position.set(-3.7,.66,-1.8);cow.rotation.y=-.3;world.add(cow);
  const torso=ball(0,.35,0,.42,0xf3edda,cow,1);torso.scale.set(1.4,.85,.8);
  for(const x of [-.32,.32])for(const z of [-.2,.2])cylinder(x,.08,z,.06,.065,.4,0x8c816d,cow,5);
  ball(.48,.48,.03,.28,0xf2eddd,cow);const nose=ball(.6,.34,.2,.18,0xc99787,cow);nose.scale.y=.65;
  ball(.36,.55,.24,.037,0x354c42,cow);ball(.66,.56,.19,.034,0x354c42,cow);
  const spot=ball(-.2,.58,.18,.22,0x676a5d,cow);spot.scale.y=.3;
  const bunny=new THREE.Group();bunny.position.set(5,.71,-1.5);world.add(bunny);
  const bunnyBody=ball(0,.18,0,.33,0xf3e9d4,bunny);bunnyBody.scale.set(.8,1,.85);ball(0,.5,.12,.26,0xf5edd8,bunny);
  for(const x of [-.12,.12]){const ear=ball(x,.88,.08,.16,0xf3e9d4,bunny);ear.scale.set(.65,2,.6);ball(x*.7,.53,.36,.035,0x5f6554,bunny);}
  const seal=ball(9,.91,4,.33,0x779aab);seal.scale.set(.85,.8,1.4);ball(9,1.17,4.25,.25,0x91b0ba);ball(8.9,1.23,4.47,.03,0x3a5557);ball(9.1,1.23,4.47,.03,0x3a5557);
  for(const [x,z] of [[-1.9,-2.2],[-2,2.2],[1.1,2.8],[6.2,1]]){
    const rock=ball(x,.73,z,.27,0xa9b2a2);rock.scale.set(1.3,.6,.8);
    for(let i=0;i<3;i++){cylinder(x+.35+i*.15,.7,z+.2,.025,.03,.34,0x6c9659,world,4);ball(x+.35+i*.15,.89,z+.2,.08,0xf1e1a3,world,0);}
  }
  // Merkez: tohumun büyüdüğü taş bahçe.
  const garden=cylinder(0,.59,.3,2.05,2.18,.36,0xe3d4ad,world,48);
  cylinder(0,.81,.3,1.72,1.72,.1,0x998060,world,48);
  const seedling=new THREE.Group();seedling.position.set(0,.85,.3);world.add(seedling);
  const growth=options.growth||0;
  if(growth===0){const bean=ball(0,.39,0,.45,0xba8d53,seedling,2);bean.scale.set(.75,1.15,.8);const leaf=ball(.26,.85,0,.3,0x8aba75,seedling);leaf.scale.set(1.1,.4,.65);leaf.rotation.z=.4;}
  else {
    const s=.32+growth*.78;
    const trunk=cylinder(0,1.6*s,0,.21*s,.38*s,3.2*s,0x957247,seedling);
    for(const [x,y,z,r,color] of [[0,3.8,0,1.55,0x589a64],[-1,3.2,.2,1.05,0x8bbc70],[1,3.5,.1,1.13,0x75ad67],[.2,4.5,-.3,.95,0xa6c779]])ball(x*s,y*s,z*s,r*s,color,seedling,2);
    trunk.rotation.z=-.035;
  }
  // Durakların bölge dağılımı sınıf mevcuduyla aynı kaynaktan gelir.
  const stops=options.stops||window.VERI.tahtaKur(20);
  const positions=[];
  for(let b=0;b<4;b++){
    const group=stops.map((v,i)=>({v,i})).filter(x=>x.v.bolum===b);
    group.forEach(({i},j)=>{const a=-Math.PI+b*Math.PI/2+(j+.45)/group.length*Math.PI/2;positions[i]=new THREE.Vector3(Math.cos(a)*10.45,.6,Math.sin(a)*7.75);});
  }
  const curve=new THREE.CatmullRomCurve3(positions.map(p=>p.clone().setY(.49)),true,'catmullrom',.45);
  const path=mesh(new THREE.TubeGeometry(curve,160,.26,8,true),0xe7d9b1);path.castShadow=false;
  const labels=document.createElement('div');labels.className='dunya-etiketleri';container.append(labels);
  const projected=[];
  const current=options.current||0;
  positions.forEach((p,i)=>{
    const done=i<current, active=i===current;
    const stone=cylinder(p.x,.58,p.z,.37,.43,.22,done?0x6a9e83:active?0xdbb465:0xf6eed5,world,24);
    if(active){const ring=mesh(new THREE.TorusGeometry(.55,.055,6,40),0xffe9a6,p.x,.55,p.z);ring.rotation.x=-Math.PI/2;}
    const label=document.createElement('button');label.className='durak-noktasi'+(done?' tamam':'')+(active?' aktif':'');
    label.textContent=done?'✓':String(i+1);label.title=`${i+1}. durak · ${VERI.bolumler[stops[i].bolum].ad}${stops[i].tip==='bakim'?' · Ada dostu':''}`;
    label.setAttribute('aria-label',label.title+(active?' · Görevi aç':''));
    label.disabled=!active||!options.onStart;
    if(active&&options.onStart)label.onclick=options.onStart;
    labels.append(label);projected.push({el:label,p:p.clone().setY(.9)});
  });
  const regionCoords=[[-10.5,-6.5],[7.5,-8.3],[12.8,3.7],[-8,8.8]];
  regionCoords.forEach(([x,z],i)=>{
    const label=document.createElement('div');label.className='bolge-etiketi';label.innerHTML=`<span>0${i+1}</span> ${['Boncuk’un çiftliği','Fısıltı ormanı','İnci koyu','Güneş tepesi'][i]}`;
    labels.append(label);projected.push({el:label,p:new THREE.Vector3(x,2.1,z)});
  });
  const pawn=new THREE.Group();const p=positions[Math.min(current,positions.length-1)];pawn.position.copy(p);pawn.position.y=1.06;world.add(pawn);
  const body=ball(0,.46,0,.37,0xd79950,pawn,2);body.scale.y=1.15;
  ball(-.12,.55,.32,.042,0x3b4940,pawn);ball(.12,.55,.32,.042,0x3b4940,pawn);
  const sprout=ball(.19,.94,0,.23,0x669963,pawn);sprout.scale.set(1,.35,.6);sprout.rotation.z=.4;
  const clouds=[];
  [[-13,-9,7],[11,-10,8],[-16,7,5]].forEach(([x,z,y])=>{
    const g=new THREE.Group();g.position.set(x,y,z);world.add(g);
    [[0,0,0,1.1],[1,.1,0,.8],[-.9,-.05,0,.7]].forEach(([a,b,c,r])=>{const m=ball(a,b,c,r,0xf3f2de,g,2);m.castShadow=false;m.scale.y=.5;});clouds.push(g);
  });
  let width=1,height=1,zoom=1,yaw=0,raf=0,disposed=false,paused=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function updateCamera(){
    const aspect=width/height,span=aspect<1?31/aspect:Math.max(23,33/aspect);
    camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;
    camera.zoom=zoom;camera.position.set(Math.sin(yaw)*36,29,Math.cos(yaw)*36);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    for(const {el,p} of projected){const v=p.clone().project(camera);const pad=el.offsetWidth/2+8;el.style.left=`${Math.max(pad,Math.min(width-pad,(v.x*.5+.5)*width))}px`;el.style.top=`${Math.max(15,Math.min(height-15,(-v.y*.5+.5)*height))}px`;}
  }
  function resize(){if(disposed)return;width=Math.max(1,container.clientWidth);height=Math.max(1,container.clientHeight);renderer.setSize(width,height);updateCamera();}
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function frame(ms){
    if(disposed)return;
    if(!paused){const t=ms*.001;if(!reduced){pawn.position.y=1.1+Math.sin(t*2)*.06;blades.rotation.z=t*.18;boat.rotation.z=Math.sin(t)*.04;clouds.forEach((c,i)=>{c.position.x+=Math.sin(t*.2+i)*.001;});}renderer.render(scene,camera);}
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  const visibility=()=>{paused=document.hidden;};document.addEventListener('visibilitychange',visibility);
  return {
    zoom(delta){zoom=Math.max(.8,Math.min(1.4,zoom+delta));updateCamera();},
    rotate(delta){yaw=Math.max(-.5,Math.min(.5,yaw+delta));updateCamera();},
    reset(){zoom=1;yaw=0;updateCamera();},
    dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);scene.traverse(o=>{if(o.geometry)o.geometry.dispose();});materials.forEach(m=>m.dispose());renderer.forceContextLoss();renderer.dispose();renderer.domElement.remove();labels.remove();}
  };
}

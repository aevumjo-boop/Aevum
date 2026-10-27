(function(){
/** Scroll companion: one persistent 3D studio robot crosses the whole page.
 * The accepted Seven Crafts and Selected Work scenes remain independently intact.
 * Screen-space placement avoids text, projects and controls; a mask protects text
 * during the short, smoothly interpolated transfers between free areas.
 */
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
let scene,job;
function schedule(){clearTimeout(job);job=setTimeout(init,150);}
function init(){
 const hero=document.querySelector('#main > .studio-hero');
 if(scene?.hero===hero&&hero){scene.measure();return;}
 scene?.dispose();scene=null;
 if(!hero||reduce.matches)return;
 const sections=[...document.querySelectorAll('#main > section')];
 if(sections.length===7)scene=create(hero,sections);
}
function create(hero,sections){
 const layer=document.createElement('div');layer.id='aevum-page-walker';layer.setAttribute('aria-hidden','true');
 layer.innerHTML=`<div class="walker-guide"><div class="walker-scale">
  <div class="walker-floor-shadow"></div>
  <div class="walker-portal"><div><i></i><i></i><i></i><b>build</b></div></div>
  <div class="walker-view"><div class="walker-actor">
    <div class="walker-antenna"><i></i></div>
    <div class="walker-head"><div class="walker-ear ear-left"></div><div class="walker-ear ear-right"></div><div class="walker-screen"><i class="walker-eye eye-left"></i><i class="walker-eye eye-right"></i><i class="walker-mouth"></i></div><span></span></div>
    <div class="walker-neck"></div>
    <div class="walker-torso"><div class="walker-chest"><img src="../images/aevum-bot-emblem-v2.png" width="36" height="36" alt="" draggable="false"/></div><i></i><i></i></div>
    <div class="walker-arm arm-left"><i class="walker-elbow"></i><b class="walker-hand"></b></div>
    <div class="walker-arm arm-right"><i class="walker-elbow"></i><b class="walker-hand"></b></div>
    <div class="walker-leg leg-left"><i></i><b class="walker-foot"></b></div>
    <div class="walker-leg leg-right"><i></i><b class="walker-foot"></b></div>
  </div></div>
 </div></div>`;
 document.body.append(layer);const guide=layer.firstElementChild,world=guide.querySelector('.walker-scale');

 const docRect=e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top+scrollY,bottom:r.bottom+scrollY,width:r.width,height:r.height};};
 let width=0,height=0,mobile=false,anchors=[],protectedRects=[],state=null,frame=0,disposed=false,dirty=true,lastScroll=-1,lastTime=0,cachedRects=[],cachedTarget=null,letterOrigin=null,processStops=[],processRange=null;
 const sticky=sections[1].querySelector('.lg\\:sticky');
 function measure(){
  if(disposed||!hero.isConnected)return;
  width=document.documentElement.clientWidth;height=innerHeight;mobile=width<900;
  const r=sections.map(docRect);const rtl=document.documentElement.dir==='rtl';
  const brand=hero.querySelector('h1 > span');
  if(brand){
   const walker=document.createTreeWalker(brand,NodeFilter.SHOW_TEXT);let node;
   while(node=walker.nextNode())if(node.textContent.includes('Aevum')){
    const index=node.textContent.indexOf('Aevum'),range=document.createRange();range.setStart(node,index);range.setEnd(node,index+1);
    const a=range.getBoundingClientRect();const size=mobile?26:Math.min(76,Math.max(42,a.left-14));
    letterOrigin={x:Math.max(size*.38,a.left-size*.5-7),worldY:a.top+scrollY+a.height*.52,size};break;
   }
  }
  processStops=[...sections[4].querySelectorAll('ol > li')].map(e=>{const b=docRect(e);return{x:b.right-44,worldY:b.top+35};});
  processRange={start:r[4].top-height*.32,end:r[4].top+r[4].height*.25};
  if(mobile&&processStops.length===4)processRange={start:processStops[0].worldY-height*.55,end:processStops[3].worldY-height*.55};
  // The same physical object visits all seven sections, without unmounting.
  const poses=[
   {x:.56,y:.73,size:110,rx:.03,ry:-.22,rz:0},
   {x:.40,y:.83,size:100,rx:.02,ry:.18,rz:0},
   {x:.94,y:.74,size:92,rx:.04,ry:-.25,rz:0},
   {x:.79,y:.48,size:100,rx:.02,ry:.2,rz:0},
   {x:.78,y:.70,size:96,rx:.04,ry:-.18,rz:0},
   {x:.93,y:.72,size:105,rx:.02,ry:.2,rz:0},
   {x:.79,y:.70,size:116,rx:.02,ry:-.16,rz:0}
  ];
  anchors=poses.map((p,i)=>({...p,x:(rtl?1-p.x:p.x)*width,y:p.y*height,size:mobile?Math.min(32,p.size*.3):p.size*.82,s:i===0?0:Math.max(1,r[i].top-height*.32),stage:i}));
  protectedRects=[...document.querySelectorAll('#main h1,#main h2,#main h3,#main p,#main .brand-button,#main .btn,#main .service-row,#main a.project-card,#main .animate-marquee,#main .marquee-track')].map(docRect);
  const sculpture=document.querySelector('.scene-workstation');if(sculpture){const rr=docRect(sculpture);protectedRects.push({...rr,left:rr.left-85,right:rr.right+100,top:rr.top-60,bottom:rr.bottom+40});}
  dirty=true;
 }
 function pose(s){
  let i=0;while(i<anchors.length-2&&s>anchors[i+1].s)i++;
  const a=anchors[i],b=anchors[i+1],u=clamp((s-a.s)/Math.max(1,b.s-a.s)),t=smooth(u),p={};
  for(const k of ['x','y','size','rx','ry','rz'])p[k]=mix(a[k],b[k],t);
  p.x+=Math.sin(u*Math.PI)*(mobile?8:35)*(i%2?1:-1);
  p.y+=Math.sin(u*Math.PI*2)*(mobile?9:28);p.stage=t<.5?a.stage:b.stage;
  // Start directly beside the measured first A, rather than at a viewport guess.
  if(letterOrigin&&s<340){
   const exit=smooth((s-220)/120),side=smooth((s-95)/125);
   const x=mix(letterOrigin.x,width*(document.documentElement.dir==='rtl'?.78:.22),side);
   const y=mix(letterOrigin.worldY-s,Math.min(height*.83,docRect(hero).bottom-s+76),smooth(s/145));
   p.x=mix(x,p.x,exit);p.y=mix(y,p.y,exit);p.size=mix(mix(letterOrigin.size,mobile?30:78,side),p.size,exit);p.stage=0;p.startAnchor=s<60;
  }
  // Walk across the four process cards in their existing order.
  if(processStops.length===4&&s>=processRange.start&&s<=processRange.end){
   const q=clamp((s-processRange.start)/(processRange.end-processRange.start))*3;
   const n=Math.min(2,Math.floor(q)),f=smooth(q-n),a=processStops[n],b=processStops[n+1];
   p.x=mix(a.x,b.x,f);p.y=mix(a.worldY,b.worldY,f)-s;p.size=mobile?28:62;p.stage=4;
  }
  return p;
 }
 function visibleRects(){
  const out=protectedRects.map(r=>({...r,top:r.top-scrollY,bottom:r.bottom-scrollY})).filter(r=>r.bottom>90&&r.top<height);
  if(sticky){const r=sticky.getBoundingClientRect();out.push({left:r.left-8,right:r.right+8,top:r.top-8,bottom:r.bottom+8});const stack=document.querySelector('.scene-stack');if(stack&&getComputedStyle(stack).display!=='none'){const b=stack.getBoundingClientRect();out.push({left:b.left-35,right:b.right+50,top:b.top-60,bottom:b.bottom+40});}}
  out.push({left:0,right:width,top:0,bottom:98});return out;
 }
 const overlap=(x,y,size,rects)=>{const rx=size*.68,ry=size*.98;return rects.some(r=>x+rx>r.left-8&&x-rx<r.right+8&&y+ry>r.top-8&&y-ry<r.bottom+8);};
 function mobileSafePose(p,rects){
  const inset=2,top=104,bottom=height-8;
  let best=null,score=Infinity;
  const wanted={...p,y:p.startAnchor?p.y-42:p.y};
  // Search both margins and every free rectangle between content boundaries.
  for(const size of [32,28,24,20,16,12]){
   const rx=size*.68,ry=size*.98;
   const xs=[clamp(wanted.x,rx+inset,width-rx-inset),rx+inset,width-rx-inset,width*.5];
   const ys=[clamp(wanted.y,top+ry,bottom-ry),top+ry,bottom-ry,height*.35,height*.65];
   for(const r of rects){xs.push(r.left-rx-inset,r.right+rx+inset);ys.push(r.top-ry-inset,r.bottom+ry+inset);}
   for(const x of xs)for(const y of ys){
    if(x<rx+inset||x>width-rx-inset||y<top+ry||y>bottom-ry)continue;
    if(rects.some(r=>x+rx>r.left-inset&&x-rx<r.right+inset&&y+ry>r.top-inset&&y-ry<r.bottom+inset))continue;
    const previous=state?Math.hypot(x-state.x,y-state.y)*.16:0;
    const cost=Math.hypot((x-wanted.x)*.65,y-wanted.y)+(32-size)*16+previous;
    if(cost<score){best={...p,x,y,size};score=cost;}
   }
   if(best&&best.size>=24)break;
  }
  // A compact edge perch remains visible even in exceptionally dense viewports.
  return best||{...p,x:10,y:clamp(wanted.y,top+16,bottom-16),size:12};
 }
 function safePose(p,rects){
  if(mobile)return mobileSafePose(p,rects);
  if(p.startAnchor)return p;
  let best=null,score=Infinity;
  const sizes=mobile?[Math.min(32,p.size),28,24]:[p.size,p.size*.85,Math.min(62,p.size),Math.min(52,p.size)];
  for(const size of sizes){
   const rx=size*.68+12,ry=size*.98+12;
   const tx=clamp(p.x,rx,width-rx),ty=clamp(p.y,110+ry,height-ry);
   const xs=[tx,rx,width-rx,width*.2,width*.4,width*.6,width*.8];
   const ys=[ty,height*.28,height*.46,height*.68,height*.85];
   rects.forEach(r=>{if(r.bottom+ry<height-ry)ys.push(r.bottom+ry+10);if(r.top-ry>110+ry)ys.push(r.top-ry-10);});
   for(const x of xs)for(const y of ys){
    if(x<rx||x>width-rx||y<110+ry||y>height-ry||overlap(x,y,size,rects))continue;
    const cost=Math.hypot((x-p.x)*.85,y-p.y)+(p.size-size)*7.5;
    if(cost<score){best={...p,x,y,size};score=cost;}
   }
   if(score<20)break;
  }
  return best||{...p,x:width-20,y:height*.8,size:mobile?24:50,hidden:mobile};
 }
 function tick(now){
  if(disposed)return;frame=requestAnimationFrame(tick);if(document.hidden)return;
  const dt=Math.min(.05,(now-lastTime)/1000||.016);
  if(now-lastTime<22&&lastScroll===scrollY&&!dirty)return;
  const changed=lastScroll!==scrollY||dirty;
  if(!changed&&cachedTarget&&state&&['x','y','size','rx','ry','rz'].every(k=>Math.abs(state[k]-cachedTarget[k])<.02))return;
  lastTime=now;lastScroll=scrollY;
  if(changed||!cachedTarget){cachedRects=visibleRects();cachedTarget=safePose(pose(scrollY),cachedRects);}
  const rects=cachedRects,target=cachedTarget;
  layer.dataset.mobileHidden='false';
  if(!state||dirty){state={...target};dirty=false;}else{const f=1-Math.exp(-dt*10);for(const k of ['x','y','size','rx','ry','rz'])state[k]=mix(state[k],target[k],f);}
  const emergence=smooth(scrollY/170),phase=scrollY/44;
  // A planted contact phase, followed by a lifted forward step; feet alternate.
  const foot=(offset)=>{const t=((phase/(Math.PI*2)+offset)%1+1)%1;
   if(t<.64){const u=t/.64;return{lift:0,angle:mix(-13,15,u),travel:mix(7,-7,u)};}
   const u=(t-.64)/.36;return{lift:-Math.sin(u*Math.PI)*13,angle:mix(15,-13,smooth(u)),travel:mix(-7,7,smooth(u))};};
  const left=foot(0),right=foot(.5),stride=Math.sin(phase),opposite=-stride;
  guide.style.width=`${state.size}px`;guide.style.height=`${state.size*1.8}px`;
  guide.style.transform=`translate3d(${state.x}px,${state.y}px,0) translate(-50%,-50%)`;
  world.style.transform=`scale(${state.size/100}) rotateX(${state.rx}rad) rotateY(${state.ry}rad)`;
  guide.style.setProperty('--walker-rise',`${(1-emergence)*96}px`);
  guide.style.setProperty('--portal-opacity',String(1-smooth((scrollY-100)/120)));
  guide.style.setProperty('--walker-bob',`${-Math.abs(Math.sin(phase*2))*1.4*emergence}px`);
  guide.style.setProperty('--left-stride',`${left.angle*emergence}deg`);
  guide.style.setProperty('--right-stride',`${right.angle*emergence}deg`);
  guide.style.setProperty('--left-foot',`${left.lift*emergence}px`);
  guide.style.setProperty('--right-foot',`${right.lift*emergence}px`);
  guide.style.setProperty('--left-travel',`${left.travel*emergence}px`);
  guide.style.setProperty('--right-travel',`${right.travel*emergence}px`);
  guide.style.setProperty('--left-arm',`${opposite*15*emergence}deg`);
  guide.style.setProperty('--right-arm',`${stride*15*emergence-Math.sin(emergence*Math.PI)*48}deg`);
  guide.style.setProperty('--head-tilt',`${Math.sin(phase*.2)*5*emergence}deg`);
  // The sculpture can pass behind protected content during transfers.
  const holes=rects.map(r=>`<rect x="${r.left-7}" y="${r.top-7}" width="${r.right-r.left+14}" height="${r.bottom-r.top+14}" rx="5" fill="black"/>`).join('');
  const mask=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><mask id="safe"><rect width="100%" height="100%" fill="white"/>${holes}</mask></defs><rect width="100%" height="100%" fill="white" mask="url(#safe)"/></svg>`;
  if(mobile)layer.style.maskImage='none';
  else if(changed)layer.style.maskImage=`url("data:image/svg+xml,${encodeURIComponent(mask)}")`;
  layer.dataset.section=String(target.stage);layer.dataset.continuous='true';layer.dataset.emerged=String(emergence>.98);
 }
 const ro=new ResizeObserver(measure);sections.forEach(s=>ro.observe(s));addEventListener('resize',measure,{passive:true});measure();frame=requestAnimationFrame(tick);
 return{hero,measure,dispose(){disposed=true;cancelAnimationFrame(frame);ro.disconnect();removeEventListener('resize',measure);layer.remove();}};
}
new MutationObserver(m=>{if(m.some(r=>r.type==='childList'&&r.target.closest?.('#main')))schedule();}).observe(document.documentElement,{subtree:true,childList:true});
reduce.addEventListener('change',()=>{scene?.dispose();scene=null;schedule();});document.fonts?.ready.then(schedule);addEventListener('pageshow',schedule);schedule();
})();

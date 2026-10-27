(function(){
/* Paint droplets originate from the actual orange A in the existing header
 * wordmark (source image 480x120; orange silhouette spans x24..115, y20..93).
 * Uses the requested paint color #FB563A. Existing logo pixels and proportions stay intact.
 */
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const words={en:['Precision','Craft','Quality','Clarity','Trust','Excellence'],ar:['إتقان','دقّة','جودة','ابتكار','ثقة','تميّز']};
let overlay,timer,count=0,lastDrop=-9999,lastScroll=0;
const live=new Set();
const logo=()=>document.querySelector('header a[aria-label="Aevum — home"] img, header a.logo img');
const random=(a,b)=>a+Math.random()*(b-a);
function paintShape(){
 const n=36,points=[];
 const stretch=random(.92,1.08),phase=random(0,Math.PI*2);
 for(let i=0;i<n;i++){
  const a=i/n*Math.PI*2;
  const radius=random(.92,1.09)+(Math.random()<.24?random(.18,.42):0);
  points.push([80+Math.cos(a)*48*radius*stretch,38+Math.sin(a)*20*radius+Math.sin(a*3+phase)*2]);
 }
 // Smooth closed contour with variable lobes, without deforming the readable center.
 let d=`M${points[0].join(',')}`;
 for(let i=0;i<n;i++){
  const p0=points[(i+n-1)%n],p1=points[i],p2=points[(i+1)%n],p3=points[(i+2)%n];
  d+=`C${p1[0]+(p2[0]-p0[0])/6},${p1[1]+(p2[1]-p0[1])/6} ${p2[0]-(p3[0]-p1[0])/6},${p2[1]-(p3[1]-p1[1])/6} ${p2.join(',')}`;
 }
 let spray='';
 for(let i=0;i<12;i++){
  const a=random(0,Math.PI*2),r=random(1.35,1.6),cx=80+Math.cos(a)*48*r,cy=38+Math.sin(a)*21*r;
  spray+=`<ellipse cx="${cx}" cy="${cy}" rx="${random(.7,2.8)}" ry="${random(.7,1.8)}" transform="rotate(${random(-70,70)} ${cx} ${cy})"/>`;
 }
 return `<svg viewBox="0 0 160 76" preserveAspectRatio="none" aria-hidden="true"><g fill="#FB563A"><path d="${d}Z"/>${spray}</g><path d="M43 31Q54 26 66 27" fill="none" stroke="#FFA18F" stroke-opacity=".45" stroke-width="1.2" stroke-linecap="round"/></svg>`;
}
function wideSpray(el,x,y,landingY,mobile){
 const boxes=[...document.querySelectorAll('header,#main h1,#main h2,#main h3,#main p,#main a,#main button')].map(e=>e.getBoundingClientRect()).filter(b=>b.bottom>0&&b.top<innerHeight);
 const amount=mobile?7:14;
 for(let i=0;i<amount;i++){
  let tx,ty,clear=false;
  for(let attempt=0;attempt<12;attempt++){
   tx=random(18,document.documentElement.clientWidth-18);ty=random(100,innerHeight-65);
   if(!boxes.some(b=>tx>b.left-10&&tx<b.right+10&&ty>b.top-10&&ty<b.bottom+10)){clear=true;break;}
  }
  if(!clear)continue;
  const dot=document.createElement('i');dot.className='logo-paint-wide-spray';
  const dx=tx-x,dy=ty-landingY,size=random(2.5,mobile?5:7);
  dot.style.cssText=`left:0;top:${landingY-y}px;width:${size}px;height:${size*random(.6,1.25)}px;--wx:${dx}px;--wy:${dy}px;--mx:${dx*.65}px;--my:${dy*.75-45}px;--tilt:${random(-70,70)}deg;border-radius:${random(25,65)}% ${random(30,70)}% 45% 55%;animation-delay:${random(0,.06)}s`;
  el.append(dot);
 }
}
function protectMobileLanding(el){
 if(document.documentElement.clientWidth>=640)return;
 const x=Number(el.dataset.landingX),y=Number(el.dataset.landingY),margin=50;
 const blocked=[...document.querySelectorAll('#main h1,#main h2,#main h3,#main p,#main a,#main button,#main .animate-marquee,#main .marquee-track')].some(e=>{const b=e.getBoundingClientRect();return b.width&&b.height&&b.left<x+margin&&b.right>x-margin&&b.top<y+24&&b.bottom>y-24;});
 el.dataset.landingClear=String(!blocked);
}
function drop(){
 const now=performance.now(),img=logo();
 if(!overlay||!img||reduced.matches||document.hidden||live.size||now-lastDrop<3100)return;
 if(document.querySelector('header button[aria-expanded="true"]'))return;
 const r=img.getBoundingClientRect();if(!r.width||r.bottom<0)return;
 const lang=document.documentElement.dir==='rtl'?'ar':'en';
 const x=r.left+r.width*(55/480),y=r.top+r.height*(93/120)+2;
 const mobile=innerWidth<640,width=mobile?80:116;
 // Fall vertically from the A to the bottom of the viewport.
 const landingX=x;
 const badge=document.querySelector('#lovable-badge')?.getBoundingClientRect();
 const landingY=innerHeight-(badge&&landingX>badge.left-width/2?82:(mobile?38:42));
 const el=document.createElement('div');el.className='logo-paint-event';el.lang=lang;
 el.dataset.landingX=String(landingX);el.dataset.landingY=String(landingY);
 protectMobileLanding(el);
 el.setAttribute('aria-hidden','true');
 el.style.cssText=`left:${x}px;top:${y}px;--dx:${landingX-x}px;--fall:${landingY-y}px;--puddle-width:${width}px`;
 const bead=document.createElement('i');bead.className='logo-paint-drop';bead.innerHTML='<svg viewBox="0 0 18 29" aria-hidden="true"><defs><linearGradient id="paint-wet" x2="1" y2="1"><stop stop-color="#FF9B89"/><stop offset=".32" stop-color="#FB563A"/><stop offset="1" stop-color="#D94028"/></linearGradient></defs><path d="M9 0C8 7 0 13 0 20a9 9 0 0 0 18 0C18 13 10 7 9 0Z" fill="url(#paint-wet)"/><path d="M5 15c-2 3-2 6-1 8" fill="none" stroke="#FFD0C7" stroke-opacity=".6" stroke-width="1.5" stroke-linecap="round"/></svg>';el.append(bead);
 const puddle=document.createElement('div');puddle.className='logo-paint-puddle';
 const ink=document.createElement('i');ink.className='logo-paint-ink';
 ink.innerHTML=paintShape();
 const word=document.createElement('span');word.className='logo-paint-word';word.textContent=words[lang][count%words[lang].length];
 puddle.append(ink,word);el.append(puddle);
 const localCount=Math.floor(random(4,9));
 for(let i=0;i<localCount;i++){
  const dot=document.createElement('i');dot.className='logo-paint-splash';
  const direction=random(-1,1),reach=random(30,78),size=random(2,5);
  dot.style.cssText=`--sx:${direction*reach}px;--sy:${random(-48,-16)}px;--ex:${direction*(reach+random(4,14))}px;--ey:${random(-12,14)}px;width:${size}px;height:${size*random(.7,1.4)}px`;
  el.append(dot);
 }
 if(!mobile&&count%3===1)wideSpray(el,x,y,landingY,mobile);
 overlay.append(el);live.add(el);count++;lastDrop=now;
 setTimeout(()=>{live.delete(el);el.remove();},3050);
}
function start(){
 if(reduced.matches||overlay)return;
 overlay=document.createElement('div');overlay.id='aevum-logo-word-drips';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);
 setTimeout(drop,50);timer=setInterval(drop,3200);
}
function stop(){clearInterval(timer);live.forEach(e=>e.remove());live.clear();overlay?.remove();overlay=null;}
addEventListener('scroll',()=>{live.forEach(protectMobileLanding);if(Math.abs(scrollY-lastScroll)>360){lastScroll=scrollY;drop();}},{passive:true});
let paintViewportWidth=document.documentElement.clientWidth;
addEventListener('resize',()=>{const next=document.documentElement.clientWidth;if(next!==paintViewportWidth){live.forEach(e=>e.remove());live.clear();paintViewportWidth=next;}},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){live.forEach(e=>e.remove());live.clear();}else{drop();}});
new MutationObserver(()=>{live.forEach(e=>e.remove());live.clear();drop();}).observe(document.documentElement,{attributes:true,attributeFilter:['dir']});
reduced.addEventListener('change',()=>{stop();start();});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

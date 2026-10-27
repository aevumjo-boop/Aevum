(function(){
/* LIVING STUDIO: the interfaces become the motion. The star is never animated. */
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
let current,initializing=false,timer;
function schedule(){clearTimeout(timer);timer=setTimeout(setup,100);}
function setup(){
  const hero=document.querySelector('#main > .studio-hero');
  if(current?.hero===hero&&hero){current.measure();return;}
  current?.dispose();current=null;
  if(!hero||reduced.matches||initializing)return;
  initializing=true;try{current=createScene(hero);}finally{initializing=false;}
}
function createScene(hero){
  const sections=[...document.querySelectorAll('#main > section')];
  if(sections.length<7)return null;
  const [,services,work,approach,process,about,cta]=sections;
  const rows=[...services.querySelectorAll('.service-row')];
  const previews=[...work.querySelectorAll('a.project-card')].map(a=>a.firstElementChild?.firstElementChild).filter(Boolean);
  const screens=previews.map(p=>p.firstElementChild);
  const disciplines=[...approach.querySelectorAll('h3')].map(h=>h.parentElement);
  const steps=[...process.querySelectorAll('ol > li')];
  const list=process.querySelector('ol');
  const copy=hero.querySelector('.reveal');
  const sticky=services.querySelector('.lg\\:sticky');
  const modified=[];const additions=[];
  const addClass=(el,cls)=>{if(el){el.classList.add(cls);modified.push([el,cls]);}};
  addClass(services,'scene-services');addClass(copy,'scene-hero-copy');rows.forEach(e=>addClass(e,'scene-service'));
  previews.forEach(e=>addClass(e,'scene-preview'));screens.forEach(e=>addClass(e,'scene-screen'));
  disciplines.forEach((e,i)=>{addClass(e,'scene-discipline');e.dataset.sceneKind=['research','design','engineering'][i];});
  addClass(list,'scene-process');addClass(about,'scene-about');addClass(cta,'scene-cta');
  const stack=document.createElement('div');stack.className='scene-stack';stack.setAttribute('aria-hidden','true');
  stack.innerHTML='<div class="scene-stack-object">'+[0,1,2].map(i=>`<div class="scene-stack-plane" style="--plane-index:${i}"><div class="scene-layout"><i></i><i></i><i></i><i></i></div></div>`).join('')+'</div>';
  sticky?.append(stack);additions.push(stack);
  // A second, prominent sculpture: code becomes a responsive product in depth.
  // The existing Seven Crafts animation above is intentionally kept intact.
  addClass(work,'scene-work-section');
  const workstation=document.createElement('div');workstation.className='scene-workstation';workstation.setAttribute('aria-hidden','true');
  workstation.innerHTML=`<div class="workstation-scale"><div class="workstation-world">
    <div class="workstation-ground"></div>
    <div class="workstation-code workstation-slab"><div class="workstation-bar"><b></b><b></b><b></b><span>product.tsx</span></div><div class="workstation-editor"><span><em>const</em> idea <i>=</i> {</span><span class="indent">vision: <strong>"something better"</strong>,</span><span class="indent">builtFor: <strong>"people"</strong></span><span>};</span><span><em>await</em> <i>design</i>(idea);</span><span><em>await</em> <i>build</i>(idea);</span><span class="workstation-line-launch"><i>launch</i>(idea); <small>✓</small></span></div></div>
    <div class="workstation-web workstation-slab"><div class="workstation-bar"><b></b><b></b><b></b><span>From idea to live.</span></div><div class="workstation-web-body"><div class="workstation-nav"><i></i><span></span><span></span><b></b></div><div class="workstation-web-hero"><div><b>Made to<br>move you.</b><i></i><i></i><em></em></div><div class="workstation-visual"><span></span><span></span><span></span></div></div><div class="workstation-tiles"><i></i><i></i><i></i></div></div></div>
    <div class="workstation-phone workstation-slab"><div class="workstation-island"></div><div class="workstation-app"><i></i><b>Your next<br>big thing.</b><div class="workstation-app-visual"><span></span></div><div class="workstation-app-rows"><i></i><i></i></div><em></em></div></div>
    <div class="workstation-connector"></div>
  </div></div>`;
  work.prepend(workstation);additions.push(workstation);
  const ns='http://www.w3.org/2000/svg';const rail=document.createElementNS(ns,'svg');rail.classList.add('scene-process-line');rail.setAttribute('aria-hidden','true');
  const track=document.createElementNS(ns,'path');track.setAttribute('fill','none');track.setAttribute('stroke','#ff83542b');track.setAttribute('stroke-width','1.5');rail.append(track);
  const trace=track.cloneNode();trace.setAttribute('stroke','#ff6d45');trace.setAttribute('stroke-width','2');trace.setAttribute('pathLength','1');trace.setAttribute('stroke-dasharray','1');rail.append(trace);list?.prepend(rail);additions.push(rail);
  const savedStyles=new Map();const props=new Map();
  function set(el,name,value){if(!el)return;if(!savedStyles.has(el))savedStyles.set(el,el.getAttribute('style'));if(!props.has(el))props.set(el,new Set());props.get(el).add(name);el.style.setProperty(name,value);}
  const rect=el=>{const r=el.getBoundingClientRect();return{top:r.top+scrollY,bottom:r.bottom+scrollY,height:r.height,left:r.left,width:r.width};};
  let metrics,raf=0,dirty=true,disposed=false,last=-1,px=0,py=0;
  function measure(){if(disposed||!hero.isConnected)return;metrics={hero:rect(hero),services:rect(services),rows:rows.map(rect),previews:previews.map(rect),cards:disciplines.map(rect),steps:steps.map(rect),work:rect(work),approach:rect(approach),process:rect(process),about:rect(about),cta:rect(cta)};
    if(list&&steps.length){const lr=list.getBoundingClientRect();const ps=steps.map(e=>{const r=e.querySelector('span').getBoundingClientRect();return{x:r.left+r.width/2-lr.left,y:r.top+r.height/2-lr.top};});const d=ps.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ');track.setAttribute('d',d);trace.setAttribute('d',d);}
    dirty=true;
  }
  const progress=(r,h=innerHeight)=>clamp((scrollY+h*.82-r.top)/(r.height+h*.54));
  function tick(){
    if(disposed)return;raf=requestAnimationFrame(tick);if(document.hidden)return;
    if(last===scrollY&&!dirty)return;last=scrollY;dirty=false;
    const h=innerHeight,mobile=innerWidth<900;
    const hp=ease(scrollY/Math.max(1,metrics.hero.height));
    set(copy,'--hero-y',`${-hp*(mobile?16:52)}px`);set(copy,'--hero-rx',`${hp*(mobile?1:7)}deg`);
    let chosen=0,minDistance=Infinity;
    metrics.rows.forEach((r,i)=>{const center=r.top+r.height*.5-scrollY;const distance=Math.abs(center-h*.53);if(distance<minDistance){chosen=i;minDistance=distance;}});
    metrics.rows.forEach((r,i)=>{const center=r.top+r.height*.5-scrollY;const arrival=1-ease((center-h*.68)/(h*.38));const light=i===chosen?clamp(1-minDistance/(h*.5)):0;
      set(rows[i],'--row-rx',`${(1-arrival)*(mobile?4:16)}deg`);set(rows[i],'--row-x',`${(1-arrival)*(mobile?4:20)}px`);set(rows[i],'--row-light',String(light*.16));set(rows[i],'--row-line',String(arrival));set(rows[i],'--number-light',String(1+light*.55));
    });
    const sp=progress(metrics.services);const sv=clamp((h-(metrics.services.top-scrollY))/220)*clamp((metrics.services.bottom-scrollY-h*.45)/250);
    set(stack,'--stack-visible',String(sv));set(stack,'--stack-rx',`${mix(60,35,sp)}deg`);set(stack,'--stack-ry',`${Math.sin(sp*Math.PI*2)*22+px*4}deg`);set(stack,'--stack-rz',`${mix(-24,12,sp)}deg`);set(stack,'--stack-spread',`${22+Math.sin(sp*Math.PI)*45}px`);set(stack,'--stack-build',String(.3+sp*.7));
    // Scroll opens the workstation into code / web / mobile planes, then assembles it.
    const wp=clamp((scrollY+h*.66-metrics.work.top)/(h*.92));
    const split=Math.sin(wp*Math.PI);
    set(workstation,'--work-rx',`${mix(23,-8,wp)}deg`);
    set(workstation,'--work-ry',`${mix(-31,24,wp)+px*3}deg`);
    set(workstation,'--work-rz',`${mix(-8,5,wp)}deg`);
    set(workstation,'--work-y',`${-24*wp}px`);
    set(workstation,'--work-open',String(split));
    set(workstation,'--work-depth',`${45+split*(mobile?30:85)}px`);
    set(workstation,'--work-phone-depth',`${90+split*(mobile?35:90)}px`);
    set(workstation,'--work-code-x',`${(mobile?-12:-32)*split}px`);
    set(workstation,'--work-phone-x',`${(mobile?12:30)*split}px`);
    set(workstation,'--work-launch',String(ease((wp-.5)*2)));
    set(workstation,'--work-glow',String(.1+split*.18));
    metrics.previews.forEach((r,i)=>{const p=progress(r),q=(p-.5)*2,side=i%2?1:-1;const strength=mobile?.3:1;
      set(screens[i],'--screen-y',`${q*-23*strength}px`);set(screens[i],'--screen-rx',`${q*-13*strength+py*1.2}deg`);set(screens[i],'--screen-ry',`${(side*11*(1-Math.abs(q))+px*2)*strength}deg`);set(screens[i],'--screen-scale',String(1-Math.abs(q)*.045));
      set(previews[i],'--screen-sheen',String(Math.sin(p*Math.PI)*.38));set(previews[i],'--sheen-x',`${mix(-38,38,p)}%`);
      set(screens[i],'--screen-shadow',`${side*12}px ${24+Math.abs(q)*18}px ${45+Math.abs(q)*16}px #42200e24`);
    });
    const ap=progress(metrics.approach);const activeCard=clamp(Math.floor(ap*3),0,2);
    metrics.cards.forEach((r,i)=>{const local=clamp(ap*3-i),light=i===activeCard?1:.12;
      set(disciplines[i],'--card-outline',String(light*.6));set(disciplines[i],'--card-light',String(light));set(disciplines[i],'--scan-y',`${mix(-35,35,local)}%`);set(disciplines[i],'--design-scale',String(mix(.86,1,local)));set(disciplines[i],'--build-cut',`${(1-local)*100}%`);
    });
    const pp=progress(metrics.process);trace.setAttribute('stroke-dashoffset',String(1-pp));
    metrics.steps.forEach((r,i)=>{const p=clamp(pp*4-i),near=1-clamp(Math.abs(pp*4-(i+.5))),light=Math.max(near,p*.12);
      set(steps[i],'--step-ry',`${(1-ease(p))*(i%2?8:-8)*(mobile?.4:1)}deg`);set(steps[i],'--step-y',`${(1-ease(p))*16}px`);set(steps[i],'--step-light',String(light*.6));set(steps[i],'--step-shadow',String(light*.07));set(steps[i],'--marker-scale',String(1+near*.08));
    });
    const ab=progress(metrics.about);set(about,'--about-x',`${ab*100}%`);set(about,'--about-light',String(Math.sin(ab*Math.PI)));
    const cp=progress(metrics.cta);set(cta,'--cta-light-x',`${mix(100,12,cp)}%`);set(cta,'--cta-light',String(Math.sin(cp*Math.PI)*.1));set(cta,'--cta-glow',String(ease(cp*1.7)));
  }
  function pointer(e){px=clamp(e.clientX/innerWidth)*2-1;py=clamp(e.clientY/innerHeight)*2-1;dirty=true;}
  const ro=new ResizeObserver(measure);sections.forEach(s=>ro.observe(s));addEventListener('resize',measure,{passive:true});addEventListener('pointermove',pointer,{passive:true});measure();raf=requestAnimationFrame(tick);
  return{hero,measure,dispose(){disposed=true;cancelAnimationFrame(raf);ro.disconnect();removeEventListener('resize',measure);removeEventListener('pointermove',pointer);additions.forEach(e=>e.remove());modified.forEach(([e,c])=>e.classList.remove(c));disciplines.forEach(e=>delete e.dataset.sceneKind);for(const [e,names]of props)for(const n of names)e.style.removeProperty(n);}};
}
new MutationObserver(m=>{if(m.some(r=>r.type==='childList'&&r.target.closest?.('#main')))schedule();}).observe(document.documentElement,{childList:true,subtree:true});
reduced.addEventListener('change',()=>{current?.dispose();current=null;schedule();});document.fonts?.ready.then(schedule);addEventListener('pageshow',schedule);schedule();
})();

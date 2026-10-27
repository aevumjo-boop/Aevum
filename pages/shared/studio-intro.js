(function(){
/* A short brand greeting, independent of network readiness: content is already rendered underneath. */
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
if((document.body.dataset.page==='home'||document.querySelector('#main > .studio-hero'))&&!reduce.matches){
 const root=document.documentElement;
 const intro=document.createElement('div');intro.id='aevum-studio-intro';intro.setAttribute('role','dialog');intro.setAttribute('aria-modal','true');intro.setAttribute('aria-label','Aevum welcome');
 const rtl=root.dir==='rtl';
 // Match the hero's six broad, rounded asterisk arms, including extruded thickness.
 const points=[];
 for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,u=[Math.cos(a),Math.sin(a)],t=[-u[1],u[0]],w=.16;
  points.push([u[0]*1.01-t[0]*w,u[1]*1.01-t[1]*w],[u[0]*1.01+t[0]*w,u[1]*1.01+t[1]*w],[Math.cos(a+Math.PI/6)*.30,Math.sin(a+Math.PI/6)*.30]);
 }
 const rounded=points.map((p,i)=>{const prev=points[(i+17)%18],next=points[(i+1)%18],r=i%3===2?.07:.075;const toward=q=>{const d=Math.hypot(q[0]-p[0],q[1]-p[1]);return[p[0]+(q[0]-p[0])/d*r,p[1]+(q[1]-p[1])/d*r];};return{p,b:toward(prev),a:toward(next)};});
 let outline=`M${rounded[0].b.join(',')}`;for(const q of rounded)outline+=`L${q.b.join(',')}Q${q.p.join(',')} ${q.a.join(',')}`;outline+='Z';
 const starFaces=Array.from({length:18},(_,i)=>`<div class="intro-star-face" style="transform:translateZ(${i*1.6-13.6}px)"><svg viewBox="-1.13 -1.13 2.26 2.26"><defs><linearGradient id="intro-orange-${i}" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="${i===17?'#ffae83':'#c93d25'}"/><stop offset=".24" stop-color="${i===17?'#ff7753':'#e4492c'}"/><stop offset=".7" stop-color="${i===17?'#FB563A':'#b6311d'}"/><stop offset="1" stop-color="#cf3c24"/></linearGradient></defs><path d="${outline}" fill="url(#intro-orange-${i})" stroke="${i===17?'#ff9472':'#bd3722'}" stroke-width=".035" stroke-linejoin="round"/></svg></div>`).join('');
 intro.innerHTML=`<div class="intro-star" aria-hidden="true"><div class="intro-star-shadow"></div><div class="intro-star-world"><div class="intro-star-spin">${starFaces}</div></div></div><div class="intro-stage" aria-hidden="true"></div><div class="intro-greeting" aria-hidden="true"><span>Welcome to</span><img class="intro-wordmark" src="../images/logo-light.png" width="480" height="120" alt="Aevum" dir="ltr"/></div><button class="intro-skip" type="button">${rtl?'تخطّي المقدمة':'Skip intro'}</button>`;
 const stage=intro.querySelector('.intro-stage');
 const viewport=document.documentElement.clientWidth,mobile=viewport<640;
 const scale=Math.min((viewport-68)/140,(innerHeight-200)/180,3.1);
 stage.style.setProperty('--intro-scale',String(Math.max(1,scale)));
 root.classList.add('aevum-intro-active');document.body.append(intro);
 const previousFocus=document.activeElement;
 const blocked=[...document.querySelectorAll('header,#main,footer')].map(e=>({e,inert:e.inert}));blocked.forEach(({e})=>{e.inert=true;});
 intro.tabIndex=-1;intro.focus({preventScroll:true});
 let disposed=false,cloned=false,attempts=0,watcher,timer,escapeTimer,phaseTimer,walkTimer;
 const close=()=>{
  if(disposed)return;disposed=true;clearInterval(watcher);clearTimeout(timer);clearTimeout(escapeTimer);clearTimeout(phaseTimer);clearTimeout(walkTimer);
  intro.dataset.leaving='true';intro.dataset.phase='exit';
  intro.querySelector('.intro-greeting').style.opacity='0';
  if(cloned)stage.animate([
   {transform:`translate(-50%,-50%) scale(${scale})`,opacity:1},
   {transform:`translate(calc(-50% + 80vw),-50%) scale(${scale})`,opacity:1}
  ],{delay:200,duration:1200,easing:'cubic-bezier(.4,0,.65,1)',fill:'forwards'});
  intro.animate([{opacity:1},{opacity:0}],{delay:1350,duration:250,easing:'ease-out',fill:'forwards'}).onfinish=()=>{
   root.classList.remove('aevum-intro-active');blocked.forEach(({e,inert})=>{e.inert=inert;});intro.remove();
   if(previousFocus?.isConnected&&previousFocus!==document.body)previousFocus.focus({preventScroll:true});
  };
 };
 const sideArtwork=`<svg class="intro-side-robot" viewBox="0 0 100 180" aria-hidden="true"><defs><linearGradient id="side-orange" x1="0" y1="0" x2="1" y2=".7"><stop stop-color="#FFC18A"/><stop offset=".45" stop-color="#FF8852"/><stop offset="1" stop-color="#D84F2B"/></linearGradient><linearGradient id="side-cream" x2="1" y2="1"><stop stop-color="#FFF4DC"/><stop offset="1" stop-color="#D5AA81"/></linearGradient><linearGradient id="side-dark" x2="1"><stop stop-color="#44291E"/><stop offset="1" stop-color="#160F0C"/></linearGradient></defs><ellipse cx="55" cy="175" rx="28" ry="3" fill="#080403" opacity=".22"/><g class="side-far-leg"><rect x="43" y="124" width="13" height="37" rx="6" fill="#AD6943" stroke="#DD9B67"/><circle cx="49.5" cy="143" r="4" fill="#71412A"/><path d="M41 158Q49 156 58 159L66 165Q68 174 62 174H40Q36 168 41 158Z" fill="#C59B76" stroke="#E6BC91"/></g><g class="side-far-arm"><rect x="39" y="88" width="10" height="34" rx="5" fill="#B95C36"/><rect x="37" y="117" width="14" height="14" rx="5" fill="#D8B18B"/></g><path d="M40 83H62Q75 84 76 96V115Q76 129 62 131H47Q36 127 36 116V95Q36 87 40 83Z" fill="url(#side-cream)" stroke="#FFE5BF"/><path d="M37 91L30 94V113L37 117Z" fill="#8C5A3B" stroke="#BF885C"/><path d="M67 86Q78 88 79 98V114Q78 125 68 128Z" fill="#F5D7B0" stroke="#FFF0D6"/><image href="../images/aevum-bot-emblem-v2.png" width="30" height="30" transform="matrix(.32,0,.03,.82,72,94)" preserveAspectRatio="xMidYMid meet"/><g class="side-near-leg"><rect x="54" y="127" width="14" height="35" rx="6" fill="url(#side-orange)" stroke="#FFD1A1"/><circle cx="61" cy="145" r="4" fill="#965333"/><path d="M52 159Q61 157 70 160L80 165Q82 174 76 175H53Q48 170 52 159Z" fill="url(#side-cream)" stroke="#FFE8C5"/><path d="M53 175H77" stroke="#A56D48" stroke-width="2"/></g><g class="intro-side-head"><rect x="54" y="4" width="4" height="17" rx="2" fill="#DB9460"/><circle cx="56" cy="5" r="5.5" fill="url(#side-orange)"/><path d="M44 16Q25 17 24 38V58Q24 78 44 79L65 77Q82 75 84 58V35Q82 17 64 16Z" fill="url(#side-orange)" stroke="#FFD4A6" stroke-width="1"/><path d="M67 20Q82 22 85 38V57Q84 72 70 75L65 69Q75 65 76 55V38Q76 28 66 26Z" fill="#F56A3C" stroke="#FFAF7D"/><path d="M76 29Q87 31 88 41V55Q88 65 78 68L74 61V36Z" fill="url(#side-dark)" stroke="#D58A57"/><ellipse cx="82.5" cy="45" rx="2" ry="5" fill="#FFE0A7"/><path d="M80 56Q82 59 85 56" fill="none" stroke="#F8AA75" stroke-width="1.3" stroke-linecap="round"/><rect x="38" y="39" width="18" height="22" rx="8" fill="#C85F35" stroke="#FCA76D"/><rect x="41" y="42" width="11" height="15" rx="5" fill="url(#side-orange)"/><path d="M40 23L60 22" stroke="#FFE4BB" stroke-width="2" opacity=".65" stroke-linecap="round"/></g><g class="side-near-arm"><rect x="52" y="88" width="13" height="35" rx="6" fill="url(#side-orange)" stroke="#FFC38C"/><circle cx="58.5" cy="112" r="3.3" fill="#A65C37"/><rect x="50" y="119" width="17" height="16" rx="6" fill="url(#side-cream)" stroke="#FFE2B8"/></g></svg>`;
 const clone=()=>{
  const robot=document.querySelector('#aevum-page-walker .walker-actor');
  if(robot){const arabic=root.dir==='rtl';intro.querySelector('.intro-skip').textContent=arabic?'تخطّي المقدمة':'Skip intro';const body=robot.cloneNode(true);body.removeAttribute('style');const facing=document.createElement('div');facing.className='intro-facing';facing.innerHTML=sideArtwork;facing.append(body);stage.append(facing);intro.dataset.ready='true';intro.dataset.phase='enter';walkTimer=setTimeout(()=>{intro.dataset.phase='walking';},600);phaseTimer=setTimeout(()=>{intro.dataset.phase='hello';},1900);cloned=true;clearInterval(watcher);timer=setTimeout(close,3650);}
  else if(++attempts>16){clearInterval(watcher);close();}
 };
 watcher=setInterval(clone,60);clone();escapeTimer=setTimeout(close,6200);
 intro.querySelector('.intro-skip').addEventListener('click',close);
 intro.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){e.preventDefault();intro.querySelector('.intro-skip').focus();}});
 reduce.addEventListener('change',close,{once:true});
}
})();

// ===== Clan Iburi (c26, préfixe ib_) : le corps de fumée (façon Iburi Ensui) =====
// Identité : l'insaisissable qui étouffe. Trait « Fumée vivante » : régulièrement, le coup qui le touche le traverse (dégâts ÷2, intangible 0,4 s).
// Bouffée (petit nuage qui ralentit), Nuage étouffant (zone qui réduit au silence qui s'y attarde), Forme de fumée (intangible, traverse les ennemis),
// Étreinte de fumée (main qui attire et étouffe), Brume suffocante (ultime : la brume suit le lanceur). Dash : volute.
gkPal('ib_smoke','#f4f0ec','#c0b8b0','#5a524c','#24201c');
const IBC=GK.ib_smoke,IB_CD=9,IB_PH=.4,IB_TH=6; // trait : recharge, intangibilité, coup minimum
const IB_D={
 puff:'Une bouffée de fumée épaisse (440) : 14 dégâts ; elle laisse un petit nuage 1,5 s qui ralentit',
 cloud:'Nuage étouffant au point visé (420 max, rayon 100), 3 s : 4 dégâts toutes les 0,5 s et ralentit ; qui y reste 1,5 s est réduit au silence 0,8 s',
 body:'Forme de fumée : ton corps se dissout 1,2 s (intangible, plus rapide) ; chaque ennemi que tu traverses prend 10 dégâts et est ralenti 1 s',
 grab:'Une main de fumée saisit le premier ennemi touché (460) et l\'attire à toi : 24 dégâts, silence 1 s, puis la fumée l\'étouffe (4 dégâts par seconde, 2 s)',
 mist:'Brume suffocante : une épaisse brume te suit 5 s (rayon 170) : les ennemis dedans sont ralentis, prennent 6 dégâts et perdent 2 chakra toutes les 0,5 s ; tu y subis 25 % de dégâts en moins',
 dash:'Volute : tu files en fumée (220) à travers les ennemis ; ta traînée reste 2 s et ralentit'};
KIT('c26',[
 ['D','x.ib_puff','Iburi : Bouffée',IB_D.puff,'ib_smoke'],
 ['C','x.ib_cloud','Iburi : Nuage étouffant',IB_D.cloud,'ib_smoke'],
 ['B','x.ib_body','Iburi : Forme de fumée',IB_D.body,'ib_smoke'],
 ['A','x.ib_grab','Iburi : Étreinte de fumée',IB_D.grab,'ib_smoke'],
 ['S','x.ib_mist','Iburi : Brume suffocante',IB_D.mist,'ib_smoke'],
]);
DASHC[26]={src:'x.ib_dash',n:'Volute',d:IB_D.dash,vfx:'ib_smoke',cd:6};
Object.assign(NAT,{
 // ---------- Bouffée (D) ----------
 ib_puff:SP('Iburi : Bouffée',IB_D.puff,5,{ai:RG(430,.75),line:{len:440,w:34}},(u,a)=>{gkS('poof',u);gkS('wind',u);anim(u,'breath',.4);
  ibMouth(u,a,.8);proj(u,a,{spd:620,r:13,dmg:14,life:.71,col:IBC.b,kind:'ib_puff',vfx:'ib_smoke',onHit:(p,t)=>{const o=p.owner;if(o){gkPool(o,t.x,t.y,{r:55,t:1.5,kind:'ib',vfx:'ib_smoke',sl:1});ibPuffFx(o,t.x,t.y,55,.8)}}})}),
 // ---------- Nuage étouffant (C) ----------
 ib_cloud:SP('Iburi : Nuage étouffant',IB_D.cloud,9,{ai:RG(420,.65),tele:{r:100,max:420}},(u,a,td)=>{const c=atP(u,a,td,420);gkS('poof',u);gkS('wind',u);anim(u,'breath',.55);
  gkPool(u,c.x,c.y,{r:100,t:3,kind:'ib',vfx:'ib_smoke',d:4,iv:.5,sl:1,cnt:new Map(),fn:(e,x)=>{const n=(x.cnt.get(e)||0)+1;x.cnt.set(e,n);if(n===3&&!e.dead){if(e.unstop<=0){e.silence=Math.max(e.silence,.8);say(e,'ÉTOUFFÉ','#d8d0c8')}}}});
  jx({jfx:'gk_boom',x:c.x,y:c.y,r:100,v:'ib_smoke',s:'steam',t:.6,m:.6});ibMouth(u,a,1);ibPuffFx(u,c.x,c.y,100,1)}),
 // ---------- Forme de fumée (B) : intangible, traverse et blesse ----------
 ib_body:SP('Iburi : Forme de fumée',IB_D.body,11,{ai:ESC},(u)=>{gkS('poof',u);gkS('wind',u);anim(u,'swirl',.5);u.phase=Math.max(u.phase||0,1.2);u.haste=Math.max(u.haste||0,1.2);u.ib_f=1.2;
  aux.push({type:'ib_body',x:u.x,y:u.y,r:0,t:1.2,m:1.2,team:u.team,owner:u,ui:gkI(u),hs:new Set(),k:0});ibPuffFx(u,u.x,u.y,40,.7);fxWind(u.x,u.y,0,{u,spin:1,w:34,n:6,col:'#f4f0ec',t:.6})}),
 // ---------- Étreinte de fumée (A) : grappin qui attire et étouffe ----------
 ib_grab:SP('Iburi : Étreinte de fumée',IB_D.grab,12,{ai:RG(450,.6),line:{len:460,w:30}},(u,a)=>{gkS('poof',u);gkS('shadow',u);anim(u,'palm',.5);
  ibMouth(u,a,.9);proj(u,a,{spd:900,r:14,dmg:24,life:.51,col:IBC.b,kind:'ib_hand',vfx:'ib_smoke',hook:1,o:{silence:1,dot:{dps:4,dur:2},unblockable:1},onHit:(p,t)=>{jx({jfx:'ib_choke',ti:gkI(t),x:t.x,y:t.y,t:1.6,m:1.6});ibPuffFx(p.owner,t.x,t.y,40,.8);fxRing(t.x,t.y,{u:p.owner,r0:44,r1:10,col:IBC.a,w:4,t:.35});fxHitStop(p.owner,t,24)}})}),
 // ---------- Brume suffocante (S) : la brume suit le lanceur ----------
 ib_mist:ULT('Iburi : Brume suffocante',IB_D.mist,{ai:SELF(200,.8),tele:{self:1,r:170}},(u)=>{gkS('poof',u);gkS('wind',u);gkS('roar',u);anim(u,'swirl',.8);u.ib_m=5;
  aux.push({type:'ib_mist',x:u.x,y:u.y,r:170,t:5,m:5,team:u.team,owner:u,ui:gkI(u),vfx:'ib_smoke',k:.3,danger:1});jx({jfx:'gk_boom',x:u.x,y:u.y,r:170,v:'ib_smoke',s:'steam',t:.8,m:.8});
  ibPuffFx(u,u.x,u.y,170,1.6);fxWind(u.x,u.y,0,{u,spin:1,w:150,n:12,col:'#f4f0ec',t:.9});fxRing(u.x,u.y,{u,r0:30,r1:170,col:IBC.a,c2:'#ffffff',w:7,t:.5});fxShake(.25,u.x,u.y)}),
 // ---------- dash : Volute ----------
 ib_dash:SP('Volute',IB_D.dash,6,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||220,110,220);gkS('poof',u);gkS('dash',u);anim(u,'lunge',.3);u.phase=Math.max(u.phase||0,.22);
  const ex=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r),ey=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);gkStrip(u,x0,y0,ex,ey,{w:54,t:2,kind:'ib',vfx:'ib_smoke',sl:1});dash(u,a,d,.22,{through:1});
  fxSmoke(x0,y0,{u,col:IBC.a,n:5,r:20,s:14,al:.28,rise:30});fxWind((x0+ex)/2,(y0+ey)/2,a,{u,len:d,w:40,n:6,col:'#f4f0ec',t:.35})}),
});
Object.assign(NATHERO,{ib:'kylo'});
// ---- VFX (boîte à outils nr_fx.js) : bouffées de fumée (opacité ≤ 0,3 : la fumée ne cache jamais un ninja)
function ibMouth(u,a,s){const x=u.x+Math.cos(a)*18,y=u.y+Math.sin(a)*18;fxSmoke(x,y,{u,col:IBC.a,n:4*s,r:10,s:10,al:.3,z:44,rise:16,dx:Math.cos(a)*50,dy:Math.sin(a)*50,t:.7})}
function ibPuffFx(u,x,y,r,s){fxSmoke(x,y,{u,col:IBC.a,n:5*s,r:r*.8,s:12+r*.06,al:.26,rise:24,t:1.1});fxSmoke(x,y,{u,col:IBC.c,n:3*s,r:r*.5,s:10+r*.05,al:.18,rise:10,t:1.3});fxRing(x,y,{u,r0:r*.3,r1:r,col:IBC.b,w:4,t:.35,al:.6})}
// forme de fumée : chaque ennemi traversé une fois
AUXF.ib_body=(x,dt)=>{const o=x.owner;if(x.t<=0||!o||o.dead){x.t=0;return}x.x=o.x;x.y=o.y;
 for(const e of enemies(o)){if(x.hs.has(e)||Math.hypot(e.x-o.x,e.y-o.y)>e.r+o.r+10)continue;x.hs.add(e);const V=VFX;VFX='ib_smoke';const ph=o.phase;o.phase=0;gkHit(e,o,10,{slow:1,unblockable:1},'ib_smoke');o.phase=ph;VFX=V;if(near(e.x,e.y))sparks(e.x,e.y,IBC.a,8,'smoke')}
 if((x.k-=dt)<=0){x.k=.06;if(near(o.x,o.y))fx.push({x:o.x+(rnd()-.5)*20,y:o.y+(rnd()-.5)*20,z:20+rnd()*30,vx:(rnd()-.5)*30,vy:(rnd()-.5)*30,t:.6,m:.6,col:IBC.b,r:6+rnd()*5,vfx:'smoke'})}};
AUXD.ib_body=()=>{};
// brume : suit le lanceur ; ralentit ; toutes les 0,5 s : 6 dégâts, −2 chakra
AUXF.ib_mist=(x,dt)=>{const o=x.owner;if(x.done)return;if(!o||o.dead||x.t<=0){x.done=1;x.t=0;if(o)o.ib_m=0;return}x.x=o.x;x.y=o.y;
 for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.3);
 if(x.k<=0){x.k=.5;for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)&&gkHit(e,o,6,{silent:1},'ib_smoke'))e.energy=Math.max(0,(e.energy||0)-2);if(near(x.x,x.y))gkS('wind',o)}};
AUXD.ib_mist=(x,k,t)=>{GKPOOL.ib({x:x.x,y:x.y,r:x.r,t:x.t,m:x.m,big:1,owner:x.owner,team:x.team},Math.min(1,x.t/.5,(x.m-x.t)/.3+.2),t)};
// ---- trait : Fumée vivante
TRAITS[26]={nom:'Fumée vivante',desc:'Toutes les 9 s, le premier vrai coup qui te touche te traverse : ton corps se dissipe en fumée (dégâts ÷ 2) et tu es intangible 0,4 s. Dans ta Brume suffocante, tu subis 25 % de dégâts en moins',
 update(u,dt){if(u.ib_cds!==u.cds){u.ib_cds=u.cds;u.ib_cd=0;u.ib_m=0;u.ib_f=0}if(u.ib_cd>0)u.ib_cd=Math.max(0,u.ib_cd-dt);if(u.ib_m>0)u.ib_m=Math.max(0,u.ib_m-dt);if(u.ib_f>0)u.ib_f=Math.max(0,u.ib_f-dt)},
 take(t,src,dmg,o){if(!src||src===t||src.team===t.team||!(dmg>0))return dmg;if(t.ib_m>0)dmg*=.75;
  if(!(t.ib_cd>0)&&dmg>=IB_TH&&!o.silent&&!o.dot){t.ib_cd=IB_CD;dmg*=.5;t.phase=Math.max(t.phase||0,IB_PH);say(t,'FUMÉE','#e8e4e0');jx({jfx:'gk_boom',x:t.x,y:t.y,r:50,v:'ib_smoke',s:'steam',t:.5,m:.5});if(near(t.x,t.y))gkS('poof',t)}
  return dmg},
 draw(u,p,S,sk){const t=performance.now()/1000,rd=!(u.ib_cd>0),f=u.ib_f>0;sk=sk||1;g.save();const n=f?9:rd?5:2;
  for(let i=0;i<n;i++){const h=((t*24+i*17)%60)*S,b=t*.8+i*1.9,x=p.x+Math.sin(b)*14*S*sk,y=p.y-6*S-h;g.globalAlpha=(1-h/(60*S))*(f?.7:.45);g.fillStyle=i%2?IBC.a:IBC.b;g.beginPath();g.arc(x,y,(5+h/(10*S))*S,0,7);g.fill()}
  if(f){g.globalAlpha=.32;g.fillStyle=IBC.b;g.beginPath();g.ellipse(p.x,p.y-32*S*sk,18*S*sk,34*S*sk,0,0,7);g.fill()}g.restore()},
 prev(u,p,S,front){if(front)TRAITS[26].draw(Object.assign({},u,{ib_cd:0,ib_f:0}),p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Fumée vivante · '+(u.ib_cd>0?'reforme '+Math.ceil(u.ib_cd)+' s':'PRÊTE'),null,0,u.ib_cd>0?'#a8a098':'#f4f0ec','#a8a098')}};
AFTER.push(()=>UK.push('ib_cd','ib_m','ib_f'));
// ---- apparence : yeux gris fumée
CLOOK[26]=(look)=>{look.head.eye=look.head.eye||'#8a7a6a';if(look.weapon)look.weapon.col='#d8d4d0'};
// ---- visuels
// nuage de fumée au sol : volutes grises qui roulent sur elles-mêmes
GKPOOL.ib=(x,k,t)=>{fxAlpha(fxA(x),()=>ibPoolD(x,k,t));if(x.strip)return;const q=P(x.x,x.y,0);g.save();g.strokeStyle=rgba('#f4f0ec',.6*k);g.lineWidth=1.6*q.s;g.setLineDash([8,6]);g.lineDashOffset=-t*12;g.beginPath();g.ellipse(q.x,q.y,x.r*q.s,x.r*q.s*K,0,0,7);g.stroke();g.restore()}; // bord net, volutes atténuées (ennemi)
function ibPoolD(x,k,t){const q=P(x.x,x.y,0),s=q.s,R=x.r,n=x.strip?3:Math.max(7,Math.round(R/11));g.save();g.fillStyle=rgba(IBC.c,.22*k);g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,0,7);g.fill();
 for(let i=0;i<n;i++){const b=i*2.39+t*.25*(i%2?1:-1)+(x.i||0),d=R*((i*.37)%1)*.8,c=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.85,8+(i%4)*7+Math.sin(t*1.5+i)*4),r=(R*(x.big?.2:.3)+(i%3)*5)*c.s;
  g.fillStyle=rgba(i%3?IBC.b:IBC.a,(x.big?.17:.26)*(1+.25*(i%2))*k);g.beginPath();g.arc(c.x,c.y,r,0,7);g.fill()}
 if(x.big){g.strokeStyle=rgba(IBC.a,.3*k);g.lineWidth=2;gEll(x.x,x.y,R);g.stroke()}g.restore()}
// bouffée : boule de fumée qui roule, traînée de volutes
PROJD.ib_puff=(p,R,ra,t)=>{g.rotate(ra);for(let i=4;i>=0;i--){const x=-i*R*.7,r=R*(1-i*.14);g.fillStyle=rgba(i%2?IBC.b:IBC.a,.8-i*.12);g.beginPath();g.arc(x,Math.sin(t/90+i)*3,r,0,7);g.fill()}
 g.fillStyle=rgba(IBC.c,.35);g.beginPath();g.arc(R*.25,R*.3,R*.5,0,7);g.fill()};
// main de fumée : doigts griffus au bout d'un bras de volutes
PROJD.ib_hand=(p,R,ra,t)=>{g.rotate(ra);g.fillStyle=rgba(IBC.b,.7);for(let i=1;i<6;i++){g.beginPath();g.arc(-i*R*.8,Math.sin(t/80+i)*3,R*.6,0,7);g.fill()}
 g.fillStyle=IBC.a;g.strokeStyle=IBC.c;g.lineWidth=1;g.beginPath();g.arc(0,0,R*.75,0,7);g.fill();g.stroke();
 for(let i=-2;i<=2;i++){const b=i*.38;g.beginPath();g.moveTo(Math.cos(b)*R*.6,Math.sin(b)*R*.6);g.quadraticCurveTo(Math.cos(b)*R*1.4,Math.sin(b)*R*1.6,Math.cos(b*1.3)*R*1.7,Math.sin(b*1.3)*R*1.1);g.lineWidth=3.2;g.strokeStyle=IBC.a;g.stroke()}};
// la fumée serre la gorge de la cible
JFXD.ib_choke=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,54),s=q.s;g.save();g.globalAlpha=Math.min(1,k*3);g.strokeStyle=IBC.b;g.lineWidth=4*s;for(let i=0;i<2;i++){g.beginPath();g.ellipse(q.x,q.y+i*6*s,11*s,4*s,0,t*5+i,t*5+i+5);g.stroke()}
 for(let i=0;i<3;i++){const h=((t*30+i*10)%24)*s;g.fillStyle=rgba(IBC.a,.5*(1-h/(24*s)));g.beginPath();g.arc(q.x+(i-1)*8*s,q.y-h,4*s,0,7);g.fill()}g.restore()};

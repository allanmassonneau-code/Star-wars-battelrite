// ===== Clan Senju (c23, préfixe sj_) : Mokuton, le bois (façon Hashirama) =====
// Identité : le colosse qui repousse toujours. Trait « Vitalité Senju » : régénération dès qu'on le laisse souffler et force brute des coups de base.
// Mokuton : pieux qui jaillissent en ligne, racines qui entravent, mur de bois qui arrête tirs et ninjas, forêt qui naît (Jukai Kôtan),
// dragon de bois qui enserre et absorbe le chakra (Mokuryû). Dash : un tronc qui jaillit et te projette.
// Outils partagés : kits/kg_common.js (gkPal, gkHit, gkAoe, gkPool, GKPOOL, gk_boom…), chargé avant ce fichier.
gkPal('sj_wood','#f0d8a0','#a8783a','#5a3a1a','#2a1808');
const SJC=GK.sj_wood,SJL='#6ac04a',SJL2='#3a8a2a';
const SJ_D={
 stakes:'Des pieux de bois jaillissent du sol en ligne devant toi (380) : 16 dégâts et ralentit 1 s',
 roots:'Des racines surgissent au point visé (420 max) après 0,6 s : 14 dégâts et entrave 1,1 s',
 wall:'Un mur de bois courbe se dresse devant toi 3,5 s : il arrête les tirs et les ninjas ennemis ; tu régénères 20 PV en 2 s',
 forest:'Jukai Kôtan : une forêt naît au point visé (380 max, rayon 150) après 0,7 s : 24 dégâts et entrave 0,6 s ; 3,5 s durant, ses branches ralentissent et font 5 dégâts toutes les 0,5 s',
 dragon:'Mokuryû : un dragon de bois file en ligne (560) : 40 dégâts au premier ennemi touché, qu\'il enserre (entravé 1,4 s) et dont il absorbe 20 chakra (10 pour toi)',
 dash:'Un tronc jaillit sous tes pieds et te projette (230) ; à l\'arrivée, des racines font 6 dégâts autour de toi et ralentissent 1 s'};
KIT('c23',[ // arbre de clan : 1 jutsu par rang
 ['D','x.sj_stakes','Mokuton : Pieux de bois',SJ_D.stakes,'sj_wood'],
 ['C','x.sj_roots','Mokuton : Racines entravantes',SJ_D.roots,'sj_wood'],
 ['B','x.sj_wall','Mokuton : Mur de bois',SJ_D.wall,'sj_wood'],
 ['A','x.sj_forest','Mokuton : Jukai Kôtan',SJ_D.forest,'sj_wood'],
 ['S','x.sj_dragon','Mokuton : Mokuryû',SJ_D.dragon,'sj_wood'],
]);
DASHC[23]={src:'x.sj_dash',n:'Tronc jaillissant',d:SJ_D.dash,vfx:'sj_wood',cd:7};
const SJ_RG=.005,SJ_CALM=2.5,SJ_M1=1.1; // régénération (part des PV max / s), délai sans coup reçu, force brute des coups de base
Object.assign(NAT,{
 // ---------- Pieux de bois (D) : le front avance en 0,3 s, chaque ennemi touché une fois ----------
 sj_stakes:SP('Mokuton : Pieux de bois',SJ_D.stakes,5,{ai:RG(370,.75),line:{len:380,w:56}},(u,a)=>{gkS('rock',u);gkS('heavy',u);anim(u,'stomp',.45);
  aux.push({type:'sj_stk',x:u.x+Math.cos(a)*20,y:u.y+Math.sin(a)*20,a,len:380,w:56,r:0,t:1.5,m:1.5,team:u.team,owner:u,vfx:'sj_wood',k:0,hs:new Set()});
  fxRing(u.x,u.y,{u,r0:8,r1:46,col:SJC.b,w:5,t:.3});fxDebris(u.x,u.y,{u,n:4,sp:90,col:SJC.b,c2:SJC.c,s:3});sjLine(u,u.x+Math.cos(a)*20,u.y+Math.sin(a)*20,a,380,56)}),
 // ---------- Racines entravantes (C) ----------
 sj_roots:SP('Mokuton : Racines entravantes',SJ_D.roots,8,{ai:RG(420,.65),tele:{r:80,max:420}},(u,a,td)=>{const c=atP(u,a,td,420),D=.6;gkS('rock',u);anim(u,'pray',.55);jx({jfx:'sj_sprout',x:c.x,y:c.y,r:80,t:D,m:D});
  fxCast(u,'mokuton',D,{n:8});fxGlyph(c.x,c.y,SJL,{u,r:80,t:D+.1,al:.45});
  later(u,D,()=>{gkAoe(u,c.x,c.y,80,14,{root:1.1},'sj_wood',e=>{jx({jfx:'sj_bind',ti:gkI(e),x:e.x,y:e.y,t:1.1,m:1.1});sjHitFx(u,e,.7)});jx({jfx:'sj_roots',x:c.x,y:c.y,r:80,t:1.2,m:1.2});sjErupt(u,c.x,c.y,80,1);if(near(c.x,c.y)){gkS('rock',u);gkS('heavy',u)}},{x:c.x,y:c.y,r:80})}),
 // ---------- Mur de bois (B) : arc de troncs (murs du moteur : bloquent tirs et ninjas ennemis), régénération 2 s ----------
 sj_wall:SP('Mokuton : Mur de bois',SJ_D.wall,11,{ai:DEF},(u,a)=>{gkS('rock',u);gkS('heavy',u);anim(u,'pray',.5);const R=78;
  for(let i=-3;i<=3;i++){const b=a+i*.24;walls.push({x:clamp(u.x+Math.cos(b)*R,B.x+10,B.x+B.w-10),y:clamp(u.y+Math.sin(b)*R,B.y+10,B.y+B.h-10),r:16,t:3.5,team:u.team,owner:u,vfx:'sj_wood'})}
  u.sj_hot=2;jx({jfx:'gk_boom',x:u.x+Math.cos(a)*R,y:u.y+Math.sin(a)*R,r:70,v:'sj_wood',s:'dust',t:.5,m:.5});
  for(const i of[-3,0,3]){const b=a+i*.24,x=u.x+Math.cos(b)*R,y=u.y+Math.sin(b)*R;fxDebris(x,y,{u,n:4,sp:110,col:SJC.b,c2:SJC.c,s:3.5});fxSmoke(x,y,{u,col:'#9a8268',n:3,r:20,s:12,al:.22,rise:24});fxDecal(x,y,'crack',{u,r:30,t:3.5})}
  fxBurst(u.x+Math.cos(a)*R,u.y+Math.sin(a)*R,SJL,{u,n:10,sp:140,sh:'petal',w:2.4,gr:60,up:80,add:0,c2:SJL2,arc:2.4,a});fxGlyph(u.x,u.y,'#a8e88a',{ui:gkI(u),u,r:40,t:2,al:.35});if(near(u.x,u.y))shake=Math.max(shake,.15)}),
 // ---------- Jukai Kôtan (A) : la forêt pousse, entrave, puis ses branches ralentissent et blessent ----------
 sj_forest:SP('Mokuton : Jukai Kôtan',SJ_D.forest,13,{ai:RG(380,.65),tele:{r:150,max:380}},(u,a,td)=>{const c=atP(u,a,td,380),D=.7;gkS('rock',u);gkS('roar',u);anim(u,'gk_call',.9);jx({jfx:'sj_sprout',x:c.x,y:c.y,r:150,big:1,t:D,m:D});fxCast(u,'mokuton',D,{glyph:1,n:12});fxEmbers(c.x,c.y,140,SJL,{u,n:10,h:40,t:D,c2:'#e8ffb0'});
  later(u,D,()=>{gkAoe(u,c.x,c.y,150,24,{root:.6},'sj_wood',e=>sjHitFx(u,e,.9));sjErupt(u,c.x,c.y,150,2);gkPool(u,c.x,c.y,{r:150,t:3.5,kind:'sj',vfx:'sj_wood',d:5,iv:.5,sl:1});jx({jfx:'gk_boom',x:c.x,y:c.y,r:170,v:'sj_wood',s:'dust',t:.6,m:.6});
   if(near(c.x,c.y)){gkS('rock',u);gkS('boom',u);shake=Math.max(shake,.35)}},{x:c.x,y:c.y,r:150})}),
 // ---------- Mokuryû (S) : dragon de bois, s'arrête sur le premier ennemi (entravé, chakra absorbé) ----------
 sj_dragon:ULT('Mokuton : Mokuryû',SJ_D.dragon,{ai:RG(540,.8),line:{len:560,w:52}},(u,a)=>{gkS('roar',u);gkS('rock',u);anim(u,'pray',.8);jx({jfx:'gk_boom',x:u.x+Math.cos(a)*40,y:u.y+Math.sin(a)*40,r:60,v:'sj_wood',s:'dust',t:.5,m:.5});
  {const x=u.x+Math.cos(a)*40,y=u.y+Math.sin(a)*40;fxDebris(x,y,{u,n:12,sp:200,col:SJC.b,c2:SJC.c,s:5});fxSmoke(x,y,{u,col:'#9a8268',n:7,r:40,s:16,al:.26,rise:40,t:1.2});fxDecal(x,y,'crack',{u,r:60,t:4.5});fxRing(x,y,{u,r0:10,r1:70,col:SJC.b,w:7,t:.4});fxBurst(x,y,SJL,{u,n:14,sp:220,sh:'petal',w:2.6,up:140,gr:120,add:0,c2:SJL2})}
  proj(u,a,{spd:640,r:22,dmg:40,life:.875,col:SJC.b,kind:'sj_dragon',vfx:'sj_wood',o:{root:1.4,unblockable:1},onHit:(p,t)=>{const o=p.owner;sjHitFx(o,t,1.6);fxRing(t.x,t.y,{u:o,r0:14,r1:84,col:SJC.b,c2:'#e8ffb0',w:8,t:.45});fxBurst(t.x,t.y,SJL,{u:o,n:18,sp:260,sh:'petal',w:2.8,up:160,gr:110,add:0,c2:SJL2});fxLight(t.x,t.y,150,'#a8e88a',{u:o,t:.5,a:.4});fxHitStop(o,t,40,1);fxShake(.3,t.x,t.y);const d=Math.min(20,t.energy||0);t.energy=Math.max(0,(t.energy||0)-20);if(o&&!o.dead)o.energy=Math.min(100,(o.energy||0)+Math.min(10,d));
   say(t,'ENSERRÉ','#c8a060');jx({jfx:'sj_bind',ti:gkI(t),x:t.x,y:t.y,big:1,t:1.4,m:1.4});if(near(t.x,t.y)){gkS('heavy',t);shake=Math.max(shake,.3)}}})}),
 // ---------- dash : Tronc jaillissant (saut) ----------
 sj_dash:SP('Tronc jaillissant',SJ_D.dash,7,{ai:ESC},(u,a,td)=>{const d=clamp(td||230,120,230),x0=u.x,y0=u.y;gkS('rock',u);gkS('dash',u);anim(u,'leap',.4);jx({jfx:'sj_trunk',x:x0,y:y0,t:.6,m:.6});fxDebris(x0,y0,{u,n:6,sp:130,col:SJC.b,c2:SJC.c,s:3.5});fxSmoke(x0,y0,{u,col:'#9a8268',n:4,r:22,s:12,al:.22});fxDecal(x0,y0,'crack',{u,r:34,t:3});
  dash(u,a,d,.34,{jump:1,end:()=>{if(u.dead)return;gkAoe(u,u.x,u.y,80,6,{slow:1},'sj_wood');jx({jfx:'sj_roots',x:u.x,y:u.y,r:80,t:.8,m:.8});sjErupt(u,u.x,u.y,80,0);if(near(u.x,u.y))gkS('rock',u)}})}),
});
Object.assign(NATHERO,{sj:'kylo'});
// ---- VFX (boîte à outils nr_fx.js) : éclats de bois, feuilles, poussière, traces au sol (décor atténué selon l'intensité / le camp)
// impact du bois sur un ninja (s = taille)
function sjHitFx(o,e,s){if(!e||!near(e.x,e.y))return;fxFlare(e.x,e.y,'#e8d8a0',{u:o,z:30,r:18*s,t:.18});fxDebris(e.x,e.y,{u:o,n:4*s,sp:150*s,col:SJC.b,c2:SJC.c,s:3*s});fxBurst(e.x,e.y,SJL,{u:o,n:5*s,sp:150,sh:'petal',w:2.2,up:90,gr:100,add:0,c2:SJL2})}
// éruption du bois au sol : onde = rayon exact du coup, éclats, feuilles, fissures (big : 0 dash, 1 racines, 2 forêt)
function sjErupt(u,x,y,r,big){fxRing(x,y,{u,r0:r*.2,r1:r,col:SJC.b,c2:'#e8ffb0',w:4+big*2,t:.4});fxDebris(x,y,{u,n:5+big*4,sp:120+big*50,col:SJC.b,c2:SJC.c,s:3.5+big});fxSmoke(x,y,{u,col:'#9a8268',n:4+big*3,r:r*.6,s:12+big*3,al:.22,rise:26,t:1.1});
 fxDecal(x,y,'crack',{u,r:r*.8,t:4});fxDecal(x,y,'leaf',{u,r:r*.85,t:3.5+big});fxBurst(x,y,SJL,{u,n:6+big*6,sp:150+big*40,sh:'petal',w:2.4,up:110,gr:90,add:0,c2:SJL2});if(big)fxLight(x,y,r*1.1,'#a8e88a',{u,t:.4,a:.3})}
// pieux : poussière et fissures qui courent le long de la ligne (au rythme du front : 0,3 s), largeur = hitbox
function sjLine(u,x,y,a,len,w){const ca=Math.cos(a),sa=Math.sin(a);for(let i=0;i<4;i++)later(u,.3*(i+.5)/4,()=>{const f=len*(i+.5)/4,px=x+ca*f,py=y+sa*f;fxDebris(px,py,{u,n:3,sp:100,col:SJC.b,c2:SJC.c,s:3});fxSmoke(px,py,{u,col:'#9a8268',n:2,r:w*.4,s:11,al:.2,rise:22});fxDecal(px,py,'crack',{u,r:w*.5,t:3})})}
// pieux : le front avance (0,3 s pour toute la ligne)
AUXF.sj_stk=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;const el=x.m-x.t,front=Math.min(x.len,el/.3*x.len),ca=Math.cos(x.a),sa=Math.sin(x.a);
 for(const e of enemies(o)){if(x.hs.has(e))continue;const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=Math.abs(-dx*sa+dy*ca);if(f<-e.r||f>front+e.r||s>x.w/2+e.r)continue;
  x.hs.add(e);if(gkHit(e,o,16,{slow:1,unblockable:1},'sj_wood')&&near(e.x,e.y)){sjHitFx(o,e,.8);gkS('rock',e)}}};
AUXD.sj_stk=(x,k,t)=>{const el0=x.m-x.t;if(el0>.32)return fxAlpha(fxA(x),()=>sjStkD(x,k,t));sjStkD(x,k,t)}; // front : net ; pieux plantés : décor atténué (ennemi)
function sjStkD(x,k,t){const el=x.m-x.t,front=Math.min(x.len,el/.3*x.len),ca=Math.cos(x.a),sa=Math.sin(x.a),n=Math.round(x.len/26),fade=Math.min(1,x.t/.35);
 for(let i=0;i<n;i++){const f=(i+.5)/n*x.len;if(f>front)break;const s=((i*37)%3-1)*x.w*.28,gr=Math.min(1,(front-f)/45),h=(34+((i*13)%5)*7)*gr*(.35+.65*fade);
  sjSpike(x.x+ca*f-sa*s,x.y+sa*f+ca*s,h,7+(i%3),Math.min(1,fade*1.5),((i%2)-.5)*6)}
 if(front<x.len){const q=P(x.x+ca*front,x.y+sa*front,4);fxGlowS(q.x,q.y,x.w*.7*q.s,'#e8c870',.35,x.w*.7*q.s*K);g.fillStyle=rgba(SJC.c,.5);for(let i=0;i<5;i++)g.fillRect(q.x+Math.sin(t*20+i*2)*10*q.s,q.y-((t*80+i*9)%14)*q.s,3*q.s,3*q.s)}}
// pieu de bois effilé (base au sol, pointe en hauteur, légère inclinaison)
function sjSpike(x,y,h,w,al,lean){if(h<2)return;const b=P(x,y,0),tp=P(x+(lean||0),y,h),s=b.s;g.save();g.globalAlpha*=al;g.lineJoin='round';
 g.fillStyle=SJC.c;g.strokeStyle=SJC.d;g.lineWidth=1;g.beginPath();g.moveTo(b.x-w*s,b.y);g.lineTo(tp.x,tp.y);g.lineTo(b.x+w*s,b.y);g.closePath();g.fill();g.stroke();
 g.fillStyle=SJC.b;g.beginPath();g.moveTo(b.x-w*.15*s,b.y);g.lineTo(tp.x,tp.y);g.lineTo(b.x+w*.75*s,b.y);g.closePath();g.fill();
 g.strokeStyle=rgba(SJC.d,.55);g.beginPath();g.moveTo(lerp(b.x,tp.x,.25)-w*.35*s,lerp(b.y,tp.y,.25));g.lineTo(lerp(b.x,tp.x,.6)-w*.1*s,lerp(b.y,tp.y,.6));g.stroke();g.restore()}
// tronc avec feuillage (forêt, mur)
function sjTree(x,y,h,al,sway,t){const b=P(x,y,0),tp=P(x,y,h),s=b.s;g.save();g.globalAlpha*=al;g.fillStyle=SJC.c;g.strokeStyle=SJC.d;g.lineWidth=1;
 g.beginPath();g.moveTo(b.x-6*s,b.y);g.quadraticCurveTo(b.x-3*s,lerp(b.y,tp.y,.5),tp.x-2.5*s+sway,tp.y);g.lineTo(tp.x+2.5*s+sway,tp.y);g.quadraticCurveTo(b.x+3*s,lerp(b.y,tp.y,.5),b.x+6*s,b.y);g.closePath();g.fill();g.stroke();
 g.fillStyle=SJC.b;g.fillRect(b.x-1*s,tp.y,2.4*s,b.y-tp.y);
 for(const [dx,dy,r,c] of[[-9,4,11,SJL2],[9,3,10,SJL2],[0,-6,13,SJL],[-5,-1,8,'#8ad86a']]){g.fillStyle=c;g.beginPath();g.arc(tp.x+sway+dx*s,tp.y+dy*s+Math.sin(t*2+x)*s,r*s,0,7);g.fill()}g.restore()}
// forêt du Jukai Kôtan : sol de mousse et d'humus, arbres qui poussent, branches qui fouettent
GKPOOL.sj=(x,k,t)=>{fxAlpha(fxA(x),()=>sjPoolD(x,k,t));if(x.strip)return;const q=P(x.x,x.y,0);g.save();g.strokeStyle=rgba('#8ad86a',.7*k);g.lineWidth=2*q.s;g.setLineDash([10,6]);g.beginPath();g.ellipse(q.x,q.y,x.r*q.s,x.r*q.s*K,0,0,7);g.stroke();g.restore()}; // bord net, forêt atténuée (ennemi)
function sjPoolD(x,k,t){const q=P(x.x,x.y,0),s=q.s,R=x.r;g.save();const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R*s);gr.addColorStop(0,rgba('#3a5a22',.55*k));gr.addColorStop(.75,rgba('#4a3a1a',.4*k));gr.addColorStop(1,rgba('#4a3a1a',0));g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,0,7);g.fill();
 if(x.strip){g.restore();return}const grow=Math.min(1,(x.m-x.t)/.35);
 for(let i=0;i<9;i++){const b=i*2.4+.3,d=R*(.25+((i*.37)%1)*.6),px=x.x+Math.cos(b)*d,py=x.y+Math.sin(b)*d*.85;sjTree(px,py,(46+(i%3)*14)*grow,k*.72,Math.sin(t*1.5+i)*2*s,t)}
 g.strokeStyle=rgba(SJC.c,.8*k);g.lineWidth=3*s;g.lineCap='round';for(let i=0;i<4;i++){const b=t*1.3+i*1.57,a=P(x.x+Math.cos(b)*R*.3,x.y+Math.sin(b)*R*.3,30),c=P(x.x+Math.cos(b+.6)*R*.85,x.y+Math.sin(b+.6)*R*.85,12);g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+c.x)/2,a.y-14*s,c.x,c.y);g.stroke()}g.restore()}
// mur de bois (murs du moteur, vfx 'sj_wood' : WALLD, nr_vfx.js)
WALLD.sj_wood=(w,p,rx,h,t)=>{const k=Math.min(1,w.t/.4),grow=Math.min(1,(3.5-w.t)/.25+.1);sjTree(w.x,w.y,58*grow,k,0,t);g.save();g.globalAlpha=k;g.fillStyle=SJC.c;g.strokeStyle=SJC.d;g.lineWidth=1.2;
 g.beginPath();g.moveTo(p.x-rx,p.y);g.lineTo(p.x-rx*.85,p.y-h*.8*grow);g.lineTo(p.x+rx*.85,p.y-h*.75*grow);g.lineTo(p.x+rx,p.y);g.closePath();g.fill();g.stroke();
 g.strokeStyle=rgba(SJC.d,.6);for(let i=0;i<3;i++){const xx=p.x+(i-1)*rx*.5;g.beginPath();g.moveTo(xx,p.y-2);g.quadraticCurveTo(xx+3,p.y-h*.4*grow,xx-1,p.y-h*.72*grow);g.stroke()}g.restore()};
// pousses avant l'éruption (alerte vivante)
JFXD.sj_sprout=(f,k,e,t)=>{g.save();const n=f.big?22:12;g.strokeStyle=SJC.b;g.lineCap='round';for(let i=0;i<n;i++){const b=i*2.39,d=f.r*((i*.41)%1)*.9,p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,0),h=(6+e*16)*p.s;g.lineWidth=2*p.s;g.beginPath();g.moveTo(p.x,p.y);g.quadraticCurveTo(p.x+3*p.s,p.y-h*.6,p.x+Math.sin(t*6+i)*2*p.s,p.y-h);g.stroke();
  g.fillStyle=SJL;g.beginPath();g.ellipse(p.x+2*p.s,p.y-h,3*p.s,1.6*p.s,-.5,0,7);g.fill()}g.restore()};
// racines qui jaillissent puis retombent
JFXD.sj_roots=(f,k,e,t)=>{g.save();g.lineCap='round';for(let i=0;i<10;i++){const b=i*.628+f.x*.01,d0=f.r*.25,d1=f.r*(.75+(i%3)*.1),A=P(f.x+Math.cos(b)*d1,f.y+Math.sin(b)*d1,0),C=P(f.x+Math.cos(b+.3)*d0,f.y+Math.sin(b+.3)*d0,(46+(i%3)*10)*Math.sin(Math.PI*Math.min(1,e*1.6))),M=P(f.x+Math.cos(b+.15)*(d0+d1)/2,f.y+Math.sin(b+.15)*(d0+d1)/2,60*k);
  g.strokeStyle=rgba(SJC.d,.9*k);g.lineWidth=7*A.s;g.beginPath();g.moveTo(A.x,A.y);g.quadraticCurveTo(M.x,M.y,C.x,C.y);g.stroke();g.strokeStyle=rgba(SJC.b,k);g.lineWidth=4*A.s;g.stroke()}g.restore()};
// ninja enserré par le bois
JFXD.sj_bind=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,H=(f.big?62:48)*Math.min(1,e*7);g.save();g.globalAlpha=Math.min(1,k*4);g.lineCap='round';
 for(let i=0;i<4;i++){const y0=q.y-H*(i/4),y1=q.y-H*((i+1)/4);g.strokeStyle=SJC.d;g.lineWidth=6*s;g.beginPath();g.moveTo(q.x-17*s,y0);g.quadraticCurveTo(q.x,y0-8*s+(i%2)*10*s,q.x+17*s,y1);g.stroke();g.strokeStyle=SJC.b;g.lineWidth=3.5*s;g.stroke()}
 g.fillStyle=SJL;g.beginPath();g.ellipse(q.x+12*s,q.y-H,4*s,2*s,.4,0,7);g.fill();g.restore()};
// tronc qui jaillit sous le lanceur (dash)
JFXD.sj_trunk=(f,k,e)=>{const h=70*Math.sin(Math.PI*Math.min(1,e*1.3));sjTree(f.x,f.y,h,Math.min(1,k*2),0,0)};
// dragon de bois : tête à cornes, corps qui ondule derrière (longueur selon la distance parcourue)
PROJD.sj_dragon=(p,R,ra,t)=>{if(Math.random()<.7)fx.push({oi:fxOI(p.owner),x:p.x+(Math.random()-.5)*44,y:p.y+(Math.random()-.5)*30,z:6+Math.random()*34,vx:-p.vx*.15+(Math.random()-.5)*80,vy:-p.vy*.15+(Math.random()-.5)*80,t:.6,m:.6,col:Math.random()<.6?SJL:SJC.b,r:2.2+Math.random()*2.2,vfx:'leaf'}); // feuilles et copeaux arrachés
 fxGlowS(0,0,R*2.2,'#a8e88a',.32);g.rotate(ra);const L=Math.min(150,((p.life0||1)-p.life)*640+20),n=10;g.lineCap='round';
 for(let i=n;i>=1;i--){const x=-i/n*L,y=Math.sin(t/110-i*.7)*R*.45,w=R*(1-i/n*.55);g.fillStyle=i%2?SJC.c:SJC.b;g.strokeStyle=SJC.d;g.lineWidth=1;g.beginPath();g.ellipse(x,y,w*.75,w*.62,0,0,7);g.fill();g.stroke();
  if(i%3===0){g.fillStyle=SJL;g.beginPath();g.ellipse(x,y-w*.6,3,1.6,0,0,7);g.fill()}}
 g.fillStyle=SJC.b;g.strokeStyle=SJC.d;g.lineWidth=1.2;g.beginPath();g.moveTo(R*1.25,0);g.lineTo(R*.4,-R*.7);g.lineTo(-R*.6,-R*.55);g.lineTo(-R*.6,R*.55);g.lineTo(R*.4,R*.7);g.closePath();g.fill();g.stroke();
 g.strokeStyle=SJC.c;g.lineWidth=3;for(const s of[-1,1]){g.beginPath();g.moveTo(-R*.2,s*R*.5);g.quadraticCurveTo(-R*.8,s*R*1.1,-R*1.3,s*R*.9);g.stroke()}
 g.fillStyle='#ffe28a';g.beginPath();g.arc(R*.35,-R*.3,2.4,0,7);g.arc(R*.35,R*.3,2.4,0,7);g.fill();g.strokeStyle=SJC.d;g.lineWidth=1.5;g.beginPath();g.moveTo(R*1.2,0);g.lineTo(R*.5,0);g.stroke()};
// ---- trait de clan : Vitalité Senju
TRAITS[23]={nom:'Vitalité Senju',desc:'Force brute : tes coups de base frappent 10 % plus fort. Si tu n\'as pas été touché depuis 2,5 s, tu régénères 0,5 % de tes PV max par seconde',
 update(u,dt){if(u.sj_cds!==u.cds){u.sj_cds=u.cds;u.sj_lh=-99;u.sj_hot=0} // nouveau ninja ou réapparition
  if(u.sj_hot>0){u.sj_hot-=dt;gain(u,10/HEALX*dt,u)}
  const calm=SIMT-(u.sj_lh??-99)>SJ_CALM&&u.hp<u.max&&!u.dead;u.sj_rg=calm||u.sj_hot>0?1:0;if(calm)gain(u,u.max*SJ_RG/HEALX*dt,u)},
 deal(src,t,dmg,o){return o.basic&&t&&t.team!==src.team?dmg*SJ_M1:dmg},
 take(t,src,dmg,o){if(src&&src!==t&&dmg>0)t.sj_lh=SIMT;return dmg},
 draw(u,p,S,sk){if(!u.sj_rg)return;const t=performance.now()/1000;g.save();for(let i=0;i<5;i++){const b=t*1.2+i*1.26,h=((t*22+i*13)%50)*S,x=p.x+Math.cos(b)*16*S*(sk||1),y=p.y-h-Math.sin(b)*5*S;g.fillStyle=i%2?SJL:'#a8e88a';g.globalAlpha=1-h/(50*S);g.beginPath();g.ellipse(x,y,3*S,1.5*S,b,0,7);g.fill()}g.restore()},
 prev(u,p,S,front){if(front){const q=Object.assign({},u,{sj_rg:1});TRAITS[23].draw(q,p,S,1)}},
 hud(u,x,y){gkHud(u,x,y,'Vitalité Senju'+(u.sj_rg?' · RÉGÉNÈRE':''),null,0,'#a8e88a','#8ad86a')}};
AFTER.push(()=>UK.push('sj_rg'));
// ---- apparence : symbole Senju dans le dos, yeux bruns
CLOOK[23]=(look)=>{if(!look.sym)look.sym='senju';look.head.eye=look.head.eye||'#4a3020'};

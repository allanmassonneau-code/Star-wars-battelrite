// ===== Clan Kurama (c25, préfixe kr_) : les prodiges du genjutsu (façon Yakumo Kurama) =====
// Identité : l'illusionniste dont les visions font vraiment mal. Trait « Écho de l'illusion » : chaque touche d'un genjutsu Kurama
// revient 1,2 s plus tard (30 % des dégâts : la cible le ressent une seconde fois). Lame illusoire, Hallucination (terreur),
// Tableau vivant (zone peinte), Ronces de cauchemar, Royaume peint (ultime). Dash : mirage. Distinct des sub Genjutsu (f2) : rose et peinture.
gkPal('kr_gen','#ffd8f2','#e060b0','#5a1a4a','#200818');gkPal('kr_echo','#ffe8f8','#f090d0','#6a2a5a','#200818');
const KRC=GK.kr_gen,KR_EC=.3,KR_ET=1.2;
const KR_D={
 blade:'Une lame illusoire traverse les ennemis en ligne (480) : 13 dégâts, ralentit 0,6 s',
 fear:'Hallucination : le point visé (420 max) se peuple de visions après 0,5 s : 12 dégâts et terreur 0,9 s (l\'ennemi fuit)',
 paint:'Tableau vivant : tu peins une scène de flammes au point visé (400 max, rayon 120), 3,5 s : 5 dégâts toutes les 0,5 s et ralentit',
 thorn:'Ronces de cauchemar (520) : 26 dégâts, entrave 1 s ; les épines rongent la cible (4 dégâts par seconde, 2 s)',
 world:'Royaume peint : après 0,6 s, le monde autour de toi (220) devient ta toile : 30 dégâts, étourdit 0,8 s, puis le cauchemar ronge (6 dégâts par seconde, 3 s)',
 dash:'Tu laisses un mirage à ta place et réapparais plus loin (210), invisible 0,6 s'};
KIT('c25',[
 ['D','x.kr_blade','Genjutsu : Lame illusoire',KR_D.blade,'kr_gen'],
 ['C','x.kr_fear','Genjutsu : Hallucination',KR_D.fear,'kr_gen'],
 ['B','x.kr_paint','Genjutsu : Tableau vivant',KR_D.paint,'kr_gen'],
 ['A','x.kr_thorn','Genjutsu : Ronces de cauchemar',KR_D.thorn,'kr_gen'],
 ['S','x.kr_world','Genjutsu : Royaume peint',KR_D.world,'kr_gen'],
]);
DASHC[25]={src:'x.kr_dash',n:'Mirage',d:KR_D.dash,vfx:'kr_gen',cd:7};
Object.assign(NAT,{
 // ---------- Lame illusoire (D) ----------
 kr_blade:SP('Genjutsu : Lame illusoire',KR_D.blade,4.5,{ai:RG(470,.8),line:{len:480,w:22}},(u,a)=>{gkS('genjutsu',u);gkS('saber',u);anim(u,'throw2',.35);
  proj(u,a,{spd:800,r:9,dmg:13,life:.6,col:KRC.b,kind:'kr_blade',vfx:'kr_gen',pierce:1,o:{slow:.6}})}),
 // ---------- Hallucination (C) ----------
 kr_fear:SP('Genjutsu : Hallucination',KR_D.fear,8,{ai:RG(420,.65),tele:{r:85,max:420}},(u,a,td)=>{const c=atP(u,a,td,420),D=.5;gkS('genjutsu',u);anim(u,'eye',.5);jx({jfx:'kr_eyes',x:c.x,y:c.y,r:85,t:D+.4,m:D+.4});
  later(u,D,()=>{gkAoe(u,c.x,c.y,85,12,{fear:.9,fx:c.x,fy:c.y},'kr_gen',e=>jx({jfx:'kr_haunt',ti:gkI(e),x:e.x,y:e.y,t:.9,m:.9}));if(near(c.x,c.y))gkS('roar',u)},{x:c.x,y:c.y,r:85})}),
 // ---------- Tableau vivant (B) : zone peinte (gkPool) ----------
 kr_paint:SP('Genjutsu : Tableau vivant',KR_D.paint,10,{ai:RG(400,.6),tele:{r:120,max:400}},(u,a,td)=>{const c=atP(u,a,td,400);gkS('genjutsu',u);gkS('flame',u);anim(u,'kr_brush',.6);
  gkPool(u,c.x,c.y,{r:120,t:3.5,kind:'kr',vfx:'kr_gen',d:5,iv:.5,sl:1});jx({jfx:'kr_stroke',ui:gkI(u),x:c.x,y:c.y,r:120,t:.5,m:.5})}),
 // ---------- Ronces de cauchemar (A) ----------
 kr_thorn:SP('Genjutsu : Ronces de cauchemar',KR_D.thorn,12,{ai:RG(510,.65),line:{len:520,w:30}},(u,a)=>{gkS('genjutsu',u);gkS('shadow',u);anim(u,'palm',.45);
  proj(u,a,{spd:700,r:13,dmg:26,life:.74,col:KRC.c,kind:'kr_thorn',vfx:'kr_gen',o:{root:1,dot:{dps:4,dur:2}},onHit:(p,t)=>jx({jfx:'kr_vines',ti:gkI(t),x:t.x,y:t.y,t:1,m:1})})}),
 // ---------- Royaume peint (S) ----------
 kr_world:ULT('Genjutsu : Royaume peint',KR_D.world,{ai:SELF(210,.85),tele:{self:1,r:220}},(u)=>{const D=.6,x0=u.x,y0=u.y;gkS('genjutsu',u);gkS('roar',u);anim(u,'kr_brush',.9);jx({jfx:'kr_canvas',ui:gkI(u),x:x0,y:y0,r:220,d:D,t:D+1.6,m:D+1.6});
  later(u,D,()=>{const o=u.dead?null:u;if(!o)return;gkAoe(o,o.x,o.y,220,30,{stun:.8,dot:{dps:6,dur:3}},'kr_gen',e=>jx({jfx:'kr_haunt',ti:gkI(e),x:e.x,y:e.y,t:1.2,m:1.2}));if(near(o.x,o.y)){gkS('boom',o);shake=Math.max(shake,.35)}},{x:x0,y:y0,r:220})}),
 // ---------- dash : Mirage ----------
 kr_dash:SP('Mirage',KR_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||210,110,210);gkS('poof',u);gkS('genjutsu',u);u.dash=null;u.kx=u.ky=0;
  jx({jfx:'kr_ghost',x:x0,y:y0,a:u.aim||a,t:1,m:1});u.x=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r);u.y=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);collide(u);u.stealth=Math.max(u.stealth||0,.6);if(near(u.x,u.y))sparks(u.x,u.y,KRC.a,10,'kr_gen')}),
});
Object.assign(NATHERO,{kr:'kylo'});
// ---- trait : Écho de l'illusion (un écho ne relance pas d'écho : VFX 'kr_echo')
TRAITS[25]={nom:'Écho de l\'illusion',desc:'Tes genjutsu font mal deux fois : 1,2 s après chaque touche, la cible ressent à nouveau 30 % des dégâts (un Kawarimi ou une esquive l\'évite)',
 landed(src,t,dmg,o){if(VFX!=='kr_gen'||!(dmg>=3)||!t||t===src||t.dead)return;const v=dmg*KR_EC;
  later(src,KR_ET,()=>{if(t.dead||src.dead)return;if(gkHit(t,src,v,{unblockable:1},'kr_echo'))jx({jfx:'kr_echoF',ti:gkI(t),x:t.x,y:t.y,t:.5,m:.5})},{});t.kr_e=KR_ET;t.kr_eo=src},
 update(u,dt){for(const e of units)if(e.kr_e>0&&e.kr_eo===u)e.kr_e=Math.max(0,e.kr_e-dt)},
 draw(u,p,S,sk){const t=performance.now()/1000;g.save();for(let i=0;i<5;i++){const b=t*.9+i*1.26,h=((t*18+i*12)%56)*S,x=p.x+Math.cos(b)*18*S*(sk||1),y=p.y-h;g.globalAlpha=Math.max(0,1-h/(56*S))*.85;g.fillStyle=i%2?KRC.b:KRC.a;g.beginPath();g.ellipse(x,y,3.2*S,1.6*S,b*2,0,7);g.fill()}g.restore()},
 prev(u,p,S,front){if(front)TRAITS[25].draw(u,p,S,1)},
 hud(u,x,y){let n=0;for(const e of units)if(!e.dead&&e.team!==u.team&&e.kr_e>0&&(e.kr_eo===u||e.kr_eo==null))n++; /* ses échos à lui (kr_eo n'existe que chez l'hôte) */gkHud(u,x,y,'Écho de l\'illusion'+(n?' · écho en route':''),null,0,KRC.a,'#e8a8d8')}};
AFTER.push(()=>UK.push('kr_e'));
// cible qui attend son écho : silhouette rose qui tremble
STATD.push((u,p,S)=>{if(!(u.kr_e>0)||u.dead)return;const t=performance.now()/1000;g.save();g.strokeStyle=rgba(KRC.b,.55*Math.min(1,u.kr_e*2));g.lineWidth=1.5;const j=Math.sin(t*40)*2*S;g.beginPath();g.ellipse(p.x+j,p.y-32*S,13*S,30*S,0,0,7);g.stroke();g.restore()});
// ---- apparence : yeux rose-violet, chakra rose
CLOOK[25]=(look)=>{look.head.eye=look.head.eye||'#c0306a';if(look.weapon)look.weapon.col='#f090d0'};
// ---- animation : coup de pinceau ample (Yakumo peint ses illusions)
Object.assign(ANIM,{kr_brush:(P,e)=>{const k=ezo(Math.min(1,e/.3)),sw=e<.3?0:ezio(Math.min(1,(e-.3)/.5));pz(P,'armR',-1.3*k-.6*sw,0,-.9*k+1.6*sw);pz(P,'foreR',-.6*k);pz(P,'handR',.4*sw);pz(P,'armL',-.5*k,0,.4*k);pz(P,'chest',.1*k,.4*k-.8*sw);P.root.z=3*sw}});
// ---- visuels
// lame illusoire : croissant rose translucide, double image décalée
PROJD.kr_blade=(p,R,ra,t)=>{g.rotate(ra);g.save();g.globalCompositeOperation='lighter';for(const [o,al] of[[-7,.3],[0,.85]]){g.fillStyle=rgba(KRC.b,al);g.beginPath();g.moveTo(R*1.6+o,0);g.quadraticCurveTo(o,-R*2.4,-R*1.2+o,-R*1.8);g.quadraticCurveTo(o+R*.2,-R*.6,o-R*.4,0);g.quadraticCurveTo(o+R*.2,R*.6,-R*1.2+o,R*1.8);g.quadraticCurveTo(o,R*2.4,R*1.6+o,0);g.fill()}
 g.fillStyle=rgba('#ffffff',.85);g.beginPath();g.ellipse(R*.5,0,R*.9,R*.25,0,0,7);g.fill();g.restore()};
// ronces : boule d'épines sombres qui tourne
PROJD.kr_thorn=(p,R,ra,t)=>{g.save();g.rotate(t/150);g.strokeStyle=KRC.c;g.lineWidth=2.6;for(let i=0;i<7;i++){const b=i*.9;g.beginPath();g.moveTo(Math.cos(b)*R*.3,Math.sin(b)*R*.3);g.quadraticCurveTo(Math.cos(b+.6)*R,Math.sin(b+.6)*R,Math.cos(b+1)*R*1.2,Math.sin(b+1)*R*1.2);g.stroke()}
 g.fillStyle=KRC.b;for(let i=0;i<9;i++){const b=i*.7;g.beginPath();g.moveTo(Math.cos(b)*R*.8,Math.sin(b)*R*.8);g.lineTo(Math.cos(b+.12)*R*1.35,Math.sin(b+.12)*R*1.35);g.lineTo(Math.cos(b+.25)*R*.8,Math.sin(b+.25)*R*.8);g.fill()}
 g.fillStyle='#200818';g.beginPath();g.arc(0,0,R*.45,0,7);g.fill();g.restore()};
// yeux qui s'ouvrent dans le décor avant l'Hallucination
JFXD.kr_eyes=(f,k,e,t)=>{g.save();for(let i=0;i<6;i++){const b=i*1.047+.3,d=f.r*.65,q=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,26+(i%2)*14),s=q.s,op=Math.min(1,e*3)*Math.min(1,k*3);g.globalAlpha=op;
  g.fillStyle='#fff0f8';g.strokeStyle=KRC.c;g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y,8*s,3.5*s*op,0,0,7);g.fill();g.stroke();g.fillStyle=KRC.b;g.beginPath();g.arc(q.x+Math.sin(t*3+i)*2*s,q.y,2.6*s*op,0,7);g.fill();g.fillStyle='#200818';g.beginPath();g.arc(q.x+Math.sin(t*3+i)*2*s,q.y,1.1*s*op,0,7);g.fill()}g.restore()};
// visions qui hantent la cible (spectres roses qui tournent)
JFXD.kr_haunt=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,40);g.save();g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const b=t*4+i*2.09,x=q.x+Math.cos(b)*20*q.s,y=q.y+Math.sin(b)*8*q.s;g.fillStyle=rgba(KRC.b,.5*k);g.beginPath();g.arc(x,y-6*q.s,5*q.s,Math.PI,0);g.lineTo(x+5*q.s,y+4*q.s);g.lineTo(x+2*q.s,y+1*q.s);g.lineTo(x,y+4*q.s);g.lineTo(x-2*q.s,y+1*q.s);g.lineTo(x-5*q.s,y+4*q.s);g.closePath();g.fill()}g.restore()};
// écho : la silhouette de la cible se dédouble
JFXD.kr_echoF=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s;g.save();g.strokeStyle=rgba(KRC.a,k);g.lineWidth=2;for(const d of[-1,1]){g.beginPath();g.ellipse(q.x+d*e*14*s,q.y-32*s,12*s,30*s,0,0,7);g.stroke()}g.restore()};
// ronces qui enlacent la cible
JFXD.kr_vines=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,H=50*Math.min(1,e*6);g.save();g.globalAlpha=Math.min(1,k*3);g.strokeStyle=KRC.c;g.lineWidth=3*s;g.lineCap='round';
 for(let i=0;i<2;i++){g.beginPath();for(let j=0;j<=12;j++){const m=j/12,b=m*9+i*Math.PI;const x=q.x+Math.cos(b)*15*s,y=q.y-H*m+Math.sin(b)*4*s;j?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 g.fillStyle=KRC.b;for(let j=0;j<6;j++){const b=j*1.5,x=q.x+Math.cos(b)*15*s,y=q.y-H*j/6;g.beginPath();g.arc(x,y,2*s,0,7);g.fill()}g.restore()};
// coup de pinceau du Tableau vivant (du lanceur vers la toile)
JFXD.kr_stroke=(f,k,e,t,u)=>{const A=P(u&&!u.dead?u.x:f.x,u&&!u.dead?u.y:f.y,40),Bq=P(f.x,f.y,10);g.save();g.strokeStyle=rgba(KRC.b,.8*k);g.lineWidth=8*A.s*k;g.lineCap='round';g.beginPath();g.moveTo(A.x,A.y);g.quadraticCurveTo((A.x+Bq.x)/2,Math.min(A.y,Bq.y)-60*A.s,lerp(A.x,Bq.x,Math.min(1,e*2)),lerp(A.y,Bq.y,Math.min(1,e*2)));g.stroke();g.restore()};
// toile peinte au sol : cadre, aplats d'encre, flammes illusoires
GKPOOL.kr=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,R=x.r;g.save();g.fillStyle=rgba('#2a0a24',.35*k);g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#e8c060',.7*k);g.lineWidth=3*s;g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,0,7);g.stroke();g.strokeStyle=rgba(KRC.b,.5*k);g.lineWidth=1.5*s;g.beginPath();g.ellipse(q.x,q.y,R*.92*s,R*.92*s*K,0,0,7);g.stroke();
 for(let i=0;i<5;i++){const b=i*1.26+.4,d=R*.45,c=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,0);g.fillStyle=rgba(i%2?KRC.c:KRC.b,.35*k);g.beginPath();g.ellipse(c.x,c.y,26*s,9*s,b,0,7);g.fill()}
 g.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const b=i*.52+t*.4,d=R*(.2+((i*37)%60)/100),c=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.85,2),h=(12+Math.sin(t*8+i)*5)*c.s;g.fillStyle=rgba(i%3?KRC.b:'#ffb0e0',.65*k);g.beginPath();g.moveTo(c.x-4*c.s,c.y);g.quadraticCurveTo(c.x+Math.sin(t*6+i)*3*c.s,c.y-h*2,c.x+4*c.s,c.y);g.fill()}g.restore()};
// royaume peint : la toile se déroule autour du lanceur, puis le monde se teinte
JFXD.kr_canvas=(f,k,e,t,u)=>{const el=e*f.m,m=Math.min(1,el/f.d),R=f.r*m,cx=u&&!u.dead?u.x:f.x,cy=u&&!u.dead?u.y:f.y,q=P(cx,cy,0),s=q.s,fade=Math.min(1,k*3);g.save();
 g.fillStyle=rgba('#2a0a24',.3*fade);g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,0,7);g.fill();g.strokeStyle=rgba('#e8c060',.85*fade);g.lineWidth=4*s;g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,-Math.PI/2,-Math.PI/2+Math.PI*2*m);g.stroke();
 if(m>=1){g.globalCompositeOperation='lighter';for(let i=0;i<18;i++){const b=i*.349+t*.3,d=f.r*(.25+((i*29)%70)/100),c=P(cx+Math.cos(b)*d,cy+Math.sin(b)*d,4+((t*40+i*9)%40));g.fillStyle=rgba(i%2?KRC.b:KRC.a,.6*fade);g.beginPath();g.ellipse(c.x,c.y,4*c.s,2*c.s,b,0,7);g.fill()}}g.restore()};
// mirage laissé à l'ancienne place
JFXD.kr_ghost=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s;g.save();g.globalAlpha=k*.7;const gr=g.createLinearGradient(0,q.y-64*s,0,q.y);gr.addColorStop(0,rgba(KRC.a,.0));gr.addColorStop(.3,rgba(KRC.b,.55));gr.addColorStop(1,rgba(KRC.c,.2));g.fillStyle=gr;
 g.beginPath();g.ellipse(q.x+Math.sin(t*12)*2*s*e,q.y-32*s,12*s,32*s,0,0,7);g.fill();g.beginPath();g.arc(q.x,q.y-60*s,7*s,0,7);g.fill();g.restore()};

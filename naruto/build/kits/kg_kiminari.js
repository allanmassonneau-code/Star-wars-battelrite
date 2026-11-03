// ===== Kekkei genkai g8 : Kiminari, la foudre noire (préfixe kn_) — façon Darui et la panthère du Raikage =====
// Identité : le perceur rapide. Une foudre sombre qui traverse tout : tes jutsu ignorent la garde, et chaque touche te charge (trait) :
// plus rapide 2,5 s. Trait noir, arc noir, éclair fourchu, ruée noire, jugement noir ; dash : pas noir.
gkPal('kn_black','#c8a8ff','#7a4aff','#1a0a2a','#05020a');ELM.kn_black=3; // foudre : bat Doton, ×1,35 sur une cible trempée
defKG(8,{n:'Kiminari',col:'#5a3a9a',tag:'Ki',el:'Raiton',nat:3,d:'La foudre noire : éclairs sombres, perçants et très rapides, qui traversent la garde',
 ico:f=>{g.beginPath();g.moveTo(4,-13);g.lineTo(-8,2);g.lineTo(-1,2);g.lineTo(-5,13);g.lineTo(9,-3);g.lineTo(2,-3);g.lineTo(6,-13);g.closePath();g.fill()}});
const KN_D={
 lance:'Trait de foudre noire très rapide et perçant (560) : 13 dégâts',
 arc:'Arc de foudre noire devant toi (260) : 18 dégâts et ralentit 0,8 s',
 fork:'Un éclair rampe au sol jusqu\'au point visé (480 max) : le 1er ennemi touché prend 18 dégâts et est étourdi 0,5 s ; au bout, il se divise en 3 éclairs (8 dégâts chacun)',
 rush:'Tu traverses en éclair (340) : 34 dégâts aux ennemis traversés ; ta trace explose 0,5 s plus tard (10 dégâts)',
 judge:'Jugement noir : marque l\'ennemi visé (520) ; 5 éclairs noirs s\'abattent là où il se tient (0,3 s d\'alerte chacun) : 12 dégâts chacun, le dernier étourdit 0,6 s',
 dash:'Pas noir : tu disparais dans un éclair (200) et tu es plus rapide 1 s'};
KIT('g8',[
 ['D','x.kn_lance','Kiminari : Trait noir',KN_D.lance,'kn_black'],
 ['C','x.kn_arc','Kiminari : Arc noir',KN_D.arc,'kn_black'],
 ['B','x.kn_fork','Kiminari : Éclair fourchu',KN_D.fork,'kn_black'],
 ['A','x.kn_rush','Kiminari : Ruée noire',KN_D.rush,'kn_black'],
 ['S','x.kn_judge','Kiminari : Jugement noir',KN_D.judge,'kn_black'],
]);
DASHG[8]={src:'x.kn_dash',n:'Pas noir',d:KN_D.dash,vfx:'kn_black',cd:6};
KGBAL[8]=[0.942,0.912];
const KNC=GK.kn_black;
GKBEAM.kn=(f,k,e,t)=>{const A=P(f.x,f.y,32),Bq=P(f.x2,f.y2,32);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,10,18,f.x*.1+t*11),KNC.a,KNC.c,6*A.s,k,1);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,7,26,f.y*.1+t*7),KNC.a,KNC.c,2*A.s,k*.7,1)};
Object.assign(NAT,{
 // ---------- Trait noir (D) ----------
 kn_lance:SP('Kiminari : Trait noir',KN_D.lance,4,{ai:RG(540,.8),line:{len:560,w:20}},(u,a)=>{gkS('zap',u);gkS('chidori',u);anim(u,'point',.3);proj(u,a,{spd:1500,r:7,dmg:13,life:.38,col:KNC.b,kind:'kn_bolt',vfx:'kn_black',pierce:1,o:{unblockable:1}})}),
 // ---------- Arc noir (C) ----------
 kn_arc:SP('Kiminari : Arc noir',KN_D.arc,7,{ai:RG(250,.8),line:{len:260,w:150}},(u,a)=>{gkS('zap',u);gkS('chidori',u);anim(u,'gk_push',.35);
  for(const e of enemies(u))if(dist(u,e)<260+e.r&&angDiff(ang(u,e),a)<.6)gkHit(e,u,18,{slow:.8,unblockable:1},'kn_black');jx({jfx:'kn_arc',ui:gkI(u),x:u.x,y:u.y,a,t:.3,m:.3})}),
 // ---------- Éclair fourchu (B) ----------
 kn_fork:SP('Kiminari : Éclair fourchu',KN_D.fork,10,{ai:RG(470,.65),line:{len:480,w:30}},(u,a,td)=>{const L=clamp(td||480,120,480);gkS('zap',u);anim(u,'stomp',.4);
  proj(u,a,{spd:950,r:12,dmg:18,life:L/950,col:KNC.b,kind:'kn_bolt',vfx:'kn_black',o:{stun:.5,unblockable:1}});const p=projs[projs.length-1];aux.push({type:'kn_fork',x:p.x,y:p.y,r:0,t:p.life+.1,m:p.life+.1,team:u.team,owner:u,p,a})}),
 // ---------- Ruée noire (A) ----------
 kn_rush:SP('Kiminari : Ruée noire',KN_D.rush,12,{ai:{mode:'gap',min:60,max:330,p:.7},line:{len:340,w:50}},(u,a)=>{const x0=u.x,y0=u.y;gkS('zap',u);gkS('dash',u);anim(u,'lunge',.35);u.phase=Math.max(u.phase||0,.22);
  const ex=clamp(u.x+Math.cos(a)*340,B.x+u.r,B.x+B.w-u.r),ey=clamp(u.y+Math.sin(a)*340,B.y+u.r,B.y+B.h-u.r),L=Math.hypot(ex-x0,ey-y0);
  dash(u,a,340,.18,{through:1,end:()=>{gkBeam(u,x0,y0,a,L,56,34,{},'kn_black','kn',null,.35);later(u,.5,()=>gkBeam(u,x0,y0,a,L,56,10,{},'kn_black','kn',null,.3),{});aux.push({type:'kn_trace',x:x0,y:y0,a,len:L,r:0,t:.5,m:.5,team:u.team})}})}),
 // ---------- Jugement noir (S) ----------
 kn_judge:ULT('Kiminari : Jugement noir',KN_D.judge,{ai:RG(520,.85)},(u,a,td)=>{const e=pick(u,a,td||400,520);if(!e||dist(u,e)>560){subRefund(u,'kn_judge',1,'AUCUNE CIBLE',KNC.a);return}
  gkS('zap',u);gkS('roar',u);anim(u,'gk_call',.8);say(e,'JUGEMENT NOIR',KNC.a);
  for(let i=0;i<5;i++)aux.push({type:'kn_strike',x:e.x,y:e.y,r:52,t:.3+i*.3,m:.3+i*.3,team:u.team,owner:u,tg:e,last:i===4,set:i*.3,danger:1})}),
 // ---------- dash : Pas noir ----------
 kn_dash:SP('Pas noir',KN_D.dash,6,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||200,110,200);gkS('zap',u);u.phase=Math.max(u.phase||0,.1);u.dash=null;u.kx=u.ky=0;
  u.x=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r);u.y=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);collide(u);u.haste=Math.max(u.haste||0,1);jx({jfx:'gk_beam',x:x0,y:y0,x2:u.x,y2:u.y,w:20,st:'kn',t:.3,m:.3})}),
});
Object.assign(NATHERO,{kn:'kylo'});
// éclair fourchu : en bout de course, 3 éclairs
AUXF.kn_fork=(x,dt)=>{const p=x.p;if(x.done||!p){x.t=0;return}const alive=!p.dead&&p.life>0&&projs.includes(p);if(alive){x.x=p.x;x.y=p.y;return}x.done=1;x.t=0;if(p.hitAny)return;const o=x.owner;if(!o||o.dead)return;
 for(let i=-1;i<=1;i++)gkBeam(o,x.x,x.y,x.a+i*.7,140,26,8,{},'kn_black','kn',null,.3);if(near(x.x,x.y))gkS('zap',o)};AUXD.kn_fork=()=>{};
// trace de la ruée (dessin seulement)
AUXF.kn_trace=()=>{};AUXD.kn_trace=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a);g.save();for(let i=0;i<6;i++){const f=((i+.5)/6)*x.len,q=P(x.x+ca*f,x.y+sa*f,6+Math.sin(t*30+i)*4);g.globalCompositeOperation='lighter';g.fillStyle=rgba(KNC.b,.5);g.fillRect(q.x-2,q.y-2,4,4)}g.restore()};
// éclair du jugement : alerte au sol (se pose sur la cible jusqu'à 0,3 s avant), puis frappe
AUXF.kn_strike=(x,dt)=>{const o=x.owner,e=x.tg;if(x.done||!o)return;if(x.t>.3&&e&&!e.dead){x.x=e.x;x.y=e.y}
 if(x.t<=0){x.done=1;const n=gkAoe(o,x.x,x.y,x.r,12,x.last?{stun:.6}:{},'kn_black');jx({jfx:'kn_sky',x:x.x,y:x.y,t:.35,m:.35});if(near(x.x,x.y)){gkS('zap',o);if(x.last)gkS('boom',o);shake=Math.max(shake,x.last?.25:.1)}}};
AUXD.kn_strike=(x,k,t)=>{if(x.t>.35)return;const e=clamp(1-x.t/.3,0,1);g.save();g.fillStyle=rgba(KNC.c,.35);gEll(x.x,x.y,x.r);g.fill();g.fillStyle=rgba(KNC.b,.4);gEll(x.x,x.y,x.r*e);g.fill();g.strokeStyle=KNC.b;g.lineWidth=2;gEll(x.x,x.y,x.r);g.stroke();g.restore()};
// ---- trait : Foudre noire (charge de vitesse)
KGTRAITS[8]={nom:'Foudre noire',desc:'Tes éclairs noirs traversent la garde. Chaque fois qu\'un de tes jutsu de Kiminari touche, tu es plus rapide 2,5 s',
 landed(src,t,dmg,o){if(gkMine('kn_black')&&dmg>0){src.haste=Math.max(src.haste||0,2.5);src.kn_hs=2.5}},
 update(u,dt){if(u.kn_hs>0)u.kn_hs=Math.max(0,u.kn_hs-dt)},
 draw(u,p,S,sk){const t=performance.now()/1000,on=u.kn_hs>0;g.save();if(on||Math.sin(t*5+u.y)>.7){const q=gkZig(p.x+(Math.sin(t*3)*14)*S,p.y-62*S,p.x-6*S,p.y-12*S,5,9*S,t*13);gkBolt(q,KNC.a,KNC.c,(on?2.2:1.4)*S,on?.9:.5,1)}g.restore()},
 prev(u,p,S,front){if(front)KGTRAITS[8].draw(u,p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Foudre noire'+(u.kn_hs>0?' · CHARGÉ':''),null,0,KNC.a,KNC.a)}};
AFTER.push(()=>UK.push('kn_hs'));
// ---- visuels
PROJD.kn_bolt=(p,R,ra,t)=>{g.rotate(ra);const L=R*6;gkBolt(gkZig(-L,0,R,0,6,R*1.4,t*.03+p.x*.01),KNC.a,KNC.c,R*.9,1,1);g.globalCompositeOperation='lighter';g.fillStyle=rgba(KNC.a,.6);g.beginPath();g.arc(R*.6,0,R*.8,0,7);g.fill()};
JFXD.kn_arc=(f,k,e,t,u)=>{const x0=u&&!u.dead?u.x:f.x,y0=u&&!u.dead?u.y:f.y,A=P(x0,y0,36);for(let i=0;i<5;i++){const b=f.a+(i-2)*.25,Bq=P(x0+Math.cos(b)*250,y0+Math.sin(b)*250,30);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,6,18,i*3+t*15),KNC.a,KNC.c,3*A.s,k,1)}};
JFXD.kn_sky=(f,k,e,t)=>{const A=P(f.x,f.y,220),Bq=P(f.x,f.y,0);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,8,20,f.x+f.y),KNC.a,KNC.c,5*A.s,k,1);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(KNC.b,.45*k);gEll(f.x,f.y,40);g.fill();g.restore()};

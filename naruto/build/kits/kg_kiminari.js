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
// impact de foudre noire : éclat violet, fumée sombre, arcs, brûlure au sol
const knHitFx=(u,x,y,r,a)=>{fxFlare(x,y,KNC.b,{u,z:32,r:Math.min(30,r*.6),t:.16,c2:KNC.a});fxArcs(x,y,r,KNC.a,{u,z:30,n:3,t:.22});fxBurst(x,y,KNC.a,{u,z:30,n:6,sp:280,w:1.6,len:.14,a,arc:a==null?6.3:2,t:.3});fxSmoke(x,y,{u,col:KNC.c,n:2,r:r*.4,s:10,t:.6,al:.26,rise:24})};
GKBEAM.kn=(f,k,e,t)=>{const A=P(f.x,f.y,32),Bq=P(f.x2,f.y2,32);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,10,18,f.x*.1+t*11),KNC.a,KNC.c,6*A.s,k,1);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,7,26,f.y*.1+t*7),KNC.a,KNC.c,2*A.s,k*.7,1)};
Object.assign(NAT,{
 // ---------- Trait noir (D) ----------
 kn_lance:SP('Kiminari : Trait noir',KN_D.lance,4,{ai:RG(540,.8),line:{len:560,w:20}},(u,a)=>{gkS('zap',u);gkS('chidori',u);anim(u,'point',.3);fxFlare(u.x+Math.cos(a)*22,u.y+Math.sin(a)*22,KNC.b,{u,z:34,r:20,t:.14});proj(u,a,{spd:1500,r:7,dmg:13,life:.38,col:KNC.b,kind:'kn_bolt',vfx:'kn_black',pierce:1,o:{unblockable:1},onHit:(p,t)=>knHitFx(p.owner,t.x,t.y,26,Math.atan2(p.vy,p.vx))})}),
 // ---------- Arc noir (C) ----------
 kn_arc:SP('Kiminari : Arc noir',KN_D.arc,7,{ai:RG(250,.8),line:{len:260,w:150}},(u,a)=>{gkS('zap',u);gkS('chidori',u);anim(u,'gk_push',.35);
  for(const e of enemies(u))if(dist(u,e)<260+e.r&&angDiff(ang(u,e),a)<.6&&gkHit(e,u,18,{slow:.8,unblockable:1},'kn_black')){fxArc(u.x,u.y,e.x,e.y,KNC.a,{u,z:34,t:.22,w:2.2});knHitFx(u,e.x,e.y,30,a)}jx({jfx:'kn_arc',ui:gkI(u),x:u.x,y:u.y,a,r:260,arc:.6,t:.3,m:.3})}),
 // ---------- Éclair fourchu (B) ----------
 kn_fork:SP('Kiminari : Éclair fourchu',KN_D.fork,10,{ai:RG(470,.65),line:{len:480,w:30}},(u,a,td)=>{const L=clamp(td||480,120,480);gkS('zap',u);anim(u,'stomp',.4);
  proj(u,a,{spd:950,r:12,dmg:18,life:L/950,col:KNC.b,kind:'kn_bolt',vfx:'kn_black',o:{stun:.5,unblockable:1},onHit:(p,t)=>{knHitFx(p.owner,t.x,t.y,36,a);for(const d of[-.6,0,.6])fxArc(t.x,t.y,t.x+Math.cos(a+d)*48,t.y+Math.sin(a+d)*48,KNC.a,{u:p.owner,z:32,z2:20,w:2.2,t:.22,j:.3});fxHitStop(p.owner,t,18)}});const p=projs[projs.length-1];aux.push({type:'kn_fork',x:p.x,y:p.y,r:0,t:p.life+.1,m:p.life+.1,team:u.team,owner:u,p,a})}),
 // ---------- Ruée noire (A) ----------
 kn_rush:SP('Kiminari : Ruée noire',KN_D.rush,12,{ai:{mode:'gap',min:60,max:330,p:.7},line:{len:340,w:50}},(u,a)=>{const x0=u.x,y0=u.y;gkS('zap',u);gkS('dash',u);anim(u,'lunge',.35);u.phase=Math.max(u.phase||0,.22);
  const ex=clamp(u.x+Math.cos(a)*340,B.x+u.r,B.x+B.w-u.r),ey=clamp(u.y+Math.sin(a)*340,B.y+u.r,B.y+B.h-u.r),L=Math.hypot(ex-x0,ey-y0);
  gkTrail(u,'kn_black',.3,{w:20,z:30});fxFlare(x0,y0,KNC.b,{u,z:30,r:26,t:.2});
  dash(u,a,340,.18,{through:1,end:()=>{gkBeam(u,x0,y0,a,L,56,34,{},'kn_black','kn',e=>{knHitFx(u,e.x,e.y,34,a);fxHitStop(u,e,34)},.35);later(u,.5,()=>{gkBeam(u,x0,y0,a,L,56,10,{},'kn_black','kn',null,.3);for(let i=1;i<=3;i++)fxDecal(x0+Math.cos(a)*L*i/4,y0+Math.sin(a)*L*i/4,'burn',{u,r:22,t:2.5})},{});aux.push({type:'kn_trace',x:x0,y:y0,a,len:L,r:0,t:.5,m:.5,team:u.team})}})}),
 // ---------- Jugement noir (S) ----------
 kn_judge:ULT('Kiminari : Jugement noir',KN_D.judge,{ai:RG(520,.85)},(u,a,td)=>{const e=pick(u,a,td||400,520);if(!e||dist(u,e)>560){subRefund(u,'kn_judge',1,'AUCUNE CIBLE',KNC.a);return}
  gkS('zap',u);gkS('roar',u);anim(u,'gk_call',.8);say(e,'JUGEMENT NOIR',KNC.a);fxCast(u,'kn_black',.5,{n:12,c2:KNC.a});jx({jfx:'kn_storm',ti:gkI(e),x:e.x,y:e.y,t:1.75,m:1.75});
  for(let i=0;i<5;i++)aux.push({type:'kn_strike',x:e.x,y:e.y,r:52,t:.3+i*.3,m:.3+i*.3,team:u.team,owner:u,tg:e,last:i===4,set:i*.3,danger:1})}),
 // ---------- dash : Pas noir ----------
 kn_dash:SP('Pas noir',KN_D.dash,6,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||200,110,200);gkS('zap',u);u.phase=Math.max(u.phase||0,.1);u.dash=null;u.kx=u.ky=0;
  u.x=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r);u.y=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);collide(u);u.haste=Math.max(u.haste||0,1);jx({jfx:'gk_beam',x:x0,y:y0,x2:u.x,y2:u.y,w:20,st:'kn',t:.3,m:.3});
  fxSmoke(x0,y0,{u,col:KNC.c,n:3,r:14,s:12,t:.6,al:.28,rise:30});fxFlare(u.x,u.y,KNC.b,{u,z:30,r:22,t:.18});fxArcs(u.x,u.y,30,KNC.a,{u,z:30,n:3,t:.25})}),
});
Object.assign(NATHERO,{kn:'kylo'});
// éclair fourchu : en bout de course, 3 éclairs
AUXF.kn_fork=(x,dt)=>{const p=x.p;if(x.done||!p){x.t=0;return}const alive=!p.dead&&p.life>0&&projs.includes(p);if(alive){x.x=p.x;x.y=p.y;return}x.done=1;x.t=0;if(p.hitAny)return;const o=x.owner;if(!o||o.dead)return;
 for(let i=-1;i<=1;i++)gkBeam(o,x.x,x.y,x.a+i*.7,140,26,8,{},'kn_black','kn',null,.3);if(near(x.x,x.y))gkS('zap',o)};AUXD.kn_fork=()=>{};
// trace de la ruée (dessin seulement)
// trace de la ruée = télégraphe de la 2e explosion (0,5 s, rectangle réel 56 de large) : nette, crépite le long
AUXF.kn_trace=()=>{};AUXD.kn_trace=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a);fxTeleLine(x.x,x.y,x.a,x.len,56,1-x.t/x.m,KNC.b,x,.12);
 gkDim(x,()=>{const n=gkN(4,x);for(let i=0;i<n;i++){const f0=((i+.2)/n)*x.len,f1=f0+x.len/n*.6,A=P(x.x+ca*f0,x.y+sa*f0,6),Bq=P(x.x+ca*f1,x.y+sa*f1,6);fxBoltS(A.x,A.y,Bq.x,Bq.y,KNC.b,1.4*A.s,i*7+Math.floor(t*18),.3,5)}})};
// éclair du jugement : alerte au sol (se pose sur la cible jusqu'à 0,3 s avant), puis frappe
AUXF.kn_strike=(x,dt)=>{const o=x.owner,e=x.tg;if(x.done||!o)return;if(x.t>.3&&e&&!e.dead){x.x=e.x;x.y=e.y}
 if(x.t<=0){x.done=1;const n=gkAoe(o,x.x,x.y,x.r,12,x.last?{stun:.6}:{},'kn_black',e=>{if(x.last)fxHitStop(o,e,30,1)});jx({jfx:'kn_sky',x:x.x,y:x.y,r:x.r,big:x.last?1:0,t:x.last?.5:.35,m:x.last?.5:.35});
  fxRing(x.x,x.y,{u:o,r0:10,r1:x.r,col:KNC.b,c2:KNC.a,t:.3,w:x.last?7:4});fxDecal(x.x,x.y,'burn',{u:o,r:x.r*.6,t:3});fxBurst(x.x,x.y,KNC.a,{u:o,z:10,n:x.last?14:7,sp:300,up:140,gr:300,w:1.6,len:.14,t:.4});fxSmoke(x.x,x.y,{u:o,col:KNC.c,n:3,r:x.r*.5,s:12,t:.8,al:.26,rise:40});
  fxShake(x.last?.35:.12,x.x,x.y);if(near(x.x,x.y)){gkS('zap',o);if(x.last)gkS('boom',o)}}};
// alerte de chaque éclair : télégraphe net (rayon réel 52, liseré rouge si ennemi), fond sombre pour bien le voir sur tout sol
AUXD.kn_strike=(x,k,t)=>{if(x.t>.35||x.done)return;const e=clamp(1-x.t/.3,0,1),q=P(x.x,x.y,0);fxSoftS(q.x,q.y,x.r*q.s*1.1,KNC.c,.35,x.r*q.s*1.1*K);fxTele(x.x,x.y,x.r,e,KNC.b,x,.14)};
// ---- trait : Foudre noire (charge de vitesse)
KGTRAITS[8]={nom:'Foudre noire',desc:'Tes éclairs noirs traversent la garde. Chaque fois qu\'un de tes jutsu de Kiminari touche, tu es plus rapide 2,5 s',
 landed(src,t,dmg,o){if(gkMine('kn_black')&&dmg>0){src.haste=Math.max(src.haste||0,2.5);src.kn_hs=2.5}},
 update(u,dt){if(u.kn_hs>0)u.kn_hs=Math.max(0,u.kn_hs-dt)},
 draw(u,p,S,sk){const t=performance.now()/1000,on=u.kn_hs>0;g.save();g.globalAlpha=fxA(u);if(on||Math.sin(t*5+u.y)>.7){const q=gkZig(p.x+(Math.sin(t*3)*14)*S,p.y-62*S,p.x-6*S,p.y-12*S,5,9*S,t*13);gkBolt(q,KNC.a,KNC.c,(on?2.2:1.4)*S,on?.9:.5,1)}g.restore()},
 prev(u,p,S,front){if(front)KGTRAITS[8].draw(u,p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Foudre noire'+(u.kn_hs>0?' · CHARGÉ':''),null,0,KNC.a,KNC.a)}};
AFTER.push(()=>UK.push('kn_hs'));
// ---- visuels
// trait noir : éclair sombre à cœur violet, traînée effilée
PROJD.kn_bolt=(p,R,ra,t)=>{g.rotate(ra);const L=R*6,A0=p&&p.owner?fxA(p):1,sd=Math.floor(t/50)+(p.x|0)*.01;fxTailL(L*1.6,R*3,KNC.b,.55*A0);fxSoftS(-L*.5,0,L*.7,KNC.c,.35*A0,R*1.6); // halo sombre (foudre noire)
 gkBolt(gkZig(-L,0,R,0,6,R*1.4,sd),KNC.a,KNC.c,R*.9,1,1);
 for(const sg of[-1,1]){const x0=-L*(.3+.2*fxH(sd|0,sg+1,1)),pts=gkZig(x0,0,x0-L*.55,sg*R*(1.6+fxH(sd|0,sg+1,2)),3,R*.7,sd+sg);gkBolt(pts,KNC.a,KNC.c,R*.45,.8,1)} // fourches qui crépitent le long du trait
 fxGlowS(R*.6,0,R*2.2,KNC.b,.8);fxGlowS(R*.6,0,R*.7,'#ffffff',.5)};
// arc noir : 6 éclairs qui couvrent EXACTEMENT le secteur touché (rayon r, demi-ouverture arc) + voile sombre bref sur ce secteur
JFXD.kn_arc=(f,k,e,t,u)=>{const x0=u&&!u.dead?u.x:f.x,y0=u&&!u.dead?u.y:f.y,R=f.r||260,arc=f.arc||.6,A=P(x0,y0,36);
 if(e<.5){g.save();g.globalAlpha=.3*(1-e*2);g.fillStyle=KNC.c;g.beginPath();const p0=P(x0,y0,2);g.moveTo(p0.x,p0.y);for(let i=0;i<=12;i++){const b=f.a-arc+2*arc*i/12,q=P(x0+Math.cos(b)*R,y0+Math.sin(b)*R,2);g.lineTo(q.x,q.y)}g.closePath();g.fill();g.globalCompositeOperation='lighter';g.strokeStyle=KNC.b;g.lineWidth=1.5;g.stroke();g.restore()}
 const n=6;for(let i=0;i<n;i++){const b=f.a+(i/(n-1)*2-1)*arc*.95,Bq=P(x0+Math.cos(b)*R,y0+Math.sin(b)*R,30);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,6,18,i*3+Math.floor(t*18)),KNC.a,KNC.c,3*A.s,k,1)}};
// tempête noire qui suit la cible du jugement : nuée sombre au-dessus d'elle, éclairs qui grondent
JFXD.kn_storm=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,a=Math.min(1,e*6)*Math.min(1,k*4),c=P(o.x,o.y,190),n=gkN(7,f);for(let i=0;i<n;i++){const b=i*.9+t*1.4,p=P(o.x+Math.cos(b)*40,o.y+Math.sin(b)*28,190+Math.sin(t*2+i)*8);fxSoftS(p.x,p.y,(22+(i%3)*6)*p.s,i%2?KNC.c:'#2a1a40',.5*a,(14+(i%3)*4)*p.s)}
 if(Math.sin(t*13+f.x)>.6)fxGlowS(c.x,c.y,40*c.s,KNC.b,.45*a,22*c.s)};
// éclair du jugement : tombe du ciel, sombre à cœur violet ; le dernier est plus gros
JFXD.kn_sky=(f,k,e,t)=>{const A=P(f.x,f.y,220),Bq=P(f.x,f.y,0),w=f.big?8:5;gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,8,20,(f.x+f.y)|0),KNC.a,KNC.c,w*A.s,k,1);if(f.big)gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,6,30,((f.x+f.y)|0)+3),KNC.a,KNC.c,3*A.s,k*.8,1);
 fxGlowS(Bq.x,Bq.y,(f.r||40)*Bq.s,KNC.b,.55*k,(f.r||40)*Bq.s*K,0);fxGlowS(Bq.x,Bq.y-20*Bq.s,16*Bq.s,KNC.a,.5*k)};

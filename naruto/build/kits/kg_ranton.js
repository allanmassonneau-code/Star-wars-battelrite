// ===== Kekkei genkai g5 : Ranton, la tempête (préfixe rt_) — Suiton + Raiton (Darui, Atsui… et le cirque laser) =====
// Identité : le tireur d'orage. Des rayons de foudre-eau, rapides et précis ; ta pluie TREMPE (trait) et tes rayons frappent plus fort
// et ralentissent une cible trempée. Rayon, nuage d'orage, rayon courbe, cirque laser, grand rayon canalisé ; dash : éclair d'orage.
gkPal('rt_storm','#e8fbff','#5ac8ff','#1a5a9a','#0a1e3a');
defKG(5,{n:'Ranton',col:'#4ab8f0',tag:'Ra',el:'Suiton + Raiton',nat:3,d:'La tempête : rayons de foudre-eau, nuages qui trempent, cirque laser',
 ico:f=>{g.lineWidth=2.6;g.beginPath();g.moveTo(-11,-6);g.lineTo(-3,-1);g.lineTo(-7,2);g.lineTo(11,9);g.stroke();g.beginPath();g.moveTo(5,-12);g.bezierCurveTo(8,-7,10,-5,10,-3);g.arc(6,-3,4,0,Math.PI);g.bezierCurveTo(2,-5,3,-7,5,-12);g.fill()}});
const RT_D={
 ray:'Rayon de foudre-eau instantané (520) : 14 dégâts',
 cloud:'Nuage d\'orage au point visé (420 max) pendant 3,5 s : la pluie trempe et ralentit ; un éclair frappe un ennemi dessous toutes les 0,7 s (5 dégâts)',
 curve:'Rayon qui suit ta visée en vol (1100 de vitesse) : 24 dégâts ; une cible trempée est étourdie 0,5 s',
 circus:'Reizâ Sâkasu : 8 rayons jaillissent en gerbe puis fondent sur les ennemis (520) : 5 dégâts chacun',
 great:'Grand rayon de tempête canalisé 1,8 s (immobile ; un étourdissement l\'arrête) : il suit lentement ta visée, 900 de long, 7 dégâts toutes les 0,2 s',
 dash:'Tu deviens éclair (220) : les ennemis sur ta trajectoire prennent 6 dégâts et sont trempés'};
KIT('g5',[
 ['D','x.rt_ray','Ranton : Rayon',RT_D.ray,'rt_storm'],
 ['C','x.rt_cloud','Ranton : Nuage d\'orage',RT_D.cloud,'rt_storm'],
 ['B','x.rt_curve','Ranton : Rayon courbe',RT_D.curve,'rt_storm'],
 ['A','x.rt_circus','Ranton : Reizâ Sâkasu',RT_D.circus,'rt_storm'],
 ['S','x.rt_great','Ranton : Grand rayon de tempête',RT_D.great,'rt_storm'],
]);
DASHG[5]={src:'x.rt_dash',n:'Éclair d\'orage',d:RT_D.dash,vfx:'rt_storm',cd:7};
KGBAL[5]=[0.98,0.98];
const RTC=GK.rt_storm;
const rtWet=e=>{if(!e.dead)e.wet=Math.max(e.wet||0,3)};
GKBEAM.rt=(f,k,e,t)=>gkBeamDraw(f,k,e,t,RTC.a,RTC.b,{z:34});
Object.assign(NAT,{
 // ---------- Rayon (D) ----------
 rt_ray:SP('Ranton : Rayon',RT_D.ray,5,{ai:RG(520,.75),line:{len:520,w:22}},(u,a)=>{gkS('zap',u);gkS('water',u);anim(u,'point',.35);gkBeam(u,u.x,u.y,a,520,22,14,{},'rt_storm','rt',null,.35)}),
 // ---------- Nuage d'orage (C) ----------
 rt_cloud:SP('Ranton : Nuage d\'orage',RT_D.cloud,8,{ai:RG(420,.6),tele:{r:100,max:420}},(u,a,td)=>{const c=atP(u,a,td,420);gkS('water',u);gkS('zap',u);anim(u,'gk_call',.6);
  aux.push({type:'rt_cloud',x:c.x,y:c.y,r:100,t:3.5,m:3.5,team:u.team,owner:u,k:.5,danger:1})}),
 // ---------- Rayon courbe (B) ----------
 rt_curve:SP('Ranton : Rayon courbe',RT_D.curve,10,{ai:RG(560,.65),line:{len:560,w:26}},(u,a)=>{gkS('zap',u);gkS('blaster',u);anim(u,'gk_push',.4);
  proj(u,a,{spd:1100,r:9,dmg:24,life:.58,col:RTC.b,kind:'rt_bolt',vfx:'rt_storm',steer:1,onHit:(p,t)=>{if(t.wet>0&&!t.dead&&t.unstop<=0){t.stun=Math.max(t.stun,.5);say(t,'ÉTOURDI','#b8f')}}})}),
 // ---------- Reizâ Sâkasu (A) ----------
 rt_circus:SP('Ranton : Reizâ Sâkasu',RT_D.circus,13,{ai:RG(500,.7)},(u,a)=>{gkS('zap',u);gkS('chidori',u);anim(u,'gk_call',.6);
  for(let i=0;i<8;i++){proj(u,a+(i-3.5)*.42,{spd:640,r:6,dmg:5,life:1.2,col:RTC.a,kind:'rt_bolt',vfx:'rt_storm',o:{slow:.3}});gkSteer(u,projs[projs.length-1],5.5,520)}
  jx({jfx:'gk_boom',x:u.x,y:u.y,r:60,v:'rt_storm',s:'blast',t:.4,m:.4})}),
 // ---------- Grand rayon de tempête (S) : canalisé ----------
 rt_great:ULT('Ranton : Grand rayon de tempête',RT_D.great,{ai:RG(700,.8),line:{len:900,w:46}},(u,a)=>{gkS('zap',u);gkS('roar',u);anim(u,'gk_push',1.9);u.rt_gr=1.8;
  aux.push({type:'rt_great',x:u.x,y:u.y,a,len:900,w:46,r:0,t:1.8,m:1.8,team:u.team,owner:u,ui:gkI(u),k:.15})}),
 // ---------- dash : Éclair d'orage ----------
 rt_dash:SP('Éclair d\'orage',RT_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||220,120,220);gkS('zap',u);anim(u,'lunge',.25);u.phase=Math.max(u.phase||0,.12);
  u.dash=null;u.kx=u.ky=0;u.x=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r);u.y=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);collide(u);
  const L=Math.hypot(u.x-x0,u.y-y0),b=Math.atan2(u.y-y0,u.x-x0);gkBeam(u,x0,y0,b,L,40,6,{},'rt_storm','rtz',e=>rtWet(e),.4)}),
});
Object.assign(NATHERO,{rt:'kylo'});
GKBEAM.rtz=(f,k,e,t)=>{const A=P(f.x,f.y,30),Bq=P(f.x2,f.y2,30);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,9,16,f.x+t*7),RTC.a,RTC.b,3*A.s,k)};
// nuage : pluie (trempe, ralentit), un éclair toutes les 0,7 s sur un ennemi dessous
AUXF.rt_cloud=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)){rtWet(e);if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.15)}
 if(x.k>0)return;x.k=.7;const L=enemies(o).filter(e=>gkIn(e,x.x,x.y,x.r));if(!L.length)return;const e=L[Math.floor(rnd()*L.length)];gkHit(e,o,5,{unblockable:1},'rt_storm');
 jx({jfx:'rt_strike',ti:gkI(e),x:e.x,y:e.y,t:.3,m:.3});if(near(e.x,e.y))gkS('zap',o)};
AUXD.rt_cloud=(x,k,t)=>{g.save();g.fillStyle=rgba(RTC.d,.2*k);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba(RTC.b,.35*k);g.lineWidth=1;for(let i=0;i<26;i++){const b=i*2.4,d=x.r*((i*.31)%1),z=120-((t*300+i*23)%120),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,z);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-1,p.y+9*p.s);g.stroke()}
 for(let i=0;i<9;i++){const b=i*.7+t*.3,d=x.r*.6*((i*.47)%1),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,126+Math.sin(t+i)*5),r=(26+(i%3)*8)*p.s;g.fillStyle=rgba(i%2?'#3a4a64':'#56688a',.75*k);g.beginPath();g.ellipse(p.x,p.y,r,r*.55,0,0,7);g.fill()}
 if(Math.sin(t*9)>.92){const p=P(x.x,x.y,120);g.globalCompositeOperation='lighter';g.fillStyle=rgba(RTC.a,.35);g.beginPath();g.ellipse(p.x,p.y,x.r*p.s*.6,x.r*p.s*.3,0,0,7);g.fill()}g.restore()};
// grand rayon : suit la visée à 1,6 rad/s ; coups toutes les 0,2 s ; un étourdissement l'arrête
AUXF.rt_great=(x,dt)=>{const u=x.owner;if(x.done||!u)return;if(u.dead||u.stun>0){x.done=1;x.t=0;u.rt_gr=0;return}if(x.t<=0){x.done=1;u.rt_gr=0;return}
 u.root=Math.max(u.root,.1);u.rootV=null;u.rt_gr=x.t;x.x=u.x;x.y=u.y;let df=(u.aim||0)-x.a;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;x.a+=clamp(df,-1.6*dt,1.6*dt);
 if(x.k<=0){x.k=.2;gkBeam(u,u.x,u.y,x.a,x.len,x.w,7,{silent:0},'rt_storm','rtg',null,.22);if(near(u.x,u.y))gkS('zap',u)}};
AUXD.rt_great=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const p=fwd(u,x.a,x.len);gkBeamDraw({x:u.x,y:u.y,x2:p.x,y2:p.y,w:x.w},.9,0,t,RTC.a,RTC.b,{z:36});
 const A=P(u.x+Math.cos(x.a)*20,u.y+Math.sin(x.a)*20,36),Bq=P(p.x,p.y,36);for(let j=0;j<2;j++)gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,14,22,t*13+j*5),RTC.a,RTC.b,2*A.s,.8)};
GKBEAM.rtg=()=>{};
// ---- trait : Pluie d'orage
KGTRAITS[5]={nom:'Pluie d\'orage',desc:'Tes jutsu de Ranton trempent la cible (3 s). Tes rayons sur une cible déjà trempée font +15 % de dégâts et la ralentissent 0,6 s',
 deal(src,t,dmg,o){return gkMine('rt_storm')&&t.wet>0?dmg*1.15:dmg},
 landed(src,t,dmg,o){if(!gkMine('rt_storm')||t.dead)return;if(t.wet>0&&t.unstop<=0&&!(t.slowImm>0))t.slow=Math.max(t.slow,.6);rtWet(t)},
 draw(u,p,S,sk){const t=performance.now()/1000;g.save();g.globalCompositeOperation='lighter';if(Math.sin(t*7+u.x)>.6){const q=gkZig(p.x-10*S,p.y-60*S,p.x+8*S,p.y-20*S,4,8*S,t*9);gkBolt(q,RTC.a,RTC.b,1.6*S,.6)}g.restore();
  if(u.rt_gr>0){g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(RTC.b,.25);g.beginPath();g.ellipse(p.x,p.y-34*S,26*S,40*S,0,0,7);g.fill();g.restore()}},
 prev(u,p,S,front){if(front)KGTRAITS[5].draw(u,p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Pluie d\'orage',null,0,RTC.a,RTC.a)}};
AFTER.push(()=>UK.push('rt_gr'));
// ---- visuels
// rayon courbe / laser du cirque : trait lumineux
PROJD.rt_bolt=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(RTC.b,.55);g.lineWidth=R*2.2;g.lineCap='round';g.beginPath();g.moveTo(-R*5,0);g.lineTo(R,0);g.stroke();g.strokeStyle=rgba(RTC.a,.95);g.lineWidth=R*.9;g.stroke();g.strokeStyle='#ffffff';g.lineWidth=R*.35;g.stroke()};
JFXD.rt_strike=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,A=P(o.x,o.y,140),Bq=P(o.x,o.y,10);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,7,14,f.x+e),RTC.a,RTC.b,3*A.s,k);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(RTC.a,.4*k);gEll(o.x,o.y,26);g.fill();g.restore()};

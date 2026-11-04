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
KGBAL[5]=[0.97,0.97];
const RTC=GK.rt_storm;
const rtWet=e=>{if(!e.dead)e.wet=Math.max(e.wet||0,3)};GKPOOLC.rt='#5ac8ff';
GKBEAM.rt=(f,k,e,t)=>gkBeamDraw(f,k,e,t,RTC.a,RTC.b,{z:34});
Object.assign(NAT,{
 // ---------- Rayon (D) ----------
 rt_ray:SP('Ranton : Rayon',RT_D.ray,5,{ai:RG(520,.75),line:{len:520,w:22}},(u,a)=>{gkS('zap',u);gkS('water',u);anim(u,'point',.35);gkBeam(u,u.x,u.y,a,520,22,14,{},'rt_storm','rt',null,.35);fxFlare(u.x+Math.cos(a)*22,u.y+Math.sin(a)*22,RTC.b,{u,z:34,r:20,t:.15});
  fxBurst(u.x+Math.cos(a)*22,u.y+Math.sin(a)*22,'#bfe6ff',{u,z:34,n:6,sp:240,a,arc:.7,up:40,gr:300,w:2,len:.05,t:.35})}),
 // ---------- Nuage d'orage (C) ----------
 rt_cloud:SP('Ranton : Nuage d\'orage',RT_D.cloud,8,{ai:RG(420,.6),tele:{r:100,max:420}},(u,a,td)=>{const c=atP(u,a,td,420);gkS('water',u);gkS('zap',u);anim(u,'gk_call',.6);fxCast(u,'rt_storm',.3,{n:8});
  aux.push({type:'rt_cloud',x:c.x,y:c.y,r:100,t:3.5,m:3.5,team:u.team,owner:u,k:.5,danger:1})}),
 // ---------- Rayon courbe (B) ----------
 rt_curve:SP('Ranton : Rayon courbe',RT_D.curve,10,{ai:RG(560,.65),line:{len:560,w:26}},(u,a)=>{gkS('zap',u);gkS('blaster',u);anim(u,'gk_push',.4);
  proj(u,a,{spd:1100,r:9,dmg:24,life:.58,col:RTC.b,kind:'rt_bolt',vfx:'rt_storm',steer:1,onHit:(p,t)=>{gkImp(p.owner,p.x,p.y,'rt_storm',30,{ring:0,dec:0});if(t.wet>0&&!t.dead&&t.unstop<=0){t.stun=Math.max(t.stun,.5);say(t,'ÉTOURDI','#b8f');fxArcs(t.x,t.y,34,RTC.a,{u:p.owner,z:36,n:4,t:.5})}}})}),
 // ---------- Reizâ Sâkasu (A) ----------
 rt_circus:SP('Ranton : Reizâ Sâkasu',RT_D.circus,13,{ai:RG(500,.7)},(u,a)=>{gkS('zap',u);gkS('chidori',u);anim(u,'gk_call',.6);
  for(let i=0;i<8;i++){proj(u,a+(i-3.5)*.42,{spd:640,r:6,dmg:5,life:1.2,col:RTC.a,kind:'rt_bolt',vfx:'rt_storm',o:{slow:.3}});gkSteer(u,projs[projs.length-1],5.5,520)}
  jx({jfx:'gk_boom',x:u.x,y:u.y,r:50,v:'rt_storm',s:'blast',t:.4,m:.4});fxArcs(u.x,u.y,50,RTC.a,{u,z:40,n:5,t:.35});fxBurst(u.x,u.y,RTC.a,{u,z:40,n:12,sp:300,a,arc:3.2,w:1.6,len:.14,c2:'#ffffff',t:.4})}),
 // ---------- Grand rayon de tempête (S) : canalisé ----------
 rt_great:ULT('Ranton : Grand rayon de tempête',RT_D.great,{ai:RG(700,.8),line:{len:900,w:46}},(u,a)=>{gkS('zap',u);gkS('roar',u);anim(u,'gk_push',1.9);u.rt_gr=1.8;fxGlyph(u.x,u.y,RTC.b,{ui:gkI(u),u,r:50,t:1.9,al:.55});
  aux.push({type:'rt_great',x:u.x,y:u.y,a,len:900,w:46,r:0,t:1.8,m:1.8,team:u.team,owner:u,ui:gkI(u),k:.15})}),
 // ---------- dash : Éclair d'orage ----------
 rt_dash:SP('Éclair d\'orage',RT_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||220,120,220);gkS('zap',u);anim(u,'lunge',.25);u.phase=Math.max(u.phase||0,.12);
  u.dash=null;u.kx=u.ky=0;u.x=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r);u.y=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);collide(u);
  const L=Math.hypot(u.x-x0,u.y-y0),b=Math.atan2(u.y-y0,u.x-x0);gkBeam(u,x0,y0,b,L,40,6,{},'rt_storm','rtz',e=>rtWet(e),.4);
  fxFlare(x0,y0,RTC.b,{u,z:30,r:24,t:.2});fxArcs(u.x,u.y,36,RTC.a,{u,z:30,n:3,t:.3});fxBurst(u.x,u.y,'#bfe6ff',{u,z:30,n:8,sp:200,up:80,gr:380,w:2,len:.05,t:.4})}),
});
Object.assign(NATHERO,{rt:'kylo'});
GKBEAM.rtz=(f,k,e,t)=>{const A=P(f.x,f.y,30),Bq=P(f.x2,f.y2,30);gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,9,16,f.x+t*7),RTC.a,RTC.b,3*A.s,k)};
// nuage : pluie (trempe, ralentit), un éclair toutes les 0,7 s sur un ennemi dessous
AUXF.rt_cloud=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)){rtWet(e);if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.15)}
 if(x.k>0)return;x.k=.7;const L=enemies(o).filter(e=>gkIn(e,x.x,x.y,x.r));if(!L.length)return;const e=L[Math.floor(rnd()*L.length)];gkHit(e,o,5,{unblockable:1},'rt_storm');
 jx({jfx:'rt_strike',ti:gkI(e),x:e.x,y:e.y,t:.3,m:.3});fxDecal(e.x,e.y,'burn',{u:o,r:18,t:1.5});fxBurst(e.x,e.y,RTC.a,{u:o,z:10,n:6,sp:220,up:120,gr:300,w:1.4,len:.12,t:.35});if(near(e.x,e.y))gkS('zap',o)};
// nuage d'orage : zone (bord net, liseré rouge si ennemi), sol mouillé, averse, nuage en bouffées douces, éclairs qui grondent à l'intérieur
AUXD.rt_cloud=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s;gkDim(x,()=>{fxSoftS(q.x,q.y,x.r*s,'#1a3a5a',.3*k,x.r*s*K);fxGlowS(q.x,q.y,x.r*s*.9,RTC.b,.16*k,x.r*s*.9*K,0);
 g.save();g.strokeStyle=rgba('#bfe6ff',.4*k);g.lineWidth=1;const n=gkN(26,x);for(let i=0;i<n;i++){const b=i*2.4,d=x.r*((i*.31)%1),z=120-((t*300+i*23)%120),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,z);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-1,p.y+9*p.s);g.stroke();
  if(z<14){g.strokeStyle=rgba('#bfe6ff',.3*k);g.beginPath();g.ellipse(p.x,p.y+9*p.s,4*p.s,1.6*p.s,0,0,7);g.stroke();g.strokeStyle=rgba('#bfe6ff',.4*k)}}g.restore();
 const fl=Math.max(0,Math.sin(t*9+x.x*.01)-.85)/.15,m=gkN(9,x);for(let i=0;i<m;i++){const b=i*.7+t*.3,d=x.r*.6*((i*.47)%1),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,126+Math.sin(t+i)*5),r=(28+(i%3)*9)*p.s;fxSoftS(p.x,p.y,r,i%2?'#3a4a64':'#56688a',.6*k,r*.6)}
 if(fl>0){const p=P(x.x,x.y,124);fxGlowS(p.x,p.y,x.r*p.s*.6,RTC.a,.5*fl,x.r*p.s*.3)}});gkEdge(x.x,x.y,x.r,GKPOOLC.rt,Math.min(1,x.t/.3)*Math.min(1,(x.m-x.t)/.15),x)};
// grand rayon : suit la visée à 1,6 rad/s ; coups toutes les 0,2 s ; un étourdissement l'arrête
AUXF.rt_great=(x,dt)=>{const u=x.owner;if(x.done||!u)return;if(u.dead||u.stun>0){x.done=1;x.t=0;u.rt_gr=0;return}if(x.t<=0){x.done=1;u.rt_gr=0;return}
 u.root=Math.max(u.root,.1);u.rootV=null;u.rt_gr=x.t;x.x=u.x;x.y=u.y;let df=(u.aim||0)-x.a;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;x.a+=clamp(df,-1.6*dt,1.6*dt);
 if(x.k<=0){x.k=.2;gkBeam(u,u.x,u.y,x.a,x.len,x.w,7,{silent:0},'rt_storm','rtg',null,.22);if(near(u.x,u.y))gkS('zap',u)}};
// grand rayon (couche du sol : les ninjas pris dedans restent dessinés par-dessus) : rayon à la largeur réelle, éclairs enroulés, lumière au sol tout du long, sphère d'orage aux mains, gerbe d'eau au bout
AUXD.rt_great=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const p=fwd(u,x.a,x.len),fi=Math.min(1,x.t/.2);gkBeamDraw({x:u.x,y:u.y,x2:p.x,y2:p.y,w:x.w,m:9,oi:x.ui},.9*fi,1,t,RTC.a,RTC.b,{z:36});
 const ca=Math.cos(x.a),sa=Math.sin(x.a),n=gkN(7,u);for(let i=0;i<n;i++){const f=(i+.5)/n*x.len,g2=P(u.x+ca*f,u.y+sa*f,0);fxGlowS(g2.x,g2.y,x.w*1.1*g2.s,RTC.b,.3*fi,x.w*.6*g2.s,0)}
 gkDim(u,()=>{const A=P(u.x+ca*20,u.y+sa*20,36),Bq=P(p.x,p.y,36);for(let j=0;j<2;j++)gkBolt(gkZig(A.x,A.y,Bq.x,Bq.y,14,22,t*13+j*5),RTC.a,RTC.b,2*A.s,.8*fi);
  const h=P(u.x+ca*24,u.y+sa*24,38);fxGlowS(h.x,h.y,(20+4*Math.sin(t*30))*h.s,RTC.b,.8*fi);fxGlowS(h.x,h.y,9*h.s,'#ffffff',.7*fi);
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#e8fbff',.8*fi);const m=gkN(10,u);for(let i=0;i<m;i++){const ph=(t*2.5+i*.37)%1,b=x.a+(((i*.618)%1)-.5)*1.6,d=ph*50,q=P(p.x+Math.cos(b)*d,p.y+Math.sin(b)*d,36+ph*(1-ph)*80);g.fillRect(q.x-1.2,q.y-1.2,2.4,2.4)}g.restore()})};
GKBEAM.rtg=()=>{};
// ---- trait : Pluie d'orage
KGTRAITS[5]={nom:'Pluie d\'orage',desc:'Tes jutsu de Ranton trempent la cible (3 s). Tes rayons sur une cible déjà trempée font +15 % de dégâts et la ralentissent 0,6 s',
 deal(src,t,dmg,o){return gkMine('rt_storm')&&t.wet>0?dmg*1.15:dmg},
 landed(src,t,dmg,o){if(!gkMine('rt_storm')||t.dead)return;if(t.wet>0&&t.unstop<=0&&!(t.slowImm>0))t.slow=Math.max(t.slow,.6);rtWet(t)},
 draw(u,p,S,sk){const t=performance.now()/1000;gkDim(u,()=>{if(Math.sin(t*7+u.x)>.75){const q=gkZig(p.x-12*S,p.y-58*S,p.x+10*S,p.y-22*S,4,8*S,Math.floor(t*18));gkBolt(q,RTC.a,RTC.b,1.3*S,.5)}
  if(u.rt_gr>0)fxGlowS(p.x,p.y,30*S,RTC.b,.4,10*S,0)})},
 prev(u,p,S,front){if(front)KGTRAITS[5].draw(u,p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Pluie d\'orage',null,0,RTC.a,RTC.a)}};
AFTER.push(()=>UK.push('rt_gr'));
// ---- visuels
// rayon courbe / laser du cirque : trait lumineux
// rayon courbe / laser du cirque : trait lumineux, traînée effilée, éclat à la pointe
// rayon courbe : le chemin parcouru reste dessiné (ruban de foudre qui suit la vraie trajectoire, courbes du pilote comprises) + tête crépitante
PROJD.rt_bolt=(p,R,ra,t)=>{const H=p._rth||(p._rth=[]),now=isGuest()?performance.now()/1000:SIMT;if(!H.length||H[H.length-1][2]!==now)H.push([p.x,p.y,now]);while(H.length>14||(H.length&&now-H[0][2]>.18))H.shift();const A0=p&&p.owner?fxA(p):1;
 if(H.length>1){const c=P(p.x,p.y,28);g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';for(const [w,col,al] of[[R*2.4,RTC.b,.3],[R*.9,RTC.a,.85]]){g.strokeStyle=rgba(col,al*A0);g.lineWidth=w;g.beginPath();
   H.forEach((h,i)=>{const q=P(h[0],h[1],28),jx=i&&i<H.length-1?(fxH(i,(performance.now()/50|0),1)-.5)*R*1.4:0;const X=(q.x-c.x)/c.s,Y=(q.y-c.y+jx)/c.s;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.lineTo(0,0);g.stroke()}g.restore()}
 g.rotate(ra);g.globalCompositeOperation='lighter';fxGlowS(0,0,R*3,RTC.b,.6*A0);g.strokeStyle=rgba(RTC.a,.95);g.lineWidth=R*.7;g.lineCap='round';g.beginPath();g.moveTo(-R*2.5,0);g.lineTo(R,0);g.stroke();
 const sd=(t/45|0)+(p.x|0);for(let i=0;i<3;i++){const b=(fxH(sd,i,1)-.5)*2.4+Math.PI,l=R*(2+2*fxH(sd,i,2));fxBoltS(0,0,Math.cos(b)*l,Math.sin(b)*l,RTC.b,1,sd+i,.35,3)}};
// éclair qui tombe du nuage sur un ennemi : éclair brisé, lueur au sol, onde
JFXD.rt_strike=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,A=P(o.x,o.y,140),Bq=P(o.x,o.y,10),gq=P(o.x,o.y,0);fxBoltS(A.x,A.y,Bq.x,Bq.y,RTC.b,3.2*A.s*k,(f.x|0)+Math.floor(t*18),.22,8);
 fxGlowS(gq.x,gq.y,30*gq.s,RTC.a,.6*k,30*gq.s*K,0);g.save();g.strokeStyle=rgba(RTC.a,.7*k);g.lineWidth=2;gEll(o.x,o.y,10+e*24);g.stroke();g.restore()};

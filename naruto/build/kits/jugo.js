// ===== Clan Jûgo (c27, préfixe jg_) : la lignée de Jûgo, l'énergie naturelle sans frein =====
// Identité : la bête qui monte en puissance. Trait « Fureur naturelle » : une jauge qui se remplit en frappant et en encaissant ; pleine,
// elle déclenche la transformation (marque maudite, +20 % de dégâts, plus rapide, 6 s). Membres qui mutent : bras-massue, bras-propulseur,
// bras-canon ; absorption de l'énergie naturelle ; ultime : Transformation sennin (géant, onde de choc). Dash : bond sauvage.
gkPal('jg_sage','#ffe0a0','#e8902a','#6a3a10','#2a1404');
const JGC=GK.jg_sage,JGG='#9ad05a',JG_B=6,JG_DMG=1.2;
const JG_D={
 club:'Ton bras mute en massue et s\'abat devant toi (120) : 18 dégâts et repousse',
 jet:'Ton bras devient propulseur : tu fonces (260) et percutes le premier ennemi : 18 dégâts, repoussé',
 absorb:'Tu absorbes l\'énergie naturelle : tu régénères 30 PV en 2 s, tu gagnes 12 chakra et 35 de fureur',
 cannon:'Ton bras devient canon : un obus de chakra (520) explose à l\'impact : 36 dégâts autour (rayon 80) et repousse',
 sennin:'Transformation sennin : onde de choc (140) : 30 dégâts et repousse ; tu deviens géant 6 s (−20 % de dégâts subis, +20 % infligés) et ta fureur est pleine',
 dash:'Bond sauvage (240) : à l\'atterrissage, 8 dégâts autour de toi'};
KIT('c27',[
 ['D','x.jg_club','Jûgo : Bras-massue',JG_D.club,'jg_sage'],
 ['C','x.jg_jet','Jûgo : Bras-propulseur',JG_D.jet,'jg_sage'],
 ['B','x.jg_absorb','Senjutsu : Absorption naturelle',JG_D.absorb,'jg_sage'],
 ['A','x.jg_cannon','Jûgo : Bras-canon',JG_D.cannon,'jg_sage'],
 ['S','x.jg_sennin','Jûgo : Transformation sennin',JG_D.sennin,'jg_sage'],
]);
DASHC[27]={src:'x.jg_dash',n:'Bond sauvage',d:JG_D.dash,vfx:'jg_sage',cd:7};
// fureur : +n (0-100) ; à 100, transformation (JG_B s)
function jgRage(u,n){if(!u||u.dead||u.jg_b>0||!(n>0))return;u.jg_f=Math.min(100,(u.jg_f||0)+n);u.jg_ft=SIMT;if(u.jg_f>=100){u.jg_f=100;jgBerserk(u,JG_B)}}
function jgBerserk(u,d){u.jg_b=Math.max(u.jg_b||0,d);u.unstop=Math.max(u.unstop||0,.6);say(u,'MARQUE MAUDITE !','#ffb04a');jx({jfx:'jg_burst',ui:gkI(u),x:u.x,y:u.y,t:.7,m:.7});
 fxLight(u.x,u.y,110,'#ff7a1a',{u,t:.4,a:.25});fxBurst(u.x,u.y,'#ff7a1a',{u,n:16,sp:260,c2:'#ffe0a0',up:120,gr:40,z:30});fxSmoke(u.x,u.y,{u,col:'#3a1a0a',n:5,r:30,s:14,al:.26,rise:50});if(near(u.x,u.y)){gkS('roar',u);shake=Math.max(shake,.2)}}
Object.assign(NAT,{
 // ---------- Bras-massue (D) : coup en arc devant soi ----------
 jg_club:SP('Jûgo : Bras-massue',JG_D.club,4.5,{ai:{max:125,p:.85}},(u,a)=>{gkS('heavy',u);gkS('rock',u);anim(u,'hammer',.45);
  for(const e of enemies(u))if(dist(u,e)<120+e.r&&angDiff(ang(u,e),a)<.8&&gkHit(e,u,18,{kb:260,melee:1},'jg_sage'))jgHitFx(u,e,1);jx({jfx:'jg_club',ui:gkI(u),x:u.x,y:u.y,a,t:.35,m:.35});
  const c=fwd(u,a,80);jx({jfx:'gk_boom',x:c.x,y:c.y,r:55,v:'jg_sage',s:'dust',t:.4,m:.4});later(u,.12,()=>{fxDebris(c.x,c.y,{u,n:6,sp:150,col:'#8a6040',c2:'#4a2a14',s:3.5});fxDecal(c.x,c.y,'crack',{u,r:46,t:3.5});fxRing(c.x,c.y,{u,r0:8,r1:55,col:JGC.b,w:5,t:.3})});if(near(u.x,u.y))shake=Math.max(shake,.12)}),
 // ---------- Bras-propulseur (C) : charge ----------
 jg_jet:SP('Jûgo : Bras-propulseur',JG_D.jet,8,{ai:{mode:'gap',min:90,max:260,p:.7},line:{len:260,w:44}},(u,a)=>{gkS('dash',u);gkS('flame',u);anim(u,'lunge',.35);
  aux.push({type:'jg_jet',x:u.x,y:u.y,r:0,t:.3,m:.3,team:u.team,owner:u,ui:gkI(u),a});dash(u,a,260,.26,{dmg:18,kb:340});
  fxFlare(u.x-Math.cos(a)*16,u.y-Math.sin(a)*16,'#ffb04a',{u,z:34,r:26,t:.2});fxSmoke(u.x,u.y,{u,col:'#5a4030',n:5,r:20,s:13,al:.26,rise:20,dx:-Math.cos(a)*60,dy:-Math.sin(a)*60});fxDecal(u.x,u.y,'scorch',{u,r:24,t:2.5});
  fxWind(u.x+Math.cos(a)*130,u.y+Math.sin(a)*130,a,{u,len:260,w:44,n:7,col:'#ffe0a0',t:.32})}),
 // ---------- Absorption naturelle (B) ----------
 jg_absorb:SP('Senjutsu : Absorption naturelle',JG_D.absorb,11,{ai:HEALM},(u)=>{gkS('genjutsu',u);anim(u,'channel',.7);u.jg_hot=2;u.energy=Math.min(100,(u.energy||0)+12);jgRage(u,35);
  jx({jfx:'jg_nature',ui:gkI(u),x:u.x,y:u.y,t:1.2,m:1.2});fxCast(u,'jg_sage',1.1,{glyph:1,n:12,c2:JGG,col:JGG});fxCharge(u,JGG,{u,t:1.1,n:10,r:90,c2:'#e8ffb0'});fxEmbers(u.x,u.y,60,JGG,{u,n:10,h:60,t:1.2,c2:'#e8ffb0'});fxLight(u.x,u.y,90,JGG,{u,t:1,a:.3})}),
 // ---------- Bras-canon (A) ----------
 jg_cannon:SP('Jûgo : Bras-canon',JG_D.cannon,12,{ai:RG(500,.65),line:{len:520,w:40}},(u,a)=>{gkS('boom',u);gkS('blaster',u);anim(u,'point',.5);u.kx-=Math.cos(a)*120;u.ky-=Math.sin(a)*120;
  fxCharge(u,JGC.b,{u,t:.25,n:8,r:50,c2:'#ffffff'});{const x=u.x+Math.cos(a)*30,y=u.y+Math.sin(a)*30;fxFlare(x,y,'#ffe0a0',{u,z:36,r:30,t:.2});fxSmoke(x,y,{u,col:'#6a5040',n:5,r:16,s:12,al:.26,dx:-Math.cos(a)*50,dy:-Math.sin(a)*50,rise:20});fxRing(x,y,{u,r0:6,r1:40,col:JGC.b,w:4,t:.25})}
  proj(u,a,{spd:760,r:15,dmg:36,life:.68,col:JGC.b,kind:'jg_shell',vfx:'jg_sage',rocket:1,ar:80,kb:260,tail:1});jx({jfx:'gk_boom',x:u.x+Math.cos(a)*30,y:u.y+Math.sin(a)*30,r:40,v:'jg_sage',s:'blast',t:.3,m:.3})}),
 // ---------- Transformation sennin (S) ----------
 jg_sennin:ULT('Jûgo : Transformation sennin',JG_D.sennin,{ai:SELF(170,.85),tele:{self:1,r:140}},(u)=>{gkS('roar',u);gkS('boom',u);anim(u,'roar',.8);
  gkAoe(u,u.x,u.y,140,30,{kb:380},'jg_sage',e=>{jgHitFx(u,e,1.3);fxHitStop(u,e,30,1)});u.giant=Math.max(u.giant||0,6);
  fxRing(u.x,u.y,{u,r0:20,r1:140,col:'#ff8a2a',c2:'#ffe0a0',w:10,t:.45});fxRing(u.x,u.y,{u,r0:40,r1:170,col:JGC.b,w:4,t:.65,al:.5});
  fxDebris(u.x,u.y,{u,n:16,sp:280,col:'#8a6040',c2:'#4a2a14',s:5});fxSmoke(u.x,u.y,{u,col:'#7a6050',n:9,r:120,s:16,al:.24,rise:30,t:1.3});fxDecal(u.x,u.y,'crack',{u,r:130,t:5});fxEmbers(u.x,u.y,120,JGG,{u,n:12,h:90,t:1.4,c2:'#ffe0a0'});fxShake(.4,u.x,u.y);u.jg_f=0;jgBerserk(u,6);u.unstop=Math.max(u.unstop,1.2);
  jx({jfx:'gk_boom',x:u.x,y:u.y,r:160,v:'jg_sage',s:'blast',t:.7,m:.7});if(near(u.x,u.y))shake=Math.max(shake,.45)}),
 // ---------- dash : Bond sauvage ----------
 jg_dash:SP('Bond sauvage',JG_D.dash,7,{ai:ESC},(u,a,td)=>{const d=clamp(td||240,120,240);gkS('dash',u);anim(u,'leap',.4);
  fxDebris(u.x,u.y,{u,n:5,sp:120,col:'#8a6040',c2:'#4a2a14',s:3});fxSmoke(u.x,u.y,{u,col:'#9a8268',n:3,r:16,s:11,al:.22});
  dash(u,a,d,.34,{jump:1,end:()=>{if(u.dead)return;gkAoe(u,u.x,u.y,70,8,{},'jg_sage');jx({jfx:'gk_boom',x:u.x,y:u.y,r:70,v:'jg_sage',s:'dust',t:.45,m:.45});fxRing(u.x,u.y,{u,r0:10,r1:70,col:JGC.b,w:6,t:.35});fxDebris(u.x,u.y,{u,n:7,sp:160,col:'#8a6040',c2:'#4a2a14',s:3.5});fxDecal(u.x,u.y,'crack',{u,r:56,t:3.5});if(near(u.x,u.y)){gkS('rock',u);shake=Math.max(shake,.1)}}})}),
});
Object.assign(NATHERO,{jg:'kylo'});
// ---- VFX (boîte à outils nr_fx.js)
function jgHitFx(o,e,s){if(!e||!near(e.x,e.y))return;fxFlare(e.x,e.y,'#ffe0a0',{u:o,z:32,r:22*s,t:.18});fxBurst(e.x,e.y,JGC.b,{u:o,n:8*s,sp:220,c2:'#ffffff',z:30,a:ang(o,e),arc:2});fxDebris(e.x,e.y,{u:o,n:3*s,sp:120,col:'#8a6040',c2:'#4a2a14',s:3});fxHitStop(o,e,18*s)}
// jet du bras-propulseur (flammes derrière le lanceur pendant la charge)
AUXF.jg_jet=(x,dt)=>{const o=x.owner;if(!o||o.dead){x.t=0;return}x.x=o.x;x.y=o.y;if(near(o.x,o.y))for(let i=0;i<2;i++)fx.push({x:o.x-Math.cos(x.a)*18+(rnd()-.5)*8,y:o.y-Math.sin(x.a)*18+(rnd()-.5)*8,z:30,vx:-Math.cos(x.a)*200+(rnd()-.5)*60,vy:-Math.sin(x.a)*200+(rnd()-.5)*60,t:.3,m:.3,col:i?JGC.a:JGC.b,r:4+rnd()*3,vfx:'fire'})};AUXD.jg_jet=()=>{};
// ---- trait : Fureur naturelle
TRAITS[27]={nom:'Fureur naturelle',desc:'Frapper et encaisser remplit ta fureur (elle retombe si tu restes 4 s sans combattre). Pleine, la marque maudite s\'étend : 6 s de transformation, +20 % de dégâts, plus rapide',
 update(u,dt){if(u.jg_cds!==u.cds){u.jg_cds=u.cds;u.jg_f=0;u.jg_b=0;u.jg_hot=0;u.jg_ft=-99}
  if(u.jg_hot>0){u.jg_hot-=dt;gain(u,15/HEALX*dt,u)}
  if(u.jg_b>0){u.jg_b=Math.max(0,u.jg_b-dt);u.haste=Math.max(u.haste||0,.1);if(!(u.jg_b>0))u.jg_f=0}
  else if(u.jg_f>0&&SIMT-(u.jg_ft??-99)>4)u.jg_f=Math.max(0,u.jg_f-6*dt)},
 deal(src,t,dmg,o){return src.jg_b>0&&t&&t.team!==src.team?dmg*JG_DMG:dmg},
 landed(src,t,dmg,o){if(t&&t!==src&&t.team!==src.team&&dmg>0)jgRage(src,dmg*.9)},
 take(t,src,dmg,o){if(src&&src!==t&&dmg>0)jgRage(t,dmg*.5);return dmg},
 draw(u,p,S,sk){const t=performance.now()/1000,b=u.jg_b>0,f=(u.jg_f||0)/100;sk=sk||1;g.save();
  if(b){g.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const a=i*.9+t*3,x=p.x+Math.cos(a)*14*S*sk,y=p.y-(10+((t*60+i*13)%50))*S;g.fillStyle=rgba(i%2?JGC.b:'#ff5a1a',.6);g.beginPath();g.moveTo(x-3*S,y);g.quadraticCurveTo(x,y-12*S,x+3*S,y);g.fill()}
   g.globalCompositeOperation='source-over';jgLimbs(u,p,S*sk,t);g.fillStyle=rgba('#3a1a0a',.55);for(const [dx,dy,r] of[[-7,-50,4],[6,-44,3.4],[-3,-36,3],[8,-30,2.6]]){g.beginPath();g.arc(p.x+dx*S*sk,p.y+dy*S*sk,r*S,0,7);g.fill()}}
  else if(f>.5){g.fillStyle=rgba(JGC.b,(f-.5)*.6);g.beginPath();g.ellipse(p.x,p.y,(16+f*8)*S*sk,(5+f*2)*S*sk,0,0,7);g.fill()}g.restore()},
 prev(u,p,S,front){if(front)TRAITS[27].draw(Object.assign({},u,{jg_b:1}),p,S,1)},
 hud(u,x,y){const f=Math.round(u.jg_f||0),b=u.jg_b>0,n=Math.round(f/10);gkHud(u,x,y,'Fureur naturelle · '+(b?'TRANSFORMÉ':'▮'.repeat(n)+'▯'.repeat(10-n)),null,0,b?'#ffb04a':f>=60?JGC.b:'#c89a6a','#c89a6a')}};
AFTER.push(()=>UK.push('jg_f','jg_b'));
// membres mutés de la transformation : un bras-massue hérissé à chaque épaule (celui du côté de la visée pointe vers elle, l'autre pend), qui se balancent ; trois pointes osseuses dans le dos
function jgLimbs(u,p,S,t){const A=u.aim||0,ax=Math.cos(A),ay=Math.sin(A)*.6;
 const sp=(x,y,a,l,w)=>{g.beginPath();g.moveTo(x+Math.cos(a+1.57)*w,y+Math.sin(a+1.57)*w);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.lineTo(x+Math.cos(a-1.57)*w,y+Math.sin(a-1.57)*w);g.closePath();g.fill();g.stroke()};
 g.fillStyle='#4a2a14';g.strokeStyle='#1e0e06';g.lineWidth=S;for(const [x0,a,h] of[[-7,-1.9,16],[0,-1.57,22],[7,-1.24,16]])sp(p.x+x0*S,p.y-50*S,a,h*S,3.2*S);
 for(const sd of[-1,1]){const fw=sd*ax>0,sw=Math.sin(t*5+sd*1.3)*.16,base=fw?Math.atan2(ay*.7+.45,ax):Math.atan2(1,sd*.35),a=base+sw,ox=p.x+sd*13*S,oy=p.y-42*S,L=(fw?27:20)*S,ex=ox+Math.cos(a)*L,ey=oy+Math.sin(a)*L,nx=-Math.sin(a),ny=Math.cos(a),R=(fw?9:7)*S;
  g.fillStyle='#7a5434';g.strokeStyle='#2a140a';g.lineWidth=1.3*S;g.beginPath();g.moveTo(ox+nx*4*S,oy+ny*4*S);g.lineTo(ex+nx*R*.8,ey+ny*R*.8);g.lineTo(ex-nx*R*.8,ey-ny*R*.8);g.lineTo(ox-nx*4*S,oy-ny*4*S);g.closePath();g.fill();g.stroke();
  g.fillStyle='#4a2a14';for(const k of[-1,0,1])sp(ex+Math.cos(a+k*.9)*R*.7,ey+Math.sin(a+k*.9)*R*.7,a+k*.9,R*.95,2.6*S);
  g.fillStyle='#8a6040';g.beginPath();g.arc(ex,ey,R,0,7);g.fill();g.stroke();
  g.strokeStyle=rgba('#ff8a2a',.6+.3*Math.sin(t*9+sd));g.lineWidth=1.5*S;g.beginPath();g.moveTo(ox+Math.cos(a)*5*S,oy+Math.sin(a)*5*S);g.lineTo(ex-Math.cos(a)*R*.3+nx*2*S,ey-Math.sin(a)*R*.3+ny*2*S);g.lineTo(ex+nx*R*.5,ey+ny*R*.5);g.stroke()}}
// ---- apparence : yeux ambrés, marque maudite au visage (sauf autre marque choisie), carrure un peu plus massive
CLOOK[27]=(look)=>{const h=look.head;h.eye=h.eye||'#e8902a';if(!h.face)h.face='maudite';look.scale=Math.max(look.scale||1,1.06)};
// ---- visuels
// obus de chakra : noyau brûlant, anneaux de compression
PROJD.jg_shell=(p,R,ra,t)=>{g.rotate(ra);g.save();g.globalCompositeOperation='lighter';for(let i=1;i<6;i++){g.fillStyle=rgba(JGC.b,.35*(1-i/6));g.beginPath();g.arc(-i*R*.8,Math.sin(t/50+i)*2,R*(1-i*.12),0,7);g.fill()}
 const gr=g.createRadialGradient(0,0,0,0,0,R*1.6);gr.addColorStop(0,'#ffffff');gr.addColorStop(.35,JGC.a);gr.addColorStop(1,rgba(JGC.b,0));g.fillStyle=gr;g.beginPath();g.arc(0,0,R*1.6,0,7);g.fill();g.restore();
 g.strokeStyle=rgba('#fff0c8',.8);g.lineWidth=1.5;for(let i=0;i<2;i++){const k=((t/120+i*.5)%1);g.beginPath();g.ellipse(-k*R*2,0,R*.4,R*(1+k),0,0,7);g.stroke()}};
// arc du bras-massue : grosse masse orange qui balaie
JFXD.jg_club=(f,k,e,t,u)=>{const x0=u&&!u.dead?u.x:f.x,y0=u&&!u.dead?u.y:f.y,b=f.a-.8+1.6*Math.min(1,e*1.6),c=P(x0+Math.cos(b)*104,y0+Math.sin(b)*104,30),A=P(x0,y0,36),G=P(x0,y0,0);g.save();g.globalAlpha=Math.min(1,k*2);
 {const ra=Math.atan2(Math.sin(f.a-.8)*K,Math.cos(f.a-.8)),rb=Math.atan2(Math.sin(b)*K,Math.cos(b));g.globalCompositeOperation='lighter';g.fillStyle=rgba(JGC.b,.16*k);g.beginPath();g.moveTo(G.x,G.y);g.ellipse(G.x,G.y,120*G.s,120*G.s*K,0,ra,rb);g.closePath();g.fill();g.globalCompositeOperation='source-over'} // secteur balayé = portée réelle
 g.strokeStyle=rgba(JGC.b,.4);g.lineWidth=18*A.s;g.lineCap='round';g.beginPath();g.ellipse(A.x,A.y+4*A.s,104*A.s,104*A.s*K,0,f.a-.8,b);g.stroke();
 g.strokeStyle=JGC.c;g.lineWidth=9*A.s;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(c.x,c.y);g.stroke();g.fillStyle=JGC.b;g.strokeStyle=JGC.d;g.lineWidth=1.5;g.beginPath();g.arc(c.x,c.y,15*c.s,0,7);g.fill();g.stroke();
 g.fillStyle=JGC.c;for(let i=0;i<5;i++){const a=i*1.26;g.beginPath();g.arc(c.x+Math.cos(a)*11*c.s,c.y+Math.sin(a)*11*c.s,3.5*c.s,0,7);g.fill()}g.restore()};
// énergie naturelle qui converge (points verts et feuilles)
JFXD.jg_nature=(f,k,e,t,u)=>{const cx=u&&!u.dead?u.x:f.x,cy=u&&!u.dead?u.y:f.y;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<18;i++){const b=i*.349+t,d=150*(1-((e*1.6+i/18)%1)),p=P(cx+Math.cos(b)*d,cy+Math.sin(b)*d,20+(i%4)*10);g.fillStyle=rgba(i%3?JGG:'#e8ffb0',.8*k);g.beginPath();g.arc(p.x,p.y,(2+(i%2))*p.s,0,7);g.fill()}
 const q=P(cx,cy,0);g.strokeStyle=rgba(JGG,.6*k);g.lineWidth=2;gEll(cx,cy,30+20*Math.sin(t*6));g.stroke();g.restore()};
// la marque maudite s'étend : anneau de flammes sombres
JFXD.jg_burst=(f,k,e,t,u)=>{const cx=u&&!u.dead?u.x:f.x,cy=u&&!u.dead?u.y:f.y,R=30+e*90;g.save();g.strokeStyle=rgba('#ff7a1a',.85*k);g.lineWidth=5*k+1;gEll(cx,cy,R);g.stroke();g.strokeStyle=rgba('#3a1a0a',.7*k);g.lineWidth=3;gEll(cx,cy,R*.8);g.stroke();
 g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const b=i*.628,p=P(cx+Math.cos(b)*R,cy+Math.sin(b)*R,6);const h=22*k*p.s;g.fillStyle=rgba(JGC.b,.7*k);g.beginPath();g.moveTo(p.x-4*p.s,p.y);g.quadraticCurveTo(p.x,p.y-h*2,p.x+4*p.s,p.y);g.fill()}g.restore()};

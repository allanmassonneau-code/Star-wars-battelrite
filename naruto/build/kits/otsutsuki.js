// ===== Clan Ôtsutsuki (c24, préfixe ot_) : le clan céleste (façon Kaguya, Hagoromo) =====
// Identité : le prédateur de chakra. Trait « Gudôdama » : deux orbes de vérité gravitent autour du lanceur et dévorent les tirs ennemis ;
// ses jutsu célestes absorbent le chakra à chaque touche. Orbe chercheur, Banshô Ten'in (attraction), Shinra Tensei (répulsion),
// os des cendres (Haikotsu), Kyûkyoku Kôdô Kyûdama (l'orbe qui s'étend). Dash : portail céleste.
gkPal('ot_void','#ffffff','#c8b8ff','#2a1a4a','#0a0414');
const OTC=GK.ot_void,OT_N=2,OT_RE=8,OT_CK=3; // orbes, recharge d'un orbe (s), chakra absorbé par touche
const OT_D={
 orb:'Un orbe de vérité file vers l\'ennemi le plus proche de sa course (500) : 15 dégâts et ralentit 0,6 s',
 pull:'Banshô Ten\'in : une force invisible saisit le premier ennemi touché (480) et l\'attire jusqu\'à toi : 14 dégâts',
 push:'Shinra Tensei : tout est repoussé autour de toi (150) : 22 dégâts, les ennemis sont projetés au loin et les tirs ennemis proches détruits',
 bone:'Haikotsu : un os des cendres perce en ligne (560) : 30 dégâts, ralentit 1 s ; les cendres rongent la cible (4 dégâts par seconde, 3 s)',
 ball:'Kyûkyoku Kôdô Kyûdama : un orbe noir tombe sur le point visé (380 max) et s\'étend 1,3 s : 55 dégâts (rayon 170), il absorbe 15 chakra à chaque ennemi touché',
 dash:'Tu ouvres un portail céleste et réapparais plus loin (230) ; intangible 0,25 s'};
KIT('c24',[
 ['D','x.ot_orb','Gudôdama : Orbe chercheur',OT_D.orb,'ot_void'],
 ['C','x.ot_pull','Banshô Ten\'in',OT_D.pull,'ot_void'],
 ['B','x.ot_push','Shinra Tensei',OT_D.push,'ot_void'],
 ['A','x.ot_bone','Haikotsu : Os des cendres',OT_D.bone,'ot_void'],
 ['S','x.ot_ball','Kyûkyoku Kôdô Kyûdama',OT_D.ball,'ot_void'],
]);
DASHC[24]={src:'x.ot_dash',n:'Portail céleste',d:OT_D.dash,vfx:'ot_void',cd:7};
// chakra absorbé (cible → lanceur)
function otDrain(o,t,n){if(!o||!t||t.dead)return;const d=Math.min(n,t.energy||0);t.energy=Math.max(0,(t.energy||0)-n);if(!o.dead)o.energy=Math.min(100,(o.energy||0)+d);if(d>0&&near(t.x,t.y))jx({jfx:'ot_suck',ti:gkI(t),ui:gkI(o),x:t.x,y:t.y,t:.5,m:.5})}
Object.assign(NAT,{
 // ---------- Orbe chercheur (D) ----------
 ot_orb:SP('Gudôdama : Orbe chercheur',OT_D.orb,5,{ai:RG(490,.75),line:{len:500,w:30}},(u,a)=>{gkS('rasengan',u);anim(u,'point',.35);
  proj(u,a,{spd:600,r:11,dmg:15,life:.84,col:OTC.b,kind:'ot_orb',vfx:'ot_void',o:{slow:.6}});gkSteer(u,projs[projs.length-1],2.4,230)}),
 // ---------- Banshô Ten'in (C) : grappin invisible ----------
 ot_pull:SP('Banshô Ten\'in',OT_D.pull,8,{ai:RG(470,.6),line:{len:480,w:26}},(u,a)=>{gkS('wind',u);gkS('genjutsu',u);anim(u,'palm',.45);
  proj(u,a,{spd:1150,r:12,dmg:14,life:.42,col:OTC.b,kind:'ot_pull',vfx:'ot_void',hook:1,o:{unblockable:1}})}),
 // ---------- Shinra Tensei (B) : onde de répulsion, détruit les tirs proches ----------
 ot_push:SP('Shinra Tensei',OT_D.push,10,{ai:SELF(150,.75),tele:{self:1,r:150}},(u)=>{gkS('boom',u);gkS('wind',u);anim(u,'twohand',.5);
  gkAoe(u,u.x,u.y,150,22,{kb:420,fx:u.x,fy:u.y},'ot_void');let n=0;for(const p of projs)if(!p.dead&&p.life>0&&p.owner&&p.owner.team!==u.team&&!p.grenade&&Math.hypot(p.x-u.x,p.y-u.y)<170){p.life=0;n++}
  jx({jfx:'ot_wave',x:u.x,y:u.y,r:170,t:.6,m:.6});if(n&&near(u.x,u.y))say(u,'REPOUSSÉ','#e8e0ff');if(near(u.x,u.y))shake=Math.max(shake,.3)}),
 // ---------- Haikotsu (A) : os perçant, cendres qui rongent ----------
 ot_bone:SP('Haikotsu : Os des cendres',OT_D.bone,12,{ai:RG(540,.65),line:{len:560,w:22}},(u,a)=>{gkS('bone',u);gkS('blaster',u);anim(u,'throw2',.45);
  proj(u,a,{spd:1050,r:9,dmg:30,life:.53,col:'#f4f0e8',kind:'ot_bone',vfx:'ot_void',pierce:1,o:{slow:1,dot:{dps:4,dur:3}},onHit:(p,t)=>{if(near(t.x,t.y))sparks(t.x,t.y,'#d8d4cc',10,'smoke')}})}),
 // ---------- Kyûkyoku Kôdô Kyûdama (S) : l'orbe tombe, s'étend puis éclate ----------
 ot_ball:ULT('Kyûkyoku Kôdô Kyûdama',OT_D.ball,{ai:RG(380,.85),tele:{r:170,max:380}},(u,a,td)=>{const c=atP(u,a,td,380),D=1.3;gkS('rasengan',u);gkS('roar',u);anim(u,'gk_call',1.1);jx({jfx:'ot_grow',x:c.x,y:c.y,r:170,d:D,t:D+.05,m:D+.05});
  later(u,D,()=>{gkAoe(u,c.x,c.y,170,55,{kb:200},'ot_void',e=>otDrain(u,e,15));jx({jfx:'ot_burst',x:c.x,y:c.y,r:190,t:.8,m:.8});if(near(c.x,c.y)){gkS('boom',u);gkS('heavy',u);shake=Math.max(shake,.5)}},{x:c.x,y:c.y,r:170})}),
 // ---------- dash : Portail céleste ----------
 ot_dash:SP('Portail céleste',OT_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||230,110,230);gkS('poof',u);gkS('genjutsu',u);anim(u,'seal',.3);u.phase=Math.max(u.phase||0,.25);u.dash=null;u.kx=u.ky=0;
  u.x=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r);u.y=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);collide(u);jx({jfx:'ot_gate',x:x0,y:y0,t:.45,m:.45});jx({jfx:'ot_gate',x:u.x,y:u.y,t:.45,m:.45})}),
});
Object.assign(NATHERO,{ot:'kylo'});
// ---- trait : Gudôdama (2 orbes qui dévorent les tirs) + absorption du chakra
TRAITS[24]={nom:'Gudôdama',desc:'Deux orbes de vérité gravitent autour de toi : chacun dévore un tir ennemi qui t\'atteint, puis se reforme en 8 s. Tes jutsu célestes absorbent 3 chakra à chaque touche',
 update(u,dt){if(u.ot_cds!==u.cds){u.ot_cds=u.cds;u.ot_n=OT_N;u.ot_k=0}
  if(u.ot_n<OT_N){u.ot_k+=dt;if(u.ot_k>=OT_RE){u.ot_k=0;u.ot_n++}}if(u.dead||!(u.ot_n>0))return;
  for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===u.team)continue;const rr=u.r+p.r+14;if(Math.abs(p.x-u.x)>rr||Math.abs(p.y-u.y)>rr||Math.hypot(p.x-u.x,p.y-u.y)>rr)continue;
   p.life=0;u.ot_n--;jx({jfx:'ot_eat',x:p.x,y:p.y,t:.4,m:.4});if(near(u.x,u.y)){say(u,'DÉVORÉ','#e8e0ff');gkS('deflect',u)}if(!(u.ot_n>0))break}},
 landed(src,t,dmg,o){if(VFX==='ot_void'&&dmg>0&&t&&t!==src)otDrain(src,t,OT_CK)},
 draw(u,p,S,sk){const t=performance.now()/1000,n=u.ot_n??OT_N;sk=sk||1;g.save();for(let i=0;i<OT_N;i++){const b=t*1.6+i*Math.PI,x=p.x+Math.cos(b)*24*S*sk,y=p.y-46*S+Math.sin(b)*8*S,on=i<n,r=5.2*S;
  g.globalAlpha=on?1:.22;g.fillStyle='#0a0414';g.strokeStyle=OTC.b;g.lineWidth=1.4;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.stroke();if(on){g.fillStyle=rgba('#ffffff',.6);g.beginPath();g.arc(x-r*.35,y-r*.35,r*.28,0,7);g.fill()}}g.restore()},
 prev(u,p,S,front){if(front)TRAITS[24].draw(Object.assign({},u,{ot_n:OT_N}),p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Gudôdama · orbes : '+'●'.repeat(u.ot_n??OT_N)+'○'.repeat(OT_N-(u.ot_n??OT_N)),null,0,'#e8e0ff','#a898d8')}};
AFTER.push(()=>UK.push('ot_n'));
// ---- apparence : Byakugan, chakra blanc ; peau pâle si le créateur garde la peau d'origine
CLOOK[24]=(look,l)=>{const h=look.head;h.eye='#e8e8f8';h.eyeT=null;if(!(l.p|0))h.skin='#f4ecee';if(look.weapon)look.weapon.col='#eeeeff'};
// ---- visuels
// orbe de vérité : sphère noire, liseré lavande, reflet
PROJD.ot_orb=(p,R,ra,t)=>{g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(OTC.b,.25);g.beginPath();g.arc(0,0,R*1.8,0,7);g.fill();g.restore();g.rotate(ra);
 g.fillStyle=rgba(OTC.b,.3);for(let i=1;i<5;i++){g.beginPath();g.arc(-i*R*.7,Math.sin(t/70+i)*2,R*(1-i*.17),0,7);g.fill()}
 const gr=g.createRadialGradient(-R*.3,-R*.3,0,0,0,R);gr.addColorStop(0,'#3a2a5a');gr.addColorStop(.6,'#0a0414');gr.addColorStop(1,'#000');g.fillStyle=gr;g.strokeStyle=OTC.b;g.lineWidth=1.6;g.beginPath();g.arc(0,0,R,0,7);g.fill();g.stroke();
 g.fillStyle=rgba('#ffffff',.7);g.beginPath();g.arc(-R*.35,-R*.35,R*.22,0,7);g.fill()};
// main invisible du Banshô Ten'in : anneaux de distorsion
PROJD.ot_pull=(p,R,ra,t)=>{g.rotate(ra);g.strokeStyle=rgba(OTC.b,.85);for(let i=0;i<3;i++){const k=((t/160+i/3)%1);g.lineWidth=2*(1-k)+.5;g.beginPath();g.ellipse(-k*R*2,0,R*(.5+k*.8),R*(1+k*1.2),0,0,7);g.stroke()}
 g.fillStyle=rgba('#ffffff',.85);g.beginPath();g.arc(0,0,R*.35,0,7);g.fill()};
// os des cendres : os blanc effilé, cendres qui s'en détachent
PROJD.ot_bone=(p,R,ra,t)=>{g.rotate(ra);g.fillStyle=rgba('#bcb6ac',.55);for(let i=1;i<6;i++)g.fillRect(-14-i*8,Math.sin(t/50+i*2)*3-1,2.5,2.5);
 g.fillStyle='#f4f0e8';g.strokeStyle='#6a645a';g.lineWidth=.9;g.beginPath();g.moveTo(R*2.2,0);g.lineTo(R*.6,-R*.45);g.lineTo(-R*1.6,-R*.35);g.arc(-R*1.8,-R*.35,R*.4,0,7);g.moveTo(-R*1.6,R*.35);g.arc(-R*1.8,R*.35,R*.4,0,7);g.lineTo(-R*1.6,R*.35);g.lineTo(R*.6,R*.45);g.closePath();g.fill();g.stroke()};
// onde du Shinra Tensei : sphère d'air déformé, sol balayé
JFXD.ot_wave=(f,k,e,t)=>{const q=P(f.x,f.y,30),s=q.s,R=f.r*(.2+e*.9);g.save();g.strokeStyle=rgba('#ffffff',.85*k);g.lineWidth=(6*k+1)*s;g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*.75,0,0,7);g.stroke();
 g.strokeStyle=rgba(OTC.b,.6*k);g.lineWidth=3*s;g.beginPath();g.ellipse(q.x,q.y,R*.8*s,R*.6*s,0,0,7);g.stroke();g.strokeStyle=rgba(OTC.b,.5*k);g.lineWidth=2;gEll(f.x,f.y,R*1.05);g.stroke();
 for(let i=0;i<14;i++){const b=i*.449,p=P(f.x+Math.cos(b)*R,f.y+Math.sin(b)*R,4);g.fillStyle=rgba('#d8d0c0',.7*k);g.fillRect(p.x-2,p.y-2,4,4)}g.restore()};
// orbe qui grandit au-dessus du point visé (l'alerte au sol est celle de later)
JFXD.ot_grow=(f,k,e,t)=>{const m=Math.min(1,e*f.m/f.d),z=200-120*m,q=P(f.x,f.y,z),s=q.s,R=(14+f.r*.55*m*m)*s;g.save();g.fillStyle=rgba('#000000',.2+.25*m);gEll(f.x,f.y,f.r*m);g.fill();
 g.globalCompositeOperation='lighter';g.fillStyle=rgba(OTC.b,.3);g.beginPath();g.arc(q.x,q.y,R*1.35,0,7);g.fill();g.globalCompositeOperation='source-over';
 const gr=g.createRadialGradient(q.x-R*.3,q.y-R*.3,0,q.x,q.y,R);gr.addColorStop(0,'#3a2a5a');gr.addColorStop(.7,'#0a0414');gr.addColorStop(1,'#000');g.fillStyle=gr;g.strokeStyle=OTC.b;g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill();g.stroke();
 g.strokeStyle=rgba(OTC.b,.7);g.lineWidth=1.2;for(let i=0;i<6;i++){const b=t*2+i*1.05,r2=R*(1.3+.25*Math.sin(t*5+i));g.beginPath();g.arc(q.x,q.y,r2,b,b+.6);g.stroke()}g.restore()};
// éclatement : dôme noir qui se dissout en lumière
JFXD.ot_burst=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,R=f.r*(.6+e*.5);g.save();g.globalAlpha=Math.min(1,k*1.6);const gr=g.createRadialGradient(q.x,q.y-R*s*.25,0,q.x,q.y-R*s*.25,R*s);gr.addColorStop(0,'rgba(10,4,20,.9)');gr.addColorStop(.75,rgba(OTC.c,.6));gr.addColorStop(1,rgba(OTC.b,0));
 g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y-R*s*.25,R*s,R*s*.7,0,0,7);g.fill();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=(5*k+1)*s;gEll(f.x,f.y,R);g.stroke();
 for(let i=0;i<16;i++){const b=i*.393,d=R*(.3+e*.7),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,20+e*50);g.fillStyle=rgba(i%2?OTC.b:'#ffffff',.8*k);g.beginPath();g.arc(p.x,p.y,3*p.s,0,7);g.fill()}g.restore()};
// orbe qui dévore un tir
JFXD.ot_eat=(f,k,e)=>{const q=P(f.x,f.y,30);g.save();g.strokeStyle=rgba(OTC.b,k);g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,(14-e*10)*q.s,0,7);g.stroke();g.fillStyle=rgba('#0a0414',.8*k);g.beginPath();g.arc(q.x,q.y,(8-e*6)*q.s,0,7);g.fill();g.restore()};
// chakra aspiré de la cible vers le lanceur
JFXD.ot_suck=(f,k,e,t,u,tg)=>{if(!u||!tg)return;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const m=Math.min(1,e*1.4-i*.08);if(m<=0)continue;const p=P(lerp(tg.x,u.x,m),lerp(tg.y,u.y,m),34+Math.sin(m*Math.PI)*20);g.fillStyle=rgba(i%2?'#7ab8ff':OTC.b,.85*k);g.beginPath();g.arc(p.x+Math.sin(i*2+t*9)*4,p.y,3*p.s,0,7);g.fill()}g.restore()};
// portail céleste : anneau vertical d'où l'on sort
JFXD.ot_gate=(f,k,e,t)=>{const q=P(f.x,f.y,34),s=q.s,w=16*s*Math.sin(Math.PI*Math.min(1,e*1.2)),h=40*s;g.save();g.fillStyle=rgba('#0a0414',.75*k);g.beginPath();g.ellipse(q.x,q.y,w,h,0,0,7);g.fill();g.strokeStyle=rgba(OTC.b,k);g.lineWidth=2.5*s;g.stroke();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.6*k);g.lineWidth=1;g.beginPath();g.ellipse(q.x,q.y,w*.6,h*.8,0,t*3,t*3+3);g.stroke();g.restore()};

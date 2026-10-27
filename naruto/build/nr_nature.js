// ---------- Natures sur mesure : Fûton et Katon (mécaniques propres) ----------
// aux : objets de jeu spéciaux (couloir de vent, tornades, zones de brûlure progressives) mis à jour et dessinés à part
let aux=[];
const BURN=(dps=4,dur=3)=>({dps,dur});
const wind=(u,a,o)=>proj(u,a,Object.assign({spd:820,r:7,dmg:10,life:.6,col:'#c8fff0',o:{kb:120}},o));
const fireP=(u,a,o)=>proj(u,a,Object.assign({spd:700,r:8,dmg:12,life:.7,col:'#ff7a2a',o:{dot:BURN()}},o));
// charges : le 1er lancement prépare n projectiles, chaque relance en tire un pendant 5 s
function stackAb(key,n,fireOne){return function(u,a,t){const i=u.ch.abil.findIndex(x=>x.key===key);if(i<0)return;
 if(u.jst&&u.jst.key===key){fireOne(u,a,t);u.jst.n--;if(u.jst.n<=0){u.cds[i]=u.jst.cd;u.jst=null}else u.cds[i]=.25}
 else{u.jst={key,i,n,t:5,cd:u.ch.abil[i].cd,v:u.ch.abil[i].vfx};u.cds[i]=.25;say(u,'×'+n,'#ffd38a')}}}
// mur : segments perpendiculaires à la visée ; bloque les tirs et le passage des ennemis ; peut brûler
function wallLine(u,a,n,o){const c=fwd(u,a,95),px=-Math.sin(a),py=Math.cos(a);for(let i=-n;i<=n;i++)walls.push(Object.assign({x:c.x+px*i*24,y:c.y+py*i*24,r:14,t:4,team:u.team,owner:u},o))}
// canalisation de zone (Nuée ardente) : relancer pour relâcher, plus on attend plus ça fait mal
function chanAb(key){return function(u,a,t){const i=u.ch.abil.findIndex(x=>x.key===key);if(i<0)return;
 if(u.chan&&u.chan.key===key){releaseChan(u);return}const p=fwd(u,a,Math.min(t||300,480));u.chan={key,i,x:p.x,y:p.y,r:150,t:0,max:3,cd:u.ch.abil[i].cd};u.cds[i]=.3;
 aux.push({type:'chan',x:p.x,y:p.y,r:150,t:3.3,m:3.3,team:u.team,owner:u,vfx:'fire',k:0})}}
function releaseChan(u){const c=u.chan;if(!c)return;u.chan=null;u.cds[c.i]=c.cd;const pow=1+1.6*Math.min(1,c.t/c.max);VFX='fire';aoe(u,c.x,c.y,c.r,26*pow,{dot:BURN(5,3),unblockable:1},'#ff7a2a');field(u,c.x,c.y,{r:c.r,t:2.5,dps:6*pow,col:'#ff7a2a',vfx:'fire'});detoFx(c.x,c.y,c.r,'fire');if(near(c.x,c.y)){shake=Math.max(shake,.35);S('boom',u)}VFX=null;
 for(const x of aux)if(x.type==='chan'&&x.owner===u)x.t=0;say(u,'NUÉE ARDENTE ×'+pow.toFixed(1),'#ff9a3a')}
const NAT={
 // ---- Fûton
 fu_wall:SP('Fûton : Mur de vent','Mur de vent qui bloque les projectiles et le passage',8,{ai:DEF},(u,a)=>{wallLine(u,a,2,{wind:1});S('wind',u)}),
 fu_bullet:SP('Fûton : Balle d\'air','Projectile de vent qui repousse légèrement',4,{ai:RG(520,.7)},(u,a)=>{S('wind',u);wind(u,a,{})}),
 fu_tri:SP('Fûton : Triple balle d\'air','3 projectiles de vent qui repoussent légèrement',6,{ai:RG(520,.6)},(u,a)=>{S('wind',u);for(const k of[-.18,0,.18])wind(u,a+k,{dmg:8,o:{kb:100}})}),
 fu_big:SP('Fûton : Grande balle d\'air','Gros projectile de vent',7,{cast:.2,line:{len:480,w:30},ai:RG(480,.5)},(u,a)=>{S('wind',u);wind(u,a,{r:15,dmg:20,spd:600,life:.8,big:1,o:{kb:170}})}),
 fu_shotgun:SP('Fûton : Rafale à bout portant','Immobile, tire 10 balles d\'air imprécises au corps à corps',8,{cast:.2,ai:RG(200,.7)},(u,a)=>{u.root=Math.max(u.root,.35);S('wind',u);S('heavy',u);for(let i=0;i<10;i++)wind(u,a+(rnd()-.5)*1,{spd:760+rnd()*160,r:5,dmg:5,life:.3,o:{kb:60}})}),
 fu_stack:SP('Fûton : Balles chargées','Prépare 3 balles d\'air qui repoussent, à relancer pendant 5 s',10,{ai:RG(500,.7)},null),
 fu_line:SP('Fûton : Lame d\'air','Projectile linéaire perçant qui repousse',10,{cast:.3,line:{len:700,w:24},ai:RG(650,.5)},(u,a)=>{S('wind',u);wind(u,a,{spd:1200,r:12,dmg:26,life:.62,pierce:1,big:1,o:{kb:300}})}),
 fu_breath:SP('Fûton : Souffle','Canalise un souffle de vent qui repousse et blesse',11,{ai:RG(240,.6)},(u,a)=>{u.flame={t:1.4,k:0,R:260,arc:.5,d:4,kb:140,still:1,v:'wind'};S('wind',u)}),
 fu_corridor:ULT('Fûton : Couloir de vent','Couloir de vent : dégâts croissants et silence pour ceux qui restent dedans',{cast:.3,line:{len:520,w:110},ai:{max:480,p:.8}},(u,a)=>{aux.push({type:'corridor',x:u.x,y:u.y,a,len:520,w:110,t:4,m:4,team:u.team,owner:u,vfx:'wind',k:0,in:{}});S('wind',u)}),
 fu_tornado:ULT('Fûton : Tornade','Tornade qui avance, blesse et emporte les ennemis',{cast:.3,ai:{max:480,p:.8}},(u,a)=>{aux.push({type:'tornado',x:u.x+Math.cos(a)*50,y:u.y+Math.sin(a)*50,vx:Math.cos(a)*150,vy:Math.sin(a)*150,r:70,t:4,m:4,team:u.team,owner:u,vfx:'wind',k:0,carry:1,dmg:4});S('wind',u)}),
 // ---- Katon
 ka_ball:SP('Katon : Flamme','Projectile de feu qui brûle quelques secondes',4,{ai:RG(520,.7)},(u,a)=>{S('fire',u);fireP(u,a,{})}),
 ka_wall:SP('Katon : Mur de feu','Mur de feu qui bloque les tirs et le passage, et brûle au contact',9,{ai:DEF},(u,a)=>{wallLine(u,a,2,{burn:1,k:0});S('fire',u)}),
 ka_tri:SP('Katon : Triple flamme','3 projectiles de feu qui brûlent',6,{ai:RG(520,.6)},(u,a)=>{S('fire',u);for(const k of[-.18,0,.18])fireP(u,a+k,{dmg:9,o:{dot:BURN(3,2.5)}})}),
 ka_air:SP('Katon : Shuriken de feu aériens','Saute et lance 5 shuriken de feu sur un point précis',8,{ai:RG(450,.55)},(u,a,t)=>{S('fire',u);const tp=fwd(u,a,Math.min(t||300,450));dash(u,a,0,.45,{jump:110});
  for(let i=0;i<5;i++){const ox=u.x+(rnd()-.5)*50,oy=u.y+(rnd()-.5)*50,b=Math.atan2(tp.y-oy,tp.x-ox),d=Math.hypot(tp.x-ox,tp.y-oy);projs.push({x:ox,y:oy,vx:Math.cos(b)*700,vy:Math.sin(b)*700,owner:u,src:u,rot:0,r:7,dmg:7,life:Math.max(.2,d/700),life0:Math.max(.2,d/700),col:'#ff7a2a',o:{dot:BURN(3,2.5)},vfx:'fire',shuri:1,hitSet:null})}}),
 ka_zone:SP('Katon : Fournaise','Grande zone de feu autour de soi : plus on y reste, plus ça brûle',10,{ai:SELF(200,.5)},(u)=>{aux.push({type:'prog',x:u.x,y:u.y,r:180,t:4,m:4,team:u.team,owner:u,vfx:'fire',k:0,in:{},dmg:3});S('fire',u)}),
 ka_stack:SP('Katon : Flammes chargées','Prépare 5 flammes qui brûlent, à relancer pendant 5 s',10,{ai:RG(500,.7)},null),
 ka_dragon:SP('Katon : Dragon de feu','Dragon de feu qu\'on peut rediriger, explose et brûle',12,{cast:.3,ai:RG(600,.5)},(u,a)=>{S('fire',u);proj(u,a,{spd:430,r:14,dmg:24,life:1.8,col:'#ff7a2a',rocket:1,ar:85,kb:180,burn:1,steer:1,big:1,dragon:1})}),
 ka_tornado:SP('Katon : Tornade de feu','Tornade de feu qui avance et brûle, sans emporter',12,{cast:.25,ai:RG(450,.6)},(u,a)=>{aux.push({type:'tornado',x:u.x+Math.cos(a)*50,y:u.y+Math.sin(a)*50,vx:Math.cos(a)*140,vy:Math.sin(a)*140,r:78,t:3.5,m:3.5,team:u.team,owner:u,vfx:'fire',k:0,dmg:6});S('fire',u)}),
 ka_nuee:ULT('Katon : Nuée ardente','Canalise une nuée sur une zone, immobile ; relance pour relâcher : plus c\'est long, plus c\'est fort',{ai:{max:480,p:.8}},null),
 ka_breath:ULT('Katon : Grand souffle de feu','Immobile, embrase une très large zone devant soi',{ai:{max:300,p:.8}},(u,a)=>{u.flame={t:2,k:0,R:330,arc:.9,d:5,burn:1,still:1,v:'fire',dot:BURN(4,3)};S('fire',u)}),
};
NAT.fu_stack.f=stackAb('fu_stack',3,(u,a)=>{S('wind',u);wind(u,a,{r:9,dmg:14,o:{kb:220}})});
NAT.ka_stack.f=stackAb('ka_stack',5,(u,a)=>{S('fire',u);fireP(u,a,{dmg:12})});
NAT.ka_nuee.f=chanAb('ka_nuee');
for(const k in NAT)NAT[k].key=k;
// stats de référence (pour les PV / la puissance du ninja) : un perso Star Wars proche dans l'esprit
const NATHERO={fu:'palpatine',ka:'boba'};
// mise à jour des objets spéciaux (hôte)
function auxUpdate(dt){for(const x of aux){x.t-=dt;x.k-=dt;
  if(x.type==='tornado'){x.x=clamp(x.x+x.vx*dt,B.x+20,B.x+B.w-20);x.y=clamp(x.y+x.vy*dt,B.y+20,B.y+B.h-20)}
  if(x.type==='prog'&&x.owner&&!x.owner.dead){x.x=x.owner.x;x.y=x.owner.y}
  const tick=x.k<=0;if(tick)x.k=.25;
  for(const e of units){if(e.dead||e.team===x.team)continue;let inside=false;
   if(x.type==='corridor'){const dx=e.x-x.x,dy=e.y-x.y,f=dx*Math.cos(x.a)+dy*Math.sin(x.a),s=Math.abs(-dx*Math.sin(x.a)+dy*Math.cos(x.a));inside=f>0&&f<x.len&&s<x.w/2+e.r}
   else if(x.type!=='chan')inside=Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r;
   if(!inside){if(x.in)x.in[e.c+e.team]=0;continue}
   if(x.carry&&e.unstop<=0){e.x+=x.vx*dt*.9+(x.x-e.x)*dt*3;e.y+=x.vy*dt*.9+(x.y-e.y)*dt*3;e.airT=Math.max(e.airT||0,.15);collide(e)}
   if(!tick)continue;const key=e.c+e.team;
   if(x.in){x.in[key]=(x.in[key]||0)+.25;const m=1+x.in[key]*.6;VFX=x.vfx;hit(e,x.owner,(x.type==='corridor'?3:x.dmg)*m,{silent:1,silence:x.type==='corridor'?.5:0,dot:x.vfx==='fire'?BURN(3,2):null});VFX=null}
   else{VFX=x.vfx;hit(e,x.owner,x.dmg,{silent:1,dot:x.vfx==='fire'?BURN(3,2):null});VFX=null}}}
 aux=aux.filter(x=>x.t>0);
 for(const u of units){if(u.dead)continue;
  if(u.jst){u.jst.t-=dt;if(u.jst.t<=0){u.cds[u.jst.i]=u.jst.cd;u.jst=null}}u.jstN=u.jst?u.jst.n:0;u.jstV=u.jst?u.jst.v:null;
  if(u.chan){const c=u.chan;c.t+=dt;u.root=Math.max(u.root,.15);for(const x of aux)if(x.type==='chan'&&x.owner===u)x.k=c.t/c.max;if(u.stun>0){u.chan=null;for(const x of aux)if(x.type==='chan'&&x.owner===u)x.t=0;u.cds[c.i]=c.cd}else if(c.t>=c.max)releaseChan(u)}}
 for(const w of walls)if(w.burn){w.k-=dt;if(w.k<=0){w.k=.3;for(const e of units)if(!e.dead&&e.team!==w.team&&Math.hypot(e.x-w.x,e.y-w.y)<w.r+e.r+8){VFX='fire';hit(e,w.owner,3,{silent:1,dot:BURN(3,2)});VFX=null}}}}
// dessin des objets spéciaux
function drawAux(){const t=performance.now()/1000;for(const x of aux){if(!near(x.x,x.y))continue;const k=Math.min(1,x.t/.4,(x.m-x.t)/.25+.2);g.save();
 if(x.type==='corridor'){const pts=[[-x.w/2,0],[x.w/2,0],[x.w/2,x.len],[-x.w/2,x.len]].map(([s,f])=>P(x.x+Math.cos(x.a)*f-Math.sin(x.a)*s,x.y+Math.sin(x.a)*f+Math.cos(x.a)*s));poly(pts,rgba('#c8fff0',.16*k));
  g.strokeStyle=rgba('#ffffff',.55*k);g.lineWidth=1.5;for(let i=0;i<16;i++){const f=((t*420+i*61)%x.len),s=((i*37)%x.w)-x.w/2,a=P(x.x+Math.cos(x.a)*f-Math.sin(x.a)*s,x.y+Math.sin(x.a)*f+Math.cos(x.a)*s,20),b=P(x.x+Math.cos(x.a)*(f+40)-Math.sin(x.a)*s,x.y+Math.sin(x.a)*(f+40)+Math.cos(x.a)*s,20);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}}
 else if(x.type==='tornado'){const q=P(x.x,x.y,0),fire=x.vfx==='fire';g.globalCompositeOperation=fire?'lighter':'source-over';for(let i=0;i<9;i++){const h=i*14*q.s,rr=(18+i*8)*q.s*(x.r/70),a0=t*8+i*.7;g.strokeStyle=fire?rgba(i%2?'#ff7a2a':'#ffd36a',.55*k):rgba(i%2?'#e8fff8':'#a8d8c8',.6*k);g.lineWidth=(5-i*.3)*q.s;g.beginPath();g.ellipse(q.x+Math.sin(t*3+i*.5)*4*q.s,q.y-h,rr,rr*.35,0,a0,a0+4.2);g.stroke()}}
 else if(x.type==='prog'){const q=P(x.x,x.y,0);g.fillStyle=rgba('#ff5a1a',.12*k);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#ff9a3a',.6*k);g.lineWidth=2;g.setLineDash([10,6]);g.lineDashOffset=-t*30;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
  g.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const a=i*.52+t*.5,d=x.r*(.3+((i*37)%60)/100),p=P(x.x+Math.cos(a)*d,x.y+Math.sin(a)*d*.8,2),h=(10+Math.sin(t*9+i)*5)*p.s;g.fillStyle=rgba(i%2?'#ffb03a':'#ff5a1a',.7*k);g.beginPath();g.moveTo(p.x-4*p.s,p.y);g.quadraticCurveTo(p.x,p.y-h*2,p.x+4*p.s,p.y);g.fill()}}
 else if(x.type==='chan'){const c=x.k||0;g.fillStyle=rgba('#ff5a1a',.1+.25*c);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle='#ff9a3a';g.lineWidth=2+3*c;gEll(x.x,x.y,x.r*(.3+.7*c));g.stroke();g.strokeStyle=rgba('#ff9a3a',.5);g.lineWidth=1.5;gEll(x.x,x.y,x.r);g.stroke();
  const q=P(x.x,x.y,0);g.fillStyle=rgba('#3a3030',.35+.3*c);for(let i=0;i<5;i++){const a=t*.7+i*1.3;g.beginPath();g.ellipse(q.x+Math.cos(a)*x.r*.5*q.s,q.y-40*q.s-Math.sin(a)*8,30*q.s*(.6+c*.6),14*q.s*(.6+c*.6),0,0,7);g.fill()}}
 g.restore()}
 // charges prêtes autour des lanceurs
 for(const u of units){if(u.dead||!u.jstN||!near(u.x,u.y))continue;for(let i=0;i<u.jstN;i++){const a=t*3+i*Math.PI*2/u.jstN,q=P(u.x+Math.cos(a)*30,u.y+Math.sin(a)*22,46);g.save();g.globalCompositeOperation='lighter';circ(q.x,q.y,6*q.s,u.jstV==='fire'?rgba('#ff8a2a',.8):rgba('#c8fff0',.8));circ(q.x,q.y,3*q.s,'#fff');g.restore()}}}

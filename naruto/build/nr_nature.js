// ---------- Natures sur mesure : Fûton et Katon (mécaniques propres) ----------
// aux : objets de jeu spéciaux (couloir de vent, tornades, zones de brûlure progressives) mis à jour et dessinés à part
let aux=[],seqs=[]; // seqs : tirs différés (rafales)
function seqUpdate(dt){for(const q of seqs){if(q.owner.dead||q.owner.stun>0){q.n=0;continue}q.t-=dt;if(q.t<=0&&q.n>0){q.n--;q.t=q.iv;VFX=q.vfx||null;CUR=q.owner;BASIC=false;EX=false;q.f(q.owner);CUR=null;VFX=null}}seqs=seqs.filter(q=>q.n>0)}
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
const NAT={}; // mécaniques sur mesure des jutsu (remplies par kits/*.js)
// stats de référence (pour les PV / la puissance du ninja) : un perso Star Wars proche dans l'esprit
const NATHERO={}; // stats de référence par préfixe (rempli par les kits)
// mise à jour des objets spéciaux (hôte)
function auxUpdate(dt){seqUpdate(dt);for(const x of aux){x.t-=dt;x.k-=dt;if(AUXF[x.type]){AUXF[x.type](x,dt);continue}
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
  {const T=trait(u);if(T){if(!u._tri){u._tri=1;if(T.init)T.init(u)}if(T.update)T.update(u,dt)}}if(u.anim){u.anim.t-=dt;if(u.anim.t<=0)u.anim=null}
  if(u.phase>0)u.phase-=dt;if(u.relT>0)u.relT-=dt;if(u.thrT>0)u.thrT-=dt;if(u.izT>0)u.izT-=dt;
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
 else if(AUXD[x.type])AUXD[x.type](x,k,t);
 else if(x.type==='chan'){const c=x.k||0;g.fillStyle=rgba('#ff5a1a',.1+.25*c);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle='#ff9a3a';g.lineWidth=2+3*c;gEll(x.x,x.y,x.r*(.3+.7*c));g.stroke();g.strokeStyle=rgba('#ff9a3a',.5);g.lineWidth=1.5;gEll(x.x,x.y,x.r);g.stroke();
  const q=P(x.x,x.y,0);g.fillStyle=rgba('#3a3030',.35+.3*c);for(let i=0;i<5;i++){const a=t*.7+i*1.3;g.beginPath();g.ellipse(q.x+Math.cos(a)*x.r*.5*q.s,q.y-40*q.s-Math.sin(a)*8,30*q.s*(.6+c*.6),14*q.s*(.6+c*.6),0,0,7);g.fill()}}
 g.restore()}
 // charges prêtes autour des lanceurs
 for(const u of units){if(u.dead||!u.jstN||!near(u.x,u.y))continue;for(let i=0;i<u.jstN;i++){const a=t*3+i*Math.PI*2/u.jstN,q=P(u.x+Math.cos(a)*30,u.y+Math.sin(a)*22,46);g.save();g.globalCompositeOperation='lighter';circ(q.x,q.y,6*q.s,u.jstV==='fire'?rgba('#ff8a2a',.8):rgba('#c8fff0',.8));circ(q.x,q.y,3*q.s,'#fff');g.restore()}}}

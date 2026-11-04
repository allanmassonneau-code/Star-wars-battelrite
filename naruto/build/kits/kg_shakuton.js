// ===== Kekkei genkai g4 : Shakuton, l'incandescence (préfixe sk_) — Katon + Fûton (Pakura de Suna) =====
// Identité : la pression qui assèche. Des sphères de chaleur flottent, traquent et collent ; chaque touche DESSÈCHE (trait, 3 cumuls) :
// à 3, la chaleur aspire l'eau du corps d'un coup (12 dégâts, ralenti). Sphère traqueuse, sphères en orbite, essaim, étreinte, soleil ; dash : envol brûlant.
gkPal('sk_heat','#fff0b0','#ff8a2a','#b03a10','#4a1406');
defKG(4,{n:'Shakuton',col:'#ff7a2a',tag:'Sh',el:'Katon + Fûton',nat:2,d:'L\'incandescence : sphères de chaleur qui traquent et dessèchent l\'ennemi',
 ico:f=>{g.beginPath();g.arc(0,0,6.5,0,7);g.fill();g.lineWidth=2.2;for(let i=0;i<8;i++){const b=i*Math.PI/4;g.beginPath();g.moveTo(Math.cos(b)*9,Math.sin(b)*9);g.lineTo(Math.cos(b)*12.5,Math.sin(b)*12.5);g.stroke()}}});
const SK_D={
 orb:'Sphère de chaleur qui traque l\'ennemi le plus proche de sa course : 14 dégâts et 1 dessèchement',
 orbit:'3 sphères tournent autour de toi 5 s : chacune brûle le 1er ennemi qu\'elle frôle (9 dégâts et 1 dessèchement), puis s\'éteint',
 swarm:'5 sphères partent en éventail puis fondent sur les ennemis proches : 6 dégâts chacune, 1 dessèchement (2 au plus par lancer)',
 grasp:'Une grosse sphère file (480) et se colle au 1er ennemi touché 2,5 s : 7 dégâts toutes les 0,5 s, ralenti, 1 dessèchement par seconde',
 sun:'Un soleil de chakra grossit au-dessus du point visé (380 max) pendant 1,2 s puis s\'abat : 56 dégâts et 3 dessèchements (assèche aussitôt)',
 dash:'Bond porté par la chaleur (240, au-dessus des obstacles) ; une sphère reste à ton point de départ et explose 0,4 s plus tard (8 dégâts, 1 dessèchement)'};
KIT('g4',[
 ['D','x.sk_orb','Shakuton : Sphère ardente',SK_D.orb,'sk_heat'],
 ['C','x.sk_orbit','Shakuton : Kajôsatsu',SK_D.orbit,'sk_heat'],
 ['B','x.sk_swarm','Shakuton : Essaim de sphères',SK_D.swarm,'sk_heat'],
 ['A','x.sk_grasp','Shakuton : Étreinte brûlante',SK_D.grasp,'sk_heat'],
 ['S','x.sk_sun','Shakuton : Soleil incandescent',SK_D.sun,'sk_heat'],
]);
DASHG[4]={src:'x.sk_dash',n:'Envol brûlant',d:SK_D.dash,vfx:'sk_heat',cd:7};
KGBAL[4]=[0.964,0.95];
const SKC=GK.sk_heat,SK_MAX=3;
// dessèchement : à 3 cumuls, 12 dégâts, ralenti 1,5 s, puis insensible 4 s
function skDry(u,e,n){const c=gkStack(u,e,'sk_dry',n,SK_MAX,5);if(c>=SK_MAX&&!e.dead){gkStSet(e,'sk_dry',0,4);gkHit(e,u,12,{slow:1.5,unblockable:1},'sk_heat');say(e,'DESSÉCHÉ','#ffb060');
  jx({jfx:'sk_dryfx',ti:gkI(e),x:e.x,y:e.y,t:.8,m:.8});fxSmoke(e.x,e.y,{u,col:'#e8f4ff',n:6,r:18,s:12,t:1.1,al:.3,rise:90});fxFlare(e.x,e.y,SKC.b,{u,z:40,r:22,t:.2});if(near(e.x,e.y))gkS('fire',e)}return c}
// impact d'une sphère : éclat de chaleur, vapeur arrachée à la cible, brûlure au sol
const skHitFx=(u,x,y,r)=>{gkImp(u,x,y,'sk_heat',r,{ring:0});fxSmoke(x,y,{u,col:'#f4f0e8',n:2,r:10,s:9,t:.8,al:.22,rise:60})};
Object.assign(NAT,{
 // ---------- Sphère ardente (D) ----------
 sk_orb:SP('Shakuton : Sphère ardente',SK_D.orb,5,{ai:RG(480,.75)},(u,a)=>{gkS('fire',u);anim(u,'palm',.4);fxCast(u,'sk_heat',.2,{n:6});proj(u,a,{spd:470,r:12,dmg:14,life:1.15,col:SKC.b,kind:'sk_orb',vfx:'sk_heat',onHit:(p,t)=>{skHitFx(p.owner,p.x,p.y,30);skDry(p.owner,t,1)}});gkSteer(u,projs[projs.length-1],3.2,260)}),
 // ---------- Kajôsatsu (C) : 3 sphères en orbite ----------
 sk_orbit:SP('Shakuton : Kajôsatsu',SK_D.orbit,8,{ai:SELF(150,.6)},(u)=>{gkS('fire',u);gkS('wind',u);anim(u,'gk_charge',.45);for(const x of aux)if(x.type==='sk_orbit'&&x.owner===u)x.t=0;
  aux.push({type:'sk_orbit',x:u.x,y:u.y,r:62,t:5,m:5,team:u.team,owner:u,ui:gkI(u),k:0,n:7,a:0});fxRing(u.x,u.y,{u,r0:20,r1:62,col:SKC.b,t:.35,w:4});fxBurst(u.x,u.y,SKC.a,{u,z:34,n:10,sp:180,gr:0,up:20,w:1.6,len:.15,t:.4})}),
 // ---------- Essaim de sphères (B) ----------
 sk_swarm:SP('Shakuton : Essaim de sphères',SK_D.swarm,10,{ai:RG(460,.7)},(u,a)=>{gkS('fire',u);gkS('wind',u);anim(u,'gk_push',.45);const D=new Map();fxFlare(u.x+Math.cos(a)*24,u.y+Math.sin(a)*24,SKC.b,{u,z:36,r:26,t:.2});fxWind(u.x,u.y,a,{u,len:120,w:90,n:6,t:.35,col:SKC.a});
  for(let i=0;i<5;i++){proj(u,a+(i-2)*.38,{spd:420,r:8,dmg:6,life:1.3,col:SKC.b,kind:'sk_orb',vfx:'sk_heat',onHit:(p,t)=>{skHitFx(p.owner,p.x,p.y,22);const n=(D.get(t)||0)+1;D.set(t,n);if(n<=2)skDry(p.owner,t,1)}});gkSteer(u,projs[projs.length-1],4,420)}}),
 // ---------- Étreinte brûlante (A) ----------
 sk_grasp:SP('Shakuton : Étreinte brûlante',SK_D.grasp,13,{ai:RG(470,.65),line:{len:480,w:44}},(u,a)=>{gkS('fire',u);gkS('roar',u);anim(u,'gk_push',.5);fxCast(u,'sk_heat',.3,{n:10});
  proj(u,a,{spd:620,r:16,dmg:0,life:.78,col:SKC.b,kind:'sk_big',vfx:'sk_heat',noClash:1,onHit:(p,t)=>{if(t.dead)return;for(const x of aux)if(x.type==='sk_grab'&&x.tg===t)x.t=0;skHitFx(p.owner,t.x,t.y,40);fxRing(t.x,t.y,{u:p.owner,r0:10,r1:40,col:SKC.b,t:.3,w:4});
   aux.push({type:'sk_grab',x:t.x,y:t.y,r:0,t:2.5,m:2.5,team:p.owner.team,owner:p.owner,tg:t,ti:gkI(t),k:.5,n:0});say(t,'ÉTREINTE BRÛLANTE','#ffb060')}})}),
 // ---------- Soleil incandescent (S) ----------
 sk_sun:ULT('Shakuton : Soleil incandescent',SK_D.sun,{ai:RG(380,.8),tele:{r:140,max:380}},(u,a,td)=>{const c=atP(u,a,td,380),R=140,D=1.2;gkS('fire',u);gkS('roar',u);anim(u,'gk_call',1.1);
  jx({jfx:'sk_sun',x:c.x,y:c.y,r:R,d:D,t:D+.5,m:D+.5});fxCast(u,'sk_heat',D*.8,{n:14,z:60,hd:4});
  later(u,D,()=>{gkAoe(u,c.x,c.y,R,56,{},'sk_heat',e=>{skDry(u,e,3);fxHitStop(u,e,56,1)});jx({jfx:'gk_boom',x:c.x,y:c.y,r:R,v:'sk_heat',s:'dry',t:.8,m:.8});
   gkImp(u,c.x,c.y,'sk_heat',R,{ring:0});fxRing(c.x,c.y,{u,r0:20,r1:R,col:SKC.b,c2:'#ffffff',t:.45,w:10});fxRing(c.x,c.y,{u,r0:R*.5,r1:R*1.35,col:SKC.a,t:.7,w:3,al:.5});fxLight(c.x,c.y,R*1.6,SKC.b,{u,t:.8,a:.35});
   fxSmoke(c.x,c.y,{u,col:'#f4ece0',n:10,r:R*.7,s:20,t:1.8,al:.24,rise:140});fxBurst(c.x,c.y,SKC.a,{u,z:20,n:20,sp:420,up:120,gr:120,w:2.2,len:.16,c2:'#ffffff',t:.7});fxDecal(c.x,c.y,'scorch',{u,r:R*.7,t:5,al:.35});
   fxShake(.4,c.x,c.y);if(near(c.x,c.y)){gkS('boom',u);gkS('fire',u)}},{x:c.x,y:c.y,r:R})}),
 // ---------- dash : Envol brûlant ----------
 sk_dash:SP('Envol brûlant',SK_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y;gkS('wind',u);gkS('dash',u);anim(u,'leap',.4);dash(u,a,clamp(td||240,130,240),.32,{jump:1});gkTrail(u,'sk_heat',.4,{w:14,z:40});fxWind(u.x,u.y,a,{u,len:90,w:50,n:5,t:.35,col:SKC.a});
  jx({jfx:'sk_mini',x:x0,y:y0,t:.4,m:.4});later(u,.4,()=>{gkAoe(u,x0,y0,60,8,{},'sk_heat',e=>skDry(u,e,1));jx({jfx:'gk_boom',x:x0,y:y0,r:60,v:'sk_heat',s:'dry',t:.45,m:.45});skHitFx(u,x0,y0,60);if(near(x0,y0))gkS('fire',u)},{x:x0,y:y0,r:60})}),
});
Object.assign(NATHERO,{sk:'kylo'});
// sphères en orbite
const skOrbP=(x,i,u)=>{const b=x.a+i*2.094;return{x:u.x+Math.cos(b)*x.r,y:u.y+Math.sin(b)*x.r}};
AUXF.sk_orbit=(x,dt)=>{const u=x.owner;if(!u||u.dead){x.t=0;return}x.x=u.x;x.y=u.y;x.a+=dt*3.4;
 for(let i=0;i<3;i++){if(!(x.n&1<<i))continue;const p=skOrbP(x,i,u);for(const e of enemies(u))if(gkIn(e,p.x,p.y,14)){x.n&=~(1<<i);if(gkHit(e,u,9,{unblockable:1,fx:p.x,fy:p.y},'sk_heat'))skDry(u,e,1);jx({jfx:'gk_boom',x:p.x,y:p.y,r:34,v:'sk_heat',s:'dry',t:.35,m:.35});skHitFx(u,p.x,p.y,24);break}}if(!x.n)x.t=0};
// orbite : chemin des sphères au sol (rayon réel 62) ; chaque sphère laisse un arc de chaleur derrière elle
AUXD.sk_orbit=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const a0=x.a,c=P(u.x,u.y,0),s=c.s;gkDim(u,()=>{g.save();g.strokeStyle=rgba(SKC.b,.22*k);g.lineWidth=1.2;g.setLineDash([4,8]);g.lineDashOffset=-t*20;g.beginPath();g.ellipse(c.x,c.y,x.r*s,x.r*s*K,0,0,7);g.stroke();g.setLineDash([]);g.restore();
 for(let i=0;i<3;i++){if(!(x.n&1<<i))continue;const b=a0+i*2.094,z=34+Math.sin(t*4+i)*6,q=P(u.x+Math.cos(b)*x.r,u.y+Math.sin(b)*x.r,z);
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';for(let j=1;j<=5;j++){const b2=b-j*.13,q2=P(u.x+Math.cos(b2)*x.r,u.y+Math.sin(b2)*x.r,z);g.strokeStyle=rgba(SKC.b,.45*(1-j/6));g.lineWidth=(9-j*1.3)*s;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q2.x,q2.y);g.stroke()}g.restore();
  const gq=P(u.x+Math.cos(b)*x.r,u.y+Math.sin(b)*x.r,0);fxGlowS(gq.x,gq.y,16*s,SKC.b,.35,16*s*K,0);g.save();g.translate(q.x,q.y);PROJD.sk_orb({},11*q.s,b+Math.PI/2,t*1000);g.restore()}})};
// étreinte : la sphère colle et brûle
AUXF.sk_grab=(x,dt)=>{const e=x.tg,o=x.owner;if(!e||e.dead||!o){x.t=0;return}x.x=e.x;x.y=e.y;if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.2);
 if(x.k<=0&&x.t>0.02){x.k=.5;x.n++;fxSmoke(e.x,e.y,{u:o,col:'#f4f0e8',n:2,r:12,s:10,t:.9,al:.22,rise:70});fxBurst(e.x,e.y,SKC.a,{u:o,z:36,n:4,sp:140,w:1.4,t:.3});if(gkHit(e,o,7,{silent:0,unblockable:1},'sk_heat')&&x.n%2===0)skDry(o,e,1)}};
// étreinte : la sphère collée (derrière le corps : couche du sol) + lueur au sol qui pulse à chaque brûlure
AUXD.sk_grab=(x,k,t)=>{const e=units[x.ti];if(!e||e.dead)return;const q=P(e.x,e.y,36),s=q.s,gq=P(e.x,e.y,0),pl=.5+.5*Math.cos((x.k||0)/.5*6.283);gkDim(x,()=>{fxGlowS(gq.x,gq.y,(30+8*pl)*s,SKC.b,.35+.25*pl,(30+8*pl)*s*K,0);g.save();g.translate(q.x,q.y);PROJD.sk_big({},(22+Math.sin(t*10)*2)*s,0,t*1000);g.restore()})};
// ---- trait : Dessèchement
GKST.push({key:'sk_dry',max:SK_MAX,col:'#ffb060',c2:'#5a2a06'});
KGTRAITS[4]={nom:'Dessèchement',desc:'Tes sphères dessèchent (3 cumuls au plus, 5 s). À 3 cumuls, la chaleur aspire l\'eau du corps d\'un coup : 12 dégâts et ralenti 1,5 s, puis la cible est insensible au dessèchement 4 s. Une cible trempée sèche aussitôt (plus trempée)',
 landed(src,t,dmg,o){if(gkMine('sk_heat')&&t.wet>0)t.wet=0},
 draw(u,p,S,sk){const t=performance.now()/1000;gkDim(u,()=>{for(let i=0;i<2;i++){const b=t*1.5+i*Math.PI,q={x:p.x+Math.cos(b)*20*S*(sk||1),y:p.y-46*S-Math.sin(b)*6*S};fxGlowS(q.x,q.y,8*S,SKC.b,.6);fxGlowS(q.x,q.y,3*S,'#ffffff',.7)}})},
 prev(u,p,S,front){if(front)KGTRAITS[4].draw(u,p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Dessèchement','sk_dry',SK_MAX,'#ffb060',SKC.a)}};
AFTER.push(()=>UK.push('sk_dry'));
// ---- visuels
PROJD.sk_orb=gkOrbD('sk_heat',{n:4,spk:8});
PROJD.sk_big=gkOrbD('sk_heat',{n:6,spk:12,core:'#fff6d0'});
// cible desséchée : la vapeur d'eau quitte le corps (bouffées douces), peau craquelée qui rougeoit
JFXD.sk_dryfx=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,0),s=q.s,n=gkN(10,f);for(let i=0;i<n;i++){const b=i*.63,z=20+e*70+(i%3)*10,p=P(o.x+Math.cos(b)*(10+e*20),o.y+Math.sin(b)*(10+e*20),z);fxSoftS(p.x,p.y,(5+e*9)*s,'#e8f4ff',.35*k)}
 g.save();g.strokeStyle=rgba(SKC.c,.8*k);g.lineWidth=1.5;for(let i=0;i<4;i++){const y=q.y-(16+i*10)*s;g.beginPath();g.moveTo(q.x-8*s,y);g.lineTo(q.x-2*s,y-3*s);g.lineTo(q.x+3*s,y+2*s);g.lineTo(q.x+8*s,y-2*s);g.stroke()}g.restore()};
// soleil qui grossit au-dessus de la zone puis s'abat : couronne de rayons, halo (sprites additifs), ombre de chaleur au sol qui s'élargit
JFXD.sk_sun=(f,k,e,t)=>{const el=e*f.m,g0=Math.min(1,el/f.d),fall=el>f.d-.12?Math.min(1,(el-f.d+.12)/.12):0;if(el>=f.d)return;/* il touche le sol à l'instant du coup */const z=200*(1-fall)+30,q=P(f.x,f.y,z),s=q.s,R=(14+g0*f.r*.42)*s,gq=P(f.x,f.y,0);
 fxSoftS(gq.x,gq.y,f.r*g0*gq.s,SKC.d,.22*g0,f.r*g0*gq.s*K);fxGlowS(gq.x,gq.y,f.r*g0*gq.s*.9,SKC.b,.3*g0,f.r*g0*gq.s*.9*K,0);
 const fa=1-.5*fall;fxGlowS(q.x,q.y,R*2.6,SKC.b,.5*fa);fxGlowS(q.x,q.y,R*1.4,SKC.a,.7*fa);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#fff6d0',.6*fa);g.beginPath();g.arc(q.x,q.y,R*.62,0,7);g.fill();
 g.strokeStyle=rgba(SKC.a,.7);g.lineCap='round';const n=gkN(16,f);for(let i=0;i<n;i++){const b=i*6.283/n+t*.8,l=1.5+.35*Math.sin(t*6+i*1.7);g.lineWidth=(2+(i%2))*s;g.beginPath();g.moveTo(q.x+Math.cos(b)*R*1.05,q.y+Math.sin(b)*R*1.05);g.lineTo(q.x+Math.cos(b)*R*l,q.y+Math.sin(b)*R*l);g.stroke()}
 if(fall>0){g.globalAlpha=.6;g.strokeStyle=SKC.b;g.lineWidth=R*.8;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x,q.y-60*s);g.stroke()}g.restore();
 const m=Math.round(5*g0);for(let i=0;i<m;i++){const b=i*2.4+t,d=f.r*g0*((i*.37)%1),ph=(t*1.3+i*.21)%1,p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,ph*24);fxSoftS(p.x,p.y,(4+ph*6)*p.s,'#f4ece0',.22*(1-ph))}};
JFXD.sk_mini=(f,k,e,t)=>{const q=P(f.x,f.y,24);g.save();g.translate(q.x,q.y);PROJD.sk_orb({},(8+e*6)*q.s,0,t*1000);g.restore()};

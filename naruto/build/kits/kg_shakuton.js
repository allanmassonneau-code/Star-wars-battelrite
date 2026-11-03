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
KGBAL[4]=[0.98,0.965];
const SKC=GK.sk_heat,SK_MAX=3;
// dessèchement : à 3 cumuls, 12 dégâts, ralenti 1,5 s, puis insensible 4 s
function skDry(u,e,n){const c=gkStack(u,e,'sk_dry',n,SK_MAX,5);if(c>=SK_MAX&&!e.dead){gkStSet(e,'sk_dry',0,4);gkHit(e,u,12,{slow:1.5,unblockable:1},'sk_heat');say(e,'DESSÉCHÉ','#ffb060');
  jx({jfx:'sk_dryfx',ti:gkI(e),x:e.x,y:e.y,t:.8,m:.8});if(near(e.x,e.y))gkS('fire',e)}return c}
Object.assign(NAT,{
 // ---------- Sphère ardente (D) ----------
 sk_orb:SP('Shakuton : Sphère ardente',SK_D.orb,5,{ai:RG(480,.75)},(u,a)=>{gkS('fire',u);anim(u,'palm',.4);proj(u,a,{spd:470,r:12,dmg:14,life:1.15,col:SKC.b,kind:'sk_orb',vfx:'sk_heat',onHit:(p,t)=>skDry(p.owner,t,1)});gkSteer(u,projs[projs.length-1],3.2,260)}),
 // ---------- Kajôsatsu (C) : 3 sphères en orbite ----------
 sk_orbit:SP('Shakuton : Kajôsatsu',SK_D.orbit,8,{ai:SELF(150,.6)},(u)=>{gkS('fire',u);gkS('wind',u);anim(u,'gk_charge',.45);for(const x of aux)if(x.type==='sk_orbit'&&x.owner===u)x.t=0;
  aux.push({type:'sk_orbit',x:u.x,y:u.y,r:62,t:5,m:5,team:u.team,owner:u,ui:gkI(u),k:0,n:7,a:0})}),
 // ---------- Essaim de sphères (B) ----------
 sk_swarm:SP('Shakuton : Essaim de sphères',SK_D.swarm,10,{ai:RG(460,.7)},(u,a)=>{gkS('fire',u);gkS('wind',u);anim(u,'gk_push',.45);const D=new Map();
  for(let i=0;i<5;i++){proj(u,a+(i-2)*.38,{spd:420,r:8,dmg:6,life:1.3,col:SKC.b,kind:'sk_orb',vfx:'sk_heat',onHit:(p,t)=>{const n=(D.get(t)||0)+1;D.set(t,n);if(n<=2)skDry(p.owner,t,1)}});gkSteer(u,projs[projs.length-1],4,420)}}),
 // ---------- Étreinte brûlante (A) ----------
 sk_grasp:SP('Shakuton : Étreinte brûlante',SK_D.grasp,13,{ai:RG(470,.65),line:{len:480,w:44}},(u,a)=>{gkS('fire',u);gkS('roar',u);anim(u,'gk_push',.5);
  proj(u,a,{spd:620,r:16,dmg:0,life:.78,col:SKC.b,kind:'sk_big',vfx:'sk_heat',noClash:1,onHit:(p,t)=>{if(t.dead)return;for(const x of aux)if(x.type==='sk_grab'&&x.tg===t)x.t=0;
   aux.push({type:'sk_grab',x:t.x,y:t.y,r:0,t:2.5,m:2.5,team:p.owner.team,owner:p.owner,tg:t,ti:gkI(t),k:.5,n:0});say(t,'ÉTREINTE BRÛLANTE','#ffb060')}})}),
 // ---------- Soleil incandescent (S) ----------
 sk_sun:ULT('Shakuton : Soleil incandescent',SK_D.sun,{ai:RG(380,.8),tele:{r:140,max:380}},(u,a,td)=>{const c=atP(u,a,td,380),R=140,D=1.2;gkS('fire',u);gkS('roar',u);anim(u,'gk_call',1.1);
  jx({jfx:'sk_sun',x:c.x,y:c.y,r:R,d:D,t:D+.5,m:D+.5});
  later(u,D,()=>{gkAoe(u,c.x,c.y,R,56,{},'sk_heat',e=>skDry(u,e,3));jx({jfx:'gk_boom',x:c.x,y:c.y,r:R*1.2,v:'sk_heat',s:'dry',t:.8,m:.8});if(near(c.x,c.y)){gkS('boom',u);gkS('fire',u);shake=Math.max(shake,.4)}},{x:c.x,y:c.y,r:R})}),
 // ---------- dash : Envol brûlant ----------
 sk_dash:SP('Envol brûlant',SK_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y;gkS('wind',u);gkS('dash',u);anim(u,'leap',.4);dash(u,a,clamp(td||240,130,240),.32,{jump:1});
  jx({jfx:'sk_mini',x:x0,y:y0,t:.4,m:.4});later(u,.4,()=>{gkAoe(u,x0,y0,60,8,{},'sk_heat',e=>skDry(u,e,1));jx({jfx:'gk_boom',x:x0,y:y0,r:60,v:'sk_heat',s:'dry',t:.45,m:.45});if(near(x0,y0))gkS('fire',u)},{x:x0,y:y0,r:60})}),
});
Object.assign(NATHERO,{sk:'kylo'});
// sphères en orbite
const skOrbP=(x,i,u)=>{const b=x.a+i*2.094;return{x:u.x+Math.cos(b)*x.r,y:u.y+Math.sin(b)*x.r}};
AUXF.sk_orbit=(x,dt)=>{const u=x.owner;if(!u||u.dead){x.t=0;return}x.x=u.x;x.y=u.y;x.a+=dt*3.4;
 for(let i=0;i<3;i++){if(!(x.n&1<<i))continue;const p=skOrbP(x,i,u);for(const e of enemies(u))if(gkIn(e,p.x,p.y,14)){x.n&=~(1<<i);if(gkHit(e,u,9,{unblockable:1,fx:p.x,fy:p.y},'sk_heat'))skDry(u,e,1);jx({jfx:'gk_boom',x:p.x,y:p.y,r:34,v:'sk_heat',s:'dry',t:.35,m:.35});if(near(p.x,p.y))sparks(p.x,p.y,SKC.a,6,'sk_heat');break}}if(!x.n)x.t=0};
AUXD.sk_orbit=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const a0=x.a;for(let i=0;i<3;i++){if(!(x.n&1<<i))continue;const b=a0+i*2.094,q=P(u.x+Math.cos(b)*x.r,u.y+Math.sin(b)*x.r,34+Math.sin(t*4+i)*6);g.save();g.translate(q.x,q.y);PROJD.sk_orb({},11*q.s,b+Math.PI/2,t*1000);g.restore()}};
// étreinte : la sphère colle et brûle
AUXF.sk_grab=(x,dt)=>{const e=x.tg,o=x.owner;if(!e||e.dead||!o){x.t=0;return}x.x=e.x;x.y=e.y;if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.2);
 if(x.k<=0&&x.t>0.02){x.k=.5;x.n++;if(gkHit(e,o,7,{silent:0,unblockable:1},'sk_heat')&&x.n%2===0)skDry(o,e,1)}};
AUXD.sk_grab=(x,k,t)=>{const e=units[x.ti];if(!e||e.dead)return;const q=P(e.x,e.y,36),s=q.s;g.save();g.translate(q.x,q.y);PROJD.sk_big({},(22+Math.sin(t*10)*2)*s,0,t*1000);g.restore()};
// ---- trait : Dessèchement
GKST.push({key:'sk_dry',max:SK_MAX,col:'#ffb060',c2:'#5a2a06'});
KGTRAITS[4]={nom:'Dessèchement',desc:'Tes sphères dessèchent (3 cumuls au plus, 5 s). À 3 cumuls, la chaleur aspire l\'eau du corps d\'un coup : 12 dégâts et ralenti 1,5 s, puis la cible est insensible au dessèchement 4 s. Une cible trempée sèche aussitôt (plus trempée)',
 landed(src,t,dmg,o){if(gkMine('sk_heat')&&t.wet>0)t.wet=0},
 draw(u,p,S,sk){const t=performance.now()/1000;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<2;i++){const b=t*1.5+i*Math.PI,q={x:p.x+Math.cos(b)*20*S*(sk||1),y:p.y-46*S-Math.sin(b)*6*S};g.fillStyle=rgba(SKC.b,.55);g.beginPath();g.arc(q.x,q.y,4*S,0,7);g.fill();g.fillStyle=rgba('#ffffff',.8);g.beginPath();g.arc(q.x,q.y,1.8*S,0,7);g.fill()}g.restore()},
 prev(u,p,S,front){if(front)KGTRAITS[4].draw(u,p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Dessèchement','sk_dry',SK_MAX,'#ffb060',SKC.a)}};
AFTER.push(()=>UK.push('sk_dry'));
// ---- visuels
PROJD.sk_orb=gkOrbD('sk_heat',{n:4,spk:8});
PROJD.sk_big=gkOrbD('sk_heat',{n:6,spk:12,core:'#fff6d0'});
// cible desséchée : la vapeur d'eau quitte le corps, peau craquelée
JFXD.sk_dryfx=(f,k,e,t,u,tg)=>{const o=tg&&!tg.dead?tg:f,q=P(o.x,o.y,0),s=q.s;g.save();for(let i=0;i<10;i++){const b=i*.63,z=20+e*70+(i%3)*10,p=P(o.x+Math.cos(b)*(10+e*20),o.y+Math.sin(b)*(10+e*20),z);g.fillStyle=rgba('#e8f4ff',.45*k);g.beginPath();g.arc(p.x,p.y,(4+e*8)*s,0,7);g.fill()}
 g.strokeStyle=rgba(SKC.c,.8*k);g.lineWidth=1.5;for(let i=0;i<4;i++){const y=q.y-(16+i*10)*s;g.beginPath();g.moveTo(q.x-8*s,y);g.lineTo(q.x-2*s,y-3*s);g.lineTo(q.x+3*s,y+2*s);g.lineTo(q.x+8*s,y-2*s);g.stroke()}g.restore()};
// soleil qui grossit puis s'abat
JFXD.sk_sun=(f,k,e,t)=>{const el=e*f.m,g0=Math.min(1,el/f.d),fall=el>f.d?Math.min(1,(el-f.d)/.12):0;if(fall>=1&&el>f.d+.15){return}const z=180*(1-fall)+30,q=P(f.x,f.y,z),s=q.s,R=(14+g0*f.r*.45)*s;g.save();
 g.fillStyle=rgba(SKC.c,.18*g0);gEll(f.x,f.y,f.r*g0);g.fill();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R*1.6);gr.addColorStop(0,'#ffffff');gr.addColorStop(.45,rgba(SKC.a,.95));gr.addColorStop(.8,rgba(SKC.b,.5));gr.addColorStop(1,rgba(SKC.b,0));g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,R*1.6,0,7);g.fill();
 g.strokeStyle=rgba(SKC.a,.7);g.lineWidth=2;for(let i=0;i<14;i++){const b=i*.449+t*.8;g.beginPath();g.moveTo(q.x+Math.cos(b)*R*1.1,q.y+Math.sin(b)*R*1.1);g.lineTo(q.x+Math.cos(b)*R*1.5,q.y+Math.sin(b)*R*1.5);g.stroke()}g.restore()};
JFXD.sk_mini=(f,k,e,t)=>{const q=P(f.x,f.y,24);g.save();g.translate(q.x,q.y);PROJD.sk_orb({},(8+e*6)*q.s,0,t*1000);g.restore()};

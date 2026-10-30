// ===== Clan Uzumaki (c6, préfixe uz_) : maîtres du fûinjutsu =====
// Chaînes adamantines (Kongô Fûsa), sceaux marqueurs qu'on fait exploser, parchemins de stockage, et le Shiki Fûjin du Shinigami.
// (Rasengan, Multiclonage, Rasenshuriken et chakra de Kyûbi sont des techniques de Naruto : subjutsu des ninjas sans clan, voir sub_naruto.js.)
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c6',[
 [1,'D','x.uz_tagk','Kunai à sceau','Kunai rapide : 14 dégâts et colle un sceau sur l\'ennemi touché','kunai'],
 [1,'C','x.uz_harpoon','Chaîne-harpon','Une chaîne adamantine harponne le 1er ennemi : ramené à toi (16), étourdi 0,4 s et marqué d\'un sceau','chain'],
 [1,'B','x.uz_kai','Sceaux : Détonation','Fait exploser les sceaux des ennemis à moins de 480 : 12 + 12 par sceau ; à 3 sceaux, étourdi 0,7 s','tag'],
 [3,'A','x.uz_cage','Cage adamantine','Des chaînes jaillissent sous la zone : 20 dégâts, entrave 0,7 s et un sceau, puis enferment 2,5 s (ni ennemi ni tir ne passe)','chain'],
 [3,'B','x.uz_store','Parchemin de stockage','1,5 s : le parchemin scelle les tirs ennemis. Relance (5 s) : renvoie le plus fort (+25 %, 15 au moins), sinon 4 armes stockées (8 chacune)','kunai'],
 [4,'B','x.uz_gogyo','Sceau des cinq éléments','Cinq flammes : la cible (14) perd 20 de chakra, ne peut ni lancer de jutsu ni se recharger (R) 2 s, et reçoit un sceau','chakra'],
 [4,'C','x.uz_wall','Rempart de chaînes','Un rempart de chaînes jaillit devant toi 3 s : il arrête les tirs et le passage des ennemis ; en surgissant, 14 dégâts et repousse','chain'],
 [2,'B','x.uz_swap','Sceau d\'échange','Kunai-sceau : échange ta place avec l\'ennemi touché (ralenti), sinon te téléporte là où il se plante','chain'],
 [2,'C','x.uz_leap','Bond des chaînes','Des chaînes te catapultent au curseur ; à l\'atterrissage, elles fouettent autour de toi : 12 dégâts, entrave 0,5 s et un sceau','chain'],
 [5,'S','x.uz_shiki','Shiki Fûjin','Coûte 12 % de tes PV. Le Shinigami se dresse 0,7 s, puis sa main saisit le 1er ennemi de la ligne : 34, puis âme scellée 3 s (12/s, ralenti, ni jutsu ni recharge) ; +8 par sceau','chakra'],
 [5,'A','x.uz_bind','Entrave du démon','Après 0,4 s, des chaînes saisissent 3 ennemis à moins de 380 : entravés 0,6 s puis enchaînés à toi 3 s (170 au plus, ralentis), 8 dégâts par 0,5 s et un sceau par seconde ; tu restes immobile, un étourdissement les brise','chain'],
]);
// ---- sceaux marqueurs (cœur du clan) : jusqu'à 3 sur un ennemi, 8 s après le dernier posé ; le 3e scelle son chakra (une fois toutes les 8 s)
const UZ_MKT=8,UZ_KAIR=480,UZ_BL=170,UZ_WL=230,UZ_KAI_AI={max:UZ_KAIR-20,p:.75},UZ_ST_AI={max:520,p:.9},UZ_ST_DEF={mode:'def',p:.6};
const uzMk=t=>t&&!t.dead&&SIMT<t.uz_mkE?t.uz_mk|0:0;
function uzMark(o,t,n=1){if(!o||!t||t.dead||t.team===o.team)return;const m0=uzMk(t);t.uz_mk=Math.min(3,m0+n);t.uz_mkE=SIMT+UZ_MKT;
 if(!aux.some(x=>x.type==='uz_mkt'&&x.tg===t&&x.t>0))aux.push({type:'uz_mkt',x:t.x,y:t.y,r:0,t:UZ_MKT,m:UZ_MKT,team:o.team,owner:o,tg:t,k:0})
 if(t.uz_mk>m0)jx({jfx:'uz_mkon',ti:units.indexOf(t),x:t.x,y:t.y,t:.45,m:.45});
 if(t.uz_mk>=3&&m0<3&&!(SIMT<t.uz_sealE)){t.uz_sealE=SIMT+UZ_MKT;t.energy=Math.max(0,t.energy-15);t.chk=false;t.ckLock=Math.max(t.ckLock||0,2);
  say(t,'CHAKRA SCELLÉ','#ffd36a');if(near(t.x,t.y))S('genjutsu',o);jx({jfx:'uz_lock',ti:units.indexOf(t),x:t.x,y:t.y,t:2,m:2})}}
// tir capturé par le parchemin : on garde son apparence et ses effets simples (pas de crochet, d'échange, de retour ni de fonction)
const UZ_SNAPX=new Set(['x','y','vx','vy','owner','src','life','life0','hitSet','dead','boom','uzAbs','hook','swap','anchor','drag','ret','back','trav','grenade','home','steer','onHit','tx','ty','ox','oy','jn','rot','ex','basic','dmg','spd','windB']);
function uzSnap(p){const s={};for(const k in p){if(UZ_SNAPX.has(k))continue;const v=p[k];if(v==null||typeof v==='function')continue;if(typeof v!=='object'||k==='o')s[k]=v}
 s.spd=clamp(Math.hypot(p.vx,p.vy),480,1100);s.life=clamp(540/s.spd,.4,1.1);s.dmg=p.dmg||0;return s}
function uzRelease(u,a){const s=u.uz_st;u.uz_st=null;anim(u,'uz_scroll',.45);jx({jfx:'uz_scroll',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.5,m:.5});S('poof',u);
 if(s){const V=VFX;VFX=s.vfx||null;proj(u,a,Object.assign({},s,{dmg:Math.max(15,s.dmg*1.25),noClash:0}));VFX=V;say(u,'RENVOI SCELLÉ','#ffd36a');S('blaster',u);if(near(u.x,u.y))sparks(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,'#ffd36a',10,'chain')}
 else{S('blaster',u);if(near(u.x,u.y))sparks(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,'#ececf2',6,'smoke');let i=0;for(const k of[-.17,-.06,.06,.17])proj(u,a+k,{spd:900,r:6,dmg:8,life:.55,col:'#d8dde6',kind:i++%2?'uz_kunai':'uz_shur'})}}
// âme scellée par le Shiki Fûjin : les sceaux portés explosent en plus ; 3 s de dégâts, ralenti, ni jutsu ni recharge
function uzSoul(o,t){if(!o||!t||t.dead)return;const n=uzMk(t);t.uz_mk=0;t.uz_mkE=0;VFX='chakra';hit(t,o,8*n,{unblockable:1,silent:!n,silence:3,slow:3});VFX=null;
 t.uz_soul=3;t.chk=false;t.ckLock=Math.max(t.ckLock||0,3);aux.push({type:"uz_soul",x:t.x,y:t.y,r:0,t:3,m:3,team:o.team,owner:o,tg:t,ti:units.indexOf(t),ui:units.indexOf(o),k:0});
 say(t,n?'ÂME SCELLÉE ×'+n:'ÂME SCELLÉE','#d8c8ff');if(near(t.x,t.y)){S('shadow',o);shake=Math.max(shake,.3)}}
Object.assign(NAT,{
 uz_tagk:SP('Kunai à sceau','Kunai rapide : 14 dégâts et colle un sceau sur l\'ennemi touché',4,{line:{len:470,w:16},ai:RG(460,.7)},(u,a)=>{S('blaster',u);anim(u,'throw2',.3);
  proj(u,a,{spd:980,r:7,dmg:14,life:.48,col:'#d8dde6',kind:'uz_kunai',onHit:(p,t)=>uzMark(p.owner,t,1)})}),
 uz_harpoon:SP('Chaîne-harpon','Une chaîne adamantine harponne le 1er ennemi : ramené à toi (16), étourdi 0,4 s et marqué d\'un sceau',8,{hero:'cadbane',line:{len:450,w:20},ai:RG(440,.55,110)},(u,a)=>{S('dash',u);S('deflect',u);anim(u,'uz_chain',.55);
  proj(u,a,{spd:1000,r:10,dmg:16,life:.45,col:'#e8c860',hook:1,stun:.4,kind:'uz_chainp',onHit:(p,t)=>{const o=p.owner;uzMark(o,t,1);if(near(t.x,t.y))S('heavy',o);
   jx({jfx:'uz_wrap',ti:units.indexOf(t),ui:units.indexOf(o),x:t.x,y:t.y,t:.8,m:.8})}})}),
 uz_kai:SP('Sceaux : Détonation','Fait exploser les sceaux des ennemis à moins de 480 : 12 + 12 par sceau ; à 3 sceaux, étourdi 0,7 s',9,{tele:{self:1,r:UZ_KAIR},ai:null},(u)=>{const L=[];for(const e of enemies(u))if(uzMk(e)&&dist(u,e)<UZ_KAIR+e.r)L.push(e);
  if(!L.length){const i=u.ch.abil.findIndex(x=>x.key==='uz_kai');if(i>=0){u.cds[i]=.6;u.energy=Math.min(100,u.energy+jcost(u.ch.abil[i]))}say(u,'AUCUN SCEAU','#e8c860');return}
  S('genjutsu',u);anim(u,'uz_kai',.55);jx({jfx:'uz_kaic',ui:units.indexOf(u),x:u.x,y:u.y,t:.55,m:.55});
  for(const e of L){const n=uzMk(e);e.uz_mk=0;e.uz_mkE=0;jx({jfx:'uz_kaib',ti:units.indexOf(e),x:e.x,y:e.y,n,t:.3,m:.3});
   later(u,.28,()=>{if(e.dead)return;VFX='tag';hit(e,u,12+12*n,{unblockable:1,stun:n>=3?.7:0,kb:n>=3?0:110,fx:u.x,fy:u.y});VFX=null;jx({jfx:'uz_kaiboom',x:e.x,y:e.y,n,t:.6,m:.6});
    if(near(e.x,e.y)){S('boom',u);shake=Math.max(shake,.1+.06*n);sparks(e.x,e.y,'#ff9a3a',6+4*n,'tag')}})}}),
 uz_cage:SP('Cage adamantine','Des chaînes jaillissent sous la zone : 20 dégâts, entrave 0,7 s et un sceau, puis enferment 2,5 s (ni ennemi ni tir ne passe)',13,{tele:{r:130,max:420},ai:RG(420,.55)},(u,a,td)=>{const p=atP(u,a,td,420);S('deflect',u);anim(u,'uz_slam',.45);u.root=Math.max(u.root,.3);
  aux.push({type:'uz_cage',x:p.x,y:p.y,r:130,t:2.95,m:2.95,team:u.team,owner:u,vfx:'chain',k:0,sd:{}})}),
 uz_store:SP('Parchemin de stockage','1,5 s : le parchemin scelle les tirs ennemis. Relance (5 s) : renvoie le plus fort (+25 %, 15 au moins), sinon 4 armes stockées (8 chacune)',11,{hero:'dooku',ai:UZ_ST_DEF},(u,a)=>{const i=u.ch.abil.findIndex(x=>x.key==='uz_store');if(i<0)return;const cd=u.ch.abil[i].cd;
  if(u.jst&&u.jst.key==='uz_store'){u.jst=null;u.cds[i]=cd;uzRelease(u,a);return}
  S('poof',u);S('jyuken',u);anim(u,'uz_absorb',1.5);const ui=units.indexOf(u);u.uz_st=null;u.uz_scE=SIMT+1.5;
  aux.push({type:'uz_scrl',x:u.x,y:u.y,r:54,t:1.5,m:1.5,team:u.team,owner:u,ui,a,n:0,k:0});jx({jfx:'uz_scrollS',ui,x:u.x,y:u.y,t:1.5,m:1.5});
  u.jst={key:'uz_store',i,n:1,t:5,cd,v:'chain'};u.cds[i]=.4}),
 uz_gogyo:SP('Sceau des cinq éléments','Cinq flammes : la cible (14) perd 20 de chakra, ne peut ni lancer de jutsu ni se recharger (R) 2 s, et reçoit un sceau',11,{hero:'dooku',line:{len:340,w:20},ai:RG(330,.55)},(u,a)=>{S('genjutsu',u);anim(u,'seal',.45);
  proj(u,a,{spd:900,r:10,dmg:14,life:.38,col:'#a070ff',kind:'uz_gogyo',o:{silence:2},onHit:(p,t)=>{const o=p.owner,d=Math.min(t.energy,20);t.energy-=d;t.chk=false;t.ckLock=Math.max(t.ckLock||0,2);if(near(t.x,t.y))S('jyuken',o);say(t,'CHAKRA SCELLÉ','#c8a8ff');
   jx({jfx:'uz_g5',ti:units.indexOf(t),x:t.x,y:t.y,t:2,m:2});uzMark(o,t,1)}})}),
 uz_wall:SP('Rempart de chaînes','Un rempart de chaînes jaillit devant toi 3 s : il arrête les tirs et le passage des ennemis ; en surgissant, 14 dégâts et repousse',12,{line:{len:90,w:UZ_WL},ai:{mode:'def',p:.5}},(u,a)=>{S('heavy',u);S('deflect',u);anim(u,'uz_slam',.45);
  const c=fwd(u,a,70),ca=Math.cos(a),sa=Math.sin(a);aux.push({type:'uz_wall',x:c.x,y:c.y,a,len:UZ_WL,w:0,r:0,t:3,m:3,team:u.team,owner:u,vfx:'chain',k:0,sd:{}});
  VFX='chain';for(const e of enemies(u)){const dx=e.x-c.x,dy=e.y-c.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;if(Math.abs(s)<UZ_WL/2+e.r&&Math.abs(f)<28+e.r)hit(e,u,14,{kb:240,fx:c.x-ca*60,fy:c.y-sa*60,unblockable:1})}VFX=null;
  if(near(c.x,c.y)){shake=Math.max(shake,.15);sparks(c.x,c.y,'#e8c860',14,'chain')}}),
 uz_swap:SP('Sceau d\'échange','Kunai-sceau : échange ta place avec l\'ennemi touché (ralenti), sinon te téléporte là où il se plante',10,{hero:'dooku',ai:ESC},(u,a,td)=>{S('dash',u);anim(u,'point',.3);const L=clamp(td||300,120,380);
  proj(u,a,{spd:1150,r:9,dmg:4,life:L/1150,col:'#e8c860',kind:'uz_kunai',swap:1,onHit:(p,t)=>{const o=p.owner;if(t.unstop>0||t.dead)return;p.uzSw=1;t.slow=Math.max(t.slow,1);
   jx({jfx:'uz_swapfx',x:o.x,y:o.y,x2:t.x,y2:t.y,t:.5,m:.5});if(near(o.x,o.y)){sparks(o.x,o.y,'#ececf2',8,'smoke');sparks(t.x,t.y,'#ececf2',8,'smoke');S('poof',o)}}});
  aux.push({type:'uz_swapk',x:u.x,y:u.y,r:0,t:1,m:1,team:u.team,owner:u,p:projs[projs.length-1]})}),
 uz_leap:SP('Bond des chaînes','Des chaînes te catapultent au curseur ; à l\'atterrissage, elles fouettent autour de toi : 12 dégâts, entrave 0,5 s et un sceau',8,{ai:{mode:'gap',min:150,max:300,p:.45}},(u,a,td)=>{S('dash',u);S('deflect',u);anim(u,'leap',.42);const L=clamp(td||260,90,290);
  jx({jfx:'uz_leapc',x:u.x,y:u.y,a,t:.5,m:.5});
  dash(u,a,L,.38,{jump:46,end:()=>{if(u.dead)return;VFX='chain';for(const e of enemies(u))if(dist(u,e)<92+e.r){hit(e,u,12,{root:.5,unblockable:1});uzMark(u,e,1)}VFX=null;
   jx({jfx:'uz_lash',x:u.x,y:u.y,t:.5,m:.5});if(near(u.x,u.y)){S('heavy',u);shake=Math.max(shake,.12)}}})}),
 uz_shiki:ULT('Shiki Fûjin','Coûte 12 % de tes PV. Le Shinigami se dresse 0,7 s, puis sa main saisit le 1er ennemi de la ligne : 34, puis âme scellée 3 s (12/s, ralenti, ni jutsu ni recharge) ; +8 par sceau',{hero:'thrawn',line:{len:520,w:36},ai:{max:480,p:.8}},(u,a)=>{S('genjutsu',u);S('roar',u);anim(u,'uz_shiki',1.1);u.root=Math.max(u.root,.75);u.uz_rtE=SIMT+.7;u.uz_rtB=0;
  jx({jfx:'uz_shini',ui:units.indexOf(u),x:u.x,y:u.y,a,t:1.35,m:1.35});
  later(u,.7,()=>{if(u.dead||u.uz_rtB||u.stun>0||u.sleepT<0){say(u,'RITUEL BRISÉ','#c8a8ff');return}const h0=u.hp;u.hp=Math.max(1,u.hp-Math.round(u.max*.12));say(u,'-'+Math.round(h0-u.hp)+' PV : LE PRIX DU SCEAU','#c8a8ff');S('shadow',u);
   proj(u,u.aim,{spd:950,r:16,dmg:34,life:.55,col:'#d8c8ff',kind:'uz_shand',vfx:'chakra',noClash:1,o:{unblockable:1},onHit:(p,t)=>uzSoul(p.owner,t)});if(near(u.x,u.y))shake=Math.max(shake,.25)})}),
 uz_bind:ULT('Entrave du démon','Après 0,4 s, des chaînes saisissent 3 ennemis à moins de 380 : entravés 0,6 s puis enchaînés à toi 3 s (170 au plus, ralentis), 8 dégâts par 0,5 s et un sceau par seconde ; tu restes immobile, un étourdissement les brise',{tele:{self:1,r:380},ai:SELF(330,.8)},(u)=>{S('heavy',u);S('deflect',u);anim(u,'uz_bind',3.5);u.root=Math.max(u.root,.45);u.uz_rtE=SIMT+.4;u.uz_rtB=0;
  const ui=units.indexOf(u);jx({jfx:'uz_bindw',ui,x:u.x,y:u.y,t:.45,m:.45});
  later(u,.4,()=>{if(u.dead||u.uz_rtB||u.stun>0||u.sleepT<0){say(u,'CHAÎNES BRISÉES','#e8c860');if(u.anim&&u.anim.k==='uz_bind')u.anim=null;return}
   const L=enemies(u).filter(e=>dist(u,e)<380+e.r&&!(e.stealth>0)).sort((p,q)=>dist(u,p)-dist(u,q)).slice(0,3);if(!L.length){say(u,'PERSONNE À ENCHAÎNER','#e8c860');if(u.anim&&u.anim.k==='uz_bind')u.anim=null;return}
   if(near(u.x,u.y)){S('heavy',u);shake=Math.max(shake,.3)}
   for(const e of L){aux.push({type:'uz_bind',x:e.x,y:e.y,r:0,t:3,m:3,team:u.team,owner:u,tg:e,ui,ti:units.indexOf(e),k:.5,n:0});VFX='chain';hit(e,u,8,{root:.6,unblockable:1});VFX=null;uzMark(u,e,1);if(near(e.x,e.y))sparks(e.x,e.y,'#e8c860',10,'chain')}})}),
});
Object.assign(NATHERO,{uz:'savage'});
// ---- mécaniques (hôte)
// Cage adamantine : 0,45 s d'alerte, jaillissement (entrave + sceau), puis barrière : les ennemis ne la franchissent pas, ni leurs tirs
AUXF.uz_cage=(x,dt)=>{const o=x.owner,el=(x.m-.45)-x.t;if(el<0)return;
 if(!x.on){x.on=1;VFX='chain';for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);x.sd[units.indexOf(e)]=d<x.r?1:0;if(d<x.r+e.r){hit(e,o,20,{root:.7,unblockable:1});uzMark(o,e,1)}}VFX=null;
  jx({jfx:'uz_cagef',x:x.x,y:x.y,r:x.r,t:x.t,m:x.t});ring(x.x,x.y,x.r,'#e8c860');if(near(x.x,x.y)){S('heavy',o);S('deflect',o);shake=Math.max(shake,.25);sparks(x.x,x.y,'#e8c860',16,'chain')}}
 x.lp=x.lp||{};for(const e of units){if(e.dead||e.team===x.team)continue;const i=units.indexOf(e),dx=e.x-x.x,dy=e.y-x.y,d=Math.hypot(dx,dy)||1,l=x.lp[i];let s=x.sd[i];if(s==null||(l&&!l.d&&!e.dash&&Math.hypot(e.x-l.x,e.y-l.y)>60))s=x.sd[i]=d<x.r?1:0;
  const m=s?x.r-e.r-3:x.r+e.r+3;if(s?d>m:d<m){e.x=x.x+dx/d*m;e.y=x.y+dy/d*m;e.kx*=.2;e.ky*=.2}if(!l)x.lp[i]={x:e.x,y:e.y,d:!!e.dash};else{l.x=e.x;l.y=e.y;l.d=!!e.dash}}
 for(const p of projs){if(p.dead||p.grenade||p.ret||!p.owner||p.owner.team===x.team)continue;const d=Math.hypot(p.x-x.x,p.y-x.y)-x.r,d0=Math.hypot(p.x-p.vx*dt-x.x,p.y-p.vy*dt-x.y)-x.r,d1=Math.hypot(p.x+p.vx*dt-x.x,p.y+p.vy*dt-x.y)-x.r;
  if(d0*d<=0||d*d1<=0){p.life=0;if(near(p.x,p.y))sparks(p.x,p.y,'#e8c860',6,'chain')}}};
// Rempart de chaînes : chaque ennemi garde son côté (il est repoussé s'il essaie de traverser, même en fonçant) ; les tirs ennemis qui le franchissent s'arrêtent
AUXF.uz_wall=(x,dt)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),H=x.len/2;
 for(const e of units){if(e.dead||e.team===x.team)continue;const k=units.indexOf(e),dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;if(Math.abs(s)>H+e.r){x.sd[k]=0;continue}
  let sd=x.sd[k];if(!sd)sd=x.sd[k]=f<0?-1:1;const m=e.r+6;if(sd*f<m){const d=sd*m-f;e.x+=ca*d;e.y+=sa*d;e.kx*=.2;e.ky*=.2;if(e.dash)e.dash=null}}
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team)continue;const dx=p.x-x.x,dy=p.y-x.y,s=-dx*sa+dy*ca;if(Math.abs(s)>H+p.r)continue;
  const f=dx*ca+dy*sa,f0=f-(p.vx*ca+p.vy*sa)*dt;if(Math.abs(f)<p.r+6||f*f0<=0){p.life=0;if(near(p.x,p.y))sparks(p.x,p.y,'#e8c860',6,'chain')}}};
// Parchemin de stockage : il suit la visée ; chaque tir ennemi qui le touche est scellé (le plus fort est gardé pour la relance)
AUXF.uz_scrl=(x,dt)=>{const o=x.owner;if(o.dead||!o.jst||o.jst.key!=='uz_store'){x.t=0;return}x.a=o.aim;const cx=o.x+Math.cos(x.a)*30,cy=o.y+Math.sin(x.a)*30;x.x=cx;x.y=cy;
 for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team)continue;if(Math.abs(p.x-cx)>x.r+30||Math.hypot(p.x-cx,p.y-cy)>x.r+p.r)continue;
  p.life=0;p.boom=1;p.dead=1;p.uzAbs=1;x.n++;const s=uzSnap(p);if(!o.uz_st||s.dmg>o.uz_st.dmg)o.uz_st=s;
  if(x.n===1)say(o,'TIR SCELLÉ','#ffd36a');if(near(p.x,p.y)){sparks(p.x,p.y,'#e8c860',6,'chain');jx({jfx:'uz_suck',x:p.x,y:p.y,ui:x.ui,t:.3,m:.3});S('deflect',o)}}};
// Sceau d'échange : si le kunai n'a échangé personne, le lanceur apparaît là où il s'est planté
AUXF.uz_swapk=x=>{const p=x.p,o=x.owner;if(!p||o.dead){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.t=0;if(p.uzSw)return;
 const x0=o.x,y0=o.y;o.x=clamp(p.x,B.x+o.r,B.x+B.w-o.r);o.y=clamp(p.y,B.y+o.r,B.y+B.h-o.r);o.dash=null;collide(o);
 jx({jfx:'uz_swapfx',x:x0,y:y0,x2:o.x,y2:o.y,t:.5,m:.5});if(near(x0,y0)){sparks(x0,y0,'#ececf2',12,'smoke');S('poof',o)}};
// âme scellée : 12 dégâts par seconde (par 0,5 s), pas de recharge du chakra
AUXF.uz_soul=x=>{const e=x.tg,o=x.owner;if(!e||e.dead){if(e)e.uz_soul=0;x.t=0;return}x.x=e.x;x.y=e.y;e.uz_soul=Math.max(0,x.t);e.chk=false;e.ckLock=Math.max(e.ckLock||0,.2);
 if(x.k<=0&&x.t>.05){x.k=.5;VFX='chakra';hit(e,o,6,{unblockable:1});VFX=null;if(near(e.x,e.y))sparks(e.x,e.y-20,'#d8c8ff',5,'chakra')}if(x.t<=0)e.uz_soul=0};
// Entrave du démon : la chaîne ramène l'ennemi s'il s'éloigne à plus de 170 ; coups réguliers et un sceau par seconde ; brisée si le lanceur est étourdi
AUXF.uz_bind=(x,dt)=>{const o=x.owner,e=x.tg;
 if(o.dead||!e||e.dead||o.stun>0||o.sleepT<0){x.t=0;if(!x.br){x.br=1;if(e&&!e.dead&&!o.dead)say(e,'CHAÎNES BRISÉES','#e8c860')}if(o.anim&&o.anim.k==='uz_bind'&&!aux.some(y=>y!==x&&y.type==='uz_bind'&&y.owner===o&&y.t>0))o.anim=null;return}
 o.root=Math.max(o.root,.1);x.x=e.x;x.y=e.y;const d=dist(o,e);
 if(d>UZ_BL&&e.unstop<=0){const a=ang(e,o),m=Math.min(d-UZ_BL,620*dt);e.x+=Math.cos(a)*m;e.y+=Math.sin(a)*m;e.kx*=.5;e.ky*=.5;if(e.dash&&d>UZ_BL+24)e.dash=null;collide(e)}
 if(e.unstop<=0)e.slow=Math.max(e.slow,.2);
 if(x.k<=0&&x.t>.05){x.k=.5;x.n++;VFX='chain';hit(e,o,8,{unblockable:1});VFX=null;if(x.n%2===0)uzMark(o,e,1)}};
// suivi des sceaux d'une cible : ils disparaissent 8 s après le dernier posé, à la mort de la cible, ou après une Détonation
AUXF.uz_mkt=x=>{const e=x.tg;if(!e||e.dead||!(e.uz_mk>0)||!(SIMT<e.uz_mkE)){if(e)e.uz_mk=0;x.t=0;return}x.t=1;x.x=e.x;x.y=e.y};
AUXD.uz_swapk=AUXD.uz_soul=AUXD.uz_mkt=()=>{};
// ---- aides de dessin : spirale Uzumaki, formule de sceau, chaînes dorées
// spirale (coordonnées de l'écran) : centre, rayon, rotation, aplatissement
function uzSpiral(x,y,R,rot,fl,col,lw){g.strokeStyle=col;g.lineWidth=lw;g.beginPath();for(let i=0;i<=24;i++){const b=rot+i*.45,r=R*i/24;i?g.lineTo(x+Math.cos(b)*r,y+Math.sin(b)*r*fl):g.moveTo(x,y)}g.stroke()}
// formule de sceau au sol (monde) : deux anneaux, traits d'encre, spirale au centre
function uzSealG(x,y,R,rot,col,ink){const q=P(x,y,0),r=R*q.s,rk=r*K;g.lineWidth=2;g.strokeStyle=col;g.beginPath();g.ellipse(q.x,q.y,r,rk,0,0,7);g.stroke();g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y,r*.8,rk*.8,0,0,7);g.stroke();
 g.strokeStyle=ink;g.lineWidth=2;g.beginPath();for(let i=0;i<12;i++){const b=rot+i*.5236,c=Math.cos(b),s=Math.sin(b),L=i%3?.08:.15;g.moveTo(q.x+c*r*.82,q.y+s*rk*.82);g.lineTo(q.x+c*r*(.82+L),q.y+s*rk*(.82+L))}g.stroke();uzSpiral(q.x,q.y,r*.42,rot*1.5,K,col,1.8)}
// chaîne dorée entre deux points de l'écran : ombre puis maillons alternés le long d'une courbe (sag = affaissement)
function uzChain(x0,y0,x1,y1,s,sag,col){const cx=(x0+x1)/2,cy=(y0+y1)/2+2*sag,L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.min(70,L/(6.5*s)|0));
 g.lineCap='round';g.strokeStyle='rgba(30,20,6,.5)';g.lineWidth=3.6*s;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(cx,cy,x1,y1);g.stroke();
 g.strokeStyle=col||'#e8c860';g.lineWidth=1.5*s;g.beginPath();for(let i=0;i<n;i++){const k=(i+.5)/n,j=1-k,px=j*j*x0+2*j*k*cx+k*k*x1,py=j*j*y0+2*j*k*cy+k*k*y1,a=Math.atan2(2*j*(cy-y0)+2*k*(y1-cy),2*j*(cx-x0)+2*k*(x1-cx)),rx=3.6*s;
  g.moveTo(px+Math.cos(a)*rx,py+Math.sin(a)*rx);g.ellipse(px,py,rx,(i%2?.9:2.1)*s,a,0,7)}g.stroke()}
// barrière de chaînes : poteaux à pointe de kunai reliés par deux rangées ; side 0 = moitié du fond, 1 = devant, -1 = pointes seules
function uzFence(x,y,R,side,h,al=1){if(h<=0||al<=0)return;const N=8,Q=[];for(let i=0;i<N;i++){const b=.39+i*Math.PI*2/N;Q.push({b,q:P(x+Math.cos(b)*R,y+Math.sin(b)*R,0)})}
 g.save();g.globalAlpha*=al;g.lineCap='round';
 if(side>=0)for(let i=0;i<N;i++){const A=Q[i],C=Q[(i+1)%N];if((Math.sin(A.b)+Math.sin(C.b)>0)!==(side===1))continue;const s=A.q.s;g.fillStyle='rgba(232,200,96,.13)';g.beginPath();g.moveTo(A.q.x,A.q.y);g.lineTo(A.q.x,A.q.y-h*.72*s);g.lineTo(C.q.x,C.q.y-h*.72*C.q.s);g.lineTo(C.q.x,C.q.y);g.closePath();g.fill();
  for(const hh of[.34,.7]){const ax=A.q.x,ay=A.q.y-h*hh*s,cx=C.q.x,cy=C.q.y-h*hh*C.q.s;g.strokeStyle='rgba(40,28,8,.55)';g.lineWidth=4.5*s;g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo((ax+cx)/2,(ay+cy)/2+14*s,cx,cy);g.stroke();
   g.strokeStyle='#e8c860';g.lineWidth=2.6*s;g.setLineDash([4*s,2.6*s]);g.stroke();g.setLineDash([])}}
 for(const {b,q} of Q){if(side>=0&&(Math.sin(b)>0)!==(side===1))continue;const s=q.s,top=q.y-h*s;
  g.strokeStyle='rgba(40,28,8,.6)';g.lineWidth=5*s;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x,top);g.stroke();g.strokeStyle='#e8c860';g.lineWidth=3*s;g.setLineDash([4.5*s,2.5*s]);g.stroke();g.setLineDash([]);
  g.fillStyle='#f4dc8a';g.beginPath();g.moveTo(q.x-4*s,top+2*s);g.lineTo(q.x,top-11*s);g.lineTo(q.x+4*s,top+2*s);g.closePath();g.fill();g.strokeStyle='#8a6a2a';g.lineWidth=1;g.stroke()}
 g.restore()}
// ---- objets au sol
AUXD.uz_cage=(x,k,t)=>{const el=(x.m-.45)-x.t,w=el<0?Math.max(0,1+el/.45):1,a=el<0?.9:.55*k;
 if(el<0){g.fillStyle=rgba('#e8c860',.08+.14*w);gEll(x.x,x.y,x.r*w);g.fill()}
 uzSealG(x.x,x.y,x.r*(el<0?.35+.65*ezo(w):1),t*(el<0?2.4:.5),rgba('#e8c860',a),rgba('#2a2a33',a*.85));
 if(el<0)uzFence(x.x,x.y,x.r,-1,12*w);else uzFence(x.x,x.y,x.r,0,64*Math.min(1,el/.18),k)};
// ---- projectiles
// kunai à étiquette de sceau (doré : kunai d'échange)
PROJD.uz_kunai=(p,R,ra,t)=>{g.rotate(ra);if(p.col==='#e8c860'){g.globalCompositeOperation='lighter';circ(-21,0,9,'rgba(232,200,96,.35)');circ(2,0,7,'rgba(232,200,96,.25)');g.globalCompositeOperation='source-over'}
 const w=Math.sin(t/40+p.x*.03)*2.4;g.fillStyle='#f0e0b0';g.beginPath();g.moveTo(-17,-1.6);g.lineTo(-28,-3.5+w);g.lineTo(-28,3.5+w);g.lineTo(-17,1.6);g.closePath();g.fill();g.strokeStyle='#c0302a';g.lineWidth=1.2;g.beginPath();g.moveTo(-21,w*.4-1.5);g.lineTo(-25,w*.8+1.5);g.stroke();
 g.strokeStyle='#3a3a44';g.lineWidth=1.3;g.beginPath();g.arc(-15.5,0,2.6,0,7);g.stroke();g.fillStyle='#3a3a44';g.fillRect(-13,-1.6,8,3.2);
 g.fillStyle='#e8eef6';g.beginPath();g.moveTo(-5,-4.2);g.lineTo(11,0);g.lineTo(-5,4.2);g.closePath();g.fill();g.fillStyle='#9aa2ae';g.beginPath();g.moveTo(-5,0);g.lineTo(11,0);g.lineTo(-5,4.2);g.closePath();g.fill()};
// tête de chaîne : pointe dorée, la chaîne part de la main du lanceur
PROJD.uz_chainp=(p,R,ra,t)=>{if(p.ox!=null){const q=P(p.x,p.y,28),a=P(p.ox,p.oy,30);uzChain((a.x-q.x)/q.s,(a.y-q.y)/q.s,0,0,1,5,'#e8c860')}
 g.rotate(ra);g.fillStyle='#f4dc8a';g.beginPath();g.moveTo(16,0);g.lineTo(-3,-6.5);g.lineTo(1,0);g.lineTo(-3,6.5);g.closePath();g.fill();g.strokeStyle='#8a6a2a';g.lineWidth=1.2;g.stroke();g.fillStyle='#2a2a33';g.fillRect(-9,-1.8,7,3.6)};
// cinq flammes de chakra qui tournent en pentagone
PROJD.uz_gogyo=(p,R,ra,t)=>{g.globalCompositeOperation='lighter';circ(0,0,R*.95,'rgba(160,112,255,.25)');for(let i=0;i<5;i++){const b=t/80+i*1.2566,x=Math.cos(b)*R*1.15,y=Math.sin(b)*R*.85;g.fillStyle=i%2?'rgba(190,150,255,.9)':'rgba(140,90,255,.9)';
 g.beginPath();g.moveTo(x-3.6,y+1);g.quadraticCurveTo(x-1,y-12,x+.5,y-15);g.quadraticCurveTo(x+1.5,y-8,x+3.6,y+1);g.closePath();g.fill();circ(x,y-1,1.8,'#f4ecff')}circ(0,0,R*.35,'#f4ecff')};
// ---- effets de jutsu
// parchemin de stockage qui se déroule devant le lanceur
JFXD.uz_scroll=(f,k,e,t,u)=>{if(!u)return;const a=f.a,c=P(u.x+Math.cos(a)*26,u.y+Math.sin(a)*26,34),s=c.s,L=46*s*Math.min(1,e/.35),h=8*s;g.globalAlpha=Math.min(1,k*3);g.translate(c.x,c.y);g.rotate(Math.atan2(Math.cos(a)*K,-Math.sin(a)));
 g.fillStyle='#f0e0b0';g.fillRect(-L/2,-h/2,L,h);g.strokeStyle='#b89a60';g.lineWidth=1;g.strokeRect(-L/2,-h/2,L,h);g.fillStyle='#2a2a33';for(let i=-2;i<=2;i++)if(i&&Math.abs(i*8*s)<L/2-4*s)g.fillRect(i*8*s-1.2*s,-2.6*s,2.4*s,5.2*s);
 if(L>8*s)circ(0,0,2.8*s,'#c0302a');g.fillStyle='#6a4a2a';for(const sx of[-1,1])g.fillRect(sx*L/2-2*s,-h*.8,4*s,h*1.6)};
// chaînes enroulées autour de la cible ramenée
JFXD.uz_wrap=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s;g.globalAlpha=Math.min(1,k*3);
 if(u&&!u.dead&&e<.55){const a=P(u.x+Math.cos(u.aim)*14,u.y+Math.sin(u.aim)*14,30);uzChain(a.x,a.y,q.x,q.y-30*s,s,8*s,'#e8c860')}
 g.lineCap='round';g.strokeStyle='rgba(40,28,8,.6)';g.lineWidth=4*s;g.beginPath();for(const h of[18,32,46]){g.moveTo(q.x+17*s,q.y-h*s);g.ellipse(q.x,q.y-h*s,17*s,6*s,(h-32)*.012,0,7)}g.stroke();
 g.strokeStyle='#e8c860';g.lineWidth=2.2*s;g.setLineDash([3.5*s,2.2*s]);g.stroke();g.setLineDash([])};
// devant de la barrière de chaînes (le fond est dessiné au sol, sous les ninjas)
JFXD.uz_cagef=(f,k,e)=>{uzFence(f.x,f.y,f.r,1,64*Math.min(1,(f.m-f.t)/.18),Math.min(1,f.t/.3))};
// sceau des cinq éléments sur la cible : pentagramme au sol, flammes qui se referment sur le ventre
JFXD.uz_g5=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,R=30*s,rot=t*1.5;g.globalAlpha=Math.min(1,k*4);g.fillStyle='rgba(140,90,255,.12)';g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.strokeStyle='rgba(196,156,255,.9)';g.lineWidth=2.2;
 g.beginPath();for(let i=0;i<=5;i++){const b=rot+i*2.513;i?g.lineTo(q.x+Math.cos(b)*R,q.y+Math.sin(b)*R*K):g.moveTo(q.x+Math.cos(b)*R,q.y+Math.sin(b)*R*K)}g.moveTo(q.x+R,q.y);g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();
 const c=P(tg.x,tg.y,30),m=Math.min(1,e*6);g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const b=i*1.2566+t*3,r=(1-m)*26*s+6*s,x0=c.x+Math.cos(b)*r,y0=c.y+Math.sin(b)*r*.6;g.fillStyle='rgba(170,120,255,.8)';g.beginPath();g.moveTo(x0-3*s,y0);g.quadraticCurveTo(x0,y0-11*s,x0+3*s,y0);g.fill()}
 g.globalCompositeOperation='source-over';g.strokeStyle='#e8c860';g.lineWidth=1.6;g.beginPath();g.arc(c.x,c.y,7*s,0,7);g.stroke();uzSpiral(c.x,c.y,5*s,t*4,1,'#2a2a33',1.2)};
// échange : un sceau à chaque bout, trait doré entre les deux
JFXD.uz_swapfx=(f,k,e)=>{for(const [x,y] of[[f.x,f.y],[f.x2,f.y2]]){const q=P(x,y,0),R=(22+e*14)*q.s;g.strokeStyle=rgba('#e8c860',.9*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();uzSpiral(q.x,q.y,R*.7,e*6,K,rgba('#2a2a33',.8*k),1.4)}
 const a=P(f.x,f.y,28),b=P(f.x2,f.y2,28);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe9a0',.75*k);g.lineWidth=4*k+1;g.setLineDash([10,7]);g.lineDashOffset=-e*80;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.setLineDash([])};
// tir avalé par le sceau : traînée dorée qui s'enroule vers son centre
JFXD.uz_suck=(f,k,e,t,u)=>{if(!u)return;const a=P(f.x,f.y,28),b=P(u.x+Math.cos(u.aim)*30,u.y+Math.sin(u.aim)*30,34),m=ezo(e);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe9a0',.9*k);g.lineWidth=3*a.s*k+1;g.lineCap='round';g.beginPath();g.moveTo(lerp(a.x,b.x,m*.7),lerp(a.y,b.y,m*.7));g.quadraticCurveTo((a.x+b.x)/2+(a.y-b.y)*.3,(a.y+b.y)/2-(a.x-b.x)*.3,b.x,b.y);g.stroke();circ(b.x,b.y,(6+10*k)*b.s,rgba('#fff3c0',.5*k))};
// ---- dessins propres au nouveau kit
// étiquette de sceau (ofuda) : papier, bandes rouges, spirale d'encre ; glow = sceau chargé
function uzTag(x,y,s,al,rot,glow){g.save();g.globalAlpha*=al;g.translate(x,y);g.rotate(rot||0);if(glow){g.globalCompositeOperation='lighter';circ(0,0,11*s,rgba('#ffb03a',.4*glow));g.globalCompositeOperation='source-over'}
 g.fillStyle='#f2e4b8';g.fillRect(-4*s,-8*s,8*s,16*s);g.strokeStyle='#7a5a2a';g.lineWidth=.8;g.strokeRect(-4*s,-8*s,8*s,16*s);g.fillStyle='#c0302a';g.fillRect(-4*s,-8*s,8*s,2.2*s);g.fillRect(-4*s,5.8*s,8*s,2.2*s);
 uzSpiral(0,0,3.1*s,0,1,'#22222a',1.1);g.restore()}
// rempart de chaînes : poteaux à pointe de kunai, deux rangées de chaînes et une croix, voile doré
AUXD.uz_wall=(x,k,t)=>{const el=x.m-x.t,h=60*ezo(Math.min(1,el/.16))*Math.min(1,x.t/.35),H=x.len/2,px=-Math.sin(x.a),py=Math.cos(x.a),N=7;if(h<=1)return;g.lineCap='round';
 const Q=[];for(let i=0;i<N;i++){const s_=-H+i*x.len/(N-1);Q.push(P(x.x+px*s_,x.y+py*s_,0))}
 if(el<.3){g.fillStyle=rgba('#e8c860',.3*(1-el/.3));g.beginPath();g.moveTo(Q[0].x,Q[0].y);g.lineTo(Q[N-1].x,Q[N-1].y);g.lineWidth=14*Q[3].s;g.strokeStyle=rgba('#ffe9a0',.35*(1-el/.3));g.stroke()}
 g.fillStyle=rgba('#e8c860',.1*k);g.beginPath();g.moveTo(Q[0].x,Q[0].y);for(const q of Q)g.lineTo(q.x,q.y-h*.78*q.s);g.lineTo(Q[N-1].x,Q[N-1].y);g.closePath();g.fill();
 g.strokeStyle=rgba('#2a2a33',.55*k);g.lineWidth=2;g.setLineDash([3,5]);g.beginPath();g.moveTo(Q[0].x,Q[0].y);g.lineTo(Q[N-1].x,Q[N-1].y);g.stroke();g.setLineDash([]);
 g.globalAlpha*=k;for(let i=0;i<N-1;i++){const A=Q[i],C=Q[i+1];for(const hh of[.32,.72])uzChain(A.x,A.y-h*hh*A.s,C.x,C.y-h*hh*C.s,A.s,5*A.s,'#e8c860');if(i%2===0)uzChain(A.x,A.y-h*.1*A.s,C.x,C.y-h*.9*C.s,A.s,0,'#c8a848')}
 for(const q of Q){const s=q.s,top=q.y-h*s;g.strokeStyle='rgba(40,28,8,.6)';g.lineWidth=5*s;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x,top);g.stroke();g.strokeStyle='#e8c860';g.lineWidth=3*s;g.setLineDash([4.5*s,2.5*s]);g.stroke();g.setLineDash([]);
  g.fillStyle='#f4dc8a';g.beginPath();g.moveTo(q.x-4*s,top+2*s);g.lineTo(q.x,top-11*s);g.lineTo(q.x+4*s,top+2*s);g.closePath();g.fill();g.strokeStyle='#8a6a2a';g.lineWidth=1;g.stroke()}};
// chaînes de l'Entrave du démon : elles sortent du dos du lanceur et s'enroulent autour de chaque ennemi
AUXD.uz_bind=(x,k,t)=>{const o=units[x.ui],e=units[x.ti];if(!o||!e||o.dead||e.dead)return;const j=(x.ti*1.7)%3,a=P(o.x-Math.cos(o.aim||0)*8,o.y-Math.sin(o.aim||0)*8,40+j*6),b=P(e.x,e.y,30),s=b.s;g.globalAlpha*=Math.min(1,x.t*4);
 uzChain(a.x,a.y,b.x,b.y,s,(12+Math.sin(t*7+x.ti)*5)*s,'#e8c860');const q=P(e.x,e.y,0);g.lineCap='round';g.strokeStyle='rgba(40,28,8,.6)';g.lineWidth=4*s;g.beginPath();for(const hh of[16,30,44]){g.moveTo(q.x+16*s,q.y-hh*s);g.ellipse(q.x,q.y-hh*s,16*s,6*s,(hh-30)*.015,0,7)}g.stroke();
 g.strokeStyle='#e8c860';g.lineWidth=2.2*s;g.setLineDash([3.5*s,2.2*s]);g.lineDashOffset=-t*20;g.stroke();g.setLineDash([]);g.globalCompositeOperation='lighter';circ(a.x,a.y,5*a.s,rgba('#ffe9a0',.6))};
AUXD.uz_scrl=()=>{};
// ---- projectiles
// shuriken stocké
PROJD.uz_shur=(p,R,ra,t)=>{g.rotate(t/28+p.x*.01);g.fillStyle='#c8ccd4';g.strokeStyle='#5a606a';g.lineWidth=1;g.beginPath();for(let i=0;i<8;i++){const b=i*Math.PI/4,r=i%2?3:10;i?g.lineTo(Math.cos(b)*r,Math.sin(b)*r):g.moveTo(r,0)}g.closePath();g.fill();g.stroke();circ(0,0,1.8,'#2a2a33')};
// main du Shinigami : bras spectral, paume et doigts griffus
PROJD.uz_shand=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(-80,0,0,0);gr.addColorStop(0,'rgba(170,140,255,0)');gr.addColorStop(1,'rgba(200,180,255,.55)');g.fillStyle=gr;g.beginPath();g.moveTo(-80,-5);g.quadraticCurveTo(-30,-11,0,-9);g.lineTo(0,9);g.quadraticCurveTo(-30,11,-80,5);g.closePath();g.fill();
 circ(4,0,R*1.15,'rgba(160,120,255,.22)');g.globalCompositeOperation='source-over';g.fillStyle='#ece6ff';g.strokeStyle='#6a4a9a';g.lineWidth=1.4;g.beginPath();g.ellipse(2,0,9,8,0,0,7);g.fill();g.stroke();
 const w=Math.sin(t/60)*1.5;g.lineCap='round';for(let i=0;i<4;i++){const y=-6+i*4;g.strokeStyle='#6a4a9a';g.lineWidth=4.2;g.beginPath();g.moveTo(8,y*.8);g.quadraticCurveTo(16,y,20+(i===1||i===2?3:0),y*1.1+w);g.stroke();g.strokeStyle='#ece6ff';g.lineWidth=2.6;g.stroke();circ(21+(i===1||i===2?3:0),y*1.1+w,1.1,'#2a1840')}
 g.strokeStyle='#6a4a9a';g.lineWidth=4;g.beginPath();g.moveTo(0,7);g.quadraticCurveTo(6,12,12,11);g.stroke();g.strokeStyle='#ece6ff';g.lineWidth=2.4;g.stroke()};
// ---- effets de jutsu (nouveau kit)
// un sceau se colle sur l'ennemi
JFXD.uz_mkon=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,46),s=q.s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe9a0',.9*k);g.lineWidth=2.5*k+.5;g.beginPath();g.ellipse(q.x,q.y,(8+e*26)*s,(8+e*26)*s*.7,0,0,7);g.stroke();
 g.globalCompositeOperation='source-over';uzTag(q.x,q.y-(1-ezo(e))*16*s,s*(1.7-.7*ezo(e)),Math.min(1,k*3),(1-e)*2,k)};
// 3e sceau : le chakra de la cible est verrouillé (spirale qui se referme, chaîne autour de la taille)
JFXD.uz_lock=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,34),s=q.s,m=Math.min(1,e*5),a=Math.min(1,k*4);g.globalAlpha=a;g.lineCap='round';
 g.strokeStyle='rgba(40,28,8,.6)';g.lineWidth=4*s;g.beginPath();g.ellipse(q.x,q.y,20*s,7*s,0,0,7);g.stroke();g.strokeStyle='#e8c860';g.lineWidth=2.4*s;g.setLineDash([3.5*s,2.2*s]);g.lineDashOffset=t*15;g.stroke();g.setLineDash([]);
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffd36a',.85);g.lineWidth=1.6;g.beginPath();for(let i=0;i<8;i++){const b=t*2+i*.785,r0=(26-14*m)*s;g.moveTo(q.x+Math.cos(b)*r0,q.y-20*s+Math.sin(b)*r0*.8);g.lineTo(q.x+Math.cos(b)*(r0+6*s),q.y-20*s+Math.sin(b)*(r0+6*s)*.8)}g.stroke();
 uzSpiral(q.x,q.y-20*s,(14-5*m)*s,-t*5,.85,rgba('#ffe9a0',.9),1.8)};
// Détonation : sceau de libération dans la main du lanceur, onde dorée
JFXD.uz_kaic=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=u.aim||0,h=P(u.x+Math.cos(a)*12,u.y+Math.sin(a)*12,54),q=P(u.x,u.y,0),s=q.s;g.globalCompositeOperation='lighter';
 circ(h.x,h.y,(6+10*k)*s,rgba('#ffd36a',.55*k));circ(h.x,h.y,3*s,rgba('#ffffff',.9*k));g.strokeStyle=rgba('#ffd36a',.8*k);g.lineWidth=2;g.beginPath();for(let i=0;i<6;i++){const b=i*1.047+t*4;g.moveTo(h.x+Math.cos(b)*5*s,h.y+Math.sin(b)*5*s);g.lineTo(h.x+Math.cos(b)*(12+16*e)*s,h.y+Math.sin(b)*(12+16*e)*s)}g.stroke();
 const R=(30+e*UZ_KAIR*.9)*s;g.strokeStyle=rgba('#ffd36a',.5*k);g.lineWidth=3*k+1;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke()};
// Détonation : les étiquettes s'embrasent sur la cible juste avant l'explosion
JFXD.uz_kaib=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const n=f.n||1,q=P(tg.x,tg.y,46),s=q.s;for(let i=0;i<n;i++){const b=i*Math.PI*2/n+e*3,x=q.x+Math.cos(b)*18*s*(1-e*.4),y=q.y+Math.sin(b)*6*s;uzTag(x,y,s*(.9+e*.4),1,Math.sin(e*30+i)*.3,1)}
 g.globalCompositeOperation='lighter';circ(q.x,q.y,(10+e*20)*s,rgba('#ff7a2a',.35*e))};
// Détonation : explosion de papier et de flammes, plus grosse par sceau
JFXD.uz_kaiboom=(f,k,e)=>{const n=f.n||1,q=P(f.x,f.y,30),g0=P(f.x,f.y,0),s=q.s,R=(18+e*(40+16*n))*s;g.fillStyle=rgba('#2a1a10',.3*k);g.beginPath();g.ellipse(g0.x,g0.y,R*.8,R*.8*K,0,0,7);g.fill();
 g.globalCompositeOperation='lighter';if(e<.45){const w=1-e/.45;circ(q.x,q.y,R,rgba('#ff7a2a',.45*w));circ(q.x,q.y,R*.55,rgba('#ffd36a',.7*w));circ(q.x,q.y,R*.22,rgba('#ffffff',.9*w))}
 g.strokeStyle=rgba('#ffb03a',.7*k);g.lineWidth=4*k+1;g.beginPath();g.ellipse(g0.x,g0.y,R*1.2,R*1.2*K,0,0,7);g.stroke();g.globalCompositeOperation='source-over';
 for(let i=0,N=6+4*n;i<N;i++){const b=i*2.399+f.x,d=R*(.6+((i*37)%50)/60),x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*.6-30*s*e+60*s*e*e;g.save();g.translate(x,y);g.rotate(b+e*9);g.globalAlpha=k;g.fillStyle=i%3?'#f2e4b8':'#c0302a';g.fillRect(-2.5*s,-4*s,5*s,8*s);g.restore()}};
// Parchemin de stockage : grand parchemin déroulé devant le lanceur, formule de sceau qui tourne
JFXD.uz_scrollS=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=u.aim,c=P(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,36),s=c.s,w=ezo(Math.min(1,e*7)),W=34*w,Hh=24;g.globalAlpha=Math.min(1,e*8,k*5);g.translate(c.x,c.y);g.scale((.42+.58*Math.abs(Math.sin(a)))*s,s);
 g.globalCompositeOperation='lighter';circ(0,0,40,'rgba(232,200,96,.12)');g.globalCompositeOperation='source-over';g.fillStyle='#f2e4b8';g.fillRect(-W,-Hh,W*2,Hh*2);g.strokeStyle='#b89a60';g.lineWidth=1.2;g.strokeRect(-W,-Hh,W*2,Hh*2);
 g.fillStyle='#c0302a';g.fillRect(-W,-Hh,W*2,3);g.fillRect(-W,Hh-3,W*2,3);g.fillStyle='#6a4a2a';for(const sx of[-1,1])g.fillRect(sx*W-3,-Hh-4,6,Hh*2+8);
 if(w>.6){g.strokeStyle='#22222a';g.lineWidth=1.6;g.beginPath();g.arc(0,0,17,0,7);g.stroke();g.lineWidth=1;g.beginPath();g.arc(0,0,13,0,7);g.stroke();g.beginPath();for(let i=0;i<8;i++){const b=t*1.5+i*.785;g.moveTo(Math.cos(b)*17,Math.sin(b)*17);g.lineTo(Math.cos(b)*22,Math.sin(b)*22)}g.stroke();
  uzSpiral(0,0,10,-t*4,1,'#22222a',1.6);g.fillStyle='#22222a';for(const sx of[-1,1])for(let i=0;i<3;i++)g.fillRect(sx*(W-9)-1.2,-14+i*10,2.4,6)}};
// Bond des chaînes : formule au point de départ, chaînes qui s'enfoncent dans le sol
JFXD.uz_leapc=(f,k,e,t)=>{g.globalAlpha=Math.min(1,k*2);uzSealG(f.x,f.y,30+e*12,t*3,rgba('#e8c860',.9),rgba('#22222a',.8));const c=P(f.x,f.y,0),s=c.s;for(let i=0;i<3;i++){const b=f.a+Math.PI+(i-1)*.7,q=P(f.x+Math.cos(b)*26,f.y+Math.sin(b)*26,0);uzChain(c.x,c.y-30*s*(1-e),q.x,q.y,s,2*s,'#e8c860')}};
// Bond des chaînes : à l'atterrissage, huit chaînes fouettent en étoile
JFXD.uz_lash=(f,k,e,t)=>{const m=e<.35?ezo(e/.35):1-.35*(e-.35)/.65,c=P(f.x,f.y,8),s=c.s;g.globalAlpha=Math.min(1,k*2.5);uzSealG(f.x,f.y,40,t*2,rgba('#e8c860',.8),rgba('#22222a',.7));
 for(let i=0;i<8;i++){const b=i*.785+.2,q=P(f.x+Math.cos(b)*92*m,f.y+Math.sin(b)*92*m,4+10*Math.sin(m*Math.PI));uzChain(c.x,c.y,q.x,q.y,s,(i%2?3:-3)*s,'#e8c860');g.fillStyle='#f4dc8a';g.beginPath();g.arc(q.x,q.y,2.6*s,0,7);g.fill()}};
// Entrave du démon : formule sous le lanceur, portée des chaînes en pointillés, pointes qui sortent du dos
JFXD.uz_bindw=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s;uzSealG(u.x,u.y,30+40*ezo(e),t*2.5,rgba('#e8c860',.9*Math.min(1,k*3)),rgba('#22222a',.8));
 g.strokeStyle=rgba('#ffd36a',.6*Math.min(1,k*3));g.lineWidth=2.5;g.setLineDash([12,8]);g.lineDashOffset=-t*60;g.beginPath();g.ellipse(q.x,q.y,380*s,380*s*K,0,0,7);g.stroke();g.setLineDash([]);
 const b=P(u.x,u.y,44);for(let i=0;i<4;i++){const an=-Math.PI/2+(i-1.5)*.55,L=(10+36*e)*s;uzChain(b.x,b.y,b.x+Math.cos(an)*L,b.y+Math.sin(an)*L*.9,s,0,'#e8c860');g.fillStyle='#f4dc8a';g.beginPath();g.arc(b.x+Math.cos(an)*L,b.y+Math.sin(an)*L*.9,2.4*s,0,7);g.fill()}};
// Shiki Fûjin : le Shinigami se dresse derrière le lanceur (cornes, cheveux blancs, poignard entre les dents, chapelet), puis tend le bras vers la visée
JFXD.uz_shini=(f,k,e,t,u)=>{if(!u)return;const a=f.a,q=P(u.x-Math.cos(a)*30,u.y-Math.sin(a)*30,0),s=q.s*1.25,rise=ezo(Math.min(1,e*3.2)),al=Math.min(1,e*5,k*3.5)*.78;if(al<=0)return;g.globalAlpha=al;g.translate(q.x,q.y+(1-rise)*30*s);g.scale(1,.55+.45*rise);
 g.fillStyle='rgba(30,16,50,.45)';g.beginPath();g.ellipse(0,0,46*s,15*s,0,0,7);g.fill();
 const gr=g.createLinearGradient(0,-112*s,0,0);gr.addColorStop(0,'#f2eefa');gr.addColorStop(.6,'rgba(200,184,240,.85)');gr.addColorStop(1,'rgba(150,120,220,0)');g.fillStyle=gr;
 g.beginPath();g.moveTo(-24*s,-110*s);g.quadraticCurveTo(-44*s,-56*s,-36*s,-2*s);g.quadraticCurveTo(0,6*s,36*s,-2*s);g.quadraticCurveTo(44*s,-56*s,24*s,-110*s);g.closePath();g.fill();
 g.strokeStyle='rgba(120,90,190,.55)';g.lineWidth=1.5;g.beginPath();for(const x of[-14,0,14]){g.moveTo(x*s,-96*s);g.quadraticCurveTo((x+x*.3)*s,-50*s,x*1.5*s,-8*s)}g.stroke();g.fillStyle='rgba(90,60,150,.8)';g.fillRect(-26*s,-76*s,52*s,6*s);
 g.fillStyle='#f6f4fb';g.beginPath();g.moveTo(-12*s,-140*s);g.quadraticCurveTo(-30*s,-118*s,-28*s,-84*s);g.lineTo(28*s,-84*s);g.quadraticCurveTo(30*s,-118*s,12*s,-140*s);g.closePath();g.fill();
 g.fillStyle='#e8e0c8';for(const sx of[-1,1]){g.beginPath();g.moveTo(sx*6*s,-139*s);g.quadraticCurveTo(sx*18*s,-150*s,sx*10*s,-168*s);g.quadraticCurveTo(sx*12*s,-152*s,sx*2*s,-141*s);g.closePath();g.fill()}
 g.fillStyle='#6a4a9a';g.beginPath();g.ellipse(0,-126*s,10.5*s,14*s,0,0,7);g.fill();g.globalCompositeOperation='lighter';g.fillStyle='#ffe9a0';for(const sx of[-1,1]){g.beginPath();g.ellipse(sx*4.2*s,-130*s,2.6*s,1*s,sx*.3,0,7);g.fill()}g.globalCompositeOperation='source-over';
 g.strokeStyle='#22102e';g.lineWidth=1.2;g.beginPath();g.moveTo(-6*s,-119*s);g.quadraticCurveTo(0,-116*s,6*s,-119*s);g.stroke();g.fillStyle='#dfe4ec';g.beginPath();g.moveTo(-3*s,-119.5*s);g.lineTo(18*s,-118*s);g.lineTo(-3*s,-117*s);g.closePath();g.fill();g.fillStyle='#3a2a1a';g.fillRect(-10*s,-120*s,7*s,3*s);
 g.lineCap='round';g.strokeStyle='#6a4a9a';g.lineWidth=7*s;g.beginPath();g.moveTo(-24*s,-102*s);g.quadraticCurveTo(-36*s,-82*s,-30*s,-62*s);g.stroke();g.fillStyle='#3a2a1a';for(let i=0;i<7;i++){const b=i*.9;g.beginPath();g.arc(-30*s+Math.cos(b)*6*s,-64*s+Math.sin(b)*3*s,1.8*s,0,7);g.fill()}
 const rel=e<.52?0:ezo(Math.min(1,(e-.52)/.14)),dx=Math.cos(a),dy=Math.sin(a)*K,L=(16+90*rel)*s,hx=24*s+dx*L,hy=-100*s+dy*L+(1-rel)*22*s;g.strokeStyle='#6a4a9a';g.lineWidth=7*s;g.beginPath();g.moveTo(24*s,-102*s);g.quadraticCurveTo(30*s+dx*L*.4,-104*s+dy*L*.4,hx,hy);g.stroke();
 g.fillStyle='#ece6ff';g.beginPath();g.arc(hx,hy,5*s,0,7);g.fill();g.strokeStyle='#ece6ff';g.lineWidth=2*s;g.beginPath();for(let i=-1;i<=1;i++){g.moveTo(hx,hy);g.lineTo(hx+(dx*9-dy*i*3)*s,hy+(dy*9+dx*i*3)*s)}g.stroke();
 if(rel>0){g.globalCompositeOperation='lighter';circ(hx,hy,(10+8*Math.sin(t*20))*s,rgba('#c8b8ff',.35*k))}};
// ---- états visibles sur les ninjas
// sceaux posés : étiquettes qui tournent autour de la taille ; au 3e, anneau doré
STATD.push((u,p,S,sk)=>{const n=u.uz_mk|0;if(!n||u.dead)return;sk=sk||1;const t=performance.now()/1000,cy=p.y-44*S*sk;
 if(n>=3){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffd36a',.45+.25*Math.sin(t*8));g.lineWidth=2*S;g.beginPath();g.ellipse(p.x,p.y,24*S,9*S,0,0,7);g.stroke();g.restore()}
 for(let i=0;i<n;i++){const b=t*1.6+i*Math.PI*2/n;uzTag(p.x+Math.cos(b)*18*S,cy+Math.sin(b)*6*S,S*.85,Math.sin(b)<0?.55:1,Math.sin(t*3+i)*.25,n>=3?.6+.4*Math.sin(t*9):0)}});
// âme scellée : l'âme, pâle et violette, est tirée hors du corps par une main spectrale
STATD.push((u,p,S,sk)=>{if(!(u.uz_soul>0)||u.dead)return;sk=sk||1;const t=performance.now()/1000,a=Math.min(1,u.uz_soul*2.5),y0=p.y-50*S*sk,y1=p.y-(84+Math.sin(t*3)*4)*S*sk;g.save();g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#b8a0ff',.25*a);g.beginPath();g.moveTo(p.x-7*S,y0);g.quadraticCurveTo(p.x-14*S,(y0+y1)/2,p.x-9*S,y1);g.lineTo(p.x+9*S,y1);g.quadraticCurveTo(p.x+14*S,(y0+y1)/2,p.x+7*S,y0);g.closePath();g.fill();
 circ(p.x,y1,13*S,rgba('#c8b8ff',.35*a));circ(p.x,y1-2*S,8*S,rgba('#f4f0ff',.7*a));g.fillStyle=rgba('#2a1840',.6*a);for(const sx of[-1,1]){g.beginPath();g.ellipse(p.x+sx*3*S,y1-3*S,1.4*S,2*S,0,0,7);g.fill()}
 g.globalCompositeOperation='source-over';const hy=y1-16*S;g.strokeStyle=rgba('#6a4a9a',.9*a);g.lineWidth=4*S;g.lineCap='round';g.beginPath();g.moveTo(p.x-16*S,hy-22*S);g.quadraticCurveTo(p.x-10*S,hy-6*S,p.x,hy);g.stroke();
 g.strokeStyle=rgba('#ece6ff',.95*a);g.lineWidth=2*S;g.beginPath();for(let i=-1;i<=2;i++){g.moveTo(p.x+i*3*S,hy);g.quadraticCurveTo(p.x+i*5*S,hy+7*S,p.x+i*3.5*S,hy+12*S)}g.stroke();g.restore()});
// ---- animations 3D
Object.assign(ANIM,{
 // la main gauche tient le parchemin, la droite balaie et libère les kunai
 uz_scroll:(P,e)=>{const k=Math.min(1,e/.25),s=ezo(Math.min(1,Math.max(0,(e-.2)/.4)));pz(P,'armL',-1.4*k,0,-.25*k);pz(P,'foreL',-.4);pz(P,'armR',-1.35*k,0,(.6-1.5*s)*k);pz(P,'foreR',-.2);pz(P,'chest',.1*k,(.3-.65*s)*k)},
 // lance la chaîne, puis tire d'un coup sec
 uz_chain:(P,e)=>{const th=e<.35,k=th?ezo(e/.35):1,y=th?0:ezo(Math.min(1,(e-.4)/.35));pz(P,'armR',-1.62*k+1.1*y,0,.05);pz(P,'foreR',-.1-1.3*y);pz(P,'armL',-.45,0,.45);pz(P,'chest',.25*k-.4*y,.35*k-.2*y);pz(P,'head',.1*y)},
 // paume gauche tendue (le sceau), la droite tient le poignet ; les jambes restent libres
 uz_absorb:(P,e)=>{const k=Math.min(1,e/.12);pz(P,'armL',-1.58*k,0,-.08);pz(P,'foreL',-.05);pz(P,'armR',-1.2*k,0,.4*k);pz(P,'foreR',-1.15*k);pz(P,'chest',.12*k,-.25*k)},
 // signe de libération : deux doigts levés devant le visage, puis le bras claque vers l'avant
 uz_kai:(P,e)=>{const k=ezo(Math.min(1,e/.2)),r=e>.55?ezo(Math.min(1,(e-.55)/.25)):0;pz(P,'armR',-1.3*k-.35*r,0,.35*k-.2*r);pz(P,'foreR',-1.75*k+1.5*r);pz(P,'armL',-.25*k,0,.5*k);pz(P,'foreL',-.5*k);pz(P,'chest',-.08*k+.2*r,-.25*k+.2*r);pz(P,'head',.1*k)},
 // paumes plaquées au sol : les chaînes jaillissent
 uz_slam:(P,e)=>{const k=e<.35?ezo(e/.35):1-.6*ezo((e-.35)/.65);P.root.y=-11*k;pz(P,'chest',.75*k);pz(P,'head',-.35*k);pz(P,'armL',-1.15*k,0,-.2*k);pz(P,'armR',-1.15*k,0,.2*k);pz(P,'foreL',-.15*k);pz(P,'foreR',-.15*k);pz(P,'thighL',-1.05*k);pz(P,'thighR',-.4*k);pz(P,'shinL',1.35*k);pz(P,'shinR',1.2*k)},
 // Shiki Fûjin : mains jointes (prière), puis le bras droit se tend avec celui du Shinigami
 uz_shiki:(P,e)=>{const k=ezo(Math.min(1,e/.2));if(e<.62){pz(P,'armL',-1.2*k,0,-.55*k);pz(P,'foreL',-1.3*k);pz(P,'armR',-1.2*k,0,.55*k);pz(P,'foreR',-1.3*k);pz(P,'head',.18*k);pz(P,'chest',.12*k)}
  else{const r=ezo(Math.min(1,(e-.62)/.15));pz(P,'armR',-1.2-.38*r,0,.55-.6*r);pz(P,'foreR',-1.3+1.2*r);pz(P,'armL',-1.2+.9*r,0,-.55+.95*r);pz(P,'foreL',-1.3+.7*r);pz(P,'chest',.12+.25*r,.3*r);pz(P,'head',.18-.25*r);pz(P,'thighR',-.5*r);pz(P,'shinR',.4*r)}},
 // Entrave du démon : bras écartés, buste cambré, les chaînes sortent du dos ; léger tremblement de l'effort
 uz_bind:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.1)),w=Math.sin((t||0)*30)*.04*k;pz(P,'armL',-.45*k,0,1.25*k+w);pz(P,'armR',-.45*k,0,-1.25*k-w);pz(P,'foreL',-.35*k);pz(P,'foreR',-.35*k);pz(P,'chest',-.38*k);pz(P,'head',-.32*k);pz(P,'thighL',-.25*k,0,.18*k);pz(P,'thighR',.15*k,0,-.18*k);P.root.y=-3*k},
});
// ---- trait de clan : Fûinjutsu (les sceaux du clan, et la vitalité Uzumaki : sous 30 % de PV, le chakra se change en vie)
TRAITS[6]={nom:'Fûinjutsu',desc:'Kunai, chaînes et sceaux du clan marquent l\'ennemi (3 sceaux max, 8 s) ; au 3e, son chakra est scellé : −15 et pas de recharge (R) 2 s (une fois par 8 s). Réserves Uzumaki : recharge (R) +14/s. Sous 30 % de PV, ton chakra se change en vie',
 update(u,dt){if(SIMT<u.uz_rtE&&(u.stun>0||u.sleepT<0))u.uz_rtB=1;if(u.chk)u.energy=Math.min(100,u.energy+14*dt);if(u.hp<u.max*.3&&u.energy>.5){const c=Math.min(u.energy,2.5*dt);u.energy-=c;gain(u,c*2,u);u.uz_fv=.3}else if(u.uz_fv>0)u.uz_fv=Math.max(0,u.uz_fv-dt);
  // sceaux expirés ; pour les bots : Détonation seulement s'il y a des sceaux à faire exploser, relance du parchemin
  let best=0,late=0;for(const e of units){if(e.dead||e.team===u.team||!(e.uz_mk>0))continue;if(!(SIMT<e.uz_mkE)){e.uz_mk=0;continue}if(dist(u,e)<UZ_KAIR-30){best=Math.max(best,e.uz_mk);if(e.uz_mkE-SIMT<1.5)late=1}}
  const A=u.ch.abil,tg=u.tgt;for(let i=1;i<A.length;i++){const ab=A[i];if(!ab)continue;
   if(ab.key==='uz_kai')ab.ai=best>=2||(best>=1&&(late&&u.energy>45||tg&&!tg.dead&&tg.hp<tg.max*.25))?UZ_KAI_AI:null;
   else if(ab.key==='uz_store')ab.ai=u.jst&&u.jst.key==='uz_store'?(u.uz_st||SIMT>u.uz_scE?UZ_ST_AI:null):UZ_ST_DEF}},
 draw(u,p,S,sk){if(!(u.uz_fv>0))return;const t=performance.now()/1000;sk=sk||1;g.save();uzSpiral(p.x,p.y,24*S,t*4,K,'rgba(224,80,58,.75)',2.2);g.globalCompositeOperation='lighter';
  for(let i=0;i<4;i++){const h=(t*1.2+i*.25)%1,x=p.x+Math.sin(i*2.1+t*2)*12*S,y=p.y-(8+h*56)*S*sk;g.fillStyle=rgba(h<.5?'#ff7a5a':'#7fe07f',.7*(1-h));g.fillRect(x-1,y-4*S,2,8*S);g.fillRect(x-4*S,y-1,8*S,2)}g.restore()},
 hud(u,x,y){let n=0,m=0;for(const e of units)if(!e.dead&&e.team!==u.team&&e.uz_mk>0){n++;m=Math.max(m,e.uz_mk|0)}const on=u.uz_fv>0;g.save();uzSpiral(x+7,y-4,7,performance.now()/300,1,on?'#7fe07f':'#e8c860',1.8);text('Fûinjutsu',x+18,y,12,'#ffd36a','left');
  text(on?'vitalité : le chakra se change en vie':n?`${n} ennemi${n>1?'s':''} sous sceau (jusqu'à ${m}/3)`:'aucun sceau posé',x+84,y,11,on?'#cfffcf':'#d8c8a0','left','normal');g.restore()}};
// apparence : la spirale du clan dans le dos et le grand parchemin de fûinjutsu (sauf manteau Akatsuki ou objet déjà porté dans le dos)
CLOOK[6]=(o)=>{if(o.clouds)return;if(!o.disc)o.disc='#e0503a';if(!o.back&&!o.gourd)o.back='parchemin'};
// champs synchronisés pour les invités (sceaux posés, âme scellée, vitalité active)
AFTER.push(()=>UK.push('uz_mk','uz_soul','uz_fv'));

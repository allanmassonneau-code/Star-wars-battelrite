// ===== Clan Uzumaki =====
// Fûinjutsu (sceaux, chaînes de chakra), Rasengan, chakra du Kyûbi et clones : réserves de chakra immenses et vitalité hors norme
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c6',[
 [1,'D','x.uz_kunai','Kunai de stockage','Un parchemin se déroule et libère 3 kunai en éventail (les 3 touchent à bout portant)','kunai'],
 [1,'C','x.uz_chain','Chaînes de chakra','Chaîne-harpon : ramène l\'ennemi touché, l\'étourdit et lui scelle 12 de chakra','chain'],
 [1,'A','x.uz_cage','Chaînes adamantines','Des chaînes jaillissent sous la zone visée : entravent puis enferment 2,5 s (ni ennemi ni tir ne passe)','chain'],
 [1,'S','x.uz_rasengan','Rasengan','Fonce et broie le premier ennemi dans la sphère, puis le projette (étourdi s\'il heurte un obstacle)','rasengan'],
 [2,'B','x.uz_swap','Sceau d\'échange','Kunai-sceau : échange ta place avec l\'ennemi touché (ralenti), sinon te téléporte là où il se plante','chain'],
 [3,'B','x.uz_gogyo','Sceau des cinq éléments','Cinq flammes : la cible touchée perd 20 de chakra, ne peut plus lancer de jutsu ni recharger 2 s','chakra'],
 [3,'S','x.uz_clones','Multiclonage','3 clones surgissent et frappent l\'ennemi (3 coups chacun) ; un coup ou un tir les dissipe','smoke'],
 [4,'C','x.uz_vital','Vitalité Uzumaki','Se libère des entraves, puis 3 s : forte régénération (plus sous 40 % de PV) et −25 % de dégâts','heal'],
 [4,'C','x.uz_absorb','Sceau absorbant','1,5 s : un sceau devant soi avale les tirs ennemis (+chakra) puis relâche une onde, plus forte par tir','chakra'],
 [5,'A','x.uz_rasenshu','Rasen-shuriken','Lancé au point visé, il éclate en sphère de lames de vent qui happe, attire et broie les ennemis','rasenshuriken'],
 [5,'A','x.uz_kyubi','Chakra de Kyûbi','Rugissement qui repousse puis 6 s : inarrêtable, régénère, ses coups lancent des griffes de chakra','fox'],
]);
Object.assign(NAT,{
 uz_kunai:SP('Kunai de stockage','Un parchemin se déroule et libère 3 kunai en éventail (les 3 touchent à bout portant)',5,{line:{len:480,w:30},ai:RG(470,.7)},(u,a)=>{S('poof',u);S('blaster',u);anim(u,'uz_scroll',.45);
  jx({jfx:'uz_scroll',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.5,m:.5});if(near(u.x,u.y))sparks(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,'#ececf2',6,'smoke');for(const k of[-.11,0,.11])proj(u,a+k,{spd:860,r:6,dmg:5,life:.58,col:'#d8dde6',kind:'uz_kunai'})}),
 uz_chain:SP('Chaînes de chakra','Chaîne-harpon : ramène l\'ennemi touché, l\'étourdit et lui scelle 12 de chakra',8,{hero:'cadbane',line:{len:430,w:20},ai:RG(420,.5,100)},(u,a)=>{S('dash',u);anim(u,'uz_chain',.55);
  proj(u,a,{spd:980,r:10,dmg:5,life:.44,col:'#e8c860',hook:1,stun:.55,kind:'uz_chainp',onHit:(p,t)=>{const o=p.owner,d=Math.min(t.energy,12);t.energy-=d;S('heavy',o);
   jx({jfx:'uz_wrap',ti:units.indexOf(t),ui:units.indexOf(o),x:t.x,y:t.y,t:.8,m:.8});if(d>=1)say(t,'CHAKRA SCELLÉ','#e8c860')}})}),
 uz_cage:SP('Chaînes adamantines','Des chaînes jaillissent sous la zone visée : entravent puis enferment 2,5 s (ni ennemi ni tir ne passe)',15,{tele:{r:130,max:420},ai:RG(420,.55)},(u,a,td)=>{const p=atP(u,a,td,420);S('deflect',u);anim(u,'summon',.45);u.root=Math.max(u.root,.3);
  aux.push({type:'uz_cage',x:p.x,y:p.y,r:130,t:2.95,m:2.95,team:u.team,owner:u,vfx:'chain',k:0,sd:{}})}),
 uz_rasengan:SP('Rasengan','Fonce et broie le premier ennemi dans la sphère, puis le projette (étourdi s\'il heurte un obstacle)',12,{line:{len:300,w:44},ai:{mode:'gap',min:0,max:320,p:.7}},(u,a,td)=>{S('rasengan',u);anim(u,'uz_rasen',.75);
  dash(u,a,clamp((td||300)+40,140,300),.26,{});aux.push({type:'uz_rasen',x:u.x,y:u.y,r:0,t:.8,m:.8,team:u.team,owner:u,a,k:0,vfx:'rasengan'})}),
 uz_swap:SP('Sceau d\'échange','Kunai-sceau : échange ta place avec l\'ennemi touché (ralenti), sinon te téléporte là où il se plante',10,{hero:'dooku',ai:ESC},(u,a,td)=>{S('dash',u);anim(u,'point',.3);const L=clamp(td||300,120,380);
  proj(u,a,{spd:1150,r:9,dmg:4,life:L/1150,col:'#e8c860',kind:'uz_kunai',swap:1,onHit:(p,t)=>{const o=p.owner;if(t.unstop>0||t.dead)return;p.uzSw=1;t.slow=Math.max(t.slow,1);
   jx({jfx:'uz_swapfx',x:o.x,y:o.y,x2:t.x,y2:t.y,t:.5,m:.5});if(near(o.x,o.y)){sparks(o.x,o.y,'#ececf2',8,'smoke');sparks(t.x,t.y,'#ececf2',8,'smoke');S('poof',o)}}});
  aux.push({type:'uz_swapk',x:u.x,y:u.y,r:0,t:1,m:1,team:u.team,owner:u,p:projs[projs.length-1]})}),
 uz_gogyo:SP('Sceau des cinq éléments','Cinq flammes : la cible touchée perd 20 de chakra, ne peut plus lancer de jutsu ni recharger 2 s',11,{hero:'dooku',line:{len:340,w:20},ai:RG(330,.55)},(u,a)=>{S('genjutsu',u);anim(u,'seal',.45);
  proj(u,a,{spd:900,r:10,dmg:10,life:.38,col:'#a070ff',kind:'uz_gogyo',o:{silence:2},onHit:(p,t)=>{const o=p.owner,d=Math.min(t.energy,20);t.energy-=d;S('jyuken',o);say(t,'CHAKRA SCELLÉ','#c8a8ff');
   jx({jfx:'uz_g5',ti:units.indexOf(t),x:t.x,y:t.y,t:2,m:2});aux.push({type:'uz_seal5',x:t.x,y:t.y,r:0,t:2,m:2,team:o.team,owner:o,tg:t,ti:units.indexOf(t)})}})}),
 uz_clones:SP('Multiclonage','3 clones surgissent et frappent l\'ennemi (3 coups chacun) ; un coup ou un tir les dissipe',17,{hero:'gideon',ai:SELF(450,.6)},(u,a)=>{S('poof',u);anim(u,'uz_cross',.55);const ui=units.indexOf(u);
  for(let i=0;i<3;i++){const b=a+(i-1)*1.25,x=clamp(u.x+Math.cos(b)*58,B.x+20,B.x+B.w-20),y=clamp(u.y+Math.sin(b)*58,B.y+20,B.y+B.h-20);
   aux.push({type:'uz_clone',x,y,r:16,t:5,m:5,team:u.team,owner:u,ui,n:i,a,w:0,len:0,k:.3+i*.12,hits:0,vfx:'smoke'});sparks(x,y,'#ececf2',14,'smoke')}}),
 uz_vital:SP('Vitalité Uzumaki','Se libère des entraves, puis 3 s : forte régénération (plus sous 40 % de PV) et −25 % de dégâts',13,{hero:'bossk',ai:HEALM},(u)=>{const fr=u.root>0||u.slow>0||u.fear>0||u.disarm>0||u.dotT>0;cleanse(u);u.dotT=0;
  const lo=u.hp<u.max*.4;S('jyuken',u);anim(u,'uz_vital',.6);aux.push({type:'uz_vital',x:u.x,y:u.y,r:0,t:3,m:3,team:u.team,owner:u,k:0,v:lo?18:12});if(!(u.drT>0)||u.dr<.25)u.dr=.25;u.drT=Math.max(u.drT,3);
  jx({jfx:'uz_vital',ui:units.indexOf(u),x:u.x,y:u.y,t:3,m:3});ring(u.x,u.y,46,'#7fe07f');say(u,fr?'LIBÉRÉ !':'VITALITÉ','#7fe07f')}),
 uz_absorb:SP('Sceau absorbant','1,5 s : un sceau devant soi avale les tirs ennemis (+chakra) puis relâche une onde, plus forte par tir',11,{ai:DEF},(u,a)=>{S('jyuken',u);anim(u,'uz_absorb',1.5);const ui=units.indexOf(u);
  aux.push({type:'uz_absorb',x:u.x,y:u.y,r:58,t:1.5,m:1.5,team:u.team,owner:u,ui,a,n:0,k:0});jx({jfx:'uz_absorbS',ui,x:u.x,y:u.y,t:1.5,m:1.5})}),
 uz_rasenshu:ULT('Rasen-shuriken','Lancé au point visé, il éclate en sphère de lames de vent qui happe, attire et broie les ennemis',{hero:'thrawn',line:{len:520,w:40},ai:{max:520,p:.8}},(u,a,td)=>{S('rasengan',u);anim(u,'uz_rsthrow',.8);u.root=Math.max(u.root,.34);const L=clamp(td||520,160,520);
  later(u,.32,()=>{if(u.dead)return;S('wind',u);proj(u,u.aim,{spd:560,r:16,dmg:0,life:L/560,col:'#c8fff0',kind:'uz_rs',vfx:'rasenshuriken',big:1,noClash:1});aux.push({type:'uz_rsk',x:u.x,y:u.y,r:0,t:2,m:2,team:u.team,owner:u,p:projs[projs.length-1]});
   const ui=units.indexOf(u);for(const f of fx)if(f.jfx==='rasengan'&&f.big&&f.ui===ui)f.t=Math.min(f.t,.05)})}),
 uz_kyubi:ULT('Chakra de Kyûbi','Rugissement qui repousse puis 6 s : inarrêtable, régénère, ses coups lancent des griffes de chakra',{hero:'chewie',tele:{self:1,r:150},ai:SELF(200,.8)},(u)=>{S('heavy',u);anim(u,'roar',.8);
  u.unstop=Math.max(u.unstop,6);u.regenB=Math.max(u.regenB,6);u.uz_kyu=6;aoe(u,u.x,u.y,150,8,{kb:290,unblockable:1},'#ff6a2a');jx({jfx:'uz_kroar',ui:units.indexOf(u),x:u.x,y:u.y,t:.7,m:.7});if(near(u.x,u.y))shake=Math.max(shake,.35)}),
});
Object.assign(NATHERO,{uz:'savage'});
// ---- mécaniques (hôte)
// Rasengan : course ; au contact, la cible est tenue et broyée (3 petits coups) puis projetée ; sans contact, la sphère éclate au sol
AUXF.uz_rasen=(x,dt)=>{const u=x.owner;if(u.dead){x.t=0;return}
 if(!x.tg){x.x=u.x;x.y=u.y;
  for(const e of enemies(u))if(Math.hypot(e.x-u.x,e.y-u.y)<u.r+e.r+16){x.tg=e;x.ti=units.indexOf(e);x.t=x.m=.42;x.k=0;x.n=0;u.dash=null;u.root=Math.max(u.root,.42);
   jx({jfx:'uz_rgrind',ui:units.indexOf(u),ti:x.ti,x:e.x,y:e.y,a:x.a,t:.42,m:.42});if(near(u.x,u.y))shake=Math.max(shake,.15);return}
  if(!u.dash){x.t=0;const px=u.x+Math.cos(x.a)*26,py=u.y+Math.sin(x.a)*26;VFX='rasengan';aoe(u,px,py,75,12,{kb:220,quiet:1},'#7fc8ff');VFX=null;
   jx({jfx:'uz_rboom',x:px,y:py,r:75,t:.6,m:.6,small:1});S('boom',u);if(near(px,py))shake=Math.max(shake,.2)}
  return}
 const e=x.tg;if(e.dead||u.stun>0){x.t=0;x.done=1;return}
 if(e.unstop<=0){const d=u.r+e.r+4,px=u.x+Math.cos(x.a)*d,py=u.y+Math.sin(x.a)*d,f=Math.min(1,dt*14);e.x+=(px-e.x)*f;e.y+=(py-e.y)*f;e.kx=e.ky=0;e.dash=null;e.cast=null;e.stun=Math.max(e.stun,.12)}
 if(x.k<=0&&x.n<3){x.k=.12;x.n++;VFX='rasengan';hit(e,u,4,{unblockable:1});VFX=null;if(near(e.x,e.y))sparks(e.x,e.y,'#bfe6ff',6,'rasengan')}
 if(x.t<=0&&!x.done){x.done=1;VFX='rasengan';hit(e,u,20,{kb:650,air:.4,wall:.6,unblockable:1,fx:u.x,fy:u.y});VFX=null;jx({jfx:'uz_rboom',x:e.x,y:e.y,r:95,t:.75,m:.75});S('boom',u);if(near(e.x,e.y))shake=Math.max(shake,.35)}};
// Chaînes adamantines : 0,45 s d'alerte, jaillissement (entrave), puis barrière : les ennemis ne la franchissent pas, ni leurs tirs
AUXF.uz_cage=(x,dt)=>{const o=x.owner,el=(x.m-.45)-x.t;if(el<0)return;
 if(!x.on){x.on=1;VFX='chain';for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);x.sd[units.indexOf(e)]=d<x.r?1:0;if(d<x.r+e.r)hit(e,o,16,{root:.7,unblockable:1})}VFX=null;
  jx({jfx:'uz_cagef',x:x.x,y:x.y,r:x.r,t:x.t,m:x.t});ring(x.x,x.y,x.r,'#e8c860');if(near(x.x,x.y)){S('heavy',o);S('deflect',o);shake=Math.max(shake,.25);sparks(x.x,x.y,'#e8c860',16,'chain')}}
 x.lp=x.lp||{};for(const e of units){if(e.dead||e.team===x.team)continue;const i=units.indexOf(e),dx=e.x-x.x,dy=e.y-x.y,d=Math.hypot(dx,dy)||1,l=x.lp[i];let s=x.sd[i];if(s==null||(l&&!l.d&&!e.dash&&Math.hypot(e.x-l.x,e.y-l.y)>60))s=x.sd[i]=d<x.r?1:0;
  const m=s?x.r-e.r-3:x.r+e.r+3;if(s?d>m:d<m){e.x=x.x+dx/d*m;e.y=x.y+dy/d*m;e.kx*=.2;e.ky*=.2}x.lp[i]={x:e.x,y:e.y,d:!!e.dash}}
 for(const p of projs){if(p.dead||p.grenade||p.ret||!p.owner||p.owner.team===x.team)continue;const d=Math.hypot(p.x-x.x,p.y-x.y)-x.r,d0=Math.hypot(p.x-p.vx*dt-x.x,p.y-p.vy*dt-x.y)-x.r,d1=Math.hypot(p.x+p.vx*dt-x.x,p.y+p.vy*dt-x.y)-x.r;
  if(d0*d<=0||d*d1<=0){p.life=0;if(near(p.x,p.y))sparks(p.x,p.y,'#e8c860',6,'chain')}}};
// Sceau d'échange : si le kunai n'a échangé personne, le lanceur apparaît là où il s'est planté
AUXF.uz_swapk=x=>{const p=x.p,o=x.owner;if(!p||o.dead){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.t=0;if(p.uzSw)return;
 const x0=o.x,y0=o.y;o.x=clamp(p.x,B.x+o.r,B.x+B.w-o.r);o.y=clamp(p.y,B.y+o.r,B.y+B.h-o.r);o.dash=null;collide(o);
 jx({jfx:'uz_swapfx',x:x0,y:y0,x2:o.x,y2:o.y,t:.5,m:.5});if(near(x0,y0)){sparks(x0,y0,'#ececf2',12,'smoke');S('poof',o)}};
// Sceau des cinq éléments : la charge du chakra (R) ne rend plus rien pendant le sceau
AUXF.uz_seal5=(x,dt)=>{const e=x.tg;if(!e||e.dead){x.t=0;return}x.x=e.x;x.y=e.y;if(e.chk){e.energy=Math.max(0,e.energy-30*dt);e.chk=false}};
// clones : foncent sur l'ennemi le plus proche, 3 coups puis disparaissent ; un tir ennemi (arrêté) ou un coup au contact les dissipe
AUXF.uz_clone=(x,dt)=>{const o=x.owner;x.w=Math.max(0,(x.w||0)-dt);
 if(!o.dead&&x.t>0){let e=null,bd=560;for(const v of enemies(o)){const d=Math.hypot(v.x-x.x,v.y-x.y);if(d<bd&&!(v.stealth>0)){bd=d;e=v}}
  if(e){x.a=Math.atan2(e.y-x.y,e.x-x.x);const R0=e.r+x.r+6,ba=Math.atan2(o.y-e.y,o.x-e.x)+((x.n|0)-1)*1.3,gx=e.x+Math.cos(ba)*R0,gy=e.y+Math.sin(ba)*R0,gd=Math.hypot(gx-x.x,gy-x.y);
   if(gd>6){const sp=Math.min(gd,(x.w>0?60:300)*dt),m=Math.atan2(gy-x.y,gx-x.x);x.x=clamp(x.x+Math.cos(m)*sp,B.x+16,B.x+B.w-16);x.y=clamp(x.y+Math.sin(m)*sp,B.y+16,B.y+B.h-16)}
   if(bd<R0+12&&x.k<=0){x.k=.42;x.len=++x.hits;x.w=.18;VFX='tai';hit(e,o,x.hits<3?3:5,{kb:x.hits<3?40:170,fx:x.x,fy:x.y});VFX=null;if(x.hits>=3)x.t=Math.min(x.t,.2)}}
  for(const p of projs)if(!p.dead&&!p.grenade&&p.owner&&p.owner.team!==x.team&&Math.abs(p.x-x.x)<40&&Math.hypot(p.x-x.x,p.y-x.y)<x.r+p.r){p.life=0;x.t=0;break}
  if(x.t>0)for(const v of enemies(o))if(v.swing>.05&&Math.hypot(v.x-x.x,v.y-x.y)<100&&angDiff(Math.atan2(x.y-v.y,x.x-v.x),v.swingA)<1.1){x.t=0;break}}
 else x.t=0;
 if(x.t<=0&&!x.done){x.done=1;if(near(x.x,x.y)){sparks(x.x,x.y,'#ececf2',16,'smoke');S('poof',o)}}};
// Vitalité : soin progressif (4 fois par seconde)
AUXF.uz_vital=x=>{const o=x.owner;if(o.dead){x.t=0;return}x.x=o.x;x.y=o.y;if(x.k<=0){x.k=.25;gain(o,x.v*.25,o)}};
// Sceau absorbant : le sceau suit la visée ; chaque tir ennemi qui le touche disparaît (+8 chakra) ; à la fin, onde devant soi (+6 dégâts par tir, 3 max)
AUXF.uz_absorb=(x,dt)=>{const o=x.owner;if(o.dead){x.t=0;return}x.a=o.aim;const cx=o.x+Math.cos(x.a)*30,cy=o.y+Math.sin(x.a)*30;x.x=cx;x.y=cy;
 if(x.t>0)for(const p of projs){if(p.dead||p.grenade||!p.owner||p.owner.team===x.team)continue;if(Math.abs(p.x-cx)<x.r+30&&Math.hypot(p.x-cx,p.y-cy)<x.r+p.r){p.life=0;p.boom=1;p.dead=1;p.uzAbs=1;x.n++;o.energy=Math.min(100,o.energy+8);if(near(p.x,p.y)){sparks(p.x,p.y,'#e8c860',6,'chain');jx({jfx:'uz_suck',x:p.x,y:p.y,ui:x.ui,t:.3,m:.3});S('deflect',o)}}}
 if(x.t<=0&&!x.done){x.done=1;const n=Math.min(3,x.n),a=o.aim;VFX='chakra';for(const e of enemies(o))if(dist(o,e)<220+e.r&&angDiff(ang(o,e),a)<.6)hit(e,o,6+6*n,{kb:150+60*n,unblockable:1});VFX=null;
  jx({jfx:'uz_wave',x:o.x,y:o.y,a,n,t:.45,m:.45});S('wind',o);if(n)say(o,'×'+n,'#e8c860')}};
// Rasen-shuriken : à la fin de sa course (ennemi, obstacle ou portée max), il éclate en sphère
AUXF.uz_rsk=x=>{const p=x.p,o=x.owner;if(!p){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.t=0;if(p.uzAbs)return; // avalé par un sceau absorbant
 aux.push({type:'uz_rsd',x:p.x,y:p.y,r:88,t:.92,m:.92,team:x.team,owner:o,k:.12,vfx:'rasenshuriken'});jx({jfx:'uz_rsdome',x:p.x,y:p.y,r:88,t:.92,m:.92});if(near(p.x,p.y)){S('boom',o);shake=Math.max(shake,.4)}};
// sphère de lames : happe les ennemis (étourdis 0,25 s), puis les tire doucement vers le centre (on peut en sortir) ; 4 coups puis explosion qui repousse
AUXF.uz_rsd=(x,dt)=>{const o=x.owner,el=x.m-x.t,R=x.r*Math.min(1,el/.15+.3),catchT=el<.25;
 for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d>R+e.r||e.unstop>0)continue;const f=Math.min(1,dt*(catchT?2.5:.8));e.x+=(x.x-e.x)*f;e.y+=(x.y-e.y)*f;
  if(catchT){e.kx=e.ky=0;e.dash=null;e.cast=null;e.stun=Math.max(e.stun,.12)}}
 if(x.k<=0&&x.t>.08){x.k=.2;VFX='rasenshuriken';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<R+e.r)hit(e,o,4,{unblockable:1});VFX=null}
 if(x.t<=0&&!x.done){x.done=1;VFX='rasenshuriken';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)hit(e,o,10,{kb:300,unblockable:1,fx:x.x,fy:x.y});VFX=null;detoFx(x.x,x.y,x.r,'rasenshuriken');if(near(x.x,x.y))shake=Math.max(shake,.3)}};
AUXD.uz_rasen=AUXD.uz_swapk=AUXD.uz_seal5=AUXD.uz_vital=AUXD.uz_absorb=AUXD.uz_rsk=()=>{};
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
// clones : copie 3D du lanceur (un faux ninja par lanceur et par place, son modèle est réutilisé d'une fois à l'autre)
const UZF={};
AUXD.uz_clone=(x,k,t)=>{const o=x.ui!=null?units[x.ui]:null;if(!o||!o.ch)return;const key=x.ui+'_'+(x.n|0);let f=UZF[key];if(!f||f.ch!==o.ch){f=UZF[key]=mkUnit(o.c,x.x,x.y,o.team);f.ch=o.ch}
 const mv=Math.hypot(x.x-(f.uzX??x.x),x.y-(f.uzY??x.y))>.3;f.uzX=x.x;f.uzY=x.y;f.x=x.x;f.y=x.y;f.aim=x.a||0;f.moving=mv;if(mv)f.walk=t*13+(x.n|0)*2;f.swing=x.w||0;f.swingA=f.aim;f.cmbH=x.len||1;f.cmbT=x.len?1:0;
 const p=P(x.x,x.y,0),sk=o.ch.look.scale||1;g.fillStyle='rgba(0,0,0,.3)';gEll(x.x,x.y,14*sk);g.fill();g.strokeStyle=rgba(o.ch.look.weapon.col||'#33aaff',.55);g.lineWidth=1.5;gEll(x.x,x.y,19);g.stroke();
 drawChar3(f,p.x,p.y,p.s*1.3,.84*Math.min(1,k*1.5))};
AUXD.uz_rsd=(x,k,t)=>{g.fillStyle=rgba('#0a2030',.2*k);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#c8fff0',.55*k);g.lineWidth=2;g.setLineDash([14,8]);g.lineDashOffset=-t*140;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([])};
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
// Rasen-shuriken : quatre lames de vent qui tournent à plat autour d'un Rasengan
PROJD.uz_rs=(p,R,ra,t)=>{const s=R/16;g.save();g.scale(s,s*K);g.globalCompositeOperation='lighter';g.rotate(t/35);g.fillStyle='rgba(215,255,245,.5)';g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.6;
 for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(0,-5);g.quadraticCurveTo(26,-17,60,0);g.quadraticCurveTo(28,-3,0,5);g.closePath();g.fill();g.beginPath();g.moveTo(10,-8);g.quadraticCurveTo(30,-15,58,0);g.stroke()}
 g.strokeStyle='rgba(200,255,240,.55)';g.lineWidth=3;g.beginPath();g.arc(0,0,30,0,7);g.stroke();g.restore();g.globalCompositeOperation='lighter';g.scale(s,s);circ(0,-4,17,'rgba(110,180,255,.8)');circ(0,-4,10,'#ffffff');
 g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.3;g.beginPath();for(let i=0;i<3;i++){const b=i*2.1-t/25,r=12+i*2;g.moveTo(Math.cos(b)*r,Math.sin(b)*r-4);g.arc(0,-4,r,b,b+2.2)}g.stroke()};
// ---- effets de jutsu
// parchemin de stockage qui se déroule devant le lanceur
JFXD.uz_scroll=(f,k,e,t,u)=>{if(!u)return;const a=f.a,c=P(u.x+Math.cos(a)*26,u.y+Math.sin(a)*26,34),s=c.s,L=46*s*Math.min(1,e/.35),h=8*s;g.globalAlpha=Math.min(1,k*3);g.translate(c.x,c.y);g.rotate(Math.atan2(Math.cos(a)*K,-Math.sin(a)));
 g.fillStyle='#f0e0b0';g.fillRect(-L/2,-h/2,L,h);g.strokeStyle='#b89a60';g.lineWidth=1;g.strokeRect(-L/2,-h/2,L,h);g.fillStyle='#2a2a33';for(let i=-2;i<=2;i++)if(i&&Math.abs(i*8*s)<L/2-4*s)g.fillRect(i*8*s-1.2*s,-2.6*s,2.4*s,5.2*s);
 if(L>8*s)circ(0,0,2.8*s,'#c0302a');g.fillStyle='#6a4a2a';for(const sx of[-1,1])g.fillRect(sx*L/2-2*s,-h*.8,4*s,h*1.6)};
// Rasengan qui se forme dans la main pendant les mudras (big : des lames de vent poussent autour, pour le Rasen-shuriken)
JFXD.uz_rform=(f,k,e,t,u)=>{if(!u||u.dead||u.stun>0)return;const a=u.aim,q=P(u.x+Math.cos(a)*16,u.y+Math.sin(a)*16,30),s=q.s,R=(3+(f.big?11:9)*e)*s;g.globalCompositeOperation='lighter';
 g.strokeStyle='rgba(160,215,255,.7)';g.lineWidth=1.4;g.beginPath();for(let i=0;i<5;i++){const b=t*9+i*1.2566,r0=R*3.2*(1-e*.4)+6*s;g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.7);g.quadraticCurveTo(q.x+Math.cos(b+1)*r0*.6,q.y+Math.sin(b+1)*r0*.42,q.x+Math.cos(b+1.8)*R,q.y+Math.sin(b+1.8)*R*.8)}g.stroke();
 circ(q.x,q.y,R*1.7,'rgba(90,160,255,.22)');circ(q.x,q.y,R,'rgba(150,210,255,.7)');circ(q.x,q.y,R*.5,'#ffffff');g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.2;for(let i=0;i<3;i++){g.beginPath();g.ellipse(q.x,q.y,R*(.55+i*.18),R*(.3+i*.12),t*14+i*2,0,4.4);g.stroke()}
 if(f.big&&e>.45){const b=(e-.45)/.55;g.translate(q.x,q.y);g.scale(1,K);g.rotate(t*18);g.fillStyle=rgba('#dcfff4',.5*b);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(0,-R*.3);g.quadraticCurveTo(R*1.6*b,-R*.9*b,R*3.2*b,0);g.quadraticCurveTo(R*1.5*b,-R*.1,0,R*.3);g.closePath();g.fill()}}};
// tourbillon qui broie la cible contre la sphère
JFXD.uz_rgrind=(f,k,e,t,u,tg)=>{if(!u||!tg)return;const a=f.a,q=P((u.x+tg.x)/2+Math.cos(a)*6,(u.y+tg.y)/2+Math.sin(a)*6,30),s=q.s,R=(13+e*9)*s;circ(q.x,q.y,R*1.12,'rgba(30,100,230,.6)');g.globalCompositeOperation='lighter';
 circ(q.x,q.y,R*2,'rgba(80,150,255,.13)');circ(q.x,q.y,R*.9,'rgba(110,180,255,.42)');circ(q.x,q.y,R*.38,'rgba(255,255,255,.85)');g.strokeStyle='rgba(225,240,255,.85)';g.lineWidth=1.5;for(let i=0;i<4;i++){g.beginPath();g.ellipse(q.x,q.y,R*(.7+i*.22),R*(.45+i*.15),t*20+i*1.6,0,4.2);g.stroke()}
 uzSpiral(q.x,q.y,R*2.3,-t*16,.7,'rgba(190,230,255,.75)',2);const gq=P(tg.x,tg.y,0);g.strokeStyle='rgba(220,240,255,.5)';g.lineWidth=2;for(let i=0;i<3;i++){const r=(20+i*12+e*16)*gq.s;g.beginPath();g.ellipse(gq.x,gq.y,r,r*K,0,t*12+i*2,t*12+i*2+2.2);g.stroke()}};
// explosion du Rasengan : cratère, onde en spirale, éclats (small : sphère qui éclate au sol)
JFXD.uz_rboom=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,R=f.r*(.35+e*.9)*s;g.fillStyle=rgba('#1a2a3a',.35*k);g.beginPath();g.ellipse(q.x,q.y,f.r*.45*s,f.r*.45*s*K,0,0,7);g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#9fd8ff',.8*k);g.lineWidth=5*k+1;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();uzSpiral(q.x,q.y,R*.95,e*9,K,rgba('#ffffff',.7*k),2.2);
 if(e<.35){const c=P(f.x,f.y,30),w=1-e/.35;circ(c.x,c.y,(30+e*90)*s*(f.small?.6:1),rgba('#cfeaff',.5*w));circ(c.x,c.y,(12+e*30)*s,rgba('#ffffff',.9*w))}
 g.strokeStyle=rgba('#ffffff',.75*k);g.lineWidth=2;g.beginPath();for(let i=0;i<10;i++){const b=i*.628+f.x,r0=R*.4,r1=R*(1.05+.2*(i%2));g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*K-10*s);g.lineTo(q.x+Math.cos(b)*r1,q.y+Math.sin(b)*r1*K-24*s*k)}g.stroke()};
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
// vitalité : spirale Uzumaki au sol, rubans de vie qui montent, croix de soin
JFXD.uz_vital=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s;g.globalAlpha=Math.min(1,k*3,e*8);g.fillStyle='rgba(224,80,58,.13)';g.beginPath();g.ellipse(q.x,q.y,46*s,46*s*K,0,0,7);g.fill();uzSpiral(q.x,q.y,44*s,t*3,K,'rgba(240,96,70,.9)',3);g.strokeStyle='rgba(127,224,127,.6)';g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,47*s,47*s*K,0,0,7);g.stroke();
 g.globalCompositeOperation='lighter';for(let j=0;j<2;j++){g.strokeStyle=j?'rgba(127,224,127,.7)':'rgba(255,120,90,.6)';g.lineWidth=2.4*s;g.beginPath();for(let i=0;i<=14;i++){const h=i/14,b=t*5+h*7+j*Math.PI,x=q.x+Math.cos(b)*18*s,y=q.y-h*70*s+Math.sin(b)*6*s;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 for(let i=0;i<4;i++){const h=(t*1.3+i*.25)%1,x=q.x+Math.sin(i*2.3+t)*14*s,y=q.y-(10+h*70)*s;g.fillStyle=rgba('#cfffcf',.8*(1-h));g.fillRect(x-1,y-4,2,8);g.fillRect(x-4,y-1,8,2)}};
// sceau absorbant : disque dressé devant le lanceur, tourné vers la visée
JFXD.uz_absorbS=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=u.aim,c=P(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,34),s=c.s,R=31;g.globalAlpha=Math.min(1,e*6,k*5);g.translate(c.x,c.y);g.scale((.42+.58*Math.abs(Math.sin(a)))*s,s);g.globalCompositeOperation='lighter';
 g.fillStyle='rgba(232,200,96,.16)';g.beginPath();g.arc(0,0,R,0,7);g.fill();g.strokeStyle='#e8c860';g.lineWidth=2.2;g.stroke();g.lineWidth=1.2;g.beginPath();g.arc(0,0,R*.74,0,7);g.stroke();
 g.beginPath();for(let i=0;i<8;i++){const b=t*2+i*.785;g.moveTo(Math.cos(b)*R*.78,Math.sin(b)*R*.78);g.lineTo(Math.cos(b)*R*.97,Math.sin(b)*R*.97)}g.stroke();uzSpiral(0,0,R*.6,-t*6,1,'rgba(255,240,190,.9)',1.8)};
// tir avalé par le sceau : traînée dorée qui s'enroule vers son centre
JFXD.uz_suck=(f,k,e,t,u)=>{if(!u)return;const a=P(f.x,f.y,28),b=P(u.x+Math.cos(u.aim)*30,u.y+Math.sin(u.aim)*30,34),m=ezo(e);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe9a0',.9*k);g.lineWidth=3*a.s*k+1;g.lineCap='round';g.beginPath();g.moveTo(lerp(a.x,b.x,m*.7),lerp(a.y,b.y,m*.7));g.quadraticCurveTo((a.x+b.x)/2+(a.y-b.y)*.3,(a.y+b.y)/2-(a.x-b.x)*.3,b.x,b.y);g.stroke();circ(b.x,b.y,(6+10*k)*b.s,rgba('#fff3c0',.5*k))};
// onde relâchée par le sceau absorbant
JFXD.uz_wave=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s;g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const r=(40+e*190-i*26)*s;if(r<=0)continue;g.strokeStyle=rgba(i?'#ffe9a0':'#e8c860',(.8-i*.2)*k);g.lineWidth=(7-i*2)*s*(1+(f.n||0)*.3);g.beginPath();g.ellipse(q.x,q.y-20*s,r,r*K,0,f.a-.55,f.a+.55);g.stroke()}};
// sphère de lames de vent du Rasen-shuriken (translucide, par-dessus les ninjas pris dedans)
JFXD.uz_rsdome=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,gr=Math.min(1,e*7+.25),R=f.r*gr*s,cx=q.x,cy=q.y-f.r*.5*s*gr,ry=R*.9,a=Math.min(1,k*6);g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#c8fff0',.13*a);g.beginPath();g.ellipse(cx,cy,R,ry,0,0,7);g.fill();g.strokeStyle=rgba('#e8fffa',.6*a);g.lineWidth=2;g.stroke();
 g.strokeStyle=rgba('#ffffff',.55*a);g.lineWidth=1.3;g.beginPath();for(let i=0;i<22;i++){const r=R*(.25+((i*37)%70)/100),b=t*(6+i%5)+i*1.7,L=.5+((i*13)%10)/20;g.moveTo(cx+Math.cos(b)*r,cy+Math.sin(b)*r*.9);g.ellipse(cx,cy,r,r*.9,0,b,b+L)}g.stroke();
 g.save();g.translate(cx,cy);g.scale(1,.55);g.rotate(t*9);g.fillStyle=rgba('#e8fffa',.2*a);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(0,-R*.12);g.quadraticCurveTo(R*.6,-R*.42,R*1.18,0);g.quadraticCurveTo(R*.55,-R*.05,0,R*.12);g.closePath();g.fill()}g.restore();
 circ(cx,cy,22*s*gr,rgba('#7fc8ff',.35*a));circ(cx,cy,10*s*gr,rgba('#ffffff',.9*a));if(k<.18){const b=1-k/.18;g.strokeStyle=rgba('#ffffff',.8*(1-b));g.lineWidth=6;g.beginPath();g.ellipse(cx,cy,R*(1+b*.4),ry*(1+b*.4),0,0,7);g.stroke()}};
// rugissement du Kyûbi : ondes rouges et tête de renard de chakra
JFXD.uz_kroar=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s;g.globalCompositeOperation='lighter';for(let i=0;i<2;i++){const r=(40+e*170-i*30)*s;if(r<0)continue;g.strokeStyle=rgba(i?'#ffb04a':'#ff3a1a',.75*k);g.lineWidth=(8-i*3)*s;g.beginPath();g.ellipse(q.x,q.y,r,r*K,0,0,7);g.stroke()}
 const h=P(f.x,f.y,100+e*20),S=(1+e*.6)*h.s,a=Math.min(1,k*2.5)*.75;g.fillStyle=rgba('#ff4a1a',.45*a);g.strokeStyle=rgba('#ffb04a',.9*a);g.lineWidth=2;g.beginPath();g.moveTo(h.x-26*S,h.y);g.lineTo(h.x-23*S,h.y-14*S);g.lineTo(h.x-30*S,h.y-40*S);g.lineTo(h.x-9*S,h.y-21*S);g.quadraticCurveTo(h.x,h.y-24*S,h.x+9*S,h.y-21*S);g.lineTo(h.x+30*S,h.y-40*S);g.lineTo(h.x+23*S,h.y-14*S);g.lineTo(h.x+26*S,h.y);
 g.quadraticCurveTo(h.x+16*S,h.y+10*S,h.x+7*S,h.y+24*S);g.quadraticCurveTo(h.x,h.y+30*S,h.x-7*S,h.y+24*S);g.quadraticCurveTo(h.x-16*S,h.y+10*S,h.x-26*S,h.y);g.closePath();g.fill();g.stroke();
 g.fillStyle=rgba('#fff3c0',.95*a);for(const sx of[-1,1]){g.beginPath();g.moveTo(h.x+sx*5*S,h.y-5*S);g.lineTo(h.x+sx*19*S,h.y-12*S);g.lineTo(h.x+sx*14*S,h.y-2*S);g.closePath();g.fill()}circ(h.x,h.y+24*S,3*S,rgba('#fff3c0',.8*a))};
// griffes de chakra du Kyûbi sur la cible
JFXD.uz_claw=(f,k,e)=>{const q=P(f.x,f.y,34),s=q.s*1.4,m=Math.min(1,e*4);g.globalCompositeOperation='lighter';g.lineCap='round';circ(q.x,q.y-4*s,20*s*(1-k*.5),rgba('#ff4a1a',.25*k));for(let i=-1;i<=1;i++){g.strokeStyle=rgba(i?'#ff6a2a':'#ffd36a',.95*k);g.lineWidth=(i?3.5:5)*s*k+1;const ox=i*10*s;g.beginPath();g.moveTo(q.x+ox-20*s,q.y-24*s);g.quadraticCurveTo(q.x+ox+5*s,q.y-6*s,q.x+ox-20*s+34*s*m,q.y-24*s+44*s*m);g.stroke()}};
// ---- animations 3D
Object.assign(ANIM,{
 // la main gauche tient le parchemin, la droite balaie et libère les kunai
 uz_scroll:(P,e)=>{const k=Math.min(1,e/.25),s=ezo(Math.min(1,Math.max(0,(e-.2)/.4)));pz(P,'armL',-1.4*k,0,-.25*k);pz(P,'foreL',-.4);pz(P,'armR',-1.35*k,0,(.6-1.5*s)*k);pz(P,'foreR',-.2);pz(P,'chest',.1*k,(.3-.65*s)*k)},
 // lance la chaîne, puis tire d'un coup sec
 uz_chain:(P,e)=>{const th=e<.35,k=th?ezo(e/.35):1,y=th?0:ezo(Math.min(1,(e-.4)/.35));pz(P,'armR',-1.62*k+1.1*y,0,.05);pz(P,'foreR',-.1-1.3*y);pz(P,'armL',-.45,0,.45);pz(P,'chest',.25*k-.4*y,.35*k-.2*y);pz(P,'head',.1*y)},
 // élan du Rasengan : sphère tendue dans la main droite, la gauche la soutient
 uz_rasen:(P,e)=>{const k=ezo(Math.min(1,e/.22));pz(P,'armR',-1.58*k,0,.1);pz(P,'foreR',-.12);pz(P,'armL',-1.15*k,0,-.5*k);pz(P,'foreL',-1.2*k);pz(P,'chest',.55*k,-.2*k);pz(P,'head',-.3*k);P.root.z=11*k;P.root.y=-6*k;pz(P,'thighR',-1.15*k);pz(P,'shinR',.95*k);pz(P,'thighL',.75*k);pz(P,'shinL',.55*k)},
 // tient le Rasen-shuriken bras tendu, puis le lance par-dessus l'épaule
 uz_rsthrow:(P,e)=>{if(e<.4){const k=ezo(e/.4);pz(P,'armR',-1.55*k,0,-.35*k);pz(P,'foreR',-.15);pz(P,'armL',-.5*k,0,.55*k);pz(P,'chest',-.1*k,.35*k);pz(P,'head',-.1*k)}
  else{const k=ezo(Math.min(1,(e-.4)/.22));pz(P,'armR',-1.55-1.3*Math.sin(Math.PI*k)+.5*k,0,-.35+.4*k);pz(P,'foreR',-.15);pz(P,'armL',-.5+.9*k,0,.55);pz(P,'chest',-.1+.6*k,.35-.7*k);P.root.z=8*k;pz(P,'thighR',-.7*k);pz(P,'shinR',.6*k)}},
 // signe du clonage (mains en croix), puis les bras s'ouvrent quand les clones surgissent
 uz_cross:(P,e)=>{const k=Math.min(1,e/.18),o=ezo(Math.max(0,(e-.5)/.5));pz(P,'armL',-1.3*k+.75*o,0,-.6*k+1.4*o);pz(P,'foreL',-1.45*k+1.3*o);pz(P,'armR',-1.38*k+.8*o,0,.55*k-1.4*o);pz(P,'foreR',-1.3*k+1.2*o);pz(P,'head',.18*k-.3*o);P.root.y=-1.5*k+2.5*o},
 // poings serrés aux hanches, torse bombé : la vitalité afflue
 uz_vital:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.25));pz(P,'armL',.3*k,0,.4*k);pz(P,'foreL',-1.7*k);pz(P,'armR',.3*k,0,-.4*k);pz(P,'foreR',-1.7*k);pz(P,'chest',-.32*k);pz(P,'head',-.4*k);P.root.y=-2*k+Math.sin(t*45)*.35*k},
 // paume gauche tendue (le sceau), la droite tient le poignet ; les jambes restent libres
 uz_absorb:(P,e)=>{const k=Math.min(1,e/.12);pz(P,'armL',-1.58*k,0,-.08);pz(P,'foreL',-.05);pz(P,'armR',-1.2*k,0,.4*k);pz(P,'foreR',-1.15*k);pz(P,'chest',.12*k,-.25*k)},
});
// ---- trait de clan : Force vitale (réserves de chakra immenses ; sous 30 % de PV, le chakra se change en vie)
TRAITS[6]={nom:'Force vitale',desc:'80 de chakra au départ et recharge (R) 40 % plus rapide ; sous 30 % de PV, son chakra se change en vie',
 init(u){u.energy=Math.max(u.energy,80)},
 update(u,dt){if(u.chk)u.energy=Math.min(100,u.energy+12*dt);
  if(u.hp<u.max*.3&&u.energy>.5){const c=Math.min(u.energy,2.5*dt);u.energy-=c;gain(u,c*2,u);u.uz_fv=.3}else if(u.uz_fv>0)u.uz_fv=Math.max(0,u.uz_fv-dt);
  if(u.uz_kyu>0)u.uz_kyu=Math.max(0,u.uz_kyu-dt);
  if(u.uz_clQ){const q=u.uz_clQ,V=VFX;u.uz_clQ=null;VFX='fox';aoe(u,q.x,q.y,70,7,{quiet:1},'#ff6a2a');VFX=V;jx({jfx:'uz_claw',x:q.x,y:q.y,t:.45,m:.45})}
  // Rasengan / Rasen-shuriken : la sphère se forme dans la main pendant les mudras
  if(u.cast){if(!u.uz_rf){const ab=u.ch.abil[u.cast.i];if(ab&&(ab.key==='uz_rasengan'||ab.key==='uz_rasenshu')){u.uz_rf=1;jx({jfx:'uz_rform',ui:units.indexOf(u),x:u.x,y:u.y,t:u.cast.dur,m:u.cast.dur,big:ab.key==='uz_rasenshu'?1:0})}}}else u.uz_rf=0},
 // Chakra de Kyûbi : une attaque de base qui touche libère une griffe de chakra autour de la cible (au plus une fois par seconde)
 deal(src,t,dmg,o){if(src.uz_kyu>0&&o.basic&&!(SIMT<(src.uz_clT||0))){src.uz_clT=SIMT+1;src.uz_clQ={x:t.x,y:t.y}}return dmg},
 draw(u,p,S,sk){const t=performance.now()/1000;
  if(u.uz_fv>0){g.save();uzSpiral(p.x,p.y,24*S,t*4,K,'rgba(224,80,58,.75)',2.2);g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const h=(t*1.2+i*.25)%1,x=p.x+Math.sin(i*2.1+t*2)*12*S,y=p.y-(8+h*56)*S*sk;g.fillStyle=rgba(h<.5?'#ff7a5a':'#7fe07f',.7*(1-h));g.fillRect(x-1,y-4*S,2,8*S);g.fillRect(x-4*S,y-1,8*S,2)}g.restore()}
  if(u.uz_kyu>0){const a=Math.min(1,u.uz_kyu*2),cy=p.y-40*S*sk;g.save();g.globalCompositeOperation='lighter';
   for(let i=0;i<9;i++){const b=i*.7+t*2.2,x=p.x+Math.cos(b)*17*S,y=cy+Math.sin(b)*30*S*sk,hh=(9+Math.sin(t*12+i*2)*4)*S;g.fillStyle=i%2?rgba('#ff6a2a',.4*a):rgba('#ff2a1a',.35*a);g.beginPath();g.moveTo(x-5*S,y);g.quadraticCurveTo(x,y-hh*2.2,x+5*S,y);g.fill()}
   const hy=p.y-72*S*sk;g.fillStyle=rgba('#ff5a1a',.8*a);for(const sx of[-1,1]){g.beginPath();g.moveTo(p.x+sx*4*S,hy);g.lineTo(p.x+sx*15*S,hy-17*S);g.lineTo(p.x+sx*16*S,hy+2*S);g.closePath();g.fill()}g.fillStyle=rgba('#ffd36a',.6*a);for(const sx of[-1,1]){g.beginPath();g.moveTo(p.x+sx*8*S,hy-1*S);g.lineTo(p.x+sx*14*S,hy-11*S);g.lineTo(p.x+sx*14*S,hy);g.closePath();g.fill()}g.restore()}},
 hud(u,x,y){const on=u.uz_fv>0,lo=u.hp<u.max*.3;g.save();uzSpiral(x+7,y-4,7,performance.now()/300,1,on?'#7fe07f':'#e0503a',1.8);text('Force vitale',x+18,y,12,on?'#9fffa0':'#ffb08a','left');
  text(on?'le chakra se change en vie':lo?'plus de chakra !':'charge du chakra +40 %',x+96,y,11,on?'#cfffcf':lo?'#ff8a7a':'#c8a890','left','normal');g.restore()}};
// champs synchronisés pour les invités (manteau du Kyûbi, Force vitale active)
AFTER.push(()=>UK.push('uz_kyu','uz_fv'));
// ---- équilibre (contournement en attendant le moteur, voir les demandes au moteur) : CLANBAL['6'] = PV ×1,12 et puissance ×1,14 date de l'ancien kit.
// Duels simulés : même avec des jutsu Uzumaki sans aucun effet, un Uzumaki gagnait encore 63 % (style Taijutsu de repli : ~300 PV, puissance ×1,42).
// Tant que le moteur garde cette ancienne valeur, on la remplace ici et on refait les ninjas déjà créés ; dès que le moteur la change, ce bloc ne fait plus rien.
const UZBAL=[1,.87]; // multiplicateurs proposés (PV, puissance) pour le clan Uzumaki
AFTER.push(()=>{const c=CLANBAL['6'];if(!c||c[0]!==1.12||c[1]!==1.14)return;c[0]=UZBAL[0];c[1]=UZBAL[1];
 for(const k in CH){const n=CH[k];if(n&&n.clan===6&&n.build)CH[k]=mkNinja(n.build,k!=='p0')}});

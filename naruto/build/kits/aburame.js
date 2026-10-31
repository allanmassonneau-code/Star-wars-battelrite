// ===== Clan Aburame =====
// Identité : les kikaichû, insectes qui vivent dans le corps de l'Aburame et se nourrissent de chakra.
// Trait « Colonie » : chaque coup qui touche dépose un insecte sur l'ennemi (max 5) ; la colonie ronge son chakra au profit de l'Aburame,
// surtout quand il le malaxe (mudras, recharge) : les kikaichû se nourrissent du chakra qu'on concentre.
// Les jutsu jouent avec les colonies : les espions infestent, les chercheurs traquent les infestés, les dévoreurs et la sphère s'en nourrissent.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c4',[
 [1,'D','x.ab_spy','Insectes espions','Insecte femelle rapide : infeste la cible (+2 insectes) et la piste 5 s (révélée, traquée)','bugs'],
 [1,'B','x.ab_seek','Insectes chercheurs','Nuée qui file droit, puis traque l\'ennemi infesté le plus proche : dégâts et +2 insectes','bugs'],
 [2,'B','x.ab_clone','Clone d\'insectes','Bond qui laisse un clone d\'insectes : il éclate au contact (ralentit). Relance : reprends sa place','bugs'],
 [3,'A','x.ab_swarm','Essaim d\'insectes','Grande nuée qui suit ton curseur 3,5 s : ronge, ralentit et infeste. Le feu la brûle','bugs'],
 [4,'C','x.ab_wall','Mur d\'insectes','Rideau d\'insectes 3,5 s : dévore les projectiles (+chakra), ralentit et infeste qui le traverse','bugs'],
 [4,'B','x.ab_drain','Insectes dévoreurs','Nuée accrochée à l\'ennemi touché 3 s : vole chakra et PV (plus s\'il est infesté), à portée','bugs'],
 [1,'C','x.ab_venom','Nano-insectes de Torune','8 s : tes attaques de base injectent un venin cumulable (×3) ; à 3 doses, la cible ralentit','bugs'],
 [5,'S','x.ab_nuee','Nuée destructrice','Nuée colossale sur la zone : immobilise et réduit au silence 0,8 s, puis ronge PV et chakra 3 s','bugs'],
 [5,'S','x.ab_sphere','Sphère d\'insectes','Enferme le 1er ennemi touché dans une sphère d\'insectes : dévore PV et chakra, dure plus s\'il est infesté','bugs'],
]);
// ---- colonies de kikaichû (trait du clan)
const AB_MAX=5,AB_DR=.12; // insectes max par cible ; chakra rongé par insecte et par seconde (×3 quand la cible malaxe son chakra)
// dépose n insectes sur e ; la colonie appartient au dernier Aburame qui l'a nourrie
function ab_add(e,u,n=1){if(!e||e.dead||!u||e.team===u.team)return;const c=e.ab_col||0;e.ab_col=Math.min(AB_MAX,c+n);e.ab_colT=6;e.ab_src=u;
 if(e.ab_col>c&&near(e.x,e.y))jx({jfx:'ab_infest',ti:units.indexOf(e),x:e.x,y:e.y,n:e.ab_col-c,t:.45,m:.45})}
const ab_n=e=>e&&!e.dead?e.ab_col||0:0;
// point visé par le lanceur (souris, entrée réseau, sinon sa cible), à moins de R du lanceur
function ab_want(u,R){let x=null,y=null;if(u.ctrl==='local'){const m=unP(mouse.x,mouse.y);x=m.x;y=m.y}else if(u.ctrl==='remote'){const Q=peerOf(u.rid);if(Q&&Q.in){x=+Q.in.ax;y=+Q.in.ay}}
 if(x==null||isNaN(x)){const e=u.tgt&&!u.tgt.dead?u.tgt:nearE(u,u.x,u.y,900);if(e){x=e.x;y=e.y}else{x=u.x+Math.cos(u.aim)*200;y=u.y+Math.sin(u.aim)*200}}
 const d=Math.hypot(x-u.x,y-u.y);if(d>R){x=u.x+(x-u.x)/d*R;y=u.y+(y-u.y)/d*R}return{x,y}}
// les insectes craignent le feu : un projectile de feu ennemi qui touche l'objet le brûle (une fois par projectile)
function ab_fire(x,R){for(const p of projs)if(!p.abB&&p.owner.team!==x.team&&ELM[p.vfx]===0&&!p.dead&&Math.hypot(p.x-x.x,p.y-x.y)<R+p.r){p.abB=1;if(near(x.x,x.y)){sparks(p.x,p.y,'#ff9a3a',10,'fire');jx({jfx:'pillar',x:p.x,y:p.y,r:50,t:.5,m:.5,v:'fire'});say(x.owner,'INSECTES BRÛLÉS','#ff9a3a')}return 1}return 0}
// éclatement d'une nuée (impact, clone)
const ab_burst=(x,y,r,big)=>{if(near(x,y))jx({jfx:'ab_burst',x,y,r,t:big?.7:.5,m:big?.7:.5})};
TRAITS[4]={nom:'Colonie de kikaichû',desc:'Chaque coup qui touche dépose un insecte sur l\'ennemi (max 5). La colonie ronge son chakra, qui revient à l\'Aburame, et dévore bien plus pendant ses mudras et sa recharge. Frapper un Aburame au corps à corps infeste aussi l\'attaquant.',
 init(u){u.ab_eat=0},
 update(u,dt){u.ab_tk=(u.ab_tk||0)-dt;const tick=u.ab_tk<=0;if(tick)u.ab_tk=.45;if(u.ab_ven>0){u.ab_ven=Math.max(0,u.ab_ven-dt);for(const p of projs)if(p.owner===u&&p.basic&&!p.abV){p.abV=1;p.kind='ab_venp'}}
  for(const e of units){if(e.ab_spyT>0&&(e.ab_spyS===u||!e.ab_spyS||e.ab_spyS.dead)){e.ab_spyT=Math.max(0,e.ab_spyT-dt);e.stealth=0}
   if(e.ab_vd&&SIMT-(e.ab_vdT||0)>4)e.ab_vd=0;
   if(!(e.ab_col>0))continue;const s=e.ab_src;if(s!==u&&s&&!s.dead)continue;
   if(e.dead){e.ab_col=0;continue}
   if(e.ab_spyT>0)e.ab_colT=Math.max(e.ab_colT,.5);e.ab_colT-=dt;if(e.ab_colT<=0){e.ab_col--;e.ab_colT=1.2;continue}
   if(s!==u)continue; // colonie orpheline : elle s'éteint sans nourrir personne
   const mold=e.cast||e.chk,d=Math.min(e.energy,AB_DR*(mold?3:1)*e.ab_col*dt);if(d>0){e.energy-=d;u.energy=Math.min(100,u.energy+d);u.ab_eat=(u.ab_eat||0)+d;
    if((tick||mold&&rnd()<dt*8)&&near(e.x,e.y)){const a=Math.atan2(u.y-e.y,u.x-e.x),sp=Math.min(420,Math.hypot(u.x-e.x,u.y-e.y)*1.6);fx.push({x:e.x,y:e.y,z:42,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,t:.6,m:.6,col:'#7fd0ff',r:2.4})}}}},
 deal(src,t,dmg,o){if(!o.silent&&t.team!==src.team&&SIMT-(t.ab_last||-9)>.35){t.ab_last=SIMT;ab_add(t,src,1)}
  // nano-insectes de Torune : les attaques de base injectent un venin cumulable
  if(src.ab_ven>0&&o.basic&&!o.silent){const v=t.ab_vd=Math.min(3,(SIMT-(t.ab_vdT||-9)<4?t.ab_vd||0:0)+1);t.ab_vdT=SIMT;t.dot=4.2*v;t.dotT=3;t.dotSrc=src;t.dotEl=-1;
   if(v>=3&&t.unstop<=0)t.slow=Math.max(t.slow,1);if(near(t.x,t.y))jx({jfx:'ab_vhit',x:t.x,y:t.y,n:v,t:.4,m:.4})}
  return dmg},
 take(t,src,dmg,o){if(o.melee&&src&&src!==t&&src.team!==t.team&&!o.silent&&SIMT-(src.ab_last||-9)>.35){src.ab_last=SIMT;ab_add(src,t,1)}return dmg},
 // sur l'Aburame : quelques insectes bourdonnent autour de lui
 draw(u,p,S,sk){const t=performance.now()/1000,H=S*sk;g.fillStyle='#141815';g.beginPath();for(let i=0;i<6;i++){const a=t*(1.3+i*.17)+i*1.05,r=(15+(i%3)*4)*S,x=p.x+Math.cos(a)*r,y=p.y-(20+i*6+Math.sin(t*3+i)*4)*H+Math.sin(a)*r*.3;g.rect(x-1.3*S,y-1*S,2.6*S,2*S)}g.fill();
  if(u.ab_ven>0){g.save();g.strokeStyle='rgba(150,80,210,.85)';g.lineWidth=2.5;g.setLineDash([7,5]);g.lineDashOffset=-t*30;g.beginPath();g.ellipse(p.x,p.y,24*S/1.3,24*S/1.3*K,0,0,7);g.stroke();g.setLineDash([]);g.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const a=t*4+i*.79,h=(14+((t*30+i*9)%34))*H,x=p.x+Math.cos(a)*(11+i%2*4)*S,y=p.y-h;g.fillStyle=i%2?'rgba(200,140,255,.75)':'rgba(140,80,220,.7)';g.fillRect(x-1.2*S,y-1.2*S,2.4*S,2.4*S)}g.restore()}},
 // jauge à droite de la barre de vie : la plus grosse colonie ennemie et le chakra rongé
 hud(u,x,y){const X=x+368,Y=42;let bn=0;for(const e of units)if(e.team!==u.team&&!e.dead&&(e.ab_col||0)>bn)bn=e.ab_col;
  text('KIKAICHÛ',X,Y-4,10,bn?'#c8e07a':'#8a967a','left');
  for(let i=0;i<AB_MAX;i++){const cx=X+6+i*14,cy=Y+6,on=i<bn;g.fillStyle=on?'#1a201b':'rgba(255,255,255,.1)';g.strokeStyle=on?'#c8e07a':'rgba(255,255,255,.2)';g.lineWidth=1;
   g.beginPath();g.ellipse(cx,cy+1,3.6,4.6,0,0,7);g.fill();g.stroke();g.beginPath();g.arc(cx,cy-4.4,2,0,7);g.fill();if(on){g.beginPath();g.moveTo(cx-6,cy-1);g.lineTo(cx+6,cy-1);g.moveTo(cx-6,cy+3);g.lineTo(cx+6,cy+3);g.stroke()}}
  text(Math.round(u.ab_eat||0)+' chakra rongé',X+72,Y+10,10,'#7fd0ff','left','normal')}};
// ---- mécaniques
Object.assign(NAT,{
 // Insectes espions (Rinkaichû) : un insecte femelle, rapide et précis ; il infeste la cible et la piste (les mâles la retrouvent partout)
 ab_spy:S_('Insectes espions','Insecte femelle rapide : infeste la cible (+2 insectes) et la piste 5 s (révélée, traquée)',7,{ai:RG(470,.6),line:{len:490,w:16}},(u,a)=>{S('bugs',u);anim(u,'ab_flick',.5);
  jx({jfx:'ab_glint',ui:units.indexOf(u),x:u.x,y:u.y,t:.4,m:.4});
  proj(u,a,{spd:900,r:7,dmg:4,life:.54,col:'#b8d870',kind:'ab_spy',o:{reveal:1},onHit:(p,t)=>{ab_add(t,p.owner,1);t.ab_spyT=5;t.ab_spyS=p.owner;t.stealth=0;say(t,'PISTÉ','#c8e07a');jx({jfx:'ab_mark',ti:units.indexOf(t),x:t.x,y:t.y,t:.7,m:.7})}})}),
 // Insectes chercheurs : la nuée file droit, puis flaire les colonies et traque l'infesté le plus proche (de plus loin s'il est pisté)
 ab_seek:S_('Insectes chercheurs','Nuée qui file droit, puis traque l\'ennemi infesté le plus proche : dégâts et +2 insectes',8,{hero:'lando',ai:RG(560,.65),line:{len:600,w:28}},(u,a)=>{S('bugs',u);anim(u,'ab_sleeve',.55);
  jx({jfx:'ab_pour',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.45,m:.45});
  proj(u,a,{spd:470,r:12,dmg:20,life:1.6,col:'#4a5a3a',kind:'ab_seek',onHit:(p,t)=>{ab_add(t,p.owner,1);ab_burst(t.x,t.y,50)}});
  aux.push({type:'ab_seek',x:u.x,y:u.y,r:0,t:1.7,m:1.7,team:u.team,owner:u,p:projs[projs.length-1],k:0})}),
 // Clone d'insectes (Mushi Bunshin) : bond, un clone d'insectes reste en place ; relance : on reprend sa place et il éclate là où on était
 ab_clone:S_('Clone d\'insectes','Bond qui laisse un clone d\'insectes : il éclate au contact (ralentit). Relance : reprends sa place',10,{hero:'lando',ai:ESC},(u,a,td)=>{const i=u.ch.abil.findIndex(x=>x&&x.key==='ab_clone');if(i<0)return;const ab=u.ch.abil[i];
  const cl=aux.find(x=>x.type==='ab_clone'&&x.owner===u&&x.t>0&&!x.gone);
  if(cl&&u.jst&&u.jst.key==='ab_clone'){
   // un bot ne revient que si l'échange l'éloigne de sa cible
   if(!u.ctrl){const e=u.tgt&&!u.tgt.dead?u.tgt:nearE(u,u.x,u.y,900);if(e&&dist(e,cl)<dist(e,u)+60){u.cds[i]=.3;return}}
   const ox=u.x,oy=u.y;jx({jfx:'ab_stream',x:ox,y:oy,x2:cl.x,y2:cl.y,t:.35,m:.35});u.x=cl.x;u.y=cl.y;u.kx=u.ky=0;u.dash=null;collide(u);cl.x=ox;cl.y=oy;
   u.phase=Math.max(u.phase||0,.15);anim(u,'ab_dissolve',.35);S('poof',u);u.jst=null;u.cds[i]=Math.max(.5,ab.cd-(cl.m-cl.t));ab_cloneBurst(cl);return}
  if(u.jst&&u.jst.key!=='ab_clone'){u.cds[u.jst.i]=u.jst.cd;u.jst=null}
  S('bugs',u);S('dash',u);anim(u,'ab_dissolve',.4);
  aux.push({type:'ab_clone',x:u.x,y:u.y,r:24,t:2.5,m:2.5,team:u.team,owner:u,ui:units.indexOf(u),a:u.aim,k:0,vfx:'bugs',n:0});
  const d=clamp(td||230,140,240),e=fwd(u,a,d);jx({jfx:'ab_stream',x:u.x,y:u.y,x2:e.x,y2:e.y,t:.35,m:.35});dash(u,a,d,.2,{});u.phase=Math.max(u.phase||0,.22);
  if(u.jst&&u.jst.key!=='ab_clone')u.cds[u.jst.i]=u.jst.cd;u.jst={key:'ab_clone',i,n:0,t:2.5,cd:Math.max(.5,ab.cd-2.5),v:'bugs'};u.cds[i]=.35}),
 // Mur d'insectes (Kikai Heki) : rideau d'insectes devant soi ; il dévore les projectiles ennemis et infeste ceux qui le traversent
 ab_wall:S_('Mur d\'insectes','Rideau d\'insectes 3,5 s : dévore les projectiles (+chakra), ralentit et infeste qui le traverse',10,{ai:DEF},(u,a)=>{S('bugs',u);anim(u,'ab_wall',.6);const c=fwd(u,a,80);
  aux.push({type:'ab_wall',x:c.x,y:c.y,a,len:210,w:30,r:110,t:3.5,m:3.5,team:u.team,owner:u,k:0,vfx:'bugs',n:0,hs:{}});sparks(c.x,c.y,'#26302a',14,'bugs')}),
 // Insectes dévoreurs : la nuée s'accroche à l'ennemi touché et pompe son chakra et sa vie, d'autant plus vite qu'il est infesté
 ab_drain:S_('Insectes dévoreurs','Nuée accrochée à l\'ennemi touché 3 s : vole chakra et PV (plus s\'il est infesté), à portée',13,{ai:RG(380,.6),line:{len:400,w:20}},(u,a)=>{S('bugs',u);anim(u,'ab_drain',1);
  jx({jfx:'ab_pour',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.35,m:.35});
  proj(u,a,{spd:880,r:10,dmg:6,life:.46,col:'#4a5a3a',kind:'ab_latch',onHit:(p,t)=>{if(t.dead)return;const o=p.owner;for(const x of aux)if(x.type==='ab_drain'&&x.owner===o)x.t=0;
   aux.push({type:'ab_drain',x:t.x,y:t.y,r:0,t:3,m:3,team:o.team,owner:o,tg:t,ui:units.indexOf(o),ti:units.indexOf(t),k:.5,vfx:'bugs',n:0});say(t,'DÉVORÉ','#c8e07a')}})}),
 // Essaim d'insectes : grande nuée qui suit le curseur ; elle ronge, ralentit et infeste ; le feu la brûle
 ab_swarm:S_('Essaim d\'insectes','Grande nuée qui suit ton curseur 3,5 s : ronge, ralentit et infeste. Le feu la brûle',12,{hero:'boba',ai:RG(480,.6),tele:{r:80,max:500}},(u,a,td)=>{S('bugs',u);S('wind',u);anim(u,'ab_swarm',.7);const p=fwd(u,a,55);
  aux.push({type:'ab_swarm',x:p.x,y:p.y,a,r:88,t:3.5,m:3.5,team:u.team,owner:u,ui:units.indexOf(u),k:.15,vfx:'bugs',n:0,acc:0,hs:{}});jx({jfx:'ab_pour',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.5,m:.5,big:1})}),
 // Nano-insectes de Torune : venin cumulable sur les attaques de base
 ab_venom:S_('Nano-insectes de Torune','8 s : tes attaques de base injectent un venin cumulable (×3) ; à 3 doses, la cible ralentit',12,{ai:SELF(330,.55)},(u)=>{u.ab_ven=8;S('bugs',u);anim(u,'ab_venom',.6);
  jx({jfx:'ab_venup',ui:units.indexOf(u),x:u.x,y:u.y,t:.8,m:.8});say(u,'NANO-INSECTES','#c8a0ff')}),
 // Nuée destructrice : une nuée colossale s'abat sur la zone, engloutit les ennemis, puis ravage en dérivant vers les plus infestés
 ab_nuee:ULT('Nuée destructrice','Nuée colossale sur la zone : immobilise et réduit au silence 0,8 s, puis ronge PV et chakra 3 s',{hero:'deathtrooper',tele:{r:150,max:480},ai:{max:480,p:.8}},(u,a,td)=>{const p=atP(u,a,td,480);S('bugs',u);S('heavy',u);anim(u,'ab_nuee',.9);
  zone(u,p.x,p.y,150,20,.75,{root:.8,silence:.8},'#26302a');lastZ().deto='ab_fall';jx({jfx:'ab_fall',x:p.x,y:p.y,r:150,t:.75,m:.75});
  later(u,.76,()=>{for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<150+e.r){ab_add(e,u,1);jx({jfx:'ab_engulf',ti:units.indexOf(e),x:e.x,y:e.y,t:1,m:1})}
   aux.push({type:'ab_nuee',x:p.x,y:p.y,r:125,t:3,m:3,team:u.team,owner:u,ui:units.indexOf(u),k:.2,vfx:'bugs',n:0})},{x:p.x,y:p.y})}),
 // Sphère d'insectes (Mushi Dama) : le premier ennemi touché est enfermé dans une sphère qui le dévore ; elle tient plus longtemps sur une cible infestée
 ab_sphere:ULT('Sphère d\'insectes','Enferme le 1er ennemi touché dans une sphère d\'insectes : dévore PV et chakra, dure plus s\'il est infesté',{line:{len:560,w:30},ai:{max:520,p:.8}},(u,a)=>{S('bugs',u);S('wind',u);anim(u,'ab_sphere',.7);
  jx({jfx:'ab_pour',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.45,m:.45,big:1});
  proj(u,a,{spd:640,r:15,dmg:10,life:.88,col:'#26302a',kind:'ab_ball',noClash:1,onHit:(p,t)=>{const o=p.owner;if(t.dead)return;const c=ab_n(t),D=1+.16*c;
   if(t.unstop>0){hit(t,o,10,{silent:1});ab_add(t,o,2);ab_burst(t.x,t.y,60);return}
   say(t,'SPHÈRE D\'INSECTES','#c8e07a');aux.push({type:'ab_sphere',x:t.x,y:t.y,r:36,t:D,m:D,team:o.team,owner:o,tg:t,ui:units.indexOf(o),ti:units.indexOf(t),k:.25,vfx:'bugs',n:c})}})}),
});
Object.assign(NATHERO,{ab:'lando'});
AFTER.push(()=>{UK.push('ab_col','ab_spyT','ab_ven','ab_vd','ab_eat','ab_sph','ab_sphM')});
AUXD.ab_seek=()=>{};AUXD.ab_sphere=(x,k,t)=>{const q=P(x.x,x.y,0);g.fillStyle=rgba('#0c0f0d',.4*k);g.beginPath();g.ellipse(q.x,q.y,34*q.s,34*q.s*K,0,0,7);g.fill()};
// ---- logique des objets (hôte)
// chercheurs : après un court vol droit, la nuée vire vers l'ennemi infesté (ou pisté) le plus proche, de plus en plus vite
AUXF.ab_seek=(x,dt)=>{const p=x.p;if(!p||p.dead||p.life<=0){x.t=0;return}x.x=p.x;x.y=p.y;const age=p.life0-p.life;if(age<.15)return;
 let tg=null,bd=1e9;for(const e of enemies(x.owner)){if(!(e.ab_col>0||e.ab_spyT>0))continue;const d=Math.hypot(e.x-p.x,e.y-p.y),R=e.ab_spyT>0?680:440;if(d<R&&d<bd){bd=d;tg=e}}
 if(!tg){p.tx=p.ty=null;return}p.tx=tg.x;p.ty=tg.y;const cur=Math.atan2(p.vy,p.vx);let df=Math.atan2(tg.y-p.y,tg.x-p.x)-cur;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;
 const tr=(2.2+age*2.2)*dt,na=cur+clamp(df,-tr,tr),sp=Math.min(620,Math.hypot(p.vx,p.vy)+110*dt);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp};
// clone : éclate quand un ennemi le touche ou qu'un projectile ennemi le frappe ; sinon se disperse sans dégâts
function ab_cloneBurst(x){if(x.gone)return;x.gone=1;x.t=Math.min(x.t,.01);if(x.dp)x.dp.life=0;const o=x.owner;VFX='bugs';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<80+e.r&&hit(e,o,8,{slow:.7,unblockable:1}))ab_add(e,o,1);VFX=null;
 ab_burst(x.x,x.y,85,1);if(near(x.x,x.y)){S('bugs',o);shake=Math.max(shake,.1)}
 if(o.jst&&o.jst.key==='ab_clone'){const i=o.jst.i,ab=o.ch.abil[i];o.cds[i]=Math.max(.5,ab.cd-(x.m-x.t));o.jst=null}}
// la traînée de bond du moteur (perles de chakra) devient une traînée d'insectes
function ab_dashfx(u){for(let i=Math.max(0,fx.length-14);i<fx.length;i++){const f=fx[i];if(f.r===6&&f.m===.25&&f.vx===0&&!f.vfx&&Math.abs(f.x-u.x)<40&&Math.abs(f.y-u.y)<40){f.vfx='bugs';f.col=ABK;f.r=3;f.t=f.m=.5;f.z=8+rnd()*30;f.vx=(rnd()-.5)*60;f.vy=(rnd()-.5)*40}}}
AUXF.ab_clone=(x,dt)=>{const o=x.owner;if(x.gone)return;if(o.dead){x.t=0;if(x.dp)x.dp.life=0;return}if(o.dash)ab_dashfx(o);ab_keep(x,'ab_cloned',{col:'ab'+units.indexOf(o),rotA:x.a});
 for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r+10){ab_cloneBurst(x);return}
 for(const p of projs)if(p.owner.team!==x.team&&!p.grenade&&!p.dead&&p.life>0&&Math.abs(p.x-x.x)<50&&Math.hypot(p.x-x.x,p.y-x.y)<x.r+p.r){p.life=0;p.boom=1;ab_cloneBurst(x);return}
 if(x.t<=.05){x.gone=1;if(near(x.x,x.y))jx({jfx:'ab_burst',x:x.x,y:x.y,r:50,t:.45,m:.45,soft:1})}};
// mur : points de la courbe (légèrement bombée vers l'avant)
const ab_wpts=x=>{const L=[],px=-Math.sin(x.a),py=Math.cos(x.a),cx=Math.cos(x.a),cy=Math.sin(x.a);for(let i=0;i<=8;i++){const s=(i/8-.5)*x.len,b=-((s/(x.len/2))**2)*22;L.push({x:x.x+px*s+cx*b,y:x.y+py*s+cy*b})}return L};
const ab_wd=(x,X,Y)=>{let b=1e9;for(const q of x.pts){const d=Math.hypot(X-q.x,Y-q.y);if(d<b)b=d}return b};
AUXF.ab_wall=(x,dt)=>{const o=x.owner;x.pts=x.pts||ab_wpts(x);x.dcs=x.dcs||[];
 x.pts.forEach((q,i)=>{let p=x.dcs[i];if(!p||p.dead||p.life<=0&&x.t>.05||projs.indexOf(p)<0)p=x.dcs[i]=ab_decor(o,'ab_wallc',q.x,q.y,x.t,{life0:x.m,ar:i+1});p.life=Math.max(.02,x.t)});
 for(const p of projs){if(p.owner.team===x.team||p.grenade||p.dead||p.life<=0||Math.abs(p.x-x.x)>x.len*.6+30||Math.abs(p.y-x.y)>x.len*.6+30)continue;if(ab_wd(x,p.x,p.y)>x.w*.5+p.r+6)continue;
  if(ELM[p.vfx]===0){if(!p.abB){p.abB=1;x.t-=1.2;sparks(p.x,p.y,'#ff9a3a',12,'fire');if(near(x.x,x.y))say(o,'MUR BRÛLÉ','#ff9a3a')}continue} // le feu traverse et brûle le mur
  p.life=0;p.boom=1;o.energy=Math.min(100,o.energy+2);x.n++;if(near(p.x,p.y))jx({jfx:'ab_chomp',x:p.x,y:p.y,t:.35,m:.35})}
 for(const e of enemies(o)){if(ab_wd(x,e.x,e.y)>x.w*.5+e.r)continue;if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.3);const kk=e.c+'|'+e.team;
  if(SIMT-(x.hs[kk]||-9)>=.5){x.hs[kk]=SIMT;VFX='bugs';hit(e,o,3,{silent:1});VFX=null;ab_add(e,o,1)}}};
// dévoreurs : lien vivant ; toutes les 0,5 s, vole chakra et PV (plus sur une cible infestée) ; se rompt au-delà de 400
AUXF.ab_drain=(x,dt)=>{const o=x.owner,e=x.tg;if(!e||e.dead||o.dead||o.stun>0||Math.hypot(e.x-o.x,e.y-o.y)>400){if(e&&!e.dead&&x.t>.1)say(e,'LIEN BRISÉ','#cccccc');x.t=0;return}
 x.x=e.x;x.y=e.y;if(x.k>0)return;x.k=.5;const c=ab_n(e),ch=Math.min(e.energy,1.5+.3*c);e.energy-=ch;o.energy=Math.min(100,o.energy+ch);o.ab_eat=(o.ab_eat||0)+ch;x.n=c;
 VFX='bugs';hit(e,o,1.8+.25*c,{silent:1});VFX=null;gain(o,.8+.15*c,o);if(near(e.x,e.y))say(e,'-'+Math.round(ch)+' chakra','#7fd0ff')};
// essaim : suit le point visé, ronge (toutes les 0,33 s), ralentit, infeste ; le feu le consume
AUXF.ab_swarm=(x,dt)=>{const o=x.owner;ab_keep(x,'ab_swarmd',{ar:x.r});if(o.dead&&x.t>.3)x.t=.3;if(!o.dead){const w=ab_want(o,620),dx=w.x-x.x,dy=w.y-x.y,d=Math.hypot(dx,dy);x.acc+=dt;const sp=Math.min(x.acc<.6?400-308*x.acc:215,d*3);
  if(d>2){x.x=clamp(x.x+dx/d*sp*dt,B.x+30,B.x+B.w-30);x.y=clamp(x.y+dy/d*sp*dt,B.y+30,B.y+B.h-30);x.a=Math.atan2(dy,dx)}}
 if(ab_fire(x,x.r))x.t-=1.3;
 const tick=x.k<=0;if(tick)x.k=.33;
 for(const e of enemies(o)){if(Math.hypot(e.x-x.x,e.y-x.y)>x.r*.9+e.r)continue;if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.45);if(!tick)continue;const kk=e.c+'|'+e.team;
  VFX='bugs';if(hit(e,o,4.8,{silent:1})){x.hs[kk]=(x.hs[kk]||0)+1;if(x.hs[kk]%3===1)ab_add(e,o,1);if(x.hs[kk]%3===0&&near(e.x,e.y))say(e,'-'+Math.round(4.8*3*(o.ch.pw||1)),'#c8e07a')}VFX=null}};
// nuée destructrice : tempête qui dérive vers l'ennemi le plus infesté ; ronge PV et chakra ; le feu la réduit
AUXF.ab_nuee=(x,dt)=>{const o=x.owner;ab_keep(x,'ab_nueed',{ar:x.r});let tg=null,b=-1e9;for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d>440)continue;const s=(e.ab_col||0)*90-d;if(s>b){b=s;tg=e}}
 if(tg){const d=Math.hypot(tg.x-x.x,tg.y-x.y);if(d>4){x.x+=(tg.x-x.x)/d*Math.min(95,d*2)*dt;x.y+=(tg.y-x.y)/d*Math.min(95,d*2)*dt}}
 if(ab_fire(x,x.r))x.t-=.8;
 const tick=x.k<=0;if(tick){x.k=.4;x.n++}
 for(const e of enemies(o)){if(Math.hypot(e.x-x.x,e.y-x.y)>x.r+e.r)continue;if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.25);if(!tick)continue;
  VFX='bugs';if(hit(e,o,2.9,{silent:1})){const ch=Math.min(e.energy,1.2);e.energy-=ch;if(!o.dead){o.energy=Math.min(100,o.energy+ch);o.ab_eat=(o.ab_eat||0)+ch}if(x.n%2)ab_add(e,o,1)}VFX=null}};
// sphère : la cible est figée dedans ; toutes les 0,25 s elle perd PV et chakra ; à la fin la sphère éclate
AUXF.ab_sphere=(x,dt)=>{const o=x.owner,e=x.tg;if(!e||e.dead){if(e)e.ab_sph=0;x.t=0;return}e.ab_sph=Math.max(0,x.t);e.ab_sphM=x.m;
 if(x.t<=0||e.unstop>0){if(!x.done){x.done=1;x.t=0;e.ab_sph=0;VFX='bugs';hit(e,o,12,{unblockable:1,kb:120,fx:x.x,fy:x.y});VFX=null;ab_add(e,o,2);ab_burst(x.x,x.y,70,1);if(near(x.x,x.y)){S('bugs',o);shake=Math.max(shake,.15)}}return}
 e.x=x.x;e.y=x.y;e.kx=e.ky=0;e.stun=Math.max(e.stun,.12);e.cast=null;e.dash=null;e.flame=null;e.spin=null;
 if(x.k<=0){x.k=.25;VFX='bugs';hit(e,o,3,{silent:1});VFX=null;const ch=Math.min(e.energy,4);e.energy-=ch;if(!o.dead){o.energy=Math.min(100,o.energy+ch);o.ab_eat=(o.ab_eat||0)+ch}}};
// ---- dessins
// palette des kikaichû : corps, contour, liseré (lumière venue d'en haut), reflets
const ABK='#161b17',ABO='#070807',ABR='#56683f',ABM='#3a4a30';
// masse d'insectes façon « toon » : disques [x,y,r] (repère écran) avec contour sombre, liseré clair en haut à gauche, corps sombre
function ab_blob(C,s){g.fillStyle=ABO;g.beginPath();for(const [x,y,r] of C){g.moveTo(x+r+1.5*s,y);g.arc(x,y,r+1.5*s,0,7)}g.fill();
 g.fillStyle=ABR;g.beginPath();for(const [x,y,r] of C){g.moveTo(x-.5*s+r,y-1.3*s);g.arc(x-.5*s,y-1.3*s,r,0,7)}g.fill();
 g.fillStyle=ABK;g.beginPath();for(const [x,y,r] of C){const q=Math.max(.6,r-1.2*s);g.moveTo(x+.5*s+q,y+.7*s);g.arc(x+.5*s,y+.7*s,q,0,7)}g.fill();
 // grain : des insectes qui grouillent dans la masse
 const T=performance.now()/1000;g.fillStyle=ABM;g.beginPath();for(let j=0;j<C.length;j++){const [x,y,r]=C[j],n=Math.min(9,r/(2.8*s)|0);for(let i=0;i<n;i++){const a=i*2.399+j*1.37+T*(1+(i%3)*.6)*(j%2?1:-1),d=r*.78*Math.sqrt((i*.618+j*.29)%1);g.rect(x+Math.cos(a)*d-1.2*s,y+Math.sin(a)*d-1*s,2.4*s,2*s)}}g.fill()}
// disques d'une masse ovale qui respire (centre cx,cy ; demi-axes rx,ry)
function ab_mass(cx,cy,rx,ry,n,t,sd){const C=[];for(let i=0;i<n;i++){const a=i*2.399+sd+t*(i%2?.45:-.35),rr=.62*(.5+.5*Math.abs(Math.sin(t*.9+i*1.7))),r=Math.min(rx,ry)*(.4+.1*Math.sin(t*2.1+i*2.3));C.push([cx+Math.cos(a)*rx*rr,cy+Math.sin(a)*ry*rr,r])}return C}
// insectes isolés : n points en orbites désordonnées autour de (cx,cy), en un seul tracé
function ab_dots(cx,cy,rx,ry,n,t,sd,s,col){g.fillStyle=col;g.beginPath();for(let i=0;i<n;i++){const k=i*2.399+sd,ph=t*(1.6+(i%5)*.55)+k,rr=.3+.7*(((i*.618+sd*.37)%1+1)%1),x=cx+Math.cos(ph)*rx*rr,y=cy+Math.sin(ph*1.27+k)*ry*rr;g.rect(x-1.3*s,y-1*s,2.6*s,2*s)}g.fill()}
// petits reflets vert pâle
function ab_glints(cx,cy,rx,ry,n,t,s){g.fillStyle='rgba(214,240,150,.9)';for(let i=0;i<n;i++){const ph=t*(2.6+i*.4)+i*2.1;g.fillRect(cx+Math.cos(ph)*rx-s,cy+Math.sin(ph*1.3)*ry-s,2*s,2*s)}}
// décor trié en profondeur : « projectile » immobile et inoffensif (grenade sans explosion ; son cercle d'alerte est rejeté loin sous l'arène) qui sert juste à dessiner l'objet à sa place
function ab_decor(o,kind,x,y,life,ex){const p=Object.assign({x,y,vx:0,vy:0,owner:o,src:o,rot:0,r:.1,dmg:0,life,life0:life,col:'#000',grenade:1,boom:1,tx:x,ty:y+6000,ar:1,kind,vfx:'bugs',hitSet:null},ex);projs.push(p);return p}
// garde le décor d'un objet en vie (et le recrée si un autre jutsu l'a détruit)
function ab_keep(x,kind,ex){let p=x.dp;if(!p||p.dead||p.life<=0||projs.indexOf(p)<0){p=x.dp=ab_decor(x.owner,kind,x.x,x.y,Math.max(.05,x.t),Object.assign({life0:x.m},ex))}p.x=x.x;p.y=x.y;p.life=Math.max(.02,x.t);return p}
// dans un dessin de décor : revenir au repère de l'écran
const ab_scr=()=>{g.restore();g.save()};
// projectile espion : un insecte femelle lumineux, ailes battantes, traînée d'odeur
PROJD.ab_spy=(p,R,ra,t)=>{const T=t/1000;g.rotate(ra);g.globalCompositeOperation='lighter';g.fillStyle='rgba(200,240,120,.45)';for(let i=1;i<7;i++)g.fillRect(-i*6-1,Math.sin(T*30+i)*1.6-1,2.2,2.2);circ(-1,0,9,'rgba(170,230,90,.22)');g.globalCompositeOperation='source-over';
 const w=Math.abs(Math.sin(T*55));g.fillStyle='rgba(225,245,210,.6)';g.beginPath();g.ellipse(-1,-3-w*2.4,5.5,2+w*2.2,-.4,0,7);g.ellipse(-1,3+w*2.4,5.5,2+w*2.2,.4,0,7);g.fill();
 g.fillStyle=ABO;g.beginPath();g.ellipse(0,0,7,4.2,0,0,7);g.fill();g.fillStyle=ABK;g.beginPath();g.ellipse(.4,.4,6,3.4,0,0,7);g.fill();circ(6,0,2.4,ABO);
 g.globalCompositeOperation='lighter';circ(-2.2,0,2.6,'rgba(210,250,130,.95)');circ(-2.2,0,5,'rgba(180,230,100,.3)')};
// projectile chercheur : nuée en comète (tête dense, queue qui ondule) et fil d'odeur vers la proie flairée
PROJD.ab_seek=(p,R,ra,t)=>{const T=t/1000;if(p.tx!=null){const a=P(p.x,p.y,28),b=P(p.tx,p.ty,30);g.strokeStyle='rgba(210,236,140,.45)';g.lineWidth=1.3;g.setLineDash([3,5]);g.lineDashOffset=-T*40;g.beginPath();g.moveTo(0,0);g.lineTo((b.x-a.x)/a.s,(b.y-a.y)/a.s);g.stroke();g.setLineDash([])}
 const c=Math.cos(ra),s=Math.sin(ra),w=Math.sin(T*9)*R*.12,L=[[R*.6,w,R*.95],[-R*.35,Math.sin(T*7)*R*.2-w*.5,R*.8],[-R*1.25,Math.sin(T*6+1)*R*.32,R*.62],[-R*2,Math.sin(T*5+2)*R*.45,R*.44],[-R*2.65,Math.sin(T*4+3)*R*.55,R*.28],[R*.1,-R*.45+w,R*.5]];
 ab_blob(L.map(([x,y,r])=>[x*c-y*s,x*s+y*c,r]),1);g.save();g.rotate(ra);ab_dots(-R*.6,0,R*2.6,R*1.35,20,T*2.4,3,1,ABK);ab_glints(R*.1,0,R*.8,R*.5,3,T,1);g.restore()};
// tir de base empoisonné (nano-insectes de Torune) : petite nuée violette qui luit
PROJD.ab_venp=(p,R,ra,t)=>{const T=t/1000;g.rotate(ra);g.globalCompositeOperation='lighter';circ(0,0,R*1.9,'rgba(150,80,220,.28)');g.globalCompositeOperation='source-over';
 ab_dots(-R*.5,0,R*1.8,R*1.1,12,T*3,2,1,'#2a1438');ab_dots(-R*.3,0,R*1.3,R*.8,7,T*3.4,5,1,'#b47ae0');circ(R*.4,0,1.8,'#f0d8ff')};
// projectile dévoreur : boule d'insectes aux griffes tendues vers l'avant
PROJD.ab_latch=(p,R,ra,t)=>{const T=t/1000;g.save();g.rotate(ra);g.strokeStyle=ABO;g.lineCap='round';
 for(let j=-1;j<=1;j++){const o=Math.sin(T*16+j*2)*R*.25;g.lineWidth=3.2;g.beginPath();g.moveTo(R*.3,j*R*.35);g.quadraticCurveTo(R*1.3,j*R*(1.1+o*.05)+o,R*2.1,j*R*.55+o*.6);g.stroke();g.strokeStyle=j?ABO:ABR;g.lineWidth=1.4;g.stroke();g.strokeStyle=ABO}
 ab_dots(-R*.6,0,R*2,R*1,14,T*2.6,1,1,ABK);g.restore();const c=Math.cos(ra),s=Math.sin(ra);ab_blob([[0,0,R*.85],[-R*.75*c,-R*.75*s,R*.6],[-R*1.4*c+Math.sin(T*8)*2,-R*1.4*s,R*.38]],1);ab_glints(0,0,R*.5,R*.4,2,T,1)};
// projectile sphère : boule d'insectes qui roule, ceinturée de deux orbites
PROJD.ab_ball=(p,R,ra,t)=>{const T=t/1000,r=R*1.35;ab_sphere(0,0,r,T,1,1)};
// sphère d'insectes (projectile et prison) : contour, corps sombre, liseré, insectes en surface, anneaux qui tournent
function ab_sphere(x,y,r,T,s,al){g.save();g.globalAlpha*=al;g.fillStyle=ABO;g.beginPath();g.arc(x,y,r+1.8*s,0,7);g.fill();g.fillStyle=ABR;g.beginPath();g.arc(x-r*.06,y-r*.08,r,0,7);g.fill();g.fillStyle=ABK;g.beginPath();g.arc(x+r*.05,y+r*.06,r*.94,0,7);g.fill();
 g.fillStyle=ABM;g.beginPath();for(let i=0;i<22;i++){const la=(i%5)/5*2-.8,ph=T*(1.2+(i%3)*.3)+i*1.7,cx=Math.cos(ph)*Math.sqrt(1-la*la)*r*.9;if(Math.sin(ph)<0)continue;g.rect(x+cx-1.4*s,y+la*r*.9-1.1*s,2.8*s,2.2*s)}g.fill();
 g.strokeStyle='rgba(210,236,140,.55)';g.lineWidth=1.2*s;for(let i=0;i<2;i++){g.beginPath();g.ellipse(x,y,r*1.32,r*.36,T*1.6+i*1.8,0,7);g.stroke()}ab_dots(x,y,r*1.45,r*.5,12,T*3.2,7,s,ABK);ab_glints(x-r*.35,y-r*.4,r*.18,r*.12,2,T,s);g.restore()}
// essaim (décor) : grosse masse tourbillonnante au-dessus de la zone
PROJD.ab_swarmd=(p,R,ra,t)=>{ab_scr();const T=t/1000,q=P(p.x,p.y,0),Rr=(p.ar||80)*q.s,k=Math.min(1,p.life/.45,(p.life0-p.life)/.3+.25),cy=q.y-40*q.s;g.globalAlpha=Math.min(1,p.life/.45);
 ab_blob(ab_mass(q.x,cy,Rr*.78*k,Rr*.4*k,12,T*1.3,1),q.s);ab_dots(q.x,cy,Rr*1.05*k,Rr*.62*k,46,T*1.5,2,q.s,ABK);ab_dots(q.x,cy-4*q.s,Rr*.9*k,Rr*.5*k,14,T*1.9,5,q.s,ABM);ab_glints(q.x,cy,Rr*.55*k,Rr*.25*k,5,T,q.s)};
// nuée destructrice (décor) : grand tourbillon en colonne
PROJD.ab_nueed=(p,R,ra,t)=>{ab_scr();const T=t/1000,q=P(p.x,p.y,0),Rr=(p.ar||125)*q.s;g.globalAlpha=.8*Math.min(1,p.life/.5);
 for(let j=0;j<5;j++){const h=(6+j*16)*q.s,rx=Rr*(.2+j*.17),ry=rx*.32,n=6+j*2,C=[];for(let i=0;i<n;i++){const a=T*(2.6-j*.3)+i*6.283/n+j*.7;C.push([q.x+Math.cos(a)*rx,q.y-h+Math.sin(a)*ry,Rr*(.075+j*.014)*(.8+.2*Math.sin(T*4+i))])}ab_blob(C,q.s)}
 g.fillStyle=ABK;g.beginPath();for(let i=0;i<70;i++){const k=i/70,a=T*3.2+k*15,h=k*88*q.s,rx=Rr*(.18+k*.8);g.rect(q.x+Math.cos(a)*rx-1.5*q.s,q.y-h+Math.sin(a)*rx*.32-1.2*q.s,3*q.s,2.4*q.s)}g.fill();
 ab_dots(q.x,q.y-50*q.s,Rr*1.1,Rr*.5,30,T*2.2,4,q.s,ABK);ab_glints(q.x,q.y-50*q.s,Rr*.6,Rr*.3,6,T,q.s)};
// colonne du mur d'insectes (décor) : trois boules d'insectes empilées qui ondulent
PROJD.ab_wallc=(p,R,ra,t)=>{ab_scr();const T=t/1000,q=P(p.x,p.y,0),sd=p.ar||1,gr=Math.min(1,(p.life0-p.life)/.35),fd=Math.min(1,p.life/.4);g.globalAlpha=fd;const C=[];
 for(let i=0;i<3;i++){const h=(10+i*19)*gr*q.s,r=(13.5-i*2)*q.s*(.6+.4*gr);C.push([q.x+Math.sin(T*2.2+sd+i*1.4)*3.5*q.s,q.y-h-r*.4,r])}ab_blob(C,q.s);
 ab_dots(q.x,q.y-34*gr*q.s,15*q.s,32*q.s*gr,8,T*1.8,sd,q.s,ABK);if((sd|0)%3===0)ab_glints(q.x,q.y-30*q.s*gr,8*q.s,20*q.s,1,T+sd,q.s)};
// clone d'insectes (décor) : copie du ninja (rendu 3D), insectes qui grouillent sur le corps
PROJD.ab_cloned=(p,R,ra,t)=>{ab_scr();const o=units[+String(p.col).slice(2)];if(!o||!o.ch)return;const T=t/1000,q=P(p.x,p.y,0),S2=q.s*1.3,sk=o.ch.look.scale||1,k=Math.min(1,p.life/.3,(p.life0-p.life)/.15);
 let f=o._abF;if(!f||f.c!==o.c){f=o._abF=mkUnit(o.c,p.x,p.y,o.team);f.anim={k:'ab_still',t:99,m:99}}f.x=p.x;f.y=p.y;f.aim=p.rotA!=null?p.rotA:o.aim;f.moving=0;
 g.globalAlpha=.9*k;drawChar3(f,q.x,q.y,S2);g.globalAlpha=k;ab_dots(q.x,q.y-38*S2*sk,10*S2,30*S2*sk,30,T*.9,6,q.s,ABK);ab_dots(q.x,q.y-30*S2*sk,9*S2,24*S2*sk,10,T*1.1,3,q.s,ABM)};
// éclat de lunettes (le geste de Shino)
JFXD.ab_glint=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x+Math.cos(u.aim)*6,u.y+Math.sin(u.aim)*6,60),s=q.s*(3+6*Math.sin(Math.PI*e));g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.9*k);
 g.beginPath();g.moveTo(q.x,q.y-s*1.6);g.lineTo(q.x+s*.3,q.y);g.lineTo(q.x,q.y+s*1.6);g.lineTo(q.x-s*.3,q.y);g.closePath();g.moveTo(q.x-s*1.6,q.y);g.lineTo(q.x,q.y+s*.3);g.lineTo(q.x+s*1.6,q.y);g.lineTo(q.x,q.y-s*.3);g.closePath();g.fill();circ(q.x,q.y,s*.6,rgba('#c8f0ff',.5*k))};
// insectes qui sautent sur la cible infestée
JFXD.ab_infest=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,30),n=Math.min(12,4*(f.n||1));g.fillStyle=ABK;g.beginPath();for(let i=0;i<n;i++){const a=i*2.4+f.x,r=(40*(1-e)+6)*q.s;g.rect(q.x+Math.cos(a)*r-1.6,q.y+Math.sin(a)*r*.7-20*q.s*Math.sin(Math.PI*e)-1.3,3.2,2.6)}g.fill();
 g.strokeStyle=rgba('#c8e07a',.6*k);g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y+22*q.s,(10+16*e)*q.s,(4+6*e)*q.s,0,0,7);g.stroke()};
// marque de l'espion : ondes vertes et petit œil
JFXD.ab_mark=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0);g.strokeStyle=rgba('#c8e07a',.8*k);g.lineWidth=2;for(const m of[1,.6]){g.beginPath();g.ellipse(q.x,q.y,(14+40*e*m)*q.s,(14+40*e*m)*q.s*K,0,0,7);g.stroke()}
 const h=P(tg.x,tg.y,92);g.fillStyle=rgba('#c8e07a',k);g.beginPath();g.ellipse(h.x,h.y,7*q.s,3.6*q.s,0,0,7);g.fill();circ(h.x,h.y,2*q.s,ABK)};
// insectes qui jaillissent des manches vers l'avant
JFXD.ab_pour=(f,k,e,t,u)=>{if(!u)return;const a=f.a,n=f.big?34:20;g.fillStyle=ABK;g.beginPath();
 for(let i=0;i<n;i++){const kk=((i/n)+e*1.6)%1,d=14+kk*(f.big?130:85),sp=(f.big?.55:.3)*kk,b=a+Math.sin(i*2.7)*sp,q=P(u.x+Math.cos(b)*d,u.y+Math.sin(b)*d,34-kk*8+Math.sin(i*1.3+t*9)*5);g.rect(q.x-1.5,q.y-1.2,3,2.4)}g.fill();
 const h=P(u.x+Math.cos(a)*18,u.y+Math.sin(a)*18,34);g.globalAlpha=k;ab_blob([[h.x,h.y,(3+5*e)*h.s],[h.x+Math.cos(a)*9*h.s,h.y+Math.sin(a)*5*h.s,(2+4*e)*h.s]],h.s)};
// éclatement d'une nuée : boules d'insectes projetées en couronne, voile sombre
JFXD.ab_burst=(f,k,e,t)=>{const q=P(f.x,f.y,0),R=f.r*(.3+.8*ezo(e));g.fillStyle=rgba('#0c0f0d',(f.soft?.2:.32)*k);gEll(f.x,f.y,R*.9);g.fill();
 if(!f.soft){g.globalAlpha=k;const C=[];for(let i=0;i<7;i++){const a=i*.898+f.x*.01,rr=R*.62,z=12+30*Math.sin(Math.PI*Math.min(1,e*1.3)),p=P(f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr*.85,z);C.push([p.x,p.y,(9*(1-e)+2)*p.s])}ab_blob(C,q.s);g.globalAlpha=1}
 g.fillStyle=ABK;g.beginPath();const n=f.soft?16:40;for(let i=0;i<n;i++){const a=i*2.399+f.x*.01,rr=R*(.4+.65*((i*.618)%1)),z=(10+((i*37)%40))*(1-e)+Math.sin(Math.PI*e)*22,p=P(f.x+Math.cos(a)*rr,f.y+Math.sin(a)*rr*.85,z);g.rect(p.x-1.6,p.y-1.3,3.2,2.6)}g.globalAlpha=Math.min(1,k*1.5);g.fill()};
// bond du clone : traînée d'insectes du départ à l'arrivée
JFXD.ab_stream=(f,k,e,t)=>{g.fillStyle=ABK;g.beginPath();for(let i=0;i<30;i++){const kk=(i/30+e*.8)%1,x=lerp(f.x,f.x2,kk)+Math.sin(i*2.1+t*12)*10,y=lerp(f.y,f.y2,kk)+Math.cos(i*1.7+t*10)*8,q=P(x,y,10+((i*13)%34)*k);g.rect(q.x-1.5,q.y-1.2,3,2.4)}g.globalAlpha=k;g.fill()};
// projectile dévoré par le mur : les insectes se referment dessus, éclat de chakra
JFXD.ab_chomp=(f,k,e,t)=>{const q=P(f.x,f.y,28);g.fillStyle=ABK;g.beginPath();for(let i=0;i<14;i++){const a=i*.45+t*6,r=(18*k+2)*q.s;g.rect(q.x+Math.cos(a)*r-1.6,q.y+Math.sin(a)*r*.8-1.3,3.2,2.6)}g.fill();
 g.globalCompositeOperation='lighter';circ(q.x,q.y,(3+6*k)*q.s,rgba('#7fd0ff',.55*k))};
// nuée colossale qui tombe du ciel sur la zone
JFXD.ab_fall=(f,k,e,t)=>{const q=P(f.x,f.y,0),fall=ezo(Math.min(1,e*1.12)),R=f.r*q.s,H=(1-fall)*270*q.s;g.fillStyle=rgba('#0c0f0d',.12+.3*fall);g.beginPath();g.ellipse(q.x,q.y,R*(.35+.65*fall),R*(.35+.65*fall)*K,0,0,7);g.fill();
 if(fall<.97){const cy=q.y-H-R*.3;g.strokeStyle='rgba(22,27,23,.5)';g.lineWidth=2;g.beginPath();for(let i=0;i<9;i++){const xx=q.x+(i-4)*R*.2;g.moveTo(xx,cy-R*.2);g.lineTo(xx+Math.sin(i)*4,cy-R*.2-30*q.s-(i%3)*12*q.s)}g.stroke();
  ab_blob(ab_mass(q.x,cy,R*.95,R*.45,14,t*1.2,2),q.s);ab_dots(q.x,cy,R*1.15,R*.65,60,t*2,3,q.s,ABK);ab_glints(q.x,cy,R*.6,R*.25,5,t,q.s)}};
// la cible est engloutie : boules d'insectes et nuée qui grouillent sur tout le corps
JFXD.ab_engulf=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s*1.3*(tg.ch.look.scale||1);g.globalAlpha=Math.min(1,k*3);const C=[];
 for(let i=0;i<6;i++){const a=t*2.5+i*1.05,h=(14+i*9)*s;C.push([q.x+Math.cos(a)*11*s,q.y-h+Math.sin(a)*3*s,(5.5-i*.3)*s])}ab_blob(C,q.s);ab_dots(q.x,q.y-34*s,16*s,36*s,40,t*3,5,q.s,ABK)};
// impact du venin de Torune : éclaboussure violette (taille selon la dose)
JFXD.ab_vhit=(f,k,e,t)=>{const q=P(f.x,f.y,34);const n=5+(f.n||1)*4;g.fillStyle=rgba('#6a2a9a',.85*k);g.beginPath();for(let i=0;i<n;i++){const a=i*2.4+f.x,r=(5+26*e)*q.s;g.moveTo(q.x+Math.cos(a)*r+2.6*q.s,q.y+Math.sin(a)*r*.8-10*e*q.s);g.arc(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r*.8-10*e*q.s,(2.6-1.6*e)*q.s,0,7)}g.fill();g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const a=i*2.4+f.x+.5,r=(4+20*e)*q.s;g.fillStyle=i%2?rgba('#e0c0ff',.8*k):rgba('#a060e0',.8*k);g.fillRect(q.x+Math.cos(a)*r-1.5,q.y+Math.sin(a)*r*.8-1.5-8*e*q.s,3,3)}
 g.strokeStyle=rgba('#b47ae0',.7*k);g.lineWidth=1.5;g.beginPath();g.arc(q.x,q.y,(5+10*e)*q.s*(f.n||1)*.6,0,7);g.stroke()};
// activation des nano-insectes : anneau violet et nuée fine qui monte
JFXD.ab_venup=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x,u.y,0);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#b47ae0',.8*k);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y,(18+40*e)*q.s,(18+40*e)*q.s*K,0,0,7);g.stroke();
 for(let i=0;i<16;i++){const a=i*.39+t*3,r=(12+8*Math.sin(i))*q.s,y=q.y-(10+e*70+((i*13)%20))*q.s;g.fillStyle=i%2?rgba('#d8b0ff',.8*k):rgba('#8a4ad0',.8*k);g.fillRect(q.x+Math.cos(a)*r-1.2,y-1.2,2.4,2.4)}};
DETO.ab_fall=(x,y,r)=>{jx({jfx:'ab_burst',x,y,r:r*1.1,t:.8,m:.8});jx({jfx:'shock',x,y,r:r*1.2,t:.5,m:.5,col:'#4a5a3a'})};
// au sol : flaque du clone, bande du mur, ombre de l'essaim, disque de la nuée
AUXD.ab_clone=(x,k,t)=>{const q=P(x.x,x.y,0);g.fillStyle=rgba('#0c0f0d',.4*k);g.beginPath();g.ellipse(q.x,q.y,22*q.s,22*q.s*K,0,0,7);g.fill();ab_dots(q.x,q.y,26*q.s,10*q.s,16,t*1.5,2,q.s,ABK)};
AUXD.ab_wall=(x,k,t)=>{const Q=ab_wpts(x).map(p=>P(p.x,p.y,0));g.strokeStyle=rgba('#0c0f0d',.38*k);g.lineCap='round';g.lineJoin='round';g.lineWidth=x.w*Q[4].s;g.beginPath();Q.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.stroke();
 g.strokeStyle=rgba('#56683f',.5*k);g.lineWidth=1.5;g.setLineDash([6,6]);g.lineDashOffset=-t*20;g.stroke();g.setLineDash([])};
AUXD.ab_swarm=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s;g.fillStyle=rgba('#0c0f0d',.3*k);g.beginPath();g.ellipse(q.x,q.y,R*.92,R*.92*K,0,0,7);g.fill();g.strokeStyle=rgba('#56683f',.6*k);g.lineWidth=1.5;g.setLineDash([5,7]);g.lineDashOffset=-t*20;g.beginPath();g.ellipse(q.x,q.y,R*.92,R*.92*K,0,0,7);g.stroke();g.setLineDash([])};
AUXD.ab_nuee=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s;g.fillStyle=rgba('#0c0f0d',.36*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.strokeStyle=rgba('#56683f',.6*k);g.lineWidth=2;g.setLineDash([8,6]);g.lineDashOffset=t*30;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.setLineDash([]);
 g.strokeStyle=rgba('#161b17',.5*k);g.lineWidth=3;for(let i=0;i<3;i++){const a=t*1.8+i*2.09;g.beginPath();g.ellipse(q.x,q.y,R*.62,R*.62*K,0,a,a+1.4);g.stroke()}};
// dévoreurs : flot d'insectes ondulant de la cible vers le lanceur, chakra volé qui remonte le flot
AUXD.ab_drain=(x,k,t)=>{const o=x.ui!=null?units[x.ui]:null,e=x.ti!=null?units[x.ti]:null;if(!o||!e||o.dead||e.dead)return;const a=P(o.x+Math.cos(o.aim)*14,o.y+Math.sin(o.aim)*14,36),b=P(e.x,e.y,34),dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
 const pt=(kk,ph,am)=>{const w=Math.sin(kk*Math.PI)*am*Math.sin(kk*9-t*8+ph);return[a.x+dx*kk+nx*w,a.y+dy*kk+ny*w]};
 g.lineCap='round';for(const [ph,am,lw] of[[0,9,3.5],[2.2,7,2.2],[4.1,5,1.6]]){g.strokeStyle=rgba('#070807',.75);g.lineWidth=lw+1.6;g.beginPath();for(let i=0;i<=18;i++){const [px,py]=pt(i/18,ph,am);i?g.lineTo(px,py):g.moveTo(px,py)}g.stroke();g.strokeStyle=ABM;g.lineWidth=lw*.6;g.stroke()}
 g.fillStyle=ABK;g.beginPath();for(let i=0;i<34;i++){const kk=1-((i/34+t*.8)%1),[px,py]=pt(kk,i%3*2.1,8);g.rect(px-1.6+Math.sin(i*3.1+t*9)*4,py-1.3+Math.cos(i*2.3+t*7)*4,3.2,2.6)}g.fill();
 const C=[];for(let i=0;i<7;i++){const kk=1-((i/7+t*.55)%1),[px,py]=pt(kk,0,9);C.push([px,py,(2.4+1.6*Math.sin(Math.PI*kk))*b.s])}ab_blob(C,b.s);
 g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(127,208,255,.95)';for(let i=0;i<4+(x.n||0);i++){const kk=1-((i/(4+(x.n||0))+t*1.3)%1),[px,py]=pt(kk,1,9);g.fillRect(px-1.8,py-1.8,3.6,3.6)}g.restore();
 const C2=[];for(let i=0;i<5;i++){const an=t*3+i*1.26;C2.push([b.x+Math.cos(an)*13*b.s,b.y-6*b.s+Math.sin(an)*20*b.s,4*b.s])}ab_blob(C2,b.s);ab_dots(b.x,b.y-4*b.s,18*b.s,26*b.s,14+2*(x.n||0),t*2.6,4,b.s,ABK)};
// colonies sur les ninjas : insectes qui grouillent sur le corps et compteur à côté de la barre de vie ; insecte espion ; doses de venin ; sphère d'insectes
STATD.push((u,p,S,sk)=>{const c=u.ab_col||0,sp=u.ab_spyT>0,vd=u.ab_vd||0,sph=u.ab_sph>0;if(!c&&!sp&&!vd&&!sph)return;const t=performance.now()/1000,H=S*sk,ps=S/1.3/(u.giant>0?1.35:1),top=p.y-100*sk*ps;
 if(sph){const r=40*S*.82*sk*(1+.05*Math.sin(t*9)),gr=Math.min(1,(u.ab_sphM-u.ab_sph)/.2+.3);ab_sphere(p.x,p.y-38*H,r*gr,t,ps,.86);g.fillStyle='rgba(127,208,255,.85)';for(let i=0;i<3;i++){const kk=(t*1.2+i/3)%1;g.fillRect(p.x+Math.sin(i*2+t*4)*r*.4-1.5,p.y-38*H-r*(.2+kk)-1.5,3,3)}}
 if(c){const B=[];for(let i=0;i<c*3;i++){const ph=t*(1.1+(i%4)*.3)+i*2.1;B.push([p.x+Math.sin(ph)*(7+(i%3)*2)*S,p.y-(8+((i*17+t*14*(i%2?1:-1))%60+60)%60)*H*.95])}
  // insectes qui grouillent sur le corps : liseré clair (visible sur les tenues sombres) puis corps sombre
  g.fillStyle='#9ab35a';g.beginPath();for(const [xx,yy] of B)g.rect(xx-1.6*S,yy-1.6*S,3.2*S,1.4*S);g.fill();g.fillStyle=ABK;g.beginPath();for(const [xx,yy] of B)g.rect(xx-1.4*S,yy-.9*S,2.8*S,2*S);g.fill();
  const x0=p.x+29*ps,y0=top+3;g.lineWidth=1;for(let i=0;i<c;i++){const cx=x0+i*6*ps+2.5;g.fillStyle=ABK;g.strokeStyle='#c8e07a';g.beginPath();g.ellipse(cx,y0,2.2*ps,3*ps,0,0,7);g.fill();g.stroke()}}
 if(sp){const h=P(u.x,u.y,0),pl=(t*1.3)%1;g.strokeStyle=rgba('#c8e07a',.5*(1-pl));g.lineWidth=1.5;g.beginPath();g.ellipse(h.x,h.y,(16+20*pl)*ps,(16+20*pl)*ps*K,0,0,7);g.stroke();
  const hx=p.x+Math.sin(t*2)*5*S,hy=p.y-(76+Math.sin(t*4)*3)*H;g.save();g.globalCompositeOperation='lighter';circ(hx,hy,3.5*S,'rgba(200,240,120,.35)');circ(hx,hy,1.6*S,'#e8ffb0');g.restore()}
 if(vd){g.fillStyle='#a060e0';for(let i=0;i<vd;i++){const xx=p.x-29*ps-4-i*6*ps,yy=top+3;g.beginPath();g.moveTo(xx,yy-3.5*ps);g.quadraticCurveTo(xx+3*ps,yy+1*ps,xx,yy+2.5*ps);g.quadraticCurveTo(xx-3*ps,yy+1*ps,xx,yy-3.5*ps);g.fill()}}});
// ---- animations 3D
Object.assign(ANIM,{
 // remonte ses lunettes, puis d'une pichenette lâche l'insecte
 ab_flick:(P,e)=>{if(e<.4){const k=ezo(e/.4);pz(P,'armR',-2.2*k,0,.55*k);pz(P,'foreR',-2.4*k);pz(P,'head',.1*k)}else{const k=ezo(Math.min(1,(e-.4)/.22));pz(P,'armR',-2.2+.6*k,0,.55-.6*k);pz(P,'foreR',-2.4+2.3*k);pz(P,'chest',.08,.25*k)}pz(P,'armL',.1,0,.25);pz(P,'foreL',-.5)},
 // bras tendu, paume ouverte : les insectes sortent de la manche
 ab_sleeve:(P,e)=>{const k=ezo(Math.min(1,e/.25)),r=e>.7?(e-.7)/.3:0;pz(P,'armR',-1.55*k+.3*r-.05,0,.1*k);pz(P,'foreR',-.05);pz(P,'chest',.15*k,.35*k);pz(P,'armL',.5*k,0,.35);pz(P,'foreL',-.6);P.root.z=5*k*(1-r);pz(P,'thighR',-.4*k);pz(P,'shinR',.5*k)},
 // se tasse, bras croisés, puis jaillit : le corps se défait en insectes
 ab_dissolve:(P,e)=>{if(e<.3){const k=ezo(e/.3);P.root.y=-6*k;pz(P,'thighL',-.9*k);pz(P,'shinL',1.5*k);pz(P,'thighR',-.5*k);pz(P,'shinR',1.4*k);pz(P,'chest',.5*k);pz(P,'armL',-1.3*k,0,-.6*k);pz(P,'foreL',-1.3*k);pz(P,'armR',-1.3*k,0,.6*k);pz(P,'foreR',-1.3*k)}
  else{const k=ezo(Math.min(1,(e-.3)/.4));pz(P,'chest',.5-.2*k);pz(P,'armL',.8*k,0,.4);pz(P,'armR',.8*k,0,-.4);pz(P,'thighL',-.6);pz(P,'shinL',.8);pz(P,'thighR',.4);pz(P,'shinR',.6);P.root.y=-3+3*k}},
 // bras croisés devant soi, puis grand geste qui déploie le rideau
 ab_wall:(P,e)=>{if(e<.35){const k=ezo(e/.35);pz(P,'armL',-1.35*k,0,-.55*k);pz(P,'foreL',-1.25*k);pz(P,'armR',-1.35*k,0,.55*k);pz(P,'foreR',-1.25*k);pz(P,'head',.2*k);P.root.y=-2*k}
  else{const k=ezo(Math.min(1,(e-.35)/.3));pz(P,'armL',-1.35+.15*k,0,-.55+1.75*k);pz(P,'foreL',-1.25+1.15*k);pz(P,'armR',-1.35+.15*k,0,.55-1.75*k);pz(P,'foreR',-1.25+1.15*k);pz(P,'chest',-.1*k);pz(P,'thighL',0,0,.25*k);pz(P,'thighR',0,0,-.25*k);P.root.y=-2}},
 // bras tendu, poing qui se referme et tire le flot d'insectes à soi
 ab_drain:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.2)),tug=e>.25?.5+.5*Math.sin(t*14):0;pz(P,'armR',-1.6*k+.35*tug,0,.05);pz(P,'foreR',-.2-.5*tug);pz(P,'chest',-.12*tug,.3*k);pz(P,'armL',.3,0,.3);pz(P,'foreL',-.8);P.root.z=-2*tug;pz(P,'thighL',.3*k);pz(P,'shinL',.3*k)},
 // poings serrés contre la poitrine, puis bras ouverts : le venin se répand sur la peau
 ab_venom:(P,e)=>{if(e<.35){const k=ezo(e/.35);pz(P,'armL',-1.1*k,0,-.5*k);pz(P,'foreL',-2.2*k);pz(P,'armR',-1.1*k,0,.5*k);pz(P,'foreR',-2.2*k);pz(P,'head',.25*k);pz(P,'chest',.15*k)}
  else{const k=ezo(Math.min(1,(e-.35)/.3));pz(P,'armL',-1.1+.6*k,0,-.5+1.4*k);pz(P,'foreL',-2.2+1.9*k);pz(P,'armR',-1.1+.6*k,0,.5-1.4*k);pz(P,'foreR',-2.2+1.9*k);pz(P,'head',.25-.4*k);pz(P,'chest',.15-.3*k);P.root.y=-1.5*k}},
 // manteau ouvert, les deux bras poussent la nuée en avant
 ab_swarm:(P,e)=>{if(e<.3){const k=ezo(e/.3);pz(P,'armL',.3*k,0,.9*k);pz(P,'armR',.3*k,0,-.9*k);pz(P,'chest',-.2*k);pz(P,'head',-.1*k)}
  else{const k=ezo(Math.min(1,(e-.3)/.25));pz(P,'armL',.3-1.75*k,0,.9-.45*k);pz(P,'armR',.3-1.75*k,0,-.9+.45*k);pz(P,'foreL',-.05);pz(P,'foreR',-.05);pz(P,'chest',-.2+.45*k);P.root.z=6*k;pz(P,'thighR',-.5*k);pz(P,'shinR',.6*k);pz(P,'thighL',.3*k)}},
 // bras levés au ciel pour appeler la nuée, puis abattus vers la zone
 ab_nuee:(P,e)=>{if(e<.45){const k=ezo(e/.45);pz(P,'armL',-2.9*k,0,.5*k);pz(P,'armR',-2.9*k,0,-.5*k);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'head',-.4*k);pz(P,'chest',-.25*k);P.root.y=2*k}
  else{const k=ezo(Math.min(1,(e-.45)/.25));pz(P,'armL',-2.9+1.7*k,0,.5-.2*k);pz(P,'armR',-2.9+1.7*k,0,-.5+.2*k);pz(P,'head',-.4+.55*k);pz(P,'chest',-.25+.7*k);P.root.y=2-7*k;pz(P,'thighL',-.6*k);pz(P,'shinL',1*k);pz(P,'thighR',-.3*k);pz(P,'shinR',.9*k)}},
 // mains en coupe autour d'une boule invisible, qui se referment
 ab_sphere:(P,e)=>{const k=ezo(Math.min(1,e/.3)),c=e>.35?ezo(Math.min(1,(e-.35)/.3)):0;pz(P,'armL',-1.4*k-.1*c,0,.35*k-.6*c);pz(P,'foreL',-.6*k-.4*c);pz(P,'armR',-1.4*k-.1*c,0,-.35*k+.6*c);pz(P,'foreR',-.6*k-.4*c);pz(P,'chest',.2*k);P.root.z=4*k;pz(P,'thighR',-.4*k);pz(P,'shinR',.5*k)},
 // le clone se tient immobile, bras le long du corps, tête un peu baissée
 ab_still:(P,e,u,t)=>{pz(P,'armL',.05,0,.12);pz(P,'armR',.05,0,-.12);pz(P,'foreL',-.15);pz(P,'foreR',-.15);pz(P,'head',.12,0,0);P.root.y=.3*Math.sin(t*1.5)},
});

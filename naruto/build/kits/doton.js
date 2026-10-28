// ===== Doton (terre) =====
// La terre façonne l'arène (murs, piliers, marécage, fleuve de boue), encaisse (Kyôka) et contrôle (projections, saisies, poids).
// Règle commune : un ennemi repoussé contre un mur, un poteau ou le bord de l'arène est ÉCRASÉ (étourdi).
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('n4',[
 [1,'D','x.do_rock','Doton : Rocher','Rocher roulant qui repousse ; projeté contre un mur ou un obstacle, l\'ennemi est écrasé (étourdi)','earth'],
 [1,'D','x.do_wall','Doton : Doryûheki','Mur de terre au point visé : bloque tirs et passage 4 s, repousse les ennemis pris dessus','earth'],
 [1,'C','x.do_spikes','Doton : Doryûsô','Une ligne de pics de terre jaillit devant soi : blesse et projette en l\'air','earth'],
 [1,'C','x.do_swamp','Doton : Yomi Numa','Marécage 4 s : enlise (immobilise) ceux qui y sont pris, puis ralentit et bloque Espace ; y rester enlise à nouveau','earth'],
 [1,'B','x.do_armor','Doton : Kyôka','Corps de roche 3,5 s : 45 % de dégâts en moins, inarrêtable, plus lent ; puis éclate et repousse (selon les coups encaissés)','earth'],
 [1,'B','x.do_hand','Doton : Main de terre','Une main de terre surgit au point visé (court délai), saisit les ennemis et les jette à tes pieds','earth'],
 [1,'B','x.do_river','Doton : Doryû Taiga','Fleuve de boue devant soi 3 s : emporte et ralentit les ennemis ; plaqués contre un mur, ils sont écrasés','earth'],
 [1,'A','x.do_dragon','Doton : Dragon de terre','Un dragon de terre crache 3 boulets de boue qui suivent ta visée : explosent, ralentissent, laissent de la boue','earth'],
 [1,'A','x.do_weight','Doton : Kajûgan','Projectile qui alourdit 2,5 s (ralenti, sans déplacement) puis plaque au sol (étourdi) ; un jutsu Doton le plaque aussitôt','earth'],
 [2,'C','x.do_mole','Doton : Taupe','Plonge sous terre (intouchable), file vers le curseur et jaillit en projetant en l\'air les ennemis proches','earth'],
 [2,'C','x.do_flip','Doton : Doroku Gaeshi','Bondit vers le curseur et soulève derrière soi une dalle de terre qui arrête tirs et poursuivants 2,5 s','earth'],
 [5,'S','x.do_mountain','Doton : Chute de montagne','Une montagne s\'écrase sur la zone après 1 s (gros dégâts, étourdit), puis un cercle de rochers l\'enferme 4 s','earth'],
 [5,'S','x.do_quake','Doton : Grand séisme','Frappe le sol : 3 ondes de choc projettent en l\'air et repoussent, puis le sol fendu ralentit 3 s','earth'],
]);
// ---- outils communs (préfixe do_)
// son franc : l'élément terre change tous les sons en « rock », on le coupe le temps d'un vrai choc
function do_S(k,u){const V=VFX;VFX=null;S(k,u);VFX=V}
// hasard déterministe (les dessins ne clignotent pas d'une image à l'autre)
function do_h(n){const s=Math.sin(n*127.1+311.7)*43758.5453;return s-Math.floor(s)}
// coup de terre (élément Doton) ; une cible alourdie par Kajûgan est aussitôt plaquée au sol
function do_hit(e,u,dmg,o={}){const V=VFX;VFX='earth';const ok=hit(e,u,dmg,o);VFX=V;if(ok&&e.do_kj>0&&!o.nokj)do_kjSlam(e);return ok}
// nuage de poussière + éclats de roche
function do_puff(x,y,r,n){if(!near(x,y))return;jx({jfx:'do_dust',x,y,r,t:.55,m:.55});if(n)sparks(x,y,'#8a6a48',n,'earth')}
// obstacle au contact dans la direction (vx,vy) : bord de l'arène, poteau ou mur ennemi
function do_wallAt(e,vx,vy){const m=5;if((vx<0&&e.x<=B.x+e.r+m)||(vx>0&&e.x>=B.x+B.w-e.r-m)||(vy<0&&e.y<=B.y+e.r+m)||(vy>0&&e.y>=B.y+B.h-e.r-m))return true;
 for(const p of OBST)if(Math.hypot(e.x-p.x,e.y-p.y)<p.r+e.r+m&&(p.x-e.x)*vx+(p.y-e.y)*vy>0)return true;
 for(const w of walls)if(w.team!==e.team&&Math.hypot(e.x-w.x,e.y-w.y)<w.r+e.r+m&&(w.x-e.x)*vx+(w.y-e.y)*vy>0)return true;return false}
// écrasé contre l'obstacle : étourdi + dégâts
function do_stun(e,st){if(e.dead||e.unstop>0)return;e.stun=Math.max(e.stun,st);e.cast=null;e.flame=null;e.spin=null}
function do_crush(e,u,dmg,st){e.kx*=.15;e.ky*=.15;if(do_hit(e,u,dmg,{unblockable:1}))do_stun(e,st);say(e,'ÉCRASÉ','#ff9a4a');do_puff(e.x,e.y,40,12);if(near(e.x,e.y)){do_S('heavy',e);shake=Math.max(shake,.2)}}
// après une poussée, l'écrasement reste possible pendant t secondes
function do_crushArm(e,u,t,dmg,st){if(!e.dead&&e.unstop<=0)aux.push({type:'do_cr',x:e.x,y:e.y,r:0,t,m:t,team:u.team,owner:u,tg:e,dmg,st})}
// décor dessiné à sa profondeur parmi les ninjas : projectile immobile « en cloche », sans collision, explosion ni lueur
function do_prop(u,x,y,t,kind,o){const p=Object.assign({x,y,vx:0,vy:0,owner:u,src:u,rot:0,r:6,dmg:0,life:t,life0:t,col:'#7a5a3a',grenade:1,boom:1,tx:x,ty:y,ar:1,kind,vfx:'do_prop',noClash:1,hitSet:null},o);projs.push(p);return p}
// ramène le dessin d'un décor au niveau du sol (annule la hauteur des projectiles en cloche)
function do_gnd(p){g.translate(0,Math.sin(Math.PI*(1-p.life/p.life0))*70+15)}
// polygone plein (contour sombre optionnel), en coordonnées locales
function do_sh(pts,c,st){g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();if(st){g.strokeStyle='#22160c';g.lineWidth=st;g.stroke()}}
// un feu allié sur le trajet (zone, objet ou mur de feu) embrase les boulets de boue
function do_fireAt(tm,x0,y0,x1,y1){for(let i=0;i<=4;i++){const x=lerp(x0,x1,i/4),y=lerp(y0,y1,i/4);
 for(const f of fields)if(f.team===tm&&(f.vfx==='fire'||f.vfx==='black')&&Math.hypot(x-f.x,y-f.y)<f.r)return true;
 for(const a of aux)if(a.team===tm&&a.vfx==='fire'&&a.r&&a.type!=='tele'&&Math.hypot(x-a.x,y-a.y)<a.r)return true;
 for(const w of walls)if(w.team===tm&&(w.burn||w.vfx==='fire')&&Math.hypot(x-w.x,y-w.y)<w.r+16)return true}return false}
// Kajûgan : marque, puis plaquage au sol
function do_kjMark(e,u){if(e.dead||e.unstop>0)return;let x=null;for(const q of aux)if(q.type==='do_kj'&&q.tg===e)x=q;if(x)x.t=2.5;else aux.push({type:'do_kj',x:e.x,y:e.y,r:0,t:2.5,m:2.5,team:u.team,owner:u,tg:e});
 e.do_kj=2.5;e.do_kjS=u;anim(e,'do_heavy',2.5);say(e,'ALOURDI','#f0d890');if(near(e.x,e.y))do_S('heavy',e)}
function do_kjSlam(e){if(!(e.do_kj>0))return;const u=e.do_kjS||e;e.do_kj=0;anim(e,'do_slammed',.75);if(do_hit(e,u,15,{unblockable:1,nokj:1}))do_stun(e,.75);say(e,'PLAQUÉ AU SOL','#f0d890');
 aux.push({type:'do_crater',x:e.x,y:e.y,r:42,t:1.8,m:1.8,team:u.team,owner:u});
 if(near(e.x,e.y)){jx({jfx:'do_slam',x:e.x,y:e.y,t:.4,m:.4});do_puff(e.x,e.y,46,8);do_S('boom',e);shake=Math.max(shake,.2)}}
// Kyôka : la roche éclate autour du lanceur, d'autant plus fort qu'elle a encaissé
function do_burst(u,abs){u.do_ar=0;const d=Math.min(36,12+abs*.35);for(const e of enemies(u))if(dist(u,e)<105+e.r){do_hit(e,u,d,{kb:260,fx:u.x,fy:u.y,unblockable:1});do_crushArm(e,u,.4,6,.5)}
 if(near(u.x,u.y)){jx({jfx:'do_shatter',x:u.x,y:u.y,r:105,t:.55,m:.55});do_puff(u.x,u.y,70,16);do_S('boom',u);shake=Math.max(shake,.22)}say(u,'ÉCLATS DE ROCHE','#e8c890')}
// Dragon de terre : boulet de boue en cloche, de la gueule du dragon vers la visée (à la distance choisie au lancement) ;
// il se cale sur l'ennemi le plus proche du point visé (90 px), en anticipant sa course
function do_mudShot(u,H,d){const b=u.aim,hx=H.x+Math.cos(b)*20,hy=H.y+Math.sin(b)*20;let tx=u.x+Math.cos(b)*d,ty=u.y+Math.sin(b)*d,fl=clamp(Math.hypot(tx-hx,ty-hy)/640,.26,.7);
 const e=nearE(u,tx,ty,90);if(e){tx=e.x+(e.vx||0)*fl*.6;ty=e.y+(e.vy||0)*fl*.6;fl=clamp(Math.hypot(tx-hx,ty-hy)/640,.26,.7)}tx=clamp(tx,B.x+20,B.x+B.w-20);ty=clamp(ty,B.y+20,B.y+B.h-20);
 H.tx=H.x+Math.cos(b);H.ty=H.y+Math.sin(b);S('rock',u);
 projs.push({x:hx,y:hy-44,vx:(tx-hx)/fl,vy:(ty-hy+44)/fl,owner:u,src:u,rot:0,r:9,dmg:0,life:fl,life0:fl,col:'#4a3220',grenade:1,boom:1,tx,ty,ar:58,kind:'do_mudball',vfx:'do_prop',noClash:1,hitSet:null});
 later(u,fl,()=>{const fire=do_fireAt(u.team,hx,hy,tx,ty);for(const e of enemies(u))if(Math.hypot(e.x-tx,e.y-ty)<58+e.r)do_hit(e,u,13,fire?{slow:1.2,unblockable:1,el:0,dot:BURN(5,3)}:{slow:1.2,unblockable:1});
  field(u,tx,ty,{r:46,t:1.8,slow:1,col:'#4a3424',vfx:'earth'});aux.push({type:'do_puddle',x:tx,y:ty,r:46,t:1.8,m:1.8,team:u.team,owner:u,kind:fire?'fire':''});
  if(near(tx,ty)){jx({jfx:'do_splash',x:tx,y:ty,r:58,t:.45,m:.45,fire:fire?1:0});sparks(tx,ty,'#3a2616',6,'earth')}},{})}
Object.assign(NAT,{
 // Rocher : roule et repousse ; contre un obstacle, l'ennemi est écrasé
 do_rock:SP('Doton : Rocher','Rocher roulant qui repousse ; projeté contre un mur ou un obstacle, l\'ennemi est écrasé (étourdi)',5,{line:{len:460,w:30},ai:RG(470,.7)},(u,a)=>{S('rock',u);anim(u,'throw2',.45);do_puff(u.x+Math.cos(a)*22,u.y+Math.sin(a)*22,24,5);
  proj(u,a,{spd:600,r:14,dmg:12,life:.78,col:'#7a5a3a',kind:'do_boulder',o:{kb:230},onHit:(p,e)=>{if(e.do_kj>0)do_kjSlam(e);do_crushArm(e,p.owner,.5,5,.5);do_puff(p.x,p.y,28,8)}})}),
 // Doryûheki : rempart de 7 blocs au point visé (les bots le posent devant eux)
 do_wall:SP('Doton : Doryûheki','Mur de terre au point visé : bloque tirs et passage 4 s, repousse les ennemis pris dessus',10,{tele:{r:60,max:330},ai:DEF},(u,a,td)=>{const d=u.ctrl?clamp(td||200,70,330):clamp((td||200)*.45,70,150),c=fwd(u,a,d),ca=Math.cos(a),sa=Math.sin(a),px=-sa,py=ca;
  S('rock',u);do_S('heavy',u);anim(u,'do_palms',.55);
  for(let i=-3;i<=3;i++)walls.push({x:c.x+px*i*25,y:c.y+py*i*25,r:14,t:4,team:u.team,owner:u,earth:1,vfx:'do_wall'});
  for(const e of enemies(u)){const dx=e.x-c.x,dy=e.y-c.y,s=dx*px+dy*py,f=dx*ca+dy*sa;if(Math.abs(s)<90+e.r&&Math.abs(f)<e.r+16){const k=f>=0?1:-1;do_hit(e,u,6,{kb:280,fx:e.x-ca*k*20,fy:e.y-sa*k*20,unblockable:1})}}
  aux.push({type:'do_crack',kind:'line',x:c.x-px*96,y:c.y-py*96,a:a+Math.PI/2,len:192,r:0,t:4,m:4,team:u.team,owner:u});
  do_puff(c.x,c.y,80,0);if(near(c.x,c.y))for(let i=-3;i<=3;i+=2)sparks(c.x+px*i*25,c.y+py*i*25,'#8a6a48',3,'earth')}),
 // Doryûsô : 6 bouquets de pics jaillissent l'un après l'autre le long de la ligne
 do_spikes:SP('Doton : Doryûsô','Une ligne de pics de terre jaillit devant soi : blesse et projette en l\'air',8,{line:{len:350,w:76},ai:RG(330,.6)},(u,a)=>{S('rock',u);anim(u,'do_strike',.55);const o={x:u.x,y:u.y},hs=new Set();
  aux.push({type:'do_crack',kind:'line',x:o.x+Math.cos(a)*24,y:o.y+Math.sin(a)*24,a,len:330,r:0,t:1.3,m:1.3,team:u.team,owner:u,w:.3});
  for(let i=0;i<6;i++){const p=fwd(o,a,60+i*56);later(u,.03+i*.05,()=>{do_prop(u,p.x,p.y,.9,'do_spear',{r:10});
   for(const e of enemies(u))if(!hs.has(e)&&Math.hypot(e.x-p.x,e.y-p.y)<38+e.r){hs.add(e);do_hit(e,u,15,{air:.5,unblockable:1})}
   if(near(p.x,p.y)){sparks(p.x,p.y,'#8a6a48',4,'earth');if(i%2<1)S('rock',u)}},{})}}),
 // Yomi Numa : marécage (ralentit, coupe les déplacements) ; au bout de 1,2 s dedans, on s'enlise
 do_swamp:SP('Doton : Yomi Numa','Marécage 4 s : enlise (immobilise) ceux qui y sont pris, puis ralentit et bloque Espace ; y rester enlise à nouveau',10,{tele:{r:140,max:420},ai:RG(420,.6)},(u,a,td)=>{const p=atP(u,a,td,420);S('rock',u);do_S('water',u);anim(u,'summon',.6);
  field(u,p.x,p.y,{r:140,t:4,slow:1,dps:3,col:'#5a4028',vfx:'earth'});aux.push({type:'do_swamp',x:p.x,y:p.y,r:140,t:4,m:4,team:u.team,owner:u,in:{},sunk:{}});
  for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<140+e.r*.4&&(e.z||0)<10){do_hit(e,u,6,{root:.5,unblockable:1});do_puff(e.x,e.y,28,0)}
  if(near(p.x,p.y))jx({jfx:'do_splash',x:p.x,y:p.y,r:140,t:.5,m:.5})}),
 // Kyôka : carapace de roche ; à la fin, elle éclate autour de soi
 do_armor:SP('Doton : Kyôka','Corps de roche 3,5 s : 45 % de dégâts en moins, inarrêtable, plus lent ; puis éclate et repousse (selon les coups encaissés)',13,{ai:DEF},(u)=>{S('rock',u);do_S('heavy',u);anim(u,'do_flex',.7);
  u.drT=Math.max(u.drT,3.5);u.dr=.45;u.unstop=Math.max(u.unstop,3.5);u.slow=Math.max(u.slow,3.5);u.do_ar=3.5;u.do_ac=0;
  aux.push({type:'do_armor',x:u.x,y:u.y,r:0,t:3.5,m:3.5,team:u.team,owner:u,hp:u.hp,sh:u.shield||0,abs:0});
  jx({jfx:'do_harden',ui:units.indexOf(u),x:u.x,y:u.y,t:.45,m:.45});later(u,.01,()=>{if(u.auraV==='earth')u.auraV=null},{})}),
 // Main de terre : saisit au point visé (après 0,5 s) et jette les ennemis aux pieds du lanceur
 do_hand:SP('Doton : Main de terre','Une main de terre surgit au point visé (court délai), saisit les ennemis et les jette à tes pieds',10,{tele:{r:80,max:420},ai:RG(410,.6,150)},(u,a,td)=>{const p=atP(u,a,td,420);S('rock',u);anim(u,'do_grab',.9);
  aux.push({type:'do_crack',kind:'ray',x:p.x,y:p.y,a:0,n:7,len:80,r:12,t:1.4,m:1.4,team:u.team,owner:u,w:.3});
  do_prop(u,p.x,p.y-9,1.15,'do_hand',{r:16,tx:p.x+Math.cos(a),ty:p.y-9+Math.sin(a)});
  later(u,.5,()=>{let n=0;for(const e of enemies(u)){if(Math.hypot(e.x-p.x,e.y-p.y)>=80+e.r||!do_hit(e,u,14,{unblockable:1}))continue;n++;if(e.unstop>0||e.dead||u.dead)continue;
    const b=ang(u,e),tx=clamp(u.x+Math.cos(b)*56,B.x+e.r,B.x+B.w-e.r),ty=clamp(u.y+Math.sin(b)*56,B.y+e.r,B.y+B.h-e.r);
    e.dash={sx:e.x,sy:e.y,tx,ty,t:0,dur:.45,jump:80,end:()=>do_puff(e.x,e.y,30,6)};e.cast=null;e.flame=null;e.spin=null;e.stun=Math.max(e.stun,.55);say(e,'SAISI !','#e8c890')}
   do_puff(p.x,p.y,60,10);if(n&&near(p.x,p.y))do_S('heavy',u)},{x:p.x,y:p.y,r:80})}),
 // Doryû Taiga : fleuve de boue qui emporte vers l'aval (et écrase contre les murs)
 do_river:SP('Doton : Doryû Taiga','Fleuve de boue devant soi 3 s : emporte et ralentit les ennemis ; plaqués contre un mur, ils sont écrasés',11,{line:{len:430,w:110},ai:RG(250,.55)},(u,a)=>{S('rock',u);do_S('water',u);anim(u,'twohand',.6);
  aux.push({type:'do_river',x:u.x+Math.cos(a)*16,y:u.y+Math.sin(a)*16,a,len:430,w:110,r:0,t:3,m:3,team:u.team,owner:u,k:0,hs:{}});do_puff(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,40,6)}),
 // Dragon de terre : une tête de dragon sort du sol et crache 3 boulets de boue qui suivent la visée
 do_dragon:SP('Doton : Dragon de terre','Un dragon de terre crache 3 boulets de boue qui suivent ta visée : explosent, ralentissent, laissent de la boue',12,{tele:{r:58,max:440},ai:RG(440,.6,120)},(u,a,td)=>{const d=clamp(td||300,120,440),hx=u.x+Math.cos(a)*26+Math.sin(a)*38,hy=u.y+Math.sin(a)*26-Math.cos(a)*38;
  S('rock',u);do_S('roar',u);anim(u,'pray',1);
  const H=do_prop(u,hx,hy,1.3,'do_dhead',{r:18,tx:hx+Math.cos(a),ty:hy+Math.sin(a)});do_puff(hx,hy,40,8);
  seqs.push({owner:u,n:3,t:.22,iv:.3,vfx:'earth',f:o=>do_mudShot(o,H,d)})}),
 // Kajûgan : projectile de chakra qui alourdit ; plaquage au sol à la fin (ou au prochain coup Doton)
 do_weight:SP('Doton : Kajûgan','Projectile qui alourdit 2,5 s (ralenti, sans déplacement) puis plaque au sol (étourdi) ; un jutsu Doton le plaque aussitôt',11,{line:{len:540,w:24},ai:RG(520,.6)},(u,a)=>{S('rock',u);anim(u,'point',.45);jx({jfx:'do_kcast',ui:units.indexOf(u),x:u.x,y:u.y,t:.3,m:.3});
  proj(u,a,{spd:760,r:10,dmg:13,life:.72,col:'#e8d090',kind:'do_kaju',onHit:(p,e)=>do_kjMark(e,p.owner)})}),
 // Taupe : sous terre (intouchable), jaillit avec des pics qui projettent en l'air
 do_mole:SP('Doton : Taupe','Plonge sous terre (intouchable), file vers le curseur et jaillit en projetant en l\'air les ennemis proches',11,{ai:{mode:'gap',min:150,max:320,p:.4}},(u,a,td)=>{const d=clamp(td||300,100,300);S('rock',u);u.phase=Math.max(u.phase||0,.5);u.do_mo=1;anim(u,'do_dive',.5);do_puff(u.x,u.y,34,10);
  aux.push({type:'do_crack',kind:'trail',x:u.x,y:u.y,a,len:d,r:0,t:1.6,m:1.6,team:u.team,owner:u,w:.42});aux.push({type:'do_moT',x:u.x,y:u.y,r:0,t:.5,m:.5,team:u.team,owner:u});
  dash(u,a,d,.42,{end:()=>{u.do_mo=0;anim(u,'uppercut',.45);for(const e of enemies(u))if(dist(u,e)<70+e.r)do_hit(e,u,6,{air:.25,unblockable:1});
   do_prop(u,u.x,u.y,.75,'do_spear',{r:12,big:1});do_puff(u.x,u.y,60,14);if(near(u.x,u.y)){do_S('heavy',u);shake=Math.max(shake,.12)}}})}),
 // Doroku Gaeshi : bond vers le curseur ; une dalle de terre se retourne derrière soi
 do_flip:SP('Doton : Doroku Gaeshi','Bondit vers le curseur et soulève derrière soi une dalle de terre qui arrête tirs et poursuivants 2,5 s',8,{ai:ESC},(u,a)=>{const b=a+Math.PI,c={x:u.x+Math.cos(b)*28,y:u.y+Math.sin(b)*28},px=-Math.sin(a),py=Math.cos(a);S('rock',u);anim(u,'leap',.38);
  for(let i=-1;i<=1;i++)walls.push({x:c.x+px*i*27,y:c.y+py*i*27,r:16,t:2.5,team:u.team,owner:u,earth:1,vfx:'do_slab'});
  for(const e of enemies(u)){const dx=e.x-c.x,dy=e.y-c.y,s=Math.abs(dx*px+dy*py),f=dx*Math.cos(b)+dy*Math.sin(b);if(s<46+e.r&&f>-e.r&&f<70+e.r)do_hit(e,u,5,{kb:320,fx:c.x-Math.cos(b)*40,fy:c.y-Math.sin(b)*40,unblockable:1})}
  dash(u,a,210,.3,{jump:34});do_puff(c.x,c.y,44,8)}),
 // Chute de montagne : la montagne tombe (1 s), puis 18 piliers enferment la zone
 do_mountain:ULT('Doton : Chute de montagne','Une montagne s\'écrase sur la zone après 1 s (gros dégâts, étourdit), puis un cercle de rochers l\'enferme 4 s',{tele:{r:160,max:450},ai:{max:450,p:.8}},(u,a,td)=>{const p=atP(u,a,td,450);do_S('heavy',u);anim(u,'raise',1);
  jx({jfx:'do_mount',x:p.x,y:p.y,r:160,t:1,m:1});zone(u,p.x,p.y,160,55,1,{stun:1},'#a07850');lastZ().deto='do_mount';
  later(u,1,()=>{for(const e of enemies(u)){const d=Math.hypot(e.x-p.x,e.y-p.y);if(e.do_kj>0&&d<160+e.r)do_kjSlam(e);if(d>160&&d<218)do_hit(e,u,8,{kb:300,fx:p.x+(e.x-p.x)*2,fy:p.y+(e.y-p.y)*2,unblockable:1})}
   for(let i=0;i<18;i++){const b=i*Math.PI/9;walls.push({x:p.x+Math.cos(b)*188,y:p.y+Math.sin(b)*188,r:19,t:4,team:u.team,owner:u,earth:1,vfx:'do_pillar'})}
   aux.push({type:'do_crater',x:p.x,y:p.y,r:150,t:5,m:5,team:u.team,owner:u});aux.push({type:'do_crack',kind:'ray',x:p.x,y:p.y,a:0,n:12,len:130,r:70,t:5,m:5,team:u.team,owner:u,w:.15});
   if(near(p.x,p.y)){shake=Math.max(shake,.55);do_S('boom',u)}},{})}),
 // Grand séisme : coup de poing au sol, 3 ondes de plus en plus larges, puis sol fendu qui ralentit
 do_quake:ULT('Doton : Grand séisme','Frappe le sol : 3 ondes de choc projettent en l\'air et repoussent, puis le sol fendu ralentit 3 s',{tele:{self:1,r:290},ai:SELF(240,.8)},(u)=>{do_S('heavy',u);anim(u,'do_quake',.9);const o={x:u.x,y:u.y};
  [[.18,0,130,20],[.48,100,215,16],[.78,185,295,14]].forEach(([dl,r0,r1,dm],i)=>later(u,dl,()=>{
   for(const e of enemies(u)){const d=Math.hypot(e.x-o.x,e.y-o.y);if(d>r0-e.r&&d<r1+e.r){do_hit(e,u,dm,{air:.5,kb:140,fx:o.x,fy:o.y,unblockable:1});do_crushArm(e,u,.4,6,.5)}}
   aux.push({type:'do_qring',x:o.x,y:o.y,r:r1,w:r0,t:.45,m:.45,team:u.team,owner:u});
   if(!i){aux.push({type:'do_rubble',x:o.x,y:o.y,r:290,t:3.9,m:3.9,team:u.team,owner:u});aux.push({type:'do_crater',x:o.x,y:o.y,r:46,t:3.9,m:3.9,team:u.team,owner:u})}
   if(i===2)field(u,o.x,o.y,{r:290,t:3,slow:1,col:'#6a4a30',vfx:'earth'});
   if(near(o.x,o.y)){do_S(i?'rock':'boom',u);shake=Math.max(shake,.35-i*.05);jx({jfx:'shock',x:o.x,y:o.y,r:r1,t:.45,m:.45,col:'#e8c890'});if(!i)jx({jfx:'do_dust',x:o.x,y:o.y,r:60,t:.6,m:.6})}},{}))}),
});
Object.assign(NATHERO,{do:'vader'}); // référence lourde et lente (PV 185, puissance 0,74, vitesse 200) : la terre encaisse et contrôle plus qu'elle ne frappe
// ---- logique des objets (hôte)
AUXF.do_crack=AUXF.do_puddle=AUXF.do_crater=AUXF.do_qring=AUXF.do_rubble=()=>{};
// écrasement armé : tant que la cible file sur son élan, un obstacle dans sa course l'étourdit
AUXF.do_cr=x=>{const e=x.tg;if(!e||e.dead||x.done){x.t=0;return}x.x=e.x;x.y=e.y;if(Math.hypot(e.kx,e.ky)>60&&do_wallAt(e,e.kx,e.ky)){x.done=1;x.t=0;do_crush(e,x.owner,x.dmg,x.st)}};
// fin de la plongée de la Taupe (sécurité si le lanceur meurt sous terre)
AUXF.do_moT=x=>{const u=x.owner;if(x.t<=0||u.dead||!u.dash){u.do_mo=0;x.t=0;return}
 // sous terre, la traînée de chakra du bond devient des mottes de terre projetées au ras du sol
 for(let i=fx.length-1;i>=0&&i>fx.length-14;i--){const f=fx[i];if(f.m===.25&&f.t===.25&&f.r===6&&f.vx===0&&f.vy===0&&Math.abs(f.x-u.x)<30&&Math.abs(f.y-u.y)<30){f.col=rnd()<.5?'#6a4a30':'#8a6a48';f.z=6;f.r=2.4;f.vfx='earth';f.vx=(rnd()-.5)*90;f.vy=(rnd()-.5)*60}}};
// marécage : coupe le déplacement (Espace), et 1,2 s dedans = enlisé (une fois par marécage)
AUXF.do_swamp=(x,dt)=>{const end=x.t<=0;for(const e of units){if(e.team===x.team)continue;const k=units.indexOf(e);
  if(end||e.dead){if(x.in[k])e.do_sw=0;x.in[k]=0;continue}
  const inn=Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r*.4&&(e.z||0)<10;
  if(inn){if(e.unstop<=0)e.cds[2]=Math.max(e.cds[2],.15);x.in[k]=(x.in[k]||0)+dt;if(x.in[k]>=1.3&&!x.sunk[k]){x.sunk[k]=1;do_hit(e,x.owner,6,{root:.7,unblockable:1});do_puff(e.x,e.y,30,0)}}
  else if(x.in[k])x.in[k]=Math.max(0,x.in[k]-dt*2);
  if(inn||x.in[k]>0)e.do_sw=Math.min(1,(x.in[k]||0)/1.3);else if(x.in[k]===0&&e.do_sw>0&&!inn){e.do_sw=0;x.in[k]=undefined}}};
// carapace : compte les dégâts encaissés, éclate à la fin
AUXF.do_armor=x=>{const u=x.owner;if(u.dead){u.do_ar=0;x.t=0;return}x.x=u.x;x.y=u.y;const d=(x.hp-u.hp)+(x.sh-(u.shield||0));if(d>0)x.abs+=d;x.hp=u.hp;x.sh=u.shield||0;
 u.do_ar=Math.max(0,x.t);u.do_ac=Math.min(1,x.abs/50);if(x.t<=0)do_burst(u,x.abs)};
// alourdi : ralenti, sans déplacement ; une carapace inarrêtable libère du poids
AUXF.do_kj=x=>{const e=x.tg;if(!e||e.dead){if(e)e.do_kj=0;x.t=0;return}x.x=e.x;x.y=e.y;if(!(e.do_kj>0)){x.t=0;return}
 if(e.unstop>0){e.do_kj=0;x.t=0;if(e.anim&&e.anim.k==='do_heavy')e.anim=null;return}
 e.slow=Math.max(e.slow,.15);e.cds[2]=Math.max(e.cds[2],.15);if(x.t<=0)do_kjSlam(e);else e.do_kj=x.t};
// fleuve de boue : emporte vers l'aval, ralentit, petites morsures ; écrase contre un obstacle (une fois)
AUXF.do_river=(x,dt)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),L=x.len*Math.min(1,(x.m-x.t)/.3),tick=x.k<=0;if(tick)x.k=.5;
 for(const e of enemies(x.owner)){const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;if(f<-e.r||f>L+e.r||Math.abs(s)>x.w/2+e.r*.3||(e.z||0)>10)continue;
  if(e.unstop<=0){const v=150*dt;e.x+=ca*v;e.y+=sa*v;collide(e);e.slow=Math.max(e.slow,.15);const k=units.indexOf(e);if(!x.hs[k]&&do_wallAt(e,ca,sa)){x.hs[k]=1;do_crush(e,x.owner,8,.6)}}
  if(tick)do_hit(e,x.owner,2,{silent:1,nokj:1})}};
// ---- dessins au sol (sous les ninjas)
AUXD.do_cr=AUXD.do_moT=AUXD.do_armor=AUXD.do_kj=()=>{};
// fissure en zigzag (coordonnées monde), avec un liseré clair pour le relief
function do_crackLine(x0,y0,a,len,sd,w,al){if(len<4)return;const n=Math.max(3,len/20|0),ca=Math.cos(a),sa=Math.sin(a);g.beginPath();
 for(let i=0;i<=n;i++){const f=i/n*len,o=i&&i<n?(do_h(sd+i)-.5)*Math.min(26,len*.18):0,q=P(x0+ca*f-sa*o,y0+sa*f+ca*o);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}
 g.strokeStyle=rgba('#1a120a',al);g.lineWidth=w;g.stroke();g.translate(1.2,1.4);g.strokeStyle=rgba('#c8a070',al*.45);g.lineWidth=w*.4;g.stroke();g.translate(-1.2,-1.4)}
AUXD.do_crack=(x,k)=>{const sd=(x.x*3+x.y*7)|0,gr=x.w?Math.min(1,(x.m-x.t)/x.w):1,al=.8*k;g.lineCap='round';g.lineJoin='round';
 if(x.kind==='ray')for(let i=0;i<x.n;i++){const b=i*Math.PI*2/x.n+do_h(sd+i*5)*.5;do_crackLine(x.x+Math.cos(b)*x.r,x.y+Math.sin(b)*x.r,b,x.len*gr*(.55+do_h(sd+i)*.45),sd+i*9,2.6,al)}
 else if(x.kind==='trail'){const L=x.len*gr,ca=Math.cos(x.a),sa=Math.sin(x.a);do_crackLine(x.x,x.y,x.a,L,sd,5,al*.85);
  for(let i=0;i<L/22;i++){const f=i*22+8,s=(i%2?1:-1)*(7+do_h(sd+i)*5),q=P(x.x+ca*f-sa*s,x.y+sa*f+ca*s);g.fillStyle=rgba(i%3?'#6a4a30':'#8a6a48',.9*k);g.beginPath();g.ellipse(q.x,q.y,(3+do_h(i)*3)*q.s,(2+do_h(i)*1.5)*q.s,0,0,7);g.fill()}}
 else do_crackLine(x.x,x.y,x.a,x.len*gr,sd,3.2,al)};
// marécage du Yomi Numa : nappe sombre aux bords irréguliers, remous et bulles
AUXD.do_swamp=(x,k,t)=>{const q=P(x.x,x.y),R=x.r*q.s*ezo(Math.min(1,(x.m-x.t)/.3)),sd=(x.x+x.y)|0;if(R<2)return;
 g.fillStyle=rgba('#2a1c12',.86*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();
 for(let i=0;i<9;i++){const b=i*.698+do_h(sd+i)*.5,rr=R*(.14+do_h(sd+i*3)*.1);g.beginPath();g.ellipse(q.x+Math.cos(b)*R*.93,q.y+Math.sin(b)*R*K*.93,rr,rr*K,0,0,7);g.fill()}
 g.fillStyle=rgba('#140d07',.55*k);g.beginPath();g.ellipse(q.x,q.y,R*.55,R*.55*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#7a5a3a',.5*k);g.lineWidth=2;for(let i=0;i<3;i++){const rr=R*(.3+i*.2),b=t*(.5+i*.2)*(i%2?-1:1)+i*2;g.beginPath();g.ellipse(q.x,q.y,rr,rr*K,0,b,b+2.1);g.stroke()}
 g.lineWidth=1.3;for(let i=0;i<7;i++){const ph=(t*.8+do_h(sd+i*7))%1,b=do_h(sd+i)*7,d=R*.8*do_h(sd+i*2+1),bx=q.x+Math.cos(b)*d,by=q.y+Math.sin(b)*d*K;g.strokeStyle=rgba('#a8845a',.8*k*(ph<.8?1:(1-ph)*5));
  if(ph<.8){g.beginPath();g.arc(bx,by,(1.5+ph*4.5)*q.s,Math.PI,0);g.stroke()}else{const rr=(ph-.8)*40*q.s;g.beginPath();g.ellipse(bx,by,rr,rr*K,0,0,7);g.stroke()}}
 g.strokeStyle=rgba('#a07850',.55*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke()};
// fleuve de boue : coulée brune, courant clair qui file vers l'aval, galets emportés, écume des berges
AUXD.do_river=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),L=x.len*Math.min(1,(x.m-x.t)/.3),W=x.w/2,pt=(f,s)=>P(x.x+ca*f-sa*s,x.y+sa*f+ca*s);if(L<5)return;
 poly([pt(0,-W*.55),pt(L*.12,-W),pt(L,-W*.92),pt(L+22,0),pt(L,W*.92),pt(L*.12,W),pt(0,W*.55)],rgba('#4a3220',.82*k));
 poly([pt(4,-W*.3),pt(L*.15,-W*.62),pt(L,-W*.55),pt(L+8,0),pt(L,W*.55),pt(L*.15,W*.62),pt(4,W*.3)],rgba('#6a4a2c',.6*k));
 g.strokeStyle=rgba('#d8b888',.6*k);g.lineWidth=2;g.lineCap='round';for(let i=0;i<14;i++){const f=(t*180+i*71)%L,s=(do_h(i*7)-.5)*(x.w-24),a=pt(f,s),b=pt(Math.min(L,f+26),s+Math.sin(t*4+i)*3);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()}
 for(let i=0;i<7;i++){const f=(t*160+i*97)%L,s=(do_h(i*13)-.5)*(x.w-30),q=pt(f,s);g.fillStyle=rgba(i%2?'#9a7650':'#2e1e12',.9*k);g.beginPath();g.ellipse(q.x,q.y,3.5*q.s,2.2*q.s,0,0,7);g.fill()}
 g.strokeStyle=rgba('#9a7650',.65*k);g.lineWidth=2.5;for(const sg of[-1,1]){g.beginPath();for(let i=0;i<=8;i++){const q=pt(L*.1+i*L*.9/8,sg*(W*.95+Math.sin(t*5+i*1.7)*3));i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke()}};
// flaque de boue des boulets (embrasée si le boulet a traversé un feu allié)
AUXD.do_puddle=(x,k,t)=>{const q=P(x.x,x.y),R=x.r*q.s*ezo(Math.min(1,(x.m-x.t)/.15));if(R<1)return;g.fillStyle=rgba('#2e2016',.8*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();
 for(let i=0;i<5;i++){const b=i*1.26+x.x*.05;g.beginPath();g.ellipse(q.x+Math.cos(b)*R*.88,q.y+Math.sin(b)*R*K*.88,R*.24,R*.24*K,0,0,7);g.fill()}
 g.fillStyle=rgba('#8a6a48',.55*k);g.beginPath();g.ellipse(q.x-R*.25,q.y-R*.12*K,R*.32,R*.1,0,0,7);g.fill();
 if(x.kind==='fire'){g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const b=i*1.6+t,fx=q.x+Math.cos(b)*R*.5,fy=q.y+Math.sin(b)*R*K*.5,h=(7+Math.sin(t*9+i)*3)*q.s;g.fillStyle=rgba(i%2?'#ffb03a':'#ff5a1a',.75*k);g.beginPath();g.moveTo(fx-3*q.s,fy);g.quadraticCurveTo(fx,fy-h*2,fx+3*q.s,fy);g.fill()}}};
// cratère : cuvette sombre, rebord éclairé, gravats
AUXD.do_crater=(x,k)=>{const q=P(x.x,x.y),R=x.r*q.s,sd=(x.x+x.y)|0;g.fillStyle=rgba('#20150c',.42*k);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();
 g.strokeStyle=rgba('#b08a5a',.55*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,Math.PI*1.08,Math.PI*1.92);g.stroke();
 g.strokeStyle=rgba('#140c06',.55*k);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y,R*.97,R*K*.97,0,.15,Math.PI-.15);g.stroke();
 for(let i=0;i<8;i++){const b=do_h(sd+i)*7,d=R*(.25+do_h(sd+i*3)*.7);g.fillStyle=rgba(i%2?'#6a4a30':'#9a7650',.95*k);g.beginPath();g.ellipse(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K,(2.5+do_h(i+sd)*3.5)*q.s,(1.6+do_h(i+sd)*2)*q.s,0,0,7);g.fill()}};
// onde du séisme : un anneau de dalles qui se soulèvent en s'éloignant
AUXD.do_qring=(x,k)=>{const e=1-x.t/x.m,rr=lerp(x.w,x.r,ezo(e)),h=Math.sin(Math.PI*Math.min(1,e*1.15))*32,n=Math.max(10,rr/15|0);
 g.strokeStyle=rgba('#e8d0a0',.55*(1-e));g.lineWidth=4;gEll(x.x,x.y,rr);g.stroke();
 for(let j=0;j<n;j++){const i=j%2?n-1-(j>>1):j>>1,b=-Math.PI/2+(i/n)*Math.PI*2,q=P(x.x+Math.cos(b)*rr,x.y+Math.sin(b)*rr),H=h*q.s*(.65+do_h(i+x.r)*.6),W=7.5*q.s;if(H<1)continue;
  g.fillStyle='#6a4a30';g.strokeStyle='#22160c';g.lineWidth=1.2;g.beginPath();g.moveTo(q.x-W,q.y);g.lineTo(q.x-W*.3,q.y-H);g.lineTo(q.x+W*.5,q.y-H*.8);g.lineTo(q.x+W,q.y);g.closePath();g.fill();g.stroke();
  g.fillStyle='#a8845a';g.beginPath();g.moveTo(q.x-W*.3,q.y-H);g.lineTo(q.x+W*.5,q.y-H*.8);g.lineTo(q.x+W*.1,q.y-H*.35);g.closePath();g.fill()}};
// sol fendu après le séisme : fissures rayonnantes et cailloux
AUXD.do_rubble=(x,k)=>{const sd=(x.x+x.y)|0,gr=Math.min(1,(x.m-x.t)/.5);g.lineCap='round';g.lineJoin='round';
 for(let i=0;i<12;i++){const b=i*.5236+do_h(sd+i)*.3;do_crackLine(x.x+Math.cos(b)*34,x.y+Math.sin(b)*34,b,x.r*gr*(.55+do_h(sd+i*3)*.4),sd+i*11,2.6,.7*k)}
 for(let i=0;i<14;i++){const b=do_h(sd+i*5)*7,d=x.r*(.2+do_h(sd+i*9)*.75)*gr,q=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d);g.fillStyle=rgba(i%2?'#6a4a30':'#9a7650',.9*k);g.beginPath();g.ellipse(q.x,q.y,(2.5+do_h(i)*3)*q.s,(1.6+do_h(i)*1.5)*q.s,0,0,7);g.fill()}};
// ---- projectiles et décors à leur profondeur
// rocher qui roule au ras du sol, facettes éclairées
PROJD.do_boulder=(p,R,ra,t)=>{R*=1.12;g.translate(0,28-R*.85);const c=Math.cos(ra),s=Math.sin(ra);for(let i=1;i<4;i++){g.fillStyle=rgba('#b8a080',.32-i*.07);g.beginPath();g.ellipse(-c*R*(.9+i*.9),R*.75-s*R*.5*i,R*(.55+i*.18),R*(.3+i*.08),0,0,7);g.fill()}g.rotate(p.rot*1.3*(c<0?-1:1));
 g.fillStyle='#5e4229';g.strokeStyle='#22160c';g.lineWidth=1.8;g.beginPath();for(let i=0;i<8;i++){const b=i*.785,L=R*(.92+((i*5)%3)*.06);g.lineTo(Math.cos(b)*L,Math.sin(b)*L)}g.closePath();g.fill();g.stroke();
 do_sh([[-R*.7,-R*.35],[-R*.15,-R*.82],[R*.5,-R*.55],[R*.2,-R*.05],[-R*.35,0]],'#8a6a48');do_sh([[-R*.45,-R*.45],[-R*.1,-R*.7],[R*.15,-R*.45]],'#b08a5a');
 g.strokeStyle='rgba(34,22,12,.75)';g.lineWidth=1.2;g.beginPath();g.moveTo(-R*.1,R*.15);g.lineTo(R*.35,R*.55);g.moveTo(R*.2,-R*.05);g.lineTo(R*.6,R*.15);g.stroke()};
// cube de chakra (Kajûgan) : hexagone + 3 arêtes, vu en 3/4
function do_cube(x,y,s,rot,col,ol){const pts=[];for(let i=0;i<6;i++){const b=rot+i*Math.PI/3+Math.PI/6;pts.push([x+Math.cos(b)*s,y+Math.sin(b)*s*.88])}
 g.lineJoin='round';g.beginPath();pts.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();if(ol){g.strokeStyle='rgba(58,40,12,.85)';g.lineWidth=4.5;g.stroke()}g.fillStyle=rgba(col,ol?.5:.32);g.fill();
 // face du dessus plus claire
 g.fillStyle=rgba('#fff8e0',ol?.35:.2);g.beginPath();g.moveTo(x,y);g.lineTo(...pts[5]);g.lineTo(...pts[4]);g.lineTo(...pts[3]);g.closePath();g.fill();
 g.strokeStyle='rgba(255,248,224,.95)';g.lineWidth=1.8;g.beginPath();pts.forEach(([a,b],i)=>i?g.lineTo(a,b):g.moveTo(a,b));g.closePath();for(const i of[1,3,5]){g.moveTo(x,y);g.lineTo(pts[i][0],pts[i][1])}g.stroke()}
// Kyôka : la peau devient roche (silhouette 3D du ninja recolorée en pierre, grain et fissures)
let do_tc=null;
function do_stone(u,p,S,f){const tl=typeof N3!=='undefined'&&N3.ok&&N3.tile.get(u);
 // sans 3D (ordinateur lent) : voile de pierre sur le corps du dessin 2D
 if(!tl){const sk=u.ch.look.scale||1;g.save();g.globalAlpha=f*.42;g.fillStyle='#7a6a58';g.beginPath();g.ellipse(p.x,p.y-20*S*sk,11*S*sk,17*S*sk,0,0,7);g.fill();g.globalAlpha=f*.25;g.beginPath();g.ellipse(p.x,p.y-44*S*sk,13*S*sk,12*S*sk,0,0,7);g.fill();g.restore();return}if(!do_tc)do_tc=document.createElement('canvas');const c=do_tc;if(c.width!==TPW||c.height!==TPH){c.width=TPW;c.height=TPH}const x=c.getContext('2d');
 x.globalCompositeOperation='copy';x.drawImage(N3.cv,tl.sx,tl.sy,TPW,TPH,0,0,TPW,TPH);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(118,100,82,.74)';x.fillRect(0,0,TPW,TPH);
 x.fillStyle='rgba(176,150,120,.45)';x.fillRect(0,0,TPW*.42,TPH);x.fillStyle='rgba(54,40,28,.55)';for(let i=0;i<30;i++)x.fillRect(do_h(i*3)*TPW,do_h(i*7+1)*TPH,3,2);
 x.strokeStyle='rgba(36,26,16,.8)';x.lineWidth=2;x.beginPath();for(let i=0;i<6;i++){const a=(.3+do_h(i*11)*.4)*TPW,b=(.25+do_h(i*13)*.55)*TPH;x.moveTo(a,b);x.lineTo(a+7,b+9);x.lineTo(a+2,b+19)}x.stroke();x.globalCompositeOperation='source-over';
 const sk=u.ch.look.scale||1,w=TWU*S*sk,h=THU*S*sk;g.save();g.globalAlpha=f;g.drawImage(c,p.x-w/2,p.y-h+FOOT*S*sk,w,h);g.restore()}
PROJD.do_kaju=(p,R,ra,t)=>{g.globalCompositeOperation='lighter';circ(0,0,R*1.7,rgba('#f0d890',.28));g.strokeStyle=rgba('#f0d890',.55);g.lineWidth=2;const c=Math.cos(ra),s=Math.sin(ra);
 g.beginPath();for(const o of[-4,4]){g.moveTo(-c*R*1.2-s*o,-s*R*1.2+c*o);g.lineTo(-c*R*3.4-s*o*.6,-s*R*3.4+c*o*.6)}g.stroke();g.globalCompositeOperation='source-over';do_cube(0,0,R*1.15,t/160,'#f6e6b0')};
// boulet de boue (en cloche) avec ses gouttes
PROJD.do_mudball=(p,R,ra)=>{for(let i=3;i>0;i--)circ(-Math.cos(ra)*R*(1+i*.55),-Math.sin(ra)*R*(1+i*.55)+i*2,R*(.5-i*.1),rgba('#3a2616',.8));
 circ(0,0,R*1.25,'#22160c');circ(-R*.15,-R*.12,R*1.08,'#4a3220');circ(-R*.38,-R*.42,R*.38,'#8a6a48');circ(R*.4,R*.3,R*.22,'#2e1e12')};
// bouquet de pics de terre (Doryûsô, sortie de la Taupe) : jaillit, tient, se rétracte
PROJD.do_spear=(p,R,ra,t)=>{do_gnd(p);const e=1-p.life/p.life0,h=e<.16?ezo(e/.16):e>.72?Math.max(0,1-(e-.72)/.28):1,sd=(p.x*3+p.y*7)|0,bg=p.big?1.35:1;if(h<=0)return;
 for(const i of[3,4,0,2,1]){const [ox,hh,w,ln]=[[-12,.62,6,-.24],[0,1,8,.04],[12,.7,6,.26],[-5,.42,5,-.1],[6,.48,5,.14]][i],H=(36+do_h(sd+i)*24)*hh*h*bg,bx=ox*bg,tip=bx+ln*H;
  do_sh([[bx-w,0],[tip,-H],[bx+w,0]],'#6a4a30',1.4);do_sh([[bx-w*.15,0],[tip,-H],[bx+w*.85,0]],'#a8845a')}
 g.fillStyle='#4a3424';for(let i=0;i<4;i++){g.beginPath();g.ellipse((i-1.5)*9*bg,2,4,2.2,0,0,7);g.fill()}};
// main de terre géante : sort du sol doigts ouverts, se referme (saisie) puis s'effrite
PROJD.do_hand=(p,R,ra,t)=>{do_gnd(p);const el=p.life0-p.life,rise=ezo(Math.min(1,el/.32)),cl=Math.min(1,Math.max(0,(el-.42)/.12)),sk=Math.min(1,Math.max(0,(el-.78)/.37)),dir=p.tx>=p.x?1:-1,H=84;
 g.save();g.beginPath();g.rect(-110,-200,220,200);g.clip();g.translate(0,(1-rise)*H+sk*H*.9);g.scale(dir,1);g.lineJoin='round';g.lineCap='round';
 do_sh([[-20,6],[-16,-46],[16,-50],[22,6]],'#5e4229',2.4);do_sh([[3,6],[5,-48],[14,-50],[20,6]],'#8a6a48');
 g.fillStyle='#6a4a30';g.strokeStyle='#22160c';g.lineWidth=2.4;g.beginPath();g.ellipse(0,-60,21,16,0,0,7);g.fill();g.stroke();
 const fing=(x0,y0,b,L1,b2,L2)=>{const jx=x0+Math.cos(b)*L1,jy=y0+Math.sin(b)*L1,ex=jx+Math.cos(b2)*L2,ey=jy+Math.sin(b2)*L2;for(const [c,w] of[['#22160c',11],['#7a5a3a',7]]){g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(jx,jy);g.lineTo(ex,ey);g.stroke()}};
 for(let i=0;i<4;i++){const b=-1.57+(i-1.5)*.34*(1-cl);fing(-13+i*8.7,-70,b,17-cl*5,b+cl*2.5,15-cl*3)}
 fing(-17,-60,-2.5+cl*1.4,14,-2.5+cl*3,11);
 g.fillStyle='#a8845a';g.beginPath();g.ellipse(-4,-64,8,4,-.3,0,7);g.fill();g.restore();
 if(sk>0)for(let i=0;i<6;i++){const x=(do_h(i)-.5)*56,y=-80*(1-sk)+sk*sk*10*i-do_h(i+9)*30;g.fillStyle=i%2?'#6a4a30':'#8a6a48';g.fillRect(x,Math.min(0,y),5,5)}
 g.fillStyle='#4a3424';for(let i=0;i<4;i++){g.beginPath();g.ellipse((i-1.5)*14,4,7,3.2,0,0,7);g.fill()}};
// tête de dragon de terre : sort du sol, tourne vers la visée, ouvre la gueule à chaque crachat
PROJD.do_dhead=(p,R,ra,t)=>{do_gnd(p);const el=p.life0-p.life,rise=ezo(Math.min(1,el/.22)),sk=Math.min(1,Math.max(0,(el-p.life0+.28)/.28)),dir=p.tx>=p.x?1:-1;
 let op=0;for(const ts of[.22,.52,.82])op=Math.max(op,bump((el-ts+.06)/.22));const ja=op*.6,jc=Math.cos(ja),js=Math.sin(ja);
 g.save();g.beginPath();g.rect(-130,-220,260,220);g.clip();g.translate(0,(1-rise+sk)*112);g.scale(dir,1);g.lineJoin='round';
 do_sh([[-28,6],[-24,-36],[-12,-60],[8,-66],[20,-42],[22,6]],'#5e4229',2.4);do_sh([[2,6],[6,-40],[12,-58],[18,-42],[20,6]],'#8a6a48');
 for(let i=0;i<3;i++){const y=-12-i*16;do_sh([[-24+i*4,y],[-38+i*4,y-8],[-22+i*4,y-13]],'#4a3424',1.6)}
 if(op>.05)do_sh([[10,-58],[46,-60],[8+jc*44-js*8,-58+js*44+jc*8]],'#2a1208');
 g.save();g.translate(8,-58);g.rotate(ja);do_sh([[0,0],[40,3],[44,8],[32,13],[4,9]],'#5e4229',2.2);g.fillStyle='#f2ead8';for(let i=0;i<3;i++){g.beginPath();g.moveTo(14+i*9,3);g.lineTo(17+i*9,-3);g.lineTo(20+i*9,3);g.fill()}g.restore();
 do_sh([[-14,-60],[-8,-78],[10,-86],[28,-80],[46,-70],[54,-62],[48,-58],[26,-60],[8,-56]],'#6a4a30',2.4);do_sh([[-6,-76],[10,-84],[28,-78],[20,-72],[2,-70]],'#9a7650');
 g.fillStyle='#f2ead8';for(let i=0;i<3;i++){g.beginPath();g.moveTo(26+i*8,-60);g.lineTo(29+i*8,-54);g.lineTo(32+i*8,-60);g.fill()}
 do_sh([[-8,-74],[-30,-98],[-2,-70]],'#4a3424',2);do_sh([[0,-80],[-14,-104],[8,-80]],'#5e4229',2);
 g.fillStyle='#ffcf5a';g.beginPath();g.ellipse(22,-72,4.6,2.7,-.2,0,7);g.fill();g.fillStyle='#2a1208';g.fillRect(21.2,-74.4,1.6,4.6);
 g.restore();g.fillStyle='#4a3424';for(let i=0;i<5;i++){g.beginPath();g.ellipse((i-2)*12,3,6,3,0,0,7);g.fill()}};
PROJD.mud=PROJD.do_mudball; // ancien nom
// ---- effets (par-dessus la scène)
// montagne qui tombe du ciel, son ombre grandit au sol
JFXD.do_mount=(f,k,e)=>{const q=P(f.x,f.y,0),fl=Math.pow(Math.min(1,e*1.04),1.7),R=f.r*q.s*(.62+.38*fl),cy=q.y-(1-fl)*330*q.s,cx=q.x+(1-fl)*40*q.s;
 g.fillStyle=rgba('#000000',.14+.4*fl);g.beginPath();g.ellipse(q.x,q.y,f.r*q.s*(.3+.7*fl),f.r*q.s*K*(.3+.7*fl),0,0,7);g.fill();if(fl>=1)return;
 g.strokeStyle='rgba(240,225,200,.35)';g.lineWidth=3*q.s;g.beginPath();for(let i=0;i<4;i++){const x=cx+(i-1.5)*R*.45;g.moveTo(x,cy-R*1.55);g.lineTo(x+R*.1,cy-R*1.55-140*q.s*(1-fl))}g.stroke();
 const pt=(x,y)=>[cx+x*R,cy+y*R];g.lineJoin='round';
 do_sh([[-1.05,0],[-.8,-.55],[-.55,-.8],[-.3,-1.25],[-.05,-1.05],[.2,-1.5],[.45,-1.15],[.7,-.95],[.95,-.45],[1.05,0],[.6,.22],[0,.3],[-.6,.2]].map(([x,y])=>pt(x,y)),'#5a4028',3);
 do_sh([[-.3,-1.25],[-.05,-1.05],[.2,-1.5],[.45,-1.15],[.7,-.95],[.95,-.45],[1.05,0],[.6,.22],[.1,.05],[-.05,-.6]].map(([x,y])=>pt(x,y)),'#8a6a48');
 do_sh([[.08,-1.36],[.2,-1.5],[.34,-1.32],[.24,-1.36],[.18,-1.3]].map(([x,y])=>pt(x,y)),'#eee6dc');do_sh([[-.38,-1.13],[-.3,-1.25],[-.18,-1.14]].map(([x,y])=>pt(x,y)),'#eee6dc');
 g.strokeStyle='rgba(34,22,12,.55)';g.lineWidth=2;g.beginPath();g.moveTo(...pt(-.8,-.3));g.lineTo(...pt(-.2,-.45));g.lineTo(...pt(.5,-.35));g.moveTo(...pt(-.6,.05));g.lineTo(...pt(.3,-.05));g.stroke()};
JFXD.mountain=JFXD.do_mount; // ancien nom
// nuage de poussière qui s'étale et retombe
JFXD.do_dust=(f,k,e)=>{const q=P(f.x,f.y,0);for(let i=0;i<8;i++){const b=i*.785+f.x*.01,d=f.r*(.35+e*.75)*q.s,rr=(f.r*.22+e*f.r*.25)*q.s;g.fillStyle=rgba(i%2?'#b8a080':'#9a8264',.5*k);g.beginPath();g.ellipse(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-e*18*q.s,rr,rr*.7,0,0,7);g.fill()}};
// éclaboussure de boue (marécage, boulets)
JFXD.do_splash=(f,k,e)=>{const q=P(f.x,f.y,0);for(let i=0;i<10;i++){const b=i*.628+f.x*.013,d=f.r*(.25+e*.7)*q.s,hh=Math.sin(Math.PI*Math.min(1,e*1.2))*26*q.s*(.6+(i%3)*.25);circ(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-hh,(3.2+(i%3))*q.s*(1-e*.4),f.fire&&i%2?'#ff8a2a':i%2?'#3a2616':'#6a4a30')}
 g.strokeStyle=rgba('#7a5a3a',.7*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,f.r*e*q.s,f.r*e*q.s*K,0,0,7);g.stroke()};
// Kyôka : des éclats de roche convergent sur le corps
JFXD.do_harden=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x,u.y,30);for(let i=0;i<10;i++){const b=i*.628,d=((1-ezo(e))*70+8)*q.s;g.save();g.translate(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.8);g.rotate(b+e*4);g.fillStyle=i%2?'#7a5a3a':'#a07850';g.beginPath();g.moveTo(-5*q.s,-3*q.s);g.lineTo(5*q.s,-2*q.s);g.lineTo(2*q.s,4*q.s);g.closePath();g.fill();g.restore()}
 g.strokeStyle=rgba('#e8d0a0',.8*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y+22*q.s,(20+e*30)*q.s,(20+e*30)*q.s*K,0,0,7);g.stroke()};
// Kyôka : la carapace vole en éclats
JFXD.do_shatter=(f,k,e)=>{const q=P(f.x,f.y,28);for(let i=0;i<12;i++){const b=i*.524+.2,d=(10+ezo(e)*f.r)*q.s;g.save();g.translate(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.75-Math.sin(Math.PI*e)*20*q.s);g.rotate(b+e*6);g.fillStyle=i%2?'#7a5a3a':'#a8845a';g.strokeStyle='#22160c';g.lineWidth=1;g.beginPath();g.moveTo(-6*q.s,-3*q.s);g.lineTo(6*q.s,-1*q.s);g.lineTo(0,5*q.s);g.closePath();g.fill();g.stroke();g.restore()}
 g.strokeStyle=rgba('#e8d0a0',.8*k);g.lineWidth=4*k+1;gEll(f.x,f.y,f.r*(.3+.7*e));g.stroke()};
// Kajûgan : un cube de poids naît au bout du doigt
JFXD.do_kcast=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x+Math.cos(u.aim)*22,u.y+Math.sin(u.aim)*22,34);g.globalAlpha=k;do_cube(q.x,q.y,(5+e*13)*q.s,e*2,'#f6e6b0',1);g.globalAlpha=1};
// Kajûgan : le cube de poids s'abat sur la cible
JFXD.do_slam=(f,k,e)=>{const q=P(f.x,f.y,0),s=24*q.s*(1+e*.4),cy=q.y-(1-Math.min(1,e*4))*70*q.s-s*.5;g.globalAlpha=k;do_cube(q.x,cy,s,0,'#f6e6b0');g.globalAlpha=1;g.strokeStyle=rgba('#fff4c8',.8*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,(20+e*50)*q.s,(20+e*50)*q.s*K,0,0,7);g.stroke()};
// impacts lourds
DETO.do_mount=(x,y,r)=>{jx({jfx:'do_dust',x,y,r:r*1.15,t:1,m:1});jx({jfx:'shock',x,y,r:r*1.7,t:.7,m:.7,col:'#c8a070'});jx({jfx:'shock',x,y,r:r*1.2,t:.5,m:.5,col:'#e8d8b8'});jx({jfx:'spikes',x,y,r,t:1.1,m:1.1,bone:0});sparks(x,y,'#8a6a48',22,'earth')};
DETO.mountain=(x,y,r)=>{jx({jfx:'spikes',x,y,r,t:1.2,m:1.2,bone:0});jx({jfx:'shock',x,y,r:r*1.5,t:.6,m:.6});jx({jfx:'do_dust',x,y,r,t:.7,m:.7})};
// ---- états visibles sur les ninjas
function do_plate(x,y,s){do_sh([[x-s,y],[x-s*.5,y-s*.75],[x+s*.6,y-s*.6],[x+s,y+s*.15],[x+s*.1,y+s*.7]],'#6e5034',1.2);do_sh([[x-s*.5,y-s*.75],[x+s*.6,y-s*.6],[x+s*.1,y-s*.1]],'#a8845a')}
STATD.push((u,p,S,sk)=>{const t=performance.now()/1000;
 // Kajûgan : cube de chakra qui pèse au-dessus de la tête, lignes de pression
 if(u.do_kj>0){const k=Math.min(1,u.do_kj/2.5),s=(15+7*(1-k))*S,cy=p.y-(66+16*k)*S*sk;g.save();
  g.strokeStyle='rgba(255,226,150,.9)';g.lineWidth=3;g.beginPath();g.ellipse(p.x,p.y,24*S,24*S*K,0,-Math.PI/2,-Math.PI/2+Math.PI*2*k);g.stroke(); // compte à rebours
  g.globalAlpha=.5;g.strokeStyle='#fff4c8';g.lineWidth=1.6;g.beginPath();for(const z of[-1,1]){g.moveTo(p.x+z*s*.75,cy+s*.55);g.lineTo(p.x+z*9*S,p.y-46*S*sk)}g.stroke();g.globalAlpha=1;
  do_cube(p.x,cy,s,0,'#f0c860',1);g.strokeStyle='rgba(70,46,12,.9)';g.lineWidth=2.4;g.beginPath();g.moveTo(p.x-4*S,cy+2*S);g.lineTo(p.x,cy+6*S);g.lineTo(p.x+4*S,cy+2*S);g.stroke();g.restore()}
 // Kyôka : peau de pierre, épaulières, fissures lumineuses qui gagnent avec les coups encaissés
 if(u.do_ar>0){const f=Math.min(1,u.do_ar*3),sp=Math.abs(Math.sin(u.aim||0)),w=(4+6*sp)*S*sk,c=u.do_ac||0;do_stone(u,p,S,f);g.save();g.globalAlpha=f;
  for(const z of[-1,1])do_plate(p.x+z*w,p.y-38*S*sk,6.5*S*sk);
  g.strokeStyle=`rgba(255,${200+c*40|0},120,${.5+c*.5})`;g.lineWidth=1.3;g.beginPath();for(let i=0;i<1+Math.round(c*6);i++){const x=p.x+(do_h(i*3)-.5)*20*S,y=p.y-(12+do_h(i*7)*36)*S*sk;g.moveTo(x,y);g.lineTo(x+4*S,y+5*S);g.lineTo(x+1*S,y+10*S)}g.stroke();g.restore()}
 // entrave de terre : gangue de roche autour des pieds
 if(u.root>0&&u.rootV==='earth'){const R=17*S;g.fillStyle='#3a2818';g.beginPath();g.ellipse(p.x,p.y,R*1.2,R*.5,0,0,7);g.fill();
  for(let i=0;i<6;i++){const b=i*1.05+.3,x=p.x+Math.cos(b)*R*.95,y=p.y+Math.sin(b)*R*.38,h=(8+do_h(i)*6)*S;do_sh([[x-4*S,y],[x-1*S,y-h],[x+4*S,y-h*.4],[x+4*S,y]],i%2?'#6a4a30':'#8a6a48',1)}}
 // Yomi Numa : la boue monte le long des jambes
 else if(u.do_sw>0){const h=u.do_sw,R=18*S,top=p.y-h*22*S;g.fillStyle='rgba(42,28,18,.92)';g.beginPath();g.ellipse(p.x,p.y,R*1.25,R*.5,0,0,7);g.fill();
  g.beginPath();g.moveTo(p.x-R*.8,p.y);g.quadraticCurveTo(p.x-R*.9,top,p.x-R*.3,top+2*S);g.quadraticCurveTo(p.x,top-3*S,p.x+R*.35,top+1*S);g.quadraticCurveTo(p.x+R*.95,top,p.x+R*.8,p.y);g.closePath();g.fill();
  const ph=(t*1.5)%1;g.strokeStyle=`rgba(168,132,90,${.8*(1-ph)})`;g.lineWidth=1.2;g.beginPath();g.arc(p.x+R*.3,top+2*S,(1+ph*3)*S,Math.PI,0);g.stroke()}
 // Taupe : monticule de terre qui file, mottes projetées
 if(u.do_mo>0){const R=30*S,x=p.x+Math.cos(u.aim||0)*12*S,y=p.y+Math.sin(u.aim||0)*4*S;g.fillStyle='#5a4028';g.strokeStyle='#22160c';g.lineWidth=1.6;g.beginPath();g.moveTo(x-R,y+3*S);g.quadraticCurveTo(x-R*.65,y-27*S,x,y-30*S);g.quadraticCurveTo(x+R*.65,y-27*S,x+R,y+3*S);g.closePath();g.fill();g.stroke();
  g.fillStyle='#8a6a48';g.beginPath();g.ellipse(x-R*.2,y-20*S,R*.36,6*S,-.2,0,7);g.fill();
  for(let i=0;i<5;i++){const ph=(t*3+i/5)%1,cx=x+(i-2)*10*S+(do_h(i)-.5)*6*S,cy=y-24*S-Math.sin(Math.PI*ph)*24*S;g.fillStyle=i%2?'#6a4a30':'#4a3424';g.fillRect(cx-2*S,cy-2*S,4*S,4*S)}}});
// ---- murs du Doton (dessinés à leur profondeur à la place du mur de terre générique)
// un bloc de mur en volume : orienté d'après ses voisins (même mur), flanc tourné vers la caméra, dessus, bouts libres visibles
function do_wallSeg(w,H,cTop,cSide,cEnd,p){let n1=null,n2=null;for(const q of walls)if(q!==w&&q.vfx===w.vfx&&q.team===w.team&&Math.abs(q.x-w.x)<34&&Math.abs(q.y-w.y)<34&&Math.hypot(q.x-w.x,q.y-w.y)<34){if(!n1)n1=q;else if(!n2)n2=q}
 let dx=1,dy=0;if(n1&&n2){dx=n2.x-n1.x;dy=n2.y-n1.y}else if(n1){dx=n1.x-w.x;dy=n1.y-w.y}const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;let nx=-dy,ny=dx;if(ny<0||(ny===0&&nx<0)){nx=-nx;ny=-ny}
 const hl=n1?14:w.r*1.05,hw=w.r*.95,c=(a,b,z)=>P(w.x+dx*a+nx*b,w.y+dy*a+ny*b,z),V={dx,dy,nx,ny,hl,hw,c};
 {const o=4*p.s,q=[c(-hl,-hw,0),c(hl,-hw,0),c(hl,hw,0),c(-hl,hw,0)].map(z=>({x:z.x+o,y:z.y+o}));poly(q,'rgba(0,0,0,.24)')}
 do_box(V,hl,hw,0,H,cTop,cSide,cEnd,[n1,n2],w);return V}
// pavé (de z0 à z1) dans le repère d'un bloc : flanc avant, bouts libres tournés vers la caméra, dessus avec arête arrière sombre
function do_box(V,hl,hw,z0,z1,cTop,cSide,cEnd,nb,w){const c=V.c;
 poly([c(-hl,hw,z0),c(hl,hw,z0),c(hl,hw,z1),c(-hl,hw,z1)],cSide);
 for(const s of[-1,1]){const ex=V.dx*s,ey=V.dy*s;if(ey<=.05)continue;if(nb&&nb.some(q=>q&&(q.x-w.x)*ex+(q.y-w.y)*ey>0))continue;poly([c(s*hl,-hw,z0),c(s*hl,hw,z0),c(s*hl,hw,z1),c(s*hl,-hw,z1)],cEnd)}
 const t0=c(-hl,hw,z1),t1=c(hl,hw,z1),u1=c(hl,-hw,z1),u0=c(-hl,-hw,z1);poly([t0,t1,u1,u0],cTop);
 g.strokeStyle='#22160c';g.lineWidth=1.5;g.beginPath();g.moveTo(u0.x,u0.y);g.lineTo(u1.x,u1.y);g.stroke();g.strokeStyle='rgba(255,236,200,.35)';g.lineWidth=1.2;g.beginPath();g.moveTo(t0.x,t0.y);g.lineTo(t1.x,t1.y);g.stroke()}
const DO_WT={do_wall:4,do_pillar:4,do_slab:2.5}; // durée totale de chaque type (âge = durée − temps restant)
const DO_WD={
 // Doryûheki : rempart de terre en vrai volume (flanc, dessus, bouts) qui jaillit du sol ; un créneau de roche sur un bloc sur trois
 do_wall:(w,p,a)=>{const rise=ezo(Math.min(1,a/.2)),end=Math.min(1,w.t/.35),H=58*rise*end,sd=Math.abs((w.x*7+w.y*13)|0);if(H<1)return;
  const V=do_wallSeg(w,H,'#a07850','#5e4229','#4a3220',p);
  g.strokeStyle='rgba(30,20,10,.55)';g.lineWidth=1.3;g.beginPath();for(const k of[.42,.74]){const q0=V.c(-V.hl,V.hw,H*k),q1=V.c(V.hl,V.hw,H*k);g.moveTo(q0.x,q0.y);g.lineTo(q1.x,q1.y)}g.stroke();
  if(V.ny>.2&&sd%2){const q=V.c((do_h(sd)-.5)*V.hl,V.hw,H*.6);g.beginPath();g.moveTo(q.x,q.y-6*q.s);g.lineTo(q.x+3*q.s,q.y);g.lineTo(q.x-1*q.s,q.y+7*q.s);g.stroke()}
  if(sd%3===0){const mh=11*rise;do_box(V,V.hl*.45,V.hw*.75,H,H+mh,'#b08a5a','#6e5034','#5a3e26')}
  if(a<.35){g.fillStyle=rgba('#b8a080',.6*(1-a/.35));for(let i=0;i<3;i++){g.beginPath();g.ellipse(p.x+(i-1)*14*p.s,p.y-(a*40+i*3)*p.s,(8+a*30)*p.s,(4+a*12)*p.s,0,0,7);g.fill()}}},
 // pilier de roche déchiquetée (cercle de la Chute de montagne)
 do_pillar:(w,p,a)=>{const rise=ezo(Math.min(1,a/.18)),end=Math.min(1,w.t/.4),sd=Math.abs((w.x*3+w.y*5)|0),H=(66+sd%22)*p.s*rise*end,rx=w.r*p.s*1.05,l=sd%2?-.12:.1;if(H<1)return;
  g.fillStyle='rgba(0,0,0,.32)';g.beginPath();g.ellipse(p.x+4*p.s,p.y+2*p.s,rx*1.3,rx*.5,0,0,7);g.fill();g.lineJoin='round';
  do_sh([[p.x-rx,p.y],[p.x-rx*.85,p.y-H*.5],[p.x-rx*.45,p.y-H*.82],[p.x+rx*l,p.y-H],[p.x+rx*.5,p.y-H*.78],[p.x+rx*.8,p.y-H*.42],[p.x+rx,p.y]],'#5a3e26',1.8);
  do_sh([[p.x+rx*l,p.y-H],[p.x+rx*.5,p.y-H*.78],[p.x+rx*.8,p.y-H*.42],[p.x+rx,p.y],[p.x+rx*.15,p.y],[p.x+rx*.05,p.y-H*.6]],'#8a6a48');
  g.strokeStyle='rgba(34,22,12,.6)';g.lineWidth=1.2;g.beginPath();g.moveTo(p.x-rx*.4,p.y-H*.3);g.lineTo(p.x-rx*.1,p.y-H*.45);g.lineTo(p.x-rx*.3,p.y-H*.6);g.stroke();
  if(a<.3){g.fillStyle=rgba('#b8a080',.55*(1-a/.3));g.beginPath();g.ellipse(p.x,p.y-a*30*p.s,(10+a*40)*p.s,(5+a*14)*p.s,0,0,7);g.fill()}},
 // dalle de terre retournée (Doroku Gaeshi) : flanc de terre brune à racines, dessus herbu
 do_slab:(w,p,a)=>{const rise=ezo(Math.min(1,a/.14)),end=Math.min(1,w.t/.3),H=50*rise*end;if(H<1)return;
  const V=do_wallSeg(w,H,'#55843a','#7a5634','#5e4229',p);
  g.strokeStyle='rgba(40,26,14,.7)';g.lineWidth=1.2;g.beginPath();for(const k of[-.5,.4]){const q0=V.c(V.hl*k,V.hw,H*.85),q1=V.c(V.hl*(k+.15),V.hw,H*.45),q2=V.c(V.hl*(k-.05),V.hw,H*.15);g.moveTo(q0.x,q0.y);g.quadraticCurveTo(q1.x,q1.y,q2.x,q2.y)}g.stroke();
  g.strokeStyle='#3a5a24';g.lineWidth=1.4;g.beginPath();for(let i=0;i<3;i++){const q=V.c((i-1)*V.hl*.6,V.hw*.9,H);g.moveTo(q.x,q.y);g.lineTo(q.x+(i%2?2:-2)*q.s,q.y-7*q.s)}g.stroke();
  if(a<.3){g.fillStyle=rgba('#b8a080',.55*(1-a/.3));g.beginPath();g.ellipse(p.x,p.y-a*30*p.s,(9+a*36)*p.s,(4+a*12)*p.s,0,0,7);g.fill()}},
};
// ---- animations 3D
Object.assign(ANIM,{
 // à genoux, les deux paumes plaquées au sol (Doryûheki)
 do_palms:(P,e)=>{const q=ezo(Math.min(1,e/.25))*(e>.75?1-(e-.75)/.25:1);P.root.y=-8*q;pz(P,'thighL',-1.05*q);pz(P,'shinL',1.85*q);pz(P,'thighR',-.25*q,0,-.12*q);pz(P,'shinR',1.6*q);pz(P,'chest',.8*q);pz(P,'head',-.4*q);pz(P,'armL',-1.05*q,0,-.1*q);pz(P,'armR',-1.05*q,0,.1*q);pz(P,'foreL',-.1);pz(P,'foreR',-.1)},
 // poing levé puis frappé au sol (Doryûsô)
 do_strike:(P,e)=>{const up=e<.28,k=up?ezo(e/.28):1,r=e>.8?1-(e-.8)/.2:1;P.root.y=(up?-1:-8)*r;pz(P,'thighL',(up?-.3:-1)*r);pz(P,'shinL',(up?.4:1.7)*r);pz(P,'thighR',.2*r);pz(P,'shinR',(up?.3:1.4)*r);pz(P,'chest',(up?-.15:.75)*r,(up?.35:-.15)*r);pz(P,'armR',up?-2.9*k:-.7*r,0,.15);pz(P,'foreR',up?-.5:-.05);pz(P,'armL',-.3*r,0,.7*r);pz(P,'foreL',-.6)},
 // main tendue, puis poing serré ramené d'un coup sec (Main de terre)
 do_grab:(P,e)=>{if(e<.55){const k=ezo(Math.min(1,e/.2));pz(P,'armR',-1.6*k,0,.1);pz(P,'foreR',-.05);pz(P,'armL',-.5*k,0,.5*k);pz(P,'foreL',-.4);pz(P,'chest',.2*k,.25*k);P.root.z=3*k;pz(P,'thighR',-.5*k);pz(P,'shinR',.4*k)}
  else{const k=ezo(Math.min(1,(e-.55)/.15))*(e>.85?1-(e-.85)/.15:1);pz(P,'armR',-1.6+1.2*k,0,.1);pz(P,'foreR',-1.6*k);pz(P,'chest',.2-.45*k,.25-.6*k);P.root.z=3-7*k;pz(P,'thighL',.4*k);pz(P,'thighR',-.3);pz(P,'armL',-.5,0,.5);pz(P,'foreL',-.4)}},
 // écrasé par le poids (cible de Kajûgan) : genoux pliés, dos voûté, tremblement
 do_heavy:(P,e,u,t)=>{const k=Math.min(1,e*6),tr=Math.sin(t*38)*.025,w=u&&u.moving?Math.sin(u.walk||0)*.35:0;P.root.y=-6*k;pz(P,'thighL',-.55*k-w,0,.12);pz(P,'thighR',-.45*k+w,0,-.12);pz(P,'shinL',1.05*k);pz(P,'shinR',.95*k);pz(P,'chest',.45*k+tr);pz(P,'spine',.15*k);pz(P,'head',.35*k);
  if(!(u&&u.cast)){pz(P,'armL',-.25,0,.35);pz(P,'armR',-.25,0,-.35);pz(P,'foreL',-.4);pz(P,'foreR',-.4)}},
 // plaqué au sol : à genoux, mains au sol
 do_slammed:(P,e)=>{const r=e>.7?1-(e-.7)/.3:1;P.root.y=-9*r;pz(P,'thighL',-1.25*r);pz(P,'shinL',2.1*r);pz(P,'thighR',-1.25*r);pz(P,'shinR',2.1*r);pz(P,'chest',.85*r);pz(P,'head',-.25*r);pz(P,'armL',-1.1*r,0,.3*r);pz(P,'armR',-1.1*r,0,-.3*r);pz(P,'foreL',-.2);pz(P,'foreR',-.2)},
 // plongeon dans le sol (Taupe)
 do_dive:(P,e)=>{const k=ezo(Math.min(1,e/.2));P.rootR.x=.55*k;P.root.y=-12*k;pz(P,'armL',-2.9*k,0,-.15);pz(P,'armR',-2.9*k,0,.15);pz(P,'foreL',0);pz(P,'foreR',0);pz(P,'head',-.3*k);pz(P,'thighL',.3*k);pz(P,'thighR',.5*k);pz(P,'shinL',.6*k);pz(P,'shinR',.4*k)},
 // carrure de roc (Kyôka) : jambes ancrées, bras écartés, coudes pliés
 do_flex:(P,e)=>{const q=ezo(Math.min(1,e/.25))*(e>.8?1-(e-.8)/.2:1);P.root.y=-3*q;pz(P,'thighL',-.15*q,0,.3*q);pz(P,'thighR',-.15*q,0,-.3*q);pz(P,'shinL',.35*q);pz(P,'shinR',.35*q);pz(P,'armL',-.5*q,0,1.25*q);pz(P,'armR',-.5*q,0,-1.25*q);pz(P,'foreL',-1.9*q);pz(P,'foreR',-1.9*q);pz(P,'chest',-.25*q);pz(P,'head',-.2*q)},
 // petit bond puis double coup de poing au sol (Grand séisme)
 do_quake:(P,e)=>{if(e<.18){const k=ezo(e/.18);P.root.y=10*k;pz(P,'armL',-3*k,0,-.2);pz(P,'armR',-3*k,0,.2);pz(P,'thighL',-.8*k);pz(P,'shinL',1.2*k);pz(P,'thighR',-.5*k);pz(P,'shinR',1*k);pz(P,'chest',-.3*k);return}
  const k=Math.min(1,(e-.18)/.06)*(e>.8?1-(e-.8)/.2:1);P.root.y=10-19*k;pz(P,'armL',-3+2.2*k,0,-.2);pz(P,'armR',-3+2.2*k,0,.2);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'chest',-.3+1.1*k);pz(P,'head',-.3*k);pz(P,'thighL',-.8-.3*k);pz(P,'shinL',1.2+.7*k);pz(P,'thighR',-.5+.2*k);pz(P,'shinR',1+.6*k)},
});
// ---- synchro réseau et crochets
AFTER.push(()=>{UK.push('do_kj','do_ar','do_ac','do_sw','do_mo');DARKV.do_prop=1;
 // murs sur mesure : on intercepte le dessin des murs du Doton, les autres passent au dessin d'origine
 if(typeof drawWallN==='function'){const D0=drawWallN;drawWallN=function(w){const T=DO_WT[w.vfx];if(T==null||!DO_WD[w.vfx])return D0(w);g.save();try{DO_WD[w.vfx](w,P(w.x,w.y),T-w.t)}catch(e){}g.restore();return true}}});

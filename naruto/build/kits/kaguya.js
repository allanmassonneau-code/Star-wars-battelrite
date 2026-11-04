// ===== Clan Kaguya (Shikotsumyaku : le clan façonne ses os, style Kimimaro) =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
// arbre de clan (v5) : 1 jutsu par rang. Retirés : Bond d'os (→ dash), Armure d'os, Danse du camélia, Forêt naissante + Forêt d'os (→ Danse des fougères), Liane (→ Clématite)
KIT('c9',[
 ['D','x.kg_finger','Doigts-balles','Rafale de 2 balles d\'os tirées du bout des doigts, qui suivent la visée ; chaque balle ralentit','bone'],
 ['C','x.kg_willow','Danse du saule','Tourbillon de lames d\'os : blesse autour, renvoie les tirs et étourdit qui te frappe au corps à corps','bone'],
 ['B','x.kg_larch','Danse du mélèze','Des os jaillissent de tout le corps : dégâts, entrave qui est collé ; 2 s d\'épines qui brisent les tirs et blessent','bone'],
 ['A','x.kg_fern','Danse des fougères','Des os percent le sol au point visé après un court délai (dégâts, étourdit), puis la forêt s\'étend en anneau autour de ce point : elle bloque ennemis et tirs 1,5 s','bone'],
 ['S','x.kg_clem','Danse de la clématite','Le fouet de vertèbres harponne le 1er ennemi et le ramène, puis la foreuse d\'os géante fonce en ligne : perce boucliers et murs, énormes dégâts et projette','bone'],
]);
// dash (Espace) : Bond d'os (couronne réduite)
DASHC[9]={src:'x.kg_leap',n:'Bond d\'os',d:'Bondit vers le point visé ; à l\'atterrissage, une petite couronne d\'os jaillit : dégâts et repousse',vfx:'bone',cd:7};
// descriptions des anciennes lignes (mécaniques gardées hors arbre)
const KGOLD={'Doigts-balles':'Rafale de 3 balles d\'os tirées du bout des doigts, qui suivent la visée ; chaque balle ralentit','Bond d\'os':'Bondit vers le point visé ; à l\'atterrissage, une couronne d\'os jaillit : dégâts et projette en l\'air','Forêt naissante':'Des os percent le sol au point visé après un court délai : dégâts et étourdit, puis le bosquet ralentit','Armure d\'os':'3 s : inarrêtable, 30 % de dégâts en moins, plaques d\'os reformées ; puis l\'armure éclate et blesse autour','Danse du saule':'Tourbillon de lames d\'os : blesse autour, renvoie les tirs et étourdit qui te frappe au corps à corps','Danse du camélia':'Tire son humérus comme une épée : 5 estocades éclair devant soi, la dernière repousse et ralentit','Danse de la clématite : Liane':'Fouet de vertèbres : le premier ennemi touché est ramené contre toi et ralenti','Danse du mélèze':'Des os jaillissent de tout le corps : gros dégâts, entrave qui est collé ; 3 s d\'épines qui brisent les tirs et blessent','Danse de la clématite':'Foreuse d\'os géante : fonce en ligne, perce boucliers et murs, énormes dégâts et projette','Forêt d\'os':'3 anneaux d\'os géants jaillissent autour de soi : blessent, étourdissent, puis bloquent ennemis et tirs 1,5 s'};
// ---- petites aides du clan
const kgS=(n,u)=>{const V=VFX;VFX=null;S(n,u);VFX=V};
// ---- VFX (boîte à outils nr_fx.js) : os ivoire (éclats non additifs à contour sombre), poussière, petite lueur froide ; les hitbox restent nettes
const KG_W='#f2efe6',KG_D='#8a8274';
// éclats d'os qui volent (impact, couronne) ; s = taille
function kgChips(u,x,y,s,o){fxDebris(x,y,Object.assign({u,n:6*s,sp:170*s,col:KG_W,c2:'#c8c0b0',s:3.2*s},o||{}));fxBurst(x,y,'#ffffff',{u,n:5*s,sp:260*s,z:28,w:1.4,len:.14,t:.3})}
// impact d'os sur une cible : éclats, flash froid, poussière, gel visuel si gros coup
function kgImp(u,e,s,dmg,big){kgChips(u,e.x,e.y,s);fxFlare(e.x,e.y,'#e8f0ff',{u,z:32,r:14*s,t:.15,c2:KG_W});fxSmoke(e.x,e.y,{u,col:'#d8d2c4',n:2+s,r:16*s,s:9*s,t:.6,al:.2,rise:12});if(dmg)fxHitStop(u,e,dmg,big)} // son hors palette (sinon tout son d'un jutsu d'os devient « bone »)
const KG_REG=12,KG_PCT=.2,KG_CAP=4; // trait : une plaque repousse toutes les 12 s ; chaque plaque retire 20 % d'un coup (4 au plus)
const kgD=n=>{const r=KITROWS.find(r=>r[0]==='c9'&&r[4]===n);return r?r[5]:KGOLD[n]||''};
// atterrissage du Bond d'os : couronne d'os qui projette
function kgLand(u,sm){const x=u.x,y=u.y,V=VFX,R=sm?70:85;VFX='bone';for(const e of enemies(u))if(Math.hypot(e.x-x,e.y-y)<R+e.r)hit(e,u,sm?5:7,sm?{kb:110,fx:x,fy:y}:{air:.2,kb:70,fx:x,fy:y});VFX=V;
 jx({jfx:'kg_crown',x,y,r:R,t:.75,m:.75});jx({jfx:'shock',x,y,r:R,t:.4,m:.4,col:'#f2efe6'});sparks(x,y,'#f2efe6',5,'bone');if(near(x,y)){kgS('rock',u);S('bone',u)}
 fxRing(x,y,{u,r0:14,r1:R,col:KG_W,w:5,t:.35});kgChips(u,x,y,1.2);fxSmoke(x,y,{u,col:'#c8b898',n:4,r:R*.6,s:12,t:.7,al:.22,rise:14});fxDecal(x,y,'crack',{u,r:R*.7,t:3})}
// fin de l'Armure d'os : elle éclate en éclats tranchants
function kgShatter(u){if(u.dead)return;const V=VFX;VFX='bone';for(const e of enemies(u))if(dist(u,e)<100+e.r)hit(e,u,12,{slow:1,fx:u.x,fy:u.y});VFX=V;
 jx({jfx:'kg_burst',x:u.x,y:u.y,r:100,t:.5,m:.5});sparks(u.x,u.y,'#f2efe6',8,'bone');if(near(u.x,u.y))S('bone',u);fxRing(u.x,u.y,{u,r0:14,r1:100,col:KG_W,w:5,t:.35});kgChips(u,u.x,u.y,1.4)}
Object.assign(NAT,{
 kg_finger:S_('Doigts-balles',kgD('Doigts-balles'),6,{hero:'gideon',line:{len:560,w:14},ai:RG(540,.65)},(u,a)=>{anim(u,'kg_finger',.6);
  const f=o=>{S('bone',o);const b=o.aim,h=fwd(o,b,22);proj(o,b,{spd:1150,r:5,dmg:6,life:.48,col:'#f2efe6',slow:.4,kind:'kg_finger',onHit:(p,t)=>{jx({jfx:'kg_stuck',ti:units.indexOf(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),o:(rnd()-.5)*14,t:1,m:1});fxBurst(t.x,t.y,KG_W,{u:p.owner,n:5,sp:200,z:30,a:Math.atan2(p.vy,p.vx),arc:1.4,w:1.6,len:.12,t:.3});fxFlare(t.x,t.y,'#e8f0ff',{u:p.owner,z:30,r:9,t:.12,star:0})}});jx({jfx:'kg_muzzle',x:h.x,y:h.y,a:b,t:.16,m:.16});fxFlare(h.x,h.y,'#e8f0ff',{u:o,z:30,r:8,t:.1,star:0})};
  f(u);seqs.push({owner:u,n:1,t:.12,iv:.12,vfx:'bone',f})}),
 kg_leap:S_('Bond d\'os',kgD('Bond d\'os'),11,{hero:'savage',ai:{mode:'gap',min:110,max:280,p:.5}},(u,a,td)=>{const d=clamp(td||250,60,280),p=fwd(u,a,d);anim(u,'kg_leap',.6);kgS('dash',u);
  later(u,.42,()=>{},{x:p.x,y:p.y,r:70});jx({jfx:'shock',x:u.x,y:u.y,r:45,t:.3,m:.3,col:'#e8e2d0'});sparks(u.x,u.y,'#c8c2b0',4,'bone');fxSmoke(u.x,u.y,{u,col:'#c8b898',n:3,r:20,s:10,t:.6,al:.22});dash(u,a,d,.42,{jump:100,end:()=>kgLand(u,1)})}),
 kg_sprout:S_('Forêt naissante',kgD('Forêt naissante'),10,{hero:'iden',tele:{r:88,max:430},ai:RG(430,.6)},(u,a,td)=>{const p=atP(u,a,td,430);anim(u,'kg_ground',.55);S('bone',u);
  aux.push({type:'kg_sprout',x:p.x,y:p.y,r:88,t:.45,m:.45,team:u.team,owner:u,vfx:'bone',k:0});
  zone(u,p.x,p.y,88,18,.45,{stun:.65},'#f2efe6');lastZ().deto='kg_grove';
  later(u,.45,()=>{aux.push({type:'kg_thicket',x:p.x,y:p.y,r:88,t:1.8,m:1.8,team:u.team,owner:u,vfx:'bone',k:.3});if(near(p.x,p.y))kgS('rock',u)},{x:p.x,y:p.y})}),
 kg_armor:S_('Armure d\'os',kgD('Armure d\'os'),12,{hero:'gideon',ai:DEF},(u)=>{anim(u,'kg_armor',.6);S('bone',u);kgS('heavy',u);
  u.unstop=Math.max(u.unstop,3);u.dr=u.drT>0?Math.max(u.dr,.3):.3;u.drT=Math.max(u.drT,3);u.kg_armT=3;u.kg_os=3;u.kg_osT=0;
  jx({jfx:'kg_armor',ui:units.indexOf(u),x:u.x,y:u.y,t:.6,m:.6});ring(u.x,u.y,60,'#f2efe6');later(u,3,()=>kgShatter(u))}),
 kg_willow:S_('Danse du saule',kgD('Danse du saule'),8,{ai:{mode:'def',p:.45,max:110}},(u)=>{S('bone',u);kgS('saber',u);anim(u,'kg_willow',.5);
  u.spin={t:.6,k:0,r:100,dmg:4.5};u.deflect=Math.max(u.deflect,.5);jx({jfx:'kg_willow',ui:units.indexOf(u),x:u.x,y:u.y,t:.55,m:.55});
  fxRing(u.x,u.y,{u,r0:40,r1:100,col:KG_W,w:4,t:.3});fxWind(u.x,u.y,0,{u,spin:1,w:90,n:7,t:.55,col:'#ffffff'});fxBurst(u.x,u.y,KG_W,{u,n:8,sp:300,z:26,up:10,gr:0,w:1.6,len:.2,t:.35})}),
 kg_camellia:S_('Danse du camélia',kgD('Danse du camélia'),9,{line:{len:135,w:40},ai:RG(130,.7)},(u)=>{anim(u,'kg_thrust',.6);kgS('saber',u);let i=0;
  const f=o=>{const b=o.aim,last=i===4,V=VFX;S('bone',o);o.kx+=Math.cos(b)*60;o.ky+=Math.sin(b)*60;if(!last)o.slow=Math.max(o.slow,.13);VFX='bone';
   for(const e of enemies(o))if(dist(o,e)<135+e.r&&angDiff(ang(o,e),b)<.34){if(e.block&&facing(e,o)){stamHit(e,8);sparks(e.x,e.y,'#f2efe6',4,'bone');continue}hit(e,o,last?5:2,{kb:last?190:0,slow:last?.5:0})}VFX=V;i++};
  f(u);seqs.push({owner:u,n:4,t:.11,iv:.11,vfx:'bone',f});jx({jfx:'kg_camellia',ui:units.indexOf(u),x:u.x,y:u.y,t:.6,m:.6})}),
 kg_whip:S_('Danse de la clématite : Liane',kgD('Danse de la clématite : Liane'),12,{line:{len:350,w:18},ai:RG(340,.55,110)},(u,a)=>{anim(u,'kg_whip',.6);kgS('saber',u);S('bone',u);
  proj(u,a,{spd:1050,r:9,dmg:8,life:.33,col:'#f2efe6',hook:1,slow:.4,kind:'kg_whip',noClash:1,onHit:(p,t)=>{kgImp(p.owner,t,.8,0);if(t.unstop>0)return;jx({jfx:'kg_yank',ui:units.indexOf(p.owner),ti:units.indexOf(t),x:t.x,y:t.y,t:.3,m:.3});say(t,'ATTRAPÉ','#f2efe6')}})}),
 kg_larch:S_('Danse du mélèze',kgD('Danse du mélèze'),11,{tele:{self:1,r:120},ai:SELF(115,.65)},(u)=>{anim(u,'kg_larch',.7);S('bone',u);kgS('heavy',u);
  for(const e of enemies(u)){const d=dist(u,e);if(d<120+e.r){const c=d<65+e.r;hit(e,u,c?28:24,{kb:c?0:260,root:c?.8:0,fx:u.x,fy:u.y})}}
  u.thorns=Math.max(u.thorns,2);u.thornSlow=Math.max(u.thornSlow,2);u.chrome=Math.max(u.chrome,2);u.kg_larT=2;
  jx({jfx:'kg_larch',ui:units.indexOf(u),x:u.x,y:u.y,t:.8,m:.8});jx({jfx:'shock',x:u.x,y:u.y,r:120,t:.45,m:.45,col:'#f2efe6'});sparks(u.x,u.y,'#f2efe6',6,'bone');
  fxRing(u.x,u.y,{u,r0:20,r1:120,col:KG_W,c2:'#ffffff',w:6,t:.4});kgChips(u,u.x,u.y,1.6);fxDecal(u.x,u.y,'crack',{u,r:70,t:3});fxLight(u.x,u.y,120,'#e8f0ff',{u,t:.35,a:.3});
  for(const e of enemies(u))if(dist(u,e)<120+e.r)kgImp(u,e,1,26,1)}),
 kg_drill:ULT('Danse de la clématite',kgD('Danse de la clématite'),{hero:'gideon',line:{len:360,w:60},ai:{mode:'gap',min:80,max:360,p:.8}},(u,a)=>{S('bone',u);kgS('heavy',u);anim(u,'kg_drill',.5);
  u.unstop=Math.max(u.unstop,.5);dash(u,a,360,.34,{});aux.push({type:'kg_drill',x:u.x,y:u.y,a,r:44,t:.6,m:.6,team:u.team,owner:u,vfx:'bone',k:0,hs:new Set()});
  jx({jfx:'kg_drill',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.42,m:.42});fxWind(u.x,u.y,a+Math.PI,{u,len:150,w:70,n:8,t:.45,col:'#ffffff'});fxSmoke(u.x,u.y,{u,col:'#c8b898',n:5,r:30,s:14,t:.8,al:.24});fxDecal(u.x,u.y,'crack',{u,r:40,t:2.5})}),
 // Danse des fougères (v5, fusion Forêt naissante + Forêt d'os) : os qui percent le sol au point visé, puis anneau d'os qui enferme 1,5 s
 kg_fern:S_('Danse des fougères','',14,{hero:'iden',tele:{r:110,max:430},ai:RG(430,.6)},(u,a,td,P)=>{const p=atP(u,a,td,430);NAT.kg_sprout.f(u,a,td,P);
  later(u,.5,()=>{const n=11,R=112,hs=new Set(),V=VFX;VFX='bone';for(let i=0;i<n;i++){const b=i*Math.PI*2/n,x=clamp(p.x+Math.cos(b)*R,B.x+20,B.x+B.w-20),y=clamp(p.y+Math.sin(b)*R*.9,B.y+20,B.y+B.h-20);
    for(const e of enemies(u))if(!hs.has(e)&&Math.hypot(e.x-x,e.y-y)<34+e.r){hs.add(e);hit(e,u,8,{stun:.2,fx:p.x,fy:p.y})}
    walls.push({x,y,r:15,t:1.5,m:1.5,team:u.team,owner:u,vfx:'bone'})}VFX=V;
   jx({jfx:'kg_ringfx',x:p.x,y:p.y,r:R,n,w:1,t:.6,m:.6});if(near(p.x,p.y)){kgS('rock',u);S('bone',u)}
   fxRing(p.x,p.y,{u,r0:R*.6,r1:R,col:KG_W,w:5,t:.35});fxSmoke(p.x,p.y,{u,col:'#c8b898',n:8,r:R,s:14,t:1,al:.2,rise:20});for(const e of hs)if(!e.dead)kgImp(u,e,1,8)},{x:p.x,y:p.y})}),
 // Danse de la clématite (v5, fusion avec la Liane) : fouet qui ramène le 1er ennemi, puis la foreuse fonce en ligne
 kg_clem:ULT('Danse de la clématite','',{hero:'gideon',line:{len:360,w:60},ai:{mode:'gap',min:80,max:340,p:.8}},(u,a,td,P)=>{NAT.kg_whip.f(u,a,td,P);u.root=Math.max(u.root,.3);
  later(u,.38,()=>{if(u.dead||u.stun>0||u.sleepT<0)return;NAT.kg_drill.f(u,u.aim,td,P)})}),
 kg_forest:ULT('Forêt d\'os',kgD('Forêt d\'os'),{hero:'inquisitor',tele:{self:1,r:250},ai:SELF(210,.8)},(u)=>{anim(u,'kg_ground',1.1);S('bone',u);kgS('rock',u);const o={x:u.x,y:u.y},hs=new Set();jx({jfx:'shock',x:o.x,y:o.y,r:60,t:.35,m:.35,col:'#e8e2d0'});
  // Danse de la fougère (Sawarabi) : 3 vagues, anneaux d'os géants de plus en plus loin ; chaque ennemi n'est empalé qu'une fois
  [[0,75,6,48],[.15,152,9,44],[.3,228,12,42]].forEach(([dl,R,n,hr],w)=>later(u,dl+.05,()=>{const V=VFX;VFX='bone';
   for(let i=0;i<n;i++){const b=i*Math.PI*2/n+w*.45,x=clamp(o.x+Math.cos(b)*R,B.x+20,B.x+B.w-20),y=clamp(o.y+Math.sin(b)*R*.9,B.y+20,B.y+B.h-20);
    for(const e of enemies(u))if(!hs.has(e)&&Math.hypot(e.x-x,e.y-y)<hr+e.r){hs.add(e);hit(e,u,9,{stun:.25,fx:x,fy:y})}
    walls.push({x,y,r:15,t:1.5-dl,m:1.5-dl,team:u.team,owner:u,vfx:'bone'})}VFX=V;
   jx({jfx:'kg_ringfx',x:o.x,y:o.y,r:R,n,w,t:.6,m:.6});if(near(o.x,o.y)){kgS('rock',u);S('bone',u);shake=Math.max(shake,.22)}},{x:o.x,y:o.y}))}),
});
Object.assign(NATHERO,{kg:'gideon'});

// ---- trait de clan : os renaissants (plaques d'os qui absorbent les coups et repoussent)
TRAITS[9]={nom:'Shikotsumyaku',desc:'Os renaissants : 3 plaques d\'os tournent autour du corps ; chaque coup reçu en brise une et perd 20 % de ses dégâts. Une plaque repousse toutes les 12 s.',
 init(u){u.kg_os=3;u.kg_osT=0;u.kg_armT=0;u.kg_larT=0},
 update(u,dt){if(u.kg_armT>0)u.kg_armT-=dt;if(u.kg_larT>0)u.kg_larT-=dt;
  if(u.kg_os<3){u.kg_osT+=dt;if(u.kg_osT>=KG_REG){u.kg_osT=0;u.kg_os++;if(near(u.x,u.y))fx.push({x:u.x,y:u.y,ring:26,t:.3,m:.3,col:'#f2efe6',vfx:'bone'})}}else u.kg_osT=0},
 take(t,src,dmg,o){if(t.kg_os>0&&src&&src!==t&&!o.silent&&dmg>=3){t.kg_os--;if(near(t.x,t.y)){sparks(t.x,t.y,'#f2efe6',3,'bone');fxBurst(t.x,t.y,KG_W,{u:t,n:4,sp:160,z:30,a:ang(t,src),arc:1.6,w:1.6,len:.1,t:.3});jx({jfx:'kg_plate',ti:units.indexOf(t),x:t.x,y:t.y,a:ang(t,src),t:.35,m:.35})}return dmg-Math.min(KG_CAP,dmg*KG_PCT)}return dmg},
 draw(u,p,S,sk){const t=performance.now()/1000,n=u.kg_os||0,gT=Math.min(1,(u.kg_osT||0)/KG_REG),cy=p.y-27*S*sk;g.save();g.lineCap='round';
  // plaques en orbite (celle qui repousse grandit peu à peu)
  for(let i=0;i<3;i++){const gr=i<n?1:i===n?gT*.8:0;if(gr<.08)continue;const b=t*1.5+i*2.094,c=Math.cos(b),s=Math.sin(b),L=6.5*S*gr;
   g.save();g.globalAlpha=(s<0?(Math.abs(c)<.55?.2:.5):1)*(i<n?1:.45);g.translate(p.x+c*21*S*sk,cy+s*7*S*sk);g.rotate(c*.8);g.beginPath();g.moveTo(-L,L*.15);g.quadraticCurveTo(0,-L*.55,L,L*.15);
   g.strokeStyle=OUT;g.lineWidth=2.6*S+1.4;g.stroke();g.strokeStyle='#f2efe6';g.lineWidth=2.6*S;g.stroke();g.restore()}
  // Armure d'os : cage thoracique et épaulières d'os
  if(u.kg_armT>0){g.globalAlpha=Math.min(1,u.kg_armT/.3);const y0=p.y-24*S*sk;
   for(let i=0;i<3;i++){const yy=y0-i*5.5*S*sk,rx=(12.5-i)*S*sk;g.beginPath();g.ellipse(p.x,yy,rx,4.2*S*sk,0,.2,Math.PI-.2);g.strokeStyle=OUT;g.lineWidth=3.4*S;g.stroke();g.strokeStyle='#f2efe6';g.lineWidth=2*S;g.stroke()}
   g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.3;for(const sx of[-1,1]){g.beginPath();g.ellipse(p.x+sx*11*S*sk,p.y-37*S*sk,5*S*sk,3.2*S*sk,sx*.3,0,7);g.fill();g.stroke();kgThorn(p.x+sx*12*S*sk,p.y-39*S*sk,sx*5*S*sk,-7*S*sk,1.6*S)}}
  // Danse du mélèze : épines qui hérissent le corps
  if(u.kg_larT>0){g.globalAlpha=Math.min(1,u.kg_larT/.3);g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.1;const pl=1+Math.sin(t*9)*.12;
   for(let i=0;i<9;i++){const b=i*.7+.2,c=Math.cos(b),s=Math.sin(b);kgThorn(p.x+c*8*S*sk,p.y-(28-s*12)*S*sk,c*9*S*pl,-(s*.6+.35)*9*S*pl,1.7*S)}}
  g.restore()},
 hud(u,x,y){const n=u.kg_os||0,f=Math.min(1,(u.kg_osT||0)/KG_REG);for(let i=0;i<3;i++){const cx=x+12+i*25,cy=y-14;kgBoneIco(cx,cy,i<n?'#f2efe6':'#3a3a44');
  if(i===n&&f>0){g.save();g.beginPath();g.rect(cx-10,cy-6,20*f,12);g.clip();kgBoneIco(cx,cy,'#9a9488');g.restore()}}text('Os',x+82,y-10,11,'#e8e2d0','left')}};
AFTER.push(()=>{UK.push('kg_os','kg_osT','kg_armT','kg_larT');
 // les os géants de la Forêt d'os sont des murs (vfx 'bone') : dessin sur mesure
 const dw=drawWallN;drawWallN=w=>w.vfx==='bone'?kgTree(w):dw(w)});

// ---- dessins
// pointe d'os (base au sol x,y ; penche de lx ; hauteur h ; demi-largeur w) avec le contour sombre du style
function kgSpike(x,y,lx,h,w,c){if(h<1)return;g.fillStyle=c||'#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.2;g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*.5+lx*.2,y-h*.6,x+lx,y-h);g.quadraticCurveTo(x+w*.6+lx*.5,y-h*.4,x+w,y);g.closePath();g.fill();g.stroke();
 g.fillStyle='rgba(110,100,80,.3)';g.beginPath();g.moveTo(x+w*.2,y);g.quadraticCurveTo(x+w*.3+lx*.45,y-h*.45,x+lx,y-h);g.quadraticCurveTo(x+w*.6+lx*.5,y-h*.4,x+w,y);g.closePath();g.fill()}
// épine qui part de (x,y) vers (x+dx,y+dy) (couleurs posées par l'appelant)
function kgThorn(x,y,dx,dy,w){const L=Math.hypot(dx,dy)||1,nx=-dy/L*w,ny=dx/L*w;g.beginPath();g.moveTo(x+nx,y+ny);g.lineTo(x+dx,y+dy);g.lineTo(x-nx,y-ny);g.closePath();g.fill();g.stroke()}
// petit os de l'interface
function kgBoneIco(x,y,c){for(const [col,e] of[['rgba(10,8,6,.9)',1.3],[c,0]]){g.fillStyle=col;g.fillRect(x-6-e,y-1.7-e,12+e*2,3.4+e*2);for(const [dx,dy] of[[-7,-2],[-7,2],[7,-2],[7,2]]){g.beginPath();g.arc(x+dx,y+dy,2.5+e,0,7);g.fill()}}}
// os géant de la Forêt d'os (mur) : jaillit, puis rentre dans le sol
function kgTree(w){const p=P(w.x,w.y),s=p.s,sd=Math.abs((w.x*13+w.y*7)|0),gr=Math.min(1,w.t/.35)*(w.m?Math.min(1,(w.m-w.t)/.12):1),h=(58+(sd%5)*8)*s*gr,r=w.r*s,lx=((sd%7)-3)*3.5*s*gr;
 g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(p.x,p.y,r*1.35,r*.6,0,0,7);g.fill();kgSpike(p.x,p.y,lx,h,r*1.05);
 if(h>20){g.strokeStyle='rgba(120,110,90,.55)';g.lineWidth=1.2;g.beginPath();for(const k of[.3,.55]){const yy=p.y-h*k,xx=p.x+lx*k*k;g.moveTo(xx-r*(1-k)*.9,yy);g.quadraticCurveTo(xx,yy+3*s,xx+r*(1-k)*.9,yy)}g.stroke()}
 g.fillStyle='#e0d8c4';g.beginPath();g.ellipse(p.x,p.y,r*1.15,r*.45,0,0,Math.PI);g.fill();return true}
// balle d'os (phalange pointue) + traînée
PROJD.kg_finger=(p,R,ra)=>{g.rotate(ra);g.scale(1.25,1.25);g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=2;g.beginPath();g.moveTo(-30,0);g.lineTo(-8,0);g.stroke();
 g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.2;g.beginPath();g.moveTo(10,0);g.lineTo(3,-2.8);g.lineTo(-6,-2.3);g.quadraticCurveTo(-10,-4,-10.5,0);g.quadraticCurveTo(-10,4,-6,2.3);g.lineTo(3,2.8);g.closePath();g.fill();g.stroke();
 g.strokeStyle='#b8b0a0';g.lineWidth=.9;g.beginPath();g.moveTo(-1.5,-2.5);g.lineTo(-1.5,2.5);g.stroke()};
// fouet de vertèbres : de la main jusqu'à la pointe en crochet
PROJD.kg_whip=(p,R,ra,t)=>{const q=P(p.x,p.y,28);let ox=0,oy=0;if(p.ox!=null){const o=P(p.ox,p.oy,32);ox=(o.x-q.x)/q.s;oy=(o.y-q.y)/q.s}
 const L=Math.hypot(ox,oy),n=Math.max(2,L/8.5|0),nx=L?-oy/L:0,ny=L?ox/L:0,wv=Math.sin(t/45);g.lineCap='round';
 const pts=[];for(let i=0;i<=n;i++){const s=i/n,w=Math.sin(s*Math.PI)*wv*7;pts.push([ox*s+nx*w,oy*s+ny*w])}
 g.strokeStyle=OUT;g.lineWidth=4.6;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.strokeStyle='#d8d2c2';g.lineWidth=2.6;g.stroke();
 g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();for(let i=1;i<n;i++){const [x,y]=pts[i];g.moveTo(x+3.4,y);g.ellipse(x,y,3.4,2.5,0,0,7)}g.fill();g.stroke();
 g.strokeStyle='#f2efe6';g.lineWidth=1.4;g.beginPath();for(let i=1;i<n;i+=2){const [x,y]=pts[i];g.moveTo(x-nx*5,y-ny*5);g.lineTo(x+nx*5,y+ny*5)}g.stroke();
 g.rotate(ra);g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.3;g.beginPath();g.moveTo(13,0);g.quadraticCurveTo(6,-7,-4,-5);g.lineTo(-3,0);g.lineTo(-4,5);g.quadraticCurveTo(4,4,13,0);g.closePath();g.fill();g.stroke()};
// éclair blanc au bout des doigts
JFXD.kg_muzzle=(f,k,e)=>{const q=P(f.x,f.y,30),a=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a));g.translate(q.x,q.y);g.rotate(a);g.globalCompositeOperation='lighter';g.fillStyle=rgba('#fffbe8',.9*k);
 g.beginPath();g.moveTo(16*q.s*(.4+e),0);g.lineTo(0,-3.4*q.s);g.lineTo(-3*q.s,0);g.lineTo(0,3.4*q.s);g.fill();circ(0,0,4.5*q.s*k,rgba('#ffffff',.8*k))};
// os fiché dans la cible
JFXD.kg_stuck=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const b=f.a+Math.PI,q=P(tg.x+Math.cos(b)*6,tg.y+Math.sin(b)*6,28+(f.o||0)),dx=Math.cos(b)*11*q.s,dy=Math.sin(b)*11*q.s*K-3*q.s;
 g.globalAlpha=Math.min(1,k*3);g.lineCap='round';g.strokeStyle=OUT;g.lineWidth=3.8*q.s;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x+dx,q.y+dy);g.stroke();g.strokeStyle='#f2efe6';g.lineWidth=2.2*q.s;g.stroke()};
// plaque d'os qui se brise (trait)
JFXD.kg_plate=(f,k,e,t,u,tg)=>{if(!tg)return;const q=P(tg.x+Math.cos(f.a)*16,tg.y+Math.sin(f.a)*16,30);g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1;g.globalAlpha=k;
 for(let i=0;i<4;i++){const b=f.a+(i-1.5)*.7,d=(4+e*22)*q.s;g.save();g.translate(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K-e*8*q.s);g.rotate(b+e*6);g.beginPath();g.moveTo(-4*q.s,0);g.lineTo(0,-1.8*q.s);g.lineTo(4*q.s,0);g.lineTo(0,1.8*q.s);g.closePath();g.fill();g.stroke();g.restore()}};
// couronne d'os du Bond d'os
JFXD.kg_crown=(f,k,e)=>{const gr=Math.min(1,e/.13)*Math.min(1,k/.35),n=10;for(const back of[1,0])for(let i=0;i<n;i++){const b=i*Math.PI*2/n+.3,c=Math.cos(b),s=Math.sin(b);if((s<0)!==!!back)continue;
 const q=P(f.x+c*f.r*.6,f.y+s*f.r*.6,0);kgSpike(q.x,q.y,c*16*q.s*gr,(30+(i%3)*9)*q.s*gr,5*q.s)}};
// Forêt naissante : sol fendu et pointes qui percent (alerte, purement visuel)
AUXF.kg_sprout=()=>{};AUXD.kg_sprout=(x,k,t)=>{const e=1-x.t/x.m;g.strokeStyle=rgba('#1e160e',.75);g.lineWidth=2.6;g.beginPath();
 for(let i=0;i<7;i++){const b=i*.9+.3;let px=x.x,py=x.y;const a=P(px,py,0);g.moveTo(a.x,a.y);for(let j=1;j<=3;j++){px=x.x+Math.cos(b+(j%2?.25:-.2))*x.r*(.3+.7*e)*j/3;py=x.y+Math.sin(b+(j%2?.25:-.2))*x.r*(.3+.7*e)*j/3*.85;const c=P(px,py,0);g.lineTo(c.x,c.y)}}g.stroke();
 for(let i=0;i<6;i++){const b=i*1.05+.5,d=x.r*(.25+.45*(i%3)/2),c=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.85,0);kgSpike(c.x,c.y,0,(3+11*e*e)*c.s,2.6*c.s)}};
// Forêt naissante : le bosquet jaillit
JFXD.kg_grove=(f,k,e)=>{const gr=Math.min(1,e/.1)*Math.min(1,k/.3),L=[];for(let i=0;i<10;i++){const b=i*2.4,d=i?f.r*(.3+.6*((i*37)%10)/10):0;L.push([f.x+Math.cos(b)*d,f.y+Math.sin(b)*d*.85,Math.cos(b)*(i?1:0),i])}
 L.sort((a,b)=>a[1]-b[1]);for(const [x,y,c,i] of L){const q=P(x,y,0);kgSpike(q.x,q.y,c*14*q.s*gr,(i?42+(i%4)*9:70)*q.s*gr*(1+Math.sin(e*30+i)*.03),(i?5:7.5)*q.s)}};
DETO.kg_grove=(x,y,r)=>{jx({jfx:'kg_grove',x,y,r,t:.85,m:.85});sparks(x,y,'#f2efe6',5,'bone');fxRing(x,y,{r0:14,r1:r,col:KG_W,w:6,t:.35});kgChips(undefined,x,y,1.5);fxDecal(x,y,'crack',{r:r*.9,t:3.5});fxSmoke(x,y,{col:'#c8b898',n:5,r:r*.7,s:14,t:.9,al:.22,rise:16})};
// bosquet d'os qui reste et ralentit
AUXF.kg_thicket=x=>{if(x.k>0)return;x.k=.25;const o=x.owner;for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r){if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.35);hit(e,o,.5,{silent:1})}};
AUXD.kg_thicket=(x,k)=>{g.fillStyle=rgba('#f2efe6',.08*k);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#c8c2b0',.5*k);g.lineWidth=1.5;g.setLineDash([5,6]);gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 const L=[];for(let i=0;i<11;i++){const b=i*2.4+.5,d=x.r*(.2+.72*((i*53)%10)/10);L.push([x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.85,Math.cos(b),i])}L.sort((a,b)=>a[1]-b[1]);
 for(const [px,py,c,i] of L){const q=P(px,py,0);kgSpike(q.x,q.y,c*4*q.s,(11+(i%3)*5)*q.s*k,3*q.s)}};
// Armure d'os : les os affluent vers le corps
JFXD.kg_armor=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,u.z||0),S=q.s*1.3,R=(1-ezo(e))*48*S,cy=q.y-30*S;g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.1;
 for(let i=0;i<9;i++){const b=i*.698+e*2.2,x=q.x+Math.cos(b)*R,y=cy+Math.sin(b)*R*.55;kgThorn(x,y,-Math.cos(b)*9*S,-Math.sin(b)*5*S,2*S)}
 if(e>.7)fxGlowS(q.x,cy,30*S,'#fffbe8',(1-e)*1.4,38*S)};
// éclats de l'armure qui éclate
JFXD.kg_burst=(f,k,e)=>{const q=P(f.x,f.y,20);g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1;g.globalAlpha=Math.min(1,k*2);
 for(let i=0;i<12;i++){const b=i*.5236+.2,d=(10+ezo(e)*f.r)*q.s;const x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*K-Math.sin(Math.PI*e)*18*q.s;kgThorn(x,y,Math.cos(b)*9*q.s,Math.sin(b)*9*q.s*K,2.2*q.s)}};
// Danse du saule : longues lames d'os qui balaient en cercle
JFXD.kg_willow=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,(u.z||0)+24),R=64*q.s,a0=t*15,pt=(th,r)=>[q.x+Math.cos(th)*r,q.y+Math.sin(th)*r*K];g.lineCap='round';
 for(let i=0;i<4;i++){const b=a0+i*1.571;g.strokeStyle=rgba('#ffffff',.3*k);g.lineWidth=9*q.s;g.beginPath();g.ellipse(q.x,q.y,R*.95,R*.95*K,0,b-1.05,b-.3);g.stroke();
  // lame d'os effilée (croissant) : bord extérieur puis bord intérieur
  const L=[];for(let j=0;j<=6;j++){const th=b-.32+.54*j/6,w=Math.sin(Math.PI*j/6);L.push(pt(th,R*(1+.04*w)))}for(let j=6;j>=0;j--){const th=b-.32+.54*j/6,w=Math.sin(Math.PI*j/6);L.push(pt(th,R*(1-.17*w)))}
  g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.4;g.beginPath();L.forEach(([x,y],j)=>j?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();g.stroke()}};
// Danse du camélia : l'humérus-épée, ses estocades et les pétales rouges du dernier coup
JFXD.kg_camellia=(f,k,e,t,u)=>{if(!u||u.dead)return;const ts=e*f.m,i=Math.min(4,Math.floor(ts/.11)),ph=Math.min(1,(ts-i*.11)/.11),s=Math.sin(Math.PI*Math.min(1,ph*1.5)),a=u.aim,ca=Math.cos(a),sa=Math.sin(a)*K,sd=(i%2?1:-1)*4,
 h=P(u.x+Math.cos(a)*(14+8*s)-Math.sin(a)*sd,u.y+Math.sin(a)*(14+8*s)+Math.cos(a)*sd,(u.z||0)+30),L=(36+16*s)*h.s,x1=h.x+ca*L,y1=h.y+sa*L;
 if(s>.25){g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.55*s);g.beginPath();g.moveTo(x1+ca*30*h.s*s,y1+sa*30*h.s*s);g.lineTo(h.x-sa*4*h.s,h.y+ca*4*h.s);g.lineTo(h.x+sa*4*h.s,h.y-ca*4*h.s);g.fill();g.globalCompositeOperation='source-over'}
 g.lineCap='round';g.strokeStyle=OUT;g.lineWidth=6*h.s;g.beginPath();g.moveTo(h.x,h.y);g.lineTo(x1,y1);g.stroke();g.strokeStyle='#f2efe6';g.lineWidth=3.8*h.s;g.stroke();
 g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1;for(const [x,y,r] of[[h.x,h.y,3.6],[x1,y1,3]]){g.beginPath();g.arc(x-sa*r*.5*h.s,y+ca*r*.5*h.s,r*h.s,0,7);g.arc(x+sa*r*.5*h.s,y-ca*r*.5*h.s,r*h.s,0,7);g.fill()}
 if(i===4)for(let j=0;j<8;j++){const b=a+(j-3.5)*.2,d=(26+ph*70+(j%3)*12)*h.s;g.fillStyle=j%2?'#e0304a':'#ff7a8c';g.beginPath();g.ellipse(x1+Math.cos(b)*d,y1+Math.sin(b)*d*K-ph*8*h.s,3.6*h.s,2.1*h.s,b+ph*5+j,0,7);g.fill()}};
// Liane : le fouet tient la cible pendant qu'elle est ramenée
JFXD.kg_yank=(f,k,e,t,u,tg)=>{if(!u||!tg||u.dead)return;const a=P(u.x,u.y,(u.z||0)+32),b=P(tg.x,tg.y,(tg.z||0)+30),n=Math.max(2,Math.hypot(b.x-a.x,b.y-a.y)/(8.5*a.s)|0);g.globalAlpha=Math.min(1,k*3);g.lineCap='round';
 g.strokeStyle=OUT;g.lineWidth=4.6*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle='#d8d2c2';g.lineWidth=2.6*a.s;g.stroke();
 g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1;g.beginPath();for(let i=1;i<n;i++){const x=lerp(a.x,b.x,i/n),y=lerp(a.y,b.y,i/n);g.moveTo(x+3.4*a.s,y);g.ellipse(x,y,3.4*a.s,2.5*a.s,0,0,7)}g.fill();g.stroke()};
// Danse du mélèze : le corps se hérisse de pointes d'os
JFXD.kg_larch=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,u.z||0),S=q.s*1.3,cx=q.x,cy=q.y-28*S,gr=Math.min(1,e/.1)*Math.min(1,k/.45);g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.2;
 // grandes pointes dorsales (épaules, vers le haut), puis couronne de pointes de longueurs inégales tout autour du corps
 for(const [ox,oy,dx,dy,w] of[[-9,-9,-15,-36,3.6],[9,-9,15,-36,3.6],[-4,-13,-6,-42,3],[4,-13,7,-40,3]])kgThorn(cx+ox*S,cy+oy*S,dx*S*gr,dy*S*gr,w*S);
 for(let i=0;i<16;i++){const b=i*.3927+(i%2)*.2,el=((i*7)%5-2)*.2,L=(20+((i*5)%4)*10)*S*gr,c=Math.cos(b),s=Math.sin(b);kgThorn(cx+c*7*S,cy+s*8*S+el*10*S,c*L,(s*.6+el)*L,2.6*S)}};
// Danse de la clématite : foreuse d'os en spirale sur le bras + traînée
JFXD.kg_drill=(f,k,e,t,u)=>{if(!u||u.dead)return;const ca=Math.cos(f.a),sa=Math.sin(f.a),q=P(u.x+ca*10,u.y+sa*10,(u.z||0)+30),ra=Math.atan2(sa*K,ca),s=q.s,L=74*s,Rb=17*s;
 const s0=P(f.x,f.y,30),dx=q.x-s0.x,dy=q.y-s0.y,dl=Math.hypot(dx,dy);if(dl>12){g.strokeStyle=rgba('#f2efe6',.55*k);g.lineWidth=2.4;for(const ph of[0,Math.PI]){g.beginPath();for(let i=0;i<=18;i++){const z=i/18,w=Math.sin(z*16+ph-t*30)*13*s*z;g.lineTo(s0.x+dx*z-dy/dl*w,s0.y+dy*z+dx/dl*w)}g.stroke()}}
 g.translate(q.x,q.y);g.rotate(ra);fxTailL(150*s,46*s,'#e8f0ff',.4*k);fxGlowS(L*.6,0,40*s,'#e8f0ff',.25*k,22*s);g.fillStyle='#f2efe6';g.strokeStyle=OUT;g.lineWidth=1.6;g.beginPath();g.moveTo(-4*s,-Rb);g.quadraticCurveTo(L*.45,-Rb*.75,L,0);g.quadraticCurveTo(L*.45,Rb*.75,-4*s,Rb);g.closePath();g.fill();g.stroke();
 g.strokeStyle='rgba(110,100,80,.75)';g.lineWidth=1.6;g.beginPath();for(let i=0;i<6;i++){const x0=((i/6+t*3.5)%1)*L*.9,w0=Rb*(1-x0/L)*.95;g.moveTo(x0,-w0);g.lineTo(x0+9*s,w0*.9)}g.stroke();
 g.fillStyle='#d8d2c2';g.beginPath();g.ellipse(-3*s,0,5*s,Rb,0,0,7);g.fill();g.stroke()};
// Danse de la clématite : la foreuse frappe tout sur sa ligne, perce boucliers, murs et dômes
AUXF.kg_drill=x=>{const o=x.owner;if(!o||o.dead||!o.dash){if(!x.done){x.done=1;x.t=0;if(o&&!o.dead){jx({jfx:'kg_burst',x:o.x+Math.cos(x.a)*30,y:o.y+Math.sin(x.a)*30,r:70,t:.45,m:.45});sparks(o.x,o.y,'#f2efe6',6,'bone');kgChips(o,o.x+Math.cos(x.a)*30,o.y+Math.sin(x.a)*30,1.4);fxSmoke(o.x,o.y,{u:o,col:'#c8b898',n:4,r:30,s:12,t:.7,al:.22})}}return}
 const ca=Math.cos(x.a),sa=Math.sin(x.a),tx=o.x+ca*26,ty=o.y+sa*26,V=VFX;x.x=o.x;x.y=o.y;VFX='bone';
 for(const e of enemies(o))if(!x.hs.has(e)&&Math.hypot(e.x-tx,e.y-ty)<x.r+e.r){x.hs.add(e);if(e.shield>0){e.shield=0;e.shieldT=0;say(e,'BOUCLIER PERCÉ','#f2efe6')}
  hit(e,o,53,{air:.55,kb:170,unblockable:1,fx:o.x-ca*40,fy:o.y-sa*40});jx({jfx:'kg_burst',x:e.x,y:e.y,r:40,t:.35,m:.35});if(near(e.x,e.y))kgS('boom',o);
  kgImp(o,e,2,53,1);fxRing(e.x,e.y,{u:o,r0:10,r1:60,col:KG_W,c2:'#ffffff',w:7,t:.4});fxPillar(e.x,e.y,'#e8f0ff',{u:o,h:140,w:18,t:.35,al:.4});fxDecal(e.x,e.y,'crack',{u:o,r:50,t:3});fxShake(.3,e.x,e.y)}VFX=V;
 for(const w of walls)if(w.team!==x.team&&Math.hypot(w.x-tx,w.y-ty)<w.r+30){w.t=0;sparks(w.x,w.y,'#c8c2b0',6,'bone')}
 for(const fl of fields)if(fl.dome&&fl.team!==x.team&&Math.hypot(fl.x-tx,fl.y-ty)<fl.r){fl.t=0;sparks(fl.x,fl.y,'#c8c2b0',12,'bone')}};
AUXD.kg_drill=()=>{};
// Forêt d'os : poussière et éclats au pied de chaque vague
JFXD.kg_ringfx=(f,k,e)=>{g.strokeStyle=rgba('#e8e2d0',.7*k);g.lineWidth=5*k+1;gEll(f.x,f.y,f.r*(.85+e*.3));g.stroke();g.fillStyle=rgba('#c8c2b0',.8*k);
 for(let i=0;i<f.n;i++){const b=i*Math.PI*2/f.n+f.w*.45,q=P(f.x+Math.cos(b)*f.r,f.y+Math.sin(b)*f.r*.9,0);for(let j=0;j<3;j++){const c=b+j*2.1;circ(q.x+Math.cos(c)*e*22*q.s,q.y-Math.sin(Math.PI*e)*(14+j*6)*q.s+Math.sin(c)*e*8*q.s,(2.4-j*.5)*q.s,rgba('#e8e2d0',.9*k))}}};

// ---- animations 3D
Object.assign(ANIM,{
 // Doigts-balles : bras tendu, doigts pointés, petit recul à chaque balle
 kg_finger:(P,e)=>{const k=ezo(Math.min(1,e/.15)),rc=[0,.2,.4].reduce((s,t0)=>s+Math.max(0,1-Math.abs(e-t0-.04)/.07),0);
  pz(P,'armR',-1.62*k+.22*rc,0,.06);pz(P,'foreR',-.04);pz(P,'chest',.06,.34*k);pz(P,'head',0,-.22*k);pz(P,'armL',-.3,0,.42);pz(P,'foreL',-.7);P.root.z=-1.6*rc;P.root.y=-1;pz(P,'thighL',-.3);pz(P,'thighR',.25);pz(P,'shinR',.3)},
 // Bond d'os : appel accroupi, groupé en l'air, réception genou à terre
 kg_leap:(P,e)=>{if(e<.15){const k=e/.15;P.root.y=-5*k;pz(P,'thighL',-.6*k);pz(P,'shinL',1.1*k);pz(P,'thighR',-.6*k);pz(P,'shinR',1.1*k);pz(P,'chest',.35*k);pz(P,'armL',.5*k,0,.3);pz(P,'armR',.5*k,0,-.3)}
  else if(e<.66){const k=(e-.15)/.51;pz(P,'thighL',-1.3);pz(P,'shinL',1.9);pz(P,'thighR',-.9);pz(P,'shinR',1.6);pz(P,'chest',.25);pz(P,'armL',-2.6+k*1.3,0,.55);pz(P,'armR',-2.6+k*1.3,0,-.55);pz(P,'foreL',-.4);pz(P,'foreR',-.4);P.rootR.x=.3*Math.sin(Math.PI*k)}
  else{const k=ezo((e-.66)/.34);P.root.y=-8+3*k;pz(P,'thighL',-1.1);pz(P,'shinL',1.9);pz(P,'thighR',.4);pz(P,'shinR',1.7);pz(P,'chest',.6-.3*k);pz(P,'armR',-1.1,0,-.15);pz(P,'foreR',-.3);pz(P,'armL',-.4,0,1.1);pz(P,'head',-.25)}},
 // Forêt naissante / Forêt d'os : genou à terre, paumes plaquées au sol
 kg_ground:(P,e)=>{const k=ezo(Math.min(1,e/.22));P.root.y=-9*k;pz(P,'thighL',-1.25*k);pz(P,'shinL',2.1*k);pz(P,'thighR',.25*k);pz(P,'shinR',2*k);pz(P,'spine',.2*k);pz(P,'chest',.75*k);
  pz(P,'armL',-.95*k,0,-.22*k);pz(P,'armR',-.95*k,0,.22*k);pz(P,'foreL',-.15);pz(P,'foreR',-.15);pz(P,'head',-.35*k)},
 // Armure d'os : bras croisés, puis le corps se bombe sous les os
 kg_armor:(P,e)=>{if(e<.5){const k=ezo(e/.5);P.root.y=-3*k;pz(P,'armL',-1.3*k,0,-.75*k);pz(P,'armR',-1.3*k,0,.75*k);pz(P,'foreL',-1.6*k);pz(P,'foreR',-1.6*k);pz(P,'chest',.3*k);pz(P,'head',.2*k);pz(P,'thighL',-.3*k,0,.2*k);pz(P,'thighR',.2*k,0,-.2*k);pz(P,'shinL',.6*k);pz(P,'shinR',.6*k)}
  else{const k=ezo((e-.5)/.5);P.root.y=-3+2*k;pz(P,'armL',-.5,0,1.2*k);pz(P,'armR',-.5,0,-1.2*k);pz(P,'foreL',-.9);pz(P,'foreR',-.9);pz(P,'chest',-.25*k);pz(P,'head',-.3*k);pz(P,'thighL',-.2,0,.35);pz(P,'thighR',.1,0,-.35);pz(P,'shinL',.4);pz(P,'shinR',.4)}},
 // Danse du saule : tourne comme une branche, un bras haut, un bras bas
 kg_willow:(P,e,u,t)=>{const w=Math.sin(t*14)*.25;pz(P,'armL',-2.2+w,0,1.1);pz(P,'foreL',-.15);pz(P,'armR',-.9-w,0,-1.3);pz(P,'foreR',-.1);pz(P,'chest',.15,0,.15);pz(P,'thighR',.6);pz(P,'shinR',.5);pz(P,'thighL',-.2);pz(P,'shinL',.3);P.root.y=-1.5},
 // Danse du camélia : estocades très rapides du bras droit
 kg_thrust:(P,e)=>{const n=Math.min(4,Math.floor(e*5)),ph=e*5-n,s=Math.sin(Math.PI*Math.min(1,ph*1.6));pz(P,'armR',-1.05-.55*s,0,.12*(n%2?1:-1));pz(P,'foreR',-.9+.86*s);pz(P,'chest',.25+.1*s,(n%2?.25:-.1)+.25*s);
  pz(P,'armL',.5,0,.35);pz(P,'foreL',-.8);P.root.z=3+5*s;P.root.y=-3;pz(P,'thighR',-.8);pz(P,'shinR',.8);pz(P,'thighL',.5);pz(P,'shinL',.4)},
 // Liane : armé au-dessus de la tête, fouetté vers l'avant, puis tiré
 kg_whip:(P,e)=>{if(e<.25){const k=ezo(e/.25);pz(P,'armR',-2.9*k,0,-.2);pz(P,'foreR',-1*k);pz(P,'chest',-.25*k,-.35*k);P.root.z=-2*k}
  else if(e<.55){const k=ezo((e-.25)/.3);pz(P,'armR',-2.9+1.5*k,0,-.2+.1*k);pz(P,'foreR',-1+.95*k);pz(P,'chest',-.25+.6*k,-.35+.7*k);P.root.z=-2+7*k;pz(P,'thighR',-.7*k);pz(P,'shinR',.6*k)}
  else{const k=ezo((e-.55)/.45);pz(P,'armR',-1.4+.6*k,0,-.1);pz(P,'foreR',-.05-1.2*k);pz(P,'chest',.35-.3*k,.35-.3*k);P.root.z=5-6*k;P.root.y=-2*k;pz(P,'thighL',-.4*k);pz(P,'shinL',.5*k)}
  pz(P,'armL',-.4,0,.6);pz(P,'foreL',-.6)},
 // Danse du mélèze : se ramasse puis explose, bras et jambes écartés
 kg_larch:(P,e)=>{if(e<.3){const k=ezo(e/.3);P.root.y=-6*k;pz(P,'chest',.7*k);pz(P,'head',.3*k);pz(P,'armL',-.9*k,0,-.5*k);pz(P,'armR',-.9*k,0,.5*k);pz(P,'foreL',-1.8*k);pz(P,'foreR',-1.8*k);pz(P,'thighL',-.7*k,0,.15);pz(P,'thighR',-.7*k,0,-.15);pz(P,'shinL',1.3*k);pz(P,'shinR',1.3*k)}
  else{const k=ezo(Math.min(1,(e-.3)/.25));P.root.y=-6+7*k;pz(P,'chest',.7-1.05*k);pz(P,'head',.3-.75*k);pz(P,'armL',-.9-.9*k,0,-.5+2*k);pz(P,'armR',-.9-.9*k,0,.5-2*k);pz(P,'foreL',-1.8+1.7*k);pz(P,'foreR',-1.8+1.7*k);
   pz(P,'thighL',-.7+.6*k,0,.15+.35*k);pz(P,'thighR',-.7+.6*k,0,-.15-.35*k);pz(P,'shinL',1.3-1.1*k);pz(P,'shinR',1.3-1.1*k)}},
 // Danse de la clématite : bras-foreuse tendu, tout le corps lancé derrière
 kg_drill:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.2));pz(P,'armR',-1.57*k,Math.sin(t*40)*.15,.05);pz(P,'foreR',0);pz(P,'chest',.45*k,.15);pz(P,'spine',.15*k);pz(P,'head',-.3*k);pz(P,'armL',.9*k,0,.5);pz(P,'foreL',-.4);
  P.root.z=10*k;P.root.y=-4*k;pz(P,'thighR',-1.1*k);pz(P,'shinR',.6*k);pz(P,'thighL',.8*k);pz(P,'shinL',.9*k);pz(P,'cape',-.9*k)},
});

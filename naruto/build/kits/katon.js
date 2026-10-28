// ===== Katon (feu) =====
// Identité : brûlures (dégâts sur la durée), murs et zones de feu, grosses boules, dragon. Le vent allié attise le feu (moteur), le feu sèche les cibles trempées.
// Combos internes : Flamme embrase une cible qui brûle déjà · Mur de feu enflamme les tirs alliés · Tornade de feu s'attise quand tes tirs de feu la traversent.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('n0',[
 [1,'D','x.ka_ball','Katon : Flamme','Trait de feu rapide qui brûle ; sur une cible déjà en feu, il l\'embrase : +5 dégâts','fire'],
 [1,'D','x.ka_wall','Katon : Mur de feu','Mur de feu 4 s : bloque tirs et ennemis, brûle au contact ; tes tirs le traversent et s\'enflamment','fire'],
 [1,'C','x.ka_tri','Katon : Triple flamme','3 boules de feu de plus en plus grosses, tirées à la suite en suivant ta visée ; la 3e explose','fire'],
 [1,'C','x.ka_air','Katon : Shuriken de feu aériens','Bond en arrière : 5 shuriken de feu convergent sur le point visé, qui s\'embrase 2 s','fire'],
 [1,'B','x.ka_zone','Katon : Fournaise','Brasier de 4 s autour de soi, qui te suit : plus un ennemi y reste, plus il brûle (jusqu\'à ×3)','fire'],
 [1,'B','x.ka_goka','Katon : Boule de feu suprême','Énorme boule de feu qui grossit en avançant : traverse et repousse les ennemis, balaie les petits tirs','fire'],
 [1,'B','x.ka_stack','Katon : Flammes chargées','5 flammes follettes à tirer une à une en relançant (5 s) ; la dernière explose','fire'],
 [1,'A','x.ka_dragon','Katon : Dragon de feu','Dragon de feu qui suit ta visée, explose en repoussant et laisse le sol en feu','fire'],
 [1,'A','x.ka_tornado','Katon : Tornade de feu','Tornade de feu guidée par ta visée : aspire et brûle sans emporter ; tes tirs de feu et le vent l\'attisent','fire'],
 [5,'S','x.ka_nuee','Katon : Nuée ardente','Nuée de cendres brûlantes (ralentit) ; immobile, relance pour l\'abattre : jusqu\'à ×2,5 en 2 s','fire'],
 [5,'S','x.ka_breath','Katon : Grand souffle de feu','Immobile 2 s : un torrent de feu balaie un très large cône (ralentit, brûle), le sol reste en feu','fire'],
]);
// ---- aides
const kaS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V}; // son brut : sinon l'élément feu remplace tout par « fire »
const kaBurning=t=>t.dotT>0&&t.dotEl===0; // la cible brûle déjà
const kaFx=(o)=>{if(near(o.x,o.y))jx(o)};
// le moteur ajoute un jet de feu à la bouche à tout jutsu de feu ; on le retire (dans la même image) pour les techniques lancées des mains ou du corps
const kaNoMouth=u=>aux.push({type:'ka_nomouth',x:u.x,y:u.y,r:0,t:.1,m:.1,team:u.team,owner:u,vfx:'fire',k:0});
// brûlure autour d'une explosion (les explosions du moteur n'en posent pas)
const kaBurnAt=(u,x,y,r,dot)=>{for(const e of enemies(u))if(Math.hypot(e.x-x,e.y-y)<r+e.r)hit(e,u,0,{silent:1,el:0,dot})};
// suit un projectile : fn(p,x,dt) à chaque image, end(x,p) quand il disparaît (impact, explosion, portée)
// (durée large : un tir renvoyé vit plus longtemps que prévu ; le suivi s'arrête de lui-même quand le tir disparaît)
function kaTrack(u,fn,end){const p=projs[projs.length-1];aux.push({type:'ka_pt',x:p.x,y:p.y,r:0,t:9,m:9,team:u.team,owner:u,vfx:'fire',k:0,p,fn,end})}
// Flamme : embrase une cible qui brûle déjà, sinon l'allume
function kaRavive(p,t){const o=p.owner;if(kaBurning(t)){hit(t,o,5,{dot:BURN(5,3)});say(t,'EMBRASÉ','#ffb03a');kaFx({jfx:'ka_burst',x:t.x,y:t.y,r:48,t:.42,m:.42,big:1})}
 else{hit(t,o,0,{silent:1,dot:BURN(4,3)});kaFx({jfx:'ka_burst',x:t.x,y:t.y,r:28,t:.3,m:.3})}}
// Triple flamme : boule i (0, 1, 2) ; la 3e est grosse et explose (kb:0 : sans recul, sinon chaque lancer interromprait les mudras adverses)
function kaTri(u,a,i){S('fire',u);anim(u,['ka_jabL','ka_jabR','ka_push'][i],i<2?.22:.32);
 if(i<2)proj(u,a,{spd:700,r:7+i*1.6,dmg:5+i,life:.72,col:'#ff7a2a',vfx:'fire',kind:'ka_orb',o:{dot:BURN(3,2.5)},onHit:(p,t)=>kaFx({jfx:'ka_burst',x:t.x,y:t.y,r:20+i*6,t:.25,m:.25})});
 else{proj(u,a,{spd:650,r:12,dmg:8,life:.76,col:'#ff7a2a',vfx:'fire',kind:'ka_orb',rocket:1,ar:56,kb:0});kaTrack(u,null,(x,p)=>{kaBurnAt(u,p.x,p.y,56,BURN(3,2.5));kaFx({jfx:'ka_burst',x:p.x,y:p.y,r:62,t:.4,m:.4,big:1})})}}
// Mur de feu : les tirs alliés qui le traversent s'enflamment (+20 % de dégâts, brûlent ; l'eau passe sans prendre feu)
function kaIgnite(p){p.kaIgn=1;p.dmg*=1.2;const d=p.o&&p.o.dot,fire=ELM[p.vfx]===0;p.o=Object.assign({},p.o,{dot:d&&d.dps>=3?d:BURN(3,3)},fire?{}:{el:0});
 if(fire)p.r*=1.15;else if(!p.kind)p.kind='ka_ign';if(near(p.x,p.y)){jx({jfx:'ka_burst',x:p.x,y:p.y,r:24,t:.25,m:.25});sparks(p.x,p.y,'#ffb03a',4,'fire')}}
// Tornade : grossit (tir de feu allié qui la traverse, ou vent)
function kaGrow(x,dr,dm){x.r=Math.min(x.r+dr,128);x.dmg*=dm;kaFx({jfx:'ka_wave',x:x.x,y:x.y,r:x.r+20,t:.4,m:.4});if(near(x.x,x.y))sparks(x.x,x.y,'#ffb03a',10,'fire')}
// Nuée ardente : la nuée s'abat (puissance selon la durée de canalisation, maximum à 2 s)
function kaNueeGo(u){const c=u.chan;if(!c||c.key!=='ka_nuee')return;u.chan=null;u.cds[c.i]=c.cd;const pw=1+1.5*Math.min(1,c.t/2),V=VFX;VFX='fire';
 for(const x of aux)if(x.type==='ka_nuee'&&x.owner===u){x.t=0;if(x.fl)x.fl.t=0}
 aoe(u,c.x,c.y,c.r,28*pw,{dot:BURN(5,3),unblockable:1,quiet:1},'#ff7a2a');field(u,c.x,c.y,{r:c.r,t:2.5,dps:5*pw,col:'#ff7a2a',vfx:'fire'});
 anim(u,'ka_slam',.45);say(u,'NUÉE ARDENTE ×'+pw.toFixed(1).replace('.',','),'#ff9a3a');
 if(near(c.x,c.y)){jx({jfx:'ka_nboom',x:c.x,y:c.y,r:c.r,t:.9,m:.9,n:pw});shake=Math.max(shake,.2+.12*pw);kaS('boom',u);kaS('heavy',u)}VFX=V}
// Grand souffle : le sol reste en feu le long du cône (si le souffle n'a pas été interrompu)
function kaScorch(u){const a=u.aim;for(const [d,r] of[[105,58],[200,72],[295,86]])field(u,u.x+Math.cos(a)*d,u.y+Math.sin(a)*d,{r,t:2.5,dps:7,col:'#ff7a2a',vfx:'fire'})}
Object.assign(NAT,{
 ka_ball:SP('Katon : Flamme','Trait de feu rapide qui brûle ; sur une cible déjà en feu, il l\'embrase : +5 dégâts',4,{ai:RG(520,.7),line:{len:520,w:16}},(u,a)=>{S('fire',u);anim(u,'ka_spit',.36);
  proj(u,a,{spd:720,r:8,dmg:11,life:.72,col:'#ff7a2a',kind:'ka_flame',onHit:kaRavive})}),
 ka_wall:SP('Katon : Mur de feu','Mur de feu 4 s : bloque tirs et ennemis, brûle au contact ; tes tirs le traversent et s\'enflamment',10,{ai:DEF},(u,a)=>{S('fire',u);S('flame',u);anim(u,'ka_sweep',.45);kaNoMouth(u);
  wallLine(u,a,2,{});const c=fwd(u,a,95);aux.push({type:'ka_wall',x:c.x,y:c.y,a,len:62,r:70,t:4,m:4,team:u.team,owner:u,vfx:'fire',k:.3,pf:new Map()});
  kaFx({jfx:'ka_wrise',x:c.x,y:c.y,a,len:62,ui:units.indexOf(u),t:.45,m:.45})}),
 ka_tri:SP('Katon : Triple flamme','3 boules de feu de plus en plus grosses, tirées à la suite en suivant ta visée ; la 3e explose',8,{ai:RG(500,.6),line:{len:500,w:24}},(u,a)=>{kaTri(u,a,0);kaNoMouth(u);let i=0;
  seqs.push({owner:u,n:2,t:.17,iv:.17,vfx:'fire',f:o=>kaTri(o,o.aim,++i)})}),
 // shuriken : élément visuel « tag » (pas de traînée du moteur au ras du sol, lueur orange) ; dégâts et brûlure restent du feu via el:0 ; ils tombent du ciel : pas de choc avec les tirs au sol (noClash)
 ka_air:SP('Katon : Shuriken de feu aériens','Bond en arrière : 5 shuriken de feu convergent sur le point visé, qui s\'embrase 2 s',8,{ai:RG(430,.55,110),tele:{r:58,max:450}},(u,a,td)=>{
  let tp=atP(u,a,Math.max(90,td||300),450);S('dash',u);kaNoMouth(u);dash(u,a+Math.PI,95,.38,{jump:110});anim(u,'ka_air',.46);
  later(u,.12,()=>{if(u.dead||u.stun>0)return;if(!u.ctrl){const e=nearE(u,tp.x,tp.y,170);if(e)tp={x:e.x+e.vx*.3,y:e.y+e.vy*.3}}S('fire',u);let fl=.12;const px=-Math.sin(a),py=Math.cos(a);
   for(let i=0;i<5;i++){const ox=u.x+px*(i-2)*15,oy=u.y+py*(i-2)*15,b=Math.atan2(tp.y-oy,tp.x-ox),l=Math.max(.12,Math.hypot(tp.x-ox,tp.y-oy)/900);fl=Math.max(fl,l);
    projs.push({x:ox,y:oy,vx:Math.cos(b)*900,vy:Math.sin(b)*900,owner:u,src:u,rot:0,r:7,dmg:5,life:l,life0:l,col:'#ff7a2a',o:{dot:BURN(3,2),el:0},vfx:'tag',kind:'ka_shuri',noClash:1,onHit:(p,t)=>kaFx({jfx:'ka_burst',x:t.x,y:t.y,r:20,t:.25,m:.25}),jn:'Katon : Shuriken de feu aériens',ex:false,basic:false,hitSet:null})}
   later(u,fl,()=>{field(u,tp.x,tp.y,{r:58,t:2,dps:7,col:'#ff7a2a',vfx:'fire'});aux.push({type:'ka_stuck',x:tp.x,y:tp.y,a,r:58,t:2,m:2,team:u.team,owner:u,vfx:'fire',k:0});
    kaFx({jfx:'ka_burst',x:tp.x,y:tp.y,r:54,t:.35,m:.35});if(near(tp.x,tp.y))S('flame',u)},{x:tp.x,y:tp.y,r:58})},{})}),
 ka_zone:SP('Katon : Fournaise','Brasier de 4 s autour de soi, qui te suit : plus un ennemi y reste, plus il brûle (jusqu\'à ×3)',10,{ai:SELF(165,.55),tele:{self:1,r:160}},(u)=>{S('fire',u);S('flame',u);anim(u,'ka_stomp',.55);kaNoMouth(u);
  aux.push({type:'ka_four',x:u.x,y:u.y,r:160,t:4,m:4,team:u.team,owner:u,vfx:'fire',k:.05,n:0,H:new Map()});kaFx({jfx:'ka_wave',x:u.x,y:u.y,r:160,t:.5,m:.5,big:1})}),
 ka_goka:SP('Katon : Boule de feu suprême','Énorme boule de feu qui grossit en avançant : traverse et repousse les ennemis, balaie les petits tirs',9,{ai:RG(540,.55),line:{len:560,w:60}},(u,a)=>{S('fire',u);S('flame',u);anim(u,'ka_goka',.6);
  proj(u,a,{spd:430,r:16,dmg:22,life:1.3,col:'#ff7a2a',pierce:1,heavy:1,kind:'ka_goka',o:{dot:BURN(4,3),kb:110},onHit:(p,t)=>{kaFx({jfx:'ka_burst',x:t.x,y:t.y,r:p.r*2.4,t:.35,m:.35,big:1});if(near(t.x,t.y))shake=Math.max(shake,.12)}});
  // (croissance multiplicative : garde les bonus extérieurs ; un choc contre un petit tir ne lui retire que 15 % au plus, elle « balaie » vraiment)
  kaTrack(u,(p,x)=>{const e=1-p.life/p.life0;if(x.ld!=null){x.dm*=Math.max(.85,p.dmg/x.ld);x.rm*=p.r/x.lr}else{x.dm=1;x.rm=1}p.r=(16+13*e)*x.rm;p.dmg=(22+6*e)*x.dm;x.ld=p.dmg;x.lr=p.r},
   (x,p)=>kaFx({jfx:'ka_burst',x:p.x,y:p.y,r:p.r*2.6,t:.45,m:.45,big:1}))}),
 ka_stack:SP('Katon : Flammes chargées','5 flammes follettes à tirer une à une en relançant (5 s) ; la dernière explose',10,{ai:RG(500,.7)},(u,a)=>{const i=u.ch.abil.findIndex(x=>x.key==='ka_stack');if(i<0)return;kaNoMouth(u);
  if(u.jst&&u.jst.key==='ka_stack'){const last=u.jst.n<=1;S('fire',u);anim(u,'ka_flick',.22);
   if(last){proj(u,a,{spd:820,r:9,dmg:14,life:.62,col:'#ff7a2a',kind:'ka_wisp',rocket:1,ar:62,kb:80,big:1});kaTrack(u,null,(x,p)=>{kaBurnAt(u,p.x,p.y,62,BURN(3,2));kaFx({jfx:'ka_burst',x:p.x,y:p.y,r:60,t:.4,m:.4,big:1})})}
   else proj(u,a,{spd:900,r:6,dmg:10,life:.58,col:'#ff7a2a',kind:'ka_wisp',o:{dot:BURN(3,2)},onHit:(p,t)=>kaFx({jfx:'ka_burst',x:t.x,y:t.y,r:22,t:.25,m:.25})});
   u.jst.n--;if(u.jst.n<=0){u.cds[i]=u.jst.cd;u.jst=null}else u.cds[i]=.22}
  else{if(u.jst)u.cds[u.jst.i]=u.jst.cd; // une autre réserve de tirs en cours : elle se termine (sa recharge part)
   u.jst={key:'ka_stack',i,n:5,t:5,cd:u.ch.abil[i].cd,v:'fire'};u.cds[i]=.25;aux.push({type:'ka_jw',x:u.x,y:u.y,r:0,t:5.5,m:5.5,team:u.team,owner:u,vfx:'fire',k:0});say(u,'×5','#ffd38a');S('flame',u);anim(u,'ka_wisps',.5);kaFx({jfx:'ka_wave',x:u.x,y:u.y,r:46,t:.35,m:.35})}}),
 ka_dragon:SP('Katon : Dragon de feu','Dragon de feu qui suit ta visée, explose en repoussant et laisse le sol en feu',12,{ai:RG(620,.5),line:{len:700,w:40}},(u,a)=>{S('fire',u);kaS('roar',u);anim(u,'ka_dragon',.75);
  proj(u,a,{spd:470,r:13,dmg:28,life:1.7,col:'#ff7a2a',rocket:1,ar:90,kb:190,burn:1,steer:1,big:1,kind:'ka_dragon'});
  kaTrack(u,null,(x,p)=>kaFx({jfx:'ka_dboom',x:p.x,y:p.y,r:90,t:.7,m:.7}));kaFx({jfx:'ka_coil',ui:units.indexOf(u),x:u.x,y:u.y,t:.6,m:.6})}),
 ka_tornado:SP('Katon : Tornade de feu','Tornade de feu guidée par ta visée : aspire et brûle sans emporter ; tes tirs de feu et le vent l\'attisent',12,{ai:RG(470,.6),line:{len:520,w:150}},(u,a)=>{S('fire',u);kaS('wind',u);anim(u,'spin',.5);kaNoMouth(u);
  aux.push({type:'ka_torn',x:u.x+Math.cos(a)*55,y:u.y+Math.sin(a)*55,vx:Math.cos(a)*145,vy:Math.sin(a)*145,a,r:78,t:3.6,m:3.6,team:u.team,owner:u,vfx:'fire',k:0,dmg:7,n:0})}),
 ka_nuee:ULT('Katon : Nuée ardente','Nuée de cendres brûlantes (ralentit) ; immobile, relance pour l\'abattre : jusqu\'à ×2,5 en 2 s',{tele:{r:165,max:480},ai:{max:460,p:.8}},(u,a,td)=>{const i=u.ch.abil.findIndex(x=>x.key==='ka_nuee');if(i<0)return;
  if(u.chan&&u.chan.key==='ka_nuee'){kaNueeGo(u);aux.push({type:'ka_uncut',x:u.x,y:u.y,r:0,t:.1,m:.1,team:u.team,owner:u,vfx:'fire',k:0,nm:u.ch.abil[i].n});return}
  let p=atP(u,a,td,480);if(!u.ctrl){const e=pick(u,a,td||300,480);if(e)p={x:e.x+e.vx*.25,y:e.y+e.vy*.25}} // un bot centre la nuée sur sa cible
  u.chan={key:'ka_nuee',i,x:p.x,y:p.y,r:165,t:0,max:2.1,cd:u.ch.abil[i].cd};u.cds[i]=u.ctrl?.4:99; // un bot la laisse s'abattre au bon moment (AUXF)
  field(u,p.x,p.y,{r:165,t:2.3,slow:1,dps:6,col:'#2a2224',vfx:'ka_ash'});aux.push({type:'ka_nuee',x:p.x,y:p.y,r:165,t:2.4,m:2.4,team:u.team,owner:u,vfx:'fire',k:0,n:0,fl:fields[fields.length-1]});kaFx({jfx:'ka_ncloud',x:p.x,y:p.y,r:165,t:2.4,m:2.4});
  anim(u,'ka_call',2.2);kaS('roar',u)}),
 ka_breath:ULT('Katon : Grand souffle de feu','Immobile 2 s : un torrent de feu balaie un très large cône (ralentit, brûle), le sol reste en feu',{ai:{max:300,p:.8}},(u,a)=>{S('fire',u);S('flame',u);anim(u,'ka_blast',.45);
  u.flame={t:2,k:0,R:140,arc:.88,d:4.5,burn:1,still:1,v:'fire',dot:BURN(4,3)};aux.push({type:'ka_sbr',x:u.x,y:u.y,r:0,t:2.3,m:2.3,team:u.team,owner:u,vfx:'fire',k:0,fl:u.flame,el:0});
  kaFx({jfx:'ka_cone',ui:units.indexOf(u),x:u.x,y:u.y,t:2,m:2})}),
});
Object.assign(NATHERO,{ka:'boba'});
AFTER.push(()=>UK.push('ka_ht'));
// ---- logique des objets (hôte)
AUXF.ka_pt=(x,dt)=>{const p=x.p;if(p&&!p.dead&&p.life>0&&projs.includes(p)){x.x=p.x;x.y=p.y;if(x.fn)x.fn(p,x,dt);return}if(!x.done){x.done=1;if(x.end&&p)x.end(x,p)}x.t=0};
AUXF.ka_wall=x=>{const c=Math.cos(x.a),s=Math.sin(x.a);
 // brûle au contact : une fois par ennemi toutes les 0,3 s (les segments du moteur, avec burn, frappaient chacun : 2 ou 3 fois plus en longeant le mur)
 if(x.k<=0){x.k=.3;VFX='fire';for(const e of enemies(x.owner)){const dx=e.x-x.x,dy=e.y-x.y,f=dx*c+dy*s,l=-dx*s+dy*c,d=Math.hypot(f,Math.max(0,Math.abs(l)-48));if(d<22+e.r)hit(e,x.owner,3,{silent:1,dot:BURN(3,2)})}VFX=null}
 for(const p of projs){if(p.dead||p.kaIgn||p.grenade||p.owner.team!==x.team||ELM[p.vfx]===1)continue;const dx=p.x-x.x,dy=p.y-x.y,f=dx*c+dy*s;if(Math.abs(-dx*s+dy*c)>x.len+10){x.pf.delete(p);continue}
  const pf=x.pf.get(p);x.pf.set(p,f);if(Math.abs(f)<18||(pf!=null&&(pf<0)!==(f<0)))kaIgnite(p)}
 if(x.pf.size>30)for(const p of x.pf.keys())if(p.dead)x.pf.delete(p)};
AUXF.ka_four=x=>{const o=x.owner;if(x.t<=0||o.dead){for(const [e] of x.H)e.ka_ht=0;x.t=0;return}x.x=o.x;x.y=o.y;x.n=1-x.t/x.m;if(x.k>0)return;x.k=.25;
 for(const e of units){if(e.team===x.team)continue;if(e.dead||Math.hypot(e.x-x.x,e.y-x.y)>x.r+e.r){if(x.H.has(e)){x.H.delete(e);e.ka_ht=0}continue}
  const h=(x.H.get(e)||0)+.25;x.H.set(e,h);e.ka_ht=Math.min(1,h/4);VFX='fire';hit(e,o,1.35*Math.min(3,1+.5*h),{silent:1,dot:BURN(3,2)});VFX=null}};
AUXF.ka_torn=(x,dt)=>{const o=x.owner;
 // guidée : tourne lentement (1,5 rad/s) vers la visée du lanceur, sans jamais accélérer
 if(!o.dead){const cur=Math.atan2(x.vy,x.vx);let df=Math.atan2(o.y+Math.sin(o.aim)*700-x.y,o.x+Math.cos(o.aim)*700-x.x)-cur;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;const na=cur+clamp(df,-1.5*dt,1.5*dt),sp=Math.hypot(x.vx,x.vy);x.vx=Math.cos(na)*sp;x.vy=Math.sin(na)*sp;x.a=na}
 x.x=clamp(x.x+x.vx*dt,B.x+20,B.x+B.w-20);x.y=clamp(x.y+x.vy*dt,B.y+20,B.y+B.h-20);
 if(!x.wb&&inWind({x:x.x,y:x.y,r:x.r,owner:x.owner})){x.wb=1;kaGrow(x,22,1.25)}
 // un tir de feu allié qui la traverse l'attise (une fois par tir, 4 fois au plus) et continue sa route : nourrir la tornade ne coûte pas le tir
 if(x.n<4)for(const p of projs)if(p.kaTo!==x&&p.life>0&&!p.dead&&p.owner.team===x.team&&ELM[p.vfx]===0&&!p.rocket&&Math.hypot(p.x-x.x,p.y-x.y)<x.r*.8){p.kaTo=x;x.n++;kaGrow(x,8,1.1);if(x.n>=4)break}
 // l'appel d'air aspire doucement vers le centre (≈ 90 px/s, moins vite qu'un ninja qui marche : on s'en échappe, mais on y reste plus longtemps)
 const tick=x.k<=0;if(tick)x.k=.25;VFX='fire';
 for(const e of enemies(x.owner)){const dx=e.x-x.x,dy=e.y-x.y,d=Math.hypot(dx,dy);if(d>=x.r+e.r)continue;if(tick)hit(e,x.owner,x.dmg,{silent:1,dot:BURN(3,2)});
  if(d>12&&!e.dash&&!(e.unstop>0)&&!(e.phase>0)){const k=630*dt/d;e.kx-=dx*k;e.ky-=dy*k}}VFX=null};
AUXF.ka_stuck=()=>{};
AUXF.ka_nomouth=x=>{x.t=0;const k=units.indexOf(x.owner);for(let j=fx.length-1;j>=0;j--){const f=fx[j];if(f.jfx==='mouthfire'&&f.ui===k&&f.t===f.m){fx.splice(j,1);break}}};
// relance de la Nuée : le moteur rejoue l'annonce d'ultime (bandeau, nom) ; on la retire dans la même image, elle a déjà été vue au lancement
AUXF.ka_uncut=x=>{x.t=0;if(x.done)return;x.done=1;const o=x.owner,s=x.nm,k=units.indexOf(o);if(o===player&&cutin&&cutin.s===s)cutin=null;
 net.ev.ci=net.ev.ci.filter(c=>!(c[0]===k&&c[1]===s));for(let j=txt.length-1;j>=0;j--)if(txt[j].s===s+' !'&&txt[j].t===1){txt.splice(j,1);break}};
// flammes follettes : perdues si le lanceur meurt (sinon elles resteraient prêtes à sa réapparition en bataille)
AUXF.ka_jw=x=>{const o=x.owner,j=o.jst;if(!j||j.key!=='ka_stack'){x.t=0;return}x.x=o.x;x.y=o.y;if(o.dead){o.cds[j.i]=j.cd;o.jst=null;o.jstN=0;x.t=0}};
AUXF.ka_nuee=x=>{const o=x.owner,c=o.chan;if(!c||c.key!=='ka_nuee'||o.dead){if(o.dead&&c&&c.key==='ka_nuee')o.chan=null;if(x.fl)x.fl.t=0;x.t=0;if(o.anim&&o.anim.k==='ka_call')o.anim=null;return}
 x.n=Math.min(1,c.t/2);if(x.fl)x.fl.t=Math.max(x.fl.t,.3);if(c.t>=2){kaNueeGo(o);return}
 // bot : l'abat quand une cible va sortir, après 1,2 s si elle reste dedans, ou tôt si personne n'y est
 if(!o.ctrl&&c.t>=.4){let inn=0,edge=0;for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<x.r+e.r*.5){inn++;if(d>x.r-30)edge++}}if(edge||(inn&&c.t>=1.2)||(!inn&&c.t>=.9))kaNueeGo(o)}};
AUXF.ka_sbr=(x,dt)=>{const o=x.owner,f=o.flame;if(!f||f!==x.fl||o.dead){if(!x.done){x.done=1;if(x.el>1.6&&!o.dead){const V=VFX;VFX='fire';kaScorch(o);VFX=V}}x.t=0;return}
 x.el+=dt;x.x=o.x;x.y=o.y;f.R=Math.min(330,140+190*x.el/.35)};
// ---- dessin : aides
// langue de flamme : goutte effilée de (x,y) vers sa pointe (direction b, longueur L, demi-largeur w)
function kaTongue(x,y,L,w,b,col){const c=Math.cos(b),s=Math.sin(b),px=-s*w,py=c*w;g.fillStyle=col;g.beginPath();g.moveTo(x+px,y+py);g.quadraticCurveTo(x+c*L*.5+px*.9,y+s*L*.5+py*.9,x+c*L,y+s*L);
 g.quadraticCurveTo(x+c*L*.5-px*.9,y+s*L*.5-py*.9,x-px,y-py);g.arc(x,y,w,b-Math.PI/2,b+Math.PI/2,true);g.fill()}
// ---- projectiles
PROJD.ka_flame=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';const f=Math.sin(t/40)*.12;
 kaTongue(0,0,R*(4.4+f*5),R*1.1,Math.PI+f*.4,rgba('#e0401a',.55));kaTongue(0,0,R*(3+f*3),R*.92,Math.PI-f*.5,rgba('#ff7a2a',.85));kaTongue(R*.25,0,R*1.9,R*.6,Math.PI,'#ffd36a');circ(R*.35,0,R*.42,'#fff3c0')};
PROJD.ka_orb=(p,R,ra,t)=>{g.globalCompositeOperation='lighter';R*=1.2;const s=t/110;circ(0,0,R*1.8,rgba('#ff5a1a',.2));
 g.rotate(ra);kaTongue(-R*.1,0,R*2.4,R*.95,Math.PI+Math.sin(t/45)*.18,rgba('#e0401a',.7));g.rotate(-ra);
 for(let i=0;i<3;i++){const b=s+i*2.094;kaTongue(Math.cos(b)*R*.55,Math.sin(b)*R*.55,R*1.3,R*.42,b+2.2,rgba('#ffb03a',.8))}
 g.globalCompositeOperation='source-over';circ(0,0,R,'#ff6a1a');circ(-R*.04,-R*.08,R*.72,'#ffa030');circ(R*.08,-R*.16,R*.4,'#fff3c0')};
PROJD.ka_shuri=(p,R,ra,t)=>{const e=p.life0?Math.max(0,p.life/p.life0):0;g.translate(0,-e*e*85);g.globalCompositeOperation='lighter';circ(0,0,R*2.2,rgba('#ff7a2a',.18));g.rotate(ra-e*.9);kaTongue(-2,0,R*4.2,R*1.05,Math.PI+Math.sin(t/40)*.15,rgba('#ff5a1a',.55));kaTongue(-1,0,R*2.6,R*.75,Math.PI,rgba('#ffb03a',.75));g.rotate(-ra+e*.9+t/26);
 g.globalCompositeOperation='source-over';g.fillStyle='#2e2e36';g.beginPath();for(let i=0;i<4;i++){const b=i*Math.PI/2;g.lineTo(Math.cos(b)*R*1.6,Math.sin(b)*R*1.6);g.lineTo(Math.cos(b+.785)*R*.42,Math.sin(b+.785)*R*.42)}g.closePath();g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle='#ff9a3a';g.lineWidth=1.6;g.stroke();circ(0,0,R*.32,'#fff3c0')};
PROJD.ka_wisp=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';const w=Math.sin(t/32+p.x*.05)*.4;
 kaTongue(0,0,R*5.2,R*.85,Math.PI+w*.35,rgba('#ff5a1a',.5));kaTongue(0,0,R*3.3,R*.8,Math.PI-w*.3,rgba('#ffb03a',.85));circ(0,0,R*.85,'#ffd36a');circ(R*.18,0,R*.5,'#ffffff')};
PROJD.ka_ign=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';const f=Math.sin(t/35)*.15;R=Math.max(R,6);
 kaTongue(0,0,R*(3.6+f*4),R*.95,Math.PI+f*.4,rgba('#ff5a1a',.6));kaTongue(0,0,R*2.2,R*.7,Math.PI,'#ffb03a');circ(R*.2,0,R*.45,'#fff3c0')};
PROJD.ka_goka=(p,R,ra,t)=>{g.globalCompositeOperation='lighter';const s=t/220;circ(0,0,R*1.6,rgba('#ff5a1a',.16));circ(0,0,R*1.25,rgba('#ff7a2a',.14));
 for(let i=0;i<10;i++){const b=(i%2?s:-s)+i*.628,L=R*(.8+.4*Math.sin(t/70+i*1.7));kaTongue(Math.cos(b)*R*.7,Math.sin(b)*R*.7,L,R*.36,b+.45,rgba(i%3?'#ff7a2a':'#ffb03a',.75))}
 g.rotate(ra);kaTongue(-R*.3,0,R*2.3,R*.9,Math.PI+Math.sin(t/60)*.12,rgba('#e0401a',.6));
 g.globalCompositeOperation='source-over';g.strokeStyle='#7a1a08';g.lineWidth=2;g.fillStyle='#e8481a';g.beginPath();g.arc(0,0,R,0,7);g.fill();g.stroke();
 circ(R*.06,-R*.04,R*.78,'#ff7a2a');circ(R*.14,-R*.1,R*.55,'#ffaa3a');circ(R*.22,-R*.16,R*.3,'#ffe08a');
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffd36a',.6);g.lineWidth=R*.12;for(let i=0;i<2;i++){g.beginPath();g.arc(0,0,R*(.55+i*.2),s*3+i*2,s*3+i*2+1.6);g.stroke()}};
// mémoire de la trajectoire du dragon : gardée dans le projectile sur l'hôte ; chez un invité, les projectiles sont recréés à chaque instantané réseau,
// on reprend alors la trace la plus proche, mise à jour à l'instant (sinon le corps resterait droit en ligne)
const kaDT=[];
function kaTrail(p){const now=performance.now();if(p._kt){p._kt.s=now;return p._kt.T}let best=null,bd=90;
 for(let i=kaDT.length-1;i>=0;i--){const d=kaDT[i];if(now-d.s>600){kaDT.splice(i,1);continue}if(now-d.s>160)continue;const L=d.T[d.T.length-1];if(!L)continue;const dd=Math.hypot(p.x-L.x,p.y-L.y);if(dd<bd){bd=dd;best=d}}
 if(!best){best={T:[]};kaDT.push(best)}best.s=now;p._kt=best;return best.T}
// dragon : corps en ruban qui suit sa trajectoire réelle (mémorisée dans le temps, prolongée en ligne droite au départ), tête cornue gueule ouverte
PROJD.ka_dragon=(p,R,ra,t)=>{const q=P(p.x,p.y,28),T=kaTrail(p),Lt=T[T.length-1];if(!Lt||Math.hypot(p.x-Lt.x,p.y-Lt.y)>4){T.push({x:p.x,y:p.y});if(T.length>80)T.shift()}
 const n=12,pts=[[0,0]],sp=Math.hypot(p.vx,p.vy)||1,ux=p.vx/sp,uy=p.vy/sp,D=R*.62;let k=T.length-1,cx=p.x,cy=p.y,left=p.life0?Math.max(0,(p.life0-p.life)*sp-8):1e9; // le corps sort de la gueule : jamais plus long que le chemin parcouru
 for(let i=1;i<n;i++){let need=Math.min(D,left);left-=need;while(need>0){if(k<0){cx-=ux*need;cy-=uy*need;break}const a=T[k],dd=Math.hypot(a.x-cx,a.y-cy);if(dd>=need){cx+=(a.x-cx)*need/dd;cy+=(a.y-cy)*need/dd;need=0}else{cx=a.x;cy=a.y;need-=dd;k--}}
  const w=Math.sin(t/85-i*.85)*R*.38*Math.min(1,i/3),s=P(cx-uy*w,cy+ux*w,28);pts.push([(s.x-q.x)/q.s,(s.y-q.y)/q.s])}
 g.lineCap='round';for(const [col,wm] of[['#8a1a08',1.35],['#e0401a',1.15],['#ff8a2a',.78],['#ffd36a',.3]]){g.strokeStyle=col;for(let i=n-1;i>=1;i--){g.lineWidth=R*wm*(.25+.75*(1-i/n));g.beginPath();g.moveTo(pts[i][0],pts[i][1]);g.lineTo(pts[i-1][0],pts[i-1][1]);g.stroke()}}
 g.globalCompositeOperation='lighter';for(let i=2;i<n;i+=2){const [x,y]=pts[i],[x2,y2]=pts[i-1],b=Math.atan2(y-y2,x-x2),s=1-i/n;kaTongue(x,y,R*(.9+.8*s),R*.3,b+(i%4?1.3:-1.3),rgba(i%4?'#ffb03a':'#ff7a2a',.75))}
 {const [x,y]=pts[n-1],[x2,y2]=pts[n-2];kaTongue(x,y,R*1.3,R*.25,Math.atan2(y-y2,x-x2)+Math.sin(t/60)*.3,rgba('#ff7a2a',.8))}
 g.rotate(ra);const o=Math.sin(t/70)*.1;kaTongue(R*.1,-R*.3,R*2.3,R*.6,Math.PI-.6,rgba('#ffb03a',.75));kaTongue(R*.1,R*.3,R*2.3,R*.6,Math.PI+.6,rgba('#ffb03a',.75));
 g.globalCompositeOperation='source-over';g.fillStyle='#c8320e';g.strokeStyle='#5a1008';g.lineWidth=1.5;g.beginPath();g.ellipse(R*.5,0,R*1.2,R*.85,0,0,7);g.fill();g.stroke();g.fillStyle='#ff7a2a';g.beginPath();g.ellipse(R*.62,0,R*.95,R*.58,0,0,7);g.fill();
 g.fillStyle='#ff8a2a';for(const sg of[-1,1]){g.beginPath();g.moveTo(R*.85,sg*R*.6);g.lineTo(R*2.35,sg*R*(.36+o));g.lineTo(R*2.2,sg*R*.1);g.lineTo(R*1.2,sg*R*.12);g.closePath();g.fill();g.stroke()}
 g.fillStyle='#4a0c06';g.beginPath();g.moveTo(R*1.2,-R*.12);g.lineTo(R*2.2,-R*.1);g.lineTo(R*2.2,R*.1);g.lineTo(R*1.2,R*.12);g.closePath();g.fill();
 g.fillStyle='#fff3c0';for(const sg of[-1,1])for(let i=0;i<2;i++){const x=R*(1.45+i*.4);g.beginPath();g.moveTo(x,sg*R*.13);g.lineTo(x+R*.12,sg*R*.01);g.lineTo(x+R*.24,sg*R*.13);g.fill()}
 g.strokeStyle='#ffd36a';g.lineWidth=R*.2;g.beginPath();g.moveTo(R*.25,-R*.55);g.quadraticCurveTo(-R*.3,-R*1.1,-R*1.25,-R*1.25);g.moveTo(R*.25,R*.55);g.quadraticCurveTo(-R*.3,R*1.1,-R*1.25,R*1.25);g.stroke();
 g.strokeStyle=rgba('#fff3c0',.85);g.lineWidth=1.3;const wh=Math.sin(t/60)*R*.2;g.beginPath();g.moveTo(R*2,-R*.4);g.quadraticCurveTo(R*1.5,-R*1.3,R*.3,-R*1.6+wh);g.moveTo(R*2,R*.4);g.quadraticCurveTo(R*1.5,R*1.3,R*.3,R*1.6-wh);g.stroke();
 g.fillStyle='#fff3c0';g.beginPath();g.ellipse(R*1,-R*.38,R*.22,R*.1,.35,0,7);g.fill();g.beginPath();g.ellipse(R*1,R*.38,R*.22,R*.1,-.35,0,7);g.fill();
 g.globalCompositeOperation='lighter';kaTongue(R*1.9,0,R*1.4,R*.26,0,rgba('#fff3c0',.75))};
// ---- objets au sol
// mur de feu : lit de braises sous les flammes, étincelles qui montent
AUXD.ka_wall=(x,k,t)=>{const c=Math.cos(x.a),s=Math.sin(x.a),px=-s,py=c,A=P(x.x+px*x.len*1.15,x.y+py*x.len*1.15,0),Bq=P(x.x-px*x.len*1.15,x.y-py*x.len*1.15,0);
 g.lineCap='round';g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff5a1a',.14*k);g.lineWidth=70*A.s;g.beginPath();g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.stroke();g.lineWidth=40*A.s;g.stroke();
 g.globalCompositeOperation='source-over';g.strokeStyle=rgba('#1a0a04',.5*k);g.lineWidth=20*A.s;g.stroke();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#e0401a',.6*k);g.lineWidth=11*A.s;g.stroke();g.strokeStyle=rgba('#ffb03a',.6*k);g.lineWidth=4*A.s;g.stroke();
 for(let i=0;i<10;i++){const f=((i*.37+t*.21)%1)*2-1,h=((t*1.3+i*.29)%1),q=P(x.x+px*x.len*f+c*(i%3-1)*6,x.y+py*x.len*f+s*(i%3-1)*6,10+h*90);circ(q.x+Math.sin(t*4+i)*3,q.y,(2.4-h*1.7)*q.s,rgba(i%2?'#ffd36a':'#ff7a2a',.9*k*(1-h)))}};
// shuriken plantés au sol, rougeoyants
AUXD.ka_stuck=(x,k,t)=>{for(let i=0;i<5;i++){const b=x.a+Math.PI+(i-2)*.5,d=x.r*(.2+(i%3)*.22),q=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.85,3),R=6*q.s;
 g.save();g.translate(q.x,q.y);g.scale(1,.55);g.rotate(i*1.3);g.fillStyle='#2e2e36';g.beginPath();for(let j=0;j<4;j++){const a=j*Math.PI/2;g.lineTo(Math.cos(a)*R*1.5,Math.sin(a)*R*1.5);g.lineTo(Math.cos(a+.785)*R*.4,Math.sin(a+.785)*R*.4)}g.closePath();g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff9a3a',.9*k);g.lineWidth=1.4;g.stroke();g.restore();g.save();g.globalCompositeOperation='lighter';kaTongue(q.x,q.y-2*q.s,(12+Math.sin(t*12+i*2)*4)*q.s,3*q.s,-Math.PI/2,rgba('#ffb03a',.8*k));g.restore()}};
// fournaise : cercle de flammes autour du lanceur, chaleur qui monte avec le temps
AUXD.ka_four=(x,k,t)=>{const n=x.n||0,h=1+n*.9;g.fillStyle=rgba('#ff5a1a',(.08+.1*n)*k);gEll(x.x,x.y,x.r);g.fill();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff5a1a',.16*k);g.lineWidth=26;gEll(x.x,x.y,x.r*.94);g.stroke();g.strokeStyle=rgba('#ff7a2a',.6*k);g.lineWidth=3;gEll(x.x,x.y,x.r);g.stroke();
 g.strokeStyle=rgba('#ffd36a',.35*k);g.lineWidth=1.5;g.setLineDash([12,10]);g.lineDashOffset=-t*40;gEll(x.x,x.y,x.r*.62);g.stroke();g.setLineDash([]);
 for(let i=0;i<22;i++){const b=i*.2856+t*.35,w=P(x.x+Math.cos(b)*x.r,x.y+Math.sin(b)*x.r,0),L=(i%2?26:17)*(1+.25*Math.sin(t*9+i*1.7))*h*w.s;kaTongue(w.x,w.y,L,(i%2?6:4.5)*w.s,-Math.PI/2+Math.sin(t*3+i)*.15,rgba(i%2?'#ff7a2a':'#ffb03a',.8*k))}
 for(let i=0;i<8;i++){const b=i*.9+t*.2,d=x.r*((i*.37)%1)*.85,e=(t*.7+i*.31)%1,w=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,e*95*h);circ(w.x,w.y,2.6*w.s*(1-e),rgba('#ffd36a',.9*k*(1-e)))}};
// tornade de feu : entonnoir de rubans de flammes, braises en spirale, fumée au sommet ; le sommet penche vers où elle file (x.a, synchronisé)
AUXD.ka_torn=(x,k,t)=>{const q=P(x.x,x.y,0),S=x.r/78,H=155*q.s*S,rb=x.r*.26*q.s,rt=x.r*1.1*q.s,lx=Math.cos(x.a||0)*16*q.s*S,ly=Math.sin(x.a||0)*6*q.s*S;g.fillStyle=rgba('#1a0a04',.32*k);gEll(x.x,x.y,x.r*.8);g.fill();
 g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ff5a1a',.16*k);gEll(x.x,x.y,x.r);g.fill();g.globalCompositeOperation='source-over';
 for(const [w,col,al] of[[1,'#d8401a',.38],[.6,'#ff8a2a',.42]]){g.fillStyle=rgba(col,al*k);g.beginPath();g.moveTo(q.x-rb*w,q.y);g.quadraticCurveTo(q.x-rt*w*.45+lx*.4,q.y-H*.55+ly*.4,q.x-rt*w+lx,q.y-H+ly);g.lineTo(q.x+rt*w+lx,q.y-H+ly);g.quadraticCurveTo(q.x+rt*w*.45+lx*.4,q.y-H*.55+ly*.4,q.x+rb*w,q.y);g.closePath();g.fill()}
 g.globalCompositeOperation='lighter';for(let i=0;i<11;i++){const e=i/10,y=q.y-e*H+ly*e*e,rx=(rb+(rt-rb)*e*e*.6+(rt-rb)*e*.4),a0=t*9+i*.8;g.strokeStyle=rgba(['#e0401a','#ff7a2a','#ffb03a'][i%3],(.8-e*.3)*k);g.lineWidth=(8-e*4.5)*q.s;g.beginPath();g.ellipse(q.x+Math.sin(t*3+i*.6)*5*q.s+lx*e*e,y,rx,rx*.3,0,a0,a0+3.4);g.stroke()}
 for(let i=0;i<7;i++){const b=i*.898+t*.8;kaTongue(q.x+Math.cos(b)*x.r*.5*q.s,q.y+Math.sin(b)*x.r*.5*q.s*K,(22+8*Math.sin(t*10+i))*q.s*S,5.5*q.s,-Math.PI/2+Math.cos(b)*.3,rgba(i%2?'#ffb03a':'#ff7a2a',.75*k))}
 for(let i=0;i<10;i++){const e=(t*.9+i*.1)%1,b=t*6+i*2.1,rr=(rb+(rt-rb)*e);circ(q.x+Math.cos(b)*rr+lx*e*e,q.y-e*H+Math.sin(b)*rr*.3+ly*e*e,2.4*q.s*(1-e*.5),rgba('#fff3c0',.85*k*(1-e)))}
 g.globalCompositeOperation='source-over';for(let i=0;i<4;i++){const b=t*1.5+i*1.57;g.fillStyle=rgba('#3a2a26',.3*k);g.beginPath();g.ellipse(q.x+Math.cos(b)*rt*.45+lx,q.y-H*1.03+Math.sin(b)*6*q.s+ly,rt*.42,rt*.15,0,0,7);g.fill()}};
// nuée ardente : au sol, l'ombre du nuage et le cercle de charge ; le nuage lui-même (au-dessus des têtes) est dessiné après les ninjas (JFXD.ka_ncloud)
AUXD.ka_nuee=(x,k,t)=>{const n=x.n||0;
 g.fillStyle=rgba('#1a0c08',.22+.25*n);gEll(x.x,x.y,x.r*(.55+.45*n));g.fill();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ff5a1a',.08+.2*n);gEll(x.x,x.y,x.r*n);g.fill();
 g.strokeStyle=rgba('#ff9a3a',.8);g.lineWidth=2+3*n;gEll(x.x,x.y,x.r*Math.max(.05,n));g.stroke();g.strokeStyle=rgba('#ff7a2a',.55);g.lineWidth=1.5;gEll(x.x,x.y,x.r);g.stroke()};
// le nuage de cendres qui s'épaissit, ses braises qui tombent et ses éclairs de feu : suit l'objet « ka_nuee » (synchronisé, donc aussi chez les invités)
JFXD.ka_ncloud=(f,k,e,t)=>{let x=null;for(const a of aux)if(a.type==='ka_nuee'&&Math.abs(a.x-f.x)<2&&Math.abs(a.y-f.y)<2){x=a;break}if(!x)return;
 const q=P(x.x,x.y,0),n=x.n||0,R=x.r*q.s,cy=q.y-(105+15*n)*q.s;g.globalCompositeOperation='lighter';
 for(let i=0;i<10;i++){const e=(t*(.8+n)+i*.1)%1,b=i*2.4,d=x.r*((i*.29)%1)*.9,w=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,(1-e)*(105+15*n));circ(w.x,w.y,(1.6+1.2*n)*w.s,rgba(i%2?'#ffb03a':'#ff5a1a',.8*(1-e*.6)))}
 g.globalCompositeOperation='source-over';for(let i=0;i<7;i++){const b=i*.9+t*.4,s=.55+.5*n+.12*Math.sin(t*2+i);g.fillStyle=rgba(i%2?'#2a2224':'#3a2e2c',.5+.3*n);g.beginPath();g.ellipse(q.x+Math.cos(b)*R*.48,cy+Math.sin(b)*R*.16,R*.36*s,R*.17*s,0,0,7);g.fill()}
 g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const b=i*1.6+t*.9;g.fillStyle=rgba('#ff5a1a',(.12+.3*n)*(.6+.4*Math.sin(t*13+i*3)));g.beginPath();g.ellipse(q.x+Math.cos(b)*R*.3,cy+R*.05,R*.25,R*.09,0,0,7);g.fill()}
 if(rnd()<.25+.5*n){g.strokeStyle=rgba('#ffd36a',.8);g.lineWidth=1.6;g.beginPath();let x0=q.x+(rnd()-.5)*R,y0=cy;g.moveTo(x0,y0);for(let i=0;i<4;i++){x0+=(rnd()-.5)*22*q.s;y0+=10*q.s;g.lineTo(x0,y0)}g.stroke()}};
AUXD.ka_pt=()=>{};AUXD.ka_sbr=()=>{};AUXD.ka_jw=()=>{};AUXD.ka_uncut=()=>{};AUXD.ka_nomouth=()=>{};
// ---- effets (JFXD)
// impact : langues de flammes en étoile et éclat blanc
JFXD.ka_burst=(f,k,e)=>{const q=P(f.x,f.y,22),R=f.r*q.s*(.45+e*.75);g.globalCompositeOperation='lighter';const n=f.big?9:6;
 for(let i=0;i<n;i++){const b=i*6.283/n+f.x*.013,bb=Math.atan2(Math.sin(b)*K,Math.cos(b));kaTongue(q.x+Math.cos(bb)*R*.2,q.y+Math.sin(bb)*R*.2,R*(.75+.3*Math.sin(i*2.3)),R*.2,bb,rgba(i%2?'#ffb03a':'#ff5a1a',.85*k))}
 for(let i=0;i<(f.big?3:2);i++)kaTongue(q.x+(i-1)*R*.3,q.y,R*(1+e*.5),R*.22,-Math.PI/2+(i-1)*.25,rgba('#ffd36a',.8*k));
 circ(q.x,q.y,R*.38*k,rgba('#fff3c0',.95*k));if(f.big){g.strokeStyle=rgba('#ff9a3a',.7*k);g.lineWidth=3*q.s;gEll(f.x,f.y,f.r*(.5+e*.9));g.stroke()}};
// onde de feu au sol (Fournaise, tornade qui grossit, invocation des flammes)
JFXD.ka_wave=(f,k,e)=>{const R=f.r*(.25+e*.8);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff7a2a',.85*k);g.lineWidth=(f.big?7:4)*k+1;gEll(f.x,f.y,R);g.stroke();g.strokeStyle=rgba('#ffd36a',.6*k);g.lineWidth=2;gEll(f.x,f.y,R*.88);g.stroke();
 const n=f.big?14:8;for(let i=0;i<n;i++){const b=i*6.283/n,w=P(f.x+Math.cos(b)*R,f.y+Math.sin(b)*R,0);kaTongue(w.x,w.y,(f.big?26:16)*w.s*k,4*w.s,-Math.PI/2,rgba(i%2?'#ffb03a':'#ff5a1a',.8*k))}};
// mur de feu : la flamme jaillit du centre et court jusqu'aux deux bouts
JFXD.ka_wrise=(f,k,e,t,u)=>{const c=Math.cos(f.a),s=Math.sin(f.a),px=-s,py=c;g.globalCompositeOperation='lighter';
 if(u&&e<.5){const a=P(u.x+c*18,u.y+s*18,8),b=P(f.x,f.y,6);g.strokeStyle=rgba('#ffb03a',.9*(1-e*2));g.lineWidth=5*a.s;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(lerp(a.x,b.x,Math.min(1,e*3)),lerp(a.y,b.y,Math.min(1,e*3)));g.stroke()}
 for(let i=-5;i<=5;i++){const d=Math.abs(i)/5;if(d>e*2.2)continue;const w=P(f.x+px*f.len*1.1*i/5,f.y+py*f.len*1.1*i/5,0),h=(46+12*Math.sin(t*20+i))*w.s*(1-d*.35)*Math.min(1,(e*2.2-d)*3)*k;kaTongue(w.x,w.y,h,7*w.s,-Math.PI/2,rgba(i%2?'#ffd36a':'#ff7a2a',.85*k))}};
// dragon : spirale de feu qui s'enroule autour du lanceur
JFXD.ka_coil=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x,u.y,0);g.globalCompositeOperation='lighter';g.lineCap='round';
 for(let j=0;j<2;j++){g.strokeStyle=rgba(j?'#ffd36a':'#ff7a2a',.85*k);g.lineWidth=(j?2.5:6)*q.s;g.beginPath();for(let i=0;i<=18;i++){const s=i/18,b=s*10+e*9+j*.5,rr=(30-14*s)*q.s,x=q.x+Math.cos(b)*rr,y=q.y-s*95*q.s*Math.min(1,e*2.5)+Math.sin(b)*rr*.35;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}};
// dragon : explosion en gerbe, anneaux et colonne de feu
JFXD.ka_dboom=(f,k,e,t)=>{const q=P(f.x,f.y,0),R=f.r*(.35+e*1.05);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff7a2a',.85*k);g.lineWidth=8*k+1;gEll(f.x,f.y,R);g.stroke();g.strokeStyle=rgba('#ffd36a',.7*k);g.lineWidth=3;gEll(f.x,f.y,R*.8);g.stroke();
 for(let i=0;i<10;i++){const b=i*.628+f.x*.01,w=P(f.x+Math.cos(b)*R*.85,f.y+Math.sin(b)*R*.85,0);kaTongue(w.x,w.y,(30+12*Math.sin(i*1.9))*w.s*k,6*w.s,-Math.PI/2+Math.cos(b)*.5,rgba(i%2?'#ffb03a':'#e0401a',.85*k))}
 for(let i=0;i<5;i++)circ(q.x+(i-2)*7*q.s,q.y-(20+e*110+i%2*14)*q.s,(16-e*8+(i%2)*4)*q.s*k,rgba(i%2?'#ff7a2a':'#ffb03a',.55*k));circ(q.x,q.y-10*q.s,26*q.s*k*k,rgba('#fff3c0',.8*k))};
// nuée ardente : le nuage s'effondre en une vague de feu
JFXD.ka_nboom=(f,k,e,t)=>{const q=P(f.x,f.y,0),R=f.r*(.3+e*.95),pw=f.n||1;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ff5a1a',.25*k);gEll(f.x,f.y,R);g.fill();
 g.strokeStyle=rgba('#ff9a3a',.9*k);g.lineWidth=(6+4*pw)*k+1;gEll(f.x,f.y,R);g.stroke();
 for(let i=0;i<14;i++){const b=i*.449+.2,w=P(f.x+Math.cos(b)*R*.95,f.y+Math.sin(b)*R*.95,0);kaTongue(w.x,w.y,(28+18*pw+10*Math.sin(i*2.7))*w.s*k,7*w.s,-Math.PI/2+Math.cos(b)*.35,rgba(i%2?'#ffd36a':'#ff5a1a',.85*k))}
 for(let i=0;i<6;i++){const b=i*1.05+e*2,w=P(f.x+Math.cos(b)*f.r*.35,f.y+Math.sin(b)*f.r*.3,(1-e)*110);circ(w.x,w.y,(24-e*10)*w.s,rgba('#ff7a2a',.45*k))}
 g.globalCompositeOperation='source-over';for(let i=0;i<5;i++){const b=i*1.26+e;g.fillStyle=rgba('#2a2224',.45*k*k);g.beginPath();g.ellipse(q.x+Math.cos(b)*f.r*.4*q.s,q.y-(1-e)*100*q.s,f.r*.3*q.s*(1+e),f.r*.12*q.s*(1+e),0,0,7);g.fill()}};
// grand souffle : torrent de feu en cône qui suit la visée du lanceur (tant qu'il souffle)
// (le torrent part de la bouche, à hauteur de tête, et retombe en nappe jusqu'au sol au bout du cône)
JFXD.ka_cone=(f,k,e,t,u)=>{if(!u||u.dead||!u.flame)return;const el=e*f.m,R=Math.min(330,140+190*el/.35),A=.88,a=u.aim,o={x:u.x+Math.cos(a)*16,y:u.y+Math.sin(a)*16};g.globalCompositeOperation='lighter';
 const wedge=(r,w,col,zA,zE)=>{g.fillStyle=col;g.beginPath();const c=P(o.x,o.y,zA);g.moveTo(c.x,c.y);for(let i=0;i<=8;i++){const b=a-w+2*w*i/8,rr=r*(.92+.08*Math.sin(t*14+i*1.9)),p=P(o.x+Math.cos(b)*rr,o.y+Math.sin(b)*rr,zE);g.lineTo(p.x,p.y)}g.closePath();g.fill()};
 const fd=Math.min(1,k*6);wedge(R,A,rgba('#e0401a',.22*fd),42,6);wedge(R*.85,A*.75,rgba('#ff7a2a',.26*fd),46,14);wedge(R*.6,A*.5,rgba('#ffd36a',.24*fd),48,22);
 for(let i=0;i<9;i++){const f=(t*1.6+i*.37)%1,b=a+(((i*.618)%1)*2-1)*A*.8*f,rr=R*(.12+.8*f),p=P(o.x+Math.cos(b)*rr,o.y+Math.sin(b)*rr,44-32*f);kaTongue(p.x,p.y,(16+30*f)*p.s*fd,(4+5*f)*p.s,Math.atan2(Math.sin(b)*K,Math.cos(b)),rgba(f<.5?'#fff3c0':'#ffb03a',.55*fd*(1-f*.6)))}
 for(let i=0;i<11;i++){const b=a-A+2*A*i/10,rr=R*(.82+.16*Math.sin(t*11+i*2.3)),p=P(o.x+Math.cos(b)*rr,o.y+Math.sin(b)*rr,6);kaTongue(p.x,p.y,(26+10*Math.sin(t*16+i))*p.s*fd,6*p.s,-Math.PI/2+Math.sin(b-a)*.6,rgba(i%2?'#ffb03a':'#ff5a1a',.75*fd))}};
// ---- états visibles sur les ninjas
STATD.push((u,p,S)=>{const t=performance.now()/1000;
 // fournaise : la chaleur monte sur la cible qui y reste
 if(u.ka_ht>0){const h=u.ka_ht;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ff7a2a',.35+.5*h);g.lineWidth=2+3*h;g.beginPath();g.ellipse(p.x,p.y,(18+10*h)*S,(7+4*h)*S,0,0,7);g.stroke();
  for(let i=0;i<3;i++){const b=i*2.1+t*2;kaTongue(p.x+Math.cos(b)*13*S,p.y-4*S+Math.sin(b)*4*S,(10+22*h+4*Math.sin(t*12+i))*S,3.5*S,-Math.PI/2,rgba(i%2?'#ffb03a':'#ff5a1a',.45+.4*h))}g.restore()}
 // flammes chargées : des flammes follettes à la place des orbes
 if(u.jstN&&u.jstV==='fire'){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<u.jstN;i++){const a=t*3+i*Math.PI*2/u.jstN,q=P(u.x+Math.cos(a)*30,u.y+Math.sin(a)*22,46);kaTongue(q.x,q.y+2*q.s,(15+4*Math.sin(t*14+i))*q.s,5*q.s,-Math.PI/2+Math.cos(a)*.4,rgba(i%2?'#ffb03a':'#ff7a2a',.85))}g.restore()}
 // grand souffle : cône d'alerte pendant les mudras
 if(u.cast&&!u.dead){const ab=u.ch.abil[u.cast.i];if(ab&&ab.key==='ka_breath'){const a=u.cast.aimOv??u.aim,kk=Math.min(1,u.cast.t/u.cast.dur),col=u.team?'#ff5050':'#5ab8ff';g.save();
  const cone=(r,al)=>{g.beginPath();const c=P(u.x+Math.cos(a)*24,u.y+Math.sin(a)*24,0);g.moveTo(c.x,c.y);for(let i=0;i<=10;i++){const b=a-.88+1.76*i/10,w=P(u.x+Math.cos(b)*r,u.y+Math.sin(b)*r,0);g.lineTo(w.x,w.y)}g.closePath();g.fillStyle=rgba(col,al);g.fill()};
  cone(330,.1);cone(24+306*kk,.18);g.restore()}}});
// ---- animations 3D
Object.assign(ANIM,{
 // Flamme : signe du tigre à la bouche (fin des mudras), le buste jaillit et la main droite désigne la cible
 ka_spit:(P,e)=>{const a=1,b=ezo(Math.min(1,e/.3)),r=a*(1-b);pz(P,'armL',-1.35,0,-.35);pz(P,'foreL',-2.3);pz(P,'armR',-1.35-.25*b,0,.35-.45*b);pz(P,'foreR',-2.3+2.15*b);
  pz(P,'chest',-.3*r+.35*b,-.2*b);pz(P,'head',-.25*r+.15*b);P.root.z=-2*r+5*b;P.root.y=-1.5*b;pz(P,'thighL',-.45*b);pz(P,'shinL',.5*b);pz(P,'thighR',.3*b)},
 // Mur de feu : la main balaie l'air de gauche à droite
 ka_sweep:(P,e)=>{const k=ezio(Math.min(1,e/.65));pz(P,'armR',-1.5,0,.6-1.9*k);pz(P,'foreR',-.15);pz(P,'armL',-1.1,0,-.3);pz(P,'foreL',-1.8);pz(P,'chest',.15,.4-.8*k);P.root.y=-2;pz(P,'thighL',-.4);pz(P,'shinL',.6);pz(P,'thighR',.3);pz(P,'shinR',.4)},
 // Triple flamme : gauche, droite, poussée des deux mains
 ka_jabL:(P,e)=>{const k=bump(Math.min(1,e*1.3));pz(P,'armL',-.4-1.25*k,0,-.15*k);pz(P,'foreL',-1.6+1.5*k);pz(P,'armR',-1,0,.3);pz(P,'foreR',-1.8);pz(P,'chest',.15*k,-.35*k);P.root.z=4*k},
 ka_jabR:(P,e)=>{const k=bump(Math.min(1,e*1.3));pz(P,'armR',-.4-1.25*k,0,.15*k);pz(P,'foreR',-1.6+1.5*k);pz(P,'armL',-1,0,-.3);pz(P,'foreL',-1.8);pz(P,'chest',.15*k,.35*k);P.root.z=4*k},
 ka_push:(P,e)=>{const k=e<.35?ezo(e/.35):1-(e-.35)/.65*.4;pz(P,'armL',-1.58*k,0,-.22);pz(P,'armR',-1.58*k,0,.22);pz(P,'foreL',-.1);pz(P,'foreR',-.1);pz(P,'chest',.28*k);P.root.z=7*k;P.root.y=-2.5*k;pz(P,'thighR',-.6*k);pz(P,'shinR',.7*k);pz(P,'thighL',.35*k)},
 // Shuriken aériens : bras armés au-dessus de la tête puis lancer vers le bas en plein saut
 ka_air:(P,e)=>{const up=e<.35,k=up?e/.35:ezo(Math.min(1,(e-.35)/.3));pz(P,'armL',up?-2.9*k:-2.9+1.6*k,0,.25+.45*(up?0:k));pz(P,'armR',up?-2.9*k:-2.9+1.6*k,0,-.25-.45*(up?0:k));pz(P,'foreL',-.5);pz(P,'foreR',-.5);
  pz(P,'chest',up?-.3*k:-.3+.75*k);pz(P,'head',up?-.2:.2);pz(P,'thighL',-1.1);pz(P,'shinL',1.7);pz(P,'thighR',-.7);pz(P,'shinR',1.5);P.rootR.x=up?-.3*k:-.3+.5*k},
 // Fournaise : s'accroupit mains jointes, puis se redresse bras écartés (le brasier jaillit)
 ka_stomp:(P,e)=>{const a=Math.min(1,e/.3),b=e<.3?0:ezo(Math.min(1,(e-.3)/.25));P.root.y=-5*a*(1-b)+1.5*b;pz(P,'thighL',-.5*a*(1-b),0,.25*b);pz(P,'shinL',.9*a*(1-b));pz(P,'thighR',.2*(1-b),0,-.25*b);pz(P,'shinR',.6*a*(1-b));
  pz(P,'armL',-1.2*a*(1-b)-.35*b,0,-.3*a*(1-b)+1.15*b);pz(P,'armR',-1.2*a*(1-b)-.35*b,0,.3*a*(1-b)-1.15*b);pz(P,'foreL',-1.8*a*(1-b)-.15*b);pz(P,'foreR',-1.8*a*(1-b)-.15*b);pz(P,'chest',.35*a*(1-b)-.2*b);pz(P,'head',.2*a*(1-b)-.35*b)},
 // Boule de feu suprême : bombé par l'inspiration (pendant les mudras), le corps entier souffle
 ka_goka:(P,e)=>{const a=1,b=ezo(Math.min(1,e/.3)),r=a*(1-b);pz(P,'armL',-1.35,0,-.35);pz(P,'foreL',-2.3);pz(P,'armR',-1.35,0,.35);pz(P,'foreR',-2.3);
  pz(P,'chest',-.45*r+.45*b);pz(P,'head',-.4*r+.2*b);P.root.y=2*r-3.5*b;P.root.z=-4*r+6*b;P.rootR.x=-.1*r;pz(P,'thighR',.45*b);pz(P,'shinR',.35*b);pz(P,'thighL',-.65*b);pz(P,'shinL',.8*b)},
 // Flammes chargées : main levée qui fait naître les flammes, puis petit geste sec pour chaque tir
 ka_wisps:(P,e)=>{const k=Math.min(1,e/.3);pz(P,'armR',-2.5*k,0,-.35);pz(P,'foreR',-.9*k);pz(P,'armL',-.8,0,.35);pz(P,'foreL',-1.1);pz(P,'head',-.25*k);pz(P,'chest',-.12*k)},
 ka_flick:(P,e)=>{const k=bump(Math.min(1,e*1.4));pz(P,'armR',-1.1-.55*k,0,.05);pz(P,'foreR',-1.2+1.1*k);pz(P,'armL',-.6,0,.3);pz(P,'foreL',-1.2);pz(P,'chest',.1*k,.25*k);P.root.z=2.5*k},
 // Dragon de feu : souffle le dragon, puis les deux bras le guident
 ka_dragon:(P,e)=>{const a=1,b=ezo(Math.min(1,e/.25)),c=e<.35?0:ezo(Math.min(1,(e-.35)/.3)),r=a*(1-b);pz(P,'armL',-1.35-.22*c,0,-.35+.3*c);pz(P,'foreL',-2.3+2.15*c);pz(P,'armR',-1.35-.22*c,0,.35-.3*c);pz(P,'foreR',-2.3+2.15*c);
  pz(P,'chest',-.4*r+.4*b-.1*c);pz(P,'head',-.35*r+.25*b);P.root.y=1.5*r-3*b;P.root.z=-3*r+6*b;pz(P,'thighR',.4*b);pz(P,'shinR',.3*b);pz(P,'thighL',-.6*b);pz(P,'shinL',.7*b)},
 // Nuée ardente : bras levés au ciel pendant la canalisation, puis abattus d'un coup
 ka_call:(P,e,u,t)=>{const k=Math.min(1,e*8);pz(P,'armL',-2.95*k,0,.45);pz(P,'armR',-2.95*k,0,-.45);pz(P,'foreL',-.35);pz(P,'foreR',-.35);pz(P,'head',-.45*k);pz(P,'chest',-.22*k);P.root.y=Math.sin(t*6)*.5},
 ka_slam:(P,e)=>{const k=ezo(Math.min(1,e/.35));pz(P,'armL',-2.95+2.3*k,0,.45-.2*k);pz(P,'armR',-2.95+2.3*k,0,-.45+.2*k);pz(P,'foreL',-.3);pz(P,'foreR',-.3);pz(P,'chest',-.2+.75*k);pz(P,'head',-.45+.6*k);P.root.y=-6*k;pz(P,'thighL',-.6*k);pz(P,'shinL',1*k);pz(P,'thighR',-.3*k);pz(P,'shinR',.9*k)},
 // Grand souffle : le corps cambré se projette dans le souffle
 ka_blast:(P,e)=>{const a=1,b=ezo(Math.min(1,e/.4)),r=a*(1-b);pz(P,'armL',-1.35,0,-.35);pz(P,'foreL',-2.3);pz(P,'armR',-1.35,0,.35);pz(P,'foreR',-2.3);
  pz(P,'chest',-.4*r+.35*b);pz(P,'head',-.35*r+.12*b);P.root.y=1.5*r-2*b;P.root.z=-3*r+3*b;pz(P,'thighR',.4*b);pz(P,'shinR',.3*b);pz(P,'thighL',-.55*b);pz(P,'shinL',.7*b)},
});

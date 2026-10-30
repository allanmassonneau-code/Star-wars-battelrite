// ===== Clan Hakumei (c13, préfixe hm_) : araignées assassines =====
// Identité : la soie. Fils et toiles collent, entravent et tirent (Fil, Toile, Filet, Étreinte) ; l'Arc d'or tire de très loin (façon Kidômaru) ;
// les araignées invoquées traquent (Nuée, Araignée géante) ; l'assassin frappe puis disparaît (Filin, Mue, Armure d'or).
// Trait : chaque jutsu pose des fils sur l'ennemi ; au 4e fil il est englué (entravé, puis il subit +20 % des Hakumei).
// Combo signature : Toile ou Filet (2 fils) → Fil (3e) → Étreinte de soie (elle consomme les fils : jusqu'à 54 dégâts).
const HMD={
 fil:'Fil collant (12 dégâts, 1 fil) ; la cible reste liée 2 s, ralentie, puis le fil se rétracte et la tire vers toi',
 toile:'Boule de soie (8 dégâts) qui tisse une toile 5 s : ralentit ; 1 s dessus = entravé 0,5 s et 1 fil. Sur ta toile, tu cours plus vite',
 filet:'Grand filet qui arrête les tirs ennemis ; la 1re cible est emmaillotée : 16 dégâts, entravée 1 s, 2 fils',
 nuee:'Un cocon (5 dégâts) éclate en 5 bébés araignées qui traquent les ennemis : chaque morsure fait 4 dégâts, ralentit et pose ½ fil',
 armure:'Armure d\'or (Kumo Nenkin) : bouclier de 26 pendant 3,5 s ; qui te frappe au corps à corps prend 1 fil et est ralenti',
 etreinte:'Des fils s\'ancrent autour de la cible ; 0,6 s après, ceux restés dans le cercle sont étranglés : 22 dégâts +8 par fil (consommés), silence 0,9 s',
 filin:'Un fil t\'arrache jusqu\'au point visé ; une petite toile reste à ton point de départ (3 s)',
 mue:'Tu laisses ta mue et fuis invisible 1,5 s (prochain coup +50 %) ; la mue explose en fils si un ennemi l\'approche : 10 dégâts, entravé 0,7 s, 1 fil',
 geante:'Une araignée géante s\'abat sur la zone (30 dégâts, étourdit 0,7 s), tisse une toile et crache 3 fois de la soie sur les ennemis (7 dégâts, 1 fil)',
 arc:'Bande l\'arc d\'or jusqu\'à 1,2 s (relancer pour tirer plus tôt) : flèche guidée par ta visée, 34 à 64 dégâts, perce chargée à 60 %, 1 à 2 fils'};
KIT('c13',[
 [1,'D','x.hm_fil','Fil d\'araignée',HMD.fil,'silk'],
 [3,'C','x.hm_toile','Toile collante',HMD.toile,'silk'],
 [1,'B','x.hm_filet','Filet d\'araignée',HMD.filet,'silk'],
 [4,'B','x.hm_nuee','Nuée d\'araignées',HMD.nuee,'silk'],
 [4,'C','x.hm_armure','Armure d\'or',HMD.armure,'silk'],
 [3,'A','x.hm_etreinte','Étreinte de soie',HMD.etreinte,'silk'],
 [2,'C','x.hm_filin','Filin d\'araignée',HMD.filin,'silk'],
 [2,'B','x.hm_mue','Mue de l\'araignée',HMD.mue,'silk'],
 [5,'S','x.hm_geante','Invocation : Araignée géante',HMD.geante,'silk'],
 [5,'A','x.hm_arc','Arc d\'or : Kumo Senkyû',HMD.arc,'silk'],
]);
// styles de combat propres au clan (ajoutés à la fin de STYLES)
STYLES.push(['Soie dorée','Kunai d\'or à longue portée ; tous les 5 lancers, un kunai tire un fil : il ralentit et pose 1 fil','x.hm_st_or','silk','kunai',[13],.76,.76],
 ['Crocs d\'araignée','Griffures rapides ; le 5e coup est une morsure venimeuse : poison, ralentit et pose 1 fil','x.hm_st_croc','silk','claws',[13],1.24,1.2]);

// ---------- couleurs et outils ----------
const HMC={silk:'#eef0f6',silk2:'#c8c0dc',vio:'#b48ae0',pur:'#6a4a8a',dark:'#2a1a3a',gold:'#f0c040',gold2:'#c8901a',red:'#e0304a'};
const hm_I=u=>units.indexOf(u);
const HM_MAX=4,HM_FILT=5,HM_GLU=3,HM_IMM=4,HM_VULN=1.2; // fils pour engluer, durée des fils, durée de la faiblesse, immunité après, bonus de dégâts
// pose n fils sur t (n peut valoir ½) ; au 4e fil : englué
function hm_fil(src,t,n){if(!t||t.dead||!src||t.team===src.team||state!=='fight')return;if((t.hm_imm||0)>SIMT)return;
 if(!((t.hm_filE||0)>SIMT))t.hm_fil=0;t.hm_fil=Math.min(HM_MAX,(t.hm_fil||0)+n);t.hm_filE=SIMT+HM_FILT;
 if(t.hm_fil>=HM_MAX){t.hm_fil=0;t.hm_imm=SIMT+HM_IMM;t.hm_gluE=SIMT+HM_GLU;t.hm_glu=HM_GLU;
  if(t.unstop<=0){t.root=Math.max(t.root,.7);t.rootV='silk'}t.stealth=0;say(t,'ENGLUÉ','#e8d8ff');
  jx({jfx:'hm_cocoon',ti:hm_I(t),x:t.x,y:t.y,t:.8,m:.8});if(near(t.x,t.y)){sparks(t.x,t.y,HMC.silk,10);S('bone',t)}}}
// tient compte des fils et de la faiblesse sur tous les ninjas (l'hôte calcule, les invités reçoivent hm_fil et hm_glu)
function hm_tick(){for(const e of units){if(e.hm_fil>0&&!((e.hm_filE||0)>SIMT))e.hm_fil=0;if(e.hm_glu>0)e.hm_glu=Math.max(0,(e.hm_gluE||0)-SIMT)}}
AFTER.push(()=>{const A=auxUpdate;auxUpdate=function(dt){A(dt);hm_tick()};
 // relance de l'Arc d'or pendant qu'on bande : on tire sans repasser par l'annonce d'ultime (pas de 2e cut-in, de cri ni de nom affiché)
 const F=fire;fire=function(u,ab,a,td,ex){if(ab&&ab.key==='hm_arc'&&u.hm_bw){if(u.human||u.hm_bw.t>=1.1){const C=CUR;CUR=u;hm_loose(u);CUR=C}else u.cds[u.hm_bw.i]=.3;return}return F(u,ab,a,td,ex)};UK.push('hm_fil','hm_glu','hm_bow','hm_arm');Object.assign(VP,{silk:[HMC.silk,HMC.vio,HMC.gold]})});
const hm_free=e=>e.unstop<=0&&!(e.slowImm>0)&&!e.dead; // un ninja qu'on peut freiner
// toile au sol (Toile collante, Filin, Araignée géante) : n = graine de la forme
function hm_web(u,x,y,r,t){aux.push({type:'hm_web',x,y,r,t,m:t,team:u.team,owner:u,ui:hm_I(u),n:(rnd()*6.28*100|0)/100,k:0,in:new Map(),done:new Set(),danger:1})}

Object.assign(NAT,{
 // Fil d'araignée : fil collant, lien de 2 s (ralentit), puis rétraction qui tire la cible
 hm_fil:SP('Fil d\'araignée',HMD.fil,7,{hero:'boba',line:{len:500,w:18},ai:RG(480,.6)},(u,a)=>{S('blaster',u);anim(u,'hm_spit',.35);jx({jfx:'hm_mouth',ui:hm_I(u),x:u.x,y:u.y,a,t:.3,m:.3});
  proj(u,a,{spd:900,r:7,dmg:12,life:.56,col:HMC.silk,kind:'hm_thread',noClash:1,onHit:(p,t)=>{const o=p.owner;hm_fil(o,t,1);if(t.dead||o.dead)return;
   for(const x of aux)if(x.type==='hm_line'&&x.owner===o)x.t=0;aux.push({type:'hm_line',x:t.x,y:t.y,t:2,m:2,team:o.team,owner:o,tg:t,ui:hm_I(o),ti:hm_I(t),k:0});say(t,'LIÉ','#e8d8ff')}})}),
 // Toile collante : boule de soie lancée en cloche, la toile se tisse à l'impact
 hm_toile:SP('Toile collante',HMD.toile,11,{hero:'cal',tele:{r:95,max:420},ai:RG(420,.5)},(u,a,td)=>{const d=clamp(td||300,80,420),T=d/560;S('bugs',u);anim(u,'hm_spit',.4);jx({jfx:'hm_mouth',ui:hm_I(u),x:u.x,y:u.y,a,t:.3,m:.3});
  proj(u,a,{spd:560,r:9,dmg:8,ar:95,life:T,col:HMC.silk,grenade:1,tx:u.x+Math.cos(a)*(d+24),ty:u.y+Math.sin(a)*(d+24),kind:'hm_glob'});
  const tx=clamp(u.x+Math.cos(a)*(d+24),B.x+20,B.x+B.w-20),ty=clamp(u.y+Math.sin(a)*(d+24),B.y+20,B.y+B.h-20);later(u,T,()=>{if(state==='fight')hm_web(u,tx,ty,95,5)})}),
 // Kumo Sôkei : grand filet qui avale les tirs ; emmaillote la 1re cible
 hm_filet:SP('Filet d\'araignée',HMD.filet,11,{hero:'cal',line:{len:460,w:52},ai:RG(440,.6)},(u,a)=>{S('bugs',u);S('dash',u);anim(u,'hm_net',.45);
  proj(u,a,{spd:560,r:24,dmg:16,life:.82,col:HMC.silk,kind:'hm_net',noClash:1,root:1,onHit:(p,t)=>{hm_fil(p.owner,t,2);if(t.root>0)jx({jfx:'hm_wrap',ti:hm_I(t),x:t.x,y:t.y,t:1,m:1});S('bone',t)}});
  aux.push({type:'hm_netc',x:u.x,y:u.y,r:0,t:1,m:1,team:u.team,owner:u,p:projs[projs.length-1],k:0})}),
 // Kuchiyose : cocon de bébés araignées
 hm_nuee:SP('Nuée d\'araignées',HMD.nuee,12,{hero:'iden',tele:{r:70,max:380},ai:RG(400,.6)},(u,a,td)=>{const d=clamp(td||280,60,380),T=d/600;S('poof',u);anim(u,'hm_summon',.5);
  proj(u,a,{spd:600,r:10,dmg:5,ar:60,life:T,col:HMC.silk,grenade:1,tx:u.x+Math.cos(a)*(d+24),ty:u.y+Math.sin(a)*(d+24),kind:'hm_sac'});
  const tx=clamp(u.x+Math.cos(a)*(d+24),B.x+20,B.x+B.w-20),ty=clamp(u.y+Math.sin(a)*(d+24),B.y+20,B.y+B.h-20);
  later(u,T,()=>{if(state!=='fight')return;jx({jfx:'hm_hatch',x:tx,y:ty,r:60,t:.6,m:.6});S('bugs',u);for(let i=0;i<5;i++){const b=i*1.2566+rnd()*.4;
   aux.push({type:'hm_spid',x:tx+Math.cos(b)*14,y:ty+Math.sin(b)*14,a:b,r:6,t:4.5,m:4.5,team:u.team,owner:u,ui:hm_I(u),ti:-1,n:0,w:i,k:.15+i*.06,tg:null})}})}),
 // Kumo Nenkin no Yoroi : armure d'or (le trait colle les fils aux attaquants)
 hm_armure:SP('Armure d\'or',HMD.armure,13,{hero:'thrawn',ai:DEF},(u)=>{S('deflect',u);S('rock',u);anim(u,'hm_armor',.55);shieldU(u,26,3.5);u.hm_armE=SIMT+3.5;u.hm_arm=3.5;
  jx({jfx:'hm_gild',ui:hm_I(u),x:u.x,y:u.y,t:.6,m:.6});sparks(u.x,u.y,HMC.gold,10)}),
 // Étreinte de soie : cercle d'ancrage autour de la cible ; les fils se referment 0,6 s plus tard
 hm_etreinte:SP('Étreinte de soie',HMD.etreinte,12,{hero:'kylo',tele:{r:80,max:420},ai:RG(400,.55)},(u,a,td)=>{const e=pick(u,a,td||300,420),p=e&&dist(u,e)<460?{x:e.x,y:e.y}:atP(u,a,td,420);
  S('shadow',u);anim(u,'hm_pull',.85);aux.push({type:'hm_strg',x:p.x,y:p.y,r:80,t:.6,m:.6,team:u.team,owner:u,ui:hm_I(u),k:0,danger:1});jx({jfx:'hm_cast',ui:hm_I(u),x:u.x,y:u.y,a:Math.atan2(p.y-u.y,p.x-u.x),len:Math.hypot(p.x-u.x,p.y-u.y),t:.6,m:.6})}),
 // Filin : le fil s'accroche au point visé et arrache le ninja ; une petite toile reste au départ
 hm_filin:SP('Filin d\'araignée',HMD.filin,8,{hero:'boba',ai:{mode:'esc',max:190,p:.5}},(u,a,td)=>{const d=clamp(td||280,100,300),p=fwd(u,a,d),sx=u.x,sy=u.y;S('dash',u);S('blaster',u);anim(u,'hm_swing',.42);
  jx({jfx:'hm_zip',ui:hm_I(u),x:p.x,y:p.y,sx,sy,t:.45,m:.45});hm_web(u,sx,sy,70,3);dash(u,Math.atan2(p.y-u.y,p.x-u.x),Math.hypot(p.x-u.x,p.y-u.y),.3,{jump:46,end:()=>{sparks(u.x,u.y,HMC.silk,6)}})}),
 // Mue : la mue reste (piège), le ninja fuit invisible
 hm_mue:SP('Mue de l\'araignée',HMD.mue,15,{hero:'ahsoka',ai:ESC},(u,a,td)=>{const d=clamp(td||220,120,240);S('poof',u);S('dash',u);
  aux.push({type:'hm_husk',x:u.x,y:u.y,a:u.aim,r:55,t:3,m:3,team:u.team,owner:u,ui:hm_I(u),k:.35,danger:1});jx({jfx:'hm_shed',x:u.x,y:u.y,t:.5,m:.5});
  anim(u,'hm_crouch',.3);dash(u,a,d,.28,{jump:22,end:()=>{u.stealth=Math.max(u.stealth||0,1.5)}});u.stealth=Math.max(u.stealth||0,1.8)}),
 // Kuchiyose : araignée géante (chute, toile, crachats)
 hm_geante:ULT('Invocation : Araignée géante',HMD.geante,{hero:'iden',tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);S('poof',u);S('roar',u);anim(u,'hm_summon',.7);
  zone(u,p.x,p.y,120,30,.75,{stun:.7},HMC.pur);lastZ().deto='hm_quake';
  aux.push({type:'hm_giant',x:p.x,y:p.y,a:Math.atan2(p.y-u.y,p.x-u.x),r:60,t:6.75,m:6.75,team:u.team,owner:u,ui:hm_I(u),n:3,k:1.65,ti:-1});
  later(u,.75,()=>{if(state==='fight')hm_web(u,p.x,p.y,130,6)})}),
 // Kumo Senkyû : bander l'arc d'or (relancer pour tirer), sinon la flèche part seule à pleine charge
 hm_arc:ULT('Arc d\'or : Kumo Senkyû',HMD.arc,{hero:'boba',line:{len:900,w:24},ai:RG(680,.8,160)},(u,a)=>{const i=u.ch.abil.findIndex(x=>x.key==='hm_arc');if(i<0)return;
  if(u.hm_bw){if(!u.human&&u.hm_bw.t<1.1){u.cds[i]=.3;return} // les bots tirent à pleine charge (relance normalement interceptée par fire, voir AFTER)
   hm_loose(u);return}
  u.hm_bw={t:0,i,cd:u.ch.abil[i].cd};u.jst={key:'hm_arc',i,n:0,t:2.5,cd:u.ch.abil[i].cd,v:'silk'};u.cds[i]=u.human?.3:1.3;u.hm_bow=.01;anim(u,'hm_draw',1.6);S('deflect',u);
  jx({jfx:'hm_forge',ui:hm_I(u),x:u.x,y:u.y,t:.45,m:.45})}),
 // ---------- styles ----------
 // Soie dorée : kunai d'or ; le 5e lancer tire un fil (ralentit, 1 fil)
 hm_st_or:SP('Soie dorée','',.34,{hero:'lando',ai:{max:640,p:.85}},(u,a)=>{if(SIMT-(u.hm_kt||-9)>1.6)u.hm_kn=0;u.hm_kt=SIMT;u.hm_kn=(u.hm_kn||0)%5+1;const th=u.hm_kn===5;S('blaster',u);
  proj(u,a,{spd:960,r:5,dmg:th?6:8,life:.66,col:HMC.gold,kind:th?'hm_gkt':'hm_gk',o:th?{slow:.6}:null,onHit:th?(p,t)=>{hm_fil(p.owner,t,1);sparks(t.x,t.y,HMC.silk,4)}:null});
  anim(u,th?'hm_spit':u.hm_kn%2?'st_kthr':'st_kthl',.26)}),
 // Crocs d'araignée : griffures rapides ; 5e coup : morsure venimeuse
 hm_st_croc:SP('Crocs d\'araignée','',.3,{hero:'ventress',melee:1,ai:{max:86,p:1}},(u,a)=>{const c=stC(u),T=[0,[80,1.9,6,.28],[80,1.9,6,.28],[84,2.1,7,.3],[88,1.9,7,.32],[96,1.6,8,.5]][c];
  if(c===5)stLunge(u,a,40);
  const n=stMelee(u,a,T[0],T[1],T[2],c===5?{dot:{dps:3,dur:3},slow:.8}:{},[0,{d:-1,tl:.6,z:34,th:5,n:3,claw:1,c:HMC.silk,c2:HMC.vio},{d:1,tl:-.6,z:34,th:5,n:3,claw:1,c:HMC.silk,c2:HMC.vio},{d:1,tl:1.4,z:30,th:5,n:3,claw:1,rr:.65,c:HMC.silk,c2:HMC.vio},{d:-1,z:26,th:5,n:3,claw:1,c:HMC.silk,c2:HMC.vio},0][c],
   c===5?e=>{hm_fil(u,e,1);jx({jfx:'hm_fang',ui:hm_I(u),ti:hm_I(e),x:e.x,y:e.y,a,t:.42,m:.42});S('bone',u)}:null);
  if(c===5&&!n)jx({jfx:'hm_fang',ui:hm_I(u),x:u.x+Math.cos(a)*50,y:u.y+Math.sin(a)*50,a,t:.3,m:.3,miss:1});
  stCd(u,T[3]);anim(u,'st_inu'+c,c===5?.36:.24)}),
});
Object.assign(NATHERO,{hm:'kylo'});

// tir de l'arc : la puissance suit le temps passé à bander
function hm_loose(u){const bw=u.hm_bw;if(!bw)return;const c=clamp((bw.t-.1)/1.1,0,1),a=u.aim,full=c>=.6;u.hm_bw=null;u.hm_bow=0;if(u.jst&&u.jst.key==='hm_arc')u.jst=null;u.cds[bw.i]=bw.cd;
 const V=VFX;VFX='silk';S('blaster',u);S('wind',u);anim(u,'hm_loose',.4);
 proj(u,a,{spd:1150,r:8+c*5,dmg:34+30*c,life:(600+420*c)/1150,col:HMC.gold,kind:'hm_arrow',vfx:'silk',jn:'Arc d\'or : Kumo Senkyû',steer:1,pierce:full?1:0,noClash:full?1:0,o:{kb:60+100*c},
  onHit:(p,t)=>{hm_fil(p.owner,t,c>=.99?2:1);jx({jfx:'hm_pierce',x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.45,m:.45,big:full?1:0});if(near(t.x,t.y)){sparks(t.x,t.y,HMC.gold,full?12:6);S('bone',t)}}});
 jx({jfx:'hm_snap',ui:hm_I(u),x:u.x,y:u.y,a,t:.35,m:.35,big:full?1:0});if(full&&near(u.x,u.y))shake=Math.max(shake,.15);VFX=V;if(c>=.99)say(u,'PLEINE CHARGE','#ffe08a')}

// ---------- logique des objets (hôte) ----------
// fil tendu : ralentit la cible ; à la fin, il se rétracte et la tire vers le lanceur
AUXF.hm_line=(x,dt)=>{const o=x.owner,e=x.tg;if(!o||o.dead||!e||e.dead||state!=='fight'){x.t=0;return}x.x=e.x;x.y=e.y;const d=dist(o,e);
 if(d>650){x.t=0;say(e,'FIL ROMPU','#c8c0dc');return}
 if(hm_free(e))e.slow=Math.max(e.slow,.15);
 if(x.t<=0&&!x.done){x.done=1;if(e.unstop<=0&&!e.dash&&d>90){const a=ang(e,o),L=Math.min(130,d-70);e.dash={sx:e.x,sy:e.y,tx:clamp(e.x+Math.cos(a)*L,B.x+e.r,B.x+B.w-e.r),ty:clamp(e.y+Math.sin(a)*L,B.y+e.r,B.y+B.h-e.r),t:0,dur:.24,jump:8};
  e.cast=null;say(e,'TIRÉ','#e8d8ff');jx({jfx:'hm_yank',ui:x.ui,ti:x.ti,x:e.x,y:e.y,t:.3,m:.3});S('dash',o)}}};
// toile : ralentit les ennemis ; 1 s dessus = entravé 0,5 s + 1 fil (une fois par toile) ; le lanceur y court plus vite
AUXF.hm_web=(x,dt)=>{const o=x.owner;if(x.t<=0)return;
 if(o&&!o.dead&&Math.hypot(o.x-x.x,o.y-x.y)<x.r+o.r)o.haste=Math.max(o.haste||0,.15);
 for(const e of units){if(e.dead||e.team===x.team)continue;const inside=Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r*.5;if(!inside||e.z>12||e.airT>0){x.in.delete(e);continue}
  if(hm_free(e))e.slow=Math.max(e.slow,.15);if(x.done.has(e))continue;const v=(x.in.get(e)||0)+dt;x.in.set(e,v);
  if(v>=1){x.done.add(e);VFX='silk';hit(e,o,0,{root:.5,silent:1});VFX=null;hm_fil(o,e,1);say(e,'COLLÉ','#e8d8ff');jx({jfx:'hm_wrap',ti:hm_I(e),x:e.x,y:e.y,t:.5,m:.5,low:1})}}};
// filet : avale les tirs ennemis qu'il croise
AUXF.hm_netc=x=>{const p=x.p;if(!p||p.dead||p.life<=0||projs.indexOf(p)<0){x.t=0;return}x.x=p.x;x.y=p.y;
 for(const q of projs)if(q!==p&&q.owner&&q.owner.team!==x.team&&!q.grenade&&!q.dead&&q.life>0&&Math.hypot(q.x-p.x,q.y-p.y)<p.r+q.r+4){q.life=0;if(q.rocket)q.boom=1;if(near(q.x,q.y))sparks(q.x,q.y,HMC.silk,5)}};
// bébé araignée : traque l'ennemi le plus proche, mord une fois
AUXF.hm_spid=(x,dt)=>{const o=x.owner;if(!o||o.dead||state!=='fight'){x.t=0;return}if(x.n===1)return;
 if(x.k<=0){x.k=.3;let e=null,bd=380;for(const v of enemies(o)){const d=Math.hypot(v.x-x.x,v.y-x.y);if(d<bd&&!(v.stealth>0&&d>140)){bd=d;e=v}}x.tg=e;x.ti=e?hm_I(e):-1}
 const e=x.tg;if(e&&!e.dead){const d=Math.hypot(e.x-x.x,e.y-x.y);x.a=Math.atan2(e.y-x.y,e.x-x.x);
  if(d<e.r+8){x.n=1;x.t=Math.min(x.t,.32);VFX='silk';hit(e,o,4,{slow:.4});VFX=null;hm_fil(o,e,.5);jx({jfx:'hm_nip',ti:hm_I(e),x:e.x,y:e.y,a:x.a,t:.3,m:.3});if(near(e.x,e.y))S('bone',o);return}
  const v=Math.min(d,300*dt);x.x+=Math.cos(x.a)*v;x.y+=Math.sin(x.a)*v}
 else{x.a+=Math.sin(x.t*7+x.w*2)*3*dt;x.x=clamp(x.x+Math.cos(x.a)*60*dt,B.x+10,B.x+B.w-10);x.y=clamp(x.y+Math.sin(x.a)*60*dt,B.y+10,B.y+B.h-10)}};
// Étreinte : à la fin, étrangle les ennemis restés dans le cercle (consomme leurs fils)
AUXF.hm_strg=x=>{if(x.t>0||x.done)return;x.done=1;const o=x.owner;if(!o||state!=='fight')return;let n=0;VFX='silk';
 for(const e of enemies(o)){if(Math.hypot(e.x-x.x,e.y-x.y)>x.r+e.r*.6)continue;const f=(e.hm_filE||0)>SIMT?Math.floor(e.hm_fil||0):0;e.hm_fil=0;
  if(hit(e,o,22+8*f,{silence:.9,unblockable:1})){n++;if(f)say(e,'×'+f+' FILS','#e8d8ff');jx({jfx:'hm_choke',ti:hm_I(e),x:e.x,y:e.y,t:.6,m:.6,n:f})}}VFX=null;
 jx({jfx:'hm_close',x:x.x,y:x.y,r:x.r,t:.35,m:.35});if(near(x.x,x.y)){S(n?'bone':'shadow',o);if(n)shake=Math.max(shake,.15)}};
// mue : explose en fils au contact d'un ennemi (après 0,35 s)
AUXF.hm_husk=x=>{const o=x.owner;if(!o||x.done)return;if(x.t<=0){jx({jfx:'hm_shed',x:x.x,y:x.y,t:.4,m:.4,fade:1});return}if(x.k>0)return;
 let tr=false;for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r){tr=true;break}if(!tr)return;x.done=1;x.t=Math.min(x.t,.05);
 VFX='silk';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<90+e.r&&hit(e,o,10,{root:.7,unblockable:1})){hm_fil(o,e,1);jx({jfx:'hm_wrap',ti:hm_I(e),x:e.x,y:e.y,t:.7,m:.7})}VFX=null;
 jx({jfx:'hm_burst',x:x.x,y:x.y,r:90,t:.55,m:.55});if(near(x.x,x.y)){S('bugs',o);S('bone',o)}};
// araignée géante : après la chute, crache 3 fois de la soie sur l'ennemi le plus proche
AUXF.hm_giant=(x,dt)=>{const o=x.owner;if(!o||o.dead||state!=='fight'){x.t=Math.min(x.t,.3);return}const e=nearE(o,x.x,x.y,460);x.ti=e?hm_I(e):-1;
 if(e){const b=Math.atan2(e.y-x.y,e.x-x.x);let df=b-x.a;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;x.a+=clamp(df,-3*dt,3*dt)}
 if(x.k>0||x.n<=0||x.t<.3)return;if(!e){x.k=.3;return}x.k=1.25;x.n--;const a=Math.atan2(e.y-x.y,e.x-x.x),V=VFX;VFX='silk';
 // la bouche est à 40 px du centre ; une cible sous l'araignée est crachée à bout portant (sinon le crachat partirait derrière elle)
 const m0=Math.max(0,Math.min(40,Math.hypot(e.x-x.x,e.y-x.y)-e.r-14));
 proj(o,a,{x:x.x+Math.cos(a)*m0,y:x.y+Math.sin(a)*m0,jn:'Invocation : Araignée géante',spd:640,r:10,dmg:7,life:.7,col:HMC.silk,kind:'hm_spit',slow:.8,noClash:1,onHit:(p,t)=>{hm_fil(p.owner,t,1);jx({jfx:'hm_wrap',ti:hm_I(t),x:t.x,y:t.y,t:.45,m:.45,low:1})}});
 VFX=V;jx({jfx:'hm_gspit',x:x.x,y:x.y,a,t:.3,m:.3});S('bugs',o)};

// ---------- trait de clan : Soie d'araignée ----------
TRAITS[13]={nom:'Soie d\'araignée',desc:'Tes jutsu posent des fils sur l\'ennemi (5 s). Au 4e fil, il est englué : entravé 0,7 s et il subit +20 % de dégâts des Hakumei pendant 3 s ; aucun fil ne prend sur lui pendant 4 s. Des pattes d\'araignée sortent de ton dos',
 init(u){u.hm_cd0=u.cds},
 update(u,dt){if(u.hm_cd0!==u.cds){u.hm_cd0=u.cds;u.hm_bw=null;u.hm_bow=0;u.hm_armE=0;u.hm_arm=0} // nouveau ninja ou réapparition
  if(u.hm_arm>0)u.hm_arm=Math.max(0,(u.hm_armE||0)-SIMT);
  const bw=u.hm_bw;if(bw){if(u.stun>0||u.silence>0||(u.jst&&u.jst.key!=='hm_arc')){u.hm_bw=null;u.hm_bow=0;if(u.jst&&u.jst.key==='hm_arc')u.jst=null;u.cds[bw.i]=Math.max(u.cds[bw.i],8);say(u,'ARC INTERROMPU','#fc6');return}
   bw.t+=dt;u.hm_bow=Math.min(1,.01+bw.t/1.2);u.slow=Math.max(u.slow,.1);if(u.jst&&u.jst.key==='hm_arc')u.jst.t=2.5;
   if(bw.t>=1.2){CUR=u;hm_loose(u);CUR=null}}},
 // englué : +20 % des Hakumei
 deal(src,t,dmg,o){return(t.hm_gluE||0)>SIMT?dmg*HM_VULN:dmg},
 // armure d'or : l'attaquant au corps à corps reste collé (1 fil, ralenti), au plus une fois par 0,5 s
 take(t,src,dmg,o){if(src&&src!==t&&o.melee&&(t.hm_armE||0)>SIMT&&!((t.hm_armHit||0)>SIMT)&&src.team!==t.team){t.hm_armHit=SIMT+.5;hm_fil(t,src,1);if(hm_free(src))src.slow=Math.max(src.slow,1);jx({jfx:'hm_wrap',ti:hm_I(src),x:src.x,y:src.y,t:.4,m:.4,low:1,gold:1})}return dmg},
 // pattes d'araignée dans le dos ; arc d'or en main pendant qu'on bande
 draw(u,p,S,sk){if(u.stealth>0)return;const t=performance.now()/1000,s=S*sk,face=Math.cos(u.aim||0)>=0?1:-1,back=Math.sin(u.aim||0)<-.2;
  g.save();g.lineCap='round';g.lineJoin='round';
  for(const sd of[-1,1])for(let j=0;j<2;j++){const w=Math.sin(t*3+j*1.7+sd)*.12,bx=p.x+sd*7*s,by=p.y-(38-j*5)*s,a0=-1.05+j*.55+w,kx=bx+sd*Math.cos(a0)*17*s,ky=by+Math.sin(a0)*17*s,a1=.5+j*.45-w,fx=kx+sd*Math.cos(a1)*15*s,fy=ky+Math.sin(a1)*15*s;
   g.strokeStyle='#120a18';g.lineWidth=4.2*s;g.beginPath();g.moveTo(bx,by);g.lineTo(kx,ky);g.lineTo(fx,fy);g.stroke();g.strokeStyle=back?'#4a3460':HMC.pur;g.lineWidth=2.2*s;g.stroke();
   g.fillStyle=HMC.vio;g.beginPath();g.arc(kx,ky,1.4*s,0,7);g.fill()}
  g.restore();
  if(u.hm_bow>0){const c=Math.min(1,u.hm_bow),a=u.aim||0,h=P(u.x+Math.cos(a)*16,u.y+Math.sin(a)*16,38),ra=Math.atan2(Math.sin(a)*K,Math.cos(a)),L=26*h.s,pull=(5+c*15)*h.s;
   g.save();g.translate(h.x,h.y);g.rotate(ra);g.lineCap='round';
   g.strokeStyle='#4a2a08';g.lineWidth=5*h.s;g.beginPath();g.moveTo(-6*h.s,-L);g.quadraticCurveTo(10*h.s,0,-6*h.s,L);g.stroke();g.strokeStyle=HMC.gold;g.lineWidth=3*h.s;g.stroke();
   g.strokeStyle='#fff2b8';g.lineWidth=1*h.s;g.beginPath();g.moveTo(-5*h.s,-L*.8);g.quadraticCurveTo(8*h.s,0,-5*h.s,L*.8);g.stroke();
   g.strokeStyle=rgba(HMC.silk,.9);g.lineWidth=1.2;g.beginPath();g.moveTo(-6*h.s,-L);g.lineTo(-6*h.s-pull,0);g.lineTo(-6*h.s,L);g.stroke();
   g.fillStyle=HMC.gold;g.fillRect(-6*h.s-pull,-1.2*h.s,pull+26*h.s,2.4*h.s);g.beginPath();g.moveTo(24*h.s,-5*h.s);g.lineTo(34*h.s,0);g.lineTo(24*h.s,5*h.s);g.closePath();g.fill();
   g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffe08a',.25+.45*c);g.beginPath();g.arc(30*h.s,0,(5+c*9)*h.s,0,7);g.fill();if(c>=1){g.strokeStyle=rgba('#fff2b8',.6+.3*Math.sin(t*20));g.lineWidth=2;g.beginPath();g.arc(30*h.s,0,15*h.s,0,7);g.stroke()}g.restore()}},
 hud(u,x,y){let best=null;for(const e of units)if(!e.dead&&e.team!==u.team&&((e.hm_fil||0)>0||(e.hm_glu||0)>0)&&(!best||(e.hm_glu||0)*10+(e.hm_fil||0)>(best.hm_glu||0)*10+(best.hm_fil||0)))best=e;
  y-=20;const glu=best&&best.hm_glu>0,n=best?best.hm_fil||0:0;for(let i=0;i<HM_MAX;i++){const f=glu?1:clamp(n-i,0,1);g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x+i*38,y,34,5);g.fillStyle=glu?HMC.vio:HMC.silk;g.fillRect(x+i*38,y,34*f,5)}
  text(glu?'Englué ! +20 % pendant '+Math.ceil(best.hm_glu)+' s':'Fils posés : '+(Math.floor(n*2)/2).toString().replace('.',',')+' / '+HM_MAX,x+158,y+6,11,glu?'#e8d8ff':'#c8c0dc','left','normal')}};

// ---------- apparence : yeux violets ----------
CLOOK[13]=(look)=>{look.head.eye=look.head.eye||'#9a5ad0'};

// ---------- animations 3D ----------
Object.assign(ANIM,{
 // la tête se projette, la soie jaillit de la bouche (Kumo Nenkin)
 hm_spit:(P,e)=>{const k=e<.35?ezo(e/.35):1-ezo((e-.35)/.65);pz(P,'chest',.3*k);pz(P,'neck',.25*k);pz(P,'head',.2*k);pz(P,'armL',-.5*k,0,.5*k);pz(P,'armR',-.5*k,0,-.5*k);pz(P,'foreL',-.8*k);pz(P,'foreR',-.8*k);P.root.z=3*k},
 // lancer à deux mains du filet, bras ouverts
 hm_net:(P,e)=>{const up=e<.35,k=up?ezo(e/.35):ezo(Math.min(1,(e-.35)/.3));pz(P,'armL',up?-2.6*k:-2.6+1.1*k,0,up?.4:.4+.4*k);pz(P,'armR',up?-2.6*k:-2.6+1.1*k,0,up?-.4:-.4-.4*k);pz(P,'foreL',-.4);pz(P,'foreR',-.4);pz(P,'chest',up?-.15*k:.3*k);pz(P,'thighL',up?0:-.5*k);pz(P,'shinL',up?0:.5*k)},
 // mains jointes puis ouvertes vers le sol (invocation)
 hm_summon:(P,e)=>{const a=e<.4?ezo(e/.4):1,b=e>.4?ezo(Math.min(1,(e-.4)/.3)):0;pz(P,'armL',-1.3*a+.5*b,0,-.5*a+1*b);pz(P,'armR',-1.3*a+.5*b,0,.5*a-1*b);pz(P,'foreL',-1.4*a+1.2*b);pz(P,'foreR',-1.4*a+1.2*b);pz(P,'chest',.35*b);P.root.y=-3*b;pz(P,'thighL',-.4*b);pz(P,'shinL',.7*b);pz(P,'thighR',-.2*b);pz(P,'shinR',.5*b)},
 // bras croisés, puis ouverts : l'or se fige sur la peau
 hm_armor:(P,e)=>{const a=e<.45?ezo(e/.45):1,b=e>.45?ezo(Math.min(1,(e-.45)/.25)):0;pz(P,'armL',-1.1*a+.6*b,0,-.7*a+1.4*b);pz(P,'foreL',-2*a+1.6*b);pz(P,'armR',-1.1*a+.6*b,0,.7*a-1.4*b);pz(P,'foreR',-2*a+1.6*b);pz(P,'chest',-.1*b);pz(P,'head',.2*b);P.root.y=-2*a+2*b},
 // deux poings tirent les fils vers soi
 hm_pull:(P,e)=>{const a=e<.25?ezo(e/.25):1,b=e>.62?ezo(Math.min(1,(e-.62)/.15)):0;pz(P,'armL',-1.5*a+.9*b,0,-.15);pz(P,'armR',-1.5*a+.9*b,0,.15);pz(P,'foreL',-.2-1.6*b);pz(P,'foreR',-.2-1.6*b);pz(P,'chest',.15*a-.35*b);pz(P,'head',-.1*b);P.root.z=-4*b;pz(P,'thighR',-.3*b);pz(P,'shinR',.3*b)},
 // bras levé qui suit le fil, jambes repliées (Filin)
 hm_swing:(P,e)=>{const k=bump(Math.min(1,e*1.1));pz(P,'armR',-3*k,0,-.2);pz(P,'foreR',-.2);pz(P,'armL',.5*k,0,.6*k);pz(P,'thighL',-1.2*k);pz(P,'shinL',1.6*k);pz(P,'thighR',-.6*k);pz(P,'shinR',1.4*k);pz(P,'chest',.25*k)},
 // accroupi, prêt à bondir (Mue)
 hm_crouch:(P,e)=>{const k=bump(e);P.root.y=-7*k;pz(P,'thighL',-1*k);pz(P,'shinL',1.6*k);pz(P,'thighR',-1*k);pz(P,'shinR',1.6*k);pz(P,'chest',.6*k);pz(P,'armL',-.6*k,0,.6*k);pz(P,'armR',-.6*k,0,-.6*k)},
 // bander l'arc : bras gauche tendu, main droite qui recule près de la joue
 hm_draw:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.2)),c=Math.min(1,e/.85);pz(P,'chest',0,-.55*k);pz(P,'head',0,.45*k);pz(P,'armL',-1.55*k,0,-.15*k);pz(P,'foreL',-.05);pz(P,'armR',-1.5*k,0,.35*k);pz(P,'foreR',-1.4*k-.9*c);
  pz(P,'thighL',-.35*k,0,.15*k);pz(P,'thighR',.25*k,0,-.15*k);pz(P,'shinR',.2*k);P.root.y=-1.5*k+Math.sin(t*30)*.15*c},
 // la corde claque, le bras droit part en arrière
 hm_loose:(P,e)=>{const k=1-ezo(e);pz(P,'chest',0,-.55*k);pz(P,'armL',-1.55*k,0,-.15*k);pz(P,'armR',-1.2*k+.6*k,0,.9*k);pz(P,'foreR',-.3*k);pz(P,'head',-.1*k)},
});

// ---------- visuels ----------
const hm_strand=(x0,y0,x1,y1,sag,col,w,a)=>{g.strokeStyle=rgba(col,a);g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2,(y0+y1)/2+sag,x1,y1);g.stroke()};
// projectile de fil : pelote collante qui traîne son fil
PROJD.hm_thread=(p,R,ra,t)=>{const sp=Math.hypot(p.vx,p.vy)||1,L=Math.min(120,((p.life0||1)-p.life)*sp);g.rotate(ra);g.lineCap='round';
 g.strokeStyle=rgba(HMC.vio,.35);g.lineWidth=4;g.beginPath();g.moveTo(0,0);for(let i=1;i<=6;i++)g.lineTo(-L*i/6,Math.sin(t/40+i*1.7)*2.5*(i/6));g.stroke();
 g.strokeStyle=HMC.silk;g.lineWidth=1.4;g.stroke();
 g.fillStyle=HMC.silk;g.beginPath();g.arc(0,0,R*.85,0,7);g.fill();g.strokeStyle=HMC.silk2;g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.ellipse(0,0,R*.85,R*.3,i*1.05+t/90,0,7);g.stroke()}
 for(let i=0;i<4;i++){const b=i*1.57+t/70;g.strokeStyle=rgba(HMC.silk,.8);g.beginPath();g.moveTo(Math.cos(b)*R*.8,Math.sin(b)*R*.8);g.lineTo(Math.cos(b)*R*1.6,Math.sin(b)*R*1.6);g.stroke()}};
// boule de soie (Toile collante) en cloche
PROJD.hm_glob=(p,R,ra,t)=>{const z=Math.sin(Math.PI*Math.max(0,Math.min(1,1-p.life/(p.life0||1))))*55;g.translate(0,-z);
 g.fillStyle=HMC.silk;g.beginPath();g.arc(0,0,R,0,7);g.fill();g.strokeStyle=HMC.silk2;g.lineWidth=1.2;for(let i=0;i<4;i++){g.beginPath();g.ellipse(0,0,R,R*.35,i*.8+t/120,0,7);g.stroke()}
 g.strokeStyle=rgba(HMC.silk,.7);g.lineWidth=1;for(let i=0;i<6;i++){const b=i*1.05+t/200;g.beginPath();g.moveTo(Math.cos(b)*R,Math.sin(b)*R);g.quadraticCurveTo(Math.cos(b+.3)*R*1.6,Math.sin(b+.3)*R*1.6+4,Math.cos(b+.5)*R*2,Math.sin(b+.5)*R*2+8);g.stroke()}
 circ(-R*.35,-R*.35,R*.25,'#ffffff')};
// cocon d'œufs (Nuée) : sac ovale, petites taches qui bougent
PROJD.hm_sac=(p,R,ra,t)=>{const z=Math.sin(Math.PI*Math.max(0,Math.min(1,1-p.life/(p.life0||1))))*60;g.translate(0,-z);g.rotate(t/160);
 g.fillStyle='#e6e0ec';g.strokeStyle=HMC.pur;g.lineWidth=1.5;g.beginPath();g.ellipse(0,0,R*1.1,R*1.35,0,0,7);g.fill();g.stroke();
 g.strokeStyle=rgba(HMC.silk2,.9);g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.ellipse(0,0,R*1.1,R*.4,i*1.05,0,7);g.stroke()}
 g.fillStyle=HMC.dark;for(let i=0;i<5;i++){const b=i*1.26+t/90;g.beginPath();g.arc(Math.cos(b)*R*.5,Math.sin(b)*R*.6,1.8,0,7);g.fill()}};
// filet : maille tendue, perpendiculaire à la trajectoire
PROJD.hm_net=(p,R,ra,t)=>{const e=Math.min(1,((p.life0||1)-p.life)/.18),W=R*(.6+.8*e),D=R*.7;g.rotate(ra);g.lineCap='round';
 g.fillStyle=rgba(HMC.silk,.12);g.beginPath();g.moveTo(-D,-W);g.quadraticCurveTo(D*.9,0,-D,W);g.lineTo(-D*.6,W*.8);g.quadraticCurveTo(D*.4,0,-D*.6,-W*.8);g.closePath();g.fill();
 const N=6;g.strokeStyle=HMC.silk;g.lineWidth=1.3;for(let i=0;i<=N;i++){const s=-1+2*i/N,yy=s*W,xx=-D+(1-s*s)*D*1.9+Math.sin(t/60+i)*1.5;g.beginPath();g.moveTo(-D-14,yy*.5);g.lineTo(xx,yy);g.stroke()}
 for(let j=0;j<3;j++){const f=.3+j*.33;g.beginPath();for(let i=0;i<=12;i++){const s=-1+2*i/12,yy=s*W*(.55+.45*f),xx=-D-14+(1-s*s)*D*1.9*f+14*f;i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}
 g.strokeStyle=rgba(HMC.vio,.7);g.lineWidth=3;g.beginPath();g.moveTo(-D,-W);g.quadraticCurveTo(D*.9,0,-D,W);g.stroke();
 g.fillStyle=HMC.gold;for(const s of[-1,1]){g.beginPath();g.arc(-D,s*W,2.6,0,7);g.fill()}};
// kunai d'or (style), avec fil pour le 5e
PROJD.hm_gk=(p,R,ra)=>{g.rotate(ra);g.strokeStyle='rgba(255,230,150,.35)';g.lineWidth=2;g.beginPath();g.moveTo(-34,0);g.lineTo(-12,0);g.stroke();
 g.fillStyle=HMC.gold;g.strokeStyle='#5a3a08';g.lineWidth=1;g.beginPath();g.moveTo(12,0);g.lineTo(2,-3.4);g.lineTo(-4,-1.4);g.lineTo(-4,1.4);g.lineTo(2,3.4);g.closePath();g.fill();g.stroke();
 g.fillStyle=HMC.gold2;g.fillRect(-11,-1.2,7,2.4);g.strokeStyle=HMC.gold;g.beginPath();g.arc(-13,0,2.2,0,7);g.stroke()};
PROJD.hm_gkt=(p,R,ra,t)=>{const sp=Math.hypot(p.vx,p.vy)||1,L=Math.min(160,((p.life0||1)-p.life)*sp);g.save();g.rotate(ra);g.strokeStyle=rgba(HMC.silk,.85);g.lineWidth=1.2;g.beginPath();g.moveTo(-13,0);for(let i=1;i<=5;i++)g.lineTo(-13-L*i/5,Math.sin(t/35+i*2)*2*(i/5));g.stroke();g.restore();PROJD.hm_gk(p,R,ra,t)};
// flèche d'or : longue hampe, pointe en tête d'araignée, sillage doré et fil de guidage
PROJD.hm_arrow=(p,R,ra,t)=>{const c=clamp((R-8)/5,0,1),sp=Math.hypot(p.vx,p.vy)||1,L=Math.min(220,((p.life0||1)-p.life)*sp);g.rotate(ra);g.lineCap='round';
 g.strokeStyle=rgba(HMC.silk,.55);g.lineWidth=1;g.beginPath();g.moveTo(-30,0);for(let i=1;i<=8;i++)g.lineTo(-30-L*i/8,Math.sin(t/30+i*1.3)*3*(i/8));g.stroke();
 g.save();g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(-90-60*c,0,10,0);gr.addColorStop(0,'rgba(240,192,64,0)');gr.addColorStop(1,rgba('#ffd860',.55+.3*c));g.fillStyle=gr;g.beginPath();g.moveTo(10,-(4+5*c));g.lineTo(-90-60*c,0);g.lineTo(10,4+5*c);g.closePath();g.fill();g.restore();
 g.strokeStyle='#5a3a08';g.lineWidth=4.2;g.beginPath();g.moveTo(-30,0);g.lineTo(14,0);g.stroke();g.strokeStyle=HMC.gold;g.lineWidth=2.6;g.stroke();
 g.fillStyle=HMC.gold;g.strokeStyle='#5a3a08';g.lineWidth=1;g.beginPath();g.moveTo(30,0);g.lineTo(14,-6);g.lineTo(18,0);g.lineTo(14,6);g.closePath();g.fill();g.stroke();
 g.strokeStyle=HMC.gold;g.lineWidth=1.4;for(const s of[-1,1])for(let i=0;i<3;i++){g.beginPath();g.moveTo(10-i*4,0);g.lineTo(6-i*4,s*(7+i));g.lineTo(2-i*4,s*(9+i*1.5));g.stroke()}
 g.fillStyle=HMC.gold2;for(const s of[-1,1]){g.beginPath();g.moveTo(-26,0);g.lineTo(-34,s*6);g.lineTo(-30,0);g.closePath();g.fill()}
 if(c>.6){g.globalCompositeOperation='lighter';g.fillStyle=rgba('#fff2b8',.5+.2*Math.sin(t/20));g.beginPath();g.arc(24,0,6+4*c,0,7);g.fill();g.globalCompositeOperation='source-over'}};
// crachat de soie de l'araignée géante
PROJD.hm_spit=(p,R,ra,t)=>{g.rotate(ra);g.fillStyle=rgba(HMC.silk,.4);g.beginPath();g.ellipse(-R,0,R*2,R*.6,0,0,7);g.fill();g.fillStyle=HMC.silk;g.beginPath();g.arc(0,0,R*.8,0,7);g.fill();
 g.strokeStyle=HMC.silk2;g.lineWidth=1;g.beginPath();g.ellipse(0,0,R*.8,R*.3,t/80,0,7);g.stroke()};

// fil tendu entre le lanceur et la cible (lien de 2 s)
AUXD.hm_line=(x,k,t)=>{const o=units[x.ui],e=units[x.ti];if(!o||!e||o.dead||e.dead)return;const a=P(o.x,o.y,(o.z||0)+36),b=P(e.x,e.y,(e.z||0)+34),taut=x.t<.3?1:0,sag=taut?0:(18+Math.sin(t*4)*4)*a.s,al=Math.min(1,x.t/.15+.3);
 g.save();g.lineCap='round';hm_strand(a.x,a.y,b.x,b.y,sag,HMC.vio,4,.3*al);hm_strand(a.x,a.y,b.x,b.y,sag,HMC.silk,1.6,.95*al);
 g.fillStyle=HMC.silk;for(let i=1;i<4;i++){const s=((t*.6+i/4)%1),mx=(a.x+b.x)/2,my=(a.y+b.y)/2+sag,xx=(1-s)*(1-s)*a.x+2*(1-s)*s*mx+s*s*b.x,yy=(1-s)*(1-s)*a.y+2*(1-s)*s*my+s*s*b.y;g.fillRect(xx-1,yy-1,2,2)}
 g.strokeStyle=rgba(HMC.silk,.8);g.lineWidth=1.2;for(let i=0;i<3;i++){g.beginPath();g.ellipse(b.x,b.y-4*b.s+i*5*b.s,10*b.s,3*b.s,0,0,7);g.stroke()}g.restore()};
// toile au sol : rayons, spirale, rosée qui brille
AUXD.hm_web=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r,gr=Math.min(1,(x.m-x.t)/.35),r=R*gr,al=k,N=10,rot=x.n||0;g.save();g.lineCap='round';
 g.fillStyle=rgba(HMC.pur,.1*al);gEll(x.x,x.y,r);g.fill();
 const pt=(a,d)=>P(x.x+Math.cos(a)*d,x.y+Math.sin(a)*d,1);
 g.strokeStyle=rgba(HMC.silk,.7*al);g.lineWidth=1.4;for(let i=0;i<N;i++){const a=rot+i*Math.PI*2/N+Math.sin(i*3.1)*.12,e=pt(a,r);g.beginPath();g.moveTo(q.x,q.y);g.lineTo(e.x,e.y);g.stroke()}
 g.strokeStyle=rgba(HMC.silk,.55*al);g.lineWidth=1;for(let j=1;j<=5;j++){const d=r*j/5.2;g.beginPath();for(let i=0;i<=N;i++){const a=rot+(i%N)*Math.PI*2/N+Math.sin((i%N)*3.1)*.12,m=rot+(i%N+.5)*Math.PI*2/N,p0=pt(a,d);if(i===0)g.moveTo(p0.x,p0.y);else{const pm=pt(m-Math.PI*2/N,d*.9);g.quadraticCurveTo(pm.x,pm.y,p0.x,p0.y)}}g.stroke()}
 g.strokeStyle=rgba(HMC.vio,.45*al);g.lineWidth=2.5;gEll(x.x,x.y,r);g.stroke();
 g.fillStyle=rgba('#ffffff',.8*al);for(let i=0;i<7;i++){const a=rot+i*2.3,d=r*(.25+((i*37)%60)/90),p0=pt(a,d),b=.5+.5*Math.sin(t*3+i*1.9);g.globalAlpha=al*b;g.fillRect(p0.x-1,p0.y-1,2,2)}g.restore()};
AUXD.hm_netc=()=>{};
// bébé araignée : corps sombre, 8 pattes qui trottinent, petits bonds
AUXD.hm_spid=(x,k,t)=>{const hop=Math.abs(Math.sin(t*18+(x.w||0)*1.9))*4,q=P(x.x,x.y,hop+2),s=q.s*1.6,ra=Math.atan2(Math.sin(x.a||0)*K,Math.cos(x.a||0)),gs=P(x.x,x.y,0);
 g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(gs.x,gs.y,7*s,3*s,0,0,7);g.fill();g.save();g.translate(q.x,q.y);g.rotate(ra);g.globalAlpha=Math.min(1,k*2);
 g.strokeStyle='#120a18';g.lineWidth=1.3*s;g.lineCap='round';for(const sd of[-1,1])for(let i=0;i<4;i++){const w=Math.sin(t*26+i*1.6+sd)*.35,b=(-.9+i*.6+w)*sd;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(b+sd*1.57)*3*s+(i-1.5)*2*s,sd*5*s);g.lineTo((i-1.5)*4.5*s+Math.cos(b)*2*s,sd*8*s);g.stroke()}
 g.fillStyle=HMC.dark;g.beginPath();g.ellipse(-3.5*s,0,4.6*s,3.8*s,0,0,7);g.fill();g.fillStyle='#3a2450';g.beginPath();g.ellipse(2*s,0,2.8*s,2.4*s,0,0,7);g.fill();
 g.fillStyle=HMC.vio;g.beginPath();g.ellipse(-4*s,0,1.6*s,1*s,0,0,7);g.fill();g.fillStyle=HMC.red;g.fillRect(3.4*s,-1.2*s,1.1*s,1*s);g.fillRect(3.4*s,.3*s,1.1*s,1*s);g.restore()};
// Étreinte : cercle d'ancrage, fils plantés au bord qui se tendent vers le centre
AUXD.hm_strg=(x,k,t)=>{const e=1-x.t/x.m,q=P(x.x,x.y,0),R=x.r;g.save();g.fillStyle=rgba(HMC.pur,.14+.16*e);gEll(x.x,x.y,R);g.fill();g.strokeStyle=rgba(HMC.vio,.8);g.lineWidth=2;g.setLineDash([6,5]);g.lineDashOffset=-t*30;gEll(x.x,x.y,R);g.stroke();g.setLineDash([]);
 g.strokeStyle=rgba(HMC.vio,.9);g.lineWidth=2.5;gEll(x.x,x.y,R*(1-e*.85));g.stroke();
 for(let i=0;i<8;i++){const a=i*.785+.2,b=P(x.x+Math.cos(a)*R,x.y+Math.sin(a)*R,0),m=P(x.x+Math.cos(a)*R*(1-e),x.y+Math.sin(a)*R*(1-e),30*e);g.lineCap='round';hm_strand(b.x,b.y,m.x,m.y,-6*q.s,HMC.silk,1.5,.9);g.fillStyle=HMC.gold;g.beginPath();g.arc(b.x,b.y,2.4*q.s,0,7);g.fill()}g.restore()};
// mue : silhouette de soie pâle, légèrement transparente
AUXD.hm_husk=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,al=Math.min(1,k)*(x.t<.5?x.t/.5:1);g.save();g.globalAlpha=al*.85;
 g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(q.x,q.y,14*s,5*s,0,0,7);g.fill();
 g.fillStyle='#e4dfe8';g.strokeStyle=HMC.silk2;g.lineWidth=1;g.beginPath();g.ellipse(q.x,q.y-20*s,10*s,17*s,0,0,7);g.fill();g.stroke();g.beginPath();g.arc(q.x,q.y-44*s,10*s,0,7);g.fill();g.stroke();
 g.strokeStyle=rgba(HMC.pur,.6);g.lineWidth=1;for(let i=0;i<6;i++){const y=q.y-(6+i*7)*s;g.beginPath();g.moveTo(q.x-10*s,y);g.quadraticCurveTo(q.x,y-4*s,q.x+10*s,y+2*s);g.stroke()}
 g.strokeStyle=rgba(HMC.dark,.7);g.lineWidth=1.4;g.beginPath();g.moveTo(q.x-4*s,q.y-50*s);g.lineTo(q.x+3*s,q.y-42*s);g.lineTo(q.x-1*s,q.y-34*s);g.stroke(); // fente de la mue
 if(x.t>x.m-.35){}else{g.strokeStyle=rgba(HMC.silk,.5);for(let i=0;i<5;i++){const a=i*1.26+t,b=P(x.x+Math.cos(a)*x.r,x.y+Math.sin(a)*x.r,0);g.beginPath();g.moveTo(q.x,q.y-10*s);g.lineTo(b.x,b.y);g.stroke()}}g.restore()};
// araignée géante : chute du ciel, puis posée (pattes qui se plient, abdomen doré)
AUXD.hm_giant=(x,k,t)=>{const el=x.m-x.t,D=.75,fall=el<D?1-el/D:0,z=fall*fall*420,land=el>=D&&el<D+.25?bump((el-D)/.25):0,al=Math.min(1,x.t/.3),ca=Math.cos(x.a||0),sa=Math.sin(x.a||0),G=1.2,
  W=(f,s,h)=>P(x.x+(ca*f-sa*s)*G,x.y+(sa*f+ca*s)*G,z+h*G-land*5),gs=P(x.x,x.y,0),q=W(0,0,0),s=q.s*G,ra=Math.atan2(sa*K,ca);
 g.save();g.globalAlpha=al;g.fillStyle=rgba('#000000',.35*(1-fall*.6));g.beginPath();g.ellipse(gs.x,gs.y,(64-fall*20)*s,(30-fall*10)*s,0,0,7);g.fill();
 if(z>4){const top=W(-6,0,40);g.strokeStyle=rgba(HMC.silk,.7);g.lineWidth=1.5;g.beginPath();g.moveTo(top.x,top.y);g.lineTo(top.x,0);g.stroke()}
 g.lineCap='round';g.lineJoin='round';const HF=[9,3,-3,-9],KF=[34,14,-12,-32],FF=[58,24,-20,-52];
 const leg=(sd,i)=>{const w=Math.sin(t*4+i*1.3+sd)*3,hp=W(HF[i],sd*8,24),kn=W(KF[i]+w,sd*38,50-fall*14),ft=W(FF[i]+w,sd*(58+land*8),fall*-20);
  g.strokeStyle='#0a060e';g.lineWidth=8*s;g.beginPath();g.moveTo(hp.x,hp.y);g.lineTo(kn.x,kn.y);g.lineTo(ft.x,ft.y);g.stroke();g.strokeStyle='#3a2450';g.lineWidth=4.6*s;g.stroke();
  g.strokeStyle=HMC.gold;g.lineWidth=1.4*s;g.beginPath();g.moveTo(kn.x+(hp.x-kn.x)*.25,kn.y+(hp.y-kn.y)*.25);g.lineTo(kn.x,kn.y);g.stroke();g.fillStyle=HMC.vio;g.beginPath();g.arc(kn.x,kn.y,2.4*s,0,7);g.fill()};
 // pattes du côté le plus loin d'abord
 const far=Math.cos(x.a||0)>=0?-1:1;for(let i=0;i<4;i++)leg(far,i);
 const ab=W(-30,0,32),ce=W(10,0,26);
 g.save();g.translate(ab.x,ab.y);g.rotate(ra);g.fillStyle='#120a18';g.beginPath();g.ellipse(0,0,32*s,25*s*(.65+.35*K),0,0,7);g.fill();g.fillStyle='#2a1a3a';g.beginPath();g.ellipse(-2*s,-3*s,28*s,20*s*(.65+.35*K),0,0,7);g.fill();
 g.fillStyle=HMC.gold;g.beginPath();g.moveTo(-12*s,-8*s);g.lineTo(0,0);g.lineTo(-12*s,8*s);g.lineTo(12*s,0);g.closePath();g.fill(); // sablier doré
 g.strokeStyle=rgba(HMC.vio,.7);g.lineWidth=1.5*s;for(let i=0;i<3;i++){g.beginPath();g.ellipse(0,0,(10+i*7)*s,(7+i*5)*s,0,2.2,4.1);g.stroke()}g.restore();
 g.save();g.translate(ce.x,ce.y);g.rotate(ra);g.fillStyle='#1c1028';g.beginPath();g.ellipse(0,0,17*s,15*s,0,0,7);g.fill();g.fillStyle='#3a2450';g.beginPath();g.ellipse(2*s,-2*s,13*s,10*s,0,0,7);g.fill();
 g.fillStyle=HMC.dark;for(const sd of[-1,1]){g.beginPath();g.moveTo(14*s,sd*4*s);g.quadraticCurveTo(24*s,sd*6*s,22*s,sd*1*s);g.lineTo(16*s,sd*1*s);g.closePath();g.fill()}
 const blink=.6+.4*Math.sin(t*5);g.fillStyle=rgba(HMC.red,blink);for(const [ex,ey,r] of[[11,-4,2.6],[11,4,2.6],[7,-8,1.8],[7,8,1.8],[14,-1.5,1.4],[14,1.5,1.4]]){g.beginPath();g.arc(ex*s,ey*s,r*s,0,7);g.fill()}g.restore();
 for(let i=0;i<4;i++)leg(-far,i);g.restore()};
// trait : fils sur l'ennemi (du corps vers le sol) et cocon quand il est englué
STATD.push((u,p,S,sk)=>{const n=Math.floor(u.hm_fil||0),gl=u.hm_glu||0;if(!n&&!(gl>0))return;const t=performance.now()/1000,s=S*sk;g.save();g.lineCap='round';
 for(let i=0;i<n;i++){const a=i*1.57+.6,bx=p.x+Math.cos(a)*24*S,by=p.y+Math.sin(a)*9*S,hx=p.x+Math.cos(a)*5*s,hy=p.y-(20+i*7)*s+Math.sin(t*3+i)*1.2;
  hm_strand(hx,hy,bx,by,-4*S,HMC.vio,3,.35);hm_strand(hx,hy,bx,by,-4*S,HMC.silk,1.2,.9);g.fillStyle=HMC.silk;g.beginPath();g.arc(bx,by,1.8*S,0,7);g.fill()}
 if(gl>0){const f=gl>HM_GLU-.7?1:.6,cy=p.y-30*s;g.fillStyle=rgba(HMC.silk,.16*f);g.beginPath();g.ellipse(p.x,cy,17*s,29*s,0,0,7);g.fill();g.strokeStyle=rgba(HMC.silk,.85*f);g.lineWidth=1.6;for(let i=0;i<7;i++){const y=cy+(i-3)*7*s,w=16*s*Math.sqrt(1-((i-3)/4.2)**2);g.beginPath();g.ellipse(p.x,y,w,3.2*s,.18*(i%2?1:-1),0,7);g.stroke()}
  g.strokeStyle=rgba(HMC.vio,.5*f);g.lineWidth=1;g.beginPath();g.ellipse(p.x,cy,18*s,30*s,0,0,7);g.stroke();g.fillStyle=rgba('#ffffff',.8*f);for(let i=0;i<3;i++)g.fillRect(p.x+Math.sin(t*2+i*2)*12*s,cy-(i-1)*14*s,1.8,1.8)}
 g.restore()});
// armure d'or : plaques dorées autour du corps
STATD.push((u,p,S,sk)=>{if(!(u.hm_arm>0))return;const t=performance.now()/1000,s=S*sk,cy=p.y-30*s,rx=21*s,ry=31*s,f=Math.min(1,u.hm_arm/.4);g.save();g.globalAlpha=f;
 g.fillStyle=rgba(HMC.gold,.13);g.beginPath();g.ellipse(p.x,cy,rx,ry,0,0,7);g.fill();g.strokeStyle=rgba(HMC.gold,.85);g.lineWidth=2.2;g.beginPath();g.ellipse(p.x,cy,rx,ry,0,0,7);g.stroke();
 for(let i=0;i<9;i++){const a=i*.698+t*.5;if(Math.sin(a)<-.2)continue;const x=p.x+Math.cos(a)*rx*.95,y=cy+(((i*41)%60)-30)/30*ry*.7,z=4.5*s;g.fillStyle=i%2?HMC.gold:'#ffe08a';g.strokeStyle='#6a4a08';g.lineWidth=1;
  g.beginPath();for(let j=0;j<6;j++){const b=j*1.047;g.lineTo(x+Math.cos(b)*z,y+Math.sin(b)*z)}g.closePath();g.fill();g.stroke()}
 g.globalCompositeOperation='lighter';g.fillStyle=rgba('#fff2b8',.35+.25*Math.sin(t*6));g.fillRect(p.x+Math.cos(t*2)*rx*.7,cy-ry*.5,2,2);g.restore()});

// effets ponctuels (jx)
// soie qui jaillit de la bouche
JFXD.hm_mouth=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x+Math.cos(f.a)*10,u.y+Math.sin(f.a)*10,50),b=P(u.x+Math.cos(f.a)*(10+50*e),u.y+Math.sin(f.a)*(10+50*e),46-e*8);g.save();g.lineCap='round';
 for(let i=0;i<3;i++){hm_strand(q.x,q.y,b.x+(i-1)*4*q.s,b.y+(i-1)*3*q.s,(i-1)*4,HMC.silk,1.3,.9*k)}g.fillStyle=rgba(HMC.silk,.9*k);g.beginPath();g.arc(q.x,q.y,3*q.s*k,0,7);g.fill();g.restore()};
// cible emmaillotée (filet, toile, mue, crachats) ; low : seulement les jambes ; gold : fils dorés
JFXD.hm_wrap=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,H=(f.low?24:52)*s*Math.min(1,e*f.m/.15),al=Math.min(1,k*f.m/.2),col=f.gold?HMC.gold:HMC.silk;if(H<2)return;g.save();g.globalAlpha=al;
 g.fillStyle=rgba(col,.18);g.beginPath();g.ellipse(q.x,q.y-H/2,17*s,H/2+3*s,0,0,7);g.fill();g.strokeStyle=rgba(col,.95);g.lineWidth=1.6;
 const n=f.low?4:8;for(let i=0;i<n;i++){const y=q.y-H*(i+.5)/n,w=(15+Math.sin(i*1.7)*2)*s;g.beginPath();g.moveTo(q.x-w,y+3*s);g.quadraticCurveTo(q.x,y-4*s+Math.sin(t*5+i)*1.5,q.x+w,y-2*s);g.stroke()}
 g.strokeStyle=rgba(HMC.vio,.6);g.lineWidth=1;for(let i=0;i<3;i++){const a=i*2.1+t*.8,x0=q.x+Math.cos(a)*30*s,y0=q.y+Math.sin(a)*12*s;g.beginPath();g.moveTo(x0,y0);g.lineTo(q.x+Math.cos(a)*10*s,q.y-H*.6);g.stroke()}g.restore()};
// englué (4e fil) : le cocon se referme d'un coup
JFXD.hm_cocoon=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,c=Math.min(1,e/.3);g.save();g.lineCap='round';
 for(let i=0;i<10;i++){const a=i*.628+e*3,d=(60*(1-c)+14)*s,x0=q.x+Math.cos(a)*d,y0=q.y-30*s+Math.sin(a)*d*.8;hm_strand(x0,y0,q.x+Math.cos(a+1)*8*s,q.y-30*s+Math.sin(a+1)*20*s,0,HMC.silk,1.4,.9*k)}
 g.strokeStyle=rgba(HMC.vio,.8*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y-30*s,(20+30*(1-c))*s,(32+20*(1-c))*s,0,0,7);g.stroke();g.restore()};
// rétraction du fil : traînée de la cible vers le lanceur
JFXD.hm_yank=(f,k,e,t,u,tg)=>{if(!u||!tg)return;const a=P(u.x,u.y,36),b=P(tg.x,tg.y,34);g.save();g.lineCap='round';g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=2.5;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();
 g.strokeStyle=rgba(HMC.vio,.5*k);g.lineWidth=7;g.stroke();g.restore()};
// geste du filet / cocon : rien de plus que les projectiles ; éclosion des araignées
JFXD.hm_hatch=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s;g.save();g.fillStyle=rgba('#e6e0ec',.8*k);for(let i=0;i<7;i++){const a=i*.9,d=(8+e*f.r)*s,x=q.x+Math.cos(a)*d,y=q.y-Math.sin(Math.PI*Math.min(1,e*1.4))*24*s+Math.sin(a)*d*.4;
  g.beginPath();g.moveTo(x,y);g.lineTo(x+5*s,y-3*s);g.lineTo(x+2*s,y+4*s);g.closePath();g.fill()}g.strokeStyle=rgba(HMC.silk,.8*k);g.lineWidth=3*k+1;gEll(f.x,f.y,f.r*(.3+e*.7));g.stroke();g.restore()};
// morsure de bébé araignée
JFXD.hm_nip=(f,k,e,t,u,tg)=>{const T=tg&&!tg.dead?tg:f,q=P(T.x,T.y,22),s=q.s;g.save();g.translate(q.x,q.y);g.rotate(f.a);g.strokeStyle=rgba(HMC.red,.9*k);g.lineWidth=2;
 for(const sd of[-1,1]){g.beginPath();g.moveTo(-6*s,sd*5*s);g.quadraticCurveTo(2*s,sd*4*s*(1-e),4*s,sd*1*s);g.stroke()}g.restore()};
// armure d'or : l'or coule du haut vers le bas
JFXD.hm_gild=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s,h=(1-e)*60*s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(HMC.gold,.9*k);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y-h,18*s,6*s,0,0,7);g.stroke();
 g.fillStyle=rgba('#ffe08a',.8*k);for(let i=0;i<8;i++){const a=t*6+i*.785;g.fillRect(q.x+Math.cos(a)*18*s,q.y-h+Math.sin(a)*6*s,2*s,2*s)}g.restore()};
// fils lancés vers le cercle d'Étreinte
JFXD.hm_cast=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=P(u.x,u.y,40),c=Math.min(1,e*3);g.save();g.lineCap='round';for(let i=0;i<4;i++){const b=f.a+(i-1.5)*.18,L=f.len*c,p=P(u.x+Math.cos(b)*L,u.y+Math.sin(b)*L,10);hm_strand(a.x,a.y,p.x,p.y,-10*a.s,HMC.silk,1.2,.7*k)}g.restore()};
// fils qui se referment (fin de l'Étreinte) et étranglement de la cible
JFXD.hm_close=(f,k,e)=>{g.save();g.strokeStyle=rgba(HMC.silk,.9*k);g.lineWidth=4*k+1;gEll(f.x,f.y,f.r*(1-e*.8));g.stroke();g.restore()};
JFXD.hm_choke=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,sq=e<.3?e/.3:1;g.save();g.strokeStyle=rgba(HMC.silk,.95*k);g.lineWidth=2;
 for(let i=0;i<3;i++){const y=q.y-(36+i*5)*s;g.beginPath();g.ellipse(q.x,y,(16-sq*6)*s,4*s,(i-1)*.2,0,7);g.stroke()}
 g.strokeStyle=rgba(HMC.vio,.7*k);g.lineWidth=1.2;for(let i=0;i<6;i++){const a=i*1.047,b=P(tg.x+Math.cos(a)*70*(1-sq*.4),tg.y+Math.sin(a)*70*(1-sq*.4),0);g.beginPath();g.moveTo(b.x,b.y);g.lineTo(q.x,q.y-40*s);g.stroke()}
 if(f.n){g.globalCompositeOperation='lighter';g.fillStyle=rgba(HMC.vio,.4*k);g.beginPath();g.arc(q.x,q.y-40*s,(8+f.n*4)*s*sq,0,7);g.fill()}g.restore()};
// Filin : le fil s'accroche au point visé et rétrécit pendant le vol
JFXD.hm_zip=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=P(u.x,u.y,(u.z||0)+44),b=P(f.x,f.y,0),c=Math.min(1,e*5);const bx=a.x+(b.x-a.x)*c,by=a.y+(b.y-a.y)*c;g.save();g.lineCap='round';
 g.strokeStyle=rgba(HMC.vio,.4*k);g.lineWidth=4;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(bx,by);g.stroke();g.strokeStyle=rgba(HMC.silk,.95*k);g.lineWidth=1.5;g.stroke();
 if(c>=1){g.strokeStyle=rgba(HMC.silk,.8*k);for(let i=0;i<5;i++){const r=i*1.26,p=P(f.x+Math.cos(r)*14,f.y+Math.sin(r)*14,0);g.beginPath();g.moveTo(b.x,b.y);g.lineTo(p.x,p.y);g.stroke()}}g.restore()};
// Mue : lambeaux de soie au départ (fade : la mue s'effrite seule)
JFXD.hm_shed=(f,k,e)=>{const q=P(f.x,f.y,30),s=q.s;g.save();g.fillStyle=rgba('#e4dfe8',.8*k);for(let i=0;i<9;i++){const a=i*.7,d=(6+e*(f.fade?24:46))*s,x=q.x+Math.cos(a)*d,y=q.y+Math.sin(a)*d*.6+e*e*20*s;g.save();g.translate(x,y);g.rotate(a+e*4);g.fillRect(-4*s,-1.5*s,8*s,3*s);g.restore()}g.restore()};
// explosion de la mue : étoile de fils
JFXD.hm_burst=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s,ext=Math.min(1,e/.25);g.save();g.lineCap='round';for(let i=0;i<12;i++){const a=i*.5236,b=P(f.x+Math.cos(a)*f.r*ext,f.y+Math.sin(a)*f.r*ext,4);hm_strand(q.x,q.y-20*s,b.x,b.y,8*s,HMC.silk,1.5,.95*k)}
 g.strokeStyle=rgba(HMC.vio,.7*k);g.lineWidth=3;gEll(f.x,f.y,f.r*ext);g.stroke();g.restore()};
// chute de l'araignée géante : onde et fissures de soie
DETO.hm_quake=(x,y,r)=>{jx({jfx:'hm_land',x,y,r,t:.6,m:.6});sparks(x,y,HMC.vio,16);sparks(x,y,HMC.silk,10);if(near(x,y))shake=Math.max(shake,.4)};
JFXD.hm_land=(f,k,e)=>{g.save();g.strokeStyle=rgba(HMC.vio,.85*k);g.lineWidth=7*k+1;gEll(f.x,f.y,f.r*(.4+e*.8));g.stroke();g.strokeStyle=rgba(HMC.silk,.7*k);g.lineWidth=2;gEll(f.x,f.y,f.r*(.3+e*.9));g.stroke();
 const q=P(f.x,f.y,0);g.fillStyle=rgba(HMC.dark,.6*k);for(let i=0;i<10;i++){const a=i*.628,p=P(f.x+Math.cos(a)*f.r*e,f.y+Math.sin(a)*f.r*e,Math.sin(Math.PI*e)*30);g.beginPath();g.ellipse(p.x,p.y,6*q.s,4*q.s,0,0,7);g.fill()}g.restore()};
// crachat de l'araignée géante (bouffée à la bouche)
JFXD.hm_gspit=(f,k,e)=>{const q=P(f.x+Math.cos(f.a)*40,f.y+Math.sin(f.a)*40,22);g.save();g.fillStyle=rgba(HMC.silk,.7*k);g.beginPath();g.arc(q.x,q.y,(5+e*10)*q.s,0,7);g.fill();g.restore()};
// fang (5e coup des Crocs) : deux crocs violets qui se referment
JFXD.hm_fang=(f,k,e,t,u,tg)=>{const T=tg&&!tg.dead?tg:f,q=P(T.x,T.y,30),s=q.s,c=Math.min(1,e/.35);g.save();g.translate(q.x,q.y);g.rotate(Math.atan2(Math.sin(f.a)*K,Math.cos(f.a)));g.globalAlpha=k*(f.miss?.6:1);
 for(const sd of[-1,1]){g.fillStyle='#f4eef8';g.strokeStyle=HMC.dark;g.lineWidth=1.2;g.beginPath();g.moveTo(-14*s,sd*(16-10*c)*s);g.quadraticCurveTo(4*s,sd*(14-10*c)*s,8*s,sd*(3-2*c)*s);g.quadraticCurveTo(-2*s,sd*(8-6*c)*s,-14*s,sd*(11-8*c)*s);g.closePath();g.fill();g.stroke()}
 if(!f.miss&&c>=1){g.fillStyle=rgba('#8aff6a',.8*k);for(let i=0;i<4;i++)g.fillRect(4*s+i*2*s,(i%2?2:-3)*s+e*10*s,2*s,2*s)}g.restore()};
// arc qui se forme en or dans la main (début de l'Arc d'or)
JFXD.hm_forge=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=u.aim||0,q=P(u.x+Math.cos(a)*16,u.y+Math.sin(a)*16,38);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffe08a',.8*k);
 for(let i=0;i<10;i++){const b=i*.628+t*4,d=(1-e)*30*q.s;g.fillRect(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*1.4,2*q.s,2*q.s)}g.restore()};
// corde qui claque au tir
JFXD.hm_snap=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,q=P(o.x+Math.cos(f.a)*30,o.y+Math.sin(f.a)*30,38),s=q.s;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffe08a',.9*k);g.lineWidth=(f.big?4:2.5)*k+1;
 g.beginPath();g.ellipse(q.x,q.y,(8+e*(f.big?40:24))*s,(5+e*(f.big?26:15))*s,Math.atan2(Math.sin(f.a)*K,Math.cos(f.a))+1.57,0,7);g.stroke();g.restore()};
// impact de la flèche
JFXD.hm_pierce=(f,k,e)=>{const q=P(f.x,f.y,32),s=q.s,ra=Math.atan2(Math.sin(f.a)*K,Math.cos(f.a));g.save();g.translate(q.x,q.y);g.rotate(ra);g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#ffe08a',.9*k);g.lineWidth=2;for(let i=0;i<7;i++){const b=(i-3)*.3,L=(10+e*(f.big?50:30))*s;g.beginPath();g.moveTo(Math.cos(b)*6*s,Math.sin(b)*6*s);g.lineTo(Math.cos(b)*L,Math.sin(b)*L);g.stroke()}
 g.fillStyle=rgba('#fff2b8',.7*k);g.beginPath();g.arc(0,0,(6+e*8)*s,0,7);g.fill();g.restore()};
// éclaboussure de soie (impacts des boules et cocons)
DETO.silk=(x,y,r)=>{jx({jfx:'hm_splat',x,y,r,t:.5,m:.5});sparks(x,y,HMC.silk,10)};
JFXD.hm_splat=(f,k,e)=>{const q=P(f.x,f.y,0);g.save();g.strokeStyle=rgba(HMC.silk,.85*k);g.lineWidth=2;for(let i=0;i<10;i++){const a=i*.628,b=P(f.x+Math.cos(a)*f.r*(.3+e*.7),f.y+Math.sin(a)*f.r*(.3+e*.7),0);hm_strand(q.x,q.y,b.x,b.y,0,HMC.silk,1.4,.85*k)}
 g.fillStyle=rgba(HMC.silk,.5*k);gEll(f.x,f.y,f.r*.3*(1-e*.5));g.fill();g.restore()};

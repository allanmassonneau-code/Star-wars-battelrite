// ===== Clan Sabaku =====
// Le sable de la gourde enveloppe (Cercueil), écrase (Funérailles), protège (Bouclier, Armure, trait), porte (Sable volant) et engloutit (Sable mouvant, Tsunami).
// Combo signature : Cercueil ou Sable mouvant immobilise → Funérailles du désert écrase (plus fort sur une cible déjà immobilisée).
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
const SAD={coffin:'Rampe au sol sous les tirs ; enveloppe la 1re cible : immobilisée 0,5 s (1 s dans le sable mouvant)',
 fly:'Vole sur un nuage de sable jusqu\'au point visé ; à l\'envol, le nuage avale les tirs ennemis (0,25 s)',
 quick:'Sable mouvant 3 s : aspire, ralentit et freine les tirs ennemis ; rester 1,5 s dedans enlise (immobilisé)',
 armor:'Armure qui absorbe 28 dégâts 4 s (bouclier de 16 aux alliés proches) ; brisée, elle éclate et ralentit',
 tsunami:'Vague de sable qui emporte les ennemis et avale leurs tirs, puis s\'écrase : dégâts, repousse et ralentit',
 funeral:'Le sable engloutit la zone : immobilise puis écrase (énormes dégâts, étourdit ; plus fort si déjà immobilisé)',
 shield:'Sphère de sable 1,5 s : intouchable mais immobile ; à l\'ouverture, des pics jaillissent : dégâts et repousse',
 spears:'3 lances perçantes qui suivent la visée ; 2 lances sur la même cible la clouent au sol 0,6 s'};
KIT('c8',[
 [1,'D','x.sa_coffin','Cercueil de sable',SAD.coffin,'sand'],
 [2,'C','x.sa_fly','Sable volant',SAD.fly,'sand'],
 [3,'D','x.sa_quick','Sable mouvant',SAD.quick,'sand'],
 [4,'C','x.sa_armor','Armure de sable',SAD.armor,'sand'],
 [5,'B','x.sa_tsunami','Tsunami de sable',SAD.tsunami,'sand'],
 [5,'S','x.sa_funeral','Funérailles du désert',SAD.funeral,'sand'],
 [4,'A','x.sa_shield','Bouclier absolu',SAD.shield,'sand'],
 [1,'B','x.sa_spears','Lances de sable',SAD.spears,'sand'],
]);
// son « brut » (sans la teinte sable que l'élément impose à tous les sons du jutsu)
const sa_S=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V};
// le Sable mouvant du lanceur sous ce ninja ?
const sa_inQS=(o,t)=>aux.some(x=>x.type==='sa_qs'&&x.team===o.team&&Math.hypot(t.x-x.x,t.y-x.y)<x.r+t.r);
Object.assign(NAT,{
 // Sabaku Kyû : un filet de sable rampe au sol (ne se choque pas aux tirs) puis enveloppe la cible
 sa_coffin:S_('Cercueil de sable',SAD.coffin,9,{hero:'kylo',line:{len:470,w:24},ai:RG(450,.6)},(u,a)=>{S('sand',u);anim(u,'sa_grip',.6);jx({jfx:'sa_pour',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.4,m:.4});
  proj(u,a,{vfx:'sand',spd:520,r:12,dmg:4,life:.86,col:'#d8b878',noClash:1,root:.5,kind:'sa_creep',onHit:(p,t)=>{if(t.dead||!(t.root>0))return;if(sa_inQS(p.owner,t))t.root=Math.max(t.root,1);
   jx({jfx:'sa_coffin',ti:units.indexOf(t),x:t.x,y:t.y,t:t.root,m:t.root});sa_S('rock',t)}})}),
 // nuage de sable : vole jusqu'au point visé ; à l'envol (0,25 s) les tirs s'écrasent dans le nuage
 sa_fly:S_('Sable volant',SAD.fly,15,{hero:'cadbane',ai:ESC},(u,a,td)=>{const d=clamp(td||260,90,260),D=.45;S('sand',u);sa_S('wind',u);u.sa_fly=.25;anim(u,'sa_cross',D+.12);
  jx({jfx:'sa_cloud',ui:units.indexOf(u),x:u.x,y:u.y,t:D+.12,m:D+.12});sparks(u.x,u.y,'#d8b878',10,'sand');
  dash(u,a,d,D,{jump:62,end:()=>{jx({jfx:'sa_dust',x:u.x,y:u.y,r:95,t:.5,m:.5});S('sand',u)}})}),
 // sable mouvant : aspire vers le centre, ralentit, freine les tirs ; 1,5 s dedans = enlisé
 sa_quick:S_('Sable mouvant',SAD.quick,10,{hero:'cal',tele:{r:120,max:420},ai:RG(420,.5)},(u,a,td)=>{const p=atP(u,a,td,420);S('sand',u);anim(u,'sa_sink',.55);
  field(u,p.x,p.y,{r:120,t:3,slow:1,timeSlow:1,col:'#d8b878',vfx:'sand'});aux.push({type:'sa_qs',x:p.x,y:p.y,r:120,t:3,m:3,team:u.team,owner:u,vfx:'sand',k:0,in:{}});jx({jfx:'shock',x:p.x,y:p.y,r:120,t:.45,m:.45,col:'#d8b878'});sparks(p.x,p.y,'#d8b878',14,'sand')}),
 // armure de sable (absorbe, gérée par le trait) ; alliés proches : bouclier ; brisée, elle éclate
 sa_armor:S_('Armure de sable',SAD.armor,13,{hero:'thrawn',ai:DEF},(u)=>{S('sand',u);anim(u,'sa_crust',.6);u.sa_arm=28;u.sa_armT=4;u.sa_brk=0;
  for(const x of allies(u,320)){if(x!==u)shieldU(x,16,4);jx({jfx:'sa_crust',ti:units.indexOf(x),x:x.x,y:x.y,t:.6,m:.6})}}),
 // Ryûsa Bakuryû : la vague emporte, avale les tirs, puis s'écrase (logique : AUXF.sa_wavec)
 sa_tsunami:ULT('Tsunami de sable',SAD.tsunami,{line:{len:470,w:100},ai:{max:440,p:.8}},(u,a)=>{S('sand',u);sa_S('heavy',u);anim(u,'throw2',.7);jx({jfx:'sa_rise',ui:units.indexOf(u),x:u.x,y:u.y,a,t:.55,m:.55});
  const L=1.05,sp=440;
  proj(u,a,{vfx:'sand',spd:sp,r:12,dmg:0,life:L,col:'#d8b878',grenade:1,boom:1,noClash:1,kind:'sa_wave'});const pw=projs[projs.length-1];
  zone(u,u.x+Math.cos(a)*24,u.y+Math.sin(a)*24,90,8,L,{slow:1,kb:90},'#d8b878');Object.assign(lastZ(),{follow:pw,deto:'sa_crash'});
  aux.push({type:'sa_wavec',x:u.x,y:u.y,r:0,t:L+1,m:L+1,team:u.team,owner:u,p:pw,hs:new Set(),a})}),
 // Sabaku Sôsô : le sable engloutit la zone (immobilise), puis écrase les ensevelis
 sa_funeral:ULT('Funérailles du désert',SAD.funeral,{tele:{r:110,max:450},ai:{max:450,p:.8}},(u,a,td)=>{const p=atP(u,a,td,450),R=110,pre=new Set(),inZ=e=>Math.hypot(e.x-p.x,e.y-p.y)<R+e.r;S('sand',u);anim(u,'sa_funeral',1.45);
  jx({jfx:'sa_dune',x:p.x,y:p.y,r:R,t:1.3,m:1.3});zone(u,p.x,p.y,R,10,.6,{root:.9},'#d8b878');lastZ().deto='sa_wrap';
  later(u,.58,()=>{for(const e of enemies(u))if(inZ(e)&&(e.root>0||e.stun>0))pre.add(e)}); // déjà immobilisés avant l'ensevelissement
  later(u,.6,()=>{for(const e of enemies(u))if(inZ(e)&&e.root>0)jx({jfx:'sa_coffin',ti:units.indexOf(e),x:e.x,y:e.y,t:.72,m:.72,big:1})});
  later(u,1.2,()=>{let n=0;VFX='sand';for(const e of enemies(u)){if(Math.hypot(e.x-p.x,e.y-p.y)>R+e.r+30||!(e.root>0||e.stun>0))continue;n++;const b=pre.has(e);hit(e,u,b?48:36,{stun:.45,unblockable:1});if(b)say(e,'ÉCRASÉ ×1,3','#ffd38a');detoFx(e.x,e.y,70,'sa_crush')}VFX=null;
   jx({jfx:'shock',x:p.x,y:p.y,r:R,t:.5,m:.5,col:'#c8a060'});sa_S('boom',u);if(near(p.x,p.y))shake=Math.max(shake,n?.45:.2)},{x:p.x,y:p.y})}),
 // Bouclier absolu : sphère intouchable (gérée par le trait), puis pics de sable à l'ouverture
 sa_shield:S_('Bouclier absolu',SAD.shield,17,{tele:{self:1,r:125},ai:DEF},(u)=>{const D=1.5;S('sand',u);sa_S('heavy',u);u.sa_sph=D;u.root=Math.max(u.root,D);u.silence=Math.max(u.silence,D);u.disarm=Math.max(u.disarm,D);
  anim(u,'sa_cross',D);jx({jfx:'sa_sphere',ui:units.indexOf(u),x:u.x,y:u.y,t:D,m:D});zone(u,u.x,u.y,125,26,D,{kb:320},'#d8b878');lastZ().deto='sa_spk';
  later(u,D,()=>{u.sa_sph=0;if(u.dead)return;u.sa_shT=0;anim(u,'roar',.45);sa_S('rock',u)})}),
 // lances de sable : 3 lances perçantes qui suivent la visée ; 2 touches sur la même cible = clouée
 sa_spears:S_('Lances de sable',SAD.spears,8,{line:{len:520,w:20},ai:RG(500,.6)},(u)=>{const V={};jx({jfx:'sa_forge',ui:units.indexOf(u),x:u.x,y:u.y,t:.5,m:.5});
  const f=o=>{S('sand',o);anim(o,'sa_flick',.3);proj(o,o.aim,{vfx:'sand',spd:980,r:8,dmg:8,life:.54,col:'#d8b878',pierce:1,kind:'sa_spear',onHit:(p,t)=>{const k=t.c+'|'+t.team;V[k]=(V[k]||0)+1;if(near(t.x,t.y))sparks(t.x,t.y,'#d8b878',5,'sand');
   if(V[k]===2&&!t.dead){VFX='sand';hit(t,p.owner,0,{root:.6,silent:1});VFX=null;if(t.root>0)jx({jfx:'sa_pin',ti:units.indexOf(t),x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.6,m:.6})}}})};
  f(u);seqs.push({owner:u,n:2,t:.15,iv:.15,vfx:'sand',f})}),
});
Object.assign(NATHERO,{sa:'kylo'});

// ---- logique des objets
// sable mouvant (le ralentissement et le freinage des tirs viennent de la zone au sol) : aspire vers le centre ; 1,5 s sans en sortir = enlisé
AUXF.sa_qs=(x,dt)=>{const o=x.owner,end=x.t<=0;
 for(const e of units){if(e.team===x.team)continue;const key=e.c+'|'+e.team,d=Math.hypot(e.x-x.x,e.y-x.y);
  if(end||e.dead||d>x.r+e.r){if(x.in[key]){x.in[key]=0;e.sa_sink=0}continue}
  if(e.unstop>0||e.slowImm>0||e.dash)continue;
  if(d>6){const v=Math.min(d,18*dt);e.x+=(x.x-e.x)/d*v;e.y+=(x.y-e.y)/d*v}
  const v0=x.in[key]||0,v=x.in[key]=v0+dt;e.sa_sink=Math.min(1,v/1.5);
  if(v>=1.5&&v0<1.5){VFX='sand';hit(e,o,6,{root:.6});VFX=null;say(e,'ENLISÉ','#e8c890');if(near(e.x,e.y))sparks(e.x,e.y,'#c8a060',10,'sand')}}};
// tsunami : la vague (projectile sans collision) est suivie ici : elle emporte les ennemis et avale leurs tirs ; l'écrasement est une zone qui la suit
AUXF.sa_wavec=x=>{const p=x.p,o=x.owner;if(x.done)return;
 if(!p||p.dead||p.life<=0||projs.indexOf(p)<0){x.done=1;x.t=Math.min(x.t,.05);const cx=p?p.x:x.x,cy=p?p.y:x.y;S('sand',o);if(near(cx,cy))shake=Math.max(shake,.35);return} // l'écrasement lui-même : zone qui suivait la vague
 x.x=p.x;x.y=p.y;const sp=Math.hypot(p.vx,p.vy)||1,cx=p.vx/sp,cy=p.vy/sp,W=46;
 for(const q of projs)if(q.owner.team!==x.team&&!q.grenade&&!q.dead){const dx=q.x-p.x,dy=q.y-p.y;if(Math.abs(dx*cx+dy*cy)<34+q.r&&Math.abs(-dx*cy+dy*cx)<W+q.r){q.life=0;if(q.rocket)q.boom=1;if(near(q.x,q.y))sparks(q.x,q.y,'#d8b878',6,'sand')}}
 for(const e of enemies(o)){if(x.hs.has(e))continue;const dx=e.x-p.x,dy=e.y-p.y;if(Math.abs(dx*cx+dy*cy)>30+e.r||Math.abs(-dx*cy+dy*cx)>W+e.r)continue;x.hs.add(e);
  VFX='sand';const ok=hit(e,o,5,{slow:1,unblockable:1});VFX=null;if(!ok||e.dead||e.unstop>0)continue;
  const L=Math.min(.25,Math.max(.12,p.life));e.dash={sx:e.x,sy:e.y,tx:clamp(e.x+p.vx*L,B.x+e.r,B.x+B.w-e.r),ty:clamp(e.y+p.vy*L,B.y+e.r,B.y+B.h-e.r),t:0,dur:L,jump:10};
  if(e.flame||e.spin)say(e,'INTERROMPU','#fc6');e.flame=null;e.spin=null;say(e,'EMPORTÉ','#e8c890')}}; // une incantation en cours est seulement suspendue
AUXD.sa_wavec=()=>{};

// ---- trait de clan : Bouclier de sable (le sable de la gourde arrête seul le prochain projectile tiré de loin, même une attaque de base ; chaque blocage coûte du chakra ; de près, le sable est trop lent)
const SA_SHCD=22,SA_SHCK=20,SA_SHFAR=260; // recharge, chakra par blocage, distance parcourue minimale du tir
// projectile ennemi qui va toucher u à cette image (m = marge : nuage, sphère)
const sa_inc=(u,p,dt,m)=>p.owner&&p.owner.team!==u.team&&!p.grenade&&!p.dead&&p.life>0&&(Math.hypot(p.x+p.vx*dt-u.x,p.y+p.vy*dt-u.y)<u.r+p.r+m||Math.hypot(p.x-u.x,p.y-u.y)<u.r+p.r+m);
// le sable se dresse entre le ninja et le tir, qui s'y écrase
function sa_stop(u,p,big){p.life=0;if(p.rocket)p.boom=1;if(near(u.x,u.y)){jx({jfx:'sa_block',ui:units.indexOf(u),x:u.x,y:u.y,a:Math.atan2(p.y-u.y,p.x-u.x),t:.55,m:.55,big:big?1:0});sparks(p.x,p.y,'#d8b878',big?10:5,'sand');S('sand',u)}}
TRAITS[8]={nom:'Bouclier de sable',desc:'Le sable de la gourde arrête tout seul un projectile tiré de loin (20 chakra, recharge 22 s) ; de près, il n\'a pas le temps de réagir. Un croissant de sable flotte devant toi quand il est prêt',
 init(u){u.sa_shT=SA_SHCD},
 update(u,dt){if(u.sa_cds!==u.cds){u.sa_cds=u.cds;u.sa_shT=SA_SHCD;u.sa_arm=0;u.sa_armT=0;u.sa_sph=0;u.sa_fly=0;u.sa_brk=0} // nouveau ninja ou réapparition
  if(u.sa_shT>0)u.sa_shT=Math.max(0,u.sa_shT-dt);if(u.sa_fly>0)u.sa_fly-=dt;if(u.sa_sph>0)u.sa_sph=Math.max(0,u.sa_sph-dt);
  if(u.sa_armT>0){u.sa_armT-=dt;if(u.sa_armT<=0&&u.sa_arm>0){u.sa_arm=0;if(near(u.x,u.y))sparks(u.x,u.y,'#d8b878',10,'sand')}}
  if(u.sa_brk){u.sa_brk=0;VFX='sand';aoe(u,u.x,u.y,110,8,{slow:1.4,quiet:1},'#d8b878');VFX=null;jx({jfx:'sa_shards',x:u.x,y:u.y,t:.55,m:.55});say(u,'ARMURE BRISÉE','#e8c890');sa_S('rock',u)}
  for(const p of projs){if(u.sa_sph>0){if(sa_inc(u,p,dt,26))sa_stop(u,p,0);continue}if(!sa_inc(u,p,dt,8))continue;
   if(u.sa_fly>0){sa_stop(u,p,0);continue}if(u.sa_shT<=0&&u.energy>=SA_SHCK&&((p.life0||0)-p.life)*Math.hypot(p.vx,p.vy)>=SA_SHFAR){sa_stop(u,p,1);u.sa_shT=SA_SHCD;u.energy-=SA_SHCK;say(u,'BOUCLIER DE SABLE','#e8c890')}}},
 // sphère : intouchable ; armure : absorbe les dégâts (puis éclate à l'image suivante)
 take(t,src,dmg,o){if(t.sa_sph>0&&src!==t)return -1;if(t.sa_arm>0&&dmg>0&&src&&src!==t){const ab=Math.min(t.sa_arm,dmg);t.sa_arm-=ab;dmg-=ab;if(t.sa_arm<=0){t.sa_arm=0;t.sa_armT=0;t.sa_brk=1}}return dmg},
 // croissant de sable devant le ninja quand le bouclier est prêt ; jauge au sol pendant la recharge
 draw(u,p,S,sk){if(u.sa_sph>0)return;const low=(u.energy||0)<SA_SHCK;const t=performance.now()/1000,cy=p.y-30*S*sk,a=Math.atan2(Math.sin(u.aim||0)*K,Math.cos(u.aim||0));
  if(!(u.sa_shT>0)&&!low){const rx=27*S*sk,ry=33*S*sk;g.save();g.lineCap='round';g.strokeStyle=rgba('#a88a50',.55);g.lineWidth=6*S;g.beginPath();g.ellipse(p.x,cy,rx,ry,0,a-.75,a+.75);g.stroke();
   g.strokeStyle=rgba('#f0d8a0',.55+Math.sin(t*5)*.15);g.lineWidth=2*S;g.beginPath();g.ellipse(p.x,cy,rx,ry,0,a-.6,a+.6);g.stroke();
   g.fillStyle='#e8cc90';for(let i=0;i<5;i++){const b=a-.8+((t*.9+i*.2)%1)*1.6;g.fillRect(p.x+Math.cos(b)*rx*1.1,cy+Math.sin(b)*ry*1.05-1,1.8*S,1.8*S)}g.restore()}
  else{const dry=low&&!(u.sa_shT>0),k=dry?1:1-u.sa_shT/SA_SHCD;g.save();g.strokeStyle=rgba('#d8b878',dry?.25:.55);g.lineWidth=2;if(dry)g.setLineDash([4,6]);g.beginPath();g.ellipse(p.x,p.y,20*S,20*S*K,0,-Math.PI/2,-Math.PI/2+k*Math.PI*2);g.stroke();g.restore()}}, // pointillés : prêt mais chakra insuffisant
 hud(u,x,y){const k=1-(u.sa_shT||0)/SA_SHCD,low=u.energy<SA_SHCK,ok=k>=1&&!low;y-=20;bar(x,y,150,5,k,ok?'#f0d8a0':'#a88a50');text(ok?'Bouclier de sable : prêt':k<1?'Bouclier de sable '+Math.ceil(u.sa_shT)+' s':'Bouclier de sable : chakra !',x+158,y+6,11,ok?'#ffe0a0':'#b89a70','left','normal')}};
AFTER.push(()=>UK.push('sa_shT','sa_arm','sa_sink','sa_sph'));

// ---- animations 3D
Object.assign(ANIM,{
 // main tendue vers la cible, le poing se referme à la fin (Sabaku Kyû)
 sa_grip:(P,e)=>{const k=ezo(Math.min(1,e/.28)),c=e>.6?ezo(Math.min(1,(e-.6)/.25)):0;pz(P,'armR',-1.5*k-.3*c,0,.1);pz(P,'foreR',-.1-.8*c);pz(P,'armL',-1,0,-.55);pz(P,'foreL',-1.95);pz(P,'chest',.12*k,.25*k);pz(P,'head',.05,-.15*k);P.root.y=-1.5*k},
 // bras croisés, immobile et droit (sur le nuage, dans la sphère)
 sa_cross:(P,e,u,t)=>{pz(P,'armL',-1.05,0,-.72);pz(P,'foreL',-2.05);pz(P,'armR',-1.15,0,.78);pz(P,'foreR',-2.1);pz(P,'head',.12);pz(P,'chest',-.05);pz(P,'thighL',0,0,.05);pz(P,'thighR',0,0,-.05);pz(P,'shinL',0);pz(P,'shinR',0);pz(P,'cape',-.25);P.root.y=Math.sin(t*3)*.6},
 // accroupi, paumes vers le sol (le sol devient sable mouvant)
 sa_sink:(P,e)=>{const k=bump(Math.min(1,e*1.25));P.root.y=-6*k;pz(P,'thighL',-.75*k);pz(P,'shinL',1.3*k);pz(P,'thighR',-.2*k);pz(P,'shinR',1*k);pz(P,'chest',.5*k);pz(P,'armL',-.95*k,0,-.2);pz(P,'foreL',-.15);pz(P,'armR',-.95*k,0,.2);pz(P,'foreR',-.15);pz(P,'head',-.15*k)},
 // bras écartés paumes ouvertes : le sable remonte le long du corps
 sa_crust:(P,e)=>{const k=ezo(Math.min(1,e/.4));pz(P,'armL',-.35-.45*k,0,.85);pz(P,'foreL',-.6);pz(P,'armR',-.35-.45*k,0,-.85);pz(P,'foreR',-.6);pz(P,'chest',-.12*k);pz(P,'head',.3*k);P.root.y=1.2*k},
 // jet sec d'un bras (lances)
 sa_flick:(P,e)=>{const up=e<.3,k=up?e/.3:ezo(Math.min(1,(e-.3)/.35));pz(P,'armR',up?-.6-2*k:-2.6+1.05*k,0,.12);pz(P,'foreR',up?-1.1*k:-1.1+1*k);pz(P,'armL',-1,0,-.55);pz(P,'foreL',-1.95);pz(P,'chest',up?-.1:.18,up?-.15:.3)},
 // main ouverte vers la zone, puis le poing se serre d'un coup (Sabaku Sôsô)
 sa_funeral:(P,e)=>{const k=ezo(Math.min(1,e/.25)),c=e>.8?ezo(Math.min(1,(e-.8)/.1)):0;pz(P,'armR',-1.75*k+.25*c,0,.08);pz(P,'foreR',-.05-1.1*c);pz(P,'armL',-1,0,-.55);pz(P,'foreL',-1.95);pz(P,'chest',.1*k+.25*c,.2);pz(P,'head',.05+.2*c);P.root.y=-1.5*k-2*c},
});

// ---- visuels
const SAC=['#d8b878','#a88a50','#f0d8a0','#c8a060','#6a4a28']; // sable clair, sombre, très clair, moyen, contour
// Cercueil : ruban de sable au sol, la tête se dresse comme une main prête à saisir
PROJD.sa_creep=(p,R,ra,t)=>{g.translate(0,28);const sp=Math.hypot(p.vx,p.vy)||1,L=Math.min(150,((p.life0||1)-p.life)*sp);
 g.save();g.rotate(ra);g.fillStyle=rgba(SAC[1],.6);g.beginPath();g.moveTo(4,0);for(let i=0;i<=6;i++)g.lineTo(-L*i/6,-(R*(1-i/7)*.9+Math.sin(t/60+i*1.9)*1.5));for(let i=6;i>=0;i--)g.lineTo(-L*i/6,R*(1-i/7)*.9+Math.sin(t/60+i*1.9+2)*1.5);g.closePath();g.fill();
 g.strokeStyle=rgba(SAC[2],.6);g.lineWidth=1.5;g.beginPath();g.moveTo(0,0);for(let i=1;i<=6;i++)g.lineTo(-L*i/6,Math.sin(t/50+i*2.3)*R*.35);g.stroke();g.restore();
 const h=R*2.1+Math.sin(t/45)*2;g.fillStyle=SAC[3];g.strokeStyle=SAC[4];g.lineWidth=1.2;g.beginPath();g.moveTo(-R,0);g.quadraticCurveTo(-R*.8,-h,0,-h*1.05);g.quadraticCurveTo(R*.8,-h,R,0);g.closePath();g.fill();g.stroke();
 g.lineWidth=2;g.lineCap='round';for(let i=0;i<3;i++){const b=-R*.55+i*R*.55;g.beginPath();g.moveTo(b,-h*.85);g.lineTo(b*1.3+Math.sin(t/40+i)*3,-h*1.35);g.stroke()}
 g.fillStyle=SAC[2];for(let i=0;i<4;i++)g.fillRect(Math.sin(t/30+i*2)*R,-h*.5-Math.cos(t/35+i)*h*.4,1.8,1.8)};
// geste du Cercueil : le sable coule de la gourde (dans le dos) jusqu'au sol devant
JFXD.sa_pour=(f,k,e,t,u)=>{if(!u)return;const a=P(u.x-Math.cos(f.a)*8,u.y-Math.sin(f.a)*8,54),b=P(u.x+Math.cos(f.a)*52,u.y+Math.sin(f.a)*52,0),c={x:(a.x+b.x)/2,y:Math.min(a.y,b.y)-34*a.s},m=Math.min(1,e*2.6),n=8;
 g.strokeStyle=rgba(SAC[3],.85*Math.min(1,k*3));g.lineWidth=5*a.s;g.lineCap='round';g.beginPath();for(let i=0;i<=n;i++){const s=m*i/n,x=(1-s)*(1-s)*a.x+2*(1-s)*s*c.x+s*s*b.x,y=(1-s)*(1-s)*a.y+2*(1-s)*s*c.y+s*s*b.y;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
 g.fillStyle=SAC[2];for(let i=0;i<6;i++){const s=((t*2+i/6)%1)*m,x=(1-s)*(1-s)*a.x+2*(1-s)*s*c.x+s*s*b.x,y=(1-s)*(1-s)*a.y+2*(1-s)*s*c.y+s*s*b.y;g.fillRect(x+(i%3-1)*3,y,2*a.s,2*a.s)}};
// cercueil de sable autour de la cible (big : Funérailles, tout le corps puis écrasé)
JFXD.sa_coffin=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,held=tg.root>0||tg.stun>0||e<.25,rise=Math.min(1,e*f.m/.2),crush=f.big&&k*f.m<.12?k*f.m/.12:1,
 H=(f.big?72:44)*s*rise*(held?1:Math.min(1,k*f.m/.15))*crush,W=(f.big?22:19)*s*(f.big&&crush<1?1+(1-crush)*.6:1);if(H<2)return;
 g.fillStyle=rgba(SAC[1],.55);g.beginPath();g.ellipse(q.x,q.y,W*1.55,W*1.2*K,0,0,7);g.fill();
 g.fillStyle=SAC[3];g.strokeStyle=SAC[4];g.lineWidth=1.6;g.beginPath();g.moveTo(q.x-W,q.y+2);g.bezierCurveTo(q.x-W*1.3,q.y-H*.55,q.x-W*.85,q.y-H,q.x,q.y-H-4*s);g.bezierCurveTo(q.x+W*.85,q.y-H,q.x+W*1.3,q.y-H*.55,q.x+W,q.y+2);g.closePath();g.fill();g.stroke();
 g.strokeStyle=rgba(SAC[2],.75);g.lineWidth=2*s;for(let i=1;i<4;i++){const y=q.y-H*i/4.3+Math.sin(t*6+i)*1.5;g.beginPath();g.moveTo(q.x-W*1.08,y+3*s);g.quadraticCurveTo(q.x,y-5*s,q.x+W*1.08,y+3*s);g.stroke()}
 g.strokeStyle=rgba(SAC[4],.5);g.lineWidth=1;g.beginPath();g.moveTo(q.x-W*.3,q.y-H*.9);g.quadraticCurveTo(q.x+W*.4,q.y-H*.6,q.x-W*.2,q.y-H*.2);g.stroke();
 g.fillStyle=SAC[2];for(let i=0;i<5;i++){const a=(t*1.3+i*.2)%1;g.fillRect(q.x+(i-2)*W*.45,q.y-H*(1-a)+2,2*s,2*s)}};
// nuage de sable sous les pieds pendant le vol (les grains retombent au sol)
JFXD.sa_cloud=(f,k,e,t,u)=>{if(!u||u.dead)return;const z=u.z||0,q=P(u.x,u.y,Math.max(0,z-3)),g0=P(u.x,u.y,0),s=q.s,al=Math.min(1,k*4);
 g.fillStyle=SAC[0];for(let i=1;i<10;i++){const c=i/10,p=P(lerp(f.x,u.x,c),lerp(f.y,u.y,c),z*c+Math.sin(t*9+i)*3);g.globalAlpha=al*c*.85;g.fillRect(p.x,p.y,2.6*p.s,2.6*p.s)} // traînée de grains
 g.globalAlpha=al;g.fillStyle=rgba(SAC[4],.28);g.beginPath();g.ellipse(g0.x,g0.y,30*s,30*s*K,0,0,7);g.fill();
 g.fillStyle=SAC[0];for(let i=0;i<8;i++){const y=lerp(q.y,g0.y,(t*2.4+i/8)%1);g.fillRect(q.x+(i-3.5)*6*s,y,2*s,2*s)}
 for(const [dx,dy,r,c] of[[-19,4,16,SAC[1]],[18,4,15,SAC[1]],[0,5,18,'#b8945a'],[0,-1,20,SAC[0]],[-10,-6,11,SAC[2]],[11,-5,10,'#e8cc90']]){g.fillStyle=c;g.beginPath();g.ellipse(q.x+dx*s+Math.sin(t*5+dx)*1.5*s,q.y+dy*s,r*s,r*s*.55,0,0,7);g.fill()}
 g.strokeStyle=rgba(SAC[2],.7);g.lineWidth=1.8;g.beginPath();g.ellipse(q.x,q.y-1*s,24*s,7*s,0,t*6,t*6+3.5);g.stroke();g.globalAlpha=1};
// retombée du nuage : anneau de poussière et bouffées de sable
JFXD.sa_dust=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s,R=f.r*(.35+e*.75);g.strokeStyle=rgba(SAC[0],.7*k);g.lineWidth=5*k+1;gEll(f.x,f.y,R);g.stroke();
 for(let i=0;i<8;i++){const a=i*.785+.3,p=P(f.x+Math.cos(a)*R*.9,f.y+Math.sin(a)*R*.9,6+e*14);g.fillStyle=rgba(i%2?SAC[1]:SAC[0],.55*k);g.beginPath();g.ellipse(p.x,p.y,(7+e*8)*s,(4+e*5)*s,0,0,7);g.fill()}};
// sable mouvant : disque qui tourbillonne vers un centre sombre
AUXD.sa_qs=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s;g.fillStyle=rgba(SAC[0],.32*k);gEll(x.x,x.y,x.r);g.fill();g.fillStyle=rgba(SAC[1],.4*k);gEll(x.x,x.y,x.r*.62);g.fill();g.fillStyle=rgba(SAC[4],.5*k);gEll(x.x,x.y,x.r*.22);g.fill();
 g.strokeStyle=rgba(SAC[3],.85*k);g.lineWidth=3;gEll(x.x,x.y,x.r);g.stroke();g.strokeStyle=rgba(SAC[4],.35*k);g.lineWidth=1.5;gEll(x.x,x.y,x.r*.9);g.stroke();
 for(let j=0;j<4;j++){g.strokeStyle=rgba(j%2?SAC[2]:SAC[4],(j%2?.6:.45)*k);g.lineWidth=j%2?2:3;g.beginPath();for(let i=0;i<=10;i++){const d=1-i/11,b=t*1.4+j*1.571+i*.45;const xx=q.x+Math.cos(b)*R*d,yy=q.y+Math.sin(b)*R*d*K;i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}
 g.fillStyle=rgba('#e8cc90',.85*k);for(let i=0;i<10;i++){const d=(t*.35+i*.1)%1,b=i*2.4+t*1.4+d*4.5;g.fillRect(q.x+Math.cos(b)*R*(1-d),q.y+Math.sin(b)*R*(1-d)*K,2*q.s,2*q.s)}};
// armure de sable : le sable remonte le long du corps
JFXD.sa_crust=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,h=e*66*s;g.fillStyle=rgba(SAC[0],.35*k);g.beginPath();g.ellipse(q.x,q.y-h*.5,20*s,h*.55+4,0,0,7);g.fill();
 g.fillStyle=SAC[2];for(let i=0;i<10;i++){const a=t*7+i*.63;g.fillRect(q.x+Math.cos(a)*18*s,q.y-h*(i/10)+Math.sin(a)*4*s,2*s,2*s)}g.strokeStyle=rgba(SAC[0],.8*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y-h,17*s,5*s,0,0,7);g.stroke()};
// armure brisée : éclats de sable
JFXD.sa_shards=(f,k,e)=>{const q=P(f.x,f.y,30),s=q.s;for(let i=0;i<10;i++){const a=i*.63,d=(14+e*70)*s,x=q.x+Math.cos(a)*d,y=q.y+Math.sin(a)*d*.6+e*e*30*s;g.save();g.translate(x,y);g.rotate(a+e*6);g.fillStyle=i%2?SAC[3]:SAC[1];g.globalAlpha=k;g.fillRect(-4*s,-2.5*s,8*s,5*s);g.restore()}
 g.strokeStyle=rgba(SAC[0],.6*k);g.lineWidth=3;gEll(f.x,f.y,30+e*80);g.stroke()};
// Bouclier absolu : la sphère monte du sol et se referme (avec le Troisième œil de sable qui flotte au-dessus)
JFXD.sa_sphere=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s,el=e*f.m,form=Math.min(1,el/.25),R=52*s,cy=q.y-42*s,open=k*f.m<.1?k*f.m/.1:1;
 g.fillStyle='rgba(40,28,14,.35)';g.beginPath();g.ellipse(q.x,q.y,R*1.05,R*.62*K,0,0,7);g.fill();
 g.save();g.beginPath();g.rect(q.x-R*1.3,q.y+R*.3-(R*2.6)*form,R*2.6,R*2.6*form);g.clip();g.globalAlpha=open;
 g.fillStyle=SAC[3];g.beginPath();g.ellipse(q.x,cy,R,R*.95,0,0,7);g.fill();g.fillStyle=rgba(SAC[1],.9);g.beginPath();g.ellipse(q.x+R*.18,cy+R*.2,R*.8,R*.72,.3,0,7);g.fill();
 g.fillStyle=rgba(SAC[2],.55);g.beginPath();g.ellipse(q.x-R*.35,cy-R*.4,R*.32,R*.2,-.5,0,7);g.fill();
 g.strokeStyle=rgba(SAC[4],.45);g.lineWidth=2*s;for(let i=0;i<3;i++){const y=cy-R*.55+i*R*.55,w=Math.sqrt(Math.max(0,1-((y-cy)/(R*.95))**2))*R;g.beginPath();g.ellipse(q.x,y,w,R*.12,0,.1+(t*.8+i)%.6,Math.PI-.1);g.stroke()}
 g.strokeStyle=rgba(SAC[4],.3);g.lineWidth=2.5*s;for(let i=0;i<2;i++){g.beginPath();g.ellipse(q.x,cy,R*.78,R*.32,.5-i*1.1,t*(.6+i*.3)+i,t*(.6+i*.3)+i+1.6);g.stroke()}
 g.fillStyle=rgba(SAC[4],.35);for(let i=0;i<9;i++){const a=i*2.4+t*.4,r=R*(.25+(i%3)*.22);g.fillRect(q.x+Math.cos(a)*r,cy+Math.sin(a)*r*.9,2*s,2*s)}
 g.strokeStyle=SAC[4];g.lineWidth=2;g.beginPath();g.ellipse(q.x,cy,R,R*.95,0,0,7);g.stroke();g.restore();
 g.fillStyle=SAC[2];for(let i=0;i<6;i++){const a=t*2.5+i*1.05;g.fillRect(q.x+Math.cos(a)*R*1.15,cy+Math.sin(a)*R*.4,2*s,2*s)}
 if(form>=1&&open>=1){const ex=q.x+R*.95,ey=cy-R*1.05+Math.sin(t*3)*3*s;circ(ex,ey,6*s,SAC[3]);circ(ex,ey,3.6*s,'#f8f0dc');circ(ex+Math.cos(u.aim)*1.2*s,ey,1.8*s,'#2a1a0a')}};
// pics de sable à l'ouverture de la sphère
JFXD.sa_spikes=(f,k,e)=>{const ext=e<.25?ezo(e/.25):1,ret=Math.min(1,k/.4),n=14;
 for(let i=0;i<n;i++){const a=i*Math.PI*2/n+(i%2)*.12,L=f.r*(i%2?.72:1)*ext*ret+24,b=P(f.x+Math.cos(a)*L,f.y+Math.sin(a)*L,12+(i%3)*9),r0=P(f.x+Math.cos(a)*24,f.y+Math.sin(a)*24,30),w=6*r0.s,px=-Math.sin(a)*w,py=Math.cos(a)*w*K;
  g.fillStyle=i%2?SAC[3]:'#b8945a';g.strokeStyle=SAC[4];g.lineWidth=1;g.beginPath();g.moveTo(r0.x+px,r0.y+py);g.lineTo(b.x,b.y);g.lineTo(r0.x-px,r0.y-py);g.closePath();g.fill();g.stroke()}
 const q=P(f.x,f.y,30);g.fillStyle=rgba(SAC[0],.7*k);g.beginPath();g.ellipse(q.x,q.y,(30+e*20)*q.s,(22+e*12)*q.s,0,0,7);g.fill()};
// lance de sable compact (spirale de grains autour de la hampe)
PROJD.sa_spear=(p,R,ra,t)=>{g.rotate(ra);g.scale(1.3,1.3);g.fillStyle=rgba(SAC[1],.5);for(let i=1;i<4;i++)g.fillRect(-20-i*8,Math.sin(t/40+i*2)*3-1,3,2);
 g.fillStyle=SAC[3];g.strokeStyle=SAC[4];g.lineWidth=1;g.beginPath();g.moveTo(19,0);g.lineTo(3,-4);g.lineTo(-22,-2.6);g.lineTo(-27,0);g.lineTo(-22,2.6);g.lineTo(3,4);g.closePath();g.fill();g.stroke();
 g.strokeStyle=SAC[2];g.lineWidth=1.2;g.beginPath();g.moveTo(15,-.6);g.lineTo(-18,-1);g.stroke();g.strokeStyle=rgba('#e8cc90',.75);g.beginPath();for(let i=0;i<=8;i++)g.lineTo(-22+i*4,Math.sin(i*1.4+t/25)*4.5);g.stroke()};
// geste des Lances : 3 lances se forment au-dessus de l'épaule, pointées vers la visée, et partent une à une
JFXD.sa_forge=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=u.aim,ra=Math.atan2(Math.sin(a)*K,Math.cos(a));for(let i=0;i<3;i++){if(e*f.m>.04+i*.15)continue;const off=(i-1)*20,q=P(u.x-Math.sin(a)*off-Math.cos(a)*4,u.y+Math.cos(a)*off-Math.sin(a)*4,64+(i===1?8:0));
  g.save();g.translate(q.x,q.y);g.rotate(ra);g.scale(q.s*.8,q.s*.8);g.fillStyle=SAC[3];g.strokeStyle=SAC[4];g.lineWidth=1;g.beginPath();g.moveTo(16,0);g.lineTo(2,-3.5);g.lineTo(-18,-2);g.lineTo(-18,2);g.lineTo(2,3.5);g.closePath();g.fill();g.stroke();g.restore()}
 const g0=P(u.x-Math.cos(a)*8,u.y-Math.sin(a)*8,50);g.fillStyle=SAC[2];for(let i=0;i<6;i++){const b=t*6+i*1.05;g.fillRect(g0.x+Math.cos(b)*10*g0.s,g0.y-((t*60+i*7)%26)*g0.s,2*g0.s,2*g0.s)}};
// cible clouée : deux lances plantées en croix à ses pieds
JFXD.sa_pin=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,al=Math.min(1,k*4);g.globalAlpha=al;g.fillStyle=rgba(SAC[1],.6);g.beginPath();g.ellipse(q.x,q.y,18*s,7*s,0,0,7);g.fill();
 for(const sd of[-1,1]){g.save();g.translate(q.x+sd*9*s,q.y+2*s);g.rotate(sd*.45);g.fillStyle=SAC[3];g.strokeStyle=SAC[4];g.lineWidth=1;g.beginPath();g.moveTo(0,-34*s);g.lineTo(3*s,-26*s);g.lineTo(2*s,4*s);g.lineTo(-2*s,4*s);g.lineTo(-3*s,-26*s);g.closePath();g.fill();g.stroke();g.restore()}g.globalAlpha=1};
// Tsunami : vague de sable (au sol, la crête recourbée vers l'avant) ; projectile « grenade » : on redescend à hauteur du sol
PROJD.sa_wave=(p,R,ra,t)=>{const z=Math.sin(Math.PI*(1-p.life/p.life0))*70+15;g.translate(0,z);const sp=Math.hypot(p.vx,p.vy)||1,cx=p.vx/sp,cy=p.vy/sp,nx=-cy,ny=cx,W=56,n=4,
 grow=Math.min(1,(p.life0-p.life)/.2+.35)*Math.min(1,p.life/.12+.45),H=92*grow,S2=(a,b,h)=>[a*cx+b*nx,(a*cy+b*ny)*K-h],L=[];
 const sea=[S2(-120,-W*.8,0),S2(-120,W*.8,0),S2(-6,W,0),S2(-6,-W,0)];g.fillStyle=rgba(SAC[1],.38);g.beginPath();sea.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill(); // mer de sable qui suit
 for(let i=-n;i<=n;i++){const s=i/n;L.push({w:W*s,h:H*(1-s*s*.5)*(.84+.16*Math.sin(t/110+i*2.1)),y:W*s*ny*K})}L.sort((a,b)=>a.y-b.y);
 g.lineCap='round';g.strokeStyle=rgba(SAC[1],.5);g.lineWidth=9;for(const o of L){const [a0,b0]=S2(-14,o.w,0),[a1,b1]=S2(-60-Math.abs(o.w)*.2,o.w,0);g.beginPath();g.moveTo(a0,b0-7);g.lineTo(a1,b1-2);g.stroke()} // traînées
 // chaque bourrelet : masse sombre, face, crête claire, pointe qui s'enroule vers l'avant
 for(const o of L){const h=o.h,[bx,by]=S2(0,o.w,0),E=(a,yy,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(bx+cx*a,by+cy*a*K-yy,rx,Math.max(1,ry),0,0,7);g.fill()};
  E(-10,h*.45,22,h*.5,'#9a7c46');E(3,h*.43,18,h*.46,SAC[3]);E(8,h*.78,12,h*.18,SAC[0]);E(15,h*.7,7,5.5,SAC[2]);E(13,h*.6,6,3,rgba(SAC[4],.45))}
 g.fillStyle=SAC[2];for(let i=0;i<14;i++){const o=L[i%L.length],[bx,by]=S2(10,o.w,0),up=(t/240+i*.19)%1;g.fillRect(bx+cx*up*22+(i%3-1)*4,by-o.h*(.85+up*.4),2.4,2.4)} // embruns
 g.fillStyle=rgba(SAC[0],.55);for(let i=0;i<L.length;i+=2){const [fx,fy]=S2(20,L[i].w,0);g.beginPath();g.ellipse(fx,fy-3,11,4.5,0,0,7);g.fill()}}; // poussière au pied
// geste du Tsunami : une colonne de sable jaillit derrière le ninja et se rabat vers l'avant
JFXD.sa_rise=(f,k,e,t,u)=>{if(!u)return;const b0=P(u.x-Math.cos(f.a)*30,u.y-Math.sin(f.a)*30,0),top=P(u.x-Math.cos(f.a)*20+Math.cos(f.a)*e*70,u.y-Math.sin(f.a)*20+Math.sin(f.a)*e*70,110*Math.min(1,e*3)),s=b0.s;
 g.strokeStyle=rgba(SAC[1],.85*k);g.lineWidth=22*s*k+2;g.lineCap='round';g.beginPath();g.moveTo(b0.x,b0.y);g.quadraticCurveTo(b0.x,top.y,top.x,top.y);g.stroke();g.strokeStyle=rgba(SAC[2],.7*k);g.lineWidth=6*s;g.stroke();
 g.fillStyle=SAC[0];for(let i=0;i<8;i++){const a=i*.8+t*4;g.fillRect(top.x+Math.cos(a)*16*s,top.y+Math.sin(a)*8*s,2.4*s,2.4*s)}};
// vague qui s'écrase : gerbe de sable, anneau et retombées
JFXD.sa_crash=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s;g.fillStyle=rgba(SAC[1],.35*k);gEll(f.x,f.y,f.r*(.5+e*.6));g.fill();g.strokeStyle=rgba(SAC[0],.8*k);g.lineWidth=6*k+1;gEll(f.x,f.y,f.r*(.4+e*.75));g.stroke();
 const up=Math.sin(Math.PI*Math.min(1,e*1.2));if(e<.5){g.fillStyle=rgba(SAC[3],.9*(1-e*2));g.beginPath();g.ellipse(q.x,q.y-up*50*s,f.r*.55*s*(1-e),up*60*s,0,0,7);g.fill()} // la masse retombe
 for(let i=0;i<14;i++){const a=i*.449+.2,d=f.r*(.15+e*.8)*(i%2?.65:1),h=up*(70+(i%4)*28)*s,p=P(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d,0);g.fillStyle=i%3?SAC[3]:SAC[1];g.beginPath();g.ellipse(p.x,p.y-h,(8-e*4)*s,(6-e*3)*s,0,0,7);g.fill()}
 g.fillStyle=SAC[2];for(let i=0;i<10;i++){const a=i*.63,p=P(f.x+Math.cos(a)*f.r*e,f.y+Math.sin(a)*f.r*e,0);g.fillRect(p.x,p.y-up*30*s,2.4*s,2.4*s)}};
// Funérailles : le sol de la zone se met à tourbillonner, des colonnes de sable montent au bord
JFXD.sa_dune=(f,k,e,t)=>{const q=P(f.x,f.y,0),R=f.r*q.s,gr=Math.min(1,e*2.2);g.fillStyle=rgba(SAC[1],.35*Math.min(1,k*3));gEll(f.x,f.y,f.r*gr);g.fill();
 g.strokeStyle=rgba(SAC[2],.6*Math.min(1,k*3));g.lineWidth=2.5;for(let j=0;j<4;j++){g.beginPath();for(let i=0;i<=9;i++){const d=(1-i/10)*gr,b=-t*2.2+j*1.571+i*.5;const xx=q.x+Math.cos(b)*R*d,yy=q.y+Math.sin(b)*R*d*K;i?g.lineTo(xx,yy):g.moveTo(xx,yy)}g.stroke()}
 if(e<.45)for(let i=0;i<8;i++){const a=i*.785+t,p=P(f.x+Math.cos(a)*f.r*.95,f.y+Math.sin(a)*f.r*.95,0),h=Math.sin(Math.PI*Math.min(1,e/.45))*55*p.s;g.fillStyle=rgba(SAC[3],.85);g.beginPath();g.moveTo(p.x-5*p.s,p.y);g.quadraticCurveTo(p.x,p.y-h*1.4,p.x+5*p.s,p.y);g.fill()}};
DETO.sa_crash=(x,y,r)=>jx({jfx:'sa_crash',x,y,r,t:.7,m:.7});
DETO.sa_spk=(x,y,r)=>jx({jfx:'sa_spikes',x,y,r,t:.5,m:.5});
DETO.sa_wrap=(x,y,r)=>{jx({jfx:'shock',x,y,r,t:.4,m:.4,col:'#c8a060'});sparks(x,y,'#c8a060',12,'sand')};
// écrasement du cercueil : le sable implose puis gicle
DETO.sa_crush=(x,y,r)=>{jx({jfx:'sa_burst',x,y,r,t:.6,m:.6});sparks(x,y,'#c8a060',14,'sand')};
JFXD.sa_burst=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s,imp=e<.25,c=imp?1-e/.25:0;if(imp){g.fillStyle=SAC[3];g.strokeStyle=SAC[4];g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y-36*s,(14+c*10)*s,(40*c+8)*s,0,0,7);g.fill();g.stroke()}
 else{const d=(e-.25)/.75;for(let i=0;i<10;i++){const a=i*.628,p=P(f.x+Math.cos(a)*f.r*d,f.y+Math.sin(a)*f.r*d,40*Math.sin(Math.PI*d)+6);g.fillStyle=i%2?SAC[3]:SAC[1];g.globalAlpha=k*1.3;g.beginPath();g.ellipse(p.x,p.y,6*s,4*s,a,0,7);g.fill()}g.globalAlpha=1;
  g.strokeStyle=rgba(SAC[0],.7*k);g.lineWidth=4;gEll(f.x,f.y,f.r*(.3+d*.8));g.stroke()}};
// trait : un pan de sable se dresse entre le ninja et le tir, puis s'effrite
JFXD.sa_block=(f,k,e,t,u)=>{if(!u||u.dead)return;const rise=Math.min(1,e/.18),H=(f.big?46:30)*rise*Math.min(1,k/.35),n=f.big?7:5;
 for(let i=0;i<n;i++){const b=f.a+(i-(n-1)/2)*.26,p=P(u.x+Math.cos(b)*30,u.y+Math.sin(b)*30,0),s=p.s,h=H*s*(1-Math.abs(i-(n-1)/2)*.12);g.fillStyle=i%2?SAC[3]:SAC[0];g.strokeStyle=SAC[4];g.lineWidth=1;g.beginPath();g.moveTo(p.x-5.5*s,p.y);g.lineTo(p.x-4*s,p.y-h);g.quadraticCurveTo(p.x,p.y-h-5*s,p.x+4*s,p.y-h);g.lineTo(p.x+5.5*s,p.y);g.closePath();g.fill();g.stroke()}
 if(k<.4){const p=P(u.x+Math.cos(f.a)*30,u.y+Math.sin(f.a)*30,0);g.fillStyle=SAC[2];for(let i=0;i<6;i++)g.fillRect(p.x+(i-2.5)*5*p.s,p.y-H*p.s*(1-((t*3+i*.3)%1)),2*p.s,2*p.s)}};
// états visibles : ensablé dans le sable mouvant, armure de sable
STATD.push((u,p,S,sk)=>{const t=performance.now()/1000;
 if(u.sa_sink>0){const h=(5+u.sa_sink*13)*S;g.fillStyle=SAC[1];g.beginPath();g.ellipse(p.x,p.y+1,17*S,6*S,0,0,7);g.fill();g.fillStyle=SAC[3];g.beginPath();g.ellipse(p.x,p.y,15*S,h,0,Math.PI,Math.PI*2);g.fill();
  g.strokeStyle=rgba(SAC[2],.8);g.lineWidth=1.5;g.beginPath();g.ellipse(p.x,p.y-h*.45,12*S,3*S,0,Math.PI+.3,Math.PI*2-.3);g.stroke();g.fillStyle=SAC[2];for(let i=0;i<3;i++)g.fillRect(p.x+(i-1)*8*S,p.y-h*((t*1.5+i*.33)%1),2*S,2*S)}
 if(u.sa_arm>0){const f=Math.min(1,u.sa_arm/28),cy=p.y-30*S*sk,rx=22*S*sk,ry=32*S*sk;g.fillStyle=rgba(SAC[3],.2+.16*f);g.beginPath();g.ellipse(p.x,cy,rx,ry,0,0,7);g.fill();g.strokeStyle=rgba(SAC[4],.85);g.lineWidth=3;g.setLineDash([10,4]);g.lineDashOffset=-t*8;g.stroke();g.setLineDash([]);
  g.strokeStyle=rgba(SAC[2],.7);g.lineWidth=1.5;g.beginPath();g.ellipse(p.x,cy,rx*.9,ry*.92,0,3.6,5.6);g.stroke();
  for(let i=0;i<8;i++){const a=i*.785+t*.7;if(Math.sin(a)<-.15)continue;const x=p.x+Math.cos(a)*rx*.98,y=cy+((i*37)%60-30)/30*ry*.72,z=6.5*S;g.fillStyle=i%2?SAC[3]:SAC[0];g.strokeStyle=SAC[4];g.lineWidth=1.2;g.beginPath();g.moveTo(x-z,y-z*.7);g.lineTo(x+z*.7,y-z);g.lineTo(x+z,y+z*.7);g.lineTo(x-z*.7,y+z);g.closePath();g.fill();g.stroke()}
  if(f<.6){g.strokeStyle='rgba(60,40,20,.85)';g.lineWidth=1.6;g.beginPath();g.moveTo(p.x-rx*.5,cy-ry*.6);g.lineTo(p.x-rx*.2,cy-ry*.2);g.lineTo(p.x-rx*.45,cy+ry*.2);g.moveTo(p.x+rx*.4,cy-ry*.4);g.lineTo(p.x+rx*.15,cy);if(f<.3){g.moveTo(p.x+rx*.5,cy+ry*.3);g.lineTo(p.x+rx*.1,cy+ry*.55)}g.stroke()}}});

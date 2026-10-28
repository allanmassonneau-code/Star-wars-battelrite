// ===== Clan Yamanaka =====
// Techniques de l'esprit (Shintenshin, Shinranshin, Shinden, Esprit destructeur) et fleurs de la boutique Yamanaka.
// Trait « Marque de l'esprit » : tes jutsu marquent l'esprit des ennemis touchés ; ton attaque de base suivante fait éclater la marque.
// Les projectiles mentaux (objets aux « ya_mind ») traversent parades et projectiles, mais pas les obstacles ni les murs ennemis.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
KIT('c7',[
 [1,'A','x.ya_shinran','Shinranshin','Onde mentale imparable : la cible confuse titube au hasard et subit +25 % de dégâts 1,2 s (1,6 s si marquée)','mind'],
 [2,'C','x.ya_swap','Transposition','Échange ta place avec l\'allié visé (bouclier aux deux) ; sans allié, file au curseur en esprit, intangible','mind'],
 [1,'D','x.ya_flower','Kunai fleuri','Kunai rapide enveloppé de pétales : transperce, blesse et ralentit chaque ennemi touché','flower'],
 [3,'C','x.ya_pollen','Pollen hypnotique','Nuage de pollen 4 s qui ralentit ; l\'ennemi qui y reste 0,8 s s\'endort 1,8 s, mais un coup le réveille','flower'],
 [4,'B','x.ya_storm','Tempête de pétales','3 vagues de pétales devant toi : blessent, ralentissent puis repoussent, et hachent les projectiles ennemis','flower'],
 [3,'S','x.ya_shinten','Shintenshin','Esprit imparable : possède la cible 1,5 s, qui marche vers ton curseur et se frappe. Corps inerte, sonné si raté','mind'],
 [4,'B','x.ya_garden','Champ de fleurs','Champ de fleurs 4 s autour de toi : tes alliés et toi y régénérez, les ennemis y sont ralentis et marqués','flower'],
 [5,'S','x.ya_shinden','Shinden : Lien des esprits','Lie ton esprit à l\'ennemi visé 5 s : la moitié des dégâts que tu subis lui revient. Brisé au loin ou si tu es étourdi','mind'],
 [5,'S','x.ya_destroy','Esprit destructeur','Verrouille l\'esprit visé 1 s puis le brise : dégâts + 30 % des PV manquants (45 % si marqué), étourdit','mind'],
]);
// ---------- aides ----------
const yaI=u=>units.indexOf(u);
const yaS=(k,u)=>{const V=VFX;VFX=null;S(k,u);VFX=V}; // son propre, sans la teinte « genjutsu » des éléments mind / flower
const yaMkOn=e=>!!e&&(e.ya_mkU||0)>SIMT; // cible marquée (Marque de l'esprit)
function yaMark(src,e,d=4){if(!e||e.dead||!src)return;const nw=!yaMkOn(e);e.ya_mkU=SIMT+d;e.ya_mk=d;e.ya_mkB=yaI(src);if(nw&&near(e.x,e.y))jx({jfx:'ya_mkon',ti:yaI(e),x:e.x,y:e.y,t:.45,m:.45})}
const yaHit=(e,u,dmg,o,v='mind')=>{const V=VFX;VFX=v;const r=hit(e,u,dmg,Object.assign({unblockable:1},o));VFX=V;return r};
// visée des bots : anticipe selon la vitesse réelle du projectile
function yaAim(u,a,sp){if(u.ctrl)return a;const e=u.tgt;if(!e||e.dead)return a;const t=dist(u,e)/sp;return Math.atan2(e.y+e.vy*t*.85-u.y,e.x+e.vx*t*.85-u.x)+(rnd()-.5)*.1}
// curseur du lanceur dans le monde (joueur local ou distant) ; null pour un bot
function yaCursor(o){try{if(o.ctrl==='local'&&o===player)return unP(mouse.x,mouse.y);if(o.ctrl==='remote'){const Q=peerOf(o.rid);if(Q&&Q.in)return{x:+Q.in.ax||o.x,y:+Q.in.ay||o.y}}}catch(err){}return null}
// corps abandonné (pendant le Shintenshin) : plus aucune action
const yaLimp=o=>{o.stun=Math.max(o.stun,.1);o.cast=null;o.block=false;o.chk=false};
// l'esprit revient dans son corps (visuel), éventuellement sonné
function yaBack(o,x,y,daze){if(near(x,y)||near(o.x,o.y))jx({jfx:'ya_back',ui:yaI(o),x,y,t:.32,m:.32});if(daze){o.stun=Math.max(o.stun,.4);anim(o,'ya_limp',.45);say(o,'ESPRIT ÉGARÉ','#d8a8ff')}}
// projectile mental : avance en ligne droite, traverse parades et tirs, s'arrête sur les obstacles et les murs ennemis
function yaMind(u,a,o){const x=Object.assign({type:'ya_mind',x:u.x+Math.cos(a)*22,y:u.y+Math.sin(a)*22,a,t:o.len/o.sp,m:o.len/o.sp,team:u.team,owner:u,ui:yaI(u),vfx:'mind',k:0},o);aux.push(x);return x}
// confusion : la cible garde ses attaques et ses jutsu, mais ses pas partent au hasard
function yaConfuse(o,e,d){if(e.dead||e.unstop>0)return;
 let x=aux.find(q=>q.type==='ya_conf'&&q.tg===e);if(x){x.t=Math.max(x.t,d);x.m=Math.max(x.m,x.t)}else{x={type:'ya_conf',x:e.x,y:e.y,a:rnd()*7,r:0,t:d,m:d,team:o.team,owner:o,tg:e,ti:yaI(e),vfx:'mind',k:0,ph:rnd()*7};aux.push(x);if(near(e.x,e.y))jx({jfx:'ya_daze',ti:yaI(e),x:e.x,y:e.y,t:4,m:4})}
 e.ya_cf=d;say(e,'CONFUS','#d8a8ff');anim(e,'ya_dizzy',x.t)}
// possession (Shintenshin)
function yaPossess(o,e,mk){if(e.unstop>0){say(e,'RÉSISTE','#d8a8ff');yaBack(o,e.x,e.y,1);return}const d=1.5+(mk?.3:0);
 if(e.cast||e.spin||e.flame)say(e,'INTERROMPU','#fc6');e.cast=null;e.dash=null;e.spin=null;e.flame=null;e.block=false;e.stun=Math.max(e.stun,.1);e.ya_pz=d;e.ya_pa=ang(e,o);
 say(e,'POSSÉDÉ','#d8a8ff');anim(e,'ya_puppet',d);anim(o,'ya_limp',d+.15);yaS('genjutsu',e);yaS('shadow',e);
 aux.push({type:'ya_poss',x:e.x,y:e.y,a:0,r:0,t:d,m:d,team:o.team,owner:o,tg:e,ui:yaI(o),ti:yaI(e),vfx:'mind',k:.5});
 if(near(e.x,e.y)){jx({jfx:'ya_possfx',ui:yaI(o),ti:yaI(e),x:e.x,y:e.y,t:d,m:d});jx({jfx:'ya_ripple',x:e.x,y:e.y,t:.5,m:.5})}}
// ultime ciblé sans cible : rien n'est dépensé
function yaRefund(u,key){const i=u.ch.abil.findIndex(b=>b&&b.key===key);if(i>=0){u.cds[i]=1;u.energy=Math.min(100,u.energy+jcost(u.ch.abil[i]))}say(u,'AUCUNE CIBLE','#d8a8ff')}
// sommeil (Pollen) : un coup réveille
function yaSleep(o,e,d){e.cast=null;e.spin=null;e.flame=null;e.dash=null;e.block=false;e.stun=Math.max(e.stun,d);e.sleepT=-d;e.ya_sl=d;
 say(e,'ENDORMI','#ffd8e8');yaS('genjutsu',e);aux.push({type:'ya_sleep',x:e.x,y:e.y,r:0,t:d,m:d,team:o.team,owner:o,tg:e,ti:yaI(e),vfx:'flower',k:0,hp:e.hp})}
Object.assign(NAT,{
 // Kunai fleuri : kunai rapide et perçant, une hélice de pétales autour de la lame
 ya_flower:S_('Kunai fleuri','Kunai rapide enveloppé de pétales : transperce, blesse et ralentit chaque ennemi touché',5,{line:{len:520,w:16},ai:RG(520,.7)},(u,a)=>{yaS('blaster',u);anim(u,'ya_throw',.42);
  jx({jfx:'ya_petfan',ui:yaI(u),x:u.x,y:u.y,a,t:.4,m:.4});
  proj(u,a,{spd:950,r:7,dmg:13,life:.55,col:'#ff9ac8',pierce:1,slow:1,kind:'ya_kunai',onHit:(p,t)=>{if(near(t.x,t.y))jx({jfx:'ya_burst',x:t.x,y:t.y,a:Math.atan2(p.vy,p.vx),t:.45,m:.45})}});
  aux.push({type:'ya_kt',x:u.x,y:u.y,a,r:0,t:1,m:1,team:u.team,owner:u,k:0,p:projs[projs.length-1]})}),
 // Transposition : échange avec un allié, sinon l'esprit file et le corps suit (intangible)
 ya_swap:S_('Transposition','Échange ta place avec l\'allié visé (bouclier aux deux) ; sans allié, file au curseur en esprit, intangible',9,{ai:ESC},(u,a,td)=>{const p=atP(u,a,td,320),o={x:u.x,y:u.y};
  const al=units.filter(x=>x!==u&&x.team===u.team&&!x.dead&&Math.hypot(x.x-p.x,x.y-p.y)<160&&dist(x,u)<520).sort((m,n)=>Math.hypot(m.x-p.x,m.y-p.y)-Math.hypot(n.x-p.x,n.y-p.y))[0];
  yaS('poof',u);yaS('genjutsu',u);anim(u,'ya_blink',.36);
  if(al){u.x=al.x;u.y=al.y;al.x=o.x;al.y=o.y;collide(u);collide(al);shieldU(u,15,1.5);shieldU(al,15,1.5);u.aim=a;
   jx({jfx:'ya_swapfx',x:o.x,y:o.y,x2:u.x,y2:u.y,t:.55,m:.55});say(al,'TRANSPOSITION','#d8a8ff');return}
  u.phase=Math.max(u.phase||0,.25);dash(u,a,clamp(Math.hypot(p.x-u.x,p.y-u.y),90,300),.16,{end:()=>{if(near(u.x,u.y))jx({jfx:'ya_arrive',x:u.x,y:u.y,t:.45,m:.45})}});
  const D=u.dash;jx({jfx:'ya_ghost',x:o.x,y:o.y,a,t:.6,m:.6});if(D)jx({jfx:'ya_streak',x:o.x,y:o.y,x2:D.tx,y2:D.ty,t:.38,m:.38})}),
 // Shinranshin : onde de confusion, imparable mais esquivable
 ya_shinran:S_('Shinranshin','Onde mentale imparable : la cible confuse titube au hasard et subit +25 % de dégâts 1,2 s (1,6 s si marquée)',12,{hero:'inquisitor',line:{len:470,w:34},ai:RG(450,.6)},(u,a)=>{a=yaAim(u,a,760);u.aim=a;
  yaS('genjutsu',u);anim(u,'ya_wave',.5);jx({jfx:'ya_sigil',ui:yaI(u),x:u.x,y:u.y,a,t:.42,m:.42});
  yaMind(u,a,{kind:'ran',sp:760,len:470,r:17,onHit:(x,e)=>{const mk=yaMkOn(e);const d=mk?1.6:1.2;if(yaHit(e,u,13,{})){e.vuln=Math.max(e.vuln,d);yaConfuse(u,e,d)};if(near(e.x,e.y))jx({jfx:'ya_ripple',x:e.x,y:e.y,t:.5,m:.5})},
   onMiss:x=>{if(near(x.x,x.y))jx({jfx:'ya_ripple',x:x.x,y:x.y,t:.4,m:.4,s:.6})}})}),
 // Shintenshin : l'esprit quitte le corps ; s'il touche, la cible est possédée
 ya_shinten:S_('Shintenshin','Esprit imparable : possède la cible 1,5 s, qui marche vers ton curseur et se frappe. Corps inerte, sonné si raté',14,{hero:'kylo',line:{len:540,w:30},ai:RG(500,.5)},(u,a)=>{a=yaAim(u,a,700);u.aim=a;
  yaS('genjutsu',u);yaS('shadow',u);anim(u,'ya_sign',.95);jx({jfx:'ya_sigil',ui:yaI(u),x:u.x,y:u.y,a,t:.55,m:.55,big:1});
  yaMind(u,a,{kind:'ten',sp:700,len:540,r:16,lock:1,onHit:(x,e)=>{const mk=yaMkOn(e);if(yaHit(e,u,6,{}))yaPossess(u,e,mk);else yaBack(u,x.x,x.y,0)},onMiss:(x,cut)=>yaBack(u,x.x,x.y,!cut)})}),
 // Pollen hypnotique : bouquet lancé, nuage qui endort
 ya_pollen:S_('Pollen hypnotique','Nuage de pollen 4 s qui ralentit ; l\'ennemi qui y reste 0,8 s s\'endort 1,8 s, mais un coup le réveille',10,{tele:{r:120,max:420},ai:RG(420,.55)},(u,a,td)=>{const p=atP(u,a,td,420),fl=.4;
  yaS('dash',u);anim(u,'ya_toss',.45);jx({jfx:'ya_bouquet',x:u.x,y:u.y,x2:p.x,y2:p.y,t:fl,m:fl});
  aux.push({type:'ya_pollen',x:p.x,y:p.y,r:120,t:4+fl,m:4+fl,team:u.team,owner:u,vfx:'flower',k:0,fl,on:0,dz:{}})}),
 // Tempête de pétales : 3 vagues dans un cône, hachent les projectiles
 ya_storm:S_('Tempête de pétales','3 vagues de pétales devant toi : blessent, ralentissent puis repoussent, et hachent les projectiles ennemis',9,{line:{len:250,w:180},ai:RG(230,.6)},(u,a)=>{yaS('wind',u);anim(u,'ya_storm',.62);
  jx({jfx:'ya_storm',ui:yaI(u),x:u.x,y:u.y,a,r:270,t:.62,m:.62});
  const wave=i=>{if(u.dead||u.stun>0)return;const V=VFX;VFX='flower';
   for(const e of enemies(u))if(dist(u,e)<265+e.r&&angDiff(ang(u,e),a)<.58)hit(e,u,9,i===0?{slow:1.5}:i===2?{kb:190}:{});
   for(const p of projs)if(p.owner.team!==u.team&&!p.dead&&p.life>0&&!p.rocket&&!p.grenade&&!p.big&&p.r<=16&&Math.hypot(p.x-u.x,p.y-u.y)<275&&angDiff(Math.atan2(p.y-u.y,p.x-u.x),a)<.62){p.life=0;if(near(p.x,p.y))jx({jfx:'ya_burst',x:p.x,y:p.y,a:a,t:.35,m:.35,s:.6})}
   VFX=V;if(i===2)yaS('saber',u)};
  wave(0);later(u,.13,()=>wave(1));later(u,.26,()=>wave(2))}),
 // Champ de fleurs : jardin posé au sol, soigne les alliés, ralentit et marque les ennemis
 ya_garden:S_('Champ de fleurs','Champ de fleurs 4 s autour de toi : tes alliés et toi y régénérez, les ennemis y sont ralentis et marqués',15,{hero:'quigon',tele:{self:1,r:160},ai:HEALM},(u)=>{yaS('orb',u);yaS('genjutsu',u);anim(u,'ya_bloom',.9);
  aux.push({type:'ya_garden',x:u.x,y:u.y,r:160,t:4,m:4,team:u.team,owner:u,vfx:'flower',k:.1});jx({jfx:'ya_bloom',x:u.x,y:u.y,r:160,t:.7,m:.7,g:1})}),
 // Esprit destructeur : lien mental puis l'esprit de la cible vole en éclats
 ya_destroy:ULT('Esprit destructeur','Verrouille l\'esprit visé 1 s puis le brise : dégâts + 30 % des PV manquants (45 % si marqué), étourdit',{hero:'sister',line:{len:420,w:26},ai:{mode:'exec',max:420,p:.9}},(u,a,td)=>{const e=pick(u,a,td||300,420);
  if(!e){yaRefund(u,'ya_destroy');return}
  yaS('genjutsu',u);anim(u,'ya_focus',1.15);u.aim=ang(u,e);u.root=Math.max(u.root,1);
  aux.push({type:'ya_dest',x:e.x,y:e.y,r:0,t:1,m:1,team:u.team,owner:u,tg:e,ui:yaI(u),ti:yaI(e),vfx:'mind',k:0});
  jx({jfx:'ya_lock',ui:yaI(u),ti:yaI(e),x:e.x,y:e.y,t:1,m:1});say(e,'ESPRIT VERROUILLÉ','#d8a8ff')}),
 // Shinden : lien des esprits, la moitié des dégâts subis repart vers l'ennemi lié (voir TRAITS[7].take)
 ya_shinden:ULT('Shinden : Lien des esprits','Lie ton esprit à l\'ennemi visé 5 s : la moitié des dégâts que tu subis lui revient. Brisé au loin ou si tu es étourdi',{line:{len:450,w:26},ai:RG(420,.7)},(u,a,td)=>{const e=pick(u,a,td||300,450);
  if(!e){yaRefund(u,'ya_shinden');return}
  yaS('genjutsu',u);yaS('shadow',u);anim(u,'ya_shinden',.75);u.ya_lnkT=yaI(e);u.ya_lnkU=SIMT+5;
  aux.push({type:'ya_lnk',x:e.x,y:e.y,r:0,t:5,m:5,team:u.team,owner:u,tg:e,ui:yaI(u),ti:yaI(e),vfx:'mind',k:0});
  jx({jfx:'ya_shinden',ui:yaI(u),ti:yaI(e),x:e.x,y:e.y,t:5,m:5});jx({jfx:'ya_ripple',x:e.x,y:e.y,t:.5,m:.5});say(e,'ESPRITS LIÉS','#d8a8ff')}),
});
Object.assign(NATHERO,{ya:'thrawn'});
// ---------- logique des objets ----------
// suit le kunai ; là où il retombe, il se plante et fleurit (visuel)
AUXF.ya_kt=x=>{const p=x.p;if(p&&projs.indexOf(p)>=0&&!p.dead){x.x=p.x;x.y=p.y;return}x.t=0;if(x.x>B.x+12&&x.x<B.x+B.w-12&&x.y>B.y+12&&x.y<B.y+B.h-12&&near(x.x,x.y))jx({jfx:'ya_plant',x:x.x,y:x.y,a:x.a,t:1.3,m:1.3})};
AUXD.ya_kt=()=>{};
AUXF.ya_mind=(x,dt)=>{if(x.done)return;const o=x.owner;
 if(!o||o.dead||(x.lock&&o.stun>.15)){x.done=1;x.t=0;if(o&&!o.dead&&x.onMiss)x.onMiss(x,1);if(o&&!o.dead&&x.lock)say(o,'ESPRIT CHASSÉ','#d8a8ff');return}
 if(x.lock)yaLimp(o);
 x.x+=Math.cos(x.a)*x.sp*dt;x.y+=Math.sin(x.a)*x.sp*dt;if(near(x.x,x.y)&&rnd()<.6)fx.push({x:x.x,y:x.y,z:34,vx:(rnd()-.5)*40,vy:(rnd()-.5)*40,t:.35,m:.35,col:'#d8a8ff',r:2.2,vfx:'mind'});
 let stop=x.x<B.x||x.x>B.x+B.w||x.y<B.y||x.y>B.y+B.h;
 if(!stop)for(const p of OBST)if(Math.hypot(x.x-p.x,x.y-p.y)<p.r+4){stop=true;break}
 if(!stop)for(const w of walls)if(w.team!==x.team&&Math.hypot(x.x-w.x,x.y-w.y)<w.r+x.r*.6){stop=true;break}
 if(!stop)for(const e of enemies(o))if(!(e.phase>0)&&Math.hypot(e.x-x.x,e.y-x.y)<e.r+x.r){x.done=1;x.t=0;x.onHit(x,e);return}
 if(stop||x.t<=0){x.done=1;x.t=0;if(x.onMiss)x.onMiss(x,0)}};
AUXF.ya_conf=(x,dt)=>{const e=x.tg;if(!e||e.dead||e.unstop>0){x.t=0;if(e)e.ya_cf=0;return}e.ya_cf=Math.max(0,x.t);if(e.dash||e.stun>0||e.root>0)return;
 // le déplacement voulu (e.vx, e.vy, déjà appliqué cette image) est remplacé par une marche titubante
 const tau=x.m-x.t,b=x.a+Math.sin(tau*2.4+x.ph)*1.7+tau*1.3,sp=e.ch.spd*.7*(e.slow>0?.55:1)*(e.haste>0?1.4:1)*(e.cast?.4:1);
 e.x+=(Math.cos(b)*sp-e.vx)*dt;e.y+=(Math.sin(b)*sp-e.vy)*dt;collide(e);x.x=e.x;x.y=e.y};
AUXF.ya_poss=(x,dt)=>{const o=x.owner,e=x.tg;
 if(!o||o.dead||!e||e.dead||o.stun>.15||e.unstop>0||(x.m-x.t>.05&&e.stun<=0)){x.t=0;if(e)e.ya_pz=0;if(o&&!o.dead&&e){yaBack(o,e.x,e.y,0);say(o,'ESPRIT CHASSÉ','#d8a8ff')}return}
 yaLimp(o);e.stun=Math.max(e.stun,.1);e.cast=null;e.block=false;e.ya_pz=Math.max(0,x.t);
 // la cible marche vers le curseur du lanceur (bot : vers son propre corps)
 const T=yaCursor(o),tx=T?T.x:o.x,ty=T?T.y:o.y,dx=tx-e.x,dy=ty-e.y,dd=Math.hypot(dx,dy),stop=T?16:72;
 if(dd>stop){const sp=e.ch.spd*.8*dt,k=Math.min(1,(dd-stop)/sp);e.x+=dx/dd*sp*k;e.y+=dy/dd*sp*k;e.aim=Math.atan2(dy,dx);collide(e)}
 x.x=e.x;x.y=e.y;x.a=Math.atan2(dy,dx);e.ya_pa=x.a;
 if(x.k<=0&&x.t>.2){x.k=.5;yaHit(e,o,5,{});e.flash=.12;if(near(e.x,e.y))jx({jfx:'ya_slap',ti:yaI(e),x:e.x,y:e.y,t:.3,m:.3})}
 if(x.t<=0){e.ya_pz=0;yaHit(e,o,22,{silence:1,stun:.4});yaBack(o,e.x,e.y,0);if(near(e.x,e.y)){jx({jfx:'ya_ripple',x:e.x,y:e.y,t:.55,m:.55,s:1.3});yaS('genjutsu',e)}}};
AUXF.ya_sleep=x=>{const e=x.tg;if(!e||e.dead){x.t=0;if(e){e.ya_sl=0;e.sleepT=0}return}x.x=e.x;x.y=e.y;const rem=Math.max(0,x.t);
 if(e.hp<x.hp-.5&&x.m-rem>.1){if(e.stun<=rem+.1)e.stun=Math.min(e.stun,.12);e.sleepT=0;e.ya_sl=0;e.ya_slI=SIMT+2.5;x.t=0;say(e,'RÉVEILLÉ','#ffd8e8');if(near(e.x,e.y))jx({jfx:'ya_wake',ti:yaI(e),x:e.x,y:e.y,t:.4,m:.4});return}
 x.hp=Math.max(x.hp,e.hp);e.ya_sl=rem;if(rem<=0){e.ya_sl=0;e.ya_slI=SIMT+2.5}};
AUXF.ya_pollen=(x,dt)=>{const o=x.owner;
 if(!x.on){if(x.m-x.t<x.fl)return;x.on=1;if(near(x.x,x.y)){yaS('poof',o);jx({jfx:'ya_bloom',x:x.x,y:x.y,r:x.r,t:.6,m:.6})}if(o)field(o,x.x,x.y,{r:x.r,t:x.t,slow:1,col:'#ffe08a',vfx:'ya_pollen'})}
 for(const e of units){if(e.dead||e.team===x.team)continue;const i=yaI(e),inn=Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r*.5;let v=x.dz[i]||0;
  if(inn&&e.unstop<=0&&!((e.ya_slI||0)>SIMT)&&!(e.ya_sl>0)){v+=dt;if(v>=.8){v=0;yaSleep(o,e,1.8)}else e.sleepT=Math.max(e.sleepT,v*1.6)}else v=Math.max(0,v-dt*.6);x.dz[i]=v}};
AUXF.ya_garden=x=>{if(x.k>0)return;x.k=.25;const o=x.owner;
 for(const e of units){if(e.dead||Math.hypot(e.x-x.x,e.y-x.y)>x.r+e.r)continue;
  if(e.team===x.team){if(e.hp<e.max)gain(e,3.5*.25,o)}else{if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.35);if(o&&!o.dead)yaMark(o,e)}}};
AUXF.ya_dest=x=>{if(x.done)return;const o=x.owner,e=x.tg;if(!o||o.dead||!e||e.dead){x.t=0;x.done=1;return}x.x=e.x;x.y=e.y;
 if(o.stun>0||e.phase>0||Math.hypot(e.x-o.x,e.y-o.y)>520){x.t=0;x.done=1;say(e,'LIEN BRISÉ','#cccccc');if(near(e.x,e.y))jx({jfx:'ya_snap',ui:yaI(o),ti:yaI(e),x:e.x,y:e.y,t:.4,m:.4});return}
 o.root=Math.max(o.root,.1);o.aim=ang(o,e);
 if(x.t<=0){x.done=1;const mk=yaMkOn(e);if(mk){e.ya_mkU=0;e.ya_mk=0}
  yaHit(e,o,20,{exec:mk?.45:.3,stun:.4,ya_nomk:1});say(e,'ESPRIT BRISÉ','#ffffff');
  if(near(e.x,e.y)){jx({jfx:'ya_shatter',ti:yaI(e),x:e.x,y:e.y,t:.9,m:.9});shake=Math.max(shake,.35);yaS('boom',e);yaS('deflect',e)}}};
AUXF.ya_lnk=x=>{const o=x.owner,e=x.tg;if(!o||!e){x.t=0;return}x.x=e.x;x.y=e.y;
 if(o.dead||e.dead||o.stun>0||Math.hypot(e.x-o.x,e.y-o.y)>560||!((o.ya_lnkU||0)>SIMT)){if(x.t>.05&&!o.dead&&!e.dead){say(e,'LIEN BRISÉ','#cccccc');if(near(e.x,e.y))jx({jfx:'ya_snap',ui:yaI(o),ti:yaI(e),x:e.x,y:e.y,t:.4,m:.4})}o.ya_lnkU=0;x.t=0}};
// ---------- trait de clan : Marque de l'esprit (et renvoi des dégâts du Shinden) ----------
TRAITS[7]={nom:'Marque de l\'esprit',desc:'Tes jutsu marquent l\'esprit des ennemis touchés (4 s). Ta prochaine attaque de base sur une cible marquée fait éclater la marque : +5 dégâts et +5 chakra.',
 deal(src,t,dmg,o){if(!t||t===src||t.team===src.team)return dmg;
  if(o.basic){if(!o.silent&&yaMkOn(t)){t.ya_mkU=0;t.ya_mk=0;src.energy=Math.min(100,src.energy+5);if(near(t.x,t.y))jx({jfx:'ya_pop',ti:yaI(t),x:t.x,y:t.y,t:.5,m:.5});return dmg+5}return dmg}
  if(!o.silent&&!o.ya_nomk)yaMark(src,t);return dmg},
 take(t,src,dmg,o){if(dmg>0&&src&&src!==t&&src.team!==t.team&&!o.ya_lk&&(t.ya_lnkU||0)>SIMT){const p=units[t.ya_lnkT];if(p&&p!==t&&!p.dead&&p.team!==t.team){const tr=dmg*.5,kp=src.ch&&src.ch.pw&&t.ch.pw?src.ch.pw/t.ch.pw:1,V=VFX;VFX='mind';const ok=hit(p,t,tr*kp,{unblockable:1,ya_lk:1,ya_nomk:1,silent:!!o.silent});VFX=V;
   if(ok){if(!o.silent&&near(p.x,p.y))jx({jfx:'ya_pulse',ui:yaI(t),ti:yaI(p),x:p.x,y:p.y,t:.32,m:.32});return dmg-tr}}}return dmg},
 update(u){const i=yaI(u);for(const e of units)if(e.ya_mkB===i&&e.ya_mk>0)e.ya_mk=Math.max(0,(e.ya_mkU||0)-SIMT)},
 // fils de l'esprit vers les ennemis marqués
 draw(u,p,S){const i=yaI(u),t=performance.now()/1000;for(const e of units){if(e.dead||e.ya_mkB!==i||!(e.ya_mk>0)||!near(e.x,e.y))continue;
  const a=P(u.x,u.y,50),b=P(e.x,e.y,50);g.save();g.strokeStyle=rgba('#d8a8ff',.38*Math.min(1,e.ya_mk*2));g.lineWidth=1.4;g.setLineDash([3,7]);g.lineDashOffset=-t*30;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2-24*p.s,b.x,b.y);g.stroke();g.restore()}},
 hud(u,x,y){y-=11;const i=yaI(u),L=units.filter(e=>!e.dead&&e.team!==u.team&&e.ya_mkB===i&&e.ya_mk>0);yaFlw(x+5,y-4,1.1,performance.now()/700,'#d8a8ff','#fff'); // juste sous la jauge d'endurance (la liste des alliés commence plus bas)
  text('Marque de l\'esprit',x+14,y,11,'#d8a8ff','left');if(!L.length){text('aucune marque',x+128,y,10,'#8a7aa8','left','normal');return}
  L.slice(0,3).forEach((e,j)=>{const bx=x+128+j*48;g.fillStyle='rgba(0,0,0,.5)';g.fillRect(bx,y-7,42,6);g.fillStyle='#d8a8ff';g.fillRect(bx,y-7,42*Math.min(1,e.ya_mk/4),6)})}};
AFTER.push(()=>{UK.push('ya_mk','ya_mkB','ya_pz','ya_pa','ya_cf','ya_sl');VP.ya_pollen=['#ffe08a','#fff4c0','#ffd36a'];
 const jm=JFX.mind;JFX.mind=(u,a,td,pre,ab)=>{if(ab&&ab.key&&ab.key.slice(0,3)==='ya_')return;if(jm)jm(u,a,td,pre,ab)}}); // signatures génériques remplacées par celles de ce fichier
// ---------- dessin : aides ----------
const YAP=['#ff9ac8','#ffd8e8','#ff6aa8','#ffffff']; // pétales
// pétale (ellipse allongée), x y écran
function yaPet(x,y,s,r,col){g.fillStyle=col;g.beginPath();g.ellipse(x,y,4.4*s,1.9*s,r,0,7);g.fill()}
// petite fleur à 4 pétales (2 ellipses croisées) et son cœur
function yaFlw(x,y,s,r,col,c2){g.fillStyle=col;g.beginPath();g.ellipse(x,y,5*s,2.1*s,r,0,7);g.fill();g.beginPath();g.ellipse(x,y,5*s,2.1*s,r+1.57,0,7);g.fill();circ(x,y,1.7*s,c2||'#ffe08a')}
// œil de l'esprit dans le losange du signe Shintenshin
function yaEye(x,y,R,rot,a){g.save();g.translate(x,y);g.rotate(rot);g.globalAlpha*=a;g.fillStyle='rgba(192,128,255,.32)';g.strokeStyle='#e8d0ff';g.lineWidth=Math.max(1,R*.13);g.beginPath();g.moveTo(0,-R);g.lineTo(R*.82,0);g.lineTo(0,R);g.lineTo(-R*.82,0);g.closePath();g.fill();g.stroke();
 g.fillStyle='#ffffff';g.beginPath();g.moveTo(-R*.56,0);g.quadraticCurveTo(0,-R*.5,R*.56,0);g.quadraticCurveTo(0,R*.5,-R*.56,0);g.fill();circ(0,0,R*.2,'#8a4ae0');g.restore()}
// ---------- projectiles et objets ----------
// kunai fleuri : ruban et hélice de pétales autour de la lame
PROJD.ya_kunai=(p,R,ra,t)=>{g.rotate(ra);const ph=t/55;
 g.strokeStyle='rgba(255,154,200,.5)';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-36,Math.sin(t/70)*7);g.quadraticCurveTo(-20,-Math.sin(t/70)*8,-5,0);g.stroke();
 for(let i=0;i<6;i++){const b=ph+i*1.05;if(Math.cos(b)<0)yaPet(-4-i*4.6,Math.sin(b)*8,.7,b*1.7,'rgba(255,106,168,.8)')}
 g.strokeStyle='#3a3a44';g.lineWidth=1.3;g.beginPath();g.arc(-17,0,2.6,0,7);g.stroke();g.fillStyle='#3a3a44';g.fillRect(-14.5,-1.6,8.5,3.2);
 g.fillStyle='#d8dde6';g.beginPath();g.moveTo(-6,-4.2);g.lineTo(11,0);g.lineTo(-6,4.2);g.fill();g.fillStyle='#ffffff';g.beginPath();g.moveTo(-6,-1);g.lineTo(11,0);g.lineTo(-6,1);g.fill();
 for(let i=0;i<6;i++){const b=ph+i*1.05;if(Math.cos(b)>=0)yaPet(-4-i*4.6,Math.sin(b)*8,.8+.25*Math.cos(b),b*1.7,YAP[i%2])}};
// onde de Shinranshin (anneaux et spirale) ; esprit du Shintenshin (feu follet lavande aux yeux clos)
AUXD.ya_mind=(x,k,t)=>{const q=P(x.x,x.y,34),s=q.s,ra=Math.atan2(Math.sin(x.a)*K,Math.cos(x.a));g.fillStyle='rgba(0,0,0,.22)';gEll(x.x,x.y,x.r*.7);g.fill();g.globalCompositeOperation='lighter';
 if(x.kind==='ran'){g.translate(q.x,q.y);g.rotate(ra);
  for(let i=0;i<3;i++){const f=(t*2.6+i/3)%1;g.strokeStyle=rgba(i%2?'#ff9ac8':'#d8a8ff',.85*(1-f));g.lineWidth=2.6*s;g.beginPath();g.ellipse(-f*30*s,0,(5+f*8)*s,(10+f*18)*s,0,-1.35,1.35);g.stroke()}
  circ(0,0,12*s,'rgba(192,128,255,.3)');g.rotate(t*10);g.strokeStyle='#ffffff';g.lineWidth=1.7*s;g.beginPath();for(let i=0;i<13;i++){const b=i*.62,r=i*.75*s;i?g.lineTo(Math.cos(b)*r,Math.sin(b)*r):g.moveTo(0,0)}g.stroke();return}
 for(let i=5;i>0;i--)circ(q.x-Math.cos(ra)*i*7*s,q.y-Math.sin(ra)*i*7*s+Math.sin(t*12+i)*1.5*s,(x.r*.95-i*1.8)*s,'rgba(192,128,255,.16)');
 circ(q.x,q.y,x.r*1.3*s,'rgba(192,128,255,.28)');circ(q.x,q.y,x.r*.78*s,'rgba(232,208,255,.55)');circ(q.x,q.y,x.r*.42*s,'#ffffff');
 g.globalCompositeOperation='source-over';g.strokeStyle='#5a2a8a';g.lineWidth=1.4*s;for(const sx of[-1,1]){g.beginPath();g.arc(q.x+sx*4*s,q.y-1*s,2.2*s,.25,Math.PI-.25);g.stroke()}};
// nuage de pollen : bouffées pastel, grains qui montent
AUXD.ya_pollen=(x,k,t)=>{const age=x.m-x.t;if(age<.4)return;const a=Math.min(1,(age-.4)*3,x.t*1.5),R=x.r;
 g.strokeStyle=rgba('#fff4c0',.55*a);g.lineWidth=1.5;g.setLineDash([6,8]);g.lineDashOffset=-t*12;gEll(x.x,x.y,R);g.stroke();g.setLineDash([]);
 g.globalCompositeOperation='lighter';
 for(let i=0;i<8;i++){const b=i*.785+t*.35,d=R*(.2+.45*((i*37)%10)/10),c=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.8,16+Math.sin(t*1.3+i)*6);circ(c.x,c.y,(R*.34+Math.sin(t*2+i)*4)*c.s,rgba(i%2?'#ffe08a':'#ffd8e8',.12*a))}
 for(let i=0;i<16;i++){const b=i*2.4+t*.6,d=R*((i*53)%100)/100*.9,hz=(t*22+i*17)%60,c=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d*.8,6+hz);circ(c.x,c.y,1.7*c.s,rgba('#fff4c0',.9*a*(1-hz/60)))}};
// champ de fleurs : fleurs qui poussent en spirale, soins qui montent
AUXD.ya_garden=(x,k,t)=>{const age=x.m-x.t,R=x.r,a=Math.min(1,x.t*1.2),sp=ezo(Math.min(1,age/.45));
 g.fillStyle=rgba('#6ab84a',.2*a);gEll(x.x,x.y,R*sp);g.fill();g.fillStyle=rgba('#ff9ac8',.1*a);gEll(x.x,x.y,R*.62*sp);g.fill();
 g.strokeStyle=rgba('#ff9ac8',.7*a);g.lineWidth=2.5;g.setLineDash([4,7]);g.lineDashOffset=t*8;gEll(x.x,x.y,R*sp);g.stroke();g.setLineDash([]);
 const C=['#ff9ac8','#ffffff','#c080ff','#ffd36a','#ff6aa8'];
 for(let i=0;i<20;i++){const gr=clamp((age-i*.03)/.45,0,1);if(gr<=0)continue;const b=i*2.399,d=R*Math.sqrt((i+.5)/20)*.93,q=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,0),s=q.s,h=(13+(i%3)*5)*s*gr*a,sw=Math.sin(t*2+i)*2.5*s;
  g.strokeStyle='#3e7a24';g.lineWidth=2*s;g.beginPath();g.moveTo(q.x,q.y);g.quadraticCurveTo(q.x+sw*.5,q.y-h*.5,q.x+sw,q.y-h);g.stroke();
  if(i%2){g.fillStyle='#5aa83a';g.beginPath();g.ellipse(q.x+sw*.3+4*s,q.y-h*.35,4.5*s*gr,1.8*s*gr,-.5,0,7);g.fill()}
  yaFlw(q.x+sw,q.y-h,(1.35+.3*(i%3))*s*gr,i+t*.4,C[i%5],i%5===3?'#ff6aa8':'#ffe08a')}
 for(let i=0;i<7;i++){const ph=(t*.7+i/7)%1,b=i*1.9,q=P(x.x+Math.cos(b)*R*.55,x.y+Math.sin(b)*R*.45,10+ph*55);g.fillStyle=rgba(i%2?'#ff9ac8':'#9fe07f',.85*a*(1-ph));g.fillRect(q.x-1.2,q.y-5*q.s,2.4,10*q.s);g.fillRect(q.x-5*q.s,q.y-1.2,10*q.s,2.4)}};
// ---------- états visibles : marque de l'esprit, sommeil ----------
STATD.push((u,p,S,sk)=>{const t=performance.now()/1000;
 if(u.ya_mk>0){const B=u.ya_mkB!=null?units[u.ya_mkB]:null;if(B&&!B.dead){const b=t*2.2,cx=p.x+Math.cos(b)*19*S*sk,cy=p.y-54*S*sk+Math.sin(b)*5*S;g.save();g.globalAlpha=Math.min(1,u.ya_mk*2.5);g.globalCompositeOperation='lighter';circ(cx,cy,6.5*S,'rgba(192,128,255,.3)');g.globalCompositeOperation='source-over';yaFlw(cx,cy,S*1.05,t*3,'#d8a8ff','#ffffff');g.restore()}}
 if(u.ya_sl>0){const r=(3.5+Math.sin(t*3)*2.2)*S,bx=p.x+11*S*sk,by=p.y-46*S*sk;g.save();g.strokeStyle='rgba(220,235,255,.85)';g.fillStyle='rgba(200,225,255,.3)';g.lineWidth=1;g.beginPath();g.arc(bx,by,r,0,7);g.fill();g.stroke();
  text('z',p.x+18*S,p.y-66*S-((t*16)%10),10,'#ffd8e8');text('Z',p.x+25*S,p.y-78*S-((t*16+5)%10),13,'#ffd8e8');g.restore()}});
// ---------- effets ----------
// marque posée : une fleur mentale éclot au-dessus de la tête
JFXD.ya_mkon=(f,k,e,t,u,tg)=>{if(!tg)return;const q=P(tg.x,tg.y,74),s=q.s*(1+bump(e)*.7);g.globalCompositeOperation='lighter';circ(q.x,q.y,12*s*e,rgba('#c080ff',.45*k));g.globalCompositeOperation='source-over';g.globalAlpha=k;yaFlw(q.x,q.y,1.4*s,e*3,'#d8a8ff','#ffffff')};
// marque éclatée : anneau mental et pétales
JFXD.ya_pop=(f,k,e,t,u,tg)=>{const q=P(tg?tg.x:f.x,tg?tg.y:f.y,60),s=q.s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#d8a8ff',.9*k);g.lineWidth=3*k+1;g.beginPath();g.ellipse(q.x,q.y,(8+e*36)*s,(5+e*21)*s,0,0,7);g.stroke();
 g.globalCompositeOperation='source-over';for(let i=0;i<10;i++){const b=i*.628+.3,r=(6+ezo(e)*38)*s;yaPet(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r*.7+e*e*16*s,s*(1.1-e*.4),b+e*6,rgba(YAP[i%3],k))}};
// kunai : éventail de pétales qui jaillit de la main
JFXD.ya_petfan=(f,k,e,t,u)=>{if(!u)return;for(let i=0;i<8;i++){const b=f.a+(i-3.5)*.16,d=22+ezo(e)*(40+(i*13)%30),q=P(u.x+Math.cos(b)*d,u.y+Math.sin(b)*d,36-e*14+Math.sin(i)*5);yaPet(q.x,q.y,q.s*(1-e*.3),b+e*7+i,rgba(YAP[i%3],k))}};
// impact du kunai (ou projectile haché) : gerbe de pétales
JFXD.ya_burst=(f,k,e,t)=>{const q=P(f.x,f.y,30),s=q.s*(f.s||1);g.globalCompositeOperation='lighter';circ(q.x,q.y,(6+e*18)*s,rgba('#ff9ac8',.35*k));g.globalCompositeOperation='source-over';
 for(let i=0;i<10;i++){const b=f.a+(i-4.5)*.42,r=ezo(e)*(26+(i*7)%18)*s;yaPet(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r*.6-Math.sin(Math.PI*e)*10*s+e*e*14*s,s,b*2+e*8,rgba(YAP[i%4],k))}};
// kunai planté qui fleurit là où il retombe
JFXD.ya_plant=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,gr=ezo(Math.min(1,e*3.5)),c=Math.cos(f.a),sn=Math.sin(f.a)*K;g.globalAlpha=Math.min(1,k*3);
 g.strokeStyle='#3a3a44';g.lineWidth=2.2*s;g.beginPath();g.moveTo(q.x,q.y-2*s);g.lineTo(q.x-c*9*s,q.y-10*s-sn*9*s);g.stroke();g.lineWidth=1.2*s;g.beginPath();g.arc(q.x-c*11*s,q.y-12*s-sn*11*s,2.4*s,0,7);g.stroke();
 for(let i=0;i<5;i++){const b=i*1.257+f.a,r=6*s*gr;yaPet(q.x+Math.cos(b)*r*.75,q.y-2*s+Math.sin(b)*r*.45,s*gr*1.15,b,YAP[i%2])}circ(q.x,q.y-2*s,2*s*gr,'#ffe08a')};
// Transposition : silhouette d'esprit laissée au départ
JFXD.ya_ghost=(f,k,e,t)=>{const q=P(f.x,f.y,e*26),s=q.s;g.globalAlpha=k;
 g.fillStyle='rgba(176,112,240,.42)';g.strokeStyle='rgba(240,224,255,.85)';g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y-30*s,11*s,18*s,0,0,7);g.fill();g.stroke();g.beginPath();g.arc(q.x,q.y-60*s,13*s,0,7);g.fill();g.stroke();
 g.strokeStyle='#4a2070';g.lineWidth=1.3*s;for(const sx of[-1,1]){g.beginPath();g.arc(q.x+sx*4.5*s,q.y-59*s,2.3*s,.25,Math.PI-.25);g.stroke()}
 for(let i=0;i<6;i++){const b=i*1.05+t*3;yaPet(q.x+Math.cos(b)*18*s,q.y-40*s+Math.sin(b)*8*s-e*20*s,s,b,rgba(YAP[i%3],k))}};
// trait de l'esprit entre départ et arrivée
JFXD.ya_streak=(f,k,e,t)=>{const a=P(f.x,f.y,40),b=P(f.x2,f.y2,40),m=Math.min(1,e*5),ex=a.x+(b.x-a.x)*m,ey=a.y+(b.y-a.y)*m;g.globalCompositeOperation='lighter';g.lineCap='round';
 g.strokeStyle=rgba('#c080ff',.55*k);g.lineWidth=14*k*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(ex,ey);g.stroke();g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=3*k*a.s;g.stroke();
 g.globalCompositeOperation='source-over';for(let i=0;i<7;i++){const w=i/6;yaPet(lerp(a.x,ex,w),lerp(a.y,ey,w)+Math.sin(i*2.1+t*6)*8*a.s-e*16*a.s,a.s,i+t*5,rgba(YAP[i%3],k))}};
JFXD.ya_arrive=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s;g.strokeStyle=rgba('#d8a8ff',.8*k);g.lineWidth=3*k+1;g.beginPath();g.ellipse(q.x,q.y,(12+e*40)*s,(12+e*40)*s*K,0,0,7);g.stroke();
 for(let i=0;i<8;i++){const b=i*.785,r=(10+e*34)*s;yaPet(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r*K-Math.sin(Math.PI*e)*26*s,s,b+e*5,rgba(YAP[i%3],k))}};
// échange avec un allié : deux arcs d'esprit qui se croisent
JFXD.ya_swapfx=(f,k,e,t)=>{const a=P(f.x,f.y,40),b=P(f.x2,f.y2,40);g.globalCompositeOperation='lighter';g.lineCap='round';
 for(const sg of[-1,1]){const cx=(a.x+b.x)/2+(b.y-a.y)*.25*sg,cy=(a.y+b.y)/2-(b.x-a.x)*.25*sg;g.strokeStyle=rgba(sg>0?'#c080ff':'#ff9ac8',.75*k);g.lineWidth=5*k*a.s+1;g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo(cx,cy,b.x,b.y);g.stroke()}
 for(const p of[a,b])circ(p.x,p.y,(10+e*26)*p.s,rgba('#d8a8ff',.3*k))};
// sceau de l'esprit devant les mains (Shinranshin, Shintenshin)
JFXD.ya_sigil=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x+Math.cos(f.a)*26,u.y+Math.sin(f.a)*26,f.big?56:48),R=(f.big?15:11)*q.s*(1+ezo(e)*.5);g.globalCompositeOperation='lighter';circ(q.x,q.y,R*1.5,rgba('#c080ff',.25*k));g.globalCompositeOperation='source-over';yaEye(q.x,q.y,R,0,k);
 g.strokeStyle=rgba('#e8d0ff',.7*k);g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y,R*(1.3+e),R*(1.3+e),0,0,7);g.stroke()};
// ondes mentales (impact de Shinranshin, possession)
JFXD.ya_ripple=(f,k,e,t)=>{const q=P(f.x,f.y,44),s=q.s*(f.s||1);g.globalCompositeOperation='lighter';
 for(let i=0;i<3;i++){const w=e*1.4-i*.2;if(w<=0)continue;g.strokeStyle=rgba(i%2?'#ff9ac8':'#d8a8ff',.85*k);g.lineWidth=(3-i*.6)*s+.5;g.beginPath();g.ellipse(q.x,q.y,(8+w*44)*s,(6+w*30)*s,0,0,7);g.stroke()}
 g.translate(q.x,q.y);g.rotate(t*8);g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=1.8*s;g.beginPath();for(let i=0;i<14;i++){const b=i*.62,r=i*1.1*s*(1+e);i?g.lineTo(Math.cos(b)*r,Math.sin(b)*r):g.moveTo(0,0)}g.stroke()};
// confusion : spirales et pétales qui tournent autour de la tête
JFXD.ya_daze=(f,k,e,t,u,tg)=>{if(!tg||tg.dead||!(tg.ya_cf>0))return;const q=P(tg.x,tg.y,84),s=q.s,a=Math.min(1,tg.ya_cf*4,e*40);g.globalCompositeOperation='lighter';g.lineWidth=2*s;
 for(let j=0;j<2;j++){const cx=q.x+(j?13:-13)*s,cy=q.y+Math.sin(t*5+j*2)*2*s,rot=t*(j?-7:7);g.strokeStyle=rgba(j?'#ff9ac8':'#d8a8ff',.95*a);g.beginPath();for(let i=0;i<12;i++){const b=rot+i*.62,r=i*.75*s;i?g.lineTo(cx+Math.cos(b)*r,cy+Math.sin(b)*r*.75):g.moveTo(cx,cy)}g.stroke()}
 g.globalCompositeOperation='source-over';for(let i=0;i<3;i++){const b=t*3.5+i*2.09;yaPet(q.x+Math.cos(b)*24*s,q.y+10*s+Math.sin(b)*7*s,s,b*2,rgba(YAP[i%3],a))}};
// possession : flammes mentales, sceau au-dessus de la tête, fil jusqu'au corps du lanceur, flèche de direction
JFXD.ya_possfx=(f,k,e,t,u,tg)=>{if(!tg||tg.dead||!(tg.ya_pz>0))return;const q=P(tg.x,tg.y,0),s=q.s,a=Math.min(1,tg.ya_pz*4,e*8);g.globalCompositeOperation='lighter';
 for(let i=0;i<8;i++){const b=i*.8+t*2.4,xx=q.x+Math.cos(b)*15*s,yy=q.y-6*s-((t*62+i*17)%64)*s,h=(12+(i%3)*4)*s;g.fillStyle=rgba(i%2?'#c080ff':'#e8d0ff',.42*a);g.beginPath();g.moveTo(xx-5*s,yy);g.quadraticCurveTo(xx,yy-h*1.6,xx+5*s,yy);g.fill()}
 circ(q.x,q.y-40*s,26*s,rgba('#8a4ae0',.16*a));
 if(u&&!u.dead){const A=P(u.x,u.y,60),Bq=P(tg.x,tg.y,62);g.strokeStyle=rgba('#d8a8ff',.65*a);g.lineWidth=2;g.setLineDash([5,5]);g.lineDashOffset=-t*40;g.beginPath();g.moveTo(A.x,A.y);g.quadraticCurveTo((A.x+Bq.x)/2,Math.min(A.y,Bq.y)-40*s,Bq.x,Bq.y);g.stroke();g.setLineDash([])}
 g.globalCompositeOperation='source-over';const hq=P(tg.x,tg.y,116);yaEye(hq.x,hq.y+Math.sin(t*4)*2,8*s,0,a);
 const pa=tg.ya_pa;if(pa!=null){const c=P(tg.x+Math.cos(pa)*30,tg.y+Math.sin(pa)*30,1),d=P(tg.x+Math.cos(pa)*52,tg.y+Math.sin(pa)*52,1),ar=Math.atan2(d.y-c.y,d.x-c.x);g.fillStyle=rgba('#e8d0ff',.8*a);g.beginPath();g.moveTo(d.x,d.y);g.lineTo(c.x+Math.cos(ar+1.9)*8*s,c.y+Math.sin(ar+1.9)*8*s);g.lineTo(c.x+Math.cos(ar-1.9)*8*s,c.y+Math.sin(ar-1.9)*8*s);g.closePath();g.fill()}};
// la cible possédée se frappe elle-même
JFXD.ya_slap=(f,k,e,t,u,tg)=>{if(!tg)return;const q=P(tg.x,tg.y,56),s=q.s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.9*k);g.beginPath();for(let i=0;i<10;i++){const b=i*.628,L=(i%2?5:14)*s*(1+e*.5);g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L)}g.closePath();g.fill();circ(q.x,q.y,9*s*(1+e),rgba('#c080ff',.4*k))};
// l'esprit regagne son corps
JFXD.ya_back=(f,k,e,t,u)=>{if(!u)return;const m=ezio(Math.min(1,e*1.15)),a=P(f.x,f.y,50),b=P(u.x,u.y,58);g.globalCompositeOperation='lighter';
 for(let i=4;i>=0;i--){const w=Math.max(0,m-i*.06);circ(lerp(a.x,b.x,w),lerp(a.y,b.y,w)-Math.sin(Math.PI*w)*30*a.s,(9-i*1.4)*a.s,rgba('#c080ff',.3*k))}circ(lerp(a.x,b.x,m),lerp(a.y,b.y,m)-Math.sin(Math.PI*m)*30*a.s,5*a.s,rgba('#ffffff',.9*k))};
// bouquet lancé en cloche
JFXD.ya_bouquet=(f,k,e,t)=>{const x=lerp(f.x,f.x2,e),y=lerp(f.y,f.y2,e),q=P(x,y,30+Math.sin(Math.PI*e)*90),s=q.s,r=e*9;g.fillStyle='rgba(0,0,0,.25)';gEll(x,y,8);g.fill();
 g.strokeStyle='#4a8a2a';g.lineWidth=2*s;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(q.x,q.y+2*s);g.lineTo(q.x+Math.cos(r+1.57+i*.35)*12*s,q.y+Math.sin(r+1.57+i*.35)*12*s);g.stroke()}
 for(let i=0;i<3;i++){const b=r+i*2.09;yaFlw(q.x+Math.cos(b)*5*s,q.y+Math.sin(b)*5*s,1.1*s,b,YAP[i===2?2:i],'#ffe08a')}g.fillStyle='#ff6aa8';g.fillRect(q.x-3*s,q.y-1*s,6*s,3*s)};
// éclosion (nuage de pollen, champ de fleurs)
JFXD.ya_bloom=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,R=f.r;g.strokeStyle=rgba(f.g?'#ff9ac8':'#ffe08a',.8*k);g.lineWidth=4*k+1;g.beginPath();g.ellipse(q.x,q.y,R*ezo(e)*s,R*ezo(e)*s*K,0,0,7);g.stroke();
 for(let i=0;i<14;i++){const b=i*.449,r=R*ezo(e)*(.5+(i%3)*.22)*s,h=Math.sin(Math.PI*e)*(30+(i%4)*8)*s;yaPet(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r*K-h,s*1.1,b+e*6,rgba(f.g?YAP[i%3]:(i%2?'#ffe08a':'#ffd8e8'),k))}};
// tempête de pétales : flot de pétales dans le cône, une lame claire par vague
JFXD.ya_storm=(f,k,e,t,u)=>{const X=u?u.x:f.x,Y=u?u.y:f.y,R=f.r,A=f.a,fa=Math.min(1,k*2.5);
 // voile rose du cône
 {const pts=[P(X,Y,0)];for(let j=0;j<=8;j++){const b=A-.58+j*.145,dd=R*Math.min(1,e*3);pts.push(P(X+Math.cos(b)*dd,Y+Math.sin(b)*dd,0))}poly(pts,rgba('#ff9ac8',.13*fa))}
 for(let i=0;i<60;i++){const sp=((i*37)%60)/60*2-1,d=(e*1.6+i*.0213)%1;if(e<d*.45)continue;const dd=16+d*R,b=A+sp*.56+Math.sin(d*7+i)*.09,q=P(X+Math.cos(b)*dd,Y+Math.sin(b)*dd,14+Math.abs(Math.sin(i*1.7))*36+d*6);yaPet(q.x,q.y,q.s*(1.1+(i%3)*.25),t*9+i,rgba(YAP[i%4],fa*(1-d*.55)))}
 g.globalCompositeOperation='lighter';g.lineCap='round';for(let w=0;w<3;w++){const ew=(e-w*.2)/.35;if(ew<0||ew>1)continue;const dd=30+ezo(ew)*(R-30);
  for(const [c,lw] of[['#ff9ac8',9],['#ffffff',3]]){g.strokeStyle=rgba(c,.85*(1-ew));g.lineWidth=lw*(1-ew*.5);g.beginPath();for(let j=0;j<=10;j++){const b=A-.56+j*.112,q=P(X+Math.cos(b)*dd,Y+Math.sin(b)*dd,30);j?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke()}}};
// Esprit destructeur : lien mental et sceau qui se referme sur la cible
JFXD.ya_lock=(f,k,e,t,u,tg)=>{if(!u||!tg||tg.dead||!aux.some(q=>q.type==='ya_dest'&&q.ti===f.ti))return;const a=P(u.x,u.y,58),b=P(tg.x,tg.y,60),s=b.s;g.globalCompositeOperation='lighter';g.lineCap='round';
 const w=(3+Math.sin(t*30)*1.2+e*4)*s;g.strokeStyle='rgba(192,128,255,.55)';g.lineWidth=w*2.4;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=w*.6;g.stroke();
 for(let i=0;i<4;i++){const ph=(t*1.6+i/4)%1;circ(lerp(a.x,b.x,ph),lerp(a.y,b.y,ph),3.2*s,'rgba(255,216,232,.9)')}
 const R=(46-ezo(e)*24)*s;g.strokeStyle='rgba(232,208,255,.9)';g.lineWidth=2;g.beginPath();g.arc(b.x,b.y,R,-1.57,-1.57+6.283*e);g.stroke();
 g.globalCompositeOperation='source-over';for(let i=0;i<4;i++){const c=i*1.571+t*2+e*3;yaEye(b.x+Math.cos(c)*R,b.y+Math.sin(c)*R,5*s,c,.9)}yaEye(b.x,b.y-2*s,10*s*(.6+e*.6),0,.95)};
// Shinden : double fil d'esprit entre les deux têtes, perles qui circulent, sceaux aux deux bouts
JFXD.ya_shinden=(f,k,e,t,u,tg)=>{if(!u||!tg||u.dead||tg.dead||!aux.some(q=>q.type==='ya_lnk'&&q.ti===f.ti&&q.ui===f.ui))return;const a=P(u.x,u.y,60),b=P(tg.x,tg.y,60),s=b.s,dx=b.x-a.x,dy=b.y-a.y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,in_=Math.min(1,e*20);
 g.globalCompositeOperation='lighter';g.lineCap='round';
 for(const [c,ph] of[['#c080ff',0],['#ff9ac8',Math.PI]]){g.strokeStyle=rgba(c,.75*in_);g.lineWidth=2.4*s;g.beginPath();for(let i=0;i<=24;i++){const w=i/24,A=Math.sin(w*Math.PI)*10*s*Math.sin(w*14-t*7+ph),x=a.x+dx*w*in_+nx*A,y=a.y+dy*w*in_+ny*A;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke()}
 for(let i=0;i<3;i++){const w=(t*.8+i/3)%1;circ(a.x+dx*w,a.y+dy*w,2.6*s,'rgba(255,255,255,.85)')}
 circ(a.x,a.y,9*s,'rgba(192,128,255,.3)');circ(b.x,b.y,12*s,'rgba(255,154,200,.3)');g.globalCompositeOperation='source-over';yaEye(b.x,b.y-30*s,6*s,0,.9*in_)};
// Shinden : une part des dégâts subis file vers l'ennemi lié
JFXD.ya_pulse=(f,k,e,t,u,tg)=>{if(!u||!tg)return;const a=P(u.x,u.y,60),b=P(tg.x,tg.y,60),m=ezo(e),x=lerp(a.x,b.x,m),y=lerp(a.y,b.y,m),s=b.s;g.globalCompositeOperation='lighter';circ(x,y,7*s,rgba('#ff9ac8',.6*k));circ(x,y,3.5*s,rgba('#ffffff',.95*k));
 if(e>.7){const w=(e-.7)/.3;g.strokeStyle=rgba('#ff9ac8',.9*(1-w));g.lineWidth=2.5;g.beginPath();g.ellipse(b.x,b.y,(8+w*22)*s,(6+w*14)*s,0,0,7);g.stroke()}};
// lien brisé
JFXD.ya_snap=(f,k,e,t,u)=>{const b=P(f.x,f.y,60),a=u?P(u.x,u.y,58):b,s=b.s;g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#d8a8ff',.85*k);g.lineWidth=3*k+.5;
 for(const [p,o] of[[a,b],[b,a]]){const L=.3*(1-e);g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+(o.x-p.x)*L,p.y+(o.y-p.y)*L+e*20*s);g.stroke()}circ(b.x,b.y,(6+e*20)*s,rgba('#c080ff',.35*k))};
// l'esprit vole en éclats : cristal mental qui se brise
JFXD.ya_shatter=(f,k,e,t,u,tg)=>{const X=tg?tg.x:f.x,Y=tg?tg.y:f.y,q=P(X,Y,70),s=q.s,g0=P(X,Y,0);g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#d8a8ff',.85*k);g.lineWidth=5*k+1;g.beginPath();g.ellipse(g0.x,g0.y,(20+ezo(e)*110)*s,(20+ezo(e)*110)*s*K,0,0,7);g.stroke();
 g.fillStyle=rgba('#e8d0ff',.22*k);g.fillRect(q.x-16*s*k,q.y-170*s,32*s*k,g0.y-q.y+170*s);
 if(e<.2){const c=1-e/.2,R=(32+c*10)*s;g.fillStyle='rgba(232,208,255,.85)';g.beginPath();g.moveTo(q.x,q.y-R*1.3);g.lineTo(q.x+R,q.y);g.lineTo(q.x,q.y+R*1.3);g.lineTo(q.x-R,q.y);g.closePath();g.fill();g.strokeStyle='#ffffff';g.lineWidth=2;g.stroke();
  g.globalCompositeOperation='source-over';g.strokeStyle='#5a2a8a';g.lineWidth=1.5;g.beginPath();g.moveTo(q.x,q.y-R*1.3);g.lineTo(q.x-R*.2,q.y-R*.2);g.lineTo(q.x+R*.3,q.y+R*.3);g.lineTo(q.x,q.y+R*1.3);g.moveTo(q.x-R*.2,q.y-R*.2);g.lineTo(q.x-R,q.y);g.stroke();return}
 const w=(e-.2)/.8;g.globalCompositeOperation='source-over';for(let i=0;i<16;i++){const b=i*.393+.2,r=ezo(w)*(64+(i*17)%48)*s,x=q.x+Math.cos(b)*r,y=q.y+Math.sin(b)*r*.8+w*w*60*s,L=(13-(i%3)*3)*s,rot=b+w*(6+i);
  g.fillStyle=rgba(i%3?'#e8d0ff':'#ffffff',.9*k);g.beginPath();g.moveTo(x+Math.cos(rot)*L,y+Math.sin(rot)*L);g.lineTo(x+Math.cos(rot+2.4)*L*.6,y+Math.sin(rot+2.4)*L*.6);g.lineTo(x+Math.cos(rot-2.4)*L*.6,y+Math.sin(rot-2.4)*L*.6);g.closePath();g.fill()}};
// réveil en sursaut
JFXD.ya_wake=(f,k,e,t,u,tg)=>{if(!tg)return;const q=P(tg.x+12,tg.y,70),s=q.s;g.strokeStyle=rgba('#dcebff',.9*k);g.lineWidth=1.5;for(let i=0;i<6;i++){const b=i*1.047,r=(4+e*14)*s;g.beginPath();g.moveTo(q.x+Math.cos(b)*r*.5,q.y+Math.sin(b)*r*.5);g.lineTo(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r);g.stroke()}text('!',q.x,q.y-14*s-e*8,16,rgba('#ffd8e8',k))};
// ---------- animations 3D ----------
Object.assign(ANIM,{
 // lancer de kunai d'une main : armé derrière la tête, fouetté, bras gauche en balancier
 ya_throw:(P,e)=>{const w=Math.min(1,e/.3),f=e<.3?0:ezo(Math.min(1,(e-.3)/.22));
  pz(P,'armR',-2.75*w+1.2*f,0,-.4*w+.35*f);pz(P,'foreR',-1.35*w+1.25*f);pz(P,'armL',-.9*w-.3*f,0,.45);pz(P,'foreL',-.6);
  pz(P,'chest',-.12*w+.38*f,.45*w-.85*f);pz(P,'head',.05,-.2*w+.25*f);P.root.z=-2*w+8*f;pz(P,'thighL',-.5*f);pz(P,'shinL',.35*f);pz(P,'thighR',.3*f);pz(P,'shinR',.45*f)},
 // Transposition : mains jointes, puis élan
 ya_blink:(P,e)=>{if(e<.5){const k=Math.min(1,e/.25);pz(P,'armL',-1.25*k,0,-.6*k);pz(P,'armR',-1.25*k,0,.6*k);pz(P,'foreL',-1.9*k);pz(P,'foreR',-1.9*k);pz(P,'head',.2*k);P.root.y=-2*k}
  else{const f=ezo((e-.5)/.5);pz(P,'armL',.6*f,0,.5);pz(P,'armR',.6*f,0,-.5);pz(P,'chest',.4*f);P.root.z=6*f}},
 // Shinranshin : une main à la tempe, l'autre projette l'onde
 ya_wave:(P,e)=>{const k=ezo(Math.min(1,e/.25));pz(P,'armL',-2.5*k,0,.5*k);pz(P,'foreL',-2.4*k);pz(P,'armR',-1.6*k,0,.12);pz(P,'foreR',-.05);pz(P,'chest',.15*k,.25*k);pz(P,'head',.1*k,-.15*k);P.root.z=4*k;pz(P,'thighR',-.45*k);pz(P,'shinR',.4*k)},
 // signe du Shintenshin : les deux mains forment une fenêtre devant le visage
 ya_sign:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.15)),tr=Math.sin(t*38)*.025*k;pz(P,'armL',-1.68*k+tr,0,-.3*k);pz(P,'armR',-1.68*k-tr,0,.3*k);pz(P,'foreL',-.28*k);pz(P,'foreR',-.28*k);pz(P,'chest',.12*k);pz(P,'head',.06*k);P.root.y=-2.5*k;pz(P,'thighL',-.35*k,0,.15*k);pz(P,'shinL',.6*k);pz(P,'thighR',.25*k,0,-.15*k);pz(P,'shinR',.5*k)},
 // corps abandonné : affaissé, tête tombante, bras ballants
 ya_limp:(P,e,u,t)=>{const k=ezo(Math.min(1,e*5));P.root.y=-7*k;pz(P,'chest',.6*k,0,Math.sin(t*1.6)*.05);pz(P,'head',.75*k,.15*k);pz(P,'armL',.2*k,0,.1);pz(P,'armR',.2*k,0,-.1);pz(P,'foreL',-.15);pz(P,'foreR',-.15);pz(P,'thighL',-.45*k);pz(P,'shinL',.95*k);pz(P,'thighR',-.3*k);pz(P,'shinR',.85*k)},
 // possédé : pantin aux fils invisibles qui marche raide et se frappe
 ya_puppet:(P,e,u,t)=>{const w=t*8,sl=bump((e*3)%1);pz(P,'thighL',-Math.sin(w)*.45);pz(P,'thighR',Math.sin(w)*.45);pz(P,'shinL',.2+Math.max(0,Math.sin(w-1))*.7);pz(P,'shinR',.2+Math.max(0,-Math.sin(w-1))*.7);
  pz(P,'armL',-1.1,0,.85);pz(P,'foreL',-.9+Math.sin(t*5)*.2);pz(P,'armR',-1.1-1.3*sl,0,-.85+1.3*sl);pz(P,'foreR',-.9-1.3*sl);pz(P,'head',.25+.25*sl,0,.35-.5*sl);pz(P,'chest',.1,0,Math.sin(t*3)*.08);P.root.y=Math.abs(Math.sin(w))*1.5},
 // confus : titube, bras qui battent l'air, tête qui tourne
 ya_dizzy:(P,e,u,t)=>{const w=t*7;pz(P,'thighL',-Math.sin(w)*.5);pz(P,'thighR',Math.sin(w)*.5);pz(P,'shinL',.3+Math.max(0,Math.sin(w-1))*.8);pz(P,'shinR',.3+Math.max(0,-Math.sin(w-1))*.8);
  if(!u.swing&&!u.cast&&!(u.relT>0)&&!(u.thrT>0)){pz(P,'armL',-1+Math.sin(t*7)*.6,0,.9+Math.cos(t*5)*.3);pz(P,'armR',-1.2+Math.cos(t*6)*.6,0,-.9-Math.sin(t*5)*.3);pz(P,'foreL',-.4);pz(P,'foreR',-.4)}
  pz(P,'head',.2+Math.sin(t*4)*.15,Math.sin(t*3)*.3,Math.sin(t*5)*.35);pz(P,'chest',.1,Math.sin(t*3)*.25,Math.sin(t*4)*.1);P.rootR.z=Math.sin(t*4)*.1},
 // bouquet lancé par en dessous
 ya_toss:(P,e)=>{const b=e<.4,k=b?ezo(e/.4):ezo(Math.min(1,(e-.4)/.3));if(b){pz(P,'armR',.9*k,0,-.15);pz(P,'foreR',-.3);pz(P,'chest',.25*k);P.root.y=-2*k}else{pz(P,'armR',.9-3.1*k,0,-.15);pz(P,'foreR',-.3+.2*k);pz(P,'chest',.25-.4*k);P.root.y=-2+3*k}pz(P,'armL',-.6,0,.4);pz(P,'foreL',-.5)},
 // tempête de pétales : pirouette bras ouverts, puis les deux mains projettent la tempête
 ya_storm:(P,e)=>{if(e<.45){const k=e/.45;P.rootR.y=Math.PI*2*ezio(k);pz(P,'armL',-.7,0,1.25);pz(P,'armR',-.7,0,-1.25);pz(P,'foreL',-.15);pz(P,'foreR',-.15);P.root.y=1.5*bump(k);pz(P,'thighL',-.3*bump(k));pz(P,'shinL',.6*bump(k))}
  else{const k=ezo(Math.min(1,(e-.45)/.2));P.rootR.y=1e-6; // tour complet terminé : on repart de 0 sans dérouler la pirouette
   pz(P,'armL',-1.55*k-.7*(1-k),0,-.15*k+1.25*(1-k));pz(P,'armR',-1.55*k-.7*(1-k),0,.15*k-1.25*(1-k));pz(P,'foreL',-.05);pz(P,'foreR',-.05);pz(P,'chest',.3*k);P.root.z=7*k;pz(P,'thighR',-.7*k);pz(P,'shinR',.6*k);pz(P,'thighL',.35*k)}},
 // champ de fleurs : paumes au sol, puis se relève bras ouverts
 ya_bloom:(P,e)=>{if(e<.5){const k=ezo(Math.min(1,e/.25));P.root.y=-10*k;pz(P,'thighL',-1.2*k);pz(P,'shinL',2*k);pz(P,'thighR',.3*k);pz(P,'shinR',1.8*k);pz(P,'chest',.85*k);pz(P,'armL',-.95*k,0,.25);pz(P,'armR',-.95*k,0,-.25);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'head',.15*k)}
  else{const k=ezo(Math.min(1,(e-.5)/.3));P.root.y=-10+10*k;pz(P,'thighL',-1.2*(1-k));pz(P,'shinL',2*(1-k));pz(P,'thighR',.3*(1-k));pz(P,'shinR',1.8*(1-k));pz(P,'chest',.85-1.05*k);pz(P,'armL',-.95-1.5*k,0,.25+.55*k);pz(P,'armR',-.95-1.5*k,0,-.25-.55*k);pz(P,'head',.15-.4*k)}},
 // Shinden : une main à la tempe, l'autre tendue vers l'ennemi à lier
 ya_shinden:(P,e)=>{const k=ezo(Math.min(1,e/.2));pz(P,'armL',-2.5*k,0,.5*k);pz(P,'foreL',-2.35*k);pz(P,'armR',-1.62*k,0,.06);pz(P,'foreR',0);pz(P,'chest',.1*k,-.3*k);pz(P,'head',.08*k,.2*k);P.root.z=3*k;pz(P,'thighR',-.4*k);pz(P,'shinR',.35*k)},
 // Esprit destructeur : mains aux tempes, concentration, puis poussée des deux paumes
 ya_focus:(P,e,u,t)=>{if(e<.84){const k=ezo(Math.min(1,e/.2)),tr=Math.sin(t*45)*.03*k;pz(P,'armL',-2.55*k,0,.4*k);pz(P,'armR',-2.55*k,0,-.4*k);pz(P,'foreL',-2.35*k);pz(P,'foreR',-2.35*k);pz(P,'head',.18*k+tr);pz(P,'chest',.1*k,0,tr);P.root.y=-2*k}
  else{const k=ezo(Math.min(1,(e-.84)/.1));pz(P,'armL',-2.55+.95*k,0,.4-.6*k);pz(P,'armR',-2.55+.95*k,0,-.4+.6*k);pz(P,'foreL',-2.35+2.3*k);pz(P,'foreR',-2.35+2.3*k);pz(P,'chest',.1+.3*k);P.root.z=7*k;pz(P,'thighR',-.6*k);pz(P,'shinR',.6*k)}},
});

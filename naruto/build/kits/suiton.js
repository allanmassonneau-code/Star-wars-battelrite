// ===== Suiton (eau) =====
// Identité : contrôle du terrain (dômes, prison, brume, inondations), requins de Kisame, dragons et cascades.
// Chaque coup d'eau trempe la cible (foudre ×1,35, feu ×0,75 et vapeur) ; le requin Suikôdan traque les cibles trempées.
// [emplacement, rang, mécanique (x.clé = NAT[clé]), nom, description, élément visuel]
const su_rows=[
 [1,'D','x.su_ball','Suiton : Teppôdama','Balle d\'eau qui grossit en vol (plus de dégâts au loin) et éclate en éclaboussure qui ralentit','water'],
 [1,'D','x.su_wall','Suiton : Suijinheki','Dôme d\'eau 1,5 s qui arrête les tirs et repousse ; relance : le mur déferle en vague devant toi','water'],
 [1,'C','x.su_jet','Suiton : Mizurappa','Torrent d\'eau 1,3 s, immobile : repousse en continu et interrompt ; vise pour le diriger','water'],
 [1,'C','x.su_shark','Suiton : Suikôdan','Requin d\'eau qui vire vers l\'ennemi devant lui ; il traque sans relâche une cible trempée','water'],
 [1,'B','x.su_prison','Suiton : Suirô','Emprisonne et noie la cible tant que tu restes immobile (1,8 s ; cède si on te frappe) ; relance : la projette (obstacle : étourdie)','water'],
 [1,'B','x.su_mist','Suiton : Kirigakure','Brume 6 s : ennemis ralentis, trempés, aveuglés ; ton équipe y est invisible sans attaquer 0,8 s ; le vent la chasse','water'],
 [1,'A','x.su_dragon','Suiton : Dragon aqueux','Dragon d\'eau en ligne qui emporte les ennemis touchés puis les ralentit ; s\'il percute un obstacle : étourdis','water'],
 [1,'A','x.su_fall','Suiton : Daibakufu','Cascade après 0,65 s (plus forte au centre) qui étourdit, puis un tourbillon 3,5 s ralentit et aspire vers le centre','water'],
 [2,'C','x.su_liquid','Suiton : Corps liquide','Se liquéfie et file au sol : intouchable, libéré des entraves et ralentissements ; éclabousse à l\'arrivée','water'],
 [5,'S','x.su_big','Suiton : Daikôdan','Requin géant qui avale les tirs ennemis (il grossit à chaque bouchée) puis explose : étourdit, repousse et inonde','water'],
 [5,'S','x.su_dome','Suiton : Dôme des requins','Dôme d\'eau 4,5 s : les ennemis piégés ne peuvent sortir, perdent du chakra et se font mordre ; tu y nages vite','water'],
 [5,'S','x.su_tsunami','Suiton : Bakusui Shôha','Raz-de-marée qui emporte les ennemis (étourdis contre un obstacle) ; la mer reste 5 s : eux ralentis, vous rapides','water'],
];
KIT('n1',su_rows);
const su_d=k=>(su_rows.find(r=>r[2]==='x.'+k)||[])[4]||''; // description = celle du catalogue
Object.assign(NAT,{
 // Teppôdama : la balle grossit en vol ; elle éclate à l'impact ou au bout de sa course
 su_ball:SP('Suiton : Teppôdama',su_d('su_ball'),4,{ai:RG(520,.7)},(u,a)=>{S('water',u);anim(u,'su_spit',.35);jx({jfx:'su_mouth',ui:su_i(u),x:u.x,y:u.y,a,t:.3,m:.3});
  proj(u,a,{spd:650,r:9,dmg:11,life:.82,col:'#3aa8ff',kind:'su_ball',slow:.8,onHit:(p,t)=>{p.su_t=t}});
  su_pilot(u,(x,p,dt,end)=>{const k=Math.min(1,1-p.life/p.life0);if(!end){if(p.su_d)p.su_m=(p.su_m||1)*p.dmg/p.su_d;p.r=9+7*k;p.dmg=p.su_d=(11+6*k)*(p.su_m||1);return}if(p.boom)return; // su_m garde les retouches du moteur (choc gagné…)
   const R=34+40*k,o=p.owner;for(const e of enemies(o))if(e!==p.su_t&&Math.hypot(e.x-p.x,e.y-p.y)<R+e.r)su_hit(e,o,4,{slow:.6,fx:p.x,fy:p.y}); // p.owner : un tir renvoyé éclabousse l'autre camp
   jx({jfx:'su_splash',x:p.x,y:p.y,r:R,t:.5,m:.5});if(near(p.x,p.y))S('water',o)})}),
 // Suijinheki : dôme fixe qui avale les tirs ennemis ; relance = le mur déferle en vague
 su_wall:SP('Suiton : Suijinheki',su_d('su_wall'),8,{ai:DEF},(u,a)=>{
  if(u.jst&&u.jst.key==='su_wall'){const x=aux.find(x=>x.type==='su_wall'&&x.owner===u&&x.t>0);
   if(x&&!u.ctrl&&!enemies(u).some(e=>dist(e,x)<300&&angDiff(ang(x,e),a)<.7)){u.cds[u.jst.i]=.25;return} // bot : garde le dôme tant que personne n'est devant
   u.jst=null;if(x){x.t=0;x.wave=1;su_wave(u,x,a)}return}
  S('water',u);anim(u,'su_wall',.55);const x={type:'su_wall',x:u.x,y:u.y,r:80,t:1.5,m:1.5,team:u.team,owner:u,vfx:'water',k:0};aux.push(x);
  jx({jfx:'su_wallF',x:u.x,y:u.y,r:80,t:1.5,m:1.5});for(const e of enemies(u))if(Math.hypot(e.x-u.x,e.y-u.y)<x.r+e.r+8)su_hit(e,u,6,{kb:280,fx:u.x,fy:u.y});su_arm(u,'su_wall',1.5)}),
 // Mizurappa : torrent canalisé qu'on dirige à la souris (rotation limitée)
 su_jet:SP('Suiton : Mizurappa',su_d('su_jet'),8,{ai:RG(270,.6),line:{len:300,w:84}},(u,a)=>{for(const x of aux)if(x.type==='su_jet'&&x.owner===u)x.t=0;
  aux.push({type:'su_jet',x:u.x,y:u.y,a,len:30,w:0,r:0,t:1.3,m:1.3,team:u.team,owner:u,vfx:'water',k:.05,ui:su_i(u),si:su_slot(u,'su_jet'),sp:0});anim(u,'su_spit',1.3);S('water',u)}),
 // Suikôdan : requin qui corrige sa course vers l'ennemi devant lui, et chasse sans relâche une cible trempée
 su_shark:SP('Suiton : Suikôdan',su_d('su_shark'),8,{ai:RG(560,.6)},(u,a)=>{S('water',u);anim(u,'su_shark',.45);jx({jfx:'su_ring',x:u.x+Math.cos(a)*30,y:u.y+Math.sin(a)*30,r:34,t:.4,m:.4});
  proj(u,a,{spd:520,r:12,dmg:16,life:1.3,col:'#3aa8ff',kind:'su_shark',o:{kb:150},onHit:(p,t)=>jx({jfx:'su_bite',x:t.x,y:t.y,t:.4,m:.4})});
  su_pilot(u,(x,p,dt,end)=>{if(!end)su_steer(p.owner,p,dt)})}), // p.owner : renvoyé, il chasse son ancien maître
 // Suirô : orbe ; la cible est enfermée tant que le lanceur la tient (immobile) ; relance = la projeter
 su_prison:SP('Suiton : Suirô',su_d('su_prison'),12,{ai:RG(380,.55),line:{len:385,w:26}},(u,a)=>{
  if(u.jst&&u.jst.key==='su_prison'){const x=aux.find(x=>x.type==='su_prison'&&x.owner===u&&x.t>0);
   if(x&&!u.ctrl&&x.m-x.t<1.2){u.cds[u.jst.i]=.25;return} // bot : la tient un moment avant de la lancer
   u.jst=null;if(x)su_throw(x,u.ctrl?a:su_botAim(u,x.tg));return}
  S('water',u);anim(u,'point',.35);proj(u,a,{spd:700,r:11,dmg:6,life:.55,col:'#3aa8ff',kind:'su_orb',onHit:(p,t)=>su_trap(p.owner,t)})}),
 // Kirigakure : brume (invisibilité au repos pour l'équipe, ennemis trempés et aveuglés) ; le vent la dissipe
 su_mist:SP('Suiton : Kirigakure',su_d('su_mist'),13,{ai:SELF(260,.45),tele:{self:1,r:245}},(u)=>{S('water',u);anim(u,'su_mist',.6);
  aux.push({type:'su_mist',x:u.x,y:u.y,r:245,t:6,m:6,team:u.team,owner:u,vfx:'water',k:0});jx({jfx:'su_mistF',x:u.x,y:u.y,r:245,t:6,m:6,team:u.team});
  u.stealth=Math.max(u.stealth,1.2);u.su_mA=0;sparks(u.x,u.y,'#e8eef6',14,'smoke')}),
 // Dragon aqueux (Suiryûdan) : jaillit du sol, transperce la ligne et emporte les ennemis touchés
 su_dragon:SP('Suiton : Dragon aqueux',su_d('su_dragon'),12,{line:{len:640,w:60},ai:RG(600,.55)},(u,a)=>{S('water',u);su_snd('roar',u);anim(u,'su_dragon',.6);
  jx({jfx:'su_rise',x:u.x+Math.cos(a)*36,y:u.y+Math.sin(a)*36,r:44,t:.6,m:.6});
  proj(u,a,{spd:800,r:20,dmg:28,life:.8,col:'#3aa8ff',pierce:1,big:1,kind:'su_dragon',slow:1.2,onHit:(p,t)=>{if(t.unstop<=0&&!t.dead)(p.su_car||(p.su_car=[])).push({e:t,t:.38})}});
  su_pilot(u,su_dragonStep)}),
 // Daibakufu : la cascade tombe (cible visible au sol, centre plus fort) puis le sol reste inondé
 su_fall:SP('Suiton : Daibakufu',su_d('su_fall'),12,{tele:{r:150,max:460},ai:RG(460,.6)},(u,a,td)=>{const p=atP(u,a,td,460);S('water',u);anim(u,'slam',.75);
  jx({jfx:'su_fall',x:p.x,y:p.y,r:150,d:.65,t:1.1,m:1.1});zone(u,p.x,p.y,150,24,.65,{stun:.4},'#3aa8ff');lastZ().deto='su_fallD';zone(u,p.x,p.y,58,12,.65,{},'#bfe6ff');lastZ().deto='su_none';
  later(u,.65,()=>aux.push({type:'su_whirl',x:p.x,y:p.y,r:155,t:3.5,m:3.5,team:u.team,owner:u,vfx:'water',k:.25}))}),
 // Corps liquide (Suika) : glisse intangible, se libère des entraves, éclabousse à l'arrivée
 su_liquid:SP('Suiton : Corps liquide',su_d('su_liquid'),7,{ai:ESC},(u,a)=>{S('water',u);u.root=0;u.slow=0;u.rootV=null;anim(u,'su_melt',.42);jx({jfx:'su_splash',x:u.x,y:u.y,r:40,t:.45,m:.45});
  aux.push({type:'su_liq',x:u.x,y:u.y,a,r:22,t:.4,m:.4,team:u.team,owner:u,vfx:'water',k:0});jx({jfx:'su_body',ui:su_i(u),x:u.x,y:u.y,t:.42,m:.42});u.phase=Math.max(u.phase||0,.4);
  dash(u,a,250,.32,{end:()=>{jx({jfx:'su_splash',x:u.x,y:u.y,r:70,t:.5,m:.5});for(const e of enemies(u))if(Math.hypot(e.x-u.x,e.y-u.y)<70+e.r)su_hit(e,u,3,{slow:.8,silent:1})}})}),
 // Daikôdan : requin géant qui mange les tirs ennemis (grossit, frappe plus fort) puis explose et inonde
 su_big:ULT('Suiton : Daikôdan',su_d('su_big'),{line:{len:740,w:70},ai:{max:620,p:.8}},(u,a)=>{S('water',u);su_snd('roar',u);anim(u,'throw2',.6);
  proj(u,a,{spd:470,r:24,dmg:44,life:1.6,col:'#3aa8ff',rocket:1,ar:150,kb:340,stun:.6,big:1,kind:'su_bigshark',noClash:1});
  su_pilot(u,(x,p,dt,end)=>{if(!end){su_eat(x,p);return}jx({jfx:'su_tidal',x:p.x,y:p.y,r:p.ar,t:.9,m:.9});aux.push({type:'su_flood',x:p.x,y:p.y,r:p.ar,t:3,m:3,team:x.team,owner:x.owner,vfx:'water',k:.25})})}),
 // Dôme des requins (Suirô Sameodori) : se referme en 0,15 s (le cercle des mudras prévient) ; les ennemis piégés ne sortent plus, les requins mordent
 su_dome:ULT('Suiton : Dôme des requins',su_d('su_dome'),{tele:{self:1,r:230},ai:SELF(190,.8)},(u)=>{S('water',u);su_snd('heavy',u);anim(u,'su_dome',.8);
  aux.push({type:'su_dome',x:u.x,y:u.y,r:230,t:4.65,m:4.65,team:u.team,owner:u,vfx:'water',k:0,bite:1});jx({jfx:'su_domeF',x:u.x,y:u.y,r:230,t:4.65,m:4.65})}),
 // Bakusui Shôha : une vague géante avance et emporte, puis la mer recouvre le passage
 su_tsunami:ULT('Suiton : Bakusui Shôha',su_d('su_tsunami'),{line:{len:600,w:260},ai:{max:420,p:.8}},(u,a)=>{S('water',u);su_snd('heavy',u);anim(u,'su_gush',1.1);
  aux.push({type:'su_tsu',x:u.x,y:u.y,a,len:20,w:280,r:0,t:1.6,m:1.6,team:u.team,owner:u,vfx:'water',k:0,ox:u.x,oy:u.y,hs:[],car:[],sp:0})}),
});
Object.assign(NATHERO,{su:'jyn'});
// ---------- aides ----------
function su_snd(k,u){const V=VFX;VFX=null;S(k,u);VFX=V} // son hors palette « eau » (rugissement, choc…)
function su_hit(e,u,d,o){const V=VFX;VFX='water';const r=hit(e,u,d,o||{});VFX=V;return r} // coup d'eau : trempe la cible
function su_i(u){return units.indexOf(u)}
function su_slot(u,k){return u.ch.abil.findIndex(x=>x&&x.key===k)}
// relance : le jutsu se relance sans mudras ni chakra (une orbe tourne autour du lanceur)
function su_arm(u,k,t){const i=su_slot(u,k);if(i<0||(u.jst&&u.jst.key!==k))return null;u.jst={key:k,i,n:1,t,cd:u.ch.abil[i].cd,v:'water'};u.cds[i]=.25;return u.jst}
function su_disarm(u,k){if(u&&u.jst&&u.jst.key===k){u.cds[u.jst.i]=u.jst.cd;u.jst=null}}
// pilote : f(x,p,dt,fin) à chaque image tant que le projectile vit, puis une fois à sa disparition
function su_pilot(u,f){const p=projs[projs.length-1];aux.push({type:'su_pc',x:p.x,y:p.y,r:0,t:p.life+1,m:p.life+1,team:u.team,owner:u,p,f});return p}
AUXF.su_pc=(x,dt)=>{const p=x.p;if(!p||x.done){x.t=0;return}x.x=p.x;x.y=p.y;if(p.dead||!projs.includes(p)){x.done=1;x.t=0;x.f(x,p,dt,1)}else{x.t=Math.max(x.t,.5);x.f(x,p,dt,0)}}; // reste en vie tant que le projectile vole (même ralenti)
AUXD.su_pc=()=>{};
const su_auxAt=(ty,f)=>aux.find(a=>a.type===ty&&Math.abs(a.x-f.x)<2&&Math.abs(a.y-f.y)<2);
// passe « avant » (dessinée par-dessus les ninjas) d'un objet durable : jx n'est créé que près d'une caméra ;
// si l'objet est né hors champ, on la recrée dès que quelqu'un s'en approche (elle suit la durée de l'objet)
function su_keepF(x,jf,dt,o){if((x.fk=(x.fk||0)-dt)>0)return;x.fk=.4;if(x.t<.3||!near(x.x,x.y)||fx.some(f=>f.jfx===jf&&Math.abs(f.x-x.x)<2&&Math.abs(f.y-x.y)<2))return;
 jx(Object.assign({jfx:jf,x:x.x,y:x.y,r:x.r,t:x.t,m:x.t},o||{}))}
const su_wrap=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
// ---------- mécaniques ----------
// Suikôdan : vire (2,2 rad/s) vers un ennemi devant lui ; une cible trempée est traquée partout (3,6 rad/s), l'œil du requin s'allume
function su_steer(o,p,dt){const h=Math.atan2(p.vy,p.vx);let tg=null,bd=1e9,wet=0;
 for(const e of enemies(o)){const d=Math.hypot(e.x-p.x,e.y-p.y);if(e.stealth>0&&d>140)continue;
  if(e.wet>0&&d<480){if(!wet||d<bd){tg=e;bd=d;wet=1}}else if(!wet&&d<320&&d<bd&&angDiff(Math.atan2(e.y-p.y,e.x-p.x),h)<.8){tg=e;bd=d}}
 p.col=wet?'#7fd8ff':'#3aa8ff';if(!tg)return;const tr=wet?3.6:2.2,na=h+clamp(su_wrap(Math.atan2(tg.y-p.y,tg.x-p.x)-h),-tr*dt,tr*dt),sp=Math.hypot(p.vx,p.vy);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp}
// Suijinheki : la vague (cône devant le dôme)
function su_wave(u,x,a){const L=260,A=1.45;S('water',u);anim(u,'palm',.4);
 for(const e of enemies(u)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<L+e.r&&angDiff(Math.atan2(e.y-x.y,e.x-x.x),a)<A/2)su_hit(e,u,14,{kb:360,fx:x.x,fy:x.y})}
 jx({jfx:'su_wave',x:x.x,y:x.y,a,r:L,w:A,t:.55,m:.55});if(near(x.x,x.y))shake=Math.max(shake,.12)}
AUXF.su_wall=(x,dt)=>{const o=x.owner;if(x.t<=0){su_disarm(o,'su_wall');if(!x.wave)jx({jfx:'su_splash',x:x.x,y:x.y,r:x.r,t:.5,m:.5});return}su_keepF(x,'su_wallF',dt);
 for(const p of projs){if(p.dead||p.owner.team===x.team)continue;const d=Math.hypot(p.x-x.x,p.y-x.y);if(d>x.r+p.r||(p.grenade&&p.life>.1))continue;
  if(near(p.x,p.y))sparks(p.x,p.y,'#bfe6ff',8,'water');
  if(p.big&&!p.grenade){p.dmg*=.7;x.t=0;su_disarm(o,'su_wall');say(o,'DÔME BRISÉ','#bfe6ff');jx({jfx:'su_splash',x:x.x,y:x.y,r:x.r,t:.5,m:.5});x.wave=1;return}
  p.life=0;p.dead=1;p.boom=1}
 for(const e of enemies(o)){if(e.unstop>0)continue;const d=Math.hypot(e.x-x.x,e.y-x.y),m=x.r+e.r;if(d<m&&d>.5){e.x=x.x+(e.x-x.x)/d*m;e.y=x.y+(e.y-x.y)/d*m}}};
// Mizurappa : immobile ; toute autre action (jutsu, coup, parade, esquive) coupe le torrent
AUXF.su_jet=(x,dt)=>{const o=x.owner;
 if(o.dead||o.stun>0||o.silence>0||o.cast||o.dash||o.swing>0||o.thrT>0||o.block||Math.hypot(o.kx,o.ky)>160||x.t<=0){x.t=0;if(o.anim&&o.anim.k==='su_spit')o.anim=null;return}
 o.root=Math.max(o.root,.1);x.x=o.x;x.y=o.y;if(!o.ctrl)for(let j=0;j<o.cds.length;j++)if(j!==x.si)o.cds[j]=Math.max(o.cds[j],.12);
 x.a+=clamp(su_wrap(o.aim-x.a),-2.4*dt,2.4*dt);x.len=Math.min(300,x.len+dt*1000);
 const ca=Math.cos(x.a),sa=Math.sin(x.a),tick=x.k<=0;if(tick)x.k=.25;
 for(const e of enemies(o)){const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa,s=Math.abs(-dx*sa+dy*ca);if(f<0||f>x.len+e.r||s>12+f*.13+e.r)continue;
  if(e.unstop<=0){e.kx+=ca*1150*dt;e.ky+=sa*1150*dt}if(tick)su_hit(e,o,4,{slow:.5,kb:30,fx:x.x,fy:x.y})}
 x.sp-=dt;if(x.sp<=0&&near(x.x,x.y)){x.sp=.1;sparks(x.x+ca*x.len,x.y+sa*x.len,'#bfe6ff',3,'water');if(tick)S('water',o)}};
// Suirô
function su_trap(o,t){if(t.dead||t.unstop>0||o.dead||aux.some(x=>x.type==='su_prison'&&x.tg===t&&x.t>0))return;
 aux.push({type:'su_prison',x:t.x,y:t.y,r:34,t:1.8,m:1.8,team:o.team,owner:o,tg:t,vfx:'water',k:.5,ti:su_i(t),ui:su_i(o),hp0:o.hp,si:su_slot(o,'su_prison')});
 t.su_pr=1.8;t.cast=null;say(t,'PRISON AQUEUSE','#7fc8ff');su_arm(o,'su_prison',1.85)}
AUXF.su_prison=(x,dt)=>{const o=x.owner,e=x.tg;x.hp0=Math.max(x.hp0,o.hp);const br=o.hp<x.hp0-12; // frappé : la concentration cède
 if(!e||e.dead||o.dead||x.t<=0||br||o.stun>0||o.silence>0||e.unstop>0||Math.hypot(o.x-x.x,o.y-x.y)>460||(o.ctrl&&(o.cast||o.dash||o.swing>0||o.thrT>0||o.block))){su_free(x,br);return}
 e.x=x.x;e.y=x.y;e.kx=e.ky=0;e.stun=Math.max(e.stun,.12);e.cast=null;e.dash=null;e.flame=null;e.spin=null;e.su_pr=x.t;
 o.root=Math.max(o.root,.12);o.anim={k:'su_hold',t:.2,m:.2};if(!o.ctrl)for(let j=0;j<o.cds.length;j++)if(j!==x.si)o.cds[j]=Math.max(o.cds[j],.12);
 if(x.k<=0){x.k=.5;su_hit(e,o,4,{});const d=Math.min(e.energy,3);e.energy-=d;o.energy=Math.min(100,o.energy+d);if(near(e.x,e.y))sparks(e.x,e.y,'#bfe6ff',5,'water')}};
function su_free(x,br){if(x.freed)return;x.freed=1;x.t=0;const o=x.owner,e=x.tg;if(e){e.su_pr=0;jx({jfx:'su_splash',x:e.x,y:e.y,r:48,t:.45,m:.45})}
 su_disarm(o,'su_prison');if(o.anim&&o.anim.k==='su_hold')o.anim=null;if(br)say(o,'PRISON BRISÉE','#bfe6ff')}
function su_throw(x,a){const o=x.owner,e=x.tg;su_free(x);if(!e||e.dead)return;let L=240,crash=0;
 for(let s=16;s<=240;s+=12){const px=e.x+Math.cos(a)*s,py=e.y+Math.sin(a)*s;if(px<B.x+e.r||px>B.x+B.w-e.r||py<B.y+e.r||py>B.y+B.h-e.r||OBST.some(q=>Math.hypot(px-q.x,py-q.y)<q.r+e.r)){L=Math.max(0,s-12);crash=1;break}}
 S('water',o);anim(o,'palm',.35);if(!su_hit(e,o,8,{})||e.dead||e.unstop>0)return;
 e.dash={sx:e.x,sy:e.y,tx:e.x+Math.cos(a)*L,ty:e.y+Math.sin(a)*L,t:0,dur:.14+L/1000,jump:40,end:()=>{jx({jfx:'su_splash',x:e.x,y:e.y,r:56,t:.5,m:.5});
  if(crash&&!e.dead){su_hit(e,o,6,{stun:.75});say(e,'ÉCRASÉ','#f22');if(near(e.x,e.y))shake=Math.max(shake,.15)}}}}
function su_botAim(u,e){let b=null,bd=250;for(const q of OBST){const d=Math.hypot(q.x-e.x,q.y-e.y)-q.r;if(d<bd){bd=d;b=q}}return b?Math.atan2(b.y-e.y,b.x-e.x):ang(u,e)} // bot : vise un pilier proche
// Kirigakure
AUXF.su_mist=(x,dt)=>{
 for(const p of projs)if(!p.su_fog&&p.owner.team!==x.team&&ELM[p.vfx]===2&&Math.hypot(p.x-x.x,p.y-x.y)<x.r){p.su_fog=1;x.t-=1.5;jx({jfx:'windsphere',x:p.x,y:p.y,r:70,t:.5,m:.5})}
 for(const a of aux)if(a.vfx==='wind'&&a.team!==x.team&&Math.hypot(a.x-x.x,a.y-x.y)<x.r+(a.r||60))x.t-=dt*2;
 if(x.t<=0){if(!x.gone){x.gone=1;sparks(x.x,x.y,'#e8eef6',16,'smoke')}return}su_keepF(x,'su_mistF',dt,{team:x.team});
 for(const u of units){if(u.dead||Math.hypot(u.x-x.x,u.y-x.y)>x.r+u.r)continue;
  if(u.team===x.team){if(u.swing>0||(u.relT>0&&x.m-x.t>.4)||u.thrT>0||u.cast)u.su_mA=.8;else u.su_mA=(u.su_mA||0)-dt;if(u.su_mA<=0)u.stealth=Math.max(u.stealth,.25)}
  else{u.wet=Math.max(u.wet||0,1);if(u.unstop<=0&&!(u.slowImm>0))u.slow=Math.max(u.slow,.12)}}};
// Dragon aqueux : les ennemis touchés sont emportés 0,38 s par la tête du dragon ; il avale les petits tirs ennemis
function su_dragonStep(x,p,dt,end){const o=p.owner,L=p.su_car||[],h=Math.atan2(p.vy,p.vx);
 if(!end){x.lf=p.life;for(const c of L){if(c.done)continue;const e=c.e;c.t-=dt;if(e.dead||c.t<=0){c.done=1;su_drop(o,e,h,0);continue}
   e.x=p.x+Math.cos(h)*8;e.y=p.y+Math.sin(h)*8;e.kx=e.ky=0;e.stun=Math.max(e.stun,.1);e.airT=.3;e.cast=null;e.dash=null}
  for(const q of projs)if(q!==p&&!q.dead&&q.owner.team!==o.team&&!q.big&&!q.grenade&&Math.hypot(q.x-p.x,q.y-p.y)<p.r+q.r+12){q.life=0;q.dead=1;q.boom=1;if(near(q.x,q.y))sparks(q.x,q.y,'#bfe6ff',6,'water')}
  return}
 const crash=(x.lf||0)>.05;for(const c of L)if(!c.done){c.done=1;su_drop(o,c.e,h,crash)}
 jx({jfx:'su_splash',x:p.x,y:p.y,r:crash?90:64,t:.6,m:.6});if(crash&&near(p.x,p.y)){shake=Math.max(shake,.2);su_snd('boom',o)}}
function su_drop(o,e,h,crash){if(e.dead)return;e.airT=0;if(e.team===o.team)return;if(crash){su_hit(e,o,10,{stun:.8});say(e,'ÉCRASÉ','#f22')}else{e.kx+=Math.cos(h)*240;e.ky+=Math.sin(h)*240}}
// tourbillon de Daibakufu : aspire vers le centre (en spirale), ralentit, use un peu
AUXF.su_whirl=(x,dt)=>{const o=x.owner;for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d>x.r+e.r||d<1||e.unstop>0)continue;const a=Math.atan2(x.y-e.y,x.x-e.x),pl=Math.min(55,d*1.6)*7*dt; // ~55 px/s vers le centre : on en sort en luttant (ralenti), pas une entrave
  e.kx+=(Math.cos(a)-Math.sin(a)*.45)*pl;e.ky+=(Math.sin(a)+Math.cos(a)*.45)*pl}
 if(x.k>0)return;x.k=.25;for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r){if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.35);su_hit(e,o,1.1,{silent:1})}};
// sol inondé : ralentit et trempe les ennemis
AUXF.su_flood=x=>{if(x.k>0)return;x.k=.25;for(const e of enemies(x.owner))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r){if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.35);e.wet=Math.max(e.wet||0,1)}};
// corps liquide : on traverse les ninjas sans les bousculer (la séparation des unités du moteur est annulée pendant la glissade)
// et la traînée de la glissade devient de l'eau (le moteur la colore avec le chakra du ninja)
AUXF.su_liq=x=>{const o=x.owner;if(!o||o.dead)return;const d=o.dash;
 if(d){const k=Math.min(1,d.t/d.dur),cx=d.sx+(d.tx-d.sx)*k,cy=d.sy+(d.ty-d.sy)*k,px=o.x-cx,py=o.y-cy,q=px*px+py*py;
  if(q>.01&&q<900){let n=0;for(const e of units)if(e!==o&&!e.dead&&Math.hypot(e.x-o.x,e.y-o.y)<o.r+e.r+1){e.x+=px;e.y+=py;n++}if(n){o.x=cx;o.y=cy}}}
 for(let i=fx.length-1,n=0;i>=0&&n<12;i--,n++){const f=fx[i];if(f.r===6&&f.vx===0&&f.m===.25&&!f.vfx&&Math.abs(f.x-o.x)<40&&Math.abs(f.y-o.y)<40){f.col='#7fd8ff';f.vfx='water'}}
 x.x=o.x;x.y=o.y};
// Daikôdan : chaque tir ennemi avalé fait grossir le requin
function su_eat(x,p){for(const q of projs)if(q!==p&&!q.dead&&q.owner.team!==x.team&&Math.hypot(q.x-p.x,q.y-p.y)<p.r*1.6+q.r+12){q.life=0;q.dead=1;q.boom=1;p.r=Math.min(38,p.r+2.5);p.su_d0=p.su_d0||p.dmg;p.dmg=Math.min(p.dmg*1.1,p.su_d0*1.6);p.ar=Math.min(200,p.ar+8);
 if(near(q.x,q.y)){sparks(q.x,q.y,'#bfe6ff',10,'water');txt.push({x:p.x,y:p.y,z:80,s:'CROC !',col:'#bfe6ff',t:.8})}}}
// Dôme des requins : la paroi garde les ennemis piégés dedans (et les autres dehors) et arrête tous les tirs qui la traversent
AUXF.su_dome=(x,dt)=>{const o=x.owner,el=x.m-x.t;if(x.t<=0)return;if(o.dead&&x.t>.4)x.t=.4; // le lanceur tombe : le dôme s'effondre
 su_keepF(x,'su_domeF',dt);
 if(!x.tr){if(el<.15)return;x.tr=enemies(o).filter(e=>Math.hypot(e.x-x.x,e.y-x.y)<x.r);for(const e of x.tr)say(e,'PIÉGÉ','#7fc8ff');if(near(x.x,x.y)){shake=Math.max(shake,.2);S('water',o)}}
 for(const e of enemies(o)){const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<.5)continue;
  if(x.tr.includes(e)){if(d>x.r+90){x.tr.splice(x.tr.indexOf(e),1);continue}if(d>x.r-e.r){const m=x.r-e.r;e.x=x.x+(e.x-x.x)/d*m;e.y=x.y+(e.y-x.y)/d*m}}
  else if(d<x.r+e.r){const m=x.r+e.r;e.x=x.x+(e.x-x.x)/d*m;e.y=x.y+(e.y-x.y)/d*m}}
 for(const p of projs){if(p.dead||p.grenade)continue;const d=Math.hypot(p.x-x.x,p.y-x.y),d0=Math.hypot(p.x-p.vx*dt-x.x,p.y-p.vy*dt-x.y);if((d-x.r)*(d0-x.r)<0){p.life=0;p.dead=1;p.boom=1;if(near(p.x,p.y))sparks(p.x,p.y,'#bfe6ff',6,'water')}}
 if(Math.hypot(o.x-x.x,o.y-x.y)<x.r)o.haste=Math.max(o.haste,.3);
 if(x.k<=0){x.k=.25;for(const e of x.tr){if(e.dead)continue;if(e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.35);e.wet=Math.max(e.wet||0,1);const d=Math.min(e.energy,1.6);e.energy-=d;o.energy=Math.min(100,o.energy+d)}}
 x.bite-=dt;if(x.bite<=0){x.bite=.9;const L=x.tr.filter(e=>!e.dead);if(L.length){const e=L[Math.floor(rnd()*L.length)],b=Math.atan2(e.y-x.y,e.x-x.x)+(rnd()-.5)*1.4;
  jx({jfx:'su_lunge',x:e.x,y:e.y,a:b,t:.45,m:.45});later(o,.28,()=>{if(!e.dead&&x.tr.includes(e)&&su_hit(e,o,9,{}))gain(o,4,o)})}}};
// Bakusui Shôha : le front de la vague avance (480 px/s) ; les ennemis touchés sont emportés 0,7 s, écrasés s'ils heurtent un obstacle
AUXF.su_tsu=(x,dt)=>{const o=x.owner,ca=Math.cos(x.a),sa=Math.sin(x.a);
 if(x.len<600&&x.t>.02){x.len=Math.min(600,x.len+480*dt);x.x=x.ox+ca*x.len;x.y=x.oy+sa*x.len;
  for(const e of enemies(o)){if(x.hs.includes(e))continue;const dx=e.x-x.ox,dy=e.y-x.oy,f=dx*ca+dy*sa,s=-dx*sa+dy*ca;
   if(Math.abs(s)<x.w/2+e.r&&f<x.len+e.r&&f>x.len-70){x.hs.push(e);su_hit(e,o,34,{});if(e.unstop<=0&&!e.dead)x.car.push({e,s,t:.7})}}
  for(const c of x.car){if(c.done)continue;const e=c.e;c.t-=dt;if(e.dead||c.t<=0){c.done=1;continue}const tx=x.ox+ca*(x.len-16)-sa*c.s,ty=x.oy+sa*(x.len-16)+ca*c.s;
   e.x=tx;e.y=ty;e.kx=e.ky=0;e.dash=null;e.cast=null;e.stun=Math.max(e.stun,.1);e.airT=Math.max(e.airT,.2);collide(e);
   if(Math.hypot(e.x-tx,e.y-ty)>6){c.done=1;su_hit(e,o,18,{stun:1});say(e,'ÉCRASÉ','#f22');jx({jfx:'su_splash',x:e.x,y:e.y,r:60,t:.5,m:.5})}}
  x.sp-=dt;if(x.sp<=0&&near(x.x,x.y)){x.sp=.12;const s=(rnd()-.5)*x.w;sparks(x.x-sa*s,x.y+ca*s,'#e8f6ff',4,'water')}return}
 x.t=0;for(const c of x.car)c.done=1;
 aux.push({type:'su_sea',x:x.ox+ca*300,y:x.oy+sa*300,a:x.a,len:600,w:x.w,r:300,t:5,m:5,team:x.team,owner:o,vfx:'water',k:0});jx({jfx:'su_splash',x:x.x,y:x.y,r:110,t:.6,m:.6})};
// la mer : ennemis ralentis et trempés, l'équipe du lanceur nage vite
AUXF.su_sea=x=>{if(x.k>0)return;x.k=.25;const ca=Math.cos(x.a),sa=Math.sin(x.a);
 for(const u of units){if(u.dead)continue;const dx=u.x-x.x,dy=u.y-x.y;if(Math.abs(dx*ca+dy*sa)>x.len/2+u.r||Math.abs(-dx*sa+dy*ca)>x.w/2+u.r)continue;
  if(u.team===x.team)u.haste=Math.max(u.haste,.35);else{if(u.unstop<=0&&!(u.slowImm>0))u.slow=Math.max(u.slow,.35);u.wet=Math.max(u.wet||0,1)}}};
// ---------- dessins ----------
// requin (repère du projectile ; t en ms) : dos sombre, ventre clair, gueule dentée ; l'œil s'allume quand il traque
function su_sharkD(S,ra,t,lock,big){const w=Math.sin(t/(big?110:80));g.rotate(ra);if(Math.cos(ra)<0)g.scale(1,-1);g.scale(S,S);
 g.strokeStyle=rgba('#e8f6ff',.55);g.lineWidth=1.6;for(let i=1;i<4;i++){const x=-22-i*9;g.beginPath();g.moveTo(x-6,-(5+i*3));g.quadraticCurveTo(x+4,0,x-6,5+i*3);g.stroke()}
 g.fillStyle='#24609e';g.beginPath();g.moveTo(-17,0);g.lineTo(-31,-11+w*5);g.lineTo(-27,0);g.lineTo(-31,10+w*5);g.closePath();g.fill();
 g.fillStyle='#2a6ab0';g.beginPath();g.ellipse(0,0,22,8.5,0,0,7);g.fill();g.fillStyle='#dcefff';g.beginPath();g.ellipse(3,3.2,16,4.2,0,0,Math.PI);g.fill();
 g.strokeStyle=rgba('#7fc8ff',.85);g.lineWidth=1.4;g.beginPath();g.ellipse(-2,-1,17,5.5,0,3.5,5.9);g.stroke();
 g.fillStyle='#24609e';g.beginPath();g.moveTo(-3,-7.5);g.lineTo(-10,-19);g.lineTo(-13,-7);g.fill();g.beginPath();g.moveTo(3,5);g.lineTo(-5,13+w*2);g.lineTo(-4,5);g.fill();
 const m=big?3.5+Math.sin(t/120)*1.5:2;g.fillStyle='#3a0d16';g.beginPath();g.moveTo(11,.6);g.lineTo(22.5,-1.4);g.lineTo(22,1+m);g.closePath();g.fill();
 g.fillStyle='#fff';for(let i=0;i<4;i++){g.beginPath();g.moveTo(13+i*2.2,.4);g.lineTo(14.1+i*2.2,2.4);g.lineTo(15.2+i*2.2,.2);g.fill()}
 g.strokeStyle=rgba('#123a66',.8);g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.moveTo(5+i*2.2,-4);g.quadraticCurveTo(4+i*2.2,0,5+i*2.2,3);g.stroke()}
 if(lock)circ(13,-3.2,3.2,rgba('#ffe14a',.45));circ(13,-3.2,1.8,lock?'#ffe14a':'#fff');circ(13.3,-3.2,.8,'#111')}
PROJD.su_shark=(p,R,ra,t)=>su_sharkD(R/9.5,ra,t,p.col==='#7fd8ff',0);
PROJD.su_bigshark=(p,R,ra,t)=>{ // la traînée « fusée » du moteur est orange : on la change en écume avant qu'elle soit dessinée
 for(let i=fx.length-1,n=0;i>=0&&n<160;i--,n++){const f=fx[i];if(f.col==='#fa3'&&f.r===4&&f.z===28&&!f.vfx&&Math.abs(f.x-p.x)<170&&Math.abs(f.y-p.y)<170){f.col='#e8f6ff';f.vfx='water'}}
 for(let i=0;i<3;i++){const b=t/140+i*2.1;circ(Math.cos(b)*R*1.3,Math.sin(b)*R*.5,R*.16,'rgba(232,246,255,.75)')}su_sharkD(R/13,ra,t,0,1)};
// Teppôdama : sphère d'eau dense qui ondule, traînée d'embruns
PROJD.su_ball=(p,R,ra,t)=>{const w=Math.sin(t/50)*.1;g.save();g.rotate(ra);g.fillStyle=rgba('#bfe6ff',.5);g.beginPath();g.moveTo(R*.3,-R*.85);g.quadraticCurveTo(-R*3.4,-R*.2,-R*4,0);g.quadraticCurveTo(-R*3.4,R*.2,R*.3,R*.85);g.fill();
 g.strokeStyle=rgba('#ffffff',.6);g.lineWidth=1.2;g.beginPath();g.moveTo(-R*1.2,-R*.45);g.lineTo(-R*2.6,-R*.2);g.moveTo(-R,R*.5);g.lineTo(-R*2.2,R*.3);g.stroke();g.restore();
 g.scale(1+w,1-w);circ(0,0,R*1.05,'#1a6ad0');circ(-R*.08,-R*.1,R*.9,'#3aa8ff');g.fillStyle=rgba('#bfe6ff',.55);g.beginPath();g.ellipse(-R*.15,-R*.2,R*.6,R*.45,0,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(-R*.38,-R*.45,R*.26,R*.15,-.6,0,7);g.fill();g.strokeStyle=rgba('#e8f6ff',.8);g.lineWidth=1.2;g.beginPath();g.arc(0,0,R*1.05,.2,1.6);g.stroke()};
// Suirô : orbe d'eau avec un tourbillon intérieur
PROJD.su_orb=(p,R,ra,t)=>{const r=R*1.15;circ(0,0,r*1.3,rgba('#3aa8ff',.22));circ(0,0,r,rgba('#3aa8ff',.72));g.strokeStyle='#e8f6ff';g.lineWidth=1.5;g.beginPath();g.arc(0,0,r,0,7);g.stroke();
 g.strokeStyle=rgba('#ffffff',.85);g.lineWidth=1.2;g.beginPath();for(let i=0;i<14;i++){const b=t/90+i*.5,d=r*.75*(i/14);g.lineTo(Math.cos(b)*d,Math.sin(b)*d)}g.stroke();
 circ(-r*.35,-r*.4,r*.22,'rgba(255,255,255,.85)');for(let i=0;i<3;i++){const b=t/150+i*2.1;circ(Math.cos(b)*r*1.5,Math.sin(b)*r*.9,1.8,'#bfe6ff')}};
// Dragon aqueux : corps en anneaux qui ondule et sort du sol, tête cornue à moustaches
PROJD.su_dragon=(p,R,ra,t)=>{const sp=Math.hypot(p.vx,p.vy)||800,th=Math.atan2(p.vy,p.vx),lf=Math.hypot(Math.cos(th),K*Math.sin(th)),tr=Math.max(0,((p.life0||.8)-(p.life||0))*sp),L=Math.min(210,tr+30)*lf,c=Math.cos(ra),s=Math.sin(ra),N=12,pts=[];
 for(let i=0;i<=N;i++){const d=i/N*L,wob=Math.sin(t/70-i*.75)*9*(i/N),h=Math.sin(Math.PI*Math.min(1,d/Math.max(1,L)))*26+8;pts.push([-c*d-s*wob,-s*d+c*wob-h])}
 for(let i=N;i>=1;i--){const [x,y]=pts[i];circ(x,y,R*(1-i/N*.7)*.75,i%2?'#2a7ad0':'#3aa8ff')}
 g.strokeStyle=rgba('#bfe6ff',.8);g.lineWidth=R*.18;g.lineCap='round';g.beginPath();pts.forEach(([x,y],i)=>{const r=R*(1-i/N*.7)*.75;i?g.lineTo(x,y-r*.55):g.moveTo(x,y-r*.55)});g.stroke();
 g.fillStyle='#bfe6ff';for(let i=2;i<N;i+=3){const [x,y]=pts[i],r=R*(1-i/N*.7)*.75;g.beginPath();g.moveTo(x-c*r*.5,y-r*.7);g.lineTo(x-c*r*1.4,y-r*1.6);g.lineTo(x-c*r*.1,y-r*.8);g.fill()}
 const [hx,hy]=pts[0];g.save();g.translate(hx,hy);g.rotate(ra);if(c<0)g.scale(1,-1);
 g.fillStyle='#3aa8ff';g.beginPath();g.ellipse(R*.3,0,R*1.15,R*.72,0,0,7);g.fill();g.fillStyle='#2a7ad0';g.beginPath();g.moveTo(R*.5,R*.15);g.lineTo(R*1.7,R*.6);g.lineTo(R*.3,R*.7);g.fill();
 g.fillStyle='#e8f6ff';g.beginPath();g.moveTo(R*.9,-R*.1);g.lineTo(R*1.9,R*.1);g.lineTo(R*.9,R*.3);g.fill();
 g.strokeStyle='#e8f6ff';g.lineWidth=R*.12;g.beginPath();g.moveTo(-R*.2,-R*.55);g.quadraticCurveTo(-R*.9,-R*1.5,-R*1.6,-R*1.3);g.moveTo(R*.1,-R*.5);g.quadraticCurveTo(-R*.4,-R*1.2,-R,-R*1.4);g.stroke();
 g.strokeStyle=rgba('#bfe6ff',.9);g.lineWidth=R*.07;g.beginPath();g.moveTo(R*1.5,R*.3);g.quadraticCurveTo(R*.8,R*1.3+Math.sin(t/60)*R*.3,-R*.6,R*1.1);g.stroke();
 circ(R*.55,-R*.25,R*.17,'#fff');circ(R*.6,-R*.25,R*.08,'#0a2a4a');g.restore();
 for(let i=0;i<4;i++){const b=t/80+i*1.6;circ(hx+Math.cos(b)*R*1.2,hy+Math.sin(b)*R*.6,R*.12,'rgba(232,246,255,.8)')}};
// dôme d'eau en deux passes : arrière (sous les ninjas) puis avant (par-dessus, translucide)
function su_drawDome(x,y,r,hf,gr,al,t,front,dark){if(gr<=0||al<=0)return;const q=P(x,y,0),rx=r*q.s,H=r*hf*q.s*gr,a0=front?0:Math.PI,a1=front?Math.PI:2*Math.PI;g.save();g.globalAlpha=al;
 g.fillStyle=rgba(dark?'#1a5ab0':'#3aa8ff',front?.13:.2);g.beginPath();g.ellipse(q.x,q.y,rx,H,0,Math.PI,2*Math.PI);g.ellipse(q.x,q.y,rx,rx*K,0,0,Math.PI);g.fill();
 g.lineWidth=2.4*q.s;g.setLineDash([rx*.42,rx*.26]);
 for(let i=0;i<5;i++){const h=H*(.08+i*.19),w=rx*Math.sqrt(Math.max(0,1-(h/H)**2));if(w<6)continue;g.strokeStyle=rgba(i%2?'#bfe6ff':'#e8f6ff',front?.55:.32);g.lineDashOffset=(i%2?1:-1)*t*rx*1.4;g.beginPath();g.ellipse(q.x,q.y-h,w,w*K,0,a0,a1);g.stroke()}
 g.setLineDash([]);g.strokeStyle=rgba('#ffffff',front?.8:.4);g.lineWidth=3*q.s;g.beginPath();g.ellipse(q.x,q.y,rx,rx*K,0,a0,a1);g.stroke();
 if(front){g.strokeStyle=rgba('#e8f6ff',.6);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,rx,H,0,Math.PI,2*Math.PI);g.stroke();g.strokeStyle=rgba('#ffffff',.45);g.lineWidth=4*q.s;g.beginPath();g.ellipse(q.x,q.y,rx*.82,H*.86,0,3.55,4.25);g.stroke()}
 g.restore()}
AUXD.su_wall=(x,k,t)=>su_drawDome(x.x,x.y,x.r,1.3,Math.min(1,(x.m-x.t)/.2),Math.min(1,x.t/.25),t,0,0);
JFXD.su_wallF=(f,k,e,t)=>{const x=su_auxAt('su_wall',f);if(x)su_drawDome(x.x,x.y,x.r,1.3,Math.min(1,(x.m-x.t)/.2),Math.min(1,x.t/.25),t,1,0)};
// dôme des requins : eau sombre, requins qui tournent (devant ou derrière les ninjas selon leur position)
function su_domeSharks(x,t,front,al){for(let i=0;i<4;i++){const b=t*1.1+i*1.571,sb=Math.sin(b);if(front?sb<0:sb>=0)continue;const q=P(x.x+Math.cos(b)*x.r*.72,x.y+sb*x.r*.72,40+Math.sin(t*3+i)*12);
 g.save();g.globalAlpha=.8*al;g.translate(q.x,q.y);g.scale(q.s,q.s);su_sharkD(1.35,Math.atan2(Math.cos(b)*K,-Math.sin(b)),t*1000,0,0);g.restore()}}
AUXD.su_dome=(x,k,t)=>{const gr=Math.min(1,(x.m-x.t)/.15),al=Math.min(1,x.t/.4);g.fillStyle=rgba('#1a5ab0',.28*al);gEll(x.x,x.y,x.r);g.fill();su_drawDome(x.x,x.y,x.r,.8,gr,al,t,0,1);su_domeSharks(x,t,0,al)};
JFXD.su_domeF=(f,k,e,t)=>{const x=su_auxAt('su_dome',f);if(!x)return;const gr=Math.min(1,(x.m-x.t)/.15),al=Math.min(1,x.t/.4);su_drawDome(x.x,x.y,x.r,.8,gr,al,t,1,1);su_domeSharks(x,t,1,al)};
// Mizurappa : ruban d'eau qui ondule de la bouche jusqu'à l'écume du bout
// trois épaisseurs (gaine claire, corps, cœur lumineux) pour le volume, filets blancs qui filent, embruns, éventail d'écume à l'impact
AUXD.su_jet=(x,k,t)=>{const o=x.ui!=null?units[x.ui]:null;if(!o||o.dead)return;const ca=Math.cos(x.a),sa=Math.sin(x.a),n=10,L=x.len||0;if(L<20)return;
 const at=(i,s,zo)=>{const f=14+i/n*(L-14),w=(5+f*.12)*s*(.85+.15*Math.sin(t*30+i*1.7));return P(o.x+ca*f-sa*w,o.y+sa*f+ca*w,46-i/n*22+(zo||0))},
  band=(wm,zo,col)=>{const A=[],B2=[];for(let i=0;i<=n;i++){A.push(at(i,wm,zo));B2.unshift(at(i,-wm,zo))}poly(A.concat(B2),col)};
 band(1.5,0,rgba('#bfe6ff',.3*k));band(1,0,rgba('#2a7ad0',.88*k));band(.5,3,rgba('#62c4ff',.92*k));
 g.lineCap='round';for(let j=0;j<3;j++){g.strokeStyle=rgba(j===1?'#ffffff':'#e8f6ff',(j===1?.9:.6)*k);g.lineWidth=j===1?2.6:1.5;g.setLineDash([18+j*6,12+j*4]);g.lineDashOffset=-t*(520+j*90);g.beginPath();
  for(let i=0;i<=n;i++){const q=at(i,(j-1)*.5,2);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke()}g.setLineDash([]);
 for(let i=0;i<10;i++){const s=(t*2.6+i*.137)%1,f=14+s*(L-14),sd=(i%2?1:-1)*(5+f*.12)*(1.15+(i%3)*.25),q=P(o.x+ca*f-sa*sd,o.y+sa*f+ca*sd,46-s*22+Math.sin(s*Math.PI)*10);circ(q.x,q.y,(1.4+(i%3)*.5)*q.s,rgba('#e8f6ff',.75*k*(1-s*.5)))}
 const e=P(o.x+ca*L,o.y+sa*L,24),eg=P(o.x+ca*L,o.y+sa*L,0),rr=(16+((t*3)%1)*28)*eg.s;g.strokeStyle=rgba('#e8f6ff',.55*k*(1-(t*3)%1));g.lineWidth=2;g.beginPath();g.ellipse(eg.x,eg.y,rr,rr*K,0,0,7);g.stroke();
 for(let i=0;i<9;i++){const b=x.a+(i-4)*.3+Math.sin(t*14+i)*.08,d=(8+((t*5+i*.31)%1)*24)*e.s;circ(e.x+Math.cos(b)*d,e.y+Math.sin(b)*d*K-Math.abs(Math.sin(t*12+i))*7*e.s,(3.2+Math.sin(t*20+i)*1.2)*e.s,rgba(i%2?'#ffffff':'#bfe6ff',.85*k))}};
// Suirô : lien d'eau torsadé entre la main du lanceur et la bulle (la bulle est dessinée sur le prisonnier)
AUXD.su_prison=(x,k,t)=>{const e=x.ti!=null?units[x.ti]:null,o=x.ui!=null?units[x.ui]:null;if(!e||!o||o.dead)return;const a=ang(o,e),h=P(o.x+Math.cos(a)*18,o.y+Math.sin(a)*18,40),b=P(e.x,e.y,40);
 for(let j=0;j<2;j++){g.strokeStyle=j?rgba('#e8f6ff',.75):rgba('#3aa8ff',.75);g.lineWidth=(j?1.5:4)*h.s;g.beginPath();g.moveTo(h.x,h.y);
  for(let i=1;i<=10;i++){const s=i/10,w=Math.sin(s*Math.PI)*(6+Math.sin(t*10+i+j*3)*3)*h.s*(j?-1:1);g.lineTo(lerp(h.x,b.x,s)+w*.3,lerp(h.y,b.y,s)-Math.sin(s*Math.PI)*18*h.s+w)}g.stroke()}};
STATD.push((u,p,S,sk)=>{if(!(u.su_pr>0)||u.dead)return;const t=performance.now()/1000,cx=p.x,cy=p.y-36*S*sk,R=30*S*sk;g.save();g.globalAlpha=Math.min(1,u.su_pr*3);
 g.fillStyle='rgba(58,168,255,.32)';g.beginPath();g.ellipse(cx,cy,R,R*1.25,0,0,7);g.fill();g.strokeStyle='rgba(232,246,255,.85)';g.lineWidth=2;g.stroke();
 g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=2.5;g.beginPath();g.ellipse(cx,cy,R*.78,R,0,3.6,4.6);g.stroke();
 g.strokeStyle='rgba(191,230,255,.55)';g.lineWidth=1.5;g.beginPath();g.ellipse(cx,cy+Math.sin(t*4)*R*.2,R*.9,R*.25,0,0,7);g.stroke();
 for(let i=0;i<6;i++){const k=(t*.8+i/6)%1;circ(cx+Math.sin(i*2.1+t*3)*R*.5,cy+R*1.1-k*R*2.2,(1.5+i%3)*S,'rgba(255,255,255,.75)')}g.restore()});
// Kirigakure : voile au sol + nappes de brume par-dessus les ninjas ; l'ennemi dedans voit son écran se boucher
let su_fogT=0; // un seul voile d'écran par image, même si plusieurs brumes se chevauchent
AUXD.su_mist=(x,k,t)=>{const a=Math.min(1,x.t/.8,(x.m-x.t)/.6);g.fillStyle=rgba('#dfe8f0',.2*a);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#e8eef6',.35*a);g.lineWidth=2;g.setLineDash([16,12]);g.lineDashOffset=t*12;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([])};
JFXD.su_mistF=(f,k,e,t)=>{const x=su_auxAt('su_mist',f);if(!x)return;const a=Math.min(1,x.t/.8,(x.m-x.t)/.6);
 for(let i=0;i<16;i++){const b=i*2.4+t*.07*(i%2?1:-1),d=x.r*(.1+((i*37)%78)/100),q=P(x.x+Math.cos(b)*d+Math.sin(t*.6+i)*14,x.y+Math.sin(b)*d*.85,12+(i%4)*12),w=(38+(i%5)*12)*q.s*(1+.12*Math.sin(t*.9+i*1.7));
  g.fillStyle=rgba(i%3?'#e4ecf4':'#c8d8e8',(.1+(i%3)*.035)*a);g.beginPath();g.ellipse(q.x,q.y,w,w*.36,Math.sin(i)*.15,0,7);g.fill()}
 const now=performance.now();if(player&&!player.dead&&player.team!==f.team&&Math.hypot(player.x-x.x,player.y-x.y)<x.r&&now-su_fogT>4){su_fogT=now;const p=P(player.x,player.y,30);g.setTransform(RS,0,0,RS,0,0);const gr=g.createRadialGradient(p.x,p.y,60,p.x,p.y,260);gr.addColorStop(0,'rgba(220,230,240,0)');gr.addColorStop(1,rgba('#dfe8f0',.82*a));g.fillStyle=gr;g.fillRect(0,0,W,H)}};
// sol inondé : nappe d'eau, bord d'écume qui tourne, ronds dans l'eau
AUXD.su_flood=(x,k,t)=>{const a=Math.min(1,x.t/.6,(x.m-x.t)/.25);g.fillStyle=rgba('#2a7ad0',.26*a);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#e8f6ff',.6*a);g.lineWidth=2.5;g.setLineDash([10,8]);g.lineDashOffset=-t*20;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([]);
 g.lineWidth=1.2;for(let i=0;i<5;i++){const s=(t*.5+i/5)%1,b=i*2.4+x.x,d=x.r*.55*((i*37%10)/10);g.strokeStyle=rgba('#bfe6ff',.5*a*(1-s));gEll(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,8+s*30);g.stroke()}};
// tourbillon : nappe sombre, bras d'écume en spirale, œil au centre
AUXD.su_whirl=(x,k,t)=>{const a=Math.min(1,x.t/.5,(x.m-x.t)/.3),q=P(x.x,x.y,0),R=x.r*q.s;g.fillStyle=rgba('#1a5ab0',.3*a);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#e8f6ff',.55*a);g.lineWidth=2.5;gEll(x.x,x.y,x.r);g.stroke();
 g.lineCap='round';for(let j=0;j<4;j++){g.strokeStyle=rgba(j%2?'#bfe6ff':'#ffffff',.6*a);g.lineWidth=(3-j*.4)*q.s;g.beginPath();for(let i=0;i<=14;i++){const s=i/14,b=-t*2.6+j*1.571+s*3.4,r=R*(.12+s*.85);i?g.lineTo(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r*K):g.moveTo(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r*K)}g.stroke()}
 g.fillStyle=rgba('#0e3a78',.55*a);g.beginPath();g.ellipse(q.x,q.y,R*.14,R*.14*K,0,0,7);g.fill()};
// Corps liquide : flaque qui file sous le ninja devenu translucide
AUXD.su_liq=(x,k,t)=>{const a=x.a||0,ra=Math.atan2(Math.sin(a)*K,Math.cos(a));for(let i=3;i>=0;i--){const q=P(x.x-Math.cos(a)*i*22,x.y-Math.sin(a)*i*22,0),r=(26-i*4)*q.s;g.fillStyle=rgba(i?'#3aa8ff':'#2a7ad0',(.55-i*.1)*k);g.beginPath();g.ellipse(q.x,q.y,r*1.25,r*.5,ra,0,7);g.fill()}
 const q=P(x.x,x.y,0);g.strokeStyle=rgba('#e8f6ff',.8*k);g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,q.y,(20+Math.sin(t*20)*3)*q.s,8*q.s,ra,0,7);g.stroke()};
JFXD.su_body=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,u.z||0),s=q.s*1.3,m=Math.sin(Math.PI*Math.min(1,e*1.15)),h=(62-34*m)*s;g.save();g.globalAlpha=Math.min(1,k*3);
 g.fillStyle=rgba('#3aa8ff',.55);g.beginPath();g.moveTo(q.x-16*s-10*m*s,q.y);g.quadraticCurveTo(q.x-18*s,q.y-h*.7,q.x,q.y-h);g.quadraticCurveTo(q.x+18*s,q.y-h*.7,q.x+16*s+10*m*s,q.y);g.closePath();g.fill();
 g.strokeStyle=rgba('#e8f6ff',.8);g.lineWidth=1.6;g.beginPath();g.moveTo(q.x-8*s,q.y-h*.25);g.quadraticCurveTo(q.x-10*s,q.y-h*.75,q.x-2*s,q.y-h*.92);g.stroke();
 for(let i=0;i<4;i++){const kk=(t*3+i*.25)%1;circ(q.x+(i-1.5)*9*s,q.y-h*(.7-kk*.7),2*s,rgba('#bfe6ff',.8*(1-kk)))}g.restore()};
// Bakusui Shôha : nappe derrière, mur d'eau sombre à crête d'écume devant
AUXD.su_tsu=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),ox=x.x-ca*x.len,oy=x.y-sa*x.len,hw=x.w/2,W2=(f,s,z)=>P(ox+ca*f-sa*s,oy+sa*f+ca*s,z||0);
 poly([W2(0,-hw),W2(x.len-10,-hw),W2(x.len-10,hw),W2(0,hw)],rgba('#2a7ad0',.3));const n=8,base=[],crest=[];
 const back=[];for(let i=0;i<=n;i++){const s=-hw+i/n*x.w,u=(s/hw)**2,f=x.len-u*26,h=(74+Math.sin(t*6+i)*7)*(1-u*.45);base.push(W2(f,s,0));crest.push(W2(f-34,s,h));back.push(W2(f-90,s,0))}
 poly(back.concat(crest.slice().reverse()),rgba('#3aa8ff',.55));poly(base.concat(crest.slice().reverse()),rgba('#1a6ad0',.85));g.lineCap='round';g.strokeStyle=rgba('#bfe6ff',.9);g.lineWidth=5;g.beginPath();crest.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();
 g.strokeStyle='#ffffff';g.lineWidth=2;g.beginPath();crest.forEach((p,i)=>i?g.lineTo(p.x,p.y-3):g.moveTo(p.x,p.y-3));g.stroke();
 for(let i=0;i<n;i++){const p=crest[i];circ(p.x+Math.sin(t*9+i)*4,p.y-6-Math.abs(Math.sin(t*7+i*2))*10,3*p.s,'rgba(255,255,255,.85)')}};
// la mer : rivage qui ondule, crêtes qui roulent dans le sens de la vague, ronds dans l'eau
AUXD.su_sea=(x,k,t)=>{const ca=Math.cos(x.a),sa=Math.sin(x.a),hl=x.len/2,hw=x.w/2,W2=(f,s)=>P(x.x+ca*f-sa*s,x.y+sa*f+ca*s,0),a=Math.min(1,x.t/.8),N=12,pts=[];
 for(let i=0;i<=N;i++)pts.push(W2(-hl+i/N*x.len,-hw-Math.sin(t*2+i*1.3)*7));for(let i=1;i<6;i++)pts.push(W2(hl+Math.sin(t*2.4+i)*6,-hw+i/6*x.w));
 for(let i=N;i>=0;i--)pts.push(W2(-hl+i/N*x.len,hw+Math.sin(t*2+i*1.7)*7));for(let i=5;i>0;i--)pts.push(W2(-hl-Math.sin(t*2.2+i)*6,-hw+i/6*x.w));
 poly(pts,rgba('#2a7ad0',.3*a));g.strokeStyle=rgba('#e8f6ff',.6*a);g.lineWidth=2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.stroke();
 g.lineCap='round';g.lineWidth=2;for(let j=0;j<5;j++){const ph=(t*.45+j/5)%1,f=-hl+ph*x.len;g.strokeStyle=rgba('#e8f6ff',Math.sin(Math.PI*ph)*.5*a);
  for(let c=0;c<3;c++){const s0=-hw*.8+((c*.37+j*.23)%1)*hw*1.25;g.beginPath();for(let i=0;i<=6;i++){const u=i/6,q=W2(f+Math.sin(u*Math.PI)*9,s0+u*hw*.45);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke()}}
 g.lineWidth=1.2;for(let i=0;i<6;i++){const s=(t*.6+i/6)%1,q=W2(((i*97)%x.len)-hl,((i*53)%x.w)-hw),r=(6+s*24)*q.s;g.strokeStyle=rgba('#bfe6ff',.5*a*(1-s));g.beginPath();g.ellipse(q.x,q.y,r,r*K,0,0,7);g.stroke()}};
// effets : jet de la bouche, gerbe d'eau, anneau, vague, morsure, colonne qui jaillit, cascade, raz-de-marée, requin qui bondit
JFXD.su_mouth=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x+Math.cos(f.a)*14,u.y+Math.sin(f.a)*14,48);for(let i=0;i<8;i++){const d=(4+i*6)*Math.min(1,e*2.5)*q.s,b=f.a+((i*37)%11/11-.5)*.8;circ(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*K,(1.8+i*.35)*q.s*k,rgba(i%2?'#bfe6ff':'#3aa8ff',.85*k))}};
JFXD.su_splash=(f,k,e)=>{const q=P(f.x,f.y,0),R=f.r*q.s;g.strokeStyle=rgba('#bfe6ff',.8*k);g.lineWidth=2.5*k+.5;g.beginPath();g.ellipse(q.x,q.y,R*(.3+e*.8),R*(.3+e*.8)*K,0,0,7);g.stroke();
 g.fillStyle=rgba('#3aa8ff',.75*k);for(let i=0;i<10;i++){const a=i*.628+f.r,d=R*(.2+e*.75),h=Math.sin(Math.PI*Math.min(1,e*1.4))*(26+(i%3)*10)*q.s;g.beginPath();g.ellipse(q.x+Math.cos(a)*d,q.y+Math.sin(a)*d*K-h,2.6*q.s,3.6*q.s,0,0,7);g.fill()}
 if(e<.6){const h=1-e/.6;g.fillStyle=rgba('#e8f6ff',.6*h);g.beginPath();g.moveTo(q.x-R*.35,q.y);g.quadraticCurveTo(q.x,q.y-R*.9*h-10*q.s,q.x+R*.35,q.y);g.fill()}};
JFXD.su_ring=(f,k,e)=>{g.strokeStyle=rgba('#bfe6ff',.85*k);g.lineWidth=3*k+.5;gEll(f.x,f.y,f.r*(.3+e));g.stroke();g.strokeStyle=rgba('#3aa8ff',.6*k);g.lineWidth=2;gEll(f.x,f.y,f.r*(.15+e*.7));g.stroke()};
// la crête de la vague atteint vite sa portée (les coups sont immédiats)
JFXD.su_wave=(f,k,e,t)=>{const q=P(f.x,f.y,0),r=(40+ezo(Math.min(1,e*2.4))*f.r)*q.s,h=46*(1-e*.45)*q.s*Math.min(1,e*5),a0=f.a-(f.w||1.25)/2,a1=f.a+(f.w||1.25)/2,E=(rr,hh,b0,b1,cc)=>g.ellipse(q.x,q.y-hh,rr,rr*K,0,b0,b1,cc);
 g.fillStyle=rgba('#3aa8ff',.5*k);g.beginPath();E(r*.7,0,a0,a1);E(r*.88,h,a1,a0,true);g.closePath();g.fill();
 g.fillStyle=rgba('#1a6ad0',.82*k);g.beginPath();E(r,0,a0,a1);E(r*.88,h,a1,a0,true);g.closePath();g.fill();
 g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=3*q.s;g.beginPath();E(r*.88,h,a0,a1);g.stroke();
 for(let i=0;i<7;i++){const b=a0+(a1-a0)*(i+.5)/7;circ(q.x+Math.cos(b)*r*.88,q.y-h+Math.sin(b)*r*.88*K-Math.abs(Math.sin(t*12+i))*6*q.s,2.8*q.s,rgba('#e8f6ff',.85*k))}};
JFXD.su_bite=(f,k,e)=>{const q=P(f.x,f.y,34),c=Math.min(1,e*2.2),o=(1-c)*16*q.s,R=20*q.s;g.save();g.translate(q.x,q.y);
 for(const s of[-1,1]){g.fillStyle=rgba('#2a6ab0',.9*k);g.beginPath();g.ellipse(0,s*o,R,R*.45,0,s<0?Math.PI:0,s<0?2*Math.PI:Math.PI);g.fill();
  g.fillStyle=rgba('#ffffff',.95*k);g.beginPath();for(let i=0;i<6;i++){const x=-R*.8+i*R*.32;g.moveTo(x,s*o);g.lineTo(x+R*.16,s*o-s*6*q.s);g.lineTo(x+R*.32,s*o)}g.fill()}
 g.restore();if(e>.45){g.strokeStyle=rgba('#bfe6ff',.8*k);g.lineWidth=2;gEll(f.x,f.y,30*(e+.2));g.stroke()}};
JFXD.su_rise=(f,k,e,t)=>{const q=P(f.x,f.y,0),h=110*Math.sin(Math.PI*Math.min(1,e*1.3))*q.s,w=f.r*.5*q.s,sw=Math.sin(t*9)*6*q.s;g.fillStyle=rgba('#3aa8ff',.7*k);g.beginPath();g.moveTo(q.x-w,q.y);g.quadraticCurveTo(q.x-w*.7,q.y-h*.7,q.x-w*.35+sw,q.y-h);g.quadraticCurveTo(q.x+sw,q.y-h-w*.6,q.x+w*.35+sw,q.y-h);g.quadraticCurveTo(q.x+w*.7,q.y-h*.7,q.x+w,q.y);g.closePath();g.fill();
 for(let i=0;i<5;i++)circ(q.x+sw+(i-2)*w*.3,q.y-h-w*.3-Math.abs(Math.sin(t*14+i))*8*q.s,3*q.s*k,rgba('#ffffff',.85*k));
 g.strokeStyle=rgba('#e8f6ff',.8*k);g.lineWidth=2;g.beginPath();g.moveTo(q.x-w*.3,q.y-4);g.quadraticCurveTo(q.x,q.y-h*.5,q.x+sw,q.y-h+4);g.stroke();
 g.strokeStyle=rgba('#bfe6ff',.7*k);g.beginPath();g.ellipse(q.x,q.y,w*1.6*(.5+e),w*1.6*(.5+e)*K,0,0,7);g.stroke()};
JFXD.su_fall=(f,k,e,t)=>{const q=P(f.x,f.y,0),R=f.r*q.s,T=(f.d||.7)/f.m,top=q.y-900*q.s;
 const col=(w,yb,al)=>{g.fillStyle=rgba('#2a7ad0',.45*al);g.beginPath();g.moveTo(q.x-w*.55,top);g.lineTo(q.x+w*.55,top);g.lineTo(q.x+w,yb);g.lineTo(q.x-w,yb);g.closePath();g.fill();
   g.fillStyle=rgba('#62c4ff',.5*al);g.beginPath();g.moveTo(q.x-w*.25,top);g.lineTo(q.x+w*.3,top);g.lineTo(q.x+w*.55,yb);g.lineTo(q.x-w*.45,yb);g.closePath();g.fill();
   g.strokeStyle=rgba('#e8f6ff',.7*al);g.lineWidth=2;g.setLineDash([22,16]);g.lineDashOffset=-t*900;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(q.x+i*w*.25,top);g.lineTo(q.x+i*w*.42,yb);g.stroke()}g.setLineDash([]);
   g.strokeStyle=rgba('#ffffff',.5*al);g.lineWidth=3;g.beginPath();g.moveTo(q.x-w*.55,top);g.lineTo(q.x-w,yb);g.stroke()};
 if(e<T){const fe=e/T,yf=q.y-(1-fe*fe)*330*q.s,w=R*(.3+.45*fe);g.fillStyle=rgba('#2a7ad0',.18*fe);g.beginPath();g.ellipse(q.x,q.y,R*fe,R*fe*K,0,0,7);g.fill();
  col(w,yf,1);g.fillStyle=rgba('#bfe6ff',.75);g.beginPath();g.ellipse(q.x,yf,w*1.02,w*.3,0,0,7);g.fill(); // front d'écume bouillonnant
  for(let i=0;i<9;i++){const b=i/9*Math.PI*2+t*3;circ(q.x+Math.cos(b)*w*.9,yf+Math.sin(b)*w*.26-Math.abs(Math.sin(t*16+i))*5*q.s,(5+(i%3)*2)*q.s*(1+fe*.6),i%2?'rgba(255,255,255,.92)':'rgba(232,246,255,.85)')}
  for(let i=0;i<6;i++)circ(q.x+(i-2.5)*w*.36,yf-(10+Math.abs(Math.sin(t*18+i))*12)*q.s,2.2*q.s,'rgba(232,246,255,.8)')}
 else{const fe=(e-T)/(1-T),w=R*.7*(1-fe);if(w>1)col(w*.7,q.y,1-fe)}};
DETO.su_fallD=(x,y,r)=>{jx({jfx:'su_splash',x,y,r:r*1.1,t:.7,m:.7});jx({jfx:'su_ring',x,y,r:r*1.35,t:.6,m:.6});jx({jfx:'shock',x,y,r:r*1.2,t:.5,m:.5,col:'#bfe6ff'})};
DETO.su_none=()=>{};
JFXD.su_tidal=(f,k,e,t)=>{const q=P(f.x,f.y,0),r=f.r*(.3+e*.9)*q.s,h=42*Math.sin(Math.PI*Math.min(1,e*1.2))*q.s;
 g.fillStyle=rgba('#2a7ad0',.55*k);g.beginPath();g.ellipse(q.x,q.y,r,r*K,0,0,7);g.ellipse(q.x,q.y-h,r*.88,r*.88*K,0,0,7);g.fill('evenodd');
 g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=3*q.s;g.beginPath();g.ellipse(q.x,q.y-h,r*.88,r*.88*K,0,0,7);g.stroke();
 for(let i=0;i<12;i++){const b=i*.524+t;circ(q.x+Math.cos(b)*r*.88,q.y-h+Math.sin(b)*r*.88*K-Math.abs(Math.sin(t*10+i))*8*q.s,3*q.s,rgba('#e8f6ff',.85*k))}};
JFXD.su_lunge=(f,k,e,t)=>{const m=Math.min(1,e*1.5),d=90*(1-m),q=P(f.x+Math.cos(f.a)*d,f.y+Math.sin(f.a)*d,30+Math.sin(Math.PI*m)*34);
 if(e<.7){g.save();g.translate(q.x,q.y);g.scale(q.s,q.s);su_sharkD(1.5,Math.atan2(-Math.sin(f.a)*K,-Math.cos(f.a)),t*1000,0,0);g.restore()}if(e>.55)JFXD.su_bite(f,Math.min(1,(1-e)/.45),(e-.55)/.45)};
// ---------- gestes 3D ----------
Object.assign(ANIM,{
 // crache : mains en coupe devant la bouche, inspire puis souffle (Teppôdama, Mizurappa)
 su_spit:(P,e,u,t)=>{const T=e*(u.anim?u.anim.m:.4),inh=T<.12,k=inh?T/.12:1;pz(P,'armL',-1.55,0,-.45);pz(P,'foreL',-2.1);pz(P,'armR',-1.55,0,.45);pz(P,'foreR',-2.1);
  pz(P,'chest',inh?-.3*k:.32+Math.sin(t*38)*.03);pz(P,'head',inh?-.3*k:.15);P.root.z=inh?-3*k:3;P.root.y=-1.5;pz(P,'thighR',-.45);pz(P,'shinR',.55);pz(P,'thighL',.3)},
 // déferle : grande inspiration en arrière puis tout le corps pousse la mer devant soi (Bakusui Shôha)
 su_gush:(P,e,u,t)=>{const inh=e<.25,k=inh?e/.25:ezo(Math.min(1,(e-.25)/.2));pz(P,'armL',inh?-.4-1*k:-1.4-.3*k,0,inh?.9*k:.9-.6*k);pz(P,'armR',inh?-.4-1*k:-1.4-.3*k,0,inh?-.9*k:-.9+.6*k);pz(P,'foreL',-.3);pz(P,'foreR',-.3);
  pz(P,'chest',inh?-.45*k:-.45+.95*k);pz(P,'head',inh?-.4*k:.1);P.root.y=inh?2*k:-4;P.root.z=inh?-5*k:8*k;pz(P,'thighR',inh?0:-1*k);pz(P,'shinR',inh?0:1*k);pz(P,'thighL',inh?0:.5*k)},
 // Suijinheki : les bras montent en spirale, le buste tourne avec l'eau
 su_wall:(P,e)=>{const k=ezo(Math.min(1,e/.35));pz(P,'armL',-.6-2.2*k,0,.5+.6*k);pz(P,'armR',-.6-2.2*k,0,-.5-.6*k);pz(P,'foreL',-.4);pz(P,'foreR',-.4);P.rootR.y=Math.sin(e*Math.PI)*.9;pz(P,'head',-.25*k);P.root.y=-3+4*k;
  pz(P,'thighL',-.3,0,.2);pz(P,'thighR',-.3,0,-.2);pz(P,'shinL',.5);pz(P,'shinR',.5)},
 // Suikôdan : les bras s'ouvrent comme des mâchoires puis claquent vers l'avant
 su_shark:(P,e)=>{const k=ezo(Math.min(1,e/.3)),c=e>.45?Math.min(1,(e-.45)/.15):0,op=.6*(1-c);pz(P,'armL',-1.55-op,0,-.1);pz(P,'armR',-1.55+op,0,.1);pz(P,'foreL',-.1);pz(P,'foreR',-.1);
  pz(P,'chest',.35*k);P.root.z=8*k;P.root.y=-3*k;pz(P,'thighR',-.8*k);pz(P,'shinR',.9*k);pz(P,'thighL',.4*k)},
 // Suirô : une main tendue tient la prison, l'autre garde le signe ; le bras tremble sous l'effort
 su_hold:(P,e,u,t)=>{pz(P,'armR',-1.5+Math.sin(t*24)*.04,0,.12);pz(P,'foreR',-.12);pz(P,'armL',-1.1,0,-.5);pz(P,'foreL',-1.9);pz(P,'chest',.15,.25);pz(P,'head',.05,.15);P.root.y=-2.5;
  pz(P,'thighL',-.35,0,.1);pz(P,'shinL',.55);pz(P,'thighR',.25,0,-.1);pz(P,'shinR',.45)},
 // Kirigakure : signe d'une main levé devant le visage, tête baissée
 su_mist:(P,e)=>{const k=Math.min(1,e/.25);pz(P,'armR',-2.2*k,0,.25);pz(P,'foreR',-2.1*k);pz(P,'armL',-.2,0,.35);pz(P,'head',.25*k);pz(P,'chest',.1*k);P.root.y=-1.5*k},
 // dragon : les bras remontent du sol jusqu'au ciel puis lancent le dragon devant
 su_dragon:(P,e)=>{const up=e<.4,k=up?ezo(e/.4):ezo((e-.4)/.6),a=up?.5-3.4*k:-2.9+1.3*k;pz(P,'armL',a,0,-.2);pz(P,'armR',a,0,.2);pz(P,'foreL',-.15);pz(P,'foreR',-.15);
  pz(P,'chest',up?-.35*k:-.35+.7*k);pz(P,'head',up?-.3*k:.1);P.root.y=up?-4+8*k:4-6*k;P.root.z=up?0:9*k;pz(P,'thighR',up?0:-.8*k);pz(P,'shinR',up?0:.9*k)},
 // corps liquide : s'affaisse au ras du sol, bras rejetés en arrière, puis se redresse
 su_melt:(P,e)=>{const k=Math.min(1,e/.15),r=e>.8?(e-.8)/.2:0,m=k*(1-r);P.root.y=-11*m;pz(P,'chest',.85*m);pz(P,'head',-.45*m);pz(P,'armL',.9*m,0,.5*m);pz(P,'armR',.9*m,0,-.5*m);
  pz(P,'thighL',-1*m);pz(P,'shinL',1.7*m);pz(P,'thighR',.5*m);pz(P,'shinR',1.3*m)},
 // dôme des requins : bras grands ouverts levés, le dôme monte
 su_dome:(P,e,u,t)=>{const k=ezo(Math.min(1,e/.35));pz(P,'armL',-.3-2.5*k,0,.9*k+.2);pz(P,'armR',-.3-2.5*k,0,-.9*k-.2);pz(P,'foreL',-.2);pz(P,'foreR',-.2);pz(P,'chest',-.3*k);pz(P,'head',-.35*k);
  P.root.y=-3*k+Math.sin(t*14)*.4;pz(P,'thighL',0,0,.35*k);pz(P,'thighR',0,0,-.35*k)},
});
AFTER.push(()=>UK.push('su_pr')); // bulle de Suirô visible chez les invités

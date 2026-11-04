// ===== Clan Bukijutsuka (maîtres d'armes de Konoha : Tenten) =====
// Un parchemin pour chaque arme ; l'arène se couvre de lames qu'on ramasse. Clan martial : pas de nature ni de familles, arbre de style Bukijutsu imposé,
// arbre de clan à 2 jutsu par rang (les 10 appris), aucun mudra. Trait « Arsenal » : les armes plantées au sol se ramassent et réduisent les recharges.
// Les « N dégâts » des descriptions sont les dégâts de base des mécaniques (avant puissance du ninja et JBAL.d).
KIT('c22',[
 ['D','x.bk_volley','Kunai Rendan : Volée de kunai','3 kunai en éventail : 8 dégâts chacun ; ils restent plantés au sol (armes à ramasser)','kunai'],
 ['D','x.bk_tonfa','Tonfa : Contre','0,7 s : les tonfa bloquent le prochain coup au corps à corps ; l\'attaquant prend 10 dégâts et il est désarmé 0,8 s','kunai'],
 ['C','x.bk_fundo','Fundo : Masse à chaîne','La masse part au bout de sa chaîne (280) et revient : 14 dégâts à l\'aller et au retour, ralentit','chain'],
 ['C','x.bk_heavy','Makimono : Arme lourde','4 s : tes coups de base frappent avec une grande hache (+10 d\'allonge, +25 % de dégâts) ; le 5e coup étourdit 0,5 s','kunai'],
 ['B','x.bk_cage','Kunai Ori : Cage de kunai','8 kunai reliés par un fil se plantent en cercle au point visé (110) : l\'ennemi qui en sort est entravé 0,8 s et prend 16 dégâts','kunai'],
 ['B','x.bk_hammer','Ôtsuchi : Marteau écraseur','Un marteau géant sort du parchemin et s\'abat devant toi 0,4 s après : 30 dégâts, étourdi 0,7 s','kunai'],
 ['A','x.bk_barrage','Buki Shôkan : Arsenal volant','1,2 s : tu lances 12 armes variées vers le curseur (la visée suit) : 4 dégâts chacune ; elles restent au sol','kunai'],
 ['A','x.bk_spin','Kusarigama : Tourbillon','2 s : la faucille tourne autour de toi au bout de sa chaîne (150) en attirant un peu les ennemis : 8 dégâts à chaque passage','chain'],
 ['S','x.bk_soryu','Sôshôryû','Deux parchemins s\'élèvent en dragons jumeaux : une pluie d\'armes s\'abat 1,5 s sur la zone (140) : jusqu\'à 55 dégâts, ralentit ; la zone se couvre d\'armes','kunai'],
 ['S','x.bk_rope','Kôkinjô : Corde d\'or','Lance la corde dorée des Sages (420) : l\'ennemi touché est ligoté 1,4 s, sans jutsu, et subit 30 dégâts ; son chakra fond de 15','gold'],
]);
Object.assign(NATHERO,{bk:'rey'});
// ---------- trait Arsenal : armes au sol ----------
const BK_W=['kunai','tonfa','staff','kama','mace'],BK_TREES=new Set(['c22','t2']);
// ---- VFX (boîte à outils nr_fx.js) : étincelles d'acier, éclats dorés, poussière (décor atténué selon l'intensité / le camp)
function bkHitFx(u,e,a,s){if(!e||!near(e.x,e.y))return;fxFlare(e.x,e.y,'#fff4d8',{u,z:32,r:16*s,t:.15,rot:a});fxBurst(e.x,e.y,'#ffd36a',{u,n:6*s,sp:260*s,c2:'#ffffff',a,arc:1.6,w:1.5,len:.14,z:30,gr:80})}
function bkPuff(u,x,y,s){fxSmoke(x,y,{u,col:'#e8e0d0',n:5*s,r:18*s,s:12*s,al:.28,rise:30,z:30,t:.7});fxFlare(x,y,'#fff4d8',{u,z:40,r:18*s,t:.18,star:0})} // invocation d'un rouleau : « pouf »
// pose une arme au sol (Bukijutsuka seulement), 4 au plus par ninja : la plus ancienne disparaît
function bkDrop(u,x,y,k){if(!u||u.dead||u.ch.clan!==BUKI)return;x=clamp(x,B.x+16,B.x+B.w-16);y=clamp(y,B.y+16,B.y+B.h-16);const L=aux.filter(o=>o.type==='bk_wpn'&&o.owner===u&&o.t>0);if(L.length>=4)L[0].t=0;
 aux.push({type:'bk_wpn',x,y,r:14,t:6,m:6,team:u.team,owner:u,ui:stI(u),k:(k==null?Math.floor(rnd()*5):k)%5,a:rnd()*6.28})}
// ramasser : chaque arme réduit de 4 s réelles la recharge des jutsu d'armes (barre et réserve ; 0,8 s avant les recharges longues, ×5 comme elles)
function bkPick(u){for(let i=BAR0;i<BAR0+BARN;i++){const ab=u.ch.abil[i];if(ab&&BK_TREES.has(ab.tree))u.cds[i]=Math.max(0,u.cds[i]-rtIn(4))} // 4 s réelles (temps réel, nr_flow.js)
 if(u.cst)for(const j in u.cst){const J=JL[j];if(J&&BK_TREES.has(J.cat))u.cst[j]=Math.max(0,u.cst[j]-rtIn(4))}say(u,'+1 ARME','#ffd36a');S('saber',u)}
AUXF.bk_wpn=x=>{const u=x.owner;if(!u||u.dead){x.t=0;return}if(x.m-x.t<.35)return;if(Math.hypot(u.x-x.x,u.y-x.y)<u.r+20){x.t=0;bkPick(u);sparks(x.x,x.y,'#ffd36a',8)}};
AUXD.bk_wpn=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,al=Math.min(1,x.t/.8),dz=Math.max(0,1-(x.m-x.t)/.15)*60;g.save();g.globalAlpha=al;g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(q.x,q.y,10*s,4*s,0,0,7);g.fill();
 const p=P(x.x,x.y,10+dz);g.translate(p.x,p.y);g.rotate(-1.57+Math.sin(x.a)*.35);bukWeapon(BK_W[x.k|0],s*.75);g.restore();
 if(x.t>.8&&(t*2+x.a)%1<.15){g.save();g.globalCompositeOperation='lighter';circ(p.x+3*s,p.y-12*s,2.5*s,rgba('#fff8d0',.9));g.restore()}};
// suit un projectile ; à sa fin, l'arme se plante là où il s'est arrêté
function bkTrack(u,k){const p=projs[projs.length-1];if(p&&u.ch.clan===BUKI)aux.push({type:'bk_trk',x:p.x,y:p.y,r:0,t:3,m:3,team:u.team,owner:u,p,k})}
AUXF.bk_trk=x=>{const p=x.p;if(!p){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.t=0;bkDrop(x.owner,x.x,x.y,x.k)};
TRAITS[BUKI]={nom:'Arsenal',desc:'Tes jutsu d\'armes laissent des armes plantées au sol (6 s, 4 au plus). Passer dessus les ramasse : chaque arme réduit de 4 s réelles la recharge de tes jutsu d\'armes (barre et réserve).',
 init(u){u.bk_w=1;u.bk_axe=0;u.bk_ton=0},
 update(u,dt){if(u.bk_cds!==u.cds){if(u.bk_cds){u.bk_axe=0;u.bk_ton=0}u.bk_cds=u.cds}if(u.bk_axe>0)u.bk_axe=Math.max(0,u.bk_axe-dt);if(u.bk_ton>0)u.bk_ton=Math.max(0,u.bk_ton-dt)},
 take(t,src,dmg,o){if(!src||src===t||src.team===t.team||!o.melee||o.silent)return dmg;
  if(t.bk_ton>0){t.bk_ton=0;src.disarm=Math.max(src.disarm||0,.8);say(t,'CONTRE','#ffd36a');say(src,'DÉSARMÉ','#ffb03a');S('deflect',t);sparks(t.x,t.y,'#e8d0a8',6);fxFlare(t.x,t.y,'#ffffff',{u:t,z:34,r:26,t:.18});fxBurst(t.x,t.y,'#ffd36a',{u:t,n:10,sp:280,c2:'#ffffff',z:34,w:1.5});
   later(t,.05,()=>{if(!src.dead&&!t.dead&&dist(t,src)<160){hit(src,t,10,{melee:1,unblockable:1});jx({jfx:'buk_wsw',ui:stI(t),x:t.x,y:t.y,a:ang(t,src),w:'tonfa',d:1,t:.22,m:.22})}});return -1}return dmg},
 draw(u,p,S,sk){if(u.bk_axe>0){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffd36a',.35+.2*Math.sin(performance.now()/90));g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,24*S,8*S,0,0,7);g.stroke();g.restore()}
  if(u.bk_ton>0){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(232,208,168,.8)';g.lineWidth=3*S;g.beginPath();g.ellipse(p.x+Math.cos(u.aim)*14*S,p.y-34*S*sk,10*S,26*S*sk,0,0,7);g.stroke();g.restore()}},
 hud(u,x,y){const n=aux.filter(o=>o.type==='bk_wpn'&&o.owner===u&&o.t>0).length,X=x+368,Y=y-56;text('ARSENAL : '+n+' arme'+(n>1?'s':'')+' au sol',X,Y+8,11,n?'#ffd36a':'#a8987a','left');
  for(let i=0;i<4;i++){g.fillStyle=i<n?'#ffd36a':'rgba(0,0,0,.5)';g.fillRect(X+i*14,Y+14,11,5)}},
 prev(u,p,S,front){}};
AFTER.push(()=>UK.push('bk_w','bk_axe','bk_ton'));
// apparence du clan : les deux grands rouleaux de Tenten dans le dos (si rien n'y est porté)
CLOOK[BUKI]=(look)=>{if(!look.back&&!look.gourd)look.back='rouleaux';look.head.eye=look.head.eye||'#6a4a2a'};
// ---------- mécaniques ----------
Object.assign(NAT,{
 bk_volley:S_('Kunai Rendan : Volée de kunai','',4,{line:{len:450,w:60},ai:RG(430,.7)},(u,a)=>{anim(u,'throw2',.3);S('blaster',u);u.thrT=.2;
  for(const d of[-.2,0,.2]){proj(u,a+d,{spd:950,r:7,dmg:8,life:.48,col:'#d8dde6',kind:'bk_kunai',onHit:(p,e)=>bkHitFx(p.owner,e,Math.atan2(p.vy,p.vx),.7)});bkTrack(u,0)}fxFlare(u.x+Math.cos(a)*24,u.y+Math.sin(a)*24,'#ffffff',{u,z:36,r:14,t:.12,rot:a})}),
 bk_tonfa:S_('Tonfa : Contre','',6,{ai:DEF},(u)=>{u.bk_ton=.7;anim(u,'kj_guard',.6);S('deflect',u);say(u,'GARDE','#e8d0a8');fxFlare(u.x+Math.cos(u.aim)*16,u.y+Math.sin(u.aim)*16,'#e8d0a8',{u,z:34,r:20,t:.2,star:0});fxRing(u.x,u.y,{u,r0:34,r1:16,col:'#e8d0a8',w:3,t:.25})}),
 bk_fundo:S_('Fundo : Masse à chaîne','',8,{line:{len:280,w:30},ai:RG(270,.6)},(u,a)=>{anim(u,'throw2',.35);S('heavy',u);u.thrT=.2;
  proj(u,a,{spd:700,r:13,dmg:14,life:2,col:'#9aa4b4',ret:280,pierce:1,kind:'bk_mace',o:{slow:.8},onHit:(p,e)=>{bkHitFx(p.owner,e,Math.atan2(p.vy,p.vx),1);fxDebris(e.x,e.y,{u:p.owner,n:3,sp:100,col:'#9aa4b4',c2:'#5a6070',s:2.5})}});aux.push({type:'buk_chain',x:u.x,y:u.y,r:0,t:2.2,m:2.2,team:u.team,owner:u,ui:stI(u),p:projs[projs.length-1]})}),
 bk_heavy:S_('Makimono : Arme lourde','',10,{ai:SELF(150,.6)},(u)=>{u.bk_axe=4;anim(u,'summon',.4);S('poof',u);say(u,'ARME LOURDE','#ffd36a');jx({jfx:'bk_scroll',ui:stI(u),x:u.x,y:u.y,t:.6,m:.6});bkPuff(u,u.x,u.y,1);fxRing(u.x,u.y,{u,r0:10,r1:50,col:'#ffd36a',w:4,t:.3})}),
 bk_cage:S_('Kunai Ori : Cage de kunai','',11,{tele:{r:110,max:380},ai:RG(380,.6)},(u,a,td)=>{const p=atP(u,a,td,380);anim(u,'throw2',.4);S('blaster',u);u.thrT=.2;
  const ins=new Set(enemies(u).filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<110));aux.push({type:'bk_cage',x:p.x,y:p.y,r:110,t:4,m:4,team:u.team,owner:u,ins,done:new Set(),k:0});jx({jfx:'bk_fly8',x:u.x,y:u.y,x2:p.x,y2:p.y,t:.25,m:.25});
  later(u,.25,()=>{fxRing(p.x,p.y,{u,r0:20,r1:110,col:'#e8eef6',c2:'#ffffff',w:4,t:.35});for(let i=0;i<8;i++){const b=i*.785+.2;fxFlare(p.x+Math.cos(b)*110,p.y+Math.sin(b)*110,'#e8eef6',{u,z:8,r:10,t:.16,star:0})}})}),
 bk_hammer:S_('Ôtsuchi : Marteau écraseur','',11,{line:{len:150,w:170},ai:RG(130,.65)},(u,a)=>{const p=fwd(u,a,85);anim(u,'kj_hammer',.6);S('poof',u);S('heavy',u);const D=tjLock(u,.5);
  jx({jfx:'bk_hammer',x:p.x,y:p.y,a,t:.62,m:.62});bkPuff(u,u.x,u.y,.8);later(u,.4,()=>{if(u.dead)return;for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<85+e.r&&hit(e,u,30,{melee:1,stun:.7,unblockable:1,fx:p.x,fy:p.y}))fxHitStop(u,e,30,1);
   jx({jfx:'tj_crater',x:p.x,y:p.y,r:85,t:.9,m:.9});jx({jfx:'shock',x:p.x,y:p.y,r:85,t:.4,m:.4,col:'#e8d0a8'});fxRing(p.x,p.y,{u,r0:14,r1:85,col:'#e8d0a8',c2:'#ffffff',w:8,t:.35});fxDebris(p.x,p.y,{u,n:12,sp:220,col:'#a07850',c2:'#5a4028',s:4.5});fxSmoke(p.x,p.y,{u,col:'#a08a70',n:7,r:60,s:15,al:.24,rise:26,t:1.1});fxDecal(p.x,p.y,'crack',{u,r:80,t:4.5});fxFlare(p.x,p.y,'#fff4d8',{u,z:20,r:34,t:.22});bkDrop(u,p.x,p.y,4);if(near(p.x,p.y)){S('boom',u);S('rock',u);shake=Math.max(shake,.35)}},{x:p.x,y:p.y,r:85})}),
 bk_barrage:S_('Buki Shôkan : Arsenal volant','',13,{line:{len:420,w:90},ai:RG(400,.7)},(u)=>{const D=tjLock(u,1.25);anim(u,'bk_barrage',1.2);let n=0;jx({jfx:'bk_scroll',ui:stI(u),x:u.x,y:u.y,t:1.2,m:1.2,big:1});
  bkPuff(u,u.x,u.y,1.2);fxGlyph(u.x,u.y,'#ffd36a',{ui:stI(u),u,r:46,t:1.25,al:.5});
  seqs.push({owner:u,n:12,t:.02,iv:.1,vfx:'kunai',f:o=>{if(o.dash!==D||o.stun>0)return;const p=tjCur(o,420),b=ang(o,p)+(rnd()-.5)*.18,k=n++%5;o.aim=ang(o,p);S('blaster',o);
   proj(o,b,{spd:980,r:8,dmg:4,life:.48,col:'#d8dde6',kind:'bk_wpnp',bk:k,onHit:(p,e)=>bkHitFx(p.owner,e,Math.atan2(p.vy,p.vx),.7)});if(n%3===1)fxFlare(o.x+Math.cos(b)*22,o.y+Math.sin(b)*22,'#fff4d8',{u:o,z:40,r:14,t:.12,star:0});if(n>8)bkTrack(o,k)}})}),
 bk_spin:S_('Kusarigama : Tourbillon','',14,{ai:SELF(170,.65)},(u,a)=>{anim(u,'buk_twirl',2);S('wind',u);aux.push({type:'bk_spin',x:u.x,y:u.y,a,r:150,t:2,m:2,team:u.team,owner:u,ui:stI(u),hs:new Map()});fxWind(u.x,u.y,0,{u,spin:1,w:150,n:8,col:'#e8eef6',t:.6});fxSmoke(u.x,u.y,{u,col:'#c8b8a0',n:5,r:130,s:12,al:.2,rise:8,t:.8})}),
 bk_soryu:S_('Sôshôryû','',21,{tele:{r:140,max:420},ai:RG(420,.7)},(u,a,td)=>{const p=atP(u,a,td,420);anim(u,'bk_soryu',1.1);S('wind',u);S('poof',u);u.root=Math.max(u.root,.45);
  jx({jfx:'bk_twin',ui:stI(u),x:u.x,y:u.y,x2:p.x,y2:p.y,t:1.95,m:1.95});bkPuff(u,u.x-30,u.y,1);bkPuff(u,u.x+30,u.y,1);fxPillar(u.x,u.y,'#ffd36a',{u,h:220,w:24,t:.6,al:.35});aux.push({type:'bk_soryu',x:p.x,y:p.y,r:140,t:1.95,m:1.95,team:u.team,owner:u,k:.45,n:0,danger:1})}),
 bk_rope:S_('Kôkinjô : Corde d\'or','',22,{line:{len:420,w:24},ai:RG(410,.65)},(u,a)=>{anim(u,'throw2',.4);S('blaster',u);u.thrT=.2;
  proj(u,a,{spd:900,r:11,dmg:30,life:.47,col:'#ffd36a',kind:'bk_rope',o:{root:1.4,silence:1.4,unblockable:1},onHit:(p,t)=>{if(t.dead)return;t.energy=Math.max(0,(t.energy||0)-15);say(t,'LIGOTÉ','#ffd36a');bkHitFx(p.owner,t,Math.atan2(p.vy,p.vx),1.3);fxRing(t.x,t.y,{u:p.owner,r0:50,r1:14,col:'#ffd36a',c2:'#fff4d8',w:4,t:.4});fxLight(t.x,t.y,80,'#ffd36a',{u:p.owner,t:.4,a:.35});fxHitStop(p.owner,t,30,1);jx({jfx:'bk_bind',ti:stI(t),x:t.x,y:t.y,t:1.4,m:1.4})}});
  aux.push({type:'bk_gchain',x:u.x,y:u.y,r:0,t:.55,m:.55,team:u.team,owner:u,ui:stI(u),p:projs[projs.length-1]})}),
 // dash du clan (Espace) : Kunai-grappin — on se tire au point d'impact (devant l'ennemi touché) ; le kunai reste planté
 bk_grap:S_('Kunai-grappin','',6,{ai:{mode:'gap',min:150,max:300,p:.45}},(u,a)=>{u.thrT=.2;S('blaster',u);anim(u,'throw2',.25);
  proj(u,a,{spd:1000,r:8,dmg:4,life:.3,col:'#d8dde6',hook:3,kind:'bk_kunai',onHit:(p,t)=>{const o=p.owner;if(o.dead||t.dead||o.stun>0||o.root>0)return;const b=Math.atan2(o.y-t.y,o.x-t.x),q={x:t.x+Math.cos(b)*(o.r+t.r+6),y:t.y+Math.sin(b)*(o.r+t.r+6)};
   o.dash={sx:o.x,sy:o.y,tx:clamp(q.x,B.x+o.r,B.x+B.w-o.r),ty:clamp(q.y,B.y+o.r,B.y+B.h-o.r),t:0,dur:.2,jump:22,hitDone:false};o.cast=null;bkDrop(o,t.x+Math.cos(b+1.6)*30,t.y+Math.sin(b+1.6)*30,0)}});
  const pr=projs[projs.length-1];aux.push({type:'bk_grapk',x:u.x,y:u.y,r:0,t:.6,m:.6,team:u.team,owner:u,ui:stI(u),p:pr});fxFlare(u.x+Math.cos(a)*22,u.y+Math.sin(a)*22,'#ffffff',{u,z:36,r:12,t:.12,rot:a})}),
});
DASHC[BUKI]={src:'x.bk_grap',n:'Kunai-grappin',d:'Kunai à fil (300) : tu te tires jusqu\'au point d\'impact, ou devant l\'ennemi touché ; le kunai reste planté (arme à ramasser)',vfx:'kunai',cd:6};
// ---------- logique des objets ----------
// grappin : sans cible touchée, on se tire au point d'arrivée du kunai
AUXF.bk_grapk=x=>{const p=x.p,o=x.owner;if(!p){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}if(x.done)return;x.done=1;x.t=.18;if(p.hitAny||!o||o.dead||o.stun>0||o.root>0||o.dash)return;
 const q={x:clamp(p.x,B.x+o.r,B.x+B.w-o.r),y:clamp(p.y,B.y+o.r,B.y+B.h-o.r)};o.dash={sx:o.x,sy:o.y,tx:q.x,ty:q.y,t:0,dur:.22,jump:20,hitDone:false};o.cast=null;bkDrop(o,q.x,q.y,0);fxBurst(q.x,q.y,'#e8eef6',{u:o,n:5,sp:120,z:10,c2:'#ffffff'});fxSmoke(o.x,o.y,{u:o,col:'#c8b8a0',n:3,r:12,s:10,al:.22})};
AUXD.bk_grapk=(x,k)=>{const u=units[x.ui];if(!u||u.dead)return;const a=P(u.x,u.y,30),b=P(x.x,x.y,24);g.strokeStyle=rgba('#e8eef6',.8*Math.min(1,k*3));g.lineWidth=1.2;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()};
// Cage de kunai : l'ennemi qui sort du cercle est entravé
AUXF.bk_cage=(x,dt)=>{const u=x.owner;for(const e of enemies(u)){if(x.done.has(e))continue;const d=Math.hypot(e.x-x.x,e.y-x.y);if(d<x.r)x.ins.add(e);else if(x.ins.has(e)&&d>x.r+e.r*.4){x.done.add(e);x.ins.delete(e);
  if(hit(e,u,16,{root:.8,unblockable:1})){say(e,'PRIS AU FIL','#e8eef6');bkHitFx(u,e,Math.atan2(e.y-x.y,e.x-x.x),1);jx({jfx:'bk_snap',x:e.x,y:e.y,a:Math.atan2(e.y-x.y,e.x-x.x),t:.5,m:.5})}}}
 if(x.t<=dt*1.01&&!x.fin){x.fin=1;for(let i=0;i<4;i++){const b=i*1.57+.4;bkDrop(u,x.x+Math.cos(b)*x.r,x.y+Math.sin(b)*x.r,0)}}};
AUXD.bk_cage=(x,k,t)=>{const al=Math.min(1,x.t/.4,(x.m-x.t)/.15),pts=[];for(let i=0;i<8;i++){const b=i*.785+.2;pts.push(P(x.x+Math.cos(b)*x.r,x.y+Math.sin(b)*x.r,0))}g.save();g.globalAlpha=al;
 g.strokeStyle=rgba('#e8eef6',.75);g.lineWidth=1.4;g.beginPath();for(let i=0;i<=8;i++){const p=pts[i%8];i?g.lineTo(p.x,p.y-10*p.s):g.moveTo(p.x,p.y-10*p.s)}g.stroke();
 g.strokeStyle=rgba('#ffffff',.25+.2*Math.sin(t*8));g.lineWidth=1;g.beginPath();for(let i=0;i<=8;i++){const p=pts[i%8];i?g.lineTo(p.x,p.y-20*p.s):g.moveTo(p.x,p.y-20*p.s)}g.stroke();
 for(const p of pts){g.save();g.translate(p.x,p.y-6*p.s);g.rotate(-1.57);bukWeapon('kunai',p.s*.8);g.restore()}g.restore()};
// Kusarigama : Tourbillon : la faucille tourne au bout de sa chaîne, frappe à chaque passage (0,25 s au plus par cible), attire un peu
AUXF.bk_spin=(x,dt)=>{const u=x.owner;if(u.dead||u.stun>0){x.t=0;return}x.a+=dt*9;const sx=u.x+Math.cos(x.a)*x.r,sy=u.y+Math.sin(x.a)*x.r;x.x=u.x;x.y=u.y;x.sx=sx;x.sy=sy;
 for(const e of enemies(u)){const d=dist(u,e);if(d<x.r+40&&e.unstop<=0&&!(e.root>0)){const b=ang(e,u);e.x+=Math.cos(b)*45*dt;e.y+=Math.sin(b)*45*dt}
  if(d<x.r+e.r+30&&angDiff(ang(u,e),x.a)<.4+e.r/Math.max(40,d)&&!(SIMT-(x.hs.get(e)||-9)<.25)){x.hs.set(e,SIMT);if(hit(e,u,8,{melee:1}))sparks(e.x,e.y,'#e8eef6',5)}}
 for(const p of projs)if(!p.dead&&p.life>0&&p.owner.team!==u.team&&!p.rocket&&Math.hypot(p.x-sx,p.y-sy)<26+p.r){p.life=0;p.dead=1;sparks(p.x,p.y,'#e8eef6',5)}};
AUXD.bk_spin=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const b=t*9+x.m,c=P(u.x,u.y,30),q=P(u.x+Math.cos(b)*x.r,u.y+Math.sin(b)*x.r,26),s=q.s;g.save();g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#e8eef6',.18);g.lineWidth=12*s;g.beginPath();g.ellipse(c.x,c.y+4*s,x.r*s,x.r*s*K,0,b-1.2,b);g.stroke();g.restore();
 g.strokeStyle='#9aa4b4';g.lineWidth=1.8*s;g.setLineDash([3*s,2*s]);g.beginPath();g.moveTo(c.x,c.y);g.lineTo(q.x,q.y);g.stroke();g.setLineDash([]);g.save();g.translate(q.x,q.y);g.rotate(b+1.57);bukWeapon('kama',s);g.restore()};
// Sôshôryû : pluie d'armes (après 0,45 s d'alerte) : 10 vagues de 5,5 dégâts ; à la fin, 4 armes au sol
AUXF.bk_soryu=(x,dt)=>{const u=x.owner;x.k-=dt;if(x.k>0||x.n>=10)return;x.k=.15;x.n++;const V=VFX;VFX='kunai';for(const e of enemies(u))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r&&hit(e,u,5.5,{slow:.5,unblockable:1,silent:x.n%2?0:1})&&x.n%3===0)bkHitFx(u,e,1.57,.6);VFX=V;
 if(x.n%2){const b=rnd()*6.28,d=Math.sqrt(rnd())*x.r;fxBurst(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,'#ffd36a',{u,n:5,sp:140,c2:'#ffffff',z:4,up:60,gr:200,w:1.4})}
 if(x.n===10){fxRing(x.x,x.y,{u,r0:20,r1:x.r,col:'#ffd36a',c2:'#ffffff',w:7,t:.4});fxDebris(x.x,x.y,{u,n:10,sp:180,col:'#a07850',c2:'#5a4028',s:3.5});fxDecal(x.x,x.y,'crack',{u,r:x.r*.8,t:4});fxLight(x.x,x.y,x.r*1.1,'#ffd36a',{u,t:.4,a:.35});fxShake(.25,x.x,x.y)}
 if(near(x.x,x.y)&&x.n%2)S('saber',x);if(x.n===10){for(let i=0;i<4;i++){const b=i*1.57+rnd(),d=30+rnd()*90;bkDrop(u,x.x+Math.cos(b)*d,x.y+Math.sin(b)*d)}if(near(x.x,x.y))shake=Math.max(shake,.2)}};
AUXD.bk_soryu=(x,k,t)=>{const el=x.m-x.t;fxTele(x.x,x.y,x.r,Math.min(1,el/.45),'#ffd36a',x,el<.45?.08+.12*el/.45:.12);if(el<.3)return;fxAlpha(fxA(x),()=>bkSoryuD(x,k,t))};
function bkSoryuD(x,k,t){const el=x.m-x.t,q=P(x.x,x.y,0),R=x.r*q.s;if(el>=.3){bkRain(x,k,t,el);return}g.save();g.strokeStyle=rgba('#ffd36a',.6);g.lineWidth=2;g.setLineDash([10,7]);g.lineDashOffset=-t*30;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.stroke();g.setLineDash([]);
 g.fillStyle=rgba('#ffd36a',el<.45?.08+.12*el/.45:.12);g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,7);g.fill();g.restore()}
function bkRain(x,k,t,el){const n=fxN(16,x);for(let i=0;i<n;i++){const ph=((t*2.2+i*.137)%1),b=i*2.4,d=x.r*((i*53)%17)/17,wx=x.x+Math.cos(b)*d,wy=x.y+Math.sin(b)*d,p=P(wx,wy,(1-ph)*240);g.save();g.globalAlpha=Math.min(1,k*3);g.translate(p.x,p.y);g.rotate(1.57);bukWeapon(BK_W[i%5],p.s*.8);g.restore();
  if(ph>.9){const gq=P(wx,wy,0);g.fillStyle=rgba('#d8c8a8',.5);g.beginPath();g.ellipse(gq.x,gq.y,7*gq.s,3*gq.s,0,0,7);g.fill();fxGlowS(gq.x,gq.y,8*gq.s,'#ffd36a',.5)}}}
// chaîne dorée de la corde
AUXF.bk_gchain=AUXF.buk_chain;AUXD.bk_gchain=(x,k)=>{const u=units[x.ui];if(!u||u.dead)return;const a=P(u.x,u.y,30),b=P(x.x,x.y,26);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffd36a',.85*Math.min(1,x.t/.12));g.lineWidth=2.6*a.s;
 g.beginPath();g.moveTo(a.x,a.y);g.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2-10*a.s,b.x,b.y);g.stroke();g.restore()};
// ---------- attaques de base ----------
// Arsenal changeant (style propre du clan) : une arme différente à chaque coup (kunai, tonfa, bâton, faucille, masse) ; Arme lourde : hache
STYLES.push(['Arsenal changeant','Une arme différente à chaque coup : kunai, tonfa, bâton, faucille, puis masse ; le bâton porte loin (allonge 120), la masse du 5e coup étourdit et laisse une arme au sol','x.bk_style','kunai','kunai',[BUKI],1.12,1.07,'buki']);
// armes des sans-clan (arbre Bukijutsu)
STYLES.push(['Bô','Bâton long à deux mains, la meilleure allonge ; 3e coup : balayage tout autour ; 4e : poussée qui repousse ; 5e : frappe d\'en haut','x.st_bo','tai','staff',[-1],1.12,1.07,'buki']);
STYLES.push(['Kusarigama','Faucille et chaîne ; 1er et 2e coups : taillades ; 3e : la chaîne fouette droit devant (allonge 125) ; 4e : balayage large ; 5e : la chaîne s\'enroule (ralenti 1 s)','x.st_kama','chain','kama',[-1],1.12,1.07,'buki']);
STYLES.push(['Tonfa','Deux tonfa, les coups les plus rapides ; chaque coup frappe deux fois ; 4e : moulinet qui pare le prochain coup ; 5e : double frappe','x.st_tonfa','tai','tonfa',[-1],1.12,1.07,'buki']);
Object.assign(NAT,{
 bk_style:SP('Arsenal changeant','',.32,{hero:'rey',melee:1,ai:{max:96,p:1}},(u,a)=>{const c=stC(u),hv=u.bk_axe>0,T=[0,[86,1.6,9,.32],[82,1.8,10,.34],[120,1.4,11,.44],[104,2.2,11,.42],[92,2,14,.66]][c],w=hv?'axe':BK_W[c-1];u.bk_w=c;
  if(c===5){stLunge(u,a,36);S('heavy',u)}let drop=c===5;
  stMelee(u,a,T[0]+(hv?10:0),T[1],T[2]*(hv?1.25:1),hv&&c===5?{stun:.5}:{},null,e=>{if(drop){drop=false;bkDrop(u,e.x+Math.cos(a)*24,e.y+Math.sin(a)*24,4)}});
  jx({jfx:'buk_wsw',ui:stI(u),x:u.x,y:u.y,a,w,d:c%2?-1:1,t:.24,m:.24});kenArc(u,a,T[0]+(hv?10:0),T[1],{d:c%2?-1:1,z:c===3?14:30,th:c===5?12:6,c:'#f0e0c0',c2:hv?'#ffd36a':'#a87a3a',blade:c===1,rr:.85,t:.24,m:.24});
  stCd(u,T[3]);anim(u,'st_kun'+c,c===4?.36:.28)}),
 st_bo:SP('Bô','',.42,{hero:'rey',melee:1,ai:{max:118,p:1}},(u,a)=>{const c=stC(u),T=[0,[112,1.5,10,.42],[112,1.5,10,.42],[104,6.3,10,.5],[126,.6,11,.44],[118,1.2,13,.64]][c],W='#e0c8a0';
  stMelee(u,a,T[0],T[1],T[2],c===4?{kb:150}:{},[0,{d:-1,tl:.5,z:34,th:6,c:W,c2:'#8a5a2a'},{d:1,tl:-.5,z:34,th:6,c:W,c2:'#8a5a2a'},{d:-1,z:12,th:8,c:W,c2:'#8a5a2a',rr:.85},{jfx:'st_thrust',z:30,c:W,w2:4},{d:-1,tl:1.4,z:40,th:9,c:'#fff0d0',c2:'#c88a3a',rr:.8}][c]);
  if(c===3)S('wind',u);if(c===5)jx({jfx:'tj_impact',x:fwd(u,a,100).x,y:fwd(u,a,100).y,a,t:.3,m:.3});stCd(u,T[3]);anim(u,'st_bo'+c,c===3?.36:.3)}),
 st_kama:SP('Kusarigama','',.38,{hero:'rey',melee:1,ai:{max:120,p:1}},(u,a)=>{const c=stC(u),T=[0,[86,1.7,10,.36],[86,1.7,10,.36],[125,.6,10,.46],[110,2.4,11,.46],[118,.8,12,.62]][c],K0='#e4e8ee';
  stMelee(u,a,T[0],T[1],T[2],c===5?{slow:1}:{},c<3?[0,{d:-1,tl:.6,z:34,th:5,c:K0,blade:1},{d:1,tl:-.6,z:34,th:5,c:K0,blade:1}][c]:c===4?{d:-1,z:22,th:6,c:K0,c2:'#9aa4b4',blade:1,rr:.9}:null,e=>{if(c===5)jx({jfx:'st_wrap',ti:stI(e),x:e.x,y:e.y,t:.6,m:.6})});
  if(c===3||c===5){jx({jfx:'st_lash',ui:stI(u),x:u.x,y:u.y,a,R:T[0],w:0,d:-1,kind:'chain',t:.3,m:.3});S('blaster',u)}stCd(u,T[3]);anim(u,'st_chn'+c,c===5?.36:.28)}),
 st_tonfa:SP('Tonfa','',.28,{hero:'rey',melee:1,ai:{max:84,p:1}},(u,a)=>{const c=stC(u),T=[0,[76,1.7,10,.28],[76,1.7,10,.28],[78,1.8,10,.3],[78,2.4,10,.34],[84,2,12,.5]][c],W='#d8c0a0';
  stMelee(u,a,T[0],T[1],T[2]*.55,{},[0,{jfx:'st_line',off:-6,z:34,c:W},{jfx:'st_line',off:6,z:34,c:W},{d:1,tl:1.2,z:30,th:7,c:W,c2:'#6a4a2a',rr:.7},{d:-1,z:26,th:8,c:W,c2:'#6a4a2a',rr:.75,x2:1},{jfx:'st_line',n:2,z:32,c:W,burst:1}][c],e=>{
   later(u,.07,()=>{if(!e.dead&&!u.dead&&dist(u,e)<T[0]+e.r+20)hit(e,u,T[2]*.45,{melee:1,silent:1})})});
  if(c===4)u.parry=Math.max(u.parry||0,.3);stCd(u,T[3]);anim(u,'st_ton'+c,.26)}),
});
// ---------- animations ----------
Object.assign(ANIM,{
 // Bô : taille, revers, tour complet bas, estoc, frappe d'en haut
 st_bo1:stAS('R',-.4,1.9,.2,1.25),st_bo2:stAS('R',1.9,-.5,.15,1.25),st_bo3:stASpin(-1,1.4),st_bo4:stALunge('R'),st_bo5:stAOver('R'),
 // Tonfa : directs alternés, crochet, moulinet, double frappe
 st_ton1:stAJ('R',0,-.9),st_ton2:stAJ('L',0,-.9),st_ton3:stAS('R',-.3,1.6,.2),st_ton4:stASpin(1,1.2),st_ton5:stATwo(-.9,.35,.2),
 // Marteau écraseur : deux mains au-dessus de la tête, puis abattues
 kj_hammer:(P,e)=>{if(e<.55){const k=ezo(e/.55);pz(P,'armR',-3*k,0,-.2);pz(P,'armL',-3*k,0,.2);pz(P,'chest',-.3*k);P.root.y=2*k}else{const k=ezo(Math.min(1,(e-.55)/.15));pz(P,'armR',-3+1.7*k,0,-.2);pz(P,'armL',-3+1.7*k,0,.2);pz(P,'chest',-.3+.9*k);P.root.y=-8*k;pz(P,'thighL',-.8*k);pz(P,'shinL',1.2*k);pz(P,'thighR',.4*k);pz(P,'shinR',.8*k)}},
 // Arsenal volant : bras qui lancent tour à tour
 bk_barrage:(P,e,u,t)=>{const n=t*20,x=Math.sin(n*Math.PI),R=(n|0)%2===0,s=R?'R':'L',o=R?'L':'R';pz(P,'arm'+s,-2.4+1.4*x,0,R?-.3:.3);pz(P,'fore'+s,-.3);pz(P,'arm'+o,-.8,0,R?.4:-.4);pz(P,'chest',.1,(R?.3:-.3)*x);P.root.y=-2},
 // Sôshôryû : saut, les deux parchemins déroulés au-dessus de soi
 bk_soryu:(P,e)=>{const k=bump(Math.min(1,e*1.2));P.root.y=10*k;pz(P,'armL',-2.8*k,0,.5);pz(P,'armR',-2.8*k,0,-.5);pz(P,'chest',-.3*k);pz(P,'thighL',-.8*k);pz(P,'shinL',1.4*k);pz(P,'thighR',-.3*k);pz(P,'shinR',1*k)},
});
// ---------- visuels ----------
PROJD.bk_kunai=(p,R,ra)=>{g.rotate(ra);bukWeapon('kunai',R*.18)};
PROJD.bk_wpnp=(p,R,ra,t)=>{g.rotate(ra+(p.bk===2||p.bk===4?t/40:0));bukWeapon(BK_W[p.bk|0],R*.14)};
PROJD.bk_mace=(p,R,ra,t)=>{g.rotate(t/60);circ(0,0,R*.75,'#5a5f6a');g.fillStyle='#c8ccd4';for(let i=0;i<8;i++){const b=i*.785;g.beginPath();g.moveTo(Math.cos(b)*R*.6,Math.sin(b)*R*.6);g.lineTo(Math.cos(b)*R*1.25,Math.sin(b)*R*1.25);g.lineTo(Math.cos(b+.35)*R*.6,Math.sin(b+.35)*R*.6);g.fill()}};
PROJD.bk_rope=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffd36a',.9);g.lineWidth=R*.5;g.beginPath();for(let i=0;i<=10;i++){const x=-i*R*.5,y=Math.sin(i*1.3-t/30)*R*.6;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();
 circ(R*.2,0,R*.7,'#fff0b0')};
// parchemin d'invocation (Arme lourde, Arsenal volant)
JFXD.bk_scroll=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,f.big?70:50),s=q.s,w=(f.big?40:26)*s*Math.min(1,e*5);g.save();g.fillStyle='#f0e6cc';g.strokeStyle='#8a3a2a';g.lineWidth=1.5;g.beginPath();g.rect(q.x-w,q.y-6*s,w*2,12*s);g.fill();g.stroke();
 g.fillStyle='#b83a2a';g.fillRect(q.x-w-3*s,q.y-8*s,4*s,16*s);g.fillRect(q.x+w-1*s,q.y-8*s,4*s,16*s);g.fillStyle='#3a2a1a';g.font=Math.round(9*s)+'px serif';g.textAlign='center';g.fillText('武',q.x,q.y+3*s);g.restore();
 if(e<.3){g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.5*(1-e/.3));g.beginPath();g.ellipse(q.x,q.y,w*1.2,20*s,0,0,7);g.fill();g.restore()}};
// les 8 kunai partent vers le cercle
JFXD.bk_fly8=(f,k,e)=>{for(let i=0;i<8;i++){const b=i*.785+.2,tx=f.x2+Math.cos(b)*110,ty=f.y2+Math.sin(b)*110,x=lerp(f.x,tx,e),y=lerp(f.y,ty,e),q=P(x,y,30+Math.sin(Math.PI*e)*40);g.save();g.translate(q.x,q.y);g.rotate(Math.atan2(ty-f.y,tx-f.x));bukWeapon('kunai',q.s*.8);g.restore()}};
JFXD.bk_snap=(f,k,e)=>{const q=P(f.x,f.y,20);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=2;for(let i=-1;i<=1;i++){const b=f.a+i*.5;g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q.x+Math.cos(b)*30*q.s*e,q.y+Math.sin(b)*20*q.s*e);g.stroke()}g.restore()};
// marteau géant qui s'abat
JFXD.bk_hammer=(f,k,e)=>{const fall=e<.6?0:Math.min(1,(e-.6)/.05),h=e<.6?140+Math.sin(e*12)*6:140*(1-fall),q=P(f.x,f.y,h),g0=P(f.x,f.y,0),s=q.s;g.fillStyle=rgba('#000000',.25*Math.min(1,e*2));g.beginPath();g.ellipse(g0.x,g0.y,60*s,22*s,0,0,7);g.fill();
 g.save();g.globalAlpha=Math.min(1,k*4);g.fillStyle='#6a4a2a';g.fillRect(q.x-4*s,q.y-80*s,8*s,70*s);g.fillStyle='#5a5f6a';g.strokeStyle='#2a2a33';g.lineWidth=2;g.beginPath();g.roundRect(q.x-46*s,q.y-28*s,92*s,40*s,6*s);g.fill();g.stroke();
 g.fillStyle='#8a909c';g.fillRect(q.x-42*s,q.y-24*s,84*s,8*s);g.fillStyle='#e8c040';g.fillRect(q.x-6*s,q.y-28*s,12*s,40*s);g.restore()};
// deux dragons de parchemin qui montent du lanceur vers la zone
JFXD.bk_twin=(f,k,e,t,u)=>{if(e>.5)return;const o=u&&!u.dead?u:f,pr=e/.5;for(const s of[-1,1]){const pts=[];for(let i=0;i<=12;i++){const q=i/12*pr,x=lerp(o.x,f.x2,q)+s*Math.sin(q*Math.PI)*90,y=lerp(o.y,f.y2,q),z=40+Math.sin(q*Math.PI)*170+Math.sin(i+t*10)*8;pts.push(P(x,y,z))}
 g.save();g.lineCap='round';g.strokeStyle=rgba('#f0e6cc',.9);g.lineWidth=7*pts[0].s;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();g.strokeStyle=rgba('#b83a2a',.8);g.lineWidth=2*pts[0].s;g.stroke();
 const h=pts[pts.length-1];circ(h.x,h.y,6*h.s,'#b83a2a');g.restore()}};
// corde d'or enroulée autour de la cible
JFXD.bk_bind=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,tg.z||0),s=q.s;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const y=q.y-(12+i*10)*s,w=(15-Math.abs(i-2)*1.5)*s;g.strokeStyle=rgba('#ffd36a',.9*Math.min(1,k*4));g.lineWidth=3*s;
 g.beginPath();g.ellipse(q.x,y,w,w*.35,-.2,t*3+i,t*3+i+4);g.stroke()}g.restore()};

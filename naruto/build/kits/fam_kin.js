// ===== Famille de sub f7 : Jutsu interdits (kinjutsu) — chakra seul, aucun coût en PV (DESIGN §13) =====
// Marque de Jashin (NOUVEAU) · Serpents de l'ombre (sub_nrp2.js) · Argile explosive (sub_nrp1.js) · Chakra de Kyûbi (sub_naruto.js, passé en A) · Shiki Fûjin (NOUVELLE version, d'après le jutsu des Uzumaki) ;
// dash : Mue du serpent (NOUVEAU)
KIT('f7',[
 ['D','x.sub_kjas','Marque de Jashin','Trace le cercle de Jashin et lie l\'ennemi visé (380) 4 s : 30 % des dégâts que tu subis le blessent aussi (le lien casse au-delà de 650)','shadow'],
 ['C','x.sub_jashu','Serpents de l\'ombre','Des serpents jaillissent de ta manche, mordent le 1er ennemi touché (14 dégâts + venin 12 dégâts en 3 s) et le ramènent à toi, enlacé : entravé 0,7 s','shadow'],
 ['B','x.sub_clay','Argile explosive','Lâche 3 oiseaux d\'argile qui poursuivent les ennemis et explosent au contact ; relance : « Katsu ! », ils explosent tous aussitôt','tag'],
 ['A','x.sub_nr_kyubi','Chakra de Kyûbi','Rugissement qui repousse (8 dégâts). 5 s : tes coups de base lancent des griffes de chakra (7 dégâts, une par seconde). Régénère 2,5 s ; insensible au contrôle 2 s','fox'],
 ['S','x.sub_kshiki','Shiki Fûjin','Le Shinigami se dresse derrière toi 0,7 s (immobile ; un étourdissement brise le rituel), puis sa main saisit le 1er ennemi de la ligne : 34 dégâts, puis âme scellée 3 s (12 dégâts par seconde, ralenti, ni jutsu ni chakra)','chakra'],
]);
DASHF[7]={src:'x.sub_d_kin',n:'Mue du serpent',d:'Glisse de 190, intangible 0,25 s ; ta mue reste sur place 1,5 s et absorbe le prochain tir ennemi',vfx:'shadow',cd:7};
const SUB_JR='#d0202e',SUB_SH='#d8c8ff';
Object.assign(NAT,{
 // --- Marque de Jashin : lien 4 s ; la perte de PV du lanceur est mesurée à chaque image (dégâts finaux, brûlures comprises) et 30 % sont infligés à la cible
 sub_kjas:S_('Marque de Jashin','Lie l\'ennemi : il subit 30 % de tes blessures',7,{hero:'maul',line:{len:380,w:40},ai:RG(360,.6)},(u,a,td)=>{const e=pick(u,a,td||300,380);
  if(!e||dist(u,e)>420){subRefund(u,'sub_kjas',1,'AUCUNE CIBLE',SUB_JR);return}anim(u,'point',.45);S('shadow',u);S('genjutsu',u);for(const x of aux)if(x.type==='sub_kjas'&&x.owner===u)x.t=0;
  aux.push({type:'sub_kjas',x:u.x,y:u.y,r:0,t:4,m:4,team:u.team,owner:u,tg:e,ti:units.indexOf(e),ui:units.indexOf(u),hp:u.hp,k:0});say(e,'MARQUE DE JASHIN','#ff5a6a');
  jx({jfx:'sub_jcircle',ui:units.indexOf(u),x:u.x,y:u.y,t:.8,m:.8});jx({jfx:'sub_jdrip',ti:units.indexOf(e),x:e.x,y:e.y,t:.6,m:.6})}),
 // --- Shiki Fûjin : rituel 0,7 s (immobile, étourdi = brisé), puis la main du Shinigami (projectile) ; âme scellée 3 s
 sub_kshiki:S_('Shiki Fûjin','Le Shinigami saisit et scelle l\'âme du 1er ennemi',22,{hero:'thrawn',line:{len:520,w:36},ai:{mode:'gap',min:60,max:480,p:.8}},(u,a)=>{S('genjutsu',u);S('roar',u);anim(u,'sub_kshiki',1.1);u.root=Math.max(u.root,.75);
  jx({jfx:'sub_shini',ui:units.indexOf(u),x:u.x,y:u.y,a,t:1.35,m:1.35});
  later(u,.7,()=>{if(u.dead||u.stun>0||u.sleepT<0){say(u,'RITUEL BRISÉ',SUB_SH);return}S('shadow',u);
   proj(u,u.aim,{spd:950,r:16,dmg:34,life:.55,col:SUB_SH,kind:'sub_shand',vfx:'chakra',noClash:1,o:{unblockable:1},onHit:(p,t)=>subSoul(p.owner,t)});if(near(u.x,u.y))shake=Math.max(shake,.25)})}),
 // --- Mue du serpent (dash) : glissade intangible ; la mue laissée sur place avale un tir
 sub_d_kin:S_('Mue du serpent','Glissade intangible, la mue absorbe un tir',7,{hero:'maul',ai:ESC},(u,a)=>{const ox=u.x,oy=u.y;S('shadow',u);S('dash',u);anim(u,'lunge',.3);u.phase=Math.max(u.phase||0,.25);
  dash(u,a,190,.2,{});aux.push({type:'sub_mue',x:ox,y:oy,a:u.aim,r:26,t:1.5,m:1.5,team:u.team,owner:u,n:0});subPoof(ox,oy,26,u)}),
});
// âme scellée : silence (ni jutsu), plus de chakra (ckLock), ralenti, 6 dégâts toutes les 0,5 s
function subSoul(o,t){if(!o||!t||t.dead)return;const V=VFX;VFX='chakra';hit(t,o,0,{unblockable:1,silent:1,silence:3,slow:3});VFX=V;if(t.unstop>0)return;t.sub_soul=3;t.chk=false;t.ckLock=Math.max(t.ckLock||0,3);
 for(const x of aux)if(x.type==='sub_soul'&&x.tg===t)x.t=0;aux.push({type:'sub_soul',x:t.x,y:t.y,r:0,t:3,m:3,team:o.team,owner:o,tg:t,ti:units.indexOf(t),ui:units.indexOf(o),k:.5});say(t,'ÂME SCELLÉE',SUB_SH);
 if(near(t.x,t.y)){S('genjutsu',o);shake=Math.max(shake,.3)}}
// ---------- logique (hôte) ----------
AUXF.sub_kjas=x=>{const u=x.owner,e=x.tg;if(!u||u.dead||!e||e.dead||dist(u,e)>650){if(e&&!e.dead&&!x.done&&near(e.x,e.y))say(e,'LIEN BRISÉ','#cccccc');x.done=1;x.t=0;return}
 x.x=u.x;x.y=u.y;x.ti=units.indexOf(e);x.ui=units.indexOf(u);const loss=x.hp-u.hp;x.hp=u.hp;
 if(loss>.4){const V=VFX;VFX='shadow';hit(e,u,loss*.3,{unblockable:1});VFX=V;if(x.k<=0){x.k=.25;jx({jfx:'sub_jdrip',ti:x.ti,x:e.x,y:e.y,t:.5,m:.5})}}};
AUXF.sub_soul=x=>{const e=x.tg,o=x.owner;if(!e||e.dead){if(e)e.sub_soul=0;x.t=0;return}x.x=e.x;x.y=e.y;e.sub_soul=Math.max(0,x.t);e.chk=false;e.ckLock=Math.max(e.ckLock||0,.2);
 if(x.k<=0&&x.t>.05){x.k=.5;const V=VFX;VFX='chakra';hit(e,o,6,{unblockable:1});VFX=V;if(near(e.x,e.y))sparks(e.x,e.y-20,SUB_SH,5,'chakra')}if(x.t<=0)e.sub_soul=0};
AUXF.sub_mue=x=>{if(x.n)return;for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team)continue;if(Math.abs(p.x-x.x)>x.r+p.r||Math.hypot(p.x-x.x,p.y-x.y)>x.r+p.r)continue;
 p.life=0;p.dead=1;p.boom=1;x.n=1;x.t=Math.min(x.t,.35);x.m=Math.max(x.m,x.t);if(near(x.x,x.y)){sparks(x.x,x.y,'#d8d0a0',10);S('deflect',x)}break}};
AFTER.push(()=>UK.push('sub_soul'));
// ---------- visuels ----------
// cercle de Jashin (cercle + triangle inversé) en sang sous le lanceur ; lien rouge jusqu'à la cible
function subJashin(px,py,R,al,rot){const pts=[0,1,2].map(i=>{const b=rot+Math.PI/2+i*2.094;return P(px+Math.cos(b)*R,py+Math.sin(b)*R,0)});g.strokeStyle=rgba(SUB_JR,.8*al);g.lineWidth=2.5;gEll(px,py,R);g.stroke();
 g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y));g.closePath();g.stroke()}
AUXD.sub_kjas=(x,k,t)=>{const u=units[x.ui],e=units[x.ti];if(!u||!e||u.dead||e.dead)return;const al=Math.min(1,x.t/.4,(x.m-x.t)/.2+.2);g.save();subJashin(u.x,u.y,34,al*.8,0);
 const a=P(u.x,u.y,38),b=P(e.x,e.y,38),n=12;g.strokeStyle=rgba('#7a0a14',.6*al);g.lineWidth=4;g.beginPath();for(let i=0;i<=n;i++){const m=i/n,w=Math.sin(m*Math.PI)*Math.sin(t*6+m*9)*6;i?g.lineTo(lerp(a.x,b.x,m),lerp(a.y,b.y,m)+w):g.moveTo(a.x,a.y)}g.stroke();
 g.strokeStyle=rgba('#ff5a6a',.7*al);g.lineWidth=1.4;g.stroke();const q=P(e.x,e.y,0);g.strokeStyle=rgba(SUB_JR,.7*al);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,24*q.s,8*q.s,0,0,7);g.stroke();g.restore()};
JFXD.sub_jcircle=(f,k,e,t,u)=>{if(!u||u.dead)return;g.globalCompositeOperation='lighter';subJashin(u.x,u.y,20+e*30,k,e*1.5);const q=P(u.x,u.y,0);g.fillStyle=rgba('#7a0a14',.3*k);g.beginPath();g.ellipse(q.x,q.y,(20+e*30)*q.s,(7+e*11)*q.s,0,0,7);g.fill()};
JFXD.sub_jdrip=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s;for(let i=0;i<5;i++){const x=q.x+Math.sin(i*2.1)*12*s,y=q.y-(50-e*40-i*4)*s;g.fillStyle=rgba('#b0101e',.85*k);g.beginPath();g.ellipse(x,y,1.8*s,3*s,0,0,7);g.fill()}};
// mue du serpent : peau claire écaillée, abandonnée au sol
AUXD.sub_mue=(x,k,t)=>{const al=Math.min(1,x.t/.3),q=P(x.x,x.y,0),s=q.s;g.save();g.translate(q.x,q.y-10*s);g.rotate(Math.cos(x.a||0)>=0?-.15:.15);g.globalAlpha*=al*.85;
 const gr=g.createLinearGradient(0,-26*s,0,10*s);gr.addColorStop(0,'rgba(236,228,196,.9)');gr.addColorStop(1,'rgba(180,170,130,.6)');g.fillStyle=gr;g.strokeStyle='rgba(120,110,80,.8)';g.lineWidth=1;
 g.beginPath();g.ellipse(0,-8*s,11*s,20*s,0,0,7);g.fill();g.stroke();g.beginPath();g.ellipse(0,-30*s,7*s,7*s,0,0,7);g.fill();g.stroke();
 g.strokeStyle='rgba(140,128,90,.55)';for(let i=0;i<5;i++){g.beginPath();g.arc(0,(-20+i*6)*s,7*s,.3,Math.PI-.3);g.stroke()}g.fillStyle='rgba(40,30,20,.6)';circ(-2.5*s,-31*s,1.2*s,'rgba(40,30,20,.7)');circ(2.5*s,-31*s,1.2*s,'rgba(40,30,20,.7)');g.restore()};
AUXD.sub_soul=()=>{};
// le Shinigami : spectre voilé qui se dresse derrière le lanceur, bras tendu dans la visée, poignard entre les dents
JFXD.sub_shini=(f,k,e,t,u)=>{if(!u)return;const a=f.a,q=P(u.x-Math.cos(a)*30,u.y-Math.sin(a)*30,0),s=q.s*1.25,rise=ezo(Math.min(1,e*3.2)),al=Math.min(1,e*5,k*3.5)*.8;if(al<=0)return;g.globalAlpha=al;
 g.translate(q.x,q.y+(1-rise)*30*s);g.scale(1,.55+.45*rise);g.fillStyle='rgba(30,16,50,.45)';g.beginPath();g.ellipse(0,0,46*s,15*s,0,0,7);g.fill();
 const gr=g.createLinearGradient(0,-118*s,0,0);gr.addColorStop(0,'#f0ecf8');gr.addColorStop(.55,'rgba(196,180,236,.85)');gr.addColorStop(1,'rgba(140,110,210,0)');g.fillStyle=gr;
 g.beginPath();g.moveTo(-22*s,-112*s);g.quadraticCurveTo(-46*s,-60*s,-38*s,-2*s);g.quadraticCurveTo(0,8*s,38*s,-2*s);g.quadraticCurveTo(46*s,-60*s,22*s,-112*s);g.closePath();g.fill();
 g.fillStyle='#ece8f6';g.strokeStyle='#4a2a6a';g.lineWidth=1.6;g.beginPath();g.ellipse(0,-120*s,15*s,18*s,0,0,7);g.fill();g.stroke(); // tête
 g.fillStyle='#2a1640';g.beginPath();g.moveTo(-15*s,-128*s);g.lineTo(-24*s,-150*s);g.lineTo(-8*s,-134*s);g.moveTo(15*s,-128*s);g.lineTo(24*s,-150*s);g.lineTo(8*s,-134*s);g.fill(); // cornes
 g.fillStyle='#1a0a2a';g.beginPath();g.ellipse(-6*s,-124*s,3.4*s,2.2*s,-.3,0,7);g.ellipse(6*s,-124*s,3.4*s,2.2*s,.3,0,7);g.fill();g.fillStyle='#ff4a6a';circ(-6*s,-124*s,1.1*s,'#ff4a6a');circ(6*s,-124*s,1.1*s,'#ff4a6a');
 g.strokeStyle='#1a0a2a';g.lineWidth=1.2;g.beginPath();g.moveTo(-9*s,-110*s);g.lineTo(9*s,-110*s);g.stroke();for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(i*2.6*s,-112*s);g.lineTo(i*2.6*s,-107*s);g.stroke()}
 g.fillStyle='#c8ccd4';g.fillRect(-20*s,-112*s,14*s,2.2*s); // poignard
 const ext=e>.5?Math.min(1,(e-.5)*4):0,dx=Math.cos(a),dy=Math.sin(a)*.55;g.strokeStyle='rgba(220,210,245,.9)';g.lineWidth=6*s;g.lineCap='round';g.beginPath();g.moveTo(18*s,-86*s);g.lineTo((18+dx*60*ext)*s,(-86+dy*60*ext+30*ext)*s);g.stroke();
 g.globalAlpha=1};
PROJD.sub_shand=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(-80,0,0,0);gr.addColorStop(0,'rgba(170,140,255,0)');gr.addColorStop(1,'rgba(210,190,255,.55)');g.fillStyle=gr;g.beginPath();g.moveTo(-80,-5);g.quadraticCurveTo(-30,-11,0,-9);g.lineTo(0,9);g.quadraticCurveTo(-30,11,-80,5);g.closePath();g.fill();
 g.globalCompositeOperation='source-over';g.fillStyle='#ece6ff';g.strokeStyle='#5a3a8a';g.lineWidth=1.4;g.beginPath();g.ellipse(2,0,9,8,0,0,7);g.fill();g.stroke();const w=Math.sin(t/60)*1.5;g.lineCap='round';
 for(let i=0;i<4;i++){const y=-6+i*4,L=(i===1||i===2)?23:20;g.strokeStyle='#5a3a8a';g.lineWidth=4.2;g.beginPath();g.moveTo(8,y*.8);g.quadraticCurveTo(15,y,L,y*1.1+w);g.stroke();g.strokeStyle='#ece6ff';g.lineWidth=2.6;g.stroke()}};
// âme scellée : la silhouette de l'âme est tirée hors du corps vers le haut
STATD.push((u,p,S,sk)=>{if(!(u.sub_soul>0)||u.dead)return;sk=sk||1;const t=performance.now()/1000,a=Math.min(1,u.sub_soul*2.5),y0=p.y-50*S*sk,y1=p.y-(86+Math.sin(t*3)*4)*S*sk;g.save();g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#b8a0ff',.28*a);g.beginPath();g.moveTo(p.x-7*S,y0);g.quadraticCurveTo(p.x-14*S,(y0+y1)/2,p.x-9*S,y1);g.lineTo(p.x+9*S,y1);g.quadraticCurveTo(p.x+14*S,(y0+y1)/2,p.x+7*S,y0);g.closePath();g.fill();
 circ(p.x,y1-6*S,7*S,rgba(SUB_SH,.5*a));g.strokeStyle=rgba('#ffffff',.5*a);g.lineWidth=1.2*S;g.beginPath();g.moveTo(p.x,y0);g.lineTo(p.x,y1);g.stroke();g.restore()});
Object.assign(ANIM,{sub_kshiki:(P,e)=>{const k=ezo(Math.min(1,e/.2));if(e<.62){pz(P,'armL',-1.2*k,0,-.55*k);pz(P,'foreL',-1.3*k);pz(P,'armR',-1.2*k,0,.55*k);pz(P,'foreR',-1.3*k);pz(P,'head',.18*k);pz(P,'chest',.12*k)}
 else{const r=ezo(Math.min(1,(e-.62)/.15));pz(P,'armR',-1.2-.38*r,0,.55-.6*r);pz(P,'foreR',-1.3+1.2*r);pz(P,'armL',-1.2+.9*r,0,-.55+.95*r);pz(P,'foreL',-1.3+.7*r);pz(P,'chest',.12+.25*r,.3*r);pz(P,'head',.18-.25*r)}}});

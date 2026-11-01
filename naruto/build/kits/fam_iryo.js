// ===== Famille de sub f0 : Iryô (ninjutsu médical) =====
// Pilule du soldat (sub.js) · Scalpel de chakra (sub.js) · Shôsen (sub.js) · Ranshinshô (NOUVEAU) · Byakugô (sub_nrp2.js) ; dash : Pas médical (NOUVEAU)
KIT('f0',[
 ['D','x.sub_pill','Pilule du soldat','Croque une pilule : +20 chakra, soin de 10, endurance pleine ; se libère des entraves et ralentissements','heal'],
 ['C','x.sub_mesu','Scalpel de chakra','Bond et entaille les muscles devant toi (10 dégâts) : ralentit fortement et empêche d\'attaquer 0,8 s','chakra'],
 ['B','x.sub_shosen','Shôsen','Soigne l\'allié le plus blessé (ou toi), le régénère 1,5 s et éteint brûlures et poisons','heal'],
 ['A','x.sub_iry_ran','Ranshinshô : Chaos nerveux','Paume de chakra au contact (24 dégâts) qui brouille les nerfs : la cible titube, confuse 1,2 s, et ne peut plus parer 2 s','chakra'],
 ['S','x.sub_byakugo','Byakugô','Losange sur le front : 4 s, chaque dégât subi est régénéré 1 s plus tard, en brûlant ton chakra (1 chakra pour 4 PV ; sans chakra, plus rien)','heal'],
]);
DASHF[0]={src:'x.sub_d_iry',n:'Pas médical',d:'Glisse de 190 : se libère des entraves et des ralentissements, et récupère 6 PV à l\'arrivée',vfx:'heal',cd:7};
const SUB_IRC='#7fe8ff'; // chakra médical (paume, nerfs)
Object.assign(NAT,{
 // --- Ranshinshô : courte avancée, paume au contact ; la cible touchée titube (confusion de yamanaka.js) et sa garde est bloquée (blockLock : ni parade ni garde)
 sub_iry_ran:S_('Ranshinshô : Chaos nerveux','Paume qui brouille les nerfs : confusion et plus de parade',13,{hero:'yoda',ai:RG(115,.65)},(u,a)=>{anim(u,'palm',.42);S('jyuken',u);
  dash(u,a,55,.08,{end:()=>{const ui=units.indexOf(u),L=enemies(u).filter(e=>dist(u,e)<96+e.r&&angDiff(ang(u,e),u.aim)<.8).sort((p,q)=>dist(u,p)-dist(u,q)),e=L[0];
   jx({jfx:'sub_ranpalm',ui,x:u.x,y:u.y,a:u.aim,col:SUB_IRC,t:.42,m:.42});if(!e)return;
   VFX='chakra';const ok=hit(e,u,24,{unblockable:1,fx:u.x,fy:u.y,kb:90});VFX=null;if(!ok||e.dead)return;
   if(e.unstop<=0){if(typeof yaConfuse==='function')yaConfuse(u,e,1.2);else e.slow=Math.max(e.slow,1.2);e.blockLock=Math.max(e.blockLock||0,2);e.block=false;e.parry=0}
   say(e,'NERFS BROUILLÉS','#7fe8ff');jx({jfx:'sub_nerves',ti:units.indexOf(e),x:e.x,y:e.y,t:2,m:2});if(near(e.x,e.y)){S('zap',u);shake=Math.max(shake,.12)}}})}),
 // --- Pas médical (dash) : la glissade purge entraves et ralentissements, petit soin à l'arrivée
 sub_d_iry:S_('Pas médical','Glissade qui libère et soigne un peu',7,{hero:'rey',ai:ESC},(u,a)=>{u.root=0;u.slow=0;S('dash',u);anim(u,'lunge',.3);const x0=u.x,y0=u.y;
  dash(u,a,190,.2,{end:()=>{const r=gain(u,9.2,u);if(r>=1&&near(u.x,u.y))say(u,'+'+Math.round(r),'#6f9');jx({jfx:'sub_medstep',x:x0,y:y0,x2:u.x,y2:u.y,t:.55,m:.55})}});
  jx({jfx:'sub_medcross',ui:units.indexOf(u),x:u.x,y:u.y,t:.45,m:.45})}),
});
// ---------- visuels ----------
// paume : main de chakra bleu-vert poussée devant, ondes nerveuses
JFXD.sub_ranpalm=(f,k,e,t,u)=>{if(!u)return;const a=f.a,c=f.col||SUB_IRC,q=P(u.x+Math.cos(a)*(26+e*30),u.y+Math.sin(a)*(26+e*30),34),s=q.s;g.globalCompositeOperation='lighter';
 circ(q.x,q.y,(14+e*10)*s,rgba(c,.35*k));circ(q.x,q.y,6*s,rgba('#ffffff',.85*k));
 g.strokeStyle=rgba(c,.9*k);g.lineWidth=2*s;for(let i=0;i<5;i++){const b=a+(i-2)*.32;g.beginPath();g.moveTo(q.x,q.y);let x=q.x,y=q.y;for(let j=0;j<4;j++){x+=Math.cos(b+Math.sin(j*3+i)*.6)*7*s*(1+e);y+=Math.sin(b+Math.cos(j*2+i)*.6)*5*s*(1+e);g.lineTo(x,y)}g.stroke()}
 g.strokeStyle=rgba('#ffffff',.6*k);g.lineWidth=1.5*s;g.beginPath();g.ellipse(q.x,q.y,(10+e*28)*s,(7+e*20)*s,a,0,7);g.stroke()};
// nerfs brouillés : éclairs cyan qui crépitent sur la tête et les bras de la cible
JFXD.sub_nerves=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,al=Math.min(1,k*4);g.globalCompositeOperation='lighter';g.lineWidth=1.4*s;
 for(let i=0;i<4;i++){if(((t*7+i*3)|0)%3===0)continue;const b=t*4+i*1.57,x0=q.x+Math.cos(b)*10*s,y0=q.y-(40+Math.sin(b*1.3)*14)*s;g.strokeStyle=rgba(i%2?'#ffffff':SUB_IRC,.8*al);g.beginPath();g.moveTo(x0,y0);
  for(let j=1;j<4;j++)g.lineTo(x0+Math.cos(b+j)*6*j*s,y0+Math.sin(b*2+j*1.7)*5*s-j*2*s);g.stroke()}
 g.strokeStyle=rgba(SUB_IRC,.35*al);g.beginPath();g.ellipse(q.x,q.y-62*s,9*s,3.5*s,t*3,0,7);g.stroke()};
// pas médical : traînée de croix vertes entre le départ et l'arrivée, puis éclat de soin
JFXD.sub_medstep=(f,k,e)=>{g.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const m=i/6,x=lerp(f.x,f.x2,m),y=lerp(f.y,f.y2,m),q=P(x,y,16+Math.sin(m*Math.PI)*10),s=q.s*(.6+.5*m)*Math.min(1,k*1.6),al=k*(.4+.6*m);
  g.fillStyle=rgba('#7fe07f',.85*al);g.fillRect(q.x-1.5*s*2,q.y-5*s*2,3*s*2,10*s*2);g.fillRect(q.x-5*s*2,q.y-1.5*s*2,10*s*2,3*s*2)}
 const q=P(f.x2,f.y2,0);g.strokeStyle=rgba('#b8ffb0',.8*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,(14+e*30)*q.s,(5+e*11)*q.s,0,0,7);g.stroke()};
JFXD.sub_medcross=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x,u.y,0),s=q.s;g.globalCompositeOperation='lighter';g.fillStyle=rgba('#9cf0a0',.3*k);g.beginPath();g.ellipse(q.x,q.y,(20+e*20)*s,(7+e*7)*s,0,0,7);g.fill()};

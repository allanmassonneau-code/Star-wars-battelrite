// ===== Famille de sub f6 : Senjutsu (énergie naturelle, crapauds du mont Myôboku) =====
// Concentration du chakra (sub.js) · Senpô : Kawazu Kumite (NOUVEAU) · Senpô : Kebari Senbon (NOUVEAU) · Mode Ermite (sub.js, passé en A : +25 %) · Fûton : Rasenshuriken (sub_nrp2.js) ;
// dash : Saut ninja (sub.js, choc ×1,5 en Mode Ermite). En Mode Ermite, Kawazu Kumite et Kebari Senbon ne coûtent rien.
KIT('f6',[
 ['D','x.sub_focus','Concentration du chakra','Réduit de 14 s la recharge des autres jutsu de ta barre, rend 15 chakra et te rend plus rapide 1 s','chakra'],
 ['C','x.sub_skum','Senpô : Kawazu Kumite','5 s : tes 4 prochains coups de base portent 40 plus loin (aura de l\'énergie naturelle) et infligent 6 dégâts de plus. Gratuit en Mode Ermite','sage'],
 ['B','x.sub_skeb','Senpô : Kebari Senbon','Tu t\'enroules dans ta crinière 0,6 s (−50 % de dégâts subis), puis 12 aiguilles de cheveux jaillissent en anneau (7 dégâts chacune). Gratuit en Mode Ermite','sage'],
 ['A','x.sub_sage','Mode Ermite','Se concentre 0,6 s (interruptible) puis 4 s : +25 % de dégâts, plus rapide, un peu de soin ; Kawazu Kumite et Kebari Senbon gratuits','sage'],
 ['S','x.sub_rsk','Fûton : Rasenshuriken','Lancer longue portée : explose en sphère de lames de vent (jusqu\'à 40 dégâts) qui tranche le chakra (−30 chakra, plus aucun chakra récupéré 3 s). Plus grand et ×1,3 en Mode Ermite ; ton bras blessé fait −10 % de dégâts 4 s','rasenshuriken'],
]);
DASHF[6]={src:'x.sub_jump',n:'Saut ninja',d:'Bondit au curseur ; l\'atterrissage repousse les ennemis proches (9 dégâts, ×1,5 en Mode Ermite)',vfx:'leaf',cd:6};
const SUB_SG='#9ad05a',SUB_SGO='#ffb04a';
// gratuit en Mode Ermite : le chakra payé est rendu
const subSageFree=(u,k)=>{if(!(u.sub_sage>0))return;const i=subIdx(u,k);if(i>0){u.energy=Math.min(100,u.energy+jcost(u.ch.abil[i]));say(u,'SENPÔ','#c8f08a')}};
Object.assign(NAT,{
 // --- Kawazu Kumite : 4 coups de base allongés (+40) et renforcés (+6), 5 s
 sub_skum:S_('Senpô : Kawazu Kumite','4 coups de base allongés et renforcés',9,{hero:'yoda',ai:{mode:'gap',min:40,max:200,p:.55}},(u)=>{subSageFree(u,'sub_skum');anim(u,'pray',.4);S('ignite',u);u.sub_kum=4;u.sub_kumT=5;
  say(u,'KAWAZU KUMITE','#c8f08a');jx({jfx:'sub_kumin',ui:units.indexOf(u),x:u.x,y:u.y,t:.7,m:.7})}),
 // --- Kebari Senbon : 0,6 s en boule de cheveux (réduction de dégâts), puis anneau de 12 aiguilles
 sub_skeb:S_('Senpô : Kebari Senbon','Boule de cheveux puis anneau d\'aiguilles',11,{hero:'yoda',tele:{self:1,r:150},ai:SELF(150,.6)},(u)=>{subSageFree(u,'sub_skeb');anim(u,'crouch',.6);S('wind',u);
  u.drT=Math.max(u.drT||0,.6);u.dr=Math.max(u.dr||0,.5);u.root=Math.max(u.root,.6);u.sub_kebT=.6;
  later(u,.6,()=>{u.sub_kebT=0;if(u.dead)return;S('saber',u);S('deflect',u);const b0=rnd()*Math.PI;for(let i=0;i<12;i++){const b=b0+i*Math.PI/6;proj(u,b,{x:u.x+Math.cos(b)*18,y:u.y+Math.sin(b)*18,spd:720,r:5,dmg:7,life:.42,col:'#f0e0a0',vfx:'sage',kind:'sub_needle',noClash:1})}
   jx({jfx:'sub_kebburst',x:u.x,y:u.y,t:.4,m:.4});if(near(u.x,u.y))shake=Math.max(shake,.14)})}),
});
// coups de base allongés : l'allonge est ajoutée dans melee() (toutes les attaques de base au corps à corps y passent)
AFTER.push(()=>{const M=melee;melee=function(u,a,range,arc,dmg,o){if(u&&u.sub_kumT>0&&u.sub_kum>0&&BASIC){u.sub_kum--;u.sub_kumH=1;if(u.sub_kum<=0)u.sub_kumT=Math.min(u.sub_kumT,.3);
  jx({jfx:'sub_kumarc',ui:units.indexOf(u),x:u.x,y:u.y,a,R:range+40,w:arc,t:.26,m:.26});try{return M.call(this,u,a,range+40,arc,dmg,o)}finally{u.sub_kumH=0}}return M.apply(this,arguments)};
 UK.push('sub_kumT','sub_kebT','sub_rskW')});
// règles de famille (trait des sans-clan) : Mode Ermite +25 %, Kumite +6, bras blessé du Rasenshuriken −10 %, décomptes
subTH({
 update(u,dt){if(u.sub_kumT>0){u.sub_kumT=Math.max(0,u.sub_kumT-dt);if(!u.sub_kumT)u.sub_kum=0}if(u.sub_rskW>0)u.sub_rskW=Math.max(0,u.sub_rskW-dt);if(u.sub_kebT>0)u.sub_kebT=Math.max(0,u.sub_kebT-dt)},
 deal(src,t,dmg,o){if(src.sub_kumH&&o.basic)dmg+=6;if(src.sub_sage>0)dmg*=1.25;if(src.sub_rskW>0)dmg*=.9;return dmg}});
// ---------- visuels ----------
// aura de la nature : flammèches vertes et orange autour des poings pendant le Kumite
STATD.push((u,p,S,sk)=>{if(!(u.sub_kumT>0)||u.dead)return;const t=performance.now()/1000;sk=sk||1;g.save();g.globalCompositeOperation='lighter';
 for(const d of[-1,1]){const a=u.aim+d*.6,x=p.x+Math.cos(a)*14*S,y=p.y-42*S*sk+Math.sin(a)*5*S;for(let i=0;i<4;i++){const k=((t*2+i*.25)%1);g.fillStyle=rgba(i%2?SUB_SGO:SUB_SG,.55*(1-k));g.beginPath();g.arc(x+Math.sin(t*9+i)*4*S,y-k*16*S,(5-3*k)*S,0,7);g.fill()}}
 g.strokeStyle=rgba(SUB_SG,.35);g.lineWidth=1.5*S;g.beginPath();g.ellipse(p.x,p.y,34*S,12*S,0,0,7);g.stroke();g.restore()});
// crinière enroulée : boule de cheveux hérissée autour du ninja
STATD.push((u,p,S,sk)=>{if(!(u.sub_kebT>0)||u.dead)return;const t=performance.now()/1000,c=p.y-34*S*(sk||1),k=Math.min(1,(.6-u.sub_kebT)/.15+.2);g.save();
 g.fillStyle=rgba('#e8e0c8',.55*k);g.beginPath();g.ellipse(p.x,c,28*S,30*S,0,0,7);g.fill();g.strokeStyle=rgba('#fff8e0',.9*k);g.lineWidth=1.6*S;
 for(let i=0;i<22;i++){const b=i*.2856+Math.sin(t*6+i)*.05,r0=22*S,r1=(32+((i*7)%4)*3)*S;g.beginPath();g.moveTo(p.x+Math.cos(b)*r0,c+Math.sin(b)*r0);g.lineTo(p.x+Math.cos(b)*r1,c+Math.sin(b)*r1);g.stroke()}g.restore()});
// bras blessé par le Rasenshuriken : marbrures violettes sur le bras
STATD.push((u,p,S,sk)=>{if(!(u.sub_rskW>0)||u.dead||u!==player&&!near(u.x,u.y))return;const t=performance.now()/1000,a=Math.min(1,u.sub_rskW);g.save();g.strokeStyle=rgba('#5a2a6a',.7*a);g.lineWidth=1.4*S;
 const x=p.x+Math.cos(u.aim+.8)*13*S,y=p.y-46*S*(sk||1);for(let i=0;i<3;i++){g.beginPath();g.moveTo(x-4*S,y+i*5*S);g.lineTo(x,y+i*5*S+2*S);g.lineTo(x+4*S,y+i*5*S-1*S);g.stroke()}g.restore()});
JFXD.sub_kumin=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s;g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const b=i*.628+e*2,d=(12+e*40)*s,h=P(u.x+Math.cos(b)*e*40,u.y+Math.sin(b)*e*40,20+e*40);circ(h.x,h.y,3*s*k,rgba(i%2?SUB_SGO:SUB_SG,.8*k))}
 g.strokeStyle=rgba(SUB_SG,.7*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,(16+e*30)*s,(6+e*11)*s,0,0,7);g.stroke()};
// allonge du Kumite : arc vert pâle au-delà du coup normal
JFXD.sub_kumarc=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,a=f.a,R=f.R,w=Math.min(2.2,f.w||1.4);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(SUB_SG,.55*k);g.lineWidth=5*k+1;g.beginPath();
 for(let i=0;i<=12;i++){const b=a-w/2+w*i/12,q=P(o.x+Math.cos(b)*R,o.y+Math.sin(b)*R,30);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y)}g.stroke()};
JFXD.sub_kebburst=(f,k,e)=>{const q=P(f.x,f.y,30);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#fff3c0',.8*k);g.lineWidth=3*k+.5;g.beginPath();g.ellipse(q.x,q.y,(20+e*90)*q.s,(12+e*50)*q.s,0,0,7);g.stroke()};
// aiguille de cheveux
PROJD.sub_needle=(p,R,ra,t)=>{g.rotate(ra);g.strokeStyle='rgba(255,248,220,.35)';g.lineWidth=3;g.beginPath();g.moveTo(-22,0);g.lineTo(-6,0);g.stroke();g.strokeStyle='#f6f0d8';g.lineWidth=1.6;g.beginPath();g.moveTo(-10,0);g.lineTo(8,0);g.stroke();g.fillStyle='#fffbe8';g.beginPath();g.moveTo(8,-1.5);g.lineTo(12,0);g.lineTo(8,1.5);g.fill()};

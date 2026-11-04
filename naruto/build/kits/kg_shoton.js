// ===== Kekkei genkai g6 : Shôton, le cristal (préfixe so_) — façon Guren =====
// Identité : le bâtisseur. Chaque jutsu laisse des CRISTAUX plantés dans le sol (4 s) ; près d'eux, tout RÉSONNE (trait) :
// l'ennemi y prend +15 % de tes dégâts, toi tu y subis −15 %. Éclats, pics, prison, dragon de cristal, prison des cinq pans ; dash : pas de cristal.
gkPal('so_cry','#ffe6fa','#e07ad8','#8a2a8a','#3a0a3a');
defKG(6,{n:'Shôton',col:'#e07ad8',tag:'Sô',el:'Doton',nat:4,d:'Le cristal : pics, prisons et cristaux qui résonnent et renforcent tes coups',
 ico:f=>{g.beginPath();g.moveTo(0,-13);g.lineTo(8,-4);g.lineTo(5,12);g.lineTo(-5,12);g.lineTo(-8,-4);g.closePath();g.fill();g.globalCompositeOperation='destination-out';g.lineWidth=1.6;g.beginPath();g.moveTo(0,-13);g.lineTo(0,12);g.moveTo(-8,-4);g.lineTo(8,-4);g.stroke();g.globalCompositeOperation='source-over'}});
const SO_D={
 shard:'3 éclats de cristal perçants en éventail : 5 dégâts chacun ; celui du milieu se plante au sol en bout de course (cristal, 4 s)',
 spikes:'Des pics de cristal jaillissent en ligne devant toi (380) : 20 dégâts, ralentit 1 s ; 2 cristaux restent plantés (4 s)',
 prison:'Le cristal enveloppe le point visé (380 max) après 0,7 s : 16 dégâts et entrave 1 s ; un cristal reste (4 s)',
 dragon:'Hashô Kôryû : un dragon de cristal perçant (520) : 34 dégâts, ralentit 1 s ; il sème 3 cristaux sur sa route (4 s)',
 penta:'Prison des cinq pans au point visé (320 max) : après 0,7 s, cinq murs de cristal enferment les ennemis 2,2 s (un déplacement en sort), puis ils éclatent vers l\'intérieur : 58 dégâts',
 dash:'Glissade sur le cristal (230) : un cristal pousse à ton point de départ (4 s)'};
KIT('g6',[
 ['D','x.so_shard','Shôton : Éclats de cristal',SO_D.shard,'so_cry'],
 ['C','x.so_spikes','Shôton : Pics de cristal',SO_D.spikes,'so_cry'],
 ['B','x.so_prison','Shôton : Prison de cristal',SO_D.prison,'so_cry'],
 ['A','x.so_dragon','Shôton : Hashô Kôryû',SO_D.dragon,'so_cry'],
 ['S','x.so_penta','Shôton : Kesshô Gokei',SO_D.penta,'so_cry'],
]);
DASHG[6]={src:'x.so_dash',n:'Pas de cristal',d:SO_D.dash,vfx:'so_cry',cd:7};
KGBAL[6]=[0.961,0.946];
const SOC=GK.so_cry,SO_RES=120;
// éclats de cristal : facettes (non additives) + étincelles roses
const soHitFx=(u,x,y,n,a,arc)=>{fxBurst(x,y,SOC.b,{u,z:30,n,sp:240,up:90,gr:320,w:2.6,sh:'dot',add:0,c2:SOC.a,a,arc:arc??6.3,t:.5});fxBurst(x,y,SOC.a,{u,z:30,n:Math.ceil(n*.6),sp:300,w:1.4,len:.14,a,arc:arc??6.3,t:.3})};
// cristal planté (4 s, 6 au plus par lanceur) : purement un repère (résonance du trait) ; on le dessine en prisme
function soCry(u,x,y,big){const L=aux.filter(q=>q.type==='so_cry'&&q.owner===u&&q.t>0);if(L.length>=6)L[0].t=Math.min(L[0].t,.3);
 aux.push({type:'so_cry',x:clamp(x,B.x+10,B.x+B.w-10),y:clamp(y,B.y+10,B.y+B.h-10),r:0,t:4,m:4,team:u.team,owner:u,n:big?1:0,a:rnd()*6})}
const soNear=(u,x,y)=>{for(const q of aux)if(q.type==='so_cry'&&q.owner===u&&q.t>.05&&Math.hypot(q.x-x,q.y-y)<SO_RES)return true;return false};
Object.assign(NAT,{
 // ---------- Éclats de cristal (D) ----------
 so_shard:SP('Shôton : Éclats de cristal',SO_D.shard,5,{ai:RG(460,.75),line:{len:460,w:70}},(u,a)=>{gkS('deflect',u);gkS('blaster',u);anim(u,'gk_sweep',.4);fxFlare(u.x+Math.cos(a)*20,u.y+Math.sin(a)*20,SOC.a,{u,z:34,r:18,t:.15});
  for(let i=-1;i<=1;i++){proj(u,a+i*.16,{spd:860,r:7,dmg:5,life:.54,col:SOC.b,kind:'so_sh',vfx:'so_cry',pierce:1,onHit:(p,t)=>soHitFx(p.owner,t.x,t.y,4,Math.atan2(p.vy,p.vx),1.8)});if(!i){const p=projs[projs.length-1];aux.push({type:'so_pl',x:p.x,y:p.y,r:0,t:p.life+.1,m:p.life+.1,team:u.team,owner:u,p})}}}),
 // ---------- Pics de cristal (C) ----------
 so_spikes:SP('Shôton : Pics de cristal',SO_D.spikes,8,{ai:RG(380,.65),line:{len:380,w:60}},(u,a)=>{gkS('rock',u);gkS('deflect',u);anim(u,'gk_slam',.55);fxRing(u.x,u.y,{u,r0:8,r1:40,col:SOC.b,t:.25,w:3});
  aux.push({type:'so_spk',x:u.x+Math.cos(a)*18,y:u.y+Math.sin(a)*18,a,len:380,w:60,r:0,t:1.4,m:1.4,team:u.team,owner:u,k:0,hs:new Set(),n:0});
  for(const f of[.45,.9])soCry(u,u.x+Math.cos(a)*380*f,u.y+Math.sin(a)*380*f)}),
 // ---------- Prison de cristal (B) ----------
 so_prison:SP('Shôton : Prison de cristal',SO_D.prison,10,{ai:RG(380,.6),tele:{r:70,max:380}},(u,a,td)=>{const c=atP(u,a,td,380),D=.7;gkS('deflect',u);anim(u,'gk_charge',.5);fxCast(u,'so_cry',.5,{n:8});jx({jfx:'so_form',x:c.x,y:c.y,r:70,t:D,m:D});
  later(u,D,()=>{for(const e of enemies(u))if(gkIn(e,c.x,c.y,70)&&gkHit(e,u,16,{root:1,unblockable:1},'so_cry'))jx({jfx:'so_enc',ti:gkI(e),x:e.x,y:e.y,t:1,m:1});soCry(u,c.x,c.y,1);
   jx({jfx:'gk_boom',x:c.x,y:c.y,r:70,v:'so_cry',s:'crys',t:.5,m:.5});soHitFx(u,c.x,c.y,10);fxFlare(c.x,c.y,SOC.a,{u,z:34,r:26,t:.2});fxDecal(c.x,c.y,'ice',{u,r:50,t:3});if(near(c.x,c.y)){gkS('rock',u);gkS('deflect',u)}},{x:c.x,y:c.y,r:70})}),
 // ---------- Hashô Kôryû (A) ----------
 so_dragon:SP('Shôton : Hashô Kôryû',SO_D.dragon,13,{ai:RG(500,.65),line:{len:520,w:44}},(u,a)=>{gkS('roar',u);gkS('deflect',u);anim(u,'gk_push',.55);fxCast(u,'so_cry',.25,{n:10});fxFlare(u.x+Math.cos(a)*26,u.y+Math.sin(a)*26,SOC.a,{u,z:34,r:30,t:.2});
  proj(u,a,{spd:620,r:20,dmg:34,life:.84,col:SOC.b,kind:'so_drag',vfx:'so_cry',pierce:1,o:{slow:1},onHit:(p,t)=>{soHitFx(p.owner,t.x,t.y,10,Math.atan2(p.vy,p.vx),2);fxRing(t.x,t.y,{u:p.owner,r0:8,r1:44,col:SOC.b,t:.3,w:4});fxHitStop(p.owner,t,34)}});const p=projs[projs.length-1];aux.push({type:'so_pl',x:p.x,y:p.y,r:0,t:p.life+.1,m:p.life+.1,team:u.team,owner:u,p,drop:.28,dk:.28})}),
 // ---------- Kesshô Gokei (S) : prison des cinq pans ----------
 so_penta:ULT('Shôton : Kesshô Gokei',SO_D.penta,{ai:RG(320,.85),tele:{r:150,max:320}},(u,a,td)=>{const c=atP(u,a,td,320),R=150;c.x=clamp(c.x,B.x+R+10,B.x+B.w-R-10);c.y=clamp(c.y,B.y+R+10,B.y+B.h-R-10);
  gkS('deflect',u);gkS('heavy',u);anim(u,'gk_call',.9);fxCast(u,'so_cry',.7,{n:14});aux.push({type:'so_penta',x:c.x,y:c.y,r:R,t:2.9,m:2.9,team:u.team,owner:u,a:rnd()*6,tr:null,danger:1})}),
 // ---------- dash : Pas de cristal ----------
 so_dash:SP('Pas de cristal',SO_D.dash,7,{ai:ESC},(u,a,td)=>{gkS('deflect',u);gkS('dash',u);anim(u,'lunge',.3);soCry(u,u.x,u.y);soHitFx(u,u.x,u.y,6);dash(u,a,clamp(td||230,120,230),.22,{});gkTrail(u,'so_cry',.35,{w:14,z:24})}),
});
Object.assign(NATHERO,{so:'kylo'});
// projectile qui plante des cristaux (fin de course ; ou tous les drop s)
AUXF.so_pl=(x,dt)=>{const p=x.p;if(x.done||!p){x.t=0;return}const alive=!p.dead&&p.life>0&&projs.includes(p);if(alive){x.x=p.x;x.y=p.y;if(x.drop){x.dk-=dt;if(x.dk<=0){x.dk=x.drop;soCry(x.owner,p.x,p.y)}}return}
 x.done=1;x.t=0;if(!x.drop)soCry(x.owner,x.x,x.y)};AUXD.so_pl=()=>{};
// pics en ligne (le front avance en 0,3 s)
AUXF.so_spk=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;const el=x.m-x.t,front=Math.min(x.len,el/.3*x.len),ca=Math.cos(x.a),sa=Math.sin(x.a);
 for(const e of enemies(o)){if(x.hs.has(e))continue;const dx=e.x-x.x,dy=e.y-x.y,f=dx*ca+dy*sa;if(f<-e.r||f>front+e.r||Math.abs(-dx*sa+dy*ca)>x.w/2+e.r)continue;x.hs.add(e);gkHit(e,o,20,{slow:1,unblockable:1},'so_cry');soHitFx(o,e.x,e.y,8);fxHitStop(o,e,20)}};
AUXD.so_spk=(x,k,t)=>{const el=x.m-x.t,front=Math.min(x.len,el/.3*x.len),ca=Math.cos(x.a),sa=Math.sin(x.a),fade=Math.min(1,x.t/.35),n=Math.floor(x.len/26);
 for(let i=0;i<n;i++){const f=i*26+13;if(f>front)break;const age=Math.min(1,(el-f/x.len*.3)/.12),lat=(((i*7)%5)-2)/2*x.w*.3;gkPrism(x.x+ca*f-sa*lat,x.y+sa*f+ca*lat,6+(i%3)*2,(28+(i%3)*12)*ezo(age)*fade,4,i*.7,SOC.a,SOC.b,SOC.d,.95)}};
// cristal planté
AUXF.so_cry=()=>{};
AUXD.so_cry=(x,k,t)=>{const up=ezo(Math.min(1,(x.m-x.t)/.2)),end=Math.min(1,x.t/.3),big=x.n?1.4:1;gkDim(x,()=>{g.save();g.fillStyle=rgba(SOC.b,.06*end);gEll(x.x,x.y,SO_RES);g.fill();g.strokeStyle=rgba(SOC.b,.22*end);g.setLineDash([4,6]);g.lineDashOffset=-t*8;gEll(x.x,x.y,SO_RES);g.stroke();g.setLineDash([]);g.restore();
 const gq=P(x.x,x.y,0);fxGlowS(gq.x,gq.y,22*big*gq.s,SOC.b,.3*end*(.8+.2*Math.sin(t*3+x.a)),22*big*gq.s*K,0)});
 for(let i=0;i<3;i++){const b=x.a+i*2.1,d=i?9:0;gkPrism(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,(i?5:8)*big,(i?24:40)*big*up*end,6,x.a+i,SOC.a,SOC.b,SOC.d,.92)}
 const q=P(x.x,x.y,44*big*up);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.25+.25*Math.sin(t*4+x.a));g.beginPath();g.arc(q.x,q.y,5*q.s,0,7);g.fill();g.restore()};
// prison des cinq pans : alerte 0,7 s, puis 2,2 s d'enfermement, puis éclatement
AUXF.so_penta=(x,dt)=>{const o=x.owner;if(x.done||!o)return;const el=x.m-x.t;
 if(el>=.7&&!x.tr){x.tr=new Set();for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)){x.tr.add(e);say(e,'ENFERMÉ',SOC.a)}fxRing(x.x,x.y,{u:o,r0:x.r*1.2,r1:x.r,col:SOC.a,c2:'#ffffff',t:.35,w:6});fxShake(.2,x.x,x.y);
  for(let i=0;i<5;i++){const b=x.a+i*1.2566;soHitFx(o,x.x+Math.cos(b)*x.r,x.y+Math.sin(b)*x.r,4)}if(near(x.x,x.y)){gkS('rock',o);gkS('deflect',o)}for(let i=0;i<5;i++){const b=x.a+i*1.2566;soCry(o,x.x+Math.cos(b)*x.r,x.y+Math.sin(b)*x.r,1)}}
 if(x.tr)for(const e of x.tr){if(e.dead)continue;const dx=e.x-x.x,dy=e.y-x.y,d=Math.hypot(dx,dy),lim=x.r-e.r-10;if(d>x.r+60){x.tr.delete(e);continue}if(e.dash||e.phase>0)continue;
  if(d>lim&&d>0){e.x=x.x+dx/d*lim;e.y=x.y+dy/d*lim;const vn=(e.kx*dx+e.ky*dy)/d;if(vn>0){e.kx-=vn*dx/d;e.ky-=vn*dy/d}}}
 if(x.t<=0){x.done=1;for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r+10)&&gkHit(e,o,58,{unblockable:1,fx:x.x,fy:x.y},'so_cry'))fxHitStop(o,e,58,1);jx({jfx:'gk_boom',x:x.x,y:x.y,r:x.r+10,v:'so_cry',s:'crys',t:.8,m:.8});
  // éclatement vers l'intérieur : les cinq murs volent en éclats, onde au rayon réel, givre de cristal au sol
  for(let i=0;i<5;i++){const b=x.a+i*1.2566+.628;soHitFx(o,x.x+Math.cos(b)*x.r*.8,x.y+Math.sin(b)*x.r*.8,7,b+Math.PI,1.4)}fxFlare(x.x,x.y,SOC.a,{u:o,z:40,r:40,t:.3,al:.7});fxLight(x.x,x.y,x.r*1.5,SOC.b,{u:o,t:.7,a:.4});
  fxRing(x.x,x.y,{u:o,r0:20,r1:x.r+10,col:SOC.b,c2:'#ffffff',t:.45,w:10});fxDebris(x.x,x.y,{u:o,n:14,sp:260,col:SOC.b,c2:SOC.a,s:5,t:1.3});fxDecal(x.x,x.y,'ice',{u:o,r:x.r*.8,t:4.5});fxShake(.42,x.x,x.y);
  if(near(x.x,x.y)){gkS('boom',o);gkS('rock',o)}}};
AUXD.so_penta=(x,k,t)=>{const el=x.m-x.t,rise=el<.7?0:ezo(Math.min(1,(el-.7)/.25)),R=x.r;if(x.done)return;
 // télégraphe : avant la fermeture, le cercle réel (liseré rouge si ennemi) ; pendant l'enfermement, la limite de la cage reste nette
 if(el<.7)fxTele(x.x,x.y,R,el/.7,SOC.b,x);else fxTele(x.x,x.y,R,(el-.7)/2.2,SOC.b,x,.05);g.save();g.fillStyle=rgba(SOC.b,.08+.1*Math.min(1,el/.7));gEll(x.x,x.y,R);g.fill();
 const V=[0,1,2,3,4].map(i=>{const b=x.a+i*1.2566;return P(x.x+Math.cos(b)*R,x.y+Math.sin(b)*R,0)});g.strokeStyle=rgba(SOC.b,.6+.4*Math.min(1,el/.7));g.lineWidth=2.5;g.beginPath();V.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.stroke();g.restore();
 if(rise>0)for(let i=0;i<5;i++){const b0=x.a+i*1.2566,b1=b0+1.2566,H=90*rise,n=4;for(let j=0;j<n;j++){const m=(j+.5)/n,bx=lerp(x.x+Math.cos(b0)*R,x.x+Math.cos(b1)*R,m),by=lerp(x.y+Math.sin(b0)*R,x.y+Math.sin(b1)*R,m);gkPrism(bx,by,14,H*(.75+.25*Math.sin(j*2.1+i)),5,b0+j,SOC.a,SOC.b,SOC.d,.55);if((i+j)%2===0){const tq=P(bx,by,H*.9);fxGlowS(tq.x,tq.y,(5+2*Math.sin(t*5+i+j))*tq.s,'#ffffff',.6*rise)}}}};
// ---- trait : Résonance
KGTRAITS[6]={nom:'Résonance',desc:'Tes cristaux restent plantés 4 s. Un ennemi à moins de 120 de l\'un d\'eux subit +15 % de tes dégâts ; toi, près d\'eux, tu subis −15 % de dégâts',
 deal(src,t,dmg,o){return soNear(src,t.x,t.y)?dmg*1.15:dmg},
 take(t,src,dmg,o){return src&&src!==t&&soNear(t,t.x,t.y)?dmg*.85:dmg},
 update(u,dt){u.so_rs=soNear(u,u.x,u.y)?1:0},
 draw(u,p,S,sk){if(!u.so_rs)return;const t=performance.now()/1000;gkDim(u,()=>{g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(SOC.a,.4+.2*Math.sin(t*5));g.lineWidth=1.3*S;g.beginPath();g.ellipse(p.x,p.y-30*S,22*S,36*S,0,0,7);g.stroke();g.restore();
  for(let i=0;i<3;i++){const b=t*1.8+i*2.09;fxGlowS(p.x+Math.cos(b)*22*S,p.y-30*S+Math.sin(b)*30*S,3*S,SOC.a,.7)}})},
 prev(u,p,S,front){if(front)return;g.save();g.fillStyle=rgba(SOC.b,.3);g.beginPath();g.ellipse(p.x,p.y,24*S,8*S,0,0,7);g.fill();g.restore()},
 hud(u,x,y){gkHud(u,x,y,'Résonance'+(u.so_rs?' · près de tes cristaux (−15 % subis)':''),null,0,SOC.a,SOC.a)}};
AFTER.push(()=>UK.push('so_rs'));
// ---- visuels
PROJD.so_sh=gkShardD('so_cry',15);
// dragon de cristal : tête anguleuse, corps de prismes, sillage de paillettes
PROJD.so_drag=(p,R,ra,t)=>{g.rotate(ra);fxTailL(R*5,R*2.2,SOC.b,.45*(p&&p.owner?fxA(p):1));{const n=gkN(6,p);g.save();g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const ph=(t/400+i*.17)%1;g.fillStyle=rgba(i%2?'#ffffff':SOC.a,.8*(1-ph));g.fillRect(-R*(1.5+ph*4),Math.sin(i*2.7+t/90)*R*.6*ph-1,2.2,2.2)}g.restore()}if(Math.cos(ra)<0)g.scale(1,-1);const s=R/20;g.scale(s,s);
 for(let i=6;i>=1;i--){const x=-i*11,y=Math.sin(t/90-i*.8)*5;g.fillStyle=i%2?SOC.b:SOC.a;g.strokeStyle=SOC.d;g.lineWidth=1.1;g.beginPath();g.moveTo(x+9,y);g.lineTo(x,y-11+i*.6);g.lineTo(x-9,y);g.lineTo(x,y+9-i*.5);g.closePath();g.fill();g.stroke()}
 g.fillStyle=SOC.a;g.strokeStyle=SOC.d;g.lineWidth=1.4;g.beginPath();g.moveTo(30,-2);g.lineTo(12,-14);g.lineTo(-4,-10);g.lineTo(-6,8);g.lineTo(10,10);g.lineTo(30,4);g.closePath();g.fill();g.stroke();
 g.fillStyle=SOC.b;g.beginPath();g.moveTo(4,-11);g.lineTo(-10,-26);g.lineTo(-2,-11);g.fill();g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(12,-5,2.4,0,7);g.fill();
 g.globalCompositeOperation='lighter';g.fillStyle=rgba(SOC.b,.3);g.beginPath();g.ellipse(4,0,30,16,0,0,7);g.fill()};
// cible enveloppée de cristal (entravée)
JFXD.so_enc=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const up=ezo(Math.min(1,e*6)),fade=Math.min(1,k*3);for(let i=0;i<6;i++){const b=i*1.047+.3;gkPrism(tg.x+Math.cos(b)*16,tg.y+Math.sin(b)*16,7,(30+(i%3)*12)*up*fade,5,b,SOC.a,SOC.b,SOC.d,.5);if(i%2===0){const q=P(tg.x+Math.cos(b)*16,tg.y+Math.sin(b)*16,(30+(i%3)*12)*up*fade);fxGlowS(q.x,q.y,4*q.s,'#ffffff',.7*fade)}}};
// prison : les cristaux se forment en spirale vers le point visé (décor de l'alerte ; le cercle d'alerte est tracé par le moteur)
JFXD.so_form=(f,k,e,t)=>{const n=gkN(10,f);g.save();g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const b=i*.628+e*4,d=f.r*(1.3-e*.9)*(.7+.3*((i*.37)%1)),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,4+e*20+(i%3)*6);g.fillStyle=rgba(i%2?'#ffffff':SOC.a,.85);g.beginPath();g.moveTo(p.x,p.y-4*p.s);g.lineTo(p.x+2*p.s,p.y);g.lineTo(p.x,p.y+4*p.s);g.lineTo(p.x-2*p.s,p.y);g.fill()}g.restore()};

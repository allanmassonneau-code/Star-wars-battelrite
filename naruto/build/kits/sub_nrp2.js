// ===== Subjutsu (ninjas sans clan), lot 2 : techniques des Sannin et de Naruto =====
// Serpents de l'ombre, Kage Bunshin : leurre, Barrière Shishienjin, Byakugô, Invocation : Manda, Fûton : Rasenshuriken
// (le chakra compte : Byakugô brûle ton chakra pour régénérer, le Rasenshuriken tranche celui des ennemis)
KIT('u',[
 [1,'B','x.sub_jashu','Serpents de l\'ombre','Des serpents jaillissent de ta manche, mordent le 1er ennemi touché (14 + venin 12 en 3 s) et le ramènent à toi, enlacé : entravé 0,9 s','chakra'],
 [2,'C','x.sub_leurre','Kage Bunshin : leurre','Tu deviens invisible 1,5 s ; un clone continue ta course : les ennemis le prennent pour toi, il s\'efface au 1er coup','smoke'],
 [4,'A','x.sub_shishi','Barrière Shishienjin','Quatre flammes violettes dressent un dôme au curseur : 3 s, les ennemis pris dedans ne peuvent plus en sortir (8 dégâts, le mur brûle et repousse)','genjutsu'],
 [4,'S','x.sub_byakugo','Byakugô','Losange sur le front : 4 s, chaque dégât subi est régénéré 1 s plus tard, en brûlant ton chakra (1 chakra pour 4 PV ; sans chakra, plus rien)','heal'],
 [5,'S','x.sub_manda','Invocation : Manda','Un serpent géant charge tout droit à travers l\'arène et avale le 1er ennemi touché : caché et neutralisé 1,5 s, puis recraché (42 dégâts au total)','smoke'],
 [5,'S','x.sub_rsk','Fûton : Rasenshuriken','Lancer longue portée : explose en sphère de lames de vent (jusqu\'à 40 dégâts) qui tranche le chakra : -30 chakra et plus aucun chakra récupéré 3 s','rasenshuriken'],
]);
// ---------- aides ----------
const subBI=u=>units.indexOf(u);
// les serpents : corps sinueux de la manche (A) à la tête (B), contour sombre épais, ventre clair ; tête « gueule ouverte » au bout
const SUBSN=[['#6f8f3c','#d8d0a0'],['#8a7a4a','#e8dcb0'],['#5a7a5a','#d0d8b0']];
function subBSnake(ax,ay,az,bx,by,bz,t,ph,ci,w0,w1,al,head,open){const L=Math.hypot(bx-ax,by-ay);if(L<2)return;const n=Math.max(4,Math.min(18,L/16|0)),px=-(by-ay)/L,py=(bx-ax)/L,pts=[],A=Math.min(11,L*.07),C=SUBSN[ci%3];
 for(let i=0;i<=n;i++){const f=i/n,w=Math.sin(f*Math.PI*2.6-t*14+ph)*A*Math.sin(Math.PI*Math.min(1,f*1.12));pts.push(P(ax+(bx-ax)*f+px*w,ay+(by-ay)*f+py*w,az+(bz-az)*f))}
 g.lineCap='round';g.lineJoin='round';for(const [c,add] of[[SUBK[0],3],[C[0],0]]){g.strokeStyle=rgba(c,al);for(let i=0;i<n;i++){const s=pts[i].s;g.lineWidth=(w0+(w1-w0)*i/n+add)*s;g.beginPath();g.moveTo(pts[i].x,pts[i].y);g.lineTo(pts[i+1].x,pts[i+1].y);g.stroke()}}
 g.strokeStyle=rgba(C[1],.85*al);g.lineWidth=1.3*pts[n].s;g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q.x,q.y+1.4*q.s):g.moveTo(q.x,q.y+1.4*q.s));g.stroke();
 // écailles : petits chevrons sombres
 g.strokeStyle=rgba('#2a3418',.6*al);g.lineWidth=1*pts[n].s;for(let i=1;i<n;i+=2){const q=pts[i],r=pts[i+1],a=Math.atan2(r.y-q.y,r.x-q.x),s=q.s*2;g.beginPath();g.moveTo(q.x+Math.cos(a+2.3)*s,q.y+Math.sin(a+2.3)*s);g.lineTo(q.x,q.y);g.lineTo(q.x+Math.cos(a-2.3)*s,q.y+Math.sin(a-2.3)*s);g.stroke()}
 if(head){const q=pts[n],r=pts[n-1];subBHead(q.x,q.y,Math.atan2(q.y-r.y,q.x-r.x),q.s*(w1/6),t+ph,ci,al,open)}}
function subBHead(x,y,a,s,t,ci,al,open){const C=SUBSN[ci%3],m=open?.55+Math.sin(t*20)*.12:.12;g.save();g.translate(x,y);g.rotate(a);g.scale(s,s);g.globalAlpha*=al;g.lineJoin='round';
 // langue fourchue (gueule ouverte)
 if(open){const w=Math.sin(t*30)*1.5;g.strokeStyle='#d0303a';g.lineWidth=1.2;g.beginPath();g.moveTo(5,0);g.lineTo(13,w);g.lineTo(16,w-2.4);g.moveTo(13,w);g.lineTo(16,w+2.4);g.stroke()}
 g.fillStyle=C[0];g.strokeStyle=SUBK[0];g.lineWidth=1.7;g.beginPath();g.moveTo(0,0);g.arc(-1,0,7.5,m,Math.PI*2-m);g.closePath();g.fill();g.stroke();
 if(open){g.fillStyle='#7a1420';g.beginPath();g.moveTo(-1,0);g.lineTo(6.6,Math.sin(m)*7);g.lineTo(6.6,-Math.sin(m)*7);g.closePath();g.fill();g.fillStyle='#ffffff';for(const k of[-1,1]){g.beginPath();g.moveTo(4.4,k*Math.sin(m)*6.2);g.lineTo(5.6,k*Math.sin(m)*3.4);g.lineTo(3.2,k*Math.sin(m)*5.4);g.fill()}}
 for(const k of[-1,1]){g.fillStyle='#ffd23a';g.beginPath();g.arc(-2.2,k*3.6,1.7,0,7);g.fill();g.strokeStyle=SUBK[0];g.lineWidth=.8;g.stroke();g.fillStyle='#111';g.fillRect(-2.5,k*3.6-1.1,.7,2.2)}
 g.restore()}
// flamme violette (Shishienjin) : goutte à double teinte, en mode additif
function subBFlame(x,y,h,s,t,sd,al){g.save();for(const [c,m,o,add] of[['#7a2ad0',1,.85,0],['#c890ff',.62,.7,1],['#ffffff',.3,.75,1]]){const w=(5+h*.2)*s*m,hh=h*s*m*(1+Math.sin(t*13+sd)*.12),sw=Math.sin(t*7+sd)*w*.5;
  g.globalCompositeOperation=add?'lighter':'source-over';g.fillStyle=rgba(c,o*al);g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*.9,y-hh*.55,x+sw,y-hh);g.quadraticCurveTo(x+w*.9,y-hh*.55,x+w,y);g.quadraticCurveTo(x,y+w*.5,x-w,y);g.fill();if(!add){g.strokeStyle=rgba('#2a0a40',.8*al);g.lineWidth=1.4;g.stroke()}}g.restore()}
// losange du Byakugô
function subBDiamond(x,y,w,h,fill,line,lw){g.fillStyle=fill;g.beginPath();g.moveTo(x,y-h);g.lineTo(x+w,y);g.lineTo(x,y+h);g.lineTo(x-w,y);g.closePath();g.fill();if(line){g.strokeStyle=line;g.lineWidth=lw||1;g.stroke()}}
Object.assign(NAT,{
 // --- Serpents de l'ombre (Sen'ei Jashu) : trois serpents jaillissent de la manche ; le 1er ennemi mordu est ramené au lanceur et reste enlacé
 sub_jashu:S_('Serpents de l\'ombre','Serpents qui mordent et ramènent la cible',10,{ai:RG(430,.6,60)},(u,a)=>{anim(u,'sub_jashu',.55);S('shadow',u);S('dash',u);
  proj(u,a,{spd:900,r:13,dmg:14,life:.5,col:'#6f8f3c',vfx:'kunai',kind:'sub_snkh',noClash:1,o:{root:.9,dot:{dps:4,dur:3}},onHit:(p,t)=>{const o=p.owner,x=aux.find(q=>q.type==='sub_snk'&&q.p===p);
   if(x){x.n=1;x.tg=t;x.ti=subBI(t);x.t=x.m=1.05;x.x=t.x;x.y=t.y}jx({jfx:'sub_coil',ti:subBI(t),x:t.x,y:t.y,t:1.1,m:1.1});
   if(t.unstop<=0&&!o.dead&&!t.dead){const b=ang(o,t),q=subFree({x:o.x+Math.cos(b)*(o.r+t.r+8),y:o.y+Math.sin(b)*(o.r+t.r+8)},t.r);t.dash={sx:t.x,sy:t.y,tx:q.x,ty:q.y,t:0,dur:.3,jump:10};t.cast=null;t.kx=t.ky=0}}});
  const p=projs[projs.length-1];aux.push({type:'sub_snk',x:p.x,y:p.y,r:0,t:.8,m:.8,team:u.team,owner:u,ui:subBI(u),p,n:0,a})}),
 // --- Kage Bunshin : leurre — invisible, le clone continue la course ; les bots le visent (voir pickTarget plus bas)
 sub_leurre:S_('Kage Bunshin : leurre','Invisible, un clone court à ta place',14,{ai:{mode:'esc',max:230,p:.55}},(u,a)=>{anim(u,'sub_seal',.3);S('poof',u);subPoof(u.x,u.y,40,u);
  const q=subFree({x:u.x,y:u.y},16),p=subCarrier(u,q.x,q.y,'sub_decoy',{life:2.3,r:1,ox:a,zapP:1});
  const D=Object.create(u);Object.assign(D,{x:q.x,y:q.y,vx:0,vy:0,dead:false,stealth:0,swing:0,cast:null,spin:null,flame:null,dash:null,z:0,phase:0,sub_eat:0,sub_dk:1});
  aux.push({type:'sub_leurre',x:q.x,y:q.y,r:0,t:2.3,m:2.3,team:u.team,owner:u,p,D,a,a0:a,ck:0});
  u.stealth=Math.max(u.stealth,1.5);
  for(const e of units)if(e.team!==u.team&&e.tgt===u)e.tgt=D}),
 // --- Barrière Shishienjin : quatre flammes violettes puis le dôme ; enfermés dedans, ou tenus dehors
 sub_shishi:S_('Barrière Shishienjin','Dôme violet : les ennemis enfermés ne sortent plus',17,{cast:.25,tele:{r:150,max:420},ai:RG(400,.55)},(u,a,td)=>{const p=subFree(atP(u,a,td,420),60);anim(u,'sub_shishi',.75);S('genjutsu',u);
  aux.push({type:'sub_shishi',x:p.x,y:p.y,r:150,t:3.45,m:3.45,team:u.team,owner:u,n:0,side:new Map(),bt:new Map()});jx({jfx:'sub_shishiup',x:p.x,y:p.y,r:150,t:.45,m:.45})}),
 // --- Byakugô (Tsunade) : le sceau libère le chakra stocké ; chaque blessure se referme 1 s plus tard, tant qu'il reste du chakra
 sub_byakugo:S_('Byakugô','4 s : régénère les dégâts subis 1 s plus tard',18,{ai:{mode:'self',max:280,p:.45}},(u)=>{anim(u,'sub_byk',.75);S('ignite',u);S('orb',u);u.sub_byk=4;
  for(const x of aux)if(x.type==='sub_byk'&&x.owner===u)x.act=0;
  aux.push({type:'sub_byk',x:u.x,y:u.y,r:0,t:5.3,m:5.3,team:u.team,owner:u,ui:subBI(u),hp0:u.hp,q:[],act:4,clk:0,n:0});say(u,'BYAKUGÔ !','#d08aff');jx({jfx:'sub_bykon',ui:subBI(u),x:u.x,y:u.y,t:1,m:1})}),
 // --- Invocation : Manda : sort d'un nuage derrière le lanceur et charge en ligne droite
 sub_manda:ULT('Invocation : Manda','Serpent géant qui avale le 1er ennemi',{cast:.45,line:{len:1000,w:100},ai:{max:700,p:.8}},(u,a)=>{anim(u,'sub_manda',.8);S('poof',u);S('roar',u);
  const s=subFree({x:u.x-Math.cos(a)*60,y:u.y-Math.sin(a)*60},40);subPoof(s.x,s.y,110,u);sparks(s.x,s.y,'#eceff4',16,'smoke');if(near(s.x,s.y))shake=Math.max(shake,.3);
  const c=subCarrier(u,s.x,s.y,'sub_mandah',{life:4.3,r:1,ox:a,ar:0,zapP:0});aux.push({type:'sub_manda',x:s.x,y:s.y,a,len:0,r:46,t:4.2,m:4.2,team:u.team,owner:u,p:c,n:0,w:0,sw:0})}),
 // --- Fûton : Rasenshuriken : formé au-dessus de la main (incantation), lancé loin ; la sphère de lames tranche le chakra
 sub_rsk:ULT('Fûton : Rasenshuriken','Sphère de lames de vent qui tranche le chakra',{cast:.5,line:{len:640,w:70},ai:{max:600,p:.8}},(u,a,td)=>{anim(u,'sub_rsk',.45);S('wind',u);S('rasengan',u);
  const L=clamp(td||600,140,640);proj(u,a,{spd:640,r:20,dmg:8,life:L/640,col:'#c8fff0',vfx:'rasenshuriken',kind:'sub_rskp',big:1,noClash:1,onHit:(p,t)=>{p.bx=t.x;p.by=t.y}});
  aux.push({type:'sub_rskt',x:u.x,y:u.y,r:0,t:2,m:2,team:u.team,owner:u,p:projs[projs.length-1]})}),
});
AFTER.push(()=>UK.push('sub_byk','sub_eat','sub_ckc'));
// ---------- logique des objets (hôte) ----------
// serpents : 0 = en vol (suit le projectile) ; 1 = cible mordue, ramenée puis enlacée ; 2 = ratés, ils se rétractent
AUXF.sub_snk=x=>{const u=x.owner;if(!u||u.dead){x.t=0;return}
 if(x.n===0){const p=x.p;if(p&&!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}if(!p||!p.hitAny){x.n=2;x.t=x.m=.22}return}
 if(x.n===1){const e=x.tg;if(!e||e.dead){x.n=2;x.t=x.m=.2;return}x.x=e.x;x.y=e.y;if(!e.dash&&!(e.root>0)&&x.t>.2)x.t=.2}};
// Kage Bunshin : le clone court tout droit (en zigzag léger), contourne les murs ; un tir, un coup ou une ruée ennemie le dissipe
AUXF.sub_leurre=(x,dt)=>{const u=x.owner,p=x.p,D=x.D;if(!p||p.life<=0||D.dead){D.dead=true;x.t=0;return}
 const end=()=>{D.dead=true;p.life=0;x.t=0;subPoof(p.x,p.y,40,u);if(near(p.x,p.y))say(D,'BUNSHIN !','#eceff4')};
 if(u.dead||x.t<=.03){end();return}
 if(u.ambush>0)u.ambush=0; // diversion, pas d'embuscade : sortir de l'invisibilité ne donne pas le bonus de dégâts
 for(const q of projs)if(q!==p&&q.life>0&&!q.grenade&&q.owner&&q.owner.team!==u.team&&Math.abs(q.x-p.x)<44&&Math.hypot(q.x-p.x,q.y-p.y)<q.r+18){if(!(q.big||q.rocket||q.pierce||q.dmg>20)){q.life=0;q.dead=1}end();return}
 for(const e of enemies(u)){const d=Math.hypot(e.x-p.x,e.y-p.y);if((e.swing>.1&&d<95&&angDiff(e.swingA,Math.atan2(p.y-e.y,p.x-e.x))<1.1)||(e.dash&&d<e.r+20)||(e.spin&&d<e.spin.r+16)){end();return}}
 for(const z of zones)if(z.owner&&z.owner.team!==u.team&&z.t<.06&&Math.hypot(z.x-p.x,z.y-p.y)<z.r+16){end();return}
 x.ck+=dt;const sp=u.ch.spd*SPD_K*1.18,ox=p.x,oy=p.y;
 // pas au travers des ennemis : il les contourne
 for(const e of enemies(u)){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);if(d<70&&d>1&&dx*Math.cos(x.a)+dy*Math.sin(x.a)>0){x.a+=((Math.cos(x.a)*dy-Math.sin(x.a)*dx)>0?-1:1)*2.4*dt;break}}
 const h=x.a+Math.sin(x.ck*3.2)*.28;p.x+=Math.cos(h)*sp*dt;p.y+=Math.sin(h)*sp*dt;subFree(p,16);
 if(Math.hypot(p.x-ox,p.y-oy)<sp*dt*.45){const cx=CX-p.x,cy=CY-p.y,cr=Math.cos(x.a)*cy-Math.sin(x.a)*cx;x.a+=(cr>=0?1:-1)*1.25}
 D.vx=(p.x-ox)/Math.max(dt,1e-3);D.vy=(p.y-oy)/Math.max(dt,1e-3);D.x=p.x;D.y=p.y;x.x=p.x;x.y=p.y;p.ox=h;p.zapP=1};
// Shishienjin : 0 = les quatre flammes s'allument (0,45 s) ; 1 = dôme, les ennemis gardent leur côté (dedans / dehors) ; toucher le mur brûle
AUXF.sub_shishi=(x,dt)=>{const u=x.owner;
 if(x.n===0){if(x.m-x.t<.45)return;x.n=1;let c=0;VFX='genjutsu';for(const e of enemies(u)){const d=Math.hypot(e.x-x.x,e.y-x.y),i=d<x.r;x.side.set(e,i);if(i&&!(e.phase>0)&&!(e.sub_eat>0)){c++;hit(e,u,8,{unblockable:1});say(e,'PIÉGÉ','#d8a8ff')}}VFX=null;
  jx({jfx:'sub_shishif',x:x.x,y:x.y,r:x.r,t:3,m:3});if(near(x.x,x.y)){S('flame',u);S('fire',u);shake=Math.max(shake,c?.25:.12)}return}
 if(x.t<=0)return;
 for(const e of enemies(u)){if(e.sub_eat>0)continue;let i=x.side.get(e);const d=Math.hypot(e.x-x.x,e.y-x.y);if(i===undefined){i=d<x.r;x.side.set(e,i)}
  const lim=i?x.r-e.r-2:x.r+e.r+2;if(i?d<=lim:d>=lim)continue;
  const b=d>.5?Math.atan2(e.y-x.y,e.x-x.x):rnd()*7,lp=Math.max(0,lim);e.x=x.x+Math.cos(b)*lp;e.y=x.y+Math.sin(b)*lp;e.dash=null;e.kx=e.ky=0;collide(e);
  // repoussé de l'autre côté par un obstacle : on le garde du bon côté quand même
  if(i&&Math.hypot(e.x-x.x,e.y-x.y)>x.r){e.x=x.x+Math.cos(b)*lp;e.y=x.y+Math.sin(b)*lp}
  const bt=x.bt.get(e)||0;if(SIMT>bt){x.bt.set(e,SIMT+.45);VFX='genjutsu';hit(e,u,6,{unblockable:1,kb:i?0:120,fx:x.x,fy:x.y});VFX=null;if(near(e.x,e.y)){sparks(e.x,e.y,'#c080ff',8,'genjutsu');jx({jfx:'sub_shwall',x:x.x+Math.cos(b)*x.r,y:x.y+Math.sin(b)*x.r,a:b,t:.4,m:.4})}}}};
// Byakugô : la perte de PV est mise en file et rendue 1 s plus tard (1 chakra pour 2 PV) ; la régénération continue 1 s après la fin du sceau
AUXF.sub_byk=(x,dt)=>{const u=x.owner;if(!u||u.dead){if(u)u.sub_byk=0;x.t=0;return}x.x=u.x;x.y=u.y;x.clk+=dt;x.act-=dt;u.sub_byk=Math.max(0,x.act);
 const loss=x.hp0-u.hp;if(loss>.05&&x.act>0){x.q.push([x.clk+1,loss]);jx({jfx:'sub_bykq',ui:x.ui,x:u.x,y:u.y,t:1.12,m:1.12,n:(x.n++)%3})}
 let due=0;while(x.q.length&&x.q[0][0]<=x.clk)due+=x.q.shift()[1];
 if(due>0){const can=Math.min(due,u.energy*4,u.max-u.hp);if(can>0){u.hp+=can;u.energy=Math.max(0,u.energy-can/4);stOf(u).heal+=can;if(near(u.x,u.y)&&can>=1)say(u,'◆ +'+Math.round(can),'#b8ffb0')}
  if(can<due-.5&&u.energy<1&&near(u.x,u.y))say(u,'PLUS DE CHAKRA','#4ab0ff')}
 x.hp0=u.hp;if(x.act<=0&&!x.q.length){x.t=0;u.sub_byk=0}if(x.t<=0)u.sub_byk=0};
// Manda : 0 = sort du nuage ; 1 = charge ; 2 = la proie est avalée (cachée, intangible, étourdie) ; 3 = disparaît en fumée
function subBMandaBite(x,u,e){VFX='smoke';const ok=hit(e,u,12,{unblockable:1});VFX=null;if(near(e.x,e.y)){S('roar',u);S('heavy',u);shake=Math.max(shake,.3)}
 if(!ok||e.unstop>0||e.dead){x.n=3;x.t=Math.min(x.t,.55);if(ok&&!e.dead)say(e,'RÉSISTE','#fc6');return}
 x.n=2;x.tg=e;x.ti=subBI(e);x.sw=1.5;e.sub_eat=1.5;e.phase=Math.max(e.phase||0,.2);e.stun=Math.max(e.stun,1.5);e.cast=null;e.dash=null;e.spin=null;e.flame=null;e.block=false;e.kx=e.ky=0;
 say(e,'AVALÉ !','#d8a8ff');jx({jfx:'sub_mgulp',x:e.x,y:e.y,t:.45,m:.45})}
function subBMandaSpit(x,u,e){x.n=3;x.t=Math.min(x.t,.7);if(!e)return;e.sub_eat=0;if(e.dead)return;e.phase=0;const ca=Math.cos(x.a),sa=Math.sin(x.a),q=subFree({x:x.x+ca*(x.r+e.r+16),y:x.y+sa*(x.r+e.r+16)},e.r);e.x=q.x;e.y=q.y;collide(e);
 VFX='smoke';hit(e,u,30,{kb:520,stun:.45,unblockable:1,fx:x.x,fy:x.y});VFX=null;say(e,'RECRACHÉ !','#d8a8ff');jx({jfx:'sub_mspit',x:e.x,y:e.y,a:x.a,t:.6,m:.6});if(near(e.x,e.y)){S('water',e);S('heavy',e);shake=Math.max(shake,.3)}}
AUXF.sub_manda=(x,dt)=>{const u=x.owner,ca=Math.cos(x.a),sa=Math.sin(x.a);
 // porteur de la tête détruit (dôme qui dévore les projectiles…) : recréé
 if((!x.p||x.p.dead||x.p.life<=0)&&x.t>.1&&u)x.p=subCarrier(u,x.x,x.y,'sub_mandah',{life:x.t+.05,r:1,ox:x.a,ar:x.w,zapP:x.n});const c=x.p;
 if(x.n===0){x.w=Math.min(1,x.w+dt/.3);if(x.w>=1)x.n=1}
 else if(x.n===1){const st=1000*dt;x.x+=ca*st;x.y+=sa*st;x.len+=st;const hx=x.x+ca*22,hy=x.y+sa*22;
  for(const e of enemies(u)){if(e.phase>0||e.sub_eat>0)continue;if(Math.hypot(e.x-hx,e.y-hy)<x.r+e.r){subBMandaBite(x,u,e);break}}
  if(x.n===1&&(x.len>=1150||x.x<B.x+40||x.x>B.x+B.w-40||x.y<B.y+40||x.y>B.y+B.h-40)){x.n=3;x.t=Math.min(x.t,.55);subPoof(x.x,x.y,100,u)}}
 else if(x.n===2){const e=x.tg;x.sw-=dt;
  if(e&&!e.dead){e.x=x.x;e.y=x.y;e.kx=e.ky=0;e.dash=null;e.cast=null;e.stun=Math.max(e.stun,.12);e.phase=Math.max(e.phase||0,.12);e.sub_eat=Math.max(.05,x.sw)}
  if(x.sw<=0||x.t<.75||!e||e.dead)subBMandaSpit(x,u,e)}
 if(x.t<=0&&x.tg&&x.tg.sub_eat>0)x.tg.sub_eat=0;
 if(c){c.x=x.x;c.y=x.y;c.ox=x.a;c.zapP=x.n;c.ar=x.n===3?Math.max(0,x.t/.55):x.w;c.rock=x.n===2?1:0;c.life=Math.max(.02,x.t+.02)}};
// Rasenshuriken : suit le projectile ; à l'impact (ou au bout de sa course, ou contre un pilier) la sphère de lames éclate
AUXF.sub_rskt=x=>{const p=x.p;if(!p){x.t=0;return}if(!p.dead&&p.life>0){x.x=p.x;x.y=p.y;return}x.t=0;const u=p.owner||x.owner;if(!u)return;const q=subFree({x:p.bx??p.x,y:p.by??p.y},20);subBRskBoom(u,q.x,q.y)}; // renvoyé (parade, renvoi) : il explose pour celui qui l'a renvoyé
function subBRskBoom(u,x,y){aux.push({type:'sub_rskd',x,y,r:135,t:1.05,m:1.05,k:0,team:u.team,owner:u,hs:new Set()});jx({jfx:'sub_rskboom',x,y,r:135,t:.5,m:.5});jx({jfx:'sub_rskdome',x,y,r:135,t:1.05,m:1.05});
 if(near(x,y)){S('boom',u);S('wind',u);shake=Math.max(shake,.4)}}
function subBCut(u,e){const lost=Math.min(e.energy,30);e.energy-=lost;if(near(e.x,e.y))say(e,'-'+Math.round(lost)+' CHAKRA','#4ab0ff');jx({jfx:'sub_ckdrain',ti:subBI(e),x:e.x,y:e.y,t:.9,m:.9});
 const o=aux.find(a=>a.type==='sub_ckc'&&a.tg===e);if(o){o.t=o.m=3;o.cap=e.energy}else aux.push({type:'sub_ckc',x:e.x,y:e.y,r:0,t:3,m:3,team:u.team,owner:u,tg:e,ti:subBI(e),cap:e.energy,sh:0});e.sub_ckc=3}
AUXF.sub_rskd=x=>{const u=x.owner;if(!u)return;
 if(x.k<=0&&x.t>.05){x.k=.15;VFX='rasenshuriken';for(const e of enemies(u)){if(Math.hypot(e.x-x.x,e.y-x.y)>=x.r+e.r)continue;if(hit(e,u,3,{unblockable:1,slow:.5,pull:150,fx:x.x,fy:x.y})&&!x.hs.has(e)){x.hs.add(e);subBCut(u,e)}}VFX=null}
 if(x.t<=0&&!x.done){x.done=1;VFX='rasenshuriken';for(const e of enemies(u))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r)hit(e,u,10,{kb:380,unblockable:1,fx:x.x,fy:x.y});VFX=null;detoFx(x.x,x.y,x.r,'rasenshuriken');if(near(x.x,x.y)){S('boom',u);shake=Math.max(shake,.3)}}};
// chakra tranché : le chakra de la cible ne peut plus remonter (charge, coups, pilules…)
AUXF.sub_ckc=(x,dt)=>{const e=x.tg;if(!e||e.dead){if(e)e.sub_ckc=0;x.t=0;return}x.x=e.x;x.y=e.y;e.sub_ckc=Math.max(0,x.t);x.sh-=dt;
 if(e.energy>x.cap+.01){e.energy=x.cap;if(x.sh<=0&&e.chk){x.sh=1.2;if(near(e.x,e.y))say(e,'CHAKRA COUPÉ','#4ab0ff')}}else x.cap=e.energy;if(x.t<=0)e.sub_ckc=0};
// ---------- branchements (une fois tout le jeu chargé) ----------
AFTER.push(()=>{
 // les bots visent le clone-leurre le plus proche (et jamais une proie avalée par Manda)
 const PT=pickTarget;pickTarget=u=>{let b=PT(u);if(b&&b.sub_eat>0)b=null;let dc=null,dd=mode==='battle'?800:1e9,ow=null;
  for(const x of aux)if(x.type==='sub_leurre'&&x.team!==u.team&&x.D&&!x.D.dead){const d=dist(u,x.D);if(d<dd){dd=d;dc=x.D;ow=x.owner}}
  return dc&&(!b||b===ow||dd<dist(u,b)+150)?dc:b};
 // proie avalée : ni dessinée ni ciblable
 const DU=drawUnit;drawUnit=u=>{if(u.sub_eat>0&&!u.dead)return;DU(u)};
 // le Rasenshuriken a son propre lancement (pas la sphère générique dans la main)
 const JR=JFX.rasenshuriken;JFX.rasenshuriken=(u,a,td,pre,ab)=>{if(ab&&ab.key==='sub_rsk')return;if(JR)JR(u,a,td,pre,ab)};
 // losange du Byakugô sur le front : visage 2D…
 if(typeof drawNinjaHead==='function'){const DH=drawNinjaHead;drawNinjaHead=(u,h,fx,fy,back,fl,t,run)=>{DH(u,h,fx,fy,back,fl,t,run);if(back||!(u.sub_byk>0))return;const ex=fx*1.5+fx*3.5,hy=-53;
  g.save();g.globalCompositeOperation='lighter';circ(ex,hy-1.4,3.2,'rgba(200,120,255,.35)');g.restore();subBDiamond(ex,hy-1.4,1.25,1.8,'#a050e0','#3a1050',.6)}}
 // … et visage 3D (décalque du visage redessiné avec le losange)
 if(typeof poseModel==='function'){const PM=poseModel,cache=new Map();
  const bykTex=(L,md)=>{const base=faceTexture(L,md),key=base.uuid;if(cache.has(key))return cache.get(key);const c=document.createElement('canvas');c.width=256;c.height=200;const x=c.getContext('2d');x.drawImage(base.image,0,0);
   const U=9.7,ex=128,hy=100,y=hy-1.5*U;x.fillStyle='rgba(200,120,255,.35)';x.beginPath();x.arc(ex,y,2*U,0,7);x.fill();x.fillStyle='#a050e0';x.strokeStyle='#3a1050';x.lineWidth=3;x.beginPath();x.moveTo(ex,y-1.25*U);x.lineTo(ex+.85*U,y);x.lineTo(ex,y+1.25*U);x.lineTo(ex-.85*U,y);x.closePath();x.fill();x.stroke();
   const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;cache.set(key,t);return t};
  poseModel=(u,rec,dt,t)=>{PM(u,rec,dt,t);if(!rec.face||!rec.face.material||!u.ch)return;const want=u.sub_byk>0&&!u.dead,key=(rec.fm||'o')+(want?'+b':'');if(rec.sbB===key)return;rec.sbB=key;
   rec.face.material.map=want?bykTex(u.ch.look,rec.fm||'o'):faceTexture(u.ch.look,rec.fm||'o');rec.face.material.needsUpdate=true}}});
// ---------- visuels ----------
// serpents (au sol, sous les ninjas : ils sortent de la manche)
PROJD.sub_snkh=()=>{};
AUXD.sub_snk=(x,k,t)=>{const o=x.ui!=null?units[x.ui]:null;if(!o||o.dead)return;const a=o.aim,hx=o.x+Math.cos(a)*14,hy=o.y+Math.sin(a)*14,tg=x.n===1&&x.ti!=null?units[x.ti]:null;
 const ex=tg?tg.x:x.x,ey=tg?tg.y:x.y,d=Math.hypot(ex-hx,ey-hy)||1,px=-(ey-hy)/d,py=(ex-hx)/d,rt=x.n===2?x.t/x.m:1,al=Math.min(1,k*1.4);
 for(let i=0;i<3;i++){const sp=x.n===1?(i-1)*4:(i-1)*13,bx=hx+(ex-hx)*rt+px*sp*rt,by=hy+(ey-hy)*rt+py*sp*rt;subBSnake(hx,hy,32,bx,by,x.n===1?30:26,t,i*2.1,i,3,6.4,al,x.n!==1,x.n===0)}};
// anneaux du serpent autour de la cible (par-dessus le ninja : seule la moitié avant de chaque anneau)
JFXD.sub_coil=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,sq=1-.12*Math.min(1,e*4),al=Math.min(1,k*5,e*8);g.lineCap='round';
 for(let i=0;i<3;i++){const h=(14+i*12)*s,rx=(15-i*1.5)*s*sq*1.3,ry=5*s*1.3,C=SUBSN[i%3];for(const [c,w] of[[SUBK[0],6.5],[C[0],4]]){g.strokeStyle=rgba(c,al);g.lineWidth=w*s;g.beginPath();g.ellipse(q.x,q.y-h*1.3,rx,ry,(i-1)*.12,.1,Math.PI-.1);g.stroke()}
  g.strokeStyle=rgba(C[1],.8*al);g.lineWidth=1*s;g.beginPath();g.ellipse(q.x,q.y-h*1.3+1.2*s,rx,ry,(i-1)*.12,.3,Math.PI-.3);g.stroke()}
 subBHead(q.x+16*s,q.y-56*s,-.5+Math.sin(t*6)*.15,s*1.25,t,1,al,1)};
// clone-leurre : un vrai ninja (même dessin que le lanceur : anneau, barre de vie, nom), trié en profondeur grâce à son porteur
const SUBDK=new Map();
PROJD.sub_decoy=(p,R,ra,t)=>{const z=Math.sin(Math.PI*(1-p.life/p.life0))*70+15,q0=P(p.x,p.y,z);g.scale(1/q0.s,1/q0.s);g.translate(-q0.x,-q0.y);const o=units[p.oy];if(!o||!o.ch)return;
 const id=p.life0,now=t/1000;let f=SUBDK.get(id);if(!f||f.c!==o.c){f=mkUnit(o.c,p.x,p.y,o.team);f._t=now;SUBDK.set(id,f);if(SUBDK.size>12)for(const [k2,v] of SUBDK)if(now-(v._seen||0)>3)SUBDK.delete(k2)}
 const dt=Math.min(.05,Math.max(0,now-f._t));f._t=now;f._seen=now;f.x=p.x;f.y=p.y;f.aim=p.ox||0;f.moving=p.zapP===1;if(f.moving)f.walk+=dt*15;f.sprint=true;
 for(const k2 of['hp','max','energy','hero','human','team','shield'])f[k2]=o[k2];f.stam=100;f.stealth=0;f.dead=false;f.cast=null;
 g.save();g.globalAlpha*=Math.min(1,p.life/.15+.1);drawUnit(f);g.restore()};
// Shishienjin : flammes qui s'allument aux quatre coins, puis dôme violet (arrière au sol, avant par-dessus les ninjas)
const subBCorners=(x,y,r)=>[0,1,2,3].map(i=>{const b=Math.PI/4+i*Math.PI/2;return{x:x+Math.cos(b)*r,y:y+Math.sin(b)*r}});
AUXD.sub_shishi=(x,k,t)=>{const q=P(x.x,x.y,0),R=x.r*q.s,on=x.n===1,e=on?1:Math.min(1,(x.m-x.t)/.45);
 g.fillStyle=rgba('#6a2a9a',(on?.18:.1*e)*k);gEll(x.x,x.y,x.r);g.fill();
 g.strokeStyle=rgba('#c080ff',(on?.8:.6)*k);g.lineWidth=on?3:2;if(!on){g.setLineDash([12,8]);g.lineDashOffset=-t*40}gEll(x.x,x.y,x.r*(on?1:.4+.6*e));g.stroke();g.setLineDash([]);
 // sceau au sol : carré inscrit entre les quatre flammes
 const C=subBCorners(x.x,x.y,x.r).map(c=>P(c.x,c.y,0));g.strokeStyle=rgba('#a060e0',.45*k*e);g.lineWidth=1.6;g.beginPath();C.forEach((c,i)=>i?g.lineTo(c.x,c.y):g.moveTo(c.x,c.y));g.closePath();g.stroke();
 if(on){g.save();const H=x.r*.78*q.s,gr=g.createLinearGradient(0,q.y-H,0,q.y);gr.addColorStop(0,rgba('#a050f0',.26*k));gr.addColorStop(1,rgba('#5a1a8a',.16*k));g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y,R,H,0,Math.PI,Math.PI*2);g.ellipse(q.x,q.y,R,R*K,0,0,Math.PI);g.fill();
  g.strokeStyle=rgba('#d8a8ff',.5*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,Math.PI,Math.PI*2);g.stroke();g.restore()}
 // flammes des deux coins du fond (celles de devant sont dessinées par-dessus les ninjas)
 for(const i of[2,3]){const c=C[i];subBFlame(c.x,c.y,(on?62:62*e)+Math.sin(t*5+i)*5,c.s,t,i*1.7,k)}};
JFXD.sub_shishiup=(f,k,e,t)=>{const C=subBCorners(f.x,f.y,f.r);for(let i=0;i<2;i++){const c=P(C[i].x,C[i].y,0);subBFlame(c.x,c.y,62*Math.min(1,e*1.3),c.s,t,i*1.7,1)}
 // montée des quatre flammes : traits de lumière vers le centre
 g.save();g.globalCompositeOperation='lighter';const m=P(f.x,f.y,f.r*.75*e);for(const c0 of C){const c=P(c0.x,c0.y,30);g.strokeStyle=rgba('#c080ff',.5*e);g.lineWidth=2*c.s;g.beginPath();g.moveTo(c.x,c.y);g.lineTo(lerp(c.x,m.x,e),lerp(c.y,m.y,e));g.stroke()}g.restore()};
JFXD.sub_shishif=(f,k,e,t)=>{const q=P(f.x,f.y,0),R=f.r*q.s,H=f.r*.78*q.s,a=Math.min(1,e*10,k*5),T=e*f.m;g.save();
 // contour du dôme et méridiens (avant)
 g.strokeStyle=rgba('#c080ff',.75*a);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,R,H,0,Math.PI,Math.PI*2);g.stroke();
 g.strokeStyle=rgba('#e8d0ff',.35*a);g.lineWidth=1.4;for(const m of[-.6,-.25,.25,.6]){g.beginPath();g.ellipse(q.x+m*R*.0,q.y,R*Math.abs(m)*1.02,H,0,m<0?Math.PI:Math.PI*1.5,m<0?Math.PI*1.5:Math.PI*2);g.stroke()}
 for(const h of[.35,.7]){g.beginPath();g.ellipse(q.x,q.y-H*h,R*Math.sqrt(1-h*h),R*K*Math.sqrt(1-h*h),0,0,Math.PI);g.stroke()}
 // base avant : petites flammes qui courent sur le bord
 g.strokeStyle=rgba('#c080ff',.8*a);g.lineWidth=3;g.beginPath();g.ellipse(q.x,q.y,R,R*K,0,0,Math.PI);g.stroke();
 for(let i=0;i<10;i++){const b=.15+i/9*(Math.PI-.3),p=P(f.x+Math.cos(b)*f.r,f.y+Math.sin(b)*f.r,0);subBFlame(p.x,p.y,14+6*Math.sin(t*9+i*1.9),p.s,t,i,.7*a)}
 // reflet qui balaie le dôme
 g.globalCompositeOperation='lighter';const sw=((T*.9)%1.4)-.2;if(sw>0&&sw<1){g.strokeStyle=rgba('#ffffff',.25*a);g.lineWidth=6;g.beginPath();g.ellipse(q.x,q.y,R*.92,H*.92,0,Math.PI+sw*2.2,Math.PI+sw*2.2+.5);g.stroke()}
 g.restore();const C=subBCorners(f.x,f.y,f.r);for(const i of[0,1]){const c=P(C[i].x,C[i].y,0);subBFlame(c.x,c.y,62+Math.sin(t*5+i)*5,c.s,t,i*1.7,a)}};
JFXD.sub_shwall=(f,k,e,t)=>{const q=P(f.x,f.y,24);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#e8c8ff',.9*k);g.lineWidth=3*q.s;g.beginPath();g.arc(q.x,q.y,(10+e*22)*q.s,0,7);g.stroke();
 for(let i=0;i<6;i++){const b=i*1.05+f.a;g.beginPath();g.moveTo(q.x+Math.cos(b)*6*q.s,q.y+Math.sin(b)*4*q.s);g.lineTo(q.x+Math.cos(b)*(14+e*20)*q.s,q.y+Math.sin(b)*(9+e*12)*q.s);g.stroke()}g.restore()};
// Byakugô : losange sur le front (visage), lueur, anneau de sceaux aux pieds ; jauge de la régénération en attente
STATD.push((u,p,S,sk)=>{if(!(u.sub_byk>0))return;const t=performance.now()/1000,s2=sk||1,a=Math.min(1,u.sub_byk*2);g.save();g.globalCompositeOperation='lighter';
 g.strokeStyle=rgba('#c080ff',.55*a);g.lineWidth=2;g.beginPath();g.ellipse(p.x,p.y,26*S/1.3,10*S/1.3,0,0,7);g.stroke();
 for(let i=0;i<4;i++){const b=t*1.6+i*Math.PI/2,x=p.x+Math.cos(b)*26*S/1.3,y=p.y+Math.sin(b)*10*S/1.3;subBDiamond(x,y,2.6*S/1.3,3.6*S/1.3,rgba('#d8a8ff',.8*a))}
 for(let i=0;i<5;i++){const h=((t*.8+i/5)%1),x=p.x+Math.sin(i*2.4+t)*14*S/1.3,y=p.y-(10+h*60)*S*s2/1.3;subBDiamond(x,y,1.6*S/1.3,2.2*S/1.3,rgba(i%2?'#b8ffb0':'#d8a8ff',.7*(1-h)*a))}
 if(Math.sin(u.aim)>-.3){const fx=Math.cos(u.aim),d3=N3.ok&&N3.tile.get(u);circ(p.x+fx*(d3?3:5)*S,p.y-(d3?47:52.5)*S*s2,(2.6+Math.sin(t*6)*.6)*S,rgba('#c070ff',.45*a))}g.restore()});
JFXD.sub_bykon=(f,k,e,t,u)=>{if(!u)return;const q=P(u.x,u.y,0),s=q.s*1.3,sk=u.ch.look.scale||1,hx=q.x+Math.cos(u.aim)*5*s,hy=q.y-55.5*s*sk;g.save();g.globalCompositeOperation='lighter';
 const R=(6+e*40)*s;subBDiamond(hx,hy,R*.7,R,rgba('#d8a8ff',.5*k),rgba('#ffffff',.8*k),2);
 g.strokeStyle=rgba('#c080ff',.7*k);g.lineWidth=2*s;for(let i=0;i<10;i++){const b=i*.628+.3,L=(10+e*46)*s;g.beginPath();g.moveTo(hx+Math.cos(b)*L*.3,hy+Math.sin(b)*L*.3);g.lineTo(hx+Math.cos(b)*L,hy+Math.sin(b)*L);g.stroke()}
 // les lignes du sceau descendent sur le corps
 g.strokeStyle=rgba('#7a2ab0',.8*Math.min(1,k*2));g.lineWidth=1.6*s;for(const sd of[-1,1]){g.beginPath();g.moveTo(hx+sd*2*s,hy);for(let j=1;j<=6;j++){const yy=hy+j*8*s*Math.min(1,e*2.2);g.lineTo(hx+sd*(4+j*1.6+Math.sin(j*1.7)*2)*s,yy)}g.stroke()}g.restore()};
JFXD.sub_bykq=(f,k,e,t,u)=>{if(!u||u.dead||u.sub_eat>0)return;const q=P(u.x,u.y,0),s=q.s*1.3,sk=u.ch.look.scale||1,x=q.x+(22+(f.n||0)*9)*s,y=q.y-(64+(f.n||0)*7)*s*sk,fil=Math.min(1,e/.88);
 if(e<.88){subBDiamond(x,y,4.4*s,6*s,'rgba(20,10,30,.55)',rgba('#d8a8ff',.95),1.6);g.save();g.beginPath();g.rect(x-5*s,y+6*s-12*s*fil,10*s,12*s*fil);g.clip();subBDiamond(x,y,3.6*s,5.2*s,'#7dffa0');g.restore()}
 else{const b=(e-.88)/.12;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#b8ffb0',1-b);g.lineWidth=2;subBDiamond(x,y,(4.4+b*10)*s,(6+b*14)*s,rgba('#7dffa0',.4*(1-b)),rgba('#ffffff',1-b),2);g.restore()}};
// Manda : corps au sol (sous les ninjas), la tête est un porteur trié en profondeur
function subBMandaPts(x){const ca=Math.cos(x.a),sa=Math.sin(x.a),Lb=Math.min(x.len,560),n=26,T=performance.now()/1000,pts=[];
 for(let i=0;i<=n;i++){const d=i/n*Lb,amp=Math.min(1,d/70)*(x.n===2?10:20),w=Math.sin(d/85-T*9)*amp;pts.push({x:x.x-ca*d-sa*w,y:x.y-sa*d+ca*w,d})}return pts}
AUXD.sub_manda=(x,k,t)=>{if(x.len<4&&x.n===0){const q=P(x.x,x.y,0);g.fillStyle=rgba('#000',.3*x.w);g.beginPath();g.ellipse(q.x,q.y,70*q.s*x.w,26*q.s*x.w,0,0,7);g.fill();return}
 const pts=subBMandaPts(x),n=pts.length-1,Lb=pts[n].d,fade=x.n===3?Math.max(0,x.t/.55):1,al=Math.min(1,fade*1.3),W=d=>{const f=d/Math.max(1,Lb);let w=54-36*f*f;if(x.n===2&&d>50&&d<190)w+=24*Math.sin(Math.PI*(d-50)/140);return w*(.4+.6*fade)};
 g.save();g.globalAlpha*=al;g.fillStyle='rgba(0,0,0,.28)';for(let i=0;i<n;i+=2){const p=pts[i],q=P(p.x,p.y,0);g.beginPath();g.ellipse(q.x,q.y,W(p.d)*.7*q.s,W(p.d)*.28*q.s,0,0,7);g.fill()}
 const S=pts.map(p=>P(p.x,p.y,20));g.lineCap='round';
 for(const [c,add] of[[SUBK[0],6],['#7a4aa8',0]]){g.strokeStyle=c;for(let i=n;i>0;i--){const s=S[i].s;g.lineWidth=(W(pts[i].d)+add)*s;g.beginPath();g.moveTo(S[i].x,S[i].y);g.lineTo(S[i-1].x,S[i-1].y);g.stroke()}}
 g.strokeStyle='#a878d0';for(let i=n;i>0;i--){const s=S[i].s;g.lineWidth=W(pts[i].d)*.42*s;g.beginPath();g.moveTo(S[i].x,S[i].y-W(pts[i].d)*.18*s);g.lineTo(S[i-1].x,S[i-1].y-W(pts[i-1].d)*.18*s);g.stroke()}
 // motif d'écailles : losanges sombres le long du dos
 for(let i=2;i<n;i+=2){const s=S[i].s,w=W(pts[i].d);subBDiamond(S[i].x,S[i].y-w*.12*s,w*.16*s,w*.12*s,'#4a2a6a')}
 g.restore();if(x.n===0||x.len<90){const q=P(x.x-Math.cos(x.a)*x.len,x.y-Math.sin(x.a)*x.len,0);g.fillStyle=rgba('#e8e8f0',.35*k);g.beginPath();g.ellipse(q.x,q.y,80*q.s,30*q.s,0,0,7);g.fill()}};
// tête de Manda (vue de trois quarts dessus) : yeux jaunes à pupille fendue, cornes, gueule ouverte en chargeant, joues gonflées en avalant
PROJD.sub_mandah=(p,R,ra,t)=>{const z=Math.sin(Math.PI*(1-p.life/p.life0))*70+15,q0=P(p.x,p.y,z);g.scale(1/q0.s,1/q0.s);g.translate(-q0.x,-q0.y);const n=p.zapP|0,w=+p.ar||0,a=p.ox||0,T=t/1000;
 const rise=n===0?w:n===3?w:1,q=P(p.x,p.y,(22+20*rise)),s=q.s*1.05*(.55+.45*rise),open=n===1||n===3,full=n===2;if(rise<.03)return;
 const sh=P(p.x,p.y,0);g.save();g.globalAlpha*=Math.min(1,rise*1.5);g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(sh.x,sh.y,58*sh.s,22*sh.s,0,0,7);g.fill();
 g.translate(q.x,q.y+(full?Math.sin(T*30)*1.5:0));g.rotate(Math.atan2(Math.sin(a)*K,Math.cos(a)));g.scale(s,s*(.8+.2*Math.abs(Math.cos(a))));g.lineJoin='round';g.strokeStyle=SUBK[0];g.lineWidth=3.2;
 const m=open?.42+Math.sin(T*14)*.06:.05;
 if(open){g.fillStyle='#5a0e1a';g.beginPath();g.moveTo(10,0);g.lineTo(56,-30*Math.sin(m)*2.4);g.lineTo(56,30*Math.sin(m)*2.4);g.closePath();g.fill();
  g.strokeStyle='#d03040';g.lineWidth=2.4;const tw=Math.sin(T*32)*4;g.beginPath();g.moveTo(20,0);g.lineTo(58,tw);g.lineTo(66,tw-6);g.moveTo(58,tw);g.lineTo(66,tw+6);g.stroke();g.strokeStyle=SUBK[0];g.lineWidth=3.2}
 // mâchoires (haut / bas) : grosse tête plate
 for(const k of[-1,1]){g.fillStyle='#7a4aa8';g.beginPath();g.moveTo(-34,k*4);g.quadraticCurveTo(-30,k*34,8,k*(30+(full?6:0)));g.quadraticCurveTo(46,k*26,54,k*Math.max(3,Math.sin(m)*30));g.lineTo(10,k*2);g.closePath();g.fill();g.stroke()}
 g.fillStyle='#a878d0';g.beginPath();g.ellipse(-4,0,30,12,0,0,7);g.fill();
 if(open){g.fillStyle='#ffffff';for(const k of[-1,1])for(const fx of[44,30]){g.beginPath();g.moveTo(fx,k*Math.sin(m)*28);g.lineTo(fx+4,k*(Math.sin(m)*28-9));g.lineTo(fx+8,k*Math.sin(m)*26);g.closePath();g.fill();g.lineWidth=1.2;g.stroke()}g.lineWidth=3.2}
 // cornes / crête et yeux
 for(const k of[-1,1]){g.fillStyle='#4a2a6a';g.beginPath();g.moveTo(-26,k*20);g.lineTo(-52,k*34);g.lineTo(-20,k*28);g.closePath();g.fill();g.stroke();
  g.fillStyle='#ffd23a';g.beginPath();g.ellipse(4,k*17,9,6,0,0,7);g.fill();g.stroke();g.fillStyle='#111';g.fillRect(2.6,k*17-5,2.8,10);g.fillStyle='#fff';g.fillRect(7,k*17-3,2,2)}
 g.fillStyle='#2a1440';for(const k of[-1,1]){g.beginPath();g.arc(40,k*7,2.4,0,7);g.fill()}
 g.restore()};
JFXD.sub_mgulp=(f,k,e)=>{const q=P(f.x,f.y,40);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#d8a8ff',.8*k);g.lineWidth=4*q.s;g.beginPath();g.arc(q.x,q.y,(20+e*50)*q.s,0,7);g.stroke();g.restore()};
JFXD.sub_mspit=(f,k,e,t)=>{const q=P(f.x,f.y,30);for(let i=0;i<9;i++){const b=f.a+(i-4)*.28,d=(10+e*70)*q.s*(.6+((i*37)%10)/14),x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*K-Math.sin(e*3)*16*q.s+e*e*24*q.s;
  g.fillStyle=rgba(i%2?'#c8e8a0':'#e8f0d0',.85*k);g.strokeStyle=rgba(SUBK[0],.5*k);g.lineWidth=1;g.beginPath();g.arc(x,y,(5-e*2)*q.s,0,7);g.fill();g.stroke()}};
// Rasenshuriken : sphère de chakra et quatre grandes lames de vent qui tournent (et hurlent)
PROJD.sub_rskp=(p,R,ra,t)=>{const T=t/1000,s=R/32;g.save();g.scale(s,s*.82);g.globalCompositeOperation='lighter';
 g.strokeStyle='rgba(200,255,240,.45)';g.lineWidth=2;g.beginPath();g.arc(0,0,40,0,7);g.stroke();g.strokeStyle='rgba(255,255,255,.3)';g.beginPath();g.arc(0,0,30,T*20,T*20+4);g.stroke();
 g.rotate(T*26);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle='rgba(215,255,245,.62)';g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=1.6;g.beginPath();g.moveTo(6,-5);g.quadraticCurveTo(26,-16,48,-3);g.quadraticCurveTo(30,-1,8,5);g.closePath();g.fill();g.stroke();
  g.strokeStyle='rgba(160,230,255,.6)';g.lineWidth=1;g.beginPath();g.arc(0,0,42,-.5,-.1);g.stroke()}
 g.rotate(-T*26);const gr=g.createRadialGradient(0,0,0,0,0,16);gr.addColorStop(0,'#ffffff');gr.addColorStop(.45,'#9fd8ff');gr.addColorStop(1,'rgba(58,138,255,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,16,0,7);g.fill();
 g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.3;for(let i=0;i<3;i++){g.beginPath();g.ellipse(0,0,7+i*2.5,4+i*1.5,T*14+i,0,4.4);g.stroke()}g.restore()};
// incantation : le shuriken se forme au-dessus de la main levée (le bras levé est tenu pendant l'incantation)
STATD.push((u,p,S,sk)=>{if(!u.cast||u.dead)return;const ab=castAb(u,u.cast);if(!ab||ab.key!=='sub_rsk')return;if(!u.anim||u.anim.k!=='sub_rskw')u.anim={k:'sub_rskw',t:.5,m:.5};
 const t=performance.now()/1000,k=Math.min(1,u.cast.t/u.cast.dur),q=P(u.x-Math.cos(u.aim)*2,u.y-Math.sin(u.aim)*2,92*(sk||1)),R=(6+16*k)*q.s;g.save();g.translate(q.x,q.y);g.globalCompositeOperation='lighter';
 const gr=g.createRadialGradient(0,0,0,0,0,R*.7);gr.addColorStop(0,'#fff');gr.addColorStop(.5,'#9fd8ff');gr.addColorStop(1,'rgba(58,138,255,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,R*.7,0,7);g.fill();
 g.scale(1,.82);g.rotate(t*24);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle=rgba('#d7fff5',.55*k);g.beginPath();g.moveTo(R*.15,-R*.12);g.quadraticCurveTo(R*.7,-R*.4,R*1.4*k,-R*.08);g.quadraticCurveTo(R*.8,0,R*.2,R*.12);g.closePath();g.fill()}g.restore()});
JFXD.sub_rskboom=(f,k,e)=>{const q=P(f.x,f.y,f.r*.45),R=f.r*q.s*(.3+.75*ezo(Math.min(1,e*2.2)));g.save();g.globalCompositeOperation='lighter';
 const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R);gr.addColorStop(0,rgba('#ffffff',.95*k));gr.addColorStop(.6,rgba('#c8fff0',.5*k));gr.addColorStop(1,rgba('#9fd8ff',0));g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill();
 g.strokeStyle=rgba('#ffffff',.9*k);g.lineWidth=2;g.beginPath();g.arc(q.x,q.y,R*1.05,0,7);g.stroke();g.restore()};
// sphère de lames : des milliers d'aiguilles de vent (par-dessus les ninjas, transparente)
JFXD.sub_rskdome=(f,k,e,t)=>{const c=P(f.x,f.y,f.r*.45),R=f.r*c.s*Math.min(1,.3+e*6),a=Math.min(1,k*4);g.save();g.globalCompositeOperation='lighter';
 g.fillStyle=rgba('#c8fff0',.12*a);g.beginPath();g.ellipse(c.x,c.y,R,R*.92,0,0,7);g.fill();g.strokeStyle=rgba('#e8fffa',.6*a);g.lineWidth=2;g.stroke();
 g.lineWidth=1.2;for(let i=0;i<46;i++){const b=i*2.399+t*(i%2?7:-5),d=R*(.15+((i*53)%80)/100),L=R*.26,x=c.x+Math.cos(b)*d,y=c.y+Math.sin(b)*d*.92;g.strokeStyle=rgba(i%3?'#ffffff':'#9fd8ff',.65*a);g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(b+1.57)*L,y+Math.sin(b+1.57)*L*.92);g.stroke()}
 g.translate(c.x,c.y);g.scale(1,.35);g.rotate(t*18);g.fillStyle=rgba('#d7fff5',.3*a);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.beginPath();g.moveTo(R*.1,-R*.08);g.quadraticCurveTo(R*.6,-R*.3,R*1.25,-R*.04);g.quadraticCurveTo(R*.7,0,R*.12,R*.08);g.closePath();g.fill()}g.restore()};
AUXD.sub_rskd=(x,k,t)=>{g.fillStyle=rgba('#0a2030',.22*k);gEll(x.x,x.y,x.r);g.fill();g.strokeStyle=rgba('#c8fff0',.7*k);g.lineWidth=2;g.setLineDash([14,8]);g.lineDashOffset=-t*160;gEll(x.x,x.y,x.r);g.stroke();g.setLineDash([])};
// chakra arraché : des volutes bleues quittent la cible ; puis, tant qu'il est coupé, un anneau de chakra brisé tourne autour d'elle
JFXD.sub_ckdrain=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s*1.3;g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<9;i++){const b=i*.7+e*4,d=(8+e*46)*s,x=q.x+Math.cos(b)*d,y=q.y-(30+e*40+Math.sin(i)*8)*s+Math.sin(b)*d*.35;circ(x,y,(3.4-e*1.8)*s,rgba(i%2?'#4ab0ff':'#bfe6ff',.9*k))}g.restore()};
STATD.push((u,p,S,sk)=>{if(!(u.sub_ckc>0))return;const t=performance.now()/1000,a=Math.min(1,u.sub_ckc*2),y=p.y-30*S*(sk||1);g.save();g.lineWidth=2.2;
 for(let i=0;i<5;i++){const b0=t*2+i*1.2566;g.strokeStyle=rgba(i%2?'#4ab0ff':'#9fd8ff',.75*a);g.beginPath();g.ellipse(p.x,y,22*S/1.3,8*S/1.3,0,b0,b0+.75);g.stroke()}
 g.strokeStyle=rgba('#ffffff',.8*a);g.lineWidth=1.4;for(let i=0;i<2;i++){const b=t*2+i*Math.PI+.9,x=p.x+Math.cos(b)*22*S/1.3,yy=y+Math.sin(b)*8*S/1.3;g.beginPath();g.moveTo(x-3*S,yy-3*S);g.lineTo(x+3*S,yy+3*S);g.stroke()}g.restore()});
// ---------- animations 3D ----------
Object.assign(ANIM,{
 // serpents : le bras gauche se tend, manche en avant ; la main droite tient le poignet
 sub_jashu:(P,e)=>{const k=ezo(Math.min(1,e/.18))*(e>.75?1-(e-.75)/.25:1);pz(P,'armL',-1.62*k,0,-.12*k);pz(P,'foreL',-.05);pz(P,'armR',-1.25*k,0,.55*k);pz(P,'foreR',-1.2*k);pz(P,'chest',.22*k,-.4*k);pz(P,'head',.1*k,.25*k);P.root.z=5*k;pz(P,'thighL',-.55*k);pz(P,'shinL',.5*k);pz(P,'thighR',.35*k);pz(P,'shinR',.4*k)},
 // Shishienjin : signe des mains, puis bras écartés et levés (les quatre flammes s'allument)
 sub_shishi:(P,e)=>{if(e<.35){const k=Math.min(1,e/.15);pz(P,'armL',-1.45*k,0,-.55);pz(P,'foreL',-1.4);pz(P,'armR',-1.45*k,0,.55);pz(P,'foreR',-1.4);pz(P,'head',.15);P.root.y=-2*k;return}
  const k=ezo(Math.min(1,(e-.35)/.25));pz(P,'armL',-1.45-.95*k,0,-.55+1.5*k);pz(P,'foreL',-1.4+1.2*k);pz(P,'armR',-1.45-.95*k,0,.55-1.5*k);pz(P,'foreR',-1.4+1.2*k);pz(P,'chest',-.25*k);pz(P,'head',-.3*k);P.root.y=-2+1*k;pz(P,'thighL',0,0,.25*k);pz(P,'thighR',0,0,-.25*k)},
 // Byakugô : mains jointes, tête baissée (le sceau se libère), puis poitrine bombée, poings serrés
 sub_byk:(P,e)=>{if(e<.4){const k=Math.min(1,e/.15);pz(P,'armL',-1.2*k,0,-.6*k);pz(P,'foreL',-1.8*k);pz(P,'armR',-1.2*k,0,.6*k);pz(P,'foreR',-1.8*k);pz(P,'head',.45*k);pz(P,'chest',.2*k);P.root.y=-2*k;return}
  const k=bump((e-.4)/.6*.5+.5);pz(P,'armL',-.4*k,0,.95*k);pz(P,'armR',-.4*k,0,-.95*k);pz(P,'foreL',-1.5*k);pz(P,'foreR',-1.5*k);pz(P,'chest',-.4*k);pz(P,'head',-.45*k);P.root.y=-3*k;pz(P,'thighL',-.2*k,0,.3*k);pz(P,'thighR',-.2*k,0,-.3*k);pz(P,'shinL',.4*k);pz(P,'shinR',.4*k)},
 // Manda : pouce mordu, puis la paume frappe le sol (accroupi)
 sub_manda:(P,e)=>{if(e<.32){const k=Math.min(1,e/.15);pz(P,'armR',-2.3*k,0,.45*k);pz(P,'foreR',-2.3*k);pz(P,'head',-.15*k);pz(P,'armL',-.4*k,0,.4*k);return}
  const k=ezo(Math.min(1,(e-.32)/.14));P.root.y=-13*k;pz(P,'thighL',-1.2*k);pz(P,'shinL',1.9*k);pz(P,'thighR',.35*k);pz(P,'shinR',1.6*k);pz(P,'chest',.85*k);pz(P,'head',-.2*k);pz(P,'armR',-1*k,0,-.15*k);pz(P,'foreR',-.15);pz(P,'armL',.35*k,0,.7*k)},
 // Rasenshuriken : bras droit levé qui tient le shuriken (incantation), puis lancer par-dessus l'épaule
 sub_rskw:(P)=>{pz(P,'armR',-3.05,0,-.22);pz(P,'foreR',-.25);pz(P,'armL',-1.15,0,.55);pz(P,'foreL',-.4);pz(P,'chest',-.22,.3);pz(P,'head',-.15);P.root.y=-1.5;pz(P,'thighL',-.3);pz(P,'shinL',.4)},
 sub_rsk:(P,e)=>{const k=ezo(Math.min(1,e/.22)),r=e>.65?(e-.65)/.35:0;pz(P,'armR',-3.05+1.6*k+.3*r,0,-.22+.1*k);pz(P,'foreR',-.25+.15*k);pz(P,'armL',-1.15+1.4*k,0,.55);pz(P,'chest',(-.22+.75*k)*(1-r),(.3-.7*k)*(1-r));pz(P,'head',.15*k);P.root.z=10*k*(1-r);P.root.y=-4*k*(1-r);pz(P,'thighL',-.9*k*(1-r));pz(P,'shinL',.7*k*(1-r));pz(P,'thighR',.5*k*(1-r));pz(P,'shinR',.6*k*(1-r))},
});

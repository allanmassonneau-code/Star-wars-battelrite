// ===== Kekkei genkai g2 : Jiton, le sable de fer et le magnétisme (préfixe ji_) — façon Troisième Kazekage =====
// Identité : la traque. Tes jutsu AIMANTENT la cible (trait, 4 s) ; sur une cible aimantée, le sable de fer revient vers elle :
// tes jutsu suivants l'attirent vers toi et frappent plus fort. Pointes, pluie de fer, bras de fer, bouclier, forêt de pointes ; dash : glissade magnétique.
gkPal('ji_iron','#b8c0d8','#5a6078','#2a2e3c','#0e1016');
defKG(2,{n:'Jiton',col:'#6a7290',tag:'Ji',el:'Doton + Fûton',nat:4,d:'Le sable de fer : aimante la cible, l\'attire, la cloue sous des pointes de fer',
 ico:f=>{g.lineWidth=4.2;g.lineCap='butt';g.beginPath();g.arc(0,-1,7,Math.PI,0);g.lineTo(7,9);g.moveTo(-7,-1);g.lineTo(-7,9);g.stroke();g.fillRect(-9.5,5,5,5);g.fillRect(4.5,5,5,5)}});
const JI_D={
 needle:'4 pointes de sable de fer en éventail : 4 dégâts chacune ; aimante la cible',
 rain:'Le sable de fer s\'abat sur le point visé (alerte 0,55 s) : 20 dégâts et ralentit 1 s ; une cible déjà aimantée est clouée 0,7 s',
 arm:'Un bras de sable de fer saisit le 1er ennemi touché (480) : 22 dégâts, il est ramené jusqu\'à toi et aimanté',
 shield:'Bouclier de sable de fer 3 s (absorbe 45 dégâts) ; quand il cède ou à la fin, le fer éclate autour de toi : 22 dégâts, repousse et aimante',
 forest:'Forêt de pointes au point visé (380 max) : les ennemis aimantés à 500 ou moins sont d\'abord attirés au centre ; puis 3 vagues de pointes (18 dégâts chacune), la dernière entrave 0,8 s',
 dash:'Glissade magnétique (240) sur ton sable de fer : les ennemis traversés sont aimantés'};
KIT('g2',[
 ['D','x.ji_needle','Jiton : Pointes de fer',JI_D.needle,'ji_iron'],
 ['C','x.ji_rain','Jiton : Sajin Kôka',JI_D.rain,'ji_iron'],
 ['B','x.ji_arm','Jiton : Bras de sable de fer',JI_D.arm,'ji_iron'],
 ['A','x.ji_shield','Jiton : Bouclier de fer',JI_D.shield,'ji_iron'],
 ['S','x.ji_forest','Jiton : Sajin Kaika Shôtan',JI_D.forest,'ji_iron'],
]);
DASHG[2]={src:'x.ji_dash',n:'Glissade magnétique',d:JI_D.dash,vfx:'ji_iron',cd:7};
KGBAL[2]=[0.99,0.97];
const JIC=GK.ji_iron,jiMag=(u,e)=>gkStack(u,e,'ji_mag',1,1,4);
// attraction d'une cible aimantée vers le lanceur (sur un nouveau jutsu de fer)
function jiPull(u,e,d){if(!e||e.dead||!(e.ji_mag>0)||e.unstop>0)return;const a=Math.atan2(u.y-e.y,u.x-e.x),k=Math.min(d,Math.max(0,dist(u,e)-u.r-e.r-30));e.kx+=Math.cos(a)*k*5;e.ky+=Math.sin(a)*k*5;
 jx({jfx:'ji_lines',x:e.x,y:e.y,x2:u.x,y2:u.y,t:.4,m:.4})}
Object.assign(NAT,{
 // ---------- Pointes de fer (D) ----------
 ji_needle:SP('Jiton : Pointes de fer',JI_D.needle,5,{ai:RG(460,.75),line:{len:460,w:80}},(u,a)=>{gkS('sand',u);gkS('blaster',u);anim(u,'throw2',.4);jx({jfx:'ji_swirl',ui:gkI(u),x:u.x,y:u.y,t:.4,m:.4});const hit1=new Set();
  for(let i=0;i<4;i++)proj(u,a+(i-1.5)*.13,{spd:900,r:6,dmg:4,life:.52,col:JIC.b,kind:'ji_nd',vfx:'ji_iron',onHit:(p,t)=>{if(!hit1.has(t)){hit1.add(t);jiPull(p.owner,t,40);jiMag(p.owner,t)}}})}),
 // ---------- Sajin Kôka (C) ----------
 ji_rain:SP('Jiton : Sajin Kôka',JI_D.rain,8,{ai:RG(420,.65),tele:{r:80,max:420}},(u,a,td)=>{const c=atP(u,a,td,420),D=.55;gkS('sand',u);anim(u,'gk_call',.6);jx({jfx:'ji_cloud',x:c.x,y:c.y,r:80,t:D+.3,m:D+.3});
  later(u,D,()=>{for(const e of enemies(u))if(gkIn(e,c.x,c.y,80)){const m=e.ji_mag>0;if(gkHit(e,u,20,m?{root:.7,unblockable:1}:{slow:1,unblockable:1},'ji_iron'))jiMag(u,e)}
   jx({jfx:'ji_spikes',x:c.x,y:c.y,r:80,n:9,t:.7,m:.7});if(near(c.x,c.y)){gkS('rock',u);gkS('sand',u);shake=Math.max(shake,.12)}},{x:c.x,y:c.y,r:80})}),
 // ---------- Bras de sable de fer (B) : grappin ----------
 ji_arm:SP('Jiton : Bras de sable de fer',JI_D.arm,10,{ai:{mode:'gap',min:150,max:470,p:.6},line:{len:480,w:34}},(u,a)=>{gkS('sand',u);gkS('heavy',u);anim(u,'point',.45);
  proj(u,a,{spd:900,r:14,dmg:22,life:.54,col:JIC.b,kind:'ji_arm',vfx:'ji_iron',hook:1,o:{unblockable:1},onHit:(p,t)=>{jiMag(p.owner,t);if(near(t.x,t.y)){gkS('heavy',t);sparks(t.x,t.y,JIC.a,10,'ji_iron')}}});
  jx({jfx:'ji_armT',ui:gkI(u),x:u.x,y:u.y,t:.55,m:.55})}),
 // ---------- Bouclier de fer (A) ----------
 ji_shield:SP('Jiton : Bouclier de fer',JI_D.shield,13,{ai:DEF},(u)=>{gkS('sand',u);gkS('heavy',u);anim(u,'gk_charge',.5);shieldU(u,45,3);u.ji_sh=3;
  aux.push({type:'ji_sh',x:u.x,y:u.y,r:0,t:3.05,m:3.05,team:u.team,owner:u,ui:gkI(u),k:0});say(u,'BOUCLIER DE FER',JIC.a)}),
 // ---------- Sajin Kaika Shôtan (S) ----------
 ji_forest:ULT('Jiton : Sajin Kaika Shôtan',JI_D.forest,{ai:RG(380,.8),tele:{r:160,max:380}},(u,a,td)=>{const c=atP(u,a,td,380),R=160;gkS('sand',u);gkS('roar',u);anim(u,'gk_call',1);
  for(const e of enemies(u))if(e.ji_mag>0&&Math.hypot(e.x-c.x,e.y-c.y)<500&&e.unstop<=0){const b=Math.atan2(c.y-e.y,c.x-e.x),d=Math.hypot(c.x-e.x,c.y-e.y);e.kx+=Math.cos(b)*Math.min(900,d*4.5);e.ky+=Math.sin(b)*Math.min(900,d*4.5);jx({jfx:'ji_lines',x:e.x,y:e.y,x2:c.x,y2:c.y,t:.6,m:.6});say(e,'ATTIRÉ',JIC.a)}
  jx({jfx:'ji_cloud',x:c.x,y:c.y,r:R,t:1.6,m:1.6});
  for(let w=0;w<3;w++)later(u,.6+w*.3,()=>{const last=w===2;for(const e of enemies(u))if(gkIn(e,c.x,c.y,R)&&gkHit(e,u,18,last?{root:.8,unblockable:1}:{unblockable:1,slow:.6},'ji_iron'))jiMag(u,e);
   jx({jfx:'ji_spikes',x:c.x,y:c.y,r:R,n:16+w*4,big:1,t:.8,m:.8});if(near(c.x,c.y)){gkS('rock',u);shake=Math.max(shake,.15+w*.08)}},w?{}:{x:c.x,y:c.y,r:R})}),
 // ---------- dash : Glissade magnétique ----------
 ji_dash:SP('Glissade magnétique',JI_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||240,120,240);gkS('sand',u);gkS('dash',u);anim(u,'lunge',.3);
  dash(u,a,d,.24,{through:1,end:()=>{for(const e of enemies(u)){const dx=e.x-x0,dy=e.y-y0,ca=Math.cos(a),sa=Math.sin(a),f=dx*ca+dy*sa;if(f>-e.r&&f<d+e.r&&Math.abs(-dx*sa+dy*ca)<e.r+u.r+10)jiMag(u,e)}}});
  jx({jfx:'ji_lines',x:x0,y:y0,x2:clamp(x0+Math.cos(a)*d,B.x,B.x+B.w),y2:clamp(y0+Math.sin(a)*d,B.y,B.y+B.h),t:.45,m:.45})}),
});
Object.assign(NATHERO,{ji:'kylo'});
// bouclier : éclate quand il cède ou à la fin
AUXF.ji_sh=(x,dt)=>{const u=x.owner;if(x.done||!u)return;if(u.dead){x.done=1;x.t=0;return}x.x=u.x;x.y=u.y;
 if(u.shield<=0||x.t<=0){x.done=1;x.t=0;u.ji_sh=0;u.shield=0;gkAoe(u,u.x,u.y,110,22,{kb:320},'ji_iron',e=>jiMag(u,e));jx({jfx:'ji_spikes',x:u.x,y:u.y,r:110,n:14,t:.6,m:.6});jx({jfx:'gk_boom',x:u.x,y:u.y,r:110,v:'ji_iron',s:'iron',t:.5,m:.5});if(near(u.x,u.y)){gkS('rock',u);shake=Math.max(shake,.2)}}};
AUXD.ji_sh=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const q=P(u.x,u.y,0),s=q.s;g.save();for(let i=0;i<26;i++){const b=i*.24+t*(i%2?2.2:-1.8),r=(34+(i%4)*5)*s,z=10+((i*13)%50),p=P(u.x+Math.cos(b)*r/s,u.y+Math.sin(b)*r/s*.9,z);
  g.fillStyle=i%3?JIC.c:JIC.b;g.fillRect(p.x-2*s,p.y-2*s,4*s,4*s)}g.strokeStyle=rgba(JIC.a,.5);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y-28*s,30*s,38*s,0,0,7);g.stroke();g.restore()};
// ---- trait : Magnétisme
GKST.push({key:'ji_mag',max:1,col:'#9aa6d0',c2:'#20243a'});
KGTRAITS[2]={nom:'Magnétisme',desc:'Tes jutsu de fer aimantent la cible 4 s. Sur une cible aimantée, ton sable de fer frappe plus fort (+15 % de dégâts de tes jutsu) et la ramène vers toi (attirée de 40 par les Pointes de fer, clouée par la pluie de fer, attirée au centre de la forêt de pointes)',
 deal(src,t,dmg,o){return t.ji_mag>0&&gkMine('ji_iron')?dmg*1.15:dmg},
 draw(u,p,S,sk){const t=performance.now()/1000;g.save();g.fillStyle=JIC.c;for(let i=0;i<6;i++){const b=t*1.6+i*1.05,x=p.x+Math.cos(b)*19*S*sk,y=p.y+Math.sin(b)*6*S*sk-(4+Math.sin(t*3+i)*3)*S;g.fillRect(x-1.5*S,y-1.5*S,3*S,3*S)}g.restore()},
 prev(u,p,S,front){if(front)return;g.save();g.fillStyle=rgba(JIC.c,.35);g.beginPath();g.ellipse(p.x,p.y,26*S,8*S,0,0,7);g.fill();g.restore()},
 hud(u,x,y){gkHud(u,x,y,'Magnétisme','ji_mag',1,'#b8c4f0',JIC.a,u.ji_sh>0?'· BOUCLIER':'')}};
AFTER.push(()=>UK.push('ji_mag','ji_sh'));
// lignes de force sur une cible aimantée
STATD.push((u,p,S,sk)=>{if(!(u.ji_mag>0)||u.dead)return;const t=performance.now()/1000;g.save();g.strokeStyle=rgba('#9aa6d0',.55);g.lineWidth=1.2*S;for(let i=0;i<3;i++){const r=(14+((t*20+i*8)%24))*S*(sk||1);g.beginPath();g.ellipse(p.x,p.y-36*S,r,r*.45,0,0,7);g.stroke()}g.restore()});
// ---- visuels
PROJD.ji_nd=gkShardD('ji_iron',14);
// bras de sable de fer : main griffue au bout d'un flot de grains
PROJD.ji_arm=(p,R,ra,t)=>{g.rotate(ra);g.fillStyle=JIC.c;for(let i=0;i<14;i++){const x=-8-i*7,y=Math.sin(t/40+i)*4;g.fillRect(x-2,y-2,4+((i*3)%3),4)}
 g.fillStyle=JIC.b;g.strokeStyle=JIC.d;g.lineWidth=1.2;g.beginPath();g.ellipse(0,0,10,9,0,0,7);g.fill();g.stroke();g.lineCap='round';for(let i=0;i<4;i++){const y=-6+i*4;g.strokeStyle=JIC.d;g.lineWidth=4;g.beginPath();g.moveTo(6,y*.7);g.quadraticCurveTo(14,y,18,y*1.3+3);g.stroke();g.strokeStyle=JIC.b;g.lineWidth=2.4;g.stroke()}};
// grains de fer qui tournent autour des mains
JFXD.ji_swirl=(f,k,e,t,u)=>{if(!u||u.dead)return;g.save();g.fillStyle=rgba(JIC.c,k);for(let i=0;i<14;i++){const b=t*8+i*.45,r=14+e*16,q=P(u.x+Math.cos(b)*r,u.y+Math.sin(b)*r*.6,40+Math.sin(b*2)*6);g.fillRect(q.x-1.6,q.y-1.6,3.2,3.2)}g.restore()};
JFXD.ji_armT=(f,k,e,t,u)=>{if(!u||u.dead)return;JFXD.ji_swirl(f,k,e,t,u)};
// nuage de sable de fer au-dessus de la zone (pluie, forêt)
JFXD.ji_cloud=(f,k,e,t)=>{g.save();g.fillStyle=rgba(JIC.d,.22*Math.min(1,k*3));gEll(f.x,f.y,f.r);g.fill();for(let i=0;i<22;i++){const b=i*2.4+t*.6,d=f.r*((i*.27)%1),z=110+Math.sin(t*2+i)*10,p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,z);g.fillStyle=rgba(i%2?JIC.c:JIC.d,.75*Math.min(1,k*3));g.beginPath();g.arc(p.x,p.y,(5+(i%3)*3)*p.s,0,7);g.fill()}
 g.fillStyle=rgba(JIC.c,.8*Math.min(1,k*3));for(let i=0;i<10;i++){const b=i*1.9,d=f.r*((i*.41)%1),z=100-((t*260+i*30)%100),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,z);g.fillRect(p.x-1,p.y-5,2,10)}g.restore()};
// pointes de fer qui jaillissent du sol
JFXD.ji_spikes=(f,k,e,t)=>{const up=ezo(Math.min(1,e*5)),fade=Math.min(1,k*2.5),n=f.n||10;g.save();for(let i=0;i<n;i++){const b=i*2.399+f.x*.01,d=f.r*Math.sqrt(((i*.618)%1)),bp=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,0),s=bp.s,h=(f.big?46:34)*(.6+((i*.37)%1)*.6)*up*fade,w=(4+(i%3))*s,tp=P(f.x+Math.cos(b)*d*1.05,f.y+Math.sin(b)*d*1.05,h);
  g.fillStyle=JIC.c;g.strokeStyle=JIC.d;g.lineWidth=1;g.beginPath();g.moveTo(bp.x-w,bp.y);g.lineTo(tp.x,tp.y);g.lineTo(bp.x+w,bp.y);g.closePath();g.fill();g.stroke();g.strokeStyle=rgba(JIC.a,.7);g.beginPath();g.moveTo(bp.x-w*.2,bp.y);g.lineTo(tp.x,tp.y);g.stroke()}g.restore()};
// lignes de force magnétiques (attraction)
JFXD.ji_lines=(f,k,e,t)=>{const A=P(f.x,f.y,30),Bq=P(f.x2,f.y2,30);g.save();g.strokeStyle=rgba('#9aa6d0',.7*k);g.lineWidth=1.5;for(let j=-1;j<=1;j++){g.beginPath();g.moveTo(A.x,A.y);g.quadraticCurveTo((A.x+Bq.x)/2+j*16,(A.y+Bq.y)/2-j*20,Bq.x,Bq.y);g.stroke()}
 g.fillStyle=rgba(JIC.c,k);for(let i=0;i<8;i++){const m=(i/8+e*1.5)%1;g.fillRect(lerp(A.x,Bq.x,m)-2,lerp(A.y,Bq.y,m)-2,4,4)}g.restore()};

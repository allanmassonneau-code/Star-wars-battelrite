// ===== Kekkei genkai g7 : Jinton, la poussière (préfixe jn_) — Katon + Fûton + Doton (Ônoki, Mû) =====
// Identité : l'artilleur. Des formes géométriques (fil, cube, cône) lentes à venir mais qui DÉSINTÈGRENT (trait) : elles traversent la garde,
// brisent les boucliers et ignorent la réduction de dégâts. Fil, cube, cône, cube d'expansion, Genkai Hakuri ; dash : lévitation (comme Ônoki).
gkPal('jn_dust','#ffffff','#bfe8ee','#6aa0b0','#24404a');
defKG(7,{n:'Jinton',col:'#a8dce6',tag:'Jn',el:'Katon + Fûton + Doton',nat:2,d:'La poussière : cubes, cônes et rayons qui désintègrent, boucliers compris',
 ico:f=>{g.lineWidth=2;g.beginPath();g.moveTo(0,-11);g.lineTo(10,-5);g.lineTo(10,7);g.lineTo(0,12);g.lineTo(-10,7);g.lineTo(-10,-5);g.closePath();g.stroke();g.beginPath();g.moveTo(-10,-5);g.lineTo(0,1);g.lineTo(10,-5);g.moveTo(0,1);g.lineTo(0,12);g.stroke();g.beginPath();g.arc(0,1,2.6,0,7);g.fill()}});
const JN_D={
 thread:'Un fil de poussière file après 0,15 s (460) : 14 dégâts',
 cube:'Un cube se forme au point visé (420 max) et se referme après 0,6 s : 24 dégâts',
 cone:'Cône de désintégration perçant (560) : 28 dégâts et silence 0,8 s (ni jutsu)',
 grow:'Un cube grandit au point visé (360 max) pendant 0,9 s : 12 dégâts toutes les 0,3 s aux ennemis dedans, ralentit',
 hakuri:'Genkai Hakuri no Jutsu : 1 s de concentration (immobile), puis un immense rayon (900) : 68 dégâts',
 dash:'Lévitation : tu t\'envoles par-dessus tout (260) et tu n\'es plus ralenti pendant 1 s'};
KIT('g7',[
 ['D','x.jn_thread','Jinton : Fil de poussière',JN_D.thread,'jn_dust'],
 ['C','x.jn_cube','Jinton : Cube',JN_D.cube,'jn_dust'],
 ['B','x.jn_cone','Jinton : Cône de désintégration',JN_D.cone,'jn_dust'],
 ['A','x.jn_grow','Jinton : Cube d\'expansion',JN_D.grow,'jn_dust'],
 ['S','x.jn_hakuri','Jinton : Genkai Hakuri',JN_D.hakuri,'jn_dust'],
]);
DASHG[7]={src:'x.jn_dash',n:'Lévitation',d:JN_D.dash,vfx:'jn_dust',cd:7};
KGBAL[7]=[0.965,0.94];
const JNC=GK.jn_dust;
GKBEAM.jn=(f,k,e,t)=>{gkBeamDraw(f,k,e,t,JNC.a,JNC.b,{z:34,thin:f.w<30});const A=P(f.x,f.y,34),Bq=P(f.x2,f.y2,34);g.save();g.strokeStyle=rgba(JNC.c,.6*k);g.lineWidth=1;for(const sd of[-1,1]){g.beginPath();g.moveTo(A.x,A.y+sd*f.w*.45*A.s);g.lineTo(Bq.x,Bq.y+sd*f.w*.45*A.s);g.stroke()}g.restore()};
// cube de poussière (dessin) : arêtes lumineuses, cœur sphérique blanc
function jnCube(x,y,r,al,t,core){const c=[[-1,-1],[1,-1],[1,1],[-1,1]],h=r*1.6,rot=t*.6;const pt=(i,z)=>{const [a,b]=c[i],ca=Math.cos(rot),sa=Math.sin(rot);return P(x+(a*ca-b*sa)*r,y+(a*sa+b*ca)*r,z)};
 const Bo=[0,1,2,3].map(i=>pt(i,6)),To=[0,1,2,3].map(i=>pt(i,6+h));g.save();g.globalAlpha*=al;poly(To,rgba(JNC.a,.18));g.strokeStyle=rgba(JNC.a,.9);g.lineWidth=1.6;
 g.beginPath();for(let i=0;i<4;i++){const j=(i+1)%4;g.moveTo(Bo[i].x,Bo[i].y);g.lineTo(Bo[j].x,Bo[j].y);g.moveTo(To[i].x,To[i].y);g.lineTo(To[j].x,To[j].y);g.moveTo(Bo[i].x,Bo[i].y);g.lineTo(To[i].x,To[i].y)}g.stroke();
 if(core){const q=P(x,y,6+h/2),R=r*.55*q.s;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R*1.8);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,rgba(JNC.b,.7));gr.addColorStop(1,rgba(JNC.b,0));g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,R*1.8,0,7);g.fill()}g.restore()}
Object.assign(NAT,{
 // ---------- Fil de poussière (D) ----------
 jn_thread:SP('Jinton : Fil de poussière',JN_D.thread,5,{ai:RG(460,.75),line:{len:460,w:20}},(u,a)=>{gkS('zap',u);anim(u,'point',.4);jx({jfx:'jn_glow',ui:gkI(u),x:u.x,y:u.y,t:.2,m:.2});
  later(u,.15,()=>{if(u.dead)return;gkBeam(u,u.x,u.y,u.aim,460,20,14,{},'jn_dust','jn',null,.4);if(near(u.x,u.y))gkS('blaster',u)})}),
 // ---------- Cube (C) ----------
 jn_cube:SP('Jinton : Cube',JN_D.cube,8,{ai:RG(420,.65),tele:{r:65,max:420}},(u,a,td)=>{const c=atP(u,a,td,420),D=.6;gkS('zap',u);anim(u,'gk_push',.5);jx({jfx:'jn_cubeF',x:c.x,y:c.y,r:46,d:D,t:D+.35,m:D+.35});
  later(u,D,()=>{gkAoe(u,c.x,c.y,65,24,{},'jn_dust');jx({jfx:'gk_boom',x:c.x,y:c.y,r:75,v:'jn_dust',s:'dust',t:.5,m:.5});if(near(c.x,c.y)){gkS('boom',u);shake=Math.max(shake,.12)}},{x:c.x,y:c.y,r:65})}),
 // ---------- Cône de désintégration (B) ----------
 jn_cone:SP('Jinton : Cône de désintégration',JN_D.cone,10,{ai:RG(540,.6),line:{len:560,w:36}},(u,a)=>{gkS('zap',u);gkS('blaster',u);anim(u,'gk_push',.45);
  proj(u,a,{spd:760,r:16,dmg:28,life:.74,col:JNC.b,kind:'jn_cone',vfx:'jn_dust',pierce:1,o:{silence:.8,unblockable:1}})}),
 // ---------- Cube d'expansion (A) ----------
 jn_grow:SP('Jinton : Cube d\'expansion',JN_D.grow,13,{ai:RG(360,.7),tele:{r:120,max:360}},(u,a,td)=>{const c=atP(u,a,td,360);gkS('zap',u);gkS('heavy',u);anim(u,'gk_push',.6);
  aux.push({type:'jn_grow',x:c.x,y:c.y,r:30,t:1,m:1,team:u.team,owner:u,k:.3,danger:1})}),
 // ---------- Genkai Hakuri (S) ----------
 jn_hakuri:ULT('Jinton : Genkai Hakuri',JN_D.hakuri,{ai:RG(800,.8),line:{len:900,w:64}},(u,a)=>{gkS('roar',u);gkS('zap',u);anim(u,'gk_charge',1.2);u.root=Math.max(u.root,1.05);u.jn_ch=1;
  aux.push({type:'jn_hak',x:u.x,y:u.y,a,r:0,t:1,m:1,team:u.team,owner:u,ui:gkI(u)})}),
 // ---------- dash : Lévitation ----------
 jn_dash:SP('Lévitation',JN_D.dash,7,{ai:ESC},(u,a,td)=>{gkS('wind',u);anim(u,'leap',.45);u.slowImm=Math.max(u.slowImm||0,1);u.slow=0;dash(u,a,clamp(td||260,130,260),.36,{jump:1});jx({jfx:'gk_boom',x:u.x,y:u.y,r:50,v:'jn_dust',s:'dust',t:.4,m:.4})}),
});
Object.assign(NATHERO,{jn:'kylo'});
// cube d'expansion : grandit de 30 à 120 en 0,9 s ; 12 dégâts toutes les 0,3 s dedans
AUXF.jn_grow=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;const e0=Math.min(1,(x.m-x.t)/.9);x.r=30+90*e0;for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.2);
 if(x.k>0)return;x.k=.3;gkAoe(o,x.x,x.y,x.r,12,{},'jn_dust');if(near(x.x,x.y))gkS('zap',o)};
AUXD.jn_grow=(x,k,t)=>{g.save();g.fillStyle=rgba(JNC.b,.15);gEll(x.x,x.y,x.r);g.fill();g.restore();jnCube(x.x,x.y,x.r*.72,Math.min(1,x.t/.2),t,1)};
// Genkai Hakuri : concentration puis rayon
AUXF.jn_hak=(x,dt)=>{const u=x.owner;if(x.done||!u)return;if(u.dead){x.done=1;x.t=0;u.jn_ch=0;return}x.x=u.x;x.y=u.y;x.a=u.aim;u.root=Math.max(u.root,.05);
 if(x.t<=0){x.done=1;u.jn_ch=0;gkBeam(u,u.x,u.y,u.aim,900,64,68,{},'jn_dust','jn',null,.7);jx({jfx:'gk_boom',x:u.x+Math.cos(u.aim)*40,y:u.y+Math.sin(u.aim)*40,r:80,v:'jn_dust',s:'dust',t:.5,m:.5});if(near(u.x,u.y)){gkS('boom',u);gkS('zap',u);shake=Math.max(shake,.45)}}};
AUXD.jn_hak=(x,k,t)=>{const u=units[x.ui];if(!u||u.dead)return;const e=1-x.t/x.m,p=fwd(u,x.a,900),q=P(u.x+Math.cos(x.a)*26,u.y+Math.sin(x.a)*26,0);
 g.save();g.strokeStyle=rgba(JNC.b,.3+.4*e);g.lineWidth=1.5;g.setLineDash([10,8]);const A=P(u.x,u.y,0),Bq=P(p.x,p.y,0);for(const sd of[-1,1]){const ox=-Math.sin(x.a)*32*sd,oy=Math.cos(x.a)*32*sd,a1=P(u.x+ox,u.y+oy,0),b1=P(p.x+ox,p.y+oy,0);g.beginPath();g.moveTo(a1.x,a1.y);g.lineTo(b1.x,b1.y);g.stroke()}g.setLineDash([]);g.restore();
 jnCube(u.x+Math.cos(x.a)*26,u.y+Math.sin(x.a)*26,8+e*10,1,t*3,1)};
// ---- trait : Désintégration
KGTRAITS[7]={nom:'Désintégration',desc:'Tes jutsu de Jinton désintègrent : ils brisent les boucliers, ignorent la réduction de dégâts et traversent la garde',
 deal(src,t,dmg,o){if(!gkMine('jn_dust'))return dmg;if(t.shield>0){t.shield=0;say(t,'BOUCLIER DÉSINTÉGRÉ',JNC.a)}if(t.drT>0&&t.dr>0&&t.dr<.95)dmg/=1-t.dr;return dmg},
 draw(u,p,S,sk){const t=performance.now()/1000;if(u.jn_ch>0)return;g.save();g.strokeStyle=rgba(JNC.b,.5);g.lineWidth=1;const q={x:p.x+16*S,y:p.y-60*S+Math.sin(t*2)*3*S},r=4*S,rot=t;g.beginPath();for(let i=0;i<4;i++){const b=rot+i*1.57;g.lineTo(q.x+Math.cos(b)*r,q.y+Math.sin(b)*r*.6)}g.closePath();g.stroke();g.restore()},
 prev(u,p,S,front){if(front)KGTRAITS[7].draw(u,p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Désintégration'+(u.jn_ch>0?' · CONCENTRATION':''),null,0,JNC.a,JNC.a)}};
AFTER.push(()=>UK.push('jn_ch'));
// ---- visuels
// cône de désintégration : pointe blanche, arêtes, sphère au culot
PROJD.jn_cone=(p,R,ra,t)=>{g.rotate(ra);g.globalCompositeOperation='lighter';g.fillStyle=rgba(JNC.b,.25);g.beginPath();g.moveTo(R*1.4,0);g.lineTo(-R*1.6,-R);g.lineTo(-R*1.6,R);g.closePath();g.fill();g.globalCompositeOperation='source-over';
 g.fillStyle=rgba(JNC.a,.55);g.strokeStyle=JNC.a;g.lineWidth=1.4;g.beginPath();g.moveTo(R*1.3,0);g.lineTo(-R,-R*.75);g.lineTo(-R,R*.75);g.closePath();g.fill();g.stroke();g.beginPath();g.moveTo(R*1.3,0);g.lineTo(-R,0);g.stroke();
 g.globalCompositeOperation='lighter';g.fillStyle='#ffffff';g.beginPath();g.arc(-R*.6,0,R*.35,0,7);g.fill()};
// cube qui se forme puis se referme
JFXD.jn_cubeF=(f,k,e,t)=>{const el=e*f.m,form=Math.min(1,el/f.d),cl=el>f.d?Math.min(1,(el-f.d)/.15):0;if(cl>=1)return;jnCube(f.x,f.y,f.r*(1.25-.25*form)*(1-cl*.7),Math.min(1,form*2)*(1-cl),t,1)};
JFXD.jn_glow=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x+Math.cos(u.aim)*24,u.y+Math.sin(u.aim)*24,44);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',.8*k);g.beginPath();g.arc(q.x,q.y,6*q.s,0,7);g.fill();g.restore()};

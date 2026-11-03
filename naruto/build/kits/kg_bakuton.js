// ===== Kekkei genkai g3 : Bakuton, l'explosion (préfixe bt_) — façon Gari et les poseurs de mines d'Iwa =====
// Identité : la mise en charge. Tes jutsu posent des CHARGES sur la cible (trait, 2 au plus) ; ton coup de base sur une cible chargée
// fait tout sauter (8 dégâts par charge, recul). Poing mine, mine, grenade de chakra, réaction en chaîne, grande détonation ; dash : souffle explosif.
gkPal('bt_blast','#fff4c0','#ffb030','#c04a10','#3a1606');
defKG(3,{n:'Bakuton',col:'#ffb030',tag:'Ba',el:'Doton + Raiton',nat:4,d:'L\'explosion : charges posées sur l\'ennemi, mines, réactions en chaîne',
 ico:f=>{g.beginPath();for(let i=0;i<16;i++){const b=i*Math.PI/8,r=i%2?5:12;g.lineTo(Math.cos(b)*r,Math.sin(b)*r)}g.closePath();g.fill()}});
const BT_D={
 fist:'Jiraiken : tu bondis (120) et frappes le 1er ennemi : 10 dégâts et une mine collée qui saute 0,6 s plus tard (8 dégâts, repousse)',
 mine:'Pose une mine au point visé (320 max), armée en 0,5 s, 12 s au plus : 22 dégâts et repousse fort quand un ennemi marche dessus',
 gren:'Grenade de chakra (430 max) : explose au sol, 26 dégâts et étourdit 0,6 s autour',
 chain:'Réaction en chaîne : 6 explosions courent devant toi (420) à 0,1 s d\'écart : 12 dégâts chacune et repousse',
 big:'Tu concentres 1 s (immobile, insensible au contrôle), puis tout ton corps explose : 62 dégâts et repousse violemment autour de toi (210), étourdit 0,5 s ; toi, tu n\'as rien',
 dash:'Une explosion derrière toi te propulse (250) : les ennemis tout près de ton point de départ prennent 6 dégâts et sont repoussés'};
KIT('g3',[
 ['D','x.bt_fist','Bakuton : Jiraiken',BT_D.fist,'bt_blast'],
 ['C','x.bt_mine','Bakuton : Mine',BT_D.mine,'bt_blast'],
 ['B','x.bt_gren','Bakuton : Grenade de chakra',BT_D.gren,'bt_blast'],
 ['A','x.bt_chain','Bakuton : Réaction en chaîne',BT_D.chain,'bt_blast'],
 ['S','x.bt_big','Bakuton : Grande détonation',BT_D.big,'bt_blast'],
]);
DASHG[3]={src:'x.bt_dash',n:'Souffle explosif',d:BT_D.dash,vfx:'bt_blast',cd:7};
KGBAL[3]=[0.95,0.935];
const BTC=GK.bt_blast,BT_MAX=2,btCh=(u,e)=>gkStack(u,e,'bt_ch',1,BT_MAX,5);
function btBoom(u,x,y,r,d,o,sz){const n=gkAoe(u,x,y,r,d,Object.assign({kb:260},o),'bt_blast',e=>btCh(u,e));jx({jfx:'gk_boom',x,y,r:r*1.15,v:'bt_blast',s:'blast',t:.5,m:.5});
 if(near(x,y)){gkS('boom',u);sparks(x,y,BTC.b,10,'bt_blast');shake=Math.max(shake,sz||.15)}return n}
Object.assign(NAT,{
 // ---------- Jiraiken (D) : poing mine ----------
 bt_fist:SP('Bakuton : Jiraiken',BT_D.fist,5,{ai:{mode:'gap',min:40,max:170,p:.8},line:{len:150,w:50}},(u,a)=>{gkS('dash',u);anim(u,'lunge',.4);let done=0;
  const chk=()=>{if(done||u.dead)return;for(const e of enemies(u))if(dist(u,e)<u.r+e.r+22&&angDiff(ang(u,e),a)<1.2){done=1;u.dash=null;if(gkHit(e,u,10,{melee:1},'bt_blast')){btCh(u,e);
     const ti=gkI(e);jx({jfx:'bt_tag',ti,x:e.x,y:e.y,t:.6,m:.6});later(u,.6,()=>{if(!e.dead)btBoom(u,e.x,e.y,55,8,{})})}if(near(e.x,e.y))gkS('hit',e);return}};
  dash(u,a,120,.16,{end:chk});aux.push({type:'gk_chk',x:u.x,y:u.y,r:0,t:.2,m:.2,team:u.team,owner:u,f:chk})}),
 // ---------- Mine (C) ----------
 bt_mine:SP('Bakuton : Mine',BT_D.mine,8,{ai:RG(320,.5)},(u,a,td)=>{const c=atP(u,a,td,320);gkS('deflect',u);anim(u,'stomp',.4);for(const x of aux)if(x.type==='bt_mine'&&x.owner===u)x.t=Math.min(x.t,.01);
  aux.push({type:'bt_mine',x:c.x,y:c.y,r:30,t:12,m:12,team:u.team,owner:u,k:.5,arm:.5})}),
 // ---------- Grenade de chakra (B) ----------
 bt_gren:SP('Bakuton : Grenade de chakra',BT_D.gren,10,{ai:RG(430,.65),tele:{r:90,max:430}},(u,a,td)=>{const c=atP(u,a,td,430),D=.35+Math.hypot(c.x-u.x,c.y-u.y)/1300;gkS('blaster',u);anim(u,'throw2',.45);
  jx({jfx:'bt_lob',x:u.x,y:u.y,x2:c.x,y2:c.y,t:D,m:D});later(u,D,()=>btBoom(u,c.x,c.y,90,26,{stun:.6,kb:120},.25),{x:c.x,y:c.y,r:90})}),
 // ---------- Réaction en chaîne (A) ----------
 bt_chain:SP('Bakuton : Réaction en chaîne',BT_D.chain,13,{ai:RG(400,.7),line:{len:420,w:110}},(u,a)=>{gkS('heavy',u);anim(u,'stomp',.5);const x0=u.x,y0=u.y;
  for(let i=0;i<6;i++){const d=60+i*70,x=clamp(x0+Math.cos(a)*d,B.x+10,B.x+B.w-10),y=clamp(y0+Math.sin(a)*d,B.y+10,B.y+B.h-10);later(u,.12+i*.1,()=>btBoom(u,x,y,58,12,{kb:240},.12),i?{}:{x,y,r:58})}
  jx({jfx:'bt_fuse',x:x0,y:y0,a,len:420,t:.75,m:.75})}),
 // ---------- Grande détonation (S) ----------
 bt_big:ULT('Bakuton : Grande détonation',BT_D.big,{ai:SELF(180,.85),tele:{self:1,r:210}},(u)=>{gkS('roar',u);anim(u,'gk_charge',1.1);u.root=Math.max(u.root,1);u.unstop=Math.max(u.unstop,1.15);u.bt_bg=1;
  aux.push({type:'bt_big',x:u.x,y:u.y,r:210,t:1,m:1,team:u.team,owner:u,ui:gkI(u),danger:1})}),
 // ---------- dash : Souffle explosif ----------
 bt_dash:SP('Souffle explosif',BT_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x-Math.cos(a)*20,y0=u.y-Math.sin(a)*20;anim(u,'lunge',.3);gkS('dash',u);
  btBoom(u,x0,y0,55,6,{kb:320},.12);dash(u,a,clamp(td||250,130,250),.2,{})}),
});
Object.assign(NATHERO,{bt:'kylo'});
// mine : s'arme, puis saute au premier ennemi qui marche dessus
AUXF.bt_mine=(x,dt)=>{const o=x.owner;if(x.done||!o)return;if(x.arm>0){x.arm-=dt;return}if(x.t<=.02){x.done=1;return}
 for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)&&!(e.dash&&e.dash.jump)){x.done=1;x.t=0;btBoom(o,x.x,x.y,80,22,{kb:420},.25);return}};
AUXD.bt_mine=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,armed=!(x.m-x.t<.5);g.save();g.fillStyle='#3a2a1a';g.strokeStyle='#14100a';g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y,12*s,5*s,0,0,7);g.fill();g.stroke();
 g.fillStyle='#f4e6c0';g.fillRect(q.x-7*s,q.y-4*s,14*s,4*s);g.fillStyle='#c0201a';g.fillRect(q.x-1.5*s,q.y-4*s,3*s,4*s);
 if(armed){const bl=(Math.sin(t*8)+1)/2;g.globalCompositeOperation='lighter';g.fillStyle=rgba(BTC.b,.3+.5*bl);g.beginPath();g.arc(q.x,q.y-6*s,(3+bl*3)*s,0,7);g.fill();g.strokeStyle=rgba(BTC.b,.25);gEll(x.x,x.y,x.r);g.stroke()}g.restore()};
// grande détonation : la lumière monte, puis tout saute
AUXF.bt_big=(x,dt)=>{const u=x.owner;if(x.done||!u)return;if(u.dead){x.done=1;x.t=0;u.bt_bg=0;return}x.x=u.x;x.y=u.y;u.root=Math.max(u.root,.05);
 if(x.t<=0){x.done=1;u.bt_bg=0;gkAoe(u,u.x,u.y,210,62,{kb:700,stun:.5},'bt_blast',e=>btCh(u,e));jx({jfx:'gk_boom',x:u.x,y:u.y,r:260,v:'bt_blast',s:'blast',t:.9,m:.9});jx({jfx:'bt_flash',x:u.x,y:u.y,t:.5,m:.5});
  if(near(u.x,u.y)){gkS('boom',u);gkS('heavy',u);shake=Math.max(shake,.6);sparks(u.x,u.y,BTC.a,30,'bt_blast')}}};
AUXD.bt_big=(x,k,t)=>{const u=units[x.ui];if(!u)return;const e=1-x.t/x.m,q=P(u.x,u.y,40),s=q.s;g.save();g.strokeStyle=rgba(BTC.b,.4+.5*e);g.lineWidth=2+e*4;gEll(u.x,u.y,x.r*(1-e*.85));g.stroke();g.fillStyle=rgba(BTC.c,.12+.2*e);gEll(u.x,u.y,x.r);g.fill();
 g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,(30+e*50)*s);gr.addColorStop(0,rgba('#ffffff',.6+.4*e));gr.addColorStop(1,rgba(BTC.b,0));g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,(30+e*50)*s,0,7);g.fill();
 g.strokeStyle=rgba('#ffffff',.6*e);g.lineWidth=2;for(let i=0;i<8;i++){const b=i*.785+t*2;g.beginPath();g.moveTo(q.x+Math.cos(b)*12*s,q.y+Math.sin(b)*12*s);g.lineTo(q.x+Math.cos(b)*(30+e*60)*s,q.y+Math.sin(b)*(30+e*60)*s);g.stroke()}g.restore()};
// ---- trait : Détonateur
GKST.push({key:'bt_ch',max:BT_MAX,col:'#ffb030',c2:'#5a2a06'});
KGTRAITS[3]={nom:'Détonateur',desc:'Tes explosions posent des charges sur la cible (2 au plus, 5 s). Ton coup de base sur une cible chargée fait sauter toutes ses charges : 8 dégâts par charge et recul',
 landed(src,t,dmg,o){if(!o.basic||dmg<=0||t.dead)return;const n=t.bt_ch|0;if(!n)return;gkStSet(t,'bt_ch',0);const V=VFX;VFX='bt_blast';hit(t,src,8*n,{kb:180*n,unblockable:1,fx:src.x,fy:src.y});VFX=V;
  jx({jfx:'gk_boom',x:t.x,y:t.y,r:40+n*15,v:'bt_blast',s:'blast',t:.45,m:.45});if(near(t.x,t.y)){gkS('boom',t);shake=Math.max(shake,.12)}},
 draw(u,p,S,sk){if(!(u.bt_bg>0))return;const t=performance.now()/1000;g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba(BTC.a,.7);g.lineWidth=2*S;for(let i=0;i<5;i++){const y=p.y-(10+i*12)*S;g.beginPath();g.moveTo(p.x-12*S,y);g.lineTo(p.x+(Math.sin(t*30+i)*6)*S,y-6*S);g.lineTo(p.x+12*S,y);g.stroke()}g.restore()},
 prev(u,p,S,front){if(!front)return;g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(BTC.b,.5);g.beginPath();g.arc(p.x+14*S,p.y-40*S,3*S,0,7);g.fill();g.restore()},
 hud(u,x,y){gkHud(u,x,y,'Détonateur','bt_ch',BT_MAX,BTC.b,BTC.a)}};
AFTER.push(()=>UK.push('bt_ch','bt_bg'));
// charge visible : petit parchemin explosif collé, mèche qui grésille
STATD.push((u,p,S,sk)=>{const n=u.bt_ch|0;if(!n||u.dead)return;const t=performance.now()/1000;g.save();for(let i=0;i<n;i++){const x=p.x+(i?10:-10)*S,y=p.y-(36+i*8)*S;g.fillStyle='#f4e6c0';g.strokeStyle='#5a2a06';g.lineWidth=1;g.fillRect(x-4*S,y-6*S,8*S,12*S);g.strokeRect(x-4*S,y-6*S,8*S,12*S);
 g.fillStyle='#c0201a';g.fillRect(x-1*S,y-4*S,2*S,8*S);g.globalCompositeOperation='lighter';g.fillStyle=rgba(BTC.b,.5+.5*Math.sin(t*14+i));g.beginPath();g.arc(x,y-8*S,2.5*S,0,7);g.fill();g.globalCompositeOperation='source-over'}g.restore()});
// ---- visuels
JFXD.bt_tag=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,40),s=q.s,bl=Math.sin(e*40)>0;g.save();g.fillStyle=bl?'#ffffff':BTC.b;g.beginPath();g.arc(q.x,q.y,(4+e*6)*s,0,7);g.fill();g.restore()};
JFXD.bt_lob=(f,k,e,t)=>{const m=Math.min(1,e*1.05);if(m>=1)return;const x=lerp(f.x,f.x2,m),y=lerp(f.y,f.y2,m),q=P(x,y,Math.sin(Math.PI*m)*110+30*(1-m)),s=q.s;g.save();g.globalCompositeOperation='lighter';
 const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,14*s);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,rgba(BTC.b,.9));gr.addColorStop(1,rgba(BTC.c,0));g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,14*s,0,7);g.fill();g.strokeStyle=rgba(BTC.a,.8);g.lineWidth=1.5;g.beginPath();g.arc(q.x,q.y,(8+Math.sin(t*20)*2)*s,0,7);g.stroke();g.restore()};
// mèche de chakra qui court au sol avant la réaction en chaîne
JFXD.bt_fuse=(f,k,e,t)=>{const L=f.len*Math.min(1,e*1.25),A=P(f.x,f.y,0),Bq=P(f.x+Math.cos(f.a)*L,f.y+Math.sin(f.a)*L,0);g.save();g.strokeStyle=rgba(BTC.c,.7*k);g.lineWidth=3;g.setLineDash([5,4]);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.stroke();g.setLineDash([]);
 g.globalCompositeOperation='lighter';g.fillStyle=rgba('#ffffff',k);g.beginPath();g.arc(Bq.x,Bq.y,4,0,7);g.fill();g.restore()};
JFXD.bt_flash=(f,k)=>{g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba('#fff4c0',.35*k);g.fillRect(0,0,W,H);g.restore()};

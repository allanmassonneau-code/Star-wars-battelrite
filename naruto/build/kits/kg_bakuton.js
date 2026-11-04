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
KGBAL[3]=[0.942,0.927];
const BTC=GK.bt_blast,BT_MAX=2,btCh=(u,e)=>gkStack(u,e,'bt_ch',1,BT_MAX,5);
// explosion : boule de feu (gk_boom au rayon réel), éclat, fumée noire, brûlure au sol ; gros coup = arrêt sur coup
function btBoom(u,x,y,r,d,o,sz){const n=gkAoe(u,x,y,r,d,Object.assign({kb:260},o),'bt_blast',e=>{btCh(u,e);if(d>=20)fxHitStop(u,e,d)});jx({jfx:'gk_boom',x,y,r,v:'bt_blast',s:'blast',t:.5,m:.5});
 gkImp(u,x,y,'bt_blast',r,{ring:0});fxSmoke(x,y,{u,col:'#4a3e36',n:2+Math.round(r/40),r:r*.5,s:12+r*.1,t:1,al:.18,rise:50+r*.4});fxBurst(x,y,BTC.a,{u,z:20,n:6,sp:200+r*2,up:100,gr:300,w:2,len:.12,t:.5});
 if(near(x,y))gkS('boom',u);return n}
Object.assign(NAT,{
 // ---------- Jiraiken (D) : poing mine ----------
 bt_fist:SP('Bakuton : Jiraiken',BT_D.fist,5,{ai:{mode:'gap',min:40,max:170,p:.8},line:{len:150,w:50}},(u,a)=>{gkS('dash',u);anim(u,'lunge',.4);let done=0;fxCharge(u,BTC.b,{t:.2,n:8,z:34,hd:18,c2:'#ffffff'});gkTrail(u,'bt_blast',.22,{w:14,z:30});jx({jfx:'bt_fistg',ui:gkI(u),x:u.x,y:u.y,a,t:.3,m:.3});
  const chk=()=>{if(done||u.dead)return;for(const e of enemies(u))if(dist(u,e)<u.r+e.r+22&&angDiff(ang(u,e),a)<1.2){done=1;u.dash=null;if(gkHit(e,u,10,{melee:1},'bt_blast')){btCh(u,e);
     const ti=gkI(e);jx({jfx:'bt_tag',ti,x:e.x,y:e.y,t:.6,m:.6});jx({jfx:'bt_punch',x:e.x-Math.cos(a)*e.r,y:e.y-Math.sin(a)*e.r,a,t:.42,m:.42});fxRing(e.x,e.y,{u,r0:6,r1:40,col:BTC.b,c2:'#ffffff',w:4,t:.26});fxSmoke(e.x,e.y,{u,col:'#5a4a40',n:3,r:18,s:10,t:.8,al:.22,rise:22,dx:Math.cos(a)*30,dy:Math.sin(a)*30});fxFlare(e.x,e.y,BTC.b,{u,z:34,r:22,t:.15});fxBurst(e.x,e.y,BTC.a,{u,z:32,n:6,sp:220,a,arc:1.4,w:1.6,t:.3});later(u,.6,()=>{if(!e.dead)btBoom(u,e.x,e.y,55,8,{})})}if(near(e.x,e.y))gkS('hit',e);return}};
  dash(u,a,120,.16,{end:()=>{chk();if(!done&&!u.dead&&near(u.x,u.y)){const f=fwd(u,a,22);jx({jfx:'bt_punch',x:f.x,y:f.y,a,t:.3,m:.3,sm:1,oi:gkI(u)})}}});aux.push({type:'gk_chk',x:u.x,y:u.y,r:0,t:.2,m:.2,team:u.team,owner:u,f:chk})}), // dans le vide : petite détonation au poing (décor)
 // ---------- Mine (C) ----------
 bt_mine:SP('Bakuton : Mine',BT_D.mine,8,{ai:RG(320,.5)},(u,a,td)=>{const c=atP(u,a,td,320);gkS('deflect',u);anim(u,'stomp',.4);for(const x of aux)if(x.type==='bt_mine'&&x.owner===u)x.t=Math.min(x.t,.01);
  aux.push({type:'bt_mine',x:c.x,y:c.y,r:30,t:12,m:12,team:u.team,owner:u,k:.5,arm:.5});fxRing(c.x,c.y,{u,r0:6,r1:30,col:BTC.b,t:.3,w:3});fxSmoke(c.x,c.y,{u,col:'#9a8268',n:3,r:16,s:9,t:.7,al:.22,rise:10})}),
 // ---------- Grenade de chakra (B) ----------
 bt_gren:SP('Bakuton : Grenade de chakra',BT_D.gren,10,{ai:RG(430,.65),tele:{r:90,max:430}},(u,a,td)=>{const c=atP(u,a,td,430),D=.35+Math.hypot(c.x-u.x,c.y-u.y)/1300;gkS('blaster',u);anim(u,'gk_lob',.45);fxCast(u,'bt_blast',.2,{n:6});
  jx({jfx:'bt_lob',x:u.x,y:u.y,x2:c.x,y2:c.y,t:D,m:D});later(u,D,()=>btBoom(u,c.x,c.y,90,26,{stun:.6,kb:120},.25),{x:c.x,y:c.y,r:90})}),
 // ---------- Réaction en chaîne (A) ----------
 bt_chain:SP('Bakuton : Réaction en chaîne',BT_D.chain,13,{ai:RG(400,.7),line:{len:420,w:110}},(u,a)=>{gkS('heavy',u);anim(u,'gk_slam',.55);const x0=u.x,y0=u.y;fxRing(x0,y0,{u,r0:8,r1:40,col:BTC.b,t:.25,w:3});
  for(let i=0;i<6;i++){const d=60+i*70,x=clamp(x0+Math.cos(a)*d,B.x+10,B.x+B.w-10),y=clamp(y0+Math.sin(a)*d,B.y+10,B.y+B.h-10);later(u,.12+i*.1,()=>btBoom(u,x,y,58,12,{kb:240},.12),i?{}:{x,y,r:58})}
  jx({jfx:'bt_fuse',x:x0,y:y0,a,len:420,t:.75,m:.75})}),
 // ---------- Grande détonation (S) ----------
 bt_big:ULT('Bakuton : Grande détonation',BT_D.big,{ai:SELF(180,.85),tele:{self:1,r:210}},(u)=>{gkS('roar',u);anim(u,'gk_charge',1.1);fxCharge(u,BTC.b,{t:1,n:16,r:70,z:30,hd:0,c2:'#ffffff'});u.root=Math.max(u.root,1);u.unstop=Math.max(u.unstop,1.15);u.bt_bg=1;
  aux.push({type:'bt_big',x:u.x,y:u.y,r:210,t:1,m:1,team:u.team,owner:u,ui:gkI(u),danger:1})}),
 // ---------- dash : Souffle explosif ----------
 bt_dash:SP('Souffle explosif',BT_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x-Math.cos(a)*20,y0=u.y-Math.sin(a)*20;anim(u,'lunge',.3);gkS('dash',u);
  btBoom(u,x0,y0,55,6,{kb:320},.12);dash(u,a,clamp(td||250,130,250),.2,{});gkTrail(u,'bt_blast',.3,{w:16,z:26})}),
});
Object.assign(NATHERO,{bt:'kylo'});
// mine : s'arme, puis saute au premier ennemi qui marche dessus
AUXF.bt_mine=(x,dt)=>{const o=x.owner;if(x.done||!o)return;if(x.arm>0){x.arm-=dt;return}if(x.t<=.02){x.done=1;return}
 for(const e of enemies(o))if(gkIn(e,x.x,x.y,x.r)&&!(e.dash&&e.dash.jump)){x.done=1;x.t=0;btBoom(o,x.x,x.y,80,22,{kb:420},.25);return}};
AUXD.bt_mine=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,armed=!(x.m-x.t<.5);if(armed&&!x.done)gkEdge(x.x,x.y,x.r,BTC.b,.75,x);g.save();g.fillStyle='#3a2a1a';g.strokeStyle='#14100a';g.lineWidth=1.2;g.beginPath();g.ellipse(q.x,q.y,12*s,5*s,0,0,7);g.fill();g.stroke();
 g.fillStyle='#f4e6c0';g.fillRect(q.x-7*s,q.y-4*s,14*s,4*s);g.fillStyle='#c0201a';g.fillRect(q.x-1.5*s,q.y-4*s,3*s,4*s);
 if(armed){const bl=(Math.sin(t*8)+1)/2;fxGlowS(q.x,q.y-6*s,(5+bl*5)*s,BTC.b,.4+.5*bl)}g.restore()};
// grande détonation : la lumière monte, puis tout saute
AUXF.bt_big=(x,dt)=>{const u=x.owner;if(x.done||!u)return;if(u.dead){x.done=1;x.t=0;u.bt_bg=0;return}x.x=u.x;x.y=u.y;u.root=Math.max(u.root,.05);
 if(x.t<=0){x.done=1;u.bt_bg=0;gkAoe(u,u.x,u.y,210,62,{kb:700,stun:.5},'bt_blast',e=>{btCh(u,e);fxHitStop(u,e,62,1)});jx({jfx:'gk_boom',x:u.x,y:u.y,r:210,v:'bt_blast',s:'blast',t:.9,m:.9});jx({jfx:'bt_flash',x:u.x,y:u.y,r:210,t:.6,m:.6});
  // lumière LOCALE (plus de voile plein écran), double onde au rayon réel, champignon de fumée, éclats, cratère brûlé
  fxFlare(u.x,u.y,BTC.b,{u,z:44,r:46,t:.3,al:.6});fxLight(u.x,u.y,320,BTC.b,{u,t:.7,a:.4});fxRing(u.x,u.y,{u,r0:30,r1:210,col:BTC.b,c2:'#ffffff',t:.45,w:12});fxRing(u.x,u.y,{u,r0:10,r1:150,col:BTC.c,t:.7,w:6});
  fxSmoke(u.x,u.y,{u,col:'#5a4a40',n:8,r:130,s:28,t:1.7,al:.2,rise:150});fxSmoke(u.x,u.y,{u,col:'#6a5a50',n:4,r:30,s:24,t:1.6,al:.17,rise:240});fxDebris(u.x,u.y,{u,n:14,sp:330,col:'#5a4028',c2:BTC.c,s:5,t:1.5});
  fxBurst(u.x,u.y,BTC.a,{u,z:30,n:26,sp:520,up:160,gr:260,w:2.6,len:.14,c2:'#ffffff',t:.8});fxDecal(u.x,u.y,'scorch',{u,r:150,t:5});fxShake(.5,u.x,u.y);
  if(near(u.x,u.y)){gkS('boom',u);gkS('heavy',u)}}};
// charge : télégraphe net au rayon réel (210, liseré rouge si ennemi), anneau qui se resserre, lumière qui monte DERRIÈRE le ninja (couche du sol), étincelles aspirées
AUXD.bt_big=(x,k,t)=>{const u=units[x.ui];if(!u||x.done)return;const e=1-x.t/x.m,q=P(u.x,u.y,40),s=q.s,g0=P(u.x,u.y,0);fxTele(u.x,u.y,x.r,e,BTC.b,u,.06+.06*e);
 g.save();g.strokeStyle=rgba(BTC.b,.5+.5*e);g.lineWidth=2+e*4;gEll(u.x,u.y,x.r*(1-e*.85));g.stroke();g.restore();
 gkDim(u,()=>{fxGlowS(g0.x,g0.y,(40+e*90)*s,BTC.b,.18+.22*e,(40+e*90)*s*K,0);fxGlowS(q.x,q.y,(18+e*20)*s,BTC.b,.16+.16*e,undefined,0); // lueur sans cœur blanc : le lanceur reste lisible
  g.save();g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#ffffff',.6*e);g.lineWidth=2;const n=gkN(10,u);for(let i=0;i<n;i++){const b=i*.628+t*2,ph=(t*2.2+i*.37)%1,r0=(14+(1-ph)*80)*s;g.beginPath();g.moveTo(q.x+Math.cos(b)*r0,q.y+Math.sin(b)*r0*.7);g.lineTo(q.x+Math.cos(b)*(r0+10*s),q.y+Math.sin(b)*(r0+10*s)*.7);g.stroke()}g.restore()})};
// ---- trait : Détonateur
GKST.push({key:'bt_ch',max:BT_MAX,col:'#ffb030',c2:'#5a2a06'});
KGTRAITS[3]={nom:'Détonateur',desc:'Tes explosions posent des charges sur la cible (2 au plus, 5 s). Ton coup de base sur une cible chargée fait sauter toutes ses charges : 8 dégâts par charge et recul',
 landed(src,t,dmg,o){if(!o.basic||dmg<=0||t.dead)return;const n=t.bt_ch|0;if(!n)return;gkStSet(t,'bt_ch',0);const V=VFX;VFX='bt_blast';hit(t,src,8*n,{kb:180*n,unblockable:1,fx:src.x,fy:src.y});VFX=V;
  jx({jfx:'gk_boom',x:t.x,y:t.y,r:40+n*15,v:'bt_blast',s:'blast',t:.45,m:.45});fxFlare(t.x,t.y,BTC.b,{u:src,z:34,r:24,t:.18});fxSmoke(t.x,t.y,{u:src,col:'#4a3e36',n:2,r:20,s:12,t:.9,al:.18,rise:50});fxHitStop(src,t,8*n+8,n>1);if(near(t.x,t.y))gkS('boom',t)},
 draw(u,p,S,sk){if(!(u.bt_bg>0))return;const t=performance.now()/1000;g.save();g.globalAlpha=fxA(u);g.globalCompositeOperation='lighter';g.strokeStyle=rgba(BTC.a,.7);g.lineWidth=2*S;for(let i=0;i<5;i++){const y=p.y-(10+i*12)*S;g.beginPath();g.moveTo(p.x-12*S,y);g.lineTo(p.x+(Math.sin(t*30+i)*6)*S,y-6*S);g.lineTo(p.x+12*S,y);g.stroke()}g.restore()},
 prev(u,p,S,front){if(!front)return;g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(BTC.b,.5);g.beginPath();g.arc(p.x+14*S,p.y-40*S,3*S,0,7);g.fill();g.restore()},
 hud(u,x,y){gkHud(u,x,y,'Détonateur','bt_ch',BT_MAX,BTC.b,BTC.a)}};
AFTER.push(()=>UK.push('bt_ch','bt_bg'));
// charge visible : petit parchemin explosif collé, mèche qui grésille
STATD.push((u,p,S,sk)=>{const n=u.bt_ch|0;if(!n||u.dead)return;const t=performance.now()/1000;g.save();for(let i=0;i<n;i++){const x=p.x+(i?10:-10)*S,y=p.y-(36+i*8)*S;g.fillStyle='#f4e6c0';g.strokeStyle='#5a2a06';g.lineWidth=1;g.fillRect(x-4*S,y-6*S,8*S,12*S);g.strokeRect(x-4*S,y-6*S,8*S,12*S);
 g.fillStyle='#c0201a';g.fillRect(x-1*S,y-4*S,2*S,8*S);g.globalCompositeOperation='lighter';g.fillStyle=rgba(BTC.b,.5+.5*Math.sin(t*14+i));g.beginPath();g.arc(x,y-8*S,2.5*S,0,7);g.fill();g.globalCompositeOperation='source-over'}g.restore()});
// ---- visuels
JFXD.bt_tag=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,40),s=q.s,bl=Math.sin(e*40)>0;g.save();g.fillStyle=bl?'#ffffff':BTC.b;g.beginPath();g.arc(q.x,q.y,(4+e*6)*s,0,7);g.fill();g.restore()};
// grenade de chakra en cloche : sphère qui pulse, mèche d'étincelles derrière, ombre au sol (où elle tombe)
JFXD.bt_lob=(f,k,e,t)=>{const m=Math.min(1,e*1.05);if(m>=1)return;const H=m2=>Math.sin(Math.PI*m2)*110+30*(1-m2),pos=m2=>P(lerp(f.x,f.x2,m2),lerp(f.y,f.y2,m2),H(m2)),q=pos(m),s=q.s,sh=P(lerp(f.x,f.x2,m),lerp(f.y,f.y2,m),0);
 fxSoftS(sh.x,sh.y,9*s,'#000000',.3,9*s*K);const n=gkN(6,f);for(let i=1;i<=n;i++){const q2=pos(Math.max(0,m-i*.035));fxGlowS(q2.x+Math.sin(t*30+i)*2,q2.y,(7-i*.8)*s,BTC.b,.6*(1-i/(n+1)))}
 const pl=1+.25*Math.sin(t*20);fxGlowS(q.x,q.y,16*s*pl,BTC.b,.9);fxGlowS(q.x,q.y,7*s,'#ffffff',.6);g.save();g.strokeStyle=rgba(BTC.a,.8);g.lineWidth=1.5;g.beginPath();g.arc(q.x,q.y,(8+Math.sin(t*20)*2)*s,0,7);g.stroke();g.restore()};
// mèche de chakra qui court au sol avant la réaction en chaîne
// mèche de chakra qui court au sol (télégraphe de la chaîne) : trait pointillé, tête qui crépite, braises qui sautent
JFXD.bt_fuse=(f,k,e,t)=>{const L=f.len*Math.min(1,e*1.25),A=P(f.x,f.y,0),Bq=P(f.x+Math.cos(f.a)*L,f.y+Math.sin(f.a)*L,0);g.save();g.strokeStyle=rgba(BTC.c,.75*k);g.lineWidth=3;g.setLineDash([5,4]);g.beginPath();g.moveTo(A.x,A.y);g.lineTo(Bq.x,Bq.y);g.stroke();g.setLineDash([]);g.restore();
 fxGlowS(Bq.x,Bq.y,(10+3*Math.sin(t*40))*Bq.s,BTC.b,.9*k);fxGlowS(Bq.x,Bq.y,4*Bq.s,'#ffffff',k);
 g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(BTC.a,k);const n=gkN(6,f);for(let i=0;i<n;i++){const ph=(t*4+i*.17)%1,b=f.a+Math.PI+(((i*.618)%1)-.5)*2,p=P(f.x+Math.cos(f.a)*L+Math.cos(b)*ph*22,f.y+Math.sin(f.a)*L+Math.sin(b)*ph*22,ph*(1-ph)*40);g.fillRect(p.x-1,p.y-1,2,2)}g.restore()};
// grande détonation : lumière LOCALE (plus jamais de voile plein écran) : boule de lumière au sol au rayon de l'explosion, qui s'éteint vite
JFXD.bt_flash=(f,k)=>{const q=P(f.x,f.y,0),R=(f.r||210)*q.s;fxGlowS(q.x,q.y,R*1.2,'#fff4c0',.26*k*k,R*1.2*K,0)};

// Jiraiken : poing chargé d'argile explosive pendant la ruée (lueur qui crépite), puis détonation en éventail VERS L'AVANT au contact
JFXD.bt_fistg=(f,k,e,t,u)=>{if(!u||u.dead)return;const a=u.aim,h=P(u.x+Math.cos(a)*18,u.y+Math.sin(a)*18,32),s=h.s,fl=.6+.4*Math.sin(t*60);
 fxGlowS(h.x,h.y,(10+6*fl)*s,BTC.b,.75*Math.min(1,k*3));fxGlowS(h.x,h.y,4*s,'#ffffff',.6*Math.min(1,k*3));g.globalCompositeOperation='lighter';g.strokeStyle=rgba(BTC.a,.8*k);g.lineWidth=1.3*s;
 for(let i=0;i<3;i++){const b=fxH((t*20|0),i,1)*6.28,r=(6+8*fxH((t*20|0),i,2))*s;g.beginPath();g.moveTo(h.x,h.y);g.lineTo(h.x+Math.cos(b)*r,h.y+Math.sin(b)*r*.8);g.stroke()}};
JFXD.bt_punch=(f,k,e,t)=>{const q=P(f.x,f.y,30),s=q.s*(f.sm?.6:1),ee=1-Math.pow(1-e,3),ca=Math.cos(f.a),sa=Math.sin(f.a)*K,an=Math.atan2(sa,ca);g.save();g.translate(q.x,q.y);g.rotate(an);g.globalCompositeOperation='lighter';
 const R=(14+44*ee)*s,A=Math.max(0,1-e*1.15);g.globalAlpha=A;g.drawImage(fxSpr(BTC.b,1),-R*.4,-R*.8,R*1.6,R*1.6); // boule de feu poussée vers l'avant (cœur blanc bref)
 g.strokeStyle=BTC.a;g.lineWidth=Math.max(1,4*s*(1-e));g.beginPath();g.ellipse(R*.25,0,R*.55,R*.95,0,-1.2,1.2);g.stroke(); // onde en croissant
 g.strokeStyle=BTC.b;g.lineCap='round';for(let i=0;i<7;i++){const b=(i-3)*.32,r0=R*.3,r1=R*(1+.25*fxH(f.x|0,i,1));g.lineWidth=Math.max(.8,2.2*s*(1-e));g.beginPath();g.moveTo(Math.cos(b)*r0,Math.sin(b)*r0);g.lineTo(Math.cos(b)*r1,Math.sin(b)*r1);g.stroke()}
 g.restore()};

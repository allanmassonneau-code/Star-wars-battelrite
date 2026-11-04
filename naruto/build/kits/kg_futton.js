// ===== Kekkei genkai g1 : Futton, la vapeur bouillante (préfixe ft_) — Katon + Suiton (Han, Mei Terumî) =====
// Identité : l'usure. La vapeur et la brume acide RONGENT (trait : corrosion, jusqu'à 3 cumuls) ; à 3 cumuls, la cible est ralentie et prend plus cher.
// Jet de vapeur, brume acide, armure de vapeur (Han), charge bouillante, grand chaudron qui entre en éruption ; dash : propulsion de vapeur.
gkPal('ft_steam','#fff4ec','#f2a890','#b0503a','#4a1a12');
defKG(1,{n:'Futton',col:'#f0907a',tag:'Fu',el:'Katon + Suiton',nat:1,d:'La vapeur bouillante : brume acide qui ronge, armure de vapeur, charges brûlantes',
 ico:f=>{g.lineWidth=2.6;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*7,10);g.bezierCurveTo(i*7-5,4,i*7+5,0,i*7,-5);g.bezierCurveTo(i*7-4,-8,i*7+2,-11,i*7,-12);g.stroke()}}});
const FT_D={
 jet:'Jet de vapeur bouillante devant toi (160) : 14 dégâts, repousse et 1 corrosion',
 mist:'Brume acide au point visé (420 max) pendant 4 s : 3 dégâts toutes les 0,5 s, ralentit et ajoute 1 corrosion par seconde passée dedans',
 armor:'Armure de vapeur 4 s : la vapeur jaillit (10 dégâts, repousse autour), −25 % de dégâts subis, plus rapide ; les ennemis au contact prennent 4 dégâts toutes les 0,5 s et 1 corrosion',
 charge:'Charge propulsée par la vapeur (320) : le 1er ennemi percuté prend 34 dégâts, est violemment repoussé et reçoit 2 corrosions ; la vapeur explose autour (10 dégâts)',
 caul:'Grand chaudron au point visé (360 max) : la pression monte 1 s, puis tout entre en éruption : 50 dégâts, projeté 0,8 s, 2 corrosions ; la brume acide reste 3 s',
 dash:'Propulsion de vapeur (230) : un nuage bouillant reste à ton point de départ 1,5 s (ralentit, 1 corrosion)'};
KIT('g1',[
 ['D','x.ft_jet','Futton : Jet de vapeur',FT_D.jet,'ft_steam'],
 ['C','x.ft_mist','Futton : Kômu',FT_D.mist,'ft_steam'],
 ['B','x.ft_armor','Futton : Armure de vapeur',FT_D.armor,'ft_steam'],
 ['A','x.ft_charge','Futton : Kôkô',FT_D.charge,'ft_steam'],
 ['S','x.ft_caul','Futton : Grand chaudron',FT_D.caul,'ft_steam'],
]);
DASHG[1]={src:'x.ft_dash',n:'Propulsion de vapeur',d:FT_D.dash,vfx:'ft_steam',cd:7};
KGBAL[1]=[0.909,0.904];
const FTC=GK.ft_steam,FT_MAX=3,ftCor=(u,e,n)=>gkStack(u,e,'ft_cor',n,FT_MAX,4);GKPOOLC.ft='#c8e070';FXTELE.add('ft_build');
// brume acide : 3 dégâts / 0,5 s, ralentit, 1 corrosion par seconde (un tick sur deux)
const ftMist=(u,x,y,r,t)=>gkPool(u,x,y,{r,t,kind:'ft',vfx:'ft_steam',d:3,sl:1,fn:(e,q)=>{q.n2=(q.n2||0)+1;if(q.n2%2)ftCor(u,e,1)}});
Object.assign(NAT,{
 // ---------- Jet de vapeur (D) ----------
 ft_jet:SP('Futton : Jet de vapeur',FT_D.jet,5,{ai:RG(170,.8),line:{len:170,w:110}},(u,a)=>{gkS('water',u);gkS('wind',u);anim(u,'gk_push',.4);jx({jfx:'ft_cone',ui:gkI(u),x:u.x,y:u.y,a,r:170,arc:.5,t:.5,m:.5});
  for(const e of enemies(u))if(dist(u,e)<170+e.r&&angDiff(ang(u,e),a)<.5&&gkHit(e,u,14,{kb:220,unblockable:1},'ft_steam')){ftCor(u,e,1);fxBurst(e.x,e.y,'#ffffff',{u,z:30,n:7,sp:200,a,arc:1.4,up:60,gr:200,w:2,len:.05,c2:FTC.b,t:.4})}}),
 // ---------- Kômu (C) : brume acide ----------
 ft_mist:SP('Futton : Kômu',FT_D.mist,8,{ai:RG(420,.6),tele:{r:110,max:420}},(u,a,td)=>{const c=atP(u,a,td,420);gkS('water',u);gkS('wind',u);anim(u,'breath',.55);fxCast(u,'ft_steam',.25,{mouth:1,n:8});
  jx({jfx:'ft_cone',ui:gkI(u),x:u.x,y:u.y,a,r:120,arc:.3,t:.45,m:.45});jx({jfx:'gk_boom',x:c.x,y:c.y,r:110,v:'ft_steam',s:'steam',t:.6,m:.6});ftMist(u,c.x,c.y,110,4);
  fxSmoke(c.x,c.y,{u,col:'#e4ecc8',n:6,r:80,s:24,t:1.4,al:.26,rise:30})}),
 // ---------- Armure de vapeur (B) ----------
 ft_armor:SP('Futton : Armure de vapeur',FT_D.armor,10,{ai:SELF(160,.6)},(u)=>{gkS('water',u);gkS('boom',u);anim(u,'gk_charge',.45);u.ft_ar=4;u.drT=Math.max(u.drT||0,4);u.dr=Math.max(u.drT>4.01?u.dr||0:0,.25);u.haste=Math.max(u.haste||0,4);
  gkAoe(u,u.x,u.y,95,10,{kb:260},'ft_steam',e=>ftCor(u,e,1));jx({jfx:'gk_boom',x:u.x,y:u.y,r:95,v:'ft_steam',s:'steam',t:.6,m:.6});
  fxRing(u.x,u.y,{u,r0:20,r1:95,col:'#ffffff',c2:FTC.b,t:.4,w:6});fxWind(u.x,u.y,0,{u,spin:1,w:80,n:8,t:.5,col:'#ffffff'});fxBurst(u.x,u.y,FTC.b,{u,z:24,n:10,sp:260,up:30,gr:60,w:1.6,len:.14,t:.4});say(u,'ARMURE DE VAPEUR',FTC.a)}),
 // ---------- Kôkô (A) : charge propulsée ----------
 ft_charge:SP('Futton : Kôkô',FT_D.charge,13,{ai:{mode:'gap',min:80,max:330,p:.7},line:{len:320,w:50}},(u,a,td)=>{gkS('boom',u);gkS('dash',u);anim(u,'lunge',.45);let done=0;
  jx({jfx:'ft_trail',ui:gkI(u),x:u.x,y:u.y,t:.45,m:.45});gkTrail(u,'ft_steam',.45,{w:20,z:26});fxSmoke(u.x,u.y,{u,col:'#ffffff',n:5,r:24,s:18,t:.9,al:.3,rise:30,dx:-Math.cos(a)*60,dy:-Math.sin(a)*60});
  const chk=()=>{if(done||u.dead)return;for(const e of enemies(u))if(dist(u,e)<u.r+e.r+14){done=1;u.dash=null;gkHit(e,u,34,{kb:520,stun:.2,unblockable:1},'ft_steam');ftCor(u,e,2);
    gkAoe(u,u.x,u.y,80,10,{},'ft_steam');jx({jfx:'gk_boom',x:u.x,y:u.y,r:80,v:'ft_steam',s:'steam',t:.6,m:.6});gkImp(u,e.x,e.y,'ft_steam',60,{ring:0});
    fxFlare(e.x,e.y,FTC.b,{u,z:30,r:30,t:.2});fxBurst(e.x,e.y,FTC.b,{u,z:30,n:10,sp:300,a,arc:1.6,w:2,c2:'#ffffff',t:.4});fxHitStop(u,e,34);if(near(u.x,u.y))gkS('heavy',u);return}};
  dash(u,a,320,.32,{end:chk});aux.push({type:'gk_chk',x:u.x,y:u.y,r:0,t:.36,m:.36,team:u.team,owner:u,f:chk})}),
 // ---------- Grand chaudron (S) ----------
 ft_caul:ULT('Futton : Grand chaudron',FT_D.caul,{ai:RG(360,.8),tele:{r:170,max:360}},(u,a,td)=>{const c=atP(u,a,td,360),R=170,D=1;gkS('water',u);gkS('heavy',u);anim(u,'gk_call',.9);
  jx({jfx:'ft_build',x:c.x,y:c.y,r:R,t:D,m:D});fxCast(u,'ft_steam',.8,{n:14});
  later(u,D,()=>{gkAoe(u,c.x,c.y,R,50,{air:.8},'ft_steam',e=>ftCor(u,e,2));ftMist(u,c.x,c.y,R,3);jx({jfx:'ft_geyser',x:c.x,y:c.y,r:R,t:1.3,m:1.3});jx({jfx:'gk_boom',x:c.x,y:c.y,r:R,v:'ft_steam',s:'steam',t:.8,m:.8});
   fxRing(c.x,c.y,{u,r0:30,r1:R,col:'#ffffff',c2:FTC.b,t:.45,w:8});fxRing(c.x,c.y,{u,r0:10,r1:R*.7,col:FTC.b,t:.6,w:4});fxFlare(c.x,c.y,FTC.b,{u,z:40,r:30,t:.25,al:.6});fxLight(c.x,c.y,R*1.2,FTC.b,{u,t:.6,a:.25});
   fxSmoke(c.x,c.y,{u,col:'#ffffff',n:8,r:R*.7,s:26,t:1.8,al:.2,rise:170});fxBurst(c.x,c.y,FTC.b,{u,z:20,n:14,sp:330,up:260,gr:420,w:2.2,len:.06,c2:'#ffffff',t:.9});fxDecal(c.x,c.y,'puddle',{u,r:R*.8,t:3.5,col:'#a8b878'});
   for(const e of enemies(u))if(gkIn(e,c.x,c.y,R))fxHitStop(u,e,50,1);fxShake(.38,c.x,c.y);if(near(c.x,c.y)){gkS('boom',u);gkS('water',u)}},{x:c.x,y:c.y,r:R})}),
 // ---------- dash : Propulsion de vapeur ----------
 ft_dash:SP('Propulsion de vapeur',FT_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y;gkS('water',u);gkS('dash',u);anim(u,'lunge',.3);
  gkPool(u,x0,y0,{r:70,t:1.5,kind:'ft',vfx:'ft_steam',sl:1,fn:(e,q)=>{q.hs=q.hs||new Set();if(!q.hs.has(e)){q.hs.add(e);ftCor(u,e,1)}}});jx({jfx:'gk_boom',x:x0,y:y0,r:70,v:'ft_steam',s:'steam',t:.5,m:.5});dash(u,a,clamp(td||230,120,230),.22,{});gkTrail(u,'ft_steam',.35,{w:18,z:26});
  fxSmoke(x0,y0,{u,col:'#ffffff',n:5,r:30,s:18,t:1,al:.3,rise:50,dx:-Math.cos(a)*50,dy:-Math.sin(a)*50})}),
});
Object.assign(NATHERO,{ft:'kylo'});
// ---- trait : Corrosion
GKST.push({key:'ft_cor',max:FT_MAX,col:'#c8e070',c2:'#4a5a10'});
KGTRAITS[1]={nom:'Corrosion',desc:'Ta vapeur ronge : chaque cumul de corrosion (3 au plus, 4 s) fait subir +6 % de tes dégâts ; à 3 cumuls, la cible est aussi ralentie. Sous l\'Armure de vapeur, les ennemis au contact sont ébouillantés',
 init(u){u.ft_ar=0},
 update(u,dt){if(u.ft_cds!==u.cds){u.ft_cds=u.cds;u.ft_ar=0}
  for(const e of enemies(u))if((e.ft_cor|0)>=FT_MAX&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.15);
  if(u.ft_ar>0){u.ft_ar=Math.max(0,u.ft_ar-dt);u.ft_k=(u.ft_k||0)-dt;if(u.ft_k<=0){u.ft_k=.5;for(const e of enemies(u))if(dist(u,e)<u.r+e.r+40&&gkHit(e,u,4,{silent:1},'ft_steam'))ftCor(u,e,1)}}},
 deal(src,t,dmg,o){const n=t.ft_cor|0;return n?dmg*(1+.06*n):dmg},
 draw(u,p,S,sk){if(!(u.ft_ar>0))return;const t=performance.now()/1000,a=Math.min(1,u.ft_ar*2),s=S*(sk||1);gkDim(u,()=>{fxGlowS(p.x,p.y,30*s,FTC.b,.35*a,10*s,0);
  const n=gkN(10,u);for(let i=0;i<n;i++){const ph=(t*.8+i/n)%1,b=i*.7+t*1.3,side=Math.cos(b),x=p.x+side*(17+ph*8)*s,y=p.y-(6+ph*64)*s;fxSoftS(x,y,(5+ph*11)*S,i%3?'#ffffff':FTC.b,.26*a*Math.sin(Math.PI*ph)*(side>0?1:.7))}})},
 prev(u,p,S,front){if(!front)return;const t=performance.now()/1000;g.save();for(let i=0;i<4;i++){const ph=(t*.5+i/4)%1;g.fillStyle=rgba('#ffffff',.25*(1-ph));g.beginPath();g.arc(p.x+(i-1.5)*8*S,p.y-(20+ph*40)*S,(4+ph*6)*S,0,7);g.fill()}g.restore()},
 hud(u,x,y){gkHud(u,x,y,'Corrosion','ft_cor',FT_MAX,'#c8e070',FTC.a,u.ft_ar>0?'· ARMURE':'')}};
AFTER.push(()=>UK.push('ft_cor','ft_ar'));
// ---- visuels
// brume acide : voile laiteux teinté de vert (doux, non additif), bouffées qui roulent, bulles d'acide qui crèvent ; le bord net est tracé par gk_pool
GKPOOL.ft=(x,k,t)=>{const R=x.r,q=P(x.x,x.y,0),s=q.s;fxSoftS(q.x,q.y,R*s*1.02,'#c8dc98',.28*k,R*s*1.02*K);
 const n=x.strip?2:gkN(9,x.owner||x);for(let i=0;i<n;i++){const b=i*2.4+t*.25*(i%2?1:-1)+(x.i||0),d=R*(.15+((i*.31)%1)*.68),z=6+((t*12+i*9)%26),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,z),r=(16+(i%3)*7)*p.s*(x.r/90);
  fxSoftS(p.x,p.y,r*1.3,i%3?'#f4f0e4':'#d6e6a8',.3*k*(.6+.4*Math.sin(t*1.7+i)))}
 if(!x.strip){g.save();g.lineWidth=1.2;const m=gkN(5,x.owner||x);for(let i=0;i<m;i++){const ph=(t*.7+i*.31)%1,b=i*1.9+Math.floor(t*.7+i*.31)*2.3,d=R*.75*((i*.43+Math.floor(t*.7+i*.31)*.37)%1),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,1);
  g.strokeStyle=rgba('#d8f080',.8*k*(1-ph));g.beginPath();g.ellipse(p.x,p.y-ph*3,(1.5+ph*5)*p.s,(1.5+ph*5)*p.s*.7,0,0,7);g.stroke()}g.restore()}};
// jet de vapeur : cône de bouffées qui remplit EXACTEMENT le secteur touché (rayon r, demi-ouverture arc) ; cœur brûlant additif
// jet de vapeur : le cône dessiné = hitbox (rayon r, demi-ouverture arc) ; front qui jaillit en 0,2 s, filets brûlants, bouffées qui s'enflent en avançant, nuage qui reste au bout
JFXD.ft_cone=(f,k,e,t,u)=>{const x0=u&&!u.dead?u.x:f.x,y0=u&&!u.dead?u.y:f.y,arc=f.arc??.5,n=gkN(20,f),fr=Math.min(1,e*2.6),A=Math.min(1,k*2),o=P(x0,y0,0),s=o.s;
 // bord du cône (hitbox exacte), net mais fin
 g.save();g.strokeStyle=rgba(FTC.b,.45*A);g.lineWidth=1.4;g.beginPath();g.moveTo(o.x,o.y);for(let i=0;i<=14;i++){const b=f.a-arc+2*arc*i/14,q=P(x0+Math.cos(b)*f.r*fr,y0+Math.sin(b)*f.r*fr,0);g.lineTo(q.x,q.y)}g.closePath();g.stroke();
 g.fillStyle=rgba(FTC.a,.07*A);g.fill();
 // filets de vapeur brûlante (additifs) depuis la bouche
 g.globalCompositeOperation='lighter';g.lineCap='round';const h0=P(x0+Math.cos(f.a)*14,y0+Math.sin(f.a)*14,30);
 for(let i=0;i<9;i++){const b=f.a+((i/8)*2-1)*arc*.8,d1=f.r*fr*(.75+.25*((i*.53)%1)),d0=d1*Math.max(.1,e*.9),q0=P(x0+Math.cos(b)*d0,y0+Math.sin(b)*d0,30-d0*.06),q1=P(x0+Math.cos(b)*d1,y0+Math.sin(b)*d1,30-d1*.06);
  g.strokeStyle=rgba(i%3?'#ffffff':FTC.b,.42*A);g.lineWidth=(2.6-i%2)*s;g.beginPath();g.moveTo(i===4?h0.x:q0.x,i===4?h0.y:q0.y);g.lineTo(q1.x,q1.y);g.stroke()}
 g.restore();
 // bouffées qui coulent vers l'avant et grossissent (source-over, jamais opaques)
 for(let i=0;i<n;i++){const ph=((i*.37)+e*1.5)%1,m=ph*fr,b=f.a+(((i*.618)%1)*2-1)*arc*.85*Math.min(1,.4+m),d=f.r*m,q=P(x0+Math.cos(b)*d,y0+Math.sin(b)*d,24+m*20),r=(7+m*24)*q.s;
  fxSoftS(q.x,q.y,r*1.2,i%3?'#ffffff':FTC.a,.32*k*Math.min(1,ph*4))}
 const tip=P(x0+Math.cos(f.a)*f.r*.85*fr,y0+Math.sin(f.a)*f.r*.85*fr,30);fxSoftS(tip.x,tip.y,f.r*.32*tip.s*(.6+e*.6),'#ffffff',.3*k*fr);
 fxGlowS(h0.x,h0.y,14*s,FTC.b,.7*A);fxGlowS(h0.x,h0.y,5*s,'#ffffff',.5*A)};
// traînée de la charge : vapeur qui s'échappe derrière le lanceur
JFXD.ft_trail=(f,k,e,t,u)=>{if(!u||u.dead)return;const n=gkN(7,f);for(let i=0;i<n;i++){const q=P(u.x-Math.cos(u.aim)*(14+i*14),u.y-Math.sin(u.aim)*(14+i*14),20+i*4);fxSoftS(q.x,q.y,(12+i*5)*q.s,i%2?'#ffffff':FTC.a,.4*k*(1-i/(n+1)))}};
// chaudron (télégraphe, jamais atténué) : le sol bouillonne, l'anneau se resserre, des jets de vapeur montent de plus en plus haut
JFXD.ft_build=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s;fxSoftS(q.x,q.y,f.r*s,FTC.b,.12+.22*e,f.r*s*K);g.save();g.strokeStyle=rgba(FTC.a,.85);g.lineWidth=2+e*3;gEll(f.x,f.y,f.r*(1-e*.75));g.stroke();
 g.strokeStyle=rgba('#ffffff',.7*e);g.lineWidth=1.2;for(let i=0;i<12;i++){const b=i*.52,d=f.r*((i*.43)%1),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,Math.abs(Math.sin(t*9+i))*8*e);g.beginPath();g.arc(p.x,p.y,(3+e*4)*p.s,0,7);g.stroke()}g.restore();
 const n=Math.round(3+5*e);for(let i=0;i<n;i++){const b=i*2.4,d=f.r*.85*((i*.37)%1),ph=(t*1.8+i*.23)%1,p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,ph*(30+90*e));fxSoftS(p.x,p.y,(6+ph*10)*p.s,'#ffffff',.35*(1-ph)*e)}
 fxGlowS(q.x,q.y,f.r*s*.5*(.5+e),FTC.b,.3*e,f.r*s*.5*(.5+e)*K,0)};
// geyser : colonne brûlante (lumière additive) et grandes bouffées de vapeur douces (≤ 0,3) qui montent
JFXD.ft_geyser=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,up=Math.sin(Math.PI*Math.min(1,e*1.5)),h=up*230*s,w=f.r*.38*s;
 if(h>2){const o=g.globalCompositeOperation,ga=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=ga*.18*k;g.drawImage(fxSpr(FTC.b,0),q.x-w,q.y-h,w*2,h*2);g.globalAlpha=ga*.16*k;g.drawImage(fxSpr('#ffffff',0),q.x-w*.4,q.y-h*.9,w*.8,h*1.8);g.globalAlpha=ga;g.globalCompositeOperation=o}
 const n=gkN(18,f);for(let i=0;i<n;i++){const b=i*.35,d=f.r*.6*((i*.29)%1),m=Math.min(1,e*1.3),z=m*(150+(i%4)*30),p=P(f.x+Math.cos(b)*d*(1+m),f.y+Math.sin(b)*d*(1+m),z),r=(14+m*26)*p.s;fxSoftS(p.x,p.y,r*1.2,i%3?'#ffffff':FTC.a,.18*k)}}; // vapeur légère : la cible projetée reste visible

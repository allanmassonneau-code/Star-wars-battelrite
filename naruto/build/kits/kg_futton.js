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
KGBAL[1]=[0.92,0.915];
const FTC=GK.ft_steam,FT_MAX=3,ftCor=(u,e,n)=>gkStack(u,e,'ft_cor',n,FT_MAX,4);
// brume acide : 3 dégâts / 0,5 s, ralentit, 1 corrosion par seconde (un tick sur deux)
const ftMist=(u,x,y,r,t)=>gkPool(u,x,y,{r,t,kind:'ft',vfx:'ft_steam',d:3,sl:1,fn:(e,q)=>{q.n2=(q.n2||0)+1;if(q.n2%2)ftCor(u,e,1)}});
Object.assign(NAT,{
 // ---------- Jet de vapeur (D) ----------
 ft_jet:SP('Futton : Jet de vapeur',FT_D.jet,5,{ai:RG(170,.8),line:{len:170,w:110}},(u,a)=>{gkS('water',u);gkS('wind',u);anim(u,'gk_push',.4);jx({jfx:'ft_cone',ui:gkI(u),x:u.x,y:u.y,a,r:170,t:.5,m:.5});
  for(const e of enemies(u))if(dist(u,e)<170+e.r&&angDiff(ang(u,e),a)<.5&&gkHit(e,u,14,{kb:220,unblockable:1},'ft_steam'))ftCor(u,e,1)}),
 // ---------- Kômu (C) : brume acide ----------
 ft_mist:SP('Futton : Kômu',FT_D.mist,8,{ai:RG(420,.6),tele:{r:110,max:420}},(u,a,td)=>{const c=atP(u,a,td,420);gkS('water',u);gkS('wind',u);anim(u,'breath',.55);
  jx({jfx:'ft_cone',ui:gkI(u),x:u.x,y:u.y,a,r:120,t:.45,m:.45});jx({jfx:'gk_boom',x:c.x,y:c.y,r:110,v:'ft_steam',s:'steam',t:.6,m:.6});ftMist(u,c.x,c.y,110,4)}),
 // ---------- Armure de vapeur (B) ----------
 ft_armor:SP('Futton : Armure de vapeur',FT_D.armor,10,{ai:SELF(160,.6)},(u)=>{gkS('water',u);gkS('boom',u);anim(u,'gk_charge',.45);u.ft_ar=4;u.drT=Math.max(u.drT||0,4);u.dr=Math.max(u.drT>4.01?u.dr||0:0,.25);u.haste=Math.max(u.haste||0,4);
  gkAoe(u,u.x,u.y,95,10,{kb:260},'ft_steam',e=>ftCor(u,e,1));jx({jfx:'gk_boom',x:u.x,y:u.y,r:100,v:'ft_steam',s:'steam',t:.6,m:.6});say(u,'ARMURE DE VAPEUR',FTC.a)}),
 // ---------- Kôkô (A) : charge propulsée ----------
 ft_charge:SP('Futton : Kôkô',FT_D.charge,13,{ai:{mode:'gap',min:80,max:330,p:.7},line:{len:320,w:50}},(u,a,td)=>{gkS('boom',u);gkS('dash',u);anim(u,'lunge',.45);let done=0;
  jx({jfx:'ft_trail',ui:gkI(u),x:u.x,y:u.y,t:.45,m:.45});
  const chk=()=>{if(done||u.dead)return;for(const e of enemies(u))if(dist(u,e)<u.r+e.r+14){done=1;u.dash=null;gkHit(e,u,34,{kb:520,stun:.2,unblockable:1},'ft_steam');ftCor(u,e,2);
    gkAoe(u,u.x,u.y,80,10,{},'ft_steam');jx({jfx:'gk_boom',x:e.x,y:e.y,r:90,v:'ft_steam',s:'steam',t:.6,m:.6});if(near(u.x,u.y)){gkS('heavy',u);shake=Math.max(shake,.3)}return}};
  dash(u,a,320,.32,{end:chk});aux.push({type:'gk_chk',x:u.x,y:u.y,r:0,t:.36,m:.36,team:u.team,owner:u,f:chk})}),
 // ---------- Grand chaudron (S) ----------
 ft_caul:ULT('Futton : Grand chaudron',FT_D.caul,{ai:RG(360,.8),tele:{r:170,max:360}},(u,a,td)=>{const c=atP(u,a,td,360),R=170,D=1;gkS('water',u);gkS('heavy',u);anim(u,'gk_call',.9);
  jx({jfx:'ft_build',x:c.x,y:c.y,r:R,t:D,m:D});
  later(u,D,()=>{gkAoe(u,c.x,c.y,R,50,{air:.8},'ft_steam',e=>ftCor(u,e,2));ftMist(u,c.x,c.y,R,3);jx({jfx:'ft_geyser',x:c.x,y:c.y,r:R,t:1.2,m:1.2});jx({jfx:'gk_boom',x:c.x,y:c.y,r:R*1.1,v:'ft_steam',s:'steam',t:.8,m:.8});
   if(near(c.x,c.y)){gkS('boom',u);gkS('water',u);shake=Math.max(shake,.4)}},{x:c.x,y:c.y,r:R})}),
 // ---------- dash : Propulsion de vapeur ----------
 ft_dash:SP('Propulsion de vapeur',FT_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y;gkS('water',u);gkS('dash',u);anim(u,'lunge',.3);
  gkPool(u,x0,y0,{r:70,t:1.5,kind:'ft',vfx:'ft_steam',sl:1,fn:(e,q)=>{q.hs=q.hs||new Set();if(!q.hs.has(e)){q.hs.add(e);ftCor(u,e,1)}}});jx({jfx:'gk_boom',x:x0,y:y0,r:70,v:'ft_steam',s:'steam',t:.5,m:.5});dash(u,a,clamp(td||230,120,230),.22,{})}),
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
 draw(u,p,S,sk){if(!(u.ft_ar>0))return;const t=performance.now()/1000,a=Math.min(1,u.ft_ar*2);g.save();for(let i=0;i<9;i++){const ph=(t*.8+i/9)%1,b=i*.7,x=p.x+Math.cos(b+t)*16*S*sk,y=p.y-(10+ph*60)*S*sk;g.fillStyle=rgba(i%2?FTC.a:'#ffffff',.4*a*(1-ph));g.beginPath();g.arc(x,y,(6+ph*10)*S,0,7);g.fill()}g.restore()},
 prev(u,p,S,front){if(!front)return;const t=performance.now()/1000;g.save();for(let i=0;i<4;i++){const ph=(t*.5+i/4)%1;g.fillStyle=rgba('#ffffff',.25*(1-ph));g.beginPath();g.arc(p.x+(i-1.5)*8*S,p.y-(20+ph*40)*S,(4+ph*6)*S,0,7);g.fill()}g.restore()},
 hud(u,x,y){gkHud(u,x,y,'Corrosion','ft_cor',FT_MAX,'#c8e070',FTC.a,u.ft_ar>0?'· ARMURE':'')}};
AFTER.push(()=>UK.push('ft_cor','ft_ar'));
// ---- visuels
// brume acide : nappes laiteuses teintées de vert, bulles qui crèvent
GKPOOL.ft=(x,k,t)=>{const R=x.r;g.save();g.fillStyle=rgba('#d8e8b0',.16*k);gEll(x.x,x.y,R);g.fill();
 for(let i=0;i<(x.strip?2:9);i++){const b=i*2.4+t*.25*(i%2?1:-1),d=R*(.15+((i*.31)%1)*.7),z=8+((t*12+i*9)%26),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,z),r=(16+(i%3)*7)*p.s*(x.r/90);
  g.fillStyle=rgba(i%3?'#f4f0e4':'#d6e6a8',.28*k);g.beginPath();g.arc(p.x,p.y,r,0,7);g.fill()}
 g.strokeStyle=rgba('#b8d070',.45*k);g.lineWidth=1.5;g.setLineDash([6,6]);g.lineDashOffset=-t*12;gEll(x.x,x.y,R);g.stroke();g.setLineDash([]);g.restore()};
// jet de vapeur : cône de bouffées blanches
JFXD.ft_cone=(f,k,e,t,u)=>{const x0=u&&!u.dead?u.x:f.x,y0=u&&!u.dead?u.y:f.y;g.save();for(let i=0;i<16;i++){const m=Math.min(1,e*1.6)*(.3+((i*.37)%1)*.7),b=f.a+((i%5)-2)*.18,d=f.r*m,q=P(x0+Math.cos(b)*d,y0+Math.sin(b)*d,30+m*16),r=(8+m*22)*q.s;
  g.fillStyle=rgba(i%3?'#ffffff':FTC.a,.55*k);g.beginPath();g.arc(q.x,q.y,r,0,7);g.fill()}g.restore()};
// traînée de la charge
JFXD.ft_trail=(f,k,e,t,u)=>{if(!u||u.dead)return;g.save();for(let i=0;i<6;i++){const q=P(u.x-Math.cos(u.aim)*(14+i*14),u.y-Math.sin(u.aim)*(14+i*14),20+i*4);g.fillStyle=rgba(i%2?'#ffffff':FTC.a,.5*k*(1-i/7));g.beginPath();g.arc(q.x,q.y,(10+i*4)*q.s,0,7);g.fill()}g.restore()};
// chaudron : la pression monte (anneau qui se resserre, sol qui bouillonne)
JFXD.ft_build=(f,k,e,t)=>{g.save();g.fillStyle=rgba(FTC.b,.1+.25*e);gEll(f.x,f.y,f.r);g.fill();g.strokeStyle=rgba(FTC.a,.8);g.lineWidth=2+e*3;gEll(f.x,f.y,f.r*(1-e*.75));g.stroke();
 for(let i=0;i<12;i++){const b=i*.52,d=f.r*((i*.43)%1),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,Math.abs(Math.sin(t*9+i))*8*e);g.strokeStyle=rgba('#ffffff',.6*e);g.lineWidth=1.2;g.beginPath();g.arc(p.x,p.y,(3+e*4)*p.s,0,7);g.stroke()}g.restore()};
// geyser de vapeur
JFXD.ft_geyser=(f,k,e,t)=>{g.save();for(let i=0;i<18;i++){const b=i*.35,d=f.r*.6*((i*.29)%1),m=Math.min(1,e*1.3),z=m*(150+(i%4)*30),p=P(f.x+Math.cos(b)*d*(1+m),f.y+Math.sin(b)*d*(1+m),z),r=(14+m*26)*p.s;g.fillStyle=rgba(i%3?'#ffffff':FTC.a,.5*k);g.beginPath();g.arc(p.x,p.y,r,0,7);g.fill()}g.restore()};

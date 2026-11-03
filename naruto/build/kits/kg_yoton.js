// ===== Kekkei genkai g0 : Yôton, la lave (préfixe yo_) — Katon + Doton (Rôshi, Mei Terumî) =====
// Identité : le contrôle du terrain. Chaque jutsu laisse des FLAQUES DE LAVE qui brûlent et ralentissent les ennemis, et où le lanceur file plus vite (trait).
// Roches en fusion, jet de lave en cloche, armure de magma, éruption sous les pieds, pluie de magma ; dash : coulée qui laisse une traînée brûlante.
gkPal('yo_lava','#ffd27a','#ff6a1a','#8a1e08','#3a0c04');ELM.yo_lava=0; // la lave brûle : élément feu (Suiton la refroidit)
defKG(0,{n:'Yôton',col:'#ff5a1a',tag:'Yô',el:'Katon + Doton',nat:0,d:'La lave : flaques brûlantes, bombes de magma, armure de lave',
 ico:f=>{g.beginPath();g.moveTo(-10,8);g.quadraticCurveTo(-11,-2,-4,-4);g.quadraticCurveTo(-1,-12,5,-8);g.quadraticCurveTo(12,-6,10,4);g.quadraticCurveTo(10,10,2,10);g.closePath();g.fill();
  g.globalCompositeOperation='destination-out';for(const [x,y,r] of[[-3,2,2.4],[4,-2,1.8],[3,5,1.4]]){g.beginPath();g.arc(x,y,r,0,7);g.fill()}g.globalCompositeOperation='source-over'}});
const YO_D={
 rocks:'3 roches en fusion lancées en éventail retombent autour du point visé : 7 dégâts chacune et brûlure (6 dégâts en 3 s) ; celle du milieu laisse une petite flaque de lave (2 s)',
 jet:'Jet de lave en cloche (420 max) : à l\'impact, 20 dégâts, brûlure (6 dégâts en 3 s) et une flaque de lave (3 s) qui brûle et ralentit',
 armor:'Armure de magma 4 s : −30 % de dégâts subis ; un ennemi qui te frappe au corps à corps prend 6 dégâts et brûle ; tes coups de base brûlent (4 dégâts en 2 s)',
 kazan:'Le sol se fend sous le point visé (alerte 0,7 s) puis entre en éruption : 34 dégâts, projeté 0,6 s, et une grande flaque de lave (3,5 s)',
 rain:'Pluie de magma 2,4 s : 7 bombes de lave s\'abattent autour du point visé (alerte au sol) : 13 dégâts chacune, brûlure, et une flaque à chaque impact',
 dash:'Tu files sur une coulée de lave (220) ; la traînée (2,5 s) brûle les ennemis (3 dégâts toutes les 0,5 s) et te rend plus rapide'};
KIT('g0',[
 ['D','x.yo_rocks','Yôton : Kakugan',YO_D.rocks,'yo_lava'],
 ['C','x.yo_jet','Yôton : Yôkai',YO_D.jet,'yo_lava'],
 ['B','x.yo_armor','Yôton : Armure de magma',YO_D.armor,'yo_lava'],
 ['A','x.yo_kazan','Yôton : Kazan',YO_D.kazan,'yo_lava'],
 ['S','x.yo_rain','Yôton : Pluie de magma',YO_D.rain,'yo_lava'],
]);
DASHG[0]={src:'x.yo_dash',n:'Coulée de lave',d:YO_D.dash,vfx:'yo_lava',cd:7};
KGBAL[0]=[0.889,0.879];
const YOC=GK.yo_lava,YO_BURN=()=>BURN(2,3);
// flaque de lave : 3 dégâts toutes les 0,5 s (brûlure), ralentit ; le lanceur y est plus rapide (trait)
const yoPool=(u,x,y,r,t)=>gkPool(u,x,y,{r,t,kind:'yo',vfx:'yo_lava',d:3,o:{dot:BURN(2,2)},sl:1,self:o=>{o.haste=Math.max(o.haste||0,.15)}});
// bombe de lave en cloche : visuel jx 'yo_lob' (u → point), impact différé avec alerte au sol
function yoLob(u,x,y,del,R,f,sx,sy){jx({jfx:'yo_lob',x:sx??u.x,y:sy??u.y,x2:x,y2:y,t:del,m:del});later(u,del,()=>{f();jx({jfx:'gk_boom',x,y,r:R,v:'yo_lava',s:'lava',t:.55,m:.55});if(near(x,y)){gkS('fire',u);gkS('rock',u);sparks(x,y,YOC.b,12,'yo_lava')}},{x,y,r:R})}
Object.assign(NAT,{
 // ---------- Kakugan (D) : 3 roches en fusion en éventail ----------
 yo_rocks:SP('Yôton : Kakugan',YO_D.rocks,5,{ai:RG(420,.7),tele:{r:90,max:420}},(u,a,td)=>{const c=atP(u,a,td,420);gkS('rock',u);gkS('fire',u);anim(u,'throw2',.45);
  for(let i=-1;i<=1;i++){const b=a+Math.PI/2,o=i*62,x=c.x+Math.cos(b)*o+Math.cos(a)*(i?-14:12),y=c.y+Math.sin(b)*o+Math.sin(a)*(i?-14:12),del=.5+Math.abs(i)*.06;
   yoLob(u,x,y,del,40,()=>{gkAoe(u,x,y,40,7,{dot:YO_BURN()},'yo_lava');if(!i)yoPool(u,x,y,45,2)})}}),
 // ---------- Yôkai (C) : jet de lave en cloche, flaque ----------
 yo_jet:SP('Yôton : Yôkai',YO_D.jet,8,{ai:RG(420,.7),tele:{r:85,max:420}},(u,a,td)=>{const c=atP(u,a,td,420),D=.55+Math.hypot(c.x-u.x,c.y-u.y)/1400;gkS('water',u);gkS('fire',u);anim(u,'breath',.55);
  jx({jfx:'yo_spew',ui:gkI(u),x:u.x,y:u.y,a,t:.45,m:.45});yoLob(u,c.x,c.y,D,85,()=>{gkAoe(u,c.x,c.y,85,20,{dot:YO_BURN()},'yo_lava');yoPool(u,c.x,c.y,80,3)})}),
 // ---------- Armure de magma (B) ----------
 yo_armor:SP('Yôton : Armure de magma',YO_D.armor,10,{ai:DEF},(u)=>{gkS('fire',u);gkS('heavy',u);anim(u,'gk_charge',.5);u.drT=Math.max(u.drT||0,4);u.dr=Math.max(u.drT>4.01?u.dr||0:0,.3);u.yo_ar=4;
  jx({jfx:'gk_boom',x:u.x,y:u.y,r:70,v:'yo_lava',s:'lava',t:.5,m:.5});say(u,'ARMURE DE MAGMA',YOC.a)}),
 // ---------- Kazan (A) : éruption sous le point visé ----------
 yo_kazan:SP('Yôton : Kazan',YO_D.kazan,13,{ai:RG(400,.65),tele:{r:100,max:400}},(u,a,td)=>{const c=atP(u,a,td,400),D=.7;gkS('rock',u);anim(u,'stomp',.6);if(near(u.x,u.y))shake=Math.max(shake,.12);
  jx({jfx:'yo_crack',x:c.x,y:c.y,r:100,t:D,m:D});
  later(u,D,()=>{gkAoe(u,c.x,c.y,100,34,{air:.6,dot:YO_BURN()},'yo_lava');yoPool(u,c.x,c.y,95,3.5);jx({jfx:'yo_erupt',x:c.x,y:c.y,r:100,t:1.1,m:1.1});jx({jfx:'gk_boom',x:c.x,y:c.y,r:120,v:'yo_lava',s:'lava',t:.6,m:.6});
   if(near(c.x,c.y)){gkS('boom',u);gkS('fire',u);shake=Math.max(shake,.35);sparks(c.x,c.y,YOC.a,22,'yo_lava')}},{x:c.x,y:c.y,r:100})}),
 // ---------- Pluie de magma (S) : 7 bombes sur 2,4 s ----------
 yo_rain:ULT('Yôton : Pluie de magma',YO_D.rain,{ai:RG(420,.8),tele:{r:170,max:420}},(u,a,td)=>{const c=atP(u,a,td,420),R=170;gkS('fire',u);gkS('roar',u);anim(u,'gk_call',.9);
  jx({jfx:'yo_sky',x:c.x,y:c.y,r:R,t:2.8,m:2.8});
  for(let i=0;i<7;i++){const b=i*2.39+rnd()*.6,d=i===0?0:R*(.3+rnd()*.62),x=c.x+Math.cos(b)*d,y=c.y+Math.sin(b)*d,del=.55+i*.31;
   yoLob(u,x,y,del,58,()=>{gkAoe(u,x,y,58,13,{dot:YO_BURN()},'yo_lava');yoPool(u,x,y,52,2.5)},x,y)}}),
 // ---------- dash : Coulée de lave ----------
 yo_dash:SP('Coulée de lave',YO_D.dash,7,{ai:ESC},(u,a,td)=>{const d=clamp(td||220,120,220),x0=u.x,y0=u.y;gkS('fire',u);gkS('dash',u);anim(u,'lunge',.3);
  const ex=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r),ey=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);
  gkStrip(u,x0,y0,ex,ey,{w:48,t:2.5,kind:'yo',vfx:'yo_lava',d:3,o:{dot:BURN(2,2)},self:o=>{o.haste=Math.max(o.haste||0,.15)}});dash(u,a,d,.24,{})}),
});
Object.assign(NATHERO,{yo:'kylo'});
// ---- trait : Magma
KGTRAITS[0]={nom:'Magma',desc:'Ta lave brûle : tes flaques ralentissent et brûlent les ennemis, et tu y files plus vite. Un ennemi qui te frappe au corps à corps se brûle (4 dégâts en 2 s ; 6 dégâts de plus sous l\'Armure de magma)',
 init(u){u.yo_ar=0},
 update(u,dt){if(u.yo_cds!==u.cds){u.yo_cds=u.cds;u.yo_ar=0}if(u.yo_ar>0)u.yo_ar=Math.max(0,u.yo_ar-dt)},
 deal(src,t,dmg,o){return dmg},
 landed(src,t,dmg,o){if(src.yo_ar>0&&o.basic&&dmg>0&&!t.dead){t.dot=Math.max(t.dot||0,2);t.dotT=Math.max(t.dotT||0,2);t.dotSrc=src;t.dotEl=0}},
 take(t,src,dmg,o){if(src&&src!==t&&o.melee&&!o.thorn&&dmg>0&&!src.dead){src.dot=Math.max(src.dot||0,2);src.dotT=Math.max(src.dotT||0,2);src.dotSrc=t;src.dotEl=0;
   if(t.yo_ar>0){const V=VFX;VFX='yo_lava';hit(src,t,6,{silent:1,thorn:1});VFX=V;if(near(t.x,t.y))sparks(t.x,t.y,YOC.b,6,'yo_lava')}}return dmg},
 draw(u,p,S,sk){if(!(u.yo_ar>0))return;const t=performance.now()/1000,a=Math.min(1,u.yo_ar*2);g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(YOC.b,.18*a);g.beginPath();g.ellipse(p.x,p.y-30*S*sk,24*S*sk,38*S*sk,0,0,7);g.fill();
  for(let i=0;i<7;i++){const b=i*.9+t*2,x=p.x+Math.cos(b)*15*S*sk,y=p.y-(6+((t*24+i*9)%50))*S*sk;g.fillStyle=rgba(i%2?YOC.a:YOC.b,.7*a);g.beginPath();g.arc(x,y,(2+(i%3))*S,0,7);g.fill()}
  g.strokeStyle=rgba(YOC.c,.8*a);g.lineWidth=2*S;for(let i=0;i<3;i++){const x=p.x+(i-1)*9*S;g.beginPath();g.moveTo(x,p.y-12*S);g.lineTo(x+3*S,p.y-26*S);g.lineTo(x-2*S,p.y-40*S);g.stroke()}g.restore()},
 prev(u,p,S,front){if(front)return;g.save();g.fillStyle=rgba(YOC.b,.25);g.beginPath();g.ellipse(p.x,p.y,26*S,8*S,0,0,7);g.fill();g.restore()},
 hud(u,x,y){gkHud(u,x,y,'Magma'+(u.yo_ar>0?' · ARMURE '+u.yo_ar.toFixed(1).replace('.',',')+' s':''),null,0,YOC.a,YOC.a)}};
AFTER.push(()=>UK.push('yo_ar'));
// ---- visuels
PROJD.yo_rock=gkLumpD('yo_lava',{glow:1});
// flaque de lave : croûte sombre, veines incandescentes, bulles qui crèvent
GKPOOL.yo=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,R=x.r;g.save();
 const gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R*s);gr.addColorStop(0,rgba(YOC.a,.75*k));gr.addColorStop(.45,rgba(YOC.b,.65*k));gr.addColorStop(1,rgba(YOC.c,.25*k));g.fillStyle=gr;g.beginPath();g.ellipse(q.x,q.y,R*s,R*s*K,0,0,7);g.fill();
 g.strokeStyle=rgba(YOC.d,.65*k);g.lineWidth=1.6*s;for(let i=0;i<5;i++){const b=i*1.26+(x.i||0),p1=P(x.x+Math.cos(b)*R*.25,x.y+Math.sin(b)*R*.25,0),p2=P(x.x+Math.cos(b+.4)*R*.75,x.y+Math.sin(b+.4)*R*.75,0);g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.stroke()}
 g.globalCompositeOperation='lighter';for(let i=0;i<(x.strip?2:5);i++){const ph=(t*.9+i*.37)%1,b=i*2.1+(x.i||0)*1.3,d=R*.55*((i*.37)%1),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,ph*10),r=(2+ph*5)*s;g.strokeStyle=rgba(YOC.a,.8*k*(1-ph));g.lineWidth=1.4;g.beginPath();g.arc(p.x,p.y,r,0,7);g.stroke()}
 g.fillStyle=rgba('#ffffff',.35*k);g.beginPath();g.ellipse(q.x,q.y,R*.3*s,R*.3*s*K,0,0,7);g.fill();g.restore()};
// bombe de lave en cloche (u → point)
JFXD.yo_lob=(f,k,e,t)=>{const m=Math.min(1,e*1.05),fall=f.x===f.x2&&f.y===f.y2,x=lerp(f.x,f.x2,m),y=lerp(f.y,f.y2,m),h=fall?320*(1-m*m):Math.sin(Math.PI*m)*130+24*(1-m),q=P(x,y,h),s=q.s;if(m>=1)return;g.save();
 g.globalCompositeOperation='lighter';for(let i=1;i<6;i++){const m2=Math.max(0,m-i*.035),q2=P(lerp(f.x,f.x2,m2),lerp(f.y,f.y2,m2),fall?320*(1-m2*m2):Math.sin(Math.PI*m2)*130+24*(1-m2));g.fillStyle=rgba(YOC.b,.35*(1-i/6));g.beginPath();g.arc(q2.x,q2.y,(9-i)*s,0,7);g.fill()}
 g.globalCompositeOperation='source-over';g.translate(q.x,q.y);PROJD.yo_rock({},11*s,0,t*1000);g.restore()};
// jet de lave craché par le lanceur
JFXD.yo_spew=(f,k,e,t,u)=>{if(!u||u.dead)return;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const d=(10+e*70+i*6),b=f.a+(i%3-1)*.12,q=P(u.x+Math.cos(b)*d,u.y+Math.sin(b)*d,46+e*30-i*2);g.fillStyle=rgba(i%2?YOC.a:YOC.b,.75*k);g.beginPath();g.arc(q.x,q.y,(6-i*.35)*q.s,0,7);g.fill()}g.restore()};
// sol qui se fend (Kazan) : fissures rougeoyantes qui s'élargissent
JFXD.yo_crack=(f,k,e,t)=>{const R=f.r;g.save();g.strokeStyle=rgba(YOC.b,.5+.5*e);g.lineWidth=1+e*3;g.lineCap='round';for(let i=0;i<7;i++){const b=i*.9+f.x*.01;let px=f.x,py=f.y;g.beginPath();const p0=P(px,py,0);g.moveTo(p0.x,p0.y);
  for(let j=1;j<=4;j++){const d=R*e*j/4;px=f.x+Math.cos(b+Math.sin(j*3+i)*.35)*d;py=f.y+Math.sin(b+Math.sin(j*3+i)*.35)*d;const q=P(px,py,0);g.lineTo(q.x,q.y)}g.stroke()}
 g.globalCompositeOperation='lighter';g.fillStyle=rgba(YOC.a,.25*e);gEll(f.x,f.y,R*e*.5);g.fill();g.restore()};
// éruption : colonne de lave qui jaillit et retombe en gerbes
JFXD.yo_erupt=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,h=Math.sin(Math.PI*Math.min(1,e*1.6))*170,w=f.r*.45*s;if(h<2&&e>.5)return;g.save();
 const gr=g.createLinearGradient(0,q.y-h*s,0,q.y);gr.addColorStop(0,rgba(YOC.a,.9*k));gr.addColorStop(.5,rgba(YOC.b,.9*k));gr.addColorStop(1,rgba(YOC.c,.8*k));g.fillStyle=gr;
 g.beginPath();g.moveTo(q.x-w,q.y);g.quadraticCurveTo(q.x-w*.4,q.y-h*s*.6,q.x-w*.25,q.y-h*s);g.quadraticCurveTo(q.x,q.y-h*s*1.12,q.x+w*.25,q.y-h*s);g.quadraticCurveTo(q.x+w*.4,q.y-h*s*.6,q.x+w,q.y);g.closePath();g.fill();
 g.globalCompositeOperation='lighter';for(let i=0;i<16;i++){const b=i*.39,m=Math.min(1,e*1.4),d=f.r*1.1*m,hh=Math.sin(Math.PI*m)*(110+(i%4)*25),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,hh);g.fillStyle=rgba(i%2?YOC.a:YOC.b,.85*k);g.beginPath();g.arc(p.x,p.y,(3+(i%3))*s,0,7);g.fill()}g.restore()};
// ciel de la pluie de magma : ombre rougeoyante au sol, braises qui tombent
JFXD.yo_sky=(f,k,e,t)=>{g.save();g.fillStyle=rgba(YOC.c,.18*Math.min(1,k*3));gEll(f.x,f.y,f.r);g.fill();g.strokeStyle=rgba(YOC.b,.55*Math.min(1,k*3));g.lineWidth=2;g.setLineDash([8,6]);g.lineDashOffset=-t*30;gEll(f.x,f.y,f.r);g.stroke();g.setLineDash([]);
 g.globalCompositeOperation='lighter';for(let i=0;i<14;i++){const b=i*2.4,d=f.r*((i*.29)%1),z=200-((t*160+i*37)%200),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,z);g.fillStyle=rgba(YOC.a,.6*k);g.fillRect(p.x-1.5,p.y-4,3,8)}g.restore()};

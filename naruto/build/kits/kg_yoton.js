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
const YOC=GK.yo_lava,YO_BURN=()=>BURN(2,3);GKPOOLC.yo='#ffb03a';FXTELE.add('yo_crack');
// flaque de lave : 3 dégâts toutes les 0,5 s (brûlure), ralentit ; le lanceur y est plus rapide (trait)
const yoPool=(u,x,y,r,t)=>gkPool(u,x,y,{r,t,kind:'yo',vfx:'yo_lava',d:3,o:{dot:BURN(2,2)},sl:1,self:o=>{o.haste=Math.max(o.haste||0,.15)}});
// bombe de lave en cloche : visuel jx 'yo_lob' (u → point), impact différé avec alerte au sol
// impact : boule de lave (gk_boom au rayon réel), éclat local, gerbe de magma qui retombe, brûlure au sol
function yoLob(u,x,y,del,R,f,sx,sy){jx({jfx:'yo_lob',x:sx??u.x,y:sy??u.y,x2:x,y2:y,r:R,t:del,m:del});later(u,del,()=>{f();jx({jfx:'gk_boom',x,y,r:R,v:'yo_lava',s:'lava',t:.55,m:.55});
 gkImp(u,x,y,'yo_lava',R,{ring:0});fxDebris(x,y,{u,n:R>70?8:4,sp:120+R,col:YOC.b,c2:YOC.c,s:R>70?4.5:3.2,t:1});if(near(x,y)){gkS('fire',u);gkS('rock',u)}},{x,y,r:R})}
Object.assign(NAT,{
 // ---------- Kakugan (D) : 3 roches en fusion en éventail ----------
 yo_rocks:SP('Yôton : Kakugan',YO_D.rocks,5,{ai:RG(420,.7),tele:{r:90,max:420}},(u,a,td)=>{const c=atP(u,a,td,420);gkS('rock',u);gkS('fire',u);anim(u,'gk_lob',.5);fxCast(u,'yo_lava',.3);
  for(let i=-1;i<=1;i++){const b=a+Math.PI/2,o=i*62,x=c.x+Math.cos(b)*o+Math.cos(a)*(i?-14:12),y=c.y+Math.sin(b)*o+Math.sin(a)*(i?-14:12),del=.5+Math.abs(i)*.06;
   yoLob(u,x,y,del,40,()=>{gkAoe(u,x,y,40,7,{dot:YO_BURN()},'yo_lava');if(!i)yoPool(u,x,y,45,2)})}}),
 // ---------- Yôkai (C) : jet de lave en cloche, flaque ----------
 yo_jet:SP('Yôton : Yôkai',YO_D.jet,8,{ai:RG(420,.7),tele:{r:85,max:420}},(u,a,td)=>{const c=atP(u,a,td,420),D=.55+Math.hypot(c.x-u.x,c.y-u.y)/1400;gkS('water',u);gkS('fire',u);anim(u,'breath',.55);fxCast(u,'yo_lava',.25,{mouth:1,n:8});
  jx({jfx:'yo_spew',ui:gkI(u),x:u.x,y:u.y,a,t:.45,m:.45});yoLob(u,c.x,c.y,D,85,()=>{gkAoe(u,c.x,c.y,85,20,{dot:YO_BURN()},'yo_lava');yoPool(u,c.x,c.y,80,3)})}),
 // ---------- Armure de magma (B) ----------
 yo_armor:SP('Yôton : Armure de magma',YO_D.armor,10,{ai:DEF},(u)=>{gkS('fire',u);gkS('heavy',u);anim(u,'gk_charge',.5);u.drT=Math.max(u.drT||0,4);u.dr=Math.max(u.drT>4.01?u.dr||0:0,.3);u.yo_ar=4;
  jx({jfx:'gk_boom',x:u.x,y:u.y,r:70,v:'yo_lava',s:'lava',t:.5,m:.5});fxBurst(u.x,u.y,YOC.b,{u,z:20,n:14,sp:160,up:220,gr:380,c2:YOC.a,w:2.4,len:.08,t:.7});
  fxPillar(u.x,u.y,YOC.b,{u,h:120,w:22,t:.5,al:.4});fxDecal(u.x,u.y,'scorch',{u,r:46,t:3});say(u,'ARMURE DE MAGMA',YOC.a)}),
 // ---------- Kazan (A) : éruption sous le point visé ----------
 yo_kazan:SP('Yôton : Kazan',YO_D.kazan,13,{ai:RG(400,.65),tele:{r:100,max:400}},(u,a,td)=>{const c=atP(u,a,td,400),D=.7;gkS('rock',u);anim(u,'gk_slam',.7);fxRing(u.x,u.y,{u,r0:10,r1:46,col:YOC.b,t:.3,w:4});fxDebris(u.x,u.y,{u,n:4,sp:90,col:YOC.c,c2:YOC.d,s:3});
  jx({jfx:'yo_crack',x:c.x,y:c.y,r:100,t:D,m:D});
  later(u,D,()=>{gkAoe(u,c.x,c.y,100,34,{air:.6,dot:YO_BURN()},'yo_lava');yoPool(u,c.x,c.y,95,3.5);jx({jfx:'yo_erupt',x:c.x,y:c.y,r:100,t:1.1,m:1.1});jx({jfx:'gk_boom',x:c.x,y:c.y,r:100,v:'yo_lava',s:'lava',t:.6,m:.6});
   gkImp(u,c.x,c.y,'yo_lava',100,{ring:0});fxDebris(c.x,c.y,{u,n:10,sp:230,col:YOC.b,c2:YOC.c,s:5,t:1.3});fxSmoke(c.x,c.y,{u,col:'#3a2a24',n:6,r:50,s:22,t:1.6,al:.26,rise:120});
   for(const e of enemies(u))if(gkIn(e,c.x,c.y,100))fxHitStop(u,e,34);if(near(c.x,c.y)){gkS('boom',u);gkS('fire',u)}},{x:c.x,y:c.y,r:100})}),
 // ---------- Pluie de magma (S) : 7 bombes sur 2,4 s ----------
 yo_rain:ULT('Yôton : Pluie de magma',YO_D.rain,{ai:RG(420,.8),tele:{r:170,max:420}},(u,a,td)=>{const c=atP(u,a,td,420),R=170;gkS('fire',u);gkS('roar',u);anim(u,'gk_call',.9);
  jx({jfx:'yo_sky',x:c.x,y:c.y,r:R,t:2.8,m:2.8});
  for(let i=0;i<7;i++){const b=i*2.39+rnd()*.6,d=i===0?0:R*(.3+rnd()*.62),x=c.x+Math.cos(b)*d,y=c.y+Math.sin(b)*d,del=.55+i*.31;
   yoLob(u,x,y,del,58,()=>{gkAoe(u,x,y,58,13,{dot:YO_BURN()},'yo_lava');yoPool(u,x,y,52,2.5);fxShake(i===6?.3:.14,x,y);fxSmoke(x,y,{u,col:'#3a2a24',n:3,r:26,s:16,t:1.3,al:.24,rise:90})},x,y)}}),
 // ---------- dash : Coulée de lave ----------
 yo_dash:SP('Coulée de lave',YO_D.dash,7,{ai:ESC},(u,a,td)=>{const d=clamp(td||220,120,220),x0=u.x,y0=u.y;gkS('fire',u);gkS('dash',u);anim(u,'lunge',.3);
  const ex=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r),ey=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);
  gkStrip(u,x0,y0,ex,ey,{w:48,t:2.5,kind:'yo',vfx:'yo_lava',d:3,o:{dot:BURN(2,2)},self:o=>{o.haste=Math.max(o.haste||0,.15)}});dash(u,a,d,.24,{});
  gkTrail(u,'yo_lava',.4,{w:18,z:22});fxBurst(x0,y0,YOC.b,{u,z:14,n:10,sp:180,up:120,gr:380,c2:YOC.a,a:a+Math.PI,arc:1.6,t:.5});fxSmoke(x0,y0,{u,col:'#3a2a24',n:3,r:20,s:14,t:.9,al:.22,rise:40})}),
});
Object.assign(NATHERO,{yo:'kylo'});
// ---- trait : Magma
KGTRAITS[0]={nom:'Magma',desc:'Ta lave brûle : tes flaques ralentissent et brûlent les ennemis, et tu y files plus vite. Un ennemi qui te frappe au corps à corps se brûle (4 dégâts en 2 s ; 6 dégâts de plus sous l\'Armure de magma)',
 init(u){u.yo_ar=0},
 update(u,dt){if(u.yo_cds!==u.cds){u.yo_cds=u.cds;u.yo_ar=0}if(u.yo_ar>0)u.yo_ar=Math.max(0,u.yo_ar-dt)},
 deal(src,t,dmg,o){return dmg},
 landed(src,t,dmg,o){if(src.yo_ar>0&&o.basic&&dmg>0&&!t.dead){t.dot=Math.max(t.dot||0,2);t.dotT=Math.max(t.dotT||0,2);t.dotSrc=src;t.dotEl=0}},
 take(t,src,dmg,o){if(src&&src!==t&&o.melee&&!o.thorn&&dmg>0&&!src.dead){src.dot=Math.max(src.dot||0,2);src.dotT=Math.max(src.dotT||0,2);src.dotSrc=t;src.dotEl=0;
   if(t.yo_ar>0){const V=VFX;VFX='yo_lava';hit(src,t,6,{silent:1,thorn:1});VFX=V;fxBurst(src.x,src.y,YOC.b,{u:t,z:30,n:6,sp:160,up:80,gr:300,c2:YOC.a,t:.4})}}return dmg},
 draw(u,p,S,sk){if(!(u.yo_ar>0))return;const t=performance.now()/1000,a=Math.min(1,u.yo_ar*2),s=S*(sk||1);gkDim(u,()=>{
  fxGlowS(p.x,p.y-28*s,30*s,YOC.b,.22*a*(.8+.2*Math.sin(t*6)),44*s);fxGlowS(p.x,p.y,26*s,YOC.b,.45*a,9*s,0); // halo de chaleur et lueur aux pieds
  g.save();g.globalCompositeOperation='lighter';const n=gkN(9,u);for(let i=0;i<n;i++){const b=i*.9+t*2,ph=((t*.9+i*.37)%1),x=p.x+Math.cos(b)*(13+ph*6)*s,y=p.y-(4+ph*58)*s;g.globalAlpha=a*Math.sin(Math.PI*ph);g.fillStyle=i%2?YOC.a:YOC.b;g.beginPath();g.arc(x,y,(1.6+(i%3)*.8)*S*(1-ph*.5),0,7);g.fill()}
  g.globalAlpha=a*(.55+.25*Math.sin(t*8));g.strokeStyle=YOC.b;g.lineWidth=1.6*S;g.lineCap='round';for(let i=0;i<4;i++){const x=p.x+(i-1.5)*8*s;g.beginPath();g.moveTo(x,p.y-4*s);g.lineTo(x+(i%2?3:-3)*s,p.y-14*s);g.lineTo(x,p.y-22*s);g.stroke()}g.restore()})},
 prev(u,p,S,front){if(front)return;g.save();g.fillStyle=rgba(YOC.b,.25);g.beginPath();g.ellipse(p.x,p.y,26*S,8*S,0,0,7);g.fill();g.restore()},
 hud(u,x,y){gkHud(u,x,y,'Magma'+(u.yo_ar>0?' · ARMURE '+u.yo_ar.toFixed(1).replace('.',',')+' s':''),null,0,YOC.a,YOC.a)}};
AFTER.push(()=>UK.push('yo_ar'));
// ---- visuels
PROJD.yo_rock=gkLumpD('yo_lava',{glow:1,tail:1});
// flaque de lave : croûte sombre, cœur incandescent qui pulse (sprites), veines, bulles qui crèvent ; le bord net est tracé par gk_pool / gk_strip
GKPOOL.yo=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,R=x.r,Rs=R*s,i0=x.i||0;fxSoftS(q.x,q.y,Rs*1.05,YOC.d,.32*k,Rs*1.05*K);
 fxGlowS(q.x,q.y,Rs*.98,YOC.b,.9*k*(.85+.15*Math.sin(t*3+i0)),Rs*.95*K,0);fxGlowS(q.x,q.y,Rs*.42,YOC.a,.55*k,Rs*.42*K,0);g.save();
 g.strokeStyle=rgba(YOC.d,.6*k);g.lineWidth=1.6*s;g.lineCap='round';for(let i=0;i<(x.strip?3:5);i++){const b=i*1.26+i0,p1=P(x.x+Math.cos(b)*R*.25,x.y+Math.sin(b)*R*.25,0),p2=P(x.x+Math.cos(b+.4)*R*.75,x.y+Math.sin(b+.4)*R*.75,0);g.beginPath();g.moveTo(p1.x,p1.y);g.lineTo(p2.x,p2.y);g.stroke()}
 g.globalCompositeOperation='lighter';const n=x.strip?1:gkN(5,x.owner||x);for(let i=0;i<n;i++){const ph=(t*.9+i*.37+i0*.21)%1,b=i*2.1+i0*1.3,d=R*.55*((i*.37+i0*.13)%1),p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,ph*10),r=(2+ph*5)*s;g.strokeStyle=rgba(YOC.a,.8*k*(1-ph));g.lineWidth=1.4;g.beginPath();g.arc(p.x,p.y,r,0,7);g.stroke()}
 g.restore()};
// bombe de lave en cloche (u → point), ou météore qui tombe (départ = arrivée) : traînée de braises, ombre au sol qui grossit
JFXD.yo_lob=(f,k,e,t)=>{const m=Math.min(1,e*1.05),fall=f.x===f.x2&&f.y===f.y2,big=(f.r||40)>60,H=m2=>fall?320*(1-m2*m2):Math.sin(Math.PI*m2)*130+24*(1-m2),pos=m2=>P(lerp(f.x,f.x2,m2),lerp(f.y,f.y2,m2),H(m2));if(m>=1)return;
 const q=pos(m),s=q.s,sh=P(lerp(f.x,f.x2,m),lerp(f.y,f.y2,m),0),R0=big?15:fall?13:11;
 fxSoftS(sh.x,sh.y,(R0*.7+R0*.6*(fall?m:1))*s,'#000000',.28,(R0*.7+R0*.6*(fall?m:1))*s*K);
 if(fall){const T=P(f.x,f.y,H(m)+90);g.save();g.translate(q.x,q.y);g.rotate(Math.atan2(T.y-q.y,T.x-q.x)+Math.PI);fxTailL((q.y-T.y)*1.1,R0*2.6*s,YOC.b,.75);g.restore();fxGlowS(q.x,q.y,R0*2.6*s,YOC.b,.55)}
 else{const n=gkN(7,f);for(let i=1;i<=n;i++){const q2=pos(Math.max(0,m-i*.03));fxGlowS(q2.x,q2.y,(R0-i*.9)*1.7*q2.s,YOC.b,.55*(1-i/(n+1)))}}
 g.save();g.translate(q.x,q.y);PROJD.yo_rock({},R0*s,0,t*1000);g.restore()};
// jet de lave craché par le lanceur : gerbe de gouttes incandescentes
JFXD.yo_spew=(f,k,e,t,u)=>{if(!u||u.dead)return;const n=gkN(12,f);for(let i=0;i<n;i++){const d=(10+e*80+i*6),b=f.a+(i%3-1)*.12*(1+e),q=P(u.x+Math.cos(b)*d,u.y+Math.sin(b)*d,48+e*34-i*2.2-e*e*30),r=(6.5-i*.35)*q.s;
  fxGlowS(q.x,q.y,r*2.2,YOC.b,.55*k);g.fillStyle=i%2?YOC.a:YOC.b;g.beginPath();g.arc(q.x,q.y,r*.6,0,7);g.fill()}};
// sol qui se fend (Kazan, télégraphe : jamais atténué) : fissures rougeoyantes qui s'élargissent, lueur qui monte des failles
JFXD.yo_crack=(f,k,e,t)=>{const R=f.r;g.save();g.lineCap='round';g.lineJoin='round';const pts=[];for(let i=0;i<7;i++){const b=i*.9+f.x*.01;const L=[P(f.x,f.y,0)];for(let j=1;j<=4;j++){const d=R*e*j/4;L.push(P(f.x+Math.cos(b+Math.sin(j*3+i)*.35)*d,f.y+Math.sin(b+Math.sin(j*3+i)*.35)*d,0))}pts.push(L)}
 for(const [w,c,a] of[[3+e*4,YOC.d,.7],[1+e*3,YOC.b,.55+.45*e],[.8+e,YOC.a,.5+.5*e]]){g.strokeStyle=rgba(c,a);g.lineWidth=w;g.globalCompositeOperation=c===YOC.d?'source-over':'lighter';for(const L of pts){g.beginPath();L.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke()}}
 g.restore();const q=P(f.x,f.y,0);fxGlowS(q.x,q.y,R*q.s*e*.7,YOC.b,.45*e,R*q.s*e*.7*K,0);
 const n=Math.round(6*e);for(let i=0;i<n;i++){const b=i*2.4+t*2,d=R*e*.8*((i*.37)%1),ph=(t*1.6+i*.29)%1,p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,ph*30);fxGlowS(p.x,p.y,3*p.s,YOC.a,.8*(1-ph))}};
// éruption : geyser de lave (lumière additive, jamais opaque sur les ninjas), gerbes qui retombent
JFXD.yo_erupt=(f,k,e,t)=>{const q=P(f.x,f.y,0),s=q.s,up=Math.sin(Math.PI*Math.min(1,e*1.6)),h=up*190*s,w=f.r*.42*s;if(h<2&&e>.5)return;
 const o=g.globalCompositeOperation,ga=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=ga*.36*k;g.drawImage(fxSpr(YOC.b,0),q.x-w,q.y-h*1.05,w*2,h*2.1);g.globalAlpha=ga*.26*k;g.drawImage(fxSpr(YOC.a,0),q.x-w*.45,q.y-h*.95,w*.9,h*1.9);g.globalAlpha=ga;g.globalCompositeOperation=o;
 fxGlowS(q.x,q.y-h,w*.9,YOC.b,.35*k);
 const n=gkN(16,f);g.save();g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const b=i*.39+f.x*.01,m=Math.min(1,e*1.4),d=f.r*1.05*m*(.5+.5*((i*.61)%1)),hh=Math.sin(Math.PI*m)*(110+(i%4)*30),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,hh);g.fillStyle=rgba(i%2?YOC.a:YOC.b,.85*k);g.beginPath();g.arc(p.x,p.y,(2.5+(i%3))*s,0,7);g.fill()}g.restore()};
// ciel de la pluie de magma : nuée rougeoyante au-dessus de la zone, braises qui tombent ; au sol, ombre et bord de la zone visée
JFXD.yo_sky=(f,k,e,t)=>{const a=Math.min(1,k*3)*Math.min(1,e*5),q=P(f.x,f.y,0),s=q.s;g.save();fxSoftS(q.x,q.y,f.r*s*1.05,YOC.d,.32*a,f.r*s*1.05*K);g.strokeStyle=rgba(YOC.b,.6*a);g.lineWidth=2;g.setLineDash([8,6]);g.lineDashOffset=-t*30;gEll(f.x,f.y,f.r);g.stroke();g.setLineDash([]);g.restore();
 const n=gkN(7,f);for(let i=0;i<n;i++){const b=i*2.4+t*.3,d=f.r*.7*((i*.29)%1),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,280+Math.sin(t+i)*12);fxSoftS(p.x,p.y,(34+(i%3)*10)*s,i%2?'#3a1a14':'#5a2a1a',.4*a);fxGlowS(p.x,p.y+10*s,(26+(i%3)*8)*s,YOC.b,.22*a*(.7+.3*Math.sin(t*5+i)))}
 g.save();g.globalCompositeOperation='lighter';const m=gkN(14,f);for(let i=0;i<m;i++){const b=i*2.4,d=f.r*((i*.29)%1),z=270-((t*160+i*37)%270),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,z);g.fillStyle=rgba(YOC.a,.6*a);g.fillRect(p.x-1.2,p.y-4,2.4,8)}g.restore()};

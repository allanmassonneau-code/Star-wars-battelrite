// ===== Kekkei genkai g9 : Sakin, la poudre d'or (préfixe gd_) — façon Rasa, le Quatrième Kazekage =====
// Identité : le poids. Une poudre d'or LOURDE et lente, qui colle et alourdit (trait, 3 cumuls) : dès 2 cumuls l'ennemi est ralenti,
// à 3 il est écrasé par ton prochain coup d'or (+10 dégâts, étourdi). Rien de vif ni de perçant (c'est le contraire du sable de fer) :
// masses qui tombent, vagues qui poussent, gangue qui fige, raz-de-marée d'or. Dash : glisse dorée.
gkPal('gd_gold','#fff2b0','#e8b030','#9a6a10','#3a2604');
defKG(9,{n:'Sakin',col:'#e0a828',tag:'Sa',el:'Doton',nat:4,d:'La poudre d\'or : lourde et lente, elle colle, alourdit et écrase',
 ico:f=>{for(const [x,y,r] of[[-6,6,4.6],[4,6,4.6],[-1,-2,4.6],[8,-1,2.6],[-9,-2,2.4],[2,-9,2.8]]){g.beginPath();g.arc(x,y,r,0,7);g.fill()}}});
const GD_D={
 fist:'Masse d\'or lente et lourde (440) : 16 dégâts, repousse et alourdit',
 wave:'Une vague d\'or roule devant toi (300) en 1 s : 20 dégâts, elle emporte les ennemis avec elle et alourdit',
 gangue:'L\'or enveloppe le point visé (360 max) après 0,8 s : 18 dégâts, entrave 1 s et alourdit 2 fois',
 hammer:'Une énorme masse d\'or tombe lentement sur le point visé (400 max, alerte 1,1 s) : 42 dégâts, étourdit 0,6 s ; l\'or répandu ralentit 3 s',
 tide:'Raz-de-marée d\'or : une immense vague roule devant toi pendant 3 s (480) : 12 dégâts toutes les 0,5 s aux ennemis dedans, emportés et alourdis',
 dash:'Tu glisses sur un tapis d\'or (210) ; il reste 2 s et ralentit les ennemis qui le foulent'};
KIT('g9',[
 ['D','x.gd_fist','Sakin : Masse d\'or',GD_D.fist,'gd_gold'],
 ['C','x.gd_wave','Sakin : Vague d\'or',GD_D.wave,'gd_gold'],
 ['B','x.gd_gangue','Sakin : Gangue d\'or',GD_D.gangue,'gd_gold'],
 ['A','x.gd_hammer','Sakin : Marteau d\'or',GD_D.hammer,'gd_gold'],
 ['S','x.gd_tide','Sakin : Ôgon no Tsunami',GD_D.tide,'gd_gold'],
]);
DASHG[9]={src:'x.gd_dash',n:'Glisse dorée',d:GD_D.dash,vfx:'gd_gold',cd:7};
KGBAL[9]=[0.998,0.988];
const GDC=GK.gd_gold,GD_MAX=3,gdW=(u,e,n)=>gkStack(u,e,'gd_w',n,GD_MAX,5);GKPOOLC.gd='#f0c040';
// impact d'or : poudre lourde (gouttes qui retombent vite), paillettes, nuage doré, trace de sable d'or
const gdHitFx=(u,x,y,r)=>{gkImp(u,x,y,'gd_gold',r,{ring:0});fxDebris(x,y,{u,n:Math.round(4+r/20),sp:100+r,col:GDC.b,c2:GDC.c,s:3+r/40});fxBurst(x,y,'#fff6c8',{u,z:24,n:6,sp:160,gr:200,up:60,w:1.6,sh:'dot',t:.6})};
// vague d'or : bande qui avance (vitesse sp) et emporte les ennemis dedans ; d dégâts tous les iv (ou 1 fois si iv = 0)
function gdWave(u,a,len,w,dur,d,iv){const x={type:'gd_wave',x:u.x+Math.cos(a)*30,y:u.y+Math.sin(a)*30,a,len,w,r:0,t:dur,m:dur,team:u.team,owner:u,k:0,iv,d,hs:new Set(),sp:len/dur,dep:30,danger:0};aux.push(x);return x}
Object.assign(NAT,{
 // ---------- Masse d'or (D) ----------
 gd_fist:SP('Sakin : Masse d\'or',GD_D.fist,5,{ai:RG(430,.75),line:{len:440,w:36}},(u,a)=>{gkS('sand',u);gkS('heavy',u);anim(u,'gk_push',.45);fxCast(u,'gd_gold',.2,{n:6});
  proj(u,a,{spd:440,r:15,dmg:16,life:1,col:GDC.b,kind:'gd_lump',vfx:'gd_gold',o:{kb:200},onHit:(p,t)=>{gdW(p.owner,t,1);gdHitFx(p.owner,t.x,t.y,36)}})}),
 // ---------- Vague d'or (C) ----------
 gd_wave:SP('Sakin : Vague d\'or',GD_D.wave,8,{ai:RG(300,.7),line:{len:300,w:130}},(u,a)=>{gkS('sand',u);gkS('heavy',u);anim(u,'gk_sweep',.6);gdWave(u,a,300,130,1,20,0);fxSmoke(u.x+Math.cos(a)*30,u.y+Math.sin(a)*30,{u,col:GDC.b,n:4,r:40,s:14,t:.9,al:.22,rise:20})}),
 // ---------- Gangue d'or (B) ----------
 gd_gangue:SP('Sakin : Gangue d\'or',GD_D.gangue,10,{ai:RG(360,.6),tele:{r:75,max:360}},(u,a,td)=>{const c=atP(u,a,td,360),D=.8;gkS('sand',u);anim(u,'gk_charge',.6);fxCast(u,'gd_gold',.5,{n:8});jx({jfx:'gd_swirl',x:c.x,y:c.y,r:75,t:D,m:D});
  later(u,D,()=>{for(const e of enemies(u))if(gkIn(e,c.x,c.y,75)&&gkHit(e,u,18,{root:1,unblockable:1},'gd_gold')){gdW(u,e,2);jx({jfx:'gd_enc',ti:gkI(e),x:e.x,y:e.y,t:1,m:1})}
   jx({jfx:'gk_boom',x:c.x,y:c.y,r:75,v:'gd_gold',s:'gold',t:.5,m:.5});gdHitFx(u,c.x,c.y,75);fxRing(c.x,c.y,{u,r0:75,r1:20,col:GDC.b,t:.3,w:4});if(near(c.x,c.y)){gkS('sand',u);gkS('heavy',u)}},{x:c.x,y:c.y,r:75})}),
 // ---------- Marteau d'or (A) ----------
 gd_hammer:SP('Sakin : Marteau d\'or',GD_D.hammer,13,{ai:RG(400,.65),tele:{r:95,max:400}},(u,a,td)=>{const c=atP(u,a,td,400),D=1.1;gkS('sand',u);gkS('roar',u);anim(u,'gk_call',1);jx({jfx:'gd_mass',x:c.x,y:c.y,r:95,d:D,t:D+.1,m:D+.1});
  later(u,D,()=>{gkAoe(u,c.x,c.y,95,42,{stun:.6},'gd_gold',e=>{gdW(u,e,1);fxHitStop(u,e,42)});gkPool(u,c.x,c.y,{r:95,t:3,kind:'gd',vfx:'gd_gold',sl:1});jx({jfx:'gk_boom',x:c.x,y:c.y,r:95,v:'gd_gold',s:'gold',t:.7,m:.7});
   gdHitFx(u,c.x,c.y,95);fxRing(c.x,c.y,{u,r0:20,r1:95,col:GDC.b,c2:'#fff6c8',t:.4,w:8});fxSmoke(c.x,c.y,{u,col:GDC.b,n:6,r:70,s:18,t:1.3,al:.22,rise:40});
   if(near(c.x,c.y)){gkS('boom',u);gkS('rock',u)}},{x:c.x,y:c.y,r:95})}),
 // ---------- Ôgon no Tsunami (S) ----------
 gd_tide:ULT('Sakin : Ôgon no Tsunami',GD_D.tide,{ai:RG(420,.8),line:{len:480,w:240}},(u,a)=>{gkS('sand',u);gkS('roar',u);anim(u,'gk_sweep',1);gdWave(u,a,480,240,3,12,.5);fxShake(.22,u.x,u.y);fxRing(u.x,u.y,{u,r0:20,r1:90,col:GDC.b,t:.4,w:5});fxSmoke(u.x,u.y,{u,col:GDC.b,n:8,r:70,s:20,t:1.4,al:.22,rise:50});
  fxBurst(u.x+Math.cos(a)*40,u.y+Math.sin(a)*40,'#fff6c8',{u,z:30,n:14,sp:260,a,arc:2.4,up:150,gr:300,w:1.8,sh:'dot',t:.8})}),
 // ---------- dash : Glisse dorée ----------
 gd_dash:SP('Glisse dorée',GD_D.dash,7,{ai:ESC},(u,a,td)=>{const x0=u.x,y0=u.y,d=clamp(td||210,110,210);gkS('sand',u);gkS('dash',u);anim(u,'lunge',.3);
  const ex=clamp(u.x+Math.cos(a)*d,B.x+u.r,B.x+B.w-u.r),ey=clamp(u.y+Math.sin(a)*d,B.y+u.r,B.y+B.h-u.r);gkStrip(u,x0,y0,ex,ey,{w:50,t:2,kind:'gd',vfx:'gd_gold',sl:1});dash(u,a,d,.26,{});gkTrail(u,'gd_gold',.35,{w:16,z:14});fxSmoke(x0,y0,{u,col:GDC.b,n:3,r:18,s:12,t:.8,al:.2,rise:16})}),
});
Object.assign(NATHERO,{gd:'kylo'});
// vague d'or : le front avance ; les ennemis dans la vague sont emportés (et pas la peine de les toucher 2 fois si iv = 0)
AUXF.gd_wave=(x,dt)=>{const o=x.owner;if(x.t<=0||!o)return;const ca=Math.cos(x.a),sa=Math.sin(x.a),dep=Math.min(x.len,x.dep+x.sp*dt);const mv=dep-x.dep;x.dep=dep;const cx=x.x+ca*dep,cy=x.y+sa*dep,th=60;
 const ins=e=>{const dx=e.x-cx,dy=e.y-cy,f=dx*ca+dy*sa;return f>-th-e.r&&f<20+e.r&&Math.abs(-dx*sa+dy*ca)<x.w/2+e.r};
 for(const e of enemies(o)){if(!ins(e)||(e.dash&&e.dash.jump)||e.phase>0)continue;if(e.unstop<=0){e.x+=ca*mv;e.y+=sa*mv;collide(e)}
  if(x.iv?x.k<=0:!x.hs.has(e)){x.hs.add(e);if(gkHit(e,o,x.d,{unblockable:1,fx:cx-ca*80,fy:cy-sa*80},'gd_gold'))gdW(o,e,1)}}
 if(x.iv&&x.k<=0)x.k=x.iv};
AUXD.gd_wave=(x,k,t)=>{const el=x.m-x.t,dep=Math.min(x.len,30+x.len/x.m*el),ca=Math.cos(x.a),sa=Math.sin(x.a),hw=x.w/2,cx=x.x+ca*dep,cy=x.y+sa*dep,al=Math.min(1,x.t/.3),n=Math.max(6,Math.round(x.w/18));
 const Q=(f,s,z)=>P(x.x+ca*f-sa*s,x.y+sa*f+ca*s,z||0);g.save();poly([Q(0,-hw*.5),Q(dep,-hw),Q(dep,hw),Q(0,hw*.5)],rgba(GDC.c,.25*al));
 const big=x.w>200?1.5:1,TOP=[],BAS=[],FR=[];for(let i=0;i<n;i++){const s=(i/(n-1)-.5)*x.w,h=(30+Math.sin(t*5+i*1.3)*7)*big*(1-Math.pow(Math.abs(i/(n-1)-.5)*2,3)*.5);TOP.push(Q(dep-6,s,h));BAS.push(Q(dep-46*big,s,0));FR.push(Q(dep+6,s,0))}
 g.globalAlpha=al;const yT=Math.min(...TOP.map(p=>p.y)),yB=Math.max(...FR.map(p=>p.y)),gr=g.createLinearGradient(0,yT,0,yB);gr.addColorStop(0,GDC.a);gr.addColorStop(.45,GDC.b);gr.addColorStop(1,GDC.c);
 g.fillStyle=gr;g.strokeStyle=GDC.d;g.lineWidth=1.3;g.beginPath();BAS.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));for(let i=n-1;i>=0;i--)g.lineTo(TOP[i].x,TOP[i].y);g.closePath();g.fill();
 g.beginPath();FR.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));for(let i=n-1;i>=0;i--)g.lineTo(TOP[i].x,TOP[i].y);g.closePath();g.fill();g.stroke();
 g.strokeStyle=rgba('#fff6c8',.9);g.lineWidth=2;g.beginPath();TOP.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();
 g.fillStyle=GDC.c;for(let i=0;i<n;i++){const p=TOP[i];g.beginPath();g.arc(p.x+Math.sin(t*7+i)*3,p.y-3,(2.5+(i%3))*p.s,0,7);g.fill()}
 g.globalAlpha=al;g.fillStyle='#fffbe0';for(let i=0;i<14;i++){const s=((i*.37)%1-.5)*x.w,p=Q(dep-((t*60+i*13)%50),s,10+((i*7)%30));if(Math.sin(t*9+i)>.4)g.fillRect(p.x-1,p.y-1,2.5,2.5)}g.restore();
 // décor : embruns d'or au-dessus de la crête (additifs), poussière dorée au pied, trace d'or derrière
 gkDim(x,()=>{const n=gkN(x.w>200?16:8,x);g.save();g.globalCompositeOperation='lighter';for(let i=0;i<n;i++){const sd=((i*.618)%1-.5)*x.w*.9,ph=(t*1.6+i*.23)%1,p=Q(dep-6+ph*18,sd,(36*big)+ph*(1-ph)*60*big);g.globalAlpha=al*(1-ph);g.fillStyle=i%3?GDC.a:'#ffffff';g.fillRect(p.x-1.4,p.y-1.4,2.8,2.8)}g.restore();
  const m=gkN(x.w>200?6:3,x);for(let i=0;i<m;i++){const sd=((i*.37+.1)%1-.5)*x.w,p=Q(dep+4,sd,6);fxSoftS(p.x,p.y,(14+(i%2)*8)*p.s*big,GDC.b,.22*al)}
  const tr=Q(Math.max(0,dep-80*big),0,0);fxGlowS(tr.x,tr.y,x.w*.4*tr.s,GDC.b,.18*al,x.w*.4*tr.s*K,0)})};
// ---- trait : Poids de l'or
GKST.push({key:'gd_w',max:GD_MAX,col:'#f0c040',c2:'#5a3a04'});
KGTRAITS[9]={nom:'Poids de l\'or',desc:'Ta poudre d\'or colle et alourdit (3 cumuls au plus, 5 s) : dès 2 cumuls l\'ennemi est ralenti. À 3 cumuls, ton prochain coup d\'or l\'écrase : +10 dégâts et étourdi 0,6 s (les cumuls tombent)',
 update(u,dt){for(const e of enemies(u))if((e.gd_w|0)>=2&&e.unstop<=0&&!(e.slowImm>0))e.slow=Math.max(e.slow,.15)},
 deal(src,t,dmg,o){return gkMine('gd_gold')&&(t.gd_w|0)>=GD_MAX&&dmg>0?dmg+10:dmg},
 landed(src,t,dmg,o){if(!gkMine('gd_gold')||(t.gd_w|0)<GD_MAX||dmg<=0||t.dead)return;gkStSet(t,'gd_w',0,1.5);if(t.unstop<=0){t.stun=Math.max(t.stun,.6);say(t,'ÉCRASÉ','#f0c040')}jx({jfx:'gk_boom',x:t.x,y:t.y,r:60,v:'gd_gold',s:'gold',t:.5,m:.5});fxFlare(t.x,t.y,GDC.a,{u:src,z:40,r:26,t:.2});fxHitStop(src,t,dmg+10,1);if(near(t.x,t.y))gkS('heavy',t)},
 draw(u,p,S,sk){const t=performance.now()/1000;g.save();g.globalAlpha=fxA(u);g.fillStyle=GDC.b;for(let i=0;i<8;i++){const b=t*.7+i*.785,x=p.x+Math.cos(b)*20*S*(sk||1),y=p.y+Math.sin(b)*6*S-(2+Math.abs(Math.sin(t*2+i))*6)*S;g.beginPath();g.arc(x,y,1.8*S,0,7);g.fill()}g.restore()},
 drawB(u,p,S,sk){const s=S*(sk||1);g.save();g.fillStyle='#c89a3a';g.strokeStyle='#5a3a10';g.lineWidth=1.2;g.beginPath();g.ellipse(p.x-14*s,p.y-44*s,7*s,10*s,-.3,0,7);g.fill();g.stroke();g.fillStyle='#e8c060';g.fillRect(p.x-17*s,p.y-56*s,6*s,4*s);g.restore()}, // gourde d'or dans le dos
 prev(u,p,S,front){(front?KGTRAITS[9].draw:KGTRAITS[9].drawB)(u,p,S,1)},
 hud(u,x,y){gkHud(u,x,y,'Poids de l\'or','gd_w',GD_MAX,'#f0c040',GDC.a)}};
AFTER.push(()=>UK.push('gd_w'));
// cible alourdie : poudre d'or qui coule sur elle
STATD.push((u,p,S,sk)=>{const n=u.gd_w|0;if(!n||u.dead)return;const t=performance.now()/1000;g.save();g.fillStyle=rgba(GDC.b,.8);for(let i=0;i<n*4;i++){const x=p.x+Math.sin(i*2.3)*12*S,y=p.y-(54-((t*30+i*11)%46))*S;g.fillRect(x-1,y-1,2.2,2.2)}
 g.fillStyle=rgba(GDC.c,.45);g.beginPath();g.ellipse(p.x,p.y-2*S,(12+n*4)*S,(4+n)*S,0,0,7);g.fill();g.restore()});
// ---- visuels
PROJD.gd_lump=gkLumpD('gd_gold',{spin:420,tail:1});
// nappe d'or (marteau, glisse) : sable doré lourd (sprites, pas de dégradé recalculé), scintillements ; le bord net est tracé par gk_pool / gk_strip
GKPOOL.gd=(x,k,t)=>{const q=P(x.x,x.y,0),s=q.s,R=x.r;fxSoftS(q.x,q.y,R*s,GDC.b,.55*k,R*s*K);fxSoftS(q.x,q.y,R*s*.6,GDC.a,.35*k,R*s*.6*K);g.save();
 g.fillStyle=rgba('#fff6c8',.9*k);const n=x.strip?2:gkN(9,x.owner||x);for(let i=0;i<n;i++){const b=i*2.4+(x.i||0),d=R*((i*.37)%1)*.85,p=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,1),tw=Math.max(0,Math.sin(t*5+i*1.7));if(tw>.5){g.fillRect(p.x-2*tw,p.y-.5,4*tw,1);g.fillRect(p.x-.5,p.y-2*tw,1,4*tw)}}g.restore()};
// or qui tourbillonne avant la gangue (il se resserre sur le cercle d'alerte)
JFXD.gd_swirl=(f,k,e,t)=>{const n=gkN(24,f);g.save();for(let i=0;i<n;i++){const b=i*.26+t*3,d=f.r*(1.3-e*.8)*(.6+((i*.37)%1)*.4),p=P(f.x+Math.cos(b)*d,f.y+Math.sin(b)*d,10+e*30+(i%4)*6);g.fillStyle=i%2?GDC.a:GDC.b;g.beginPath();g.arc(p.x,p.y,(2.5+(i%3))*p.s,0,7);g.fill();if(i%6===0)fxGlowS(p.x,p.y,5*p.s,GDC.a,.6)}g.restore()};
// cible prise dans une gangue d'or : coque semi-transparente (le corps reste lisible), reflets
JFXD.gd_enc=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,h=46*s*Math.min(1,e*6),a=Math.min(1,k*3);g.save();g.globalAlpha*=a;g.fillStyle=rgba(GDC.b,.5);g.strokeStyle=GDC.c;g.lineWidth=1.4;
 g.beginPath();g.moveTo(q.x-18*s,q.y+2*s);g.quadraticCurveTo(q.x-22*s,q.y-h*.7,q.x-6*s,q.y-h);g.quadraticCurveTo(q.x+4*s,q.y-h*1.08,q.x+12*s,q.y-h*.9);g.quadraticCurveTo(q.x+24*s,q.y-h*.4,q.x+18*s,q.y+2*s);g.closePath();g.fill();g.stroke();
 g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#fff6c8',.7);g.lineWidth=2*s;g.beginPath();g.moveTo(q.x-12*s,q.y-h*.2);g.quadraticCurveTo(q.x-14*s,q.y-h*.7,q.x-4*s,q.y-h*.9);g.stroke();g.restore();fxGlowS(q.x+8*s,q.y-h*.6,5*s,'#ffffff',.6*a)};
// marteau d'or : énorme masse qui descend lentement ; ombre qui grossit (où ça tombe) ; près du sol la masse devient translucide (ne cache pas la cible)
JFXD.gd_mass=(f,k,e,t)=>{const el=e*f.m,m=Math.min(1,el/f.d),z=320*(1-m*m),q=P(f.x,f.y,z+40),s=q.s,R=f.r*.7*s,gq=P(f.x,f.y,0);
 fxSoftS(gq.x,gq.y,f.r*(.4+.6*m)*gq.s,'#000000',.2+.25*m,f.r*(.4+.6*m)*gq.s*K);g.save();g.globalAlpha*=z<120?.45+.55*z/120:1;fxGlowS(q.x,q.y,R*1.5,GDC.b,.3);g.translate(q.x,q.y);PROJD.gd_lump({},R,0,t*1000*.3);g.restore();
 if(m>.5){const n=gkN(6,f);g.save();g.fillStyle=GDC.a;for(let i=0;i<n;i++){const b=i*1.05+t,ph=(t*2+i*.3)%1,p=P(f.x+Math.cos(b)*f.r*.5,f.y+Math.sin(b)*f.r*.5,z+40-ph*(z+40));g.globalAlpha=.7*(1-ph);g.fillRect(p.x-1,p.y-3,2,6)}g.restore()}};

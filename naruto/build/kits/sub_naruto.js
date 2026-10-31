// ===== Subjutsu, lot Naruto (préfixe sub_nr_) : les techniques de Naruto, réservées aux ninjas sans clan =====
// Le Rasengan, le Multiclonage et le Rasenshuriken sont déjà des subjutsu (sub.js, sub_nrp2.js) ; ce lot ajoute le chakra de Kyûbi,
// sorti du clan Uzumaki (les Uzumaki sont des maîtres du fûinjutsu, pas des réceptacles de démon).
KIT('u',[
 [4,'B','x.sub_nr_kyubi','Chakra de Kyûbi','Rugissement qui repousse (8). 5 s : tes coups de base lancent des griffes de chakra (7, une par seconde). Régénère 4 s ; insensible au contrôle 2 s','fox'],
]);
Object.assign(NAT,{
 sub_nr_kyubi:S_('Chakra de Kyûbi','Rugissement qui repousse (8). 5 s : tes coups de base lancent des griffes de chakra (7, une par seconde). Régénère 4 s ; insensible au contrôle 2 s',20,{hero:'chewie',tele:{self:1,r:150},ai:SELF(200,.7)},(u)=>{S('heavy',u);S('roar',u);anim(u,'roar',.8);
  u.unstop=Math.max(u.unstop,2);u.regenB=Math.max(u.regenB,4);u.sub_nr_kyu=5;VFX='fox';aoe(u,u.x,u.y,150,8,{kb:290,unblockable:1},'#ff6a2a');VFX=null;
  jx({jfx:'sub_nr_roar',ui:units.indexOf(u),x:u.x,y:u.y,t:.7,m:.7});if(near(u.x,u.y))shake=Math.max(shake,.35)}),
});
// ---- logique (hôte) : la durée du manteau, et les griffes lancées par les coups de base (au plus une par seconde)
AFTER.push(()=>{const T=TRAITS[-1];if(!T)return;const U0=T.update,L0=T.landed;
 T.update=function(u,dt){if(U0)U0.call(this,u,dt);if(u.sub_nr_kyu>0)u.sub_nr_kyu=Math.max(0,u.sub_nr_kyu-dt);
  if(u.sub_nr_clQ){const q=u.sub_nr_clQ,V=VFX;u.sub_nr_clQ=null;VFX='fox';aoe(u,q.x,q.y,70,7,{quiet:1},'#ff6a2a');VFX=V;jx({jfx:'sub_nr_claw',x:q.x,y:q.y,t:.45,m:.45})}};
 T.landed=function(src,t,dmg,o){if(L0)L0.call(this,src,t,dmg,o);if(src.sub_nr_kyu>0&&o.basic&&t.team!==src.team&&!(SIMT<(src.sub_nr_clT||0))){src.sub_nr_clT=SIMT+1;src.sub_nr_clQ={x:t.x,y:t.y}}}; // griffe : seulement si le coup passe
 UK.push('sub_nr_kyu')});
// ---- visuels
// rugissement : ondes rouges et tête de renard de chakra
JFXD.sub_nr_roar=(f,k,e)=>{const q=P(f.x,f.y,0),s=q.s;g.globalCompositeOperation='lighter';for(let i=0;i<2;i++){const r=(40+e*170-i*30)*s;if(r<0)continue;g.strokeStyle=rgba(i?'#ffb04a':'#ff3a1a',.75*k);g.lineWidth=(8-i*3)*s;g.beginPath();g.ellipse(q.x,q.y,r,r*K,0,0,7);g.stroke()}
 const h=P(f.x,f.y,100+e*20),S=(1+e*.6)*h.s,a=Math.min(1,k*2.5)*.75;g.fillStyle=rgba('#ff4a1a',.45*a);g.strokeStyle=rgba('#ffb04a',.9*a);g.lineWidth=2;g.beginPath();g.moveTo(h.x-26*S,h.y);g.lineTo(h.x-23*S,h.y-14*S);g.lineTo(h.x-30*S,h.y-40*S);g.lineTo(h.x-9*S,h.y-21*S);g.quadraticCurveTo(h.x,h.y-24*S,h.x+9*S,h.y-21*S);g.lineTo(h.x+30*S,h.y-40*S);g.lineTo(h.x+23*S,h.y-14*S);g.lineTo(h.x+26*S,h.y);
 g.quadraticCurveTo(h.x+16*S,h.y+10*S,h.x+7*S,h.y+24*S);g.quadraticCurveTo(h.x,h.y+30*S,h.x-7*S,h.y+24*S);g.quadraticCurveTo(h.x-16*S,h.y+10*S,h.x-26*S,h.y);g.closePath();g.fill();g.stroke();
 g.fillStyle=rgba('#fff3c0',.95*a);for(const sx of[-1,1]){g.beginPath();g.moveTo(h.x+sx*5*S,h.y-5*S);g.lineTo(h.x+sx*19*S,h.y-12*S);g.lineTo(h.x+sx*14*S,h.y-2*S);g.closePath();g.fill()}circ(h.x,h.y+24*S,3*S,rgba('#fff3c0',.8*a))};
// griffes de chakra sur la cible
JFXD.sub_nr_claw=(f,k,e)=>{const q=P(f.x,f.y,34),s=q.s*1.4,m=Math.min(1,e*4);g.globalCompositeOperation='lighter';g.lineCap='round';circ(q.x,q.y-4*s,20*s*(1-k*.5),rgba('#ff4a1a',.25*k));for(let i=-1;i<=1;i++){g.strokeStyle=rgba(i?'#ff6a2a':'#ffd36a',.95*k);g.lineWidth=(i?3.5:5)*s*k+1;const ox=i*10*s;g.beginPath();g.moveTo(q.x+ox-20*s,q.y-24*s);g.quadraticCurveTo(q.x+ox+5*s,q.y-6*s,q.x+ox-20*s+34*s*m,q.y-24*s+44*s*m);g.stroke()}};
// manteau de chakra du Kyûbi : flammes rouges autour du corps et deux oreilles de renard
STATD.push((u,p,S,sk)=>{if(!(u.sub_nr_kyu>0)||u.dead)return;sk=sk||1;const t=performance.now()/1000,a=Math.min(1,u.sub_nr_kyu*2),cy=p.y-40*S*sk;g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<9;i++){const b=i*.7+t*2.2,x=p.x+Math.cos(b)*17*S,y=cy+Math.sin(b)*30*S*sk,hh=(9+Math.sin(t*12+i*2)*4)*S;g.fillStyle=i%2?rgba('#ff6a2a',.4*a):rgba('#ff2a1a',.35*a);g.beginPath();g.moveTo(x-5*S,y);g.quadraticCurveTo(x,y-hh*2.2,x+5*S,y);g.fill()}
 const hy=p.y-72*S*sk;g.fillStyle=rgba('#ff5a1a',.8*a);for(const sx of[-1,1]){g.beginPath();g.moveTo(p.x+sx*4*S,hy);g.lineTo(p.x+sx*15*S,hy-17*S);g.lineTo(p.x+sx*16*S,hy+2*S);g.closePath();g.fill()}
 g.fillStyle=rgba('#ffd36a',.6*a);for(const sx of[-1,1]){g.beginPath();g.moveTo(p.x+sx*8*S,hy-1*S);g.lineTo(p.x+sx*14*S,hy-11*S);g.lineTo(p.x+sx*14*S,hy);g.closePath();g.fill()}
 // queue de chakra qui ondule derrière le ninja
 g.strokeStyle=rgba('#ff4a1a',.45*a);g.lineWidth=6*S;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y-30*S*sk);g.quadraticCurveTo(p.x-Math.cos(u.aim||0)*26*S+Math.sin(t*5)*8*S,p.y-46*S*sk,p.x-Math.cos(u.aim||0)*34*S,p.y-(64+Math.sin(t*4)*6)*S*sk);g.stroke();g.restore()});

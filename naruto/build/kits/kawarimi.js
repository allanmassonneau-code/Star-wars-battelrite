// ===== Kawarimi commun (touche A, case SHUNI) : permutation ancrée =====
// A : marque le point où tu te tiens (ancre visible de tous) et te protège 10 s, où que tu ailles.
// Le 1er coup ennemi reçu pendant ces 10 s est annulé en entier (dégâts, étourdissement, recul, effets) : tu es ramené à l'ancre
// et une simple bûche (sans dégâts ni explosion) tombe là où tu étais, dans un nuage de fumée.
// Pas touché en 10 s : la protection s'éteint. Dans les deux cas, la recharge (KW_CD) ne démarre qu'à la fin de la protection.
// Ce qui compte comme un coup (kwHit) : tout coup d'un ennemi (attaque de base, jutsu, projectile, explosion, contre-attaque…),
// sauf les coups « silencieux » sans contrôle (ticks de zones, brûlures et poisons déjà posés, épines) ; un coup silencieux qui étourdit,
// entrave ou projette compte (sinon il traverserait la protection). Les coûts en PV et les dégâts qu'on s'inflige ne comptent pas.
// La mécanique sub_kawa (jutsu de rang C « Kawarimi » de l'arbre des sans-clan, kits/sub.js) est distincte et inchangée.
const KW_T=10,KW_CD=12,KW_R=34;
const kwSlot=u=>{const A=u.ch&&u.ch.abil;if(!A)return -1;if(A[SHUNI]&&A[SHUNI].key==='kw_anchor')return SHUNI;return A.findIndex(a=>a&&a.key==='kw_anchor')};
const kwOn=u=>!u.dead&&u.kwE>SIMT;
Object.assign(NAT,{
 kw_anchor:S_('Kawarimi','Ancre : le prochain coup reçu en 10 s est annulé et te ramène à l\'ancre',KW_CD,{hero:'lando',ai:{mode:'kw',p:.6}},(u)=>{
  const i=kwSlot(u),cd=i>=0?u.ch.abil[i].cd:KW_CD;for(const x of aux)if(x.type==='kw_mark'&&x.owner===u)x.t=0;
  u.kwE=SIMT+KW_T;u.kwT=KW_T;u.kwX=u.x;u.kwY=u.y;if(i>=0)u.cds[i]=KW_T+cd; // recharge = protection restante + recharge pleine (raccourcie si le coup tombe avant)
  aux.push({type:'kw_mark',x:u.x,y:u.y,r:0,t:KW_T,m:KW_T,team:u.team,owner:u,ui:units.indexOf(u)});
  anim(u,'seal',.3);S('poof',u);say(u,'KAWARIMI','#e8cfa8');jx({jfx:'sub_poof',x:u.x,y:u.y,r:26,t:.4,m:.4})})});
// le coup annulé : vrai si hit() doit s'arrêter là (appelé tout en haut de hit, après l'intangibilité)
function kwHit(u,src,dmg,o){if(!kwOn(u)||!src||src===u||src.team===u.team||o.thorn||o.el===-1)return false;
 if(o.silent&&!(o.stun>0||o.root>0||o.air>0||o.kb>0))return false;
 const i=kwSlot(u),cd=i>=0?u.ch.abil[i].cd:KW_CD,ox=u.x,oy=u.y;u.kwE=0;u.kwT=0;if(i>=0)u.cds[i]=Math.min(u.cds[i],cd);
 for(const x of aux)if(x.type==='kw_mark'&&x.owner===u)x.t=0;
 const p=subFree({x:(u.kwX??ox)+.01,y:u.kwY??oy},u.r);/* point libre : bornes de l'arène et obstacles (+0,01 : jamais pile au centre d'un obstacle) */aux.push({type:'kw_log',x:ox,y:oy,a:ang(u,src),r:0,t:1.4,m:1.4,team:u.team});
 subPoof(ox,oy,44,u);u.x=p.x;u.y=p.y;u.z=0;u.kx=u.ky=0;u.dash=null;u.spin=null;u.airT=0;collide(u);u.phase=Math.max(u.phase||0,.25); // bref intangible : la suite de la rafale ne rattrape pas l'ancre
 u.flash=0;say(u,'KAWARIMI !','#e8cfa8');subPoof(u.x,u.y,30,u);anim(u,'crouch',.3);return true}
// ancre : suit la protection (hôte) ; disparaît au coup, à l'expiration ou à la mort
AUXF.kw_mark=x=>{const u=x.owner;if(!u||u.dead||!kwOn(u)){if(u){u.kwT=0;if(u.dead)u.kwE=0}x.t=0;return}u.kwT=Math.max(0,u.kwE-SIMT);x.t=Math.max(.02,u.kwT)};
AUXF.kw_log=()=>{};
AFTER.push(()=>UK.push('kwT'));
// bots : seulement face à un vrai danger (tir qui arrive, gros jutsu en incantation, corps à corps menaçant, zone qui va partir)
// L'ancre ne sert que si elle est posée À L'ÉCART du danger (activée au contact, elle ramènerait au même endroit) : donc avant l'engagement
// (ennemi qui arrive à mi-distance), ou face à un gros coup annoncé ; au contact seulement en danger (PV bas). Jamais « dès que c'est rechargé ».
function kwAI(u,e,d,th){if(th&&((th.dmg||0)>=10||th.big||th.rocket))return true;
 if(e.cast&&d<520){const ab=castAb(e,e.cast);if(ab&&'BAS'.includes(ab.rank||'-'))return true}
 for(const z of zones)if(z.owner&&z.owner.team!==u.team&&(z.dmg===0||z.t<.45)&&z.t<.6&&Math.hypot(z.x-u.x,z.y-u.y)<z.r+u.r)return true; // zone d'alerte sur le point d'exploser
 if(d>190&&d<430){const vx=e.vx||0,vy=e.vy||0,v=Math.hypot(vx,vy),cl=v>40?((u.x-e.x)*vx+(u.y-e.y)*vy)/(d*v):0;if(cl>.5||meleeU(e)&&d<330)return true} // il arrive (ou un corps-à-corps est tout proche)
 if(d<u.r+e.r+75&&(e.swing>0||e.spin||e.dash))return u.hp<u.max*.45;
 return false}
// ---------- visuels ----------
// ancre au sol : cercle de craie, sceau et bûche fantôme ; anneau qui se vide avec la protection (visible de tous : contre-jeu, attendre 10 s)
AUXD.kw_mark=(x,k,t)=>{const f=Math.max(0,Math.min(1,x.t/(x.m||KW_T))),own=units[x.ui],mine=own===player,c=mine?'#ffe0a8':x.team===player.team?'#bfe0ff':'#ffb0a0';
 g.fillStyle=rgba(c,.16);gEll(x.x,x.y,KW_R);g.fill();g.strokeStyle=rgba(c,.85);g.lineWidth=2;g.setLineDash([6,5]);g.lineDashOffset=-t*20;gEll(x.x,x.y,KW_R);g.stroke();g.setLineDash([]);
 g.strokeStyle=rgba(c,.95);g.lineWidth=3;gEll(x.x,x.y,KW_R+6,-Math.PI/2,-Math.PI/2+f*6.283);g.stroke();
 const q=P(x.x,x.y,0),s=q.s;g.strokeStyle=rgba(c,.6);g.lineWidth=1.5;for(let j=0;j<4;j++){const b=j*1.571+t*.6;g.beginPath();g.moveTo(q.x+Math.cos(b)*10*s,q.y+Math.sin(b)*10*s*K);g.lineTo(q.x+Math.cos(b)*(KW_R-6)*s,q.y+Math.sin(b)*(KW_R-6)*s*K);g.stroke()}
 g.globalAlpha=.35+.15*Math.sin(t*4);kwLogD(q.x,q.y-6*s,s*.7,0);g.globalAlpha=1;
 if(f<.3&&(t*4|0)%2){g.strokeStyle=rgba(c,.9);g.lineWidth=1.5;gEll(x.x,x.y,KW_R+12);g.stroke()}};
function kwLogD(X,Y,s,rot){g.save();g.translate(X,Y);g.rotate(rot);g.strokeStyle=SUBK[0];g.lineWidth=2;g.fillStyle='#7a4e28';g.beginPath();g.ellipse(0,0,22*s,9*s,0,0,7);g.fill();g.stroke();
 g.fillStyle='#c89a60';g.beginPath();g.ellipse(20*s,0,5*s,9*s,0,0,7);g.fill();g.stroke();g.strokeStyle='#8a5a30';g.lineWidth=1;g.beginPath();g.ellipse(20*s,0,2.4*s,4.5*s,0,0,7);g.stroke();
 g.strokeStyle='rgba(40,24,10,.6)';g.beginPath();g.moveTo(-14*s,-3*s);g.lineTo(6*s,-4*s);g.moveTo(-10*s,3*s);g.lineTo(10*s,4*s);g.moveTo(-18*s,0);g.lineTo(-4*s,1*s);g.stroke();
 g.fillStyle='#5a3a1a';g.beginPath();g.moveTo(-4*s,-8*s);g.lineTo(-1*s,-14*s);g.lineTo(2*s,-8*s);g.fill();g.restore()}
// bûche laissée à ta place : tombe, rebondit puis s'efface (purement visuelle)
AUXD.kw_log=(x,k,t)=>{const e=1-x.t/x.m,z=e<.22?(1-e/.22)*28:e<.32?Math.sin((e-.22)/.1*Math.PI)*5:0,q=P(x.x,x.y,z),a=Math.atan2(Math.sin(x.a||0)*K,Math.cos(x.a||0));
 g.globalAlpha=Math.min(1,x.t/.35);g.fillStyle='rgba(0,0,0,.25)';gEll(x.x,x.y,20);g.fill();kwLogD(q.x,q.y-8*q.s,q.s,a*.3+(e<.22?(1-e/.22)*.8:0));g.globalAlpha=1};
// joueur protégé : anneau de minuterie à ses pieds et petite bûche au-dessus de la tête
STATD.push((u,p,S,sk)=>{if(!(u.kwT>0))return;const t=performance.now()/1000,f=Math.min(1,u.kwT/KW_T),c=u===player?'#ffe0a8':u.team===player.team?'#bfe0ff':'#ffb0a0';g.save();
 g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=4*S;g.beginPath();g.ellipse(p.x,p.y,27*S,10*S,0,0,7);g.stroke();
 g.strokeStyle=rgba(c,f<.3&&(t*4|0)%2?.45:.95);g.lineWidth=2.5*S;g.beginPath();g.ellipse(p.x,p.y,27*S,10*S,0,-Math.PI/2,-Math.PI/2+f*6.283);g.stroke();
 const y=p.y-104*S*(sk||1);kwLogD(p.x-6*S,y,S*.42,-.25);text(cdTxt(u.kwT),p.x+9*S,y+4,10,c,'left','bold');g.restore()});
// HUD, case A : protection restante (anneau doré) à la place de la recharge, qui ne court qu'ensuite
function kwHud(p,x0,y,s,sh,gap){const i=kwSlot(p);if(i<0||!(p.kwT>0))return;const x=x0+i*(s+gap)+(i>0?10:0)+(i>BARN?10:0),f=Math.min(1,p.kwT/KW_T);
 g.fillStyle='rgba(30,22,12,.97)';g.fillRect(x,y,s,sh);g.fillStyle='rgba(255,210,120,.22)';g.fillRect(x,y+sh*(1-f),s,sh*f);
 g.strokeStyle='#ffd27a';g.lineWidth=2;g.strokeRect(x,y,s,sh);const k=lbl[SLOTS[i]];text(k,x+s/2,y+21,k.length>2?13:18,'#fff','center');
 text('PROTÉGÉ',x+s/2,y+33,9,'#ffe0a8','center','bold');text(cdTxt(p.kwT),x+s/2,y+47,13,'#ffd27a','center')}

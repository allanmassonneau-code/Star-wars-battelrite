// ===== Famille de sub f2 : Genjutsu =====
// Vision de l'enfer (NOUVEAU) · Plumes (sub.js) · Ténèbres (NOUVEAU) · Étreinte de l'arbre (NOUVEAU) · Sharingan : Œil copieur (NOUVEAU, copie à la manière du Sharingan Uchiha) ; dash : Pas fantôme (NOUVEAU)
KIT('f2',[
 ['D','x.sub_gnar','Genjutsu : Vision de l\'enfer','Regard en cône court (185) : 11 dégâts et ralenti 1,5 s ; une cible déjà ralentie voit l\'enfer et prend peur 0,5 s (elle fuit)','genjutsu'],
 ['C','x.sub_feather','Genjutsu : Plumes','Pluie de plumes qui ralentit : l\'ennemi qui y reste 1,2 s s\'endort (12 dégâts le réveillent)','genjutsu'],
 ['B','x.sub_gkok','Genjutsu : Ténèbres','Voile noir au curseur 3 s : l\'ennemi qui y entre est réduit au silence 1 s (une fois), puis ralenti et rongé (6 dégâts par seconde) tant qu\'il y reste ; tes alliés y sont camouflés','genjutsu'],
 ['A','x.sub_gjub','Genjutsu : Étreinte de l\'arbre','Des racines sortent sous l\'ennemi visé (380) : 0,5 s plus tard il est ligoté par un arbre 1,1 s, puis 32 dégâts. Parer (F) à temps brise l\'illusion : « KAI ! »','genjutsu'],
 ['S','x.sub_gcopy','Sharingan : Œil copieur','Copie le dernier jutsu ennemi vu (10 s) et le relance à 90 % ; sans copie, l\'ennemi regardé s\'endort 1,5 s (12 dégâts le réveillent)','genjutsu'],
]);
DASHF[2]={src:'x.sub_d_gen',n:'Maboroshi : Pas fantôme',d:'Clignement de 200 vers le curseur ; ton image reste 1 s à ta place et attire les coups',vfx:'genjutsu',cd:7};
const SUB_GV='#c07aff',SUB_GR='#ff4a5a';
const subGI=u=>units.indexOf(u);
// cible d'un regard : ennemi dans la ligne (380 × 70) le plus proche du point visé, sinon un ennemi tout près du point visé
function subGaze(u,a,td,L){const p=fwd(u,a,Math.min(td||300,L)),c=Math.cos(a),s=Math.sin(a);let b=null,bd=1e9;
 for(const e of enemies(u)){const dx=e.x-u.x,dy=e.y-u.y,f=dx*c+dy*s;if(f<-e.r||f>L+e.r||Math.abs(-dx*s+dy*c)>35+e.r)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<bd){bd=d;b=e}}return b||nearE(u,p.x,p.y,110)}
// jutsu qu'on peut copier (pas de charges, de relance par case, de dash ni de Kawarimi)
const subCopyOk=ab=>ab&&typeof ab.f==='function'&&ab.rank&&!ab.dash&&!ab.shun&&!ab.charges&&ab.key!=='sub_gcopy'&&ab.key!=='uc_shar'&&!/findIndex\(x=>x(&&x)?\.key|subIdx\(|ucSlot\(|Slot\(u/.test(String(ab.f));
Object.assign(NAT,{
 // --- Vision de l'enfer : yeux violets 0,18 s, puis le regard balaie un cône court
 sub_gnar:S_('Genjutsu : Vision de l\'enfer','Regard qui ralentit ; la cible déjà ralentie prend peur',6,{hero:'cadbane',line:{len:185,w:120},ai:RG(175,.6)},(u,a)=>{anim(u,'eye',.45);S('genjutsu',u);const ui=subGI(u);jx({jfx:'sub_geye',ui,x:u.x,y:u.y,col:SUB_GV,t:.5,m:.5});fxCast(u,'genjutsu',.2,{col:SUB_GV,z:52,hd:8});
  later(u,.18,()=>{if(u.dead||u.stun>0)return;const A=u.aim;jx({jfx:'sub_gcone',ui,x:u.x,y:u.y,a:A,r:185,t:.45,m:.45});fxWind(u.x+Math.cos(A)*95,u.y+Math.sin(A)*95,A,{u,len:180,w:110,n:6,t:.4,col:'#c8a0ff'});
   for(const e of enemies(u)){if(dist(u,e)>185+e.r||angDiff(ang(u,e),A)>.38)continue;const was=e.slow>0,V=VFX;VFX='genjutsu';const ok=hit(e,u,11,{slow:1.5,unblockable:1});
    if(ok&&was&&e.unstop<=0){hit(e,u,0,{fear:.5,fx:u.x,fy:u.y,silent:1,unblockable:1});jx({jfx:'sub_ghell',ti:subGI(e),x:e.x,y:e.y,t:.9,m:.9,n:1});fxFlare(e.x,e.y,SUB_GR,{u,z:60,r:22,t:.2})}else if(ok)jx({jfx:'sub_ghell',ti:subGI(e),x:e.x,y:e.y,t:.5,m:.5,n:0});
    if(ok)fxBurst(e.x,e.y,'#c07aff',{u,z:40,n:7,sp:110,gr:-30,up:40,w:3,sh:'petal',c2:'#2a0a3a'});VFX=V}})}),
 // --- Ténèbres : voile noir (champ du moteur : ralentit, camoufle les alliés) + silence 1 s à la 1re entrée de chaque ennemi
 sub_gkok:S_('Genjutsu : Ténèbres','Voile noir : silence à l\'entrée, ralentit, camoufle',11,{hero:'cadbane',tele:{r:140,max:420},ai:RG(400,.55)},(u,a,td)=>{const p=subFree(atP(u,a,td,420),40);anim(u,'sub_seal',.45);S('genjutsu',u);S('shadow',u);
  field(u,p.x,p.y,{r:140,t:3,slow:1,cloak:1,dps:6,col:'#120818',vfx:'genjutsu'});aux.push({type:'sub_gkok',x:p.x,y:p.y,r:140,t:3,m:3,team:u.team,owner:u,seen:new Set()});jx({jfx:'sub_gkokin',x:p.x,y:p.y,r:140,t:.6,m:.6});
  fxRing(p.x,p.y,{u,r0:150,r1:140,col:'#9a5ae0',w:5,t:.5});fxSmoke(p.x,p.y,{u,col:'#1a0c24',n:7,r:120,s:26,t:1.2,al:.3,rise:26});fxCast(u,'genjutsu',.3,{col:SUB_GV})}),
 // --- Étreinte de l'arbre : 0 = racines (0,5 s, parade = KAI) ; 1 = ligoté 1,1 s puis 32 dégâts ; 3 = illusion brisée
 sub_gjub:S_('Genjutsu : Étreinte de l\'arbre','Racines, puis l\'arbre ligote la cible',13,{hero:'cadbane',tele:{r:44,max:380},ai:RG(370,.6)},(u,a,td)=>{const e=pick(u,a,td||300,380);
  if(!e||dist(u,e)>420){subRefund(u,'sub_gjub',1,'AUCUNE CIBLE',SUB_GV);return}anim(u,'sub_seal',.5);S('genjutsu',u);
  aux.push({type:'sub_gjub',x:e.x,y:e.y,r:40,t:1.6,m:1.6,team:u.team,owner:u,tg:e,ti:subGI(e),n:0});jx({jfx:'sub_geye',ui:subGI(u),x:u.x,y:u.y,col:SUB_GV,t:.5,m:.5});fxCast(u,'genjutsu',.4,{col:SUB_GV})}),
 // --- Œil copieur : relance la copie à 90 % (u.sub_cp, suivi par le trait plus bas), sinon sommeil
 sub_gcopy:S_('Sharingan : Œil copieur','Copie le dernier jutsu vu, sinon endort la cible',20,{hero:'cadbane',line:{len:380,w:70},ai:RG(380,.5)},(u,a,td)=>{const c=u.sub_cp,ok=!!(c&&c.ab&&SIMT-c.t<10),ui=subGI(u);anim(u,'eye',.5);S('genjutsu',u);
  jx({jfx:'sub_gshar',ui,x:u.x,y:u.y,t:.8,m:.8,n:ok?1:0});fxGlyph(u.x,u.y,SUB_GR,{u,r:50,t:.9,ui});fxPillar(u.x,u.y,SUB_GR,{u,h:170,w:22,t:.5,al:.4});
  if(ok){u.sub_cp=null;u.sub_cpN='';say(u,'COPIE : '+c.ab.n,SUB_GR);const n0=projs.length,z0=zones.length,f0=fields.length,a0=aux.length,ab=Object.assign({},c.ab,{jid:undefined,rank:null});
   u.sub_cpM=1;try{fire(u,ab,a,td,false)}catch(err){}u.sub_cpM=0;
   for(let k=n0;k<projs.length;k++)if(projs[k].owner===u&&typeof projs[k].dmg==='number')projs[k].dmg*=.9;for(let k=z0;k<zones.length;k++)if(typeof zones[k].dmg==='number')zones[k].dmg*=.9;for(let k=f0;k<fields.length;k++)if(fields[k].dps)fields[k].dps*=.9;
   for(let k=a0;k<aux.length;k++)if(typeof aux[k].dmg==='number')aux[k].dmg*=.9;return}
  const e=subGaze(u,a,td,380);if(!e){subRefund(u,'sub_gcopy',1.5,'AUCUNE CIBLE',SUB_GR);return}
  jx({jfx:'sub_gspin',ti:subGI(e),x:e.x,y:e.y,t:1.5,m:1.5});VFX='genjutsu';const h=hit(e,u,0,{silent:1,unblockable:1});VFX=null;
  if(h&&e.unstop<=0){e.stun=Math.max(e.stun,1.5);e.sleepT=-1.6;e.cast=null;e.chan=null;say(e,'ENDORMI','#ffd8e8');fxRing(e.x,e.y,{u,r0:60,r1:16,col:SUB_GR,c2:'#ffd0e0',w:4,t:.5});fxBurst(e.x,e.y,SUB_GR,{u,z:60,n:9,sp:90,gr:30,up:10,w:3,sh:'petal',c2:'#2a0006',t:1});fxArc(u.x,u.y,e.x,e.y,SUB_GR,{u,z:56,z2:50,w:1.4,t:.3,j:.05});aux.push({type:'sub_sleepw',x:e.x,y:e.y,r:0,t:1.7,m:1.7,team:u.team,sl:[{e,hp:e.hp}]})}}),
 // --- Pas fantôme (dash) : clignement ; l'image fantôme reste 1 s (leurre visé par les bots)
 sub_d_gen:S_('Maboroshi : Pas fantôme','Clignement, ton image reste à ta place',7,{hero:'cadbane',ai:ESC},(u,a)=>{const ox=u.x,oy=u.y,q=subFree(fwd(u,a,200),u.r);S('genjutsu',u);anim(u,'crouch',.25);
  subDecoy(u,ox,oy,1,{ghost:1});jx({jfx:'sub_gblink',x:ox,y:oy,x2:q.x,y2:q.y,t:.4,m:.4});fxBurst(q.x,q.y,'#c07aff',{u,z:40,n:8,sp:120,gr:-20,up:40,w:3,sh:'petal',c2:'#f0e0ff'});fxFlare(q.x,q.y,'#c07aff',{u,z:36,r:22,t:.18});u.x=q.x;u.y=q.y;u.dash=null;u.kx=u.ky=0;collide(u)}),
});
// ---------- logique (hôte) ----------
AUXF.sub_gkok=x=>{const u=x.owner;if(x.t<=0||!u)return;for(const e of enemies(u)){if(x.seen.has(e)||Math.hypot(e.x-x.x,e.y-x.y)>x.r+e.r*.4)continue;x.seen.add(e);
 const V=VFX;VFX='genjutsu';hit(e,u,0,{silence:1,silent:1,unblockable:1});VFX=V;jx({jfx:'sub_ghell',ti:subGI(e),x:e.x,y:e.y,t:.6,m:.6,n:0})}};
AUXF.sub_gjub=x=>{const u=x.owner,e=x.tg;if(!e||e.dead||!u||u.dead){x.t=0;return}x.x=e.x;x.y=e.y;x.ti=subGI(e);const el=x.m-x.t;
 if(x.n===0){if(e.block||e.parry>0){x.n=3;x.t=Math.min(x.t,.4);say(e,'KAI !','#ffffff');jx({jfx:'sub_gkai',x:e.x,y:e.y,t:.45,m:.45});fxFlare(e.x,e.y,'#ffffff',{u:e,z:44,r:24,t:.2});fxRing(e.x,e.y,{u:e,r0:10,r1:60,col:'#e0c8ff',w:4,t:.3});if(near(e.x,e.y))S('deflect',e);return}
  if(el>=.5){x.n=1;const V=VFX;VFX='genjutsu';const ok=hit(e,u,0,{root:1.1,silent:1,unblockable:1});VFX=V;if(!ok||e.unstop>0){x.n=3;x.t=Math.min(x.t,.3);return}e.cast=null;say(e,'LIGOTÉ','#c07aff');fxDebris(e.x,e.y,{u,n:7,sp:120,col:'#6a4428',c2:'#2e1c10',s:4});fxDecal(e.x,e.y,'leaf',{u,r:40,t:2.5});if(near(e.x,e.y))S('rock',e)}return}
 if(x.n===1){e.root=Math.max(e.root,.05);if(x.t<=.04&&!x.done){x.done=1;const V=VFX;VFX='genjutsu';hit(e,u,32,{unblockable:1});VFX=V;jx({jfx:'sub_gkai',x:e.x,y:e.y,t:.4,m:.4,n:1});fxImpact(e.x,e.y,'genjutsu',1.4,{u,r:44,z:40});fxDebris(e.x,e.y,{u,n:8,sp:180,col:'#6a4428',c2:'#2e1c10',s:4});fxHitStop(u,e,32,1);if(near(e.x,e.y))S('heavy',u)}}};
// Œil copieur : un temps de recharge ennemi qui repart = un jutsu vu (même principe que le Sharingan Uchiha) ; copies à 90 %
const subCpHas=u=>{const C=u.ch;if(u._cpC!==C){u._cpC=C;u._cpOn=!!(C&&C.jab&&Object.values(C.jab).some(b=>b&&b.key==='sub_gcopy'))}return u._cpOn};
subTH({
 update(u){if(!subCpHas(u))return;if(!u.sub_obs||u.sub_obs.size>64)u.sub_obs=new Map();const see=!(u.stun>0)&&!(u.sleepT<0);
  for(const e of units){if(e.team===u.team||e.dead)continue;const cd=e.cds||[],o=u.sub_obs.get(e);if(!o||o.bn!==(e.barN|0)){u.sub_obs.set(e,{c:cd.slice(),t:[],bn:e.barN|0});continue}const pv=o.c,vis=see&&dist(u,e)<700;
   for(let i=1;i<ABN;i++){const c=cd[i]||0;if(vis&&c>(pv[i]||0)+.5&&!(SIMT-(o.t[i]??-9)<2)){o.t[i]=SIMT;const ab=e.ch.abil[i];if(subCopyOk(ab))u.sub_cp={ab,t:SIMT}}pv[i]=c}}
  const live=!!(u.sub_cp&&SIMT-u.sub_cp.t<10);u.sub_cpN=live?u.sub_cp.ab.n:''},
 deal(src,t,dmg){return src.sub_cpM?dmg*.9:dmg}});
AFTER.push(()=>UK.push('sub_cpN'));
// ---------- visuels ----------
// œil qui s'illumine (violet : genjutsu)
JFXD.sub_geye=(f,k,e,t,u)=>{if(!u||u.dead)return;const h=P(u.x+Math.cos(u.aim)*6,u.y+Math.sin(u.aim)*6,58),s=h.s,c=f.col||SUB_GV;g.globalCompositeOperation='lighter';
 for(const d of[-1,1]){const x=h.x+d*4*s;circ(x,h.y,(5+e*4)*s,rgba(c,.35*k));circ(x,h.y,1.8*s,rgba('#ffffff',.95*k))}g.strokeStyle=rgba(c,.6*k);g.lineWidth=1.2;g.beginPath();g.ellipse(h.x,h.y,(12+e*24)*s,(4+e*8)*s,0,0,7);g.stroke()};
// regard : cône de brume violette parcouru de mains spectrales
JFXD.sub_gcone=(f,k,e,t,u)=>{const o=u&&!u.dead?u:f,a=f.a,R=f.r*(.4+.6*Math.min(1,e*3));
 for(let i=0;i<14;i++){const b=a+(((i*37)%14)/13-.5)*.72,d=R*(.25+((i*53)%10)/13),q=P(o.x+Math.cos(b)*d,o.y+Math.sin(b)*d,22+((i*7)%5)*6),r=(10+((i*11)%6)*3)*q.s;circ(q.x,q.y,r,rgba(i%3?'#4a1a7a':'#9a4ae0',.3*k))}g.globalCompositeOperation='lighter';
 const p0=P(o.x,o.y,30);for(const s of[-1,1]){const q=P(o.x+Math.cos(a+s*.36)*R,o.y+Math.sin(a+s*.36)*R,30);g.strokeStyle=rgba('#e0b8ff',.5*k);g.lineWidth=1.5;g.beginPath();g.moveTo(p0.x,p0.y);g.lineTo(q.x,q.y);g.stroke()}};
// vision de l'enfer sur la cible : flammes violettes et visage hurlant (n=1 : peur)
JFXD.sub_ghell=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,al=Math.min(1,k*3);g.globalCompositeOperation='lighter';
 for(let i=0;i<7;i++){const b=i*.9+t*2,x=q.x+Math.cos(b)*16*s,y=q.y-((t*60+i*14)%50)*s;g.fillStyle=rgba(i%2?'#8a3ad0':'#e05aff',.6*al);g.beginPath();g.moveTo(x-4*s,y);g.quadraticCurveTo(x,y-16*s,x+4*s,y);g.fill()}
 if(f.n){const h=P(tg.x,tg.y,78),r=9*h.s;g.fillStyle=rgba('#2a0a3a',.7*al);g.beginPath();g.ellipse(h.x,h.y,r,r*1.25,0,0,7);g.fill();g.fillStyle=rgba('#ff5aff',.9*al);circ(h.x-3.5*h.s,h.y-2*h.s,1.8*h.s,rgba('#ff5aff',.9*al));circ(h.x+3.5*h.s,h.y-2*h.s,1.8*h.s,rgba('#ff5aff',.9*al));
  g.beginPath();g.ellipse(h.x,h.y+4*h.s,2.4*h.s,3.6*h.s*(1+.3*Math.sin(t*20)),0,0,7);g.fill()}};
// ténèbres : apparition (le voile se referme du bord vers le centre)
JFXD.sub_gkokin=(f,k,e)=>{g.globalCompositeOperation='source-over';g.fillStyle=rgba('#08040c',.5*k);gEll(f.x,f.y,f.r*(1.3-e*.3));g.fill();g.strokeStyle=rgba(SUB_GV,.8*k);g.lineWidth=3;gEll(f.x,f.y,f.r*(1.3-e*.3));g.stroke()};
AUXD.sub_gkok=(x,k,t)=>{const al0=Math.min(1,x.t/.4,(x.m-x.t)/.3+.3),al=al0*fxA(x);g.save();g.fillStyle=rgba('#06030a',.55*al0);gEll(x.x,x.y,x.r);g.fill();
 const gr=P(x.x,x.y,0);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#9a5ae0',.75*al0);g.lineWidth=2.4;gEll(x.x,x.y,x.r);g.stroke();
 for(let i=0;i<12;i++){const b=i*.5236+Math.sin(t*.8+i)*.15,R=x.r*(.92+.08*Math.sin(t*3+i)),q=P(x.x+Math.cos(b)*R,x.y+Math.sin(b)*R,0),h=(30+18*Math.sin(t*2.3+i*1.7))*q.s;
  g.strokeStyle=rgba(i%2?'#5a2a8a':'#9a5ae0',.45*al);g.lineWidth=2.5*q.s;g.beginPath();g.moveTo(q.x,q.y);g.quadraticCurveTo(q.x+Math.sin(t*3+i)*10*q.s,q.y-h*.6,q.x+Math.sin(t*2+i)*6*q.s,q.y-h);g.stroke()}
 g.globalCompositeOperation='source-over';for(let i=0;i<6;i++){const b=t*.4+i*1.05,d=x.r*.5*(.4+.6*((i*7)%5)/4),q=P(x.x+Math.cos(b)*d,x.y+Math.sin(b)*d,40+12*Math.sin(t+i));circ(q.x,q.y,22*q.s,rgba('#0a0410',.35*al))}g.restore()};
// étreinte de l'arbre : racines qui sortent (télégraphe), puis tronc et branches qui enlacent la cible
AUXD.sub_gjub=(x,k,t)=>{const tg=x.ti!=null?units[x.ti]:null,px=tg&&!tg.dead?tg.x:x.x,py=tg&&!tg.dead?tg.y:x.y,el=x.m-x.t,q=P(px,py,0),s=q.s;g.save();
 if(el<.5){const e=el/.5;fxTele(px,py,40,e,SUB_GV,x);
  for(let i=0;i<6;i++){const b=i*1.047+.3,a0=P(px+Math.cos(b)*44,py+Math.sin(b)*44,0),a1=P(px+Math.cos(b)*(44-30*e),py+Math.sin(b)*(44-30*e),6*e);g.strokeStyle='#5a3a24';g.lineWidth=4*s;g.lineCap='round';g.beginPath();g.moveTo(a0.x,a0.y);g.lineTo(a1.x,a1.y);g.stroke()}g.restore();return}
 if(el>=1.6-.05&&x.n!==1){g.restore();return}const e=Math.min(1,(el-.5)/.25),H=(60+20*e)*s;g.lineCap='round';
 for(const [c,w] of[['#2e1c10',13],['#6a4428',9]]){g.strokeStyle=c;g.lineWidth=w*s;g.beginPath();g.moveTo(q.x-14*s,q.y+2*s);g.quadraticCurveTo(q.x-22*s,q.y-H*.5,q.x-6*s,q.y-H*e);g.stroke();g.beginPath();g.moveTo(q.x+14*s,q.y+2*s);g.quadraticCurveTo(q.x+22*s,q.y-H*.5,q.x+6*s,q.y-H*e);g.stroke()}
 for(let i=0;i<4;i++){const y=q.y-(14+i*13)*s*e;g.strokeStyle=i%2?'#7a5030':'#5a3a20';g.lineWidth=4*s;g.beginPath();g.ellipse(q.x,y,16*s,5*s,(i-1.5)*.15,.15,Math.PI-.15);g.stroke()}
 for(let i=0;i<5;i++){const b=-1.2+i*.6,L=(18+((i*7)%3)*6)*s*e,y0=q.y-H*e;g.strokeStyle='#4a3018';g.lineWidth=3*s;g.beginPath();g.moveTo(q.x,y0);g.lineTo(q.x+Math.sin(b)*L,y0-Math.cos(b)*L);g.stroke();circ(q.x+Math.sin(b)*L,y0-Math.cos(b)*L,5*s,rgba('#c07aff',.5))}g.restore()};
// KAI ! (illusion brisée) ou fin de l'étreinte : éclats violets
JFXD.sub_gkai=(f,k,e)=>{const q=P(f.x,f.y,40);g.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const b=i*.628,d=(10+e*50)*q.s;g.fillStyle=rgba(f.n?'#8a5a3a':'#e0c8ff',.9*k);g.beginPath();const x=q.x+Math.cos(b)*d,y=q.y+Math.sin(b)*d*.7;g.moveTo(x,y-4*q.s);g.lineTo(x+3*q.s,y);g.lineTo(x,y+4*q.s);g.lineTo(x-3*q.s,y);g.fill()}
 g.strokeStyle=rgba('#ffffff',.8*k);g.lineWidth=2;g.beginPath();g.ellipse(q.x,q.y,(12+e*40)*q.s,(8+e*28)*q.s,0,0,7);g.stroke()};
// Sharingan : grand œil rouge à trois tomoe au-dessus du lanceur (n=1 : copie, il pivote vite)
function subShar(x,y,R,rot,al){g.fillStyle=rgba('#1a0a0a',al);g.beginPath();g.arc(x,y,R*1.12,0,7);g.fill();g.fillStyle=rgba('#c8101e',al);g.beginPath();g.arc(x,y,R,0,7);g.fill();g.strokeStyle=rgba('#3a0006',al);g.lineWidth=R*.08;g.beginPath();g.arc(x,y,R*.62,0,7);g.stroke();
 circ(x,y,R*.22,rgba('#0a0000',al));for(let i=0;i<3;i++){const b=rot+i*2.094,tx=x+Math.cos(b)*R*.62,ty=y+Math.sin(b)*R*.62;circ(tx,ty,R*.15,rgba('#0a0000',al));g.strokeStyle=rgba('#0a0000',al);g.lineWidth=R*.08;g.beginPath();g.arc(tx,ty,R*.24,b+1.6,b+3.1);g.stroke()}}
JFXD.sub_gshar=(f,k,e,t,u)=>{if(!u||u.dead)return;const h=P(u.x,u.y,98+e*10),R=(10+6*Math.min(1,e*4))*h.s,al=Math.min(1,k*3,e*8);subShar(h.x,h.y,R,t*(f.n?9:3),al);
 if(f.n){g.globalCompositeOperation='lighter';g.strokeStyle=rgba(SUB_GR,.7*k);g.lineWidth=2;g.beginPath();g.arc(h.x,h.y,R*(1.3+e*1.6),0,7);g.stroke()}};
// sommeil du regard : tomoe qui tournent autour de la tête de la cible
JFXD.sub_gspin=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const h=P(tg.x,tg.y,62),s=h.s,al=Math.min(1,k*4);for(let i=0;i<3;i++){const b=t*5+i*2.094,x=h.x+Math.cos(b)*14*s,y=h.y+Math.sin(b)*5*s;circ(x,y,3*s,rgba('#c8101e',al));circ(x,y,1.3*s,rgba('#0a0000',al))}};
// pas fantôme : sillage violet entre l'image et l'arrivée
JFXD.sub_gblink=(f,k,e)=>{const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30);g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle=rgba('#9a5ae0',.5*k);g.lineWidth=14*k;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle=rgba('#f0e0ff',.7*k);g.lineWidth=3*k;g.stroke();
 for(let i=0;i<8;i++){const m=i/7,x=lerp(a.x,b.x,m)+Math.sin(i*5)*9,y=lerp(a.y,b.y,m)+Math.cos(i*3)*7;circ(x,y,3*k+1,rgba('#e0c8ff',.7*k))}};
// copie prête : petit Sharingan au-dessus de ton ninja
STATD.push((u,p,S,sk)=>{if(u!==player||!u.sub_cpN||u.dead)return;const t=performance.now()/1000,y=p.y-104*S*(sk||1);g.save();subShar(p.x+22*S,y,6*S,t*2,.9);g.restore()});

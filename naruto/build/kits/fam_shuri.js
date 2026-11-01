// ===== Famille de sub f4 : Shurikenjutsu (armes de jet) =====
// Piège ninja (sub.js, allégé) · Fûma Shuriken (sub.js) · Multiclonage de shuriken (sub_nrp1.js) · Sôfûsha : Shuriken à fil (NOUVEAU) · Ronde des shuriken (NOUVEAU, d'après les Shuriken tournoyants du Fûma) ;
// dash : Kunai à fil (sub.js, sub_grap)
KIT('f4',[
 ['D','x.sub_wire','Piège ninja','Tend un fil presque invisible : l\'ennemi qui le franchit reçoit une volée de kunai (12 dégâts) et est étourdi 0,4 s','steel'],
 ['C','x.sub_fuma','Fûma Shuriken','Shuriken géant perçant qui revient vers toi (12 dégâts) : touchée à l\'aller et au retour, la cible est ralentie','shuriken'],
 ['B','x.sub_kshu','Multiclonage de shuriken','Un shuriken qui se multiplie en éventail de 12 : plus l\'ennemi est proche, plus il en prend (5 au plus, 9 dégâts puis 5) ; à partir du 3e, il est ralenti','shuriken'],
 ['A','x.sub_sofu','Sôfûsha : Shuriken à fil','Trois shuriken reliés par un fil d\'acier (8 dégâts chacun) : l\'ennemi pris entre deux (fil ou deux shuriken) est ligoté 1 s','steel'],
 ['S','x.sub_ronde','Shuriken Kaiten : Ronde des shuriken','6 grands shuriken tournent autour de toi 3 s : ils arrêtent les tirs ennemis et entaillent au contact (6 dégâts) ; relance : ils partent tous sur la visée (9 dégâts chacun), le dernier étourdit 0,8 s','shuriken'],
]);
DASHF[4]={src:'x.sub_grap',n:'Kunai à fil',d:'Kunai à fil : te tire jusqu\'au point d\'impact ; sur un ennemi, finit par un coup de pied étourdissant',vfx:'kunai',cd:7};
const SUB_ST='#d8dde6';
Object.assign(NAT,{
 // --- Sôfûsha : 3 shuriken en éventail, deux fils tendus entre eux (gauche-milieu, milieu-droite) ; franchir un fil = ligoté
 sub_sofu:S_('Sôfûsha : Shuriken à fil','Trois shuriken reliés par un fil qui ligote',13,{hero:'padme',line:{len:430,w:120},ai:RG(400,.6,60)},(u,a)=>{u.thrT=.2;anim(u,'throw2',.4);S('saber',u);S('deflect',u);const L=[];
  const X={type:'sub_sofu',x:u.x,y:u.y,a:a+Math.PI/2,len:0,r:0,k:0,t:.7,m:.7,team:u.team,owner:u,L,B:new Set(),H:new Map()};
  for(const d of[-.17,0,.17]){proj(u,a+d,{spd:760,r:9,dmg:8,life:.58,col:SUB_ST,vfx:'shuriken',kind:'sub_kbig',pierce:1,onHit:(q,t)=>{const n=(X.H.get(t)||0)+1;X.H.set(t,n);if(n>=2)subSofBind(X,t)}});L.push(projs[projs.length-1])}
  aux.push(X)}),
 // --- Ronde des shuriken : orbite 3 s (relance par u.jst) ; relance ou fin = la volée part
 sub_ronde:S_('Shuriken Kaiten : Ronde des shuriken','Shuriken en orbite qui arrêtent les tirs ; relance : volée',22,{hero:'padme',ai:{mode:'gap',min:60,max:420,p:.6}},(u,a)=>{const i=subIdx(u,'sub_ronde'),X=aux.find(x=>x.type==='sub_ronde'&&x.owner===u&&x.t>0&&!x.done);
  if(X&&u.jst&&u.jst.key==='sub_ronde'){u.cds[i]=u.jst.cd;u.jst=null;subRondeFire(X,a);return}
  S('saber',u);S('dash',u);anim(u,'spin',.5);for(const x of aux)if(x.type==='sub_ronde'&&x.owner===u)x.t=0;
  aux.push({type:'sub_ronde',x:u.x,y:u.y,r:58,t:3,m:3,team:u.team,owner:u,ui:units.indexOf(u),n:6,k:.4,hs:new Map()});jx({jfx:'sub_rburst',x:u.x,y:u.y,r:70,t:.35,m:.35});
  if(i>0){if(u.jst&&u.jst.key!=='sub_ronde')u.cds[u.jst.i]=u.jst.cd;u.jst={key:'sub_ronde',i,n:1,t:3,cd:u.ch.abil[i].cd,v:'shuriken'};u.cds[i]=.35}}),
});
// la volée : les shuriken restants partent l'un après l'autre (visée du lanceur, ou ennemi le plus proche pour une fin de durée)
function subRondeFire(x,a){const u=x.owner;if(x.done||!u||u.dead)return;x.done=1;const n=x.n|0;x.n=0;x.t=0;if(n<=0)return;S('saber',u);anim(u,'throw2',.35);
 let k=0;seqs.push({owner:u,n,t:.01,iv:.06,vfx:'shuriken',f:o=>{k++;const b=a!=null?o.aim:(()=>{const e=nearE(o,o.x,o.y,520);return e?ang(o,e):o.aim})(),j=(k%3-1)*.06,last=k===n;
  proj(o,b+j,{x:o.x+Math.cos(b)*30,y:o.y+Math.sin(b)*30,spd:920,r:last?12:10,dmg:9,life:.6,col:SUB_ST,vfx:'shuriken',kind:'sub_kbig',o:last?{stun:.8}:{}})}})}
// ---------- logique (hôte) ----------
AUXF.sub_sofu=x=>{const u=x.owner,L=x.L.filter(p=>p&&!p.dead&&p.life>0);if(!u||u.dead||L.length<2){x.t=0;return}const [p0,p1,p2]=x.L,A=[];
 if(p1&&!p1.dead&&p1.life>0){x.x=p1.x;x.y=p1.y}else{x.x=(L[0].x+L[1].x)/2;x.y=(L[0].y+L[1].y)/2}
 for(const [p,q] of[[p0,p1],[p1,p2]])if(p&&q&&!p.dead&&!q.dead&&p.life>0&&q.life>0)A.push([p,q]);
 if(p0&&p2&&!p0.dead&&!p2.dead){const dx=p2.x-p0.x,dy=p2.y-p0.y;x.len=Math.hypot(dx,dy)/2;x.a=Math.atan2(dy,dx);const mx=(p0.x+p2.x)/2,my=(p0.y+p2.y)/2;x.k=Math.hypot(x.x-mx,x.y-my)}
 for(const e of enemies(u)){if(x.B.has(e)||e.dead)continue;for(const [p,q] of A){const dx=q.x-p.x,dy=q.y-p.y,D2=dx*dx+dy*dy||1,f=clamp(((e.x-p.x)*dx+(e.y-p.y)*dy)/D2,0,1);
   if(f>.05&&f<.95&&Math.hypot(e.x-(p.x+dx*f),e.y-(p.y+dy*f))<e.r+4){subSofBind(x,e);break}}}};
// ligoté (une fois par volée) : pris par le fil, ou touché par deux shuriken de la volée
function subSofBind(x,e){if(x.B.has(e)||e.dead)return;x.B.add(e);const u=x.owner,V=VFX;VFX='steel';if(hit(e,u,0,{root:1,silent:1,unblockable:1})&&e.unstop<=0){say(e,'LIGOTÉ','#e8ecf2');jx({jfx:'sub_sofbind',ti:units.indexOf(e),x:e.x,y:e.y,t:1,m:1})}VFX=V}
AUXF.sub_ronde=x=>{const o=x.owner;if(!o||o.dead){x.t=0;return}x.x=o.x;x.y=o.y;if(x.done)return;
 if(x.n>0)for(const p of projs){if(p.dead||p.life<=0||p.grenade||!p.owner||p.owner.team===x.team)continue;if(Math.abs(p.x-x.x)>x.r+p.r+8||Math.hypot(p.x-x.x,p.y-x.y)>x.r+p.r+8)continue;
  if(!(p.big||p.rocket))p.life=0,p.dead=1,p.boom=1;x.n--;if(near(p.x,p.y)){sparks(p.x,p.y,SUB_ST,7,'kunai');S('deflect',o)}jx({jfx:'sub_rburst',x:p.x,y:p.y,r:24,t:.25,m:.25});if(x.n<=0){x.t=0;break}}
 if(x.k<=0&&x.n>0){x.k=.5;const V=VFX;VFX='shuriken';for(const e of enemies(o))if(Math.hypot(e.x-x.x,e.y-x.y)<x.r+e.r+8)hit(e,o,6,{unblockable:1,fx:o.x,fy:o.y});VFX=V}
 // plus de relance possible (durée écoulée, jutsu retiré) : la volée part toute seule
 if(!(o.jst&&o.jst.key==='sub_ronde')&&x.m-x.t>.4){subRondeFire(x,null);return}if(x.t<=.03)subRondeFire(x,null)};
// ---------- visuels ----------
function subStar(L,fill,edge){g.beginPath();for(let i=0;i<4;i++){const a=i*Math.PI/2;g.lineTo(Math.cos(a)*L,Math.sin(a)*L);g.lineTo(Math.cos(a+.785)*L*.32,Math.sin(a+.785)*L*.32)}g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=edge;g.lineWidth=1.2;g.stroke();
 g.fillStyle='#23232c';g.beginPath();g.arc(0,0,L*.14,0,7);g.fill()}
// fils tendus : gauche → milieu → droite (x,y = shuriken du milieu, a = axe gauche-droite, len = demi-écart, k = recul des côtés)
AUXD.sub_sofu=(x,k,t)=>{if(!x.len)return;const ca=Math.cos(x.a),sa=Math.sin(x.a),bx=Math.cos(x.a-Math.PI/2),by=Math.sin(x.a-Math.PI/2),c=P(x.x,x.y,26);
 const L0=P(x.x-ca*x.len+bx*x.k,x.y-sa*x.len+by*x.k,26),R0=P(x.x+ca*x.len+bx*x.k,x.y+sa*x.len+by*x.k,26);g.save();g.lineCap='round';
 for(const [col,w] of[['rgba(30,30,40,.5)',2.6],['rgba(235,240,248,.95)',1.2]]){g.strokeStyle=col;g.lineWidth=w;g.beginPath();g.moveTo(L0.x,L0.y);g.lineTo(c.x,c.y);g.lineTo(R0.x,R0.y);g.stroke()}
 g.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<2;i++){const m=((t*3+i*.5)%1),A=i?R0:L0;g.fillRect(lerp(A.x,c.x,m)-1.5,lerp(A.y,c.y,m)-1.5,3,3)}g.restore()};
// ligoté : le fil s'enroule autour de la cible
JFXD.sub_sofbind=(f,k,e,t,u,tg)=>{if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0),s=q.s,al=Math.min(1,k*5,e*10);g.lineCap='round';
 for(let i=0;i<4;i++){const h=(18+i*10)*s;for(const [c,w] of[['rgba(30,30,40,.6)',2.6],[rgba('#eef2f8',al),1.2]]){g.strokeStyle=c;g.lineWidth=w*s;g.beginPath();g.ellipse(q.x,q.y-h,15*s,4.5*s,(i-1.5)*.25,0,7);g.stroke()}}
 g.save();g.translate(q.x+16*s,q.y-34*s);g.scale(s,s*.7);g.rotate(t*2);subStar(7,'#c8ccd4','#5a5e68');g.restore()};
AUXD.sub_ronde=(x,k,t)=>{const o=units[x.ui],c=o&&!o.dead?o:x,n=x.n|0;if(n<=0)return;const al=Math.min(1,x.t/.3,(x.m-x.t)/.15+.2);g.save();
 g.strokeStyle=rgba(SUB_ST,.22*al);g.lineWidth=1.5;g.setLineDash([5,7]);g.lineDashOffset=-t*50;gEll(c.x,c.y,x.r);g.stroke();g.setLineDash([]);
 for(let i=0;i<n;i++){const b=t*4.6+i*Math.PI*2/n,q=P(c.x+Math.cos(b)*x.r,c.y+Math.sin(b)*x.r,28+Math.sin(b*2+t)*5),pq=P(c.x+Math.cos(b-.5)*x.r,c.y+Math.sin(b-.5)*x.r,28);
  g.strokeStyle=rgba('#ffffff',.3*al);g.lineWidth=3*q.s;g.beginPath();g.moveTo(pq.x,pq.y);g.lineTo(q.x,q.y);g.stroke();g.save();g.globalAlpha*=al;g.translate(q.x,q.y);g.scale(q.s,q.s*.62);g.rotate(t*20+i);subStar(13,'#d0d4dc','#4a4e58');g.restore()}g.restore()};
JFXD.sub_rburst=(f,k,e)=>{const q=P(f.x,f.y,26);g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#eef2f8',.8*k);g.lineWidth=2.5*k+.5;g.beginPath();g.ellipse(q.x,q.y,f.r*(.4+e*.6)*q.s,f.r*(.4+e*.6)*q.s*.55,0,0,7);g.stroke();
 for(let i=0;i<8;i++){const b=i*.785,d=f.r*e*q.s;g.fillStyle=rgba('#ffffff',.8*k);g.fillRect(q.x+Math.cos(b)*d-1.2,q.y+Math.sin(b)*d*.55-1.2,2.4,2.4)}};

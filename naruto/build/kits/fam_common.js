// ===== Familles de sub (ninjas sans clan) : aides communes aux 8 familles (kits/fam_*.js) =====
// Un sans-clan prend jusqu'à 5 familles et 5 sub au total (1 par rang, toutes familles confondues) : voir TREES / POOLS.fam (nr_kits.js).
// Les mécaniques déjà écrites restent dans kits/sub.js, sub_nrp1.js, sub_nrp2.js, sub_naruto.js ; les anciennes lignes KIT('u',…) de ces fichiers sont ignorées.
// Règles de famille : les jutsu interdits ne coûtent que du chakra (DESIGN §13) ; chaque famille a son dash (DASHF[f], sans-clan seulement).
// la famille f est-elle prise par ce ninja (sans clan) ?
const subHasF=(u,f)=>!!(u&&u.ch&&u.ch.clan<0&&(u.ch.fam||[]).includes(f));
// rend le chakra et met une recharge courte (jutsu refusé : pas de cible, pas de marque…) ; i<0 : jutsu lancé hors barre (copie du Sharingan), rien à rendre
function subRefund(u,k,cd,msg,col){const i=subIdx(u,k);if(i>0){u.cds[i]=cd??1;u.energy=Math.min(100,u.energy+jcost(u.ch.abil[i]));const C=u.ch.abil[i].charges;if(C&&u.chg){u.chg[i]=Math.min(C,u.chg[i]+1);if(u.chg[i]>=C)u.cds[i]=0}}if(msg&&near(u.x,u.y))say(u,msg,col||'#ffffff')}
// TRAITS[-1] (trait « Nindô » des sans-clan, sub.js) : chaque famille y branche ses règles (chaînées, dans l'ordre de chargement)
function subTH(o){const T=TRAITS[-1];for(const k in o){const f0=T[k],f1=o[k];
 T[k]=k==='deal'||k==='take'?function(a,b,dmg,op){if(f0)dmg=f0.call(this,a,b,dmg,op);return dmg<0?dmg:f1(a,b,dmg,op)}:function(...A){if(f0)f0.apply(this,A);f1(...A)}}}
// ---------- leurres immobiles (Pas fantôme, Tremplin du clone) : un vrai ninja dessiné (porteur 'sub_decoy' de sub_nrp2.js), que les bots visent ----------
// o : {ghost (dessin fantôme), fin(x) (appelé quand il disparaît), k}
function subDecoy(u,x,y,t,o){o=o||{};const q=subFree({x,y},16),p=subCarrier(u,q.x,q.y,o.ghost?'sub_ghost':'sub_decoy',{life:t+.1,r:1,ox:u.aim||0,zapP:0});
 const D=Object.create(u);Object.assign(D,{x:q.x,y:q.y,vx:0,vy:0,dead:false,stealth:0,swing:0,cast:null,spin:null,flame:null,dash:null,z:0,phase:0,sub_eat:0,sub_dk:1});
 const X={type:'sub_fdk',x:q.x,y:q.y,r:0,t,m:t,team:u.team,owner:u,p,D,fin:o.fin||null,n:o.ghost?1:0};aux.push(X);for(const e of units)if(e.team!==u.team&&e.tgt===u)e.tgt=D;return X}
AUXF.sub_fdk=x=>{const u=x.owner,p=x.p,D=x.D;if(!p||D.dead){x.t=0;return}
 const end=hit=>{if(D.dead)return;D.dead=true;p.life=0;x.t=0;subPoof(p.x,p.y,x.n?30:40,u);if(hit&&near(p.x,p.y))say(D,x.n?'MIRAGE !':'BUNSHIN !',x.n?'#d8b0ff':'#eceff4');if(x.fin)try{x.fin(x,hit)}catch(e){console.error(e)}};
 if(u.dead||x.t<=.03||p.life<=0){end(0);return}
 for(const q of projs)if(q!==p&&q.life>0&&!q.grenade&&q.owner&&q.owner.team!==u.team&&Math.abs(q.x-p.x)<44&&Math.hypot(q.x-p.x,q.y-p.y)<q.r+18){if(!(q.big||q.rocket||q.pierce||q.dmg>20)){q.life=0;q.dead=1}end(1);return}
 for(const e of enemies(u)){const d=Math.hypot(e.x-p.x,e.y-p.y);if((e.swing>.1&&d<95&&angDiff(e.swingA,Math.atan2(p.y-e.y,p.x-e.x))<1.1)||(e.dash&&d<e.r+20)||(e.spin&&d<e.spin.r+16)){end(1);return}}
 D.x=p.x;D.y=p.y;x.x=p.x;x.y=p.y};
AUXD.sub_fdk=()=>{};
// fantôme : le ninja en transparence, bordé d'un halo violet qui ondule
PROJD.sub_ghost=(p,R,ra,t)=>{const T=t/1000;g.save();g.globalCompositeOperation='lighter';for(let i=0;i<2;i++){g.strokeStyle=rgba(i?'#e8d0ff':'#9a5ae0',.5-i*.2);g.lineWidth=2-i;g.beginPath();g.ellipse(0,0,(20+i*6+Math.sin(T*6+i)*2),(7+i*2),0,0,7);g.stroke()}
 for(let i=0;i<5;i++){const b=T*2+i*1.256,k=(T*1.4+i/5)%1;g.fillStyle=rgba('#c8a0ff',.5*(1-k));g.beginPath();g.arc(Math.cos(b)*14,-10-k*60,2,0,7);g.fill()}g.restore();
 g.save();g.globalAlpha*=.5+.12*Math.sin(T*9);PROJD.sub_decoy(p,R,ra,t);g.restore()};
AFTER.push(()=>{
 // les bots visent aussi les leurres immobiles (comme le clone-leurre de sub_nrp2.js)
 const PT=pickTarget;pickTarget=u=>{const b=PT(u);let dc=null,dd=mode==='battle'?800:1e9,ow=null;
  for(const x of aux)if(x.type==='sub_fdk'&&x.team!==u.team&&x.D&&!x.D.dead){const d=dist(u,x.D);if(d<dd){dd=d;dc=x.D;ow=x.owner}}
  return dc&&(!b||b===ow||dd<dist(u,b)+150)?dc:b}});

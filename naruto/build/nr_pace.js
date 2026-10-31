
// ---------- Ambiance NRP : combats plus longs et posés, chakra qui compte, soin commun à tous (H) ----------
// PV ×1,3 pour tous (dans mkNinja, sans toucher l'équilibre entre les kits) et attaques de base ×0,4 (M1K, appliqué par nr_bal.js) :
// depuis que les bots frappent vraiment au corps à corps (aiIn), le M1 faisait les deux tiers des dégâts et un duel durait ~17 s ;
// avec ces deux réglages, le chakra rare, la course plus lente et la mort subite repoussée, un duel 1v1 IA contre IA dure ~52 s (médiane, kits aléatoires)
const HPK=1.3,M1K=.4;
// chakra : une jauge pleine = 5 jutsu environ ; presque pas de régénération en combat ; R (maintenu) est LA façon de se recharger,
// mais on est immobile, on prend +20 % de dégâts et un coup franc brise la concentration ; à sec, le ninja est épuisé
const CK={spawn:100, // chakra au début d'une manche / à la réapparition
 regen:.8,regenOut:4,outT:5, // régénération passive par seconde : en combat / hors combat (aucun coup donné ni reçu depuis outT s)
 rate0:19,rate1:45,ramp:1.4, // recharge (R) : 19/s au début, monte à 45/s en 1,4 s de concentration
 vuln:1.2,brk:6,lock:.7, // en recharge : dégâts ×1,2 ; un coup de 6+ brise la concentration (pas de recharge pendant 0,7 s)
 exhIn:6,exhOut:25,exhSpd:.82,exhStam:.55,exhBlock:1.6, // épuisement : sous 6 de chakra (jusqu'à 25) : vitesse ×0,82, endurance ×0,55, garde ×1,6, pas de sprint
 aiLo:26,aiLoR:18,aiSafe:390,aiStop:250}; // IA : recharge sous 26-44 si aucun ennemi à moins de 390 (s'arrête s'il approche à 250)
const ckPm=u=>u.ch.pass==='energy'?1.5:1; // passif « Contrôle du chakra »
// au contact : marque le combat, brise la concentration (R) d'un ninja qui se recharge
function ckHit(t,src,dmg,o){t.cbT=SIMT;if(src&&src!==t)src.cbT=SIMT;
 if(t.chk&&dmg>=CK.brk&&src&&src.team!==t.team){t.chk=false;t.chkT=0;t.ckLock=CK.lock;if(near(t.x,t.y)){say(t,'CONCENTRATION BRISÉE','#8fd0ff');sparks(t.x,t.y,'#8fd0ff',10)}}}
// chaque image : recharge (R), régénération passive, épuisement
function ckTick(u,dt){if(u.dead)return;const pm=ckPm(u);if(u.ckLock>0)u.ckLock-=dt;
 if(u.chk){u.chkT=(u.chkT||0)+dt;const r=CK.rate0+(CK.rate1-CK.rate0)*Math.min(1,u.chkT/CK.ramp);u.energy=Math.min(100,u.energy+r*pm*dt)}else u.chkT=0;
 const oc=u.cbT==null||SIMT-u.cbT>CK.outT;u.energy=Math.min(100,u.energy+(oc?CK.regenOut:CK.regen)*pm*dt);
 if(!u.exh&&u.energy<CK.exhIn){u.exh=1;if(near(u.x,u.y)){say(u,'ÉPUISÉ','#8aa0c8');sparks(u.x,u.y,'#8aa0c8',8)}}else if(u.exh&&u.energy>=CK.exhOut)u.exh=0}
// « pas assez de chakra » : message (limité) et éclat de la case sur la barre de jutsu
function ckLack(u,i){if(u.ckMsg>SIMT)return;u.ckMsg=SIMT+.7;if(u===player||u.human)say(u,'CHAKRA INSUFFISANT ('+lbl.KeyR+')','#4ab0ff');if(u===player){ckFl.i=i;ckFl.t=performance.now()+450}}
const ckFl={i:-1,t:0};
// IA : se recharger quand c'est sûr (personne autour, ou l'adversaire est neutralisé / se recharge aussi)
function aiChk(u,dt){if(u.sub_sage>0)return false;const lo=u.aiCkLo||(u.aiCkLo=CK.aiLo+rnd()*CK.aiLoR),e=nearE(u,u.x,u.y,CK.aiSafe+250),d=e?dist(u,e):1e9,
  busy=e&&(e.stun>.5||e.sleepT<0||e.chk||e.root>.8||e.dead);
 if(u.chk)return u.energy<(u.aiCkTo||95)&&!(e&&d<(u.aiCkSt||CK.aiStop)&&!busy);
 if(u.energy>=lo){u.aiLowT=0;return false}u.aiLowT=(u.aiLowT||0)+dt; // à sec depuis longtemps sans fenêtre sûre : prend le risque plus près
 const safe=u.aiLowT>6?CK.aiStop-30:u.exh?CK.aiSafe-80:CK.aiSafe;
 if(!e||d>safe||(busy&&d>150)){if(threat(u))return false;u.aiCkSt=Math.min(CK.aiStop,safe-50);u.aiCkTo=(u.aiLowT>6?55:72)+rnd()*28;u.aiLowT=0;return true}return false}
// IA à court de chakra : prend ses distances pour pouvoir se recharger (sauf pour achever un adversaire)
const aiLow=u=>u.energy<(u.aiCkLo||CK.aiLo)&&!(u.sub_sage>0);
const aiPref=(u,e)=>aiLow(u)&&e.hp>e.max*.3?Math.max(u.ch.pref,CK.aiSafe+70):u.ch.pref;
// IA au corps à corps : s'approche jusqu'à l'allonge de son attaque de base (sinon elle tourne autour d'une cible immobile, entre l'allonge et pref+40, sans jamais frapper)
const aiIn=(u,p)=>{const l=u.ch.abil[0];return p<200&&l&&l.melee&&l.ai?Math.min(p+40,l.ai.max-8):p+40};
// IA : ne se met pas à sec sans raison (sauf pour fuir, se défendre ou achever) et garde de quoi lancer l'ultime quand il est presque prêt
function aiSave(u,i,h){if(h.mode==='esc'||h.mode==='def'||h.mode==='heal')return false;const c=jcost(u.ch.abil[i]),e=u.tgt;
 if(u.energy-c<CK.exhIn&&!(e&&!e.dead&&e.hp<e.max*.3))return true;const U=u.ch.abil[5];if(i===5||!U||u.cds[5]>3)return false;
 if(U.ai&&U.ai.mode==='exec'&&!(e&&!e.dead&&e.hp<e.max*.55))return false; // ultime d'exécution : on ne garde pas le chakra tant que la cible n'est pas entamée
 return u.energy-c<jcost(U)}
// HUD : chiffre de chakra, avertissement d'épuisement
function ckHud(p,x,y,w){const lo=p.energy<30,t=performance.now()/1000,cy=H-84;text(String(Math.floor(p.energy)),x+w+6,y+4,10,p.exh?'#ff8a8a':'#7fc4ff','left');if(p.dead)return;
 if(p.exh){g.fillStyle=rgba('#ff4a4a',.25+.2*Math.sin(t*8));g.fillRect(x,y,w,5);text(`ÉPUISÉ : plus lent, endurance lente · ${lbl.KeyR} maintenu = chakra`,W/2,cy,13,'#ff9a9a','center')}
 else if(p.chk)text(`Concentration du chakra… ${Math.floor(p.energy)} / 100`,W/2,cy,13,'#8fd0ff','center');
 else if(lo)text(`Chakra bas · ${lbl.KeyR} maintenu = chakra (immobile, à l'abri)`,W/2,cy,12,rgba('#8fd0ff',.65+.35*Math.sin(t*6)),'center','normal')}
// barre de jutsu : coût en chakra de chaque case, case grisée « CHAKRA » si la jauge ne suffit pas
function hudCost(p,ab,i,x,y,s,sh){if(!i)return;const c=jcost(ab);if(!c)return;const lack=p.energy<c;
 if(lack){g.fillStyle='rgba(20,40,110,.55)';g.fillRect(x,y,s,sh);if(p.cds[i]<=0)text('CHAKRA',x+s/2,y+44,10,'#7fb8ff','center')}
 {const fl=(ckFl.t-performance.now())/450;if(ckFl.i===i&&fl>0){g.strokeStyle=rgba('#4ab0ff',fl);g.lineWidth=4;g.strokeRect(x-2,y-2,s+4,sh+4)}}
 g.fillStyle=lack?'#5a1c1c':'#123a6a';g.beginPath();g.roundRect(x+3,y+3,26,13,4);g.fill();text(String(c),x+16,y+13,10,lack?'#ff8a8a':'#bfe4ff','center')}
// état visible : épuisé (sueur, souffle court, teinte terne)
STATD.push((u,p,S,sk)=>{if(!u.exh||u.dead)return;const t=performance.now()/1000;g.save();
 {const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,30*S);gr.addColorStop(0,'rgba(60,70,100,.35)');gr.addColorStop(1,'rgba(60,70,100,0)');g.fillStyle=gr;g.beginPath();g.ellipse(p.x,p.y,30*S,11*S,0,0,7);g.fill()}
 for(let i=0;i<3;i++){const k=(t*1.3+i/3)%1,x=p.x+(i-1)*13*S,y=p.y-(84-k*26)*S*(sk||1);g.fillStyle=rgba('#d8ecff',.95*(1-k));g.strokeStyle=rgba('#2a3a5a',.8*(1-k));g.lineWidth=1.2;g.beginPath();g.moveTo(x,y-5*S);g.quadraticCurveTo(x+3.2*S,y+1*S,x,y+2.6*S);g.quadraticCurveTo(x-3.2*S,y+1*S,x,y-5*S);g.fill();g.stroke()}
 {const k=(t*.9)%1,x=p.x+Math.cos(u.aim||0)*(10+k*14)*S,y=p.y-62*S*(sk||1)-k*8*S;g.fillStyle=rgba('#e8eef8',.45*(1-k));g.beginPath();g.arc(x,y,(3+k*5)*S,0,7);g.fill()}
 g.strokeStyle=rgba('#8aa0c8',.5+.2*Math.sin(t*5));g.lineWidth=2*S;g.setLineDash([4*S,4*S]);g.beginPath();g.ellipse(p.x,p.y,22*S,8*S,0,0,7);g.stroke();g.setLineDash([]);g.restore()});

// ---------- Soin (H) : sort commun à tous les ninjas (comme un sort d'invocateur) ----------
// soigne l'allié le plus proche du curseur à moins de 600 (toi-même si tu te vises ou si personne n'est à portée) :
// 25 % des PV max tout de suite + 8 % en 2 s ; 0,3 s d'incantation (un étourdissement l'interrompt), 60 s de recharge, sans chakra
const HLS={on:true,cd:60,cast:.3,pct:.25,reg:.08,regT:2,range:600};
function hlTarget(u,ax,ay){let b=u,bd=Math.hypot(ax-u.x,ay-u.y);for(const x of units)if(x!==u&&x.team===u.team&&!x.dead&&dist(u,x)<=HLS.range){const d=Math.hypot(ax-x.x,ay-x.y);if(d<bd){bd=d;b=x}}return b}
const hlCan=u=>HLS.on&&state==='fight'&&!u.dead&&!(u.hlCd>0)&&!(u.hlC>0)&&u.stun<=0&&!u.dash&&!u.cast&&!u.chan&&!u.spin&&!u.flame&&!(u.sleepT<0);
function hlTry(u,ax,ay){if(!hlCan(u))return false;const t=hlTarget(u,ax,ay);u.chk=false;u.hlC=HLS.cast;u.hlTg=t;u.aim=t===u?u.aim:ang(u,t);anim(u,'hl_heal',HLS.cast+.3);
 jx({jfx:'hl_cast',ui:units.indexOf(u),x:u.x,y:u.y,t:HLS.cast+.05,m:HLS.cast+.05});if(near(u.x,u.y))S('ignite',u);return true}
function hlFire(u){let t=u.hlTg;u.hlTg=null;if(!t||t.dead||t.team!==u.team||dist(u,t)>HLS.range+120)t=u;
 const r=gain(t,t.max*HLS.pct/HEALX,u);t.hlR=HLS.regT;t.hlRv=t.max*HLS.reg/HLS.regT;u.hlCd=HLS.cd;u.hlN=(u.hlN||0)+1;
 jx({jfx:'hl_heal',ui:units.indexOf(u),ti:units.indexOf(t),x:t.x,y:t.y,t:1.1,m:1.1});if(near(t.x,t.y)){say(t,'+'+Math.round(r)+' SOIN','#7dff9a');sparks(t.x,t.y,'#bfffd0',16);S('orb',t)}}
function hlTick(u,dt,active){if(u.hlCd>0)u.hlCd=Math.max(0,u.hlCd-dt);if(u.dead){u.hlC=0;u.hlR=0;return}
 if(u.hlR>0){u.hlR-=dt;gain(u,u.hlRv*dt/HEALX,u)}
 if(u.hlC>0){if(u.stun>0||u.sleepT<0||!active){u.hlC=0;u.hlTg=null;u.hlCd=Math.max(u.hlCd,3);if(u.anim&&u.anim.k==='hl_heal')u.anim=null;if(near(u.x,u.y))say(u,'SOIN INTERROMPU','#fc6')}
  else if((u.hlC-=dt)<=0){u.hlC=0;hlFire(u)}}}
// joueur (local ou ami en ligne : la touche H voyage dans la liste des touches pressées) : mémorisée 0,35 s
function hlInput(u,dt,I){if(I.p&&I.p.KeyH){if(u.hlCd>0&&(u===player||u.human)&&!(u.hlMsg>SIMT)){u.hlMsg=SIMT+.6;say(u,'SOIN : '+Math.ceil(u.hlCd)+' s','#9fdfaa')}else u.hlQ=.35}
 if(u.hlQ>0){u.hlQ-=dt;if(hlTry(u,I.ax,I.ay))u.hlQ=0}}
// IA : soigne un allié (ou soi) sous 35 % à portée, le plus mal en point d'abord
function hlAI(u){if(!hlCan(u)||rnd()>.65)return false;let b=null,bk=.35;for(const x of units)if(x.team===u.team&&!x.dead&&(x===u||dist(u,x)<=HLS.range)){const k=x.hp/x.max;if(k<bk){bk=k;b=x}}
 return b?hlTry(u,b.x,b.y):false}
// HUD : case du soin à droite de la barre de jutsu (touche, recharge en cercle, incantation)
function drawHealHud(p,x,y,sh){const s=60,rd=!(p.hlCd>0)&&HLS.on,cx=x+s/2,cy=y+sh/2-2;g.fillStyle='rgba(13,26,20,.92)';g.fillRect(x,y,s,sh);g.strokeStyle=rd?'#5fe08a':'#24402e';g.lineWidth=2;g.strokeRect(x,y,s,sh);
 g.save();if(rd){g.shadowColor='#7dff9a';g.shadowBlur=10}g.fillStyle=rd?'#7dff9a':'#3d6a4a';g.fillRect(cx-4,cy-12,8,24);g.fillRect(cx-12,cy-4,24,8);g.fillStyle=rd?'#ffffff':'#6a8a72';g.fillRect(cx-2,cy-10,4,20);g.fillRect(cx-10,cy-2,20,4);g.restore();
 if(p.hlCd>0){const k=Math.min(1,p.hlCd/HLS.cd);g.save();g.beginPath();g.rect(x,y,s,sh);g.clip();g.fillStyle='rgba(0,0,0,.62)';g.beginPath();g.moveTo(cx,cy);g.arc(cx,cy,48,-Math.PI/2,-Math.PI/2+k*Math.PI*2);g.closePath();g.fill();g.restore();text(String(Math.ceil(p.hlCd)),cx,cy+6,15,'#ffe81f')}
 if(p.hlC>0){g.fillStyle='#bfffd0';g.fillRect(x,y+sh-4,s*(1-p.hlC/HLS.cast),4)}
 text(lbl.KeyH||'H',x+6,y+14,12,rd?'#fff':'#889','left');text('Soin',x+s/2,y+sh+13,10,'#9fdfaa','center','normal')}
// effets : lueur dans les mains pendant l'incantation, puis rayon du lanceur vers la cible et colonne verte et blanche
JFXD.hl_cast=(f,k,e,t,u)=>{if(!u||u.dead)return;const q=P(u.x+Math.cos(u.aim)*14,u.y+Math.sin(u.aim)*14,40),s=q.s;g.globalCompositeOperation='lighter';
 const R=(8+e*16)*s,gr=g.createRadialGradient(q.x,q.y,0,q.x,q.y,R);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.4,rgba('#7dff9a',.7));gr.addColorStop(1,rgba('#2fbf5a',0));g.fillStyle=gr;g.beginPath();g.arc(q.x,q.y,R,0,7);g.fill();
 for(let i=0;i<6;i++){const a=i*1.047+t*5,r=(26-e*18)*s;g.fillStyle=rgba('#d8ffe0',.9);g.beginPath();g.arc(q.x+Math.cos(a)*r,q.y+Math.sin(a)*r*.7,1.8*s,0,7);g.fill()}
 const b=P(u.x,u.y,0);g.strokeStyle=rgba('#7dff9a',.6*e);g.lineWidth=2*s;g.beginPath();g.ellipse(b.x,b.y,(18+e*14)*s,(7+e*5)*s,0,0,7);g.stroke()};
JFXD.hl_heal=(f,k,e,t,u,tg)=>{const T=tg&&!tg.dead?tg:null,tx=T?T.x:f.x,ty=T?T.y:f.y,b=P(tx,ty,0),s=b.s;g.globalCompositeOperation='lighter';
 if(u&&T&&u!==T&&e<.55){const a=P(u.x,u.y,42),c=P(tx,ty,42),al=Math.min(1,(.55-e)/.2);g.lineCap='round';g.strokeStyle=rgba('#7dff9a',.55*al);g.lineWidth=10*s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(c.x,c.y);g.stroke();g.strokeStyle=rgba('#ffffff',.9*al);g.lineWidth=3*s;g.stroke();
  for(let i=0;i<5;i++){const m=(e*2.2+i/5)%1;g.fillStyle=rgba('#ffffff',al);g.beginPath();g.arc(a.x+(c.x-a.x)*m,a.y+(c.y-a.y)*m,3*s,0,7);g.fill()}}
 const H=120*s*Math.min(1,e*5),w=(26+8*Math.sin(t*9))*s*Math.min(1,k*2.2),gr=g.createLinearGradient(0,b.y-H,0,b.y);gr.addColorStop(0,'rgba(125,255,154,0)');gr.addColorStop(.6,rgba('#7dff9a',.35*k));gr.addColorStop(1,rgba('#ffffff',.6*k));
 g.fillStyle=gr;g.beginPath();g.ellipse(b.x,b.y-H/2,w,H/2,0,0,7);g.fill();
 for(let j=0;j<2;j++){const r=(16+e*46+j*14)*s;g.strokeStyle=rgba(j?'#ffffff':'#7dff9a',.85*k);g.lineWidth=(3-j)*s;g.beginPath();g.ellipse(b.x,b.y,r,r*.38,0,0,7);g.stroke()}
 for(let i=0;i<7;i++){const m=(e*1.4+i/7)%1,x=b.x+Math.sin(i*2.7)*22*s,y=b.y-(14+m*96)*s,z=(4+(i%3))*s;g.fillStyle=rgba(i%2?'#ffffff':'#9dffb4',.9*(1-m)*Math.min(1,k*3));g.fillRect(x-z/2,y-z*1.5,z,z*3);g.fillRect(x-z*1.5,y-z/2,z*3,z)}};
// geste 3D : main tendue vers la cible, l'autre forme un signe devant la poitrine, puis les bras s'ouvrent
ANIM.hl_heal=(P,e)=>{const k=Math.min(1,e/.3),o=e>.65?(e-.65)/.35:0;pz(P,'armR',-1.5*k+.5*o,0,.1+.5*o);pz(P,'foreR',-.15);pz(P,'armL',-1.1*k,0,-.5*k);pz(P,'foreL',-1.7*k);pz(P,'chest',.12*k,-.25*k);pz(P,'head',.05);P.root.y=-1.5*k};
// réseau : les amis voient la recharge du soin, l'incantation et l'épuisement
AFTER.push(()=>UK.push('hlCd','hlC','exh'));

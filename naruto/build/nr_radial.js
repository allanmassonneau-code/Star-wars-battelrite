// ===================== ROUE DES BARRES FAVORITES (touche B maintenue) : le combat continue, rien n'est mis en pause =====================
// Les barres se font dans la création du perso (1 à BARSMAX barres de 6, build v6 : ch.build.bars). En combat :
// B maintenu = la roue s'ouvre au milieu de l'écran (nom + 6 icônes de chaque barre, ✓ = équipée, cadre orange = surlignée) ;
// molette haut / bas = surligner la barre précédente / suivante (ZQSD, clics et 1-6 restent au ninja) ;
// B relâché = la barre surlignée est équipée si on a tourné la molette et qu'elle n'est pas déjà à l'écran (un simple appui sur B ne change rien) ; Échap = fermer sans rien changer.
// Le changement suit les règles de setBar (nr_bar.js) : les recharges suivent les jutsu, un jutsu qui entre attend au moins 2 s, un jutsu en cours n'est jamais coupé (« en attente »).
// En ligne, l'invité DEMANDE la barre n° i à l'hôte (barReq → {t:'eq',a:'fav',s:i}), qui valide avec sa copie du build et répond (BMUI.ack) ; la barre revient par l'instantané.
const RB={open:false,hi:0,moved:false,acc:0,t0:0,msg:'',msgC:'#8fe38f',msgT:0,flash:0};
const rbOk=()=>(state==='fight'||state==='countdown')&&!!player&&!!player.ch&&!!player.ch.jab&&barsOf(player).length>0;
// barre en attente : hôte / hors ligne = favPend (u.barQ) ; invité = la demande acceptée « en attente » (u.favQ) tant que l'instantané ne l'a pas mise à l'écran
function rbPend(){if(!player)return-1;if(!isGuest())return favPend(player);const L=barsOf(player),q=player.favQ;if(!Number.isInteger(q)||!L[q])return-1;if(barEq(L[q].b,player.ch.bar)){player.favI=q;player.favQ=null;return-1}return q}
// barre visée par défaut : celle en attente, sinon celle à l'écran
const rbBase=()=>{const p=rbPend();if(p>=0)return p;const c=favCur(player);return c>=0?c:0};
function rbSay(s,c,t){RB.msg=s;RB.msgC=c||'#8fe38f';RB.msgT=t||2.6}
const rbName=i=>{const q=barsOf(player)[i];return q?q.n:'Barre '+(i+1)};
function rbOpen(){RB.open=true;RB.hi=rbBase();RB.moved=false;RB.acc=0;RB.t0=performance.now()}
function rbClose(apply){if(!RB.open)return;RB.open=false;if(!apply||!RB.moved)return;const i=RB.hi,L=barsOf(player);if(!L[i])return;
 if(i===rbBase()&&(rbPend()>=0||favCur(player)===i))return; // déjà équipée (ou déjà demandée)
 const r=barReq(i),n=`« ${L[i].n} »`;RB.flash=performance.now();
 if(!r||!r.ok){rbSay(BARERR[r&&r.e]||'Refusé','#ff7a6a');return}
 if(r.net){rbSay('Demande envoyée à l\'hôte…','#c8b89a',3.2);return}
 if(r.pend){rbSay(`${n} en attente : équipée à la fin du jutsu en cours`,'#ffb347',3.4);return}
 rbSay(`${n} équipée`,'#8fe38f')}
// molette : un cran = une barre (pavé tactile : ≈ 60 px cumulés = une barre), au plus un cran toutes les RBW ms : un geste avec inertie ou une molette libre
// (des dizaines d'événements rapprochés) n'avance que d'une barre par geste court. Écoutée sur la fenêtre : marche aussi sur les bandes noires autour du canvas.
const RBW=140;
try{addEventListener('wheel',e=>{if(!RB.open||state==='menu')return;e.preventDefault();const n=barsOf(player).length;if(n<2)return;const now=performance.now();
 if(now-(RB.wT||0)>200)RB.acc=0;RB.wT=now;if(now-(RB.wS||0)<RBW){RB.acc=0;return}
 const dy=e.deltaMode?Math.sign(e.deltaY)*60:e.deltaY;RB.acc+=Math.abs(dy)>=40?Math.sign(dy)*60:dy;if(Math.abs(RB.acc)<60)return;
 const d=Math.sign(RB.acc);RB.acc=0;RB.wS=now;RB.hi=(RB.hi+d+n)%n;RB.moved=true},{passive:false})}catch(e){}
try{addEventListener('blur',()=>{if(RB.open)rbClose(false)})}catch(e){}
Object.assign(BMUI,{
 frame(dt){if(RB.msgT>0)RB.msgT-=dt;
  if(BARNET.wait&&performance.now()-BARNET.wait.t>3000){BARNET.wait=null;rbSay('L\'hôte ne répond pas','#ff7a6a')} // invité : pas de réponse en 3 s
  try{netBuildQ()}catch(e){}
  if(!rbOk()){if(RB.open&&RB.moved&&state!=='menu')rbSay('Manche terminée : barre non changée','#c8b89a');RB.open=false;BMUI.open=false;return}
  if(pressed.KeyB){delete pressed.KeyB;if(!quitOn&&!RB.open)rbOpen()}
  if(RB.open&&(quitOn||!keys.KeyB))rbClose(!quitOn); // B relâché : on équipe la barre surlignée
  if(RB.open){const n=barsOf(player).length;if(RB.hi>=n)RB.hi=0}
  BMUI.open=RB.open},
 esc(){if(RB.open){rbClose(false);BMUI.open=false;return true}return false},
 ack(r,w){if(!r)return;const n=w&&barsOf(player)[w.i]?`« ${barsOf(player)[w.i].n} »`:'La barre';
  if(!r.ok)rbSay(BARERR[r.e]||'Refusé par l\'hôte','#ff7a6a');else if(r.pend)rbSay(`${n} en attente : équipée à la fin du jutsu en cours`,'#ffb347',3.4);else rbSay(`${n} équipée`,'#8fe38f')},
 draw(){if(!rbOk()){if(state!=='menu'&&player)rbMsg();return}rbHud();if(RB.open)rbDraw()}});
// ---------- dessin ----------
// rappel au-dessus du HUD (barre à l'écran, n° / total, touche) + message bref du dernier changement + barre en attente
function rbMsg(){if(!(RB.msgT>0))return;const y=H-82;g.save();g.globalAlpha=Math.min(1,RB.msgT*2);const w=Math.min(560,(g.font=FNT(13,'bold'),g.measureText(RB.msg).width+34));rr({x:W/2-w/2,y:y-34,w,h:24},12,'rgba(14,10,8,.78)',RB.msgC,1.2);fitT(RB.msg,W/2,y-17,13,RB.msgC,w-20,'bold',9,'center');g.restore()}
function rbHud(){const L=barsOf(player),c=favCur(player),p=rbPend(),y=H-82;
 rbMsg();if(RB.open)return;
 const pn=p>=0?` · « ${L[p].n} » en attente…`:'';
 const s=L.length>1?`Barre « ${c>=0?L[c].n:'perso'} » ${c>=0?c+1:'–'}/${L.length}${pn} · ${lbl.KeyB} maintenu + molette : changer de barre`:`Barre « ${L[0].n} » · ajoute d'autres barres dans la création du perso (roue : ${lbl.KeyB})`;
 if(state==='fight'||state==='countdown')fitT(s,W/2,y,10.5,p>=0?'rgba(255,179,71,.9)':'rgba(159,179,217,.6)',760,'normal',8.5,'center')}
// place des cartes autour du centre : 1 en haut ; 2 haut / bas ; 3 en triangle ; 4 en croix (haut, droite, bas, gauche)
const RBC={w:262,h:84,cx:()=>W/2,cy:()=>H/2-20};
function rbPos(i,n){const cx=RBC.cx(),cy=RBC.cy();if(n===1)return{x:cx,y:cy-120};if(n===2)return{x:cx,y:cy+(i?120:-120)};
 const a=-Math.PI/2+i*2*Math.PI/n,rx=n===3?230:262,ry=n===3?118:132;return{x:cx+Math.cos(a)*rx,y:cy+Math.sin(a)*ry}}
function rbDraw(){const L=barsOf(player),n=L.length,cur=favCur(player),pd=rbPend(),cx=RBC.cx(),cy=RBC.cy(),t=performance.now()/1000,k=Math.min(1,(performance.now()-RB.t0)/120);
 g.save();g.globalAlpha=k;
 {const gr=g.createRadialGradient(cx,cy,40,cx,cy,420);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(cx-440,cy-300,880,600)}
 // rayon vers la barre surlignée
 {const P=rbPos(RB.hi,n);g.strokeStyle=rgba('#ffb347',.55);g.lineWidth=3;g.setLineDash([7,6]);g.lineDashOffset=-t*30;const a=Math.atan2(P.y-cy,P.x-cx);g.beginPath();g.moveTo(cx+Math.cos(a)*58,cy+Math.sin(a)*58);g.lineTo(P.x,P.y);g.stroke();g.setLineDash([])}
 // centre
 {g.save();g.shadowColor='#ff9a3a';g.shadowBlur=18;g.fillStyle='rgba(20,13,8,.92)';g.beginPath();g.arc(cx,cy,54,0,7);g.fill();g.restore();g.strokeStyle='#ff9a3a';g.lineWidth=2;g.beginPath();g.arc(cx,cy,54,0,7);g.stroke();
  text(lbl.KeyB||'B',cx,cy-10,24,'#ffb347','center');text(`${RB.hi+1} / ${n}`,cx,cy+12,12,'#f3d9b0','center');fitT(n>1?'molette':'1 seule barre',cx,cy+28,10,'#a89070',96,'normal',8,'center')}
 L.forEach((q,i)=>{const P=rbPos(i,n),hi=i===RB.hi,on=i===cur,pe=i===pd,s=hi?1.06:1,w=RBC.w*s,h=RBC.h*s,R={x:P.x-w/2,y:P.y-h/2,w,h};
  g.save();if(hi){g.shadowColor='#ffb347';g.shadowBlur=22}rr(R,12,hi?'rgba(60,38,18,.96)':'rgba(16,11,8,.9)',hi?'#ffb347':on?'#5fd35f':pe?'#ffb347':'rgba(140,100,60,.7)',hi?3:on?2:1.2);g.restore();
  // en-tête : n°, nom, état
  rr({x:R.x+8,y:R.y+7,w:20,h:18},5,hi?'#ffb347':'rgba(80,56,30,.95)');text(String(i+1),R.x+18,R.y+20.5,12,hi?'#1a1008':'#f3d9b0','center');
  const tag=on?'✓ équipée':pe?'en attente':'',tw=tag?(g.font=FNT(10.5,'bold'),g.measureText(tag).width+12):0;
  fitT(q.n,R.x+34,R.y+21,14,hi?'#fff3dc':'#ffd38a',R.w-48-tw,'bold',10);
  if(tag){rr({x:R.x+R.w-tw-8,y:R.y+8,w:tw,h:16},8,on?'rgba(40,110,40,.9)':'rgba(150,90,20,.9)');text(tag,R.x+R.w-tw/2-8,R.y+20,10.5,on?'#d8ffd0':'#ffe0b0','center')}
  // 6 icônes (rang, recharge restante : la recharge suit le jutsu, barre ou réserve)
  const cw=(R.w-16-5*5)/6;for(let s2=0;s2<BARN;s2++){const j=q.b[s2],ab=j>=0&&player.ch.jab[j],J=ab&&JL[j],C={x:R.x+8+s2*(cw+5),y:R.y+31,w:cw,h:R.h-38};
   rr(C,6,'rgba(13,19,32,.88)',J&&J.r==='S'?'#b89a3a':'#3a4a66',1);
   if(!J){text('·',C.x+C.w/2,C.y+C.h/2+5,13,'#5a6680','center');continue}
   jIcon(C.x+C.w/2,C.y+C.h/2,Math.min(13,C.h*.34),catCol(J.cat),J.cat,J.r==='S');text(J.r,C.x+C.w-4,C.y+11,9,RANKC[J.r]||'#cfd8ea','right');
   const rem=remCd(player,j);if(rem>0){g.fillStyle='rgba(0,0,0,.55)';g.beginPath();g.roundRect(C.x,C.y,C.w,C.h,6);g.fill();text(cdTxt(rem),C.x+C.w/2,C.y+C.h/2+5,12,'#ffe81f','center')}}});
 // aide
 {const s=n>1?`Molette : choisir · relâcher ${lbl.KeyB} : équiper la barre surlignée · Échap : annuler · le combat continue`:'Une seule barre : ajoutes-en (jusqu\'à '+BARSMAX+') dans la création du perso';
  const y=cy+(n===1?40:n===2?190:n===3?150:200);g.font=FNT(12,'bold');const w=Math.min(720,g.measureText(s).width+30);rr({x:cx-w/2,y:y-16,w,h:24},12,'rgba(14,10,8,.8)','rgba(255,154,58,.5)',1);fitT(s,cx,y+1,12,'#f3d9b0',w-20,'bold',9,'center')}
 g.restore()}

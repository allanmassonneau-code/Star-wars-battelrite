// ===================== MENU B EN COMBAT : changer sa barre de 6 jutsu sans pause (copie Zenkai) =====================
// Panneau à droite, semi-transparent ; le combat continue. Onglets ★ Favoris / Nature / Style / Clan (ou une famille de sub par onglet).
// Barre de 6 cases en haut : clic G = case cible, clic D = la vider (les suivantes glissent). Liste des jutsu APPRIS de l'onglet :
// clic G = posé dans la case cible ; survol + 1-6 = posé dans cette case (la touche ne lance rien). Étoile = favori (par perso, nrFav1).
// Toute action passe par barReq (nr_bar.js) : hors ligne / hôte = appliquée, invité = demandée à l'hôte (réponse : BMUI.ack).
// Les entrées consommées sont retirées de `pressed` (lmb, rmb, Digit/Numpad 1-6, KeyB) avant la simulation et l'envoi des touches de l'invité.
const BM={tab:0,tgt:-1,scroll:0,hov:-1,msg:'',msgC:'#ffd38a',msgT:0,okMsg:'',lockL:false,fav:null,favK:'',ck:null};
const BMP={x:W-436,y:82,w:420,h:556};
// onglets : ★ puis les arbres où le perso a au moins un jutsu appris (un sans-clan à 5 familles n'a pas d'onglet vide)
const bmTabs=()=>{if(!(player&&player.ch&&player.ch.build))return['fav'];const L=player.ch.learn||[];return['fav'].concat(treesOf(player.ch.build).filter(t=>L.some(j=>JL[j]&&JL[j].cat===t)))};
const bmOk=()=>state!=='menu'&&state!=='matchEnd'&&!!player&&!!player.ch&&!!player.ch.jab&&!!player.ch.learn;
const bmBar=()=>player.barQ&&!isGuest()?player.barQ:player.ch.bar||[];
// case cible : celle choisie au clic, sinon la 1re case libre, sinon (barre pleine) la case du jutsu de même rang que celui qu'on pose, sinon la case 1
const bmTgt=j=>{if(BM.tgt>=0&&BM.tgt<BARN)return BM.tgt;const b=bmBar(),i=b.indexOf(-1);if(i>=0)return i;
 if(j!=null&&JL[j]&&!b.includes(j)){const r=JL[j].r,k=b.findIndex(x=>x>=0&&JL[x]&&JL[x].r===r);if(k>=0)return k}return 0};
// favoris : lus une fois à l'ouverture (et après un changement), pas à chaque image
function bmFavSync(){const k=favKey();if(BM.fav&&BM.favK===k)return;BM.favK=k;const L=favLoad()[k];BM.fav=new Set(Array.isArray(L)?L:[])}
const bmIsFav=jid=>{bmFavSync();return BM.fav.has(jKey(jid))};
function bmList(){const t=bmTabs()[BM.tab]||'fav',L=player.ch.learn.filter(j=>JL[j]&&player.ch.jab[j]&&(t==='fav'?bmIsFav(j):JL[j].cat===t));
 return L.sort((a,b)=>RANKO.indexOf(JL[a].r)-RANKO.indexOf(JL[b].r)||(t==='fav'?bmTabs().indexOf(JL[a].cat)-bmTabs().indexOf(JL[b].cat):0)||a-b)}
// géométrie
const bmClose=()=>({x:BMP.x+BMP.w-36,y:BMP.y+8,w:28,h:26});
function bmTabR(){const T=bmTabs(),x0=BMP.x+10,w=BMP.w-20,gap=4,tw=(w-gap*(T.length-1))/T.length;return T.map((t,i)=>({x:x0+i*(tw+gap),y:BMP.y+40,w:tw,h:28,t}))}
const bmSlotR=s=>{const w=(BMP.w-20-5*6)/6;return{x:BMP.x+10+s*(w+6),y:BMP.y+90,w,h:58}};
const BML={y:BMP.y+192,rh:46,gap:4},bmLH=()=>BMP.y+BMP.h-30-BML.y;
const bmMax=n=>Math.max(0,n*(BML.rh+BML.gap)-BML.gap-bmLH());
const bmRowR=i=>({x:BMP.x+10,y:BML.y+i*(BML.rh+BML.gap)-BM.scroll,w:BMP.w-30,h:BML.rh});
const bmStarR=R=>({x:R.x+4,y:R.y+R.h/2-12,w:24,h:24});
const bmOver=()=>BMUI.open&&inRect(mouse,BMP);
// menu ouvert : la caméra se décale vers la droite (le centre de la vue passe au milieu de la partie libre de l'écran) pour que le panneau ne cache pas l'adversaire
function bmCamOff(){if(!BMUI.open||!player)return 0;try{return(W-BMP.x)/2/Math.max(.2,scl(cam.y)*ZM())}catch(e){return 0}}
function bmSay(s,c,keep){BM.msg=s;BM.msgC=c||'#ffd38a';BM.msgT=keep?6:2.6}
// réponse locale (hors ligne / hôte) ou accusé d'envoi (invité)
function bmRes(r,okMsg){if(!r)return;if(!r.ok){bmSay(BARERR[r.e]||'Refusé','#ff7a6a');return}
 if(r.net){BM.okMsg=okMsg;bmSay('Demande envoyée à l\'hôte…','#c8b89a',1);return}
 if(r.pend){bmSay(okMsg+' · à la fin du jutsu en cours','#ffb347',1);return}
 bmSay(okMsg,'#8fe38f')}
function bmEquip(jid,s){const J=JL[jid];if(!J)return;const b=bmBar(),t=b.indexOf(jid),N=jName(jid);
 const m=t>=0&&t!==s?`Échange : ${N} en case ${s+1}`+(b[s]>=0&&JL[b[s]]?`, ${jName(b[s])} en case ${t+1}`:''):`${N} → case ${s+1}`+(t<0&&b[s]>=0&&JL[b[s]]?` (remplace ${jName(b[s])})`:'');
 const r=barReq('set',jid,s);bmRes(r,m);if(r&&r.ok&&s===BM.tgt)BM.tgt=-1}
function bmDel(s){const b=bmBar(),n=b[s]>=0&&JL[b[s]]?jName(b[s]):'';const r=barReq('del',null,s);bmRes(r,n?`${n} retiré de la case ${s+1}`:`Case ${s+1} vidée`);if(r&&r.ok&&BM.tgt===s)BM.tgt=-1}
function bmOpen(v){BMUI.open=v;BM.hov=-1;BM.lockL=false;if(v){BM.fav=null;BM.tgt=-1;const n=bmTabs().length;if(BM.tab>=n)BM.tab=0;
  if(BM.tab===0&&!bmList().length)BM.tab=Math.min(1,n-1)}} // pas de favori : l'onglet de la nature (ou du style)
const BMD=[1,2,3,4,5,6];
Object.assign(BMUI,{
 frame(dt){if(BM.msgT>0)BM.msgT-=dt;
  if(BARNET.wait&&performance.now()-BARNET.wait.t>3000){BARNET.wait=null;bmSay('L\'hôte ne répond pas','#ff7a6a')} // invité : pas de réponse en 3 s
  if(!bmOk()){if(BMUI.open)bmOpen(false);return}
  if(pressed.KeyB){delete pressed.KeyB;if(!quitOn)bmOpen(!BMUI.open)}
  if(quitOn&&BMUI.open)bmOpen(false);
  if(!BMUI.open)return;
  if(!mouse.l)BM.lockL=false;
  const over=bmOver(),L=bmList();BM.scroll=clamp(BM.scroll,0,bmMax(L.length));
  // jutsu survolé
  BM.hov=-1;if(over&&inRect(mouse,{x:BMP.x,y:BML.y,w:BMP.w,h:bmLH()}))L.forEach((j,i)=>{if(inRect(mouse,bmRowR(i)))BM.hov=j});
  // survol d'un jutsu + 1-6 : posé dans cette case, la touche ne lance rien
  if(BM.hov>=0)for(const k of BMD){const a='Digit'+k,b='Numpad'+k;if(pressed[a]||pressed[b]){delete pressed[a];delete pressed[b];bmEquip(BM.hov,k-1)}}
  if(over&&pressed.lmb){delete pressed.lmb;BM.lockL=true;bmClick(L)}
  if(over&&pressed.rmb){delete pressed.rmb;for(let s=0;s<BARN;s++)if(inRect(mouse,bmSlotR(s)))bmDel(s);
   if(BM.hov>=0){const s=bmBar().indexOf(BM.hov);if(s>=0)bmDel(s)}}},
 mask(){return BMUI.open&&(BM.lockL||inRect(mouse,BMP))},
 esc(){if(BMUI.open){bmOpen(false);return true}return false},
 ack(r){if(!r)return;if(!r.ok)bmSay(BARERR[r.e]||'Refusé par l\'hôte','#ff7a6a');else if(r.pend)bmSay((BM.okMsg||'Accepté')+' · à la fin du jutsu en cours','#ffb347');else bmSay(BM.okMsg||'Accepté par l\'hôte','#8fe38f')},
 draw(){if(!bmOk())return;if(!BMUI.open){bmHint();return}TIP=null;bmDraw();drawTip()}});
function bmClick(L){if(inRect(mouse,bmClose())){bmOpen(false);return}
 const T=bmTabR();for(let i=0;i<T.length;i++)if(inRect(mouse,T[i])){if(BM.tab!==i){BM.tab=i;BM.scroll=0}return}
 for(let s=0;s<BARN;s++)if(inRect(mouse,bmSlotR(s))){BM.tgt=s;return}
 const mx=bmMax(L.length);if(mx>0&&inRect(mouse,{x:BMP.x+BMP.w-18,y:BML.y,w:16,h:bmLH()})){BM.scroll=clamp((mouse.y-BML.y)/bmLH(),0,1)*mx;return}
 if(!inRect(mouse,{x:BMP.x,y:BML.y,w:BMP.w,h:bmLH()}))return;
 for(let i=0;i<L.length;i++){const R=bmRowR(i);if(!inRect(mouse,R))continue;
  if(inRect(mouse,bmStarR(R))){const on=favToggle(L[i]);BM.fav=null;bmSay(on?`${jName(L[i])} ajouté aux favoris`:`${jName(L[i])} retiré des favoris`,'#ffd38a');return}
  bmEquip(L[i],bmTgt(L[i]));return}}
try{cv.addEventListener('wheel',e=>{if(state!=='menu'&&BMUI.open&&inRect(mouse,BMP)){BM.scroll+=e.deltaY*(e.deltaMode?40:1);e.preventDefault()}},{passive:false})}catch(e){}
// petit rappel au-dessus du HUD quand le menu est fermé
function bmHint(){if(state==='fight'||state==='countdown')text(`${lbl.KeyB} : changer la barre (sans pause)`,W/2,H-80,10.5,'rgba(159,179,217,.55)','center','normal')}
// --- dessin
// ennemis qui passent sous le panneau : repérés par-dessus (anneau rouge, nom, PV) et le panneau devient plus transparent
function bmUnder(){const o=[];for(const u of units){if(u.dead||u.team===player.team)continue;let q;try{q=P(u.x,u.y)}catch(e){continue}if(q.x>BMP.x-10&&q.x<BMP.x+BMP.w+10&&q.y>BMP.y-20&&q.y<BMP.y+BMP.h+60)o.push([u,q])}
 return o.sort((a,b)=>Math.hypot(a[0].x-player.x,a[0].y-player.y)-Math.hypot(b[0].x-player.x,b[0].y-player.y)).slice(0,10)}
function bmMarks(U,t){for(const [u,q] of U){const s=Math.max(.6,q.s||1),r=26*s,y=Math.min(q.y,BMP.y+BMP.h-6);g.save();g.strokeStyle=rgba('#ff4040',.75+Math.sin(t*8)*.2);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,y,r,r*.45,0,0,7);g.stroke();
  g.fillStyle='rgba(0,0,0,.6)';g.fillRect(q.x-26,y-86*s,52,6);g.fillStyle='#ff5050';g.fillRect(q.x-26,y-86*s,52*Math.max(0,u.hp/u.max),6);g.restore();
  g.strokeStyle=rgba('#ff4040',.6);g.lineWidth=1.5;g.beginPath();g.moveTo(q.x,y-80*s);g.lineTo(q.x,y-6);g.stroke();text(u.ch.name,q.x,y-92*s,11,'#ffb0a0','center')}}
function bmDraw(){const P=BMP,b=player.ch.bar||[],tg=bmTgt(BM.hov>=0?BM.hov:null),L=bmList(),T=bmTabs(),cur=T[BM.tab]||'fav',t=performance.now()/1000,UN=bmUnder();
 g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=18;rr(P,12,UN.length&&!inRect(mouse,P)?'rgba(14,10,8,.45)':'rgba(14,10,8,.72)','rgba(255,154,58,.55)',1.5);g.restore();
 // en-tête
 text('BARRE DE JUTSU',P.x+14,P.y+25,15,'#ffb347','left');text('le combat continue',P.x+152,P.y+25,10.5,'#a89070','left','normal');
 {const R=bmClose(),h=inRect(mouse,R);rr(R,7,h?'#ff9a3a':'rgba(50,34,20,.9)','#8a5a2a');text('✕',R.x+R.w/2,R.y+18,14,h?'#1a1008':'#f3d9b0')}
 text(`${lbl.KeyB} / Échap`,P.x+P.w-44,P.y+24,10,'#8a7458','right','normal');
 // onglets
 bmTabR().forEach((R,i)=>{const on=i===BM.tab,h=inRect(mouse,R),tr=R.t,col=tr==='fav'?'#ffc53a':catCol(tr);
  rr(R,8,on?rgba(col,.85):h?'rgba(90,60,30,.85)':'rgba(30,20,12,.8)',on?'#ffe0a0':rgba(col,.6),on?1.5:1);
  const fg=on?(lum(col)>.5?'#1a1008':'#fff'):'#f3d9b0',nm=tr==='fav'?'Favoris':catName(tr),n=tr==='fav'?player.ch.learn.filter(bmIsFav).length:player.ch.learn.filter(j=>JL[j]&&JL[j].cat===tr).length;
  if(tr==='fav'){text('★',R.x+(R.w>70?16:R.w/2),R.y+19,14,on?'#1a1008':'#ffc53a',R.w>70?'center':'center');if(R.w>70)fitT(`${nm} ${n}`,R.x+28,R.y+18.5,11.5,fg,R.w-32,'bold',8)}
  else{const ic=R.w>70;jIcon(ic?R.x+14:R.x+R.w/2,R.y+14,8,col,tr);if(ic)fitT(`${nm} ${n}`,R.x+26,R.y+18.5,11.5,fg,R.w-30,'bold',8)}
  if(h)hoverTip('bmt'+i,()=>({ax:BMP.x,t:tr==='fav'?'★ Favoris':catName(tr),col,d:tr==='fav'?'Tes jutsu marqués d\'une étoile (gardés pour ce perso, dans ce navigateur).':`${n} jutsu appris dans cet arbre.`}))});
 // barre de 6 cases
 text('CLIC : CASE CIBLE · CLIC D : VIDER',P.x+P.w/2,P.y+84,9.5,'#9a8060','center','normal');
 for(let s=0;s<BARN;s++){const R=bmSlotR(s),j=b[s],ab=j>=0&&player.ch.jab[j],J=ab&&JL[j],on=s===tg,h=inRect(mouse,R),cd=player.cds[BAR0+s]||0,hv=BM.hov>=0&&b[s]===BM.hov;
  rr(R,8,h?'rgba(70,46,24,.92)':'rgba(13,19,32,.85)',on?'#ffe81f':hv?'#6fe36f':J&&J.r==='S'?'#b89a3a':'#3a4a66',on?2.5:1.5);
  if(on){g.fillStyle='#ffe81f';g.beginPath();g.moveTo(R.x+R.w/2-6,R.y-7);g.lineTo(R.x+R.w/2+6,R.y-7);g.lineTo(R.x+R.w/2,R.y-1);g.closePath();g.fill()}
  text(lbl['Digit'+(s+1)]||String(s+1),R.x+8,R.y+15,12,on?'#ffe81f':'#cfd8ea','left');
  if(!ab){text('vide',R.x+R.w/2,R.y+38,10,'#5a6680','center','normal')}
  else{jIcon(R.x+R.w/2+6,R.y+24,12,catCol(J.cat),J.cat,J.r==='S');text(J.r,R.x+R.w-7,R.y+15,11,RANKC[J.r]||'#cfd8ea','right');fitT(jShort(ab.n),R.x+R.w/2,R.y+R.h-6,10,'#d8e0f0',R.w-4,'normal',8.5,'center');
   if(cd>0&&ab.cd>0){const k=Math.min(1,cd/ab.cd);g.fillStyle='rgba(0,0,0,.55)';g.fillRect(R.x+1,R.y+1+(R.h-2)*(1-k),R.w-2,(R.h-2)*k);text(cd.toFixed(1),R.x+R.w/2+6,R.y+29,12,'#ffe81f')}}
  if(h)hoverTip('bms'+s,()=>({ax:BMP.x,t:ab?`Case ${s+1} : ${ab.n}`:`Case ${s+1} (vide)`,col:J?catCol(J.cat):'#9fb3d9',l:ab?[[`${catName(J.cat)} · rang ${J.r} · ${jcostT(ab)} · ${fmtCd(ab.cd)}`,J?catCol(J.cat):'#d8b888']]:[],d:ab?ab.d||' ':'Aucun jutsu dans cette case.',f:'Clic G : choisir comme case cible · clic D : vider (les suivantes glissent)'}))}
 // ligne de statut
 {const y=P.y+168,pend=player.barQ&&!isGuest(),wait=isGuest()&&BARNET.wait&&performance.now()-BARNET.wait.t<3000;
  rr({x:P.x+10,y:y-14,w:P.w-20,h:20},6,'rgba(0,0,0,.35)');
  const s=BM.msgT>0?BM.msg:wait?'Demande envoyée à l\'hôte…':pend?'Changement en attente : il s\'applique à la fin du jutsu en cours':`Cible : case ${tg+1} · clic sur un jutsu pour l'y poser`,c=BM.msgT>0?BM.msgC:wait?'#c8b89a':pend?'#ffb347':'#c8b89a';
  g.globalAlpha=BM.msgT>0?Math.min(1,BM.msgT*2):1;fitT(s,P.x+P.w/2,y,11.5,c,P.w-34,'bold',8.5,'center');g.globalAlpha=1}
 // titre de l'onglet
 {const nm=cur==='fav'?'★ Favoris':catName(cur);fitT(nm.toUpperCase(),P.x+14,BML.y-6,10,cur==='fav'?'#ffc53a':liftC(catCol(cur),.55),200,'bold',8);
  text('rang · chakra · recharge',P.x+P.w-20,BML.y-6,9.5,'#8a7458','right','normal')}
 // liste
 const lh=bmLH(),mx=bmMax(L.length);g.save();g.beginPath();g.rect(P.x+6,BML.y-2,P.w-12,lh+4);g.clip();
 if(!L.length)wrapL(cur==='fav'?'Aucun favori : clique l\'étoile ☆ d\'un jutsu dans un autre onglet pour l\'ajouter ici.':'Aucun jutsu appris dans cet arbre (choisis-les dans la création du perso).',P.w-60,FNT(12)).forEach((l,i)=>text(l,P.x+P.w/2,BML.y+30+i*17,12,'#a89070','center','normal'));
 L.forEach((j,i)=>{const R=bmRowR(i);if(R.y+R.h<BML.y-2||R.y>BML.y+lh+2)return;const J=JL[j],ab=player.ch.jab[j],s=b.indexOf(j),eq=s>=0,h=BM.hov===j,col=catCol(J.cat),rem=remCd(player,j),fv=bmIsFav(j),gold=J.r==='S';
  rr(R,8,h?'rgba(74,48,24,.92)':eq?'rgba(22,44,22,.82)':'rgba(24,17,11,.82)',eq?'#5fd35f':h?'#c08040':'rgba(90,60,30,.7)',eq?2:1);
  {const S=bmStarR(R),hs=inRect(mouse,S);text(fv?'★':'☆',S.x+S.w/2,S.y+18,17,fv?'#ffc53a':hs?'#ffe0a0':'#6a5a48','center')}
  jIcon(R.x+44,R.y+R.h/2,13,col,J.cat,gold);
  const x=R.x+64,nw=R.w-64-118;fitT(ab.n,x,R.y+18,13,gold?'#ffe81f':'#ffd38a',nw,'bold',9);
  rankBadge(x,R.y+25,J.r,40);text(`${jcost(ab)}`,x+56,R.y+39,11.5,'#7fc8ff','left');g.font=FNT(11.5,'bold');const cw=g.measureText(String(jcost(ab))).width;
  text('ck',x+58+cw,R.y+39,9.5,'#5a90c0','left','normal');text(`⟳ ${fmtCd(ab.cd)}`,x+78+cw,R.y+39,11,'#d8b888','left','normal');
  // recharge restante en direct (barre ou stash)
  const rx=R.x+R.w-64;if(rem>0){text(rem.toFixed(1)+' s',rx,R.y+21,13,'#ffb347','center');text('recharge',rx,R.y+34,8.5,'#9a8060','center','normal')}else{text('prêt',rx,R.y+25,12,'#8fe38f','center');if(ab.mud)text(`${ab.mud} mudras`,rx,R.y+37,8.5,'#9a8060','center','normal')}
  // n° de case
  const sb={x:R.x+R.w-34,y:R.y+7,w:28,h:R.h-14};if(eq){rr(sb,6,'#3aa83a','#9fffa0',1);text(String(s+1),sb.x+sb.w/2,sb.y+21,16,'#0c1a0c')}else rr(sb,6,'rgba(0,0,0,.25)','rgba(90,60,30,.6)',1);
  if(!eq&&h)text('+',sb.x+sb.w/2,sb.y+21,16,'#ffb347');
  if(h)hoverTip('bmr'+j,()=>({ax:BMP.x,t:ab.n,col:liftC(col,.55),l:[[`${catName(J.cat)} · rang ${J.r} · ${jcostT(ab)} · recharge ${fmtCd(ab.cd)}${ab.mud?' · '+ab.mud+' mudras':''}`,liftC(col,.5)],[eq?`Équipé en case ${s+1}`:rem>0?`Recharge restante : ${rem.toFixed(1)} s (elle continue hors de la barre)`:'Prêt',eq?'#8fe38f':'#d8b888']],
   d:ab.d||' ',f:`Clic : poser en case ${bmTgt(j)+1} · 1-6 : poser dans cette case${eq?' · clic D : retirer':''}`}))});
 g.restore();
 if(mx>0){const tr={x:P.x+P.w-14,y:BML.y,w:5,h:lh},k=lh/(lh+mx);rr(tr,2.5,'rgba(255,255,255,.08)');rr({x:tr.x,y:tr.y+(lh-lh*k)*BM.scroll/mx,w:5,h:lh*k},2.5,'#c08040')}
 // pied
 fitT('Clic : poser · survol + 1-6 : poser dans la case · ☆ favori · molette : défiler',P.x+P.w/2,P.y+P.h-11,10,'#9a8060',P.w-24,'normal',8,'center');
 bmMarks(UN,t);
 // case cible rappelée sur le HUD
 {const n=player.ch.abil.length,s=72,gap=6,x0=W/2-(n*s+(n-1)*gap+20)/2,i=BAR0+tg,x=x0+i*(s+gap)+10,y=H-72;g.save();g.strokeStyle=rgba('#ffe81f',.55+Math.sin(t*6)*.3);g.lineWidth=2;g.setLineDash([5,4]);g.strokeRect(x-3,y-3,s+6,52+6);g.restore()}}

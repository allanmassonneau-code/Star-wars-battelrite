// ===================== MENU B EN COMBAT : changer sa barre de 6 jutsu sans pause (copie Zenkai) =====================
// Panneau à droite, semi-transparent ; le combat continue. Onglets ★ Favoris / Nature / Style / Clan (ou une famille de sub par onglet).
// Barre de 6 cases en haut : clic G = case cible, clic D = la vider (les suivantes glissent). Liste des jutsu APPRIS de l'onglet :
// clic G = posé dans la case cible ; survol + 1-6 = posé dans cette case (la touche ne lance rien).
// Onglet ★ Favoris = presets de barre (« Barre 1 », « Barre 2 »… par perso, nrBar1) : une ligne par preset et ses 6 cases ; clic = toute la barre d'un coup (barReq 'bar'),
// Enregistrer = y mettre la barre actuelle, clic sur le nom = renommer (saisie au clavier, Entrée / Échap), Supprimer (2 clics), + Nouvelle barre (depuis la barre actuelle).
// Toute action passe par barReq (nr_bar.js) : hors ligne / hôte = appliquée, invité = demandée à l'hôte (réponse : BMUI.ack).
// Les entrées consommées sont retirées de `pressed` (lmb, rmb, Digit/Numpad 1-6, KeyB) avant la simulation et l'envoi des touches de l'invité.
const BM={tab:0,tgt:-1,scroll:0,hov:-1,msg:'',msgC:'#ffd38a',msgT:0,okMsg:'',lockL:false,pre:null,preK:'',ren:-1,renT:'',renSel:false,del:-1,delT:0,sav:-1,savT:0,nmW:[],okMsg2:'',ck:null};
const BMP={x:W-436,y:82,w:420,h:556};
// onglets : ★ puis les arbres où le perso a au moins un jutsu appris (un sans-clan à 5 familles n'a pas d'onglet vide)
const bmTabs=()=>{if(!(player&&player.ch&&player.ch.build))return['fav'];const L=player.ch.learn||[];return['fav'].concat(treesOf(player.ch.build).filter(t=>L.some(j=>JL[j]&&JL[j].cat===t)))};
const bmOk=()=>state!=='menu'&&state!=='matchEnd'&&!!player&&!!player.ch&&!!player.ch.jab&&!!player.ch.learn;
const bmBar=()=>player.barQ&&!isGuest()?player.barQ:player.ch.bar||[];
// case cible : celle choisie au clic, sinon la 1re case libre, sinon (barre pleine) la case du jutsu de même rang que celui qu'on pose, sinon la case 1
const bmTgt=j=>{if(BM.tgt>=0&&BM.tgt<BARN)return BM.tgt;const b=bmBar(),i=b.indexOf(-1);if(i>=0)return i;
 if(j!=null&&JL[j]&&!b.includes(j)){const r=JL[j].r,k=b.findIndex(x=>x>=0&&JL[x]&&JL[x].r===r);if(k>=0)return k}return 0};
// presets : lus une fois (et relus après un changement), pas à chaque image
function bmPre(){const k=preKey();if(!BM.pre||BM.preK!==k){BM.preK=k;BM.pre=preList(k)}return BM.pre}
function bmPreSet(L){prePut(L);BM.pre=null}
const bmFavT=()=>(bmTabs()[BM.tab]||'fav')==='fav';
// jutsu de l'onglet (vide pour ★ : on y liste des barres, pas des jutsu)
function bmList(){const t=bmTabs()[BM.tab]||'fav';if(t==='fav')return[];return player.ch.learn.filter(j=>JL[j]&&player.ch.jab[j]&&JL[j].cat===t).sort((a,b)=>RANKO.indexOf(JL[a].r)-RANKO.indexOf(JL[b].r)||a-b)}
// géométrie
const bmClose=()=>({x:BMP.x+BMP.w-36,y:BMP.y+8,w:28,h:26});
function bmTabR(){const T=bmTabs(),x0=BMP.x+10,w=BMP.w-20,gap=4,tw=(w-gap*(T.length-1))/T.length;return T.map((t,i)=>({x:x0+i*(tw+gap),y:BMP.y+40,w:tw,h:28,t}))}
const bmSlotR=s=>{const w=(BMP.w-20-5*6)/6;return{x:BMP.x+10+s*(w+6),y:BMP.y+90,w,h:58}};
const BML={y:BMP.y+192,rh:46,gap:4},bmLH=()=>BMP.y+BMP.h-30-BML.y;
const bmMax=n=>Math.max(0,n*(BML.rh+BML.gap)-BML.gap-bmLH());
const bmRowR=i=>({x:BMP.x+10,y:BML.y+i*(BML.rh+BML.gap)-BM.scroll,w:BMP.w-30,h:BML.rh});
// lignes des presets : nom (renommer), 6 cases, Enregistrer / Supprimer ; puis « + Nouvelle barre » (tant qu'il reste de la place)
const BPR={rh:64,gap:5,nh:40};
const bmPN=()=>bmPre().length+(bmPre().length<PREMAX?1:0);
const bmPRowR=i=>({x:BMP.x+10,y:BML.y+i*(BPR.rh+BPR.gap)-BM.scroll,w:BMP.w-30,h:i<bmPre().length?BPR.rh:BPR.nh});
const bmPMax=()=>{const n=bmPre().length,h=n*(BPR.rh+BPR.gap)+(n<PREMAX?BPR.nh:-BPR.gap);return Math.max(0,h-bmLH())};
const bmScrMax=()=>bmFavT()?bmPMax():bmMax(bmList().length);
const bmPNameR=R=>({x:R.x+6,y:R.y+3,w:R.w-96,h:19}); // cadre du nom (saisie)
const bmPNameHit=(R,i)=>{const N=bmPNameR(R);return BM.ren===i?N:{x:N.x,y:N.y,w:Math.min(N.w,(BM.nmW[i]||60)+86),h:N.h}}; // zone cliquable : le nom + « ✎ renommer », le reste de la ligne équipe
const bmPSaveR=R=>({x:R.x+R.w-80,y:R.y+6,w:74,h:24}),bmPDelR=R=>({x:R.x+R.w-80,y:R.y+R.h-30,w:74,h:24});
const bmPCellR=(R,s)=>{const w=(R.w-12-86-5*4)/6;return{x:R.x+6+s*(w+4),y:R.y+24,w,h:R.h-29}};
// le preset correspond-il à la barre actuelle ?
const bmPOn=(p,nb)=>{const b=bmBar();nb=nb||preBar(player,p);return nb.every((j,s)=>j===(b[s]>=0?b[s]:-1))};
function bmPreApply(i){const p=bmPre()[i];if(!p)return;bmRenEnd(true);const nb=preBar(player,p),miss=p.b.filter(x=>x).length-nb.filter(j=>j>=0).length;
 const ig=miss>0?` (${miss} jutsu non appris ignoré${miss>1?'s':''})`:'';bmRes(barReq('bar',nb,null),`${p.n} équipée`+ig,`${p.n} en attente`+ig)}
function bmPreSave(i){const L=bmPre().map(p=>Object.assign({},p));if(!L[i])return;const b=bmBar();if(b.every(j=>j<0)){bmSay('La barre actuelle est vide','#ff7a6a');return}
 if(L[i].b.every((k,s)=>k===preOf(b)[s])){BM.sav=-1;bmSay(`« ${L[i].n} » contient déjà la barre actuelle`,'#c8b89a');return}
 if(BM.sav!==i||performance.now()>BM.savT){BM.sav=i;BM.savT=performance.now()+2500;BM.del=-1;bmSay(`Remplacer les 6 cases de « ${L[i].n} » ? Clique sur Écraser ?`,'#ffb347');return}
 BM.sav=-1;L[i].b=preOf(b);bmPreSet(L);bmSay(`Barre actuelle enregistrée dans « ${L[i].n} »`,'#8fe38f')}
function bmPreNew(){const L=bmPre().slice();if(L.length>=PREMAX){bmSay(`${PREMAX} barres au plus : supprimes-en une`,'#ff7a6a');return}const b=bmBar();if(b.every(j=>j<0)){bmSay('La barre actuelle est vide','#ff7a6a');return}
 const n=preNew(L);L.push({n,b:preOf(b)});bmPreSet(L);bmSay(`« ${n} » créée avec la barre actuelle`,'#8fe38f');BM.scroll=bmPMax()}
function bmPreDel(i){const L=bmPre().slice();if(!L[i])return;if(BM.del!==i||performance.now()>BM.delT){BM.del=i;BM.delT=performance.now()+2500;BM.sav=-1;bmSay(`Supprimer « ${L[i].n} » ? Clique sur Confirmer ?`,'#ffb347');return}
 BM.del=-1;const n=L[i].n;L.splice(i,1);bmPreSet(L);bmSay(`« ${n} » supprimée`,'#ffb347')}
// renommer : saisie au clavier dans le panneau (Entrée valide, Échap annule) ; les touches tapées ne vont pas au ninja
function bmRen(i){const p=bmPre()[i];if(!p)return;bmRenEnd(true);BM.ren=i;BM.renT=p.n;BM.renSel=true;bmSay('Tape le nouveau nom · Entrée : valider · Échap : annuler','#ffd38a',1)}
function bmRenEnd(keep){const i=BM.ren;if(i<0)return;BM.ren=-1;const L=bmPre().map(p=>Object.assign({},p)),n=preName(BM.renT);if(!keep||!L[i]){bmSay('Nom inchangé','#c8b89a');return}
 if(!n||n===L[i].n){BM.msgT=0;return}if(L.some((q,k)=>k!==i&&q.n.toLowerCase()===n.toLowerCase())){bmSay(`« ${n} » existe déjà : nom inchangé`,'#ff7a6a');return}L[i].n=n;bmPreSet(L);bmSay(`Renommée « ${n} »`,'#8fe38f')}
try{addEventListener('keydown',e=>{if(BM.ren<0||!BMUI.open)return;const ch=e.key&&e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey;
 if(!ch&&e.key!=='Enter'&&e.key!=='Escape'&&e.key!=='Backspace'&&e.key!=='Delete')return;e.preventDefault();e.stopImmediatePropagation();
 if(e.key==='Enter')bmRenEnd(true);else if(e.key==='Escape')bmRenEnd(false);else if(e.key==='Backspace'||e.key==='Delete'){BM.renT=BM.renSel?'':BM.renT.slice(0,-1);BM.renSel=false}
 else if(ch){if(BM.renSel){BM.renT='';BM.renSel=false}if(BM.renT.length<PRENM)BM.renT+=e.key}},true)}catch(e){}
const bmOver=()=>BMUI.open&&inRect(mouse,BMP);
// menu ouvert : la caméra se décale vers la droite (le centre de la vue passe au milieu de la partie libre de l'écran) pour que le panneau ne cache pas l'adversaire
function bmCamOff(){if(!BMUI.open||!player)return 0;try{return(W-BMP.x)/2/Math.max(.2,scl(cam.y)*ZM())}catch(e){return 0}}
function bmSay(s,c,keep){BM.msg=s;BM.msgC=c||'#ffd38a';BM.msgT=keep?6:2.6}
// réponse locale (hors ligne / hôte) ou accusé d'envoi (invité)
function bmRes(r,okMsg,pendMsg){if(!r)return;if(!r.ok){bmSay(BARERR[r.e]||'Refusé','#ff7a6a');return}
 if(r.net){BM.okMsg=okMsg;BM.okMsg2=pendMsg||'';bmSay('Demande envoyée à l\'hôte…','#c8b89a',1);return}
 if(r.pend){bmSay((pendMsg||okMsg)+' · appliqué à la fin du jutsu en cours','#ffb347',1);return}
 bmSay(okMsg,'#8fe38f')}
function bmEquip(jid,s){BM.okMsg2='';const J=JL[jid];if(!J)return;const b=bmBar(),t=b.indexOf(jid),N=jName(jid);
 const m=t>=0&&t!==s?`Échange : ${N} en case ${s+1}`+(b[s]>=0&&JL[b[s]]?`, ${jName(b[s])} en case ${t+1}`:''):`${N} → case ${s+1}`+(t<0&&b[s]>=0&&JL[b[s]]?` (remplace ${jName(b[s])})`:'');
 const r=barReq('set',jid,s);bmRes(r,m);if(r&&r.ok&&s===BM.tgt)BM.tgt=-1}
function bmDel(s){const b=bmBar(),n=b[s]>=0&&JL[b[s]]?jName(b[s]):'';const r=barReq('del',null,s);bmRes(r,n?`${n} retiré de la case ${s+1}`:`Case ${s+1} vidée`);if(r&&r.ok&&BM.tgt===s)BM.tgt=-1}
function bmOpen(v){if(!v)bmRenEnd(true);BMUI.open=v;BM.hov=-1;BM.lockL=false;BM.del=-1;BM.sav=-1;if(v){BM.pre=null;BM.tgt=-1;const n=bmTabs().length;if(BM.tab>=n)BM.tab=0;
  if(BM.tab===0&&!bmPre().length)BM.tab=Math.min(1,n-1)}} // pas encore de preset : l'onglet de la nature (ou du style)
const BMD=[1,2,3,4,5,6];
Object.assign(BMUI,{
 frame(dt){if(BM.msgT>0)BM.msgT-=dt;
  if(BARNET.wait&&performance.now()-BARNET.wait.t>3000){BARNET.wait=null;bmSay('L\'hôte ne répond pas','#ff7a6a')} // invité : pas de réponse en 3 s
  if(!bmOk()){if(BMUI.open)bmOpen(false);return}
  if(pressed.KeyB){delete pressed.KeyB;if(!quitOn)bmOpen(!BMUI.open)}
  if(quitOn&&BMUI.open)bmOpen(false);
  if(!BMUI.open)return;
  if(!mouse.l)BM.lockL=false;
  const over=bmOver(),L=bmList();BM.scroll=clamp(BM.scroll,0,bmScrMax());
  // jutsu survolé
  BM.hov=-1;if(over&&inRect(mouse,{x:BMP.x,y:BML.y,w:BMP.w,h:bmLH()}))L.forEach((j,i)=>{if(inRect(mouse,bmRowR(i)))BM.hov=j});
  // survol d'un jutsu + 1-6 : posé dans cette case, la touche ne lance rien
  if(BM.hov>=0)for(const k of BMD){const a='Digit'+k,b='Numpad'+k;if(pressed[a]||pressed[b]){delete pressed[a];delete pressed[b];bmEquip(BM.hov,k-1)}}
  if(BM.ren>=0&&!over&&(pressed.lmb||pressed.rmb))bmRenEnd(true); // clic dans l'arène : le nom est validé, le clavier revient au ninja
  if(over&&pressed.lmb){delete pressed.lmb;BM.lockL=true;bmClick(L)}
  if(over&&pressed.rmb){delete pressed.rmb;for(let s=0;s<BARN;s++)if(inRect(mouse,bmSlotR(s)))bmDel(s);
   if(BM.hov>=0){const s=bmBar().indexOf(BM.hov);if(s>=0)bmDel(s)}}},
 mask(){return BMUI.open&&(BM.lockL||inRect(mouse,BMP))},
 esc(){if(BMUI.open){bmOpen(false);return true}return false},
 ack(r){if(!r)return;if(!r.ok)bmSay(BARERR[r.e]||'Refusé par l\'hôte','#ff7a6a');else if(r.pend)bmSay((BM.okMsg2||BM.okMsg||'Accepté')+' · appliqué à la fin du jutsu en cours','#ffb347');else bmSay(BM.okMsg||'Accepté par l\'hôte','#8fe38f')},
 draw(){if(!bmOk())return;if(!BMUI.open){bmHint();return}TIP=null;bmDraw();drawTip()}});
function bmClick(L){const ren=BM.ren;if(inRect(mouse,bmClose())){bmOpen(false);return}
 const T=bmTabR();for(let i=0;i<T.length;i++)if(inRect(mouse,T[i])){bmRenEnd(true);if(BM.tab!==i){BM.tab=i;BM.scroll=0}return}
 for(let s=0;s<BARN;s++)if(inRect(mouse,bmSlotR(s))){bmRenEnd(true);if(!bmFavT())BM.tgt=s;return}
 const mx=bmScrMax();if(mx>0&&inRect(mouse,{x:BMP.x+BMP.w-18,y:BML.y,w:16,h:bmLH()})){BM.scroll=clamp((mouse.y-BML.y)/bmLH(),0,1)*mx;return}
 if(!inRect(mouse,{x:BMP.x,y:BML.y,w:BMP.w,h:bmLH()})){bmRenEnd(true);return}
 if(bmFavT()){const n=bmPre().length;for(let i=0;i<bmPN();i++){const R=bmPRowR(i);if(!inRect(mouse,R))continue;
   if(i>=n){bmRenEnd(true);bmPreNew();return}
   if(inRect(mouse,bmPSaveR(R))){bmRenEnd(true);bmPreSave(i);return}
   if(inRect(mouse,bmPDelR(R))){bmRenEnd(true);bmPreDel(i);return}
   if(inRect(mouse,bmPNameHit(R,i))){if(ren!==i)bmRen(i);return}
   bmPreApply(i);return}
  bmRenEnd(true);return}
 for(let i=0;i<L.length;i++){const R=bmRowR(i);if(!inRect(mouse,R))continue;bmEquip(L[i],bmTgt(L[i]));return}}
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
function bmDraw(){const P=BMP,b=player.ch.bar||[],fv=bmFavT(),tg=fv?-1:bmTgt(BM.hov>=0?BM.hov:null),L=bmList(),T=bmTabs(),cur=T[BM.tab]||'fav',t=performance.now()/1000,UN=bmUnder();
 g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=18;rr(P,12,UN.length&&!inRect(mouse,P)?'rgba(14,10,8,.45)':'rgba(14,10,8,.72)','rgba(255,154,58,.55)',1.5);g.restore();
 bmMarks(UN,t); // sous le contenu du panneau : un anneau ne passe jamais par-dessus un bouton
 // en-tête
 text('BARRE DE JUTSU',P.x+14,P.y+25,15,'#ffb347','left');text('le combat continue',P.x+152,P.y+25,10.5,'#a89070','left','normal');
 {const R=bmClose(),h=inRect(mouse,R);rr(R,7,h?'#ff9a3a':'rgba(50,34,20,.9)','#8a5a2a');text('✕',R.x+R.w/2,R.y+18,14,h?'#1a1008':'#f3d9b0')}
 text(`${lbl.KeyB} / Échap`,P.x+P.w-44,P.y+24,10,'#8a7458','right','normal');
 // onglets
 bmTabR().forEach((R,i)=>{const on=i===BM.tab,h=inRect(mouse,R),tr=R.t,col=tr==='fav'?'#ffc53a':catCol(tr);
  rr(R,8,on?rgba(col,.85):h?'rgba(90,60,30,.85)':'rgba(30,20,12,.8)',on?'#ffe0a0':rgba(col,.6),on?1.5:1);
  const fg=on?(lum(col)>.5?'#1a1008':'#fff'):'#f3d9b0',nm=tr==='fav'?'Favoris':catName(tr),n=tr==='fav'?bmPre().length:player.ch.learn.filter(j=>JL[j]&&JL[j].cat===tr).length;
  if(tr==='fav'){text('★',R.x+(R.w>70?16:R.w/2),R.y+19,14,on?'#1a1008':'#ffc53a',R.w>70?'center':'center');if(R.w>70)fitT(`${nm} ${n}`,R.x+28,R.y+18.5,11.5,fg,R.w-32,'bold',8)}
  else{const ic=R.w>70;jIcon(ic?R.x+14:R.x+R.w/2,R.y+14,8,col,tr);if(ic)fitT(`${nm} ${n}`,R.x+26,R.y+18.5,11.5,fg,R.w-30,'bold',8)}
  if(h)hoverTip('bmt'+i,()=>({ax:BMP.x,t:tr==='fav'?'★ Favoris':catName(tr),col,d:tr==='fav'?`Tes barres enregistrées (${n}/${PREMAX}) : un clic sur une ligne équipe ses 6 jutsu d\'un coup. Gardées pour ce perso, dans ce navigateur.`:`${n} jutsu appris dans cet arbre.`}))});
 // barre de 6 cases
 text(fv?'CLIC D : VIDER UNE CASE':'CLIC : CASE CIBLE · CLIC D : VIDER',P.x+P.w/2,P.y+84,9.5,'#9a8060','center','normal');
 for(let s=0;s<BARN;s++){const R=bmSlotR(s),j=b[s],ab=j>=0&&player.ch.jab[j],J=ab&&JL[j],on=s===tg,h=inRect(mouse,R),cd=player.cds[BAR0+s]||0,hv=BM.hov>=0&&b[s]===BM.hov;
  rr(R,8,h?'rgba(70,46,24,.92)':'rgba(13,19,32,.85)',on?'#ffe81f':hv?'#6fe36f':J&&J.r==='S'?'#b89a3a':'#3a4a66',on?2.5:1.5);
  if(on){g.fillStyle='#ffe81f';g.beginPath();g.moveTo(R.x+R.w/2-6,R.y-7);g.lineTo(R.x+R.w/2+6,R.y-7);g.lineTo(R.x+R.w/2,R.y-1);g.closePath();g.fill()}
  text(lbl['Digit'+(s+1)]||String(s+1),R.x+8,R.y+15,12,on?'#ffe81f':'#cfd8ea','left');
  if(!ab){text('vide',R.x+R.w/2,R.y+38,10,'#5a6680','center','normal')}
  else{jIcon(R.x+R.w/2+6,R.y+24,12,catCol(J.cat),J.cat,J.r==='S');text(J.r,R.x+R.w-7,R.y+15,11,RANKC[J.r]||'#cfd8ea','right');fitT(jShort(ab.n),R.x+R.w/2,R.y+R.h-6,10,'#d8e0f0',R.w-4,'normal',8.5,'center');
   if(cd>0&&ab.cd>0){const k=Math.min(1,cd/ab.cd);g.fillStyle='rgba(0,0,0,.55)';g.fillRect(R.x+1,R.y+1+(R.h-2)*(1-k),R.w-2,(R.h-2)*k);text(cd.toFixed(1),R.x+R.w/2+6,R.y+29,12,'#ffe81f')}}
  if(h)hoverTip('bms'+s,()=>({ax:BMP.x,t:ab?`Case ${s+1} : ${ab.n}`:`Case ${s+1} (vide)`,col:J?catCol(J.cat):'#9fb3d9',l:ab?[[`${catName(J.cat)} · rang ${J.r} · ${jcostT(ab)} · ${fmtCd(ab.cd)}`,J?catCol(J.cat):'#d8b888']]:[],d:ab?ab.d||' ':'Aucun jutsu dans cette case.',f:fv?'Clic D : vider (les suivantes glissent)':'Clic G : choisir comme case cible · clic D : vider (les suivantes glissent)'}))}
 // ligne de statut
 {const y=P.y+168,pend=player.barQ&&!isGuest(),wait=isGuest()&&BARNET.wait&&performance.now()-BARNET.wait.t<3000;
  rr({x:P.x+10,y:y-14,w:P.w-20,h:20},6,'rgba(0,0,0,.35)');
  const s=BM.msgT>0?BM.msg:wait?'Demande envoyée à l\'hôte…':pend?'Changement en attente : il s\'applique à la fin du jutsu en cours':cur==='fav'?'Clic sur une barre : ses 6 jutsu d\'un coup':`Cible : case ${tg+1} · clic sur un jutsu pour l'y poser`,c=BM.msgT>0?BM.msgC:wait?'#c8b89a':pend?'#ffb347':'#c8b89a';
  g.globalAlpha=BM.msgT>0?Math.min(1,BM.msgT*2):1;fitT(s,P.x+P.w/2,y,11.5,c,P.w-34,'bold',8.5,'center');g.globalAlpha=1}
 // titre de l'onglet
 {const nm=cur==='fav'?'★ Favoris':catName(cur);fitT(nm.toUpperCase(),P.x+14,BML.y-6,10,cur==='fav'?'#ffc53a':liftC(catCol(cur),.55),200,'bold',8);
  text(cur==='fav'?`presets de barre · ${bmPre().length}/${PREMAX}`:'rang · chakra · recharge',P.x+P.w-20,BML.y-6,9.5,'#8a7458','right','normal')}
 // liste
 const lh=bmLH(),mx=bmScrMax();g.save();g.beginPath();g.rect(P.x+6,BML.y-2,P.w-12,lh+4);g.clip();
 if(cur==='fav')bmDrawPre(lh,t);
 else if(!L.length)wrapL('Aucun jutsu appris dans cet arbre (choisis-les dans la création du perso).',P.w-60,FNT(12)).forEach((l,i)=>text(l,P.x+P.w/2,BML.y+30+i*17,12,'#a89070','center','normal'));
 L.forEach((j,i)=>{const R=bmRowR(i);if(R.y+R.h<BML.y-2||R.y>BML.y+lh+2)return;const J=JL[j],ab=player.ch.jab[j],s=b.indexOf(j),eq=s>=0,h=BM.hov===j,col=catCol(J.cat),rem=remCd(player,j),gold=J.r==='S';
  rr(R,8,h?'rgba(74,48,24,.92)':eq?'rgba(22,44,22,.82)':'rgba(24,17,11,.82)',eq?'#5fd35f':h?'#c08040':'rgba(90,60,30,.7)',eq?2:1);
  jIcon(R.x+22,R.y+R.h/2,13,col,J.cat,gold);
  const x=R.x+42,nw=R.w-42-118;fitT(ab.n,x,R.y+18,13,gold?'#ffe81f':'#ffd38a',nw,'bold',9);
  rankBadge(x,R.y+25,J.r,40);text(`${jcost(ab)}`,x+56,R.y+39,11.5,jcost(ab)?'#7fc8ff':'#8fe38f','left');g.font=FNT(11.5,'bold');const cw=g.measureText(String(jcost(ab))).width;
  text('ck',x+58+cw,R.y+39,9.5,jcost(ab)?'#5a90c0':'#5fa05f','left','normal');text(`⟳ ${fmtCd(ab.cd)}`,x+78+cw,R.y+39,11,'#d8b888','left','normal');
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
 fitT(cur==='fav'?'Clic : équiper la barre · clic sur le nom : renommer · Enregistrer : y mettre la barre actuelle':'Clic : poser · survol + 1-6 : poser dans la case · molette : défiler',P.x+P.w/2,P.y+P.h-11,10,'#9a8060',P.w-24,'normal',8,'center');
 // case cible rappelée sur le HUD (pas dans l'onglet ★ : un preset remplace toute la barre)
 if(!fv){const n=player.ch.abil.length,s=72,gap=6,x0=W/2-(n*s+(n-1)*gap+20)/2,i=BAR0+tg,x=x0+i*(s+gap)+10,y=H-72;g.save();g.strokeStyle=rgba('#ffe81f',.55+Math.sin(t*6)*.3);g.lineWidth=2;g.setLineDash([5,4]);g.strokeRect(x-3,y-3,s+6,52+6);g.restore()}}

// onglet ★ : une ligne par preset (nom, 6 cases avec icône et rang, Enregistrer / Supprimer), puis « + Nouvelle barre »
function bmDrawPre(lh,t){const L=bmPre(),n=L.length;
 if(!n)wrapL('Aucune barre enregistrée : « + Nouvelle barre » garde ta barre actuelle (6 jutsu) sous le nom « Barre 1 ». Un clic sur la ligne la remet d\'un coup.',BMP.w-60,FNT(12)).forEach((l,i)=>text(l,BMP.x+BMP.w/2,BML.y+BPR.nh+30+i*17,12,'#a89070','center','normal'));
 for(let i=0;i<bmPN();i++){const R=bmPRowR(i);if(R.y+R.h<BML.y-2||R.y>BML.y+lh+2)continue;const h=inRect(mouse,R)&&bmOver();
  if(i>=n){g.save();g.setLineDash([6,5]);rr(R,8,h?'rgba(74,48,24,.92)':'rgba(24,17,11,.6)',h?'#ffc53a':'rgba(255,197,58,.5)',1.4);g.restore();
   text('+ Nouvelle barre',R.x+R.w/2,R.y+R.h/2+5,13.5,h?'#fff':'#ffc53a','center');
   if(h)hoverTip('bmpn',()=>({ax:BMP.x,t:'Nouvelle barre',col:'#ffc53a',d:`Enregistre ta barre actuelle sous le nom « ${preNew(L)} » (${n}/${PREMAX}).`}));continue}
  const p=L[i],nb=preBar(player,p),on=bmPOn(p,nb),ren=BM.ren===i,dl=BM.del===i&&performance.now()<BM.delT,sv=BM.sav===i&&performance.now()<BM.savT;
  const hN=h&&inRect(mouse,bmPNameHit(R,i)),hS=h&&inRect(mouse,bmPSaveR(R)),hD=h&&inRect(mouse,bmPDelR(R)),hRow=h&&!hN&&!hS&&!hD;
  rr(R,8,hRow?'rgba(74,48,24,.92)':on?'rgba(22,44,22,.82)':'rgba(24,17,11,.82)',on?'#5fd35f':hRow?'#ffc53a':'rgba(90,60,30,.7)',on||hRow?2:1);
  // nom (ou saisie en cours)
  {const N=bmPNameR(R);if(ren){rr(N,5,'rgba(0,0,0,.55)','#ffc53a',1.2);if(BM.renSel&&BM.renT){g.font=FNT(12,'bold');rr({x:N.x+4,y:N.y+2,w:Math.min(N.w-12,g.measureText(BM.renT).width+4),h:N.h-4},3,'rgba(255,197,58,.35)')}const cw=fitT(BM.renT,N.x+6,N.y+14,12,'#fff',N.w-16,'bold',9);if(Math.floor(t*2.4)%2===0){g.fillStyle='#ffc53a';g.fillRect(N.x+8+cw,N.y+3,1.6,13)}}
   else{if(hN)rr(bmPNameHit(R,i),5,'rgba(90,60,30,.6)');const w=fitT(p.n,N.x+4,N.y+14,12.5,on?'#9fffa0':'#ffd38a',N.w-90,'bold',9);BM.nmW[i]=w;
    text(on?'✓ équipée':hN?'✎ renommer':'',N.x+12+w,N.y+14,10,on?'#8fe38f':'#c8b89a','left','normal')}}
  // 6 cases
  for(let s=0;s<BARN;s++){const C=bmPCellR(R,s),k=p.b[s],j=nb[s],J=j>=0?JL[j]:null,lost=!!k&&j<0;
   rr(C,6,'rgba(13,19,32,.85)',J&&J.r==='S'?'#b89a3a':'#3a4a66',1.1);text(String(s+1),C.x+4,C.y+11,9,'#8a9ab8','left');
   if(J){const ab=player.ch.jab[j],ck=jcost(ab);jIcon(C.x+C.w/2,C.y+C.h/2+1,9,catCol(J.cat),J.cat,J.r==='S');text(J.r,C.x+C.w-4,C.y+11,9.5,RANKC[J.r]||'#cfd8ea','right');
    if(ab&&!ab.hpc)text(String(ck),C.x+C.w-4,C.y+C.h-3,8.5,ck?'#7fc8ff':'#8fe38f','right')} // coût en chakra (0 en vert : arbres martiaux)
   else text(lost?'?':'·',C.x+C.w/2,C.y+C.h/2+5,lost?13:12,lost?'#ff7a6a':'#5a6680','center')}
  // boutons
  {const S=bmPSaveR(R);rr(S,6,sv?'#d07a20':hS?'#ff9a3a':'rgba(50,34,20,.9)',sv?'#ffe0a0':'#c08040',1);text(sv?'Écraser ?':'Enregistrer',S.x+S.w/2,S.y+16,10.5,sv||hS?'#1a1008':'#f3d9b0','center')}
  {const D=bmPDelR(R);rr(D,6,dl?'#c0392b':hD?'rgba(120,40,30,.95)':'rgba(50,24,20,.9)',dl?'#ffb0a0':'#8a3a2a',1);text(dl?'Confirmer ?':'Supprimer',D.x+D.w/2,D.y+16,10.5,dl||hD?'#fff':'#e8b8a8','center')}
  if(h)hoverTip('bmp'+i+(hS?'s':hD?'d':hN?'n':''),()=>hS?{ax:BMP.x,t:'Enregistrer dans « '+p.n+' »',col:'#ffc53a',d:'Remplace les 6 cases de ce preset par ta barre actuelle. Deux clics : le premier demande confirmation.'}
   :hD?{ax:BMP.x,t:'Supprimer « '+p.n+' »',col:'#ff7a6a',d:'Deux clics : le premier demande confirmation.'}
   :hN?{ax:BMP.x,t:'Renommer « '+p.n+' »',col:'#ffc53a',d:`Clic puis tape le nom (${PRENM} caractères max) · Entrée : valider · Échap : annuler.`}
   :{ax:BMP.x,t:p.n+(on?' (équipée)':''),col:'#ffc53a',l:p.b.map((k,s)=>{const j=nb[s];return[`${s+1}. `+(j>=0?`${jName(j)} · rang ${JL[j].r} · ${jcostT(player.ch.jab[j])}`:k?`${k.split('|')[0]} (non appris : ignoré)`:'vide'),j>=0?liftC(catCol(JL[j].cat),.5):k?'#ff7a6a':'#7a8aa8']}),
    d:'Clic : équiper ces 6 jutsu d\'un coup. Les recharges suivent les jutsu ; ceux qui entrent attendent 2 s ; un jutsu en cours n\'est jamais coupé.'})}}

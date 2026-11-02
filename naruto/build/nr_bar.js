// ===================== BARRE DE JUTSU EN COMBAT (6 cases) : recharges qui suivent le jutsu, blocage de 2 s, règles « equip_jutsu_at » =====================
// Chaque unité a sa propre copie du ninja (unitCh) : u.ch.abil = [style, case 1 … case 6 (null = vide), dash, Kawarimi], u.ch.bar = 6 jid (-1 = vide).
// Toute modification de barre passe par setBar (HÔTE ou hors ligne seulement) ; en ligne, l'invité DEMANDE (barReq → {t:'eq'}), l'hôte valide et répond ({t:'eqr'}),
// la barre de l'invité ne change que par l'instantané (champ synchronisé barS).
// MBAR : barre de chaque combattant pour tout le match (clé c|team) : gardée après une mort et entre les manches ; une nouvelle manche remet recharges et stash à zéro (mkUnit neuf),
// une réapparition (mode bataille) les GARDE, elles ont continué de décompter pendant la mort (cdKeep / cdPut plus bas : sinon mourir remettrait à neuf des jutsu de 80-100 s).
let MBAR={};
const BARERR={nolearn:'Jutsu non appris',slot:'Case invalide',same:'Déjà dans cette case',empty:'Case déjà vide',jid:'Jutsu inconnu',state:'Pas en combat',unit:'Ninja introuvable',rate:'Trop de demandes',net:'En attente de l\'hôte…',bar:'Barre invalide',nobar:'Aucun jutsu appris dans cette barre',samebar:'Cette barre est déjà équipée'};
// copie du ninja d'une unité avec SA barre (copie superficielle : les objets jutsu restent partagés, comme avant)
function unitCh(c,bar){const C=CH[c];if(!C||!C.jab)return C;const b=Array.isArray(bar)&&bar.length===BARN?bar:C.bar0||C.bar;
 return Object.assign({},C,{abil:[C.abil[0],...b.map(j=>j>=0&&C.jab[j]||null),C.dashAb,C.shunAb],bar:b.map(j=>j>=0&&C.jab[j]?j:-1)})}
// invité : copie mise en cache par (perso, barre) ; refaite si le ninja du salon change
const CHF=new Map();
function chFor(c,barS){const C=CH[c];if(!C||!C.jab||typeof barS!=='string'||!barS)return C;const k=c+'#'+barS;let e=CHF.get(k);
 if(!e||e.C!==C){if(CHF.size>400)CHF.clear();e={C,ch:unitCh(c,barS.split(',').map(Number))};CHF.set(k,e)}return e.ch}
// nom affiché d'un jutsu pour une unité (alias propre au perso, ex. « Raikiri » pour le Chidori de Kakashi), sinon celui du catalogue
const jName=(j,u)=>{u=u===undefined?(typeof player!=='undefined'?player:null):u;const a=u&&u.ch&&u.ch.jab&&u.ch.jab[j];return a&&a.n?a.n:JL[j]?JL[j].n:''};
// nom court (après « Japonais : »), pour les petites cases
const jShort=n=>{const i=String(n).indexOf(' : ');return i>0?n.slice(i+3):n};
// recharge restante d'un jutsu appris (barre ou stash)
function remCd(u,jid){const i=u.ch.bar?u.ch.bar.indexOf(jid):-1;return i>=0?Math.max(0,u.cds[BAR0+i]||0):Math.max(0,(u.cst&&u.cst[jid])||0)}
// cases « occupées » : un jutsu en incantation (mudras, u.cast), en canalisation, en relance (jst), arc bandé (hakumei) ou suivi par un objet aux (BARAUX).
// L'incantation compte aussi : plusieurs mécaniques (canalisations, charges, dôme…) retrouvent leur case par leur clé au moment où elles partent.
function barBusy(u){const s=new Set();if(u.cast&&u.cast.i>0)s.add(u.cast.i);if(u.chan&&u.chan.i>0)s.add(u.chan.i);if(u.jst&&u.jst.i>0)s.add(u.jst.i);if(u.hm_bw&&u.hm_bw.i>0)s.add(u.hm_bw.i);
 for(const x of aux)if(x.owner===u&&BARAUX.has(x.type)){if(x.i>0)s.add(x.i);if(x.si>0)s.add(x.si)}return s}
const barNorm=nb=>{const o=[];for(let s=0;s<BARN;s++){const v=nb&&nb[s];o.push(typeof v==='number'&&Number.isInteger(v)&&v>=0&&!o.includes(v)?v:-1)}return o};
// applique une nouvelle barre (6 jid) : les recharges suivent le jutsu, un jutsu qui ENTRE reçoit max(stash, 2 s), un jutsu qui SORT garde sa recharge dans le stash (u.cst).
// Un cast en cours n'est jamais interrompu : si un jutsu occupé (canalisation, relance…) devait QUITTER la barre, le changement attend la fin (u.barQ, renvoie pend:true).
function setBar(u,nb){nb=barNorm(nb).map(j=>j>=0&&u.ch.jab&&u.ch.jab[j]?j:-1);const ob=u.ch.bar.slice();
 for(const i of barBusy(u)){const j=ob[i-BAR0];if(j>=0&&!nb.includes(j)){u.barQ=nb;MBAR[u.c+'|'+u.team]=nb.slice();return{ok:true,pend:true}}} // barre en attente : gardée pour la manche suivante même si on meurt avant la fin du jutsu
 u.barQ=null;if(ob.every((j,s)=>j===nb[s])){MBAR[u.c+'|'+u.team]=nb.slice();return{ok:true}}
 const cd={},cg={};ob.forEach((j,s)=>{if(j>=0){cd[j]=u.cds[BAR0+s];cg[j]=u.chg?u.chg[BAR0+s]:0}});if(!u.cst)u.cst={};if(!u.csg)u.csg={};
 const mp={};ob.forEach((j,s)=>{if(j>=0&&nb.includes(j))mp[BAR0+s]=BAR0+nb.indexOf(j)});
 for(let s=0;s<BARN;s++){const j=nb[s],i=BAR0+s;
  if(j<0){u.ch.abil[i]=null;u.cds[i]=0;if(u.chg)u.chg[i]=0;continue}
  const ab=u.ch.jab[j];u.ch.abil[i]=ab;
  if(j in cd){u.cds[i]=cd[j];if(u.chg)u.chg[i]=cg[j]}
  else if(ab&&ab.charges){const C=ab.charges,g=u.csg[j],n=g?Math.min(C,g.n):C;if(u.chg)u.chg[i]=n;u.cds[i]=n<C?Math.max(.05,u.cst[j]||ab.cd):0;delete u.cst[j];delete u.csg[j];(u.lkj||(u.lkj={}))[j]=SIMT+CDLOCK}
  else{u.cds[i]=Math.max(u.cst[j]||0,CDLOCK);delete u.cst[j];if(u.chg)u.chg[i]=0}}
 // sortants : la recharge part au stash ; un jutsu à charges y garde aussi ses charges (u.csg[jid].n, la recharge en cours = temps avant la charge suivante)
 ob.forEach(j=>{if(j<0||nb.includes(j))return;const ab=u.ch.jab[j];if(ab&&ab.charges){if(cg[j]<ab.charges){u.csg[j]={n:cg[j]};u.cst[j]=Math.max(.05,cd[j]||ab.cd)}}else if(cd[j]>0)u.cst[j]=cd[j]});
 // états qui gardent un n° de case : suivent leur jutsu
 const rm=o=>{if(o&&o.i>0&&mp[o.i])o.i=mp[o.i]};rm(u.chan);rm(u.jst);rm(u.hm_bw);if(u.cast&&u.cast.i>0&&mp[u.cast.i])u.cast.i=mp[u.cast.i];
 for(const x of aux)if(x.owner===u&&BARAUX.has(x.type)){if(x.i>0&&mp[x.i])x.i=mp[x.i];if(x.si>0&&mp[x.si])x.si=mp[x.si]}
 if(u.buf&&u.buf.i>0&&u.buf.i<=BARN)u.buf=null;
 u.ch.bar=nb.slice();u.barS=nb.join(',');MBAR[u.c+'|'+u.team]=nb.slice();u.barN=(u.barN||0)+1;
 for(const f of BARCHG)try{f(u,ob,nb)}catch(e){console.error(e)}
 return{ok:true}}
// stash : décompte hors barre ; un jutsu à charges y regagne ses charges une à une (comme dans la barre)
function stashTick(u,dt){const T=u.cst;if(!T)return;for(const k in T){if((T[k]-=dt)>0)continue;const g=u.csg&&u.csg[k],ab=g&&u.ch.jab&&u.ch.jab[k];
 if(g&&ab&&ab.charges){g.n++;if(g.n<ab.charges){T[k]+=ab.cd;continue}delete u.csg[k]}delete T[k]}}
// blocage d'entrée d'un jutsu à charges (ses charges reviennent avec lui, mais il attend 2 s comme les autres)
const barLocked=(u,ab)=>!!(ab&&ab.charges&&ab.jid!=null&&u.lkj&&u.lkj[ab.jid]>SIMT);
// changement en attente (cast/canalisation en cours) : appliqué dès que possible
function barTry(u){if(u.barQ&&!u.dead)setBar(u,u.barQ)}
// barre de référence pour composer une demande : celle en attente si elle existe
const barCur=u=>(u.barQ||u.ch.bar).slice();
// règles Zenkai : refus si non appris / case hors 0-5 / déjà dans cette case ; déjà dans une autre case → échange ; case occupée → remplace (le sortant part au stash) ; sinon ajout
function equipAt(u,jid,s){if(!u||!u.ch||!u.ch.jab)return{ok:false,e:'unit'};if(typeof jid!=='number'||!Number.isInteger(jid))return{ok:false,e:'jid'};
 if(!u.ch.learn.includes(jid))return{ok:false,e:'nolearn'};if(typeof s!=='number'||!Number.isInteger(s)||s<0||s>=BARN)return{ok:false,e:'slot'};
 const b=barCur(u);if(b[s]===jid)return{ok:false,e:'same'};const t=b.indexOf(jid);if(t>=0){b[t]=b[s];b[s]=jid}else b[s]=jid;return setBar(u,b)}
// retire la case s puis COMPACTE (les cases suivantes glissent à gauche, leurs recharges les suivent)
function unequipAt(u,s){if(!u||!u.ch||!u.ch.jab)return{ok:false,e:'unit'};if(typeof s!=='number'||!Number.isInteger(s)||s<0||s>=BARN)return{ok:false,e:'slot'};
 const b=barCur(u);if(b[s]<0)return{ok:false,e:'empty'};b.splice(s,1);b.push(-1);return setBar(u,b)}
// barre complète d'un coup (preset du menu B) : 6 jid (-1 = vide), tous appris, sans doublon, pas toute vide ; mêmes règles que les changements unitaires (setBar)
function barSetAll(u,nb){if(!u||!u.ch||!u.ch.jab)return{ok:false,e:'unit'};if(!Array.isArray(nb)||nb.length!==BARN)return{ok:false,e:'bar'};
 const o=[];for(const j of nb){if(j===-1||j===null){o.push(-1);continue}if(typeof j!=='number'||!Number.isInteger(j)||j<0)return{ok:false,e:'jid'};
  if(!u.ch.learn.includes(j)||!u.ch.jab[j])return{ok:false,e:'nolearn'};if(o.includes(j))return{ok:false,e:'bar'};o.push(j)}
 if(o.every(j=>j<0))return{ok:false,e:'nobar'};if(barCur(u).every((j,s)=>j===o[s]))return{ok:false,e:'samebar'};return setBar(u,o)}
// ---------- réapparition (mode bataille) : les recharges en cours survivent à la mort ----------
// cdKeep : toutes les recharges des jutsu appris (barre + stash) au format stash {cst, csg} (elles ont décompté pendant la mort : updUnit les fait avancer avant le test u.dead) ;
// cdPut : après le mkUnit neuf, les jutsu de la barre reprennent la leur (charges comprises), le reste repart au stash
function cdKeep(u){if(!u||!u.ch||!u.ch.jab||!u.ch.bar)return null;const T=Object.assign({},u.cst||{}),G={};for(const k in u.csg||{})G[k]={n:u.csg[k].n};
 u.ch.bar.forEach((j,s)=>{if(j<0)return;const i=BAR0+s,ab=u.ch.jab[j],cd=u.cds[i]||0;if(ab&&ab.charges){const n=u.chg?u.chg[i]|0:ab.charges;if(n<ab.charges){G[j]={n};T[j]=Math.max(.05,cd||ab.cd)}}else if(cd>0)T[j]=cd});
 return{cst:T,csg:G}}
function cdPut(u,o){if(!o||!u||!u.ch||!u.ch.bar)return;u.cst=o.cst;u.csg=o.csg;
 u.ch.bar.forEach((j,s)=>{if(j<0||!(j in u.cst))return;const i=BAR0+s,ab=u.ch.jab[j];u.cds[i]=u.cst[j];if(ab&&ab.charges&&u.chg)u.chg[i]=u.csg[j]?u.csg[j].n:ab.charges;delete u.cst[j];delete u.csg[j]})}
AFTER.push(()=>{const R0=respawn;respawn=function(u){const k=cdKeep(u);R0(u);try{cdPut(u,k)}catch(e){console.error(e)}}});
// ---------- en ligne ----------
// version du protocole (format v6 : barre de 6, menu B, presets 'bar', arbres martiaux sans chakra ; v7 : recharges longues D 20-30 s … S 80-100 s, recharges gardées à la réapparition ; v8 : recharges en temps réel, ×0,8 en temps de jeu) : hôte et invité doivent l'avoir tous les deux, sinon la connexion est coupée avec un message
const NPV=8,VERMSG='Version différente du jeu : recharge la page (Ctrl+F5) chez toi et chez ton ami.';let NVT=0;
const netVerT=()=>performance.now()-NVT<4000;
function netVerHost(P){P.nver=1;net.peers=net.peers.filter(x=>x!==P);try{P.conn.send({t:'nver'})}catch(e){}setTimeout(()=>{try{P.conn.close()}catch(e){}},300);setStat('Un ami a une autre version du jeu : il doit recharger la page.');try{sendLobby()}catch(e){}}
function netVerGuest(){NVT=performance.now();netReset();state='menu';setStat(VERMSG);try{netUI(true)}catch(e){}}
// demande d'un joueur (menu B, raccourcis) : hors ligne / hôte → appliquée tout de suite ; invité → envoyée à l'hôte, réponse dans BARNET.last (bmAck)
const BARNET={seq:0,wait:null,last:null};
// a : 'set' (jutsu j en case s), 'del' (vider la case s), 'bar' (j = barre complète de 6 jid, preset)
function barReq(a,j,s){if(isGuest()&&net.live){const q=++BARNET.seq;BARNET.wait={q,a,j,s,t:performance.now()};netSend({t:'eq',a,j,s,q});return{ok:true,pend:true,net:true,q}}
 if(!player)return{ok:false,e:'unit'};const r=a==='del'?unequipAt(player,s):a==='bar'?barSetAll(player,j):equipAt(player,j,s);BARNET.last=Object.assign({q:0},r);return r}
// hôte : valide la demande d'un invité avec les MÊMES règles, au plus 12 par seconde et par invité, puis répond
function bmNet(P,d){const rep=o=>{try{P.conn.send(Object.assign({t:'eqr',q:d&&Number.isInteger(d.q)?d.q:0},o))}catch(e){}return o};
 const now=performance.now();P.eqT=(P.eqT||[]).filter(t=>now-t<1000);if(P.eqT.length>=12)return rep({ok:false,e:'rate'});P.eqT.push(now);
 if(state==='menu')return rep({ok:false,e:'state'});const u=units.find(x=>x.ctrl==='remote'&&x.rid===P.id);if(!u)return rep({ok:false,e:'unit'});
 const a=d&&(d.a==='del'||d.a==='bar')?d.a:'set',j=d&&(typeof d.j==='number'||a==='bar'&&Array.isArray(d.j))?d.j:NaN,s=d&&typeof d.s==='number'?d.s:NaN;
 const r=a==='del'?unequipAt(u,s):a==='bar'?barSetAll(u,Array.isArray(j)?j:null):equipAt(u,j,s);rep(r);return r}
// invité : réponse de l'hôte (la barre elle-même arrive par l'instantané)
function bmAck(d){if(!d)return;BARNET.last={q:d.q|0,ok:!!d.ok,e:typeof d.e==='string'?d.e:'',pend:!!d.pend};if(BARNET.wait&&BARNET.wait.q===(d.q|0))BARNET.wait=null;try{BMUI.ack(BARNET.last)}catch(e){}}
AFTER.push(()=>{if(!UK.includes('barS'))UK.push('barS')});
// ---------- bots ----------
// ordre d'essai des cases : barre du rang S au rang D, puis dash et Kawarimi
function aiOrder(u){const o=[];for(let i=BAR0;i<BAR0+BARN;i++)if(u.ch.abil[i])o.push(i);const rk=i=>RANKO.indexOf(u.ch.abil[i].rank);o.sort((a,b)=>rk(b)-rk(a)||a-b);o.push(DASHI,SHUNI);return o}
// case de la barre au rang le plus haut (jutsu à garder du chakra pour), -1 si aucune
function bestRankI(u){let b=-1,r=-1;for(let i=BAR0;i<BAR0+BARN;i++){const ab=u.ch.abil[i];if(!ab||!ab.rank)continue;const k=RANKO.indexOf(ab.rank);if(k>r){r=k;b=i}}return b}
// bot : quand toute sa barre recharge, pose un jutsu appris prêt (au plus 1 changement toutes les 1,5 s), à la place du plus long à recharger
function aiSwap(u){if(!u.ch||!u.ch.jab||u.ctrl||u.dead||u.barQ)return false;if((u.aiSwT||0)>SIMT)return false;u.aiSwT=SIMT+1.5;
 const b=u.ch.bar;let empty=-1,worst=-1,wc=-1;for(let s=0;s<BARN;s++){const i=BAR0+s;if(b[s]<0){if(empty<0)empty=s;continue}if(u.cds[i]<=1)return false;if(u.cds[i]>wc){wc=u.cds[i];worst=s}}
 let best=-1,br=-1;for(const j of u.ch.learn){if(b.includes(j)||((u.cst&&u.cst[j])||0)>0)continue;const ab=u.ch.jab[j];if(!ab||u.energy<jcost(ab))continue;const r=RANKO.indexOf(ab.rank);if(r>br){br=r;best=j}}
 if(best<0)return false;const s=empty>=0?empty:worst;if(s<0)return false;return equipAt(u,best,s).ok}
// ---------- presets de barre (onglet ★ Favoris du menu B) : par perso, gardés dans ce navigateur ----------
// nrBar1 = {clé du perso (MEK): [{n:'Barre 1', b:['Nom|arbre' ou '' ×6]}, …]} ; les jutsu sont rangés par nom (pas par n°), un jutsu oublié depuis est ignoré à l'application.
// (pas dans nrRoster2 : un preset n'est qu'un raccourci de combat, il ne doit ni marquer un perso de l'anime « retouché » ni partir dans le build envoyé en ligne)
const PREMAX=8,PRENM=16;
function preLoad(){try{if(SIMQ)return{};const o=JSON.parse(localStorage.getItem('nrBar1')||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{}}catch(e){return{}}}
function preSave(o){try{if(SIMQ)return;localStorage.setItem('nrBar1',JSON.stringify(o))}catch(e){}}
const preKey=()=>typeof MEK!=='undefined'&&MEK||'p0';
const preName=n=>String(n==null?'':n).replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,PRENM);
function preList(k){k=k||preKey();let L=preLoad()[k];if(!Array.isArray(L)){L=preMig(k);if(!L)return[]}
 return L.filter(p=>p&&Array.isArray(p.b)).slice(0,PREMAX).map((p,i)=>({n:preName(p.n)||'Barre '+(i+1),b:Array.from({length:BARN},(_,s)=>typeof p.b[s]==='string'?p.b[s].slice(0,80):'')}))}
// anciens favoris par jutsu (nrFav1 {perso: ['Nom|arbre', …]}) : repris une fois en une barre « Favoris » (6 premiers), puis nrBar1 fait foi
function preMig(k){try{if(SIMQ)return null;const F=JSON.parse(localStorage.getItem('nrFav1')||'{}'),f=F&&F[k];if(!Array.isArray(f))return null;const v=f.filter(x=>typeof x==='string'&&x).slice(0,BARN);if(!v.length)return null;
 const L=[{n:'Favoris',b:Array.from({length:BARN},(_,s)=>v[s]||'')}];prePut(L,k);return L}catch(e){return null}}
function prePut(L,k){const o=preLoad();o[k||preKey()]=L.slice(0,PREMAX);preSave(o)}
// barre (6 jid) → preset (6 noms) ; preset → 6 jid parmi les jutsu appris de l'unité (-1 si oublié)
const preOf=bar=>Array.from({length:BARN},(_,s)=>bar&&bar[s]>=0?jKey(bar[s]):'');
function preJ(u,s){if(!s||!u||!u.ch||!u.ch.learn)return-1;const L=u.ch.learn;let j=L.find(x=>jKey(x)===s);if(j==null&&u.ch.build)try{const p=pickKey(u.ch.build,s);if(L.includes(p))j=p}catch(e){}return j==null?-1:j}
function preBar(u,p){const o=[];for(const s of p.b){const j=preJ(u,s);o.push(j>=0&&!o.includes(j)?j:-1)}return o}
// nom libre suivant : « Barre N »
function preNew(L){let n=L.length+1;while(L.some(p=>p.n==='Barre '+n))n++;return'Barre '+n}
// ---------- branchement de l'interface (menu B : nr_bm.js à écrire) ----------
// mknaruto.py appelle déjà : BMUI.frame(dt) au début de chaque image (avant la simulation et l'envoi des touches de l'invité), BMUI.draw() après le HUD,
// BMUI.mask() (vrai = la souris est sur le panneau : le clic gauche ne frappe pas), BMUI.esc() sur Échap en combat (vrai = le menu s'est fermé, pas de menu Quitter),
// BMUI.ack(r) à la réponse de l'hôte. Le menu retire de `pressed` les touches qu'il consomme (lmb, rmb, Digit1-6…).
const BMUI={open:false,frame(dt){},draw(){},mask(){return false},esc(){return false},ack(r){}};

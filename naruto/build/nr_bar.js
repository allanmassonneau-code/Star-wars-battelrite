// ===================== BARRE DE JUTSU EN COMBAT (6 cases) : recharges qui suivent le jutsu, blocage de 2 s, règles « equip_jutsu_at » =====================
// Chaque unité a sa propre copie du ninja (unitCh) : u.ch.abil = [style, case 1 … case 6 (null = vide), dash, Kawarimi], u.ch.bar = 6 jid (-1 = vide).
// Toute modification de barre passe par setBar (HÔTE ou hors ligne seulement) ; en ligne, l'invité DEMANDE (barReq → {t:'eq'}), l'hôte valide et répond ({t:'eqr'}),
// la barre de l'invité ne change que par l'instantané (champ synchronisé barS).
// MBAR : barre de chaque combattant pour tout le match (clé c|team) : gardée après une mort et entre les manches ; une nouvelle manche remet recharges et stash à zéro (mkUnit neuf),
// une réapparition (mode bataille) les GARDE, elles ont continué de décompter pendant la mort (cdKeep / cdPut plus bas : sinon mourir remettrait à neuf des jutsu de 80-100 s).
let MBAR={};
const BARERR={nolearn:'Jutsu non appris',jid:'Jutsu inconnu',state:'Pas en combat',unit:'Ninja introuvable',rate:'Trop de demandes',net:'En attente de l\'hôte…',bar:'Barre invalide',nobar:'Aucun jutsu appris dans cette barre',samebar:'Cette barre est déjà équipée'};
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
// changement en attente (cast/canalisation en cours) : appliqué dès que possible ; la barre favorite demandée (u.favQ) devient alors la barre équipée (u.favI)
function barTry(u){if(u.barQ&&!u.dead){setBar(u,u.barQ);if(!u.barQ&&u.favQ!=null){u.favI=u.favQ;u.favQ=null}}}
// barre de référence pour composer une demande : celle en attente si elle existe
const barCur=u=>(u.barQ||u.ch.bar).slice();
// barre complète d'un coup : 6 jid (-1 = vide), tous appris, sans doublon, pas toute vide ; mêmes règles que tout changement (setBar)
function barSetAll(u,nb){if(!u||!u.ch||!u.ch.jab)return{ok:false,e:'unit'};if(!Array.isArray(nb)||nb.length!==BARN)return{ok:false,e:'bar'};
 const o=[];for(const j of nb){if(j===-1||j===null){o.push(-1);continue}if(typeof j!=='number'||!Number.isInteger(j)||j<0)return{ok:false,e:'jid'};
  if(!u.ch.learn.includes(j)||!u.ch.jab[j])return{ok:false,e:'nolearn'};if(o.includes(j))return{ok:false,e:'bar'};o.push(j)}
 if(o.every(j=>j<0))return{ok:false,e:'nobar'};if(barCur(u).every((j,s)=>j===o[s]))return{ok:false,e:'samebar'};return setBar(u,o)}
// ---------- barres favorites (build v6 : ch.build.bars, 1 à BARSMAX barres de 6, faites dans la création du perso) ----------
const barsOf=u=>u&&u.ch&&u.ch.build&&Array.isArray(u.ch.build.bars)?u.ch.build.bars:[];
const barEq=(a,b)=>!!a&&!!b&&a.length===BARN&&a.every((j,s)=>j===(b[s]??-1));
// barre favorite équipée : celle qu'on a choisie (u.favI) si elle est bien à l'écran, sinon la 1re dont le contenu est celui de la barre ; -1 si aucune
function favCur(u){const L=barsOf(u),b=u&&u.ch&&u.ch.bar;if(!b)return-1;if(Number.isInteger(u.favI)&&L[u.favI]&&barEq(L[u.favI].b,b))return u.favI;return L.findIndex(q=>barEq(q.b,b))}
// barre favorite en attente (cast en cours) : -1 si aucune
const favPend=u=>u&&u.barQ&&Number.isInteger(u.favQ)?u.favQ:-1;
// équipe la barre favorite i (HÔTE ou hors ligne) : n° de barre validé, contenu revalidé par barSetAll (appris, sans doublon), règles de setBar
function barFav(u,i){if(!u||!u.ch||!u.ch.jab)return{ok:false,e:'unit'};const L=barsOf(u);if(typeof i!=='number'||!Number.isInteger(i)||i<0||i>=L.length)return{ok:false,e:'bar'};
 if(favPend(u)===i)return{ok:true,pend:true};const r=barSetAll(u,L[i].b.slice(0,BARN));
 if(r.ok){if(r.pend)u.favQ=i;else{u.favI=i;u.favQ=null}}else if(r.e==='samebar'){if(u.barQ){u.favQ=i;return{ok:true,pend:true}}u.favI=i;u.favQ=null;return{ok:true,same:true}}return r}
// ---------- réapparition (mode bataille) : les recharges en cours survivent à la mort ----------
// cdKeep : toutes les recharges des jutsu appris (barre + stash) au format stash {cst, csg} (elles ont décompté pendant la mort : updUnit les fait avancer avant le test u.dead) ;
// cdPut : après le mkUnit neuf, les jutsu de la barre reprennent la leur (charges comprises), le reste repart au stash
function cdKeep(u){if(!u||!u.ch||!u.ch.jab||!u.ch.bar)return null;const T=Object.assign({},u.cst||{}),G={};for(const k in u.csg||{})G[k]={n:u.csg[k].n};
 u.ch.bar.forEach((j,s)=>{if(j<0)return;const i=BAR0+s,ab=u.ch.jab[j],cd=u.cds[i]||0;if(ab&&ab.charges){const n=u.chg?u.chg[i]|0:ab.charges;if(n<ab.charges){G[j]={n};T[j]=Math.max(.05,cd||ab.cd)}}else if(cd>0)T[j]=cd});
 return{cst:T,csg:G}}
function cdPut(u,o){if(!o||!u||!u.ch||!u.ch.bar)return;u.cst=o.cst;u.csg=o.csg;
 u.ch.bar.forEach((j,s)=>{if(j<0||!(j in u.cst))return;const i=BAR0+s,ab=u.ch.jab[j];u.cds[i]=u.cst[j];if(ab&&ab.charges&&u.chg)u.chg[i]=u.csg[j]?u.csg[j].n:ab.charges;delete u.cst[j];delete u.csg[j]})}
AFTER.push(()=>{const R0=respawn;respawn=function(u){const k=cdKeep(u),fi=u.favI;R0(u);u.favI=fi;try{cdPut(u,k)}catch(e){console.error(e)}}});
// ---------- en ligne ----------
// version du protocole (v6 : barre de 6, arbres martiaux sans chakra ; v7 : recharges longues, gardées à la réapparition ; v8 : barres favorites (build v6, bars), roue de B, demande {t:'eq',a:'fav',s:n° de barre}) :
// hôte et invité doivent l'avoir tous les deux, sinon la connexion est coupée avec un message
const NPV=8,VERMSG='Version différente du jeu : recharge la page (Ctrl+F5) chez toi et chez ton ami.';let NVT=0;
const netVerT=()=>performance.now()-NVT<4000;
function netVerHost(P){P.nver=1;net.peers=net.peers.filter(x=>x!==P);try{P.conn.send({t:'nver'})}catch(e){}setTimeout(()=>{try{P.conn.close()}catch(e){}},300);setStat('Un ami a une autre version du jeu : il doit recharger la page.');try{sendLobby()}catch(e){}}
function netVerGuest(){NVT=performance.now();netReset();state='menu';setStat(VERMSG);try{netUI(true)}catch(e){}}
// demande d'un joueur (roue de B) : hors ligne / hôte → appliquée tout de suite ; invité → envoyée à l'hôte ({t:'eq',a:'fav',s:i}), réponse par bmAck
const BARNET={seq:0,wait:null};
function barReq(i){if(isGuest()&&net.live){const q=++BARNET.seq;BARNET.wait={q,i,t:performance.now()};netSend({t:'eq',a:'fav',s:i,q});return{ok:true,pend:true,net:true,q}}
 if(!player)return{ok:false,e:'unit'};return barFav(player,i)}
// hôte : valide la demande d'un invité (n° de barre entier, dans SA liste de barres reçue avec son build, contenu revérifié), au plus 12 par seconde et par invité, puis répond
function bmNet(P,d){const rep=o=>{try{P.conn.send(Object.assign({t:'eqr',q:d&&Number.isInteger(d.q)?d.q:0},o))}catch(e){}return o};
 const now=performance.now();P.eqT=(P.eqT||[]).filter(t=>now-t<1000);if(P.eqT.length>=12)return rep({ok:false,e:'rate'});P.eqT.push(now);
 if(state==='menu')return rep({ok:false,e:'state'});const u=units.find(x=>x.ctrl==='remote'&&x.rid===P.id);if(!u)return rep({ok:false,e:'unit'});
 if(!d||d.a!=='fav')return rep({ok:false,e:'bar'});const r=barFav(u,d.s);rep(r);return r}
// invité : réponse de l'hôte (la barre elle-même arrive par l'instantané)
function bmAck(d){if(!d)return;const r={q:d.q|0,ok:!!d.ok,e:typeof d.e==='string'?d.e:'',pend:!!d.pend},w=BARNET.wait;if(w&&w.q===(d.q|0)){BARNET.wait=null;if(d.ok&&player){if(d.pend)player.favQ=w.i;else{player.favI=w.i;player.favQ=null}}}try{BMUI.ack(r,w)}catch(e){}}
AFTER.push(()=>{if(!UK.includes('barS'))UK.push('barS')});
// hôte : build d'un invité reçu pendant un match (P.bq, voir mknaruto.py) : appliqué au retour au menu
function netBuildQ(){if(state!=='menu'||!net||net.role!=='host')return;let ch=false;for(const P of net.peers)if(P.bq){P.b=P.bq;P.bq=null;P.c='p'+P.id;CH[P.c]=mkNinja(P.b,true);P.ready=false;ch=true}if(ch)try{sendLobby()}catch(e){}}
// ---------- bots ----------
// ordre d'essai des cases : barre du rang S au rang D, puis dash et Kawarimi
function aiOrder(u){const o=[];for(let i=BAR0;i<BAR0+BARN;i++)if(u.ch.abil[i])o.push(i);const rk=i=>RANKO.indexOf(u.ch.abil[i].rank);o.sort((a,b)=>rk(b)-rk(a)||a-b);o.push(DASHI,SHUNI);return o}
// case de la barre au rang le plus haut (jutsu à garder du chakra pour), -1 si aucune
function bestRankI(u){let b=-1,r=-1;for(let i=BAR0;i<BAR0+BARN;i++){const ab=u.ch.abil[i];if(!ab||!ab.rank)continue;const k=RANKO.indexOf(ab.rank);if(k>r){r=k;b=i}}return b}
// bot : il change seulement entre SES barres favorites (comme un joueur avec la roue de B) : contrôle toutes les AIBAR.dt s, au plus un changement toutes les AIBAR.gap s ;
// quand sa barre est presque toute en recharge (au plus AIBAR.low de ses jutsu prêts), il passe à la barre qui a le plus de jutsu prêts (au moins AIBAR.gain de plus)
const AIBAR={dt:.5,gap:6,low:.34,soon:1.5,gain:2};
function aiBar(u){if(!u.ch||!u.ch.jab||u.ctrl||u.dead||u.barQ)return false;const L=barsOf(u);if(L.length<2)return false;
 if((u.aiSwT||0)>SIMT)return false;u.aiSwT=SIMT+AIBAR.dt;if((u.aiBarT||0)>SIMT||barBusy(u).size)return false;
 const rdy=b=>{let n=0,f=0;for(const j of b){const ab=j>=0&&u.ch.jab[j];if(!ab)continue;f++;if(remCd(u,j)<=AIBAR.soon)n++}return[n,f]};
 const [n0,f0]=rdy(u.ch.bar);if(f0&&n0>f0*AIBAR.low)return false;
 const cur=favCur(u);let best=-1,bn=n0+AIBAR.gain-1;L.forEach((q,i)=>{if(i===cur||barEq(q.b,u.ch.bar))return;const [n]=rdy(q.b);if(n>bn){bn=n;best=i}});
 if(best<0)return false;const r=barFav(u,best);if(r.ok){u.aiBarT=SIMT+AIBAR.gap;u.aiBarN=(u.aiBarN|0)+1}return r.ok}
// ---------- barres d'un kit tiré au hasard (bots, nouveau perso, « Kit aléatoire ») : sa barre puis des barres qui couvrent TOUS ses jutsu appris (barsCover, nr_tree.js) ----------
// sans tirage (les autres bots ne changent pas) ; 15 jutsu appris = 3 barres, comme les persos de l'anime (une seule barre laissait 9 jutsu inutilisés : 94 % de défaites contre eux)
function autoBars(o){const b=(o.bar||autoBar(o)).slice();return barsCover(o,[{n:barTheme(o,b,[]),b}])}
// ---------- branchement de l'interface (roue des barres : nr_radial.js) ----------
// mknaruto.py appelle : BMUI.frame(dt) au début de chaque image (avant la simulation et l'envoi des touches de l'invité), BMUI.draw() après le HUD,
// BMUI.esc() sur Échap en combat (vrai = la roue s'est fermée, pas de menu Quitter), BMUI.ack(r) à la réponse de l'hôte. La roue ne bloque aucune autre entrée.
const BMUI={open:false,frame(dt){},draw(){},esc(){return false},ack(r){}};

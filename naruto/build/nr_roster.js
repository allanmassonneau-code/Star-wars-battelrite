// ---------- Menu : liste des persos (grille par village), fiche, choix de l'adversaire, création ----------
// scr : écran du menu = 'list' (liste des persos), 'opp' (arène ou duel hors ligne : choix de l'adversaire), 'edit' (création / modification : drawCreator, nr_menu.js)
// persos : les tiens (« Mes ninjas », clé 'm'+id) et ceux de l'anime (clé 'a:'+nom ; leur kit et leur apparence se retouchent, la retouche est gardée par perso)
// MEK : clé du perso joué (MY = sa build, CH.p0 = son ninja) ; FK : perso montré par la fiche (la carte où la souris s'arrête, voir rosHover) ; OPPK : adversaire choisi ('o0' le temps d'un startMatch)
// OPPT : moment où l'étape adversaire s'ouvre (un double-clic sur la carte choisie ne lance pas un combat contre son double)
let scr='list',ED=null,CONF=null,OPPK=null,MEK=null,FK=null,RQ='',rosScroll=0,rosTarget=0,RL=null,RLAY=null,RFL=null,OPPT=0;
const RKEY='nrRoster1',RSIM=/[?&]sim=1(&|$)/.test(location.search);
// sections de la liste : [nom, couleur, emblème] ; « Mes ninjas » toujours en tête, une section sans perso n'est pas affichée
const SECS=[['Mes ninjas','#ffb347','star'],['Konoha','#6ac46a','leaf'],['Suna','#d8a860','sand'],['Kiri','#5ab8d8','mist'],['Kumo','#e8d860','cloud'],['Iwa','#b88a60','rock'],['Oto','#a87ae0','note'],['Ame','#8a9ac0','rain'],['Akatsuki','#e0383a','aka'],['Autres ninjas','#c86a8a','shur']];
// section d'un perso de l'anime : P.sec, sinon d'après son groupe g (Équipe 7, Sannin & Hokage → Konoha…)
const rosSec=P=>Math.max(1,SECS.findIndex(S=>S[0]===(P.sec||['Konoha','Akatsuki','Konoha','Konoha','Suna','Oto','Kiri','Autres ninjas'][P.g])));
// ----- sauvegarde : { v, nid, mine:[{id,build}], anime:{nom du perso: build retouchée}, last:{me,opp} } ; une build garde le nom de ses jutsu et de son style (juste si le catalogue évolue)
const bOut=b=>Object.assign({},b,{l:Object.assign({},b.l),j:b.j.slice(),jn:b.j.slice(1).map(id=>JL[id]?JL[id].n:''),sn:STYLES[b.j[0]]?STYLES[b.j[0]][0]:''});
function bIn(b){try{if(!b||typeof b!=='object')return null;b=legacyLook(JSON.parse(JSON.stringify(b)));const j=Array.isArray(b.j)?b.j.slice(0,6):[];
 if(typeof b.sn==='string'){const i=STYLES.findIndex(s=>s[0]===b.sn);if(i>=0)j[0]=i}if(Array.isArray(b.jn))for(let s=1;s<6;s++)j[s]=pickName(b,b.jn[s-1]);
 b.j=j;delete b.jn;delete b.sn;return sanitizeBuild(b)}catch(e){return null}}
const kitSig=b=>JSON.stringify([b.voie,b.nat,b.clan,b.pass,b.j,b.l]);
const PB=[],presetOf=i=>PB[i]||(PB[i]=presetBuild(i,PRESETS[i].n,PRESETS[i].side)); // build d'origine d'un perso de l'anime (ne jamais la modifier)
let ROS={mine:[],anime:{},last:{},nid:1};
// première fois : le ninja de l'ancien créateur ('nrBuild4') devient le premier de « Mes ninjas » (sauf si c'est un perso de l'anime tel quel)
function rosMigrate(){const R={mine:[],anime:{},last:{me:'a:'+PRESETS[0].n},nid:1};let has=false;try{has=!!(localStorage.getItem('nrBuild4')||localStorage.getItem('nrBuild3'))}catch(e){}
 if(!has)return R;let b=null;try{b=loadMine()}catch(e){}if(!b)return R;
 const i=PRESETS.findIndex((P,k)=>(b.name===P.n||b.name==='Ninja')&&b.side===P.side&&kitSig(b)===kitSig(presetOf(k))); // perso de l'anime tel quel = même nom, même camp, même kit
 if(i>=0)R.last.me='a:'+PRESETS[i].n;else{R.mine.push({id:1,build:bOut(b)});R.nid=2;R.last.me='m1'}return R}
// chargement : tout passe par sanitizeBuild ; JSON illisible = liste vide (sans planter)
function rosLoad(){let raw=null,R=null;try{raw=localStorage.getItem(RKEY)}catch(e){}
 if(raw==null)R=rosMigrate();else try{R=JSON.parse(raw)}catch(e){R=null}
 const o={mine:[],anime:{},last:{},nid:1};
 if(R&&typeof R==='object'){
  if(Array.isArray(R.mine))for(const m of R.mine){const id=m&&m.id|0,b=m&&bIn(m.build);if(b&&id>0&&!o.mine.some(x=>x.id===id))o.mine.push({id,build:b})}
  if(R.anime&&typeof R.anime==='object')for(const P of PRESETS)if(R.anime[P.n]){const b=bIn(R.anime[P.n]);if(b)o.anime[P.n]=b}
  const L=R.last&&typeof R.last==='object'?R.last:{};for(const k of['me','opp'])if(typeof L[k]==='string')o.last[k]=L[k];
  o.nid=Math.max(1,R.nid|0,...o.mine.map(m=>m.id+1))}
 ROS=o;RL=RLAY=null;if(raw==null)rosSave()}
function rosSave(){if(RSIM)return;try{localStorage.setItem(RKEY,JSON.stringify({v:1,nid:ROS.nid,mine:ROS.mine.map(m=>({id:m.id,build:bOut(m.build)})),anime:Object.fromEntries(Object.entries(ROS.anime).map(([n,b])=>[n,bOut(b)])),last:ROS.last}))}catch(e){}}
// ----- liste des persos : {k, b build, sec section, P perso de l'anime (+ i son indice, mod retouché) ou id (les tiens)}
function rosEntries(){if(RL)return RL;RL=[];
 for(const m of ROS.mine)RL.push({k:'m'+m.id,id:m.id,b:m.build,sec:0});
 PRESETS.map((_,i)=>i).sort((a,b)=>PRESETS[a].g-PRESETS[b].g||a-b).forEach(i=>{const P=PRESETS[i],m=ROS.anime[P.n];RL.push({k:'a:'+P.n,i,P,b:m||presetOf(i),mod:!!m,sec:rosSec(P)})});
 return RL}
const rosGet=k=>k&&rosEntries().find(e=>e.k===k)||null;
// kit au-dessus du budget (ex. une sauvegarde faite avant qu'une passe d'équilibrage change un rang) : il ne se joue pas, la création propose de le corriger
const rosOver=E=>!!E&&kitCost(E.b)>budgetOf(E.b);
function rosOverWarn(E){if(!rosOver(E))return false;CONF={t:`${E.b.name} : trop de points (${kitCost(E.b)} / ${budgetOf(E.b)})`,d:'Son kit dépasse le budget de points (le coût d\'un jutsu a pu changer depuis qu\'il a été fait). Ouvre la création et baisse le rang d\'un jutsu pour pouvoir le jouer.',ok:'Modifier',no:'Annuler',col:'#ff8a5a',fn:()=>rosEdit(E.k)};return true}
function rosChanged(){RL=RLAY=null;rosSave()}
// recherche par nom (sans accents ni majuscules) : nom, nom complet, village, clan, nature
const fold=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const rosMatch=E=>!RQ||fold([E.b.name,E.P?E.P.full:'',SECS[E.sec][0],E.b.clan>=0?CLANS[E.b.clan][0]:'sans clan',E.b.clan===TAIJ?'':NATURES[E.b.nat][0]].join(' ')).includes(RQ);
// ninjas d'aperçu : un par perso, refait quand sa build change (modèle 3D gardé tant qu'il s'affiche) ; stats recalculées si le profil d'équilibrage change
const RF=new Map(),blVer=()=>{try{return BLC.sig||''}catch(e){return''}};
function rosFake(E){let F=RF.get(E.k);const v=blVer();
 if(!F||F.b!==E.b){const ch=mkNinja(E.b),o=CH.p0;CH.p0=ch;const u=mkUnit('p0',0,0,ch.side);CH.p0=o;F={b:E.b,ch,u,v};RF.set(E.k,F)}
 else if(F.v!==v){const n=mkNinja(E.b);for(const f of['hp','spd','pw','abil','desc'])F.ch[f]=n[f];F.v=v}return F}
// ninja d'une carte en 3D : la case de l'atlas est copiée dans une image propre à la carte ; le ninja n'est rendu en 3D que survolé (il pivote et marche),
// à son apparition et un instant après le survol (le temps que la pose se pose) : au repos, la carte redessine son image (une liste de 40 ninjas ≈ 1 à 3 rendus 3D par image)
function cardChar(F,x,y,s,hov,t){const u=F.u;if(!(N3.ok&&N3.on&&OPT.p3d!==false))return drawChar3(u,x,y,s);
 if(hov||F.liveT==null)F.liveT=t+(hov?.8:.7);const tl=N3.tile.get(u),sk=u.ch.look.scale||1,w=TWU*s*sk,h=THU*s*sk;
 if(tl&&(t<F.liveT||!F.ok)){if(!F.snap||F.snap.width!==TPW||F.snap.height!==TPH){F.snap=document.createElement('canvas');F.snap.width=TPW;F.snap.height=TPH}const c=F.snap.getContext('2d');c.clearRect(0,0,TPW,TPH);c.drawImage(N3.cv,tl.sx,tl.sy,TPW,TPH,0,0,TPW,TPH);F.ok=1;F.snapV=(F.snapV|0)+1}
 if(t<F.liveT||!F.ok)N3.req.add(u);
 if(F.ok)g.drawImage(F.snap,0,0,F.snap.width,F.snap.height,x-w/2,y-h+FOOT*s*sk,w,h);else drawChar(u,x,y,s)}
const FFK={},fakeFor=(s,ch)=>{let f=FFK[s];if(!f||f.ch!==ch){const o=CH.p0;CH.p0=ch;f=FFK[s]={ch,u:mkUnit('p0',0,0,ch.side)};CH.p0=o}return f.u}; // ninjas de la fiche (animés à part des cartes)
// ----- disposition : onglets, grille (bandes de sections : les petites sections partagent une rangée), fiche, barre du bas
const RGX=30,RGY=174,RGW=1220,RGH=290,RCH=116,NCOL=10,RCW=(RGW-14-(NCOL-1)*8)/NCOL,RGAP=18;
const FI={x:30,y:476,w:1220,h:194},newBtn={x:30,y:677,w:250,h:36},oppBack={x:30,y:110,w:150,h:28},oppRnd={x:1060,y:110,w:190,h:28},RQR={x:1030,y:143,w:220,h:26};
function rosLayout(){if(RLAY)return RLAY;const L=[],Hd=[],gw=RGW-14,st=RCW+8;let y=0,cx=-1;
 const close=()=>{if(cx>=0){y+=24+RCH+12;cx=-1}};
 SECS.forEach((S,si)=>{const it=rosEntries().filter(e=>e.sec===si&&rosMatch(e)).map(e=>({e}));if(si===0&&!RQ)it.push({plus:1});if(!it.length)return;const n=it.length,cnt=it.filter(q=>q.e).length;
  if(n>NCOL){close();Hd.push({si,x:0,y,w:gw,n:cnt});it.forEach((q,k)=>L.push(Object.assign(q,{x:RGX+(k%NCOL)*st,y:y+24+Math.floor(k/NCOL)*(RCH+8),w:RCW,h:RCH})));y+=24+Math.ceil(n/NCOL)*(RCH+8)+4;return}
  const w=n*st-8;if(cx>=0&&cx+RGAP+w<=gw)cx+=RGAP;else{close();cx=0}
  Hd.push({si,x:cx,y,w,n:cnt});it.forEach((q,k)=>L.push(Object.assign(q,{x:RGX+cx+k*st,y:y+24,w:RCW,h:RCH})));cx+=w});
 close();return RLAY={L,Hd,total:Math.max(0,y-12)}}
const rosMax=()=>Math.max(0,rosLayout().total-RGH);
function rosTabs(){const Y=rosLayout();let x=RGX;g.font=FNT(12.5,'bold');return Y.Hd.map(h=>{const s=`${SECS[h.si][0]} (${h.n})`,w=g.measureText(s).width+38,R={x,y:144,w,h:24,s,si:h.si,top:h.y};x+=w+6;return R})}
// fait voir un perso (défile jusqu'à lui, en-tête de sa section compris)
function rosReveal(k){const it=rosLayout().L.find(q=>q.e&&q.e.k===k);if(!it)return;if(it.y-24<rosTarget)rosTarget=it.y-24;else if(it.y+RCH>rosTarget+RGH)rosTarget=it.y+RCH-RGH+4;rosTarget=clamp(rosTarget,0,rosMax())}
// ----- actions
// perso choisi : il devient ton ninja (en ligne : envoyé à l'hôte ou diffusé dans le salon, comme avant)
function rosUse(E){if(E.k===MEK&&coop())return;MEK=E.k;ROS.last.me=E.k;rosSave();MY=sanitizeBuild(E.b);rebuildMine()}
// clic sur un perso : en ligne il devient le tien (puis PRÊT) ; bataille = combat direct ; arène / duel hors ligne = étape « adversaire »
function rosPick(E){if(!E)return;if(scr==='opp')return rosFight(E);FK=E.k;if(rosOverWarn(E))return;rosUse(E);if(coop())return;
 if(mode==='battle'){startMatch('p0');return}
 scr='opp';OPPT=performance.now();const o=ROS.last.opp;FK=o&&o!==MEK&&rosGet(o)?o:MEK}
// combat contre E ; l'adversaire est mis dans le camp d'en face s'il est du tien (titres des équipes, tableau des scores et message de fin suivent le camp)
function rosFight(E){if(!E||!rosGet(MEK)){scr='list';return}if(performance.now()-OPPT<500)return; // 2e clic d'un double-clic : ignoré
 FK=E.k;if(rosOverWarn(E))return;CH.o0=mkNinja(E.b.side===MY.side?Object.assign({},E.b,{side:1-MY.side}):E.b,true);OPPK='o0';ROS.last.opp=E.k;rosSave();scr='list';FK=MEK;startMatch('p0')}
function rosRandomOpp(){const L=rosEntries().filter(e=>e.k!==MEK&&!rosOver(e));if(L.length)rosFight(L[Math.floor(Math.random()*L.length)])}
function rosBack(){scr='list';FK=MEK}
function dupName(n){const base=String(n).replace(/ \(\d+\)$/,''),used=new Set(rosEntries().map(e=>e.b.name));for(let i=2;;i++){const suf=` (${i})`,s=base.slice(0,16-suf.length).trimEnd()+suf;if(!used.has(s)||i>99)return s}}
function rosDup(E){const id=ROS.nid++;ROS.mine.push({id,build:sanitizeBuild(Object.assign({},E.b,{name:dupName(E.b.name)}))});rosChanged();FK='m'+id;RFL={k:FK,t:performance.now()};rosReveal(FK)}
function rosDel(E){ROS.mine=ROS.mine.filter(m=>m.id!==E.id);if(ROS.last.opp===E.k)delete ROS.last.opp;rosChanged();RF.delete(E.k);DC.delete('c:'+E.k);if(MEK===E.k)rosUse(rosGet('a:'+PRESETS[0].n));if(FK===E.k)FK=MEK}
function rosReset(E){delete ROS.anime[E.P.n];rosChanged();if(MEK===E.k){MEK=null;rosUse(rosGet(E.k))}FK=E.k;RFL={k:E.k,t:performance.now()}}
function rosAct(k,E){if(k==='play'||k==='fight')rosPick(E);else if(k==='rnd')rosRandomOpp();else if(k==='edit')rosEdit(E.k);else if(k==='dup')rosDup(E);else if(k==='back')rosBack();
 else if(k==='del')CONF={t:`Supprimer « ${E.b.name} » ?`,d:'Ce ninja sera retiré de « Mes ninjas », avec son apparence et son kit. C\'est définitif.',ok:'Supprimer',col:'#ff6a5a',fn:()=>rosDel(E)};
 else if(k==='reset')CONF={t:`Rétablir ${E.P.full} ?`,d:'Ses retouches (apparence et kit) sont effacées : il redevient tel que dans l\'anime.',ok:'Rétablir l\'original',col:'#ffb347',fn:()=>rosReset(E)}}
// ----- création / modification : EB est une copie de travail, rien n'est gardé ni envoyé avant « Enregistrer »
function rosEdit(k){const E=k?rosGet(k):null;picker=null;presetI=E&&E.P?E.i:-1;if(RQI)RQI.blur();
 if(coop()&&net.ready){net.ready=false;if(net.role==='host')sendLobby();else netSend({t:'ready',v:false})} // en ligne : on n'est plus PRÊT pendant la création (la partie ne part pas sans toi)
 EB=E?sanitizeBuild(E.b):randomBuild(srnd(Date.now()%2147483646+1),0,'Nouveau ninja');edRebuild();ED={k:E?k:null,o:JSON.stringify(EB)};scr='edit'}
const edDirty=()=>!!ED&&!!EB&&JSON.stringify(EB)!==ED.o;
function edSave(){EB=sanitizeBuild(EB);let k=ED.k;const E=k?rosGet(k):null;
 if(!E){const id=ROS.nid++;ROS.mine.push({id,build:EB});k='m'+id}
 else if(!E.P){const m=ROS.mine.find(m=>m.id===E.id);if(m)m.build=EB}
 else if(EB.name===E.P.n&&EB.side===E.P.side&&kitSig(EB)===kitSig(presetOf(E.i)))delete ROS.anime[E.P.n];else ROS.anime[E.P.n]=EB; // retouche identique à l'original : rien à garder
 rosChanged();ED=null;scr='list';picker=null;FK=k;RFL={k,t:performance.now()};
 if(k===MEK){MEK=null;rosUse(rosGet(k))} // le perso joué a changé : MY suit (et en ligne, le salon aussi)
 rosReveal(k)}
function edClose(){scr='list';ED=null;picker=null}
function edCancel(){if(edDirty())CONF={t:'Quitter sans enregistrer ?',d:'Les changements faits sur ce perso seront perdus.',ok:'Quitter',no:'Continuer',col:'#ff8a5a',fn:edClose};else edClose()}
// ----- fenêtre de confirmation (dessinée dans le canevas) : Entrée = oui, Échap = non
const confBox=()=>({x:W/2-250,y:H/2-95,w:500,h:190}),confBtns=()=>{const B=confBox();return[{x:B.x+B.w/2-205,y:B.y+B.h-58,w:195,h:40},{x:B.x+B.w/2+10,y:B.y+B.h-58,w:195,h:40}]};
function drawConf(){if(!CONF)return;const B=confBox(),c=CONF.col||'#ff9a3a',[a,b]=confBtns();g.fillStyle='rgba(0,0,0,.62)';g.fillRect(0,0,W,H);
 g.save();g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=24;rr(B,14,'rgba(26,17,10,.98)',c,2);g.restore();
 fitT(CONF.t,B.x+B.w/2,B.y+42,20,'#ffd38a',B.w-40,'bold',13,'center');wrapL(CONF.d,B.w-60,FNT(13)).slice(0,3).forEach((l,i)=>text(l,B.x+B.w/2,B.y+74+i*18,13,'#e8cfa8','center','normal'));
 {const h=inRect(mouse,a);rr(a,a.h/2,h?'#fff0d0':c,null);fitT(CONF.ok,a.x+a.w/2,a.y+26,15,'#1a1008',a.w-20,'bold',11,'center')}
 {const h=inRect(mouse,b);rr(b,b.h/2,h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)','#8a5a2a',1.5);fitT(CONF.no||'Annuler',b.x+b.w/2,b.y+26,15,'#f3d9b0',b.w-20,'bold',11,'center')}
 text('Entrée : '+CONF.ok.toLowerCase()+' · Échap : '+(CONF.no||'annuler').toLowerCase(),B.x+B.w/2,B.y+B.h-8,10.5,'#9a8060','center','normal')}
// ----- petits dessins : icônes des boutons, emblème de section (village ou groupe)
function uiIcon(k,x,y,s,c){g.save();g.translate(x,y);g.scale(s/10,s/10);g.strokeStyle=c;g.fillStyle=c;g.lineWidth=1.9;g.lineCap='round';g.lineJoin='round';g.beginPath();
 switch(k){case'edit':g.moveTo(-6.5,6.5);g.lineTo(-5.5,2.5);g.lineTo(3.5,-6.5);g.lineTo(6.5,-3.5);g.lineTo(-2.5,5.5);g.closePath();g.stroke();g.beginPath();g.moveTo(1.5,-4.5);g.lineTo(4.5,-1.5);g.stroke();break
  case'dup':g.roundRect(-7,-3,10,10,2);g.stroke();g.beginPath();g.moveTo(-3,-4);g.lineTo(-3,-7);g.lineTo(7,-7);g.lineTo(7,3);g.lineTo(4,3);g.stroke();break
  case'del':g.moveTo(-7,-4.5);g.lineTo(7,-4.5);g.moveTo(-2.5,-4.5);g.lineTo(-2,-7);g.lineTo(2,-7);g.lineTo(2.5,-4.5);g.moveTo(-5,-4.5);g.lineTo(-4,7);g.lineTo(4,7);g.lineTo(5,-4.5);g.moveTo(-1.5,-1.5);g.lineTo(-1.5,4);g.moveTo(1.5,-1.5);g.lineTo(1.5,4);g.stroke();break
  case'reset':g.arc(0,.5,6,-2.3,2.5);g.stroke();g.beginPath();g.moveTo(-7.4,-6.6);g.lineTo(-4,-4.2);g.lineTo(-8.2,-2.4);g.closePath();g.fill();break
  case'plus':g.lineWidth=2.6;g.moveTo(-6,0);g.lineTo(6,0);g.moveTo(0,-6);g.lineTo(0,6);g.stroke();break
  case'play':g.moveTo(-4,-6.5);g.lineTo(7,0);g.lineTo(-4,6.5);g.closePath();g.fill();break
  case'back':g.moveTo(6,0);g.lineTo(-6,0);g.moveTo(-1.5,-5);g.lineTo(-6.5,0);g.lineTo(-1.5,5);g.stroke();break
  case'check':g.lineWidth=2.4;g.moveTo(-6,0);g.lineTo(-2,4.5);g.lineTo(6.5,-5);g.stroke();break
  case'dice':g.roundRect(-7,-7,14,14,3);g.stroke();for(const [a,b] of[[-3.5,-3.5],[3.5,3.5],[0,0],[3.5,-3.5],[-3.5,3.5]]){g.beginPath();g.arc(a,b,1.3,0,7);g.fill()}break
  case'search':g.arc(-1.5,-1.5,5,0,7);g.stroke();g.beginPath();g.moveTo(2.2,2.2);g.lineTo(6.5,6.5);g.stroke();break}
 g.restore()}
function secMark(x,y,r,si){const S=SECS[si],c=S[1];g.save();g.fillStyle='rgba(20,13,8,.9)';g.strokeStyle=c;g.lineWidth=1.5;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.stroke();
 g.translate(x,y);g.scale(r/8,r/8);g.strokeStyle=c;g.fillStyle=c;g.lineWidth=1.4;g.lineCap='round';g.beginPath();
 switch(S[2]){case'star':for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?2.2:5.2;g.lineTo(Math.cos(a)*q,Math.sin(a)*q)}g.closePath();g.fill();break
  case'leaf':g.arc(0,.5,3.4,-.2,5);g.moveTo(3.3,-.2);g.lineTo(5.4,-3.6);g.stroke();break
  case'sand':g.moveTo(-3.5,-4.5);g.lineTo(3.5,-4.5);g.lineTo(-3.5,4.5);g.lineTo(3.5,4.5);g.closePath();g.stroke();break
  case'mist':for(let k=0;k<4;k++){g.moveTo(-3.6+k*2.4,-4);g.lineTo(-3.6+k*2.4,4)}g.stroke();break
  case'cloud':g.arc(-2.2,1,2.4,0,7);g.arc(2.2,1,2.4,0,7);g.arc(0,-1.6,2.6,0,7);g.fill();break
  case'rock':g.moveTo(-5,4);g.lineTo(-1.5,-3.5);g.lineTo(.8,.5);g.lineTo(2.6,-1.8);g.lineTo(5,4);g.closePath();g.fill();break
  case'note':g.ellipse(-1.6,3,2.4,1.8,-.4,0,7);g.fill();g.beginPath();g.moveTo(.6,2.6);g.lineTo(.6,-5);g.lineTo(3.8,-3);g.stroke();break
  case'rain':for(let k=0;k<3;k++){g.moveTo(-3.5+k*3.5,-4+(k%2)*2);g.lineTo(-4.5+k*3.5,1+(k%2)*2)}g.stroke();break
  case'aka':g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,5.4,3.6,0,0,7);g.fill();g.fillStyle='#c0202a';g.beginPath();g.ellipse(0,0,4.2,2.5,0,0,7);g.fill();break
  default:for(let i=0;i<8;i++){const a=i*Math.PI/4,q=i%2?1.6:5.2;g.lineTo(Math.cos(a)*q,Math.sin(a)*q)}g.closePath();g.fill()}
 g.restore()}
function tag(xr,y,s,bg,fg='#1a1008'){g.font=FNT(10,'bold');const w=g.measureText(s).width+10;rr({x:xr-w,y,w,h:16},5,bg);text(s,xr-w/2,y+12,10,fg)}
// boutons d'une carte survolée (liste) : modifier, dupliquer, supprimer (les tiens) ou rétablir (perso de l'anime retouché)
const cardBtns=(E,R)=>{const L=[['edit','Modifier'],['dup','Dupliquer']];if(!E.P)L.push(['del','Supprimer']);else if(E.mod)L.push(['reset','Rétablir l\'original']);return L.map((q,i)=>({k:q[0],t:q[1],R:{x:R.x+R.w-26-(L.length-1-i)*24,y:R.y+6,w:21,h:21}}))};
const BTIP={edit:'Ouvre la création sur ce perso : apparence, clan, nature, voie, passif et jutsu.',dup:'Fait une copie dans « Mes ninjas », à retoucher sans toucher à l\'original.',del:'Retire ce ninja de « Mes ninjas » (une confirmation est demandée).',reset:'Efface tes retouches : le perso redevient tel que dans l\'anime.'};
// ----- carte d'un perso : aperçu animé (halo du chakra, couleur de la section), emblème, nom, clan et nature
function rosCard(E,R,hov,t){const F=rosFake(E),u=F.u,ch=F.ch,S=SECS[E.sec],col=S[1],me=E.k===MEK,mark=scr==='opp'?me:coop()&&me,fl=RFL&&RFL.k===E.k&&performance.now()-RFL.t<1600,b=E.b,fk=E.k===FK&&!hov;
 rr(R,10,hov?'rgba(72,48,24,.98)':mark?'rgba(84,54,24,.97)':fk?'rgba(52,34,18,.97)':'rgba(30,20,12,.95)',hov?'#ffb347':mark||fl?'#ffd38a':fk?'#e8a050':rgba(col,.5),hov||mark||fl||fk?2:1.2);
 if(fk){g.fillStyle='#e8a050';g.beginPath();g.moveTo(R.x+R.w/2-7,R.y+R.h-1);g.lineTo(R.x+R.w/2+7,R.y+R.h-1);g.lineTo(R.x+R.w/2,R.y+R.h+5);g.closePath();g.fill()} // la carte montrée par la fiche
 const ph=76,px=R.x+R.w/2,fy=R.y+ph-1;g.save();g.beginPath();g.roundRect(R.x+3,R.y+3,R.w-6,ph,8);g.clip();
 {const gr=g.createLinearGradient(0,R.y,0,R.y+ph);gr.addColorStop(0,rgba(col,hov?.32:.2));gr.addColorStop(1,rgba(col,.02));g.fillStyle=gr;g.fillRect(R.x,R.y,R.w,ph+4)}
 {const kc=ch.look.weapon.col;g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(px,fy-32,0,px,fy-32,52);gr.addColorStop(0,rgba(kc,hov?.3:.13));gr.addColorStop(1,rgba(kc,0));g.fillStyle=gr;g.fillRect(R.x,R.y,R.w,ph+4);g.globalCompositeOperation='source-over'}
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(px,fy-3,24,6,0,0,7);g.fill();
 u.aim=hov?Math.PI/2+Math.sin(t*1.6)*1.3:Math.PI/2-.3;u.moving=hov&&Math.sin(t*.9)>.1;u.walk=t*13;u.swing=0;
 {const sc=ch.look.scale>1?.88:.98;drawPrevN(u,px,fy,sc,0);cardChar(F,px,fy,sc,hov,t);drawPrevN(u,px,fy,sc,1)}g.restore();
 g.fillStyle=rgba(col,.8);g.fillRect(R.x+8,R.y+ph+4,R.w-16,1.5);secMark(R.x+14,R.y+14,8,E.sec);
 fitT(b.name,R.x+R.w/2,R.y+ph+20,14,b.side?'#ffb0a0':'#ffd38a',R.w-12,'bold',10,'center');
 {const ic=[];ic.push(b.clan>=0?['c'+b.clan,CLANS[b.clan][1]]:['u','#c8b89a']);if(b.clan!==TAIJ)ic.push(['n'+b.nat,NATURES[b.nat][2]]);
  const s=(b.clan>=0?CLANS[b.clan][0]:'Sans clan')+(b.clan!==TAIJ?' · '+NATURES[b.nat][0]:''),z=10;g.font=FNT(z,'bold');const tw=Math.min(R.w-14-ic.length*15,g.measureText(s).width),x0=R.x+R.w/2-(ic.length*15+tw)/2;
  ic.forEach(([k,c2],i)=>jIcon(x0+6+i*15,R.y+ph+31,6,c2,k));fitT(s,x0+ic.length*15+1,R.y+ph+35,z,'#d8c0a0',tw+1,'bold',8)}
 if(hov&&scr==='list'){for(const q of cardBtns(E,R)){const h=inRect(mouse,q.R);rr(q.R,6,h?'#ffb347':'rgba(20,13,8,.88)',h?'#ffe0a0':'#8a5a2a',1.2);uiIcon(q.k,q.R.x+q.R.w/2,q.R.y+q.R.h/2,8.5,h?'#1a1008':'#f3d9b0');if(h)hoverTip('cb'+q.k+E.k,()=>({t:q.t,d:BTIP[q.k]}))}}
 else if(scr==='opp'&&hov)tag(R.x+R.w-6,R.y+7,me?'TON DOUBLE':'AFFRONTER','#ff6a3a','#fff');
 else if(mark)tag(R.x+R.w-6,R.y+7,scr==='opp'?'TOI':'CHOISI','#ffd38a');else if(rosOver(E))tag(R.x+R.w-6,R.y+7,'TROP CHER','#d84a3a','#fff');else if(E.mod)tag(R.x+R.w-6,R.y+7,'RETOUCHÉ','rgba(255,179,71,.85)')}
// dessin mis en cache : fn dessine (avec les fonctions de dessin habituelles, g pointant le temps de l'appel sur l'image) dans une image propre à id,
// refaite seulement quand key change, puis recopiée à chaque image en tombant juste sur les pixels de l'écran (texte net)
const DC=new Map(),OID=new WeakMap();let OIDN=0;const oid=o=>{if(!o||typeof o!=='object')return 0;let v=OID.get(o);if(!v){v=++OIDN;OID.set(o,v)}return v};
function cachedDraw(id,R,key,fn){const dx=R.x*RS,dy=R.y*RS,ix=Math.floor(dx)-4,iy=Math.floor(dy)-4,cw=Math.ceil(R.w*RS)+12,chh=Math.ceil(R.h*RS)+16,k=key+'|'+RS+'|'+(dx-ix).toFixed(2)+'|'+(dy-iy).toFixed(2);
 let c=DC.get(id);if(!c){c={cv:document.createElement('canvas'),key:null};DC.set(id,c)}
 if(c.key!==k){c.key=null;if(c.cv.width!==cw||c.cv.height!==chh){c.cv.width=cw;c.cv.height=chh}const og=g;try{g=c.cv.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cw,chh);g.setTransform(RS,0,0,RS,-ix,-iy);g.imageSmoothingEnabled=true;fn()}finally{g=og}c.key=k}
 g.drawImage(c.cv,ix/RS,iy/RS,cw/RS,chh/RS)}
// carte au repos : dans son image (cachedDraw), refaite si son état change (build, pose du ninja 3D, badges, carte de la fiche, échelle) ;
// survolée, en train de poser son ninja 3D, en flash ou pendant un défilement, elle est dessinée en direct
function rosCardC(E,R,t){const F=rosFake(E),d3=!!(N3.ok&&N3.on&&OPT.p3d!==false);
 if(d3&&(F.liveT==null||t<F.liveT||!F.ok)||RFL&&RFL.k===E.k&&performance.now()-RFL.t<1600||rosScroll!==rosTarget)return rosCard(E,R,false,t);
 cachedDraw('c:'+E.k,R,[oid(F.b),F.snapV|0,d3,E.k===MEK,E.k===FK,E.mod,rosOver(E),scr,coop()].join(),()=>rosCard(E,R,false,t))}
function plusCard(R,hov,t){g.save();g.setLineDash([6,5]);rr(R,10,hov?'rgba(72,48,24,.95)':'rgba(30,20,12,.6)',hov?'#ffb347':'#a8703a',hov?2:1.4);g.restore();
 const cx=R.x+R.w/2,cy=R.y+44;g.save();if(hov){g.shadowColor='#ffb347';g.shadowBlur=14}rr({x:cx-22,y:cy-22,w:44,h:44},22,hov?'#ffb347':'rgba(255,154,58,.18)','#ffb347',2);g.restore();uiIcon('plus',cx,cy,14,hov?'#1a1008':'#ffb347');
 text('Créer un perso',cx,R.y+R.h-28,13,hov?'#ffe0a0':'#ffd38a');text('apparence + kit',cx,R.y+R.h-13,10.5,'#a88a68','center','normal')}
// ----- grille : en-têtes de section, cartes, barre de défilement ; renvoie la carte survolée
function drawRosGrid(t){const Y=rosLayout(),mx=rosMax();rosTarget=clamp(rosTarget,0,mx);rosScroll+=(rosTarget-rosScroll)*.28;if(Math.abs(rosTarget-rosScroll)<.5)rosScroll=rosTarget;
 const inG=!CONF&&inRect(mouse,{x:RGX-4,y:RGY,w:RGW-10,h:RGH});let hit=null;
 rr({x:RGX-10,y:RGY-4,w:RGW+20,h:RGH+8},12,'rgba(14,9,6,.74)','#3a2616');
 g.save();g.beginPath();g.rect(RGX-8,RGY-2,RGW,RGH+4);g.clip();
 for(const h of Y.Hd){const y=RGY+h.y-rosScroll;if(y<RGY-30||y>RGY+RGH)continue;const S=SECS[h.si],x=RGX+h.x,s=S[0].toUpperCase();secMark(x+8,y+10,8,h.si);g.font=FNT(13,'bold');const w=g.measureText(s).width;text(s,x+22,y+15,13,S[1],'left','bold');
  g.fillStyle=rgba(S[1],.45);g.fillRect(x+30+w,y+9,Math.max(0,h.w-30-w),1.5);
  if(h.si===0&&!RQ&&Y.Hd.filter(q=>q.y===h.y).length===1){const x0=x+h.w+30,w0=Math.min(560,RGW-14-h.w-40);
   if(w0>=150){const T=ROS.mine.length?['Tes ninjas, gardés dans ce navigateur : clique pour jouer, survole pour modifier, dupliquer ou supprimer. Le bouton « + Créer un perso » en ajoute un nouveau.','Tes ninjas : clique pour jouer, survole pour modifier, dupliquer ou supprimer.','Clique pour jouer, survole pour modifier.']:['Crée ton propre ninja : apparence, camp, clan, nature, voie, passif et un kit de 5 jutsu. Il apparaîtra ici, prêt à jouer. Tu peux aussi dupliquer un perso de l\'anime pour en faire ta version.','Crée ton propre ninja : il apparaîtra ici, prêt à jouer.'];
    let L=null;for(const q of T){const l=wrapL(q,w0,FNT(12.5));if(l.length<=4&&l.every(z=>g.measureText(z).width<=w0)){L=l;break}}
    if(L)L.forEach((l,i)=>text(l,x0,y+24+RCH/2-(L.length-1)*9+i*18+4,12.5,'#cdb898','left','normal'))}}}
 for(const it of Y.L){const R={x:it.x,y:RGY+it.y-rosScroll,w:it.w,h:it.h};if(R.y+R.h<RGY-4||R.y>RGY+RGH+4)continue;const hov=inG&&inRect(mouse,R);if(hov)hit=Object.assign({R},it);if(it.plus)plusCard(R,hov,t);else if(hov)rosCard(it.e,R,true,t);else rosCardC(it.e,R,t)}
 if(!Y.L.length)text('Aucun ninja ne correspond à ta recherche (Échap dans le champ pour l\'effacer)',RGX+RGW/2,RGY+60,15,'#cdb898','center','normal');
 g.restore();
 if(mx>0){const tr={x:RGX+RGW-8,y:RGY,w:6,h:RGH},k=RGH/(RGH+mx);rr(tr,3,'rgba(255,255,255,.08)');rr({x:tr.x,y:tr.y+(RGH-RGH*k)*rosScroll/mx,w:6,h:RGH*k},3,'#c08040');
  if(rosScroll<mx-1){const gr=g.createLinearGradient(0,RGY+RGH-26,0,RGY+RGH);gr.addColorStop(0,'rgba(10,6,3,0)');gr.addColorStop(1,'rgba(10,6,3,.55)');g.fillStyle=gr;g.fillRect(RGX-4,RGY+RGH-26,RGW-12,26);text('▼',RGX+RGW-5,RGY+RGH+1+Math.sin(performance.now()/250)*2,12,'#ffb347','center','bold')}}
 return hit}
// ----- onglets de section : clic = aller à la section ; ceux de la rangée en haut de la vue sont allumés
function drawRosTabs(){const T=rosTabs(),mx=rosMax();let top=-1;for(const R of T)if(R.top<=rosScroll+30)top=Math.max(top,R.top);if(mx>0&&rosScroll>=mx-1&&T.length)top=T[T.length-1].top;
 for(const R of T){const on=R.top===top,h=!CONF&&inRect(mouse,R),c=SECS[R.si][1];rr(R,12,on?c:h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)',c,1.5);
  if(on){g.fillStyle='rgba(20,13,8,.85)';g.beginPath();g.arc(R.x+14,R.y+12,8.5,0,7);g.fill()}secMark(R.x+14,R.y+12,7,R.si);text(R.s,R.x+26+(R.w-26)/2-4,R.y+17,12.5,on?(lum(c)>.45?'#1a1008':'#fff'):'#f3d9b0')}
 uiIcon('search',RQR.x-13,RQR.y+13,8,RQ?'#ffb347':'#a88a68')}
// ----- fiche du perso (en bas) : aperçu, identité, stats, passif, les 6 emplacements + passif + trait, boutons
function ficheCell(R,s,ch,b,tip){const free=!CONF;let key,col,ic,nm,d,badge=null,gold=false,cat=null;
 if(s<6){const ab=ch.abil[s],J=s?JL[b.j[s]]:null;key=lbl[SLOTS[s]];col=J?catCol(J.cat):b.clan>=0?CLANS[b.clan][1]:'#e8cfa8';ic=J?J.cat:null;nm=ab.n;d=ab.d||'';gold=!!ab.ult;badge=J?J.r:'st';cat=J?catName(J.cat):'style de combat'}
 else if(s===6){const ps=PASS[ch.pass]||['—',''];key='PASSIF';col='#7fd87f';ic='p';nm=ps[0];d=ps[1]}
 else{const T=TRAITS[b.clan];key='TRAIT';col=b.clan>=0?CLANS[b.clan][1]:'#c8b89a';ic=b.clan>=0?'c'+b.clan:'u';nm=T?T.nom||T.name||'Trait':b.clan>=0?CLANS[b.clan][0]:'Sans clan';d=T?T.desc||'':''}
 const h=free&&inRect(mouse,R);if(tip){if(h)hoverTip('fc'+s+':'+nm,()=>({t:nm,col:liftC(col,.55),l:[[s<6?`${key} · ${cat}${badge&&badge!=='st'?` · rang ${badge}`:''}${gold?' · ultime':''}`:s===6?'Passif : bonus permanent':'Trait du clan',liftC(col,.5)]],d:d||' '}));return}
 rr(R,8,h?'rgba(70,46,24,.95)':'rgba(36,24,14,.82)',gold?'#ffb347':h?'#c08040':'#4a3220',gold?1.5:1);
 const kb={x:R.x+5,y:R.y+6,w:50,h:R.h-12};rr(kb,6,s===6?'rgba(30,50,26,.95)':'rgba(50,32,16,.95)',gold?'#ffe81f':s===6?'#5aa85a':'#8a5a2a',1.2);fitT(key,kb.x+kb.w/2,kb.y+kb.h/2+4.5,key.length>6?10:12,gold?'#ffe81f':s===6?'#9f9':'#fff',kb.w-6,'bold',8,'center');
 jIcon(R.x+73,R.y+R.h/2,12.5,col,ic,gold);const x=R.x+92;
 if(badge==='st')styleBadge(R.x+R.w-50,R.y+6,44);else if(badge)rankBadge(R.x+R.w-50,R.y+6,badge,44);
 fitT(nm,x,R.y+18,13,gold?'#ffe81f':s===6?'#cfe8c0':'#ffd38a',R.w-92-(badge?58:8),'bold',10);fitT(d,x,R.y+34,10.5,'#cdb898',R.w-98,'normal',9);}
function ficheBtns(E){if(!E)return[];const L=[];
 // étape adversaire : sur ton propre perso (pas encore d'adversaire montré), le bouton mis en avant tire un adversaire ; le combat contre ton double reste possible, en second
 if(scr==='opp'){if(E.k===MEK)L.push({k:'rnd',t:'Adversaire au hasard',ic:'dice',p:1},{k:'back',t:'Changer mon perso',ic:'back'},{k:'fight',t:'Affronter ton double',ic:'play'});
  else L.push({k:'fight',t:rosOver(E)?'Trop de points':'Affronter',ic:'play',p:1,warn:rosOver(E)},{k:'back',t:'Changer mon perso',ic:'back'})}
 else{L.push(rosOver(E)?{k:'play',t:'Trop de points',ic:'edit',p:1,warn:1}:coop()?{k:'play',t:E.k===MEK?'Choisi':'Choisir ce perso',ic:'check',p:1,off:E.k===MEK}:{k:'play',t:mode==='battle'?'Jouer (bataille)':'Jouer',ic:'play',p:1});
  L.push({k:'edit',t:'Modifier',ic:'edit'},{k:'dup',t:'Dupliquer',ic:'dup'});if(!E.P)L.push({k:'del',t:'Supprimer',ic:'del',danger:1});else if(E.mod)L.push({k:'reset',t:'Rétablir l\'original',ic:'reset'})}
 return L.map((q,i)=>Object.assign(q,{R:{x:FI.x+FI.w-172,y:FI.y+9+i*45,w:160,h:39}}))}
const FTIP={rnd:()=>'Tire un adversaire au hasard dans la liste et lance le combat.',play:()=>rosOver(rosGet(FK))?'Son kit dépasse le budget de points : clique pour ouvrir la création et le corriger.':coop()?'Ce perso devient le tien dans le salon ; clique ensuite PRÊT.':mode==='battle'?'Lance la bataille avec ce perso.':'Ce perso devient le tien ; tu choisis ensuite ton adversaire.',fight:()=>rosGet(FK)&&FK===MEK?'Lance un combat contre une copie de ton propre perso.':'Lance le combat contre ce ninja.',back:()=>'Revient à la liste pour choisir un autre perso (Échap).',edit:()=>BTIP.edit,dup:()=>BTIP.dup,del:()=>BTIP.del,reset:()=>BTIP.reset};
function drawFiche(E,t){const opp=scr==='opp',me=rosGet(MEK);if(!E)return;const F=rosFake(E),ch=F.ch,b=E.b,S=SECS[E.sec],col=S[1],free=!CONF;
 g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=14;rr(FI,12,'rgba(20,14,10,.94)',rgba(col,.75),1.5);g.restore();
 // aperçu : le ninja (en arène, ton perso contre l'adversaire)
 {const P0={x:FI.x+8,y:FI.y+8,w:196,h:FI.h-16};g.save();g.beginPath();g.roundRect(P0.x,P0.y,P0.w,P0.h,9);g.clip();const gr=g.createLinearGradient(0,P0.y,0,P0.y+P0.h);gr.addColorStop(0,rgba(col,.22));gr.addColorStop(1,'rgba(0,0,0,.1)');g.fillStyle=gr;g.fillRect(P0.x,P0.y,P0.w,P0.h);
  const one=(u,x,sc,a,c2)=>{const fy=P0.y+P0.h-24;g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(x,fy-2,34*sc/1.4,9,0,0,7);g.fill();g.save();g.globalCompositeOperation='lighter';const r=g.createRadialGradient(x,fy-50,0,x,fy-50,80);r.addColorStop(0,rgba(c2,.18));r.addColorStop(1,rgba(c2,0));g.fillStyle=r;g.fillRect(x-90,P0.y,180,P0.h);g.restore();
   u.aim=a;u.swing=0;const s2=sc*(u.ch.look.scale>1?.9:1);drawPrevN(u,x,fy,s2,0);drawChar3(u,x,fy,s2);drawPrevN(u,x,fy,s2,1)};
  if(opp&&me){const mc=rosFake(me).ch,um=fakeFor('me',mc);um.moving=false;one(um,P0.x+50,1.32,Math.PI*.12+Math.sin(t*.7)*.15,mc.look.weapon.col);
   const self=E.k===me.k,ox=P0.x+P0.w-50;
   if(self){const cy=P0.y+P0.h-84,a=.55+Math.sin(t*3)*.2;g.save();g.setLineDash([5,4]);g.strokeStyle=rgba('#ff9a3a',a+.2);g.lineWidth=2;g.beginPath();g.ellipse(ox,cy,30,44,0,0,7);g.stroke();g.restore();text('?',ox,cy+14,40,rgba('#ffb347',a+.25))}
   else{const uo=fakeFor('fi',ch);uo.moving=false;one(uo,ox,1.32,Math.PI*.88+Math.sin(t*.8)*.15,ch.look.weapon.col)}
   g.save();g.shadowColor='#ff6a3a';g.shadowBlur=12;text('VS',P0.x+P0.w/2,P0.y+40,24,'#ffb347');g.restore();
   fitT(mc.name,P0.x+50,P0.y+P0.h-6,11,'#ffd38a',90,'bold',8,'center');fitT(self?'à choisir':ch.name,ox,P0.y+P0.h-6,11,self?'#c8a070':'#ffb0a0',90,self?'normal':'bold',8,'center')}
  else{const u=fakeFor('fi',ch);u.moving=Math.sin(t*.5)>.35;u.walk=t*13;one(u,P0.x+P0.w/2,1.5,Math.PI/2+Math.sin(t*.8)*1.1,ch.look.weapon.col)}
  g.restore();secMark(P0.x+16,P0.y+16,10,E.sec)}
 // identité, stats et les 8 cases : dessinés dans une image (cachedDraw), refaite si le perso, ses stats, la case survolée ou l'étape changent
 const cellR=s=>({x:FI.x+548+(s>>2)*252,y:FI.y+8+(s&3)*45,w:244,h:41});let hs=-1;if(free)for(let s=0;s<8;s++)if(inRect(mouse,cellR(s)))hs=s;
 cachedDraw('fiche',{x:FI.x+212,y:FI.y+4,w:836,h:FI.h-8},[E.k,oid(b),oid(ch),F.v,opp?1:0,me?me.k+me.b.side:'',hs,E.mod?1:0,rosOver(E)?1:0].join(),()=>{
 // identité, stats, passif, jeu en une ligne
 {const x=FI.x+216,w=320;let y=FI.y+32;const nw=fitT(b.name,x,y,22,b.side?'#ff9a9a':'#ffd38a',w,'bold',13);
  if(E.mod)tag(Math.min(x+nw+76,x+w),y-14,'RETOUCHÉ','rgba(255,179,71,.85)');y+=20;
  fitT(E.P?[E.P.full!==b.name?E.P.full:'',S[0],GALG[E.P.g]!==S[0]?GALG[E.P.g]:''].filter(Boolean).join(' · '):`Mes ninjas · créé par toi`,x,y,12.5,liftC(col,.55),w,'bold',9);y+=22;
  {const ic=[b.clan>=0?['c'+b.clan,CLANS[b.clan][1]]:['u','#c8b89a']];if(b.clan!==TAIJ)ic.push(['n'+b.nat,NATURES[b.nat][2]]);ic.forEach(([k,c2],i)=>jIcon(x+8+i*19,y-4,8,c2,k));fitT(ch.desc,x+ic.length*19+2,y,12,'#e8cfa8',w-ic.length*19-2,'normal',9)}y+=21;
  fitT(`${ch.hp} PV · vitesse ${ch.spd} · puissance ×${ch.pw.toFixed(2)}`,x,y,13.5,'#ffd38a',w,'bold',10);y+=18;
  {const ov=rosOver(E),cs=opp&&me&&E.k!==me.k&&b.side===me.b.side?`${CAMPS[1-b.side]} pour ce combat (camp d'en face)`:CAMPS[b.side];fitT(`Camp : ${cs} · kit ${kitCost(b)} / ${budgetOf(b)} points${ov?' · trop de points !':''}`,x,y,11.5,ov?'#ff8a7a':'#b89a70',w,ov?'bold':'normal',9)}y+=20;
  const d=E.P?(E.mod?'Version retouchée. ':'')+E.P.d:'Un de tes ninjas : « Modifier » pour retoucher son apparence et son kit, « Dupliquer » pour en tester une variante.';
  wrapL(d,w,FNT(12)).slice(0,3).forEach((l,i)=>text(l,x,y+i*16,12,'#cdb898','left','normal'))}
 // les 6 emplacements, le passif et le trait : 2 colonnes de 4
 for(let s=0;s<8;s++)ficheCell(cellR(s),s,ch,b)});
 if(hs>=0)ficheCell(cellR(hs),hs,ch,b,true)
 // boutons
 for(const q of ficheBtns(E)){const h=free&&!q.off&&inRect(mouse,q.R),c=q.danger||q.warn?'#ff6a5a':'#ff9a3a';g.save();if(q.p&&!q.off&&!q.warn){g.shadowColor='#ff9a3a';g.shadowBlur=h?18:8}
  rr(q.R,q.R.h/2,q.off?'rgba(60,90,50,.9)':q.warn?(h?'rgba(170,60,45,.98)':'rgba(130,45,35,.95)'):q.p?(h?'#ffb347':'#ff9a3a'):h?(q.danger?'rgba(120,40,30,.95)':'rgba(90,60,30,.95)'):'rgba(40,28,18,.92)',q.off?'#7f7':c,1.5);g.restore();
  const fg=q.off?'#d8ffd0':q.warn?'#ffe0d8':q.p?'#1a1008':q.danger?'#ffb0a0':'#f3d9b0';g.font=FNT(14,'bold');const tw=Math.min(q.R.w-44,g.measureText(q.t).width),x0=q.R.x+q.R.w/2-(tw+22)/2;uiIcon(q.ic,x0+7,q.R.y+q.R.h/2,8,fg);fitT(q.t,x0+22,q.R.y+q.R.h/2+5,14,fg,q.R.w-44,'bold',10);
  if(h)hoverTip('fb'+q.k,()=>({t:q.t,d:FTIP[q.k]()}))}}
// ----- la fiche suit la carte survolée : vite si la souris s'y arrête (0,15 + 0,06 s) ou y passe (0,14 s), mais jamais tant que la souris file vers la fiche
// (sa trajectoire coupe le haut de la fiche) : en allant d'une carte vers les boutons de la fiche, les cartes traversées ne la changent pas
let HK=null,HT=0;const MH=[]; // MH : derniers mouvements de la souris [x, y, t] (coordonnées du jeu), pour sa vitesse
try{addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();if(!r.width)return;const k=W/r.width;MH.push([(e.clientX-r.left)*k,(e.clientY-r.top)*k,performance.now()]);if(MH.length>12)MH.shift()},{passive:true})}catch(e){}
let HF=0,HFD=16;function rosHover(hk){const now=performance.now();HFD+=(Math.min(400,now-HF)-HFD)*.3;HF=now;if(hk!==HK){HK=hk;HT=now}if(!hk||hk===FK||CONF)return;
 // vitesse sur les derniers mouvements (0,2 s, au moins les deux derniers s'ils ont moins de 0,4 s) ; aucun mouvement depuis 0,15 s (plus si les images sont lentes) = immobile
 const L=MH.filter(q=>now-q[2]<200),b=MH[MH.length-1],a=L.length>1?L[0]:MH.length>1&&now-MH[MH.length-2][2]<400?MH[MH.length-2]:null,dt=a&&b?b[2]-a[2]:0,vx=dt>0?(b[0]-a[0])/dt:0,vy=dt>0?(b[1]-a[1])/dt:0;
 const still=!b||now-b[2]>Math.max(150,HFD*2.5)||Math.hypot(vx,vy)<.12,xh=vy>.02?b[0]+vx*(FI.y-b[1])/vy:-1e9,toward=!still&&xh>FI.x-40&&xh<FI.x+FI.w+40;
 if(!toward&&now-HT>=(still?60:140))FK=hk}
// ----- écran principal (liste et étape adversaire) ; drawMenu choisit l'écran
function drawOppBar(t){const me=rosGet(MEK),B={x:196,y:108,w:848,h:32};g.save();g.shadowColor='#ff6a3a';g.shadowBlur=10+Math.sin(t*3)*5;rr(B,16,'rgba(90,40,18,.92)','#ff6a3a',1.5);g.restore();
 fitT('ÉTAPE 2 / 2 · CHOISIS TON ADVERSAIRE',B.x+20,B.y+21,15,'#ffd38a',440,'bold',11);if(me)fitT('Toi : '+me.b.name,B.x+B.w-20,B.y+21,14,me.b.side?'#ffb0a0':'#ffe0a0',360,'bold',10,'right');
 for(const [R,k,s,c] of[[oppBack,'back','Retour (Échap)','#ff9a3a'],[oppRnd,'dice','Adversaire au hasard','#ffb347']]){const h=!CONF&&inRect(mouse,R);rr(R,R.h/2,h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)',c,1.5);uiIcon(k,R.x+18,R.y+R.h/2,7.5,'#f3d9b0');fitT(s,R.x+32,R.y+19,12.5,'#f3d9b0',R.w-40,'bold',9)}}
function drawRoster(){const t=performance.now()/1000;if(scr==='opp'&&(coop()||mode==='battle'||!rosGet(MEK)))scr='list';
 if(!CONF){if(pressed.Escape&&scr==='opp')rosBack();const st=RCH+8;if(pressed.ArrowDown)rosTarget+=st;if(pressed.ArrowUp)rosTarget-=st;if(pressed.PageDown)rosTarget+=RGH;if(pressed.PageUp)rosTarget-=RGH;if(pressed.Home)rosTarget=0;if(pressed.End)rosTarget=rosMax()}
 drawHead(false,scr==='opp');
 if(scr==='opp')drawOppBar(t);else text(menuDesc(),W/2,net.role?116:130,13,'#e8cfa8','center','normal');
 drawRosTabs();const hit=drawRosGrid(t);rosHover(hit&&hit.e?hit.e.k:null);
 drawFiche(scr==='opp'?rosGet(FK)||rosGet(MEK):rosGet(FK)||rosGet(MEK)||rosEntries()[0],t);
 // barre du bas : créer un perso ; en ligne : équipe et PRÊT ; sinon les commandes
 {const R=newBtn,h=!CONF&&inRect(mouse,R);g.save();g.shadowColor='#ffb347';g.shadowBlur=h?20:9;rr(R,R.h/2,h?'#ffb347':'rgba(70,44,18,.96)','#ffb347',2);g.restore();
  rr({x:R.x+10,y:R.y+6,w:24,h:24},12,h?'#1a1008':'#ffb347');uiIcon('plus',R.x+22,R.y+18,7,h?'#ffb347':'#1a1008');text('Créer un perso',R.x+R.w/2+14,R.y+24,16,h?'#1a1008':'#ffd38a');
  if(h)hoverTip('new',()=>({t:'Créer un perso',d:'Ouvre la création sur un nouveau ninja (tiré au hasard) : apparence, camp, clan, nature, voie, passif et kit de 5 jutsu. « Enregistrer » le range dans « Mes ninjas ».'}))}
 if(coop()){if(isGuest()&&mode!=='arena'){const b=teamBtn,h=!CONF&&inRect(mouse,b);rr(b,b.h/2,h?'#5a3a1e':'#2a1c10',net.myTeam?'#ff6060':'#4db8ff',2);text(`ÉQUIPE ${net.myTeam?'B':'A'} (changer)`,b.x+b.w/2,b.y+b.h/2+5,13,'#f3d9b0','center')}
  const b=readyBtn,ob=overBudget(),on=net.ready&&!ob;rr(b,b.h/2,ob?'rgba(120,50,40,.9)':on?'#7f7':!CONF&&inRect(mouse,b)?'#ffb347':'rgba(255,154,58,.88)',ob?'#a55':null,2);text(ob?'TROP DE POINTS':on?'PRÊT ✓':'PRÊT ?',b.x+b.w/2,b.y+b.h/2+6,ob?14:16,ob?'#ffd0c8':'#10131c','center');
  fitT(`Ton perso : ${MY.name}`,290,700,12.5,'#e8cfa8',(isGuest()&&mode!=='arena'?teamBtn.x:b.x)-305,'bold',9)}
 else fitT(`${lbl.KeyW}${lbl.KeyA}${lbl.KeyS}${lbl.KeyD} bouger · souris viser · ${lbl.KeyF} maintenu = parade · ${lbl.KeyR} maintenu = chakra · ${lbl.KeyH} soin · Maj = sprint · Tab scores · ${lbl.KeyM} son · O options`,690,700,12,'#c8b090',780,'normal',9,'center');
 drawConf();drawTip();drawCursor()}
function drawMenu(){TIP=null;{const now=performance.now();if(now-menuLast>1500){picker=null;CONF=null;if(scr==='opp')scr='list'}menuLast=now} // retour au menu après un match : panneau et étape adversaire fermés
 if(CONF&&(pressed.Escape||pressed.Enter)){const f=CONF.fn,ok=pressed.Enter;CONF=null;pressed.Escape=pressed.Enter=0;if(ok)f()}
 if(scr==='edit'&&ED&&EB)return drawCreator();if(scr==='edit')scr='list';drawRoster()}
// ----- clics : la fenêtre de confirmation, puis l'écran ouvert (menuGrab : il prend aussi les clics des boutons de mode et EN LIGNE)
const menuGrab=()=>picker!==null||!!CONF||scr!=='list';
function menuClick(){if(CONF){const [a,b]=confBtns();if(inRect(mouse,a)){const f=CONF.fn;CONF=null;f()}else if(inRect(mouse,b)||!inRect(mouse,confBox()))CONF=null;return true}
 if(scr==='edit')return ED&&EB?creatorClick():(scr='list',true);
 if(scr==='opp'){for(const b of modeBtns)if(inRect(mouse,b)){scr='list';if(!isGuest()){mode=b.m;netSend({t:'hello',mode,cfg:CFG})}return true}
  if(inRect(mouse,coopBtn)){scr='list';netUI(true);return true} // EN LIGNE : l'étape adversaire se ferme, la fenêtre du salon s'ouvre
  if(inRect(mouse,oppBack)){rosBack();return true}if(inRect(mouse,oppRnd)){rosRandomOpp();return true}}
 for(const R of rosTabs())if(inRect(mouse,R)){rosTarget=Math.min(rosMax(),R.top);return true}
 const mx=rosMax();if(mx>0&&inRect(mouse,{x:RGX+RGW-14,y:RGY,w:18,h:RGH})){rosTarget=clamp((mouse.y-RGY)/RGH,0,1)*mx;return true}
 if(inRect(mouse,{x:RGX-4,y:RGY,w:RGW-10,h:RGH})){for(const it of rosLayout().L){const R={x:it.x,y:RGY+it.y-rosScroll,w:it.w,h:it.h};if(!inRect(mouse,R))continue;
   if(it.plus){rosEdit(null);return true}if(scr==='list')for(const q of cardBtns(it.e,R))if(inRect(mouse,q.R)){rosAct(q.k,it.e);return true}
   rosPick(it.e);return true}return true}
 {const E=scr==='opp'?rosGet(FK)||rosGet(MEK):rosGet(FK)||rosGet(MEK);for(const q of ficheBtns(E))if(inRect(mouse,q.R)){if(!q.off)rosAct(q.k,E);return true}}
 if(inRect(mouse,newBtn)){rosEdit(null);return true}
 return inRect(mouse,FI)}
try{cv.addEventListener('wheel',e=>{if(state==='menu'&&picker===null&&!CONF&&scr!=='edit'){rosTarget+=e.deltaY*(e.deltaMode?40:1);e.preventDefault()}},{passive:false})}catch(e){}
// ----- champ de recherche : vrai <input> posé sur le canevas (les touches tapées ne vont pas au jeu) ; Échap l'efface puis le quitte
const RQI=(()=>{try{const st=document.createElement('style');st.textContent='#rosQ{position:fixed;z-index:3;box-sizing:border-box;border:1px solid #8a5a2a;background:#1c120a;color:#f3d9b0;padding:0 .8em;font-family:"Trebuchet MS",system-ui,sans-serif;font-weight:bold;outline:none}#rosQ:focus{border-color:#ffb347;box-shadow:0 0 8px #ff9a3a88}#rosQ::placeholder{color:#a88a68;font-weight:normal}';document.head.appendChild(st);
 const e=document.createElement('input');e.id='rosQ';e.type='text';e.placeholder='Chercher un ninja…';e.setAttribute('aria-label','Chercher un ninja par son nom, son village, son clan ou sa nature');e.autocomplete='off';e.spellcheck=false;e.hidden=true;
 e.addEventListener('input',()=>{RQ=fold(e.value.trim());RLAY=null;rosTarget=rosScroll=0});
 e.addEventListener('keydown',ev=>{if(ev.key==='Escape'){if(e.value){e.value='';RQ='';RLAY=null}else e.blur();ev.preventDefault()}else if(ev.key==='Enter'){const it=rosLayout().L.find(q=>q.e);if(it)FK=it.e.k;e.blur()}});
 document.body.appendChild(e);return e}catch(err){return null}})();
let RQB='';
function rosQSync(){if(!RQI)return;let bl=false;try{bl=BLC.open}catch(e){}const on=state==='menu'&&scr!=='edit'&&picker===null&&!CONF&&!bl&&!quitOn;RQI.hidden=!on;if(!on){if(document.activeElement===RQI)RQI.blur();return}
 const r=cv.getBoundingClientRect(),k=r.width/W,s=[r.left+RQR.x*k,r.top+RQR.y*k,RQR.w*k,RQR.h*k].map(v=>Math.round(v*10)/10).join();if(s===RQB)return;RQB=s;
 Object.assign(RQI.style,{left:r.left+RQR.x*k+'px',top:r.top+RQR.y*k+'px',width:RQR.w*k+'px',height:RQR.h*k+'px',fontSize:13*k+'px',borderRadius:13*k+'px'})}
// ----- au chargement : la liste, puis le perso joué la dernière fois (MY)
try{rosLoad()}catch(e){ROS={mine:[],anime:{},last:{},nid:1};RL=RLAY=null}
{const E=rosGet(ROS.last.me)||rosGet('a:'+PRESETS[0].n);MEK=FK=E.k;MY=sanitizeBuild(E.b);MYCH=mkNinja(MY);CH.p0=MYCH}

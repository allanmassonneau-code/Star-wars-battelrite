// ---------- Menu : création / modification d'un perso : outils partagés (barres, apprentissage, panneaux de choix) ; l'écran lui-même est l'assistant en 8 étapes (nr_wiz.js) ----------
let picker=null; // emplacement dont on choisit le jutsu (liste ouverte)
// lignes de gauche : [libellé, liste, clé] ; le clan a une entrée « Sans clan » (valeur -1), la 2e nature n'existe que sans clan
const CLANL=[['Sans clan','#888']].concat(CLANS),NATL=NATURES.map(n=>[n[0]+' ('+n[1]+')',n[2]]);
// apparence rangée en 4 onglets (4e champ) : tête, corps, tenue, équipement
const STL=STNAME.map((n,i)=>[n,STCOL[i]]);
const APP=[['Camp',()=>CAMPS,'side'],['Clan',()=>CLANL,'clan'],['Nature',()=>NATL,'nat'],['Style',()=>STL,'st'],
 ['Coiffure',()=>COIFS,'l.c',0],['Cheveux',()=>HAIRC,'l.h',0],['Yeux',()=>EYES,'l.e',0],['Visage',()=>FACES,'l.f',0],['Accessoire',()=>ACCS,'l.a',0],['Bandeau',()=>BANDS,'l.b',0],
 ['Peau',()=>PEAUX,'l.p',1],['Taille',()=>TAILLES,'l.z',1],['Carrure',()=>CARRURES,'l.w',1],['Chakra',()=>CHAKRAS,'l.k',1],['Village',()=>VILLAGES,'l.v',1],
 ['Tenue',()=>TENUES,'l.t',2],['Couleur 1',()=>TENCOL,'l.o',2],['Couleur 2',()=>TENCOL,'l.s',2],
 ['Par-dessus',()=>OVERS,'l.m',2],['Couleur masque',()=>TENCOL,'l.x',2],
 ['Bras',()=>ARMS,'l.r',3],['Cou',()=>NECKS,'l.n',3],['Dos',()=>BACKS,'l.d',3],['Symbole',()=>SYMS,'l.y',3],['Ceinture',()=>GEARS,'l.g',3],['Couleur bandeau',()=>BANDC,'l.q',3]];
const LTABS=['Tête','Corps','Tenue','Équipement'];let LTAB=0;const ltabR=i=>({x:44+i*89,y:390,w:85,h:24});
// clan, nature, arbre de style : les arbres changent → ce qui n'y est plus est oublié (sanitizeBuild), les rangs libres des nouveaux arbres sont appris d'office
const getB=k=>k==='clan'?EB.clan+1:k.startsWith('l.')?EB.l[k[2]]:EB[k],setB=(k,v)=>{if(k==='clan'){EB.clan=v-1;EB.kg=-1;const cs=clanStyle(EB.clan);if(cs>=0)EB.w=cs;edTrees()} // nouveau clan : son style signature est équipé
 else if(k==='nat'||k==='st'){EB[k]=v;edTrees()}
 else if(k.startsWith('l.')){EB.l[k[2]]=v;if(k==='l.t'&&TENUES[v]&&TENUES[v][1].hatC&&!EB.l.a)EB.l.a=4} // robe de Kage : son chapeau est proposé d'office (on peut l'enlever)
 else EB[k]=v};
const appOff=k=>(k==='nat'||k==='st')&&isMartial(EB.clan);
// nouveau clan / nature / style / familles : les jutsu gardés restent dans leur case ; une case dont le jutsu a disparu reçoit un jutsu appris du même rang
// (de préférence du nouvel arbre : Lame d'air A → Chidori A), puis les cases vidées qui restent sont complétées (ordre de la barre automatique)
// (toutes les barres favorites : chacune comble ses propres trous)
function edTrees(){const OB=(EB.bars||[{b:EB.bar||[]}]).map((q,i)=>(i===0&&EB.bar?EB.bar:q.b||[]).slice()),ok=(EB.k||[]).slice(),SN=crSnap();EB=sanitizeBuild(EB);EB.k=autoLearn(EB,EB.k);EB=sanitizeBuild(EB);
 OB.forEach((ob,bi)=>{const q=EB.bars[bi];if(!q)return;const B=bi===0?EB.bar:q.b;
  const hole=ob.map((id,s)=>id>=0&&JL[id]&&B[s]===-1);if(!hole.some(Boolean))return;const free=()=>EB.k.filter(id=>!B.includes(id));
  hole.forEach((h,s)=>{if(!h)return;const c=free().filter(id=>JL[id].r===JL[ob[s]].r),p=c.find(id=>!ok.includes(id))??c[0];if(p!=null)B[s]=p});
  const rest=hole.map((h,s)=>h&&B[s]===-1?s:-1).filter(s=>s>=0);if(rest.length){const A=autoBar(Object.assign({},EB,{k:free()})).filter(id=>id>=0);for(const s of rest){if(!A.length)break;B[s]=A.shift()}}});
 EB=sanitizeBuild(EB);crFixI();crRetheme(SN)}
// nom affiché d'un jutsu dans la création (alias propre au perso, ex. « Raikiri »)
const crN=jid=>(EB&&EB.al&&EB.al[jKey(jid)])||(JL[jid]?JL[jid].n:'');
// cases vides alors que des jutsu appris sont hors de la barre (avertissement à l'enregistrement)
const crHoles=()=>crBars().reduce((a,B)=>a+Math.min(B.filter(id=>id<0).length,EB.k.filter(id=>!B.includes(id)).length),0);
// ---------- barres favorites (build v6) : jusqu'à BARSMAX barres de 6 jutsu appris ; la 1re (★) est la barre de départ, les autres se prennent en combat avec la roue (B maintenu + molette)
// EBI : barre modifiée par les 6 cases du bas, la grille (survol + 1-6), « Barre auto » et « Compléter » ; la 1re barre est EB.bar (elle fait foi dans sanitizeBuild), les autres EB.bars[i].b
let EBI=0;
const crBars=()=>(EB.bars||[]).map((q,i)=>i===0?EB.bar:q.b);
const crFixI=()=>{EBI=Math.max(0,Math.min((EB.bars||[]).length-1,EBI|0))};
const crB=()=>{crFixI();return EBI===0||!EB.bars[EBI]?EB.bar:EB.bars[EBI].b};
const crSetB=B=>{crFixI();if(EBI===0)EB.bar=B;else EB.bars[EBI].b=B};
const crBN=i=>{const q=EB.bars&&EB.bars[i==null?EBI:i];return q?q.n:'Barre 1'};
// noms automatiques : une barre dont le nom est encore celui que barTheme lui donnait (« Fûton », « Hoki 2 »… : nom jamais retouché) ou « Barre n »
// reprend le nom de l'arbre le plus présent après chaque changement de son contenu (clan / nature / style / familles, jutsu appris ou retirés, cases, « Barre auto », « Compléter » :
// edRebuild compare à l'état d'avant, EBSN, repéré par les noms) ; un nom choisi par le joueur ne bouge jamais. EBSN est remis à zéro à l'ouverture d'un perso, d'un kit aléatoire ou d'un modèle
function crSnap(){const B=crBars().map(b=>b.slice()),L=[],a=new Set();(EB.bars||[]).forEach((q,i)=>{const t=barTheme(EB,B[i],L);L.push({n:q.n,b:B[i]});if(q.n===t||/^Barre \d+$/.test(q.n))a.add(q.n)});return{a}}
function crRetheme(S){if(!S||!EB||!EB.bars)return;const B=crBars(),L=[],au=EB.bars.map(q=>S.a.has(q.n));EB.bars.forEach((q,i)=>{if(au[i]&&B[i].some(id=>id>=0)){const fix=EB.bars.filter((x,j)=>j>i&&!au[j]).map(x=>({n:x.n}));q.n=barTheme(EB,B[i],L.concat(fix))}L.push({n:q.n,b:B[i]})})}
// barre auto de la barre modifiée : la 1re = rang S → D en alternant les arbres ; une autre prend d'abord les jutsu absents des autres barres
// (tous les jutsu appris déjà placés : mélange des jutsu les MOINS présents dans les autres barres, pris tour à tour dans chacune, pour ne pas refaire la barre 1)
function crAutoB(){if(EBI===0)return autoBar(EB);const OB=crBars().filter((_,i)=>i!==EBI),used=new Set(OB.flat()),fresh=EB.k.filter(id=>!used.has(id));
 let a=fresh.length?autoBar(Object.assign({},EB,{k:fresh})).filter(id=>id>=0):[];
 if(!fresh.length&&OB.length){const cnt=id=>OB.reduce((n,b)=>n+(b.includes(id)?1:0),0),pos=id=>{for(let s=0;s<BARN;s++)for(let b=0;b<OB.length;b++)if(OB[b][s]===id)return s*BARSMAX+b;return 99};
  const pick=EB.k.filter(id=>JL[id]).sort((x,y)=>cnt(x)-cnt(y)||pos(x)-pos(y)).slice(0,BARN);a=autoBar(Object.assign({},EB,{k:pick})).filter(id=>id>=0);for(const id of pick)if(a.length<BARN&&!a.includes(id))a.push(id)}for(const id of autoBar(EB))if(a.length<BARN&&id>=0&&!a.includes(id))a.push(id);while(a.length<BARN)a.push(-1);return a}
function crBarNew(){if(EB.bars.length>=BARSMAX){crSay(`${BARSMAX} barres au plus : supprimes-en une (✕) pour en créer une autre`,'#ff7a6a');return}
 const all=crOut().length===0;EB.bars.push({n:'',b:EB.bar.slice()});EBI=EB.bars.length-1;EB.bars[EBI].b=crAutoB();EB.bars[EBI].n=barTheme(EB,EB.bars[EBI].b,EB.bars.slice(0,EBI));edRebuild();const n=crBN();
 crSay(all?`« ${n} » créée : tous tes jutsu appris sont déjà dans une barre, elle mélange ceux qui y sont le moins (aucune barre identique) · retouche ses 6 cases`:`« ${n} » créée avec des jutsu absents des autres barres : retouche ses 6 cases`,all?'#ffd38a':'#8fe38f')}
function crBarRen(){const q=EB.bars[EBI];if(!q)return;const n=prompt(`Nom de la barre (${BARNM} caractères max)`,q.n);if(n===null)return;const v=barName(n,EBI);if(v===q.n)return;q.n=v;edRebuild();crSay(`Barre renommée « ${v} »`,'#8fe38f')}
function crBarDel(i){if(EB.bars.length<2){crSay('Il faut au moins une barre','#ff7a6a');return}const n=EB.bars[i].n;
 CONF={t:`Supprimer la barre « ${n} » ?`,d:'Ses 6 cases sont oubliées (les jutsu restent appris).'+(i===0?' La barre suivante devient la barre de départ.':''),ok:'Supprimer',col:'#ff6a5a',
  fn:()=>{EB.bars.splice(i,1);EB.bar=EB.bars[0].b.slice();if(EBI>=i)EBI=Math.max(0,EBI-1);edRebuild();crSay(`Barre « ${n} » supprimée`,'#ffb347')}}}
function crBarStart(){if(EBI===0){crSay(`« ${crBN(0)} » est déjà la barre de départ`,'#c8b89a');return}const q=EB.bars.splice(EBI,1)[0];EB.bars.unshift(q);EB.bar=q.b.slice();EBI=0;edRebuild();
 crSay(`« ${q.n} » est maintenant la barre de départ (★, barre 1)`,'#8fe38f')}
// barre identique à une barre précédente : n° de celle-ci (sinon -1) ; jutsu appris dans aucune barre
const crDupOf=i=>{const B=crBars();return B.slice(0,i).findIndex(x=>barSame(x,B[i]))};
const crOut=()=>{const U=new Set(crBars().flat());return EB.k.filter(id=>!U.has(id))};
// avertissement au 1er clic sur « Enregistrer » (le 2e enregistre) : cases vides, barre en double (retirée à l'enregistrement), jutsu appris dans aucune barre (inutilisables en combat)
function crSaveWarn(){const n=crHoles();if(n)return`${n} case${n>1?'s':''} vide${n>1?'s':''} dans tes barres alors que des jutsu appris n'y sont pas : « Compléter » remplit la barre affichée · clique encore « Enregistrer » pour garder ainsi`;
 const d=EB.bars.findIndex((_,i)=>crDupOf(i)>=0);if(d>0)return`La barre ${d+1} « ${crBN(d)} » est identique à la barre ${crDupOf(d)+1} : clique encore « Enregistrer » pour la retirer, ou change une de ses cases`;
 const o=crOut().length;if(o)return`${o} jutsu appris ${o>1?'ne sont':'n\'est'} dans aucune barre (inutilisable${o>1?'s':''} en combat) : `+(EB.bars.length<BARSMAX?'« + » crée une barre avec eux':'place-les dans une de tes barres')+' · clique encore « Enregistrer » pour garder ainsi';
 return''}
function crDedupe(){const B=crBars(),keep=EB.bars.map((_,i)=>i===0||!B.slice(0,i).some(x=>barSame(x,B[i])));if(keep.every(Boolean))return;EB.bars=EB.bars.filter((_,i)=>keep[i]);crFixI()}
// rangée des onglets de barres (sous les 6 cases) : un onglet par barre (★ = départ) puis « + »
// (positions : étape Barres de l'assistant, nr_wiz.js)
const crTabW=()=>{const n=(EB&&EB.bars||[]).length||1;return Math.min(170,(708-(n<BARSMAX?40:0)-6*(n-1))/n)},crTabR=i=>({x:160+i*(crTabW()+6),y:300,w:crTabW(),h:30}),crPlusR=()=>crTabR((EB.bars||[]).length),crDelR=R=>({x:R.x+R.w-22,y:R.y+5,w:18,h:20}),crStartBtn={x:42,y:302,w:108,h:26};
let EDW=0;
const edOver=()=>false; // (plus de budget de points)
const cycleJ=(s,d)=>{if(!s){const L=stylesOf(EB),i=L.indexOf(EB.w);EB.w=L[(i+d+L.length)%L.length]}};
// --- disposition (assistant nr_wiz.js) : picker = panneau de choix ouvert : n° de case (0 Clic G, 1-6 barre, 7 dash), 'preset' ou une clé de APP ('l.c'…)
const BX=42,BW=826,buildKeys=()=>APP.filter(a=>!a[2].startsWith('l.')),lookKeys=()=>APP.filter(a=>a[2].startsWith('l.')&&a[3]===LTAB);
const crBarR=s=>({x:160+s*92,y:228,w:86,h:62});
const crAutoBtn={x:726,y:228,w:142,h:28},crFillBtn={x:726,y:262,w:142,h:28};
// les listes d'apparence peuvent s'allonger : la hauteur des lignes s'adapte (et chaque valeur ouvre une grille de choix)
const lookRow=i=>{const h=50,y=222+i*h;return{y:y+h/2+6,h,l:{x:200,y:y+5,w:40,h:h-10},v:{x:246,y:y+5,w:470,h:h-10},r:{x:722,y:y+5,w:40,h:h-10}}};
let presetI=-1,EB=null,EBCH=null; // EB : build en cours de création ou de modification (MY reste le perso joué)
const saveBtn={x:870,y:658,w:210,h:44}; // « Suivant ▶ », « ✔ Enregistrer » à l'étape Résumé (assistant)
const itN=it=>Array.isArray(it)?String(it[0]):String(it),swCol=it=>Array.isArray(it)&&typeof it[1]==='string'&&it[1][0]==='#'?it[1]:null;
const fmtCd=cd=>String(Math.round(rtOut(+cd||0)*100)/100).replace('.',',')+' s'; // recharge NOMINALE en secondes RÉELLES (interne / GSPEED, nr_flow.js), virgule décimale (« 86,7 s »)
// recharge affichée : pour un style, le rythme réel de ses 5 coups (de … à …, ou la moyenne avec avg)
const abCd=(ab,avg)=>{const c=ab&&ab.style!=null&&typeof stCad==='function'?stCad(ab):null;if(!c)return fmtCd(ab.cd);const a=Math.min(...c),b=Math.max(...c);return avg?fmtCd(c.reduce((x,y)=>x+y,0)/5):a===b?fmtCd(a):fmtCd(a).slice(0,-2)+' à '+fmtCd(b)};
const FNT=(z,w='normal')=>`${w} ${z}px "Trebuchet MS",system-ui,sans-serif`;
// texte sur une ligne : rétrécit jusqu'à min puis coupe avec « … »
function fitT(s,x,y,size,col,w,weight='normal',min=11,align='left'){s=String(s);let z=size;g.font=FNT(z,weight);while(z>min&&g.measureText(s).width>w){z-=.5;g.font=FNT(z,weight)}if(g.measureText(s).width>w){while(s.length>2&&g.measureText(s+'…').width>w)s=s.slice(0,-1);s=s.trimEnd()+'…'}g.textAlign=align;g.fillStyle=col;g.fillText(s,x,y);return g.measureText(s).width}
function wrapL(s,w,font){g.font=font;const out=[];let cur='';for(const wd of String(s||'').split(' ')){const t=cur?cur+' '+wd:wd;if(cur&&g.measureText(t).width>w){out.push(cur);cur=wd}else cur=t}if(cur)out.push(cur);return out}
const rr=(R,r,fill,stroke,lw=1)=>{g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,r);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke()}};
// ninja d'aperçu du créateur : gardé d'une image à l'autre (son modèle 3D n'est refait que si l'apparence change)
let MF=null;const menuFake=ch=>{if(!MF||MF.src!==ch){const o=CH.p0;CH.p0=ch;MF=mkUnit('p0',0,0,ch.side);MF.src=ch;CH.p0=o}return MF}; // même ninja d'une image à l'autre (u.ch est une copie : comparer à la source, sinon l'aperçu 3D n'a jamais sa case et retombe en 2D)
// perso joué (MY) : gardé dans « Mes ninjas » (nrRoster2, champ last.me) ; en ligne, envoyé à l'hôte (invité) ou diffusé dans le salon (hôte)
// aide des touches (ZQSD en AZERTY : libellés lbl suivant la disposition du clavier)
const HELPK=()=>`${lbl.KeyW}${lbl.KeyA}${lbl.KeyS}${lbl.KeyD} bouger · Clic G frapper · 1-6 jutsu · ${lbl.Space} dash · ${lbl.KeyQ} Kawarimi · ${lbl.KeyB} maintenu + molette : barres · ${lbl.KeyF} parade · ${lbl.KeyR} maintenu = chakra · ${lbl.KeyH} soin · Maj sprint · Tab scores · ${lbl.KeyM} son`;
function rebuildMine(){MY=sanitizeBuild(MY);MYCH=mkNinja(MY); // (le perso joué est gardé dans nrRoster2 : last.me)
 if(!isGuest())CH.p0=MYCH;
 if(net.role==='host'){net.ready=false;sendLobby()}else if(isGuest()&&coop()){net.ready=false;netSend({t:'build',b:MY,pv:NPV});netSend({t:'ready',v:false})}}
// perso en création : seul l'aperçu change (rien n'est envoyé ni gardé avant « Enregistrer »)
let EBSN=null;
function edRebuild(){EB=sanitizeBuild(EB);if(EBSN)crRetheme(EBSN);EBSN=crSnap();EBCH=mkNinja(EB)}
const lookTabD=['Coiffure, couleur des cheveux, yeux (dont dôjutsu purement décoratifs), marques du visage, accessoire de tête et bandeau.','Peau, taille et carrure (purement visuelles : la zone de coups ne change pas), couleur du chakra et village.','Tenue et ses deux couleurs (principale et secondaire, « D\'origine » garde celles de la tenue), haori ou cape par-dessus, couleur du masque et de l\'écharpe.','Accessoires des bras et du cou, objet et symbole dans le dos, porte-kunai et pochette, couleur du bandeau (le ninja tourne pour montrer son dos).'];
// --- textes d'aide des options de build
function optDesc(k,v){
 if(k==='clan'){const c=v-1,T=TRAITS[c];return(c<0?'Sans clan : 5 sub au choix dans la liste de tous les sub, exactement 1 par rang (ou un kekkei genkai). ':isMartial(c)?'Clan martial : pas de nature, arbre de style imposé, 2 jutsu par rang tous appris. ':'Arbre de clan : 1 jutsu par rang, sans mudra. ')+(T?`Trait « ${T.nom||T.name} » : ${T.desc||''}`:'')}
 if(k==='st')return`Arbre ${STNAME[v]} : 1 jutsu par rang, sans mudra ; ton attaque de base (Clic G) en vient si tu n'as pas de style de clan.`;
 if(k==='nat'){const w=BEATS[v],l=BEATS.indexOf(v);return`${NATURES[v][0]} (${NATURES[v][1]}) : fort contre ${NATURES[w][0]}, faible contre ${NATURES[l][0]}. Arbre de nature : 2 jutsu par rang, tu en apprends 1 par rang (avec mudras).`}
 if(k==='l.z'||k==='l.w')return'Purement visuel : même zone de coups, même vitesse.';
 if(k==='l.o')return v?'Remplace la couleur principale de la tenue.':'Garde la couleur principale de la tenue.';
 if(k==='l.s')return v?'Remplace la couleur secondaire (gilet, haori, jupe ou pantalon).':'Garde la couleur secondaire de la tenue.';
 if(k==='l.e')return v>=10?'Dôjutsu décoratif : aucun effet en combat.':v?'':'Les yeux du clan (Sharingan, Byakugan…) ou ceux d\'une marque du visage.';
 if(k==='side')return v?'Tu combats avec l\'Akatsuki : tes alliés de bataille et la couleur de ton nom.':'Tu combats avec l\'Alliance Shinobi : tes alliés de bataille et la couleur de ton nom.';
 return''}
// --- icône d'un jutsu : disque à la couleur de l'élément, gros contour sombre, symbole (flamme, goutte, vent, éclair, roche, shuriken, initiale du clan, kunai)
// couleur éclaircie (vers un crème) jusqu'à la luminosité L : texte lisible sur le fond brun sombre, teinte du clan gardée
const liftC=(c,L)=>{if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const l=lum(c);if(l>=L)return c;const W0=[244,226,200],lw=(W0[0]*.3+W0[1]*.59+W0[2]*.11)/255,k=Math.min(1,(L-l)/(lw-l)),n=parseInt(c.slice(1,7),16),C=[n>>16,n>>8&255,n&255].map((v,i)=>Math.round(v+(W0[i]-v)*k));return'#'+C.map(v=>v.toString(16).padStart(2,'0')).join('')};
const lum=c=>{if(c.length===4)c='#'+c[1]+c[1]+c[2]+c[2]+c[3]+c[3];const n=parseInt(c.slice(1,7),16);return((n>>16)*.3+(n>>8&255)*.59+(n&255)*.11)/255};
function jIcon(x,y,r,col,cat,ult){g.save();g.fillStyle=col;g.strokeStyle='#14100a';g.lineWidth=2.5;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.stroke();
 if(ult){g.strokeStyle='#ffe81f';g.lineWidth=2;g.beginPath();g.arc(x,y,r+3.5,0,7);g.stroke()}
 const f=lum(col)>.6?'#2a1a0c':'#fff8e8',k=cat==null?'s':cat[0]==='n'?cat:cat[0];g.translate(x,y);g.scale(r/16,r/16);g.fillStyle=f;g.strokeStyle=f;g.lineWidth=2.4;g.lineCap='round';g.lineJoin='round';g.beginPath();
 switch(k){case'n0':g.moveTo(0,-11);g.bezierCurveTo(8,-3,9,3,6,7);g.bezierCurveTo(3,11,-3,11,-6,7);g.bezierCurveTo(-8,3,-5,-1,-3,-4);g.bezierCurveTo(-1,0,2,-1,0,-11);g.fill();break
  case'n1':g.moveTo(0,-11);g.bezierCurveTo(3,-5,7,-1,7,4);g.arc(0,4,7,0,Math.PI);g.bezierCurveTo(-7,-1,-3,-5,0,-11);g.fill();break
  case'n2':g.moveTo(-9,-5);g.quadraticCurveTo(2,-10,8,-4);g.moveTo(-10,1);g.quadraticCurveTo(3,-4,10,2);g.moveTo(-7,7);g.quadraticCurveTo(1,3,6,8);g.stroke();break
  case'n3':g.moveTo(3,-12);g.lineTo(-7,2);g.lineTo(-1,2);g.lineTo(-4,12);g.lineTo(7,-3);g.lineTo(1,-3);g.lineTo(5,-12);g.closePath();g.fill();break
  case'n4':g.moveTo(-11,8);g.lineTo(-4,-5);g.lineTo(0,1);g.lineTo(4,-9);g.lineTo(11,8);g.closePath();g.fill();break
  case'u':case'f':g.moveTo(0,-12);g.lineTo(3,-3);g.lineTo(12,0);g.lineTo(3,3);g.lineTo(0,12);g.lineTo(-3,3);g.lineTo(-12,0);g.lineTo(-3,-3);g.closePath();g.fill();g.fillStyle=col;g.beginPath();g.arc(0,0,2.4,0,7);g.fill();break
  case'c':{const t=clanTag(+cat.slice(1));text(t,0,t.length>1?5:6,t.length>1?13:17,f)}break
  case'g':{const i=+cat.slice(1),K=KGS[i];if(K&&K.ico){g.fillStyle=f;g.strokeStyle=f;K.ico(f,col)}else{const t=K?K.tag:'?';text(t,0,t.length>1?5:6,t.length>1?13:17,f)}}break
  case'p':g.arc(0,0,7,0,7);g.stroke();g.beginPath();g.arc(0,0,2.5,0,7);g.fill();break
  default:g.moveTo(-7,7);g.lineTo(1,-1);g.stroke();g.beginPath();g.moveTo(-1,-5);g.lineTo(10,-10);g.lineTo(5,1);g.closePath();g.fill();g.beginPath();g.arc(-9,9,2.6,0,7);g.stroke()}
 g.restore()}
function rankBadge(x,y,r,w=46){rr({x,y,w,h:18},5,RANKC[r]);text(`rang ${r}`,x+w/2,y+13,11,'#14100a')}
function styleBadge(x,y,w=46){rr({x,y,w,h:18},5,'#e8cfa8');text('STYLE',x+w/2,y+13,10,'#14100a')}
function arrowBtn(R,left){const h=inRect(mouse,R)&&picker===null;rr(R,6,h?'#ff9a3a':'rgba(40,30,20,.9)');text(left?'◀':'▶',R.x+R.w/2,R.y+R.h/2+5,12,h?'#1a1008':'#f3d9b0')}
function btn(R,label,on,col='#ff9a3a'){const h=inRect(mouse,R)&&picker===null;rr(R,R.h/2,on?col:h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)',col,1.5);text(label,R.x+R.w/2,R.y+R.h/2+5,13,on?'#1a1008':'#f3d9b0')}
// --- info-bulle : un élément survolé assez longtemps (≈ 0,3 s) affiche son texte complet
let tipK=null,tipT0=0,TIP=null;
const hoverTip=(k,f)=>{if(k!==tipK){tipK=k;tipT0=performance.now()}TIP=f};
function drawTip(){if(!TIP){tipK=null;return}if(performance.now()-tipT0<300)return;const T=TIP(),w=380,F=FNT(12);const L=wrapL(T.d,w-24,F),extra=T.l||[];
 const h=34+extra.length*16+L.length*15+(T.f?20:0);const yM=state==='menu'&&scr==='edit'&&mouse.y<650?650:H-8; // assistant : l'infobulle d'une carte ne couvre pas les boutons du bas (Retour, Aléatoire, Suivant)
 let x=mouse.x+18,y=mouse.y+18;if(x+w>W-8)x=mouse.x-w-14;if(y+h>yM)y=Math.max(8,yM-h);
 if(T.ax!=null){x=Math.max(8,T.ax-w-10);y=clamp(mouse.y-20,8,Math.max(8,H-8-h))} // ancrée à gauche d'un panneau
 g.save();g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=14;rr({x,y,w,h},8,'rgba(18,12,8,.98)',T.col||'#ffb347',1.5);g.restore();
 fitT(T.t,x+12,y+22,15,T.col||'#ffd38a',w-24,'bold',11);let yy=y+40;for(const [s,c] of extra){fitT(s,x+12,yy,11.5,c||'#d8b888',w-24,'normal',9);yy+=16}
 g.font=F;g.fillStyle='#ecdcc0';g.textAlign='left';for(const s of L){g.fillText(s,x+12,yy+2);yy+=15}if(T.f)text(T.f,x+12,yy+12,11,'#ffb347','left','bold')}
// --- panneau de choix (Clic G, une case de la barre, le dash, les familles, un modèle, une option de build ou d'apparence)
let pickTab=0,pickScroll=0,menuLast=0;
function pickData(p){
 if(p===0){const L=stylesOf(EB),col=EB.clan>=0?CLANS[EB.clan][1]:'#e8cfa8';return{kind:'j',title:`${lbl[SLOTS[0]]} · Style de combat`,sub:'Ton attaque de base (sans chakra) : le style de ton clan, ou un style de ton arbre '+STNAME[EB.st],
  items:L.map(i=>{const ab=styleAb(i);return{v:i,n:ab.n,col,ic:null,style:1,l2:`${abCd(ab)} · corps à corps`,d:ab.d,sel:EB.w===i}})}}
 if(typeof p==='number'&&p>=BAR0&&p<BAR0+BARN){const tr=treesOf(EB),CB=crB(),cur=CB[p-BAR0];const A=[];
  for(const t of tr)for(const r of RANKO)for(const id of TREE[t][r])if(EB.k.includes(id))A.push(JL[id]);const trL=tr.filter(t=>A.some(J=>J.cat===t));
  const items=A.map(J=>{const ab=jutsu(J.id),sel=J.id===cur,o=CB.indexOf(J.id),lr=EB.k.includes(J.id),T=TREES[J.cat];
   return{v:J.id,n:crN(J.id),col:catCol(J.cat),ic:J.cat,ult:J.r==='S',rank:J.r,tab:catName(J.cat),l2:`${jcostT(ab)} · ${fmtCd(ab.cd)} · ${ab.mud?ab.mud+' mudras':'sans mudra'}${lr?' · appris':''}`,d:J.d,sel,used:!sel&&o>=0?BAR0+o:0,learned:lr,
    warn:lr?'':learnBlock(EB.k,J.id)?(T.pool?'remplace le sub de rang '+J.r+' déjà appris':'remplace le jutsu de rang '+J.r+' de '+T.name):''}});
  if(cur>=0)items.unshift({v:'clear',n:'Vider la case',col:'#8a7458',ic:null,style:1,l2:'La case reste vide dans cette barre',d:'Le jutsu reste appris (il peut être dans tes autres barres).',sel:false});
  return{kind:'j',title:`Touche ${lbl[SLOTS[p]]} · barre « ${crBN()} »${EBI===0?' (départ)':''}`,sub:`Clique un de tes jutsu appris : il est posé ici (déjà dans la barre : les deux cases s'échangent) · ${EB.k.length} jutsu appris (étape Jutsu pour en changer)`,tabs:trL.length>1?['Tous'].concat(trL.map(catName)):null,tabC:['#ffb347'].concat(trL.map(catCol)),items}}
 if(p===DASHI){const D=dashOpts(EB);return{kind:'o',title:`${lbl[SLOTS[DASHI]]} · Dash`,sub:EB.clan>=0?'Le dash de ton clan (sans chakra)':kgOk(EB.kg)?'Sans clan : dash normal, celui de ta nature ou celui de ton kekkei genkai (sans chakra)':'Sans clan : dash normal, celui de ta nature ou celui de la famille d\'un de tes sub (sans chakra)',
  items:D.map(k=>{const X=k==='c'?DASHC[EB.clan]||DASHB:k==='n'?DASHN[EB.nat]||DASHB:k==='g'?DASHG[EB.kg]||DASHB:k[0]==='f'?DASHF[+k.slice(1)]||DASHB:DASHB;return{v:k,n:X.n+(k==='n'?' (nature)':k==='g'?' ('+KGS[EB.kg].n+')':k[0]==='f'?' ('+FAMS[+k.slice(1)][0]+')':k==='b'?' (normal)':''),col:k[0]==='f'?FAMS[+k.slice(1)][1]:k==='n'?NATURES[EB.nat][2]:k==='g'?KGS[EB.kg].col:'#e8cfa8',ic:k[0]==='f'?'f'+k.slice(1):k==='n'?'n'+EB.nat:k==='g'?'g'+EB.kg:undefined,d:X.d||'',sel:EB.dsh===k}})}}
 if(p==='preset')return{kind:'o',title:'Modèles de kit',sub:'Reprend le kit et l\'apparence d\'un perso de l\'anime, à retoucher ensuite (ton camp est gardé, ainsi que ton nom si tu l\'as choisi)',
  items:PRESETS.map((P,i)=>({v:i,n:P.full,col:P.clan>=0?CLANS[P.clan][1]:NATURES[P.nat][2],ic:P.clan>=0?'c'+P.clan:'n'+P.nat,d:`${presetLine(P)} · barres : ${(PREBARS[P.n]||[]).map(q=>q[0]).join(', ')||(P.bar||P.j||[]).join(', ')}`,sel:presetI===i}))};
 const a=APP.find(x=>x[2]===p);if(!a)return null;const L=a[1](),look=p.startsWith('l.');
 return{kind:look?'a':'o',title:a[0],sub:look?'Clique une option : l\'aperçu à droite change tout de suite':'',items:L.map((it,v)=>({v,n:itN(it),col:swCol(it)||'#e8cfa8',sw:swCol(it),ic:p==='nat'?'n'+v:p==='clan'?(v?'c'+(v-1):'u'):undefined,d:optDesc(p,v),sel:getB(p)===v}))}}
// le panneau prend la hauteur de son contenu (au plus jusqu'en bas de l'écran, puis défilement)
const pickBox=D=>typeof picker==='string'&&picker.startsWith('l.')?{x:30,y:112,w:850,h:532}:{x:150,y:118,w:980,h:Math.min(556,Math.max(230,(D&&D.tabs?104:70)+Math.ceil((D?D.items.length:30)/(picker==='clan'?4:3))*70-8+44))};
function pickGrid(D){const B=pickBox(D),cols=D.kind==='a'||picker==='clan'?4:3,ch=D.kind==='a'?40:62,gx=B.x+20,gy=B.y+(D.tabs?104:70),gw=B.w-40-14,gh=B.y+B.h-32-gy;return{B,gx,gy,gw,gh,cols,ch,cw:(gw-(cols-1)*10)/cols,step:ch+8}}
const pickList=D=>D.tabs&&pickTab>0?D.items.filter(it=>it.tab===D.tabs[pickTab]):D.items;
const pickMax=(D,G)=>Math.max(0,Math.ceil(pickList(D).length/G.cols)*G.step-8-G.gh);
const cardRect=(G,i)=>({x:G.gx+(i%G.cols)*(G.cw+10),y:G.gy+Math.floor(i/G.cols)*G.step-pickScroll,w:G.cw,h:G.ch});
const closeRect=B=>({x:B.x+B.w-44,y:B.y+12,w:32,h:32});
function tabRects(D,B){if(!D.tabs)return[];let x=B.x+20;g.font=FNT(13,'bold');return D.tabs.map((t,i)=>{const n=i?D.items.filter(it=>it.tab===t).length:D.items.length,s=`${t} (${n})`,w=g.measureText(s).width+28,R={x,y:B.y+66,w,h:28,s};x+=w+8;return R})}
function openPicker(p){picker=p;pickTab=0;pickScroll=0;const D=pickData(p);if(!D){picker=null;return}const G=pickGrid(D),i=D.items.findIndex(x=>x.sel);if(i>=0)pickScroll=Math.max(0,Math.min(pickMax(D,G),Math.floor(i/G.cols)*G.step-G.gh/2+G.ch/2))}
// modèles de kit : une ligne « clan · nature » par perso de l'anime
const presetLine=P=>`${P.clan>=0?'Clan '+CLANS[P.clan][0]:'Sans clan'}${isMartial(P.clan)?'':' · '+NATURES[P.nat][0]}`;
function applyPick(it){const p=picker;
 if(p===0){EB.w=it.v;picker=null}
 else if(typeof p==='number'&&p>=BAR0&&p<BAR0+BARN){const s0=p-BAR0;if(it.v==='clear')crB()[s0]=-1;else{crLearn(it.v);const B=crB();const t=B.indexOf(it.v);if(t>=0&&t!==s0)B[t]=B[s0];B[s0]=it.v}picker=null}
 else if(p===DASHI){EB.dsh=it.v;picker=null}
 else if(p==='preset'){picker=null;const P=PRESETS[it.v],go=()=>{applyPreset(it.v);WZ.max=WZN-1;WZ.rev.clear();WZ.keep=null;CRHOLE=[];crSay(`Modèle « ${P.full} » repris : toutes les étapes sont ouvertes, retouche ce que tu veux`,'#8fe38f')};
  // un perso déjà commencé (ou déjà enregistré) : son kit et son apparence seraient écrasés, on confirme d'abord
  if(edDirty()||ED&&ED.k||WZ.max>0)CONF={t:`Partir de ${P.full} ?`,d:`Ton origine, ta nature, ton style, tes jutsu, tes barres et ton apparence actuels sont remplacés par ceux de ${P.full}. `+(ED&&ED.k||!(['','Ninja','Nouveau ninja'].includes(EB.name||'')||PRESETS.some(q=>q.n===EB.name)||ED&&EB.name===ED.auto)?'Ton nom et ton camp sont gardés.':'Ton camp est gardé.'),ok:'Reprendre ce modèle',no:'Garder mon perso',col:'#ffb347',fn:go};else go();return}
 else{setB(p,it.v);if(!p.startsWith('l.'))picker=null}
 edRebuild()}
try{cv.addEventListener('wheel',e=>{if(state==='menu'&&picker!==null){pickScroll+=e.deltaY*(e.deltaMode?40:1);e.preventDefault()}},{passive:false})}catch(e){}
function pickerClick(){const D=pickData(picker);if(!D){picker=null;return true}const G=pickGrid(D),B=G.B;
 if(!inRect(mouse,B)||inRect(mouse,closeRect(B))){picker=null;return true}
 const T=tabRects(D,B);for(let i=0;i<T.length;i++)if(inRect(mouse,T[i])){pickTab=i;pickScroll=0;return true}
 const mx=pickMax(D,G);if(mx>0&&inRect(mouse,{x:G.gx+G.gw,y:G.gy,w:20,h:G.gh})){pickScroll=clamp((mouse.y-G.gy)/G.gh,0,1)*mx;return true}
 if(inRect(mouse,{x:G.gx,y:G.gy,w:G.gw,h:G.gh})){const L=pickList(D);for(let i=0;i<L.length;i++)if(inRect(mouse,cardRect(G,i))){applyPick(L[i]);return true}}
 return true}
// --- dessin d'une carte du panneau de choix
function drawCard(D,it,R,hov){const j=D.kind==='j',a=D.kind==='a';
 rr(R,8,it.sel?'rgba(110,70,30,.98)':hov?'rgba(74,48,24,.98)':'rgba(30,20,12,.97)',it.sel?'#ffb347':hov?'#c08040':'#5a3a1e',it.sel?2.5:1);
 if(!a){g.fillStyle=it.col;g.fillRect(R.x+1,R.y+8,3,R.h-16)}
 if(a){if(it.sw){rr({x:R.x+10,y:R.y+R.h/2-9,w:18,h:18},4,it.sw,'#14100a',2)}fitT(it.n,R.x+(it.sw?36:12),R.y+R.h/2+5,13.5,it.sel?'#ffd38a':'#fff',R.w-(it.sw?44:20),'bold',10);if(it.sel)text('✓',R.x+R.w-12,R.y+R.h/2+5,14,'#ffb347','right');return}
 const ix=it.ic!==undefined;if(ix)jIcon(R.x+27,R.y+R.h/2,16,it.col,it.ic,it.ult);const x=R.x+(ix?52:14),w=R.x+R.w-10-x;
 fitT(it.n,x,R.y+21,14,it.sel?'#ffe0a0':'#ffd38a',w-(it.sel?62:0),'bold',11);if(it.sel){rr({x:R.x+R.w-66,y:R.y+7,w:56,h:17},5,'#ffb347');text('ÉQUIPÉ',R.x+R.w-38,R.y+19.5,10,'#1a1008')}
 if(j){let bx=x;if(it.style)styleBadge(bx,R.y+27,44);else rankBadge(bx,R.y+27,it.rank,44);bx+=50;fitT(it.l2,bx,R.y+40,11,'#d8b888',R.x+R.w-bx-(it.nc!=null&&!it.sel?62:10),'normal',9);
  if(it.warn&&!it.sel)text('↺',R.x+R.w-12,R.y+40,13,'#ffb347','right','bold');fitT(it.d,x,R.y+55,11,'#bfa888',w,'normal',10)}
 else{const L=wrapL(it.d,w,FNT(11));g.fillStyle='#bfa888';fitT(L[0]||'',x,R.y+38,11,'#cdb898',w,'normal',10);if(L[1])fitT(L.slice(1).join(' '),x,R.y+53,11,'#cdb898',w,'normal',10)}
 if(it.used){g.fillStyle='rgba(12,8,5,.6)';g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,8);g.fill();rr({x:R.x+R.w-216,y:R.y+R.h-23,w:208,h:19},9.5,'rgba(40,26,14,.97)','#8a5a2a');text(`Déjà en ${lbl[SLOTS[it.used]]} · clic : échanger`,R.x+R.w-112,R.y+R.h-9.5,11,'#ffb347')}}
function drawPicker(){const D=pickData(picker);if(!D){picker=null;return}const G=pickGrid(D),B=G.B,L=pickList(D),mx=pickMax(D,G);pickScroll=clamp(pickScroll,0,mx);
 g.fillStyle='rgba(0,0,0,.62)';g.fillRect(0,0,W,H);g.save();g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=24;rr(B,14,'rgba(26,17,10,.98)','#8a5a2a',2);g.restore();
 g.fillStyle='#ff9a3a';g.fillRect(B.x+14,B.y+56,B.w-28,1.5);
 fitT(D.title,B.x+20,B.y+32,20,'#ffb347',B.w-300,'bold',13);if(D.sub)fitT(D.sub,B.x+20,B.y+50,12,'#d8b888',B.w-120,'normal',10);
 if(D.kind==='j'&&picker)text(`${EB.k.length} appris`,B.x+B.w-58,B.y+33,15,'#ffd38a','right');
 {const R=closeRect(B),h=inRect(mouse,R);rr(R,8,h?'#ff9a3a':'rgba(50,34,20,.95)','#8a5a2a');text('✕',R.x+16,R.y+22,16,h?'#1a1008':'#f3d9b0')}
 tabRects(D,B).forEach((R,i)=>{const on=i===pickTab,h=inRect(mouse,R),c=(D.tabC||[])[i]||'#ffb347';rr(R,14,on?c:h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)',c,1.5);text(R.s,R.x+R.w/2,R.y+19,13,on?(lum(c)>.45?'#1a1008':'#fff'):'#f3d9b0')});
 const inG=inRect(mouse,{x:G.gx,y:G.gy,w:G.gw,h:G.gh});g.save();g.beginPath();g.rect(G.gx-4,G.gy-4,G.gw+8,G.gh+8);g.clip();
 L.forEach((it,i)=>{const R=cardRect(G,i);if(R.y+R.h<G.gy-4||R.y>G.gy+G.gh+4)return;const hov=inG&&inRect(mouse,R);drawCard(D,it,R,hov);
  if(hov&&D.kind!=='a')hoverTip('pk'+picker+':'+it.v,()=>({t:it.n,col:it.col,l:D.kind==='j'?[[it.style?'Attaque de base (sans chakra)':`${it.tab} · rang ${it.rank}`,it.col],[it.l2,'#d8b888']].concat(it.warn?[['Choisir ce jutsu '+it.warn,'#ffb347']]:[]):[],
   d:it.d,f:it.used?`Déjà équipé en ${lbl[SLOTS[it.used]]} : un clic échange les deux emplacements`:it.sel?'Équipé':'Clic : choisir'}))});
 g.restore();
 if(mx>0){const tr={x:G.gx+G.gw+6,y:G.gy,w:6,h:G.gh},k=G.gh/(G.gh+mx);rr(tr,3,'rgba(255,255,255,.08)');rr({x:tr.x,y:tr.y+(G.gh-G.gh*k)*pickScroll/mx,w:6,h:G.gh*k},3,'#c08040');
  if(pickScroll<mx)text('▼ molette pour voir la suite',B.x+B.w/2,B.y+B.h-12,11,'#ffb347','center','bold')}
 text('Échap, ✕ ou clic hors du cadre pour fermer'+(D.tabs?' · ← → onglets':''),B.x+20,B.y+B.h-12,11,'#9a8060','left','normal')}
// en-tête commun du menu : titre, état du salon ; modes et EN LIGNE sauf en création (bandeau « création » à la place)
function drawHead(edit,noSt){
 g.save();g.shadowColor='#ff9a3a';g.shadowBlur=18;text('NARUTO · ARÈNE NINJA',W/2,52,42,'#ffb347');g.restore();
 if(net.role&&!noSt){const m=!coop()?net.status:lobbyList().map(x=>`${who(x)} : ${x.c&&CH[x.c]?CH[x.c].name:'…'}${mode==='arena'?'':x.team?' [B]':' [A]'}${x.ready?' ✓':''}`).join('  ·  ');g.font='normal 12px "Trebuchet MS",system-ui,sans-serif';tfit(m,1222-Math.min(1060,g.measureText(m).width),131,12,'#9f9',1060)}
 if(edit)return;
 {const b=coopBtn,h=inRect(mouse,b),on=coop()||net.role==='host';g.fillStyle=on?'#7f7':h?'rgba(90,60,30,.95)':'rgba(40,28,18,.9)';g.strokeStyle=on?'#7f7':'#8a5a2a';g.lineWidth=1.5;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,15);g.fill();g.stroke();text(!on?'EN LIGNE':net.role==='host'?`SALON ${net.code||''} · ${lobbyList().length}/${MAXP}`:`EN LIGNE · ${lobbyList().length} joueurs`,b.x+b.w/2,b.y+20,13,on?'#10131c':'#f3d9b0')}
 for(const b of modeBtns){const on=mode===b.m,h=inRect(mouse,b)&&!isGuest();g.fillStyle=on?'#ff9a3a':h?'rgba(90,60,30,.95)':'rgba(40,28,18,.9)';g.strokeStyle=on?'#ff9a3a':'#8a5a2a';g.lineWidth=1.5;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,15);g.fill();g.stroke();text(modeLabel(b),b.x+b.w/2,b.y+20,13,on?'#1a1008':'#f3d9b0')}}
// ---------- création en ARBRES : grille des cartes, apprendre / oublier, barre de départ ----------
// message bref sous la barre (retour d'une action)
let CRMSG='',CRMC='#c8b89a',CRMT=0,CRH=-1;
const crSay=(s,c)=>{CRMSG=s;CRMC=c||'#c8b89a';CRMT=performance.now()+2600};
// (cartes des arbres : étape Jutsu de l'assistant, nr_wiz.js)
const crForced=jid=>!!(JL[jid]&&TREES[JL[jid].cat]&&TREES[JL[jid].cat].force);
// apprendre : un jutsu remplacé (même rang, même arbre ou même réserve de familles) laisse sa case de barre au nouveau
// un jutsu OUBLIÉ (clic sur un jutsu appris) laisse ses cases vides en mémoire (CRHOLE) : apprendre ensuite un jutsu du même rang et de la même réserve
// (même arbre, ou les sub) les reprend, comme un remplacement direct (oublier Shôsen puis prendre un autre sub A = même case dans chaque barre)
let CRHOLE=[];const crPool=J=>catType(J.cat)==='famille'?'f':J.cat;
function crLearn(jid){const OB=crBars().map(B=>B.slice()),ok=EB.k.slice();if(!learnJ(EB,jid))return false;
 const gone=ok.filter(id=>!EB.k.includes(id));crBars().forEach((B,bi)=>OB[bi].forEach((id,s)=>{if(gone.includes(id)&&B[s]===-1&&!B.includes(jid))B[s]=jid}));
 {const J=JL[jid],H=CRHOLE.filter(h=>h.r===J.r&&h.p===crPool(J));CRHOLE=CRHOLE.filter(h=>!H.includes(h));const BB=crBars();for(const h of H){const B=BB[h.bi];if(B&&B[h.s]===-1&&!B.includes(jid))B[h.s]=jid}}
 return gone}
function crToggle(jid){const J=JL[jid];if(!J)return;
 if(crForced(jid)&&EB.k.includes(jid)){crSay('Clan martial : ce jutsu est appris d\'office','#c8b89a');return}
 if(EB.k.includes(jid)){const J0=JL[jid];crBars().forEach((B,bi)=>B.forEach((id,s)=>{if(id===jid)CRHOLE.push({bi,s,r:J0.r,p:crPool(J0)})}));unlearnJ(EB,jid);edRebuild();crSay(`${crN(jid)} oublié : le rang ${J.r} de ${catName(J.cat)} reste vide`,'#ffb347');return}
 const g0=crLearn(jid);edRebuild();crSay(g0&&g0.length?`${crN(jid)} appris (remplace ${g0.map(id=>JL[id].n).join(', ')})`:`${crN(jid)} appris`,'#8fe38f')}
// survol + 1-6 : pose dans la case (apprend au besoin ; déjà ailleurs dans la barre = échange)
function crPlace(jid,s){const J=JL[jid];if(!J)return;if(!EB.k.includes(jid))crLearn(jid);if(!EB.k.includes(jid))return;
 const B=crB(),t=B.indexOf(jid);if(t===s){crSay(`${crN(jid)} est déjà en case ${s+1}`,'#c8b89a');return}if(t>=0)B[t]=B[s];B[s]=jid;edRebuild();crSay(`${crN(jid)} → « ${crBN()} », case ${s+1}`,'#8fe38f')}
// complète les cases vides avec les jutsu appris hors de la barre (ordre de la barre automatique) ; renvoie le nombre de cases remplies
function crFill(){const SN=crSnap(),B=crB(),A=autoBar(Object.assign({},EB,{k:EB.k.filter(id=>!B.includes(id))})).filter(id=>id>=0);let n=0;crSetB(B.map(id=>id>=0||!A.length?id:(n++,A.shift())));edRebuild();crRetheme(SN);return n}

// ---------- Menu : écran de création / modification d'un perso (apparence + build ; la liste des persos est dans nr_roster.js) ----------
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
const getB=k=>k==='clan'?EB.clan+1:k.startsWith('l.')?EB.l[k[2]]:EB[k],setB=(k,v)=>{if(k==='clan'){EB.clan=v-1;const cs=clanStyle(EB.clan);if(cs>=0)EB.w=cs;if(EB.clan>=0)EB.fam=[];edTrees()} // nouveau clan : son style signature est équipé
 else if(k==='nat'||k==='st'){EB[k]=v;edTrees()}
 else if(k.startsWith('l.')){EB.l[k[2]]=v;if(k==='l.t'&&TENUES[v]&&TENUES[v][1].hatC&&!EB.l.a)EB.l.a=4} // robe de Kage : son chapeau est proposé d'office (on peut l'enlever)
 else EB[k]=v};
const appOff=k=>(k==='nat'||k==='st')&&isMartial(EB.clan);
function edTrees(){EB=sanitizeBuild(EB);EB.k=autoLearn(EB,EB.k);EB=sanitizeBuild(EB)}
const edOver=()=>false; // (plus de budget de points)
const cycleJ=(s,d)=>{if(!s){const L=stylesOf(EB),i=L.indexOf(EB.w);EB.w=L[(i+d+L.length)%L.length]}};
// --- disposition : à gauche ton ninja et son APPARENCE (lignes l.*), à droite son BUILD DE COMBAT (camp, clan, nature, style, Clic G, barre de 6, dash, familles, jutsu appris)
// picker : panneau de choix ouvert = n° de case (0 Clic G, 1-6 barre, 7 dash), 'fam' (familles), 'preset' ou une clé de APP ('clan', 'nat', 'st', 'l.c'…)
const BX=428,BW=812,buildKeys=()=>APP.filter(a=>!a[2].startsWith('l.')),lookKeys=()=>APP.filter(a=>a[2].startsWith('l.')&&a[3]===LTAB);
const selRect=i=>{const n=buildKeys().length,w=(BW-(n-1)*8)/n;return{x:BX+i*(w+8),y:146,w,h:44}};
const slotRow=s=>({x:BX,y:216+s*38,w:BW,h:35}); // 0 Clic G · 1-6 barre de départ · 7 dash (Espace)
const passRow={x:BX,y:524,w:BW,h:44},budBox={x:BX,y:576,w:582,h:54},autoBarBtn={x:BX+582-150,y:582,w:140,h:26};
// les listes d'apparence peuvent s'allonger : la hauteur des lignes s'adapte (et chaque valeur ouvre une grille de choix)
const lookRow=i=>{const n=lookKeys().length,h=Math.max(19,Math.min(34,236/n)),y=422+i*h;return{y:y+h/2+5,h,l:{x:150,y:y+2,w:24,h:h-4},v:{x:177,y:y+2,w:194,h:h-4},r:{x:374,y:y+2,w:24,h:h-4}}};
let presetI=-1,EB=null,EBCH=null; // EB : build en cours de création ou de modification (MY reste le perso joué)
const rndBuildBtn={x:BX,y:638,w:190,h:32},presetBtn={x:BX+198,y:638,w:200,h:32};
const nameBtn={x:40,y:150,w:300,h:30},rndBtn={x:348,y:150,w:52,h:30},cancelBtn={x:44,y:662,w:352,h:32},saveBtn={x:1030,y:576,w:210,h:54};
const itN=it=>Array.isArray(it)?String(it[0]):String(it),swCol=it=>Array.isArray(it)&&typeof it[1]==='string'&&it[1][0]==='#'?it[1]:null;
const fmtCd=cd=>(Math.round((+cd||0)*100)/100)+' s';
// recharge affichée : pour un style, le rythme réel de ses 5 coups (de … à …, ou la moyenne avec avg)
const abCd=(ab,avg)=>{const c=ab&&ab.style!=null&&typeof stCad==='function'?stCad(ab):null;if(!c)return fmtCd(ab.cd);const a=Math.min(...c),b=Math.max(...c);return avg?fmtCd(c.reduce((x,y)=>x+y,0)/5):a===b?fmtCd(a):fmtCd(a).slice(0,-2)+' à '+fmtCd(b)};
const FNT=(z,w='normal')=>`${w} ${z}px "Trebuchet MS",system-ui,sans-serif`;
// texte sur une ligne : rétrécit jusqu'à min puis coupe avec « … »
function fitT(s,x,y,size,col,w,weight='normal',min=11,align='left'){s=String(s);let z=size;g.font=FNT(z,weight);while(z>min&&g.measureText(s).width>w){z-=.5;g.font=FNT(z,weight)}if(g.measureText(s).width>w){while(s.length>2&&g.measureText(s+'…').width>w)s=s.slice(0,-1);s=s.trimEnd()+'…'}g.textAlign=align;g.fillStyle=col;g.fillText(s,x,y);return g.measureText(s).width}
function wrapL(s,w,font){g.font=font;const out=[];let cur='';for(const wd of String(s||'').split(' ')){const t=cur?cur+' '+wd:wd;if(cur&&g.measureText(t).width>w){out.push(cur);cur=wd}else cur=t}if(cur)out.push(cur);return out}
const rr=(R,r,fill,stroke,lw=1)=>{g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,r);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke()}};
// ninja d'aperçu du créateur : gardé d'une image à l'autre (son modèle 3D n'est refait que si l'apparence change)
let MF=null;const menuFake=ch=>{if(!MF||MF.ch!==ch){const o=CH.p0;CH.p0=ch;MF=mkUnit('p0',0,0,ch.side);CH.p0=o}return MF};
// perso joué (MY) : gardé aussi dans 'nrBuild4' ; en ligne, envoyé à l'hôte (invité) ou diffusé dans le salon (hôte)
// aide des touches (ZQSD en AZERTY : libellés lbl suivant la disposition du clavier)
const HELPK=()=>`${lbl.KeyW}${lbl.KeyA}${lbl.KeyS}${lbl.KeyD} bouger · Clic G frapper · 1-6 jutsu · ${lbl.Space} dash · ${lbl.KeyQ} Kawarimi · ${lbl.KeyB} jutsu (barre) · ${lbl.KeyF} parade · ${lbl.KeyR} maintenu = chakra · ${lbl.KeyH} soin · Maj sprint · Tab scores · ${lbl.KeyM} son`;
function rebuildMine(){MY=sanitizeBuild(MY);if(!RSIM)try{localStorage.setItem('nrBuild5',JSON.stringify(bOut(MY)))}catch(e){}MYCH=mkNinja(MY);if(!isGuest())CH.p0=MYCH;
 if(net.role==='host'){net.ready=false;sendLobby()}else if(isGuest()&&coop()){net.ready=false;netSend({t:'build',b:MY});netSend({t:'ready',v:false})}}
// perso en création : seul l'aperçu change (rien n'est envoyé ni gardé avant « Enregistrer »)
function edRebuild(){EB=sanitizeBuild(EB);EBCH=mkNinja(EB)}
const lookTabD=['Coiffure, couleur des cheveux, yeux (dont dôjutsu purement décoratifs), marques du visage, accessoire de tête et bandeau.','Peau, taille et carrure (purement visuelles : la zone de coups ne change pas), couleur du chakra et village.','Tenue et ses deux couleurs (principale et secondaire, « D\'origine » garde celles de la tenue), haori ou cape par-dessus, couleur du masque et de l\'écharpe.','Accessoires des bras et du cou, objet et symbole dans le dos, porte-kunai et pochette, couleur du bandeau (le ninja tourne pour montrer son dos).'];
// --- textes d'aide des options de build
function optDesc(k,v){
 if(k==='clan'){const c=v-1,T=TRAITS[c];return(c<0?'Sans clan : jusqu\'à 5 familles de sub, 1 jutsu par rang toutes familles confondues. ':isMartial(c)?'Clan martial : pas de nature, arbre de style imposé, 2 jutsu par rang tous appris. ':'Arbre de clan : 1 jutsu par rang, sans mudra. ')+(T?`Trait « ${T.nom||T.name} » : ${T.desc||''}`:'')}
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
 const h=34+extra.length*16+L.length*15+(T.f?20:0);let x=mouse.x+18,y=mouse.y+18;if(x+w>W-8)x=mouse.x-w-14;if(y+h>H-8)y=Math.max(8,H-8-h);
 g.save();g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=14;rr({x,y,w,h},8,'rgba(18,12,8,.98)',T.col||'#ffb347',1.5);g.restore();
 fitT(T.t,x+12,y+22,15,T.col||'#ffd38a',w-24,'bold',11);let yy=y+40;for(const [s,c] of extra){fitT(s,x+12,yy,11.5,c||'#d8b888',w-24,'normal',9);yy+=16}
 g.font=F;g.fillStyle='#ecdcc0';g.textAlign='left';for(const s of L){g.fillText(s,x+12,yy+2);yy+=15}if(T.f)text(T.f,x+12,yy+12,11,'#ffb347','left','bold')}
// --- panneau de choix (un emplacement, le passif, un modèle, une option de build ou d'apparence)
let pickTab=0,pickScroll=0,menuLast=0;
function pickData(p){
 if(p===0){const L=stylesOf(EB),col=EB.clan>=0?CLANS[EB.clan][1]:'#e8cfa8';return{kind:'j',title:`${lbl[SLOTS[0]]} · Style de combat`,sub:'Ton attaque de base (sans chakra) : le style de ton clan, ou un style de ton arbre '+STNAME[EB.st],
  items:L.map(i=>{const ab=styleAb(i);return{v:i,n:ab.n,col,ic:null,style:1,l2:`${abCd(ab)} · corps à corps`,d:ab.d,sel:EB.w===i}})}}
 if(typeof p==='number'&&p>=BAR0&&p<BAR0+BARN){const tr=treesOf(EB),cur=EB.bar[p-BAR0];const A=[];
  for(const t of tr)for(const r of RANKO)for(const id of TREE[t][r])A.push(JL[id]);
  const items=A.map(J=>{const ab=jutsu(J.id),sel=J.id===cur,o=EB.bar.indexOf(J.id),lr=EB.k.includes(J.id),T=TREES[J.cat];
   return{v:J.id,n:J.n,col:catCol(J.cat),ic:J.cat,ult:J.r==='S',rank:J.r,tab:catName(J.cat),l2:`${jcostT(ab)} · ${fmtCd(ab.cd)} · ${ab.mud?ab.mud+' mudras':'sans mudra'}${lr?' · appris':''}`,d:J.d,sel,used:!sel&&o>=0?BAR0+o:0,learned:lr,
    warn:lr?'':learnBlock(EB.k,J.id)?(T.pool?'remplace le sub de rang '+J.r+' déjà appris':'remplace le jutsu de rang '+J.r+' de '+T.name):''}});
  if(cur>=0)items.unshift({v:'clear',n:'Vider la case',col:'#8a7458',ic:null,style:1,l2:'La case reste vide au début du combat',d:'Le jutsu reste appris (menu B en combat).',sel:false});
  return{kind:'j',title:`Touche ${lbl[SLOTS[p]]} · barre de départ`,sub:`Clique un jutsu : il est appris (au besoin à la place d'un autre du même rang) et posé ici · ${EB.k.length} jutsu appris`,tabs:tr.length>1?['Tous'].concat(tr.map(catName)):null,tabC:['#ffb347'].concat(tr.map(catCol)),items}}
 if(p===DASHI){const D=dashOpts(EB);return{kind:'o',title:`${lbl[SLOTS[DASHI]]} · Dash`,sub:EB.clan>=0?'Le dash de ton clan (sans chakra)':'Sans clan : dash normal, celui de ta nature ou celui d\'une de tes familles (sans chakra)',
  items:D.map(k=>{const X=k==='c'?DASHC[EB.clan]||DASHB:k==='n'?DASHN[EB.nat]||DASHB:k[0]==='f'?DASHF[+k.slice(1)]||DASHB:DASHB;return{v:k,n:X.n+(k==='n'?' (nature)':k[0]==='f'?' ('+FAMS[+k.slice(1)][0]+')':k==='b'?' (normal)':''),col:k[0]==='f'?FAMS[+k.slice(1)][1]:k==='n'?NATURES[EB.nat][2]:'#e8cfa8',ic:k[0]==='f'?'f'+k.slice(1):k==='n'?'n'+EB.nat:undefined,d:X.d||'',sel:EB.dsh===k}})}}
 if(p==='fam')return{kind:'o',title:'Familles de sub',sub:`Sans clan : jusqu'à ${FAMMAX} familles (clic : ajouter / retirer) ; tu apprends 1 sub par rang, toutes familles confondues`,
  items:FAMS.map((f,i)=>({v:i,n:f[0],col:f[1],ic:'f'+i,d:RANKO.split('').map(r=>r+' : '+(TREE['f'+i][r].map(id=>JL[id].n).join(', ')||'—')).join(' · '),sel:EB.fam.includes(i)}))};
 if(p==='preset')return{kind:'o',title:'Modèles de kit',sub:'Reprend le kit et l\'apparence d\'un perso de l\'anime, à retoucher ensuite (ton camp est gardé, ainsi que ton nom si tu l\'as choisi)',
  items:PRESETS.map((P,i)=>({v:i,n:P.full,col:P.clan>=0?CLANS[P.clan][1]:NATURES[P.nat][2],ic:P.clan>=0?'c'+P.clan:'n'+P.nat,d:`${presetLine(P)} · ${(P.bar||P.j||[]).join(', ')}`,sel:presetI===i}))};
 const a=APP.find(x=>x[2]===p);if(!a)return null;const L=a[1](),look=p.startsWith('l.');
 return{kind:look?'a':'o',title:a[0],sub:look?'Clique une option : l\'aperçu à gauche change tout de suite':'',items:L.map((it,v)=>({v,n:itN(it),col:swCol(it)||'#e8cfa8',sw:swCol(it),ic:p==='nat'?'n'+v:p==='clan'?(v?'c'+(v-1):'u'):undefined,d:optDesc(p,v),sel:getB(p)===v}))}}
// le panneau prend la hauteur de son contenu (au plus jusqu'en bas de l'écran, puis défilement)
const pickBox=D=>typeof picker==='string'&&picker.startsWith('l.')?{x:BX,y:142,w:BW,h:530}:{x:150,y:118,w:980,h:Math.min(556,Math.max(230,(D&&D.tabs?104:70)+Math.ceil((D?D.items.length:30)/(picker==='clan'?4:3))*70-8+44))};
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
 else if(typeof p==='number'&&p>=BAR0&&p<BAR0+BARN){const s0=p-BAR0;if(it.v==='clear')EB.bar[s0]=-1;else{learnJ(EB,it.v);const t=EB.bar.indexOf(it.v);if(t>=0&&t!==s0)EB.bar[t]=EB.bar[s0];EB.bar[s0]=it.v}picker=null}
 else if(p===DASHI){EB.dsh=it.v;picker=null}
 else if(p==='fam'){const i=EB.fam.indexOf(it.v);if(i>=0)EB.fam.splice(i,1);else if(EB.fam.length<FAMMAX)EB.fam.push(it.v);edTrees()}
 else if(p==='preset'){picker=null;applyPreset(it.v);return}
 else{setB(p,it.v);if(!p.startsWith('l.'))picker=null}
 edRebuild()}
try{cv.addEventListener('wheel',e=>{if(state==='menu'&&picker!==null){pickScroll+=e.deltaY*(e.deltaMode?40:1);e.preventDefault()}},{passive:false})}catch(e){}
function pickerClick(){const D=pickData(picker);if(!D){picker=null;return true}const G=pickGrid(D),B=G.B;
 if(!inRect(mouse,B)||inRect(mouse,closeRect(B))){picker=null;return true}
 const T=tabRects(D,B);for(let i=0;i<T.length;i++)if(inRect(mouse,T[i])){pickTab=i;pickScroll=0;return true}
 const mx=pickMax(D,G);if(mx>0&&inRect(mouse,{x:G.gx+G.gw,y:G.gy,w:20,h:G.gh})){pickScroll=clamp((mouse.y-G.gy)/G.gh,0,1)*mx;return true}
 if(inRect(mouse,{x:G.gx,y:G.gy,w:G.gw,h:G.gh})){const L=pickList(D);for(let i=0;i<L.length;i++)if(inRect(mouse,cardRect(G,i))){applyPick(L[i]);return true}}
 return true}
function creatorClick(){
 if(picker!==null)return pickerClick();
 if(inRect(mouse,nameBtn)){const n=prompt('Nom de ton ninja (16 caractères max)',EB.name);if(n!==null){EB.name=n.trim()||EB.name;edRebuild()}return true}
 if(inRect(mouse,rndBtn)){const r=srnd((Date.now()%2147483647)||7),b=randomBuild(r,EB.side,EB.name);EB.l=randomCosm(b.l,EB.name+Date.now(),EB.side);edRebuild();return true}
 for(let i=0;i<LTABS.length;i++)if(inRect(mouse,ltabR(i))){LTAB=i;return true}
 if(inRect(mouse,cancelBtn)){edCancel();return true}
 if(inRect(mouse,presetBtn)){openPicker('preset');return true}
 if(inRect(mouse,rndBuildBtn)){EB=randomKit(srnd((Date.now()%2147483647)||7),EB);edRebuild();return true}
 const cyc=(k,n,d)=>{setB(k,(getB(k)+n+d)%n);edRebuild()};
 for(const [i,[,list,k]] of buildKeys().entries()){const R=selRect(i);if(!inRect(mouse,R))continue;if(appOff(k))return true;const n=list().length;
  if(mouse.x<R.x+24)cyc(k,n,-1);else if(mouse.x>R.x+R.w-24)cyc(k,n,1);else openPicker(k);return true}
 for(const [i,[,list,k]] of lookKeys().entries()){const R=lookRow(i),n=list().length;if(inRect(mouse,R.l)){cyc(k,n,-1);return true}if(inRect(mouse,R.r)){cyc(k,n,1);return true}if(inRect(mouse,R.v)){openPicker(k);return true}}
 for(let s=0;s<=DASHI;s++)if(inRect(mouse,slotRow(s))){openPicker(s);return true}
 if(inRect(mouse,passRow)){if(EB.clan<0)openPicker('fam');return true}
 if(inRect(mouse,autoBarBtn)){EB.bar=autoBar(EB);edRebuild();return true}
 if(inRect(mouse,saveBtn)){if(!edOver())edSave();return true}
 return false}
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
   d:it.d,f:it.used?`Déjà équipé en ${lbl[SLOTS[it.used]]} : un clic échange les deux emplacements`:it.sel?'Équipé':'Clic : équiper'}))});
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
// ---------- écran de création / modification d'un perso (EB) ----------
function drawCreator(){
 // clavier du panneau de choix : Échap ferme, flèches haut/bas défilent, gauche/droite changent d'onglet
 if(picker!==null){if(pressed.Escape)picker=null;else{const D=pickData(picker);if(D){const G=pickGrid(D);if(pressed.ArrowDown||pressed.PageDown)pickScroll+=pressed.PageDown?G.gh:G.step;if(pressed.ArrowUp||pressed.PageUp)pickScroll-=pressed.PageUp?G.gh:G.step;
  if(D.tabs&&(pressed.ArrowLeft||pressed.ArrowRight)){pickTab=(pickTab+(pressed.ArrowRight?1:-1)+D.tabs.length)%D.tabs.length;pickScroll=0}}}}
 else if(pressed.Escape&&!CONF){edCancel();if(scr!=='edit')return drawRoster()}
 const free=picker===null&&!CONF,hv=R=>free&&inRect(mouse,R);
 drawHead(true);
 {const E=ED.k?rosGet(ED.k):null,s=ED.k?(E&&E.P?`MODIFIER · ${E.P.full} (perso de l'anime)`:`MODIFIER · ${E?E.b.name:EB.name}`):'CRÉATION D\'UN PERSO',R={x:290,y:76,w:700,h:30};
  rr(R,15,'rgba(40,28,18,.9)','#ff9a3a',1.5);fitT('✎  '+s,R.x+R.w/2,R.y+20,14,'#ffd38a',R.w-30,'bold',10,'center');
  fitT(ED.k&&E&&E.P?'Tes retouches sont gardées pour ce perso · « Rétablir l\'original » dans la liste le remet comme dans l\'anime':'À gauche son apparence, à droite son kit de combat · ✔ Enregistrer le range dans « Mes ninjas »',W/2,130,13,'#e8cfa8',1000,'normal',10,'center')}
 const t=performance.now()/1000,ch=EBCH; // le perso en cours (jamais CH.p0 : en ligne, côté invité, c'est le ninja de l'hôte)
 // ===== colonne de gauche : ton ninja + son apparence
 rr({x:30,y:142,w:380,h:560},12,'rgba(20,14,10,.85)','#5a3a1e');
 {const h=hv(nameBtn);rr(nameBtn,8,h?'rgba(90,60,30,.6)':'rgba(0,0,0,.25)');tfit(EB.name+'  ✎',nameBtn.x+10,nameBtn.y+22,20,ch.side?'#ff9a9a':'#ffd38a',280,'bold')}
 btn(rndBtn,'🎲',false);if(hv(rndBtn))hoverTip('rndL',()=>({t:'Apparence aléatoire',d:'Tire au hasard toute l\'apparence (coiffure, yeux, tenue et ses couleurs, accessoires, taille…). Ton build de combat ne change pas.'}));
 const fake=menuFake(ch);fake.aim=LTAB===3?Math.PI/2+t*.9:Math.PI/2+Math.sin(t*.8)*1.1;fake.moving=Math.sin(t*.5)>.3;fake.walk=t*13;fake.swing=0; // onglet Équipement : le ninja tourne sur lui-même (objets dans le dos)
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(220,316,50,13,0,0,7);g.fill();
 {g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(220,290,0,220,290,140);gr.addColorStop(0,rgba(ch.look.weapon.col,.16));gr.addColorStop(1,rgba(ch.look.weapon.col,0));g.fillStyle=gr;g.fillRect(80,186,280,150);g.restore()}
 drawPrevN(fake,220,314,1.6,0);drawChar3(fake,220,314,1.6);drawPrevN(fake,220,314,1.6,1);
 text(`${ch.hp} PV · vitesse ${ch.spd} · puissance ×${ch.pw.toFixed(2)}`,220,342,12.5,'#ffd38a','center','bold');
 fitT(ch.desc,220,358,11,'#b89a70',350,'normal',9,'center');
 // en-tête de section
 const sect=(s,x,y,w)=>{text(s,x+w/2,y+4,11,'#ffb347','center');g.font=FNT(11,'bold');const tw=g.measureText(s).width/2+10;g.fillStyle='rgba(255,154,58,.45)';g.fillRect(x,y,w/2-tw,1.5);g.fillRect(x+w/2+tw,y,w/2-tw,1.5)};
 sect('APPARENCE',44,380,352);
 LTABS.forEach((s,i)=>{const R=ltabR(i),on=LTAB===i,h=hv(R);rr(R,8,on?'#ff9a3a':h?'rgba(90,60,30,.95)':'rgba(40,28,18,.9)','#8a5a2a',1);text(s,R.x+R.w/2,R.y+16.5,12,on?'#1a1008':'#f3d9b0','center',on?'bold':'normal');
  if(h&&!on)hoverTip('lt'+i,()=>({t:'Apparence : '+s,d:lookTabD[i]}))});
 lookKeys().forEach(([lab,list,k],i)=>{const R=lookRow(i),L=list(),v=getB(k),it=L[v],z=Math.min(13,R.h*.5);fitT(lab,48,R.y,z,'#d8b888',96,'bold',9);arrowBtn(R.l,1);arrowBtn(R.r,0);
  const h=hv(R.v),sw=swCol(it);rr(R.v,6,h?'rgba(90,60,30,.85)':'rgba(0,0,0,.28)',h?'#c08040':null);if(sw)rr({x:R.v.x+7,y:R.y-z+1,w:z,h:z},3,sw,'#14100a',1.5);
  fitT(itN(it),R.v.x+(sw?12+z:8),R.y,z,'#fff',R.v.w-(sw?52:44),'bold',9);text(`${v+1}/${L.length}`,R.v.x+R.v.w-6,R.y,Math.min(10,z-1),'#8a7458','right','normal');
  if(h)hoverTip('lk'+k,()=>({t:lab+' : '+itN(it),d:`${L.length} choix. Clic : ouvrir la grille · ◀ ▶ : précédent / suivant.`}))});
 {const R=cancelBtn,h=hv(R),dt=edDirty();rr(R,R.h/2,h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)','#c08040',1.5);text(dt?'◀ Annuler (sans enregistrer)':'◀ Retour à la liste',R.x+R.w/2,R.y+21,14,'#f3d9b0');
  if(h)hoverTip('cancel',()=>({t:dt?'Annuler':'Retour',d:dt?'Revient à la liste sans garder tes changements (une confirmation est demandée).':'Revient à la liste des persos.',f:'Échap'}))}
 // ===== colonne de droite : build de combat
 // camp, voie, clan, nature : ◀ ▶ pour défiler, clic au centre pour la grille
 buildKeys().forEach(([lab,list,k],i)=>{const R=selRect(i),L=list(),v=getB(k),it=L[v],off=appOff(k),h=hv(R)&&!off,sw=swCol(it);
  rr(R,10,h?'rgba(70,46,24,.95)':'rgba(20,14,10,.85)',off?'#3a2a1a':k==='clan'&&EB.clan>=0?CLANS[EB.clan][1]:'#5a3a1e',k==='clan'&&EB.clan>=0?1.5:1);
  text(lab.toUpperCase(),R.x+R.w/2,R.y+15,10,'#b89a70','center');
  if(off){text('aucune (taijutsu pur)',R.x+R.w/2,R.y+34,12,'#7a6a58','center','normal');if(inRect(mouse,R)&&free)hoverTip('off'+k,()=>({t:'Pas de nature',d:'Les Taijutsuka n\'utilisent que leur corps : pas de nature, pas de mudras.'}));return}
  const ax=h&&mouse.x<R.x+24,bx=h&&mouse.x>R.x+R.w-24;text('◀',R.x+13,R.y+30,13,ax?'#fff':'#ffb347');text('▶',R.x+R.w-13,R.y+30,13,bx?'#fff':'#ffb347');
  const nm=itN(it);g.font=FNT(14,'bold');const tw=Math.min(R.w-60-(sw?18:0),g.measureText(nm).width),x0=R.x+R.w/2-(tw+(sw?18:0))/2;if(sw)rr({x:x0,y:R.y+22,w:12,h:12},3,sw,'#14100a',1.5);
  fitT(nm,x0+(sw?18:0),R.y+33,14,k==='clan'||k==='nat'?'#ffd38a':'#fff',R.w-60-(sw?18:0),'bold',10);
  if(h)hoverTip('bk'+k,()=>({t:`${lab} : ${nm}`,col:sw||'#ffd38a',d:optDesc(k,v)||' ',f:'Clic : voir tous les choix · ◀ ▶ : défiler'}))});
 // trait du clan et affinités de la nature
 {const T=TRAITS[EB.clan],tl=T?`${EB.clan<0?'Sans clan':'Trait'} · ${T.nom||T.name||''} : ${T.desc||''}`:'',col=EB.clan>=0?CLANS[EB.clan][1]:'#e8cfa8',aff=EB.nat>=0?`${NATURES[EB.nat][0]} : fort contre ${NATURES[BEATS[EB.nat]][0]}, faible contre ${NATURES[BEATS.indexOf(EB.nat)][0]}`:'Clan martial : aucune nature';
  g.font=FNT(11.5);const aw=Math.min(300,g.measureText(aff).width);fitT(aff,BX+BW-4,207,11.5,EB.nat>=0?NATURES[EB.nat][2]:'#b89a70',300,'normal',9,'right');
  if(tl){fitT(tl,BX+4,207,11.5,liftC(col,.5),BW-aw-30,'normal',10.5);if(free&&inRect(mouse,{x:BX,y:194,w:BW-aw-20,h:18}))hoverTip('trait',()=>({t:T.nom||T.name||'Trait',col,d:T.desc||''}))}}
 // Clic G, la barre de départ (touches 1-6) et le dash : touche, icône, nom, rang, chakra, recharge, mudras
 for(let s=0;s<=DASHI;s++){const R=slotRow(s),ab=ch.abil[s],h=hv(R),J=ab&&ab.jid!=null?JL[ab.jid]:null,col=J?catCol(J.cat):EB.clan>=0?CLANS[EB.clan][1]:'#e8cfa8',gold=!!J&&J.r==='S',kn=s===0?'Clic G':s===DASHI?'Dash':'Case '+s;
  rr(R,9,h?'rgba(74,48,24,.95)':'rgba(20,14,10,.85)',gold?'#ffb347':h?'#c08040':'#5a3a1e',gold?2:1);
  rr({x:R.x+6,y:R.y+4,w:66,h:R.h-8},7,'rgba(50,32,16,.95)',gold?'#ffe81f':'#8a5a2a',1.5);text(lbl[SLOTS[s]],R.x+39,R.y+17,13,gold?'#ffe81f':'#fff');text(kn,R.x+39,R.y+28,8.5,'#c8a878','center','normal');
  if(!ab){text('(case vide) · clic : choisir un jutsu',R.x+124,R.y+22,12,'#8a7458','left','normal');text('›',R.x+R.w-14,R.y+24,20,h?'#fff':'#8a5a2a','center');if(h)hoverTip('sl'+s,()=>({t:'Case vide',d:'Clique pour poser un jutsu dans cette case de la barre de départ (il est appris au besoin).'}));continue}
  jIcon(R.x+96,R.y+R.h/2,13,col,J?J.cat:null,gold);
  const nw=fitT(ab.n,R.x+118,R.y+16,13.5,gold?'#ffe81f':'#ffd38a',290,'bold',10);if(J)rankBadge(R.x+126+nw,R.y+4,J.r);else if(s===0)styleBadge(R.x+126+nw,R.y+4);
  if(J)fitT(catName(J.cat),R.x+180+nw,R.y+16,10,catCol(J.cat),Math.max(10,560-180-nw),'normal',9);else if(s===DASHI)fitT(EB.clan>=0?'dash du clan':'dash · clic : changer',R.x+130+nw,R.y+16,10,'#c8a878',200,'normal',9);
  fitT(ab.d||'',R.x+118,R.y+30,10.5,'#d8c0a0',470,'normal',9);
  const st=[[J?jcostT(ab).replace(' chakra',''):'0',J&&ab.hpc?'PV max':'chakra','#7fc8ff'],[s?fmtCd(ab.cd):abCd(ab,1),s?'recharge':'moy./coup','#ffd38a'],[J?ab.mud?String(ab.mud):'aucun':'—','mudras','#d8b888']];
  st.forEach(([v,l,c],k)=>{const x=R.x+612+k*62;text(v,x,R.y+17,13,c,'center');text(l,x,R.y+29,9,'#9a8060','center','normal')});
  text('›',R.x+R.w-14,R.y+24,20,h?'#fff':'#8a5a2a','center');
  if(h)hoverTip('sl'+s,()=>({t:ab.n,col,l:[[J?`Touche ${lbl[SLOTS[s]]} · ${catName(J.cat)} · rang ${J.r}`:s===0?`${lbl[SLOTS[s]]} · style de combat (sans chakra)`:`${lbl[SLOTS[s]]} · dash (sans chakra)`,col],[J?`${jcostT(ab)} · ${fmtCd(ab.cd)} · ${ab.mud?ab.mud+' mudras':'sans mudra'}`:s===0?`attaque de base · ${abCd(ab)} par coup`:`recharge ${fmtCd(ab.cd)}`,'#d8b888']],d:ab.d||'',f:s===DASHI&&EB.clan>=0?'Dash propre au clan':'Clic : choisir'}))}
 // familles de sub (sans clan) ou rappel des arbres du perso
 {const R=passRow,fr=EB.clan<0,h=hv(R)&&fr;rr(R,10,h?'rgba(50,62,36,.95)':'rgba(20,14,10,.85)',h?'#7fd87f':'#3a5a3a');
  rr({x:R.x+7,y:R.y+6,w:66,h:R.h-12},8,'rgba(30,50,26,.95)','#5aa85a',1.5);text(fr?'FAMILLES':'ARBRES',R.x+40,R.y+27,10.5,'#9f9');
  const tr=treesOf(EB);let x=R.x+86;for(const t of tr){const n=EB.k.filter(id=>JL[id].cat===t).length,tot=RANKO.split('').reduce((a,r)=>a+Math.min(TREE[t][r].length,tTake(TREES[t],r)),0),s2=`${catName(t)} ${n}/${tot}`;g.font=FNT(11.5,'bold');const w=g.measureText(s2).width+26;if(x+w>R.x+R.w-30)break;
   jIcon(x+8,R.y+R.h/2,7,catCol(t),t);fitT(s2,x+19,R.y+R.h/2+4,11.5,liftC(catCol(t),.6),w,'bold',9);x+=w+6}
  if(fr&&!EB.fam.length)text('aucune famille : clic pour en choisir (jusqu\'à '+FAMMAX+')',x,R.y+R.h/2+4,11.5,'#a8c898','left','normal');
  if(fr)text('›',R.x+R.w-14,R.y+R.h/2+6,22,h?'#fff':'#3a6a3a','center');
  if(hv(R))hoverTip('fam',()=>({t:fr?'Familles de sub':'Arbres du perso',col:'#7fd87f',d:fr?`Sans clan : jusqu'à ${FAMMAX} familles parmi ${FAMS.length} ; 5 sub au total, 1 par rang toutes familles confondues. Nature : 1 jutsu par rang. Style : 1 par rang.`:isMartial(EB.clan)?'Clan martial : arbre de clan à 2 jutsu par rang (tous appris) et arbre de style imposé.':'Nature : 1 jutsu par rang (parmi 2) · style : 1 par rang · clan : 1 par rang. Un rang peut rester vide.',f:fr?'Clic : choisir les familles':''}))}
 // jutsu appris (tous utilisables en combat via le menu B) et barre automatique
 {const R=budBox;rr(R,10,'rgba(20,14,10,.9)','#5a3a1e');text('JUTSU APPRIS',R.x+12,R.y+18,11,'#b89a70','left');text(String(EB.k.length),R.x+150,R.y+20,17,'#ffd38a','right');
  let x=R.x+160;for(const r of RANKO){const n=EB.k.filter(id=>JL[id].r===r).length;rr({x,y:R.y+7,w:44,h:16},5,RANKC[r]);text(`${r} × ${n}`,x+22,R.y+19,11,'#14100a');x+=48}
  fitT('Tous les jutsu appris se posent en combat (menu B) ; la barre de départ se change ici, case par case.',R.x+12,R.y+44,11,'#c8a878',R.w-170,'normal',9);
  btn(autoBarBtn,'↻ Barre auto',false);if(hv(autoBarBtn))hoverTip('autobar',()=>({t:'Barre automatique',d:'Remplit les 6 cases avec tes jutsu appris, du rang S au rang D, en alternant les arbres.'}))}
 btn(rndBuildBtn,'🎲 Kit aléatoire',false);btn(presetBtn,'📜 Modèles de kit',false);
 if(hv(rndBuildBtn))hoverTip('rndK',()=>({t:'Kit aléatoire',d:'Tire au hasard clan, nature, style, familles, jutsu appris et barre. Ton apparence ne change pas.'}));
 if(hv(presetBtn))hoverTip('pre',()=>({t:'Modèles de kit',d:'Les persos de l\'anime en liste : leur kit et leur apparence comme point de départ à retoucher.'}));
 RANKO.split('').forEach((r,i)=>{const x=BX+408+i*35;rr({x,y:643,w:31,h:22},6,RANKC[r]);text(`${r}·${RKB[r].ck}`,x+15.5,659,10.5,'#14100a')});if(free&&inRect(mouse,{x:BX+408,y:640,w:175,h:28}))hoverTip('rk',()=>({t:'Rangs des jutsu',d:`Chakra par lancer : D = ${RKB.D.ck}, C = ${RKB.C.ck}, B = ${RKB.B.ck}, A = ${RKB.A.ck}, S = ${RKB.S.ck} ; recharge : D ${RKB.D.cd.join('-')} s … S ${RKB.S.cd.join('-')} s. Les jutsu de nature demandent aussi des mudras (D = 2 … S = 6). Dash et Kawarimi : sans chakra.`}));
 {const R=saveBtn,h=hv(R);g.save();g.shadowColor='#ff9a3a';g.shadowBlur=h?22:10;rr(R,R.h/2,h?'#ffb347':'#ff9a3a','#ffd38a',2);g.restore();
  text('✔ ENREGISTRER',R.x+R.w/2,R.y+R.h/2+6,18,'#1a1008');
  if(h)hoverTip('save',()=>({t:'Enregistrer',d:ED.k?'Garde ces changements et revient à la liste, ce perso sélectionné.':'Ajoute ce ninja à « Mes ninjas » et revient à la liste, prêt à jouer.'}))}
 // sort commun à tous les ninjas : soin (H)
 fitT(`${lbl.KeyH} · Soin (tous les ninjas) : l'allié visé (ou toi) récupère ${Math.round(HLS.pct*100)} % de ses PV + 8 % en 2 s · incantation 0,3 s · ${HLS.cd} s de recharge · sans chakra`,BX+4,690,11.5,'#9fdfaa',640,'normal',9);
 if(picker!==null)drawPicker();
 else if(!CONF)text(HELPK(),W/2,714,11.5,'#e8cfa8','center','normal');
 drawConf();drawTip();drawCursor()}


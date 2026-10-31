// ---------- Menu : créateur de ninja (apparence + build) ----------
let picker=null; // emplacement dont on choisit le jutsu (liste ouverte)
// lignes de gauche : [libellé, liste, clé] ; le clan a une entrée « Sans clan » (valeur -1), la 2e nature n'existe que sans clan
const CLANL=[['Sans clan','#888']].concat(CLANS),NATL=NATURES.map(n=>[n[0]+' ('+n[1]+')',n[2]]);
const APP=[['Camp',()=>CAMPS,'side'],['Voie',()=>VOIES,'voie'],['Clan',()=>CLANL,'clan'],['Nature',()=>NATL,'nat'],['Village',()=>VILLAGES,'l.v'],['Tenue',()=>TENUES,'l.t'],['Coiffure',()=>COIFS,'l.c'],['Cheveux',()=>HAIRC,'l.h'],['Peau',()=>PEAUX,'l.p'],['Chakra',()=>CHAKRAS,'l.k'],['Accessoire',()=>ACCS,'l.a'],['Visage',()=>FACES,'l.f'],['Bandeau',()=>BANDS,'l.b'],['Dos',()=>BACKS,'l.d']];
const getB=k=>k==='clan'?MY.clan+1:k.startsWith('l.')?MY.l[k[2]]:MY[k],setB=(k,v)=>{if(k==='clan')MY.clan=v-1;else if(k.startsWith('l.'))MY.l[k[2]]=v;else MY[k]=v};
const appOff=k=>k==='nat'&&MY.clan===TAIJ;
const stylesOf=b=>STYLES.map((_,i)=>i).filter(i=>styleOk(i,b.clan));
const overBudget=()=>kitCost(MY)>budgetOf(MY);
const cycleJ=(s,d)=>{if(!s){const L=stylesOf(MY),i=L.indexOf(MY.j[0]);MY.j[0]=L[(i+d+L.length)%L.length];return}const A=avail(MY,s).filter(j=>j.id===MY.j[s]||!MY.j.slice(1).includes(j.id)),i=A.findIndex(j=>j.id===MY.j[s]);MY.j[s]=A[(i+d+A.length)%A.length].id};
// --- disposition : à gauche ton ninja et son APPARENCE (lignes l.*), à droite son BUILD DE COMBAT (camp, voie, clan, nature, 6 emplacements, passif, budget)
// picker : panneau de choix ouvert = n° d'emplacement (0 style, 1-5 jutsu), 'pass', 'preset' ou une clé de APP ('clan', 'nat', 'l.c'…)
const BX=428,BW=812,buildKeys=()=>APP.filter(a=>!a[2].startsWith('l.')),lookKeys=()=>APP.filter(a=>a[2].startsWith('l.'));
const selRect=i=>{const n=buildKeys().length,w=(BW-(n-1)*8)/n;return{x:BX+i*(w+8),y:146,w,h:44}};
const slotRow=s=>({x:BX,y:218+s*51,w:BW,h:46});
const passRow={x:BX,y:525,w:BW,h:40},budBox={x:BX,y:576,w:582,h:54};
// les listes d'apparence peuvent s'allonger : la hauteur des lignes s'adapte (et chaque valeur ouvre une grille de choix)
const lookRow=i=>{const n=lookKeys().length,h=Math.max(19,Math.min(30,262/n)),y=394+i*h;return{y:y+h/2+5,h,l:{x:150,y:y+2,w:24,h:h-4},v:{x:177,y:y+2,w:194,h:h-4},r:{x:374,y:y+2,w:24,h:h-4}}};
let presetI=-1;const rndBuildBtn={x:BX,y:638,w:190,h:32},presetBtn={x:BX+198,y:638,w:200,h:32};
const nameBtn={x:40,y:150,w:300,h:30},rndBtn={x:348,y:150,w:52,h:30},animeBtn={x:44,y:662,w:352,h:32},fightBtn={x:1030,y:576,w:210,h:54};
const itN=it=>Array.isArray(it)?String(it[0]):String(it),swCol=it=>Array.isArray(it)&&typeof it[1]==='string'&&it[1][0]==='#'?it[1]:null;
const fmtCd=cd=>(Math.round((+cd||0)*100)/100)+' s',pts=n=>n+' point'+(n>1?'s':'');
const FNT=(z,w='normal')=>`${w} ${z}px "Trebuchet MS",system-ui,sans-serif`;
// texte sur une ligne : rétrécit jusqu'à min puis coupe avec « … »
function fitT(s,x,y,size,col,w,weight='normal',min=11,align='left'){s=String(s);let z=size;g.font=FNT(z,weight);while(z>min&&g.measureText(s).width>w){z-=.5;g.font=FNT(z,weight)}if(g.measureText(s).width>w){while(s.length>2&&g.measureText(s+'…').width>w)s=s.slice(0,-1);s=s.trimEnd()+'…'}g.textAlign=align;g.fillStyle=col;g.fillText(s,x,y);return g.measureText(s).width}
function wrapL(s,w,font){g.font=font;const out=[];let cur='';for(const wd of String(s||'').split(' ')){const t=cur?cur+' '+wd:wd;if(cur&&g.measureText(t).width>w){out.push(cur);cur=wd}else cur=t}if(cur)out.push(cur);return out}
const rr=(R,r,fill,stroke,lw=1)=>{g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,r);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=lw;g.stroke()}};
// ninja d'aperçu du créateur : gardé d'une image à l'autre (son modèle 3D n'est refait que si l'apparence change)
let MF=null;const menuFake=ch=>{if(!MF||MF.ch!==ch){const o=CH.p0;CH.p0=ch;MF=mkUnit('p0',0,0,ch.side);CH.p0=o}return MF};
function rebuildMine(){MY=sanitizeBuild(MY);try{localStorage.setItem('nrBuild4',JSON.stringify(Object.assign({},MY,{jn:MY.j.slice(1).map(id=>JL[id].n)})))}catch(e){}MYCH=mkNinja(MY);if(!isGuest())CH.p0=MYCH;
 if(net.role==='host'){net.ready=false;sendLobby()}else if(isGuest()&&coop()){net.ready=false;netSend({t:'build',b:MY});netSend({t:'ready',v:false})}}
// --- textes d'aide des options de build
function optDesc(k,v){
 if(k==='clan'){const c=v-1,T=TRAITS[c];return(c<0?'Subjutsu polyvalents, +2 points de budget. ':c===TAIJ?'Taijutsu pur : pas de nature, que des techniques du corps. ':'Jutsu de clan sans mudra. ')+(T?`Trait « ${T.nom||T.name} » : ${T.desc||''}`:'')}
 if(k==='nat'){const w=BEATS[v],l=BEATS.indexOf(v);return`${NATURES[v][0]} (${NATURES[v][1]}) : fort contre ${NATURES[w][0]}, faible contre ${NATURES[l][0]}. Ajoute ses jutsu (avec mudras) à ton choix.`}
 if(k==='voie'){const V=VOIES[v];return`PV ×${V[1]} · vitesse ${V[2]>=0?'+':''}${V[2]} · puissance ×${V[3]}`}
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
  case'u':g.moveTo(0,-12);g.lineTo(3,-3);g.lineTo(12,0);g.lineTo(3,3);g.lineTo(0,12);g.lineTo(-3,3);g.lineTo(-12,0);g.lineTo(-3,-3);g.closePath();g.fill();g.fillStyle=col;g.beginPath();g.arc(0,0,2.4,0,7);g.fill();break
  case'c':{const t=clanTag(+cat.slice(1));text(t,0,t.length>1?5:6,t.length>1?13:17,f)}break
  case'p':g.arc(0,0,7,0,7);g.stroke();g.beginPath();g.arc(0,0,2.5,0,7);g.fill();break
  default:g.moveTo(-7,7);g.lineTo(1,-1);g.stroke();g.beginPath();g.moveTo(-1,-5);g.lineTo(10,-10);g.lineTo(5,1);g.closePath();g.fill();g.beginPath();g.arc(-9,9,2.6,0,7);g.stroke()}
 g.restore()}
function rankBadge(x,y,r,w=46){rr({x,y,w,h:18},5,RANKC[r]);text(`${r} · ${RANKS[r]}`,x+w/2,y+13,12,'#14100a')}
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
let pickTab=0,pickScroll=0,menuLast=0,galSel=null;
function pickData(p){const BUD=budgetOf(MY),c0=kitCost(MY);
 if(p===0){const L=stylesOf(MY),col=MY.clan>=0?CLANS[MY.clan][1]:'#e8cfa8';return{kind:'j',title:`${lbl[SLOTS[0]]} · Style de combat`,sub:'Ton attaque de base, propre à ton clan : gratuite (ni points, ni chakra)',
  items:L.map(i=>{const ab=styleAb(i),w=STYLES[i][4];return{v:i,n:ab.n,col,ic:null,style:1,l2:`${fmtCd(ab.cd)} · ${['kunai','senbon','bugs','sand'].includes(w)?'distance':['shadow','chain'].includes(w)?'moyenne portée':'corps à corps'}`,d:ab.d,sel:MY.j[0]===i}})}}
 if(typeof p==='number'){const own=MY.clan>=0?'c'+MY.clan:'u',cur=JL[MY.j[p]];
  const A=avail(MY,p).slice().sort((a,b)=>(a.cat!==own)-(b.cat!==own)||a.cost-b.cost||a.n.localeCompare(b.n)),cats=[...new Set(A.map(j=>j.cat))];
  return{kind:'j',title:`${lbl[SLOTS[p]]} · ${SLOTN[p]}`,sub:`Le rang fixe le coût en points du kit et en chakra · kit actuel : ${c0} / ${BUD} points`,tabs:cats.length>1?['Tous'].concat(cats.map(catName)):null,tabC:['#ffb347'].concat(cats.map(catCol)),
   items:A.map(J=>{const ab=jutsu(J.id),sel=J.id===cur.id,o=sel?0:Math.max(0,MY.j.findIndex((id,k)=>k>0&&id===J.id)),nc=o?c0:c0-cur.cost+J.cost;
    return{v:J.id,n:J.n,col:catCol(J.cat),ic:J.cat,ult:ab.ult,rank:J.r,tab:catName(J.cat),l2:`${jcost(ab)} chakra · ${fmtCd(ab.cd)} · ${ab.mud?ab.mud+' mudras':'sans mudra'}`,d:J.d,sel,used:o,nc,BUD}})}}
 if(p==='pass')return{kind:'o',title:'Passif',sub:'Un bonus permanent et gratuit',items:PASSK.map((k,i)=>({v:i,n:PASS[k][0],col:'#7fd87f',ic:'p',d:PASS[k][1],sel:MY.pass===i}))};
 if(p==='preset')return{kind:'o',title:'Persos de l\'anime · modèles de kit',sub:'Remplace ton build et ton apparence par ceux d\'un ninja célèbre (ton nom et ton camp sont gardés)',
  items:PRESETS.map((P,i)=>({v:i,n:P.full,col:P.clan>=0?CLANS[P.clan][1]:NATURES[P.nat][2],ic:P.clan>=0?'c'+P.clan:'n'+P.nat,d:`${presetLine(P)} · ${P.j.join(', ')}`,sel:presetI===i}))};
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
// le bouton « Persos de l'anime » ouvre la galerie (openPresetGallery), « Modèles de kit » la liste des mêmes persos
function openAnime(){openPresetGallery()}
// ---------- Galerie « Persos de l'anime » : une carte par perso (aperçu 3D ou 2D, nom, clan et nature, jeu en une ligne), rangées par équipe ----------
// clic sur une carte = ce perso devient ton ninja (kit et apparence) ; en ligne, l'invité l'envoie à l'hôte comme tout changement (rebuildMine)
const presetLine=P=>`${P.clan>=0?'Clan '+CLANS[P.clan][0]:'Sans clan'}${P.clan===TAIJ?'':' · '+NATURES[P.nat][0]}`;
const GB={x:36,y:46,w:1208,h:628};let GALF=null,GALL=null;
// ninjas d'aperçu : faits une fois (leur modèle 3D est gardé tant que la galerie s'affiche)
const galFakes=()=>GALF||(GALF=PRESETS.map((P,i)=>{const ch=mkNinja(presetBuild(i,P.n,P.side)),o=CH.p0;CH.p0=ch;const u=mkUnit('p0',0,0,ch.side);CH.p0=o;return u}));
function galLayout(){if(GALL)return GALL;const cols=7,gx=GB.x+20,gw=GB.w-40-14,cw=(gw-(cols-1)*12)/cols,ch=216,L=[],Hd=[];let y=0;
 GALG.forEach((gn,g)=>{const ids=PRESETS.map((_,i)=>i).filter(i=>PRESETS[i].g===g);if(!ids.length)return;Hd.push({g,y,n:ids.length});y+=28;
  ids.forEach((id,k)=>L.push({id,x:gx+(k%cols)*(cw+12),y:y+Math.floor(k/cols)*(ch+12),w:cw,h:ch}));y+=Math.ceil(ids.length/cols)*(ch+12)+8});
 const gy=GB.y+104;return GALL={L,Hd,gx,gw,gy,gh:GB.y+GB.h-30-gy,total:y-8}}
const galMax=()=>{const G=galLayout();return Math.max(0,G.total-G.gh)};
function galTabs(){const G=galLayout();let x=GB.x+20;g.font=FNT(13,'bold');return G.Hd.map(h=>{const s=`${GALG[h.g]} (${h.n})`,w=g.measureText(s).width+28,R={x,y:GB.y+66,w,h:28,s,g:h.g,top:h.y};x+=w+8;return R})}
function openPresetGallery(){picker='gallery';pickScroll=0;galSel=null;const G=galLayout(),c=G.L.find(c=>c.id===presetI);if(c)pickScroll=Math.min(galMax(),Math.max(0,c.y-40))}
function galleryClick(){if(!inRect(mouse,GB)||inRect(mouse,closeRect(GB))){picker=null;return true}
 for(const [i,R] of galTabs().entries())if(inRect(mouse,R)){pickScroll=Math.min(galMax(),R.top);galSel={i,s:pickScroll};return true}
 const G=galLayout(),mx=galMax();if(mx>0&&inRect(mouse,{x:G.gx+G.gw,y:G.gy,w:20,h:G.gh})){pickScroll=clamp((mouse.y-G.gy)/G.gh,0,1)*mx;return true}
 if(inRect(mouse,{x:G.gx,y:G.gy,w:G.gw,h:G.gh}))for(const c of G.L)if(inRect(mouse,{x:c.x,y:G.gy+c.y-pickScroll,w:c.w,h:c.h})){picker=null;applyPreset(c.id);return true}
 return true}
function galCard(c,R,hov,t){const P=PRESETS[c.id],u=galFakes()[c.id],ch=u.ch,col=GALC[P.g],sel=presetI===c.id,kc=ch.look.weapon.col;
 rr(R,10,sel?'rgba(96,62,28,.98)':hov?'rgba(66,44,24,.98)':'rgba(30,20,12,.97)',sel?'#ffb347':hov?col:'#5a3a1e',sel?2.5:hov?2:1);
 // aperçu : halo à la couleur du chakra, ombre au sol, le ninja de face (il pivote quand on le survole)
 const px=R.x+R.w/2,fy=R.y+124;g.save();g.beginPath();g.roundRect(R.x+4,R.y+4,R.w-8,124,8);g.clip();
 {const gr=g.createLinearGradient(0,R.y,0,R.y+128);gr.addColorStop(0,rgba(col,.22));gr.addColorStop(1,rgba(col,.04));g.fillStyle=gr;g.fillRect(R.x,R.y,R.w,128)}
 {g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(px,fy-50,0,px,fy-50,70);gr.addColorStop(0,rgba(kc,hov?.28:.16));gr.addColorStop(1,rgba(kc,0));g.fillStyle=gr;g.fillRect(R.x,R.y,R.w,128);g.globalCompositeOperation='source-over'}
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(px,fy-4,30,8,0,0,7);g.fill();
 u.aim=hov?Math.PI/2+Math.sin(t*1.6)*1.3:Math.PI/2-.35;u.moving=false;u.swing=0;{const sc=1.42*(ch.look.scale>1?.9:1);drawPrevN(u,px,fy,sc,0);drawChar3(u,px,fy,sc);drawPrevN(u,px,fy,sc,1)}g.restore();
 g.fillStyle=col;g.fillRect(R.x+10,R.y+130,R.w-20,2);
 fitT(P.n,R.x+R.w/2,R.y+150,16,sel?'#ffe0a0':'#ffd38a',R.w-14,'bold',11,'center');
 fitT(P.full!==P.n?P.full:CAMPS[P.side],R.x+R.w/2,R.y+164,10.5,'#a88a68',R.w-14,'normal',9,'center');
 // clan et nature : icônes + texte
 {const ic=[];if(P.clan>=0)ic.push(['c'+P.clan,CLANS[P.clan][1]]);else ic.push(['u','#c8b89a']);if(P.clan!==TAIJ)ic.push(['n'+P.nat,NATURES[P.nat][2]]);
  const s=(P.clan>=0?CLANS[P.clan][0]:'Sans clan')+(P.clan!==TAIJ?' · '+NATURES[P.nat][0]:''),z=10.5;g.font=FNT(z,'bold');const tw=Math.min(R.w-20-ic.length*19,g.measureText(s).width),x0=R.x+R.w/2-(ic.length*19+tw)/2;
  ic.forEach(([k,c2],i)=>jIcon(x0+8+i*19,R.y+176,8,c2,k));fitT(s,x0+ic.length*19+2,R.y+180,z,'#e8cfa8',tw+1,'bold',8.5)}
 const Lw=wrapL(P.d,R.w-16,FNT(10));fitT(Lw[0]||'',R.x+R.w/2,R.y+196,10,'#cdb898',R.w-14,'normal',8.5,'center');if(Lw[1])fitT(Lw.slice(1).join(' '),R.x+R.w/2,R.y+209,10,'#cdb898',R.w-14,'normal',8.5,'center');
 if(sel){rr({x:R.x+R.w-58,y:R.y+8,w:50,h:17},5,'#ffb347');text('CHOISI',R.x+R.w-33,R.y+20.5,10,'#1a1008')}}
function drawGallery(){const G=galLayout(),mx=galMax(),t=performance.now()/1000;pickScroll=clamp(pickScroll,0,mx);
 g.fillStyle='rgba(0,0,0,.66)';g.fillRect(0,0,W,H);g.save();g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=24;rr(GB,14,'rgba(26,17,10,.98)','#8a5a2a',2);g.restore();
 g.fillStyle='#ff9a3a';g.fillRect(GB.x+14,GB.y+56,GB.w-28,1.5);
 fitT('⭐ Persos de l\'anime',GB.x+20,GB.y+32,21,'#ffb347',420,'bold',13);fitT('Clique un ninja : son apparence et son kit (style, 5 jutsu, voie, passif) deviennent les tiens, à retoucher ensuite. Ton camp est gardé.',GB.x+20,GB.y+50,12,'#d8b888',GB.w-120,'normal',10);
 {const R=closeRect(GB),h=inRect(mouse,R);rr(R,8,h?'#ff9a3a':'rgba(50,34,20,.95)','#8a5a2a');text('✕',R.x+16,R.y+22,16,h?'#1a1008':'#f3d9b0')}
 // onglets : un par équipe (clic = aller à l'équipe) ; celui de l'équipe en haut de la vue est allumé
 // (onglet cliqué : il reste allumé tant qu'on ne fait pas défiler ; tout en bas, les dernières équipes ne peuvent pas monter en haut : on allume la dernière)
 const T=galTabs();let cur=0;if(galSel&&Math.abs(galSel.s-pickScroll)<1)cur=galSel.i;else{galSel=null;T.forEach((R,i)=>{if(pickScroll>=R.top-30)cur=i});if(mx>0&&pickScroll>=mx-1)cur=T.length-1}
 T.forEach((R,i)=>{const on=i===cur,h=inRect(mouse,R),c=GALC[R.g];rr(R,14,on?c:h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)',c,1.5);text(R.s,R.x+R.w/2,R.y+19,13,on?(lum(c)>.45?'#1a1008':'#fff'):'#f3d9b0')});
 const inG=inRect(mouse,{x:G.gx,y:G.gy,w:G.gw,h:G.gh});g.save();g.beginPath();g.rect(G.gx-6,G.gy-4,G.gw+12,G.gh+8);g.clip();
 for(const h of G.Hd){const y=G.gy+h.y-pickScroll;if(y<G.gy-30||y>G.gy+G.gh)continue;const c=GALC[h.g];text(GALG[h.g].toUpperCase(),G.gx+2,y+17,13,c,'left','bold');g.font=FNT(13,'bold');const w=g.measureText(GALG[h.g].toUpperCase()).width;g.fillStyle=rgba(c,.5);g.fillRect(G.gx+w+12,y+11,G.gw-w-14,1.5)}
 for(const c of G.L){const R={x:c.x,y:G.gy+c.y-pickScroll,w:c.w,h:c.h};if(R.y+R.h<G.gy-4||R.y>G.gy+G.gh+4)continue;const hov=inG&&inRect(mouse,R);galCard(c,R,hov,t);
  if(hov){const P=PRESETS[c.id],ch=galFakes()[c.id].ch,b=ch.build,col=GALC[P.g];hoverTip('gal'+c.id,()=>({t:P.full,col,l:[[`${presetLine(P)} · voie ${VOIES[P.voie][0].toLowerCase()} · ${STYLES[b.j[0]][0]}`,P.clan>=0?CLANS[P.clan][1]:NATURES[P.nat][2]],[`${ch.hp} PV · vitesse ${ch.spd} · passif ${PASS[PASSK[b.pass]][0]} · ${kitCost(b)} / ${budgetOf(b)} points`,'#d8b888']].concat(b.j.slice(1).map((id,k)=>[`${lbl[SLOTS[k+1]]} · ${JL[id].n} (${JL[id].r})`,catCol(JL[id].cat)])),d:P.d,f:'Clic : jouer ce ninja'}))}}
 g.restore();
 if(mx>0){const tr={x:G.gx+G.gw+6,y:G.gy,w:6,h:G.gh},k=G.gh/(G.gh+mx);rr(tr,3,'rgba(255,255,255,.08)');rr({x:tr.x,y:tr.y+(G.gh-G.gh*k)*pickScroll/mx,w:6,h:G.gh*k},3,'#c08040');
  if(pickScroll<mx)text('▼ molette pour voir la suite',GB.x+GB.w/2,GB.y+GB.h-10,11,'#ffb347','center','bold')}
 text('Échap, ✕ ou clic hors du cadre pour fermer · ↑ ↓ défiler',GB.x+20,GB.y+GB.h-10,11,'#9a8060','left','normal')}
function applyPick(it){const p=picker;
 if(typeof p==='number'){if(p&&it.used)MY.j[it.used]=MY.j[p];MY.j[p]=it.v;picker=null}
 else if(p==='pass'){MY.pass=it.v;picker=null}else if(p==='preset'){picker=null;applyPreset(it.v);return}
 else{setB(p,it.v);if(!p.startsWith('l.'))picker=null}
 rebuildMine()}
try{cv.addEventListener('wheel',e=>{if(state==='menu'&&picker!==null){pickScroll+=e.deltaY*(e.deltaMode?40:1);e.preventDefault()}},{passive:false})}catch(e){}
function pickerClick(){if(picker==='gallery')return galleryClick();const D=pickData(picker);if(!D){picker=null;return true}const G=pickGrid(D),B=G.B;
 if(!inRect(mouse,B)||inRect(mouse,closeRect(B))){picker=null;return true}
 const T=tabRects(D,B);for(let i=0;i<T.length;i++)if(inRect(mouse,T[i])){pickTab=i;pickScroll=0;return true}
 const mx=pickMax(D,G);if(mx>0&&inRect(mouse,{x:G.gx+G.gw,y:G.gy,w:20,h:G.gh})){pickScroll=clamp((mouse.y-G.gy)/G.gh,0,1)*mx;return true}
 if(inRect(mouse,{x:G.gx,y:G.gy,w:G.gw,h:G.gh})){const L=pickList(D);for(let i=0;i<L.length;i++)if(inRect(mouse,cardRect(G,i))){applyPick(L[i]);return true}}
 return true}
function creatorClick(){
 if(picker!==null)return pickerClick();
 if(inRect(mouse,nameBtn)){const n=prompt('Nom de ton ninja (16 caractères max)',MY.name);if(n!==null){MY.name=n.trim()||MY.name;rebuildMine()}return true}
 if(inRect(mouse,rndBtn)){const r=srnd((Date.now()%2147483647)||7),b=randomBuild(r,MY.side,MY.name);MY.l=b.l;rebuildMine();return true}
 if(inRect(mouse,animeBtn)){openAnime();return true}
 if(inRect(mouse,presetBtn)){openPicker('preset');return true}
 if(inRect(mouse,rndBuildBtn)){MY=randomKit(srnd((Date.now()%2147483647)||7),MY);rebuildMine();return true}
 const cyc=(k,n,d)=>{setB(k,(getB(k)+n+d)%n);rebuildMine()};
 for(const [i,[,list,k]] of buildKeys().entries()){const R=selRect(i);if(!inRect(mouse,R))continue;if(appOff(k))return true;const n=list().length;
  if(mouse.x<R.x+24)cyc(k,n,-1);else if(mouse.x>R.x+R.w-24)cyc(k,n,1);else openPicker(k);return true}
 for(const [i,[,list,k]] of lookKeys().entries()){const R=lookRow(i),n=list().length;if(inRect(mouse,R.l)){cyc(k,n,-1);return true}if(inRect(mouse,R.r)){cyc(k,n,1);return true}if(inRect(mouse,R.v)){openPicker(k);return true}}
 for(let s=0;s<6;s++)if(inRect(mouse,slotRow(s))){openPicker(s);return true}
 if(inRect(mouse,passRow)){openPicker('pass');return true}
 if(!coop()&&inRect(mouse,fightBtn)){if(!overBudget())startMatch('p0');return true}
 return false}
// --- dessin d'une carte du panneau de choix
function drawCard(D,it,R,hov){const j=D.kind==='j',a=D.kind==='a';
 rr(R,8,it.sel?'rgba(110,70,30,.98)':hov?'rgba(74,48,24,.98)':'rgba(30,20,12,.97)',it.sel?'#ffb347':hov?'#c08040':'#5a3a1e',it.sel?2.5:1);
 if(!a){g.fillStyle=it.col;g.fillRect(R.x+1,R.y+8,3,R.h-16)}
 if(a){if(it.sw){rr({x:R.x+10,y:R.y+R.h/2-9,w:18,h:18},4,it.sw,'#14100a',2)}fitT(it.n,R.x+(it.sw?36:12),R.y+R.h/2+5,13.5,it.sel?'#ffd38a':'#fff',R.w-(it.sw?44:20),'bold',10);if(it.sel)text('✓',R.x+R.w-12,R.y+R.h/2+5,14,'#ffb347','right');return}
 const ix=it.ic!==undefined;if(ix)jIcon(R.x+27,R.y+R.h/2,16,it.col,it.ic,it.ult);const x=R.x+(ix?52:14),w=R.x+R.w-10-x;
 fitT(it.n,x,R.y+21,14,it.sel?'#ffe0a0':'#ffd38a',w-(it.sel?62:0),'bold',11);if(it.sel){rr({x:R.x+R.w-66,y:R.y+7,w:56,h:17},5,'#ffb347');text('ÉQUIPÉ',R.x+R.w-38,R.y+19.5,10,'#1a1008')}
 if(j){let bx=x;if(it.style)styleBadge(bx,R.y+27,44);else rankBadge(bx,R.y+27,it.rank,44);bx+=50;fitT(it.l2,bx,R.y+40,11,'#d8b888',R.x+R.w-bx-(it.nc!=null&&!it.sel?62:10),'normal',9);
  if(it.nc!=null&&!it.sel)text(`→ ${it.nc}/${it.BUD}`,R.x+R.w-10,R.y+40,11,it.nc>it.BUD?'#ff6a5a':'#8fd88f','right','bold');fitT(it.d,x,R.y+55,11,'#bfa888',w,'normal',10)}
 else{const L=wrapL(it.d,w,FNT(11));g.fillStyle='#bfa888';fitT(L[0]||'',x,R.y+38,11,'#cdb898',w,'normal',10);if(L[1])fitT(L.slice(1).join(' '),x,R.y+53,11,'#cdb898',w,'normal',10)}
 if(it.used){g.fillStyle='rgba(12,8,5,.6)';g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,8);g.fill();rr({x:R.x+R.w-216,y:R.y+R.h-23,w:208,h:19},9.5,'rgba(40,26,14,.97)','#8a5a2a');text(`Déjà en ${lbl[SLOTS[it.used]]} · clic : échanger`,R.x+R.w-112,R.y+R.h-9.5,11,'#ffb347')}}
function drawPicker(){if(picker==='gallery')return drawGallery();const D=pickData(picker);if(!D){picker=null;return}const G=pickGrid(D),B=G.B,L=pickList(D),mx=pickMax(D,G);pickScroll=clamp(pickScroll,0,mx);
 g.fillStyle='rgba(0,0,0,.62)';g.fillRect(0,0,W,H);g.save();g.shadowColor='rgba(0,0,0,.7)';g.shadowBlur=24;rr(B,14,'rgba(26,17,10,.98)','#8a5a2a',2);g.restore();
 g.fillStyle='#ff9a3a';g.fillRect(B.x+14,B.y+56,B.w-28,1.5);
 fitT(D.title,B.x+20,B.y+32,20,'#ffb347',B.w-300,'bold',13);if(D.sub)fitT(D.sub,B.x+20,B.y+50,12,'#d8b888',B.w-120,'normal',10);
 if(D.kind==='j'&&picker){const BUD=budgetOf(MY),c=kitCost(MY);text(`${c} / ${BUD} points`,B.x+B.w-58,B.y+33,15,c>BUD?'#ff6a5a':'#ffd38a','right')}
 {const R=closeRect(B),h=inRect(mouse,R);rr(R,8,h?'#ff9a3a':'rgba(50,34,20,.95)','#8a5a2a');text('✕',R.x+16,R.y+22,16,h?'#1a1008':'#f3d9b0')}
 tabRects(D,B).forEach((R,i)=>{const on=i===pickTab,h=inRect(mouse,R),c=(D.tabC||[])[i]||'#ffb347';rr(R,14,on?c:h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)',c,1.5);text(R.s,R.x+R.w/2,R.y+19,13,on?(lum(c)>.45?'#1a1008':'#fff'):'#f3d9b0')});
 const inG=inRect(mouse,{x:G.gx,y:G.gy,w:G.gw,h:G.gh});g.save();g.beginPath();g.rect(G.gx-4,G.gy-4,G.gw+8,G.gh+8);g.clip();
 L.forEach((it,i)=>{const R=cardRect(G,i);if(R.y+R.h<G.gy-4||R.y>G.gy+G.gh+4)return;const hov=inG&&inRect(mouse,R);drawCard(D,it,R,hov);
  if(hov&&D.kind!=='a')hoverTip('pk'+picker+':'+it.v,()=>({t:it.n,col:it.col,l:D.kind==='j'?[[it.style?'Style de combat · attaque de base gratuite':`${it.tab} · rang ${it.rank} (${pts(RANKS[it.rank])})${it.ult?' · ultime':''}`,it.col],[it.l2,'#d8b888']].concat(it.nc!=null&&!it.sel?[[`Kit après ce choix : ${it.nc} / ${it.BUD} points${it.nc>it.BUD?' : trop cher, il faudra baisser un autre jutsu':''}`,it.nc>it.BUD?'#ff8a7a':'#8fd88f']]:[]):[],
   d:it.d,f:it.used?`Déjà équipé en ${lbl[SLOTS[it.used]]} : un clic échange les deux emplacements`:it.sel?'Équipé':'Clic : équiper'}))});
 g.restore();
 if(mx>0){const tr={x:G.gx+G.gw+6,y:G.gy,w:6,h:G.gh},k=G.gh/(G.gh+mx);rr(tr,3,'rgba(255,255,255,.08)');rr({x:tr.x,y:tr.y+(G.gh-G.gh*k)*pickScroll/mx,w:6,h:G.gh*k},3,'#c08040');
  if(pickScroll<mx)text('▼ molette pour voir la suite',B.x+B.w/2,B.y+B.h-12,11,'#ffb347','center','bold')}
 text('Échap, ✕ ou clic hors du cadre pour fermer'+(D.tabs?' · ← → onglets':''),B.x+20,B.y+B.h-12,11,'#9a8060','left','normal')}
function drawMenu(){TIP=null;{const now=performance.now();if(now-menuLast>1500)picker=null;menuLast=now} // retour au menu après un match : panneau fermé
 // clavier du panneau de choix : Échap ferme, flèches haut/bas défilent, gauche/droite changent d'onglet
 if(picker!==null){if(pressed.Escape)picker=null;else if(picker==='gallery'){const st=218;if(pressed.ArrowDown||pressed.PageDown)pickScroll+=pressed.PageDown?galLayout().gh:st;if(pressed.ArrowUp||pressed.PageUp)pickScroll-=pressed.PageUp?galLayout().gh:st}else{const D=pickData(picker);if(D){const G=pickGrid(D);if(pressed.ArrowDown||pressed.PageDown)pickScroll+=pressed.PageDown?G.gh:G.step;if(pressed.ArrowUp||pressed.PageUp)pickScroll-=pressed.PageUp?G.gh:G.step;
  if(D.tabs&&(pressed.ArrowLeft||pressed.ArrowRight)){pickTab=(pickTab+(pressed.ArrowRight?1:-1)+D.tabs.length)%D.tabs.length;pickScroll=0}}}}
 const free=picker===null,hv=R=>free&&inRect(mouse,R);
 g.save();g.shadowColor='#ff9a3a';g.shadowBlur=18;text('NARUTO · ARÈNE NINJA',W/2,52,42,'#ffb347');g.restore();
 {const b=coopBtn,h=inRect(mouse,b),on=coop()||net.role==='host';g.fillStyle=on?'#7f7':h?'rgba(90,60,30,.95)':'rgba(40,28,18,.9)';g.strokeStyle=on?'#7f7':'#8a5a2a';g.lineWidth=1.5;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,15);g.fill();g.stroke();text(!on?'EN LIGNE':net.role==='host'?`SALON ${net.code||''} · ${lobbyList().length}/${MAXP}`:`EN LIGNE · ${lobbyList().length} joueurs`,b.x+b.w/2,b.y+20,13,on?'#10131c':'#f3d9b0')}
 if(net.role){const m=!coop()?net.status:lobbyList().map(x=>`${who(x)} : ${x.c&&CH[x.c]?CH[x.c].name:'…'}${mode==='arena'?'':x.team?' [B]':' [A]'}${x.ready?' ✓':''}`).join('  ·  ');g.font='normal 12px "Trebuchet MS",system-ui,sans-serif';tfit(m,1222-Math.min(1060,g.measureText(m).width),131,12,'#9f9',1060)}
 for(const b of modeBtns){const on=mode===b.m,h=inRect(mouse,b);g.fillStyle=on?'#ff9a3a':h?'rgba(90,60,30,.95)':'rgba(40,28,18,.9)';g.strokeStyle=on?'#ff9a3a':'#8a5a2a';g.lineWidth=1.5;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,15);g.fill();g.stroke();text(modeLabel(b),b.x+b.w/2,b.y+20,13,on?'#1a1008':'#f3d9b0')}
 text(menuDesc(),W/2,net.role?116:130,13,'#e8cfa8','center','normal');
 const t=performance.now()/1000,ch=MYCH; // en ligne, côté invité, le créateur montre MYCH (son ninja), jamais CH.p0 (celui de l'hôte)
 // ===== colonne de gauche : ton ninja + son apparence
 rr({x:30,y:142,w:380,h:560},12,'rgba(20,14,10,.85)','#5a3a1e');
 {const h=hv(nameBtn);rr(nameBtn,8,h?'rgba(90,60,30,.6)':'rgba(0,0,0,.25)');tfit(MY.name+'  ✎',nameBtn.x+10,nameBtn.y+22,20,ch.side?'#ff9a9a':'#ffd38a',280,'bold')}
 btn(rndBtn,'🎲',false);if(hv(rndBtn))hoverTip('rndL',()=>({t:'Apparence aléatoire',d:'Tire au hasard village, tenue, coiffure, couleurs et accessoire. Ton build de combat ne change pas.'}));
 const fake=menuFake(ch);fake.aim=Math.PI/2+Math.sin(t*.8)*1.1;fake.moving=Math.sin(t*.5)>.3;fake.walk=t*13;fake.swing=0;
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(220,316,50,13,0,0,7);g.fill();
 {g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(220,290,0,220,290,140);gr.addColorStop(0,rgba(ch.look.weapon.col,.16));gr.addColorStop(1,rgba(ch.look.weapon.col,0));g.fillStyle=gr;g.fillRect(80,186,280,150);g.restore()}
 drawPrevN(fake,220,314,1.6,0);drawChar3(fake,220,314,1.6);drawPrevN(fake,220,314,1.6,1);
 text(`${ch.hp} PV · vitesse ${ch.spd} · puissance ×${ch.pw.toFixed(2)}`,220,342,12.5,'#ffd38a','center','bold');
 fitT(ch.desc,220,358,11,'#b89a70',350,'normal',9,'center');
 // en-tête de section
 const sect=(s,x,y,w)=>{text(s,x+w/2,y+4,11,'#ffb347','center');g.font=FNT(11,'bold');const tw=g.measureText(s).width/2+10;g.fillStyle='rgba(255,154,58,.45)';g.fillRect(x,y,w/2-tw,1.5);g.fillRect(x+w/2+tw,y,w/2-tw,1.5)};
 sect('APPARENCE',44,380,352);
 lookKeys().forEach(([lab,list,k],i)=>{const R=lookRow(i),L=list(),v=getB(k),it=L[v],z=Math.min(13,R.h*.5);fitT(lab,48,R.y,z,'#d8b888',96,'bold',9);arrowBtn(R.l,1);arrowBtn(R.r,0);
  const h=hv(R.v),sw=swCol(it);rr(R.v,6,h?'rgba(90,60,30,.85)':'rgba(0,0,0,.28)',h?'#c08040':null);if(sw)rr({x:R.v.x+7,y:R.y-z+1,w:z,h:z},3,sw,'#14100a',1.5);
  fitT(itN(it),R.v.x+(sw?12+z:8),R.y,z,'#fff',R.v.w-(sw?52:44),'bold',9);text(`${v+1}/${L.length}`,R.v.x+R.v.w-6,R.y,Math.min(10,z-1),'#8a7458','right','normal');
  if(h)hoverTip('lk'+k,()=>({t:lab+' : '+itN(it),d:`${L.length} choix. Clic : ouvrir la grille · ◀ ▶ : précédent / suivant.`}))});
 {const R=animeBtn,h=hv(R);g.save();if(h){g.shadowColor='#ffb347';g.shadowBlur=12}rr(R,R.h/2,h?'#ffb347':'rgba(70,44,18,.95)','#ffb347',2);g.restore();text('⭐ Persos de l\'anime',R.x+R.w/2,R.y+21,14,h?'#1a1008':'#ffd38a');
  if(h)hoverTip('anime',()=>({t:'Persos de l\'anime',d:`${PRESETS.length} ninjas célèbres (${GALG.join(', ')}) : son apparence et son kit remplacent les tiens (ton camp est gardé). Tu peux ensuite tout retoucher.`}))}
 // ===== colonne de droite : build de combat
 // camp, voie, clan, nature : ◀ ▶ pour défiler, clic au centre pour la grille
 buildKeys().forEach(([lab,list,k],i)=>{const R=selRect(i),L=list(),v=getB(k),it=L[v],off=appOff(k),h=hv(R)&&!off,sw=swCol(it);
  rr(R,10,h?'rgba(70,46,24,.95)':'rgba(20,14,10,.85)',off?'#3a2a1a':k==='clan'&&MY.clan>=0?CLANS[MY.clan][1]:'#5a3a1e',k==='clan'&&MY.clan>=0?1.5:1);
  text(lab.toUpperCase(),R.x+R.w/2,R.y+15,10,'#b89a70','center');
  if(off){text('aucune (taijutsu pur)',R.x+R.w/2,R.y+34,12,'#7a6a58','center','normal');if(inRect(mouse,R)&&free)hoverTip('off'+k,()=>({t:'Pas de nature',d:'Les Taijutsuka n\'utilisent que leur corps : pas de nature, pas de mudras.'}));return}
  const ax=h&&mouse.x<R.x+24,bx=h&&mouse.x>R.x+R.w-24;text('◀',R.x+13,R.y+30,13,ax?'#fff':'#ffb347');text('▶',R.x+R.w-13,R.y+30,13,bx?'#fff':'#ffb347');
  const nm=itN(it);g.font=FNT(14,'bold');const tw=Math.min(R.w-60-(sw?18:0),g.measureText(nm).width),x0=R.x+R.w/2-(tw+(sw?18:0))/2;if(sw)rr({x:x0,y:R.y+22,w:12,h:12},3,sw,'#14100a',1.5);
  fitT(nm,x0+(sw?18:0),R.y+33,14,k==='clan'||k==='nat'?'#ffd38a':'#fff',R.w-60-(sw?18:0),'bold',10);
  if(h)hoverTip('bk'+k,()=>({t:`${lab} : ${nm}`,col:sw||'#ffd38a',d:optDesc(k,v)||' ',f:'Clic : voir tous les choix · ◀ ▶ : défiler'}))});
 // trait du clan et affinités de la nature
 {const T=TRAITS[MY.clan],tl=T?`${MY.clan<0?'Sans clan (+2 points)':'Trait'} · ${T.nom||T.name||''} : ${T.desc||''}`:'',col=MY.clan>=0?CLANS[MY.clan][1]:'#e8cfa8',aff=MY.clan!==TAIJ?`${NATURES[MY.nat][0]} : fort contre ${NATURES[BEATS[MY.nat]][0]}, faible contre ${NATURES[BEATS.indexOf(MY.nat)][0]}`:'Taijutsu pur : aucune nature';
  g.font=FNT(11.5);const aw=Math.min(300,g.measureText(aff).width);fitT(aff,BX+BW-4,207,11.5,MY.clan!==TAIJ?NATURES[MY.nat][2]:'#b89a70',300,'normal',9,'right');
  if(tl){fitT(tl,BX+4,207,11.5,liftC(col,.5),BW-aw-30,'normal',10.5);if(free&&inRect(mouse,{x:BX,y:194,w:BW-aw-20,h:18}))hoverTip('trait',()=>({t:T.nom||T.name||'Trait',col,d:T.desc||''}))}}
 // les 6 emplacements : touche, icône, nom, rang, chakra, recharge, mudras
 for(let s=0;s<6;s++){const R=slotRow(s),ab=ch.abil[s],h=hv(R),J=s?JL[MY.j[s]]:null,col=J?catCol(J.cat):MY.clan>=0?CLANS[MY.clan][1]:'#e8cfa8',gold=ab.ult;
  rr(R,10,h?'rgba(74,48,24,.95)':'rgba(20,14,10,.85)',gold?'#ffb347':h?'#c08040':'#5a3a1e',gold?2:1);
  rr({x:R.x+7,y:R.y+5,w:66,h:36},8,'rgba(50,32,16,.95)',gold?'#ffe81f':'#8a5a2a',1.5);text(lbl[SLOTS[s]],R.x+40,R.y+22,14,gold?'#ffe81f':'#fff');text(SLOTN[s],R.x+40,R.y+35,9,'#c8a878','center','normal');
  jIcon(R.x+98,R.y+23,16,col,J?J.cat:null,gold);
  const nw=fitT(ab.n,R.x+124,R.y+20,15,gold?'#ffe81f':'#ffd38a',300,'bold',11);if(J)rankBadge(R.x+132+nw,R.y+7,J.r);else styleBadge(R.x+132+nw,R.y+7);
  if(J)fitT(catName(J.cat),R.x+186+nw,R.y+20,10.5,catCol(J.cat),Math.max(10,560-186-nw),'normal',9);
  fitT(ab.d||'',R.x+124,R.y+38,11.5,'#d8c0a0',448,'normal',10);
  // colonnes de chiffres
  const st=[[s?String(jcost(ab)):'—','chakra','#7fc8ff'],[fmtCd(ab.cd),'recharge','#ffd38a'],[s?ab.mud?String(ab.mud):'aucun':'—','mudras','#d8b888']];
  st.forEach(([v,l,c],k)=>{const x=R.x+612+k*62;text(v,x,R.y+21,14,c,'center');text(l,x,R.y+36,9.5,'#9a8060','center','normal')});
  text('›',R.x+R.w-14,R.y+29,22,h?'#fff':'#8a5a2a','center');
  if(h)hoverTip('sl'+s,()=>({t:ab.n,col,l:[[J?`${lbl[SLOTS[s]]} · ${SLOTN[s]} · ${catName(J.cat)} · rang ${J.r} (${pts(J.cost)})${ab.ult?' · ultime':''}`:`${lbl[SLOTS[s]]} · style de combat (gratuit)`,col],[s?`${jcost(ab)} chakra · ${fmtCd(ab.cd)} · ${ab.mud?ab.mud+' mudras':'sans mudra'}`:`attaque de base · ${fmtCd(ab.cd)}`,'#d8b888']],d:ab.d||'',f:`Clic : choisir (${s?avail(MY,s).length:stylesOf(MY).length} possibles)`}))}
 {const R=passRow,ps=PASS[ch.pass]||PASS[PASSK[MY.pass]],h=hv(R);rr(R,10,h?'rgba(50,62,36,.95)':'rgba(20,14,10,.85)',h?'#7fd87f':'#3a6a3a');
  rr({x:R.x+7,y:R.y+5,w:66,h:30},8,'rgba(30,50,26,.95)','#5aa85a',1.5);text('PASSIF',R.x+40,R.y+25,12,'#9f9');jIcon(R.x+98,R.y+20,13,'#7fd87f','p');
  const nw=fitT(ps[0],R.x+124,R.y+25,14,'#cfe8c0',220,'bold',11);fitT(ps[1],R.x+136+nw,R.y+25,12,'#a8c898',R.w-160-nw,'normal',10);text('›',R.x+R.w-14,R.y+27,22,h?'#fff':'#3a6a3a','center');
  if(h)hoverTip('pass',()=>({t:'Passif : '+ps[0],col:'#7fd87f',d:ps[1],f:`Clic : choisir parmi ${PASSK.length} passifs`}))}
 // budget : une case par point, à la couleur du rang de chaque jutsu ; au-delà du budget, en rouge
 {const R=budBox,BUD=budgetOf(MY),c=kitCost(MY),over=c>BUD;rr(R,10,'rgba(20,14,10,.9)',over?'#ff5a4a':'#5a3a1e',over?2:1);
  text('POINTS DU KIT',R.x+12,R.y+18,11,'#b89a70','left');text(`${c} / ${BUD}`,R.x+R.w-12,R.y+21,18,over?'#ff6a5a':'#ffd38a','right');
  const n=Math.max(BUD,c),cw=Math.min(20,(R.w-112-78-4*5)/n);let x=R.x+112,k=0;
  for(let s=1;s<6;s++){const J=JL[MY.j[s]],hs=hv(slotRow(s));for(let q=0;q<J.cost;q++){const out=k>=BUD;g.fillStyle=RANKC[J.r];g.fillRect(x,R.y+8,cw-2,13);if(out){g.strokeStyle='#ff3a2a';g.lineWidth=2;g.strokeRect(x+1,R.y+9,cw-4,11)}if(hs){g.fillStyle='rgba(255,255,255,.45)';g.fillRect(x,R.y+8,cw-2,13)}x+=cw;k++}x+=5}
  for(;k<BUD;k++){g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x,R.y+8,cw-2,13);x+=cw}
  const mxJ=JL[MY.j.slice(1).reduce((a,id)=>JL[id].cost>JL[a].cost?id:a,MY.j[1])];
  fitT(over?`${pts(c-BUD)} de trop : remplace un jutsu par un de rang plus bas (le plus cher : ${mxJ.n}, rang ${mxJ.r})`:c<BUD?`${pts(BUD-c)} libre${BUD-c>1?'s':''} · rang D = 1 point, C = 2, B = 3, A = 4, S = 5${MY.clan<0?' · sans clan : +2 points':''}`:`Budget pile atteint · rang D = 1 point, C = 2, B = 3, A = 4, S = 5${MY.clan<0?' · sans clan : +2':''}`,R.x+12,R.y+44,11.5,over?'#ff8a7a':'#c8a878',R.w-24,over?'bold':'normal',9)}
 btn(rndBuildBtn,'🎲 Kit aléatoire',false);btn(presetBtn,'📜 Modèles de kit',false);
 if(hv(rndBuildBtn))hoverTip('rndK',()=>({t:'Kit aléatoire',d:'Tire au hasard clan, nature, voie, passif et jutsu. Ton apparence ne change pas.'}));
 if(hv(presetBtn))hoverTip('pre',()=>({t:'Modèles de kit',d:'Les mêmes persos de l\'anime en liste, avec leurs 5 jutsu : un bon point de départ à retoucher.'}));
 ['D','C','B','A','S'].forEach((r,i)=>{const x=BX+408+i*35;rr({x,y:643,w:31,h:22},6,RANKC[r]);text(`${r}·${RANKS[r]}`,x+15.5,659,11,'#14100a')});if(free&&inRect(mouse,{x:BX+408,y:640,w:175,h:28}))hoverTip('rk',()=>({t:'Rangs des jutsu',d:'Chaque rang coûte des points du kit (D = 1 … S = 5) et du chakra à chaque lancer (D = ${CKCOST.D}, C = ${CKCOST.C}, B = ${CKCOST.B}, A = ${CKCOST.A}, S = ${CKCOST.S} ; +14 pour un ultime). Les jutsu de nature demandent aussi des mudras (D = 2 … S = 6).'}));
 if(!coop()){const R=fightBtn,ob=overBudget(),h=hv(R)&&!ob;g.save();if(!ob){g.shadowColor='#ff9a3a';g.shadowBlur=h?22:10}rr(R,R.h/2,ob?'rgba(120,50,40,.9)':h?'#ffb347':'#ff9a3a',ob?'#a55':'#ffd38a',2);g.restore();
  text(ob?'TROP DE POINTS':'COMBATTRE ▶',R.x+R.w/2,R.y+R.h/2+(ob?0:6),ob?15:18,ob?'#ffd0c8':'#1a1008');if(ob)text('baisse un rang pour jouer',R.x+R.w/2,R.y+R.h/2+16,10.5,'#ffb0a0','center','normal')}
 if(isGuest()&&mode!=='arena'){const b=teamBtn,h=hv(b);rr(b,b.h/2,h?'#5a3a1e':'#2a1c10',net.myTeam?'#ff6060':'#4db8ff',2);text(`ÉQUIPE ${net.myTeam?'B':'A'} (changer)`,b.x+b.w/2,b.y+b.h/2+5,13,'#f3d9b0','center')}
 if(coop()){const b=readyBtn,ob=overBudget(),on=net.ready&&!ob;rr(b,b.h/2,ob?'rgba(120,50,40,.9)':on?'#7f7':hv(b)?'#ffb347':'rgba(255,154,58,.88)',ob?'#a55':null,2);text(ob?'TROP DE POINTS':on?'PRÊT ✓':'PRÊT ?',b.x+b.w/2,b.y+b.h/2+6,ob?15:17,ob?'#ffd0c8':'#10131c','center')}
 // sort commun à tous les ninjas : soin (H)
 fitT(`${lbl.KeyH} · Soin (tous les ninjas) : l'allié visé (ou toi) récupère 25 % de ses PV + 8 % en 2 s · incantation 0,3 s · ${HLS.cd} s de recharge · sans chakra`,BX+4,690,11.5,'#9fdfaa',640,'normal',9);
 if(picker!==null)drawPicker();
 else text(`${lbl.KeyW}${lbl.KeyA}${lbl.KeyS}${lbl.KeyD} bouger · souris viser · ${lbl.KeyF} maintenu = parade · ${lbl.KeyR} maintenu = chakra · ${lbl.KeyH} soin · Maj = sprint · Tab scores · ${lbl.KeyM} son · O options`,W/2,714,12,'#e8cfa8','center','normal');
 drawTip();drawCursor();
}

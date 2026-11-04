// ===================== CRÉATION D'UN PERSO : assistant plein écran en 8 étapes =====================
// Identité → Origine → Nature → Style → Jutsu → Barres → Apparence → Résumé. Barre des étapes en haut (une étape déjà vue se rouvre d'un clic), aperçu 3D à droite,
// en bas « ◀ Retour », « Aléatoire » (tire au hasard l'étape affichée SEULE, résultat toujours valide) et « Suivant ▶ » (« ✔ Enregistrer » au Résumé).
// Clavier : Entrée = suivant (enregistrer au Résumé), Échap = étape précédente (à la 1re : quitter, confirmé si des changements ne sont pas enregistrés).
// Changer d'origine (clan, sans clan à sub, sans clan à kekkei genkai) remet à zéro ce qui en dépend, après confirmation (une fois l'étape Origine passée).
// Modifier un perso ouvre le même assistant, rempli, toutes les étapes ouvertes (rosEdit → wzOpen(true), nr_roster.js).
// Données lues (rien à coder ici pour en ajouter) : CLANS / TRAITS / DASHC (clans), KGS / KGTRAITS / DASHG (kekkei genkai, defKG dans nr_kits.js), FAMS (étiquettes des sub),
// NATURES, STNAME / STYLES (styles), TREE / TREES (arbres de jutsu). Outils partagés (nr_menu.js) : barres crBar*, crLearn / crToggle / crPlace, panneaux de choix (picker).
const WZS=[['Identité','Ton nom et ton camp, ou un perso de l\'anime comme point de départ'],['Origine','Un clan, ou sans clan : 5 sub au choix (1 par rang) ou un kekkei genkai'],
 ['Nature','Ton affinité de chakra : l\'arbre de nature (jutsu à mudras)'],['Style','Ton arbre de style et ton attaque de base (Clic G)'],['Jutsu','Les jutsu que tu apprends, rang par rang (D → S)'],
 ['Barres','Tes barres de 6 jutsu (touches 1 à 6, roue de B en combat) et ton dash'],['Apparence','Tête, corps, tenue, équipement : l\'aperçu à droite suit'],['Résumé','Tout vérifier, puis enregistrer']];
const WZN=WZS.length;
// WZ : s étape affichée, max dernière étape ouverte, sc défilement (liste des sub, styles), tab onglet de l'étape Jutsu, q / rk / fm filtres des sub (texte, rang, famille), rev étapes à revoir
let WZ={s:0,max:0,sc:0,tab:null,q:'',rk:'',fm:-1,rev:new Set(),keep:null}; // keep : nature / style d'avant un clan martial
const WZC={x:30,y:112,w:850,h:532},WZP={x:894,y:112,w:356,h:532},WCT=176,WX=42,WW=826,WBOT=WZC.y+WZC.h-8;
const wzStepR=i=>{const w=(1220-7*8)/8;return{x:30+i*(w+8),y:52,w,h:40}};
const wzBack={x:30,y:658,w:190,h:44},wzRnd={x:232,y:658,w:200,h:44},wzNextB=saveBtn;
function wzOpen(edit){CRHOLE=[];WZ={s:0,max:edit?WZN-1:0,sc:0,tab:null,q:'',rk:'',fm:-1,rev:new Set(),keep:null};LTAB=0;if(WZI){WZI.value='';WZI.k=null}}
// ---------- étapes : validité, navigation ----------
// étape bloquante : nom vide, sub manquant (exactement 1 par rang pour un sans-clan à sub)
// perso de l'anime au kit canon incomplet (Deidara, Hidan, Orochimaru, Zabuza) qui garde exactement ses sub d'origine : la règle « 1 sub par rang » ne bloque pas sa retouche
const wzSubIds=b=>(b.k||[]).filter(id=>JL[id]&&catType(JL[id].cat)==='famille').sort((x,y)=>x-y).join(',');
function wzCanonSubs(){const E=ED&&ED.k?rosGet(ED.k):null;if(!E||!E.P||EB.clan>=0||kgOk(EB.kg))return false;const O=presetOf(E.i);return O.clan<0&&!kgOk(O.kg)&&wzSubIds(EB)===wzSubIds(O)}
function wzErr(i){if(i===0&&!String(EB.name||'').trim())return'Donne un nom à ton ninja';
 if(i===4){const m=subMissing(EB);if(m.length&&!wzCanonSubs())return`Il te manque ${m.length>1?'les sub de rang':'le sub de rang'} ${m.join(', ')} : il faut exactement 1 sub par rang (onglet « Sub »)`}return''}
function wzGo(i){i=clamp(i|0,0,WZN-1);if(i===WZ.s)return;WZ.s=i;WZ.sc=0;picker=null;WZ.rev.delete(i);if(i>WZ.max)WZ.max=i;if(i===4)WZ.tab=null;CRH=-1}
function wzNext(){const e=wzErr(WZ.s);if(e){crSay(e,'#ff7a6a');return}if(WZ.s===WZN-1){wzSave();return}wzGo(WZ.s+1)}
function wzPrev(){if(WZ.s>0)wzGo(WZ.s-1);else edCancel()}
function wzSave(){for(let i=0;i<WZN-1;i++){const e=wzErr(i);if(e){crSay(e+' · clique l\'étape « '+WZS[i][0]+' »','#ff7a6a');return}}
 const w=crSaveWarn(),sg=w+'|'+JSON.stringify(crBars())+'|'+EB.bars.map(q=>q.n).join('|')+'|'+(EB.k||[]).join(',');
 if(w&&!(EDW&&EDW.s===sg&&performance.now()-EDW.t<6000)){EDW={t:performance.now(),s:sg};crSay(w,'#ffb347');return}EDW=0;crDedupe();edSave()}
// ---------- origine : 'c<clan>', 's' (sans clan à sub) ou 'g<kg>' (sans clan à kekkei genkai) ----------
const wzOrig=b=>b.clan>=0?'c'+b.clan:kgOk(b.kg)?'g'+b.kg:'s';
const wzOrigN=o=>o[0]==='c'?'Clan '+CLANS[+o.slice(1)][0]:o[0]==='g'?'Kekkei genkai · '+KGS[+o.slice(1)].n:'Sans clan · sub';
const wzOrigCol=o=>o[0]==='c'?CLANS[+o.slice(1)][1]:o[0]==='g'?KGS[+o.slice(1)].col:'#7fd87f';
const wzOrigIc=o=>o[0]==='c'?o:o[0]==='g'?o:'u';
const wzOrigT=o=>o[0]==='c'?TRAITS[+o.slice(1)]:o[0]==='g'?KGTRAITS[+o.slice(1)]:TRAITS[-1];
const wzOrigins=()=>CLANS.map((_,i)=>'c'+i).concat(['s'],KGS.map((_,i)=>i).filter(kgOk).map(i=>'g'+i));
// ce que l'origine emporte : les jutsu de son arbre (clan, sub ou KG), l'attaque de base de clan, le dash ; nature et style restent, sauf clan martial (nature aucune, style imposé) :
// la nature et le style d'avant un clan martial sont gardés à part (WZ.keep) et reviennent quand on en sort. Les barres sont refaites : la barre de départ commence par
// les jutsu de la nouvelle origine (startBar), les autres couvrent le reste du kit. Le dash devient celui du clan ou du kekkei genkai.
function wzOrigFx(o){const c=o[0]==='c'?+o.slice(1):-1,m0=isMartial(EB.clan),m1=isMartial(c),K=WZ.keep;let nat=EB.nat,st=EB.st;
 if(m1){nat=-1;st=MARTIAL[c]}else if(m0){nat=K?K.nat:0;st=K?K.st:0}
 return{nat,st,m0,m1}}
function wzSubPick(){const r=srnd((Date.now()%2147483646)+1),used=new Set(),K=[];r(); // sub de départ d'un sans-clan à sub : 1 par rang, de familles toutes différentes, au hasard
 for(const R of RANKO){const L=JL.filter(J=>J.r===R&&catType(J.cat)==='famille'),F=L.filter(J=>!used.has(J.cat)),C=F.length?F:L,J=C[Math.floor(r()*C.length)];if(J){K.push(J.id);used.add(J.cat)}}return K}
function wzSetOrig(o,quiet){const cur=wzOrig(EB);if(o===cur)return;const fx=wzOrigFx(o);
 const go=()=>{const n0=EB.nat,s0=EB.st,w0=EB.w;if(!fx.m0&&fx.m1)WZ.keep={nat:EB.nat,st:EB.st,w:EB.w};
  if(o[0]==='c'){EB.clan=+o.slice(1);EB.kg=-1}else{EB.clan=-1;EB.kg=o[0]==='g'?+o.slice(1):-1}
  EB.nat=fx.nat<0&&!fx.m1?0:fx.nat;EB.st=fx.st;if(fx.m0&&!fx.m1&&WZ.keep)EB.w=WZ.keep.w;const cs=clanStyle(EB.clan);if(cs>=0)EB.w=cs;
  EB.k=EB.k.filter(id=>{const t=JL[id].cat[0];return t==='n'&&+JL[id].cat.slice(1)===EB.nat||t==='t'&&+JL[id].cat.slice(1)===EB.st});if(o==='s')EB.k=EB.k.concat(wzSubPick());
  EB.dsh=EB.clan>=0?'c':o[0]==='g'&&DASHG[EB.kg]?'g':'b';EB.bar=[];EB.bars=[];EB=sanitizeBuild(EB);EB.k=autoLearn(EB,EB.k);EB=sanitizeBuild(EB);
  EB.bars=startBars(EB);EB.bar=EB.bars[0].b.slice();EBI=0;EBSN=null;CRHOLE=[];edRebuild();
  if(EB.nat!==n0&&2<=WZ.max)WZ.rev.add(2);if((EB.st!==s0||EB.w!==w0)&&3<=WZ.max)WZ.rev.add(3);for(const i of[4,5])if(i<=WZ.max)WZ.rev.add(i);WZ.rev.delete(WZ.s);
  crSay(`${wzOrigN(o)} : ${o==='s'?'5 sub tirés au hasard (1 par rang, familles différentes)':'ses jutsu sont pré-choisis'}, en tête de ta barre de départ`+(WZ.max>=4?' · revois les étapes Jutsu et Barres':''),'#8fe38f')};
 if(WZ.max>1&&!quiet){const ch=[];if(fx.m1)ch.push(`clan martial : pas de nature, arbre de style ${STNAME[fx.st]} imposé`);else if(fx.m0)ch.push(`nature ${NATURES[fx.nat<0?0:fx.nat][0]} et style ${STNAME[fx.st]} d'avant le clan martial reviennent`);
  CONF={t:'Changer d\'origine ?',d:`Passer de « ${wzOrigN(cur)} » à « ${wzOrigN(o)} » remet à zéro les jutsu de ton origine, ton attaque de base de clan, ton dash et tes barres (ta barre de départ commencera par la nouvelle origine). `+(ch.length?ch[0][0].toUpperCase()+ch[0].slice(1)+'.':'Nature et style sont gardés.'),ok:'Changer d\'origine',no:'Garder',col:'#ffb347',fn:go}}
 else go()}
// ---------- Aléatoire : l'étape affichée seule ----------
function wzRandom(){const r=srnd((Date.now()%2147483646)+1),k=a=>Math.floor(r()*a.length),s=WZ.s;r();
 if(s===0){EB.side=r()<.5?0:1;const L=BOTN[EB.side];EB.name=L[k(L)];if(WZI)WZI.k=null;edRebuild();crSay(`Nom et camp tirés au hasard : ${EB.name}, ${CAMPS[EB.side]}`,'#8fe38f')}
 else if(s===1){const L=wzOrigins().filter(o=>o!==wzOrig(EB));wzSetOrig(L[k(L)])}
 else if(s===2){if(EB.nat<0){crSay('Clan martial : pas de nature à tirer','#c8b89a');return}const L=[0,1,2,3,4].filter(i=>i!==EB.nat);setB('nat',L[k(L)]);edRebuild();crSay(`Nature tirée au hasard : ${NATURES[EB.nat][0]}`,'#8fe38f')}
 else if(s===3){if(!isMartial(EB.clan)){const L=[0,1,2].filter(i=>i!==EB.st);setB('st',L[k(L)])}const SW=stylesOf(EB);EB.w=SW[k(SW)];edRebuild();crSay(`Style tiré au hasard : `+(fold(STNAME[EB.st])===fold(STYLES[EB.w][0])?`arbre et attaque de base ${STNAME[EB.st]}`:`arbre ${STNAME[EB.st]} · attaque de base ${STYLES[EB.w][0]}`),'#8fe38f')}
 else if(s===4){const K=[];for(const t of treesOf(EB)){const T=TREES[t];if(T.force||T.pool)continue;for(const R of RANKO){const L=TREE[t][R].slice();for(let n=0;n<tTake(T,R)&&L.length;n++)K.push(L.splice(k(L),1)[0])}}
  if(EB.clan<0&&!kgOk(EB.kg))for(const R of RANKO){const L=JL.filter(J=>J.r===R&&catType(J.cat)==='famille');K.push(L[k(L)].id)}
  EB.k=K;edTrees();edRebuild();crSay('Jutsu tirés au hasard : 1 par rang dans chaque arbre'+(EB.clan<0&&!kgOk(EB.kg)?' (et 1 sub par rang)':''),'#8fe38f')}
 else if(s===5){const D=dashOpts(EB);EB.dsh=D[k(D)];const L=EB.k.slice();for(let i=L.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[L[i],L[j]]=[L[j],L[i]]}
  const b0=L.slice(0,BARN);while(b0.length<BARN)b0.push(-1);EB.bar=b0;EB.bars=barsCover(EB,[{n:barTheme(EB,b0,[]),b:b0.slice()}]);EBI=0;EBSN=null;edRebuild();crSay(`Barres tirées au hasard (${EB.bars.length}, tous tes jutsu y sont) · dash : ${dashOf(EB).n}`,'#8fe38f')}
 else if(s===6){const b=randomBuild(r,EB.side,EB.name);EB.l=randomCosm(b.l,EB.name+Date.now(),EB.side);edRebuild();crSay('Apparence tirée au hasard (ton kit ne change pas)','#8fe38f')}}
// ---------- champ de texte posé sur le canevas (nom à l'étape Identité, recherche des sub à l'étape Jutsu) ----------
const WZI=(()=>{try{const st=document.createElement('style');st.textContent='#wzI{position:fixed;z-index:3;box-sizing:border-box;border:1.5px solid #8a5a2a;background:#140d07;color:#ffd38a;padding:0 .7em;font-family:"Trebuchet MS",system-ui,sans-serif;font-weight:bold;outline:none}#wzI:focus{border-color:#ffb347;box-shadow:0 0 10px #ff9a3a88}#wzI::placeholder{color:#8a7458;font-weight:normal}';document.head.appendChild(st);
 const e=document.createElement('input');e.id='wzI';e.type='text';e.autocomplete='off';e.spellcheck=false;e.hidden=true;e.k=null;
 e.addEventListener('input',()=>{if(!EB)return;if(e.k==='name'){const v=e.value.replace(/[<>]/g,'');if(v!==e.value){const c=Math.max(0,(e.selectionStart||0)-(e.value.length-v.length));e.value=v;try{e.setSelectionRange(c,c)}catch(er){}}EB.name=v.slice(0,16)}else if(e.k==='q'){WZ.q=e.value;WZ.sc=0}}); // < et > ne s'écrivent pas (le champ montre le nom tel qu'il sera gardé)
 // Entrée = Suivant (nom comme recherche) ; Échap : la recherche non vide s'efface, sinon Retour (à la 1re étape : quitter, confirmé si besoin)
 e.addEventListener('keydown',ev=>{if(ev.key==='Enter'){e.blur();wzNext();ev.preventDefault()}else if(ev.key==='Escape'){if(e.k==='q'&&e.value){e.value='';WZ.q='';WZ.sc=0}else{e.blur();wzPrev()}ev.preventDefault()}});
 e.addEventListener('blur',()=>{if(e.k==='name'&&EB){EB.name=String(EB.name||'').trim().slice(0,16)||'Ninja';e.value=EB.name;edRebuild()}});
 document.body.appendChild(e);return e}catch(err){return null}})();
const wzIR=k=>k==='name'?{x:WX+130,y:WCT+30,w:420,h:44}:{x:WX+330,y:WCT+96,w:250,h:28};
let WZIB='';
// le bouton HTML « Partie & options » passe au-dessus du canevas : il s'efface derrière l'assombrissement d'une fenêtre de confirmation
let OPTB0;function optBSync(){if(OPTB0===undefined)OPTB0=document.getElementById('optB');if(!OPTB0)return;const d=state==='menu'&&!!CONF?'1':'';if(OPTB0.dataset.dim!==d){OPTB0.dataset.dim=d;OPTB0.style.opacity=d?'.22':'';OPTB0.style.pointerEvents=d?'none':''}}
function wizISync(){try{optBSync()}catch(e){}if(!WZI)return;let bl=false;try{bl=BLC.open}catch(e){}
 const k=state==='menu'&&scr==='edit'&&ED&&EB&&picker===null&&!CONF&&!bl&&!quitOn?(WZ.s===0?'name':WZ.s===4&&wzTab()==='sub'?'q':null):null;
 if(!k){if(!WZI.hidden){if(document.activeElement===WZI)WZI.blur();WZI.hidden=true;WZI.k=null}return}
 if(WZI.k!==k){WZI.k=k;WZI.hidden=false;WZI.value=k==='name'?EB.name:WZ.q;WZI.maxLength=k==='name'?16:40;WZI.placeholder=k==='name'?'Nom de ton ninja':'Chercher un sub (nom, effet, famille)…';WZI.setAttribute('aria-label',WZI.placeholder);WZIB=''}
 const R=wzIR(k),r=cv.getBoundingClientRect(),q=r.width/W,s=[r.left+R.x*q,r.top+R.y*q,R.w*q,R.h*q,k].join();if(s===WZIB)return;WZIB=s;
 Object.assign(WZI.style,{left:r.left+R.x*q+'px',top:r.top+R.y*q+'px',width:R.w*q+'px',height:R.h*q+'px',fontSize:(k==='name'?19:13)*q+'px',borderRadius:(k==='name'?10:14)*q+'px'})}
// ---------- dessin : petits éléments ----------
const wzFree=()=>picker===null&&!CONF,wzHv=R=>wzFree()&&inRect(mouse,R);
function wzSect(s,x,y,w,col='#ffb347'){g.font=FNT(11,'bold');const tw=g.measureText(s).width;text(s,x,y,11,col,'left');g.fillStyle=rgba(col,.35);g.fillRect(x+tw+10,y-4,Math.max(0,w-tw-10),1.5)}
function wzChip(R,s,on,col,hov){rr(R,R.h/2,on?col:hov?'rgba(90,60,30,.95)':'rgba(34,23,14,.92)',on?liftC(col,.6):rgba(col,.6),1.3);fitT(s,R.x+R.w/2,R.y+R.h/2+4.5,12,on?(lum(col)>.5?'#1a1008':'#fff'):'#f3d9b0',R.w-10,'bold',8,'center')}
function wzRank(x,y,r,h=34,w=34){rr({x,y,w,h},7,RANKC[r]);text(r,x+w/2,y+h/2+6,17,'#14100a')}
// carte générique : fond, liseré de couleur, sélection (✓)
function wzCard(R,col,sel,hov,dim){rr(R,9,sel?rgba(col,.26):hov?'rgba(74,48,24,.96)':dim?'rgba(18,12,8,.7)':'rgba(30,20,12,.94)',sel?liftC(col,.6):hov?'#c08040':'rgba(110,80,50,.5)',sel?2.4:1);
 g.fillStyle=col;g.fillRect(R.x+1,R.y+7,3,R.h-14);if(sel){const c={x:R.x+R.w-22,y:R.y+5,w:17,h:17};rr(c,8.5,liftC(col,.6));text('✓',c.x+8.5,c.y+13,11,'#1a1008')}}
// ---------- en-tête : titre et barre des étapes ----------
function wzHead(){const E=ED&&ED.k?rosGet(ED.k):null,s=E?(E.P?`MODIFIER · ${E.P.full}`:`MODIFIER · ${E.b.name}`):'CRÉATION D\'UN PERSO';
 g.save();g.shadowColor='#ff9a3a';g.shadowBlur=14;fitT(s,W/2,36,24,'#ffb347',760,'bold',14,'center');g.restore();
 if(E&&E.P){g.font=FNT(24,'bold');const tw=Math.min(760,g.measureText(s).width);fitT('perso de l\'anime : ta retouche est gardée à part',W/2+tw/2+14,35,11,'#b89a70',1120-W/2-tw/2-14,'normal',9,'left')}
 for(let i=0;i<WZN;i++){const R=wzStepR(i),cur=i===WZ.s,open=i<=WZ.max,h=open&&!cur&&wzHv(R),err=open&&i!==WZ.s&&wzErr(i),rev=WZ.rev.has(i);
  if(i>0){const P=wzStepR(i-1);g.fillStyle=i<=WZ.max?'#c08040':'#3a2818';g.fillRect(P.x+P.w,R.y+R.h/2-1,R.x-P.x-P.w,2)}
  rr(R,R.h/2,cur?'#ff9a3a':h?'rgba(96,64,32,.98)':open?'rgba(52,35,20,.95)':'rgba(22,15,9,.85)',cur?'#ffd38a':open?'#a0703a':'#3a2818',cur?2:1.2);
  const cx=R.x+20,cy=R.y+R.h/2;g.beginPath();g.arc(cx,cy,12,0,7);g.fillStyle=cur?'#1a1008':open?(err?'#c0392b':'#ffb347'):'#2a1c10';g.fill();
  text(open&&!cur&&i<WZ.s&&!err?'✓':String(i+1),cx,cy+5,13,cur?'#ffb347':open?'#1a1008':'#6a5440');
  fitT(WZS[i][0],R.x+38,cy+5,13.5,cur?'#1a1008':open?'#f3d9b0':'#6a5440',R.w-46,'bold',9,'left');
  if(rev||err){g.beginPath();g.arc(R.x+R.w-10,R.y+9,5,0,7);g.fillStyle=err?'#ff5a4a':'#ffb347';g.fill()}
  if(wzFree()&&inRect(mouse,R))hoverTip('wzs'+i,()=>({t:`${i+1}. ${WZS[i][0]}`,col:'#ffd38a',l:err?[[err,'#ff8a7a']]:rev?[['À revoir : ton origine a changé','#ffb347']]:[],d:WZS[i][1],f:cur?'Étape affichée':open?'Clic : aller à cette étape':'Pas encore ouverte : « Suivant ▶ »'}))}}
// ---------- aperçu à droite : le ninja animé, son origine, ses stats, son trait, sa barre de départ ----------
function wzPreview(t){const P=WZP,ch=EBCH,o=wzOrig(EB),col=wzOrigCol(o),T=traitOfB(EB);
 g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=14;rr(P,12,'rgba(18,12,8,.94)',rgba(col,.7),1.5);g.restore();
 {g.save();g.beginPath();g.roundRect(P.x,P.y,P.w,P.h,12);g.clip();const gr=g.createLinearGradient(0,P.y,0,P.y+340);gr.addColorStop(0,rgba(col,.28));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(P.x,P.y,P.w,340);
  g.globalCompositeOperation='lighter';const cx=P.x+P.w/2,r=g.createRadialGradient(cx,P.y+220,0,cx,P.y+220,170);r.addColorStop(0,rgba(ch.look.weapon.col||col,.2));r.addColorStop(1,rgba(ch.look.weapon.col||col,0));g.fillStyle=r;g.fillRect(P.x,P.y,P.w,360);g.restore()}
 const cx=P.x+P.w/2,fy=P.y+330,fake=menuFake(ch);fake.aim=WZ.s===6&&LTAB===3?Math.PI/2+t*.9:Math.PI/2+Math.sin(t*.8)*1.1;fake.moving=Math.sin(t*.5)>.3;fake.walk=t*13;fake.swing=0;
 g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(cx,fy-2,62,15,0,0,7);g.fill();
 const sc=2.15*(ch.look.scale>1?.9:1);drawPrevN(fake,cx,fy,sc,0);drawChar(fake,cx,fy,sc);drawPrevN(fake,cx,fy,sc,1);
 fitT(EB.name,cx,P.y+28,21,ch.side?'#ff9a9a':'#ffd38a',P.w-30,'bold',12,'center');fitT(CAMPS[EB.side],cx,P.y+46,11.5,ch.side?'#ff7a7a':'#8fc8ff',P.w-30,'normal',9,'center');
 let y=fy+26;fitT(ch.desc,cx,y,13,liftC(col,.6),P.w-24,'bold',9,'center');y+=19;
 fitT(`${ch.hp} PV · vitesse ${ch.spd} · puissance ×${ch.pw.toFixed(2).replace('.',',')}`,cx,y,12,'#e8cfa8',P.w-24,'normal',9,'center');y+=12;
 if(T){const L=wrapL(T.desc||'',P.w-44,FNT(10)),n=Math.min(4,L.length),R={x:P.x+12,y,w:P.w-24,h:26+n*12.5+6};rr(R,8,'rgba(0,0,0,.28)',rgba(col,.45),1);fitT('TRAIT · '+(T.nom||T.name||''),R.x+10,R.y+17,12,liftC(col,.62),R.w-20,'bold',9);
  L.slice(0,n).forEach((l,i)=>fitT(i===n-1&&L.length>n?l+'…':l,R.x+10,R.y+32+i*12.5,10,'#d8c4a4',R.w-20,'normal',8)); // 4 lignes au plus (le texte entier dans l'infobulle)
  if(wzHv(R))hoverTip('wzpt',()=>({t:T.nom||T.name||'Trait',col:liftC(col,.6),l:[[wzOrigN(o),liftC(col,.5)]],d:T.desc||' '}));y+=R.h+8}
 // barre de départ (6 cases)
 {const n=BARN,w=(P.w-24-(n-1)*5)/n,yb=P.y+P.h-48;text(`BARRE DE DÉPART « ${crBN(0)} »`,cx,yb-7,10,'#b89a70','center');
  for(let s=0;s<n;s++){const id=EB.bar[s],J=id>=0?JL[id]:null,R={x:P.x+12+s*(w+5),y:yb,w,h:38};rr(R,7,'rgba(13,19,32,.88)',J&&J.r==='S'?'#ffb347':'#3a4a66',1.2);
   if(J){jIcon(R.x+R.w/2,R.y+19,11,catCol(J.cat),J.cat,J.r==='S');if(wzHv(R))hoverTip('wzpb'+s,()=>({t:crN(id),col:liftC(catCol(J.cat),.55),l:[[`${catName(J.cat)} · rang ${J.r}`,'#d8b888']],d:J.d}))}else text('—',R.x+R.w/2,R.y+24,12,'#5a6680')}}}
// ---------- étape 1 : Identité ----------
const wzCampR=i=>({x:WX+i*(WW/2+6),y:WCT+120,w:WW/2-6,h:132}),wzPreR={x:WX,y:WCT+290,w:WW,h:64};
function wzDrawId(){text('NOM',WX,WCT+57,13,'#b89a70','left');fitT(`${String(EB.name||'').length}/16`,WX+560,WCT+57,11,'#8a7458',60,'normal',9,'left');
 if(!WZI)fitT(EB.name,WX+140,WCT+59,19,'#ffd38a',400,'bold',12);
 wzSect('CAMP',WX,WCT+108,WW);
 for(let i=0;i<2;i++){const R=wzCampR(i),sel=EB.side===i,h=wzHv(R),col=i?'#e0383a':'#4db8ff';wzCard(R,col,sel,h);
  g.save();g.translate(R.x+64,R.y+R.h/2);g.globalAlpha=sel?1:.75;if(i){g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,34,22,0,0,7);g.fill();g.fillStyle='#c0202a';g.beginPath();g.ellipse(0,0,27,16,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.ellipse(0,0,10,6,0,0,7);g.fill()}
  else{g.strokeStyle=col;g.lineWidth=5;g.beginPath();g.arc(0,4,20,-.2,5);g.stroke();g.beginPath();g.moveTo(19,-1);g.lineTo(32,-22);g.stroke()}g.restore();
  text(CAMPS[i].toUpperCase(),R.x+120,R.y+46,19,sel?'#fff':'#e8cfa8','left');
  wrapL(i?'Tu combats avec l\'Akatsuki : tes alliés de bataille et la couleur de ton nom (rouge).':'Tu combats avec l\'Alliance Shinobi : tes alliés de bataille et la couleur de ton nom (doré).',R.w-140,FNT(12)).slice(0,3).forEach((l,k)=>text(l,R.x+120,R.y+70+k*16,12,'#cdb898','left','normal'))}
 wzSect('POINT DE DÉPART',WX,WCT+278,WW);
 {const R=wzPreR,h=wzHv(R);wzCard(R,'#ffc53a',false,h);uiIcon('play',R.x+30,R.y+R.h/2,9,'#ffc53a');
  text('Partir d\'un perso de l\'anime',R.x+56,R.y+27,16,h?'#fff':'#ffd38a','left');fitT(`Modèles de kit : reprend le kit et l'apparence de l'un des ${PRESETS.length} persos de l'anime (Naruto, Itachi, Gaara…), à retoucher ensuite à chaque étape. Ton nom et ton camp sont gardés.`,R.x+56,R.y+47,12,'#cdb898',R.w-80,'normal',9);
  text('›',R.x+R.w-18,R.y+R.h/2+8,24,h?'#fff':'#8a5a2a')}
 wrapL('Sinon, « Suivant ▶ » pour construire ton ninja pas à pas : origine (clan, sub ou kekkei genkai), nature, style, jutsu, barres et apparence. Tu peux revenir à une étape déjà vue en cliquant son nom en haut.',WW,FNT(12.5)).forEach((l,i)=>text(l,WX,WCT+400+i*18,12.5,'#a89070','left','normal'))}
function wzClickId(){for(let i=0;i<2;i++)if(inRect(mouse,wzCampR(i))){EB.side=i;edRebuild();return true}if(inRect(mouse,wzPreR)){openPicker('preset');return true}
 if(WZI&&inRect(mouse,wzIR('name'))){WZI.focus();return true}return false}
// ---------- étape 2 : Origine ----------
function wzOrigCards(){const out=[],cols=5,cw=(WW-(cols-1)*8)/cols,ch=40,st=46;let y=WCT+18;
 CLANS.forEach((c,i)=>out.push({o:'c'+i,R:{x:WX+(i%cols)*(cw+8),y:y+Math.floor(i/cols)*st,w:cw,h:ch}}));
 const y2=y+Math.ceil(CLANS.length/cols)*st+24,S=['s'].concat(KGS.map((_,i)=>i).filter(kgOk).map(i=>'g'+i));
 S.forEach((o,i)=>out.push({o,R:{x:WX+(i%cols)*(cw+8),y:y2+Math.floor(i/cols)*st,w:cw,h:ch}}));
 if(S.length===1)out.push({o:null,R:{x:WX+cw+8,y:y2,w:WW-cw-8,h:ch}}); // emplacement des kekkei genkai (KGS vide)
 return{L:out,y2}}
function wzDrawOrig(){const C=wzOrigCards(),cur=wzOrig(EB);wzSect(`CLANS (${CLANS.length})`,WX,WCT+10,WW);wzSect('SANS CLAN : 5 SUB AU CHOIX, OU UN KEKKEI GENKAI',WX,C.y2-8,WW,'#7fd87f');
 for(const c of C.L){const R=c.R,h=wzHv(R);if(!c.o){g.save();g.setLineDash([5,4]);rr(R,9,'rgba(20,14,10,.4)','rgba(150,120,80,.5)',1.2);g.restore();
   fitT('Kekkei genkai : aucun pour l\'instant (un sans-clan à kekkei genkai prend tout un arbre de D à S à la place des sub)',R.x+14,R.y+25,12,'#8a7458',R.w-28,'normal',9);continue}
  const o=c.o,col=wzOrigCol(o),sel=o===cur,T=wzOrigT(o);wzCard(R,col,sel,h);jIcon(R.x+22,R.y+R.h/2,12,col,wzOrigIc(o));
  const nm=o[0]==='c'?CLANS[+o.slice(1)][0]:o[0]==='g'?KGS[+o.slice(1)].n:'Sub (liste)',sub=o==='s'?'1 par rang, 40 au choix':isMartial(+o.slice(1))&&o[0]==='c'?'clan martial':T?T.nom||T.name||'':'';
  fitT(nm,R.x+40,R.y+17,13.5,sel?'#fff':'#ffd38a',R.w-(sel?66:48),'bold',9);fitT(sub,R.x+40,R.y+32,10.5,sel?liftC(col,.7):'#b89a70',R.w-48,'normal',8);
  if(o[0]==='g'&&EB.nat>=0&&KGS[+o.slice(1)].nat===EB.nat&&!sel)text('★',R.x+R.w-12,R.y+15,12,'#ffd36a'); // va avec la nature choisie
  if(h)hoverTip('wzo'+o,()=>{const K=o[0]==='g'?KGS[+o.slice(1)]:null,tn=T?T.nom||T.name||'':'',rule=o==='s'?'Sans clan : exactement 1 sub par rang, choisis dans la liste de tous les sub (étape Jutsu)':K?'Sans clan : l\'arbre du kekkei genkai (1 jutsu par rang, D → S) remplace les sub':isMartial(+o.slice(1))?'Clan martial : pas de nature, arbre de style imposé, 2 jutsu par rang tous appris':'Arbre de clan : 1 jutsu par rang (D → S), sans mudra';
   const J=o==='s'?[]:[...RANKO].map(r=>[r+' · '+TREE[o][r].map(id=>JL[id].n.replace(/^[^:]+ : /,'')).join(' / '),'#d8b888']);
   return{t:wzOrigN(o),col:liftC(col,.6),l:J,d:(K?`${K.d} (${K.el}). `:'')+rule+'.'+(T?` Trait « ${tn} » : ${T.desc||''}`:''),f:sel?'Ton origine':'Clic : choisir'+(WZ.max>1?' (confirmation : les jutsu de l\'origine repartent de zéro)':'')}})}}
function wzClickOrig(){for(const c of wzOrigCards().L)if(c.o&&inRect(mouse,c.R)){wzSetOrig(c.o);return true}return false}
// ---------- étape 3 : Nature ----------
const wzNatR=i=>{const w=(WW-4*10)/5;return{x:WX+i*(w+10),y:WCT+10,w,h:WBOT-WCT-14}};
function wzDrawNat(){if(EB.nat<0){const R={x:WX,y:WCT+30,w:WW,h:140};rr(R,12,'rgba(30,20,12,.9)','#5a3a1e');text('Clan martial : pas de nature',WX+WW/2,R.y+56,20,'#ffd38a');
  fitT(`Le clan ${CLANS[EB.clan][0]} n'utilise pas le ninjutsu : pas d'arbre de nature, pas de mudras. Passe à l'étape suivante.`,WX+WW/2,R.y+88,13,'#cdb898',WW-60,'normal',10,'center');return}
 for(let i=0;i<NATURES.length;i++){const R=wzNatR(i),N=NATURES[i],sel=EB.nat===i,h=wzHv(R),col=N[2];wzCard(R,col,sel,h);
  jIcon(R.x+R.w/2,R.y+46,26,col,'n'+i,false);text(N[0],R.x+R.w/2,R.y+100,20,sel?'#fff':'#ffd38a');text(N[1],R.x+R.w/2,R.y+118,12,liftC(col,.6),'center','normal');
  fitT('fort contre '+NATURES[BEATS[i]][0],R.x+R.w/2,R.y+142,11.5,'#8fe38f',R.w-12,'normal',9,'center');fitT('faible contre '+NATURES[BEATS.indexOf(i)][0],R.x+R.w/2,R.y+158,11.5,'#ff8a7a',R.w-12,'normal',9,'center');
  let y=R.y+186;for(const r of RANKO){rr({x:R.x+10,y:y-11,w:16,h:15},4,RANKC[r]);text(r,R.x+18,y,10,'#14100a');for(const id of TREE['n'+i][r]){fitT(JL[id].n.replace(/^[^:]{2,12} : /,''),R.x+32,y,10.5,'#e8d8bc',R.w-40,'normal',8);y+=15}y+=7}
  if(h)hoverTip('wzn'+i,()=>({t:N[0]+' ('+N[1]+')',col,l:[[optDesc('nat',i),'#d8b888']],d:'2 jutsu par rang, tu en apprends 1 par rang (étape Jutsu), avec mudras : D 2, C 3, B 4, A 5, S 6.',f:sel?'Ta nature':'Clic : choisir'}))}}
function wzClickNat(){if(EB.nat<0)return false;for(let i=0;i<NATURES.length;i++)if(inRect(mouse,wzNatR(i))){if(EB.nat!==i){setB('nat',i);edRebuild();crSay(`Nature : ${NATURES[i][0]} · ses jutsu sont pré-choisis, retouche-les à l'étape Jutsu`,'#8fe38f')}return true}return false}
// ---------- étape 4 : Style ----------
const STDESC=['Coups de poing et de pied, enchaînements au corps à corps.','Le sabre : allonge, estocs, dégainés.','Armes ninja : kunai, chaînes, bâton, armes lancées.'];
const wzTreeR=i=>{const w=(WW-2*10)/3;return{x:WX+i*(w+10),y:WCT+22,w,h:128}};
function wzStyleCards(){const L=stylesOf(EB),cols=3,w=(WW-2*10)/3,h=76,y0=WCT+186;return L.map((v,i)=>({v,R:{x:WX+(i%cols)*(w+10),y:y0+Math.floor(i/cols)*(h+8)-WZ.sc,w,h}}))}
const wzStyleMax=()=>Math.max(0,Math.ceil(stylesOf(EB).length/3)*84-8-(WBOT-WCT-186));
function wzDrawStyle(){const mar=isMartial(EB.clan);wzSect(mar?'ARBRE DE STYLE (IMPOSÉ PAR LE CLAN)':'ARBRE DE STYLE',WX,WCT+10,WW);
 for(let i=0;i<3;i++){const R=wzTreeR(i),sel=EB.st===i,off=mar&&!sel,h=!off&&wzHv(R),col=STCOL[i];wzCard(R,col,sel,h,off);
  jIcon(R.x+28,R.y+30,16,off?'#4a3c2e':col,'t'+i);text(STNAME[i],R.x+54,R.y+36,18,off?'#6a5a48':sel?'#fff':'#ffd38a','left');wrapL(STDESC[i],R.w-28,FNT(11.5)).slice(0,2).forEach((l,k)=>text(l,R.x+14,R.y+62+k*14,11.5,off?'#6a5a48':'#cdb898','left','normal'));
  const nm=[...RANKO].map(r=>TREE['t'+i][r].map(id=>JL[id].n)).flat();wrapL(nm.join(' · '),R.w-28,FNT(10)).slice(0,2).forEach((l,k)=>fitT(l,R.x+14,R.y+98+k*13,10,off?'#5a4a3a':'#a89070',R.w-28,'normal',8));
  if(h)hoverTip('wzt'+i,()=>({t:'Arbre '+STNAME[i],col,l:[['1 jutsu par rang, sans mudra, 0 chakra','#8fe38f']],d:STDESC[i]+' Jutsu : '+nm.join(', ')+'.',f:mar?'Imposé par ton clan':sel?'Ton arbre de style':'Clic : choisir'}))}
 wzSect('ATTAQUE DE BASE (CLIC G, SANS CHAKRA)',WX,WCT+174,WW);
 g.save();g.beginPath();g.rect(WX-4,WCT+182,WW+8,WBOT-WCT-182);g.clip();
 for(const c of wzStyleCards()){const R=c.R;if(R.y>WBOT||R.y+R.h<WCT+182)continue;const ab=styleAb(c.v),sel=EB.w===c.v,h=wzHv(R)&&mouse.y>WCT+182,col=EB.clan>=0?CLANS[EB.clan][1]:STCOL[EB.st];wzCard(R,col,sel,h);
  fitT(ab.n,R.x+14,R.y+21,14,sel?'#fff':'#ffd38a',R.w-50,'bold',10);fitT(`${abCd(ab)} par coup · corps à corps`,R.x+14,R.y+36,10.5,'#d8b888',R.w-28,'normal',8);{const L=wrapL(ab.d||'',R.w-28,FNT(10.5));L.slice(0,2).forEach((l,k)=>fitT(k===1&&L.length>2?l+'…':l,R.x+14,R.y+52+k*13,10.5,'#bfa888',R.w-28,'normal',9))}
  if(h)hoverTip('wzw'+c.v,()=>({t:ab.n,col,l:[[`${abCd(ab)} par coup · combo de 5 coups, le 5e étourdit`,'#d8b888']],d:ab.d||' ',f:sel?'Ton attaque de base':'Clic : choisir'}))}
 g.restore();if(stylesOf(EB).length===1)fitT('Seule attaque de base possible pour ce perso (style propre au clan).',WX,WBOT-6,11.5,'#8a7458',WW,'normal',9);if(wzStyleMax()>0&&WZ.sc<wzStyleMax())text('▼ molette : la suite',WX+WW/2,WBOT-2,11,'#ffb347')}
function wzClickStyle(){const mar=isMartial(EB.clan);for(let i=0;i<3;i++)if(inRect(mouse,wzTreeR(i))){if(mar){crSay('Clan martial : son arbre de style est imposé','#c8b89a');return true}if(EB.st!==i){setB('st',i);edRebuild();crSay(`Arbre ${STNAME[i]} : son attaque de base et ses jutsu sont pris d'office, retouche-les ici et à l'étape Jutsu`,'#8fe38f')}return true}
 if(mouse.y>WCT+182)for(const c of wzStyleCards())if(inRect(mouse,c.R)){EB.w=c.v;edRebuild();return true}return false}
// ---------- étape 5 : Jutsu (onglets : origine, nature, style ; un sans-clan à sub a la LISTE DES SUB) ----------
function wzTabs(){const L=[];if(EB.clan>=0)L.push({k:'c'+EB.clan,n:catName('c'+EB.clan),col:CLANS[EB.clan][1]});else if(kgOk(EB.kg))L.push({k:'g'+EB.kg,n:'Kekkei genkai · '+KGS[EB.kg].n,col:KGS[EB.kg].col});else L.push({k:'sub',n:'Sub',col:'#7fd87f'});
 if(EB.nat>=0)L.push({k:'n'+EB.nat,n:'Nature · '+NATURES[EB.nat][0],col:NATURES[EB.nat][2]});L.push({k:'t'+EB.st,n:'Style · '+STNAME[EB.st],col:STCOL[EB.st]});return L}
const wzTab=()=>{const L=wzTabs();return(L.find(t=>t.k===WZ.tab)||L[0]).k};
const wzTabCnt=t=>t==='sub'?`${RANKO.length-subMissing(EB).length}/5`:`${EB.k.filter(id=>JL[id].cat===t).length}/${[...RANKO].reduce((a,r)=>a+Math.min(TREE[t][r].length,tTake(TREES[t],r)),0)}`;
function wzTabRects(){let x=WX;g.font=FNT(13,'bold');return wzTabs().map(t=>{const s=`${t.n}  ${wzTabCnt(t.k)}`,w=g.measureText(s).width+34,R={x,y:WCT,w,h:30,s,t};x+=w+8;return R})}
// cartes d'un arbre : une rangée par rang, les jutsu du rang côte à côte
function wzTreeCards(t){const out=[],top=WCT+40,rh=(WBOT-top)/5;[...RANKO].forEach((r,ri)=>{const L=TREE[t][r],y=top+ri*rh,x0=WX+48,w0=WW-48,n=Math.max(1,L.length),w=(w0-(n-1)*8)/n;
  if(!L.length)out.push({jid:-1,r,R:{x:x0,y,w:w0,h:rh-7}});L.forEach((id,i)=>out.push({jid:id,r,R:{x:x0+i*(w+8),y,w,h:rh-7}}))});return out}
function wzJCard(C,t,hov){const R=C.R;if(C.jid<0){g.save();g.setLineDash([4,4]);rr(R,8,'rgba(20,14,10,.35)','rgba(120,90,60,.45)',1);g.restore();text('—',R.x+R.w/2,R.y+R.h/2+5,13,'#5a4a3a');return}
 const J=JL[C.jid],lr=EB.k.includes(C.jid),col=catCol(J.cat),ab=jutsu(C.jid),fo=crForced(C.jid),gold=J.r==='S';
 rr(R,8,lr?(hov?rgba(col,.4):rgba(col,.24)):hov?'rgba(74,48,24,.96)':'rgba(24,16,10,.9)',lr?liftC(col,.6):hov?'#c08040':'rgba(110,80,50,.5)',lr?2.2:1);
 jIcon(R.x+22,R.y+22,13,lr?col:'#4a3c2e',J.cat,gold&&lr);const nm=TREES[J.cat].type==='nature'?crN(C.jid).replace(/^[^:]{2,12} : /,''):crN(C.jid);
 fitT(nm,R.x+42,R.y+20,14,lr?(gold?'#ffe81f':'#fff3dc'):'#c8b090',R.w-130,'bold',10);
 {const s=lr?(fo?'✓ APPRIS D\'OFFICE':'✓ APPRIS'):hov?'CLIC : APPRENDRE':'',c=lr?liftC(col,.65):'#ffb347';if(s){g.font=FNT(10,'bold');const w=g.measureText(s).width+12;rr({x:R.x+R.w-w-8,y:R.y+8,w,h:17},8.5,lr?rgba(col,.35):'rgba(60,40,20,.9)');text(s,R.x+R.w-w/2-8,R.y+20.5,10,c)}}
 fitT(`${jcostT(ab)} · recharge ${fmtCd(ab.cd)} · ${ab.mud?ab.mud+' mudras':'sans mudra'}`,R.x+42,R.y+36,11,lr?'#e0c8a0':'#9a8468',R.w-52,'normal',8);
 const L=wrapL(J.d,R.w-24,FNT(11)),n=Math.max(1,Math.floor((R.h-44)/14));L.slice(0,n).forEach((l,i)=>fitT(i===n-1&&L.length>n?l+'…':l,R.x+12,R.y+54+i*14,11,lr?'#d8c8ac':'#8a7a64',R.w-24,'normal',8))}
// liste des sub : tous, filtrés par rang, famille et texte ; triés par rang puis famille
// recherche souple : chaque mot doit se retrouver (sans accents ni majuscules), au début d'un mot à une lettre près (« soin » trouve « Soigne »), ou par un mot voisin (WZSYN)
const WZSYN={soin:['soign','regen','gueri','iryo','pv'],soigner:['soin','regen'],heal:['soign','regen'],degat:['degat'],invoc:['kuchiyose','invoqu'],clone:['bunshin'],sceau:['fuin','scell'],teleport:['hiraishin','telepor'],illusion:['genjutsu'],etourdi:['etourdi','stun'],ralenti:['ralenti','lent'],bouclier:['bouclier','barriere','protege']};
function wzMatch(t,q){const W=t.split(/[^a-z0-9]+/).filter(Boolean);return q.split(/\s+/).filter(Boolean).every(w=>{if(t.includes(w))return true;
 const p=w.length>=4?w.slice(0,Math.max(3,w.length-1)):null;if(p&&W.some(x=>x.startsWith(p)))return true;const S=WZSYN[w]||WZSYN[w.replace(/s$/,'')];return!!S&&S.some(y=>t.includes(y))})}
function wzSubs(){const q=fold(WZ.q.trim());return JL.filter(J=>catType(J.cat)==='famille'&&(!WZ.rk||J.r===WZ.rk)&&(WZ.fm<0||J.cat==='f'+WZ.fm)&&(!q||wzMatch(fold(J.n+' '+J.d+' '+FAMS[+J.cat.slice(1)][0]),q)))
 .sort((a,b)=>RANKO.indexOf(a.r)-RANKO.indexOf(b.r)||(+a.cat.slice(1))-(+b.cat.slice(1))||a.id-b.id)}
const wzSlotR=i=>{const w=(WW-4*8)/5;return{x:WX+i*(w+8),y:WCT+40,w,h:48}};
const wzRkR=i=>({x:WX+(i?62+(i-1)*42:0),y:WCT+96,w:i?36:56,h:28});
function wzFamR(){let x=WX;g.font=FNT(11.5,'bold');return[-1].concat(FAMS.map((_,i)=>i)).map(f=>{const s=f<0?'Toutes les familles':FAMS[f][0].split(' / ')[0],w=g.measureText(s).width+20,R={x,y:WCT+130,w,h:24,f,s};x+=w+6;return R})}
const WZL0=WCT+164,WZRH=50,wzSubMax=n=>Math.max(0,n*WZRH-4-(WBOT-WZL0));
function wzDrawSubs(){const by=subByRank(EB.k);
 RANKO.split('').forEach((r,i)=>{const R=wzSlotR(i),id=by[r],h=wzHv(R),J=id>=0?JL[id]:null,col=J?catCol(J.cat):'#ff5a4a',on=WZ.rk===r;
  if(J)rr(R,9,h||on?rgba(col,.34):rgba(col,.2),on?'#ffd38a':liftC(col,.55),on?2.2:1.4);else{g.save();g.setLineDash([5,4]);rr(R,9,h?'rgba(90,30,20,.5)':'rgba(60,20,14,.35)','#ff6a5a',1.4);g.restore()}
  wzRank(R.x+7,R.y+7,r,34,30);if(J){fitT(crN(id),R.x+44,R.y+21,12.5,'#fff3dc',R.w-50,'bold',10);fitT(FAMS[+J.cat.slice(1)][0],R.x+44,R.y+37,10.5,liftC(col,.6),R.w-50,'normal',8)}
  else{text('à choisir',R.x+44,R.y+21,12.5,'#ff8a7a','left');fitT('clic : voir les sub '+r,R.x+44,R.y+37,10.5,'#c88a7a',R.w-50,'normal',8)}
  if(h)hoverTip('wzsl'+r,()=>({t:`Sub de rang ${r}`+(J?' : '+crN(id):''),col:J?liftC(col,.6):'#ff8a7a',d:J?J.d:'Aucun sub de ce rang : il en faut exactement 1 par rang.',f:'Clic : ne montrer que les sub de rang '+r}))});
 ['Tous',...RANKO].forEach((s,i)=>{const R=wzRkR(i),on=i?WZ.rk===s:!WZ.rk;wzChip(R,s,on,i?RANKC[s]:'#ffb347',wzHv(R))});
 uiIcon('search',WX+316,WCT+110,8,'#a88a68');
 const L=wzSubs();fitT(`${L.length} sub`,WX+WW,WCT+115,12,'#d8b888',230,'bold',9,'right');
 for(const R of wzFamR())wzChip(R,R.s,WZ.fm===R.f,R.f<0?'#ffb347':FAMS[R.f][1],wzHv(R));
 const mx=wzSubMax(L.length);WZ.sc=clamp(WZ.sc,0,mx);g.save();g.beginPath();g.rect(WX-4,WZL0-2,WW+8,WBOT-WZL0+4);g.clip();
 if(!L.length)text('Aucun sub ne correspond à ces filtres',WX+WW/2,WZL0+60,14,'#8a7458','center','normal');
 L.forEach((J,i)=>{const R={x:WX,y:WZL0+i*WZRH-WZ.sc,w:WW-14,h:WZRH-6};if(R.y+R.h<WZL0||R.y>WBOT)return;const f=+J.cat.slice(1),col=FAMS[f][1],sel=EB.k.includes(J.id),h=wzHv(R)&&mouse.y>WZL0&&mouse.y<WBOT,ab=jutsu(J.id),cur=by[J.r];
  rr(R,8,sel?rgba(col,.26):h?'rgba(74,48,24,.96)':'rgba(26,17,10,.92)',sel?liftC(col,.6):h?'#c08040':'rgba(100,72,44,.5)',sel?2:1);
  wzRank(R.x+6,R.y+6,J.r,R.h-12,28);jIcon(R.x+52,R.y+R.h/2,13,col,'f'+f,J.r==='S');
  fitT(crN(J.id),R.x+72,R.y+19,13.5,sel?'#fff':'#ffd38a',260,'bold',9);
  g.font=FNT(10.5,'bold');const tg=FAMS[f][0],tw=g.measureText(tg).width+14,tx=R.x+340;rr({x:tx,y:R.y+7,w:tw,h:16},8,rgba(col,.3),rgba(col,.7),1);text(tg,tx+tw/2,R.y+19,10.5,liftC(col,.7));
  fitT(`${jcostT(ab)} · ${fmtCd(ab.cd)}`,tx+tw+10,R.y+19,10.5,'#c8b090',R.x+R.w-tx-tw-120,'normal',8);
  fitT(J.d,R.x+72,R.y+36,11,'#bfa888',R.w-84-(sel?0:0),'normal',8);
  const st=sel?'✓ CHOISI':h?(cur>=0?'↺ REMPLACE '+crN(cur).toUpperCase():'CLIC : CHOISIR'):'';if(st){g.font=FNT(10,'bold');const w=Math.min(260,g.measureText(st).width+14);rr({x:R.x+R.w-w-8,y:R.y+6,w,h:17},8.5,sel?rgba(col,.45):'rgba(60,40,20,.95)');fitT(st,R.x+R.w-w/2-8,R.y+18.5,10,sel?'#fff':'#ffb347',w-8,'bold',7,'center')}
  if(h)hoverTip('wzsub'+J.id,()=>({t:crN(J.id),col:liftC(col,.6),l:[[`${FAMS[f][0]} · rang ${J.r}`,liftC(col,.5)],[`${jcostT(ab)} · recharge ${fmtCd(ab.cd)} · sans mudra`,'#d8b888']].concat(!sel&&cur>=0?[[`Remplace ton sub de rang ${J.r} : ${crN(cur)}`,'#ffb347']]:[]),d:J.d,f:sel?'Ton sub de rang '+J.r:'Clic : le choisir comme sub de rang '+J.r}))});
 g.restore();
 if(mx>0){const tr={x:WX+WW-6,y:WZL0,w:6,h:WBOT-WZL0},k=tr.h/(tr.h+mx);rr(tr,3,'rgba(255,255,255,.08)');rr({x:tr.x,y:tr.y+(tr.h-tr.h*k)*WZ.sc/mx,w:6,h:tr.h*k},3,'#c08040')}}
function wzDrawJutsu(){const T=wzTab();wzTabRects().forEach(R=>{const on=R.t.k===T,h=wzHv(R),c=R.t.col;rr(R,15,on?c:h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)',on?liftC(c,.7):rgba(c,.7),1.5);
  const bad=R.t.k==='sub'&&subMissing(EB).length;fitT(R.s,R.x+R.w/2,R.y+20,13,on?(lum(c)>.45?'#1a1008':'#fff'):bad?'#ff8a7a':'#f3d9b0',R.w-12,'bold',9,'center')});
 if(T==='sub')return wzDrawSubs();
 const TT=TREES[T],cards=wzTreeCards(T),top=WCT+40,rh=(WBOT-top)/5;
 [...RANKO].forEach((r,ri)=>{const y=top+ri*rh;wzRank(WX,y,r,rh-7,40);const fr=ckFreeT(T);text(fr?'0':String(RKB[r].ck),WX+20,y+rh-16,9.5,'#14100a','center','normal');
  if(wzHv({x:WX,y,w:40,h:rh-7}))hoverTip('wzr'+r,()=>({t:'Rang '+r,col:RANKC[r],d:`${fr?'0 chakra (arbre martial)':`Chakra ${RKB[r].ck} par lancer`} · recharge ${RKB[r].cd.join(' à ')} s${r==='S'?' · cut-in au lancer':''}${TT.type==='nature'?` · ${MUDRAS[r]} mudras`:''}. ${TT.force?'Clan martial : 2 jutsu par rang, tous appris.':TT.type==='nature'?'Tu apprends 1 des 2 jutsu du rang.':'1 jutsu par rang (un rang peut rester vide).'}`}))});
 CRH=-1;for(const C of cards){const h=wzHv(C.R)&&C.jid>=0;wzJCard(C,T,h);if(h){CRH=C.jid;const J=JL[C.jid],lr=EB.k.includes(C.jid),bl=lr?'':learnBlock(EB.k,C.jid),rep=bl?EB.k.filter(id=>JL[id].r===J.r&&JL[id].cat===J.cat).map(id=>crN(id)):[];
  hoverTip('wzj'+C.jid,()=>({t:crN(C.jid),col:liftC(catCol(J.cat),.55),l:[[`${catName(J.cat)} · rang ${J.r}`,liftC(catCol(J.cat),.5)]].concat(rep.length?[[`L'apprendre remplace : ${rep.join(', ')}`,'#ffb347']]:[]),d:J.d,f:crForced(C.jid)?'Appris d\'office (clan martial)':lr?'Clic : oublier (le rang reste vide)':'Clic : apprendre'}))}}}
function wzClickJutsu(){for(const R of wzTabRects())if(inRect(mouse,R)){WZ.tab=R.t.k;WZ.sc=0;return true}
 const T=wzTab();if(T==='sub'){const by=subByRank(EB.k);
  for(let i=0;i<5;i++)if(inRect(mouse,wzSlotR(i))){const r=RANKO[i];WZ.rk=WZ.rk===r?'':r;WZ.sc=0;return true}
  for(let i=0;i<6;i++)if(inRect(mouse,wzRkR(i))){WZ.rk=i?RANKO[i-1]:'';WZ.sc=0;return true}
  for(const R of wzFamR())if(inRect(mouse,R)){WZ.fm=WZ.fm===R.f?-1:R.f;WZ.sc=0;return true}
  if(WZI&&inRect(mouse,wzIR('q'))){WZI.focus();return true}
  if(mouse.y>WZL0&&mouse.y<WBOT){const L=wzSubs(),i=Math.floor((mouse.y-WZL0+WZ.sc)/WZRH);const J=L[i];if(J&&mouse.x>WX&&mouse.x<WX+WW-14){
    if(EB.k.includes(J.id)){crSay(`${crN(J.id)} est déjà ton sub de rang ${J.r} : choisis-en un autre de ce rang pour le remplacer`,'#c8b89a');return true}
    const old=by[J.r];crLearn(J.id);edRebuild();crSay(old>=0?`Sub de rang ${J.r} : ${crN(J.id)} (à la place de ${crN(old)})`:`Sub de rang ${J.r} : ${crN(J.id)}`,'#8fe38f');return true}}
  return false}
 for(const C of wzTreeCards(T))if(C.jid>=0&&inRect(mouse,C.R)){crToggle(C.jid);return true}return false}
// ---------- étape 6 : Barres (touches, barres favorites, jutsu appris à poser) ----------
const wzKeyR=i=>{const w=(WW-2*10)/3;return{x:WX+i*(w+10),y:WCT,w,h:40}};
function wzLearnCards(){const cols=wzTabs(),w=(WW-(cols.length-1)*10)/cols.length,out=[];cols.forEach((c,ci)=>{const L=EB.k.filter(id=>c.k==='sub'?catType(JL[id].cat)==='famille':JL[id].cat===c.k).sort((a,b)=>RANKO.indexOf(JL[a].r)-RANKO.indexOf(JL[b].r));
  L.forEach((id,i)=>out.push({jid:id,c:ci,R:{x:WX+ci*(w+10),y:WCT+190+i*(TREES[JL[id].cat]&&TREES[JL[id].cat].force?27:52),w,h:TREES[JL[id].cat]&&TREES[JL[id].cat].force?24:47}}))});return{out,cols,w}}
function wzDrawBars(){const ch=EBCH,CB=crB();
 // touches : Clic G (style), Espace (dash), A (Kawarimi)
 [[lbl.lmb||'Clic G',ch.abil[0],'Attaque de base · étape Style'],[lbl.Space,ch.dashAb||ch.abil[DASHI],dashOpts(EB).length>1?'Dash · clic : changer':'Dash du clan'],[lbl.KeyQ,ch.shunAb||ch.abil[SHUNI],'Kawarimi · commun à tous']].forEach(([key,ab,sub],i)=>{
  const R=wzKeyR(i),click=i===1&&dashOpts(EB).length>1||i===0,h=click&&wzHv(R);rr(R,9,h?'rgba(74,48,24,.95)':'rgba(24,16,10,.88)',h?'#c08040':'rgba(150,110,60,.5)',1.2);
  const kb={x:R.x+5,y:R.y+5,w:54,h:R.h-10};rr(kb,6,'rgba(50,32,16,.95)','#8a5a2a',1.2);fitT(key,kb.x+kb.w/2,kb.y+kb.h/2+4.5,12,'#fff',kb.w-6,'bold',8,'center');
  fitT(ab?ab.n:'—',R.x+68,R.y+18,13,'#ffd38a',R.w-84,'bold',9);fitT(sub,R.x+68,R.y+33,10.5,'#c8a878',R.w-84,'normal',8);if(click)text('›',R.x+R.w-10,R.y+R.h/2+6,18,h?'#fff':'#8a5a2a');
  if(wzHv(R))hoverTip('wzk'+i,()=>({t:ab?ab.n:'—',col:'#ffd38a',l:[[sub,'#d8b888']],d:ab&&ab.d||' '}))});
 // barre affichée : 6 cases
 text(`BARRE ${EBI+1}/${EB.bars.length}`,WX+54,WCT+64,11,'#ffb347','center');fitT(crBN(),WX+54,WCT+82,12.5,'#ffd38a',104,'bold',8,'center');
 text(EBI===0?'★ départ':'',WX+54,WCT+100,10.5,'#8fe38f','center','normal');
 for(let s=0;s<BARN;s++){const R=crBarR(s),id=CB[s],J=id>=0?JL[id]:null,h=wzHv(R),gold=J&&J.r==='S',hl=CRH>=0&&id===CRH;
  rr(R,9,h?'rgba(74,48,24,.95)':'rgba(13,19,32,.9)',hl?'#6fe36f':gold?'#ffb347':h?'#c08040':'#3a4a66',hl||gold?2:1.3);text(lbl['Digit'+(s+1)]||String(s+1),R.x+8,R.y+15,12,'#cfd8ea','left');
  if(!J){text('vide',R.x+R.w/2,R.y+40,10.5,'#5a6680','center','normal');if(h)hoverTip('wzcb'+s,()=>({t:`« ${crBN()} » · case ${s+1} (vide)`,d:'Clic : choisir un de tes jutsu appris. Ou survole un jutsu en dessous et tape '+(s+1)+'.'}));continue}
  jIcon(R.x+R.w/2+8,R.y+20,12,catCol(J.cat),J.cat,gold);rr({x:R.x+R.w-17,y:R.y+4,w:13,h:13},4,RANKC[J.r]);text(J.r,R.x+R.w-10.5,R.y+14,9,'#14100a');
  const L=wrapL(crN(id),R.w-6,FNT(9.5,'bold'));fitT(L[0]||'',R.x+R.w/2,R.y+44,9.5,'#e8eef8',R.w-6,'bold',7,'center');if(L[1])fitT(L.slice(1).join(' '),R.x+R.w/2,R.y+55,9.5,'#e8eef8',R.w-6,'bold',7,'center');
  if(h)hoverTip('wzcb'+s,()=>({t:`« ${crBN()} » · case ${s+1} : ${crN(id)}`,col:liftC(catCol(J.cat),.55),l:[[`${catName(J.cat)} · rang ${J.r}`,liftC(catCol(J.cat),.5)]],d:J.d,f:'Clic : choisir un autre jutsu · clic D : vider la case'}))}
 btn(crAutoBtn,'↻ Barre auto',false);btn(crFillBtn,'Compléter',false);
 if(wzHv(crAutoBtn))hoverTip('autobar',()=>({t:'Barre automatique',d:EBI===0?'Refait les 6 cases de la barre affichée avec tes jutsu appris, du rang S au rang D, en alternant les arbres.':'Refait les 6 cases de la barre affichée : d\'abord les jutsu appris absents de tes autres barres.'}));
 if(wzHv(crFillBtn))hoverTip('fillbar',()=>({t:'Compléter la barre',d:'Remplit seulement les cases vides de la barre affichée avec tes jutsu appris qui n\'y sont pas encore.'}));
 // onglets des barres favorites
 {g.font=FNT(10,'bold');EB.bars.forEach((q,i)=>{const R=crTabR(i),on=i===EBI,h=wzHv(R),hd=on&&EB.bars.length>1&&wzHv(crDelR(R));rr(R,9,on?'#ff9a3a':h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)',on?'#ffd38a':i===0?'#7fd87f':'#8a5a2a',on?2:1.2);
   const dup=crDupOf(i),fg=dup>=0?(on?'#7a0e00':'#ff8a7a'):on?'#1a1008':i===0?'#bff0b0':'#f3d9b0';fitT((i===0?'★ ':'')+(i+1)+'. '+q.n+(dup>=0?' (double)':'')+(on&&!hd?' ✎':''),R.x+8,R.y+19.5,12,fg,R.w-(on&&EB.bars.length>1?32:14),'bold',8.5);
   if(on&&EB.bars.length>1){const D=crDelR(R);rr(D,5,hd?'#c0392b':'rgba(26,16,8,.35)');text('✕',D.x+D.w/2,D.y+14.5,11,hd?'#fff':'#3a2208','center')}
   if(h)hoverTip('wztab'+i+(hd?'d':''),()=>hd?{t:`Supprimer « ${q.n} »`,col:'#ff7a6a',d:'Une confirmation est demandée. Les jutsu restent appris.'}:{t:`Barre ${i+1} : ${q.n}${i===0?' (départ)':''}`,col:i===0?'#8fe38f':'#ffd38a',l:crBars()[i].map((id,s)=>[`${s+1}. ${id>=0?crN(id)+' · rang '+JL[id].r:'vide'}`,id>=0?liftC(catCol(JL[id].cat),.5):'#7a8aa8']),d:(dup>=0?`Identique à la barre ${dup+1} : change au moins une case. `:'')+`En combat : ${lbl.KeyB} maintenu + molette pour la surligner, relâcher ${lbl.KeyB} pour l'équiper.`,f:on?'Clic : renommer · ✕ ou clic D : supprimer':'Clic : modifier cette barre'})});
  if(EB.bars.length<BARSMAX){const R=crPlusR(),h=wzHv(R);g.save();g.setLineDash([5,4]);rr({x:R.x,y:R.y,w:34,h:R.h},9,h?'rgba(74,48,24,.95)':'rgba(24,17,11,.6)',h?'#ffc53a':'rgba(255,197,58,.55)',1.3);g.restore();text('+',R.x+17,R.y+21,18,h?'#fff':'#ffc53a','center');
   if(h)hoverTip('crplus',()=>({t:'Nouvelle barre favorite',col:'#ffc53a',d:`Ajoute une barre (${EB.bars.length}/${BARSMAX}) remplie d'abord avec tes jutsu appris absents des autres barres.`}))}
  if(EBI>0){const R=crStartBtn,h=wzHv(R);rr(R,7,h?'#ff9a3a':'rgba(40,28,18,.92)','#c08040',1.2);text('★ Départ',R.x+R.w/2,R.y+17.5,12,h?'#1a1008':'#f3d9b0','center');
   if(h)hoverTip('crstart',()=>({t:'Barre de départ',col:'#8fe38f',d:`Fait de « ${crBN()} » ta barre de départ (celle du début de combat).`}))}}
 // jutsu appris : survol + 1-6 = poser, clic = ajouter à la 1re case vide (ou retirer de la barre)
 const C=wzLearnCards(),out=crOut();wzSect(`TES ${EB.k.length} JUTSU APPRIS · survol + 1-6 : poser dans la case · clic : ajouter ou retirer${out.length?` · ${out.length} dans aucune barre`:''}`,WX,WCT+172,WW,out.length?'#ffb347':'#b89a70');
 CRH=-1;for(const q of C.out){const R=q.R,J=JL[q.jid],col=catCol(J.cat),s=CB.indexOf(q.jid),h=wzHv(R),inA=crBars().some(B=>B.includes(q.jid)),sm=R.h<30;if(h)CRH=q.jid;
  rr(R,8,s>=0?rgba(col,.3):h?'rgba(74,48,24,.96)':'rgba(26,17,10,.92)',s>=0?liftC(col,.6):h?'#c08040':inA?'rgba(110,80,50,.5)':'#b07a2a',s>=0?2:1);
  if(!sm){wzRank(R.x+5,R.y+5,J.r,R.h-10,22);jIcon(R.x+44,R.y+R.h/2,11,col,J.cat,J.r==='S');fitT(crN(q.jid),R.x+62,R.y+20,12.5,'#fff3dc',R.w-96,'bold',8);fitT(inA?catName(J.cat):'dans aucune barre',R.x+62,R.y+36,10,inA?liftC(col,.55):'#ffb347',R.w-96,'normal',8)}
  else{rr({x:R.x+4,y:R.y+4,w:16,h:R.h-8},4,RANKC[J.r]);text(J.r,R.x+12,R.y+16,10,'#14100a');fitT(crN(q.jid),R.x+26,R.y+16.5,11,'#fff3dc',R.w-56,'bold',8)}
  if(s>=0){const b={x:R.x+R.w-24,y:R.y+(sm?3:6),w:19,h:18};rr(b,5,'#3aa83a','#9fffa0',1);text(String(s+1),b.x+9.5,b.y+13.5,11,'#0c1a0c')}
  if(h)hoverTip('wzl'+q.jid,()=>({t:crN(q.jid),col:liftC(col,.55),l:[[`${catName(J.cat)} · rang ${J.r}`,liftC(col,.5)],[s>=0?`Case ${s+1} de « ${crBN()} »`:inA?'Dans une autre barre':'Dans aucune barre : inutilisable en combat','#d8b888']],d:J.d,f:`1-6 : poser dans la case · clic : ${s>=0?'retirer de la barre':'ajouter à la 1re case vide'}`}))}}
function wzBarSlotRm(s){const B=crB();if(B[s]<0)return;const n=crN(B[s]);B[s]=-1;if(B.every(id=>id<0))crSay('Une barre ne peut pas être toute vide : elle a été remplie automatiquement','#ffb347');else crSay(`${n} retiré de la case ${s+1} (toujours appris)`,'#ffb347');edRebuild()}
function wzClickBars(){if(inRect(mouse,wzKeyR(0))){wzGo(3);return true}if(inRect(mouse,wzKeyR(1))){if(dashOpts(EB).length>1)openPicker(DASHI);else crSay('Dash propre au clan : il ne se change pas','#c8b89a');return true}
 if(inRect(mouse,wzKeyR(2))){crSay('Kawarimi : commun à tous les ninjas ('+lbl.KeyQ+')','#c8b89a');return true}
 for(let s=0;s<BARN;s++)if(inRect(mouse,crBarR(s))){openPicker(BAR0+s);return true}
 for(let i=0;i<EB.bars.length;i++){const R=crTabR(i);if(!inRect(mouse,R))continue;if(i===EBI&&EB.bars.length>1&&inRect(mouse,crDelR(R))){crBarDel(i);return true}if(i===EBI)crBarRen();else{EBI=i;crSay(`Barre « ${crBN()} » affichée`,'#c8b89a')}return true}
 if(EB.bars.length<BARSMAX&&inRect(mouse,crPlusR())){crBarNew();return true}
 if(EBI>0&&inRect(mouse,crStartBtn)){crBarStart();return true}
 if(inRect(mouse,crAutoBtn)){const SN=crSnap();crSetB(crAutoB());edRebuild();crRetheme(SN);crSay('Barre refaite automatiquement','#8fe38f');return true}
 if(inRect(mouse,crFillBtn)){const n=crFill();crSay(n?n+' case'+(n>1?'s':'')+' remplie'+(n>1?'s':''):'Aucune case vide à remplir (ou plus de jutsu appris hors de la barre)',n?'#8fe38f':'#c8b89a');return true}
 for(const q of wzLearnCards().out)if(inRect(mouse,q.R)){const B=crB(),s=B.indexOf(q.jid);if(s>=0){wzBarSlotRm(s);return true}const e=B.indexOf(-1);if(e<0){crSay('Barre pleine : survole ce jutsu et tape 1-6 pour remplacer une case','#ffb347');return true}crPlace(q.jid,e);return true}
 return false}
// ---------- étape 7 : Apparence ----------
const wzLtR=i=>({x:WX+i*(WW/4+2),y:WCT,w:WW/4-6,h:32});
function wzDrawLook(){LTABS.forEach((s,i)=>{const R=wzLtR(i);wzChip(R,s,LTAB===i,'#ff9a3a',wzHv(R))});
 lookKeys().forEach(([lab,list,k],i)=>{const R=lookRow(i),L=list(),v=getB(k),it=L[v];fitT(lab,WX,R.y,14,'#d8b888',150,'bold',9);
  for(const [Q,left] of[[R.l,1],[R.r,0]]){const h=wzHv(Q);rr(Q,8,h?'#ff9a3a':'rgba(40,30,20,.9)','#8a5a2a',1);text(left?'◀':'▶',Q.x+Q.w/2,Q.y+Q.h/2+5,14,h?'#1a1008':'#f3d9b0')}
  const h=wzHv(R.v),sw=swCol(it);rr(R.v,8,h?'rgba(90,60,30,.85)':'rgba(0,0,0,.3)',h?'#c08040':'rgba(110,80,50,.5)',1);if(sw)rr({x:R.v.x+10,y:R.v.y+R.v.h/2-10,w:20,h:20},4,sw,'#14100a',1.5);
  fitT(itN(it),R.v.x+(sw?40:14),R.y,15,'#fff',R.v.w-(sw?100:70),'bold',10);text(`${v+1}/${L.length}`,R.v.x+R.v.w-10,R.y,11,'#8a7458','right','normal');
  if(h)hoverTip('wzlk'+k,()=>({t:lab+' : '+itN(it),d:(optDesc(k,v)?optDesc(k,v)+' ':'')+`${L.length} choix. Clic : ouvrir la grille · ◀ ▶ : précédent / suivant.`}))});
 wrapL(lookTabD[LTAB],WW,FNT(12.5)).forEach((l,i)=>text(l,WX,WBOT-46+i*17,12.5,'#a89070','left','normal'))}
function wzClickLook(){for(let i=0;i<LTABS.length;i++)if(inRect(mouse,wzLtR(i))){LTAB=i;return true}
 for(const [i,[,list,k]] of lookKeys().entries()){const R=lookRow(i),n=list().length;if(inRect(mouse,R.l)){setB(k,(getB(k)+n-1)%n);edRebuild();return true}if(inRect(mouse,R.r)){setB(k,(getB(k)+1)%n);edRebuild();return true}if(inRect(mouse,R.v)){openPicker(k);return true}}return false}
// ---------- étape 8 : Résumé ----------
function wzSumBox(x,y,w,h,title,step){const R={x,y,w,h};rr(R,9,'rgba(26,17,10,.9)','rgba(120,86,50,.55)',1);text(title,x+10,y+17,11,'#ffb347','left');
 const E={x:x+w-82,y:y+4,w:76,h:18},hv=wzHv(E);rr(E,9,hv?'#ff9a3a':'rgba(50,34,20,.9)','#8a5a2a',1);text('✎ modifier',E.x+E.w/2,E.y+13,10,hv?'#1a1008':'#f3d9b0');WZSUM.push({R:E,step});return y+32}
let WZSUM=[];
function wzDrawSum(){WZSUM=[];const ch=EBCH,o=wzOrig(EB),T=traitOfB(EB),xl=WX,wl=400,xr=WX+412,wr=WW-412;let y=WCT;
 y=wzSumBox(xl,y,wl,58,'IDENTITÉ',0);fitT(`${EB.name} · ${CAMPS[EB.side]}`,xl+10,y+4,14,'#fff3dc',wl-20,'bold',9);y+=34;
 {const yy=wzSumBox(xl,y,wl,92,'ORIGINE',1);jIcon(xl+22,yy+6,11,wzOrigCol(o),wzOrigIc(o));fitT(wzOrigN(o),xl+40,yy+11,14,liftC(wzOrigCol(o),.65),wl-50,'bold',9);
  if(T){fitT('Trait · '+(T.nom||T.name||''),xl+10,yy+30,11.5,'#ffd38a',wl-20,'bold',8);const L=wrapL(T.desc||'',wl-20,FNT(10.5));L.slice(0,2).forEach((l,i)=>fitT(i===1&&L.length>2?l+'…':l,xl+10,yy+45+i*13,10.5,'#cdb898',wl-20,'normal',8))}y+=104}
 {const yy=wzSumBox(xl,y,wl,58,'NATURE',2);fitT(EB.nat>=0?`${NATURES[EB.nat][0]} (${NATURES[EB.nat][1]}) · fort contre ${NATURES[BEATS[EB.nat]][0]}, faible contre ${NATURES[BEATS.indexOf(EB.nat)][0]}`:'Aucune (clan martial)',xl+10,yy+4,12.5,EB.nat>=0?liftC(NATURES[EB.nat][2],.6):'#b89a70',wl-20,'bold',8);y+=66}
 {const yy=wzSumBox(xl,y,wl,74,'STYLE',3);fitT(`Arbre ${STNAME[EB.st]} · Clic G : ${ch.abil[0].n}`,xl+10,yy+4,12.5,'#fff3dc',wl-20,'bold',8);fitT(`${lbl.Space} : ${(ch.dashAb||ch.abil[DASHI]||{}).n||'—'} · ${lbl.KeyQ} : Kawarimi`,xl+10,yy+22,11.5,'#cdb898',wl-20,'normal',8);y+=82}
 {const yy=wzSumBox(xl,y,wl,58,'APPARENCE',6);const L=EB.l;fitT(`${itN(VILLAGES[L.v])} · ${itN(TENUES[L.t])} · ${itN(COIFS[L.c])} · cheveux ${itN(HAIRC[L.h]).toLowerCase()}`,xl+10,yy+4,11.5,'#cdb898',wl-20,'normal',8);y+=66}
 // à droite : jutsu appris par rang et par arbre, barres, vérification
 const cols=wzTabs();let yr=WCT;{const yy=wzSumBox(xr,yr,wr,46+5*24,`JUTSU APPRIS (${EB.k.length})`,4),cw=(wr-44)/cols.length;
  cols.forEach((c,ci)=>fitT(c.n,xr+38+ci*cw,yy+4,10.5,liftC(c.col,.6),cw-6,'bold',8));
  [...RANKO].forEach((r,ri)=>{const y0=yy+12+ri*24;rr({x:xr+10,y:y0,w:20,h:19},5,RANKC[r]);text(r,xr+20,y0+14,11,'#14100a');
   cols.forEach((c,ci)=>{const L=EB.k.filter(id=>JL[id].r===r&&(c.k==='sub'?catType(JL[id].cat)==='famille':JL[id].cat===c.k));const nm=id=>TREES[JL[id].cat].type==='nature'?crN(id).replace(/^[^:]{2,12} : /,''):crN(id);fitT(L.length?L.map(nm).join(', '):(c.k==='sub'?'à choisir !':'—'),xr+38+ci*cw,y0+14,10.5,L.length?'#e8d8bc':c.k==='sub'?'#ff8a7a':'#6a5a48',cw-6,L.length?'normal':'bold',9)})});yr=yy+5*24+22}
 {const nb=EB.bars.length,yy=wzSumBox(xr,yr,wr,32+nb*26,`BARRES (${nb})`,5);EB.bars.forEach((q,i)=>{const B=crBars()[i],y0=yy+i*26;fitT((i===0?'★ ':'')+(i+1)+'. '+q.n,xr+10,y0+5,12,i===0?'#bff0b0':'#f3d9b0',130,'bold',8);
   B.forEach((id,s)=>{const x=xr+150+s*((wr-160)/6),Q={x:x-2,y:y0-12,w:24,h:24};if(id>=0){const J=JL[id];jIcon(x+10,y0,10,catCol(J.cat),J.cat,J.r==='S');if(wzHv(Q))hoverTip('wzsb'+i+':'+s,()=>({t:crN(id),col:liftC(catCol(J.cat),.55),l:[[`${catName(J.cat)} · rang ${J.r} · touche ${s+1}`,'#d8b888']],d:J.d}))}else text('—',x+10,y0+4,10,'#5a6680')})});yr=yy+nb*26+8}
 {const errs=[];for(let i=0;i<WZN-1;i++){const e=wzErr(i);if(e)errs.push([e,'#ff8a7a'])}const w=crSaveWarn();if(w)errs.push([w.split(' · ')[0],'#ffb347']);
  // cadre à la hauteur de son texte (le reste de la colonne reste libre)
  const ok=['✓ Tout est prêt',ED&&ED.k?'« ✔ Enregistrer » garde tes changements sur ce perso.':'« ✔ Enregistrer » range ce ninja dans « Mes ninjas », prêt à jouer.'],
   L=errs.length?errs.flatMap(([e,c])=>wrapL(e,wr-24,FNT(11.5)).slice(0,3).map(l=>[l,c])):wrapL(ok[1],wr-24,FNT(12)).map(l=>[l,'#cfe8c8']),
   R={x:xr,y:yr,w:wr,h:Math.min(Math.max(40,WBOT-yr),(errs.length?14:36)+L.length*15+10)};rr(R,9,errs.length?'rgba(60,24,14,.6)':'rgba(20,46,20,.55)',errs.length?'#c0582a':'#4a8a4a',1.2);
  let yy=yr+20;if(!errs.length){text(ok[0],xr+12,yy+1,14,'#9fe39f','left');yy+=21}
  for(const [l,c] of L){if(yy>R.y+R.h-4)break;fitT(l,xr+12,yy,errs.length?11.5:12,c,wr-24,'normal',9);yy+=15}}}
function wzClickSum(){for(const q of WZSUM)if(inRect(mouse,q.R)){wzGo(q.step);return true}return false}
// ---------- écran ----------
const WZDRAW=[wzDrawId,wzDrawOrig,wzDrawNat,wzDrawStyle,wzDrawJutsu,wzDrawBars,wzDrawLook,wzDrawSum],WZCLICK=[wzClickId,wzClickOrig,wzClickNat,wzClickStyle,wzClickJutsu,wzClickBars,wzClickLook,wzClickSum];
function drawWiz(){const t=performance.now()/1000;
 // clavier : panneau de choix (Échap ferme, flèches défilent), sinon Entrée = suivant, Échap = retour ; étape Barres : survol + 1-6 = poser, clic D = vider
 if(picker!==null){if(pressed.Escape)picker=null;else{const D=pickData(picker);if(D){const G=pickGrid(D);if(pressed.ArrowDown||pressed.PageDown)pickScroll+=pressed.PageDown?G.gh:G.step;if(pressed.ArrowUp||pressed.PageUp)pickScroll-=pressed.PageUp?G.gh:G.step;
  if(D.tabs&&(pressed.ArrowLeft||pressed.ArrowRight)){pickTab=(pickTab+(pressed.ArrowRight?1:-1)+D.tabs.length)%D.tabs.length;pickScroll=0}}}}
 else if(!CONF){if(pressed.Escape){wzPrev();if(scr!=='edit')return drawRoster()}else if(pressed.Enter||pressed.NumpadEnter){wzNext();if(scr!=='edit')return drawRoster()}
  if(WZ.s===5){if(CRH>=0)for(let k=1;k<=BARN;k++)if(pressed['Digit'+k]||pressed['Numpad'+k])crPlace(CRH,k-1);
   if(pressed.rmb){let s0=-1;for(let s=0;s<BARN;s++)if(inRect(mouse,crBarR(s)))s0=s;if(s0<0&&CRH>=0)s0=crB().indexOf(CRH);if(s0>=0)wzBarSlotRm(s0);else for(let i=0;i<EB.bars.length;i++)if(inRect(mouse,crTabR(i)))crBarDel(i)}}
  if(WZ.s===4&&wzTab()==='sub'&&(pressed.ArrowDown||pressed.ArrowUp||pressed.PageDown||pressed.PageUp))WZ.sc+=(pressed.PageDown?300:pressed.PageUp?-300:pressed.ArrowDown?WZRH:-WZRH)}
 if(!ED||!EB)return;
 {const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(10,6,3,.55)');gr.addColorStop(1,'rgba(10,6,3,.2)');g.fillStyle=gr;g.fillRect(0,0,W,H)}
 wzHead();
 // contenu : titre de l'étape, puis l'étape
 g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=14;rr(WZC,12,'rgba(20,14,10,.92)','#6a4426',1.5);g.restore();
 text(`${WZ.s+1} · ${WZS[WZ.s][0]}`,WX,WZC.y+31,21,'#ffb347','left');fitT(WZS[WZ.s][1],WX+190,WZC.y+30,12.5,'#d8b888',WW-200,'normal',9);
 {g.fillStyle='rgba(255,154,58,.45)';g.fillRect(WX,WZC.y+44,WW,1.5)}
 WZDRAW[WZ.s]();
 wzPreview(t);
 // bas : Retour, Aléatoire, message, Suivant / Enregistrer
 {const R=wzBack,h=wzHv(R),dt=edDirty();rr(R,R.h/2,h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)','#c08040',1.5);text(WZ.s?'◀ Retour':dt?'✕ Quitter':'◀ Liste des persos',R.x+R.w/2,R.y+28,15,'#f3d9b0');
  if(h)hoverTip('wzback',()=>({t:WZ.s?'Étape précédente':'Quitter la création',d:WZ.s?`Revient à l'étape « ${WZS[WZ.s-1][0]} » (rien n'est perdu).`:dt?'Revient à la liste sans garder tes changements (une confirmation est demandée).':'Revient à la liste des persos.',f:'Échap'}))}
 if(WZ.s<WZN-1){const R=wzRnd,h=wzHv(R);rr(R,R.h/2,h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)','#8a5a2a',1.5);uiIcon('dice',R.x+26,R.y+R.h/2,9,h?'#fff':'#ffc53a');fitT('Aléatoire · '+WZS[WZ.s][0],R.x+44,R.y+28,14,'#f3d9b0',R.w-54,'bold',10);
  if(h)hoverTip('wzrnd',()=>({t:'Aléatoire',d:['Tire au hasard un nom et un camp.','Tire au hasard une autre origine (clan, sans clan à sub ou à kekkei genkai).','Tire au hasard une autre nature.','Tire au hasard l\'arbre de style et l\'attaque de base.','Tire au hasard les jutsu appris (1 par rang dans chaque arbre, et 1 sub par rang).','Tire au hasard tes barres (tous tes jutsu y sont) et ton dash.','Tire au hasard toute l\'apparence (ton kit ne change pas).'][WZ.s]+' Les autres étapes ne changent pas.'}))}
 {const e=wzErr(WZ.s),msg=performance.now()<CRMT?[CRMSG,CRMC]:e?[e,'#ff8a7a']:[`Entrée : ${WZ.s<WZN-1?'suivant':'enregistrer'} · Échap : ${WZ.s?'retour':'quitter'}${WZ.s===5?' · survol d\'un jutsu + 1-6 : le poser · clic D sur une case : la vider':''}`,'#a89070'];
  const x0=wzRnd.x+wzRnd.w+14,w0=wzNextB.x-14-x0,L=wrapL(msg[0],w0,FNT(12,'bold'));if(L.length<2)fitT(msg[0],x0+w0/2,wzRnd.y+28,12,msg[1],w0,'bold',9,'center');else{fitT(L[0],x0+w0/2,wzRnd.y+18,11.5,msg[1],w0,'bold',8,'center');fitT(L.slice(1).join(' '),x0+w0/2,wzRnd.y+35,11.5,msg[1],w0,'bold',8,'center')}}
 {const R=wzNextB,h=wzHv(R),last=WZ.s===WZN-1,bad=last?[0,1,2,3,4,5,6].some(wzErr):!!wzErr(WZ.s);g.save();g.shadowColor='#ff9a3a';g.shadowBlur=h?20:last?12:4;rr(R,R.h/2,bad?'rgba(120,60,40,.9)':h?'#ffb347':'#ff9a3a','#ffd38a',2);g.restore();
  fitT(last?'✔ ENREGISTRER':'Suivant ▶',R.x+R.w/2,R.y+29,last?18:17,'#1a1008',R.w-20,'bold',11,'center');
  if(h)hoverTip('wznext',()=>last?{t:'Enregistrer',col:bad?'#ff8a7a':'#ffd38a',d:bad?'Une étape est à compléter (point rouge en haut) : '+[0,1,2,3,4,5,6].map(wzErr).filter(Boolean)[0]:ED.k?'Garde ces changements et revient à la liste, ce perso sélectionné.':'Ajoute ce ninja à « Mes ninjas » et revient à la liste, prêt à jouer.',f:'Entrée'}:{t:'Étape suivante : '+WZS[WZ.s+1][0],col:bad?'#ff8a7a':'#ffd38a',d:bad?wzErr(WZ.s):WZS[WZ.s+1][1],f:'Entrée'})}
 if(picker!==null)drawPicker();
 drawConf();drawTip();drawCursor()}
function wizClick(){if(picker!==null)return pickerClick();
 for(let i=0;i<WZN;i++)if(inRect(mouse,wzStepR(i))){if(i<=WZ.max)wzGo(i);else crSay('Étape pas encore ouverte : « Suivant ▶ »','#c8b89a');return true}
 if(inRect(mouse,wzBack)){wzPrev();return true}if(WZ.s<WZN-1&&inRect(mouse,wzRnd)){wzRandom();return true}if(inRect(mouse,wzNextB)){wzNext();return true}
 if(inRect(mouse,WZC))WZCLICK[WZ.s]();return true}
try{cv.addEventListener('wheel',e=>{if(state==='menu'&&scr==='edit'&&picker===null&&!CONF&&(WZ.s===4||WZ.s===3)){WZ.sc=Math.max(0,WZ.sc+e.deltaY*(e.deltaMode?40:1));if(WZ.s===3)WZ.sc=Math.min(WZ.sc,wzStyleMax());e.preventDefault()}},{passive:false})}catch(e){}

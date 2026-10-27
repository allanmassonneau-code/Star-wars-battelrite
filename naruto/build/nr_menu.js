// ---------- Menu : créateur de ninja (apparence + build) ----------
let picker=null; // emplacement dont on choisit le jutsu (liste ouverte)
// lignes de gauche : [libellé, liste, clé] ; le clan a une entrée « Sans clan » (valeur -1), la 2e nature n'existe que sans clan
const CLANL=[['Sans clan','#888']].concat(CLANS),NATL=NATURES.map(n=>[n[0]+' ('+n[1]+')',n[2]]);
const APP=[['Camp',()=>CAMPS,'side'],['Voie',()=>VOIES,'voie'],['Clan',()=>CLANL,'clan'],['Nature',()=>NATL,'nat'],['Village',()=>VILLAGES,'l.v'],['Tenue',()=>TENUES,'l.t'],['Coiffure',()=>COIFS,'l.c'],['Cheveux',()=>HAIRC,'l.h'],['Peau',()=>PEAUX,'l.p'],['Chakra',()=>CHAKRAS,'l.k'],['Accessoire',()=>ACCS,'l.a']];
const getB=k=>k==='clan'?MY.clan+1:k.startsWith('l.')?MY.l[k[2]]:MY[k],setB=(k,v)=>{if(k==='clan')MY.clan=v-1;else if(k.startsWith('l.'))MY.l[k[2]]=v;else MY[k]=v};
const appOff=k=>k==='nat'&&MY.clan===TAIJ;
const stylesOf=b=>STYLES.map((_,i)=>i).filter(i=>styleOk(i,b.clan));
const appRow=i=>({y:398+i*25,l:{x:200,y:383+i*25,w:26,h:21},r:{x:374,y:383+i*25,w:26,h:21}});
const overBudget=()=>kitCost(MY)>BUDGET;
const cycleJ=(s,d)=>{if(!s){const L=stylesOf(MY),i=L.indexOf(MY.j[0]);MY.j[0]=L[(i+d+L.length)%L.length];return}const A=avail(MY,s),i=A.findIndex(j=>j.id===MY.j[s]);MY.j[s]=A[(i+d+A.length)%A.length].id};
const slotRow=s=>({x:428,y:150+s*64,w:812,h:58});
const passRow={x:428,y:150+6*64,w:812,h:40};
let presetI=-1;const presetBtn={x:428,y:640,w:180,h:30};
const nameBtn={x:40,y:150,w:300,h:30},rndBtn={x:348,y:150,w:52,h:30},rndBuildBtn={x:428,y:600,w:180,h:34},fightBtn={x:1030,y:592,w:210,h:48};
const pickRect=(s,i)=>{const cols=2,w=330,h=60;return{x:W/2-w-6+(i%cols)*(w+12),y:150+Math.floor(i/cols)*(h+8),w,h}};
function rebuildMine(){MY=sanitizeBuild(MY);try{localStorage.setItem('nrBuild3',JSON.stringify(MY))}catch(e){}CH.p0=mkNinja(MY);
 if(net.role==='host'){net.ready=false;sendLobby()}else if(isGuest()&&coop()){net.ready=false;netSend({t:'build',b:MY});netSend({t:'ready',v:false})}}
function creatorClick(){
 if(picker!==null){const A=picker?avail(MY,picker).map(j=>j.id):stylesOf(MY);for(let i=0;i<A.length;i++)if(inRect(mouse,pickRect(picker,i))){MY.j[picker]=A[i];rebuildMine();break}picker=null;return true}
 if(inRect(mouse,nameBtn)){const n=prompt('Nom de ton ninja (16 caractères max)',MY.name);if(n!==null){MY.name=n.trim()||MY.name;rebuildMine()}return true}
 if(inRect(mouse,rndBtn)){const r=srnd((Date.now()%2147483647)||7),b=randomBuild(r,MY.side,MY.name);MY.l=b.l;rebuildMine();return true}
 if(inRect(mouse,presetBtn)){presetI=(presetI+1)%PRESETS.length;MY=presetBuild(presetI,MY.name,MY.side);rebuildMine();return true}
 if(inRect(mouse,rndBuildBtn)){MY=randomKit(srnd((Date.now()%2147483647)||7),MY);rebuildMine();return true}
 for(let i=0;i<APP.length;i++){const R=appRow(i),n=APP[i][1]().length,k=APP[i][2];if(appOff(k))continue;
  if(inRect(mouse,R.l)){setB(k,(getB(k)+n-1)%n);rebuildMine();return true}if(inRect(mouse,R.r)){setB(k,(getB(k)+1)%n);rebuildMine();return true}}
 for(let s=0;s<6;s++){const R=slotRow(s);if(inRect(mouse,R)){
  if(mouse.x<R.x+60){cycleJ(s,-1);rebuildMine()}else if(mouse.x>R.x+R.w-50){cycleJ(s,1);rebuildMine()}else picker=s;return true}}
 if(inRect(mouse,passRow)){const n=PASSK.length;MY.pass=mouse.x<passRow.x+60?(MY.pass+n-1)%n:(MY.pass+1)%n;rebuildMine();return true}
 if(!coop()&&inRect(mouse,fightBtn)){if(!overBudget())startMatch('p0');return true}
 return false}
function styleBadge(x,y){g.fillStyle='#e8cfa8';g.beginPath();g.roundRect(x,y,46,18,5);g.fill();text('STYLE',x+23,y+13,10,'#14100a')}
function rankBadge(x,y,J){g.fillStyle=RANKC[J.r];g.beginPath();g.roundRect(x,y,46,18,5);g.fill();text(`${J.r} · ${J.cost}`,x+23,y+13,12,'#14100a')}
function arrowBtn(R,left){const h=inRect(mouse,R);g.fillStyle=h?'#ff9a3a':'rgba(40,30,20,.9)';g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,6);g.fill();text(left?'◀':'▶',R.x+R.w/2,R.y+R.h/2+5,13,h?'#1a1008':'#f3d9b0')}
function btn(R,label,on,col='#ff9a3a'){const h=inRect(mouse,R);g.fillStyle=on?col:h?'rgba(90,60,30,.95)':'rgba(40,28,18,.92)';g.strokeStyle=col;g.lineWidth=1.5;g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,R.h/2);g.fill();g.stroke();text(label,R.x+R.w/2,R.y+R.h/2+5,13,on?'#1a1008':'#f3d9b0')}
function drawMenu(){
 g.save();g.shadowColor='#ff9a3a';g.shadowBlur=18;text('NARUTO · ARÈNE NINJA',W/2,52,42,'#ffb347');g.restore();
 {const b=coopBtn,h=inRect(mouse,b),on=coop()||net.role==='host';g.fillStyle=on?'#7f7':h?'rgba(90,60,30,.95)':'rgba(40,28,18,.9)';g.strokeStyle=on?'#7f7':'#8a5a2a';g.lineWidth=1.5;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,15);g.fill();g.stroke();text(!on?'EN LIGNE':net.role==='host'?`SALON ${net.code||''} · ${lobbyList().length}/${MAXP}`:`EN LIGNE · ${lobbyList().length} joueurs`,b.x+b.w/2,b.y+20,13,on?'#10131c':'#f3d9b0')}
 if(net.role){const m=!coop()?net.status:lobbyList().map(x=>`${who(x)} : ${x.c&&CH[x.c]?CH[x.c].name:'…'}${mode==='arena'?'':x.team?' [B]':' [A]'}${x.ready?' ✓':''}`).join('  ·  ');g.font='normal 12px "Trebuchet MS",system-ui,sans-serif';tfit(m,1222-Math.min(1060,g.measureText(m).width),131,12,'#9f9',1060)}
 for(const b of modeBtns){const on=mode===b.m,h=inRect(mouse,b);g.fillStyle=on?'#ff9a3a':h?'rgba(90,60,30,.95)':'rgba(40,28,18,.9)';g.strokeStyle=on?'#ff9a3a':'#8a5a2a';g.lineWidth=1.5;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,15);g.fill();g.stroke();text(modeLabel(b),b.x+b.w/2,b.y+20,13,on?'#1a1008':'#f3d9b0')}
 text(menuDesc(),W/2,net.role?116:130,13,'#e8cfa8','center','normal');
 const t=performance.now()/1000,ch=CH.p0;
 // --- colonne de gauche : apparence
 g.fillStyle='rgba(20,14,10,.85)';g.strokeStyle='#5a3a1e';g.lineWidth=1;g.beginPath();g.roundRect(30,142,380,560,12);g.fill();g.stroke();
 {const h=inRect(mouse,nameBtn);g.fillStyle=h?'rgba(90,60,30,.6)':'rgba(0,0,0,.25)';g.beginPath();g.roundRect(nameBtn.x,nameBtn.y,nameBtn.w,nameBtn.h,8);g.fill();tfit(MY.name+'  ✎',nameBtn.x+10,nameBtn.y+22,20,ch.side?'#ff9a9a':'#ffd38a',280,'bold')}
 btn(rndBtn,'🎲',false);
 const fake=mkUnit('p0',0,0,ch.side);fake.aim=Math.PI/2+Math.sin(t*.8)*1.1;fake.moving=Math.sin(t*.5)>.3;fake.walk=t*13;fake.swing=0;
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(220,316,50,13,0,0,7);g.fill();
 {g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(220,300,0,220,300,140);gr.addColorStop(0,rgba(ch.look.weapon.col,.16));gr.addColorStop(1,rgba(ch.look.weapon.col,0));g.fillStyle=gr;g.fillRect(80,186,280,150);g.restore()}
 drawChar(fake,220,314,1.6);
 text(`${ch.hp} PV · vitesse ${ch.spd} · puissance ×${ch.pw.toFixed(2)}`,220,340,12,'#e8cfa8','center','normal');
 tfit(ch.desc,220-Math.min(340,(g.font='normal 11px "Trebuchet MS",system-ui,sans-serif',g.measureText(ch.desc).width))/2,356,11,'#b89a70',340);
 APP.forEach(([lab,list,k],i)=>{const R=appRow(i),L=list(),v=getB(k),it=L[v];text(lab,48,R.y,13,'#d8b888','left');
  if(appOff(k)){text('— (taijutsu pur)',236,R.y,12,'#7a6a58','left','normal');return}arrowBtn(R.l,1);arrowBtn(R.r,0);
  const nm=Array.isArray(it)?it[0]:String(it);const col=['l.h','l.p','l.k','nat','clan','nat2'].includes(k)?it[1]:null;
  if(col){g.fillStyle=col;g.beginPath();g.roundRect(234,R.y-11,13,13,3);g.fill()}tfit(nm,col?252:234,R.y,13,k==='nat'||k==='clan'||k==='nat2'?'#ffd38a':'#fff',col?116:134,'bold')});
 // --- colonne de droite : build (6 jutsu + passif)
 for(let s=0;s<6;s++){const R=slotRow(s),ab=ch.abil[s],h=inRect(mouse,R)&&picker===null;
  g.fillStyle=h?'rgba(70,46,24,.95)':'rgba(20,14,10,.85)';g.strokeStyle=ab.ult?'#ffb347':'#5a3a1e';g.lineWidth=ab.ult?2:1;g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,10);g.fill();g.stroke();
  text('◀',R.x+16,R.y+34,15,'#ffb347');text('▶',R.x+R.w-20,R.y+34,15,'#ffb347');
  text(lbl[SLOTS[s]],R.x+40,R.y+22,13,ab.ult?'#ffe81f':'#fff','left');text(SLOTN[s],R.x+40,R.y+40,10,'#b89a70','left','normal');
  const J=s?JL[MY.j[s]]:null,A=s?avail(MY,s):stylesOf(MY);if(J)rankBadge(R.x+160,R.y+7,J);else styleBadge(R.x+160,R.y+7);
  tfit(`${ab.n}${ab.ult?' · ultime':` · ${ab.cd}s`}${ab.charges?` · ${ab.charges} charges`:''}${ab.cast?` · incant. ${ab.cast}s`:''}`,R.x+218,R.y+20,15,ab.ult?'#ffe81f':'#ffd38a',400,'bold');
  text(J?`${catName(J.cat)} · ${A.findIndex(j=>j.id===J.id)+1}/${A.length}`:`${MY.clan>=0?'Clan '+CLANS[MY.clan][0]:'Sans clan'} · ${A.indexOf(MY.j[0])+1}/${A.length}`,R.x+R.w-40,R.y+20,11,J?catCol(J.cat):'#ffd38a','right','normal');
  tfit(ab.d||'',R.x+160,R.y+36,12,'#e8cfa8',590);if(ab.ex)tfit(`EX · ${ab.ex.n} : ${ab.ex.d}`,R.x+160,R.y+51,11,'#d8c060',590)}
 {const R=passRow,ps=PASS[ch.pass],h=inRect(mouse,R)&&picker===null;g.fillStyle=h?'rgba(70,46,24,.95)':'rgba(20,14,10,.85)';g.strokeStyle='#3a6a3a';g.lineWidth=1;g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,10);g.fill();g.stroke();
  text('◀',R.x+16,R.y+26,15,'#9f9');text('▶',R.x+R.w-20,R.y+26,15,'#9f9');text('Passif',R.x+40,R.y+25,13,'#9f9','left');tfit(`${ps[0]} : ${ps[1]}`,R.x+160,R.y+25,13,'#cfe8c0',590,'bold')}
 btn(rndBuildBtn,'🎲 Kit aléatoire',false);btn(presetBtn,'📜 Modèle suivant',false);if(presetI>=0)text('Modèle : '+PRESETS[presetI][0],presetBtn.x,presetBtn.y+50,12,'#ffd38a','left');
 {const c=kitCost(MY),over=c>BUDGET,x=628,y=604;text('Points du kit',x,y+2,12,'#b89a70','left','normal');for(let i=0;i<BUDGET;i++){g.fillStyle=i<c?(over?'#ff5a4a':'#ffb347'):'rgba(255,255,255,.12)';g.fillRect(x+i*13,y+8,11,10)}
  if(c>BUDGET)for(let i=BUDGET;i<c;i++){g.fillStyle='#ff5a4a';g.fillRect(x+i*13,y+8,11,10)}
  text(`${c} / ${BUDGET}`,x+96,y+2,13,over?'#ff6a5a':'#ffd38a','left');if(over)text('Trop de points : choisis des jutsu de rang plus bas',x,y+36,12,'#ff8a7a','left')}
 text('Rangs : D=1 · C=2 · B=3 · A=4 · S=5 points · clique sur un jutsu pour voir la liste',628,666,11,'#b89a70','left','normal');
 if(!coop())btn(fightBtn,overBudget()?'TROP DE POINTS':'COMBATTRE ▶',!overBudget(),overBudget()?'#a55':'#ff9a3a');
 if(isGuest()&&mode!=='arena'){const b=teamBtn,h=inRect(mouse,b);g.fillStyle=h?'#5a3a1e':'#2a1c10';g.strokeStyle=net.myTeam?'#ff6060':'#4db8ff';g.lineWidth=2;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,16);g.fill();g.stroke();text(`ÉQUIPE ${net.myTeam?'B':'A'} (changer)`,b.x+b.w/2,b.y+21,13,'#f3d9b0','center')}
 if(coop()){const b=readyBtn,on=net.ready&&!overBudget();g.fillStyle=on?'#7f7':inRect(mouse,b)?'#ffb347':'rgba(255,154,58,.85)';g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,16);g.fill();text(on?'PRÊT ✓':'PRÊT ?',b.x+b.w/2,b.y+21,13,'#10131c','center')}
 // --- liste complète d'un emplacement
 if(picker!==null){g.fillStyle='rgba(0,0,0,.72)';g.fillRect(0,0,W,H);text(picker?`${lbl[SLOTS[picker]]} · ${SLOTN[picker]} : choisis ton jutsu (${kitCost(MY)}/${BUDGET} points)`:'Style de combat de ton clan (gratuit)',W/2,132,18,'#ffb347');
  (picker?avail(MY,picker):stylesOf(MY).map(i=>({style:i}))).forEach((J,i)=>{const R=pickRect(picker,i),ab=picker?jutsu(J.id):styleAb(J.style),sel=MY.j[picker]===(picker?J.id:J.style),h=inRect(mouse,R);
   g.fillStyle=sel?'rgba(110,70,30,.98)':h?'rgba(70,46,24,.98)':'rgba(24,16,10,.97)';g.strokeStyle=sel?'#ffb347':'#5a3a1e';g.lineWidth=sel?2:1;g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,8);g.fill();g.stroke();
   if(picker){rankBadge(R.x+10,R.y+6,J);text(catName(J.cat),R.x+R.w-10,R.y+18,10,catCol(J.cat),'right','normal')}else{styleBadge(R.x+10,R.y+6);text(STYLES[J.style][4]==='kunai'||STYLES[J.style][4]==='senbon'||STYLES[J.style][4]==='bugs'||STYLES[J.style][4]==='sand'?'Distance':STYLES[J.style][4]==='shadow'||STYLES[J.style][4]==='chain'?'Moyenne portée':'Corps à corps',R.x+R.w-10,R.y+18,10,'#ffd38a','right','normal')}
   tfit(`${ab.n}${ab.ult?'':` · ${ab.cd}s`}${ab.charges?` · ${ab.charges} charges`:''}${ab.cast?` · incant. ${ab.cast}s`:''}`,R.x+62,R.y+20,14,'#ffd38a',R.w-150,'bold');
   tfit(ab.d||'',R.x+12,R.y+37,12,'#e8cfa8',R.w-24);if(ab.ex)tfit(`EX · ${ab.ex.n} : ${ab.ex.d}`,R.x+12,R.y+52,11,'#d8c060',R.w-24)});
  text('Clique ailleurs pour fermer',W/2,710,12,'#b89a70','center','normal')}
 else text(`${lbl.KeyW}${lbl.KeyA}${lbl.KeyS}${lbl.KeyD} bouger · souris viser · ${lbl.KeyF} maintenu = parade · Tab scores · ${lbl.KeyM} son · O options`,W/2,714,12,'#e8cfa8','center','normal');
 drawCursor();
}

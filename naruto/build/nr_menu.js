// ---------- Menu : créateur de ninja (apparence + build) ----------
let picker=null; // emplacement dont on choisit le jutsu (liste ouverte)
const APP=[['Camp',()=>CAMPS,'side'],['Voie',()=>VOIES,'voie'],['Village',()=>VILLAGES,'l.v'],['Tenue',()=>TENUES,'l.t'],['Coiffure',()=>COIFS,'l.c'],['Cheveux',()=>HAIRC,'l.h'],['Peau',()=>PEAUX,'l.p'],['Chakra',()=>CHAKRAS,'l.k'],['Accessoire',()=>ACCS,'l.a']];
const getB=k=>k.startsWith('l.')?MY.l[k[2]]:MY[k],setB=(k,v)=>{if(k.startsWith('l.'))MY.l[k[2]]=v;else MY[k]=v};
const appRow=i=>({y:418+i*29,l:{x:200,y:403+i*29,w:28,h:24},r:{x:372,y:403+i*29,w:28,h:24}});
const slotRow=s=>({x:428,y:150+s*64,w:812,h:58});
const passRow={x:428,y:150+6*64,w:812,h:40};
const nameBtn={x:40,y:150,w:300,h:30},rndBtn={x:348,y:150,w:52,h:30},rndBuildBtn={x:428,y:600,w:180,h:34},fightBtn={x:1030,y:592,w:210,h:48};
const pickRect=(s,i)=>{const n=JP[s].length,cols=2,w=330,h=60;return{x:W/2-w-6+(i%cols)*(w+12),y:150+Math.floor(i/cols)*(h+8),w,h}};
function rebuildMine(){MY=sanitizeBuild(MY);try{localStorage.setItem('nrBuild',JSON.stringify(MY))}catch(e){}CH.p0=mkNinja(MY);
 if(net.role==='host'){net.ready=false;sendLobby()}else if(isGuest()&&coop()){net.ready=false;netSend({t:'build',b:MY});netSend({t:'ready',v:false})}}
function creatorClick(){
 if(picker!==null){for(let i=0;i<JP[picker].length;i++)if(inRect(mouse,pickRect(picker,i))){MY.j[picker]=i;rebuildMine();break}picker=null;return true}
 if(inRect(mouse,nameBtn)){const n=prompt('Nom de ton ninja (16 caractères max)',MY.name);if(n!==null){MY.name=n.trim()||MY.name;rebuildMine()}return true}
 if(inRect(mouse,rndBtn)){const r=srnd((Date.now()%2147483647)||7),b=randomBuild(r,MY.side,MY.name);MY.l=b.l;rebuildMine();return true}
 if(inRect(mouse,rndBuildBtn)){const r=srnd((Date.now()%2147483647)||7),b=randomBuild(r,MY.side,MY.name);MY.j=b.j;MY.pass=b.pass;MY.voie=b.voie;rebuildMine();return true}
 for(let i=0;i<APP.length;i++){const R=appRow(i),n=APP[i][1]().length,k=APP[i][2];
  if(inRect(mouse,R.l)){setB(k,(getB(k)+n-1)%n);rebuildMine();return true}if(inRect(mouse,R.r)){setB(k,(getB(k)+1)%n);rebuildMine();return true}}
 for(let s=0;s<6;s++){const R=slotRow(s);if(inRect(mouse,R)){const n=JP[s].length;
  if(mouse.x<R.x+60){MY.j[s]=(MY.j[s]+n-1)%n;rebuildMine()}else if(mouse.x>R.x+R.w-50){MY.j[s]=(MY.j[s]+1)%n;rebuildMine()}else picker=s;return true}}
 if(inRect(mouse,passRow)){const n=PASSK.length;MY.pass=mouse.x<passRow.x+60?(MY.pass+n-1)%n:(MY.pass+1)%n;rebuildMine();return true}
 if(!coop()&&inRect(mouse,fightBtn)){startMatch('p0');return true}
 return false}
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
 g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(220,340,60,16,0,0,7);g.fill();
 {g.save();g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(220,300,0,220,300,140);gr.addColorStop(0,rgba(ch.look.weapon.col,.16));gr.addColorStop(1,rgba(ch.look.weapon.col,0));g.fillStyle=gr;g.fillRect(80,190,280,200);g.restore()}
 drawChar(fake,220,338,2.3);
 text(`${ch.hp} PV · vitesse ${ch.spd} · puissance ×${ch.pw.toFixed(2)}`,220,376,12,'#e8cfa8','center','normal');
 text('Parade au kunai (F) · attaques de base : '+(ch.abil[0].n),220,392,11,'#b89a70','center','normal');
 APP.forEach(([lab,list,k],i)=>{const R=appRow(i),L=list(),v=getB(k),it=L[v];text(lab,48,R.y,13,'#d8b888','left');arrowBtn(R.l,1);arrowBtn(R.r,0);
  const nm=Array.isArray(it)?it[0]:String(it);const col=k==='l.h'||k==='l.p'||k==='l.k'?it[1]:null;
  if(col){g.fillStyle=col;g.beginPath();g.roundRect(236,R.y-12,14,14,3);g.fill()}tfit(nm,col?256:236,R.y,13,'#fff',col?110:130,'bold')});
 // --- colonne de droite : build (6 jutsu + passif)
 for(let s=0;s<6;s++){const R=slotRow(s),ab=ch.abil[s],h=inRect(mouse,R)&&picker===null;
  g.fillStyle=h?'rgba(70,46,24,.95)':'rgba(20,14,10,.85)';g.strokeStyle=ab.ult?'#ffb347':'#5a3a1e';g.lineWidth=ab.ult?2:1;g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,10);g.fill();g.stroke();
  text('◀',R.x+16,R.y+34,15,'#ffb347');text('▶',R.x+R.w-20,R.y+34,15,'#ffb347');
  text(lbl[SLOTS[s]],R.x+40,R.y+22,13,ab.ult?'#ffe81f':'#fff','left');text(SLOTN[s],R.x+40,R.y+40,10,'#b89a70','left','normal');
  tfit(`${ab.n}${ab.ult?' · ultime':` · ${ab.cd}s`}${ab.charges?` · ${ab.charges} charges`:''}${ab.cast?` · incant. ${ab.cast}s`:''}   (${MY.j[s]+1}/${JP[s].length})`,R.x+160,R.y+20,15,ab.ult?'#ffe81f':'#ffd38a',590,'bold');
  tfit(ab.d||'',R.x+160,R.y+36,12,'#e8cfa8',590);if(ab.ex)tfit(`EX · ${ab.ex.n} : ${ab.ex.d}`,R.x+160,R.y+51,11,'#d8c060',590)}
 {const R=passRow,ps=PASS[ch.pass],h=inRect(mouse,R)&&picker===null;g.fillStyle=h?'rgba(70,46,24,.95)':'rgba(20,14,10,.85)';g.strokeStyle='#3a6a3a';g.lineWidth=1;g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,10);g.fill();g.stroke();
  text('◀',R.x+16,R.y+26,15,'#9f9');text('▶',R.x+R.w-20,R.y+26,15,'#9f9');text('Passif',R.x+40,R.y+25,13,'#9f9','left');tfit(`${ps[0]} : ${ps[1]}`,R.x+160,R.y+25,13,'#cfe8c0',590,'bold')}
 btn(rndBuildBtn,'🎲 Build aléatoire',false);
 text('Clique sur un jutsu pour voir toute la liste · ◀ ▶ pour faire défiler',812,660,11,'#b89a70','center','normal');
 if(!coop())btn(fightBtn,'COMBATTRE ▶',true);
 if(isGuest()&&mode!=='arena'){const b=teamBtn,h=inRect(mouse,b);g.fillStyle=h?'#5a3a1e':'#2a1c10';g.strokeStyle=net.myTeam?'#ff6060':'#4db8ff';g.lineWidth=2;g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,16);g.fill();g.stroke();text(`ÉQUIPE ${net.myTeam?'B':'A'} (changer)`,b.x+b.w/2,b.y+21,13,'#f3d9b0','center')}
 if(coop()){const b=readyBtn,on=net.ready;g.fillStyle=on?'#7f7':inRect(mouse,b)?'#ffb347':'rgba(255,154,58,.85)';g.beginPath();g.roundRect(b.x,b.y,b.w,b.h,16);g.fill();text(on?'PRÊT ✓':'PRÊT ?',b.x+b.w/2,b.y+21,13,'#10131c','center')}
 // --- liste complète d'un emplacement
 if(picker!==null){g.fillStyle='rgba(0,0,0,.72)';g.fillRect(0,0,W,H);text(`${lbl[SLOTS[picker]]} · ${SLOTN[picker]} : choisis ton jutsu`,W/2,132,18,'#ffb347');
  JP[picker].forEach((_,i)=>{const R=pickRect(picker,i),ab=jutsu(picker,i),sel=MY.j[picker]===i,h=inRect(mouse,R);
   g.fillStyle=sel?'rgba(110,70,30,.98)':h?'rgba(70,46,24,.98)':'rgba(24,16,10,.97)';g.strokeStyle=sel?'#ffb347':'#5a3a1e';g.lineWidth=sel?2:1;g.beginPath();g.roundRect(R.x,R.y,R.w,R.h,8);g.fill();g.stroke();
   tfit(`${ab.n}${ab.ult?'':` · ${ab.cd}s`}${ab.charges?` · ${ab.charges} charges`:''}${ab.cast?` · incant. ${ab.cast}s`:''}`,R.x+12,R.y+20,14,'#ffd38a',R.w-24,'bold');
   tfit(ab.d||'',R.x+12,R.y+37,12,'#e8cfa8',R.w-24);if(ab.ex)tfit(`EX · ${ab.ex.n} : ${ab.ex.d}`,R.x+12,R.y+52,11,'#d8c060',R.w-24)});
  text('Clique ailleurs pour fermer',W/2,710,12,'#b89a70','center','normal')}
 else text(`${lbl.KeyW}${lbl.KeyA}${lbl.KeyS}${lbl.KeyD} bouger · souris viser · Maj + jutsu = version EX (25 énergie) · ${lbl.KeyF} maintenu = parade au kunai · Tab scores · ${lbl.KeyM} son · O options`,W/2,714,12,'#e8cfa8','center','normal');
 drawCursor();
}

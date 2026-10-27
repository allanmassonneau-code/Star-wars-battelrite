import re,sys,os
# Génère naruto/index.html à partir du jeu Star Wars : python3 naruto/build/mknaruto.py
SP=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=os.path.abspath(SP+'../..')+'/'
src=open(ROOT+'index.html').read()
s=src
def rep(a,b,n=1):
    global s
    c=s.count(a)
    assert c==n,(a[:90],c)
    s=s.replace(a,b)
def cut(a,b,new,keep_b=True):
    global s
    i=s.index(a);j=s.index(b,i)
    s=s[:i]+new+(s[j:] if keep_b else s[j+len(b):])

# ---------- habillage
rep('<title>Arène Holonet</title>','<title>Arène Ninja</title>')
rep("color-scheme:dark}","color-scheme:dark}\n#net,#opt{background:#1c120a!important;border-color:#6a4426!important}#net h2,#opt h2{color:#ffb347!important}#net button,#optB{background:#ff9a3a}#optB{color:#1a1008!important;background:#ffb347!important;border-color:#8a5a2a!important}")
rep('<label>Holocron de soin (arène) <input type="checkbox" id="cOrb"></label>','<label>Pilule du soldat (arène) <input type="checkbox" id="cOrb"></label>')
rep("<p>Jusqu'à 8 joueurs.","<p>Jusqu'à 8 ninjas.")
rep("'swOpt'","'nrOpt'",2)
rep("'swCfg'","'nrCfg'",2)
rep("'swarena-'","'nrarena-'",2)
# ---------- son : pas de fichiers Star Wars, bruitages synthétisés façon ninja
rep("// ---------- Son : vrais bruitages Star Wars (dossier sounds/), repli synthétisé si absents ----------","// ---------- Son : bruitages synthétisés (kunai, chakra, explosions) ----------")
s=re.sub(r"const SND_N=\{[^}]*\};","const SND_N={};",s,count=1)
s=re.sub(r"const VOICES=\[[^\]]*\];","const VOICES=[];",s,count=1)
rep(" saber:()=>{osc('sawtooth',150,92,.38,.06,{lp:1500,lp2:300,rev:1});osc('sawtooth',153,94,.38,.045,{lp:1200,lp2:280,detune:14});nz(.26,.05,{type:'bandpass',f0:700,f1:2600,q:.9})},",
    " saber:()=>{nz(.22,.09,{type:'bandpass',f0:500,f1:2600,q:1.1});osc('triangle',900,500,.12,.02,{delay:.05})},")
rep(" blaster:()=>{osc('sawtooth',2100,130,.2,.045,{sweep:.17,bp:1300,q:1.4,rev:1});osc('sine',2600,260,.16,.03,{delay:.06,rev:1})},",
    " blaster:()=>{nz(.13,.07,{type:'highpass',f0:2600,f1:5200});osc('sine',3200,2600,.18,.02,{delay:.03,rev:1})},")
rep(" ignite:()=>{osc('sawtooth',38,140,.7,.07,{lp:500,lp2:2200,sweep:.35,rev:1});osc('sawtooth',39,142,.7,.05,{lp:400,lp2:1800,sweep:.35,detune:20});nz(.25,.06,{type:'highpass',f0:3000,f1:1200})},",
    " ignite:()=>{osc('sine',196,190,1.4,.12,{rev:1});osc('sine',392,380,1.1,.05,{rev:1});osc('triangle',587,560,.9,.03,{rev:1})},")
rep(" deflect:()=>{osc('square',2600,1700,.13,.03,{bp:2600,q:6,rev:1});","  deflect:()=>{osc('triangle',3400,3000,.25,.04,{rev:1});osc('square',2600,1700,.13,.02,{bp:2600,q:6,rev:1});")
# ---------- persos : les kits Star Wars deviennent la réserve de jutsu (SRC)
rep("const CH={\n","const SRC={\n")
rep("for(const k in BAL){const [hp,pw,spd]=BAL[k];Object.assign(CH[k],{hp,pw,spd})}","for(const k in BAL){const [hp,pw,spd]=BAL[k];Object.assign(SRC[k],{hp,pw,spd})}")
rep("const HEROES=Object.keys(CH).filter(k=>!CH[k].trooper);",open(SP+'nr_ninja.js').read())
rep("playerChamp='luke',aiChamp='vader'","playerChamp='p0',aiChamp='b20'")
rep(",hover='luke';",",hover='p0';")
rep("const saberCol=u=>u.ch.look.weapon.col||'#ccc';\nconst canBlock=u=>u.ch.look.weapon.t==='saber';",
    "const saberCol=u=>u.ch.look.weapon.col||'#ccc';\nconst canBlock=u=>u.ch.look.weapon.t==='saber'||u.ch.look.weapon.t==='kunai';")
# tirs : couleur du chakra du lanceur
s=re.sub(r"const boltCol=\(u,c\)=>[^;]*;","const boltCol=(u,c)=>c==='#ff4a3a'||c==='#ff3a3a'?(u.ch&&u.ch.look.weapon.col||c):c;",s,count=1)
# ---------- textes
rep("banner={s:'Un holocron apparaît au centre',t:1.8}","banner={s:'Une pilule du soldat apparaît au centre',t:1.8}")
rep("say(u,'+30 HOLOCRON','#6f9')","say(u,'+30 PILULE','#6f9')")
rep("text(`${side?'Empire':'Alliance'}${team===player.team?' (ton camp)':''}`","text(`${CAMPS[side]}${team===player.team?' (ton camp)':''}`")
rep("nA=side?'Empire':'Alliance',nB=side?'Alliance':'Empire';","nA=CAMPS[side],nB=CAMPS[1-side];")
rep("(win===light?'La Force est avec toi.':'Le côté obscur l\\'emporte…')","(win===light?'La Volonté du Feu l\\'emporte !':'L\\'Akatsuki triomphe…')")
rep("Ton adversaire sera un personnage du camp opposé","Ton adversaire sera un ninja du camp opposé")
rep("`${CFG.bsize} personnages contre ${CFG.bsize}","`${CFG.bsize} ninjas contre ${CFG.bsize}")
# ---------- menu : créateur de ninja
cut("// ---------- Menu : mode + panel de personnages ----------","function bar(x,y,w,h,v,col,right)",open(SP+'nr_menu.js').read())
rep("const coopBtn={x:1040,y:76,w:158,h:30},readyBtn={x:1052,y:550,w:158,h:32},teamBtn={x:880,y:550,w:160,h:32};",
    "const coopBtn={x:1040,y:76,w:158,h:30},readyBtn={x:1060,y:598,w:180,h:36},teamBtn={x:868,y:598,w:180,h:36};")
rep("cards.forEach(c=>{if(inRect(mouse,c)){if(takenBy(c.c))return;if(isGuest()){net.mate=c.c;net.ready=false;netSend({t:'hero',c:c.c})}else if(coop()){net.myPick=c.c;net.ready=false;sendLobby()}else startMatch(c.c)}});",
    "if(creatorClick()){pressed.lmb=0}")
# ---------- en ligne : chacun envoie son build, l'hôte le diffuse dans le salon
rep("function lobbyList(){return net.role==='host'?[{id:0,c:net.myPick||null,ready:!!net.ready,team:0}].concat(livePeers().map(p=>({id:p.id,c:p.c,ready:!!p.ready,team:p.team}))):net.role==='guest'?net.lobby:[]}",
    "function lobbyList(){return net.role==='host'?[{id:0,c:'p0',ready:!!net.ready,team:0,b:MY}].concat(livePeers().map(p=>({id:p.id,c:p.c,ready:!!p.ready,team:p.team,b:p.b}))):net.role==='guest'?net.lobby:[]}")
rep("   if(d.t==='hero'&&CH[d.c]&&!CH[d.c].trooper&&!lobbyList().some(x=>x.id!==P.id&&x.c===d.c)){P.c=d.c;P.ready=false;sendLobby()}\n   else if(d.t==='hero')sendLobby();",
    "   if(d.t==='build'){P.b=sanitizeBuild(d.b);P.c='p'+P.id;CH[P.c]=mkNinja(P.b);P.ready=false;sendLobby()}")
rep("net.lobby=d.P||[];const me=net.lobby.find(x=>x.id===net.myId);",
    "net.lobby=d.P||[];for(const x of net.lobby)if(x.b&&x.c)CH[x.c]=mkNinja(x.b);const me=net.lobby.find(x=>x.id===net.myId);")
rep("if(d.id)net.myId=d.id}","if(d.id){net.myId=d.id;netSend({t:'build',b:MY})}}")
rep("c.on('open',()=>{setStat(`Connecté au salon ${code}.","c.on('open',()=>{netSend({t:'build',b:MY});setStat(`Connecté au salon ${code}.")
rep("function hostGame(){if(noPeer())return;netReset();","function hostGame(){if(noPeer())return;netReset();net.myPick='p0';")
rep("Tu:turrets.map(t=>pickK(t,['x','y','t','team','col','aim','big']))","Tu:turrets.map(t=>Object.assign(pickK(t,['x','y','t','team','col','aim','big','follow']),{oc:t.owner&&t.owner.c,follow:!!t.follow}))")
# ---------- rendu : décor, tête de ninja, kunai, manteau Akatsuki
rep("function drawSky(){",open(SP+'nr_draw.js').read()+"\nfunction drawSkyOld(){")
rep("function drawFloor(x0,y0,x1,y1,step){\n const tl=P(x0,y0),tr=P(x1,y0),br=P(x1,y1),bl=P(x0,y1);\n const fg=g.createLinearGradient(0,tl.y,0,bl.y);fg.addColorStop(0,'#141a26');","function drawFloorOld(x0,y0,x1,y1,step){\n const tl=P(x0,y0),tr=P(x1,y0),br=P(x1,y1),bl=P(x0,y1);\n const fg=g.createLinearGradient(0,tl.y,0,bl.y);fg.addColorStop(0,'#141a26');")
rep("function backWall(x0,x1,y){const B2=70,a=P(x0,y),b=P(x1,y),up=(p,h)=>({x:p.x,y:p.y-h*p.s});\n const wg=g.createLinearGradient(0,a.y-B2,0,a.y);wg.addColorStop(0,'#1b2233');","function backWallOld(x0,x1,y){const B2=70,a=P(x0,y),b=P(x1,y),up=(p,h)=>({x:p.x,y:p.y-h*p.s});\n const wg=g.createLinearGradient(0,a.y-B2,0,a.y);wg.addColorStop(0,'#1b2233');")
rep("function drawObst(pl){\n const p=P(pl.x,pl.y),rx=pl.r*p.s,ry=rx*K,h=(pl.rock?60:105)*p.s;","function drawObstOld(pl){\n const p=P(pl.x,pl.y),rx=pl.r*p.s,ry=rx*K,h=(pl.rock?60:105)*p.s;")
rep("function drawHolo(x,y,big){const t=performance.now()/300,p=P(x,y,30+Math.sin(t)*6);g.fillStyle='rgba(60,255,150,.15)'","function drawHoloOld(x,y,big){const t=performance.now()/300,p=P(x,y,30+Math.sin(t)*6);g.fillStyle='rgba(60,255,150,.15)'")
rep("function drawTurret(tu){const p=P(tu.x,tu.y),s=p.s*(tu.big?1.3:1)","function drawTurretOld(tu){const p=P(tu.x,tu.y),s=p.s*(tu.big?1.3:1)")
rep("function drawWall(w){const p=P(w.x,w.y),rx=w.r*p.s,h=60*p.s,col=","function drawWallOld(w){const p=P(w.x,w.y),rx=w.r*p.s,h=60*p.s,col=")
# arène : bords en bois, lignes chaudes
rep("poly([tl,bl,up(bl,40),up(tl,70)],'#161c2a');poly([tr,br,up(br,40),up(tr,70)],'#161c2a');","poly([tl,bl,up(bl,40),up(tl,70)],'#4a2e18');poly([tr,br,up(br,40),up(tr,70)],'#4a2e18');")
rep("for(let x=A.x+150;x<A.x+A.w;x+=200){const a=P(x,A.y,56),b=P(x+80,A.y,56);g.fillStyle='rgba(120,180,255,.18)';g.fillRect(a.x,a.y,b.x-a.x,10)}","")
s=s.replace("g.save();g.shadowColor='#3a7bd5';g.shadowBlur=14;g.strokeStyle='#2c4a78';","g.save();g.shadowColor='#8a5a2a';g.shadowBlur=10;g.strokeStyle='#6a4426';")
rep("cg.addColorStop(0,'rgba(90,120,170,.12)');cg.addColorStop(1,'rgba(90,120,170,0)');","cg.addColorStop(0,'rgba(200,160,90,.16)');cg.addColorStop(1,'rgba(200,160,90,0)');")
# tête de ninja
rep("  case'none':break;","""  case'ninja':{circ(hx,hy,11,fl?'#fff':h.skin);const hc=h.hair;g.fillStyle=hc;
   if(h.style!=='chauve'){g.beginPath();if(back)g.arc(hx,hy,11.5,0,7);else g.arc(hx,hy-1,11.5,Math.PI*1.05,Math.PI*1.95);g.fill()}
   if(h.style==='pics')for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(hx+i*5-4,hy-6);g.lineTo(hx+i*6.5,hy-21+Math.abs(i)*3);g.lineTo(hx+i*5+4,hy-6);g.fill()}
   if(h.style==='lisse'){g.fillRect(hx-12.5,hy-4,4,17);g.fillRect(hx+8.5,hy-4,4,17);if(back)g.fillRect(hx-11,hy,22,15)}
   if(h.style==='queue'){circ(hx-fx*8,hy-13,4,hc);g.beginPath();g.moveTo(hx-fx*8-3,hy-15);g.lineTo(hx-fx*11+(rnd()-.5),hy-26);g.lineTo(hx-fx*8+3,hy-15);g.fill()}
   if(h.style==='chignons'){circ(hx-11,hy-9,5,hc);circ(hx+11,hy-9,5,hc)}
   g.fillStyle=h.band;g.fillRect(hx-11.6,hy-8,23.2,4.5);
   if(!back){g.fillStyle='#c9ced8';g.fillRect(ex-6,hy-9,12,6.5);g.strokeStyle='#4a4f5a';g.lineWidth=1;g.beginPath();
    switch(h.vil){case 0:g.arc(ex,hy-5.8,2,0,5.2);g.moveTo(ex+2,hy-5.8);g.lineTo(ex+4,hy-7.5);break;case 1:g.moveTo(ex-3,hy-8);g.lineTo(ex+3,hy-3.5);g.moveTo(ex+3,hy-8);g.lineTo(ex-3,hy-3.5);break;
     case 2:for(let k=0;k<4;k++){g.moveTo(ex-3+k*2,hy-8);g.lineTo(ex-3+k*2,hy-3.5)}break;case 3:g.arc(ex-1.5,hy-5.5,1.6,0,7);g.moveTo(ex+3.4,hy-5.5);g.arc(ex+1.8,hy-5.5,1.6,0,7);break;
     case 4:g.moveTo(ex-3,hy-3.5);g.lineTo(ex-1,hy-8);g.lineTo(ex+1,hy-3.5);g.lineTo(ex+3,hy-8);break;case 5:g.arc(ex-1,hy-4.6,1.4,0,7);g.moveTo(ex+.4,hy-4.6);g.lineTo(ex+.4,hy-8.4);break;
     default:g.arc(ex,hy-5.8,2,0,5.2);g.stroke();g.strokeStyle='#b22';g.lineWidth=1.4;g.beginPath();g.moveTo(ex-6,hy-6);g.lineTo(ex+6,hy-6)}g.stroke()}
   else{g.fillStyle=h.band;g.fillRect(hx-3,hy-5,2.5,10);g.fillRect(hx+1,hy-5,2.5,9)}
   eyes('#222');
   if(!back){if(h.acc==='masque'){g.fillStyle='#2a3550';g.beginPath();g.moveTo(ex-10,hy+2);g.lineTo(ex+10,hy+2);g.lineTo(ex+8,hy+10);g.lineTo(ex-8,hy+10);g.fill()}
    if(h.acc==='moust'){g.strokeStyle='#5a3a22';g.lineWidth=.9;for(const sx of[-1,1])for(let k=0;k<3;k++){g.beginPath();g.moveTo(ex+sx*4,hy+4+k*1.6);g.lineTo(ex+sx*9,hy+3+k*2.2);g.stroke()}}
    if(h.acc==='marques'){g.fillStyle='#c22';for(const sx of[-1,1]){g.beginPath();g.moveTo(ex+sx*4,hy+3);g.lineTo(ex+sx*7,hy+3);g.lineTo(ex+sx*5.5,hy+8);g.fill()}}
    if(h.acc==='lunettes'){g.fillStyle='rgba(30,30,40,.85)';g.fillRect(ex-7,hy,5,3.5);g.fillRect(ex+2,hy,5,3.5);g.fillRect(ex-2,hy+1,4,1)}}
   break}
  case'none':break;""")
# kunai en main
rep(" if(w.t==='none')return;"," if(w.t==='none')return;\n if(w.t==='kunai'){if(u.saberOut>0||u.dead)return;const act=u.swing>0||u.block||u.cast;g.save();g.translate(hx,hy);g.rotate(Math.atan2(uy,ux)+(u.block?-1.2:0));\n  if(act){g.shadowColor=w.col;g.shadowBlur=10*RS}g.fillStyle='#3a3a44';g.fillRect(-7,-1.5,8,3);g.strokeStyle='#3a3a44';g.lineWidth=1.2;g.beginPath();g.arc(-9,0,2.4,0,7);g.stroke();\n  g.fillStyle=act?w.col:'#c8ccd4';g.beginPath();g.moveTo(1,-3.6);g.lineTo(15,0);g.lineTo(1,3.6);g.fill();g.restore();\n  if(u.cast){g.fillStyle=rgba(w.col,.35+rnd()*.3);g.beginPath();g.arc(-hx*.5,hy+2,5+rnd()*3,0,7);g.fill()}return}")
# nuages rouges de l'Akatsuki
rep(" if(L.robe)poly([{x:-12,y:-40},{x:12,y:-40},{x:17+step*2,y:-6},{x:-17+step*2,y:-6}],fl?'#fff':L.robe);",
    " if(L.robe)poly([{x:-12,y:-40},{x:12,y:-40},{x:17+step*2,y:-6},{x:-17+step*2,y:-6}],fl?'#fff':L.robe);\n if(L.clouds&&!fl)for(const [cx,cy] of back?[[-5,-30],[6,-14]]:[[-8,-12],[7,-26]]){g.fillStyle='#fff';g.beginPath();g.ellipse(cx,cy,6.5,3.6,0,0,7);g.fill();g.fillStyle='#c0202a';g.beginPath();g.ellipse(cx,cy,5.3,2.6,0,0,7);g.fill()}")
# indices et bannières
rep("Choisis ton héros.`","Crée ton ninja puis clique PRÊT.`")
open(ROOT+'naruto/index.html','w').write(s)
print('ok',len(s))

import re,sys,os
# Génère naruto/index.html à partir du jeu Star Wars : python3 naruto/build/mknaruto.py
SP=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=os.path.abspath(SP+'../..')+'/'
src=open(ROOT+'starwars/index.html').read()
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
rep("color-scheme:dark}","color-scheme:dark}\n#net,#opt{background:#1c120a!important;border-color:#6a4426!important}#net h2,#opt h2{color:#ffb347!important}#net button,#optB{background:#ff9a3a}#backB{background:#1c120acc!important;border-color:#6a4426!important;color:#f3d9b0!important}#optB{color:#1a1008!important;background:#ffb347!important;border-color:#8a5a2a!important}")
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
    "   if(d.t==='build'){P.b=sanitizeBuild(d.b,true);P.c='p'+P.id;CH[P.c]=mkNinja(P.b,true);P.ready=false;sendLobby()}")
rep("net.lobby=d.P||[];const me=net.lobby.find(x=>x.id===net.myId);",
    "net.lobby=d.P||[];for(const x of net.lobby)if(x.b&&x.c)CH[x.c]=mkNinja(x.b,true);const me=net.lobby.find(x=>x.id===net.myId);")
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
rep("if(coop()&&inRect(mouse,readyBtn)&&(isGuest()?net.mate:net.myPick)){","if(coop()&&inRect(mouse,readyBtn)&&(isGuest()?net.mate:net.myPick)&&!overBudget()){")

# ---------- effets visuels ninja : chaque jutsu marque ce qu'il crée avec son élément (vfx)
rep("function drawProj(p){",open(SP+'nr_vfx.js').read()+"\nfunction drawProjOld(p){")
rep("function sparks(x,y,col,n){if(net.role==='host'&&coop()){if(net.ev.sp.length<200)net.ev.sp.push([Math.round(x),Math.round(y),col,n]);}for(let i=0;i<n;i++){const a=rnd()*7,s=80+rnd()*260;fx.push({x,y,z:20+rnd()*20,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:.5,m:.5,col,r:2+rnd()*2})}}",
    "function sparks(x,y,col,n,v){v=v||VFX;if(net.role==='host'&&coop()){if(net.ev.sp.length<200)net.ev.sp.push([Math.round(x),Math.round(y),col,n,v]);}for(let i=0;i<n;i++){const a=rnd()*7,s=(v==='smoke'||v==='leaf'?40:80)+rnd()*(v==='smoke'||v==='leaf'?120:260);fx.push({x,y,z:20+rnd()*20,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:v?.7:.5,m:v?.7:.5,col,r:2+rnd()*2,vfx:v})}}")
rep("function ring(x,y,r,col){if(near(x,y))fx.push({x,y,ring:r,t:.35,m:.35,col})}","function ring(x,y,r,col){if(near(x,y))fx.push({x,y,ring:r,t:.35,m:.35,col,vfx:VFX})}")
rep("const n0=projs.length;ab.f(u,a,td,ab.P||{});CUR=null;",
    "VFX=ab.vfx||null;const f0=fx.length,z0=zones.length,fi0=fields.length,te0=tethers.length,tr0=traps.length,n0=projs.length;ab.f(u,a,td,ab.P||{});CUR=null;\n if(VFX)for(const [L,i0] of[[fx,f0],[zones,z0],[fields,fi0],[tethers,te0],[traps,tr0],[projs,n0]])for(let i=i0;i<L.length;i++)L[i].vfx=L[i].vfx||VFX;VFX=null;")
rep("function explode(p){p.boom=1;","function explode(p){const V0=VFX;VFX=p.vfx||V0;const fi0=fields.length;p.boom=1;")
rep("if(near(p.x,p.y)){sparks(p.x,p.y,p.col,24);shake=Math.max(shake,.2);SFX.boom()}}","if(near(p.x,p.y)){sparks(p.x,p.y,p.col,24);shake=Math.max(shake,.2);SFX.boom()}for(let i=fi0;i<fields.length;i++)fields[i].vfx=fields[i].vfx||VFX;VFX=V0}")
rep("sparks(p.x,p.y,p.col,4)","sparks(p.x,p.y,p.col,4,p.vfx)")
rep("z.t-=dt;if(z.t<=0){z.done=1;EX=z.ex;aoe(","z.t-=dt;if(z.t<=0){z.done=1;EX=z.ex;VFX=z.vfx||null;aoe(")
rep("if(near(z.x,z.y)){SFX.zap();SFX.boom();shake=Math.max(shake,.25);\n  for(let i=0;i<4;i++)fx.push({bolt:2,x:z.x+(rnd()-.5)*z.r,y:z.y+(rnd()-.5)*z.r*.8,t:.3,m:.3,col:z.col})}}}\n zones=zones.filter(z=>!z.done);",
    "if(near(z.x,z.y)){if(!z.vfx||z.vfx==='lightning')SFX.zap();SFX.boom();shake=Math.max(shake,.25);\n  if(!z.vfx||z.vfx==='lightning')for(let i=0;i<4;i++)fx.push({bolt:2,x:z.x+(rnd()-.5)*z.r,y:z.y+(rnd()-.5)*z.r*.8,t:.3,m:.3,col:z.col,vfx:z.vfx});else{sparks(z.x,z.y,z.col,22);fx.push({x:z.x,y:z.y,ring:z.r,t:.45,m:.45,col:z.col,vfx:z.vfx})}}}}\n VFX=null;zones=zones.filter(z=>!z.done);")
rep("tr.t=0;EX=tr.ex;aoe(","tr.t=0;EX=tr.ex;VFX=tr.vfx||null;aoe(")
rep("if(nearMe(tr.x,tr.y))SFX.boom();break}}","if(nearMe(tr.x,tr.y))SFX.boom();VFX=null;break}}")
# rendu
rep("for(const f of fx){if(!f.ring&&!f.swing)continue;if(!near(f.x,f.y))continue;g.globalAlpha=f.t/f.m;g.strokeStyle=f.col;g.lineWidth=f.swing?6:4;\n  if(f.ring)gEll(f.x,f.y,f.ring*(1.1-f.t/f.m*.6));else gEll(f.x,f.y,f.range,f.a-f.arc/2,f.a+f.arc/2);g.stroke()}g.globalAlpha=1;",
    "for(const f of fx){if(!f.ring&&!f.swing)continue;if(!near(f.x,f.y))continue;g.globalAlpha=f.t/f.m;drawRingSwing(f)}g.globalAlpha=1;")
rep("for(const f of fx){if(f.beam&&near(f.x,f.y)){const a=P(f.x,f.y,30),b=P(f.x2,f.y2,30);g.globalAlpha=f.t/f.m;g.lineCap='round';g.strokeStyle=f.col;g.lineWidth=f.w*a.s;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle='#fff';g.lineWidth=Math.max(1,f.w*a.s*.3);g.stroke()}",
    "for(const f of fx){if(f.beam&&near(f.x,f.y))drawBeamN(f);")
rep("drawBolt(h.x,h.y,e.x,e.y,i%2?'#fff':f.col)","drawBolt(h.x,h.y,e.x,e.y,i%2?'#fff':vcol(f.vfx==='chakra'?null:f.vfx,f.col))")
rep("const p=P(f.x,f.y,f.z??20);g.globalAlpha=f.t/f.m;g.fillStyle=f.col;g.beginPath();g.arc(p.x,p.y,f.r*p.s,0,7);g.fill()}g.globalAlpha=1;","const p=P(f.x,f.y,f.z??20);g.globalAlpha=f.t/f.m;drawPart(f,p)}g.globalAlpha=1;")
rep("for(const p of projs)if(near(p.x,p.y))glow(p.x,p.y,p.rocket?90:45,p.col,.3);","for(const p of projs)if(near(p.x,p.y)&&!DARKV[p.vfx])glow(p.x,p.y,p.rocket?90:45,p.vfx&&p.vfx!=='chakra'?vcol(p.vfx,p.col):p.col,.3);")
rep("for(const f of fields){if(!near(f.x,f.y))continue;g.fillStyle=rgba(f.col,","for(const f of fields){if(!near(f.x,f.y))continue;if(drawFieldN(f,t))continue;g.fillStyle=rgba(f.col,")
rep("for(const z of zones){if(!near(z.x,z.y))continue;const k=1-z.t/z.m;g.fillStyle=rgba(z.col,.12);gEll(z.x,z.y,z.r);g.fill();g.fillStyle=rgba(z.col,.3);gEll(z.x,z.y,z.r*k);g.fill();g.strokeStyle=z.col;",
    "for(const z of zones){if(!near(z.x,z.y))continue;const k=1-z.t/z.m,zc=z.vfx&&z.vfx!=='chakra'?vcol(z.vfx,z.col):z.col;g.fillStyle=rgba(DARKV[z.vfx]?'#101014':zc,.12);gEll(z.x,z.y,z.r);g.fill();g.fillStyle=rgba(DARKV[z.vfx]?'#101014':zc,.3);gEll(z.x,z.y,z.r*k);g.fill();g.strokeStyle=zc;")
rep("const a=P(te.a.x,te.a.y,40),b=P(te.b.x,te.b.y,40),k=te.t/te.m;g.strokeStyle=te.col;","const a=P(te.a.x,te.a.y,40),b=P(te.b.x,te.b.y,40),k=te.t/te.m;g.strokeStyle=te.vfx&&te.vfx!=='chakra'?vcol(te.vfx,te.col):te.col;")
# réseau : l'élément voyage avec les objets
rep("const PK=['x','y','vx','vy','r','col',","const PK=['vfx','x','y','vx','vy','r','col',")
rep(",ZK=['x','y','r','t','m','col'];",",ZK=['x','y','r','t','m','col','vfx'];")
rep("Fi:fields.map(f=>pickK(f,['x','y','r','t','m','team','col','heal','dps','slow','pet','spinner','dome']))","Fi:fields.map(f=>pickK(f,['x','y','r','t','m','team','col','heal','dps','slow','pet','spinner','dome','vfx']))")
rep("Te:tethers.map(t=>[units.indexOf(t.a),units.indexOf(t.b),rd(t.t),t.m,t.col])","Te:tethers.map(t=>[units.indexOf(t.a),units.indexOf(t.b),rd(t.t),t.m,t.col,t.vfx])")
rep("tethers=(s.Te||[]).map(([a,b,t,m,col])=>({a:units[a],b:units[b],t,m,col}))","tethers=(s.Te||[]).map(([a,b,t,m,col,vfx])=>({a:units[a],b:units[b],t,m,col,vfx}))")
rep("for(const [x,y,c,k] of s.ev.sp||[])if(nearMe(x,y))sparks(x,y,c,k);","for(const [x,y,c,k,v] of s.ev.sp||[])if(nearMe(x,y))sparks(x,y,c,k,v);")

# ---------- grosse passe : auras, annonces d'ultime, mudras, sons par élément, chakra, cartes, décors de jutsu
rep(" if(VFX)for(const [L,i0] of[[fx,f0],[zones,z0],[fields,fi0],[tethers,te0],[traps,tr0],[projs,n0]])for(let i=i0;i<L.length;i++)L[i].vfx=L[i].vfx||VFX;VFX=null;",
    " if(VFX)for(const [L,i0] of[[fx,f0],[zones,z0],[fields,fi0],[tethers,te0],[traps,tr0],[projs,n0]])for(let i=i0;i<L.length;i++)L[i].vfx=L[i].vfx||VFX;VFX=null;\n for(let i=z0;i<zones.length;i++)zones[i].jn=zones[i].jn||ab.n;\n if(ab.vfx&&AURK.some((k,i)=>(u[k]||0)>AB0[i]+.05))u.auraV=ab.vfx;\n if(ab.ult){say(u,ab.n+' !',u.ch.look.weapon.col||'#ffb347');S('roar',u);if(u===player)cutin={s:ab.n,t:1.4,col:u.ch.look.weapon.col,who:u.ch.name};else if(net.role==='host'&&u.ctrl==='remote')net.ev.ci.push([units.indexOf(u),ab.n])}")
rep("VFX=ab.vfx||null;const f0=fx.length,","VFX=ab.vfx||null;const AB0=AURK.map(k=>u[k]||0),f0=fx.length,")
s=s.replace("{fx:[],txt:[],snd:[],sp:[]}","{fx:[],txt:[],snd:[],sp:[],ci:[]}")
rep("for(const [x,y,c,k,v] of s.ev.sp||[])if(nearMe(x,y))sparks(x,y,c,k,v);","for(const [x,y,c,k,v] of s.ev.sp||[])if(nearMe(x,y))sparks(x,y,c,k,v);for(const [i,n] of s.ev.ci||[])if(i===s.you&&units[i])cutin={s:n,t:1.4,col:units[i].ch.look.weapon.col,who:units[i].ch.name};")
rep("if(u.regenB>0)gain(u,10*dt,u);","if(u.auraV&&!auraOn(u))u.auraV=null;if(u.regenB>0)gain(u,10*dt,u);")
rep("const UK=['c',","const UK=['auraV','c',")
rep(" drawChar(u,p.x,p.y,S2);"," const aur=u.auraV&&auraOn(u);if(aur)drawAura(u,p,S2,sk);drawChar(u,p.x,p.y,S2);if(aur)drawAura(u,p,S2,sk,1);")
rep(" drawHud();\n if(keys.Tab"," drawHud();drawCutin();\n if(keys.Tab")
# zones : décor des jutsu marquants (bûche, crapaud, Rasen-shuriken…)
rep("const PK=['vfx',","const PK=['vfx',")
rep(",ZK=['x','y','r','t','m','col','vfx'];",",ZK=['x','y','r','t','m','col','vfx','jn'];")
rep("g.strokeStyle=zc;g.lineWidth=2;gEll(z.x,z.y,z.r);g.stroke()}","g.strokeStyle=zc;g.lineWidth=2;gEll(z.x,z.y,z.r);g.stroke();if(z.jn)drawZoneDeco(z)}")
# mudras pendant l'incantation
rep("if(u.cast){g.fillStyle=rgba(w.col,.35+rnd()*.3);g.beginPath();g.arc(-hx*.5,hy+2,5+rnd()*3,0,7);g.fill()}return}",
    "if(u.cast){const t=performance.now()/90;g.strokeStyle=L.arm;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(-5,-33);g.lineTo(fx0(u)*3,-27+Math.sin(t)*1.5);g.moveTo(5,-33);g.lineTo(fx0(u)*3,-27-Math.sin(t)*1.5);g.stroke();\n  g.save();g.globalCompositeOperation='lighter';g.fillStyle=rgba(w.col,.45+rnd()*.3);g.beginPath();g.arc(fx0(u)*3,-27,6+rnd()*3,0,7);g.fill();g.strokeStyle=rgba(w.col,.8);g.lineWidth=1.2;g.beginPath();g.arc(fx0(u)*3,-27,11,t*.5,t*.5+4.5);g.stroke();g.restore()}return}")
rep("function drawWeapon(u,a,L){","const fx0=u=>Math.cos(u.aim);\nfunction drawWeapon(u,a,L){")
# yeux de clan
rep("   eyes('#222');\n   if(!back){if(h.acc==='masque')","   eyes(h.eye||'#222');if(!back&&h.eye==='#e01a1a'){g.fillStyle='#111';g.fillRect(ex-4.5,hy+2,1,1);g.fillRect(ex+3.5,hy+2,1,1)}if(!back&&h.kaguya){circ(ex-3,hy-2,1.2,'#c22');circ(ex+3,hy-2,1.2,'#c22')}\n   if(!back){if(h.acc==='masque')")
# sons par élément
s2=None

s=re.sub(r"const sndKey=\(n,u\)=>[^;]*;","const sndKey=(n,u)=>{const m=VFX&&VSND[VFX];return!m||VSKIP[n]?n:(m[n]||m['*']||n)};",s,count=1)
rep(" ex:()=>{osc('triangle',523,1046,.22,.05,{rev:1});"," fire:()=>{nz(.5,.11,{type:'lowpass',f0:1800,f1:300,rev:1});osc('sawtooth',90,50,.4,.04,{lp:500})},\n water:()=>{nz(.35,.09,{type:'bandpass',f0:1400,f1:400,q:1.5,rev:1});for(let i=0;i<3;i++)osc('sine',600+i*220,1200+i*300,.08,.03,{delay:.05+i*.06})},\n wind:()=>nz(.55,.09,{type:'bandpass',f0:600,f1:2400,q:5,rev:1}),\n chidori:()=>{nz(.45,.07,{type:'highpass',f0:4000,f1:6000,crackle:1});for(let i=0;i<5;i++)osc('square',2400+rnd()*900,3200,.05,.015,{delay:i*.07})},\n rock:()=>{osc('sine',90,40,.35,.16);nz(.3,.12,{type:'lowpass',f0:600,f1:120,rev:1})},\n sand:()=>nz(.5,.06,{type:'highpass',f0:2500,f1:1500,crackle:1}),\n poof:()=>{nz(.25,.1,{type:'bandpass',f0:900,f1:300,q:.8,rev:1});osc('sine',300,120,.12,.06)},\n bugs:()=>{osc('sawtooth',140,150,.5,.03,{lp:900});osc('sawtooth',147,141,.5,.025,{lp:900,detune:30})},\n bone:()=>{nz(.08,.12,{type:'highpass',f0:3000});osc('square',700,300,.07,.03)},\n roar:()=>{osc('sawtooth',110,70,.7,.06,{lp:700,rev:1});nz(.6,.08,{type:'lowpass',f0:900,f1:200})},\n genjutsu:()=>{osc('sine',880,440,.6,.04,{rev:1});osc('sine',1320,660,.6,.025,{rev:1,delay:.05})},\n jyuken:()=>{nz(.2,.08,{type:'bandpass',f0:1800,f1:900,q:2});osc('sine',520,260,.15,.05)},\n shadow:()=>{osc('sine',160,80,.5,.05,{rev:1});nz(.4,.04,{type:'lowpass',f0:400,f1:150})},\n ex:()=>{osc('triangle',523,1046,.22,.05,{rev:1});")
# chakra plutôt qu'énergie
s=s.replace("Maj + sort = version EX (25 énergie)","Maj + jutsu = version EX (25 chakra)")
rep("function eBar(x,y,w,v,right){bar(x,y,w,5,v,'#ffe81f',right);","function eBar(x,y,w,v,right){bar(x,y,w,5,v,'#4ab0ff',right);")
rep("g.fillStyle='#ffe81f';g.fillRect(x,y+7,w*u.energy/100,2);","g.fillStyle='#4ab0ff';g.fillRect(x,y+7,w*u.energy/100,2);")
# cartes de l'arène
rep("const CFG={team:1,wins:2,bsize:20,tickets:60,sd:true,orb:true,pk:true};","const CFG={team:1,wins:2,bsize:20,tickets:60,sd:true,orb:true,pk:true,map:0};")
rep('<label>Manches gagnantes','<label>Carte <select id="cMap"><option value="0">Terrain d\'entraînement</option><option value="1">Vallée de la Fin</option><option value="2">Désert de Suna</option></select></label>\n <label>Manches gagnantes')
rep("const CSEL=[['cTeam','team'],","const CSEL=[['cMap','map'],['cTeam','team'],")
open(ROOT+'naruto/index.html','w').write(s)
print('ok',len(s))

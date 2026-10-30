import re,sys,os,json
# Génère naruto/index.html à partir du jeu Star Wars : python3 naruto/build/mknaruto.py
SP=os.path.dirname(os.path.abspath(__file__))+'/'
ROOT=os.path.abspath(SP+'../..')+'/'
src=open(ROOT+'starwars/index.html').read()
# kits : un fichier par catégorie (ordre fixe = ordre du catalogue)
KIT_ORDER=['styles','sub','sub_nrp1','sub_nrp2','katon','suiton','futon','raiton','doton','uchiha','hyuga','nara','akimichi','aburame','inuzuka','uzumaki','yamanaka','sabaku','kaguya','taijutsuka']
KITS=''.join('\n'+open(SP+'kits/'+k+'.js').read() for k in KIT_ORDER)+'\nfor(const k in NAT)NAT[k].key=k;\n'
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
rep("const HEROES=Object.keys(CH).filter(k=>!CH[k].trooper);",open(SP+'nr_ninja.js').read().replace('/*NR_PASS*/',open(SP+'nr_pass.js').read()).replace('/*NR_NATURE*/',open(SP+'nr_flow.js').read()+open(SP+'nr_nature.js').read()+open(SP+'nr_kits.js').read()+open(SP+'nr_pace.js').read()+KITS))
rep("playerChamp='luke',aiChamp='vader'","playerChamp='p0',aiChamp='b20'")
# bots : jamais deux fois le même perso de l'anime (un bot ne prend pas le nom d'un joueur, ex. le joueur Naruto n'affronte pas un bot Naruto)
rep("const pick=t=>{let o=HEROES.filter(h=>CH[h].side===sides[t]&&!used.has(h));","const nm=new Set(H.filter(h=>h.c&&CH[h.c]).map(h=>CH[h.c].name)),pick=t=>{let o=HEROES.filter(h=>CH[h].side===sides[t]&&!used.has(h)&&!nm.has(CH[h].name));")
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
    "const coopBtn={x:1040,y:76,w:158,h:30},readyBtn={x:1030,y:576,w:210,h:54},teamBtn={x:1030,y:636,w:210,h:34};")
# panneau de choix du créateur ouvert : il capte le clic (pas de bouton de mode, PRÊT ou ÉQUIPE en dessous)
rep("if(state==='menu'){if(pressed.lmb){if(inRect(mouse,coopBtn))","if(state==='menu'){if(pressed.lmb&&picker!==null){creatorClick();pressed.lmb=0}if(pressed.lmb){if(inRect(mouse,coopBtn))")
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
rep("g.globalAlpha=f.t/f.m;g.fillStyle=f.col;g.beginPath();g.arc(p.x,p.y,f.r*p.s,0,7);g.fill()}g.globalAlpha=1;","g.globalAlpha=f.t/f.m;drawPart(f,p)}g.globalAlpha=1;")
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
rep("const CFG={team:1,wins:2,bsize:20,tickets:60,sd:true,orb:true,pk:true};","const CFG={team:1,wins:2,bsize:20,tickets:40,sd:true,orb:true,pk:true,map:0};") # ambiance NRP : combats plus longs, 40 renforts par camp par défaut
rep('<label>Manches gagnantes','<label>Carte <select id="cMap"><option value="0">Terrain d\'entraînement</option><option value="1">Vallée de la Fin</option><option value="2">Désert de Suna</option></select></label>\n <label>Manches gagnantes')
rep("const CSEL=[['cTeam','team'],","const CSEL=[['cMap','map'],['cTeam','team'],")
rep("function resetWorld(){","function resetWorld(){cutin=null;")
# pas de versions EX dans le jeu Naruto
rep("ex=!!(ex&&i>0&&!ab.ult&&u.energy>=25);","ex=false;")
rep("exOn=(keys.ShiftLeft||keys.ShiftRight)&&p.energy>=25","exOn=false")
s=s.replace("Maj + jutsu = version EX (25 chakra) · ","")
# nouveaux ninjas : dessin, animations, arme selon le style, chien Inuzuka
rep("function drawChar(u,bx,by,s){",open(SP+'nr_char.js').read()+open(SP+'nr_3d.js').read()+"\nfunction drawChar(u,bx,by,s){if(u.ch.look.head.t==='ninja')return drawNinja(u,bx,by,s);")
rep(" const aur=u.auraV&&auraOn(u);if(aur)drawAura(u,p,S2,sk);drawChar(u,p.x,p.y,S2);"," const aur=u.auraV&&auraOn(u);if(aur)drawAura(u,p,S2,sk);if(u.ch.look.dog&&Math.sin(u.aim)<0)drawDog(u);drawChar(u,p.x,p.y,S2);if(u.ch.look.dog&&Math.sin(u.aim)>=0)drawDog(u);")
# jutsu signature : effets au lancement et à l'explosion, états visibles
rep("function drawProj(p){const v=p.vfx;",open(SP+'nr_jfx.js').read()+"\nfunction drawProj(p){const v=p.vfx;")
rep("VFX=ab.vfx||null;const AB0=","VFX=ab.vfx||null;const PRE={x:u.x,y:u.y},AB0=")
rep(" for(let i=z0;i<zones.length;i++)zones[i].jn=zones[i].jn||ab.n;"," for(let i=z0;i<zones.length;i++)zones[i].jn=zones[i].jn||ab.n;for(let i=n0;i<projs.length;i++)projs[i].jn=projs[i].jn||ab.n;\n if(ab.vfx&&JFX[ab.vfx]&&near(u.x,u.y)){VFX=ab.vfx;JFX[ab.vfx](u,a,td,PRE,ab);VFX=null}")
rep("const PK=['vfx',","const PK=['vfx','jn',")
rep("else{sparks(z.x,z.y,z.col,22);fx.push({x:z.x,y:z.y,ring:z.r,t:.45,m:.45,col:z.col,vfx:z.vfx})}","else{sparks(z.x,z.y,z.col,22);fx.push({x:z.x,y:z.y,ring:z.r,t:.45,m:.45,col:z.col,vfx:z.vfx});detoFx(z.x,z.y,z.r,z.vfx)}")
rep("if(near(p.x,p.y)){sparks(p.x,p.y,p.col,24);shake=Math.max(shake,.2);SFX.boom()}for(let i=fi0;","if(near(p.x,p.y)){sparks(p.x,p.y,p.col,24);shake=Math.max(shake,.2);SFX.boom();detoFx(p.x,p.y,p.ar||80,p.vfx)}for(let i=fi0;")
rep(" list.sort((a,b)=>a.y-b.y).forEach(o=>o.d());"," list.sort((a,b)=>a.y-b.y).forEach(o=>o.d());\n for(const f of fx)if(f.jfx){const u=UI(f),t=TI(f);if(!(scl(f.y)<=0)&&!(u&&scl(u.y)<=0)&&!(t&&scl(t.y)<=0))drawJfx(f)} // loin au nord : échelle négative, rien de visible (évite le rayon négatif)")
rep("for(const f of fx){if(f.ring||f.swing||f.bolt||f.light||f.beam)continue;","for(const f of fx){if(f.ring||f.swing||f.bolt||f.light||f.beam||f.jfx)continue;")
rep("if(u.stamT<=0)u.stam=Math.min(100,u.stam+22*dt)","if(u.stamT<=0)u.stam=Math.min(100,u.stam+(u.ch.taij?50:32)*dt)")
rep("if(u.auraV&&!auraOn(u))u.auraV=null;","if(u.auraV&&!auraOn(u))u.auraV=null;u.mk=u.markB?1:0;u.stk=u.stick?1:0;if(u.root<=0)u.rootV=null;")
rep("o.root&&hard){t.root=Math.max(t.root,o.root*xm)","o.root&&hard){t.root=Math.max(t.root,o.root*xm);t.rootV=VFX")
rep("const UK=['auraV',","const UK=['auraV','mk','stk','rootV','sleepT',")
rep(" for(const p of projs){\n  p.x+=p.vx*dt;"," for(const p of projs){VFX=p.vfx||null;\n  p.x+=p.vx*dt;")
rep("projs=projs.filter(p=>!p.dead);","VFX=null;projs=projs.filter(p=>!p.dead);")
rep("if(u.ch.look.dog&&Math.sin(u.aim)>=0)drawDog(u);","if(u.ch.look.dog&&Math.sin(u.aim)>=0)drawDog(u);drawStatusN(u,p,S2,sk);")
rep("drawBolt(h.x,h.y,e.x,e.y,i%2?'#fff':vcol(f.vfx==='chakra'?null:f.vfx,f.col))","f.vfx==='chain'?drawChainLine(h.x,h.y,e.x,e.y):drawBolt(h.x,h.y,e.x,e.y,i%2?'#fff':vcol(f.vfx==='chakra'?null:f.vfx,f.col))")
rep(" ex:()=>{osc('triangle',523,1046,.22,.05,{rev:1});"," rasengan:()=>{osc('square',180,420,.5,.025,{lp:1200,rev:1});nz(.5,.06,{type:'bandpass',f0:800,f1:2400,q:3})},\n ex:()=>{osc('triangle',523,1046,.22,.05,{rev:1});")
# ambiance et poussière
rep(" drawHud();drawCutin();"," drawAmbient();drawHud();drawCutin();")
rep(" const aur=u.auraV&&auraOn(u);"," drawDust(u);const aur=u.auraV&&auraOn(u);")
# natures sur mesure : canalisations, charges, dragon dirigeable, souffles, murs, tornades
rep("if(ab.ult&&u.energy<100)return false;","if(ab.ult&&u.energy<100&&!(u.chan&&u.chan.i===i))return false;")
rep("if(ab.ult){u.energy-=100;","if(ab.ult&&!(u.chan&&u.chan.i===i)){u.energy-=100;")
rep("if(u.flame){const f=u.flame;f.t-=dt;f.k-=dt;if(near(u.x,u.y))for(let i=0;i<3;i++){const b=u.aim+(rnd()-.5)*.6,s=350+rnd()*150;fx.push({x:u.x+Math.cos(u.aim)*20,y:u.y+Math.sin(u.aim)*20,z:26,vx:Math.cos(b)*s,vy:Math.sin(b)*s,t:.4,m:.4,col:rnd()<.5?'#f93':'#fc4',r:4+rnd()*3})}",
    "if(u.flame){const f=u.flame;f.t-=dt;f.k-=dt;const FR=f.R||175,FA=f.arc||.4,wv=f.v==='wind';if(near(u.x,u.y))for(let i=0;i<(FR>200?5:3);i++){const b=u.aim+(rnd()-.5)*FA*1.5,s=(350+rnd()*150)*FR/175;fx.push({x:u.x+Math.cos(u.aim)*20,y:u.y+Math.sin(u.aim)*20,z:26,vx:Math.cos(b)*s,vy:Math.sin(b)*s,t:.4,m:.4,col:wv?'#e8fff8':rnd()<.5?'#f93':'#fc4',r:4+rnd()*3,vfx:f.v||'fire'})}")
rep("if(f.k<=0){f.k=.12;S('flame',u);for(const e of enemies(u))if(dist(u,e)<175+e.r&&angDiff(ang(u,e),u.aim)<.4)hit(e,u,3.5,{slow:.5,unblockable:1})}",
    "if(f.k<=0){f.k=.12;VFX=f.v||'fire';S('flame',u);for(const e of enemies(u))if(dist(u,e)<FR+e.r&&angDiff(ang(u,e),u.aim)<FA)hit(e,u,f.d||3.5,{slow:.5,unblockable:1,kb:f.kb,dot:f.dot,silent:!!f.kb});VFX=null}")
s=s.replace("*(u.flame?.5:1)*","*(u.flame?(u.flame.still?0:.5):1)*")
rep(" for(const p of projs){VFX=p.vfx||null;\n"," for(const p of projs){VFX=p.vfx||null;if(p.steer&&p.owner&&!p.owner.dead){const o=p.owner,tx=o.x+Math.cos(o.aim)*700,ty=o.y+Math.sin(o.aim)*700,cur=Math.atan2(p.vy,p.vx);let df=Math.atan2(ty-p.y,tx-p.x)-cur;while(df>Math.PI)df-=2*Math.PI;while(df<-Math.PI)df+=2*Math.PI;const na=cur+clamp(df,-2.6*dt,2.6*dt),sp=Math.hypot(p.vx,p.vy);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp}\n")
rep("[tethers,te0],[traps,tr0],[projs,n0]]","[tethers,te0],[traps,tr0],[projs,n0],[walls,w0]]")
rep(",n0=projs.length;ab.f(u,a,td,ab.P||{});",",n0=projs.length,w0=walls.length;ab.f(u,a,td,ab.P||{});")
rep("Wl:walls.map(w=>pickK(w,['x','y','r','t','team']))","Wl:walls.map(w=>pickK(w,['x','y','r','t','team','vfx'])),Ax:aux.map(x=>pickK(x,['type','x','y','a','len','w','r','t','m','team','vfx','k']))")
rep("walls=s.Wl||[];","walls=s.Wl||[];aux=s.Ax||[];")
rep("const UK=['auraV',","const UK=['jstN','jstV','auraV',")
rep("const PK=['vfx','jn',","const PK=['vfx','jn','dragon','shuri',")
rep(" fields=fields.filter(f=>f.t>0);"," fields=fields.filter(f=>f.t>0);auxUpdate(dt);")
rep(" drawDeploy();"," drawDeploy();drawAux();")
rep("function resetWorld(){cutin=null;","function resetWorld(){cutin=null;aux=[];seqs=[];")
rep("function drawWall(w){const p=P(w.x,w.y),rx=w.r*p.s,h=60*p.s,gr=","function drawWall(w){if(drawWallN(w))return;const p=P(w.x,w.y),rx=w.r*p.s,h=60*p.s,gr=")
# ---------- rythme : jeu ralenti, chakra (R), mudras, combo + endurance, cartes plus grandes
rep("else{const udt=hs>0?0:dt;hs=Math.max(0,hs-dt);update(udt)}","else{const udt=hs>0?0:dt;hs=Math.max(0,hs-dt);update(udt*GSPEED)}")
rep("if(isGuest()&&net.live)guestFrame(dt);","if(isGuest()&&net.live)guestFrame(dt*GSPEED);")
rep("if(p.KeyR)use(u,5,td)}","if(p.KeyT)use(u,5,td)}")
rep("if(I.l)use(u,0,td);if(p.rmb)","if(I.l||p.lmb)use(u,0,td);if(p.rmb)")
rep("const SLOTS=['lmb','rmb','Space','KeyQ','KeyE','KeyR'];","const SLOTS=['lmb','rmb','Space','KeyQ','KeyE','KeyT'];")
rep("KeyR:'R',KeyW:'W'","KeyR:'R',KeyT:'T',KeyH:'H',KeyW:'W'")
rep("for(const c of['KeyQ','KeyE','KeyR','KeyW',","for(const c of['KeyQ','KeyE','KeyR','KeyT','KeyH','KeyW',")
rep("sh:keys.ShiftLeft||keys.ShiftRight,f:keys.KeyF}","sh:keys.ShiftLeft||keys.ShiftRight,f:keys.KeyF,r:keys.KeyR}")
rep("sh:!!I.sh,f:!!I.f,cx:rd(cam.x)","sh:!!I.sh,f:!!I.f,r:!!I.r,cx:rd(cam.x)")
rep("l:!!r.l,p:P.pressed,sh:!!r.sh,f:!!r.f}","l:!!r.l,p:P.pressed,sh:!!r.sh,f:!!r.f,r:!!r.r}")
rep(" u.block=!!wantB;u.blockT=u.block?(u.blockT||0)+dt:0;"," u.block=!!wantB;u.blockT=u.block?(u.blockT||0)+dt:0;\n u.chk=active&&!u.dead&&u.stun<=0&&!u.cast&&!u.dash&&!u.block&&!u.chan&&!(u.ckLock>0)&&!(u.hlC>0)&&(ctl?!!(I&&I.r):aiChk(u,dt));if(u.chk)u.energy=Math.min(100,u.energy+30*dt);")
rep("*(u.root>0?0:1)*(u.ch.pass==='speed'?1.1:1);","*(u.root>0?0:1)*(u.chk?0:1)*(u.ch.pass==='speed'?1.1:1);")
rep("const can=u.stun<=0&&!u.dash&&!(u.root>0)","const can=u.stun<=0&&!u.dash&&!(u.root>0)&&!I.r")
rep("ex=false;","ex=false;if(i===0){const ml=meleeU(u),sc=ml?20:10;if(u.stam<sc-.01){if(u===player)say(u,'ENDURANCE !','#7df');return false}u.stam-=sc;u.stamT=Math.max(u.stamT||0,.6);u.cmb=ml?(u.cmbT>0?u.cmb||0:0)%5+1:0;u.cmbH=u.cmb;u.cmbT=1.1}")
rep("if(ab.ult&&u.energy<100&&!(u.chan&&u.chan.i===i))return false;","const rec=(u.chan&&u.chan.i===i)||(u.jst&&u.jst.i===i),ck=i>0&&!rec?jcost(ab):0;if(u.energy<ck){ckLack(u,i);return false}")
rep("if(ab.ult&&!(u.chan&&u.chan.i===i)){u.energy-=100;","u.energy-=ck;if(ab.ult&&ck){")
rep("if(ab.cast){u.cast={i,t:0,dur:ab.cast,td:td??200,aimOv,ex};return true}","if(ab.cast&&!rec){u.cast={i,t:0,dur:ab.cast,td:td??200,aimOv,ex};return true}")
rep("BASIC=u.ch.abil[0]===ab;","BASIC=u.ch.abil[0]===ab;COMBO3=BASIC&&u.cmb===5;if(COMBO3)u.c3T=.5;")
rep(" for(let i=z0;i<zones.length;i++)zones[i].jn=zones[i].jn||ab.n;"," if(COMBO3){for(let i=n0;i<projs.length;i++){projs[i].dmg*=1.35;projs[i].o=Object.assign({},projs[i].o,{stun:.35})}if(near(u.x,u.y)){say(u,'COMBO !','#ffd36a');ring(u.x+Math.cos(a)*38,u.y+Math.sin(a)*38,40,'#ffd36a')}}COMBO3=false;\n for(let i=z0;i<zones.length;i++)zones[i].jn=zones[i].jn||ab.n;")
rep("if(src&&src.ch.pw)dmg*=src.ch.pw;","if(o.melee&&src&&src.cmbT>0&&src.cmbH&&meleeU(src)&&src.ch.abil[0]&&BASIC!==null){const c=src.cmbH,fin=c===5,an=ang(src,t);sparks(t.x,t.y,fin?'#ffd36a':'#fff',fin?18:7);ring(t.x+Math.cos(an+Math.PI)*8,t.y+Math.sin(an+Math.PI)*8,fin?38:14+c*3,fin?'#ffd36a':'#ffffff');if(fin){t.kx=(t.kx||0)+Math.cos(an)*160;t.ky=(t.ky||0)+Math.sin(an)*160;shake=Math.max(shake,.12)}else{t.kx=(t.kx||0)+Math.cos(an)*35;t.ky=(t.ky||0)+Math.sin(an)*35}}if((COMBO3&&o.basic)||(src&&src.c3T>0&&o.melee)){dmg*=1.35;o=Object.assign({},o,{stun:Math.max(o.stun||0,.35)})}if(src&&src.ch.pw)dmg*=src.ch.pw;")
rep("if(u.auraV&&!auraOn(u))u.auraV=null;","if(u.cmbT>0)u.cmbT-=dt;if(u.c3T>0)u.c3T-=dt;if(u.auraV&&!auraOn(u))u.auraV=null;")
rep("const UK=['jstN',","const UK=['chk','cmb','cmbH','cmbT','jstN',")
rep("if(!h||u.cds[i]>0||(ab.ult&&u.energy<100))continue;","if(!h||u.cds[i]>0||u.energy<jcost(ab))continue;")
rep("ready=ab.ult?p.energy>=100:p.cds[i]<=0","ready=p.cds[i]<=0&&(i===0||p.energy>=jcost(ab))")
rep("else{const a=u.cast.aimOv??u.aim,len=ab.line?.len||500","else if(!ab.noTele){const a=u.cast.aimOv??u.aim,len=ab.line?.len||500")
rep("function resetWorld(){cutin=null;aux=[];","function resetWorld(){cutin=null;aux=[];for(const u of units)u.energy=Math.max(u.energy,CK.spawn);if(player)cam={x:player.x,y:player.y};")
rep("n.energy=u.hero?30:0","n.energy=CK.spawn")
rep("drawStatusN(u,p,S2,sk);","drawStatusN(u,p,S2,sk);drawFlowN(u,p,S2,sk);")
# arène : perspective ancrée au centre de l'arène, la caméra fait un simple défilement (plus de sol qui pivote)
rep("const scl=y=>.97+.3*(y-cam.y)/555;\nfunction P(x,y,z=0){const s=scl(y);return{x:W/2+(x-cam.x)*s,y:Yc+(y-cam.y)*K-z*s,s}}\nfunction unP(mx,my){const y=cam.y+(my-Yc)/K;return{x:cam.x+(mx-W/2)/scl(y),y}}",
 "const PV=()=>mode==='battle'?cam:{x:CX,y:CY},scl=y=>.97+.3*(y-PV().y)/555;\nfunction P(x,y,z=0){const v=PV(),s=scl(y);return{x:W/2+(x-v.x)*s-(cam.x-v.x)*scl(cam.y),y:Yc+(y-cam.y)*K-z*s,s}}\nfunction unP(mx,my){const v=PV(),y=cam.y+(my-Yc)/K;return{x:v.x+(mx-W/2+(cam.x-v.x)*scl(cam.y))/scl(y),y}}")
# cartes plus grandes : arène 1700×900 avec caméra qui suit, bataille 6000×2800
rep("const A={x:90,y:70,w:1100,h:555},CX=A.x+A.w/2,CY=A.y+A.h/2;","const A={x:90,y:70,w:1700,h:900},CX=A.x+A.w/2,CY=A.y+A.h/2;")
rep("const MAP={x:0,y:0,w:4200,h:2000};","const MAP={x:0,y:0,w:6000,h:2800};")
rep("const ARENA_OBST=[{x:430,y:235,r:34},{x:850,y:235,r:34},{x:430,y:460,r:34},{x:850,y:460,r:34}];","const ARENA_OBST=[[-330,-190],[330,-190],[-330,190],[330,190],[-620,0],[620,0],[0,-320],[0,320]].map(([dx,dy])=>({x:CX+dx,y:CY+dy,r:34}));")
rep("for(let i=0;i<70&&o.length<48;i++){const x=520+r()*3160,y=140+r()*1720;if(o.some(p=>Math.hypot(p.x-x,p.y-y)<190)||Math.hypot(x-2100,y-1000)<120)continue;","for(let i=0;i<170&&o.length<95;i++){const x=600+r()*4800,y=160+r()*2480;if(o.some(p=>Math.hypot(p.x-x,p.y-y)<190)||Math.hypot(x-3000,y-1400)<140)continue;")
rep("pickups=[[1100,500],[1100,1500],[2100,1000],[3100,500],[3100,1500],[2100,300],[2100,1700]]","pickups=[[1570,700],[1570,2100],[3000,1400],[4430,700],[4430,2100],[3000,420],[3000,2380]]")
rep("y:MAP.h/2+(rnd()-.5)*1000})","y:MAP.h/2+(rnd()-.5)*1500})")
rep("lerp(720,130,","lerp(1150,70,")
rep("if(mode==='battle'){const tg=player.dead&&deathPos?deathPos:player,k=Math.min(1,dt*6);cam.x+=(clamp(tg.x,420,MAP.w-420)-cam.x)*k;cam.y+=(clamp(tg.y,240,MAP.h-170)-cam.y)*k}",
    "{const tg=player.dead&&deathPos?deathPos:player,k=Math.min(1,dt*6);cam.x+=(clamp(tg.x,B.x+420,B.x+B.w-420)-cam.x)*k;cam.y+=(clamp(tg.y,B.y+240,B.y+B.h-170)-cam.y)*k}")
rep("if(mode==='battle'&&player){const c=Math.min(1,dt*6);cam.x+=(clamp(player.x,420,MAP.w-420)-cam.x)*c;cam.y+=(clamp(player.y,240,MAP.h-170)-cam.y)*c}",
    "if(player){const c=Math.min(1,dt*6);cam.x+=(clamp(player.x,B.x+420,B.x+B.w-420)-cam.x)*c;cam.y+=(clamp(player.y,B.y+240,B.y+B.h-170)-cam.y)*c}")
# kits sur mesure : effets à l'impact, intangibilité, Izanagi, explosions propres, synchro réseau
rep("function onProjHit(p,t){const o=p.owner;p.hitAny=1;","function onProjHit(p,t){const o=p.owner;p.hitAny=1;if(p.onHit)p.onHit(p,t);")
rep("function hit(t,src,dmg,o={}){\n if(t.dead||state!=='fight')return false;","function hit(t,src,dmg,o={}){\n if(t.dead||state!=='fight')return false;if(t.phase>0&&src&&src!==t)return false;")
rep(" if(t.hp<=0)die(t,src);\n return true;"," if(t.hp<=0&&!(t.izT>0&&t.izS&&izRevive(t)))die(t,src);\n return true;")
rep("detoFx(z.x,z.y,z.r,z.vfx)","detoFx(z.x,z.y,z.r,z.deto||z.vfx)")
rep("const UK=['chk',","const UK=['phase','izT','chk',")
rep("const PK=['vfx','jn','dragon','shuri',","const PK=['vfx','jn','dragon','shuri','kind',")
rep(",'team','vfx','k']))",",'team','vfx','k','ti','ui']))")
# fluidité : accélération douce, touches mémorisées, caméra qui regarde un peu devant, gestes de lancer
rep("u.vx=mx*sp;u.vy=my*sp;","{const ac=sp?1-Math.exp(-ACCEL*dt):1;u.vx+=(mx*sp-u.vx)*ac;u.vy+=(my*sp-u.vy)*ac}")
rep("const vx=mx*sp,vy=my*sp;u.x+=vx*dt;","const ac=sp?1-Math.exp(-ACCEL*dt):1;u.gvx=(u.gvx||0)+(mx*sp-(u.gvx||0))*ac;u.gvy=(u.gvy||0)+(my*sp-(u.gvy||0))*ac;const vx=u.gvx,vy=u.gvy;u.x+=vx*dt;")
rep("if(I.l||p.lmb)use(u,0,td);if(p.rmb)use(u,1,td,undefined,ex);if(p.Space)use(u,2,td,undefined,ex);if(p.KeyQ)use(u,3,td,undefined,ex);if(p.KeyE)use(u,4,td,undefined,ex);if(p.KeyT)use(u,5,td)}",
 "if(p.rmb)tryUse(u,1,td,ex);if(p.Space)tryUse(u,2,td,ex);if(p.KeyQ)tryUse(u,3,td,ex);if(p.KeyE)tryUse(u,4,td,ex);if(p.KeyT)tryUse(u,5,td,false);bufTick(u,dt,td,I)}")
rep("cam.x+=(clamp(player.x,B.x+420,B.x+B.w-420)-cam.x)*c;cam.y+=(clamp(player.y,B.y+240,B.y+B.h-170)-cam.y)*c","const la=player.dead||!isFinite(player.aim)?0:1;cam.x+=(clamp(player.x+la*Math.cos(player.aim)*70,B.x+420,B.x+B.w-420)-cam.x)*c*.8;cam.y+=(clamp(player.y+la*Math.sin(player.aim)*45,B.y+240,B.y+B.h-170)-cam.y)*c*.8")
rep("cam.x+=(clamp(tg.x,B.x+420,B.x+B.w-420)-cam.x)*k;cam.y+=(clamp(tg.y,B.y+240,B.y+B.h-170)-cam.y)*k","const la=tg===player&&!player.dead?1:0;cam.x+=(clamp(tg.x+la*Math.cos(player.aim)*70,B.x+420,B.x+B.w-420)-cam.x)*k*.8;cam.y+=(clamp(tg.y+la*Math.sin(player.aim)*45,B.y+240,B.y+B.h-170)-cam.y)*k*.8")
rep("BASIC=u.ch.abil[0]===ab;COMBO3","BASIC=u.ch.abil[0]===ab;if(!BASIC)u.relT=.3;else if(!meleeU(u))u.thrT=.2;COMBO3")
rep("const UK=['phase',","const UK=['relT','thrT','phase',")
# impacts francs, chiffres de dégâts qui « claquent », images rémanentes
rep("sparks(t.x,t.y,t.team?'#f66':'#6cf',6);","sparks(t.x,t.y,t.team?'#f66':'#6cf',6);sparks(t.x,t.y,VFX&&VP[VFX]?VP[VFX][0]:'#ffffff',d>18?2:1,'imp');")
rep("net.ev.sp.push([Math.round(x),Math.round(y),col,n,v]);}for(let i=0;i<n;i++){","net.ev.sp.push([Math.round(x),Math.round(y),col,n,v]);}if(v==='imp'){fx.push({x,y,z:34,imp:1,t:.18,m:.18,vx:0,vy:0,col,r:n>1?1.6:1,a:rnd()*7});return}for(let i=0;i<n;i++){")
rep("drawDust(u);const aur=","drawDust(u);drawGhosts(u);const aur=")
rep("g.globalAlpha=Math.min(1,t.t*2);g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.6)';g.font='bold 15px \"Trebuchet MS\",system-ui,sans-serif';g.textAlign='center';g.strokeText(t.s,p.x,p.y);text(t.s,p.x,p.y,15,t.col)",
 "g.globalAlpha=Math.min(1,t.t*2);const big=t.s[0]==='-'&&+t.s.slice(1)>=20,fs=Math.round((big?19:15)*(1+Math.max(0,t.t-.86)*4.5));g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.6)';g.font=`bold ${fs}px \"Trebuchet MS\",system-ui,sans-serif`;g.textAlign='center';g.strokeText(t.s,p.x,p.y);text(t.s,p.x,p.y,fs,t.col)")
# caméra plus proche : les ninjas et leurs animations se lisent mieux (la caméra suit le joueur)
rep("function P(x,y,z=0){const v=PV(),s=scl(y);return{x:W/2+(x-v.x)*s-(cam.x-v.x)*scl(cam.y),y:Yc+(y-cam.y)*K-z*s,s}}\nfunction unP(mx,my){const v=PV(),y=cam.y+(my-Yc)/K;return{x:v.x+(mx-W/2+(cam.x-v.x)*scl(cam.y))/scl(y),y}}",
 "const ZM=()=>state==='menu'?1:mode==='battle'?1.12:1.28;\nfunction P(x,y,z=0){const v=PV(),Z=ZM(),s=scl(y)*Z;return{x:W/2+((x-v.x)*scl(y)-(cam.x-v.x)*scl(cam.y))*Z,y:Yc+(y-cam.y)*K*Z-z*s,s}}\nfunction unP(mx,my){const v=PV(),Z=ZM(),y=cam.y+(my-Yc)/(K*Z);return{x:v.x+((mx-W/2)/Z+(cam.x-v.x)*scl(cam.y))/scl(y),y}}")
# crochets partagés par les kits : traits de clan, éléments, chocs de jutsu, états visibles, initialisation différée
rep("const backB=document.getElementById('backB');\nrequestAnimationFrame(loop);","const backB=document.getElementById('backB');\nfor(const f of AFTER)try{f()}catch(e){console.error(e)}\nrequestAnimationFrame(loop);")
rep("if(src&&src.ch.pw)dmg*=src.ch.pw;","dmg=traitDmg(t,src,dmg,o);if(dmg<0)return false;dmg=elemDmg(t,src,dmg,o);if(src&&src.ch.pw)dmg*=src.ch.pw;")
rep("if(o.dot&&src){t.dot=o.dot.dps;t.dotT=o.dot.dur;t.dotSrc=src}","if(o.dot&&src){t.dot=o.dot.dps;t.dotT=o.dot.dur;t.dotSrc=src;t.dotEl=o.el??ELM[VFX]??-1}")
rep("if(u.dotSrc)hit(u,u.dotSrc,u.dot*.5,{silent:1})","if(u.dotSrc)hit(u,u.dotSrc,u.dot*.5,{silent:1,el:-1})")
rep("'stealth','ambush'])u[k]=Math.max(0,u[k]-dt);","'stealth','ambush','wet'])u[k]=Math.max(0,u[k]-dt);")
rep("const UK=['relT',","const UK=['wet','dotEl','anim','relT',")
rep(",'team','vfx','k','ti','ui']))",",'team','vfx','k','ti','ui','kind','col','n']))")
rep(" for(const p of projs){VFX=p.vfx||null;if(p.steer"," clashProjs();\n for(const p of projs){VFX=p.vfx||null;if(p.steer")
rep("  p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.rot+=dt*25;","  p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;p.rot+=dt*25;if(!p.windB&&ELM[p.vfx]===0&&inWind(p))boostFire(p);")
rep("drawStatusN(u,p,S2,sk);drawFlowN(u,p,S2,sk);","drawStatusN(u,p,S2,sk);drawFlowN(u,p,S2,sk);drawExtraN(u,p,S2,sk);")
rep("eBar(30,59,360,p.energy/100);","eBar(30,59,360,p.energy/100);{const T=trait(p);if(T&&T.hud)try{T.hud(p,30,96)}catch(e){}}")
# ninjas en 3D : Three.js chargé à côté du jeu, rendu de l'atlas au début de chaque image, cases collées à la place du dessin 2D
rep('<script src="peerjs.min.js','<script src="three.min.js"></script>\n<script src="peerjs.min.js')
rep("function draw(){\n fit();g.setTransform(RS,0,0,RS,0,0);g.imageSmoothingEnabled=true;","function draw(){\n fit();g.setTransform(RS,0,0,RS,0,0);g.imageSmoothingEnabled=true;render3D();")
rep("drawChar(u,p.x,p.y,S2)","drawChar3(u,p.x,p.y,S2)")
# option d'affichage : ninjas en 3D (activés par défaut, coupés automatiquement si l'ordinateur rame)
rep(' <button id="oClose">Fermer</button>',' <h2 style="margin-top:14px">Affichage</h2>\n <label>Ninjas en 3D <input type="checkbox" id="o3d"></label>\n <button id="oClose">Fermer</button>')
rep("const OPT={master:60,fx:80,voice:80,voiceOn:true,wil:true,spat:true};","const OPT={master:60,fx:80,voice:80,voiceOn:true,wil:true,spat:true,p3d:true};")
rep("$('oSpat').checked=OPT.spat;$('oMute').checked=muted}","$('oSpat').checked=OPT.spat;$('oMute').checked=muted;$('o3d').checked=OPT.p3d!==false}")
rep("$('oMute').onchange=e=>{muted=e.target.checked};","$('oMute').onchange=e=>{muted=e.target.checked};$('o3d').onchange=e=>{OPT.p3d=e.target.checked;N3.on=true;N3.slow=0;applyOpt()};")
# clones (Multiclonage, nuées…) dessinés comme les ninjas : en 3D si disponible
rep("drawChar(f,p.x,p.y,p.s*1.15*(tu.big?1.2:1))","drawChar3(f,p.x,p.y,p.s*1.15*(tu.big?1.2:1))")
# déplacement plus léger + sprint (Maj maintenue) : plus rapide, consomme l'endurance ; les bots sprintent pour rejoindre leur cible
rep("const sp=u.ch.spd*(u.slow>0?.55:1)*(u.haste>0?1.4:1)*(u.cast?.4:1)","const sp=u.ch.spd*SPD_K*(u.sprint?SPRINT_K:1)*(u.slow>0?.55:1)*(u.haste>0?1.4:1)*(u.cast?.5:1)")
rep("if(u.chk)u.energy=Math.min(100,u.energy+30*dt);","if(u.chk)u.energy=Math.min(100,u.energy+30*dt);\n {const want=ctl?!!(I&&I.sh)&&Math.hypot(I.mx,I.my)>.1:!!u.aiSprint&&u.moving;if(!want)u.sprintLock=0;u.sprint=active&&want&&!u.sprintLock&&u.stun<=0&&!u.cast&&!u.dash&&!u.block&&!u.chk&&!u.flame&&!u.spin&&!u.chan&&!(u.root>0)&&(u.run??100)>1;\n  if(u.run==null)u.run=100;if(u.sprint){u.run=Math.max(0,u.run-SPRINT_COST*dt);u.runT=.6;if(u.run<=0){u.sprint=false;u.sprintLock=1}}else if((u.runT=(u.runT||0)-dt)<=0)u.run=Math.min(100,u.run+RUN_REGEN*dt)}")
rep("if(u.block){u.stam-=12*dt;u.stamT=.9;if(u.stam<=0)stamHit(u,0)}else{","if(u.block){u.stam-=12*dt;u.stamT=.9;if(u.stam<=0)stamHit(u,0)}else{")
rep("u.walk+=dt*13*(u.haste>0?1.4:1);if(rnd()<dt*9&&","u.walk+=dt*13*(u.haste>0?1.4:1)*(u.sprint?1.35:1);if(rnd()<dt*(u.sprint?26:9)&&")
rep("sp=can?u.ch.spd*(u.slow>0?.55:1)*(u.haste>0?1.4:1)*(u.cast?.4:1)","sp=can?u.ch.spd*SPD_K*(I.sh&&(u.run??100)>1&&!I.f?SPRINT_K:1)*(u.slow>0?.55:1)*(u.haste>0?1.4:1)*(u.cast?.5:1)")
rep("const e=u.tgt&&!u.tgt.dead?u.tgt:null;let mx=0,my=0;","const e=u.tgt&&!u.tgt.dead?u.tgt:null;let mx=0,my=0;u.aiSprint=!e?(u.run??100)>60:dist(u,e)>460&&(u.run??100)>45;")
rep("const UK=['wet',","const UK=['sprint','wet',")
rep("text(`${lbl.KeyF} parade`,396,72,","text(`${lbl.KeyF} parade · Maj sprint`,396,72,")
# parade parfaite (F + clic gauche) : fenêtre courte, étourdit l'attaquant au corps à corps (coup de base), bloque la garde 5 s
rep(" u.block=!!wantB;u.blockT=u.block?(u.blockT||0)+dt:0;"," if(u.parry>0)u.parry-=dt;\n if(wantB&&(ctl?!!(I&&I.p&&I.p.lmb):u.aiParry>0)){u.aiParry=0;if(I&&I.p)I.p.lmb=false;u.bufL=0;u.parry=PARRY_WIN;u.blockLock=PARRY_LOCK;u.swing=.2;u.swingA=u.aim;anim(u,'parry',.35);if(near(u.x,u.y))S('deflect',u)}\n u.block=!!wantB&&!(u.parry>0);u.blockT=u.block?(u.blockT||0)+dt:0;")
rep(" if(src&&t.block&&o.melee&&!o.unblockable&&facing(t,src)){"," if(src&&src!==t&&t.parry>0&&o.melee&&BASIC&&!o.unblockable&&!src.dead){t.parry=0;src.stun=Math.max(src.stun,PARRY_STUN);src.cast=null;src.spin=null;const a=ang(t,src);src.kx+=Math.cos(a)*160;src.ky+=Math.sin(a)*160;if(near(t.x,t.y)){say(t,'PARADE PARFAITE !','#fff27a');say(src,'ÉTOURDI','#b8f');sparks(t.x,t.y,'#fff27a',18);jx({jfx:'shock',x:t.x,y:t.y,r:60,t:.35,m:.35,col:'#fff27a'});shake=Math.max(shake,.2);S('deflect',t)}return false}\n if(src&&t.block&&o.melee&&!o.unblockable&&facing(t,src)){")
rep("const UK=['sprint',","const UK=['sprint','parry',")
rep("text(`${lbl.KeyF} parade · Maj sprint`","text(`${lbl.KeyF} garde · ${lbl.KeyF}+clic parade · Maj sprint`")
rep("+clic parade · Maj sprint`,396,72,","+clic parade · Maj sprint`,424,73,") # décalé : ne chevauche plus le chiffre de chakra (ckHud)
# ---------- ambiance NRP (nr_pace.js) : PV ×1,2, chakra rare (R pour se recharger, épuisement), soin commun (H)
# plus de chakra gagné en frappant / en étant frappé : on marque le combat, une recharge (R) est brisée par un coup franc et prend +20 % de dégâts
rep("if(src)src.energy=Math.min(100,src.energy+dmg*(ps==='energy'?.9:.6));if(t.hero)t.energy=Math.min(100,t.energy+dmg*.2);","ckHit(t,src,dmg,o);")
rep("if(t.vuln>0)dmg*=1.25;","if(t.vuln>0)dmg*=1.25;if(t.chk)dmg*=CK.vuln;")
rep("if(u.chk)u.energy=Math.min(100,u.energy+30*dt);","ckTick(u,dt);")
# épuisement : plus lent, endurance lente, garde coûteuse, pas de sprint ; pendant l'incantation du soin on avance à moitié
rep("*(u.chk?0:1)*(u.ch.pass==='speed'?1.1:1);","*(u.chk?0:1)*(u.exh?CK.exhSpd:1)*(u.hlC>0?.5:1)*(u.ch.pass==='speed'?1.1:1);")
rep("*(I.f&&canBlock(u)&&u.stam>0?.55:1)*(u.ch.pass==='speed'?1.1:1):0;","*(I.f&&canBlock(u)&&u.stam>0?.55:1)*(u.exh?CK.exhSpd:1)*(u.hlC>0?.5:1)*(u.ch.pass==='speed'?1.1:1):0;")
rep("&&!(u.root>0)&&(u.run??100)>1;","&&!(u.root>0)&&!u.exh&&(u.run??100)>1;")
rep("I.sh&&(u.run??100)>1&&!I.f?SPRINT_K:1","I.sh&&(u.run??100)>1&&!I.f&&!u.exh?SPRINT_K:1")
rep("u.stam=Math.min(100,u.stam+(u.ch.taij?50:32)*dt)","u.stam=Math.min(100,u.stam+(u.ch.taij?50:32)*(u.exh?CK.exhStam:1)*dt)")
rep("if(u.block){u.stam-=12*dt;","if(u.block){u.stam-=12*(u.exh?CK.exhBlock:1)*dt;")
# soin (H) : pas de jutsu pendant l'incantation ; recharge, soin sur la durée et incantation à chaque image ; touche H (joueur, ami en ligne)
rep("||u.flame||u.block)return false;const rec=","||u.flame||u.block||u.hlC>0)return false;const rec=")
rep("function updUnit(u,dt,active){\n","function updUnit(u,dt,active){hlTick(u,dt,active);\n")
rep("if(p.KeyT)tryUse(u,5,td,false);bufTick(u,dt,td,I)}","if(p.KeyT)tryUse(u,5,td,false);bufTick(u,dt,td,I);hlInput(u,dt,I)}")
# IA : soin des alliés en difficulté, distance pour se recharger quand le chakra manque, chakra gardé pour l'ultime
rep("const th=threat(u);","const th=threat(u);if(hlAI(u))return[mx,my];")
rep("const pref=u.ch.pref,rad=","const pref=aiPref(u,e),rad=")
rep("if(!h||u.cds[i]>0||u.energy<jcost(ab))continue;","if(!h||u.cds[i]>0||u.energy<jcost(ab)||aiSave(u,i,h))continue;")
# HUD : coût en chakra des cases, jauge chiffrée, case du soin
rep("if(ab.cast)text(`${ab.cast}s`,x+s-4,y+12,9,'#7f93b8','right','normal');","if(ab.cast)text(`${ab.cast}s`,x+s-4,y+12,9,'#7f93b8','right','normal');hudCost(p,ab,i,x,y,s,sh);")
rep("if(ab.ult&&!ready){g.fillStyle='rgba(255,232,31,.25)';g.fillRect(x,y+sh*(1-p.energy/100),s,sh*p.energy/100)}","if(ab.ult&&!ready&&p.cds[i]<=0){const f=Math.min(1,p.energy/Math.max(1,jcost(ab)));g.fillStyle='rgba(255,232,31,.25)';g.fillRect(x,y+sh*(1-f),s,sh*f)}")
rep("text(muted?`${lbl.KeyM} : son coupé`","drawHealHud(p,x0+n*(s+gap)+6,y,sh);text(muted?`${lbl.KeyM} : son coupé`")
rep("eBar(30,59,360,p.energy/100);{const T=trait(p);","eBar(30,59,360,p.energy/100);ckHud(p,30,59,360);{const T=trait(p);")
# liste des alliés décalée sous la ligne du trait de clan (sinon les deux textes se chevauchent en équipe)
rep("let ay=0;for(const m of units)if(m!==player&&m.team===player.team","let ay=(T=>T&&T.hud?22:0)(trait(p));for(const m of units)if(m!==player&&m.team===player.team")
# mort subite plus tardive : les duels durent plus longtemps
rep("const SD_START=45,SD_LEN=35;","const SD_START=90,SD_LEN=55;")
# forme cachée unique des unités : les champs ajoutés en cours de partie (kits, IA, dessin) sont déclarés d'avance à undefined dans mkUnit
# (lire undefined = lire un champ absent : aucun changement de jeu ; les accès u.* deviennent monomorphes au lieu de mégamorphes)
UXK_H="rid,wet,mk,stk,rootV,blockT,chk,sprintLock,sprint,run,runT,_tri,sub_nd,jstN,jstV,aiSprint,hy_byak,hy_stepB,hy_seen,uc_tm,uc_obs,uc_cpN,uc_cpT,uc_rcT,tj_g,tj_cT,tj_n,tj_cds,ak_cal,sa_shT,sa_cds,sa_arm,sa_armT,sa_sph,sa_fly,sa_brk,ab_eat,ab_tk,in_bcd,na_dk,kg_os,kg_osT,kg_armT,kg_larT,cmb,cmbH,cmbT,thrT,st_kn,st_kt,anim,relT,auraV,dmgBy,st_sh,uc_tmF,uc_cp,phase,uc_shB,uc_rec,uc_rdT,st_vp,ya_mkU,ya_mk,ya_mkB,uc_suT,tj_8,tj_red,ak_roll,shieldBy,ak_bf,ya_lnkT,ya_lnkU,dotSrc,dotEl,dotK,ya_pz,ya_pa,na_tT,in_flair,in_wolf,do_sw,jst,sa_sink,ab_last,ab_col,ab_colT,ab_src,ak_arm,ya_sl,ya_slI,sub_ctr,ak_spk,hy_tkN,hy_tk,hy_tkU,sub_slug,thirdImm,st_luT,do_ar,do_ac,chan,tj_life,tj_esq,na_pl,riposteS,hy_dg,uc_am,na_by,na_hT,hy_rvU,c3T,hy_imU,ka_ht,counterS,absorbEn,izT,izS,parry,aiParry,fearX,fearY,tauntSrc,su_pr,ab_vd,ab_vdT,ab_spyT,ab_spyS,uz_clT,_tr,_pz,_land,_dog3".split(',')
def _mkBase():
    i=s.index('function mkUnit(c,x,y,team){');j=s.index('return{',i)+7;d=0;k=j
    while True:
        c=s[k]
        if c in '([{':d+=1
        elif c in ')]}':
            if d==0:break
            d-=1
        k+=1
    P=[];d=0;cur=''
    for c in s[j:k]:
        if c in '([{':d+=1
        elif c in ')]}':d-=1
        if c==',' and d==0:P.append(cur);cur=''
        else:cur+=c
    P.append(cur)
    return [q.split(':')[0].strip() for q in P]
BASEK=_mkBase()
UXK=[]
for k in UXK_H+[m.group(1) for m in re.finditer(r"\bu\.([A-Za-z_$][\w$]*)\s*(?:=(?![=>])|\+\+|--|[-+*/|&?]{1,2}=)",s)]:
    if k not in UXK:UXK.append(k)
UXK=[k for k in UXK if k not in BASEK]
assert not set(UXK)&set(BASEK)
assert len(UXK)==len(set(UXK))
rep("markB:null,stick:null}}","markB:null,stick:null,"+','.join(k+':undefined' for k in UXK)+"}}")
rep("function mkUnit(c,x,y,team){","// UXK : champs ajoutés en cours de partie, déclarés d'avance (forme cachée unique)\nconst UXK="+json.dumps(UXK,separators=(',',':'))+";\nfunction mkUnit(c,x,y,team){")
rep("n.rid=u.rid;n.energy=CK.spawn;Object.assign(u,n);","n.rid=u.rid;n.energy=CK.spawn;for(const k of UXK)if(k!=='rid')delete n[k];Object.assign(u,n);")
# en ligne : quitter un salon rend au joueur son propre ninja (côté ami, CH.p0 était celui de l'hôte)
rep("function netReset(){","function netReset(){CH.p0=MYCH;")
s=s.replace("cam={x:CX,y:CY};Yc=377.5;","cam={x:CX,y:CY};Yc=390;")
open(ROOT+'naruto/index.html','w').write(s)
print('ok',len(s))

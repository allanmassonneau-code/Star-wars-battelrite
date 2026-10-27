// ---------- Auras de jutsu (Kyûbi, Huit Portes, Susanô, peau de pierre…) ----------
const AURK=['rage','unstop','giant','haste','deflect','drT','absorb','regenB','lsB','chrome','dodge','counter','riot','shieldT'];
const auraOn=u=>AURK.some(k=>(u[k]||0)>0);
function drawAura(u,p,S,sk,front){const v=u.auraV,t=performance.now()/1000,cx=p.x,cy=p.y-38*S*sk,ch=u.ch.look.weapon.col;
 if(front){if(v==='lightning'){g.save();g.globalCompositeOperation='lighter';g.strokeStyle='#fff6a0';g.lineWidth=1.5;for(let i=0;i<3;i++){const a=rnd()*7,r=(18+rnd()*14)*S;g.beginPath();g.moveTo(cx+Math.cos(a)*r*.4,cy+Math.sin(a)*r*.6);g.lineTo(cx+Math.cos(a+.3)*r,cy+Math.sin(a+.3)*r*1.3);g.lineTo(cx+Math.cos(a+.1)*r*1.3,cy+Math.sin(a+.1)*r*1.6);g.stroke()}g.restore()}
  else if(v==='earth'){g.fillStyle='rgba(120,110,100,.35)';g.beginPath();g.ellipse(cx,cy+4*S,15*S*sk,30*S*sk,0,0,7);g.fill();g.strokeStyle='rgba(60,50,40,.6)';g.lineWidth=1;g.beginPath();g.moveTo(cx-6*S,cy-14*S);g.lineTo(cx-1*S,cy-4*S);g.lineTo(cx-5*S,cy+6*S);g.moveTo(cx+5*S,cy-8*S);g.lineTo(cx+2*S,cy+4*S);g.stroke()}
  else if(v==='sand'){for(let i=0;i<14;i++){const a=t*3+i*.45,q={x:cx+Math.cos(a)*24*S,y:cy+18*S+Math.sin(a)*8*S-(i%3)*10*S};if(Math.sin(a)>0)circ(q.x,q.y,2*S,i%2?'#d8b878':'#a88a50')}}
  else if(v==='bugs'){g.fillStyle='#26302a';for(let i=0;i<16;i++){const a=t*4+i*.9,r=(20+(i%4)*6)*S;if(Math.sin(a)>0)g.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a*1.3)*r*.8,2*S,2*S)}}
  return}
 g.save();
 switch(v){
  case'fox':{g.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const tl=Math.sin(t*3+i*2)*.35;g.strokeStyle=rgba(i%2?'#ff6a2a':'#ff2a1a',.55);g.lineWidth=7*S;g.lineCap='round';g.beginPath();g.moveTo(cx,cy+18*S);g.quadraticCurveTo(cx-(20+i*8)*S,cy+(4+i*6)*S,cx-(28+i*10)*S*Math.cos(tl),cy-(18+i*10)*S);g.stroke()}
   for(let i=0;i<7;i++){const a=i/7*Math.PI*2+t*2,r=(20+Math.sin(t*9+i*3)*4)*S;circ(cx+Math.cos(a)*r*.7,cy+Math.sin(a)*r*1.3,8*S,rgba(i%2?'#ff6a2a':'#ff3a1a',.28))}break}
  case'gate':{g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(cx,cy,0,cx,cy,40*S);gr.addColorStop(0,rgba('#6aff7a',.35));gr.addColorStop(1,rgba('#2aaa4a',0));g.fillStyle=gr;g.beginPath();g.ellipse(cx,cy,30*S,46*S,0,0,7);g.fill();
   for(let i=0;i<5;i++){const k=((t*.9+i/5)%1);circ(cx+Math.sin(i*2.3+t)*12*S,cy-k*50*S,(4+k*8)*S,rgba('#d8ffd8',.25*(1-k)))}break}
  case'susano':case'chakra':{g.globalCompositeOperation='lighter';const c=ch||'#a5f',s=S*1.9,x=cx,y=p.y-10*S;g.strokeStyle=rgba(c,.75);g.fillStyle=rgba(c,.14);g.lineWidth=3;
   g.beginPath();g.ellipse(x,y-58*s*.55,15*s,16*s,0,0,7);g.fill();g.stroke();g.beginPath();g.moveTo(x-26*s,y-44*s*.55);g.quadraticCurveTo(x,y-34*s*.55,x+26*s,y-44*s*.55);g.lineTo(x+20*s,y);g.lineTo(x-20*s,y);g.closePath();g.fill();g.stroke();
   for(let i=0;i<4;i++){g.beginPath();g.moveTo(x-18*s,y-(38-i*8)*s*.55);g.quadraticCurveTo(x,y-(30-i*8)*s*.55,x+18*s,y-(38-i*8)*s*.55);g.stroke()}circ(x-5*s,y-60*s*.55,2.5*s,rgba('#fff',.8));circ(x+5*s,y-60*s*.55,2.5*s,rgba('#fff',.8));break}
  case'sage':{g.globalCompositeOperation='lighter';circ(cx,cy,34*S,rgba('#e8a020',.12));for(let i=0;i<6;i++){const a=t*2+i*1.05;circ(cx+Math.cos(a)*22*S,cy+Math.sin(a)*30*S,3*S,rgba('#8ad05a',.6))}break}
  case'kaiten':case'jyuken':{g.globalCompositeOperation='lighter';g.strokeStyle=rgba('#cfe0ff',.7);g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.ellipse(cx,p.y-6*S,(34-i*5)*S,(30-i*4)*S*K,0,t*6+i,t*6+i+4.2);g.stroke();g.beginPath();g.ellipse(cx,cy,(30-i*4)*S,(42-i*5)*S,0,t*-5+i,t*-5+i+3.5);g.stroke()}break}
  case'water':{g.fillStyle='rgba(58,168,255,.18)';g.strokeStyle='rgba(191,230,255,.6)';g.lineWidth=2;g.beginPath();g.ellipse(cx,cy,26*S,44*S,0,0,7);g.fill();g.stroke();break}
  case'wind':{g.strokeStyle='rgba(200,255,240,.6)';g.lineWidth=1.5;for(let i=0;i<4;i++){const a=t*7+i*1.6;g.beginPath();g.ellipse(cx,cy+(i-1.5)*12*S,24*S,7*S,0,a,a+2.4);g.stroke()}break}
  case'genjutsu':{g.globalAlpha=.25;for(let i=1;i<=2;i++){const q=Math.sin(t*8+i)*10*S;circ(cx+q,cy,12*S,'#8a3ab0')}g.globalAlpha=1;break}
  case'heal':case'leaf':{g.globalCompositeOperation='lighter';circ(cx,cy,34*S,rgba('#7fe07f',.12));break}
  case'lightning':{g.globalCompositeOperation='lighter';circ(cx,cy,30*S,rgba('#ffe14a',.13));break}
  default:{if(v){g.globalCompositeOperation='lighter';circ(cx,cy,32*S,rgba(ch||'#3af',.14))}}}
 g.restore()}
// ---------- Ultime : bandeau d'annonce façon jeux de combat ----------
let cutin=null;
function drawCutin(){if(!cutin)return;cutin.t-=1/60;if(cutin.t<=0){cutin=null;return}const k=cutin.t,in_=Math.min(1,(1.4-k)*6),out=Math.min(1,k*4),a=Math.min(in_,out),y=H*.38;
 g.save();g.globalAlpha=a;g.translate((1-in_)*-300,0);g.fillStyle='rgba(10,6,4,.78)';g.beginPath();g.moveTo(0,y-40);g.lineTo(W,y-62);g.lineTo(W,y+22);g.lineTo(0,y+44);g.fill();
 g.fillStyle=cutin.col;g.fillRect(0,y+38,W,3);g.save();g.translate(W*.5,y);g.rotate(-.018);g.shadowColor=cutin.col;g.shadowBlur=24;text(cutin.s,0,6,46,'#fff4d8');g.restore();text(cutin.who,W*.5,y+30,15,cutin.col,'center');g.restore()}
// ---------- Modèles de kits inspirés des ninjas célèbres ----------
// [libellé, nature, clan (-1 sans), voie, passif, style de combat, 5 jutsu (principal, déplacement, technique, défense, ultime), apparence]
const PRESETS=[
 ['Jinchûriki (style Naruto)',2,6,0,'regen','Taijutsu',['Rasengan','Fûton : Pas du vent','Sceau','Vitalité Uzumaki','Chakra de Kyûbi'],{v:0,t:0,c:0,h:0,p:0,k:4,a:2}],
 ['Vengeur (style Sasuke)',3,0,1,'crit','Kenjutsu',['Chidori','Shunshin Uchiha','Sharingan : Genjutsu','Sharingan','Susanô : Totsuka'],{v:0,t:5,c:0,h:1,p:0,k:3,a:0}],
 ['Prodige Uchiha (style Itachi)',0,0,2,'energy','Taijutsu Uchiha',['Katon : Souffle du dragon','Shunshin Uchiha','Sharingan : Genjutsu','Sharingan','Amaterasu'],{v:6,t:2,c:1,h:1,p:4,k:1,a:0}],
 ['Démon du sable (style Gaara)',2,8,2,'armor','Balles de sable',['Cercueil de sable','Sable volant','Sable mouvant','Armure de sable','Tsunami de sable'],{v:1,t:6,c:3,h:7,p:4,k:4,a:0}],
 ['Génie Hyûga (style Neji)',2,1,0,'slow','Poing souple',['Hakke : Paume','Pas du Hakke','Byakugan','Kaiten','Hakke : 64 points'],{v:0,t:4,c:1,h:5,p:0,k:5,a:0}],
 ['Stratège (style Shikamaru)',0,2,1,'energy','Fouet d\'ombre',['Kage Mane','Course de l\'ombre','Kage Kubi Shibari','Ombre protectrice','Ombres liées'],{v:0,t:1,c:2,h:1,p:1,k:2,a:0}],
 ['Ninja copieur (style Kakashi)',3,-1,1,'crit','Kunai',['Chidori','Roulade','Multiclonage','Pilule du soldat','Raiton : Kirin'],{v:0,t:1,c:0,h:4,p:0,k:5,a:1}],
 ['Fauve de jade (style Rock Lee)',0,10,0,'third','Taijutsu du fauve',['Konoha Senpû','Poids retirés','Dynamic Entry','Première Porte','Huit Portes'],{v:0,t:7,c:3,h:1,p:0,k:2,a:0}],
 ['Fauve sublime (style Gai)',0,10,0,'rage','Taijutsu du fauve',['Lotus primaire','Bond du fauve','Lotus caché','Esquive du fauve','Paon du matin'],{v:0,t:7,c:3,h:1,p:1,k:2,a:0}],
 ['Maître-chien (style Kiba)',4,5,0,'speed','Crocs et griffes',['Gatsûga','Instinct bestial','Ninken','Flair du chien','Garôga'],{v:0,t:1,c:0,h:5,p:1,k:4,a:3}],
 ['Maître des insectes (style Shino)',4,4,1,'lifesteal','Nuée d\'insectes',['Insectes chercheurs','Clone d\'insectes','Essaim d\'insectes','Doton : Corps de roche','Nuée destructrice'],{v:0,t:1,c:3,h:5,p:1,k:2,a:4}],
 ['Kunoichi médicale (style Sakura)',4,-1,0,'regen','Taijutsu',['Lotus primaire','Saut ninja','Bombe fumigène','Shôsen','Doton : Montagne écrasante'],{v:0,t:0,c:1,h:2,p:0,k:2,a:0}],
 ['Gourmet géant (style Chôji)',4,3,0,'armor','Poing décuplé',['Paume géante','Boulet humain','Décuplement partiel','Pilule rouge','Décuplement'],{v:0,t:1,c:0,h:5,p:1,k:3,a:3}],
 ['Esprit fleuri (style Ino)',1,7,2,'energy','Senbon fleuris',['Suiton : Vague','Transposition','Shintenshin','Suiton : Mur d\'eau','Suiton : Grand requin'],{v:0,t:1,c:2,h:0,p:0,k:3,a:0}],
 ['Os vivants (style Kimimaro)',4,9,0,'third','Danse des os',['Doigts-balles','Bond d\'os','Forêt naissante','Armure d\'os','Forêt d\'os'],{v:5,t:4,c:1,h:4,p:4,k:5,a:0}],
 ['Sage des crapauds (style Jiraiya)',0,-1,1,'rage','Taijutsu',['Rasengan','Saut ninja','Katon : Souffle ardent','Pilule du soldat','Invocation : Crapaud'],{v:0,t:6,c:1,h:4,p:1,k:0,a:3}],
 ['Éclair jaune (style Minato)',2,-1,2,'speed','Kunai',['Rasengan','Hiraishin','Bombe fumigène','Concentration du chakra','Fûton : Rasen-shuriken'],{v:0,t:1,c:0,h:0,p:0,k:6,a:0}],
 ['Artiste explosif (style Deidara)',4,-1,2,'crit','Kunai',['Doton : Rocher','Saut ninja','Kunai explosifs','Doton : Corps de roche','Pluie de parchemins'],{v:6,t:2,c:1,h:0,p:0,k:4,a:0}],
];
const PASSI=k=>Math.max(0,PASSK.indexOf(k));
function presetBuild(i,name,side){const [lab,nat,clan,voie,pass,sty,names,l]=PRESETS[i];
 const b={name:name||(typeof MY!=='undefined'&&MY?MY.name:'Ninja'),side:side??0,voie,nat,clan,pass:PASSI(pass),l:Object.assign({},l),j:[STYLES.findIndex(x=>x[0]===sty)].concat(names.map((n,k)=>{const J=JL.find(j=>j.n===n&&j.slot===k+1&&(j.cat==='c'+clan||j.cat==='n'+nat||(clan<0&&j.cat==='u')));return J?J.id:-1}))};
 return sanitizeBuild(b,true)}
// ---------- Cartes de l'arène ----------
const MAPS=[['Terrain d\'entraînement'],['Vallée de la Fin'],['Désert de Suna']];
const THEME=()=>[{sky:['#2a2650','#a8506a','#f3a65a'],floor:['#3e5a2c','#4f6e34'],line:'rgba(30,50,20,.18)',wall:['#6a4426','#4a2e18'],post:['#4a2e18','#9a6a3a','#3a2210','#b88a52']},
 {sky:['#1a2a4a','#4a6a8a','#a8c0d0'],floor:['#3a6a8a','#4a7a9a'],line:'rgba(200,230,255,.12)',wall:['#5a5a62','#3a3a42'],post:['#4a4a52','#8a8a92','#2a2a32','#9a9aa4']},
 {sky:['#5a2a1a','#c87a3a','#f3c87a'],floor:['#c8a060','#d8b070'],line:'rgba(120,80,30,.15)',wall:['#a07040','#7a5028'],post:['#7a5028','#c89a60','#5a3a1a','#d8b078']}][CFG.map|0]||null;
// ---------- Décor des jutsu marquants pendant leur délai ----------
function drawZoneDeco(z){const k=1-z.t/z.m,p=P(z.x,z.y),s=p.s,t=performance.now()/1000;
 switch(z.jn){
  case'Kawarimi':{g.save();g.translate(p.x,p.y-8*s);g.rotate(.3);g.fillStyle='#8a5a30';g.fillRect(-20*s,-7*s,40*s,14*s);g.fillStyle='#b88a52';g.beginPath();g.ellipse(20*s,0,4*s,7*s,0,0,7);g.fill();g.restore();break}
  case'Invocation : Crapaud':{const h=(1-k)*420*s,sz=(40+k*60)*s;g.fillStyle=`rgba(0,0,0,${.15+k*.35})`;gEll(z.x,z.y,z.r*k);g.fill();g.save();g.translate(p.x,p.y-h-sz*.6);
   g.fillStyle='#c0582a';g.beginPath();g.ellipse(0,0,sz,sz*.7,0,0,7);g.fill();g.fillStyle='#e8c060';circ(-sz*.5,-sz*.55,sz*.22,'#e8c060');circ(sz*.5,-sz*.55,sz*.22,'#e8c060');circ(-sz*.5,-sz*.55,sz*.1,'#111');circ(sz*.5,-sz*.55,sz*.1,'#111');
   g.strokeStyle='#5a2a14';g.lineWidth=3*s;g.beginPath();g.arc(0,sz*.05,sz*.55,.3,Math.PI-.3);g.stroke();g.restore();break}
  case'Fûton : Rasen-shuriken':{const h=(1-k)*240*s;g.save();g.translate(p.x,p.y-h-30*s);g.globalCompositeOperation='lighter';g.rotate(t*14);for(let i=0;i<4;i++){g.rotate(Math.PI/2);g.fillStyle='rgba(200,255,240,.55)';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(30*s,-10*s,60*s,0);g.quadraticCurveTo(30*s,6*s,0,0);g.fill()}circ(0,0,16*s,'rgba(140,200,255,.9)');circ(0,0,8*s,'#fff');g.restore();break}
  case'Pluie de parchemins':{const h=(1-k)*300*s;g.save();g.translate(p.x,p.y-h);g.rotate(t*3);g.fillStyle='#f0e0b0';g.fillRect(-8*s,-4*s,16*s,8*s);g.fillStyle='#c0302a';g.fillRect(-2*s,-3*s,4*s,6*s);g.restore();break}
  case'Raiton : Orage':{g.fillStyle='rgba(40,40,60,.55)';for(let i=0;i<4;i++){const q=P(z.x+(i-1.5)*z.r*.45,z.y,200);g.beginPath();g.ellipse(q.x,q.y,z.r*.4*s,z.r*.18*s,0,0,7);g.fill()}break}}}
// ---------- Sons par élément ----------
const VSND={fire:{'*':'fire',dash:'dash',deflect:'deflect'},water:{'*':'water',dash:'dash'},wind:{'*':'wind'},lightning:{'*':'chidori'},earth:{'*':'rock',dash:'rock'},sand:{'*':'sand'},
 smoke:{'*':'poof',blaster:'blaster'},leaf:{dash:'poof',zap:'poof'},bugs:{'*':'bugs'},bone:{'*':'bone',saber:'saber'},tag:{boom:'boom','*':'blaster'},fox:{'*':'fire',heavy:'roar'},gate:{heavy:'roar'},genjutsu:{'*':'genjutsu'},black:{'*':'fire'},jyuken:{'*':'jyuken'},shadow:{'*':'shadow'},chakra:{zap:'jyuken',heavy:'roar'}};
const VSKIP={hit:1,win:1,lose:1,ex:1,orb:1,ignite:1};

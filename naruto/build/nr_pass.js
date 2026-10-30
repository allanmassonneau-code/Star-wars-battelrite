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
// ---------- Persos de l'anime : kits préfaits (apparence + build fidèles au personnage) ----------
// n nom court (aussi le nom du bot), full nom complet, g groupe de la galerie (GALG), side camp du bot (0 Alliance, 1 Akatsuki), nat, clan (-1 sans), voie (0 taijutsu, 1 équilibré, 2 ninjutsu),
// pass passif, sty style de combat, j 5 jutsu (Clic D, Espace, Q, E, T), l apparence {v village,t tenue,c coiffure,h cheveux,p peau,k chakra,a accessoire,f visage,b bandeau,d dos}, d jeu en une ligne
const GALG=['Équipe 7','Akatsuki','Sannin & Hokage','Konoha & Gaara','Oto'],GALC=['#ff9a3a','#e0383a','#e8c040','#5ab45a','#9a6ad8'];
const PRESETS=[
 {n:'Naruto',full:'Naruto Uzumaki',g:0,side:0,nat:2,clan:-1,voie:0,pass:'regen',sty:'Taijutsu',j:['Rasengan','Roulade','Multiclonage','Chakra de Kyûbi','Fûton : Rasenshuriken'],l:{v:0,t:8,c:0,h:0,p:0,k:4,a:0,f:1,b:0,d:0},d:'Fonceur increvable : clones, Rasengan au contact, chakra de Kyûbi et Rasenshuriken'},
 {n:'Sasuke',full:'Sasuke Uchiha',g:0,side:1,nat:3,clan:0,voie:2,pass:'crit',sty:'Kenjutsu',j:['Chidori','Shunshin Uchiha','Katon : Gôkakyû','Sharingan','Raiton : Kirin'],l:{v:0,t:9,c:6,h:15,p:0,k:3,a:0,f:0,b:8,d:0},d:'Sabre et foudre : Chidori qui perce, Sharingan qui lit, Kirin qui achève'},
 {n:'Sakura',full:'Sakura Haruno',g:0,side:0,nat:4,clan:-1,voie:0,pass:'regen',sty:'Taijutsu',j:['Ôkashô','Saut ninja','Scalpel de chakra','Shôsen','Doton : Grand séisme'],l:{v:0,t:10,c:7,h:2,p:0,k:2,a:0,f:0,b:3,d:0},d:'Médecin de choc : poings qui fendent le sol et soins rapides'},
 {n:'Kakashi',full:'Kakashi Hatake',g:0,side:0,nat:3,clan:-1,voie:1,pass:'crit',sty:'Kunai',j:['Raikiri','Shunshin','Chiens ninja','Raiton : Kage Bunshin','Raiton : Kirin'],l:{v:0,t:1,c:8,h:8,p:0,k:0,a:1,f:0,b:1,d:0},d:'Ninja copieur : ses chiens entravent, le Raikiri transperce'},
 {n:'Itachi',full:'Itachi Uchiha',g:1,side:1,nat:0,clan:0,voie:2,pass:'energy',sty:'Taijutsu Uchiha',j:['Katon : Gôkakyû','Shunshin Uchiha','Sharingan : Genjutsu','Sharingan','Tsukuyomi'],l:{v:0,t:2,c:9,h:1,p:0,k:1,a:0,f:3,b:2,d:0},d:'Maître du genjutsu : corbeaux, regard qui paralyse, Tsukuyomi'},
 {n:'Deidara',full:'Deidara',g:1,side:1,nat:4,clan:-1,voie:2,pass:'crit',sty:'Kunai',j:['Argile explosive','Saut ninja','Clone explosif','Parchemin explosif','Pluie de parchemins'],l:{v:4,t:2,c:10,h:0,p:0,k:4,a:3,f:0,b:2,d:0},d:'L\'art est une explosion : oiseaux d\'argile, clones piégés, « Katsu ! »'},
 {n:'Kisame',full:'Kisame Hoshigaki',g:1,side:1,nat:1,clan:-1,voie:0,pass:'lifesteal',sty:'Taijutsu',j:['Suiton : Suikôdan','Suiton : Corps liquide','Suiton : Suirô','Suiton : Daibakufu','Suiton : Dôme des requins'],l:{v:2,t:2,c:11,h:13,p:5,k:0,a:0,f:8,b:2,d:3},d:'Requin de Kiri : requins d\'eau, prison aqueuse, Samehada qui dévore le chakra'},
 {n:'Sasori',full:'Sasori',g:1,side:1,nat:0,clan:8,voie:2,pass:'slow',sty:'Marionnette',j:['Lances de sable','Sable volant','Katon : Triple flamme','Armure de sable','Tsunami de sable'],l:{v:1,t:2,c:12,h:7,p:0,k:1,a:0,f:0,b:2,d:0},d:'Marionnettiste : sa marionnette empoisonne, le sable de fer pique de loin'},
 {n:'Hidan',full:'Hidan',g:1,side:1,nat:3,clan:-1,voie:0,pass:'armor',sty:'Taijutsu',j:['Fûma Shuriken','Kunai à fil','Byakugô','Barrière Shishienjin','Raiton : Armure de foudre'],l:{v:8,t:2,c:13,h:8,p:4,k:1,a:0,f:0,b:2,d:4},d:'Immortel de Jashin : faux à câble, plaies qui se referment, rituel sans issue'},
 {n:'Pain',full:'Pain (Nagato)',g:1,side:1,nat:4,clan:6,voie:2,pass:'energy',sty:'Chaîne scellante',j:['Chaîne-harpon','Sceau d\'échange','Doton : Kajûgan','Parchemin de stockage','Doton : Chute de montagne'],l:{v:7,t:2,c:14,h:10,p:0,k:3,a:0,f:9,b:2,d:0},d:'Rinnegan : il attire, absorbe les jutsu et écrase tout par la gravité'},
 {n:'Konan',full:'Konan',g:1,side:1,nat:2,clan:-1,voie:2,pass:'energy',sty:'Kunai',j:['Multiclonage de shuriken','Kage Bunshin : leurre','Parchemin explosif','Genjutsu : Plumes','Pluie de parchemins'],l:{v:7,t:2,c:15,h:11,p:4,k:5,a:0,f:0,b:8,d:0},d:'Ange de papier : nuées de shuriken, bombes de papier, pluie explosive'},
 {n:'Jiraiya',full:'Jiraiya',g:2,side:0,nat:4,clan:-1,voie:1,pass:'rage',sty:'Taijutsu',j:['Rasengan','Saut ninja','Doton : Yomi Numa','Multiclonage','Mode Ermite'],l:{v:0,t:14,c:16,h:4,p:0,k:0,a:0,f:7,b:7,d:2},d:'Ermite des crapauds : marécage, clones, Rasengan, puis le Mode Ermite'},
 {n:'Tsunade',full:'Tsunade',g:2,side:0,nat:4,clan:-1,voie:0,pass:'regen',sty:'Taijutsu',j:['Ôkashô','Shunshin','Byakugô','Shôsen','Invocation : Katsuyu'],l:{v:0,t:15,c:17,h:0,p:0,k:2,a:0,f:5,b:8,d:0},d:'Princesse des limaces : force titanesque, Byakugô et soins de Katsuyu'},
 {n:'Orochimaru',full:'Orochimaru',g:2,side:1,nat:2,clan:-1,voie:2,pass:'energy',sty:'Taijutsu',j:['Serpents de l\'ombre','Kage Bunshin : leurre','Rashômon','Barrière Shishienjin','Invocation : Manda'],l:{v:5,t:16,c:18,h:1,p:6,k:3,a:0,f:10,b:8,d:0},d:'Sannin des serpents : morsures qui attirent, portail Rashômon et Manda'},
 {n:'Hiruzen',full:'Hiruzen Sarutobi',g:2,side:0,nat:0,clan:-1,voie:1,pass:'energy',sty:'Kunai',j:['Multiclonage de shuriken','Shunshin','Katon : Dragon de feu','Multiclonage','Katon : Grand souffle de feu'],l:{v:0,t:12,c:3,h:9,p:1,k:4,a:4,f:11,b:8,d:0},d:'Professeur aux mille jutsu : shuriken démultipliés, dragon et souffle de feu'},
 {n:'Minato',full:'Minato Namikaze',g:2,side:0,nat:2,clan:-1,voie:1,pass:'speed',sty:'Kunai',j:['Rasengan','Hiraishin','Kunai explosifs','Contre du clone','Invocation : Crapaud'],l:{v:0,t:13,c:19,h:0,p:0,k:6,a:0,f:0,b:0,d:0},d:'Éclair jaune : kunai marqués, téléportation et Rasengan éclair'},
 {n:'Neji',full:'Neji Hyûga',g:3,side:0,nat:2,clan:1,voie:0,pass:'slow',sty:'Poing souple',j:['Hakke Kûshô','Pas du Hakke','Byakugan','Kaiten','Hakke : 128 points'],l:{v:0,t:4,c:20,h:14,p:0,k:5,a:0,f:0,b:0,d:0},d:'Génie du Jûken : paumes à distance, Kaiten qui renvoie tout, 128 points'},
 {n:'Rock Lee',full:'Rock Lee',g:3,side:0,nat:0,clan:10,voie:0,pass:'third',sty:'Taijutsu du fauve',j:['Lotus primaire','Poids retirés','Lotus caché','Première Porte','Huit Portes'],l:{v:0,t:11,c:21,h:1,p:0,k:2,a:0,f:12,b:5,d:0},d:'Taijutsu pur : poids lâchés, lotus et portes célestes'},
 {n:'Gaï',full:'Gaï Maito',g:3,side:0,nat:0,clan:10,voie:0,pass:'rage',sty:'Taijutsu du fauve',j:['Konoha Gôriki Senpû','Vitesse du fauve','Dynamic Entry','Porte de la Vie','Nuit de la mort'],l:{v:0,t:7,c:21,h:1,p:0,k:2,a:0,f:12,b:5,d:0},d:'Fauve sublime : Dynamic Entry, portes célestes et Nuit de la mort'},
 {n:'Shikamaru',full:'Shikamaru Nara',g:3,side:0,nat:0,clan:2,voie:1,pass:'energy',sty:'Fouet d\'ombre',j:['Kage Mane','Course de l\'ombre','Kage Kubi Shibari','Plan du stratège','Kage Nui'],l:{v:0,t:1,c:22,h:1,p:0,k:5,a:0,f:0,b:6,d:0},d:'Stratège : son ombre possède, étrangle et transperce'},
 {n:'Chôji',full:'Chôji Akimichi',g:3,side:0,nat:4,clan:3,voie:0,pass:'armor',sty:'Poing décuplé',j:['Chôdan Bakugeki','Boulet humain','Décuplement partiel','Pilule rouge','Mode Papillon'],l:{v:0,t:22,c:23,h:3,p:0,k:1,a:0,f:6,b:0,d:0},d:'Colosse Akimichi : boulet humain, poings géants, ailes de papillon'},
 {n:'Ino',full:'Ino Yamanaka',g:3,side:0,nat:1,clan:7,voie:2,pass:'energy',sty:'Senbon fleuris',j:['Kunai fleuri','Transposition','Shintenshin','Tempête de pétales','Esprit destructeur'],l:{v:0,t:23,c:24,h:12,p:0,k:3,a:0,f:0,b:5,d:0},d:'Kunoichi des esprits : elle possède l\'ennemi, pétales et esprit brisé'},
 {n:'Kiba',full:'Kiba Inuzuka',g:3,side:0,nat:4,clan:5,voie:0,pass:'speed',sty:'Crocs et griffes',j:['Gatsûga','Instinct bestial','Shikyaku','Marquage','Loup bicéphale'],l:{v:0,t:19,c:25,h:5,p:1,k:4,a:0,f:2,b:0,d:0},d:'Duo avec Akamaru : vrilles, bonds sauvages et loup à deux têtes'},
 {n:'Shino',full:'Shino Aburame',g:3,side:0,nat:4,clan:4,voie:1,pass:'lifesteal',sty:'Nuée d\'insectes',j:['Insectes chercheurs','Clone d\'insectes','Essaim d\'insectes','Mur d\'insectes','Nuée destructrice'],l:{v:0,t:18,c:3,h:14,p:0,k:2,a:2,f:0,b:0,d:0},d:'Maître des insectes : nuées qui traquent, rongent le chakra, dévorent les tirs'},
 {n:'Hinata',full:'Hinata Hyûga',g:3,side:0,nat:0,clan:1,voie:1,pass:'slow',sty:'Poing souple',j:['Jûho Sôshiken','Pas du Hakke','Byakugan','Kaiten','Hakke : 64 points'],l:{v:0,t:17,c:26,h:6,p:0,k:0,a:0,f:0,b:4,d:0},d:'Douceur du Jûken : lions jumeaux et protection des 64 points'},
 {n:'Tenten',full:'Tenten',g:3,side:0,nat:2,clan:-1,voie:1,pass:'crit',sty:'Kunai',j:['Fûma Shuriken','Kunai à fil','Sôshôryû','Piège ninja','Fûton : Tornade'],l:{v:0,t:24,c:4,h:5,p:0,k:0,a:0,f:0,b:0,d:2},d:'Maîtresse des armes : dragons de parchemins, pièges, tornade du Bashôsen'},
 {n:'Gaara',full:'Gaara',g:3,side:0,nat:2,clan:8,voie:2,pass:'armor',sty:'Balles de sable',j:['Cercueil de sable','Sable volant','Sable mouvant','Bouclier absolu','Funérailles du désert'],l:{v:1,t:20,c:27,h:3,p:0,k:4,a:0,f:4,b:8,d:1},d:'Bouclier de sable absolu : il emprisonne, enlise et ensevelit'},
 {n:'Kimimaro',full:'Kimimaro Kaguya',g:4,side:1,nat:4,clan:9,voie:0,pass:'third',sty:'Danse des os',j:['Doigts-balles','Bond d\'os','Forêt naissante','Danse du mélèze','Danse de la clématite'],l:{v:5,t:4,c:1,h:4,p:4,k:5,a:0,f:0,b:8,d:0},d:'Os vivants : balles d\'os, forêt d\'os et foreuse de la clématite'},
];
const PASSI=k=>Math.max(0,PASSK.indexOf(k));
// i : index dans PRESETS ; le nom et le camp du joueur sont gardés (sinon ceux du perso)
function presetBuild(i,name,side){const P=PRESETS[i],clan=P.clan,nat=P.nat;
 const b={name:name||(typeof MY!=='undefined'&&MY?MY.name:P.n),side:side??P.side,voie:P.voie,nat,clan,pass:PASSI(P.pass),l:Object.assign({},P.l),j:[STYLES.findIndex(x=>x[0]===P.sty)].concat(P.j.map((n,k)=>{const J=JL.find(j=>j.n===n&&stype(j.slot)===stype(k+1)&&(j.cat==='c'+clan||(clan!==TAIJ&&j.cat==='n'+nat)||(clan<0&&j.cat==='u')));return J?J.id:-1}))};
 return sanitizeBuild(b,true)}
// charge un perso dans ton ninja : ton nom est gardé, sauf « Ninja » ou le nom d'un autre perso (il prend alors celui du perso)
function applyPreset(i){const P=PRESETS[i],nm=!MY.name||MY.name==='Ninja'||PRESETS.some(q=>q.n===MY.name)?P.n:MY.name;MY=presetBuild(i,nm,MY.side);presetI=i;rebuildMine()}
// ---------- Cartes de l'arène ----------
const MAPS=[['Terrain d\'entraînement'],['Vallée de la Fin'],['Désert de Suna']];
const THEMES=[{sky:['#2a2650','#a8506a','#f3a65a'],floor:['#3e5a2c','#4f6e34'],line:'rgba(30,50,20,.18)',wall:['#6a4426','#4a2e18'],post:['#4a2e18','#9a6a3a','#3a2210','#b88a52']},
 {sky:['#1a2a4a','#4a6a8a','#a8c0d0'],floor:['#3a6a8a','#4a7a9a'],line:'rgba(200,230,255,.12)',wall:['#5a5a62','#3a3a42'],post:['#4a4a52','#8a8a92','#2a2a32','#9a9aa4']},
 {sky:['#5a2a1a','#c87a3a','#f3c87a'],floor:['#c8a060','#d8b070'],line:'rgba(120,80,30,.15)',wall:['#a07040','#7a5028'],post:['#7a5028','#c89a60','#5a3a1a','#d8b078']}];const THEME=()=>THEMES[CFG.map|0]||null; // table fixe : plus d'allocation par appel
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

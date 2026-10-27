// ===================== NINJAS : chacun crée son ninja et choisit son build =====================
// Les jutsu réutilisent les mécaniques éprouvées du moteur (SRC). Chaque entrée : [source perso.emplacement, nom, description, nom EX, description EX]
const JP=[
 [ // Clic G : attaque de base
  ['lando.0','Kunai','Lancer de kunai rapide','',''],
  ['deathtrooper.0','Shuriken','Trois shuriken en éventail','',''],
  ['rey.0','Taijutsu','Enchaînement de coups rapides','',''],
  ['yoda.0','Poing souple','Frappes du Jûken qui ralentissent','',''],
  ['ig88.0','Senbon','Aiguilles très rapides, longue portée','',''],
  ['mace.0','Lame de chakra','Grands coups de lame imprégnée de chakra','',''],
  ['vader.0','Grande épée','Coup lent et lourd qui ralentit','',''],
  ['palpatine.0','Raiton : Étincelles','Courts arcs électriques','',''],
  ['quigon.0','Poing du lotus','Chaque coup qui touche le soigne','',''],
 ],
 [ // Clic D : jutsu principal
  ['savage.1','Rasengan','Fonce avec une sphère de chakra qui projette en l\'air','Rasengan géant','Plus long et plus fort'],
  ['grievous.1','Chidori','Fente électrique qui traverse la cible','Chidori nagashi','Plus long, étourdit'],
  ['jango.1','Katon : Boule de feu','Grosse boule de feu qui repousse','Katon : Grand feu','Explosion plus large'],
  ['luke.1','Suiton : Vague','Cône d\'eau qui repousse et ralentit','Suiton : Raz-de-marée','Plus large, étourdit'],
  ['padme.1','Kage Mane','L\'ombre immobilise la cible','Ombre étendue','Plus longue'],
  ['ventress.1','Fûton : Lames de vent','Deux lames de vent qui transpercent','Fûton : Tempête','Plus de lames'],
  ['obiwan.1','Doton : Rocher','Projette un rocher qui envoie en l\'air','Doton : Éboulement','Plus gros'],
  ['quigon.1','Hakke : Paume','Paume du Hakke qui étourdit devant soi','Hakke : 64 points','Plus fort'],
  ['palpatine.1','Raiton : Chaîne','Éclair qui rebondit entre les ennemis','Raiton : Tonnerre','Plus de rebonds'],
  ['cadbane.1','Kunai à fil','Attrape un ennemi et le ramène','Fil d\'acier','Plus loin'],
  ['kylo.1','Sable : Étreinte','Le sable fige la cible sur place','Sable : Cercueil','Plus long'],
 ],
 [ // Espace : mobilité
  ['palpatine.2','Shunshin','Se téléporte dans un tourbillon de feuilles','',''],
  ['lando.2','Kawarimi','Se substitue à une bûche qui explose','',''],
  ['luke.2','Saut ninja','Bondit au curseur, choc à l\'arrivée','',''],
  ['quigon.2','Pas du vent','Très rapide 2 s, se libère des entraves','',''],
  ['yoda.2','Bonds acrobatiques','3 petits bonds rechargeables','',''],
  ['ventress.2','Hiraishin','Apparaît derrière l\'ennemi visé','',''],
  ['rey.2','Roulade','Roulade rapide','',''],
  ['jyn.2','Saut de l\'ombre','Saute loin, invisible à l\'arrivée','',''],
 ],
 [ // Q : contrôle / outil
  ['gideon.3','Multiclonage','Deux clones qui lancent des kunai 7 s','Clones d\'ombre','Dégâts doublés'],
  ['han.3','Parchemin explosif','Se colle au premier ennemi et explose','',''],
  ['lando.3','Bombe fumigène','Fumée : ralentit les ennemis, cache les alliés','',''],
  ['phasma.3','Doton : Mur de terre','Mur qui bloque les tirs','',''],
  ['cadbane.3','Genjutsu : Plumes','Les ennemis qui restent dedans s\'endorment','',''],
  ['wicket.3','Piège ninja','Piège qui étourdit et repousse','',''],
  ['vader.3','Suiton : Prison aqueuse','Enferme et étouffe à distance','',''],
  ['boba.3','Essaim d\'insectes','3 nuées qui empoisonnent','',''],
  ['vader.1','Fûma Shuriken','Shuriken géant qui revient','',''],
  ['iden.1','Chien ninja','Un ninken le suit et attaque 8 s','',''],
 ],
 [ // E : défense / soutien
  ['rey.4','Shôsen','Soigne l\'allié le plus blessé','',''],
  ['yoda.3','Zone de soin','Zone de chakra médical autour de soi','',''],
  ['obiwan.4','Kaiten','Tourbillon divin qui renvoie les tirs','',''],
  ['thrawn.4','Armure de sable','Bouclier pour les alliés proches','',''],
  ['lando.4','Byakugan','Bloque le chakra de la cible (silence) et la révèle','',''],
  ['deathtrooper.4','Peau de pierre','40 % de dégâts en moins','',''],
  ['ahsoka.4','Réflexes','Évite le prochain coup et accélère','',''],
  ['luke.4','Contre du clone','Contre le prochain coup : apparaît derrière l\'attaquant','',''],
  ['savage.4','Première Porte','Inarrêtable 3 s','',''],
  ['yoda.4','Absorption de chakra','Absorbe les tirs et se soigne','',''],
 ],
 [ // R : ultime
  ['chewie.5','Chakra de Kyûbi','6 s : inarrêtable, régénération et dégâts','',''],
  ['thrawn.5','Fûton : Rasen-shuriken','Un Rasen-shuriken s\'abat sur une grande zone','',''],
  ['ahsoka.5','Amaterasu','Flammes noires sur jusqu\'à 5 ennemis','',''],
  ['luke.5','Tsukuyomi','Immense cône qui projette et étourdit','',''],
  ['palpatine.5','Shinra Tensei','Énorme onde qui repousse tout autour','',''],
  ['wicket.5','Invocation : Crapaud géant','Un crapaud géant s\'écrase et laisse un sol boueux','',''],
  ['bossk.5','Huit Portes','Rage, vitesse et vol de vie 5 s','',''],
  ['savage.5','Susanô','Devient énorme 6 s : bouclier, dégâts et portée','',''],
  ['rex.5','Pluie de parchemins','4 parchemins explosifs sur la zone','',''],
  ['anakin.5','Éclair jaune','Frappe jusqu\'à 4 ennemis d\'affilée','',''],
  ['grievous.5','Tsunami de sable','Tourbillon géant qui aspire','',''],
 ]];
const SLOTN=['Attaque de base','Jutsu principal','Déplacement','Technique','Défense','Ultime'];
// passifs renommés
Object.assign(PASS,{third:['Taijutsu',PASS.third[1]],crit:['Précision ninja',PASS.crit[1]],slow:['Fils de chakra',PASS.slow[1]],lifesteal:['Vol de chakra',PASS.lifesteal[1]],rage:['Volonté du feu',PASS.rage[1]],
 armor:['Corps endurci',PASS.armor[1]],regen:['Sang Uzumaki',PASS.regen[1]],speed:['Pieds légers',PASS.speed[1]],energy:['Contrôle du chakra',PASS.energy[1]]});
const PASSK=Object.keys(PASS);
// voies : modifient PV, vitesse et puissance
const VOIES=[['Taijutsu',1.12,6,.95],['Équilibré',1,0,1],['Ninjutsu',.9,-4,1.08]];
const CAMPS=['Alliance Shinobi','Akatsuki'];
const VILLAGES=[['Konoha','#1f3a6a'],['Suna','#7a5a2a'],['Kiri','#2a5a6a'],['Kumo','#3a3a4a'],['Iwa','#5a3a2a'],['Oto','#4a2a5a'],['Nukenin','#2a2a2a']];
const TENUES=[['Tenue orange',{legs:'#2a3550',torso:'#f08a24',arm:'#f08a24',belt:'#2a3550',boot:'#1a2a48'}],['Gilet de chûnin',{legs:'#1f2c48',torso:'#26365a',vest:'#5a6e3a',arm:'#26365a',belt:'#1a2238',boot:'#1a2238'}],
 ['Manteau Akatsuki',{legs:'#16161c',torso:'#16161c',robe:'#16161c',clouds:1,arm:'#16161c',boot:'#2a2a33'}],['Tenue Anbu',{legs:'#2a2a30',torso:'#3a3a42',armor:'#c8ccd4',arm:'#2a2a30',belt:'#555',boot:'#222'}],
 ['Kimono Hyûga',{legs:'#d8d0c0',torso:'#ece6da',robe:'#ddd6c8',arm:'#ece6da',belt:'#6a5a8a',boot:'#5a5060'}],['Tenue Uchiha',{legs:'#d8d8dc',torso:'#1c2238',tunic:'#2a3050',arm:'#1c2238',belt:'#6a2a2a',boot:'#222'}],
 ['Tenue de Suna',{legs:'#6a5038',torso:'#8a6a48',cape:'#5a4030',arm:'#8a6a48',belt:'#3a2a1a',boot:'#3a2a1a'}],['Tenue verte',{legs:'#3a7a3a',torso:'#4a8a3a',vest:'#5a6e3a',arm:'#4a8a3a',belt:'#c03a2a',boot:'#c8b080'}]];
const COIFS=[['Pics','pics'],['Lisses','lisse'],['Queue haute','queue'],['Courts','courts'],['Chignons','chignons'],['Crâne rasé','chauve']];
const HAIRC=[['Blond','#f2c84a'],['Noir','#1a1a22'],['Rose','#f08ab0'],['Roux','#c0482a'],['Blanc','#e8e8f0'],['Brun','#6b4a2a'],['Bleu nuit','#2a3a6a'],['Rouge','#b8202a']];
const PEAUX=[['Claire','#f6d6b4'],['Mate','#e0b08a'],['Hâlée','#b8805a'],['Foncée','#7a5038'],['Pâle','#e8e0e8']];
const CHAKRAS=[['Bleu','#3af'],['Rouge','#f33'],['Vert','#3f6'],['Violet','#a5f'],['Orange','#f93'],['Blanc','#eef'],['Jaune','#fd3']];
const ACCS=[['Aucun',''],['Masque','masque'],['Moustaches','moust'],['Marques rouges','marques'],['Lunettes','lunettes']];
// build : {name, side, voie, j:[6 index], pass, l:{v,t,c,h,p,k,a}}
function sanitizeBuild(b){b=b&&typeof b==='object'?b:{};const n=(a,m)=>Math.max(0,Math.min(m-1,(a|0)));const l=b.l||{};
 return{name:String(b.name||'Ninja').replace(/[<>]/g,'').slice(0,16)||'Ninja',side:b.side?1:0,voie:n(b.voie??1,VOIES.length),j:[0,1,2,3,4,5].map(s=>n((b.j||[])[s],JP[s].length)),pass:n(b.pass,PASSK.length),
  l:{v:n(l.v,VILLAGES.length),t:n(l.t,TENUES.length),c:n(l.c,COIFS.length),h:n(l.h,HAIRC.length),p:n(l.p,PEAUX.length),k:n(l.k,CHAKRAS.length),a:n(l.a,ACCS.length)}}}
function ninjaLook(l){const v=VILLAGES[l.v];return Object.assign({},TENUES[l.t][1],{head:{t:'ninja',skin:PEAUX[l.p][1],hair:HAIRC[l.h][1],style:COIFS[l.c][1],band:v[1],vil:l.v,acc:ACCS[l.a][1]},weapon:{t:'kunai',col:CHAKRAS[l.k][1]}})}
function jutsu(s,i){const [src,n,d,xn,xd]=JP[s][i],[h,k]=src.split('.'),b=SRC[h].abil[+k];return Object.assign({},b,{n,d,ex:b.ex?{n:xn||n,d:xd||b.ex.d,p:b.ex.p}:null,src:h})}
// stats : moyenne des persos d'origine des jutsu (l'attaque de base compte double), puis la voie
function mkNinja(b){b=sanitizeBuild(b);const abil=b.j.map((i,s)=>jutsu(s,i)),w=[2,1,1,1,1,1];let hp=0,pw=0,sp=0,W=0;
 abil.forEach((a,s)=>{const o=SRC[a.src];hp+=o.hp*w[s];pw+=o.pw*w[s];sp+=o.spd*w[s];W+=w[s]});const v=VOIES[b.voie];
 return{name:b.name,side:b.side,desc:`${v[0]} · ${VILLAGES[b.l.v][0]} · ${CAMPS[b.side]}`,hp:Math.round(hp/W*v[1]),spd:Math.round(sp/W+v[2]),pw:Math.round(pw/W*v[3]*100)/100,pref:200,pass:PASSK[b.pass],look:ninjaLook(b.l),abil,build:b}}
// générateur pseudo-aléatoire déterministe (mêmes ninjas adverses chez tous les joueurs en ligne)
const srnd=seed=>()=>(seed=seed*16807%2147483647)/2147483647;
function randomBuild(r,side,name){const k=a=>Math.floor(r()*a.length);
 return sanitizeBuild({name,side,voie:k(VOIES),j:JP.map(p=>k(p)),pass:k(PASSK),l:{v:side&&r()<.6?6:k(VILLAGES.slice(0,6)),t:side?(r()<.55?2:k(TENUES)):[0,1,3,4,5,6,7][k([0,1,3,4,5,6,7])],c:k(COIFS),h:k(HAIRC),p:k(PEAUX),k:k(CHAKRAS),a:r()<.6?0:k(ACCS)}})}
const BOTN=[['Hayate','Kaito','Ren','Sora','Yuki','Haruto','Aiko','Daichi','Emi','Hikaru','Kenji','Mitsuki','Natsu','Riku','Saki','Takumi','Yori','Asuka','Jiro','Kaede'],
 ['Kurogane','Akuma','Raijin','Mizore','Shiden','Gekkô','Hebi','Kagerô','Oboro','Tetsu','Jaku','Kirisame','Yami','Rasetsu','Kuroi','Hyôga','Doku','Zangetsu','Mukuro','Shura']];
const CH={};{const r=srnd(4242);for(let s=0;s<2;s++)BOTN[s].forEach((n,i)=>{CH['b'+(s*20+i)]=mkNinja(randomBuild(r,s,n))})}
const HEROES=Object.keys(CH);
// ton ninja (gardé dans le navigateur)
let MY;try{MY=sanitizeBuild(JSON.parse(localStorage.getItem('nrBuild')||'null')||randomBuild(srnd(Date.now()%2147483647||1),0,'Ninja'))}catch(e){MY=randomBuild(srnd(99),0,'Ninja')}
CH.p0=mkNinja(MY);

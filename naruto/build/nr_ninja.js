// ===================== NINJAS : chacun crée son ninja et compose son kit =====================
// Kit = style de combat (attaque de base, selon le clan) + jutsu de clan (ou Subjutsu si sans clan) + jutsu d'une nature.
// Les jutsu réutilisent les mécaniques éprouvées du moteur (SRC) avec leurs propres effets visuels (vfx).
// Rangs D C B A S = coût en points ; le kit (5 jutsu) a un budget maximum. Pas de versions EX dans ce jeu.
const RANKS={D:1,C:2,B:3,A:4,S:5},RANKC={D:'#9aa3ad',C:'#6fcf6f',B:'#5ab4ff',A:'#c07aff',S:'#ffc53a'},BUDGET=17;
const NATURES=[['Katon','Feu','#ff7a2a'],['Suiton','Eau','#3aa8ff'],['Fûton','Vent','#9fe8c8'],['Raiton','Foudre','#ffe14a'],['Doton','Terre','#b08850']];
const CLANS=[['Uchiha','#c0202a'],['Hyûga','#d8d0f0'],['Nara','#5a6a3a'],['Akimichi','#d87a3a'],['Aburame','#4a6a5a'],['Inuzuka','#a04a2a'],['Uzumaki','#e0503a'],['Yamanaka','#c8a0e0'],['Sabaku','#c8a060'],['Kaguya','#e8e8e0'],['Taijutsuka','#4aa83a'],
 // clans ajoutés (c11-c20) : 3e champ = sigle de l'icône (le 1er lettre ne suffit plus à les distinguer)
 ['Hoki','#8ab83a','Hk'],['Roran','#e0b84a','Ro'],['Hakumei','#6a4a8a','Hm'],['Shirogane','#a8b4c8','Sg'],['Chinoike','#9a1424','Ci'],
 ['Kami','#7a9ae0','Km'],['Fûma','#5a5a6e','Fm'],['Hoshigaki','#4a7a9a','Hs'],['Hôzuki','#4ac8d8','Hz'],['Yuki','#bfe6ff','Yu']];
const clanTag=c=>CLANS[c]?CLANS[c][2]||CLANS[c][0][0]:'?'; // sigle d'un clan (icônes)
const TAIJ=10; // le clan Taijutsuka n'a pas de nature : uniquement du taijutsu
// styles de combat (attaque de base) : [nom, description, source, vfx, arme, clans autorisés (-1 = sans clan), modif. PV, modif. puissance]
// styles de combat : voir kits/styles.js
// un clan qui n'a (encore) aucun style propre peut prendre les styles « sans clan » (Taijutsu, Kunai au poing, Kenjutsu, Kubikiribôchô)
const styleOk=(s,clan)=>STYLES[s][5].includes(clan)||(clan>=0&&STYLES[s][5].includes(-1)&&!STYLES.some(x=>x[5].includes(clan)));
// style signature du clan (réservé au clan, pas aux sans-clan) : -1 s'il n'y en a pas ; c'est le style par défaut quand on choisit le clan
const clanStyle=c=>c<0?-1:STYLES.findIndex(x=>x[5].includes(c)&&!x[5].includes(-1));
// [catégorie, emplacement 1-5, rang, source perso.sort, nom, description, effet visuel]
// catégorie : 'u' Subjutsu (sans clan), 'n0'..'n4' nature, 'c0'..'c20' clan (CLANS.length)
/*NR_NATURE*/
const JD=KITROWS; // le catalogue est assemblé par les fichiers kits/*.js (un par catégorie)
// réglages propres à certains jutsu (réglés par duels simulés)
const JPAR={'Multiclonage':{d:1.2},'Ninken':{d:3},'Insectes dévoreurs':{dps:4}};
const JCD={'Lotus primaire':10,'Lotus caché':9}; // temps de recharge propres à certains jutsu
// équilibrage par clan (-1 = sans clan) et par nature : [multiplicateur PV, multiplicateur puissance], réglés par duels simulés
// réglés à nouveau pour l'ambiance NRP (PV ×1,2 puis ×1,1, chakra rare) : duels simulés de chaque clan / nature contre des kits aléatoires, 45-55 % visés
// puis pour les 21 clans (Hoki … Yuki, refonte Uzumaki) : duels 1v1 sans soin, 46-56 % pour chaque clan / nature ; les clans aux combats trop courts
// (Nara, Uzumaki, Hoki, Shirogane, Chinoike, Hôzuki, Katon) ont plus de PV et moins de puissance : duel médian ≈ 50 s
const CLANBAL={"0":[0.75,0.69],"1":[0.79,0.72],"2":[1.35,0.99],"3":[0.99,0.98],"4":[1.04,1.04],"5":[1.4,1.32],"6":[1.13,0.82],"7":[1.29,1.25],"8":[0.99,0.95],"9":[0.9,0.88],"10":[0.89,0.89],"11":[1.13,0.78],"12":[0.98,0.95],"13":[1.09,1.08],"14":[1.22,0.84],"15":[1.12,0.86],"16":[1.06,1.06],"17":[1.03,1.03],"18":[0.98,0.98],"19":[1.03,0.9],"20":[1.08,1.01],"-1":[0.92,0.95]},NATBAL={"0":[1.15,0.9],"1":[1.05,1.03],"2":[0.95,0.91],"3":[1.02,1.01],"4":[0.98,0.98]},STYLEBAL={'2:-1':[.9,.84]}; // STYLEBAL[style] ou STYLEBAL['style:clan'] = [PV, puissance] (Kenjutsu sans clan : réglé pour les PV/puissance des sans-clan)
const JL=JD.map(([cat,slot,r,src,n,d,vfx],id)=>({id,cat,slot,r,cost:RANKS[r],src,n,d,vfx,P:JPAR[n]}));
const SLOTN=['Style de combat','Jutsu','Déplacement','Jutsu','Jutsu','Ultime'];
const stype=s=>s===2?2:s===5?5:1; // 1 = jutsu (Clic D, Q, E), 2 = déplacement, 5 = ultime
const catName=c=>c==='u'?'Subjutsu':c[0]==='n'?NATURES[+c.slice(1)][0]:'Clan '+CLANS[+c.slice(1)][0];
const catCol=c=>c==='u'?'#c8b89a':c[0]==='n'?NATURES[+c.slice(1)][2]:CLANS[+c.slice(1)][1];
// jutsu accessibles : jutsu de clan (ou Subjutsu sans clan) + jutsu de sa nature (les Taijutsuka n'ont pas de nature)
const avail=(b,slot)=>JL.filter(j=>stype(j.slot)===stype(slot)&&((b.clan>=0?j.cat==='c'+b.clan:j.cat==='u')||(b.clan!==TAIJ&&j.cat==='n'+b.nat)));
const kitCost=b=>b.j.slice(1).reduce((a,id)=>a+JL[id].cost,0);
// passifs renommés
Object.assign(PASS,{third:['Taijutsu',PASS.third[1]],crit:['Précision ninja',PASS.crit[1]],slow:['Fils de chakra',PASS.slow[1]],lifesteal:['Vol de chakra',PASS.lifesteal[1]],rage:['Volonté du feu',PASS.rage[1]],
 armor:['Corps endurci',PASS.armor[1]],regen:['Sang Uzumaki',PASS.regen[1]],speed:['Pieds légers',PASS.speed[1]],energy:['Contrôle du chakra','Recharge (R) et régénération du chakra +50 %']});
const PASSK=Object.keys(PASS);
// voies : modifient PV, vitesse et puissance
const VOIES=[['Taijutsu',1.12,6,.95],['Équilibré',1,0,1],['Ninjutsu',.9,-4,1.08]];
const CAMPS=['Alliance Shinobi','Akatsuki'];
const VILLAGES=[['Konoha','#1f3a6a'],['Suna','#7a5a2a'],['Kiri','#2a5a6a'],['Kumo','#3a3a4a'],['Iwa','#5a3a2a'],['Oto','#4a2a5a'],['Nukenin','#2a2a2a'],['Ame','#4a5a6a'],['Yu','#6a4a3a']];
const TENUES=[['Tenue orange',{legs:'#2a3550',torso:'#f08a24',arm:'#f08a24',belt:'#2a3550',boot:'#1a2a48'}],['Gilet de chûnin',{legs:'#1f2c48',torso:'#26365a',vest:'#5a6e3a',arm:'#26365a',belt:'#1a2238',boot:'#1a2238'}],
 ['Manteau Akatsuki',{legs:'#16161c',torso:'#16161c',robe:'#16161c',clouds:1,arm:'#16161c',boot:'#2a2a33'}],['Tenue Anbu',{legs:'#2a2a30',torso:'#3a3a42',armor:'#c8ccd4',arm:'#2a2a30',belt:'#555',boot:'#222'}],
 ['Kimono Hyûga',{legs:'#d8d0c0',torso:'#ece6da',robe:'#ddd6c8',arm:'#ece6da',belt:'#6a5a8a',boot:'#5a5060'}],['Tenue Uchiha',{legs:'#d8d8dc',torso:'#1c2238',tunic:'#2a3050',arm:'#1c2238',belt:'#6a2a2a',boot:'#222'}],
 ['Tenue de Suna',{legs:'#6a5038',torso:'#8a6a48',cape:'#5a4030',arm:'#8a6a48',belt:'#3a2a1a',boot:'#3a2a1a'}],['Tenue verte',{legs:'#3a7a3a',torso:'#4a8a3a',vest:'#5a6e3a',arm:'#4a8a3a',belt:'#c03a2a',boot:'#c8b080',warm:'#f08a24'}],
 // tenues des personnages célèbres (drapeaux : yoke épaules, open col en V, rope corde à nœud, fan éventail Uchiha, disc cercle dans le dos, rshort robe courte, warm jambières,
 // haori manteau ouvert (+ trim bordure, dots pois, hsl manches), collar col montant, hood capuche up/down/chat, fur col de fourrure, sash écharpe ; arm/legs 'skin' = bras ou jambes nus)
 ['Veste orange et noire',{legs:'#f08a24',torso:'#f08a24',yoke:'#1c1c26',arm:'#f08a24',belt:'#1c1c26',boot:'#1a2238'}],['Chemise blanche',{legs:'#2a2a3a',torso:'#ecebf0',arm:'#ecebf0',open:1,rope:'#6a4aa8',fan:1,boot:'#222'}],
 ['Qipao rouge',{legs:'#2a2a38',torso:'#c8283a',robe:'#c8283a',rshort:1,arm:'skin',disc:'#ffffff',boot:'#2a2a38'}],['Combinaison verte',{legs:'#3f8f3a',torso:'#3f8f3a',arm:'#3f8f3a',belt:'#c03a2a',warm:'#f08a24',boot:'#c8b080'}],
 ['Robe de Kage',{legs:'#e8e6de',torso:'#efeee8',robe:'#efeee8',trim:'#c0202a',arm:'#efeee8',belt:'#c0202a',boot:'#5a4a3a'}],['Manteau du Hokage',{legs:'#26365a',torso:'#26365a',vest:'#5a6e3a',arm:'#26365a',haori:'#f2f0ea',hsl:1,trim:'#d03a2a',belt:'#1a2238',boot:'#1a2238'}],
 ['Tenue de Sannin',{legs:'#5a6a3a',torso:'#5a6a3a',arm:'#5a6a3a',haori:'#b8302a',dots:'#e8c040',belt:'#2a2a2a',boot:'#7a5a3a'}],['Haori vert',{legs:'#2a3550',torso:'#9a9aa6',arm:'#9a9aa6',haori:'#4a8a4a',hsl:1,belt:'#2a3a6a',boot:'#2a2a33'}],
 ['Tenue du serpent',{legs:'#3a3a48',torso:'#d8d2c0',robe:'#d8d2c0',rshort:1,arm:'#d8d2c0',rope:'#6a3a9a',boot:'#2a2a33'}],['Veste lavande',{legs:'#2a2a50',torso:'#e2dcee',arm:'#e2dcee',belt:'#8a6ab0',boot:'#2a2a50'}],
 ['Long manteau',{legs:'#3a3a42',torso:'#6a7466',robe:'#6a7466',arm:'#6a7466',collar:'#5e685a',hood:'up',boot:'#2a2a33'}],['Veste à fourrure',{legs:'#2a2a38',torso:'#5a5a64',arm:'#5a5a64',fur:'#ece6da',belt:'#2a2a38',boot:'#2a2a33'}],
 ['Manteau rouge de Suna',{legs:'#3a2a2a',torso:'#8a2a2a',robe:'#8a2a2a',arm:'#8a2a2a',sash:'#d8d0c0',boot:'#3a2a1a'}],['Combinaison à capuche',{legs:'#1c1c24',torso:'#1c1c24',arm:'#1c1c24',hood:'chat',belt:'#5a4a8a',boot:'#222'}],
 ['Armure Akimichi',{legs:'#3a3a40',torso:'#3a3a40',armor:'#b02a2a',arm:'#3a3a40',belt:'#d8c060',boot:'#222'}],['Tenue violette',{legs:'#e8e2d6',torso:'#7a4a9a',robe:'#7a4a9a',rshort:1,arm:'skin',boot:'#3a2a4a'}],
 ['Tenue chinoise rose',{legs:'#4a5a3a',torso:'#e88aa8',arm:'#e88aa8',belt:'#c03a5a',boot:'#2a2a33'}]];
const COIFS=[['Pics','pics'],['Lisses','lisse'],['Queue haute','queue'],['Courts','courts'],['Chignons','chignons'],['Crâne rasé','chauve'],
 ['Mèches de canard','sasuke'],['Carré court','carre'],['Pics obliques','kakashi'],['Queue basse','itachi'],['Demi-queue et mèche','deidara'],['Pics de requin','requin'],['Ébouriffés','sasori'],['Plaqués en arrière','plaque'],
 ['Pics hérissés','pain'],['Chignon et fleur','konan'],['Crinière d\'ermite','jiraiya'],['Deux queues basses','tsunade'],['Longs raides','orochimaru'],['Pics et longues mèches','minato'],['Longs attachés','neji'],
 ['Coupe au bol','bol'],['Ananas','ananas'],['Pics sous bandeau','choji'],['Longue queue et mèche','ino'],['Sauvages','kiba'],['Coupe hime','hinata'],['Courts en pics','gaara'],['Quatre couettes','temari']];
const HAIRC=[['Blond','#f2c84a'],['Noir','#1a1a22'],['Rose','#f08ab0'],['Roux','#c0482a'],['Blanc','#e8e8f0'],['Brun','#6b4a2a'],['Bleu nuit','#2a3a6a'],['Rouge','#b8202a'],['Argenté','#c8ccd6'],['Gris','#8a8a92'],['Orange','#e8702a'],['Lavande','#7a6ab8'],['Blond pâle','#f2e09a'],['Bleu acier','#3a5a8a'],['Châtain foncé','#3a2618'],['Noir bleuté','#1c2238']];
const PEAUX=[['Claire','#f6d6b4'],['Mate','#e0b08a'],['Hâlée','#b8805a'],['Foncée','#7a5038'],['Pâle','#e8e0e8'],['Bleu requin','#7c9cb4'],['Blafarde','#f0eee6'],['Rosée','#fae2d0']];
const CHAKRAS=[['Bleu','#3af'],['Rouge','#f33'],['Vert','#3f6'],['Violet','#a5f'],['Orange','#f93'],['Blanc','#eef'],['Jaune','#fd3']];
const ACCS=[['Aucun',''],['Masque','masque'],['Lunettes noires','lunettes'],['Lunette de visée','visee'],['Chapeau de Kage','kage'],['Masque Anbu','anbu'],['Fleur de papier','fleur']];
// marques du visage (certaines changent les yeux : Rinnegan, yeux de serpent, yeux de requin, yeux ronds)
const FACES=[['Aucune',''],['Moustaches','moust'],['Crocs rouges','marques'],['Cernes','cernes'],['Tatouage « amour »','gaara'],['Losange','losange'],['Spirales','spirales'],['Traits d\'ermite','ermite'],
 ['Branchies','branchies'],['Rinnegan et piercings','pain'],['Fard du serpent','fard'],['Rides et barbiche','rides'],['Gros sourcils','sourcils'],['Peinture de guerre','kankuro'],['Cicatrice','cicatrice'],['Barbe','barbe']];
// façon de porter le bandeau
const BANDS=[['Au front','front'],['Œil caché','oblique'],['Barré (renégat)','barre'],['Serre-tête','tete'],['Au cou','cou'],['À la taille','taille'],['Au bras','bras'],['Cornes d\'ermite','cornes'],['Sans bandeau','']];
// porté dans le dos
const BACKS=[['Rien',''],['Gourde de sable','gourde'],['Grand parchemin','parchemin'],['Épée bandée','samehada'],['Faux tripale','faux'],['Éventail géant','eventail'],['Fûma shuriken','fuma'],['Katana','katana']];
const EYEF={pain:'rin',fard:'ser',branchies:'req',sourcils:'rond'}; // yeux propres à certaines marques (si le clan n'en impose pas)
// build : {name, side, voie, nat, clan (-1 = sans clan), j:[style, 5 id de jutsu], pass, l:{v,t,c,h,p,k,a,f,b,d}} (f visage, b bandeau, d dos)
// strict : ramène le kit sous le budget (pour les builds reçus en ligne et les bots)
function sanitizeBuild(b,strict){b=b&&typeof b==='object'?b:{};const n=(a,m)=>Math.max(0,Math.min(m-1,(a|0)));const l=b.l||{};
 const o={name:String(b.name||'Ninja').replace(/[<>]/g,'').slice(0,16)||'Ninja',side:b.side?1:0,voie:n(b.voie??1,VOIES.length),nat:n(b.nat,NATURES.length),clan:b.clan==null?-1:Math.max(-1,Math.min(CLANS.length-1,b.clan|0)),pass:n(b.pass,PASSK.length),
  l:{v:n(l.v,VILLAGES.length),t:n(l.t,TENUES.length),c:n(l.c,COIFS.length),h:n(l.h,HAIRC.length),p:n(l.p,PEAUX.length),k:n(l.k,CHAKRAS.length),a:n(l.a,ACCS.length),f:n(l.f,FACES.length),b:n(l.b,BANDS.length),d:n(l.d,BACKS.length)}};
 const st=(b.j||[])[0];o.j=[STYLES[st]&&styleOk(st,o.clan)?st:clanStyle(o.clan)>=0?clanStyle(o.clan):STYLES.findIndex((_,i)=>styleOk(i,o.clan))];
 for(let s=1;s<6;s++){const A=avail(o,s).filter(j=>!o.j.slice(1).includes(j.id)),id=(b.j||[])[s];o.j.push(A.some(j=>j.id===id)?id:A.reduce((a,c)=>c.cost<a.cost?c:a).id)}
 if(strict)while(kitCost(o)>budgetOf(o)){let best=null;o.j.forEach((id,s)=>{if(!s)return;for(const c of avail(o,s))if(c.cost<JL[id].cost&&!o.j.slice(1).includes(c.id)){const gain=JL[id].cost-c.cost;if(!best||gain>best.g)best={s,id:c.id,g:gain}}});if(!best)break;o.j[best.s]=best.id}
 return o}
// le clan se voit : Sharingan, Byakugan, carrure Akimichi, marques Kaguya, chien Inuzuka, gourde Sabaku (pas pour les marionnettistes) ; l'arme suit le style de combat
function ninjaLook(l,clan,style){const v=VILLAGES[l.v],S=STYLES[style]||STYLES[0],T=TENUES[l.t][1],sk=PEAUX[l.p][1],f=FACES[l.f|0][1],bk=BACKS[l.d|0][1];
 const o=Object.assign({},T,T.arm==='skin'?{arm:sk}:{},clan===3?{scale:1.14}:{},clan===5?{dog:1}:{},(clan===8&&S[0]!=='Marionnette')||bk==='gourde'?{gourd:1}:{},bk&&bk!=='gourde'?{back:bk}:{},
 {head:{t:'ninja',skin:sk,hair:HAIRC[l.h][1],style:COIFS[l.c][1],band:v[1],vil:l.v,bs:BANDS[l.b|0][1],acc:ACCS[l.a][1],face:f,eyeT:EYEF[f]||null,eye:clan===0?'#e01a1a':clan===1?'#e8e8f8':null,kaguya:clan===9,brows:clan===TAIJ||f==='sourcils'},weapon:{t:'kunai',k:S[4],col:CHAKRAS[l.k][1]}});if(CLOOK[clan])CLOOK[clan](o,l,S);return o}
const srcAb=src=>{const [h,k]=src.split('.');return h==='x'?NAT[k]:SRC[h].abil[+k]};
// personnage de référence pour les stats : option hero de la mécanique, sinon celui du préfixe (ka_, su_, sub_…)
const srcHero=src=>{const [h,k]=src.split('.');return h==='x'?(NAT[k]&&NAT[k].hero)||NATHERO[k.split('_')[0]]||NATHERO[k.slice(0,2)]:h};
// subjutsu, jutsu de clan et déplacements : pas de mudras (instantanés)
function jutsu(id){const J=JL[id],b=srcAb(J.src),mud=J.cat==='u'||J.cat[0]==='c'||J.slot===2?0:MUDRAS[J.r];return Object.assign({},b,J.P?{P:Object.assign({},b.P,J.P)}:{},JCD[J.n]?{cd:JCD[J.n]}:{},b.ult?{cd:22}:{},{cast:mud?mud*MUDRA_T:b.cast,mud,noTele:!b.line&&!b.tele,n:J.n,d:J.d,ex:null,src:srcHero(J.src),vfx:J.vfx,rank:J.r,jid:id})}
function styleAb(i){const S=STYLES[i],b=srcAb(S[2]);return Object.assign({},b,{n:S[0],d:S[1],ex:null,src:srcHero(S[2]),vfx:S[3],style:i})}
// stats : moyenne des persos d'origine (le style de combat compte pour 5), puis la voie, puis les réglages CLANBAL / NATBAL / STYLEBAL
function mkNinja(b,strict){b=sanitizeBuild(b,strict);const abil=[styleAb(b.j[0])].concat(b.j.slice(1).map(id=>jutsu(id))),w=[5,1,1,1,1,1];let hp=0,pw=0,sp=0,W=0;
 abil.forEach((a,s)=>{const o=SRC[a.src];hp+=o.hp*w[s];pw+=o.pw*w[s];sp+=o.spd*w[s];W+=w[s]});const v=VOIES[b.voie],S=STYLES[b.j[0]];hp*=S[6];pw*=S[7];if(b.clan===TAIJ){hp*=1.05;sp+=4*W}
 {const cb=CLANBAL[b.clan]||[1,1],nb=b.clan===TAIJ?[1,1]:NATBAL[b.nat]||[1,1],sb=STYLEBAL[b.j[0]+':'+b.clan]||STYLEBAL[b.j[0]]||[1,1];hp*=cb[0]*nb[0]*sb[0];pw*=cb[1]*nb[1]*sb[1]} // corps surentraîné : pas de ninjutsu, mais plus solide et plus rapide
 const lign=b.clan>=0?'Clan '+CLANS[b.clan][0]:'Sans clan';
 return{name:b.name,side:b.side,desc:`${lign}${b.clan===TAIJ?'':' · '+NATURES[b.nat][0]} · voie ${v[0].toLowerCase()}`,hp:Math.round(hp/W*v[1]*HPK),spd:Math.round(sp/W+v[2]),pw:Math.round(pw/W*v[3]*100)/100,clan:b.clan,nat:b.clan===TAIJ?-1:b.nat,pref:{bigfist:85,bone:90,sword:90,chain:90,fan:85,vine:85,puppet:95}[S[4]]||75,taij:b.clan===TAIJ,pass:PASSK[b.pass],look:ninjaLook(b.l,b.clan,b.j[0]),abil,build:b}}
// générateur pseudo-aléatoire déterministe (mêmes ninjas adverses chez tous les joueurs en ligne)
const srnd=seed=>()=>(seed=seed*16807%2147483647)/2147483647;
function randomKit(r,b){const k=a=>Math.floor(r()*a.length);b.nat=k(NATURES);b.clan=r()<.8?k(CLANS):-1;b.voie=k(VOIES);b.pass=k(PASSK);
 b=sanitizeBuild(b);const ST=STYLES.map((_,i)=>i).filter(i=>styleOk(i,b.clan));b.j=[ST[k(ST)]];for(let s=1;s<6;s++){const A=avail(b,s).filter(j=>!b.j.slice(1).includes(j.id));b.j.push(A[k(A)].id)}return sanitizeBuild(b,true)}
// apparence au hasard : les pièces très typées (chapeau de Kage, robe de Kage, peau de requin, objets dans le dos) restent rares
const RND_T=[0,1,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,24],RND_A=[0,0,0,0,0,0,1,2,3,5,6],RND_P=[0,0,1,1,2,3,4,7],RND_B=[0,0,0,0,0,0,0,1,3,4,5,6,8];
function randomBuild(r,side,name){const k=a=>Math.floor(r()*a.length),o=a=>a[k(a)],l={v:side&&r()<.6?6:k(VILLAGES.slice(0,6)),t:side?(r()<.55?2:k(TENUES)):o(RND_T),c:k(COIFS),h:k(HAIRC),p:o(RND_P),k:k(CHAKRAS),a:r()<.6?0:o(RND_A)};
 l.f=r()<.65?0:1+k(FACES.slice(1));if(l.f===11&&r()<.7)l.f=0;l.b=side&&r()<.5?2:o(RND_B);l.d=r()<.8?0:1+k(BACKS.slice(1));if(l.t===12)l.t=1;
 return randomKit(r,{name,side,l})}
const BOTN=[['Hayate','Kaito','Ren','Sora','Yuki','Haruto','Aiko','Daichi','Emi','Hikaru','Kenji','Mitsuki','Natsu','Riku','Saki','Takumi','Yori','Asuka','Jiro','Kaede'],
 ['Kurogane','Akuma','Raijin','Mizore','Shiden','Gekkô','Hebi','Kagerô','Oboro','Tetsu','Jaku','Kirisame','Yami','Rasetsu','Kuroi','Hyôga','Doku','Zangetsu','Mukuro','Shura']];
/*NR_PASS*/
// ninjas adverses : les persos de l'anime (leur kit et leur apparence, dans leur camp) + des ninjas inventés :
// moitié sur le kit d'un perso mais avec leur propre apparence (un bot n'a l'air d'un perso que s'il en porte le nom), moitié au hasard ; le nom de clan suit le prénom
const CH={};{const r=srnd(4242);for(let s=0;s<2;s++)BOTN[s].forEach((n,i)=>{let b=randomBuild(r,s,n);if(r()<.5){const q=presetBuild(Math.floor(r()*PRESETS.length),n,s);q.l=b.l;b=q}if(b.clan>=0)b.name=n+' '+CLANS[b.clan][0];if(s&&r()<.6){b.l.t=2;b.l.v=6}CH['b'+(s*20+i)]=mkNinja(b,true)});
 PRESETS.forEach((P,i)=>{CH['a'+i]=mkNinja(presetBuild(i,P.n,P.side),true)})}
const HEROES=Object.keys(CH);
// ton ninja (gardé dans le navigateur)
// ton ninja : les jutsu sont gardés par leur nom (un ninja sauvegardé reste juste quand le catalogue évolue)
const JLEG=["Rasengan", "Fûma Shuriken", "Coup de pied tornade", "Lotus primaire", "Shunshin", "Kawarimi", "Saut ninja", "Roulade", "Hiraishin", "Kunai à fil", "Multiclonage", "Parchemin explosif", "Bombe fumigène", "Piège ninja", "Genjutsu : Plumes", "Kunai explosifs", "Shôsen", "Zone de soin", "Contre du clone", "Pilule du soldat", "Concentration du chakra", "Invocation : Crapaud", "Pluie de parchemins", "Mode Ermite", "Invocation : Katsuyu", "Katon : Flamme", "Katon : Mur de feu", "Katon : Triple flamme", "Katon : Shuriken de feu aériens", "Katon : Fournaise", "Katon : Flammes chargées", "Katon : Dragon de feu", "Katon : Tornade de feu", "Katon : Nuée ardente", "Katon : Grand souffle de feu", "Suiton : Vague", "Suiton : Brume cachée", "Suiton : Prison aqueuse", "Suiton : Balles d'eau", "Suiton : Mur d'eau", "Suiton : Grand requin", "Suiton : Dragon aqueux", "Fûton : Mur de vent", "Fûton : Balle d'air", "Fûton : Triple balle d'air", "Fûton : Grande balle d'air", "Fûton : Rafale à bout portant", "Fûton : Balles chargées", "Fûton : Lame d'air", "Fûton : Souffle", "Fûton : Couloir de vent", "Fûton : Tornade", "Chidori", "Raiton : Chaîne", "Raiton : Pas de l'éclair", "Raiton : Orage", "Raiton : Piège électrique", "Raiton : Armure de foudre", "Raiton : Décharge", "Raiton : Kirin", "Doton : Rocher", "Doton : Taupe", "Doton : Mur de terre", "Doton : Corps de roche", "Doton : Montagne écrasante", "Doton : Séisme", "Lame de Kusanagi", "Shunshin Uchiha", "Sharingan : Genjutsu", "Sharingan", "Amaterasu", "Tsukuyomi", "Susanô : Totsuka", "Hakke : Paume", "Pas du Hakke", "Byakugan", "Kaiten", "Hakke : 64 points", "Kage Mane", "Course de l'ombre", "Kage Kubi Shibari", "Ombre protectrice", "Ombres liées", "Paume géante", "Boulet humain", "Décuplement partiel", "Pilule rouge", "Décuplement", "Insectes chercheurs", "Clone d'insectes", "Essaim d'insectes", "Insectes dévoreurs", "Nuée destructrice", "Gatsûga", "Instinct bestial", "Ninken", "Flair du chien", "Garôga", "Chaînes de chakra", "Rasengan", "Sceau d'échange", "Sceau", "Multiclonage", "Vitalité Uzumaki", "Rasen-shuriken", "Chakra de Kyûbi", "Shinranshin", "Transposition", "Shintenshin", "Champ de fleurs", "Esprit destructeur", "Cercueil de sable", "Sable volant", "Sable mouvant", "Armure de sable", "Tsunami de sable", "Doigts-balles", "Bond d'os", "Forêt naissante", "Armure d'os", "Forêt d'os", "Konoha Senpû", "Konoha Daisenpû", "Konoha Gôriki Senpû", "Lotus primaire", "Poids retirés", "Bond du fauve", "Vitesse du fauve", "Défi éternel", "Dynamic Entry", "Lotus caché", "Esquive du fauve", "Première Porte", "Porte de la Vie", "Corps de jade", "Éléphant de midi", "Huit Portes", "Paon du matin", "Tigre du soir", "Nuit de la mort"];
const byName=n=>{const J=JL.find(j=>j.n===n);return J?J.id:-1};
// même nom dans plusieurs catégories (ex. Rasengan) : on prend celui du clan ou de la nature du ninja
const pickName=(b,n)=>{const c=JL.filter(j=>j.n===n);return(c.find(j=>j.cat===(b.clan>=0?'c'+b.clan:'u')||j.cat==='n'+b.nat)||c[0]||{id:-1}).id};
function legacyLook(b){const l=b&&b.l;if(l&&l.f==null){const a=l.a|0;l.f=a===2?1:a===3?2:0;l.a=a===4?2:a===1?1:0}return b}
function loadMine(){let b=null;try{b=legacyLook(JSON.parse(localStorage.getItem('nrBuild4')||'null'));if(b&&b.jn)b.j=[b.j[0],...b.jn.map(n=>pickName(b,n))];if(!b){const o=JSON.parse(localStorage.getItem('nrBuild3')||'null');if(o&&o.j){o.j=[o.j[0],...o.j.slice(1).map(i=>pickName(o,JLEG[i]))];b=legacyLook(o)}}}catch(e){b=null}
 return sanitizeBuild(b||presetBuild(0,'Ninja',0))}
let MY;try{MY=loadMine()}catch(e){MY=randomBuild(srnd(99),0,'Ninja')}
CH.p0=mkNinja(MY);
// ninja du créateur (toujours le sien) : en ligne, côté ami, CH.p0 est le ninja de l'hôte
let MYCH=CH.p0;

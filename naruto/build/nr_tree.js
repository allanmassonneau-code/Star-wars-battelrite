// ===================== ARBRES DE COMPÉTENCES : catalogue, règles d'apprentissage, build v5 =====================
const SIMQ=/[?&]sim=1(&|$)/.test(location.search); // page du simulateur (pas de sauvegarde, pas d'avertissements)
// Tout est piloté par les données déclarées dans nr_kits.js (TREES, POOLS, TREEMOVE, DASH*) et par les lignes KIT(arbre,[…]) des kits.
// Règles (DESIGN §2, §13) : nature 1 par rang (parmi 2) · style 1 par rang · clan 1 par rang · clans martiaux 2 par rang, tous appris ·
// sans clan à sub : TOUS les sub (une seule liste, familles = simples étiquettes), exactement 1 sub par rang (pool 'fam' : 1 au plus ; l'assistant en exige 5) ;
// sans clan à kekkei genkai (b.kg, KGS) : l'arbre du KG ('g'+kg, 1 par rang) à la place des sub. Un rang de nature, de style ou de clan peut rester vide.
// JL : jutsu des arbres {id, cat (arbre), ocat (catégorie d'origine de la ligne), slot (ancien emplacement, 0 en v5), r, src, n, d, vfx, P}
// DASHPOOL : anciens déplacements (emplacement 2) retirés des arbres, réserve des dashs {cat, src, n, d, vfx, r}
const JL=[],DASHPOOL=[];
for(const [cat0,slot,r0,src,n,d,vfx] of JD){const mk=cat0+'|'+n,mv=Object.prototype.hasOwnProperty.call(TREEMOVE,mk)?TREEMOVE[mk]:undefined;
 if(mv===null){if(slot===2)DASHPOOL.push({cat:cat0,src,n,d,vfx,r:r0});continue}
 let cat=cat0,r=r0;if(mv){cat=mv[0];r=mv[1]||r0}else if(slot===2){DASHPOOL.push({cat:cat0,src,n,d,vfx,r:r0});continue}
 if(!TREES[cat]){if(cat!=='u')console.warn('Arbre inconnu pour',mk);continue}
 if(!RKB[r]){console.warn('Rang inconnu pour',mk);continue}
 JL.push({id:JL.length,cat,ocat:cat0,slot,r,src,n,d,vfx,P:JPAR[n]})}
// TREE[arbre][rang] = jid de l'arbre à ce rang (ordre du catalogue)
const TREE={};for(const t in TREES)TREE[t]={D:[],C:[],B:[],A:[],S:[]};for(const J of JL)TREE[J.cat][J.r].push(J.id);
// attaques de base « sans clan » : arbre de style (9e champ de STYLES) quand le kit ne l'a pas donné
{const T0={'Taijutsu':'tai','Kunai au poing':'buki','Kenjutsu':'ken','Kubikiribôchô':'ken'};for(const S of STYLES)if(S[8]==null&&T0[S[0]])S[8]=T0[S[0]]}
// dashs par défaut (transition) : 1er ancien déplacement du clan, déplacements de nature connus, quelques familles
{const pool=(cat,n)=>DASHPOOL.find(D=>D.cat===cat&&(n==null||D.n===n)),asD=D=>D&&{src:D.src,n:D.n,d:D.d,vfx:D.vfx,key0:D.cat+'|'+D.n};
 CLANS.forEach((_,i)=>{if(!DASHC[i]){const D=asD(pool('c'+i));if(D)DASHC[i]=D}});
 [[1,'n1','Suiton : Corps liquide'],[2,'n2','Fûton : Envol'],[3,'n3','Raiton : Pas de l\'éclair'],[4,'n4','Doton : Doroku Gaeshi']].forEach(([k,c,n])=>{if(!DASHN[k]){const D=asD(pool(c,n));if(D)DASHN[k]=D}});
 [[4,'Kunai à fil'],[6,'Saut ninja']].forEach(([k,n])=>{if(!DASHF[k]){const D=asD(pool('u',n));if(D)DASHF[k]=D}});
 for(const D of[DASHB,SHUN]){const P=DASHPOOL.find(q=>q.src===D.src);if(P&&!D.key0)D.key0=P.cat+'|'+P.n}}
const catName=c=>{const T=TREES[c];return T?T.name:c==='u'?'Subjutsu':String(c)};
const catCol=c=>{const T=TREES[c];return T?T.col:'#c8b89a'};
const catType=c=>TREES[c]?TREES[c].type:null;
// ---------- règles ----------
// arbres accessibles d'un build : sa nature, son arbre de style, son clan ou ses familles
// (sans clan : l'arbre de son kekkei genkai, sinon les arbres de TOUTES les familles de sub : plus de choix de familles, le pool 'fam' limite à 1 sub par rang)
const FAMT=FAMS.map((_,i)=>'f'+i);
function treesOf(o){const L=[];if(o.nat>=0)L.push('n'+o.nat);L.push('t'+(o.st|0));if(o.clan>=0)L.push('c'+o.clan);else if(kgOk(o.kg))L.push('g'+o.kg);else L.push(...FAMT);return L.filter(t=>TREES[t])}
// arbres à montrer (fiche, résumés) : ceux du build, sans les familles de sub dont aucun sub n'est appris
const treesShown=b=>treesOf(b).filter(t=>catType(t)!=='famille'||(b.k||[]).some(j=>JL[j]&&JL[j].cat===t));
// familles des sub appris (ordre des rangs D → S) : b.fam est DÉRIVÉ (étiquettes, dash de famille, équilibrage FAMBAL, subHasF)
const famOfK=K=>{const F=[];for(const r of RANKO)for(const id of K||[]){const J=JL[id];if(J&&J.r===r&&TREES[J.cat]&&TREES[J.cat].type==='famille'){const f=+J.cat.slice(1);if(!F.includes(f))F.push(f)}}return F};
// sub appris par rang ({D: jid|-1, …}) et rangs sans sub (l'assistant en exige exactement 1 par rang)
const subByRank=K=>{const o={};for(const r of RANKO)o[r]=-1;for(const id of K||[]){const J=JL[id];if(J&&catType(J.cat)==='famille'&&o[J.r]<0)o[J.r]=id}return o};
const subMissing=b=>b&&b.clan<0&&!kgOk(b.kg)?[...RANKO].filter(r=>subByRank(b.k)[r]<0):[];
// complète les rangs de sub vides d'un sans-clan à sub (bots copiés sur un perso de l'anime au kit incomplet) : un sub d'une famille qu'il a déjà, sinon le 1er du rang ;
// les sub ajoutés entrent dans ses barres (barsCover : nouvelle barre s'il en a moins de BARSMAX). Déterministe (pas de tirage : les autres bots ne changent pas).
function subFill(b){if(!b||b.clan>=0||kgOk(b.kg))return b;const miss=subMissing(b);if(!miss.length)return b;const F=famOfK(b.k);
 for(const r of miss){const L=JL.filter(J=>J.r===r&&catType(J.cat)==='famille'),J=L.find(J=>F.includes(+J.cat.slice(1)))||L[0];if(J)b.k.push(J.id)}
 b.fam=famOfK(b.k);if(Array.isArray(b.bars)&&b.bars.length){b.bars=barsCover(b,b.bars.map(q=>({n:q.n,b:q.b.slice()})));b.bar=b.bars[0].b.slice()}return b}
// le jutsu peut-il s'ajouter à la liste K (limites de son arbre et de son pool à son rang) ? renvoie '' si oui, sinon la limite atteinte ('tree' ou 'pool')
function learnBlock(K,jid){const J=JL[jid],T=TREES[J.cat];let nT=0,nP=0;
 for(const id of K){const I=JL[id];if(I.r!==J.r)continue;if(I.cat===J.cat)nT++;if(T.pool&&TREES[I.cat].pool===T.pool)nP++}
 if(nT>=tTake(T,J.r))return'tree';if(T.pool&&nP>=tTake(POOLS[T.pool],J.r))return'pool';return''}
const canLearn=(K,jid)=>!learnBlock(K,jid);
// ajoute aux jutsu appris tout ce que les limites permettent encore (ordre : arbres, puis rangs, puis catalogue)
function autoLearn(o,K,TR){K=K?K.slice():[];for(const t of TR||treesOf(o))for(const r of RANKO)for(const id of TREE[t][r])if(!K.includes(id)&&canLearn(K,id))K.push(id);return K}
// apprend un jutsu (création, persos de l'anime) : si la limite de son rang est atteinte, le plus ancien appris du même arbre (ou du même pool) à ce rang est oublié (et retiré de la barre)
function learnJ(o,jid){const J=JL[jid];if(!J||!treesOf(o).includes(J.cat))return false;if(o.k.includes(jid))return true;
 for(let n=0;n<20;n++){const b=learnBlock(o.k,jid);if(!b)break;const T=TREES[J.cat],v=o.k.find(id=>JL[id].r===J.r&&(b==='tree'?JL[id].cat===J.cat:TREES[JL[id].cat].pool===T.pool));if(v==null)return false;unlearnJ(o,v)}
 o.k.push(jid);return true}
function unlearnJ(o,jid){o.k=o.k.filter(id=>id!==jid);if(o.bar)o.bar=o.bar.map(id=>id===jid?-1:id);if(Array.isArray(o.bars))for(const q of o.bars)if(q&&Array.isArray(q.b))q.b=q.b.map(id=>id===jid?-1:id)}
// barre de départ automatique (déterministe) : un jutsu par rang en partant du S, en alternant les arbres, jusqu'à 6 cases
function autoBar(o){const K=o.k||[],tr=treesOf(o),out=[];let rot=0;const ti=id=>{const i=tr.indexOf(JL[id].cat);return((i-rot)%tr.length+tr.length)%tr.length};
 for(let pass=0;pass<4&&out.length<6;pass++)for(const r of'SABCD'){if(out.length>=6)break;const C=K.filter(id=>JL[id].r===r&&!out.includes(id));if(!C.length)continue;C.sort((a,b)=>ti(a)-ti(b)||a-b);out.push(C[0]);rot++}
 while(out.length<6)out.push(-1);return out}
// barre de départ d'une ORIGINE choisie (assistant : nouveau perso, changement d'origine) : les jutsu appris de l'arbre de clan ou de kekkei genkai d'abord (rang S → D,
// tous ses 5 jutsu sous les touches 1 à 5), la case qui reste par la barre auto ; sans clan à sub et clan martial : la barre auto. Les bots gardent leur tirage (randomKit).
function startBar(o){const K=o.k||[],t=o.clan>=0&&!isMartial(o.clan)?'c'+o.clan:o.clan<0&&kgOk(o.kg)?'g'+o.kg:null;if(!t)return autoBar(o);
 const out=[];for(const r of'SABCD')for(const id of K)if(out.length<BARN-1&&JL[id]&&JL[id].cat===t&&JL[id].r===r&&!out.includes(id))out.push(id);
 for(const id of autoBar(Object.assign({},o,{k:K.filter(id=>!out.includes(id))})))if(out.length<BARN&&id>=0)out.push(id);for(const id of autoBar(o))if(out.length<BARN&&id>=0&&!out.includes(id))out.push(id);
 while(out.length<BARN)out.push(-1);return out}
// barres d'une origine choisie : startBar, puis des barres qui couvrent le reste du kit (barsCover)
function startBars(o){const b0=startBar(o);return barsCover(o,[{n:barTheme(o,b0,[]),b:b0.slice()}])}
// pour le créateur : {arbre: [[jid du rang D…], …, [jid du rang S…]]}
function buildTrees(o){const R={};for(const t of treesOf(o))R[t]=[...RANKO].map(r=>TREE[t][r].slice());return R}
// styles d'attaque de base permis : clan « normal » → tout style qui liste le clan (sinon les styles sans clan) ; clan martial → son style propre s'il en a un ;
// sans clan (ou martial sans style propre) → les styles sans clan de son arbre de style (9e champ)
function stylesOf(o){const all=STYLES.map((_,i)=>i),c=o.clan;
 if(c>=0){const own=all.filter(i=>STYLES[i][5].includes(c));if(own.length)return own;if(!isMartial(c))return all.filter(i=>STYLES[i][5].includes(-1))}
 const t=STREE[o.st|0],L=all.filter(i=>STYLES[i][5].includes(-1)&&STYLES[i][8]===t);return L.length?L:all.filter(i=>STYLES[i][5].includes(-1))}
// dashs permis d'un sans-clan : 'b' normal, 'n' celui de sa nature, 'g' celui de son kekkei genkai (DASHG), 'f<k>' celui de la famille d'un de ses sub (b.fam dérivé)
const dashOpts=o=>o.clan>=0?['c']:['b'].concat(o.nat>=0?['n']:[]).concat(kgOk(o.kg)?(DASHG[o.kg]?['g']:[]):(o.fam||[]).map(f=>'f'+f));
const dashOf=b=>b.clan>=0?DASHC[b.clan]||DASHB:b.dsh==='n'?DASHN[b.nat]||DASHB:b.dsh==='g'&&kgOk(b.kg)?DASHG[b.kg]||DASHB:b.dsh&&b.dsh[0]==='f'?DASHF[+b.dsh.slice(1)]||DASHB:DASHB;
// ---------- build v6 ----------
// {v:6, name, side, clan (-1 sans clan), kg (kekkei genkai d'un sans-clan, indice KGS, -1 = sub), nat (-1 pour un clan martial), st (arbre de style 0-2), w (indice STYLES de l'attaque de base),
//  fam:[familles des sub appris : DÉRIVÉ de k, l'entrée est ignorée], dsh, k:[jid appris],
//  bar:[6 jid | -1] (= bars[0].b, la barre de départ), bars:[{n:nom, b:[6 jid | -1]}, …] (1 à BARSMAX barres favorites, changées en combat avec la roue de B), l:{apparence}}
// v5 → v6 : un build sans bars reçoit une seule barre « Barre 1 » = sa barre. `bar` fait foi pour la 1re barre (le code qui ne connaît que bar reste juste).
// Chaque barre : jutsu APPRIS seulement, sans doublon, 6 cases ; une barre toute vide est refaite automatiquement (la 1re par autoBar, une autre par barFresh :
// d'abord les jutsu absents des autres barres, pour ne pas recréer une barre déjà là). strict (bots, builds reçus) : une barre identique à une précédente est retirée.
const BARSMAX=4,BARNM=16;
const barSame=(a,b)=>!!a&&!!b&&a.length===b.length&&a.every((j,s)=>j===b[s]);
// une barre de 6 qui prend d'abord les jutsu appris absents de U (Set de jid), rang S → D en alternant les arbres, complétée par la barre auto
function barFresh(o,U){const fresh=(o.k||[]).filter(id=>!U.has(id)),a=fresh.length?autoBar(Object.assign({},o,{k:fresh})).filter(id=>id>=0):[];
 for(const id of autoBar(o))if(a.length<BARN&&id>=0&&!a.includes(id))a.push(id);while(a.length<BARN)a.push(-1);return a}
// nom de barre d'après l'arbre le plus présent (« Fûton », « Uchiha »…), sans doublon de nom dans L
function barTheme(o,B,L){const c={};for(const id of B)if(id>=0&&JL[id])c[JL[id].cat]=(c[JL[id].cat]||0)+1;const t=Object.keys(c).sort((x,y)=>c[y]-c[x]||(o.k||[]).indexOf(+x)-(o.k||[]).indexOf(+y))[0];
 let n=String(t!=null?catName(t):'Barre').replace(/^Clan /,'').split(' / ')[0].slice(0,BARNM-2);const used=new Set((L||[]).map(q=>q.n));if(!used.has(n))return n;for(let i=2;;i++)if(!used.has(n+' '+i))return n+' '+i}
// barres qui COUVRENT les jutsu appris : ajoute à L (liste {n,b}) des barres faites d'abord des jutsu absents des barres déjà là, jusqu'à ce que chaque jutsu appris soit
// dans une barre (ou BARSMAX barres) ; avec 15 jutsu appris et une barre de départ, cela fait 3 barres (6 + 6 + 3 nouveaux complétés). Renvoie L.
function barsCover(o,L){L=L||[];while(L.length<BARSMAX){const U=new Set(L.flatMap(q=>q.b));if(!(o.k||[]).some(id=>!U.has(id)))break;const a=barFresh(o,U);if(L.some(q=>barSame(q.b,a)))break;L.push({n:barTheme(o,a,L),b:a})}return L}
const barName=(n,i)=>String(n==null?'':n).replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,BARNM)||'Barre '+(i+1);
function barSan(B,K){const o=[];B=Array.isArray(B)?B:[];for(let s=0;s<BARN;s++){const v=B[s];const id=typeof v==='number'?v|0:-1;o.push(id===v&&K.includes(id)&&!o.includes(id)?id:-1)}return o}
// bornes → arbres → appris → barre → dash ; idempotent : sanitizeBuild(sanitizeBuild(b)) ≡ sanitizeBuild(b). strict : jamais d'appris vides (bots, builds reçus)
function sanitizeBuild(b,strict){b=b&&typeof b==='object'?b:{};const n=(a,m)=>Math.max(0,Math.min(m-1,(a|0)));const l=b.l||{};
 const o={v:6,name:String(b.name||'Ninja').replace(/[<>]/g,'').slice(0,16)||'Ninja',side:b.side?1:0,clan:b.clan==null?-1:Math.max(-1,Math.min(CLANS.length-1,b.clan|0)),kg:-1,nat:0,st:0,w:0,fam:[],dsh:'b',k:[],bar:[],
  l:{v:n(l.v,VILLAGES.length),t:n(l.t,TENUES.length),c:n(l.c,COIFS.length),h:n(l.h,HAIRC.length),p:n(l.p,PEAUX.length),k:n(l.k,CHAKRAS.length),a:n(l.a,ACCS.length),f:n(l.f,FACES.length),b:n(l.b,BANDS.length),d:n(l.d,BACKS.length),
   e:n(l.e,EYES.length),o:n(l.o,TENCOL.length),s:n(l.s,TENCOL.length),z:n(l.z,TAILLES.length),w:n(l.w,CARRURES.length),r:n(l.r,ARMS.length),n:n(l.n,NECKS.length),
   g:n(l.g,GEARS.length),m:n(l.m,OVERS.length),y:n(l.y,SYMS.length),q:n(l.q,BANDC.length),x:n(l.x,TENCOL.length)}};
 const mar=isMartial(o.clan);o.nat=mar?-1:n(b.nat,NATURES.length);
 const w0=b.w!=null?b.w|0:Array.isArray(b.j)?b.j[0]|0:-1; // (un vieux build v4 garde au moins son style)
 if(mar)o.st=MARTIAL[o.clan];else if(b.st!=null)o.st=n(b.st,STREE.length);else if(STYLES[w0]&&STREE.includes(STYLES[w0][8]))o.st=STREE.indexOf(STYLES[w0][8]);
 if(o.clan<0&&kgOk(b.kg|0)&&(b.kg|0)===b.kg)o.kg=b.kg;
 {const SW=stylesOf(o),cs=clanStyle(o.clan);o.w=SW.includes(w0)?w0:SW.includes(cs)?cs:SW[0]??0}
 const tr=treesOf(o);let K=[];
 if(Array.isArray(b.k)){for(const v of b.k){const id=v|0;if(id!==v||!JL[id]||!tr.includes(JL[id].cat)||K.includes(id))continue;if(canLearn(K,id))K.push(id)}}else K=autoLearn(o);
 if(strict&&!K.length)K=autoLearn(o);
 for(const t of tr)if(TREES[t].force)for(const r of RANKO)for(const id of TREE[t][r])if(!K.includes(id)&&canLearn(K,id))K.push(id); // clans martiaux : tout appris
 o.k=K;if(o.clan<0&&o.kg<0)o.fam=famOfK(K);
 {const src=Array.isArray(b.bars)&&b.bars.length?b.bars.slice(0,BARSMAX):[{n:'Barre 1',b:b.bar}];o.bars=[];
  src.forEach((q,i)=>{if(!q||typeof q!=='object')return;o.bars.push({n:barName(q.n,o.bars.length),b:barSan(i===0&&Array.isArray(b.bar)&&b.bar.length?b.bar:q.b,K)})});
  if(!o.bars.length)o.bars.push({n:'Barre 1',b:barSan(b.bar,K)});
  o.bars.forEach((q,i)=>{if(!q.b.every(id=>id<0))return;q.b=i===0?autoBar(o):barFresh(o,new Set(o.bars.filter(x=>x!==q).flatMap(x=>x.b)))}); // barre vidée : refaite sans recopier les autres
  if(strict)o.bars=o.bars.filter((q,i)=>!o.bars.slice(0,i).some(x=>barSame(x.b,q.b)));
  o.bar=o.bars[0].b.slice()}
 // al (facultatif) : noms affichés propres au perso, {'Nom|arbre': 'Alias'} pour des jutsu appris (ex. Kakashi : Chidori → « Raikiri »)
 if(b.al&&typeof b.al==='object'){const A={};let n=0;for(const k in b.al){const id=pickKey(o,k),v=String(b.al[k]||'').replace(/[<>]/g,'').slice(0,24);if(n<BARN&&id>=0&&K.includes(id)&&jKey(id)===k&&v){A[k]=v;n++}}if(n)o.al=A}
 if(o.clan>=0)o.dsh='c';else{const d=String(b.dsh||'b');o.dsh=dashOpts(o).includes(d)?d:'b'}
 return o}
// nom → jid dans les arbres du build (un même nom peut exister dans plusieurs arbres : celui du build d'abord)
// anciens noms de jutsu renommés (« Japonais : Français ») : une sauvegarde qui porte l'ancien nom retrouve le jutsu
const JREN={"Tsûtenkyaku":"Tsûtenkyaku : Talon céleste","Tourbillon d'acier":"Kaiten-giri : Tourbillon d'acier","Mikazuki no Mai":"Mikazuki no Mai : Danse du croissant","Moulinet du bâton":"Bôjutsu : Moulinet du bâton","Ruée des cent armes":"Hyaku Buki : Ruée des cent armes","Ronde des shuriken":"Shuriken Kaiten : Ronde des shuriken","Kiai":"Kiai : Cri de guerre","Armure du Pays du Fer":"Tetsu no Yoroi : Armure du Pays du Fer","Sept fleurs de l'aube":"Nanabana : Sept fleurs de l'aube","Volée de kunai":"Kunai Rendan : Volée de kunai","Masse à chaîne":"Fundo : Masse à chaîne","Cage de kunai":"Kunai Ori : Cage de kunai","Marteau écraseur":"Ôtsuchi : Marteau écraseur","Arsenal volant":"Buki Shôkan : Arsenal volant","Lame de chakra : Croissant":"Kengeki : Croissant de chakra","Parchemin : Arme lourde":"Makimono : Arme lourde","Suriashi":"Suriashi : Pas glissé","Pas médical":"Iryô : Pas médical","Pas fantôme":"Maboroshi : Pas fantôme","Mue du serpent":"Dappi : Mue du serpent","Monture : Ninken":"Ninken : Monture"};
function pickName(b,n){n=JREN[n]||n;const L=treesOf(b),c=JL.filter(j=>j.n===n);return(c.find(j=>L.includes(j.cat))||{id:-1}).id}
// nom + arbre ('Nom|f3') → jid ; repli sur le nom seul dans les arbres du build
function pickKey(b,s){s=String(s||'');const i=s.lastIndexOf('|'),n0=i>=0?s.slice(0,i):s,n=JREN[n0]||n0,c=i>=0?s.slice(i+1):'';const J=c&&JL.find(j=>j.n===n&&j.cat===c);return J&&treesOf(b).includes(J.cat)?J.id:pickName(b,n)}
const jKey=id=>JL[id]?JL[id].n+'|'+JL[id].cat:'';

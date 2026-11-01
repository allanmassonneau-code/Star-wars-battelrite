// ===================== ARBRES DE COMPÉTENCES : catalogue, règles d'apprentissage, build v5 =====================
const SIMQ=/[?&]sim=1(&|$)/.test(location.search); // page du simulateur (pas de sauvegarde, pas d'avertissements)
// Tout est piloté par les données déclarées dans nr_kits.js (TREES, POOLS, TREEMOVE, DASH*) et par les lignes KIT(arbre,[…]) des kits.
// Règles (DESIGN §2, §13) : nature 1 par rang (parmi 2) · style 1 par rang · clan 1 par rang · clans martiaux 2 par rang, tous appris ·
// sans clan : jusqu'à 5 familles, 5 sub au total (1 par rang toutes familles confondues, pool 'fam'). Un rang peut rester vide.
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
function treesOf(o){const L=[];if(o.nat>=0)L.push('n'+o.nat);L.push('t'+(o.st|0));if(o.clan>=0)L.push('c'+o.clan);else for(const f of o.fam||[])L.push('f'+f);return L.filter(t=>TREES[t])}
// le jutsu peut-il s'ajouter à la liste K (limites de son arbre et de son pool à son rang) ? renvoie '' si oui, sinon la limite atteinte ('tree' ou 'pool')
function learnBlock(K,jid){const J=JL[jid],T=TREES[J.cat];let nT=0,nP=0;
 for(const id of K){const I=JL[id];if(I.r!==J.r)continue;if(I.cat===J.cat)nT++;if(T.pool&&TREES[I.cat].pool===T.pool)nP++}
 if(nT>=tTake(T,J.r))return'tree';if(T.pool&&nP>=tTake(POOLS[T.pool],J.r))return'pool';return''}
const canLearn=(K,jid)=>!learnBlock(K,jid);
// ajoute aux jutsu appris tout ce que les limites permettent encore (ordre : arbres, puis rangs, puis catalogue)
function autoLearn(o,K){K=K?K.slice():[];for(const t of treesOf(o))for(const r of RANKO)for(const id of TREE[t][r])if(!K.includes(id)&&canLearn(K,id))K.push(id);return K}
// apprend un jutsu (création, persos de l'anime) : si la limite de son rang est atteinte, le plus ancien appris du même arbre (ou du même pool) à ce rang est oublié (et retiré de la barre)
function learnJ(o,jid){const J=JL[jid];if(!J||!treesOf(o).includes(J.cat))return false;if(o.k.includes(jid))return true;
 for(let n=0;n<20;n++){const b=learnBlock(o.k,jid);if(!b)break;const T=TREES[J.cat],v=o.k.find(id=>JL[id].r===J.r&&(b==='tree'?JL[id].cat===J.cat:TREES[JL[id].cat].pool===T.pool));if(v==null)return false;unlearnJ(o,v)}
 o.k.push(jid);return true}
function unlearnJ(o,jid){o.k=o.k.filter(id=>id!==jid);if(o.bar)o.bar=o.bar.map(id=>id===jid?-1:id)}
// barre de départ automatique (déterministe) : un jutsu par rang en partant du S, en alternant les arbres, jusqu'à 6 cases
function autoBar(o){const K=o.k||[],tr=treesOf(o),out=[];let rot=0;const ti=id=>{const i=tr.indexOf(JL[id].cat);return((i-rot)%tr.length+tr.length)%tr.length};
 for(let pass=0;pass<4&&out.length<6;pass++)for(const r of'SABCD'){if(out.length>=6)break;const C=K.filter(id=>JL[id].r===r&&!out.includes(id));if(!C.length)continue;C.sort((a,b)=>ti(a)-ti(b)||a-b);out.push(C[0]);rot++}
 while(out.length<6)out.push(-1);return out}
// pour le créateur : {arbre: [[jid du rang D…], …, [jid du rang S…]]}
function buildTrees(o){const R={};for(const t of treesOf(o))R[t]=[...RANKO].map(r=>TREE[t][r].slice());return R}
// styles d'attaque de base permis : clan « normal » → tout style qui liste le clan (sinon les styles sans clan) ; clan martial → son style propre s'il en a un ;
// sans clan (ou martial sans style propre) → les styles sans clan de son arbre de style (9e champ)
function stylesOf(o){const all=STYLES.map((_,i)=>i),c=o.clan;
 if(c>=0){const own=all.filter(i=>STYLES[i][5].includes(c));if(own.length)return own;if(!isMartial(c))return all.filter(i=>STYLES[i][5].includes(-1))}
 const t=STREE[o.st|0],L=all.filter(i=>STYLES[i][5].includes(-1)&&STYLES[i][8]===t);return L.length?L:all.filter(i=>STYLES[i][5].includes(-1))}
// dashs permis d'un sans-clan : 'b' normal, 'n' celui de sa nature, 'f<k>' celui d'une de ses familles
const dashOpts=o=>o.clan>=0?['c']:['b'].concat(o.nat>=0?['n']:[]).concat((o.fam||[]).map(f=>'f'+f));
const dashOf=b=>b.clan>=0?DASHC[b.clan]||DASHB:b.dsh==='n'?DASHN[b.nat]||DASHB:b.dsh&&b.dsh[0]==='f'?DASHF[+b.dsh.slice(1)]||DASHB:DASHB;
// ---------- build v5 ----------
// {v:5, name, side, clan (-1 sans clan), nat (-1 pour un clan martial), st (arbre de style 0-2), w (indice STYLES de l'attaque de base), fam:[familles], dsh, k:[jid appris], bar:[6 jid | -1], l:{apparence}}
// bornes → arbres → appris → barre → dash ; idempotent : sanitizeBuild(sanitizeBuild(b)) ≡ sanitizeBuild(b). strict : jamais d'appris vides (bots, builds reçus)
function sanitizeBuild(b,strict){b=b&&typeof b==='object'?b:{};const n=(a,m)=>Math.max(0,Math.min(m-1,(a|0)));const l=b.l||{};
 const o={v:5,name:String(b.name||'Ninja').replace(/[<>]/g,'').slice(0,16)||'Ninja',side:b.side?1:0,clan:b.clan==null?-1:Math.max(-1,Math.min(CLANS.length-1,b.clan|0)),nat:0,st:0,w:0,fam:[],dsh:'b',k:[],bar:[],
  l:{v:n(l.v,VILLAGES.length),t:n(l.t,TENUES.length),c:n(l.c,COIFS.length),h:n(l.h,HAIRC.length),p:n(l.p,PEAUX.length),k:n(l.k,CHAKRAS.length),a:n(l.a,ACCS.length),f:n(l.f,FACES.length),b:n(l.b,BANDS.length),d:n(l.d,BACKS.length),
   e:n(l.e,EYES.length),o:n(l.o,TENCOL.length),s:n(l.s,TENCOL.length),z:n(l.z,TAILLES.length),w:n(l.w,CARRURES.length),r:n(l.r,ARMS.length),n:n(l.n,NECKS.length),
   g:n(l.g,GEARS.length),m:n(l.m,OVERS.length),y:n(l.y,SYMS.length),q:n(l.q,BANDC.length),x:n(l.x,TENCOL.length)}};
 const mar=isMartial(o.clan);o.nat=mar?-1:n(b.nat,NATURES.length);
 const w0=b.w!=null?b.w|0:Array.isArray(b.j)?b.j[0]|0:-1; // (un vieux build v4 garde au moins son style)
 if(mar)o.st=MARTIAL[o.clan];else if(b.st!=null)o.st=n(b.st,STREE.length);else if(STYLES[w0]&&STREE.includes(STYLES[w0][8]))o.st=STREE.indexOf(STYLES[w0][8]);
 if(o.clan<0&&Array.isArray(b.fam))for(const f of b.fam){const v=f|0;if(v===f&&v>=0&&v<FAMS.length&&!o.fam.includes(v)&&o.fam.length<FAMMAX)o.fam.push(v)}
 {const SW=stylesOf(o),cs=clanStyle(o.clan);o.w=SW.includes(w0)?w0:SW.includes(cs)?cs:SW[0]??0}
 const tr=treesOf(o);let K=[];
 if(Array.isArray(b.k)){for(const v of b.k){const id=v|0;if(id!==v||!JL[id]||!tr.includes(JL[id].cat)||K.includes(id))continue;if(canLearn(K,id))K.push(id)}}else K=autoLearn(o);
 if(strict&&!K.length)K=autoLearn(o);
 for(const t of tr)if(TREES[t].force)for(const r of RANKO)for(const id of TREE[t][r])if(!K.includes(id)&&canLearn(K,id))K.push(id); // clans martiaux : tout appris
 o.k=K;
 const B=Array.isArray(b.bar)?b.bar:[];for(let s=0;s<BARN;s++){const v=B[s];const id=typeof v==='number'?v|0:-1;o.bar.push(id===v&&K.includes(id)&&!o.bar.includes(id)?id:-1)}
 if(o.bar.every(id=>id<0))o.bar=autoBar(o);
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

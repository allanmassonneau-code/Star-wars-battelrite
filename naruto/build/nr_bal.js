// ===================== ÉQUILIBRAGE EN JEU : panneau (F8) + simulateur de duels intégré =====================
// Un profil = les écarts aux valeurs du jeu : g (global), c (clans : [PV, puissance]), n (natures), s (styles, par nom : [PV, puissance, dégâts du M1]),
// j (jutsu, par « catégorie|nom » : {d dégâts ×, cd recharge en s, ck coût en chakra}). Le profil actif est écrit dans le moteur (CLANBAL, NATBAL, STYLEBAL,
// CKCOST, CK, HLS + multiplicateurs ci-dessous), puis tous les ninjas sont recalculés ; il est réappliqué au lancement de chaque partie.
// En ligne, l'hôte décide : son profil part chez les invités (message 'bal') pour que tout le monde voie les mêmes chiffres.
// Simulateur : une iframe cachée charge le même jeu avec ?sim=1 (ni rendu ni boucle de jeu) et joue les duels par tranches, pilotée par messages :
// l'état de la partie et du menu du joueur n'est jamais touché, et rien ne tourne quand le panneau est fermé.
// L'iframe est en bac à sable (sandbox) : elle n'a pas accès aux sauvegardes du joueur. Elle tourne souvent dans le MÊME processus que la page
// (pas d'isolation des iframes en bac à sable partout) : les tranches sont donc courtes (10 ms, temps vérifié après chaque image simulée) pour garder l'interface fluide. En file:// le bac à sable bloquerait les scripts locaux (three.js, PeerJS) : iframe ordinaire.
const BLSIM=/[?&]sim=1(&|$)/.test(location.search);
const BLC={gm:1,jm:1,m1:1,jcd:1,ult:22,hp:1,spd:1,cur:null,saved:{},host:null,open:false,drawn:0,dirty:false,D:null,sig:'',tab:'g',jf:{q:'',cat:'',rk:'',mod:false},lm:null,ro:false};
let BLJ=1,BLU=null; // contexte : multiplicateur de dégâts du jutsu en cours et son lanceur (BLU)
const blF=(v,d=2)=>(+v).toFixed(d).replace('.',','),blR=(v,s)=>+(Math.round(v/s)*s).toFixed(4),blCl=(v,a,b)=>Math.max(a,Math.min(b,v));
const blFmt=(v,u)=>u==='x'?'×'+blF(v,2):u==='s'?blF(v,Number.isInteger(+v)?0:1)+' s':u==='%'?Math.round(v)+' %':u==='b'?(v?'oui':'non'):String(Math.round(v*100)/100).replace('.',',');
// réglages globaux : [clé, libellé, aide, min, max, pas, unité ('x' multiplicateur, 's' secondes, '%', '' nombre, 'b' case), groupe]
const BLG=[['hp','PV des ninjas','Multiplie les PV de tous les ninjas (après clan, nature, style et voie).',.5,2,.01,'x','Ninjas'],
 ['spd','Vitesse de course','Multiplie la vitesse de déplacement de tous les ninjas.',.7,1.3,.01,'x','Ninjas'],
 ['dmg','Dégâts (tout)','Multiplie tous les dégâts infligés : jutsu, attaques de base, traits de clan.',.5,2,.01,'x','Dégâts'],
 ['jdmg','Dégâts des jutsu','Multiplie les dégâts de tous les jutsu (coups, projectiles, zones, effets différés).',.5,2,.01,'x','Dégâts'],
 ['m1','Dégâts de l\'attaque de base','Multiplie les dégâts du clic gauche (style de combat) ; ×0,40 dans le jeu de base.',.2,2,.01,'x','Dégâts'],
 ['jcd','Recharge des jutsu','Multiplie le temps de recharge de tous les jutsu, sauf les ultimes.',.5,2,.01,'x','Recharges'],
 ['ult','Recharge des ultimes','Temps de recharge des ultimes (T).',10,40,1,'s','Recharges'],
 ['ckSp','Chakra en début de manche','Chakra (sur 100) au début de chaque manche et à la réapparition.',20,100,1,'','Chakra'],
 ['ckReg','Régénération en combat','Régénération passive du chakra en combat (0,8 par seconde par défaut).',0,3,.05,'x','Chakra'],
 ['ckOut','Régénération hors combat','Régénération passive hors combat (4 par seconde par défaut).',0,3,.05,'x','Chakra'],
 ['ckR','Concentration (R maintenu)','Vitesse de recharge avec R maintenu (19 puis 45 par seconde par défaut).',.5,2,.05,'x','Chakra'],
 ['ckD','Coût d\'un jutsu D','Chakra dépensé par un jutsu de rang D.',0,50,1,'','Coût en chakra par rang'],['ckC','Coût d\'un jutsu C','Chakra dépensé par un jutsu de rang C.',0,50,1,'','Coût en chakra par rang'],
 ['ckB','Coût d\'un jutsu B','Chakra dépensé par un jutsu de rang B.',0,50,1,'','Coût en chakra par rang'],['ckA','Coût d\'un jutsu A','Chakra dépensé par un jutsu de rang A.',0,60,1,'','Coût en chakra par rang'],
 ['ckS','Coût d\'un jutsu S','Chakra dépensé par un jutsu de rang S.',0,60,1,'','Coût en chakra par rang'],['ckU','Surcoût d\'un ultime','Ajouté au coût de son rang pour un ultime (T).',0,40,1,'','Coût en chakra par rang'],
 ['heal','Soin (H) disponible','Le soin commun à tous les ninjas (touche H).',0,1,1,'b','Soin (H)'],
 ['hlCd','Recharge du soin','Temps de recharge du soin (H).',15,120,1,'s','Soin (H)'],
 ['hlPct','Soin immédiat','Part des PV max rendue tout de suite (puis 8 % en 2 s).',5,50,1,'%','Soin (H)']];
// (la durée visée d'un duel n'est pas un réglage du jeu : c'est un repère du simulateur, gardé à part dans ce navigateur, BLS.opt.dur)
const BLGK={};for(const r of BLG)BLGK[r[0]]=r;
function blGDef(k){const D=BLC.D;if(k==='m1')return M1K;if(!D)return 1;if(k==='ult')return 22;if(k==='ckSp')return D.CK.spawn;if(k==='ckU')return D.ck.U;if(/^ck[DCBAS]$/.test(k))return D.ck[k[2]];
 if(k==='heal')return D.hl.on?1:0;if(k==='hlCd')return D.hl.cd;if(k==='hlPct')return Math.round(D.hl.pct*100);return 1}
const blG=(p,k)=>p&&p.g&&p.g[k]!=null?p.g[k]:blGDef(k);
const blJK=J=>J.cat+'|'+J.n; // clé d'un jutsu dans un profil (un même nom peut exister dans plusieurs catégories)
const blCount=p=>p?Object.keys(p.g).length+Object.keys(p.c).length+Object.keys(p.n).length+Object.keys(p.s).length+Object.keys(p.j).length:0;
const blStd=p=>!blCount(p);
// nettoie un profil (sauvegarde, fichier importé ou reçu de l'hôte) : bornes, clés connues, valeurs par défaut retirées
function blNorm(p){p=p&&typeof p==='object'?p:{};const o={v:1,name:String(p.name||'Personnalisé').replace(/[<>]/g,'').slice(0,40)||'Personnalisé',g:{},c:{},n:{},s:{},j:{}};const num=(v,a,b)=>typeof v==='number'&&isFinite(v)?blCl(v,a,b):null;
 for(const k in p.g||{}){const r=BLGK[k];if(!r)continue;const v=num(p.g[k],r[3],r[4]);if(v!=null&&Math.abs(v-blGDef(k))>1e-9)o.g[k]=r[6]==='b'?(v?1:0):v}
 const pair=(src,dst,def,n)=>{for(const k in src||{}){const d=def(k);if(!d)continue;const a=src[k];if(!Array.isArray(a))continue;const v=d.map((x,i)=>{const q=num(a[i],.25,4);return q==null?x:q});if(v.some((x,i)=>Math.abs(x-d[i])>1e-9))dst[k]=v.slice(0,n)}};
 pair(p.c,o.c,k=>BLC.D&&BLC.D.c[k]?BLC.D.c[k]:(+k>=-1&&+k<CLANS.length&&String(+k)===k?[1,1]:null),2);
 pair(p.n,o.n,k=>BLC.D&&BLC.D.n[k]?BLC.D.n[k]:(+k>=0&&+k<NATURES.length&&String(+k)===k?[1,1]:null),2);
 pair(p.s,o.s,k=>typeof k==='string'&&k.length<60?[1,1,1]:null,3);
 for(const k in p.j||{}){const q=p.j[k];if(!q||typeof q!=='object'||k.length>90)continue;const x={},d=num(q.d,.25,3),cd=num(q.cd,.3,60),ck=num(q.ck,0,100),d0=(JBAL[k]&&JBAL[k].d)??1;if(d!=null&&Math.abs(d-d0)>1e-9)x.d=d;if(cd!=null)x.cd=cd;if(ck!=null)x.ck=Math.round(ck);if(Object.keys(x).length)o.j[k]=x}
 return o}
const blCopy=p=>JSON.parse(JSON.stringify(p));
const blData=p=>({g:p.g,c:p.c,n:p.n,s:p.s,j:p.j});

// ---------- moteur : application du profil ----------
// jutsu qui calculent une partie de leurs dégâts hors de leur lancer (recalcul à chaque image, trait, explosion suivie à part) :
// le multiplicateur de dégâts ne s'y applique qu'en partie (mesuré : ×2 demandé → ×1 à ×1,55) ; le panneau le signale
const BLPART=new Set(['x.su_ball','x.hm_arc','x.km_angel','x.ka_goka','x.ka_dragon','x.ak_arm']);
let BLJ0=null; // jutsu(id) d'origine (avant le profil) : recharge et rang de chaque jutsu
const blJD=id=>JBAL[blJK(JL[id])]||{}; // réglage par défaut du jutsu (JBAL, nr_ninja.js) : d dégâts ×, cd recharge, ck coût
const blJBase=(p,id)=>{const o=BLJ0[id],J=blJD(id);return{cd:o.ult?blG(p,'ult'):Math.round((J.cd??o.cd)*blG(p,'jcd')*10)/10,ck:o.hpc?null:J.ck??blG(p,'ck'+o.rank)+(o.ult?blG(p,'ckU'):0),d:J.d??1}};
// chiffres des descriptions : les « N dégâts » (et les listes « 12, 12 puis 16 dégâts ») suivent le multiplicateur ; un réglage propre au jutsu est signalé
const blDescScale=(d,m)=>m===1?d:d.replace(/(\d+(?:,\d+)?)(?=(?:\s*(?:,|puis|et)\s*\d+(?:,\d+)?)*\s*(?:de\s+|d'\s*)?dégâts)/g,s=>{const v=parseFloat(s.replace(',','.'))*m;return v<10&&!Number.isInteger(v)?blF(v,1):String(Math.round(v))});
function blApply(p,force){p=p||blNorm({});const sig=JSON.stringify(blData(p));if(!force&&sig===BLC.sig)return;BLC.sig=sig;const D=BLC.D,G=k=>blG(p,k);
 for(const k in CLANBAL)delete CLANBAL[k];for(const k in D.c)CLANBAL[k]=D.c[k].slice();for(const k in p.c)CLANBAL[k]=p.c[k].slice();
 for(const k in NATBAL)delete NATBAL[k];for(const k in D.n)NATBAL[k]=D.n[k].slice();for(const k in p.n)NATBAL[k]=p.n[k].slice();
 for(const k in STYLEBAL)delete STYLEBAL[k];for(const k in D.s)STYLEBAL[k]=D.s[k].slice();BLC.sd={};
 for(const k in p.s){const i=STYLES.findIndex(s=>s[0]===k);if(i<0)continue;const f=p.s[k]; // le profil multiplie les valeurs du jeu (style seul et style:clan)
  if(!STYLEBAL[i])STYLEBAL[i]=[1,1];for(const q in STYLEBAL)if(q===String(i)||q.startsWith(i+':'))STYLEBAL[q]=[STYLEBAL[q][0]*f[0],STYLEBAL[q][1]*f[1]];if(f[2]!=null&&f[2]!==1)BLC.sd[i]=f[2]}
 for(const r of'DCBAS')CKCOST[r]=G('ck'+r);CKCOST.U=G('ckU');
 CK.spawn=G('ckSp');CK.regen=D.CK.regen*G('ckReg');CK.regenOut=D.CK.regenOut*G('ckOut');CK.rate0=D.CK.rate0*G('ckR');CK.rate1=D.CK.rate1*G('ckR');
 HLS.on=!!G('heal');HLS.cd=G('hlCd');HLS.pct=G('hlPct')/100;
 Object.assign(BLC,{gm:G('dmg'),jm:G('jdmg'),m1:G('m1'),jcd:G('jcd'),ult:G('ult'),hp:G('hp'),spd:G('spd'),pj:p.j});
 JL.forEach((J,i)=>{const q=p.j[blJK(J)],b=blJBase(p,i),m=BLC.gm*BLC.jm*(q&&q.d!=null?q.d:b.d);let d=blDescScale(BLC.D.jd[i],m);
  if(q){const t=[];if(q.d!=null&&q.d!==b.d)t.push('dégâts ×'+blF(q.d)+(BLPART.has(J.src)?' (en partie seulement)':''));if(q.cd!=null&&q.cd!==b.cd)t.push('recharge '+blFmt(q.cd,'s'));if(q.ck!=null&&q.ck!==b.ck)t.push('chakra '+q.ck);if(t.length)d+=' · ⚖ valeurs modifiées : '+t.join(', ')}J.d=d});
 blRebuild()}
// recalcule tous les ninjas sur place (les références CH[…] restent valables : menu, salon, unités)
function blRebuild(){for(const k in CH){const c=CH[k];if(!c||!c.build)continue;let n;try{n=mkNinja(c.build,c!==MYCH)}catch(e){continue}for(const f of['hp','spd','pw','abil','desc'])c[f]=n[f]}}
// tout ce qu'un jutsu crée pendant qu'il s'exécute porte son multiplicateur de dégâts : projectiles, zones, champs, pièges, clones, objets, rafales, liens, souffles…
function blRun(m,u,f){const pB=BLJ,pU=BLU;BLJ=m;BLU=u;if(m===1){try{return f()}finally{BLJ=pB;BLU=pU}}
 const L=[projs.length,zones.length,fields.length,traps.length,turrets.length,aux.length,seqs.length,tethers.length],fl=u&&u.flame,sp=u&&u.spin,da=u&&u.dash,SK=units.map(x=>x.stick),MK=units.map(x=>x.markB);
 const dot=o=>o&&o.dot&&o.dot.dps?Object.assign({},o,{dot:Object.assign({},o.dot,{dps:o.dot.dps*m})}):o,wr=f=>typeof f==='function'?(...a)=>blRun(m,u,()=>f(...a)):f;
 try{return f()}finally{BLJ=pB;BLU=pU;const nw=(A,i)=>A.slice(L[i]).filter(x=>x&&!x._bl&&(x._bl=1));
  for(const p of nw(projs,0)){if(typeof p.dmg==='number')p.dmg*=m;if(p.sticky&&typeof p.sticky.dmg==='number')p.sticky=Object.assign({},p.sticky,{dmg:p.sticky.dmg*m});p.o=dot(p.o);if(p.onHit)p.onHit=wr(p.onHit)}
  for(const z of nw(zones,1)){if(typeof z.dmg==='number')z.dmg*=m;z.o=dot(z.o)}
  for(const x of nw(fields,2))if(x.dps>0)x.dps*=m;for(const x of nw(traps,3))if(typeof x.dmg==='number')x.dmg*=m;for(const x of nw(turrets,4))if(typeof x.dmg==='number')x.dmg*=m;
  for(const x of nw(aux,5)){x.blm=m;x.blu=u}
  for(const q of nw(seqs,6))q.f=wr(q.f);for(const q of nw(tethers,7)){q.tick=wr(q.tick);q.end=wr(q.end)}
  units.forEach((x,i)=>{if(x.stick&&x.stick!==SK[i]&&x.stick.src===u&&typeof x.stick.dmg==='number')x.stick.dmg*=m;if(x.markB&&x.markB!==MK[i]&&typeof x.markB.dmg==='number')x.markB.dmg*=m});
  if(u){if(u.flame&&u.flame!==fl)u.flame.d=(u.flame.d||3.5)*m;if(u.spin&&u.spin!==sp&&typeof u.spin.dmg==='number')u.spin.dmg*=m;if(u.dash&&u.dash!==da){if(typeof u.dash.dmg==='number')u.dash.dmg*=m;u.dash.end=wr(u.dash.end)}}}}
function blHook(){
 const MK=mkNinja;mkNinja=function(b,s){const o=MK(b,s);if(BLC.hp!==1)o.hp=Math.round(o.hp*BLC.hp);if(BLC.spd!==1)o.spd=Math.round(o.spd*BLC.spd);return o};
 const JU=jutsu;BLJ0=JL.map((_,i)=>{const o=JU(i);return{cd:o.cd,ult:!!o.ult,hpc:!!o.hpc,rank:o.rank}});
 jutsu=function(id){const o=JU(id),q=BLC.pj&&BLC.pj[blJK(JL[id])],J=blJD(id),m=BLC.jm*(q&&q.d!=null?q.d:J.d??1);if(m!==1)o.bdm=m;
  if(q&&q.cd!=null)o.cd=q.cd;else if(o.ult)o.cd=BLC.ult;else{const c=J.cd??o.cd;if(BLC.jcd!==1||c!==o.cd)o.cd=Math.round(c*BLC.jcd*10)/10}const ck=q&&q.ck!=null?q.ck:J.ck;if(ck!=null&&!o.hpc)o.ckO=ck;return o};
 const SA=styleAb;styleAb=function(i){const o=SA(i),m=BLC.m1*(BLC.sd&&BLC.sd[i]||1);if(m!==1){o.bdm=m;o.d=blDescScale(o.d,m*BLC.gm)+(BLC.sd&&BLC.sd[i]?' · ⚖ dégâts ×'+blF(BLC.sd[i]):'')}else if(BLC.gm!==1)o.d=blDescScale(o.d,BLC.gm);return o};
 const FI=fire;fire=function(u,ab,a,td,ex){const m=ab&&ab.bdm||1;return m===1&&BLJ===1?FI(u,ab,a,td,ex):blRun(m,u,()=>FI(u,ab,a,td,ex))};
 const HI=hit;hit=function(t,src,dmg,o){if(src&&src!==t&&typeof dmg==='number'){let m=BLC.gm;if(BLJ!==1&&src===BLU)m*=BLJ;if(m!==1){dmg*=m;if(o&&o.dot&&o.dot.dps)o=Object.assign({},o,{dot:Object.assign({},o.dot,{dps:o.dot.dps*m})})}}return HI(t,src,dmg,o)};
 const LA=later;later=function(u,t,f,o){if(BLJ!==1&&typeof f==='function'){const m=BLJ,w=BLU,f0=f;f=(...a)=>blRun(m,w,()=>f0(...a))}return LA(u,t,f,o)};
 for(const k in AUXF){const f0=AUXF[k];AUXF[k]=function(x,dt){return x.blm&&x.blm!==1?blRun(x.blm,x.blu||x.owner,()=>f0(x,dt)):f0(x,dt)}}}
function blCapture(){BLC.D={c:blCopy(CLANBAL),n:blCopy(NATBAL),s:blCopy(STYLEBAL),ck:Object.assign({U:14},CKCOST),CK:{spawn:CK.spawn,regen:CK.regen,regenOut:CK.regenOut,rate0:CK.rate0,rate1:CK.rate1},hl:{on:HLS.on,cd:HLS.cd,pct:HLS.pct},jd:JL.map(J=>J.d)};if(CKCOST.U==null)CKCOST.U=14}

// ---------- simulateur : côté iframe (?sim=1) ----------
let BLX=null; // tâche en cours dans l'iframe
function blSimJob(job){blApply(blNorm(job.prof),true);HLS.on=job.mode==='heal'&&!!blG(blNorm(job.prof),'heal');const q=[];for(let i=0;i<job.per;i++)for(const c of job.cats)q.push([c,i]);
 const PB=PRESETS.map((P,i)=>{try{return presetBuild(i,P.n,0)}catch(e){return null}});
 BLX={job,R:srnd(job.seed||77),q,i:0,cur:null,PB,res:{cats:{},j:{},ts:[],done:0,total:q.length,mix:0}};for(const c of job.cats)BLX.res.cats[c]={w:0,n:0,to:0,ts:[]}}
// kit aléatoire dans une catégorie : même tirage que bal21/sim.mjs (clan, nature ou sans clan forcé, style et jutsu au hasard)
function blKit(R,cat){const k=x=>Math.floor(R()*x.length);let a=randomBuild(R,0,'a'),si=-1;
 if(cat==='free')return a;
 if(cat==='u')a.clan=-1;else if(cat[0]==='n'){a.nat=+cat.slice(1);if(a.clan===TAIJ)a.clan=-1}else if(cat[0]==='c')a.clan=+cat.slice(1);
 else if(cat[0]==='s'){si=+cat.slice(1);const ok=[-1,...CLANS.map((_,i)=>i)].filter(c=>styleOk(si,c));if(!ok.includes(a.clan))a.clan=ok[k(ok)]}
 a=sanitizeBuild(a);const ST=si>=0?[si]:STYLES.map((_,i)=>i).filter(i=>styleOk(i,a.clan));a.j=[ST[k(ST)]];for(let s=1;s<6;s++){const AV=avail(a,s).filter(j=>!a.j.slice(1).includes(j.id));a.j.push(AV[k(AV)].id)}
 return sanitizeBuild(a,true)}
const blInCat=(b,cat)=>cat==='free'||(cat==='u'?b.clan===-1:cat[0]==='c'?b.clan===+cat.slice(1):cat[0]==='n'?b.nat===+cat.slice(1)&&b.clan!==TAIJ:cat[0]==='s'?b.j[0]===+cat.slice(1):false);
function blDuelSetup(cat,i){const X=BLX,R=X.R;let a,b;
 if(X.job.kits==='preset'){const P=X.PB.map((b,i)=>b&&blInCat(b,cat)?i:-1).filter(i=>i>=0);if(P.length){const ia=P[Math.floor(R()*P.length)];a=X.PB[ia];let ib;do ib=Math.floor(R()*X.PB.length);while((ib===ia||!X.PB[ib])&&X.PB.length>1);b=X.PB[ib]}else{a=blKit(R,cat);b=randomBuild(R,1,'b');X.res.mix++}}
 else{a=blKit(R,cat);b=randomBuild(R,1,'b')}
 const sw=i%2;CH.sa=mkNinja(sw?b:a,true);CH.sb=mkNinja(sw?a:b,true);mode='arena';B=A;OBST=ARENA_OBST;cam={x:CX,y:CY};units=[mkUnit('sa',CX-300,CY,0),mkUnit('sb',CX+300,CY,1)];player=units[0];player.ctrl=null;resetWorld();state='fight';timer=0;STATS={};
 X.cur={cat,me:sw?1:0,k:0,A:CH[sw?'sb':'sa'].build,B:CH[sw?'sa':'sb'].build}}
function blDuelEnd(){const X=BLX,c=X.cur,to=state==='fight',w=to?(units[0].hp/units[0].max>units[1].hp/units[1].max?0:1):winner,won=w===c.me,t=c.k/30,r=X.res.cats[c.cat];
 r.n++;if(won)r.w++;if(to)r.to++;r.ts.push(Math.round(t*10)/10);X.res.ts.push(Math.round(t*10)/10);X.res.done++;
 for(const [b,v] of[[c.A,won],[c.B,!won]])for(const id of b.j.slice(1)){const J=JL[id];if(!J)continue;const q=X.res.j[blJK(J)]||(X.res.j[blJK(J)]=[0,0]);if(v)q[0]++;q[1]++}
 X.cur=null}
function blSimStep(ms){const X=BLX;if(!X)return true;const t0=performance.now();
 while(performance.now()-t0<ms){if(!X.cur){if(X.i>=X.q.length)return true;const [c,i]=X.q[X.i++];blDuelSetup(c,i)}
  for(let n=0;n<400&&X.cur;n++){update(1/30);X.cur.k++;if(state!=='fight'||X.cur.k>=30*150)blDuelEnd();else if(performance.now()-t0>=ms)break}}
 return X.i>=X.q.length&&!X.cur}
function blSimMain(){draw=()=>{};loop=()=>{};OPT.p3d=false;try{N3.on=false}catch(e){}muted=true;
 addEventListener('message',e=>{const d=e.data;if(!d||!d.bl)return;try{
  if(d.bl==='job'){blSimJob(d.job);parent.postMessage({blsim:'prog',res:BLX.res},'*')}
  else if(d.bl==='step'){const fin=blSimStep(d.ms||30);parent.postMessage({blsim:fin?'done':'prog',res:BLX.res},'*');if(fin)BLX=null}
 }catch(err){parent.postMessage({blsim:'err',msg:String(err&&err.message||err)},'*')}});
 parent.postMessage({blsim:'ready'},'*')}

// ---------- réseau : l'hôte envoie son profil, l'invité joue avec ----------
function blSend(){if(net.role!=='host'||!coop())return;const p=BLC.cur;netSend({t:'bal',p:blStd(p)?null:blData(p),n:blStd(p)?'Standard':p.name})}
function blRecv(d){if(net.role!=='guest')return;const p=blNorm(d.p||{});p.name=String(d.n||'Standard').replace(/[<>]/g,'').slice(0,40);const nw=!BLC.host||BLC.host.sig!==JSON.stringify(blData(p))+p.name;
 BLC.host={p,sig:JSON.stringify(blData(p))+p.name};blApply(p);if(nw){blToast(blStd(p)?'Profil d\'équilibrage de l\'hôte : standard':'Profil d\'équilibrage de l\'hôte : '+p.name);blBadge();if(BLC.open)blRender()}}

// ---------- profils (navigateur) ----------
const blLS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
function blLoad(){const s=blLS('nrBalProfiles');BLC.saved={};if(s&&typeof s==='object')for(const n in s){const p=blNorm(s[n]);p.name=n.slice(0,40);BLC.saved[p.name]=p}
 const c=blLS('nrBalCur');BLC.cur=c?Object.assign(blNorm(c),{mod:!!c.mod}):Object.assign(blNorm({}),{name:'Standard',mod:false});if(c&&c.name)BLC.cur.name=String(c.name).slice(0,40)}
const blSaveCur=()=>blLS('nrBalCur',Object.assign(blData(BLC.cur),{name:BLC.cur.name,mod:!!BLC.cur.mod})),blSaveAll=()=>{const o={};for(const n in BLC.saved)o[n]=blData(BLC.saved[n]);blLS('nrBalProfiles',o)};
const blView=()=>BLC.ro&&BLC.host?BLC.host.p:BLC.cur;
// une modification : profil courant marqué « modifié », appliqué tout de suite au menu (sinon à la prochaine partie), envoyé aux invités
function blTouch(){const c=BLC.cur;if(!c.mod&&c.name==='Standard')c.name='Personnalisé';c.mod=true;blSaveCur();blBadge();blCounts();clearTimeout(BLC.tm);BLC.tm=setTimeout(blSync,140)}
function blSync(){if(BLC.ro)return;if(state==='menu'){blApply(BLC.cur);BLC.dirty=false;blSend()}else BLC.dirty=true}

// ---------- interface ----------
function blH(t,a,...k){const e=document.createElement(t);if(a)for(const n in a){const v=a[n];if(v==null||v===false)continue;if(n==='class')e.className=v;else if(n==='style'&&typeof v==='object')Object.assign(e.style,v);else if(n.startsWith('on'))e[n]=v;else if(n==='text')e.textContent=v;else e.setAttribute(n,v===true?'':v)}
 for(const c of k.flat(9))if(c!=null&&c!==false)e.append(c.nodeType?c:String(c));return e}
const blLum=c=>{c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);return(.299*(n>>16&255)+.587*(n>>8&255)+.114*(n&255))/255};
const blChip=(txt,col,big)=>blH('span',{class:'bl-chip'+(big?' big':''),style:{background:col,color:blLum(col)>.55?'#1a1008':'#fff'}},txt);
const BLCSS=`
#balB{position:fixed;right:12px;top:12px;z-index:4;font:inherit;font-size:13px;font-weight:bold;border:1px solid #6a4426;border-radius:8px;padding:6px 11px;background:#1c120acc;color:#f3d9b0;cursor:pointer;display:flex;align-items:center;gap:7px}
#balB:hover{border-color:#ffb347;background:#2a1a0ecc}#balB:focus-visible{outline:2px solid #7df;outline-offset:2px}#balB .dot{width:8px;height:8px;border-radius:50%;background:#ffb347;box-shadow:0 0 8px #ffb347}
#balB[hidden],#blBadge[hidden]{display:none}
#blBadge{position:fixed;--cw:min(100vw,177.78vh);--ch:min(56.25vw,100vh);left:calc((100vw - var(--cw))/2 + var(--cw)*.016);bottom:calc((100vh - var(--ch))/2 + var(--ch)*.05);z-index:4;pointer-events:none;font-size:11.5px;font-weight:bold;color:#ffd9a0;background:#1c120ad9;border:1px solid #8a5a2a;border-radius:20px;padding:3px 11px;letter-spacing:.02em;white-space:nowrap}
#blToast{position:fixed;left:50%;top:86px;transform:translate(-50%,-8px);z-index:30;opacity:0;transition:opacity .25s,transform .25s;pointer-events:none;background:#24170c;border:1px solid #ffb347;color:#ffe2b8;border-radius:10px;padding:9px 16px;font-weight:bold;font-size:14px;box-shadow:0 8px 30px #000a}
#blToast.on{opacity:1;transform:translate(-50%,0)}
.bl-part{margin-left:6px;color:#ffc56a;font-size:12px;cursor:help}
#blToast.pan{top:calc(50% - min(420px,50vh - 12px) + 24px);max-width:min(640px,calc(100vw - 60px))}
#bl{--bg:#1a110a;--bg2:#22160d;--bg3:#2c1d10;--ln:#4e3219;--ln2:#8a5a2a;--ac:#ffb347;--ac2:#ff9a3a;--fg:#f3d9b0;--dim:#bc9d7c;--mut:#857059;--ok:#7bd88f;--bad:#ff7a6a;
 position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(1320px,calc(100vw - 24px));height:min(840px,calc(100vh - 24px));z-index:20;display:flex;flex-direction:column;box-sizing:border-box;
 background:linear-gradient(180deg,#24170d,#170f08 70%);border:2px solid var(--ln2);border-radius:16px;box-shadow:0 24px 80px #000c,inset 0 1px 0 #ffffff12;color:var(--fg);cursor:auto;font-family:"Trebuchet MS",system-ui,sans-serif;font-size:13.5px;overflow:hidden}
#bl[hidden]{display:none}#bl:focus{outline:none}#bl :focus-visible{outline:2px solid #7df;outline-offset:1px}#bl *{box-sizing:border-box}:where(#bl) :where(button,input,select,textarea){font:inherit;color:inherit}
#blShade{position:fixed;inset:0;z-index:19;background:#000a;backdrop-filter:blur(2px)}#blShade[hidden]{display:none}
.bl-hd{display:flex;align-items:center;gap:14px;padding:14px 18px 10px;border-bottom:1px solid var(--ln)}
.bl-hd h2{margin:0;font-size:22px;color:var(--ac);letter-spacing:.01em;text-shadow:0 0 18px #ff9a3a55;white-space:nowrap}.bl-hd .sub{color:var(--dim);font-size:12.5px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-st{font-size:12px;font-weight:bold;border-radius:20px;padding:4px 11px;border:1px solid;white-space:nowrap}.bl-st.std{color:#cfe7d2;border-color:#4d7a55;background:#1a2a1c}.bl-st.mod{color:#1a1008;border-color:var(--ac);background:var(--ac)}.bl-st.host{color:#d8e8ff;border-color:#4a6a9a;background:#152238}
.bl-x{width:34px;height:34px;border-radius:9px;border:1px solid var(--ln2);background:#2e1e10;cursor:pointer;font-size:16px;font-weight:bold}.bl-x:hover{background:var(--ac2);color:#1a1008}
.bl-pb{display:flex;align-items:center;gap:8px;padding:9px 18px;border-bottom:1px solid var(--ln);background:#ffffff05;flex-wrap:wrap}
.bl-pb label{color:var(--dim);font-weight:bold;font-size:12px;text-transform:uppercase;letter-spacing:.06em}.bl-sp{flex:1}
.bl-sel,.bl-in{background:#0f0905;border:1px solid var(--ln2);border-radius:8px;padding:6px 9px;color:var(--fg);min-width:0}.bl-sel:focus,.bl-in:focus{outline:none;border-color:var(--ac);box-shadow:0 0 0 2px #ffb34733}
.bl-b{border:1px solid var(--ln2);background:#2e1e10;border-radius:8px;padding:6px 12px;cursor:pointer;font-weight:bold;font-size:12.5px;white-space:nowrap;transition:background .12s,border-color .12s}
.bl-b:hover:not(:disabled){background:#4a3018;border-color:var(--ac)}.bl-b:disabled{opacity:.45;cursor:default}.bl-b.pri{background:var(--ac);color:#1a1008;border-color:var(--ac)}.bl-b.pri:hover:not(:disabled){background:#ffc56a}
.bl-b.big{font-size:15px;padding:10px 16px;border-radius:10px;width:100%}.bl-b.warn:hover:not(:disabled){border-color:var(--bad);color:#ffd0c8}
.bl-tabs{display:flex;gap:4px;padding:10px 18px 0;border-bottom:1px solid var(--ln2);align-items:flex-end}
.bl-tab{border:1px solid transparent;border-bottom:0;background:none;padding:8px 15px 9px;border-radius:10px 10px 0 0;cursor:pointer;font-weight:bold;color:var(--dim);font-size:14px;position:relative;top:1px;display:flex;gap:7px;align-items:center}
.bl-tab:hover{color:var(--fg);background:#ffffff08}.bl-tab.on{color:var(--ac);background:#1d130b;border-color:var(--ln2)}.bl-tab .n{font-size:10.5px;background:var(--ac);color:#1a1008;border-radius:10px;padding:1px 6px;min-width:18px;text-align:center}
.bl-tab .n:empty{display:none}.bl-tabs .bl-sp{align-self:center}
.bl-body{flex:1;overflow:auto;padding:12px 18px 16px;scrollbar-width:thin;scrollbar-color:#8a5a2a #140c06;scroll-behavior:smooth}
.bl-body::-webkit-scrollbar{width:10px}.bl-body::-webkit-scrollbar-thumb{background:#7a4e24;border-radius:6px;border:2px solid #140c06}.bl-body::-webkit-scrollbar-track{background:#140c06}
.bl-ft{padding:8px 18px;border-top:1px solid var(--ln);color:var(--dim);font-size:12px;display:flex;gap:10px;align-items:center;background:#0000002a}.bl-ft b{color:var(--fg)}
.bl-fs{border:0;margin:0;padding:0;min-width:0}
.bl-grp{margin:4px 0 14px}.bl-grp>h3{margin:6px 0 6px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--ac2);display:flex;align-items:center;gap:10px}.bl-grp>h3:after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--ln2),transparent)}
.bl-cols{columns:2;column-gap:28px}.bl-cols>.bl-grp{break-inside:avoid;display:inline-block;width:100%}
.bl-row{display:grid;align-items:center;gap:12px;padding:6px 10px;border-radius:10px;border:1px solid transparent;transition:background .12s}
.bl-row:hover{background:#ffffff07;border-color:#ffffff0c}.bl-row.mod{background:#ffb3470d;border-color:#ffb34730}
.bl-lab{display:flex;align-items:center;gap:9px;min-width:0}.bl-lab>div{min-width:0}.bl-lab b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bl-lab small{display:block;color:var(--mut);font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-row.mod .bl-lab b{color:#ffd9a0}
.bl-chip{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:22px;padding:0 5px;border-radius:6px;font-size:11px;font-weight:bold;flex:none;box-shadow:inset 0 -2px 0 #0003}.bl-chip.big{min-width:32px;height:28px;font-size:12.5px;border-radius:8px}
.bl-ctl{display:flex;align-items:center;gap:8px;min-width:0}.bl-ctl .cap{font-size:10.5px;color:var(--mut);text-transform:uppercase;letter-spacing:.05em;width:62px;flex:none;text-align:right}
.bl-sl{position:relative;flex:1;min-width:60px;height:22px;--p:50%}
.bl-sl:before{content:'';position:absolute;left:0;right:0;top:9px;height:5px;border-radius:4px;background:linear-gradient(90deg,var(--ac2) var(--p),#3a2614 var(--p))}
.bl-sl i{position:absolute;top:5px;width:2px;height:13px;background:#f3d9b0aa;border-radius:1px;margin-left:-1px;pointer-events:none}
.bl-sl input{position:absolute;inset:0;width:100%;margin:0;background:none;-webkit-appearance:none;appearance:none;cursor:pointer}
.bl-sl input::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:#ffe2b8;border:2px solid var(--ac2);box-shadow:0 1px 4px #000a}
.bl-sl input::-moz-range-thumb{width:13px;height:13px;border-radius:50%;background:#ffe2b8;border:2px solid var(--ac2)}
.bl-sl input:focus-visible{outline:none}.bl-sl input:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 3px #7df}
.bl-num{width:62px;flex:none;background:#0f0905;border:1px solid var(--ln);border-radius:7px;padding:4px 7px;text-align:right;font-variant-numeric:tabular-nums;font-weight:bold}.bl-num:focus{outline:none;border-color:var(--ac)}
.bl-row.mod .bl-num{border-color:#ffb34788;color:#ffd9a0}.bl-unit{color:var(--mut);font-size:11.5px;width:16px;flex:none}
.bl-end{display:flex;align-items:center;gap:6px;justify-content:flex-end}
.bl-dot{width:9px;height:9px;border-radius:50%;background:#ffffff14;flex:none}.bl-row.mod .bl-dot{background:var(--ac);box-shadow:0 0 8px var(--ac)}
.bl-rs{width:26px;height:26px;border-radius:7px;border:1px solid var(--ln);background:none;cursor:pointer;color:var(--mut);font-size:14px;line-height:1;visibility:hidden}.bl-row.mod .bl-rs{visibility:visible}.bl-fs:disabled .bl-row .bl-rs{visibility:hidden}.bl-rs:hover{color:#1a1008;background:var(--ac);border-color:var(--ac)}
.bl-chk{width:42px;height:22px;border-radius:12px;background:#3a2614;border:1px solid var(--ln2);position:relative;cursor:pointer;flex:none}.bl-chk:after{content:'';position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:50%;background:#bc9d7c;transition:left .15s}
.bl-chk.on{background:var(--ac2)}.bl-chk.on:after{left:22px;background:#fff}
.bl-hdr{display:grid;gap:12px;padding:2px 10px 6px;color:var(--mut);font-size:10.5px;text-transform:uppercase;letter-spacing:.07em;font-weight:bold;position:sticky;top:-12px;background:#1d130b;z-index:2;border-bottom:1px solid var(--ln);margin:0 0 4px}
.bl-force{font-variant-numeric:tabular-nums;font-weight:bold;font-size:12.5px;text-align:right}
.bl-tools{display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap}.bl-tools .bl-in{width:240px}.bl-tools .cnt{color:var(--mut);font-size:12px;margin-left:auto}
.bl-tg{display:flex;align-items:center;gap:7px;color:var(--dim);font-size:12.5px;cursor:pointer;user-select:none}
.bl-rk{font-size:10.5px;font-weight:bold;border-radius:5px;padding:1px 5px;color:#14100a;margin-left:6px;vertical-align:1px}
.bl-note{color:var(--dim);font-size:12.5px;line-height:1.45;margin:0 0 10px}.bl-note b{color:var(--fg)}
.bl-empty{color:var(--mut);text-align:center;padding:40px 10px}
.bl-sim{display:grid;grid-template-columns:300px 1fr;gap:18px;min-height:100%}
.bl-card{background:#ffffff06;border:1px solid var(--ln);border-radius:12px;padding:12px 14px}.bl-card h4{margin:0 0 9px;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ac2)}
.bl-seg{display:flex;background:#0f0905;border:1px solid var(--ln);border-radius:9px;padding:2px;gap:2px}.bl-seg button{flex:1;border:0;background:none;border-radius:7px;padding:6px 4px;cursor:pointer;font-weight:bold;font-size:12px;color:var(--dim)}
.bl-seg button.on{background:var(--ac);color:#1a1008}.bl-seg button:hover:not(.on){color:var(--fg);background:#ffffff0a}
.bl-tgl{display:flex;flex-wrap:wrap;gap:6px}.bl-tgl button{border:1px solid var(--ln2);background:none;border-radius:20px;padding:5px 11px;cursor:pointer;font-weight:bold;font-size:12px;color:var(--dim)}.bl-tgl button.on{background:#ffb34722;color:#ffd9a0;border-color:var(--ac)}
.bl-prog{height:10px;border-radius:6px;background:#0f0905;border:1px solid var(--ln);overflow:hidden;margin:8px 0 5px}.bl-runbar{display:flex;align-items:center;gap:16px}.bl-prog i{display:block;height:100%;background:linear-gradient(90deg,#ff9a3a,#ffd36a);border-radius:6px;transition:width .2s}
.bl-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}.bl-kpi{background:#ffffff07;border:1px solid var(--ln);border-radius:12px;padding:10px 12px}.bl-kpi b{display:block;font-size:22px;color:#ffe2b8;font-variant-numeric:tabular-nums}.bl-kpi span{font-size:11px;color:var(--mut);text-transform:uppercase;letter-spacing:.06em}.bl-kpi small{display:block;color:var(--dim);font-size:11.5px;margin-top:2px}
.bl-res{display:grid;grid-template-columns:minmax(150px,1.1fr) 2.3fr 86px 46px 54px;gap:10px;align-items:center;padding:4px 8px;border-radius:8px}.bl-res:hover{background:#ffffff08}
.bl-res .nm{display:flex;align-items:center;gap:8px;min-width:0;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bl-res .v{font-variant-numeric:tabular-nums;font-weight:bold;text-align:right}.bl-res .v small{color:var(--mut);font-weight:normal}.bl-res .m{color:var(--dim);font-variant-numeric:tabular-nums;text-align:right;font-size:12.5px}
.bl-dv{position:relative;height:18px;border-radius:5px;background:#0f0905;overflow:hidden}.bl-dv .band{position:absolute;top:0;bottom:0;background:#7bd88f1c;border-left:1px dashed #7bd88f66;border-right:1px dashed #7bd88f66}
.bl-dv .mid{position:absolute;top:0;bottom:0;width:1px;background:#f3d9b055}.bl-dv .bar{position:absolute;top:4px;height:10px;border-radius:3px}.bl-dv .ci{position:absolute;top:8px;height:2px;background:#ffffffaa}.bl-dv .ci:before,.bl-dv .ci:after{content:'';position:absolute;top:-3px;width:1px;height:8px;background:#ffffffaa}.bl-dv .ci:before{left:0}.bl-dv .ci:after{right:0}
.bl-hist{display:flex;align-items:flex-end;gap:3px;height:96px;padding:0 2px;position:relative;border-bottom:1px solid var(--ln2)}.bl-hist i{flex:1;background:#a8783f;border-radius:3px 3px 0 0;min-height:1px}.bl-hist i.in{background:#7bd88f}
.bl-hist .med{position:absolute;top:-4px;bottom:0;width:2px;background:#ffd36a;box-shadow:0 0 6px #ffd36a}.bl-hax{display:flex;justify-content:space-between;color:var(--mut);font-size:10.5px;margin-top:3px}
.bl-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}.bl-jr{display:grid;grid-template-columns:1fr 60px 64px;gap:8px;align-items:center;padding:3px 4px;font-size:12.5px}.bl-jr .nm{display:flex;gap:7px;align-items:center;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-mini{height:6px;border-radius:3px;background:#0f0905;overflow:hidden}.bl-mini i{display:block;height:100%}
.bl-sug{display:grid;grid-template-columns:22px minmax(140px,1fr) 110px 1.6fr;gap:10px;align-items:center;padding:6px 8px;border-radius:8px;border:1px solid var(--ln);margin-bottom:5px;background:#ffffff05}.bl-sug input{accent-color:var(--ac);width:16px;height:16px}
.bl-sug .ch{font-variant-numeric:tabular-nums;font-size:12.5px;color:var(--dim)}.bl-sug .ch b{color:#ffe2b8}
.bl-mod{position:absolute;inset:0;background:#0009;display:flex;align-items:center;justify-content:center;z-index:5}.bl-mod>div{width:min(560px,92%);background:#24170d;border:1px solid var(--ln2);border-radius:14px;padding:16px 18px;box-shadow:0 20px 60px #000c}
.bl-mod h3{margin:0 0 10px;color:var(--ac);font-size:17px}.bl-mod textarea{width:100%;height:220px;background:#0f0905;border:1px solid var(--ln2);border-radius:9px;padding:9px;font-family:ui-monospace,Consolas,monospace;font-size:12px;resize:vertical}
.bl-mod .row{display:flex;gap:8px;margin-top:12px;justify-content:flex-end;flex-wrap:wrap}.bl-mod p{color:var(--dim);margin:0 0 10px;line-height:1.45}
[data-tip]{position:relative}
#blTip{position:fixed;z-index:40;max-width:300px;background:#120b06;border:1px solid var(--ln2,#8a5a2a);color:#f3d9b0;border-radius:8px;padding:7px 10px;font-size:12px;line-height:1.4;pointer-events:none;box-shadow:0 8px 24px #000a;opacity:0;transition:opacity .12s}
#blTip.on{opacity:1}
@media (max-width:900px){.bl-cols{columns:1}.bl-sim{grid-template-columns:1fr}.bl-kpis{grid-template-columns:repeat(2,1fr)}.bl-hd .sub{display:none}}`;
let BLE=null; // éléments du panneau
function blBuild(){if(BLE)return BLE;document.head.append(blH('style',{id:'blCss'},BLCSS));
 const E={};E.btn=blH('button',{id:'balB',title:'Équilibrage : règle les chiffres du jeu et teste-les (F8)'},'⚖ Équilibrage (F8)');E.btn.onclick=()=>blToggle(true);
 E.badge=blH('div',{id:'blBadge',hidden:true});E.toast=blH('div',{id:'blToast'});E.tip=blH('div',{id:'blTip'});E.shade=blH('div',{id:'blShade',hidden:true});E.shade.onclick=()=>blToggle(false);
 E.st=blH('span',{class:'bl-st std'},'Standard');E.x=blH('button',{class:'bl-x',title:'Fermer (Échap)','aria-label':'Fermer'},'✕');E.x.onclick=()=>blToggle(false);
 E.sel=blH('select',{class:'bl-sel','aria-label':'Profil',style:{width:'250px'}});E.sel.onchange=()=>blPick(E.sel.value);
 const B=(t,f,cl,tip)=>{const b=blH('button',{class:'bl-b'+(cl?' '+cl:''),'data-tip':tip||null},t);b.onclick=f;return b};
 E.bSave=B('Enregistrer',blSaveBtn,'','Garde ce profil dans le navigateur');E.bSaveAs=B('Enregistrer sous…',()=>blSaveAs(),'','Nouveau profil à partir des réglages actuels');E.bDel=B('Supprimer',blDel,'warn','Supprime ce profil enregistré');
 E.bExp=B('⇪ Exporter',blExport,'','Copier le profil (JSON) ou le télécharger en fichier .json');E.bImp=B('⇩ Importer',blImport,'','Coller un profil (JSON) ou ouvrir un fichier .json');E.bAll=B('↺ Tout réinitialiser',()=>blConfirm('Tout réinitialiser ?','Toutes les valeurs du profil « '+BLC.cur.name+' » reviennent aux valeurs du jeu.',()=>{const c=BLC.cur;c.g={};c.c={};c.n={};c.s={};c.j={};blTouch();blRender()}),'warn');
 E.tabs={};const TB=[['g','Global'],['c','Clans'],['n','Natures'],['s','Styles (M1)'],['j','Jutsu'],['sim','Simulateur']];
 const tabs=blH('div',{class:'bl-tabs',role:'tablist'},TB.map(([k,t])=>{const n=blH('span',{class:'n'}),b=blH('button',{class:'bl-tab',role:'tab'},t,n);b.onclick=()=>{BLC.tab=k;blRender()};E.tabs[k]={b,n};return b}),blH('span',{class:'bl-sp'}),
  E.tabRs=B('↺ Réinitialiser l\'onglet',()=>blResetTab(),'warn'));E.tabRs.style.marginBottom='7px';
 E.body=blH('div',{class:'bl-body'});E.fs=blH('fieldset',{class:'bl-fs'});E.body.append(E.fs);E.ft=blH('div',{class:'bl-ft'});
 E.pb=blH('div',{class:'bl-pb'},blH('label',null,'Profil'),E.sel,E.bSave,E.bSaveAs,E.bDel,blH('span',{class:'bl-sp'}),E.bExp,E.bImp,E.bAll);
 E.root=blH('div',{id:'bl',hidden:true,tabindex:'-1',role:'dialog','aria-modal':'true','aria-label':'Équilibrage'},
  blH('div',{class:'bl-hd'},blH('h2',null,'⚖ Équilibrage'),blH('span',{class:'sub'},'Règle les chiffres du jeu, teste-les en duels simulés, partage ton profil.'),E.st,E.x),E.pb,tabs,E.body,E.ft);
 document.body.append(E.btn,E.badge,E.toast,E.shade,E.root,E.tip);
 // les touches tapées dans le panneau ne vont pas au jeu ; panneau ouvert, le jeu n'en reçoit aucune (sauf F8 / Échap gérées ici)
 E.root.addEventListener('keydown',e=>{if(e.code==='Escape'){if(E.root.querySelector('.bl-mod'))E.root.querySelector('.bl-mod').remove();else blToggle(false);e.preventDefault()}else if(e.code==='F8'){blToggle(false);e.preventDefault()}e.stopPropagation()});
 addEventListener('keydown',e=>{if(e.code==='F8'&&!e.repeat&&!E.root.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();blToggle()}else if(BLC.open&&!E.root.contains(e.target)){if(e.code==='Escape')blToggle(false);e.stopImmediatePropagation();e.preventDefault()}},true);
 // infobulles
 E.root.addEventListener('mouseover',e=>{const t=e.target.closest('[data-tip]');if(!t||!t.dataset.tip){E.tip.classList.remove('on');return}E.tip.textContent=t.dataset.tip;const r=t.getBoundingClientRect();E.tip.classList.add('on');
  const w=E.tip.offsetWidth,h=E.tip.offsetHeight;let x=r.left+r.width/2-w/2,y=r.top-h-8;if(y<6)y=r.bottom+8;E.tip.style.left=blCl(x,6,innerWidth-w-6)+'px';E.tip.style.top=y+'px'});
 E.root.addEventListener('mouseleave',()=>E.tip.classList.remove('on'));
 return BLE=E}
function blToast(s){const E=blBuild();E.toast.textContent=s;E.toast.classList.toggle('pan',BLC.open);E.toast.classList.add('on');clearTimeout(E.toastT);E.toastT=setTimeout(()=>E.toast.classList.remove('on'),3200)}
// bouton du menu (avec pastille si profil non standard) et badge en jeu
function blBadge(){const E=blBuild(),menu=state==='menu',hp=net.role==='guest'&&BLC.host,p=hp?BLC.host.p:BLC.cur,std=blStd(p),nm=hp?p.name:BLC.cur.name;
 E.btn.hidden=!menu||BLC.open;E.btn.replaceChildren(...(std?['⚖ Équilibrage (F8)']:[blH('span',{class:'dot'}),hp?'⚖ Profil de l\'hôte : '+nm:'⚖ Équilibrage · '+nm]));
 E.btn.title=std?'Équilibrage : règle les chiffres du jeu et teste-les (F8)':(hp?'Profil d\'équilibrage de l\'hôte : ':'Profil d\'équilibrage non standard actif : ')+nm+' ('+blCount(p)+' réglages) · F8';
 E.badge.hidden=menu||std||BLC.open;E.badge.textContent=(hp?'⚖ Profil de l\'hôte : ':'⚖ Profil d\'équilibrage : ')+nm}
function blToggle(v){const E=blBuild();v=v===undefined?!BLC.open:!!v;if(v===BLC.open)return;BLC.open=v;BLC.ro=net.role==='guest';E.root.hidden=!v;E.shade.hidden=!v;BLC.drawn=0;E.tip.classList.remove('on');
 if(v){for(const k in keys)keys[k]=0;mouse.l=0;blRender();setTimeout(()=>E.root.focus({preventScroll:true}),0)}
 else{if(BLS.run)blSimCancel(true);if(BLC.dirty&&state==='menu')blSync();try{cv.focus()}catch(e){}}blBadge()}
function blProfOpts(){const E=BLE,c=BLC.cur;if(BLC.ro){const n=BLC.host?BLC.host.p.name:'Standard';E.sel.replaceChildren(blH('option',null,n+' (profil de l\'hôte)'));for(const b of[E.sel,E.bSave,E.bSaveAs,E.bDel,E.bImp,E.bAll,E.tabRs])b.disabled=true;return}E.sel.replaceChildren(blH('option',{value:'\u0001std'},'Standard (jeu de base)'),...Object.keys(BLC.saved).sort().map(n=>blH('option',{value:n},n)));
 if(c.name==='Standard'&&!c.mod)E.sel.value='\u0001std';else if(BLC.saved[c.name]&&!c.mod)E.sel.value=c.name;else{E.sel.prepend(blH('option',{value:'\u0002cur'},c.name+(BLC.saved[c.name]?' (modifié)':' (non enregistré)')));E.sel.value='\u0002cur'}
 for(const b of[E.sel,E.bSaveAs,E.bImp,E.bAll,E.tabRs])b.disabled=false; // réactivés après une session en invité (lecture seule)
 E.bDel.disabled=!BLC.saved[c.name];E.bSave.disabled=!c.mod}
function blCounts(){const E=BLE;if(!E)return;const p=blView();E.tabs.g.n.textContent=Object.keys(p.g).length||'';E.tabs.c.n.textContent=Object.keys(p.c).length||'';E.tabs.n.textContent=Object.keys(p.n).length||'';
 E.tabs.s.n.textContent=Object.keys(p.s).length||'';E.tabs.j.n.textContent=Object.keys(p.j).length||'';E.tabs.sim.n.textContent=BLS.run?'…':'';
 const n=blCount(p);E.st.className='bl-st '+(BLC.ro?'host':n?'mod':'std');E.st.textContent=BLC.ro?'Profil de l\'hôte : '+(BLC.host?BLC.host.p.name:'standard'):n?'Non standard · '+n+' réglage'+(n>1?'s':''):'Standard';blProfOpts()}
function blFoot(){const E=BLE,on=coop(),t=BLC.ro?'En ligne, c\'est <b>l\'hôte</b> qui décide des chiffres : tu vois son profil, en lecture seule.':state!=='menu'?(on?'La partie continue · tes réglages s\'appliqueront <b>à la prochaine partie</b> et seront envoyés aux invités.':'Partie en pause · tes réglages s\'appliqueront <b>à la prochaine partie</b>.'):
  on?'Réglages appliqués tout de suite · <b>en ligne, ton profil est envoyé aux invités</b> : tout le monde joue avec les mêmes chiffres.':'Réglages appliqués tout de suite et à chaque nouvelle partie · gardés dans ce navigateur.';
 E.ft.innerHTML='<span>'+t+'</span><span class="bl-sp"></span><span>F8 ouvre / ferme · Échap ferme</span>'}
function blRender(){const E=blBuild();for(const k in E.tabs)E.tabs[k].b.classList.toggle('on',k===BLC.tab),E.tabs[k].b.setAttribute('aria-selected',String(k===BLC.tab));
 E.fs.disabled=BLC.ro&&BLC.tab!=='sim';E.tabRs.style.visibility=BLC.tab==='sim'?'hidden':'visible';const st=E.body.scrollTop,same=E.lastTab===BLC.tab;E.lastTab=BLC.tab;
 E.fs.replaceChildren(...[].concat(({g:blTabG,c:blTabC,n:blTabN,s:blTabS,j:blTabJ,sim:blTabSim})[BLC.tab]()));blCounts();blFoot();E.body.scrollTop=same?st:0}
// --- une ligne de réglage : libellé, curseurs + champs, pastille « modifié », réinitialiser
function blNumIn(get,set,def,min,max,step,unit,opt={}){const dec=step<.1?2:step<1?1:0,fmt=v=>unit==='x'?blF(v,2):String(Math.round(v*10**dec)/10**dec).replace('.',',');
 const n=blH('input',{class:'bl-num',type:'text',inputmode:'decimal','aria-label':opt.lab||null,'data-tip':opt.tip||null});let sl=null,r=null,tk=null;
 if(!opt.noSl){r=blH('input',{type:'range',min,max,step,'aria-label':opt.lab||null});tk=blH('i',{title:null});sl=blH('div',{class:'bl-sl','data-tip':'Défaut : '+blFmt(def,unit)},tk,r)}
 const upd=()=>{const v=get();n.value=fmt(v);if(r){r.value=v;sl.style.setProperty('--p',blCl((v-min)/(max-min),0,1)*100+'%');tk.style.left=blCl((def-min)/(max-min),0,1)*100+'%'}};
 const put=v=>{v=blCl(blR(v,step),min,max);set(Math.abs(v-def)<1e-9?null:Math.round(v*1e4)/1e4);upd();opt.after&&opt.after()};
 if(r)r.oninput=()=>put(+r.value);n.onchange=()=>{const v=parseFloat(n.value.replace(',','.'));put(isFinite(v)?v:def)};
 n.onkeydown=e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();put(get()+(e.key==='ArrowUp'?1:-1)*step*(e.shiftKey?10:1))}else if(e.key==='Enter')n.blur()};
 upd();const el=blH('div',{class:'bl-ctl'},opt.cap?blH('span',{class:'cap'},opt.cap):null,sl,n,blH('span',{class:'bl-unit'},unit==='x'?'×':unit==='s'||unit==='%'?unit:''));el.upd=upd;return el}
function blRowEl(cols,lab,ctls,isMod,reset,extra){const dot=blH('span',{class:'bl-dot',title:'Modifié'}),rs=blH('button',{class:'bl-rs',title:'Valeur par défaut','aria-label':'Revenir à la valeur par défaut'},'↺');
 const row=blH('div',{class:'bl-row',style:{gridTemplateColumns:cols}},lab,ctls,extra||null,blH('span',{class:'bl-end'},dot,rs));
 row.sync=()=>{row.classList.toggle('mod',isMod());if(row.ex)row.ex()};rs.onclick=()=>{reset();for(const c of[].concat(ctls))c.upd&&c.upd();row.sync();blTouch()};row.sync();return row}
const blLab=(chip,name,sub,tip)=>blH('div',{class:'bl-lab','data-tip':tip||null},chip,blH('div',null,blH('b',null,name),sub?blH('small',null,sub):null));
// --- Global
function blTabG(){const p=blView(),out=[],G={};for(const r of BLG)(G[r[7]]=G[r[7]]||[]).push(r);
 out.push(blH('p',{class:'bl-note'},'Réglages communs à tous les ninjas. La ',blH('b',null,'barre claire'),' sur chaque curseur marque la valeur du jeu ; une ',blH('b',null,'pastille orange'),' signale un réglage modifié.'));
 const cols=blH('div',{class:'bl-cols'});
 for(const g in G){const box=blH('div',{class:'bl-grp'},blH('h3',null,g));for(const [k,nm,help,min,max,step,u] of G[g]){const def=blGDef(k),get=()=>blG(blView(),k),set=v=>{if(v==null)delete BLC.cur.g[k];else BLC.cur.g[k]=v};let ctl,row;
   if(u==='b'){const t=blH('button',{class:'bl-chk'+(get()?' on':''),role:'switch','aria-checked':String(!!get()),'aria-label':nm});t.onclick=()=>{set(get()?(def?0:null):(def?null:1));t.classList.toggle('on',!!get());t.setAttribute('aria-checked',String(!!get()));row.sync();blTouch()};ctl=blH('div',{class:'bl-ctl'},t);ctl.upd=()=>t.classList.toggle('on',!!get())}
   else ctl=blNumIn(get,v=>{set(v);row.sync();blTouch()},def,min,max,step,u,{lab:nm});
   row=blRowEl('minmax(150px,1fr) minmax(190px,1.2fr) 44px',blLab(null,nm,'jeu : '+blFmt(def,u),help),ctl,()=>blView().g[k]!=null,()=>set(null));box.append(row)}
  cols.append(box)}
 out.push(cols);return out}
// --- Clans / Natures (PV et puissance absolus, défaut = valeur réglée dans le jeu)
function blPairTab(kind,items,note){const p=blView(),out=[blH('p',{class:'bl-note'},note)],cols='minmax(170px,1.15fr) minmax(170px,1fr) minmax(170px,1fr) 58px 44px';
 out.push(blH('div',{class:'bl-hdr',style:{gridTemplateColumns:cols}},blH('span',null,kind==='c'?'Clan':'Nature'),blH('span',null,'PV ×'),blH('span',null,'Puissance ×'),blH('span',{style:{textAlign:'right'},'data-tip':'PV × puissance : repère grossier de la force (1,00 = neutre)'},'Force'),blH('span')));
 for(const [k,chip,name,sub] of items){const D=BLC.D[kind][k]||[1,1],get=i=>(blView()[kind][k]||D)[i],set=(i,v)=>{const P=BLC.cur[kind],a=(P[k]||D).slice();a[i]=v==null?D[i]:v;if(Math.abs(a[0]-D[0])<1e-9&&Math.abs(a[1]-D[1])<1e-9)delete P[k];else P[k]=a};let row;
  const c1=blNumIn(()=>get(0),v=>{set(0,v);row.sync();blTouch()},D[0],.3,2.5,.01,'x',{lab:name+' : PV'}),c2=blNumIn(()=>get(1),v=>{set(1,v);row.sync();blTouch()},D[1],.3,2.5,.01,'x',{lab:name+' : puissance'});
  const fo=blH('span',{class:'bl-force'});row=blRowEl(cols,blLab(chip,name,sub+' · jeu : '+blF(D[0])+' / '+blF(D[1])),[c1,c2],()=>!!blView()[kind][k],()=>{delete BLC.cur[kind][k]},fo);
  row.ex=()=>{const f=get(0)*get(1),f0=D[0]*D[1];fo.textContent=blF(f);fo.style.color=Math.abs(f-f0)<.005?'var(--dim)':f>f0?'#ffc56a':'#8fc8ff'};row.sync();out.push(row)}
 return out}
function blTabC(){const it=CLANS.map((C,i)=>[String(i),blChip(clanTag(i),C[1],1),C[0].replace(/ \(.*/,''),TRAITS[i]&&(TRAITS[i].nom||TRAITS[i].name)?'Trait : '+(TRAITS[i].nom||TRAITS[i].name):'Clan '+i]);it.push(['-1',blChip('—','#9aa3ad',1),'Sans clan','Subjutsu']);
 return blPairTab('c',it,'PV et puissance de chaque clan (multiplient les stats du ninja). La valeur du jeu vient des duels simulés ; le simulateur peut proposer de nouvelles valeurs.')}
function blTabN(){return blPairTab('n',NATURES.map((N,i)=>[String(i),blChip(N[0].slice(0,2),N[2],1),N[0],N[1]]),'PV et puissance selon la nature (les Taijutsuka n\'ont pas de nature et ne sont pas concernés).')}
// --- Styles : multiplicateurs ajoutés à ceux du style (PV, puissance) + dégâts du clic gauche
function blTabS(){const out=[blH('p',{class:'bl-note'},'Attaque de base (clic gauche) : multiplicateurs ajoutés à ceux du style, et dégâts du coup. Les styles sont reconnus par leur nom.')],cols='minmax(190px,1.3fr) repeat(3,minmax(150px,1fr)) 44px';
 out.push(blH('div',{class:'bl-hdr',style:{gridTemplateColumns:cols}},blH('span',null,'Style'),blH('span',null,'PV ×'),blH('span',null,'Puissance ×'),blH('span',null,'Dégâts du M1 ×'),blH('span')));
 STYLES.forEach((S,si)=>{const k=S[0],ml=MELEEK.has(S[4]),cl=S[5].map(c=>c<0?'sans clan':CLANS[c]?CLANS[c][0]:'?').join(', '),get=i=>(blView().s[k]||[1,1,1])[i]??1;let row;
  const set=(i,v)=>{const P=BLC.cur.s,a=(P[k]||[1,1,1]).slice();a[i]=v==null?1:v;if(a.every(x=>x===1))delete P[k];else P[k]=a};
  const C=[0,1,2].map(i=>blNumIn(()=>get(i),v=>{set(i,v);row.sync();blTouch()},1,.5,2,.01,'x',{lab:k+' : '+['PV','puissance','dégâts'][i]}));
  row=blRowEl(cols,blLab(blChip(ml?'⚔':'➶',ml?'#e8cfa8':'#8fc8ff',1),k,(ml?'Corps à corps':'Distance')+' · '+cl,S[1]+' (style : PV ×'+blF(S[6])+', puissance ×'+blF(S[7])+')'+Object.keys(BLC.D.s).filter(q=>q===String(si)||q.startsWith(si+':')).map(q=>{const v=BLC.D.s[q],c=q.split(':')[1];return' · équilibrage du jeu'+(c!=null?' ('+(c==='-1'?'sans clan':CLANS[+c][0])+')':'')+' : PV ×'+blF(v[0])+', puissance ×'+blF(v[1])}).join('')),C,()=>!!blView().s[k],()=>{delete BLC.cur.s[k]});out.push(row)});
 return out}
// --- Jutsu : recherche, filtres, dégâts ×, recharge, coût
function blTabJ(){const p=blView(),f=BLC.jf,wrap=blH('div'),cols='minmax(220px,1.4fr) minmax(190px,1.25fr) 132px 118px 44px';
 const q=blH('input',{class:'bl-in',type:'search',placeholder:'Rechercher un jutsu…',value:f.q,'aria-label':'Rechercher un jutsu'}),cat=blH('select',{class:'bl-sel','aria-label':'Catégorie'},blH('option',{value:''},'Toutes les catégories'),blH('option',{value:'u'},'Subjutsu (sans clan)'),
  ...NATURES.map((N,i)=>blH('option',{value:'n'+i},'Nature : '+N[0])),...CLANS.map((C,i)=>blH('option',{value:'c'+i},'Clan : '+C[0])));cat.value=f.cat;
 const rk=blH('select',{class:'bl-sel','aria-label':'Rang'},blH('option',{value:''},'Tous les rangs'),...'DCBAS'.split('').map(r=>blH('option',{value:r},'Rang '+r)),blH('option',{value:'U'},'Ultimes'));rk.value=f.rk;
 const md=blH('label',{class:'bl-tg'},blH('input',{type:'checkbox',checked:f.mod||null,style:{accentColor:'#ffb347'}}),'Modifiés seulement'),cnt=blH('span',{class:'cnt'}),list=blH('div');
 const draw=()=>{const s=f.q.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');const L=JL.filter((J,i)=>(!f.cat||J.cat===f.cat)&&(!f.rk||(f.rk==='U'?BLJ0[i].ult:J.r===f.rk))&&(!f.mod||blView().j[blJK(J)])&&(!s||(J.n+' '+catName(J.cat)).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').includes(s)));
  cnt.textContent=L.length+' jutsu';list.replaceChildren(...(L.length?L.map(J=>blJRow(J,cols)):[blH('div',{class:'bl-empty'},'Aucun jutsu ne correspond.')]))};
 let tm;q.oninput=()=>{f.q=q.value;clearTimeout(tm);tm=setTimeout(draw,120)};cat.onchange=()=>{f.cat=cat.value;draw()};rk.onchange=()=>{f.rk=rk.value;draw()};md.firstChild.onchange=()=>{f.mod=md.firstChild.checked;draw()};
 wrap.append(blH('div',{class:'bl-tools'},q,cat,rk,md,cnt),blH('div',{class:'bl-hdr',style:{gridTemplateColumns:cols}},blH('span',null,'Jutsu'),blH('span',{'data-tip':'Multiplie tous les dégâts du jutsu (coups, projectiles, zones, effets différés)'},'Dégâts ×'),blH('span',null,'Recharge (s)'),blH('span',null,'Chakra'),blH('span')),list);draw();return wrap}
function blJRow(J,cols){const i=J.id,k=blJK(J),b0=BLJ0[i],base=blJBase(blView(),i),get=f=>{const q=blView().j[k];return q&&q[f]!=null?q[f]:base[f]};let row;
 const set=(f,v)=>{const P=BLC.cur.j,q=Object.assign({},P[k]);if(v==null)delete q[f];else q[f]=v;if(Object.keys(q).length)P[k]=q;else delete P[k]};
 const ch=f=>v=>{set(f,v);row.sync();blTouch()};
 const cd=blNumIn(()=>get('cd'),ch('cd'),base.cd,.5,60,.5,'s',{noSl:1,lab:J.n+' : recharge',tip:'Défaut : '+blFmt(base.cd,'s')+(b0.ult?' (ultime)':'')});
 const ck=b0.hpc?Object.assign(blH('div',{class:'bl-ctl','data-tip':'Ce jutsu coûte des PV (prix du sang), pas de chakra'},blH('span',{class:'bl-unit',style:{width:'auto',color:'#ff8a96'}},'PV max')),{upd(){}}):blNumIn(()=>get('ck'),ch('ck'),base.ck,0,100,1,'',{noSl:1,lab:J.n+' : chakra',tip:'Défaut : '+base.ck});
 const dm=blNumIn(()=>get('d'),ch('d'),base.d,.25,3,.01,'x',{lab:J.n+' : dégâts',tip:BLPART.has(J.src)?'⚠ Une partie des dégâts de ce jutsu est calculée à part : le multiplicateur ne s\'applique qu\'en partie.':null});
 const lab=blH('div',{class:'bl-lab','data-tip':BLC.D.jd[i]},J.cat==='u'?blChip('SJ','#c8b89a'):J.cat[0]==='n'?blChip(NATURES[+J.cat.slice(1)][0].slice(0,2),catCol(J.cat)):blChip(clanTag(+J.cat.slice(1)),catCol(J.cat)),
  blH('div',null,blH('b',null,J.n,blH('span',{class:'bl-rk',style:{background:RANKC[J.r]}},J.r),BLPART.has(J.src)?blH('span',{class:'bl-part','data-tip':'Dégâts × partiel : une partie des dégâts de ce jutsu est calculée à part, le multiplicateur ne s\'y applique qu\'en partie.'},'⚠'):null),blH('small',null,catName(J.cat)+' · '+(b0.ult?'ultime':J.slot===2?'déplacement':'jutsu'))));
 row=blRowEl(cols,lab,[dm,cd,ck],()=>!!blView().j[k],()=>{delete BLC.cur.j[k]});return row}
function blResetTab(){const t=BLC.tab,c=BLC.cur;if(t==='sim')return;const n=Object.keys(c[t]).length;if(!n){blToast('Rien à réinitialiser dans cet onglet.');return}
 blConfirm('Réinitialiser l\'onglet ?',n+' réglage'+(n>1?'s':'')+' de cet onglet reviennent aux valeurs du jeu.',()=>{c[t]={};blTouch();blRender()})}
// --- fenêtres : confirmation, enregistrer sous, export, import
function blModal(title,body,btns){const E=BLE,m=blH('div',{class:'bl-mod'}),box=blH('div',{role:'dialog','aria-label':title},blH('h3',null,title),body,blH('div',{class:'row'},btns.map(([t,f,c])=>{const b=blH('button',{class:'bl-b'+(c?' '+c:'')},t);b.onclick=()=>{if(f&&f()===false)return;m.remove()};return b})));
 m.append(box);m.onclick=e=>{if(e.target===m)m.remove()};E.root.append(m);setTimeout(()=>{const f=box.querySelector('input,textarea,.pri');f&&f.focus()},0);return m}
const blConfirm=(t,s,f)=>blModal(t,blH('p',null,s),[['Annuler'],['Confirmer',f,'pri']]);
function blPick(v){const go=()=>{if(v==='\u0001std')BLC.cur=Object.assign(blNorm({}),{name:'Standard',mod:false});else if(BLC.saved[v])BLC.cur=Object.assign(blCopy(BLC.saved[v]),{mod:false});blSaveCur();blBadge();blSync();blRender()};
 if(v==='\u0002cur')return;if(BLC.cur.mod&&blCount(BLC.cur)){blConfirm('Changer de profil ?','Les modifications non enregistrées de « '+BLC.cur.name+' » seront perdues.',go);blProfOpts()}else go()}
function blSaveBtn(){const c=BLC.cur;if(c.name==='Standard'||c.name==='Personnalisé'||!BLC.saved[c.name]&&!c.mod)return blSaveAs();BLC.saved[c.name]=blNorm(blCopy(c));BLC.saved[c.name].name=c.name;c.mod=false;blSaveAll();blSaveCur();blToast('Profil « '+c.name+' » enregistré');blCounts()}
function blSaveAs(){const c=BLC.cur,inp=blH('input',{class:'bl-in',style:{width:'100%'},maxlength:40,value:c.name==='Standard'||c.name==='Personnalisé'?'':c.name,placeholder:'Nom du profil (ex. Duels rapides)'});
 const ok=()=>{const n=inp.value.trim().replace(/[<>]/g,'').slice(0,40);if(!n||n==='Standard'){inp.focus();inp.style.borderColor='#ff7a6a';return false}
  const save=()=>{c.name=n;BLC.saved[n]=blNorm(blCopy(c));BLC.saved[n].name=n;c.mod=false;blSaveAll();blSaveCur();blBadge();blCounts();blToast('Profil « '+n+' » enregistré')};if(BLC.saved[n]&&n!==c.name){setTimeout(()=>blConfirm('Remplacer « '+n+' » ?','Un profil porte déjà ce nom.',save),0);return}save()};
 inp.onkeydown=e=>{if(e.key==='Enter'){if(ok()!==false)m.remove()}};const m=blModal('Enregistrer le profil sous…',blH('div',null,blH('p',null,'Le profil est gardé dans ce navigateur. Exporte-le pour le partager.'),inp),[['Annuler'],['Enregistrer',ok,'pri']])}
function blDel(){const n=BLC.cur.name;if(!BLC.saved[n])return;blConfirm('Supprimer « '+n+' » ?','Le profil enregistré est effacé de ce navigateur. Les réglages actuels restent en place (non enregistrés).',()=>{delete BLC.saved[n];BLC.cur.mod=true;blSaveAll();blSaveCur();blCounts();blToast('Profil « '+n+' » supprimé')})}
const blJSON=p=>JSON.stringify(Object.assign({jeu:'Arène Ninja',type:'profil d\'équilibrage',v:1,name:p.name},blData(p)),null,1);
function blExport(){const p=blView(),txt=blJSON(p),ta=blH('textarea',{readonly:true,'aria-label':'Profil en JSON'},txt);
 blModal('Exporter « '+p.name+' »',blH('div',null,blH('p',null,blCount(p)+' réglage'+(blCount(p)>1?'s':'')+' · à coller dans « Importer » chez un ami, ou à garder en fichier.'),ta),
  [['Fermer'],['Télécharger .json',()=>{const a=blH('a',{href:URL.createObjectURL(new Blob([txt],{type:'application/json'})),download:'equilibrage-'+p.name.replace(/[^\wÀ-ſ-]+/g,'_')+'.json'});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);return false}],
   ['Copier',()=>{const done=()=>blToast('Profil copié dans le presse-papier');try{navigator.clipboard.writeText(txt).then(done,()=>{ta.select();document.execCommand('copy');done()})}catch(e){ta.select();document.execCommand('copy');done()}return false},'pri']])}
function blImport(){const ta=blH('textarea',{placeholder:'Colle ici un profil exporté (JSON)…','aria-label':'Profil à importer'}),fi=blH('input',{type:'file',accept:'.json,application/json',hidden:true}),err=blH('p',{style:{color:'#ff9a8a',minHeight:'1.2em',margin:'8px 0 0'}});
 const take=s=>{let o;try{o=JSON.parse(s)}catch(e){err.textContent='Ce texte n\'est pas un profil valide (JSON illisible).';return false}if(!o||typeof o!=='object'||!(o.g||o.c||o.n||o.s||o.j)){err.textContent='Aucun réglage d\'équilibrage trouvé dans ce JSON.';return false}
  const p=blNorm(o);p.name=String(o.name||'Importé').replace(/[<>]/g,'').slice(0,40)||'Importé';if(p.name==='Standard')p.name='Importé';BLC.cur=Object.assign(p,{mod:true});blSaveCur();blBadge();blSync();blRender();blToast('Profil « '+p.name+' » importé · '+blCount(p)+' réglage'+(blCount(p)>1?'s':''));return true};
 fi.onchange=()=>{const f=fi.files[0];if(!f)return;f.text().then(s=>{if(take(s))m.remove()})};
 const m=blModal('Importer un profil',blH('div',null,blH('p',null,'Colle le texte d\'un profil exporté, ou ouvre un fichier .json. Il remplace les réglages actuels (enregistre-le ensuite pour le garder).'),ta,fi,err),[['Annuler'],['Ouvrir un fichier…',()=>{fi.click();return false}],['Importer',()=>take(ta.value),'pri']])}

// ---------- simulateur : côté panneau ----------
const BLS={run:false,fr:null,opt:{grp:{c:1,n:1,s:0,f:0},N:800,mode:'heal',kits:'random',dur:blCl(+blLS('nrBalDur')||52,30,90)},res:null,t0:0,rate:.05,last:0,sug:null,cancelled:false,prof:''};
function blSimCats(){const o=BLS.opt.grp,c=[];if(o.c){for(let i=0;i<CLANS.length;i++)c.push('c'+i);c.push('u')}if(o.n)for(let i=0;i<NATURES.length;i++)c.push('n'+i);if(o.s)STYLES.forEach((_,i)=>c.push('s'+i));if(o.f)c.push('free');return c}
const blCatInfo=c=>c==='u'?{nm:'Sans clan',col:'#9aa3ad',tag:'—',g:'Clans'}:c==='free'?{nm:'Duels libres',col:'#c8b89a',tag:'∗',g:'Libres'}:c[0]==='c'?{nm:CLANS[+c.slice(1)][0],col:CLANS[+c.slice(1)][1],tag:clanTag(+c.slice(1)),g:'Clans'}:
 c[0]==='n'?{nm:NATURES[+c.slice(1)][0],col:NATURES[+c.slice(1)][2],tag:NATURES[+c.slice(1)][0].slice(0,2),g:'Natures'}:{nm:(STYLES[+c.slice(1)]||['?'])[0],col:MELEEK.has((STYLES[+c.slice(1)]||[])[4])?'#e8cfa8':'#8fc8ff',tag:MELEEK.has((STYLES[+c.slice(1)]||[])[4])?'⚔':'➶',g:'Styles (M1)'};
function blSimStart(){if(BLS.run||state!=='menu')return;const cats=blSimCats();if(!cats.length){blToast('Choisis au moins une catégorie à tester.');return}
 const per=Math.max(1,Math.round(BLS.opt.N/cats.length)),job={prof:blData(BLC.cur),cats,per,mode:BLS.opt.mode,kits:BLS.opt.kits,seed:77+Math.floor(Math.random()*9000)};
 Object.assign(BLS,{run:true,res:null,sug:null,cancelled:false,t0:performance.now(),job,prof:BLC.cur.name,psig:JSON.stringify(blData(BLC.cur)),stage:'Préparation du simulateur…'});
 const fr=blH('iframe',{title:'simulateur',sandbox:location.protocol==='file:'?null:'allow-scripts','aria-hidden':'true',tabindex:'-1',style:{position:'fixed',left:'-40px',top:'-40px',width:'8px',height:'8px',opacity:0,pointerEvents:'none',border:0}});
 fr.src=location.href.split(/[?#]/)[0]+'?sim=1';BLS.fr=fr;document.body.append(fr);BLS.onm=e=>{if(!BLS.fr||e.source!==BLS.fr.contentWindow)return;const d=e.data;if(!d||!d.blsim)return;
  if(d.blsim==='ready'){BLS.stage='';fr.contentWindow.postMessage({bl:'job',job},'*')}
  else if(d.blsim==='prog'||d.blsim==='done'){BLS.res=d.res;if(d.res.done>0)BLS.rate=(performance.now()-BLS.t0)/1000/d.res.done;if(d.blsim==='done')return blSimEnd();
   setTimeout(()=>BLS.fr&&BLS.fr.contentWindow.postMessage({bl:'step',ms:10},'*'),0);const t=performance.now();if(t-BLS.last>900){BLS.last=t;blSimPaint()}else blSimProg()}
  else if(d.blsim==='err'){blToast('Erreur du simulateur : '+d.msg);blSimCancel()}};
 addEventListener('message',BLS.onm);blRender()}
function blSimKill(){if(BLS.fr){BLS.fr.remove();BLS.fr=null}if(BLS.onm)removeEventListener('message',BLS.onm);BLS.onm=null;BLS.run=false}
function blSimEnd(){blSimKill();BLS.dur=(performance.now()-BLS.t0)/1000;blToast('Simulation terminée : '+BLS.res.done+' duels');if(BLC.open)blRender()}
function blSimCancel(quiet){blSimKill();BLS.cancelled=true;if(!quiet)blToast('Simulation annulée'+(BLS.res&&BLS.res.done?' : résultats partiels ('+BLS.res.done+' duels)':''));if(BLC.open)blRender()}
const blMed=a=>{if(!a.length)return 0;const s=a.slice().sort((x,y)=>x-y);return s[s.length>>1]};
const blMin=s=>s>=60?Math.floor(s/60)+' min '+String(Math.round(s%60)).padStart(2,'0'):Math.round(s)+' s';
function blTabSim(){const o=BLS.opt,cats=blSimCats(),menu=state==='menu',per=cats.length?Math.max(1,Math.round(o.N/cats.length)):0,est=per*cats.length*BLS.rate;
 const seg=(k,opts)=>blH('div',{class:'bl-seg'},opts.map(([v,t,tip])=>{const b=blH('button',{class:o[k]===v?'on':null,'data-tip':tip||null},t);b.onclick=()=>{if(BLS.run)return;o[k]=v;blRender()};return b}));
 const tg=(k,t,n,tip)=>{const b=blH('button',{class:o.grp[k]?'on':null,'data-tip':tip||null},t+' ',blH('span',{style:{opacity:.6}},'('+n+')'));b.onclick=()=>{if(BLS.run)return;o.grp[k]=o.grp[k]?0:1;blRender()};return b};
 const Nin=blNumIn(()=>o.N,v=>{o.N=v==null?800:v;blSimHint()},800,50,2000,50,'',{lab:'Nombre de duels',after:()=>{}});
 const hint=blH('p',{class:'bl-note',style:{margin:'8px 0 0'}});BLS.hintEl=hint;
 const left=blH('div',{style:{display:'flex',flexDirection:'column',gap:'12px'}},
  blH('div',{class:'bl-card'},blH('h4',null,'Catégories à tester'),blH('div',{class:'bl-tgl'},tg('c','Clans',CLANS.length+1,'Chaque clan et « sans clan » : kit aléatoire du clan contre un ninja aléatoire'),tg('n','Natures',NATURES.length),tg('s','Styles',STYLES.length,'Chaque attaque de base (M1)'),tg('f','Duels libres',1,'Kits entièrement aléatoires : nourrit surtout les statistiques des jutsu')),
   blH('p',{class:'bl-note',style:{margin:'9px 0 0'}},'Les jutsu sont toujours comptés, dans tous les duels.')),
  blH('div',{class:'bl-card'},blH('h4',null,'Nombre de duels'),Nin,hint),
  blH('div',{class:'bl-card'},blH('h4',null,'Durée visée d\'un duel'),blNumIn(()=>o.dur,v=>{o.dur=v==null?52:v;blLS('nrBalDur',o.dur);BLS.sug=null;blSimPaint()},52,30,90,1,'s',{lab:'Durée visée d\'un duel',noSl:1}),
   blH('p',{class:'bl-note',style:{margin:'8px 0 0'}},'Repère des suggestions (durée médiane, 45 à 60 s conseillé). Ne change rien au jeu ni au profil.')),
  blH('div',{class:'bl-card'},blH('h4',null,'Combat'),seg('mode',[['heal','1v1 avec soin (H)','Comme en partie : les bots utilisent le soin commun (référence de l\'équilibrage du jeu)'],['noheal','1v1 sans soin','Comme bal21/sim.mjs : mesure l\'équilibre pur']]),blH('div',{style:{height:'9px'}}),
   seg('kits',[['random','Kits aléatoires','Ninja aléatoire de la catégorie contre un ninja aléatoire'],['preset','Persos préfaits','Persos de l\'anime de la catégorie contre d\'autres persos (kits aléatoires si aucun)']])),
  blH('p',{class:'bl-note',style:{margin:'0 2px',fontSize:'11.5px'}},'Les duels tournent dans une copie isolée du jeu, sans rendu : ta partie et ton menu ne sont pas touchés. Fermer le panneau arrête la simulation.'));
 const top=blH('div',{class:'bl-card bl-runbar'},blH('div',{style:{minWidth:0,flex:1}},blH('h4',{style:{margin:'0 0 3px'}},'Profil testé'),blH('div',{class:'bl-note',style:{margin:0}},blH('b',null,BLS.run?BLS.prof:BLC.cur.name),' · ',blStd(BLC.cur)?'valeurs du jeu':blCount(BLC.cur)+' réglage'+(blCount(BLC.cur)>1?'s':'')+' modifié'+(blCount(BLC.cur)>1?'s':''),
  !menu?blH('span',{style:{color:'#ffb0a0'}},' · disponible depuis le menu principal (pas pendant une partie)'):null),
  BLS.run?blH('div',{class:'bl-prog'},BLS.progI=blH('i',{style:{width:'0%'}})):null,BLS.run?BLS.progT=blH('div',{class:'bl-note',style:{margin:0}}):null),
  BLS.run?blH('button',{class:'bl-b warn',style:{padding:'10px 16px'},onclick:()=>blSimCancel()},'■ Annuler'):blH('button',{class:'bl-b pri',style:{padding:'10px 18px',fontSize:'14.5px'},disabled:!menu||BLC.ro||!cats.length,onclick:blSimStart},'▶ Lancer la simulation'));
 const res=blH('div');BLS.resEl=res;const right=blH('div',{style:{minWidth:0,display:'flex',flexDirection:'column',gap:'12px'}},top,res);const g=blH('div',{class:'bl-sim'},left,right);blSimHint();blSimPaint(res);if(BLS.run)blSimProg();return g}
function blSimHint(){const h=BLS.hintEl;if(!h)return;const cats=blSimCats(),per=cats.length?Math.max(1,Math.round(BLS.opt.N/cats.length)):0;h.textContent=cats.length?'≈ '+per+' duel'+(per>1?'s':'')+' par catégorie ('+cats.length+') · durée estimée ≈ '+blMin(per*cats.length*BLS.rate)+(per<30?' · moins de 30 par catégorie : résultats indicatifs, pas de suggestions':''):'Aucune catégorie choisie.'}
function blSimProg(){if(!BLS.run||!BLS.progI)return;const r=BLS.res,d=r?r.done:0,t=r?r.total:1,el=(performance.now()-BLS.t0)/1000;BLS.progI.style.width=(100*d/t).toFixed(1)+'%';
 BLS.progT.textContent=BLS.stage||(d+' / '+t+' duels · '+blMin(el)+(d>3?' · reste ≈ '+blMin((t-d)*el/d):''))}
// résultats : chiffres clés, taux de victoire par catégorie (barres, intervalle de confiance, zone cible), histogramme des durées, jutsu, suggestions
function blSimPaint(el){el=el||BLS.resEl;if(!el||!BLC.open||BLC.tab!=='sim')return;blSimProg();const R=BLS.res;
 if(!R||!R.done){el.replaceChildren(blH('div',{class:'bl-card',style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',minHeight:'340px'}},
  blH('div',{style:{fontSize:'44px',opacity:.5,marginBottom:'6px'}},'⚖'),blH('b',{style:{fontSize:'17px',color:'#ffe2b8'}},BLS.run?'Les premiers duels arrivent…':'Teste ton profil en duels de bots'),
  blH('p',{class:'bl-note',style:{maxWidth:'460px',marginTop:'8px'}},'Le simulateur fait s\'affronter des bots en accéléré et mesure le taux de victoire de chaque catégorie. Cible : ',blH('b',null,'45 à 55 %'),', duels de ',blH('b',null,'45 à 60 s'),'. Il peut ensuite proposer des réglages de PV et de puissance.')));return}
 const T=BLS.opt.dur,C=Object.entries(R.cats).filter(([,r])=>r.n>0).map(([c,r])=>{const p=r.w/r.n,ci=1.96*Math.sqrt(Math.max(p*(1-p),.0025)/r.n);return Object.assign({c,p,ci,md:blMed(r.ts)},r,blCatInfo(c))});
 const med=blMed(R.ts),inT=C.filter(x=>x.p>=.45&&x.p<=.55).length,worst=C.slice().sort((a,b)=>Math.abs(b.p-.5)-Math.abs(a.p-.5))[0],to=C.reduce((a,x)=>a+x.to,0);
 const kpi=(v,l,s,col)=>blH('div',{class:'bl-kpi'},blH('span',null,l),blH('b',{style:col?{color:col}:null},v),s?blH('small',null,s):null);
 const out=[blH('div',{class:'bl-kpis'},kpi(String(R.done),'Duels',(BLS.run?'en cours · ':BLS.cancelled?'annulé · ':'')+(to?to+' à la limite de 150 s':'aucun à la limite de temps')+(R.mix?' · '+R.mix+' sans perso préfait':'')),
  kpi(Math.round(med)+' s','Durée médiane','cible '+T+' s · '+(Math.abs(med-T)<=T*.12?'dans la cible':med<T?'trop court':'trop long'),Math.abs(med-T)<=T*.12?'#7bd88f':'#ffc56a'),
  kpi(inT+' / '+C.length,'Dans la cible','catégories à 45-55 %',inT===C.length?'#7bd88f':null),kpi(worst?Math.round(worst.p*100)+' %':'—','Plus gros écart',worst?worst.nm:'',worst&&(worst.p<.45||worst.p>.55)?'#ff9a8a':null))];
 const G={};for(const x of C)(G[x.g]=G[x.g]||[]).push(x);const lo=.2,hi=.8,X=v=>blCl((v-lo)/(hi-lo),0,1)*100;
 for(const g of['Clans','Natures','Styles (M1)','Libres'])if(G[g]){const box=blH('div',{class:'bl-grp'},blH('h3',null,g+' · taux de victoire'));
  box.append(blH('div',{class:'bl-res',style:{color:'var(--mut)',fontSize:'10.5px',textTransform:'uppercase',letterSpacing:'.06em',fontWeight:'bold'}},blH('span',null,'Catégorie'),blH('span',{style:{display:'flex',justifyContent:'space-between'}},blH('span',null,'20 %'),blH('span',null,'zone cible 45-55 %'),blH('span',null,'80 %')),blH('span',{style:{textAlign:'right'}},'Victoires'),blH('span',{style:{textAlign:'right'}},'Duels'),blH('span',{style:{textAlign:'right'}},'Médiane')));
  for(const x of G[g].sort((a,b)=>b.p-a.p)){const a=X(Math.min(.5,x.p)),b=X(Math.max(.5,x.p)),off=x.p<.45||x.p>.55;
   box.append(blH('div',{class:'bl-res','data-tip':x.nm+' : '+x.w+' victoires sur '+x.n+' duels ('+Math.round(x.p*100)+' % ± '+Math.round(x.ci*100)+' points, intervalle de confiance à 95 %) · durée médiane '+Math.round(x.md)+' s'},
    blH('span',{class:'nm'},blChip(x.tag,x.col),x.nm),blH('div',{class:'bl-dv'},blH('span',{class:'band',style:{left:X(.45)+'%',width:(X(.55)-X(.45))+'%'}}),blH('span',{class:'mid',style:{left:X(.5)+'%'}}),
     blH('span',{class:'bar',style:{left:a+'%',width:Math.max(.6,b-a)+'%',background:x.col,boxShadow:'0 0 8px '+x.col+'66'}}),blH('span',{class:'ci',style:{left:X(x.p-x.ci)+'%',width:Math.max(.5,X(x.p+x.ci)-X(x.p-x.ci))+'%'}})),
    blH('span',{class:'v',style:{color:off?(x.p>.5?'#ffc56a':'#8fc8ff'):'#cfe7d2'}},Math.round(x.p*100)+' %',blH('small',null,' ±'+Math.round(x.ci*100))),blH('span',{class:'m'},String(x.n)),blH('span',{class:'m'},Math.round(x.md)+' s')))}
  out.push(box)}
 // histogramme des durées (tranches de 10 s), zone cible en vert, médiane en jaune
 {const bins=Array(15).fill(0);for(const t of R.ts)bins[Math.min(14,Math.floor(t/10))]++;const mx=Math.max(1,...bins),hb=blH('div',{class:'bl-hist'},bins.map((n,i)=>blH('i',{class:i*10+10>T-8&&i*10<T+8?'in':null,style:{height:(n/mx*100)+'%'},'data-tip':(i*10)+(i===14?' s et plus':'-'+(i*10+10)+' s')+' : '+n+' duel'+(n>1?'s':'')})),blH('span',{class:'med',style:{left:'calc('+(Math.min(150,med)/150*100)+'% - 1px)'},'data-tip':'Médiane : '+Math.round(med)+' s'}));
  const box=blH('div',{class:'bl-grp'},blH('h3',null,'Durée des duels'),hb,blH('div',{class:'bl-hax'},...[0,30,60,90,120,'150 s'].map(v=>blH('span',null,String(v)))));out.push(box)}
 // jutsu les plus / moins gagnants (au moins 8 apparitions)
 {const mn=Math.max(12,Math.round(R.done*.025)),J=Object.entries(R.j).filter(([,v])=>v[1]>=mn).map(([k,v])=>{const i=k.indexOf('|'),cat=k.slice(0,i);return{k,n:k.slice(i+1),cat,p:v[0]/v[1],c:v[1]}}).sort((a,b)=>b.p-a.p);
  const row=x=>blH('div',{class:'bl-jr','data-tip':x.n+' ('+catName(x.cat)+') : '+Math.round(x.p*100)+' % de victoires sur '+x.c+' duels'},blH('span',{class:'nm'},blChip(x.cat==='u'?'SJ':x.cat[0]==='n'?NATURES[+x.cat.slice(1)][0].slice(0,2):clanTag(+x.cat.slice(1)),catCol(x.cat)),x.n),
   blH('div',{class:'bl-mini'},blH('i',{style:{width:(x.p*100)+'%',background:x.p>.55?'#ffc56a':x.p<.45?'#8fc8ff':'#7bd88f'}})),blH('span',{class:'m',style:{textAlign:'right',fontVariantNumeric:'tabular-nums'}},Math.round(x.p*100)+' % ',blH('small',{style:{color:'var(--mut)'}},'('+x.c+')')));
  const box=blH('div',{class:'bl-grp'},blH('h3',null,'Jutsu · au moins '+mn+' duels'));
  if(J.length<4)box.append(blH('p',{class:'bl-note'},'Pas encore assez de duels pour classer les jutsu.'));
  else box.append(blH('div',{class:'bl-two'},blH('div',{class:'bl-card'},blH('h4',null,'Les plus gagnants'),J.slice(0,8).map(row)),blH('div',{class:'bl-card'},blH('h4',null,'Les moins gagnants'),J.slice(-8).reverse().map(row))));out.push(box)}
 // suggestions
 {const box=blH('div',{class:'bl-grp'},blH('h3',null,'Suggestions'));if(BLS.run)box.append(blH('p',{class:'bl-note'},'Disponibles à la fin de la simulation.'));
  else if(!BLS.sug)box.append(blH('p',{class:'bl-note'},'Propose des PV et une puissance qui ramènent les catégories hors cible vers 50 % (et la durée des duels vers '+T+' s), sans rien appliquer d\'office.'),blH('button',{class:'bl-b pri',disabled:BLC.ro,onclick:()=>{if(BLS.psig!==JSON.stringify(blData(BLC.cur))){blToast('Le profil a changé depuis cette simulation : relance-la avant de demander des suggestions.');return}BLS.sug=blSuggest(R);blSimPaint()}},'✦ Suggérer des réglages'));
  else if(!BLS.sug.length)box.append(blH('p',{class:'bl-note'},'Rien à suggérer : les catégories testées sont dans la cible, ou leur écart reste dans la marge d\'erreur (au moins 30 duels par catégorie sont nécessaires).'));
  else{const L=BLS.sug;box.append(blH('p',{class:'bl-note'},L.length+' ajustement'+(L.length>1?'s':'')+' proposé'+(L.length>1?'s':'')+'. Décoche ceux que tu ne veux pas, puis applique-les au profil « '+BLC.cur.name+' ». Relance ensuite une simulation pour vérifier.'));
   for(const s of L){const cb=blH('input',{type:'checkbox',checked:s.on?true:null,'aria-label':s.nm});cb.onchange=()=>s.on=cb.checked;
    box.append(blH('label',{class:'bl-sug'},cb,blH('span',{class:'nm',style:{display:'flex',gap:'8px',alignItems:'center',fontWeight:'bold'}},blChip(s.tag,s.col),s.nm),
     blH('span',{class:'ch'},s.p!=null?blH('span',null,blH('b',null,Math.round(s.p*100)+' %'),' → ~50 %'):blH('span',null,blH('b',null,Math.round(s.md)+' s'),' → '+T+' s')),
     blH('span',{class:'ch'},s.lab.map((l,i)=>blH('span',null,(i?' · ':'')+l[0]+' ',blF(l[1]),' → ',blH('b',null,blF(l[2])))))))}
   box.append(blH('div',{style:{display:'flex',gap:'8px',marginTop:'8px'}},blH('button',{class:'bl-b pri',disabled:BLC.ro,onclick:blSugApply},'Appliquer au profil'),blH('button',{class:'bl-b',onclick:()=>{BLS.sug=null;blSimPaint()}},'Effacer')))}
  out.push(box)}
 el.replaceChildren(...out)}
// suggestion : force (PV × puissance) corrigée de l'écart à 50 %, répartie selon la durée des duels de la catégorie (trop courts : plus de PV, moins de puissance)
function blSuggest(R){const p0=BLC.cur,T=BLS.opt.dur,out=[];
 for(const c in R.cats){const r=R.cats[c];if(r.n<30||c==='free')continue;const p=r.w/r.n,ci=1.96*Math.sqrt(Math.max(p*(1-p),.0025)/r.n),dev=p-.5;if(Math.abs(dev)<Math.max(.03,ci*.6))continue;
  const f=blCl(1-dev*.9,.8,1.2),md=blMed(r.ts),dk=md?blCl(Math.pow(T/md,.5),.94,1.06):1,fh=Math.sqrt(f)*dk,fp=Math.sqrt(f)/dk,I=blCatInfo(c);
  if(c[0]==='s'){const k=STYLES[+c.slice(1)][0],cur=p0.s[k]||[1,1,1];out.push({on:true,kind:'s',key:k,nm:I.nm,tag:I.tag,col:I.col,p,md,to:[blCl(blR(cur[0]*fh,.01),.5,2),blCl(blR(cur[1]*fp,.01),.5,2),cur[2]],lab:[['PV ×',cur[0],0],['Puissance ×',cur[1],0]]})}
  else{const kind=c[0]==='n'?'n':'c',key=c==='u'?'-1':c.slice(1),cur=p0[kind][key]||BLC.D[kind][key]||[1,1];out.push({on:true,kind,key,nm:I.nm,tag:I.tag,col:I.col,p,md,to:[blCl(blR(cur[0]*fh,.01),.3,2.5),blCl(blR(cur[1]*fp,.01),.3,2.5)],lab:[['PV ×',cur[0],0],['Puissance ×',cur[1],0]]})}
  const s=out[out.length-1];s.lab[0][2]=s.to[0];s.lab[1][2]=s.to[1]}
 out.sort((a,b)=>Math.abs(b.p-.5)-Math.abs(a.p-.5));
 const M=blMed(R.ts);if(R.ts.length>=40&&Math.abs(M-T)>T*.1){const cur=blG(p0,'hp'),to=blCl(blR(cur*blCl(Math.pow(T/M,.85),.85,1.18),.01),.5,2);out.push({on:true,kind:'g',key:'hp',nm:'PV des ninjas (tous)',tag:'∑',col:'#ffb347',p:null,md:M,to:[to],lab:[['PV ×',cur,to]]})}
 return out}
function blSugApply(){const L=(BLS.sug||[]).filter(s=>s.on);if(!L.length){blToast('Aucune suggestion cochée.');return}if(BLS.psig!==JSON.stringify(blData(BLC.cur))){blToast('Le profil a changé depuis cette simulation : relance-la avant d\'appliquer des suggestions.');return}const c=BLC.cur;
 for(const s of L){if(s.kind==='g'){if(Math.abs(s.to[0]-1)<1e-9)delete c.g.hp;else c.g.hp=s.to[0]}else if(s.kind==='s'){if(s.to.every(x=>x===1))delete c.s[s.key];else c.s[s.key]=s.to}
  else{const D=BLC.D[s.kind][s.key]||[1,1];if(Math.abs(s.to[0]-D[0])<1e-9&&Math.abs(s.to[1]-D[1])<1e-9)delete c[s.kind][s.key];else c[s.kind][s.key]=s.to}}
 BLS.sug=null;blTouch();blRender();blToast(L.length+' réglage'+(L.length>1?'s':'')+' appliqué'+(L.length>1?'s':'')+' au profil « '+c.name+' »')}

// ---------- branchement ----------
AFTER.push(()=>{blCapture();blHook();if(BLSIM)return blSimMain();
 blLoad();blApply(BLC.cur,true);blBuild();
 // chaque partie part du profil actif (hôte) ; l'hôte l'envoie aux invités avec le salon et au lancement
 const SM=startMatch;startMatch=function(c){if(net.role!=='guest'){blApply(BLC.cur);BLC.dirty=false;blSend()}return SM(c)};
 const SL=sendLobby;sendLobby=function(){SL();blSend()};
 const NR=netReset;netReset=function(){NR();if(BLC.host){BLC.host=null;blApply(BLC.cur);blBadge()}BLC.ro=false};
 // panneau ouvert : le menu n'est plus redessiné (le canevas garde sa dernière image) ; en solo, la partie est en pause
 const DR=draw;draw=function(){const m=state==='menu';if(m!==BLC.lm){BLC.lm=m;blBadge();if(m&&BLC.dirty)blSync();
  if(!m&&BLS.run){blSimCancel(true);blToast('Simulation arrêtée : la partie commence')}else if(!m&&BLC.open)blRender()} /* partie lancée (en ligne, depuis le salon) : le simulateur s'arrête, le pied du panneau se met à jour */if(BLC.open&&m&&BLC.drawn>1)return;if(BLC.open)BLC.drawn++;return DR()};
 const UP=update;update=function(dt){if(BLC.open&&state!=='menu'&&!coop())return;return UP(dt)};
 blBadge()});

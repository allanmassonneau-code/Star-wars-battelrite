// ===== Clan Uchiha =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c0',[
 [1,'C','x.uc_kunai','Kunai guidés','3 kunai en éventail qui s\'incurvent vers la cible','kunai'],
 [2,'B','x.uc_kamui','Kamui','Devient intangible 1 s et file vers l\'avant','genjutsu'],
 [4,'A','x.uc_iza','Izanagi','5 s : si tu dois mourir, tu reviens à l\'endroit et aux PV du lancement','genjutsu'],
 [1,'D','anakin.1','Lame de Kusanagi','Coup de sabre chargé de chakra qui ignore les parades','steel'],
 [2,'C','maul.2','Shunshin Uchiha','Atterrit derrière l\'ennemi visé','genjutsu'],
 [3,'B','inquisitor.3','Sharingan : Genjutsu','Le regard terrifie la cible','genjutsu'],
 [4,'C','ahsoka.4','Sharingan','Lit le prochain coup, l\'évite et accélère','genjutsu'],
 [5,'S','x.uc_amat','Amaterasu','Flammes noires inextinguibles sur la cible regardée et jusqu\'à 4 ennemis près d\'elle : très longue brûlure','black'],
 [5,'S','x.uc_tsuku','Tsukuyomi','Croise le regard de la cible : genjutsu, elle est paralysée 1,8 s et subit de gros dégâts','tsukuyomi'],
 [5,'A','kylo.5','Susanô : Totsuka','Trois coups dévastateurs autour de soi','susano'],
]);
Object.assign(NAT,{
 uc_amat:ULT('Amaterasu','Flammes noires inextinguibles sur la cible regardée et jusqu\'à 4 ennemis près d\'elle : très longue brûlure',{ai:{max:520,p:.8}},(u,a,td)=>{const e=pick(u,a,td||300,520);S('fire',u);if(!e){const p=atP(u,a,td,520);field(u,p.x,p.y,{r:70,t:3,dps:9,col:'#120a16',vfx:'black'});return}
  const L=[e,...enemies(u).filter(x=>x!==e&&dist(x,e)<170).slice(0,4)];for(const x of L){hit(x,u,14,{dot:{dps:6,dur:6},unblockable:1});jx({jfx:'blackfire',ti:units.indexOf(x),x:x.x,y:x.y,t:6,m:6})}say(e,'AMATERASU','#b070ff')}),
 uc_tsuku:ULT('Tsukuyomi','Croise le regard de la cible : genjutsu, elle est paralysée 1,8 s et subit de gros dégâts',{ai:{max:420,p:.8}},(u,a,td)=>{const e=pick(u,a,td||300,420);if(!e)return;hit(e,u,30,{stun:1.8,unblockable:1});jx({jfx:'redmoon',x:e.x,y:e.y,t:1.4,m:1.4});say(e,'TSUKUYOMI','#e0304a')}),
 uc_iza:S_('Izanagi','5 s : si tu dois mourir, tu reviens à l\'endroit et aux PV du lancement',25,{ai:HEALM},(u)=>{u.izT=5;u.izS={x:u.x,y:u.y,hp:u.hp};ring(u.x,u.y,50,'#e0304a');say(u,'IZANAGI','#e0304a')}),
 uc_kamui:S_('Kamui','Devient intangible 1 s et file vers l\'avant',10,{ai:ESC},(u,a)=>{dash(u,a,200,.45,{});u.phase=Math.max(u.phase||0,1);jx({jfx:'shock',x:u.x,y:u.y,r:50,t:.4,m:.4,col:'#8a3ab0'})}),
 uc_kunai:S_('Kunai guidés','3 kunai en éventail qui s\'incurvent vers la cible',6,{ai:RG(500,.6)},(u,a)=>{S('blaster',u);for(const k of[-.35,0,.35])proj(u,a+k,{spd:760,r:6,dmg:9,life:.8,col:'#d8dde6',home:1})}),
});
Object.assign(NATHERO,{uc:'ahsoka'});
// ---- visuels
JFXD.blackfire=(f,k,e,t)=>{const tg=f.ti!=null?units[f.ti]:null;if(!tg||tg.dead)return;const q=P(tg.x,tg.y,0);for(let i=0;i<9;i++){const a=i*.7+t*3,x=q.x+Math.cos(a)*14*q.s,y=q.y-((t*60+i*17)%70)*q.s;g.fillStyle='#120a16';g.beginPath();g.moveTo(x-5*q.s,y);g.quadraticCurveTo(x,y-18*q.s,x+5*q.s,y);g.fill();g.strokeStyle='#6a2a8a';g.lineWidth=1;g.stroke()}};

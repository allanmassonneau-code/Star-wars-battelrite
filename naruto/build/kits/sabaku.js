// ===== Clan Sabaku =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c8',[
 [1,'D','kylo.1','Cercueil de sable','Le sable fige la cible sur place','sandcoffin'],
 [2,'C','cadbane.2','Sable volant','S\'élève sur un nuage de sable et retombe plus loin','sand'],
 [3,'D','cal.3','Sable mouvant','Zone où ennemis et tirs ralentissent','sand'],
 [4,'C','thrawn.4','Armure de sable','Bouclier de sable pour les alliés proches','sand'],
 [5,'B','x.sa_tsunami','Tsunami de sable','Vague de sable géante qui avance, repousse et ralentit tout sur son passage','sand'],
 [5,'S','x.sa_funeral','Funérailles du désert','Le sable écrase la zone : énormes dégâts (×1,5 sur une cible immobilisée) et étourdit','sandcoffin'],
 [4,'A','x.sa_shield','Bouclier absolu','3 s : dôme de sable qui arrête les projectiles ennemis, plus un bouclier','sand'],
 [1,'B','x.sa_spears','Lances de sable','3 lances de sable perçantes tirées l\'une après l\'autre','sand'],
]);
Object.assign(NAT,{
 sa_tsunami:ULT('Tsunami de sable','Vague de sable géante qui avance, repousse et ralentit tout sur son passage',{line:{len:600,w:90},ai:{max:500,p:.8}},(u,a)=>{S('sand',u);S('heavy',u);proj(u,a,{spd:520,r:32,dmg:34,life:1.15,col:'#d8b878',pierce:1,slow:1.5,kind:'sandwave',o:{kb:230}})}),
 sa_funeral:ULT('Funérailles du désert','Le sable écrase la zone : énormes dégâts (×1,5 sur une cible immobilisée) et étourdit',{tele:{r:110,max:450},ai:{max:450,p:.8}},(u,a,td)=>{const p=atP(u,a,td,450);S('sand',u);
  later(u,.7,()=>{for(const e of enemies(u))if(Math.hypot(e.x-p.x,e.y-p.y)<110+e.r)hit(e,u,(e.root>0||e.stun>0?1.5:1)*50,{stun:.9,unblockable:1});detoFx(p.x,p.y,110,'sand');jx({jfx:'sandcoffin',x:p.x,y:p.y,t:.8,m:.8});if(near(p.x,p.y))shake=Math.max(shake,.35)},{x:p.x,y:p.y,r:110})}),
 sa_shield:S_('Bouclier absolu','3 s : dôme de sable qui arrête les projectiles ennemis, plus un bouclier',14,{ai:DEF},(u)=>{S('sand',u);field(u,u.x,u.y,{r:85,t:3,dome:1,follow:u,col:'#d8b878',vfx:'sand'});shieldU(u,30,3)}),
 sa_spears:S_('Lances de sable','3 lances de sable perçantes tirées l\'une après l\'autre',8,{ai:RG(520,.6)},(u,a)=>{const f=o=>{S('sand',o);proj(o,o.aim,{spd:900,r:8,dmg:10,life:.6,col:'#d8b878',pierce:1})};f(u);seqs.push({owner:u,n:2,t:.15,iv:.15,vfx:'sand',f})}),
});
Object.assign(NATHERO,{sa:'kylo'});
// ---- visuels
PROJD.sandwave=(p,R,ra,t)=>{g.rotate(ra);for(let i=0;i<22;i++){const s=(i/21-.5)*2,h=(1-Math.abs(s))*R*1.6+Math.sin(t/60+i)*3;g.fillStyle=vcol('sand','',i);g.beginPath();g.ellipse(-Math.abs(s)*R*.8,s*R*1.6,R*.45,h*.35+4,0,0,7);g.fill()}g.fillStyle=rgba('#f0d8a0',.5);g.beginPath();g.ellipse(R*.2,0,R*.4,R*1.5,0,0,7);g.fill()};

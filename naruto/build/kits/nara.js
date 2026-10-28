// ===== Clan Nara =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c2',[
 [1,'D','padme.1','Kage Mane','L\'ombre immobilise la cible','shadow'],
 [2,'C','grievous.2','Course de l\'ombre','Très rapide, insensible aux ralentissements','shadow'],
 [3,'B','x.na_kubi','Kage Kubi Shibari','Des mains d\'ombre saisissent la cible : immobilisée et étranglée','shadow'],
 [1,'C','x.na_trap','Ombre explosive','Pose un parchemin dans l\'ombre : piège qui immobilise puis explose','shadow'],
 [5,'S','x.na_nui','Kage Nui','Des aiguilles d\'ombre transpercent jusqu\'à 4 ennemis proches : dégâts et immobilise','shadow'],
 [4,'C','gideon.2','Ombre protectrice','Recule d\'un bond avec un bouclier d\'ombre','shadow'],
 [5,'A','rey.5','Ombres liées','Attire tous les ennemis proches puis les étourdit','shadow'],
]);
Object.assign(NAT,{
 na_kubi:S_('Kage Kubi Shibari','Des mains d\'ombre saisissent la cible : immobilisée et étranglée',10,{line:{len:420,w:20},ai:RG(420,.6)},(u,a)=>{S('shadow',u);proj(u,a,{spd:800,r:10,dmg:6,life:.55,col:'#141418',root:1.6,o:{dot:{dps:6,dur:1.6}}})}),
 na_nui:ULT('Kage Nui','Des aiguilles d\'ombre transpercent jusqu\'à 4 ennemis proches : dégâts et immobilise',{ai:{max:400,p:.8}},(u)=>{S('shadow',u);const L=enemies(u).filter(e=>dist(u,e)<420).sort((x,y)=>dist(u,x)-dist(u,y)).slice(0,4);for(const e of L){jx({jfx:'needles',ui:units.indexOf(u),ti:units.indexOf(e),x:e.x,y:e.y,t:.9,m:.9});later(u,.2,()=>hit(e,u,32,{root:1.4,unblockable:1}))}}),
 na_trap:S_('Ombre explosive','Pose un parchemin dans l\'ombre : piège qui immobilise puis explose',9,{ai:RG(380,.4)},(u,a,td)=>{trap(u,a,td||200,{root:1.2,dmg:24,r:60,col:'#141418',vfx:'shadow'})}),
});
Object.assign(NATHERO,{na:'padme'});
// ---- visuels
JFXD.needles=(f,k,e)=>{const u=f.ui!=null?units[f.ui]:null,tg=f.ti!=null?units[f.ti]:null;if(!u||!tg)return;const a=P(u.x,u.y,0),b=P(tg.x,tg.y,0),m=Math.min(1,e*4);g.strokeStyle='rgba(10,10,14,.85)';g.lineWidth=5*a.s;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(a.x+(b.x-a.x)*m,a.y+(b.y-a.y)*m);g.stroke();
 if(m>=1){g.fillStyle='rgba(10,10,14,.9)';for(let i=0;i<5;i++){const c=i*1.25;g.beginPath();g.moveTo(b.x+Math.cos(c)*12*b.s,b.y+Math.sin(c)*5*b.s);g.lineTo(b.x+Math.cos(c)*3*b.s,b.y-(26+i*4)*b.s*k);g.lineTo(b.x+Math.cos(c)*6*b.s,b.y+Math.sin(c)*5*b.s);g.fill()}}};

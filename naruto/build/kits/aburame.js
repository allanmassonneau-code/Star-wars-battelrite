// ===== Clan Aburame =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c4',[
 [1,'B','lando.1','Insectes chercheurs','Nuée qui rebondit sur 3 ennemis','bugs'],
 [2,'B','lando.2','Clone d\'insectes','Se téléporte et laisse un clone d\'insectes','bugs'],
 [3,'A','boba.3','Essaim d\'insectes','3 nuées qui empoisonnent','bugs'],
 [4,'B','x.ab_drain','Insectes dévoreurs','Lien d\'insectes : vole du chakra (et un peu de vie) tant que la cible reste proche','bugs'],
 [1,'D','x.ab_spy','Insectes espions','Nuée lente qui traque la cible : la révèle et la rend vulnérable 3 s','bugs'],
 [4,'C','x.ab_wall','Mur d\'insectes','2 s : un essaim t\'entoure et dévore les projectiles (rend du chakra)','bugs'],
 [5,'S','deathtrooper.5','Nuée destructrice','3 nuées qui attaquent 8 s','bugs'],
]);
Object.assign(NAT,{
 ab_drain:S_('Insectes dévoreurs','Lien d\'insectes : vole du chakra (et un peu de vie) tant que la cible reste proche',12,{ai:RG(300,.6)},(u,a,td)=>{const e=pick(u,a,td||250,320);S('bugs',u);if(!e)return;tether(u,e,4,340,'#4a5a3a',null,()=>{const d=Math.min(e.energy,8);e.energy-=d;u.energy=Math.min(100,u.energy+d);VFX='bugs';hit(e,u,4,{silent:1});VFX=null;sparks(e.x,e.y,'#4a5a3a',4,'bugs')})}),
 ab_spy:S_('Insectes espions','Nuée lente qui traque la cible : la révèle et la rend vulnérable 3 s',7,{ai:RG(560,.6)},(u,a)=>{S('bugs',u);proj(u,a,{spd:430,r:9,dmg:5,life:1.6,col:'#4a5a3a',home:1,o:{vuln:3,reveal:1}})}),
 ab_wall:S_('Mur d\'insectes','2 s : un essaim t\'entoure et dévore les projectiles (rend du chakra)',9,{ai:DEF},(u)=>{S('bugs',u);u.absorb=Math.max(u.absorb,2);u.absorbEn=4;sparks(u.x,u.y,'#26302a',20,'bugs')}),
});
Object.assign(NATHERO,{ab:'lando'});

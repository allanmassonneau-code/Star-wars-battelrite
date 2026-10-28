// ===== Clan Kaguya =====
// [emplacement, rang, mécanique (x.clé = NAT[clé], sinon perso.sort du moteur), nom, description, élément visuel]
KIT('c9',[
 [1,'C','gideon.1','Doigts-balles','Tire un os comme une balle','bone'],
 [2,'B','savage.2','Bond d\'os','Bondit et repousse tout à l\'arrivée','bone'],
 [3,'B','iden.3','Forêt naissante','Des os jaillissent du sol et étourdissent','bone'],
 [4,'B','gideon.4','Armure d\'os','Inarrêtable, 30 % de dégâts en moins','bone'],
 [1,'D','x.kg_willow','Danse du saule','Tourbillon de lames d\'os autour de soi, qui renvoie les tirs','bone'],
 [4,'A','x.kg_larch','Danse du mélèze','Des os jaillissent de tout le corps : dégâts autour, puis 3 s d\'épines et inarrêtable','bone'],
 [5,'S','x.kg_drill','Danse de la clématite','Foreuse d\'os géante : fonce à travers tout, énormes dégâts et projette','bone'],
 [5,'B','inquisitor.5','Forêt d\'os','Anneau d\'os qui jaillissent autour de soi','bone'],
]);
Object.assign(NAT,{
 kg_willow:S_('Danse du saule','Tourbillon de lames d\'os autour de soi, qui renvoie les tirs',7,{ai:SELF(110,.6)},(u)=>{S('bone',u);u.spin={t:.45,k:0,r:95,dmg:6};u.deflect=Math.max(u.deflect,.5)}),
 kg_larch:S_('Danse du mélèze','Des os jaillissent de tout le corps : dégâts autour, puis 3 s d\'épines et inarrêtable',12,{ai:SELF(120,.6)},(u)=>{S('bone',u);aoe(u,u.x,u.y,105,22,{kb:130},'#f2efe6');detoFx(u.x,u.y,90,'bone');u.thorns=Math.max(u.thorns,3);u.unstop=Math.max(u.unstop,3)}),
 kg_drill:ULT('Danse de la clématite','Foreuse d\'os géante : fonce à travers tout, énormes dégâts et projette',{line:{len:340,w:50},ai:{mode:'gap',min:80,max:340,p:.8}},(u,a)=>{S('bone',u);S('heavy',u);dash(u,a,340,.3,{dmg:46,through:1,kb:180,air:.5})}),
});
Object.assign(NATHERO,{kg:'gideon'});

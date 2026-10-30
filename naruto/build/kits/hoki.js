// ===== Clan Hoki (c11, préfixe hk_) : plantes =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[11], style(s) de combat propres (STYLES.push([…,[11],…])),
// apparence éventuelle (CLOOK[11]=(look,l,style)=>{…}), stats de référence (NATHERO.hk), équilibrage (CLANBAL["11"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 11, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c11',[
 [1,'C','x.hk_tmp1','Graine épineuse','Lance une graine épineuse qui ralentit la cible','leaf'],
 [2,'C','x.hk_tmp2','Pas de racine','Bondit vers le curseur','leaf'],
 [5,'A','x.hk_tmp5','Floraison géante','Une fleur géante éclôt au curseur : dégâts et étourdit','leaf'],
]);
Object.assign(NAT,{
 hk_tmp1:SP('Graine épineuse','Lance une graine épineuse qui ralentit la cible',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#8ab83a',slow:1})}),
 hk_tmp2:SP('Pas de racine','Bondit vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 hk_tmp5:ULT('Floraison géante','Une fleur géante éclôt au curseur : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#8ab83a')}),
});
Object.assign(NATHERO,{hk:'kylo'});

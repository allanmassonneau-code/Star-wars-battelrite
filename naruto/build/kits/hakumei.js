// ===== Clan Hakumei (c13, préfixe hm_) : araignées assassines =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[13], style(s) de combat propres (STYLES.push([…,[13],…])),
// apparence éventuelle (CLOOK[13]=(look,l,style)=>{…}), stats de référence (NATHERO.hm), équilibrage (CLANBAL["13"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 13, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c13',[
 [1,'C','x.hm_tmp1','Fil d\'araignée','Fil collant qui ralentit la cible','bugs'],
 [2,'C','x.hm_tmp2','Pas de l\'araignée','Bondit vers le curseur','bugs'],
 [5,'A','x.hm_tmp5','Toile mortelle','Une toile s\'abat sur la zone : dégâts et étourdit','bugs'],
]);
Object.assign(NAT,{
 hm_tmp1:SP('Fil d\'araignée','Fil collant qui ralentit la cible',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#6a4a8a',slow:1})}),
 hm_tmp2:SP('Pas de l\'araignée','Bondit vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 hm_tmp5:ULT('Toile mortelle','Une toile s\'abat sur la zone : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#6a4a8a')}),
});
Object.assign(NATHERO,{hm:'kylo'});

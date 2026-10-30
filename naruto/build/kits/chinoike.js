// ===== Clan Chinoike (c15, préfixe ci_) : sang et genjutsu =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[15], style(s) de combat propres (STYLES.push([…,[15],…])),
// apparence éventuelle (CLOOK[15]=(look,l,style)=>{…}), stats de référence (NATHERO.ci), équilibrage (CLANBAL["15"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 15, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c15',[
 [1,'C','x.ci_tmp1','Œil ensanglanté','Trait de sang qui ralentit la cible','genjutsu'],
 [2,'C','x.ci_tmp2','Pas sanglant','Bondit vers le curseur','genjutsu'],
 [5,'A','x.ci_tmp5','Lune de sang','Genjutsu sur la zone : dégâts et étourdit','genjutsu'],
]);
Object.assign(NAT,{
 ci_tmp1:SP('Œil ensanglanté','Trait de sang qui ralentit la cible',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#9a1424',slow:1})}),
 ci_tmp2:SP('Pas sanglant','Bondit vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 ci_tmp5:ULT('Lune de sang','Genjutsu sur la zone : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#9a1424')}),
});
Object.assign(NATHERO,{ci:'kylo'});

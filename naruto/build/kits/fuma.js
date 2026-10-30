// ===== Clan Fûma (c17, préfixe fm_) : assassins aux shuriken =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[17], style(s) de combat propres (STYLES.push([…,[17],…])),
// apparence éventuelle (CLOOK[17]=(look,l,style)=>{…}), stats de référence (NATHERO.fm), équilibrage (CLANBAL["17"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 17, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c17',[
 [1,'C','x.fm_tmp1','Fûma shuriken','Grand shuriken qui ralentit la cible','shuriken'],
 [2,'C','x.fm_tmp2','Saut de l\'ombre','Bondit vers le curseur','shuriken'],
 [5,'A','x.fm_tmp5','Pluie de shuriken','Des shuriken s\'abattent sur la zone : dégâts et étourdit','shuriken'],
]);
Object.assign(NAT,{
 fm_tmp1:SP('Fûma shuriken','Grand shuriken qui ralentit la cible',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#5a5a6e',slow:1})}),
 fm_tmp2:SP('Saut de l\'ombre','Bondit vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 fm_tmp5:ULT('Pluie de shuriken','Des shuriken s\'abattent sur la zone : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#5a5a6e')}),
});
Object.assign(NATHERO,{fm:'kylo'});

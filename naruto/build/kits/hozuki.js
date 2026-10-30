// ===== Clan Hôzuki (c19, préfixe hz_) : corps liquide =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[19], style(s) de combat propres (STYLES.push([…,[19],…])),
// apparence éventuelle (CLOOK[19]=(look,l,style)=>{…}), stats de référence (NATHERO.hz), équilibrage (CLANBAL["19"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 19, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c19',[
 [1,'C','x.hz_tmp1','Pistolet à eau','Goutte sous pression qui ralentit la cible','water'],
 [2,'C','x.hz_tmp2','Corps liquide','Glisse vers le curseur','water'],
 [5,'A','x.hz_tmp5','Vague hydrique','Une vague s\'abat sur la zone : dégâts et étourdit','water'],
]);
Object.assign(NAT,{
 hz_tmp1:SP('Pistolet à eau','Goutte sous pression qui ralentit la cible',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#4ac8d8',slow:1})}),
 hz_tmp2:SP('Corps liquide','Glisse vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 hz_tmp5:ULT('Vague hydrique','Une vague s\'abat sur la zone : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#4ac8d8')}),
});
Object.assign(NATHERO,{hz:'kylo'});

// ===== Clan Kami (c16, préfixe km_) : papier =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[16], style(s) de combat propres (STYLES.push([…,[16],…])),
// apparence éventuelle (CLOOK[16]=(look,l,style)=>{…}), stats de référence (NATHERO.km), équilibrage (CLANBAL["16"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 16, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c16',[
 [1,'C','x.km_tmp1','Papier tranchant','Feuille tranchante qui ralentit la cible','tag'],
 [2,'C','x.km_tmp2','Envol de papier','Bondit vers le curseur','tag'],
 [5,'A','x.km_tmp5','Tempête de papier','Des feuilles explosent sur la zone : dégâts et étourdit','tag'],
]);
Object.assign(NAT,{
 km_tmp1:SP('Papier tranchant','Feuille tranchante qui ralentit la cible',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#7a9ae0',slow:1})}),
 km_tmp2:SP('Envol de papier','Bondit vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 km_tmp5:ULT('Tempête de papier','Des feuilles explosent sur la zone : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#7a9ae0')}),
});
Object.assign(NATHERO,{km:'kylo'});

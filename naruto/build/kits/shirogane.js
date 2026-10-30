// ===== Clan Shirogane (c14, préfixe sg_) : marionnettes =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[14], style(s) de combat propres (STYLES.push([…,[14],…])),
// apparence éventuelle (CLOOK[14]=(look,l,style)=>{…}), stats de référence (NATHERO.sg), équilibrage (CLANBAL["14"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 14, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c14',[
 [1,'C','x.sg_tmp1','Lame de marionnette','Lame lancée par des fils qui ralentit','chain'],
 [2,'C','x.sg_tmp2','Fils de chakra','Se tire vers le curseur','chain'],
 [5,'A','x.sg_tmp5','Ballet des marionnettes','Les marionnettes frappent la zone : dégâts et étourdit','chain'],
]);
Object.assign(NAT,{
 sg_tmp1:SP('Lame de marionnette','Lame lancée par des fils qui ralentit',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#a8b4c8',slow:1})}),
 sg_tmp2:SP('Fils de chakra','Se tire vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 sg_tmp5:ULT('Ballet des marionnettes','Les marionnettes frappent la zone : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#a8b4c8')}),
});
Object.assign(NATHERO,{sg:'kylo'});

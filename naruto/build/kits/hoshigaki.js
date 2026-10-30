// ===== Clan Hoshigaki (c18, préfixe hs_) : requins et eau =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[18], style(s) de combat propres (STYLES.push([…,[18],…])),
// apparence éventuelle (CLOOK[18]=(look,l,style)=>{…}), stats de référence (NATHERO.hs), équilibrage (CLANBAL["18"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 18, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c18',[
 [1,'C','x.hs_tmp1','Requin d\'eau','Requin d\'eau qui ralentit la cible','water'],
 [2,'C','x.hs_tmp2','Nage du requin','Bondit vers le curseur','water'],
 [5,'A','x.hs_tmp5','Gueule du requin','Un requin géant jaillit sur la zone : dégâts et étourdit','water'],
]);
Object.assign(NAT,{
 hs_tmp1:SP('Requin d\'eau','Requin d\'eau qui ralentit la cible',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#4a7a9a',slow:1})}),
 hs_tmp2:SP('Nage du requin','Bondit vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 hs_tmp5:ULT('Gueule du requin','Un requin géant jaillit sur la zone : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#4a7a9a')}),
});
Object.assign(NATHERO,{hs:'kylo'});

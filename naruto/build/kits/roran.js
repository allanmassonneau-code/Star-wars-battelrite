// ===== Clan Roran (c12, préfixe rr_) : éventail et vent (style Temari) =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[12], style(s) de combat propres (STYLES.push([…,[12],…])),
// apparence éventuelle (CLOOK[12]=(look,l,style)=>{…}), stats de référence (NATHERO.rr), équilibrage (CLANBAL["12"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 12, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c12',[
 [1,'C','x.rr_tmp1','Lame d\'éventail','Lame de vent rapide qui repousse','wind'],
 [2,'C','x.rr_tmp2','Bourrasque','Bondit porté par le vent','wind'],
 [5,'A','x.rr_tmp5','Grande faux du vent','Le vent s\'abat sur la zone visée : dégâts et étourdit','wind'],
]);
Object.assign(NAT,{
 rr_tmp1:SP('Lame d\'éventail','Lame de vent rapide qui repousse',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#e0b84a',slow:1})}),
 rr_tmp2:SP('Bourrasque','Bondit porté par le vent',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 rr_tmp5:ULT('Grande faux du vent','Le vent s\'abat sur la zone visée : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#e0b84a')}),
});
Object.assign(NATHERO,{rr:'kylo'});

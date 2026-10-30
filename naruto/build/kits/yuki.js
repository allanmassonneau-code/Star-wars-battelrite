// ===== Clan Yuki (c20, préfixe yu_) : glace =====
// KIT TEMPORAIRE (fondation) : 3 jutsu génériques pour que le clan soit jouable. L'agent du clan remplace tout ce fichier.
// À faire : kit complet (emplacements 1-5), trait TRAITS[20], style(s) de combat propres (STYLES.push([…,[20],…])),
// apparence éventuelle (CLOOK[20]=(look,l,style)=>{…}), stats de référence (NATHERO.yu), équilibrage (CLANBAL["20"] dans nr_ninja.js).
// Tant qu'aucun style ne liste le clan 20, il peut prendre les styles « sans clan » (Taijutsu, Kunai).
KIT('c20',[
 [1,'C','x.yu_tmp1','Aiguilles de glace','Aiguilles de glace qui ralentissent la cible','senbon'],
 [2,'C','x.yu_tmp2','Glissade de glace','Glisse vers le curseur','senbon'],
 [5,'A','x.yu_tmp5','Miroirs de glace','La glace éclate sur la zone : dégâts et étourdit','senbon'],
]);
Object.assign(NAT,{
 yu_tmp1:SP('Aiguilles de glace','Aiguilles de glace qui ralentissent la cible',7,{line:{len:520,w:20},ai:RG(520,.7)},(u,a)=>{anim(u,'throw2',.35);S('blaster',u);proj(u,a,{spd:760,r:8,dmg:20,life:.7,col:'#bfe6ff',slow:1})}),
 yu_tmp2:SP('Glissade de glace','Glisse vers le curseur',8,{ai:ESC},(u,a,td)=>{anim(u,'leap',.3);S('dash',u);dash(u,a,clamp(td||220,100,240),.25,{jump:30})}),
 yu_tmp5:ULT('Miroirs de glace','La glace éclate sur la zone : dégâts et étourdit',{tele:{r:120,max:460},ai:{max:460,p:.8}},(u,a,td)=>{const p=atP(u,a,td,460);anim(u,'raise',.5);S('boom',u);zone(u,p.x,p.y,120,50,.6,{stun:.6},'#bfe6ff')}),
});
Object.assign(NATHERO,{yu:'kylo'});

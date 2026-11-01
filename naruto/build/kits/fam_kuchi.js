// ===== Famille de sub f3 : Kuchiyose (invocations) =====
// Rashômon (sub_nrp1.js, réduit) · Chiens ninja (sub_nrp1.js) · Katsuyu (sub.js) · Crapaud (sub.js) · Manda (sub_nrp2.js) ; dash : Monture : Ninken (NOUVEAU)
KIT('f3',[
 ['D','x.sub_rasho','Kuchiyose : Rashômon','Un portail de démon surgit devant toi 1,2 s : il arrête les tirs et bloque le passage des deux côtés ; en sortant du sol, il repousse (8 dégâts)','smoke'],
 ['C','x.sub_dogs','Chiens ninja','La meute creuse sous l\'ennemi visé et jaillit du sol 0,6 s plus tard : morsures (16 dégâts) et entravé 1 s ; s\'éloigner à temps permet d\'y échapper','claws'],
 ['B','x.sub_katsu','Invocation : Katsuyu','Des limaces se posent sur toi et tes alliés proches : soin, régénération 2,5 s et chakra','heal'],
 ['A','x.sub_toad','Invocation : Crapaud','Gamabunta s\'écrase sur la zone (32 dégâts, étourdit), puis reste comme rempart sur un sol boueux','smoke'],
 ['S','x.sub_manda','Invocation : Manda','Un serpent géant charge tout droit à travers l\'arène et avale le 1er ennemi touché : caché et neutralisé 1,2 s, puis recraché (42 dégâts au total)','smoke'],
]);
DASHF[3]={src:'x.sub_d_kuc',n:'Ninken : Monture',d:'Un grand chien surgit et t\'emporte sur 260 ; le 1er ennemi bousculé est repoussé (6 dégâts)',vfx:'claws',cd:8};
Object.assign(NAT,{
 // --- Monture : Ninken (dash) : ruée sur le dos d'un chien invoqué ; il bouscule le 1er ennemi rencontré
 sub_d_kuc:S_('Ninken : Monture','Un chien t\'emporte et bouscule le 1er ennemi',8,{hero:'chewie',ai:{mode:'gap',min:120,max:330,p:.45}},(u,a)=>{subPoof(u.x,u.y,46,u);S('dash',u);anim(u,'crouch',.36);u.sub_mnt=.4;
  dash(u,a,260,.34,{jump:16,end:()=>{subPoof(u.x,u.y,40,u)}});aux.push({type:'sub_mnt',x:u.x,y:u.y,r:0,t:.42,m:.42,team:u.team,owner:u,n:0,a})}),
});
AUXF.sub_mnt=x=>{const u=x.owner;if(!u||u.dead){if(u)u.sub_mnt=0;x.t=0;return}x.x=u.x;x.y=u.y;u.sub_mnt=x.t>.04?x.t:0;if(x.n)return;
 for(const e of enemies(u))if(dist(u,e)<u.r+e.r+16&&!(e.phase>0)){x.n=1;const V=VFX;VFX='claws';hit(e,u,6,{kb:320,fx:u.x,fy:u.y,unblockable:1});VFX=V;say(e,'BOUSCULÉ','#e8c890');if(near(e.x,e.y))S('hit',e);break}};
AUXD.sub_mnt=()=>{};
// le chien est dessiné DERRIÈRE le ninja (crochet drawB du trait des sans-clan) : le cavalier reste visible
subTH({drawB(u,p,S,sk){if(!(u.sub_mnt>0)||u.dead||typeof subDog!=='function')return;const t=performance.now()/1000,al=Math.min(1,u.sub_mnt/.08);subDog(u.x-Math.cos(u.aim)*4,u.y-1,2,u.aim,2.1,0,0,t,al)}});
AFTER.push(()=>UK.push('sub_mnt'));

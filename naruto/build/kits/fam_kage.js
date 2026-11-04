// ===== Famille de sub f5 : Kage Bunshin (clones de l'ombre) =====
// Kage Bunshin : leurre (sub_nrp2.js, n'est plus un déplacement) · Contre du clone (sub.js) · Clone explosif (sub.js) · Multiclonage (sub.js, 4 s) · Rasengan (sub.js : Ôdama si un clone est vivant) ;
// dash : Kage Bunshin : Tremplin (NOUVEAU — le Kawarimi est la touche A de tout le monde)
KIT('f5',[
 ['D','x.sub_leurre','Kage Bunshin : leurre','Tu deviens invisible 0,6 s ; un clone continue ta course : les ennemis le prennent pour toi, il s\'efface au 1er coup','smoke'],
 ['C','x.sub_counter','Contre du clone','0,7 s : le prochain coup ne frappe qu\'un clone ; tu surgis derrière l\'attaquant proche, le frappes (14 dégâts) et l\'étourdis','smoke'],
 ['B','x.sub_bomb','Clone explosif','Un clone fonce sur l\'ennemi visé et explose à son contact (20 dégâts) ; frappé en chemin, il explose aussitôt','smoke'],
 ['A','x.sub_clones','Multiclonage','2 clones attaquent avec ton style 4 s ; ils arrêtent les tirs ennemis et disparaissent au 1er coup','smoke'],
 ['S','x.sub_rasen','Rasengan','Fonce avec la sphère : broie et projette la cible (étourdie contre un obstacle) ; un clone vivant (Multiclonage, leurre, Tremplin) en fait un Ôdama Rasengan','rasengan'],
]);
DASHF[5]={src:'x.sub_d_kb',n:'Kage Bunshin : Tremplin',d:'Un clone surgit et te lance à 240 vers le curseur ; il reste 1,2 s à ta place (les coups le visent) puis éclate en fumée qui ralentit',vfx:'smoke',cd:7};
Object.assign(NAT,{
 // --- Tremplin (dash) : le clone apparaît derrière toi, te propulse ; il reste comme leurre puis part en fumée (l'ancienne Bombe fumigène)
 sub_d_kb:S_('Kage Bunshin : Tremplin','Un clone te lance, puis sert de leurre',7,{hero:'luke',ai:{mode:'gap',min:140,max:320,p:.45}},(u,a)=>{const ox=u.x,oy=u.y;S('poof',u);S('dash',u);anim(u,'sub_jump',.38);
  const back=subFree({x:ox-Math.cos(a)*18,y:oy-Math.sin(a)*18},16);subPoof(back.x,back.y,36,u);
  subDecoy(u,back.x,back.y,1.2,{fin:x=>{const p=x.p;if(!p)return;field(u,p.x,p.y,{r:80,t:1.6,slow:1,col:'#a8a8b0',vfx:'smoke'});aux.push({type:'sub_smk',x:p.x,y:p.y,r:80,t:1.6,m:1.6,team:u.team,owner:u,L:[]});fxRing(p.x,p.y,{u,r0:16,r1:80,col:'#d8d8e0',w:4,t:.35})}});
  jx({jfx:'sub_kbpush',x:back.x,y:back.y,a,t:.35,m:.35});fxWind(back.x+Math.cos(a)*40,back.y+Math.sin(a)*40,a,{u,len:120,w:40,n:5,t:.35,col:'#eceff4'});
  dash(u,a,240,.3,{jump:46,end:()=>{jx({jfx:'sub_land',x:u.x,y:u.y,r:50,t:.4,m:.4});fxSmoke(u.x,u.y,{u,col:'#c8c0b0',n:4,r:30,s:12,t:.6,al:.22,rise:10})}})}),
});
// élan du lancer : deux mains de clone et un souffle de fumée dans l'axe
JFXD.sub_kbpush=(f,k,e)=>{const q=P(f.x,f.y,30),s=q.s;g.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const d=(10+e*60+i*8)*s,b=f.a+(i%2?.2:-.2);circ(q.x+Math.cos(b)*d,q.y+Math.sin(b)*d*.6,(8-i)*s*k+1,rgba('#eceff4',.5*k))}
 g.strokeStyle=rgba('#ffffff',.7*k);g.lineWidth=2.5;g.beginPath();g.ellipse(q.x,q.y,(10+e*30)*s,(6+e*16)*s,f.a,-.9,.9);g.stroke()};

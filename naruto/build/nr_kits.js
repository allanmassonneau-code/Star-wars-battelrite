// ---------- Kits sur mesure : Suiton, Raiton, Doton et techniques de clan ----------
// AUXF : logique (hôte) des objets spéciaux ; AUXD : leur dessin ; PROJD : dessin de projectiles propres ; JFXD / DETO : effets visuels en plus
const AUXF={},AUXD={},PROJD={},JFXD={},DETO={};
// catalogue des jutsu : chaque fichier kits/<catégorie>.js appelle KIT(catégorie, lignes)
const KITROWS=[];
function KIT(cat,rows){for(const r of rows)KITROWS.push([cat,...r])}
// effet différé (ne s'annule pas si le lanceur est étourdi) ; avec r > 0, un cercle d'alerte s'affiche au sol
function later(u,t,f,o){aux.push(Object.assign({type:'tele',x:u.x,y:u.y,r:0,t,m:t,team:u.team,owner:u,vfx:VFX,f},o))}
AUXF.tele=x=>{if(x.t<=0&&!x.done){x.done=1;const V=VFX;VFX=x.vfx;CUR=x.owner;x.f(x);CUR=null;VFX=V}};
AUXD.tele=(x,k)=>{if(!x.r)return;const c=vcol(x.vfx,'#fff'),e=1-x.t/x.m;g.fillStyle=rgba(DARKV[x.vfx]?'#101014':c,.12);gEll(x.x,x.y,x.r);g.fill();g.fillStyle=rgba(DARKV[x.vfx]?'#101014':c,.3);gEll(x.x,x.y,x.r*e);g.fill();g.strokeStyle=c;g.lineWidth=2;gEll(x.x,x.y,x.r);g.stroke()};
// anneau de choc : touche les ennemis entre r0 et r1
const ringHit=(u,x,y,r0,r1,dmg,o)=>{for(const e of enemies(u)){const d=Math.hypot(e.x-x,e.y-y);if(d>r0-e.r&&d<r1+e.r)hit(e,u,dmg,Object.assign({fx:x,fy:y,unblockable:1},o))}};
const atP=(u,a,td,R)=>fwd(u,a,Math.min(td||300,R));
const lastZ=()=>zones[zones.length-1];
// intangible (Kamui, Corps liquide, Taupe) et Izanagi
function izRevive(t){const s=t.izS;t.izT=0;t.hp=Math.max(s.hp,t.max*.25);t.x=s.x;t.y=s.y;t.kx=t.ky=0;cleanse(t);collide(t);ring(t.x,t.y,60,'#e0304a');say(t,'IZANAGI !','#e0304a');return true}

// dessin des projectiles sur mesure (repère du projectile, unité = pixel à l'échelle)
// effets visuels supplémentaires
JFXD.shock=(f,k,e)=>{g.strokeStyle=rgba(f.col||'#c8a070',.8*k);g.lineWidth=6*k+1;gEll(f.x,f.y,f.r*(.3+e*.7));g.stroke();g.strokeStyle=rgba('#ffffff',.4*k);g.lineWidth=2;gEll(f.x,f.y,f.r*(.25+e*.7));g.stroke()};

const S_=SP; // raccourci


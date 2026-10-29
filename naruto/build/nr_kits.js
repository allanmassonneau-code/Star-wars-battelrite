// ---------- Kits sur mesure : Suiton, Raiton, Doton et techniques de clan ----------
// AUXF : logique (hôte) des objets spéciaux ; AUXD : leur dessin ; PROJD : dessin de projectiles propres ; JFXD / DETO : effets visuels en plus
const AUXF={},AUXD={},PROJD={},JFXD={},DETO={};
// catalogue des jutsu : chaque fichier kits/<catégorie>.js appelle KIT(catégorie, lignes)
const KITROWS=[];
function KIT(cat,rows){for(const r of rows)KITROWS.push([cat,...r])}
// ---------- Registres partagés par les kits ----------
// AFTER : fonctions lancées une fois tout le jeu chargé (ex. Object.assign(VP,{…}), UK.push('monChamp'))
// ANIM : animations 3D nommées, ANIM.nom=(P,e,u,t)=>{…} modifie la pose P (e = avancement 0 → 1) ; lancer avec anim(u,'nom',durée)
// TRAITS[clan] : trait de clan {nom,desc,init(u),update(u,dt),deal(src,t,dmg,o)→dmg,take(t,src,dmg,o)→dmg (<0 = annule),draw(u,p,S,sk),hud(u,x,y)}
// STATD : dessins d'états supplémentaires sur les ninjas, (u,p,S,sk)=>{…}
const AFTER=[],ANIM={},TRAITS={},STATD=[];
const anim=(u,k,d=.5)=>{u.anim={k,t:d,m:d}};
const trait=u=>u&&u.ch&&TRAITS[u.ch.clan]||null;
function traitDmg(t,src,dmg,o){const a=src&&src!==t?trait(src):null,d=trait(t);if(a&&a.deal)dmg=a.deal(src,t,dmg,o);if(dmg>=0&&d&&d.take)dmg=d.take(t,src,dmg,o);return dmg}
function drawExtraN(u,p,S,sk){if(u.dead)return;const T=trait(u);if(T&&T.draw)T.draw(u,p,S,sk);for(const f of STATD)f(u,p,S,sk)}

// ---------- Éléments : affinités, eau + foudre, feu + eau, vent + feu, chocs de jutsu ----------
// élément d'une attaque d'après son effet visuel (0 Katon, 1 Suiton, 2 Fûton, 3 Raiton, 4 Doton)
const ELM={fire:0,black:0,peacock:0,water:1,wind:2,rasenshuriken:2,lightning:3,chidori:3,kirin:3,earth:4,sand:4};
// cycle des natures : Katon bat Fûton, Fûton bat Raiton, Raiton bat Doton, Doton bat Suiton, Suiton bat Katon
const BEATS=[2,0,3,4,1];
function elemDmg(t,src,dmg,o){const el=o.el??ELM[VFX];if(el==null||el<0)return dmg;
 const tn=t.ch.nat;if(tn!=null&&tn>=0){if(BEATS[el]===tn)dmg*=1.15;else if(BEATS[tn]===el)dmg*=.9}
 if(el===3&&t.wet>0){dmg*=1.35;if(!o.arc&&src){let nb=null,bd=170;for(const e of units)if(e!==t&&!e.dead&&e.team===t.team&&e.wet>0){const d=Math.hypot(e.x-t.x,e.y-t.y);if(d<bd){bd=d;nb=e}}
  if(nb){beamFx(t.x,t.y,nb.x,nb.y,'#bfe6ff',3);const V=VFX;VFX='lightning';hit(nb,src,dmg*.4,{el:3,arc:1});VFX=V}}if(!o.silent&&near(t.x,t.y))say(t,'ÉLECTROCUTÉ','#bfe6ff')}
 if(el===0&&t.wet>0){dmg*=.75;t.wet=0;steamAt(t.x,t.y)}
 if(el===1){if(t.dotT>0&&t.dotEl===0){t.dotT=0;if(near(t.x,t.y))say(t,'ÉTEINT','#bfe6ff');steamAt(t.x,t.y)}t.wet=Math.max(t.wet||0,3)}
 return dmg}
function steamAt(x,y){if(near(x,y)){sparks(x,y,'#eef2f6',12,'smoke');fx.push({x,y,ring:40,t:.4,m:.4,col:'#e8eef6',vfx:'smoke'})}}
// le vent attise le feu : un projectile de feu qui traverse un vent (mur, tornade, couloir, zone) grossit et frappe plus fort
function inWind(p){for(const x of aux){if(x.vfx!=='wind')continue;if(x.type==='corridor'){const dx=p.x-x.x,dy=p.y-x.y,f=dx*Math.cos(x.a)+dy*Math.sin(x.a),s=Math.abs(-dx*Math.sin(x.a)+dy*Math.cos(x.a));if(f>0&&f<x.len&&s<x.w/2)return true}else if(x.r&&Math.hypot(p.x-x.x,p.y-x.y)<x.r)return true}
 for(const w of walls)if((w.wind||w.vfx==='wind')&&w.team===p.owner.team&&Math.hypot(p.x-w.x,p.y-w.y)<w.r+p.r+8)return true;for(const f of fields)if(f.vfx==='wind'&&Math.hypot(p.x-f.x,p.y-f.y)<f.r)return true;return false}
function boostFire(p){p.windB=1;p.dmg*=1.5;p.r*=1.35;p.big=1;if(near(p.x,p.y)){jx({jfx:'shock',x:p.x,y:p.y,r:46,t:.35,m:.35,col:'#ffb03a'});sparks(p.x,p.y,'#ffb03a',10,'fire')}}
// chocs de jutsu : deux projectiles ennemis qui se croisent s'annulent, ou le plus fort passe (l'élément dominant compte)
const clashOk=p=>!(p.dead||p.life<=0||p.grenade||p.hook||p.anchor||p.ret||p.swap||p.drag||p.noClash);
function clashPow(p,q){let w=(p.dmg||1)*(p.big?1.5:1)*(p.rocket?1.4:1)*(p.pierce?1.2:1);const e=ELM[p.vfx],f=ELM[q.vfx];if(e!=null&&f!=null&&BEATS[e]===f)w*=1.7;return w}
function clashProjs(){for(let i=0;i<projs.length;i++){const a=projs[i];if(!clashOk(a))continue;for(let j=i+1;j<projs.length;j++){const b=projs[j];if(b.owner.team===a.owner.team||!clashOk(b))continue;const rr=a.r+b.r+2;if(Math.abs(a.x-b.x)>rr||Math.abs(a.y-b.y)>rr||Math.hypot(a.x-b.x,a.y-b.y)>rr)continue;
  const pa=clashPow(a,b),pb=clashPow(b,a),x=(a.x+b.x)/2,y=(a.y+b.y)/2;
  if(pa>pb*1.3){a.dmg*=Math.max(.35,1-pb/pa);b.life=0}else if(pb>pa*1.3){b.dmg*=Math.max(.35,1-pa/pb);a.life=0}else{a.life=0;b.life=0}
  if(near(x,y)){jx({jfx:'clash',x,y,r:Math.min(70,18+(a.r+b.r)*1.6),c1:a.col,c2:b.col,t:.45,m:.45});sparks(x,y,a.col||'#fff',8);sparks(x,y,b.col||'#fff',8);S('deflect',null);shake=Math.max(shake,.1)}
  const ea=ELM[a.vfx],eb=ELM[b.vfx];if((ea===0&&eb===1)||(ea===1&&eb===0))steamAt(x,y);if(a.life<=0)break}}}
JFXD.clash=(f,k,e)=>{const q=P(f.x,f.y,28),R=f.r*(.4+e*.9)*q.s;g.globalCompositeOperation='lighter';for(const [c,o] of[[f.c1||'#fff',0],[f.c2||'#fff',.4]]){g.strokeStyle=rgba(c,.85*k);g.lineWidth=3;g.beginPath();g.arc(q.x,q.y,R*(1-o*.3),0,7);g.stroke()}
 g.fillStyle=rgba('#ffffff',.9*k);g.beginPath();for(let i=0;i<10;i++){const b=i*Math.PI/5+f.x,L=i%2?R*.25:R*.9;g.lineTo(q.x+Math.cos(b)*L,q.y+Math.sin(b)*L*.7)}g.closePath();g.fill()};
// états visibles : trempé (gouttes), en feu (flammes)
STATD.push((u,p,S)=>{const t=performance.now()/1000;
 if(u.wet>0){g.save();g.globalAlpha=Math.min(1,u.wet);for(let i=0;i<5;i++){const k=((t*1.6+i*.21)%1),x=p.x+Math.sin(i*2.3)*12*S,y=p.y-(52-k*44)*S;g.fillStyle='#7fc8ff';g.beginPath();g.ellipse(x,y,1.6*S,2.6*S,0,0,7);g.fill()}g.restore()}
 if(u.dotT>0&&u.dotEl===0&&!u.mk){g.save();g.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const a=i*1.6+t*3,x=p.x+Math.cos(a)*10*S,y=p.y-(14+((t*50+i*19)%40))*S;g.fillStyle=i%2?'rgba(255,170,60,.75)':'rgba(255,90,30,.7)';g.beginPath();g.moveTo(x-3*S,y);g.quadraticCurveTo(x,y-11*S,x+3*S,y);g.fill()}g.restore()}});
// budget : les ninjas sans clan sont polyvalents (+2 points)
const budgetOf=b=>BUDGET+(b&&b.clan<0?2:0);
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

AFTER.push(()=>UK.push('run'));
// jauge de course (séparée de l'endurance des coups et de la parade) : petit arc sous le joueur
STATD.push((u,p,S)=>{if(u!==player||u.run==null||u.run>=99.5)return;g.save();g.lineWidth=3*S;g.strokeStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(p.x,p.y+4*S,20*S,7*S,0,.3,Math.PI-.3);g.stroke();g.strokeStyle=u.sprintLock?'#ff7a5a':'#9ef0ff';g.beginPath();g.ellipse(p.x,p.y+4*S,20*S,7*S,0,Math.PI-.3-(Math.PI-.6)*u.run/100,Math.PI-.3);g.stroke();g.restore()});
// parade parfaite : bras avant levé puis fouetté vers l'extérieur
AFTER.push(()=>{ANIM.parry=(P,e)=>{const k=e<.4?e/.4:1-(e-.4)/.6;pz(P,'armR',-1.5*k,0,-.6*k+(e>.4?.9*(e-.4):0));pz(P,'foreR',-.9*k);pz(P,'armL',-.5*k,0,.5*k);pz(P,'chest',.2*k,-.35*k);P.root.z=-3*k}});

'use strict';
// ================= GRAFICA 2: attrezzi, animali, piante, cibi, atmosfera =================
// Solo aspetto. Sostituisce immagini e disegni dopo i generatori originali; non tocca logica né dati.

// ---------- stile a toni pieni per tutte le immagini "a volume" (icone, cibi, colture, oggetti) ----------
const CEL=(()=>{const _lit=lit,_pick=pickI;
 const cl=(n,o)=>{const v=_lit(n,o);return v<.3?.17:v<.56?.45:v<.8?.62:v<1.02?.8:.96};
 const cp=(n,v)=>Math.min(n-1,Math.floor(clamp(v,0,.999)*n));
 const run=f=>function(){const a=lit,b=pickI;lit=cl;pickI=cp;try{return f.apply(this,arguments)}finally{lit=a;pickI=b}};
 for(const name of ['genIconsHD','genCropsHD','genCritters','genAnimalArt','genGardenArt','genDishArt','genFarm2Art','genTradeArt','genFreeArt','genMissionArt','genFestArt','genBuildArt','genEspArt','genCostrArt','genSempreArt','genAspettoArt','genMineArt','genValleArt','genPietraArt','genPropsHD','genWoodArt','genDeco'])
  if(typeof window[name]==='function')window[name]=run(window[name]);
 return {run}})();

// ---------- kit generico: maschere di qualunque misura ----------
class MK2{constructor(w,h){this.w=w;this.h=h;this.a=new Uint8Array(w*h)}
 has(X,Y){return X>=0&&Y>=0&&X<this.w&&Y<this.h&&this.a[Y*this.w+X]===1}
 fn(f,x0=0,y0=0,x1=this.w-1,y1=this.h-1){for(let Y=Math.max(0,Math.floor(y0));Y<=Math.min(this.h-1,Math.ceil(y1));Y++)for(let X=Math.max(0,Math.floor(x0));X<=Math.min(this.w-1,Math.ceil(x1));X++)if(f(X+.5,Y+.5,X,Y))this.a[Y*this.w+X]=1;return this}
 rect(x,y,w,h){return this.fn(()=>true,x,y,x+w-1,y+h-1)}
 ell(cx,cy,rx,ry,clip){return this.fn((x,y,X,Y)=>{const a=(x-cx)/rx,b=(y-cy)/ry;return a*a+b*b<=1&&(!clip||clip(X,Y))},cx-rx-1,cy-ry-1,cx+rx+1,cy+ry+1)}
 rot(cx,cy,rx,ry,ang,clip){const c=Math.cos(ang),s=Math.sin(ang),m=Math.max(rx,ry)+1;return this.fn((x,y,X,Y)=>{const dx=x-cx,dy=y-cy,u=(dx*c+dy*s)/rx,v=(-dx*s+dy*c)/ry;return u*u+v*v<=1&&(!clip||clip(X,Y))},cx-m,cy-m,cx+m,cy+m)}
 cap(ax,ay,bx,by,r,r2=r){const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1,m=Math.max(r,r2)+1;return this.fn((x,y)=>{const t=clamp(((x-ax)*dx+(y-ay)*dy)/L2,0,1),rr=r+(r2-r)*t;return Math.hypot(x-ax-dx*t,y-ay-dy*t)<=rr},Math.min(ax,bx)-m,Math.min(ay,by)-m,Math.max(ax,bx)+m,Math.max(ay,by)+m)}
 poly(pts){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [a,b] of pts){x0=Math.min(x0,a);y0=Math.min(y0,b);x1=Math.max(x1,a);y1=Math.max(y1,b)}
  return this.fn((x,y)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins},x0,y0,x1,y1)}
 sub(o){for(let i=0;i<this.a.length;i++)if(o.a[i])this.a[i]=0;return this}
 each(f){for(let i=0;i<this.a.length;i++)if(this.a[i])f(i%this.w,(i/this.w)|0)}}
function paint2(P,M,R,o={}){const b=o.base??3;
 M.each((X,Y)=>{let t=b;const r1=!M.has(X+1,Y),bt=!M.has(X,Y+1),l=!M.has(X-1,Y),tp=!M.has(X,Y-1),r2=!M.has(X+2,Y)||!M.has(X,Y+2);
  if(!o.flat){if(r1||bt)t=b-1;else if(r2&&!o.thin)t=b-1;else if(l||tp)t=b+1}
  if(o.mod)t=o.mod(X,Y,t);if(t==null)return;P.set(X,Y,R[clamp(t,0,R.length-1)])});
 if(o.nc)return;const d=P.d,k=o.ck??.7,seen=new Set();
 M.each((X,Y)=>{for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=X+dx,yy=Y+dy;if(xx<0||yy<0||xx>=P.w||yy>=P.h||M.has(xx,yy))continue;const i=(yy*P.w+xx)*4;if(!d[i+3]||seen.has(i))continue;seen.add(i);d[i]*=k;d[i+1]*=k;d[i+2]*=k}})}
const R6b=h=>ramp6(h);
const mkM=(P)=>new MK2(P.w,P.h);
// manico in diagonale (dal basso a sinistra all'alto a destra), largo 2-3 px
function handle(P,x0,y0,len,R,o={}){for(let i=0;i<len;i++){const x=x0+i,y=y0-i;const wrap=o.wrap&&i>=o.wrap[0]&&i<o.wrap[1];const RR=wrap?o.wrapR:R;
  P.set(x,y,RR[3]);P.set(x-1,y,RR[4]);P.set(x,y+1,RR[2]);if(o.thick)P.set(x+1,y+1,RR[1]);if(wrap&&i%2)P.set(x,y,RR[2])}}
const icon32=fn=>{const P=new PX(32,32);fn(P);P.outline();return pxCanvas(P)};

// ---------- attrezzi: sagome ben distinte ----------
const TOOLS={
 // zappa: manico lungo, lama piatta che scende ad angolo retto
 hoe:()=>icon32(P=>{const W=R6b('#a87a48'),I=R6b('#c8743a'),S=R6b('#a8b0b8');
  handle(P,3,29,22,W);
  paint2(P,mkM(P).poly([[18,6],[22,3],[30,11],[29,15],[25,12]]),I,{thin:1});
  paint2(P,mkM(P).poly([[25,12],[29,15],[27,17],[23,14]]),S,{thin:1,mod:(X,Y,t)=>t+1});
  paint2(P,mkM(P).rect(19,5,4,4),R6b('#5a5a64'),{thin:1})}),
 // pala: impugnatura a D in basso, lama larga e arrotondata in alto
 pala:()=>icon32(P=>{const W=R6b('#b8884e'),S=R6b('#7a8a9a');
  handle(P,5,26,14,W);
  paint2(P,mkM(P).ell(4,28,3.2,3.2).sub(mkM(P).ell(4,28,1.4,1.4)),R6b('#5a3a1e'),{thin:1});
  paint2(P,mkM(P).rect(17,11,4,4),R6b('#4a4a54'),{thin:1});
  paint2(P,mkM(P).rot(24.5,7.5,8,5.6,-Math.PI/4),S,{mod:(X,Y,t)=>{const d=(X-Y)-(24.5-7.5);if(Math.abs(d)<1)t--;if(X+Y<26)return null;return t}});
  P.set(29,3,R6b('#c8d0d8')[5]);P.set(28,3,R6b('#c8d0d8')[4])}),
 // accetta: manico rosso corto, testa con lama a mezzaluna lucida
 accetta:()=>icon32(P=>{const W=R6b('#8a3a2a'),S=R6b('#9aa2aa');
  handle(P,6,29,16,R6b('#a8743e'),{wrap:[0,6],wrapR:W});
  paint2(P,mkM(P).poly([[16,9],[20,5],[23,8],[19,12]]),R6b('#5a5a64'),{thin:1});
  paint2(P,mkM(P).poly([[21,7],[26,2],[31,7],[30,13],[27,16],[23,11]]),S,{mod:(X,Y,t)=>((X-2)+(Y-2)>=33?5:t)})}),
 // piccone: arco di ferro a due punte
 piccone:()=>icon32(P=>{const W=R6b('#a87a48'),I=R6b('#8a909c');
  handle(P,4,29,20,W);
  const M=mkM(P);for(let i=-11;i<=11;i++){const t=i/11,bx=20+i*.72+(1-t*t)*2.4,by=10+i*.72-(1-t*t)*2.4,r=2.5*(1-Math.abs(t)*.65)+.4;M.ell(bx,by,r,r)}
  paint2(P,M,I);P.set(12,3,I[5]);P.set(29,19,I[5]);
  paint2(P,mkM(P).rect(18,8,4,4),R6b('#8a5a32'),{thin:1})}),
 // annaffiatoio verde rame, con cipolla forata
 can:()=>icon32(P=>{const G=R6b('#4a8a6a'),B=R6b('#b8863a');
  paint2(P,mkM(P).cap(20,18,29,9,1.6,1.4),G);
  paint2(P,mkM(P).rot(29,8,3,2,-.8),B);
  paint2(P,mkM(P).rect(5,13,16,15).fn((x,y)=>Math.hypot(x-13,y-13)<9&&y<14),G,{mod:(X,Y,t)=>(Y===19||Y===24)?t-1:t});
  const hM=mkM(P).fn((x,y)=>{const d=Math.hypot(x-12,y-11);return d<7.5&&d>5.5&&y<11});paint2(P,hM,B,{thin:1});
  P.set(28,6,C('#e8e8f0'));P.set(30,7,C('#e8e8f0'))}),
 // canna: bambù, mulinello, lenza e galleggiante
 canna:()=>icon32(P=>{const W=R6b('#c8a050');
  handle(P,3,30,26,W);for(const i of [6,12,18])P.set(3+i,30-i,W[1]);
  paint2(P,mkM(P).ell(9,22,2.8,2.8),R6b('#6a6e78'),{thin:1});P.set(9,22,C('#2e2e34'));
  for(let y=5;y<22;y++)P.set(29,y,C('#e8e8e0'),180);
  paint2(P,mkM(P).ell(29,23,2.2,2.6),R6b('#d8402a'),{thin:1});for(let x=27;x<=31;x++)P.set(x,23,C('#f4f0e4'))}),
};

// ---------- particelle e atmosfera ----------
{const _dp=drawParts;
 drawParts=function(){const rest=[];
  for(const p of G.parts){const X=p.x,Y=p.y,f=1-p.t/p.life;
   if(p.k==='leaf'){const r=Math.sin(p.t*3+p.ph),a=Math.min(1,f*4);ctx.globalAlpha=a;ctx.fillStyle='rgba(30,16,8,.25)';ctx.fillRect(Math.round(X)+1,Math.round(Y)+2,2,.5);ctx.fillStyle=p.c;
    if(r>.4){ctx.fillRect(Math.round(X),Math.round(Y),2.5,1);ctx.fillRect(Math.round(X)+.5,Math.round(Y)+1,1.5,.5)}else if(r>-.4){ctx.fillRect(Math.round(X),Math.round(Y),1.5,1.5);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(Math.round(X)+1,Math.round(Y)+1,.5,.5)}else ctx.fillRect(Math.round(X)+.5,Math.round(Y),1,2.5);ctx.globalAlpha=1}
   else if(p.k==='rain'){ctx.fillStyle='rgba(170,195,235,.35)';ctx.fillRect(Math.round(X*2)/2,Math.round(Y),.5,8);ctx.fillStyle='rgba(225,238,255,.8)';ctx.fillRect(Math.round(X*2)/2-.5,Math.round(Y)+6,.5,3)}
   else if(p.k==='splash'){const k=p.t/p.life,r=1+k*4;ctx.strokeStyle=`rgba(210,228,250,${(.6*(1-k)).toFixed(2)})`;ctx.lineWidth=.5;ctx.beginPath();ctx.ellipse(X,Y+.5,r,r*.4,0,0,7);ctx.stroke();if(k<.5){ctx.fillStyle='rgba(230,240,255,.8)';ctx.fillRect(X-1.5,Y-2+k*3,.5,.5);ctx.fillRect(X+1,Y-2.5+k*3,.5,.5)}}
   else if(p.k==='smoke'){const r=1.5+p.t*1.4,a=.32*f,n=G.night>.5;ctx.fillStyle=n?`rgba(80,80,95,${a.toFixed(2)})`:`rgba(200,196,192,${a.toFixed(2)})`;ctx.beginPath();ctx.arc(X,Y,r,0,7);ctx.fill();ctx.fillStyle=n?`rgba(110,110,125,${(a*.7).toFixed(2)})`:`rgba(240,238,234,${(a*.8).toFixed(2)})`;ctx.beginPath();ctx.arc(X-r*.35,Y-r*.35,r*.55,0,7);ctx.fill()}
   else if(p.k==='fly'){const a=.5+Math.sin(p.t*6+p.ph)*.5,g=ctx.createRadialGradient(X,Y,0,X,Y,5);g.addColorStop(0,`rgba(230,255,140,${(a*.5).toFixed(2)})`);g.addColorStop(1,'rgba(230,255,140,0)');ctx.fillStyle=g;ctx.fillRect(X-5,Y-5,10,10);ctx.fillStyle=`rgba(250,255,200,${a.toFixed(2)})`;ctx.fillRect(Math.round(X),Math.round(Y),1,1)}
   else if(p.k==='dust'){const a=Math.min(1,f*2);ctx.fillStyle=`rgba(150,110,70,${(a*.8).toFixed(2)})`;ctx.fillRect(X-1,Y-1,2,2);ctx.fillStyle=`rgba(200,165,120,${(a*.7).toFixed(2)})`;ctx.fillRect(X-1,Y-1,1,1)}
   else if(p.k==='water'){ctx.fillStyle='rgba(150,205,245,.9)';ctx.fillRect(X,Y,1,1.5);ctx.fillStyle='rgba(235,248,255,.9)';ctx.fillRect(X,Y,.5,.5)}
   else if(p.k==='spark'){const g=ctx.createRadialGradient(X,Y,0,X,Y,3);g.addColorStop(0,'rgba(255,220,120,.6)');g.addColorStop(1,'rgba(255,200,80,0)');ctx.fillStyle=g;ctx.fillRect(X-3,Y-3,6,6);ctx.fillStyle=p.c||'#fff2a0';ctx.fillRect(X,Y,1,1)}
   else if(p.k==='bird'){const x=Math.round(X),y=Math.round(Y),ph=Math.floor(p.t*8+p.ph)%3;ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(x-2,y+40,4,1);ctx.fillStyle='#2a2420';ctx.fillRect(x-1,y,2,1);ctx.fillStyle='#4a4038';ctx.fillRect(x+(p.vx>0?1:-2),y,1,1);ctx.fillStyle='#2a2420';
    if(ph===0){ctx.fillRect(x-3,y-1,2,1);ctx.fillRect(x+1,y-1,2,1);ctx.fillRect(x-4,y-2,1,1);ctx.fillRect(x+3,y-2,1,1)}else if(ph===1){ctx.fillRect(x-3,y,2,1);ctx.fillRect(x+1,y,2,1)}else{ctx.fillRect(x-3,y+1,2,1);ctx.fillRect(x+1,y+1,2,1)}}
   else rest.push(p)}
  const all=G.parts;G.parts=rest;try{_dp()}finally{G.parts=all}};
}
// pioggia: velo obliquo e cerchi nelle pozzanghere; neve: fiocchi grandi in primo piano
{const _at=atmosphere;atmosphere=function(m){_at(m);try{
  if(m.interior||!G.st)return;const wx=G.st.weather,T=G.t;
  if(wx==='pioggia'){ctx.save();ctx.globalAlpha=.16;ctx.strokeStyle='#c8d8f0';ctx.lineWidth=.5;ctx.beginPath();
   for(let i=0;i<60;i++){const x=((i*53.7+T*-70)%(W+80)+W+80)%(W+80)-40,y=((i*97.1+T*520)%(H+60))-30;ctx.moveTo(x,y);ctx.lineTo(x-2.4,y+18)}ctx.stroke();ctx.restore();
   const cx=G.cam.x,cy=G.cam.y;ctx.save();ctx.lineWidth=.5;for(let i=0;i<26;i++){const per=1.1+(i%5)*.13,k=((T+i*.37)%per)/per,x=((i*137.3)%W),y=((i*71.9+Math.floor((T+i*.37)/per)*31)%H);ctx.strokeStyle=`rgba(200,220,245,${(.35*(1-k)).toFixed(2)})`;ctx.beginPath();ctx.ellipse(x,y,1+k*5,(1+k*5)*.38,0,0,7);ctx.stroke()}ctx.restore()}
  if(wx==='neve'){ctx.save();for(let i=0;i<34;i++){const sp=10+(i%6)*3,x=((i*113.3+T*(6+i%4)+Math.sin(T*.8+i)*18)%(W+20)+W+20)%(W+20)-10,y=((i*61.7+T*sp)%(H+20))-10,s=i%5===0?2.5:1.5;
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(x-.5,y-.5,s+1,s+1);ctx.fillStyle='rgba(255,255,255,.95)';ctx.fillRect(x,y,s,s)}ctx.restore()}
  if(wx==='nebbia'){ctx.save();const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(220,225,235,.0)');g.addColorStop(1,'rgba(220,225,235,.22)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore()}
 }catch(e){}}}

{const setTools=()=>{for(const k in TOOLS){try{ICON[k]=TOOLS[k]()}catch(e){console.error(e)}}};
 for(const name of ['genIconsHD','genFreeArt','genEspArt']){const f=window[name];if(typeof f!=='function')continue;window[name]=function(){const r=f.apply(this,arguments);setTools();return r}}}

// ---------- cibi e ricette: ogni piatto riconoscibile ----------
const DISH=(()=>{
 const steam=P=>{for(const [x0,ph] of [[11,0],[16,2],[21,1]])for(let y=2;y<9;y++)P.set(x0+Math.round(Math.sin(y*.9+ph)),y,C('#ffffff'),y<4?70:130)};
 const plate=(P,col='#f2ece0')=>{const R=R6b(col);paint2(P,mkM(P).ell(16,21,14.5,7),R,{thin:1});paint2(P,mkM(P).ell(16,20.5,11,5),R,{flat:1,nc:1,base:4});
  for(let a=0;a<12;a++){const t=a/12*Math.PI*2;P.set(Math.round(16+Math.cos(t)*13),Math.round(21+Math.sin(t)*6),C('#5a7ab0'))}};
 const bowl=(P,soup,col='#c87a4a')=>{const B=R6b(col),S=R6b(soup);paint2(P,mkM(P).ell(16,17,12.5,10.5,(X,Y)=>Y>=17),B);
  for(let X=5;X<28;X++)if(P.has(X,22))P.set(X,22,B[4]);paint2(P,mkM(P).ell(16,17,12.5,3.8),B,{base:4,thin:1});paint2(P,mkM(P).ell(16,17,10.5,2.8),S,{thin:1,nc:1,mod:(X,Y,t)=>Y<17?t+1:t})};
 const pie=(P,fill,lat=true)=>{const Cr=R6b('#d8984a'),F=R6b(fill);paint2(P,mkM(P).ell(16,20,14,8),Cr);paint2(P,mkM(P).ell(16,18.5,11,5.5),F,{nc:1});
  if(lat)for(let k=-8;k<=8;k+=4){for(let i=-5;i<=5;i++){const X=16+k+i,Y=18+i;if(Math.hypot((X-16)/11,(Y-18.5)/5.5)<1){P.set(X,Y,Cr[4]);P.set(X+1,Y,Cr[2])}const X2=16+k-i;if(Math.hypot((X2-16)/11,(Y-18.5)/5.5)<1)P.set(X2,Y,Cr[4])}}
  for(let a=0;a<16;a++){const t=a/16*Math.PI*2;P.set(Math.round(16+Math.cos(t)*13),Math.round(20+Math.sin(t)*7),Cr[a%2?2:5])}};
 const dots=(P,pts,col,r=1.2)=>{for(const [x,y] of pts)paint2(P,mkM(P).ell(x,y,r,r),R6b(col),{thin:1,nc:1})};
 const D={
  frittata:P=>{plate(P);paint2(P,mkM(P).ell(16,19,9,4.5),R6b('#f0c43a'),{mod:(X,Y,t)=>((X*5+Y*3)%9===0)?t-1:t});dots(P,[[12,18],[19,20],[16,17]],'#e8a028',1)},
  frittataasparagi:P=>{plate(P);paint2(P,mkM(P).ell(16,19,9,4.5),R6b('#f0c43a'));for(const x of [11,15,19])paint2(P,mkM(P).cap(x,21,x+3,15,.9),R6b('#6aa83a'),{thin:1})},
  polenta:P=>{plate(P,'#8a6a48');paint2(P,mkM(P).ell(16,18,10,5.5),R6b('#f0b830'),{mod:(X,Y,t)=>((X+Y*2)%7===0)?t-1:t});paint2(P,mkM(P).rect(14,12,8,2),R6b('#a8743e'),{thin:1})},
  umido:P=>{bowl(P,'#8a3a1e');dots(P,[[11,16],[14,17],[18,16],[21,17],[16,15]],'#e8dcc0',1);steam(P)},
  zuppa:P=>{bowl(P,'#e8902a');dots(P,[[12,16],[19,17]],'#f0e8f0',1.3);steam(P)},
  zuppaporri:P=>{bowl(P,'#d8d8a0');dots(P,[[11,16],[15,17],[20,16]],'#6aa83a',1);steam(P)},
  zuppacipolle:P=>{bowl(P,'#b8782a');paint2(P,mkM(P).rect(12,14,9,4),R6b('#d89848'));steam(P)},
  zuppabietole:P=>{bowl(P,'#a8203a');paint2(P,mkM(P).ell(17,16.5,3,1.2),R6b('#f4f0e4'),{thin:1,nc:1});steam(P)},
  minestrone:P=>{bowl(P,'#c8702a');dots(P,[[11,16],[14,17],[18,16],[21,17]],'#5a9a2a',1);dots(P,[[16,16],[13,15]],'#e8a028',.9);steam(P)},
  risottofunghi:P=>{plate(P);paint2(P,mkM(P).ell(16,19,9.5,4.8),R6b('#f0e0b0'),{mod:(X,Y,t)=>((X+Y)%3===0)?t-1:t});for(const [x,y] of [[12,17],[18,18],[15,20]]){paint2(P,mkM(P).ell(x,y,2.2,1.3),R6b('#8a5a32'),{thin:1,nc:1});P.set(x,y+1,C('#e8d8b8'))}},
  peperonata:P=>{plate(P);for(const [x,y,c] of [[11,18,'#d8302a'],[16,17,'#f0c030'],[20,19,'#d8302a'],[14,20,'#f0c030'],[19,16,'#3a8a2a']])paint2(P,mkM(P).rot(x,y,3,1.2,.6),R6b(c),{thin:1})},
  parmigiana:P=>{const Dm=R6b('#e8e0d0');paint2(P,mkM(P).rect(4,13,24,13),Dm);paint2(P,mkM(P).rect(6,14,20,9),R6b('#c83a2a'),{nc:1});for(let y=15;y<22;y+=3)for(let x=7;x<25;x+=4)paint2(P,mkM(P).ell(x+((y/3)%2)*2,y,1.8,1),R6b('#f0e0a0'),{thin:1,nc:1});dots(P,[[10,16],[20,19]],'#4a8a2a',.8)},
  insalata:P=>{bowl(P,'#4a9a2a','#d8e0e8');dots(P,[[12,15],[19,16]],'#e0402a',1.6);dots(P,[[16,14]],'#7ac04a',1.8)},
  insalatamista:P=>{bowl(P,'#4a9a2a','#d8e0e8');dots(P,[[11,15],[20,16]],'#e0402a',1.5);dots(P,[[15,14],[18,14]],'#f08a2a',1.2);dots(P,[[13,16]],'#e8e0a0',1.1)},
  pastaaglio:P=>{plate(P);const Y=R6b('#f0d080');for(let i=0;i<5;i++)paint2(P,mkM(P).fn((x,y)=>{const d=Math.hypot((x-16)/(9-i*1.5),(y-19)/(4.5-i*.8));return d<1&&d>.72}),Y,{thin:1,nc:1});dots(P,[[12,18],[19,19],[16,21]],'#3a7a2a',1)},
  gnocchi:P=>{plate(P);for(const [x,y] of [[11,18],[15,17],[19,18],[13,20],[17,20],[21,20],[16,22]])paint2(P,mkM(P).ell(x,y,2,1.4),R6b('#f0dca0'),{thin:1});dots(P,[[14,19],[18,19]],'#c83a2a',.8)},
  pizza:P=>{paint2(P,mkM(P).ell(16,18,14,9),R6b('#d89848'));paint2(P,mkM(P).ell(16,17.5,11.5,7),R6b('#c83a2a'),{nc:1});for(const [x,y] of [[11,15],[19,14],[15,19],[21,19],[10,19]])paint2(P,mkM(P).ell(x,y,2.2,1.6),R6b('#f4ecd0'),{thin:1,nc:1});dots(P,[[14,15],[18,18]],'#3a8a2a',.8)},
  arrosto:P=>{plate(P);for(const [x,y] of [[11,18],[17,17],[21,20],[14,21],[18,21]]){paint2(P,mkM(P).rot(x,y,3,2.2,.4),R6b('#d8963a'));P.set(x-1,y-1,C('#f8d890'))}dots(P,[[15,18]],'#4a8a2a',.8)},
  pane:P=>{paint2(P,mkM(P).ell(16,18,13,7.5),R6b('#c8843a'));for(const x of [9,14,19,24])for(let i=0;i<5;i++)P.set(x-2+i,14+i,C('#f0c070'))},
  panecasa:P=>{paint2(P,mkM(P).ell(16,18,11,9),R6b('#b8743a'));for(let i=-4;i<=4;i++){P.set(16+i,16+i,C('#f0c070'));P.set(16+i,16-i,C('#f0c070'))}P.set(12,13,C('#f8e0a0'))},
  focaccia:P=>{paint2(P,mkM(P).rect(4,12,24,14),R6b('#e0a848'),{mod:(X,Y,t)=>((X%5===2)&&(Y%4===1))?t-2:t});dots(P,[[9,15],[20,20]],'#5a8a2a',.8)},
  crostata:P=>pie(P,'#d82a3a'),
  torta:P=>pie(P,'#e87a1e',false),
  tortamele:P=>{pie(P,'#e8c070');for(const [x,y] of [[12,18],[16,17],[20,18],[14,20],[18,20]])paint2(P,mkM(P).rot(x,y,2.4,1,.3),R6b('#f0d898'),{thin:1,nc:1})},
  tortamore:P=>{pie(P,'#4a1a5a');dots(P,[[12,17],[17,18],[20,17],[15,20]],'#2a0a3a',1)},
  castagnaccio:P=>{paint2(P,mkM(P).ell(16,19,14,8),R6b('#6a3a1e'));for(const [x,y] of [[11,17],[17,16],[21,19],[14,21]])paint2(P,mkM(P).ell(x,y,1.2,.8),R6b('#e8d8a0'),{thin:1,nc:1});dots(P,[[19,17],[13,19]],'#3a6a2a',.7)},
  anguriafresca:P=>{plate(P);for(const x of [9,16,23]){paint2(P,mkM(P).poly([[x-5,22],[x+5,22],[x,12]]),R6b('#e83a4a'));for(let X=x-5;X<x+5;X++){P.set(X,22,C('#3a8a2a'));P.set(X,21,C('#d8f0c0'))}P.set(x-1,17,C('#1a1010'));P.set(x+1,19,C('#1a1010'))}},
  marmellata:P=>{paint2(P,mkM(P).rect(9,9,14,19),R6b('#c8202a'),{mod:(X,Y,t)=>X<11?t+1:t});paint2(P,mkM(P).rect(8,5,16,5),R6b('#d8c8a8'),{mod:(X,Y,t)=>((X+Y)%3===0)?t-1:t});paint2(P,mkM(P).rect(11,15,10,7),R6b('#f4ecd8'),{thin:1,nc:1});dots(P,[[16,18]],'#c8202a',1.4);P.set(11,11,C('#ff8080'))},
  tisana:P=>{const Cu=R6b('#e8e0d0');paint2(P,mkM(P).rect(8,12,15,14).fn((x,y)=>false),Cu);paint2(P,mkM(P).ell(15.5,24,7.5,3),Cu);paint2(P,mkM(P).ell(26,18,3,3.5).sub(mkM(P).ell(26,18,1.4,1.8)),Cu,{thin:1});paint2(P,mkM(P).ell(15.5,12,7.5,2.4),R6b('#e8c860'),{thin:1,nc:1});steam(P)},
 };
 return D})();
{const setDishes=()=>{for(const k in DISH){if(!ICON[k])continue;try{ICON[k]=icon32(DISH[k])}catch(e){console.error(e)}}};
 for(const name of ['genIconsHD','genAnimalArt','genDishArt','genGardenArt','genCostrArt','genFarm2Art']){const f=window[name];if(typeof f!=='function')continue;window[name]=function(){const r=f.apply(this,arguments);setDishes();return r}}}

// ---------- animali: ridisegnati a mano, stessi fotogrammi e misure ----------
const spr2=(w,h,fn)=>{const P=new PX(w,h);fn(P);P.outline();return pxCanvas(P)};
const ANI={
 chicken:()=>[0,1,2].map(f=>spr2(24,22,P=>{const W=R6b('#f4eee2'),Y=R6b('#e8a23a'),Rd=R6b('#d8302a'),peck=f===2,hx=peck?18:16,hy=peck?13:6;
  for(const k of [0,1]){const lx=10+k*3,sw=f===1?(k?1:-1):0;paint2(P,mkM(P).rect(lx+sw,15,1,5),Y,{flat:1,nc:1});P.set(lx+sw+1,20,Y[2]);P.set(lx+sw-1,20,Y[2]);P.set(lx+sw,20,Y[3])}
  paint2(P,mkM(P).poly([[2,4],[6,3],[9,10],[5,13],[2,9]]),W,{mod:(X,Y_,t)=>(X===4&&Y_>5)?t-1:t});
  paint2(P,mkM(P).ell(11,12,7,5),W);
  paint2(P,mkM(P).ell(10,12,4.2,2.6),W,{base:2,mod:(X,Y_,t)=>Y_===13&&X%2?1:t});
  paint2(P,mkM(P).cap(14,10,hx,hy+2,2.2,2.6),W);paint2(P,mkM(P).ell(hx,hy+1.5,3,3),W);
  for(const dx of [-2,-1,0])P.set(hx+dx,hy-2+(dx===-1?-1:0),Rd[3]);P.set(hx-1,hy-1,Rd[2]);P.set(hx+1,hy+4,Rd[3]);P.set(hx+1,hy+5,Rd[2]);
  P.set(hx+3,hy+1,Y[4]);P.set(hx+4,hy+1,Y[3]);P.set(hx+3,hy+2,Y[2]);P.set(hx+1,hy,C('#14100c'));P.set(hx+1,hy-1,C('#ffffff'))})),
 cat:()=>[0,1,2,3].map(f=>spr2(30,22,P=>{const K=R6b('#3a3446'),E=C('#c8e040');
  const ears=(cx,cy)=>{paint2(P,mkM(P).poly([[cx-4,cy-1],[cx-3,cy-5],[cx-1,cy-2]]),K,{thin:1});paint2(P,mkM(P).poly([[cx+1,cy-2],[cx+3,cy-5],[cx+4,cy-1]]),K,{thin:1});P.set(cx-3,cy-3,C('#c88090'));P.set(cx+3,cy-3,C('#c88090'))};
  if(f===3){paint2(P,mkM(P).ell(15,16,10,5),K);paint2(P,mkM(P).cap(6,19,16,20,1.4),K,{thin:1});paint2(P,mkM(P).ell(23,15,4.2,3.6),K);ears(23,13);P.set(22,15,K[0]);P.set(24,15,K[0]);P.set(23,16,K[0]);return}
  if(f===2){paint2(P,mkM(P).cap(8,20,4,11,1.4,1),K,{thin:1});paint2(P,mkM(P).ell(14,15,5.5,6),K);paint2(P,mkM(P).rect(12,17,2,4),K,{thin:1});paint2(P,mkM(P).rect(16,17,2,4),K,{thin:1});paint2(P,mkM(P).ell(16,8,4.2,3.8),K);ears(16,7);P.set(14,8,E);P.set(18,8,E);P.set(16,10,C('#c88090'));return}
  const st=f?1.5:-1.5;paint2(P,mkM(P).cap(5,13,2,6,1.3,1),K,{thin:1});
  for(const [x,k] of [[9,1],[11,-1],[18,1],[20,-1]])paint2(P,mkM(P).cap(x,15,x+st*k,21,1.2),k>0?K:K.map(c=>c.map(v=>v*.75)),{thin:1});
  paint2(P,mkM(P).ell(14,14,8.5,4.4),K,{mod:(X,Y,t)=>Y<11&&t<4?4:t});paint2(P,mkM(P).ell(24,10,4.2,3.8),K);ears(24,9);P.set(26,10,E);P.set(27,10,C('#14100c'));P.set(27,12,C('#c88090'))})),
 crow:()=>[0,1,2].map(f=>spr2(18,16,P=>{const K=R6b('#2c2834'),Bk=C('#4a4650');
  if(f===0){P.set(7,14,C('#c8a040'));P.set(10,14,C('#c8a040'));P.set(7,13,C('#a88030'));P.set(10,13,C('#a88030'));paint2(P,mkM(P).poly([[1,13],[4,9],[6,11],[3,14]]),K,{thin:1});paint2(P,mkM(P).ell(8,10,4.6,3.4),K);paint2(P,mkM(P).ell(12,6.5,2.8,2.5),K);
   P.set(15,7,Bk);P.set(16,7,Bk);P.set(15,8,K[1]);P.set(13,6,C('#e8e8e8'));return}
  paint2(P,mkM(P).ell(9,9,4.6,2.4),K);paint2(P,mkM(P).ell(13.5,8,2.2,2),K);P.set(16,8,Bk);P.set(14,7,C('#e8e8e8'));paint2(P,mkM(P).poly([[2,8],[5,7],[5,10]]),K,{thin:1});
  const wy=f===1?-6:5;paint2(P,mkM(P).poly([[7,8],[11,8],[6,8+wy],[4,8+wy*.8]]),K,{thin:1})})),
 duck:()=>[0,1].map(f=>spr2(26,18,P=>{const b=f?1:0,Br=R6b('#8a6a48'),G=R6b('#2a7a4a'),Gy=R6b('#a8a8a0'),Y=R6b('#e8b030');
  for(let X=2;X<23;X++)P.set(X,16,C('#9cc8e0'),f?140:90);for(let X=4;X<20;X+=3)P.set(X+f,17,C('#d8f0ff'),120);
  paint2(P,mkM(P).ell(11,12+b,8,4),Gy,{mod:(X,Y_,t)=>X>14?t:t});paint2(P,mkM(P).ell(15,12+b,4,3.4),Br);paint2(P,mkM(P).poly([[2,9+b],[6,10+b],[5,12+b]]),R6b('#3a3a40'),{thin:1});
  paint2(P,mkM(P).ell(9,10.5+b,5,2.2),Gy,{base:4,thin:1});paint2(P,mkM(P).cap(16,10+b,18,6+b,1.8),G);paint2(P,mkM(P).ell(18.5,5.5+b,3,2.8),G);
  for(let X=15;X<19;X++)P.set(X,9+b,C('#f4f4ec'));P.set(19,5+b,C('#14100c'));P.set(21,6+b,Y[4]);P.set(22,6+b,Y[3]);P.set(21,7+b,Y[2]);P.set(22,7+b,Y[2])})),
 rabbit:()=>[0,1,2].map(f=>spr2(22,20,P=>{const B=R6b('#a8886c'),Wh=R6b('#f4eee2'),l=f===1?-3:f===2?-1:0,s=f===1?2:0;
  if(f!==1){paint2(P,mkM(P).ell(13,18.5,2.2,1),B,{thin:1})}else paint2(P,mkM(P).cap(3,15+l,1,17+l,1),B,{thin:1});
  paint2(P,mkM(P).ell(9-s*.5,14+l,6+s,4.5),B,{mod:(X,Y,t)=>Y>15+l&&X<10?t:t});paint2(P,mkM(P).ell(3.5,13+l,2,2),Wh,{thin:1});
  paint2(P,mkM(P).cap(14,8+l,12.5,1+l,1.2),B,{thin:1});paint2(P,mkM(P).cap(16,8+l,17.5,2+l,1.2),B,{thin:1});P.set(17,4+l,C('#e8b0b0'));P.set(13,4+l,C('#e8b0b0'));
  paint2(P,mkM(P).ell(15.5,10+l,3.8,3.2),B);P.set(17,9+l,C('#14100c'));P.set(17,8+l,C('#ffffff'));P.set(19,11+l,C('#e08888'))})),
 frog:()=>[0,1].map(f=>spr2(14,10,P=>{const G=R6b('#5a9a3a');paint2(P,mkM(P).ell(7,7,5,2.8),G,{thin:1});paint2(P,mkM(P).ell(10,5,2.2,1.8),G,{thin:1});P.set(10,3,C('#e8e070'));P.set(11,4,C('#14100c'));P.set(4,6,G[1]);P.set(7,6,G[1]);if(f)paint2(P,mkM(P).ell(10,8,1.8,1.3),R6b('#e8e0a0'),{thin:1,nc:1})})),
 mucca:()=>[0,1].map(f=>spr2(28,22,P=>{const Wh=R6b('#f2ece0'),Bk=R6b('#2a2630'),Pk=R6b('#e8a8a0'),H=R6b('#d8c8a0');
  for(const [lx,o] of [[7,0],[10,1],[18,0],[21,1]]){const sw=(f&&o)?1:(f?-1:0)*(o?0:1);paint2(P,mkM(P).rect(lx+sw,14,2,7),o?Wh.map(c=>c.map(v=>v*.8)):Wh,{thin:1});P.set(lx+sw,20,Bk[2]);P.set(lx+sw+1,20,Bk[2])}
  paint2(P,mkM(P).cap(4,10,2,16,.8),Wh,{thin:1});P.set(2,17,Bk[2]);
  paint2(P,mkM(P).ell(14,11,10,5.4),Wh,{mod:(X,Y,t)=>{const s=Math.hypot(X-9,Y-9)<3.2||Math.hypot(X-17,Y-12)<3.4||Math.hypot(X-13,Y-7)<2;return s?Math.max(1,t-2)+(t>3?0:0):t}});
  for(let X=0;X<28;X++)for(let Y=0;Y<22;Y++){if(!P.has(X,Y))continue;if(Math.hypot(X-9,Y-9)<3.2||Math.hypot(X-17,Y-12)<3.4)P.set(X,Y,Bk[Y<9?3:2])}
  paint2(P,mkM(P).ell(13,16,2.4,1.4),Pk,{thin:1,nc:1});
  paint2(P,mkM(P).ell(23.5,8,4,3.6),Wh);paint2(P,mkM(P).ell(25.5,10.5,2.6,1.8),Pk,{thin:1});P.set(25,10,Pk[1]);P.set(27,10,Pk[1]);
  P.set(21,4,H[3]);P.set(21,3,H[4]);P.set(26,4,H[3]);P.set(27,3,H[4]);P.set(20,6,Wh[2]);P.set(24,7,C('#14100c'));P.set(24,6,C('#ffffff'))})),
};
// cervo e riccio: disegnati a mano (prima erano rettangoli)
const DEER=(()=>{const B=R6b('#9a6438'),Bl=R6b('#c08a58'),Wh=R6b('#f2e6d0'),An=R6b('#7a5a3a');
 const fr=(head,run,ph)=>spr2(36,48,P=>{const k=run?Math.sin(ph)*3:0;
  for(const [lx,o,far] of [[9,1,1],[12,-1,0],[23,-1,1],[26,1,0]]){const d=run?o*k:0;paint2(P,mkM(P).cap(lx,30,lx+d,45,1.4,1.1),far?B.map(c=>c.map(v=>v*.75)):B,{thin:1});P.set(Math.round(lx+d),46,C('#2a1a10'))}
  paint2(P,mkM(P).ell(18,26,12,6.5),B,{mod:(X,Y,t)=>Y<23&&t<4?t+1:t});paint2(P,mkM(P).ell(18,29,8,2.4),Bl,{nc:1,thin:1});
  for(const [x,y] of [[12,22],[16,21],[20,22],[14,25],[19,24]])P.set(x,y,Wh[4]);
  paint2(P,mkM(P).ell(5.5,22,2.4,2.2),Wh,{thin:1});
  if(head==='graze'){paint2(P,mkM(P).cap(27,25,31,38,2.8,2),B);paint2(P,mkM(P).ell(31,40,3.2,2.6),B);P.set(32,39,C('#14100c'));paint2(P,mkM(P).ell(28,36,1.6,1),B,{thin:1})}
  else{paint2(P,mkM(P).cap(27,24,29,12,3,2.4),B);paint2(P,mkM(P).ell(31,10,4.4,3.4),B);P.set(35,11,C('#14100c'));P.set(32,9,C('#14100c'));P.set(32,8,C('#ffffff'));paint2(P,mkM(P).ell(27,7,1.6,2.4),B,{thin:1});P.set(27,7,C('#e8b0a0'));
   const A=mkM(P);A.cap(29,6,28,0,.8);A.cap(28,3,25,1,.7);A.cap(32,6,33,0,.8);A.cap(33,3,35,1,.7);paint2(P,A,An,{thin:1,flat:1})}});
 return {stand:fr('up',false,0),graze:fr('graze',false,0),run:[0,1,2,3].map(i=>fr('up',true,i/4*Math.PI*2))}})();
const HOG=(()=>{const Q=R6b('#5a4a3a'),F=R6b('#c8a888');
 const walk=f=>spr2(22,14,P=>{paint2(P,mkM(P).ell(10,8,8,4.6),Q,{mod:(X,Y,t)=>((X+Y*2)%3===0&&Y<9)?t+1:((X*2+Y)%4===0?t-1:t)});for(let X=4;X<17;X+=2)P.set(X,3+((X/2)%2),Q[4]);
  paint2(P,mkM(P).ell(17.5,9.5,3,2.4),F);P.set(21,10,C('#14100c'));P.set(18,8,C('#14100c'));for(const [x,o] of [[6,0],[13,1]])P.set(x+(f===o?1:0),13,C('#2a1a10'))});
 const ball=spr2(16,14,P=>{paint2(P,mkM(P).ell(8,8,6,5),Q,{mod:(X,Y,t)=>((X+Y)%2===0)?t+1:t-1});for(let a=0;a<10;a++){const t=a/10*Math.PI*2;P.set(Math.round(8+Math.cos(t)*6.5),Math.round(8+Math.sin(t)*5.5),Q[5])}P.set(9,3,C('#c02a1a'));P.set(10,3,C('#c02a1a'))});
 return {walk:[walk(0),walk(1)],ball}})();
{const setAni=()=>{try{for(const k of ['chicken','cat','crow','duck','rabbit','frog'])if(CRIT[k])CRIT[k]=ANI[k]();if(AIMG.mucca)AIMG.mucca=ANI.mucca()}catch(e){console.error(e)}};
 for(const name of ['genDeco','genCritters','genAnimalArt']){const f=window[name];if(typeof f!=='function')continue;window[name]=function(){const r=f.apply(this,arguments);setAni();return r}}
 drawDeer=function(e){const X=Math.round(e.x),Y=Math.round(e.y),run=e.st==='flee',img=run?DEER.run[Math.floor((e.f||0)*1.2)%4]:e.st==='graze'?DEER.graze:DEER.stand,w=iw(img),h=ih(img);
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(X,Y,8,1.8,0,0,7);ctx.fill();
  if(e.dir<0){ctx.save();ctx.translate(X,0);ctx.scale(-1,1);ctx.drawImage(img,-w/2,Y-h+1,w,h);ctx.restore()}else ctx.drawImage(img,X-w/2,Y-h+1,w,h)};
 drawHog=function(h){const X=Math.round(h.x),Y=Math.round(h.y);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(X,Y,4.5,1.2,0,0,7);ctx.fill();
  const img=h.ball>0?HOG.ball:HOG.walk[Math.floor(h.f||0)%2],w=iw(img),hh=ih(img);
  if(h.dir<0&&!(h.ball>0)){ctx.save();ctx.translate(X,0);ctx.scale(-1,1);ctx.drawImage(img,-w/2,Y-hh+1,w,hh);ctx.restore()}else ctx.drawImage(img,X-w/2,Y-hh+1,w,hh)}}

// ---------- il Cavaliere senza testa ----------
const HORSEMAN=(()=>{
 const HB=R6b('#1e1826'),HBd=HB.map(c=>c.map(v=>v*.72)),MN=R6b('#2a1420'),AR=R6b('#2a2a34'),CO=R6b('#141018'),RD=R6b('#8a0e14'),RD2=R6b('#c41a1a'),ST=R6b('#b8c0c8'),HF=R6b('#4a4a54');
 const frame=f=>spr2(88,80,P=>{
  const legs=f?[[56,50,62,58,58,67,1],[52,50,54,64,58,76,0],[24,50,28,62,34,72,1],[28,50,22,64,18,76,0]]:[[56,50,66,62,72,72,1],[52,50,56,62,53,76,0],[24,50,14,61,7,71,1],[28,50,30,64,28,76,0]];
  // coda
  for(let i=0;i<7;i++)paint2(P,mkM(P).cap(19,37+i,4-(f?3:0)+i*.6,50+i*2.2+(f?-2:0),1.4,.6),i%3===1?RD:MN,{thin:1});
  // mantello: fodera rosso sangue sotto, nero sopra, sfilacciato
  const capeM=mkM(P).poly([[33,9],[40,10],[34,30],[22,42],[14,46-(f?4:0)],[6,40-(f?5:0)],[12,30],[22,18]]);
  for(let X=0;X<88;X++){const cut=40-(f?4:0)+((X*7)%5)+(X%3?2:0);for(let Y=cut;Y<80;Y++)capeM.a[Y*88+X]=0}
  paint2(P,capeM,RD2,{mod:(X,Y,t)=>((X+Y*2+f*3)%7===0)?t-1:t});
  paint2(P,mkM(P).poly([[33,9],[40,10],[36,20],[24,30],[12,34-(f?3:0)],[8,30-(f?4:0)],[18,20],[26,13]]),CO,{mod:(X,Y,t)=>((X+Y*3)%9===0)?t+1:t});
  // zampe lontane
  for(const [a,b,c,d,e,g,far] of legs)if(far){paint2(P,mkM(P).cap(a,b,c,d,3.4,2.4).cap(c,d,e,g,2.4,2),HBd,{thin:1});paint2(P,mkM(P).rect(e-2,g,5,3),HF,{thin:1})}
  // corpo
  paint2(P,mkM(P).ell(40,44,22,10),HB,{mod:(X,Y,t)=>{if(Y<38&&t<4)t++;if((X*5+Y*3)%23===0)t--;return t}});
  for(let X=22;X<58;X+=5)P.set(X,46+((X/5)%2),HB[1]);
  // gualdrappa
  paint2(P,mkM(P).poly([[30,34],[48,34],[50,46],[46,50],[42,47],[38,51],[34,47],[30,49]]),RD,{mod:(X,Y,t)=>Y===35?t+1:t});
  for(let X=30;X<50;X+=2)P.set(X,36,R6b('#d8a84a')[3]);
  // collo e testa
  paint2(P,mkM(P).cap(54,40,66,18,8,5),HB,{mod:(X,Y,t)=>Math.min(t,3)});
  paint2(P,mkM(P).rot(75,18,11,5.2,.55),HB);paint2(P,mkM(P).rot(81,23,4,3,.5),HB,{base:2});
  paint2(P,mkM(P).poly([[64,12],[66,4],[69,11]]),HB,{thin:1});paint2(P,mkM(P).poly([[67,12],[71,5],[72,13]]),HB,{thin:1});
  P.set(83,24,C('#ff3020'));P.set(84,25,C('#8a0e14'));for(let X=76;X<84;X++)P.set(X,26+Math.floor((X-76)/3),C('#0a0608'));P.set(79,27,C('#e8e0d0'));P.set(81,27,C('#e8e0d0'));
  P.set(72,14,C('#ff2a1a'));P.set(73,14,C('#ffb060'));P.set(72,15,C('#a01010'));P.set(71,13,HB[1]);P.set(73,13,HB[1]);
  // criniera selvaggia
  for(let i=0;i<11;i++){const x0=57+i*1.0,y0=34-i*2.2,len=4+(i%3)*1.6+(f?1:0);paint2(P,mkM(P).cap(x0,y0,x0-len,y0-len*.35-(i%2)+f,1.7,.5),i%4===2?RD:MN,{thin:1})}
  // zampe vicine
  for(const [a,b,c,d,e,g,far] of legs)if(!far){paint2(P,mkM(P).cap(a,b,c,d,3.6,2.6).cap(c,d,e,g,2.6,2),HB,{thin:1});paint2(P,mkM(P).rect(e-2,g,5,3),HF,{thin:1,mod:(X,Y,t)=>Y===g?t+1:t})}
  // cavaliere: gamba e stivale
  paint2(P,mkM(P).cap(40,32,46,44,3.2,2.6).cap(46,44,44,50,2.6,2.4),AR);paint2(P,mkM(P).rect(42,49,6,3),CO,{thin:1});
  // busto corazzato
  paint2(P,mkM(P).poly([[32,12],[46,11],[47,22],[44,33],[34,33],[32,22]]),AR,{mod:(X,Y,t)=>{if(Y===20||Y===27)t--;if(X===39&&Y>13)t--;return t}});
  paint2(P,mkM(P).ell(45,13,4,3.4),AR,{mod:(X,Y,t)=>Y===13?t-1:t});paint2(P,mkM(P).ell(33,13,3.4,3),AR,{base:2});
  for(let X=33;X<46;X++)P.set(X,32,R6b('#5a1a1a')[3]);P.set(39,32,R6b('#d8a84a')[4]);
  // braccio e spada
  paint2(P,mkM(P).cap(45,14,53,21,2.6,2.2),AR);paint2(P,mkM(P).ell(54,21,2.4,2.2),CO,{thin:1});
  for(let i=0;i<28;i++){const x=55+i,y=19-Math.round(i*.53);P.set(x,y,ST[4]);P.set(x,y+1,ST[2]);if(i>24)P.set(x,y,ST[5])}
  paint2(P,mkM(P).cap(52,16,56,23,1),R6b('#6a5a3a'),{thin:1,flat:1});
  // nessuna testa: colletto e moncone
  paint2(P,mkM(P).ell(39,10,5,2.6),CO,{thin:1});paint2(P,mkM(P).ell(39,9,3.4,1.6),RD,{thin:1,nc:1});P.set(38,9,RD2[5]);P.set(39,9,RD2[4]);P.set(40,8,C('#3a0408'));
  for(let i=0;i<3;i++)P.set(36+i*2,11+i%2,RD2[3])});
 return [frame(0),frame(1)]})();
{const _pp=genPropsHD;genPropsHD=function(){const r=_pp.apply(this,arguments);IMG.horse=HORSEMAN;return r}}
// bagliori sopra al buio: occhio rosso del cavallo, braci dal collo mozzato, alito
{const _amb2=drawAmbTop;drawAmbTop=function(m){_amb2(m);try{const h=G.horse;if(!h||!h.on||m.id!=='main')return;const fl=h.dir===1?-1:1,T=G.t,bx=h.x,by=h.y;
  const ex=bx+fl*14,ey=by-31,g=ctx.createRadialGradient(ex,ey,0,ex,ey,6);g.addColorStop(0,'rgba(255,60,30,.9)');g.addColorStop(1,'rgba(255,0,0,0)');ctx.fillStyle=g;ctx.fillRect(ex-6,ey-6,12,12);
  const nx=bx+fl*-2.5,ny=by-34;for(let i=0;i<9;i++){const k=((T*1.6+i/9)%1),x=nx+Math.sin(T*3+i*2.3)*2*k-fl*k*9,y=ny-k*14,a=(1-k);ctx.fillStyle=`rgba(${255},${(90+80*(1-k))|0},${30},${(a*.85).toFixed(2)})`;ctx.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,k<.3?1:.5,k<.3?1:.5)}
  const ng=ctx.createRadialGradient(nx,ny,0,nx,ny,9);ng.addColorStop(0,'rgba(220,30,20,.45)');ng.addColorStop(1,'rgba(120,0,0,0)');ctx.fillStyle=ng;ctx.fillRect(nx-9,ny-9,18,18);
  if(Math.floor(T*2)%3===0){const k=(T*2)%1,sx=bx+fl*(20+k*6),sy=by-26+k*2;ctx.fillStyle=`rgba(200,200,210,${(.3*(1-k)).toFixed(2)})`;ctx.beginPath();ctx.arc(sx,sy,1+k*3,0,7);ctx.fill()}
 }catch(e){}}}
// suono tutto suo: drone, coro dissonante, nitrito demoniaco distorto, zoccoli, lama
{const curve=(()=>{const n=1024,c=new Float32Array(n);for(let i=0;i<n;i++){const x=i/n*2-1;c[i]=Math.tanh(x*6)}return c})();
 const neigh=(a,t,pitch=1,vol=.22)=>{const c=a.c,o=c.createOscillator(),o2=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),ws=c.createWaveShaper(),bp=c.createBiquadFilter(),bp2=c.createBiquadFilter(),g=c.createGain();
  o.type='sawtooth';o2.type='square';lfo.frequency.value=17;lg.gain.value=55*pitch;lfo.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
  const fp=(o_,k)=>{o_.frequency.setValueAtTime(260*pitch*k,t);o_.frequency.exponentialRampToValueAtTime(980*pitch*k,t+.22);o_.frequency.exponentialRampToValueAtTime(620*pitch*k,t+.6);o_.frequency.exponentialRampToValueAtTime(170*pitch*k,t+1.5)};fp(o,1);fp(o2,.5);
  ws.curve=curve;bp.type='bandpass';bp.frequency.value=1300;bp.Q.value=2.5;bp2.type='bandpass';bp2.frequency.value=480;bp2.Q.value=3;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.06);g.gain.setValueAtTime(vol,t+.9);g.gain.exponentialRampToValueAtTime(.0001,t+1.6);
  o.connect(ws);o2.connect(ws);ws.connect(bp);ws.connect(bp2);bp.connect(g);bp2.connect(g);g.connect(a.sfx);g.connect(a.rev);
  for(const n of [o,o2,lfo]){n.start(t);n.stop(t+1.7)}};
 SFX.cavaliere=(a,t)=>{
  a.osc('sine',41,t,3.6,.5,a.sfx,.6);a.osc('sine',43.6,t,3.6,.4,a.sfx,.6);
  [110,116.5,155.6,164.8,233].forEach((f,i)=>{const g=a.osc('sawtooth',f,t+.1+i*.05,3,.035,a.sfx,.9);g.connect(a.rev)});
  a.noise(t,1.2,.12,'bandpass',300,2,null,1,2400);
  neigh(a,t+.45,1,.2);neigh(a,t+.47,.5,.16);
  for(let i=0;i<9;i++){const d=1.9+Math.floor(i/3)*.38+(i%3)*.09;a.noise(t+d,.07,.6,'lowpass',190);a.osc('sine',48,t+d,.09,.55)}
  a.noise(t+.3,.5,.06,'bandpass',3200,8,null,.01,6800);
  for(let i=0;i<5;i++)a.noise(t+2.6+i*.16,.2,.05,'bandpass',900+Math.random()*1800,5)};
 SFX.nitrito=(a,t)=>{neigh(a,t,.9+Math.random()*.2,.16);neigh(a,t+.02,.47,.12);a.osc('sine',46,t,1.4,.3,a.sfx,.2)};
 const _sp=spawnHorse;spawnHorse=function(){const r=_sp.apply(this,arguments);try{AU.play('cavaliere')}catch(e){}return r};
 let nt=6;const _uh=updateHorse;updateHorse=function(dt){const r=_uh.apply(this,arguments);try{if(G.horse&&G.horse.on){nt-=dt;if(nt<=0){nt=6+Math.random()*5;AU.play('nitrito')}}}catch(e){}return r}}

// =====================================================================
// MONDO VIVO: foglie dagli alberi, neve che si posa, pupazzi e palle di neve,
// abitanti che reagiscono a stagione, ora e tempo. Tutto in memoria (non tocca i salvataggi).
// =====================================================================
const VIVO={tl:[],gl:[],balls:[],snowmen:[],lv:null,emo:new Map(),fight:4,pick:0};
const isWinter=()=>{try{return isFree(G.st)&&seasonOf(G.st)===1}catch(e){return false}};
const isAutumn=()=>{try{return !isFree(G.st)||seasonOf(G.st)===0}catch(e){return true}};
const snowTarget=()=>G.st&&G.st.weather==='neve'?1:isWinter()?.6:0;
const SNOWTEX=(()=>{const [c,x]=mk(64,64);x.fillStyle='#eef3fa';x.fillRect(0,0,64,64);srand(77);for(let i=0;i<260;i++){x.fillStyle=['#dfe7f3','#ffffff','#cfdbec','#f6f9ff'][ri(0,3)];x.fillRect(ri(0,63),ri(0,63),ri(1,3),1)}for(let i=0;i<10;i++){x.fillStyle='rgba(170,190,220,.35)';x.fillRect(ri(0,60),ri(0,62),ri(3,7),1)}return c})();
let SNOWPAT=null;
const capCache=new WeakMap();
function snowCap(img,big){let c=capCache.get(img);if(c!==undefined)return c;
 try{const w=img.width,h=img.height,d=img.getContext('2d').getImageData(0,0,w,h).data,o=document.createElement('canvas');o.width=w;o.height=h;o.s=img.s;const x=o.getContext('2d');let any=false;
  for(let X=0;X<w;X++){for(let Y=0;Y<h;Y++){const a=d[(Y*w+X)*4+3],up=Y?d[((Y-1)*w+X)*4+3]:0;if(a>200&&up<40){const th=(big?16+((X*5)%4)+Math.round(Math.sin(X*.33)*3):3+((X*7)%3))+(Math.sin(X*.7)>.6?2:0);for(let k=0;k<th;k++){if(d[((Y+k)*w+X)*4+3]<200)break;x.fillStyle=k===0?'#ffffff':k<th-1?'#eef3fa':'#c8d4e6';x.fillRect(X,Y+k,1,1)}any=true;if(Y>h*.6)break}}}
  c=any?o:null}catch(e){c=null}capCache.set(img,c);return c}
const SNOWMAN=[0,1,2].map(st=>spr2(32,48,P=>{const S=R6b('#e8eef8');
 paint2(P,mkM(P).ell(16,40,10,7.5),S);if(st>=1)paint2(P,mkM(P).ell(16,28,7.5,6),S);
 if(st>=2){paint2(P,mkM(P).ell(16,18,5.5,5),S);paint2(P,mkM(P).rect(10,20,12,3),R6b('#c83030'),{thin:1});paint2(P,mkM(P).rect(18,22,3,6),R6b('#c83030'),{thin:1});
  P.set(14,17,C('#1a1418'));P.set(18,17,C('#1a1418'));paint2(P,mkM(P).poly([[16,18],[22,19],[16,20]]),R6b('#e8782a'),{thin:1,nc:1});
  for(const y of [27,31,35])P.set(16,y,C('#1a1418'));
  paint2(P,mkM(P).rect(11,9,10,6),R6b('#2a2630'),{thin:1});paint2(P,mkM(P).rect(9,14,14,2),R6b('#2a2630'),{thin:1});
  for(let i=0;i<8;i++){P.set(8-i,27-Math.round(i*.6),C('#6a4a2a'));P.set(24+i,27-Math.round(i*.7),C('#6a4a2a'))}P.set(2,22,C('#6a4a2a'));P.set(30,21,C('#6a4a2a'))}}));
// glifi delle emozioni
const EMO={
 snow:['..#..','#.#.#','.###.','#.#.#','..#..'],drop:['..#..','.###.','#####','#####','.###.'],note:['..##','..#.','..#.','###.','##..'],z:['####','..#.','.#..','####','....'],leaf:['..##','.###','###.','##..','#...'],sun:['#.#.#','.###.','##.##','.###.','#.#.#']};
const EMOC={snow:'#a8d0ff',drop:'#5aa8e8',note:'#3a2a1a',z:'#4a4a8a',leaf:'#d86a1e',sun:'#e8a020'};
function drawEmo(k,X,Y){const g=EMO[k];ctx.fillStyle='rgba(255,250,240,.92)';ctx.fillRect(X-4,Y-4,8,8);ctx.fillRect(X-3,Y-5,6,10);ctx.fillRect(X-5,Y-3,10,6);ctx.fillRect(X-1,Y+4,2,2);ctx.fillStyle=EMOC[k];
 for(let r=0;r<g.length;r++)for(let c=0;c<g[r].length;c++)if(g[r][c]==='#')ctx.fillRect(X-2.5+c,Y-2.5+r,1,1)}
function npcEmoKind(){const st=G.st,t=st.time,wx=st.weather,s=isFree(st)?seasonOf(st):0;
 if(t>=22*60||t<6*60)return 'z';if(wx==='neve'||s===1)return 'snow';if(wx==='pioggia')return 'drop';if(s===3&&t>=12*60&&t<17*60)return 'sun';if(s===2&&t<12*60)return 'note';if(s===0)return Math.random()<.5?'leaf':'note';return 'note'}

// ---- aggiornamento (solo stato visivo) ----
{const _up=updParts;updParts=function(dt){const r=_up.apply(this,arguments);try{if(G.mode==='game'&&!UI.modalOpen)vivoTick(dt)}catch(e){console.error(e)}return r}}
function vivoTick(dt){const m=G.map;if(!m||!G.st)return;const out=!m.interior&&m.id==='main';
 // livello di neve
 const tg=snowTarget();if(VIVO.lv==null)VIVO.lv=tg*.85;VIVO.lv+=clamp(tg-VIVO.lv,-dt*.008,dt*.02);
 // foglie che si staccano dalle chiome
 if(out&&isAutumn()&&G.night<.6&&G.horror<.6&&VIVO.tl.length<40&&Math.random()<dt*2.2){const trees=m.objs.filter(o=>o.img&&o.img.canopyH&&o.dx>G.cam.x-20&&o.dx<G.cam.x+W&&o.dy>G.cam.y-60&&o.dy<G.cam.y+H);
  if(trees.length){const o=trees[(Math.random()*trees.length)|0],w=iw(o.img),ch=o.img.canopyH;VIVO.tl.push({x:o.dx+w*.2+Math.random()*w*.6,y:o.dy+ch*.25+Math.random()*ch*.5,gy:o.sy+2+Math.random()*16,vx:-4-Math.random()*6,t:0,ph:Math.random()*6,c:leafCol()})}}
 for(const l of VIVO.tl){l.t+=dt;l.x+=(l.vx+Math.sin(l.t*2.2+l.ph)*12)*dt;l.y+=(9+Math.sin(l.t*3+l.ph)*4)*dt;if(l.y>=l.gy){l.done=1;VIVO.gl.push({x:l.x,y:l.gy,c:l.c,t:0,r:(Math.random()*3)|0})}}
 VIVO.tl=VIVO.tl.filter(l=>!l.done);for(const g of VIVO.gl)g.t+=dt;VIVO.gl=VIVO.gl.filter(g=>g.t<40);if(VIVO.gl.length>160)VIVO.gl.splice(0,VIVO.gl.length-160);
 // palle di neve
 for(const b of VIVO.balls){b.t+=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.z+=b.vz*dt;b.vz-=160*dt;
  const tgts=[];if(b.from!=='player'&&G.mode==='game')tgts.push(['player',G.player]);for(const n of G.npcs)if(!n.hidden&&n.map===m.id&&n.id!==b.from)tgts.push([n.id,n]);
  for(const [id,e] of tgts){if(Math.hypot(e.x-b.x,e.y-b.y)<7&&b.z<24){b.hit=id;b.done=1;snowSplash(b.x,b.y-b.z);
    if(id==='player'){G.shake=Math.max(G.shake,1.5);floatText('Preso!',e.x,e.y-30,'#e8f4ff',1)}
    else{VIVO.emo.set(id,{k:'snow',t:2.2});if(b.from==='player'&&Math.random()<.85)setTimeout(()=>{try{if(G.map===m)throwBall(e,G.player,id)}catch(_){}},500+Math.random()*500);
     if(Math.random()<.5)bubble(e,['Ehi!','Ah! Fredda!','Te la restituisco!','Ahah!','Così non vale!'][(Math.random()*5)|0],1.6)}break}}
  if(b.z<=0&&!b.done){b.done=1;snowSplash(b.x,b.y)}}
 VIVO.balls=VIVO.balls.filter(b=>!b.done&&b.t<3);
 // pupazzi che si sciolgono
 if(VIVO.lv<.15&&VIVO.snowmen.length){for(const s of VIVO.snowmen){try{mapRemove(s.m,s.o)}catch(e){}}VIVO.snowmen=[]}
 // abitanti: battaglie di neve fra loro, emozioni, fiato nel freddo
 if(out&&VIVO.lv>.3&&G.night<.5&&!G.cut){VIVO.fight-=dt;if(VIVO.fight<=0){VIVO.fight=4+Math.random()*6;const N=G.npcs.filter(n=>!n.hidden&&n.map==='main'&&!n.script&&Math.abs(n.x-G.cam.x-W/2)<W/2+20&&Math.abs(n.y-G.cam.y-H/2)<H/2+20);
   for(const a of N){const b=N.find(q=>q!==a&&Math.hypot(q.x-a.x,q.y-a.y)<90&&Math.hypot(q.x-a.x,q.y-a.y)>16);if(b){throwBall(a,b,a.id);break}}}}
 for(const [k,v] of VIVO.emo){v.t-=dt;if(v.t<=0)VIVO.emo.delete(k)}
 if(out&&!G.cut&&Math.random()<dt*.35){const N=G.npcs.filter(n=>!n.hidden&&n.map==='main'&&!VIVO.emo.has(n.id)&&Math.abs(n.x-G.cam.x-W/2)<W/2&&Math.abs(n.y-G.cam.y-H/2)<H/2);if(N.length){const n=N[(Math.random()*N.length)|0];VIVO.emo.set(n.id,{k:npcEmoKind(),t:2.4})}}
 const cold=out&&(isWinter()||G.st.weather==='neve'||(G.st.time<8*60&&isAutumn()));
 if(cold&&Math.random()<dt*2.5){const L=[G.player,...G.npcs.filter(n=>!n.hidden&&n.map==='main')].filter(e=>Math.abs(e.x-G.cam.x-W/2)<W/2&&Math.abs(e.y-G.cam.y-H/2)<H/2);if(L.length){const e=L[(Math.random()*L.length)|0],dx=e.dir===2?1:e.dir===1?-1:0,dy=e.dir===0?1:e.dir===3?-1:0;
  G.parts.push({k:'breath',x:e.x+dx*5,y:e.y-17+dy*2,vx:dx*6+(Math.random()-.5)*3,vy:-3,t:0,life:1.1})}}
}
function snowSplash(x,y){for(let i=0;i<7;i++)G.parts.push({k:'snowbit',x,y,vx:(Math.random()-.5)*40,vy:-15-Math.random()*25,t:0,life:.5});try{AU.play('step')}catch(e){}}
function throwBall(from,to,fid){const dx=to.x-from.x,dy=to.y-from.y,d=Math.hypot(dx,dy)||1,sp=120,T=d/sp;VIVO.balls.push({x:from.x,y:from.y-2,vx:dx/d*sp,vy:dy/d*sp,z:14,vz:Math.max(30,80*T-14/T),t:0,from:fid})}
function canSnowPlay(){return G.mode==='game'&&!G.cut&&!UI.busy()&&G.map&&G.map.id==='main'&&!G.map.interior&&VIVO.lv>.25&&!G.visit}
function playerThrow(){if(!canSnowPlay())return;const p=G.player,[dx,dy]=DIRV[p.dir];const tg={x:p.x+dx*90,y:p.y+dy*90};
 const N=G.npcs.filter(n=>!n.hidden&&n.map==='main'&&Math.hypot(n.x-p.x,n.y-p.y)<110).sort((a,b)=>Math.hypot(a.x-tg.x,a.y-tg.y)-Math.hypot(b.x-tg.x,b.y-tg.y))[0];
 const aim=N&&Math.hypot(N.x-tg.x,N.y-tg.y)<60?N:tg;throwBall(p,aim,'player');AU.play('rustle')}
function playerSnowman(){if(!canSnowPlay())return;const m=G.map,[tx,ty]=frontTile(),k=tx+','+ty;
 const ex=VIVO.snowmen.find(s=>s.tx===tx&&s.ty===ty);
 if(ex){if(ex.st<2){ex.st++;mapRemove(m,ex.o);ex.o=m.add(OB('snowman',tx,ty,SNOWMAN[ex.st],{solid:[[tx,ty]],hits:[]}));AU.play(ex.st===2?'ok':'rustle');if(ex.st===2){burst('spark',tx*16+8,ty*16-10,8,'#ffffff');UI.toast('Un pupazzo di neve! Gli manca solo il nome.')}}return}
 if(m.solid(tx,ty)||m.hit[k]||VIVO.snowmen.length>=6){UI.toast('Qui non c\'è posto per un pupazzo.');return}
 const o=m.add(OB('snowman',tx,ty,SNOWMAN[0],{solid:[[tx,ty]],hits:[]}));VIVO.snowmen.push({m,o,tx,ty,st:0});AU.play('rustle');UI.toast('Rotoli una palla di neve. Premi ancora per finire il pupazzo.')}
addEventListener('keydown',e=>{if(e.repeat||(e.target&&e.target.tagName==='INPUT'))return;if(e.code==='KeyQ')playerThrow();if(e.code==='KeyG')playerSnowman()});
// pulsante ❄ sul telefono: tocco = palla di neve, tieni premuto = pupazzo
{const b=document.createElement('button');b.id='bSnow';b.textContent='❄';b.title='Tocca: palla di neve · Tieni premuto: pupazzo (Q / G)';
 Object.assign(b.style,{position:'absolute',right:'calc(70*var(--u))',bottom:'calc(70*var(--u))',width:'calc(28*var(--u))',height:'calc(28*var(--u))',borderRadius:'50%',border:'0',background:'radial-gradient(circle at 35% 30%,#ffffff,#b8d4f0 50%,#5a7aa8 90%)',color:'#2a4a7a',fontSize:'calc(14*var(--u))',display:'none',pointerEvents:'auto'});
 let ht=null,long=false;b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();long=false;ht=setTimeout(()=>{long=true;playerSnowman()},450)});
 b.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();clearTimeout(ht);if(!long)playerThrow()});
 addEventListener('load',()=>{const t=document.getElementById('touch');if(t)t.appendChild(b)});if(document.getElementById('touch'))document.getElementById('touch').appendChild(b);
 setInterval(()=>{const on=IN.touch&&canSnowPlay();b.style.display=on?'block':'none'},500)}

// ---- disegno: a terra (prima degli oggetti) ----
{const _pr=drawPrints;drawPrints=function(m,dt){try{if(!m.interior&&m.id==='main'){const cx=G.cam.x,cy=G.cam.y;
   // tappeto di foglie sotto gli alberi d'autunno
   if(isAutumn()){for(const o of m.objs){if(!o.img||!o.img.canopyH||o.dx>cx+W+20||o.dx+40<cx-20||o.sy<cy-10||o.sy>cy+H+30)continue;const bx=o.dx+iw(o.img)/2,by=o.sy;
     for(let i=0;i<14;i++){const h=hsh(o.tx*31+i,o.ty*17+i),x=bx+((h%40)-20),y=by-3+((h>>6)%12);ctx.fillStyle=['#c8642a','#e09a3a','#a8401e','#d8b048'][(h>>3)%4];ctx.fillRect(x,y,(h>>9)%2?1.5:1,1)}}}
   for(const g of VIVO.gl){const a=Math.min(1,(40-g.t)/6);ctx.globalAlpha=a;ctx.fillStyle=g.c;ctx.fillRect(g.x,g.y,g.r===0?2:1.5,g.r===2?1.5:1);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(g.x+.5,g.y+1,1,.5);ctx.globalAlpha=1}
   // manto di neve
   if(VIVO.lv>.02){if(!SNOWPAT)SNOWPAT=ctx.createPattern(SNOWTEX,'repeat');ctx.save();ctx.globalAlpha=clamp(VIVO.lv*.9,0,.88);ctx.fillStyle=SNOWPAT;ctx.fillRect(cx,cy,W,H);ctx.restore()}
  }}catch(e){ctx.globalAlpha=1}return _pr.apply(this,arguments)}}
// ---- disegno: sopra gli oggetti ----
{const _we=drawWorldExtras;drawWorldExtras=function(m){_we(m);try{if(m.interior||m.id!=='main')return;const cx=G.cam.x,cy=G.cam.y;
  // neve sui tetti e sulle costruzioni
  if(VIVO.lv>.2){ctx.globalAlpha=clamp((VIVO.lv-.2)*1.6,0,1);for(const o of m.objs){if(!o.img||(o.kind!=='bld'&&o.kind!=='built'&&o.kind!=='museo'&&o.kind!=='fence'&&o.kind!=='post'))continue;if(o.dx>cx+W||o.dx+iw(o.img)<cx||o.dy>cy+H||o.dy+ih(o.img)<cy)continue;const c=snowCap(o.img,o.kind!=='fence'&&o.kind!=='post');if(c)ctx.drawImage(c,Math.round(o.dx),Math.round(o.dy),iw(o.img),ih(o.img))}ctx.globalAlpha=1}
  // foglie in caduta
  for(const l of VIVO.tl){const r=Math.sin(l.t*3+l.ph);ctx.fillStyle=l.c;if(r>.3)ctx.fillRect(l.x,l.y,2,1.5);else if(r>-.3)ctx.fillRect(l.x,l.y,1.5,1.5);else ctx.fillRect(l.x+.5,l.y,1,2)}
  // palle di neve in volo
  for(const b of VIVO.balls){ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(b.x-1.5,b.y,3,1);ctx.fillStyle='#c8d4e6';ctx.fillRect(b.x-1.5,b.y-b.z-1.5,3,3);ctx.fillStyle='#ffffff';ctx.fillRect(b.x-1.5,b.y-b.z-1.5,2,2)}
  // abitanti: emozioni e lanterne di notte
  for(const n of G.npcs){if(n.hidden||n.map!=='main')continue;if(n.x<cx-20||n.x>cx+W+20||n.y<cy-10||n.y>cy+H+40)continue;
   const e=VIVO.emo.get(n.id);if(e&&!G.bubbles.some(b=>b.n===n)){const bob=Math.sin(G.t*6)*.8;drawEmo(e.k,Math.round(n.x+6),Math.round(n.y-36+bob))}
   if(G.night>.55&&G.horror<.7){const s=n.dir===1?-1:1,X=Math.round(n.x+s*7),Y=Math.round(n.y-12+Math.sin(G.t*5+n.x)*.5);ctx.fillStyle='#2a2630';ctx.fillRect(X-1,Y-2,3,5);ctx.fillRect(X,Y-4,1,2);ctx.fillStyle='#ffd070';ctx.fillRect(X,Y-1,1,3)}}
 }catch(e){ctx.globalAlpha=1}}}
// ---- bagliore delle lanterne sopra il buio ----
{const _amb3=drawAmbTop;drawAmbTop=function(m){_amb3(m);try{if(m.id!=='main'||G.night<=.55||G.horror>=.7)return;ctx.globalCompositeOperation='lighter';
  for(const n of G.npcs){if(n.hidden||n.map!=='main')continue;const s=n.dir===1?-1:1,X=n.x+s*7,Y=n.y-12;if(X<G.cam.x-30||X>G.cam.x+W+30||Y<G.cam.y-30||Y>G.cam.y+H+30)continue;const r=22+Math.sin(G.t*9+n.x)*1.2,g=ctx.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,'rgba(255,190,90,.45)');g.addColorStop(.4,'rgba(255,150,60,.15)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(X-r,Y-r,r*2,r*2)}
  ctx.globalCompositeOperation='source-over'}catch(e){ctx.globalCompositeOperation='source-over'}}}
// ---- particelle nuove: fiato e schegge di neve ----
{const _dp2=drawParts;drawParts=function(){const rest=[];for(const p of G.parts){if(p.k==='breath'){const k=p.t/p.life,r=1+k*3;ctx.fillStyle=`rgba(235,240,250,${(.5*(1-k)).toFixed(2)})`;ctx.beginPath();ctx.arc(p.x,p.y,r,0,7);ctx.fill()}else if(p.k==='snowbit'){ctx.fillStyle='#f4f8ff';ctx.fillRect(p.x,p.y,1,1)}else rest.push(p)}
  const all=G.parts;G.parts=rest;try{_dp2()}finally{G.parts=all}}}

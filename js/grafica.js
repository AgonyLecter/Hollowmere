'use strict';
// ================= GRAFICA: ritocco del comparto visivo =================
// Solo aspetto: personaggi ridisegnati in pixel art "a mano", edifici ridipinti, luce.
// Non cambia logica, dimensioni delle immagini, collisioni o salvataggi: sostituisce
// le immagini dopo che i generatori originali le hanno create.

// =====================================================================
// PERSONAGGI — fotogramma 36×54 (come prima), disegnato per parti:
// ogni parte è una maschera colorata a toni pieni (luce in alto a sinistra),
// con un filo d'ombra dove copre la parte che sta dietro.
// =====================================================================
const GX=(()=>{
 const W=36,H=54;
 class MK{constructor(){this.a=new Uint8Array(W*H)}
  has(X,Y){return X>=0&&Y>=0&&X<W&&Y<H&&this.a[Y*W+X]===1}
  add(X,Y){X=Math.floor(X);Y=Math.floor(Y);if(X>=0&&Y>=0&&X<W&&Y<H)this.a[Y*W+X]=1;return this}
  del(X,Y){if(X>=0&&Y>=0&&X<W&&Y<H)this.a[Y*W+X]=0;return this}
  fn(f,x0=0,y0=0,x1=W-1,y1=H-1){for(let Y=Math.max(0,Math.floor(y0));Y<=Math.min(H-1,Math.ceil(y1));Y++)for(let X=Math.max(0,Math.floor(x0));X<=Math.min(W-1,Math.ceil(x1));X++)if(f(X+.5,Y+.5,X,Y))this.a[Y*W+X]=1;return this}
  rect(x,y,w,h){return this.fn(()=>true,x,y,x+w-1,y+h-1)}
  ell(cx,cy,rx,ry,clip){return this.fn((x,y,X,Y)=>{const a=(x-cx)/rx,b=(y-cy)/ry;return a*a+b*b<=1&&(!clip||clip(X,Y))},cx-rx-1,cy-ry-1,cx+rx+1,cy+ry+1)}
  cap(ax,ay,bx,by,r,r2=r,clip){const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy||1,m=Math.max(r,r2)+1;
   return this.fn((x,y,X,Y)=>{const t=clamp(((x-ax)*dx+(y-ay)*dy)/L2,0,1),rr=r+(r2-r)*t;return Math.hypot(x-ax-dx*t,y-ay-dy*t)<=rr&&(!clip||clip(X,Y))},Math.min(ax,bx)-m,Math.min(ay,by)-m,Math.max(ax,bx)+m,Math.max(ay,by)+m)}
  // fascia verticale: metà larghezza hw(Y) intorno a cx(Y)
  band(y0,y1,cxF,hwF,clip){return this.fn((x,y,X,Y)=>{const hw=hwF(Y);return hw>0&&Math.abs(x-cxF(Y))<=hw&&(!clip||clip(X,Y))},0,y0,W-1,y1)}
  each(f){for(let i=0;i<W*H;i++)if(this.a[i])f(i%W,(i/W)|0)}
 }
 const dk=(R,k)=>R.map(c=>c.map(v=>v*k));
 // pittura a toni pieni: 3 = tono base, 4 = luce (bordo in alto/a sinistra), 2 = ombra (destra/basso), 1 = ombra profonda
 function paint(P,M,R,o={}){const b=o.base??3,sw=o.sw??2;
  M.each((X,Y)=>{let t=b;
   const r1=!M.has(X+1,Y),r2=sw>1&&!M.has(X+2,Y),bt=!M.has(X,Y+1),l=!M.has(X-1,Y),tp=!M.has(X,Y-1);
   if(!o.flat){if(r1||bt)t=b-1;else if(r2)t=b-(o.soft?0:1);else if((l&&!o.noL)||(tp&&!o.noT))t=b+1}
   if(o.mod)t=o.mod(X,Y,t);if(t==null)return;
   P.set(X,Y,R[clamp(t,0,R.length-1)])});
  // filo d'ombra sulle parti dietro
  if(o.nc)return;const seen=new Set(),d=P.d,k=o.ck??.68;
  M.each((X,Y)=>{for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=X+dx,yy=Y+dy;if(xx<0||yy<0||xx>=W||yy>=H||M.has(xx,yy))continue;const i=(yy*W+xx)*4;if(!d[i+3]||seen.has(i))continue;seen.add(i);d[i]*=k;d[i+1]*=k;d[i+2]*=k}})}
 const RC=new WeakMap();
 function ramps(L){let R=RC.get(L);if(R)return R;const r=(c,k)=>c?ramp6(c,k):null;
  R={sk:r(L.skin,'skin'),hr:r(L.hair,'hair'),sh:r(L.shirt),pa:r(L.pants||'#4a3a2a'),shoe:r(L.shoe||'#2b1d14'),robe:r(L.robe),dress:r(L.dress),cape:r(L.cape),apron:r(L.apron),
   beard:r(L.beard,'hair'),hat:r(L.hatCol||'#4a3a2a'),band:r(L.hatBand||'#8a6a3a'),belt:r(L.belt||'#3a2414'),gold:r('#d8a84a'),vest:r(L.vest)};RC.set(L,R);return R}
 const FR=[0,1,2,1,0,1,2,2,1,0,1,1],fr=X=>FR[((X|0)%12+12)%12];

 function frame(L,dir,ph,br,blink){
  const P=new PX(W,H),R=ramps(L);
  const walk=ph!=null,s=walk?Math.sin(ph):0,c=walk?Math.cos(ph):0,k=L.kid?3:0,wide=L.wide?1:0;
  const bob=walk?-Math.round(Math.abs(s)*1.2):-(br||0);
  const side=dir===2,back=dir===3,front=dir===0,cx=18;
  const cy=14+k+bob,tTop=22+k+bob,legTop=36+k,hw=7+wide;
  const sway=walk?Math.sin(ph-1)*1.2:(br?.5:0);
  const top=L.robe?R.robe:R.sh;
  const hasHat=L.hat==='tall'||L.hat==='bonnet'||L.hat==='cap';
  const hairMod=(X,Y,t)=>{const h=(X*7+3)%5;if(h===0&&Y>cy-ry+3)t--;else if(h===2&&((Y+X)%3===0))t--;return t};
  // ---- gambe e scarpe
  const legs=()=>{if(L.robe){shoesOnly();return}
   if(side){for(const q of [-1,1]){const fx=cx+(q>0?s:-s)*4,lift=Math.max(0,q>0?c:-c)*2,RR=q>0?R.pa:dk(R.pa,.8),RS=q>0?R.shoe:dk(R.shoe,.8);
     paint(P,new MK().cap(cx+q*.4,legTop+1,fx,47-lift,2.6,2.3),RR);paint(P,new MK().ell(fx+1.3,49.6-lift,3.6,2,(X,Y)=>Y<=51-lift),RS)}}
   else for(const q of [-1,1]){const lx=q<0?15.5:20.5,lift=walk?Math.max(0,q*s)*2.4:0;
    paint(P,new MK().rect(lx-2.5,legTop,5,13-Math.round(lift)),R.pa,{mod:(X,Y,t)=>Y===legTop?t-1:t});
    paint(P,new MK().rect(lx-3+(q>0?1:0),48-Math.round(lift),6,3),R.shoe,{mod:(X,Y,t)=>Y===48-Math.round(lift)&&t<4?4:t})}};
  const shoesOnly=()=>{if(side){for(const q of [-1,1]){const fx=cx+(q>0?s:-s)*3;paint(P,new MK().ell(fx+1.3,50,3.4,1.8),q>0?R.shoe:dk(R.shoe,.8))}}
   else for(const q of [-1,1]){const lx=q<0?15:21,lift=walk?Math.max(0,q*s)*1.5:0;paint(P,new MK().rect(lx-3,48-Math.round(lift),6,3),R.shoe)}};
  // ---- busto
  const tw=Y=>{const d=Y-tTop;let w=side?hw-2:hw;if(d<2)w-=(2-d)*.9;else w-=(d-2)*.07;return w};
  const torso=()=>{if(L.robe)return;
   const M=new MK().band(tTop,legTop,()=>cx,tw);
   const collar=front&&!L.dress;
   paint(P,M,R.sh,{mod:(X,Y,t)=>{const d=Y-tTop;if(collar&&d>=0&&d<4&&Math.abs(X+.5-cx)<3.2-d*.8)return null;
     if(!side&&d>3&&Math.abs(X+.5-cx)>tw(Y)-3.2&&Math.abs(X+.5-cx)<tw(Y)-2&&d<10)t--; // pieghe sotto le braccia
     return t}});
   if(collar){for(let d=0;d<4;d++)for(let X=Math.ceil(cx-3.2+d*.8);X<cx+3.2-d*.8;X++)P.set(X,tTop+d,R.sk[d<1?2:3]);
    // colletto
    for(const q of [-1,1]){P.set(cx+q*3.2-(q>0?1:0),tTop,R.sh[4]);P.set(cx+q*2.4-(q>0?1:0),tTop+1,R.sh[4]);P.set(cx+q*1.6-(q>0?1:0),tTop+2,R.sh[2])}}
   if(front&&!L.vest&&!L.apron&&!L.dress)for(const d of [5,8,11])if(tTop+d<legTop-1)P.set(cx-1,tTop+d,R.sh[1]);
   // cintura
   if(!L.dress){const by=legTop-1,BM=new MK().band(by,by+1,()=>cx,Y=>tw(Y)+.2);paint(P,BM,R.belt,{nc:1,noT:1});
    if(front){P.set(cx-1,by,R.gold[4]);P.set(cx,by,R.gold[3]);P.set(cx-1,by+1,R.gold[2]);P.set(cx,by+1,R.gold[2])}
    if(side){P.set(cx+3,by,R.gold[3]);P.set(cx+3,by+1,R.gold[2])}}
   if(L.vest&&!back){const VM=new MK().band(tTop+1,legTop-1,()=>cx,Y=>tw(Y)+.3,(X,Y)=>side?X<cx+2:Math.abs(X+.5-cx)>1.6+(Y-tTop)*.12);paint(P,VM,R.vest,{ck:.8});
    if(front)for(const d of [6,9])P.set(cx+2,tTop+d,R.gold[3])}};
  // ---- tonaca
  const robe=()=>{if(!L.robe)return;const bot=49,ww=Y=>{const d=Y-tTop;let w=(side?hw-1.5:hw)+d*.13;if(d<2)w-=(2-d)*.9;return w};
   const M=new MK().band(tTop,bot+1,Y=>cx+(walk?sway*(Y-tTop)/26:0)*(side?1:.4),ww,(X,Y)=>Y<=bot+((X+Math.floor((ph||0)*2))%3===0?1:0));
   paint(P,M,R.robe,{mod:(X,Y,t)=>{const d=Y-tTop;if(d>9){const f=((X-cx+40+Math.round((ph||0)*.8))%5);if(f===0)t--}
     if(front&&L.robeOpen&&Math.abs(X+.5-cx)<1.3&&Y<legTop+3)return 2;return t}});
   if(front&&L.robeOpen)for(let Y=tTop;Y<legTop+3;Y++){P.set(cx-1,Y,R.sh[2]);P.set(cx,Y,R.sh[3])}
   if(L.rope){const ry=legTop-1;M.each((X,Y)=>{if(Y===ry)P.set(X,Y,R.gold[(X%2)?3:2])});if(front)paint(P,new MK().rect(cx+2,ry,1,6).add(cx+2,ry+6).add(cx+3,ry+6),R.gold,{flat:1,nc:1})}};
  // ---- gonna
  const dress=()=>{if(!L.dress)return;const t0=legTop-2,bot=45;
   // corpetto
   paint(P,new MK().band(tTop+3,t0+1,()=>cx,tw,(X,Y)=>!(front&&Y<tTop+6&&Math.abs(X+.5-cx)<2.6)),R.dress,{ck:.8});
   const M=new MK().band(t0,bot+1,Y=>cx+sway*(Y-t0)/12*(side?1:.5),Y=>(side?hw-1:hw)+(Y-t0)*.36,(X,Y)=>Y<=bot+(((X+Math.floor((ph||0)*2))%4)===0?1:0));
   paint(P,M,R.dress,{mod:(X,Y,t)=>{if(Y===t0)return 2;if(Y>t0+2){const f=((X-cx+40+Math.round(walk?ph:0))%5);if(f===0)t--;else if(f===1&&t===3)t=4}return t}});
   // orlo chiaro
   M.each((X,Y)=>{if(!M.has(X,Y+1)&&Y>t0+3)P.set(X,Y-1,R.dress[4])})};
  const apron=()=>{if(!L.apron||back)return;
   const M=side?new MK().rect(cx+2,tTop+3,3,legTop+7-tTop-3):new MK().band(tTop+3,legTop+7,()=>cx,()=>hw-1.6);
   paint(P,M,R.apron,{mod:(X,Y,t)=>Y===tTop+3?4:t});
   if(front){for(const q of [-1,1])paint(P,new MK().rect(cx+q*3.5-(q>0?1:0),tTop,1,3),R.apron,{flat:1,nc:1});P.set(cx-1,tTop+8,R.apron[1]);P.set(cx,tTop+8,R.apron[1])}};
  // ---- mantella
  const cape=(behind)=>{if(!L.cape)return;const len=L.capeLen||13;
   if(behind){if(back||side)return;paint(P,new MK().band(tTop,tTop+len,()=>cx,Y=>hw+1.5+(Y-tTop)*.15,(X,Y)=>Y<=tTop+len-((X%3)?0:1)),dk(R.cape,.85),{nc:1});return}
   if(back){paint(P,new MK().band(tTop-1,tTop+len,Y=>cx+sway*(Y-tTop)/len*.6,Y=>hw+1.5+(Y-tTop)*.13,(X,Y)=>Y<=tTop+len-(((X+Math.floor((ph||0)*2))%3===0)?1:0)),R.cape,{mod:(X,Y,t)=>((X+40)%4===0&&Y>tTop+3)?t-1:t});return}
   if(side){paint(P,new MK().band(tTop-1,tTop+len,Y=>cx-2.6+sway*(Y-tTop)/len,Y=>4.4+(Y-tTop)*.1,(X,Y)=>Y<=tTop+len-(X%3===0?1:0)),R.cape);return}
   for(const q of [-1,1])paint(P,new MK().band(tTop-1,tTop+len-2,()=>cx+q*(hw-.5)+sway*.3,()=>2.6,(X,Y)=>Y<=tTop+len-2-((X%3)?0:1)),R.cape)};
  const mantle=()=>{if(!L.cape||!front)return;paint(P,new MK().ell(cx,tTop+.5,hw+.5,2.6,(X,Y)=>Y>=tTop-1&&Math.abs(X+.5-cx)>2.4),R.cape,{ck:.8})};
  // ---- braccia
  const arm=(q,far)=>{const RA=far?dk(top,.78):top,RS=far?dk(R.sk,.82):R.sk;let sx,sy,hx,hy;
   if(side){const sw=(far?1:-1)*s*3.4;sx=cx+(far?-1:0);sy=tTop+2.4;hx=cx+sw+(far?-1:.4);hy=tTop+11}
   else{sx=cx+q*(hw-.8);sy=tTop+2.4;const sw=walk?-q*s*1.3:0;hx=cx+q*(hw+.4);hy=tTop+11+sw}
   const mx=(sx+hx)/2,my=(sy+hy)/2;
   if(L.rolled){paint(P,new MK().cap(sx,sy,mx,my,2.4,2.1),RA,{sw:1});paint(P,new MK().cap(mx,my,hx,hy,1.9,1.8),RS,{sw:1})}
   else{paint(P,new MK().cap(sx,sy,hx,hy,2.4,2.1),RA,{sw:1,mod:(X,Y,t)=>Y>=Math.round(hy)?t-1:t})}
   paint(P,new MK().ell(hx,hy+1.6,1.9,1.8),RS,{sw:1})};
  const neck=()=>paint(P,new MK().rect(cx-2+(side?-1:0),cy+6,4,tTop-cy-5),R.sk,{base:2,nc:1});
  // ---- testa
  const rx=side?7.8:8.2,ry=8.1,hcx=side?cx+.4:cx;
  const head=()=>{const M=new MK().ell(hcx,cy,rx,ry);
   paint(P,M,R.sk,{sw:2,mod:(X,Y,t)=>{if(Y>cy+5&&Math.abs(X+.5-hcx)>rx-3)t=Math.min(t,2);if(t===4&&(Y>cy+2||X>hcx))t=3;return t}});
   if(side)P.set(Math.floor(hcx+rx),cy+3,R.sk[3])}; // naso
  const ears=()=>{if(L.hideEars||hasHat&&L.hat==='bonnet')return;
   if(side)paint(P,new MK().ell(cx-1.2,cy+2,1.4,2),R.sk,{base:3,nc:1,mod:(X,Y,t)=>X===Math.floor(cx-1.2)&&Y===cy+2?1:t});
   else if(!back){for(const q of [-1,1])paint(P,new MK().ell(cx+q*(rx+.2),cy+2,1.3,1.9),R.sk,{base:q<0?3:2,nc:1})}
   else for(const q of [-1,1])paint(P,new MK().ell(cx+q*(rx+.1),cy+2,1.2,1.8),R.sk,{base:2,nc:1})};
  const face=()=>{if(L.faceless||back)return;
   const ey=cy+1,eye=C(L.eye||'#3a5a7a'),eyeD=C(mix(L.eye||'#3a5a7a','#120a0a',.55)),lash=C('#1e100c'),hl=C('#ffffff'),brw=C(shade(L.hair,-.45)),lip=C(L.lip||'#a8504a'),lipL=C(shade(L.lip||'#a8504a',.25)),bl=C('#ff8080');
   const E=(ex,mir)=>{if(blink){P.set(ex,ey+2,lash);P.set(ex+1,ey+2,lash);return}
    P.set(ex,ey,lash);P.set(ex+1,ey,lash);P.set(ex,ey+1,mir?eyeD:hl);P.set(ex+1,ey+1,mir?hl:eyeD);P.set(ex,ey+2,mir?eyeD:eye);P.set(ex+1,ey+2,mir?eye:eyeD)};
   if(front){E(cx-5,0);E(cx+3,0);for(const ex of [cx-5,cx+3]){P.set(ex,ey-2,brw);P.set(ex+1,ey-2,brw)}P.set(cx-6,ey-1,brw);P.set(cx+5,ey-1,brw);
    P.set(cx,cy+4,R.sk[2]);
    if(L.smile===false){P.set(cx-1,cy+6,lip);P.set(cx,cy+6,lip)}else{P.set(cx-1,cy+6,lip);P.set(cx,cy+6,lip);P.set(cx-2,cy+5,lipL);P.set(cx+1,cy+5,lipL)}
    P.set(cx-6,cy+4,bl,120);P.set(cx-5,cy+4,bl,70);P.set(cx+4,cy+4,bl,70);P.set(cx+5,cy+4,bl,120)}
   else{E(cx+3,0);P.set(cx+3,ey-2,brw);P.set(cx+4,ey-2,brw);P.set(cx+5,ey-2,brw);P.set(cx+5,cy+6,lip);P.set(cx+4,cy+6,lip);P.set(cx+3,cy+4,bl,120);P.set(cx+2,cy+4,bl,70)}};
  const beard=()=>{if(!L.beard||back)return;const bx=side?cx+3:cx;
   paint(P,new MK().ell(bx,cy+6.5,side?4.6:6.4,4.6,(X,Y)=>Y>cy+3.6&&!(front&&Y===cy+6&&Math.abs(X+.5-cx)<1.5)),R.beard,{mod:hairMod,ck:.8});
   if(front){P.set(cx-1,cy+6,C(L.lip||'#a8504a'));P.set(cx,cy+6,C(L.lip||'#a8504a'))}
   // baffi
   if(front)for(let X=cx-3;X<cx+3;X++)P.set(X,cy+5,R.beard[X<cx?3:2])};
  // ---- capelli
  const hairHL=(X,Y,t)=>{t=hairMod(X,Y,t);const d=Y-(cy-ry+2),dx=X+.5-(cx-2);if(d===0&&Math.abs(dx)<3.5&&t>=3)t=5;else if(d===1&&Math.abs(dx)<5&&t>=3)t=4;else if(d===1&&Math.abs(dx)<2)t=5;return t};
  const hairBack=()=>{if(L.style!=='long'||side)return;const t0=cy-1,b0=cy+(back?19:17);
   paint(P,new MK().band(t0,b0,Y=>cx+sway*(Y-t0)/(b0-t0),Y=>rx+1.3-(Y-t0)*.05,(X,Y)=>Y<=b0-1-fr(X*3)%2),back?R.hr:dk(R.hr,.82),{mod:hairMod,nc:!back})};
  const hair=()=>{const st=L.style,HR=R.hr;
   if(st==='bald'){if(back)paint(P,new MK().ell(cx,cy+1,rx+.4,ry,(X,Y)=>Y>cy&&Y<cy+4),HR,{mod:hairMod});
    else if(side)paint(P,new MK().ell(cx,cy,rx+.4,ry,(X,Y)=>Y>cy-1&&Y<cy+3&&X<cx-3),HR,{mod:hairMod});
    else paint(P,new MK().ell(cx,cy,rx+.5,ry,(X,Y)=>Y>cy-1&&Y<cy+3&&Math.abs(X+.5-cx)>rx-1.3),HR,{mod:hairMod,nc:1});return}
   if(back){paint(P,new MK().ell(cx,cy-.5,rx+.9,ry+.4,(X,Y)=>Y<cy+4.5+(st==='long'?20:0)-(st==='long'?0:fr(X)%2)),HR,{mod:hairHL})}
   else if(side){paint(P,new MK().ell(cx-.3,cy-1,rx+.9,ry+.3,(X,Y)=>(Y<cy-2.4+(X>cx+2?fr(X):9))&&(X<cx+5||Y<cy-1.5)),HR,{mod:hairHL});
    if(st==='long')paint(P,new MK().band(cy-1,cy+15,Y=>cx-3.8+sway*(Y-cy)/15*1.4,Y=>4.2-(Y-cy)*.07,(X,Y)=>Y<=cy+14-fr(X*5)%2),HR,{mod:hairMod})}
   else{paint(P,new MK().ell(cx,cy-1.2,rx+.9,ry+.3,(X,Y)=>Y<cy-2.6+fr(X)||(Math.abs(X+.5-cx)>rx-2.2+Math.max(0,Y-cy+2)*.45&&Y<cy+3)),HR,{mod:hairHL});
    if(st==='long')for(const q of [-1,1])paint(P,new MK().cap(cx+q*(rx-.4),cy-1,cx+q*(rx+.3)+sway*.7,cy+14,2.3,1.6),HR,{mod:hairMod,sw:1})}
   if(st==='bun')paint(P,new MK().ell(cx+(side?-2:0),cy-ry-.6,3.8,3.2),HR,{mod:hairHL});
   if(st==='messy')for(const [a,b] of [[-6,-7],[-2,-9],[3,-9],[6,-6],[0,-10]])paint(P,new MK().cap(cx+a,cy+b+2,cx+a*1.2,cy+b,1.3),HR,{sw:1,nc:1})};
  // ---- cappelli
  const hat=()=>{if(!hasHat)return;const HC=R.hat;
   if(L.hat==='tall'){paint(P,new MK().band(cy-18,cy-6,()=>cx,()=>6.2),HC,{mod:(X,Y,t)=>Y===cy-18?4:t});
    for(let X=cx-6;X<cx+6;X++){P.set(X,cy-8,R.band[X<cx?4:3]);P.set(X,cy-7,R.band[2])}
    paint(P,new MK().ell(cx,cy-5.5,side?9.5:10.5,2.2),HC,{mod:(X,Y,t)=>Y<cy-5?4:t})}
   if(L.hat==='bonnet'){paint(P,new MK().ell(cx,cy-1.5,rx+1.6,ry+.6,(X,Y)=>Y<cy-2.8||(side?X<cx-1:Math.abs(X+.5-cx)>rx-1.6)&&Y<cy+5),HC,{mod:(X,Y,t)=>((X*2+Y)%5===0)?t-1:t});
    if(front){for(let X=cx-rx;X<=cx+rx;X++)if(P.has(X,cy-3))P.set(X,cy-3,HC[(X%2)?5:4]);for(let X=cx-3;X<=cx+2;X++)P.set(X,cy+8,HC[2])}}
   if(L.hat==='cap'){paint(P,new MK().ell(cx,cy-3,rx+.7,6.2,(X,Y)=>Y<cy-2),HC,{mod:(X,Y,t)=>(X===cx-1||X===cx)&&Y<cy-6?t-1:t});
    if(side)paint(P,new MK().ell(cx+rx+1,cy-2.6,4.2,1.3),HC);else if(front)paint(P,new MK().ell(cx,cy-2.2,rx-1,1.5,(X,Y)=>Y>cy-3),HC,{base:2})}};
  // ---- ordine di disegno
  if(side){arm(0,true);cape();legs();robe();torso();dress();apron();neck();arm(0,false);head();face();beard();hair();ears();hat()}
  else if(back){legs();robe();torso();dress();arm(-1);arm(1);neck();head();ears();hairBack();hair();cape();hat()}
  else{hairBack();cape(true);legs();robe();torso();dress();apron();cape();arm(-1);arm(1);neck();mantle();head();face();beard();hair();if(L.style!=='long')ears();hat()}
  P.outline();return P}
 return {MK,paint,frame,dk};
})();
heroFrame=GX.frame;

// =====================================================================
// EDIFICI — kit di pittura in pixel art (coordinate in pixel reali, 2× le unità di gioco)
// =====================================================================
const BK=(()=>{
 const hh=(a,b)=>{let n=(a|0)*374761393+(b|0)*668265263;n=Math.imul(n^(n>>>13),1274126177);return (n^(n>>>16))>>>0};
 const RPc={};const R6=h=>RPc[h]||(RPc[h]=ramp6(h));
 const S=(P,X,Y,c)=>P.set(X,Y,c);
 const F=(P,x,y,w,h,c)=>{for(let Y=y;Y<y+h;Y++)for(let X=x;X<x+w;X++)P.set(X,Y,c)};
 const tc=(R,t)=>R[clamp(t,0,R.length-1)];
 const dark=(P,x,y,w,h,k)=>{const d=P.d;for(let Y=Math.max(0,y);Y<Math.min(P.h,y+h);Y++)for(let X=Math.max(0,x);X<Math.min(P.w,x+w);X++){const i=(Y*P.w+X)*4;if(!d[i+3])continue;d[i]*=k;d[i+1]*=k;d[i+2]*=k}};
 const tint=(P,x,y,w,h,col,a)=>{for(let Y=y;Y<y+h;Y++)for(let X=x;X<x+w;X++)if(P.has(X,Y))P.set(X,Y,col,a)};
 // tetto a tegole visto di fronte. hwF(Y) = metà larghezza (centrato su cx) oppure inset classico
 function shingles(P,x0,y0,w,h,R,o={}){const rowH=o.rowH||6,sw=o.sw||8,ins=o.ins??12,clip=o.clip;
  for(let Y=y0;Y<y0+h;Y++){const k=Y-y0,inset=Math.max(0,ins-k),row=Math.floor(k/rowH),inr=k%rowH;
   for(let X=x0+inset;X<x0+w-inset;X++){if(clip&&!clip(X,Y))continue;
    const sx=X-x0+(row%2)*(sw>>1)+400,tile=Math.floor(sx/sw),inx=sx%sw,v=hh(tile,row)%11;let t=3;
    if(o.thatch){t=3;const s=hh(X,Math.floor(k/3))%8;if(s===0)t=2;else if(s===1)t=4;if(inr===rowH-1&&hh(X>>1,row)%3)t=1;else if(inr===rowH-2&&hh(X>>1,row)%3===0)t=2;if(inr===0&&hh(X,row)%2)t=4}
    else{if(v===0)t=2;if(inr===0)t+=1;if(inr===rowH-1)t=1;else if(inr===rowH-2&&(inx===0||inx===sw-1))t=1;else if(inx===0)t-=1}
    const f=k/h;if(f>.72&&inr!==0)t-=1;if(X>x0+w*.82)t-=1;else if(X<x0+w*.14&&inr!==rowH-1)t+=0;
    if(X===x0+inset||X===x0+w-inset-1)t=1;
    S(P,X,Y,tc(R,t))}}
  // colmo
  if(!o.noRidge)for(let X=x0+ins;X<x0+w-ins;X++){S(P,X,y0,tc(R,4));S(P,X,y0+1,tc(R,(X%6===0)?1:3));S(P,X,y0+2,tc(R,1))}
  // muschio
  if(o.moss)for(let i=0;i<w*h/90;i++){const X=x0+ins+hh(i,3)%(w-ins*2),Y=y0+4+hh(i,5)%(h-6);if(P.has(X,Y)){S(P,X,Y,C('#5a7a34'));if(hh(i,9)%2)S(P,X+1,Y,C('#4a6a2a'))}}}
 // grondaia + ombra sotto
 function eave(P,x,y,w,R){F(P,x,y,w,1,tc(R,4));F(P,x,y+1,w,2,tc(R,1));F(P,x,y+3,w,1,C('#2b1a10'))}
 function ao(P,x,y,w,n=8){for(let i=0;i<n;i++)dark(P,x,y+i,w,1,.62+i*(.38/n))}
 // assi orizzontali
 function planks(P,x0,y0,w,h,R,o={}){const rowH=o.rowH||8;
  for(let Y=y0;Y<y0+h;Y++){const k=Y-y0,row=Math.floor(k/rowH),inr=k%rowH,off=hh(row,7)%37;
   for(let X=x0;X<x0+w;X++){if(o.clip&&!o.clip(X,Y))continue;const sx=(X-x0+off)%(o.seam||46);let t=3;
    if(inr===0)t=4;else if(inr===rowH-1)t=1;else if(inr===rowH-2)t=2;
    if(sx===0)t=1;else if(sx===1&&inr<rowH-2)t=4;
    else if(inr>0&&inr<rowH-2&&hh(X>>2,Y)%23===0)t=2;
    if((sx===3||sx===(o.seam||46)-3)&&inr===2)t=0;
    S(P,X,Y,tc(R,t))}}}
 // assi verticali (fienili)
 function boards(P,x0,y0,w,h,R,o={}){const bw=o.bw||7;
  for(let Y=y0;Y<y0+h;Y++)for(let X=x0;X<x0+w;X++){if(o.clip&&!o.clip(X,Y))continue;const k=X-x0,b=Math.floor(k/bw),inx=k%bw;let t=3;
   if(inx===0)t=1;else if(inx===1)t=4;else if(inx===bw-1)t=2;else if(hh(X,Y>>2)%19===0)t=2;
   if(hh(b,9)%4===0&&t===3)t=2;
   S(P,X,Y,tc(R,t))}}
 // muro di pietre irregolari
 function stones(P,x0,y0,w,h,R,o={}){let Y=y0,row=0;
  while(Y<y0+h){const rh=(o.rh||8)+hh(row,3)%3;let X=x0-(hh(row,11)%10);
   while(X<x0+w){const bw=(o.bw||12)+hh(X,row)%7,v=hh(X*3,row*7)%4,base=[2,3,3,4][v];
    for(let yy=0;yy<rh;yy++)for(let xx=0;xx<bw;xx++){const PX_=X+xx,PY=Y+yy;if(PX_<x0||PX_>=x0+w||PY>=y0+h)continue;if(o.clip&&!o.clip(PX_,PY))continue;
     let t=base;const corner=(xx===0||xx===bw-1)&&(yy===0||yy===rh-1);
     if(yy===rh-1||xx===bw-1||corner)t=o.mortar??1;else if(yy===0||xx===0)t=base+1;else if(yy===rh-2||xx===bw-2)t=base-1;
     if(o.shadeX)t+=o.shadeX(PX_);
     S(P,PX_,PY,tc(R,t))}
    X+=bw}
   Y+=rh;row++}
  if(o.moss)for(let i=0;i<w/3;i++){const X=x0+hh(i,21)%w,Y=y0+h-1-hh(i,23)%Math.min(h,10);if(P.has(X,Y))S(P,X,Y,C(hh(i,2)%2?'#5a7a34':'#4a6a2a'))}}
 // intonaco
 function plaster(P,x0,y0,w,h,R,o={}){for(let Y=y0;Y<y0+h;Y++)for(let X=x0;X<x0+w;X++){if(o.clip&&!o.clip(X,Y))continue;const v=hh(X,Y)%61;let t=3;if(v===0)t=2;else if(v===1)t=4;
   if(o.shadeX)t+=o.shadeX(X);S(P,X,Y,tc(R,t))}
  // crepe e mattoni a vista
  for(let i=0;i<(o.cracks??2);i++){let X=x0+8+hh(i,31)%(w-16),Y=y0+6+hh(i,37)%(h-14);for(let k=0;k<6;k++){if(P.has(X,Y))S(P,X,Y,tc(R,1));X+=hh(i,k)%3-1;Y++}}
  for(let i=0;i<(o.bricks??2);i++){const bx=x0+6+hh(i,41)%(w-20),by=y0+h-14-hh(i,43)%Math.max(1,h-24);for(let r=0;r<2;r++)for(let c=0;c<2;c++){const X=bx+c*6+(r%2)*3,Y=by+r*4;F(P,X,Y,5,3,C('#9a5a3e'));F(P,X,Y,5,1,C('#b8735a'));F(P,X+4,Y,1,3,C('#6a3a28'))}}}
 // travi a vista
 function timber(P,x0,y0,w,h,R){const beam=(x,y,ww,hh_)=>{F(P,x,y,ww,hh_,tc(R,2));F(P,x,y,ww,1,tc(R,3));F(P,x,y+hh_-1,ww,1,tc(R,1))};
  beam(x0,y0,w,4);beam(x0,y0+Math.floor(h*.48),w,3);
  for(const X of [x0,x0+w-4]){F(P,X,y0,4,h,tc(R,2));F(P,X,y0,1,h,tc(R,3));F(P,X+3,y0,1,h,tc(R,1))}}
 // pietre d'angolo
 function quoins(P,x,y,h,R,right){for(let Y=y,i=0;Y<y+h;Y+=6,i++){const w=(i%2)?6:9,X=right?x-w+1:x;F(P,X,Y,w,5,tc(R,right?2:4));F(P,X,Y,w,1,tc(R,5));F(P,X,Y+5,w,1,tc(R,0))}}
 // finestra (vetro 20×20 in X,Y)
 function windowPX(P,X,Y,o={}){const T=R6(o.trim||'#e3cf9f'),gw=o.w||20,gh=o.h||20;
  if(o.shutter){const SH=R6(o.shutter);for(const sx of [X-11,X+gw+3]){F(P,sx,Y-2,8,gh+4,tc(SH,1));for(let yy=0;yy<gh+2;yy++)F(P,sx+1,Y-1+yy,6,1,tc(SH,(yy%3===0)?2:(yy%3===1?4:3)));F(P,sx+1,Y+(gh>>1),6,1,tc(SH,1));S(P,sx+5,Y+(gh>>1)+2,C('#2e2e34'))}}
  // architrave
  F(P,X-4,Y-6,gw+8,4,tc(T,2));F(P,X-4,Y-6,gw+8,1,tc(T,4));F(P,X-4,Y-3,gw+8,1,tc(T,0));
  // cornice
  F(P,X-2,Y-2,gw+4,gh+4,tc(T,1));F(P,X-1,Y-1,gw+2,gh+2,tc(T,3));F(P,X-1,Y-1,gw+2,1,tc(T,4));F(P,X+gw,Y-1,1,gh+2,tc(T,2));
  // vetro
  const g0=C(o.glass||'#1c2840'),g1=C(mix(o.glass||'#1c2840','#53709a',.35)),g2=C('#6c8ab0'),g3=C('#a8c4e0');
  for(let yy=0;yy<gh;yy++)for(let xx=0;xx<gw;xx++){let c=yy<gh*.35?g1:g0;const d=(xx+yy)%14;if(d===0||d===1)c=g1;if((xx+yy)===6||(xx+yy)===7)c=g2;S(P,X+xx,Y+yy,c)}
  S(P,X+1,Y+1,g3);S(P,X+2,Y+1,g3);S(P,X+1,Y+2,g3);
  if(o.curtain){const CU=R6(o.curtain);for(let yy=0;yy<gh-2;yy++){const w2=Math.max(1,4-Math.floor(yy/5));F(P,X,Y+yy,w2,1,tc(CU,yy%2?3:4));F(P,X+gw-w2,Y+yy,w2,1,tc(CU,yy%2?2:3))}}
  // traverse
  const mx=X+(gw>>1)-1,my=Y+(gh>>1)-1;F(P,mx,Y,2,gh,tc(T,3));S(P,mx,Y,tc(T,4));F(P,mx+1,Y,1,gh,tc(T,2));F(P,X,my,gw,2,tc(T,3));F(P,X,my,gw,1,tc(T,4));
  // davanzale
  F(P,X-3,Y+gh+2,gw+6,2,tc(T,4));F(P,X-3,Y+gh+4,gw+6,1,tc(T,1));
  if(o.flowers!==false){const B=R6('#6a4224');F(P,X-2,Y+gh+5,gw+4,5,tc(B,3));F(P,X-2,Y+gh+5,gw+4,1,tc(B,4));F(P,X-2,Y+gh+9,gw+4,1,tc(B,1));for(let i=0;i<gw+4;i+=6)F(P,X-2+i,Y+gh+6,1,3,tc(B,2));
   const fl=['#e8c23a','#f4ecd8','#c070c0','#e86a4a','#eab04a'];
   for(let i=0;i<gw+4;i+=2){const lh=2+hh(i,X)%3;F(P,X-2+i,Y+gh+5-lh,2,lh,C(hh(i,Y)%2?'#3f6a24':'#5a8a30'))}
   for(let i=0;i<6;i++){const fx=X-1+hh(i,X+Y)%(gw+2),fy=Y+gh+1+hh(i,Y)%3,fc=C(fl[hh(i,X*3+Y)%fl.length]);S(P,fx,fy,fc);S(P,fx+1,fy,fc);S(P,fx,fy+1,fc);S(P,fx+1,fy+1,C('#f8e070'))}}}
 // porta (24×32 in X,Y)
 function doorPX(P,X,Y,o={}){const D=R6(o.col||'#6a3a1c'),T=R6(o.trim||'#e3cf9f'),w=o.w||24,h=o.h||32;
  F(P,X-4,Y-6,w+8,h+6,tc(T,1));F(P,X-3,Y-5,w+6,h+5,tc(T,3));F(P,X-3,Y-5,w+6,1,tc(T,4));F(P,X+w+2,Y-5,1,h+5,tc(T,2));
  F(P,X-1,Y-1,w+2,h+1,C('#22140c'));
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const p=xx%6;let t=3;if(p===0)t=1;else if(p===1)t=4;else if(p===5)t=2;else if(hh(xx+X,yy>>2)%13===0)t=2;if(yy<2)t=Math.min(t,1);S(P,X+xx,Y+yy,tc(D,t))}
  if(o.win!==false){F(P,X+(w>>1)-5,Y+4,10,7,tc(D,0));F(P,X+(w>>1)-4,Y+5,8,5,C('#2a3c5a'));S(P,X+(w>>1)-3,Y+5,C('#6c8ab0'));F(P,X+(w>>1),Y+5,1,5,tc(D,1))}
  for(const sy of [Y+(o.win!==false?14:6),Y+h-8]){F(P,X,sy,w-6,2,C('#2e2e34'));for(let xx=1;xx<w-6;xx+=4)S(P,X+xx,sy,C('#6a6a76'))}
  F(P,X+w-5,Y+(h>>1)+1,3,3,C('#a8802a'));S(P,X+w-5,Y+(h>>1)+1,C('#fff0a0'));
  // gradino
  if(o.step!==false){const SR=R6('#8a877d');F(P,X-8,Y+h,w+16,4,tc(SR,3));F(P,X-8,Y+h,w+16,1,tc(SR,5));F(P,X-8,Y+h+3,w+16,1,tc(SR,1));for(let i=X-8;i<X+w+8;i+=9)S(P,i,Y+h+1,tc(SR,1))}}
 // comignolo
 function chimney(P,X,Y,h){const B=R6('#9a5a40');for(let yy=0;yy<h;yy++)for(let xx=0;xx<14;xx++){const r=Math.floor(yy/3),off=(r%2)*3,mort=yy%3===2||((xx+off)%6===5);let t=mort?1:(xx<3?4:xx>10?2:3);S(P,X+xx,Y+yy,tc(B,t))}
  const SR=R6('#6a6a6a');F(P,X-2,Y-4,18,4,tc(SR,3));F(P,X-2,Y-4,18,1,tc(SR,5));F(P,X-2,Y-1,18,1,tc(SR,1));F(P,X+3,Y-6,8,2,tc(SR,1))}
 // zoccolo di pietra
 function plinth(P,x0,y0,w,h){const SR=R6('#7f7c72');stones(P,x0,y0,w,h,SR,{rh:h-1,bw:11,mortar:0})}
 return {hh,R6,S,F,tc,dark,tint,shingles,eave,ao,planks,boards,stones,plaster,timber,quoins,windowPX,doorPX,chimney,plinth};
})();

// ---------- case del villaggio (stesse misure, finestre e porte di prima) ----------
const VB={
 house:{w:6,h:5,roofH:44,wall:'planks',wc:'#c79a62',roof:'#7f58a0',win:[[12,52],[70,52]],door:2,chimney:1,shutter:'#4a6a3a',curtain:'#e8dcc0'},
 store:{w:6,h:5,roofH:42,wall:'planks',wc:'#d9c49a',roof:'#4c7c8c',win:[[10,52],[70,52]],door:3,shutter:'#2f5a6a',sign:1,awning:'#b8402a'},
 elder:{w:6,h:5,roofH:42,wall:'stone',wc:'#6e6a64',roof:'#3a3944',win:[[10,52],[70,52]],door:3,chimney:1,doorCol:'#2b2420',trim:'#9a968c',moss:1},
 barn:{w:4,h:6,roofH:46,wall:'boards',wc:'#8a3026',roof:'#4a3a32',win:[],door:2,doorCol:'#4a1a14',barn:1},
 cottage:{w:5,h:4,roofH:30,wall:'plaster',wc:'#e6d3a6',roof:'#d9a23a',thatch:1,win:[[8,38],[58,38]],door:2,shutter:'#7a8a4a',timber:'#5a3a22',curtain:'#d88a8a'},
 forge:{w:5,h:4,roofH:30,wall:'stone',wc:'#8a7a6a',roof:'#5a483c',win:[[8,38]],door:2,chimney:1,forge:1},
 chapel:{w:7,h:7,roofH:50,extra:22,wall:'plaster',wc:'#e8e0cc',roof:'#585868',win:[[12,96],[90,96]],door:3,trim:'#f2ead6',chapel:1,glass:'#3a2a5a'},
};
function genVillage(key){const o=VB[key],B=BK,Wd=o.w*16,Hd=o.h*16+(o.extra||0),r0=(o.extra||0)*2,rh=(o.roofH+(o.extra||0))*2,PW=(Wd+2)*2,PH=Hd*2,bx=2;
 const P=new PX(PW,PH);srand(900+Wd+rh);
 const WR=B.R6(o.wc),RR=B.R6(o.roof),wx0=bx+4,wx1=bx+Wd*2-4,ww=wx1-wx0,wy0=rh-4,wy1=PH-10;
 const shadeX=X=>X>wx1-26?-1:0;
 // muro
 if(o.wall==='planks')B.planks(P,wx0,wy0,ww,wy1-wy0,WR,{rowH:9});
 else if(o.wall==='boards')B.boards(P,wx0,wy0,ww,wy1-wy0,WR,{bw:8});
 else if(o.wall==='stone')B.stones(P,wx0,wy0,ww,wy1-wy0,WR,{rh:9,bw:13,moss:o.moss,shadeX});
 else B.plaster(P,wx0,wy0,ww,wy1-wy0,WR,{shadeX,cracks:o.chapel?3:2,bricks:o.chapel?1:2});
 if(o.timber)B.timber(P,wx0,wy0+4,ww,wy1-wy0-4,B.R6(o.timber));
 // pilastri d'angolo
 if(o.wall==='planks'||o.wall==='boards'){const PR=B.R6(shade(o.wc,-.35));for(const X of [wx0,wx1-5]){B.F(P,X,wy0,5,wy1-wy0,B.tc(PR,3));B.F(P,X,wy0,1,wy1-wy0,B.tc(PR,4));B.F(P,X+4,wy0,1,wy1-wy0,B.tc(PR,1))}}
 else if(o.wall==='plaster'&&!o.timber){const QR=B.R6('#a8a296');B.quoins(P,wx0,wy0+6,wy1-wy0-6,QR,false);B.quoins(P,wx1-1,wy0+6,wy1-wy0-6,QR,true)}
 // lato in ombra
 for(let i=0;i<24;i++)B.dark(P,wx1-24+i,wy0,1,wy1-wy0,1-i*.012);
 B.plinth(P,bx+2,PH-10,Wd*2-4,10);
 // finestre e porta
 const lights=[];for(const [wx,wy] of o.win){B.windowPX(P,(1+wx)*2,wy*2,{trim:o.trim,shutter:o.shutter,curtain:o.curtain,glass:o.glass,flowers:!o.chapel});lights.push([wx,wy,10,10])}
 if(o.barn){// portone a X
  const D=B.R6(o.doorCol),T=B.R6('#e8dcc0'),X=bx+20*2,Y=rh+16;B.F(P,X,Y,48,PH-10-Y,B.tc(D,2));B.boards(P,X+2,Y+2,44,PH-14-Y,D,{bw:6});
  for(const [x,y,w,h] of [[X,Y,48,3],[X,Y,3,PH-10-Y],[X+45,Y,3,PH-10-Y],[X,Y+ (PH-10-Y>>1),48,3]]){B.F(P,x,y,w,h,B.tc(T,3));B.F(P,x,y,w,1,B.tc(T,5))}
  const ph=(PH-10-Y)>>1;for(const y1 of [Y+3,Y+ph+3])for(let i=0;i<ph-3;i++){const k=i/(ph-3);for(const xa of [X+3+k*39,X+42-k*39])B.F(P,Math.round(xa),y1+i,3,1,B.tc(T,i%2?3:4))}}
 if(o.door!=null&&!o.barn)B.doorPX(P,(bx/2+o.door*16+2)*2,(Hd-21)*2,{col:o.doorCol,trim:o.trim});
 if(o.awning){const AR=B.R6(o.awning),WH=B.R6('#efe6d2');for(const [wx,wy] of o.win){const X=(1+wx)*2-6,Y=wy*2-14;for(let yy=0;yy<8;yy++)for(let xx=0;xx<32;xx++){const st=Math.floor(xx/4)%2;let c=B.tc(st?WH:AR,yy===0?4:(yy>5?2:3));B.S(P,X+xx,Y+yy,c)}for(let xx=0;xx<32;xx+=4){B.S(P,X+xx+1,Y+8,B.tc(Math.floor(xx/4)%2?WH:AR,2));B.S(P,X+xx+2,Y+8,B.tc(Math.floor(xx/4)%2?WH:AR,2))}}}
 if(o.sign){const W2=B.R6('#6a4224'),G=B.R6('#e8c23a'),X=(bx/2+30)*2,Y=rh+4;B.F(P,X,Y,72,18,B.tc(W2,1));B.F(P,X+2,Y+2,68,14,B.tc(W2,3));B.F(P,X+2,Y+2,68,1,B.tc(W2,4));
  // un sacco e una bilancia stilizzati
  for(let i=0;i<6;i++){const sx=X+10+i*9;B.F(P,sx,Y+6,6,6,B.tc(G,3));B.F(P,sx,Y+6,6,1,B.tc(G,5));B.F(P,sx+5,Y+6,1,6,B.tc(G,1))}}
 if(o.forge){const X=(bx/2+60)*2,Y=78;B.F(P,X-3,Y-3,22,18,C('#2a2420'));for(let yy=0;yy<12;yy++)for(let xx=0;xx<16;xx++){const d=Math.hypot(xx-8,yy-9);B.S(P,X+xx,Y+yy,C(d<3?'#fff0a0':d<6?'#ffb84a':'#d8601e'))}
  // incudine come insegna
  const I=B.R6('#4a4a54');B.F(P,X-2,Y-16,20,4,B.tc(I,3));B.F(P,X-2,Y-16,20,1,B.tc(I,5));B.F(P,X+4,Y-12,8,4,B.tc(I,2))}
 // grondaia e ombra
 B.ao(P,wx0,rh+4,ww,9);
 // tetto
 B.shingles(P,bx,r0,Wd*2,rh-r0,RR,{rowH:o.thatch?7:6,sw:o.thatch?10:8,thatch:o.thatch,moss:o.moss||o.roof==='#4a3a32'});
 B.eave(P,bx,rh,Wd*2,RR);
 if(o.barn){const T=B.R6('#e8dcc0'),hx=bx+26*2,hy=rh-40;B.F(P,hx-3,hy-3,30,26,B.tc(T,1));B.F(P,hx-2,hy-2,28,24,B.tc(T,3));B.F(P,hx-2,hy-2,28,1,B.tc(T,5));B.F(P,hx,hy,24,20,C('#1e120c'));
  for(let i=0;i<24;i++){const h2=5+B.hh(i,5)%7;B.F(P,hx+i,hy+20-h2,1,h2,C(B.hh(i,7)%3?'#d8b048':'#b8902a'));if(B.hh(i,9)%3===0)B.S(P,hx+i,hy+19-h2,C('#f0d070'))}
  B.F(P,hx+11,hy-10,2,8,C('#3e3e46'));B.F(P,hx+8,hy-11,8,2,C('#5a5a64'))}
 let chim=null;if(o.chimney){const chx=(bx/2+Wd-22)*2;B.chimney(P,chx,r0+6,22);chim=[(bx/2+Wd-22)+3,o.extra||0]}
 if(o.chapel){const cx=bx+Wd,TW=B.R6('#e8e0cc'),SR=B.R6('#4a4a58'),G=B.R6('#e8c23a');
  // torre
  B.plaster(P,cx-22,16,44,96,TW,{cracks:1,bricks:0,shadeX:X=>X>cx+14?-1:0});B.quoins(P,cx-22,20,90,B.R6('#b8b2a4'),false);B.quoins(P,cx+21,20,90,B.R6('#b8b2a4'),true);
  // cella campanaria
  B.F(P,cx-13,30,26,30,C('#14141c'));B.F(P,cx-13,30,26,2,B.tc(TW,1));for(let yy=0;yy<14;yy++){const w2=Math.round(Math.sqrt(Math.max(0,49-(yy-6)*(yy-6)*.6))*1.1);B.F(P,cx-w2,38+yy,w2*2,1,B.tc(G,yy<3?5:yy<9?3:2))}B.F(P,cx-1,52,2,4,B.tc(G,1));
  for(let yy=30;yy<60;yy+=5)B.F(P,cx-13,yy,26,1,C('#2a2a34'));
  // guglia
  for(let yy=0;yy<18;yy++){const hw=4+yy*1.5;for(let X=Math.round(cx-hw);X<Math.round(cx+hw);X++){const k=yy%4;let t=k===3?1:(X<cx?4:2);if(k===0)t++;B.S(P,X,yy+2,B.tc(SR,t))}}B.F(P,cx-30,19,60,2,B.tc(SR,1));
  B.F(P,cx-1,0,2,4,B.tc(G,4));
  // rosone
  const ry=136;for(let yy=-16;yy<=16;yy++)for(let xx=-16;xx<=16;xx++){const d=Math.hypot(xx,yy);if(d>16)continue;const a=Math.atan2(yy,xx);let c;
   if(d>14)c=B.tc(B.R6('#5a3b22'),2);else if(d<4)c=C('#e8c23a');else{const seg=Math.floor((a+Math.PI)/(Math.PI/4));c=C(['#c0303a','#2a5aa8','#e8c23a','#3a8a4a'][seg%4]);if(Math.abs(((a+Math.PI)%(Math.PI/4))-Math.PI/8)>Math.PI/9||d%5<1)c=C('#2a1a10')}
   B.S(P,cx+xx,ry+yy,c)}}
 P.outline();const c=pxCanvas(P);c.lights=lights;if(chim)c.chim=chim;return c}
{const _go=genObjects;genObjects=function(){_go();try{for(const k in VB)IMG[k]=genVillage(k)}catch(e){console.error(e)}}}

// ---------- costruzioni della Valle (stesse misure di prima) ----------
const GB=(w,h,fn)=>{const P=new PX(w*2,h*2);srand(w*31+h);fn(P,BK);P.outline();return pxCanvas(P)};
// riempie una forma con colonne (cx,hw(Y)) restituendo una clip
const clipBand=(cx,hwF)=>(X,Y)=>Math.abs(X+.5-cx)<=hwF(Y);
const ART2={
 pollaio:()=>GB(48,34,(P,B)=>{const W=B.R6('#a0703e'),RF=B.R6('#8a3a2a'),D=B.R6('#5a3a1e');
  // zampe
  for(const X of [12,28,64,80]){B.F(P,X,52,5,14,B.tc(D,2));B.F(P,X,52,1,14,B.tc(D,4))}
  // corpo ad assi
  B.boards(P,8,24,80,32,W,{bw:7});B.F(P,8,54,80,3,B.tc(D,1));
  for(const X of [8,83]){B.F(P,X,24,5,32,B.tc(D,3));B.F(P,X,24,1,32,B.tc(D,4));B.F(P,X+4,24,1,32,B.tc(D,1))}
  B.ao(P,8,24,80,6);
  // finestrelle
  for(const X of [16,66]){B.F(P,X-2,31,16,14,B.tc(D,1));B.F(P,X,33,12,10,C('#1e1410'));B.F(P,X+5,33,2,10,B.tc(D,3));B.F(P,X,37,12,2,B.tc(D,3));B.S(P,X+1,34,C('#6a5a4a'))}
  // porticina ad arco col fieno
  for(let yy=0;yy<18;yy++){const hw=yy<5?Math.round(Math.sqrt(25-(5-yy)*(5-yy))*1.6):8;B.F(P,48-hw-2,36+yy,hw*2+4,1,B.tc(D,1));B.F(P,48-hw,36+yy,hw*2,1,C(yy>12?'#c8a040':'#1a100a'))}
  for(let i=0;i<16;i++){const h2=2+B.hh(i,3)%4;B.F(P,40+i,54-h2,1,h2,C(B.hh(i,5)%2?'#d8b048':'#b8902a'))}
  // rampa
  for(let i=0;i<20;i++){const X=56+i,Y=54+Math.round(i*.55);B.F(P,X,Y,1,4,B.tc(D,i%5===0?1:3));B.S(P,X,Y,B.tc(D,4))}
  // tetto a capanna
  B.shingles(P,0,2,96,24,RF,{rowH:5,sw:7,ins:0,clip:clipBand(48,Y=>14+(Y-2)*1.45),noRidge:1});
  for(let Y=2;Y<26;Y++){const hw=Math.round(14+(Y-2)*1.45);B.S(P,48-hw,Y,B.tc(RF,1));B.S(P,47+hw,Y,B.tc(RF,1))}
  B.F(P,34,1,28,3,B.tc(RF,4));B.eave(P,2,24,92,RF);
  // banderuola a gallo
  B.F(P,47,-2,2,4,C('#3e3e46'))}),
 stalla:()=>GB(64,48,(P,B)=>{const W=B.R6('#9a3a28'),RF=B.R6('#4e3e36'),T=B.R6('#e8dcc0'),D=B.R6('#4a1a14');
  B.boards(P,6,34,116,52,W,{bw:8});
  for(const X of [6,117]){B.F(P,X,34,5,52,B.tc(T,3));B.F(P,X,34,1,52,B.tc(T,5));B.F(P,X+4,34,1,52,B.tc(T,1))}
  for(let i=0;i<20;i++)B.dark(P,102+i,34,1,52,1-i*.012);
  B.plinth(P,4,86,120,10);
  // portone a X
  const X=42,Y=48,w=44,h=38;B.F(P,X,Y,w,h,B.tc(D,2));B.boards(P,X+2,Y+2,w-4,h-2,D,{bw:6});
  for(const [x,y,ww,hh] of [[X,Y,w,3],[X,Y,3,h],[X+w-3,Y,3,h],[X+(w>>1)-1,Y,2,h]]){B.F(P,x,y,ww,hh,B.tc(T,3));B.F(P,x,y,ww,1,B.tc(T,5))}
  for(const [x0,x1] of [[X+3,X+(w>>1)-1],[X+(w>>1)+1,X+w-3]])for(let i=0;i<h-3;i++){const k=i/(h-3);for(const xa of [x0+k*(x1-x0-3),x1-3-k*(x1-x0-3)])B.F(P,Math.round(xa),Y+3+i,3,1,B.tc(T,i%2?3:4))}
  // finestre
  for(const wx of [16,96])B.windowPX(P,wx,52,{trim:'#e8dcc0',flowers:false,w:16,h:14});
  B.ao(P,6,36,116,8);
  // tetto a mansarda
  const hw=Y=>Y<18?30+(Y-2)*2:Math.min(64,62+(Y-18)*.2);
  B.shingles(P,0,2,128,34,RF,{rowH:6,sw:8,ins:0,clip:clipBand(64,hw),noRidge:1,moss:1});
  for(let Y=2;Y<36;Y++){const h2=Math.round(hw(Y));B.S(P,64-h2,Y,B.tc(RF,1));B.S(P,63+h2,Y,B.tc(RF,1));if(Y===18)B.F(P,64-h2,Y,h2*2,1,B.tc(RF,1))}
  B.F(P,34,2,60,2,B.tc(RF,4));B.eave(P,2,34,124,RF);
  // botola del fieno
  const hx=52,hy=10;B.F(P,hx-3,hy-3,30,24,B.tc(T,3));B.F(P,hx-3,hy-3,30,1,B.tc(T,5));B.F(P,hx,hy,24,18,C('#1e120c'));for(let i=0;i<24;i++){const h2=5+B.hh(i,5)%7;B.F(P,hx+i,hy+18-h2,1,h2,C(B.hh(i,7)%3?'#d8b048':'#b8902a'))}}),
 serra:()=>GB(64,44,(P,B)=>{const FR=B.R6('#eef2ea'),BR=B.R6('#9a5a3e'),G0=C('#9fd0d8'),G1=C('#c4e8ec'),G2=C('#e8f8f8'),GD=C('#78aab8');
  // base di mattoni
  for(let Y=76;Y<88;Y++)for(let X=4;X<124;X++){const r=Math.floor((Y-76)/4),mort=(Y-76)%4===3||((X+(r%2)*4)%8===7);B.S(P,X,Y,B.tc(BR,mort?1:(Y%4===0?4:3)))}
  // vetrate con piante dentro
  for(let Y=40;Y<76;Y++)for(let X=6;X<122;X++){let c=((X+Y)%22<3)?G1:G0;if((X-Y+200)%40<2)c=G2;if(Y>66)c=GD;B.S(P,X,Y,c)}
  for(let i=0;i<14;i++){const cx=12+i*8+B.hh(i,1)%4,cy=64+B.hh(i,2)%6,r=4+B.hh(i,3)%3;for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){if(xx*xx+yy*yy>r*r)continue;const t=(xx+yy<-2)?'#7ac04a':(xx+yy>2)?'#3a7a2a':'#5a9a3a';B.S(P,cx+xx,cy+yy,C(t))}if(B.hh(i,4)%2){B.S(P,cx+1,cy-1,C('#e0402a'));B.S(P,cx-2,cy+1,C('#e0402a'))}}
  // telaio
  for(let X=6;X<=120;X+=16){B.F(P,X,40,2,36,B.tc(FR,3));B.S(P,X,40,B.tc(FR,5))}B.F(P,6,40,116,2,B.tc(FR,4));B.F(P,6,56,116,2,B.tc(FR,3));B.F(P,6,74,116,2,B.tc(FR,2));
  // porta
  B.F(P,54,50,20,26,B.tc(FR,3));for(let Y=52;Y<74;Y++)for(let X=56;X<72;X++)B.S(P,X,Y,(X+Y)%12<2?G2:G1);B.F(P,63,52,2,22,B.tc(FR,3));B.S(P,69,63,C('#c8a03a'));
  // tetto di vetro
  const hw=Y=>14+(Y-4)*1.3;
  for(let Y=4;Y<40;Y++){const h2=hw(Y);for(let X=Math.round(64-h2);X<Math.round(64+h2);X++){let c=((X*2+Y)%26<4)?G2:(Y<20?G1:G0);if(X>64+h2-8)c=GD;B.S(P,X,Y,c)}}
  for(let X=8;X<=120;X+=12)for(let Y=4;Y<40;Y++){if(Math.abs(X-64)<hw(Y)-1)B.S(P,X,Y,B.tc(FR,(X>100)?2:3))}
  for(const Y of [16,28])for(let X=Math.round(64-hw(Y));X<64+hw(Y);X++)B.S(P,X,Y,B.tc(FR,3));
  B.F(P,46,3,36,2,B.tc(FR,5));B.F(P,2,38,124,3,B.tc(FR,3));B.F(P,2,38,124,1,B.tc(FR,5))}),
 mulino:()=>GB(48,56,(P,B)=>{const ST=B.R6('#9a968a'),RF=B.R6('#6a3a2a'),WD=B.R6('#8a5a32'),CL=B.R6('#e8e0d0');
  const hwT=Y=>16+(Y-30)*.12,clip=clipBand(48,hwT);
  B.stones(P,20,30,56,80,ST,{rh:7,bw:10,clip,shadeX:X=>{const n=(X+.5-48)/16;return n<-.6?1:n>.75?-2:n>.35?-1:0},moss:1});
  // finestrella e porta
  B.F(P,44,52,8,12,B.tc(WD,1));B.F(P,45,53,6,10,C('#1e1410'));B.F(P,47,53,2,10,B.tc(WD,3));
  for(let yy=0;yy<24;yy++){const hw=yy<5?Math.round(Math.sqrt(25-(5-yy)*(5-yy))*1.6):8;B.F(P,48-hw-1,86+yy,hw*2+2,1,B.tc(ST,1));if(yy>0)for(let xx=-hw+1;xx<hw-1;xx++)B.S(P,48+xx,86+yy,B.tc(WD,((xx+40)%5===0)?1:(xx<0?3:2)))}
  // tetto conico
  for(let Y=10;Y<34;Y++){const h2=4+(Y-10)*.85;for(let X=Math.round(48-h2);X<Math.round(48+h2);X++){const n=(X+.5-48)/h2;let t=(Y-10)%4===3?1:3;if(n<-.4)t++;if(n>.4)t--;if(n>.8)t--;B.S(P,X,Y,B.tc(RF,t))}}
  B.F(P,26,32,44,3,B.tc(RF,1));
  // pale (girano: le disegna MULINO_PALE a ogni fotogramma, qui solo se la grafica animata manca)
  if(typeof window.MULINO_ANIM==='undefined')mulinoPale(P,B,Math.PI/4)}),
 _x:()=>null,
};
function mulinoPale(P,B,off,hy=26){const WD=B.R6('#8a5a32'),CL=B.R6('#e8e0d0');
  for(const a of [0,1,2,3]){const t=a*Math.PI/2+off,ca=Math.cos(t),sa=Math.sin(t),ca2=-sa,sa2=ca;
   for(let Y=0;Y<hy+44;Y++)for(let X=0;X<96;X++){const dx=X+.5-48,dy=Y+.5-hy,r=dx*ca+dy*sa,q=dx*ca2+dy*sa2;
    if(r>=0&&r<36&&Math.abs(q)<1.3){B.S(P,X,Y,B.tc(WD,q<0?4:2));continue}
    if(r<10||r>=34||q<1.3||q>=9)continue;const lat=(Math.floor(r)%5===0)||q>=8;B.S(P,X,Y,lat?B.tc(WD,2):B.tc(CL,q<4?4:3))}}
  for(let yy=-4;yy<=4;yy++)for(let xx=-4;xx<=4;xx++)if(xx*xx+yy*yy<=16)B.S(P,48+xx,hy+yy,B.tc(WD,xx+yy<0?4:2));B.S(P,48,hy,C('#2e2e34'))}
Object.assign(ART2,{
 silos:()=>GB(32,56,(P,B)=>{const M=B.R6('#b8483a'),G=B.R6('#a8acb4'),I=B.R6('#4a4a54');
  for(let Y=16;Y<108;Y++)for(let X=8;X<56;X++){const n=(X+.5-32)/24;let t=3;if(n<-.75)t=4;else if(n<-.4)t=4;if(n>.45)t=2;if(n>.8)t=1;const r=(Y-16)%6;if(r===0)t++;else if(r===5)t--;if(((Y-16)%30)<2)t=1;B.S(P,X,Y,B.tc(M,t))}
  // fascia bianca
  for(let Y=40;Y<46;Y++)for(let X=8;X<56;X++){const n=(X+.5-32)/24;B.S(P,X,Y,C(n>.5?'#c8c0b0':'#efe6d2'))}
  // cupola
  for(let Y=0;Y<18;Y++){const h2=Math.min(24,6+Math.sqrt(Y/18)*18);for(let X=Math.round(32-h2);X<Math.round(32+h2);X++){const n=(X+.5-32)/h2;let t=3;if(n<-.3)t=5;else if(n<0)t=4;if(n>.5)t=2;if(((X-32+40)%8)===0&&Y>3)t--;B.S(P,X,Y,B.tc(G,t))}}
  B.F(P,6,16,52,3,B.tc(G,1));B.F(P,28,0,8,3,B.tc(G,2));B.F(P,26,-1,12,2,B.tc(G,4));
  // scala
  for(let Y=20;Y<104;Y++){B.S(P,46,Y,B.tc(I,3));B.S(P,51,Y,B.tc(I,2));if(Y%5===0)B.F(P,46,Y,6,1,B.tc(I,4))}
  // portello
  B.F(P,24,78,16,30,B.tc(I,1));B.F(P,26,80,12,28,B.tc(B.R6('#5a3a1e'),3));for(let Y=80;Y<108;Y+=4)B.F(P,26,Y,12,1,B.tc(B.R6('#5a3a1e'),2));B.S(P,35,94,C('#c8a03a'));
  B.F(P,6,106,52,4,B.tc(B.R6('#7f7c72'),3));B.F(P,6,106,52,1,B.tc(B.R6('#7f7c72'),5))}),
 pozzogrande:()=>GB(32,36,(P,B)=>{const ST=B.R6('#8a877d'),WD=B.R6('#7a5030'),RF=B.R6('#6a3a2a');
  B.stones(P,4,40,56,30,ST,{rh:7,bw:10,clip:(X,Y)=>Math.abs(X+.5-32)<=28,shadeX:X=>X>50?-1:X<12?1:0,moss:1});
  // bordo e acqua
  for(let yy=-8;yy<=8;yy++)for(let xx=-29;xx<=29;xx++){const a=xx/29,b=yy/8,d=a*a+b*b;if(d>1)continue;const a2=xx/22,b2=yy/5.5,d2=a2*a2+b2*b2;
   let c;if(d2<1){c=C(d2<.3?'#5a90c0':'#3a6a9a');if((xx*2+yy*5+60)%17===0)c=C('#a8d0f0')}else c=B.tc(ST,yy<0?4:2);B.S(P,32+xx,40+yy,c)}
  // pali e tettoia
  for(const X of [6,54]){B.F(P,X,6,5,36,B.tc(WD,3));B.F(P,X,6,1,36,B.tc(WD,4));B.F(P,X+4,6,1,36,B.tc(WD,1))}
  B.F(P,6,9,52,3,B.tc(WD,3));B.F(P,6,9,52,1,B.tc(WD,4));
  B.F(P,31,12,1,12,C('#c9a060'));B.F(P,27,24,10,8,B.tc(WD,2));B.F(P,27,24,10,1,B.tc(WD,4));B.F(P,27,27,10,1,C('#3e3e46'));
  B.shingles(P,0,0,64,10,RF,{rowH:4,sw:6,ins:0,clip:clipBand(32,Y=>10+Y*2.2),noRidge:1})}),
 casetta:()=>GB(48,52,(P,B)=>{const WL=B.R6('#e8d8b8'),RF=B.R6('#a8402a'),TB=B.R6('#5a3a22');
  B.plaster(P,6,40,84,54,WL,{shadeX:X=>X>72?-1:0});B.timber(P,6,42,84,52,TB);
  for(let i=0;i<18;i++)B.dark(P,72+i,40,1,54,1-i*.012);
  B.plinth(P,4,94,88,10);
  B.windowPX(P,12,58,{glass:'#5a3a18',curtain:'#e8dcc0',w:16,h:14});B.windowPX(P,68,58,{glass:'#5a3a18',curtain:'#e8dcc0',w:16,h:14});
  // le finestre di chi ci abita: luce calda
  for(const X of [12,68])for(let Y=58;Y<72;Y++)for(let xx=0;xx<16;xx++)if(P.has(X+xx,Y))P.set(X+xx,Y,C('#ffc860'),70);
  B.doorPX(P,38,70,{w:20,h:24,col:'#6a3a1e'});
  B.ao(P,6,42,84,7);
  B.shingles(P,0,4,96,38,RF,{rowH:6,sw:8,ins:0,clip:clipBand(48,Y=>16+(Y-4)*.85),noRidge:1});
  for(let Y=4;Y<42;Y++){const h2=Math.round(16+(Y-4)*.85);B.S(P,48-h2,Y,B.tc(RF,1));B.S(P,47+h2,Y,B.tc(RF,1))}
  B.F(P,32,3,32,3,B.tc(RF,4));B.eave(P,2,40,92,RF);B.chimney(P,66,12,14)}),
 museo:()=>GB(64,52,(P,B)=>{const ST=B.R6('#a8a294'),MB=B.R6('#ece4d4'),RF=B.R6('#3a4a6a'),G=B.R6('#d8b04a');
  B.stones(P,6,38,116,58,ST,{rh:8,bw:16,shadeX:X=>X>104?-1:0});
  // finestre luminose
  for(const x of [26,102]){B.F(P,x-8,54,16,20,B.tc(MB,2));for(let Y=56;Y<72;Y++)for(let X=x-6;X<x+6;X++)B.S(P,X,Y,C(Y<60?'#fff0b0':'#ffd870'));B.F(P,x-1,56,2,16,B.tc(MB,3));B.F(P,x-9,74,18,2,B.tc(MB,4))}
  // porta
  B.F(P,52,62,24,36,B.tc(MB,1));B.F(P,54,66,20,32,B.tc(B.R6('#4a2a14'),2));for(let X=54;X<74;X+=5)B.F(P,X,66,1,32,B.tc(B.R6('#4a2a14'),1));B.F(P,52,62,24,4,B.tc(G,3));B.F(P,52,62,24,1,B.tc(G,5));B.S(P,70,82,B.tc(G,5));
  // colonne scanalate
  for(const x of [16,36,92,112]){for(let Y=44;Y<96;Y++)for(let X=x-4;X<x+4;X++){const k=X-(x-4);let t=k<2?4:k>5?2:3;if(k===3||k===6)t--;B.S(P,X,Y,B.tc(MB,t))}
   B.F(P,x-6,42,12,3,B.tc(MB,4));B.F(P,x-6,44,12,1,B.tc(MB,2));B.F(P,x-6,94,12,3,B.tc(MB,3));B.F(P,x-6,96,12,1,B.tc(MB,1))}
  // gradini
  for(let i=0;i<3;i++){const y=96+i*2;B.F(P,4-i*2+2,y,120+i*4-4,2,B.tc(MB,i===0?4:3));B.F(P,4-i*2+2,y+1,120+i*4-4,1,B.tc(MB,1))}
  // trabeazione e frontone
  B.F(P,8,34,112,8,B.tc(MB,3));B.F(P,8,34,112,1,B.tc(MB,5));B.F(P,8,41,112,1,B.tc(MB,1));for(let X=10;X<118;X+=6)B.F(P,X,37,3,3,B.tc(MB,2));
  for(let Y=10;Y<34;Y++){const h2=Math.round(8+(Y-10)*2.3);for(let X=64-h2;X<64+h2;X++){const edge=Math.abs(X+.5-64)>h2-5;B.S(P,X,Y,edge?B.tc(RF,((Y+X)%4===0)?1:(X<64?4:2)):B.tc(MB,X>64+h2*.5?2:3))}}
  // stemma nel timpano
  for(let yy=-5;yy<=5;yy++)for(let xx=-5;xx<=5;xx++){const d=xx*xx+yy*yy;if(d<=25)B.S(P,64+xx,25+yy,B.tc(G,d>16?1:(xx+yy<0?5:3)))}
  B.F(P,62,8,4,3,B.tc(G,4))}),
});
{const W=(name,keys,tgt)=>{const f=window[name];if(typeof f!=='function')return;window[name]=function(){const r=f.apply(this,arguments);for(const k of keys){try{tgt()[k]=ART2[k]()}catch(e){console.error(e)}}return r}};
 W('genAnimalArt',['pollaio','stalla'],()=>AIMG);W('genCostrArt',['serra','mulino','silos','pozzogrande'],()=>AIMG);W('genEspArt',['casetta'],()=>AIMG);W('genSempreArt',['museo'],()=>IMG)}

// ---------- oggetti costruibili piccoli ----------
const ART3={
 cassa:()=>GB(16,15,(P,B)=>{const W=B.R6('#9a6436'),I=B.R6('#4a4a54'),G=B.R6('#d8a84a');
  B.planks(P,3,13,26,15,W,{rowH:5,seam:13});for(let Y=6;Y<13;Y++){const ins=Y<8?2-(Y-6):0;for(let X=3+ins;X<29-ins;X++)B.S(P,X,Y,B.tc(W,Y===6?4:Y===12?1:(X>24?2:3)))}
  for(const X of [6,24]){B.F(P,X,6,2,22,B.tc(I,3));B.S(P,X,6,B.tc(I,5))}B.F(P,3,12,26,2,B.tc(I,2));
  B.F(P,13,10,6,7,B.tc(G,3));B.F(P,13,10,6,1,B.tc(G,5));B.F(P,15,13,2,2,C('#2a1a10'))}),
 banco:()=>GB(18,18,(P,B)=>{const W=B.R6('#9a6436'),D=B.R6('#5a3a1e'),I=B.R6('#6a6a72');
  for(const X of [4,28]){B.F(P,X,16,4,18,B.tc(D,3));B.F(P,X,16,1,18,B.tc(D,4));B.F(P,X+3,16,1,18,B.tc(D,1))}B.F(P,6,27,24,2,B.tc(D,2));
  B.planks(P,2,10,32,5,W,{rowH:5,seam:12});B.F(P,2,15,32,2,B.tc(W,1));
  B.F(P,5,4,10,6,B.tc(I,3));B.F(P,5,4,10,1,B.tc(I,5));B.F(P,8,2,4,2,B.tc(I,2));
  for(let i=0;i<10;i++){B.S(P,19+i,8,B.tc(I,4));if(i%2)B.S(P,19+i,9,B.tc(I,2))}B.F(P,28,6,4,4,B.tc(D,3));
  B.F(P,21,5,2,3,B.tc(D,4))}),
 apiario:()=>GB(14,18,(P,B)=>{const D=B.R6('#5a3a1e');
  for(const X of [5,21]){B.F(P,X,30,3,6,B.tc(D,3))}B.F(P,2,28,24,3,B.tc(D,3));B.F(P,2,28,24,1,B.tc(D,4));
  ['#e8c23a','#d8a83a','#e0b440'].forEach((c,i)=>{const R=B.R6(c),y=6+i*7;B.F(P,4,y,20,7,B.tc(R,3));B.F(P,4,y,20,1,B.tc(R,4));B.F(P,4,y+6,20,1,B.tc(R,1));B.F(P,21,y+1,3,5,B.tc(R,2));B.F(P,10,y+2,8,2,B.tc(R,1))});
  const RF=B.R6('#8a5a32');B.F(P,2,2,24,4,B.tc(RF,3));B.F(P,2,2,24,1,B.tc(RF,4));B.F(P,3,1,22,1,B.tc(RF,2));
  B.F(P,9,25,10,2,C('#1a1008'));for(const [x,y] of [[6,22],[22,14],[25,24],[1,12]]){B.S(P,x,y,C('#2a1a10'));B.S(P,x+1,y,C('#f0c83a'))}}),
 fornace:()=>GB(16,22,(P,B)=>{const ST=B.R6('#8a7a6a');
  B.stones(P,4,10,24,34,ST,{rh:5,bw:7,clip:(X,Y)=>Math.abs(X+.5-16)<=8+(Y-10)*.13,shadeX:X=>X>23?-1:X<9?1:0});
  for(let yy=0;yy<12;yy++)for(let xx=-6;xx<6;xx++){if(yy<4&&Math.abs(xx+.5)>Math.sqrt(16-(4-yy)*(4-yy))*1.5)continue;const d=Math.hypot(xx+.5,yy-8);B.S(P,16+xx,30+yy,C(d<2.5?'#fff0a0':d<5?'#ffb84a':'#d8601e'))}
  B.F(P,10,42,12,2,B.tc(ST,1));B.F(P,11,0,10,10,B.tc(B.R6('#5a4a3a'),3));B.F(P,11,0,2,10,B.tc(B.R6('#5a4a3a'),4));B.F(P,10,0,12,2,B.tc(B.R6('#5a4a3a'),2))}),
 botte:()=>GB(14,18,(P,B)=>{const W=B.R6('#9a6436'),I=B.R6('#4a4a54');
  for(let Y=2;Y<34;Y++){const hw=10+Math.sin((Y-2)/32*Math.PI)*3;for(let X=Math.round(14-hw);X<Math.round(14+hw);X++){const n=(X+.5-14)/hw,st=Math.floor((n+1)*4);let t=3;if(n<-.5)t=4;if(n>.4)t=2;if(n>.8)t=1;if(Math.abs(((n+1)*4)%1)<.18)t--;B.S(P,X,Y,B.tc(W,t))}}
  for(const y of [5,16,28]){const hw=10+Math.sin((y-2)/32*Math.PI)*3;for(let X=Math.round(14-hw);X<Math.round(14+hw);X++){const n=(X+.5-14)/hw;B.S(P,X,y,B.tc(I,n<-.3?4:n>.5?2:3));B.S(P,X,y+1,B.tc(I,1))}}
  B.F(P,7,2,14,1,B.tc(W,5))}),
 statua:()=>GB(14,28,(P,B)=>{const G=B.R6('#e8c040'),ST=B.R6('#9a968a');
  B.stones(P,3,42,22,14,ST,{rh:5,bw:8,mortar:1});B.F(P,1,40,26,3,B.tc(ST,4));B.F(P,1,42,26,1,B.tc(ST,2));B.F(P,1,54,26,2,B.tc(ST,2));
  const g=(X,Y,n)=>B.S(P,X,Y,B.tc(G,n<-.4?5:n<0?4:n>.55?2:3));
  for(let Y=14;Y<40;Y++){const hw=Y<22?4:4+(Y-22)*.22;for(let X=Math.round(14-hw);X<Math.round(14+hw);X++)g(X,Y,(X+.5-14)/hw)}
  for(let yy=-4;yy<=4;yy++)for(let xx=-4;xx<=4;xx++)if(xx*xx+yy*yy<=17)g(14+xx,8+yy,(xx-yy*.5)/4);
  for(const q of [-1,1])for(let i=0;i<10;i++){const X=Math.round(14+q*(4+i*.6)),Y=Math.round(17-i);g(X,Y,q*.5-.2);g(X+q,Y,q*.6)}
  for(let i=0;i<4;i++)B.S(P,12+i,14,B.tc(G,1))}),
};
{const Wk=(name,keys)=>{const f=window[name];if(typeof f!=='function')return;window[name]=function(){const r=f.apply(this,arguments);for(const k of keys){try{FREEIMG[k]=ART3[k]()}catch(e){console.error(e)}}return r}};
 Wk('genFreeArt',['cassa','banco']);Wk('genFarm2Art',['apiario','fornace','botte']);Wk('genTradeArt',['statua'])}

// ---------- foglie, petali e pollini nell'aria (solo all'aperto, di giorno) ----------
{const _amb=drawAmbTop;drawAmbTop=function(m){_amb(m);try{
  if(m.id!=='main'||!G.st||G.night>.5||G.horror>.6||G.st.weather==='pioggia'||G.st.weather==='neve')return;
  const s=typeof seasonOf==='function'?seasonOf(G.st):0;if(s!==3)return;const T=G.t,cx=G.cam.x,cy=G.cam.y,a=1-G.night*1.6;if(a<=0)return;
  const pal=s===0?['#d8742a','#e8a83a','#b8481e','#c89030']:s===2?['#f4c8d8','#fbeef2','#e8a8c0']:['#fff0b0','#f8e080'];
  const n=s===3?22:16;ctx.globalAlpha=a;
  for(let i=0;i<n;i++){const sp=s===3?3:9+(i%4)*2,x=cx+((i*131.7+T*(4+(i%3))+Math.sin(T*1.1+i)*14)%(W+40)+W+40)%(W+40)-20,y=cy+((i*71.3+T*sp)%(H+30))-15,c=pal[i%pal.length];
   if(s===3){const on=(Math.sin(T*2+i*1.7)+1)/2;if(on<.4)continue;ctx.fillStyle=c;ctx.globalAlpha=a*on*.8;ctx.fillRect(Math.round(x*2)/2,Math.round((y+Math.sin(T+i)*6)*2)/2,.5,.5);ctx.globalAlpha=a;continue}
   const r=Math.sin(T*3+i*2.1);ctx.fillStyle='rgba(40,20,10,.35)';ctx.fillRect(Math.round(x)+.5,Math.round(y)+1,r>0?1.5:.5,.5);ctx.fillStyle=c;
   if(r>.3)ctx.fillRect(Math.round(x),Math.round(y),2,1.5);else if(r>-.3)ctx.fillRect(Math.round(x),Math.round(y),1.5,1.5);else ctx.fillRect(Math.round(x),Math.round(y),1,2)}
  ctx.globalAlpha=1}catch(e){ctx.globalAlpha=1}}}

// ---------- ritratti: stesse espressioni, ombre a toni pieni come gli sprite ----------
{const _gp=genPortrait,_lit=lit,_pick=pickI;
 const celLit=(n,o)=>{const v=_lit(n,o);return v<.4?.18:v<.72?.5:v<.95?.68:.86};
 const celPick=(n,v)=>Math.min(n-1,Math.floor(clamp(v,0,.999)*n));
 genPortrait=function(L,mood){lit=celLit;pickI=celPick;try{return _gp(L,mood)}finally{lit=_lit;pickI=_pick}}}

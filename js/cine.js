'use strict';
// ================= CINEMATICHE: l'arrivo nella Valle =================
// Scene illustrate a tutto schermo (480×270, disegnate a mano in codice) e la diligenza sulla mappa.

// ---------- utilità di disegno ----------
const CX={
 rect(x,c,X,Y,w,h){x.fillStyle=c;x.fillRect(Math.round(X),Math.round(Y),Math.round(w),Math.round(h))},
 disc(x,c,X,Y,r){x.fillStyle=c;x.beginPath();x.arc(Math.round(X),Math.round(Y),r,0,7);x.fill()},
 ell(x,c,X,Y,rx,ry){x.fillStyle=c;x.beginPath();x.ellipse(Math.round(X),Math.round(Y),rx,ry,0,0,7);x.fill()},
 sky(x,stops,h=270){const g=x.createLinearGradient(0,0,0,h);stops.forEach(([o,c])=>g.addColorStop(o,c));x.fillStyle=g;x.fillRect(-240,0,960,270)},
 // profilo di colline: base y, ampiezza, frequenza, scorrimento
 hills(x,c,y,a,f,off,seed=0){x.fillStyle=c;x.beginPath();x.moveTo(-240,270);for(let X=-240;X<=720;X+=4){const u=(X+off)*f;x.lineTo(X,y-Math.sin(u+seed)*a-Math.sin(u*2.3+seed*1.7)*a*.35)}x.lineTo(720,270);x.fill()},
 pine(x,c,X,Y,h){x.fillStyle=c;x.beginPath();x.moveTo(X,Y-h);x.lineTo(X+h*.32,Y);x.lineTo(X-h*.32,Y);x.fill();x.fillRect(Math.round(X-1),Math.round(Y),2,3)},
 tree(x,X,Y,r,cols){for(let i=0;i<5;i++){const a=i*1.3;CX.disc(x,cols[i%cols.length],X+Math.cos(a)*r*.55,Y+Math.sin(a)*r*.35-r*.2,r*.7)}CX.rect(x,'#2a1810',X-1.5,Y+r*.3,3,r*.8)},
 glow(x,X,Y,r,c){const g=x.createRadialGradient(X,Y,0,X,Y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(X-r,Y-r,r*2,r*2)},
};
const hash1=n=>{n=Math.sin(n*127.1)*43758.5453;return n-Math.floor(n)};

// ---------- la diligenza vista di lato ----------
function coachSide(x,X,Y,s,t,o={}){const S=v=>v*s,R=(c,a,b,w,h)=>CX.rect(x,c,X+S(a),Y+S(b),S(w),S(h));
 const run=o.run!==false,dark=o.dark,wood=dark?'#24160e':'#4a2c18',wood2=dark?'#160c08':'#2e1a0e',trim=dark?'#6a5418':'#c9a03a',horse=dark?'#1e1410':'#5a3820',horse2=dark?'#120c08':'#3a2414';
 // cavalli (davanti, a destra)
 for(const [hx,ph] of [[62,0],[74,1.6]]){const g=run?Math.sin(t*14+ph):0,by=-2+(run?Math.abs(g)*-1.2:0);
  for(const [lx,lp] of [[0,0],[4,2],[11,1],[15,3]]){const k=run?Math.sin(t*14+ph+lp)*3:0;x.strokeStyle=horse2;x.lineWidth=S(1.6);x.beginPath();x.moveTo(X+S(hx+lx),Y+S(by+8));x.lineTo(X+S(hx+lx+k),Y+S(by+15));x.stroke()}
  CX.ell(x,horse,X+S(hx+8),Y+S(by+5),S(10),S(5));CX.ell(x,horse,X+S(hx+18),Y+S(by-1),S(3),S(5));CX.ell(x,horse,X+S(hx+21),Y+S(by-4),S(4.5),S(2.6));
  R(horse2,hx+14,by-6,3,5);R(horse2,hx-3,by+3,3,6)}
 // stanghe e redini
 R('#2a180c',44,6,22,1.4);x.strokeStyle='#1a0e08';x.lineWidth=S(.7);x.beginPath();x.moveTo(X+S(46),Y+S(-14));x.quadraticCurveTo(X+S(62),Y+S(-6),X+S(80),Y+S(-6));x.stroke();
 // cassa
 R(wood2,4,-24,42,30);R(wood,5,-23,40,27);R(trim,5,-23,40,1.6);R(trim,5,1,40,1.6);R(wood2,24,-21,1.2,22);
 // finestrino con luce calda
 R('#140a06',10,-19,11,10);R(o.lamp?'#ffd27a':'#6a5a4a',11,-18,9,8);if(o.lamp)CX.glow(x,X+S(15),Y+S(-14),S(18),'rgba(255,200,110,.35)');R(wood2,15,-18,1,8);
 R('#140a06',28,-19,11,10);R(o.lamp?'#f2c068':'#5a4a3a',29,-18,9,8);
 // tetto e bagagli
 R(wood2,2,-27,46,4);R('#6a4a2a',10,-34,18,7);R('#8a6a3a',11,-33,16,2);R('#3a2414',18,-34,1.4,7);R('#5a3a24',30,-32,10,5);
 // cocchiere: cappotto, cilindro
 R('#1c1a22',44,-22,8,12);R('#d8b898',46,-27,5,5);R('#0e0c10',45,-33,7,6);R('#0e0c10',43,-28,11,1.6);
 if(o.lamp){R('#3a2a14',52,-16,3,5);R('#ffd27a',52.6,-15,1.8,3);CX.glow(x,X+S(53.5),Y+S(-13),S(14),'rgba(255,190,90,.45)')}
 // ruote con raggi che girano
 for(const [wx,r] of [[12,9],[38,7]]){const cx=X+S(wx),cy=Y+S(6),a=run?-t*9:0;CX.disc(x,'#1a0e08',cx,cy,S(r));CX.disc(x,trim,cx,cy,S(r-1.3));CX.disc(x,'#1a0e08',cx,cy,S(r-2.6));
  x.strokeStyle=trim;x.lineWidth=S(1);for(let k=0;k<6;k++){const b=a+k*Math.PI/3;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(b)*S(r-2),cy+Math.sin(b)*S(r-2));x.stroke()}CX.disc(x,trim,cx,cy,S(1.6))}
}

// ---------- le inquadrature ----------
const SHOTS={
 // 1. strada di campagna al tramonto, la diligenza corre
 strada(x,t){CX.sky(x,[[0,'#1c1a3a'],[.35,'#5a3a5a'],[.6,'#d8704a'],[.72,'#f0b060']],170);
  CX.disc(x,'#ffd890',372,128,20);CX.disc(x,'#ffecb8',372,128,14);
  for(let i=0;i<5;i++){const cy=40+i*14,cx=((i*137-t*4)%600+600)%600-60;CX.ell(x,'rgba(255,190,150,.18)',cx,cy,46,4)}
  CX.hills(x,'#4a2e4a',150,10,.012,t*5,1);CX.hills(x,'#3a2236',162,8,.02,t*12,3);
  // alberi autunnali sulla collina di mezzo
  for(let i=0;i<14;i++){const X=((i*53-t*22)%742+742)%742-130,Y=168+Math.sin(i)*4;CX.tree(x,X,Y,9+(i%3)*2,i%3?['#c0501c','#e08a2a','#8a2e14']:['#d8a83a','#b8701c','#e8c058'])}
  CX.hills(x,'#2e1c18',190,4,.03,t*30,5);
  CX.rect(x,'#6a4428',-240,196,960,32);CX.rect(x,'#5a3820',-240,206,960,2);CX.rect(x,'#7a5232',-240,198,960,2);CX.rect(x,'#4a2e1a',-240,220,960,3);
  for(let i=0;i<22;i++){const X=((i*34-t*70)%748+748)%748-134;CX.rect(x,'#3a2414',X,186,3,12);CX.rect(x,'#e8c23a',X-1,186,5,2)}
  const bob=Math.round(Math.sin(t*14)*1);coachSide(x,150,200+bob,1.5,t,{run:1});
  for(let i=0;i<10;i++){const k=(t*1.7+i*.1)%1;CX.disc(x,`rgba(200,160,110,${(.5*(1-k)).toFixed(2)})`,150-k*60+Math.sin(i)*6,214-k*10,2+k*5)}
  CX.rect(x,'#1a100c',-240,228,960,42);for(let i=0;i<26;i++){const X=((i*29-t*110)%754+754)%754-137;x.fillStyle='#24160e';x.beginPath();x.moveTo(X,232);x.lineTo(X+3,220-(i%4)*3);x.lineTo(X+6,232);x.fill()}},
 // 2. il bosco nero: la lanterna del cocchiere è l'unica luce
 bosco(x,t){CX.sky(x,[[0,'#0a0c16'],[1,'#1a1a28']]);
  for(let l=0;l<3;l++){const sp=[8,20,45][l],col=['#141622','#0e0f18','#07080c'][l],base=[170,190,215][l],h=[70,95,130][l];
   for(let i=0;i<26;i++){const X=((i*31+l*13-t*sp)%806+806)%806-163;CX.pine(x,col,X,base+hash1(i+l*9)*10,h*(.7+hash1(i*3+l)*.5))}}
  CX.rect(x,'#0c0a0c',-240,205,960,65);CX.rect(x,'#18120e',-240,212,960,14);
  const X=200+Math.sin(t*.5)*6;CX.glow(x,X+80,190,90,'rgba(255,190,90,.22)');coachSide(x,X,218+Math.round(Math.sin(t*12)),1.3,t,{run:1,dark:1,lamp:1});
  for(let i=0;i<3;i++){const ft=(t*.6+i*.4)%1;CX.ell(x,`rgba(170,180,200,${(.12*(1-Math.abs(ft-.5)*2)).toFixed(3)})`,((i*170+t*14)%640)-80,200+i*8,120,7)}
  // occhi tra gli alberi
  if(t>2.4){const a=Math.min(1,(t-2.4)*.8)*(Math.sin(t*3)>-.6?1:0);for(const [ex,ey] of [[60,150],[402,138]]){CX.rect(x,`rgba(255,220,140,${a.toFixed(2)})`,ex,ey,2,1);CX.rect(x,`rgba(255,220,140,${a.toFixed(2)})`,ex+5,ey,2,1)}}
  // corvi che si alzano
  for(let i=0;i<4;i++){const k=((t-.8)*.5+i*.12);if(k<0||k>1)continue;const cx=250+i*30+k*160,cy=150-k*120-i*6,w=Math.sin(t*14+i)*3;x.fillStyle='#050508';x.beginPath();x.moveTo(cx-6,cy-w);x.lineTo(cx,cy);x.lineTo(cx+6,cy-w);x.lineTo(cx,cy+2);x.fill()}},
 // 3. la Valle vista dalla collina, le lanterne si accendono tutte insieme
 valle(x,t){CX.sky(x,[[0,'#1e2040'],[.45,'#6a4a6a'],[.62,'#e08850']],150);
  CX.hills(x,'#2a2034',96,8,.01,0,2);
  // anello di bosco nero
  x.fillStyle='#0c0e10';x.beginPath();x.ellipse(240,190,250,96,0,0,7);x.fill();
  for(let i=0;i<70;i++){const a=i/70*Math.PI*2,X=240+Math.cos(a)*236,Y=186+Math.sin(a)*86;if(Y<100)continue;CX.pine(x,'#0a0b0e',X,Y,18+hash1(i)*14)}
  // fondovalle
  const g=x.createRadialGradient(240,190,10,240,190,190);g.addColorStop(0,'#7a6a3a');g.addColorStop(.7,'#5a4a28');g.addColorStop(1,'#3a3020');x.fillStyle=g;x.beginPath();x.ellipse(240,192,190,66,0,0,7);x.fill();
  // fiume e ponte
  x.strokeStyle='#3a5a6a';x.lineWidth=4;x.beginPath();x.moveTo(52,236);x.quadraticCurveTo(240,226,430,238);x.stroke();CX.rect(x,'#6a4a2a',236,224,10,10);
  // recinto giallo
  x.strokeStyle='#e8c23a';x.lineWidth=1.5;x.setLineDash([3,2]);x.beginPath();x.ellipse(240,190,176,58,0,0,7);x.stroke();x.setLineDash([]);
  // campi, case, cappella, fienile rosso
  for(let i=0;i<6;i++)CX.rect(x,i%2?'#6a4a24':'#7a5a2a',96+i*9,196,8,14);
  const houses=[[170,172],[206,166],[290,170],[320,182],[188,200],[268,204],[230,180]];
  houses.forEach(([hx,hy],i)=>{CX.rect(x,'#c8b48a',hx,hy,12,8);x.fillStyle=i%2?'#5a3a2a':'#4a3a3a';x.beginPath();x.moveTo(hx-2,hy);x.lineTo(hx+6,hy-6);x.lineTo(hx+14,hy);x.fill()});
  CX.rect(x,'#d8ccb0',246,150,12,16);x.fillStyle='#3a3040';x.beginPath();x.moveTo(244,150);x.lineTo(252,124);x.lineTo(260,150);x.fill();CX.rect(x,'#e8c23a',251,118,2,7);
  CX.rect(x,'#8a1a14',344,160,18,12);x.fillStyle='#5a0e0a';x.beginPath();x.moveTo(342,160);x.lineTo(353,150);x.lineTo(364,160);x.fill();
  // le lanterne si accendono, una dopo l'altra, troppo in fretta
  const L=[[178,182],[214,176],[298,180],[328,192],[196,210],[276,214],[238,190],[160,196],[310,200],[258,168],[226,206],[350,176]];
  L.forEach(([lx,ly],i)=>{const on=t>1.2+i*.12;if(!on)return;const fl=.8+Math.sin(t*9+i)*.2;CX.glow(x,lx,ly,9,`rgba(255,200,90,${(.5*fl).toFixed(2)})`);CX.rect(x,'#ffe08a',lx,ly,2,2)});
  // nebbia che sale dal fondovalle
  for(let i=0;i<4;i++)CX.ell(x,'rgba(210,200,220,.07)',((i*140+t*10)%700)-110,214+i*6,140,8);
  // chi guarda (noi): un ramo in primo piano
  x.fillStyle='#050404';x.beginPath();x.moveTo(0,0);x.lineTo(130,0);x.quadraticCurveTo(70,20,0,46);x.fill();for(let i=0;i<9;i++)CX.disc(x,'#3a120a',20+i*12,8+Math.sin(i)*6,3)},
 // 4. il ponte: la diligenza si ferma, il cocchiere non scende
 ponte(x,t){CX.sky(x,[[0,'#151a30'],[.5,'#3a2a44'],[.8,'#8a4a3a']],190);
  for(let i=0;i<36;i++)CX.pine(x,'#0c0d12',i*20-110,170+hash1(i)*8,60+hash1(i*7)*40);
  CX.rect(x,'#141018',-240,168,960,102);
  // fiume nero
  CX.rect(x,'#0a1418',290,206,430,26);for(let i=0;i<8;i++){const X=300+((i*47+t*20)%400);CX.rect(x,'rgba(150,180,200,.25)',X,212+(i%3)*5,10,1)}
  CX.rect(x,'#1c1612',-240,200,530,70);CX.rect(x,'#2a2018',-240,200,530,3);
  // ponte di legno
  CX.rect(x,'#3a2414',300,198,150,8);CX.rect(x,'#5a3a20',300,196,150,3);for(let i=0;i<8;i++)CX.rect(x,'#2a180c',304+i*19,198,3,30);
  CX.rect(x,'#5a3a20',300,182,3,16);CX.rect(x,'#5a3a20',446,182,3,16);CX.rect(x,'#4a2e18',300,184,150,2);
  // un lampione giallo, oltre il ponte
  CX.rect(x,'#2a2a30',460,140,2,56);CX.rect(x,'#ffd27a',457,136,8,6);CX.glow(x,461,140,26,'rgba(255,200,100,.35)');
  // la diligenza ferma; i cavalli scalpitano
  const stop=Math.min(1,t/2.2),X=20+stop*140;coachSide(x,X,176,1.6,t*(1-stop)+(stop>=1?0:0),{run:stop<1,lamp:1});
  if(stop>=1){const k=Math.sin(t*6);CX.rect(x,'#3a2414',X+1.6*76,176-1.6*8+k,2,2)}
  // la valigia a terra
  if(t>3){CX.rect(x,'#6a4a2a',X+8,206,14,9);CX.rect(x,'#8a6a3a',X+8,206,14,2);CX.rect(x,'#e8c23a',X+14,204,3,2)}
  },
};

// ---------- player delle cinematiche ----------
const CINE={on:false};
function cinePlay(shots){return new Promise(res=>{
 let el=document.getElementById('cine');
 if(!el){el=document.createElement('div');el.id='cine';el.innerHTML='<canvas width="480" height="270"></canvas><div class="ccap"></div><button class="cskip">Salta ›</button>';document.getElementById('stage').appendChild(el)}
 const cv2=el.querySelector('canvas'),x=cv2.getContext('2d'),cap=el.querySelector('.ccap');x.imageSmoothingEnabled=false;
 let i=-1,t=0,last=performance.now(),typ=0,full='',iv=null,done=false;CINE.on=true;el.classList.remove('hide');el.style.opacity=1;
 const next=()=>{i++;if(i>=shots.length)return end();t=0;typ=0;full=fmt(shots[i].cap||'');cap.textContent='';cap.classList.remove('done');if(shots[i].sfx)AU.play(shots[i].sfx)};
 const end=()=>{if(done)return;done=true;cancelAnimationFrame(iv);el.style.opacity=0;setTimeout(()=>{el.classList.add('hide');CINE.on=false;res()},450)};
 const frame=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;const s=shots[i];if(!s)return;
  if(cv2.width!==W){cv2.width=W;x.imageSmoothingEnabled=false}x.save();x.translate(Math.round((W-480)/2),0);SHOTS[s.k](x,t);x.restore();
  // dissolvenza d'ingresso di ogni inquadratura
  if(t<.6){x.fillStyle=`rgba(0,0,0,${(1-t/.6).toFixed(2)})`;x.fillRect(0,0,cv2.width,270)}
  if(typ<full.length){typ=Math.min(full.length,typ+dt*38);cap.textContent=full.slice(0,Math.floor(typ));if(Math.floor(typ)%5===0)AU.play('blip')}else cap.classList.add('done');
  if(t>=(s.dur||6)&&typ>=full.length)next();
  if(!done)iv=requestAnimationFrame(frame)};
 el.onpointerdown=e=>{e.stopPropagation();if(e.target.classList.contains('cskip')){AU.play('ui');return end()}if(typ<full.length){typ=full.length;cap.textContent=full}else next()};
 CINE.key=e=>{if(!CINE.on)return;if(e.code==='Escape')end();else if(e.code==='Space'||e.code==='Enter'||e.code==='KeyE'){if(typ<full.length){typ=full.length;cap.textContent=full}else next()}};
 next();iv=requestAnimationFrame(frame)})}
addEventListener('keydown',e=>{if(CINE.key)CINE.key(e)},true);

async function arrivalCinematic(){G.cutMusic='title';
 await cinePlay([
  {k:'strada',dur:6.5,sfx:'hooves',cap:'Tre giorni di viaggio. L\'ultimo paese con un nome è rimasto indietro all\'alba.'},
  {k:'bosco',dur:6.5,cap:'Poi il bosco. Il cocchiere ha smesso di fischiettare. I cavalli non vogliono più correre, e corrono lo stesso.'},
  {k:'valle',dur:7.5,cap:'Hollowmere. Da lassù sembra un presepe dentro un recinto giallo. Le lanterne si accendono tutte insieme, come occhi.'},
  {k:'ponte',dur:6.5,sfx:'hooves',cap:'La diligenza si ferma prima del ponte. Il cocchiere non scende nemmeno.'},
 ])}

// ---------- la diligenza sulla mappa (vista dall'alto, già girata per ripartire) ----------
let COACH_IMG=null;
function coachTopImg(){if(COACH_IMG)return COACH_IMG;
 const mk1=(ph)=>SP(36,62,P=>{const wood=rp('#4a2c18'),dk=rp('#2a1a10'),tr=rp('#c9a03a'),hs=rp('#5a3820'),hs2=rp('#3a2414');
  // ruote ai lati
  for(const wx of [7,65])for(const wy of [22,52])P.ellipse(wx,wy,3.2,9,tr,{spec:.5});
  // cassa e tetto con bagagli
  P.rect(10,4,52,60,wood,{mod:woodMod});P.rect(8,2,56,8,dk);P.rect(18,12,36,22,rp('#6a4a2a'),{spec:.2});P.rect(20,14,32,3,rp('#8a6a3a'));P.rect(35,12,2,22,dk);
  P.rect(10,64,52,6,dk);P.rect(12,36,48,2,tr);
  // cocchiere a cassetta
  P.ellipse(36,74,9,7,rp('#22202a'),{spec:.2});P.ellipse(36,70,6,6,rp('#0e0c12'),{spec:.6});P.ellipse(36,70,9,2.6,rp('#0e0c12'));
  // stanghe e cavalli verso il basso
  P.rect(22,74,2,30,hs2);P.rect(48,74,2,30,hs2);
  for(const [hx,o] of [[26,ph],[46,-ph]]){P.ellipse(hx,96+o,7.4,15,hs,{spec:.3});P.capsule(hx,108+o,hx,118+o,3.6,hs,{r2:3});P.capsule(hx,86+o,hx,104+o,1.4,hs2)}
  // lanterne
  P.rect(9,62,4,5,rp('#ffd27a'),{amb:.95,edge:false});P.rect(59,62,4,5,rp('#ffd27a'),{amb:.95,edge:false})});
 COACH_IMG=[mk1(0),mk1(1.5)];return COACH_IMG}
function drawCoach(){const c=G.coach;if(!c)return;const fr=coachTopImg()[c.moving?Math.floor(G.t*6)%2:0],X=Math.round(c.x-18),Y=Math.round(c.y-62);
 ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(X+3,Y+58,30,4);ctx.drawImage(fr,X,Y,36,62);
 if(G.night>.2){ctx.fillStyle='rgba(255,200,110,.18)';ctx.fillRect(X-3,Y+28,12,10);ctx.fillRect(X+27,Y+28,12,10)}}
async function coachLeave(){const c=G.coach;if(!c)return;c.moving=true;AU.play('hooves');const t0=performance.now();
 await new Promise(r=>{const step=()=>{const k=(performance.now()-t0)/1000;c.y+=1.2+k*.6;if(Math.random()<.15)AU.play('hooves');if(c.y>48*16+90){G.coach=null;r();return}requestAnimationFrame(step)};step()})}

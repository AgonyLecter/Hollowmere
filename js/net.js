'use strict';
// ================= RETE (Firebase Realtime Database, nodo "hollowmere") =================
const FBCFG={apiKey:"AIzaSyBiKEfo1c7c12kAYxlRuZNjh-Spz4W1Tbw",authDomain:"wandertutto.firebaseapp.com",databaseURL:"https://wandertutto-default-rtdb.europe-west1.firebasedatabase.app",projectId:"wandertutto",storageBucket:"wandertutto.firebasestorage.app",messagingSenderId:"933606082300",appId:"1:933606082300:web:3ef3d5e1a233f86f7f3979",measurementId:"G-0Z5BRG4X4Z"};
const NET={ok:false,api:null,db:null,regNames:[],heirs:[],msgs:[],count:0,ROOT:'hollowmere',
 async init(){
  try{const v='10.12.5',B=`https://www.gstatic.com/firebasejs/${v}/`;
   const to=new Promise((_,r)=>setTimeout(()=>r(new Error('timeout')),8000));
   const [A,D]=await Promise.race([Promise.all([import(B+'firebase-app.js'),import(B+'firebase-database.js')]),to]);
   const app=A.initializeApp(FBCFG,'hollowmere');this.api=D;this.db=D.getDatabase(app);
   await Promise.race([D.get(D.ref(this.db,'.info/serverTimeOffset')),to]);
   this.ok=true;import(B+'firebase-analytics.js').then(an=>{try{an.getAnalytics(app)}catch(e){}}).catch(()=>{});
   this.listen();
  }catch(e){this.ok=false;console.warn('Hollowmere offline:',e&&e.message)}
  if(!this.ok){try{this.msgs=JSON.parse(LS.get('hm_lap')||'[]')}catch(e){}}
  this.status()},
 r(p){return this.api.ref(this.db,this.ROOT+'/'+p)},
 listen(){const D=this.api;
  D.onValue(D.query(this.r('registro'),D.limitToLast(40)),s=>{const v=s.val()||{};this.regNames=Object.values(v).map(o=>String(o&&o.name||'').slice(0,20));this.status()},()=>{});
  D.onValue(D.query(this.r('lapidi'),D.limitToLast(20)),s=>{const v=s.val()||{};this.msgs=Object.values(v).filter(Boolean).sort((a,b)=>(a.ts||0)-(b.ts||0)).map(o=>({t:String(o.t||'').slice(0,80),n:String(o.n||'').slice(0,20)}));UI.refreshNameless&&UI.refreshNameless()},()=>{});
  D.onValue(D.query(this.r('eredi'),D.limitToLast(5)),s=>{const v=s.val()||{};this.heirs=Object.values(v).map(o=>String(o&&o.name||'').slice(0,20)).filter(Boolean)},()=>{});
  D.onValue(this.r('stats/arrivi'),s=>{this.count=s.val()||0;this.status()},()=>{})},
 status(){$('#tnet').textContent=this.ok?'● La Valle è in ascolto (online)':'○ Modalità offline · salvataggi su questo dispositivo';$('#tcount').textContent=this.ok?`Nuovi arrivati a Hollowmere: ${this.count}`:''},
 async save(st){if(G.visit)return;st.ts=Date.now();MP.publish(st);LS.set('hm_save',JSON.stringify(st));if(st.pid)LS.set('hm_pid',st.pid);if(!this.ok||!st.pid)return;
  try{await this.api.set(this.r('players/'+st.pid),{name:st.name,day:st.day,ch:st.chapter,ts:st.ts,save:JSON.stringify(st)})}catch(e){console.warn(e)}},
 async load(pid){if(!this.ok)return null;try{const s=await this.api.get(this.r('players/'+pid));const v=s.val();return v&&v.save?JSON.parse(v.save):null}catch(e){return null}},
 async register(name){if(!this.ok)return;try{await this.api.push(this.r('registro'),{name:name.slice(0,20),ts:Date.now()});await this.api.runTransaction(this.r('stats/arrivi'),c=>(c||0)+1)}catch(e){console.warn(e)}},
 async heir(name){if(!this.ok)return;try{await this.api.push(this.r('eredi'),{name:String(name).slice(0,20),ts:Date.now()})}catch(e){}},
 async carve(t,n){const m={t:t.slice(0,80),n:(n||'').slice(0,20),ts:Date.now()};
  if(!this.ok){this.msgs.push(m);this.msgs=this.msgs.slice(-20);LS.set('hm_lap',JSON.stringify(this.msgs));return}
  try{await this.api.push(this.r('lapidi'),m)}catch(e){UI.toast('La pietra non si lascia incidere.','bad')}},
};
function newPid(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='HM-';for(let i=0;i<6;i++)s+=A[Math.random()*A.length|0];return s}

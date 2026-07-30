// @ts-nocheck
// Firebase is loaded from Google CDN so the compiled site can be hosted as static files.
// @ts-ignore: CDN ESM imports are resolved by the browser at runtime.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
// @ts-ignore: CDN ESM imports are resolved by the browser at runtime.
import { getFirestore, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

type DriveBuddyWindow = Window & typeof globalThis & {
  _db?: unknown;
  _addDoc?: typeof addDoc;
  _collection?: typeof collection;
  _serverTimestamp?: typeof serverTimestamp;
  _firebaseReady?: boolean;
  toggleDrawer: () => void;
  toggleFaq: (el: HTMLElement) => void;
  resetForm: () => void;
  scrollToBook: (pkg: string) => void;
  autoResize: (el: HTMLElement) => void;
  resetDriverForm: () => void;
  toggleChat: () => void;
  sendQuick: (text: string) => void;
  sendMsg: () => Promise<void>;
};

const appWindow = window as DriveBuddyWindow;
const WORKER_URL = "";

const firebaseConfig={apiKey:"AIzaSyCIGiv764yafx3HsmmbwpQuolKQcm64Ulo",authDomain:"drive-buddy-acc4c.firebaseapp.com",projectId:"drive-buddy-acc4c",storageBucket:"drive-buddy-acc4c.firebasestorage.app",messagingSenderId:"56159522240",appId:"1:56159522240:web:d8454bea63494f064dcc25"};
const app=initializeApp(firebaseConfig);const db=getFirestore(app);
appWindow._db=db;appWindow._addDoc=addDoc;appWindow._collection=collection;appWindow._serverTimestamp=serverTimestamp;appWindow._firebaseReady=true;
document.getElementById('bookingForm').addEventListener('submit',async function(e){
  e.preventDefault();let valid=true;
  const checks=[{id:'f_pickup',err:'e_pickup',fn:v=>v.trim().length>1},{id:'f_pkg',err:'e_pkg',fn:v=>v!==''},{id:'f_name',err:'e_name',fn:v=>v.trim().length>1},{id:'f_phone',err:'e_phone',fn:v=>/^\d{10}$/.test(v)}];
  checks.forEach(c=>{const el=document.getElementById(c.id);const err=document.getElementById(c.err);if(!c.fn(el.value)){el.style.borderColor='var(--red)';err.style.display='block';valid=false;}else{el.style.borderColor='';err.style.display='none';}});
  if(!valid)return;
  const btn=document.getElementById('submitBtn');btn.disabled=true;btn.innerHTML='<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite"></span> Saving…';
  const data={pickup:document.getElementById('f_pickup').value.trim(),destination:document.getElementById('f_drop').value.trim(),package:document.getElementById('f_pkg').value,name:document.getElementById('f_name').value.trim(),phone:document.getElementById('f_phone').value.trim(),datetime:document.getElementById('f_dt').value||null,notes:document.getElementById('f_notes').value.trim(),status:'new',source:'website',createdAt:serverTimestamp()};
  try{await addDoc(collection(db,'bookings'),data);showToast('✅ Booking saved!');showBookingSuccess(data.phone);}
  catch(err){showToast('⚠️ Could not save — opening WhatsApp',true);window.open('https://wa.me/919111473929?text='+encodeURIComponent(buildWAMsg()),'_blank');btn.disabled=false;btn.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> Confirm Booking Request';}
});
document.getElementById('driverForm').addEventListener('submit',async function(e){
  e.preventDefault();let valid=true;
  const checks=[{id:'d_name',err:'de_name',fn:v=>v.trim().length>1},{id:'d_phone',err:'de_phone',fn:v=>/^\d{10}$/.test(v)},{id:'d_city',err:'de_city',fn:v=>v!==''}];
  checks.forEach(c=>{const el=document.getElementById(c.id);const err=document.getElementById(c.err);if(!c.fn(el.value)){el.style.borderColor='var(--red)';err.style.display='block';valid=false;}else{el.style.borderColor='';err.style.display='none';}});
  if(!valid)return;
  const btn=document.getElementById('driverSubmitBtn');btn.disabled=true;btn.innerHTML='<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite"></span> Submitting…';
  const data={name:document.getElementById('d_name').value.trim(),phone:document.getElementById('d_phone').value.trim(),city:document.getElementById('d_city').value,experience:document.getElementById('d_exp').value||null,license:document.getElementById('d_license').value.trim().toUpperCase()||null,notes:document.getElementById('d_notes').value.trim()||null,status:'pending',source:'website',createdAt:serverTimestamp()};
  try{await addDoc(collection(db,'drivers'),data);showToast('🚗 Application submitted!');showDriverSuccess(data.name,data.city);}
  catch(err){showToast('❌ Submission failed.',true);btn.disabled=false;btn.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> Submit Driver Application';}
});

const ss=document.createElement('style');ss.textContent='@keyframes spin{to{transform:rotate(360deg)}}';document.head.appendChild(ss);

/* ══ SPLASH ══ */
(function(){
  const splash=document.getElementById('splashScreen');
  if(splash)splash.remove();
  document.body.classList.remove('splash-active');
  document.body.classList.add('site-ready');
})();

/* ══ SCROLL + ROAD ANIMATION ══ */
window.addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  const p=max>0?(scrollY/max)*100:0;
  const scrollBar=document.getElementById('scrollBar');
  const nav=document.getElementById('nav');
  if(scrollBar)scrollBar.style.width=p+'%';
  if(nav)nav.classList.toggle('scrolled',scrollY>50);
},{passive:true});

/* ══ CURSOR GLOW ══ */
/* Disabled for smoother scrolling. */

/* ══ DRAWER ══ */
function toggleDrawer(){const h=document.getElementById('hamburger');const d=document.getElementById('drawer');const b=document.getElementById('drawerBg');const o=d.classList.toggle('open');b.classList.toggle('open',o);h.classList.toggle('open',o);document.body.style.overflow=o?'hidden':'';}

/* ══ TOAST ══ */
function showToast(msg,isError=false){const t=document.getElementById('toast');t.textContent=msg;t.className='toast'+(isError?' error':'');t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}

/* ══ REVEAL OBSERVER ══ */
const revObs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});},{threshold:0.08,rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.reveal,.reveal-left').forEach(el=>revObs.observe(el));

/* ══ COUNTERS ══ */
function countUp(el,target){const isMin=el.closest('.stat-item').querySelector('.stat-l').textContent.includes('Min');let n=0;const step=target/1800*16;const id=setInterval(()=>{n=Math.min(n+step,target);el.textContent=Math.floor(n)+(isMin?'min':'+');if(n>=target)clearInterval(id);},16);}
const cObs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&e.target.dataset.target){countUp(e.target,+e.target.dataset.target);cObs.unobserve(e.target);}})},{threshold:0.5});
document.querySelectorAll('[data-target]').forEach(el=>cObs.observe(el));

/* ══ FAQ ══ */
function toggleFaq(q){q.parentElement.classList.toggle('open');}

/* ══ SCROLL TO BOOK ══ */
function scrollToBook(pkg){document.getElementById('f_pkg').value=pkg;document.getElementById('bookCard').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>document.getElementById('f_pickup').focus(),600);}
document.getElementById('f_dt').min=new Date().toISOString().slice(0,16);

/* ══ WA MESSAGE ══ */
function buildWAMsg(){const p=document.getElementById('f_pickup').value;const d=document.getElementById('f_drop').value;const pk=document.getElementById('f_pkg').value;const n=document.getElementById('f_name').value;const ph=document.getElementById('f_phone').value;return `🚗 *DriveBuddy Booking*\n\n👤 Name: ${n||'Not entered'}\n📱 Phone: ${ph||'Not entered'}\n📍 Pickup: ${p||'Not entered'}\n🎯 Drop: ${d||'Not specified'}\n⏱ Package: ${pk||'Not selected'}\n\n_From DriveBuddy website_`;}
document.getElementById('waAltBtn').addEventListener('click',function(){this.href='https://wa.me/919111473929?text='+encodeURIComponent(buildWAMsg());});

/* ══ FORM SUCCESS ══ */
function showBookingSuccess(phone){document.getElementById('successPhone').textContent=phone;document.getElementById('waFollowBtn').href='https://wa.me/919111473929?text='+encodeURIComponent(buildWAMsg());document.getElementById('bookFormWrap').style.display='none';document.getElementById('bookSuccess').style.display='block';}
function resetForm(){document.getElementById('bookSuccess').style.display='none';document.getElementById('bookFormWrap').style.display='block';document.getElementById('bookingForm').reset();document.getElementById('f_dt').min=new Date().toISOString().slice(0,16);const btn=document.getElementById('submitBtn');btn.disabled=false;btn.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> Confirm Booking Request';}
function showDriverSuccess(name,city){document.getElementById('driverSuccessName').textContent=name;document.getElementById('driverSuccessCity').textContent=city;document.getElementById('driverFormWrap').style.display='none';document.getElementById('driverSuccess').style.display='block';}
function resetDriverForm(){document.getElementById('driverSuccess').style.display='none';document.getElementById('driverFormWrap').style.display='block';document.getElementById('driverForm').reset();const btn=document.getElementById('driverSubmitBtn');btn.disabled=false;btn.innerHTML='<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> Submit Driver Application';}

/* ══ PHONE VALIDATION ══ */
document.getElementById('f_phone').addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,10);});
document.getElementById('d_phone').addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,10);});

/* ══ RIPPLE ══ */
document.querySelectorAll('.btn,.submit-btn,.pc-btn,.d-call,.d-wa').forEach(btn=>{btn.addEventListener('click',function(e){const r=document.createElement('span');r.className='ripple';const rect=this.getBoundingClientRect();const size=Math.max(rect.width,rect.height);r.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;this.appendChild(r);setTimeout(()=>r.remove(),600);});});

/* ══ HERO CANVAS ══ */
(function(){
  const canvas=document.getElementById('heroCanvas');
  if(canvas)canvas.remove();
})();

/* ══ MAGNETIC BTNS ══ */
/* Disabled: simple hover states only. */

/* ══ AI CHAT ══ */
const SYSTEM=`You are the AI assistant for DriveBuddy — Chhattisgarh's first driver-on-demand platform. Contact: 9111473929. Cities: Raipur, Bhilai, Durg, Bilaspur. Prices: 1hr ₹300, 3hr ₹600, Full Day ₹1000-1200, Outstation ₹1200-1500, Night ₹500. All drivers police-verified, breathalyzer tested, 5+ years experience. Available 24x7. Be warm, concise, helpful. Reply in same language as user (Hindi or English).`;
let chatStreaming=false;
document.getElementById('initTime').textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
function getT(){return new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});}
function autoResize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,90)+'px';}
function toggleChat(){const p=document.getElementById('chatPanel');const isOpen=p.classList.toggle('open');if(isOpen)setTimeout(()=>document.getElementById('chatInp').focus(),400);}

const HEAD_SRC_JS = "data:image/png;base64,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";
function addMsg(text,role){
  const msgs=document.getElementById('chatMsgs');const wrap=document.createElement('div');wrap.className='msg-wrap '+(role==='bot'?'bot-wrap':'user-wrap');
  if(role==='bot'){
    const av=document.createElement('div');av.className='mini-av';
    const avImg=document.createElement('img');avImg.src=HEAD_SRC_JS;avImg.alt='bot';av.appendChild(avImg);
    const inner=document.createElement('div');const d=document.createElement('div');d.className='msg bot';d.innerHTML=text;const t=document.createElement('div');t.className='msg-time';t.textContent=getT();inner.appendChild(d);inner.appendChild(t);wrap.appendChild(av);wrap.appendChild(inner);
  }else{
    const inner=document.createElement('div');const d=document.createElement('div');d.className='msg user';d.textContent=text;const t=document.createElement('div');t.className='msg-time';t.textContent=getT();inner.appendChild(d);inner.appendChild(t);wrap.appendChild(inner);
  }
  msgs.appendChild(wrap);msgs.scrollTop=msgs.scrollHeight;return wrap.querySelector('.msg');
}
function addTyping(){
  const msgs=document.getElementById('chatMsgs');const wrap=document.createElement('div');wrap.className='msg-wrap bot-wrap';wrap.id='typWrap';
  const av=document.createElement('div');av.className='mini-av';const avImg=document.createElement('img');avImg.src=HEAD_SRC_JS;avImg.alt='bot';av.appendChild(avImg);
  const d=document.createElement('div');d.className='typing';d.innerHTML='<span></span><span></span><span></span>';
  wrap.appendChild(av);wrap.appendChild(d);msgs.appendChild(wrap);msgs.scrollTop=msgs.scrollHeight;
}
function removeTyping(){const t=document.getElementById('typWrap');if(t)t.remove();}
function sendQuick(t){document.getElementById('quickBtns').style.display='none';document.getElementById('chatInp').value=t;sendMsg();}
const chatHistory: ChatMessage[]=[];
async function sendMsg(){
  if(chatStreaming)return;const inp=document.getElementById('chatInp');const text=inp.value.trim();if(!text)return;
  inp.value='';inp.style.height='auto';document.getElementById('quickBtns').style.display='none';
  addMsg(text,'user');chatHistory.push({role:'user',content:text});
  chatStreaming=true;document.getElementById('chatSend').disabled=true;addTyping();
  if(!WORKER_URL||WORKER_URL.includes('YOUR-WORKER')){removeTyping();const fb=localReply(text);addMsg(fb,'bot');chatHistory.push({role:'assistant',content:fb});chatStreaming=false;document.getElementById('chatSend').disabled=false;return;}
  try{
    const res=await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:400,system:SYSTEM,messages:chatHistory.slice(-12)})});
    removeTyping();if(!res.ok)throw new Error('err');
    const data=await res.json();const reply=data.content?.[0]?.text||localReply(text);addMsg(reply,'bot');chatHistory.push({role:'assistant',content:reply});
  }catch(err){removeTyping();const fb=localReply(text);addMsg(fb,'bot');chatHistory.push({role:'assistant',content:fb});}
  chatStreaming=false;document.getElementById('chatSend').disabled=false;
}
function localReply(q){const l=q.toLowerCase();if(l.match(/price|cost|rate|₹|rupee|kitna/))return '💰 Rates: <strong>1hr ₹300 · 3hr ₹600 · Full Day ₹1000–1200 · Outstation ₹1200–1500 · Night ₹500</strong>. Call <strong>9111473929</strong>.';if(l.match(/outstation|highway/))return '🛣️ Outstation from ₹1200–₹1500. Call <strong>9111473929</strong> for custom quote.';if(l.match(/book|hire|reserve/))return '📅 Use the booking form on this page or call <strong>9111473929</strong>. Driver in 30 min!';if(l.match(/city|cities|raipur|bhilai|durg|bilaspur/))return '📍 We serve <strong>Raipur, Bhilai, Durg &amp; Bilaspur</strong> — 30-min guaranteed!';if(l.match(/night|raat|late/))return '🌙 Night Driver 8PM–6AM at ₹500. Call <strong>9111473929</strong>!';if(l.match(/hospital|medical|emergency/))return '🏥 Emergency priority! Call <strong>9111473929</strong> immediately.';if(l.match(/verify|safe|police/))return '🛡️ All drivers: Govt ID · Police background · Breathalyzer every shift · 5+ yrs.';if(l.match(/airport|flight/))return '✈️ Airport service with real-time flight tracking. Call <strong>9111473929</strong>.';if(l.match(/pay|upi|cash/))return '💳 Cash · UPI (GPay/PhonePe/Paytm) · Bank transfer. Zero hidden charges.';if(l.match(/driver|join|register|work/))return '🚗 Want to join? Fill the Driver Registration form on this page or call <strong>9111473929</strong>!';return '🚗 Call <strong>9111473929</strong> or use the booking form. Available 24×7!';}

Object.assign(appWindow,{toggleDrawer,toggleFaq,scrollToBook,resetForm,resetDriverForm,toggleChat,sendQuick,sendMsg,autoResize});

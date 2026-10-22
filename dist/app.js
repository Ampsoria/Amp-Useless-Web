import { departments, taunts } from './content.js';
import { mountExperience } from './experiences.js';

const app = document.querySelector('#app');
const toastStack = document.querySelector('#toast-stack');
const soundButton = document.querySelector('#sound-toggle');
const totalStages = departments.length * 4;
let progress = readProgress();
let chaos = readChaos();
let soundOn = false;
let audioContext;
let attempts = 0;
let hintLevel = 0;
let activeCleanup = () => {};
let currentRoute = '';

function readProgress() {
  try {
    const data = JSON.parse(localStorage.getItem('amp-progress-v1') || '{}');
    return data && typeof data === 'object' ? data : {};
  } catch { return {}; }
}
function saveProgress() {
  try { localStorage.setItem('amp-progress-v1', JSON.stringify(progress)); } catch { /* playable without storage */ }
}
function readChaos() {
  try {
    const data = JSON.parse(localStorage.getItem('amp-chaos-v1') || '{}');
    return {fails: 0, hints: 0, escapes: 0, complaints: 0, ...data};
  } catch { return {fails: 0, hints: 0, escapes: 0, complaints: 0}; }
}
function saveChaos() {
  try { localStorage.setItem('amp-chaos-v1', JSON.stringify(chaos)); } catch { /* still playable */ }
}
function completeCount() { return departments.reduce((n, d) => n + Math.min(4, Math.max(0, Number(progress[d.id]) || 0)), 0); }
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x])); }
function sound(freq = 420, duration = .08, type = 'square') {
  if (!soundOn) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type; oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
  } catch { /* no audio support */ }
}
function toast(message) {
  const item = document.createElement('div');
  item.className = 'toast'; item.textContent = message;
  toastStack.append(item);
  setTimeout(() => { item.style.opacity = '0'; setTimeout(() => item.remove(), 250); }, 3600);
  while (toastStack.children.length > 3) toastStack.firstElementChild.remove();
}
function fail(message = 'ระบบเห็นแล้วครับ แต่ยังไม่ประทับใจ') {
  attempts++; chaos.fails++; saveChaos(); sound(190, .12, 'sawtooth');
  const box = document.querySelector('#feedback');
  if (box) box.textContent = message;
  if (attempts === 3 || attempts === 7 || (attempts > 7 && attempts % 6 === 0)) {
    const dept = departments.find(d => currentRoute.startsWith(`${d.id}/`));
    toast(attempts === 3 && dept ? dept.taunt : taunts[(Math.floor(attempts / 3) + currentRoute.length) % taunts.length]);
  }
  if (attempts >= 4 && hintLevel === 0) {
    const hintButton = document.querySelector('#hint-button');
    if (hintButton) hintButton.textContent = 'โอเค เฉลยก็ได้ ↗';
  }
}
function navigate(hash) {
  if (location.hash === hash) render(); else location.hash = hash;
}
function render() {
  activeCleanup(); activeCleanup = () => {};
  attempts = 0; hintLevel = 0;
  const path = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const dept = departments.find(d => d.id === path[0]);
  const stageNumber = Number(path[1] || 1);
  const route = dept && Number.isInteger(stageNumber) && stageNumber >= 1 && stageNumber <= 4 ? `${dept.id}/${stageNumber}` : 'hub';
  currentRoute = route;
  const paint = () => {
    if (route === 'hub') renderHub();
    else renderStage(dept, stageNumber - 1);
    window.scrollTo({top: 0, behavior: 'instant'});
  };
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(paint);
  else paint();
}
function renderHub() {
  const done = completeCount();
  app.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">EST. WHENEVER · THE INTERNET'S LEAST HELPFUL NETWORK</div>
        <h1>BAD<br><span class="outline">IDEAS.</span></h1>
        <p class="hero-thai">ยินดีต้อนรับสู่<br><em>จักรวาลบริการขัดใจ</em></p>
        <p class="hero-sub">ธุรกิจ 8 ประเภท 32 ด่าน และเหตุผลอีก 0 ข้อที่ต้องทำแบบนี้ ทุกอย่างดูจริงจังเกินความจำเป็น และใช้งานยากอย่างมีเจตนา</p>
        <div class="hero-actions"><button class="primary-btn" id="start-random">เริ่มเดี๋ยวนี้ →</button><button class="secondary-btn" id="browse-services">อย่าเพิ่งเริ่ม ↗</button></div>
      </div>
      <div class="hero-stage" aria-hidden="true">
        <div class="stage-sun"></div><div class="scribble">✳</div>
        <div class="stage-scene"><div class="scene-ring one"></div><div class="scene-ring two"></div><div class="scene-ring three"></div><div class="scene-core">A</div></div>
        <div class="float-label a">100% UNNECESSARY</div><div class="float-label b">USER EXPERIENCE? MAYBE.</div><div class="float-label c">PLEASE PANIC ↗</div>
      </div>
    </section>
    <div class="marquee-wrap" aria-hidden="true"><div class="marquee">${Array(4).fill('<span>WELCOME TO THE WRONG SIDE OF THE WEB</span><span>PLEASE BE PATIENT WHILE WE TEST YOURS</span>').join('')}</div></div>
    <section class="chaos-report" aria-label="แฟ้มความอดทน"><div><span class="eyebrow">PLAYER DOSSIER / ไม่ได้ขอแต่เราทำให้</span><strong>ความคืบหน้า ${done}/${totalStages} · ตอบพลาด ${chaos.fails} ครั้ง</strong><small>ข้อมูลนี้อยู่ในเบราว์เซอร์ของคุณเท่านั้น</small></div><button id="open-dossier" type="button">เปิดแฟ้มลับของฉัน ↗</button></section>
    <section id="departments" aria-labelledby="service-heading">
      <div class="section-head"><div><div class="eyebrow">OUR QUESTIONABLE SERVICES / 01—08</div><h2 id="service-heading">เลือกบริการ<span>ผิด</span></h2></div><div class="section-aside">เปลี่ยนหมวดได้ทุกเมื่อ ด่านหลัง ๆ ตั้งใจทำให้คุณอยากทำแบบนั้น<br><br><strong>${done} / ${totalStages}</strong> ด่านที่คุณอดทนผ่านมาแล้ว</div></div>
      <div class="department-grid">${departments.map((d, i) => `
        <article class="dept-card" tabindex="0" role="link" data-dept="${d.id}" style="--accent:${d.accent}" aria-label="เปิด ${d.name}">
          <div class="card-top"><span class="index-label">DEPT. 0${i + 1} / ${escapeHTML(d.category)}</span><span class="card-stamp">OPEN? MAYBE</span></div>
          <div class="dept-icon" aria-hidden="true">${d.icon}</div>
          <h3>${d.name}</h3><p class="dept-tagline">${escapeHTML(d.tagline)}</p>
          <div class="card-bottom"><span class="card-progress">${Math.min(4, Number(progress[d.id]) || 0)} / 4 STAGES</span><span class="card-arrow">↗</span></div>
        </article>`).join('')}</div>
    </section>
    <section class="manifesto"><h2>ใช้งานยาก<br>เพราะเราใส่ใจ<br><span style="background:#e9fa72">ผิดจุด</span></h2><p>ทุกด่านมีทางชนะจริง ปุ่มบางปุ่มโกหก บางปุ่มหนี บางปุ่มไม่รู้ว่าตัวเองเป็นปุ่ม ถ้าหงุดหงิดก็ไปเล่นหมวดอื่นได้ ความคืบหน้าจะจำไว้ให้ ทั้งที่ไม่มีใครขอ</p></section>`;
  document.querySelector('#start-random').addEventListener('click', () => {
    const candidates = departments.filter(d => (Number(progress[d.id]) || 0) < 4);
    const chosen = (candidates.length ? candidates : departments)[Math.floor(Math.random() * (candidates.length || departments.length))];
    sound(520); navigate(`#/${chosen.id}/${Math.min(4, (Number(progress[chosen.id]) || 0) + 1)}`);
  });
  document.querySelector('#browse-services').addEventListener('click', () => {
    document.querySelector('#departments').scrollIntoView({behavior:'smooth'});
    toast('คุณกด “อย่าเพิ่งเริ่ม” เราจึงพามาใกล้จุดเริ่มต้น');
  });
  document.querySelector('#open-dossier').addEventListener('click', showDossier);
  document.querySelectorAll('[data-dept]').forEach(card => {
    const open = () => { sound(580); navigate(`#/${card.dataset.dept}/${Math.min(4, (Number(progress[card.dataset.dept]) || 0) + 1)}`); };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}
function stageHint(dept, index, level = 1) { return level === 1 ? dept.clues[index] : dept.hints[index]; }
function renderStage(dept, index, won = false) {
  const allowed = Math.min(3, Number(progress[dept.id]) || 0);
  if (index > allowed) { navigate(`#/${dept.id}/${allowed + 1}`); return; }
  const stage = dept.stages[index];
  app.innerHTML = `
    <section class="game-screen dept-${dept.id}" style="--accent:${dept.accent}">
      <div class="game-top"><div class="breadcrumb"><button class="crumb-btn" id="home-crumb">AMP</button><span>/</span><span>${dept.name.toUpperCase()}</span><span>/</span><span>STAGE 0${index + 1}</span></div><span class="game-level">FRUSTRATION LEVEL: ${['🙂','😐','😤','🤯'][index]}</span></div>
      <div class="game-layout">
        <aside class="game-sidebar">
          <div class="service-sign"><span class="sign-icon">${dept.icon}</span><h1>${dept.name}</h1><p>${escapeHTML(dept.description)}</p></div>
          <div class="stage-list"><div class="stage-list-title">${escapeHTML(dept.ui.journey)}</div>${dept.stages.map((s, i) => `<button class="stage-step ${i === index ? 'active' : ''}" data-stage="${i + 1}" ${i > allowed ? 'disabled' : ''}><span class="step-num">0${i + 1}</span><span>${escapeHTML(s[0])}</span><span class="step-done">${i < (Number(progress[dept.id]) || 0) ? '✓' : i > allowed ? '⌁' : ''}</span></button>`).join('')}</div>
          <div class="escape-note">หมายเหตุจากฝ่ายบริการ: “${escapeHTML(dept.absurdity)}”</div>
        </aside>
        <div class="play-panel">
          <div class="play-header"><span class="micro">${dept.ui.file} / ${dept.id.toUpperCase()}—0${index + 1}<br>STATUS: ${won ? 'ผ่านแล้ว ยังงงอยู่' : escapeHTML(dept.ui.status)}</span><div><span class="micro">COMPLETION ${(index + (won ? 1 : 0)) * 25}%</span><div class="progress-track"><div class="progress-fill" style="width:${(index + (won ? 1 : 0)) * 25}%"></div></div></div></div>
          <div class="stage-body" id="stage-body">${won ? renderWin(dept, index) : `<span class="stage-counter">STAGE 0${index + 1} / 04 · ${escapeHTML(dept.category)}</span><h2>${escapeHTML(stage[0])}</h2><p class="stage-lead">${escapeHTML(stage[1])}</p><span class="instruction">↳ ${escapeHTML(stage[2])}</span><div class="game-area" id="game-area"></div><div id="feedback" class="feedback" role="status"></div><div id="hint" class="hint" hidden></div><div class="stage-actions"><button class="hint-button" id="hint-button">ขอความช่วยเหลือ (อาจช่วย)</button><button class="exit-button" id="exit-stage">หนีไปหมวดอื่น ↗</button></div>`}</div>
        </div>
      </div>
    </section>`;
  document.querySelector('#home-crumb').addEventListener('click', () => navigate('#/'));
  document.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => navigate(`#/${dept.id}/${button.dataset.stage}`)));
  if (won) bindWin(dept, index);
  else {
    document.querySelector('#exit-stage').addEventListener('click', () => { chaos.escapes++; saveChaos(); toast('หนีสำเร็จ...ชั่วคราว'); navigate('#/'); });
    document.querySelector('#hint-button').addEventListener('click', () => {
      hintLevel = (hintLevel + 1) % 3;
      const box = document.querySelector('#hint');
      box.textContent = hintLevel ? stageHint(dept, index, hintLevel) : '';
      box.hidden = hintLevel === 0;
      document.querySelector('#hint-button').textContent = ['ขอความช่วยเหลือ (อาจช่วย)', 'ขอเฉลยตรง ๆ ↗', 'ซ่อนคำตอบ (เก็บศักดิ์ศรี)'][hintLevel];
      if (hintLevel) { chaos.hints++; saveChaos(); }
      sound(310, .1, 'sine');
    });
    mountExperience(dept.id, index, {area: document.querySelector('#game-area'), done: () => finish(dept, index), fail, sound, toast, cleanup: fn => { activeCleanup = fn; }});
  }
}
function finish(dept, index) {
  activeCleanup(); activeCleanup = () => {};
  progress[dept.id] = Math.max(Number(progress[dept.id]) || 0, index + 1);
  saveProgress(); sound(660, .2, 'triangle');
  setTimeout(() => sound(880, .2, 'triangle'), 90);
  celebrate();
  renderStage(dept, index, true);
}
function renderWin(dept, index) {
  return `<div class="win-box"><div class="win-symbol">${dept.icon}</div><span class="stage-counter">STAGE 0${index + 1} COMPLETE / WE ARE SURPRISED</span><h2>${escapeHTML(index === 3 ? dept.ending : dept.stages[index][0] + ' (อย่างไม่น่าเชื่อ)')}</h2><p>${escapeHTML(index === 3 ? dept.endingText : dept.taunt)}</p><div class="win-actions"><button class="primary-btn" id="win-next">${escapeHTML(index === 3 ? dept.ui.end : dept.ui.next)}</button><button class="secondary-btn" id="win-hub">${index === 3 ? 'ไปหมวดอื่น' : 'ยอมแพ้ชั่วคราว'}</button></div></div>`;
}
function bindWin(dept, index) {
  document.querySelector('#win-next').addEventListener('click', () => navigate(index === 3 ? '#/' : `#/${dept.id}/${index + 2}`));
  document.querySelector('#win-hub').addEventListener('click', () => navigate('#/'));
}
function celebrate() {
  const canvas = document.querySelector('#confetti');
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);
  let particles = Array.from({length: 85}, () => ({x:Math.random()*innerWidth,y:-Math.random()*innerHeight*.4,vx:Math.random()*4-2,vy:2+Math.random()*4,r:2+Math.random()*5,c:['#e9fa72','#ff9e99','#b8a8ff','#171717'][Math.floor(Math.random()*4)],angle:Math.random()*6}));
  const start = performance.now();
  const frame = t => {
    ctx.clearRect(0,0,innerWidth,innerHeight);
    particles.forEach(p => { p.x+=p.vx;p.y+=p.vy;p.angle+=.05;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.c;ctx.fillRect(-p.r,-p.r,p.r*2,p.r*2);ctx.restore(); });
    if (t-start < 2600) requestAnimationFrame(frame); else ctx.clearRect(0,0,innerWidth,innerHeight);
  }; requestAnimationFrame(frame);
}
function showDossier() {
  const dialog = document.createElement('div');
  dialog.className = 'reset-dialog dossier-dialog';
  const stamps = [
    [completeCount() >= 8, 'อยู่ต่อทั้งที่กลับได้'],
    [chaos.fails >= 10, 'ตอบผิดอย่างสม่ำเสมอ'],
    [chaos.hints >= 5, 'ผู้ใช้สิทธิ์ถามอย่างคุ้มค่า'],
    [chaos.escapes >= 3, 'นักท่องเที่ยวระหว่างหมวด']
  ];
  dialog.innerHTML = `<div class="reset-card dossier-card" role="dialog" aria-modal="true" aria-labelledby="dossier-title"><span class="eyebrow">AMP INTERNAL DOCUMENT / EYES ONLY? NO</span><h2 id="dossier-title">แฟ้มความอดทนของคุณ</h2><div class="dossier-grid"><span>ผ่านด่าน<strong>${completeCount()} / ${totalStages}</strong></span><span>ตอบพลาด<strong>${chaos.fails}</strong></span><span>ขอใบ้<strong>${chaos.hints}</strong></span><span>หนีไปหมวดอื่น<strong>${chaos.escapes}</strong></span></div><div class="dossier-stamps">${stamps.map(([earned, name]) => `<span class="${earned ? 'earned' : ''}">${earned ? '✓' : '⌁'} ${name}</span>`).join('')}</div><p id="complaint-result">คำร้องเรียนที่ยื่นแล้ว: ${chaos.complaints} · สถานะ: อยู่ระหว่างการอยู่ระหว่าง</p><div class="reset-actions"><button id="file-complaint" type="button">ร้องเรียนระบบ ↗</button><button id="close-dossier" type="button">ปิดแฟ้ม (ยังจำได้)</button></div></div>`;
  document.body.append(dialog);
  const close = () => { dialog.remove(); window.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  window.addEventListener('keydown', onKey);
  dialog.querySelector('#close-dossier').addEventListener('click', close);
  dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
  dialog.querySelector('#file-complaint').addEventListener('click', () => {
    chaos.complaints++; saveChaos();
    const replies = ['รับเรื่องแล้ว ระบบส่งต่อให้ระบบเดิม', 'เลขที่คำร้อง: กำลังนับย้อนหลัง', 'ฝ่ายบริการเห็นด้วยว่าควรมีฝ่ายบริการ', 'คำร้องสำเร็จ! ไม่มีใครได้รับแจ้ง'];
    dialog.querySelector('#complaint-result').textContent = `คำร้อง #${chaos.complaints}: ${replies[(chaos.complaints - 1) % replies.length]}`;
    sound(260, .1, 'triangle');
  });
  dialog.querySelector('#file-complaint').focus();
}
document.querySelector('#brand').addEventListener('click', () => navigate('#/'));
const assistantPanel = document.querySelector('#assistant-panel');
const assistantToggle = document.querySelector('#assistant-toggle');
function assistantMessage(message, user = false) {
  const p = document.createElement('p'); p.className = `assistant-bubble${user ? ' user' : ''}`;
  p.textContent = message; document.querySelector('#assistant-messages').append(p);
  p.scrollIntoView({block:'nearest'});
}
function toggleAssistant(open) {
  assistantPanel.hidden = !open; assistantToggle.setAttribute('aria-expanded', String(open));
  if (open) document.querySelector('#assistant-input').focus(); else assistantToggle.focus();
}
assistantToggle.addEventListener('click', () => toggleAssistant(assistantPanel.hidden));
document.querySelector('#assistant-close').addEventListener('click', () => toggleAssistant(false));
document.querySelector('#assistant-hint').addEventListener('click', () => {
  if (currentRoute === 'hub') assistantMessage('คำใบ้หน้ารวม: เลือกหมวดไหนก็ได้ เพราะทุกหมวดคิดว่าตัวเองสำคัญที่สุด');
  else {
    const [id, n] = currentRoute.split('/'); const dept = departments.find(d => d.id === id);
    assistantMessage(stageHint(dept, Number(n)-1, 1));
  }
});
document.querySelector('#assistant-escape').addEventListener('click', () => {
  assistantMessage('พาหนีสำเร็จ แต่คุณยังอยู่ใน Amp'); navigate('#/');
});
document.querySelector('#assistant-form').addEventListener('submit', e => {
  e.preventDefault(); const input = document.querySelector('#assistant-input'); const question = input.value.trim();
  if (!question) return; assistantMessage(question, true); input.value = '';
  const replies = [
    'ฉันประมวลผลแล้ว คำตอบคือ: ขึ้นอยู่กับว่าปุ่มไหนกำลังหนี',
    'ขออภัย ฉันเป็น AI ที่เชี่ยวชาญด้านการทำให้คำถามเดิมยากขึ้น',
    'ตามฐานข้อมูลของฉัน ควรลองกดปุ่มที่ดูไม่ควรกด',
    'คำถามดีมาก ฉันจะตอบคำถามอื่น: วันนี้คุณยังอดทนได้อยู่',
    'ระบบแนะนำให้หายใจเข้า แล้วเลือกปุ่มที่ขัดใจที่สุด'
  ];
  assistantMessage(replies[Math.floor(Math.random() * replies.length)]);
});
window.addEventListener('keydown', e => { if (e.key === 'Escape' && !assistantPanel.hidden) toggleAssistant(false); });
soundButton.addEventListener('click', () => { soundOn = !soundOn; soundButton.setAttribute('aria-pressed', String(soundOn)); soundButton.querySelector('span').textContent = `เสียง: ${soundOn ? 'เปิด' : 'ปิด'}`; if (soundOn) sound(720,.1,'triangle'); });
document.querySelector('#reset-progress').addEventListener('click', () => {
  const dialog = document.createElement('div'); dialog.className = 'reset-dialog';
  dialog.innerHTML = '<div class="reset-card" role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">ลืมทุกอย่างจริงเหรอ?</h2><p>ความคืบหน้าทั้งหมดจะหายไป แต่ประสบการณ์จะยังหลอนอยู่ในความทรงจำ</p><div class="reset-actions"><button id="reset-cancel">ไม่ลืม</button><button id="reset-confirm">ลืมจริง</button></div></div>';
  document.body.append(dialog);
  dialog.querySelector('#reset-cancel').addEventListener('click', () => dialog.remove());
  dialog.querySelector('#reset-confirm').addEventListener('click', () => { progress = {}; chaos = {fails: 0, hints: 0, escapes: 0, complaints: 0}; saveProgress(); saveChaos(); dialog.remove(); toast('ระบบลืมแล้ว แต่เรายังจำได้'); navigate('#/'); });
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.remove(); });
  dialog.querySelector('#reset-cancel').focus();
});
setInterval(() => { document.querySelector('#clock').textContent = new Date().toLocaleTimeString('en-GB',{hour12:false}); }, 1000);
window.addEventListener('hashchange', render);
render();

// Each department is a separate little website. The host supplies progress,
// feedback and cleanup; scenes own their markup and interaction rules.
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function hold(button, fill, duration, ctx, onDone, onFail) {
  let frame = 0, started = 0, completed = false;
  const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; if (fill.isConnected) fill.style.width = '0%'; };
  const tick = () => {
    const pct = Math.min(100, (performance.now() - started) / duration * 100);
    fill.style.width = `${pct}%`;
    if (pct >= 100) { completed = true; stop(); onDone(); }
    else frame = requestAnimationFrame(tick);
  };
  const begin = () => { if (frame) return; completed = false; started = performance.now(); frame = requestAnimationFrame(tick); };
  button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); begin(); });
  button.addEventListener('pointerup', () => { if (frame && !completed) ctx.fail(onFail); stop(); });
  button.addEventListener('pointercancel', stop);
  button.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); begin(); } });
  button.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (frame && !completed) ctx.fail(onFail); stop(); } });
  ctx.cleanup(stop);
}

function shop(index, ctx) {
  const {area, done, fail} = ctx;
  if (index === 0) {
    const items = [
      ['เก้าอี้ไม่มีขา','฿4,990','นั่งได้ด้วยศรัทธา'],
      ['แก้วน้ำมีรู','฿1,299','ระบายน้ำเร็ว'],
      ['กล่องเปล่า รุ่นโปร','฿999','ฟีเจอร์: ว่างมาก'],
      ['ถุงอากาศพรีเมียม','฿2,499','อากาศนำเข้า']
    ];
    area.innerHTML = `<div class="ex-topline">AMP SHOP / FLASH SALE ที่ไม่ค่อยอยากขาย</div><div class="shop-shelf">${items.map(([name,price,desc],i) => `<button class="shop-product" data-sku="${i}"><span class="shop-product-art">${['♧','◡','□','◌'][i]}</span><strong>${name}</strong><small>${desc}</small><em>${price}</em></button>`).join('')}</div>`;
    area.querySelectorAll('[data-sku]').forEach(b => b.addEventListener('click', () => Number(b.dataset.sku) === 2 ? done() : fail(`สินค้านี้มีประโยชน์เกินไปสำหรับร้านเรา: ${items[Number(b.dataset.sku)][0]}`)));
  } else if (index === 1) {
    let count = 0;
    area.innerHTML = `<div class="ex-topline">YOUR CART / จำนวนตามอารมณ์</div><div class="shop-cart"><div class="shop-cart-product">□ <span>กล่องเปล่า รุ่นโปร</span><small>จัดส่งความว่าง</small></div><div class="shop-count" id="shop-count">0</div><div class="shop-controls"><button data-change="2">+2 ชิ้น</button><button data-change="-1">−1 ชิ้น</button></div><button class="ex-cta" id="shop-checkout">ลบตะกร้า (ไปต่อ) ↗</button></div>`;
    area.querySelectorAll('[data-change]').forEach(b => b.addEventListener('click', () => { count = Math.max(0, count + Number(b.dataset.change)); area.querySelector('#shop-count').textContent = count; ctx.sound(320 + count * 70); }));
    area.querySelector('#shop-checkout').addEventListener('click', () => count === 3 ? done() : fail(`ในตะกร้ามี ${count} ชิ้น แต่ระบบเขียนสเปกว่า 3`));
  } else if (index === 2) {
    area.innerHTML = `<div class="ex-topline">COUPON / พิเศษเฉพาะคนอ่านกลับหัว</div><form class="shop-coupon" id="shop-coupon"><div class="coupon-ticket"><span>ส่วนลด 0% แต่ขั้นตอน 100%</span><strong class="upside-down">NOPE</strong><small>รหัสพิมพ์ใหญ่ทุกตัว</small></div><label for="coupon-input">รหัสคูปองที่ไม่มีประโยชน์</label><input id="coupon-input" autocomplete="off" spellcheck="false"><button class="ex-cta" type="submit">ไม่ใช้คูปอง ↗</button></form>`;
    area.querySelector('form').addEventListener('submit', e => { e.preventDefault(); area.querySelector('input').value.trim().toUpperCase() === 'NOPE' ? done() : fail('คูปองไม่ตรง ร้านดีใจเล็กน้อย'); });
  } else {
    let armed = false;
    area.innerHTML = `<div class="ex-topline">CHECKOUT / กรุณาเลือกวิธีส่งความว่าง</div><div class="shop-shipping"><button data-shipping="wrong">ส่งด่วนภายใน 8–10 ปี</button><button data-shipping="right">ไปรับเองในอดีต</button><button data-shipping="wrong">ส่งทางความคิด</button></div><div class="ex-status" id="shop-shipping-status">ยังไม่ได้เลือกวิธีจัดส่ง</div><button class="ex-cta" id="shop-pay" disabled>กดค้างเพื่อจ่าย ฿0</button><div class="ex-meter"><span id="shop-pay-fill"></span></div>`;
    area.querySelectorAll('[data-shipping]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.shipping === 'right') {
        if (armed) return;
        armed = true;
        area.querySelector('#shop-shipping-status').textContent = 'วิธีจัดส่ง: เดินทางย้อนเวลาเพื่อรับเอง';
        const pay = area.querySelector('#shop-pay'); pay.disabled = false;
        hold(pay, area.querySelector('#shop-pay-fill'), 1700, ctx, done, 'ร้านขอให้คุณกดให้นานกว่าความคุ้มค่า');
      } else fail('วิธีส่งนี้สมเหตุผลเกินไป ร้านไม่มีบริการ');
    }));
  }
}

function bank(index, ctx) {
  const {area, done, fail} = ctx;
  if (index === 0) {
    let pin = '';
    area.innerHTML = `<div class="atm"><div class="atm-screen"><small>AMP BANK // UNSECURED SECURE LOGIN</small><strong id="pin-display">_ _ _</strong><span>PIN ของวันนี้: 2 4 1</span></div><div class="atm-pad">${[7,2,9,4,1,8,3,0,5].map(n => `<button data-pin="${n}">${n}</button>`).join('')}</div></div>`;
    area.querySelectorAll('[data-pin]').forEach(b => b.addEventListener('click', () => {
      pin += b.dataset.pin; area.querySelector('#pin-display').textContent = pin.split('').map(() => '●').join(' ');
      if (pin.length === 3) { if (pin === '241') done(); else { fail('รหัสถูกเปิดเผยขนาดนี้แล้ว ยังไม่ตรงอีก'); pin = ''; area.querySelector('#pin-display').textContent = '_ _ _'; } }
    }));
  } else if (index === 1) {
    let revealed = 0;
    area.innerHTML = `<div class="atm"><div class="atm-screen"><small>ACCOUNT OVERVIEW // ห้ามจ้องนาน</small><strong id="bank-balance">฿ ••••••</strong><span id="bank-balance-note">ยอดเงินกำลังอาย</span></div><button class="bank-eye" id="bank-eye">◉ เปิดตาดูยอด</button></div>`;
    area.querySelector('#bank-eye').addEventListener('click', () => {
      revealed++; area.querySelector('#bank-balance').textContent = ['฿ 0?','฿ 0.00?','฿ 0.00'][Math.min(2,revealed-1)];
      area.querySelector('#bank-balance-note').textContent = [`เห็นครั้งที่ ${revealed} / 3`,'ยอดยังไม่ไว้ใจคุณ','ยอดยอมรับความจริงแล้ว'][Math.min(2,revealed-1)];
      if (revealed >= 3) done();
    });
  } else if (index === 2) {
    area.innerHTML = `<div class="atm"><div class="atm-screen"><small>ONE TIME PASSWORD</small><strong id="otp-brief">731</strong><span>รหัสจะหาย แต่คำใบ้ยังอยู่</span></div><form class="bank-otp" id="bank-otp"><input inputmode="numeric" maxlength="3" aria-label="รหัส OTP" autocomplete="off" placeholder="_ _ _"><button type="submit">ไม่ยืนยันตัวตน ↗</button></form></div>`;
    const timer = setTimeout(() => { const el = area.querySelector('#otp-brief'); if (el) el.textContent = '???'; }, 2400);
    ctx.cleanup(() => clearTimeout(timer));
    area.querySelector('form').addEventListener('submit', e => { e.preventDefault(); area.querySelector('input').value.trim() === '731' ? done() : fail('OTP ไม่ตรง ธนาคารขอแสดงความไม่เชื่อมั่น'); });
  } else {
    let armed = false;
    area.innerHTML = `<div class="atm"><div class="atm-screen"><small>TRANSFER / ฿0.00</small><strong>เลือกผู้รับ</strong><span id="bank-recipient">ยังไม่มีบัญชีปลายทาง</span></div><div class="bank-accounts"><button data-bank="wrong">บัญชีออมทรัพย์</button><button data-bank="wrong">บัญชีเงินเดือน</button><button data-bank="right">บัญชีที่ปิดไปแล้ว</button></div><button class="ex-cta" id="bank-transfer" disabled>กดค้างเพื่อไม่โอน</button><div class="ex-meter"><span id="bank-transfer-fill"></span></div></div>`;
    area.querySelectorAll('[data-bank]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.bank !== 'right') { fail('บัญชีนี้ยังใช้งานได้จริง เราจึงไม่รองรับ'); return; }
      if (armed) return;
      armed = true;
      area.querySelector('#bank-recipient').textContent = 'ปลายทาง: บัญชีที่ปิดไปแล้ว';
      const button = area.querySelector('#bank-transfer'); button.disabled = false;
      hold(button, area.querySelector('#bank-transfer-fill'), 1900, ctx, done, 'ธนาคารต้องการนิ้วที่มั่นคงกว่านี้');
    }));
  }
}

function travel(index, ctx) {
  const {area, done, fail} = ctx;
  if (index === 0) {
    let step = 0; const route = ['hotel','airport','home'];
    const placeNames = {hotel:'โรงแรม', airport:'สนามบิน', home:'บ้าน'};
    area.innerHTML = `<div class="travel-map"><div class="travel-grid"></div><div class="travel-route" id="travel-route">เส้นทาง: ? → ? → ?</div><button class="map-pin hotel" data-stop="hotel">⌂ โรงแรม</button><button class="map-pin airport" data-stop="airport">✈ สนามบิน</button><button class="map-pin home" data-stop="home">⌂ บ้าน</button><div class="travel-compass">N<br>↑<br>?</div></div>`;
    area.querySelectorAll('[data-stop]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.stop === route[step]) { step++; ctx.sound(360 + step*90); area.querySelector('#travel-route').textContent = `เส้นทาง: ${route.slice(0,step).map(id => placeNames[id]).join(' → ')}${step < 3 ? ' → ?' : ''}`; if (step === 3) done(); }
      else { step = 0; area.querySelector('#travel-route').textContent = 'เส้นทาง: ? → ? → ?'; fail('คุณเลือกเส้นทางที่นักท่องเที่ยวปกติใช้'); }
    }));
  } else if (index === 1) {
    let total = 0; const picked = new Set();
    area.innerHTML = `<div class="ex-topline">BAGGAGE CLAIM / เลือกของใส่กระเป๋า</div><div class="travel-bags">${[['เสื้อผ้า',5],['ของฝาก',2],['หินที่ระลึก',8],['สายชาร์จ',1]].map(([name,kg],i) => `<button data-bag="${i}"><strong>▣</strong><span>${name}</span><small>${kg} kg</small></button>`).join('')}</div><div class="travel-scale">น้ำหนักรวม <strong id="bag-weight">0 kg</strong></div><button class="ex-cta" id="bag-check">เช็กอินแบบไม่เช็ก ↗</button>`;
    area.querySelectorAll('[data-bag]').forEach(b => b.addEventListener('click', () => {
      const i = Number(b.dataset.bag), kg = [5,2,8,1][i];
      if (picked.has(i)) { picked.delete(i); total -= kg; b.classList.remove('selected'); }
      else { picked.add(i); total += kg; b.classList.add('selected'); }
      area.querySelector('#bag-weight').textContent = `${total} kg`;
    }));
    area.querySelector('#bag-check').addEventListener('click', () => total === 7 ? done() : fail(`น้ำหนัก ${total} kg ระบบต้องการ 7 kg แบบเป๊ะ ๆ`));
  } else if (index === 2) {
    area.innerHTML = `<div class="flight-board"><div class="flight-head"><span>FLIGHT</span><span>GATE</span><span>STATUS</span></div>${[['AMP001','A1','เปิด'],['AMP404','B2','ปิด'],['AMP777','WC','ห้องน้ำ'],['AMP000','C9','ใกล้แล้ว']].map((row,i) => `<button data-flight="${i}"><span>${row[0]}</span><span>${row[1]}</span><span>${row[2]}</span></button>`).join('')}</div>`;
    area.querySelectorAll('[data-flight]').forEach(b => b.addEventListener('click', () => Number(b.dataset.flight) === 2 ? done() : fail('เกตนี้มีอยู่จริงเกินไป ระบบไม่คุ้นเคย')));
  } else {
    let attempts = 0;
    area.innerHTML = `<div class="travel-boarding"><div class="boarding-pass" id="boarding-pass" draggable="true"><small>AMP AIRLINES</small><strong>BOARDING<br>PASS</strong><span>DESTINATION: MAYBE</span></div><div class="boarding-gate" id="boarding-gate">✈<br>GATE TO SOMEWHERE</div><button class="ex-cta" id="boarding-fallback">ส่งพาสด้วยวิธีที่ไม่ต้องลาก ↗</button></div>`;
    const pass = area.querySelector('#boarding-pass'), gate = area.querySelector('#boarding-gate');
    pass.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain','AMP-BOARDING'); });
    gate.addEventListener('dragover', e => e.preventDefault());
    gate.addEventListener('drop', e => { e.preventDefault(); if (e.dataTransfer.getData('text/plain') === 'AMP-BOARDING') done(); });
    area.querySelector('#boarding-fallback').addEventListener('click', () => { attempts++; if (attempts >= 3) done(); else fail(`ระบบรับพาสแล้ว ${attempts}/3 ใบ ทั้งที่คุณมีใบเดียว`); });
  }
}

function corporate(index, ctx) {
  const {area, done, fail} = ctx;
  if (index === 0) {
    area.innerHTML = `<div class="corp-slide"><div class="corp-slide-top">AMP CORPORATE / Q4 VISION / SLIDE 01 OF 99</div><h3>เรา<span>ขับเคลื่อน</span>อะไร?</h3><div class="corp-options"><button data-corp="wrong">ศักยภาพเชิงบูรณาการ</button><button data-corp="wrong">นวัตกรรมแห่งอนาคต</button><button data-corp="right">เก้าอี้</button><button data-corp="wrong">การเปลี่ยนผ่านอย่างยั่งยืน</button></div><small>*ข้อมูลนี้ไม่อยู่ในสไลด์นักลงทุน</small></div>`;
    area.querySelectorAll('[data-corp]').forEach(b => b.addEventListener('click', () => b.dataset.corp === 'right' ? done() : fail('คำนี้ฟังดูแพง แต่ไม่ได้บอกว่าเราขายอะไร')));
  } else if (index === 1) {
    area.innerHTML = `<div class="org-chart"><div class="org-root">CEO<br><small>ไม่รับการติดต่อ</small></div><div class="org-branches"><button data-org="wrong">ผู้จัดการ 14 ชั้น</button><button data-org="wrong">รองประธานฝ่ายอื่น ๆ</button><button id="intern">เด็กฝึกงาน<br><small>กดเพื่อดูสายบังคับบัญชา</small></button></div><div id="org-secret"></div></div>`;
    area.querySelectorAll('[data-org]').forEach(b => b.addEventListener('click', () => fail('ตำแหน่งนี้มีอำนาจในนามเท่านั้น')));
    area.querySelector('#intern').addEventListener('click', () => { area.querySelector('#org-secret').innerHTML = '<button class="org-real" id="real-ceo">ผู้บริหารตัวจริง: เด็กฝึกงาน</button>'; area.querySelector('#real-ceo').addEventListener('click', done); });
  } else if (index === 2) {
    area.innerHTML = `<div class="corp-calendar"><div class="corp-calendar-head">OCTOBER? / MEETING FINDER</div><div class="corp-slots">${['09:00','10:30','12:00','18:00','23:59','31:00'].map((time,i) => `<button data-slot="${time}"><strong>${time}</strong><small>${i === 5 ? 'ว่างอย่างน่าสงสัย' : 'ไม่ว่าง'}</small></button>`).join('')}</div></div>`;
    area.querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', () => b.dataset.slot === '31:00' ? done() : fail('ช่องนี้เต็มไปด้วยการประชุมเพื่อจัดประชุม')));
  } else {
    const order = ['Legal','Finance','Intern']; let step = 0;
    area.innerHTML = `<div class="corp-document"><div class="corp-paper"><small>FORM 00-A / REQUEST FOR REQUEST</small><h3>คำขออนุมัติ<br>ให้ขออนุมัติ</h3><div id="corp-stamps">ตราที่ได้รับ: ยังไม่มี</div></div><div class="corp-stamp-buttons">${['Finance','Intern','Legal'].map(name => `<button data-stamp="${name}">${name}</button>`).join('')}</div></div>`;
    area.querySelectorAll('[data-stamp]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.stamp === order[step]) { step++; b.disabled = true; area.querySelector('#corp-stamps').textContent = `ตราที่ได้รับ: ${order.slice(0,step).join(' → ')}`; if (step === 3) done(); }
      else { step = 0; area.querySelectorAll('[data-stamp]').forEach(x => x.disabled = false); area.querySelector('#corp-stamps').textContent = 'ตราที่ได้รับ: เริ่มประชุมใหม่'; fail('ผิดลำดับ เอกสารต้องกลับไปที่โต๊ะเดิม'); }
    }));
  }
}

function academy(index, ctx) {
  const {area, done, fail} = ctx;
  if (index === 0) {
    let flipped = false;
    area.innerHTML = `<div class="academy-desk"><div class="academy-board">AMP ACADEMY / QUIZ BEFORE LESSON</div><button class="flash-card" id="flash-card">กดเพื่อพลิกการ์ด<br><small>ด้านหลังอาจมีคำตอบ</small></button><div class="academy-answers"><button data-word="ความรู้">ความรู้</button><button data-word="ความอดทน">ความอดทน</button><button data-word="ความว่าง">ความว่าง</button></div></div>`;
    area.querySelector('#flash-card').addEventListener('click', () => { flipped = true; area.querySelector('#flash-card').innerHTML = 'ความอดทน<br><small>วิชาบังคับ 0 หน่วยกิต</small>'; area.querySelector('#flash-card').classList.add('flipped'); });
    area.querySelectorAll('[data-word]').forEach(b => b.addEventListener('click', () => flipped && b.dataset.word === 'ความอดทน' ? done() : fail(flipped ? 'ตอบผิดแม้การ์ดจะบอกตรง ๆ' : 'คุณยังไม่ได้พลิกการ์ดตามระเบียบ')));
  } else if (index === 1) {
    const parts = ['อด','ทน','มาก']; let step = 0;
    area.innerHTML = `<div class="academy-desk"><div class="academy-board">LESSON 001 / ต่อคำ</div><div class="word-slots" id="word-slots">_ _ _</div><div class="word-pieces">${['มาก','อด','ทน'].map(word => `<button data-part="${word}">${word}</button>`).join('')}</div></div>`;
    area.querySelectorAll('[data-part]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.part === parts[step]) { step++; b.disabled = true; area.querySelector('#word-slots').textContent = parts.slice(0,step).join(' · ') + (step < 3 ? ' · _' : ''); if (step === 3) done(); }
      else { fail('ผิดลำดับ หนังสือเรียนขอเริ่มหน้าแรกใหม่'); step = 0; area.querySelectorAll('[data-part]').forEach(x => x.disabled = false); area.querySelector('#word-slots').textContent = '_ _ _'; }
    }));
  } else if (index === 2) {
    area.innerHTML = `<div class="academy-exam"><div class="academy-board">SELF ASSESSMENT / ตรวจเองได้</div><p>ข้อสอบ 10 ข้อ<br>ตอบถูก 0 ข้อ<br>ระบบถามว่าได้คะแนนเท่าไร?</p><div class="grade-options">${['A+','10','5','0'].map(answer => `<button data-grade="${answer}">${answer}</button>`).join('')}</div></div>`;
    area.querySelectorAll('[data-grade]').forEach(b => b.addEventListener('click', () => b.dataset.grade === '0' ? done() : fail('ระบบชอบความมั่นใจ แต่เกรดนี้เกินจริง')));
  } else {
    const questions = [
      ['ก่อนเริ่มเรียนควรทำอะไร?', ['เรียน','สอบก่อน','พักก่อน'],1],
      ['วิชานี้สอนอะไร?', ['ฟิสิกส์','บัญชี','วิธีผ่านเว็บนี้'],2],
      ['ใบรับรองนี้รับรองอะไร?', ['ว่าคุณอดทน','ว่าคุณเป็นครู','ว่าคุณมีปริญญาจริง'],0]
    ]; let step = 0;
    area.innerHTML = '<div class="academy-exam" id="final-exam"></div>';
    const show = () => { const [q, options] = questions[step]; area.querySelector('#final-exam').innerHTML = `<div class="academy-board">FINAL EXAM / ข้อ ${step+1} จาก 3</div><p>${q}</p><div class="grade-options">${options.map((text,i) => `<button data-answer="${i}">${esc(text)}</button>`).join('')}</div>`; area.querySelectorAll('[data-answer]').forEach(b => b.addEventListener('click', () => { if (Number(b.dataset.answer) === questions[step][2]) { step++; if (step === 3) done(); else show(); } else { step = 0; fail('ตอบผิดหนึ่งข้อ เริ่มข้อสอบใหม่ทั้งหมดตามประเพณี'); show(); } })); };
    show();
  }
}

function arcade(index, ctx) {
  const {area, done, fail} = ctx;
  if (index === 0) {
    let ready = false, active = false, timer, expiry;
    area.innerHTML = `<div class="arcade-screen"><div class="arcade-score">AMP ARCADE // REACTION.exe</div><div class="arcade-go" id="arcade-go">WAIT</div><button class="arcade-fire" id="arcade-fire">กดเพื่อเริ่ม</button></div>`;
    const button = area.querySelector('#arcade-fire'), label = area.querySelector('#arcade-go');
    button.addEventListener('click', () => {
      if (!active) { active = true; ready = false; label.textContent = 'WAIT'; button.textContent = 'อย่าเพิ่งกด'; timer = setTimeout(() => { ready = true; label.textContent = 'GO!'; button.textContent = 'กดตอนนี้'; expiry = setTimeout(() => { ready = false; active = false; label.textContent = 'TOO LATE'; button.textContent = 'ลองใหม่'; fail('ระบบให้เวลาคิดตั้งหนึ่งวินาที'); }, 1500); }, 500 + Math.random()*800); }
      else if (ready) { clearTimeout(expiry); done(); }
      else { clearTimeout(timer); active = false; label.textContent = 'TOO SOON'; button.textContent = 'ลองใหม่'; fail('รีบเกินไป เกมนี้ไม่ชอบความกระตือรือร้น'); }
    });
    ctx.cleanup(() => { clearTimeout(timer); clearTimeout(expiry); });
  } else if (index === 1) {
    let dodges = 0, moving = false;
    area.classList.add('chase');
    area.innerHTML = `<div class="arena-grid"></div><div class="arcade-score">ENEMY HP: 5 DODGES</div><button class="runaway" id="arcade-enemy" style="--x:50%;--y:50%">✕ จับฉันสิ</button><div class="arena-hud" id="arcade-dodges">DODGES 0/5</div>`;
    const button = area.querySelector('#arcade-enemy');
    const move = () => { if (moving || dodges >= 5) return; moving = true; dodges++; button.style.setProperty('--x', `${18+Math.random()*64}%`); button.style.setProperty('--y', `${20+Math.random()*60}%`); area.querySelector('#arcade-dodges').textContent = `DODGES ${dodges}/5`; if (dodges === 5) button.textContent = 'ฉันเหนื่อยแล้ว'; setTimeout(() => moving = false, 330); };
    button.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') move(); });
    button.addEventListener('click', () => dodges >= 5 ? done() : move());
  } else if (index === 2) {
    const sequence = ['blue','pink','yellow']; let step = 0, shown = true;
    area.innerHTML = `<div class="arcade-screen"><div class="arcade-score">MEMORY LEVEL 03</div><div class="arcade-combo" id="arcade-combo">ฟ้า → ชมพู → เหลือง</div><div class="arcade-colors"><button data-color="pink" aria-label="ชมพู"></button><button data-color="yellow" aria-label="เหลือง"></button><button data-color="blue" aria-label="ฟ้า"></button></div></div>`;
    const timer = setTimeout(() => { shown = false; const label = area.querySelector('#arcade-combo'); if (label) label.textContent = '? → ? → ?'; }, 2800);
    ctx.cleanup(() => clearTimeout(timer));
    area.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => { if (b.dataset.color === sequence[step]) { step++; area.querySelector('#arcade-combo').textContent = `${'● '.repeat(step)}${'? '.repeat(3-step)}`; if (step === 3) done(); } else { step = 0; fail('คอมโบผิด เกมจะจำความผิดพลาดนี้ไว้สักครู่'); area.querySelector('#arcade-combo').textContent = shown ? 'ฟ้า → ชมพู → เหลือง' : '? → ? → ?'; } }));
  } else {
    let hp = 3;
    area.classList.add('chase');
    area.innerHTML = `<div class="arena-grid"></div><div class="arcade-boss-hp" id="boss-hp">BOSS HP: ♥ ♥ ♥</div><button class="runaway arcade-attack" id="arcade-attack" style="--x:50%;--y:52%">⚔ โจมตี</button><button class="arcade-surrender" id="arcade-surrender">ยอมแพ้ (บอสชอบ)</button>`;
    area.querySelector('#arcade-attack').addEventListener('click', e => { hp--; ctx.sound(200 + hp*100); if (hp === 0) { done(); return; } area.querySelector('#boss-hp').textContent = `BOSS HP: ${'♥ '.repeat(hp)}`; e.currentTarget.style.setProperty('--x', `${20+Math.random()*60}%`); e.currentTarget.style.setProperty('--y', `${25+Math.random()*50}%`); e.currentTarget.textContent = ['⚔ โจมตี','⚔ ยังไม่ตาย','⚔ ขอพักก่อนได้ไหม'][3-hp]; });
    area.querySelector('#arcade-surrender').addEventListener('click', () => { hp = 3; area.querySelector('#boss-hp').textContent = 'BOSS HP: ♥ ♥ ♥'; fail('บอสรับคำยอมแพ้แล้ว แต่ไม่ให้ผ่าน'); });
  }
}

function hospital(index, ctx) {
  const {area, done, fail} = ctx;
  if (index === 0) {
    let number = 20;
    area.innerHTML = `<div class="queue-machine"><div class="queue-display"><small>QUEUE / NOW SERVING</small><strong id="queue-number">20</strong><span>คิวเดินถอยหลัง โปรดอย่าตั้งคำถาม</span></div><button id="queue-next">รับคิวถัดไป (ถอยหลัง)</button><button id="queue-ticket">พิมพ์บัตรคิว</button></div>`;
    area.querySelector('#queue-next').addEventListener('click', () => { number = number === 0 ? 20 : number - 1; area.querySelector('#queue-number').textContent = number; ctx.sound(300+number*5); });
    area.querySelector('#queue-ticket').addEventListener('click', () => number === 17 ? done() : fail(`เลข ${number} ยังไม่ใช่คิวที่ระบบอยากให้คุณได้`));
  } else if (index === 1) {
    area.innerHTML = `<form class="triage-form" id="triage-form"><div class="ex-topline">PATIENT: เว็บไซต์ AMP / อาการที่สังเกตได้</div>${[['runaway','ปุ่มหนี'],['healthy','โหลดไวเกินไป'],['lost','เมนูหลงทาง'],['pretty','สีสวยเกินเหตุ']].map(([id,label]) => `<label><input type="checkbox" value="${id}"><span>${label}</span></label>`).join('')}<button class="ex-cta" type="submit">ส่งแบบฟอร์ม (อาจไม่ส่ง)</button></form>`;
    area.querySelector('form').addEventListener('submit', e => { e.preventDefault(); const selected = [...area.querySelectorAll('input:checked')].map(x => x.value).sort().join(','); selected === 'lost,runaway' ? done() : fail('คุณวินิจฉัยระบบผิด ลองดูอาการที่ทำให้ใช้งานยากจริง ๆ'); });
  } else if (index === 2) {
    area.innerHTML = `<div class="waiting-room"><div class="ex-topline">WAITING ROOM / เก้าอี้ว่างที่ไม่มีใครหาเจอ</div><div class="seat-grid">${['101','202','303','405','505','606','707','808','404'].map(n => `<button data-seat="${n}">▤<small>${n}</small></button>`).join('')}</div></div>`;
    area.querySelectorAll('[data-seat]').forEach(b => b.addEventListener('click', () => b.dataset.seat === '404' ? done() : fail(`เก้าอี้ ${b.dataset.seat} มีคนนั่งอยู่ในระบบ แม้จะดูว่าง`)));
  } else {
    let opened = false;
    area.innerHTML = `<div class="records-desk"><div class="ex-topline">LAB RESULTS / แฟ้มที่คนไข้ยังไม่ควรเห็น</div><div class="file-cabinet">${['ระบบฯ','ระบม','ระบบ','ระบุ'].map((name,i) => `<button data-file="${i}"><span>📁</span>${name}</button>`).join('')}</div><div class="record-result" id="record-result">ยังไม่ได้เปิดแฟ้ม</div><button class="ex-cta" id="receive-result" disabled>ไม่รับผลตรวจ ↗</button></div>`;
    area.querySelectorAll('[data-file]').forEach(b => b.addEventListener('click', () => { if (b.dataset.file === '2') { opened = true; area.querySelector('#record-result').textContent = 'คนไข้: ระบบ / ผลตรวจ: ขัดใจเรื้อรัง'; area.querySelector('#receive-result').disabled = false; } else fail('แฟ้มชื่อเกือบเหมือนกัน แต่คนไข้ไม่ใช่ระบบ'); }));
    area.querySelector('#receive-result').addEventListener('click', () => opened && done());
  }
}

function dating(index, ctx) {
  const {area, done, fail} = ctx;
  if (index === 0) {
    const profiles = [
      ['บอส','99%','ชอบคนที่ไม่อ่านข้อความ'],
      ['มิน','12%','อยากคุยกันจริง'],
      ['อัลกอริทึม','100%','ชอบข้อมูลของคุณ']
    ];
    area.innerHTML = `<div class="dating-app"><div class="dating-heart">♡ AMP DATING / MATCHMAKER.EXE</div><div class="profile-deck">${profiles.map(([name,score,bio],i) => `<div class="profile-card"><div class="profile-avatar">${['♠','♡','✳'][i]}</div><strong>${name} <small>${score} MATCH</small></strong><p>${bio}</p><button data-like="${i}">♡ ชอบโปรไฟล์นี้</button></div>`).join('')}</div></div>`;
    area.querySelectorAll('[data-like]').forEach(b => b.addEventListener('click', () => Number(b.dataset.like) === 1 ? done() : fail('คะแนนสูงไม่ได้แปลว่าอยากคุยกับคุณ')));
  } else if (index === 1) {
    area.innerHTML = `<div class="dating-app"><div class="dating-heart">COMPATIBILITY REPORT / 99% จากสิ่งที่ไม่เกี่ยว</div><div class="interest-cloud">${['มี Wi-Fi','เกิดบนโลก','ชอบเดินเล่นตอนฝนหยุด','หายใจเป็น','เคยใช้แอป'].map((tag,i) => `<button data-interest="${i}">${tag}</button>`).join('')}</div><div class="dating-caption">เลือกสิ่งที่อาจใช้เริ่มบทสนทนาได้จริง</div></div>`;
    area.querySelectorAll('[data-interest]').forEach(b => b.addEventListener('click', () => Number(b.dataset.interest) === 2 ? done() : fail('สิ่งนี้เข้ากันได้กับมนุษย์เกือบทุกคน')));
  } else if (index === 2) {
    area.innerHTML = `<div class="chat-window"><div class="chat-header">MIN • ออนไลน์อยู่ (ระบบบอก)</div><div class="chat-bubble incoming">หวัดดี คุยอะไรกันดี?</div><div class="chat-replies"><button data-reply="wrong">อัลกอริทึมบอกว่าเราคู่กัน 12%</button><button data-reply="right">สวัสดี อยากคุยกันไหม</button><button data-reply="wrong">ยอมรับคุกกี้ก่อนคุยได้ไหม</button></div></div>`;
    area.querySelectorAll('[data-reply]').forEach(b => b.addEventListener('click', () => b.dataset.reply === 'right' ? done() : fail('ข้อความนี้ฟังดูเหมือนแอปส่งเองมากกว่าคนส่ง')));
  } else {
    area.innerHTML = `<div class="date-planner"><div class="dating-heart">PLAN A DATE / กำหนดนัดที่เกิดขึ้นได้จริง</div><label>เวลา<select id="date-time"><option value="">เลือกเวลา</option><option>เมื่อวาน 25:00</option><option>เสาร์ 18:00</option><option>พรุ่งนี้เมื่อวาน</option></select></label><label>สถานที่<select id="date-place"><option value="">เลือกสถานที่</option><option>ในแชต</option><option>ร้านกาแฟ</option><option>จุดที่ GPS ไม่รู้จัก</option></select></label><button class="ex-cta" id="date-submit">ยกเลิกนัด (นัดจริง) ↗</button></div>`;
    area.querySelector('#date-submit').addEventListener('click', () => area.querySelector('#date-time').value === 'เสาร์ 18:00' && area.querySelector('#date-place').value === 'ร้านกาแฟ' ? done() : fail('เวลาหรือสถานที่นี้มีอยู่แค่ในความสัมพันธ์กับระบบ'));
  }
}

export const experiences = {shop, bank, travel, corporate, academy, arcade, hospital, dating};
export function mountExperience(id, index, ctx) {
  ctx.area.classList.add('experience', `ex-${id}`);
  experiences[id](index, ctx);
}

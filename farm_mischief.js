/* Mobile slingshot event. The same trajectory drives the aim dots and the shot. */
(function () {
  'use strict';
  const C = window.FarmMischiefCore, A = window.FarmMischiefArt, W = C.world;
  const floor = item => W.ground - item.height * .21;
  const at = (x,y,angle = 0) => `translate(${x} ${y}) rotate(${angle})`;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phrase = item => `Skjut ner ${item.definite}.`;
  const listen = text => window.SpeechEngine?.speakSwedish?.(text, 1);
  const materialSounds = {
    metal:[['triangle',620,.14,0,510],['sine',1610,.23,.01,1390],['triangle',835,.18,.058,640]],
    ceramic:[['triangle',480,.075,0,335],['sine',1250,.14,.012,1070]],
    glass:[['sine',1810,.24,0,1700],['sine',2440,.18,.022,2290],['sine',1350,.12,.065,1120]],
    wood:[['triangle',175,.10,0,85],['sine',315,.065,.015,148]],
    paper:[['sawtooth',138,.06,0,70],['triangle',245,.05,.035,110]],
    plastic:[['triangle',345,.09,0,235],['sine',600,.045,.022,432]],
    rubber:[['sine',250,.13,0,84],['sine',193,.07,.09,100]],
    soft:[['sine',108,.095,0,42]],
    snap:[['triangle',420,.105,0,140],['sine',175,.08,.02,80]],
    ground:[['triangle',139,.08,0,65]]
  };
  let active;
  function sound(kind, volume = 1) {
    try {
      const ctx = window.SpeechEngine?.SoundFX?.getContext();
      if (!ctx) return;
      for (const [type, freq, duration, delay, end] of materialSounds[kind]) {
        const t = ctx.currentTime + delay;
        const oscillator = ctx.createOscillator(), gain = ctx.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq,t);
        oscillator.frequency.exponentialRampToValueAtTime(end,t + duration);
        gain.gain.setValueAtTime(.001,t);
        gain.gain.exponentialRampToValueAtTime(.12 * volume,t + .009);
        gain.gain.exponentialRampToValueAtTime(.001,t + duration);
        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start(t); oscillator.stop(t + duration + .015);
      }
    } catch (_) { /* The animation still provides impact feedback without audio. */ }
  }
  function destroy() {
    if (!active) return;
    active.events.abort();
    cancelAnimationFrame(active.frame);
    active = null;
    window.SpeechEngine?.stopAudio?.();
  }
  function boardHTML(targets, down) {
    const props = targets.map(item => {
      const landed = down.has(item.id);
      return `<g data-sling-prop="${item.id}" transform="${landed ? at(item.x + 12,floor(item),88) : at(item.x,item.y)}"><g class="fb-sling-shape">${A.object(item)}</g></g>`;
    }).join('');
    return `<svg class="fb-sling-stage" viewBox="0 0 ${W.width} ${W.height}" role="img" aria-label="โต๊ะในสวนกับของเรียงเป็นแถว หนังสติ๊กอยู่ด้านล่าง">
      <defs><linearGradient id="fb-sling-lawn" x2="0" y2="1"><stop stop-color="#4a704d" stop-opacity=".1"/><stop offset="1" stop-color="#355137" stop-opacity=".78"/></linearGradient></defs>
      <path d="M0 174Q240 142 500 178v248H0Z" fill="url(#fb-sling-lawn)"/><path d="M37 297q17-15 40-6m335 3q18-12 41-2m-342 23q10-13 21-14m222 5q18-10 30-4" stroke="#bfce86" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>
      ${A.table}<g class="fb-sling-props">${props}</g>
      <g class="fb-sling-dots" aria-hidden="true">${Array.from({length:17},(_,i) => `<circle r="${Math.max(2.1,4-i*.12)}" opacity="0"/>`).join('')}</g>
      <path class="fb-sling-trail" opacity="0" fill="none" stroke="#fff1c9" stroke-width="6" stroke-linecap="round" aria-hidden="true"/>
      <g class="fb-sling-burst" opacity="0" aria-hidden="true"><circle r="19" fill="none" stroke="#fff0b5" stroke-width="3"/><path d="M-29 0h-10m68 0h10M0-28v-10M0 28v10m19-48 9-8m-48 9-8-8" fill="none" stroke="#fff0b5" stroke-width="4" stroke-linecap="round"/></g>
      <ellipse cx="250" cy="383" rx="56" ry="10" fill="#28382355"/><path d="M250 384v-39q-1-10-16-19l-16-21m32 79v-39q1-10 16-19l16-21" fill="none" stroke="#563b2d" stroke-width="17" stroke-linecap="round"/>
      <path d="M250 378v-33q-1-10-16-19l-16-21m32 73v-33q1-10 16-19l16-21" fill="none" stroke="#b38252" stroke-width="11" stroke-linecap="round"/>
      <path d="M247 374v-28q-2-9-14-18m30-3 17-21" fill="none" stroke="#e1b579" stroke-width="3.5" stroke-linecap="round"/>
      <path class="fb-sling-band" fill="none" stroke="#583e36" stroke-width="6" stroke-linecap="round"/>
      <path class="fb-sling-band-light" fill="none" stroke="#d6a268" stroke-width="2" stroke-linecap="round"/>
      <circle class="fb-sling-stone" r="9.5" fill="#d7d4ba" stroke="#5c5e4b" stroke-width="2"/>
      <circle data-sling-grab cx="250" cy="322" r="48" fill="transparent"/>
    </svg>`;
  }
  function mount(host, options) {
    destroy();
    const board = C.targets(options.round);
    const s = { ...options, host, board, step:options.step, down:new Set(board.slice(0,options.step).map(item => item.id)), events:new AbortController(), attempts:0 };
    active = s;
    host.innerHTML = `<div class="fb-sling-instruction"><div><span class="fb-kicker">ฟังชื่อของ แล้วเล็งให้ตรง</span><p class="fb-sling-line" lang="sv"></p></div><button type="button" class="mg-replay" data-sling="replay">♪ ฟังอีกครั้ง <small>1×</small></button></div>
      <div class="fb-sling-task"><button type="button" class="fb-button" data-sling="hint" aria-pressed="false">คำใบ้ภาษาไทย</button><p class="fb-sling-meaning" hidden></p><strong class="fb-sling-count"></strong></div>
      <div class="fb-sling-board">${boardHTML(board,s.down)}</div>
      <div class="fb-sling-meter"><label>แรงดึง <progress max="100" value="0" aria-label="แรงดึงหนังสติ๊ก"></progress></label><span>ดึงหินตรงกลางลงมา · เล็งจากจุด · ปล่อยเพื่อยิง</span></div>
      <p class="fb-sling-feedback" role="status" aria-live="polite">พร้อมแล้ว ลองดึงหนังสติ๊กต๊ะ</p>
      <details class="fb-sling-access"><summary>ใช้ปุ่มเล็งและยิง</summary><div><label>ทิศทาง <input type="range" min="-55" max="55" value="0" data-sling="aim"></label><label>แรง <input type="range" min="0" max="100" value="85" data-sling="force"></label><button type="button" class="fb-button" data-sling="shoot" data-primary>ปล่อยหิน →</button></div></details>
      <div class="fb-sling-album" hidden></div>`;
    s.stage = host.querySelector('.fb-sling-stage');
    s.props = new Map(board.map(item => [item.id,s.stage.querySelector(`[data-sling-prop="${item.id}"]`)]));
    s.dots = Array.from(s.stage.querySelectorAll('.fb-sling-dots circle'));
    s.stone = s.stage.querySelector('.fb-sling-stone');
    s.band = s.stage.querySelector('.fb-sling-band');
    s.bandLight = s.stage.querySelector('.fb-sling-band-light');
    s.trail = s.stage.querySelector('.fb-sling-trail');
    s.burst = s.stage.querySelector('.fb-sling-burst');
    const opts = { signal:s.events.signal };
    s.stage.addEventListener('pointerdown', event => startPull(s,event),opts);
    s.stage.addEventListener('pointermove', event => movePull(s,event),opts);
    s.stage.addEventListener('pointerup', event => endPull(s,event,true),opts);
    s.stage.addEventListener('pointercancel', event => endPull(s,event,false),opts);
    s.stage.addEventListener('lostpointercapture', event => endPull(s,event,false),opts);
    host.addEventListener('click', event => click(s,event),opts);
    host.addEventListener('input', () => { if (!s.busy && !s.pointer && !s.done) paintPull(s, assistShot(s)); },opts);
    host.querySelector('details').addEventListener('toggle', event => {
      if (!s.busy && !s.pointer && !s.done) paintPull(s,event.target.open ? assistShot(s) : C.draw(W.originX,W.originY));
    },opts);
    paintPull(s,C.draw(W.originX,W.originY));
    showTarget(s);
  }
  function showTarget(s) {
    const item = s.board[s.step];
    if (!item) return;
    s.host.querySelector('.fb-sling-line').textContent = phrase(item);
    s.host.querySelector('.fb-sling-count').textContent = `${s.step} / ${s.board.length}`;
    s.host.querySelector('.fb-sling-meaning').textContent = `${item.sv} · ${item.th}`;
    if (s.hint) highlight(s);
    listen(phrase(item));
  }
  function highlight(s) {
    s.host.querySelector('.fb-sling-meaning').hidden = !s.hint;
    s.host.querySelector('[data-sling="hint"]').setAttribute('aria-pressed',String(!!s.hint));
    for (const [id,node] of s.props) node.classList.toggle('is-sling-hint',s.hint && id === s.board[s.step]?.id);
  }
  function feedback(s,text,tone = '') {
    const note = s.host.querySelector('.fb-sling-feedback');
    note.textContent = text;
    note.dataset.tone = tone;
  }
  function click(s,event) {
    const button = event.target.closest('button[data-sling]');
    if (!button || button.disabled) return;
    const { sling, value } = button.dataset;
    if (sling === 'word') listen(s.board.find(item => item.id === value).sv);
    if (sling === 'hint') { s.hint = !s.hint; highlight(s); }
    if (sling === 'replay' && s.board[s.step]) listen(phrase(s.board[s.step]));
    if (sling === 'shoot' && !s.busy && !s.pointer && !s.done) launch(s,assistShot(s));
  }
  function assistShot(s) {
    const angle = -Number(s.host.querySelector('[data-sling="aim"]').value) * Math.PI/180;
    const force = Number(s.host.querySelector('[data-sling="force"]').value) / 100 * W.pull;
    return C.draw(W.originX + Math.sin(angle)*force,W.originY + Math.cos(angle)*force);
  }
  function startPull(s,event) {
    if (s.busy || s.done || s.pointer || event.button !== 0 || !event.target.closest('[data-sling-grab]')) return;
    s.pointer = { id:event.pointerId, x:event.clientX, y:event.clientY, rect:s.stage.getBoundingClientRect() };
    s.stage.setPointerCapture(event.pointerId);
    s.stage.classList.add('is-drawing');
    paintPull(s,C.draw(W.originX,W.originY));
  }
  function aim(s,event) {
    const p = s.pointer;
    return C.draw(W.originX + (event.clientX-p.x)*W.width/p.rect.width, W.originY + (event.clientY-p.y)*W.height/p.rect.height);
  }
  function movePull(s,event) { if (s.pointer?.id === event.pointerId) paintPull(s,aim(s,event)); }
  function endPull(s,event,fire) {
    if (s.pointer?.id !== event.pointerId) return;
    const shot = fire ? aim(s,event) : null;
    s.pointer = null;
    s.stage.classList.remove('is-drawing');
    if (shot && shot.strength >= .055) launch(s,shot);
    else paintPull(s,C.draw(W.originX,W.originY));
  }
  function paintBand(s,x,y) {
    const path = `M218 305L${x} ${y}L282 305`;
    s.band.setAttribute('d',path); s.bandLight.setAttribute('d',path);
  }
  function paintStone(s,point) {
    s.stone.setAttribute('cx',point.x);
    s.stone.setAttribute('cy',point.y);
  }
  function paintPull(s,shot) {
    paintBand(s,shot.x,shot.y); paintStone(s,shot);
    const power = s.host.querySelector('progress');
    power.value = Math.round(shot.strength*100);
    power.dataset.power = shot.strength < .62 ? 'low' : 'good';
    let previous = shot, ended = shot.strength < .12;
    const board = s.board.filter(item => !s.down.has(item.id));
    s.dots.forEach((dot,i) => {
      if (ended) { dot.setAttribute('opacity','0'); return; }
      const next = C.position(shot,(i+1)*.055);
      const hit = C.firstHit(previous,next,board);
      const point = hit ? { x:previous.x + (next.x-previous.x)*hit.time, y:previous.y + (next.y-previous.y)*hit.time } : next;
      ended = !!hit || point.y > W.height || point.x < 0 || point.x > W.width;
      dot.setAttribute('cx',point.x); dot.setAttribute('cy',point.y);
      dot.setAttribute('opacity',ended && !hit ? '0' : `${.93-i*.028}`);
      previous = point;
    });
  }
  function launch(s,shot) {
    s.busy = true;
    s.stage.classList.add('is-flying');
    window.SpeechEngine?.stopAudio?.();
    sound('snap',.6);
    s.dots.forEach(dot => dot.setAttribute('opacity','0'));
    const start = performance.now();
    const board = s.board.filter(item => !s.down.has(item.id));
    let previous = shot;
    const flight = now => {
      const time = (now-start)/1000;
      const next = C.position(shot,time);
      const hit = C.firstHit(previous,next,board);
      const recoil = Math.exp(-time*21) * Math.cos(time*64);
      paintBand(s,W.originX + (shot.x-W.originX)*recoil,W.originY + (shot.y-W.originY)*recoil);
      if (hit) {
        const point = { x:previous.x + (next.x-previous.x)*hit.time, y:previous.y + (next.y-previous.y)*hit.time };
        paintStone(s,point);
        s.trail.setAttribute('opacity','0');
        landHit(s,shot,time,hit.target,point);
      } else if (next.y > W.height + 8 || next.x < -14 || next.x > W.width + 14 || time > 2.3) {
        sound('ground',.55);
        retry(s,shot.strength < .67 ? 'หินไปไม่ถึง ลองดึงให้ตึงขึ้นอีกนิด' : 'พลาดไปนิด ดูเส้นจุดแล้วขยับเล็งใหม่ได้จ้า');
      } else {
        if (!reduced()) {
          const tail = C.position(shot,Math.max(0,time-.037));
          s.trail.setAttribute('d',`M${tail.x} ${tail.y}L${next.x} ${next.y}`);
          s.trail.setAttribute('opacity','.65');
        }
        paintStone(s,next); previous = next;
        s.frame = requestAnimationFrame(flight);
      }
    };
    s.frame = requestAnimationFrame(flight);
  }
  function rearm(s) {
    s.busy = false;
    s.stage.classList.remove('is-flying');
    s.trail.setAttribute('opacity','0');
    const settings = s.host.querySelector('details');
    paintPull(s,settings.open && !s.done ? assistShot(s) : C.draw(W.originX,W.originY));
  }
  function retry(s,message) {
    s.attempts++;
    if (s.attempts >= 3) { s.hint = true; highlight(s); }
    feedback(s,message,'retry');
    rearm(s);
  }
  function landHit(s,shot,time,item,point) {
    const result = C.impact(shot,time,s.board[s.step].id,item);
    const prop = s.props.get(item.id);
    sound(item.material,result === 'weak' ? .42 : .85);
    if (result === 'weak') {
      if (!reduced()) prop.querySelector('svg').animate?.([{ transform:'rotate(0)' },{ transform:'rotate(12deg)' },{ transform:'rotate(-7deg)' },{ transform:'rotate(0)' }],{ duration:270 });
      retry(s,'โดนแล้วแต่ยังไม่หล่น ลองดึงแรงขึ้นแล้วเล็งที่เดิม');
      return;
    }
    prop.parentElement.append(prop);
    const correct = result === 'hit';
    const correction = `โดน ${item.sv} (${item.th}) คนละชิ้นกับที่ขอ วางกลับแล้วลองใหม่ได้จ้า`;
    let reward = 0;
    if (correct) {
      s.down.add(item.id);
      reward = s.onHit();
      s.step++;
      s.host.querySelector('.fb-sling-count').textContent = `${s.step} / ${s.board.length}`;
      feedback(s,`✓ ${item.sv} · ${item.th}`,'good');
    } else feedback(s,correction,'retry');
    s.stone.setAttribute('opacity','0');
    const start = performance.now(), direction = shot.vx >= 0 ? 1 : -1;
    const drift = direction * Math.min(50,18 + Math.abs(shot.vx)*.085);
    const edge = Math.hypot(item.width,item.height) / 2 + 6;
    const landingX = Math.max(edge,Math.min(W.width-edge,item.x+drift));
    const landing = floor(item);
    const duration = reduced() ? 340 : 655;
    let bounced = false;
    const fall = now => {
      const fraction = Math.min(1,(now-start)/duration);
      const t = Math.min(1,fraction/.76);
      const x = item.x + (landingX-item.x) * t;
      const y = t < 1 ? item.y + (landing-item.y)*t*t - 18*Math.sin(Math.PI*t) : landing - 8*Math.sin(Math.PI*(fraction-.76)/.24);
      prop.setAttribute('transform',at(x,y,direction*(t*104 - Math.max(0,fraction-.76)*45)));
      s.burst.setAttribute('transform',`translate(${point.x} ${point.y}) scale(${.45+fraction*2})`);
      s.burst.setAttribute('opacity',reduced() ? '0' : String(Math.max(0,.9-fraction*3)));
      if (t === 1 && !bounced) { bounced = true; sound(item.material,.3); }
      if (fraction < 1 || (!correct && now-start < duration+210)) { s.frame = requestAnimationFrame(fall); return; }
      s.stone.removeAttribute('opacity');
      if (!correct) {
        prop.setAttribute('transform',at(item.x,item.y));
        if (!reduced()) prop.animate?.([{ opacity:.35 },{ opacity:1 }], { duration:175 });
        retry(s,correction);
      } else if (s.step === s.board.length) finish(s,reward);
      else { s.attempts = 0; s.hint = false; highlight(s); rearm(s); showTarget(s); }
    };
    s.frame = requestAnimationFrame(fall);
  }
  function finish(s,reward) {
    s.done = true;
    rearm(s);
    s.host.querySelector('.fb-sling-line').textContent = 'Alla saker på gräset!';
    s.host.querySelector('[data-sling="replay"]').disabled = true;
    s.host.querySelector('.fb-sling-task [data-sling="hint"]').hidden = true;
    s.host.querySelector('.fb-sling-meaning').hidden = true;
    s.host.querySelector('.fb-sling-access').hidden = true;
    s.host.querySelector('.fb-sling-meter').hidden = true;
    feedback(s,`ครบทุกชิ้นแล้ว · +3 เหรียญฟาร์ม${reward ? ` · +${reward} XP` : ''}`,'good');
    const album = s.host.querySelector('.fb-sling-album');
    album.hidden = false;
    album.innerHTML = `<span class="fb-kicker">ทบทวนของที่ยิงตก · แตะเพื่อฟัง 1×</span><div>${s.board.map(item => `<button type="button" class="fb-button" data-sling="word" data-value="${item.id}"><strong lang="sv">${item.sv}</strong><small>${item.th}</small></button>`).join('')}</div>`;
    listen('Alla saker på gräset!');
  }
  window.FarmMischief = { mount, destroy };
})();

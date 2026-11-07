/* Nattnyckeln — a Swedish, story-led hidden-animal escape room. */
(function () {
  'use strict';
  const C = window.ZooCore, A = window.ZooArt;
  const P = window.LearningProgress;
  const KEY = 'wilawan_nattnyckeln_v1';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const profile = read();
  let state = profile.run, dialog, opener, screen = 'intro', panel = 'search', selectedTrack, inspected;
  let zoom = 1, roomViews = {}, pulseId = null, pulseTimer = null, message = '', tone = '';
  let pointerStart = null;
  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY)) || {};
      return { run: C.restore(data.run), completed: Number.isSafeInteger(data.completed) && data.completed >= 0 ? data.completed : 0,
        episode: Number.isInteger(data.episode) && C.episodes[data.episode] ? data.episode : 0, uiLocale: 'th-v1', thai: data.uiLocale === 'th-v1' ? data.thai !== false : true, rewardedRun: Number.isFinite(data.rewardedRun) ? data.rewardedRun : null };
    } catch (_) { return { run: null, completed: 0, episode: 0, uiLocale: 'th-v1', thai: true, rewardedRun: null }; }
  }
  function save() {
    profile.run = state;
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch (_) { /* A full game also works without storage. */ }
  }
  function sound(id) { window.SpeechEngine?.playSound?.(id); }
  function tracks() { return state.trackOrder[C.rooms[state.room].id]; }
  function say(text) { window.SpeechEngine?.speakSwedish?.(text, 1); }
  function narrate(text) { window.SpeechEngine?.speakThai?.(text); }
  function stop() {
    clearTimeout(pulseTimer); pulseTimer = null; pulseId = null;
    pointerStart?.viewport?.classList.remove('ze-panning'); pointerStart = null;
    window.SpeechEngine?.stopAudio?.();
  }
  function open(returnTarget) {
    opener = returnTarget || document.activeElement;
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'ze-dialog'; dialog.lang = 'th';
      dialog.setAttribute('aria-labelledby', 'ze-title'); document.body.appendChild(dialog);
      dialog.addEventListener('click', onClick);
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      dialog.addEventListener('close', () => { stop(); (opener?.isConnected ? opener : $('[data-open-game="zoo"]'))?.focus(); });
      if (window.ResizeObserver) new ResizeObserver(() => { if (dialog.open && screen === 'play') fitWorld(); }).observe(dialog);
      dialog.addEventListener('pointerdown', event => {
        const viewport = event.target.closest('.ze-viewport');
        pointerStart = { x: event.clientX, y: event.clientY, viewport: event.pointerType === 'mouse' && event.button === 0 ? viewport : null,
          left: viewport?.scrollLeft || 0, top: viewport?.scrollTop || 0, pointerId: event.pointerId, moved: false };
      });
      dialog.addEventListener('pointermove', event => {
        const gesture = pointerStart;
        if (!gesture?.viewport || !event.buttons) return;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        if (!gesture.moved && Math.hypot(dx, dy) < 7) return;
        gesture.moved = true; event.preventDefault();
        if (!gesture.viewport.hasPointerCapture(event.pointerId)) gesture.viewport.setPointerCapture(event.pointerId);
        gesture.viewport.classList.add('ze-panning');
        gesture.viewport.scrollLeft = gesture.left - dx; gesture.viewport.scrollTop = gesture.top - dy;
      });
      dialog.addEventListener('pointerup', event => {
        const gesture = pointerStart;
        pointerStart = null;
        gesture?.viewport?.classList.remove('ze-panning');
        if (gesture?.viewport?.hasPointerCapture(event.pointerId)) gesture.viewport.releasePointerCapture(event.pointerId);
        if (gesture?.moved) { captureView(); return; }
        if (!event.target.closest('.ze-world') || event.target.closest('button') || !gesture) return;
        if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 8) notify('ตรงนี้มีแต่ใบไม้กับเงาจ้า ลองขยายภาพแล้วตามรอยรูปร่างดูนะ');
      });
      dialog.addEventListener('pointercancel', () => { pointerStart?.viewport?.classList.remove('ze-panning'); pointerStart = null; });
    }
    stop(); screen = 'intro'; panel = 'search'; inspected = null; message = ''; tone = '';
    if (!dialog.open) dialog.showModal();
    renderIntro();
  }
  function close() { save(); stop(); if (dialog?.open) dialog.close(); window.SmallGames?.renderLobby(); }
  function header(intro = false) {
    return `<header class="ze-header"><button type="button" class="ze-icon-button" data-ze="close" aria-label="กลับไปเลือกเกม">←</button><div class="ze-brand"><span>ความลับในสวนสัตว์ยามค่ำ</span><h2 id="ze-title">กุญแจแห่งรัตติกาล</h2></div><div class="ze-header-actions">${!intro ? `<span class="ze-found-count" aria-label="พบสัตว์แล้ว ${state.found.length} จาก 12 ตัว">${A.icon('eye')} ${state.found.length}<small>/ 12</small></span><button type="button" class="ze-icon-button ${panel === 'journal' ? 'active' : ''}" data-ze="journal" aria-label="เปิดสมุดบันทึก">${A.icon('book')}</button><button type="button" class="ze-icon-button ${panel === 'map' ? 'active' : ''}" data-ze="map" aria-label="ดูแผนที่สวนสัตว์">${A.icon('compass')}</button>` : ''}<button type="button" class="ze-language" data-ze="thai" aria-label="แสดงคำแปลไทยของคำสวีเดนที่กำลังฝึก" aria-pressed="${profile.thai}">คำแปล</button></div></header>`;
  }
  function applyClasses() {
    dialog.className = 'ze-dialog' + (profile.thai ? ' ze-thai' : '') + (state?.hard !== false ? ' ze-hard' : '') + (state?.lamp ? ' ze-lamp-on' : '');
  }
  function renderIntro() {
    applyClasses();
    const course = P.stats(P.state(), 'zoo');
    const episodes = `<div class="ze-episodes"><span class="ze-kicker">เลือกเวรตรวจสวนสัตว์ · ${course.completed} / 4 คืน</span>${C.episodes.map((e,i) => `<button type="button" data-ze="episode" data-episode="${i}" aria-pressed="${profile.episode === i}" ${P.unlocked(P.state(), `zoo:${i}`) ? '' : 'disabled'}><strong>${P.done(P.state(), `zoo:${i}`) ? '✓ ' : ''}${e.th}</strong><small>${e.goal}</small></button>`).join('')}</div>`;
    const canResume = state?.status === 'playing';
    dialog.innerHTML = `${header(true)}<div class="ze-intro">${A.image('forest', 'ze-intro-image')}<div class="ze-intro-vignette"></div><div class="ze-intro-copy"><span class="ze-kicker">ผจญภัยไขปริศนา · 4 คืน · คืนละ 3 บท · 48 ร่องรอย</span><h1>สวนสัตว์ปิดแล้ว<br><em>แต่ร่องรอยยังอยู่</em></h1><p class="ze-intro-prologue">${C.episodes[profile.episode].story}</p><div class="ze-letter"><span class="ze-letter-label">ข้อความจากซิกเน ผู้ดูแลสวนสัตว์</span><p>“ฉันอยู่ที่คอกพักสัตว์นะ กุญแจสำรองอยู่ในเรือนกระจก ระหว่างทางมีล็อกกลไกเก่าอยู่สามด่าน อ่านบันทึกของฉัน ตามหาสัตว์ และสังเกตที่ซ่อนของพวกมัน แล้วมาเจอกันที่ประตูจ้า”</p><span class="ze-signature">— ซิกเน ผู้ดูแลสวนสัตว์</span></div><div class="ze-learning-goal"><strong>เกมนี้ฝึกอะไร?</strong><p>ฝึกชื่อสัตว์ คำบอกตำแหน่ง คำสั่ง และการเรียงประโยคภาษาสวีเดน วิธีเล่นและคำใบ้เป็นภาษาไทย เลือกคำสวีเดนที่ถูกเพื่อเก็บเบาะแสและหาทางออกกันต๊ะ</p></div><div class="ze-intro-meta"><span>${A.icon('eye')} สัตว์ซ่อนอยู่ 12 ตัว</span><span>${A.icon('lock')} ปริศนา 3 ด่าน</span><span>${A.icon('moon')} ไม่จับเวลา</span></div>${episodes}<div class="ze-intro-buttons">${canResume ? `<button type="button" class="ze-primary" data-ze="resume">เล่นต่อ · ${C.episodes[state.episode].th} <span>${state.found.length}/12 →</span></button><button type="button" class="ze-text-button" data-ze="new-confirm">เริ่มรอบใหม่</button>` : `<button type="button" class="ze-primary" data-ze="new">เปิดสมุดแล้วเริ่มผจญภัย ${A.icon('book')}</button>`}</div><p class="ze-intro-footnote">ค่อย ๆ หาได้ตามสบาย แตะฟังคำสวีเดนซ้ำได้ และปิดเกมกลับมาเล่นต่อได้เสมอ</p></div><div class="ze-intro-seal">${A.icon('key')}<span>ตราสามดวง<br>หนึ่งทางออก</span></div></div>`;
  }
  function start(fresh) {
    if (fresh || !state) { if (!P.unlocked(P.state(), `zoo:${profile.episode}`)) return; state = C.create(Math.random, profile.episode); roomViews = {}; }
    screen = state.status === 'escaped' ? 'ending' : 'play'; panel = 'search'; inspected = null; zoom = 1;
    selectedTrack = tracks().find(id => !state.found.includes(id)) || tracks()[0];
    message = C.episodes[state.episode].story + ' กด + เพื่อขยายภาพ แล้วลากหรือปัดเพื่อค้นหา'; tone = '';
    save(); if (screen === 'ending') renderEnding(); else renderGame();
  }
  function captureView() {
    const viewport = $('.ze-viewport', dialog);
    if (viewport && state) roomViews[state.room] = { x: viewport.scrollLeft, y: viewport.scrollTop, zoom };
  }
  function renderGame() {
    const previousFocus = dialog.contains(document.activeElement) ? document.activeElement : null;
    const focusAction = previousFocus?.dataset?.ze;
    const focusKey = ['digit', 'word', 'step', 'index', 'animal'].find(key => previousFocus?.dataset?.[key] !== undefined);
    const focusValue = focusKey ? previousFocus.dataset[focusKey] : null;
    const bodyScroll = $('.ze-game-body', dialog)?.scrollTop || 0;
    const sidebarScroll = $('.ze-sidebar', dialog)?.scrollTop || 0;
    captureView(); applyClasses();
    const room = C.rooms[state.room];
    const count = C.foundInRoom(state).length;
    const isSolved = state.solved.includes(room.id);
    dialog.innerHTML = `${header()}<div class="ze-game-body"><main class="ze-stage"><div class="ze-chapter-row"><div><span class="ze-kicker">คืน ${state.episode + 1} · บท ${room.chapter} / 03</span><h3>${room.titleTh}</h3></div><span class="ze-chapter-found">${count} จาก 4 ร่องรอยที่พบแล้ว ${count === 4 ? '✓' : ''}</span></div><div class="ze-viewport" aria-label="${room.titleTh}. ขยายภาพแล้วหาสัตว์ที่ซ่อนอยู่ 4 ตัว"><div class="ze-world" style="--ze-zoom:${zoom}">${A.image(room.id, 'ze-background')}<div class="ze-world-atmosphere" aria-hidden="true"></div>${room.animals.map((id, i) => animalButton(C.byId[id], i)).join('')}${A.foreground(room.id)}<div class="ze-fireflies" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<i style="--n:${i};left:${12 + i * 13}%;top:${28 + i % 3 * 18}%"></i>`).join('')}</div></div></div><div class="ze-stage-controls"><div class="ze-zoom-controls"><button type="button" data-ze="zoom-out" aria-label="ย่อภาพ" ${zoom <= 1 ? 'disabled' : ''}>−</button><span>${Math.round(zoom * 100)}%</span><button type="button" data-ze="zoom-in" aria-label="ขยายภาพ" ${zoom >= 3 ? 'disabled' : ''}>+</button></div><button type="button" class="ze-tool-button" data-ze="difficulty" aria-pressed="${!state.hard}" title="ปรับให้มองเห็นรูปร่างของสัตว์ชัดขึ้น">${A.icon('eye')} ${state.hard ? 'กลางคืน · ยาก' : 'แสงอ่อน · มองง่าย'}</button>${state.solved.length >= 2 ? `<button type="button" class="ze-tool-button ${state.lamp ? 'active' : ''}" data-ze="lamp" aria-pressed="${state.lamp}">${A.icon('lamp')} โคมกลางคืน</button>` : `<span class="ze-pan-tip">${A.icon('lens')} ขยายภาพแล้วค้นหา</span>`}</div><div id="ze-status" class="ze-status" role="status" aria-live="polite" data-tone="${tone}">${esc(message || 'ตามคำใบ้แล้วมองให้ดี บางอย่างที่เหมือนใบไม้หรือก้อนหินอาจมีชีวิตอยู่นะ')}</div><div class="ze-radio"><div class="ze-radio-portrait">${A.portrait()}</div><div><span class="ze-radio-name">ซิกเน <small>· วิทยุสวนสัตว์</small></span><p>${room.storyTh}</p><p class="ze-learning-goal">${C.episodes[state.episode].goal} · ${room.goalTh}</p><button type="button" class="ze-text-button" data-ze="radio">${A.icon('sound')} ฟังเรื่องราวภาษาไทย</button></div></div><div class="ze-inventory" aria-label="ของในกระเป๋า"><span>กระเป๋า</span><button type="button" data-ze="journal">${A.icon('book')} สมุดบันทึก</button>${state.solved.length >= 1 ? `<button type="button" data-ze="binoculars">${A.icon('lens')} กล้องส่อง</button>` : ''}${state.solved.length >= 2 ? `<button type="button" data-ze="lamp">${A.icon('lamp')} โคมกลางคืน</button>` : ''}<div class="ze-sigils" aria-label="ตราประทับ ${state.solved.length} จาก 3 ดวง">${C.rooms.map((r, i) => `<span class="${state.solved.includes(r.id) ? 'earned' : ''}" title="${r.rewardTh}">${A.icon(['leaf', 'water', 'flower'][i])}</span>`).join('')}</div></div></main><aside class="ze-sidebar" aria-label="สมุดบันทึกและคำใบ้">${renderPanel(room, count, isSolved)}</aside></div>`;
    const viewport = $('.ze-viewport', dialog), view = roomViews[state.room];
    fitWorld();
    if (view) { viewport.scrollLeft = view.x; viewport.scrollTop = view.y; }
    $('.ze-game-body', dialog).scrollTop = bodyScroll;
    $('.ze-sidebar', dialog).scrollTop = sidebarScroll;
    const feedbackAnchor = $('[data-ze="try-lock"]', dialog) || $('.ze-answer-choices', dialog);
    if (feedbackAnchor) {
      const localStatus = document.createElement('div'); localStatus.id = 'ze-panel-status'; localStatus.className = 'ze-panel-status';
      localStatus.dataset.tone = tone; localStatus.hidden = !tone; localStatus.textContent = message;
      feedbackAnchor.after(localStatus);
    }
    if (focusAction) {
      const selector = `[data-ze="${CSS.escape(focusAction)}"]` + (focusKey ? `[data-${focusKey}="${CSS.escape(focusValue)}"]` : '');
      const replacement = $(selector, dialog);
      const fallback = panel === 'puzzle' ? $('[data-ze="word"]:not(:disabled), [data-ze="step"]:not(:disabled), [data-ze="try-lock"]:not(:disabled)', dialog) : null;
      (replacement && !replacement.disabled ? replacement : fallback)?.focus({ preventScroll: true });
    }
  }
  function animalButton(animal, index) {
    const found = state.found.includes(animal.id);
    return `<button type="button" class="ze-animal ${found ? 'ze-found' : ''} ${pulseId === animal.id ? 'ze-hint-pulse' : ''}" data-ze="inspect" data-animal="${animal.id}" aria-label="${found ? 'ดูอีกครั้ง: ' + animal.sv : 'สำรวจร่องรอยที่ ' + (tracks().indexOf(animal.id) + 1) + ': ' + animal.clueTh}" style="left:${animal.x / 12}%;top:${animal.y / 8}%;width:${animal.w / 12}%;height:${animal.h / 8}%">${A.animal(animal.id)}${found ? `<span class="ze-found-pin">${A.icon('check')}</span>` : ''}</button>`;
  }
  function renderPanel(room, count, isSolved) {
    if (panel === 'map') return renderMap();
    if (panel === 'journal') return renderJournal();
    if (panel === 'puzzle') return renderPuzzle(room, count, isSolved);
    if (panel === 'found' && inspected) return renderDiscovery(C.byId[inspected]);
    const target = C.byId[selectedTrack] || C.byId[room.animals[0]];
    const already = state.found.includes(target.id);
    const hintCount = state.hints[target.id] || 0;
    return `<div class="ze-panel-head"><span class="ze-kicker">ซิกเนฝากร่องรอยไว้ 4 จุด</span><h3>ชีวิตที่ซ่อนอยู่</h3><p>เลือกคำใบ้ แล้วหาสัตว์ในภาพ เมื่อพบแล้ว ตอบคำถามภาษาสวีเดนของคืนนี้ให้ถูกเพื่อเก็บบันทึก</p></div><div class="ze-track-tabs" role="group" aria-label="เลือกคำใบ้ที่ต้องการตามหา">${tracks().map((id, i) => `<button type="button" data-ze="track" data-animal="${id}" aria-pressed="${selectedTrack === id}" aria-label="คำใบ้ที่ ${i + 1}${state.found.includes(id) ? ' พบแล้ว' : ''}">${state.found.includes(id) ? '✓' : '0' + (i + 1)}</button>`).join('')}</div><div class="ze-clue"><span class="ze-paper-label">คำใบ้ที่ ${tracks().indexOf(target.id) + 1}</span><p>${already ? target.sentenceTh : target.clueTh}</p>${already ? `<span class="ze-clue-stamp">บันทึกลงสมุดแล้ว</span>` : ''}<button type="button" class="ze-text-button" data-ze="listen-clue">${A.icon('sound')} ฟังคำใบ้ภาษาไทย</button></div>${!already ? `<div class="ze-hint-area">${hintCount ? `<p class="ze-hint-copy">${target.hintsTh[hintCount - 1]}</p>` : '<p>ถ้าหาไม่เจอ ขอความช่วยเหลือได้ 3 ขั้น ขั้นสุดท้ายจะแสดงบริเวณเล็ก ๆ ในภาพให้ดูจ้า</p>'}<button type="button" class="ze-secondary" data-ze="hint">${hintCount >= 3 ? 'แสดงบริเวณอีกครั้ง' : 'ขอคำใบ้เพิ่มจากซิกเน'} <span>${Math.min(3, hintCount + 1)} / 3</span></button></div>` : ''}<div class="ze-panel-bottom"><div class="ze-dots">${tracks().map(id => `<span class="${state.found.includes(id) ? 'filled' : ''}"></span>`).join('')}</div><button type="button" class="ze-primary" data-ze="puzzle">${A.icon(isSolved ? 'check' : 'lock')} ${isSolved ? 'ประตูเปิดแล้ว' : count === 4 ? 'ไปไขปริศนาล็อก' : 'ดูล็อกของบริเวณนี้'} <span>→</span></button></div>`;
  }
  function animalsIndex(id) { return C.animals.findIndex(a => a.id === id); }
  function renderDiscovery(animal) {
    const found = state.found.includes(animal.id), challenge = C.challenge(state, animal.id);
    const choices = C.shuffle(challenge.choices, () => .47 + (animalsIndex(animal.id) % 3) * .13);
    return `<div class="ze-panel-head"><span class="ze-kicker">${found ? 'เก็บร่องรอยได้แล้ว เก่งจังฮู้!' : 'มีบางอย่างอยู่ในเงา'}</span><h3 lang="${found ? 'sv' : 'th'}">${found ? animal.sv : 'เราพบตัวอะไรนะ?'}</h3></div><div class="ze-discovery-art">${A.animal(animal.id)}</div>${found ? `<div class="ze-discovery-note"><p lang="sv">${animal.sentence}</p><p class="ze-th" lang="th">${animal.sentenceTh}</p><button type="button" class="ze-text-button" data-ze="listen-animal">${A.icon('sound')} ฟังประโยคอีกครั้ง · 1×</button><div class="ze-field-note"><span>${state.room === 0 ? 'หมายเลขบนป้ายทองเหลือง' : 'จากสมุดของซิกเน'}</span>${state.room === 0 ? `<strong class="ze-mark-digit">${state.marks[animal.id]}</strong>` : ''}<p>${animal.noteTh}</p></div></div><button type="button" class="ze-primary" data-ze="search">${C.foundInRoom(state).length === 4 ? 'พบครบ 4 ตัวแล้ว · ไปไขล็อก →' : 'ตามหาตัวต่อไป →'}</button>` : `<p class="ze-discovery-question">${challenge.question}</p>${state.episode === 3 ? `<button type="button" class="ze-secondary" data-ze="listen-challenge">${A.icon('sound')} ฟังประโยคอีกครั้ง · 1×</button>` : ''}<div class="ze-answer-choices">${choices.map(choice => `<button type="button" lang="${challenge.lang}" data-ze="identify" data-answer="${esc(choice)}">${choice}</button>`).join('')}</div>${state.episode === 0 ? `<p class="ze-th ze-identify-translation" lang="th">คำใบ้ความหมาย: ${animal.th}</p>` : ''}<button type="button" class="ze-text-button" data-ze="search">กลับไปค้นหาในภาพ</button>`}`;
  }
  function renderJournal() {
    return `<div class="ze-panel-head"><span class="ze-kicker">สมุดบันทึกของซิกเน</span><h3>สิ่งที่พบในคืนนี้</h3><p>แตะบันทึกเพื่อฟังประโยคสวีเดน อ่านคำอธิบายไทยและเก็บเบาะแสไว้ไขปริศนา</p></div><div class="ze-journal-list">${C.rooms.map(room => `<section><h4>${room.titleTh} <span>${C.foundInRoom(state, C.rooms.indexOf(room)).length}/4</span></h4>${state.found.filter(id => C.byId[id].room === room.id).map(id => {
      const animal = C.byId[id];
      return `<button type="button" class="ze-journal-entry" data-ze="journal-word" data-animal="${id}">${A.animal(id)}<span><strong lang="sv">${animal.sv}</strong><span lang="sv">${animal.sentence}</span><span class="ze-th" lang="th">${animal.sentenceTh}</span><small>${room.id === 'forest' ? 'หมายเลข ' + state.marks[id] + ' · ' : ''}${animal.noteTh}</small></span></button>`;
    }).join('') || '<p class="ze-empty-note">ยังไม่มีบันทึกในบริเวณนี้</p>'}</section>`).join('')}</div><button type="button" class="ze-secondary" data-ze="search">กลับไปค้นหาต่อ</button>`;
  }
  function renderMap() {
    return `<div class="ze-panel-head"><span class="ze-kicker">แผนที่เก่าของสวนสัตว์</span><h3>ทางเดินผ่านค่ำคืน</h3><p>กลับไปบริเวณที่เปิดแล้วได้เสมอ หากจะไปต่อ ต้องหาสัตว์ให้ครบ 4 ตัวและไขล็อกของบริเวณนั้นก่อนนะ</p></div><div class="ze-map-path">${C.rooms.map((room, i) => `<button type="button" class="ze-map-stop ${state.room === i ? 'current' : ''}" data-ze="travel" data-room="${i}" ${i > state.solved.length ? 'disabled' : ''}><span>${i > state.solved.length ? A.icon('lock') : state.solved.includes(room.id) ? A.icon('check') : room.chapter}</span><div><strong>${room.titleTh}</strong><small>${room.subtitleTh}</small></div></button>`).join('')}<div class="ze-map-exit">${A.icon('key')} ประตูเจ้าหน้าที่</div></div><button type="button" class="ze-secondary" data-ze="search">กลับไปค้นหาในภาพ</button>`;
  }
  function renderPuzzle(room, count, solved) {
    const missing = count < 4;
    const values = state.locks[room.id];
    return `<div class="ze-panel-head"><span class="ze-kicker">${room.rewardTh}</span><h3>${room.puzzleTitleTh}</h3><p>${missing ? 'ยังมีเบาะแสไม่ครบ หาสัตว์แล้วเลือกชื่อให้ถูกทั้ง 4 ตัวก่อนนะ' : solved ? 'กลไกทำงานแล้ว ทางไปต่อเปิดแล้วจ้า' : room.puzzleClueTh}</p><button type="button" class="ze-text-button" data-ze="listen-lock">${A.icon('sound')} ฟังวิธีไขปริศนาภาษาไทย</button></div>${missing ? `<div class="ze-locked-art">${A.icon('lock')}<span>พบแล้ว ${count} จาก 4 ตัว</span></div>` : solved ? `<div class="ze-reward">${A.icon(['leaf', 'water', 'flower'][state.room])}<strong>${room.rewardTh}</strong><p>${state.room === 0 ? 'มีกล้องส่องอยู่หลังล็อก เอาไว้ขยายภาพแล้วค้นหาร่องรอยที่อ่าวนะ' : 'มีโคมไฟกลางคืนรออยู่ที่สะพาน เก็บไปส่องหาสัตว์ในเรือนกระจกกัน'}</p><button type="button" class="ze-primary" data-ze="next">${state.room === 0 ? 'เดินต่อไปอ่าวกก' : 'เข้าไปในเรือนกระจก'} →</button></div>` : `<div class="ze-puzzle-workspace">${state.room === 0 ? `<div class="ze-code-slots" aria-label="รหัสที่ใส่: ${values || 'ยังว่าง'}">${Array.from({ length: 4 }, (_, i) => `<span>${values[i] || '·'}</span>`).join('')}</div><div class="ze-keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '↺', 0, '⌫'].map(key => `<button type="button" data-ze="digit" data-digit="${key}" aria-label="${key === '⌫' ? 'ลบตัวเลขสุดท้าย' : key === '↺' ? 'ล้างรหัสทั้งหมด' : 'เลข ' + key}">${key}</button>`).join('')}</div><div class="ze-mini-evidence">${C.rooms[0].animals.slice().sort((a, b) => C.byId[a].sv.localeCompare(C.byId[b].sv, 'sv')).map(id => `<span><span><span lang="sv">${C.byId[id].sv}</span><small class="ze-th" lang="th">${C.byId[id].th}</small></span><b>${state.marks[id]}</b></span>`).join('')}</div>` : state.room === 1 ? `<div class="ze-order-slots" aria-label="ลำดับที่เราเลือก">${Array.from({ length: 4 }, (_, i) => {
      const step = C.sluiceSteps.find(step => step.id === values[i]);
      return `<button type="button" data-ze="remove-step" data-index="${i}" ${!step ? 'disabled' : ''}><span>${i + 1}</span>${step ? `<span class="ze-token-label"><span lang="sv">${step.text} ×</span><small class="ze-th" lang="th">${step.th}</small></span>` : 'เลือกป้ายมาใส่ตรงนี้'}</button>`;
    }).join('')}</div><div class="ze-step-bank">${[C.sluiceSteps[2], C.sluiceSteps[0], C.sluiceSteps[3], C.sluiceSteps[1]].map(step => `<button type="button" data-ze="step" data-step="${step.id}" ${values.includes(step.id) ? 'disabled' : ''}><span lang="sv">${step.text}</span><small class="ze-th" lang="th">${step.th}</small></button>`).join('')}</div>` : `<div class="ze-sentence-slots" aria-label="ประโยคสวีเดนที่เราเรียง">${values.length ? values.map((word, i) => `<button type="button" lang="sv" data-ze="remove-word" data-index="${i}">${word} ×</button>`).join('') : '<span>แตะคำศัพท์มาเรียงตรงนี้…</span>'}</div><div class="ze-word-bank">${state.wordOrder.map(word => `<button type="button" data-ze="word" data-word="${word}" ${values.includes(word) ? 'disabled' : ''}><span lang="sv">${word}</span><small class="ze-th" lang="th">${C.phraseTh[word]}</small></button>`).join('')}</div><p class="ze-learning-goal">ความหมายที่ต้องการ: เมื่อโคมไฟส่องสว่าง เราก็สามารถเปิดประตูได้</p>`}<button type="button" class="ze-primary" data-ze="try-lock" ${values.length < (state.room === 0 || state.room === 1 ? 4 : 7) ? 'disabled' : ''}>${A.icon('key')} ${state.room === 2 ? 'ลองใช้ประโยคเปิดประตู' : 'ลองเปิดล็อก'} →</button></div>`}<div class="ze-puzzle-links"><button type="button" class="ze-text-button" data-ze="journal">${A.icon('book')} อ่านบันทึกที่เก็บไว้</button><button type="button" class="ze-text-button" data-ze="search">กลับไปค้นหาในภาพ</button></div>`;
  }
  function notify(text, style = '') {
    message = text; tone = style;
    const el = $('#ze-status', dialog);
    if (el) { el.textContent = text; el.dataset.tone = style; }
    const local = $('#ze-panel-status', dialog);
    if (local) {
      local.hidden = !style; local.textContent = text; local.dataset.tone = style;
      if (style === 'retry') local.scrollIntoView({ block: 'nearest' });
    }
  }
  function showPanel(name) {
    if (name !== 'found') tone = '';
    if ($('.ze-sidebar', dialog)) $('.ze-sidebar', dialog).scrollTop = 0;
    panel = name; renderGame();
    if (window.matchMedia('(max-width: 760px)').matches) $('.ze-sidebar', dialog)?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const heading = $('.ze-sidebar h3', dialog); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function fitWorld() {
    const viewport = $('.ze-viewport', dialog), world = $('.ze-world', dialog);
    if (!viewport || !world) return;
    const base = Math.min(viewport.clientWidth, viewport.clientHeight * 1.5);
    world.style.width = base * zoom + 'px';
  }
  function setZoom(next, focusAnimal) {
    const viewport = $('.ze-viewport', dialog), world = $('.ze-world', dialog);
    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2 - world.offsetLeft) / world.clientWidth;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / world.clientHeight;
    zoom = Math.max(1, Math.min(3, next)); world.style.setProperty('--ze-zoom', zoom);
    fitWorld();
    if (focusAnimal) {
      viewport.scrollLeft = focusAnimal.x / 1200 * world.clientWidth - viewport.clientWidth / 2;
      viewport.scrollTop = focusAnimal.y / 800 * world.clientHeight - viewport.clientHeight / 2;
    } else {
      viewport.scrollLeft = centerX * world.clientWidth + world.offsetLeft - viewport.clientWidth / 2;
      viewport.scrollTop = centerY * world.clientHeight - viewport.clientHeight / 2;
    }
    $('.ze-zoom-controls span', dialog).textContent = Math.round(zoom * 100) + '%';
    $('[data-ze="zoom-in"]', dialog).disabled = zoom >= 3;
    $('[data-ze="zoom-out"]', dialog).disabled = zoom <= 1;
    captureView();
  }
  function onClick(event) {
    const button = event.target.closest('button[data-ze]');
    if (!button || !dialog.contains(button) || button.disabled) return;
    const action = button.dataset.ze;
    if (action === 'close') return close();
    if (action === 'thai') { profile.thai = !profile.thai; save(); dialog.classList.toggle('ze-thai', profile.thai); button.setAttribute('aria-pressed', String(profile.thai)); return; }
    if (action === 'episode') { const episode = Number(button.dataset.episode); if (P.unlocked(P.state(), `zoo:${episode}`)) { profile.episode = episode; save(); renderIntro(); } return; }
    if (action === 'resume') return start(false);
    if (action === 'new') return start(true);
    if (action === 'new-confirm') {
      $('.ze-intro-buttons', dialog).innerHTML = '<p>ถ้าเริ่มใหม่ ความคืบหน้าของรอบที่บันทึกไว้จะถูกแทนที่นะ</p><button type="button" class="ze-primary" data-ze="new">เริ่มรอบใหม่</button><button type="button" class="ze-text-button" data-ze="resume">เก็บรอบเดิมแล้วเล่นต่อ</button>'; return;
    }
    if (screen === 'ending') {
      if (action === 'ending-word') say(C.byId[button.dataset.animal].sentence, true);
      if (action === 'replay') { profile.episode = Math.min(3, (state.episode || 0) + 1); screen = 'intro'; state = null; save(); renderIntro(); }
      return;
    }
    if (screen !== 'play') return;
    if (action === 'zoom-in') return setZoom(zoom + .5);
    if (action === 'zoom-out') return setZoom(zoom - .5);
    if (action === 'binoculars') { setZoom(zoom >= 2 ? 1 : 2.5); $('.ze-viewport', dialog)?.scrollIntoView({ block: 'nearest' }); notify('เปิดกล้องส่องแล้ว ลากหรือปัดภาพเพื่อมองตามร่องรอยได้เลย'); return; }
    if (action === 'difficulty') { state.hard = !state.hard; save(); applyClasses(); button.innerHTML = `${A.icon('eye')} ${state.hard ? 'กลางคืน · ยาก' : 'แสงอ่อน · มองง่าย'}`; button.setAttribute('aria-pressed', String(!state.hard)); return; }
    if (action === 'lamp' && state.solved.length >= 2) { state.lamp = !state.lamp; save(); renderGame(); notify(state.lamp ? 'เปิดโคมกลางคืนแล้ว สีเล็ก ๆ ที่ซ่อนอยู่จะมองเห็นได้ง่ายขึ้น' : 'ปิดโคมกลางคืนแล้ว'); return; }
    if (action === 'map' || action === 'journal' || action === 'puzzle') return showPanel(action);
    if (action === 'search') {
      inspected = null;
      tone = '';
      const next = tracks().find(id => !state.found.includes(id));
      if (next) selectedTrack = next;
      panel = C.foundInRoom(state).length === 4 ? 'puzzle' : 'search'; renderGame();
      $('.ze-stage', dialog)?.scrollIntoView({ block: 'nearest' }); return;
    }
    if (action === 'track') { selectedTrack = button.dataset.animal; panel = 'search'; renderGame(); return; }
    if (action === 'inspect') { inspected = button.dataset.animal; selectedTrack = inspected; sound('tap'); showPanel('found'); if (state.episode === 3 && !state.found.includes(inspected)) say(C.challenge(state, inspected).audio, true); return; }
    if (action === 'listen-challenge') return say(C.challenge(state, inspected).audio, true);
    if (action === 'identify') {
      const result = C.identify(state, inspected, button.dataset.answer);
      save();
      if (result === 'retry') { button.classList.add('ze-wrong-answer'); button.setAttribute('aria-invalid', 'true'); notify('ลองดูอีกครั้งนะ ดูภาพและตำแหน่ง ฟังอีกครั้ง แล้วลองเลือกคำตอบใหม่ได้จ้า', 'retry'); sound('retry'); return; }
      if (result === 'found' || result === 'already') {
        sound('correct'); message = C.byId[inspected].sentenceTh + ' บันทึกร่องรอยใหม่ลงสมุดแล้วจ้า'; tone = 'correct';
        showPanel('found'); say(C.byId[inspected].sentence, true);
      }
      return;
    }
    if (action === 'listen-clue') return narrate(state.found.includes(selectedTrack) ? C.byId[selectedTrack].sentenceTh : C.byId[selectedTrack].clueTh);
    if (action === 'listen-animal') return say(C.byId[inspected].sentence, true);
    if (action === 'journal-word') return say(C.byId[button.dataset.animal].sentence, true);
    if (action === 'radio') return narrate(C.rooms[state.room].storyTh);
    if (action === 'listen-lock') return narrate(C.rooms[state.room].puzzleClueTh);
    if (action === 'hint') {
      const hintResult = C.hint(state, selectedTrack); save();
      if (!hintResult) return;
      const text = C.byId[selectedTrack].hintsTh[state.hints[selectedTrack] - 1];
      if (state.hints[selectedTrack] >= 3) {
        clearTimeout(pulseTimer); pulseId = selectedTrack; renderGame(); setZoom(Math.max(1.5, zoom), C.byId[selectedTrack]);
        $('.ze-stage', dialog)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        pulseTimer = setTimeout(() => { pulseId = null; dialog?.querySelectorAll('.ze-hint-pulse').forEach(el => el.classList.remove('ze-hint-pulse')); }, 5500);
      } else renderGame();
      notify(text); return;
    }
    if (action === 'travel' || action === 'next') {
      captureView();
      const next = action === 'next' ? state.room + 1 : Number(button.dataset.room);
      if (C.go(state, next)) {
        // Prevent the departing room's scroll position being saved under the
        // arriving room's index during the next render.
        $('.ze-viewport', dialog)?.remove();
        $('.ze-game-body', dialog).scrollTop = 0;
        zoom = roomViews[next]?.zoom || 1; panel = 'search'; inspected = null;
        selectedTrack = tracks().find(id => !state.found.includes(id)) || tracks()[0];
        message = C.rooms[next].subtitleTh; tone = ''; save(); renderGame();
      }
      return;
    }
    const room = C.rooms[state.room], values = state.locks[room.id];
    if (action === 'digit' && state.room === 0) {
      const digit = button.dataset.digit;
      state.locks.forest = digit === '↺' ? '' : digit === '⌫' ? values.slice(0, -1) : values.length < 4 ? values + digit : values;
      tone = ''; save(); renderGame(); return;
    }
    if (action === 'step' && state.room === 1 && !values.includes(button.dataset.step)) values.push(button.dataset.step);
    if (action === 'remove-step' && state.room === 1) values.splice(Number(button.dataset.index), 1);
    if (action === 'word' && state.room === 2 && !values.includes(button.dataset.word)) values.push(button.dataset.word);
    if (action === 'remove-word' && state.room === 2) values.splice(Number(button.dataset.index), 1);
    if (['step', 'remove-step', 'word', 'remove-word'].includes(action)) { tone = ''; save(); renderGame(); return; }
    if (action === 'try-lock') {
      const result = C.solve(state, state.room, values); save();
      if (result === 'retry') { sound('retry'); notify(state.room === 0 ? 'ได้ยินเสียงคลิก แต่ล็อกยังไม่เปิด ลองอ่านลำดับที่ซ่อนของสัตว์อีกครั้งนะ' : state.room === 1 ? 'กลไกหยุดแล้ว ก่อนจะยกสะพานต้องทำอะไรก่อนนะ? แตะป้ายในช่องเพื่อนำออก แล้วเรียงใหม่ได้เลย' : 'มีคำครบแล้วจ้า ลองสลับลำดับ หลัง “När lyktan lyser” ให้ใช้ “kan vi” ก่อน “öppna grinden” แตะคำเพื่อนำออกแล้วเรียงใหม่ได้เลย', 'retry'); }
      if (result === 'missing') notify('ต้องหาสัตว์และเลือกชื่อให้ถูกครบ 4 ตัวก่อนจึงจะเปิดล็อกได้');
      if (result === 'solved') {
        sound('fanfare');
        if (state.status === 'escaped') return finish();
        message = C.rooms[state.room].rewardTh + ' อยู่ในมือเราแล้ว ทางไปต่อเปิดแล้วจ้า'; tone = 'correct'; renderGame();
        narrate('เปิดล็อกได้แล้ว เก่งมากจ้า');
      }
    }
  }
  function finish() {
    screen = 'ending';
    if (profile.rewardedRun !== state.startedAt) {
      profile.lastReward = P.complete(window.GameEngine.StateManager, `zoo:${state.episode}`, 'zoo:' + state.startedAt, 15 / (15 + state.mistakes));
      profile.completed++; profile.rewardedRun = state.startedAt; save();
      window.SmallGames?.renderLobby();
    }
    stop(); renderEnding(); narrate('ประตูเปิดแล้วจ้า เราหาทางผ่านค่ำคืนนี้ได้สำเร็จ ไว้เจอกันใหม่นะ ผู้ดูแลสวนสัตว์คนเก่ง');
  }
  function renderEnding() {
    applyClasses();
    const hints = Object.values(state.hints).reduce((sum, n) => sum + n, 0);
    dialog.innerHTML = `${header(true)}<div class="ze-ending"><div class="ze-ending-hero">${A.image('greenhouse')}<div></div><span class="ze-kicker">ภารกิจตรวจสวนสัตว์คืนนี้สำเร็จแล้ว</span><div class="ze-ending-key">${A.icon('key')}</div><h1>ประตูเปิดแล้วจ้า<br><em>เราหาทางออกเจอแล้ว</em></h1><p>วิทยุดังขึ้นอีกครั้ง “ฉันเห็นแสงโคมแล้ว!” ซิกเนโบกมือจากทางเดิน กุญแจสำรองอยู่ในกระเป๋า และในสมุดมีสัตว์สิบสองตัว ที่ซ่อนสิบสองแห่ง กับคำสวีเดนที่เราได้เรียนรู้ตลอดคืนนี้</p></div><div class="ze-ending-body"><div class="ze-ending-stats"><span><strong>12 / 12</strong>สัตว์ที่พบแล้ว</span><span><strong>3 / 3</strong>ล็อกที่เปิดแล้ว</span><span><strong>${hints}</strong>ขั้นคำใบ้ที่ใช้</span></div><span class="ze-kicker">เก็บคำศัพท์กลับบ้าน · แตะฟังแล้วลองพูดตามได้เลยต๊ะ</span><div class="ze-learning-goal"><strong>+${profile.lastReward?.xp || 0} XP${profile.lastReward?.gems ? ` · +${profile.lastReward.gems} เพชร` : ''} · คืนที่ ${state.episode + 1} สำเร็จ</strong><p>${profile.lastReward?.message || 'บันทึกความคืบหน้าแล้ว'}</p></div><div class="ze-ending-words">${C.animals.map(animal => `<button type="button" data-ze="ending-word" data-animal="${animal.id}" aria-label="ฟังประโยคสวีเดนเกี่ยวกับ ${animal.th}">${A.animal(animal.id)}<strong lang="sv">${animal.sv}</strong><span lang="sv">${animal.sentence}</span><span class="ze-th" lang="th">${animal.sentenceTh}</span></button>`).join('')}</div><div class="ze-ending-buttons"><button type="button" class="ze-primary" data-ze="replay">${state.episode < 3 ? 'ไปเวรตรวจคืนถัดไป →' : 'เลือกคืนเพื่อทบทวน →'}</button><button type="button" class="ze-secondary" data-ze="close">กลับไปเลือกเกม</button></div></div></div>`;
    const heading = $('.ze-ending h1', dialog); heading.tabIndex = -1; heading.focus({ preventScroll: true });
  }
  window.ZooEscape = { open, close, getCompletions: () => profile.completed };
})();

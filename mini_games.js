/* Small, complete Swedish-learning games, integrated with the existing app. */
(function () {
  'use strict';
  const C = window.MiniGameCore;
  const A = window.MiniGameArt;
  const P = window.LearningProgress;
  const MC = window.KitchenMeasureCore, M = window.KitchenMeasures;
  const STORAGE_KEY = 'wilawan_small_games_v1';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const speaker = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8q5 4 0 8m3-11q7 7 0 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const games = [
    { id: 'zoo', title: 'กุญแจแห่งรัตติกาล', subtitle: 'ความลับในสวนสัตว์ยามค่ำ',
      description: 'สวนสัตว์ปิดแล้ว ตามหาสัตว์ที่ซ่อนอยู่ 12 ตัว อ่านบันทึกของซิกเน และไขปริศนา 3 ด่านเพื่อหาทางออก',
      tags: ['เกมหาทางออก', '4 คืน · 12 บท', 'ค้นหาและไขปริศนา'] },
    { id: 'kitchen', title: 'ครัวเล็กของวิลาวัน', subtitle: 'ฝึกคำศัพท์ผ่านขนมอร่อย ๆ',
      description: 'ฟังชื่อวัตถุดิบภาษาสวีเดน แล้วลากของที่ถูกลงชาม เลือกจาก 29 อย่างเพื่ออบขนม 8 สูตร พร้อมเรียนชั่งน้ำหนัก ตวงปริมาตร และอ่านปริมาณเป็นสวีเดนกันต๊ะ',
      tags: ['อาหารและขนม', 'ลากแล้วเรียนรู้', '8 สูตร · โรงเรียนตวงวัด'] },
    { id: 'cafe', title: 'รับอะไรดีคะ?', subtitle: 'ฝึกสั่งอาหารเป็นภาษาสวีเดน',
      description: 'มาเป็นเจ้าของคาเฟ่กัน ฟังลูกค้าสั่งเป็นภาษาสวีเดน แล้วจัดขนมและเครื่องดื่มให้ถูกชนิดและจำนวน',
      tags: ['ประโยคใช้จริง', 'ฝึกฟังและนับจำนวน', '6 วัน · ลูกค้า 39 คน'] },
    { id: 'memory', title: 'ภาพนี้คู่กับคำไหน', subtitle: 'จับคู่ภาพแล้วจำคำใหม่',
      description: 'เปิดการ์ดรูปภาพกับคำสวีเดนให้เป็นคู่ ฟังเสียงอ่านและฝึกจำคำศัพท์หลายหมวด รอบสุดท้ายมีคำเก่ากลับมาทบทวน ค่อย ๆ เล่นได้เลยจ้า',
      tags: ['รูปภาพและคำศัพท์', 'ฝึกจำและออกเสียง', '8 ชุด · 24 ภารกิจ'] }
  ];
  let saved = readSaved();
  let dialog, content, current, returnFocus, selected = null, dragging = null, suppressClick = false;
  let timers = new Set();
  let gestureController = null;

  function readSaved() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      const completed = {};
      for (const [key, value] of Object.entries(parsed.completed || {})) {
        if ((key === 'cafe' || key === 'memory' || (key.startsWith('kitchen-') && Object.hasOwn(C.recipes, key.slice(8)))) && Number.isSafeInteger(value) && value >= 0) completed[key] = value;
      }
      return { uiLocale: 'th-v1', thai: parsed.uiLocale === 'th-v1' ? parsed.thai !== false : true, mode: parsed.mode === 'listen' ? 'listen' : 'read',
        recipe: Object.hasOwn(C.recipes, parsed.recipe) ? parsed.recipe : 'cake', stage: [0,1,2,3].includes(parsed.stage) ? parsed.stage : 0, pack: C.memoryPacks.some(p => p.id === parsed.pack) ? parsed.pack : 'home', cafeLevel: Number.isInteger(parsed.cafeLevel) && parsed.cafeLevel >= 0 && parsed.cafeLevel < 6 ? parsed.cafeLevel : 0, kitchenArea: parsed.kitchenArea === 'measures' ? 'measures' : 'recipes', measureLesson: MC.lessons.some(l => l.id === parsed.measureLesson) ? parsed.measureLesson : MC.lessons[0].id, completed };
    } catch (_) { return { uiLocale: 'th-v1', thai: true, mode: 'read', recipe: 'cake', stage: 0, pack: 'home', cafeLevel: 0, kitchenArea: 'recipes', measureLesson: MC.lessons[0].id, completed: {} }; }
  }
  function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (_) {} }
  function later(callback, delay) {
    const id = setTimeout(() => { timers.delete(id); if (dialog?.open) callback(); }, delay);
    timers.add(id); return id;
  }
  function clearPending() {
    M.destroy();
    for (const id of timers) clearTimeout(id);
    timers.clear();
    gestureController?.abort(); gestureController = null;
    cleanupDrag();
    selected = null;
    suppressClick = false;
    window.SpeechEngine?.stopAudio?.();
  }
  function sound(name) { window.SpeechEngine?.playSound?.(name); }
  function say(text, slow = false) {
    if (!window.SpeechEngine?.speakSwedish) {
      feedback('เบราว์เซอร์นี้ยังเล่นเสียงไม่ได้ กด “ดูคำศัพท์” เพื่ออ่านคำแทนได้จ้า', 'retry');
      return;
    }
    window.SpeechEngine.speakSwedish(text, slow ? 0.60 : 0.88);
  }
  function feedback(text, tone = '') {
    const el = $('#mg-feedback', dialog);
    if (el) { el.textContent = text; el.dataset.tone = tone; }
  }
  function animate(el, name) {
    if (!el) return;
    el.classList.remove(name);
    void el.offsetWidth;
    el.classList.add(name);
    later(() => el.classList.remove(name), 500);
  }
  function progress(label, done, total) {
    return `<div class="mg-game-progress"><span>${escape(label)}</span><div class="mg-progress-track" role="progressbar" aria-label="ความคืบหน้าของรอบนี้" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><div class="mg-progress-fill" style="width:${100 * done / total}%"></div></div><span>${done} / ${total}</span></div>`;
  }
  function feedbackHTML(text) { return `<div id="mg-feedback" class="mg-feedback" role="status" aria-live="polite" aria-atomic="true">${text}</div>`; }

  function renderLobby() {
    const lobby = $('#small-games-lobby');
    if (!lobby) return;
    lobby.lang = 'th';
    const rank = P.levelInfo(P.state().totalXP || 0, P.state()), all = P.stats(P.state());
    lobby.innerHTML = `<div class="mg-lobby"><div class="mg-lobby-intro"><span class="mg-eyebrow">ค่อย ๆ ฝึก วันละนิด</span><h1>เล่นไป เรียนสวีเดนไป</h1><p class="mg-lobby-lead">ไขปริศนา ทำขนม หรือเปิดร้านกาแฟ<br>ฟังคำสวีเดนแล้วลงมือเล่น มีภาษาไทยคอยบอกวิธีทุกขั้นตอน</p><div class="mg-lobby-sub"><span>ไม่จับเวลา</span><span>ฟังเสียงสวีเดนได้</span><span>มีคำแปลไทย</span></div></div>${rankCard(rank, all)}${games.map(game => {
      const course = P.stats(P.state(), game.id);
      return `<button type="button" class="mg-game-card" data-open-game="${game.id}">${A.cover(game.id)}<div class="mg-card-copy"><span class="mg-eyebrow">${game.subtitle}</span><div class="mg-card-heading"><h2>${game.title}</h2><span class="mg-card-arrow" aria-hidden="true">↗</span></div><p>${game.description}</p><div class="mg-card-meta">${game.tags.map(tag => `<span>${tag}</span>`).join('')}<span>✓ ${course.completed} / ${course.total} ภารกิจ</span></div></div></button>`;
    }).join('')}<p class="mg-hub-note">ลองผิดลองใหม่ได้ตามสบายต๊ะ<br>เล่นจบแต่ละรอบแล้ว มีคำศัพท์พร้อมเสียงให้ทบทวนอีกครั้ง</p></div>`;
  }
  function init() {
    try { P.migrate(P.state(), saved, JSON.parse(localStorage.getItem('wilawan_nattnyckeln_v1') || '{}')); window.GameEngine?.StateManager?.save(); } catch (_) {}
    renderLobby();
    const homeCard = $('#mg-home-shortcut');
    if (homeCard) homeCard.innerHTML = '<span aria-hidden="true">✳</span><span><strong>มาเล่นเกมฝึกภาษากัน</strong><small>ไขปริศนาสวนสัตว์ ทำขนม และฝึกคำศัพท์สวีเดน</small></span><span aria-hidden="true">↗</span>';
    document.addEventListener('click', event => {
      const card = event.target.closest('[data-open-game]');
      if (card) open(card.dataset.openGame, card);
      if (event.target.closest('#mg-home-shortcut')) $('[data-target="view-games"]')?.click();
    });
  }
  function open(gameId, opener) {
    if (!games.some(game => game.id === gameId)) return;
    if (gameId === 'zoo') return window.ZooEscape?.open(opener);
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'mg-dialog';
      dialog.lang = 'th';
      dialog.setAttribute('aria-labelledby', 'mg-dialog-title');
      document.body.appendChild(dialog);
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      dialog.addEventListener('close', () => { clearPending(); current = null; returnFocus?.focus(); });
      dialog.addEventListener('click', handleAction);
      dialog.addEventListener('pointerdown', pointerDown);
    }
    clearPending();
    returnFocus = opener || document.activeElement;
    current = { gameId, revealed: false, finished: false };
    if (!P.unlocked(P.state(), missionId())) { saved.stage = 0; saved.cafeLevel = 0; saved.measureLesson = MC.lessons.find(l=>P.unlocked(P.state(),`kitchen:measure:${l.id}`)&&!P.done(P.state(),`kitchen:measure:${l.id}`))?.id || MC.lessons[0].id; persist(); }
    const game = games.find(entry => entry.id === gameId);
    dialog.innerHTML = `<div class="mg-dialog-body"><header class="mg-game-header"><button type="button" class="mg-close" data-action="close" aria-label="กลับไปเลือกเกม" title="ย้อนกลับ">←</button><div class="mg-header-title"><h2 id="mg-dialog-title">${game.title}</h2><p>${game.subtitle}</p></div><button type="button" class="mg-toggle" data-action="thai" aria-pressed="${saved.thai}" aria-label="แสดงคำแปลไทยของคำที่กำลังฝึก">คำแปล</button><button type="button" class="mg-toggle" data-action="mode" aria-pressed="${saved.mode === 'listen'}" aria-label="โหมดฝึกฟัง">${saved.mode === 'listen' ? 'ฝึกฟังอย่างเดียว' : 'อ่านพร้อมฟัง'}</button></header><div class="mg-game-content"></div></div>`;
    content = $('.mg-game-content', dialog);
    dialog.classList.toggle('mg-show-th', saved.thai);
    if (!dialog.open) dialog.showModal();
    renderSetup();
  }
  function close() {
    clearPending();
    if (dialog?.open) dialog.close();
    renderLobby();
  }
  function missionId() {
    if (current.gameId === 'kitchen' && saved.kitchenArea === 'measures') return `kitchen:measure:${saved.measureLesson}`;
    return current.gameId === 'kitchen' ? `kitchen:${saved.recipe}:${saved.stage}` : current.gameId === 'memory' ? `memory:${saved.pack}:${saved.stage}` : `cafe:${saved.cafeLevel}`;
  }
  function rankCard(rank, all) {
    return `<section class="mg-course-card"><span class="mg-eyebrow">เส้นทางของเรา · ${all.completed} / ${all.total} ภารกิจ</span><h2>${rank.current.icon} ระดับ ${rank.current.level} · ${rank.current.titleTh}</h2><p>${rank.requirement}</p><progress max="100" value="${rank.progressPct}" aria-label="ความคืบหน้าระดับถัดไป"></progress><details><summary>แต้มและระดับคิดอย่างไร?</summary><p>ภารกิจใหม่ได้ 8–36 XP ครั้งเดียว การทบทวนต่างวันได้ 2 XP สูงสุด 3 ภารกิจต่อวัน เกมรวมไม่เกิน 60 XP ต่อวัน ครบทุก 3 ภารกิจใหม่ได้ 2 เพชร ทั้งแอปรวมไม่เกิน 180 XP และ 20 เพชรต่อวัน ใช้คำใบ้ได้โดยไม่หักแต้ม ระดับดูทั้งภารกิจหรือคำที่ฝึกถูก และจำนวนวันที่ฝึก ไม่ใช่คะแนนสอบภาษา</p></details></section>`;
  }
  function recipeArt(recipe) { return A.recipe(recipe.id); }
  function renderSetup() {
    M.destroy();
    dialog.querySelectorAll('.mg-toggle').forEach(button=>button.hidden=false);
    current.screen = 'setup'; content.className = 'mg-game-content';
    if(current.gameId === 'kitchen' && saved.kitchenArea === 'measures') return renderMeasureSetup();
    const game = games.find(entry => entry.id === current.gameId), course = P.stats(P.state(), game.id);
    const intros = {
      kitchen: ['สมุดขนม 8 สูตร', 'แต่ละสูตรมี 4 ขั้น: รู้จักคำ นึกความหมาย ฟัง และตวงหรือชั่งปริมาณตามสูตร ถ้ายังไม่รู้หน่วย แวะโรงเรียนตวงวัดก่อนก็ได้จ้า', 'ชื่ออาหาร คำสั่ง ชื่อหน่วย และการเตรียมปริมาณตามสูตร'],
      cafe: ['คาเฟ่ของเรา · 6 วัน', 'เริ่มจากออร์เดอร์ง่าย ๆ แล้วค่อยเพิ่มจำนวน รายการ และรูปประโยค ลูกค้าแต่ละคนสั่งไม่เหมือนกัน ถ้าหยิบเกินกดลบบนถาดได้เลย', 'ฟังประโยคสั่งอาหาร ชื่อเมนู จำนวน และรูปพหูพจน์'],
      memory: ['อัลบั้มคำศัพท์ 8 ชุด', 'แต่ละชุดมี 3 ขั้น อ่านพร้อมภาพ นึกความหมายโดยซ่อนคำแปล แล้วฟังเสียง พร้อมคำเก่าจากชุดที่เคยฝึก ถ้ายังไม่มีชุดก่อนหน้า จะฝึก 6 คู่นี้ก่อน เปิดการ์ด 2 ใบเพื่อจับคู่ภาพกับคำ', 'เชื่อมภาพกับคำและเสียง แล้วทบทวนคำจากชุดก่อนหน้า']
    }, intro = intros[game.id];
    let choices = '';
    if (game.id === 'kitchen') choices = `<div class="mg-recipe-options">${Object.values(C.recipes).map(r => `<button type="button" class="mg-recipe-choice" data-action="recipe" data-recipe="${r.id}" aria-pressed="${saved.recipe === r.id}">${recipeArt(r)}<strong>${r.th}</strong><small>${P.stats(P.state()).total && [0,1,2,3].filter(i => P.done(P.state(), `kitchen:${r.id}:${i}`)).length} / 4 ขั้น</small></button>`).join('')}</div>`;
    if (game.id === 'memory') choices = `<div class="mg-pack-options">${C.memoryPacks.map(pack => `<button type="button" data-action="pack" data-pack="${pack.id}" aria-pressed="${saved.pack === pack.id}"><strong>${pack.th}</strong><small>${[0,1,2].filter(i => P.done(P.state(), `memory:${pack.id}:${i}`)).length} / 3 ขั้น</small></button>`).join('')}</div>`;
    if (game.id === 'cafe') choices = `<div class="mg-course-options">${C.cafeRounds.map((round, i) => `<button type="button" data-action="cafe-level" data-level="${i}" aria-pressed="${saved.cafeLevel === i}" ${P.unlocked(P.state(), `cafe:${i}`) ? '' : 'disabled'}><strong>${P.done(P.state(), `cafe:${i}`) ? '✓ ' : ''}${round.th}</strong><small>${round.count} คน · ${round.goal}</small></button>`).join('')}</div>`;
    else choices += `<div class="mg-course-options">${(game.id === 'kitchen' ? P.kitchenStages : P.stages).map(stage => { const id = game.id === 'kitchen' ? `kitchen:${saved.recipe}:${stage.id}` : `memory:${saved.pack}:${stage.id}`; return `<button type="button" data-action="stage" data-stage="${stage.id}" aria-pressed="${saved.stage === stage.id}" ${P.unlocked(P.state(), id) ? '' : 'disabled'}><strong>${P.done(P.state(), id) ? '✓ ' : ''}${stage.id + 1}. ${stage.th}</strong><small>${stage.detail}</small></button>`; }).join('')}</div>`;
    const mission = missionId(), available = P.unlocked(P.state(), mission), finished = P.done(P.state(), mission);
    content.innerHTML = `<div class="mg-setup">${A.garland()}${game.id === 'kitchen' ? kitchenAreas() : ''}<span class="mg-eyebrow">${course.completed} / ${course.total} ภารกิจ</span><h3>${intro[0]}</h3><p class="mg-setup-lead">${intro[1]}</p><p class="mg-learning-goal"><strong>เกมนี้ฝึกอะไร?</strong> ${intro[2]}</p>${choices}<p class="mg-mode-description">${available ? finished ? 'ทบทวนได้เสมอ การเล่นภารกิจเดิมซ้ำวันนี้ไม่เพิ่มแต้ม' : `ภารกิจใหม่ · รางวัลครั้งแรก ${P.byId[mission].xp} XP ภายใต้เพดานประจำวัน` : 'ทำขั้นก่อนหน้าให้จบก่อน แล้วขั้นนี้จะเปิดเองจ้า'}</p><button type="button" class="mg-primary" data-action="start" ${available ? '' : 'disabled'}>เริ่มภารกิจนี้ →</button><p class="mg-mode-description">ไม่จับเวลา ใช้คำแปลและฟังช้าซ้ำได้เสมอ</p></div>`;
  }
  function kitchenAreas() {
    return `<div class="km-area-tabs" role="group" aria-label="เลือกส่วนของครัว"><button type="button" data-action="kitchen-area" data-area="recipes" aria-pressed="${saved.kitchenArea !== 'measures'}">สมุดสูตรขนม · 8 สูตร</button><button type="button" data-action="kitchen-area" data-area="measures" aria-pressed="${saved.kitchenArea === 'measures'}">โรงเรียนตวงวัด · ${MC.lessons.length} บท</button></div>`;
  }
  function measureTasks() {
    return saved.kitchenArea === 'measures' ? MC.lessons.find(l=>l.id === saved.measureLesson).tasks : MC.recipeTasks(C.recipes[saved.recipe],C.byId);
  }
  function renderMeasureSetup() {
    dialog.querySelectorAll('.mg-toggle').forEach(button=>button.hidden=true);
    const lesson=MC.lessons.find(l=>l.id===saved.measureLesson),mission=missionId(),available=P.unlocked(P.state(),mission),resume=M.resumable(mission,lesson.tasks);
    content.innerHTML=`<div class="mg-setup km-school-setup">${A.garland()}${kitchenAreas()}<span class="mg-eyebrow">เรียนแล้ว ${MC.lessons.filter(l=>P.done(P.state(),`kitchen:measure:${l.id}`)).length} / ${MC.lessons.length} บท</span><h3>ตวงเป็น ชั่งเป็น<br>อ่านสูตรสวีเดนได้</h3><p class="mg-setup-lead">เริ่มจากชื่อหน่วย แล้วค่อยเปลี่ยนหน่วย ใช้ช้อนตวง ตั้งศูนย์เครื่องชั่ง อ่านเศษส่วน และปรับสูตร มี 8 ข้อต่อบท ใช้สมุดช่วยได้เสมอต๊ะ</p><div class="mg-course-options">${MC.lessons.map(l=>`<button type="button" data-action="measure-lesson" data-lesson="${l.id}" aria-pressed="${l.id===saved.measureLesson}" ${P.unlocked(P.state(),`kitchen:measure:${l.id}`)?'':'disabled'}><strong>${P.done(P.state(),`kitchen:measure:${l.id}`)?'✓ ':''}${l.th}</strong><small>${l.goal} · ${l.tasks.length} ข้อ</small></button>`).join('')}</div><p class="mg-learning-goal">${lesson.intro}</p><button type="button" class="mg-primary" data-action="start" ${available?'':'disabled'}>${resume?'เล่นต่อจากที่บันทึกไว้':'เริ่มบทนี้'} →</button><p class="mg-mode-description">${P.done(P.state(),mission)?'ทบทวนได้เสมอ เล่นซ้ำวันนี้ไม่เพิ่มแต้ม':`รางวัลครั้งแรก ${P.byId[mission].xp} XP ตามเพดานรายวัน`} · ปิดครัวแล้วกลับมาเรียนต่อได้</p>${M.referenceHTML()}</div>`;
  }
  function startMeasureGame() {
    const recipe=saved.kitchenArea === 'recipes'?C.recipes[saved.recipe]:null;
    current.screen='measures';current.finished=false;
    dialog.querySelectorAll('.mg-toggle').forEach(button=>button.hidden=true);
    const lesson=recipe?{th:recipe.th+' · ตวงก่อนผสม',intro:'ตวง ชั่ง หรือนับวัตถุดิบแต่ละอย่างตามป้ายสูตรฝึกภาษา ใช้ปริมาณเท่ากันในหน่วยอื่นได้ ตัวเลขในเกมใช้ฝึกภาษา ไม่ใช่สูตรอบที่ทดสอบสำหรับทำอาหารจริง',facts:['ใช้ช้อนตวงมาตรฐาน · ชั่งโดยไม่รวมน้ำหนักชาม']}:MC.lessons.find(l=>l.id===saved.measureLesson);
    M.mount({host:content,mission:missionId(),tasks:measureTasks(),lesson,recipe,
      onBack:()=>{renderSetup();content.scrollTop=0;},onNext:()=>{ if(saved.kitchenArea==='measures' && MC.lessons.every(l=>P.done(P.state(),`kitchen:measure:${l.id}`))){ saved.kitchenArea='recipes'; const ready=Object.values(C.recipes).find(r=>P.done(P.state(),`kitchen:${r.id}:2`)&&!P.done(P.state(),`kitchen:${r.id}:3`)); saved.recipe=ready?.id || saved.recipe; saved.stage=ready?3:0; persist(); } else selectNextMission(); renderSetup();content.scrollTop=0; },onComplete:renderLobby});
  }
  function modeDescription() {
    if (current.gameId === 'memory') return saved.mode === 'listen' ? 'ซ่อนข้อความสวีเดนบนการ์ด ฟังเสียงแล้วหาภาพ ถ้าอยากอ่าน กด “ดูคำศัพท์” ได้เสมอ' : 'อ่านคำสวีเดน ฟังเสียง และจับคู่กับรูปภาพ มีคำแปลไทยช่วยจำ';
    return saved.mode === 'listen' ? 'ซ่อนคำสวีเดนและคำแปลของโจทย์ เพื่อฝึกฟังจริง ๆ ถ้าติดตรงไหน กด “ดูคำศัพท์” ได้เลย' : 'เห็นคำสวีเดนพร้อมเสียงอ่าน ปุ่ม “คำแปล” ใช้เปิดหรือซ่อนคำแปลของคำที่กำลังฝึก';
  }
  function handleAction(event) {
    const button = event.target.closest('button');
    if (!button || !dialog.contains(button)) return;
    if (suppressClick && button.matches('[data-ingredient]')) { suppressClick = false; return; }
    if (button.dataset.action === 'close') return close();
    if (current.screen === 'measures' && ['mode','thai'].includes(button.dataset.action)) return;
    if (button.dataset.action === 'thai') {
      saved.thai = !saved.thai; persist();
      dialog.classList.toggle('mg-show-th', saved.thai);
      button.setAttribute('aria-pressed', String(saved.thai)); return;
    }
    if (['mode', 'choose-mode'].includes(button.dataset.action)) {
      saved.mode = button.dataset.mode || (saved.mode === 'read' ? 'listen' : 'read');
      current.revealed = false; persist();
      const toggle = $('[data-action="mode"]', dialog);
      toggle.textContent = saved.mode === 'listen' ? 'ฝึกฟังอย่างเดียว' : 'อ่านพร้อมฟัง';
      toggle.setAttribute('aria-pressed', String(saved.mode === 'listen'));
      if (current.screen === 'setup') renderSetup();
      else if (current.screen === 'game') { renderGame(); speakPrompt(); }
      return;
    }
    const action = button.dataset.action;
    if (action === 'kitchen-area') { saved.kitchenArea = button.dataset.area === 'measures' ? 'measures' : 'recipes'; persist(); renderSetup(); return; }
    if (action === 'measure-lesson') { saved.measureLesson = button.dataset.lesson; persist(); renderSetup(); return; }
    if (action === 'recipe') { saved.recipe = button.dataset.recipe; saved.stage = 0; persist(); renderSetup(); return; }
    if (action === 'pack') { saved.pack = button.dataset.pack; saved.stage = 0; persist(); renderSetup(); return; }
    if (action === 'stage') { saved.stage = Number(button.dataset.stage); persist(); renderSetup(); return; }
    if (action === 'cafe-level') { saved.cafeLevel = Number(button.dataset.level); persist(); renderSetup(); return; }
    if (action === 'next-mission') { selectNextMission(); renderSetup(); content.scrollTop = 0; return; }
    if (action === 'start') return start();
    if (action === 'again') { clearPending(); current.finished = false; renderSetup(); content.scrollTop = 0; return; }
    if (action === 'speak') return speakPrompt();
    if (action === 'slow') return speakPrompt(true);
    if (action === 'reveal') { current.revealed = !current.revealed; renderGame(); return; }
    if (action === 'word') return say(button.dataset.word, true);
    if (current.screen !== 'game' || current.finished) return;
    if (current.gameId === 'kitchen') {
      if (button.dataset.ingredient) return selectIngredient(button.dataset.ingredient, event.detail === 0);
      if (action === 'place-selected' && selected) return placeIngredient(selected);
      if (action === 'bowl') {
        if (current.kitchen.phase === 'stir') return stir();
        if (selected) return placeIngredient(selected);
        feedback('เลือกวัตถุดิบก่อนนะ ลากมาที่ชาม หรือแตะวัตถุดิบแล้วแตะชามก็ได้จ้า');
      }
      if (action === 'stir') stir();
      if (action === 'bake') bake();
    }
    if (current.gameId === 'cafe') {
      if (button.dataset.cafeItem && !current.served) {
        const id = button.dataset.cafeItem;
        if ((current.tray[id] || 0) < 4) current.tray[id] = (current.tray[id] || 0) + 1;
        sound('tap'); updateTray();
        feedback('ของบนถาด: ' + trayDescription() + '.');
      }
      if (button.dataset.remove && !current.served) {
        const id = button.dataset.remove; current.tray[id] = Math.max(0, (current.tray[id] || 0) - 1); updateTray();
      }
      if (action === 'clear-tray' && !current.served) { current.tray = {}; updateTray(); feedback('ถาดว่างแล้วจ้า ลองฟังลูกค้าสั่งอีกครั้งได้เลย'); }
      if (action === 'serve') serve();
      if (action === 'next-order' && current.served) {
        current.orderIndex++; current.tray = {}; current.served = false; current.revealed = false;
        if (current.orderIndex === current.orders.length) finish();
        else { renderCafe(); speakPrompt(); content.scrollTop = 0; }
      }
    }
    if (current.gameId === 'memory' && button.dataset.memoryKey) flipCard(button.dataset.memoryKey);
  }
  function start() {
    if (!P.unlocked(P.state(), missionId())) return;
    clearPending();
    current.mission = missionId(); current.runId = Date.now() + ':' + Math.random().toString(36).slice(2);
    if(current.gameId === 'kitchen' && (saved.kitchenArea === 'measures' || saved.stage === 3)) return startMeasureGame();
    const stage = current.gameId === 'cafe' ? (saved.cafeLevel === 5 ? 2 : saved.cafeLevel >= 2 ? 1 : 0) : saved.stage;
    saved.mode = stage === 2 ? 'listen' : 'read'; saved.thai = stage === 0; persist();
    dialog.classList.toggle('mg-show-th', saved.thai);
    $('[data-action="thai"]', dialog).setAttribute('aria-pressed', String(saved.thai));
    $('[data-action="mode"]', dialog).textContent = saved.mode === 'listen' ? 'ฝึกฟังอย่างเดียว' : 'อ่านพร้อมฟัง';
    $('[data-action="mode"]', dialog).setAttribute('aria-pressed', String(saved.mode === 'listen'));
    current.screen = 'game'; current.finished = false; current.revealed = false;
    if (current.gameId === 'kitchen') current.kitchen = C.createKitchen(saved.recipe);
    if (current.gameId === 'cafe') Object.assign(current, { orders: C.createCafeRound(saved.cafeLevel), orderIndex: 0, tray: {}, served: false, mistakes: 0 });
    if (current.gameId === 'memory') { const words = C.memoryWords(saved.pack, saved.stage, window.ZooCore.animals, C.memoryPacks.filter(p => P.done(P.state(), `memory:${p.id}:0`)).map(p => p.id)); Object.assign(current, { words, cards: C.createMemory(Math.random, words), flipped: [], matched: [], turns: 0, locked: false }); }
    renderGame(); content.scrollTop = 0;
    if (current.gameId !== 'memory') speakPrompt();
    focusContent();
  }
  function focusContent() {
    const heading = $('.mg-instruction strong, .mg-memory-intro, .mg-result h3', dialog);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function renderGame() {
    if (current.gameId === 'kitchen') renderKitchen();
    if (current.gameId === 'cafe') renderCafe();
    if (current.gameId === 'memory') renderMemory();
  }
  function isHidden() { return saved.mode === 'listen' && !current.revealed; }
  function instruction(text, subtitle, thai) {
    const listening = isHidden();
    const textLang = listening || /[ก-๿]/.test(text) ? 'th' : 'sv';
    return `<div class="mg-instruction"><div class="mg-instruction-copy"><strong lang="${textLang}">${listening ? 'ฟังแล้วเลือกภาพที่ตรงกันนะ' : escape(text)}</strong><small>${subtitle}</small>${!listening && thai ? `<span class="mg-th" lang="th">${escape(thai)}</span>` : ''}</div><div class="mg-instruction-actions"><button type="button" class="mg-listen-btn" data-action="speak" aria-label="ฟังโจทย์ภาษาสวีเดน">${speaker} ฟังเสียง</button><button type="button" class="mg-hint-btn" data-action="slow" aria-label="ฟังภาษาสวีเดนช้า ๆ">ฟังช้า ๆ</button>${saved.mode === 'listen' ? `<button type="button" class="mg-hint-btn" data-action="reveal">${current.revealed ? 'ซ่อนคำศัพท์' : 'ดูคำศัพท์'}</button>` : ''}</div></div>`;
  }
  function kitchenPromptTh() {
    const state = current.kitchen;
    if (state.phase === 'collect') return 'ใส่' + C.target(state).th + 'ลงในชาม';
    if (state.phase === 'decorate') return state.index === 0 ? 'ใส่ครีมบนเค้ก' : 'วางสตรอว์เบอร์รีบนเค้ก';
    return '';
  }
  function kitchenPrompt() {
    const state = current.kitchen;
    if (state.phase === 'collect') return 'Lägg ' + C.target(state).definite + ' i bunken.';
    if (state.phase === 'decorate') return state.index === 0 ? 'Lägg grädden på tårtan.' : 'Lägg jordgubben på tårtan.';
    if (state.phase === 'stir') return 'röra om';
    if (state.phase === 'ready') return 'baka';
    return 'ugnen';
  }
  function speakPrompt(slow = false) {
    if (!current) return;
    if (current.gameId === 'kitchen') say(kitchenPrompt(), slow);
    if (current.gameId === 'cafe') say(cafeText(), slow);
  }
  function renderKitchen() {
    const state = current.kitchen;
    const recipe = C.recipes[state.recipeId];
    const collecting = ['collect', 'decorate'].includes(state.phase);
    const done = state.learned.length;
    const total = recipe.steps.length + recipe.decorations.length;
    const target = collecting ? C.target(state) : null;
    content.className = 'mg-game-content mg-kitchen-game' + (isHidden() ? ' mg-listening' : '') + (state.phase === 'baking' ? ' mg-baking' : '');
    content.innerHTML = `${progress(recipe.th, done, total)}${collecting ? instruction(kitchenPrompt(), state.phase === 'decorate' ? 'ถึงเวลาตกแต่ง เลือกของแล้ววางบนเค้กได้เลย' : 'ลากลงชาม หรือแตะเลือกแล้วกดใส่ชาม', kitchenPromptTh()) : ''}<div class="mg-scene">${A.kitchen()}<button type="button" class="mg-drop-zone" style="--mg-mix-fill:${Math.min(1, .15 + done * .12)}" data-action="bowl" aria-label="${state.phase === 'decorate' ? 'วางวัตถุดิบที่เลือกไว้บนเค้ก' : state.phase === 'stir' ? 'คนส่วนผสมในชาม' : 'ใส่วัตถุดิบที่เลือกลงในชาม'}" ${['baking', 'ready'].includes(state.phase) ? 'disabled' : ''}>${state.phase === 'decorate' ? A.cake(state.index > 0) : state.phase === 'baking' ? A.oven() : A.bowl()}</button><span class="mg-scene-tag">ฝึกสวีเดนทีละนิด อบขนมด้วยใจ</span></div>${collecting ? `<section class="mg-ingredients-section" aria-label="เลือกวัตถุดิบจาก 29 อย่าง"><div class="mg-shelf-heading"><h3>ชั้นวางวัตถุดิบ <span>· วัตถุดิบ 29 อย่าง</span></h3><p>เลือกจากรูปภาพ ลองใหม่ได้เรื่อย ๆ ไม่ต้องรีบนะ</p></div><div class="mg-ingredients-grid">${C.ingredients.map(item => `<button type="button" class="mg-ingredient ${state.learned.includes(item.id) ? 'mg-used' : ''}" data-ingredient="${item.id}" aria-label="เลือก ${item.sv}" aria-pressed="${selected === item.id}">${A.icon(item.id)}<span class="mg-ingredient-label" lang="sv">${item.sv}</span><span class="mg-th" lang="th">${item.th}</span></button>`).join('')}</div></section>` : renderKitchenPhase()}${feedbackHTML(collecting ? 'ฟังประโยค แล้วหาวัตถุดิบที่ตรงกับคำสวีเดน' : state.phase === 'stir' ? 'กดคนส่วนผสม 5 ครั้ง ค่อย ๆ ทำได้ตามสบายจ้า' : 'ทำได้ดีจังฮู้!')}${collecting ? `<div class="mg-selection-bar" hidden><span id="mg-selected-name"></span><button type="button" class="mg-primary" data-action="place-selected">${state.phase === 'decorate' ? 'วางบนเค้ก' : 'ใส่ลงชาม'} ↓</button></div>` : ''}`;
    if (collecting && selected) {
      $('.mg-selection-bar', dialog).hidden = false;
      $('#mg-selected-name', dialog).textContent = C.byId[selected].sv;
      $('.mg-drop-zone', dialog).classList.add('mg-drop-ready');
    }
  }
  function renderKitchenPhase() {
    const state = current.kitchen;
    if (state.phase === 'stir') return `<div class="mg-phase-panel"><h3>มาคนส่วนผสมกันจ้า</h3><p><span lang="sv" class="mg-sv-phrase">röra om</span> แปลว่า “คนให้เข้ากัน”<br>กดปุ่มหรือแตะชามให้ครบ 5 ครั้งนะ</p><div class="mg-stir-dots" aria-label="คนแล้ว ${state.stirs} จาก 5 ครั้ง">${Array.from({ length: 5 }, (_, i) => `<span class="${i < state.stirs ? 'filled' : ''}"></span>`).join('')}</div><button type="button" class="mg-primary" data-action="stir">คนส่วนผสม · ${state.stirs} / 5</button></div>`;
    if (state.phase === 'ready') return '<div class="mg-phase-panel"><h3>ส่วนผสมพร้อมแล้ว!</h3><p>คำว่า <span lang="sv" class="mg-sv-phrase">baka</span> แปลว่า “อบขนม”<br>เอาเข้าเตาอบกันเลยต๊ะ</p><button type="button" class="mg-primary" data-action="bake">นำเข้าเตาอบ →</button></div>';
    return '<div class="mg-phase-panel"><span class="mg-eyebrow">กลิ่นขนมหอมแล้วจ้า</span><h3>รอในเตาอบสักครู่…</h3><div class="mg-baking-progress" role="status" aria-label="กำลังอบขนม"></div><p><span lang="sv" class="mg-sv-phrase">ugnen</span> = เตาอบ</p></div>';
  }
  function selectIngredient(id, keyboard = false) {
    if (!['collect', 'decorate'].includes(current.kitchen.phase)) return;
    selected = selected === id ? null : id;
    dialog.querySelectorAll('[data-ingredient]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.ingredient === selected)));
    $('.mg-drop-zone', dialog)?.classList.toggle('mg-drop-ready', !!selected);
    $('.mg-selection-bar', dialog).hidden = !selected;
    $('#mg-selected-name', dialog).textContent = selected ? C.byId[id].sv : '';
    if (selected) { sound('tap'); say(C.byId[id].sv); feedback('เลือก ' + C.byId[id].sv + ' (' + C.byId[id].th + ') แล้ว กด' + (current.kitchen.phase === 'decorate' ? 'วางบนเค้ก' : 'ใส่ลงชาม') + ' ได้เลยจ้า');
      if (keyboard) $('[data-action="place-selected"]', dialog)?.focus({ preventScroll: true }); }
    else feedback('ยกเลิกที่เลือกแล้ว เลือกวัตถุดิบใหม่ได้เลย');
  }
  function placeIngredient(id) {
    const state = current.kitchen;
    const target = C.target(state);
    const result = C.addIngredient(state, id);
    selected = null;
    if (result === 'inactive') return;
    if (result === 'retry') {
      dialog.querySelectorAll('[data-ingredient]').forEach(el => el.setAttribute('aria-pressed', 'false'));
      $('.mg-drop-zone', dialog)?.classList.remove('mg-drop-ready');
      $('.mg-selection-bar', dialog).hidden = true;
      sound('retry');
      animate($(`[data-ingredient="${id}"]`, dialog), 'mg-reject');
      feedback(`นี่คือ ${C.byId[id].sv} (${C.byId[id].th}) ${isHidden() ? 'ลองฟังอีกครั้ง แล้วเลือกใหม่นะจ๊ะ' : 'เรากำลังหา ' + target.sv + ' (' + target.th + ') ลองอีกครั้งได้เลยจ้า'}`, 'retry');
      return;
    }
    sound('correct');
    current.revealed = false;
    if (state.phase === 'done') return finish();
    renderKitchen();
    animate($('.mg-drop-zone', dialog), 'mg-land');
    const drop = document.createElement('span'); drop.className = 'mg-ingredient-drop'; drop.innerHTML = A.icon(id);
    $('.mg-drop-zone', dialog)?.appendChild(drop); later(() => drop.remove(), 650);
    feedback('ถูกต้องแล้วจ้า! ' + C.byId[id].sv + ' · ' + C.byId[id].th, 'correct');
    speakPrompt();
    focusContent();
  }
  function stir() {
    if (!C.stir(current.kitchen)) return;
    sound('tap'); renderKitchen();
    animate($('.mg-drop-zone', dialog), 'mg-stirring');
    if (current.kitchen.phase === 'ready') say('baka');
    else feedback('คนส่วนผสมแล้ว ' + current.kitchen.stirs + ' จาก 5 ครั้ง', 'correct');
  }
  function bake() {
    if (!C.bake(current.kitchen)) return;
    renderKitchen(); sound('tap');
    later(() => {
      C.finishBaking(current.kitchen);
      if (current.kitchen.phase === 'done') finish();
      else { renderKitchen(); say(kitchenPrompt()); }
    }, 2400);
  }

  /* Pointer dragging for mouse and pen. Touch uses the same accessible two-tap
     path as keyboard, so all 29 objects remain easy to scroll on a phone. */
  function pointerDown(event) {
    const item = event.target.closest('[data-ingredient]');
    if (!item || event.pointerType === 'touch' || event.button !== 0 || current?.screen !== 'game') return;
    if (!['collect', 'decorate'].includes(current.kitchen?.phase)) return;
    gestureController?.abort();
    gestureController = new AbortController();
    const options = { signal: gestureController.signal };
    dragging = { id: item.dataset.ingredient, x: event.clientX, y: event.clientY, active: false, ghost: null, pointerId: event.pointerId };
    document.addEventListener('pointermove', pointerMove, options);
    document.addEventListener('pointerup', pointerUp, options);
    document.addEventListener('pointercancel', cancelGesture, options);
    window.addEventListener('blur', cancelGesture, options);
  }
  function pointerMove(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    if (!dragging.active && Math.hypot(event.clientX - dragging.x, event.clientY - dragging.y) < 6) return;
    event.preventDefault();
    if (!dragging.active) {
      dragging.active = true;
      dragging.ghost = document.createElement('div');
      dragging.ghost.className = 'mg-drag-ghost';
      dragging.ghost.innerHTML = A.icon(dragging.id);
      // Native modal dialogs are in the top layer; the ghost must be inside.
      dialog.appendChild(dragging.ghost);
      $('.mg-drop-zone', dialog)?.classList.add('mg-drop-ready');
    }
    dragging.ghost.style.left = event.clientX + 'px';
    dragging.ghost.style.top = event.clientY + 'px';
    $('.mg-drop-zone', dialog)?.classList.toggle('mg-drop-hover', overBowl(event.clientX, event.clientY));
  }
  function overBowl(x, y) {
    const rect = $('.mg-drop-zone', dialog)?.getBoundingClientRect();
    return !!rect && x >= rect.left - 15 && x <= rect.right + 15 && y >= rect.top - 10 && y <= rect.bottom + 10;
  }
  function pointerUp(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const { id, active } = dragging;
    const dropped = active && overBowl(event.clientX, event.clientY);
    cleanupDrag(); gestureController?.abort(); gestureController = null;
    if (active) {
      suppressClick = true;
      later(() => { suppressClick = false; }, 100);
      if (dropped) placeIngredient(id);
      else animate($(`[data-ingredient="${id}"]`, dialog), 'mg-reject');
    }
  }
  function cancelGesture() { cleanupDrag(); gestureController?.abort(); gestureController = null; }
  function cleanupDrag() {
    dragging?.ghost?.remove(); dragging = null;
    dialog?.querySelector('.mg-drop-zone')?.classList.remove('mg-drop-ready', 'mg-drop-hover');
  }

  function customer(index) {
    const shirts = ['#b6bf9c', '#ceaa9d', '#a1b9be', '#d8bd81', '#b7a8bd'];
    index %= 5;
    return `<svg class="mg-customer" viewBox="0 0 100 120" fill="none" stroke="#826b53" stroke-width="1.5" aria-hidden="true"><path d="M10 118q2-39 40-38 37 1 40 38" fill="${shirts[index]}"/><path d="M41 74v13q9 8 18 0V74" fill="#e4bd9a"/><ellipse cx="50" cy="48" rx="28" ry="34" fill="#e8c6a2"/><path d="M22 49Q6 10 46 7q41-2 33 41l-7-21q-25 17-43 0z" fill="${index % 2 ? '#a18163' : '#66594b'}"/><path d="M38 49h1m22 0h1" stroke-width="3"/><path d="M42 64q8 7 16 0" fill="none"/><path d="m26 95 12 16m36-16-12 16" stroke="#fff6df"/></svg>`;
  }
  function cafeText() { return C.orderText(current.orders[current.orderIndex], saved.cafeLevel >= 4 ? current.orderIndex % 3 : 0); }
  function renderCafe() {
    const order = current.orders[current.orderIndex];
    const thai = 'ขอ ' + order.map(({ id, count }) => C.cafeItems.find(item => item.id === id).th + ' ' + count + (['coffee','tea','water'].includes(id) ? ' แก้ว' : ' ชิ้น')).join(' กับ ') + ' ค่ะ ขอบคุณค่ะ';
    content.className = 'mg-game-content mg-cafe-game';
    content.innerHTML = `${progress(C.cafeRounds[saved.cafeLevel].th, current.orderIndex, current.orders.length)}${instruction('ลูกค้าสั่งอะไรบ้าง?', 'แตะของในเมนูให้ครบจำนวน แล้วกด “เสิร์ฟ”', 'เลือกให้ครบจำนวน แล้วกดเสิร์ฟ')}<div class="mg-cafe-stage"><div class="mg-cafe-awning"></div><div class="mg-customer-row">${customer(current.orderIndex)}<div class="mg-order-bubble" lang="${isHidden() ? 'th' : 'sv'}">${isHidden() ? '“ลองฟังว่าลูกค้าสั่งอะไรนะ…”' : '”' + escape(cafeText()) + '”'}${!isHidden() ? `<span class="mg-th" lang="th">${thai}</span>` : ''}</div></div></div><div class="mg-cafe-menu" aria-label="เมนูขนมและเครื่องดื่ม">${C.cafeItems.map(item => `<button type="button" class="mg-menu-item" data-cafe-item="${item.id}" aria-label="เพิ่ม ${item.sv}" ${current.served ? 'disabled' : ''}>${A.icon(item.art)}<span lang="${isHidden() ? 'th' : 'sv'}">${isHidden() ? 'เลือกภาพนี้' : item.sv}</span>${!isHidden() ? `<span class="mg-th" lang="th">${item.th}</span>` : ''}<span class="mg-menu-count" data-count="${item.id}" hidden>0</span></button>`).join('')}</div><div class="mg-tray"><span class="mg-tray-label">ถาดของเรา</span><div class="mg-tray-items" id="mg-tray-items"></div></div><div class="mg-cafe-actions"><button type="button" class="mg-secondary" data-action="clear-tray" ${current.served ? 'disabled' : ''}>เอาของออกทั้งหมด</button><button type="button" class="mg-primary" data-action="serve" ${current.served ? 'disabled' : ''}>เสิร์ฟ →</button></div>${feedbackHTML(current.served ? 'ลูกค้าบอกว่า “Tack så mycket!” แปลว่า “ขอบคุณมากค่ะ!” จัดของได้ถูกต้องแล้ว' : 'ถ้าหยิบเกิน กดปุ่มลบบนถาดเพื่อเอาออกทีละชิ้นได้จ้า')}${current.served ? `<div class="mg-order-next"><button type="button" class="mg-primary" data-action="next-order">${current.orderIndex === current.orders.length - 1 ? 'ปิดร้านแล้วทบทวนคำศัพท์' : 'รับลูกค้าคนต่อไป →'}</button></div>` : ''}`;
    updateTray();
  }
  function trayDescription() {
    return C.cafeItems.filter(item => current.tray[item.id]).map(item => current.tray[item.id] + ' × ' + item.th).join(', ') || 'ยังไม่มีของ';
  }
  function updateTray() {
    const tray = $('#mg-tray-items', dialog);
    const items = C.cafeItems.filter(item => current.tray[item.id]);
    tray.innerHTML = items.length ? items.map(item => `<span class="mg-tray-item">${A.icon(item.art)}<span aria-label="${current.tray[item.id]} ${item.sv}">× ${current.tray[item.id]}</span><button type="button" class="mg-tray-remove" data-remove="${item.id}" aria-label="นำออกหนึ่งชิ้น: ${item.sv.replace(/^(en|ett) /, '')}" ${current.served ? 'disabled' : ''}>−</button></span>`).join('') : '<span class="mg-tray-empty">เลือกของจากเมนูมาวางบนถาดกัน</span>';
    for (const item of C.cafeItems) {
      const count = $(`[data-count="${item.id}"]`, dialog);
      count.textContent = current.tray[item.id] || 0; count.hidden = !current.tray[item.id];
    }
  }
  function serve() {
    if (current.served) return;
    if (!C.checkOrder(current.orders[current.orderIndex], current.tray)) {
      current.mistakes++; sound('retry'); animate($('.mg-tray', dialog), 'mg-reject');
      feedback('เกือบถูกแล้วจ้า ลองเช็กทั้งชนิดและจำนวน กดลบของที่เกิน หรือฟังอีกครั้งได้นะ', 'retry'); return;
    }
    current.served = true; sound('correct'); renderCafe();
    feedback('ลูกค้าบอกว่า “Tack så mycket!” แปลว่า “ขอบคุณมากค่ะ!” จัดของได้ถูกต้องแล้ว', 'correct'); say('Tack så mycket!');
    $('[data-action="next-order"]', dialog)?.focus({ preventScroll: true });
  }

  function renderMemory() {
    content.className = 'mg-game-content mg-memory-game';
    content.innerHTML = `${progress(C.memoryPacks.find(p => p.id === saved.pack).th, current.matched.length, current.words.length)}<p class="mg-memory-intro">${isHidden() ? 'เปิดการ์ด 2 ใบ ฟังคำสวีเดนแล้วหารูปภาพที่ตรงกัน' : 'เปิดการ์ด 2 ใบ จับคู่ภาพหนึ่งใบกับคำสวีเดนของภาพนั้น'}<span class="mg-th" lang="th">จับคู่รูปภาพกับคำภาษาสวีเดน</span>${saved.mode === 'listen' ? `<button type="button" class="mg-hint-btn" data-action="reveal">${current.revealed ? 'ซ่อนคำศัพท์' : 'ดูคำศัพท์'}</button>` : ''}</p><div class="mg-memory-grid" aria-label="การ์ดภาพและคำศัพท์ ${current.cards.length} ใบ">${current.cards.map((card, i) => memoryCard(card, i)).join('')}</div>${feedbackHTML(`เริ่มเปิดใบไหนก่อนก็ได้ หาให้ครบ ${current.words.length} คู่นะจ๊ะ`)}`;
  }
  function memoryFront(card, item, matched) {
    if (card.type === 'picture') return wordArt(item) + '<small>รูปภาพ</small>';
    if (isHidden() && !matched) return `<span class="mg-memory-listen">${speaker}<span>ฟังเสียง</span></span><small>แตะอีกครั้งเพื่อฟัง</small>`;
    return `<strong lang="sv">${item.sv}</strong><span class="mg-th" lang="th">${item.th}</span><small>คำศัพท์</small>`;
  }
  function memoryCard(card, index) {
    const item = current.words.find(entry => entry.id === card.id);
    const matched = current.matched.includes(card.id);
    const flipped = matched || current.flipped.includes(card.key);
    return `<button type="button" class="mg-memory-card ${matched ? 'mg-matched' : ''}" style="--tilt:${[-3, 2, -2, 3, 1, -3][index % 6]}deg" data-memory-key="${card.key}" aria-pressed="${flipped}" aria-label="${flipped ? (card.type === 'picture' ? 'รูปภาพ: ' : '') + item.sv + (matched ? ', จับคู่แล้ว' : '') : 'เปิดการ์ดใบที่ ' + (index + 1)}" ${matched || current.locked ? 'disabled' : ''}><span class="mg-memory-flipper"><span class="mg-memory-back" aria-hidden="${flipped}"><span>${index + 1}</span></span><span class="mg-memory-front" aria-hidden="${!flipped}">${memoryFront(card, item, matched)}</span></span></button>`;
  }
  function updateMemoryCards() {
    for (const card of current.cards) {
      const item = current.words.find(entry => entry.id === card.id);
      const el = $(`[data-memory-key="${card.key}"]`, dialog);
      const matched = current.matched.includes(card.id);
      const flipped = matched || current.flipped.includes(card.key);
      el.classList.toggle('mg-matched', matched);
      el.setAttribute('aria-pressed', String(flipped));
      el.setAttribute('aria-label', flipped ? (card.type === 'picture' ? 'รูปภาพ: ' : '') + item.sv + (matched ? ', จับคู่แล้ว' : '') : 'เปิดการ์ดใบที่ ' + (current.cards.indexOf(card) + 1));
      $('.mg-memory-back', el).setAttribute('aria-hidden', String(flipped));
      $('.mg-memory-front', el).setAttribute('aria-hidden', String(!flipped));
      $('.mg-memory-front', el).innerHTML = memoryFront(card, item, matched);
      el.disabled = matched || current.locked;
    }
    const track = $('[role="progressbar"]', dialog);
    track.setAttribute('aria-valuenow', current.matched.length);
    $('.mg-progress-fill', dialog).style.width = current.matched.length / current.words.length * 100 + '%';
    $('.mg-game-progress > span:last-child', dialog).textContent = current.matched.length + ' / ' + current.words.length;
  }
  function flipCard(key) {
    const card = current.cards.find(entry => entry.key === key);
    if (current.locked || !card || current.matched.includes(card.id)) return;
    if (current.flipped.includes(key)) {
      if (card.type === 'word' || saved.mode === 'read') say(current.words.find(item => item.id === card.id).sv);
      return;
    }
    current.flipped.push(key); sound('tap');
    const word = current.words.find(item => item.id === card.id);
    // In listening mode a picture stays silent until matched, so its spoken
    // name doesn't give away the matching word. Word cards always speak.
    if (card.type === 'word' || saved.mode === 'read') say(word.sv);
    updateMemoryCards();
    if (current.flipped.length < 2) return;
    current.turns++;
    const [first, second] = current.flipped.map(id => current.cards.find(entry => entry.key === id));
    current.locked = true;
    updateMemoryCards();
    if (C.isPair(first, second)) {
      current.matched.push(card.id); current.flipped = [];
      sound('match'); say(word.sv, true); updateMemoryCards();
      feedback('เจอคู่แล้ว เก่งจังฮู้! ' + word.sv + ' · ' + word.th, 'correct');
      later(() => {
        current.locked = false;
        if (current.matched.length === current.words.length) finish();
        else { updateMemoryCards(); $('.mg-memory-card:not(:disabled)', dialog)?.focus({ preventScroll: true }); }
      }, 650);
    } else {
      feedback('สองใบนี้ยังไม่ใช่คู่กัน มองให้จำไว้ แล้วลองเปิดใหม่ได้เลยจ้า');
      later(() => { current.flipped = []; current.locked = false; updateMemoryCards(); }, 1500);
    }
  }

  function wordArt(word) { return word.zoo ? window.ZooArt.animal(word.id) : A.icon(word.art || word.id); }
  function selectNextMission() {
    const list = P.catalogue.filter(m => m.game === current.gameId && (current.gameId !== 'kitchen' || (m.id.startsWith('kitchen:measure:') === (saved.kitchenArea === 'measures')))), next = list.find(m => !P.done(P.state(), m.id) && P.unlocked(P.state(), m.id));
    if (!next) return;
    const parts = next.id.split(':');
    if (current.gameId === 'kitchen') { if(parts[1] === 'measure') saved.measureLesson=parts[2]; else { saved.recipe = parts[1]; saved.stage = +parts[2]; } }
    if (current.gameId === 'memory') { saved.pack = parts[1]; saved.stage = +parts[2]; }
    if (current.gameId === 'cafe') saved.cafeLevel = +parts[1];
    persist(); current.finished = false;
  }
  function finish() {
    if (current.finished) return;
    current.finished = true; current.screen = 'result';
    const gameId = current.gameId;
    const key = gameId === 'kitchen' ? 'kitchen-' + current.kitchen.recipeId : gameId;
    saved.completed[key] = (saved.completed[key] || 0) + 1; persist();
    let words, attempts, mistakes;
    if (gameId === 'kitchen') { words = current.kitchen.learned.map(id => ({ ...C.byId[id], art: id })); mistakes = current.kitchen.mistakes; attempts = words.length; }
    else if (gameId === 'cafe') { words = C.cafeItems.filter(item => current.orders.some(order => order.some(entry => entry.id === item.id))); mistakes = current.mistakes; attempts = current.orders.length; }
    else { words = current.words; mistakes = Math.max(0, current.turns - words.length); attempts = words.length; }
    const reward = P.complete(window.GameEngine.StateManager, current.mission, current.runId, attempts / (attempts + mistakes)), course = P.stats(P.state(), gameId);
    const title = gameId === 'kitchen' ? C.recipes[current.kitchen.recipeId].th + 'เสร็จแล้วจ้า!' : gameId === 'cafe' ? `ดูแลลูกค้าครบ ${current.orders.length} คนแล้ว เก่งจังฮู้!` : 'จับคู่ครบทุกคำแล้วจ้า!';
    const next = P.catalogue.some(m => m.game === gameId && !P.done(P.state(), m.id) && P.unlocked(P.state(), m.id));
    content.className = 'mg-game-content';
    content.innerHTML = `<div class="mg-result"><span class="mg-result-stamp">สำเร็จ ${course.completed} / ${course.total} ภารกิจ ✓</span><div class="mg-result-art">${gameId === 'kitchen' ? recipeArt(C.recipes[current.kitchen.recipeId]) : A.icon(gameId === 'cafe' ? 'coffee' : 'flower')}</div><h3>${title}</h3><p>แตะฟังคำที่ได้ฝึก แล้วลองพูดตาม รอบถัดไปจะให้เรานึกคำและฟังด้วยตัวเองมากขึ้น ใช้ตัวช่วยได้เสมอต๊ะ</p><div class="mg-result-reward">+${reward.xp} XP${reward.gems ? ` · +${reward.gems} เพชร` : ''}<br><small>${reward.message}</small></div><span class="mg-eyebrow">คำที่เราได้ฝึก · แตะเพื่อฟังเสียง</span><div class="mg-word-album">${words.map(word => `<button type="button" class="mg-album-word" data-action="word" data-word="${escape(word.sv)}" aria-label="ฟังคำว่า ${escape(word.sv)}">${wordArt(word)}<span lang="sv">${word.sv}</span><span lang="th">${word.th}</span></button>`).join('')}</div><div class="mg-result-actions">${next ? '<button type="button" class="mg-primary" data-action="next-mission">ไปภารกิจถัดไป →</button>' : ''}<button type="button" class="mg-secondary" data-action="again">เลือกภารกิจ / ทบทวน</button><button type="button" class="mg-secondary" data-action="close">กลับไปเลือกเกม</button></div></div>`;
    sound('fanfare'); content.scrollTop = 0; focusContent(); confetti(); renderLobby();
  }
  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.createElement('div'); layer.className = 'mg-confetti'; layer.setAttribute('aria-hidden', 'true');
    const colors = ['#9bb091', '#ddbd7a', '#d9a69a', '#9bb8bd', '#d5c2a2'];
    layer.innerHTML = Array.from({ length: 32 }, (_, i) => `<i style="left:${i * 3.2}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * .6}s;transform:rotate(${i * 23}deg)"></i>`).join('');
    $('.mg-result', dialog).appendChild(layer);
    later(() => layer.remove(), 3200);
  }
  window.SmallGames = { open, close, renderLobby };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

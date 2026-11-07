/* Shared curriculum and bounded rewards. Pure rules also run in Node tests. */
(function (root) {
  'use strict';
  const CAPS = Object.freeze({ xp: 180, games: 60, gems: 20, reviews: 3 });
  const stages = [
    { id: 0, th: 'รู้จักคำ', detail: 'อ่าน ฟัง และดูคำแปลไทย', xp: 8 },
    { id: 1, th: 'นึกคำให้ได้', detail: 'อ่านคำสวีเดน แล้วนึกความหมายก่อนเปิดคำแปล', xp: 10 },
    { id: 2, th: 'ฟังแล้วเข้าใจ', detail: 'ฟังเสียงสวีเดนแล้วเลือกภาพ เปิดคำช่วยได้เสมอ', xp: 12 }
  ];
  const catalogue = [];
  const kitchenStages = [...stages, { id: 3, th: 'ตวงและชั่งตามสูตร', detail: 'อ่านหรือฟังปริมาณ แล้วใช้ถ้วยตวง ช้อน หรือเครื่องชั่ง', xp: 12 }];
  const measureLessons = ['volume-names','weight-names','volume','spoons','weight','fractions','precision','scaling','listening','recipe-signs'];
  for (const recipe of ['cake', 'cookies', 'buns', 'lemoncake', 'banana', 'carrotcake', 'blueberry', 'apple']) {
    kitchenStages.forEach(stage => catalogue.push({ id: `kitchen:${recipe}:${stage.id}`, game: 'kitchen', xp: stage.xp,
      prerequisite: stage.id ? `kitchen:${recipe}:${stage.id - 1}` : null }));
  }
  measureLessons.forEach((id,i)=>catalogue.push({id:`kitchen:measure:${id}`,game:'kitchen',xp:i<2?8:i<7?10:12,prerequisite:i?`kitchen:measure:${measureLessons[i-1]}`:null}));
  for (let i = 0; i < 6; i++) catalogue.push({ id: `cafe:${i}`, game: 'cafe', xp: 12 + i * 2, prerequisite: i ? `cafe:${i - 1}` : null });
  for (const pack of ['home', 'baking', 'fruit', 'food', 'fika', 'pantry', 'forest', 'tropical']) {
    stages.forEach(stage => catalogue.push({ id: `memory:${pack}:${stage.id}`, game: 'memory', xp: stage.xp,
      prerequisite: stage.id ? `memory:${pack}:${stage.id - 1}` : null }));
  }
  for (let i = 0; i < 4; i++) catalogue.push({ id: `zoo:${i}`, game: 'zoo', xp: 24 + i * 4, prerequisite: i ? `zoo:${i - 1}` : null });
  const byId = Object.fromEntries(catalogue.map(m => [m.id, m]));
  const levels = [
    ['🌱', 'เริ่มก้าวแรก', 0, 0, 0, 0], ['🧭', 'นักสำรวจคำ', 120, 2, 10, 1],
    ['⭐', 'ฝึกอย่างต่อเนื่อง', 360, 6, 35, 2], ['📚', 'นักสะสมความเข้าใจ', 800, 12, 80, 4],
    ['🌿', 'รากฐานมั่นคง', 1500, 20, 150, 7], ['✨', 'เดินหน้าอย่างมั่นใจ', 2600, 30, 250, 14],
    ['🏆', 'เพื่อนคู่ทางภาษาสวีเดน', 4200, 40, 400, 28]
  ].map(([icon, titleTh, minXP, missions, words, days], i, all) => ({ level: i + 1, icon, titleTh, titleSv: titleTh,
    minXP, maxXP: all[i + 1]?.[2] || Number.MAX_SAFE_INTEGER, missions, words, days,
    desc: 'ระดับนี้บอกความสม่ำเสมอในการฝึก ไม่ใช่ใบรับรองความคล่องหรือระดับภาษา' }));
  function today(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function ledger(state) {
    if (!state.learningProgress || state.learningProgress.version !== 2) state.learningProgress = { version: 2, missions: {}, days: {}, migrated: false };
    if (!state.learningProgress.missions || typeof state.learningProgress.missions !== 'object' || Array.isArray(state.learningProgress.missions)) state.learningProgress.missions = {};
    if (!state.learningProgress.days || typeof state.learningProgress.days !== 'object' || Array.isArray(state.learningProgress.days)) state.learningProgress.days = {};
    return state.learningProgress;
  }
  function daily(state, day) {
    const l = ledger(state);
    if (!l.days[day]) l.days[day] = { xp: 0, games: 0, gems: 0, reviews: [], practiced: false };
    if (state.lastActiveDate === day) l.days[day].xp = Math.max(l.days[day].xp, Math.min(CAPS.xp, positive(state.dailyXP)));
    return l.days[day];
  }
  function positive(value) { return Number.isFinite(value) && value > 0 ? Math.min(10000, Math.floor(value)) : 0; }
  function awardXP(state, amount, options = {}, day = today()) {
    const d = daily(state, day), isGame = options.source === 'game';
    const granted = Math.max(0, Math.min(positive(amount), CAPS.xp - d.xp, isGame ? CAPS.games - d.games : Infinity));
    d.xp += granted; if (isGame) d.games += granted;
    if (granted) d.practiced = true;
    return granted;
  }
  function awardGems(state, amount, day = today()) {
    const d = daily(state, day), granted = Math.max(0, Math.min(positive(amount), CAPS.gems - d.gems));
    d.gems += granted; return granted;
  }
  function done(state, id) { return !!ledger(state).missions[id]?.completed; }
  function unlocked(state, id) { const m = Object.hasOwn(byId, id) ? byId[id] : null; return !!m && (!m.prerequisite || done(state, m.prerequisite)); }
  function complete(sm, id, runId, accuracy = 1, day = today()) {
    const mission = byId[id], l = ledger(sm.state), d = daily(sm.state, day);
    if (!mission || !unlocked(sm.state, id)) return { xp: 0, message: 'ทำภารกิจก่อนหน้านี้ให้จบก่อนนะ' };
    let entry = l.missions[id];
    if (entry?.lastRun === runId) return { xp: 0, message: 'บันทึกรอบนี้เรียบร้อยแล้ว' };
    const first = !entry?.completed;
    if (!entry) entry = l.missions[id] = { remaining: mission.xp, completed: false, completions: 0, bestAccuracy: 0 };
    entry.completed = true; entry.completions++; entry.lastRun = runId;
    entry.bestAccuracy = Math.max(entry.bestAccuracy, Math.max(0, Math.min(1, Number(accuracy) || 0)));
    d.practiced = true;
    let requested = 0, review = false;
    if (entry.remaining > 0 && entry.rewardDay !== day) requested = entry.remaining;
    else if (!first && entry.completedDay !== day && entry.rewardDay !== day && d.reviews.length < CAPS.reviews && !d.reviews.includes(id)) { requested = 2; review = true; }
    const xp = requested ? sm.addXP(requested, { source: 'game', allowBooster: false, day }) : 0;
    if (requested) entry.rewardDay = day;
    if (!review) entry.remaining = Math.max(0, entry.remaining - xp);
    if (review && xp) d.reviews.push(id);
    entry.completedDay = day;
    const milestoneGems = Math.floor(stats(sm.state).completed / 3) * 2;
    const gems = sm.addGems ? sm.addGems(Math.max(0, milestoneGems - (l.gameGemsPaid || 0))) : 0;
    l.gameGemsPaid = (l.gameGemsPaid || 0) + gems;
    sm.save();
    let message = xp ? (review ? 'ทบทวนต่างวัน +2 แต้ม สูงสุดวันละ 3 ภารกิจ' : 'รางวัลภารกิจใหม่ รับได้ครั้งเดียวต่อภารกิจ') : 'บันทึกความคืบหน้าแล้ว เล่นซ้ำวันนี้ได้โดยไม่เพิ่มแต้ม';
    if (entry.remaining > 0) message = `แต้มเกมวันนี้ถึงเพดานแล้ว ยังเหลือรางวัล ${entry.remaining} แต้ม กลับมาทำภารกิจนี้วันอื่นเพื่อรับส่วนที่เหลือได้`;
    return { xp, gems, first, remaining: entry.remaining, message };
  }
  function stats(state, game) {
    const list = catalogue.filter(m => !game || m.game === game);
    return { completed: list.filter(m => done(state, m.id)).length, total: list.length };
  }
  function levelInfo(totalXP = 0, state = {}) {
    const l = ledger(state), missions = stats(state).completed;
    const words = Object.values(state.srsData || {}).filter(r => r.correctCount > 0 || r.repetitions > 0 || r.masteryLevel > 0).length;
    const days = Object.values(l.days).filter(d => d.practiced).length;
    const reached = level => totalXP >= level.minXP && (missions >= level.missions || words >= level.words) && days >= level.days;
    const current = levels.filter(reached).at(-1) || levels[0], next = levels[current.level] || null;
    const xpSpan = next ? next.minXP - current.minXP : 1, xpInLevel = Math.max(0, totalXP - current.minXP);
    const proof = next ? Math.max(missions / next.missions, words / next.words) : 1;
    return { current, next, totalXP, xpInLevel, xpSpan, remainingToNext: next ? Math.max(0, next.minXP - totalXP) : 0,
      progressPct: next ? Math.floor(100 * Math.max(0, Math.min(1, xpInLevel / xpSpan, proof, days / next.days))) : 100,
      missions, words, days, requirement: next ? `ระดับถัดไป: ${next.minXP} XP · ${next.missions} ภารกิจต่างกัน หรือ ${next.words} คำที่ฝึกถูก · ฝึก ${next.days} วัน` : 'เก็บประสบการณ์ต่อได้เสมอ ระดับนี้บอกเส้นทางการฝึกของเรา', reached };
  }
  function migrate(state, mini = {}, zoo = {}) {
    const l = ledger(state); if (l.migrated) return;
    const importOne = id => { if (!l.missions[id]) l.missions[id] = { completed: true, remaining: 0, completions: 1, bestAccuracy: 0, completedDay: 'legacy' }; };
    for (const id of ['cake', 'cookies']) if (mini.completed?.['kitchen-' + id]) importOne(`kitchen:${id}:0`);
    if (mini.completed?.cafe) importOne('cafe:0'); if (mini.completed?.memory) importOne('memory:home:0');
    if (zoo.completed) importOne('zoo:0'); l.migrated = true;
    l.gameGemsPaid = Math.floor(stats(state).completed / 3) * 2;
  }
  function state() { return root.GameEngine?.StateManager?.state || fallback; }
  const fallback = {};
  const api = { CAPS, stages, kitchenStages, measureLessons, catalogue, byId, levels, today, ledger, daily, awardXP, awardGems, complete, done, unlocked, stats, levelInfo, migrate, state };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.LearningProgress = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* Gong Heng. Saved vocabulary album and deterministic fishing interactions. */
(function (root) {
  'use strict';
  const fish = [
    { id:'abborre', name:'abborre', sv:'en abborre', definite:'abborren', plural:'abborrar', th:'ปลาเพิร์ชยุโรป · ลายขวางเข้ม', sentence:'Abborren har ränder.', sentenceTh:'ปลาเพิร์ชมีลายขวาง', color:'#9da85e', accent:'#d68c4d', shape:'oval', pattern:'stripes', length:25, strength:.96 },
    { id:'gadda', name:'gädda', sv:'en gädda', definite:'gäddan', plural:'gäddor', th:'ปลาไพค์ · ปากยาว ลำตัวเรียว', sentence:'Gäddan är lång.', sentenceTh:'ปลาไพค์มีลำตัวยาว', color:'#8d9b60', accent:'#bba45c', shape:'long', pattern:'spots', length:58, strength:1.12 },
    { id:'mort', name:'mört', sv:'en mört', definite:'mörten', plural:'mörtar', th:'ปลาโรช · เกล็ดเงิน ตาสีแดง', sentence:'Mörten är silverfärgad.', sentenceTh:'ปลาโรชมีสีเงิน', color:'#b5c4b3', accent:'#c67d5f', shape:'oval', pattern:'scales', length:20, strength:.92 },
    { id:'braxen', name:'braxen', sv:'en braxen', definite:'braxen', plural:'braxnar', th:'ปลาบรีม · ลำตัวสูงและแบน', sentence:'Braxen har en hög kropp.', sentenceTh:'ปลาบรีมมีลำตัวสูง', color:'#b9ad7d', accent:'#8b8e73', shape:'round', pattern:'scales', length:38, strength:1.02 },
    { id:'sutare', name:'sutare', sv:'en sutare', definite:'sutaren', plural:'sutare', th:'ปลาเทนช์ · สีเขียวมะกอก', sentence:'Sutaren är grön.', sentenceTh:'ปลาเทนช์มีสีเขียว', color:'#7e9260', accent:'#b99a61', shape:'oval', pattern:'plain', length:32, strength:1 },
    { id:'sarv', name:'sarv', sv:'en sarv', definite:'sarven', plural:'sarvar', th:'ปลารัดด์ · ครีบแดง เกล็ดทอง', sentence:'Sarven har röda fenor.', sentenceTh:'ปลารัดด์มีครีบสีแดง', color:'#c9b87e', accent:'#c9744f', shape:'oval', pattern:'scales', length:23, strength:.94 },
    { id:'gos', name:'gös', sv:'en gös', definite:'gösen', plural:'gösar', th:'ปลาแซนเดอร์ · ครีบหลังตั้ง', sentence:'Gösen har en stor fena.', sentenceTh:'ปลาแซนเดอร์มีครีบขนาดใหญ่', color:'#a6ae83', accent:'#a3a783', shape:'long', pattern:'stripes', length:44, strength:1.08 },
    { id:'oring', name:'öring', sv:'en öring', definite:'öringen', plural:'öringar', th:'ปลาเทราต์สีน้ำตาล · ลายจุด', sentence:'Öringen har prickar.', sentenceTh:'ปลาเทราต์มีลายจุด', color:'#b3a77a', accent:'#b76d52', shape:'long', pattern:'spots', length:34, strength:1.04 }
  ];
  const byId = Object.fromEntries(fish.map(item => [item.id,item]));
  const baits = [
    { id:'shrimp', sv:'en torkad räka', name:'torkad räka', th:'กุ้งแห้ง', line:'Jag väljer en torkad räka.', meaning:'ฉันเลือกกุ้งแห้งหนึ่งตัว', icon:'🦐' },
    { id:'worm', sv:'en mask', name:'mask', th:'ไส้เดือน', line:'Jag väljer en mask.', meaning:'ฉันเลือกไส้เดือนหนึ่งตัว', icon:'〰' },
    { id:'bread', sv:'en bit bröd', name:'bröd', th:'ขนมปังชิ้นเล็ก', line:'Jag väljer en bit bröd.', meaning:'ฉันเลือกขนมปังชิ้นเล็ก', icon:'🍞' }
  ];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const nonnegative = value => Number.isInteger(value) && value >= 0 ? Math.min(value,999999) : 0;
  const knownFish = id => typeof id === 'string' && Object.hasOwn(byId,id);
  const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';

  function restore(raw) {
    const source = raw?.version === 1 ? raw : {};
    const album = {};
    for (const item of fish) {
      const count = nonnegative(source.album?.[item.id]);
      if (count) album[item.id] = count;
    }
    return { version:1, album, totalCatch:Math.max(nonnegative(source.totalCatch),Object.values(album).reduce((sum,count) => sum+count,0)),
      bait:baits.some(item => item.id === source.bait) ? source.bait : 'shrimp', pending:knownFish(source.pending) ? source.pending : null,
      pendingSpeech:knownFish(source.pendingSpeech) ? source.pendingSpeech : null,
      catchDay:date(source.catchDay), dayCount:Math.min(3,nonnegative(source.dayCount)), bonusDay:date(source.bonusDay) };
  }

  // Finger points are normalized to the casting surface. A clear upward sweep casts.
  function cast(start, end) {
    if (![start?.x,start?.y,end?.x,end?.y].every(Number.isFinite)) return { valid:false, power:0, x:.5, y:.55, distance:0 };
    const rise = start.y-end.y;
    const power = clamp(rise/.55,0,1);
    return { valid:rise >= .075, power, x:clamp(.5+(end.x-start.x)*1.35,.12,.88), y:.55-power*.33, distance:power };
  }

  function angleDelta(before, after) {
    if (![before,after].every(Number.isFinite)) return 0;
    return Math.atan2(Math.sin(after-before),Math.cos(after-before));
  }

  // The first unseen fish in a rotating set appears frequently, making the full album attainable.
  // Baits change the game's rotation. These are game choices, not a real bait guide.
  function chooseFish(state, baitId, landing, random = Math.random) {
    const offset = Math.max(0,baits.findIndex(item => item.id === baitId));
    const distance = Number.isFinite(landing?.distance) ? clamp(landing.distance,0,1) : .5;
    const value = clamp(Number(random()) || 0,0,.999999);
    const rotation = (nonnegative(state.totalCatch) + offset*2 + Math.floor(distance*3)) % fish.length;
    const ordered = [...fish.slice(rotation),...fish.slice(0,rotation)];
    const unseen = ordered.filter(item => !state.album[item.id]);
    return (unseen.length && value < .72 ? unseen[Math.floor(value/.72*unseen.length)] : ordered[Math.floor(value*ordered.length)]).id;
  }

  function createFight(fishId, distance = .5) {
    const id = knownFish(fishId) ? fishId : fish[0].id;
    return { fishId:id, phase:'fight', progress:0, tension:.22, time:0, warning:false, surge:false, stress:0,
      distance:clamp(Number(distance) || .5,0,1) };
  }

  function tickFight(fight, turns, dt) {
    if (fight.phase !== 'fight') return fight.phase;
    const elapsed = Number.isFinite(dt) ? clamp(dt,0,.08) : 0;
    if (!elapsed) return fight.phase;
    fight.time += elapsed;
    const cycle = fight.time % 5.8;
    fight.warning = cycle >= 2.45 && cycle < 3.15;
    fight.surge = cycle >= 3.15 && cycle < 4.45;
    const item = byId[fight.fishId] || fish[0];
    const movement = Number.isFinite(turns) ? clamp(Math.abs(turns),0,elapsed*2.2) : 0;
    const speed = movement/elapsed;
    const pulling = speed > .025;
    const rise = fight.surge ? .63 : .21;
    const release = fight.surge ? .42 : .38;
    fight.tension = clamp(fight.tension + (speed*rise*item.strength - (pulling ? .065 : release))*elapsed,.08,1);
    if (fight.tension > .94) fight.stress += elapsed;
    else fight.stress = Math.max(0,fight.stress-elapsed*1.8);
    if (fight.stress >= .68) { fight.phase = 'broken'; return fight.phase; }
    const retrieve = (fight.surge ? .015 : .13) * movement / (.82+fight.distance*.27);
    fight.progress = clamp(fight.progress + retrieve - (fight.surge && !pulling ? .005*elapsed : 0),0,1);
    if (fight.progress >= 1) fight.phase = 'caught';
    return fight.phase;
  }

  function startCatch(state, fishId) {
    if (state.pending || state.pendingSpeech || !knownFish(fishId)) return false;
    state.pending = fishId;
    return true;
  }

  function answerCatch(state, chosenId, day) {
    const item = knownFish(state.pending) ? byId[state.pending] : null;
    if (!item || chosenId !== item.id) return { correct:false, newFish:false, xp:0, fish:item };
    const newFish = !state.album[item.id];
    state.album[item.id] = nonnegative(state.album[item.id])+1;
    state.totalCatch = nonnegative(state.totalCatch)+1;
    state.pending = null;
    if (state.totalCatch % 3 === 0) state.pendingSpeech = item.id;
    const today = date(day);
    if (state.catchDay !== today) { state.catchDay = today; state.dayCount = 0; }
    state.dayCount = Math.min(3,state.dayCount+1);
    let xp = 0;
    if (today && state.dayCount === 3 && state.bonusDay !== today) { state.bonusDay = today; xp = 3; }
    return { correct:true, newFish, xp, fish:item };
  }

  function finishSpeech(state) {
    if (!state.pendingSpeech) return false;
    state.pendingSpeech = null;
    return true;
  }

  const api = { fish, byId, baits, restore, cast, angleDelta, chooseFish, createFight, tickFight, startCatch, answerCatch, finishSpeech };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FarmFishingCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

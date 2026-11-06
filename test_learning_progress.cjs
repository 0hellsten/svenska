'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const P = require('./learning_progress.js'), C = require('./mini_games_core.js'), Z = require('./zoo_core.js');
function manager() { return { state: { totalXP: 0, dailyXP: 0, gems: 0 }, save() {}, addXP(n, opts) { const got = P.awardXP(this.state, n, opts, opts.day); this.state.totalXP += got; return got; } }; }
test('58 distinct missions form valid prerequisite paths', () => {
  assert.equal(P.catalogue.length, 58); assert.equal(new Set(P.catalogue.map(m => m.id)).size, 58);
  for (const m of P.catalogue) { assert.ok(m.xp >= 8 && m.xp <= 36); if (m.prerequisite) assert.ok(P.byId[m.prerequisite]); }
  const sm = manager(); assert.equal(P.unlocked(sm.state, 'kitchen:cake:1'), false);
  assert.equal(P.complete(sm, 'kitchen:cake:1', 'locked').xp, 0); assert.equal(P.unlocked(sm.state, '__proto__'), false);
  assert.equal(P.complete(sm, '__proto__', 'x').xp, 0);
});
test('First completion, duplicate callbacks, same-day retries, and later review are bounded', () => {
  const sm = manager(), d = '2026-11-01';
  assert.equal(P.complete(sm, 'kitchen:cake:0', 'a', 1, d).xp, 8);
  assert.equal(P.complete(sm, 'kitchen:cake:0', 'a', 1, d).xp, 0);
  assert.equal(P.complete(sm, 'kitchen:cake:0', 'b', 1, d).xp, 0);
  assert.equal(P.complete(sm, 'kitchen:cake:0', 'c', 1, '2026-11-02').xp, 2);
  assert.equal(P.complete(sm, 'kitchen:cake:0', 'd', 1, '2026-11-02').xp, 0);
  assert.equal(sm.state.totalXP, 10);
});
test('Daily game cap preserves unpaid first rewards for a completed mission on a later day', () => {
  const sm = manager(), d = '2026-11-01'; P.awardXP(sm.state, 58, { source:'game' }, d);
  assert.equal(P.complete(sm,'kitchen:cake:0','a',1,d).xp,2);
  assert.equal(P.ledger(sm.state).missions['kitchen:cake:0'].remaining,6);
  assert.equal(P.complete(sm,'kitchen:cake:0','b',1,d).xp,0);
  assert.equal(P.complete(sm,'kitchen:cake:0','c',1,'2026-11-02').xp,6);
  assert.equal(P.ledger(sm.state).missions['kitchen:cake:0'].remaining,0);
});
test('Review pays at most three different missions a day', () => {
  const sm=manager(), ids=['kitchen:cake:0','kitchen:cookies:0','kitchen:buns:0','memory:home:0'];
  ids.forEach(id=>P.complete(sm,id,id,1,'2026-11-01'));
  assert.deepEqual(ids.map(id=>P.complete(sm,id,id+'review',1,'2026-11-02').xp),[2,2,2,0]);
});
test('Whole-app XP and gem caps survive serialization and reject invalid awards', () => {
  const sm=manager(), d='2026-11-01';
  for(const n of [NaN,Infinity,-50,0]) { assert.equal(P.awardXP(sm.state,n,{},d),0); assert.equal(P.awardGems(sm.state,n,d),0); }
  assert.equal(P.awardXP(sm.state,170,{},d),170); assert.equal(P.awardXP(sm.state,50,{source:'game'},d),10);
  const restored=JSON.parse(JSON.stringify(sm.state)); assert.equal(P.awardXP(restored,1,{},d),0);
  assert.equal(P.awardGems(restored,15,d),15); assert.equal(P.awardGems(restored,15,d),5); assert.equal(P.awardGems(restored,15,d),0);
  assert.equal(P.awardXP(restored,40,{},'2026-11-02'),40);
});
test('Updating an existing learner respects XP already earned today', () => {
  const state = { dailyXP: 175, lastActiveDate: '2026-11-01' };
  assert.equal(P.awardXP(state, 20, {}, '2026-11-01'), 5);
  assert.equal(P.awardXP(state, 20, {}, '2026-11-01'), 0);
});
test('Game milestone gems are paid once, carry over a daily cap, and never reward repeated progress', () => {
  const sm=manager(); sm.addGems = n => { const got=P.awardGems(sm.state,n,'2026-11-01');sm.state.gems+=got;return got; };
  for(const [i,id] of ['kitchen:cake:0','kitchen:cookies:0','memory:home:0'].entries()) P.complete(sm,id,'run'+i,1,'2026-11-01');
  assert.equal(sm.state.gems,2);
  P.complete(sm,'memory:home:0','repeat',1,'2026-11-01');assert.equal(sm.state.gems,2);
  assert.equal(P.ledger(sm.state).gameGemsPaid,2);
  P.awardGems(sm.state,18,'2026-11-01');
  for(const [i,id] of ['kitchen:buns:0','kitchen:apple:0','memory:fruit:0'].entries()) P.complete(sm,id,'more'+i,1,'2026-11-01');
  assert.equal(P.ledger(sm.state).gameGemsPaid,2);
  sm.addGems=n=>P.awardGems(sm.state,n,'2026-11-02');
  assert.equal(P.complete(sm,'memory:fruit:0','tomorrow',1,'2026-11-02').gems,2);
  assert.equal(P.ledger(sm.state).gameGemsPaid,4);
});
test('Ranks require real practice proof; empty SRS rows and XP alone do not unlock ranks', () => {
  const sm=manager(); sm.state.totalXP=99999; sm.state.srsData=Object.fromEntries(Array.from({length:1000},(_,i)=>[i,{masteryLevel:0,repetitions:0,correctCount:0}]));
  assert.equal(P.levelInfo(sm.state.totalXP,sm.state).current.level,1);
  P.complete(sm,'kitchen:cake:0','a',1,'2026-11-01'); P.complete(sm,'kitchen:cookies:0','b',1,'2026-11-01');
  assert.equal(P.levelInfo(sm.state.totalXP,sm.state).current.level,2);
  assert.equal(P.levelInfo(sm.state.totalXP,sm.state).words,0);
});
test('Migration preserves existing completed games without paying first rewards again', () => {
  const sm=manager(); P.migrate(sm.state,{completed:{'kitchen-cake':5,cafe:8,memory:2}},{completed:4});
  assert.equal(P.stats(sm.state).completed,4); assert.equal(sm.state.totalXP,0);
  P.migrate(sm.state,{completed:{'kitchen-cookies':1}},{}); assert.equal(P.stats(sm.state).completed,4);
  assert.equal(P.ledger(sm.state).missions['zoo:0'].remaining,0);
});
test('Every recipe is completable with the original pantry and has distinct vocabulary', () => {
  assert.equal(Object.keys(C.recipes).length,8);
  for(const r of Object.values(C.recipes)) { const s=C.createKitchen(r.id); for(const id of r.steps) assert.equal(C.addIngredient(s,id),'correct'); for(let i=0;i<5;i++)C.stir(s);C.bake(s);C.finishBaking(s);for(const id of r.decorations)C.addIngredient(s,id); assert.equal(s.phase,'done'); }
});
test('Six café days cover 39 guests, quantities to four, and three Swedish request forms', () => {
  assert.equal(C.cafeRounds.reduce((n,r)=>n+r.count,0),39);
  for(let day=0;day<6;day++) for(let run=0;run<10;run++) { const orders=C.createCafeRound(day); assert.equal(orders.length,C.cafeRounds[day].count); for(const order of orders) { assert.equal(C.checkOrder(order,Object.fromEntries(order.map(i=>[i.id,i.count]))),true); assert.ok(!C.orderText(order,day%3).includes('undefined')); } }
  assert.match(C.orderText([{id:'water',count:4}],2),/fyra glas vatten/);
});
test('Eight memory packs have six pairs, and listening review adds two earlier words', () => {
  assert.equal(C.memoryPacks.length,8);
  for(const p of C.memoryPacks) for(let stage=0;stage<3;stage++) { const words=C.memoryWords(p.id,stage,Z.animals); assert.equal(words.length,stage===2?8:6); assert.equal(new Set(words.map(w=>w.id)).size,words.length); for(const w of words) assert.ok(w.sv&&w.th); const deck=C.createMemory(Math.random,words);assert.equal(deck.length,words.length*2); }
  assert.equal(C.memoryWords('home',2,Z.animals,[]).length,6,'No unseen words are presented as prior review');
  const known = C.memoryWords('home',2,Z.animals,['fruit']);
  assert.equal(known.length,8); assert.ok(known.slice(6).every(w=>C.memoryWords('fruit',0,Z.animals).some(v=>v.id===w.id)));
});
test('Four zoo nights test different skills and all 48 animal challenges have exactly one correct choice', () => {
  for(let episode=0;episode<4;episode++) { const s=Z.create(Math.random,episode); for(let room=0;room<3;room++) { for(const id of Z.rooms[room].animals) { const c=Z.challenge(s,id);assert.equal(new Set(c.choices).size,3);assert.equal(c.choices.filter(v=>v===c.answer).length,1,episode+':'+id);assert.equal(Z.identify(s,id,c.answer),'found'); } assert.equal(Z.solve(s,room,room===0?Z.code(s):room===1?Z.sluiceSteps.map(v=>v.id):Z.phrase),'solved'); }assert.equal(s.status,'escaped');assert.equal(Z.restore(JSON.stringify(s)).episode,episode); }
});

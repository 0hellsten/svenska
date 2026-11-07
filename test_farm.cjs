'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const F = require('./farm_core.js');
const G = require('./farm_gestures.js');
const P = require('./learning_progress.js');

test('Plot work keeps the seed and its time across sessions and supports early morning harvest', () => {
  const state = F.restore();
  assert.equal(F.tend(state, 0, 'seed', 'pumpkin', 100), 'empty');
  assert.equal(F.tend(state, 0, 'seed', 'carrot', 100), 'planted');
  assert.equal(F.tend(state, 0, 'harvest', 'carrot', 10000), 'dry');
  assert.equal(F.tend(state, 0, 'water', 'carrot', 10100), 'watered');
  const resumed = F.restore(JSON.parse(JSON.stringify(state)));
  assert.equal(F.plotStatus(resumed.plots[0], 10101), 'growing');
  assert.equal(F.nextDay(resumed, 10101), true);
  assert.equal(F.tend(resumed, 0, 'harvest', 'carrot', 10101), 'harvested');
  assert.equal(resumed.stock.carrot, 3);
  assert.equal(F.tend(resumed, 0, 'harvest', 'carrot', 10101), 'empty');
  assert.equal(F.nextDay(resumed, 10101), false);
  assert.equal(resumed.event, null, 'Going to sleep never rolls a surprise');
});

test('All eight story chapters are attainable with available crops, animals and recipes', () => {
  const state = F.restore();
  const now = 20_000;
  function collect(id) {
    if (F.crops[id]) {
      assert.equal(F.tend(state, 0, 'seed', id, now), 'planted');
      assert.equal(F.tend(state, 0, 'water', id, now), 'watered');
      assert.equal(F.tend(state, 0, 'harvest', id, now + 40000), 'harvested');
      return;
    }
    const animal = Object.keys(F.animals).find(key => F.animals[key].good === id);
    if (animal) {
      assert.equal(F.canVisit(state, F.animals[animal].zone, F.trainingLevel(state, 0, 0)), true);
      assert.equal(F.tendAnimal(state, animal, now), 'feed');
      assert.equal(F.tendAnimal(state, animal, now + 1000), 'rest');
      assert.equal(F.tendAnimal(state, animal, now + 40000), 'collect');
      return;
    }
    assert.ok(F.recipes[id]);
    assert.equal(F.canVisit(state, 'workshop', F.trainingLevel(state, 0, 0)), true);
    for (const [key, amount] of Object.entries(F.recipes[id].uses)) {
      while (state.stock[key] < amount) collect(key);
    }
    assert.equal(F.craft(state, id, now), true);
  }
  const sm = { state:{}, save(){}, addXP:() => 0 };
  for (const chapter of F.chapters) {
    assert.equal(F.order(state).id, chapter.id);
    assert.equal(F.deliver(state, now), null);
    // Craft finished goods first, since they can consume other order goods.
    for (const [id, amount] of Object.entries(chapter.order)) {
      if (F.recipes[id]) while (state.stock[id] < amount) collect(id);
    }
    for (const [id, amount] of Object.entries(chapter.order)) {
      while (state.stock[id] < amount) collect(id);
    }
    const change = F.orderChange(state);
    if (change) assert.equal(F.moveBasket(state, change.id, 'stock', change.from), 'changed');
    const plan = F.orderPlan(state);
    for (const place of F.baskets) for (const [id, amount] of Object.entries(plan[place])) {
      while (F.basketCount(state, place, id) < amount) assert.equal(F.moveBasket(state, id, 'stock', place), 'moved');
    }
    assert.deepEqual(F.checkBasket(state), { missing:[], extra:[], misplaced:[], ok:true });
    assert.equal(F.deliver(state, now).id, chapter.id);
    assert.equal(F.deliver(state, now), null);
    assert.equal(P.complete(sm, `farm:${chapter.id}`, chapter.id).first, true);
  }
  assert.equal(state.chapter, 8);
  assert.equal(P.stats(sm.state, 'farm').completed, 8);
  assert.equal(F.order(state).id, undefined);
});

test('Basket mismatches preserve stock, while crafting reconciles packed ingredients', () => {
  const state = F.restore({ version:1, chapter:2, stock:{carrot:2,wheat:3}, basket:{carrot:2,wheat:3} });
  assert.deepEqual(F.checkBasket(state), { missing:['bread'], extra:['carrot','wheat'], misplaced:[], ok:false });
  assert.equal(F.deliver(state, 500), null);
  assert.equal(F.craft(state, 'flour', 500), true);
  assert.equal(state.stock.wheat, 1);
  assert.equal(state.baskets.large.wheat, 1);
  assert.equal(state.stock.flour, 1);
});

test('A change of mind persists and a misplaced item can be transferred without losing stock', () => {
  const state = F.restore({ version:1, chapter:1, stock:{ potato:2, egg:1 } });
  assert.deepEqual(F.orderPlan(state), { large:{ potato:2 }, small:{ egg:1 } });
  assert.equal(F.moveBasket(state, 'potato', 'stock', 'large'), 'changed');
  assert.equal(F.moveBasket(state, 'potato', 'stock', 'large'), 'moved');
  assert.equal(F.moveBasket(state, 'egg', 'stock', 'small'), 'moved');
  const resumed = F.restore(state);
  assert.deepEqual(F.checkBasket(resumed), { missing:[], extra:[], misplaced:['potato'], ok:false });
  assert.equal(F.moveBasket(resumed, 'potato', 'large', 'small'), 'moved');
  assert.equal(F.moveBasket(resumed, 'potato', 'stock', 'small'), false);
  assert.equal(F.moveBasket(resumed, 'egg', 'small', 'stock'), 'moved');
  assert.equal(F.moveBasket(resumed, 'egg', 'stock', 'small'), 'moved');
  assert.equal(F.deliver(resumed, 10).id, 'breakfast');
  assert.equal(resumed.stock.potato, 0);
  assert.equal(resumed.orderChanged, false);
});

test('Language progress opens each zone before its first required delivery, including for old saves', () => {
  const state = F.restore();
  assert.equal(F.canVisit(state, 'fields', F.trainingLevel(state, 0, 0)), true);
  assert.equal(F.canVisit(state, 'barn', F.trainingLevel(state, 0, 4)), false);
  assert.equal(F.canVisit(state, 'barn', F.trainingLevel(state, 0, 5)), true);
  assert.equal(F.canVisit(state, 'paddock', F.trainingLevel(state, 2, 5)), true);
  assert.equal(F.canVisit(state, 'pigs', F.trainingLevel(state, 2, 9)), false);
  const saved = F.restore({ version:1, chapter:5, foal:'Sol' });
  assert.equal(F.canVisit(saved, 'pigs', F.trainingLevel(saved, 0, 0)), true);
  const pending = F.restore({ version:1, event:{ id:'fence', step:1 } });
  assert.equal(F.canVisit(pending, 'pigs', 0), true);
  const returning = F.restore({ version:1, leftAt:1, activity:2 });
  assert.equal(F.returnVisit(returning, F.WAIT_AWAY + 10, () => .4, 0), true);
  assert.equal(returning.event.id, 'flag');
});

test('Brushing distinguishes a quick swipe from a steady stroke and lets her recover', () => {
  const stroke = { point:null, distance:0, direction:0 };
  assert.equal(G.brushMotion(stroke, {x:.24,y:.44,t:0}), 'ready');
  assert.equal(G.brushMotion(stroke, {x:.64,y:.44,t:25}), 'fast');
  assert.equal(G.brushMotion(stroke, {x:.50,y:.44,t:180}), 'brushing');
  assert.equal(G.brushMotion(stroke, {x:.37,y:.44,t:310}), 'stroke');
});

test('The gate recognizes the latch, quarter turn and pull while allowing overshoot recovery', () => {
  assert.equal(G.gateReady('bolt', .55), false);
  assert.equal(G.gateReady('bolt', .9), true);
  assert.equal(G.gateReady('turn', 123), false);
  assert.equal(G.gateReady('turn', 123 + G.angleDelta(123, 93)), true);
  assert.equal(G.angleDelta(179, -176), 5);
  assert.equal(G.gateReady('pull', .8), true);
});

test('Surprises wait for a worked visit and enough time away, and save the foal permanently', () => {
  const state = F.restore(), later = F.WAIT_AWAY + 2000;
  F.leave(state, 1000);
  assert.equal(F.returnVisit(state, later, () => 0), false);
  assert.equal(F.tend(state, 0, 'seed', 'carrot', later), 'planted');
  F.leave(state, later + 100);
  assert.equal(F.returnVisit(state, later + 500, () => 0), false);
  const after = F.restore(JSON.parse(JSON.stringify(state)));
  const roll = [0,.999];
  assert.equal(F.returnVisit(after, 2*later, () => roll.shift()), true);
  assert.deepEqual(after.event, { id:'foal', step:0 });
  assert.equal(F.progressEvent(after, 'foal', 0), 'next');
  assert.equal(F.progressEvent(after, 'foal', 1), 'next');
  assert.equal(F.progressEvent(after, 'foal', 2, '<script>'), false);
  assert.equal(F.progressEvent(after, 'foal', 2, 'Sol'), 'finished');
  assert.equal(F.restore(after).foal, 'Sol');
  assert.equal(F.progressEvent(after, 'foal', 2, 'Sol'), false);
  assert.equal(F.returnVisit(after, 3*later, () => 0), false, 'The same work cannot reroll');
  assert.equal(after.coins, 3);
});

test('A pending repair survives reload, with no duplicate payout or forced daily event', () => {
  const state = F.restore({ version:1, event:{id:'flag',step:1}, activity:1, leftAt:1 });
  assert.equal(F.returnVisit(state, 2*F.WAIT_AWAY, () => 0), false);
  assert.equal(F.progressEvent(state, 'flag', 0), false);
  assert.equal(F.progressEvent(state, 'flag', 1), 'next');
  assert.equal(F.progressEvent(F.restore(state), 'flag', 2), 'finished');
});

test('Portable and hosted pages include the painted farm and all its rules', () => {
  for (const name of ['index.html','svenska_satun_iphone.html']) {
    const html = fs.readFileSync(name, 'utf8');
    assert.ok(html.includes('root.FarmCore = api'));
    assert.ok(html.includes('window.FarmGame = { open, cover }'));
    assert.ok(html.includes("const mapImage = 'data:image/webp;base64,"));
    assert.ok(html.includes('root.FarmGestures = api'));
    assert.doesNotMatch(html, /<script src="farm(?:_core|_art|_gestures)?\.js">/);
  }
});

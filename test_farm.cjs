'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const F = require('./farm_core.js');
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
      assert.equal(F.tendAnimal(state, animal, now), 'feed');
      assert.equal(F.tendAnimal(state, animal, now + 1000), 'rest');
      assert.equal(F.tendAnimal(state, animal, now + 40000), 'collect');
      return;
    }
    assert.ok(F.recipes[id]);
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
      for (let i=0; i<amount; i++) assert.equal(F.adjustBasket(state, id, 1), true);
    }
    assert.deepEqual(F.checkBasket(state), { missing:[], extra:[], ok:true });
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
  assert.deepEqual(F.checkBasket(state), { missing:['bread'], extra:['carrot','wheat'], ok:false });
  assert.equal(F.deliver(state, 500), null);
  assert.equal(F.craft(state, 'flour', 500), true);
  assert.equal(state.stock.wheat, 1);
  assert.equal(state.basket.wheat, 1);
  assert.equal(state.stock.flour, 1);
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
    assert.doesNotMatch(html, /<script src="farm(?:_core|_art)?\.js">/);
  }
});

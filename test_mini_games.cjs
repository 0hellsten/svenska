'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('./mini_games_core.js');
const { speechOutcome } = require('./mini_games_dialogue.js');
const { pourStatus, whiskDistance } = require('./mini_games_hands.js');

test('A guest offers a single keyword after the fifth failed phrase attempt', () => {
  for (let failures = 0; failures < 4; failures++) {
    assert.equal(speechOutcome(failures, false, 'retry'), 'retry');
  }
  assert.equal(speechOutcome(4, false, 'retry'), 'word');
  assert.equal(speechOutcome(4, false, 'pass'), 'continue');
  assert.equal(speechOutcome(5, true, 'retry'), 'continue');
});

test('The measuring jug can recover from pouring past the target', () => {
  assert.equal(pourStatus(1.8, 2), 'under');
  assert.equal(pourStatus(2.2, 2), 'over');
  assert.equal(pourStatus(2.1, 2), 'ready');
  assert.equal(pourStatus(180, 180), 'ready');
});

test('Whisking counts turns in both directions across the angle boundary', () => {
  assert.ok(Math.abs(whiskDistance(3.1, -3.1) - (2 * Math.PI - 6.2)) < .0001);
  assert.ok(Math.abs(whiskDistance(-3.1, 3.1) - (2 * Math.PI - 6.2)) < .0001);
  assert.equal(whiskDistance(0, Math.PI), 0);
});

test('The pantry contains 29 unique, illustrated words with Swedish and Thai support', () => {
  assert.equal(C.ingredients.length, 29);
  assert.equal(new Set(C.ingredients.map(item => item.id)).size, 29);
  for (const item of C.ingredients) assert.ok(item.sv && item.definite && item.th);
});

for (const recipeId of ['cake', 'cookies']) {
  test(`${recipeId}: a complete game progresses through mixing, baking, and finishing`, () => {
    const state = C.createKitchen(recipeId);
    const recipe = C.recipes[recipeId];
    assert.equal(C.bake(state), false, 'Cannot skip mixing');
    assert.equal(C.finishBaking(state), false, 'Cannot skip the oven');
    assert.equal(C.addIngredient(state, 'fish'), 'retry');
    assert.equal(state.index, 0, 'Mistakes do not advance the recipe');
    assert.equal(state.mistakes, 1);
    for (const id of recipe.steps) {
      assert.equal(C.target(state).id, id);
      assert.equal(C.addIngredient(state, id), 'correct');
    }
    assert.equal(state.phase, 'stir');
    assert.equal(C.addIngredient(state, 'butter'), 'inactive');
    for (let i = 0; i < 4; i++) {
      assert.equal(C.stir(state), true);
      assert.equal(state.phase, 'stir');
      assert.equal(C.bake(state), false);
    }
    C.stir(state);
    assert.equal(state.phase, 'ready');
    assert.equal(C.stir(state), false);
    assert.equal(C.bake(state), true);
    assert.equal(C.bake(state), false, 'Repeated oven clicks are ignored');
    assert.equal(state.phase, 'baking');
    assert.equal(C.finishBaking(state), true);
    if (recipe.decorations.length) {
      assert.equal(state.phase, 'decorate');
      for (const id of recipe.decorations) {
        assert.equal(C.target(state).id, id);
        assert.equal(C.addIngredient(state, id), 'correct');
      }
    }
    assert.equal(state.phase, 'done');
    assert.equal(C.addIngredient(state, 'butter'), 'inactive');
    assert.deepEqual(state.learned, [...recipe.steps, ...recipe.decorations]);
  });
}

test('Unknown ingredients and recipe IDs cannot corrupt game state', () => {
  assert.throws(() => C.createKitchen('unknown'));
  assert.throws(() => C.createKitchen('__proto__'));
  const state = C.createKitchen('cake');
  assert.equal(C.addIngredient(state, 'unknown'), 'inactive');
  assert.equal(C.addIngredient(state, '__proto__'), 'inactive');
  assert.equal(state.index, 0);
});

test('Five café orders increase in difficulty and require exact quantities, with no extras', () => {
  for (let run = 0; run < 100; run++) {
    const orders = C.createOrders();
    assert.equal(orders.length, 5);
    assert.equal(new Set(orders.map(order => order[0].id)).size, 5);
    assert.equal(orders[0].length, 1);
    for (const order of orders) {
      assert.equal(new Set(order.map(item => item.id)).size, order.length);
      const tray = Object.fromEntries(order.map(item => [item.id, item.count]));
      assert.equal(C.checkOrder(order, tray), true);
      assert.equal(C.checkOrder(order, {}), false);
      assert.equal(C.checkOrder(order, { ...tray, [order[0].id]: order[0].count + 1 }), false);
      const extra = C.cafeItems.find(item => !order.some(entry => entry.id === item.id));
      assert.equal(C.checkOrder(order, { ...tray, [extra.id]: 1 }), false);
      assert.ok(C.orderText(order).startsWith('Jag vill ha '));
    }
  }
});

test('Swedish orders use the correct singular articles and plural number phrases', () => {
  assert.equal(C.orderText([{ id: 'water', count: 1 }]), 'Jag vill ha ett glas vatten, tack!');
  assert.equal(C.orderText([{ id: 'coffee', count: 2 }, { id: 'bun', count: 3 }]),
    'Jag vill ha två koppar kaffe och tre kanelbullar, tack!');
});

test('Memory contains exactly one picture and one word for all six pairs', () => {
  const deck = C.createMemory();
  assert.equal(deck.length, 12);
  assert.equal(new Set(deck.map(card => card.key)).size, 12);
  for (const item of C.memoryItems) {
    const pair = deck.filter(card => card.id === item.id);
    assert.equal(pair.length, 2);
    assert.equal(C.isPair(...pair), true);
    assert.equal(C.isPair(pair[0], pair[0]), false);
    assert.equal(C.isPair(pair[0], undefined), false);
    assert.equal(C.isPair(pair[0], deck.find(card => card.id !== item.id)), false);
  }
});

test('Both portable builds include all game modules and no missing local game dependencies', () => {
  const fs = require('node:fs');
  for (const filename of ['index.html', 'svenska_satun_iphone.html']) {
    const html = fs.readFileSync(filename, 'utf8');
    assert.ok(html.includes('id="view-games"'));
    assert.ok(html.includes('window.SmallGames ='));
    assert.ok(html.includes('root.MiniGameCore = api'));
    assert.ok(html.includes('window.MiniGameArt ='));
    assert.ok(!/src="mini_games/.test(html));
    assert.ok(!/href="mini_games.css"/.test(html));
  }
});

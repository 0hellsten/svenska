'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function startApp(saved = {}) {
  const storageKey = 'wilawan_svenska_satun_v1';
  const storage = new Map([[storageKey, JSON.stringify(saved)]]);
  const image = { addEventListener() {} };
  const horse = {
    dataset: {},
    querySelector: selector => selector === '.dala-horse-image' ? image : null
  };
  const document = {
    readyState: 'loading',
    addEventListener() {},
    querySelectorAll: () => [horse]
  };
  class Observer { observe() {} }
  const window = vm.createContext({
    document, navigator: {}, performance,
    IntersectionObserver: Observer, ResizeObserver: Observer,
    addEventListener() {},
    matchMedia: () => ({ matches: true, addEventListener() {} }),
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    }
  });
  window.window = window;
  for (const file of ['learning_progress.js', 'app.js', 'dala_motion.js', 'dala_stage.js', 'visuals.js', 'gamification.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), window, { filename: file });
  }
  window.GameEngine.StateManager.load();
  window.GameEngine.UIController.renderTopbar = () => {};
  window.DalaMotion.mount(horse, 'jump');
  return { window, horse, saved: () => JSON.parse(storage.get(storageKey)) };
}

test('A new learner cannot perform any trick from the menu, shop or lesson feedback', async () => {
  const { window, horse } = startApp();
  const moves = window.WilawanMoves;
  assert.equal(horse.dataset.motion, 'idle');
  for (const { id, costGems } of moves.catalog) {
    assert.ok(costGems > moves.balance());
    assert.equal(moves.owns(id), false);
    assert.equal(moves.play(id), false);
    assert.equal(window.DalaStage.play(id), false);
    assert.equal(window.VisualEngine.Mascot.triggerAction(id), false);
    window.DalaMotion.play(horse, id);
    assert.equal(horse.dataset.motion, 'idle');
    assert.equal((await moves.purchase(id)).reason, 'insufficient-gems');
  }
  for (const mood of ['celebrating', 'encouraging', 'streak_fire']) {
    window.VisualEngine.Mascot.setState(mood);
    assert.equal(horse.dataset.motion, 'idle');
  }
});

test('Existing purchases survive the new prices, and only the catalogue price can unlock a new move', async () => {
  const { window, horse, saved } = startApp({ gems: 1000, ownedDalaMoves: ['jump'] });
  const moves = window.WilawanMoves;
  const price = moves.catalog.find(move => move.id === 'wave').costGems;
  assert.equal(horse.dataset.motion, 'jump');
  assert.equal(moves.owns('wave'), false);
  assert.equal((await moves.purchase('jump')).reason, 'already-owned');
  const wallet = window.GameEngine.StateManager;
  assert.equal((await wallet.purchaseDalaMove('unknown', 1)).ok, false);
  assert.equal((await wallet.purchaseDalaMove('wave', 1)).reason, 'purchased');
  assert.equal((await moves.purchase('wave')).reason, 'already-owned');
  assert.equal(moves.balance(), 1000 - price);
  const restored = startApp(saved()).window.WilawanMoves;
  assert.equal(restored.owns('wave'), true);
  assert.equal(restored.owns('jump'), true);
  assert.equal(restored.owns('rear'), false);
  assert.equal(restored.balance(), 1000 - price);
});

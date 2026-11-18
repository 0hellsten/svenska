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
    querySelectorAll: () => [],
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

test('Every wardrobe item ships its own WebP and is available in the offline iPhone file', () => {
  const { window } = startApp();
  const items = window.GameEngine.MASCOT_ACCESSORIES;
  const hosted = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const offline = fs.readFileSync(path.join(__dirname, 'svenska_satun_iphone.html'), 'utf8');
  assert.equal(new Set(items.map(item => item.src)).size, items.length);
  for (const item of items) {
    const image = fs.readFileSync(path.join(__dirname, item.src));
    assert.equal(image.toString('ascii', 8, 12), 'WEBP', item.id);
    const embedded = 'data:image/webp;base64,' + image.toString('base64');
    assert.ok(hosted.includes(item.src) || hosted.includes(embedded), item.id + ' missing from Pages');
    assert.ok(offline.includes(embedded), item.id + ' missing from iPhone file');
    assert.ok(!offline.includes(item.src), item.id + ' still refers to an external file');
  }
});

test('Study aids are one-time wallet purchases and never buy learning progress', async () => {
  const { window, saved } = startApp({ gems: 80, totalXP: 14, ownedDalaMoves: ['jump'] });
  const wallet = window.GameEngine.StateManager;
  const initialReviews = JSON.stringify(wallet.state.srsData);
  const [cards, spelling] = window.GameEngine.practiceAids;
  assert.equal((await wallet.purchasePracticeAid('jump')).ok, false);
  assert.equal((await wallet.purchaseDalaMove(cards.id)).ok, false);
  assert.equal((await wallet.purchasePracticeAid(cards.id)).reason, 'purchased');
  assert.equal((await wallet.purchasePracticeAid(cards.id)).reason, 'already-owned');
  assert.equal(wallet.state.gems, 80 - cards.costGems);
  const write = window.localStorage.setItem;
  window.localStorage.setItem = () => { throw Error('full storage'); };
  assert.equal((await wallet.purchasePracticeAid(spelling.id)).reason, 'storage-error');
  assert.equal(wallet.state.gems, 80 - cards.costGems);
  assert.equal(wallet.state.ownedPracticeAids.includes(spelling.id), false);
  window.localStorage.setItem = write;
  assert.equal((await wallet.purchasePracticeAid(spelling.id)).reason, 'purchased');
  const restored = startApp(saved()).window.GameEngine.StateManager;
  assert.equal(restored.state.gems, 80 - cards.costGems - spelling.costGems);
  assert.deepEqual(Array.from(restored.state.ownedPracticeAids), [cards.id, spelling.id]);
  assert.equal(restored.state.totalXP, 14);
  assert.equal(JSON.stringify(restored.state.srsData), initialReviews);
  assert.equal((await startApp({ gems: 0 }).window.GameEngine.StateManager.purchasePracticeAid(cards.id)).reason, 'insufficient-gems');
});

test('Wardrobe saves migrate a worn item and retain an explicitly empty or multi-item outfit', () => {
  const { window } = startApp();
  const wardrobe = window.GameEngine.Part5State;
  const key = 'wilawan_svenska_part5_gamification_v2';
  wardrobe.applyColorTheme = () => {};
  wardrobe.startDailyTrainingClock = () => {};
  const saved = { ownedAccessories: ['midsommar', 'solglasogon'], equippedAccessory: 'midsommar' };
  for (const [fields, expected] of [
    [{}, ['midsommar']],
    [{ equippedAccessories: [] }, []],
    [{ equippedAccessories: ['midsommar', 'solglasogon', 'midsommar', 'snorkel', 'unknown'] }, ['midsommar', 'solglasogon']]
  ]) {
    window.localStorage.setItem(key, JSON.stringify({ ...saved, ...fields }));
    wardrobe.load();
    wardrobe.save();
    wardrobe.load();
    assert.deepEqual(Array.from(wardrobe.data.equippedAccessories).sort(), expected);
    assert.deepEqual(JSON.parse(window.localStorage.getItem(key)).equippedAccessories.sort(), expected);
  }
});

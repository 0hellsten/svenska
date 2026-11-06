'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('./zoo_core.js');
const observeRoom = (state, index) => {
  for (const id of C.rooms[index].animals) assert.equal(C.identify(state, id, C.byId[id].sv), 'found');
};

test('Twelve distinct animals have Swedish vocabulary, coherent clues, and playable positions', () => {
  assert.equal(C.animals.length, 12);
  assert.equal(new Set(C.animals.map(a => a.id)).size, 12);
  for (const room of C.rooms) assert.equal(room.animals.length, 4);
  const state = C.create();
  for (const room of C.rooms) assert.deepEqual(state.trackOrder[room.id].slice().sort(), room.animals.slice().sort());
  for (const animal of C.animals) {
    assert.ok(animal.x > animal.w / 2 && animal.x < 1200 - animal.w / 2);
    assert.ok(animal.y > animal.h / 2 && animal.y < 800 - animal.h / 2);
    assert.equal(animal.choices.filter(choice => choice === animal.sv).length, 1);
    assert.equal(animal.hints.length, 3);
    assert.ok(animal.th && animal.sentence && animal.note && animal.position);
  }
});

test('A full evening requires all twelve observations and three different puzzle solutions', () => {
  const state = C.create();
  assert.equal(C.solve(state, 0, C.code(state)), 'missing');
  assert.equal(C.go(state, 1), false);
  assert.equal(C.identify(state, 'otter', 'en utter'), 'locked');
  observeRoom(state, 0);
  assert.equal(C.solve(state, 0, C.code(state)), 'solved');
  assert.equal(C.go(state, 1), true);
  assert.equal(C.go(state, 2), false);
  observeRoom(state, 1);
  assert.equal(C.solve(state, 1, ['fill', 'open', 'raise', 'light']), 'solved');
  assert.equal(C.go(state, 2), true);
  observeRoom(state, 2);
  assert.equal(C.solve(state, 2, C.phrase.slice()), 'solved');
  assert.equal(state.status, 'escaped');
  assert.equal(state.found.length, 12);
  assert.deepEqual(state.solved, ['forest', 'wetland', 'greenhouse']);
});

test('Incorrect names, duplicate observations, and unknown animal IDs never grant clues', () => {
  const state = C.create();
  assert.equal(C.identify(state, 'owl', 'en häger'), 'retry');
  assert.equal(state.found.length, 0);
  assert.equal(C.identify(state, 'owl', 'en uggla'), 'found');
  assert.equal(C.identify(state, 'owl', 'en uggla'), 'already');
  assert.equal(state.found.length, 1);
  assert.equal(C.identify(state, '__proto__', 'something'), 'locked');
  assert.equal(state.mistakes, 1);
});

test('Every generated brass code is unambiguous, with no repeated digits', () => {
  const combinations = new Set();
  for (let i = 0; i < 80; i++) {
    const value = C.code(C.create());
    assert.match(value, /^[2-9]{4}$/);
    assert.equal(new Set(value).size, 4);
    combinations.add(value);
  }
  assert.ok(combinations.size > 50);
});

test('Hints escalate to three steps without finding the animal or bypassing locks', () => {
  const state = C.create();
  const owl = C.byId.owl;
  assert.equal(C.hint(state, 'owl'), owl.hints[0]);
  assert.equal(C.hint(state, 'owl'), owl.hints[1]);
  assert.equal(C.hint(state, 'owl'), owl.hints[2]);
  assert.equal(C.hint(state, 'owl'), owl.hints[2]);
  assert.equal(state.hints.owl, 3);
  assert.equal(state.found.length, 0);
  assert.equal(C.hint(state, 'snake'), null);
  C.identify(state, 'owl', owl.sv);
  assert.equal(C.hint(state, 'owl'), null);
});

test('Wrong lock answers preserve the room and allow a correct retry', () => {
  const state = C.create(); observeRoom(state, 0);
  assert.equal(C.solve(state, 0, '0000'), 'retry');
  assert.equal(state.solved.length, 0);
  assert.equal(C.solve(state, 0, C.code(state)), 'solved');
  observeRoom(state, 1);
  assert.equal(C.solve(state, 1, ['open', 'fill', 'raise', 'light']), 'retry');
  assert.equal(C.solve(state, 1, ['fill', 'open', 'raise', 'light']), 'solved');
  observeRoom(state, 2);
  assert.equal(C.solve(state, 2, ['När', 'lyktan', 'lyser', 'vi', 'kan', 'öppna', 'grinden']), 'retry');
  assert.equal(C.solve(state, 2, C.phrase), 'solved');
});

test('Completed locks cannot be collected twice, and unknown travel destinations are rejected', () => {
  const state = C.create(); observeRoom(state, 0);
  C.solve(state, 0, C.code(state));
  assert.equal(C.solve(state, 0, C.code(state)), 'already');
  assert.equal(state.solved.length, 1);
  for (const index of [-1, 3, NaN, 1.5, '1']) assert.equal(C.go(state, index), false);
  assert.equal(C.solve(state, 8, []), 'locked');
});

test('A mid-game save restores observations, randomized code, notes, and in-progress answers', () => {
  const state = C.create(); observeRoom(state, 0); C.solve(state, 0, C.code(state)); C.go(state, 1);
  C.identify(state, 'beaver', 'en bäver'); C.hint(state, 'otter');
  state.locks.wetland = ['fill', 'open']; state.hard = false;
  const restored = C.restore(JSON.stringify(state));
  assert.deepEqual(restored, state);
  assert.equal(C.identify(restored, 'beaver', 'en bäver'), 'already');
  assert.equal(C.code(restored), C.code(state));
});

test('Corrupt storage is rejected or sanitized without giving access to locked rooms', () => {
  assert.equal(C.restore('invalid json'), null);
  assert.equal(C.restore({ version: 999 }), null);
  const state = C.create(); state.marks.owl = '9'; assert.equal(C.restore(state), null);
  const damaged = C.create();
  damaged.found = ['owl', 'owl', 'snake', '__proto__'];
  damaged.solved = ['forest', 'wetland']; damaged.room = 99;
  damaged.locks.wetland = ['fill', 'fill']; damaged.hints = { owl: 99 }; damaged.lamp = true;
  const restored = C.restore(damaged);
  assert.deepEqual(restored.found, ['owl']); assert.deepEqual(restored.solved, []);
  assert.equal(restored.room, 0); assert.equal(restored.lamp, false);
  assert.deepEqual(restored.locks.wetland, []); assert.deepEqual(restored.hints, {});
});

test('Both transferable app files contain the complete game and embedded artwork', () => {
  const fs = require('node:fs'); const vm = require('node:vm');
  for (const filename of ['index.html', 'svenska_satun_iphone.html']) {
    const html = fs.readFileSync(filename, 'utf8');
    assert.ok(html.includes('window.ZooEscape ='));
    assert.ok(html.includes('window.ZooArt ='));
    assert.ok(!/src="zoo_|href="zoo_escape.css"/.test(html));
    assert.ok(!html.includes('assets/zoo/'));
    assert.equal((html.match(/data:image\/webp;base64,/g) || []).length, 4);
    for (const match of html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1], { filename });
  }
});

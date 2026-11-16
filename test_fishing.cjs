'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const F = require('./farm_fishing_core.js');
const Farm = require('./farm_core.js');

test('An upward finger cast controls range and landing without leaving the lake', () => {
  const short = F.cast({x:.5,y:.84},{x:.53,y:.69});
  const long = F.cast({x:.5,y:.84},{x:.75,y:.2});
  assert.equal(short.valid,true);
  assert.ok(long.distance > short.distance);
  assert.ok(long.y < short.y);
  assert.ok(long.x >= .12 && long.x <= .88);
  assert.equal(F.cast({x:.5,y:.4},{x:.5,y:.7}).valid,false);
  assert.equal(F.cast({x:NaN,y:0},{x:0,y:0}).valid,false);
});

test('Reeling follows either direction over the angle seam and the whole album is attainable', () => {
  assert.ok(Math.abs(F.angleDelta(3.1,-3.1)) < .1);
  assert.ok(F.angleDelta(3.1,-3.1) > 0);
  const state = F.restore();
  for (let i=0;i<F.fish.length;i++) {
    const id = F.chooseFish(state,'shrimp',{distance:.5},() => 0);
    assert.equal(state.album[id],undefined);
    assert.equal(F.startCatch(state,id),true);
    assert.equal(F.answerCatch(state,id,'2026-11-16').correct,true);
    F.finishSpeech(state);
  }
  assert.equal(Object.keys(state.album).length,8);
  assert.ok(F.baits.some(item => item.id === 'shrimp' && item.th === 'กุ้งแห้ง'));
});

test('Every fish can be landed by reeling steadily and resting through its warning and surge', () => {
  for (const item of F.fish) {
    const fight = F.createFight(item.id,.8);
    let warningSeen = false;
    for (let i=0;i<9000 && fight.phase === 'fight';i++) {
      const reel = !fight.warning && !fight.surge && fight.tension < .58;
      F.tickFight(fight,reel ? .018 : 0,.03);
      warningSeen ||= fight.warning;
    }
    assert.equal(fight.phase,'caught',item.id);
    assert.equal(warningSeen,true);
  }
});

test('Forcing the reel can break the line, while resting relieves strain and a new attempt starts cleanly', () => {
  const fight = F.createFight('gadda',1);
  for (let i=0;i<1000 && fight.phase === 'fight';i++) F.tickFight(fight,.08,.04);
  assert.equal(fight.phase,'broken');
  const retry = F.createFight('gadda',1);
  retry.tension = .98;
  retry.stress = .5;
  for (let i=0;i<80;i++) F.tickFight(retry,0,.04);
  assert.equal(retry.phase,'fight');
  assert.ok(retry.tension < .35);
  assert.equal(retry.stress,0);
  const before = retry.time;
  F.tickFight(retry,0,30);
  assert.ok(retry.time-before <= .080001,'Background delays do not instantly break a line');
});

test('A pending fish survives reload and requires the correct word before album or rewards change', () => {
  const state = F.restore();
  assert.equal(F.startCatch(state,'abborre'),true);
  assert.equal(F.startCatch(state,'gadda'),false);
  const resumed = F.restore(JSON.parse(JSON.stringify(state)));
  assert.equal(resumed.pending,'abborre');
  assert.equal(F.answerCatch(resumed,'gadda','2026-11-16').correct,false);
  assert.equal(resumed.totalCatch,0);
  assert.deepEqual(resumed.album,{});
  assert.equal(F.answerCatch(resumed,'abborre','2026-11-16').newFish,true);
  assert.equal(resumed.album.abborre,1);
  assert.equal(F.answerCatch(resumed,'abborre','2026-11-16').correct,false);
});

test('Fishing pays three XP after three confirmed catches once per day and resists duplicate answers', () => {
  let state = F.restore();
  let xp = 0;
  for (let i=0;i<8;i++) {
    F.startCatch(state,'abborre');
    xp += F.answerCatch(state,'abborre','2026-11-16').xp;
    F.finishSpeech(state);
    state = F.restore(state);
    xp += F.answerCatch(state,'abborre','2026-11-16').xp;
  }
  assert.equal(xp,3);
  for (let i=0;i<3;i++) {
    F.startCatch(state,'mort');
    xp += F.answerCatch(state,'mort','2026-11-17').xp;
    F.finishSpeech(state);
  }
  assert.equal(xp,6);
  assert.equal(state.album.mort,3);
});

test('The third catch requires its spoken checkpoint even after reloading the page', () => {
  let state = F.restore();
  for (let i=0;i<3;i++) {
    assert.equal(F.startCatch(state,'abborre'),true);
    assert.equal(F.answerCatch(state,'abborre','2026-11-16').correct,true);
  }
  state = F.restore(JSON.parse(JSON.stringify(state)));
  assert.equal(state.pendingSpeech,'abborre');
  assert.equal(state.pending,null);
  assert.equal(F.startCatch(state,'mort'),false);
  assert.equal(F.finishSpeech(state),true);
  assert.equal(F.finishSpeech(state),false);
  assert.equal(F.startCatch(state,'mort'),true);
  assert.equal(F.restore({version:1,album:{abborre:3},totalCatch:3}).pendingSpeech,null,'Old saves stay usable');
});

test('Corrupt saved values cannot introduce unknown fish or carry inflated daily rewards', () => {
  const state = F.restore({version:1,album:{abborre:2,gadda:-1,unknown:999},totalCatch:-1,pending:'unknown',bait:'unknown',dayCount:999,bonusDay:'bad'});
  assert.deepEqual(state.album,{abborre:2});
  assert.equal(state.totalCatch,2);
  assert.equal(state.pending,null);
  assert.equal(state.bait,'shrimp');
  assert.equal(state.dayCount,3);
  assert.equal(state.bonusDay,'');
});

test('The farm keeps the fishing album and pending word after closing and an old farm gains a pier', () => {
  const farm=Farm.restore({ version:1,chapter:1,plots:[{id:'carrot',planted:100,ready:200}],coins:8 });
  assert.equal(Farm.canVisit(farm,'pier',Farm.trainingLevel(farm,0,0)),true);
  F.startCatch(farm.fishing,'sarv');
  const resumed=Farm.restore(JSON.parse(JSON.stringify(farm)));
  assert.equal(resumed.fishing.pending,'sarv');
  assert.equal(resumed.plots[0].id,'carrot');
  F.answerCatch(resumed.fishing,'sarv','2026-11-16');
  assert.equal(Farm.restore(resumed).fishing.album.sarv,1);
  assert.equal(resumed.coins,8);
});

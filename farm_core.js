/* Björkbacken. Save format, farm simulation and story orders. */
(function (root) {
  'use strict';
  const crops = {
    carrot: { sv:'en morot', plural:'morötter', th:'แครอต', seconds:14, chapter:0, yield:3 },
    potato: { sv:'en potatis', plural:'potatisar', th:'มันฝรั่ง', seconds:19, chapter:1, yield:3 },
    wheat: { sv:'vete', plural:'vete', th:'ข้าวสาลี', seconds:23, chapter:2, yield:3 },
    berry: { sv:'en jordgubbe', plural:'jordgubbar', th:'สตรอว์เบอร์รี', seconds:27, chapter:4, yield:3 },
    pumpkin: { sv:'en pumpa', plural:'pumpor', th:'ฟักทอง', seconds:33, chapter:6, yield:2 }
  };
  const animals = {
    hen: { sv:'en höna', definite:'hönan', th:'แม่ไก่', zone:'barn', good:'egg', chapter:0, seconds:18 },
    cow: { sv:'en ko', definite:'kon', th:'วัว', zone:'barn', good:'milk', chapter:3, seconds:26 },
    duck: { sv:'en anka', definite:'ankan', th:'เป็ด', zone:'pond', good:'duckegg', chapter:0, seconds:23 },
    pig: { sv:'en gris', definite:'grisen', th:'หมู', zone:'pigs', good:'truffle', chapter:0, seconds:29 },
    sheep: { sv:'ett får', definite:'fåret', th:'แกะ', zone:'barn', good:'wool', chapter:5, seconds:25 },
    horse: { sv:'en häst', definite:'hästen', th:'ม้า', zone:'paddock', good:null, chapter:0, seconds:0 }
  };
  const goods = { ...crops,
    egg:{ sv:'ett ägg', plural:'ägg', th:'ไข่ไก่' }, milk:{ sv:'en flaska mjölk', plural:'flaskor mjölk', th:'นมสด' },
    duckegg:{ sv:'ett ankägg', plural:'ankägg', th:'ไข่เป็ด' }, truffle:{ sv:'en tryffel', plural:'tryfflar', th:'เห็ดทรัฟเฟิล' },
    wool:{ sv:'ett nystan ull', plural:'nystan ull', th:'ไหมพรมขนแกะ' }, flour:{ sv:'en påse mjöl', plural:'påsar mjöl', th:'แป้งสาลี' },
    bread:{ sv:'ett bröd', plural:'bröd', th:'ขนมปัง' }, jam:{ sv:'en burk sylt', plural:'burkar sylt', th:'แยม' },
    butter:{ sv:'ett paket smör', plural:'paket smör', th:'เนย' }
  };
  const recipes = {
    flour: { chapter:2, sv:'Mal vetet till mjöl.', th:'โม่ข้าวสาลีให้เป็นแป้ง', uses:{ wheat:2 } },
    bread: { chapter:2, sv:'Baka ett bröd.', th:'อบขนมปัง', uses:{ flour:1 } },
    butter: { chapter:3, sv:'Kärna smör.', th:'ปั่นนมให้เป็นเนย', uses:{ milk:2 } },
    jam: { chapter:4, sv:'Koka jordgubbssylt.', th:'กวนแยมสตรอว์เบอร์รี', uses:{ berry:2 } }
  };
  const chapters = [
    { id:'first', title:'แปลงแรกของเรา', letter:'มายามาช่วยเปิดรั้วสวนเบิร์ช เธอขอแครอตสองหัวไปทำซุป ลองเพาะ รดน้ำ แล้วเก็บลงตะกร้า', guest:0, order:{carrot:2}, coins:8, xp:10, reply:'choice' },
    { id:'breakfast', title:'มื้อเช้าที่โรงนา', letter:'โนอาห์จะทำมื้อเช้าให้คนงาน ลองให้อาหารแม่ไก่ที่โรงนาแล้วกลับมาเก็บไข่', guest:1, order:{potato:2,egg:1}, coins:10, xp:12, reply:'build' },
    { id:'mill', title:'กลิ่นขนมปังจากโรงช่าง', letter:'ลีฟเปิดเตาอบแล้ว โม่ข้าวสาลีเป็นแป้งที่โรงช่างก่อนนำไปอบขนมปัง ลองบอกลีฟว่าเรามีอะไรให้เธอ', guest:2, order:{bread:1,carrot:1}, coins:12, xp:12, reply:'voice' },
    { id:'dairy', title:'นมสดของมายา', letter:'วัวมาอยู่ที่โรงนาแล้ว มายาอยากได้ทั้งนมสดและเนย นมสองขวดทำเนยได้หนึ่งห่อ', guest:0, order:{milk:1,butter:1}, coins:14, xp:14, reply:'build' },
    { id:'pond', title:'ริมน้ำกับแยมขวดแรก', letter:'ไข่เป็ดกับแยมจะเอาไปทำขนมที่ตลาด เลือกทางไปสระเป็ดจากแผนที่ได้เลย', guest:1, order:{duckegg:1,jam:1}, coins:16, xp:14, reply:'voice' },
    { id:'pasture', title:'หมูกับแกะเพื่อนใหม่', letter:'หมูชอบขุดหาเห็ดทรัฟเฟิลในคอก ส่วนแกะอยู่ที่โรงนา ให้อาหารแล้วกลับมารับของเมื่อพร้อม', guest:2, order:{truffle:1,wool:2}, coins:18, xp:16, reply:'choice' },
    { id:'autumn', title:'ฟักทองรับใบไม้ร่วง', letter:'อากาศเย็นลงแล้ว โนอาห์จะต้มซุปฟักทองสำหรับตลาด ใส่มันฝรั่งและขนมปังไปด้วย', guest:1, order:{pumpkin:2,potato:1,bread:1}, coins:20, xp:16, reply:'build' },
    { id:'festival', title:'งานฉลองเก็บเกี่ยว', letter:'ทั้งหมู่บ้านจะมากินข้าวด้วยกันที่สวนเบิร์ช วางแผนใช้แปลง โรงนา และโรงช่างให้ทันตะกร้าสุดท้าย', guest:0, order:{pumpkin:2,bread:2,milk:2,jam:1}, coins:26, xp:20, reply:'voice' }
  ];
  const repeatOrders = [
    { guest:2, order:{egg:2,bread:1}, coins:4, reply:'build' },
    { guest:0, order:{milk:2,jam:1}, coins:5, reply:'choice' },
    { guest:1, order:{potato:2,truffle:1,duckegg:1}, coins:5, reply:'voice' },
    { guest:2, order:{pumpkin:2,wool:1}, coins:5, reply:'build' }
  ];
  const decorations = { flowers:{ th:'กระบะดอกไม้', sv:'en blomlåda', cost:7 }, lantern:{ th:'โคมไฟสวน', sv:'en lykta', cost:10 }, bench:{ th:'ม้านั่งไม้', sv:'en bänk', cost:14 } };
  const foalNames = ['Björk', 'Sol', 'Lilla Moln'];
  const weather = [
    { id:'sun', icon:'☀', sv:'soligt', th:'แดดออก' }, { id:'cloud', icon:'☁', sv:'molnigt', th:'มีเมฆ' },
    { id:'rain', icon:'☂', sv:'regnigt', th:'ฝนตก' }, { id:'sun', icon:'☀', sv:'soligt', th:'แดดออก' }
  ];
  const events = {
    flag: { zone:'yard', th:'เชือกเสาธงขาด', sv:'Flagglinan har gått av.', steps:3 },
    fence: { zone:'pigs', th:'รั้วคอกหมูหลุด', sv:'Staketet behöver lagas.', steps:3 },
    eggs: { zone:'pond', th:'ไข่เป็ดซ่อนอยู่', sv:'Var ligger äggen?', steps:3 },
    foal: { zone:'paddock', th:'ลูกม้าเกิดแล้ว!', sv:'Stoet har fått ett föl!', steps:3 }
  };
  const WAIT_AWAY = 2 * 60 * 1000;
  const MAX_STOCK = 99;
  const int = (value, limit, fallback = 0) => Number.isInteger(value) && value >= 0 ? Math.min(limit, value) : fallback;
  const nowInt = value => Number.isFinite(value) && value >= 0 ? value : 0;
  const known = (catalogue, key) => typeof key === 'string' && Object.hasOwn(catalogue, key);
  const counters = (value, keys, max = MAX_STOCK) => Object.fromEntries(Object.keys(keys).map(id => [id, int(value?.[id], max)]));

  function restore(raw) {
    const source = raw?.version === 1 ? raw : {};
    const chapter = int(source.chapter, chapters.length), plotCount = Math.min(chapter >= 5 ? 8 : chapter >= 2 ? 6 : 4, int(source.plotCount, 8, 4));
    const available = Math.min(chapter, chapters.length - 1);
    const plots = Array.from({ length:Math.max(4, plotCount) }, (_, i) => {
      const plot = Array.isArray(source.plots) && source.plots[i];
      return known(crops, plot?.id) && crops[plot.id].chapter <= available ? { id:plot.id, planted:nowInt(plot.planted), ready:nowInt(plot.ready) } : null;
    });
    const stock = counters(source.stock, goods);
    const basket = counters(source.basket, goods);
    for (const id of Object.keys(basket)) basket[id] = Math.min(basket[id], stock[id]);
    const visits = int(source.visits, 3);
    const seen = Array.isArray(source.seen) ? [...new Set(source.seen.filter(id => known(events, id)))] : [];
    const event = known(events, source.event?.id) ? { id:source.event.id, step:int(source.event.step, 2) } : null;
    const foal = foalNames.includes(source.foal) ? source.foal : '';
    return { version:1, chapter, plots, stock, basket, animals:counters(source.animals, animals, Number.MAX_SAFE_INTEGER),
      coins:int(source.coins, 999, 0), day:Math.max(1, int(source.day, 999999, 1)), orderIndex:int(source.orderIndex, Number.MAX_SAFE_INTEGER),
      decor:Object.keys(decorations).filter(id => Array.isArray(source.decor) && source.decor.includes(id)),
      activity:nowInt(source.activity), checkedActivity:nowInt(source.checkedActivity), leftAt:nowInt(source.leftAt), visits, seen, event, foal };
  }

  function mark(state, now) { state.activity = Math.max(now, state.activity + 1); }
  function addStock(state, id, count) { state.stock[id] = Math.min(MAX_STOCK, state.stock[id] + count); }
  function plotStatus(plot, now) { return !plot ? 'empty' : !plot.ready ? 'dry' : now >= plot.ready ? 'ripe' : 'growing'; }
  function tend(state, index, tool, seed, now) {
    if (!Number.isInteger(index) || index < 0 || index >= state.plots.length) return 'locked';
    const plot = state.plots[index];
    const phase = plotStatus(plot, now);
    if (tool === 'seed' && phase === 'empty' && known(crops, seed) && crops[seed].chapter <= state.chapter) {
      state.plots[index] = { id:seed, planted:now, ready:0 };
      mark(state, now); return 'planted';
    }
    if (tool === 'water' && phase === 'dry') {
      plot.ready = now + crops[plot.id].seconds * 1000;
      mark(state, now); return 'watered';
    }
    if (tool === 'harvest' && phase === 'ripe') {
      addStock(state, plot.id, crops[plot.id].yield);
      state.plots[index] = null;
      mark(state, now); return 'harvested';
    }
    return phase;
  }
  function animalStatus(state, id, now) {
    const animal = animals[id];
    if (!known(animals, id) || state.chapter < animal.chapter) return 'locked';
    const at = state.animals[id];
    if (!animal.good) return 'greet';
    return !at ? 'feed' : now >= at ? 'collect' : 'rest';
  }
  function tendAnimal(state, id, now) {
    const status = animalStatus(state, id, now);
    if (status === 'feed') { state.animals[id] = now + animals[id].seconds * 1000; mark(state, now); }
    if (status === 'collect') { addStock(state, animals[id].good, 1); state.animals[id] = 0; mark(state, now); }
    return status;
  }
  function canRest(state, now) {
    return state.plots.some(plot => plot?.ready > now) || Object.values(state.animals).some(at => at > now);
  }
  function nextDay(state, now) {
    if (!canRest(state, now)) return false;
    state.day++;
    for (const plot of state.plots) {
      if (plot?.ready > now) plot.ready = now;
      else if (plot && !plot.ready && sky(state).id === 'rain') plot.ready = now + crops[plot.id].seconds * 1000;
    }
    for (const id of Object.keys(state.animals)) if (state.animals[id] > now) state.animals[id] = now;
    mark(state, now);
    return true;
  }
  function sky(state) { return weather[(state.day - 1) % weather.length]; }
  function hasStock(state, wants) { return Object.entries(wants).every(([id, qty]) => state.stock[id] >= qty); }
  function craft(state, id, now) {
    const recipe = recipes[id];
    if (!known(recipes, id) || state.chapter < recipe.chapter || !hasStock(state, recipe.uses) || state.stock[id] >= MAX_STOCK) return false;
    // Keep the basket backed by stock even if she crafts with something packed.
    for (const [material, qty] of Object.entries(recipe.uses)) {
      state.stock[material] -= qty;
      state.basket[material] = Math.min(state.basket[material], state.stock[material]);
    }
    addStock(state, id, 1);
    mark(state, now);
    return true;
  }
  function order(state) { return chapters[state.chapter] || repeatOrders[state.orderIndex % repeatOrders.length]; }
  function adjustBasket(state, id, delta) {
    if (!known(goods, id) || ![1,-1].includes(delta)) return false;
    const count = state.basket[id] + delta;
    if (count < 0 || count > Math.min(9, state.stock[id])) return false;
    state.basket[id] = count;
    return true;
  }
  function checkBasket(state) {
    const wants = order(state).order;
    const missing = Object.keys(wants).filter(id => state.basket[id] < wants[id]);
    const extra = Object.keys(goods).filter(id => state.basket[id] > (wants[id] || 0));
    return { missing, extra, ok:!missing.length && !extra.length && hasStock(state, wants) };
  }
  function deliver(state, now) {
    if (!checkBasket(state).ok) return null;
    const request = order(state);
    for (const [id, qty] of Object.entries(request.order)) state.stock[id] -= qty;
    state.basket = counters(null, goods);
    state.coins = Math.min(999, state.coins + request.coins);
    if (request.id) state.chapter++;
    else state.orderIndex++;
    mark(state, now);
    return request;
  }
  function expand(state) {
    const limit = state.chapter >= 5 ? 8 : state.chapter >= 2 ? 6 : 4;
    const price = state.plots.length < 6 ? 6 : 9;
    if (state.plots.length >= limit || state.coins < price) return false;
    state.coins -= price;
    state.plots.push(null);
    return true;
  }
  function decorate(state, id) {
    if (!known(decorations, id) || state.decor.includes(id) || state.coins < decorations[id].cost) return false;
    state.coins -= decorations[id].cost;
    state.decor.push(id);
    return true;
  }
  function leave(state, now) { state.leftAt = now; }
  function returnVisit(state, now, random = Math.random) {
    if (state.event || !state.leftAt || state.activity <= state.checkedActivity || now - state.leftAt < WAIT_AWAY) return false;
    state.checkedActivity = state.activity;
    state.visits++;
    const eligible = ['flag', 'eggs', 'fence', ...(!state.foal ? ['foal'] : [])];
    if (state.visits < 3 && random() >= .55) return false;
    const unseen = eligible.filter(id => !state.seen.includes(id));
    const options = unseen.length ? unseen : eligible;
    state.event = { id:options[Math.floor(random() * options.length)], step:0 };
    state.visits = 0;
    return true;
  }
  function progressEvent(state, id, step, name) {
    if (state.event?.id !== id || state.event.step !== step) return false;
    if (id === 'foal' && step === 2 && !foalNames.includes(name)) return false;
    if (step < events[id].steps - 1) { state.event.step++; return 'next'; }
    if (id === 'foal') state.foal = name;
    if (!state.seen.includes(id)) state.seen.push(id);
    state.event = null;
    state.coins = Math.min(999, state.coins + 3);
    return 'finished';
  }

  const api = { crops, animals, goods, recipes, chapters, decorations, events, foalNames, WAIT_AWAY,
    restore, tend, plotStatus, animalStatus, tendAnimal, canRest, nextDay, sky, craft, hasStock,
    order, adjustBasket, checkBasket, deliver, expand, decorate, leave, returnVisit, progressEvent };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FarmCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

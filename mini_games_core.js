/* Shared, deterministic rules. No browser, audio, or storage dependencies. */
(function (root) {
  'use strict';

  const ingredients = [
    ['flour', 'mjöl', 'mjölet', 'แป้งสาลี'],
    ['sugar', 'socker', 'sockret', 'น้ำตาล'],
    ['egg', 'ett ägg', 'ägget', 'ไข่'],
    ['butter', 'smör', 'smöret', 'เนย'],
    ['milk', 'mjölk', 'mjölken', 'นม'],
    ['bakingpowder', 'bakpulver', 'bakpulvret', 'ผงฟู'],
    ['vanilla', 'vaniljsocker', 'vaniljsockret', 'น้ำตาลวานิลลา'],
    ['chocolate', 'choklad', 'chokladen', 'ช็อกโกแลต'],
    ['cocoa', 'kakao', 'kakaon', 'ผงโกโก้'],
    ['strawberry', 'en jordgubbe', 'jordgubben', 'สตรอว์เบอร์รี'],
    ['cream', 'grädde', 'grädden', 'ครีม'],
    ['salt', 'salt', 'saltet', 'เกลือ'],
    ['honey', 'honung', 'honungen', 'น้ำผึ้ง'],
    ['lemon', 'en citron', 'citronen', 'มะนาวเหลือง'],
    ['blueberry', 'blåbär', 'blåbären', 'บลูเบอร์รี'],
    ['raspberry', 'hallon', 'hallonen', 'ราสป์เบอร์รี'],
    ['banana', 'en banan', 'bananen', 'กล้วย'],
    ['apple', 'ett äpple', 'äpplet', 'แอปเปิล'],
    ['carrot', 'en morot', 'moroten', 'แคร์รอต'],
    ['fish', 'en fisk', 'fisken', 'ปลา'],
    ['onion', 'en lök', 'löken', 'หัวหอม'],
    ['tomato', 'en tomat', 'tomaten', 'มะเขือเทศ'],
    ['cheese', 'ost', 'osten', 'ชีส'],
    ['pepper', 'peppar', 'pepparn', 'พริกไทย'],
    ['rice', 'ris', 'riset', 'ข้าวสาร'],
    ['water', 'vatten', 'vattnet', 'น้ำ'],
    ['coffee', 'kaffe', 'kaffet', 'กาแฟ'],
    ['cinnamon', 'kanel', 'kanelen', 'อบเชย'],
    ['yeast', 'jäst', 'jästen', 'ยีสต์']
  ].map(([id, sv, definite, th]) => ({ id, sv, definite, th }));
  const byId = Object.fromEntries(ingredients.map(item => [item.id, item]));
  const recipes = {
    cake: { id: 'cake', name: 'Födelsedagstårta', th: 'เค้กวันเกิด',
      steps: ['butter', 'sugar', 'egg', 'flour', 'bakingpowder', 'vanilla', 'milk'],
      decorations: ['cream', 'strawberry'] },
    cookies: { id: 'cookies', name: 'Fazer Blå-kakor', th: 'คุกกี้ช็อกโกแลต',
      steps: ['butter', 'sugar', 'egg', 'flour', 'bakingpowder', 'salt', 'chocolate'],
      decorations: [] }
  };
  Object.assign(recipes, {
    buns: { name: 'Kanelbullar', th: 'ขนมปังอบเชย', art: 'bun', steps: ['milk', 'yeast', 'butter', 'sugar', 'flour', 'salt', 'cinnamon'], decorations: [] },
    lemoncake: { name: 'Citronkaka', th: 'เค้กเลมอน', art: 'slice', steps: ['butter', 'sugar', 'egg', 'flour', 'bakingpowder', 'milk', 'lemon'], decorations: [] },
    banana: { name: 'Banankaka', th: 'เค้กกล้วย', art: 'slice', steps: ['banana', 'butter', 'sugar', 'egg', 'flour', 'bakingpowder', 'cinnamon'], decorations: [] },
    carrotcake: { name: 'Morotskaka', th: 'เค้กแคร์รอต', art: 'slice', steps: ['carrot', 'sugar', 'egg', 'butter', 'flour', 'bakingpowder', 'cinnamon'], decorations: [] },
    blueberry: { name: 'Blåbärspaj', th: 'พายบลูเบอร์รี', art: 'slice', steps: ['blueberry', 'butter', 'sugar', 'flour', 'vanilla', 'lemon'], decorations: [] },
    apple: { name: 'Äppelpaj', th: 'พายแอปเปิล', art: 'slice', steps: ['apple', 'butter', 'sugar', 'flour', 'cinnamon', 'honey'], decorations: [] }
  });
  Object.entries(recipes).forEach(([id, recipe]) => { recipe.id = id; recipe.art ||= id === 'cake' ? 'cake' : 'cookies'; });
  const cafeItems = [
    { id: 'coffee', sv: 'en kopp kaffe', plural: 'koppar kaffe', th: 'กาแฟ', art: 'coffee' },
    { id: 'tea', sv: 'en kopp te', plural: 'koppar te', th: 'ชา', art: 'tea' },
    { id: 'bun', sv: 'en kanelbulle', plural: 'kanelbullar', th: 'ขนมปังอบเชย', art: 'bun' },
    { id: 'cookie', sv: 'en kaka', plural: 'kakor', th: 'คุกกี้', art: 'cookies' },
    { id: 'cake', sv: 'en tårtbit', plural: 'tårtbitar', th: 'เค้กหนึ่งชิ้น', art: 'slice' },
    { id: 'water', sv: 'ett glas vatten', plural: 'glas vatten', th: 'น้ำ', art: 'water' }
  ];
  const memoryItems = [
    { id: 'house', sv: 'ett hus', th: 'บ้าน' },
    { id: 'cat', sv: 'en katt', th: 'แมว' },
    { id: 'flower', sv: 'en blomma', th: 'ดอกไม้' },
    { id: 'sun', sv: 'en sol', th: 'ดวงอาทิตย์' },
    { id: 'coffee', sv: 'en kopp kaffe', th: 'กาแฟหนึ่งถ้วย' },
    { id: 'strawberry', sv: 'en jordgubbe', th: 'สตรอว์เบอร์รี' }
  ];
  const memoryPacks = [
    { id: 'home', th: 'รอบตัวเรา', items: memoryItems },
    ...[['baking', 'เข้าครัวกัน', ['milk', 'egg', 'flour', 'sugar', 'butter', 'salt']],
      ['fruit', 'ผลไม้หลากสี', ['strawberry', 'apple', 'banana', 'lemon', 'blueberry', 'raspberry']],
      ['food', 'ตะกร้าอาหาร', ['carrot', 'onion', 'tomato', 'cheese', 'rice', 'fish']],
      ['fika', 'พักฟีก้ากัน', ['coffee', 'tea', 'bun', 'cookie', 'cake', 'honey']],
      ['pantry', 'ชั้นวัตถุดิบ', ['cocoa', 'cinnamon', 'vanilla', 'bakingpowder', 'yeast', 'chocolate']]
    ].map(([id, th, ids]) => ({ id, th, items: ids.map(key => {
      const item = byId[key] || cafeItems.find(i => i.id === key);
      return { ...item, art: item.art || key };
    }) })),
    { id: 'forest', th: 'เพื่อนในป่าและริมน้ำ', zooIds: ['owl', 'lynx', 'fox', 'hedgehog', 'beaver', 'heron'] },
    { id: 'tropical', th: 'ชีวิตในเรือนกระจก', zooIds: ['frog', 'otter', 'sloth', 'butterfly', 'snake', 'chameleon'] }
  ];
  function memoryWords(packId = 'home', stage = 0, zooAnimals = [], completedPacks) {
    const index = Math.max(0, memoryPacks.findIndex(p => p.id === packId)), pack = memoryPacks[index];
    const getItems = p => p.items || p.zooIds.map(id => ({ ...zooAnimals.find(a => a.id === id), id, zoo: true }));
    const words = getItems(pack).map(i => ({ ...i, art: i.art || i.id }));
    if (stage === 2) {
      const prior = completedPacks ? memoryPacks.filter(p => p.id !== pack.id && completedPacks.includes(p.id)) : [memoryPacks[(index + memoryPacks.length - 1) % memoryPacks.length]];
      const previous = prior.flatMap(getItems);
      words.push(...previous.filter(i => !words.some(w => w.id === i.id)).slice(0, 2).map(i => ({ ...i, art: i.art || i.id })));
    }
    return words;
  }
  const cafeRounds = [
    { th: 'วันแรก · ทักทายลูกค้า', goal: 'ฝึกชื่อเมนูและจำนวนหนึ่งถึงสอง', count: 5, kinds: 1, max: 2 },
    { th: 'วันที่สอง · มาคู่กัน', goal: 'ฟังคำว่า och ที่เชื่อมของสองอย่าง', count: 6, kinds: 2, max: 2 },
    { th: 'วันที่สาม · นับให้ครบ', goal: 'ฝึกจำนวนหนึ่งถึงสาม และรูปพหูพจน์', count: 6, kinds: 2, max: 3 },
    { th: 'วันที่สี่ · โต๊ะใหญ่', goal: 'จำรายการสามอย่างในคำสั่งเดียว', count: 7, kinds: 3, max: 3 },
    { th: 'วันที่ห้า · พูดได้หลายแบบ', goal: 'ฝึก Jag tar และ Kan jag få แทน Jag vill ha', count: 7, kinds: 3, max: 3 },
    { th: 'วันสุดท้าย · ฟังในคาเฟ่', goal: 'ฟังอย่างเดียว ทบทวนเมนู จำนวน และคำสั่งหลายรูปแบบ', count: 8, kinds: 3, max: 4 }
  ];
  function createCafeRound(level = 0, random = Math.random) {
    const round = cafeRounds[level]; if (!round) throw new Error('Unknown café round');
    return Array.from({ length: round.count }, (_, index) => shuffle(cafeItems, random).slice(0, Math.min(round.kinds, index === 0 ? 1 : round.kinds))
      .map((item, n) => ({ id: item.id, count: 1 + (index + n + Math.floor(random() * round.max)) % round.max })));
  }
  function shuffle(items, random = Math.random) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function createKitchen(recipeId) {
    if (!Object.hasOwn(recipes, recipeId)) throw new Error('Unknown recipe');
    return { recipeId, index: 0, phase: 'collect', stirs: 0, mistakes: 0, learned: [] };
  }
  function target(state) {
    const recipe = recipes[state.recipeId];
    return byId[(state.phase === 'decorate' ? recipe.decorations : recipe.steps)[state.index]];
  }
  function addIngredient(state, id) {
    if (!['collect', 'decorate'].includes(state.phase) || !Object.hasOwn(byId, id)) return 'inactive';
    if (target(state)?.id !== id) { state.mistakes++; return 'retry'; }
    state.learned.push(id);
    state.index++;
    const sequence = state.phase === 'decorate' ? recipes[state.recipeId].decorations : recipes[state.recipeId].steps;
    if (state.index === sequence.length) state.phase = state.phase === 'collect' ? 'stir' : 'done';
    return 'correct';
  }
  function stir(state) {
    if (state.phase !== 'stir') return false;
    state.stirs++;
    if (state.stirs >= 5) state.phase = 'ready';
    return true;
  }
  function bake(state) {
    if (state.phase !== 'ready') return false;
    state.phase = 'baking';
    return true;
  }
  function finishBaking(state) {
    if (state.phase !== 'baking') return false;
    state.index = 0;
    state.phase = recipes[state.recipeId].decorations.length ? 'decorate' : 'done';
    return true;
  }
  const numbers = ['noll', 'en', 'två', 'tre', 'fyra'];
  function orderText(order, variant = 0) {
    return ['Jag vill ha ', 'Jag tar ', 'Kan jag få '][variant % 3] + order.map(({ id, count }) => {
      const item = cafeItems.find(entry => entry.id === id);
      return count === 1 ? item.sv : numbers[count] + ' ' + item.plural;
    }).join(' och ') + (variant % 3 === 2 ? ', tack?' : ', tack!');
  }
  function createOrders(random = Math.random) {
    return shuffle(cafeItems, random).slice(0, 5).map((item, index) => {
      const order = [{ id: item.id, count: index < 2 ? 1 : 2 }];
      if (index > 0) {
        const other = shuffle(cafeItems.filter(other => other.id !== item.id), random)[0];
        order.push({ id: other.id, count: index === 4 ? 3 : 1 });
      }
      return order;
    });
  }
  function checkOrder(order, tray) {
    const expected = Object.fromEntries(order.map(item => [item.id, item.count]));
    return cafeItems.every(item => (tray[item.id] || 0) === (expected[item.id] || 0));
  }
  function createMemory(random = Math.random, words = memoryItems) {
    return shuffle(words.flatMap(item => [
      { key: item.id + '-picture', id: item.id, type: 'picture' },
      { key: item.id + '-word', id: item.id, type: 'word' }
    ]), random);
  }
  function isPair(a, b) { return !!a && !!b && a.key !== b.key && a.id === b.id && a.type !== b.type; }

  const api = { ingredients, byId, recipes, cafeItems, memoryItems, memoryPacks, memoryWords, cafeRounds, createCafeRound, shuffle, createKitchen,
    target, addIngredient, stir, bake, finishBaking, orderText, createOrders, checkOrder, createMemory, isPair };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MiniGameCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

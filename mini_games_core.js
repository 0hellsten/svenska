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
  const numbers = ['noll', 'en', 'två', 'tre'];
  function orderText(order) {
    return 'Jag vill ha ' + order.map(({ id, count }) => {
      const item = cafeItems.find(entry => entry.id === id);
      return count === 1 ? item.sv : numbers[count] + ' ' + item.plural;
    }).join(' och ') + ', tack!';
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
  function createMemory(random = Math.random) {
    return shuffle(memoryItems.flatMap(item => [
      { key: item.id + '-picture', id: item.id, type: 'picture' },
      { key: item.id + '-word', id: item.id, type: 'word' }
    ]), random);
  }
  function isPair(a, b) { return !!a && !!b && a.key !== b.key && a.id === b.id && a.type !== b.type; }

  const api = { ingredients, byId, recipes, cafeItems, memoryItems, shuffle, createKitchen,
    target, addIngredient, stir, bake, finishBaking, orderText, createOrders, checkOrder, createMemory, isPair };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MiniGameCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

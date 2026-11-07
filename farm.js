/* The walkable farm, market conversations and mobile workbench. */
(function () {
  'use strict';
  const C = window.FarmCore, A = window.FarmArt, D = window.MiniGameDialogue, P = window.LearningProgress;
  const zones = {
    fields:{ th:'แปลงผัก', sv:'odlingen', x:17,y:28, icon:'🌱', note:'เพาะเมล็ด รดน้ำ แล้วเก็บพืชที่โตเต็มที่' },
    yard:{ th:'ลานบ้าน', sv:'gårdsplanen', x:49,y:25, icon:'⚑', note:'หน้าบ้านมีเสาธง และมุมสำหรับแต่งสวน' },
    barn:{ th:'โรงนา', sv:'ladugården', x:81,y:28, icon:'⌂', note:'แวะให้อาหารแม่ไก่ วัว และแกะ แล้วกลับมาเก็บของ' },
    pigs:{ th:'คอกหมู', sv:'grisarnas hage', x:17,y:52, icon:'🐖', note:'หมูชอบหาอะไรในดิน ลองดูว่ามันเจออะไร' },
    pond:{ th:'สระเป็ด', sv:'ankdammen', x:81,y:53, icon:'🦆', note:'เป็ดว่ายน้ำในสระ แวะให้อาหารแล้วมองหาไข่' },
    paddock:{ th:'ทุ่งม้า', sv:'hästhagen', x:49,y:51, icon:'🐴', note:'แวะมาหาม้าที่ทุ่งกลางฟาร์ม' },
    workshop:{ th:'โรงช่าง', sv:'verkstaden', x:20,y:77, icon:'✦', note:'แปลงผลผลิตให้เป็นของขาย โม่แป้ง อบขนมปัง และกวนแยม' },
    market:{ th:'ตลาด', sv:'marknaden', x:79,y:77, icon:'🧺', note:'ฟังคนในหมู่บ้านแล้วจัดตะกร้าตามที่เขาขอ' }
  };
  const tools = {
    seed:{ th:'เพาะเมล็ด', sv:'Så frön.' }, water:{ th:'รดน้ำ', sv:'Vattna plantan.' }, harvest:{ th:'เก็บเกี่ยว', sv:'Skörda det som är moget.' }
  };
  const plotLabels = { empty:'แปลงว่าง', dry:'ต้องรดน้ำ', growing:'กำลังโต', ripe:'เก็บได้' };
  const numbers = ['','en','två','tre','fyra'];
  const mapImage = 'assets/farm/map.webp', fieldImage = 'assets/farm/fields.webp';
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const glyph = id => `<span class="fb-glyph" aria-hidden="true">${A.symbols[id] || '✦'}</span>`;
  const action = (id, label, value = '', extra = '') => `<button type="button" class="fb-button" data-fb="${id}" data-value="${esc(value)}" ${extra}>${label}</button>`;
  const replay = (line, label = 'ฟังอีกครั้ง') => `<button type="button" class="mg-replay" data-fb="listen" data-value="${esc(line)}">♪ ${label} <small>1×</small></button>`;
  const qty = (id, n) => n === 1 ? C.goods[id].sv : `${numbers[n] || n} ${C.goods[id].plural}`;
  const and = words => words.length > 1 ? `${words.slice(0,-1).join(', ')} och ${words.at(-1)}` : words[0];
  const zoneLabel = (id, event = false) => `${zones[id].icon} ${zones[id].th}${event ? ' <span class="fb-pin-alert">!</span>' : ''}`;
  const eventHere = zone => C.events[state.event?.id]?.zone === zone;
  let dialog, host, state, opener, tick, zone, at, tool, seed, message, tone, shown, dialogActive, walking, swipe, eventInput;

  function save() { window.GameEngine.StateManager.save(); }
  function speak(line) { window.SpeechEngine?.speakSwedish?.(line, 1); }
  function sound(id) { window.SpeechEngine?.playSound?.(id); }
  function status(text, type = '') {
    message = text; tone = type;
    const live = host.querySelector('.fb-status');
    if (live) { live.textContent = message; live.dataset.tone = tone; }
  }
  function focus(selector) { host.querySelector(selector)?.focus({ preventScroll:true }); }

  function open(card) {
    if (dialog?.open) return;
    if (!dialog) init();
    opener = card || document.activeElement;
    const manager = window.GameEngine.StateManager;
    state = C.restore(manager.state.farm);
    manager.state.farm = state;
    C.returnVisit(state, Date.now());
    save();
    zone = 'map'; at = 'yard'; tool = 'seed'; seed = 'carrot'; message = ''; tone = '';
    shown = false; dialogActive = false; walking = false; swipe = null; eventInput = null;
    dialog.showModal();
    render(true);
    tick = setInterval(updateTime, 500);
  }

  function init() {
    dialog = document.createElement('dialog');
    dialog.className = 'mg-dialog fb-dialog';
    dialog.style.setProperty('--fb-map-image', `url("${mapImage}")`);
    dialog.lang = 'th';
    dialog.setAttribute('aria-labelledby', 'fb-title');
    dialog.innerHTML = `<div class="mg-dialog-body"><header class="mg-game-header fb-header"><button type="button" class="mg-close" data-fb="close" aria-label="กลับไปเลือกเกม">←</button><div class="mg-header-title"><h2 id="fb-title">สวนเบิร์ช <span lang="sv">Björkbacken</span></h2><p>ฟาร์มเล็ก ๆ ของเรา</p></div>${action('map', '⌖ แผนที่')}</header><main class="mg-game-content fb-content"></main></div>`;
    host = dialog.querySelector('main');
    document.body.appendChild(dialog);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('pointerdown', pointerDown);
    dialog.addEventListener('pointermove', pointerMove);
    for (const type of ['pointerup','pointercancel','lostpointercapture']) dialog.addEventListener(type, pointerEnd);
    dialog.addEventListener('close', () => {
      clearInterval(tick); cancelSwipe(); eventInput = null; walking = false;
      D.destroy(); window.SpeechEngine?.stopAudio?.();
      C.leave(state, Date.now()); save();
      window.SmallGames?.renderLobby();
      document.querySelector('[data-open-game="farm"]')?.focus({ preventScroll:true });
      if (!document.querySelector('[data-open-game="farm"]')) opener?.focus();
    });
    document.addEventListener('visibilitychange', () => {
      if (!dialog.open) return;
      if (document.hidden) { C.leave(state, Date.now()); save(); }
      else if (C.returnVisit(state, Date.now())) { save(); if (!dialogActive && !walking) render(); }
    });
    window.addEventListener('pagehide', () => { if (dialog.open) { C.leave(state, Date.now()); save(); } });
  }

  function cover() { return `<div class="mg-cover fb-cover" aria-hidden="true"><img src="${mapImage}" alt=""><span>✦ &nbsp; BJÖRKBACKEN</span></div>`; }

  function pin(id) {
    const place = zones[id];
    const pending = eventHere(id);
    return `<button type="button" class="fb-pin ${pending ? 'has-event' : ''}" style="--x:${place.x}%;--y:${place.y}%" data-fb="walk" data-value="${id}" aria-label="ไป${place.th}${pending ? ' · มีเหตุการณ์' : ''}">${zoneLabel(id, pending)}</button>`;
  }
  function map() {
    const place = zones[at];
    return `<section class="fb-map-section"><div class="fb-map" aria-label="แผนที่สวนเบิร์ช"><img src="${mapImage}" alt="ฟาร์มมองจากด้านบน มีทางเดินเชื่อมแปลงผัก โรงนา คอกหมู ทุ่งม้า สระเป็ด โรงช่าง และตลาด">${Object.keys(zones).map(pin).join('')}<span class="fb-walker" aria-hidden="true" style="--x:${place.x}%;--y:${place.y}%">✦</span></div><p class="fb-map-caption">แตะชื่อสถานที่เพื่อเดินไปตามทางในฟาร์ม</p></section>`;
  }
  function header() {
    const sky = C.sky(state);
    return `<div class="fb-stats"><span>${sky.icon} วันที่ ${state.day} · ${sky.th}</span><span>◈ ${state.coins} เหรียญฟาร์ม</span><span>✦ ${state.chapter} / ${C.chapters.length} บท</span></div>`;
  }
  function notice() {
    if (!state.event) return '';
    const event = C.events[state.event.id];
    return `<section class="fb-notice"><span class="fb-kicker">มีอะไรเกิดขึ้นระหว่างที่เราไม่อยู่</span><div><strong>${event.th}</strong>${action('walk', `ไป${zones[event.zone].th} →`, event.zone)}</div></section>`;
  }
  function letter() {
    const chapter = C.chapters[state.chapter];
    return `<section class="fb-card fb-letter"><span class="fb-kicker">${chapter ? `จดหมายจากหมู่บ้าน · บทที่ ${state.chapter + 1}` : 'หลังงานฉลอง · ตลาดยังเปิดอยู่'}</span><h3>${chapter?.title || 'ฟาร์มของเราโตแล้ว'}</h3><p>${chapter?.letter || 'ยังปลูกพืช ดูแลสัตว์ แต่งสวน และรับออร์เดอร์ใหม่ที่ตลาดได้เรื่อย ๆ'}</p>${action('walk', 'ดูออร์เดอร์ที่ตลาด →', 'market')}</section>`;
  }
  function locationTitle(id) {
    const place = zones[id];
    return `<section class="fb-place-title"><div><span class="fb-kicker">${place.icon} สวนเบิร์ช</span><h3 tabindex="-1">${place.th} <small lang="sv">${place.sv}</small></h3><p>${place.note}</p></div>${replay(`Vi går till ${place.sv}.`)}</section>`;
  }
  function render(reset = false) {
    if (dialogActive) return;
    const scroll = host.scrollTop;
    host.className = 'mg-game-content fb-content';
    const contents = {
      map:() => `${state.event ? notice() : ''}${map()}${letter()}`,
      fields, market, workshop, yard,
      barn:() => animalZone('barn'), pigs:() => animalZone('pigs'), pond:() => animalZone('pond'), paddock:() => animalZone('paddock'),
      journal, event:renderEvent
    };
    host.innerHTML = `${header()}${contents[zone]()}<div class="fb-status" role="status" aria-live="polite" data-tone="${tone}">${esc(message)}</div>${navigation()}`;
    host.scrollTop = reset ? 0 : scroll;
    updateTime();
    if (reset) focus('.fb-place-title h3, .fb-event h3, .fb-letter h3');
  }

  function navigation() {
    return `<nav class="fb-nav" aria-label="ทางลัดในฟาร์ม">${action('map','⌖ แผนที่','',`aria-current="${zone === 'map' ? 'page' : 'false'}"`)}${action('walk','🌱 แปลง','fields')}${action('walk','🧺 ตลาด','market')}${action('journal','▤ สมุด','',`aria-current="${zone === 'journal' ? 'page' : 'false'}"`)}</nav>`;
  }
  function walk(id) {
    if (!Object.hasOwn(zones, id) || walking || dialogActive) return;
    if (zone !== 'map') { zone = 'map'; render(true); }
    const marker = host.querySelector('.fb-walker');
    const to = zones[id], from = zones[at];
    const trip = Symbol();
    const arrive = () => {
      if (!dialog.open || walking !== trip) return;
      at = zone = id; walking = false; shown = false; message = ''; tone = '';
      render(true);
      if (id === 'market') speak(orderText(C.order(state)));
    };
    walking = trip;
    const frames = [{ left:`${from.x}%`,top:`${from.y}%` },{ left:'49%',top:'46%' },{ left:`${to.x}%`,top:`${to.y}%` }];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !marker?.animate) arrive();
    else marker.animate(frames, { duration:430, easing:'ease-in-out', fill:'forwards' }).finished.then(arrive, arrive);
  }

  function plot(index, now) {
    const value = state.plots[index], phase = C.plotStatus(value, now);
    return `<button type="button" class="fb-plot" data-fb="plot" data-value="${index}" data-phase="${phase}" aria-label="${plotLabel(index, value, phase)}">${plotContents(value, phase)}</button>`;
  }
  function plotLabel(index, plot, phase) { return `แปลง ${index + 1} · ${plot ? C.crops[plot.id].th + ' · ' : ''}${plotLabels[phase]}`; }
  function plotContents(plot, phase) {
    return `${A.plant(plot?.id, phase)}${plot && phase !== 'ripe' ? `<span class="fb-crop-indicator" aria-hidden="true">${A.symbols[plot.id]}</span>` : ''}<span class="fb-plot-name">${plotLabels[phase]}</span>`;
  }
  function fields() {
    const now = Date.now();
    const cap = state.chapter >= 5 ? 8 : state.chapter >= 2 ? 6 : 4;
    return `${locationTitle('fields')}<section class="fb-fields" aria-label="แปลงเพาะปลูก"><img src="${fieldImage}" alt=""><div class="fb-plots">${state.plots.map((_, i) => plot(i, now)).join('')}</div></section>
      <section class="fb-card fb-field-tools"><p>เลือกเครื่องมือ แล้วลากนิ้วผ่านหลายแปลง หรือแตะทีละแปลงได้ต๊ะ</p><div class="fb-tool-row">${Object.entries(tools).map(([id, item]) => action('tool', `${glyph(id)} ${item.th}`, id, `aria-pressed="${id === tool}"`)).join('')}</div>
      ${tool === 'seed' ? `<div class="fb-seed-row" aria-label="เลือกเมล็ด">${Object.entries(C.crops).filter(([, item]) => state.chapter >= item.chapter).map(([id, item]) => action('seed', `${glyph(id)} ${item.th}`, id, `aria-pressed="${id === seed}"`)).join('')}</div>` : ''}
      <div class="fb-row">${action('dawn','☀ พักจนถึงเช้า','', 'data-fb-rest')}${state.plots.length < cap ? action('expand', `เพิ่มแปลง · ◈ ${state.plots.length < 6 ? 6 : 9}`) : ''}</div></section>`;
  }
  function updatePlot(index, now) {
    const button = host.querySelector(`[data-fb="plot"][data-value="${index}"]`);
    if (!button) return;
    const value = state.plots[index], phase = C.plotStatus(value, now);
    if (button.dataset.phase === phase) return;
    button.dataset.phase = phase;
    button.setAttribute('aria-label', plotLabel(index, value, phase));
    button.innerHTML = plotContents(value, phase);
  }
  function usePlot(index) {
    const now = Date.now(), old = state.plots[index];
    const result = C.tend(state, index, tool, seed, now);
    const planted = C.crops[seed];
    const notes = {
      planted:`เพาะ${planted.th}แล้ว · เลือกบัวรดน้ำต่อ`, watered:'รดน้ำแล้ว ระหว่างรอไปทำอย่างอื่นหรือพักจนถึงเช้าได้',
      harvested:`เก็บ${C.crops[old?.id]?.th || ''}แล้ว ของอยู่ในยุ้งฉาง`, empty:'แปลงนี้ว่าง เลือกเมล็ดก่อนนะ', dry:'เมล็ดต้องการน้ำ ลองเลือกบัวรดน้ำ',
      growing:'ต้นกำลังโต ลองแวะไปทำงานที่อื่นก่อน', ripe:'พืชโตแล้ว เลือกตะกร้าเพื่อเก็บเกี่ยว'
    };
    status(notes[result] || 'แปลงนี้ยังใช้ไม่ได้', ['planted','watered','harvested'].includes(result) ? 'good' : '');
    if (['planted','watered','harvested'].includes(result)) {
      save(); updatePlot(index, now); updateTime(); sound(result === 'harvested' ? 'correct' : 'tap');
      const button = host.querySelector(`[data-fb="plot"][data-value="${index}"]`);
      button?.animate?.([{ transform:'scale(1)' },{ transform:'scale(.92)' },{ transform:'scale(1)' }], { duration:260 });
    }
  }

  function animalZone(id) {
    const residents = Object.entries(C.animals).filter(([, animal]) => animal.zone === id);
    return `${locationTitle(id)}${eventHere(id) ? eventLink() : ''}<div class="fb-scene-strip fb-scene-${id}" aria-hidden="true"></div><div class="fb-animal-grid">${residents.map(([key, animal]) => {
      const available = state.chapter >= animal.chapter;
      return `<article class="fb-card fb-animal ${available ? '' : 'is-locked'}">${A.animal(key)}<h4>${animal.th} <small lang="sv">${animal.sv}</small></h4>${replay(animal.sv, 'ฟังชื่อ')}${available ? action('animal', '', key, 'data-fb-animal') : `<p>มาถึงเมื่อเปิดบทที่ ${animal.chapter + 1}</p>`}</article>`;
    }).join('')}${id === 'paddock' && state.foal ? `<article class="fb-card fb-animal">${A.animal('foal')}<h4 lang="sv">${state.foal}</h4><p>ลูกม้าประจำทุ่งเบิร์ช</p>${replay(`Det här är ${state.foal}. Ett föl.`)}</article>` : ''}</div>${action('dawn','☀ พักจนถึงเช้า','', 'data-fb-rest')}`;
  }
  function updateTime() {
    if (!dialog.open || dialogActive) return;
    const now = Date.now();
    if (zone === 'fields') state.plots.forEach((_, i) => updatePlot(i, now));
    host.querySelectorAll('[data-fb-rest]').forEach(button => { button.disabled = !C.canRest(state, now); });
    host.querySelectorAll('[data-fb-animal]').forEach(button => {
      const id = button.dataset.value;
      const phase = C.animalStatus(state, id, now);
      const labels = { feed:'ให้อาหาร', collect:`เก็บ${C.goods[C.animals[id].good]?.th || ''}`, rest:'กำลังกิน · กลับมาอีกนิด', greet:'ทักทายม้า' };
      if (button.dataset.phase !== phase) {
        button.dataset.phase = phase; button.textContent = labels[phase]; button.disabled = phase === 'rest';
      }
    });
  }

  function workshop() {
    return `${locationTitle('workshop')}<div class="fb-scene-strip fb-scene-workshop" aria-hidden="true"></div><div class="fb-workshop">${Object.entries(C.recipes).map(([id, recipe]) => {
      const unlocked = state.chapter >= recipe.chapter;
      return `<article class="fb-card fb-recipe"><div class="fb-item-heading">${glyph(id)}<div><h4>${C.goods[id].th}</h4><p lang="sv">${recipe.sv}</p></div></div><p>${Object.entries(recipe.uses).map(([key, count]) => `${C.goods[key].th} ${count} · มี ${state.stock[key]}`).join(' + ')}</p><div class="fb-row">${replay(recipe.sv)}${unlocked ? action('craft','ลงมือทำ',id, C.hasStock(state, recipe.uses) ? '' : 'disabled') : `<small>เปิดในบทที่ ${recipe.chapter + 1}</small>`}</div></article>`;
    }).join('')}</div>`;
  }
  function yard() {
    return `${locationTitle('yard')}${eventHere('yard') ? eventLink() : ''}<div class="fb-yard-art"><img src="${fieldImage}" alt=""><div class="fb-flag-display">${A.flag(1, state.event?.id === 'flag' ? 0 : .9)}</div><div class="fb-decor-display">${state.decor.map(glyph).join('')}</div></div><section class="fb-card"><h4>แต่งลานหน้าบ้าน</h4><p>ใช้เหรียญที่ได้จากตลาด ของที่ซื้อจะอยู่หน้าบ้านทุกครั้งที่กลับมา</p><div class="fb-row">${Object.entries(C.decorations).map(([id, item]) => action('decorate', `${glyph(id)} ${item.th} · ${state.decor.includes(id) ? '✓' : `◈ ${item.cost}`}`, id, state.decor.includes(id) ? 'disabled' : '')).join('')}</div></section>`;
  }
  function journal() {
    return `<section class="fb-place-title"><div><span class="fb-kicker">จดไว้ในสมุด</span><h3 tabindex="-1">สมุดฟาร์ม</h3><p>ทบทวนชื่อผลผลิตและจำนวนที่มีในยุ้งฉาง</p></div></section><div class="fb-album">${Object.entries(C.goods).filter(([id,item]) => state.stock[id] || (item.chapter !== undefined && item.chapter <= state.chapter)).map(([id,item]) => `<article class="fb-card fb-album-word">${glyph(id)}<strong lang="sv">${item.sv}</strong><span>${item.th} · ${state.stock[id]}</span>${replay(item.sv)}</article>`).join('')}</div>`;
  }

  function orderText(order) {
    const items = and(Object.entries(order.order).map(([id, count]) => qty(id, count)));
    return [ `Jag skulle vilja ha ${items}, tack.`, `Kan du ordna ${items} till mig?`, `Till marknaden behöver jag ${items}.` ][order.guest];
  }
  function market() {
    const order = C.order(state), guest = D.guests[order.guest];
    const line = orderText(order);
    const translation = Object.entries(order.order).map(([id,n]) => `${C.goods[id].th} × ${n}`).join(' กับ ');
    const stock = Object.keys(C.goods).filter(id => state.stock[id] || state.basket[id]);
    return `${locationTitle('market')}<div class="fb-scene-strip fb-scene-market" aria-hidden="true"></div><section class="fb-card fb-order">
      <span class="fb-kicker">${order.id ? 'ตะกร้าตามจดหมาย' : 'ออร์เดอร์ใหม่'} · ${guest.thai}</span><h4>${order.title || 'ของสำหรับตลาดวันนี้'}</h4><p ${state.chapter < 3 || shown ? 'lang="sv"' : ''} class="fb-order-line">${state.chapter < 3 || shown ? esc(line) : 'ลองฟังว่าลูกค้าต้องการอะไร'}</p>
      ${shown ? `<p>ขอ ${translation}</p>` : ''}<div class="fb-row">${replay(line, 'ฟังออร์เดอร์อีกครั้ง')}${action('meaning', shown ? 'ซ่อนคำแปล' : 'ดูข้อความกับคำแปล', '', `aria-pressed="${shown}"`)}</div></section>
      <section class="fb-card fb-basket"><div class="fb-basket-head"><div><span class="fb-kicker">จากยุ้งฉางไปตะกร้า</span><h4>จัดของให้ครบ</h4></div><span aria-hidden="true">🧺</span></div>
      ${stock.length ? `<ul>${stock.map(id => `<li><span class="fb-basket-name">${glyph(id)}<span><strong lang="sv">${C.goods[id].sv}</strong><small>${C.goods[id].th} · มี ${state.stock[id]}</small></span></span><span class="fb-stepper">${action('minus','−',id,`aria-label="เอา${C.goods[id].th}ออก" ${state.basket[id] ? '' : 'disabled'}`)}<b>${state.basket[id]}</b>${action('plus','+',id,`aria-label="เพิ่ม${C.goods[id].th}" ${state.basket[id] >= Math.min(9, state.stock[id]) ? 'disabled' : ''}`)}</span></li>`).join('')}</ul>` : '<p>ตะกร้ายังว่าง ไปเก็บผลผลิตก่อนแล้วกลับมาตลาดได้</p>'}
      <div class="fb-row">${action('deliver','ส่งตะกร้า →','','data-primary')}${action('walk','ไปแปลงผัก','fields')}</div></section>`;
  }

  function deliveryTurns(order) {
    const item = Object.keys(order.order)[0];
    const first = C.goods[item];
    const model = `Här är ${qty(item, order.order[item])}.`;
    const modelTh = `นี่คือ${first.th} ${order.order[item]}`;
    const reaction = 'Tack! Precis vad jag behövde.', reactionTh = 'ขอบคุณจ้า ตรงกับที่ฉันต้องการเลย';
    const good = D.reply('Ja, här är din korg.', 'ใช่ นี่ตะกร้าของคุณ', reaction, reactionTh);
    const wrong = D.reply('Nej, jag vill köpa frön.', 'ไม่ ฉันอยากซื้อเมล็ด', 'Är det här min korg eller inte?', 'นี่ตะกร้าของฉันหรือเปล่านะ?');
    if (order.reply === 'voice') return [{ line:'Vad har du med dig?', meaning:'เอาอะไรมาให้ฉันบ้าง?', say:model, sayTh:modelTh,
      word:first.sv.replace(/^(en|ett) /, '').split(' ').at(-1), wordTh:first.th, reaction, reactionTh }];
    if (order.reply === 'build') return [{ line:'Vad säger du när du lämnar över korgen?', meaning:'ตอนยื่นตะกร้าให้ลูกค้า เราพูดว่าอะไรได้บ้าง?',
      build:[D.reply('din korg.','ตะกร้าของคุณ'),D.reply('min spade.','จอบของฉัน'),D.reply('Här','นี่'),D.reply('är','คือ')], order:[2,3,0], reaction, reactionTh }];
    const flipped = order.guest % 2 === 0;
    return [{ line:'Är det här min korg?', meaning:'นี่ตะกร้าของฉันใช่ไหม?', replies:flipped ? [wrong, good] : [good, wrong], wrong:flipped ? 0 : 1 }];
  }

  function startDelivery() {
    const result = C.checkBasket(state);
    if (!result.ok) {
      const hints = [result.missing.length ? `ยังขาด ${result.missing.map(id => C.goods[id].th).join(' กับ ')}` : '',
        result.extra.length ? `มีเกิน ${result.extra.map(id => C.goods[id].th).join(' กับ ')}` : ''].filter(Boolean);
      status(hints.join(' · ') || 'ของในยุ้งฉางยังไม่พอ', 'retry');
      speak(result.extra.length ? 'Det är lite för mycket i korgen.' : 'Det saknas något i korgen.');
      sound('retry'); return;
    }
    const order = C.order(state), guest = D.guests[order.guest], turns = deliveryTurns(order);
    dialogActive = true;
    D.start(host, { label:'ส่งของที่ตลาด', guest, turns, portrait:`<span class="fb-guest" aria-hidden="true">${['👩🏻‍🌾','🧑🏼‍🌾','👩🏽‍🌾'][guest.portrait]}</span>`,
      onWordFallback(turn) {
        if (turns.length > 1) return;
        turns.push({ line:'En gång till. Vad har du med dig?', meaning:'ขอทบทวนอีกครั้งนะ เอาอะไรมาให้ฉัน?',
          replies:[D.reply(turn.say, turn.sayTh, 'Bra, tack för korgen!', 'ดีจ้า ขอบคุณสำหรับตะกร้า!'),
            D.reply('Jag har med mig en spade.', 'ฉันเอาจอบมาด้วย', 'Titta i korgen.', 'ลองมองในตะกร้านะ')], wrong:1 });
      },
      onDone() {
        dialogActive = false;
        const delivered = C.deliver(state, Date.now());
        if (!delivered) { render(true); return; }
        const manager = window.GameEngine.StateManager;
        const reward = delivered.id ? P.complete(manager, `farm:${delivered.id}`, `farm:${delivered.id}`) : null;
        save();
        shown = false; zone = 'map';
        status(`ส่งของให้${guest.thai}แล้ว · +${delivered.coins} เหรียญฟาร์ม${reward?.xp ? ` · +${reward.xp} XP` : ''}`, 'good');
        sound('correct'); render(true);
      }
    });
  }

  function eventLink() { return `<div class="fb-event-link">${action('event', `✦ ${C.events[state.event.id].th} →`, '', 'data-primary')}</div>`; }

  const eggPlaces = [
    { icon:'🌉', th:'ใต้สะพาน', sv:'under bron' },
    { icon:'🌾', th:'หลังต้นกก', sv:'bakom vassen' },
    { icon:'🪨', th:'ข้างก้อนหิน', sv:'bredvid stenen' }
  ];
  const eggOrder = [1,0,2];
  const fenceOrder = [2,0,1];
  const fencePieces = [{ th:'สั้น', sv:'kort' },{ th:'ยาวปานกลาง', sv:'mellanlång' },{ th:'ยาว', sv:'lång' }];
  function option(id, index, label, mark = '') { return action(id, `<span aria-hidden="true">${mark}</span>${label}`, index); }
  function renderEvent() {
    const { id, step } = state.event;
    const event = C.events[id];
    const contents = { flag:flagEvent, fence:fenceEvent, eggs:eggEvent, foal:foalEvent };
    return `<section class="fb-event fb-card"><span class="fb-kicker">เหตุการณ์ในฟาร์ม · ${step + 1} / 3</span><h3 tabindex="-1">${event.th}</h3>${contents[id](step)}${action('leave-event','กลับไปที่เดิม')}</section>`;
  }
  function flagEvent(step) {
    const lines = ['Hämta en ny lina.','Trä linan genom ringarna, nedifrån och upp.','Hissa flaggan.'];
    const notes = ['หาเชือกใหม่ให้เสาธง','ลากผ่านห่วงจากล่างขึ้นบน หรือแตะเรียงทีละห่วง','กดค้างเพื่อชักธงขึ้นจนถึงยอด'];
    const rings = `<div class="fb-rings" aria-label="ห่วงสำหรับร้อยเชือก">${[2,1,0].map(i => action('ring', '○', i, `aria-label="ห่วง${['ล่าง','กลาง','บน'][i]}"`)).join('')}</div>`;
    return `<div class="fb-puzzle-stage fb-flag-stage"><div class="fb-flag-puzzle">${A.flag(step, eventInput.up)}</div>${step === 1 ? rings : ''}</div><p>${notes[step]}</p>${replay(lines[step])}
      ${step === 0 ? `<div class="fb-puzzle-options">${option('piece',0,'ค้อน','🔨')}${option('piece',1,'เชือก','🧵')}${option('piece',2,'แปรง','🖌️')}</div>` : step === 2 ? `<progress class="fb-hoist-progress" max="1" value="${eventInput.up}" aria-label="ความสูงของธง"></progress>${action('hoist','⚑ กดค้างเพื่อชักธง','','data-primary')}` : ''}`;
  }
  function fenceEvent(step) {
    const label = fencePieces[fenceOrder[step]];
    return `<div class="fb-puzzle-stage fb-fence-stage"><div class="fb-fence-art">${[0,1,2].map(i => `<i class="${i === step ? 'is-gap' : i < step ? 'is-fixed' : ''}" style="--span:${[84,49,67][i]}%"></i>`).join('')}</div>${A.animal('pig')}</div>
      <p>เลือกไม้ที่พอดีกับช่องว่าง แล้วใส่กลับเข้ารั้ว</p>${replay(`Sätt dit den ${['korta','mellanlånga','långa'][fenceOrder[step]]} brädan.`)}
      <div class="fb-puzzle-options">${fencePieces.map((piece,i) => option('piece',i,`<small lang="sv">${piece.sv}</small>`, `<i class="fb-plank" style="--span:${[32,51,68][i]}px"></i>`)).join('')}</div>
      ${eventInput.hint ? `<p>คำใบ้ · ลองมองหาไม้แผ่น${label.th}</p>` : ''}`;
  }
  function eggEvent(step) {
    const target = eggPlaces[eggOrder[step]];
    return `<div class="fb-puzzle-stage fb-egg-stage"><div class="fb-egg-pool"></div><div class="fb-puzzle-options">${eggPlaces.map((place,i) => option('piece',i,place.th,place.icon)).join('')}</div></div>
      <p>ฟังว่าไข่อยู่ตรงไหน แล้วแตะจุดนั้นในภาพ</p>${replay(`Ägget ligger ${target.sv}.`)}${eventInput.hint ? `<p>คำใบ้ · ${target.th}</p>` : ''}`;
  }
  function foalEvent(step) {
    const lines = ['Stoet har fått ett föl i morse! Ta med en filt.','Fyll hinken med vatten.','Vad ska fölet heta?'];
    const notes = ['เช้านี้แม่ม้าออกลูก ลองเลือกผ้าห่มไปที่คอก', 'เตรียมน้ำให้แม่ม้า เลือกของที่ใส่น้ำได้', 'ตั้งชื่อให้ลูกม้าตัวใหม่ของสวนเบิร์ช'];
    const items = [ [['จอบ','🛠️'],['ผ้าห่ม','🧣'],['เชือก','🧵']], [['ตะกร้า','🧺'],['ลังไม้','📦'],['ถังน้ำ','🪣']], C.foalNames.map(name => [`<span lang="sv">${name}</span>`,'✦']) ];
    return `<div class="fb-puzzle-stage fb-foal-stage">${A.animal('horse')}${A.animal('foal')}</div><p>${notes[step]}</p>${replay(lines[step])}<div class="fb-puzzle-options">${items[step].map(([label,icon],i) => option('piece',i,label,icon)).join('')}</div>`;
  }
  function enterEvent() {
    if (!state.event) return;
    zone = 'event'; eventInput = { ring:0, up:0, hint:false }; status(''); render(true);
  }
  function eventAdvance(name) {
    const { id, step } = state.event;
    const result = C.progressEvent(state, id, step, name);
    if (!result) return;
    save(); cancelSwipe(); sound('correct');
    eventInput = { ring:0, up:0, hint:false };
    if (result === 'finished') {
      zone = at;
      status(id === 'foal' ? `${name} อยู่กับเราแล้ว · +3 เหรียญฟาร์ม` : 'ช่วยฟาร์มสำเร็จแล้ว · +3 เหรียญฟาร์ม', 'good');
    } else status('เรียบร้อยแล้ว ไปต่อได้จ้า', 'good');
    render(true);
  }
  function choosePiece(index) {
    const { id, step } = state.event;
    const target = { flag:[1], fence:fenceOrder, eggs:eggOrder, foal:[1,2] }[id][step];
    if (id === 'foal' && step === 2) return eventAdvance(C.foalNames[index]);
    if (index === target) return eventAdvance();
    eventInput.hint = true; sound('retry'); status('ยังไม่ตรงจ้า ลองฟังคำใบ้อีกครั้งแล้วเลือกใหม่', 'retry'); render();
  }
  function useRing(index) {
    if (index !== eventInput.ring) { status('เริ่มจากห่วงล่าง แล้วไล่ขึ้นไปนะ', 'retry'); return; }
    host.querySelector(`[data-fb="ring"][data-value="${index}"]`)?.classList.add('is-threaded');
    if (++eventInput.ring === 3) eventAdvance();
    else sound('tap');
  }
  function updateFlag(amount) {
    eventInput.up = Math.min(1, amount);
    const target = host.querySelector('.fb-flag-puzzle');
    if (target) target.innerHTML = A.flag(2, eventInput.up);
    const progress = host.querySelector('.fb-hoist-progress');
    if (progress) progress.value = eventInput.up;
    if (eventInput.up >= 1) eventAdvance();
  }
  function cancelSwipe() { if (swipe?.frame) cancelAnimationFrame(swipe.frame); swipe = null; }
  function pointerDown(event) {
    const target = event.target.closest('[data-fb="plot"], [data-fb="ring"], [data-fb="hoist"]');
    if (!target || event.button !== 0 || swipe) return;
    const kind = target.dataset.fb;
    swipe = { id:event.pointerId, kind, visited:new Set() };
    target.setPointerCapture(event.pointerId);
    if (kind === 'hoist') {
      const start = performance.now(), before = eventInput.up;
      const advance = now => {
        if (!swipe) return;
        updateFlag(before + (now - start) / 1350);
        if (swipe) swipe.frame = requestAnimationFrame(advance);
      };
      swipe.frame = requestAnimationFrame(advance);
    } else visit(target);
  }
  function visit(target) {
    const index = Number(target.dataset.value);
    if (swipe.visited.has(index)) return;
    swipe.visited.add(index);
    if (swipe.kind === 'plot') usePlot(index);
    else useRing(index);
  }
  function pointerMove(event) {
    if (swipe?.id !== event.pointerId || swipe.kind === 'hoist') return;
    const target = document.elementFromPoint(event.clientX,event.clientY)?.closest(`[data-fb="${swipe.kind}"]`);
    if (target) visit(target);
  }
  function pointerEnd(event) { if (swipe?.id === event.pointerId) cancelSwipe(); }

  function onClick(event) {
    const button = event.target.closest('[data-fb]');
    if (!button || button.disabled) return;
    const { fb, value } = button.dataset;
    if (fb === 'close') { dialog.close(); return; }
    if (fb === 'map') {
      if (dialogActive) { dialogActive = false; D.destroy(); }
      walking = false; cancelSwipe(); zone = 'map'; status(''); render(true); return;
    }
    if (walking || dialogActive) return;
    const now = Date.now();
    switch (fb) {
      case 'walk': walk(value); break;
      case 'journal': zone = 'journal'; status(''); render(true); break;
      case 'listen': speak(value); break;
      case 'tool': tool = value; speak(tools[tool].sv); render(); focus(`[data-fb="tool"][data-value="${tool}"]`); break;
      case 'seed': seed = value; speak(C.crops[seed].sv); render(); focus(`[data-fb="seed"][data-value="${seed}"]`); break;
      case 'plot': if (!event.detail) usePlot(Number(value)); break;
      case 'dawn':
        if (C.nextDay(state, now)) { save(); speak(`God morgon! I dag är det ${C.sky(state).sv}.`); status('เช้าแล้ว ลองกลับไปดูผลผลิตที่พร้อมเก็บ', 'good'); render(); }
        break;
      case 'animal': {
        const animal = C.animals[value], result = C.tendAnimal(state, value, now);
        if (result === 'greet') { speak(state.foal ? `Hej, ${state.foal}!` : 'Hej, fina häst!'); status('ม้าขยับหูทักทายเรา', 'good'); }
        if (result === 'feed') { save(); status('ให้อาหารแล้ว แวะกลับมารับผลผลิตได้จ้า', 'good'); speak(`Nu får ${animal.definite} mat.`); }
        if (result === 'collect') { save(); status(`เก็บ${C.goods[animal.good].th}เข้ายุ้งฉางแล้ว`, 'good'); speak(C.goods[animal.good].sv); sound('correct'); }
        button.closest('.fb-animal')?.querySelector('svg')?.animate?.([{transform:'rotate(0)'},{transform:'rotate(-5deg) translateY(-5px)'},{transform:'rotate(0)'}],{duration:380});
        updateTime(); break;
      }
      case 'craft':
        if (C.craft(state,value,now)) { save(); status(`ทำ${C.goods[value].th}เสร็จแล้ว`, 'good'); speak(C.recipes[value].sv); sound('correct'); render(); }
        break;
      case 'meaning': shown = !shown; render(); focus('[data-fb="meaning"]'); break;
      case 'plus': case 'minus':
        if (C.adjustBasket(state,value,fb === 'plus' ? 1 : -1)) { save(); sound('tap'); render(); focus(`[data-fb="${fb}"][data-value="${value}"]`); }
        break;
      case 'deliver': startDelivery(); break;
      case 'expand':
        if (C.expand(state)) { save(); status('ได้แปลงใหม่แล้ว', 'good'); render(); } else status('เหรียญยังไม่พอ ลองส่งของที่ตลาด');
        break;
      case 'decorate':
        if (C.decorate(state,value)) { save(); status('วางของแต่งไว้หน้าบ้านแล้ว', 'good'); speak(C.decorations[value].sv); render(); } else status('เหรียญยังไม่พอ ลองส่งของที่ตลาด');
        break;
      case 'event': enterEvent(); break;
      case 'leave-event': cancelSwipe(); zone = at; status(''); render(true); break;
      case 'piece': choosePiece(Number(value)); break;
      case 'ring': if (!event.detail) useRing(Number(value)); break;
      case 'hoist': if (!event.detail) updateFlag(eventInput.up + .25); break;
    }
  }

  window.FarmGame = { open, cover };
})();

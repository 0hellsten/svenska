/* Small, complete Swedish-learning games, integrated with the existing app. */
(function () {
  'use strict';
  const C = window.MiniGameCore;
  const A = window.MiniGameArt;
  const STORAGE_KEY = 'wilawan_small_games_v1';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const speaker = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8q5 4 0 8m3-11q7 7 0 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const games = [
    { id: 'zoo', title: 'Nattnyckeln', subtitle: 'MYSTERIET I BJÖRKGLÄNTAN',
      description: 'Parken har stängt. Tolv väl dolda djur, tre mekaniska lås och Signes fältbok visar vägen genom natten.',
      tags: ['Escape room', 'Tre kapitel', 'Hitta & lös gåtor'] },
    { id: 'kitchen', title: 'Wilawans lilla kök', subtitle: 'ORD SOM BLIR NÅGOT GOTT',
      description: 'Ett soligt kök, 29 råvaror och något gott att baka. Lyssna, hitta och dra till bunken.',
      tags: ['Mat & bakning', 'Dra & upptäck', 'Två recept'] },
    { id: 'cafe', title: 'En fika, tack!', subtitle: 'EN LITEN STUND PÅ SVENSKA',
      description: 'Välkommen bakom disken. Lyssna på gästerna och fyll brickan med precis rätt fika.',
      tags: ['Vardagsfraser', 'Antal & lyssnande', 'Fem gäster'] },
    { id: 'memory', title: 'Ord på tråden', subtitle: 'SMÅ BILDER, NYA MINNEN',
      description: 'Bland bilderna på girlangen gömmer sig sex ordpar. Vänd, lyssna och hitta det som hör ihop.',
      tags: ['Bild & ord', 'Minne & uttal', 'Sex ordpar'] }
  ];
  let saved = readSaved();
  let dialog, content, current, returnFocus, selected = null, dragging = null, suppressClick = false;
  let timers = new Set();
  let gestureController = null;

  function readSaved() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      const completed = {};
      for (const [key, value] of Object.entries(parsed.completed || {})) {
        if (/^(kitchen-(cake|cookies)|cafe|memory)$/.test(key) && Number.isSafeInteger(value) && value >= 0) completed[key] = value;
      }
      return { thai: parsed.thai !== false, mode: parsed.mode === 'listen' ? 'listen' : 'read',
        recipe: Object.hasOwn(C.recipes, parsed.recipe) ? parsed.recipe : 'cake', completed };
    } catch (_) { return { thai: true, mode: 'read', recipe: 'cake', completed: {} }; }
  }
  function persist() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (_) {} }
  function later(callback, delay) {
    const id = setTimeout(() => { timers.delete(id); if (dialog?.open) callback(); }, delay);
    timers.add(id); return id;
  }
  function clearPending() {
    for (const id of timers) clearTimeout(id);
    timers.clear();
    gestureController?.abort(); gestureController = null;
    cleanupDrag();
    selected = null;
    suppressClick = false;
    window.SpeechEngine?.stopAudio?.();
  }
  function sound(name) { window.SpeechEngine?.playSound?.(name); }
  function say(text, slow = false) {
    if (!window.SpeechEngine?.speakSwedish) {
      feedback('Ljud saknas i den här webbläsaren. Tryck på ”Visa orden” för att läsa.', 'retry');
      return;
    }
    window.SpeechEngine.speakSwedish(text, slow ? 0.60 : 0.88);
  }
  function feedback(text, tone = '') {
    const el = $('#mg-feedback', dialog);
    if (el) { el.textContent = text; el.dataset.tone = tone; }
  }
  function animate(el, name) {
    if (!el) return;
    el.classList.remove(name);
    void el.offsetWidth;
    el.classList.add(name);
    later(() => el.classList.remove(name), 500);
  }
  function progress(label, done, total) {
    return `<div class="mg-game-progress"><span>${escape(label)}</span><div class="mg-progress-track" role="progressbar" aria-label="Omgångens framsteg" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><div class="mg-progress-fill" style="width:${100 * done / total}%"></div></div><span>${done} / ${total}</span></div>`;
  }
  function feedbackHTML(text) { return `<div id="mg-feedback" class="mg-feedback" role="status" aria-live="polite" aria-atomic="true">${text}</div>`; }

  function renderLobby() {
    const lobby = $('#small-games-lobby');
    if (!lobby) return;
    lobby.innerHTML = `<div class="mg-lobby"><div class="mg-lobby-intro"><span class="mg-eyebrow">En liten stund för dig</span><h1>Lek fram svenskan.</h1><p class="mg-lobby-lead">Ett varmt kök. En kopp kaffe. Ett ord du minns.<br>Små världar att upptäcka, i din egen takt.</p><div class="mg-lobby-sub"><span>Ingen tidspress</span><span>Svenskt uttal</span><span>Stöd på thai</span></div></div>${games.map(game => {
      const count = game.id === 'zoo' ? (window.ZooEscape?.getCompletions() || 0) : game.id === 'kitchen' ? (saved.completed['kitchen-cake'] || 0) + (saved.completed['kitchen-cookies'] || 0) : (saved.completed[game.id] || 0);
      return `<button type="button" class="mg-game-card" data-open-game="${game.id}">${A.cover(game.id)}<div class="mg-card-copy"><span class="mg-eyebrow">${game.subtitle}</span><div class="mg-card-heading"><h2>${game.title}</h2><span class="mg-card-arrow" aria-hidden="true">↗</span></div><p>${game.description}</p><div class="mg-card-meta">${game.tags.map(tag => `<span>${tag}</span>`).join('')}${count ? `<span>✓ Spelat ${count} gång${count === 1 ? '' : 'er'}</span>` : ''}</div></div></button>`;
    }).join('')}<p class="mg-hub-note">Här får du prova, göra om och upptäcka.<br>Varje liten omgång slutar med orden du har övat på.</p></div>`;
  }
  function init() {
    renderLobby();
    const homeCard = $('#mg-home-shortcut');
    if (homeCard) homeCard.innerHTML = '<span aria-hidden="true">✳</span><span><strong>Upptäck småspelen</strong><small>Lös zoomysteriet, baka och lek fram svenska ord.</small></span><span aria-hidden="true">↗</span>';
    document.addEventListener('click', event => {
      const card = event.target.closest('[data-open-game]');
      if (card) open(card.dataset.openGame, card);
      if (event.target.closest('#mg-home-shortcut')) $('[data-target="view-games"]')?.click();
    });
  }
  function open(gameId, opener) {
    if (!games.some(game => game.id === gameId)) return;
    if (gameId === 'zoo') return window.ZooEscape?.open(opener);
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'mg-dialog';
      dialog.setAttribute('aria-labelledby', 'mg-dialog-title');
      document.body.appendChild(dialog);
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      dialog.addEventListener('close', () => { clearPending(); current = null; returnFocus?.focus(); });
      dialog.addEventListener('click', handleAction);
      dialog.addEventListener('pointerdown', pointerDown);
    }
    clearPending();
    returnFocus = opener || document.activeElement;
    current = { gameId, revealed: false, finished: false };
    const game = games.find(entry => entry.id === gameId);
    dialog.innerHTML = `<div class="mg-dialog-body"><header class="mg-game-header"><button type="button" class="mg-close" data-action="close" aria-label="Tillbaka till småspelen" title="Tillbaka">←</button><div class="mg-header-title"><h2 id="mg-dialog-title">${game.title}</h2><p>${game.subtitle}</p></div><button type="button" class="mg-toggle" data-action="thai" aria-pressed="${saved.thai}" aria-label="Visa thailändskt stöd">ไทย</button><button type="button" class="mg-toggle" data-action="mode" aria-pressed="${saved.mode === 'listen'}" aria-label="Lyssningsläge">${saved.mode === 'listen' ? 'Bara lyssna' : 'Läs & lyssna'}</button></header><div class="mg-game-content"></div></div>`;
    content = $('.mg-game-content', dialog);
    dialog.classList.toggle('mg-show-th', saved.thai);
    if (!dialog.open) dialog.showModal();
    renderSetup();
  }
  function close() {
    clearPending();
    if (dialog?.open) dialog.close();
    renderLobby();
  }
  function renderSetup() {
    current.screen = 'setup';
    content.className = 'mg-game-content';
    const game = games.find(entry => entry.id === current.gameId);
    const intro = {
      kitchen: ['Vad ska vi baka idag?', 'Välj ett recept och gör dig hemmastadd. Lyssna på råvaran och dra den till bunken. Du kan också trycka på råvaran och sedan på bunken.', 'เลือกสูตร ฟังชื่อวัตถุดิบ แล้วลากลงชาม หรือแตะวัตถุดิบแล้วแตะชาม'],
      cafe: ['Ditt lilla fik har öppnat.', 'Fem gäster kommer på besök. Lyssna på beställningen, välj rätt antal och servera. Du kan alltid ta bort något från brickan.', 'ฟังลูกค้าสั่ง เลือกขนมและเครื่องดื่มให้ครบจำนวน แล้วกดเสิร์ฟ'],
      memory: ['Ett ord. En bild. Ett par.', 'Tolv små kort hänger på tråden. Para ihop en svensk text med bilden som hör till. Lyssna på orden och ta all tid du behöver.', 'จับคู่คำภาษาสวีเดนกับรูปภาพ ฟังคำศัพท์ และค่อย ๆ เล่นได้เลย']
    }[game.id];
    content.innerHTML = `<div class="mg-setup">${A.garland()}<span class="mg-eyebrow">${game.subtitle}</span><h3>${intro[0]}</h3><p class="mg-setup-lead">${intro[1]}</p><p class="mg-th mg-setup-lead" lang="th">${intro[2]}</p>${game.id === 'kitchen' ? `<div class="mg-recipe-options">${Object.values(C.recipes).map(recipe => `<button type="button" class="mg-recipe-choice" data-action="recipe" data-recipe="${recipe.id}" aria-pressed="${saved.recipe === recipe.id}">${recipe.id === 'cake' ? A.cake() : A.icon('cookies')}<strong>${recipe.name}</strong><small class="mg-th" lang="th">${recipe.th}</small><small>${recipe.id === 'cake' ? 'Blanda, baka & dekorera' : 'Med bitar av mjölkchoklad'}</small></button>`).join('')}</div>` : `<div class="mg-result-art" style="margin-top:25px">${A.icon(game.id === 'cafe' ? 'coffee' : 'flower')}</div>`}<div class="mg-mode-options"><button type="button" class="mg-mode-btn" data-action="choose-mode" data-mode="read" aria-pressed="${saved.mode === 'read'}">Läs & lyssna</button><button type="button" class="mg-mode-btn" data-action="choose-mode" data-mode="listen" aria-pressed="${saved.mode === 'listen'}">Bara lyssna</button></div><p class="mg-mode-description">${modeDescription()}</p><button type="button" class="mg-primary" data-action="start">${game.id === 'kitchen' ? 'Knyt på förklädet' : game.id === 'cafe' ? 'Öppna fiket' : 'Häng upp bilderna'} <span aria-hidden="true">→</span></button></div>`;
  }
  function modeDescription() {
    if (current.gameId === 'memory') return saved.mode === 'listen' ? 'Ordens texter är dolda. Lyssna och hitta rätt bild. Du kan alltid visa orden.' : 'Läs orden, lyssna på uttalet och hitta rätt bild.';
    return saved.mode === 'listen' ? 'Lyssna efter rätt ord. Texterna är dolda, men ”Visa orden” finns alltid.' : 'Se orden på svenska och lyssna så många gånger du vill.';
  }
  function handleAction(event) {
    const button = event.target.closest('button');
    if (!button || !dialog.contains(button)) return;
    if (suppressClick && button.matches('[data-ingredient]')) { suppressClick = false; return; }
    if (button.dataset.action === 'close') return close();
    if (button.dataset.action === 'thai') {
      saved.thai = !saved.thai; persist();
      dialog.classList.toggle('mg-show-th', saved.thai);
      button.setAttribute('aria-pressed', String(saved.thai)); return;
    }
    if (['mode', 'choose-mode'].includes(button.dataset.action)) {
      saved.mode = button.dataset.mode || (saved.mode === 'read' ? 'listen' : 'read');
      current.revealed = false; persist();
      const toggle = $('[data-action="mode"]', dialog);
      toggle.textContent = saved.mode === 'listen' ? 'Bara lyssna' : 'Läs & lyssna';
      toggle.setAttribute('aria-pressed', String(saved.mode === 'listen'));
      if (current.screen === 'setup') renderSetup();
      else if (current.screen === 'game') { renderGame(); speakPrompt(); }
      return;
    }
    const action = button.dataset.action;
    if (action === 'recipe') { saved.recipe = button.dataset.recipe; persist(); renderSetup(); return; }
    if (action === 'start') return start();
    if (action === 'again') { clearPending(); current.finished = false; renderSetup(); content.scrollTop = 0; return; }
    if (action === 'speak') return speakPrompt();
    if (action === 'slow') return speakPrompt(true);
    if (action === 'reveal') { current.revealed = !current.revealed; renderGame(); return; }
    if (action === 'word') return say(button.dataset.word, true);
    if (current.screen !== 'game' || current.finished) return;
    if (current.gameId === 'kitchen') {
      if (button.dataset.ingredient) return selectIngredient(button.dataset.ingredient, event.detail === 0);
      if (action === 'place-selected' && selected) return placeIngredient(selected);
      if (action === 'bowl') {
        if (current.kitchen.phase === 'stir') return stir();
        if (selected) return placeIngredient(selected);
        feedback('Välj en råvara först. Dra den hit, eller tryck på den och sedan på bunken.');
      }
      if (action === 'stir') stir();
      if (action === 'bake') bake();
    }
    if (current.gameId === 'cafe') {
      if (button.dataset.cafeItem && !current.served) {
        const id = button.dataset.cafeItem;
        if ((current.tray[id] || 0) < 3) current.tray[id] = (current.tray[id] || 0) + 1;
        sound('tap'); updateTray();
        feedback('På brickan: ' + trayDescription() + '.');
      }
      if (button.dataset.remove && !current.served) {
        const id = button.dataset.remove; current.tray[id] = Math.max(0, (current.tray[id] || 0) - 1); updateTray();
      }
      if (action === 'clear-tray' && !current.served) { current.tray = {}; updateTray(); feedback('Brickan är tom. Lyssna gärna på beställningen igen.'); }
      if (action === 'serve') serve();
      if (action === 'next-order' && current.served) {
        current.orderIndex++; current.tray = {}; current.served = false; current.revealed = false;
        if (current.orderIndex === 5) finish();
        else { renderCafe(); speakPrompt(); content.scrollTop = 0; }
      }
    }
    if (current.gameId === 'memory' && button.dataset.memoryKey) flipCard(button.dataset.memoryKey);
  }
  function start() {
    clearPending();
    current.screen = 'game'; current.finished = false; current.revealed = false;
    if (current.gameId === 'kitchen') current.kitchen = C.createKitchen(saved.recipe);
    if (current.gameId === 'cafe') Object.assign(current, { orders: C.createOrders(), orderIndex: 0, tray: {}, served: false, mistakes: 0 });
    if (current.gameId === 'memory') Object.assign(current, { cards: C.createMemory(), flipped: [], matched: [], turns: 0, locked: false });
    renderGame(); content.scrollTop = 0;
    if (current.gameId !== 'memory') speakPrompt();
    focusContent();
  }
  function focusContent() {
    const heading = $('.mg-instruction strong, .mg-memory-intro, .mg-result h3', dialog);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function renderGame() {
    if (current.gameId === 'kitchen') renderKitchen();
    if (current.gameId === 'cafe') renderCafe();
    if (current.gameId === 'memory') renderMemory();
  }
  function isHidden() { return saved.mode === 'listen' && !current.revealed; }
  function instruction(text, subtitle, thai) {
    const listening = isHidden();
    return `<div class="mg-instruction"><div class="mg-instruction-copy"><strong>${listening ? 'Lyssna. Vad ska du välja?' : escape(text)}</strong><small>${subtitle}</small>${!listening && thai ? `<span class="mg-th" lang="th">${escape(thai)}</span>` : ''}</div><div class="mg-instruction-actions"><button type="button" class="mg-listen-btn" data-action="speak" aria-label="Lyssna på uppgiften">${speaker} Lyssna</button><button type="button" class="mg-hint-btn" data-action="slow" aria-label="Lyssna långsamt">Långsamt</button>${saved.mode === 'listen' ? `<button type="button" class="mg-hint-btn" data-action="reveal">${current.revealed ? 'Dölj orden' : 'Visa orden'}</button>` : ''}</div></div>`;
  }
  function kitchenPrompt() {
    const state = current.kitchen;
    if (state.phase === 'collect') return 'Lägg ' + C.target(state).definite + ' i bunken.';
    if (state.phase === 'decorate') return state.index === 0 ? 'Lägg grädden på tårtan.' : 'Lägg jordgubben på tårtan.';
    if (state.phase === 'stir') return 'Rör om i bunken!';
    if (state.phase === 'ready') return 'Nu ska vi baka. Sätt in plåten i ugnen.';
    return 'Snart är det färdigt!';
  }
  function speakPrompt(slow = false) {
    if (!current) return;
    if (current.gameId === 'kitchen') say(kitchenPrompt(), slow);
    if (current.gameId === 'cafe') say(C.orderText(current.orders[current.orderIndex]), slow);
  }
  function renderKitchen() {
    const state = current.kitchen;
    const recipe = C.recipes[state.recipeId];
    const collecting = ['collect', 'decorate'].includes(state.phase);
    const done = state.learned.length;
    const total = recipe.steps.length + recipe.decorations.length;
    const target = collecting ? C.target(state) : null;
    content.className = 'mg-game-content mg-kitchen-game' + (isHidden() ? ' mg-listening' : '') + (state.phase === 'baking' ? ' mg-baking' : '');
    content.innerHTML = `${progress(recipe.name, done, total)}${collecting ? instruction(kitchenPrompt(), state.phase === 'decorate' ? 'Dags att dekorera. Välj och lägg på tårtan.' : 'Dra till bunken · eller välj och tryck på bunken.', target?.th) : ''}<div class="mg-scene">${A.kitchen()}<button type="button" class="mg-drop-zone" style="--mg-mix-fill:${Math.min(1, .15 + done * .12)}" data-action="bowl" aria-label="${state.phase === 'decorate' ? 'Lägg den valda råvaran på tårtan' : state.phase === 'stir' ? 'Rör om i bunken' : 'Lägg den valda råvaran i bunken'}" ${['baking', 'ready'].includes(state.phase) ? 'disabled' : ''}>${state.phase === 'decorate' ? A.cake(state.index > 0) : state.phase === 'baking' ? A.oven() : A.bowl()}</button><span class="mg-scene-tag">Bakat med lite svenska & mycket kärlek.</span></div>${collecting ? `<section class="mg-ingredients-section" aria-label="Välj bland 29 råvaror"><div class="mg-shelf-heading"><h3>Skafferiet <span>· 29 råvaror</span></h3><p>Välj en bild. Du får försöka så många gånger du vill.</p></div><div class="mg-ingredients-grid">${C.ingredients.map(item => `<button type="button" class="mg-ingredient ${state.learned.includes(item.id) ? 'mg-used' : ''}" data-ingredient="${item.id}" aria-label="Välj ${item.sv}" aria-pressed="${selected === item.id}">${A.icon(item.id)}<span class="mg-ingredient-label">${item.sv}</span><span class="mg-th" lang="th">${item.th}</span></button>`).join('')}</div></section>` : renderKitchenPhase()}${feedbackHTML(collecting ? 'Lyssna på uppgiften. Vilken råvara passar?' : state.phase === 'stir' ? 'Rör om fem gånger. Du bestämmer tempot.' : 'Vad fint det blir!')}${collecting ? `<div class="mg-selection-bar" hidden><span id="mg-selected-name"></span><button type="button" class="mg-primary" data-action="place-selected">${state.phase === 'decorate' ? 'Lägg på tårtan' : 'Lägg i bunken'} ↓</button></div>` : ''}`;
    if (collecting && selected) {
      $('.mg-selection-bar', dialog).hidden = false;
      $('#mg-selected-name', dialog).textContent = C.byId[selected].sv;
      $('.mg-drop-zone', dialog).classList.add('mg-drop-ready');
    }
  }
  function renderKitchenPhase() {
    const state = current.kitchen;
    if (state.phase === 'stir') return `<div class="mg-phase-panel"><h3>Nu rör vi om.</h3><p>”Röra om” betyder att blanda.<span class="mg-th" lang="th">คนส่วนผสมให้เข้ากัน</span></p><div class="mg-stir-dots" aria-label="${state.stirs} av 5 omrörningar">${Array.from({ length: 5 }, (_, i) => `<span class="${i < state.stirs ? 'filled' : ''}"></span>`).join('')}</div><button type="button" class="mg-primary" data-action="stir">Rör om · ${state.stirs} / 5</button></div>`;
    if (state.phase === 'ready') return '<div class="mg-phase-panel"><h3>Smeten är färdig!</h3><p>Nu är det dags för ugnen.<span class="mg-th" lang="th">ส่วนผสมพร้อมแล้ว นำเข้าเตาอบกันเลย</span></p><button type="button" class="mg-primary" data-action="bake">In i ugnen →</button></div>';
    return '<div class="mg-phase-panel"><span class="mg-eyebrow">Det doftar nybakat</span><h3>En liten stund i ugnen…</h3><div class="mg-baking-progress" role="status" aria-label="Bakar"></div><p>baka · ugnen · snart färdigt</p></div>';
  }
  function selectIngredient(id, keyboard = false) {
    if (!['collect', 'decorate'].includes(current.kitchen.phase)) return;
    selected = selected === id ? null : id;
    dialog.querySelectorAll('[data-ingredient]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.ingredient === selected)));
    $('.mg-drop-zone', dialog)?.classList.toggle('mg-drop-ready', !!selected);
    $('.mg-selection-bar', dialog).hidden = !selected;
    $('#mg-selected-name', dialog).textContent = selected ? C.byId[id].sv : '';
    if (selected) { sound('tap'); say(C.byId[id].sv); feedback(C.byId[id].sv + ' är vald. Tryck på ' + (current.kitchen.phase === 'decorate' ? 'tårtan' : 'bunken') + ' för att lägga i.');
      if (keyboard) $('[data-action="place-selected"]', dialog)?.focus({ preventScroll: true }); }
    else feedback('Valet är borttaget. Välj en annan råvara.');
  }
  function placeIngredient(id) {
    const state = current.kitchen;
    const target = C.target(state);
    const result = C.addIngredient(state, id);
    selected = null;
    if (result === 'inactive') return;
    if (result === 'retry') {
      dialog.querySelectorAll('[data-ingredient]').forEach(el => el.setAttribute('aria-pressed', 'false'));
      $('.mg-drop-zone', dialog)?.classList.remove('mg-drop-ready');
      $('.mg-selection-bar', dialog).hidden = true;
      sound('retry');
      animate($(`[data-ingredient="${id}"]`, dialog), 'mg-reject');
      feedback(`Det var ${C.byId[id].sv}. ${isHidden() ? 'Lyssna en gång till och prova igen.' : 'Vi letar efter ' + target.definite + '. Prova igen!'}`, 'retry');
      return;
    }
    sound('correct');
    current.revealed = false;
    if (state.phase === 'done') return finish();
    renderKitchen();
    animate($('.mg-drop-zone', dialog), 'mg-land');
    const drop = document.createElement('span'); drop.className = 'mg-ingredient-drop'; drop.innerHTML = A.icon(id);
    $('.mg-drop-zone', dialog)?.appendChild(drop); later(() => drop.remove(), 650);
    feedback('Precis! ' + C.byId[id].sv + ' · ' + C.byId[id].th, 'correct');
    speakPrompt();
    focusContent();
  }
  function stir() {
    if (!C.stir(current.kitchen)) return;
    sound('tap'); renderKitchen();
    animate($('.mg-drop-zone', dialog), 'mg-stirring');
    if (current.kitchen.phase === 'ready') say('Smeten är färdig. Nu ska vi baka!');
    else feedback('Rör om · ' + current.kitchen.stirs + ' av 5', 'correct');
  }
  function bake() {
    if (!C.bake(current.kitchen)) return;
    renderKitchen(); sound('tap');
    later(() => {
      C.finishBaking(current.kitchen);
      if (current.kitchen.phase === 'done') finish();
      else { renderKitchen(); say('Tårtan är färdig. ' + kitchenPrompt()); }
    }, 2400);
  }

  /* Pointer dragging for mouse and pen. Touch uses the same accessible two-tap
     path as keyboard, so all 29 objects remain easy to scroll on a phone. */
  function pointerDown(event) {
    const item = event.target.closest('[data-ingredient]');
    if (!item || event.pointerType === 'touch' || event.button !== 0 || current?.screen !== 'game') return;
    if (!['collect', 'decorate'].includes(current.kitchen?.phase)) return;
    gestureController?.abort();
    gestureController = new AbortController();
    const options = { signal: gestureController.signal };
    dragging = { id: item.dataset.ingredient, x: event.clientX, y: event.clientY, active: false, ghost: null, pointerId: event.pointerId };
    document.addEventListener('pointermove', pointerMove, options);
    document.addEventListener('pointerup', pointerUp, options);
    document.addEventListener('pointercancel', cancelGesture, options);
    window.addEventListener('blur', cancelGesture, options);
  }
  function pointerMove(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    if (!dragging.active && Math.hypot(event.clientX - dragging.x, event.clientY - dragging.y) < 6) return;
    event.preventDefault();
    if (!dragging.active) {
      dragging.active = true;
      dragging.ghost = document.createElement('div');
      dragging.ghost.className = 'mg-drag-ghost';
      dragging.ghost.innerHTML = A.icon(dragging.id);
      // Native modal dialogs are in the top layer; the ghost must be inside.
      dialog.appendChild(dragging.ghost);
      $('.mg-drop-zone', dialog)?.classList.add('mg-drop-ready');
    }
    dragging.ghost.style.left = event.clientX + 'px';
    dragging.ghost.style.top = event.clientY + 'px';
    $('.mg-drop-zone', dialog)?.classList.toggle('mg-drop-hover', overBowl(event.clientX, event.clientY));
  }
  function overBowl(x, y) {
    const rect = $('.mg-drop-zone', dialog)?.getBoundingClientRect();
    return !!rect && x >= rect.left - 15 && x <= rect.right + 15 && y >= rect.top - 10 && y <= rect.bottom + 10;
  }
  function pointerUp(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;
    const { id, active } = dragging;
    const dropped = active && overBowl(event.clientX, event.clientY);
    cleanupDrag(); gestureController?.abort(); gestureController = null;
    if (active) {
      suppressClick = true;
      later(() => { suppressClick = false; }, 100);
      if (dropped) placeIngredient(id);
      else animate($(`[data-ingredient="${id}"]`, dialog), 'mg-reject');
    }
  }
  function cancelGesture() { cleanupDrag(); gestureController?.abort(); gestureController = null; }
  function cleanupDrag() {
    dragging?.ghost?.remove(); dragging = null;
    dialog?.querySelector('.mg-drop-zone')?.classList.remove('mg-drop-ready', 'mg-drop-hover');
  }

  function customer(index) {
    const shirts = ['#b6bf9c', '#ceaa9d', '#a1b9be', '#d8bd81', '#b7a8bd'];
    return `<svg class="mg-customer" viewBox="0 0 100 120" fill="none" stroke="#826b53" stroke-width="1.5" aria-hidden="true"><path d="M10 118q2-39 40-38 37 1 40 38" fill="${shirts[index]}"/><path d="M41 74v13q9 8 18 0V74" fill="#e4bd9a"/><ellipse cx="50" cy="48" rx="28" ry="34" fill="#e8c6a2"/><path d="M22 49Q6 10 46 7q41-2 33 41l-7-21q-25 17-43 0z" fill="${index % 2 ? '#a18163' : '#66594b'}"/><path d="M38 49h1m22 0h1" stroke-width="3"/><path d="M42 64q8 7 16 0" fill="none"/><path d="m26 95 12 16m36-16-12 16" stroke="#fff6df"/></svg>`;
  }
  function renderCafe() {
    const order = current.orders[current.orderIndex];
    const thai = order.map(({ id, count }) => count + ' ' + C.cafeItems.find(item => item.id === id).th).join(' + ');
    content.className = 'mg-game-content mg-cafe-game';
    content.innerHTML = `${progress('Dagens gäster', current.orderIndex, 5)}${instruction('Vad vill gästen ha?', 'Välj rätt antal på menyn. Tryck sedan på ”Servera”.', 'เลือกให้ครบจำนวน แล้วกดเสิร์ฟ')}<div class="mg-cafe-stage"><div class="mg-cafe-awning"></div><div class="mg-customer-row">${customer(current.orderIndex)}<div class="mg-order-bubble">${isHidden() ? '”Lyssna på min beställning…”' : '”' + escape(C.orderText(order)) + '”'}${!isHidden() ? `<span class="mg-th" lang="th">${thai}</span>` : ''}</div></div></div><div class="mg-cafe-menu" aria-label="Fikameny">${C.cafeItems.map(item => `<button type="button" class="mg-menu-item" data-cafe-item="${item.id}" aria-label="Lägg till ${item.sv}" ${current.served ? 'disabled' : ''}>${A.icon(item.art)}<span>${isHidden() ? 'Välj' : item.sv}</span>${!isHidden() ? `<span class="mg-th" lang="th">${item.th}</span>` : ''}<span class="mg-menu-count" data-count="${item.id}" hidden>0</span></button>`).join('')}</div><div class="mg-tray"><span class="mg-tray-label">Din fikabricka</span><div class="mg-tray-items" id="mg-tray-items"></div></div><div class="mg-cafe-actions"><button type="button" class="mg-secondary" data-action="clear-tray" ${current.served ? 'disabled' : ''}>Töm brickan</button><button type="button" class="mg-primary" data-action="serve" ${current.served ? 'disabled' : ''}>Servera →</button></div>${feedbackHTML(current.served ? 'Tack så mycket! Precis vad jag ville ha.' : 'Du kan ta bort en sak med minusknappen på brickan.')}${current.served ? `<div class="mg-order-next"><button type="button" class="mg-primary" data-action="next-order">${current.orderIndex === 4 ? 'Stäng fiket & se dina ord' : 'Nästa gäst →'}</button></div>` : ''}`;
    updateTray();
  }
  function trayDescription() {
    return C.cafeItems.filter(item => current.tray[item.id]).map(item => current.tray[item.id] + ' × ' + item.sv).join(', ') || 'ingenting';
  }
  function updateTray() {
    const tray = $('#mg-tray-items', dialog);
    const items = C.cafeItems.filter(item => current.tray[item.id]);
    tray.innerHTML = items.length ? items.map(item => `<span class="mg-tray-item">${A.icon(item.art)}<span aria-label="${current.tray[item.id]} ${item.sv}">× ${current.tray[item.id]}</span><button type="button" class="mg-tray-remove" data-remove="${item.id}" aria-label="Ta bort en ${item.sv.replace(/^(en|ett) /, '')}" ${current.served ? 'disabled' : ''}>−</button></span>`).join('') : '<span class="mg-tray-empty">En liten bricka att fylla.</span>';
    for (const item of C.cafeItems) {
      const count = $(`[data-count="${item.id}"]`, dialog);
      count.textContent = current.tray[item.id] || 0; count.hidden = !current.tray[item.id];
    }
  }
  function serve() {
    if (current.served) return;
    if (!C.checkOrder(current.orders[current.orderIndex], current.tray)) {
      current.mistakes++; sound('retry'); animate($('.mg-tray', dialog), 'mg-reject');
      feedback('Nästan! Kontrollera både sort och antal. Du kan ta bort något med minus, eller lyssna igen.', 'retry'); return;
    }
    current.served = true; sound('correct'); renderCafe();
    feedback('Tack så mycket! Precis vad jag ville ha.', 'correct'); say('Tack så mycket! Vad gott!');
    $('[data-action="next-order"]', dialog)?.focus({ preventScroll: true });
  }

  function renderMemory() {
    content.className = 'mg-game-content mg-memory-game';
    content.innerHTML = `${progress('Hitta bild + ord', current.matched.length, 6)}<p class="mg-memory-intro">${isHidden() ? 'Vänd två kort. Lyssna på ordet och hitta bilden som passar.' : 'Vänd två kort. En bild och dess svenska ord bildar ett par.'}<span class="mg-th" lang="th">จับคู่รูปภาพกับคำภาษาสวีเดน</span>${saved.mode === 'listen' ? `<button type="button" class="mg-hint-btn" data-action="reveal">${current.revealed ? 'Dölj orden' : 'Visa orden'}</button>` : ''}</p><div class="mg-memory-grid" aria-label="Tolv kort på en fotogirlang">${current.cards.map((card, i) => memoryCard(card, i)).join('')}</div>${feedbackHTML('Börja var du vill. Sex små par väntar på dig.')}`;
  }
  function memoryFront(card, item, matched) {
    if (card.type === 'picture') return A.icon(card.id) + '<small>en bild</small>';
    if (isHidden() && !matched) return `<span class="mg-memory-listen">${speaker}<span>Lyssna</span></span><small>tryck igen för att höra</small>`;
    return `<strong>${item.sv}</strong><span class="mg-th" lang="th">${item.th}</span><small>ett ord</small>`;
  }
  function memoryCard(card, index) {
    const item = C.memoryItems.find(entry => entry.id === card.id);
    const matched = current.matched.includes(card.id);
    const flipped = matched || current.flipped.includes(card.key);
    return `<button type="button" class="mg-memory-card ${matched ? 'mg-matched' : ''}" style="--tilt:${[-3, 2, -2, 3, 1, -3][index % 6]}deg" data-memory-key="${card.key}" aria-pressed="${flipped}" aria-label="${flipped ? (card.type === 'picture' ? 'Bild: ' : '') + item.sv + (matched ? ', hittat par' : '') : 'Vänd kort ' + (index + 1)}" ${matched || current.locked ? 'disabled' : ''}><span class="mg-memory-flipper"><span class="mg-memory-back" aria-hidden="${flipped}"><span>${index + 1}</span></span><span class="mg-memory-front" aria-hidden="${!flipped}">${memoryFront(card, item, matched)}</span></span></button>`;
  }
  function updateMemoryCards() {
    for (const card of current.cards) {
      const item = C.memoryItems.find(entry => entry.id === card.id);
      const el = $(`[data-memory-key="${card.key}"]`, dialog);
      const matched = current.matched.includes(card.id);
      const flipped = matched || current.flipped.includes(card.key);
      el.classList.toggle('mg-matched', matched);
      el.setAttribute('aria-pressed', String(flipped));
      el.setAttribute('aria-label', flipped ? (card.type === 'picture' ? 'Bild: ' : '') + item.sv + (matched ? ', hittat par' : '') : 'Vänd kort ' + (current.cards.indexOf(card) + 1));
      $('.mg-memory-back', el).setAttribute('aria-hidden', String(flipped));
      $('.mg-memory-front', el).setAttribute('aria-hidden', String(!flipped));
      $('.mg-memory-front', el).innerHTML = memoryFront(card, item, matched);
      el.disabled = matched || current.locked;
    }
    const track = $('[role="progressbar"]', dialog);
    track.setAttribute('aria-valuenow', current.matched.length);
    $('.mg-progress-fill', dialog).style.width = current.matched.length / 6 * 100 + '%';
    $('.mg-game-progress > span:last-child', dialog).textContent = current.matched.length + ' / 6';
  }
  function flipCard(key) {
    const card = current.cards.find(entry => entry.key === key);
    if (current.locked || !card || current.matched.includes(card.id)) return;
    if (current.flipped.includes(key)) {
      if (card.type === 'word' || saved.mode === 'read') say(C.memoryItems.find(item => item.id === card.id).sv);
      return;
    }
    current.flipped.push(key); sound('tap');
    const word = C.memoryItems.find(item => item.id === card.id);
    // In listening mode a picture stays silent until matched, so its spoken
    // name doesn't give away the matching word. Word cards always speak.
    if (card.type === 'word' || saved.mode === 'read') say(word.sv);
    updateMemoryCards();
    if (current.flipped.length < 2) return;
    current.turns++;
    const [first, second] = current.flipped.map(id => current.cards.find(entry => entry.key === id));
    current.locked = true;
    updateMemoryCards();
    if (C.isPair(first, second)) {
      current.matched.push(card.id); current.flipped = [];
      sound('match'); say(word.sv, true); updateMemoryCards();
      feedback('Ett par! ' + word.sv + ' · ' + word.th, 'correct');
      later(() => {
        current.locked = false;
        if (current.matched.length === 6) finish();
        else { updateMemoryCards(); $('.mg-memory-card:not(:disabled)', dialog)?.focus({ preventScroll: true }); }
      }, 650);
    } else {
      feedback('De hör inte ihop ännu. Titta en liten stund och prova igen.');
      later(() => { current.flipped = []; current.locked = false; updateMemoryCards(); }, 1500);
    }
  }

  function finish() {
    if (current.finished) return;
    current.finished = true; current.screen = 'result';
    const gameId = current.gameId;
    const key = gameId === 'kitchen' ? 'kitchen-' + current.kitchen.recipeId : gameId;
    const firstTime = !(saved.completed[key] > 0);
    saved.completed[key] = (saved.completed[key] || 0) + 1; persist();
    // Full reward on the first completed activity, a small practice reward later.
    const xp = firstTime ? 25 : 5;
    window.GameEngine?.StateManager?.addXP(xp);
    let words;
    if (gameId === 'kitchen') words = current.kitchen.learned.map(id => ({ ...C.byId[id], art: id }));
    else if (gameId === 'cafe') words = C.cafeItems.filter(item => current.orders.some(order => order.some(entry => entry.id === item.id)));
    else words = C.memoryItems.map(item => ({ ...item, art: item.id }));
    const title = gameId === 'kitchen' ? (current.kitchen.recipeId === 'cake' ? 'Grattis! Du har bakat en tårta.' : 'Nygräddade chokladkakor!') : gameId === 'cafe' ? 'Fem gäster. Många fina ord.' : 'Alla ord har hittat hem.';
    const message = gameId === 'kitchen' ? 'Du har lyssnat, valt, blandat och bakat på svenska. Här är orden du tog med dig från köket.' : gameId === 'cafe' ? 'Du har förstått beställningar och räknat på svenska. Nu tar vi en välförtjänt fika.' : 'En bild och ett ord blir ett litet minne. Tryck på dina ord och lyssna igen.';
    content.className = 'mg-game-content';
    content.innerHTML = `<div class="mg-result"><span class="mg-result-stamp">EN LITEN STUND SVENSKA, AVKLARAD ✓</span><div class="mg-result-art">${gameId === 'kitchen' ? current.kitchen.recipeId === 'cake' ? A.cake() : A.icon('cookies') : A.icon(gameId === 'cafe' ? 'coffee' : 'flower')}</div><h3>${title}</h3><p>${message}</p><div class="mg-result-reward">+${xp} XP · ${firstTime ? 'Första gången du klarar den här aktiviteten' : 'En ny liten stund av övning'}</div><span class="mg-eyebrow">Dina ord · tryck för att lyssna</span><div class="mg-word-album">${words.map(word => `<button type="button" class="mg-album-word" data-action="word" data-word="${escape(word.sv)}" aria-label="Lyssna på ${escape(word.sv)}">${A.icon(word.art)}<span>${word.sv}</span><span class="mg-th" lang="th">${word.th}</span></button>`).join('')}</div><div class="mg-result-actions"><button type="button" class="mg-primary" data-action="again">${gameId === 'kitchen' ? 'Baka något mer' : 'Spela en gång till'}</button><button type="button" class="mg-secondary" data-action="close">Till småspelen</button></div></div>`;
    sound('fanfare');
    content.scrollTop = 0; focusContent(); confetti(); renderLobby();
  }
  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const layer = document.createElement('div'); layer.className = 'mg-confetti'; layer.setAttribute('aria-hidden', 'true');
    const colors = ['#9bb091', '#ddbd7a', '#d9a69a', '#9bb8bd', '#d5c2a2'];
    layer.innerHTML = Array.from({ length: 32 }, (_, i) => `<i style="left:${i * 3.2}%;background:${colors[i % colors.length]};animation-delay:${Math.random() * .6}s;transform:rotate(${i * 23}deg)"></i>`).join('');
    $('.mg-result', dialog).appendChild(layer);
    later(() => layer.remove(), 3200);
  }
  window.SmallGames = { open, close, renderLobby };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Nattnyckeln — a Swedish, story-led hidden-animal escape room. */
(function () {
  'use strict';
  const C = window.ZooCore, A = window.ZooArt;
  const KEY = 'wilawan_nattnyckeln_v1';
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const profile = read();
  let state = profile.run, dialog, opener, screen = 'intro', panel = 'search', selectedTrack, inspected;
  let zoom = 1, roomViews = {}, pulseId = null, pulseTimer = null, message = '', tone = '';
  let pointerStart = null;
  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY)) || {};
      return { run: C.restore(data.run), completed: Number.isSafeInteger(data.completed) && data.completed >= 0 ? data.completed : 0,
        thai: data.thai === true, rewardedRun: Number.isFinite(data.rewardedRun) ? data.rewardedRun : null };
    } catch (_) { return { run: null, completed: 0, thai: false, rewardedRun: null }; }
  }
  function save() {
    profile.run = state;
    try { localStorage.setItem(KEY, JSON.stringify(profile)); } catch (_) { /* A full game also works without storage. */ }
  }
  function sound(id) { window.SpeechEngine?.playSound?.(id); }
  function tracks() { return state.trackOrder[C.rooms[state.room].id]; }
  function say(text, slow = false) { window.SpeechEngine?.speakSwedish?.(text, slow ? .6 : .88); }
  function stop() {
    clearTimeout(pulseTimer); pulseTimer = null; pulseId = null;
    pointerStart?.viewport?.classList.remove('ze-panning'); pointerStart = null;
    window.SpeechEngine?.stopAudio?.();
  }
  function open(returnTarget) {
    opener = returnTarget || document.activeElement;
    if (!dialog) {
      dialog = document.createElement('dialog'); dialog.className = 'ze-dialog';
      dialog.setAttribute('aria-labelledby', 'ze-title'); document.body.appendChild(dialog);
      dialog.addEventListener('click', onClick);
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      dialog.addEventListener('close', () => { stop(); (opener?.isConnected ? opener : $('[data-open-game="zoo"]'))?.focus(); });
      if (window.ResizeObserver) new ResizeObserver(() => { if (dialog.open && screen === 'play') fitWorld(); }).observe(dialog);
      dialog.addEventListener('pointerdown', event => {
        const viewport = event.target.closest('.ze-viewport');
        pointerStart = { x: event.clientX, y: event.clientY, viewport: event.pointerType === 'mouse' && event.button === 0 ? viewport : null,
          left: viewport?.scrollLeft || 0, top: viewport?.scrollTop || 0, pointerId: event.pointerId, moved: false };
      });
      dialog.addEventListener('pointermove', event => {
        const gesture = pointerStart;
        if (!gesture?.viewport || !event.buttons) return;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        if (!gesture.moved && Math.hypot(dx, dy) < 7) return;
        gesture.moved = true; event.preventDefault();
        if (!gesture.viewport.hasPointerCapture(event.pointerId)) gesture.viewport.setPointerCapture(event.pointerId);
        gesture.viewport.classList.add('ze-panning');
        gesture.viewport.scrollLeft = gesture.left - dx; gesture.viewport.scrollTop = gesture.top - dy;
      });
      dialog.addEventListener('pointerup', event => {
        const gesture = pointerStart;
        pointerStart = null;
        gesture?.viewport?.classList.remove('ze-panning');
        if (gesture?.viewport?.hasPointerCapture(event.pointerId)) gesture.viewport.releasePointerCapture(event.pointerId);
        if (gesture?.moved) { captureView(); return; }
        if (!event.target.closest('.ze-world') || event.target.closest('button') || !gesture) return;
        if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 8) notify('Bara löv och skuggor här. Förstora bilden och följ konturerna.');
      });
      dialog.addEventListener('pointercancel', () => { pointerStart?.viewport?.classList.remove('ze-panning'); pointerStart = null; });
    }
    stop(); screen = 'intro'; panel = 'search'; inspected = null; message = ''; tone = '';
    if (!dialog.open) dialog.showModal();
    renderIntro();
  }
  function close() { save(); stop(); if (dialog?.open) dialog.close(); window.SmallGames?.renderLobby(); }
  function header(intro = false) {
    return `<header class="ze-header"><button type="button" class="ze-icon-button" data-ze="close" aria-label="Tillbaka till småspelen">←</button><div class="ze-brand"><span>BJÖRKGLÄNTANS DJURPARK</span><h2 id="ze-title">Nattnyckeln</h2></div><div class="ze-header-actions">${!intro ? `<span class="ze-found-count">${A.icon('eye')} ${state.found.length}<small>/ 12</small></span><button type="button" class="ze-icon-button ${panel === 'journal' ? 'active' : ''}" data-ze="journal" aria-label="Öppna fältboken">${A.icon('book')}</button><button type="button" class="ze-icon-button ${panel === 'map' ? 'active' : ''}" data-ze="map" aria-label="Visa parkens karta">${A.icon('compass')}</button>` : ''}<button type="button" class="ze-language" data-ze="thai" aria-label="Thailändskt stöd" aria-pressed="${profile.thai}">ไทย</button></div></header>`;
  }
  function applyClasses() {
    dialog.className = 'ze-dialog' + (profile.thai ? ' ze-thai' : '') + (state?.hard !== false ? ' ze-hard' : '') + (state?.lamp ? ' ze-lamp-on' : '');
  }
  function renderIntro() {
    applyClasses();
    const canResume = state?.status === 'playing';
    dialog.innerHTML = `${header(true)}<div class="ze-intro">${A.image('forest', 'ze-intro-image')}<div class="ze-intro-vignette"></div><div class="ze-intro-copy"><span class="ze-kicker">ETT SVENSKT MYSTERIUM · TRE KAPITEL</span><h1>Parken har stängt.<br><em>Spåren finns kvar.</em></h1><p class="ze-intro-prologue">21.47. Sommarstormen har tystnat. Men strömmen är borta, personalgrinden är låst och din första kvällsrond är långt ifrån över.</p><div class="ze-letter"><span class="ze-letter-label">ETT MEDDELANDE FRÅN SIGNE</span><p>”Jag är i nattstallet. Reservnyckeln finns i vinterträdgården. Vaktmästaren lämnade tre mekaniska lås längs vägen. Följ mina anteckningar, hitta djuren och läs platserna där de gömmer sig. Vi ses vid grinden.”</p><span class="ze-signature">— Signe, parkvakt</span></div><p class="ze-th" lang="th">ไฟดับและประตูสวนสัตว์ล็อกอยู่ ค้นหาสัตว์ที่ซ่อนอยู่ทั้ง 12 ตัว อ่านคำใบ้ภาษาสวีเดน แล้วไขปริศนา 3 ด่านเพื่อหากุญแจสำรอง</p><div class="ze-intro-meta"><span>${A.icon('eye')} 12 dolda djur</span><span>${A.icon('lock')} 3 olika lås</span><span>${A.icon('moon')} Ingen nedräkning</span></div><div class="ze-intro-buttons">${canResume ? `<button type="button" class="ze-primary" data-ze="resume">Fortsätt kvällsronden <span>${state.found.length}/12 →</span></button><button type="button" class="ze-text-button" data-ze="new-confirm">Börja en ny omgång</button>` : `<button type="button" class="ze-primary" data-ze="new">Öppna fältboken ${A.icon('book')}</button>`}</div><p class="ze-intro-footnote">En berättelse att spela på svenska. Lyssna, undersök och lägg märke till det lilla.</p></div><div class="ze-intro-seal">${A.icon('key')}<span>Tre sigill.<br>En väg ut.</span></div></div>`;
  }
  function start(fresh) {
    if (fresh || !state) { state = C.create(); roomViews = {}; }
    screen = state.status === 'escaped' ? 'ending' : 'play'; panel = 'search'; inspected = null; zoom = 1;
    selectedTrack = tracks().find(id => !state.found.includes(id)) || tracks()[0];
    message = 'Förstora bilden för att undersöka. Dra med musen eller svep över bilden för att se dig omkring.'; tone = '';
    save(); if (screen === 'ending') renderEnding(); else renderGame();
  }
  function captureView() {
    const viewport = $('.ze-viewport', dialog);
    if (viewport && state) roomViews[state.room] = { x: viewport.scrollLeft, y: viewport.scrollTop, zoom };
  }
  function renderGame() {
    const previousFocus = dialog.contains(document.activeElement) ? document.activeElement : null;
    const focusAction = previousFocus?.dataset?.ze;
    const focusKey = ['digit', 'word', 'step', 'index', 'animal'].find(key => previousFocus?.dataset?.[key] !== undefined);
    const focusValue = focusKey ? previousFocus.dataset[focusKey] : null;
    const bodyScroll = $('.ze-game-body', dialog)?.scrollTop || 0;
    const sidebarScroll = $('.ze-sidebar', dialog)?.scrollTop || 0;
    captureView(); applyClasses();
    const room = C.rooms[state.room];
    const count = C.foundInRoom(state).length;
    const isSolved = state.solved.includes(room.id);
    dialog.innerHTML = `${header()}<div class="ze-game-body"><main class="ze-stage"><div class="ze-chapter-row"><div><span class="ze-kicker">KAPITEL ${room.chapter} / 03</span><h3>${room.title}</h3></div><span class="ze-chapter-found">${count} av 4 spår säkrade ${count === 4 ? '✓' : ''}</span></div><div class="ze-viewport" aria-label="${room.title}. Förstora bilden och leta efter fyra dolda djur."><div class="ze-world" style="--ze-zoom:${zoom}">${A.image(room.id, 'ze-background')}<div class="ze-world-atmosphere" aria-hidden="true"></div>${room.animals.map((id, i) => animalButton(C.byId[id], i)).join('')}${A.foreground(room.id)}<div class="ze-fireflies" aria-hidden="true">${Array.from({ length: 7 }, (_, i) => `<i style="--n:${i};left:${12 + i * 13}%;top:${28 + i % 3 * 18}%"></i>`).join('')}</div></div></div><div class="ze-stage-controls"><div class="ze-zoom-controls"><button type="button" data-ze="zoom-out" aria-label="Förminska bilden" ${zoom <= 1 ? 'disabled' : ''}>−</button><span>${Math.round(zoom * 100)}%</span><button type="button" data-ze="zoom-in" aria-label="Förstora bilden" ${zoom >= 3 ? 'disabled' : ''}>+</button></div><button type="button" class="ze-tool-button" data-ze="difficulty" aria-pressed="${!state.hard}" title="Gör djurens konturer något tydligare">${A.icon('eye')} ${state.hard ? 'Midnatt · svår' : 'Skymning · tydligare'}</button>${state.solved.length >= 2 ? `<button type="button" class="ze-tool-button ${state.lamp ? 'active' : ''}" data-ze="lamp" aria-pressed="${state.lamp}">${A.icon('lamp')} Nattlampa</button>` : `<span class="ze-pan-tip">${A.icon('lens')} Förstora & undersök</span>`}</div><div id="ze-status" class="ze-status" role="status" aria-live="polite" data-tone="${tone}">${esc(message || 'Följ spåren. I den här parken är en kontur sällan hela sanningen.')}</div><div class="ze-radio"><div class="ze-radio-portrait">${A.portrait()}</div><div><span class="ze-radio-name">SIGNE <small>· PARKRADION</small></span><p>${room.story}</p><p class="ze-th" lang="th">${room.th}</p><button type="button" class="ze-text-button" data-ze="radio">${A.icon('sound')} Lyssna på radion</button></div></div><div class="ze-inventory" aria-label="Dina föremål"><span>RYGGSÄCK</span><button type="button" data-ze="journal">${A.icon('book')} Fältbok</button>${state.solved.length >= 1 ? `<button type="button" data-ze="binoculars">${A.icon('lens')} Kikare</button>` : ''}${state.solved.length >= 2 ? `<button type="button" data-ze="lamp">${A.icon('lamp')} Nattlampa</button>` : ''}<div class="ze-sigils" aria-label="${state.solved.length} av 3 sigill">${C.rooms.map((r, i) => `<span class="${state.solved.includes(r.id) ? 'earned' : ''}" title="${r.reward}">${A.icon(['leaf', 'water', 'flower'][i])}</span>`).join('')}</div></div></main><aside class="ze-sidebar" aria-label="Fältbok och ledtrådar">${renderPanel(room, count, isSolved)}</aside></div>`;
    const viewport = $('.ze-viewport', dialog), view = roomViews[state.room];
    fitWorld();
    if (view) { viewport.scrollLeft = view.x; viewport.scrollTop = view.y; }
    $('.ze-game-body', dialog).scrollTop = bodyScroll;
    $('.ze-sidebar', dialog).scrollTop = sidebarScroll;
    const feedbackAnchor = $('[data-ze="try-lock"]', dialog) || $('.ze-answer-choices', dialog);
    if (feedbackAnchor) {
      const localStatus = document.createElement('div'); localStatus.id = 'ze-panel-status'; localStatus.className = 'ze-panel-status';
      localStatus.dataset.tone = tone; localStatus.hidden = !tone; localStatus.textContent = message;
      feedbackAnchor.after(localStatus);
    }
    if (focusAction) {
      const selector = `[data-ze="${CSS.escape(focusAction)}"]` + (focusKey ? `[data-${focusKey}="${CSS.escape(focusValue)}"]` : '');
      const replacement = $(selector, dialog);
      const fallback = panel === 'puzzle' ? $('[data-ze="word"]:not(:disabled), [data-ze="step"]:not(:disabled), [data-ze="try-lock"]:not(:disabled)', dialog) : null;
      (replacement && !replacement.disabled ? replacement : fallback)?.focus({ preventScroll: true });
    }
  }
  function animalButton(animal, index) {
    const found = state.found.includes(animal.id);
    return `<button type="button" class="ze-animal ${found ? 'ze-found' : ''} ${pulseId === animal.id ? 'ze-hint-pulse' : ''}" data-ze="inspect" data-animal="${animal.id}" aria-label="${found ? 'Återse ' + animal.sv : 'Undersök spår ' + (tracks().indexOf(animal.id) + 1) + ': ' + animal.clue}" style="left:${animal.x / 12}%;top:${animal.y / 8}%;width:${animal.w / 12}%;height:${animal.h / 8}%">${A.animal(animal.id)}${found ? `<span class="ze-found-pin">${A.icon('check')}</span>` : ''}</button>`;
  }
  function renderPanel(room, count, isSolved) {
    if (panel === 'map') return renderMap();
    if (panel === 'journal') return renderJournal();
    if (panel === 'puzzle') return renderPuzzle(room, count, isSolved);
    if (panel === 'found' && inspected) return renderDiscovery(C.byId[inspected]);
    const target = C.byId[selectedTrack] || C.byId[room.animals[0]];
    const already = state.found.includes(target.id);
    const hintCount = state.hints[target.id] || 0;
    return `<div class="ze-panel-head"><span class="ze-kicker">SIGNE HAR LÄMNAT FYRA SPÅR</span><h3>Det gömda livet.</h3><p>Välj ett spår. Sök i bilden. När du hittar något behöver du också veta vad det heter.</p></div><div class="ze-track-tabs" role="group" aria-label="Välj ett spår att följa">${tracks().map((id, i) => `<button type="button" data-ze="track" data-animal="${id}" aria-pressed="${selectedTrack === id}" aria-label="Spår ${i + 1}${state.found.includes(id) ? ', hittat' : ''}">${state.found.includes(id) ? '✓' : '0' + (i + 1)}</button>`).join('')}</div><div class="ze-clue"><span class="ze-paper-label">SPÅR ${tracks().indexOf(target.id) + 1}</span><p>${already ? target.sentence : target.clue}</p>${already ? `<span class="ze-clue-stamp">ANTECKNAT I FÄLTBOKEN</span>` : ''}<button type="button" class="ze-text-button" data-ze="listen-clue">${A.icon('sound')} Lyssna långsamt</button></div>${!already ? `<div class="ze-hint-area">${hintCount ? `<p class="ze-hint-copy">${target.hints[hintCount - 1]}</p>` : '<p>Varje spår har tre steg av hjälp. Den sista ledtråden visar ett litet område i bilden.</p>'}<button type="button" class="ze-secondary" data-ze="hint">${hintCount >= 3 ? 'Visa området igen' : 'Be Signe om en ledtråd'} <span>${Math.min(3, hintCount + 1)} / 3</span></button></div>` : ''}<div class="ze-panel-bottom"><div class="ze-dots">${tracks().map(id => `<span class="${state.found.includes(id) ? 'filled' : ''}"></span>`).join('')}</div><button type="button" class="ze-primary" data-ze="puzzle">${A.icon(isSolved ? 'check' : 'lock')} ${isSolved ? 'Grinden är öppen' : count === 4 ? 'Undersök låset' : 'Se områdets lås'} <span>→</span></button></div>`;
  }
  function renderDiscovery(animal) {
    const found = state.found.includes(animal.id);
    return `<div class="ze-panel-head"><span class="ze-kicker">${found ? 'ETT SPÅR SÄKRAT' : 'NÅGOT RÖR SIG I SKUGGAN'}</span><h3>${found ? animal.sv : 'Vad har du hittat?'}</h3></div><div class="ze-discovery-art">${A.animal(animal.id)}</div>${found ? `<div class="ze-discovery-note"><p>${animal.sentence}</p><p class="ze-th" lang="th">${animal.th}</p><button type="button" class="ze-text-button" data-ze="listen-animal">${A.icon('sound')} Lyssna på meningen</button><div class="ze-field-note"><span>${state.room === 0 ? 'MÄSSINGSMÄRKE' : 'UR SIGNES FÄLTBOK'}</span>${state.room === 0 ? `<strong class="ze-mark-digit">${state.marks[animal.id]}</strong>` : ''}<p>${animal.note}</p></div></div><button type="button" class="ze-primary" data-ze="search">${C.foundInRoom(state).length === 4 ? 'Alla fyra hittade · till låset →' : 'Fortsätt undersöka →'}</button>` : `<p class="ze-discovery-question">Välj djurets svenska namn.</p><div class="ze-answer-choices">${animal.choices.map(choice => `<button type="button" data-ze="identify" data-answer="${esc(choice)}">${choice}</button>`).join('')}</div><p class="ze-th ze-identify-translation" lang="th">${animal.th}</p><button type="button" class="ze-text-button" data-ze="search">Tillbaka till bilden</button>`}`;
  }
  function renderJournal() {
    return `<div class="ze-panel-head"><span class="ze-kicker">SIGNES FÄLTBOK</span><h3>Kvällens fynd.</h3><p>Ord, platser och ledtrådar. Tryck på en anteckning för att lyssna.</p></div><div class="ze-journal-list">${C.rooms.map(room => `<section><h4>${room.title} <span>${C.foundInRoom(state, C.rooms.indexOf(room)).length}/4</span></h4>${state.found.filter(id => C.byId[id].room === room.id).map(id => {
      const animal = C.byId[id];
      return `<button type="button" class="ze-journal-entry" data-ze="journal-word" data-animal="${id}">${A.animal(id)}<span><strong>${animal.sv}</strong><span>${animal.sentence}</span><small>${room.id === 'forest' ? 'Märke ' + state.marks[id] + ' · ' : ''}${animal.note}</small><span class="ze-th" lang="th">${animal.th}</span></span></button>`;
    }).join('') || '<p class="ze-empty-note">Inga anteckningar ännu.</p>'}</section>`).join('')}</div><button type="button" class="ze-secondary" data-ze="search">Tillbaka till sökandet</button>`;
  }
  function renderMap() {
    return `<div class="ze-panel-head"><span class="ze-kicker">BJÖRKGLÄNTANS GAMLA PARKKARTA</span><h3>En väg genom natten.</h3><p>Du kan återvända till öppna områden. Nästa grind kräver områdets alla fyra djur och ett löst lås.</p></div><div class="ze-map-path">${C.rooms.map((room, i) => `<button type="button" class="ze-map-stop ${state.room === i ? 'current' : ''}" data-ze="travel" data-room="${i}" ${i > state.solved.length ? 'disabled' : ''}><span>${i > state.solved.length ? A.icon('lock') : state.solved.includes(room.id) ? A.icon('check') : room.chapter}</span><div><strong>${room.title}</strong><small>${room.subtitle}</small></div></button>`).join('')}<div class="ze-map-exit">${A.icon('key')} Personalgrinden</div></div><button type="button" class="ze-secondary" data-ze="search">Tillbaka till bilden</button>`;
  }
  function renderPuzzle(room, count, solved) {
    const missing = count < 4;
    const values = state.locks[room.id];
    return `<div class="ze-panel-head"><span class="ze-kicker">${room.reward.toLocaleUpperCase('sv')}</span><h3>${room.puzzleTitle}</h3><p>${missing ? 'Låset saknar ledtrådar. Hitta och namnge områdets fyra djur först.' : solved ? 'Mekanismen har vaknat. Vägen vidare är öppen.' : room.puzzleClue}</p><button type="button" class="ze-text-button" data-ze="listen-lock">${A.icon('sound')} Lyssna på ledtråden</button></div>${missing ? `<div class="ze-locked-art">${A.icon('lock')}<span>${count} / 4 spår</span></div>` : solved ? `<div class="ze-reward">${A.icon(['leaf', 'water', 'flower'][state.room])}<strong>${room.reward}</strong><p>${state.room === 0 ? 'En kikare låg bakom låset. Använd den för att studera viken.' : 'En nattlampa väntade vid bron. Ta den med till växthuset.'}</p><button type="button" class="ze-primary" data-ze="next">${state.room === 0 ? 'Följ stigen till Vassviken' : 'Gå in i Vinterträdgården'} →</button></div>` : `<div class="ze-puzzle-workspace">${state.room === 0 ? `<div class="ze-code-slots" aria-label="Inmatad kod: ${values || 'tom'}">${Array.from({ length: 4 }, (_, i) => `<span>${values[i] || '·'}</span>`).join('')}</div><div class="ze-keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '↺', 0, '⌫'].map(key => `<button type="button" data-ze="digit" data-digit="${key}" aria-label="${key === '⌫' ? 'Radera sista siffran' : key === '↺' ? 'Töm koden' : 'Siffra ' + key}">${key}</button>`).join('')}</div><div class="ze-mini-evidence">${C.rooms[0].animals.slice().sort((a, b) => C.byId[a].sv.localeCompare(C.byId[b].sv, 'sv')).map(id => `<span>${C.byId[id].sv}<b>${state.marks[id]}</b></span>`).join('')}</div>` : state.room === 1 ? `<div class="ze-order-slots" aria-label="Vald ordning">${Array.from({ length: 4 }, (_, i) => `<button type="button" data-ze="remove-step" data-index="${i}" ${!values[i] ? 'disabled' : ''}><span>${i + 1}</span>${values[i] ? C.sluiceSteps.find(step => step.id === values[i]).text + ' ×' : 'Välj en skylt'}</button>`).join('')}</div><div class="ze-step-bank">${[C.sluiceSteps[2], C.sluiceSteps[0], C.sluiceSteps[3], C.sluiceSteps[1]].map(step => `<button type="button" data-ze="step" data-step="${step.id}" ${values.includes(step.id) ? 'disabled' : ''}>${step.text}</button>`).join('')}</div>` : `<div class="ze-sentence-slots" aria-label="Din mening">${values.length ? values.map((word, i) => `<button type="button" data-ze="remove-word" data-index="${i}">${word} ×</button>`).join('') : '<span>Bygg meningen här…</span>'}</div><div class="ze-word-bank">${state.wordOrder.map(word => `<button type="button" data-ze="word" data-word="${word}" ${values.includes(word) ? 'disabled' : ''}>${word}</button>`).join('')}</div><p class="ze-th" lang="th">เมื่อโคมไฟส่องสว่าง เราก็สามารถเปิดประตูได้</p>`}<button type="button" class="ze-primary" data-ze="try-lock" ${state.room === 0 ? values.length < 4 ? 'disabled' : '' : values.length < (state.room === 1 ? 4 : 7) ? 'disabled' : ''}>${A.icon('key')} Prova ${state.room === 2 ? 'lösenordet' : 'låset'} →</button></div>`}<div class="ze-puzzle-links"><button type="button" class="ze-text-button" data-ze="journal">${A.icon('book')} Läs dina anteckningar</button><button type="button" class="ze-text-button" data-ze="search">Tillbaka till bilden</button></div>`;
  }
  function notify(text, style = '') {
    message = text; tone = style;
    const el = $('#ze-status', dialog);
    if (el) { el.textContent = text; el.dataset.tone = style; }
    const local = $('#ze-panel-status', dialog);
    if (local) {
      local.hidden = !style; local.textContent = text; local.dataset.tone = style;
      if (style === 'retry') local.scrollIntoView({ block: 'nearest' });
    }
  }
  function showPanel(name) {
    if (name !== 'found') tone = '';
    if ($('.ze-sidebar', dialog)) $('.ze-sidebar', dialog).scrollTop = 0;
    panel = name; renderGame();
    if (window.matchMedia('(max-width: 760px)').matches) $('.ze-sidebar', dialog)?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    const heading = $('.ze-sidebar h3', dialog); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  function fitWorld() {
    const viewport = $('.ze-viewport', dialog), world = $('.ze-world', dialog);
    if (!viewport || !world) return;
    const base = Math.min(viewport.clientWidth, viewport.clientHeight * 1.5);
    world.style.width = base * zoom + 'px';
  }
  function setZoom(next, focusAnimal) {
    const viewport = $('.ze-viewport', dialog), world = $('.ze-world', dialog);
    const centerX = (viewport.scrollLeft + viewport.clientWidth / 2 - world.offsetLeft) / world.clientWidth;
    const centerY = (viewport.scrollTop + viewport.clientHeight / 2) / world.clientHeight;
    zoom = Math.max(1, Math.min(3, next)); world.style.setProperty('--ze-zoom', zoom);
    fitWorld();
    if (focusAnimal) {
      viewport.scrollLeft = focusAnimal.x / 1200 * world.clientWidth - viewport.clientWidth / 2;
      viewport.scrollTop = focusAnimal.y / 800 * world.clientHeight - viewport.clientHeight / 2;
    } else {
      viewport.scrollLeft = centerX * world.clientWidth + world.offsetLeft - viewport.clientWidth / 2;
      viewport.scrollTop = centerY * world.clientHeight - viewport.clientHeight / 2;
    }
    $('.ze-zoom-controls span', dialog).textContent = Math.round(zoom * 100) + '%';
    $('[data-ze="zoom-in"]', dialog).disabled = zoom >= 3;
    $('[data-ze="zoom-out"]', dialog).disabled = zoom <= 1;
    captureView();
  }
  function onClick(event) {
    const button = event.target.closest('button[data-ze]');
    if (!button || !dialog.contains(button) || button.disabled) return;
    const action = button.dataset.ze;
    if (action === 'close') return close();
    if (action === 'thai') { profile.thai = !profile.thai; save(); dialog.classList.toggle('ze-thai', profile.thai); button.setAttribute('aria-pressed', String(profile.thai)); return; }
    if (action === 'resume') return start(false);
    if (action === 'new') return start(true);
    if (action === 'new-confirm') {
      $('.ze-intro-buttons', dialog).innerHTML = '<p>Den sparade kvällsronden ersätts om du börjar om.</p><button type="button" class="ze-primary" data-ze="new">Starta en ny kvällsrond</button><button type="button" class="ze-text-button" data-ze="resume">Behåll och fortsätt</button>'; return;
    }
    if (screen === 'ending') {
      if (action === 'ending-word') say(C.byId[button.dataset.animal].sentence, true);
      if (action === 'replay') { screen = 'intro'; state = null; save(); renderIntro(); }
      return;
    }
    if (screen !== 'play') return;
    if (action === 'zoom-in') return setZoom(zoom + .5);
    if (action === 'zoom-out') return setZoom(zoom - .5);
    if (action === 'binoculars') { setZoom(zoom >= 2 ? 1 : 2.5); $('.ze-viewport', dialog)?.scrollIntoView({ block: 'nearest' }); notify('Kikaren är inställd. Dra eller svep i bilden för att följa spåren.'); return; }
    if (action === 'difficulty') { state.hard = !state.hard; save(); applyClasses(); button.innerHTML = `${A.icon('eye')} ${state.hard ? 'Midnatt · svår' : 'Skymning · tydligare'}`; button.setAttribute('aria-pressed', String(!state.hard)); return; }
    if (action === 'lamp' && state.solved.length >= 2) { state.lamp = !state.lamp; save(); renderGame(); notify(state.lamp ? 'Nattlampans ljus gör små färgskiftningar lättare att se.' : 'Nattlampan är släckt.'); return; }
    if (action === 'map' || action === 'journal' || action === 'puzzle') return showPanel(action);
    if (action === 'search') {
      inspected = null;
      tone = '';
      const next = tracks().find(id => !state.found.includes(id));
      if (next) selectedTrack = next;
      panel = C.foundInRoom(state).length === 4 ? 'puzzle' : 'search'; renderGame();
      $('.ze-stage', dialog)?.scrollIntoView({ block: 'nearest' }); return;
    }
    if (action === 'track') { selectedTrack = button.dataset.animal; panel = 'search'; renderGame(); return; }
    if (action === 'inspect') { inspected = button.dataset.animal; selectedTrack = inspected; sound('tap'); showPanel('found'); return; }
    if (action === 'identify') {
      const result = C.identify(state, inspected, button.dataset.answer);
      save();
      if (result === 'retry') { button.classList.add('ze-wrong-answer'); button.setAttribute('aria-invalid', 'true'); notify('Titta en gång till. Lägg märke till öronen, svansen eller formen.', 'retry'); sound('retry'); return; }
      if (result === 'found' || result === 'already') {
        sound('correct'); message = C.byId[inspected].sentence + ' Ett nytt spår finns i fältboken.'; tone = 'correct';
        showPanel('found'); say(C.byId[inspected].sentence, true);
      }
      return;
    }
    if (action === 'listen-clue') return say(state.found.includes(selectedTrack) ? C.byId[selectedTrack].sentence : C.byId[selectedTrack].clue, true);
    if (action === 'listen-animal') return say(C.byId[inspected].sentence, true);
    if (action === 'journal-word') return say(C.byId[button.dataset.animal].sentence, true);
    if (action === 'radio') return say(C.rooms[state.room].story);
    if (action === 'listen-lock') return say(C.rooms[state.room].puzzleClue, true);
    if (action === 'hint') {
      const text = C.hint(state, selectedTrack); save();
      if (!text) return;
      if (state.hints[selectedTrack] >= 3) {
        clearTimeout(pulseTimer); pulseId = selectedTrack; renderGame(); setZoom(Math.max(1.5, zoom), C.byId[selectedTrack]);
        $('.ze-stage', dialog)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        pulseTimer = setTimeout(() => { pulseId = null; dialog?.querySelectorAll('.ze-hint-pulse').forEach(el => el.classList.remove('ze-hint-pulse')); }, 5500);
      } else renderGame();
      notify(text); return;
    }
    if (action === 'travel' || action === 'next') {
      captureView();
      const next = action === 'next' ? state.room + 1 : Number(button.dataset.room);
      if (C.go(state, next)) {
        // Prevent the departing room's scroll position being saved under the
        // arriving room's index during the next render.
        $('.ze-viewport', dialog)?.remove();
        $('.ze-game-body', dialog).scrollTop = 0;
        zoom = roomViews[next]?.zoom || 1; panel = 'search'; inspected = null;
        selectedTrack = tracks().find(id => !state.found.includes(id)) || tracks()[0];
        message = C.rooms[next].subtitle + '.'; tone = ''; save(); renderGame();
      }
      return;
    }
    const room = C.rooms[state.room], values = state.locks[room.id];
    if (action === 'digit' && state.room === 0) {
      const digit = button.dataset.digit;
      state.locks.forest = digit === '↺' ? '' : digit === '⌫' ? values.slice(0, -1) : values.length < 4 ? values + digit : values;
      tone = ''; save(); renderGame(); return;
    }
    if (action === 'step' && state.room === 1 && !values.includes(button.dataset.step)) values.push(button.dataset.step);
    if (action === 'remove-step' && state.room === 1) values.splice(Number(button.dataset.index), 1);
    if (action === 'word' && state.room === 2 && !values.includes(button.dataset.word)) values.push(button.dataset.word);
    if (action === 'remove-word' && state.room === 2) values.splice(Number(button.dataset.index), 1);
    if (['step', 'remove-step', 'word', 'remove-word'].includes(action)) { tone = ''; save(); renderGame(); return; }
    if (action === 'try-lock') {
      const result = C.solve(state, state.room, values); save();
      if (result === 'retry') { sound('retry'); notify(state.room === 0 ? 'Låset klickar till men öppnas inte. Läs platsernas ordning igen.' : state.room === 1 ? 'Mekanismen stannar. Vad måste hända innan bron kan höjas?' : 'Orden finns där. Läs meningen högt och tänk på ordningen efter ”När lyktan lyser”.', 'retry'); }
      if (result === 'missing') notify('Fyra säkra observationer behövs innan låset kan öppnas.');
      if (result === 'solved') {
        sound('fanfare');
        if (state.status === 'escaped') return finish();
        message = C.rooms[state.room].reward + ' är ditt. Vägen vidare är öppen.'; tone = 'correct'; renderGame();
        say('Låset öppnas. Bra gjort!');
      }
    }
  }
  function finish() {
    screen = 'ending';
    if (profile.rewardedRun !== state.startedAt) {
      const xp = profile.completed === 0 ? 60 : 15;
      profile.completed++; profile.rewardedRun = state.startedAt; save();
      window.GameEngine?.StateManager?.addXP(xp); window.SmallGames?.renderLobby();
    }
    stop(); renderEnding(); say('Grinden är öppen. Du hittade vägen genom natten. Vi ses i morgon, nattväktare.');
  }
  function renderEnding() {
    applyClasses();
    const hints = Object.values(state.hints).reduce((sum, n) => sum + n, 0);
    dialog.innerHTML = `${header(true)}<div class="ze-ending"><div class="ze-ending-hero">${A.image('greenhouse')}<div></div><span class="ze-kicker">BJÖRKGLÄNTAN · KVÄLLSRONDEN ÄR AVKLARAD</span><div class="ze-ending-key">${A.icon('key')}</div><h1>Grinden är öppen.<br><em>Du hittade vägen.</em></h1><p>Radion vaknar till liv. ”Jag ser lyktan!” Signe vinkar från stigen. I fickan ligger reservnyckeln. I fältboken finns tolv djur, tolv platser och en hel kväll på svenska.</p></div><div class="ze-ending-body"><div class="ze-ending-stats"><span><strong>12 / 12</strong>djur hittade</span><span><strong>3 / 3</strong>lås öppnade</span><span><strong>${hints}</strong>ledtrådssteg</span></div><span class="ze-kicker">TA MED DIG ORDEN HEM · TRYCK FÖR ATT LYSSNA</span><div class="ze-ending-words">${C.animals.map(animal => `<button type="button" data-ze="ending-word" data-animal="${animal.id}">${A.animal(animal.id)}<strong>${animal.sv}</strong><span>${animal.sentence}</span><span class="ze-th" lang="th">${animal.th}</span></button>`).join('')}</div><div class="ze-ending-buttons"><button type="button" class="ze-primary" data-ze="replay">En ny kväll i Björkgläntan →</button><button type="button" class="ze-secondary" data-ze="close">Till småspelen</button></div></div></div>`;
    const heading = $('.ze-ending h1', dialog); heading.tabIndex = -1; heading.focus({ preventScroll: true });
  }
  window.ZooEscape = { open, close, getCompletions: () => profile.completed };
})();

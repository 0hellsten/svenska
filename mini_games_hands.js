/* Touch, mouse and keyboard controls for the illustrated kitchen worktop. */
(function (root) {
  'use strict';
  const TAU = 2 * Math.PI;
  const WHISK_GOAL = TAU * 2.5;
  const number = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 });
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));
  let dispose;

  function pourStatus(amount, target) {
    const tolerance = target * .075;
    if (amount > target + tolerance) return 'over';
    return amount >= target - tolerance ? 'ready' : 'under';
  }

  function whiskDistance(before, after) {
    const movement = Math.abs(Math.atan2(Math.sin(after - before), Math.cos(after - before)));
    return movement <= Math.PI / 2 ? movement : 0;
  }

  function destroy() { dispose?.(); dispose = null; }

  function cup(action) {
    const fill = 112 * action.amount / (action.target * 1.6);
    return `<svg viewBox="0 0 360 208" class="mg-hands-art" aria-hidden="true"><ellipse cx="196" cy="183" rx="107" ry="12" fill="#966c4833"/><path d="M230 60h26q28 0 26 24l-2 24q-3 17-27 19h-13" fill="none" stroke="#a9bbae" stroke-width="10"/><path d="M141 49h107l-11 112q-2 14-17 14h-53q-15 0-17-14z" fill="#f6faf1" stroke="#81988b" stroke-width="3"/><defs><clipPath id="mg-pour-clip"><path d="M144 52h101l-11 109q-2 11-14 11h-53q-12 0-14-11z"/></clipPath></defs><g clip-path="url(#mg-pour-clip)"><rect class="mg-pour-level" x="141" y="${172 - fill}" width="107" height="${fill}" fill="${action.id === 'milk' ? '#e0e9cc' : '#efce9d'}"/></g><path d="M146 102h98" stroke="#64866e" stroke-width="3" stroke-dasharray="5 4"/><text x="291" y="107" text-anchor="middle" font-size="14" fill="#48624c">${number.format(action.target)} ${action.unit}</text><path d="M153 70h14m-12 17h12m-10 33h10m-9 18h9m-7 17h7" stroke="#829a88" stroke-width="2"/><path class="mg-pour-stream" d="M109 70Q147 72 177 133" fill="none" stroke="${action.id === 'milk' ? '#fbfff0' : '#edcd9c'}" stroke-width="9" stroke-linecap="round"/><g class="mg-pour-pack"><svg x="38" y="19" width="84" height="84" viewBox="0 0 80 80">${root.MiniGameArt.icon(action.id)}</svg></g></svg>`;
  }

  function bowl() {
    return `<svg viewBox="0 0 360 218" class="mg-hands-art" aria-hidden="true"><ellipse cx="180" cy="181" rx="116" ry="12" fill="#976e4833"/><path d="M68 103q14 80 112 83 98-3 112-83" fill="#a5c3b2" stroke="#678c7b" stroke-width="3"/><ellipse cx="180" cy="103" rx="112" ry="56" fill="#e5d9b7" stroke="#678c7b" stroke-width="3"/><ellipse cx="180" cy="108" rx="95" ry="43" fill="#eed3a3"/><path class="mg-whisk-ribbon" d="M111 105q68-41 126 1 16 28-58 28-44 0-28-19 16-15 48-8" fill="none" stroke="#d4a86a" stroke-width="4" stroke-linecap="round" opacity=".25"/><g class="mg-whisk-clumps" fill="#cda56f">${[[125,90],[180,86],[205,113],[142,124],[220,92],[164,110],[196,134]].map(([x,y],i)=>`<ellipse cx="${x}" cy="${y}" rx="${7+i%3}" ry="4"/>`).join('')}</g><g class="mg-whisk-tool" stroke="#8c755a" stroke-width="2" fill="none"><path d="M180 105q-20-8 10-28 8 23-10 28zm0 0q-5-12 10-28m-10 28q11-6 10-28"/><path d="m190 77 18-45" stroke="#9e7053" stroke-width="8" stroke-linecap="round"/></g></svg>`;
  }

  function icingPath(strokes) {
    return strokes.map(stroke => stroke.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')).join(' ');
  }

  function cake(strokes, strawberries = false) {
    return `<svg viewBox="0 0 360 218" class="mg-hands-art" aria-hidden="true"><ellipse cx="180" cy="118" rx="131" ry="84" fill="#f4e8ce" stroke="#bfa685" stroke-width="3"/><ellipse cx="180" cy="124" rx="108" ry="68" fill="#c49268"/><ellipse cx="180" cy="109" rx="108" ry="67" fill="#edd5a6" stroke="#ae825c" stroke-width="3"/><path class="mg-icing-line" d="${icingPath(strokes)}" fill="none" stroke="#fff5dc" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>${strawberries ? '<g fill="#ca7567" stroke="#9c574c" stroke-width="2"><path d="M111 92q-10-16 0-16 12 0 0 16zm69-15q-10-16 0-16 12 0 0 16zm66 22q-10-16 0-16 12 0 0 16z"/></g>' : ''}</svg>`;
  }

  function mount(host, action, options) {
    destroy();
    const events = new AbortController();
    const listener = { signal: events.signal };
    let frame, pointer = null;
    const isPour = action.kind === 'pour';
    const isWhisk = action.kind === 'whisk';
    const title = isPour ? 'เทให้ถึงขีด' : isWhisk ? 'ลงมือคนส่วนผสม' : 'บีบครีมเป็นลายของเรา';
    const instruction = isPour ? 'กดค้างเพื่อเท ปล่อยใกล้ขีดสีเขียว ถ้าเยอะไปให้เทกลับ' : isWhisk ? 'ลากนิ้ววนรอบชามได้ทั้งสองทาง ดูก้อนแป้งค่อย ๆ หายไป' : 'ลากนิ้วบนหน้าขนม วาดเป็นเส้นหรือวงตามใจชอบจ้า';
    const controls = isPour
      ? '<div class="mg-hands-controls"><button type="button" class="mg-secondary" data-hands="back">− เทกลับ</button><button type="button" class="mg-primary" data-hands="pour">+ กดค้างเพื่อเท</button></div>'
      : isWhisk ? '<button type="button" class="mg-secondary" data-hands="assist">ช่วยคนทีละรอบ ↻</button>'
        : '<div class="mg-hands-controls"><button type="button" class="mg-secondary" data-hands="clear">ลบแล้ววาดใหม่</button><button type="button" class="mg-secondary" data-hands="assist">ทำลายเกลียวให้</button></div>';
    host.className = 'mg-game-content mg-hands-game';
    host.innerHTML = `<section class="mg-hands"><span class="mg-eyebrow">ลงมือทำ · ${options.recipeTh}</span><h3 tabindex="-1">${title}</h3><p>${instruction}</p><div class="mg-hands-stage" ${isPour ? '' : 'data-hands-surface'}>${isPour ? cup(action) : isWhisk ? bowl() : cake(action.strokes)}</div><div class="mg-hands-reading"><strong></strong><span role="status"></span></div>${controls}${isWhisk ? '' : `<button type="button" class="mg-primary mg-hands-done" data-hands="done" disabled>${isPour ? 'ใส่ลงในชาม' : 'ลายเสร็จแล้ว'} →</button>`}<button type="button" class="mg-replay" data-hands="listen">♪ ฟังอีกครั้ง <small>1×</small></button></section>`;
    host.scrollTop = 0;
    host.querySelector('h3').focus({ preventScroll: true });
    const stage = host.querySelector('.mg-hands-stage');
    const status = host.querySelector('.mg-hands-reading [role="status"]');
    const amount = host.querySelector('.mg-hands-reading strong');
    const done = host.querySelector('[data-hands="done"]');

    function announce(message) {
      if (status.textContent !== message) status.textContent = message;
    }

    function paint() {
      if (isPour) {
        const fill = 112 * action.amount / (action.target * 1.6);
        const water = stage.querySelector('.mg-pour-level');
        water.setAttribute('y', 172 - fill);
        water.setAttribute('height', fill);
        amount.textContent = `${number.format(action.amount)} / ${number.format(action.target)} ${action.unit}`;
        const mark = pourStatus(action.amount, action.target);
        announce({ over: 'เยอะไปนิด · เทกลับได้', ready: 'ถึงขีดแล้ว ✓', under: 'เติมอีกนิด' }[mark]);
        done.disabled = mark !== 'ready';
      } else if (isWhisk) {
        const ratio = Math.min(1, action.work / WHISK_GOAL);
        amount.textContent = `${Math.round(ratio * 100)}%`;
        announce(ratio >= 1 ? 'เนียนแล้ว ✓' : 'วนต่อไปจ้า');
        stage.querySelector('.mg-whisk-clumps').style.opacity = 1 - ratio;
        stage.querySelector('.mg-whisk-ribbon').style.opacity = .25 + ratio * .6;
      } else {
        stage.querySelector('.mg-icing-line').setAttribute('d', icingPath(action.strokes));
        amount.textContent = action.length >= 32 ? '✓' : '✧';
        announce(action.length >= 32 ? 'จะวาดต่อหรือไปต่อก็ได้' : 'ลองวาดเส้นบนขนม');
        done.disabled = action.length < 32;
      }
    }

    function changeAmount(delta) {
      action.amount = clamp(action.amount + delta, 0, action.target * 1.6);
      paint();
    }

    function checkSpill() {
      if (isPour && !action.spillShown && pourStatus(action.amount, action.target) === 'over') {
        action.spillShown = true;
        options.onSpill();
      }
    }

    function point(event) {
      const rect = stage.querySelector('svg').getBoundingClientRect();
      return [(event.clientX - rect.left) * 360 / rect.width, (event.clientY - rect.top) * 218 / rect.height];
    }

    function moveWhisk(x, y) {
      const rx = (x - 180) / 105;
      const ry = (y - 105) / 55;
      const radius = Math.hypot(rx, ry);
      if (radius < .18 || radius > 1.48) { pointer.angle = null; return; }
      const angle = Math.atan2(ry, rx);
      if (pointer.angle !== null) action.work += whiskDistance(pointer.angle, angle);
      pointer.angle = angle;
      stage.querySelector('.mg-whisk-tool').setAttribute('transform', `translate(${clamp(x-180,-95,95)} ${clamp(y-105,-42,42)}) rotate(${Math.sin(angle)*22} 180 105)`);
      paint();
      if (action.work >= WHISK_GOAL) options.onDone();
    }

    function draw(x, y) {
      if (Math.hypot((x - 180) / 101, (y - 109) / 60) > 1) {
        pointer.stroke = null;
        return;
      }
      if (!pointer.stroke) {
        if (action.strokes.length >= 35) return;
        pointer.stroke = [];
        action.strokes.push(pointer.stroke);
      }
      const last = pointer.stroke.at(-1);
      const distance = last ? Math.hypot(x - last[0], y - last[1]) : 0;
      if (last && distance < 2 || pointer.stroke.length >= 500) return;
      action.length += distance;
      pointer.stroke.push([Math.round(x), Math.round(y)]);
      paint();
    }

    host.addEventListener('pointerdown', event => {
      if (event.button !== 0 || pointer) return;
      const target = event.target.closest(isPour ? '[data-hands="pour"], [data-hands="back"]' : '[data-hands-surface]');
      if (!target) return;
      pointer = { id: event.pointerId, target, angle: null, stroke: null };
      target.setPointerCapture(event.pointerId);
      if (isPour) {
        const direction = target.dataset.hands === 'pour' ? 1 : -1;
        if (direction === 1) stage.classList.add('is-pouring');
        changeAmount(direction * action.target * .035);
        let last = performance.now();
        const tick = now => {
          changeAmount(direction * Math.min(45, now - last) * action.target / 2100);
          last = now;
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      } else if (!isWhisk) draw(...point(event));
    }, listener);
    host.addEventListener('pointermove', event => {
      if (pointer?.id !== event.pointerId || isPour) return;
      if (isWhisk) moveWhisk(...point(event));
      else draw(...point(event));
    }, listener);
    const release = event => {
      if (pointer?.id !== event.pointerId) return;
      pointer = null;
      cancelAnimationFrame(frame);
      stage.classList.remove('is-pouring');
      checkSpill();
    };
    host.addEventListener('pointerup', release, listener);
    host.addEventListener('pointercancel', release, listener);
    host.addEventListener('lostpointercapture', release, listener);
    host.addEventListener('click', event => {
      const button = event.target.closest('[data-hands]');
      if (!button) return;
      switch (button.dataset.hands) {
        case 'pour': case 'back':
          // Keyboard and assistive activation have no pointerdown.
          if (event.detail === 0) { changeAmount((button.dataset.hands === 'pour' ? 1 : -1) * action.target * .05); checkSpill(); }
          break;
        case 'done': options.onDone(); break;
        case 'listen': root.SpeechEngine?.speakSwedish?.(options.line, 1); break;
        case 'clear': action.strokes = []; action.length = 0; paint(); break;
        case 'assist':
          if (isWhisk) {
            action.work += TAU / 2;
            stage.querySelector('.mg-whisk-tool').setAttribute('transform', `rotate(${Math.round(action.work * 16) % 36 - 18} 180 105)`);
            paint();
            if (action.work >= WHISK_GOAL) options.onDone();
          } else if (action.strokes.length < 35) {
            action.strokes.push([[113,106],[135,86],[169,74],[208,76],[237,93],[247,111],[220,130],[187,138],[156,131],[143,115],[163,102],[195,102],[208,115]]);
            action.length += 100;
            paint();
          }
          break;
      }
    }, listener);
    dispose = () => { events.abort(); cancelAnimationFrame(frame); };
    paint();
  }

  const api = { mount, destroy, cake, pourStatus, whiskDistance };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MiniGameHands = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

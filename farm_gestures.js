/* Continuous pointer interactions for Björkbacken. Keep the scene in place during a gesture. */
(function (root) {
  'use strict';
  const BRUSH_GOAL = 3;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const angleDelta = (before, after) => ((after - before + 540) % 360) - 180;

  function brushMotion(stroke, point) {
    const before = stroke.point;
    stroke.point = point;
    if (!before) return 'ready';
    const inLane = p => p.x >= .18 && p.x <= .80 && p.y >= .31 && p.y <= .62;
    const dx = point.x - before.x, dy = point.y - before.y;
    const elapsed = Math.max(point.t - before.t, 8) / 1000;
    const speed = Math.hypot(dx, dy) / elapsed;
    if (!inLane(point) || !inLane(before) || speed > 2.1 || Math.abs(dy) > Math.max(.014, Math.abs(dx) * 1.6)) {
      stroke.distance = 0;
      stroke.direction = 0;
      stroke.counted = false;
      return speed > 2.1 && inLane(point) ? 'fast' : 'ready';
    }
    if (Math.abs(dx) < .002) return 'brushing';
    const direction = Math.sign(dx);
    if (stroke.direction && direction !== stroke.direction) { stroke.distance = 0; stroke.counted = false; }
    stroke.direction = direction;
    if (stroke.counted) return 'brushing';
    stroke.distance += Math.abs(dx);
    if (stroke.distance < .25) return 'brushing';
    stroke.distance = 0;
    stroke.counted = true;
    return 'stroke';
  }

  function gateReady(kind, value) {
    if (kind === 'bolt') return value >= .84;
    if (kind === 'turn') return value >= 76 && value <= 104;
    return value >= .72;
  }

  let dialog, options, gesture, suppressClick = false;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function install(host, handlers) {
    dialog = host; options = handlers;
    dialog.addEventListener('pointerdown', down);
    dialog.addEventListener('pointermove', move);
    dialog.addEventListener('pointerup', event => finish(event, true));
    for (const event of ['pointercancel','lostpointercapture']) dialog.addEventListener(event, value => finish(value, false));
    dialog.addEventListener('click', event => {
      if (suppressClick && event.detail && event.target.closest('[data-fb-pack],[data-fb="drop-goods"]')) {
        event.preventDefault(); event.stopImmediatePropagation();
      }
      suppressClick = false;
    }, true);
    window.addEventListener('blur', cancel);
  }

  function down(event) {
    if (!gesture) suppressClick = false;
    if (event.button !== 0 || gesture || options.isMoving()) return;
    const piece = event.target.closest('.fb-pack-grip')?.closest('[data-fb-pack]');
    const control = event.target.closest('[data-fb-gesture]');
    if (!piece && !control) return;
    const target = piece || control;
    const kind = piece ? 'pack' : control.dataset.fbGesture;
    const scene = control?.closest('[data-fb-motion]');
    const rect = scene?.getBoundingClientRect();
    gesture = { id:event.pointerId, kind, target, scene, rect, x:event.clientX, y:event.clientY, value:0 };
    if (kind === 'brush') {
      gesture.stroke = { point:null, distance:0, direction:0 };
      positionBrush(gesture, event);
    }
    if (kind === 'turn') {
      const box = target.getBoundingClientRect();
      gesture.center = [box.left + box.width / 2, box.top + box.height / 2];
      gesture.angle = pointerAngle(gesture, event);
      gesture.value = Number(scene.dataset.angle || 0);
    }
    target.setPointerCapture(event.pointerId);
    if (!piece) target.classList.add('is-held');
  }

  function move(event) {
    const g = gesture;
    if (!g || event.pointerId !== g.id) return;
    if (g.kind === 'pack') { movePack(g, event); return; }
    if (g.kind === 'brush') {
      const points = event.getCoalescedEvents?.();
      for (const point of points?.length ? points : [event]) positionBrush(g, point);
      return;
    }
    if (g.kind === 'turn') {
      if (Math.hypot(event.clientX - g.center[0], event.clientY - g.center[1]) < 9) return;
      const angle = pointerAngle(g, event);
      g.value = clamp(g.value + angleDelta(g.angle, angle), 0, 135);
      g.angle = angle;
    } else {
      const distance = (event.clientX - g.x) * (g.kind === 'pull' ? -1 : 1);
      g.value = clamp(distance / (g.rect.width * .23), 0, 1);
    }
    paintGate(g.scene, g.kind, g.value);
  }

  function movePack(g, event) {
    if (!g.ghost) {
      if (Math.hypot(event.clientX - g.x, event.clientY - g.y) < 6) return;
      g.ghost = document.createElement('span');
      g.ghost.className = 'fb-pack-ghost';
      g.ghost.setAttribute('aria-hidden', 'true');
      g.ghost.textContent = g.target.querySelector('.fb-glyph').textContent;
      dialog.append(g.ghost);
      g.target.classList.add('is-carried');
      options.sound('tap');
    }
    g.ghost.style.transform = `translate3d(${event.clientX - 23}px,${event.clientY - 35}px,0)`;
    const drop = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-fb-drop]');
    const valid = drop?.dataset.fbDrop !== g.target.dataset.from ? drop : null;
    if (g.drop !== valid) {
      g.drop?.classList.remove('is-drop-target');
      g.drop = valid;
      g.drop?.classList.add('is-drop-target');
    }
  }

  function positionBrush(g, event) {
    const point = { x:(event.clientX - g.rect.left) / g.rect.width, y:(event.clientY - g.rect.top) / g.rect.height, t:event.timeStamp };
    g.scene.style.setProperty('--brush-x', `${clamp(point.x, .06, .94) * 100}%`);
    g.scene.style.setProperty('--brush-y', `${clamp(point.y, .08, .91) * 100}%`);
    const motion = brushMotion(g.stroke, point);
    if (motion === 'stroke') completeStroke(g.scene);
    else if (motion === 'fast' && Number(g.scene.dataset.strokes) < BRUSH_GOAL) {
      if (g.scene.dataset.mood !== 'startled') options.status('เร็วไปนิด ลองลากช้าลงตามแนวขนบนหลัง ความคืบหน้ายังอยู่', 'retry');
      g.scene.dataset.mood = 'startled';
    } else if (motion === 'brushing' && Number(g.scene.dataset.strokes) < BRUSH_GOAL) g.scene.dataset.mood = 'brushing';
  }

  function completeStroke(scene) {
    const count = Number(scene.dataset.strokes);
    if (count >= BRUSH_GOAL) return;
    const strokes = count + 1;
    scene.dataset.strokes = strokes;
    scene.dataset.mood = strokes === BRUSH_GOAL ? 'calm' : 'brushing';
    scene.parentElement.querySelector('progress').value = strokes;
    const reading = scene.parentElement.querySelector('.fb-groom-reading');
    reading.textContent = `${strokes} / ${BRUSH_GOAL}`;
    options.sound(strokes === BRUSH_GOAL ? 'correct' : 'tap');
    options.status(strokes === BRUSH_GOAL ? 'ใจเย็นลงแล้ว เก่งจังฮู้!' : 'ดีจ้า ลากยาว ๆ อย่างนี้อีกครั้ง', 'good');
    if (strokes === BRUSH_GOAL) {
      scene.parentElement.querySelector('[data-fb="brush-assist"]').disabled = true;
      scene.parentElement.querySelector('[data-fb="brush-again"]').hidden = false;
    }
  }

  function pointerAngle(g, event) { return Math.atan2(event.clientY - g.center[1], event.clientX - g.center[0]) * 180 / Math.PI; }
  function paintGate(scene, kind, value) {
    if (kind === 'turn') {
      scene.dataset.angle = value;
      scene.style.setProperty('--gate-angle', `${value}deg`);
      scene.dataset.aligned = String(gateReady(kind, value));
    } else {
      const isPull = kind === 'pull';
      scene.style.setProperty(isPull ? '--gate-pull' : '--gate-bolt', isPull ? `${value * -12}px` : `${value * 100}%`);
    }
  }

  function finish(event, commit) {
    const g = gesture;
    if (!g || event.pointerId !== g.id) return;
    gesture = null;
    g.target.classList.remove('is-held');
    if (g.kind === 'pack') {
      if (!g.ghost) return;
      suppressClick = true;
      const to = commit && document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-fb-drop]')?.dataset.fbDrop;
      const moved = commit && to && options.moveGoods(g.target.dataset.fbPack, g.target.dataset.from, to);
      g.drop?.classList.remove('is-drop-target'); g.target.classList.remove('is-carried');
      if (!moved && commit && !reduced()) {
        const origin = g.target.getBoundingClientRect();
        g.ghost.animate?.([{ transform:g.ghost.style.transform, opacity:1 }, { transform:`translate3d(${origin.left + origin.width / 2 - 23}px,${origin.top + 8}px,0)`, opacity:0 }], { duration:170 }).finished.then(() => g.ghost.remove(), () => g.ghost.remove());
        if (!g.ghost.animate) g.ghost.remove();
      } else g.ghost.remove();
      return;
    }
    if (g.kind === 'brush') return;
    if (commit && gateReady(g.kind, g.value)) { options.advanceGate(); return; }
    if (g.kind !== 'turn') paintGate(g.scene, g.kind, 0);
    if (!commit) return;
    const hints = { bolt:'เลื่อนกลอนไปทางขวาให้สุดช่อง', turn:'ลองหมุนให้ตรงขีดสีทอง ถ้าเลยให้หมุนกลับได้', pull:'ลองดึงมือจับไปทางซ้ายอีกนิด' };
    options.status(hints[g.kind], 'retry');
  }

  function cancel() {
    if (gesture) finish({ pointerId:gesture.id }, false);
    suppressClick = false;
  }
  const api = { install, cancel, completeStroke, brushMotion, gateReady, angleDelta, BRUSH_GOAL };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FarmGestures = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

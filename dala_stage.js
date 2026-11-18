(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const decoded = new Map();
  let dialog;
  let source;
  let run = 0;
  let frameRequest = 0;
  let timer = 0;
  let travel;
  let afterClose;

  function label(sv, th) {
    return '<span class="ui-label"><span lang="sv">' + sv + '</span><small lang="th">' + th + '</small></span>';
  }

  function moveById(id) {
    return window.WilawanMoves?.catalog.find(move => move.id === id);
  }

  function balance() {
    return Math.max(0, Number(window.WilawanMoves?.balance()) || 0);
  }

  function gems(amount) {
    return '<span class="dala-stage-gems">' + window.VisualEngine.getGemAmount(amount) + '</span>';
  }

  function stopShow() {
    run += 1;
    cancelAnimationFrame(frameRequest);
    clearTimeout(timer);
    travel?.cancel();
    travel = null;
    document.documentElement.classList.remove('dala-on-stage');
  }

  function setup() {
    if (dialog) return;
    dialog = document.createElement('dialog');
    dialog.className = 'dala-stage';
    dialog.id = 'dala-stage';
    dialog.setAttribute('aria-labelledby', 'dala-stage-title');
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
      dialog.close();
    });
    dialog.addEventListener('close', () => {
      stopShow();
      const opener = source?.isConnected ? source : document.getElementById(source?.id)
        || document.querySelector('#shop-modal-backdrop.open #shop-moves-heading')
        || document.querySelector('#view-home.active-view #mascot-container button');
      source = null;
      dialog.replaceChildren();
      const next = afterClose;
      afterClose = null;
      if (next) next(opener);
      else opener?.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
        return;
      }
      const target = event.target.closest('button');
      if (!target || !dialog.contains(target)) return;
      if (target.hasAttribute('data-dala-close')) dialog.close();
      if (target.hasAttribute('data-dala-back')) showMenu(target.dataset.dalaBack);
      if (target.hasAttribute('data-dala-wardrobe')) {
        afterClose = opener => window.WilawanMoves.openWardrobe(opener);
        dialog.close();
      }
      if (target.dataset.dalaChoice) {
        const move = moveById(target.dataset.dalaChoice);
        if (move && window.WilawanMoves.owns(move.id)) perform(move, true);
        else if (move) showPurchase(move);
      }
      if (target.dataset.dalaBuy) buy(moveById(target.dataset.dalaBuy), target);
    });
    document.body.append(dialog);
  }

  function openDialog(opener) {
    setup();
    if (!dialog.open) source = opener instanceof HTMLElement ? opener : document.activeElement;
  }

  function render(screen, title, content, focusSelector) {
    dialog.dataset.screen = screen;
    dialog.innerHTML =
      '<div class="dala-stage-inner">' +
        '<header class="dala-stage-header">' +
          '<h2 id="dala-stage-title">' + title + '</h2>' +
          '<button type="button" class="dala-stage-close" data-dala-close aria-label="ปิด / Stäng">' +
            '<span aria-hidden="true">×</span>' +
          '</button>' +
        '</header>' + (screen === 'show' ? content : '<div class="dala-stage-content">' + content + '</div>') +
      '</div>';
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(focusSelector || '[data-dala-close]')?.focus({ preventScroll: true });
  }

  function showMenu(focusId) {
    stopShow();
    const wallet = window.WilawanMoves;
    const moves = wallet.catalog.map(move => {
      const owned = wallet.owns(move.id);
      const action = owned ? label('Spela', 'เล่น') : label('Lås upp', 'ปลดล็อก') + gems(move.costGems);
      return '<li><button type="button" class="dala-stage-move" data-dala-choice="' + move.id + '">' +
        label(move.nameSv, move.nameTh) + '<span class="dala-stage-action">' + action + '</span>' +
      '</button></li>';
    }).join('');
    render('menu', label('Trick med Wilawan', 'ท่าโชว์ของวิลาวัลย์'),
      '<p class="dala-stage-balance">' + label('Dina juveler', 'เพชรของคุณ') + gems(balance()) + '</p>' +
      '<ul class="dala-stage-moves">' + moves + '</ul>' +
      '<button type="button" class="dala-stage-secondary dala-stage-wardrobe-button" data-dala-wardrobe>' +
        label('Styla Wilawan', 'แต่งตัวให้วิลาวัลย์') + '<span aria-hidden="true">›</span>' +
      '</button>',
      focusId ? '[data-dala-choice="' + focusId + '"]' : '[data-dala-choice="wave"]'
    );
  }

  function showPortrait(opener) {
    openDialog(opener);
    stopShow();
    const mascot = window.VisualEngine.Mascot;
    // Visible edges of the painted horse inside its transparent 760 × 695 source.
    let left = 73, top = 15, right = 691, bottom = 666;
    for (const { rect: [x, y, width, height] } of mascot.getStageAccessories()) {
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x + width);
      bottom = Math.max(bottom, y + height);
    }
    const width = right - left;
    const height = bottom - top;
    const style = `aspect-ratio:${width}/${height};--art-width:${760 / width * 100}%;--art-left:${-left / width * 100}%;--art-top:${-top / height * 100}%`;
    render('portrait', label('Wilawan', 'วิลาวัลย์'),
      `<div class="dala-zoom-figure" style="${style}">${mascot.getMarkup()}</div>`);
  }

  function showPurchase(move, error = '') {
    const amount = balance();
    const status = error || (amount < move.costGems
      ? label('Juvelerna räcker inte än.', 'เพชรยังไม่พอ')
      : '');
    render('purchase', label(move.nameSv, move.nameTh),
      '<p class="dala-stage-description">' + label(move.descriptionSv, move.descriptionTh) + '</p>' +
      '<p class="dala-stage-balance">' + label('Pris', 'ราคา') + gems(move.costGems) + '</p>' +
      '<p class="dala-stage-balance">' + label('Dina juveler', 'เพชรของคุณ') + gems(amount) + '</p>' +
      '<p class="dala-stage-status" aria-live="polite">' + status + '</p>' +
      '<div class="dala-stage-buttons">' +
        '<button type="button" class="dala-stage-secondary" data-dala-back="' + move.id + '">' +
          label('Tillbaka', 'ย้อนกลับ') +
        '</button>' +
        '<button type="button" class="dala-stage-primary" data-dala-buy="' + move.id + '"' +
          (amount < move.costGems ? ' disabled' : '') + '>' + label('Köp', 'ซื้อ') +
        '</button>' +
      '</div>',
      '[data-dala-back]'
    );
  }

  function clipImage(id) {
    if (decoded.has(id)) return decoded.get(id);
    const clip = window.DalaClips?.[id];
    if (!clip) return Promise.reject(new Error('Missing Dala clip'));
    const playback = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      const limit = setTimeout(() => reject(new Error('Dala clip timed out')), 15000);
      image.onload = () => {
        clearTimeout(limit);
        const rows = Math.ceil(clip.frameCount / clip.columns);
        if (image.naturalWidth !== clip.frameWidth * clip.columns || image.naturalHeight !== clip.frameHeight * rows) {
          reject(new Error('Invalid Dala clip dimensions'));
          return;
        }
        resolve(image);
      };
      image.onerror = () => {
        clearTimeout(limit);
        reject(new Error('Dala clip could not be loaded'));
      };
      image.src = clip.src;
    });
    // Keep one decoded atlas in memory so switching between moves is safe on phones.
    decoded.clear();
    decoded.set(id, playback);
    playback.catch(() => {
      if (decoded.get(id) === playback) decoded.delete(id);
    });
    return playback;
  }

  async function buy(move, button) {
    if (!move || button.disabled) return;
    const context = ++run;
    const feedback = dialog.querySelector('.dala-stage-status');
    button.disabled = true;
    feedback.innerHTML = label('Laddar rörelsen…', 'กำลังโหลดท่าทาง…');
    try {
      await clipImage(move.id);
      if (context !== run || !dialog.open) return;
      const result = await window.WilawanMoves.purchase(move.id);
      if (context !== run || !dialog.open) return;
      if (window.WilawanMoves.owns(move.id)) {
        perform(move, true);
        return;
      }
      showPurchase(move, result.reason === 'insufficient-gems'
        ? label('Juvelerna räcker inte än.', 'เพชรยังไม่พอ')
        : label('Köpet kunde inte sparas. Försök igen.', 'บันทึกการซื้อไม่สำเร็จ ลองอีกครั้งนะ'));
    } catch {
      if (context === run && dialog.open) showPurchase(move, label('Rörelsen kunde inte laddas. Försök igen.', 'โหลดท่าทางไม่สำเร็จ ลองอีกครั้งนะ'));
    }
  }

  async function loadGarment(accessory) {
    const image = new Image();
    image.src = accessory.src;
    await image.decode();
    return { accessory, image };
  }

  function placeGarment(clip, accessory) {
    const [x, y, w, h] = accessory.rect;
    // Source portrait -> unposed atlas coordinates, as authored in render_dala_moves.py.
    const rect = [28.6 + .43 * x, 65.2 + .43 * y, .43 * w, .43 * h];
    const [left, top, width, height] = rect;
    // The baked horse fits inside each frame, but horns and halos sometimes extend past it.
    let margin = 0;
    const poses = clip.accessories.map(([torso, head]) => {
      let pose = torso.map((value, i) => value + accessory.head * (head[i] - value));
      if (accessory.hanging) {
        // The handle follows the mouth. Gravity keeps the coffee nearly level.
        const gx = 28.6 + .43 * accessory.joint[0];
        const gy = 65.2 + .43 * accessory.joint[1];
        const xGrip = pose[0] * gx + pose[2] * gy + pose[4];
        const yGrip = pose[1] * gx + pose[3] * gy + pose[5];
        const angle = .12 * Math.atan2(pose[1], pose[0]);
        const cos = Math.cos(angle), sin = Math.sin(angle);
        pose = [cos, sin, -sin, cos, xGrip - cos * gx + sin * gy, yGrip - sin * gx - cos * gy];
      }
      const [a, b, c, d, dx, dy] = pose;
      for (const xx of [left, left + width]) {
        for (const yy of [top, top + height]) {
          const px = a * xx + c * yy + dx;
          const py = b * xx + d * yy + dy;
          margin = Math.max(margin, -px, -py, px - clip.frameWidth, py - clip.frameHeight);
        }
      }
      return pose;
    });
    return { rect, poses, margin: Math.ceil(margin) };
  }

  function drawAnimation(clip, image, canvas, garments) {
    const layers = garments.map(({ accessory, image }) => ({
      ...placeGarment(clip, accessory), image, behind: accessory.behind
    }));
    const margin = Math.max(0, ...layers.map(layer => layer.margin));
    canvas.width = clip.frameWidth + 2 * margin;
    canvas.height = clip.frameHeight + 2 * margin;
    if (garments.length) {
      canvas.dataset.accessory = garments.map(layer => layer.accessory.id).join(' ');
      canvas.style.width = 100 * canvas.width / clip.frameWidth + '%';
      canvas.style.height = 100 * canvas.height / clip.frameHeight + '%';
      canvas.style.left = -100 * margin / clip.frameWidth + '%';
      canvas.style.top = -100 * margin / clip.frameHeight + '%';
    }
    const paint = canvas.getContext('2d');
    if (!paint) throw new Error('Canvas could not be drawn');
    paint.translate(margin, margin);
    const background = layers.filter(layer => layer.behind);
    const foreground = layers.filter(layer => !layer.behind);
    function drawGarments(worn, frame) {
      for (const layer of worn) {
        paint.save();
        paint.transform(...layer.poses[frame]);
        paint.drawImage(layer.image, ...layer.rect);
        paint.restore();
      }
    }
    return frame => {
      paint.clearRect(-margin, -margin, canvas.width, canvas.height);
      drawGarments(background, frame);
      paint.drawImage(image,
        (frame % clip.columns) * clip.frameWidth,
        Math.floor(frame / clip.columns) * clip.frameHeight,
        clip.frameWidth, clip.frameHeight, 0, 0, clip.frameWidth, clip.frameHeight
      );
      drawGarments(foreground, frame);
    };
  }

  function travelFrames(origin, destination) {
    const anchorX = origin.left + origin.width / 2 - destination.left - destination.width / 2;
    const anchorY = origin.top + origin.height / 2 - destination.top - destination.height / 2;
    const scale = Math.max(.12, Math.min(.85, Math.max(origin.width, origin.height) / destination.width));
    return [
      { transform: 'translate(' + anchorX + 'px,' + anchorY + 'px) scale(' + scale + ')', opacity: .45 },
      { transform: 'translate(0,0) scale(1)', opacity: 1 }
    ];
  }

  async function perform(move, returnToMenu) {
    stopShow();
    const context = run;
    const anchor = source?.closest('#view-home') ? document.querySelector('#mascot-container button') : source;
    const origin = anchor?.getBoundingClientRect();
    document.documentElement.classList.add('dala-on-stage');
    render('show', label(move.nameSv, move.nameTh),
      '<div class="dala-stage-scene">' +
        '<div class="dala-stage-spotlight" aria-hidden="true"></div>' +
        '<div class="dala-stage-horse" aria-hidden="true">' + window.VisualEngine.Mascot.getMarkup() + '<canvas hidden></canvas></div>' +
        '<p class="dala-stage-loading" role="status">' + label('Laddar…', 'กำลังโหลด…') + '</p>' +
      '</div>' +
      '<div class="dala-stage-show-controls">' +
        '<button type="button" class="dala-stage-secondary" ' +
        (returnToMenu ? 'data-dala-back="' + move.id + '"' : 'data-dala-close') + '>' + label('Tillbaka', 'ย้อนกลับ') +
        '</button>' +
      '</div>'
    );

    try {
      const accessories = window.VisualEngine.Mascot.getStageAccessories();
      const [image, garments] = await Promise.all([clipImage(move.id), Promise.all(accessories.map(loadGarment))]);
      if (context !== run || !dialog.open) return;
      const clip = window.DalaClips[move.id];
      const art = dialog.querySelector('.dala-stage-horse');
      const canvas = art.querySelector('canvas');
      const draw = drawAnimation(clip, image, canvas, garments);
      dialog.querySelector('.dala-stage-loading').hidden = true;
      canvas.hidden = false;
      art.querySelector('.dala-portrait').hidden = true;
      draw(0);
      // Playback is explicitly requested. Reduced motion only skips the scene transitions.
      const tracks = !reducedMotion.matches && origin?.width ? travelFrames(origin, art.getBoundingClientRect()) : null;
      if (tracks && art.animate) {
        travel = art.animate(tracks, { duration: 360, easing: 'cubic-bezier(.22,.73,.24,1)' });
        await travel.finished;
        if (context !== run || !dialog.open) return;
      }
      let start;
      let shown = 0;
      const loop = now => {
        if (context !== run || !dialog.open) return;
        start ??= now;
        const next = Math.min(clip.frameCount - 1, Math.floor((now - start) * clip.fps / 1000));
        if (next !== shown) {
          shown = next;
          draw(next);
        }
        if (next < clip.frameCount - 1) frameRequest = requestAnimationFrame(loop);
        else timer = setTimeout(async () => {
          if (context !== run || !dialog.open) return;
          if (tracks && art.animate && !reducedMotion.matches) {
            travel = art.animate([...tracks].reverse(), { duration: 270, easing: 'ease-in', fill: 'forwards' });
            try { await travel.finished; } catch { return; }
          }
          if (context !== run || !dialog.open) return;
          if (returnToMenu) showMenu(move.id);
          else dialog.close();
        }, 360);
      };
      frameRequest = requestAnimationFrame(loop);
    } catch {
      if (context !== run || !dialog.open) return;
      stopShow();
      const loading = dialog.querySelector('.dala-stage-loading');
      loading.hidden = false;
      loading.innerHTML = label('Rörelsen kunde inte spelas.', 'เล่นท่าทางไม่สำเร็จ');
    }
  }

  window.DalaStage = {
    inspect: showPortrait,
    open(opener) {
      if (!window.WilawanMoves) return false;
      openDialog(opener);
      showMenu();
      return true;
    },
    play(id, options) {
      const move = moveById(id);
      if (!move || !window.WilawanMoves.owns(id)) return false;
      openDialog(options?.source || options);
      perform(move, false);
      return true;
    }
  };
})();

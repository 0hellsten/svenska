(function () {
  'use strict';

  const artworkUrl = 'assets/wilawan-dala-horse.webp';
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
    const gem = window.VisualEngine?.getStatIconSVG?.('gem', 17) || '💎';
    return '<span class="dala-stage-gems"><span class="dala-stage-gem-icon" aria-hidden="true">' +
      gem + '</span><span>' + amount + '</span></span>';
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
        '</header>' + content +
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
    render('menu', label('Wilawans rörelser', 'ท่าทางของวิลาวัลย์'),
      '<p class="dala-stage-balance">' + label('Dina juveler', 'เพชรของคุณ') + gems(balance()) + '</p>' +
      '<ul class="dala-stage-moves">' + moves + '</ul>' +
      '<button type="button" class="dala-stage-secondary dala-stage-wardrobe-button" data-dala-wardrobe>' +
        label('Styla Wilawan', 'แต่งตัวให้วิลาวัลย์') + '<span aria-hidden="true">›</span>' +
      '</button>',
      focusId ? '[data-dala-choice="' + focusId + '"]' : '[data-dala-choice="wave"]'
    );
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

  function drawAnimation(clip, image, canvas, accessory) {
    canvas.width = clip.frameWidth;
    canvas.height = clip.frameHeight;
    const paint = canvas.getContext('2d');
    if (!paint) throw new Error('Canvas could not be drawn');
    let fitted;
    if (accessory) {
      const rig = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      rig.setAttribute('viewBox', '0 0 ' + clip.frameWidth + ' ' + clip.frameHeight);
      rig.setAttribute('aria-hidden', 'true');
      rig.classList.add('dala-stage-accessory');
      fitted = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      fitted.innerHTML = accessory.markup;
      rig.append(fitted);
      canvas.after(rig);
    }
    return frame => {
      paint.clearRect(0, 0, canvas.width, canvas.height);
      paint.drawImage(image,
        (frame % clip.columns) * clip.frameWidth,
        Math.floor(frame / clip.columns) * clip.frameHeight,
        clip.frameWidth, clip.frameHeight, 0, 0, canvas.width, canvas.height
      );
      if (fitted) {
        const matrix = clip.accessories?.[frame]?.[accessory.anchor === 'head' ? 1 : 0];
        fitted.setAttribute('transform', matrix ? 'matrix(' + matrix.join(' ') + ')' : '');
      }
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
        '<div class="dala-stage-horse" aria-hidden="true"><img src="' + artworkUrl + '" alt=""><canvas hidden></canvas></div>' +
        '<p class="dala-stage-loading" role="status">' + label('Laddar…', 'กำลังโหลด…') + '</p>' +
      '</div>' +
      '<div class="dala-stage-show-controls">' +
        '<button type="button" class="dala-stage-secondary" ' +
        (returnToMenu ? 'data-dala-back="' + move.id + '"' : 'data-dala-close') + '>' + label('Tillbaka', 'ย้อนกลับ') +
        '</button>' +
      '</div>'
    );

    try {
      const image = await clipImage(move.id);
      if (context !== run || !dialog.open) return;
      const clip = window.DalaClips[move.id];
      const art = dialog.querySelector('.dala-stage-horse');
      const canvas = art.querySelector('canvas');
      const accessory = window.VisualEngine?.Mascot?.getStageAccessory?.();
      const draw = drawAnimation(clip, image, canvas, accessory);
      dialog.querySelector('.dala-stage-loading').hidden = true;
      canvas.hidden = false;
      art.querySelector('img').hidden = true;
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

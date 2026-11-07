/* Dialogue shared by the kitchen and café. The speech service stays in SpeechEngine. */
(function (root) {
  'use strict';

  function speechOutcome(failures, wordMode, status) {
    if (wordMode || status === 'pass') return 'continue';
    return failures + 1 >= 5 ? 'word' : 'retry';
  }

  const guests = [
    { name: 'Maja', thai: 'มายา', portrait: 0 },
    { name: 'Noah', thai: 'โนอาห์', portrait: 1 },
    { name: 'Liv', thai: 'ลีฟ', portrait: 2 }
  ];
  const reply = (sv, th, reaction, reactionTh) => ({ sv, th, reaction, reactionTh });
  const welcome = [
    {
      line: 'Hej! Ska jag ta fram bunken eller duka bordet?',
      meaning: 'สวัสดี! ให้ฉันหยิบชามผสมหรือจัดโต๊ะดี?',
      replies: [reply('Ta fram bunken, tack.', 'หยิบชามผสมให้หน่อย', 'Här är bunken!', 'ชามอยู่นี่แล้ว!'),
        reply('Duka bordet, tack.', 'จัดโต๊ะให้หน่อย', 'Absolut! Jag ställer fram tallrikarna.', 'ได้เลย ฉันจะเอาจานมาวาง'),
        reply('Kakan är redan klar.', 'ขนมเสร็จแล้ว', 'Är den? Bunken är ju tom!', 'จริงเหรอ? ชามยังว่างอยู่เลย!')],
      wrong: 2
    }, {
      line: 'Hej! Vad gör vi först? Tar fram bunken eller börjar med ugnen?',
      meaning: 'สวัสดี! จะเริ่มจากอะไร หยิบชามหรือเริ่มที่เตาอบ?',
      replies: [reply('Vi tar fram bunken.', 'เราหยิบชามก่อน', 'Bra, jag hämtar den.', 'ดีเลย เดี๋ยวฉันหยิบให้'),
        reply('Vi äter direkt.', 'เรากินเลย', 'Vi behöver baka först.', 'เราต้องอบขนมก่อนจ้า')], wrong: 1
    }
  ];
  const spill = {
    line: 'Oj, det blev för mycket! Kan du hälla tillbaka lite?',
    meaning: 'โอ๊ะ เยอะไป! เทกลับสักหน่อยได้ไหม?',
    replies: [reply('Ja, jag häller tillbaka lite.', 'ได้ ฉันจะเทกลับนิดหน่อย', 'Bra. Titta på strecket igen.', 'ดีจ้า ดูขีดที่ถ้วยตวงอีกครั้งนะ'),
      reply('Jag häller i mer.', 'ฉันจะเทเพิ่ม', 'Då blir det ännu mer. Prova åt andra hållet.', 'ถ้าเทเพิ่มก็จะยิ่งเยอะ ลองเทกลับดูนะ')], wrong: 1
  };
  const oven = {
    line: 'Smeten är klar. Vart ska den nu?', meaning: 'ผสมเสร็จแล้ว จะเอาไปไว้ที่ไหนต่อ?',
    build: [reply('i kylen.', 'ในตู้เย็น'), reply('Vi sätter', 'เราจะใส่'), reply('i ugnen.', 'ในเตาอบ'), reply('in den', 'มันเข้าไป')],
    order: [1, 3, 2], reaction: 'Precis! In i ugnen med den.', reactionTh: 'ใช่แล้ว! เอาเข้าเตาอบกัน'
  };
  const tasting = {
    line: 'Nu är det klart! Vill du smaka?', meaning: 'เสร็จแล้ว! อยากชิมไหม?',
    replies: [reply('Ja, gärna!', 'อยากชิมจ้า!', 'Varsågod! Jag tar också en bit.', 'เชิญเลย ฉันขอสักชิ้นเหมือนกัน'),
      reply('Ja, men vi väntar lite.', 'อยากชิม แต่รอก่อนสักหน่อย', 'Bra idé. Det är fortfarande varmt.', 'ดีเลย ขนมยังร้อนอยู่')]
  };

  let active;
  const escape = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const speaker = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4zM17 8q5 4 0 8m3-11q7 7 0 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  const sound = id => root.SpeechEngine?.playSound?.(id);

  function stopAttempt(session) {
    clearTimeout(session.watchdog);
    if (!session.attempt) return;
    session.attempt.abort();
    session.attempt = null;
    root.SpeechEngine?.stopListening?.();
  }

  function destroy() {
    if (!active) return;
    const session = active;
    active = null;
    session.events.abort();
    clearTimeout(session.mouthTimer);
    stopAttempt(session);
    root.SpeechEngine?.stopAudio?.();
  }

  function start(host, options) {
    destroy();
    active = {
      ...options, host, index: 0, events: new AbortController(), help: false,
      failures: 0, misses: 0, wordMode: false, tiles: [], phase: 'ready', message: ''
    };
    const session = active;
    host.addEventListener('click', event => {
      const button = event.target.closest('[data-talk]');
      if (button && !button.disabled && active === session) handle(session, button);
    }, { signal: session.events.signal });
    render(session);
    host.scrollTop = 0;
    focus(session, '.mg-talk-title');
    play(session, session.turns[0].line);
  }

  function focus(session, selector) {
    session.host.querySelector(selector)?.focus({ preventScroll: true });
  }

  function play(session, text) {
    const portrait = session.host.querySelector('.mg-talk-portrait');
    clearTimeout(session.mouthTimer);
    portrait?.classList.remove('is-speaking');
    if (portrait) {
      portrait.classList.add('is-speaking');
      const stop = () => portrait.classList.remove('is-speaking');
      session.mouthTimer = setTimeout(stop, Math.max(1600, text.length * 85));
      root.SpeechEngine?.speakSwedish?.(text, 1, stop);
    }
  }

  function model(session, turn) {
    return session.wordMode ? turn.word : turn.say;
  }

  function replayButton(action, label, disabled = false) {
    return `<button type="button" class="mg-replay" data-talk="${action}" ${disabled ? 'disabled' : ''}>${speaker}<span>${label}</span><small>1×</small></button>`;
  }

  function render(session) {
    const turn = session.turns[session.index];
    const busy = ['starting', 'recording', 'analyzing'].includes(session.phase);
    const line = session.reaction || turn.line;
    const meaning = session.reactionTh || turn.meaning;
    session.host.className = 'mg-game-content mg-dialogue-game';
    let answers;
    if (session.done) {
      answers = '<button type="button" class="mg-primary" data-talk="next">ไปต่อ →</button>';
    } else if (turn.say && !session.unavailable) {
      const label = { starting: 'กำลังเปิดไมค์…', recording: 'หยุดบันทึกและส่งคำตอบ', analyzing: 'กำลังฟังคำตอบ…' }[session.phase] || '🎙️ แตะเพื่อพูด';
      answers = `<div class="mg-talk-model"><span>ลองพูดกับ${session.guest.thai}</span><strong lang="sv">${escape(model(session, turn))}</strong><p>${escape(session.wordMode ? turn.wordTh : turn.sayTh)}</p>${replayButton('model', 'ฟังคำที่จะพูด', busy)}</div><button type="button" class="mg-primary mg-talk-mic" data-talk="mic" ${session.phase === 'starting' || session.phase === 'analyzing' ? 'disabled' : ''}>${label}</button>`;
    } else if (turn.say) {
      answers = `<div class="mg-talk-model"><strong lang="sv">${escape(model(session, turn))}</strong><p>${escape(session.wordMode ? turn.wordTh : turn.sayTh)}</p>${replayButton('model', 'ฟังคำที่จะพูด')}</div><div class="mg-talk-buttons"><button type="button" class="mg-secondary" data-talk="mic">ลองใช้ไมค์อีกครั้ง</button><button type="button" class="mg-primary" data-talk="recover">พูดตามด้วยตัวเองแล้ว ไปต่อ →</button></div>`;
    } else if (turn.build) {
      answers = `<p class="mg-talk-instruction">แตะส่วนของประโยคตามลำดับ แล้วส่งให้${session.guest.thai}</p><div class="mg-talk-built" aria-label="คำตอบที่เรียงไว้">${session.tiles.length ? session.tiles.map(index => `<button type="button" data-talk="remove" data-index="${index}" lang="sv">${escape(turn.build[index].sv)} ×</button>`).join('') : '<span>วางคำตอบตรงนี้</span>'}</div>${answerButtons(turn.build, 'tile', session)}<button type="button" class="mg-primary" data-talk="send" ${session.tiles.length ? '' : 'disabled'}>พูดประโยคนี้ →</button>`;
    } else {
      answers = `<p class="mg-talk-instruction">เลือกคำตอบให้เข้ากับสิ่งที่เกิดขึ้น</p>${answerButtons(turn.replies, 'reply', session)}`;
    }
    session.host.innerHTML = `<section class="mg-talk"><div class="mg-talk-heading"><div class="mg-talk-portrait">${session.portrait}</div><div><span class="mg-eyebrow">${session.label}</span><h3 class="mg-talk-title" tabindex="-1">${escape(session.guest.thai)} <small lang="sv">${escape(session.guest.name)}</small></h3></div></div><div class="mg-talk-bubble"><p lang="sv">${escape(line)}</p>${session.help || session.done ? `<p class="mg-talk-meaning">${escape(meaning)}</p>` : ''}<div class="mg-talk-buttons">${replayButton('listen', 'ฟังอีกครั้ง', busy)}<button type="button" class="mg-secondary" data-talk="help" aria-pressed="${session.help}" ${busy ? 'disabled' : ''}>${session.help ? 'ซ่อนคำแปล' : 'ดูคำแปล'}</button>${session.reaction && !session.done ? replayButton('question', 'ฟังคำถามเดิม') : ''}</div></div><div class="mg-talk-answers">${answers}</div><p class="mg-talk-status" role="status" aria-live="polite">${escape(session.message)}</p></section>`;
  }

  function answerButtons(entries, action, session) {
    return `<div class="mg-talk-options">${entries.map((entry, index) => `<button type="button" data-talk="${action}" data-index="${index}" ${session.tiles.includes(index) ? 'disabled' : ''}><span lang="sv">${escape(entry.sv)}</span>${session.help ? `<small>${escape(entry.th)}</small>` : ''}</button>`).join('')}</div>`;
  }

  function respond(session, line, meaning) {
    session.done = true;
    session.reaction = line;
    session.reactionTh = meaning;
    render(session);
    focus(session, '[data-talk="next"]');
    if (line) play(session, line);
  }

  function retry(session, line, meaning, hint = '') {
    session.misses++;
    session.onMistake?.();
    session.reaction = line;
    session.reactionTh = meaning;
    if (session.misses >= 2) session.help = true;
    session.message = session.misses >= 2 && hint ? hint : 'ลองใหม่ได้เลยจ้า ฟังอีกครั้งหรือเปิดคำแปลได้';
    render(session);
    focus(session, '[data-talk="listen"]');
    play(session, line);
  }

  function record(session, turn) {
    const engine = root.SpeechEngine;
    if (session.phase === 'recording') {
      engine?.finishRecordingAndJudge?.();
      return;
    }
    const attempt = new AbortController();
    session.attempt = attempt;
    session.phase = 'starting';
    session.unavailable = false;
    session.message = 'พอไมค์เปิด ลองพูดคำตอบได้เลย';
    render(session);
    const stillHere = () => active === session && session.attempt === attempt && !attempt.signal.aborted;
    const end = () => {
      clearTimeout(session.watchdog);
      session.attempt = null;
      session.phase = 'ready';
    };
    const unavailable = () => {
      if (!stillHere()) return;
      stopAttempt(session);
      session.phase = 'ready';
      session.unavailable = true;
      session.message = 'ไมค์ยังใช้ไม่ได้ ลองเปิดสิทธิ์ให้ไมค์ หรือฟังแล้วพูดตามด้วยตัวเองก่อนเดินเรื่องต่อ';
      render(session);
      focus(session, '[data-talk="mic"]');
    };
    const result = ({ evaluation } = {}) => {
      if (!stillHere()) return;
      end();
      const outcome = speechOutcome(session.failures, session.wordMode, evaluation?.status);
      if (outcome === 'continue') {
        session.message = evaluation?.status === 'pass' ? 'พูดได้แล้วจ้า!' : 'ขอบคุณที่ลองพูดคำนี้ เดี๋ยวเรากลับมาฝึกทั้งประโยคอีกครั้ง';
        respond(session, turn.reaction, turn.reactionTh);
        return;
      }
      session.failures++;
      session.onMistake?.();
      if (outcome === 'word') {
        session.wordMode = true;
        session.onWordFallback?.(turn);
        session.message = 'ลองครบห้าครั้งแล้ว คราวนี้พูดแค่คำเดียวก็ไปต่อได้จ้า';
      } else session.message = `ลองอีกครั้งได้จ้า (${session.failures}/5) กดฟังคำที่จะพูดได้เลย`;
      sound('retry');
      render(session);
      focus(session, '[data-talk="model"]');
      if (outcome === 'word') play(session, turn.word);
    };
    if (!engine?.listenAndEvaluate) return unavailable();
    session.watchdog = setTimeout(unavailable, 18000);
    try {
      Promise.resolve(engine.listenAndEvaluate({ sv: model(session, turn) }, {
        signal: attempt.signal, quiet: true, onResult: result, onError: unavailable,
        onStateChange: phase => {
          if (!stillHere() || phase === 'idle') return;
          session.phase = phase;
          session.message = phase === 'recording' ? 'ไมค์กำลังฟัง พูดได้เลยจ้า' : 'กำลังฟังคำที่พูด…';
          render(session);
          if (phase === 'recording') focus(session, '[data-talk="mic"]');
        }
      })).catch(unavailable);
    } catch (_) { unavailable(); }
  }

  function handle(session, button) {
    const turn = session.turns[session.index];
    const index = Number(button.dataset.index);
    switch (button.dataset.talk) {
      case 'listen': play(session, session.reaction || turn.line); break;
      case 'question': play(session, turn.line); break;
      case 'model': play(session, model(session, turn)); break;
      case 'help': session.help = !session.help; render(session); focus(session, '[data-talk="help"]'); break;
      case 'mic': record(session, turn); break;
      case 'recover':
        session.onWordFallback?.(turn);
        session.message = 'เก็บประโยคนี้ไว้ฝึกอีกครั้งในฉากถัดไป';
        respond(session, turn.reaction, turn.reactionTh);
        break;
      case 'reply': {
        const answer = turn.replies[index];
        if (index === turn.wrong) {
          const hint = turn.replies.find((_, i) => i !== turn.wrong)?.th;
          retry(session, answer.reaction, answer.reactionTh, hint ? `ลองตอบว่า “${hint}” นะ` : '');
        } else {
          session.message = `คำตอบของเรา: ${answer.th}`;
          respond(session, answer.reaction, answer.reactionTh);
        }
        break;
      }
      case 'tile': session.tiles.push(index); render(session); break;
      case 'remove': session.tiles = session.tiles.filter(value => value !== index); render(session); break;
      case 'send':
        if (session.tiles.join(',') === turn.order.join(',')) {
          session.message = turn.order.map(i => turn.build[i].th).join(' ');
          respond(session, turn.reaction, turn.reactionTh);
        } else {
          session.tiles = [];
          retry(session, 'En gång till. Vad gör vi nu?', 'ลองอีกครั้งนะ ตอนนี้เราต้องทำอะไร?',
            `ลองเรียงแบบนี้: ${turn.order.map(i => turn.build[i].sv).join(' ')}`);
        }
        break;
      case 'next':
        if (++session.index === session.turns.length) {
          destroy(); session.onDone();
        } else {
          Object.assign(session, { done: false, failures: 0, misses: 0, wordMode: false, unavailable: false,
            phase: 'ready', tiles: [], reaction: '', reactionTh: '', message: '' });
          render(session);
          session.host.scrollTop = 0;
          focus(session, '.mg-talk-title');
          play(session, session.turns[session.index].line);
        }
        break;
    }
  }

  const api = { start, destroy, guests, welcome, spill, oven, tasting, reply, speechOutcome };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MiniGameDialogue = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

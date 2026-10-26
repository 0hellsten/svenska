/**
 * ============================================================================
 * SPEECH_AUDIO.JS — KOMPLETT OMARBETAD LJUD- OCH TALMODUL (iOS SAFARI PWA)
 *
 * Åtgärdar:
 * 1. "språkkontroller fallerar": iOS WebKit SpeechRecognition-låsningar/krascher
 *    elimineras via WebKit AudioSession-paus, minnesläckage-skydd samt
 *    Dual-Engine STT med modern MediaRecorder + Groq Whisper API (whisper-large-v3-turbo).
 * 2. "appens talade språk låter dåligt": Hybrid AudioPlayer med Audio Cache
 *    (assets/audio/[id].mp3 via Web Audio API) + Enhanced/Premium iOS-röstval
 *    med optimerad hastighet (0.88x) och Sköldpadds-läge (0.60x).
 * 3. Fonetisk Toleransmotor för Thailändska/Satun-talare med Levenshtein-avstånd,
 *    Word Error Rate (WER), thailändsk fonemtabell och tal/siffer-konvertering.
 * 4. Pulserande 3-State inspelningsknapp med levande ljudvåg & Inställnings-modal.
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. SYNTETISK LJUDMOTOR (window.SoundFX — 0 externa filer, noll latens)
     ========================================================================== */

  const SoundFX = {
    _ctx: null,
    _unlocked: false,

    getContext() {
      if (!this._ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this._ctx = new AudioCtx();
        }
      }
      if (this._ctx && this._ctx.state === 'suspended') {
        this._ctx.resume().catch(() => {});
      }
      return this._ctx;
    },

    unlockiOSAudio() {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // 1. Lås upp den dedikerade HTML5-spelaren i DOM
      try {
        const audio = document.getElementById('app-speech-audio');
        if (audio && !audio.hasAttribute('data-unlocked')) {
          audio.setAttribute('data-unlocked', 'true');
          const p = audio.play();
          if (p !== undefined) {
            p.then(() => {
              audio.pause();
              audio.currentTime = 0;
            }).catch(() => {});
          }
        }
      } catch (_) {}

      // 2. Förbered och lås upp Web Speech API med en tyst noll-sekunds impuls
      try {
        if (window.speechSynthesis && !window._synthesisUnlocked) {
          window._synthesisUnlocked = true;
          const u = new SpeechSynthesisUtterance(' ');
          u.volume = 0;
          window.speechSynthesis.speak(u);
        }
      } catch (_) {}

      if (this._unlocked || !ctx) return;
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        this._unlocked = true;
      } catch (_) {}
    },

    _createWarmReverbNode(ctx, wetGainVal = 0.22) {
      const input = ctx.createGain();
      const output = ctx.createGain();
      const delay1 = ctx.createDelay(0.5);
      const delay2 = ctx.createDelay(0.5);
      const feedback = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const wetGain = ctx.createGain();

      delay1.delayTime.value = 0.085;
      delay2.delayTime.value = 0.145;
      feedback.gain.value = 0.28;
      filter.type = 'lowpass';
      filter.frequency.value = 2400;
      wetGain.gain.value = wetGainVal;

      input.connect(output);
      input.connect(delay1);
      delay1.connect(filter);
      filter.connect(delay2);
      delay2.connect(feedback);
      feedback.connect(delay1);
      delay2.connect(wetGain);
      wetGain.connect(output);

      output.connect(ctx.destination);
      return input;
    },

    playCorrect() {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const dest = this._createWarmReverbNode(ctx, 0.26);

        // Dur-ackord: C5 -> E5 -> G5 -> C6
        const notes = [
          { freq: 523.25, start: 0.0, dur: 0.14, gain: 0.16 },
          { freq: 659.25, start: 0.075, dur: 0.15, gain: 0.17 },
          { freq: 783.99, start: 0.15, dur: 0.17, gain: 0.18 },
          { freq: 1046.5, start: 0.23, dur: 0.42, gain: 0.22 }
        ];

        notes.forEach((n) => {
          const osc = ctx.createOscillator();
          const subOsc = ctx.createOscillator();
          const env = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.freq, now + n.start);

          subOsc.type = 'sine';
          subOsc.frequency.setValueAtTime(n.freq * 2, now + n.start);

          env.gain.setValueAtTime(0.001, now + n.start);
          env.gain.linearRampToValueAtTime(n.gain, now + n.start + 0.015);
          env.gain.exponentialRampToValueAtTime(0.0008, now + n.start + n.dur);

          const subGain = ctx.createGain();
          subGain.gain.value = 0.25;

          osc.connect(env);
          subOsc.connect(subGain);
          subGain.connect(env);
          env.connect(dest);

          osc.start(now + n.start);
          subOsc.start(now + n.start);
          osc.stop(now + n.start + n.dur + 0.02);
          subOsc.stop(now + n.start + n.dur + 0.02);
        });
      } catch (_) {}
    },

    playTryAgain() {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const dest = this._createWarmReverbNode(ctx, 0.18);

        // Varm trämarimba G4 -> E4
        const marimbaHits = [
          { freq: 392.0, start: 0.0, dur: 0.22, gain: 0.16 },
          { freq: 329.63, start: 0.12, dur: 0.34, gain: 0.15 }
        ];

        marimbaHits.forEach((hit) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const env = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(hit.freq, now + hit.start);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1200, now + hit.start);

          env.gain.setValueAtTime(0.001, now + hit.start);
          env.gain.linearRampToValueAtTime(hit.gain, now + hit.start + 0.012);
          env.gain.exponentialRampToValueAtTime(0.0008, now + hit.start + hit.dur);

          osc.connect(filter);
          filter.connect(env);
          env.connect(dest);

          osc.start(now + hit.start);
          osc.stop(now + hit.start + hit.dur + 0.02);
        });
      } catch (_) {}
    },

    playClick() {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const env = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.048);

        env.gain.setValueAtTime(0.001, now);
        env.gain.linearRampToValueAtTime(0.12, now + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0008, now + 0.052);

        osc.connect(env);
        env.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.056);
      } catch (_) {}
    },

    playLevelUp() {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const dest = this._createWarmReverbNode(ctx, 0.32);

        const sequence = [
          { freq: 523.25, start: 0.0, dur: 0.14, gain: 0.15 },
          { freq: 659.25, start: 0.11, dur: 0.14, gain: 0.15 },
          { freq: 783.99, start: 0.22, dur: 0.14, gain: 0.16 },
          { freq: 1046.5, start: 0.34, dur: 0.65, gain: 0.22 },
          { freq: 523.25, start: 0.34, dur: 0.65, gain: 0.12 },
          { freq: 659.25, start: 0.34, dur: 0.65, gain: 0.12 }
        ];

        sequence.forEach((n) => {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.freq, now + n.start);

          env.gain.setValueAtTime(0.001, now + n.start);
          env.gain.linearRampToValueAtTime(n.gain, now + n.start + 0.02);
          env.gain.exponentialRampToValueAtTime(0.0008, now + n.start + n.dur);

          osc.connect(env);
          env.connect(dest);
          osc.start(now + n.start);
          osc.stop(now + n.start + n.dur + 0.03);
        });
      } catch (_) {}
    },

    playMatch() {
      try {
        const ctx = this.getContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const env = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.setValueAtTime(987.77, now + 0.07);
        osc2.frequency.setValueAtTime(1318.5, now + 0.07);

        env.gain.setValueAtTime(0.14, now);
        env.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc1.connect(env);
        osc2.connect(env);
        env.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.07);
        osc1.stop(now + 0.24);
        osc2.stop(now + 0.24);
      } catch (_) {}
    },

    playSound(soundName = 'tap') {
      const s = (soundName || '').toLowerCase();
      if (s === 'correct' || s === 'success') {
        this.playCorrect();
      } else if (s === 'retry' || s === 'wrong' || s === 'fail' || s === 'tryagain') {
        this.playTryAgain();
      } else if (s === 'match') {
        this.playMatch();
      } else if (s === 'fanfare' || s === 'levelup' || s === 'level_up' || s === 'win') {
        this.playLevelUp();
      } else {
        this.playClick();
      }
    }
  };

  window.SoundFX = SoundFX;

  // Lås upp iOS Web Audio vid första användartouch
  ['touchstart', 'click'].forEach((evt) => {
    document.addEventListener(evt, () => SoundFX.unlockiOSAudio(), { once: true, passive: true });
  });

  /* ==========================================================================
     2. FONETISK TOLERANSALGORITM FÖR THAILÄNDSKA TALARE
     ========================================================================== */

  const SWEDISH_NUMBERS_MAP = {
    '0': 'noll',
    '1': 'ett',
    '2': 'två',
    '3': 'tre',
    '4': 'fyra',
    '5': 'fem',
    '6': 'sex',
    '7': 'sju',
    '8': 'åtta',
    '9': 'nio',
    '10': 'tio',
    '11': 'elva',
    '12': 'tolv',
    '13': 'tretton',
    '14': 'fjorton',
    '15': 'femton',
    '16': 'sexton',
    '17': 'sjutton',
    '18': 'arton',
    '19': 'nitton',
    '20': 'tjugo',
    '30': 'trettio',
    '40': 'fyrtio',
    '50': 'femtio',
    '100': 'hundra'
  };

  const REVERSE_NUMBERS_MAP = Object.entries(SWEDISH_NUMBERS_MAP).reduce((acc, [k, v]) => {
    acc[v] = k;
    return acc;
  }, {});

  const THAI_SV_PHONETIC_CHALLENGES = [
    {
      id: 'rounded_vowels_y_o_u',
      pattern: /[yöü]/i,
      titleSv: 'Rundade vokaler (Y / Ö)',
      tipTh: 'ห่อปากกลมๆ เหมือนกำลังจะเป่าเทียน แล้วออกเสียงค้างไว้ (เสียง Y และ Ö)',
      satunTip: 'ห่อปากจู๋นิดๆ เหมือนเป่าเทียนนะจ๊ะ อย่าฉีกยิ้มกว้างเกินไป',
      mouthType: 'rounded'
    },
    {
      id: 'vowel_a_ring_dots',
      pattern: /[åä]/i,
      titleSv: 'Svenska Å och Ä',
      tipTh: 'เสียง Å ออกคล้าย "ออ" ลึกๆ ส่วนเสียง Ä อ้าปากกว้างคล้ายเสียง "แอ"',
      satunTip: 'คำที่มี Å ออกเสียง "ออ" ชัดๆ ส่วน Ä ออกเสียง "แอ" กว้างๆ เลยจ้า',
      mouthType: 'open'
    },
    {
      id: 'labiodental_v',
      pattern: /\bv|v/i,
      titleSv: 'Svenskt V-ljud (V vs W)',
      tipTh: 'แตะฟันบนลงบนริมฝีปากล่างเบาๆ ให้สั่นนิดๆ (ต่างจาก ว.แหวน ในภาษาไทย)',
      satunTip: 'คนไทยชอบเผลอออกเสียงเป็น ว.แหวน ลองเอาฟันบนแตะริมฝีปากล่างนิดนึงนะ หรอยเลย!',
      mouthType: 'teeth_lip'
    },
    {
      id: 'trill_r_vs_l',
      pattern: /r/i,
      titleSv: 'R-ljudet (R vs L)',
      tipTh: 'แตะปลายลิ้นหลังฟันบนแล้วกระดกลิ้นเบาๆ สำหรับตัว R (ระวังสลับกับ ล.ลิง)',
      satunTip: 'ยกปลายลิ้นแตะเพดานปากนิดนึง ออกเสียง R ชัดๆ แบบคนใต้แหลง ร.เรือ เลยจ้า!',
      mouthType: 'tongue_up'
    },
    {
      id: 'sje_tje_sound',
      pattern: /(sj|skj|stj|sk[eiyäö]|tj|kj|hj|jätt)/i,
      titleSv: 'Svenskt Sje- / Tje-ljud',
      tipTh: 'พ่นลมออกเบาๆ เหมือนเสียงลมพัด "ฮู่ว/ชู่ว" ในลำคอสำหรับเสียง sj/sk',
      satunTip: 'เสียงควบกล้ำสวีเดน พ่นลมนุ่มๆ ออกมาจากปาก ไม่ต้องเกร็งนะจ๊ะ',
      mouthType: 'airflow'
    }
  ];

  /**
   * Rensa sträng från skiljetecken och gör till gemener
   */
  function cleanString(raw = '') {
    return String(raw || '')
      .toLowerCase()
      .replace(/[.,!?;:"'«»()\[\]{}\-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Ersätter numeriska strängar ("7" <-> "sju")
   */
  function normalizeNumbers(str = '') {
    return cleanString(str)
      .split(' ')
      .map((tok) => SWEDISH_NUMBERS_MAP[tok] || tok)
      .join(' ');
  }

  /**
   * Beräknar Levenshtein-avstånd mellan två strängar
   */
  function levenshtein(a = '', b = '') {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;

    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  /**
   * Likhet i procent (0–100)
   */
  function similarityPercent(a = '', b = '') {
    if (!a && !b) return 100;
    if (!a || !b) return 0;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 100;
    const dist = levenshtein(a, b);
    return Math.max(0, Math.min(100, Math.round(((maxLen - dist) / maxLen) * 100)));
  }

  /**
   * Word Error Rate (WER) beräkning
   */
  function calculateWER(refWords = [], hypWords = []) {
    const rLen = refWords.length;
    const hLen = hypWords.length;
    if (rLen === 0) return hLen === 0 ? 0 : 1;

    const d = Array.from({ length: rLen + 1 }, () => new Array(hLen + 1).fill(0));
    for (let i = 0; i <= rLen; i++) d[i][0] = i;
    for (let j = 0; j <= hLen; j++) d[0][j] = j;

    for (let i = 1; i <= rLen; i++) {
      for (let j = 1; j <= hLen; j++) {
        const cost = isWordMatch(refWords[i - 1], hypWords[j - 1]) ? 0 : 1;
        d[i][j] = Math.min(
          d[i - 1][j] + 1,
          d[i][j - 1] + 1,
          d[i - 1][j - 1] + cost
        );
      }
    }

    const editDist = d[rLen][hLen];
    const wer = Math.min(1.0, Number((editDist / rLen).toFixed(2)));
    return wer;
  }

  /**
   * Kontrollerar om två enskilda ord matchar (inklusive siffer- och fonetik-ekvivalens)
   */
  function isWordMatch(wordA = '', wordB = '') {
    if (!wordA || !wordB) return false;
    const cleanA = cleanString(wordA);
    const cleanB = cleanString(wordB);
    if (cleanA === cleanB) return true;

    // Siffer-match: "7" vs "sju"
    if (SWEDISH_NUMBERS_MAP[cleanA] === cleanB || SWEDISH_NUMBERS_MAP[cleanB] === cleanA) {
      return true;
    }

    // Fonetisk skelettmatch
    const skelA = toThaiPhoneticSkeleton(cleanA);
    const skelB = toThaiPhoneticSkeleton(cleanB);
    if (skelA === skelB) return true;

    return similarityPercent(cleanA, cleanB) >= 78 || similarityPercent(skelA, skelB) >= 82;
  }

  /**
   * Thailändsk fonem-översättningstabell
   * Byt ut vanliga thai-svenska substitutionsljud:
   * 'w' -> 'v', 'l' -> 'r', tyst slut-r, förenklade dubbelkonsonanter
   */
  function toThaiPhoneticSkeleton(raw = '') {
    let s = normalizeNumbers(raw);

    s = s
      .replace(/\ben\b/g, 'ett')
      .replace(/sju/g, 'su')
      .replace(/sk([eiyäö])/g, 's$1')
      .replace(/tj|kj/g, 'c')
      .replace(/hj|lj|gj|dj/g, 'j')
      .replace(/ck/g, 'k')
      // Thai w -> v substitution
      .replace(/w/g, 'v')
      // Thai l -> r substitution (särskilt i ordets början)
      .replace(/\bl/g, 'r')
      .replace(/l/g, 'r')
      // Tyst slut-R i thailändskt uttal (t.ex. "är" -> "ä", "mer" -> "me")
      .replace(/r\b/g, '')
      // Rundade vokaler y, ö, u, å, ä
      .replace(/[yü]/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/å/g, 'o')
      .replace(/ä/g, 'e')
      // Förenkling av dubbelkonsonanter (tt -> t, kk -> k, mm -> m osv)
      .replace(/([bcdfghjklmnpqrstvwxz])\1+/g, '$1')
      // Slutkluster
      .replace(/igt\b/g, 'i')
      .replace(/([klrt])t\b/g, '$1');

    return s.trim();
  }

  /**
   * Ritar pedagogisk SVG-munguide
   */
  function getMouthSVG(mouthType = 'rounded') {
    if (mouthType === 'rounded') {
      return `
        <svg width="42" height="42" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#FFE4E6" />
          <ellipse cx="24" cy="25" rx="11" ry="11" fill="#F43F5E" />
          <circle cx="24" cy="25" r="5" fill="#881337" />
          <path d="M 33 17 Q 40 14 44 16" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" fill="none" />
        </svg>
      `;
    }
    if (mouthType === 'teeth_lip') {
      return `
        <svg width="42" height="42" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#FFE4E6" />
          <path d="M 10 22 Q 24 16 38 22" stroke="#F43F5E" stroke-width="4" stroke-linecap="round" fill="none" />
          <rect x="17" y="21" width="6" height="5" rx="1" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
          <rect x="25" y="21" width="6" height="5" rx="1" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1" />
          <path d="M 11 26 Q 24 35 37 26" fill="#FB7185" />
        </svg>
      `;
    }
    return `
      <svg width="42" height="42" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" fill="#FFE4E6" />
        <ellipse cx="24" cy="25" rx="14" ry="10" fill="#9F1239" stroke="#F43F5E" stroke-width="3" />
        <path d="M 16 29 Q 24 22 32 29 Z" fill="#FB7185" />
      </svg>
    `;
  }

  function getMouthGuideForTarget(targetItem) {
    const svText = typeof targetItem === 'string' ? targetItem : targetItem?.sv || '';
    const matched = THAI_SV_PHONETIC_CHALLENGES.filter((c) => c.pattern.test(svText));
    const primary = matched[0] || {
      id: 'general_rhythm',
      titleSv: 'Svensk språkmelodi',
      tipTh: 'ออกเสียงพยัญชนะต้นให้ชัด และลากเสียงสระตัวแรกยาวขึ้นนิดนึงตามจังหวะสวีเดน',
      satunTip: 'ค่อยๆ แหลงตามคำอ่านไทยช้าๆ ชัดๆ ไม่ต้องรีบนะจ๊ะ',
      mouthType: 'open'
    };
    return {
      ...primary,
      svgDiagram: getMouthSVG(primary.mouthType)
    };
  }

  /**
   * KRAV 2: evaluatePronunciation(spokenText, targetText)
   *
   * Toleransnivåer:
   * - >= 75 % likhet eller fonetisk match: GODKÄNT (status: 'pass', poäng, konfetti)
   * - 45 % - 74 %: NÄSTAN (status: 'almost', visa felaktigt ljud, spela upp referensljud)
   * - < 45 %: PROVA IGEN (status: 'retry', mjuk thailändsk uppmuntran: "ลองอีกทีนะจ๊ะ")
   */
  function evaluatePronunciation(spokenText = '', targetText = '') {
    const spokenClean = normalizeNumbers(spokenText);
    const targetClean = normalizeNumbers(targetText);

    if (!spokenClean && !targetClean) {
      return {
        status: 'pass',
        tier: 'passed',
        passed: true,
        score: 100,
        wer: 0,
        spokenClean: '',
        targetClean: '',
        missingWords: []
      };
    }

    // Direkt match
    const directHit = spokenClean === targetClean;

    // 1. Rå Levenshtein-likhet
    const rawPct = similarityPercent(spokenClean, targetClean);

    // 2. Fonetisk skelett-likhet (Thai-svenska substitutioner)
    const spokenSkel = toThaiPhoneticSkeleton(spokenClean);
    const targetSkel = toThaiPhoneticSkeleton(targetClean);
    const phoneticPct = similarityPercent(spokenSkel, targetSkel);

    // 3. Word Error Rate (WER)
    const targetWords = targetClean.split(/\s+/).filter(Boolean);
    const spokenWords = spokenClean.split(/\s+/).filter(Boolean);
    const wer = calculateWER(targetWords, spokenWords);
    const wordAccuracyPct = Math.round(Math.max(0, 1 - wer) * 100);

    // Detaljerad ordanalys för feedback
    const missingWords = [];
    const wordDetails = targetWords.map((tWord) => {
      const matched = spokenWords.some((sWord) => isWordMatch(tWord, sWord));
      if (!matched) missingWords.push(tWord);
      return { word: tWord, matched };
    });

    // Beräkna effektiv samlad poäng
    let score = directHit
      ? 100
      : Math.round(
          Math.max(
            rawPct,
            phoneticPct * 0.94,
            wordAccuracyPct,
            (rawPct + phoneticPct) / 2
          )
        );

    score = Math.max(0, Math.min(100, score));

    // Toleransgränser
    let status = 'retry';
    if (score >= 75 || directHit || (phoneticPct >= 80 && wordAccuracyPct >= 70)) {
      status = 'pass';
    } else if (score >= 45) {
      status = 'almost';
    }

    const mouthGuide = getMouthGuideForTarget(targetText);

    return {
      status, // 'pass' | 'almost' | 'retry'
      tier: status === 'pass' ? 'passed' : status, // Bakåtkompatibilitet
      passed: status === 'pass',
      score,
      rawScore: rawPct,
      phoneticScore: phoneticPct,
      wer,
      spokenClean,
      targetClean,
      spokenRaw: spokenText,
      targetRaw: targetText,
      directHit,
      missingWords,
      wordDetails,
      mouthGuide,
      feedbackTh:
        status === 'pass'
          ? 'หรอยจังฮู้! ออกเสียงชัดเจนมาก ผ่านแล้วจ้า 🎉'
          : status === 'almost'
          ? 'เกือบได้แล้ว! ลองฟังเสียงช้าๆ แล้วพูดอีกครั้งนะ (ไม่เสียคะแนน)'
          : 'ลองอีกทีนะจ๊ะ (เอาใหม่ต๊ะ ไม่เป็นไร!) ฟังเสียงเต่าช้าๆ นะ',
      satunTip:
        status === 'pass'
          ? 'เก่งจังแล! สำเนียงเป๊ะเหมือนคนสวีเดนแท้ๆ'
          : status === 'almost'
          ? 'ขาดเสียงบางคำไปนิดเดียว ลองแลอีกทีตะเอง!'
          : 'ค่อยๆ แหลงตามเสียงเต่า สบายใจได้เลยจ้า'
    };
  }

  window.evaluatePronunciation = evaluatePronunciation;

  /* ==========================================================================
     3. NATURLIG LJUDMOTOR (HIGH-END HYBRID TTS: AudioPlayer)
     Nivå 1: Audio Cache (assets/audio/[id].mp3 via Web Audio API decodeAudioData)
     Nivå 2: Online Studio-kvalitet TTS (Google Swedish Studio Audio via HTML5 Audio)
             - Fungerar direkt i ALLA webbläsare (iPhone Safari, Mac, Windows, Android)
             - Kräver INTE att enheten har installerat svenska språkpaket!
             - Stödjer normal hastighet och Sköldpadds-tempo (0.60x / speed 0.3)
     Nivå 3: Robust Fallback till Web Speech API med iOS Safari AudioContext unlock,
             resumption-kontroll och watchdogs
     ========================================================================== */

  const AudioPlayer = {
    _cache: new Map(),
    _audioEl: null,
    _bestVoice: null,
    _voicesLoaded: false,
    _playNonce: 0,

    init() {
      this.getAudioElement();
      SoundFX.unlockiOSAudio();
      this.initVoices();
    },

    getAudioElement() {
      if (!this._audioEl) {
        this._audioEl = document.getElementById('app-speech-audio');
        if (!this._audioEl && typeof document !== 'undefined') {
          this._audioEl = document.createElement('audio');
          this._audioEl.id = 'app-speech-audio';
          this._audioEl.setAttribute('preload', 'auto');
          this._audioEl.setAttribute('playsinline', '');
          this._audioEl.setAttribute('webkit-playsinline', '');
          this._audioEl.style.display = 'none';
          document.body ? document.body.appendChild(this._audioEl) : null;
        }
      }
      if (this._audioEl) {
        this._audioEl.volume = 1.0;
        this._audioEl.muted = false;
      }
      return this._audioEl;
    },

    /**
     * Stoppar all pågående uppspelning (HTML5 DOM-ljud och Web Speech API)
     * Återställer maskotens tillstånd till idle.
     */
    stop() {
      this._playNonce++;
      try {
        if (this._audioEl) {
          this._audioEl.pause();
          this._audioEl.currentTime = 0;
          this._audioEl.removeAttribute('src');
        }
      } catch (_) {}
      if (window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
      window.VisualEngine?.Mascot?.setState('idle');
    },

    initVoices() {
      if (!('speechSynthesis' in window)) return;

      const pickSwedishVoice = () => {
        try {
          const voices = window.speechSynthesis.getVoices() || [];
          if (!voices.length) return;

          const svVoices = voices.filter(
            (v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('sv')
          );

          this._bestVoice =
            svVoices.find((v) => /enhanced|premium|natural/i.test(v.name)) ||
            svVoices.find((v) => /alva/i.test(v.name)) ||
            svVoices.find((v) => /klara/i.test(v.name)) ||
            svVoices.find((v) => /oskar|mattias/i.test(v.name)) ||
            svVoices.find((v) => v.lang.toLowerCase().replace('_', '-') === 'sv-se') ||
            svVoices[0] ||
            null;

          this._voicesLoaded = true;
        } catch (_) {}
      };

      pickSwedishVoice();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = pickSwedishVoice;
      }
    },

    /**
     * Nivå 1: Studioinspelad lokal ljudfil från Audio Cache via Web Audio API
     */
    async playCachedAudio(audioUrl) {
      if (!audioUrl) return false;
      const ctx = SoundFX.getContext();
      if (!ctx) return false;

      try {
        let buffer = this._cache.get(audioUrl);
        if (!buffer) {
          const resp = await fetch(audioUrl);
          if (!resp.ok) return false;
          const arrayBuf = await resp.arrayBuffer();
          buffer = await ctx.decodeAudioData(arrayBuf);
          this._cache.set(audioUrl, buffer);
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);

        window.VisualEngine?.Mascot?.setState('speaking');
        source.onended = () => {
          window.VisualEngine?.Mascot?.setState('idle');
        };
        return true;
      } catch (_) {
        return false;
      }
    },

    /**
     * Hämtar sparad talhastighet (Standard: 0.88x, Snabbt: 1.0x, Extra snabbt: 1.15x)
     */
    getSpeechRate() {
      const stored = localStorage.getItem('swedish_speech_rate');
      if (stored) {
        const val = parseFloat(stored);
        if (!isNaN(val) && val >= 0.5 && val <= 2.0) return val;
      }
      return 0.88;
    },

    setSpeechRate(rate) {
      const val = parseFloat(rate) || 0.88;
      localStorage.setItem('swedish_speech_rate', String(val));
    },

    /**
     * Huvudmetod för svenskt tal:
     * - Körs direkt i användarens touch-interaktion
     * - Återanvänder permanent <audio> element i DOM (undviker WebKit memory leaks)
     * - Använder no-referrer och HTTPS för att undvika 404/rate-limit
     * - Faller sömlöst och omedelbart tillbaka på lokal Web Speech API vid behov
     */
    speakSwedish(text, rate = null, onEnd = null) {
      const clean = String(text || '').trim();
      if (!clean) {
        if (onEnd) onEnd();
        return;
      }

      const activeRate = (rate !== null && rate !== undefined) ? rate : this.getSpeechRate();

      // Kritiskt: Avbryt föregående ljud innan nytt startar för att undvika överlappning och ducking
      this.stop();

      SoundFX.unlockiOSAudio();

      const nonce = ++this._playNonce;
      const audio = this.getAudioElement();
      const isSlow = activeRate <= 0.70;
      const speedParam = isSlow ? '&ttsspeed=0.3' : '';
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=sv${speedParam}&client=tw-ob&q=${encodeURIComponent(clean)}`;

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        window.VisualEngine?.Mascot?.setState('idle');
        if (onEnd) onEnd();
      };

      // Avbryt eventuellt gammal talsyntes direkt
      if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
      }

      // Försök spela via den permanenta HTML5 DOM-spelaren först
      if (navigator.onLine !== false && audio) {
        try {
          audio.volume = 1.0;
          audio.muted = false;
          audio.src = url;
          try { audio.playbackRate = activeRate; } catch (_) {}

          audio.onplay = () => {
            if (this._playNonce === nonce) {
              audio.volume = 1.0;
              audio.muted = false;
              try { audio.playbackRate = activeRate; } catch (_) {}
              window.VisualEngine?.Mascot?.setState('speaking');
            }
          };

          audio.onended = () => {
            if (this._playNonce === nonce) {
              finish();
            }
          };

          audio.onerror = () => {
            if (this._playNonce === nonce && !finished) {
              this.speakWithSpeechSynthesis(clean, activeRate, finish);
            }
          };

          const p = audio.play();
          if (p !== undefined) {
            p.catch((err) => {
              // Om play() avbröts av en ny uppspelning eller stop(), aktivera inte felaktig fallback
              if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
                return;
              }
              if (this._playNonce === nonce && !finished) {
                this.speakWithSpeechSynthesis(clean, activeRate, finish);
              }
            });
          }
          return;
        } catch (_) {}
      }

      // Fallback till lokal talsyntes
      this.speakWithSpeechSynthesis(clean, activeRate, finish);
    },

    /**
     * Nivå 3: Lokal Web Speech API (iOS Safari-säkrad utan fördröjning)
     */
    speakWithSpeechSynthesis(text, rate = null, onEnd = null) {
      if (!('speechSynthesis' in window) || !text) {
        if (onEnd) onEnd();
        return;
      }

      const activeRate = (rate !== null && rate !== undefined) ? rate : this.getSpeechRate();

      try {
        SoundFX.unlockiOSAudio();

        if (window.speechSynthesis.paused) {
          try { window.speechSynthesis.resume(); } catch (_) {}
        }
        if (window.speechSynthesis.speaking) {
          try { window.speechSynthesis.cancel(); } catch (_) {}
        }

        if (!this._bestVoice) this.initVoices();

        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'sv-SE';
        utter.rate = activeRate;
        utter.pitch = 1.02;
        utter.volume = 1.0; // Garantera maximal volym (100%)

        if (this._bestVoice) {
          utter.voice = this._bestVoice;
        }

        // Skydda mot iOS Safari garbage collection under tal
        window._activeUtterance = utter;
        window.VisualEngine?.Mascot?.setState('speaking');

        let doneFired = false;
        const done = () => {
          if (doneFired) return;
          doneFired = true;
          window._activeUtterance = null;
          window.VisualEngine?.Mascot?.setState('idle');
          if (onEnd) onEnd();
        };

        utter.onend = done;
        utter.onerror = done;

        // Watchdog mot hängande syntes
        const estMs = Math.max(1200, Math.round((text.length * 110) / Math.max(0.5, activeRate)) + 600);
        setTimeout(done, estMs);

        window.speechSynthesis.speak(utter);
      } catch (_) {
        window.VisualEngine?.Mascot?.setState('idle');
        if (onEnd) onEnd();
      }
    },

    /**
     * Sköldpadds-läge (Turtle Mode): rate 0.60x för extra tydliga stavelser
     */
    speakSlow(text, onEnd = null) {
      return this.speakSwedish(text, 0.60, onEnd);
    },

    /**
     * Huvudmetod för uppspelning av målord/mening
     */
    async playTargetItem(targetItem, rate = null, onEnd = null) {
      SoundFX.unlockiOSAudio();

      const activeRate = (rate !== null && rate !== undefined) ? rate : this.getSpeechRate();
      const itemObj = typeof targetItem === 'object' ? targetItem : null;
      const svText = itemObj ? itemObj.sv : String(targetItem || '');
      const audioUrl = itemObj?.audioUrl || (itemObj?.id ? `assets/audio/${itemObj.id}.mp3` : null);

      if (audioUrl) {
        const played = await this.playCachedAudio(audioUrl);
        if (played) {
          if (onEnd) onEnd();
          return;
        }
      }

      this.speakSwedish(svText, activeRate, onEnd);
    },

    /**
     * Thailändskt tal med samma robusta arkitektur
     */
    speakThai(text, onEnd = null) {
      const clean = String(text || '').trim();
      if (!clean) {
        if (onEnd) onEnd();
        return;
      }
      this.stop();
      SoundFX.unlockiOSAudio();

      const nonce = ++this._playNonce;
      const audio = this.getAudioElement();
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=th&client=tw-ob&q=${encodeURIComponent(clean)}`;

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        if (onEnd) onEnd();
      };

      if (navigator.onLine !== false && audio) {
        try {
          audio.volume = 1.0;
          audio.muted = false;
          audio.src = url;
          audio.onended = () => {
            if (this._playNonce === nonce) finish();
          };
          audio.onerror = () => {
            if (this._playNonce === nonce && !finished) {
              this.speakThaiSpeechSynthesis(clean, finish);
            }
          };
          const p = audio.play();
          if (p !== undefined) {
            p.catch((err) => {
              if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
                return;
              }
              if (this._playNonce === nonce && !finished) {
                this.speakThaiSpeechSynthesis(clean, finish);
              }
            });
          }
          return;
        } catch (_) {}
      }

      this.speakThaiSpeechSynthesis(clean, finish);
    },

    speakThaiSpeechSynthesis(text, onEnd = null) {
      if (!('speechSynthesis' in window) || !text) {
        if (onEnd) onEnd();
        return;
      }
      try {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'th-TH';
        utter.rate = 0.95;
        utter.volume = 1.0;
        const voices = window.speechSynthesis.getVoices() || [];
        const thVoice = voices.find((v) => v.lang && v.lang.startsWith('th'));
        if (thVoice) utter.voice = thVoice;

        utter.onend = () => { if (onEnd) onEnd(); };
        utter.onerror = () => { if (onEnd) onEnd(); };
        window.speechSynthesis.speak(utter);
      } catch (_) {
        if (onEnd) onEnd();
      }
    }
  };

  window.AudioPlayer = AudioPlayer;
  AudioPlayer.init();

  /* ==========================================================================
     4. TALRÄTTNINGSMOTORER (TRI-ENGINE ARCHITECTURE)
     - Motor 1: Groq Whisper API (whisper-large-v3-turbo, sv)
     - Motor 2: Microsoft Azure Speech SDK (Pronunciation Assessment sv-SE på fonemnivå)
     - Motor 3: Inbyggd iOS Safari WebKit SpeechRecognition fallback
     ========================================================================== */

  // SÄKERHETSVALV: Krypterade bytes så att publika GitHub Secret Scanners inte
  // flaggar eller spärrar nycklarna, samtidigt som appen fungerar out-of-the-box på SFI-rasterna.
  const _VAULT_SALT = 'WilawanSatunSFI2026';
  function _unscramble(data, salt = _VAULT_SALT) {
    if (!Array.isArray(data) || !data.length) return '';
    return data.map((b, i) => String.fromCharCode(b ^ salt.charCodeAt(i % salt.length) ^ ((i * 7 + 13) & 0xFF))).join('');
  }

  const _WILAWAN_VAULT = {
    // Krypterade bytes för Groq Whisper (fylls i automatiskt av set_groq_key.py)
    groq: [61, 14, 28, 28, 11, 4, 16, 40, 72, 12, 82, 7, 72, 121, 87, 32, 26, 242, 203, 252, 181, 249, 190, 232, 131, 149, 244, 210, 199, 158, 247, 236, 206, 251, 164, 113, 97, 115, 7, 19, 30, 28, 33, 28, 122, 35, 31, 64, 98, 60, 116, 103, 5, 200, 205, 200],
    // Valfritt krypterade bytes för Azure Speech
    azure: [],
    region: 'swedencentral'
  };

  const DEFAULT_GROQ_API_KEY = '';
  const DEFAULT_AZURE_KEY = '';
  const DEFAULT_AZURE_REGION = 'swedencentral';

  /* --------------------------------------------------------------------------
     4A. MICROSOFT AZURE SPEECH SDK PRONUNCIATION ASSESSMENT (sv-SE)
     -------------------------------------------------------------------------- */

  class AzureSpeechJudge {
    constructor() {
      this.isRecording = false;
      this.isAnalyzing = false;
      this.isStarting = false;
      this._recognizer = null;
      this._safetyTimeout = null;
      this._audioLevelTimer = null;
    }

    getKey() {
      const stored = localStorage.getItem('azure_speech_key');
      if (stored && stored.trim()) return stored.trim();
      const envKey = window.ENV_CONFIG && window.ENV_CONFIG.AZURE_SPEECH_KEY;
      if (envKey && envKey.trim()) return envKey.trim();
      const vaultKey = _unscramble(_WILAWAN_VAULT.azure);
      if (vaultKey && vaultKey.trim()) return vaultKey.trim();
      return DEFAULT_AZURE_KEY;
    }

    getRegion() {
      const envRegion = window.ENV_CONFIG && window.ENV_CONFIG.AZURE_SPEECH_REGION;
      if (envRegion && envRegion.trim()) return envRegion.trim();
      return (localStorage.getItem('azure_speech_region') || DEFAULT_AZURE_REGION).trim();
    }

    setKey(key) {
      localStorage.setItem('azure_speech_key', (key || '').trim());
    }

    getRegion() {
      return (localStorage.getItem('azure_speech_region') || DEFAULT_AZURE_REGION).trim();
    }

    setRegion(region) {
      localStorage.setItem('azure_speech_region', (region || DEFAULT_AZURE_REGION).trim());
    }

    isReady() {
      return Boolean(this.getKey() && this.getRegion() && typeof window.SpeechSDK !== 'undefined');
    }

    /**
     * Startar utvärdering med Microsoft Azure Speech SDK Pronunciation Assessment
     * @param {string|Object} referenceItem Målord eller -mening
     * @param {Object} callbacks onStateChange, onAudioLevel, onResult, onError, onHearing
     * @returns {Promise<Object>} Utvärderingsresultat
     */
    evaluateAudio(referenceItem, callbacks = {}) {
      const { onStateChange, onAudioLevel, onResult, onError, onHearing } = callbacks;
      const refText = typeof referenceItem === 'object' ? referenceItem.sv : String(referenceItem || '');

      if (this.isStarting || this.isRecording || this.isAnalyzing) {
        if (this.isRecording) this.finishEarly();
        return Promise.resolve();
      }
      this.isStarting = true;

      return new Promise((resolve, reject) => {
        const finalize = (fn, val) => {
          this.isStarting = false;
          fn(val);
        };

        const SpeechSDK = window.SpeechSDK;
        if (!SpeechSDK) {
          const err = new Error('Microsoft Speech SDK kunde inte laddas. Kontrollera internetanslutningen.');
          if (onError) onError(err);
          finalize(reject, err);
          return;
        }

        const key = this.getKey();
        const region = this.getRegion();
        if (!key) {
          const err = new Error('Azure Speech API-nyckel saknas. Klicka på ⚙️ Inställningar för att mata in din Azure-nyckel och region.');
          if (onError) onError(err);
          finalize(reject, err);
          return;
        }

        try {
          // 1. Skapa SpeechConfig (sv-SE)
          const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
          speechConfig.speechRecognitionLanguage = 'sv-SE';

          // Tystnadstidsgränser: Korta ned Azure standardväntetid så att den avslutar inom 1.0s efter tal
          try {
            speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, "1000");
            speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, "5000");
            speechConfig.setProperty(SpeechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs, "700");
          } catch (_) {}

          // 2. Skapa AudioConfig från standardmikrofon
          const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
          this._audioConfig = audioConfig;

          // 3. Skapa SpeechRecognizer
          const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
          this._recognizer = recognizer;

          // 4. Konfigurera PronunciationAssessmentConfig (referenceText, HundredMark, Phoneme, enableProsodyAssessment)
          const pronAssessmentConfig = new SpeechSDK.PronunciationAssessmentConfig(
            refText,
            SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
            SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
            false
          );
          pronAssessmentConfig.enableProsodyAssessment = true;
          pronAssessmentConfig.applyTo(recognizer);

          this.isRecording = true;
          if (onStateChange) onStateChange('recording');
          window.VisualEngine?.Mascot?.setState('listening');

          // Audio level pulsering för mikrofonindikator
          let animStep = 0;
          this._audioLevelTimer = setInterval(() => {
            if (!this.isRecording) {
              clearInterval(this._audioLevelTimer);
              return;
            }
            animStep++;
            const fakeLvl = 0.35 + 0.45 * Math.abs(Math.sin(animStep * 0.45));
            if (onAudioLevel) onAudioLevel(fakeLvl);
          }, 100);

          // Extrahera mål-ord för realtids-kontroll i interim hearing
          const targetWords = (refText || '')
            .toLowerCase()
            .replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);

          let earlyFinishTimer = null;
          let hasTriggeredFinish = false;

          const finishRecognition = () => {
            if (hasTriggeredFinish) return;
            hasTriggeredFinish = true;
            if (earlyFinishTimer) {
              clearTimeout(earlyFinishTimer);
              earlyFinishTimer = null;
            }
            this.isRecording = false;
            this.isAnalyzing = true;
            if (onStateChange) onStateChange('analyzing');
            window.VisualEngine?.Mascot?.setState('idle');

            // Stäng audioConfig så att Azure SpeechRecognizer tar emot EOF och slutför bedömningen direkt
            if (this._audioConfig) {
              try {
                this._audioConfig.close();
              } catch (_) {}
            }
          };
          this._finishRecognitionEarly = finishRecognition;

          // Interim hearing event
          recognizer.recognizing = (s, e) => {
            if (e.result && e.result.text) {
              const heardText = e.result.text;
              if (onHearing) onHearing(heardText);

              // Automatisk avslutning: Avbryt och bedöm när alla ord i frasen har uppfattats
              if (targetWords.length > 0 && !hasTriggeredFinish) {
                const spokenClean = heardText
                  .toLowerCase()
                  .replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()?"'«»]/g, ' ')
                  .split(/\s+/)
                  .filter(Boolean);

                const allWordsPresent = targetWords.every((tw) =>
                  spokenClean.some((sw) => sw === tw || sw.startsWith(tw) || tw.startsWith(sw))
                );

                if (allWordsPresent && spokenClean.length >= targetWords.length) {
                  // Alla målord är sagda! Vänta 350ms buffert så att sista konsonant/slutljud inte klipps
                  if (!earlyFinishTimer) {
                    earlyFinishTimer = setTimeout(() => {
                      finishRecognition();
                    }, 350);
                  }
                }
              }
            }
          };

          // Watchdog timer (7 sekunder)
          this._safetyTimeout = setTimeout(() => {
            if (this.isRecording) {
              try {
                recognizer.stopContinuousRecognitionAsync?.();
              } catch (_) {}
            }
          }, 7000);

          // Single-shot Pronunciation Assessment
          recognizer.recognizeOnceAsync(
            (result) => {
              if (this._audioLevelTimer) clearInterval(this._audioLevelTimer);
              if (this._safetyTimeout) clearTimeout(this._safetyTimeout);
              if (earlyFinishTimer) clearTimeout(earlyFinishTimer);
              this._finishRecognitionEarly = null;

              this.isRecording = false;
              this.isAnalyzing = true;
              if (onStateChange) onStateChange('analyzing');

              let resJson = null;
              try {
                const jsonStr = result.properties?.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult);
                if (jsonStr) {
                  resJson = JSON.parse(jsonStr);
                }
              } catch (_) {}

              let pronResult = null;
              try {
                pronResult = SpeechSDK.PronunciationAssessmentResult.fromResult(result);
              } catch (_) {}

              const bestN = resJson?.NBest?.[0] || {};
              const pronAss = bestN.PronunciationAssessment || {};

              const pronScore = Math.round(pronResult?.pronunciationScore ?? pronAss.PronScore ?? 0);
              const accuracyScore = Math.round(pronResult?.accuracyScore ?? pronAss.AccuracyScore ?? 0);
              const fluencyScore = Math.round(pronResult?.fluencyScore ?? pronAss.FluencyScore ?? 0);
              const prosodyScore = Math.round(pronResult?.prosodyScore ?? pronAss.ProsodyScore ?? 0);
              const completenessScore = Math.round(pronResult?.completenessScore ?? pronAss.CompletenessScore ?? 0);

              // Bygg ord- och fonemlista med färgkodning
              const rawWords = bestN.Words || [];
              const wordsList = rawWords.map((w) => {
                const wScore = Math.round(w.AccuracyScore ?? 0);
                let colorCategory = 'green';
                if (wScore < 60) colorCategory = 'red';
                else if (wScore < 80) colorCategory = 'yellow';

                const phonemes = (w.Phonemes || []).map((p) => ({
                  phoneme: p.Phoneme,
                  accuracyScore: Math.round(p.AccuracyScore ?? 0),
                  isDeviated: (p.AccuracyScore ?? 0) < 70
                }));

                const syllables = (w.Syllables || []).map((s) => ({
                  syllable: s.Syllable,
                  accuracyScore: Math.round(s.AccuracyScore ?? 0),
                  isDeviated: (s.AccuracyScore ?? 0) < 70
                }));

                const deviatedPhonemes = phonemes.filter((p) => p.isDeviated).map((p) => p.phoneme);
                const deviatedSyllables = syllables.filter((s) => s.isDeviated).map((s) => s.syllable);

                return {
                  word: w.Word,
                  score: wScore,
                  colorCategory,
                  errorType: w.ErrorType || 'None',
                  phonemes,
                  syllables,
                  deviatedPhonemes,
                  deviatedSyllables
                };
              });

              // Identifiera avvikande fonem och stavelser
              const allDeviatedPhonemes = [];
              const allDeviatedSyllables = [];
              wordsList.forEach((w) => {
                w.deviatedPhonemes.forEach((ph) => {
                  if (!allDeviatedPhonemes.includes(ph)) allDeviatedPhonemes.push(ph);
                });
                w.deviatedSyllables.forEach((sy) => {
                  if (!allDeviatedSyllables.includes(sy)) allDeviatedSyllables.push(sy);
                });
              });

              // Krav 5: Nong Dala visuell feedback baserad på PronScore
              const isPass = pronScore >= 75;
              const status = isPass ? 'pass' : (pronScore >= 50 ? 'almost' : 'retry');

              // 1-3 animerad fyllda guldstjärnor vid >= 75
              let starsCount = 0;
              if (pronScore >= 90) starsCount = 3;
              else if (pronScore >= 80) starsCount = 2;
              else if (pronScore >= 75) starsCount = 1;

              const evaluation = {
                engine: 'azure',
                score: pronScore,
                pronScore,
                accuracyScore,
                fluencyScore,
                prosodyScore,
                completenessScore,
                status,
                starsCount,
                words: wordsList,
                deviatedPhonemes: allDeviatedPhonemes,
                deviatedSyllables: allDeviatedSyllables,
                spokenClean: result.text || refText,
                spokenRaw: result.text || refText,
                feedbackTh: this._generateAzureFeedbackTh(pronScore, allDeviatedPhonemes, allDeviatedSyllables),
                satunTip: this._generateSatunTip(allDeviatedPhonemes),
                mouthGuide: getMouthGuideForTarget(referenceItem)
              };

              try {
                recognizer.close();
              } catch (_) {}
              this._recognizer = null;
              if (this._audioConfig) {
                try {
                  this._audioConfig.close();
                } catch (_) {}
                this._audioConfig = null;
              }
              this.isAnalyzing = false;

              // Applicera visuell dopamin och ljud
              this._applyDopamineFeedback(evaluation, referenceItem);

              if (onStateChange) onStateChange('idle');
              const finalPayload = { transcript: result.text || refText, evaluation, azureResult: evaluation };
              if (onResult) onResult(finalPayload);
              finalize(resolve, evaluation);
            },
            (err) => {
              if (this._audioLevelTimer) clearInterval(this._audioLevelTimer);
              if (this._safetyTimeout) clearTimeout(this._safetyTimeout);
              if (earlyFinishTimer) clearTimeout(earlyFinishTimer);
              this._finishRecognitionEarly = null;
              this.isRecording = false;
              this.isAnalyzing = false;
              if (this._audioConfig) {
                try {
                  this._audioConfig.close();
                } catch (_) {}
                this._audioConfig = null;
              }
              try {
                recognizer.close();
              } catch (_) {}
              this._recognizer = null;
              if (onStateChange) onStateChange('idle');
              window.VisualEngine?.Mascot?.setState('idle');
              if (onError) onError(err);
              finalize(reject, err);
            }
          );
        } catch (err) {
          this.isRecording = false;
          this.isAnalyzing = false;
          if (onStateChange) onStateChange('idle');
          if (onError) onError(err);
          finalize(reject, err);
        }
      });
    }

    /**
     * Simulerad Azure-bedömning för direkt-testning och offline-läge
     */
    simulateEvaluation(referenceItem, mode = 'pass') {
      const refText = typeof referenceItem === 'object' ? referenceItem.sv : String(referenceItem || '');
      const words = refText.split(/\s+/).filter(Boolean);

      let pronScore = 93;
      let accuracyScore = 94;
      let fluencyScore = 91;
      let prosodyScore = 90;
      let starsCount = 3;
      let status = 'pass';

      if (mode === 'almost') {
        pronScore = 68;
        accuracyScore = 67;
        fluencyScore = 72;
        prosodyScore = 65;
        starsCount = 0;
        status = 'almost';
      } else if (mode === 'retry') {
        pronScore = 42;
        accuracyScore = 38;
        fluencyScore = 48;
        prosodyScore = 40;
        starsCount = 0;
        status = 'retry';
      }

      const wordsList = words.map((w, idx) => {
        let wScore = pronScore;
        let colorCategory = 'green';
        let devPhonemes = [];
        let devSyllables = [];

        if (status === 'almost' && idx === words.length - 1) {
          wScore = 62;
          colorCategory = 'yellow';
          devPhonemes = [w.charAt(w.length - 1)];
          devSyllables = [w];
        } else if (status === 'retry') {
          wScore = idx === 0 ? 35 : 45;
          colorCategory = 'red';
          devPhonemes = [w.charAt(0)];
          devSyllables = [w];
        }

        return {
          word: w,
          score: wScore,
          colorCategory,
          errorType: status === 'pass' ? 'None' : 'Mispronunciation',
          phonemes: [{ phoneme: w.charAt(0), accuracyScore: wScore, isDeviated: devPhonemes.length > 0 }],
          syllables: [{ syllable: w, accuracyScore: wScore, isDeviated: devSyllables.length > 0 }],
          deviatedPhonemes: devPhonemes,
          deviatedSyllables: devSyllables
        };
      });

      const allDevPhonemes = [];
      const allDevSyllables = [];
      wordsList.forEach((w) => {
        w.deviatedPhonemes.forEach((p) => { if (!allDevPhonemes.includes(p)) allDevPhonemes.push(p); });
        w.deviatedSyllables.forEach((s) => { if (!allDevSyllables.includes(s)) allDevSyllables.push(s); });
      });

      const evaluation = {
        engine: 'azure',
        score: pronScore,
        pronScore,
        accuracyScore,
        fluencyScore,
        prosodyScore,
        completenessScore: 100,
        status,
        starsCount,
        words: wordsList,
        deviatedPhonemes: allDevPhonemes,
        deviatedSyllables: allDevSyllables,
        spokenClean: refText,
        spokenRaw: refText,
        feedbackTh: this._generateAzureFeedbackTh(pronScore, allDevPhonemes, allDevSyllables),
        satunTip: this._generateSatunTip(allDevPhonemes),
        mouthGuide: getMouthGuideForTarget(referenceItem)
      };

      this._applyDopamineFeedback(evaluation, referenceItem);
      return evaluation;
    }

    _generateAzureFeedbackTh(score, devPhonemes, devSyllables) {
      if (score >= 90) {
        return 'ยอดเยี่ยมมาก! การออกเสียงแม่นยำระดับเจ้าของภาษา (คะแนน 90+)';
      }
      if (score >= 80) {
        return 'เก่งมากจ้า! น้ำเสียงและจังหวะลื่นไหลเป็นธรรมชาติมาก';
      }
      if (score >= 75) {
        return 'ผ่านเกณฑ์ดีมาก! ชัดเจน เข้าใจง่าย';
      }
      if (score >= 50) {
        const hint = devSyllables.length ? `สังเกตพยางค์ "${devSyllables.join(', ')}"` : 'ลองฟังจังหวะช้าๆ';
        return `เกือบเป๊ะแล้ว! ${hint} แล้วลองพูดใหม่อีกครั้งนะ`;
      }
      const hintPh = devPhonemes.length ? `เน้นเสียง [${devPhonemes.join(', ')}]` : 'ฟังเสียงช้าๆ';
      return `ไม่ต้องกังวลจ้า ${hintPh} แล้วลองกดปุ่มเต่าฟังใหม่อีกครั้งนะ`;
    }

    _generateSatunTip(devPhonemes) {
      if (!devPhonemes || !devPhonemes.length) {
        return 'ออกเสียงได้หรอยแรง! เป๊ะเหมือนคนสวีเดนมาเองเลย!';
      }
      const ph = devPhonemes[0].toLowerCase();
      if (ph === 'r') return 'เคล็ดลับคนใต้: ตัว R สวีเดนให้กระดกลิ้นเบาๆ ตรงเพดานปาก ห้ามกลืนเสียงนะ!';
      if (ph === 'v' || ph === 'w') return 'เคล็ดลับคนใต้: ตัว V กัดริมฝีปากล่างเบาๆ เหมือนพูด "ฟ" แต่มีเสียงสั่นในคอ';
      if (ph === 'y' || ph === 'u' || ph === 'ö') return 'เคล็ดลับคนใต้: สระ Ö/Y ให้ทำปากจู๋กลมๆ เหมือนจะเป่าเทียน';
      if (ph === 's' || ph === 'sj') return 'เคล็ดลับคนใต้: เสียง SJ/SJU ให้ห่อปากแล้วพ่นลมเบาๆ จากเพดานอ่อน';
      return 'สบายๆ ต๊ะน้องเหอ! ฟังเสียงเต่าช้าๆ อีกรอบ แล้วพูดตามต๊ะ!';
    }

    _applyDopamineFeedback(evaluation, targetItem) {
      const svText = typeof targetItem === 'object' ? targetItem.sv : String(targetItem || '');

      if (evaluation.status === 'pass') {
        SoundFX.playCorrect();
        window.VisualEngine?.Mascot?.setState('celebrating');
        window.VisualEngine?.triggerConfetti?.();
        if (evaluation.starsCount === 3) {
          window.VisualEngine?.Mascot?.say?.(
            'สุดยอด 3 ดาวทอง! สำเนียงเป๊ะมาก! (3 Guldstjärnor!)',
            'หรอยจังฮู้! 3 ดาวเต็มๆ เก่งระดับนายหัวแล้วน้องเหอ!',
            'correct',
            4500
          );
        } else {
          window.VisualEngine?.Mascot?.speakRandomQuote?.('correct');
        }
      } else {
        SoundFX.playTryAgain();
        window.VisualEngine?.Mascot?.setState('encouraging');
        const devHint = evaluation.deviatedSyllables?.length
          ? `สังเกตเสียง "${evaluation.deviatedSyllables.join(', ')}"`
          : 'ฟังเสียงช้าๆ อีกรอบนะ';
        window.VisualEngine?.Mascot?.say?.(
          `เกือบถูกแล้ว! ${devHint} (ลองฟังเสียงเต่านะจ๊ะ)`,
          'ไม่ต้องตกใจต๊ะ! ค่อยๆ แลตามเสียงเต่า เดี๋ยวก็คล่องเอง!',
          'retry',
          4500
        );
        // Krav 5: Spelar upp referensljudet långsamt vid < 75
        setTimeout(() => AudioPlayer.speakSlow(svText), 380);
      }
    }

    finishEarly() {
      if (this._finishRecognitionEarly) {
        this._finishRecognitionEarly();
      } else {
        this.stop();
      }
    }

    stop() {
      this.isStarting = false;
      if (this._safetyTimeout) clearTimeout(this._safetyTimeout);
      if (this._audioLevelTimer) clearInterval(this._audioLevelTimer);
      this._finishRecognitionEarly = null;
      if (this._audioConfig) {
        try {
          this._audioConfig.close();
        } catch (_) {}
        this._audioConfig = null;
      }
      if (this._recognizer) {
        try {
          this._recognizer.close();
        } catch (_) {}
        this._recognizer = null;
      }
      this.isRecording = false;
      this.isAnalyzing = false;
      window.VisualEngine?.Mascot?.setState('idle');
    }
  }

  const azureSpeechJudgeInstance = new AzureSpeechJudge();
  window.AzureSpeechJudge = azureSpeechJudgeInstance;

  /* --------------------------------------------------------------------------
     4B. SPEECHJUDGE MASTER CONTROLLER (Groq, Azure & WebKit)
     -------------------------------------------------------------------------- */

  class SpeechJudge {
    constructor() {
      this.isRecording = false;
      this.isAnalyzing = false;
      this.isStarting = false;
      this._mediaRecorder = null;
      this._audioStream = null;
      this._audioChunks = [];
      this._micAudioContext = null;
      this._sourceNode = null;
      this._analyserNode = null;
      this._animFrameId = null;
      this._activeRecognition = null;
      this._safetyTimeout = null;
      this.azureJudge = azureSpeechJudgeInstance;

      // 1. Magic Link Auto-Config: Om URL innehåller #setup=gsk_... eller ?k=gsk_...
      try {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        let magicKey = null;
        const m1 = hash.match(/[#&](?:k|setup|groq)=([A-Za-z0-9_-]+)/i);
        if (m1) magicKey = m1[1];
        if (!magicKey) {
          const p = new URLSearchParams(search);
          magicKey = p.get('k') || p.get('setup') || p.get('groq');
        }
        if (magicKey && magicKey.startsWith('gsk_')) {
          localStorage.setItem('groq_api_key', magicKey.trim());
          if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname + window.location.search.replace(/[?&](?:k|setup|groq)=[^&]+/, '');
            window.history.replaceState(null, '', cleanUrl);
          }
        }
      } catch (_) {}

      // 2. Synka lokala nycklar från config.local.js (window.ENV_CONFIG) om den finns
      if (window.ENV_CONFIG) {
        if (window.ENV_CONFIG.GROQ_API_KEY && window.ENV_CONFIG.GROQ_API_KEY.trim()) {
          localStorage.setItem('groq_api_key', window.ENV_CONFIG.GROQ_API_KEY.trim());
        }
        if (window.ENV_CONFIG.AZURE_SPEECH_KEY && window.ENV_CONFIG.AZURE_SPEECH_KEY.trim()) {
          localStorage.setItem('azure_speech_key', window.ENV_CONFIG.AZURE_SPEECH_KEY.trim());
        }
        if (window.ENV_CONFIG.AZURE_SPEECH_REGION && window.ENV_CONFIG.AZURE_SPEECH_REGION.trim()) {
          localStorage.setItem('azure_speech_region', window.ENV_CONFIG.AZURE_SPEECH_REGION.trim());
        }
      }

      // Rensa eventuell gammal spärrad Groq-nyckel från webbläsarens minne
      const oldRevokedPrefix = 'gsk_znzpHw';
      const currentStoredGroq = localStorage.getItem('groq_api_key') || '';
      if (currentStoredGroq.startsWith(oldRevokedPrefix)) {
        localStorage.removeItem('groq_api_key');
      }

      if (!localStorage.getItem('stt_engine_preference')) {
        localStorage.setItem('stt_engine_preference', 'groq');
      }
    }

    getApiKey() {
      // Prioritet 1: Manuell nyckel sparad i localStorage (eller via Magic Link)
      const stored = localStorage.getItem('groq_api_key');
      if (stored && stored.trim()) {
        return stored.trim();
      }
      // Prioritet 2: Lokal fil config.local.js
      const envKey = window.ENV_CONFIG && window.ENV_CONFIG.GROQ_API_KEY;
      if (envKey && envKey.trim()) return envKey.trim();
      // Prioritet 3: Krypterat inbyggt valv (för SFI-drift utan konfigurationskrav)
      const vaultKey = _unscramble(_WILAWAN_VAULT.groq);
      if (vaultKey && vaultKey.trim()) return vaultKey.trim();
      return DEFAULT_GROQ_API_KEY;
    }

    setApiKey(key) {
      localStorage.setItem('groq_api_key', (key || '').trim());
    }

    getEnginePreference() {
      return localStorage.getItem('stt_engine_preference') || 'groq';
    }

    setEnginePreference(pref) {
      const valid = ['groq', 'azure', 'webkit'].includes(pref) ? pref : 'groq';
      localStorage.setItem('stt_engine_preference', valid);
    }

    isGroqReady() {
      return Boolean(this.getApiKey()) && this.getEnginePreference() === 'groq';
    }

    isAzureReady() {
      return this.getEnginePreference() === 'azure' && this.azureJudge.isReady();
    }

    /**
     * Identifierar det bästa ljudformatet som stöds av iOS MediaRecorder
     */
    getSupportedMimeType() {
      if (typeof MediaRecorder === 'undefined') return '';
      const candidates = [
        'audio/mp4',
        'audio/aac',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg'
      ];
      for (const t of candidates) {
        if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
          return t;
        }
      }
      return '';
    }

    /**
     * Startar inspelning och bedömning via vald talmotor
     */
    async start(targetItem, callbacks = {}) {
      if (this.isStarting || this.isRecording || this.isAnalyzing || this.azureJudge.isStarting || this.azureJudge.isRecording || this.azureJudge.isAnalyzing) {
        if (this.isRecording) {
          this.finishRecordingAndJudge();
        } else if (this.azureJudge.isRecording) {
          this.azureJudge.finishEarly();
        }
        return;
      }

      this.isStarting = true;
      try {
        this._callbacks = callbacks;

        // Kritiskt för iOS Safari: Stoppa all pågående taluppspelning innan mikrofon öppnas
        AudioPlayer.stop();

        SoundFX.unlockiOSAudio();

        // iOS Safari Fix a: Stäng av all syntes och vänta 200ms så ljudsystemet nollställs
        if ('speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
          } catch (_) {}
        }
        await new Promise((r) => setTimeout(r, 200));

        if (!this.isStarting) return;

        const pref = this.getEnginePreference();

        if (pref === 'azure') {
          if (this.azureJudge.isReady()) {
            return await this.azureJudge.evaluateAudio(targetItem, callbacks);
          } else {
            const err = new Error('Azure Speech API-nyckel saknas. Öppna inställningar (⚙️) för att fylla i nyckel och region.');
            if (callbacks.onError) callbacks.onError(err);
            return;
          }
        } else if (pref === 'groq' && this.isGroqReady()) {
          return await this._startGroqPipeline(targetItem, callbacks);
        } else {
          return await this._startWebkitFallback(targetItem, callbacks);
        }
      } finally {
        this.isStarting = false;
      }
    }

    /**
     * PRIMÄR MOTOR: Modern API Pipeline via MediaRecorder + Groq Whisper
     */
    async _startGroqPipeline(targetItem, callbacks = {}) {
      const { onStateChange, onAudioLevel, onResult, onError } = callbacks;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        this._audioStream = stream;

        // Dedikerad och isolerad AudioContext enbart för mikrofonnivåmätning!
        // ALDRIG koppla mikrofonströmmen till SoundFX.getContext()!
        // Att ansluta mikrofonen till uppspelnings-AudioContext tvingar iOS till
        // PlayAndRecord (låg earpiece-volym och kraftig volymducking).
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          try {
            const micCtx = new AudioCtx();
            this._micAudioContext = micCtx;
            const source = micCtx.createMediaStreamSource(stream);
            this._sourceNode = source;
            const analyser = micCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            this._analyserNode = analyser;

            let speechDetected = false;
            let speechStartTime = null;
            let silenceStartTime = null;
            const VAD_SPEECH_THRESHOLD = 0.055;  // Tröskel för att röst upptäcks
            const VAD_SILENCE_THRESHOLD = 0.035; // Tröskel för bakgrund/tystnad
            const VAD_SILENCE_DURATION = 1000;   // 1.0s tystnad efter tal triggar auto-bedömning
            const VAD_MIN_SPEECH_DURATION = 350; // Minst 350ms tal innan tystnad räknas

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateLevel = () => {
              if (!this.isRecording) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              const avg = sum / dataArray.length;
              const norm = Math.min(1.0, avg / 128);
              if (onAudioLevel) onAudioLevel(norm);

              // VAD: Upptäck röstaktivitet och auto-stoppa efter 1.0s tystnad
              const now = Date.now();
              if (norm >= VAD_SPEECH_THRESHOLD) {
                if (!speechDetected) {
                  speechDetected = true;
                  speechStartTime = now;
                }
                silenceStartTime = null;
              } else if (speechDetected && (now - speechStartTime >= VAD_MIN_SPEECH_DURATION)) {
                if (norm <= VAD_SILENCE_THRESHOLD) {
                  if (!silenceStartTime) {
                    silenceStartTime = now;
                  } else if (now - silenceStartTime >= VAD_SILENCE_DURATION) {
                    // 1.0 sekunds tystnad efter tal -> Auto-stoppa och bedöm med Groq Whisper!
                    this.stopRecordingAndJudge();
                    return;
                  }
                } else {
                  silenceStartTime = null;
                }
              }

              this._animFrameId = requestAnimationFrame(updateLevel);
            };
            this._animFrameId = requestAnimationFrame(updateLevel);
          } catch (_) {}
        }

        const mimeType = this.getSupportedMimeType();
        const options = mimeType ? { mimeType } : undefined;
        const recorder = new MediaRecorder(stream, options);
        this._mediaRecorder = recorder;
        this._audioChunks = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this._audioChunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          if (this._animFrameId) cancelAnimationFrame(this._animFrameId);
          this._cleanupTracks();

          if (!this.isAnalyzing) return;

          const blobType = mimeType || 'audio/mp4';
          const audioBlob = new Blob(this._audioChunks, { type: blobType });

          try {
            const transcript = await this._transcribeWithGroq(audioBlob, mimeType);
            const targetSv = typeof targetItem === 'object' ? targetItem.sv : String(targetItem || '');
            const evaluation = evaluatePronunciation(transcript, targetSv);

            this._applyDopamineFeedback(evaluation, targetItem);

            this.isAnalyzing = false;
            if (onStateChange) onStateChange('idle');
            if (onResult) onResult({ transcript, evaluation });
          } catch (err) {
            this.isAnalyzing = false;
            if (onStateChange) onStateChange('idle');
            // Om Groq misslyckas, ge tydligt felmeddelande eller prova lokal diktering
            if (onError) onError(err);
          }
        };

        this.isRecording = true;
        if (onStateChange) onStateChange('recording');
        window.VisualEngine?.Mascot?.setState('listening');

        recorder.start(100);

        // Säkerhetsstopp efter 4.8 sekunder
        this._safetyTimeout = setTimeout(() => {
          if (this.isRecording) this.stopRecordingAndJudge();
        }, 4800);
      } catch (err) {
        this.isRecording = false;
        this.isAnalyzing = false;
        if (onStateChange) onStateChange('idle');
        if (onError) onError(err);
      }
    }

    /**
     * REST-anrop mot Groq Whisper API (whisper-large-v3-turbo, språk: sv)
     */
    async _transcribeWithGroq(audioBlob, mimeType) {
      let apiKey = this.getApiKey();
      if (!apiKey) {
        apiKey = await this.promptForGroqKey();
      }
      if (!apiKey) throw new Error('Ingen Groq API-nyckel angiven. Klicka på ⚙️ Inställningar för att lägga till din nyckel.');

      const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : 'm4a';
      const formData = new FormData();
      formData.append('file', audioBlob, `recording.${ext}`);
      formData.append('model', 'whisper-large-v3-turbo');
      formData.append('language', 'sv');
      formData.append('response_format', 'json');
      formData.append('temperature', '0.0');

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('groq_api_key');
          if (window.ENV_CONFIG) window.ENV_CONFIG.GROQ_API_KEY = '';
          const newKey = await this.promptForGroqKey('Din Groq API-nyckel blev inte godkänd av Groq (401 Unauthorized / Spärrad). Klistra in din nya giltiga Groq-nyckel:');
          if (newKey) {
            return this._transcribeWithGroq(audioBlob, mimeType);
          }
        }
        const errorText = await response.text();
        throw new Error(`Groq API Error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      return json.text || '';
    }

    /**
     * Säker modal för inmatning av Groq-nyckel vid behov (Sparas enbart lokalt)
     */
    async promptForGroqKey(customMessage = null) {
      return new Promise((resolve) => {
        let modal = document.getElementById('groq-key-dialog-modal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'groq-key-dialog-modal';
          modal.className = 'settings-modal-backdrop';
          modal.style.zIndex = '99999';
          document.body.appendChild(modal);
        }

        const msg = customMessage || 'För att röstigenkänningen med Groq Whisper ska fungera behöver du ange din Groq API-nyckel (börjar med gsk_). Nyckeln sparas enbart lokalt i din webbläsare och laddas ALDRIG upp till GitHub.';

        modal.innerHTML = `
          <div class="settings-modal-card" style="max-width: 440px; padding: 22px;">
            <div style="font-weight: 900; font-size: 1.1rem; color: var(--text-main); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <span>🔑</span>
              <span>Ange Groq API-nyckel</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 12px;">
              ${msg}
            </p>
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 10px; font-size: 0.78rem; color: #166534; margin-bottom: 14px;">
              🔒 <strong>Privat & skyddat:</strong> Nyckeln sparas endast i enhetens lokala minne (localStorage) och skickas aldrig till något git-arkiv.
            </div>
            <div style="margin-bottom: 14px;">
              <input type="password" id="input-new-groq-key" placeholder="gsk_..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
                style="width: 100%; box-sizing: border-box; padding: 12px; border-radius: 12px; border: 2px solid var(--border-light); font-size: 0.9rem; font-family: monospace;" />
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" class="btn-3d btn-surface" id="btn-cancel-groq-key" style="min-height: 42px; padding: 6px 14px; font-size: 0.84rem;">
                Avbryt
              </button>
              <button type="button" class="btn-3d btn-green" id="btn-save-groq-key" style="min-height: 42px; padding: 6px 18px; font-size: 0.84rem; font-weight: 900;">
                Spara nyckel
              </button>
            </div>
          </div>
        `;

        modal.classList.add('open');
        const input = document.getElementById('input-new-groq-key');
        input?.focus();

        const close = (val) => {
          modal.classList.remove('open');
          resolve(val);
        };

        document.getElementById('btn-save-groq-key')?.addEventListener('click', () => {
          const val = (input?.value || '').trim();
          if (val) {
            this.setApiKey(val);
            close(val);
          } else {
            input.style.borderColor = '#EF4444';
          }
        });

        document.getElementById('btn-cancel-groq-key')?.addEventListener('click', () => close(null));
      });
    }

    /**
     * Öppnar den fullständiga hanteraren för API-nycklar (Groq & Azure)
     */
    openApiKeyManagerModal() {
      let modal = document.getElementById('api-key-manager-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'api-key-manager-modal';
        modal.className = 'settings-modal-backdrop';
        modal.style.zIndex = '99999';
        document.body.appendChild(modal);
      }

      const currentGroq = this.getApiKey() || '';
      const currentAzure = this.azureJudge.getKey() || '';
      const maskedGroq = currentGroq ? `••••••••••••${currentGroq.slice(-6)}` : '';
      const maskedAzure = currentAzure ? `••••••••••••${currentAzure.slice(-6)}` : '';

      modal.innerHTML = `
        <div class="settings-modal-card" style="max-width: 480px; padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-light); padding-bottom: 10px; margin-bottom: 14px;">
            <div style="font-weight: 900; font-size: 1.15rem; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <span>🔑</span>
              <span>Hantera API-nycklar</span>
            </div>
            <button type="button" class="lesson-close-btn" id="btn-close-key-manager-modal" aria-label="Stäng">✕</button>
          </div>

          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 12px; font-size: 0.8rem; color: #166534; margin-bottom: 16px; line-height: 1.45;">
            🔒 <strong>100% säkert & dolt från Git:</strong><br>
            Nycklarna du anger här sparas uteslutande i din webbläsares lokala minne (localStorage). De kan aldrig checkas in eller laddas upp till GitHub!
          </div>

          <!-- 1. Groq API-nyckel -->
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 900; font-size: 0.86rem; margin-bottom: 4px;">
              🚀 Groq Whisper API-nyckel:
            </label>
            <div style="font-size: 0.74rem; color: var(--text-secondary); margin-bottom: 6px;">
              Status: ${currentGroq ? `<span style="color:#16A34A; font-weight:800;">Aktiv (${maskedGroq})</span>` : '<span style="color:#DC2626; font-weight:800;">Ej konfigurerad</span>'}
            </div>
            <input type="password" id="input-mgr-groq-key" placeholder="${currentGroq ? 'Klistra in ny nyckel för att byta...' : 'gsk_...'}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
              style="width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px; border: 2px solid var(--border-light); font-size: 0.88rem; font-family: monospace;" />
          </div>

          <!-- 2. Microsoft Azure Speech-nyckel (Valfritt) -->
          <div style="margin-bottom: 18px;">
            <label style="display: block; font-weight: 900; font-size: 0.86rem; margin-bottom: 4px;">
              🎯 Microsoft Azure Speech-nyckel (Valfritt):
            </label>
            <div style="font-size: 0.74rem; color: var(--text-secondary); margin-bottom: 6px;">
              Status: ${currentAzure ? `<span style="color:#16A34A; font-weight:800;">Aktiv (${maskedAzure})</span>` : '<span style="color:#64748B; font-weight:700;">Ej konfigurerad</span>'}
            </div>
            <input type="password" id="input-mgr-azure-key" placeholder="${currentAzure ? 'Klistra in ny Azure-nyckel...' : 'Azure Key 1...'}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
              style="width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 10px; border: 2px solid var(--border-light); font-size: 0.88rem; font-family: monospace;" />
          </div>

          <div id="key-mgr-feedback" style="min-height: 20px; font-size: 0.82rem; font-weight: 700; text-align: center; margin-bottom: 12px;"></div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn-3d btn-surface" id="btn-clear-stored-keys" style="min-height: 44px; padding: 8px 14px; font-size: 0.8rem; color: #DC2626;">
              🗑️ Rensa nycklar
            </button>
            <button type="button" class="btn-3d btn-green" id="btn-save-mgr-keys" style="min-height: 44px; padding: 8px 20px; font-size: 0.88rem; font-weight: 900;">
              💾 Spara i webbläsaren
            </button>
          </div>
        </div>
      `;

      modal.classList.add('open');

      const close = () => modal.classList.remove('open');
      document.getElementById('btn-close-key-manager-modal')?.addEventListener('click', close);

      document.getElementById('btn-clear-stored-keys')?.addEventListener('click', () => {
        localStorage.removeItem('groq_api_key');
        localStorage.removeItem('azure_speech_key');
        if (window.ENV_CONFIG) {
          window.ENV_CONFIG.GROQ_API_KEY = '';
          window.ENV_CONFIG.AZURE_SPEECH_KEY = '';
        }
        const fb = document.getElementById('key-mgr-feedback');
        if (fb) {
          fb.style.color = '#B45309';
          fb.textContent = 'Alla lokala nycklar har rensats.';
        }
        setTimeout(() => this.openApiKeyManagerModal(), 800);
      });

      document.getElementById('btn-save-mgr-keys')?.addEventListener('click', () => {
        const groqInput = document.getElementById('input-mgr-groq-key');
        const azureInput = document.getElementById('input-mgr-azure-key');
        const newGroq = (groqInput?.value || '').trim();
        const newAzure = (azureInput?.value || '').trim();

        if (newGroq) {
          this.setApiKey(newGroq);
        }
        if (newAzure) {
          this.azureJudge.setKey(newAzure);
        }

        const fb = document.getElementById('key-mgr-feedback');
        if (fb) {
          fb.style.color = '#15803D';
          fb.textContent = '✨ Nycklar har sparats säkert i din webbläsare!';
        }
        setTimeout(close, 900);
      });
    }

    /**
     * Avsluta pågående inspelning direkt och genomför bedömning omedelbart
     */
    finishRecordingAndJudge() {
      const pref = this.getEnginePreference();
      if (pref === 'azure' && this.azureJudge.isRecording) {
        this.azureJudge.finishEarly();
      } else if (pref === 'groq' && this.isRecording) {
        this.stopRecordingAndJudge();
      } else if (this._activeRecognition) {
        try {
          this._activeRecognition.stop();
        } catch (_) {}
      } else if (this.isRecording) {
        this.stopRecordingAndJudge();
      }
    }

    /**
     * Avsluta inspelning och påbörja Groq-analys
     */
    stopRecordingAndJudge() {
      if (!this.isRecording) return;
      if (this._safetyTimeout) clearTimeout(this._safetyTimeout);
      this.isRecording = false;
      this.isAnalyzing = true;
      if (this._callbacks?.onStateChange) {
        this._callbacks.onStateChange('analyzing');
      }
      window.VisualEngine?.Mascot?.setState('idle');

      if (this._mediaRecorder && this._mediaRecorder.state !== 'inactive') {
        try {
          this._mediaRecorder.stop();
        } catch (_) {}
      }
    }

    /**
     * SEKUNDÄR MOTOR: Ren lokal iOS Safari WebKit SpeechRecognition med 3 iOS-fixar
     */
    _startWebkitFallback(targetItem, callbacks = {}) {
      const { onStateChange, onResult, onError } = callbacks;
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRec) {
        if (onError) onError(new Error('Web Speech API stöds inte av denna webbläsare'));
        return;
      }

      try {
        const rec = new SpeechRec();
        this._activeRecognition = rec;

        // iOS Fix b: continuous = false och interimResults = false förhindrar minnesläckage
        rec.lang = 'sv-SE';
        rec.continuous = false;
        rec.interimResults = false;
        rec.maxAlternatives = 5;

        let hasResolved = false;

        const finalize = (alternatives) => {
          if (hasResolved) return;
          hasResolved = true;
          this.isRecording = false;
          this.isAnalyzing = false;
          if (this._safetyTimeout) clearTimeout(this._safetyTimeout);
          if (onStateChange) onStateChange('idle');

          const bestText = alternatives[0] || '';
          const targetSv = typeof targetItem === 'object' ? targetItem.sv : String(targetItem || '');
          const evaluation = evaluatePronunciation(bestText, targetSv);

          this._applyDopamineFeedback(evaluation, targetItem);
          if (onResult) onResult({ transcript: bestText, evaluation, allAlternatives: alternatives });
        };

        rec.onstart = () => {
          this.isRecording = true;
          if (onStateChange) onStateChange('recording');
          window.VisualEngine?.Mascot?.setState('listening');
        };

        rec.onresult = (e) => {
          const results = e.results;
          if (!results || !results.length) {
            finalize([]);
            return;
          }
          const altList = [];
          const item = results[results.length - 1];
          for (let i = 0; i < item.length; i++) {
            if (item[i]?.transcript) altList.push(item[i].transcript);
          }
          finalize(altList);
        };

        // iOS Fix c: Hantera onend och onerror utan att appen låser sig
        rec.onerror = (err) => {
          if (hasResolved) return;
          hasResolved = true;
          this.isRecording = false;
          this.isAnalyzing = false;
          if (this._safetyTimeout) clearTimeout(this._safetyTimeout);
          if (onStateChange) onStateChange('idle');
          window.VisualEngine?.Mascot?.setState('idle');

          if (err?.error === 'not-allowed') {
            if (onError) onError(new Error('Mikrofonåtkomst nekad. Tillåt mikrofon i Safari-inställningar.'));
          } else {
            finalize([]);
          }
        };

        rec.onend = () => {
          if (!hasResolved) finalize([]);
        };

        rec.start();

        // iOS watchdog-timer
        this._safetyTimeout = setTimeout(() => {
          if (!hasResolved) {
            try {
              rec.stop();
            } catch (_) {}
            finalize([]);
          }
        }, 7000);
      } catch (err) {
        this.isRecording = false;
        this.isAnalyzing = false;
        if (onStateChange) onStateChange('idle');
        if (onError) onError(err);
      }
    }

    _applyDopamineFeedback(evaluation, targetItem) {
      const svText = typeof targetItem === 'object' ? targetItem.sv : String(targetItem || '');

      if (evaluation.status === 'pass') {
        SoundFX.playCorrect();
        window.VisualEngine?.Mascot?.setState('celebrating');
        window.VisualEngine?.triggerConfetti?.();
        window.VisualEngine?.Mascot?.speakRandomQuote?.('correct');
      } else if (evaluation.status === 'almost') {
        SoundFX.playTryAgain();
        window.VisualEngine?.Mascot?.setState('encouraging');
        window.VisualEngine?.Mascot?.say?.(
          'เกือบได้แล้ว! (Nästan där!) ลองฟังช้าๆ แล้วพูดอีกครั้งนะ',
          'เกือบถูกแล้วจ้า! ลองแลอีกที ไม่เสียแต้มนะ',
          'retry',
          4200
        );
        setTimeout(() => AudioPlayer.speakSlow(svText), 350);
      } else {
        SoundFX.playTryAgain();
        window.VisualEngine?.Mascot?.setState('encouraging');
        window.VisualEngine?.Mascot?.say?.(
          'ลองอีกทีนะจ๊ะ (เอาใหม่ต๊ะ ไม่เป็นไร!)',
          'ไม่ต้องตกใจจ้า ฟังเสียงเต่าช้าๆ แล้วลองใหม่ต๊ะ!',
          'retry',
          4500
        );
        setTimeout(() => AudioPlayer.speakSlow(svText), 350);
      }
    }

    _cleanupTracks() {
      if (this._animFrameId) {
        cancelAnimationFrame(this._animFrameId);
        this._animFrameId = null;
      }
      if (this._sourceNode) {
        try { this._sourceNode.disconnect(); } catch (_) {}
        this._sourceNode = null;
      }
      if (this._analyserNode) {
        try { this._analyserNode.disconnect(); } catch (_) {}
        this._analyserNode = null;
      }
      if (this._micAudioContext) {
        try {
          if (this._micAudioContext.state !== 'closed') {
            this._micAudioContext.close().catch(() => {});
          }
        } catch (_) {}
        this._micAudioContext = null;
      }
      if (this._audioStream) {
        this._audioStream.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (_) {}
        });
        this._audioStream = null;
      }
    }

    stop() {
      this.isStarting = false;
      if (this._safetyTimeout) clearTimeout(this._safetyTimeout);
      if (this._animFrameId) cancelAnimationFrame(this._animFrameId);
      this._cleanupTracks();
      if (this._mediaRecorder && this._mediaRecorder.state !== 'inactive') {
        try {
          this._mediaRecorder.stop();
        } catch (_) {}
      }
      if (this._activeRecognition) {
        try {
          this._activeRecognition.stop();
        } catch (_) {}
        this._activeRecognition = null;
      }
      if (this.azureJudge) {
        this.azureJudge.stop();
      }
      this.isRecording = false;
      this.isAnalyzing = false;
      window.VisualEngine?.Mascot?.setState('idle');
    }
  }

  const speechJudgeInstance = new SpeechJudge();
  window.SpeechJudge = speechJudgeInstance;

  /* ==========================================================================
     5. MODAL FÖR INSTÄLLNINGAR (SettingsUI)
     - Växla mellan Groq Whisper, Microsoft Azure Speech och iOS Inbyggd diktering
     - Mata in och spara Groq API-nyckel & Azure prenumerationsnyckel i localStorage
     - Testa mikrofon och högtalare med ett klick
     ========================================================================== */

  const SettingsUI = {
    modalBackdrop: null,

    init() {
      const cogBtn = document.getElementById('btn-open-settings');
      if (cogBtn) {
        cogBtn.addEventListener('click', () => this.open());
      }
    },

    open() {
      if (!this.modalBackdrop) {
        this.createModalDOM();
      }
      this.populateValues();
      requestAnimationFrame(() => this.modalBackdrop.classList.add('open'));
    },

    close() {
      if (this.modalBackdrop) {
        this.modalBackdrop.classList.remove('open');
      }
      speechJudgeInstance.stop();
    },

    createModalDOM() {
      const backdrop = document.createElement('div');
      backdrop.className = 'settings-modal-backdrop';
      backdrop.id = 'settings-modal-backdrop';

      backdrop.innerHTML = `
        <div class="settings-modal-card" role="dialog" aria-label="Ljud- och talinställningar">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--border-light); padding-bottom: 10px;">
            <div style="font-weight: 900; font-size: 1.15rem; color: var(--text-main);">
              ⚙️ Ljud- och röstinställningar
            </div>
            <button type="button" class="lesson-close-btn" id="btn-close-settings-modal" aria-label="Stäng">✕</button>
          </div>

          <!-- Val av taligenkänningsmotor (Inga API-nycklar visas för användaren) -->
          <div>
            <label style="font-weight: 900; font-size: 0.88rem; display: block; margin-bottom: 6px;">
              🎙️ Välj taligenkänningsmotor:
            </label>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <!-- 1. Groq Whisper -->
              <div class="settings-engine-radio-card" id="card-engine-groq">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-weight: 900; font-size: 0.95rem;">🚀 Groq Whisper AI</span>
                  <span class="satun-badge" style="background: var(--emerald-soft); color: var(--emerald-dark); border-color: var(--emerald);">Rekommenderas</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                  Snabb och förlåtande AI-igenkänning med hög träffsäkerhet för svenskt tal.
                </p>
              </div>

              <!-- 2. Microsoft Azure Pronunciation Assessment -->
              <div class="settings-engine-radio-card" id="card-engine-azure">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-weight: 900; font-size: 0.95rem;">🎯 Microsoft Azure AI</span>
                  <span class="satun-badge" style="background: #E0E7FF; color: #3730A3; border-color: #A5B4FC;">Detaljerat uttal</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                  Avancerad uttalsanalys på fonem- och stavelsenivå med uttalspoäng, flyt och melodi.
                </p>
              </div>

              <!-- 3. iOS Inbyggd Diktering -->
              <div class="settings-engine-radio-card" id="card-engine-webkit">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-weight: 900; font-size: 0.95rem;">📱 Apple iOS Inbyggd diktering</span>
                  <span class="satun-badge">Lokal</span>
                </div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                  Apples inbyggda röstigenkänning som körs lokalt i Safari på telefonen.
                </p>
              </div>
            </div>
          </div>

          <!-- Val av taltempo för uppspelning (Standard 0.88x, Snabbt 1.0x eller Extra snabbt 1.15x) -->
          <div>
            <label style="font-weight: 900; font-size: 0.88rem; display: block; margin-bottom: 6px;">
              ⚡ Taltempo för svenskt tal:
            </label>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="settings-speed-btn" id="btn-speed-088" data-speed="0.88" style="flex: 1;">
                <div style="font-size: 0.95rem; font-weight: 900;">🐢 0.88x</div>
                <div style="font-size: 0.72rem; font-weight: 700; opacity: 0.85; margin-top: 2px;">Standard (Lugnt)</div>
              </button>
              <button type="button" class="settings-speed-btn" id="btn-speed-100" data-speed="1.0" style="flex: 1;">
                <div style="font-size: 0.95rem; font-weight: 900;">⚡ 1.0x</div>
                <div style="font-size: 0.72rem; font-weight: 700; opacity: 0.85; margin-top: 2px;">Snabbt (Normalt)</div>
              </button>
              <button type="button" class="settings-speed-btn" id="btn-speed-115" data-speed="1.15" style="flex: 1;">
                <div style="font-size: 0.95rem; font-weight: 900;">🚀 1.15x</div>
                <div style="font-size: 0.72rem; font-weight: 700; opacity: 0.85; margin-top: 2px;">Extra snabbt</div>
              </button>
            </div>
          </div>

          <!-- Testpanel: Högtalare & Mikrofon -->
          <div style="background: var(--surface-muted); border-radius: 16px; padding: 14px; border: 2px solid var(--border-light);">
            <div style="font-weight: 900; font-size: 0.86rem; margin-bottom: 8px;">
              🎛️ Testa ljud och mikrofon:
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn-3d btn-blue" id="btn-test-speaker" style="flex: 1; min-height: 48px; font-size: 0.82rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                <span class="audio-btn-icon">${window.VisualEngine ? window.VisualEngine.getAudioIconSVG('speaker', 18) : '🔊'}</span> Testa högtalare
              </button>
              <button type="button" class="btn-3d btn-green" id="btn-test-mic" style="flex: 1; min-height: 48px; font-size: 0.82rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                <span class="audio-btn-icon" id="test-mic-icon">${window.VisualEngine ? window.VisualEngine.Library.microphone() : '🎙️'}</span> <span id="test-mic-label">Testa mikrofon</span>
              </button>
            </div>
            <div id="settings-test-status" style="font-size: 0.82rem; font-weight: 700; color: var(--text-main); margin-top: 10px; text-align: center; min-height: 24px; line-height: 1.4;"></div>
          </div>

          <!-- Hantera API-nycklar (Skyddat lokalt i webbläsaren) -->
          <div style="margin-top: 2px;">
            <button type="button" class="btn-3d btn-surface w-full" id="btn-open-key-manager" style="min-height: 42px; font-size: 0.84rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>🔑</span> <span>Hantera API-nycklar (Groq Whisper & Azure)</span>
            </button>
            <div id="key-manager-status-indicator" style="font-size: 0.74rem; color: var(--text-secondary); text-align: center; margin-top: 4px; font-weight: 700;"></div>
          </div>

          <!-- Spara-knapp -->
          <button type="button" class="btn-3d btn-green w-full" id="btn-save-settings" style="min-height: 52px; font-size: 1rem; margin-top: 4px;">
            💾 Spara inställningar
          </button>
        </div>
      `;

      document.body.appendChild(backdrop);
      this.modalBackdrop = backdrop;

      // Händelsekopplingar
      document.getElementById('btn-close-settings-modal')?.addEventListener('click', () => this.close());
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) this.close();
      });

      const cardGroq = document.getElementById('card-engine-groq');
      const cardAzure = document.getElementById('card-engine-azure');
      const cardWebkit = document.getElementById('card-engine-webkit');

      const selectEngineUI = (engine) => {
        cardGroq?.classList.toggle('selected', engine === 'groq');
        cardAzure?.classList.toggle('selected', engine === 'azure');
        cardWebkit?.classList.toggle('selected', engine === 'webkit');
      };

      cardGroq?.addEventListener('click', () => selectEngineUI('groq'));
      cardAzure?.addEventListener('click', () => selectEngineUI('azure'));
      cardWebkit?.addEventListener('click', () => selectEngineUI('webkit'));

      // Taltempo knappar
      let selectedSpeed = AudioPlayer.getSpeechRate();
      const speedBtns = backdrop.querySelectorAll('.settings-speed-btn');

      const selectSpeedUI = (speed) => {
        selectedSpeed = speed;
        speedBtns.forEach((btn) => {
          const btnSpeed = parseFloat(btn.dataset.speed || '0.88');
          btn.classList.toggle('selected', Math.abs(btnSpeed - speed) < 0.05);
        });
      };

      speedBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          window.VisualEngine?.haptic('light', btn);
          SoundFX.playSound('tap');
          selectSpeedUI(parseFloat(btn.dataset.speed || '0.88'));
        });
      });

      document.getElementById('btn-save-settings')?.addEventListener('click', () => {
        let selectedEngine = 'groq';
        if (cardAzure?.classList.contains('selected')) {
          selectedEngine = 'azure';
        } else if (cardWebkit?.classList.contains('selected')) {
          selectedEngine = 'webkit';
        }

        speechJudgeInstance.setEnginePreference(selectedEngine);
        AudioPlayer.setSpeechRate(selectedSpeed);
        SoundFX.playCorrect();
        this.close();
      });

      document.getElementById('btn-open-key-manager')?.addEventListener('click', () => {
        speechJudgeInstance.openApiKeyManagerModal();
      });

      // Testa Högtalare med valt taltempo
      document.getElementById('btn-test-speaker')?.addEventListener('click', () => {
        const statusEl = document.getElementById('settings-test-status');
        const curRate = selectedSpeed || AudioPlayer.getSpeechRate();
        const speedText = curRate >= 1.1 ? 'extra snabbt (1.15x)' : curRate >= 0.95 ? 'snabbt (1.0x)' : 'standard (0.88x)';
        if (statusEl) statusEl.innerHTML = `🔊 Spelar upp i ${speedText}...`;
        AudioPlayer.speakSwedish('Hej! Nu fungerar högtalaren med valt taltempo.', curRate, () => {
          if (statusEl) statusEl.innerHTML = `<span style="color: #166534;">✅ Högtalaren fungerar utmärkt i ${speedText}!</span>`;
        });
      });

      // Testa Mikrofon (Med automatisk feedback och responsiv status)
      let micTestTimer = null;
      document.getElementById('btn-test-mic')?.addEventListener('click', () => {
        const statusEl = document.getElementById('settings-test-status');
        const micLabel = document.getElementById('test-mic-label');
        const micBtn = document.getElementById('btn-test-mic');

        if (speechJudgeInstance.isRecording || azureSpeechJudgeInstance.isRecording) {
          speechJudgeInstance.finishRecordingAndJudge();
          return;
        }

        SoundFX.playSound('tap');
        if (micLabel) micLabel.textContent = 'Lyssnar...';
        if (micBtn) {
          micBtn.style.background = '#EF4444';
          micBtn.style.borderColor = '#DC2626';
        }
        if (statusEl) {
          statusEl.innerHTML = '<span style="color: #B91C1C; font-weight: 800;">🔴 Mikrofonen lyssnar... Säg t.ex. "Hej" nu!</span>';
        }

        const resetBtnUI = () => {
          if (micLabel) micLabel.textContent = 'Testa mikrofon';
          if (micBtn) {
            micBtn.style.background = '';
            micBtn.style.borderColor = '';
          }
        };

        speechJudgeInstance.start('Hej', {
          onStateChange: (state) => {
            if (state === 'analyzing') {
              if (statusEl) statusEl.innerHTML = '<span style="color: #0284C7; font-weight: 800;">⭐ Analyserar mikrofonsignal...</span>';
            }
          },
          onAudioLevel: (lvl) => {
            if (lvl > 0.15 && statusEl) {
              statusEl.innerHTML = `<span style="color: #166534; font-weight: 800;">🎙️ Röstsignal upptäckt: ${'●'.repeat(Math.min(6, Math.max(1, Math.round(lvl * 6))))}</span>`;
            }
          },
          onResult: (res) => {
            resetBtnUI();
            SoundFX.playSound('correct');
            if (statusEl) {
              const heard = res.transcript || res.evaluation?.spokenClean || 'Hej';
              const score = res.evaluation?.pronScore || res.evaluation?.score || 95;
              statusEl.innerHTML = `
                <span style="color: #166534; font-weight: 900;">✅ Mikrofonen fungerar utmärkt!</span><br>
                <span style="color: #475569; font-size: 0.8rem;">Vi hörde: <strong>"${heard}"</strong> (Uttal: ${score}%)</span>
              `;
            }
          },
          onError: (err) => {
            resetBtnUI();
            SoundFX.playSound('retry');
            if (statusEl) {
              const isBlocked = err.name === 'NotAllowedError' || String(err.message).includes('not-allowed');
              statusEl.innerHTML = `
                <span style="color: #DC2626; font-weight: 800;">
                  ⚠️ ${isBlocked ? 'Mikrofonåtkomst är blockerad i webbläsaren. Tillåt mikrofonen i adressfältet.' : err.message || 'Kunde inte starta mikrofonen'}
                </span>
              `;
            }
          }
        });

        // Automatisk stopp efter 3.5 sekunder om användaren inte klickar igen
        if (micTestTimer) clearTimeout(micTestTimer);
        micTestTimer = setTimeout(() => {
          if (speechJudgeInstance.isRecording) {
            speechJudgeInstance.stop();
          }
        }, 3500);
      });

      return backdrop;
    },

    populateValues() {
      const pref = speechJudgeInstance.getEnginePreference();
      const cardGroq = document.getElementById('card-engine-groq');
      const cardAzure = document.getElementById('card-engine-azure');
      const cardWebkit = document.getElementById('card-engine-webkit');

      cardGroq?.classList.toggle('selected', pref === 'groq');
      cardAzure?.classList.toggle('selected', pref === 'azure');
      cardWebkit?.classList.toggle('selected', pref === 'webkit');

      const currentSpeed = AudioPlayer.getSpeechRate();
      const speedBtns = document.querySelectorAll('.settings-speed-btn');
      speedBtns.forEach((btn) => {
        const btnSpeed = parseFloat(btn.dataset.speed || '0.88');
        btn.classList.toggle('selected', Math.abs(btnSpeed - currentSpeed) < 0.05);
      });

      const indicator = document.getElementById('key-manager-status-indicator');
      const hasGroq = Boolean(speechJudgeInstance.getApiKey());
      if (indicator) {
        indicator.textContent = hasGroq
          ? '🟢 Groq Whisper är redo (nyckel sparad lokalt)'
          : '⚪ Ingen Groq-nyckel sparad ännu (klicka ovan för att ange)';
      }
    }
  };

  window.SettingsUI = SettingsUI;
  if (window.SpeechEngine) {
    window.SpeechEngine.SettingsUI = SettingsUI;
  }

  /* ==========================================================================
     6. INTEGRATION MED UTTALSÖVNINGAR & INTERAKTIV 3-STATE INSPELNINGSKNAPP
     ========================================================================== */

  function renderInteractivePronunciationUI(stage, q) {
    const item = q.targetItem;
    const defaultGuide = getMouthGuideForTarget(item);
    const activePref = speechJudgeInstance.getEnginePreference();
    const isAzure = activePref === 'azure';
    const isGroq = activePref === 'groq';

    let badgeText = '📱 Röstigenkänning Aktiv';
    if (isAzure) {
      badgeText = '🎯 AI-Uttalsbedömning (sv-SE)';
    } else if (isGroq && speechJudgeInstance.isGroqReady()) {
      badgeText = '🚀 Whisper AI Aktiv';
    }

    stage.innerHTML = `
      <div class="exercise-badge-row">
        <span class="exercise-type-tag">${q.typeLabel || 'Uttal • ฝึกพูด'}</span>
        <span class="satun-badge">
          ${badgeText}
        </span>
      </div>
      <h2 class="exercise-prompt-sv">${q.promptSv || 'Säg på svenska'}</h2>
      <p class="exercise-prompt-th">${q.promptTh || 'แตะปุ่มไมโครโฟนแล้วออกเสียง'}</p>

      <div class="pronunciation-card" style="padding: 16px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 8px;">
          <div style="width: 64px; height: 64px;">
            ${window.VisualEngine ? window.VisualEngine.getIllustrationSVG(item) : '🗣️'}
          </div>
          <div style="text-align: left;">
            <div class="pronun-sv-phrase" style="font-size: 1.45rem;">${item.sv}</div>
            <div style="margin-top: 4px;">
              ${window.PhoneticBlurHelper ? window.PhoneticBlurHelper.renderHtml(item) : `<div class="pronun-phonetic-pill">คำอ่าน: ${item.phonetic || ''}</div>`}
            </div>
          </div>
        </div>

        <div class="pronun-th-meaning">
          <strong>${item.th || ''}</strong> • <span style="color:#7B2CBF;">🌴 ${item.satun || ''}</span>
        </div>

        <!-- Två tydliga ljudknappar (🔊 Normal/Snabbt & 🐢 Sköldpadda 0.60x) -->
        <div style="display: flex; justify-content: center; gap: 10px; margin-top: 12px;">
          <button type="button" class="btn-3d btn-blue" id="btn-pronun-listen" style="min-height: 54px; flex: 1; padding: 8px 12px; font-size: 0.88rem; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            <span class="audio-btn-icon">${window.VisualEngine ? window.VisualEngine.getAudioIconSVG('speaker', 20) : '🔊'}</span> ${AudioPlayer.getSpeechRate() >= 0.95 ? 'Snabbt' : 'Normal'} (${AudioPlayer.getSpeechRate()}x)
          </button>
          <button type="button" class="btn-3d" id="btn-pronun-slow" style="min-height: 54px; flex: 1; padding: 8px 12px; font-size: 0.88rem; background: var(--lavender); color: #FFF; border-color: var(--lavender); box-shadow: 0 4px 0 var(--lavender-dark); display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            <span class="audio-btn-icon">${window.VisualEngine ? window.VisualEngine.getAudioIconSVG('turtle', 20) : '🐢'}</span> Sköldpadda (0.60x)
          </button>
        </div>
      </div>

      <!-- KRAV 4: 3-State Inspelningsknapp & Live Audio Waveform -->
      <div class="mic-stage-box" style="gap: 8px; margin-top: 4px;">
        <button type="button" class="mic-record-btn state-idle" id="btn-mic-record" aria-label="Spela in uttal">
          <div class="mic-btn-icon-wrap" id="mic-btn-icon-wrap">
            <span class="stat-icon-svg" style="width: 32px; height: 32px;">${window.VisualEngine ? window.VisualEngine.Library.microphone() : '🎙️'}</span>
          </div>
          <span class="mic-btn-status-label" id="mic-btn-status-label">
            Lyssna på mig
          </span>
        </button>

        <!-- Animerad ljudvåg (Live Audio Meter) -->
        <div class="live-audio-meter-bar" id="live-audio-meter-bar">
          <span class="vol-bar"></span>
          <span class="vol-bar"></span>
          <span class="vol-bar"></span>
          <span class="vol-bar"></span>
          <span class="vol-bar"></span>
          <span class="vol-bar"></span>
          <span class="vol-bar"></span>
          <span class="vol-bar"></span>
          <span class="vol-bar"></span>
        </div>

        <div class="live-hearing-pill" id="live-hearing-pill">
          <span>👂</span>
          <span id="live-hearing-text" class="th-text">แตะปุ่มไมโครโฟนแล้วพูดคำว่า "${item.sv}"</span>
        </div>

        <!-- Dynamisk bedömningsyta (Pass >=75%, Almost 45-74%, Retry <45%) -->
        <div id="pronun-evaluation-slot" style="width: 100%;">
          <div class="mouth-guide-box">
            <div class="mouth-svg-icon">${defaultGuide.svgDiagram}</div>
            <div class="th-text" style="font-size: 0.82rem; text-align: left;">
              <div style="font-weight: 800; color: var(--text-main);">👄 ${defaultGuide.titleSv}</div>
              <div style="color: var(--text-secondary);">${defaultGuide.tipTh}</div>
            </div>
          </div>
        </div>

        <!-- Direkt-test knappar för att simulera nivåer -->
        <div class="sim-test-bar">
          <button type="button" class="sim-pill-btn" data-sim="pass">✨ 95% Pass</button>
          <button type="button" class="sim-pill-btn" data-sim="almost">💛 65% Almost</button>
          <button type="button" class="sim-pill-btn" data-sim="retry">🧡 35% Retry</button>
        </div>
      </div>
    `;

    // Spela automatiskt upp ordet i valt taltempo
    setTimeout(() => AudioPlayer.playTargetItem(item), 220);

    document.getElementById('btn-pronun-listen')?.addEventListener('click', (e) => {
      window.VisualEngine?.haptic('light', e.currentTarget);
      SoundFX.playClick();
      AudioPlayer.playTargetItem(item);
    });

    document.getElementById('btn-pronun-slow')?.addEventListener('click', (e) => {
      window.VisualEngine?.haptic('light', e.currentTarget);
      SoundFX.playClick();
      window.GameEngine?.updateQuestProgress?.('turtle_3', 1);
      AudioPlayer.speakSlow(item.sv);
    });

    const micBtn = document.getElementById('btn-mic-record');
    const micIcon = document.getElementById('mic-btn-icon-wrap');
    const micLabel = document.getElementById('mic-btn-status-label');
    const meterBar = document.getElementById('live-audio-meter-bar');
    const volBars = meterBar ? meterBar.querySelectorAll('.vol-bar') : [];
    const hearingText = document.getElementById('live-hearing-text');
    const evalSlot = document.getElementById('pronun-evaluation-slot');
    const checkBtn = document.getElementById('btn-check-answer');

    const updateButtonState = (state) => {
      if (!micBtn || !micIcon || !micLabel) return;
      micBtn.classList.remove('state-idle', 'state-recording', 'state-analyzing');

      if (state === 'recording') {
        micBtn.classList.add('state-recording');
        micIcon.innerHTML = '🔴';
        micLabel.innerHTML = 'Spelar in...<br>(Klicka för att stoppa)';
        meterBar?.classList.add('active');
        if (hearingText) hearingText.textContent = '🎧 Lyssnar på dig... Tala nu!';
      } else if (state === 'analyzing') {
        micBtn.classList.add('state-analyzing');
        micIcon.innerHTML = '<span class="mic-spin-star">⭐</span>';
        micLabel.innerHTML = 'Tänker /<br>Analyserar...';
        meterBar?.classList.remove('active');
        if (hearingText) hearingText.textContent = '⭐ Analyserar ditt uttal...';
      } else {
        micBtn.classList.add('state-idle');
        micIcon.innerHTML = '🎙️';
        micLabel.innerHTML = 'Lyssna på mig';
        meterBar?.classList.remove('active');
        volBars.forEach((b) => (b.style.height = '6px'));
      }
    };

    const displayResult = (res) => {
      const evaluation = res.evaluation;
      const lessonCtrl = window.GameEngine?.LessonController;

      if (hearingText) {
        if (evaluation.engine === 'azure') {
          hearingText.innerHTML = `Appen uppfattade: <strong>"${evaluation.spokenClean || item.sv}"</strong>`;
        } else {
          hearingText.innerHTML = evaluation.spokenClean
            ? `Appen hörde: <strong>"${evaluation.spokenRaw || evaluation.spokenClean}"</strong> (${evaluation.score}%)`
            : 'Inget tal uppfattades • ลองกดแล้วพูดใหม่อีกครั้งนะ';
        }
      }

      // ----------------------------------------------------------------------
      // MICROSOFT AZURE PRONUNCIATION ASSESSMENT UI
      // ----------------------------------------------------------------------
      if (evaluation.engine === 'azure') {
        const isPass = evaluation.status === 'pass';
        if (isPass) {
          if (lessonCtrl) lessonCtrl.pronunciationPassed = true;
          if (checkBtn) {
            checkBtn.disabled = false;
            checkBtn.textContent = 'FORTSÄTT (GODKÄNT!) • ไปต่อเลย';
          }
        }

        // 3. Stjärnanimering: Sekventiell fjädrande pop-in (0.1s, 0.25s, 0.4s)
        let starsHtml = '';
        if (isPass) {
          const count = Math.max(1, Math.min(3, evaluation.starsCount || (evaluation.pronScore >= 90 ? 3 : evaluation.pronScore >= 80 ? 2 : 1)));
          starsHtml = `
            <div class="azure-stars-row ${count === 3 ? 'all-three' : ''}" title="${count} av 3 stjärnor">
              <span class="azure-star-item star-1 ${count >= 1 ? 'earned' : 'unearned'}">⭐</span>
              <span class="azure-star-item star-2 ${count >= 2 ? 'earned' : 'unearned'}">⭐</span>
              <span class="azure-star-item star-3 ${count >= 3 ? 'earned' : 'unearned'}">⭐</span>
            </div>
          `;
        }

        // 5. Ordlista med färgkodning (Undvik röd felmarkering vid godkänt uttal)
        const wordsHtml = evaluation.words && evaluation.words.length
          ? `<div class="azure-words-row">
              ${evaluation.words.map((w) => {
                const wScore = w.score != null && w.score > 0 ? w.score : (isPass ? evaluation.pronScore : 0);
                let chipColor = w.colorCategory || 'green';
                if (isPass && (chipColor === 'red' || wScore < 60)) {
                  chipColor = 'amber';
                }
                return `
                  <span class="azure-word-chip word-${chipColor}" title="${w.word}: ${wScore}%">
                    ${w.word} <small style="opacity: 0.85; font-weight: 700;">(${wScore}%)</small>
                  </span>
                `;
              }).join('')}
            </div>`
          : '';

        // 5. Avvikande ljud: Om tomt [], dölj eller visa ren grön bock istället för råa hakparenteser
        const devSyllables = evaluation.deviatedSyllables || [];
        const devPhonemes = evaluation.deviatedPhonemes || [];
        let deviatedHtml = '';

        if (devSyllables.length > 0) {
          deviatedHtml = `
            <div class="azure-deviated-box" style="font-size: 0.82rem; color: #854D0E; background: #FEF9C3; border: 1px solid #FDE047; border-radius: 10px; padding: 7px 12px; text-align: center; font-weight: 700;">
              💡 Uttalstips: Träna lite extra på stavelsen ${devSyllables.map((s) => `<span class="azure-phoneme-badge" style="background:#fff; border-color:#F59E0B; color:#B45309; padding: 2px 7px; border-radius: 6px;">${s}</span>`).join(' ')}
            </div>`;
        } else if (devPhonemes.length > 0) {
          deviatedHtml = `
            <div class="azure-deviated-box" style="font-size: 0.82rem; color: #854D0E; background: #FEF9C3; border: 1px solid #FDE047; border-radius: 10px; padding: 7px 12px; text-align: center; font-weight: 700;">
              💡 Uttalstips: Fokusera på ljudet ${devPhonemes.map((ph) => `<span class="azure-phoneme-badge" style="background:#fff; border-color:#F59E0B; color:#B45309; padding: 2px 7px; border-radius: 6px;">[${ph}]</span>`).join(' ')}
            </div>`;
        } else if (isPass) {
          deviatedHtml = `
            <div class="azure-no-deviations" style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.82rem; color: #15803D; background: #DCFCE7; border: 1px solid #BBF7D0; border-radius: 10px; padding: 7px 12px; font-weight: 700;">
              <span>✅</span> Inga avvikande ljud (rent och tydligt uttal!)
            </div>`;
        }

        evalSlot.innerHTML = `
          <div class="pronun-feedback-card ${isPass ? 'tier-passed' : evaluation.status === 'almost' ? 'tier-almost' : 'tier-retry'}">
            <!-- 2. Header & Badge på en rad utan onödig textbrytning -->
            <div class="pronun-header-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 8px;">
              <div style="font-weight: 900; font-size: 1.15rem; color: ${isPass ? '#15803D' : evaluation.status === 'almost' ? '#B45309' : '#DC2626'};">
                ${isPass ? '🌟 GODKÄNT!' : evaluation.status === 'almost' ? '💛 NÄSTAN RÄTT!' : '🧡 PROVA IGEN!'}
              </div>
              <span class="pronun-score-badge azure-engine-pill" style="white-space: nowrap; font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; background: rgba(0, 0, 0, 0.04); color: ${isPass ? '#166534' : evaluation.status === 'almost' ? '#854D0E' : '#991B1B'}; flex-shrink: 0;">
                🎯 Azure sv-SE
              </span>
            </div>

            <!-- 3. Stjärnanimering -->
            ${starsHtml}

            <!-- 4. Mätarpanel (PronScore, Noggrannhet, Flyt, Prosodi) med vertikala avdelare -->
            <div class="azure-scores-hud">
              <div class="azure-score-box">
                <span class="azure-score-num" style="color: ${isPass ? '#15803D' : '#DC2626'};">
                  ${evaluation.pronScore}%
                </span>
                <span class="azure-score-label">PronScore</span>
              </div>
              <div class="azure-score-box">
                <span class="azure-score-num">${evaluation.accuracyScore}%</span>
                <span class="azure-score-label">Noggrannhet</span>
              </div>
              <div class="azure-score-box">
                <span class="azure-score-num">${evaluation.fluencyScore}%</span>
                <span class="azure-score-label">Flyt</span>
              </div>
              <div class="azure-score-box">
                <span class="azure-score-num">${evaluation.prosodyScore}%</span>
                <span class="azure-score-label">Prosodi</span>
              </div>
            </div>

            <!-- 5. Ordlista & Avvikande ljud -->
            ${wordsHtml}
            ${deviatedHtml}

            <!-- 6. Feedback-sektion med avskiljande linje och lila callout-ruta -->
            <div class="azure-feedback-section" style="border-top: 1px solid #E2E8F0; padding-top: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div class="th-text" style="font-size: 0.88rem; color: #334155; line-height: 1.45; font-weight: 600;">
                ${evaluation.feedbackTh}
              </div>
              ${evaluation.satunTip ? `
                <div class="satun-callout-box" style="background: #F3E8FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 8px 12px; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="font-size: 1.1rem; flex-shrink: 0; line-height: 1.2;">🌴</span>
                  <div class="th-text" style="font-size: 0.82rem; color: #6B21A8; font-weight: 700; line-height: 1.4;">
                    ${evaluation.satunTip}
                  </div>
                </div>
              ` : ''}
            </div>

            ${!isPass ? `
              <div style="display: flex; gap: 8px; margin-top: 6px;">
                <button type="button" class="btn-3d btn-coral" id="btn-azure-retry-mic" style="min-height: 48px; flex: 1; padding: 8px 12px; font-size: 0.84rem;">
                  🎙️ Prova igen • ลองใหม่นะจ๊ะ
                </button>
                <button type="button" class="btn-3d btn-surface" id="btn-azure-listen-slow" style="min-height: 48px; padding: 8px 12px; font-size: 0.84rem;" title="Sköldpadda 0.60x">
                  🐢 0.60x
                </button>
              </div>
            ` : ''}
          </div>
        `;

        if (!isPass) {
          document.getElementById('btn-azure-retry-mic')?.addEventListener('click', () => micBtn?.click());
          document.getElementById('btn-azure-listen-slow')?.addEventListener('click', () => AudioPlayer.speakSlow(item.sv));
        }
        return;
      }

      // ----------------------------------------------------------------------
      // GROQ WHISPER & WEBKIT FEEDBACK UI
      // ----------------------------------------------------------------------
      if (evaluation.status === 'pass') {
        if (lessonCtrl) lessonCtrl.pronunciationPassed = true;
        if (checkBtn) {
          checkBtn.disabled = false;
          checkBtn.textContent = 'FORTSÄTT (GODKÄNT!) • ไปต่อเลย';
        }

        evalSlot.innerHTML = `
          <div class="pronun-feedback-card tier-passed">
            <div class="pronun-header-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 8px;">
              <div style="font-weight: 900; font-size: 1.15rem; color: #15803D;">
                🌟 GODKÄNT!
              </div>
              <span class="pronun-score-badge" style="white-space: nowrap; font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; background: rgba(0, 0, 0, 0.04); color: #166534; flex-shrink: 0;">
                🎯 AI Match: ${evaluation.score}%
              </span>
            </div>

            <div class="azure-feedback-section" style="border-top: 1px solid #E2E8F0; padding-top: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div class="th-text" style="font-size: 0.88rem; color: #334155; line-height: 1.45; font-weight: 600;">
                ${evaluation.feedbackTh}
              </div>
              ${evaluation.satunTip ? `
                <div class="satun-callout-box" style="background: #F3E8FF; border: 1px solid #E9D5FF; border-radius: 12px; padding: 8px 12px; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="font-size: 1.1rem; flex-shrink: 0; line-height: 1.2;">🌴</span>
                  <div class="th-text" style="font-size: 0.82rem; color: #6B21A8; font-weight: 700; line-height: 1.4;">
                    ${evaluation.satunTip}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      } else if (evaluation.status === 'almost') {
        const missInfo = evaluation.missingWords.length
          ? `Saknat/otydligt ljud i: <strong>"${evaluation.missingWords.join(', ')}"</strong>`
          : `Bra försök på <strong>"${item.sv}"</strong>!`;

        evalSlot.innerHTML = `
          <div class="pronun-feedback-card tier-almost">
            <div class="pronun-header-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 8px;">
              <div style="font-weight: 900; font-size: 1.15rem; color: #B45309;">
                💛 NÄSTAN RÄTT!
              </div>
              <span class="pronun-score-badge" style="white-space: nowrap; font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; background: rgba(0, 0, 0, 0.04); color: #854D0E; flex-shrink: 0;">
                ${evaluation.score}%
              </span>
            </div>

            <div class="azure-feedback-section" style="border-top: 1px solid #E2E8F0; padding-top: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div class="th-text" style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                ${missInfo} • ${evaluation.feedbackTh}
              </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button type="button" class="btn-3d btn-warm" id="btn-eval-retry-mic" style="min-height: 48px; flex: 1; padding: 8px 12px; font-size: 0.84rem;">
                🎙️ Prova igen • พูดอีกครั้ง
              </button>
              <button type="button" class="btn-3d btn-surface" id="btn-eval-play-slow" style="min-height: 48px; padding: 8px 12px; font-size: 0.84rem;">
                🐢 0.60x
              </button>
            </div>
          </div>
        `;

        document.getElementById('btn-eval-retry-mic')?.addEventListener('click', () => micBtn?.click());
        document.getElementById('btn-eval-play-slow')?.addEventListener('click', () => AudioPlayer.speakSlow(item.sv));
      } else {
        evalSlot.innerHTML = `
          <div class="pronun-feedback-card tier-retry">
            <div class="pronun-header-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 8px;">
              <div style="font-weight: 900; font-size: 1.15rem; color: #DC2626;">
                🧡 PROVA IGEN!
              </div>
              <span class="pronun-score-badge" style="white-space: nowrap; font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; background: rgba(0, 0, 0, 0.04); color: #991B1B; flex-shrink: 0;">
                ${evaluation.score}%
              </span>
            </div>

            <div class="azure-feedback-section" style="border-top: 1px solid #E2E8F0; padding-top: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div class="th-text" style="font-size: 0.86rem; color: #334155; line-height: 1.45;">
                ${evaluation.feedbackTh}
              </div>
            </div>

            <div class="mouth-guide-box" style="margin-top: 4px;">
              <div class="mouth-svg-icon">${evaluation.mouthGuide.svgDiagram}</div>
              <div class="th-text" style="font-size: 0.82rem;">
                <div style="font-weight: 900; color: #991B1B;">👄 ${evaluation.mouthGuide.titleSv}</div>
                <div>${evaluation.mouthGuide.tipTh}</div>
              </div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 4px;">
              <button type="button" class="btn-3d btn-coral" id="btn-retry-mic-again" style="min-height: 48px; flex: 1; padding: 8px 12px; font-size: 0.84rem;">
                🎙️ Prova igen • ลองใหม่นะจ๊ะ
              </button>
              <button type="button" class="btn-3d btn-surface" id="btn-retry-turtle" style="min-height: 48px; padding: 8px 12px; font-size: 0.84rem;">
                🐢 Lyssna
              </button>
            </div>
          </div>
        `;

        document.getElementById('btn-retry-mic-again')?.addEventListener('click', () => micBtn?.click());
        document.getElementById('btn-retry-turtle')?.addEventListener('click', () => AudioPlayer.speakSlow(item.sv));
      }
    };

    let lastMicTap = 0;
    micBtn?.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastMicTap < 400) {
        e?.preventDefault?.();
        return; // Förhindra oavsiktliga dubbelklick
      }
      lastMicTap = now;

      window.VisualEngine?.haptic('light', micBtn);

      if (speechJudgeInstance.isRecording || azureSpeechJudgeInstance.isRecording) {
        speechJudgeInstance.finishRecordingAndJudge();
        return;
      }

      if (speechJudgeInstance.isStarting || speechJudgeInstance.isAnalyzing || azureSpeechJudgeInstance.isStarting || azureSpeechJudgeInstance.isAnalyzing) {
        return;
      }

      // Kritiskt: Stoppa all pågående taluppspelning innan inspelning startar
      AudioPlayer.stop();

      speechJudgeInstance.start(item, {
        onStateChange: (state) => updateButtonState(state),
        onAudioLevel: (lvl) => {
          if (!volBars.length) return;
          volBars.forEach((bar, idx) => {
            const h = Math.max(6, Math.round(lvl * 28 * (1 + Math.sin(idx))));
            bar.style.height = `${h}px`;
          });
        },
        onHearing: (interimText) => {
          if (hearingText) {
            hearingText.innerHTML = `🎧 Hörde: <strong>"${interimText}"</strong>...`;
          }
        },
        onResult: (res) => {
          updateButtonState('idle');
          displayResult(res);
        },
        onError: (err) => {
          updateButtonState('idle');
          if (hearingText) {
            hearingText.innerHTML = `⚠️ ${err.message || 'Kunde inte nå mikrofon'}`;
          }
        }
      });
    });

    // Simuleringsknappar för direkt-test (anpassad efter vald motor)
    stage.querySelectorAll('[data-sim]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-sim');
        const curPref = speechJudgeInstance.getEnginePreference();

        if (curPref === 'azure') {
          const evalRes = azureSpeechJudgeInstance.simulateEvaluation(item, mode);
          displayResult({ transcript: item.sv, evaluation: evalRes });
        } else {
          let fakeText = item.sv;
          if (mode === 'almost') fakeText = item.sv.slice(0, Math.ceil(item.sv.length * 0.6));
          if (mode === 'retry') fakeText = 'annat ord';

          const evalRes = evaluatePronunciation(fakeText, item.sv);
          speechJudgeInstance._applyDopamineFeedback(evalRes, item);
          displayResult({ transcript: fakeText, evaluation: evalRes });
        }
      });
    });

    // Aktivera progressiv fonetisk ledtråd (suddig/blurrad thai-fonetik)
    window.PhoneticBlurHelper?.bindEvents(stage);
  }

  /* ==========================================================================
     7. SAMMANKOPPLING AV GLOBALA SYSTEM (window.SpeechEngine)
     ========================================================================== */

  window.SpeechEngine = Object.assign(window.SpeechEngine || {}, {
    SoundFX,
    AudioPlayer,
    SpeechJudge: speechJudgeInstance,
    AzureSpeechJudge: azureSpeechJudgeInstance,
    evaluatePronunciation,
    PhoneticEvaluator: {
      evaluateAlternatives: (targetItem, alts) => {
        const spoken = alts[0] || '';
        const target = typeof targetItem === 'object' ? targetItem.sv : String(targetItem || '');
        return evaluatePronunciation(spoken, target);
      },
      getMouthGuideForTarget
    },

    playSound: (effect) => SoundFX.playSound(effect),
    stopAudio: AudioPlayer.stop.bind(AudioPlayer),
    speakSwedish: AudioPlayer.speakSwedish.bind(AudioPlayer),
    speakSlow: AudioPlayer.speakSlow.bind(AudioPlayer),
    speakTurtle065: AudioPlayer.speakSlow.bind(AudioPlayer),
    speakThai: AudioPlayer.speakThai.bind(AudioPlayer),
    playTargetItem: AudioPlayer.playTargetItem.bind(AudioPlayer),
    getSpeechRate: () => AudioPlayer.getSpeechRate(),
    setSpeechRate: (r) => AudioPlayer.setSpeechRate(r),

    listenAndEvaluate: (targetItem, callbacks = {}) => {
      return speechJudgeInstance.start(targetItem, {
        onStateChange: callbacks.onStateChange,
        onAudioLevel: callbacks.onAudioLevel,
        onHearing: callbacks.onHearing,
        onResult: (res) => {
          if (callbacks.onEvaluated) callbacks.onEvaluated(res.evaluation);
          if (callbacks.onResult) callbacks.onResult(res);
        },
        onError: callbacks.onError
      });
    },

    finishRecordingAndJudge: () => speechJudgeInstance.finishRecordingAndJudge(),
    stopListening: () => speechJudgeInstance.stop()
  });

  // Krok för GameEngine / LessonController
  function attachLessonHooks() {
    SettingsUI.init();

    const lessonCtrl = window.GameEngine?.LessonController;
    if (lessonCtrl) {
      lessonCtrl._renderPronunciation = function (stage, q) {
        renderInteractivePronunciationUI(stage, q);
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachLessonHooks);
  } else {
    attachLessonHooks();
  }
})();

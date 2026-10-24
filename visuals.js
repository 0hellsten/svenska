/**
 * ============================================================================
 * VISUALS.JS — DEL 2 AV 5
 * Interaktiv levande maskot (Nong Dala), levande bildbibliotek & partikelmotor
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. NONG DALA (น้องดาหลา) — INTERAKTIV, LEVANDE MASKOT
     Kombinerar svensk Dalahäst/Älg med varm sydthailändsk charm (Satun)
     ========================================================================== */

  const SATUN_PHRASES = {
    correct: [
      { th: "เก่งมากเลยจ้า!", satun: "หรอยจังฮู้! (สุดยอดไปเลย)" },
      { th: "ตอบถูกเป๊ะเลย!", satun: "เก่งจังแล! บายใจจังฮู้" },
      { th: "ยอดเยี่ยมมาก!", satun: "แหลงสวีเดนหรอยแรงนิ!" },
      { th: "ฉลาดจังเลย!", satun: "ถูกเผงเลยตะเอง!" }
    ],
    retry: [
      { th: "เกือบถูกแล้ว ลองอีกทีนะ!", satun: "เอาใหม่ต๊ะ ไม่เป็นไรจ้า!" },
      { th: "สู้ๆ นะจ๊ะ!", satun: "ไม่ต้องตกใจ ค่อยๆ แหลง" },
      { th: "ฟังเสียงอีกรอบดูนะ!", satun: "ลองแลหล่าว! เดี๋ยวก็คล่อง" }
    ],
    streak_fire: [
      { th: "ไฟลุกแล้ว 5 ข้อติด!", satun: "หรอยแรงนิ! ติดไฟเลยแหล่ว!" },
      { th: "สุดยอดนักสู้!", satun: "เก่งเบอร์นี้ คนสตูลภูมิใจจังฮู้!" }
    ],
    listening: [
      { th: "วิลาวัลย์กำลังตั้งใจฟัง...", satun: "แหลงมาเลยจ้า วิลาวัลย์ฟังอยู่!" }
    ],
    speaking: [
      { th: "ฟังเสียงสวีเดนชัดๆ นะ", satun: "เงี่ยหูฟังต๊ะ ออกเสียงตามเลย" }
    ],
    greeting: [
      { th: "ยินดีต้อนรับจ้า!", satun: "สวัสดีจ้า! มาแหลงสวีเดนกันต๊ะ" },
      { th: "วันนี้พร้อมลุยไหม?", satun: "กินข้าวมายัง? มาเรียนกันต๊ะ" }
    ]
  };

  const MascotController = {
    currentState: 'idle',
    bubbleTimer: null,
    activeMascotElements: new Set(),

    /**
     * Genererar fullständig inline-SVG för Nong Dala med alla lager och delar
     */
    getSVG(size = 72, state = 'idle') {
      return `
        <svg class="dala-svg" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Wilawan maskot">
          <defs>
            <radialGradient id="dalaShine" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stop-color="#FF6B55" />
              <stop offset="60%" stop-color="#EE3B24" />
              <stop offset="100%" stop-color="#B81A07" />
            </radialGradient>
            <linearGradient id="antlerGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFE066" />
              <stop offset="100%" stop-color="#D49A00" />
            </linearGradient>
            <radialGradient id="fireAura" cx="50%" cy="80%" r="55%">
              <stop offset="0%" stop-color="#FFC800" stop-opacity="0.9" />
              <stop offset="50%" stop-color="#FF4B4B" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#FF0000" stop-opacity="0" />
            </radialGradient>
          </defs>

          <!-- TILLSTÅND F: ELDSLÅGOR (STREAK FIRE) -->
          <g class="dala-fire-flames" style="opacity: 0; pointer-events: none;">
            <circle cx="50" cy="55" r="42" fill="url(#fireAura)" />
            <path d="M 32 85 Q 26 50 38 40 Q 42 60 48 45 Q 56 65 62 42 Q 74 58 68 85 Z" fill="#FF7A00" opacity="0.8" />
            <path d="M 38 85 Q 34 58 44 50 Q 50 68 55 52 Q 62 70 64 85 Z" fill="#FFC800" opacity="0.9" />
          </g>

          <!-- TILLSTÅND C: LYSSTNANDE LJUDVÅGOR RUNT ÖRAT -->
          <g class="dala-listen-waves" style="opacity: 0; pointer-events: none;">
            <circle class="dala-listen-wave-ring" cx="74" cy="24" r="8" stroke="#1CB0F6" stroke-width="2.5" fill="none" />
            <circle class="dala-listen-wave-ring" cx="74" cy="24" r="14" stroke="#58CC02" stroke-width="2" fill="none" />
            <circle class="dala-listen-wave-ring" cx="74" cy="24" r="20" stroke="#FFC800" stroke-width="1.5" fill="none" />
          </g>

          <!-- TILLSTÅND D: STJÄRNOR & KONFETTI (CELEBRATING) -->
          <g class="dala-sparkles-cluster" style="opacity: 0; pointer-events: none;">
            <path d="M 16 26 L 19 20 L 25 23 L 20 27 L 22 33 L 17 29 L 11 31 L 14 25 Z" fill="#FFC800" />
            <path d="M 82 24 L 85 18 L 91 21 L 86 25 L 88 31 L 83 27 L 77 29 L 80 23 Z" fill="#58CC02" />
            <circle cx="28" cy="14" r="2.5" fill="#1CB0F6" />
            <circle cx="72" cy="12" r="3" fill="#CE82FF" />
          </g>

          <!-- TILLSTÅND E: TRÖSTANDE PULSERANDE HJÄRTA (ENCOURAGING) -->
          <g class="dala-heart-float" style="opacity: 0; pointer-events: none;">
            <path d="M 50 16 C 50 16, 43 7, 36 12 C 29 17, 32 26, 50 36 C 68 26, 71 17, 64 12 C 57 7, 50 16, 50 16 Z" fill="#FF4B4B" filter="drop-shadow(0 2px 4px rgba(255,75,75,0.4))" />
          </g>

          <!-- HUVUDKROPP (DALAHÄST / ÄLG HYBRID) -->
          <g class="dala-body-group">
            <!-- Svans -->
            <path class="dala-tail" d="M 22 72 Q 12 70 14 78 Q 20 84 26 77 Z" fill="#A81504" />

            <!-- Bakben (Förankrade mot marken vid stegring) -->
            <g class="dala-hind-legs">
              <!-- Vänster bakben & hov -->
              <rect class="dala-leg-hind-left" x="25" y="74" width="9" height="18" rx="4.5" fill="#B81A07" />
              <rect class="dala-hoof-hind-left" x="25" y="87" width="9" height="5" rx="2" fill="#FFC800" />
              <!-- Höger bakben & hov -->
              <rect class="dala-leg-hind-right" x="68" y="74" width="9" height="18" rx="4.5" fill="#B81A07" />
              <rect class="dala-hoof-hind-right" x="68" y="87" width="9" height="5" rx="2" fill="#FFC800" />
            </g>

            <!-- Kropp (Rund, go och kramvänlig) -->
            <ellipse class="dala-torso" cx="50" cy="66" rx="28" ry="20" fill="url(#dalaShine)" />

            <!-- Framben (Aktiva & stampande vid stegring) -->
            <g class="dala-front-legs">
              <!-- Vänster framben & hov -->
              <g class="dala-leg-front-left">
                <rect class="dala-leg-front-stem-left" x="36" y="76" width="9" height="16" rx="4.5" fill="#D62711" />
                <rect class="dala-hoof-front-left" x="36" y="87" width="9" height="5" rx="2" fill="#FFC800" />
              </g>
              <!-- Höger framben & hov -->
              <g class="dala-leg-front-right">
                <rect class="dala-leg-front-stem-right" x="58" y="76" width="9" height="16" rx="4.5" fill="#D62711" />
                <rect class="dala-hoof-front-right" x="58" y="87" width="9" height="5" rx="2" fill="#FFC800" />
              </g>
            </g>

            <!-- Sydthailändsk Batik-sadel / Dala Kurbits mönster -->
            <path d="M 36 56 Q 50 63 64 56 C 66 68 34 68 36 56 Z" fill="#FFFDF8" stroke="#0077B6" stroke-width="1.8" />
            <!-- Kurbits slingor (Sverige möter Satun) -->
            <path d="M 43 59 Q 50 56 57 59" stroke="#E63946" stroke-width="2" stroke-linecap="round" fill="none" />
            <circle cx="50" cy="62" r="2.2" fill="#FFC800" />
            <circle cx="44" cy="63" r="1.5" fill="#58CC02" />
            <circle cx="56" cy="63" r="1.5" fill="#58CC02" />

            <!-- Älg-horn (Svensk älgkrona i mini-format, söt & gyllene) -->
            <g class="dala-antlers">
              <!-- Vänster horn -->
              <path d="M 38 24 Q 30 14 22 18 Q 28 24 35 27 Z" fill="url(#antlerGold)" />
              <path d="M 28 17 Q 24 8 20 12" stroke="#D49A00" stroke-width="2.5" stroke-linecap="round" />
              <!-- Höger horn -->
              <path d="M 62 24 Q 70 14 78 18 Q 72 24 65 27 Z" fill="url(#antlerGold)" />
              <path d="M 72 17 Q 76 8 80 12" stroke="#D49A00" stroke-width="2.5" stroke-linecap="round" />
            </g>

            <!-- Hals & Huvud -->
            <path d="M 40 54 L 38 34 Q 50 26 62 34 L 60 54 Z" fill="url(#dalaShine)" />
            <circle cx="50" cy="40" r="18" fill="url(#dalaShine)" />

            <!-- Öron (Vänster och Höger) -->
            <path class="dala-ear-left" d="M 33 27 Q 27 15 36 18 Z" fill="#EE3B24" stroke="#FFE066" stroke-width="1.5" />
            <path class="dala-ear-right" d="M 67 27 Q 73 15 64 18 Z" fill="#EE3B24" stroke="#FFE066" stroke-width="1.5" />

            <!-- Satun Dala-blomma (ดอกดาหลา สีชมพูสดใสบนหูขวา) -->
            <g class="dala-flower" transform="translate(62, 18) scale(0.65)">
              <circle cx="0" cy="0" r="7" fill="#FF2A7A" />
              <circle cx="-5" cy="-3" r="5" fill="#FF65A3" />
              <circle cx="5" cy="-3" r="5" fill="#FF65A3" />
              <circle cx="0" cy="-6" r="5" fill="#FFA5C8" />
              <circle cx="0" cy="0" r="3.5" fill="#FFD700" />
            </g>

            <!-- Kurbits-pannband (Traditionell Dala-dekor) -->
            <path d="M 38 32 Q 50 28 62 32" stroke="#FFF" stroke-width="2.8" stroke-linecap="round" fill="none" />
            <circle cx="44" cy="30" r="1.6" fill="#1CB0F6" />
            <circle cx="50" cy="29" r="1.8" fill="#FFC800" />
            <circle cx="56" cy="30" r="1.6" fill="#58CC02" />

            <!-- KINDRODNAD (Blyg & glad charm) -->
            <ellipse cx="37" cy="45" rx="3.5" ry="2" fill="#FF8FA3" opacity="0.8" />
            <ellipse cx="63" cy="45" rx="3.5" ry="2" fill="#FF8FA3" opacity="0.8" />

            <!-- ÖGON: NORMALA (Blinkar i idle) -->
            <g class="dala-eyes-normal">
              <ellipse class="dala-eye-lid" cx="42" cy="38" rx="4" ry="4.5" fill="#1F2421" />
              <ellipse class="dala-eye-lid" cx="58" cy="38" rx="4" ry="4.5" fill="#1F2421" />
              <circle cx="43.5" cy="36.5" r="1.6" fill="#FFFFFF" />
              <circle cx="59.5" cy="36.5" r="1.6" fill="#FFFFFF" />
            </g>

            <!-- ÖGON: GLADA BÅGAR (^ ^ för celebrating / rätt svar) -->
            <g class="dala-eyes-happy" style="display: none;">
              <path d="M 38 40 Q 42 33 46 40" stroke="#1F2421" stroke-width="3" stroke-linecap="round" fill="none" />
              <path d="M 54 40 Q 58 33 62 40" stroke="#1F2421" stroke-width="3" stroke-linecap="round" fill="none" />
            </g>

            <!-- TILLSTÅND F: COOL SOLGLASÖGON (STREAK FIRE) -->
            <g class="dala-sunglasses" style="display: none; opacity: 0;">
              <path d="M 33 34 L 67 34 L 64 43 Q 50 46 36 43 Z" fill="#18181B" stroke="#FFC800" stroke-width="1.8" />
              <line x1="38" y1="36" x2="46" y2="41" stroke="#FFFFFF" stroke-width="1.4" opacity="0.7" />
              <line x1="54" y1="36" x2="62" y2="41" stroke="#FFFFFF" stroke-width="1.4" opacity="0.7" />
            </g>

            <!-- NOS & MUN (Söt mule med uttryck) -->
            <ellipse cx="50" cy="48" rx="7.5" ry="4.5" fill="#FCE7D6" />
            <circle cx="47.5" cy="47" r="1" fill="#7C2D12" />
            <circle cx="52.5" cy="47" r="1" fill="#7C2D12" />
            <!-- Standard leende -->
            <path class="dala-mouth-smile" d="M 47 49 Q 50 52 53 49" stroke="#7C2D12" stroke-width="1.6" stroke-linecap="round" fill="none" />
            <!-- Öppen mun (Speaking) -->
            <ellipse class="dala-mouth-open" cx="50" cy="50" rx="3.5" ry="2.5" fill="#B91C1C" stroke="#7C2D12" stroke-width="1" />

            <!-- VINKANDE ARM / HOV (ENCOURAGING) -->
            <g class="dala-arm-wave">
              <path d="M 30 62 Q 22 55 24 48 Q 28 47 34 54 Z" fill="#D62711" />
              <ellipse cx="23" cy="48" rx="3" ry="2" fill="#FFC800" />
            </g>
          </g>
        </svg>
      `;
    },

    /**
     * Sätt maskotens tillstånd på alla aktiva maskot-containrar i DOM
     */
    setState(newState = 'idle') {
      this.currentState = newState;
      const validStates = ['idle', 'speaking', 'listening', 'celebrating', 'encouraging', 'streak_fire'];
      const appliedClass = validStates.includes(newState) ? `dala-state-${newState}` : 'dala-state-idle';

      document.querySelectorAll('.dala-mascot-wrapper').forEach((wrapper) => {
        validStates.forEach((st) => wrapper.classList.remove(`dala-state-${st}`));
        wrapper.classList.add(appliedClass);
      });
    },

    /**
     * Visa pratbubbla bredvid maskoten med Satun-dialekt och thailändska
     */
    say(thaiText, satunText, mood = 'happy', durationMs = 4200) {
      if (this.bubbleTimer) clearTimeout(this.bubbleTimer);

      let bubble = document.getElementById('dala-live-speech-bubble');
      if (!bubble) {
        bubble = document.createElement('div');
        bubble.id = 'dala-live-speech-bubble';
        bubble.className = 'dala-speech-bubble-container';
        const host = document.getElementById('mascot-container')?.parentElement || document.body;
        host.appendChild(bubble);
      }

      bubble.innerHTML = `
        <div class="bubble-satun-headline">
          <span>🌴</span>
          <span>${satunText}</span>
        </div>
        <div class="bubble-thai-standard">${thaiText}</div>
      `;
      bubble.style.display = 'block';

      this.bubbleTimer = setTimeout(() => {
        if (bubble) bubble.style.display = 'none';
        if (this.currentState !== 'streak_fire') this.setState('idle');
      }, durationMs);
    },

    /**
     * Välj en slumpmässig Satun-fras för rätt svar, fel svar eller streak
     */
    speakRandomQuote(category = 'correct') {
      const list = SATUN_PHRASES[category] || SATUN_PHRASES.correct;
      const item = list[Math.floor(Math.random() * list.length)];
      this.say(item.th, item.satun, category);
    },

    /**
     * Kör en interaktiv gest: 'blink', 'wave' eller 'rear' (stegra)
     */
    triggerAction(actionName, targetEl = null) {
      const wrappers = targetEl
        ? [targetEl.closest('.dala-mascot-wrapper') || targetEl.querySelector('.dala-mascot-wrapper') || targetEl]
        : Array.from(document.querySelectorAll('.dala-mascot-wrapper'));

      wrappers.forEach((w) => {
        if (!w) return;
        w.classList.remove('dala-action-blink', 'dala-action-wave', 'dala-action-rear');
        void w.offsetWidth;
        const cls = actionName === 'stegra' ? 'dala-action-rear' : `dala-action-${actionName}`;
        w.classList.add(cls);

        const durations = { blink: 850, wave: 1500, rear: 1900, stegra: 1900 };
        const dur = durations[actionName] || 1200;
        setTimeout(() => {
          w.classList.remove(cls);
        }, dur);
      });

      if (actionName === 'blink') {
        window.SpeechEngine?.playSound?.('tap');
        this.say('กระพริบตาสองที น่ารักไหม? ✨', 'กะพริบตาปริบๆ หรอยจัง!', 'happy', 2400);
      } else if (actionName === 'wave') {
        window.SpeechEngine?.playSound?.('correct');
        this.say('สวัสดีจ้า ยินดีต้อนรับสู่ร้านของวิลาวัลย์! 👋', 'โบกมือทักทาย หรอยแรงนิ!', 'correct', 2800);
      } else if (actionName === 'rear' || actionName === 'stegra') {
        window.SpeechEngine?.playSound?.('fanfare');
        window.VisualEngine?.triggerConfetti?.();
        this.say('ฮี้ๆๆ! ม้าสตูลทรงพลัง กระโดดสองขา! 🐎', 'ยกขาหน้าผงาด เก่งเบอร์นี้!', 'celebrating', 3200);
      }
    },

    /**
     * Montera Nong Dala i en DOM-container
     */
    mount(containerEl, size = 68, initialState = 'idle') {
      if (!containerEl) return;
      containerEl.innerHTML = `
        <div class="dala-mascot-wrapper dala-state-${initialState}" title="วิลาวัลย์ (Wilawan) • แตะเพื่อคุยกัน!">
          ${this.getSVG(size, initialState)}
        </div>
      `;

      containerEl.querySelector('.dala-mascot-wrapper')?.addEventListener('click', () => {
        window.VisualEngine.haptic('light', containerEl);
        window.SpeechEngine.playSound('tap');
        this.setState('celebrating');
        this.speakRandomQuote('greeting');
        setTimeout(() => this.setState('idle'), 2500);
      });
    }
  };

  /* ==========================================================================
     2. LEVANDE BILD-BIBLIOTEK FÖR ORD & TEMAN (Dual-Coding)
     Rörliga, färgstarka SVG-scener med kontinuerliga CSS-animationer
     ========================================================================== */

  const IllustrationLibrary = {
    // ---------------- MAT & FIKA ----------------
    coffee: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="28" ry="7" fill="#E2E8F0" />
          <ellipse cx="40" cy="66" rx="26" ry="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
          <path d="M 20 38 Q 20 62 40 62 Q 60 62 60 38 Z" fill="#FFFFFF" stroke="#1CB0F6" stroke-width="2.5" />
          <path d="M 58 42 Q 69 42 68 51 Q 67 58 58 57" fill="none" stroke="#1CB0F6" stroke-width="3" stroke-linecap="round" />
          <ellipse cx="40" cy="38" rx="19" ry="5.5" fill="#6F4E37" />
          <ellipse cx="40" cy="38" rx="14" ry="3.5" fill="#4A3319" />
          <!-- Rykande ånga som stiger mjukt -->
          <path class="anim-steam-1" d="M 33 32 Q 30 22 36 14 Q 40 8 36 2" stroke="#A0AEC0" stroke-width="2.2" stroke-linecap="round" fill="none" />
          <path class="anim-steam-2" d="M 40 30 Q 45 20 38 12 Q 35 6 42 1" stroke="#A0AEC0" stroke-width="2.5" stroke-linecap="round" fill="none" />
          <path class="anim-steam-3" d="M 47 32 Q 52 22 46 14 Q 44 8 48 3" stroke="#A0AEC0" stroke-width="2.2" stroke-linecap="round" fill="none" />
          <!-- Glänsande stjärna -->
          <polygon class="anim-sparkle" points="26,48 28,44 32,46 29,49 30,53 27,50 23,51 25,47" fill="#FFC800" />
        </svg>
      </div>
    `,

    bun: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="66" rx="26" ry="6" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <!-- Kanelbulle form -->
            <path d="M 22 52 C 16 38 32 24 46 24 C 62 24 66 40 60 54 C 54 64 28 64 22 52 Z" fill="#D97706" stroke="#92400E" stroke-width="2.5" />
            <!-- Snurrande spiral -->
            <path d="M 46 28 C 58 30 58 44 52 50 C 46 56 34 56 30 48 C 26 40 34 34 42 34 C 48 34 49 42 45 44" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
            <!-- Pärlsocker som glittrar -->
            <circle cx="36" cy="32" r="1.8" fill="#FFFFFF" />
            <circle cx="48" cy="32" r="1.8" fill="#FFFFFF" />
            <circle cx="54" cy="42" r="1.8" fill="#FFFFFF" />
            <circle cx="34" cy="44" r="1.8" fill="#FFFFFF" />
            <circle cx="44" cy="50" r="1.8" fill="#FFFFFF" />
            <circle cx="28" cy="52" r="1.8" fill="#FFFFFF" />
          </g>
          <!-- Gnistrande stjärnor -->
          <polygon class="anim-sparkle" points="62,20 64,15 69,18 65,22 67,27 62,23 57,25 60,20" fill="#FFC800" />
          <polygon class="anim-sparkle-delayed" points="18,32 20,28 24,30 21,33 23,37 19,34 15,36 17,32" fill="#FFC800" />
        </svg>
      </div>
    `,

    water: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="20" ry="5" fill="#E2E8F0" />
          <!-- Vattenglas -->
          <path d="M 26 24 L 30 64 Q 40 67 50 64 L 54 24 Z" fill="rgba(224, 242, 254, 0.45)" stroke="#38BDF8" stroke-width="2.5" />
          <!-- Vattenyta med våg -->
          <path d="M 28 36 Q 34 32 40 36 Q 46 40 52 36 L 49 63 Q 40 66 31 63 Z" fill="#38BDF8" opacity="0.8" />
          <!-- Bubblor som stiger -->
          <circle class="anim-water-ripple" cx="37" cy="50" r="2.5" fill="#FFFFFF" />
          <circle class="anim-water-ripple" cx="44" cy="42" r="3" fill="#FFFFFF" />
          <!-- Droppe som faller ner -->
          <path class="anim-water-drip" d="M 40 10 C 40 10, 36 17, 36 20 C 36 23, 44 23, 44 20 C 44 17, 40 10, 40 10 Z" fill="#0284C7" />
        </svg>
      </div>
    `,

    fish: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="28" ry="6" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <!-- Skål med ris -->
            <path d="M 18 42 Q 18 64 40 64 Q 62 64 62 42 Z" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.5" />
            <ellipse cx="40" cy="42" rx="22" ry="7" fill="#F8FAFC" />
            <!-- Stekt fisk / lax på toppen -->
            <path d="M 26 38 Q 40 30 54 38 Q 48 46 26 38 Z" fill="#FB923C" stroke="#EA580C" stroke-width="1.8" />
            <polygon points="54,38 60,33 58,43" fill="#FB923C" stroke="#EA580C" stroke-width="1.5" />
            <circle cx="32" cy="37" r="1.5" fill="#431407" />
          </g>
          <!-- Ånga från varmt ris -->
          <path class="anim-steam-1" d="M 36 30 Q 32 22 38 15" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none" />
          <path class="anim-steam-2" d="M 44 28 Q 48 20 42 14" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none" />
        </svg>
      </div>
    `,

    yummy: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="30" fill="#FFC800" stroke="#D97706" stroke-width="2.5" />
          <!-- Blundande glada ögon -->
          <path d="M 27 34 Q 32 28 37 34" stroke="#78350F" stroke-width="3" stroke-linecap="round" fill="none" />
          <path d="M 43 34 Q 48 28 53 34" stroke="#78350F" stroke-width="3" stroke-linecap="round" fill="none" />
          <!-- Mun med tunga som slickar -->
          <path d="M 29 44 Q 40 54 51 44 Z" fill="#78350F" />
          <path class="anim-bounce-subtle" d="M 42 46 C 42 46 45 56 40 56 C 35 56 38 46 38 46 Z" fill="#FF4B4B" />
          <circle class="anim-blush" cx="24" cy="42" r="4.5" fill="#FF8FA3" />
          <circle class="anim-blush" cx="56" cy="42" r="4.5" fill="#FF8FA3" />
        </svg>
      </div>
    `,

    // ---------------- VÄDER & NATUR ----------------
    sun: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Roterande solstrålar -->
          <g class="anim-sun-spin">
            ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]
              .map(
                (deg) => `
              <rect x="38" y="6" width="4" height="11" rx="2" fill="#FFC800" transform="rotate(${deg} 40 40)" />
            `
              )
              .join('')}
          </g>
          <!-- Pulserande solkärna med leende -->
          <circle class="anim-sun-core" cx="40" cy="40" r="19" fill="#FFAE00" stroke="#FF8A00" stroke-width="2" />
          <circle cx="34" cy="37" r="2.2" fill="#7C2D12" />
          <circle cx="46" cy="37" r="2.2" fill="#7C2D12" />
          <path d="M 34 44 Q 40 49 46 44" stroke="#7C2D12" stroke-width="2.2" stroke-linecap="round" fill="none" />
          <circle class="anim-blush" cx="30" cy="42" r="2.8" fill="#FF708F" />
          <circle class="anim-blush" cx="50" cy="42" r="2.8" fill="#FF708F" />
        </svg>
      </div>
    `,

    snow: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Moln -->
          <g class="anim-cloud-float">
            <path d="M 24 38 A 12 12 0 0 1 44 26 A 14 14 0 0 1 64 36 A 10 10 0 0 1 58 48 L 22 48 A 10 10 0 0 1 24 38 Z" fill="#93C5FD" stroke="#3B82F6" stroke-width="2" />
          </g>
          <!-- Singlande snöflingor -->
          <g class="anim-snowflake-1">
            <text x="26" y="58" font-size="14" fill="#38BDF8">❄</text>
          </g>
          <g class="anim-snowflake-2">
            <text x="42" y="62" font-size="16" fill="#0284C7">❄</text>
          </g>
          <g class="anim-snowflake-3">
            <text x="56" y="56" font-size="13" fill="#38BDF8">❄</text>
          </g>
        </svg>
      </div>
    `,

    rain: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Regnmoln -->
          <g class="anim-cloud-float">
            <path d="M 22 36 A 12 12 0 0 1 42 24 A 14 14 0 0 1 64 34 A 10 10 0 0 1 58 46 L 20 46 A 10 10 0 0 1 22 36 Z" fill="#64748B" stroke="#334155" stroke-width="2" />
          </g>
          <!-- Fallande regndroppar -->
          <line class="anim-raindrop" x1="26" y1="50" x2="22" y2="62" stroke="#38BDF8" stroke-width="2.8" stroke-linecap="round" />
          <line class="anim-raindrop-2" x1="42" y1="50" x2="38" y2="64" stroke="#0284C7" stroke-width="3" stroke-linecap="round" />
          <line class="anim-raindrop-3" x1="56" y1="50" x2="52" y2="62" stroke="#38BDF8" stroke-width="2.8" stroke-linecap="round" />
        </svg>
      </div>
    `,

    sunrise: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="54" rx="34" ry="1" fill="#E2E8F0" />
          <!-- Havs- eller berghorisont -->
          <path d="M 8 54 Q 24 50 40 54 Q 56 58 72 54 L 72 68 L 8 68 Z" fill="#0284C7" />
          <!-- Uppstigande sol med pulserande strålar -->
          <g class="anim-bounce-subtle">
            <circle cx="40" cy="46" r="16" fill="#FFC800" stroke="#FF9600" stroke-width="2" />
          </g>
          <line x1="40" y1="20" x2="40" y2="26" stroke="#FFC800" stroke-width="2.5" stroke-linecap="round" />
          <line x1="22" y1="28" x2="27" y2="33" stroke="#FFC800" stroke-width="2.5" stroke-linecap="round" />
          <line x1="58" y1="28" x2="53" y2="33" stroke="#FFC800" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>
    `,

    // ---------------- KÄNSLOR & FAMILJ ----------------
    heart: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <g class="anim-heartbeat">
            <path d="M 40 68 C 40 68, 14 50, 14 30 C 14 18, 26 12, 34 18 C 38 21, 40 25, 40 25 C 40 25, 42 21, 46 18 C 54 12, 66 18, 66 30 C 66 50, 40 68, 40 68 Z" fill="#FF4B4B" stroke="#E60000" stroke-width="2.5" />
            <path d="M 22 28 Q 24 20 30 18" stroke="#FFA3A3" stroke-width="2.5" stroke-linecap="round" fill="none" />
          </g>
          <!-- Svävande mini-hjärtan -->
          <g class="anim-sparkle">
            <path d="M 62 20 C 62 20, 56 16, 56 11 C 56 8, 59 6, 61 8 C 62 9, 62 10, 62 10 C 62 10, 63 9, 64 8 C 66 6, 69 8, 69 11 C 69 16, 62 20, 62 20 Z" fill="#FF8FA3" />
          </g>
        </svg>
      </div>
    `,

    happy: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="28" fill="#58CC02" stroke="#46A302" stroke-width="2.5" />
          <!-- Glada ögon -->
          <path d="M 28 36 Q 33 28 38 36" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none" />
          <path d="M 44 36 Q 49 28 54 36" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none" />
          <!-- Brett leende -->
          <path d="M 28 44 Q 41 57 54 44 Z" fill="#FFFFFF" />
          <!-- Rodnande kinder -->
          <circle class="anim-blush" cx="24" cy="42" r="4.5" fill="#FFC800" />
          <circle class="anim-blush" cx="56" cy="42" r="4.5" fill="#FFC800" />
        </svg>
      </div>
    `,

    sleep: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Sovande måne -->
          <path d="M 44 14 A 26 26 0 1 1 24 58 A 24 24 0 0 0 44 14 Z" fill="#FFC800" stroke="#D97706" stroke-width="2.2" />
          <!-- Blundande öga -->
          <path d="M 34 38 Q 38 42 42 38" stroke="#78350F" stroke-width="2.2" stroke-linecap="round" fill="none" />
          <!-- Nattmössa -->
          <path d="M 38 18 Q 48 8 58 12 Q 52 24 44 24 Z" fill="#1CB0F6" />
          <circle cx="60" cy="12" r="3.5" fill="#FFFFFF" />
          <!-- Svävande Zzz -->
          <text class="anim-zzz-1" x="48" y="32" font-size="12" font-weight="900" fill="#7C3AED">Z</text>
          <text class="anim-zzz-2" x="56" y="24" font-size="15" font-weight="900" fill="#7C3AED">z</text>
          <text class="anim-zzz-3" x="63" y="16" font-size="11" font-weight="900" fill="#8B5CF6">z</text>
        </svg>
      </div>
    `,

    family: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Familjemedlemmar under ett hjärta -->
          <g class="anim-bounce-subtle">
            <!-- Förälder 1 -->
            <circle cx="28" cy="34" r="8" fill="#1CB0F6" />
            <path d="M 18 58 C 18 46 38 46 38 58 Z" fill="#0284C7" />
            <!-- Förälder 2 -->
            <circle cx="52" cy="34" r="8" fill="#FF4B4B" />
            <path d="M 42 58 C 42 46 62 46 62 58 Z" fill="#DC2626" />
            <!-- Barn i mitten -->
            <circle cx="40" cy="46" r="6" fill="#FFC800" />
            <path d="M 32 64 C 32 55 48 55 48 64 Z" fill="#D97706" />
          </g>
          <!-- Skyddande svävande hjärta -->
          <path class="anim-heartbeat" d="M 40 18 C 40 18, 34 11, 28 15 C 22 19, 26 27, 40 33 C 54 27, 58 19, 52 15 C 46 11, 40 18, 40 18 Z" fill="#FF8FA3" opacity="0.9" />
        </svg>
      </div>
    `,

    // ---------------- HEM & VARDAG ----------------
    home: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="30" ry="5" fill="#E2E8F0" />
          <!-- Röd svensk stuga (Falu rödfärg) -->
          <rect x="22" y="38" width="36" height="28" fill="#B91C1C" stroke="#991B1B" stroke-width="2" />
          <!-- Vitt sadeltak -->
          <polygon points="16,38 40,16 64,38" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5" />
          <!-- Skorsten med ånga -->
          <rect x="46" y="20" width="6" height="12" fill="#B91C1C" />
          <path class="anim-steam-1" d="M 49 18 Q 46 10 52 4" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none" />
          <!-- Fönster med skiftande varmt ljus -->
          <rect x="27" y="44" width="10" height="10" fill="#FEF08A" stroke="#FFFFFF" stroke-width="1.8" />
          <line x1="32" y1="44" x2="32" y2="54" stroke="#FFFFFF" stroke-width="1.2" />
          <line x1="27" y1="49" x2="37" y2="49" stroke="#FFFFFF" stroke-width="1.2" />
          <!-- Vit dörr med mässingsknopp -->
          <rect x="43" y="48" width="10" height="18" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5" />
          <circle cx="50" cy="58" r="1.2" fill="#FFC800" />
        </svg>
      </div>
    `,

    phone: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="20" ry="4" fill="#E2E8F0" />
          <!-- Vibrerande mobiltelefon -->
          <g class="anim-phone-vibe">
            <rect x="26" y="16" width="28" height="50" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="2.5" />
            <rect x="29" y="22" width="22" height="38" rx="2" fill="#38BDF8" />
            <!-- Högtalare och hemindikator -->
            <line x1="36" y1="19" x2="44" y2="19" stroke="#64748B" stroke-width="1.5" stroke-linecap="round" />
            <circle cx="40" cy="63" r="1.6" fill="#94A3B8" />
            <!-- Hjärt-notis på skärmen -->
            <path d="M 40 38 C 40 38, 35 33, 32 36 C 29 39, 31 43, 40 47 C 49 43, 51 39, 48 36 C 45 33, 40 38, 40 38 Z" fill="#FF4B4B" />
          </g>
        </svg>
      </div>
    `,

    key: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <g class="anim-bounce-subtle" transform="rotate(-30 40 40)">
            <!-- Gyllene nyckel -->
            <circle cx="28" cy="40" r="13" fill="#FFC800" stroke="#D97706" stroke-width="2.5" />
            <circle cx="28" cy="40" r="5.5" fill="#FFFDF8" stroke="#D97706" stroke-width="2" />
            <rect x="38" y="37" width="28" height="6" rx="2" fill="#FFC800" stroke="#D97706" stroke-width="2" />
            <rect x="56" y="43" width="5" height="7" rx="1" fill="#FFC800" stroke="#D97706" stroke-width="1.5" />
            <rect x="63" y="43" width="4" height="5" rx="1" fill="#FFC800" stroke="#D97706" stroke-width="1.5" />
          </g>
          <!-- Glänsande ljusstrimma -->
          <polygon class="anim-sparkle" points="62,18 64,13 69,16 65,20 67,25 62,21 57,23 60,18" fill="#FFF" />
        </svg>
      </div>
    `,

    // ---------------- SHOPPING & SIFFROR ----------------
    cart: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="26" ry="4" fill="#E2E8F0" />
          <g class="anim-cart-roll">
            <!-- Vagnkorg och handtag -->
            <path d="M 16 26 L 24 26 L 33 50 L 58 50 L 65 32 L 27 32" fill="none" stroke="#0284C7" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
            <line x1="33" y1="38" x2="62" y2="38" stroke="#38BDF8" stroke-width="1.8" />
            <line x1="36" y1="44" x2="59" y2="44" stroke="#38BDF8" stroke-width="1.8" />
            <line x1="42" y1="32" x2="38" y2="50" stroke="#38BDF8" stroke-width="1.8" />
            <line x1="52" y1="32" x2="48" y2="50" stroke="#38BDF8" stroke-width="1.8" />
            <!-- Varor i vagnen -->
            <circle cx="40" cy="27" r="5" fill="#FF4B4B" />
            <rect x="47" y="22" width="10" height="9" rx="2" fill="#58CC02" />
          </g>
          <!-- Snurrande hjul -->
          <g class="anim-wheel-spin" transform-origin="34 60">
            <circle cx="34" cy="60" r="4.5" fill="#1E293B" />
            <circle cx="34" cy="60" r="2" fill="#FFFFFF" />
          </g>
          <g class="anim-wheel-spin" transform-origin="54 60">
            <circle cx="54" cy="60" r="4.5" fill="#1E293B" />
            <circle cx="54" cy="60" r="2" fill="#FFFFFF" />
          </g>
        </svg>
      </div>
    `,

    coin: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="66" rx="22" ry="5" fill="#E2E8F0" />
          <!-- Roterande 3D-guldmynt med svensk krona -->
          <g class="anim-coin-flip">
            <circle cx="40" cy="38" r="24" fill="#FFC800" stroke="#D97706" stroke-width="3" />
            <circle cx="40" cy="38" r="19" fill="#FBBF24" stroke="#D97706" stroke-width="1.5" stroke-dasharray="3,2" />
            <!-- Svensk tre kronor symbol -->
            <path d="M 34 33 L 36 30 L 38 33 L 36 35 Z" fill="#92400E" />
            <path d="M 42 33 L 44 30 L 46 33 L 44 35 Z" fill="#92400E" />
            <path d="M 38 41 L 40 38 L 42 41 L 40 43 Z" fill="#92400E" />
          </g>
          <polygon class="anim-sparkle" points="60,20 62,15 67,18 63,22 65,27 60,23 55,25 58,20" fill="#FFF" />
        </svg>
      </div>
    `,

    card: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="26" ry="5" fill="#E2E8F0" />
          <!-- Betalkort med glans -->
          <g class="anim-bounce-subtle" transform="rotate(-6 40 40)">
            <rect x="18" y="24" width="44" height="28" rx="4" fill="#0284C7" stroke="#0369A1" stroke-width="2" />
            <!-- Chip -->
            <rect x="24" y="32" width="8" height="6" rx="1.5" fill="#FFC800" stroke="#D97706" stroke-width="1" />
            <line x1="18" y1="44" x2="62" y2="44" stroke="#0369A1" stroke-width="2.5" />
            <!-- Grön bock för godkänd kontaktlös betalning -->
            <circle cx="50" cy="32" r="5" fill="#58CC02" />
            <path d="M 48 32 L 50 34 L 53 30" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none" />
          </g>
        </svg>
      </div>
    `,

    tag: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Gungande prislapp i snöre -->
          <g class="anim-tag-swing">
            <line x1="40" y1="8" x2="40" y2="22" stroke="#94A3B8" stroke-width="2" />
            <polygon points="40,22 56,36 46,62 34,62 24,36" fill="#CE82FF" stroke="#A855F7" stroke-width="2.2" />
            <circle cx="40" cy="30" r="3" fill="#FFFFFF" />
            <text x="40" y="52" font-size="12" font-weight="900" text-anchor="middle" fill="#FFFFFF">kr</text>
          </g>
        </svg>
      </div>
    `,

    // ---------------- HÄLSNINGAR & ARTIGHET ----------------
    wave: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="20" ry="4" fill="#E2E8F0" />
          <g class="anim-bounce-subtle" transform-origin="40 60">
            <path d="M 34 60 L 34 46 Q 28 44 26 36 Q 25 30 31 30 Q 34 30 36 34 L 36 24 Q 36 18 41 18 Q 46 18 46 24 L 46 25 Q 47 20 52 20 Q 57 20 57 26 L 57 28 Q 58 24 62 25 Q 66 26 65 32 L 64 45 Q 64 60 52 64 Z" fill="#FBBF24" stroke="#D97706" stroke-width="2.2" />
          </g>
          <!-- Välkomst-ljudvågor -->
          <path class="anim-sparkle" d="M 64 16 Q 72 26 68 36" stroke="#1CB0F6" stroke-width="2.5" stroke-linecap="round" fill="none" />
          <path class="anim-sparkle-delayed" d="M 70 12 Q 80 26 74 40" stroke="#58CC02" stroke-width="2.2" stroke-linecap="round" fill="none" />
        </svg>
      </div>
    `,

    heart_hands: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <!-- Tack / Wai händer med Satun blomma -->
          <g class="anim-bounce-subtle">
            <path d="M 28 62 L 36 34 Q 40 30 40 24 Q 40 30 44 34 L 52 62 Z" fill="#FDE68A" stroke="#D97706" stroke-width="2.5" />
            <line x1="40" y1="24" x2="40" y2="62" stroke="#D97706" stroke-width="2" />
          </g>
          <g class="anim-heartbeat">
            <circle cx="40" cy="20" r="8" fill="#FF4B4B" />
          </g>
        </svg>
      </div>
    `,

    polite: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="30" r="14" fill="#FDE68A" stroke="#D97706" stroke-width="2" />
          <path d="M 34 32 Q 40 36 46 32" stroke="#78350F" stroke-width="2" stroke-linecap="round" fill="none" />
          <circle cx="35" cy="28" r="1.5" fill="#78350F" />
          <circle cx="45" cy="28" r="1.5" fill="#78350F" />
          <g class="anim-sparkle">
            <text x="56" y="24" font-size="18" font-weight="900" fill="#1CB0F6">?</text>
          </g>
        </svg>
      </div>
    `,

    sparkles: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <g class="anim-sun-spin">
            <polygon points="40,12 44,28 60,32 44,36 40,52 36,36 20,32 36,28" fill="#FFC800" />
          </g>
          <polygon class="anim-sparkle" points="58,16 60,11 65,14 61,18 63,23 58,19 53,21 56,16" fill="#1CB0F6" />
          <polygon class="anim-sparkle-delayed" points="22,46 24,41 29,44 25,48 27,53 22,49 17,51 20,46" fill="#CE82FF" />
        </svg>
      </div>
    `,

    star: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <g class="anim-bounce-subtle">
            <polygon points="40,14 47,30 64,31 50,42 55,59 40,48 25,59 30,42 16,31 33,30" fill="#FFC800" stroke="#D97706" stroke-width="2.5" />
          </g>
          <polygon class="anim-sparkle" points="62,18 64,13 69,16 65,20 67,25 62,21 57,23 60,18" fill="#FFF" />
        </svg>
      </div>
    `,

    smile: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="26" fill="#58CC02" stroke="#46A302" stroke-width="2.5" />
          <circle cx="32" cy="34" r="3" fill="#FFFFFF" />
          <circle cx="48" cy="34" r="3" fill="#FFFFFF" />
          <path d="M 30 44 Q 40 54 50 44" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none" />
        </svg>
      </div>
    `,

    // ---------------- UTÖKAT LIVFULLT BILD-BIBLIOTEK (ERSÄTTER EMOJIS) ----------------
    milk: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="22" ry="5" fill="#E2E8F0" />
          <path d="M 28 32 L 34 20 L 46 20 L 52 32 L 52 66 L 28 66 Z" fill="#F8FAFC" stroke="#0284C7" stroke-width="2.5" />
          <polygon points="34,20 40,14 46,20" fill="#E2E8F0" stroke="#0284C7" stroke-width="2" />
          <rect x="28" y="38" width="24" height="14" fill="#0284C7" />
          <circle cx="40" cy="45" r="4.5" fill="#FFFFFF" />
          <path d="M 39 42 Q 40 40 41 42 Q 43 45 40 47 Q 37 45 39 42 Z" fill="#0284C7" />
          <text x="40" y="62" font-size="7" font-weight="900" fill="#0284C7" text-anchor="middle">MJÖLK</text>
        </svg>
      </div>
    `,

    bread: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="26" ry="6" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <path d="M 20 54 C 16 38 28 26 40 26 C 52 26 64 38 60 54 C 54 62 26 62 20 54 Z" fill="#D97706" stroke="#92400E" stroke-width="2.5" />
            <path d="M 28 42 Q 33 34 38 42" stroke="#FEF3C7" stroke-width="2.5" stroke-linecap="round" fill="none" />
            <path d="M 36 42 Q 41 34 46 42" stroke="#FEF3C7" stroke-width="2.5" stroke-linecap="round" fill="none" />
            <path d="M 44 42 Q 49 34 54 42" stroke="#FEF3C7" stroke-width="2.5" stroke-linecap="round" fill="none" />
          </g>
          <polygon class="anim-sparkle" points="62,22 64,17 69,20 65,24 67,29 62,25 57,27 60,22" fill="#FFC800" />
        </svg>
      </div>
    `,

    egg: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="20" ry="5" fill="#E2E8F0" />
          <!-- Äggkopp -->
          <path d="M 28 48 Q 28 64 40 64 Q 52 64 52 48 Z" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 34 64 L 32 70 L 48 70 L 46 64 Z" fill="#FFFFFF" stroke="#0284C7" stroke-width="2" />
          <!-- Ägg -->
          <path d="M 40 18 C 30 18 28 36 28 48 C 28 54 52 54 52 48 C 52 36 50 18 40 18 Z" fill="#FDE68A" stroke="#D97706" stroke-width="2.5" />
          <ellipse cx="36" cy="30" rx="3" ry="6" fill="#FFFFFF" opacity="0.6" transform="rotate(-18 36 30)" />
        </svg>
      </div>
    `,

    chicken: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="28" ry="6" fill="#E2E8F0" />
          <ellipse cx="40" cy="64" rx="26" ry="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
          <!-- Stekt kycklingklubba / kyckling -->
          <g class="anim-bounce-subtle">
            <ellipse cx="42" cy="46" rx="18" ry="12" fill="#EA580C" stroke="#9A3412" stroke-width="2.5" />
            <path d="M 26 48 L 16 52" stroke="#E2E8F0" stroke-width="5" stroke-linecap="round" />
            <circle cx="14" cy="50" r="3" fill="#E2E8F0" />
            <circle cx="14" cy="54" r="3" fill="#E2E8F0" />
            <circle cx="48" cy="42" r="3" fill="#FED7AA" opacity="0.7" />
          </g>
          <!-- Ånga -->
          <path class="anim-steam-1" d="M 38 32 Q 34 24 40 18" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none" />
          <path class="anim-steam-2" d="M 46 30 Q 50 22 44 16" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none" />
        </svg>
      </div>
    `,

    rice: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="26" ry="5" fill="#E2E8F0" />
          <!-- Skål med jasminris -->
          <path d="M 20 44 Q 20 64 40 64 Q 60 64 60 44 Z" fill="#FFFFFF" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 20 44 C 20 30 60 30 60 44 Z" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
          <circle cx="34" cy="38" r="1.5" fill="#CBD5E1" />
          <circle cx="42" cy="36" r="1.5" fill="#CBD5E1" />
          <circle cx="48" cy="40" r="1.5" fill="#CBD5E1" />
          <path class="anim-steam-1" d="M 36 28 Q 32 20 38 14" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none" />
          <path class="anim-steam-2" d="M 44 26 Q 48 18 42 12" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" fill="none" />
        </svg>
      </div>
    `,

    apple: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="22" ry="5" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <!-- Rött saftigt äpple -->
            <path d="M 40 28 C 34 24 22 28 22 44 C 22 60 36 64 40 64 C 44 64 58 60 58 44 C 58 28 46 24 40 28 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="2.5" />
            <!-- Stjälk och grönt blad -->
            <path d="M 40 28 Q 42 18 44 14" stroke="#78350F" stroke-width="2.8" stroke-linecap="round" fill="none" />
            <path d="M 43 20 Q 52 16 54 22 Q 46 24 43 20 Z" fill="#58CC02" stroke="#46A302" stroke-width="1.5" />
            <ellipse cx="32" cy="38" rx="3" ry="8" fill="#FFFFFF" opacity="0.4" transform="rotate(-25 32 38)" />
          </g>
        </svg>
      </div>
    `,

    cheese: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="26" ry="5" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <!-- Ostbit (Prästost / Herrgård) -->
            <polygon points="16,56 64,56 58,34 32,34" fill="#FBBF24" stroke="#D97706" stroke-width="2.5" stroke-linejoin="round" />
            <polygon points="32,34 58,34 52,22 22,28" fill="#FDE68A" stroke="#D97706" stroke-width="2" stroke-linejoin="round" />
            <!-- Osthål -->
            <ellipse cx="36" cy="46" rx="4" ry="3" fill="#D97706" opacity="0.4" />
            <ellipse cx="50" cy="44" rx="3" ry="2.5" fill="#D97706" opacity="0.4" />
            <ellipse cx="42" cy="52" rx="2.5" ry="2" fill="#D97706" opacity="0.4" />
          </g>
        </svg>
      </div>
    `,

    jacket: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="24" ry="5" fill="#E2E8F0" />
          <!-- Vinterjacka -->
          <g class="anim-bounce-subtle">
            <path d="M 28 24 L 14 36 L 22 44 L 28 38 L 28 66 L 52 66 L 52 38 L 58 44 L 66 36 L 52 24 Z" fill="#0284C7" stroke="#0369A1" stroke-width="2.5" stroke-linejoin="round" />
            <line x1="40" y1="24" x2="40" y2="66" stroke="#0369A1" stroke-width="2" />
            <ellipse cx="40" cy="24" rx="12" ry="5" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="2" />
            <circle cx="39" cy="34" r="1.5" fill="#FFC800" />
          </g>
        </svg>
      </div>
    `,

    bus: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="68" rx="28" ry="5" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <!-- Blå svensk stadsbuss -->
            <rect x="18" y="22" width="44" height="38" rx="6" fill="#0284C7" stroke="#0369A1" stroke-width="2.5" />
            <!-- Vindruta & fönster -->
            <rect x="22" y="26" width="36" height="14" rx="2" fill="#BAE6FD" />
            <line x1="40" y1="26" x2="40" y2="40" stroke="#0284C7" stroke-width="1.8" />
            <!-- Strålkastare -->
            <circle cx="24" cy="48" r="3" fill="#FEF08A" stroke="#EAB308" stroke-width="1" />
            <circle cx="56" cy="48" r="3" fill="#FEF08A" stroke="#EAB308" stroke-width="1" />
            <rect x="32" y="46" width="16" height="5" rx="1.5" fill="#1E293B" />
          </g>
          <!-- Hjul -->
          <circle cx="28" cy="60" r="4.5" fill="#1E293B" />
          <circle cx="28" cy="60" r="2" fill="#E2E8F0" />
          <circle cx="52" cy="60" r="4.5" fill="#1E293B" />
          <circle cx="52" cy="60" r="2" fill="#E2E8F0" />
        </svg>
      </div>
    `,

    clock: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="24" ry="4" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <circle cx="40" cy="38" r="26" fill="#FFFFFF" stroke="#0284C7" stroke-width="3" />
            <circle cx="40" cy="38" r="22" fill="#F0F9FF" />
            <!-- Visare (Fika-tid 10:10) -->
            <line x1="40" y1="38" x2="40" y2="22" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round" />
            <line x1="40" y1="38" x2="52" y2="34" stroke="#EF4444" stroke-width="2" stroke-linecap="round" />
            <circle cx="40" cy="38" r="2.5" fill="#1E293B" />
            <circle cx="40" cy="18" r="1.5" fill="#0284C7" />
            <circle cx="60" cy="38" r="1.5" fill="#0284C7" />
            <circle cx="40" cy="58" r="1.5" fill="#0284C7" />
            <circle cx="20" cy="38" r="1.5" fill="#0284C7" />
          </g>
        </svg>
      </div>
    `,

    calendar: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="24" ry="4" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <rect x="20" y="20" width="40" height="46" rx="5" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2.5" />
            <path d="M 20 25 C 20 22 22 20 25 20 L 55 20 C 58 20 60 22 60 25 L 60 32 L 20 32 Z" fill="#EF4444" />
            <!-- Ringar -->
            <circle cx="28" cy="18" r="2" fill="#64748B" />
            <circle cx="52" cy="18" r="2" fill="#64748B" />
            <text x="40" y="52" font-size="18" font-weight="900" fill="#1E293B" text-anchor="middle">IDAG</text>
          </g>
        </svg>
      </div>
    `,

    cat: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="24" ry="5" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <!-- Kattkropp och huvud -->
            <ellipse cx="40" cy="52" rx="16" ry="14" fill="#FB923C" stroke="#EA580C" stroke-width="2" />
            <circle cx="40" cy="34" r="13" fill="#FB923C" stroke="#EA580C" stroke-width="2" />
            <!-- Öron -->
            <polygon points="29,27 25,14 36,22" fill="#FB923C" stroke="#EA580C" stroke-width="1.8" />
            <polygon points="51,27 55,14 44,22" fill="#FB923C" stroke="#EA580C" stroke-width="1.8" />
            <polygon points="29,24 27,17 34,22" fill="#FED7AA" />
            <polygon points="51,24 53,17 46,22" fill="#FED7AA" />
            <!-- Ansikte -->
            <circle cx="35" cy="33" r="2" fill="#431407" />
            <circle cx="45" cy="33" r="2" fill="#431407" />
            <polygon points="40,36 38,38 42,38" fill="#F43F5E" />
            <line x1="28" y1="36" x2="22" y2="35" stroke="#431407" stroke-width="1.2" stroke-linecap="round" />
            <line x1="28" y1="38" x2="23" y2="39" stroke="#431407" stroke-width="1.2" stroke-linecap="round" />
            <line x1="52" y1="36" x2="58" y2="35" stroke="#431407" stroke-width="1.2" stroke-linecap="round" />
            <line x1="52" y1="38" x2="57" y2="39" stroke="#431407" stroke-width="1.2" stroke-linecap="round" />
          </g>
        </svg>
      </div>
    `,

    dog: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="24" ry="5" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <ellipse cx="40" cy="52" rx="16" ry="14" fill="#D97706" stroke="#B45309" stroke-width="2" />
            <circle cx="40" cy="34" r="14" fill="#F59E0B" stroke="#B45309" stroke-width="2" />
            <!-- Hängande öron -->
            <ellipse cx="25" cy="34" rx="4" ry="10" fill="#92400E" transform="rotate(15 25 34)" />
            <ellipse cx="55" cy="34" rx="4" ry="10" fill="#92400E" transform="rotate(-15 55 34)" />
            <!-- Ögon & nos -->
            <circle cx="35" cy="32" r="2.2" fill="#451A03" />
            <circle cx="45" cy="32" r="2.2" fill="#451A03" />
            <ellipse cx="40" cy="37" rx="3.5" ry="2.5" fill="#451A03" />
            <!-- Tunga -->
            <path d="M 39 42 Q 40 47 42 42 Z" fill="#EF4444" />
          </g>
        </svg>
      </div>
    `,

    bed: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="28" ry="5" fill="#E2E8F0" />
          <!-- Sänggavel och madrass -->
          <rect x="18" y="26" width="6" height="42" rx="2" fill="#92400E" />
          <rect x="58" y="38" width="6" height="30" rx="2" fill="#92400E" />
          <rect x="22" y="44" width="40" height="18" rx="3" fill="#FFFFFF" stroke="#0284C7" stroke-width="2" />
          <!-- Täcke i blått -->
          <rect x="34" y="44" width="28" height="18" rx="2" fill="#38BDF8" />
          <!-- Kudde -->
          <ellipse cx="28" cy="42" rx="5" ry="3.5" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2" />
        </svg>
      </div>
    `,

    shower: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="26" ry="5" fill="#E2E8F0" />
          <!-- Duschmunstycke -->
          <path d="M 22 20 Q 32 16 40 22 L 40 28" stroke="#94A3B8" stroke-width="3" stroke-linecap="round" fill="none" />
          <polygon points="34,28 46,28 50,34 30,34" fill="#0284C7" stroke="#0369A1" stroke-width="1.8" />
          <!-- Vattendroppar -->
          <line class="anim-raindrop" x1="34" y1="38" x2="33" y2="48" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" />
          <line class="anim-raindrop-2" x1="40" y1="38" x2="40" y2="52" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round" />
          <line class="anim-raindrop-3" x1="46" y1="38" x2="47" y2="48" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>
    `,

    clean: () => `
      <div class="anim-svg-box">
        <svg class="anim-svg" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="70" rx="22" ry="4" fill="#E2E8F0" />
          <g class="anim-bounce-subtle">
            <!-- Sprayflaska -->
            <rect x="32" y="34" width="16" height="32" rx="4" fill="#58CC02" stroke="#46A302" stroke-width="2" />
            <path d="M 36 34 L 36 24 L 44 24 L 44 34 Z" fill="#FFFFFF" stroke="#46A302" stroke-width="1.5" />
            <path d="M 44 24 L 54 26 L 44 28" fill="#1CB0F6" />
            <!-- Bubblor -->
            <circle cx="56" cy="22" r="3" fill="#BAE6FD" opacity="0.8" />
            <circle cx="62" cy="28" r="2.5" fill="#BAE6FD" opacity="0.8" />
          </g>
          <polygon class="anim-sparkle" points="26,38 28,33 33,36 29,40 31,45 26,41 21,43 24,38" fill="#FFC800" />
        </svg>
      </div>
    `,

    // ---------------- 10 TEMA-SPECIFIKA VEKTORIKONER ----------------
    theme_greetings: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#D7FFB8" stroke="#58CC02" stroke-width="2.5"/>
        <path d="M18 36v-8q-4-1-5-6t3-4q2 0 3 2v-6q0-4 3-4t3 4v1q1-3 4-3t3 4v1q1-2 3-1t2 4v7q0 9-7 12z" fill="#FBBF24" stroke="#D97706" stroke-width="1.8"/>
        <path d="M38 12a14 14 0 0 1 2 10" stroke="#1CB0F6" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    `,

    theme_love: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#FFE2E2" stroke="#FF4B4B" stroke-width="2.5"/>
        <path d="M24 38s-13-9-13-19c0-6 6-9 10-6 2 2 3 4 3 4s1-2 3-4c4-3 10 0 10 6 0 10-13 19-13 19z" fill="#FF4B4B" stroke="#E60000" stroke-width="1.8"/>
        <path d="M15 17a5 5 0 0 1 5-2" stroke="#FFA3A3" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,

    theme_supermarket: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#DDF4FF" stroke="#1CB0F6" stroke-width="2.5"/>
        <path d="M12 16h5l5 14h14l4-10H18" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="22" cy="35" r="2.5" fill="#0F172A"/>
        <circle cx="34" cy="35" r="2.5" fill="#0F172A"/>
        <circle cx="25" cy="18" r="3" fill="#EF4444"/>
      </svg>
    `,

    theme_fika: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#FFF4CC" stroke="#FFC800" stroke-width="2.5"/>
        <path d="M14 24q0 12 12 12 12 0 12-12z" fill="#FFF" stroke="#D97706" stroke-width="2"/>
        <path d="M38 26c5 0 5 8 0 8" stroke="#D97706" stroke-width="2.2" stroke-linecap="round"/>
        <ellipse cx="26" cy="24" rx="10" ry="3" fill="#78350F"/>
        <path d="M22 19q-2-5 2-9" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M28 18q2-5-2-9" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,

    theme_home: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#FFE4E6" stroke="#FB7185" stroke-width="2.5"/>
        <rect x="15" y="24" width="18" height="14" fill="#B91C1C" stroke="#991B1B" stroke-width="1.8"/>
        <polygon points="12,24 24,12 36,24" fill="#FFF" stroke="#CBD5E1" stroke-width="2"/>
        <rect x="22" y="30" width="5" height="8" fill="#FEF08A"/>
      </svg>
    `,

    theme_weather: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#E0F2FE" stroke="#38BDF8" stroke-width="2.5"/>
        <circle cx="22" cy="22" r="9" fill="#FFC800" stroke="#D97706" stroke-width="2"/>
        <path d="M18 32a7 7 0 0 1 12-2 6 6 0 0 1 7 5h-19z" fill="#93C5FD" stroke="#2563EB" stroke-width="1.5"/>
      </svg>
    `,

    theme_numbers: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#F3E8FF" stroke="#A855F7" stroke-width="2.5"/>
        <circle cx="24" cy="24" r="14" fill="#FFF" stroke="#7C3AED" stroke-width="2"/>
        <line x1="24" y1="24" x2="24" y2="15" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
        <line x1="24" y1="24" x2="31" y2="24" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    `,

    theme_city: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#CFFAFE" stroke="#06B6D4" stroke-width="2.5"/>
        <rect x="14" y="16" width="20" height="20" rx="3" fill="#0284C7" stroke="#0369A1" stroke-width="1.8"/>
        <rect x="17" y="19" width="14" height="7" rx="1" fill="#BAE6FD"/>
        <circle cx="18" cy="33" r="2" fill="#FEF08A"/>
        <circle cx="30" cy="33" r="2" fill="#FEF08A"/>
        <circle cx="18" cy="37" r="2.5" fill="#1E293B"/>
        <circle cx="30" cy="37" r="2.5" fill="#1E293B"/>
      </svg>
    `,

    theme_chat: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#DCFCE7" stroke="#22C55E" stroke-width="2.5"/>
        <path d="M13 18c0-4 4-7 9-7s9 3 9 7-4 7-9 7l-4 3v-3c-3-1-5-4-5-7z" fill="#58CC02"/>
        <path d="M23 26c0-3 3-5 7-5s7 2 7 5-3 5-7 5l-3 2v-2c-2-1-4-3-4-5z" fill="#1CB0F6"/>
      </svg>
    `,

    theme_dialogues: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="22" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2.5"/>
        <circle cx="19" cy="22" r="9" fill="#FBBF24" stroke="#D97706" stroke-width="1.5"/>
        <path d="M16 24q3 3 6 0" stroke="#78350F" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <circle cx="29" cy="26" r="9" fill="#1CB0F6" stroke="#0284C7" stroke-width="1.5"/>
        <path d="M26 27q3 3 6 0" stroke="#FFF" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      </svg>
    `,

    // ---------------- HJÄLPAR-IKONER (TOPPBAR, TÄVLA & BUTIK) ----------------
    trophy: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 12h20l-3 14c0 5-4 8-7 8s-7-3-7-8z" fill="#FFC800" stroke="#D97706" stroke-width="2"/>
        <path d="M14 14c-4 0-5 5-3 8 2 3 5 2 5 2m14-10c4 0 5 5 3 8-2 3-5 2-5 2" stroke="#D97706" stroke-width="2.5" stroke-linecap="round"/>
        <rect x="22" y="34" width="4" height="5" fill="#D97706"/>
        <rect x="17" y="39" width="14" height="4" rx="2" fill="#92400E"/>
        <polygon points="24,18 25,21 28,21 25.5,23 26.5,26 24,24 21.5,26 22.5,23 20,21 23,21" fill="#FFF"/>
      </svg>
    `,

    celebration: () => `
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12,38 20,22 32,34" fill="#FF4B4B" stroke="#B91C1C" stroke-width="2"/>
        <circle cx="28" cy="16" r="3" fill="#58CC02"/>
        <circle cx="36" cy="22" r="2.5" fill="#1CB0F6"/>
        <polygon points="34,10 35,7 38,9 36,11 37,14 34,12 31,13 33,11" fill="#FFC800"/>
        <path d="M24 20q6-8 12-4" stroke="#FF9600" stroke-width="2" stroke-linecap="round" fill="none"/>
      </svg>
    `,

    lightning: () => `
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="18,2 6,17 15,17 12,30 26,13 17,13" fill="#FFC800" stroke="#D97706" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    `,

    microphone: () => `
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="11" y="4" width="10" height="15" rx="5" fill="#58CC02" stroke="#3F9102" stroke-width="2"/>
        <path d="M7 14a9 9 0 0 0 18 0" stroke="#3F9102" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <line x1="16" y1="23" x2="16" y2="28" stroke="#3F9102" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="11" y1="28" x2="21" y2="28" stroke="#3F9102" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `,

    crown: () => `
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="5,23 7,10 12,17 16,7 20,17 25,10 27,23" fill="#FFC800" stroke="#D97706" stroke-width="2" stroke-linejoin="round"/>
        <rect x="5" y="23" width="22" height="4" rx="1.5" fill="#D97706"/>
        <circle cx="16" cy="14" r="1.8" fill="#EF4444"/>
        <circle cx="10" cy="18" r="1.5" fill="#1CB0F6"/>
        <circle cx="22" cy="18" r="1.5" fill="#58CC02"/>
      </svg>
    `,

    gift: () => `
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="14" width="20" height="14" rx="2" fill="#FF4B4B" stroke="#B91C1C" stroke-width="2"/>
        <rect x="4" y="9" width="24" height="6" rx="2" fill="#EF4444" stroke="#B91C1C" stroke-width="2"/>
        <line x1="16" y1="9" x2="16" y2="28" stroke="#FFC800" stroke-width="3"/>
        <path d="M12 9c-3 0-4-4-1-5 2-1 4 2 5 5m-1 0c2-3 4-6 6-5 3 1 2 5-1 5" stroke="#FFC800" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      </svg>
    `,

    ice_shield: () => `
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 3 L27 7 V16 C27 23 22 28 16 30 C10 28 5 23 5 16 V7 Z" fill="#BAE6FD" stroke="#0284C7" stroke-width="2"/>
        <polygon points="16,8 20,14 16,24 12,14" fill="#38BDF8"/>
      </svg>
    `,

    // Streak flame (ersätter 🔥)
    flame: (size = 28) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C16 7 21 11 21 17C21 23 17 28 12 28C7 28 4 23 4 18C4 13 8 9 9 7C9 12 12 15 15 15C13 10 16 2 16 2Z" fill="url(#flame-grad-vis)" />
        <path d="M16 14C16 17 19 19 19 23C19 26 17 28 14 28C11 28 10 25 10 23C10 19 14 16 16 14Z" fill="#FFF275" />
        <defs>
          <linearGradient id="flame-grad-vis" x1="4" y1="2" x2="21" y2="28" gradientUnits="userSpaceOnUse">
            <stop stop-color="#FF4B4B"/>
            <stop offset="0.6" stop-color="#FF9600"/>
            <stop offset="1" stop-color="#FFD600"/>
          </linearGradient>
        </defs>
      </svg>
    `,

    // Diamant / Juvel (ersätter 💎)
    gem: (size = 28) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,6 22,6 28,13 16,27 4,13" fill="#38BDF8" stroke="#0284C7" stroke-width="1.8" stroke-linejoin="round"/>
        <polygon points="10,6 16,13 22,6" fill="#BAE6FD"/>
        <polygon points="4,13 16,13 16,27" fill="#0284C7" opacity="0.4"/>
        <polygon points="28,13 16,13 16,27" fill="#0369A1" opacity="0.6"/>
        <polygon points="10,6 16,13 4,13" fill="#E0F2FE"/>
        <polygon points="22,6 16,13 28,13" fill="#7DD3FC"/>
        <circle cx="12" cy="10" r="1.5" fill="#FFF"/>
      </svg>
    `,

    // XP Stjärna (ersätter ⭐)
    xp_star: (size = 28) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="16,2 20.3,10.7 29.8,12.1 23,18.7 24.6,28.2 16,23.7 7.4,28.2 9,18.7 2.2,12.1 11.7,10.7" fill="#FFC800" stroke="#D97706" stroke-width="1.8" stroke-linejoin="round"/>
        <polygon points="16,5 19,11.5 26,12.5 21,17.4 22.2,24.4 16,21" fill="#FFE066"/>
      </svg>
    `,

    // Inställningskugghjul (ersätter ⚙️)
    gear: (size = 24) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="11" stroke="#64748B" stroke-width="3" stroke-dasharray="5 3"/>
        <circle cx="16" cy="16" r="5" fill="#64748B"/>
      </svg>
    `,

    // Högtalare (ersätter 🔊)
    speaker: (size = 24) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 11h5l6-5v20l-6-5H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" fill="#0284C7"/>
        <path d="M22 10a8 8 0 0 1 0 12m3-16a13 13 0 0 1 0 20" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" fill="none"/>
      </svg>
    `,

    // Sköldpadda (ersätter 🐢)
    turtle: (size = 26) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="15" cy="17" rx="9" ry="7" fill="#16A34A" stroke="#15803D" stroke-width="1.8"/>
        <circle cx="26" cy="15" r="4" fill="#22C55E" stroke="#15803D" stroke-width="1.5"/>
        <circle cx="27" cy="14" r="1" fill="#1E293B"/>
        <ellipse cx="9" cy="23" rx="2.5" ry="1.8" fill="#22C55E"/>
        <ellipse cx="19" cy="23" rx="2.5" ry="1.8" fill="#22C55E"/>
        <ellipse cx="8" cy="11" rx="2.5" ry="1.8" fill="#22C55E"/>
        <ellipse cx="19" cy="11" rx="2.5" ry="1.8" fill="#22C55E"/>
        <path d="M12 17h6m-3-4v8" stroke="#86EFAC" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    `,

    // Hem-ikon för navigering (ersätter 🏠)
    nav_home: (size = 26) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 14L16 4l11 10v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V14z" fill="#58CC02" stroke="#3F9102" stroke-width="2" stroke-linejoin="round"/>
        <path d="M12 27V17h8v10" fill="#FFF"/>
      </svg>
    `,

    // Tävla-ikon för navigering (ersätter 🏆)
    nav_compete: (size = 26) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 7h14l-2 10c0 4-3 7-5 7s-5-3-5-7z" fill="#FFC800" stroke="#D97706" stroke-width="1.8"/>
        <path d="M9 9c-3 0-4 4-2 6 2 2 4 1 4 1m10-7c3 0 4 4 2 6-2 2-4 1-4 1" stroke="#D97706" stroke-width="1.8" stroke-linecap="round"/>
        <rect x="14" y="24" width="4" height="4" fill="#D97706"/>
        <rect x="10" y="27" width="12" height="3" rx="1.5" fill="#92400E"/>
      </svg>
    `,

    // Ordbank-ikon för navigering (ersätter 📚)
    nav_vocab: (size = 26) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6a3 3 0 0 1 3-3h17v22H9a3 3 0 0 0-3 3V6z" fill="#1CB0F6" stroke="#0284C7" stroke-width="1.8"/>
        <path d="M6 25a3 3 0 0 1 3-3h17" stroke="#0284C7" stroke-width="1.8"/>
        <line x1="12" y1="10" x2="21" y2="10" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
        <line x1="12" y1="15" x2="19" y2="15" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,

    // Medaljer för uttals-nivåer (Brons, Silver, Guld, Diamant)
    medal_bronze: (size = 30) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="18" r="10" fill="#CD7F32" stroke="#9A5617" stroke-width="2"/>
        <polygon points="12,3 15,10 9,10" fill="#FF4B4B"/>
        <polygon points="20,3 23,10 17,10" fill="#1CB0F6"/>
        <polygon points="16,14 17.5,17 20.5,17.5 18,19.5 18.5,22.5 16,21 13.5,22.5 14,19.5 11.5,17.5 14.5,17" fill="#FFF"/>
      </svg>
    `,

    medal_silver: (size = 30) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="18" r="10" fill="#E2E8F0" stroke="#94A3B8" stroke-width="2"/>
        <polygon points="12,3 15,10 9,10" fill="#1CB0F6"/>
        <polygon points="20,3 23,10 17,10" fill="#FFC800"/>
        <polygon points="16,14 17.5,17 20.5,17.5 18,19.5 18.5,22.5 16,21 13.5,22.5 14,19.5 11.5,17.5 14.5,17" fill="#64748B"/>
      </svg>
    `,

    medal_gold: (size = 30) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="18" r="10" fill="#FFC800" stroke="#D97706" stroke-width="2"/>
        <polygon points="12,3 15,10 9,10" fill="#FF4B4B"/>
        <polygon points="20,3 23,10 17,10" fill="#1CB0F6"/>
        <polygon points="16,14 17.5,17 20.5,17.5 18,19.5 18.5,22.5 16,21 13.5,22.5 14,19.5 11.5,17.5 14.5,17" fill="#FFF"/>
      </svg>
    `,

    medal_diamond: (size = 30) => `
      <svg viewBox="0 0 32 32" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="18" r="10" fill="#BAE6FD" stroke="#0284C7" stroke-width="2"/>
        <polygon points="12,3 15,10 9,10" fill="#A855F7"/>
        <polygon points="20,3 23,10 17,10" fill="#38BDF8"/>
        <polygon points="13,15 19,15 22,18 16,23 10,18" fill="#38BDF8" stroke="#0284C7" stroke-width="1.2"/>
        <polygon points="13,15 16,18 19,15" fill="#FFF"/>
      </svg>
    `,

    // Träningslägen
    mode_mix: (size = 22) => `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l2.4 5.6L20 10l-4.5 4 1.4 6-4.9-3.2L7.1 20l1.4-6L4 10l5.6-2.4L12 2z" fill="#FFC800" stroke="#D97706" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="19" cy="5" r="2" fill="#38BDF8"/>
      </svg>
    `,

    mode_words: (size = 22) => `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="3" fill="#E0F2FE" stroke="#0284C7" stroke-width="1.8"/>
        <circle cx="8" cy="9" r="2" fill="#F59E0B"/>
        <path d="M4 17l4-4 3 3 5-6 4 5v2H4z" fill="#38BDF8"/>
      </svg>
    `,

    mode_sentences: (size = 22) => `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="8" height="6" rx="2" fill="#FDE047" stroke="#D97706" stroke-width="1.5"/>
        <rect x="13" y="5" width="8" height="6" rx="2" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.5"/>
        <rect x="5" y="13" width="14" height="6" rx="2" fill="#BBF7D0" stroke="#16A34A" stroke-width="1.5"/>
      </svg>
    `,

    mode_listen: (size = 22) => `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12v-2a8 8 0 0 1 16 0v2" stroke="#8B5CF6" stroke-width="2" stroke-linecap="round" fill="none"/>
        <rect x="3" y="12" width="4" height="7" rx="2" fill="#8B5CF6"/>
        <rect x="17" y="12" width="4" height="7" rx="2" fill="#8B5CF6"/>
      </svg>
    `,

    mode_speak: (size = 22) => `
      <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="3" width="8" height="11" rx="4" fill="#58CC02" stroke="#3F9102" stroke-width="1.5"/>
        <path d="M5 10a7 7 0 0 0 14 0" stroke="#3F9102" stroke-width="1.8" stroke-linecap="round" fill="none"/>
        <line x1="12" y1="17" x2="12" y2="21" stroke="#3F9102" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `,

    // Mål / Uppdrag (ersätter 🎯)
    target: (size = 28) => `
      <svg viewBox="0 0 28 28" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="12" fill="#FEE2E2" stroke="#EF4444" stroke-width="2"/>
        <circle cx="14" cy="14" r="8" fill="#FFF" stroke="#EF4444" stroke-width="1.8"/>
        <circle cx="14" cy="14" r="4" fill="#EF4444"/>
      </svg>
    `,

    // Stoppur (ersätter ⏱️)
    stopwatch: (size = 28) => `
      <svg viewBox="0 0 28 28" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="15" r="10" fill="#FFF" stroke="#0284C7" stroke-width="2"/>
        <path d="M14 15l4-3" stroke="#EF4444" stroke-width="2" stroke-linecap="round"/>
        <circle cx="14" cy="15" r="1.5" fill="#1E293B"/>
        <line x1="14" y1="2" x2="14" y2="5" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="11" y1="2" x2="17" y2="2" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `,

    // Palett (ersätter 🎨)
    palette: (size = 28) => `
      <svg viewBox="0 0 28 28" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 3C8 3 3 8 3 14c0 5 4 9 9 9 1.5 0 2-1 2-2 0-.6-.2-1-.2-1.5 0-1 .8-1.5 1.7-1.5H18c4 0 7-3 7-7 0-6-5-10-11-10z" fill="#FFF" stroke="#8B5CF6" stroke-width="2"/>
        <circle cx="8" cy="11" r="2" fill="#EF4444"/>
        <circle cx="13" cy="8" r="2" fill="#F59E0B"/>
        <circle cx="19" cy="11" r="2" fill="#10B981"/>
        <circle cx="20" cy="16" r="2" fill="#3B82F6"/>
      </svg>
    `,

    // Rosett (ersätter 🎀)
    ribbon: (size = 28) => `
      <svg viewBox="0 0 28 28" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 13C6 9 6 6 9 6s5 5 5 7m-5 0l-3 9 5-2 3-7m0 0c3-4 3-7 0-7s-5 5-5 7m5 0l3 9-5-2-3-7" fill="#F472B6" stroke="#DB2777" stroke-width="1.8" stroke-linejoin="round"/>
        <circle cx="14" cy="13" r="2.5" fill="#DB2777"/>
      </svg>
    `,

    // Medalj (ersätter 🎖️)
    badge_medal: (size = 28) => `
      <svg viewBox="0 0 28 28" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,2 14,8 8,8" fill="#EF4444"/>
        <polygon points="18,2 20,8 14,8" fill="#3B82F6"/>
        <circle cx="14" cy="16" r="9" fill="#FFC800" stroke="#D97706" stroke-width="1.8"/>
        <polygon points="14,12 15.5,15 18.5,15.5 16,17.5 16.5,20.5 14,19 11.5,20.5 12,17.5 9.5,15.5 12.5,15" fill="#FFF"/>
      </svg>
    `
  };

  /* ==========================================================================
     3. BELÖNINGSMOTOR (HTML5 Canvas Guldmynt, Stjärnor & Konfetti)
     ========================================================================== */

  const ParticleEngine = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,

    init() {
      this.canvas = document.getElementById('fx-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    /**
     * Skjut guldmynt, stjärnor och konfetti från en punkt (eller center)
     */
    burstCelebration(originX = window.innerWidth / 2, originY = window.innerHeight / 2, count = 45) {
      if (!this.canvas) this.init();
      if (!this.ctx) return;

      const colors = ['#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B', '#CE82FF', '#FFAE00'];

      for (let i = 0; i < count; i++) {
        const type = i % 3 === 0 ? 'coin' : i % 3 === 1 ? 'star' : 'confetti';
        const angle = Math.random() * Math.PI * 2;
        const speed = 6 + Math.random() * 12;

        this.particles.push({
          type,
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 6,
          gravity: 0.38,
          friction: 0.98,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.25,
          scaleX: 1,
          size: type === 'coin' ? 14 : type === 'star' ? 12 : 9,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 90 + Math.random() * 30,
          maxLife: 120
        });
      }

      if (!this.animationId) this.animate();
    },

    shootCoinShower(amount = 20) {
      const centerX = window.innerWidth / 2;
      const bottomY = window.innerHeight * 0.85;

      for (let i = 0; i < amount; i++) {
        this.particles.push({
          type: 'coin',
          x: centerX + (Math.random() - 0.5) * 120,
          y: bottomY,
          vx: (Math.random() - 0.5) * 8,
          vy: -13 - Math.random() * 8,
          gravity: 0.42,
          friction: 0.985,
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.3,
          scaleX: 1,
          size: 15 + Math.random() * 5,
          color: '#FFC800',
          life: 100 + Math.random() * 20,
          maxLife: 120
        });
      }
      if (!this.animationId) this.animate();
    },

    animate() {
      if (!this.ctx || !this.canvas) return;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.rotation += p.vRot;
        p.scaleX = Math.cos(p.rotation);
        p.life--;

        const opacity = Math.min(1, p.life / 25);
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.globalAlpha = opacity;

        if (p.type === 'coin') {
          // Guldmynt med 3D rotation & glans
          this.ctx.scale(p.scaleX, 1);
          this.ctx.beginPath();
          this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          this.ctx.fillStyle = '#FFC800';
          this.ctx.fill();
          this.ctx.lineWidth = 2.5;
          this.ctx.strokeStyle = '#D97706';
          this.ctx.stroke();
          // Prägling
          this.ctx.fillStyle = '#92400E';
          this.ctx.font = 'bold 10px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('kr', 0, 0);
        } else if (p.type === 'star') {
          // Gyllene femuddig stjärna
          this.ctx.rotate(p.rotation);
          this.ctx.fillStyle = p.color;
          this.drawStar(this.ctx, 0, 0, 5, p.size, p.size / 2);
          this.ctx.fill();
        } else {
          // Rektangulär konfettibit
          this.ctx.rotate(p.rotation);
          this.ctx.fillStyle = p.color;
          this.ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.7);
        }

        this.ctx.restore();

        if (p.life <= 0 || p.y > this.canvas.height + 40) {
          this.particles.splice(i, 1);
        }
      }

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(() => this.animate());
      } else {
        this.animationId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    },

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    }
  };

  /* ==========================================================================
     4. AUDIO VISUALIZER (12 DANSDANDE STAPLAR FÖR MIKROFON & TAL)
     ========================================================================== */

  const Visualizer12 = {
    renderHTML() {
      return `
        <div class="audio-visualizer-12" id="dala-audio-viz-12" aria-hidden="true">
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
          <div class="viz-bar-12"></div>
        </div>
      `;
    },

    setActive(isActive = true) {
      const viz = document.getElementById('dala-audio-viz-12');
      if (viz) {
        if (isActive) viz.classList.add('active');
        else viz.classList.remove('active');
      }
    }
  };

  /* ==========================================================================
     5. INTEGRATION MED WINDOW.VISUALENGINE & SYSTEMKROKAR
     ========================================================================== */

  // Koppla samman den nya grafiska motorn med befintliga window.VisualEngine
  window.VisualEngine = Object.assign(window.VisualEngine || {}, {
    Mascot: MascotController,
    Library: IllustrationLibrary,
    Particles: ParticleEngine,
    Visualizer: Visualizer12,

    /**
     * Ersätter standardillustration med levande, rörlig SVG från biblioteket
     */
    getIllustrationSVG(item, size = 64) {
      return this.getItemIllustrationSVG(item, size);
    },

    /**
     * Smart vektorillustrations-motor för ord och fraser (ersätter emojis)
     */
    getItemIllustrationSVG(item, size = 64) {
      if (!item) return IllustrationLibrary.star();
      // 1. Direkt matchning på scen eller nyckel
      const key = item.svgScene || item.svgKey || '';
      if (key && typeof IllustrationLibrary[key] === 'function') {
        return IllustrationLibrary[key]();
      }

      // 2. Intelligent sökning baserad på ord i ordförrådet
      const sv = (item.sv || item.text || '').toLowerCase();
      if (sv.includes('mjölk')) return IllustrationLibrary.milk();
      if (sv.includes('bröd') || sv.includes('macka')) return IllustrationLibrary.bread();
      if (sv.includes('ägg')) return IllustrationLibrary.egg();
      if (sv.includes('kyckling')) return IllustrationLibrary.chicken();
      if (sv.includes('ris')) return IllustrationLibrary.rice();
      if (sv.includes('äpple') || sv.includes('frukt')) return IllustrationLibrary.apple();
      if (sv.includes('ost')) return IllustrationLibrary.cheese();
      if (sv.includes('kaffe') || sv.includes('fika') || sv.includes('kopp')) return IllustrationLibrary.coffee();
      if (sv.includes('bulle') || sv.includes('kanelbulle')) return IllustrationLibrary.cinnamon_bun();
      if (sv.includes('te')) return IllustrationLibrary.tea();
      if (sv.includes('vatten') || sv.includes('dricka')) return IllustrationLibrary.water();
      if (sv.includes('jacka') || sv.includes('kläder') || sv.includes('varm')) return IllustrationLibrary.jacket();
      if (sv.includes('buss') || sv.includes('tåg') || sv.includes('resa') || sv.includes('bil')) return IllustrationLibrary.bus();
      if (sv.includes('klocka') || sv.includes('tid') || sv.includes('timme') || sv.includes('minut')) return IllustrationLibrary.clock();
      if (sv.includes('idag') || sv.includes('imorgon') || sv.includes('igår') || sv.includes('dag') || sv.includes('vecka') || sv.includes('kalender')) return IllustrationLibrary.calendar();
      if (sv.includes('katt')) return IllustrationLibrary.cat();
      if (sv.includes('hund')) return IllustrationLibrary.dog();
      if (sv.includes('säng') || sv.includes('sova') || sv.includes('vila')) return IllustrationLibrary.bed();
      if (sv.includes('dusch') || sv.includes('bada') || sv.includes('tvätta')) return IllustrationLibrary.shower();
      if (sv.includes('städa') || sv.includes('rent')) return IllustrationLibrary.clean();
      if (sv.includes('sol') || sv.includes('varmt')) return IllustrationLibrary.sun();
      if (sv.includes('regn') || sv.includes('regnar')) return IllustrationLibrary.rain();
      if (sv.includes('snö') || sv.includes('kallt') || sv.includes('vinter')) return IllustrationLibrary.snow();
      if (sv.includes('moln') || sv.includes('blåsigt')) return IllustrationLibrary.cloud();
      if (sv.includes('hus') || sv.includes('hem') || sv.includes('lägenhet') || sv.includes('kök') || sv.includes('rum')) return IllustrationLibrary.home();
      if (sv.includes('älska') || sv.includes('kärlek') || sv.includes('saknar') || sv.includes('hjärta')) return IllustrationLibrary.heart();
      if (sv.includes('tack')) return IllustrationLibrary.heart_hands();
      if (sv.includes('hej') || sv.includes('morgon') || sv.includes('ses') || sv.includes('välkommen')) return IllustrationLibrary.wave();
      if (sv.includes('ursäkta') || sv.includes('förlåt') || sv.includes('snälla')) return IllustrationLibrary.polite();
      if (sv.includes('handla') || sv.includes('köpa') || sv.includes('butik') || sv.includes('påse') || sv.includes('affär')) return IllustrationLibrary.cart();
      if (sv.includes('kronor') || sv.includes('krona') || sv.includes('kostar') || sv.includes('pris') || sv.includes('pengar') || sv.includes('billig') || sv.includes('dyr')) return IllustrationLibrary.coin();
      if (sv.includes('kort') || sv.includes('betala')) return IllustrationLibrary.card();
      if (sv.includes('kvitto') || sv.includes('lapp')) return IllustrationLibrary.tag();
      if (sv.includes('glad') || sv.includes('mår bra') || sv.includes('le')) return IllustrationLibrary.smile();

      // 3. Fallback baserat på tema
      const themeFallbacks = {
        greetings: IllustrationLibrary.theme_greetings,
        family_love: IllustrationLibrary.theme_love,
        supermarket: IllustrationLibrary.theme_supermarket,
        fika_food: IllustrationLibrary.theme_fika,
        everyday: IllustrationLibrary.theme_home,
        weather_time: IllustrationLibrary.theme_weather,
        shopping_numbers: IllustrationLibrary.theme_numbers,
        city_transport: IllustrationLibrary.theme_city,
        sfi_smalltalk: IllustrationLibrary.theme_chat,
        real_dialogs: IllustrationLibrary.theme_dialogues
      };

      if (item.themeId && themeFallbacks[item.themeId]) {
        return themeFallbacks[item.themeId]();
      }

      return IllustrationLibrary.star();
    },

    /**
     * Vektorikon för de 10 temana i temaväljaren
     */
    getThemeIconSVG(themeId, size = 48) {
      const map = {
        greetings: IllustrationLibrary.theme_greetings,
        family_love: IllustrationLibrary.theme_love,
        supermarket: IllustrationLibrary.theme_supermarket,
        fika_food: IllustrationLibrary.theme_fika,
        everyday: IllustrationLibrary.theme_home,
        weather_time: IllustrationLibrary.theme_weather,
        shopping_numbers: IllustrationLibrary.theme_numbers,
        city_transport: IllustrationLibrary.theme_city,
        sfi_smalltalk: IllustrationLibrary.theme_chat,
        real_dialogs: IllustrationLibrary.theme_dialogues
      };
      if (map[themeId]) {
        return map[themeId]();
      }
      return IllustrationLibrary.star();
    },

    /**
     * Firande-ikon vid avklarad lektion
     */
    getCelebrationSVG(size = 80) {
      return IllustrationLibrary.celebration();
    },

    /**
     * Trofé-ikon vid vinst och rekord
     */
    getTrophySVG(size = 80) {
      return IllustrationLibrary.trophy();
    },

    /**
     * Arena-ikon för tävlingslägen
     */
    getArenaIconSVG(modeId, size = 32) {
      if (modeId === 'speed_sprint' || modeId === 'sprint') return IllustrationLibrary.lightning();
      if (modeId === 'pronunciation' || modeId === 'voice') return IllustrationLibrary.microphone();
      if (modeId === 'boss') return IllustrationLibrary.crown();
      if (modeId === 'score_attack') return IllustrationLibrary.flame(size);
      if (modeId === 'target') return IllustrationLibrary.target(size);
      return IllustrationLibrary.trophy();
    },

    /**
     * Medalj-vektor för uttals-utmaningen
     */
    getMedalSVG(tier, size = 28) {
      const t = (tier || '').toLowerCase();
      if (t.includes('diamant')) return IllustrationLibrary.medal_diamond(size);
      if (t.includes('guld')) return IllustrationLibrary.medal_gold(size);
      if (t.includes('silver')) return IllustrationLibrary.medal_silver(size);
      return IllustrationLibrary.medal_bronze(size);
    },

    /**
     * Uppdrags-ikon för dagliga utmaningar
     */
    getQuestIconSVG(questId, size = 28) {
      const q = (questId || '').toLowerCase();
      if (q.includes('speak') || q.includes('voice') || q.includes('mic')) return IllustrationLibrary.microphone();
      if (q.includes('turtle') || q.includes('slow')) return IllustrationLibrary.turtle(size);
      if (q.includes('combo') || q.includes('streak') || q.includes('fire')) return IllustrationLibrary.flame(size);
      if (q.includes('time') || q.includes('min')) return IllustrationLibrary.stopwatch(size);
      if (q.includes('lesson') || q.includes('xp') || q.includes('star')) return IllustrationLibrary.xp_star(size);
      return IllustrationLibrary.target(size);
    },

    /**
     * Booster-ikon för butiken
     */
    getBoosterSVG(boosterId, size = 36) {
      if (boosterId === 'streak_freeze') return IllustrationLibrary.ice_shield();
      if (boosterId === 'double_xp') return IllustrationLibrary.lightning();
      if (boosterId === 'mystery_box') return IllustrationLibrary.gift();
      return IllustrationLibrary.star();
    },

    /**
     * Accessoar-vektor för Nong Dalas garderob
     */
    getAccessorySVG(accessoryId, size = 36) {
      const map = {
        midsommar: () => `
          <svg viewBox="0 0 36 36" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="14" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
            <circle cx="12" cy="15" r="3" fill="#EC4899"/>
            <circle cx="18" cy="12" r="3.5" fill="#3B82F6"/>
            <circle cx="24" cy="15" r="3" fill="#FACC15"/>
            <circle cx="18" cy="22" r="2.5" fill="#EF4444"/>
          </svg>
        `,
        solglasogon: () => `
          <svg viewBox="0 0 36 36" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="13" width="11" height="9" rx="2.5" fill="#0F172A" stroke="#FACC15" stroke-width="1.8"/>
            <rect x="20" y="13" width="11" height="9" rx="2.5" fill="#0F172A" stroke="#FACC15" stroke-width="1.8"/>
            <line x1="16" y1="16" x2="20" y2="16" stroke="#FACC15" stroke-width="2"/>
            <line x1="7" y1="15" x2="11" y2="19" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="22" y1="15" x2="26" y2="19" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        `,
        vintermossa: () => `
          <svg viewBox="0 0 36 36" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 23C7 14 18 8 18 8s11 6 11 15z" fill="#2563EB" stroke="#1D4ED8" stroke-width="1.8"/>
            <rect x="6" y="21" width="24" height="5" rx="2" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2"/>
            <circle cx="18" cy="7" r="3.5" fill="#FDE047" stroke="#EAB308" stroke-width="1"/>
          </svg>
        `,
        fikabricka: () => `
          <svg viewBox="0 0 36 36" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="18" cy="22" rx="14" ry="7" fill="#FDE68A" stroke="#D97706" stroke-width="1.8"/>
            <circle cx="13" cy="20" r="4" fill="#D97706"/>
            <rect x="20" y="15" width="7" height="7" rx="1.5" fill="#EF4444"/>
            <path d="M22 13q1-3 0-5" stroke="#94A3B8" stroke-width="1" stroke-linecap="round" fill="none"/>
          </svg>
        `,
        halsduk: () => `
          <svg viewBox="0 0 36 36" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 14q10 7 20 0l-2 9q-8 5-16 0z" fill="#EF4444" stroke="#B91C1C" stroke-width="1.8"/>
            <rect x="20" y="17" width="6" height="13" rx="2" fill="#EF4444" stroke="#B91C1C" stroke-width="1"/>
            <line x1="21" y1="28" x2="25" y2="28" stroke="#FDE047" stroke-width="1.5"/>
          </svg>
        `,
        kungakrona: () => IllustrationLibrary.crown(),
        snorkel: () => `
          <svg viewBox="0 0 36 36" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="6" y="13" width="24" height="10" rx="4" fill="#BAE6FD" stroke="#0284C7" stroke-width="1.8"/>
            <path d="M26 18h4v-10q0-3 3-3" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </svg>
        `,
        viking: () => `
          <svg viewBox="0 0 36 36" width="${size}" height="${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 23C7 14 18 10 18 10s11 4 11 13z" fill="#94A3B8" stroke="#475569" stroke-width="1.8"/>
            <path d="M8 19q-7-4-5-10 6 3 6 8z" fill="#FFF" stroke="#94A3B8" stroke-width="1"/>
            <path d="M28 19q7-4 5-10-6 3-6 8z" fill="#FFF" stroke="#94A3B8" stroke-width="1"/>
          </svg>
        `,
        diamantaura: () => IllustrationLibrary.gem(size),
        guldstatyett: () => IllustrationLibrary.trophy()
      };
      if (map[accessoryId]) return map[accessoryId]();
      return IllustrationLibrary.star();
    },

    /**
     * Toppbar stat-ikoner (flamma, juvel, xp, inställningar)
     */
    getStatIconSVG(type, size = 20) {
      if (type === 'streak' || type === 'flame') return IllustrationLibrary.flame(size);
      if (type === 'gem' || type === 'diamond') return IllustrationLibrary.gem(size);
      if (type === 'xp' || type === 'star') return IllustrationLibrary.xp_star(size);
      if (type === 'settings' || type === 'gear') return IllustrationLibrary.gear(size);
      return IllustrationLibrary.star();
    },

    /**
     * Navigerings-ikoner i bottenlisten
     */
    getNavIconSVG(navId, size = 26) {
      if (navId === 'home' || navId === 'view-home') return IllustrationLibrary.nav_home(size);
      if (navId === 'compete' || navId === 'view-compete') return IllustrationLibrary.nav_compete(size);
      if (navId === 'vocab' || navId === 'view-vocab') return IllustrationLibrary.nav_vocab(size);
      return IllustrationLibrary.star();
    },

    /**
     * Ljud-ikoner för uppspelning (normal & sköldpadda)
     */
    getAudioIconSVG(type, size = 22) {
      if (type === 'turtle' || type === 'slow') return IllustrationLibrary.turtle(size);
      return IllustrationLibrary.speaker(size);
    },

    /**
     * Rendera Nong Dala i vald container och starta idle-animation
     */
    renderMascot(mood = 'idle') {
      const container = document.getElementById('mascot-container');
      if (container) {
        MascotController.mount(container, 62, mood);
      }
    },

    /**
     * Uppgraderad konfetti som skjuter både konfetti, stjärnor och mynt
     */
    triggerConfetti() {
      ParticleEngine.burstCelebration(window.innerWidth / 2, window.innerHeight * 0.45, 55);
    },

    /**
     * Skjut myntregn vid avklarad lektion
     */
    triggerCoinShower(amount = 20) {
      ParticleEngine.shootCoinShower(amount);
    }
  });

  /* ==========================================================================
     6. AUTOMATISKA LYSSNARE & KROKAR FÖR TAL OCH LEKTIONER
     ========================================================================== */

  function setupEngineHooks() {
    // 1. Krok för SpeechEngine: Tala -> Nong Dala rör på munnen och talar
    if (window.SpeechEngine) {
      const originalSpeak = window.SpeechEngine.speakSwedish.bind(window.SpeechEngine);
      window.SpeechEngine.speakSwedish = function (text, rate, onEnd) {
        MascotController.setState('speaking');
        return originalSpeak(text, rate, () => {
          MascotController.setState('idle');
          if (onEnd) onEnd();
        });
      };

      const originalListen = window.SpeechEngine.listenAndEvaluate.bind(window.SpeechEngine);
      window.SpeechEngine.listenAndEvaluate = function (targetItem, callbacks = {}) {
        MascotController.setState('listening');
        Visualizer12.setActive(true);

        const wrappedCallbacks = {
          ...callbacks,
          onStart: () => {
            MascotController.setState('listening');
            Visualizer12.setActive(true);
            MascotController.speakRandomQuote('listening');
            if (callbacks.onStart) callbacks.onStart();
          },
          onResult: (res) => {
            Visualizer12.setActive(false);
            MascotController.setState('celebrating');
            if (callbacks.onResult) callbacks.onResult(res);
          },
          onFallbackReady: () => {
            Visualizer12.setActive(false);
            MascotController.setState('encouraging');
            if (callbacks.onFallbackReady) callbacks.onFallbackReady();
          }
        };

        return originalListen(targetItem, wrappedCallbacks);
      };
    }

    // 2. Ersätt mikrofonens standard-vågor med den nya 12-bars Audio Visualizern
    const originalRenderPronun = window.GameEngine?.QuestionGenerator?.createPronunciationQuestion;
    if (window.GameEngine?.LessonController) {
      const origShowFeedback = window.GameEngine.LessonController.showFeedbackSheet.bind(
        window.GameEngine.LessonController
      );

      window.GameEngine.LessonController.showFeedbackSheet = function (isCorrect, explanation, item) {
        origShowFeedback(isCorrect, explanation, item);

        const currentCombo = window.GameEngine.LessonController.combo || 1;
        const targetState = isCorrect ? (currentCombo >= 5 ? 'streak_fire' : 'celebrating') : 'encouraging';

        const feedbackMascot = document.getElementById('feedback-mascot-container');
        if (feedbackMascot) {
          MascotController.mount(feedbackMascot, 52, targetState);
        }

        if (isCorrect) {
          if (currentCombo >= 5) {
            MascotController.setState('streak_fire');
            MascotController.speakRandomQuote('streak_fire');
          } else {
            MascotController.setState('celebrating');
            MascotController.speakRandomQuote('correct');
          }
          ParticleEngine.burstCelebration(window.innerWidth / 2, window.innerHeight * 0.4, 35);
        } else {
          MascotController.setState('encouraging');
          MascotController.speakRandomQuote('retry');
        }
      };

      const origComplete = window.GameEngine.LessonController.renderLessonComplete.bind(
        window.GameEngine.LessonController
      );
      window.GameEngine.LessonController.renderLessonComplete = function () {
        origComplete();
        MascotController.setState('celebrating');
        MascotController.say(
          "ยินดีด้วยจ้า! เรียนจบหนึ่งบทเรียนแล้ว เก่งมากๆ!",
          "หรอยแรงนิ! เรียนจบหล่าว เก่งเบอร์หนึ่งเลย!",
          'happy',
          6000
        );
        ParticleEngine.shootCoinShower(35);
        ParticleEngine.burstCelebration(window.innerWidth / 2, window.innerHeight * 0.35, 60);
      };
    }
  }

  // Kör setup vid DOMContentLoaded
  function initVisuals() {
    ParticleEngine.init();
    window.VisualEngine.renderMascot('idle');
    setupEngineHooks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisuals);
  } else {
    initVisuals();
  }
})();

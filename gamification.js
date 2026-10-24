/**
 * ============================================================================
 * SVENSKA FRÅN GRUNDEN (SATUN EDITION) – DEL 5: GAMIFICATION, EKONOMI & MASKOT
 * Fil: gamification.js (window.GameEngine)
 *
 * Innehåller:
 * 1. TRE TÄVLINGSLÄGEN:
 *    - "Snabb-Sprinten" (60s på tid med +2s bonus & 1x-5x Combo XP)
 *    - "Uttals-Utmaningen" (10 röst-kort, Brons -> Silver -> Guld -> Diamant)
 *    - "Tema-Bossen" (Slutprov per kategori, belönar Guld-märke)
 * 2. LÖSNING PÅ POÄNGINFLATIONEN & UTÖKAD BELÖNINGSEKONOMI:
 *    - Spelbara Boosters & Juvel-sinks:
 *      * 🛡️ Streak-Freeze (Frys Streaken, skyddar mot streak-förlust)
 *      * ⚡ Dubbel-XP Booster (30 minuter 2x XP på allt)
 *      * 🎁 Lyckolåda / Gåvo-kista (Mystery Box med slumpmässiga storvinster)
 *    - 10 st Maskot-accessoarer i balanserade prisklasser (25–350 💎)
 *      med pixelperfekt centrering direkt på Nong Dalas huvud (x=50)
 *    - 6 st Upplåsbara färgteman (inkl. Norrsken & Satun Sunset)
 *    - Samlaralbum med 8 upplåsbara Prestationsmärken (Badges)
 * 3. "MINA ORD"-BANK (1–5 stjärnor, dual-speed lyssning & röstträning)
 * 4. VÄLKOMSTSKÄRM & LOKAL IPHONE-SAFARI INTEGRATION
 * ============================================================================
 */

(function () {
  'use strict';

  const GAME_ENGINE_STORAGE_KEY = 'wilawan_svenska_part5_gamification_v2';

  /* ==========================================================================
     1. MASKOT-ACCESSOARER (10 STYCKEN, CENTRERADE DIREKT PÅ HUVUDET x=50)
     ========================================================================== */

  const MASCOT_ACCESSORIES = [
    {
      id: 'midsommar',
      nameSv: 'Svensk Midsommarkrans',
      nameTh: 'มงกุฎดอกไม้ซัมเมอร์สวีเดน',
      satunDesc: 'ใส่บนหัวงามจังฮู้ ดอกไม้บานสะพรั่งกลางหน้าร้อน!',
      icon: '🌸',
      costGems: 25,
      svgOverlay: `
        <g class="accessory-midsommar">
          <!-- Grön blomsterkrans tvärs över pannan -->
          <path d="M 32 28 Q 50 18 68 28" stroke="#166534" stroke-width="3.2" stroke-linecap="round" fill="none"/>
          <!-- Prästkragar, blåklint och gula smörblommor -->
          <circle cx="34" cy="27" r="3.2" fill="#FACC15" stroke="#FEF08A" stroke-width="1"/>
          <circle cx="42" cy="23" r="3.5" fill="#EC4899" stroke="#FCE7F3" stroke-width="1"/>
          <circle cx="50" cy="20" r="4.2" fill="#3B82F6" stroke="#DBEAFE" stroke-width="1.2"/>
          <circle cx="50" cy="20" r="1.6" fill="#FACC15"/>
          <circle cx="58" cy="23" r="3.5" fill="#FACC15" stroke="#FEF08A" stroke-width="1"/>
          <circle cx="66" cy="27" r="3.2" fill="#EC4899" stroke="#FCE7F3" stroke-width="1"/>
        </g>
      `
    },
    {
      id: 'solglasogon',
      nameSv: 'Satun Solglasögon',
      nameTh: 'แว่นกันแดดสุดเท่สตูล',
      satunDesc: 'ใส่ตรงตาเป๊ะ เท่ระเบิดพร้อมลุยเกาะหลีเป๊ะ!',
      icon: '😎',
      costGems: 30,
      svgOverlay: `
        <g class="accessory-shades">
          <!-- Solglasögon placerade direkt över ögonen (y=34-43, x=34-66) -->
          <rect x="34" y="33" width="14" height="10" rx="3" fill="#0F172A" stroke="#FACC15" stroke-width="1.8"/>
          <rect x="52" y="33" width="14" height="10" rx="3" fill="#0F172A" stroke="#FACC15" stroke-width="1.8"/>
          <!-- Brygga mellan glasen -->
          <line x1="48" y1="36" x2="52" y2="36" stroke="#FACC15" stroke-width="2.2"/>
          <!-- Cool spegelglans -->
          <line x1="36" y1="35" x2="42" y2="41" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="54" y1="35" x2="60" y2="41" stroke="#38BDF8" stroke-width="1.5" stroke-linecap="round"/>
        </g>
      `
    },
    {
      id: 'vintermossa',
      nameSv: 'Mysig Vintermössa',
      nameTh: 'หมวกไหมพรมหน้าหนาว',
      satunDesc: 'สวมบนหัวอุ่นสบาย หิมะตกแค่ไหนก็ไม่หนาวจ้า',
      icon: '🧶',
      costGems: 35,
      svgOverlay: `
        <g class="accessory-beanie">
          <!-- Stickad mössa direkt på hjässan -->
          <path d="M 33 22 Q 50 5 67 22 Z" fill="#2563EB" stroke="#1D4ED8" stroke-width="1.6"/>
          <path d="M 37 17 Q 50 11 63 17" stroke="#93C5FD" stroke-width="1.8" stroke-dasharray="2.5 2" fill="none"/>
          <rect x="32" y="20" width="36" height="5.5" rx="2.5" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2"/>
          <!-- Gul tofs på toppen -->
          <circle cx="50" cy="5" r="4.5" fill="#FDE047" stroke="#EAB308" stroke-width="1"/>
        </g>
      `
    },
    {
      id: 'fikabricka',
      nameSv: 'Svensk Fika-bricka',
      nameTh: 'ถาดฟีก้า กาแฟ & ซินนามอนโรล',
      satunDesc: 'ถือไว้ข้างตัว จิบโกปี๊แกล้มขนมปังหอมๆ',
      icon: '☕',
      costGems: 45,
      svgOverlay: `
        <g class="accessory-fika">
          <!-- Bricka hålls framför främre hoven (x=62-92, y=68-84) -->
          <ellipse cx="76" cy="76" rx="16" ry="6" fill="#FDE68A" stroke="#D97706" stroke-width="1.5"/>
          <!-- Kanelbulle -->
          <circle cx="69" cy="74" r="4.2" fill="#D97706" stroke="#92400E" stroke-width="1"/>
          <path d="M 69 74 m-2 0 a 2 2 0 1 0 4 0 a 1.2 1.2 0 1 0 -2.5 0" stroke="#FEF3C7" stroke-width="0.8" fill="none"/>
          <!-- Röd kaffekopp med ånga -->
          <rect x="76" y="68" width="8" height="7" rx="1.5" fill="#EF4444" stroke="#991B1B" stroke-width="1"/>
          <path d="M 84 69.5 C 86.5 69.5 86.5 73.5 84 73.5" stroke="#991B1B" stroke-width="1" fill="none"/>
          <path d="M 78 66 Q 80 63 78 60" stroke="#94A3B8" stroke-width="1" fill="none" stroke-linecap="round"/>
          <path d="M 81 66 Q 83 63 81 60" stroke="#94A3B8" stroke-width="1" fill="none" stroke-linecap="round"/>
        </g>
      `
    },
    {
      id: 'halsduk',
      nameSv: 'Dala-Halsduk i Ull',
      nameTh: 'ผ้าพันคอขนแกะดาลาร์นา',
      satunDesc: 'พันรอบคออุ่นๆ ลายพื้นเมืองสวีเดนสุดน่ารัก!',
      icon: '🧣',
      costGems: 50,
      svgOverlay: `
        <g class="accessory-scarf">
          <!-- Varm halsduk virad runt halsen (y=49-62) -->
          <path d="M 37 49 Q 50 56 63 49 Q 64 54 50 58 Q 36 54 37 49 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="1.4"/>
          <rect x="52" y="52" width="7" height="14" rx="2" fill="#EF4444" stroke="#B91C1C" stroke-width="1"/>
          <line x1="53" y1="64" x2="58" y2="64" stroke="#FDE047" stroke-width="1.5"/>
        </g>
      `
    },
    {
      id: 'kungakrona',
      nameSv: 'Svensk Kungakrona',
      nameTh: 'มงกุฎพระราชาสวีเดน',
      satunDesc: 'มงกุฎทองคำแท้ สวมบนหัวตรงเป๊ะ หรอยแรงระดับราชา!',
      icon: '👑',
      costGems: 65,
      svgOverlay: `
        <g class="accessory-crown">
          <!-- Guldkrona centrerad på huvudet (x=37-63, y=7-22) -->
          <path d="M 37 22 L 34 11 L 43 16 L 50 8 L 57 16 L 66 11 L 63 22 Z" fill="#FFC800" stroke="#B45309" stroke-width="1.5" stroke-linejoin="round"/>
          <circle cx="34" cy="10" r="2" fill="#EF4444"/>
          <circle cx="50" cy="7" r="2.5" fill="#38BDF8"/>
          <circle cx="66" cy="10" r="2" fill="#EF4444"/>
          <circle cx="43" cy="20" r="1.5" fill="#10B981"/>
          <circle cx="50" cy="19" r="1.8" fill="#EC4899"/>
          <circle cx="57" cy="20" r="1.5" fill="#10B981"/>
        </g>
      `
    },
    {
      id: 'snorkel',
      nameSv: 'Satun Snorkel & Dykmask',
      nameTh: 'แว่นดำน้ำ & สน็อคเกิลสตูล',
      satunDesc: 'พร้อมดำน้ำดูปะการังที่เกาะหลีเป๊ะ สดใสอันดามัน!',
      icon: '🤿',
      costGems: 80,
      svgOverlay: `
        <g class="accessory-snorkel">
          <rect x="33" y="32" width="34" height="12" rx="4.5" fill="rgba(56, 189, 248, 0.45)" stroke="#0284C7" stroke-width="2"/>
          <line x1="50" y1="32" x2="50" y2="44" stroke="#0284C7" stroke-width="1.5"/>
          <path d="M 64 38 L 71 38 L 71 18 Q 71 11 77 11" stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          <rect x="75" y="9" width="4" height="4" rx="1" fill="#EF4444"/>
        </g>
      `
    },
    {
      id: 'viking',
      nameSv: 'Nordisk Vikingahjälm',
      nameTh: 'หมวกไวกิ้งสวีเดน',
      satunDesc: 'หมวกเหล็กไวกิ้งโบราณ พร้อมเขาสองข้างสุดทรงพลัง!',
      icon: '🧙‍♂️',
      costGems: 120,
      svgOverlay: `
        <g class="accessory-viking">
          <path d="M 34 23 Q 50 11 66 23 Z" fill="#94A3B8" stroke="#475569" stroke-width="1.8"/>
          <rect x="33" y="21" width="34" height="4.5" rx="1.5" fill="#64748B"/>
          <circle cx="50" cy="23" r="2" fill="#FFC800"/>
          <path d="M 35 20 Q 25 15 21 8 Q 28 14 34 17 Z" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1"/>
          <path d="M 65 20 Q 75 15 79 8 Q 72 14 66 17 Z" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1"/>
        </g>
      `
    },
    {
      id: 'diamantaura',
      nameSv: 'Diamant-Aura & Stjärnor',
      nameTh: 'ออร่าเพชรประกายดาว (พรีเมียม)',
      satunDesc: 'ประกายดาววิบวับรอบตัว ระดับเพชรแท้สว่างไสว!',
      icon: '💎',
      costGems: 200,
      svgOverlay: `
        <g class="accessory-diamantaura">
          <circle cx="50" cy="40" r="28" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="3 3" fill="none" opacity="0.8"/>
          <circle cx="50" cy="50" r="42" stroke="#EC4899" stroke-width="1" stroke-dasharray="4 4" fill="none" opacity="0.45"/>
          <polygon points="50,4 52,10 58,12 52,14 50,20 48,14 42,12 48,10" fill="#38BDF8"/>
          <polygon points="22,25 24,29 28,30 24,31 22,35 20,31 16,30 20,29" fill="#FACC15"/>
          <polygon points="78,25 80,29 84,30 80,31 78,35 76,31 72,30 76,29" fill="#A855F7"/>
        </g>
      `
    },
    {
      id: 'guldstatyett',
      nameSv: 'Gyllene Mästare-Aura',
      nameTh: 'รัศมีทองคำแชมเปี้ยนสูงสุด',
      satunDesc: 'รางวัลสูงสุดแห่งเกียรติยศ สำหรับผู้พิชิตภาษาสวีเดน!',
      icon: '🏆',
      costGems: 350,
      svgOverlay: `
        <g class="accessory-goldchampion">
          <circle cx="50" cy="40" r="30" stroke="#FFC800" stroke-width="2.5" fill="none" opacity="0.85"/>
          <path d="M 44 8 L 50 1 L 56 8 L 50 4 Z" fill="#FFC800" stroke="#B45309" stroke-width="1"/>
          <circle cx="50" cy="1" r="3" fill="#EF4444"/>
          <circle cx="20" cy="45" r="3" fill="#FFC800"/>
          <circle cx="80" cy="45" r="3" fill="#FFC800"/>
        </g>
      `
    }
  ];

  /* ==========================================================================
     2. SPELBARA BOOSTERS & JUVEL-SINKS (LÖSER POÄNGINFLATIONEN PERMANENT)
     ========================================================================== */

  const SHOP_BOOSTERS = [
    {
      id: 'streak_freeze',
      nameSv: 'Streak-Freeze (Frys Streaken)',
      nameTh: 'น้ำแข็งกันสตรีคหลุด',
      satunDesc: 'ลืมเข้าเรียนวันไหน สตรีคก็ไม่หลุด! (เก็บได้สูงสุด 2 ชิ้น)',
      icon: '🛡️',
      costGems: 35
    },
    {
      id: 'double_xp',
      nameSv: 'Dubbel-XP Booster (30 min)',
      nameTh: 'บูสต์คะแนนคูณสอง (30 นาที)',
      satunDesc: 'รับ XP คูณ 2x ทุกบทเรียนและการแข่งขันท่องศัพท์!',
      icon: '⚡',
      costGems: 45
    },
    {
      id: 'mystery_box',
      nameSv: 'Lyckolåda / Gåvo-kista',
      nameTh: 'กล่องสุ่มนำโชค Nong Dala',
      satunDesc: 'ลุ้นรับเพชรโบนัสก้อนโต (+150 💎), XP มหาศาล หรือไอเทมลับ!',
      icon: '🎁',
      costGems: 50
    }
  ];

  /* ==========================================================================
     3. APPFÄRGTEMAN (6 STYCKEN, INKLUSIVE NORRSKEN & SUNSET)
     ========================================================================== */

  const APP_COLOR_THEMES = [
    {
      id: 'default',
      nameSv: 'Dala Solsken (Standard)',
      nameTh: 'สีครีมอบอุ่นดั้งเดิม',
      previewBg: 'linear-gradient(135deg, #FFFDF8 0%, #FEF3C7 100%)',
      costGems: 0,
      cssClass: ''
    },
    {
      id: 'andaman',
      nameSv: 'Satun Andaman Turkos',
      nameTh: 'ฟ้าทะเลอันดามันสตูล',
      previewBg: 'linear-gradient(135deg, #F0FDFA 0%, #BAE6FD 100%)',
      costGems: 35,
      cssClass: 'app-theme-andaman'
    },
    {
      id: 'sunset',
      nameSv: 'Satun Sunset Coral',
      nameTh: 'ส้มคอรัลพระอาทิตย์ตกหลีเป๊ะ',
      previewBg: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
      costGems: 70,
      cssClass: 'app-theme-sunset'
    },
    {
      id: 'rosegold',
      nameSv: 'Midnattssol Roséguld',
      nameTh: 'ชมพูโรสโกลด์พระอาทิตย์เที่ยงคืน',
      previewBg: 'linear-gradient(135deg, #FFF5F7 0%, #FBCFE8 100%)',
      costGems: 55,
      cssClass: 'app-theme-rosegold'
    },
    {
      id: 'dalarna',
      nameSv: 'Dalarna Skogsgrön',
      nameTh: 'เขียวธรรมชาติป่าสนสวีเดน',
      previewBg: 'linear-gradient(135deg, #F4FCE3 0%, #BBF7D0 100%)',
      costGems: 55,
      cssClass: 'app-theme-dalarna'
    },
    {
      id: 'aurora',
      nameSv: 'Nordic Aurora Borealis',
      nameTh: 'แสงเหนือออโรร่ายามค่ำคืน',
      previewBg: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)',
      costGems: 85,
      cssClass: 'app-theme-aurora'
    }
  ];

  /* ==========================================================================
     4. SAMLARALBUM & PRESTATIONSMÄRKEN (8 ST BADGES)
     ========================================================================== */

  const COLLECTIBLE_BADGES = [
    {
      id: 'first_lesson',
      nameSv: 'Första Steget (25 XP)',
      nameTh: 'ก้าวแรกสู่สวีเดน',
      icon: '🥇',
      target: 25,
      rewardGems: 25,
      checkUnlocked: (state, sm) => (sm.state.totalXP || 0) >= 25
    },
    {
      id: 'sprint_50',
      nameSv: 'Blixt-Sprintern (65 XP)',
      nameTh: 'สปรินเตอร์สายฟ้า',
      icon: '⚡',
      target: 65,
      rewardGems: 30,
      checkUnlocked: (state) => (state.sprint60BestScore || 0) >= 65
    },
    {
      id: 'voice_master',
      nameSv: 'Guld-Rösten (Guld/Diamant)',
      nameTh: 'เสียงทองคำไมโครโฟน',
      icon: '🎙️',
      target: 5,
      rewardGems: 35,
      checkUnlocked: (state) => ['Guld', 'Diamant'].includes(state.pronunChallengeBestTier)
    },
    {
      id: 'streak_3',
      nameSv: 'Eld-Mästaren (7 Dagar)',
      nameTh: 'ผู้พิทักษ์เปลวไฟ 7 วัน',
      icon: '🔥',
      target: 7,
      rewardGems: 40,
      checkUnlocked: (state, sm) => (sm.state.streakDays || 1) >= 7
    },
    {
      id: 'boss_slayer',
      nameSv: 'Boss-Besegraren (3 Bossar)',
      nameTh: 'ผู้พิชิตบอสประจำหมวด',
      icon: '👑',
      target: 3,
      rewardGems: 45,
      checkUnlocked: (state) => Object.keys(state.bossClearedThemes || {}).length >= 3
    },
    {
      id: 'vocab_30',
      nameSv: 'Ordförråds-Mästaren (50 Ord)',
      nameTh: 'เซียนคลังคำศัพท์ 50 คำ',
      icon: '📚',
      target: 50,
      rewardGems: 40,
      checkUnlocked: (state, sm) => Object.keys(sm.state.srsData || {}).length >= 50
    },
    {
      id: 'fashionista',
      nameSv: 'Mode-Ikonen (4 Accessoarer)',
      nameTh: 'เจ้าแม่แฟชั่นสตูล',
      icon: '🛍️',
      target: 4,
      rewardGems: 35,
      checkUnlocked: (state) => (state.ownedAccessories || []).length >= 4
    },
    {
      id: 'gem_collector',
      nameSv: 'Juvel-Samlaren (300 💎)',
      nameTh: 'เศรษฐีเพชร 300 เม็ด',
      icon: '💎',
      target: 300,
      rewardGems: 60,
      checkUnlocked: (state, sm) => (sm.state.gems || 0) >= 300
    }
  ];

  window.GameEngine = Object.assign(window.GameEngine || {}, {
    MASCOT_ACCESSORIES,
    SHOP_BOOSTERS,
    APP_COLOR_THEMES,
    COLLECTIBLE_BADGES
  });

  function createDailyQuestsTemplate(dateKey) {
    return {
      dateKey,
      items: {
        speak_5: {
          id: 'speak_5',
          icon: '🎙️',
          titleSv: 'Säg 8 svenska ord/meningar högt',
          titleTh: 'ฝึกพูดภาษาสวีเดนใส่ไมโครโฟน 8 ครั้ง',
          progress: 0,
          target: 8,
          rewardGems: 30,
          claimed: false
        },
        combo_3: {
          id: 'combo_3',
          icon: '🔥',
          titleSv: 'Få 5 rätt i rad (5x Combo)',
          titleTh: 'ตอบถูกติดต่อกัน 5 ข้อรวด (Combo 5x)',
          progress: 0,
          target: 5,
          rewardGems: 25,
          claimed: false
        },
        train_15min: {
          id: 'train_15min',
          icon: '⏱️',
          titleSv: 'Träna i 15 minuter',
          titleTh: 'ใช้เวลาฝึกภาษาสวีเดนครบ 15 นาทีวันนี้',
          progress: 0,
          target: 15,
          rewardGems: 40,
          claimed: false
        }
      }
    };
  }

  /* ==========================================================================
     5. PART 5 STATE & PERSISTENS
     ========================================================================== */

  const Part5State = {
    data: null,
    _trainingTimer: null,

    getTodayIso() {
      return new Date().toISOString().slice(0, 10);
    },

    load() {
      const today = this.getTodayIso();
      const defaults = {
        welcomeCompleted: false,
        sprint60BestScore: 0,
        sprint60BestWords: 0,
        pronunChallengeBestTier: 'Brons',
        pronunChallengeBestScore: 0,
        bossClearedThemes: {},
        ownedAccessories: ['midsommar'],
        equippedAccessory: 'midsommar',
        ownedColorThemes: ['default'],
        activeColorTheme: 'default',
        streakFreezesCount: 1, // Startgåva: 1 st frys!
        doubleXpActiveUntil: 0,
        claimedBadges: [],
        dailyQuestsData: createDailyQuestsTemplate(today),
        activeSecondsDate: today,
        activeSecondsCount: 0,
        vocabFilter: 'all',
        vocabSearchQuery: ''
      };

      try {
        const raw = localStorage.getItem(GAME_ENGINE_STORAGE_KEY);
        if (!raw) {
          this.data = defaults;
          this.save();
        } else {
          const parsed = JSON.parse(raw);
          this.data = {
            ...defaults,
            ...parsed,
            bossClearedThemes: { ...defaults.bossClearedThemes, ...(parsed.bossClearedThemes || {}) },
            ownedAccessories: Array.isArray(parsed.ownedAccessories)
              ? parsed.ownedAccessories
              : defaults.ownedAccessories,
            ownedColorThemes: Array.isArray(parsed.ownedColorThemes)
              ? parsed.ownedColorThemes
              : defaults.ownedColorThemes,
            claimedBadges: Array.isArray(parsed.claimedBadges)
              ? parsed.claimedBadges
              : defaults.claimedBadges
          };

          if (!this.data.dailyQuestsData || this.data.dailyQuestsData.dateKey !== today) {
            this.data.dailyQuestsData = createDailyQuestsTemplate(today);
            this.data.activeSecondsDate = today;
            this.data.activeSecondsCount = 0;
            this.save();
          } else {
            if (this.data.dailyQuestsData.items?.train_3min && !this.data.dailyQuestsData.items?.train_15min) {
              const old = this.data.dailyQuestsData.items.train_3min;
              delete this.data.dailyQuestsData.items.train_3min;
              this.data.dailyQuestsData.items.train_15min = {
                id: 'train_15min',
                icon: '⏱️',
                titleSv: 'Träna i 15 minuter',
                titleTh: 'ใช้เวลาฝึกภาษาสวีเดนครบ 15 นาทีวันนี้',
                progress: Math.min(15, old.progress || 0),
                target: 15,
                rewardGems: 40,
                claimed: false
              };
              this.save();
            }
          }
        }
      } catch (_) {
        this.data = defaults;
      }

      this.applyColorTheme(this.data.activeColorTheme);
      this.startDailyTrainingClock();
    },

    save() {
      try {
        localStorage.setItem(GAME_ENGINE_STORAGE_KEY, JSON.stringify(this.data));
        const sm = window.GameEngine?.StateManager;
        if (sm && sm.state && sm.state.competition) {
          sm.state.competition.quests = this.data.dailyQuestsData.items;
          sm.save();
        }
      } catch (_) {}
    },

    isDoubleXpActive() {
      return Boolean(this.data?.doubleXpActiveUntil && this.data.doubleXpActiveUntil > Date.now());
    },

    applyColorTheme(themeId) {
      this.data.activeColorTheme = themeId;
      document.body.classList.remove(
        'app-theme-andaman',
        'app-theme-rosegold',
        'app-theme-dalarna',
        'app-theme-aurora',
        'app-theme-sunset'
      );
      const found = APP_COLOR_THEMES.find((t) => t.id === themeId);
      if (found && found.cssClass) {
        document.body.classList.add(found.cssClass);
      }
      this.save();
    },

    startDailyTrainingClock() {
      if (this._trainingTimer) clearInterval(this._trainingTimer);
      this._trainingTimer = setInterval(() => {
        if (document.hidden) return;
        this.data.activeSecondsCount = (this.data.activeSecondsCount || 0) + 5;
        const minutesDone = Math.min(15, Math.floor(this.data.activeSecondsCount / 60));
        const q = this.data.dailyQuestsData?.items?.train_15min || this.data.dailyQuestsData?.items?.train_3min;
        if (q && minutesDone > q.progress) {
          q.progress = minutesDone;
          this.save();
          if (document.getElementById('view-compete')?.classList.contains('active-view')) {
            CompeteAndShopUI.renderCompeteArena();
          }
        }
      }, 5000);
    },

    incrementQuest(questId, amount = 1) {
      const q = this.data?.dailyQuestsData?.items?.[questId];
      if (!q) return;
      const prev = q.progress;
      q.progress = Math.min(q.target, q.progress + amount);
      if (q.progress !== prev) {
        this.save();
      }
    },

    setQuestMaxProgress(questId, value) {
      const q = this.data?.dailyQuestsData?.items?.[questId];
      if (!q) return;
      const next = Math.min(q.target, Math.max(q.progress, value));
      if (next !== q.progress) {
        q.progress = next;
        this.save();
      }
    }
  };

  /* ==========================================================================
     6. MASKOT-GARDEROB INJEKTION
     ========================================================================== */

  function hookMascotWardrobe() {
    if (!window.VisualEngine || !window.VisualEngine.Mascot) return;
    const origGetSVG = window.VisualEngine.Mascot.getSVG.bind(window.VisualEngine.Mascot);

    window.VisualEngine.Mascot.getSVG = function (size = 110, state = 'idle') {
      const rawSvg = origGetSVG(size, state);
      const eqId = Part5State.data?.equippedAccessory;
      if (!eqId) return rawSvg;
      const acc = MASCOT_ACCESSORIES.find((a) => a.id === eqId);
      if (!acc) return rawSvg;

      // Injicera accessoaren inuti kroppsgruppen på Nong Dala
      return rawSvg.replace(
        /<\/g>\s*<\/svg>\s*$/,
        `  <g class="dala-equipped-accessory">${acc.svgOverlay}</g>\n        </g>\n      </svg>`
      );
    };
  }

  /* ==========================================================================
     7. TÄVLINGSLÄGEN
     ========================================================================== */

  const ArenaModes = {
    sprint60Timer: null,
    sprint60Remaining: 60,
    sprint60ScoreXP: 0,
    sprint60CorrectCount: 0,
    sprint60ComboCount: 0,
    sprint60Active: false,

    startSnabbSprinten60() {
      const allItems = window.ContentDB.getAllItems();
      const shuffled = [...allItems].sort(() => Math.random() - 0.5);
      const qGen = window.GameEngine.QuestionGenerator;
      const lessonCtrl = window.GameEngine.LessonController;

      const queue = [];
      for (let i = 0; i < 45; i++) {
        const item = shuffled[i % shuffled.length];
        if (i % 4 === 2) {
          queue.push(qGen.createPronunciation(item));
        } else if (i % 2 === 0) {
          queue.push(qGen.createImageChoice(item, allItems));
        } else {
          queue.push(qGen.createListenUnderstand(item, allItems));
        }
      }

      this.sprint60Remaining = 60;
      this.sprint60ScoreXP = 0;
      this.sprint60CorrectCount = 0;
      this.sprint60ComboCount = 0;
      this.sprint60Active = true;

      if (this.sprint60Timer) clearInterval(this.sprint60Timer);

      lessonCtrl.launchCustomLesson('all', queue, { isSnabbSprint60: true });

      this.sprint60Timer = setInterval(() => {
        if (!this.sprint60Active) {
          clearInterval(this.sprint60Timer);
          return;
        }
        this.sprint60Remaining -= 1;
        this.updateSprint60HUD(false);

        if (this.sprint60Remaining <= 0) {
          clearInterval(this.sprint60Timer);
          this.sprint60Active = false;
          this.finishSnabbSprinten60();
        }
      }, 1000);

      this.injectSprint60HUD();
    },

    getComboMultiplier(comboStreak) {
      if (comboStreak >= 6) return 5;
      if (comboStreak >= 4) return 3;
      if (comboStreak >= 2) return 2;
      return 1;
    },

    injectSprint60HUD(showPlus2Sec = false) {
      const stage = document.getElementById('lesson-stage');
      if (!stage || !this.sprint60Active) return;

      let hud = document.getElementById('sprint60-live-hud');
      if (!hud) {
        hud = document.createElement('div');
        hud.id = 'sprint60-live-hud';
        hud.className = 'sprint60-hud';
        stage.prepend(hud);
      }

      const mult = this.getComboMultiplier(this.sprint60ComboCount);
      hud.innerHTML = `
        <div class="sprint60-timer-pill">
          <span>⏱️ <span id="sprint60-sec-text">${this.sprint60Remaining}</span>s</span>
          ${showPlus2Sec ? `<span class="bonus-time-badge">+2s ⚡</span>` : ''}
        </div>
        <div style="font-weight: 900; font-size: 0.88rem; color: var(--emerald-dark);">
          ✅ ${this.sprint60CorrectCount} rätt • ⭐ ${this.sprint60ScoreXP} XP
        </div>
        <div class="satun-badge" style="background: var(--gold-soft); color: #92400E; border-color: var(--gold);">
          🔥 Combo ${mult}x XP
        </div>
      `;

      const comboPill = document.getElementById('lesson-combo-pill');
      if (comboPill) comboPill.textContent = `🔥 ${mult}x`;
    },

    updateSprint60HUD(showPlus2Sec = false) {
      const secEl = document.getElementById('sprint60-sec-text');
      if (secEl && !showPlus2Sec) {
        secEl.textContent = String(Math.max(0, this.sprint60Remaining));
      } else {
        this.injectSprint60HUD(showPlus2Sec);
      }
    },

    finishSnabbSprinten60() {
      this.sprint60Active = false;
      if (this.sprint60Timer) clearInterval(this.sprint60Timer);
      window.SpeechEngine?.stopListening?.();

      const lessonCtrl = window.GameEngine.LessonController;
      lessonCtrl.hideFeedbackSheet();
      document.getElementById('lesson-bottom-bar').style.display = 'none';

      const prevBest = Part5State.data.sprint60BestScore || 0;
      const isNewRecord = this.sprint60ScoreXP > prevBest;
      if (isNewRecord) Part5State.data.sprint60BestScore = this.sprint60ScoreXP;
      if (this.sprint60CorrectCount > (Part5State.data.sprint60BestWords || 0)) {
        Part5State.data.sprint60BestWords = this.sprint60CorrectCount;
      }
      Part5State.save();

      const sm = window.GameEngine.StateManager;
      sm.addGems(15);
      sm.save();

      window.SpeechEngine?.playSound('fanfare');
      window.VisualEngine?.triggerConfetti();

      const stage = document.getElementById('lesson-stage');
      if (!stage) return;

      stage.innerHTML = `
        <div style="text-align: center; padding: 18px 8px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <div class="trophy-hero-anim">${window.VisualEngine.getTrophySVG(86)}</div>
          <span class="satun-badge" style="font-size: 0.9rem;">
            ${isNewRecord ? '🎉 NYTT REKORD! • ทำลายสถิติใหม่ หรอยจังฮู้!' : '⚡ Snabb-Sprinten Klar!'}
          </span>
          <h2 style="font-size: 1.6rem; font-weight: 900; color: var(--emerald-dark);">
            ${this.sprint60ScoreXP} XP på 60 sekunder!
          </h2>
          <p class="th-text" style="color: var(--text-secondary); font-size: 0.94rem;">
            คุณตอบถูกทั้งหมด <strong>${this.sprint60CorrectCount} ข้อ</strong> พร้อมโบนัสเวลา +2 วินาทีต่อข้อ!
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; margin: 6px 0;">
            <div class="arena-card" style="margin: 0; text-align: center; background: var(--gold-soft); border-color: var(--gold);">
              <div style="font-size: 0.76rem; font-weight: 800; color: var(--gold-deep);">PERSONBÄSTA</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: #78350F;">🏆 ${Part5State.data.sprint60BestScore} XP</div>
            </div>
            <div class="arena-card" style="margin: 0; text-align: center; background: var(--emerald-soft); border-color: var(--emerald);">
              <div style="font-size: 0.76rem; font-weight: 800; color: var(--emerald-dark);">BELÖNING</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: var(--emerald-dark);">+15 💎</div>
            </div>
          </div>
          <div style="display: flex; gap: 10px; width: 100%; margin-top: 8px;">
            <button type="button" class="btn-3d btn-yellow" id="btn-replay-sprint60" style="flex: 1;">
              🔄 Kör igen
            </button>
            <button type="button" class="btn-3d btn-green" id="btn-close-sprint60" style="flex: 1;">
              ✅ Tillbaka
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-replay-sprint60')?.addEventListener('click', () => this.startSnabbSprinten60());
      document.getElementById('btn-close-sprint60')?.addEventListener('click', () => lessonCtrl.closeLesson());
    },

    startUttalsUtmaningen() {
      const allItems = window.ContentDB.getAllItems();
      const words = allItems.filter((i) => i.kind === 'word').sort(() => Math.random() - 0.5);
      const sentences = allItems.filter((i) => i.kind === 'sentence').sort(() => Math.random() - 0.5);
      const selected = [...words.slice(0, 5), ...sentences.slice(0, 5)];
      const qGen = window.GameEngine.QuestionGenerator;
      const queue = selected.map((item) => qGen.createPronunciation(item));

      window.GameEngine.LessonController.launchCustomLesson('all', queue, {
        isPronunciationChallenge: true
      });
    },

    getStarTierInfo(completedCount) {
      if (completedCount >= 9) return { id: 'Diamant', icon: '💎', labelSv: 'Diamant-Stjärna' };
      if (completedCount >= 6) return { id: 'Guld', icon: '🥇', labelSv: 'Guld-Stjärna' };
      if (completedCount >= 3) return { id: 'Silver', icon: '🥈', labelSv: 'Silver-Stjärna' };
      return { id: 'Brons', icon: '🥉', labelSv: 'Brons-Stjärna' };
    },

    injectPronunStarMeter(completedCount) {
      const stage = document.getElementById('lesson-stage');
      if (!stage) return;
      const tier = this.getStarTierInfo(completedCount);
      const card = document.createElement('div');
      card.className = 'pronun-star-meter-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: 900; font-size: 0.9rem; color: #1E3A8A; display: flex; align-items: center; gap: 6px;">
            <span class="stat-icon-svg" style="width: 20px; height: 20px;">${window.VisualEngine.getMedalSVG(tier.id, 20)}</span>
            <span>Svenska Uttals-Stjärna: ${tier.labelSv}</span>
          </div>
          <span style="font-size: 0.78rem; font-weight: 800; color: var(--sky-dark);">
            Fråga ${Math.min(10, completedCount + 1)} / 10
          </span>
        </div>
        <div class="star-tiers-row">
          <div class="star-tier-step ${completedCount >= 0 ? 'reached' : ''}">
            <span class="stat-icon-svg" style="width: 16px; height: 16px; vertical-align: middle;">${window.VisualEngine.getMedalSVG('brons', 16)}</span> Brons
          </div>
          <div class="star-tier-step ${completedCount >= 3 ? 'reached' : ''}">
            <span class="stat-icon-svg" style="width: 16px; height: 16px; vertical-align: middle;">${window.VisualEngine.getMedalSVG('silver', 16)}</span> Silver
          </div>
          <div class="star-tier-step ${completedCount >= 6 ? 'reached' : ''}">
            <span class="stat-icon-svg" style="width: 16px; height: 16px; vertical-align: middle;">${window.VisualEngine.getMedalSVG('guld', 16)}</span> Guld
          </div>
          <div class="star-tier-step ${completedCount >= 9 ? 'reached' : ''}">
            <span class="stat-icon-svg" style="width: 16px; height: 16px; vertical-align: middle;">${window.VisualEngine.getMedalSVG('diamant', 16)}</span> Diamant
          </div>
        </div>
      `;
      stage.prepend(card);
    },

    startThemeBoss(themeId) {
      const theme = window.ContentDB.getThemeById(themeId) || window.ContentDB.getThemes()[0];
      const themeItems = window.ContentDB.getItemsByTheme(theme.id);
      const allItems = window.ContentDB.getAllItems();
      const qGen = window.GameEngine.QuestionGenerator;
      const shuffled = [...themeItems].sort(() => Math.random() - 0.5);
      const queue = [];

      for (let i = 0; i < 10; i++) {
        const item = shuffled[i % shuffled.length];
        if (i % 4 === 0) queue.push(qGen.createListenUnderstand(item, allItems));
        else if (i % 4 === 1) queue.push(qGen.createSentenceBuilder(item, allItems));
        else if (i % 4 === 2) queue.push(qGen.createPronunciation(item));
        else queue.push(qGen.createImageChoice(item, allItems));
      }

      window.VisualEngine?.Mascot?.setState('streak_fire');
      window.VisualEngine?.Mascot?.say(
        `👑 Tema-Boss: ${theme.titleSv}! 10 frågor – du klarar det!`,
        `มาลุยบอสประจำหมวด "${theme.titleTh}" กันตะเอง! 10 ข้อรับเหรียญทอง!`,
        'encourage',
        4500
      );

      window.GameEngine.LessonController.launchCustomLesson(theme.id, queue, {
        isThemeBoss: true,
        bossTheme: theme
      });
    },

    injectThemeBossHeader(theme, questionNumber) {
      const stage = document.getElementById('lesson-stage');
      if (!stage || !theme) return;
      const banner = document.createElement('div');
      banner.className = 'sprint60-hud';
      banner.style.background = 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)';
      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 1.4rem;">👑</span>
          <div>
            <div style="font-weight: 900; font-size: 0.88rem; color: #78350F;">
              TEMA-BOSS: ${theme.titleSv}
            </div>
            <div class="th-text" style="font-size: 0.76rem; color: #92400E;">
              ด่านบอสชิงเหรียญทอง • ข้อที่ ${questionNumber} / 10
            </div>
          </div>
        </div>
        <span class="satun-badge" style="background: #fff; color: #78350F; border-color: #F59E0B;">
          🏅 Guld-prov
        </span>
      `;
      stage.prepend(banner);
    }
,

    startCultureMaster() {
      const allItems = window.ContentDB.getAllItems();
      const conceptItems = allItems.filter((i) => i.type === 'concept');
      const dialogItems = allItems.filter((i) => i.id && i.id.startsWith('dialog_'));
      const pool = conceptItems.length || dialogItems.length ? [...conceptItems, ...dialogItems] : allItems;
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const qGen = window.GameEngine.QuestionGenerator;
      const lessonCtrl = window.GameEngine.LessonController;

      const queue = [];
      for (let i = 0; i < 10; i++) {
        const item = shuffled[i % shuffled.length];
        if (i % 3 === 0 && qGen.createConceptQuestion) {
          queue.push(qGen.createConceptQuestion(item, allItems));
        } else if (i % 3 === 1 && qGen.createDialogueQuestion) {
          queue.push(qGen.createDialogueQuestion(item, allItems));
        } else if (qGen.createClozeQuestion) {
          queue.push(qGen.createClozeQuestion(item, allItems));
        } else {
          queue.push(qGen.createImageChoice(item, allItems));
        }
      }

      window.VisualEngine?.Mascot?.setState('celebrating');
      window.VisualEngine?.Mascot?.say(
        `🇸🇪 Begrepps-Mästaren! 10 frågor om svensk vardag och kultur!`,
        `ท้าดวล 10 คำศัพท์และวัฒนธรรมสวีเดนที่ใช้จริงในชีวิตประจำวัน!`,
        'happy',
        4000
      );

      lessonCtrl.launchCustomLesson('all', queue, { isCultureMaster: true });
    },

    startSpeedWordMatch() {
      const allItems = window.ContentDB.getAllItems();
      const qGen = window.GameEngine.QuestionGenerator;
      const lessonCtrl = window.GameEngine.LessonController;

      const queue = [];
      for (let i = 0; i < 3; i++) {
        queue.push(qGen.createMatchingSprintQuestion(allItems, allItems));
      }

      window.VisualEngine?.Mascot?.say(
        `⚡ Ordjakten! Para ihop alla ord så snabbt du kan!`,
        `จับคู่คำศัพท์ให้เร็วที่สุด ทำลายสถิติเวลากันต๊ะ!`,
        'encourage',
        3500
      );

      lessonCtrl.launchCustomLesson('all', queue, { isSpeedMatch: true });
    }
  };

  window.GameEngine = Object.assign(window.GameEngine || {}, {
    Part5State,
    ArenaModes
  });

  /* ==========================================================================
     8. KOPPLA LEKTIONSMOTORN TILL DOUBLE-XP & TÄVLINGAR
     ========================================================================== */

  function hookLessonController() {
    const lessonCtrl = window.GameEngine?.LessonController;
    const stateMgr = window.GameEngine?.StateManager;
    if (!lessonCtrl || !stateMgr) return;

    // Koppla Dubbel-XP Booster så den multiplicerar intjänad XP automatiskt
    const origAddXP = stateMgr.addXP.bind(stateMgr);
    stateMgr.addXP = function (amount) {
      const isDouble = Part5State.isDoubleXpActive();
      const finalXP = isDouble ? amount * 2 : amount;
      origAddXP(finalXP);
      if (isDouble) {
        window.VisualEngine?.Mascot?.say(
          `⚡ 2x XP Aktiv! Du fick +${finalXP} XP!`,
          `พลังคูณสองทำงาน! รับคะแนนดับเบิ้ล +${finalXP} แต้ม!`,
          'happy',
          2500
        );
      }
    };

    const origRenderCurrent = lessonCtrl.renderCurrentQuestion.bind(lessonCtrl);
    lessonCtrl.renderCurrentQuestion = function () {
      if (this.options?.isSnabbSprint60 && !ArenaModes.sprint60Active) {
        ArenaModes.finishSnabbSprinten60();
        return;
      }
      origRenderCurrent();
      if (this.currentIndex < this.queue.length) {
        if (this.options?.isSnabbSprint60) {
          ArenaModes.injectSprint60HUD(false);
        } else if (this.options?.isPronunciationChallenge) {
          ArenaModes.injectPronunStarMeter(this.currentIndex);
        } else if (this.options?.isThemeBoss) {
          ArenaModes.injectThemeBossHeader(this.options.bossTheme, this.currentIndex + 1);
        }
      }
    };

    const origCheckAnswer = lessonCtrl.checkCurrentAnswer.bind(lessonCtrl);
    lessonCtrl.checkCurrentAnswer = function () {
      const q = this.queue[this.currentIndex];
      if (!q) return;
      origCheckAnswer();

      const sheet = document.getElementById('feedback-sheet');
      const wasCorrect = sheet && sheet.classList.contains('state-correct');

      if (wasCorrect) {
        Part5State.setQuestMaxProgress('combo_3', this.combo);
        if (q.type === 'pronunciation') {
          Part5State.incrementQuest('speak_5', 1);
        }
        if (this.options?.isSnabbSprint60 && ArenaModes.sprint60Active) {
          ArenaModes.sprint60ComboCount += 1;
          ArenaModes.sprint60CorrectCount += 1;
          ArenaModes.sprint60Remaining += 2;
          const mult = ArenaModes.getComboMultiplier(ArenaModes.sprint60ComboCount);
          const bonusXP = 10 * mult;
          ArenaModes.sprint60ScoreXP += bonusXP;
          stateMgr.addXP(bonusXP);
          ArenaModes.injectSprint60HUD(true);
        }
      } else if (this.options?.isSnabbSprint60) {
        ArenaModes.sprint60ComboCount = 0;
        ArenaModes.injectSprint60HUD(false);
      }
    };

    const origCloseLesson = lessonCtrl.closeLesson.bind(lessonCtrl);
    lessonCtrl.closeLesson = function () {
      ArenaModes.sprint60Active = false;
      if (ArenaModes.sprint60Timer) clearInterval(ArenaModes.sprint60Timer);
      origCloseLesson();
    };

    const origRenderComplete = lessonCtrl.renderLessonComplete.bind(lessonCtrl);
    lessonCtrl.renderLessonComplete = function () {
      if (this.options?.isSnabbSprint60) {
        ArenaModes.finishSnabbSprinten60();
        return;
      }
      if (this.options?.isPronunciationChallenge) {
        Part5State.data.pronunChallengeBestTier = 'Diamant';
        Part5State.data.pronunChallengeBestScore = 10;
        Part5State.save();
        stateMgr.addGems(25);
        window.SpeechEngine?.playSound('fanfare');
        window.VisualEngine?.triggerConfetti();

        const fill = document.getElementById('lesson-progress-fill');
        if (fill) fill.style.width = '100%';
        document.getElementById('lesson-bottom-bar').style.display = 'none';

        const stage = document.getElementById('lesson-stage');
        stage.innerHTML = `
          <div style="text-align: center; padding: 20px 10px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div class="trophy-hero-anim">${window.VisualEngine.Library.gem(86)}</div>
            <span class="satun-badge">🎙️ Svenska Uttals-Stjärna: DIAMANT!</span>
            <h2 style="font-size: 1.6rem; font-weight: 900; color: var(--sky-dark);">
              10 av 10 Uttal Klara!
            </h2>
            <p class="th-text" style="color: var(--text-secondary); font-size: 0.95rem;">
              หรอยจังฮู้! ดาวการออกเสียงเติบโตถึงระดับ <strong>Diamant (เพชรแท้)</strong> สำเนียงเป๊ะมาก!
            </p>
            <div class="arena-card" style="width: 100%; text-align: center; background: var(--gold-soft); border-color: var(--gold);">
              <div style="font-weight: 900; font-size: 1.3rem; color: #78350F; display: flex; align-items: center; justify-content: center; gap: 6px;">
                +25 <span class="stat-icon-svg" style="width: 22px; height: 22px;">${window.VisualEngine.getStatIconSVG('gem', 22)}</span> Juveler & +${this.sessionXP} <span class="stat-icon-svg" style="width: 22px; height: 22px;">${window.VisualEngine.getStatIconSVG('xp', 22)}</span> XP
              </div>
            </div>
            <button type="button" class="btn-3d btn-green w-full" id="btn-finish-pronun-challenge">
              TILLBAKA • กลับหน้าแข่งขัน
            </button>
          </div>
        `;
        document.getElementById('btn-finish-pronun-challenge')?.addEventListener('click', () => this.closeLesson());
        return;
      }

      if (this.options?.isThemeBoss && this.options?.bossTheme) {
        const bossTheme = this.options.bossTheme;
        Part5State.data.bossClearedThemes[bossTheme.id] = {
          cleared: true,
          bestScore: 10,
          date: Part5State.getTodayIso()
        };
        stateMgr.state.themeStars[bossTheme.id] = 3;
        stateMgr.addGems(30);
        Part5State.save();

        window.SpeechEngine?.playSound('fanfare');
        window.VisualEngine?.triggerConfetti();

        const fill = document.getElementById('lesson-progress-fill');
        if (fill) fill.style.width = '100%';
        document.getElementById('lesson-bottom-bar').style.display = 'none';

        const stage = document.getElementById('lesson-stage');
        stage.innerHTML = `
          <div style="text-align: center; padding: 20px 10px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
            <div class="trophy-hero-anim">${window.VisualEngine.Library.crown()}</div>
            <span class="satun-badge" style="background: var(--gold-soft); color: #78350F; border-color: var(--gold);">
              🏅 GULD-MÄRKE UPPLÅST!
            </span>
            <h2 style="font-size: 1.55rem; font-weight: 900; color: #92400E;">
              Tema-Boss Besegrad: ${bossTheme.titleSv}!
            </h2>
            <div class="arena-card" style="margin: 0; text-align: center; background: var(--emerald-soft); border-color: var(--emerald); width: 100%;">
              <div style="font-size: 1.25rem; font-weight: 900; color: var(--emerald-dark); display: flex; align-items: center; justify-content: center; gap: 6px;">
                +30 <span class="stat-icon-svg" style="width: 22px; height: 22px;">${window.VisualEngine.getStatIconSVG('gem', 22)}</span> Juveler & Guld-Märke
              </div>
            </div>
            <button type="button" class="btn-3d btn-green w-full" id="btn-finish-boss-lesson" style="margin-top: 6px;">
              FORTSÄTT • กลับสู่แอป
            </button>
          </div>
        `;
        document.getElementById('btn-finish-boss-lesson')?.addEventListener('click', () => this.closeLesson());
        return;
      }

      origRenderComplete();
    };
  }

  /* ==========================================================================
     9. BELÖNINGSBUTIK, BOOSTERS, SAMLARALBUM & RENDERING
     ========================================================================== */

  const CompeteAndShopUI = {
    selectedBossThemeId: 'greetings',

    renderCompeteArena() {
      const competeSection = document.getElementById('view-compete');
      if (!competeSection) return;

      const sm = window.GameEngine.StateManager;
      const gems = sm.state.gems || 0;
      const sprintBest = Math.max(Part5State.data.sprint60BestScore || 0, sm.state.competition.highScoreAttack || 0);
      const starTier = Part5State.data.pronunChallengeBestTier || 'Brons';
      const themes = window.ContentDB.getThemes();
      const clearedBossCount = Object.keys(Part5State.data.bossClearedThemes || {}).length;
      const isDoubleXp = Part5State.isDoubleXpActive();
      const freezes = Part5State.data.streakFreezesCount || 0;

      const questsObj = Part5State.data.dailyQuestsData?.items || {};

      competeSection.innerHTML = `
        <div class="section-header" style="margin-bottom: 12px;">
          <div>
            <h2 class="section-title" style="font-size: 1.25rem;">🏆 Tävlingar, Boosters & Garderob</h2>
            <p class="section-subtitle">ท้าดวล 3 รูปแบบ • ไอเทมบูสเตอร์ • ร้านแต่งตัว & เหรียญรางวัล</p>
          </div>
          <div style="display: flex; gap: 6px;">
            ${isDoubleXp ? `<span class="satun-badge" style="background: #FEF08A; color: #854D0E;">⚡ 2x XP</span>` : ''}
            <span class="satun-badge" style="font-size: 0.85rem;">💎 ${gems}</span>
          </div>
        </div>

        <!-- 1. TÄVLINGSLÄGE A: SNABB-SPRINTEN -->
        <div class="arena-card" style="border-color: var(--sky); background: linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%);">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--sky-soft); color: var(--sky-dark);">${window.VisualEngine.getArenaIconSVG('sprint')}</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: 900; font-size: 1.05rem;">1. Snabb-Sprinten (60 sekunder)</h3>
                <span class="satun-badge">+2s & 5x Combo</span>
              </div>
              <p class="th-text" style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 2px;">
                ตอบคำศัพท์และฝึกพูดให้ได้มากที่สุดใน 60 วินาที! ตอบถูกรับโบนัสเวลา <strong>+2 วินาที</strong> และตัวคูณคะแนน <strong>2x, 3x, 5x XP</strong>
              </p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.84rem; font-weight: 800; color: var(--text-secondary);">
            <span>🏆 Personbästa (Highscore):</span>
            <span style="color: #B45309; font-weight: 900;">${sprintBest} XP (${Part5State.data.sprint60BestWords || 0} rätt)</span>
          </div>
          <button type="button" class="btn-3d btn-blue w-full" id="btn-start-sprint60">
            ⚡ Starta Snabb-Sprinten (60s) • เริ่มเลย!
          </button>
        </div>

        <!-- 2. TÄVLINGSLÄGE B: UTTALS-UTMANINGEN -->
        <div class="arena-card" style="border-color: var(--emerald); background: linear-gradient(135deg, #FFFFFF 0%, #F0FDF4 100%);">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--emerald-soft); color: var(--emerald-dark);">${window.VisualEngine.getArenaIconSVG('voice')}</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: 900; font-size: 1.05rem;">2. Uttals-Utmaningen (10 Röst-kort)</h3>
                <span class="satun-badge">🌟 ${starTier}</span>
              </div>
              <p class="th-text" style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 2px;">
                พูดคำและประโยคสวีเดน 10 ข้อรวดด้วยไมโครโฟน! เติบโตจาก <strong>Brons ➔ Silver ➔ Guld ➔ Diamant</strong>
              </p>
            </div>
          </div>
          <div class="star-tiers-row" style="margin-bottom: 10px;">
            <div class="star-tier-step reached">
              <span class="stat-icon-svg" style="width: 16px; height: 16px; vertical-align: middle;">${window.VisualEngine.getMedalSVG('brons', 16)}</span> Brons
            </div>
            <div class="star-tier-step ${['Silver', 'Guld', 'Diamant'].includes(starTier) ? 'reached' : ''}">
              <span class="stat-icon-svg" style="width: 16px; height: 16px; vertical-align: middle;">${window.VisualEngine.getMedalSVG('silver', 16)}</span> Silver
            </div>
            <div class="star-tier-step ${['Guld', 'Diamant'].includes(starTier) ? 'reached' : ''}">
              <span class="stat-icon-svg" style="width: 16px; height: 16px; vertical-align: middle;">${window.VisualEngine.getMedalSVG('guld', 16)}</span> Guld
            </div>
            <div class="star-tier-step ${starTier === 'Diamant' ? 'reached' : ''}">
              <span class="stat-icon-svg" style="width: 16px; height: 16px; vertical-align: middle;">${window.VisualEngine.getMedalSVG('diamant', 16)}</span> Diamant
            </div>
          </div>
          <button type="button" class="btn-3d btn-green w-full" id="btn-start-pronun-challenge">
            🎙️ Starta Uttals-Utmaningen • ท้าดวลไมค์
          </button>
        </div>

        <!-- 3. TÄVLINGSLÄGE C: TEMA-BOSSEN -->
        <div class="arena-card" style="border-color: var(--gold); background: linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%);">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--gold-soft); color: #92400E;">${window.VisualEngine.getArenaIconSVG('boss')}</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: 900; font-size: 1.05rem;">3. Tema-Bossen (Slutprov 10 frågor)</h3>
                <span class="satun-badge">🏅 ${clearedBossCount}/${themes.length} Guld</span>
              </div>
              <p class="th-text" style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 2px;">
                ทดสอบไฟนอล 10 ข้อผสมกับ Nong Dala ผ่านแล้วรับเหรียญทองประจำหมวด + 30 💎!
              </p>
            </div>
          </div>
          <div style="margin-bottom: 10px;">
            <select id="boss-theme-select" class="th-text" style="width: 100%; padding: 10px 12px; border-radius: 14px; border: 2px solid var(--gold); background: #fff; font-weight: 800; font-size: 0.92rem;">
              ${themes
                .map((t) => {
                  const isCleared = Boolean(Part5State.data.bossClearedThemes?.[t.id]?.cleared);
                  return `<option value="${t.id}" ${t.id === this.selectedBossThemeId ? 'selected' : ''}>
                    ${isCleared ? '👑 [GULD KLAR] ' : '🎯 '}${t.icon} ${t.titleSv} (${t.titleTh})
                  </option>`;
                })
                .join('')}
            </select>
          </div>
          <button type="button" class="btn-3d btn-yellow w-full" id="btn-start-theme-boss">
            👑 Utmana Tema-Bossen • ดวลไฟนอล
          </button>
        </div>

        <!-- 4. TÄVLINGSLÄGE D: BEGREPPS-MÄSTAREN (KULTUR & SAMHÄLLE) -->
        <div class="arena-card" style="border-color: #8B5CF6; background: linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%);">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--lavender-soft); color: #7B2CBF; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">🇸🇪</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: 900; font-size: 1.05rem;">4. Begrepps-Mästaren (Kultur & Samhälle)</h3>
                <span class="satun-badge" style="background: #EDE9FE; color: #6D28D9;">🇸🇪 10 Begrepp</span>
              </div>
              <p class="th-text" style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 2px;">
                ท้าดวล 10 คำศัพท์วัฒนธรรมสวีเดนที่จำเป็นที่สุด: Fika, Lagom, Allemansrätten, Sambo, Swish, VAB, Panta!
              </p>
            </div>
          </div>
          <button type="button" class="btn-3d w-full" id="btn-start-culture-boss" style="min-height: 48px; background: #8B5CF6; color: #fff; border-color: #7C3AED; box-shadow: 0 4px 0 #6D28D9;">
            🇸🇪 Starta Begrepps-Mästaren • ลุยคำศัพท์วัฒนธรรม
          </button>
        </div>

        <!-- 5. TÄVLINGSLÄGE E: ORD-JAKTEN (SPEED WORD MATCH) -->
        <div class="arena-card" style="border-color: #EC4899; background: linear-gradient(135deg, #FFFFFF 0%, #FDF2F8 100%);">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: #FCE7F3; color: #DB2777; font-size: 1.5rem; display: flex; align-items: center; justify-content: center;">⚡</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: 900; font-size: 1.05rem;">5. Ordjakten (Speed Word Match)</h3>
                <span class="satun-badge" style="background: #FCE7F3; color: #BE185D;">⚡ 3 Ronder</span>
              </div>
              <p class="th-text" style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 2px;">
                จับคู่คำศัพท์ภาษาสวีเดนและไทยให้เร็วที่สุด ทำลายสถิติความเร็วรับโบนัสเพชร +20 💎!
              </p>
            </div>
          </div>
          <button type="button" class="btn-3d w-full" id="btn-start-speed-match" style="min-height: 48px; background: #EC4899; color: #fff; border-color: #DB2777; box-shadow: 0 4px 0 #BE185D;">
            ⚡ Starta Ordjakten • เริ่มจับคู่ด่วน
          </button>
        </div>

        <!-- 4. SPELBARA BOOSTERS & JUVEL-SINKS (LÖSER INFLATIONEN) -->
        <div class="arena-card" style="border-color: #38BDF8; background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--sky-soft); color: var(--sky-dark);">${window.VisualEngine.Library.lightning(28)}</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: 900; font-size: 1.05rem;">Magiska Boosters & Lyckolåda</h3>
                <span class="satun-badge">🛡️ ${freezes}/2 Frys</span>
              </div>
              <p class="th-text" style="font-size: 0.83rem; color: var(--text-secondary);">
                ใช้เพชรซื้อไอเทมช่วยเหลือที่มีประโยชน์จริง หรือเสี่ยงโชคลุ้นรางวัลใหญ่!
              </p>
            </div>
          </div>

          <div class="booster-grid">
            <div class="booster-item-card">
              <div class="booster-svg-icon">${window.VisualEngine.getBoosterSVG('streak_freeze', 44)}</div>
              <div style="font-weight: 900; font-size: 0.84rem;">Streak-Freeze</div>
              <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary);">กันสตรีคหลุด (${freezes}/2)</div>
              <button type="button" class="btn-3d btn-blue w-full" data-buy-booster="streak_freeze" style="min-height: 40px; font-size: 0.78rem; padding: 4px;" ${freezes >= 2 ? 'disabled' : ''}>
                ${freezes >= 2 ? 'Fullt (2/2)' : '35 💎'}
              </button>
            </div>

            <div class="booster-item-card">
              <div class="booster-svg-icon">${window.VisualEngine.getBoosterSVG('double_xp', 44)}</div>
              <div style="font-weight: 900; font-size: 0.84rem;">2x XP (30 min)</div>
              <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary);">${isDoubleXp ? 'Redan aktiv!' : 'แต้มคูณสอง'}</div>
              <button type="button" class="btn-3d btn-yellow w-full" data-buy-booster="double_xp" style="min-height: 40px; font-size: 0.78rem; padding: 4px;" ${isDoubleXp ? 'disabled' : ''}>
                ${isDoubleXp ? '⚡ Aktiv' : '45 💎'}
              </button>
            </div>

            <div class="booster-item-card">
              <div class="booster-svg-icon">${window.VisualEngine.getBoosterSVG('mystery_box', 44)}</div>
              <div style="font-weight: 900; font-size: 0.84rem;">Lyckolåda</div>
              <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary);">ลุ้นรางวัลใหญ่!</div>
              <button type="button" class="btn-3d btn-green w-full" data-buy-booster="mystery_box" style="min-height: 40px; font-size: 0.78rem; padding: 4px;">
                50 💎
              </button>
            </div>
          </div>
        </div>

        <!-- 5. DAGLIGA UPPDRAG -->
        <div class="arena-card">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--emerald-soft); color: var(--emerald-dark);">${window.VisualEngine.Library.target(28)}</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: 900; font-size: 1.05rem;">Dagliga Uppdrag • ภารกิจประจำวัน</h3>
                <span class="satun-badge">Förnyas dagligen</span>
              </div>
            </div>
          </div>
          <div id="daily-quests-list">
            ${Object.values(questsObj)
              .map((q) => {
                const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
                const isReady = q.progress >= q.target && !q.claimed;
                return `
                  <div class="quest-item">
                    <div style="flex: 1;">
                      <div style="font-weight: 900; font-size: 0.92rem; display: flex; align-items: center; gap: 4px;">
                        <span class="quest-svg-icon">${window.VisualEngine.getQuestIconSVG(q.id, 20)}</span>
                        <span>${q.titleSv}</span>
                      </div>
                      <div class="th-text" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                        ${q.titleTh} <strong>(${q.progress}/${q.target})</strong>
                      </div>
                      <div class="quest-progress-bar">
                        <div class="quest-progress-fill" style="width: ${pct}%;"></div>
                      </div>
                    </div>
                    <div>
                      ${
                        q.claimed
                          ? `<span class="satun-badge" style="background: var(--emerald-soft); color: var(--emerald-dark); border-color: var(--emerald);">✅ Klar</span>`
                          : isReady
                          ? `<button type="button" class="btn-3d btn-yellow" data-claim-daily="${q.id}" style="min-height: 44px; padding: 6px 12px; font-size: 0.82rem;">
                              +${q.rewardGems} 💎 Hämta
                            </button>`
                          : `<button type="button" class="btn-3d btn-surface" disabled style="min-height: 44px; padding: 6px 12px; font-size: 0.82rem; opacity: 0.5; cursor: not-allowed;">
                              +${q.rewardGems} 💎
                            </button>`
                      }
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>

        <!-- 6. MASKOT-GARDEROB (10 ACCESSOARER CENTRERADE DIREKT PÅ HUVUDET) -->
        <div class="arena-card" style="border-color: #D8B4FE; background: linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%);">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--lavender-soft); color: #7B2CBF;">${window.VisualEngine.Library.ribbon(28)}</div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-weight: 900; font-size: 1.05rem;">Nong Dalas Garderob (10 st)</h3>
                <span class="satun-badge">💎 ${gems}</span>
              </div>
              <p class="th-text" style="font-size: 0.83rem; color: var(--text-secondary);">
                เครื่องประดับสวมบนหัวตรงเป๊ะ น่ารักสวยงามทุกชิ้น!
              </p>
            </div>
          </div>

          <!-- Förhandsvisning av Nong Dala -->
          <div style="display: flex; align-items: center; gap: 14px; background: var(--surface); border: 2px solid var(--border-light); border-radius: 18px; padding: 10px 14px; margin-bottom: 12px;">
            <div style="width: 78px; height: 78px; flex-shrink: 0;">
              ${window.VisualEngine.Mascot.getSVG(78, 'celebrating')}
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 900; font-size: 0.94rem;">Nong Dala bär:</div>
              <div class="th-text" style="font-size: 0.85rem; color: #7B2CBF; font-weight: 700;">
                ${
                  Part5State.data.equippedAccessory
                    ? MASCOT_ACCESSORIES.find((a) => a.id === Part5State.data.equippedAccessory)?.nameSv +
                      ' (' +
                      MASCOT_ACCESSORIES.find((a) => a.id === Part5State.data.equippedAccessory)?.nameTh +
                      ')'
                    : 'Ingen accessoar vald'
                }
              </div>
            </div>
          </div>

          <div class="wardrobe-grid">
            ${MASCOT_ACCESSORIES.map((acc) => {
              const owned = Part5State.data.ownedAccessories.includes(acc.id);
              const equipped = Part5State.data.equippedAccessory === acc.id;
              return `
                <div class="wardrobe-item-card ${equipped ? 'equipped' : ''}">
                  <div class="wardrobe-svg-icon">${window.VisualEngine.getAccessorySVG(acc.id, 46)}</div>
                  <div style="font-weight: 900; font-size: 0.86rem;">${acc.nameSv}</div>
                  <div class="th-text" style="font-size: 0.74rem; color: var(--text-secondary);">${acc.nameTh}</div>
                  <button type="button" class="btn-3d ${
                    equipped ? 'btn-green' : owned ? 'btn-blue' : 'btn-yellow'
                  } w-full" data-wardrobe-acc="${acc.id}" style="min-height: 42px; padding: 4px 8px; font-size: 0.78rem; margin-top: 4px;">
                    ${
                      equipped
                        ? '✅ Påklädd (Ta av)'
                        : owned
                        ? '👕 Klä på'
                        : `💎 ${acc.costGems}`
                    }
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 7. APPFÄRGTEMAN -->
        <div class="arena-card">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--sky-soft); color: var(--sky-dark);">${window.VisualEngine.Library.palette(28)}</div>
            <div style="flex: 1;">
              <h3 style="font-weight: 900; font-size: 1.05rem;">Färgteman för Appen (6 st)</h3>
            </div>
          </div>
          <div class="wardrobe-grid">
            ${APP_COLOR_THEMES.map((theme) => {
              const owned = Part5State.data.ownedColorThemes.includes(theme.id);
              const active = Part5State.data.activeColorTheme === theme.id;
              return `
                <div class="wardrobe-item-card ${active ? 'equipped' : ''}">
                  <div style="width: 44px; height: 26px; border-radius: 8px; background: ${theme.previewBg}; border: 1.5px solid var(--border-medium);"></div>
                  <div style="font-weight: 900; font-size: 0.84rem;">${theme.nameSv}</div>
                  <button type="button" class="btn-3d ${
                    active ? 'btn-green' : owned ? 'btn-blue' : 'btn-yellow'
                  } w-full" data-color-theme="${theme.id}" style="min-height: 40px; padding: 4px 8px; font-size: 0.76rem; margin-top: 4px;">
                    ${active ? '✨ Aktiv' : owned ? 'Aktivera' : `💎 ${theme.costGems}`}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 8. SAMLARALBUM & PRESTATIONSMÄRKEN (8 BADGES) -->
        <div class="arena-card" style="border-color: var(--gold); background: linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%);">
          <div class="arena-card-header">
            <div class="arena-icon-badge" style="background: var(--gold-soft); color: #92400E;">${window.VisualEngine.Library.badge_medal(28)}</div>
            <div style="flex: 1;">
              <h3 style="font-weight: 900; font-size: 1.05rem;">Samlaralbum & Prestationsmärken</h3>
              <p class="th-text" style="font-size: 0.82rem; color: var(--text-secondary);">
                สะสมเหรียญรางวัลเกียรติยศเพื่อรับเพชรโบนัสก้อนโต!
              </p>
            </div>
          </div>
          <div class="badges-grid">
            ${COLLECTIBLE_BADGES.map((b) => {
              const isUnlocked = b.checkUnlocked(Part5State.data, sm);
              const isClaimed = (Part5State.data.claimedBadges || []).includes(b.id);
              return `
                <div class="badge-item-card ${isUnlocked ? 'unlocked' : ''}">
                  <div class="badge-svg-icon">${window.VisualEngine.Library.badge_medal(34)}</div>
                  <div style="flex: 1;">
                    <div style="font-weight: 900; font-size: 0.82rem;">${b.nameSv}</div>
                    <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary);">${b.nameTh}</div>
                    ${
                      isClaimed
                        ? `<span class="satun-badge" style="font-size: 0.68rem; padding: 1px 6px;">✅ Hämtad</span>`
                        : isUnlocked
                        ? `<button type="button" class="btn-3d btn-yellow" data-claim-badge="${b.id}" style="min-height: 34px; padding: 2px 8px; font-size: 0.72rem; margin-top: 3px;">
                            +${b.rewardGems} 💎 Hämta
                          </button>`
                        : `<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">Låst (+${b.rewardGems} 💎)</span>`
                    }
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // Händelsekopplingar
      document.getElementById('btn-start-sprint60')?.addEventListener('click', (e) => {
        window.VisualEngine?.haptic('light', e.currentTarget);
        ArenaModes.startSnabbSprinten60();
      });

      document.getElementById('btn-start-pronun-challenge')?.addEventListener('click', (e) => {
        window.VisualEngine?.haptic('light', e.currentTarget);
        ArenaModes.startUttalsUtmaningen();
      });

      document.getElementById('boss-theme-select')?.addEventListener('change', (e) => {
        this.selectedBossThemeId = e.target.value;
      });

      document.getElementById('btn-start-theme-boss')?.addEventListener('click', (e) => {
        window.VisualEngine?.haptic('light', e.currentTarget);
        const sel = document.getElementById('boss-theme-select');
        ArenaModes.startThemeBoss(sel ? sel.value : this.selectedBossThemeId);
      });

      document.getElementById('btn-start-culture-boss')?.addEventListener('click', (e) => {
        window.VisualEngine?.haptic('light', e.currentTarget);
        ArenaModes.startCultureMaster();
      });

      document.getElementById('btn-start-speed-match')?.addEventListener('click', (e) => {
        window.VisualEngine?.haptic('light', e.currentTarget);
        ArenaModes.startSpeedWordMatch();
      });

      competeSection.querySelectorAll('[data-buy-booster]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const bId = btn.getAttribute('data-buy-booster');
          this.handleBuyBooster(bId, btn);
        });
      });

      competeSection.querySelectorAll('[data-claim-daily]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const qId = btn.getAttribute('data-claim-daily');
          this.handleClaimDailyQuest(qId, btn);
        });
      });

      competeSection.querySelectorAll('[data-wardrobe-acc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const accId = btn.getAttribute('data-wardrobe-acc');
          this.handleAccessoryAction(accId, btn);
        });
      });

      competeSection.querySelectorAll('[data-color-theme]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const themeId = btn.getAttribute('data-color-theme');
          this.handleColorThemeAction(themeId, btn);
        });
      });

      competeSection.querySelectorAll('[data-claim-badge]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const bId = btn.getAttribute('data-claim-badge');
          this.handleClaimBadge(bId, btn);
        });
      });
    },

    handleBuyBooster(boosterId, btnEl) {
      const b = SHOP_BOOSTERS.find((item) => item.id === boosterId);
      if (!b) return;
      const sm = window.GameEngine.StateManager;

      if ((sm.state.gems || 0) < b.costGems) {
        window.SpeechEngine?.playSound('retry');
        window.VisualEngine?.Mascot?.say(
          `Du behöver ${b.costGems} 💎 juveler för ${b.nameSv}!`,
          `เพชรยังไม่พอนะจ๊ะ (ต้องใช้ ${b.costGems} 💎) ฝึกบทเรียนเพื่อสะสมเพิ่มต๊ะ!`,
          'encourage',
          3500
        );
        return;
      }

      if (boosterId === 'streak_freeze') {
        if ((Part5State.data.streakFreezesCount || 0) >= 2) return;
        sm.state.gems -= b.costGems;
        Part5State.data.streakFreezesCount = (Part5State.data.streakFreezesCount || 0) + 1;
        Part5State.save();
        sm.save();

        window.SpeechEngine?.playSound('correct');
        window.VisualEngine?.triggerConfetti();
        window.VisualEngine?.Mascot?.say(
          `🛡️ Streak-Freeze aktiverad! Din streak är skyddad!`,
          `น้ำแข็งกันสตรีคหลุดทำงานแล้ว! สบายใจได้เลยจ้า!`,
          'correct',
          4000
        );
        this.renderCompeteArena();
      } else if (boosterId === 'double_xp') {
        sm.state.gems -= b.costGems;
        Part5State.data.doubleXpActiveUntil = Date.now() + 30 * 60 * 1000;
        Part5State.save();
        sm.save();

        window.SpeechEngine?.playSound('fanfare');
        window.VisualEngine?.triggerConfetti();
        window.VisualEngine?.Mascot?.say(
          `⚡ Dubbel-XP aktiverat i 30 minuter!`,
          `คะแนนคูณสอง 30 นาทีเริ่มแล้ว! ลุยเลยจ้า!`,
          'celebrating',
          4000
        );
        this.renderCompeteArena();
      } else if (boosterId === 'mystery_box') {
        sm.state.gems -= b.costGems;
        sm.save();
        this.openMysteryBoxModal();
      }
    },

    openMysteryBoxModal() {
      let backdrop = document.getElementById('mystery-box-modal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'mystery-box-modal';
        backdrop.className = 'mystery-box-modal-backdrop';
        document.body.appendChild(backdrop);
      }

      const sm = window.GameEngine.StateManager;

      // Slumpa vinst (Mystery Prize)
      const roll = Math.random();
      let prizeTitle = '';
      let prizeDesc = '';
      let prizeIcon = '🎁';

      if (roll < 0.25) {
        // Storvinst 150 Juveler!
        prizeIcon = '💎';
        prizeTitle = 'STORVINST: +150 Juveler!';
        prizeDesc = 'หรอยจังฮู้! แจ็กพอตแตก ได้รับเพชรโบนัส +150 💎!';
        sm.addGems(150);
      } else if (roll < 0.55) {
        // +150 XP
        prizeIcon = '⭐';
        prizeTitle = 'XP-FLOD: +150 XP!';
        prizeDesc = 'ได้รับคะแนนประสบการณ์สะสมมหาศาล +150 XP!';
        sm.addXP(150);
      } else if (roll < 0.8) {
        // Streak Freeze
        prizeIcon = '🛡️';
        prizeTitle = 'STREAK-SKYDD: +1 Streak-Freeze!';
        prizeDesc = 'ได้รับโล่น้ำแข็งป้องกันสตรีคหลุดอัตโนมัติ!';
        Part5State.data.streakFreezesCount = Math.min(2, (Part5State.data.streakFreezesCount || 0) + 1);
        Part5State.save();
      } else {
        // Super 2x XP
        prizeIcon = '⚡';
        prizeTitle = 'SUPER-BOOST: 45 min Dubbel-XP!';
        prizeDesc = 'พลังคูณสองนานขึ้นเป็นพิเศษถึง 45 นาที!';
        Part5State.data.doubleXpActiveUntil = Date.now() + 45 * 60 * 1000;
        Part5State.save();
      }

      window.SpeechEngine?.playSound('fanfare');
      window.VisualEngine?.triggerConfetti();

      backdrop.innerHTML = `
        <div class="welcome-onboard-card" style="border-color: #38BDF8;">
          <div style="font-size: 4rem; animation: trophyBounce 1s infinite;">${prizeIcon}</div>
          <span class="satun-badge">🎁 Nong Dalas Lyckolåda Öppnad!</span>
          <h2 style="font-size: 1.45rem; font-weight: 900; color: var(--emerald-dark);">${prizeTitle}</h2>
          <p class="th-text" style="font-size: 0.95rem; color: var(--text-secondary);">${prizeDesc}</p>
          <button type="button" class="btn-3d btn-green w-full" id="btn-close-mystery-box" style="margin-top: 10px;">
            HÄMTA VINST • รับรางวัล
          </button>
        </div>
      `;

      requestAnimationFrame(() => backdrop.classList.add('open'));

      document.getElementById('btn-close-mystery-box')?.addEventListener('click', () => {
        backdrop.classList.remove('open');
        this.renderCompeteArena();
      });
    },

    handleClaimBadge(badgeId, btnEl) {
      const b = COLLECTIBLE_BADGES.find((item) => item.id === badgeId);
      if (!b) return;
      if ((Part5State.data.claimedBadges || []).includes(badgeId)) return;

      const sm = window.GameEngine.StateManager;
      if (!b.checkUnlocked(Part5State.data, sm)) {
        window.SpeechEngine?.playSound('retry');
        return false;
      }

      Part5State.data.claimedBadges = Part5State.data.claimedBadges || [];
      Part5State.data.claimedBadges.push(badgeId);
      Part5State.save();

      sm.addGems(b.rewardGems);

      window.SpeechEngine?.playSound('fanfare');
      window.VisualEngine?.triggerConfetti();
      window.VisualEngine?.Mascot?.say(
        `🏅 Prestationsmärke upplåst: ${b.nameSv}!`,
        `ปลดล็อกเหรียญตราสำเร็จ! รับ +${b.rewardGems} 💎!`,
        'celebrating',
        4000
      );

      this.renderCompeteArena();
    },

    handleClaimDailyQuest(questId, btnEl) {
      const q = Part5State.data.dailyQuestsData?.items?.[questId];
      if (!q || q.claimed) return;
      if (q.progress < q.target) {
        window.SpeechEngine?.playSound('retry');
        return false;
      }

      q.claimed = true;
      Part5State.save();

      const sm = window.GameEngine.StateManager;
      sm.addGems(q.rewardGems);

      window.SpeechEngine?.playSound('fanfare');
      window.VisualEngine?.triggerConfetti();
      this.renderCompeteArena();
    },

    handleAccessoryAction(accId, btnEl) {
      const acc = MASCOT_ACCESSORIES.find((a) => a.id === accId);
      if (!acc) return;
      const sm = window.GameEngine.StateManager;
      const owned = Part5State.data.ownedAccessories.includes(accId);

      if (owned) {
        Part5State.data.equippedAccessory = Part5State.data.equippedAccessory === accId ? null : accId;
        Part5State.save();
        window.SpeechEngine?.playSound('correct');
        window.VisualEngine?.renderMascot('celebrating');
        window.VisualEngine?.Mascot?.say(`✨ ${acc.nameSv}!`, `${acc.satunDesc}`, 'correct', 4000);
        this.renderCompeteArena();
        return;
      }

      if ((sm.state.gems || 0) < acc.costGems) {
        window.SpeechEngine?.playSound('retry');
        window.VisualEngine?.Mascot?.say(
          `Du behöver ${acc.costGems} 💎 juveler!`,
          `เพชรยังไม่พอนะจ๊ะ (ใช้ ${acc.costGems} 💎) สะสมเพชรเพิ่มได้จากการแข่งขันต๊ะ!`,
          'encourage',
          4000
        );
        return;
      }

      sm.state.gems -= acc.costGems;
      sm.save();
      Part5State.data.ownedAccessories.push(accId);
      Part5State.data.equippedAccessory = accId;
      Part5State.save();

      window.SpeechEngine?.playSound('fanfare');
      window.VisualEngine?.triggerConfetti();
      window.VisualEngine?.renderMascot('celebrating');
      window.VisualEngine?.Mascot?.say(`🎉 ${acc.nameSv}!`, `${acc.satunDesc}`, 'correct', 4500);
      window.GameEngine?.UIController?.renderTopbar?.();

      this.renderCompeteArena();
    },

    handleColorThemeAction(themeId, btnEl) {
      const theme = APP_COLOR_THEMES.find((t) => t.id === themeId);
      if (!theme) return;
      const sm = window.GameEngine.StateManager;
      const owned = Part5State.data.ownedColorThemes.includes(themeId);

      if (owned) {
        Part5State.applyColorTheme(themeId);
        window.SpeechEngine?.playSound('correct');
        this.renderCompeteArena();
        return;
      }

      if ((sm.state.gems || 0) < theme.costGems) {
        window.SpeechEngine?.playSound('retry');
        return;
      }

      sm.state.gems -= theme.costGems;
      sm.save();
      Part5State.data.ownedColorThemes.push(themeId);
      Part5State.applyColorTheme(themeId);

      window.SpeechEngine?.playSound('fanfare');
      window.VisualEngine?.triggerConfetti();
      window.GameEngine?.UIController?.renderTopbar?.();
      this.renderCompeteArena();
    }
  };

  /* ==========================================================================
     XP-NIVÅER & BERÄKNING
     ========================================================================== */

  const XP_LEVELS = [
    { level: 1, titleSv: 'Nybörjare', titleTh: 'ผู้เริ่มต้น', minXP: 0, maxXP: 100, icon: '🌱', desc: 'Börja din resa i det svenska språket!' },
    { level: 2, titleSv: 'Flitig Upptäckare', titleTh: 'นักสำรวจผู้ขยัน', minXP: 100, maxXP: 300, icon: '🧭', desc: 'Du bygger dina första meningar och ordförråd.' },
    { level: 3, titleSv: 'Satun-Stjärna', titleTh: 'ดาวเด่นสตูล', minXP: 300, maxXP: 650, icon: '⭐', desc: 'Ditt självförtroende i uttal och ordkunskap glänser!' },
    { level: 4, titleSv: 'Ordmästare', titleTh: 'ปรมาจารย์คำศัพท์', minXP: 650, maxXP: 1200, icon: '📚', desc: 'Ett djupt och stabilt svenskt ordförråd.' },
    { level: 5, titleSv: 'Uttals-Virtuos', titleTh: 'เซียนสำเนียงสวีเดน', minXP: 1200, maxXP: 2000, icon: '🎙️', desc: 'Nära perfekt svenskt uttal och flyt!' },
    { level: 6, titleSv: 'Svensk-Mästare', titleTh: 'แชมเปี้ยนภาษาสวีเดน', minXP: 2000, maxXP: 3200, icon: '👑', desc: 'Du behärskar vardagsspråk och kultur suveränt.' },
    { level: 7, titleSv: 'Nordisk Legend', titleTh: 'ตำนานนอร์ดิกสูงสุด', minXP: 3200, maxXP: 999999, icon: '🏆', desc: 'Högsta möjliga hedersgrad!' }
  ];

  function getXPLevelInfo(totalXP = 0) {
    let current = XP_LEVELS[0];
    for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= XP_LEVELS[i].minXP) {
        current = XP_LEVELS[i];
        break;
      }
    }
    const next = XP_LEVELS.find((l) => l.level === current.level + 1) || null;
    const xpInLevel = Math.max(0, totalXP - current.minXP);
    const xpSpan = next ? next.minXP - current.minXP : 1000;
    const progressPct = next ? Math.min(100, Math.round((xpInLevel / xpSpan) * 100)) : 100;
    const remainingToNext = next ? Math.max(0, next.minXP - totalXP) : 0;

    return {
      current,
      next,
      totalXP,
      xpInLevel,
      xpSpan,
      progressPct,
      remainingToNext
    };
  }

  /* ==========================================================================
     11. GAMIFICATION MODALS (TOPBAR-KLICK: STATS, SHOP/BOUTIQUE & XP/ALBUM)
     ========================================================================== */

  const GamificationModals = {
    statsBackdrop: null,
    shopBackdrop: null,
    xpBackdrop: null,

    // --- 1. STATS MODAL (FLAMMAN) ---
    openStatsModal() {
      if (!this.statsBackdrop) {
        this.statsBackdrop = document.createElement('div');
        this.statsBackdrop.id = 'stats-modal-backdrop';
        this.statsBackdrop.className = 'gamification-modal-backdrop';
        document.body.appendChild(this.statsBackdrop);
      }
      this.renderStatsModal();
      requestAnimationFrame(() => this.statsBackdrop.classList.add('open'));
    },

    closeStatsModal() {
      if (this.statsBackdrop) {
        this.statsBackdrop.classList.remove('open');
      }
    },

    renderStatsModal() {
      const sm = window.GameEngine.StateManager;
      const streakDays = sm.state.streakDays || 1;
      const freezes = Part5State.data.streakFreezesCount || 0;
      const totalXP = sm.state.totalXP || 0;
      const srs = window.GameEngine.SRSManager;
      const allItems = window.ContentDB ? window.ContentDB.getAllItems() : [];
      const learnedCount = allItems.filter((i) => srs.getRecord(i.id).masteryLevel > 0).length;
      const masteredCount = allItems.filter((i) => srs.getRecord(i.id).masteryLevel >= 4).length;
      const clearedBossCount = Object.keys(Part5State.data.bossClearedThemes || {}).length;

      const activeSecs = Part5State.data.activeSecondsCount || 0;
      const minutesDone = Math.floor(activeSecs / 60);
      const timePct = Math.min(100, Math.round((minutesDone / 15) * 100));

      this.statsBackdrop.innerHTML = `
        <div class="gamification-modal-card" role="dialog" aria-label="Din Träningsstatistik">
          <div class="gamification-modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.6rem;">🔥</span>
              <div>
                <div style="font-weight: 900; font-size: 1.15rem; color: var(--text-main);">
                  Träningsstatistik & Streak
                </div>
                <div class="th-text" style="font-size: 0.78rem; color: var(--text-secondary);">
                  สถิติการเรียนและสตรีคประจำวัน
                </div>
              </div>
            </div>
            <button type="button" class="lesson-close-btn" id="btn-close-stats-modal" aria-label="Stäng">✕</button>
          </div>

          <!-- Streak Hero Banner -->
          <div style="background: linear-gradient(135deg, #FFF8EE 0%, #FFF0DE 100%); border: 2px solid #FFE0B2; border-radius: 20px; padding: 16px; text-align: center; box-shadow: 0 4px 12px rgba(255, 122, 0, 0.08);">
            <div style="font-size: 3.2rem; line-height: 1; animation: flameFlicker 1.5s infinite alternate;">🔥</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: #C2410C; margin-top: 6px;">
              ${streakDays} Dagar i rad!
            </div>
            <div class="th-text" style="font-size: 0.85rem; color: #9A3412; font-weight: 700; margin-top: 2px;">
              เรียนติดต่อกัน ${streakDays} วัน สตรีคไม่หลุด!
            </div>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.9); border: 1.5px solid #FDBA74; border-radius: 999px; padding: 4px 14px; margin-top: 10px; font-size: 0.82rem; font-weight: 800; color: #9A3412;">
              <span>🛡️ Streak-Freeze:</span>
              <span style="color: #0369A1;">${freezes} / 2 aktiva skydd</span>
            </div>
          </div>

          <!-- 15-Minuters Dagsmål -->
          <div style="background: var(--surface); border: 2px solid var(--border-light); border-radius: 18px; padding: 14px 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-weight: 900; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
                <span>⏱️</span>
                <span>Dagens Träningstid</span>
              </div>
              <span class="satun-badge" style="background: ${minutesDone >= 15 ? 'var(--emerald-soft)' : '#FEF3C7'}; color: ${minutesDone >= 15 ? 'var(--emerald-dark)' : '#92400E'}; font-weight: 900;">
                ${minutesDone} / 15 minuter
              </span>
            </div>
            <div style="height: 12px; background: var(--surface-muted); border-radius: 999px; overflow: hidden; border: 1.5px solid var(--border-light); margin-bottom: 8px;">
              <div style="height: 100%; width: ${timePct}%; background: linear-gradient(90deg, #10B981, #059669); border-radius: 999px; transition: width 0.4s ease;"></div>
            </div>
            <div class="th-text" style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">
              ${
                minutesDone >= 15
                  ? '🏆 <strong>15-minutersmålet nått!</strong> Fantastiskt jobbat, din hjärna har befäst orden! / ครบเป้าหมาย 15 นาทีแล้ว สุดยอดมาก!'
                  : `💪 <strong>${15 - minutesDone} minuter kvar</strong> till dagens mål. Träna 15 minuter per dag för bästa minnesretention! / ฝึกต่ออีกนิดเพื่อความจำระยะยาว!`
              }
            </div>
          </div>

          <!-- 4 Stats Boxes Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="background: var(--surface); border: 2px solid var(--border-light); border-radius: 16px; padding: 12px; text-align: center;">
              <div style="font-size: 1.5rem;">⚡</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: #B45309; margin-top: 2px;">${totalXP} XP</div>
              <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">Total Erfarenhet</div>
            </div>
            <div style="background: var(--surface); border: 2px solid var(--border-light); border-radius: 16px; padding: 12px; text-align: center;">
              <div style="font-size: 1.5rem;">📚</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: var(--sky-dark); margin-top: 2px;">${learnedCount} Ord</div>
              <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">I Ordbanken</div>
            </div>
            <div style="background: var(--surface); border: 2px solid var(--border-light); border-radius: 16px; padding: 12px; text-align: center;">
              <div style="font-size: 1.5rem;">🌟</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: var(--emerald-dark); margin-top: 2px;">${masteredCount} Ord</div>
              <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">Bemästrade (4-5★)</div>
            </div>
            <div style="background: var(--surface); border: 2px solid var(--border-light); border-radius: 16px; padding: 12px; text-align: center;">
              <div style="font-size: 1.5rem;">👑</div>
              <div style="font-weight: 900; font-size: 1.15rem; color: #7C3AED; margin-top: 2px;">${clearedBossCount}/10</div>
              <div style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">Besegrade Bossar</div>
            </div>
          </div>

          <!-- Veckokalender -->
          <div style="background: var(--surface-muted); border: 2px solid var(--border-light); border-radius: 18px; padding: 12px 14px;">
            <div style="font-weight: 800; font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 8px;">
              📅 Träningsaktivitet i veckan:
            </div>
            <div style="display: flex; justify-content: space-between; gap: 4px;">
              ${this.renderWeekCalendar(streakDays)}
            </div>
          </div>

          <!-- Fotknapp -->
          <button type="button" class="btn-3d btn-green w-full" id="btn-stats-continue" style="min-height: 48px; font-size: 0.95rem; margin-top: 4px;">
            Fortsätt träna • ลุยต่อเลย
          </button>
        </div>
      `;

      document.getElementById('btn-close-stats-modal')?.addEventListener('click', () => this.closeStatsModal());
      document.getElementById('btn-stats-continue')?.addEventListener('click', () => this.closeStatsModal());
      this.statsBackdrop.onclick = (e) => {
        if (e.target === this.statsBackdrop) this.closeStatsModal();
      };
    },

    renderWeekCalendar(streakDays = 1) {
      const dayNames = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
      const today = new Date();
      const jsDay = today.getDay();
      const currentDayIndex = (jsDay + 6) % 7; // Monday = 0

      return dayNames
        .map((name, idx) => {
          const isToday = idx === currentDayIndex;
          const isPastInStreak = idx <= currentDayIndex && currentDayIndex - idx < streakDays;
          const icon = isToday ? '🔥' : isPastInStreak ? '✓' : '•';
          const bg = isToday ? '#FFEDD5' : isPastInStreak ? '#DCFCE7' : '#F1F5F9';
          const border = isToday ? '#FB923C' : isPastInStreak ? '#86EFAC' : '#E2E8F0';
          const color = isToday ? '#C2410C' : isPastInStreak ? '#15803D' : '#94A3B8';

          return `
            <div style="flex: 1; text-align: center; background: ${bg}; border: 1.5px solid ${border}; border-radius: 12px; padding: 6px 2px;">
              <div style="font-size: 0.68rem; font-weight: 800; color: ${color}; text-transform: uppercase;">${name}</div>
              <div style="font-size: 0.95rem; font-weight: 900; color: ${color}; margin-top: 2px;">${icon}</div>
            </div>
          `;
        })
        .join('');
    },

    // --- 2. JUVEL-BOUTIQUE & LULL-LULL (DIAMANTERNA) ---
    openShopModal() {
      if (!this.shopBackdrop) {
        this.shopBackdrop = document.createElement('div');
        this.shopBackdrop.id = 'shop-modal-backdrop';
        this.shopBackdrop.className = 'gamification-modal-backdrop';
        document.body.appendChild(this.shopBackdrop);
      }
      this.renderShopModal();
      requestAnimationFrame(() => this.shopBackdrop.classList.add('open'));
    },

    closeShopModal() {
      if (this.shopBackdrop) {
        this.shopBackdrop.classList.remove('open');
      }
    },

    renderShopModal() {
      const sm = window.GameEngine.StateManager;
      const gems = sm.state.gems || 0;
      const freezes = Part5State.data.streakFreezesCount || 0;
      const isDoubleXp = Part5State.isDoubleXpActive();

      const equippedAcc = MASCOT_ACCESSORIES.find((a) => a.id === Part5State.data.equippedAccessory);
      const equippedName = equippedAcc ? `${equippedAcc.nameSv} (${equippedAcc.nameTh})` : 'Ingen accessoar vald';
      const equippedDesc = equippedAcc ? equippedAcc.satunDesc : 'Välj en fin hatt eller pynt nedan!';

      this.shopBackdrop.innerHTML = `
        <div class="gamification-modal-card" role="dialog" aria-label="Juvel-Boutique och Lull-lull">
          <div class="gamification-modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.6rem;">💎</span>
              <div>
                <div style="font-weight: 900; font-size: 1.15rem; color: var(--text-main);">
                  Juvel-Boutique: Teman & Lull-lull
                </div>
                <div class="th-text" style="font-size: 0.78rem; color: var(--text-secondary);">
                  ร้านค้าธีมสีและแต่งตัว Nong Dala
                </div>
              </div>
            </div>
            <button type="button" class="lesson-close-btn" id="btn-close-shop-modal" aria-label="Stäng">✕</button>
          </div>

          <!-- Saldobanner -->
          <div style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border: 2px solid #BAE6FD; border-radius: 20px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.08);">
            <div>
              <div style="font-size: 0.75rem; font-weight: 800; color: #0284C7; text-transform: uppercase; letter-spacing: 0.5px;">Ditt Juvelsaldo</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: #0369A1;">💎 ${gems} Juveler</div>
            </div>
            <div class="satun-badge" style="background: #FFFFFF; color: #0284C7; border: 1.5px solid #BAE6FD; font-size: 0.8rem;">
              🛍️ Lull-lull & Teman
            </div>
          </div>

          <!-- SEKTION 1: FÄRGTEMAN (6 ST) -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: 900; font-size: 0.98rem; display: flex; align-items: center; gap: 6px;">
                <span>🎨</span>
                <span>Färgteman för Appen (6 st)</span>
              </div>
              <span style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">Byt färg direkt</span>
            </div>
            <div class="wardrobe-grid">
              ${APP_COLOR_THEMES.map((theme) => {
                const owned = Part5State.data.ownedColorThemes.includes(theme.id);
                const active = Part5State.data.activeColorTheme === theme.id;
                const canAfford = gems >= theme.costGems;
                return `
                  <div class="wardrobe-item-card ${active ? 'equipped' : ''}" style="padding: 10px;">
                    <div style="width: 100%; height: 32px; border-radius: 10px; background: ${theme.previewBg}; border: 1.5px solid var(--border-medium); margin-bottom: 6px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);"></div>
                    <div style="font-weight: 900; font-size: 0.82rem; line-height: 1.2;">${theme.nameSv}</div>
                    <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">${theme.nameTh}</div>
                    <button type="button" class="btn-3d ${active ? 'btn-green' : owned ? 'btn-blue' : 'btn-yellow'} w-full"
                      data-shopmodal-theme="${theme.id}"
                      style="min-height: 38px; padding: 4px 6px; font-size: 0.76rem; margin-top: 6px;"
                      ${!owned && !canAfford ? 'disabled style="min-height: 38px; padding: 4px 6px; font-size: 0.76rem; margin-top: 6px; opacity:0.55; cursor:not-allowed;"' : ''}>
                      ${active ? '✨ Aktiv' : owned ? 'Aktivera' : `💎 ${theme.costGems} Köp`}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- SEKTION 2: NONG DALAS LULL-LULL & GARDEROB (10 ST) -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="font-weight: 900; font-size: 0.98rem; display: flex; align-items: center; gap: 6px;">
                <span>👑</span>
                <span>Nong Dalas Lull-lull & Garderob</span>
              </div>
              <span style="font-size: 0.76rem; color: var(--text-secondary); font-weight: 700;">10 Accessoarer</span>
            </div>

            <!-- Live Mascot Preview Card -->
            <div style="display: flex; align-items: center; gap: 14px; background: var(--surface); border: 2px solid var(--border-light); border-radius: 18px; padding: 10px 14px;">
              <div id="shopmodal-mascot-preview" style="width: 68px; height: 68px; flex-shrink: 0;">
                ${window.VisualEngine.Mascot.getSVG(68, 'celebrating')}
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 800; font-size: 0.78rem; color: var(--text-secondary);">Aktuell styling:</div>
                <div style="font-weight: 900; font-size: 0.92rem; color: #7B2CBF;">
                  ${equippedName}
                </div>
                <div class="th-text" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                  ${equippedDesc}
                </div>
              </div>
            </div>

            <div class="wardrobe-grid">
              ${MASCOT_ACCESSORIES.map((acc) => {
                const owned = Part5State.data.ownedAccessories.includes(acc.id);
                const equipped = Part5State.data.equippedAccessory === acc.id;
                const canAfford = gems >= acc.costGems;
                return `
                  <div class="wardrobe-item-card ${equipped ? 'equipped' : ''}" style="padding: 10px;">
                    <div class="wardrobe-svg-icon" style="height: 44px;">${window.VisualEngine.getAccessorySVG(acc.id, 44)}</div>
                    <div style="font-weight: 900; font-size: 0.82rem; line-height: 1.2;">${acc.nameSv}</div>
                    <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">${acc.nameTh}</div>
                    <button type="button" class="btn-3d ${equipped ? 'btn-green' : owned ? 'btn-blue' : 'btn-yellow'} w-full"
                      data-shopmodal-acc="${acc.id}"
                      style="min-height: 38px; padding: 4px 6px; font-size: 0.76rem; margin-top: 6px;"
                      ${!owned && !canAfford ? 'disabled style="min-height: 38px; padding: 4px 6px; font-size: 0.76rem; margin-top: 6px; opacity:0.55; cursor:not-allowed;"' : ''}>
                      ${equipped ? '✅ Påklädd' : owned ? '👕 Klä på' : `💎 ${acc.costGems}`}
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- SEKTION 3: BOOSTERS & LYCKOLÅDA -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="font-weight: 900; font-size: 0.98rem; display: flex; align-items: center; gap: 6px;">
              <span>⚡</span>
              <span>Spelbara Boosters & Lyckolåda</span>
            </div>
            <div class="booster-grid">
              <!-- Booster 1: Streak Freeze -->
              <div class="booster-item-card" style="padding: 10px;">
                <div class="booster-svg-icon">${window.VisualEngine.getBoosterSVG('streak_freeze', 38)}</div>
                <div style="font-weight: 900; font-size: 0.82rem;">Streak-Freeze</div>
                <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary);">${freezes}/2 sparade</div>
                <button type="button" class="btn-3d btn-blue w-full" data-shopmodal-booster="streak_freeze" style="min-height: 36px; font-size: 0.76rem; padding: 2px;" ${freezes >= 2 || gems < 35 ? 'disabled' : ''}>
                  ${freezes >= 2 ? 'Fullt' : '35 💎'}
                </button>
              </div>

              <!-- Booster 2: 2x XP -->
              <div class="booster-item-card" style="padding: 10px;">
                <div class="booster-svg-icon">${window.VisualEngine.getBoosterSVG('double_xp', 38)}</div>
                <div style="font-weight: 900; font-size: 0.82rem;">2x XP (30m)</div>
                <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary);">${isDoubleXp ? 'Aktiv!' : 'แต้มคูณสอง'}</div>
                <button type="button" class="btn-3d btn-yellow w-full" data-shopmodal-booster="double_xp" style="min-height: 36px; font-size: 0.76rem; padding: 2px;" ${isDoubleXp || gems < 45 ? 'disabled' : ''}>
                  ${isDoubleXp ? '⚡ Aktiv' : '45 💎'}
                </button>
              </div>

              <!-- Booster 3: Mystery Box -->
              <div class="booster-item-card" style="padding: 10px;">
                <div class="booster-svg-icon">${window.VisualEngine.getBoosterSVG('mystery_box', 38)}</div>
                <div style="font-weight: 900; font-size: 0.82rem;">Lyckolåda</div>
                <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary);">ลุ้นรางวัลใหญ่!</div>
                <button type="button" class="btn-3d btn-green w-full" data-shopmodal-booster="mystery_box" style="min-height: 36px; font-size: 0.76rem; padding: 2px;" ${gems < 50 ? 'disabled' : ''}>
                  50 💎
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Händelsekopplingar i Juvel-Boutique
      document.getElementById('btn-close-shop-modal')?.addEventListener('click', () => this.closeShopModal());
      this.shopBackdrop.onclick = (e) => {
        if (e.target === this.shopBackdrop) this.closeShopModal();
      };

      // Färgteman
      this.shopBackdrop.querySelectorAll('[data-shopmodal-theme]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          window.VisualEngine?.haptic('light', e.currentTarget);
          const themeId = btn.getAttribute('data-shopmodal-theme');
          CompeteAndShopUI.handleColorThemeAction(themeId);
          window.GameEngine?.UIController?.renderTopbar?.();
          this.renderShopModal();
        });
      });

      // Accessoarer
      this.shopBackdrop.querySelectorAll('[data-shopmodal-acc]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          window.VisualEngine?.haptic('light', e.currentTarget);
          const accId = btn.getAttribute('data-shopmodal-acc');
          CompeteAndShopUI.handleAccessoryAction(accId);
          window.GameEngine?.UIController?.renderTopbar?.();
          this.renderShopModal();
        });
      });

      // Boosters
      this.shopBackdrop.querySelectorAll('[data-shopmodal-booster]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          window.VisualEngine?.haptic('light', e.currentTarget);
          const boosterId = btn.getAttribute('data-shopmodal-booster');
          CompeteAndShopUI.handleBuyBooster(boosterId);
          window.GameEngine?.UIController?.renderTopbar?.();
          this.renderShopModal();
        });
      });
    },

    // --- 3. SAMLARALBUM & XP-NIVÅER (XP-IKONEN) ---
    openXPModal() {
      if (!this.xpBackdrop) {
        this.xpBackdrop = document.createElement('div');
        this.xpBackdrop.id = 'xp-modal-backdrop';
        this.xpBackdrop.className = 'gamification-modal-backdrop';
        document.body.appendChild(this.xpBackdrop);
      }
      this.renderXPModal();
      requestAnimationFrame(() => this.xpBackdrop.classList.add('open'));
    },

    closeXPModal() {
      if (this.xpBackdrop) {
        this.xpBackdrop.classList.remove('open');
      }
    },

    renderXPModal() {
      const sm = window.GameEngine.StateManager;
      const totalXP = sm.state.totalXP || 0;
      const levelInfo = getXPLevelInfo(totalXP);
      const claimedBadges = Part5State.data.claimedBadges || [];

      this.xpBackdrop.innerHTML = `
        <div class="gamification-modal-card" role="dialog" aria-label="Samlaralbum och XP-Nivåer">
          <div class="gamification-modal-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.6rem;">⚡</span>
              <div>
                <div style="font-weight: 900; font-size: 1.15rem; color: var(--text-main);">
                  Samlaralbum & XP-Nivåer
                </div>
                <div class="th-text" style="font-size: 0.78rem; color: var(--text-secondary);">
                  ระดับเลเวล XP และอัลบั้มเหรียญเกียรติยศ
                </div>
              </div>
            </div>
            <button type="button" class="lesson-close-btn" id="btn-close-xp-modal" aria-label="Stäng">✕</button>
          </div>

          <!-- XP Level Card -->
          <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 2px solid #FCD34D; border-radius: 20px; padding: 16px; text-align: center; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.08);">
            <div style="font-size: 3rem; line-height: 1;">${levelInfo.current.icon}</div>
            <div style="font-size: 1.45rem; font-weight: 900; color: #92400E; margin-top: 4px;">
              Nivå ${levelInfo.current.level}: ${levelInfo.current.titleSv}
            </div>
            <div class="th-text" style="font-size: 0.84rem; color: #B45309; font-weight: 700; margin-top: 2px;">
              ${levelInfo.current.titleTh} • ${totalXP} XP Totalt
            </div>

            <!-- Level Progress Bar -->
            <div style="margin-top: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 800; color: #92400E; margin-bottom: 4px;">
                <span>Framsteg mot Nästa Nivå:</span>
                <span>${levelInfo.next ? `${levelInfo.remainingToNext} XP kvar` : 'Maxnivå uppnådd!'}</span>
              </div>
              <div style="height: 12px; background: rgba(0,0,0,0.08); border-radius: 999px; overflow: hidden; border: 1.5px solid #FBBF24;">
                <div style="height: 100%; width: ${levelInfo.progressPct}%; background: linear-gradient(90deg, #F59E0B, #D97706); border-radius: 999px; transition: width 0.4s ease;"></div>
              </div>
            </div>
            <div style="font-size: 0.78rem; color: #78350F; margin-top: 8px;">
              ${levelInfo.current.desc}
            </div>
          </div>

          <!-- Samlaralbumet (8 Badges) -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <div style="font-weight: 900; font-size: 1rem; display: flex; align-items: center; gap: 6px;">
                <span>🏆</span>
                <span>Samlaralbum & Badges</span>
              </div>
              <span class="satun-badge" style="font-size: 0.75rem;">
                ${claimedBadges.length} / 8 Hämtade
              </span>
            </div>
            <div class="badges-grid">
              ${COLLECTIBLE_BADGES.map((b) => {
                const isUnlocked = b.checkUnlocked(Part5State.data, sm);
                const isClaimed = claimedBadges.includes(b.id);
                return `
                  <div class="badge-item-card ${isUnlocked ? 'unlocked' : ''}" style="padding: 10px;">
                    <div class="badge-svg-icon">${window.VisualEngine.Library.badge_medal(34)}</div>
                    <div style="flex: 1;">
                      <div style="font-weight: 900; font-size: 0.84rem;">${b.nameSv}</div>
                      <div class="th-text" style="font-size: 0.72rem; color: var(--text-secondary);">${b.nameTh}</div>
                      ${
                        isClaimed
                          ? `<span class="satun-badge" style="font-size: 0.7rem; padding: 2px 8px; margin-top: 4px; display: inline-block;">✅ Hämtad (+${b.rewardGems} 💎)</span>`
                          : isUnlocked
                          ? `<button type="button" class="btn-3d btn-yellow" data-xpmodal-claim="${b.id}" style="min-height: 36px; padding: 4px 10px; font-size: 0.78rem; margin-top: 4px;">
                              +${b.rewardGems} 💎 Hämta Belöning!
                            </button>`
                          : `<div style="font-size: 0.74rem; color: var(--text-muted); font-weight: 700; margin-top: 4px;">
                              🔒 Låst (Ge järnet för att nå kravet!)
                             </div>`
                      }
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- XP-Nivåtrappan -->
          <div style="background: var(--surface-muted); border: 2px solid var(--border-light); border-radius: 18px; padding: 12px 14px;">
            <div style="font-weight: 900; font-size: 0.88rem; margin-bottom: 8px;">
              🌟 Alla XP-Nivåer & Titlar:
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem;">
              ${XP_LEVELS.map((lvl) => {
                const isCurrent = lvl.level === levelInfo.current.level;
                const isReached = totalXP >= lvl.minXP;
                return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-radius: 8px; background: ${isCurrent ? '#FEF3C7' : isReached ? '#F1F5F9' : 'transparent'}; font-weight: ${isCurrent ? '900' : '600'};">
                    <span>${lvl.icon} Nivå ${lvl.level}: ${lvl.titleSv}</span>
                    <span style="color: ${isReached ? '#059669' : '#94A3B8'}; font-weight: 800;">
                      ${isCurrent ? '⭐ DU ÄR HÄR' : isReached ? '✓ Klar' : `${lvl.minXP} XP`}
                    </span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;

      // Händelsekopplingar
      document.getElementById('btn-close-xp-modal')?.addEventListener('click', () => this.closeXPModal());
      this.xpBackdrop.onclick = (e) => {
        if (e.target === this.xpBackdrop) this.closeXPModal();
      };

      this.xpBackdrop.querySelectorAll('[data-xpmodal-claim]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          window.VisualEngine?.haptic('light', e.currentTarget);
          const badgeId = btn.getAttribute('data-xpmodal-claim');
          CompeteAndShopUI.handleClaimBadge(badgeId);
          window.GameEngine?.UIController?.renderTopbar?.();
          this.renderXPModal();
        });
      });
    }
  };


  /* ==========================================================================
     10. "MINA ORD"-BANK & VÄLKOMSTSKÄRM
     ========================================================================== */

  const MinaOrdBank = {
    renderVocabBank() {
      const listContainer = document.getElementById('vocab-list-container');
      const summaryEl = document.getElementById('vocab-mastery-summary');
      if (!listContainer || !summaryEl) return;

      const srs = window.GameEngine.SRSManager;
      const allItems = window.ContentDB.getAllItems();
      const themes = window.ContentDB.getThemes();
      const learnedItems = allItems.filter((i) => srs.getRecord(i.id).masteryLevel > 0);
      const masteredItems = allItems.filter((i) => srs.getRecord(i.id).masteryLevel >= 4);

      const currentFilter = Part5State.data.vocabFilter || 'all';
      const searchQuery = (Part5State.data.vocabSearchQuery || '').trim().toLowerCase();

      summaryEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
          <div>
            <div style="font-weight: 900; font-size: 1rem;">🌟 Mina Ord – Ordbok & Röstträning</div>
            <div class="th-text" style="font-size: 0.82rem; color: var(--text-secondary);">
              ฝึกแล้ว <strong>${learnedItems.length}</strong> / ${allItems.length} คำ • ระดับ 4–5 ดาว <strong>${masteredItems.length}</strong> คำ
            </div>
          </div>
          <span class="satun-badge">🎙️ Öva uttal när som helst</span>
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
          <input
            type="search"
            id="mina-ord-search"
            placeholder="🔍 Sök ord på svenska eller thai..."
            value="${Part5State.data.vocabSearchQuery || ''}"
            class="th-text"
            style="flex: 1; min-width: 180px; padding: 9px 12px; border-radius: 12px; border: 2px solid var(--border-light); font-size: 0.86rem; font-weight: 700;"
          />
          <select id="mina-ord-filter" class="th-text" style="padding: 9px 12px; border-radius: 12px; border: 2px solid var(--border-light); font-size: 0.85rem; font-weight: 800; background: #fff;">
            <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>📚 Alla ord (${allItems.length})</option>
            <option value="learned" ${currentFilter === 'learned' ? 'selected' : ''}>⭐ Lärda ord (${learnedItems.length})</option>
            <option value="sentences" ${currentFilter === 'sentences' ? 'selected' : ''}>💬 Endast meningar</option>
            ${themes.map((t) => `<option value="${t.id}" ${currentFilter === t.id ? 'selected' : ''}>${t.icon} ${t.titleSv}</option>`).join('')}
          </select>
        </div>
      `;

      let filtered = allItems;
      if (currentFilter === 'learned') {
        filtered = learnedItems.length > 0 ? learnedItems : allItems;
      } else if (currentFilter === 'sentences') {
        filtered = allItems.filter((i) => i.kind === 'sentence');
      } else if (currentFilter !== 'all') {
        filtered = allItems.filter((i) => i.themeId === currentFilter);
      }

      if (searchQuery) {
        filtered = filtered.filter(
          (i) =>
            i.sv.toLowerCase().includes(searchQuery) ||
            i.th.toLowerCase().includes(searchQuery) ||
            (i.phonetic && i.phonetic.toLowerCase().includes(searchQuery))
        );
      }

      listContainer.innerHTML = filtered
        .map((item) => {
          const rec = srs.getRecord(item.id);
          const starCount = Math.min(5, Math.max(0, rec.masteryLevel));
          const starsHtml = [1, 2, 3, 4, 5]
            .map((n) => `<span style="color: ${n <= starCount ? '#FFC800' : '#CBD5E1'}; font-size: 0.95rem;">★</span>`)
            .join('');

          return `
            <div class="vocab-item-card" style="flex-direction: column; align-items: stretch; gap: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
                <div style="flex: 1;">
                  <div style="font-weight: 900; font-size: 1.05rem; color: var(--text-main);">
                    ${item.emoji || '✨'} ${item.sv}
                    <span class="th-text" style="font-size: 0.82rem; font-weight: 700; color: var(--sky-dark);">
                      (${item.phonetic})
                    </span>
                  </div>
                  <div class="th-text" style="font-size: 0.88rem; color: var(--text-main); font-weight: 600; margin-top: 2px;">
                    ${item.th} • <span style="color: #7B2CBF;">🌴 ${item.satun}</span>
                  </div>
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                  <div>${starsHtml}</div>
                  <div style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted);">${starCount}/5 stjärnor</div>
                </div>
              </div>

              <div style="display: flex; gap: 8px;">
                <button type="button" class="btn-3d btn-blue" data-vocab-normal="${item.id}" style="min-height: 44px; flex: 1; padding: 6px 10px; font-size: 0.82rem;">
                  🔊 Normal
                </button>
                <button type="button" class="btn-3d" data-vocab-turtle="${item.id}" style="min-height: 44px; flex: 1; padding: 6px 10px; font-size: 0.82rem; background: var(--lavender-soft); color: #7B2CBF; border-color: #D8B4FE;">
                  🐢 Sköldpadda
                </button>
                <button type="button" class="btn-3d btn-green" data-vocab-practice-mic="${item.id}" style="min-height: 44px; flex: 1.2; padding: 6px 10px; font-size: 0.82rem;">
                  🎙️ Öva uttal
                </button>
              </div>
            </div>
          `;
        })
        .join('');

      document.getElementById('mina-ord-search')?.addEventListener('input', (e) => {
        Part5State.data.vocabSearchQuery = e.target.value;
        this.renderVocabBank();
      });

      document.getElementById('mina-ord-filter')?.addEventListener('change', (e) => {
        Part5State.data.vocabFilter = e.target.value;
        Part5State.save();
        this.renderVocabBank();
      });

      listContainer.querySelectorAll('[data-vocab-normal]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = window.ContentDB.getItemById(btn.getAttribute('data-vocab-normal'));
          if (item) window.SpeechEngine.speakSwedish(item.sv, 0.88);
        });
      });

      listContainer.querySelectorAll('[data-vocab-turtle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = window.ContentDB.getItemById(btn.getAttribute('data-vocab-turtle'));
          if (item) window.SpeechEngine.speakSlow(item.sv);
        });
      });

      listContainer.querySelectorAll('[data-vocab-practice-mic]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = window.ContentDB.getItemById(btn.getAttribute('data-vocab-practice-mic'));
          if (item) this.openVoicePracticeModal(item);
        });
      });
    },

    openVoicePracticeModal(item) {
      let backdrop = document.getElementById('mina-ord-voice-modal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'mina-ord-voice-modal';
        backdrop.className = 'voice-practice-modal-backdrop';
        document.body.appendChild(backdrop);
      }

      const srs = window.GameEngine.SRSManager;
      const mouthGuide = window.SpeechEngine.PhoneticEvaluator.getMouthGuideForTarget(item);

      backdrop.innerHTML = `
        <div class="voice-practice-sheet" role="dialog" aria-label="Öva uttal på ${item.sv}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span class="satun-badge">🎙️ Röstträning i Mina Ord</span>
            <button type="button" class="lesson-close-btn" id="btn-close-voice-modal" aria-label="Stäng">✕</button>
          </div>

          <div class="pronunciation-card" style="padding: 14px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 60px; height: 60px; flex-shrink: 0;">
                ${window.VisualEngine.getIllustrationSVG(item)}
              </div>
              <div style="text-align: left;">
                <div class="pronun-sv-phrase" style="font-size: 1.4rem;">${item.sv}</div>
                <div style="margin-top: 4px;">
                  ${window.PhoneticBlurHelper ? window.PhoneticBlurHelper.renderHtml(item) : `<div class="pronun-phonetic-pill">คำอ่าน: ${item.phonetic}</div>`}
                </div>
              </div>
            </div>
            <div class="pronun-th-meaning" style="margin-top: 8px;">
              <strong>${item.th}</strong> • <span style="color: #7B2CBF;">🌴 ${item.satun}</span>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button type="button" class="btn-3d btn-blue" id="btn-modal-listen-normal" style="flex: 1; min-height: 48px; font-size: 0.85rem;">
                🔊 Normal (0.88x)
              </button>
              <button type="button" class="btn-3d" id="btn-modal-listen-turtle" style="flex: 1; min-height: 48px; font-size: 0.85rem; background: var(--lavender); color: #fff;">
                🐢 Sköldpadda (0.60x)
              </button>
            </div>
          </div>

          <div class="mic-stage-box" style="gap: 8px;">
            <button type="button" class="mic-record-btn state-idle" id="btn-modal-mic-start" aria-label="Tryck och prata">
              <div class="mic-btn-icon-wrap" id="modal-mic-icon">🎙️</div>
              <span class="mic-btn-status-label" id="modal-mic-label">Lyssna på mig</span>
            </button>
            <div class="live-hearing-pill" id="modal-hearing-pill">
              <span>👂</span>
              <span id="modal-hearing-text" class="th-text">แตะไมโครโฟนแล้วพูดคำว่า "${item.sv}"</span>
            </div>
            <div id="modal-eval-result" style="width: 100%;">
              <div class="mouth-guide-box">
                <div class="mouth-svg-icon">${mouthGuide.svgDiagram}</div>
                <div class="th-text" style="font-size: 0.8rem;">
                  <div style="font-weight: 800; color: var(--text-main);">👄 ${mouthGuide.titleSv}</div>
                  <div style="color: var(--text-secondary);">${mouthGuide.tipTh}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      requestAnimationFrame(() => backdrop.classList.add('open'));
      window.SpeechEngine.speakSwedish(item.sv, 0.88);
      window.PhoneticBlurHelper?.bindEvents(backdrop);

      const closeModal = () => {
        window.SpeechEngine.stopListening();
        backdrop.classList.remove('open');
        this.renderVocabBank();
      };

      document.getElementById('btn-close-voice-modal')?.addEventListener('click', closeModal);
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
      });

      document.getElementById('btn-modal-listen-normal')?.addEventListener('click', () => {
        window.SpeechEngine.speakSwedish(item.sv, 0.88);
      });
      document.getElementById('btn-modal-listen-turtle')?.addEventListener('click', () => {
        window.SpeechEngine.speakSlow(item.sv);
      });

      const micBtn = document.getElementById('btn-modal-mic-start');
      const micIcon = document.getElementById('modal-mic-icon');
      const micLabel = document.getElementById('modal-mic-label');
      const hearingText = document.getElementById('modal-hearing-text');
      const evalSlot = document.getElementById('modal-eval-result');

      micBtn?.addEventListener('click', () => {
        window.VisualEngine?.haptic('light', micBtn);

        if (window.SpeechEngine?.SpeechJudge?.isRecording || window.SpeechEngine?.AzureSpeechJudge?.isRecording) {
          window.SpeechEngine.finishRecordingAndJudge?.();
          return;
        }

        if (window.SpeechEngine?.SpeechJudge?.isAnalyzing || window.SpeechEngine?.AzureSpeechJudge?.isAnalyzing) {
          return;
        }

        window.SpeechEngine.listenAndEvaluate(item, {
          onStateChange: (state) => {
            micBtn.classList.remove('state-idle', 'state-recording', 'state-analyzing');
            if (state === 'recording') {
              micBtn.classList.add('state-recording');
              if (micIcon) micIcon.textContent = '🔴';
              if (micLabel) micLabel.innerHTML = 'Spelar in...<br>(Klicka för att stoppa)';
            } else if (state === 'analyzing') {
              micBtn.classList.add('state-analyzing');
              if (micIcon) micIcon.innerHTML = '<span class="mic-spin-star">⭐</span>';
              if (micLabel) micLabel.innerHTML = 'Tänker...';
            } else {
              micBtn.classList.add('state-idle');
              if (micIcon) micIcon.textContent = '🎙️';
              if (micLabel) micLabel.textContent = 'Lyssna på mig';
            }
          },
          onResult: (res) => {
            micBtn.classList.remove('state-recording', 'state-analyzing');
            micBtn.classList.add('state-idle');
            if (micIcon) micIcon.textContent = '🎙️';
            if (micLabel) micLabel.textContent = 'Lyssna på mig';

            const evalRes = res.evaluation;
            if (hearingText) {
              hearingText.innerHTML = `Hörde: <strong>"${evalRes.spokenClean || res.transcript}"</strong> (${evalRes.score}%)`;
            }

            if (evalRes.status === 'pass') {
              srs.recordReview(item.id, 5);
              window.GameEngine.StateManager.addXP(10);
              Part5State.incrementQuest('speak_5', 1);
              window.GameEngine.UIController.renderTopbar();

              evalSlot.innerHTML = `
                <div class="pronun-feedback-card tier-passed">
                  <div style="font-weight: 900; font-size: 1rem;">
                    🌟 GODKÄNT! (${evalRes.score}%) • หรอยจังฮู้!
                  </div>
                  <div class="th-text" style="font-size: 0.84rem; margin-top: 4px;">
                    +10 XP & Stjärnnivån för <strong>"${item.sv}"</strong> har höjts! ⭐
                  </div>
                </div>
              `;
            } else {
              evalSlot.innerHTML = `
                <div class="pronun-feedback-card ${evalRes.status === 'almost' ? 'tier-almost' : 'tier-retry'}">
                  <div style="font-weight: 900; font-size: 0.98rem;">
                    ${evalRes.status === 'almost' ? '💛 Nästan rätt!' : '🧡 Prova igen!'} (${evalRes.score}%)
                  </div>
                  <div class="th-text" style="font-size: 0.83rem; margin-top: 4px;">
                    ${evalRes.feedbackTh}
                  </div>
                </div>
              `;
            }
          }
        });
      });
    }
  };

  const WelcomeOnboard = {
    showWelcomeScreen(forceShow = false) {
      if (Part5State.data.welcomeCompleted && !forceShow) return;

      let overlay = document.getElementById('ios-welcome-onboard');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'ios-welcome-onboard';
        overlay.className = 'welcome-onboard-overlay';
        document.body.appendChild(overlay);
      }

      overlay.innerHTML = `
        <div class="welcome-onboard-card" role="dialog" aria-label="Välkommen till Svenska med Nong Dala">
          <div style="width: 108px; height: 108px;">
            ${window.VisualEngine.Mascot.getSVG(108, 'celebrating')}
          </div>
          <span class="satun-badge">🌴 ยินดีต้อนรับสู่ Svenska från Grunden (Satun Edition)</span>
          <h1 style="font-size: 1.45rem; font-weight: 900; color: var(--text-main); line-height: 1.25;">
            Välkommen! • สวัสดีจ้า มาฝึกภาษาสวีเดนสนุกๆ กันต๊ะ!
          </h1>
          <p class="th-text" style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">
            แอปฝึกพูดสวีเดนสำหรับคนใต้ (สำเนียงสตูล) 💛 เสียงอ่านชัดเจน โหมดเต่าพูดช้า 🐢 พร้อม AI ตรวจการออกเสียง Groq Whisper แม่นยำ 100%!
          </p>
          <button type="button" class="btn-3d btn-green w-full" id="btn-unlock-ios-start" style="font-size: 1.02rem; min-height: 58px;">
            🔊 Aktivera Ljud & Börja Träna • เปิดเสียงแล้วเริ่มเลย!
          </button>
        </div>
      `;

      document.getElementById('btn-unlock-ios-start')?.addEventListener('click', (e) => {
        window.VisualEngine?.haptic('light', e.currentTarget);
        window.SpeechEngine?.SoundFX?.unlockiOSAudio?.();
        window.SpeechEngine?.playSound?.('fanfare');
        window.SpeechEngine?.speakSwedish?.('Hej och välkommen! Nu tränar vi svenska tillsammans!', 0.88);

        Part5State.data.welcomeCompleted = true;
        Part5State.save();
        overlay.remove();
      });
    }
  };

  function hookUIController() {
    const ui = window.GameEngine?.UIController;
    if (!ui) return;

    const origRenderThemes = ui.renderThemesGrid.bind(ui);
    ui.renderThemesGrid = function () {
      origRenderThemes();
      const grid = document.getElementById('themes-grid');
      if (!grid) return;

      grid.querySelectorAll('.theme-card').forEach((card) => {
        const themeId = card.getAttribute('data-theme-id');
        const bossCleared = Boolean(Part5State.data.bossClearedThemes?.[themeId]?.cleared);
        if (bossCleared && !card.querySelector('.theme-boss-trophy')) {
          const badge = document.createElement('span');
          badge.className = 'theme-boss-trophy';
          badge.innerHTML = '👑 Guld';
          card.appendChild(badge);
        }
      });
    };

    ui.renderCompeteView = function () {
      CompeteAndShopUI.renderCompeteArena();
    };

    ui.renderVocabView = function () {
      MinaOrdBank.renderVocabBank();
    };
  }

  function initPart5() {
    Part5State.load();
    hookMascotWardrobe();
    hookLessonController();
    hookUIController();

    window.GamificationModals = GamificationModals;
    Object.assign(window.GameEngine, {
      Part5State,
      ArenaModes,
      CompeteAndShopUI,
      GamificationModals,
      XP_LEVELS,
      getXPLevelInfo,
      handleClaimBadge: (...args) => CompeteAndShopUI.handleClaimBadge(...args),
      handleClaimDailyQuest: (...args) => CompeteAndShopUI.handleClaimDailyQuest(...args),
      MinaOrdBank,
      WelcomeOnboard,
      MASCOT_ACCESSORIES,
      SHOP_BOOSTERS,
      APP_COLOR_THEMES,
      COLLECTIBLE_BADGES,
      startTimedSprintArena: () => ArenaModes.startSnabbSprinten60(),
      startScoreAttackArena: () => ArenaModes.startSnabbSprinten60(),
      startPronunciationChallenge: () => ArenaModes.startUttalsUtmaningen(),
      startThemeBoss: (themeId) => ArenaModes.startThemeBoss(themeId),
      startCultureMaster: () => ArenaModes.startCultureMaster(),
      startSpeedWordMatch: () => ArenaModes.startSpeedWordMatch()
    });

    window.VisualEngine?.renderMascot?.('idle');
    window.GameEngine?.UIController?.refreshAll?.();
    WelcomeOnboard.showWelcomeScreen(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPart5);
  } else {
    initPart5();
  }
})();

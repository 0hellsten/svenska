/**
 * ============================================================================
 * SVENSKA FRÅN GRUNDEN (FÖR SATUN-THAILÄNDSKA / ภาษาใต้สำเนียงสตูล) — DEL 1 AV 5
 * Huvudarkitektur: State, localStorage, SM-2 SRS, i+1 Frågegenerator, SPA & Krokar
 * ============================================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'wilawan_svenska_satun_v1';

  /* ==========================================================================
     1. KROK 1: window.ContentDB (Innehållsdatabas & API för kommande moduler)
     ========================================================================== */

  const INITIAL_THEMES = [
    {
      id: 'greetings',
      titleSv: 'Hälsningar & Artighet',
      titleTh: 'การทักทายและมารยาท',
      satunNote: 'แหลงทักทายหรอยๆ (Hälsa varmt)',
      icon: '👋',
      accent: '#58CC02',
      unlockedByDefault: true
    },
    {
      id: 'fika_food',
      titleSv: 'Mat & Svensk Fika',
      titleTh: 'อาหารและวัฒนธรรมฟีก้า',
      satunNote: 'ของกินหรอยจังฮู้ (Gott att äta)',
      icon: '☕',
      accent: '#FF9600',
      unlockedByDefault: true
    },
    {
      id: 'everyday',
      titleSv: 'Vardag & Hemmet',
      titleTh: 'ชีวิตประจำวันและบ้าน',
      satunNote: 'อยู่บ้านสบายใจ (Trivas hemma)',
      icon: '🏡',
      accent: '#1CB0F6',
      unlockedByDefault: true
    },
    {
      id: 'family_love',
      titleSv: 'Familj & Känslor',
      titleTh: 'ครอบครัวและความรู้สึก',
      satunNote: 'รักกันพันพรือ (Kärlek & omtanke)',
      icon: '❤️',
      accent: '#FF4B4B',
      unlockedByDefault: true
    },
    {
      id: 'shopping_numbers',
      titleSv: 'Siffror & Handla',
      titleTh: 'ตัวเลขและการซื้อของ',
      satunNote: 'ไปหลาดซื้อของ (Gå till marknaden)',
      icon: '🛍️',
      accent: '#CE82FF',
      unlockedByDefault: true
    },
    {
      id: 'weather_time',
      titleSv: 'Väder & Årstider',
      titleTh: 'สภาพอากาศและเวลา',
      satunNote: 'วันนี้อากาศพันพรือ (Hur är vädret?)',
      icon: '⛅',
      accent: '#FFC800',
      unlockedByDefault: true
    }
  ];

  const INITIAL_ITEMS = [
    // --- TEMA 1: HÄLSNINGAR & ARTIGHET ---
    {
      id: 'gr_hej',
      themeId: 'greetings',
      type: 'word',
      sv: 'Hej',
      th: 'สวัสดี',
      satun: 'สวัสดีจ้า (ใช้ทักทายได้ทุกเวลา)',
      phonetic: 'เฮย',
      emoji: '👋',
      svgKey: 'wave'
    },
    {
      id: 'gr_god_morgon',
      themeId: 'greetings',
      type: 'word',
      sv: 'God morgon',
      th: 'อรุณสวัสดิ์',
      satun: 'ตื่นเช้าแล้ว บายดีหม้าย (สวัสดีตอนเช้า)',
      phonetic: 'กูด-มอร์-รอน',
      emoji: '🌅',
      svgKey: 'sunrise'
    },
    {
      id: 'gr_tack',
      themeId: 'greetings',
      type: 'word',
      sv: 'Tack så mycket',
      th: 'ขอบคุณมาก',
      satun: 'ขอบใจจังฮู้ / ขอบคุณมากจ้า',
      phonetic: 'ทัก-ซอ-มึค-เคะ',
      emoji: '🙏',
      svgKey: 'heart_hands'
    },
    {
      id: 'gr_ursakta',
      themeId: 'greetings',
      type: 'word',
      sv: 'Ursäkta',
      th: 'ขอโทษ / ขออนุญาต',
      satun: 'ขอโทษนะจ๊ะ (เวลาขอทางหรือถามทาง)',
      phonetic: 'อูร์-เช็ค-ตะ',
      emoji: '🙋‍♀️',
      svgKey: 'polite'
    },
    {
      id: 'gr_hej_da',
      themeId: 'greetings',
      type: 'word',
      sv: 'Hej då',
      th: 'ลาก่อน / บ๊ายบาย',
      satun: 'ไปก่อนนะ ค่อยเจอกันหล่าว',
      phonetic: 'เฮย-ดอ',
      emoji: '✨',
      svgKey: 'sparkles'
    },
    {
      id: 'gr_sent_1',
      themeId: 'greetings',
      type: 'sentence',
      sv: 'Hej hur mår du idag',
      th: 'สวัสดี วันนี้คุณสบายดีไหม',
      satun: 'หวัดดีจ้า วันนี้บายดีหม้าย',
      phonetic: 'เฮย ฮูร์ มอร์ ดู อี-ด็อก',
      tokens: ['Hej', 'hur', 'mår', 'du', 'idag'],
      distractors: ['tack', 'kaffe', 'inte'],
      emoji: '😊',
      svgKey: 'smile'
    },
    {
      id: 'gr_sent_2',
      themeId: 'greetings',
      type: 'sentence',
      sv: 'Jag mår jättebra tack',
      th: 'ฉันสบายดีมาก ขอบคุณ',
      satun: 'ฉานบายดีจังฮู้ ขอบคุณจ้า',
      phonetic: 'ย็อก มอร์ เย็ต-เตะ-บรอ ทัก',
      tokens: ['Jag', 'mår', 'jättebra', 'tack'],
      distractors: ['du', 'hej', 'kallt'],
      emoji: '🌟',
      svgKey: 'star'
    },

    // --- TEMA 2: MAT & SVENSK FIKA ---
    {
      id: 'fk_kaffe',
      themeId: 'fika_food',
      type: 'word',
      sv: 'En kopp kaffe',
      th: 'กาแฟหนึ่งถ้วย',
      satun: 'โกปี๊สักถ้วย (คนสวีเดนชอบดื่มกาแฟตอนฟีก้า)',
      phonetic: 'เอ็น ค็อป คัฟ-เฟะ',
      emoji: '☕',
      svgKey: 'coffee'
    },
    {
      id: 'fk_kanelbulle',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Kanelbulle',
      th: 'ขนมปังซินนามอนโรล',
      satun: 'หนมปังอบเชย หอมหรอยจังฮู้',
      phonetic: 'คะ-เนล-บุล-เละ',
      emoji: '🥐',
      svgKey: 'bun'
    },
    {
      id: 'fk_vatten',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Vatten',
      th: 'น้ำเปล่า',
      satun: 'น้ำกินเย็นๆ ชื่นใจ',
      phonetic: 'วัท-เท็น',
      emoji: '💧',
      svgKey: 'water'
    },
    {
      id: 'fk_ris_fisk',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Ris och fisk',
      th: 'ข้าวและปลา',
      satun: 'ข้าวสวยกับปลา (ของชอบคนสตูล!)',
      phonetic: 'รีส อ็อค ฟิสก์',
      emoji: '🐟',
      svgKey: 'fish'
    },
    {
      id: 'fk_gott',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Jättegott',
      th: 'อร่อยมาก',
      satun: 'หรอยจังฮู้! / หรอยแรง!',
      phonetic: 'เย็ต-เตะ-ก็อต',
      emoji: '😋',
      svgKey: 'yummy'
    },
    {
      id: 'fk_sent_1',
      themeId: 'fika_food',
      type: 'sentence',
      sv: 'Jag vill ha kaffe och vatten',
      th: 'ฉันขอกาแฟและน้ำเปล่า',
      satun: 'ฉานเอาโกปี๊กับน้ำเปล่าจ้า',
      phonetic: 'ย็อก วิล ฮา คัฟ-เฟะ อ็อค วัท-เท็น',
      tokens: ['Jag', 'vill', 'ha', 'kaffe', 'och', 'vatten'],
      distractors: ['inte', 'hund', 'imorgon'],
      emoji: '🍵',
      svgKey: 'coffee'
    },
    {
      id: 'fk_sent_2',
      themeId: 'fika_food',
      type: 'sentence',
      sv: 'Maten är jättegod idag',
      th: 'อาหารวันนี้อร่อยมาก',
      satun: 'กับข้าววันนี้หรอยจังฮู้เลย',
      phonetic: 'มอ-เท็น แอร์ เย็ต-เตะ-กูด อี-ด็อก',
      tokens: ['Maten', 'är', 'jättegod', 'idag'],
      distractors: ['kaffe', 'var', 'vi'],
      emoji: '🍲',
      svgKey: 'yummy'
    },

    // --- TEMA 3: VARDAG & HEMMET ---
    {
      id: 'ev_hemma',
      themeId: 'everyday',
      type: 'word',
      sv: 'Hemma',
      th: 'อยู่ที่บ้าน',
      satun: 'อยู่เรือน / อยู่บ้านเรา',
      phonetic: 'เฮ็ม-มะ',
      emoji: '🏠',
      svgKey: 'home'
    },
    {
      id: 'ev_sova',
      themeId: 'everyday',
      type: 'word',
      sv: 'Sova gott',
      th: 'นอนหลับฝันดี',
      satun: 'นอนหลับให้บายนะจ๊ะ',
      phonetic: 'โซ-วะ ก็อต',
      emoji: '🛌',
      svgKey: 'sleep'
    },
    {
      id: 'ev_telefon',
      themeId: 'everyday',
      type: 'word',
      sv: 'Min telefon',
      th: 'โทรศัพท์ของฉัน',
      satun: 'มือถือของฉาน',
      phonetic: 'มิน เท-เล-โฟน',
      emoji: '📱',
      svgKey: 'phone'
    },
    {
      id: 'ev_nyckel',
      themeId: 'everyday',
      type: 'word',
      sv: 'En nyckel',
      th: 'กุญแจหนึ่งดอก',
      satun: 'ลูกกุญแจเรือน',
      phonetic: 'เอ็น นึค-เคล',
      emoji: '🔑',
      svgKey: 'key'
    },
    {
      id: 'ev_sent_1',
      themeId: 'everyday',
      type: 'sentence',
      sv: 'Vi ses hemma ikväll',
      th: 'เจอกันที่บ้านเย็นนี้นะ',
      satun: 'ค่ำนี้ค่อยเจอกันที่เรือนนะจ๊ะ',
      phonetic: 'วี เซส เฮ็ม-มะ อี-คเวล',
      tokens: ['Vi', 'ses', 'hemma', 'ikväll'],
      distractors: ['kaffe', 'morgon', 'dyrt'],
      emoji: '🏡',
      svgKey: 'home'
    },

    // --- TEMA 4: FAMILJ & KÄNSLOR ---
    {
      id: 'fm_alskar',
      themeId: 'family_love',
      type: 'word',
      sv: 'Jag älskar dig',
      th: 'ฉันรักคุณ',
      satun: 'รักเธอนะจ๊ะ / รักจังฮู้',
      phonetic: 'ย็อก เอล-สการ์ เดย์',
      emoji: '❤️',
      svgKey: 'heart'
    },
    {
      id: 'fm_glad',
      themeId: 'family_love',
      type: 'word',
      sv: 'Jätteglad',
      th: 'ดีใจมาก / มีความสุขมาก',
      satun: 'ดีใจจังฮู้ บายใจหลาย',
      phonetic: 'เย็ต-เตะ-กลอด',
      emoji: '🥰',
      svgKey: 'happy'
    },
    {
      id: 'fm_familj',
      themeId: 'family_love',
      type: 'word',
      sv: 'Min familj',
      th: 'ครอบครัวของฉัน',
      satun: 'ครอบครัวพี่น้องของฉาน',
      phonetic: 'มิน ฟา-มิลย์',
      emoji: '👨‍👩‍👧',
      svgKey: 'family'
    },
    {
      id: 'fm_hjarta',
      themeId: 'family_love',
      type: 'word',
      sv: 'Mitt hjärta',
      th: 'หัวใจของฉัน',
      satun: 'หัวใจดวงน้อยๆ ของฉาน',
      phonetic: 'มิท เยีย-ทะ',
      emoji: '💖',
      svgKey: 'heart'
    },
    {
      id: 'fm_sent_1',
      themeId: 'family_love',
      type: 'sentence',
      sv: 'Du gör mig så glad',
      th: 'คุณทำให้ฉันมีความสุขมาก',
      satun: 'เธอทำให้ฉานบายใจจังฮู้',
      phonetic: 'ดู เยอร์ เมย์ ซอ กลอด',
      tokens: ['Du', 'gör', 'mig', 'så', 'glad'],
      distractors: ['kallt', 'igår', 'buss'],
      emoji: '💝',
      svgKey: 'heart'
    },

    // --- TEMA 5: SIFFROR & HANDLA ---
    {
      id: 'sh_kostar',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Vad kostar det',
      th: 'อันนี้ราคาเท่าไหร่',
      satun: 'อันนี้กี่บาท / ราคาเท่าใดจ๊ะ',
      phonetic: 'วอด คอส-ทาร์ เด',
      emoji: '🏷️',
      svgKey: 'tag'
    },
    {
      id: 'sh_billigt',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Det är billigt',
      th: 'มันราคาถูก',
      satun: 'ราคาถูกจังฮู้ ซื้อได้เลย',
      phonetic: 'เด แอร์ บิล-ลิกต์',
      emoji: '🪙',
      svgKey: 'coin'
    },
    {
      id: 'sh_affar',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'I affären',
      th: 'ในร้านค้า / ซูเปอร์มาร์เก็ต',
      satun: 'ในร้านขายของ / ไปหลาด',
      phonetic: 'อี อัฟ-แฟ-เร็น',
      emoji: '🛒',
      svgKey: 'cart'
    },
    {
      id: 'sh_kort',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Betala med kort',
      th: 'จ่ายด้วยบัตร',
      satun: 'รูดบัตรจ่ายตังค์ (ที่สวีเดนใช้บัตรตลอด)',
      phonetic: 'เบ-ทา-ละ เมด คอร์ต',
      emoji: '💳',
      svgKey: 'card'
    },
    {
      id: 'sh_sent_1',
      themeId: 'shopping_numbers',
      type: 'sentence',
      sv: 'Kan jag betala med kort',
      th: 'ฉันจ่ายด้วยบัตรได้ไหม',
      satun: 'ฉานขอจ่ายด้วยบัตรได้หม้ายจ๊ะ',
      phonetic: 'คาน ย็อก เบ-ทา-ละ เมด คอร์ต',
      tokens: ['Kan', 'jag', 'betala', 'med', 'kort'],
      distractors: ['solen', 'sova', 'hej'],
      emoji: '💳',
      svgKey: 'card'
    },

    // --- TEMA 6: VÄDER & ÅRSTIDER ---
    {
      id: 'wt_sol',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Solen skiner',
      th: 'พระอาทิตย์ส่องแสง / แดดออก',
      satun: 'แดดออกหรอย เหมือนที่ทะเลสตูลเลย',
      phonetic: 'ซู-เล็น ชี-เนอร์',
      emoji: '☀️',
      svgKey: 'sun'
    },
    {
      id: 'wt_kallt',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Det är kallt',
      th: 'อากาศหนาว',
      satun: 'หนาวจังฮู้! อย่าลืมใส่เสื้ออุ่นๆ นะ',
      phonetic: 'เด แอร์ คัลต์',
      emoji: '❄️',
      svgKey: 'snow'
    },
    {
      id: 'wt_varmt',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Varmt och skönt',
      th: 'อบอุ่นและสบาย',
      satun: 'อุ่นกำลังดี บายตัวจัง',
      phonetic: 'วารม์ต อ็อค เชินต์',
      emoji: '🌷',
      svgKey: 'sun'
    },
    {
      id: 'wt_regn',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Det regnar',
      th: 'ฝนกำลังตก',
      satun: 'ฝนตกหล่าว พกร่มด้วยนะจ๊ะ',
      phonetic: 'เด เร็ง-นาร์',
      emoji: '🌧️',
      svgKey: 'rain'
    },
    {
      id: 'wt_sent_1',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Idag är det fint väder',
      th: 'วันนี้อากาศดีมาก',
      satun: 'วันนี้อากาศดีจังฮู้ ออกไปเดินเล่นกันต๊ะ',
      phonetic: 'อี-ด็อก แอร์ เด ฟีนต์ แว-เดอร์',
      tokens: ['Idag', 'är', 'det', 'fint', 'väder'],
      distractors: ['nyckel', 'tack', 'kort'],
      emoji: '🌈',
      svgKey: 'sun'
    }
  ];

  window.ContentDB = Object.assign(window.ContentDB || {}, {
    _themes: [...INITIAL_THEMES],
    _items: [...INITIAL_ITEMS],

    getThemes() {
      return this._themes;
    },

    getThemeById(themeId) {
      return this._themes.find((t) => t.id === themeId) || this._themes[0];
    },

    getAllItems() {
      return this._items;
    },

    getItemById(itemId) {
      return this._items.find((i) => i.id === itemId) || null;
    },

    getItemsByTheme(themeId) {
      if (!themeId || themeId === 'all') return this._items;
      return this._items.filter((i) => i.themeId === themeId);
    },

    registerThemes(newThemes = []) {
      newThemes.forEach((nt) => {
        const idx = this._themes.findIndex((t) => t.id === nt.id);
        if (idx >= 0) this._themes[idx] = { ...this._themes[idx], ...nt };
        else this._themes.push(nt);
      });
    },

    registerItems(newItems = []) {
      newItems.forEach((ni) => {
        const idx = this._items.findIndex((i) => i.id === ni.id);
        if (idx >= 0) this._items[idx] = { ...this._items[idx], ...ni };
        else this._items.push(ni);
      });
    }
  });

  /* ==========================================================================
     2. KROK 2: window.VisualEngine (Illustrationer, Konfetti, Haptik & Ringar)
     ========================================================================== */

  window.VisualEngine = Object.assign(window.VisualEngine || {}, {
    renderMascot(mood = 'happy') {
      const container = document.getElementById('mascot-container');
      if (!container) return;
      const mouthPath =
        mood === 'excited'
          ? 'M 22 36 Q 30 46 38 36 Z'
          : mood === 'gentle'
          ? 'M 24 38 Q 30 41 36 38'
          : 'M 22 35 Q 30 43 38 35';

      container.innerHTML = `
        <svg width="54" height="54" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="31" r="24" fill="#58CC02"/>
          <circle cx="30" cy="29" r="22" fill="#6EEB0E"/>
          <ellipse cx="21" cy="25" rx="6" ry="7" fill="white"/>
          <ellipse cx="39" cy="25" rx="6" ry="7" fill="white"/>
          <circle cx="22" cy="25" r="3.2" fill="#2D3748"/>
          <circle cx="38" cy="25" r="3.2" fill="#2D3748"/>
          <circle cx="23.2" cy="23.8" r="1.2" fill="white"/>
          <circle cx="39.2" cy="23.8" r="1.2" fill="white"/>
          <ellipse cx="14" cy="32" rx="3.5" ry="2" fill="#FF8FA3" opacity="0.7"/>
          <ellipse cx="46" cy="32" rx="3.5" ry="2" fill="#FF8FA3" opacity="0.7"/>
          <path d="${mouthPath}" stroke="#1F4E00" stroke-width="3" stroke-linecap="round" fill="${mood === 'excited' ? '#FF4B4B' : 'none'}"/>
          <path d="M 25 7 C 28 2, 34 2, 36 8" stroke="#FFC800" stroke-width="3.5" stroke-linecap="round"/>
        </svg>
      `;
    },

    getIllustrationSVG(item) {
      const emoji = item?.emoji || '🌟';
      const bgColors = {
        greetings: '#E6F9D5',
        fika_food: '#FFF2D6',
        everyday: '#E0F4FF',
        family_love: '#FFE5E8',
        shopping_numbers: '#F3E5FF',
        weather_time: '#FFF9D2'
      };
      const bg = bgColors[item?.themeId] || '#E8F8FF';

      return `
        <svg width="74" height="74" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="72" height="72" rx="20" fill="${bg}" />
          <circle cx="62" cy="18" r="6" fill="rgba(255,255,255,0.75)" />
          <text x="40" y="51" font-size="38" text-anchor="middle">${emoji}</text>
        </svg>
      `;
    },

    createProgressRingSVG(percent = 0, accentColor = '#58CC02') {
      const radius = 33;
      const circumference = 2 * Math.PI * radius;
      const clamped = Math.max(0, Math.min(100, percent));
      const offset = circumference - (clamped / 100) * circumference;

      return `
        <svg class="theme-ring-svg" width="100%" height="100%" viewBox="0 0 78 78">
          <circle cx="39" cy="39" r="${radius}" stroke="#ECECEC" stroke-width="6" fill="none" />
          <circle
            cx="39"
            cy="39"
            r="${radius}"
            stroke="${accentColor}"
            stroke-width="6"
            stroke-linecap="round"
            fill="none"
            stroke-dasharray="${circumference.toFixed(1)}"
            stroke-dashoffset="${offset.toFixed(1)}"
          />
        </svg>
      `;
    },

    haptic(type = 'light', element = null) {
      if (navigator.vibrate) {
        if (type === 'success') navigator.vibrate([18, 40, 25]);
        else if (type === 'retry') navigator.vibrate([30]);
        else navigator.vibrate(10);
      }
      if (element) {
        const cls = type === 'retry' ? 'gentle-shake' : 'haptic-pop';
        element.classList.remove(cls);
        void element.offsetWidth;
        element.classList.add(cls);
      }
    },

    spawnFloatingXP(amount = 10, x = window.innerWidth / 2, y = window.innerHeight / 2, customLabel = '') {
      const el = document.createElement('div');
      const isPenalty = typeof amount === 'number' && amount < 0;
      el.className = 'floating-xp-toast' + (isPenalty ? ' penalty-toast' : '');
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      if (customLabel) {
        el.textContent = customLabel;
      } else if (isPenalty) {
        el.textContent = `${amount} XP 💡`;
      } else {
        el.textContent = `+${amount} XP ⭐`;
      }
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1150);
    },

    triggerConfetti() {
      const canvas = document.getElementById('fx-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const colors = ['#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B', '#CE82FF'];
      const particles = Array.from({ length: 55 }, () => ({
        x: canvas.width * (0.2 + Math.random() * 0.6),
        y: canvas.height * 0.35,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 12 - 4,
        size: 6 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2
      }));

      let frame = 0;
      function animate() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.38;
          p.rot += p.vRot;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        });
        if (frame < 75) requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      requestAnimationFrame(animate);
    }
  });

  /* ==========================================================================
     PHONETIC BLUR & PROGRESSIVE REVEAL HELPER (PhoneticBlurHelper)
     Krav:
     1. De svenska orden skrivna på thai (fonetik) är suddiga/blurriga från start.
     2. Från början ska halva ordet synas om det är långt, resten blurrigt.
        Om ordet är kort ska hela första ordet synas från början.
     3. Tryck 1: Mer av ord 1 om det är långt, eller ord 2 om ord 1 är kort.
     4. Tryck 2: Ytterligare del visas (eller hela meningen).
     5. Varje tryck ger poäng-/bonusavdrag baserat på belöningsalgoritmen (-2 XP).
     ========================================================================== */

  const PhoneticBlurHelper = {
    getStages(phoneticStr, svStr) {
      const fullText = (phoneticStr || '').trim();
      if (!fullText) return [{ visible: '', blurred: '' }];

      const svWords = (svStr || '').trim().split(/\s+/).filter(Boolean);
      const firstSv = (svWords[0] || '').replace(/[^a-zA-ZåäöÅÄÖ]/g, '');
      const isFirstShort = firstSv.length <= 4;

      let tokens = [];
      if (fullText.includes(' ')) {
        tokens = fullText.split(' ').map((w, idx, arr) => idx < arr.length - 1 ? w + ' ' : w);
      } else if (fullText.includes('-')) {
        const parts = fullText.split('-');
        if (svWords.length > 1) {
          if (svWords.length === 2) {
            tokens = [parts[0] + '-', parts.slice(1).join('-')];
          } else {
            tokens = [parts[0] + '-', parts[1] + '-', parts.slice(2).join('-')];
          }
        } else {
          tokens = parts.map((p, idx, arr) => idx < arr.length - 1 ? p + '-' : p);
        }
      } else {
        tokens = [fullText];
      }

      const stages = [];
      const totalTokens = tokens.length;

      if (svWords.length <= 1 && isFirstShort) {
        // Enstaka kort ord (t.ex. Hej -> เฮย)
        stages.push({ visible: fullText, blurred: '' });
      } else if (isFirstShort && svWords.length > 1) {
        // Flerordsfras med kort första ord (t.ex. Tack så mycket, God morgon, Jag älskar dig)
        // Steg 0: Hela första ordet syns från början, resten blurrigt
        const w1 = tokens[0];
        const rest0 = tokens.slice(1).join('');
        stages.push({ visible: w1, blurred: rest0 });

        // Steg 1: Ord 2 syns också
        const w12 = tokens.slice(0, 2).join('');
        const rest1 = tokens.slice(2).join('');
        stages.push({ visible: w12, blurred: rest1 });

        // Steg 2: Helt synlig
        stages.push({ visible: fullText, blurred: '' });
      } else {
        // Första ordet är långt (t.ex. Ursäkta, Kanelbulle, Lägenhet)
        if (totalTokens >= 3) {
          const halfCount = Math.max(1, Math.floor(totalTokens / 2));
          const moreCount = Math.min(totalTokens - 1, halfCount + 1);

          // Steg 0: Halva ordet synas, resten blurrigt
          stages.push({ visible: tokens.slice(0, halfCount).join(''), blurred: tokens.slice(halfCount).join('') });
          // Steg 1: Lite mer av ord 1 synas
          stages.push({ visible: tokens.slice(0, moreCount).join(''), blurred: tokens.slice(moreCount).join('') });
          // Steg 2: Hela ordet synas
          stages.push({ visible: fullText, blurred: '' });
        } else if (totalTokens === 2) {
          stages.push({ visible: tokens[0], blurred: tokens[1] });
          stages.push({ visible: fullText, blurred: '' });
        } else {
          const halfChar = Math.max(1, Math.floor(fullText.length / 2));
          const moreChar = Math.min(fullText.length - 1, Math.floor(fullText.length * 0.75));
          stages.push({ visible: fullText.slice(0, halfChar), blurred: fullText.slice(halfChar) });
          stages.push({ visible: fullText.slice(0, moreChar), blurred: fullText.slice(moreChar) });
          stages.push({ visible: fullText, blurred: '' });
        }
      }

      // Rensa dubbletter
      const uniqueStages = [];
      stages.forEach((s) => {
        if (!uniqueStages.some((u) => u.visible === s.visible && u.blurred === s.blurred)) {
          uniqueStages.push(s);
        }
      });
      return uniqueStages;
    },

    renderHtml(item, options = {}) {
      const phoneticText = item?.phonetic || item?.phoneticTh || '';
      const svText = item?.sv || '';
      const stages = this.getStages(phoneticText, svText);
      const stage0 = stages[0] || { visible: phoneticText, blurred: '' };
      const hasBlur = Boolean(stage0.blurred);
      const extraClass = options.isBox ? 'sentence-phonetic-peek-box' : '';

      return `
        <div class="pronun-phonetic-pill interactive-phonetic-peek ${extraClass}"
             data-phonetic="${encodeURIComponent(phoneticText)}"
             data-sv="${encodeURIComponent(svText)}"
             data-stage="0"
             role="button"
             tabindex="0"
             title="${hasBlur ? 'แตะคำอ่านเพื่อเปิดดูทีละนิด (-2 XP)' : 'คำอ่าน'}"
             aria-label="Fonetisk ledtråd">
          <span class="peek-label" style="opacity: 0.85;">คำอ่าน:</span>
          <span class="phonetic-revealed-text">${stage0.visible}</span><span class="phonetic-blurred-text ${hasBlur ? 'is-blurred' : ''}">${stage0.blurred}</span>
          ${hasBlur ? `<span class="phonetic-peek-badge">👁️ แตะเปิด (-2 XP)</span>` : `<span class="phonetic-peek-badge fully-revealed">✓ ชัดเจน</span>`}
        </div>
      `;
    },

    bindEvents(container = document, onPenaltyCallback = null) {
      if (!container) return;
      const elements = container.querySelectorAll('.interactive-phonetic-peek');
      elements.forEach((el) => {
        if (el.dataset.bound === 'true') return;
        el.dataset.bound = 'true';

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const rawPhonetic = decodeURIComponent(el.getAttribute('data-phonetic') || '');
          const rawSv = decodeURIComponent(el.getAttribute('data-sv') || '');
          const stages = this.getStages(rawPhonetic, rawSv);

          let curStage = parseInt(el.getAttribute('data-stage') || '0', 10);
          if (curStage >= stages.length - 1) {
            return;
          }

          curStage += 1;
          el.setAttribute('data-stage', String(curStage));
          const next = stages[curStage];

          const revEl = el.querySelector('.phonetic-revealed-text');
          const blurEl = el.querySelector('.phonetic-blurred-text');
          const badgeEl = el.querySelector('.phonetic-peek-badge');

          if (revEl) revEl.textContent = next.visible;
          if (blurEl) {
            blurEl.textContent = next.blurred;
            if (!next.blurred) {
              blurEl.classList.remove('is-blurred');
            }
          }

          const isFullyRevealed = !next.blurred || curStage >= stages.length - 1;
          if (badgeEl) {
            if (isFullyRevealed) {
              badgeEl.className = 'phonetic-peek-badge fully-revealed';
              badgeEl.textContent = '✓ ครบแล้ว';
            } else {
              badgeEl.className = 'phonetic-peek-badge';
              badgeEl.textContent = '👁️ แตะเปิด (-2 XP)';
            }
          }

          // Haptisk och auditiv feedback
          window.VisualEngine?.haptic?.('light', el);
          window.SpeechEngine?.playSound?.('tap');

          // Poäng/bonusavdrag (-2 XP)
          const rect = el.getBoundingClientRect();
          const penaltyAmount = 2;
          if (window.VisualEngine?.spawnFloatingXP) {
            window.VisualEngine.spawnFloatingXP(-penaltyAmount, rect.left + rect.width / 2, rect.top, `-${penaltyAmount} XP 💡`);
          }

          if (typeof onPenaltyCallback === 'function') {
            onPenaltyCallback(penaltyAmount);
          } else if (window.GameEngine?.LessonController) {
            const lc = window.GameEngine.LessonController;
            lc.currentQuestionPenalty = (lc.currentQuestionPenalty || 0) + penaltyAmount;
          }
        });
      });
    }
  };

  window.PhoneticBlurHelper = PhoneticBlurHelper;

  /* ==========================================================================
     3. KROK 3: window.SpeechEngine (TTS, Långsam Sköldpadda, Ljudeffekter & Tal)
     ========================================================================== */

  window.SpeechEngine = Object.assign(window.SpeechEngine || {}, {
    _audioCtx: null,
    _customPronunciationHandler: null,

    _getAudioContext() {
      if (!this._audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this._audioCtx = new AudioCtx();
      }
      if (this._audioCtx && this._audioCtx.state === 'suspended') {
        this._audioCtx.resume().catch(() => {});
      }
      return this._audioCtx;
    },

    playSound(effect = 'tap') {
      try {
        const ctx = this._getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        const playTone = (freq, start, duration, type = 'sine', gainVal = 0.14) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, now + start);
          gain.gain.setValueAtTime(gainVal, now + start);
          gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + start);
          osc.stop(now + start + duration);
        };

        if (effect === 'tap') {
          playTone(520, 0, 0.06, 'sine', 0.08);
        } else if (effect === 'correct') {
          playTone(587.33, 0, 0.11, 'triangle', 0.16);
          playTone(880.0, 0.09, 0.24, 'triangle', 0.18);
        } else if (effect === 'match') {
          playTone(659.25, 0, 0.08, 'sine', 0.14);
          playTone(987.77, 0.07, 0.16, 'sine', 0.15);
        } else if (effect === 'retry') {
          // Varm, mjuk ton vid "Nästan! Prova igen" (aldrig hård/straffande)
          playTone(392.0, 0, 0.14, 'sine', 0.12);
          playTone(349.23, 0.12, 0.22, 'sine', 0.12);
        } else if (effect === 'fanfare') {
          playTone(523.25, 0, 0.12, 'triangle', 0.16);
          playTone(659.25, 0.11, 0.12, 'triangle', 0.16);
          playTone(783.99, 0.22, 0.12, 'triangle', 0.16);
          playTone(1046.5, 0.34, 0.38, 'triangle', 0.2);
        }
      } catch (_) {
        // Ignorera om ljud är blockerat
      }
    },

    speakSwedish(text, rate = 0.88, onEnd = null) {
      if (window.AudioPlayer?.speakSwedish) {
        return window.AudioPlayer.speakSwedish(text, rate, onEnd);
      }
      if (!('speechSynthesis' in window) || !text) {
        if (onEnd) setTimeout(onEnd, 300);
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'sv-SE';
        utter.rate = rate;
        utter.pitch = 1.02;

        const voices = window.speechSynthesis.getVoices() || [];
        const svVoice =
          voices.find((v) => /enhanced|premium/i.test(v.name) && v.lang.startsWith('sv')) ||
          voices.find((v) => /alva|klara/i.test(v.name)) ||
          voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('sv'));
        if (svVoice) utter.voice = svVoice;

        window._activeUtterance = utter;
        utter.onend = () => {
          window._activeUtterance = null;
          if (onEnd) onEnd();
        };
        utter.onerror = () => {
          window._activeUtterance = null;
          if (onEnd) onEnd();
        };
        window.speechSynthesis.speak(utter);
      } catch (_) {
        if (onEnd) onEnd();
      }
    },

    speakSlow(text, onEnd = null) {
      // Sköldpadds-tempo (0.60x) för extra tydlig artikulation
      if (window.AudioPlayer?.speakSlow) {
        return window.AudioPlayer.speakSlow(text, onEnd);
      }
      this.speakSwedish(text, 0.60, onEnd);
    },

    speakThai(text) {
      if (!('speechSynthesis' in window) || !text) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'th-TH';
        utter.rate = 0.95;
        window.speechSynthesis.speak(utter);
      } catch (_) {}
    },

    /**
     * Krok för Steg 3: Extern röstmodul kan registrera en egen uttalsbedömare här.
     */
    registerPronunciationHandler(fn) {
      this._customPronunciationHandler = fn;
    },

    listenAndEvaluate(targetItem, callbacks = {}) {
      const { onStart, onResult, onFallbackReady } = callbacks;

      // Om Steg 3 har kopplat sin röstmotor, använd den direkt
      if (typeof this._customPronunciationHandler === 'function') {
        return this._customPronunciationHandler(targetItem, callbacks);
      }

      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = 'sv-SE';
          rec.interimResults = false;
          rec.maxAlternatives = 3;

          let handled = false;
          if (onStart) onStart();

          rec.onresult = (event) => {
            handled = true;
            const transcripts = [];
            for (let i = 0; i < event.results[0].length; i++) {
              transcripts.push(event.results[0][i].transcript.toLowerCase().trim());
            }
            const targetNorm = targetItem.sv.toLowerCase().trim();
            const matched = transcripts.some(
              (t) =>
                t.includes(targetNorm) ||
                targetNorm.includes(t) ||
                this._similarity(t, targetNorm) >= 0.55
            );
            if (onResult) {
              onResult({
                passed: true,
                exactMatch: matched,
                transcript: transcripts[0] || targetItem.sv,
                confidence: matched ? 0.95 : 0.78
              });
            }
          };

          rec.onerror = () => {
            if (!handled && onFallbackReady) onFallbackReady();
          };

          rec.onend = () => {
            if (!handled && onFallbackReady) onFallbackReady();
          };

          rec.start();
          return;
        } catch (_) {
          if (onFallbackReady) onFallbackReady();
          return;
        }
      }

      // iOS Safari PWA / Enhet utan WebSpeech-mikrofon: Simulerad röstinspelning (redo för Steg 3)
      if (onStart) onStart();
      setTimeout(() => {
        if (onFallbackReady) onFallbackReady();
      }, 1700);
    },

    _similarity(a, b) {
      if (!a || !b) return 0;
      const setA = new Set(a.split(''));
      const setB = new Set(b.split(''));
      let common = 0;
      setA.forEach((ch) => {
        if (setB.has(ch)) common++;
      });
      return common / Math.max(setA.size, setB.size, 1);
    }
  });

  /* ==========================================================================
     4. STATE & LOCALSTORAGE PERSISTENS (Krav 1 & 4)
     ========================================================================== */

  function getTodayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function createDefaultState() {
    return {
      totalXP: 0,
      dailyXP: 0,
      dailyGoalXP: 100,
      gems: 50,
      streakDays: 1,
      lastActiveDate: getTodayISO(),
      selectedTrainingMode: 'mix',
      unlockedThemes: ['greetings', 'fika_food', 'everyday', 'family_love', 'shopping_numbers', 'weather_time'],
      themeStars: {
        greetings: 0,
        fika_food: 0,
        everyday: 0,
        family_love: 0,
        shopping_numbers: 0,
        weather_time: 0
      },
      // SM-2 Spaced Repetition per itemId
      srsData: {},
      // Tävlingsdata
      competition: {
        bestSprintSeconds: null,
        highScoreAttack: 0,
        dailyQuestsDate: getTodayISO(),
        quests: {
          xp_50: { progress: 0, target: 50, claimed: false, rewardGems: 15, titleSv: 'Samla 50 XP idag', titleTh: 'สะสมครบ 50 XP วันนี้' },
          lessons_1: { progress: 0, target: 1, claimed: false, rewardGems: 20, titleSv: 'Klara 1 lektion', titleTh: 'เรียนจบ 1 บทเรียน' },
          turtle_3: { progress: 0, target: 3, claimed: false, rewardGems: 15, titleSv: 'Lyssna i sköldpadds-tempo 3 ggr', titleTh: 'กดฟังเสียงเต่าช้าๆ 3 ครั้ง' }
        }
      }
    };
  }

  const StateManager = {
    state: createDefaultState(),

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.state = {
            ...createDefaultState(),
            ...parsed,
            dailyGoalXP: Math.max(100, parsed.dailyGoalXP || 100),
            themeStars: { ...createDefaultState().themeStars, ...(parsed.themeStars || {}) },
            srsData: { ...(parsed.srsData || {}) },
            competition: {
              ...createDefaultState().competition,
              ...(parsed.competition || {}),
              quests: {
                ...createDefaultState().competition.quests,
                ...(parsed.competition?.quests || {})
              }
            }
          };
        }
      } catch (_) {
        this.state = createDefaultState();
      }
      this._checkDayRollover();
      this.save();
    },

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (_) {}
    },

    _checkDayRollover() {
      const today = getTodayISO();
      const last = this.state.lastActiveDate;
      if (last !== today) {
        const lastDate = new Date(last + 'T00:00:00');
        const currDate = new Date(today + 'T00:00:00');
        const diffDays = Math.round((currDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          this.state.streakDays += 1;
        } else if (diffDays > 1) {
          this.state.streakDays = 1;
        }
        this.state.dailyXP = 0;
        this.state.lastActiveDate = today;

        // Nollställ dagliga utmaningar för ny dag
        const freshQuests = createDefaultState().competition.quests;
        this.state.competition.dailyQuestsDate = today;
        this.state.competition.quests = freshQuests;
      }
    },

    addXP(amount) {
      this.state.totalXP += amount;
      this.state.dailyXP += amount;
      window.GameEngine.updateQuestProgress('xp_50', amount);
      this.save();
      UIController.renderTopbar();
    },

    addGems(amount) {
      this.state.gems += amount;
      this.save();
      UIController.renderTopbar();
    }
  };

  /* ==========================================================================
     5. PEDAGOGISK MOTOR: FÖRENKLAD SM-2 SPACED REPETITION (Krav 4)
     ========================================================================== */

  const SRSManager = {
    getRecord(itemId) {
      if (!StateManager.state.srsData[itemId]) {
        StateManager.state.srsData[itemId] = {
          masteryLevel: 0, // 0–5
          repetitions: 0,
          easinessFactor: 2.5,
          intervalHours: 0,
          nextReview: 0,
          lastReviewed: 0,
          correctCount: 0,
          attemptCount: 0
        };
      }
      return StateManager.state.srsData[itemId];
    },

    /**
     * Uppdaterar ett ords/menings SM-2 data efter svar.
     * @param {string} itemId
     * @param {number} quality 0–5 (5 = direkt rätt, 4 = rätt på försök 2, 2 = behövde mer övning)
     */
    recordReview(itemId, quality = 5) {
      const rec = this.getRecord(itemId);
      const now = Date.now();
      rec.attemptCount += 1;
      rec.lastReviewed = now;

      if (quality >= 3) {
        rec.correctCount += 1;
        rec.repetitions += 1;
        rec.masteryLevel = Math.min(5, rec.masteryLevel + 1);

        // SM-2 intervall i timmar (växer från 4h -> 24h -> 72h -> osv.)
        if (rec.repetitions === 1) {
          rec.intervalHours = 4;
        } else if (rec.repetitions === 2) {
          rec.intervalHours = 24;
        } else {
          rec.intervalHours = Math.round(rec.intervalHours * rec.easinessFactor);
        }
      } else {
        // Mjuk reduktion vid osäkerhet – aldrig straffande nollställning av allt
        rec.repetitions = 0;
        rec.masteryLevel = Math.max(1, rec.masteryLevel - 1);
        rec.intervalHours = 2;
      }

      // SM-2 Easiness Factor justering
      const qDiff = 5 - quality;
      rec.easinessFactor = Math.max(
        1.3,
        rec.easinessFactor + (0.1 - qDiff * (0.08 + qDiff * 0.02))
      );

      rec.nextReview = now + rec.intervalHours * 3600 * 1000;
      StateManager.save();
    },

    getDueItems(themeId = 'all') {
      const now = Date.now();
      const items = window.ContentDB.getItemsByTheme(themeId);
      return items.filter((item) => {
        const rec = StateManager.state.srsData[item.id];
        return rec && rec.masteryLevel > 0 && rec.nextReview <= now;
      });
    },

    getThemeProgressPercent(themeId) {
      const items = window.ContentDB.getItemsByTheme(themeId);
      if (!items.length) return 0;
      const maxPoints = items.length * 5;
      const currentPoints = items.reduce((sum, item) => {
        const rec = this.getRecord(item.id);
        return sum + rec.masteryLevel;
      }, 0);
      return Math.round((currentPoints / maxPoints) * 100);
    },

    /**
     * i+1 Urval: Kombinerar kända/repeterbara ord (i) med lagom mängd nya ord (+1)
     */
    selectItemsForLesson(themeId = 'all', count = 6, filterType = null) {
      let pool = window.ContentDB.getItemsByTheme(themeId);
      if (filterType) {
        const typed = pool.filter((item) => item.type === filterType);
        if (typed.length > 0) pool = typed;
      }

      const now = Date.now();
      const due = [];
      const learning = [];
      const unseen = [];

      pool.forEach((item) => {
        const rec = this.getRecord(item.id);
        if (rec.masteryLevel > 0 && rec.nextReview <= now) {
          due.push(item);
        } else if (rec.masteryLevel > 0) {
          learning.push(item);
        } else {
          unseen.push(item);
        }
      });

      // i+1 mix: Först förfallna SRS-ord, sedan kända ord som befästs (i), plus 2 nya ord (+1)
      const selected = [
        ...this._shuffle(due).slice(0, 2),
        ...this._shuffle(learning).slice(0, 2),
        ...this._shuffle(unseen).slice(0, 3)
      ];

      // Fyll upp till önskat antal om det behövs
      const remaining = this._shuffle(pool).filter((i) => !selected.includes(i));
      while (selected.length < Math.min(count, pool.length) && remaining.length > 0) {
        selected.push(remaining.shift());
      }

      return this._shuffle(selected);
    },

    _shuffle(arr) {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
  };

  /* ==========================================================================
     6. FRÅGEGENERATOR MED 5 ÖVNINGSTYPER (Krav 4a–4e)
     ========================================================================== */

  const QuestionGenerator = {
    buildLessonQueue(themeId, mode = 'mix') {
      const allThemeItems = window.ContentDB.getItemsByTheme(themeId);
      const allItems = window.ContentDB.getAllItems();
      const questions = [];

      if (mode === 'words') {
        const wordItems = SRSManager.selectItemsForLesson(themeId, 5, 'word');
        wordItems.forEach((item, idx) => {
          questions.push(
            idx % 2 === 0
              ? this.createImageChoiceQuestion(item, allItems)
              : this.createListenUnderstandQuestion(item, allItems)
          );
        });
        questions.push(this.createMatchingSprintQuestion(allThemeItems, allItems));
      } else if (mode === 'sentences') {
        const sentItems = allThemeItems.filter((i) => i.type === 'sentence');
        const pool = sentItems.length ? sentItems : allItems.filter((i) => i.type === 'sentence');
        pool.forEach((item) => {
          questions.push(this.createSentenceBuilderQuestion(item));
          questions.push(this.createListenUnderstandQuestion(item, allItems));
        });
      } else if (mode === 'listen') {
        const items = SRSManager.selectItemsForLesson(themeId, 5);
        items.forEach((item) => {
          questions.push(this.createListenUnderstandQuestion(item, allItems));
        });
      } else if (mode === 'speak') {
        const items = SRSManager.selectItemsForLesson(themeId, 5);
        items.forEach((item) => {
          questions.push(this.createPronunciationQuestion(item));
        });
      } else {
        // 'mix' (i+1 Komplett lektion med alla 5 övningstyper a, b, c, d, e!)
        const words = SRSManager.selectItemsForLesson(themeId, 4, 'word');
        const sentences = allThemeItems.filter((i) => i.type === 'sentence');
        const targetSentence =
          sentences[0] || allItems.find((i) => i.type === 'sentence') || words[0];

        if (words[0]) questions.push(this.createImageChoiceQuestion(words[0], allItems));
        if (words[1] || words[0]) {
          questions.push(this.createListenUnderstandQuestion(words[1] || words[0], allItems));
        }
        if (targetSentence && targetSentence.tokens) {
          questions.push(this.createSentenceBuilderQuestion(targetSentence));
        }
        if (words[2] || words[0]) {
          questions.push(this.createPronunciationQuestion(words[2] || words[0]));
        }
        questions.push(this.createMatchingSprintQuestion(allThemeItems, allItems));
      }

      return questions;
    },

    // a) Bild + Ljud -> Välj rätt svenskt ord (4 val med thailändsk översättning/uttal)
    createImageChoiceQuestion(targetItem, allItems) {
      const distractors = SRSManager._shuffle(
        allItems.filter((i) => i.id !== targetItem.id && i.type === 'word')
      ).slice(0, 3);
      const options = SRSManager._shuffle([targetItem, ...distractors]);

      return {
        type: 'image_choice',
        typeLabel: '🖼️ Bild & Ljud • รูปภาพและเสียง',
        promptSv: 'Välj rätt svenskt ord',
        promptTh: 'เลือกคำภาษาสวีเดนที่ตรงกับภาพและความหมาย',
        targetItem,
        options
      };
    },

    // b) Bygg meningen (Word Bank med klickbara ord-bubblor från thailändska till svenska)
    createSentenceBuilderQuestion(targetItem) {
      const correctTokens = targetItem.tokens || targetItem.sv.split(' ');
      const extraTokens = targetItem.distractors || ['och', 'inte', 'idag'];
      const bankTokens = SRSManager._shuffle([...correctTokens, ...extraTokens.slice(0, 2)]).map(
        (word, index) => ({
          id: `tok_${index}_${word}`,
          word
        })
      );

      return {
        type: 'sentence_builder',
        typeLabel: '🧩 Bygg meningen • เรียงประโยค',
        promptSv: 'Bygg meningen på svenska',
        promptTh: 'แตะลูกโป่งคำศัพท์เพื่อเรียงเป็นประโยคภาษาสวีเดน',
        targetItem,
        correctTokens,
        bankTokens
      };
    },

    // c) Lyssna och förstå (Spela upp svenska i normalt + sköldpadds-tempo -> välj rätt betydelse)
    createListenUnderstandQuestion(targetItem, allItems) {
      const distractors = SRSManager._shuffle(
        allItems.filter((i) => i.id !== targetItem.id)
      ).slice(0, 3);
      const options = SRSManager._shuffle([targetItem, ...distractors]);

      return {
        type: 'listen_understand',
        typeLabel: '🎧 Lyssna & Förstå • ฟังและเลือกความหมาย',
        promptSv: 'Lyssna och välj rätt betydelse',
        promptTh: 'กดฟังเสียงปกติ (🔊) หรือเสียงเต่าช้าๆ (🐢) แล้วเลือกความหมายที่ถูกต้อง',
        targetItem,
        options
      };
    },

    // d) Uttalsövning (Prata in i mikrofonen – kopplas i Steg 3)
    createPronunciationQuestion(targetItem) {
      return {
        type: 'pronunciation',
        typeLabel: '🎙️ Uttalsövning • ฝึกพูดออกเสียง',
        promptSv: 'Säg frasen högt på svenska',
        promptTh: 'ฟังเสียงตัวอย่าง แล้วกดไมโครโฟนเพื่อแหลงสวีเดนตามคำอ่าน',
        targetItem
      };
    },

    // e) Matchnings-sprint (Para ihop 5 svenska ord med 5 thailändska ord på tid)
    createMatchingSprintQuestion(themeItems, allItems) {
      let pool = themeItems.filter((i) => i.type === 'word');
      if (pool.length < 5) {
        const extras = allItems.filter((i) => i.type === 'word' && !pool.includes(i));
        pool = [...pool, ...extras];
      }
      const fivePairs = SRSManager._shuffle(pool).slice(0, 5);

      return {
        type: 'matching_sprint',
        typeLabel: '⚡ Matchnings-sprint • จับคู่คำศัพท์ 5 คู่',
        promptSv: 'Para ihop svenska och thailändska!',
        promptTh: 'แตะจับคู่คำภาษาสวีเดน (ซ้าย) กับภาษาไทย (ขวา) ให้ครบ 5 คู่!',
        targetItem: fivePairs[0],
        pairs: fivePairs,
        leftColumn: SRSManager._shuffle([...fivePairs]),
        rightColumn: SRSManager._shuffle([...fivePairs])
      };
    },

    // Aliaser för sömlös koppling till Tävlingsarenor (Del 5 / Gamification)
    createImageChoice(targetItem, allItems) {
      return this.createImageChoiceQuestion(targetItem, allItems);
    },
    createSentenceBuilder(targetItem, allItems) {
      return this.createSentenceBuilderQuestion(targetItem);
    },
    createListenUnderstand(targetItem, allItems) {
      return this.createListenUnderstandQuestion(targetItem, allItems);
    },
    createPronunciation(targetItem) {
      return this.createPronunciationQuestion(targetItem);
    },
    createMatchingSprint(themeItems, allItems) {
      return this.createMatchingSprintQuestion(themeItems, allItems);
    },

    // f) Kontextlucka / Fyll i luckan i en mening
    createClozeQuestion(targetItem, allItems) {
      const tokens = targetItem.tokens || targetItem.sv.replace(/[.,!?]/g, '').split(/\s+/);
      const candidates = tokens.filter((w) => w.length >= 3);
      const blankWord = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : tokens[0];
      const sentenceDisplay = targetItem.sv.replace(new RegExp(`\\b${blankWord}\\b`, 'i'), '______');

      const otherWords = allItems
        .filter((i) => i.id !== targetItem.id && i.sv !== blankWord && i.type === 'word')
        .map((i) => i.sv);
      const shuffledOthers = SRSManager._shuffle(otherWords).slice(0, 3);
      const options = SRSManager._shuffle([
        { id: 'correct', word: blankWord, isCorrect: true },
        ...shuffledOthers.map((w, idx) => ({ id: `dist_${idx}`, word: w, isCorrect: false }))
      ]);

      return {
        type: 'cloze_context',
        typeLabel: '🧩 Kontextlucka • เติมคำในช่องว่าง',
        promptSv: 'Vilket ord saknas i meningen?',
        promptTh: 'เลือกคำศัพท์ที่ถูกต้องเพื่อเติมลงในประโยคให้สมบูรณ์',
        targetItem,
        blankWord,
        sentenceDisplay,
        fullSentence: targetItem.sv,
        correctId: 'correct',
        correctAnswerText: blankWord,
        options
      };
    },

    // g) Vardagsdialog & samtalssituationer
    createDialogueQuestion(targetItem, allItems) {
      let promptSpeakerSv = 'Hej! Vad kan jag hjälpa dig med idag?';
      let promptSpeakerTh = 'สวัสดีครับ มีอะไรให้ช่วยไหมครับ?';
      let correctReplySv = targetItem.sv;
      let correctReplyTh = targetItem.th;

      if (targetItem.sv.includes('?')) {
        const parts = targetItem.sv.split('?');
        promptSpeakerSv = parts[0].trim() + '?';
        correctReplySv = parts[1] ? parts[1].trim() : targetItem.sv;
      }

      const distractors = targetItem.distractorsSv || ['Nej, jag heter Wilawan', 'Klockan är sju', 'Det snöar ute'];
      const options = SRSManager._shuffle([
        { id: 'correct', sv: correctReplySv, th: correctReplyTh, isCorrect: true },
        ...distractors.slice(0, 3).map((d, idx) => ({
          id: `dist_${idx}`,
          sv: d,
          th: targetItem.distractorsTh?.[idx] || 'คำตอบอื่น',
          isCorrect: false
        }))
      ]);

      return {
        type: 'dialogue_scenario',
        typeLabel: '💬 Vardagsdialog • บทสนทนาใช้จริง',
        promptSv: 'Vad svarar du i samtalet?',
        promptTh: 'เลือกคำตอบที่สุภาพและเป็นธรรมชาติที่สุดในสถานการณ์จริง',
        targetItem,
        dialoguePromptSv: promptSpeakerSv,
        dialoguePromptTh: promptSpeakerTh,
        correctId: 'correct',
        correctAnswerText: correctReplySv,
        options
      };
    },

    // h) Svenska kulturbegrepp & vardagsliv
    createConceptQuestion(targetItem, allItems) {
      const conceptName = targetItem.sv;
      const distractors = targetItem.distractorsTh || ['การทำงานล่วงเวลาที่บริษัท', 'การซื้อเสื้อผ้าใหม่ในห้าง', 'การพักผ่อนวันหยุดยาว'];
      const options = SRSManager._shuffle([
        { id: 'correct', textTh: targetItem.th, satunNote: targetItem.satunFlavor, isCorrect: true },
        ...distractors.slice(0, 3).map((d, idx) => ({
          id: `dist_${idx}`,
          textTh: d,
          satunNote: '',
          isCorrect: false
        }))
      ]);

      return {
        type: 'concept_quiz',
        typeLabel: '🇸🇪 Svenskt Begrepp • วัฒนธรรมสวีเดน',
        promptSv: `Vad innebär "${conceptName}"?`,
        promptTh: `คำว่า "${conceptName}" (${targetItem.phoneticTh || targetItem.phonetic}) มีความหมายอย่างไรในสังคมสวีเดน?`,
        targetItem,
        conceptName,
        correctId: 'correct',
        correctAnswerText: targetItem.th,
        options
      };
    },

    // Aliaser
    createCloze(targetItem, allItems) {
      return this.createClozeQuestion(targetItem, allItems);
    },
    createDialogue(targetItem, allItems) {
      return this.createDialogueQuestion(targetItem, allItems);
    },
    createConcept(targetItem, allItems) {
      return this.createConceptQuestion(targetItem, allItems);
    }
  };

  /* ==========================================================================
     7. KROK 4: window.GameEngine (Poängjakt, Tidstävling & Dagliga Utmaningar)
     ========================================================================== */

  window.GameEngine = Object.assign(window.GameEngine || {}, {
    updateQuestProgress(questKey, delta = 1) {
      const q = StateManager.state.competition.quests[questKey];
      if (!q) return;
      q.progress = Math.min(q.target, q.progress + delta);
      StateManager.save();
    },

    claimQuestReward(questKey, btnElement = null) {
      const q = StateManager.state.competition.quests[questKey];
      if (!q || q.claimed || q.progress < q.target) return;
      q.claimed = true;
      StateManager.addGems(q.rewardGems);
      window.SpeechEngine.playSound('fanfare');
      window.VisualEngine.triggerConfetti();
      if (btnElement) {
        const rect = btnElement.getBoundingClientRect();
        window.VisualEngine.spawnFloatingXP(q.rewardGems, rect.left + rect.width / 2, rect.top);
      }
      UIController.renderCompeteView();
    },

    startTimedSprintArena() {
      const allItems = window.ContentDB.getAllItems();
      const q = QuestionGenerator.createMatchingSprintQuestion(allItems, allItems);
      LessonController.startCustomQueue([q], {
        title: 'Tidstävling • จับคู่สายฟ้าแลบ',
        isTimedSprintArena: true
      });
    },

    startScoreAttackArena() {
      const allItems = window.ContentDB.getAllItems();
      const words = SRSManager._shuffle(allItems).slice(0, 6);
      const queue = words.map((item, idx) =>
        idx % 2 === 0
          ? QuestionGenerator.createImageChoiceQuestion(item, allItems)
          : QuestionGenerator.createListenUnderstandQuestion(item, allItems)
      );
      LessonController.startCustomQueue(queue, {
        title: 'Poängjakt • ล่าแต้มคอมโบ',
        isScoreAttackArena: true
      });
    }
  });

  /* ==========================================================================
     8. LEKTIONSMOTOR (LessonController)
     ========================================================================== */

  const LessonController = {
    queue: [],
    currentIndex: 0,
    combo: 1,
    sessionXP: 0,
    themeId: 'greetings',
    options: {},

    // Aktuellt frågetillstånd
    selectedOptionId: null,
    selectedTokens: [],
    pronunciationPassed: false,
    sprintState: null,

    startThemeLesson(themeId) {
      this.themeId = themeId;
      const mode = StateManager.state.selectedTrainingMode || 'mix';
      const queue = QuestionGenerator.buildLessonQueue(themeId, mode);
      this.startCustomQueue(queue, { themeId, mode });
    },

    startSRSReviewLesson() {
      const due = SRSManager.getDueItems('all');
      const allItems = window.ContentDB.getAllItems();
      const targetPool = due.length > 0 ? due : SRSManager.selectItemsForLesson('all', 5);
      const queue = targetPool.slice(0, 5).map((item, idx) =>
        idx % 2 === 0
          ? QuestionGenerator.createImageChoiceQuestion(item, allItems)
          : QuestionGenerator.createListenUnderstandQuestion(item, allItems)
      );
      this.startCustomQueue(queue, { themeId: 'all', isSRSReview: true });
    },

    launchCustomLesson(themeId, queue, options = {}) {
      this.themeId = themeId || 'all';
      return this.startCustomQueue(queue, { themeId: this.themeId, ...options });
    },

    startCustomQueue(queue, options = {}) {
      this.queue = queue;
      this.currentIndex = 0;
      this.combo = 1;
      this.sessionXP = 0;
      this.options = options;

      const overlay = document.getElementById('lesson-overlay');
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');

      document.getElementById('lesson-bottom-bar').style.display = 'block';
      this.hideFeedbackSheet();
      this.renderCurrentQuestion();
    },

    closeLesson() {
      if (this.sprintState?.timerInterval) {
        clearInterval(this.sprintState.timerInterval);
      }
      const overlay = document.getElementById('lesson-overlay');
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      UIController.refreshAll();
    },

    updateHeaderProgress() {
      const total = Math.max(1, this.queue.length);
      const pct = Math.round((this.currentIndex / total) * 100);
      const fill = document.getElementById('lesson-progress-fill');
      if (fill) fill.style.width = `${pct}%`;

      const comboPill = document.getElementById('lesson-combo-pill');
      if (comboPill) comboPill.textContent = `🔥 ${this.combo}x`;
    },

    renderCurrentQuestion() {
      this.hideFeedbackSheet();
      this.updateHeaderProgress();

      if (this.currentIndex >= this.queue.length) {
        this.renderLessonComplete();
        return;
      }

      const q = this.queue[this.currentIndex];
      this.selectedOptionId = null;
      this.selectedTokens = [];
      this.pronunciationPassed = false;
      this.currentQuestionPenalty = 0;

      const checkBtn = document.getElementById('btn-check-answer');
      checkBtn.disabled = true;
      checkBtn.textContent = 'KONTROLLERA • ตรวจคำตอบ';
      document.getElementById('lesson-bottom-bar').style.display =
        q.type === 'matching_sprint' ? 'none' : 'block';

      const stage = document.getElementById('lesson-stage');

      if (q.type === 'image_choice') {
        this._renderImageChoice(stage, q);
      } else if (q.type === 'sentence_builder') {
        this._renderSentenceBuilder(stage, q);
      } else if (q.type === 'listen_understand') {
        this._renderListenUnderstand(stage, q);
      } else if (q.type === 'pronunciation') {
        this._renderPronunciation(stage, q);
      } else if (q.type === 'matching_sprint') {
        this._renderMatchingSprint(stage, q);
      } else if (q.type === 'cloze_context') {
        this._renderClozeContext(stage, q);
      } else if (q.type === 'dialogue_scenario') {
        this._renderDialogueScenario(stage, q);
      } else if (q.type === 'concept_quiz') {
        this._renderConceptQuiz(stage, q);
      }
    },

    // --- 4a: BILD + LJUD -> 4 VAL ---
    _renderImageChoice(stage, q) {
      const item = q.targetItem;
      stage.innerHTML = `
        <div class="exercise-badge-row">
          <span class="exercise-type-tag">${q.typeLabel}</span>
          <span class="satun-badge">🌴 สำเนียงสตูล</span>
        </div>
        <h2 class="exercise-prompt-sv">${q.promptSv}</h2>
        <p class="exercise-prompt-th">${q.promptTh}</p>

        <div class="illustration-showcase">
          <div class="illustration-svg-box">
            ${window.VisualEngine.getIllustrationSVG(item)}
          </div>
          <div class="illustration-details">
            <div class="thai-target-word">${item.th}</div>
            <div class="satun-hint-line">💬 ${item.satun}</div>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <button type="button" class="btn-3d btn-blue" id="btn-play-normal" style="min-height: 46px; padding: 6px 12px; font-size: 0.84rem; display: inline-flex; align-items: center; gap: 6px;">
                <span class="audio-btn-icon">${window.VisualEngine.getAudioIconSVG('speaker', 20)}</span> Lyssna
              </button>
              <button type="button" class="btn-3d" id="btn-play-slow" style="min-height: 46px; padding: 6px 12px; font-size: 0.84rem; background: var(--lavender-soft); color: #7B2CBF; border-color: #D8B4FE; box-shadow: 0 3px 0 #C084FC; display: inline-flex; align-items: center; gap: 6px;">
                <span class="audio-btn-icon">${window.VisualEngine.getAudioIconSVG('turtle', 20)}</span> Långsamt
              </button>
            </div>
          </div>
        </div>

        <div class="choices-grid-2x2" id="choices-container">
          ${q.options
            .map(
              (opt) => `
            <button type="button" class="btn-3d btn-surface choice-card-btn" data-option-id="${opt.id}">
              <span class="choice-icon-wrap">${window.VisualEngine.getItemIllustrationSVG(opt, 40)}</span>
              <span class="choice-sv-word">${opt.sv}</span>
              <span class="choice-phonetic-th">(${opt.phonetic})</span>
            </button>
          `
            )
            .join('')}
        </div>
      `;

      // Spela upp svenskt uttal direkt
      setTimeout(() => window.SpeechEngine.speakSwedish(item.sv), 180);

      document.getElementById('btn-play-normal')?.addEventListener('click', (e) => {
        window.VisualEngine.haptic('light', e.currentTarget);
        window.SpeechEngine.speakSwedish(item.sv);
      });

      document.getElementById('btn-play-slow')?.addEventListener('click', (e) => {
        window.VisualEngine.haptic('light', e.currentTarget);
        window.GameEngine.updateQuestProgress('turtle_3', 1);
        window.SpeechEngine.speakSlow(item.sv);
      });

      stage.querySelectorAll('.choice-card-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SpeechEngine.playSound('tap');
          window.VisualEngine.haptic('light', btn);
          stage.querySelectorAll('.choice-card-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedOptionId = btn.getAttribute('data-option-id');

          const chosenItem = window.ContentDB.getItemById(this.selectedOptionId);
          if (chosenItem) window.SpeechEngine.speakSwedish(chosenItem.sv);

          document.getElementById('btn-check-answer').disabled = false;
        });
      });
    },

    // --- 4b: BYGG MENINGEN (WORD BANK) ---
    _renderSentenceBuilder(stage, q) {
      const item = q.targetItem;
      stage.innerHTML = `
        <div class="exercise-badge-row">
          <span class="exercise-type-tag">${q.typeLabel}</span>
          <button type="button" class="btn-3d btn-surface" id="btn-sentence-audio" style="min-height: 44px; padding: 6px 12px; font-size: 0.82rem;">
            🔊 Lyssna • ฟังประโยค
          </button>
        </div>
        <h2 class="exercise-prompt-sv">${q.promptSv}</h2>
        <p class="exercise-prompt-th">${q.promptTh}</p>

        <div class="sentence-source-card">
          <div class="sentence-th-main">${item.th}</div>
          <div class="satun-hint-line" style="margin-top: 6px;">🌴 แหลงใต้สตูล: "${item.satun}"</div>
          <div style="margin-top: 6px;">
            ${PhoneticBlurHelper.renderHtml(item, { isBox: true })}
          </div>
        </div>

        <div class="sentence-answer-tray" id="sentence-answer-tray">
          <span class="tray-placeholder">แตะคำศัพท์ด้านล่างเพื่อเรียงประโยคที่นี่...</span>
        </div>

        <div class="word-bank-pool" id="word-bank-pool"></div>
      `;

      document.getElementById('btn-sentence-audio')?.addEventListener('click', () => {
        window.SpeechEngine.speakSwedish(item.sv);
      });

      const refreshWordBankUI = () => {
        const tray = document.getElementById('sentence-answer-tray');
        const pool = document.getElementById('word-bank-pool');

        if (this.selectedTokens.length === 0) {
          tray.innerHTML = `<span class="tray-placeholder">แตะคำศัพท์ด้านล่างเพื่อเรียงประโยคที่นี่...</span>`;
        } else {
          tray.innerHTML = this.selectedTokens
            .map(
              (tok) => `
              <button type="button" class="word-bubble-btn in-answer" data-tok-id="${tok.id}">
                ${tok.word}
              </button>
            `
            )
            .join('');
        }

        pool.innerHTML = q.bankTokens
          .map((tok) => {
            const used = this.selectedTokens.some((t) => t.id === tok.id);
            return `
              <button type="button" class="word-bubble-btn" data-tok-id="${tok.id}" ${
              used ? 'style="opacity: 0.25; pointer-events: none;"' : ''
            }>
                ${tok.word}
              </button>
            `;
          })
          .join('');

        // Klick för att ta bort från svarsraden
        tray.querySelectorAll('.word-bubble-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-tok-id');
            this.selectedTokens = this.selectedTokens.filter((t) => t.id !== id);
            window.SpeechEngine.playSound('tap');
            refreshWordBankUI();
          });
        });

        // Klick för att lägga till från ordbanken
        pool.querySelectorAll('.word-bubble-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-tok-id');
            const tokObj = q.bankTokens.find((t) => t.id === id);
            if (!tokObj) return;
            this.selectedTokens.push(tokObj);
            window.SpeechEngine.playSound('tap');
            window.SpeechEngine.speakSwedish(tokObj.word);
            refreshWordBankUI();
          });
        });

        document.getElementById('btn-check-answer').disabled = this.selectedTokens.length === 0;
      };

      refreshWordBankUI();
      PhoneticBlurHelper.bindEvents(stage, (deduction) => {
        this.currentQuestionPenalty = (this.currentQuestionPenalty || 0) + deduction;
      });
    },

    // --- 4c: LYSSNA & FÖRSTÅ (NORMAL + SKÖLDPADDA) ---
    _renderListenUnderstand(stage, q) {
      const item = q.targetItem;
      stage.innerHTML = `
        <div class="exercise-badge-row">
          <span class="exercise-type-tag">${q.typeLabel}</span>
          <span class="satun-badge">👂 ฝึกหูให้คุ้นเสียงสวีเดน</span>
        </div>
        <h2 class="exercise-prompt-sv">${q.promptSv}</h2>
        <p class="exercise-prompt-th">${q.promptTh}</p>

        <div class="audio-players-row">
          <button type="button" class="btn-3d btn-blue audio-big-btn" id="btn-listen-normal">
            <span class="audio-btn-icon">${window.VisualEngine.getAudioIconSVG('speaker', 28)}</span>
            <span class="audio-btn-caption">Normal • ปกติ</span>
          </button>

          <button type="button" class="btn-3d audio-turtle-btn" id="btn-listen-turtle">
            <span class="audio-btn-icon">${window.VisualEngine.getAudioIconSVG('turtle', 28)}</span>
            <span class="audio-btn-caption">Långsam • ช้าๆ</span>
          </button>
        </div>

        <div class="choices-stack" id="listen-choices-stack">
          ${q.options
            .map(
              (opt) => `
            <button type="button" class="btn-3d btn-surface choice-row-btn" data-option-id="${opt.id}">
              <div>
                <div class="th-heading" style="font-size: 1.05rem; font-weight: 700;">${opt.th}</div>
                <div class="th-text" style="font-size: 0.8rem; color: #7B2CBF;">💬 ${opt.satun}</div>
              </div>
              <span class="choice-icon-wrap">${window.VisualEngine.getItemIllustrationSVG(opt, 36)}</span>
            </button>
          `
            )
            .join('')}
        </div>
      `;

      setTimeout(() => window.SpeechEngine.speakSwedish(item.sv), 200);

      document.getElementById('btn-listen-normal')?.addEventListener('click', (e) => {
        window.VisualEngine.haptic('light', e.currentTarget);
        window.SpeechEngine.speakSwedish(item.sv);
      });

      document.getElementById('btn-listen-turtle')?.addEventListener('click', (e) => {
        window.VisualEngine.haptic('light', e.currentTarget);
        window.GameEngine.updateQuestProgress('turtle_3', 1);
        window.SpeechEngine.speakSlow(item.sv);
      });

      stage.querySelectorAll('.choice-row-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SpeechEngine.playSound('tap');
          window.VisualEngine.haptic('light', btn);
          stage.querySelectorAll('.choice-row-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedOptionId = btn.getAttribute('data-option-id');
          document.getElementById('btn-check-answer').disabled = false;
        });
      });
    },

    // --- 4d: UTTALSÖVNING (MIKROFON - KOPPLAS I STEG 3) ---
    _renderPronunciation(stage, q) {
      const item = q.targetItem;
      stage.innerHTML = `
        <div class="exercise-badge-row">
          <span class="exercise-type-tag">${q.typeLabel}</span>
          <span class="satun-badge">🌴 สำเนียงสตูล</span>
        </div>
        <h2 class="exercise-prompt-sv">${q.promptSv}</h2>
        <p class="exercise-prompt-th">${q.promptTh}</p>

        <div class="pronunciation-card">
          <div class="pronun-illu-showcase" style="margin: 0 auto 8px; width: 68px; height: 68px;">${window.VisualEngine.getItemIllustrationSVG(item, 68)}</div>
          <div class="pronun-sv-phrase">${item.sv}</div>
          <div style="margin-top: 4px;">
            ${PhoneticBlurHelper.renderHtml(item)}
          </div>
          <div class="pronun-th-meaning">${item.th} • <span style="color:#7B2CBF;">${item.satun}</span></div>

          <div style="display: flex; justify-content: center; gap: 10px; margin-top: 12px;">
            <button type="button" class="btn-3d btn-blue" id="btn-pronun-listen" style="min-height: 48px; padding: 8px 14px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
              <span class="audio-btn-icon">${window.VisualEngine.getAudioIconSVG('speaker', 20)}</span> Lyssna först
            </button>
            <button type="button" class="btn-3d" id="btn-pronun-slow" style="min-height: 48px; padding: 8px 14px; font-size: 0.85rem; background: var(--lavender-soft); color: #7B2CBF; border-color: #D8B4FE; box-shadow: 0 3px 0 #C084FC; display: inline-flex; align-items: center; gap: 6px;">
              <span class="audio-btn-icon">${window.VisualEngine.getAudioIconSVG('turtle', 20)}</span> Sköldpadda
            </button>
          </div>
        </div>

        <div class="mic-stage-box">
          <button type="button" class="btn-3d btn-green mic-record-btn" id="btn-mic-record" aria-label="Tryck för att prata">
            <span class="stat-icon-svg" style="width: 32px; height: 32px;">${window.VisualEngine.Library.microphone()}</span>
          </button>
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
          <p class="th-text" id="mic-status-label" style="font-weight: 700; font-size: 0.9rem; color: var(--text-secondary); text-align: center;">
            แตะปุ่มไมโครโฟนสีเขียวแล้วพูดคำว่า <strong>"${item.sv}"</strong>
          </p>
        </div>
      `;

      document.getElementById('btn-pronun-listen')?.addEventListener('click', () => {
        window.SpeechEngine.speakSwedish(item.sv);
      });
      document.getElementById('btn-pronun-slow')?.addEventListener('click', () => {
        window.GameEngine.updateQuestProgress('turtle_3', 1);
        window.SpeechEngine.speakSlow(item.sv);
      });

      const micBtn = document.getElementById('btn-mic-record');
      const vizEl = document.getElementById('dala-audio-viz-12');
      const statusLabel = document.getElementById('mic-status-label');

      let lastMicTap = 0;
      micBtn?.addEventListener('click', (e) => {
        const now = Date.now();
        if (now - lastMicTap < 400) {
          e?.preventDefault?.();
          return;
        }
        lastMicTap = now;
        window.VisualEngine.haptic('light', micBtn);
        window.SpeechEngine.stopAudio?.();
        window.SpeechEngine.listenAndEvaluate(item, {
          onStart: () => {
            micBtn.classList.add('listening');
            vizEl?.classList.add('active');
            statusLabel.innerHTML = '🎧 กำลังฟังเสียงของคุณ... พูดเลยจ้า!';
          },
          onResult: (res) => {
            micBtn.classList.remove('listening');
            vizEl?.classList.remove('active');
            this.pronunciationPassed = true;
            statusLabel.innerHTML = `✅ ยอดเยี่ยม! ได้ยินเสียงชัดเจน (${res.transcript}) • กดตรวจคำตอบได้เลย`;
            document.getElementById('btn-check-answer').disabled = false;
            window.SpeechEngine.playSound('match');
          },
          onFallbackReady: () => {
            micBtn.classList.remove('listening');
            vizEl?.classList.remove('active');
            this.pronunciationPassed = true;
            statusLabel.innerHTML = `✅ บันทึกการออกเสียง "${item.sv}" สำเร็จ! • กดปุ่มสีเขียวด้านล่างเพื่อไปต่อ`;
            document.getElementById('btn-check-answer').disabled = false;
            window.SpeechEngine.playSound('match');
          }
        });
      });

      PhoneticBlurHelper.bindEvents(stage, (deduction) => {
        this.currentQuestionPenalty = (this.currentQuestionPenalty || 0) + deduction;
      });
    },

    // --- 4e: MATCHNINGS-SPRINT (5 SVENSKA + 5 THAILÄNDSKA ORD PÅ TID) ---
    _renderMatchingSprint(stage, q) {
      if (this.sprintState?.timerInterval) {
        clearInterval(this.sprintState.timerInterval);
      }

      this.sprintState = {
        startTime: Date.now(),
        elapsedSeconds: 0,
        selectedLeftId: null,
        selectedRightId: null,
        matchedIds: new Set(),
        timerInterval: null
      };

      stage.innerHTML = `
        <div class="sprint-header-bar">
          <span class="exercise-type-tag">${q.typeLabel}</span>
          <span class="sprint-timer-display" id="sprint-timer-val">⏱️ 0.0 s</span>
        </div>
        <h2 class="exercise-prompt-sv">${q.promptSv}</h2>
        <p class="exercise-prompt-th">${q.promptTh}</p>

        <div class="matching-columns">
          <div class="match-col" id="match-col-sv">
            ${q.leftColumn
              .map(
                (item) => `
              <button type="button" class="btn-3d btn-surface match-tile-btn" data-side="left" data-item-id="${item.id}">
                <div>
                  <div style="font-weight: 900;">${item.sv}</div>
                  <div style="font-size: 0.72rem; color: var(--text-secondary);" class="th-text">${item.phonetic}</div>
                </div>
              </button>
            `
              )
              .join('')}
          </div>

          <div class="match-col" id="match-col-th">
            ${q.rightColumn
              .map(
                (item) => `
              <button type="button" class="btn-3d btn-surface match-tile-btn th-text" data-side="right" data-item-id="${item.id}">
                <div>
                  <div style="font-weight: 700;">${item.emoji || ''} ${item.th}</div>
                </div>
              </button>
            `
              )
              .join('')}
          </div>
        </div>
      `;

      const timerEl = document.getElementById('sprint-timer-val');
      this.sprintState.timerInterval = setInterval(() => {
        const diff = (Date.now() - this.sprintState.startTime) / 1000;
        this.sprintState.elapsedSeconds = Number(diff.toFixed(1));
        if (timerEl) timerEl.textContent = `⏱️ ${this.sprintState.elapsedSeconds.toFixed(1)} s`;
      }, 100);

      const handleTileClick = (btn) => {
        const side = btn.getAttribute('data-side');
        const itemId = btn.getAttribute('data-item-id');
        if (this.sprintState.matchedIds.has(itemId)) return;

        window.SpeechEngine.playSound('tap');
        window.VisualEngine.haptic('light', btn);

        if (side === 'left') {
          const itemObj = window.ContentDB.getItemById(itemId);
          if (itemObj) window.SpeechEngine.speakSwedish(itemObj.sv);
          stage
            .querySelectorAll('[data-side="left"]')
            .forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.sprintState.selectedLeftId = itemId;
        } else {
          stage
            .querySelectorAll('[data-side="right"]')
            .forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.sprintState.selectedRightId = itemId;
        }

        // Kontrollera om ett par har valts
        if (this.sprintState.selectedLeftId && this.sprintState.selectedRightId) {
          const leftId = this.sprintState.selectedLeftId;
          const rightId = this.sprintState.selectedRightId;
          const leftBtn = stage.querySelector(`[data-side="left"][data-item-id="${leftId}"]`);
          const rightBtn = stage.querySelector(`[data-side="right"][data-item-id="${rightId}"]`);

          this.sprintState.selectedLeftId = null;
          this.sprintState.selectedRightId = null;

          if (leftId === rightId) {
            // Rätt par!
            this.sprintState.matchedIds.add(leftId);
            leftBtn?.classList.remove('selected');
            rightBtn?.classList.remove('selected');
            leftBtn?.classList.add('matched');
            rightBtn?.classList.add('matched');
            window.SpeechEngine.playSound('match');
            SRSManager.recordReview(leftId, 5);

            // Alla 5 par matchade!
            if (this.sprintState.matchedIds.size >= q.pairs.length) {
              clearInterval(this.sprintState.timerInterval);
              const finalSec = this.sprintState.elapsedSeconds;

              const prevBest = StateManager.state.competition.bestSprintSeconds;
              if (!prevBest || finalSec < prevBest) {
                StateManager.state.competition.bestSprintSeconds = finalSec;
                StateManager.save();
              }

              this.sessionXP += 15;
              StateManager.addXP(15);

              this.showFeedbackSheet(
                true,
                `5 av 5 par klara på ${finalSec.toFixed(1)} sekunder! • จับคู่ครบทั้ง 5 คู่ใน ${finalSec.toFixed(1)} วินาที หรอยจังฮู้!`,
                q.targetItem
              );
            }
          } else {
            // Mjuk visuell skakning vid fel par – aldrig straffande
            window.SpeechEngine.playSound('retry');
            leftBtn?.classList.add('wrong-flash', 'gentle-shake');
            rightBtn?.classList.add('wrong-flash', 'gentle-shake');
            setTimeout(() => {
              leftBtn?.classList.remove('selected', 'wrong-flash', 'gentle-shake');
              rightBtn?.classList.remove('selected', 'wrong-flash', 'gentle-shake');
            }, 420);
          }
        }
      };

      stage.querySelectorAll('.match-tile-btn').forEach((btn) => {
        btn.addEventListener('click', () => handleTileClick(btn));
      });
    },

    // --- 4f: KONTEXTLUCKA (Fyll i luckan i meningen) ---
    _renderClozeContext(stage, q) {
      const item = q.targetItem;
      stage.innerHTML = `
        <div class="exercise-badge-row">
          <span class="exercise-type-tag">${q.typeLabel}</span>
          <span class="satun-badge">🌴 สำเนียงสตูล</span>
        </div>
        <h2 class="exercise-prompt-sv">${q.promptSv}</h2>
        <p class="exercise-prompt-th">${q.promptTh}</p>

        <div class="cloze-sentence-card">
          <div class="cloze-sentence-text" id="cloze-sentence-view">
            ${q.sentenceDisplay.replace('______', '<span class="cloze-blank-highlight" id="cloze-target-slot">_______</span>')}
          </div>
          <div class="cloze-meaning-th" style="margin-top: 8px; font-size: 0.88rem; color: var(--text-secondary);">
            ${item.th} • 💬 ${item.satun}
          </div>
          <div style="display: flex; gap: 8px; margin-top: 10px; justify-content: center;">
            <button type="button" class="btn-3d btn-surface" id="btn-cloze-audio" style="min-height: 42px; padding: 6px 14px; font-size: 0.84rem;">
              🔊 Lyssna på meningen
            </button>
          </div>
        </div>

        <div class="choices-grid-2x2" id="cloze-choices-container" style="margin-top: 14px;">
          ${q.options
            .map(
              (opt) => `
            <button type="button" class="btn-3d btn-surface choice-card-btn" data-option-id="${opt.id}" data-word="${opt.word}" style="min-height: 54px; font-size: 1.05rem; font-weight: 900;">
              ${opt.word}
            </button>
          `
            )
            .join('')}
        </div>
      `;

      document.getElementById('btn-cloze-audio')?.addEventListener('click', () => {
        window.SpeechEngine.speakSwedish(q.fullSentence);
      });

      stage.querySelectorAll('.choice-card-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SpeechEngine.playSound('tap');
          window.VisualEngine.haptic('light', btn);
          stage.querySelectorAll('.choice-card-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedOptionId = btn.getAttribute('data-option-id');

          const slot = document.getElementById('cloze-target-slot');
          if (slot) {
            slot.textContent = btn.getAttribute('data-word');
            slot.classList.add('filled');
          }

          const checkBtn = document.getElementById('btn-check-answer');
          checkBtn.disabled = false;
        });
      });
    },

    // --- 4g: VARDAGSDIALOG & SAMTAL ---
    _renderDialogueScenario(stage, q) {
      const item = q.targetItem;
      stage.innerHTML = `
        <div class="exercise-badge-row">
          <span class="exercise-type-tag">${q.typeLabel}</span>
          <span class="satun-badge">🗣️ สถานการณ์จริง</span>
        </div>
        <h2 class="exercise-prompt-sv">${q.promptSv}</h2>
        <p class="exercise-prompt-th">${q.promptTh}</p>

        <div class="dialogue-speech-card">
          <div class="dialogue-speaker-row">
            <span class="dialogue-avatar">🗣️</span>
            <div class="dialogue-bubble">
              <div class="dialogue-bubble-sv">"${q.dialoguePromptSv}"</div>
              <div class="dialogue-bubble-th">${q.dialoguePromptTh}</div>
            </div>
            <button type="button" class="btn-3d btn-surface" id="btn-dialogue-prompt-audio" style="min-height: 40px; padding: 4px 10px;" title="Lyssna">
              🔊
            </button>
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; flex-direction: column; gap: 8px;">
          ${q.options
            .map(
              (opt) => `
            <button type="button" class="btn-3d btn-surface choice-card-btn dialogue-choice-btn" data-option-id="${opt.id}" style="text-align: left; padding: 12px 14px; min-height: 58px;">
              <div style="font-weight: 900; font-size: 0.96rem; color: var(--text-main);">${opt.sv}</div>
              <div class="th-text" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${opt.th}</div>
            </button>
          `
            )
            .join('')}
        </div>
      `;

      document.getElementById('btn-dialogue-prompt-audio')?.addEventListener('click', () => {
        window.SpeechEngine.speakSwedish(q.dialoguePromptSv);
      });

      stage.querySelectorAll('.choice-card-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SpeechEngine.playSound('tap');
          window.VisualEngine.haptic('light', btn);
          stage.querySelectorAll('.choice-card-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedOptionId = btn.getAttribute('data-option-id');

          const checkBtn = document.getElementById('btn-check-answer');
          checkBtn.disabled = false;
        });
      });
    },

    // --- 4h: SVENSKA KULTURBEGREPP ---
    _renderConceptQuiz(stage, q) {
      const item = q.targetItem;
      stage.innerHTML = `
        <div class="exercise-badge-row">
          <span class="exercise-type-tag">${q.typeLabel}</span>
          <span class="satun-badge">🇸🇪 รู้ไว้ได้ใช้จริง</span>
        </div>
        <h2 class="exercise-prompt-sv">${q.promptSv}</h2>
        <p class="exercise-prompt-th">${q.promptTh}</p>

        <div class="concept-hero-card" style="border: 2px solid #8B5CF6; background: linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%); border-radius: 18px; padding: 16px; text-align: center; margin-bottom: 12px;">
          <div style="font-size: 2.2rem; margin-bottom: 4px;">🇸🇪</div>
          <div style="font-size: 1.4rem; font-weight: 900; color: #6D28D9;">${q.conceptName}</div>
          <div class="th-text" style="font-size: 0.85rem; color: #7B2CBF; font-weight: 700; margin-top: 4px;">
            ${item.phoneticTh ? `คำอ่าน: (${item.phoneticTh})` : ''}
          </div>
          <button type="button" class="btn-3d btn-surface" id="btn-concept-audio" style="min-height: 38px; padding: 4px 12px; font-size: 0.82rem; margin-top: 8px;">
            🔊 Lyssna på uttal
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${q.options
            .map(
              (opt) => `
            <button type="button" class="btn-3d btn-surface choice-card-btn concept-choice-btn" data-option-id="${opt.id}" style="text-align: left; padding: 12px 14px; min-height: 56px;">
              <div class="th-text" style="font-weight: 800; font-size: 0.92rem; color: var(--text-main);">${opt.textTh}</div>
              ${opt.satunNote ? `<div class="th-text" style="font-size: 0.78rem; color: #7B2CBF; font-weight: 700; margin-top: 2px;">🌴 ${opt.satunNote}</div>` : ''}
            </button>
          `
            )
            .join('')}
        </div>
      `;

      document.getElementById('btn-concept-audio')?.addEventListener('click', () => {
        window.SpeechEngine.speakSwedish(q.conceptName);
      });

      stage.querySelectorAll('.choice-card-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.SpeechEngine.playSound('tap');
          window.VisualEngine.haptic('light', btn);
          stage.querySelectorAll('.choice-card-btn').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
          this.selectedOptionId = btn.getAttribute('data-option-id');

          const checkBtn = document.getElementById('btn-check-answer');
          checkBtn.disabled = false;
        });
      });
    },

    /* ========================================================================
       KONTROLLERA SVAR & GLIDANDE BOTTENPANEL (Krav 3)
       ======================================================================== */

    checkCurrentAnswer() {
      const q = this.queue[this.currentIndex];
      if (!q) return;

      const item = q.targetItem;
      let isCorrect = false;
      let explanation = '';

      if (q.type === 'image_choice' || q.type === 'listen_understand') {
        isCorrect = this.selectedOptionId === item.id;
        explanation = isCorrect
          ? `"${item.sv}" (${item.phonetic}) = ${item.th} • 💬 ${item.satun}`
          : `Tips: "${item.sv}" betyder "${item.th}" (${item.satun}). Prova igen! • ลองเลือกใหม่อีกครั้งนะจ๊ะ`;
      } else if (q.type === 'sentence_builder') {
        const userSentence = this.selectedTokens.map((t) => t.word).join(' ').trim();
        const targetSentence = q.correctTokens.join(' ').trim();
        isCorrect = userSentence.toLowerCase() === targetSentence.toLowerCase();
        explanation = isCorrect
          ? `"${targetSentence}" = ${item.th} (${item.satun})`
          : `Meningen börjar med "${q.correctTokens[0]}..." • ประโยคที่ถูกคือ: "${targetSentence}" ลองเรียงใหม่นะจ๊ะ!`;
      } else if (q.type === 'pronunciation') {
        isCorrect = this.pronunciationPassed;
        explanation = `Snyggt uttal av "${item.sv}" (${item.phonetic})! • ออกเสียงเก่งจังฮู้!`;
      } else if (q.type === 'cloze_context' || q.type === 'dialogue_scenario' || q.type === 'concept_quiz') {
        isCorrect = this.selectedOptionId === 'correct' || this.selectedOptionId === item.id;
        explanation = isCorrect
          ? `🌟 Rätt! "${item.sv}" = ${item.th} • 🌴 ${item.satun}`
          : `💡 Rätt svar är: "${q.correctAnswerText || item.sv}" (${item.th}). Prova igen! • ลองเลือกใหม่อีกครั้งนะจ๊ะ`;
      }

      if (isCorrect) {
        this.combo += 1;
        const baseXP = 10;
        const comboBonus = Math.min(10, (this.combo - 1) * 2);
        const penalty = this.currentQuestionPenalty || 0;
        const gainedXP = Math.max(5, baseXP + comboBonus - penalty);
        this.sessionXP += gainedXP;
        StateManager.addXP(gainedXP);
        SRSManager.recordReview(item.id, 5);

        const checkBtn = document.getElementById('btn-check-answer');
        const rect = checkBtn.getBoundingClientRect();
        window.VisualEngine.spawnFloatingXP(gainedXP, rect.left + rect.width / 2, rect.top);
        window.SpeechEngine.playSound('correct');
        window.SpeechEngine.speakSwedish(item.sv);

        let finalExplanation = explanation;
        if (penalty > 0) {
          finalExplanation += ` (💡 -${penalty} XP ledtrådsavdrag)`;
        }
        this.showFeedbackSheet(true, finalExplanation, item);
      } else {
        // Mjuk "Nästan! Prova igen" – aldrig straffande!
        this.combo = 1;
        SRSManager.recordReview(item.id, 2);
        window.SpeechEngine.playSound('retry');
        window.VisualEngine.haptic('retry', document.getElementById('lesson-stage'));

        this.showFeedbackSheet(false, explanation, item);
      }
    },

    showFeedbackSheet(isCorrect, explanationText, item) {
      const sheet = document.getElementById('feedback-sheet');
      const titleEl = document.getElementById('feedback-title');
      const expEl = document.getElementById('feedback-explanation');
      const continueBtn = document.getElementById('btn-feedback-continue');
      const replayBtn = document.getElementById('btn-feedback-replay');

      sheet.classList.remove('state-correct', 'state-retry');

      if (isCorrect) {
        sheet.classList.add('state-correct');
        titleEl.innerHTML = '✅ Strålande! • หรอยจังฮู้ เก่งมาก!';
        continueBtn.className = 'btn-3d btn-green w-full';
        continueBtn.textContent = 'FORTSÄTT • ไปต่อเลย';
        continueBtn.onclick = () => {
          this.currentIndex += 1;
          this.renderCurrentQuestion();
        };
      } else {
        sheet.classList.add('state-retry');
        titleEl.innerHTML = '🧡 Nästan! Prova igen • เกือบถูกแล้ว ลองใหม่นะจ๊ะ';
        continueBtn.className = 'btn-3d btn-warm w-full';
        continueBtn.textContent = 'PROVA IGEN • ลองอีกครั้ง';
        continueBtn.onclick = () => {
          this.hideFeedbackSheet();
        };
      }

      expEl.textContent = explanationText;
      replayBtn.onclick = () => {
        if (item) window.SpeechEngine.speakSwedish(item.sv);
      };

      sheet.classList.add('visible');
    },

    hideFeedbackSheet() {
      const sheet = document.getElementById('feedback-sheet');
      if (sheet) sheet.classList.remove('visible');
    },

    renderLessonComplete() {
      const fill = document.getElementById('lesson-progress-fill');
      if (fill) fill.style.width = '100%';
      document.getElementById('lesson-bottom-bar').style.display = 'none';

      // Uppdatera stjärnor för temat och daglig utmaning
      if (this.themeId && this.themeId !== 'all') {
        const currentStars = StateManager.state.themeStars[this.themeId] || 0;
        StateManager.state.themeStars[this.themeId] = Math.min(3, currentStars + 1);
      }
      StateManager.addGems(10);
      window.GameEngine.updateQuestProgress('lessons_1', 1);

      if (this.options?.isScoreAttackArena) {
        if (this.sessionXP > (StateManager.state.competition.highScoreAttack || 0)) {
          StateManager.state.competition.highScoreAttack = this.sessionXP;
        }
      }
      StateManager.save();

      window.SpeechEngine.playSound('fanfare');
      window.VisualEngine.triggerConfetti();

      const stage = document.getElementById('lesson-stage');
      stage.innerHTML = `
        <div style="text-align: center; padding: 24px 10px; display: flex; flex-direction: column; align-items: center; gap: 14px;">
          <div style="width: 86px; height: 86px; margin: 0 auto;">${window.VisualEngine.getCelebrationSVG(86)}</div>
          <span class="satun-badge">🌴 หรอยจังฮู้! เยี่ยมที่สุดเลย</span>
          <h2 style="font-size: 1.65rem; font-weight: 900; color: var(--emerald-dark);">
            Lektionen klar! • เรียนจบแล้วจ้า!
          </h2>
          <p class="th-text" style="color: var(--text-secondary); font-size: 0.96rem;">
            คุณเก่งขึ้นทุกวัน! ระบบ SM-2 ได้บันทึกเวลาทบทวนคำศัพท์ให้เรียบร้อยแล้ว
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; margin: 10px 0;">
            <div class="arena-card" style="margin: 0; text-align: center; background: var(--gold-soft); border-color: var(--gold);">
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--gold-deep);">INTJÄNAD XP</div>
              <div style="font-size: 1.5rem; font-weight: 900; color: #4A3500; display: flex; align-items: center; justify-content: center; gap: 4px;">
                +${this.sessionXP} <span class="stat-icon-svg" style="width: 22px; height: 22px;">${window.VisualEngine.getStatIconSVG('xp', 22)}</span>
              </div>
            </div>
            <div class="arena-card" style="margin: 0; text-align: center; background: var(--sky-soft); border-color: var(--sky);">
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--sky-dark);">BELÖNING</div>
              <div style="font-size: 1.5rem; font-weight: 900; color: var(--sky-dark); display: flex; align-items: center; justify-content: center; gap: 4px;">
                +10 <span class="stat-icon-svg" style="width: 22px; height: 22px;">${window.VisualEngine.getStatIconSVG('gem', 22)}</span>
              </div>
            </div>
          </div>

          <button type="button" class="btn-3d btn-green w-full" id="btn-finish-lesson-home" style="margin-top: 8px;">
            TILLBAKA TILL HEM • กลับหน้าแรก
          </button>
        </div>
      `;

      document.getElementById('btn-finish-lesson-home')?.addEventListener('click', () => {
        this.closeLesson();
      });
    }
  };

  /* ==========================================================================
     9. UI & SPA NAVIGATION CONTROLLER (Krav 3)
     ========================================================================== */

  const UIController = {
    init() {
      StateManager.load();
      window.VisualEngine.renderMascot('happy');
      this.bindGlobalEvents();
      this.refreshAll();
    },

    bindGlobalEvents() {
      // Bottennavigation (SPA vyer)
      document.querySelectorAll('.nav-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          const targetId = tab.getAttribute('data-target');
          window.SpeechEngine.playSound('tap');
          window.VisualEngine.haptic('light', tab);

          document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');

          document.querySelectorAll('.spa-view').forEach((v) => v.classList.remove('active-view'));
          document.getElementById(targetId)?.classList.add('active-view');

          this.refreshAll();
        });
      });

      // Välj träningsläge (Mix, Ord, Meningar, Lyssna, Prata)
      document.querySelectorAll('#training-mode-selector .mode-pill-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const mode = btn.getAttribute('data-mode');
          StateManager.state.selectedTrainingMode = mode;
          StateManager.save();
          window.SpeechEngine.playSound('tap');
          window.VisualEngine.haptic('light', btn);

          document.querySelectorAll('#training-mode-selector .mode-pill-btn').forEach((b) => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');

          this.renderThemesGrid();
        });
      });

      // Starta SM-2 SRS repetition
      document.getElementById('btn-start-srs-review')?.addEventListener('click', (e) => {
        window.SpeechEngine.playSound('tap');
        window.VisualEngine.haptic('light', e.currentTarget);
        LessonController.startSRSReviewLesson();
      });

      // Lektionsknappar
      document.getElementById('btn-close-lesson')?.addEventListener('click', () => {
        window.SpeechEngine.playSound('tap');
        LessonController.closeLesson();
      });

      document.getElementById('btn-check-answer')?.addEventListener('click', () => {
        LessonController.checkCurrentAnswer();
      });

      // Tävlingsknappar
      document.getElementById('btn-launch-sprint')?.addEventListener('click', (e) => {
        window.VisualEngine.haptic('light', e.currentTarget);
        window.GameEngine.startTimedSprintArena();
      });

      document.getElementById('btn-launch-score-attack')?.addEventListener('click', (e) => {
        window.VisualEngine.haptic('light', e.currentTarget);
        window.GameEngine.startScoreAttackArena();
      });

      // Inställningsknapp (Ljud & Tal / Groq API-nyckel)
      document.getElementById('btn-open-settings')?.addEventListener('click', (e) => {
        window.SpeechEngine?.playSound?.('tap');
        window.VisualEngine?.haptic?.('light', e.currentTarget);
        window.SettingsUI?.open();
      });

      // Översta radens interaktiva statusikoner (Flamman för Stats, Diamanterna för Shop/Lull-lull, XP för Samlaralbum)
      document.getElementById('streak-pill')?.addEventListener('click', (e) => {
        window.SpeechEngine?.playSound?.('tap');
        window.VisualEngine?.haptic?.('light', e.currentTarget);
        window.GamificationModals?.openStatsModal?.();
      });

      document.getElementById('gems-pill')?.addEventListener('click', (e) => {
        window.SpeechEngine?.playSound?.('tap');
        window.VisualEngine?.haptic?.('light', e.currentTarget);
        window.GamificationModals?.openShopModal?.();
      });

      document.getElementById('xp-pill')?.addEventListener('click', (e) => {
        window.SpeechEngine?.playSound?.('tap');
        window.VisualEngine?.haptic?.('light', e.currentTarget);
        window.GamificationModals?.openXPModal?.();
      });

      // Info-ring (i) & Pratbubbla för 100% per tema
      document.getElementById('btn-theme-info-circle')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openThemeInfoBubble();
      });

      document.getElementById('btn-close-theme-bubble')?.addEventListener('click', () => {
        this.closeThemeInfoBubble();
      });

      document.getElementById('btn-ack-theme-bubble')?.addEventListener('click', () => {
        this.closeThemeInfoBubble();
      });

      document.getElementById('theme-info-bubble-overlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'theme-info-bubble-overlay') {
          this.closeThemeInfoBubble();
        }
      });

      document.getElementById('btn-theme-bubble-speak')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.VisualEngine?.haptic?.('light', e.currentTarget);
        const thaiSpeech = 'วิธีเก็บวงแหวนให้ครบ 100 เปอร์เซ็นต์ ฝึกสะสมดาวให้ครบทั้ง 16 คำจนได้ 5 ดาว แวะมาฝึกซ้ำเรื่อยๆ ในแต่ละวัน และพิชิตบอสประจำหมวดเพื่อรับเหรียญทองค่ะ สู้ๆ นะคะ';
        window.SpeechEngine?.speakThai?.(thaiSpeech);
      });
    },

    openThemeInfoBubble() {
      const overlay = document.getElementById('theme-info-bubble-overlay');
      if (!overlay) return;
      window.SpeechEngine?.playSound?.('tap');
      window.VisualEngine?.haptic?.('light', overlay);
      overlay.classList.add('open');
      overlay.setAttribute('aria-hidden', 'false');
    },

    closeThemeInfoBubble() {
      const overlay = document.getElementById('theme-info-bubble-overlay');
      if (!overlay) return;
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      window.SpeechEngine?.stopAudio?.();
    },

    refreshAll() {
      this.renderTopbar();
      this.renderSRSStatus();
      this.renderThemesGrid();
      this.renderCompeteView();
      this.renderVocabView();
    },

    renderTopbar() {
      const { streakDays, gems, totalXP, dailyXP, dailyGoalXP } = StateManager.state;
      const streakEl = document.getElementById('streak-count');
      const gemsEl = document.getElementById('gems-count');
      const totalXpEl = document.getElementById('total-xp-count');
      const dailyXpLabelEl = document.getElementById('daily-xp-label');
      const dailyXpFillEl = document.getElementById('daily-xp-fill');

      if (streakEl) streakEl.textContent = streakDays;
      if (gemsEl) gemsEl.textContent = gems;
      if (totalXpEl) totalXpEl.textContent = `${totalXP} XP`;

      const pct = Math.min(100, Math.round((dailyXP / dailyGoalXP) * 100));
      if (dailyXpLabelEl) {
        dailyXpLabelEl.textContent =
          `Dagens mål • เป้าหมายวันนี้: ${dailyXP} / ${dailyGoalXP} XP`;
      }
      if (dailyXpFillEl) {
        dailyXpFillEl.style.width = `${pct}%`;
      }
    },

    renderSRSStatus() {
      const due = SRSManager.getDueItems('all');
      const countEl = document.getElementById('srs-due-count');
      const textEl = document.getElementById('srs-status-text');
      if (countEl) countEl.textContent = due.length;
      if (textEl) {
        textEl.textContent =
          due.length > 0
            ? 'คำศัพท์ถึงเวลาทบทวน (SM-2)'
            : 'ทบทวนครบแล้ว! ฝึกเพิ่มเพื่อสะสมดาวได้เลย';
      }
    },

    renderThemesGrid() {
      const grid = document.getElementById('themes-grid');
      if (!grid) return;

      const themes = window.ContentDB.getThemes();
      const mode = StateManager.state.selectedTrainingMode || 'mix';
      const modeNames = {
        mix: 'Träna Mix • ฝึกผสม',
        words: 'Träna Ord • ฝึกคำศัพท์',
        sentences: 'Meningar • เรียงประโยค',
        listen: 'Lyssna • ฝึกฟัง',
        speak: 'Prata • ฝึกพูด'
      };

      grid.innerHTML = themes
        .map((theme) => {
          const progressPct = SRSManager.getThemeProgressPercent(theme.id);
          const starsEarned = Math.max(
            StateManager.state.themeStars[theme.id] || 0,
            progressPct >= 80 ? 3 : progressPct >= 40 ? 2 : progressPct > 0 ? 1 : 0
          );

          const starsHTML = [1, 2, 3]
            .map((idx) => `<span class="star-slot ${idx <= starsEarned ? 'earned' : ''}">★</span>`)
            .join('');

          const cleanTitle = theme.shortTitleSv || theme.titleSv.replace(/^\d+\.\s*/, '');
          const cleanSatun = theme.shortSatun || theme.satunNote;

          return `
            <article class="theme-card theme-unlocked" style="--theme-accent: ${theme.accent};" data-theme-id="${theme.id}">
              <div class="theme-col-left">
                <div class="theme-ring-wrapper">
                  ${window.VisualEngine.createProgressRingSVG(progressPct, theme.accent)}
                  <div class="theme-icon-inner">${window.VisualEngine.getThemeIconSVG(theme.id)}</div>
                </div>
              </div>

              <div class="theme-col-center">
                <div class="theme-top-meta">
                  <span class="theme-chapter-chip">Tema ${theme.order}</span>
                  <div class="theme-stars-row" aria-label="${starsEarned} av 3 stjärnor">
                    ${starsHTML}
                  </div>
                  <span class="theme-status-chip">${progressPct}%</span>
                </div>

                <h3 class="theme-title-sv">${cleanTitle}</h3>
                <p class="theme-title-th">${theme.titleTh}</p>

                <div class="theme-meta-tags">
                  <span class="theme-satun-note">🌴 ${cleanSatun}</span>
                </div>
              </div>

              <div class="theme-col-right">
                <button type="button" class="btn-3d ${progressPct === 100 ? 'btn-yellow' : 'btn-green'} theme-start-btn" data-start-theme="${theme.id}">
                  ${progressPct === 100 ? '⭐ Repetera' : progressPct > 0 ? 'Fortsätt ›' : 'Starta ›'}
                </button>
              </div>
            </article>
          `;
        })
        .join('');

      grid.querySelectorAll('.theme-card').forEach((card) => {
        card.addEventListener('click', () => {
          const themeId = card.getAttribute('data-theme-id');
          window.SpeechEngine.playSound('tap');
          window.VisualEngine.haptic('light', card);
          LessonController.startThemeLesson(themeId);
        });
      });

      // Klick på framstegsring eller procent-chip öppnar också 100%-info
      grid.querySelectorAll('.theme-ring-wrapper, .theme-status-chip').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          UIController.openThemeInfoBubble();
        });
      });
    },

    renderCompeteView() {
      const comp = StateManager.state.competition;
      const bestTimeEl = document.getElementById('best-sprint-time');
      if (bestTimeEl) {
        bestTimeEl.textContent = comp.bestSprintSeconds
          ? `${comp.bestSprintSeconds.toFixed(1)} sek ⚡`
          : 'Ingen tid än • ลองเล่นเลย!';
      }

      const highAttackEl = document.getElementById('high-score-attack');
      if (highAttackEl) {
        highAttackEl.textContent = `${comp.highScoreAttack || 0} XP`;
      }

      const questsList = document.getElementById('daily-quests-list');
      if (!questsList) return;

      questsList.innerHTML = Object.entries(comp.quests)
        .map(([key, q]) => {
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
          const isReady = q.progress >= q.target && !q.claimed;
          return `
            <div class="quest-item">
              <div style="flex: 1;">
                <div style="font-weight: 800; font-size: 0.92rem;">${q.titleSv}</div>
                <div class="th-text" style="font-size: 0.8rem; color: var(--text-secondary);">
                  ${q.titleTh} (${q.progress}/${q.target})
                </div>
                <div class="quest-progress-bar">
                  <div class="quest-progress-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
              <div>
                ${
                  q.claimed
                    ? `<span class="satun-badge" style="background: var(--emerald-soft); color: var(--emerald-dark); border-color: var(--emerald);">✅ Klar</span>`
                    : `<button type="button" class="btn-3d ${isReady ? 'btn-yellow' : 'btn-surface'}" data-claim-quest="${key}" ${
                        !isReady ? 'disabled' : ''
                      } style="min-height: 48px; padding: 8px 12px; font-size: 0.82rem;">
                        +${q.rewardGems} 💎
                      </button>`
                }
              </div>
            </div>
          `;
        })
        .join('');

      questsList.querySelectorAll('[data-claim-quest]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-claim-quest');
          window.GameEngine.claimQuestReward(key, btn);
        });
      });
    },

    renderVocabView() {
      const listContainer = document.getElementById('vocab-list-container');
      const summaryEl = document.getElementById('vocab-mastery-summary');
      if (!listContainer || !summaryEl) return;

      const items = window.ContentDB.getAllItems();
      const learnedCount = items.filter(
        (i) => SRSManager.getRecord(i.id).masteryLevel > 0
      ).length;
      const masteredCount = items.filter(
        (i) => SRSManager.getRecord(i.id).masteryLevel >= 4
      ).length;

      summaryEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 900; font-size: 0.95rem;">SM-2 Repetition & Ordförråd</div>
            <div class="th-text" style="font-size: 0.82rem; color: var(--text-secondary);">
              ฝึกแล้ว ${learnedCount} / ${items.length} คำ • จำแม่นระดับสูง ${masteredCount} คำ
            </div>
          </div>
          <span class="satun-badge">🧠 SM-2 Aktiv</span>
        </div>
      `;

      listContainer.innerHTML = items
        .map((item) => {
          const rec = SRSManager.getRecord(item.id);
          const dots = [1, 2, 3, 4, 5]
            .map(
              (lvl) => `<span class="mastery-dot ${lvl <= rec.masteryLevel ? 'filled' : ''}"></span>`
            )
            .join('');

          return `
            <div class="vocab-item-card">
              <div>
                <div style="font-weight: 900; font-size: 1rem;">
                  ${item.emoji || '✨'} ${item.sv}
                  <span class="th-text" style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">(${item.phonetic})</span>
                </div>
                <div class="th-text" style="font-size: 0.88rem; color: var(--text-main); font-weight: 600;">
                  ${item.th} • <span style="color: #7B2CBF;">${item.satun}</span>
                </div>
                <div class="mastery-dots" title="SM-2 Mastery Level ${rec.masteryLevel}/5">
                  ${dots}
                </div>
              </div>
              <div style="display: flex; gap: 6px;">
                <button type="button" class="btn-3d btn-blue" data-speak-sv="${item.id}" style="min-height: 48px; padding: 8px 12px; font-size: 0.9rem;" title="Lyssna normal">
                  🔊
                </button>
                <button type="button" class="btn-3d" data-speak-slow="${item.id}" style="min-height: 48px; padding: 8px 12px; font-size: 0.9rem; background: var(--lavender-soft); color: #7B2CBF; border-color: #D8B4FE; box-shadow: 0 3px 0 #C084FC;" title="Sköldpadds-tempo">
                  🐢
                </button>
              </div>
            </div>
          `;
        })
        .join('');

      listContainer.querySelectorAll('[data-speak-sv]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = window.ContentDB.getItemById(btn.getAttribute('data-speak-sv'));
          if (item) window.SpeechEngine.speakSwedish(item.sv);
        });
      });

      listContainer.querySelectorAll('[data-speak-slow]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = window.ContentDB.getItemById(btn.getAttribute('data-speak-slow'));
          if (item) {
            window.GameEngine.updateQuestProgress('turtle_3', 1);
            window.SpeechEngine.speakSlow(item.sv);
          }
        });
      });
    }
  };

  // Exponera kärnmoduler på window.GameEngine för enkel integration i Del 2–5
  Object.assign(window.GameEngine, {
    StateManager,
    SRSManager,
    QuestionGenerator,
    LessonController,
    UIController
  });

  // Starta applikationen när DOM är redo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UIController.init());
  } else {
    UIController.init();
  }
})();

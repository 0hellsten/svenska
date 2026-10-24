/**
 * ============================================================================
 * DATABASE.JS — DEL 4 AV 5 (window.ContentDB & window.ContentDB.SentenceCombiner)
 * Omfattande, pedagogiskt strukturerad databas i 10 valbara teman för att lära
 * sig svenska från thailändska med extra värme och Satun-dialekt (ภาษาใต้สตูล).
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. DE 10 VALBARA TEMANA
     ========================================================================== */

  const THEMES_10 = [
    {
      id: 'greetings',
      order: 1,
      titleSv: '1. Hälsningar & Artighet',
      shortTitleSv: 'Hälsningar & Artighet',
      titleTh: 'การทักทายและคำสุภาพ',
      satunNote: 'แหลงทักทายหรอยๆ ยิ้มแย้มแจ่มใส',
      shortSatun: 'แหลงทักทาย',
      icon: '👋',
      accent: '#58CC02',
      unlockedByDefault: true
    },
    {
      id: 'family_love',
      order: 2,
      titleSv: '2. Kärlek, Känslor & Uppmuntran',
      shortTitleSv: 'Kärlek & Känslor',
      titleTh: 'ความรู้สึกและคำบอกรัก',
      satunNote: 'รักจังฮู้ คำหวานไว้แหลงกับแฟน',
      shortSatun: 'รักจังฮู้',
      icon: '❤️',
      accent: '#FF4B4B',
      unlockedByDefault: true
    },
    {
      id: 'supermarket',
      order: 3,
      titleSv: '3. I Matbutiken & Handla',
      shortTitleSv: 'I Matbutiken',
      titleTh: 'ซื้อของในซูเปอร์มาร์เก็ต',
      satunNote: 'ไปหลาดซื้อกับข้าวเข้าเรือน',
      shortSatun: 'ไปหลาดซื้อของ',
      icon: '🛒',
      accent: '#1CB0F6',
      unlockedByDefault: true
    },
    {
      id: 'fika_food',
      order: 4,
      titleSv: '4. Matlagning & Svensk Fika',
      shortTitleSv: 'Matlagning & Fika',
      titleTh: 'อาหารและฟีก้าสวีเดน',
      satunNote: 'ของกินหรอยแรง จิบโกปี๊สวีเดน',
      shortSatun: 'จิบโกปี๊สวีเดน',
      icon: '☕',
      accent: '#FF9600',
      unlockedByDefault: true
    },
    {
      id: 'everyday',
      order: 5,
      titleSv: '5. Hemma & Vardag',
      shortTitleSv: 'Hemma & Vardag',
      titleTh: 'ที่บ้านและชีวิตประจำวัน',
      satunNote: 'อยู่เรือนบายใจ กิจวัตรทุกวัน',
      shortSatun: 'อยู่เรือนบายใจ',
      icon: '🏡',
      accent: '#00B894',
      unlockedByDefault: true
    },
    {
      id: 'weather_time',
      order: 6,
      titleSv: '6. Väder & Svenska Årstider',
      shortTitleSv: 'Väder & Årstider',
      titleTh: 'สภาพอากาศและฤดูกาล',
      satunNote: 'หิมะตกหรือแดดออก แหลงได้หมด',
      shortSatun: 'หิมะตก-แดดออก',
      icon: '⛅',
      accent: '#FFC800',
      unlockedByDefault: true
    },
    {
      id: 'shopping_numbers',
      order: 7,
      titleSv: '7. Siffror, Klockan & Dagar',
      shortTitleSv: 'Siffror & Klockan',
      titleTh: 'ตัวเลข เวลา และวัน',
      satunNote: 'นับเลข ดูนาฬิกา นัดเวลาเป๊ะๆ',
      shortSatun: 'นัดเวลาเป๊ะๆ',
      icon: '🔢',
      accent: '#CE82FF',
      unlockedByDefault: true
    },
    {
      id: 'city_transport',
      order: 8,
      titleSv: '8. På Stan & Transport',
      shortTitleSv: 'På Stan & Resor',
      titleTh: 'การเดินทางและในเมือง',
      satunNote: 'ขึ้นรถเมล์ รถไฟ ไปเที่ยวในเมือง',
      shortSatun: 'ขึ้นรถไฟ-รถเมล์',
      icon: '🚆',
      accent: '#3B82F6',
      unlockedByDefault: true
    },
    {
      id: 'sfi_smalltalk',
      order: 9,
      titleSv: '9. Småprat & SFI-grunder',
      shortTitleSv: 'Småprat & SFI',
      titleTh: 'บทสนทนาพื้นฐาน (SFI)',
      satunNote: 'แนะนำตัวคนสตูลในสวีเดนอย่างมั่นใจ',
      shortSatun: 'แนะนำตัวคนใต้',
      icon: '🗣️',
      accent: '#EC4899',
      unlockedByDefault: true
    },
    {
      id: 'real_dialogs',
      order: 10,
      titleSv: '10. Meningar & Dialoger i Verkligheten',
      shortTitleSv: 'Praktiska Dialoger',
      titleTh: 'ประโยคใช้จริงในชีวิตประจำวัน',
      satunNote: 'ถาม-ตอบใช้จริง แหลงคล่องเหมือนเจ้าของภาษา',
      shortSatun: 'แหลงคล่องใช้จริง',
      icon: '💬',
      accent: '#8B5CF6',
      unlockedByDefault: true
    }
  ];

  /* ==========================================================================
     2. KOMPLETT DATABAS (160 HANDSKRIVNA POSTER — 16 PER TEMA)
     Varje post har: id, themeId, type, sv, th, satunFlavor, phoneticTh,
     pronunciationTip, svgScene, distractorsSv, distractorsTh, wordChunks
     ========================================================================== */

  const RAW_DATABASE_ITEMS = [
    /* ------------------------------------------------------------------------
       TEMA 1: HÄLSNINGAR & ARTIGHET (การทักทายและคำสุภาพ)
       ------------------------------------------------------------------------ */
    {
      id: 't1_hej',
      themeId: 'greetings',
      type: 'word',
      sv: 'Hej',
      th: 'สวัสดี',
      satunFlavor: 'หวัดดีจ้า! ใช้ทักทายได้ตลอดทั้งวันเลย',
      phoneticTh: 'เฮย',
      pronunciationTip: 'ออกเสียง "เฮย" สั้นและกระชับ ท้ายเสียงเป็น ย.ยักษ์ เบาๆ',
      svgScene: 'wave',
      distractorsSv: ['Hej då', 'Tack', 'Nej'],
      distractorsTh: ['ลาก่อน', 'ขอบคุณ', 'ไม่ใช่'],
      wordChunks: ['Hej']
    },
    {
      id: 't1_tack_sa_mycket',
      themeId: 'greetings',
      type: 'word',
      sv: 'Tack så mycket',
      th: 'ขอบคุณมาก',
      satunFlavor: 'ขอบคุณจังฮู้ / ขอบใจแลตะเอง',
      phoneticTh: 'ทัค-ซัว-มึค-เค็ต',
      pronunciationTip: 'เสียง "y" ใน mycket ออกเสียงคล้าย "อึ/อือ" ห่อปากนิดนึง ไม่ใช่เสียง "อุ"',
      svgScene: 'heart_hands',
      distractorsSv: ['Varsågod', 'Ursäkta mig', 'God morgon'],
      distractorsTh: ['ด้วยความยินดี', 'ขอโทษค่ะ', 'อรุณสวัสดิ์'],
      wordChunks: ['Tack', 'så', 'mycket']
    },
    {
      id: 't1_ursakta',
      themeId: 'greetings',
      type: 'word',
      sv: 'Ursäkta',
      th: 'ขอโทษ / ขออนุญาต',
      satunFlavor: 'ขอโทษนะจ๊ะ เวลาขอทางหรือเรียกพนักงาน',
      phoneticTh: 'อูร์-เช็ค-ตะ',
      pronunciationTip: 'rs ออกเสียงควบเป็นเสียงลม "ช" (เช็ค) ลากเสียง อูร์ ด้านหน้าให้ชัด',
      svgScene: 'polite',
      distractorsSv: ['Förlåt', 'Varsågod', 'Vi ses'],
      distractorsTh: ['ยินดีต้อนรับ', 'ลาก่อนนะ', 'อรุณสวัสดิ์'],
      wordChunks: ['Ursäkta']
    },
    {
      id: 't1_hur_mar_du',
      themeId: 'greetings',
      type: 'sentence',
      sv: 'Hur mår du?',
      th: 'คุณสบายดีไหม?',
      satunFlavor: 'บายดีหม้ายจ๊ะ? (ถามไถ่ด้วยความห่วงใย)',
      phoneticTh: 'ฮูร์-มอร์-ดู',
      pronunciationTip: 'ตัว å ใน mår ออกเสียง "ออ" ลึกๆ และตัว u ใน du ห่อปากเป็นเสียง "อือ/อู"',
      svgScene: 'smile',
      distractorsSv: ['Vad heter du?', 'Var bor du?', 'Vad gör du?'],
      distractorsTh: ['คุณชื่ออะไร?', 'คุณอยู่ที่ไหน?', 'กี่โมงแล้ว?'],
      wordChunks: ['Hur', 'mår', 'du']
    },
    {
      id: 't1_god_morgon',
      themeId: 'greetings',
      type: 'word',
      sv: 'God morgon',
      th: 'อรุณสวัสดิ์',
      satunFlavor: 'ตื่นเช้าแล้ว บายดีหม้ายจ๊ะ',
      phoneticTh: 'กูด-มอร์-รอน',
      pronunciationTip: 'คนสวีเดนพูดเร็วๆ จะออกเสียงคล้าย "กู-มอร์-รอน" ไม่ต้องออกเสียง d ชัดเกินไป',
      svgScene: 'sunrise',
      distractorsSv: ['God natt', 'God kväll', 'Hej då'],
      distractorsTh: ['ราตรีสวัสดิ์', 'สวัสดีตอนเย็น', 'ลาก่อน'],
      wordChunks: ['God', 'morgon']
    },
    {
      id: 't1_vi_ses',
      themeId: 'greetings',
      type: 'word',
      sv: 'Vi ses',
      th: 'แล้วเจอกันนะ',
      satunFlavor: 'ค่อยเจอกันหล่าวนะจ๊ะ!',
      phoneticTh: 'วี-เซส',
      pronunciationTip: 'เสียง V แตะฟันบนกับริมฝีปากล่างเบาๆ "วี-เซส"',
      svgScene: 'sparkles',
      distractorsSv: ['Vi hörs', 'Välkommen', 'Varsågod'],
      distractorsTh: ['ขอบคุณมาก', 'ขอโทษค่ะ', 'ไม่เป็นไร'],
      wordChunks: ['Vi', 'ses']
    },
    {
      id: 't1_god_natt',
      themeId: 'greetings',
      type: 'word',
      sv: 'God natt',
      th: 'ราตรีสวัสดิ์',
      satunFlavor: 'นอนหลับให้บายนะจ๊ะ ฝันดีจ้า',
      phoneticTh: 'กูด-นัท',
      pronunciationTip: 'เสียง natt สั้นและคม ออกเสียง ท.ทหาร สะกดเบาๆ ที่ปลายลิ้น',
      svgScene: 'sleep',
      distractorsSv: ['God morgon', 'God dag', 'Hej så länge'],
      distractorsTh: ['อรุณสวัสดิ์', 'สวัสดีตอนบ่าย', 'ยินดีที่ได้รู้จัก'],
      wordChunks: ['God', 'natt']
    },
    {
      id: 't1_varsagod',
      themeId: 'greetings',
      type: 'word',
      sv: 'Varsågod',
      th: 'เชิญค่ะ / ด้วยความยินดี',
      satunFlavor: 'เอาไปเลยจ้า / ยินดีจังฮู้ (ใช้ตอนยื่นของให้หรือรับคำขอบคุณ)',
      phoneticTh: 'วอ-ซอ-กูด',
      pronunciationTip: 'เน้นเสียงพยางค์ท้าย "-กูด" ลากเสียงยาวนิดนึง',
      svgScene: 'heart_hands',
      distractorsSv: ['Tack så mycket', 'Ursäkta', 'Ingen fara'],
      distractorsTh: ['ขอโทษค่ะ', 'ขอบคุณมาก', 'ลาก่อน'],
      wordChunks: ['Varsågod']
    },
    {
      id: 't1_forlat',
      themeId: 'greetings',
      type: 'word',
      sv: 'Förlåt',
      th: 'ขอโทษ (จากใจ)',
      satunFlavor: 'ขอโทษจริงๆ นะจ๊ะ อย่าโกรธกันนะ',
      phoneticTh: 'เฟอร์-ล็อต',
      pronunciationTip: 'พยางค์หลัง "-ล็อต" ออกเสียงสระ ออ กึ่ง โอ ชัดๆ',
      svgScene: 'heart',
      distractorsSv: ['Varsågod', 'Tackar', 'Javisst'],
      distractorsTh: ['ด้วยความยินดี', 'ขอบคุณ', 'ใช่แล้ว'],
      wordChunks: ['Förlåt']
    },
    {
      id: 't1_valkommen',
      themeId: 'greetings',
      type: 'word',
      sv: 'Välkommen',
      th: 'ยินดีต้อนรับ',
      satunFlavor: 'เชิญเข้าเรือนเลยจ้า ยินดีต้อนรับจังฮู้!',
      phoneticTh: 'แวล-คอม-เม็น',
      pronunciationTip: 'เสียง ä ใน väl ออกเสียง "แอ" ชัดๆ แล้วตามด้วย คอม-เม็น',
      svgScene: 'home',
      distractorsSv: ['Vi ses snart', 'Ha det bra', 'Ursäkta mig'],
      distractorsTh: ['แล้วพบกันใหม่', 'ขอให้โชคดี', 'ขออนุญาต'],
      wordChunks: ['Välkommen']
    },
    {
      id: 't1_ingen_fara',
      themeId: 'greetings',
      type: 'word',
      sv: 'Ingen fara',
      th: 'ไม่เป็นไรเลย',
      satunFlavor: 'ไม่พรือจ้า! เรื่องเล็กน้อยเอง',
      phoneticTh: 'อิง-เอ็น-ฟอ-ระ',
      pronunciationTip: 'ng ใน ingen ออกเสียงเหมือน ง.งู กลางคำ ลื่นไหลไปหา เอ็น',
      svgScene: 'smile',
      distractorsSv: ['Mycket bra', 'Tack ska du ha', 'God kväll'],
      distractorsTh: ['ดีมากๆ', 'ขอบคุณนะ', 'สวัสดีตอนค่ำ'],
      wordChunks: ['Ingen', 'fara']
    },
    {
      id: 't1_sent_mar_bra',
      themeId: 'greetings',
      type: 'sentence',
      sv: 'Jag mår bra, tack',
      th: 'ฉันสบายดี ขอบคุณค่ะ',
      satunFlavor: 'ฉานบายดีจังฮู้ ขอบคุณหลายๆ จ้า',
      phoneticTh: 'ย๊อก-มอร์-บรอ-ทัค',
      pronunciationTip: 'g ท้ายคำว่า jag ออกเสียงเบาๆ คล้าย ค/ก และ bra ออกเสียง "บรอ" กว้างๆ',
      svgScene: 'happy',
      distractorsSv: ['Jag är trött idag', 'Jag heter Wilawan', 'Vi ses imorgon'],
      distractorsTh: ['วันนี้ฉันเหนื่อย', 'ฉันชื่อวิลาวรรณ', 'พรุ่งนี้เจอกัน'],
      wordChunks: ['Jag', 'mår', 'bra', 'tack']
    },
    {
      id: 't1_sent_trevligt',
      themeId: 'greetings',
      type: 'sentence',
      sv: 'Trevligt att träffas',
      th: 'ยินดีที่ได้รู้จักค่ะ',
      satunFlavor: 'ดีใจจังฮู้ที่ได้รู้จักกันนะจ๊ะ',
      phoneticTh: 'เทรฟ-ลิกต์-อัท-เทร็ฟ-ฟัส',
      pronunciationTip: 'v ใน trevligt ออกเสียงคล้าย ฟ.ฟัน เบาๆ ก่อนควบเข้า ลิกต์',
      svgScene: 'sparkles',
      distractorsSv: ['Tack för maten', 'Ha en trevlig helg', 'Vi ses ikväll'],
      distractorsTh: ['ขอบคุณสำหรับอาหาร', 'ขอให้มีความสุขวันหยุด', 'เจอกันเย็นนี้'],
      wordChunks: ['Trevligt', 'att', 'träffas']
    },
    {
      id: 't1_sent_bra_dag',
      themeId: 'greetings',
      type: 'sentence',
      sv: 'Ha en bra dag',
      th: 'ขอให้มีวันที่ดีนะ',
      satunFlavor: 'ขอให้วันนี้เป็นวันที่หรอยและบายใจนะจ๊ะ',
      phoneticTh: 'ฮา-เอ็น-บรอ-ด๊อก',
      pronunciationTip: 'คำว่า dag ออกเสียงสระ อา-ออ ยาวๆ ว่า "ด๊อก"',
      svgScene: 'sun',
      distractorsSv: ['Sov så gott', 'Tack så mycket', 'Kom in och ät'],
      distractorsTh: ['นอนหลับฝันดีนะ', 'ขอบคุณมากๆ', 'เข้ามาทานข้าวสิ'],
      wordChunks: ['Ha', 'en', 'bra', 'dag']
    },
    {
      id: 't1_sent_ses_imorgon',
      themeId: 'greetings',
      type: 'sentence',
      sv: 'Hej då, vi ses imorgon',
      th: 'ลาก่อน แล้วเจอกันพรุ่งนี้นะ',
      satunFlavor: 'ไปก่อนนะจ๊ะ ต่อเช้าค่อยเจอกันหล่าว!',
      phoneticTh: 'เฮย-ดอ วี-เซส-อี-มอร์-รอน',
      pronunciationTip: 'g ใน imorgon ไม่ออกเสียง ให้พูดลื่นๆ ว่า "อี-มอร์-รอน"',
      svgScene: 'wave',
      distractorsSv: ['God morgon, hur mår du', 'Tack för kaffet idag', 'Ursäkta var är bussen'],
      distractorsTh: ['อรุณสวัสดิ์ สบายดีไหม', 'ขอบคุณสำหรับกาแฟวันนี้', 'ขอโทษค่ะ รถเมล์อยู่ไหน'],
      wordChunks: ['Hej', 'då', 'vi', 'ses', 'imorgon']
    },
    {
      id: 't1_sent_tack_hjalpen',
      themeId: 'greetings',
      type: 'sentence',
      sv: 'Tack så mycket för hjälpen',
      th: 'ขอบคุณมากสำหรับความช่วยเหลือค่ะ',
      satunFlavor: 'ขอบใจจังฮู้ที่ช่วยฉานนะจ๊ะ น้ำใจงามแท้',
      phoneticTh: 'ทัค-ซัว-มึค-เค็ต-เฟอร์-เยล-เพ็น',
      pronunciationTip: 'hj ใน hjälpen ไม่ไม่ออกเสียง ฮ แต่ให้ออกเสียง ย.ยักษ์ เป็น "เยล-เพ็น"',
      svgScene: 'heart_hands',
      distractorsSv: ['Kan du hjälpa mig nu', 'Varsågod och sitt ner', 'Förlåt att jag är sen'],
      distractorsTh: ['ช่วยฉันหน่อยได้ไหม', 'เชิญนั่งลงก่อนค่ะ', 'ขอโทษที่มาสาย'],
      wordChunks: ['Tack', 'så', 'mycket', 'för', 'hjälpen']
    },

    /* ------------------------------------------------------------------------
       TEMA 2: KÄRLEK, KÄNSLOR & UPPMUNTRAN (ความรู้สึกและคำหวาน)
       ------------------------------------------------------------------------ */
    {
      id: 't2_jag_alskar_dig',
      themeId: 'family_love',
      type: 'sentence',
      sv: 'Jag älskar dig',
      th: 'ฉันรักคุณ',
      satunFlavor: 'รักเธอนะจ๊ะ รักจังฮู้หมดหัวใจเลย!',
      phoneticTh: 'ย๊อก-เอล-สการ์-เดย์',
      pronunciationTip: 'คำว่า dig สะกดด้วย ig แต่ออกเสียงว่า "เดย์" เสมอในภาษาพูดสวีเดน',
      svgScene: 'heart',
      distractorsSv: ['Jag saknar dig', 'Jag tänker på dig', 'Du är så fin'],
      distractorsTh: ['ฉันคิดถึงคุณ', 'ฉันนึกถึงคุณ', 'คุณน่ารักมาก'],
      wordChunks: ['Jag', 'älskar', 'dig']
    },
    {
      id: 't2_jag_ar_glad',
      themeId: 'family_love',
      type: 'sentence',
      sv: 'Jag är glad',
      th: 'ฉันดีใจ / ฉันมีความสุข',
      satunFlavor: 'ฉานดีใจจังฮู้ บายใจหลาย!',
      phoneticTh: 'ย๊อก-แอร์-กลอด',
      pronunciationTip: 'd ท้ายคำว่า glad ออกเสียงเบาๆ ลากสระ อา ยาวนิดนึง',
      svgScene: 'happy',
      distractorsSv: ['Jag är trött', 'Jag är hungrig', 'Jag är ledsen'],
      distractorsTh: ['ฉันเหนื่อย', 'ฉันหิวข้าว', 'ฉันเศร้า'],
      wordChunks: ['Jag', 'är', 'glad']
    },
    {
      id: 't2_trott',
      themeId: 'family_love',
      type: 'word',
      sv: 'Trött',
      th: 'เหนื่อย / ง่วงนอน',
      satunFlavor: 'เหนื่อยจังฮู้ เหม็ดแรงแล้ว อยากนอนพัก',
      phoneticTh: 'เทร็อต',
      pronunciationTip: 'ห่อปากเล็กน้อยสำหรับเสียง ö แล้วออกเสียงสั้นๆ ว่า "เทร็อต"',
      svgScene: 'sleep',
      distractorsSv: ['Pigg', 'Glad', 'Arg'],
      distractorsTh: ['สดชื่น', 'ดีใจ', 'โกรธ'],
      wordChunks: ['Trött']
    },
    {
      id: 't2_hungrig',
      themeId: 'family_love',
      type: 'word',
      sv: 'Hungrig',
      th: 'หิวข้าว',
      satunFlavor: 'เนือยข้าวแล้ว! (ภาษาใต้สตูล "เนือย" แปลว่า หิว!)',
      phoneticTh: 'ฮุง-ริก',
      pronunciationTip: 'ออกเสียง ฮุง-ริก ชัดๆ ระวังอย่าลืมเสียง ร.เรือ ตรงพยางค์ที่สอง',
      svgScene: 'yummy',
      distractorsSv: ['Mätt', 'Törstig', 'Trött'],
      distractorsTh: ['อิ่มแล้ว', 'หิวน้ำ', 'เหนื่อย'],
      wordChunks: ['Hungrig']
    },
    {
      id: 't2_mysigt',
      themeId: 'family_love',
      type: 'word',
      sv: 'Mysigt',
      th: 'อบอุ่นสบายใจ / โรแมนติก',
      satunFlavor: 'บรรยากาศดี บายใจจังฮู้ (คำสำคัญมากของคนสวีเดน)',
      phoneticTh: 'มี-ซิกต์',
      pronunciationTip: 'เสียง y ใน mysigt ห่อปากกลมเหมือนเป่าเทียนขณะพูดเสียง "อี"',
      svgScene: 'sparkles',
      distractorsSv: ['Tråkigt', 'Kallt', 'Jobbigt'],
      distractorsTh: ['น่าเบื่อ', 'หนาวเย็น', 'เหนื่อยยาก'],
      wordChunks: ['Mysigt']
    },
    {
      id: 't2_saknar_dig',
      themeId: 'family_love',
      type: 'sentence',
      sv: 'Jag saknar dig',
      th: 'ฉันคิดถึงคุณ',
      satunFlavor: 'คิดถึงเธอนะ ข้องใจจังฮู้อยากเจอหน้า',
      phoneticTh: 'ย๊อก-ซัค-นาร์-เดย์',
      pronunciationTip: 'ลากเสียง a แรกใน saknar ยาวว่า "ซัค-นาร์" แล้วตามด้วย "เดย์"',
      svgScene: 'heart',
      distractorsSv: ['Jag älskar dig', 'Jag ringer dig', 'Jag ser dig'],
      distractorsTh: ['ฉันรักคุณ', 'ฉันจะโทรหาคุณ', 'ฉันเห็นคุณ'],
      wordChunks: ['Jag', 'saknar', 'dig']
    },
    {
      id: 't2_kram',
      themeId: 'family_love',
      type: 'word',
      sv: 'En stor kram',
      th: 'กอดแน่นๆ หนึ่งที',
      satunFlavor: 'กอดอุ่นๆ ให้หายคิดถึงนะจ๊ะ',
      phoneticTh: 'เอ็น-สตอร์-ครอม',
      pronunciationTip: 'stor ออกเสียง "สตอร์" (สระ อู/โอ) และ kram ออกเสียง "ครอม" กว้างๆ',
      svgScene: 'family',
      distractorsSv: ['En liten puss', 'God morgon', 'Tack så mycket'],
      distractorsTh: ['จุ๊บเบาๆ', 'อรุณสวัสดิ์', 'ขอบคุณมาก'],
      wordChunks: ['En', 'stor', 'kram']
    },
    {
      id: 't2_lycklig',
      themeId: 'family_love',
      type: 'word',
      sv: 'Lycklig',
      th: 'มีความสุขมาก',
      satunFlavor: 'มีความสุขล้นใจ บายใจอย่างแรง!',
      phoneticTh: 'ลึค-คลิก',
      pronunciationTip: 'y สั้นใน lycklig ออกเสียงคล้ายสระ "อึ" ห่อปากนิดนึง',
      svgScene: 'star',
      distractorsSv: ['Ledsen', 'Ensam', 'Nervös'],
      distractorsTh: ['เสียใจ', 'เหงา', 'ตื่นเต้นกังวล'],
      wordChunks: ['Lycklig']
    },
    {
      id: 't2_snall',
      themeId: 'family_love',
      type: 'word',
      sv: 'Du är så snäll',
      th: 'คุณใจดีจังเลย',
      satunFlavor: 'เธอใจดีจังฮู้ น่ารักที่สุดเลย',
      phoneticTh: 'ดู-แอร์-ซัว-สเนล',
      pronunciationTip: 'snäll ออกเสียง ส-เนล ต่อเนื่องกัน ไม่เติมสระอะคั่นกลาง',
      svgScene: 'heart_hands',
      distractorsSv: ['Du är så trött', 'Du är hemma nu', 'Du pratar bra'],
      distractorsTh: ['คุณดูเหนื่อยมาก', 'คุณอยู่บ้านตอนนี้', 'คุณพูดเก่งมาก'],
      wordChunks: ['Du', 'är', 'så', 'snäll']
    },
    {
      id: 't2_älskling',
      themeId: 'family_love',
      type: 'word',
      sv: 'Min älskling',
      th: 'ที่รักของฉัน',
      satunFlavor: 'ขวัญใจของฉาน / ที่รักจ๋า',
      phoneticTh: 'มิน-เอล-สกลิง',
      pronunciationTip: 'ออกเสียงควบกล้ำตรงกลางเบาๆ ว่า "เอล-สกลิง"',
      svgScene: 'heart',
      distractorsSv: ['Min kompis', 'Min granne', 'Min lärare'],
      distractorsTh: ['เพื่อนของฉัน', 'เพื่อนบ้านของฉัน', 'ครูของฉัน'],
      wordChunks: ['Min', 'älskling']
    },
    {
      id: 't2_matt',
      themeId: 'family_love',
      type: 'word',
      sv: 'Jag är mätt',
      th: 'ฉันอิ่มแล้ว',
      satunFlavor: 'อิ่มแปล้เลยจ้า กินหรอยจังฮู้!',
      phoneticTh: 'ย๊อก-แอร์-เม็ต',
      pronunciationTip: 'ä สั้นใน mätt ออกเสียงสั้นและคมว่า "เม็ต"',
      svgScene: 'yummy',
      distractorsSv: ['Jag är hungrig', 'Jag är törstig', 'Jag är vaken'],
      distractorsTh: ['ฉันหิวข้าว', 'ฉันหิวน้ำ', 'ฉันตื่นแล้ว'],
      wordChunks: ['Jag', 'är', 'mätt']
    },
    {
      id: 't2_torstig',
      themeId: 'family_love',
      type: 'word',
      sv: 'Törstig',
      th: 'หิวน้ำ / กระหายน้ำ',
      satunFlavor: 'คอแห้งหิวน้ำจัง ขอน้ำเย็นๆ สักแก้วต๊ะ',
      phoneticTh: 'เทอร์-สติก',
      pronunciationTip: 'rs ออกเสียงเป็น ช/ษ เบาๆ รวมเป็น "เทอร์-สติก"',
      svgScene: 'water',
      distractorsSv: ['Hungrig', 'Sömnig', 'Glad'],
      distractorsTh: ['หิวข้าว', 'ง่วงนอน', 'ดีใจ'],
      wordChunks: ['Törstig']
    },
    {
      id: 't2_sent_du_gor_mig_glad',
      themeId: 'family_love',
      type: 'sentence',
      sv: 'Du gör mig så glad',
      th: 'คุณทำให้ฉันมีความสุขมาก',
      satunFlavor: 'อยู่กับเธอแล้วฉานบายใจจังฮู้!',
      phoneticTh: 'ดู-เยอร์-เมย์-ซัว-กลอด',
      pronunciationTip: 'g หน้าสระ ö ในคำว่า gör ออกเสียงเป็น ย.ยักษ์ ว่า "เยอร์" และ mig อ่านว่า "เมย์"',
      svgScene: 'happy',
      distractorsSv: ['Jag vill sova nu', 'Vi går till affären', 'Det är kallt ute'],
      distractorsTh: ['ฉันอยากนอนตอนนี้', 'เราไปร้านค้ากัน', 'ข้างนอกอากาศหนาว'],
      wordChunks: ['Du', 'gör', 'mig', 'så', 'glad']
    },
    {
      id: 't2_sent_jag_ar_trott_ikvall',
      themeId: 'family_love',
      type: 'sentence',
      sv: 'Jag är lite trött ikväll',
      th: 'คืนนี้ฉันเหนื่อยนิดหน่อย',
      satunFlavor: 'ค่ำนี้เหนื่อยๆ อิดนึงจ้า ขอพักผ่อนนะ',
      phoneticTh: 'ย๊อก-แอร์-ลี-เตะ-เทร็อต-อี-คเวล',
      pronunciationTip: 'kv ใน ikväll ออกเสียง ค-ว ควบกันเป็น "อี-คเวล"',
      svgScene: 'sleep',
      distractorsSv: ['Jag är jättepigg idag', 'Ska vi äta frukost nu', 'Solen skiner hela dagen'],
      distractorsTh: ['วันนี้ฉันสดชื่นมาก', 'เรากินมื้อเช้ากันไหม', 'แดดออกทั้งวันเลย'],
      wordChunks: ['Jag', 'är', 'lite', 'trött', 'ikväll']
    },
    {
      id: 't2_sent_mysigt_hemma',
      themeId: 'family_love',
      type: 'sentence',
      sv: 'Det är så mysigt här hemma',
      th: 'อยู่ที่บ้านนี้อบอุ่นสบายใจจัง',
      satunFlavor: 'อยู่เรือนเราอบอุ่นบายใจที่สุดเลยเนอะ',
      phoneticTh: 'เด-แอร์-ซัว-มี-ซิกต์-แฮร์-เฮ็ม-มะ',
      pronunciationTip: 't ท้ายคำว่า det ไม่ออกเสียง ให้พูดสั้นๆ ว่า "เด-แอร์"',
      svgScene: 'home',
      distractorsSv: ['Det är långt till stan', 'Vad kostar den här', 'Bussen kommer snart'],
      distractorsTh: ['ไกลจากตัวเมืองมาก', 'อันนี้ราคาเท่าไหร่', 'รถเมล์กำลังจะมาเร็วๆ นี้'],
      wordChunks: ['Det', 'är', 'så', 'mysigt', 'här', 'hemma']
    },
    {
      id: 't2_sent_du_ar_duktig',
      themeId: 'family_love',
      type: 'sentence',
      sv: 'Du är jätteduktig på svenska',
      th: 'คุณเก่งภาษาสวีเดนมากๆ เลย',
      satunFlavor: 'แหลงสวีเดนเก่งจังฮู้! ภูมิใจในตัวตะเองนิ',
      phoneticTh: 'ดู-แอร์-เย็ต-เตะ-ดุค-ติก-พัว-สเวน-สกะ',
      pronunciationTip: 'u ใน duktig ออกเสียงคล้ายสระ อุ/อึ สั้นๆ "ดุค-ติก"',
      svgScene: 'star',
      distractorsSv: ['Jag kommer från Thailand', 'Kan du prata långsammare', 'Var ligger stationen'],
      distractorsTh: ['ฉันมาจากประเทศไทย', 'พูดช้าลงหน่อยได้ไหม', 'สถานีอยู่ที่ไหน'],
      wordChunks: ['Du', 'är', 'jätteduktig', 'på', 'svenska']
    },

    /* ------------------------------------------------------------------------
       TEMA 3: I MATBUTIKEN & HANDLA (ในซูเปอร์มาร์เก็ต)
       ------------------------------------------------------------------------ */
    {
      id: 't3_mjolk',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Mjölk',
      th: 'นมสด',
      satunFlavor: 'นมสดแช่เย็นในตู้ซูเปอร์มาร์เก็ต',
      phoneticTh: 'มเยิ้ลก์',
      pronunciationTip: 'ออกเสียง ม-ย ควบกันแล้วห่อปากสำหรับสระ ö เป็น "มเยิ้ลก์"',
      svgScene: 'cart',
      distractorsSv: ['Bröd', 'Smör', 'Ost'],
      distractorsTh: ['ขนมปัง', 'เนย', 'ชีส'],
      wordChunks: ['Mjölk']
    },
    {
      id: 't3_brod',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Bröd',
      th: 'ขนมปัง',
      satunFlavor: 'หนมปังหอมๆ กินตอนเช้า',
      phoneticTh: 'เบริด',
      pronunciationTip: 'ห่อปากกลมสำหรับเสียง ö แล้วลากเสียงยาว "เบริด"',
      svgScene: 'bun',
      distractorsSv: ['Mjölk', 'Fisk', 'Ägg'],
      distractorsTh: ['นมสด', 'ปลา', 'ไข่'],
      wordChunks: ['Bröd']
    },
    {
      id: 't3_kyckling',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Kyckling',
      th: 'เนื้อไก่',
      satunFlavor: 'เนื้อไก่สด เอาไปทำแกงหรือทอดหรอยๆ',
      phoneticTh: 'ชึค-คลิง',
      pronunciationTip: 'k หน้าสระ y ออกเสียงเป็น ช.ช้าง นุ่มๆ ว่า "ชึค-คลิง" (ไม่ใช่ คึค-คลิง)',
      svgScene: 'yummy',
      distractorsSv: ['Lax', 'Nötkött', 'Grönsaker'],
      distractorsTh: ['ปลาแซลมอน', 'เนื้อวัว', 'ผักสด'],
      wordChunks: ['Kyckling']
    },
    {
      id: 't3_ris',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Ris',
      th: 'ข้าวสาร / ข้าวสวย',
      satunFlavor: 'ข้าวหอมมะลิ ของขาดไม่ได้สำหรับคนสตูล!',
      phoneticTh: 'รีส',
      pronunciationTip: 'ลากเสียงสระ อี ยาวๆ "รีส" แล้วจบด้วยเสียง ส.เสือ เบาๆ',
      svgScene: 'fish',
      distractorsSv: ['Potatis', 'Pasta', 'Bröd'],
      distractorsTh: ['มันฝรั่ง', 'พาสต้า', 'ขนมปัง'],
      wordChunks: ['Ris']
    },
    {
      id: 't3_agg',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Ägg',
      th: 'ไข่',
      satunFlavor: 'ไข่ไก่สดๆ เอาไปเจียวร้อนๆ หรอยจังฮู้',
      phoneticTh: 'เอ็กก์',
      pronunciationTip: 'สระ ä สั้น ออกเสียงว่า "เอ็กก์" สั้นและชัด',
      svgScene: 'cart',
      distractorsSv: ['Mjölk', 'Frukt', 'Påse'],
      distractorsTh: ['นมสด', 'ผลไม้', 'ถุงใส่ของ'],
      wordChunks: ['Ägg']
    },
    {
      id: 't3_vad_kostar_det',
      themeId: 'supermarket',
      type: 'sentence',
      sv: 'Vad kostar det?',
      th: 'อันนี้ราคาเท่าไหร่?',
      satunFlavor: 'อันนี้กี่โครนจ๊ะ / ราคาเท่าใด?',
      phoneticTh: 'วอด-คอส-ทาร์-เด',
      pronunciationTip: 'd ใน vad และ t ใน det ไม่ออกเสียงชัดเจน พูดลื่นๆ ว่า "วอด-คอส-ทาร์-เด"',
      svgScene: 'tag',
      distractorsSv: ['Var finns mjölken?', 'Vill du ha kvitto?', 'Kan jag betala nu?'],
      distractorsTh: ['นมอยู่ตรงไหน?', 'รับใบเสร็จไหมคะ?', 'จ่ายเงินตอนนี้ได้ไหม?'],
      wordChunks: ['Vad', 'kostar', 'det']
    },
    {
      id: 't3_pase',
      themeId: 'supermarket',
      type: 'word',
      sv: 'En påse',
      th: 'ถุงใส่ของ 1 ใบ',
      satunFlavor: 'ถุงหิ้วใส่ของกลับเรือน',
      phoneticTh: 'เอ็น-พัว-เซะ',
      pronunciationTip: 'å ยาวใน påse ออกเสียงคล้าย "พัว/พอ" ลากเสียงพยางค์แรก',
      svgScene: 'cart',
      distractorsSv: ['Ett kvitto', 'En korg', 'Ett kort'],
      distractorsTh: ['ใบเสร็จ', 'ตะกร้า', 'บัตรเครดิต'],
      wordChunks: ['En', 'påse']
    },
    {
      id: 't3_kvitto',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Kvitto',
      th: 'ใบเสร็จรับเงิน',
      satunFlavor: 'บิลใบเสร็จ (พนักงานที่สวีเดนจะถามประจำว่าเอาหม้าย)',
      phoneticTh: 'ควิท-ทู',
      pronunciationTip: 'kv ออกเสียง ค-ว ควบกัน และ o ท้ายคำออกเสียงสระ "อู"',
      svgScene: 'tag',
      distractorsSv: ['Pengar', 'Påse', 'Rabatt'],
      distractorsTh: ['เงินสด', 'ถุงใส่ของ', 'ส่วนลด'],
      wordChunks: ['Kvitto']
    },
    {
      id: 't3_frukt_gronsaker',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Frukt och grönsaker',
      th: 'ผลไม้และผักสด',
      satunFlavor: 'ผักสดกับลูกไม้สดๆ น่ากินจัง',
      phoneticTh: 'ฟรุคต์-อ็อค-เกริน-ซอ-เคอร์',
      pronunciationTip: 'คำว่า och (และ) ในภาษาพูดออกเสียงสั้นๆ ว่า "อ็อค" หรือ "โอ"',
      svgScene: 'cart',
      distractorsSv: ['Kaffe och kaka', 'Kött och fisk', 'Bröd och ost'],
      distractorsTh: ['กาแฟและเค้ก', 'เนื้อและปลา', 'ขนมปังและชีส'],
      wordChunks: ['Frukt', 'och', 'grönsaker']
    },
    {
      id: 't3_billigt',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Det är billigt',
      th: 'มันราคาถูก',
      satunFlavor: 'ถูกจังฮู้! ลดราคาคุ้มแรงนิ',
      phoneticTh: 'เด-แอร์-บิล-ลิกต์',
      pronunciationTip: 'เน้นเสียงสั้นที่พยางค์แรก "บิล-ลิกต์"',
      svgScene: 'coin',
      distractorsSv: ['Det är dyrt', 'Det är gratis', 'Det är slut'],
      distractorsTh: ['มันแพงมาก', 'อันนี้ฟรี', 'ของหมดแล้ว'],
      wordChunks: ['Det', 'är', 'billigt']
    },
    {
      id: 't3_betala_kort',
      themeId: 'supermarket',
      type: 'word',
      sv: 'Betala med kort',
      th: 'จ่ายด้วยบัตร',
      satunFlavor: 'แตะบัตรจ่ายตังค์ง่ายๆ สไตล์สวีเดน',
      phoneticTh: 'เบ-ทา-ละ-เมด-คอร์ต',
      pronunciationTip: 'rt ใน kort ออกเสียงรวมกันเป็นเสียง ท/ฏ ลึกๆ ว่า "คอร์ต"',
      svgScene: 'card',
      distractorsSv: ['Betala kontant', 'Spara kvittot', 'Köpa en påse'],
      distractorsTh: ['จ่ายเงินสด', 'เก็บใบเสร็จ', 'ซื้อถุงใส่ของ'],
      wordChunks: ['Betala', 'med', 'kort']
    },
    {
      id: 't3_sent_handla_mat',
      themeId: 'supermarket',
      type: 'sentence',
      sv: 'Jag ska handla mjölk och bröd',
      th: 'ฉันจะไปซื้อนมและขนมปัง',
      satunFlavor: 'เดี๋ยวฉานไปซื้อนมกับหนมปังที่ร้านก่อนนะ',
      phoneticTh: 'ย๊อก-สกะ-ฮัน-ดละ-มเยิ้ลก์-อ็อค-เบริด',
      pronunciationTip: 'handla แปลว่าซื้อของเข้าบ้าน ออกเสียงว่า "ฮัน-ดละ"',
      svgScene: 'cart',
      distractorsSv: ['Jag vill dricka kaffe nu', 'Vi äter middag hemma', 'Har du sett min nyckel'],
      distractorsTh: ['ฉันอยากดื่มกาแฟตอนนี้', 'เรากินข้าวเย็นที่บ้าน', 'คุณเห็นกุญแจฉันไหม'],
      wordChunks: ['Jag', 'ska', 'handla', 'mjölk', 'och', 'bröd']
    },
    {
      id: 't3_sent_vill_du_ha_kvitto',
      themeId: 'supermarket',
      type: 'sentence',
      sv: 'Vill du ha kvitto och en påse?',
      th: 'คุณต้องการใบเสร็จและถุงไหมคะ?',
      satunFlavor: 'เอาบิลกับถุงใส่ของด้วยหม้ายจ๊ะ? (ประโยคยอดฮิตตรงแคชเชียร์)',
      phoneticTh: 'วิล-ดู-ฮา-ควิท-ทู-อ็อค-เอ็น-พัว-เซะ',
      pronunciationTip: 'ขึ้นเสียงสูงนิดนึงท้ายประโยคเพื่อแสดงว่าเป็นคำถามสุภาพ',
      svgScene: 'tag',
      distractorsSv: ['Vad kostar kycklingen idag', 'Var ligger närmaste butik', 'Jag betalar med mitt kort'],
      distractorsTh: ['วันนี้ไก่ราคาเท่าไหร่', 'ร้านที่ใกล้ที่สุดอยู่ไหน', 'ฉันจ่ายด้วยบัตรของฉัน'],
      wordChunks: ['Vill', 'du', 'ha', 'kvitto', 'och', 'en', 'påse']
    },
    {
      id: 't3_sent_var_finns_ris',
      themeId: 'supermarket',
      type: 'sentence',
      sv: 'Ursäkta, var finns ris och ägg?',
      th: 'ขอโทษค่ะ ข้าวสารและไข่อยู่ตรงไหนคะ?',
      satunFlavor: 'ขอโทษนะจ๊ะ ข้าวสารกับไข่อยู่แถวไหนเอ่ย?',
      phoneticTh: 'อูร์-เช็ค-ตะ วอร์-ฟินส์-รีส-อ็อค-เอ็กก์',
      pronunciationTip: 'finns แปลว่า "มีอยู่/ตั้งอยู่" ใช้ถามหาของในร้านค้าสะดวกมาก',
      svgScene: 'polite',
      distractorsSv: ['Tack för maten det var gott', 'Jag vill köpa en bussbiljett', 'Klockan är åtta på morgonen'],
      distractorsTh: ['ขอบคุณสำหรับอาหาร อร่อยมาก', 'ฉันอยากซื้อตั๋วรถเมล์', 'ตอนนี้แปดโมงเช้าแล้ว'],
      wordChunks: ['Ursäkta', 'var', 'finns', 'ris', 'och', 'ägg']
    },
    {
      id: 't3_sent_kan_jag_betala',
      themeId: 'supermarket',
      type: 'sentence',
      sv: 'Kan jag betala med kort här?',
      th: 'ฉันจ่ายด้วยบัตรตรงนี้ได้ไหมคะ?',
      satunFlavor: 'แตะบัตรจ่ายตรงนี้ได้เลยหม้ายจ๊ะ?',
      phoneticTh: 'คาน-ย๊อก-เบ-ทา-ละ-เมด-คอร์ต-แฮร์',
      pronunciationTip: 'här ออกเสียง "แฮร์" แปลว่า "ที่นี่/ตรงนี้"',
      svgScene: 'card',
      distractorsSv: ['Jag har glömt min telefon', 'Det är väldigt billigt idag', 'Vi går hem efteråt'],
      distractorsTh: ['ฉันลืมโทรศัพท์ไว้', 'วันนี้ราคาถูกมากเลย', 'เรากลับบ้านกันหลังจากนี้'],
      wordChunks: ['Kan', 'jag', 'betala', 'med', 'kort', 'här']
    },
    {
      id: 't3_sent_nej_tack_kvitto',
      themeId: 'supermarket',
      type: 'sentence',
      sv: 'Nej tack, jag behöver inget kvitto',
      th: 'ไม่เป็นไรขอบคุณค่ะ ฉันไม่เอาใบเสร็จ',
      satunFlavor: 'ไม่เอาบิลจ้า ขอบคุณมากนะจ๊ะ',
      phoneticTh: 'เนย์-ทัค ย๊อก-เบ-เฮอ-เวอร์-อิง-เอ็ต-ควิท-ทู',
      pronunciationTip: 'behöver (ต้องการ) ห่อปากตรงพยางค์กลาง "-เฮอ-" ลากเสียงยาว',
      svgScene: 'smile',
      distractorsSv: ['Ja tack jag vill ha kaffe', 'Var ligger utgången här', 'Jag älskar svensk mat'],
      distractorsTh: ['รับค่ะ ฉันขอกาแฟ', 'ทางออกอยู่ตรงไหนคะ', 'ฉันชอบอาหารสวีเดน'],
      wordChunks: ['Nej', 'tack', 'jag', 'behöver', 'inget', 'kvitto']
    },

    /* ------------------------------------------------------------------------
       TEMA 4: MATLAGNING & SVENSK FIKA (อาหารและฟีก้า)
       ------------------------------------------------------------------------ */
    {
      id: 't4_kaffe',
      themeId: 'fika_food',
      type: 'word',
      sv: 'En kopp kaffe',
      th: 'กาแฟ 1 ถ้วย',
      satunFlavor: 'โกปี๊ร้อนๆ หอมกรุ่นสักถ้วย',
      phoneticTh: 'เอ็น-ค็อป-คัฟ-เฟะ',
      pronunciationTip: 'ออกเสียง ฟ.ฟัน ซ้ำเบาๆ ตรงกลางคำว่า "คัฟ-เฟะ"',
      svgScene: 'coffee',
      distractorsSv: ['Ett glas vatten', 'En kopp te', 'En flaska läsk'],
      distractorsTh: ['น้ำเปล่าหนึ่งแก้ว', 'ชาหนึ่งถ้วย', 'น้ำอัดลมหนึ่งขวด'],
      wordChunks: ['En', 'kopp', 'kaffe']
    },
    {
      id: 't4_kanelbulle',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Kanelbulle',
      th: 'ขนมปังซินนามอนโรล (คาเนลบุลเล่)',
      satunFlavor: 'หนมปังอบเชยของแท้สวีเดน หรอยจังฮู้!',
      phoneticTh: 'คะ-เนล-บุล-เละ',
      pronunciationTip: 'เน้นเสียงยาวที่พยางค์ "-เนล-" แล้วตามด้วย "บุล-เละ"',
      svgScene: 'bun',
      distractorsSv: ['Smörgås', 'Chokladkaka', 'Pannkaka'],
      distractorsTh: ['แซนด์วิช', 'เค้กช็อกโกแลต', 'แพนเค้ก'],
      wordChunks: ['Kanelbulle']
    },
    {
      id: 't4_vatten',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Vatten',
      th: 'น้ำเปล่า',
      satunFlavor: 'น้ำกินเย็นๆ ชื่นใจ',
      phoneticTh: 'วัท-เท็น',
      pronunciationTip: 'แตะฟันบนกับริมฝีปากล่างสำหรับตัว V แล้วออกเสียงสั้นว่า "วัท-เท็น"',
      svgScene: 'water',
      distractorsSv: ['Kaffe', 'Juice', 'Mjölk'],
      distractorsTh: ['กาแฟ', 'น้ำผลไม้', 'นมสด'],
      wordChunks: ['Vatten']
    },
    {
      id: 't4_jattegott',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Jättegott',
      th: 'อร่อยมากๆ',
      satunFlavor: 'หรอยจังฮู้! หรอยแรงนิ!',
      phoneticTh: 'เย็ต-เตะ-ก็อต',
      pronunciationTip: 'j ออกเสียง ย.ยักษ์ "เย็ต-เตะ-ก็อต" คำชมอาหารที่คนสวีเดนชอบฟังที่สุด!',
      svgScene: 'yummy',
      distractorsSv: ['Jättebra', 'Jättestor', 'Jättesnäll'],
      distractorsTh: ['ดีมากๆ', 'ใหญ่มากๆ', 'ใจดีมากๆ'],
      wordChunks: ['Jättegott']
    },
    {
      id: 't4_varmt',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Varmt',
      th: 'ร้อน / อุ่น',
      satunFlavor: 'ร้อนๆ อุ่นๆ กำลังกินหรอยเลย',
      phoneticTh: 'วารม์ต',
      pronunciationTip: 'ออกเสียง ว/ฟ นำหน้า แล้วเก็บเสียง ม-ท ท้ายคำเบาๆ',
      svgScene: 'coffee',
      distractorsSv: ['Kallt', 'Sött', 'Stark'],
      distractorsTh: ['เย็น', 'หวาน', 'เผ็ด'],
      wordChunks: ['Varmt']
    },
    {
      id: 't4_kallt',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Kallt',
      th: 'เย็น',
      satunFlavor: 'เย็นเจี๊ยบ ชื่นใจจังฮู้',
      phoneticTh: 'คัลต์',
      pronunciationTip: 'ออกเสียงสั้นที่ "คัล-" แล้วแตะลิ้นเป็นเสียง ท ท้ายคำ',
      svgScene: 'water',
      distractorsSv: ['Varmt', 'Gott', 'Lagom'],
      distractorsTh: ['ร้อน', 'อร่อย', 'พอดีๆ'],
      wordChunks: ['Kallt']
    },
    {
      id: 't4_ska_vi_fika',
      themeId: 'fika_food',
      type: 'sentence',
      sv: 'Ska vi fika?',
      th: 'เราไปพักดื่มกาแฟกินขนม (ฟีก้า) กันไหม?',
      satunFlavor: 'ไปนั่งจิบโกปี๊กินหนม แหลงกันสนุกๆ ต๊ะ!',
      phoneticTh: 'สกะ-วี-ฟี-กะ',
      pronunciationTip: 'ลากเสียงสระ อี ใน fika ยาวนิดนึงว่า "ฟี-กะ"',
      svgScene: 'coffee',
      distractorsSv: ['Ska vi sova?', 'Ska vi gå hem?', 'Ska vi städa?'],
      distractorsTh: ['เราไปนอนกันไหม?', 'เรากลับบ้านกันไหม?', 'เราทำความสะอาดกันไหม?'],
      wordChunks: ['Ska', 'vi', 'fika']
    },
    {
      id: 't4_ata_mat',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Äta mat',
      th: 'กินข้าว / ทานอาหาร',
      satunFlavor: 'กินข้าวกันต๊ะ กับข้าวเสร็จแล้ว!',
      phoneticTh: 'แอ-ตะ-ม๊อต',
      pronunciationTip: 'ä ยาวใน äta ออกเสียง "แอ-ตะ" และ mat ออกเสียงสระ อา-ออ ว่า "ม๊อต"',
      svgScene: 'fish',
      distractorsSv: ['Laga mat', 'Dricka te', 'Baka bröd'],
      distractorsTh: ['ทำอาหาร', 'ดื่มชา', 'อบขนมปัง'],
      wordChunks: ['Äta', 'mat']
    },
    {
      id: 't4_laga_mat',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Laga mat',
      th: 'ทำอาหาร / ทำกับข้าว',
      satunFlavor: 'เข้าครัวทำกับข้าวหรอยๆ',
      phoneticTh: 'ลอ-กะ-ม๊อต',
      pronunciationTip: 'a แรกใน laga ออกเสียงกว้างคล้าย "ลอ-กะ"',
      svgScene: 'fish',
      distractorsSv: ['Äta frukost', 'Köpa kaffe', 'Diska glas'],
      distractorsTh: ['กินมื้อเช้า', 'ซื้อกาแฟ', 'ล้างแก้ว'],
      wordChunks: ['Laga', 'mat']
    },
    {
      id: 't4_frukost',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Frukost',
      th: 'อาหารเช้า',
      satunFlavor: 'มื้อเช้าเติมพลังก่อนเริ่มวันใหม่',
      phoneticTh: 'ฟรุ-คอสต์',
      pronunciationTip: 'ออกเสียงสั้นที่พยางค์แรก "ฟรุ-คอสต์"',
      svgScene: 'sunrise',
      distractorsSv: ['Lunch', 'Middag', 'Kvällsmat'],
      distractorsTh: ['อาหารเที่ยง', 'อาหารเย็น', 'มื้อดึก'],
      wordChunks: ['Frukost']
    },
    {
      id: 't4_middag',
      themeId: 'fika_food',
      type: 'word',
      sv: 'Middag',
      th: 'อาหารเย็น',
      satunFlavor: 'กินข้าวเย็นพร้อมหน้าพร้อมตากัน',
      phoneticTh: 'มิด-ด็อก',
      pronunciationTip: 'เน้นพยางค์แรก "มิด-ด็อก"',
      svgScene: 'fish',
      distractorsSv: ['Frukost', 'Fika', 'Efterrätt'],
      distractorsTh: ['อาหารเช้า', 'พักดื่มกาแฟ', 'ของหวาน'],
      wordChunks: ['Middag']
    },
    {
      id: 't4_sent_vill_ha_kaffe',
      themeId: 'fika_food',
      type: 'sentence',
      sv: 'Jag vill ha en kopp kaffe, tack',
      th: 'ฉันขอกาแฟหนึ่งถ้วย ขอบคุณค่ะ',
      satunFlavor: 'ขอโกปี๊ร้อนๆ สักถ้วยนะจ๊ะ ขอบคุณจ้า',
      phoneticTh: 'ย๊อก-วิล-ฮา-เอ็น-ค็อป-คัฟ-เฟะ-ทัค',
      pronunciationTip: 'vill ha แปลว่า "ต้องการ/ขอ" ใช้สั่งอาหารได้ทุกอย่างเลย',
      svgScene: 'coffee',
      distractorsSv: ['Jag tycker om att sova', 'Var ligger närmaste kafé', 'Maten står på bordet'],
      distractorsTh: ['ฉันชอบนอนหลับ', 'ร้านกาแฟที่ใกล้ที่สุดอยู่ไหน', 'อาหารวางอยู่บนโต๊ะ'],
      wordChunks: ['Jag', 'vill', 'ha', 'en', 'kopp', 'kaffe', 'tack']
    },
    {
      id: 't4_sent_kanelbulle_god',
      themeId: 'fika_food',
      type: 'sentence',
      sv: 'Den här kanelbullen är jättegod',
      th: 'ขนมปังซินนามอนชิ้นนี้อร่อยมาก',
      satunFlavor: 'หนมปังชิ้นนี้หรอยจังฮู้ หอมหวานกำลังดีเลย!',
      phoneticTh: 'เด็น-แฮร์-คะ-เนล-บุล-เล็น-แอร์-เย็ต-เตะ-กูด',
      pronunciationTip: 'เมื่อชี้ชิ้นเฉพาะเจาะจง kanelbulle จะเติม -n เป็น kanelbullen และใช้ jättegod',
      svgScene: 'bun',
      distractorsSv: ['Kaffet är alldeles för kallt', 'Jag ska baka bröd imorgon', 'Vi dricker vatten till maten'],
      distractorsTh: ['กาแฟเย็นชืดเกินไปแล้ว', 'พรุ่งนี้ฉันจะอบขนมปัง', 'เราดื่มน้ำเปล่าคู่กับอาหาร'],
      wordChunks: ['Den', 'här', 'kanelbullen', 'är', 'jättegod']
    },
    {
      id: 't4_sent_laga_thai_mat',
      themeId: 'fika_food',
      type: 'sentence',
      sv: 'Ikäll ska jag laga thailändsk mat',
      th: 'เย็นนี้ฉันจะทำอาหารไทย',
      satunFlavor: 'ค่ำนี้ฉานจะทำกับข้าวใต้หรอยๆ ให้กินนะจ๊ะ!',
      phoneticTh: 'อี-คเวล-สกะ-ย๊อก-ลอ-กะ-ไทย-เลนด์สก-ม๊อต',
      pronunciationTip: 'เมื่อขึ้นต้นประโยคด้วยเวลา (Ikväll) คำกริยา (ska) จะมาอยู่ก่อนประธาน (jag)',
      svgScene: 'fish',
      distractorsSv: ['Igår åt vi på restaurang', 'Frukosten är klar klockan åtta', 'Vill du ha mer kallt vatten'],
      distractorsTh: ['เมื่อวานเรากินข้าวที่ร้านอาหาร', 'มื้อเช้าเสร็จตอนแปดโมง', 'คุณเอาน้ำเย็นเพิ่มไหม'],
      wordChunks: ['Ikväll', 'ska', 'jag', 'laga', 'thailändsk', 'mat']
    },
    {
      id: 't4_sent_kallt_vatten',
      themeId: 'fika_food',
      type: 'sentence',
      sv: 'Kan jag få ett glas kallt vatten?',
      th: 'ฉันขอน้ำเย็นสักแก้วได้ไหมคะ?',
      satunFlavor: 'ขอน้ำเย็นๆ สักแก้วได้หม้ายจ๊ะ?',
      phoneticTh: 'คาน-ย๊อก-ฟัว-เอ็ต-กลอส-คัลต์-วัท-เท็น',
      pronunciationTip: 'få ออกเสียง "ฟัว/ฟอ" แปลว่า "ได้รับ/ขอ" สุภาพมากเวลาสั่งเครื่องดื่ม',
      svgScene: 'water',
      distractorsSv: ['Var kan jag köpa kaffe', 'Tack för en mysig fika', 'Jag är inte hungrig nu'],
      distractorsTh: ['ฉันซื้อกาแฟได้ที่ไหน', 'ขอบคุณสำหรับฟีก้าที่อบอุ่น', 'ตอนนี้ฉันยังไม่หิว'],
      wordChunks: ['Kan', 'jag', 'få', 'ett', 'glas', 'kallt', 'vatten']
    },
    {
      id: 't4_sent_tack_for_maten',
      themeId: 'fika_food',
      type: 'sentence',
      sv: 'Tack för maten, det var jättegott',
      th: 'ขอบคุณสำหรับอาหารค่ะ มันอร่อยมาก',
      satunFlavor: 'ขอบคุณสำหรับกับข้าวนะจ๊ะ หรอยจังฮู้จริงๆ!',
      phoneticTh: 'ทัค-เฟอร์-มอ-เท็น เด-วอ-เย็ต-เตะ-ก็อต',
      pronunciationTip: 'ธรรมเนียมสวีเดน หลังกินข้าวเสร็จจะพูด "Tack för maten" เสมอ!',
      svgScene: 'yummy',
      distractorsSv: ['Vad ska vi äta till lunch', 'Jag vill beställa en kaffe', 'Maten är varm och klar'],
      distractorsTh: ['เที่ยงนี้เราจะกินอะไรกัน', 'ฉันอยากสั่งกาแฟหนึ่งแก้ว', 'อาหารร้อนและพร้อมเสิร์ฟแล้ว'],
      wordChunks: ['Tack', 'för', 'maten', 'det', 'var', 'jättegott']
    },

    /* ------------------------------------------------------------------------
       TEMA 5: HEMMA & VARDAG (ที่บ้านและชีวิตประจำวัน)
       ------------------------------------------------------------------------ */
    {
      id: 't5_lagenhet',
      themeId: 'everyday',
      type: 'word',
      sv: 'Lägenhet',
      th: 'อพาร์ตเมนต์ / ห้องชุด',
      satunFlavor: 'ห้องพักของเรา อยู่สบายเหมือนเรือนตัวเอง',
      phoneticTh: 'แล-เก็น-เฮียด',
      pronunciationTip: 'เน้นเสียงยาวที่พยางค์แรก "แล-" และพยางค์ท้าย "-เฮียด"',
      svgScene: 'home',
      distractorsSv: ['Trädgård', 'Affär', 'Skola'],
      distractorsTh: ['สวนดอกไม้', 'ร้านค้า', 'โรงเรียน'],
      wordChunks: ['Lägenhet']
    },
    {
      id: 't5_kok',
      themeId: 'everyday',
      type: 'word',
      sv: 'Kök',
      th: 'ห้องครัว',
      satunFlavor: 'ห้องครัวไว้ทำกับข้าวหรอยๆ',
      phoneticTh: 'เชิก',
      pronunciationTip: 'สำคัญมาก! k หน้าสระ ö ออกเสียงเป็น ช.ช้าง นุ่มๆ ว่า "เชิก" (แต่ k ตัวท้ายออกเสียง ก)',
      svgScene: 'coffee',
      distractorsSv: ['Sovrum', 'Badrum', 'Vardagsrum'],
      distractorsTh: ['ห้องนอน', 'ห้องน้ำ', 'ห้องนั่งเล่น'],
      wordChunks: ['Kök']
    },
    {
      id: 't5_sovrum',
      themeId: 'everyday',
      type: 'word',
      sv: 'Sovrum',
      th: 'ห้องนอน',
      satunFlavor: 'ห้องนอนอุ่นๆ ไว้นอนพักผ่อน',
      phoneticTh: 'ซอฟ-รุม',
      pronunciationTip: 'มาจากการรวมคำว่า sova (นอน) + rum (ห้อง) อ่านว่า "ซอฟ-รุม"',
      svgScene: 'sleep',
      distractorsSv: ['Kök', 'Balkong', 'Hall'],
      distractorsTh: ['ห้องครัว', 'ระเบียง', 'โถงทางเข้า'],
      wordChunks: ['Sovrum']
    },
    {
      id: 't5_balkong',
      themeId: 'everyday',
      type: 'word',
      sv: 'Balkong',
      th: 'ระเบียงห้อง',
      satunFlavor: 'ระเบียงไว้ออกไปรับแดดจิบโกปี๊',
      phoneticTh: 'บัล-คอง',
      pronunciationTip: 'เน้นเสียงพยางค์ที่สอง "-คอง" ออกเสียง ง.งู ท้ายคำเหมือนภาษาไทยเลย',
      svgScene: 'sun',
      distractorsSv: ['Fönster', 'Dörr', 'Trappa'],
      distractorsTh: ['หน้าต่าง', 'ประตู', 'บันได'],
      wordChunks: ['Balkong']
    },
    {
      id: 't5_ta_en_dusch',
      themeId: 'everyday',
      type: 'word',
      sv: 'Ta en dusch',
      th: 'อาบน้ำ (ฝักบัว)',
      satunFlavor: 'ไปอาบน้ำให้สดชื่นบายตัวต๊ะ',
      phoneticTh: 'ทา-เอ็น-ดุช',
      pronunciationTip: 'sch ท้ายคำว่า dusch ออกเสียงลม "ช" นุ่มๆ',
      svgScene: 'water',
      distractorsSv: ['Borsta tänderna', 'Gå och lägga sig', 'Tvätta kläder'],
      distractorsTh: ['แปรงฟัน', 'เข้านอน', 'ซักผ้า'],
      wordChunks: ['Ta', 'en', 'dusch']
    },
    {
      id: 't5_stada',
      themeId: 'everyday',
      type: 'word',
      sv: 'Städa',
      th: 'ทำความสะอาดบ้าน',
      satunFlavor: 'ปัดกวาดเช็ดถูเรือนให้สะอาดเอี่ยม',
      phoneticTh: 'สแต-ดะ',
      pronunciationTip: 'ออกเสียง ส-แต ต่อเนื่องกัน ลากเสียงสระ แอ ยาวนิดนึง',
      svgScene: 'home',
      distractorsSv: ['Sova', 'Laga mat', 'Titta på tv'],
      distractorsTh: ['นอนหลับ', 'ทำอาหาร', 'ดูทีวี'],
      wordChunks: ['Städa']
    },
    {
      id: 't5_sova',
      themeId: 'everyday',
      type: 'word',
      sv: 'Sova',
      th: 'นอนหลับ',
      satunFlavor: 'นอนหลับพักผ่อนให้เต็มอิ่ม',
      phoneticTh: 'ซัว-วะ',
      pronunciationTip: 'o ใน sova ออกเสียงคล้ายสระ "อัว/ออ" ว่า "ซัว-วะ"',
      svgScene: 'sleep',
      distractorsSv: ['Vakna', 'Arbeta', 'Promenera'],
      distractorsTh: ['ตื่นนอน', 'ทำงาน', 'เดินเล่น'],
      wordChunks: ['Sova']
    },
    {
      id: 't5_katt',
      themeId: 'everyday',
      type: 'word',
      sv: 'En söt katt',
      th: 'แมวน่ารัก 1 ตัว',
      satunFlavor: 'น้องเหมียวขี้อ้อนประจำบ้าน',
      phoneticTh: 'เอ็น-เซิต-คัท',
      pronunciationTip: 'söt (น่ารัก/หวาน) ห่อปากสำหรับสระ ö แล้วออกเสียงว่า "เซิต"',
      svgScene: 'heart',
      distractorsSv: ['En stor hund', 'En liten fågel', 'En röd bil'],
      distractorsTh: ['สุนัขตัวใหญ่', 'นกตัวเล็ก', 'รถยนต์สีแดง'],
      wordChunks: ['En', 'söt', 'katt']
    },
    {
      id: 't5_nyckel',
      themeId: 'everyday',
      type: 'word',
      sv: 'Hemnyckel',
      th: 'กุญแจบ้าน',
      satunFlavor: 'ลูกกุญแจเรือน อย่าลืมพกติดตัวนะจ๊ะ',
      phoneticTh: 'เฮ็ม-นึค-เคล',
      pronunciationTip: 'y ใน nyckel ออกเสียงสระ "อึ/อือ" สั้นๆ',
      svgScene: 'key',
      distractorsSv: ['Mobiltelefon', 'Plånbok', 'Glasögon'],
      distractorsTh: ['โทรศัพท์มือถือ', 'กระเป๋าสตางค์', 'แว่นตา'],
      wordChunks: ['Hemnyckel']
    },
    {
      id: 't5_tvatta_klader',
      themeId: 'everyday',
      type: 'word',
      sv: 'Tvätta kläder',
      th: 'ซักผ้า',
      satunFlavor: 'ซักผ้าในห้องซักรีด (Tvättstuga)',
      phoneticTh: 'ทเว็ท-ตะ-แคล-เดอร์',
      pronunciationTip: 'tv ออกเสียง ท-ว ควบกันเป็น "ทเว็ท-ตะ"',
      svgScene: 'water',
      distractorsSv: ['Städa köket', 'Laga middag', 'Bädda sängen'],
      distractorsTh: ['ทำความสะอาดครัว', 'ทำอาหารเย็น', 'เก็บที่นอน'],
      wordChunks: ['Tvätta', 'kläder']
    },
    {
      id: 't5_vakna_tidigt',
      themeId: 'everyday',
      type: 'word',
      sv: 'Vakna tidigt',
      th: 'ตื่นแต่เช้า',
      satunFlavor: 'ตื่นเช้าตรู่ สดชื่นแจ่มใส',
      phoneticTh: 'วัค-นะ-ที-ดิกต์',
      pronunciationTip: 'ลากเสียงสระ อี ใน tidigt ยาวนิดนึงว่า "ที-ดิกต์"',
      svgScene: 'sunrise',
      distractorsSv: ['Sova länge', 'Äta sent', 'Gå hem'],
      distractorsTh: ['นอนตื่นสาย', 'กินข้าวดึก', 'กลับบ้าน'],
      wordChunks: ['Vakna', 'tidigt']
    },
    {
      id: 't5_sent_jag_ar_i_koket',
      themeId: 'everyday',
      type: 'sentence',
      sv: 'Jag är i köket och lagar mat',
      th: 'ฉันอยู่ในห้องครัวและกำลังทำอาหาร',
      satunFlavor: 'ฉานอยู่ในครัวกำลังทำกับข้าวหรอยๆ จ้า',
      phoneticTh: 'ย๊อก-แอร์-อี-เชอ-เค็ต-อ็อค-ลอ-การ์-ม๊อต',
      pronunciationTip: 'i köket (ในห้องครัว) ออกเสียง ช.ช้าง ทั้งตอนเป็น kök และ köket ("เชอ-เค็ต")',
      svgScene: 'coffee',
      distractorsSv: ['Jag sitter på balkongen nu', 'Katten sover i sovrummet', 'Vi städar hela lägenheten'],
      distractorsTh: ['ตอนนี้ฉันนั่งอยู่ที่ระเบียง', 'แมวนอนหลับอยู่ในห้องนอน', 'เราทำความสะอาดทั้งห้องชุด'],
      wordChunks: ['Jag', 'är', 'i', 'köket', 'och', 'lagar', 'mat']
    },
    {
      id: 't5_sent_stada_lagenheten',
      themeId: 'everyday',
      type: 'sentence',
      sv: 'Vi ska städa lägenheten idag',
      th: 'วันนี้เราจะทำความสะอาดอพาร์ตเมนต์กัน',
      satunFlavor: 'วันนี้มาช่วยกันจัดเรือนให้สะอาดน่าอยู่กันต๊ะ',
      phoneticTh: 'วี-สกะ-สแต-ดะ-แล-เก็น-เฮีย-เท็น-อี-ด๊อก',
      pronunciationTip: 'ska + กริยาช่องเดิม (städa) ใช้บอกสิ่งที่จะทำในอนาคต',
      svgScene: 'home',
      distractorsSv: ['Vi ska åka till stan idag', 'Jag vill ta en varm dusch', 'Har du sett min telefon'],
      distractorsTh: ['วันนี้เราจะเข้าเมืองกัน', 'ฉันอยากอาบน้ำอุ่น', 'คุณเห็นโทรศัพท์ฉันไหม'],
      wordChunks: ['Vi', 'ska', 'städa', 'lägenheten', 'idag']
    },
    {
      id: 't5_sent_katten_sover',
      themeId: 'everyday',
      type: 'sentence',
      sv: 'Katten sover i sovrummet',
      th: 'แมวนอนหลับอยู่ในห้องนอน',
      satunFlavor: 'น้องเหมียวนอนหลับปุ๋ยอยู่ในห้องนอนนู้น',
      phoneticTh: 'คัท-เท็น-ซัว-เวอร์-อี-ซอฟ-รุม-เม็ต',
      pronunciationTip: 'sover เป็นรูปปัจจุบันของ sova อ่านว่า "ซัว-เวอร์"',
      svgScene: 'sleep',
      distractorsSv: ['Hunden springer i parken', 'Frukosten står i köket', 'Jag sitter i vardagsrummet'],
      distractorsTh: ['สุนัขวิ่งเล่นในสวน', 'อาหารเช้าอยู่ในครัว', 'ฉันนั่งอยู่ในห้องนั่งเล่น'],
      wordChunks: ['Katten', 'sover', 'i', 'sovrummet']
    },
    {
      id: 't5_sent_sitta_pa_balkongen',
      themeId: 'everyday',
      type: 'sentence',
      sv: 'Det är skönt att sitta på balkongen',
      th: 'นั่งเล่นที่ระเบียงแล้วสบายจัง',
      satunFlavor: 'นั่งรับลมที่ระเบียงแล้วบายใจจังฮู้',
      phoneticTh: 'เด-แอร์-เชินต์-อัท-ซิท-ตะ-พัว-บัล-คอง-เอ็น',
      pronunciationTip: 'sk หน้าสระ ö ใน skönt ออกเสียงเป็นเสียงลม "ช/ฮ" ว่า "เชินต์"',
      svgScene: 'sun',
      distractorsSv: ['Det är dags att gå och sova', 'Jag måste tvätta kläder nu', 'Dörren är låst med nyckel'],
      distractorsTh: ['ได้เวลาเข้านอนแล้ว', 'ฉันต้องซักผ้าตอนนี้', 'ประตูล็อกด้วยกุญแจแล้ว'],
      wordChunks: ['Det', 'är', 'skönt', 'att', 'sitta', 'på', 'balkongen']
    },
    {
      id: 't5_sent_var_ar_nyckel',
      themeId: 'everyday',
      type: 'sentence',
      sv: 'Var är min nyckel och min telefon?',
      th: 'กุญแจและโทรศัพท์ของฉันอยู่ไหนนะ?',
      satunFlavor: 'ลูกกุญแจกับมือถือของฉานไปอยู่ไหนแล้วนิ?',
      phoneticTh: 'วอร์-แอร์-มิน-นึค-เคล-อ็อค-มิน-เท-เล-โฟน',
      pronunciationTip: 'เน้นเสียงยาวที่พยางค์ท้ายของ telefon ("เท-เล-โฟน")',
      svgScene: 'key',
      distractorsSv: ['Jag tar en dusch på morgonen', 'Vi ses hemma hos mig ikväll', 'Lägenheten har tre stora rum'],
      distractorsTh: ['ฉันอาบน้ำตอนเช้า', 'เจอกันที่บ้านฉันเย็นนี้', 'ห้องชุดมีสามห้องใหญ่'],
      wordChunks: ['Var', 'är', 'min', 'nyckel', 'och', 'min', 'telefon']
    },

    /* ------------------------------------------------------------------------
       TEMA 6: VÄDER & SVENSKA ÅRSTIDER (อากาศและฤดูกาล)
       ------------------------------------------------------------------------ */
    {
      id: 't6_kallt_idag',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Det är kallt idag',
      th: 'วันนี้อากาศหนาว',
      satunFlavor: 'วันนี้หนาวจังฮู้! ต่างจากอากาศบ้านเราที่สตูลเลย',
      phoneticTh: 'เด-แอร์-คัลต์-อี-ด๊อก',
      pronunciationTip: 'เชื่อมเสียง เด-แอร์-คัลต์-อี-ด๊อก ให้ลื่นไหลต่อเนื่อง',
      svgScene: 'snow',
      distractorsSv: ['Det är varmt idag', 'Det regnar idag', 'Det blåser idag'],
      distractorsTh: ['วันนี้อากาศอบอุ่น', 'วันนี้ฝนตก', 'วันนี้ลมแรง'],
      wordChunks: ['Det', 'är', 'kallt', 'idag']
    },
    {
      id: 't6_solen_skiner',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Solen skiner',
      th: 'พระอาทิตย์ส่องแสง / แดดออกจ้า',
      satunFlavor: 'แดดออกหรอยจัง เหมือนแดดที่เกาะหลีเป๊ะสตูลเลย!',
      phoneticTh: 'ซู-เล็น-ชี-เนอร์',
      pronunciationTip: 'sk หน้าสระ i ใน skiner ออกเสียงเป็นลม "ช/ฮ" ว่า "ชี-เนอร์" (ห้ามอ่านว่า สกี-เนอร์)',
      svgScene: 'sun',
      distractorsSv: ['Det snöar ute', 'Himlen är grå', 'Det är mörkt'],
      distractorsTh: ['หิมะตกข้างนอก', 'ท้องฟ้าสีเทา', 'ข้างนอกมืดแล้ว'],
      wordChunks: ['Solen', 'skiner']
    },
    {
      id: 't6_sno',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Vit snö',
      th: 'หิมะสีขาว',
      satunFlavor: 'หิมะขาวสวยเหมือนปุยนุ่นเลย',
      phoneticTh: 'วีท-สเนอ',
      pronunciationTip: 'ห่อปากสำหรับสระ ö ท้ายคำว่า snö ("สเนอ")',
      svgScene: 'snow',
      distractorsSv: ['Kallt regn', 'Stark vind', 'Varm sol'],
      distractorsTh: ['ฝนเย็นๆ', 'ลมแรง', 'แดดอุ่น'],
      wordChunks: ['Vit', 'snö']
    },
    {
      id: 't6_regn',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Det regnar',
      th: 'ฝนกำลังตก',
      satunFlavor: 'ฝนตกหล่าว! อย่าลืมพกร่มนะจ๊ะ',
      phoneticTh: 'เด-เร็ง-นาร์',
      pronunciationTip: 'gn ใน regnar ออกเสียงเหมือน ง.งู + น.หนู เป็น "เร็ง-นาร์" (ไม่ออกเสียง ก.ไก่)',
      svgScene: 'rain',
      distractorsSv: ['Det snöar', 'Solen skiner', 'Det är soligt'],
      distractorsTh: ['หิมะกำลังตก', 'พระอาทิตย์ส่องแสง', 'มีแดดจ้า'],
      wordChunks: ['Det', 'regnar']
    },
    {
      id: 't6_varm_jacka',
      themeId: 'weather_time',
      type: 'word',
      sv: 'En varm jacka',
      th: 'เสื้อแจ็คเก็ตกันหนาวอุ่นๆ 1 ตัว',
      satunFlavor: 'เสื้อกันหนาวอุ่นๆ ใส่แล้วไม่หนาวสั่น',
      phoneticTh: 'เอ็น-วารม์-ยัค-กะ',
      pronunciationTip: 'j ใน jacka ออกเสียง ย.ยักษ์ เป็น "ยัค-กะ"',
      svgScene: 'snow',
      distractorsSv: ['Ett paraply', 'En t-shirt', 'Solglasögon'],
      distractorsTh: ['ร่มกันฝน', 'เสื้อยืด', 'แว่นกันแดด'],
      wordChunks: ['En', 'varm', 'jacka']
    },
    {
      id: 't6_vinter',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Vinter',
      th: 'ฤดูหนาว',
      satunFlavor: 'หน้าหนาวสวีเดน มืดเร็วแต่เปิดไฟสวยโรแมนติกมาก',
      phoneticTh: 'วิน-เทอร์',
      pronunciationTip: 'แตะฟันบนที่ริมฝีปากล่างสำหรับตัว V "วิน-เทอร์"',
      svgScene: 'snow',
      distractorsSv: ['Sommar', 'Vår', 'Höst'],
      distractorsTh: ['ฤดูร้อน', 'ฤดูใบไม้ผลิ', 'ฤดูใบไม้ร่วง'],
      wordChunks: ['Vinter']
    },
    {
      id: 't6_sommar',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Svensk sommar',
      th: 'ฤดูร้อนของสวีเดน',
      satunFlavor: 'หน้าร้อนสวีเดน สว่างทั้งคืน อากาศดีจังฮู้!',
      phoneticTh: 'สเวนสก-ซอม-มาร์',
      pronunciationTip: 'o ใน sommar ออกเสียงสระ ออ สั้นๆ ว่า "ซอม-มาร์"',
      svgScene: 'sun',
      distractorsSv: ['Kall vinter', 'Regnig höst', 'Tidig vår'],
      distractorsTh: ['ฤดูหนาวที่หนาวเย็น', 'ฤดูใบไม้ร่วงที่ฝนตก', 'ต้นฤดูใบไม้ผลิ'],
      wordChunks: ['Svensk', 'sommar']
    },
    {
      id: 't6_var_och_host',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Vår och höst',
      th: 'ฤดูใบไม้ผลิและฤดูใบไม้ร่วง',
      satunFlavor: 'หน้าใบไม้ผลิดอกไม้บาน กับหน้าใบไม้เปลี่ยนสีสวยๆ',
      phoneticTh: 'วอร์-อ็อค-เฮิสต์',
      pronunciationTip: 'vår ออกเสียง "วอร์" ยาวๆ ส่วน höst ออกเสียงสั้นว่า "เฮิสต์"',
      svgScene: 'sparkles',
      distractorsSv: ['Dag och natt', 'Sol och måne', 'Snö och is'],
      distractorsTh: ['กลางวันและกลางคืน', 'พระอาทิตย์และพระจันทร์', 'หิมะและน้ำแข็ง'],
      wordChunks: ['Vår', 'och', 'höst']
    },
    {
      id: 't6_paraply',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Ett paraply',
      th: 'ร่ม 1 คัน',
      satunFlavor: 'ร่มกันฝน พกติดกระเป๋าไว้อุ่นใจ',
      phoneticTh: 'เอ็ต-พะ-ระ-พลี',
      pronunciationTip: 'เน้นเสียงพยางค์สุดท้าย "-พลี" โดยห่อปากเป็นสระ y',
      svgScene: 'rain',
      distractorsSv: ['En mössa', 'Ett par skor', 'En halsduk'],
      distractorsTh: ['หมวกไหมพรม', 'รองเท้าหนึ่งคู่', 'ผ้าพันคอ'],
      wordChunks: ['Ett', 'paraply']
    },
    {
      id: 't6_blasigt',
      themeId: 'weather_time',
      type: 'word',
      sv: 'Det blåser',
      th: 'ลมพัดแรง',
      satunFlavor: 'ลมแรงเหมือนอยู่ริมเลเลยจ้า',
      phoneticTh: 'เด-บลัว-เซอร์',
      pronunciationTip: 'å ใน blåser ออกเสียง "อัว/ออ" ยาวๆ ว่า "บลัว-เซอร์"',
      svgScene: 'rain',
      distractorsSv: ['Det är vindstilla', 'Det är varmt', 'Solen går ner'],
      distractorsTh: ['ลมสงบนิ่ง', 'อากาศอบอุ่น', 'พระอาทิตย์ตกดิน'],
      wordChunks: ['Det', 'blåser']
    },
    {
      id: 't6_sent_fint_vader',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Idag är det riktigt fint väder',
      th: 'วันนี้อากาศดีมากๆ เลย',
      satunFlavor: 'วันนี้อากาศดีจังฮู้ น่าออกไปเดินเล่นรับแดดต๊ะ!',
      phoneticTh: 'อี-ด๊อก-แอร์-เด-ริค-ติกต์-ฟีนต์-แว-เดอร์',
      pronunciationTip: 'väder ลากเสียงสระ แอ ยาวที่พยางค์แรก "แว-เดอร์"',
      svgScene: 'sun',
      distractorsSv: ['Igår snöade det hela dagen', 'Jag fryser om mina händer', 'Glöm inte ditt paraply idag'],
      distractorsTh: ['เมื่อวานหิมะตกทั้งวัน', 'ฉันหนาวมือจังเลย', 'อย่าลืมร่มของคุณวันนี้'],
      wordChunks: ['Idag', 'är', 'det', 'riktigt', 'fint', 'väder']
    },
    {
      id: 't6_sent_ta_pa_jacka',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Ta på dig en varm jacka',
      th: 'สวมเสื้อแจ็คเก็ตอุ่นๆ ด้วยนะ',
      satunFlavor: 'ใส่เสื้อหนาวอุ่นๆ ด้วยนะจ๊ะ ข้างนอกมันหนาว!',
      phoneticTh: 'ทา-พัว-เดย์-เอ็น-วารม์-ยัค-กะ',
      pronunciationTip: 'ta på dig แปลว่า "สวมใส่ (บนตัวคุณ)" ใช้กับเสื้อผ้าได้ทุกชิ้น',
      svgScene: 'snow',
      distractorsSv: ['Öppna fönstret i sovrummet', 'Sommaren är varm och solig', 'Vi dricker varmt kaffe inne'],
      distractorsTh: ['เปิดหน้าต่างในห้องนอน', 'ฤดูร้อนอบอุ่นและมีแดด', 'เราดื่มกาแฟร้อนข้างในบ้าน'],
      wordChunks: ['Ta', 'på', 'dig', 'en', 'varm', 'jacka']
    },
    {
      id: 't6_sent_det_snoar_ute',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Titta, det snöar ute nu!',
      th: 'ดูสิ ตอนนี้ข้างนอกหิมะกำลังตก!',
      satunFlavor: 'แลนั่นต๊ะ! หิมะตกข้างนอกแล้ว สวยจังฮู้!',
      phoneticTh: 'ทิท-ตะ เด-สเนอ-อาร์-อู-เตะ-นือ',
      pronunciationTip: 'u ใน ute และ nu ห่อปากแคบๆ เป็นเสียง "อู/อือ" แบบสวีเดน',
      svgScene: 'snow',
      distractorsSv: ['Hör du hur mycket det regnar', 'Det blir varmare i nästa vecka', 'Jag längtar efter sommaren'],
      distractorsTh: ['ได้ยินไหมว่าฝนตกหนักแค่ไหน', 'สัปดาห์หน้าอากาศจะอุ่นขึ้น', 'ฉันคิดถึงฤดูร้อนจัง'],
      wordChunks: ['Titta', 'det', 'snöar', 'ute', 'nu']
    },
    {
      id: 't6_sent_alskar_sommaren',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Jag älskar när solen skiner på sommaren',
      th: 'ฉันชอบเวลาที่แดดออกในฤดูร้อนมาก',
      satunFlavor: 'ชอบตอนแดดออกหน้าร้อนจังฮู้ อุ่นสบายเหมือนอยู่สตูลเลย',
      phoneticTh: 'ย๊อก-เอล-สการ์-แนร์-ซู-เล็น-ชี-เนอร์-พัว-ซอม-มะ-เร็น',
      pronunciationTip: 'när แปลว่า "เมื่อ/ตอนที่" ออกเสียงสระ แอ ยาวว่า "แนร์"',
      svgScene: 'sun',
      distractorsSv: ['På vintern är det kallt och mörkt', 'Det regnar nästan hela hösten', 'Jag behöver köpa nya vinterskor'],
      distractorsTh: ['ในฤดูหนาวอากาศหนาวและมืด', 'ฝนตกเกือบตลอดฤดูใบไม้ร่วง', 'ฉันต้องซื้อรองเท้าหน้าหนาวคู่ใหม่'],
      wordChunks: ['Jag', 'älskar', 'när', 'solen', 'skiner', 'på', 'sommaren']
    },
    {
      id: 't6_sent_behov_paraply',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Det regnar idag, så jag tar med ett paraply',
      th: 'วันนี้ฝนตก ฉันเลยพกร่มไปด้วย',
      satunFlavor: 'วันนี้ฝนตก ฉานพกร่มติดมือไปด้วยดีกว่าเนอะ',
      phoneticTh: 'เด-เร็ง-นาร์-อี-ด๊อก ซัว-ย๊อก-ทาร์-เมด-เอ็ต-พะ-ระ-พลี',
      pronunciationTip: 'tar med แปลว่า "นำติดตัวไปด้วย" ออกเสียง d ท้ายคำว่า med เบาๆ',
      svgScene: 'rain',
      distractorsSv: ['Solen skiner så vi går till stranden', 'Det är tjugo grader varmt idag', 'Våren kommer tidigt i år'],
      distractorsTh: ['แดดออกเราเลยไปชายหาดกัน', 'วันนี้อุณหภูมิยี่สิบองศา', 'ปีนี้ฤดูใบไม้ผลิมาเร็ว'],
      wordChunks: ['Det', 'regnar', 'idag', 'så', 'jag', 'tar', 'med', 'ett', 'paraply']
    },
    {
      id: 't6_sent_vinter_kall',
      themeId: 'weather_time',
      type: 'sentence',
      sv: 'Vintern i Sverige är kall men vacker',
      th: 'ฤดูหนาวในสวีเดนหนาวแต่สวยงามมาก',
      satunFlavor: 'หน้าหนาวที่สวีเดนหนาวแรง แต่สวยเหมือนในนิยายเลยจ้า',
      phoneticTh: 'วิน-เทิร์น-อี-สเวีย-ริ-เยะ-แอร์-คัล-เม็น-วัค-เคอร์',
      pronunciationTip: 'Sverige ออกเสียงว่า "สเวีย-ริ-เยะ" (ตัว g ออกเสียง ย.ยักษ์)',
      svgScene: 'snow',
      distractorsSv: ['Sommaren i Thailand är alltid varm', 'Höstlöven är gula och röda', 'Det blåser kallt från havet'],
      distractorsTh: ['ฤดูร้อนในไทยอบอุ่นเสมอ', 'ใบไม้ฤดูใบไม้ร่วงมีสีเหลืองและแดง', 'ลมเย็นพัดมาจากทะเล'],
      wordChunks: ['Vintern', 'i', 'Sverige', 'är', 'kall', 'men', 'vacker']
    },

    /* ------------------------------------------------------------------------
       TEMA 7: SIFFROR, KLOCKAN & DAGAR (ตัวเลข เวลา และวัน)
       ------------------------------------------------------------------------ */
    {
      id: 't7_ett_tva_tre',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Ett, två, tre',
      th: 'หนึ่ง, สอง, สาม (1, 2, 3)',
      satunFlavor: 'นับหนึ่ง สอง สาม เริ่มต้นง่ายๆ เลยจ้า',
      phoneticTh: 'เอ็ต-ทวอ-เทรีย',
      pronunciationTip: 'två ออกเสียง ท-ว ควบกันว่า "ทวอ" และ tre ลากเสียงสระ เอ กึ่ง เอีย ว่า "เทรีย"',
      svgScene: 'coin',
      distractorsSv: ['Fyra, fem, sex', 'Sju, åtta, nio', 'Tio, elva, tolv'],
      distractorsTh: ['สี่, ห้า, หก', 'เจ็ด, แปด, เก้า', 'สิบ, สิบเอ็ด, สิบสอง'],
      wordChunks: ['Ett', 'två', 'tre']
    },
    {
      id: 't7_fyra_fem_sex',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Fyra, fem, sex',
      th: 'สี่, ห้า, หก (4, 5, 6)',
      satunFlavor: 'สี่ ห้า หก จำแม่นๆ เวลาดูราคาของ',
      phoneticTh: 'ฟี-ระ-เฟ็ม-เซ็กซ์',
      pronunciationTip: 'y ใน fyra ห่อปากกลมเหมือนเป่าเทียนแล้วพูด "ฟี-ระ"',
      svgScene: 'coin',
      distractorsSv: ['Ett, två, tre', 'Sju, åtta, nio', 'Tretton, fjorton, femton'],
      distractorsTh: ['หนึ่ง, สอง, สาม', 'เจ็ด, แปด, เก้า', 'สิบสาม, สิบสี่, สิบห้า'],
      wordChunks: ['Fyra', 'fem', 'sex']
    },
    {
      id: 't7_sju_atta_nio_tio',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Sju, åtta, nio, tio',
      th: 'เจ็ด, แปด, เก้า, สิบ (7, 8, 9, 10)',
      satunFlavor: 'เจ็ด แปด เก้า สิบ คล่องปากแล้วหรอยจังฮู้!',
      phoneticTh: 'ฮู่ว-อ็อต-ตะ-นี-ยุ-ที-ยุ',
      pronunciationTip: 'เลข 7 (sju) มีเสียง sj พิเศษ พ่นลมจากคอเบาๆ คล้าย "ฮู่ว/ชู่ว"',
      svgScene: 'coin',
      distractorsSv: ['Ett, två, tre, fyra', 'Elva, tolv, tretton, fjorton', 'Femtio, hundra, tusen'],
      distractorsTh: ['หนึ่ง, สอง, สาม, สี่', 'สิบเอ็ด, สิบสอง, สิบสาม, สิบสี่', 'ห้าสิบ, หนึ่งร้อย, หนึ่งพัน'],
      wordChunks: ['Sju', 'åtta', 'nio', 'tio']
    },
    {
      id: 't7_tjugo',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Tjugo (20)',
      th: 'ยี่สิบ (20)',
      satunFlavor: 'ยี่สิบโครน จำง่ายใช้บ่อยมาก',
      phoneticTh: 'ชู-กู',
      pronunciationTip: 'tj หน้าคำว่า tjugo ออกเสียง ช.ช้าง นุ่มๆ ว่า "ชู-กู" หรือ "ชู-เกะ"',
      svgScene: 'tag',
      distractorsSv: ['Tolv (12)', 'Femtio (50)', 'Hundra (100)'],
      distractorsTh: ['สิบสอง (12)', 'ห้าสิบ (50)', 'หนึ่งร้อย (100)'],
      wordChunks: ['Tjugo']
    },
    {
      id: 't7_idag',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Idag',
      th: 'วันนี้',
      satunFlavor: 'วันนี้เดี๋ยวนี้เลยจ้า',
      phoneticTh: 'อี-ด๊อก',
      pronunciationTip: 'เน้นเสียงพยางค์หลัง "-ด๊อก"',
      svgScene: 'sun',
      distractorsSv: ['Imorgon', 'Igår', 'Nästa vecka'],
      distractorsTh: ['พรุ่งนี้', 'เมื่อวานนี้', 'สัปดาห์หน้า'],
      wordChunks: ['Idag']
    },
    {
      id: 't7_imorgon',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Imorgon',
      th: 'พรุ่งนี้',
      satunFlavor: 'ต่อเช้า! (ภาษาใต้สตูลเรียกพรุ่งนี้ว่า "ต่อเช้า")',
      phoneticTh: 'อี-มอร์-รอน',
      pronunciationTip: 'ไม่ออกเสียงตัว g ตรงกลาง พูดรวบเป็น "อี-มอร์-รอน"',
      svgScene: 'sunrise',
      distractorsSv: ['Idag', 'Igår', 'Ikväll'],
      distractorsTh: ['วันนี้', 'เมื่อวานนี้', 'เย็นนี้'],
      wordChunks: ['Imorgon']
    },
    {
      id: 't7_igar',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Igår',
      th: 'เมื่อวานนี้',
      satunFlavor: 'แรกวาน! (ภาษาใต้สตูลเรียกเมื่อวานว่า "แรกวาน")',
      phoneticTh: 'อี-กอร์',
      pronunciationTip: 'ลากเสียง å ยาวที่พยางค์หลังว่า "อี-กอร์"',
      svgScene: 'sleep',
      distractorsSv: ['Idag', 'Imorgon', 'Nu'],
      distractorsTh: ['วันนี้', 'พรุ่งนี้', 'ตอนนี้'],
      wordChunks: ['Igår']
    },
    {
      id: 't7_vad_ar_klockan',
      themeId: 'shopping_numbers',
      type: 'sentence',
      sv: 'Vad är klockan?',
      th: 'ตอนนี้กี่โมงแล้ว?',
      satunFlavor: 'ตอนนี้ทุ่มยามเท่าใดแล้วจ๊ะ?',
      phoneticTh: 'วอด-แอร์-คล็อค-กัน',
      pronunciationTip: 'ออกเสียง คล- ควบกล้ำชัดเจน "คล็อค-กัน"',
      svgScene: 'star',
      distractorsSv: ['Vilken dag är det?', 'Vad kostar klockan?', 'När går bussen?'],
      distractorsTh: ['วันนี้วันอะไร?', 'นาฬิกาเรือนนี้ราคาเท่าไหร่?', 'รถเมล์ออกเมื่อไหร่?'],
      wordChunks: ['Vad', 'är', 'klockan']
    },
    {
      id: 't7_en_vecka',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'En vecka',
      th: '1 สัปดาห์',
      satunFlavor: 'หนึ่งอาทิตย์มีเจ็ดวัน',
      phoneticTh: 'เอ็น-เว็ค-กะ',
      pronunciationTip: 'ออกเสียงสั้นตรงกลางคำว่า "เว็ค-กะ"',
      svgScene: 'sparkles',
      distractorsSv: ['En månad', 'Ett år', 'En timme'],
      distractorsTh: ['หนึ่งเดือน', 'หนึ่งปี', 'หนึ่งชั่วโมง'],
      wordChunks: ['En', 'vecka']
    },
    {
      id: 't7_trevlig_helg',
      themeId: 'shopping_numbers',
      type: 'word',
      sv: 'Trevlig helg',
      th: 'สุขสันต์วันหยุดสุดสัปดาห์',
      satunFlavor: 'เที่ยววันเสาร์อาทิตย์ให้หนุกหนานบายใจนะจ๊ะ!',
      phoneticTh: 'เทรฟ-ลิก-เฮลย์',
      pronunciationTip: 'lg ท้ายคำว่า helg ออกเสียงเป็น ล+ย ว่า "เฮลย์" (ไม่ออกเสียง ก)',
      svgScene: 'happy',
      distractorsSv: ['God morgon', 'Måndag morgon', 'Varje dag'],
      distractorsTh: ['อรุณสวัสดิ์', 'เช้าวันจันทร์', 'ทุกๆ วัน'],
      wordChunks: ['Trevlig', 'helg']
    },
    {
      id: 't7_klockan_sju',
      themeId: 'shopping_numbers',
      type: 'sentence',
      sv: 'Klockan är sju',
      th: 'ขณะนี้เวลา 7 โมง',
      satunFlavor: 'เจ็ดโมงแล้วจ้า ได้เวลาตื่นหรือกินข้าวแล้ว',
      phoneticTh: 'คล็อค-กัน-แอร์-ฮู่ว',
      pronunciationTip: 'ระบบฟังเสียงเข้าใจทั้งคำว่า "sju" และตัวเลข "7" เลยจ้า',
      svgScene: 'sunrise',
      distractorsSv: ['Klockan är tolv', 'Det tar tio minuter', 'Vi ses klockan fem'],
      distractorsTh: ['ตอนนี้เวลาเที่ยงตรง', 'ใช้เวลาสิบนาที', 'เจอกันตอนห้าโมง'],
      wordChunks: ['Klockan', 'är', 'sju']
    },
    {
      id: 't7_sent_idag_ar_mandag',
      themeId: 'shopping_numbers',
      type: 'sentence',
      sv: 'Idag är det måndag och imorgon är det tisdag',
      th: 'วันนี้เป็นวันจันทร์ และพรุ่งนี้เป็นวันอังคาร',
      satunFlavor: 'วันนี้วันจันทร์ ต่อเช้าก็วันอังคารแล้ว เวลาผ่านไวจัง',
      phoneticTh: 'อี-ด๊อก-แอร์-เด-มอน-ด๊อก อ็อค-อี-มอร์-รอน-แอร์-เด-ทิส-ด๊อก',
      pronunciationTip: 'ชื่อวันในสวีเดนลงท้ายด้วย -dag (อ่านว่า -ด๊อก) ทั้งหมดเลย!',
      svgScene: 'sun',
      distractorsSv: ['Igår var det söndag hela dagen', 'Jag är ledig på lördag och söndag', 'Klockan är halv åtta på kvällen'],
      distractorsTh: ['เมื่อวานเป็นวันอาทิตย์ทั้งวัน', 'ฉันหยุดงานวันเสาร์และอาทิตย์', 'ตอนนี้เวลาหนึ่งทุ่มครึ่ง'],
      wordChunks: ['Idag', 'är', 'det', 'måndag', 'och', 'imorgon', 'är', 'det', 'tisdag']
    },
    {
      id: 't7_sent_tjugo_kronor',
      themeId: 'shopping_numbers',
      type: 'sentence',
      sv: 'Det kostar tjugo kronor',
      th: 'อันนี้ราคายี่สิบโครน',
      satunFlavor: 'ราคายี่สิบโครนเอง ถูกจังฮู้!',
      phoneticTh: 'เด-คอส-ทาร์-ชู-กู-ครู-นูร์',
      pronunciationTip: 'kronor (สกุลเงินสวีเดน) อ่านออกเสียงสระ อู ว่า "ครู-นูร์"',
      svgScene: 'coin',
      distractorsSv: ['Jag har hundra kronor på kortet', 'Butiken öppnar klockan nio', 'Vi ses om femton minuter'],
      distractorsTh: ['ฉันมีเงินร้อยโครนในบัตร', 'ร้านเปิดตอนเก้าโมงเช้า', 'เจอกันในอีกสิบห้านาที'],
      wordChunks: ['Det', 'kostar', 'tjugo', 'kronor']
    },
    {
      id: 't7_sent_vi_ses_klockan_tre',
      themeId: 'shopping_numbers',
      type: 'sentence',
      sv: 'Vi ses klockan tre i eftermiddag',
      th: 'เจอกันตอนบ่ายสามโมงวันนี้',
      satunFlavor: 'บ่ายสามโมงวันนี้ค่อยเจอกันนะจ๊ะ อย่าลืมนะ!',
      phoneticTh: 'วี-เซส-คล็อค-กัน-เทรีย-อี-เอ็ฟ-เทอร์-มิด-ด๊อก',
      pronunciationTip: 'eftermiddag แปลว่า "ช่วงบ่าย" เน้นเสียงที่พยางค์แรก "เอ็ฟ-"',
      svgScene: 'sparkles',
      distractorsSv: ['Jag vaknade klockan sex imorse', 'Det är sju dagar i en vecka', 'Igår regnade det hela kvällen'],
      distractorsTh: ['เมื่อเช้าฉันตื่นหกโมง', 'หนึ่งสัปดาห์มีเจ็ดวัน', 'เมื่อวานฝนตกตลอดทั้งเย็น'],
      wordChunks: ['Vi', 'ses', 'klockan', 'tre', 'i', 'eftermiddag']
    },
    {
      id: 't7_sent_ledig_helgen',
      themeId: 'shopping_numbers',
      type: 'sentence',
      sv: 'Är du ledig i helgen?',
      th: 'สุดสัปดาห์นี้คุณว่างไหม?',
      satunFlavor: 'เสาร์อาทิตย์นี้ว่างหม้ายจ๊ะ ไปเที่ยวกันต๊ะ!',
      phoneticTh: 'แอร์-ดู-เลีย-ดิก-อี-เฮล-เย็น',
      pronunciationTip: 'i helgen (ในสุดสัปดาห์นี้) ตัว g ออกเสียง ย.ยักษ์ เป็น "เฮล-เย็น"',
      svgScene: 'happy',
      distractorsSv: ['Vilken tid börjar skolan idag', 'Jag jobbar fem dagar i veckan', 'Nu är det dags att äta middag'],
      distractorsTh: ['วันนี้โรงเรียนเริ่มกี่โมง', 'ฉันทำงานห้าวันต่อสัปดาห์', 'ตอนนี้ได้เวลากินข้าวเย็นแล้ว'],
      wordChunks: ['Är', 'du', 'ledig', 'i', 'helgen']
    },
    {
      id: 't7_sent_igar_idag_imorgon',
      themeId: 'shopping_numbers',
      type: 'sentence',
      sv: 'Igår tränade jag, och idag vilar jag',
      th: 'เมื่อวานฉันฝึกซ้อม และวันนี้ฉันพักผ่อน',
      satunFlavor: 'แรกวานขยันซ้อมไปแล้ว วันนี้ขอพักผ่อนให้บายใจหน่อยต๊ะ',
      phoneticTh: 'อี-กอร์-แทร-นะ-เดะ-ย๊อก อ็อค-อี-ด๊อก-วี-ลาร์-ย๊อก',
      pronunciationTip: 'สังเกตคำกริยา: tränade (อดีตเมื่อวาน) และ vilar (ปัจจุบันวันนี้)',
      svgScene: 'star',
      distractorsSv: ['Imorgon ska jag åka tåg till stan', 'Klockan går väldigt fort idag', 'Jag räknar från ett till tjugo'],
      distractorsTh: ['พรุ่งนี้ฉันจะนั่งรถไฟเข้าเมือง', 'วันนี้นาฬิกาเดินเร็วมาก', 'ฉันนับเลขจากหนึ่งถึงยี่สิบ'],
      wordChunks: ['Igår', 'tränade', 'jag', 'och', 'idag', 'vilar', 'jag']
    },

    /* ------------------------------------------------------------------------
       TEMA 8: PÅ STAN & TRANSPORT (การเดินทางและในเมือง)
       ------------------------------------------------------------------------ */
    {
      id: 't8_buss',
      themeId: 'city_transport',
      type: 'word',
      sv: 'Ta bussen',
      th: 'ขึ้นรถเมล์',
      satunFlavor: 'นั่งรถเมล์เข้าเมือง สะดวกตรงเวลาเป๊ะ',
      phoneticTh: 'ทา-บุส-เซ็น',
      pronunciationTip: 'u สั้นใน bussen ออกเสียงคล้ายสระ อุ/อึ สั้นๆ ว่า "บุส-เซ็น"',
      svgScene: 'cart',
      distractorsSv: ['Köra bil', 'Cykla hem', 'Flyga flygplan'],
      distractorsTh: ['ขับรถยนต์', 'ปั่นจักรยานกลับบ้าน', 'นั่งเครื่องบิน'],
      wordChunks: ['Ta', 'bussen']
    },
    {
      id: 't8_tag',
      themeId: 'city_transport',
      type: 'word',
      sv: 'Åka tåg',
      th: 'เดินทางด้วยรถไฟ',
      satunFlavor: 'นั่งรถไฟสวีเดนชมวิวสวยๆ สบายจังฮู้',
      phoneticTh: 'อัว-กะ-ท็อก',
      pronunciationTip: 'ลากเสียง å ยาวทั้งสองคำ: "อัว-กะ-ท็อก"',
      svgScene: 'sparkles',
      distractorsSv: ['Promenera', 'Springa fort', 'Stanna här'],
      distractorsTh: ['เดินเล่น', 'วิ่งเร็วๆ', 'หยุดตรงนี้'],
      wordChunks: ['Åka', 'tåg']
    },
    {
      id: 't8_ga_promenera',
      themeId: 'city_transport',
      type: 'word',
      sv: 'Gå till fots',
      th: 'เดินไป',
      satunFlavor: 'เดินทอดน่องกินลมชมวิวไปเรื่อยๆ',
      phoneticTh: 'กัว-ทิล-ฟุตส์',
      pronunciationTip: 'gå ออกเสียง "กัว/กอ" แปลว่า เดิน',
      svgScene: 'sun',
      distractorsSv: ['Åka buss', 'Ta tåget', 'Köpa biljett'],
      distractorsTh: ['นั่งรถเมล์', 'ขึ้นรถไฟ', 'ซื้อตั๋ว'],
      wordChunks: ['Gå', 'till', 'fots']
    },
    {
      id: 't8_till_hoger',
      themeId: 'city_transport',
      type: 'word',
      sv: 'Till höger',
      th: 'ทางขวา / เลี้ยวขวา',
      satunFlavor: 'เลี้ยวทางขวามือเลยจ้า',
      phoneticTh: 'ทิล-เฮอ-เกอร์',
      pronunciationTip: 'ห่อปากสำหรับสระ ö ยาวใน höger ("เฮอ-เกอร์")',
      svgScene: 'key',
      distractorsSv: ['Till vänster', 'Rakt fram', 'Bakåt'],
      distractorsTh: ['ทางซ้าย', 'ตรงไปข้างหน้า', 'ถอยหลัง'],
      wordChunks: ['Till', 'höger']
    },
    {
      id: 't8_till_vanster',
      themeId: 'city_transport',
      type: 'word',
      sv: 'Till vänster',
      th: 'ทางซ้าย / เลี้ยวซ้าย',
      satunFlavor: 'เลี้ยวทางซ้ายมือตรงแยกหน้านะจ๊ะ',
      phoneticTh: 'ทิล-เว็น-สเตอร์',
      pronunciationTip: 'ออกเสียงตัว V ชัดๆ ว่า "เว็น-สเตอร์"',
      svgScene: 'key',
      distractorsSv: ['Till höger', 'Rakt fram', 'Uppåt'],
      distractorsTh: ['ทางขวา', 'ตรงไปข้างหน้า', 'ขึ้นข้างบน'],
      wordChunks: ['Till', 'vänster']
    },
    {
      id: 't8_rakt_fram',
      themeId: 'city_transport',
      type: 'word',
      sv: 'Rakt fram',
      th: 'ตรงไปข้างหน้า',
      satunFlavor: 'เดินตรงดิ่งไปข้างหน้าเลย ไม่หลงแน่นอน!',
      phoneticTh: 'รัคต์-ฟรัม',
      pronunciationTip: 'กระดกลิ้น R เบาๆ ทั้งสองคำ "รัคต์-ฟรัม"',
      svgScene: 'star',
      distractorsSv: ['Till vänster', 'Till höger', 'runt hörnet'],
      distractorsTh: ['ทางซ้าย', 'ทางขวา', 'ตรงหัวมุม'],
      wordChunks: ['Rakt', 'fram']
    },
    {
      id: 't8_var_ligger',
      themeId: 'city_transport',
      type: 'sentence',
      sv: 'Var ligger stationen?',
      th: 'สถานีอยู่ที่ไหนคะ?',
      satunFlavor: 'สถานีรถไฟอยู่แถวไหนจ๊ะ ช่วยบอกทางหน่อยต๊ะ',
      phoneticTh: 'วอร์-ลิก-เกอร์-สตะ-ชู-เน็น',
      pronunciationTip: 'ti ใน stationen ออกเสียงเป็นลม "ชู" อ่านว่า "สตะ-ชู-เน็น"',
      svgScene: 'polite',
      distractorsSv: ['När kommer nästa buss?', 'Vad kostar en biljett?', 'Går det här tåget till stan?'],
      distractorsTh: ['รถเมล์คันต่อไปมาเมื่อไหร่?', 'ตั๋วใบละเท่าไหร่?', 'รถไฟขบวนนี้เข้าเมืองไหม?'],
      wordChunks: ['Var', 'ligger', 'stationen']
    },
    {
      id: 't8_biljett',
      themeId: 'city_transport',
      type: 'word',
      sv: 'En biljett',
      th: 'ตั๋วเดินทาง 1 ใบ',
      satunFlavor: 'ตั๋วรถเมล์หรือรถไฟ ซื้อผ่านแอปในมือถือได้เลย',
      phoneticTh: 'เอ็น-บิล-เย็ต',
      pronunciationTip: 'lj ใน biljett ออกเสียง ย.ยักษ์ เน้นพยางค์ท้ายว่า "บิล-เย็ต"',
      svgScene: 'card',
      distractorsSv: ['En tidtabell', 'En hållplats', 'En väska'],
      distractorsTh: ['ตารางเวลาเดินรถ', 'ป้ายรถเมล์', 'กระเป๋า'],
      wordChunks: ['En', 'biljett']
    },
    {
      id: 't8_busshallplats',
      themeId: 'city_transport',
      type: 'word',
      sv: 'Busshållplats',
      th: 'ป้ายรถเมล์',
      satunFlavor: 'ศาลาป้ายรอรถเมล์',
      phoneticTh: 'บุส-ฮอล-พลัตส์',
      pronunciationTip: 'แบ่งจังหวะคำประสมเป็น 3 ส่วนชัดๆ: บุส-ฮอล-พลัตส์',
      svgScene: 'home',
      distractorsSv: ['Tågstation', 'Flygplats', 'Parkering'],
      distractorsTh: ['สถานีรถไฟ', 'สนามบิน', 'ที่จอดรถ'],
      wordChunks: ['Busshållplats']
    },
    {
      id: 't8_centrum',
      themeId: 'city_transport',
      type: 'word',
      sv: 'I centrum',
      th: 'ในใจกลางเมือง',
      satunFlavor: 'ในตัวเมือง มีร้านค้าและคาเฟ่เยอะแยะเลย',
      phoneticTh: 'อี-เซ็น-ทรุม',
      pronunciationTip: 'c หน้าสระ e ออกเสียง ซ.โซ่ ว่า "เซ็น-ทรุม"',
      svgScene: 'cart',
      distractorsSv: ['På landet', 'I skogen', 'Vid havet'],
      distractorsTh: ['ในชนบท', 'ในป่า', 'ริมทะเล'],
      wordChunks: ['I', 'centrum']
    },
    {
      id: 't8_cykla',
      themeId: 'city_transport',
      type: 'word',
      sv: 'Cykla',
      th: 'ปั่นจักรยาน',
      satunFlavor: 'ถีบรถถีบชมเมือง คนสวีเดนชอบปั่นจักรยานมาก',
      phoneticTh: 'ซึค-คละ',
      pronunciationTip: 'y ใน cykla ห่อปากนิดนึง ออกเสียงว่า "ซึค-คละ"',
      svgScene: 'sun',
      distractorsSv: ['Åka buss', 'Promenera', 'Simma'],
      distractorsTh: ['นั่งรถเมล์', 'เดินเล่น', 'ว่ายน้ำ'],
      wordChunks: ['Cykla']
    },
    {
      id: 't8_sent_var_ligger_busshallplatsen',
      themeId: 'city_transport',
      type: 'sentence',
      sv: 'Ursäkta, var ligger närmaste busshållplats?',
      th: 'ขอโทษค่ะ ป้ายรถเมล์ที่ใกล้ที่สุดอยู่ที่ไหนคะ?',
      satunFlavor: 'ขอโทษนะจ๊ะ ป้ายรถเมล์ที่ใกล้ที่สุดอยู่ตรงไหนเอ่ย?',
      phoneticTh: 'อูร์-เช็ค-ตะ วอร์-ลิก-เกอร์-แนร์-มัส-เตะ-บุส-ฮอล-พลัตส์',
      pronunciationTip: 'närmaste แปลว่า "ใกล้ที่สุด" ออกเสียงสระ แอ ยาวตรงพยางค์แรก',
      svgScene: 'polite',
      distractorsSv: ['Jag vill köpa en biljett till tåget', 'Vi åker buss till centrum idag', 'Gå till höger efter bron'],
      distractorsTh: ['ฉันอยากซื้อตั๋วรถไฟหนึ่งใบ', 'วันนี้เรานั่งรถเมล์เข้าใจกลางเมือง', 'เลี้ยวขวาหลังจากข้ามสะพาน'],
      wordChunks: ['Ursäkta', 'var', 'ligger', 'närmaste', 'busshållplats']
    },
    {
      id: 't8_sent_ga_rakt_fram_vanster',
      themeId: 'city_transport',
      type: 'sentence',
      sv: 'Gå rakt fram och sväng sedan till vänster',
      th: 'เดินตรงไปข้างหน้า แล้วจากนั้นเลี้ยวซ้าย',
      satunFlavor: 'เดินตรงไปเรื่อยๆ แล้วค่อยเลี้ยวซ้ายนะจ๊ะ',
      phoneticTh: 'กัว-รัคต์-ฟรัม อ็อค-สเว็ง-เซ-ดัน-ทิล-เว็น-สเตอร์',
      pronunciationTip: 'sväng แปลว่า "เลี้ยว" ออกเสียง ส-ว ควบกันเป็น "สเว็ง"',
      svgScene: 'key',
      distractorsSv: ['Ta bussen som går till stationen', 'Affären ligger precis till höger', 'Det tar tio minuter att gå dit'],
      distractorsTh: ['ขึ้นรถเมล์สายที่ไปสถานี', 'ร้านค้าอยู่ทางขวามือพอดีเลย', 'ใช้เวลาเดินไปที่นั่นสิบนาที'],
      wordChunks: ['Gå', 'rakt', 'fram', 'och', 'sväng', 'sedan', 'till', 'vänster']
    },
    {
      id: 't8_sent_nar_gar_bussen',
      themeId: 'city_transport',
      type: 'sentence',
      sv: 'När går nästa buss till centrum?',
      th: 'รถเมล์คันต่อไปที่จะเข้าเมืองออกเมื่อไหร่คะ?',
      satunFlavor: 'รถเมล์เข้าเมืองคันหน้าจะมาตอนไหนจ๊ะ?',
      phoneticTh: 'แนร์-กอร์-แนส-ตะ-บุส-ทิล-เซ็น-ทรุม',
      pronunciationTip: 'ในภาษาสวีเดน รถเมล์และรถไฟใช้กริยา går (เดิน/ออกเดินทาง)',
      svgScene: 'cart',
      distractorsSv: ['Hur lång tid tar resan med tåg', 'Jag har redan köpt min biljett', 'Vi cyklar till parken när det är soligt'],
      distractorsTh: ['เดินทางด้วยรถไฟใช้เวลานานแค่ไหน', 'ฉันซื้อตั๋วของฉันเรียบร้อยแล้ว', 'เราปั่นจักรยานไปสวนตอนแดดออก'],
      wordChunks: ['När', 'går', 'nästa', 'buss', 'till', 'centrum']
    },
    {
      id: 't8_sent_kopa_biljett_app',
      themeId: 'city_transport',
      type: 'sentence',
      sv: 'Jag köper en biljett i telefonen',
      th: 'ฉันซื้อตั๋วเดินทางในโทรศัพท์มือถือ',
      satunFlavor: 'กดซื้อตั๋วในแอปมือถือเลย สะดวกจังฮู้!',
      phoneticTh: 'ย๊อก-เชอ-เพอร์-เอ็น-บิล-เย็ต-อี-เท-เล-โฟ-เน็น',
      pronunciationTip: 'k หน้าสระ ö ใน köper ออกเสียงเป็น ช.ช้าง นุ่มๆ ว่า "เชอ-เพอร์"',
      svgScene: 'phone',
      distractorsSv: ['Jag betalar med kort i butiken', 'Tåget kommer om fem minuter', 'Kan du visa mig på kartan'],
      distractorsTh: ['ฉันจ่ายด้วยบัตรในร้านค้า', 'รถไฟจะมาในอีกห้านาที', 'ช่วยชี้ให้ฉันดูบนแผนที่ได้ไหม'],
      wordChunks: ['Jag', 'köper', 'en', 'biljett', 'i', 'telefonen']
    },
    {
      id: 't8_sent_aka_tag_stockholm',
      themeId: 'city_transport',
      type: 'sentence',
      sv: 'Vi ska åka tåg till Stockholm imorgon',
      th: 'พรุ่งนี้เราจะนั่งรถไฟไปสตอกโฮล์มกัน',
      satunFlavor: 'ต่อเช้าเราจะนั่งรถไฟไปเที่ยวสตอกโฮล์มกันแล้ว ตื่นเต้นจังฮู้!',
      phoneticTh: 'วี-สกะ-อัว-กะ-ท็อก-ทิล-สต็อค-ฮอล์ม-อี-มอร์-รอน',
      pronunciationTip: 'Stockholm ออกเสียงว่า "สต็อค-ฮอล์ม" โดยตัว k ไม่ออกเสียงหนัก',
      svgScene: 'sparkles',
      distractorsSv: ['Igår gick vi en lång promenad', 'Bussen stannar precis utanför huset', 'Var ligger närmaste mataffär'],
      distractorsTh: ['เมื่อวานเราเดินเล่นกันไกลมาก', 'รถเมล์จอดหน้าบ้านพอดี', 'ร้านขายอาหารที่ใกล้ที่สุดอยู่ไหน'],
      wordChunks: ['Vi', 'ska', 'åka', 'tåg', 'till', 'Stockholm', 'imorgon']
    },

    /* ------------------------------------------------------------------------
       TEMA 9: SMÅPRAT & SFI-GRUNDER (บทสนทนาเบื้องต้น SFI)
       ------------------------------------------------------------------------ */
    {
      id: 't9_jag_heter',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Hej, jag heter Wilawan',
      th: 'สวัสดีค่ะ ฉันชื่อวิลาวรรณ',
      satunFlavor: 'หวัดดีจ้า ฉานชื่อวิลาวรรณนะจ๊ะ ยินดีที่ได้รู้จักจ้า!',
      phoneticTh: 'เฮย ย๊อก-เฮีย-เทอร์-วิ-ลา-วรรณ',
      pronunciationTip: 'heter แปลว่า "มีชื่อว่า" ลากเสียงพยางค์แรก "เฮีย-เทอร์"',
      svgScene: 'wave',
      distractorsSv: ['Hej, hur mår du idag', 'Jag bor i en lägenhet', 'Tack för senast kompis'],
      distractorsTh: ['สวัสดี วันนี้สบายดีไหม', 'ฉันอาศัยอยู่ในอพาร์ตเมนต์', 'ขอบคุณสำหรับครั้งก่อนนะเพื่อน'],
      wordChunks: ['Hej', 'jag', 'heter', 'Wilawan']
    },
    {
      id: 't9_kommer_fran_thailand',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Jag kommer från Thailand',
      th: 'ฉันมาจากประเทศไทย',
      satunFlavor: 'ฉานมาจากเมืองไทย เป็นคนปักษ์ใต้จังหวัดสตูลจ้า!',
      phoneticTh: 'ย๊อก-คอม-เมอร์-ฟรอน-ไทย-ลันด์',
      pronunciationTip: 'från ออกเสียง "ฟรอน" (สระ ออ) แปลว่า "จาก"',
      svgScene: 'heart',
      distractorsSv: ['Jag reser till Thailand snart', 'Jag älskar thailändsk mat', 'Min familj bor i Thailand'],
      distractorsTh: ['ฉันจะไปเที่ยวไทยเร็วๆ นี้', 'ฉันรักอาหารไทยมาก', 'ครอบครัวฉันอยู่ที่ไทย'],
      wordChunks: ['Jag', 'kommer', 'från', 'Thailand']
    },
    {
      id: 't9_fran_satun',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Jag kommer från Satun i södra Thailand',
      th: 'ฉันมาจากจังหวัดสตูล ทางภาคใต้ของประเทศไทย',
      satunFlavor: 'ฉานเป็นคนสตูล ปักษ์ใต้บ้านเรา ทะเลสวย น้ำใส อาหารหรอยจังฮู้!',
      phoneticTh: 'ย๊อก-คอม-เมอร์-ฟรอน-สะ-ตูล-อี-เซอ-ดระ-ไทย-ลันด์',
      pronunciationTip: 'södra แปลว่า "ทางตอนใต้" ห่อปากตรงเสียง ö ว่า "เซอ-ดระ"',
      svgScene: 'sun',
      distractorsSv: ['Jag bor i norra Sverige nu', 'Satun har många vackra öar', 'Det är varmt i Thailand året runt'],
      distractorsTh: ['ตอนนี้ฉันอยู่ทางเหนือของสวีเดน', 'สตูลมีเกาะสวยๆ มากมาย', 'เมืองไทยอากาศร้อนตลอดทั้งปี'],
      wordChunks: ['Jag', 'kommer', 'från', 'Satun', 'i', 'södra', 'Thailand']
    },
    {
      id: 't9_bor_i_sverige',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Nu bor jag i Sverige',
      th: 'ตอนนี้ฉันอาศัยอยู่ในประเทศสวีเดน',
      satunFlavor: 'ตอนนี้ย้ายมาอยู่สวีเดนแล้วจ้า',
      phoneticTh: 'นือ-บัวร์-ย๊อก-อี-สเวีย-ริ-เยะ',
      pronunciationTip: 'bor แปลว่า "อาศัยอยู่" ออกเสียงสระ อู/อัว ยาวว่า "บัวร์"',
      svgScene: 'home',
      distractorsSv: ['Jag vill åka till Sverige', 'Sverige är ett vackert land', 'Jag studerar på en skola'],
      distractorsTh: ['ฉันอยากไปประเทศสวีเดน', 'สวีเดนเป็นประเทศที่สวยงาม', 'ฉันเรียนอยู่ที่โรงเรียนแห่งหนึ่ง'],
      wordChunks: ['Nu', 'bor', 'jag', 'i', 'Sverige']
    },
    {
      id: 't9_tranar_svenska',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Jag tränar svenska varje dag',
      th: 'ฉันฝึกภาษาสวีเดนทุกวัน',
      satunFlavor: 'ฉานหัดแหลงสวีเดนทุกวันเลย เดี๋ยวก็เก่งแรง!',
      phoneticTh: 'ย๊อก-แทร-นาร์-สเวน-สกะ-วาร์-เยะ-ด๊อก',
      pronunciationTip: 'varje (ทุกๆ) ตัว j ออกเสียง ย.ยักษ์ อ่านว่า "วาร์-เยะ"',
      svgScene: 'star',
      distractorsSv: ['Jag pratar thailändska hemma', 'Svenska är roligt att lära sig', 'Vi läser en bok tillsammans'],
      distractorsTh: ['ฉันพูดภาษาไทยที่บ้าน', 'ภาษาสวีเดนเรียนสนุกมาก', 'เราอ่านหนังสือด้วยกัน'],
      wordChunks: ['Jag', 'tränar', 'svenska', 'varje', 'dag']
    },
    {
      id: 't9_prata_langsammare',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Kan du prata lite långsammare?',
      th: 'คุณช่วยพูดช้าลงหน่อยได้ไหมคะ?',
      satunFlavor: 'ช่วยแหลงช้าๆ หน่อยได้หม้ายจ๊ะ ฉานกำลังหัดฟังจ้า',
      phoneticTh: 'คาน-ดู-พรอ-ตะ-ลี-เตะ-ลอง-ซัม-มะ-เระ',
      pronunciationTip: 'ประโยคช่วยชีวิต! långsammare แปลว่า "ช้าลงอีกนิด" ออกเสียง "ลอง-ซัม-มะ-เระ"',
      svgScene: 'polite',
      distractorsSv: ['Kan du hjälpa mig med det här?', 'Vad heter det på svenska?', 'Kan du säga det en gång till?'],
      distractorsTh: ['ช่วยฉันเรื่องนี้หน่อยได้ไหม?', 'อันนี้ภาษาสวีเดนเรียกว่าอะไร?', 'ช่วยพูดอีกครั้งได้ไหมคะ?'],
      wordChunks: ['Kan', 'du', 'prata', 'lite', 'långsammare']
    },
    {
      id: 't9_jag_forstar',
      themeId: 'sfi_smalltalk',
      type: 'word',
      sv: 'Jag förstår',
      th: 'ฉันเข้าใจแล้ว',
      satunFlavor: 'อ๋อ เข้าใจแล้วจ้า! เก็ตเลย!',
      phoneticTh: 'ย๊อก-เฟอร์-สตอร์',
      pronunciationTip: 'เน้นเสียงยาวที่พยางค์หลัง "-สตอร์"',
      svgScene: 'happy',
      distractorsSv: ['Jag vet inte', 'Jag tror det', 'Jag kommer snart'],
      distractorsTh: ['ฉันไม่รู้', 'ฉันคิดว่างั้นนะ', 'เดี๋ยวฉันมาเร็วๆ นี้'],
      wordChunks: ['Jag', 'förstår']
    },
    {
      id: 't9_forstar_inte',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Jag förstår inte helt',
      th: 'ฉันยังไม่ค่อยเข้าใจทั้งหมด',
      satunFlavor: 'ฉานยังงงๆ อยู่อิดนึง อธิบายอีกทีได้หม้ายจ๊ะ',
      phoneticTh: 'ย๊อก-เฟอร์-สตอร์-อิน-เตะ-เฮลต์',
      pronunciationTip: 'วางคำว่า inte (ไม่) ไว้หลังกริยา förstår เสมอ',
      svgScene: 'polite',
      distractorsSv: ['Jag förstår precis allt', 'Det är väldigt lätt', 'Jag kan prata flytande'],
      distractorsTh: ['ฉันเข้าใจทุกอย่างชัดเจน', 'มันง่ายมากๆ เลย', 'ฉันพูดได้คล่องแคล่ว'],
      wordChunks: ['Jag', 'förstår', 'inte', 'helt']
    },
    {
      id: 't9_vad_betyder_det',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Vad betyder det här ordet?',
      th: 'คำนี้แปลว่าอะไรคะ?',
      satunFlavor: 'คำนี้แปลว่าไหรจ๊ะ? (เวลาเจอคำใหม่ในสวีเดน)',
      phoneticTh: 'วอด-เบ-ที-เดอร์-เด-แฮร์-อู-เด็ต',
      pronunciationTip: 'y ใน betyder ห่อปากกลมแล้วลากเสียงยาว "เบ-ที-เดอร์"',
      svgScene: 'sparkles',
      distractorsSv: ['Hur stavar man ditt namn?', 'Var ligger mitt klassrum?', 'När börjar lektionen idag?'],
      distractorsTh: ['ชื่อของคุณสะกดอย่างไร?', 'ห้องเรียนของฉันอยู่ไหน?', 'วันนี้บทเรียนเริ่มเมื่อไหร่?'],
      wordChunks: ['Vad', 'betyder', 'det', 'här', 'ordet']
    },
    {
      id: 't9_saga_igen',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Kan du säga det igen, tack?',
      th: 'ช่วยพูดซ้ำอีกครั้งได้ไหมคะ ขอบคุณค่ะ?',
      satunFlavor: 'แหลงอีกทีได้หม้ายจ๊ะ ขอฟังชัดๆ อีกรอบนะ',
      phoneticTh: 'คาน-ดู-เซ-ยะ-เด-อี-เย็น-ทัค',
      pronunciationTip: 'säga ออกเสียงว่า "เซ-ยะ" และ igen ออกเสียง ย.ยักษ์ ว่า "อี-เย็น"',
      svgScene: 'wave',
      distractorsSv: ['Kan jag få låna en penna?', 'Vi ses på skolan imorgon', 'Jag tycker om min lärare'],
      distractorsTh: ['ขอยืมปากกาหน่อยได้ไหม?', 'เจอกันที่โรงเรียนพรุ่งนี้', 'ฉันชอบคุณครูของฉัน'],
      wordChunks: ['Kan', 'du', 'säga', 'det', 'igen', 'tack']
    },
    {
      id: 't9_lar_mig_svenska',
      themeId: 'sfi_smalltalk',
      type: 'word',
      sv: 'Lära sig svenska',
      th: 'เรียนภาษาสวีเดน',
      satunFlavor: 'ตั้งใจเรียนสวีเดน เก่งขึ้นทุกวันแน่นอน',
      phoneticTh: 'แล-ระ-เซย์-สเวน-สกะ',
      pronunciationTip: 'sig ออกเสียงว่า "เซย์" เหมือนกับคำว่า mig (เมย์) และ dig (เดย์)',
      svgScene: 'star',
      distractorsSv: ['Titta på film', 'Lyssna på musik', 'Skriva ett brev'],
      distractorsTh: ['ดูภาพยนตร์', 'ฟังเพลง', 'เขียนจดหมาย'],
      wordChunks: ['Lära', 'sig', 'svenska']
    },
    {
      id: 't9_prata_lite_svenska',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Jag pratar lite svenska nu',
      th: 'ตอนนี้ฉันพูดภาษาสวีเดนได้นิดหน่อยแล้ว',
      satunFlavor: 'ตอนนี้แหลงสวีเดนได้อิดนึงแล้วนะจ๊ะ กำลังเก่งขึ้นเรื่อยๆ!',
      phoneticTh: 'ย๊อก-พรอ-ทาร์-ลี-เตะ-สเวน-สกะ-นือ',
      pronunciationTip: 'prata ลากเสียงพยางค์แรกกว้างๆ ว่า "พรอ-ทาร์"',
      svgScene: 'smile',
      distractorsSv: ['Jag kan inte engelska alls', 'Han pratar väldigt snabbt', 'Hon arbetar på ett sjukhus'],
      distractorsTh: ['ฉันพูดภาษาอังกฤษไม่ได้เลย', 'เขาพูดเร็วมากๆ', 'เธอทำงานอยู่ที่โรงพยาบาล'],
      wordChunks: ['Jag', 'pratar', 'lite', 'svenska', 'nu']
    },
    {
      id: 't9_vad_heter_du',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Vad heter du och var kommer du ifrån?',
      th: 'คุณชื่ออะไร และมาจากที่ไหนคะ?',
      satunFlavor: 'เธอชื่อไหร แล้วเป็นคนบ้านไหนจ๊ะ?',
      phoneticTh: 'วอด-เฮีย-เทอร์-ดู อ็อค-วอร์-คอม-เมอร์-ดู-อี-ฟรอน',
      pronunciationTip: 'เมื่อถามว่ามาจากไหน ให้ลงท้ายด้วย ifrån ("อี-ฟรอน")',
      svgScene: 'wave',
      distractorsSv: ['Hur länge har du bott här', 'Trivs du bra i Sverige', 'Vad brukar du göra på helgen'],
      distractorsTh: ['คุณอยู่ที่นี่มานานแค่ไหนแล้ว', 'คุณชอบอยู่สวีเดนไหม', 'สุดสัปดาห์คุณชอบทำอะไร'],
      wordChunks: ['Vad', 'heter', 'du', 'och', 'var', 'kommer', 'du', 'ifrån']
    },
    {
      id: 't9_trivs_i_sverige',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Jag trivs jättebra här i Sverige',
      th: 'ฉันมีความสุขและปรับตัวได้ดีมากที่นี่ในสวีเดน',
      satunFlavor: 'อยู่ที่สวีเดนบายใจจังฮู้ ชอบที่นี่มากเลยจ้า',
      phoneticTh: 'ย๊อก-ทริฟส์-เย็ต-เตะ-บรอ-แฮร์-อี-สเวีย-ริ-เยะ',
      pronunciationTip: 'trivs แปลว่า "อยู่แล้วสบายใจ/ชอบ" ออกเสียงว่า "ทริฟส์"',
      svgScene: 'heart',
      distractorsSv: ['Jag längtar hem till solen', 'Det är svårt att hitta vägen', 'Skolan ligger nära centrum'],
      distractorsTh: ['ฉันคิดถึงแสงแดดที่บ้าน', 'หาทางไปยากจังเลย', 'โรงเรียนอยู่ใกล้ใจกลางเมือง'],
      wordChunks: ['Jag', 'trivs', 'jättebra', 'här', 'i', 'Sverige']
    },
    {
      id: 't9_roligt_att_lara',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Det är roligt att lära sig nya ord',
      th: 'การได้เรียนรู้คำศัพท์ใหม่ๆ เป็นเรื่องสนุก',
      satunFlavor: 'ได้จำคำศัพท์ใหม่ๆ ทุกวัน หนุกจังฮู้!',
      phoneticTh: 'เด-แอร์-รู-ลิกต์-อัท-แล-ระ-เซย์-นี-ยะ-อูร์ด',
      pronunciationTip: 'o ใน roligt (สนุก) ออกเสียงสระ อู ยาวว่า "รู-ลิกต์" และ ord อ่านว่า "อูร์ด"',
      svgScene: 'sparkles',
      distractorsSv: ['Det är dags att ta en paus', 'Vi skriver på tavlan i skolan', 'Har du gjort din läxa idag'],
      distractorsTh: ['ได้เวลาพักเบรกแล้ว', 'เราเขียนบนกระดานที่โรงเรียน', 'วันนี้คุณทำการบ้านหรือยัง'],
      wordChunks: ['Det', 'är', 'roligt', 'att', 'lära', 'sig', 'nya', 'ord']
    },
    {
      id: 't9_tack_for_talamodet',
      themeId: 'sfi_smalltalk',
      type: 'sentence',
      sv: 'Tack för att du pratar långsamt med mig',
      th: 'ขอบคุณที่ช่วยพูดช้าๆ กับฉันนะคะ',
      satunFlavor: 'ขอบใจจังฮู้ที่ค่อยๆ แหลงช้าๆ กับฉานนะจ๊ะ น่ารักที่สุด!',
      phoneticTh: 'ทัค-เฟอร์-อัท-ดู-พรอ-ทาร์-ลอง-ซัมต์-เมด-เมย์',
      pronunciationTip: 'med mig ออกเสียงต่อเนื่องกันนุ่มๆ ว่า "เมด-เมย์" หรือ "เมะ-เมย์"',
      svgScene: 'heart_hands',
      distractorsSv: ['Ursäkta att jag kommer för sent', 'Kan vi träffas imorgon bitti', 'Jag förstår allt som du säger'],
      distractorsTh: ['ขอโทษที่มาสายนะคะ', 'เราเจอกันพรุ่งนี้เช้าได้ไหม', 'ฉันเข้าใจทุกอย่างที่คุณพูด'],
      wordChunks: ['Tack', 'för', 'att', 'du', 'pratar', 'långsamt', 'med', 'mig']
    },

    /* ------------------------------------------------------------------------
       TEMA 10: MENINGAR & DIALOGER I VERKLIGHETEN (ประโยคใช้จริงในชีวิตประจำวัน)
       ------------------------------------------------------------------------ */
    {
      id: 't10_hur_var_din_dag',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Hej älskling, hur var din dag idag?',
      th: 'สวัสดีที่รัก วันนี้วันของคุณเป็นยังไงบ้าง?',
      satunFlavor: 'หวัดดีจ้าที่รัก วันนี้เป็นพันพรือบ้าง เหนื่อยหม้าย?',
      phoneticTh: 'เฮย-เอล-สกลิง ฮูร์-วอ-ดิน-ด๊อก-อี-ด๊อก',
      pronunciationTip: 'var เป็นรูปอดีตของ är ใช้ถามถึงวันที่ผ่านมาแล้วในตอนเย็น',
      svgScene: 'heart',
      distractorsSv: ['God morgon, har du sovit gott', 'Ska vi åka och handla mat nu', 'Vad vill du äta till middag'],
      distractorsTh: ['อรุณสวัสดิ์ เมื่อคืนหลับสบายไหม', 'เราไปซื้อของกินกันตอนนี้ไหม', 'มื้อเย็นคุณอยากกินอะไร'],
      wordChunks: ['Hej', 'älskling', 'hur', 'var', 'din', 'dag', 'idag']
    },
    {
      id: 't10_svar_bra_dag',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Min dag var jättebra, men jag är lite hungrig nu',
      th: 'วันของฉันดีมากเลย แต่ตอนนี้ฉันหิวนิดหน่อยแล้ว',
      satunFlavor: 'วันนี้ดีจังฮู้ แต่ตอนนี้เริ่มเนือยข้าวแล้วจ้า หาไหรกินกันต๊ะ!',
      phoneticTh: 'มิน-ด๊อก-วอ-เย็ต-เตะ-บรอ เม็น-ย๊อก-แอร์-ลี-เตะ-ฮุง-ริก-นือ',
      pronunciationTip: 'men แปลว่า "แต่" ออกเสียงสั้นๆ ว่า "เม็น"',
      svgScene: 'yummy',
      distractorsSv: ['Jag har varit hemma hela dagen', 'Det regnade när jag gick till bussen', 'Vi ses efter jobbet klockan fem'],
      distractorsTh: ['ฉันอยู่บ้านมาทั้งวันเลย', 'ฝนตกตอนฉันเดินไปป้ายรถเมล์', 'เจอกันหลังเลิกงานตอนห้าโมง'],
      wordChunks: ['Min', 'dag', 'var', 'jättebra', 'men', 'jag', 'är', 'lite', 'hungrig', 'nu']
    },
    {
      id: 't10_laga_middag_tillsammans',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Ska vi laga middag tillsammans i köket?',
      th: 'เราไปทำอาหารเย็นด้วยกันในห้องครัวไหม?',
      satunFlavor: 'เข้าครัวไปทำกับข้าวเย็นด้วยกันต๊ะ ช่วยกันทำหนุกดี!',
      phoneticTh: 'สกะ-วี-ลอ-กะ-มิด-ด๊อก-ทิล-ซัม-มันส์-อี-เชอ-เค็ต',
      pronunciationTip: 'tillsammans แปลว่า "ด้วยกัน" ออกเสียงว่า "ทิล-ซัม-มันส์"',
      svgScene: 'fish',
      distractorsSv: ['Ska vi beställa mat från restaurangen', 'Frukosten står redan på bordet', 'Jag diskar efter att vi har ätit'],
      distractorsTh: ['เราสั่งอาหารจากร้านมากินไหม', 'มื้อเช้าวางอยู่บนโต๊ะเรียบร้อยแล้ว', 'เดี๋ยวฉันล้างจานหลังจากเรากินเสร็จ'],
      wordChunks: ['Ska', 'vi', 'laga', 'middag', 'tillsammans', 'i', 'köket']
    },
    {
      id: 't10_ja_gärna_kyckling_ris',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Ja gärna, vi kan laga kyckling och ris',
      th: 'เอาสิด้วยความยินดีเลย เราทำไก่กับข้าวสวยกันได้นะ',
      satunFlavor: 'เอาสิจ๊ะ! ทำไก่ผัดกับข้าวสวยร้อนๆ หรอยจังฮู้แน่นอน',
      phoneticTh: 'ยา-แยร์-นะ วี-คาน-ลอ-กะ-ชึค-คลิง-อ็อค-รีส',
      pronunciationTip: 'gärna (ด้วยความเต็มใจ/เอาสิ!) ตัว g ออกเสียง ย.ยักษ์ อ่านว่า "แยร์-นะ"',
      svgScene: 'yummy',
      distractorsSv: ['Nej tack jag är redan mätt', 'Vi behöver köpa mer mjölk först', 'Jag vill hellre äta soppa idag'],
      distractorsTh: ['ไม่ล่ะขอบคุณ ฉันอิ่มแล้ว', 'เราต้องไปซื้อนมเพิ่มก่อน', 'วันนี้ฉันอยากกินซุปมากกว่า'],
      wordChunks: ['Ja', 'gärna', 'vi', 'kan', 'laga', 'kyckling', 'och', 'ris']
    },
    {
      id: 't10_pa_kafe_bestalla',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Hej, jag vill beställa en kaffe och en kanelbulle',
      th: 'สวัสดีค่ะ ฉันขอสั่งกาแฟหนึ่งถ้วยและซินนามอนโรลหนึ่งชิ้นค่ะ',
      satunFlavor: 'หวัดดีจ้า ขอสั่งโกปี๊ถ้วยนึงกับหนมปังอบเชยชิ้นนึงนะจ๊ะ',
      phoneticTh: 'เฮย ย๊อก-วิล-เบ-สเตล-ละ-เอ็น-คัฟ-เฟะ-อ็อค-เอ็น-คะ-เนล-บุล-เละ',
      pronunciationTip: 'beställa แปลว่า "สั่ง (อาหาร/ของ)" เน้นเสียงที่พยางค์กลาง "-สเตล-"',
      svgScene: 'coffee',
      distractorsSv: ['Ursäkta, har ni öppet nu på morgonen', 'Kan jag få betala för kaffet här', 'Det här kaféet är väldigt mysigt'],
      distractorsTh: ['ขอโทษค่ะ ตอนเช้านี้ร้านเปิดไหมคะ', 'ขอจ่ายค่ากาแฟตรงนี้ได้ไหมคะ', 'คาเฟ่แห่งนี้อบอุ่นน่านั่งมาก'],
      wordChunks: ['Hej', 'jag', 'vill', 'beställa', 'en', 'kaffe', 'och', 'en', 'kanelbulle']
    },
    {
      id: 't10_ata_har_eller_ta_med',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Vill du äta här eller ta med?',
      th: 'คุณจะทานที่นี่หรือรับกลับบ้านคะ?',
      satunFlavor: 'นั่งกินที่ร้านหรือใส่ถุงกลับเรือนจ๊ะ? (พนักงานคาเฟ่ถามทุกครั้ง!)',
      phoneticTh: 'วิล-ดู-แอ-ตะ-แฮร์-เอล-เลอร์-ทา-เมด',
      pronunciationTip: 'eller แปลว่า "หรือ" และ ta med แปลว่า "สั่งกลับบ้าน (Take away)"',
      svgScene: 'bun',
      distractorsSv: ['Vill du ha mjölk i ditt kaffe', 'Det blir sextio kronor tack', 'Varsågod här är ditt kvitto'],
      distractorsTh: ['รับนมใส่ในกาแฟด้วยไหมคะ', 'ทั้งหมดหกสิบโครนค่ะ ขอบคุณค่ะ', 'เชิญค่ะ นี่ใบเสร็จของคุณ'],
      wordChunks: ['Vill', 'du', 'äta', 'här', 'eller', 'ta', 'med']
    },
    {
      id: 't10_vi_ater_har',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Vi äter här, tack så mycket',
      th: 'เราทานที่นี่ค่ะ ขอบคุณมาก',
      satunFlavor: 'นั่งกินที่ร้านนี่แหละจ้า ขอบคุณมากนะจ๊ะ',
      phoneticTh: 'วี-แอ-เทอร์-แฮร์ ทัค-ซัว-มึค-เค็ต',
      pronunciationTip: 'äter เป็นรูปปัจจุบันของ äta ออกเสียงลากสระ แอ ยาวว่า "แอ-เทอร์"',
      svgScene: 'smile',
      distractorsSv: ['Jag tar med det hem idag', 'Kan vi sitta ute i solen', 'Vi vill ha två koppar te'],
      distractorsTh: ['วันนี้ฉันขอรับกลับบ้านค่ะ', 'เรานั่งข้างนอกรับแดดได้ไหม', 'เราขอชาสองถ้วยค่ะ'],
      wordChunks: ['Vi', 'äter', 'här', 'tack', 'så', 'mycket']
    },
    {
      id: 't10_promenad_i_solen',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Ska vi gå ut på en promenad i solen?',
      th: 'เราออกไปเดินเล่นรับแสงแดดข้างนอกกันไหม?',
      satunFlavor: 'ออกไปเดินเล่นตากแดดอุ่นๆ ข้างนอกกันต๊ะ บายตัวดี!',
      phoneticTh: 'สกะ-วี-กัว-อูท-พัว-เอ็น-พรู-เม-น๊อด-อี-ซู-เล็น',
      pronunciationTip: 'promenad (การเดินเล่น) เน้นเสียงพยางค์ท้ายยาวว่า "พรู-เม-น๊อด"',
      svgScene: 'sun',
      distractorsSv: ['Ska vi stanna hemma och titta på film', 'Det är för kallt för att gå ut nu', 'Jag måste handla mat innan vi går'],
      distractorsTh: ['เราอยู่บ้านดูหนังกันไหม', 'ตอนนี้หนาวเกินกว่าจะออกไปข้างนอก', 'ฉันต้องซื้อของกินก่อนที่เราจะไป'],
      wordChunks: ['Ska', 'vi', 'gå', 'ut', 'på', 'en', 'promenad', 'i', 'solen']
    },
    {
      id: 't10_boka_tid',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Vilken tid ska vi träffas imorgon?',
      th: 'พรุ่งนี้เราจะนัดเจอกันกี่โมงดี?',
      satunFlavor: 'ต่อเช้าเรานัดเจอกันกี่โมงดีจ๊ะ?',
      phoneticTh: 'วิล-เค็น-ทีด-สกะ-วี-เทร็ฟ-ฟัส-อี-มอร์-รอน',
      pronunciationTip: 'träffas แปลว่า "พบกัน/เจอกัน" ออกเสียงสั้นตรง "เทร็ฟ-ฟัส"',
      svgScene: 'sparkles',
      distractorsSv: ['Var ska vi ses på lördag', 'Kommer du ihåg vad han heter', 'Jag ringer dig när jag är framme'],
      distractorsTh: ['วันเสาร์เราจะเจอกันที่ไหน', 'คุณจำได้ไหมว่าเขาชื่ออะไร', 'ฉันจะโทรหาคุณเมื่อไปถึงนะ'],
      wordChunks: ['Vilken', 'tid', 'ska', 'vi', 'träffas', 'imorgon']
    },
    {
      id: 't10_passar_klockan_tio',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Passar det bra klockan tio på förmiddagen?',
      th: 'ตอนสิบโมงเช้าสะดวกไหมคะ?',
      satunFlavor: 'สิบโมงเช้าสะดวกหม้ายจ๊ะ? กำลังดีเลยเนอะ',
      phoneticTh: 'พัส-ซาร์-เด-บรอ-คล็อค-กัน-ที-ยุ-พัว-เฟอร์-มิด-ดอ-เก็น',
      pronunciationTip: 'passar det bra แปลว่า "เวลานั้นเหมาะ/สะดวกสำหรับคุณไหม" สุภาพและใช้บ่อยมาก',
      svgScene: 'sunrise',
      distractorsSv: ['Klockan två på eftermiddagen är bättre', 'Jag slutar skolan klockan tolv idag', 'Vi kan ta tåget som går klockan nio'],
      distractorsTh: ['บ่ายสองโมงดีกว่านะ', 'วันนี้ฉันเลิกเรียนตอนเที่ยง', 'เราขึ้นรถไฟขบวนเก้าโมงเช้าได้'],
      wordChunks: ['Passar', 'det', 'bra', 'klockan', 'tio', 'på', 'förmiddagen']
    },
    {
      id: 't10_ringa_familjen',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Jag ska ringa min familj i Satun ikväll',
      th: 'คืนนี้ฉันจะโทรศัพท์หาครอบครัวที่สตูล',
      satunFlavor: 'ค่ำนี้จะโทรไปแหลงกับคนที่เรือนที่สตูลให้หายคิดถึงจ้า',
      phoneticTh: 'ย๊อก-สกะ-ริง-อะ-มิน-ฟา-มิลย์-อี-สะ-ตูล-อี-คเวล',
      pronunciationTip: 'ringa (โทรศัพท์หา) ออกเสียง ง.งู กลางคำว่า "ริง-อะ"',
      svgScene: 'phone',
      distractorsSv: ['Min familj kommer och hälsar på snart', 'Jag skickar bilder på snön i Sverige', 'Vi pratar med varandra varje söndag'],
      distractorsTh: ['ครอบครัวฉันจะมาเยี่ยมเร็วๆ นี้', 'ฉันส่งรูปหิมะในสวีเดนไปให้ดู', 'เราคุยกันทุกๆ วันอาทิตย์'],
      wordChunks: ['Jag', 'ska', 'ringa', 'min', 'familj', 'i', 'Satun', 'ikväll']
    },
    {
      id: 't10_hitta_till_affaren',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Affären ligger rakt fram och sedan till höger',
      th: 'ร้านค้าอยู่ตรงไปข้างหน้าแล้วเลี้ยวขวาค่ะ',
      satunFlavor: 'ร้านอยู่ตรงไปข้างหน้า แล้วเลี้ยวขวานิดเดียวก็ถึงแล้วจ้า',
      phoneticTh: 'อัฟ-แฟ-เร็น-ลิก-เกอร์-รัคต์-ฟรัม-อ็อค-เซ-ดัน-ทิล-เฮอ-เกอร์',
      pronunciationTip: 'affären ลากเสียงสระ แอ ยาวตรงกลางคำว่า "อัฟ-แฟ-เร็น"',
      svgScene: 'cart',
      distractorsSv: ['Stationen ligger bakom det stora huset', 'Det är bara fem minuter att gå dit', 'Ta bussen och gå av vid nästa hållplats'],
      distractorsTh: ['สถานีอยู่ด้านหลังตึกใหญ่หลังนั้น', 'เดินไปที่นั่นแค่ห้านาทีเอง', 'ขึ้นรถเมล์แล้วลงป้ายหน้านะ'],
      wordChunks: ['Affären', 'ligger', 'rakt', 'fram', 'och', 'sedan', 'till', 'höger']
    },
    {
      id: 't10_sov_gott_dröm_sött',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'God natt älskling, sov så gott så ses vi imorgon',
      th: 'ราตรีสวัสดิ์ที่รัก นอนหลับฝันดีแล้วพรุ่งนี้เจอกันนะ',
      satunFlavor: 'ฝันดีนะจ๊ะที่รัก นอนหลับให้บาย ต่อเช้าตื่นมาเจอกันจ้า!',
      phoneticTh: 'กูด-นัท-เอล-สกลิง ซอฟ-ซัว-ก็อต-ซัว-เซส-วี-อี-มอร์-รอน',
      pronunciationTip: 'sov så gott แปลว่า "นอนหลับให้สบายนะ" เป็นคำอวยพรก่อนนอนที่อบอุ่นมาก',
      svgScene: 'sleep',
      distractorsSv: ['God morgon älskling kaffet är klart', 'Tack för en fantastisk dag tillsammans', 'Jag älskar dig mer och mer varje dag'],
      distractorsTh: ['อรุณสวัสดิ์ที่รัก กาแฟพร้อมแล้ว', 'ขอบคุณสำหรับวันที่วิเศษด้วยกันนะ', 'ฉันรักคุณมากขึ้นทุกๆ วันเลย'],
      wordChunks: ['God', 'natt', 'älskling', 'sov', 'så', 'gott', 'så', 'ses', 'vi', 'imorgon']
    },
    {
      id: 't10_hjalpa_mig_hitta',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Ursäkta, kan du hjälpa mig att hitta till tåget?',
      th: 'ขอโทษนะคะ ช่วยบอกทางไปขึ้นรถไฟให้ฉันหน่อยได้ไหมคะ?',
      satunFlavor: 'ขอโทษนะจ๊ะ ช่วยชี้ทางไปขึ้นรถไฟให้ฉานหน่อยได้หม้ายจ๊ะ?',
      phoneticTh: 'อูร์-เช็ค-ตะ คาน-ดู-เยล-พะ-เมย์-อัท-ฮิท-ตะ-ทิล-ทอ-เก็ต',
      pronunciationTip: 'hjälpa ออกเสียง ย.ยักษ์ นำหน้าว่า "เยล-พะ" และ hitta แปลว่า "หาเจอ"',
      svgScene: 'polite',
      distractorsSv: ['Ursäkta vet du vad klockan är nu', 'Kan jag betala min biljett med kort', 'När kommer tåget från Stockholm in'],
      distractorsTh: ['ขอโทษค่ะ รู้ไหมว่าตอนนี้กี่โมงแล้ว', 'ฉันจ่ายค่าตั๋วด้วยบัตรได้ไหม', 'รถไฟจากสตอกโฮล์มจะเข้ากี่โมง'],
      wordChunks: ['Ursäkta', 'kan', 'du', 'hjälpa', 'mig', 'att', 'hitta', 'till', 'tåget']
    },
    {
      id: 't10_jag_fryser_idag',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Det är kallt ute idag, så vi dricker varmt te hemma',
      th: 'วันนี้ข้างนอกหนาว เราเลยดื่มชาร้อนๆ อยู่ที่บ้านกัน',
      satunFlavor: 'ข้างนอกหนาวแรง วันนี้อยู่เรือนจิบชาร้อนๆ ให้บายตัวดีกว่าเนอะ',
      phoneticTh: 'เด-แอร์-คัลต์-อู-เตะ-อี-ด๊อก ซัว-วี-ดริค-เคอร์-วารม์ต-เทีย-เฮ็ม-มะ',
      pronunciationTip: 'คำว่า te (น้ำชา) ลากเสียงยาวคล้าย "เทีย"',
      svgScene: 'coffee',
      distractorsSv: ['Solen skiner så vi äter glass i parken', 'Jag tar på mig min varma vinterjacka', 'Vi handlar frukt och grönsaker på vägen hem'],
      distractorsTh: ['แดดออกเราเลยกินไอศกรีมในสวน', 'ฉันสวมเสื้อแจ็คเก็ตหน้าหนาวตัวอุ่น', 'เราแวะซื้อผักผลไม้ระหว่างทางกลับบ้าน'],
      wordChunks: ['Det', 'är', 'kallt', 'ute', 'idag', 'så', 'vi', 'dricker', 'varmt', 'te', 'hemma']
    },
    {
      id: 't10_stolt_over_mig',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Jag är glad att jag lär mig mer svenska varje dag',
      th: 'ฉันดีใจที่ได้เรียนรู้ภาษาสวีเดนเพิ่มขึ้นทุกวัน',
      satunFlavor: 'ดีใจจังฮู้ที่แหลงสวีเดนได้เยอะขึ้นทุกวัน เก่งขึ้นเรื่อยๆ แล้วเรา!',
      phoneticTh: 'ย๊อก-แอร์-กลอด-อัท-ย๊อก-แลร์-เมย์-เมียร์-สเวน-สกะ-วาร์-เยะ-ด๊อก',
      pronunciationTip: 'mer แปลว่า "มากขึ้น" ลากเสียงสระ เอ กึ่ง เอีย ว่า "เมียร์"',
      svgScene: 'star',
      distractorsSv: ['Snart kan jag prata svenska med alla', 'Min lärare säger att jag har bra uttal', 'Vi övar tillsammans hemma varje kväll'],
      distractorsTh: ['อีกไม่นานฉันจะพูดสวีเดนกับทุกคนได้', 'ครูบอกว่าฉันออกเสียงได้ดีมาก', 'เราฝึกซ้อมด้วยกันที่บ้านทุกเย็น'],
      wordChunks: ['Jag', 'är', 'glad', 'att', 'jag', 'lär', 'mig', 'mer', 'svenska', 'varje', 'dag']
    },

    /* ------------------------------------------------------------------------
       SVENSKA KULTURBEGREPP & VARDAGSLIV (18 ESSENTIELLA BEGREPP FÖR LIVET I SVERIGE)
       ------------------------------------------------------------------------ */
    {
      id: 'begrepp_fika',
      themeId: 'fika_food',
      type: 'concept',
      sv: 'En fika',
      th: 'การพักดื่มกาแฟกับขนมและพูดคุย (ฟีก้า)',
      satunFlavor: 'เหมือนคนใต้แหลงน้ำชา กินโรตีหัวเช้า-หัวค่ำ หรอยแรง!',
      phoneticTh: 'เอน-ฟี-ก่า',
      pronunciationTip: 'fika เป็นทั้งคำนามและคำกริยา เน้นเสียงสระอีคำว่า "ฟี-" ให้ชัดเจน',
      svgScene: 'coffee',
      distractorsSv: ['En middag', 'En frukost', 'En efterrätt'],
      distractorsTh: ['อาหารเย็น', 'อาหารเช้า', 'ของหวานหลังอาหาร'],
      wordChunks: ['En', 'fika']
    },
    {
      id: 'begrepp_patar',
      themeId: 'fika_food',
      type: 'concept',
      sv: 'Påtår ingår',
      th: 'เติมกาแฟแก้วที่สองฟรี (ไม่มีค่าใช้จ่ายเพิ่ม)',
      satunFlavor: 'เติมโกปี๊แก้วสองฟรีบายใจ คนชอบกินกาแฟหรอยจังฮู้!',
      phoneticTh: 'พัว-ทัวร์ อิง-กัวร์',
      pronunciationTip: 'påtår อ่านว่า "พัว-ทัวร์" สระ å ออกเสียงคล้ายสระอัวกึ่งโอ',
      svgScene: 'coffee',
      distractorsSv: ['Kaffet kostar extra', 'Bara en kopp per person', 'Vattnet är gratis'],
      distractorsTh: ['กาแฟต้องจ่ายเงินเพิ่ม', 'ได้แค่คนละหนึ่งแก้ว', 'น้ำเปล่าฟรี'],
      wordChunks: ['Påtår', 'ingår']
    },
    {
      id: 'begrepp_lagom',
      themeId: 'everyday',
      type: 'concept',
      sv: 'Lagom',
      th: 'พอดีๆ ไม่มากและไม่น้อยเกินไป (ปรัชญาความพอดีแบบสวีเดน)',
      satunFlavor: 'พอดีๆ ไม่เว่อร์ อยู่ตรงกลางสบายใจเฉิบ',
      phoneticTh: 'ลา-กอม',
      pronunciationTip: 'lagom ออกเสียงสระอาลากยาวคำว่า "ลา-" แล้วปิดด้วย "-กอม"',
      svgScene: 'smile',
      distractorsSv: ['Alldeles för mycket', 'Alldeles för lite', 'Jättemycket'],
      distractorsTh: ['มากจนเกินไป', 'น้อยจนเกินไป', 'เยอะมากๆ'],
      wordChunks: ['Lagom']
    },
    {
      id: 'begrepp_allemansratten',
      themeId: 'weather_time',
      type: 'concept',
      sv: 'Allemansrätten',
      th: 'สิทธิของทุกคนในการเดินเที่ยวและเก็บเห็ดเบอร์รี่ในป่าเสรี',
      satunFlavor: 'เดินป่าเก็บบลูเบอร์รี่เห็ดป่าได้บายใจ แต่ห้ามทำลายธรรมชาตินะ!',
      phoneticTh: 'อัล-เลอะ-มันส์-แร็ท-เต็น',
      pronunciationTip: 'คำว่า rätt ออกเสียง ร.เรือ ชัดและกระดกลิ้นเบาๆ แปลว่า สิทธิ',
      svgScene: 'sun',
      distractorsSv: ['Förbud att gå i skogen', 'Privat mark får ej beträdas', 'Jaktlicens krävs'],
      distractorsTh: ['ห้ามเดินเข้าป่า', 'ที่ดินส่วนบุคคลห้ามเข้า', 'ต้องมีใบอนุญาตล่าสัตว์'],
      wordChunks: ['Allemansrätten']
    },
    {
      id: 'begrepp_sambo',
      themeId: 'family_love',
      type: 'concept',
      sv: 'En sambo',
      th: 'คู่รัก/แฟนที่อาศัยอยู่กินด้วยกันในบ้านเดียวกัน',
      satunFlavor: 'คู่อยู่กินกินนอนเรือนเดียวกัน แฟนกันบายใจ มีกฎหมายคุ้มครองด้วย',
      phoneticTh: 'เอน-ซัม-บู',
      pronunciationTip: 'sambo ย่อมาจาก "sammanboende" สระ o ออกเสียงเป็นสระอู',
      svgScene: 'heart',
      distractorsSv: ['En granne', 'En kollega', 'En hyresvärd'],
      distractorsTh: ['เพื่อนบ้าน', 'เพื่อนร่วมงาน', 'เจ้าของบ้านเช่า'],
      wordChunks: ['En', 'sambo']
    },
    {
      id: 'begrepp_fredagsmys',
      themeId: 'family_love',
      type: 'concept',
      sv: 'Fredagsmys',
      th: 'การพักผ่อนวันศุกร์เย็น กินทาโก้/ขนม ดูหนังกับครอบครัว',
      satunFlavor: 'คืนวันศุกร์นั่งแหลงกินของหรอยดูหนังกับแฟน สบายใจจังฮู้!',
      phoneticTh: 'เฟร-ดักส์-มีส',
      pronunciationTip: 'mys ออกเสียงสระ y ด้วยการห่อปากกลมๆ เหมือนเป่าเทียน',
      svgScene: 'happy',
      distractorsSv: ['Måndagsmöte', 'Städdag', 'Träningspass'],
      distractorsTh: ['การประชุมวันจันทร์', 'วันทำความสะอาดใหญ่', 'เวลาออกกำลังกาย'],
      wordChunks: ['Fredagsmys']
    },
    {
      id: 'begrepp_swish',
      themeId: 'shopping_numbers',
      type: 'concept',
      sv: 'Att swisha',
      th: 'การโอนเงินผ่านเบอร์มือถือทันที (แอป Swish)',
      satunFlavor: 'โอนเงินเข้ามือถือจึ๊กเดียว เหมือนพร้อมเพย์บ้านเราเลย!',
      phoneticTh: 'อัท-สวิช-ชา',
      pronunciationTip: 'swisha เป็นกริยาแปลว่า "โอนเงินผ่าน Swish"',
      svgScene: 'phone',
      distractorsSv: ['Att betala kontant', 'Att skicka brev', 'Att ringa samtal'],
      distractorsTh: ['จ่ายด้วยเงินสด', 'ส่งจดหมาย', 'โทรศัพท์คุย'],
      wordChunks: ['Att', 'swisha']
    },
    {
      id: 'begrepp_personnummer',
      themeId: 'shopping_numbers',
      type: 'concept',
      sv: 'Personnummer',
      th: 'เลขประจำตัวประชาชนสวีเดน (ปี-เดือน-วัน-xxxx)',
      satunFlavor: 'เลขบัตรประชาชนสำคัญสุดๆ ต้องจำให้แม่นถ้าอยู่สวีเดน!',
      phoneticTh: 'แปร์-ซูน-นุม-แมร์',
      pronunciationTip: 'personnummer ประกอบด้วยวันเกิด 6 หรือ 8 หลัก ตามด้วยเลขสุ่ม 4 หลัก',
      svgScene: 'card',
      distractorsSv: ['Telefonnummer', 'Postnummer', 'Husnummer'],
      distractorsTh: ['เบอร์โทรศัพท์', 'รหัสไปรษณีย์', 'บ้านเลขที่'],
      wordChunks: ['Personnummer']
    },
    {
      id: 'begrepp_bankid',
      themeId: 'shopping_numbers',
      type: 'concept',
      sv: 'Mobilt BankID',
      th: 'แอปยืนยันตัวตนดิจิทัลบนมือถือ (บัตรประชาชนดิจิทัล)',
      satunFlavor: 'แอปยืนยันตัวตนในมือถือ ใช้เปิดบัญชี เข้าระบบหมอ ทำธุรกรรมทุกอย่าง',
      phoneticTh: 'มู-บีลท์ บังก์-อี-เด',
      pronunciationTip: 'ID ออกเสียงทีละตัวอักษรว่า "อี-เด"',
      svgScene: 'phone',
      distractorsSv: ['Kreditkort', 'Papperskvitto', 'Passfoto'],
      distractorsTh: ['บัตรเครดิต', 'ใบเสร็จกระดาษ', 'รูปถ่ายพาสปอร์ต'],
      wordChunks: ['Mobilt', 'BankID']
    },
    {
      id: 'begrepp_tvattstuga',
      themeId: 'everyday',
      type: 'concept',
      sv: 'Tvättstuga',
      th: 'ห้องซักผ้ารวมของอพาร์ตเมนต์ (ต้องจองคิวและทำความสะอาด)',
      satunFlavor: 'ห้องซักผ้าตึก รวมซักอบแห้ง ซักเสร็จเช็ดฝุ่นเก็บกวาดให้เรียบร้อย!',
      phoneticTh: 'ทแว็ตต์-สตู-กา',
      pronunciationTip: 'tvätta แปลว่า "ซักผ้า" stuga แปลว่า "เรือน/ห้อง"',
      svgScene: 'home',
      distractorsSv: ['Vardagsrum', 'Balkong', 'Kök'],
      distractorsTh: ['ห้องนั่งเล่น', 'ระเบียง', 'ห้องครัว'],
      wordChunks: ['Tvättstuga']
    },
    {
      id: 'begrepp_vab',
      themeId: 'everyday',
      type: 'concept',
      sv: 'Att vabba',
      th: 'การลางานหยุดอยู่บ้านดูแลลูกที่ป่วย โดยได้เงินชดเชยจากรัฐ',
      satunFlavor: 'หยุดงานอยู่เรือนเลี้ยงลูกไข้ ได้เงินชดเชยจากรัฐด้วย ดีจังฮู้!',
      phoneticTh: 'อัท-วับ-บา',
      pronunciationTip: 'VAB ย่อมาจาก Vård Av Barn (การดูแลเด็กป่วย)',
      svgScene: 'happy',
      distractorsSv: ['Att jobba övertid', 'Att åka på semester', 'Att studera på universitet'],
      distractorsTh: ['ทำงานล่วงเวลา', 'ไปเที่ยวพักผ่อน', 'เรียนต่อมหาวิทยาลัย'],
      wordChunks: ['Att', 'vabba']
    },
    {
      id: 'begrepp_pant',
      themeId: 'supermarket',
      type: 'concept',
      sv: 'Att panta',
      th: 'การนำขวดและกระป๋องไปหยอดตู้รีไซเคิลเพื่อรับเงินคืน',
      satunFlavor: 'เอาขวดเปล่าไปหยอดตู้คืนตังค์ในห้าง ได้เงินซื้อกับข้าวต่อ!',
      phoneticTh: 'อัท-พัน-ตะ',
      pronunciationTip: 'pant ออกเสียง พ.พาน กึ่ง ป.ปลา สระอัน แปลว่า มัดจำคืนเงิน',
      svgScene: 'cart',
      distractorsSv: ['Att kasta i soporna', 'Att köpa nya kläder', 'Att betala skatt'],
      distractorsTh: ['ทิ้งลงถังขยะธรรมดา', 'ซื้อเสื้อผ้าใหม่', 'จ่ายภาษี'],
      wordChunks: ['Att', 'panta']
    },
    {
      id: 'begrepp_tack_for_maten',
      themeId: 'greetings',
      type: 'concept',
      sv: 'Tack för maten',
      th: 'ขอบคุณสำหรับอาหาร (มารยาทสำคัญที่พูดทุกครั้งหลังกินเสร็จ)',
      satunFlavor: 'กินอิ่มแล้วบอกขอบคุณคนทำกับข้าว หรอยแรงขอบคุณจ้า!',
      phoneticTh: 'ทัค-เฟอร์-มา-เทน',
      pronunciationTip: 'för maten ออกเสียงสระเออคำว่า "เฟอร์" และ "มา-เทน"',
      svgScene: 'heart_hands',
      distractorsSv: ['God natt', 'Välkommen in', 'Hur mår du'],
      distractorsTh: ['ราตรีสวัสดิ์', 'ยินดีต้อนรับ', 'คุณสบายดีไหม'],
      wordChunks: ['Tack', 'för', 'maten']
    },
    {
      id: 'begrepp_systembolaget',
      themeId: 'city_transport',
      type: 'concept',
      sv: 'Systembolaget',
      th: 'ร้านขายเครื่องดื่มแอลกอฮอล์แห่งเดียวของรัฐบาลสวีเดน',
      satunFlavor: 'ร้านขายไวน์ของรัฐบาล ต้องอายุ 20 ปีขึ้นไปและพกบัตรประชาชนทุกคน!',
      phoneticTh: 'ซิส-เตม-บู-ลา-เก็ต',
      pronunciationTip: 'คนสวีเดนมักเรียกสั้นๆ ในภาษาพูดว่า "Systemet"',
      svgScene: 'cart',
      distractorsSv: ['Apoteket', 'Biblioteket', 'Sjukhuset'],
      distractorsTh: ['ร้านขายยา', 'ห้องสมุด', 'โรงพยาบาล'],
      wordChunks: ['Systembolaget']
    },
    {
      id: 'begrepp_friskvard',
      themeId: 'sfi_smalltalk',
      type: 'concept',
      sv: 'Friskvårdsbidrag',
      th: 'เงินสวัสดิการส่งเสริมสุขภาพและออกกำลังกายจากที่ทำงาน',
      satunFlavor: 'เงินช่วยค่าออกกำลังกาย เข้ายิม นวดตัว สบายใจเฉิบ!',
      phoneticTh: 'ฟริสก์-วอร์ดส์-บี-ดร็อก',
      pronunciationTip: 'frisk แปลว่า "สุขภาพดี/สดชื่น" vård แปลว่า "การดูแล"',
      svgScene: 'happy',
      distractorsSv: ['Parkeringsböter', 'Elräkning', 'Tågbiljett'],
      distractorsTh: ['ใบสั่งที่จอดรถ', 'บิลค่าไฟฟ้า', 'ตั๋วรถไฟ'],
      wordChunks: ['Friskvårdsbidrag']
    },
    {
      id: 'begrepp_kallsortering',
      themeId: 'everyday',
      type: 'concept',
      sv: 'Källsortering',
      th: 'การคัดแยกขยะในครัวเรือน (พลาสติก กระดาษ แก้ว เศษอาหาร)',
      satunFlavor: 'แยกขยะลงถังให้ถูกสี บ้านเมืองสะอาดสะอ้าน น่าอยู่จังฮู้!',
      phoneticTh: 'แช็ลล์-ซอร์-เท-ริง',
      pronunciationTip: 'käll ออกเสียง ช.ช้าง นุ่มๆ ว่า "แช็ลล์"',
      svgScene: 'home',
      distractorsSv: ['Gå på restaurang', 'Köpa ny bil', 'Måla väggarna'],
      distractorsTh: ['ไปกินข้าวนอกบ้าน', 'ซื้อรถใหม่', 'ทาสีผนังห้อง'],
      wordChunks: ['Källsortering']
    },
    {
      id: 'begrepp_lordagsgodis',
      themeId: 'fika_food',
      type: 'concept',
      sv: 'Lördagsgodis',
      th: 'ประเพณีกินขนมหวานและลูกอมเฉพาะวันเสาร์',
      satunFlavor: 'วันเสาร์พาเด็กๆ ไปตักลูกอมหวานๆ หรอยถูกใจ!',
      phoneticTh: 'เลอร์-ดักส์-กู-ดิส',
      pronunciationTip: 'lördag (วันเสาร์) + godis (ขนมหวาน/ลูกอม)',
      svgScene: 'happy',
      distractorsSv: ['Tandläkarbesök', 'Morgongympa', 'Skolprov'],
      distractorsTh: ['ไปหาหมอฟัน', 'กายบริหารตอนเช้า', 'สอบที่โรงเรียน'],
      wordChunks: ['Lördagsgodis']
    },
    {
      id: 'begrepp_sjukanmalan',
      themeId: 'sfi_smalltalk',
      type: 'concept',
      sv: 'Sjukanmälan',
      th: 'การโทร/ส่งข้อความแจ้งลาป่วยกับที่ทำงานตั้งแต่ช่วงเช้า',
      satunFlavor: 'โทรบอกหัวหน้าแต่หัวเช้าว่าไม่บาย มาทำงานไม่ได้นะจ๊ะ',
      phoneticTh: 'ชู-คาน-แม-ลัน',
      pronunciationTip: 'sjuk ออกเสียง ช.ช้าง นุ่ม ลากเสียงยาว แปลว่า ป่วย',
      svgScene: 'phone',
      distractorsSv: ['Semesteransökan', 'Löneförhandling', 'Arbetsintervju'],
      distractorsTh: ['ขอลาพักร้อน', 'เจรจาขอขึ้นเงินเดือน', 'สัมภาษณ์งาน'],
      wordChunks: ['Sjukanmälan']
    },

    /* ------------------------------------------------------------------------
       PRAKTISKA VARDAGSDIALOGER (VERKLIGA SITUATIONER I SVERIGE)
       ------------------------------------------------------------------------ */
    {
      id: 'dialog_apotek',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Hej, kan jag få hämta ut min medicin här?',
      th: 'สวัสดีค่ะ ฉันมารับยาตามใบสั่งแพทย์ที่นี่ได้ไหมคะ?',
      satunFlavor: 'หวัดดีจ้า ฉันมารับยาที่คุณหมอสั่งไว้ มารับตรงนี้ได้หม้ายจ๊ะ?',
      phoneticTh: 'เฮย คาน-ย๊อก-ฟัว-แฮม-ตะ-อูท-มีน-เม-ดี-ซีน-แฮร์',
      pronunciationTip: 'medicin ออกเสียงเน้นพยางค์สุดท้ายว่า "เม-ดี-ซีน"',
      svgScene: 'polite',
      distractorsSv: ['Jag vill köpa en bussbiljett', 'Kan jag boka tvättstugan här', 'Vad kostar en kanelbulle'],
      distractorsTh: ['ฉันอยากซื้อตั๋วรถเมล์', 'ฉันจองห้องซักผ้าที่นี่ได้ไหม', 'ขนมปังอบชินนามอนราคาเท่าไร'],
      wordChunks: ['Hej', 'kan', 'jag', 'få', 'hämta', 'ut', 'min', 'medicin', 'här']
    },
    {
      id: 'dialog_ica_kassa',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Vill du ha kvittot? Nej tack, det är bra så',
      th: 'รับใบเสร็จไหมคะ? ไม่เป็นไรค่ะ ขอบคุณค่ะ',
      satunFlavor: 'รับใบเสร็จหม้ายจ๊ะ? ไม่เอาขอบคุณจ้า แค่นี้บายใจแล้ว!',
      phoneticTh: 'วิล-ดู-ฮา-ควิท-ตุต เนย์-ทัค เด-แอร์-บรอ-ซัว',
      pronunciationTip: 'kvittot (ใบเสร็จ) ออกเสียง ควิด-ตุต และ "det är bra så" แปลว่า พอแล้วค่ะ/ไม่เป็นไรค่ะ',
      svgScene: 'cart',
      distractorsSv: ['Jag vill betala kontant med mynt', 'Var ligger närmaste toalett', 'Jag glömde mina nycklar hemma'],
      distractorsTh: ['ฉันอยากจ่ายเงินสดด้วยเหรียญ', 'ห้องน้ำที่ใกล้ที่สุดอยู่ตรงไหน', 'ฉันลืมกุญแจไว้ที่บ้าน'],
      wordChunks: ['Vill', 'du', 'ha', 'kvittot', 'Nej', 'tack', 'det', 'är', 'bra', 'så']
    },
    {
      id: 'dialog_swish_nota',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Det kostar hundra kronor, jag swishar dig direkt',
      th: 'ราคาร้อยโครน เดี๋ยวฉันโอนสวิชให้เธอทันทีเลยนะ',
      satunFlavor: 'ร้อยโครนนะจ๊ะ เดี๋ยวฉานกดโอนสวิชเข้ามือถือให้เดี๋ยวนี้เลย!',
      phoneticTh: 'เด-คอส-ตาร์-ฮุน-ดระ-ครู-นัวร์ ย๊อก-สวิช-ชาร์-เดย์-ดี-เร็กต์',
      pronunciationTip: 'hundra = หนึ่งร้อย, direkt = ทันทีทันใด',
      svgScene: 'phone',
      distractorsSv: ['Jag har inga pengar på kortet', 'Vi måste gå till banken imorgon', 'Kan jag låna din cykel ikväll'],
      distractorsTh: ['ฉันไม่มีเงินในบัตร', 'เราต้องไปธนาคารพรุ่งนี้', 'ฉันขอยืมจักรยานเธอคืนนี้ได้ไหม'],
      wordChunks: ['Det', 'kostar', 'hundra', 'kronor', 'jag', 'swishar', 'dig', 'direkt']
    },
    {
      id: 'dialog_sambo_middag',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Älskling, vad vill du äta till middag ikväll?',
      th: 'ที่รัก คืนนี้เธออยากกินอะไรเป็นอาหารเย็นจ๊ะ?',
      satunFlavor: 'สุดที่รัก คืนนี้อยากกินกับข้าวไหรดีจ๊ะ ฉานทำให้หรอยๆ เลย!',
      phoneticTh: 'เอลส์-คลิง วอด-วิล-ดู-แอ-ตะ-ทิล-มิด-ด็อก-อี-คแว็ลล์',
      pronunciationTip: 'älskling (ที่รัก) คำหวานที่คนรักในสวีเดนใช้เรียกกันบ่อยที่สุด',
      svgScene: 'heart',
      distractorsSv: ['Tåget går klockan åtta på morgonen', 'Det snöar mycket ute i trädgården', 'Jag måste tvätta kläderna nu'],
      distractorsTh: ['รถไฟออกตอนแปดโมงเช้า', 'ข้างนอกในสวนหิมะตกหนักมาก', 'ฉันต้องไปซักผ้าเดี๋ยวนี้'],
      wordChunks: ['Älskling', 'vad', 'vill', 'du', 'äta', 'till', 'middag', 'ikväll']
    },
    {
      id: 'dialog_fika_jobb',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Ska vi ta en fika tillsammans och prata lite?',
      th: 'พวกเราไปพักจิบกาแฟและคุยกันสักหน่อยไหมคะ?',
      satunFlavor: 'ไปจิบน้ำชาโกปี๊แหลงกันสักหีดหม้ายจ๊ะ คลายเครียดบายใจ!',
      phoneticTh: 'สกะ-วี-ทา-เอน-ฟี-ก่า-ทิล-ซัม-มันส์-อ็อค-พรอ-ตะ-ลี-เตะ',
      pronunciationTip: 'tillsammans (ด้วยกัน) เน้นเสียงพยางค์กลางว่า "ทิล-ซัม-มันส์"',
      svgScene: 'coffee',
      distractorsSv: ['Jag är mycket trött och vill sova', 'Var är mina glasögon och min plånbok', 'Bussen är sen tio minuter idag'],
      distractorsTh: ['ฉันเหนื่อยมากและอยากนอนหลับ', 'แว่นตากับกระเป๋าตังค์ฉันอยู่ไหน', 'วันนี้รถเมล์มาช้าไปสิบนาที'],
      wordChunks: ['Ska', 'vi', 'ta', 'en', 'fika', 'tillsammans', 'och', 'prata', 'lite']
    },
    {
      id: 'dialog_tvatt_tid',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Ursäkta, har du tvättid nu eller är maskinen ledig?',
      th: 'ขอโทษนะคะ ตอนนี้คุณมีคิวซักผ้าอยู่หรือว่าเครื่องว่างคะ?',
      satunFlavor: 'ขอโทษนะจ๊ะ ตอนนี้ถึงคิวซักผ้าของเธอหรือว่าเครื่องว่างอยู่จ๊ะ?',
      phoneticTh: 'อูร์-เช็ค-ตะ ฮาร์-ดู-ทแว็ตต์-ทีด-นู แอล-แลร์-มา-ชี-เนน-เลีย-ดิก',
      pronunciationTip: 'ledig ออกเสียงว่า "เลีย-ดิก" แปลว่า ว่าง หรือ วันหยุด',
      svgScene: 'home',
      distractorsSv: ['Jag ska köpa kaffe i affären', 'Solen skiner varmt på himlen', 'Kan du skicka mig ett sms'],
      distractorsTh: ['ฉันจะไปซื้อกาแฟที่ร้าน', 'แดดส่องอบอุ่นบนท้องฟ้า', 'ช่วยส่งข้อความ sms ให้ฉันได้ไหม'],
      wordChunks: ['Ursäkta', 'har', 'du', 'tvättid', 'nu', 'eller', 'är', 'maskinen', 'ledig']
    },
    {
      id: 'dialog_vardcentral',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Hej, jag vill boka en tid hos doktorn',
      th: 'สวัสดีค่ะ ฉันต้องการจองคิวนัดตรวจกับคุณหมอค่ะ',
      satunFlavor: 'หวัดดีจ้า ฉันอยากจองคิวนัดหาหมอ ตัวร้อนไม่ค่อยบายจ้า',
      phoneticTh: 'เฮย ย๊อก-วิล-บู-คะ-เอน-ทีด-ฮูส-ด๊อค-ตอร์น',
      pronunciationTip: 'doktorn ออกเสียงสระโอว่า "ด๊อค-ตอร์น" แปลว่า คุณหมอ',
      svgScene: 'polite',
      distractorsSv: ['Jag letar efter en bra restaurang', 'Hur mycket kostar en biobiljett', 'Bussen stannar vid stationen'],
      distractorsTh: ['ฉันกำลังมองหาร้านอาหารอร่อยๆ', 'ตั๋วหนังราคาเท่าไรคะ', 'รถเมล์จอดที่สถานี'],
      wordChunks: ['Hej', 'jag', 'vill', 'boka', 'en', 'tid', 'hos', 'doktorn']
    },
    {
      id: 'dialog_panta_kvitto',
      themeId: 'real_dialogs',
      type: 'sentence',
      sv: 'Tryck på den gröna knappen för att få pantkvittot',
      th: 'กดปุ่มสีเขียวเพื่อรับใบเสร็จเงินคืนค่าขวดนะคะ',
      satunFlavor: 'กดปุ่มเขียวตรงนี้เลยจ้า แล้วตู้จะปริ้นท์สลิปเงินคืนออกมาให้!',
      phoneticTh: 'ทริค-พัว-เด็น-เกรือ-นะ-คナップ-เป็น เฟอร์-อัท-ฟัว-พานท์-ควิท-ตุต',
      pronunciationTip: 'grön = สีเขียว, knapp = ปุ่มกด, kvitto = ใบเสร็จ',
      svgScene: 'cart',
      distractorsSv: ['Det snöar mycket ute på vägen', 'Jag vill betala med kontanter här', 'Tåget har redan åkt från perrongen'],
      distractorsTh: ['หิมะตกหนักมากบนถนนข้างนอก', 'ฉันอยากจ่ายด้วยเงินสดตรงนี้', 'รถไฟออกจากชานชาลาไปแล้ว'],
      wordChunks: ['Tryck', 'på', 'den', 'gröna', 'knappen', 'för', 'att', 'få', 'pantkvittot']
    }
  ];

  /* ==========================================================================
     3. NORMALISERA FÄLT FÖR FULL BAKÅT- OCH FRAMÅTKOMPATIBILITET
     ========================================================================== */

  const SCENE_EMOJI_MAP = {
    wave: '👋',
    heart_hands: '🙏',
    polite: '🙋‍♀️',
    smile: '😊',
    sunrise: '🌅',
    sparkles: '✨',
    sleep: '🛌',
    heart: '❤️',
    home: '🏡',
    happy: '🥰',
    sun: '☀️',
    yummy: '😋',
    family: '👨‍👩‍👧',
    star: '🌟',
    water: '💧',
    cart: '🛒',
    bun: '🥐',
    fish: '🐟',
    tag: '🏷️',
    coin: '🪙',
    card: '💳',
    coffee: '☕',
    key: '🔑',
    snow: '❄️',
    rain: '🌧️',
    phone: '📱'
  };

  function normalizeItemSchema(raw) {
    const wordChunks = raw.wordChunks || raw.tokens || raw.sv.replace(/[.,!?]/g, '').split(/\s+/);
    const svgScene = raw.svgScene || raw.svgKey || 'star';
    const satunFlavor = raw.satunFlavor || raw.satun || '';
    const phoneticTh = raw.phoneticTh || raw.phonetic || '';

    return {
      ...raw,
      satunFlavor,
      satun: satunFlavor,
      phoneticTh,
      phonetic: phoneticTh,
      pronunciationTip:
        raw.pronunciationTip ||
        'ค่อยๆ ออกเสียงตามคำอ่านไทยช้าๆ ชัดๆ โดยเน้นพยางค์แรกของคำนะคะ',
      svgScene,
      svgKey: svgScene,
      emoji: raw.emoji || SCENE_EMOJI_MAP[svgScene] || '✨',
      wordChunks,
      tokens: wordChunks,
      distractorsSv: raw.distractorsSv || ['Tack så mycket', 'Vi ses imorgon', 'Det är bra'],
      distractorsTh: raw.distractorsTh || ['ขอบคุณมาก', 'เจอกันพรุ่งนี้', 'สบายดีค่ะ']
    };
  }

  const NORMALIZED_DATABASE = RAW_DATABASE_ITEMS.map(normalizeItemSchema);

  /* ==========================================================================
     4. DYNAMISK SENTENCECOMBINER (Genererar 500+ nya övningsmeningar!)
     Så att frågorna och meningsbyggar-övningarna aldrig tar slut.
     ========================================================================== */

  const SentenceCombiner = {
    // Byggstenar för dynamiska svenska meningar
    subjects: [
      { sv: 'Jag', th: 'ฉัน', satun: 'ฉาน', phon: 'ย๊อก' },
      { sv: 'Vi', th: 'พวกเรา', satun: 'เราสองคน', phon: 'วี' },
      { sv: 'Du och jag', th: 'คุณและฉัน', satun: 'เธอกับฉาน', phon: 'ดู-อ็อค-ย๊อก' }
    ],

    foodActions: [
      { sv: 'vill äta', th: 'อยากกิน', satun: 'อยากกิน', phon: 'วิล-แอ-ตะ' },
      { sv: 'ska köpa', th: 'จะไปซื้อ', satun: 'จะไปหาซื้อ', phon: 'สกะ-เชอ-พะ' },
      { sv: 'tycker om', th: 'ชอบ', satun: 'ชอบจังฮู้', phon: 'ทึค-เคอร์-ออม' }
    ],

    foodObjects: [
      { sv: 'varmt kaffe och kanelbulle', th: 'กาแฟร้อนและซินนามอนโรล', satun: 'โกปี๊ร้อนๆ กับหนมปังอบเชย', phon: 'วารม์ต-คัฟ-เฟะ-อ็อค-คะ-เนล-บุล-เละ', scene: 'coffee', themeId: 'fika_food' },
      { sv: 'kyckling och ris', th: 'ไก่และข้าวสวย', satun: 'ไก่กับข้าวสวยร้อนๆ', phon: 'ชึค-คลิง-อ็อค-รีส', scene: 'fish', themeId: 'fika_food' },
      { sv: 'färskt bröd och mjölk', th: 'ขนมปังสดใหม่และนม', satun: 'หนมปังหอมๆ กับนมสด', phon: 'แฟร์สกต์-เบริด-อ็อค-มเยิ้ลก์', scene: 'cart', themeId: 'supermarket' },
      { sv: 'frukt och grönsaker', th: 'ผลไม้และผักสด', satun: 'ลูกไม้กับผักสดๆ', phon: 'ฟรุคต์-อ็อค-เกริน-ซอ-เคอร์', scene: 'cart', themeId: 'supermarket' },
      { sv: 'ägg och kallt vatten', th: 'ไข่และน้ำเย็น', satun: 'ไข่ไก่กับน้ำเย็นชื่นใจ', phon: 'เอ็กก์-อ็อค-คัลต์-วัท-เท็น', scene: 'water', themeId: 'supermarket' }
    ],

    timeExpressions: [
      { sv: 'idag', th: 'วันนี้', satun: 'วันนี้เลย', phon: 'อี-ด๊อก' },
      { sv: 'imorgon', th: 'พรุ่งนี้', satun: 'ต่อเช้า', phon: 'อี-มอร์-รอน' },
      { sv: 'ikväll', th: 'เย็นนี้', satun: 'ค่ำนี้', phon: 'อี-คเวล' },
      { sv: 'i helgen', th: 'สุดสัปดาห์นี้', satun: 'เสาร์อาทิตย์นี้', phon: 'อี-เฮล-เย็น' }
    ],

    placesAndActivities: [
      { sv: 'stanna hemma i lägenheten', th: 'อยู่บ้านในอพาร์ตเมนต์', satun: 'อยู่เรือนพักผ่อนบายๆ', phon: 'สตัน-นะ-เฮ็ม-มะ-อี-แล-เก็น-เฮีย-เท็น', scene: 'home', themeId: 'everyday' },
      { sv: 'åka buss till centrum', th: 'นั่งรถเมล์เข้าใจกลางเมือง', satun: 'นั่งรถเมล์ไปเที่ยวในเมือง', phon: 'อัว-กะ-บุส-ทิล-เซ็น-ทรุม', scene: 'cart', themeId: 'city_transport' },
      { sv: 'åka tåg till stationen', th: 'นั่งรถไฟไปที่สถานี', satun: 'นั่งรถไฟไปสถานี', phon: 'อัว-กะ-ท็อก-ทิล-สตะ-ชู-เน็น', scene: 'sparkles', themeId: 'city_transport' },
      { sv: 'träna svenska tillsammans', th: 'ฝึกภาษาสวีเดนด้วยกัน', satun: 'หัดแหลงสวีเดนด้วยกัน', phon: 'แทร-นะ-สเวน-สกะ-ทิล-ซัม-มันส์', scene: 'star', themeId: 'sfi_smalltalk' },
      { sv: 'gå på en promenad i solen', th: 'ไปเดินเล่นท่ามกลางแสงแดด', satun: 'ไปเดินเล่นรับแดดอุ่นๆ', phon: 'กัว-พัว-เอ็น-พรู-เม-น๊อด-อี-ซู-เล็น', scene: 'sun', themeId: 'weather_time' },
      { sv: 'städa köket och sovrummet', th: 'ทำความสะอาดห้องครัวและห้องนอน', satun: 'จัดห้องครัวกับห้องนอนให้สะอาด', phon: 'สแต-ดะ-เชอ-เค็ต-อ็อค-ซอฟ-รุม-เม็ต', scene: 'home', themeId: 'everyday' }
    ],

    feelingsTemplates: [
      { sv: 'Jag är så glad och lycklig', th: 'ฉันดีใจและมีความสุขมาก', satun: 'ฉานดีใจและบายใจจังฮู้', phon: 'ย๊อก-แอร์-ซัว-กลอด-อ็อค-ลึค-คลิก', scene: 'happy', themeId: 'family_love' },
      { sv: 'Jag älskar dig och saknar dig', th: 'ฉันรักคุณและคิดถึงคุณ', satun: 'รักและคิดถึงเธอนะจ๊ะ รักจังฮู้', phon: 'ย๊อก-เอล-สการ์-เดย์-อ็อค-ซัค-นาร์-เดย์', scene: 'heart', themeId: 'family_love' },
      { sv: 'Det är mysigt att fika med dig', th: 'อบอุ่นใจจังที่ได้นั่งฟีก้ากับคุณ', satun: 'นั่งจิบโกปี๊กับเธอแล้วบายใจจังฮู้', phon: 'เด-แอร์-มี-ซิกต์-อัท-ฟี-กะ-เมด-เดย์', scene: 'coffee', themeId: 'real_dialogs' }
    ],

    /**
     * Genererar en dynamisk mening för valt tema (eller valfritt tema)
     */
    generateDynamicSentence(preferredThemeId = null) {
      const sub = this._pick(this.subjects);
      const time = this._pick(this.timeExpressions);

      // Välj mall baserat på tema
      if (
        preferredThemeId === 'fika_food' ||
        preferredThemeId === 'supermarket' ||
        (!preferredThemeId && Math.random() < 0.45)
      ) {
        const act = this._pick(this.foodActions);
        const objPool = preferredThemeId
          ? this.foodObjects.filter((o) => o.themeId === preferredThemeId)
          : this.foodObjects;
        const obj = this._pick(objPool.length ? objPool : this.foodObjects);

        const sv = `${sub.sv} ${act.sv} ${obj.sv} ${time.sv}`;
        const th = `${sub.th}${act.th}${obj.th}${time.th}`;
        const satun = `${sub.satun}${act.satun}${obj.satun} (${time.satun}) หรอยจังฮู้!`;
        const phon = `${sub.phon}-${act.phon}-${obj.phon}-${time.phon}`;

        return normalizeItemSchema({
          id: `dyn_food_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          themeId: obj.themeId,
          type: 'sentence',
          sv,
          th,
          satunFlavor: satun,
          phoneticTh: phon,
          pronunciationTip: 'ออกเสียงเชื่อมคำกริยากับกรรมให้ลื่นไหล แล้วลงเสียงเวลาท้ายประโยคเบาๆ',
          svgScene: obj.scene,
          distractorsSv: [
            'Jag vill sova hela dagen idag',
            'Solen skiner och det är varmt ute',
            'Ursäkta var ligger närmaste station'
          ],
          distractorsTh: [
            'วันนี้ฉันอยากนอนทั้งวันเลย',
            'แดดออกและข้างนอกอากาศอบอุ่น',
            'ขอโทษค่ะ สถานีที่ใกล้ที่สุดอยู่ไหน'
          ],
          wordChunks: sv.split(' ')
        });
      }

      if (preferredThemeId === 'family_love') {
        const feel = this._pick(this.feelingsTemplates);
        const sv = `${feel.sv} ${time.sv}`;
        return normalizeItemSchema({
          id: `dyn_feel_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          themeId: 'family_love',
          type: 'sentence',
          sv,
          th: `${feel.th}${time.th}`,
          satunFlavor: `${feel.satun} (${time.satun})`,
          phoneticTh: `${feel.phon}-${time.phon}`,
          pronunciationTip: 'พูดด้วยน้ำเสียงอบอุ่น ลากเสียงพยางค์เน้นให้นุ่มนวล',
          svgScene: feel.scene,
          distractorsSv: [
            'Det kostar tjugo kronor i butiken',
            'Vi tar bussen klockan åtta imorse',
            'Glöm inte att ta med ditt paraply'
          ],
          distractorsTh: [
            'อันนี้ราคายี่สิบโครนในร้านค้า',
            'เราขึ้นรถเมล์ตอนแปดโมงเมื่อเช้า',
            'อย่าลืมพกร่มของคุณไปด้วยนะ'
          ],
          wordChunks: sv.split(' ')
        });
      }

      // Aktiviteter, hem, transport, väder & SFI
      const actPool = preferredThemeId
        ? this.placesAndActivities.filter((p) => p.themeId === preferredThemeId)
        : this.placesAndActivities;
      const act = this._pick(actPool.length ? actPool : this.placesAndActivities);

      const sv = `${sub.sv} ska ${act.sv} ${time.sv}`;
      const th = `${sub.th}จะ${act.th}${time.th}`;
      const satun = `${sub.satun}จะ${act.satun} (${time.satun}) จ้า!`;
      const phon = `${sub.phon}-สกะ-${act.phon}-${time.phon}`;

      return normalizeItemSchema({
        id: `dyn_act_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        themeId: act.themeId || preferredThemeId || 'real_dialogs',
        type: 'sentence',
        sv,
        th,
        satunFlavor: satun,
        phoneticTh: phon,
        pronunciationTip: 'ska ตามด้วยคำกริยาช่องเดิมเสมอ ใช้บอกแผนการที่จะทำ',
        svgScene: act.scene,
        distractorsSv: [
          'Tack så mycket för den goda maten',
          'Vad kostar mjölken och brödet här',
          'Klockan är redan nio på kvällen'
        ],
        distractorsTh: [
          'ขอบคุณมากสำหรับอาหารแสนอร่อย',
          'นมและขนมปังที่นี่ราคาเท่าไหร่',
          'ตอนนี้เวลาสามทุ่มแล้ว'
        ],
        wordChunks: sv.split(' ')
      });
    },

    /**
     * Genererar en batch av N unika kombinationsmeningar
     */
    generateBatch(count = 10, themeId = null) {
      const seen = new Set();
      const result = [];
      let safety = 0;
      while (result.length < count && safety < count * 6) {
        safety++;
        const item = this.generateDynamicSentence(themeId);
        if (!seen.has(item.sv)) {
          seen.add(item.sv);
          result.push(item);
        }
      }
      return result;
    },

    _pick(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  };

  /* ==========================================================================
     5. UPPGRADERA window.ContentDB & KOPPLA FRÅGEGENERATORN
     ========================================================================== */

  window.ContentDB = Object.assign(window.ContentDB || {}, {
    _themes: [...THEMES_10],
    _items: [...NORMALIZED_DATABASE],
    SentenceCombiner,

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

    /**
     * Hämtar både fasta poster och nygenererade kombinationsmeningar för oändlig variation
     */
    getInfinitePracticePool(themeId = 'all', extraGeneratedCount = 3) {
      const base = this.getItemsByTheme(themeId);
      const dynamicSentences = SentenceCombiner.generateBatch(
        extraGeneratedCount,
        themeId === 'all' ? null : themeId
      );
      // Registrera de dynamiska meningarna i sessionen så att getItemById hittar dem
      this.registerItems(dynamicSentences);
      return [...base, ...dynamicSentences];
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
        const norm = normalizeItemSchema(ni);
        const idx = this._items.findIndex((i) => i.id === norm.id);
        if (idx >= 0) this._items[idx] = norm;
        else this._items.push(norm);
      });
    }
  });

  /* ==========================================================================
     6. INTEGRERA PEDAGOGISKA DISTRAKTORER, WORDCHUNKS & UTTALSTIPS I MOTORN
     ========================================================================== */

  function connectDatabaseToEngine() {
    const ge = window.GameEngine;
    if (!ge) return;

    // 1. Säkerställ att alla 10 teman finns i användarens state
    if (ge.StateManager?.state) {
      const st = ge.StateManager.state;
      THEMES_10.forEach((t) => {
        if (!st.unlockedThemes.includes(t.id)) {
          st.unlockedThemes.push(t.id);
        }
        if (st.themeStars[t.id] === undefined) {
          st.themeStars[t.id] = 0;
        }
      });
      ge.StateManager.save();
    }

    // 2. Uppgradera QuestionGenerator så den använder distractorsSv, distractorsTh, wordChunks & SentenceCombiner
    if (ge.QuestionGenerator && ge.SRSManager) {
      const qGen = ge.QuestionGenerator;
      const srs = ge.SRSManager;

      // Använd postens skräddarsydda distractorsSv & distractorsTh när bild/ljud-frågor skapas
      qGen.createImageChoiceQuestion = function (targetItem, allItems) {
        let distractors = [];
        if (Array.isArray(targetItem.distractorsSv) && targetItem.distractorsSv.length >= 3) {
          distractors = targetItem.distractorsSv.slice(0, 3).map((dSv, idx) => {
            const existing = allItems.find(
              (it) => it.sv.toLowerCase() === dSv.toLowerCase() && it.id !== targetItem.id
            );
            if (existing) return existing;
            return {
              id: `dist_${targetItem.id}_${idx}`,
              sv: dSv,
              th: targetItem.distractorsTh?.[idx] || '',
              phonetic: targetItem.distractorsTh?.[idx] || dSv,
              emoji: ['✨', '🌿', '⭐'][idx % 3]
            };
          });
        } else {
          distractors = srs
            ._shuffle(allItems.filter((i) => i.id !== targetItem.id))
            .slice(0, 3);
        }

        return {
          type: 'image_choice',
          typeLabel: '🖼️ Bild & Ljud • รูปภาพและเสียง',
          promptSv: 'Välj rätt svenskt uttryck',
          promptTh: 'เลือกคำหรือประโยคภาษาสวีเดนที่ตรงกับความหมาย',
          targetItem,
          options: srs._shuffle([targetItem, ...distractors])
        };
      };

      // Använd distractorsTh vid Lyssna & Förstå
      qGen.createListenUnderstandQuestion = function (targetItem, allItems) {
        let distractors = [];
        if (Array.isArray(targetItem.distractorsTh) && targetItem.distractorsTh.length >= 3) {
          distractors = targetItem.distractorsTh.slice(0, 3).map((dTh, idx) => {
            const existing = allItems.find(
              (it) => it.th === dTh && it.id !== targetItem.id
            );
            if (existing) return existing;
            return {
              id: `dist_th_${targetItem.id}_${idx}`,
              sv: targetItem.distractorsSv?.[idx] || '',
              th: dTh,
              satun: targetItem.distractorsSv?.[idx] ? `(${targetItem.distractorsSv[idx]})` : 'ตัวเลือกหลอก',
              emoji: ['💬', '🌸', '🍀'][idx % 3]
            };
          });
        } else {
          distractors = srs
            ._shuffle(allItems.filter((i) => i.id !== targetItem.id))
            .slice(0, 3);
        }

        return {
          type: 'listen_understand',
          typeLabel: '🎧 Lyssna & Förstå • ฟังเสียงสวีเดน',
          promptSv: 'Lyssna och välj rätt betydelse',
          promptTh: 'กดฟังเสียงปกติ (🔊 0.95x) หรือเสียงเต่าช้าๆ (🐢 0.60x) แล้วเลือกคำแปลที่ถูกต้อง',
          targetItem,
          options: srs._shuffle([targetItem, ...distractors])
        };
      };

      // Använd wordChunks + förvillande ord från distractorsSv i Bygg meningen
      qGen.createSentenceBuilderQuestion = function (targetItem) {
        const correctTokens =
          targetItem.wordChunks && targetItem.wordChunks.length > 0
            ? [...targetItem.wordChunks]
            : targetItem.sv.replace(/[.,!?]/g, '').split(/\s+/);

        const distractorWords = (targetItem.distractorsSv || [])
          .join(' ')
          .replace(/[.,!?]/g, '')
          .split(/\s+/)
          .filter((w) => w && !correctTokens.includes(w));

        const extraPool = distractorWords.length >= 2 ? distractorWords.slice(0, 3) : ['inte', 'idag', 'också'];
        const bankTokens = srs._shuffle([...correctTokens, ...extraPool]).map((word, index) => ({
          id: `tok_${index}_${word}`,
          word
        }));

        return {
          type: 'sentence_builder',
          typeLabel: '🧩 Bygg meningen • เรียงประโยค',
          promptSv: 'Bygg meningen på svenska',
          promptTh: 'แตะลูกโป่งคำศัพท์เพื่อเรียงเป็นประโยคภาษาสวีเดนที่ถูกต้อง',
          targetItem,
          correctTokens,
          bankTokens
        };
      };

      // Injicera även 1 nygenererad kombinationsmening från SentenceCombiner i varje 'mix' och 'sentences'-lektion!
      const origBuildQueue = qGen.buildLessonQueue.bind(qGen);
      qGen.buildLessonQueue = function (themeId, mode = 'mix') {
        const queue = origBuildQueue(themeId, mode);
        if (mode === 'mix' || mode === 'sentences') {
          const dynamicSent = SentenceCombiner.generateDynamicSentence(
            themeId === 'all' ? null : themeId
          );
          window.ContentDB.registerItems([dynamicSent]);
          const dynQ = this.createSentenceBuilderQuestion(dynamicSent);
          dynQ.typeLabel = '✨ Dynamisk Mening (i+1) • ประโยคฝึกสมอง';
          // Lägg in före sista övningen (t.ex. före Matching Sprint)
          if (queue.length > 1) {
            queue.splice(queue.length - 1, 0, dynQ);
          } else {
            queue.push(dynQ);
          }
        }
        return queue;
      };
    }

    // 3. Koppla postens specifika pronunciationTip till SpeechEngine PhoneticEvaluator
    if (window.SpeechEngine?.PhoneticEvaluator) {
      const pe = window.SpeechEngine.PhoneticEvaluator;
      const origGetMouthGuide = pe.getMouthGuideForTarget.bind(pe);
      pe.getMouthGuideForTarget = function (targetItem) {
        const baseGuide = origGetMouthGuide(targetItem);
        if (targetItem?.pronunciationTip) {
          return {
            ...baseGuide,
            tipTh: targetItem.pronunciationTip,
            satunTip: targetItem.satunFlavor || baseGuide.satunTip
          };
        }
        return baseGuide;
      };
    }

    // 4. Uppgradera Ordbank-vyn med temafilter för alla 10 teman, uttalstips & SentenceCombiner-knapp
    if (ge.UIController && ge.SRSManager) {
      let activeVocabTheme = 'all';
      const srs = ge.SRSManager;

      ge.UIController.renderVocabView = function () {
        const listContainer = document.getElementById('vocab-list-container');
        const summaryEl = document.getElementById('vocab-mastery-summary');
        if (!listContainer || !summaryEl) return;

        const allItems = window.ContentDB.getAllItems();
        const conceptCount = allItems.filter((i) => i.type === 'concept').length;
        const filteredItems =
          activeVocabTheme === 'all'
            ? allItems
            : activeVocabTheme === 'concepts'
            ? allItems.filter((i) => i.type === 'concept')
            : window.ContentDB.getItemsByTheme(activeVocabTheme);

        const learnedCount = allItems.filter((i) => srs.getRecord(i.id).masteryLevel > 0).length;
        const masteredCount = allItems.filter((i) => srs.getRecord(i.id).masteryLevel >= 4).length;

        const themePillsHTML = [
          `<button type="button" class="sim-pill-btn ${activeVocabTheme === 'all' ? 'selected' : ''}" data-vocab-theme="all" style="${
            activeVocabTheme === 'all' ? 'background: var(--sky); color: #fff; border-color: var(--sky-dark);' : ''
          }">Alla (${allItems.length})</button>`,
          `<button type="button" class="sim-pill-btn ${activeVocabTheme === 'concepts' ? 'selected' : ''}" data-vocab-theme="concepts" style="${
            activeVocabTheme === 'concepts' ? 'background: #8B5CF6; color: #fff; border-color: #7C3AED;' : ''
          }">🇸🇪 Begrepp (${conceptCount})</button>`,
          ...window.ContentDB.getThemes().map(
            (t) => `
            <button type="button" class="sim-pill-btn" data-vocab-theme="${t.id}" style="${
              activeVocabTheme === t.id ? 'background: var(--sky); color: #fff; border-color: var(--sky-dark);' : ''
            }">
              ${t.icon} ${t.shortTitleSv || t.titleSv.replace(/^\d+\.\s*/, '')}
            </button>
          `
          )
        ].join('');

        summaryEl.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div>
              <div style="font-weight: 900; font-size: 0.95rem;">
                10 Teman • ${allItems.length} Ord & Meningar
              </div>
              <div class="th-text" style="font-size: 0.82rem; color: var(--text-secondary);">
                ฝึกแล้ว ${learnedCount} / ${allItems.length} รายการ • จำแม่นระดับสูง ${masteredCount} รายการ
              </div>
            </div>
            <button type="button" class="btn-3d btn-yellow" id="btn-generate-combo-sent" style="min-height: 44px; padding: 6px 12px; font-size: 0.78rem;">
              ✨ Ny mening (i+1)
            </button>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-top: 10px; scrollbar-width: none;">
            ${themePillsHTML}
          </div>
        `;

        listContainer.innerHTML = filteredItems
          .map((item) => {
            const rec = srs.getRecord(item.id);
            const dots = [1, 2, 3, 4, 5]
              .map((lvl) => `<span class="mastery-dot ${lvl <= rec.masteryLevel ? 'filled' : ''}"></span>`)
              .join('');

            return `
              <div class="vocab-item-card" style="align-items: flex-start;">
                <div style="flex: 1;">
                  <div style="font-weight: 900; font-size: 1.02rem;">
                    ${item.emoji || '✨'} ${item.sv}
                    <span class="th-text" style="font-size: 0.82rem; font-weight: 700; color: var(--sky-dark);">
                      (${item.phoneticTh || item.phonetic})
                    </span>
                  </div>
                  <div class="th-text" style="font-size: 0.88rem; color: var(--text-main); font-weight: 700; margin-top: 2px;">
                    ${item.th}
                  </div>
                  <div class="th-text" style="font-size: 0.78rem; color: #7B2CBF; font-weight: 600; margin-top: 2px;">
                    🌴 ${item.satunFlavor || item.satun}
                  </div>
                  ${
                    item.pronunciationTip
                      ? `<div class="th-text" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 3px; background: #F8FAFC; padding: 4px 8px; border-radius: 8px;">
                          💡 ${item.pronunciationTip}
                        </div>`
                      : ''
                  }
                  <div class="mastery-dots" title="SM-2 Mastery Level ${rec.masteryLevel}/5" style="margin-top: 6px;">
                    ${dots}
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button type="button" class="btn-3d btn-blue" data-speak-sv="${item.id}" style="min-height: 46px; padding: 6px 12px; font-size: 0.85rem;" title="Lyssna normal (0.95x)">
                    🔊
                  </button>
                  <button type="button" class="btn-3d" data-speak-slow="${item.id}" style="min-height: 46px; padding: 6px 12px; font-size: 0.85rem; background: var(--lavender-soft); color: #7B2CBF; border-color: #D8B4FE; box-shadow: 0 3px 0 #C084FC;" title="Sköldpadds-tempo (0.60x)">
                    🐢
                  </button>
                </div>
              </div>
            `;
          })
          .join('');

        summaryEl.querySelectorAll('[data-vocab-theme]').forEach((btn) => {
          btn.addEventListener('click', () => {
            activeVocabTheme = btn.getAttribute('data-vocab-theme');
            window.SoundFX?.playClick();
            ge.UIController.renderVocabView();
          });
        });

        document.getElementById('btn-generate-combo-sent')?.addEventListener('click', () => {
          window.SoundFX?.playCorrect();
          const newSent = SentenceCombiner.generateDynamicSentence(
            activeVocabTheme === 'all' ? null : activeVocabTheme
          );
          window.ContentDB.registerItems([newSent]);
          window.SpeechEngine?.speakSwedish(newSent.sv, 0.95);
          ge.UIController.renderVocabView();
        });

        listContainer.querySelectorAll('[data-speak-sv]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const it = window.ContentDB.getItemById(btn.getAttribute('data-speak-sv'));
            if (it) window.SpeechEngine.speakSwedish(it.sv, 0.95);
          });
        });

        listContainer.querySelectorAll('[data-speak-slow]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const it = window.ContentDB.getItemById(btn.getAttribute('data-speak-slow'));
            if (it) {
              window.GameEngine.updateQuestProgress('turtle_3', 1);
              window.SpeechEngine.speakSlow(it.sv);
            }
          });
        });
      };
    }

    // 5. Uppdatera alla vyer så de 10 temana och 160+ posterna visas direkt
    ge.UIController?.refreshAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connectDatabaseToEngine);
  } else {
    connectDatabaseToEngine();
  }
})();

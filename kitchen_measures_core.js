/* Swedish kitchen measures: dimension-safe conversions and a Thai-first curriculum. */
(function (root) {
  'use strict';
  const units = [
    ['ml', 'milliliter', 'มิลลิลิตร', 'volume', 1], ['cl', 'centiliter', 'เซนติลิตร', 'volume', 10],
    ['dl', 'deciliter', 'เดซิลิตร', 'volume', 100], ['l', 'liter', 'ลิตร', 'volume', 1000],
    ['krm', 'kryddmått', 'ช้อนตวงเครื่องเทศสวีเดน', 'volume', 1],
    ['tsk', 'tesked', 'ช้อนชาแบบตวง', 'volume', 5], ['msk', 'matsked', 'ช้อนโต๊ะแบบตวง', 'volume', 15],
    ['mg', 'milligram', 'มิลลิกรัม', 'mass', .001], ['g', 'gram', 'กรัม', 'mass', 1],
    ['hg', 'hektogram', 'เฮกโตกรัม', 'mass', 100], ['kg', 'kilogram', 'กิโลกรัม', 'mass', 1000],
    ['st', 'styck', 'ชิ้น / ฟอง / ลูก ตามสิ่งที่นับ', 'count', 1]
  ].map(([id, sv, th, dimension, factor]) => ({ id, sv, th, dimension, factor }));
  const byId = Object.fromEntries(units.map(u => [u.id, u]));
  const recipeTerms = [
    { id:'°C',sv:'grader Celsius',th:'องศาเซลเซียส · อุณหภูมิ' },{id:'min',sv:'minuter',th:'นาที'},
    { id:'h / tim',sv:'timme',th:'ชั่วโมง' },{id:'cm',sv:'centimeter',th:'เซนติเมตร · ขนาดพิมพ์'},
    { id:'mm',sv:'millimeter',th:'มิลลิเมตร'}
  ];
  function unit(id) { if (!Object.hasOwn(byId, id)) throw new Error('Unknown unit'); return byId[id]; }
  function convert(value, from, to) {
    const a = unit(from), b = unit(to);
    if (!Number.isFinite(value) || value < 0 || a.dimension !== b.dimension) throw new Error('Incompatible quantity');
    return Math.round(value * a.factor / b.factor * 1e9) / 1e9;
  }
  function format(value) { return String(Math.round(value * 1e9) / 1e9).replace('.', ','); }
  function quantity(value, id) { return `${format(value)} ${id}`; }
  function speakQuantity(value, id) {
    const u = unit(id), names = { tsk: ['tesked','teskedar'], msk: ['matsked','matskedar'], krm: ['kryddmått','kryddmått'], st: ['styck','stycken'] };
    const neuter = u.dimension === 'mass' || id === 'krm' || id === 'st';
    const numbers = { .25: neuter ? 'noll komma tjugofem' : 'en fjärdedels', .5: neuter ? 'ett halvt' : 'en halv', .75: 'tre fjärdedels', 1: neuter ? 'ett' : 'en', 1.5: neuter ? 'ett och ett halvt' : 'en och en halv', 2: 'två', 2.5: neuter ? 'två och ett halvt' : 'två och en halv', 3: 'tre', 4: 'fyra', 5: 'fem', 10: 'tio', 15: 'femton', 25: 'tjugofem', 50: 'femtio', 75: 'sjuttiofem', 100: 'hundra', 125: 'hundratjugofem', 150: 'hundrafemtio', 200: 'tvåhundra', 250: 'tvåhundrafemtio', 500: 'femhundra', 750: 'sjuhundrafemtio', 1000: 'tusen' };
    const count = numbers[value] || format(value);
    return `${count} ${names[id] ? names[id][value > 1 && Number.isInteger(value) ? 1 : 0] : u.sv}`;
  }
  function option(id, label, lang = 'sv') { return { id, label, lang }; }
  function choice(id, prompt, target, labels, correct, explanation, speech = target) {
    return { id, type: 'choice', prompt, target, speech, choices: labels.map((label,i) => option(String(i),label[0] || label,label[1] || 'sv')), answer: String(correct), explanation };
  }
  const sv = text => [text, 'sv'], th = text => [text, 'th'];
  function amount(id, prompt, value, unitId, explanation, options = {}) {
    return { id, type: 'amount', prompt, target: quantity(value,unitId), speech: speakQuantity(value,unitId), value, unit: unitId, explanation, ...options };
  }
  function equation(id, lhs, rhs, wrong, explanation, speech) { return choice(id,'จำนวนไหนเท่ากับที่เห็นทางซ้าย?', lhs + ' = ?', [sv(rhs), ...wrong.map(sv)], 0, explanation, speech || lhs.replace(/\b(kg|hg|dl|ml|cl|msk|tsk|krm|g|l)\b/g, m=>byId[m].sv)); }
  const lessons = [
    { id:'volume-names', th:'1. รู้จักชื่อหน่วยตวง', goal:'อ่านชื่อสวีเดน ตัวย่อ และเลือกใช้หน่วยปริมาตร', xp:8,
      intro:'ปริมาตรคือพื้นที่ที่วัตถุดิบกินในภาชนะ ใช้ตวงได้ทั้งน้ำและของแห้ง ชื่อหน่วยสวีเดนกับตัวย่อเหล่านี้จะเจอบ่อยในสูตรขนม', facts:['1 l = 10 dl = 100 cl = 1 000 ml','1 msk = 15 ml · 1 tsk = 5 ml · 1 krm = 1 ml'], tasks:[
        ...['ml','cl','dl','l','krm','tsk','msk'].map((id,i)=>{ const u=byId[id], others=units.filter(v=>v.dimension==='volume'&&v.id!==id); return choice('name-'+id, `เลือกชื่อสวีเดนของหน่วย ${u.th}`, id, [sv(u.sv),sv(others[i%others.length].sv),sv(others[(i+2)%others.length].sv)],0,`${id} ย่อจาก ${u.sv} หมายถึง ${u.th}`,u.sv); }),
        choice('volume-tool','ถ้าต้องตวงนม 2 dl ควรใช้เครื่องมืออะไร?', '2 dl mjölk',[th('เหยือกหรือถ้วยตวงที่มีขีด dl'),th('นาฬิกาจับเวลา'),th('ช้อนกินข้าวที่ไม่ระบุขนาด')],0,'ใช้ภาชนะที่มีขีดบอกปริมาตร จะตวงได้ตรงกับสูตร','två deciliter mjölk') ] },
    { id:'weight-names', th:'2. ชื่อหน่วยชั่งและการนับ', goal:'แยก gram, hektogram, kilogram, milligram และ styck', xp:8,
      intro:'น้ำหนักใช้เครื่องชั่ง หน่วยหลักในสูตรคือ g และ kg ในสวีเดนยังใช้ hg ด้วย ส่วน mg เป็นหน่วยเล็กมากที่อาจเห็นบนฉลาก ไม่ใช่หน่วยที่เครื่องชั่งครัวทั่วไปวัดได้ละเอียดพอ', facts:['1 kg = 10 hg = 1 000 g','1 g = 1 000 mg · st ใช้นับ ไม่ใช่น้ำหนัก'], tasks:[
        ...['g','hg','kg','mg'].map((id,i)=>choice('name-'+id,`เลือกชื่อสวีเดนของ ${byId[id].th}`,id,[sv(byId[id].sv),sv(byId[['kg','g','mg','hg'][i]].sv),sv('deciliter')],0,`${id} = ${byId[id].sv} · ${byId[id].th}`,byId[id].sv)),
        choice('weigh','คำไหนแปลว่า “ชั่งน้ำหนัก”?','ชั่งน้ำหนัก',[sv('väga'),sv('hälla'),sv('röra om')],0,'väga คือชั่งน้ำหนัก ส่วน hälla คือเท และ röra om คือคนให้เข้ากัน','väga'),
        choice('count','สูตรเขียน 3 st ägg หมายถึงอะไร?', '3 st ägg',[th('ไข่ 3 ฟอง'),th('ไข่หนัก 3 กรัม'),th('ไข่ปริมาตร 3 เดซิลิตร')],0,'st เป็นตัวย่อของ styck / stycken ใช้นับจำนวนชิ้น ในกรณีไข่ใช้ลักษณนาม “ฟอง”','tre ägg'),
        choice('tara','กดปุ่มไหนเพื่อตัดน้ำหนักชามออก?', 'köksvåg',[sv('tara / nollställ'),sv('baka'),sv('dubbla')],0,'วางชามเปล่าบนเครื่องชั่งก่อน แล้วกด tara / nollställ ให้เป็น 0 g จากนั้นจึงใส่วัตถุดิบ','tara. nollställ'),
        choice('tool','ถ้าสูตรเขียน 150 g smör ควรใช้เครื่องมืออะไร?', '150 g smör',[th('เครื่องชั่งครัว'),th('ถ้วยตวง 150 ml แทนเสมอ'),th('ช้อนกินข้าวตามขนาดที่บ้านมี')],0,'g บอกน้ำหนัก จึงใช้เครื่องชั่ง ไม่แทนด้วย ml โดยอัตโนมัติ','hundrafemtio gram smör') ] },
    { id:'volume', th:'3. ลิตรเชื่อมกับหน่วยเล็กอย่างไร', goal:'เปลี่ยน l, dl, cl และ ml แล้วลองตวงจริงในเกม', xp:10,
      intro:'หน่วยเหล่านี้วัดสิ่งเดียวกัน แต่แบ่งเป็นขนาดต่างกัน 1 ลิตรแบ่งได้ 10 เดซิลิตร แต่ละเดซิลิตรแบ่งได้ 10 เซนติลิตร และแต่ละเซนติลิตรแบ่งได้ 10 มิลลิลิตร', facts:['l → ×10 → dl → ×10 → cl → ×10 → ml'], tasks:[
        equation('l-dl','1 l','10 dl',['100 dl','1 dl'],'1 ลิตร = 10 เดซิลิตร'), equation('dl-ml','1 dl','100 ml',['10 ml','1 000 ml'],'1 เดซิลิตร = 100 มิลลิลิตร'),
        equation('cl-ml','1 cl','10 ml',['100 ml','1 ml'],'1 เซนติลิตร = 10 มิลลิลิตร'),equation('half-l','0,5 l','5 dl',['50 dl','0,5 dl'],'ครึ่งลิตร = 5 เดซิลิตร'),
        amount('fill-200','ตวงให้ได้ตามป้าย ใช้หน่วยอื่นที่เท่ากันได้จ้า',2,'dl','2 dl = 200 ml = 20 cl',{allowed:['ml','cl','dl'],capacity:500}),
        amount('fill-250','เติมให้ได้สองเดซิลิตรครึ่ง',2.5,'dl','2,5 dl = 250 ml คอมม่าในสูตรสวีเดนเป็นจุดทศนิยม',{allowed:['ml','cl','dl'],capacity:500}),
        amount('fill-half','เติมให้ได้ครึ่งลิตร',.5,'l','0,5 l = 5 dl = 500 ml',{allowed:['ml','dl','l'],capacity:1000}),
        equation('750','750 ml','0,75 l',['7,5 l','75 l'],'750 ml เป็นสามในสี่ของหนึ่งลิตร') ] },
    { id:'spoons', th:'4. ช้อนตวงแบบสวีเดน', goal:'ใช้ krm, tsk และ msk พร้อมรู้ความสัมพันธ์', xp:10,
      intro:'ในสูตรให้ใช้ช้อนตวงมาตรฐาน ช้อนกินข้าวหรือช้อนชงชาที่บ้านอาจมีขนาดต่างกัน ตวงของแห้งให้ปาดเสมอขอบเมื่อสูตรไม่ได้บอกให้พูน', facts:['1 msk = 3 tsk = 15 krm = 15 ml','1 tsk = 5 krm = 5 ml'], tasks:[
        equation('msk-ml','1 msk','15 ml',['5 ml','10 ml'],'ช้อนโต๊ะแบบตวงสวีเดนจุ 15 ml'),equation('tsk-ml','1 tsk','5 ml',['15 ml','1 ml'],'ช้อนชาตวงจุ 5 ml'),
        equation('krm','1 krm','1 ml',['5 ml','10 ml'],'kryddmått เป็นช้อนตวงเครื่องเทศขนาด 1 ml'),equation('3-tsk','3 tsk','1 msk',['3 msk','0,5 msk'],'3 × 5 ml = 15 ml จึงเท่ากับ 1 msk'),
        amount('spoon-30','ใช้ช้อนตวงเติมให้ได้ตามป้าย',2,'msk','2 msk = 6 tsk = 30 ml',{allowed:['krm','tsk','msk'],capacity:50}),
        amount('spoon-half','ตวงครึ่งช้อนชา เลือก ½ ในช่องจำนวนได้เลย',.5,'tsk','½ tsk = 2,5 ml ไม่ใช่ครึ่งช้อนโต๊ะ',{allowed:['tsk','msk','ml'],capacity:15}),
        amount('spoon-10','ตวงสองช้อนชาโดยใช้ช้อนหรือ ml ที่เท่ากัน',2,'tsk','2 tsk = 10 ml',{allowed:['krm','tsk','msk','ml'],capacity:30}),
        choice('house-spoon','ช้อนกินข้าวทุกคันเท่ากับ 1 msk หรือไม่?', '1 msk',[th('ไม่เสมอ ใช้ช้อนตวง 15 ml'),th('เท่ากันทุกคัน'),th('ทุกคันเท่ากับ 100 ml')],0,'คำว่า matsked ในสูตรหมายถึงช้อนตวง 15 ml ไม่ใช่ขนาดของช้อนกินข้าวทุกคัน') ] },
    { id:'weight', th:'5. ชั่งกรัม เฮกโตกรัม กิโลกรัม', goal:'เปลี่ยนหน่วยน้ำหนัก และหักน้ำหนักชามก่อนชั่ง', xp:10,
      intro:'1 เฮกโตกรัมเท่ากับ 100 กรัม และ 1 กิโลกรัมเท่ากับ 10 เฮกโตกรัม วางชามแล้วกดศูนย์ก่อนชั่งวัตถุดิบ เครื่องชั่งในเกมจำลองน้ำหนักชามแยกจากของที่ใส่', facts:['1 kg = 10 hg = 1 000 g · 1 hg = 100 g','1 g = 1 000 mg'], tasks:[
        equation('kg-g','1 kg','1 000 g',['100 g','10 000 g'],'1 กิโลกรัม = 1 000 กรัม'),equation('hg-g','1 hg','100 g',['10 g','1 000 g'],'1 เฮกโตกรัม = 100 กรัม'),
        equation('kg-hg','1 kg','10 hg',['100 hg','1 hg'],'10 × 100 กรัม = 1 000 กรัม'),equation('half-kg','0,5 kg','500 g',['50 g','5 000 g'],'ครึ่งกิโลกรัม = 500 กรัม'),
        equation('g-mg','1 g','1 000 mg',['100 mg','10 mg'],'มิลลิกรัมเป็นหนึ่งในพันของกรัม ปกติใช้ดูฉลากมากกว่าชั่งขนมที่บ้าน'),
        amount('weigh-150','วางชาม กดศูนย์ แล้วชั่งให้ได้ตามป้าย',150,'g','150 g = 1,5 hg น้ำหนักชามไม่รวมเป็นน้ำหนักวัตถุดิบ',{allowed:['g','hg','kg'],capacity:500,tare:true}),
        amount('weigh-250','หักน้ำหนักชามแล้วชั่งหนึ่งในสี่กิโลกรัม',.25,'kg','0,25 kg = 250 g',{allowed:['g','hg','kg'],capacity:1000,tare:true}),
        amount('weigh-hg','ชั่งสองเฮกโตกรัมครึ่ง',2.5,'hg','2,5 hg = 250 g',{allowed:['g','hg','kg'],capacity:500,tare:true}) ] },
    { id:'fractions', th:'6. ครึ่ง หนึ่งในสี่ และทศนิยม', goal:'อ่าน ½, ¼, ¾ และคอมม่าในสูตรสวีเดน', xp:10,
      intro:'สูตรสวีเดนใช้คอมม่าเขียนทศนิยม เช่น 2,5 dl คือ 2 เดซิลิตรครึ่ง จำนวนครึ่งและหนึ่งในสี่ช่วยให้ปรับสูตรเล็กลงได้ ไม่ต้องปัดเป็นจำนวนเต็มเสมอ', facts:['½ = 0,5 · ¼ = 0,25 · ¾ = 0,75','2,5 dl = 250 ml'], tasks:[
        choice('half-sv','คำไหนแปลว่า “ครึ่งเดซิลิตร”?','½ dl',[sv('en halv deciliter'),sv('två deciliter'),sv('en liter')],0,'en halv deciliter = ½ dl = 50 ml','en halv deciliter'),
        choice('quarter-sv','คำไหนแปลว่า “หนึ่งในสี่ลิตร”?','¼ l',[sv('en fjärdedels liter'),sv('en halv liter'),sv('fyra liter')],0,'en fjärdedels liter = ¼ l = 250 ml','en fjärdedels liter'),
        equation('half-dl','½ dl','50 ml',['5 ml','500 ml'],'ครึ่งหนึ่งของ 100 ml คือ 50 ml'),equation('quarter-dl','¼ dl','25 ml',['250 ml','4 ml'],'หนึ่งในสี่ของ 100 ml คือ 25 ml'),
        equation('three-quarter','¾ l','750 ml',['75 ml','250 ml'],'สามส่วนของ 250 ml รวมเป็น 750 ml'),equation('comma','2,5 dl','250 ml',['25 ml','2 500 ml'],'เครื่องหมาย , ในสูตรสวีเดนแยกส่วนทศนิยม'),
        amount('half-spoon','ตวงครึ่งช้อนโต๊ะ เลือกจำนวน ½ ได้จ้า',.5,'msk','½ msk = 7,5 ml = 1,5 tsk',{allowed:['msk','tsk','ml'],capacity:30}),
        amount('quarter-kilo','ชั่งหนึ่งในสี่กิโลกรัมโดยใช้หน่วยที่ถนัด',.25,'kg','¼ kg = 0,25 kg = 250 g',{allowed:['kg','hg','g'],capacity:500,tare:true}) ] },
    { id:'precision', th:'7. ตวงกับชั่งต่างกันอย่างไร', goal:'ไม่สลับ ml กับ g และไม่ใช้ขนาดถ้วยตามใจ', xp:10,
      intro:'ปริมาตรกับน้ำหนักเป็นคนละอย่าง แป้ง 1 dl และน้ำ 1 dl กินที่เท่ากัน แต่น้ำหนักต่างกัน จะแปลงจาก dl เป็น g ต้องรู้ว่าเป็นวัตถุดิบอะไร และค่าก็อาจเปลี่ยนตามวิธีตวง', facts:['ปริมาตร: l · dl · cl · ml · msk · tsk · krm','น้ำหนัก: kg · hg · g · mg'], tasks:[
        choice('same-volume','แป้ง 1 dl กับน้ำ 1 dl อะไรเท่ากันแน่?', '1 dl mjöl · 1 dl vatten',[th('ปริมาตรเท่ากัน แต่น้ำหนักอาจต่างกัน'),th('หนัก 100 g เท่ากันเสมอ'),th('แป้ง 1 dl เท่ากับ 1 kg เสมอ')],0,'dl เป็นปริมาตร ไม่ได้บอกน้ำหนักที่เท่ากันของวัตถุดิบทุกชนิด'),
        choice('no-density','สูตรให้ชั่งน้ำตาล 100 g ใช้ 100 ml แทนได้ทันทีไหม?', '100 g socker',[th('ไม่ได้ ต้องชั่งหรือรู้ค่าของน้ำตาลชนิดนั้นก่อน'),th('ได้ เพราะ g และ ml เป็นหน่วยเดียวกัน'),th('ได้กับวัตถุดิบทุกชนิด')],0,'ห้ามใช้สูตร 1 ml = 1 g กับวัตถุดิบทุกอย่าง น้ำหนักขึ้นกับชนิดและความหนาแน่น'),
        choice('level','struket mått หมายถึงแบบไหน?', 'struket mått',[th('ปาดวัตถุดิบเสมอขอบช้อนหรือถ้วยตวง'),th('ตักให้เป็นกองพูนเสมอ'),th('กดแป้งให้แน่นที่สุดทุกครั้ง')],0,'struket คือปาดเสมอขอบ ส่วน rågat คือพูน หลีกเลี่ยงการอัดแป้งแน่นถ้าสูตรไม่ได้ระบุ','struket mått'),
        choice('heaped','rågat mått ต่างจาก struket อย่างไร?', 'rågat mått',[th('เป็นกองพูนเหนือขอบ ปริมาณขึ้นกับความพูน'),th('เท่ากับ 15 ml เสมอ'),th('หมายถึงตัดน้ำหนักชามออก')],0,'mått แบบพูนไม่มีปริมาณตายตัวเท่าการปาดเสมอขอบ อ่านคำสั่งในสูตรให้ดี','rågat mått'),
        choice('cup','ถ้วยกาแฟที่บ้านใช้แทน 1 dl ได้เลยหรือไม่?', 'en kopp',[th('ไม่ได้ ถ้วยแต่ละใบจุต่างกัน ต้องดูขีดตวง'),th('ได้ ถ้วยทุกใบเท่ากับ 1 dl'),th('ได้ ถ้วยทุกใบเท่ากับ 1 kg')],0,'kopp และ glas เป็นภาชนะ ไม่ใช่ขนาดตวงตายตัว ถ้าสูตรต่างประเทศใช้ cup ต้องดูมาตรฐานของสูตรนั้น'),
        choice('water','กฎ “น้ำ 1 dl หนักประมาณ 100 g” ใช้กับแป้งทุกชนิดได้ไหม?', '1 dl vatten ≈ 100 g',[th('ไม่ได้ เป็นค่าประมาณของน้ำ ไม่ใช่ทุกวัตถุดิบ'),th('ได้กับวัตถุดิบทุกชนิด'),th('ได้ เพราะ dl แปลว่ากรัม')],0,'น้ำประมาณ 100 g ต่อ 1 dl แต่แป้ง น้ำตาล น้ำผึ้ง และน้ำมันมีน้ำหนักต่อปริมาตรต่างกัน'),
        choice('small-scale','เครื่องชั่งครัวที่อ่านทีละ 1 g เหมาะสำหรับชั่ง 1 mg ไหม?', '1 mg = 0,001 g',[th('ไม่เหมาะ ความละเอียดของเครื่องชั่งไม่พอ'),th('เหมาะ เพราะ 1 mg = 1 g'),th('เหมาะ เพราะ mg เป็นลิตร')],0,'รู้ความสัมพันธ์ของหน่วยยังไม่พอ ต้องเลือกเครื่องมือที่ละเอียดพอด้วย'),
        amount('tare-practice','ฝึกหักน้ำหนักชามก่อนชั่งแป้ง 100 g',100,'g','เครื่องชั่งต้องแสดง 0 g เมื่อมีแต่ชาม ก่อนเติมแป้ง 100 g',{allowed:['g','hg'],capacity:300,tare:true}) ] },
    { id:'scaling', th:'8. ทำครึ่งสูตรและสองเท่า', goal:'ปรับจำนวนวัตถุดิบอย่างมีเหตุผล', xp:12,
      intro:'halvera คือใช้ครึ่งหนึ่ง dubbla คือใช้สองเท่า ปรับปริมาณวัตถุดิบทุกอย่างด้วยตัวคูณเดียวกัน อุณหภูมิเตาและเวลาอบไม่เพิ่มเป็นสองเท่าตามสูตรโดยอัตโนมัติ', facts:['halvera = ÷2 · dubbla = ×2','ปรับจำนวนวัตถุดิบ ไม่คูณอุณหภูมิเตาอัตโนมัติ'], tasks:[
        choice('double-word','คำไหนหมายถึงทำปริมาณเป็นสองเท่า?', 'สองเท่า',[sv('dubbla'),sv('halvera'),sv('väga')],0,'dubbla คือเพิ่มเป็นสองเท่า ส่วน halvera คือใช้ครึ่งหนึ่ง','dubbla'),
        choice('half-word','คำไหนหมายถึงทำครึ่งสูตร?', 'ครึ่งสูตร',[sv('halvera'),sv('hälla'),sv('dubbla')],0,'halvera คือหารด้วยสอง','halvera'),
        amount('double-milk','สูตรเดิมใช้นม 1,5 dl ถ้าทำสองเท่าให้ตวงเท่าไร?',3,'dl','1,5 dl × 2 = 3 dl',{allowed:['dl','ml'],capacity:500,clue:'1,5 dl × 2 = ?',speech:'Receptet har en och en halv deciliter mjölk. Dubbla receptet. Hur mycket mjölk behövs?'}),
        amount('half-butter','สูตรเดิมใช้เนย 150 g ถ้าทำครึ่งสูตรให้ชั่งเท่าไร?',75,'g','150 g ÷ 2 = 75 g',{allowed:['g','hg'],capacity:250,tare:true,clue:'150 g ÷ 2 = ?',speech:'Receptet har hundrafemtio gram smör. Halvera receptet. Hur mycket smör behövs?'}),
        amount('double-vanilla','สูตรเดิมใช้วานิลลา ½ tsk ถ้าทำสองเท่าต้องใช้เท่าไร?',1,'tsk','½ tsk × 2 = 1 tsk',{allowed:['tsk','msk','ml'],capacity:15,clue:'½ tsk × 2 = ?',speech:'Receptet har en halv tesked vaniljsocker. Dubbla mängden.'}),
        amount('triple-flour','สูตรสำหรับ 2 ที่ใช้แป้ง 100 g ถ้าจะทำ 6 ที่ต้องชั่งเท่าไร?',300,'g','6 ÷ 2 = 3 จึงใช้ 100 g × 3 = 300 g',{allowed:['g','hg','kg'],capacity:500,tare:true,clue:'2 → 6 · 100 g × ?',speech:'Två portioner behöver hundra gram mjöl. Hur mycket behövs till sex portioner?'}),
        amount('half-egg','สูตรเดิมใช้ไข่ 4 ฟอง ครึ่งสูตรใช้กี่ฟอง?',2,'st','4 ÷ 2 = 2 ฟอง st ใช้นับชิ้น ไม่ใช่กรัม',{allowed:['st'],capacity:6,clue:'4 st ÷ 2 = ?',speech:'Receptet har fyra ägg. Halvera mängden.'}),
        choice('oven','ทำสองเท่าต้องปรับเตาจาก 175 °C เป็น 350 °C อัตโนมัติไหม?', 'dubbla receptet',[th('ไม่ใช่ ปรับวัตถุดิบแล้วดูวิธีอบตามสูตร'),th('ต้องเพิ่มอุณหภูมิเป็นสองเท่าเสมอ'),th('ต้องคูณเวลาทุกขั้นด้วยสองเสมอ')],0,'ปริมาณวัตถุดิบสัมพันธ์กับจำนวนที่ แต่เวลาอบและอุณหภูมิขึ้นกับวิธีทำและขนาดพิมพ์ด้วย') ] },
    { id:'listening', th:'9. ฟังคำสั่งแล้วตวงเอง', goal:'ฟังจำนวนและชื่อหน่วยสวีเดน แล้วลงมือโดยไม่มีป้ายเฉลย', xp:12,
      intro:'ฟังคำสั่งสวีเดนแล้วตวงหรือชั่งตามที่ได้ยิน กดฟังช้าได้เสมอ ถ้ายังไม่มั่นใจ เปิดข้อความช่วยก่อนก็ได้ ไม่มีการหักแต้ม', facts:['ฟังให้ครบทั้งจำนวนและหน่วย · เปิดคำช่วยได้เสมอ'], tasks:[
        ...[[2,'dl'],[.5,'l'],[1,'msk'],[.5,'tsk'],[150,'g'],[2.5,'hg'],[.25,'kg'],[3,'st']].map(([v,u],i)=>amount('listen-'+i,'ฟังจำนวนและหน่วย แล้วตวง ชั่ง หรือนับให้ตรง',v,u,`${quantity(v,u)} · ${speakQuantity(v,u)}`,{listen:true,allowed:byId[u].dimension==='volume'?['ml','dl','tsk','msk']:u==='st'?['st']:['g','hg','kg'],capacity:byId[u].dimension==='volume'?500:u==='st'?6:500,tare:byId[u].dimension==='mass'})) ] }
  ];
  const recipeAmounts = {
    cake:[[150,'g'],[2,'dl'],[3,'st'],[3,'dl'],[2,'tsk'],[2,'tsk'],[1,'dl'],[2,'dl'],[12,'st']],
    cookies:[[100,'g'],[1,'dl'],[1,'st'],[3,'dl'],[1,'tsk'],[1,'krm'],[100,'g']],
    buns:[[2.5,'dl'],[25,'g'],[75,'g'],[.5,'dl'],[7,'dl'],[1,'krm'],[1,'msk']],
    lemoncake:[[100,'g'],[2,'dl'],[2,'st'],[3,'dl'],[2,'tsk'],[1,'dl'],[1,'st']],
    banana:[[2,'st'],[75,'g'],[1,'dl'],[2,'st'],[3,'dl'],[2,'tsk'],[1,'tsk']],
    carrotcake:[[3,'dl'],[2,'dl'],[3,'st'],[150,'g'],[3,'dl'],[2,'tsk'],[2,'tsk']],
    blueberry:[[3,'dl'],[100,'g'],[1,'dl'],[3,'dl'],[1,'tsk'],[.5,'st']],
    apple:[[3,'st'],[100,'g'],[1,'dl'],[3,'dl'],[2,'tsk'],[1,'msk']]
  };
  lessons.push({id:'recipe-signs',th:'10. เวลา เตาอบ และขนาดพิมพ์',goal:'อ่าน °C, min, h, cm และ mm ในสูตรขนม',xp:12,
    intro:'นอกจากชั่งและตวง สูตรยังบอกอุณหภูมิเตา เวลาอบ และขนาดพิมพ์ หน่วยเหล่านี้ใช้คนละเรื่องกับกรัมและลิตร ต้องอ่านให้ครบก่อนเริ่มทำ',
    facts:['1 h = 60 min · 1 cm = 10 mm','°C = grader Celsius · อุณหภูมิของเตาอบ'],tasks:[
      choice('celsius','°C ในป้ายอุณหภูมิเตาอ่านว่าอย่างไรเป็นสวีเดน?','175 °C',[sv('grader Celsius'),sv('gram'),sv('liter')],0,'175 °C คืออุณหภูมิ 175 องศาเซลเซียส ไม่ใช่น้ำหนักหรือปริมาตร','hundrasjuttiofem grader Celsius'),
      choice('oven-setting','ป้าย 175 °C หมายถึงให้ตั้งอะไร?', '175 °C',[th('อุณหภูมิเตาอบ'),th('น้ำหนักแป้ง'),th('ปริมาตรนม')],0,'grader Celsius ใช้บอกอุณหภูมิ เช่น ตั้งเตาอบที่ 175 °C','hundrasjuttiofem grader Celsius'),
      choice('minutes','min ในสูตรย่อจากคำสวีเดนใด?', '20 min',[sv('minuter'),sv('milliliter'),sv('matskedar')],0,'20 min คือ 20 นาที · min เป็นเวลา ส่วน ml เป็นปริมาตร','tjugo minuter'),
      choice('hours','h หรือ tim ในสูตรหมายถึงอะไร?', '1 h / 1 tim',[sv('en timme'),sv('ett hektogram'),sv('en tesked')],0,'h และ tim ใช้บอกชั่วโมง · timme เป็นชื่อสวีเดนของหนึ่งชั่วโมง','en timme'),
      equation('hour-min','1 h','60 min',['100 min','10 min'],'หนึ่งชั่วโมงมี 60 นาที หน่วยเวลาไม่ได้เปลี่ยนทีละสิบเหมือน l → dl','en timme'),
      equation('hour-half','1,5 h','90 min',['150 min','65 min'],'1 ชั่วโมงครึ่ง = 60 + 30 = 90 นาที','en och en halv timme'),
      choice('pan-size','ขนาดพิมพ์ 20 cm อ่านหน่วยนี้เป็นสวีเดนว่าอะไร?', '20 cm',[sv('centimeter'),sv('centiliter'),sv('kilogram')],0,'cm เป็นความยาวหรือขนาดพิมพ์ ส่วน cl เป็นปริมาตร คนละชนิดกัน','tjugo centimeter'),
      equation('cm-mm','1 cm','10 mm',['100 mm','1 mm'],'1 เซนติเมตร = 10 มิลลิเมตร · สวีเดนใช้คำว่า centimeter และ millimeter','en centimeter') ]});
  function recipeTasks(recipe, ingredients) {
    if (!Object.hasOwn(recipeAmounts,recipe.id)) throw new Error('Unknown recipe');
    return [...recipe.steps,...recipe.decorations].map((id,i)=>{
      const [value,u]=recipeAmounts[recipe.id][i], ingredient=ingredients[id], dimension=unit(u).dimension;
      const ingredientSv = ingredient.sv.replace(/^(en|ett) /,'');
      const counted = value > 1 ? ({ banana:'bananer',apple:'äpplen',lemon:'citroner',strawberry:'jordgubbar' }[id] || ingredientSv) : ingredientSv;
      const countPhrase = value===1?ingredient.sv:`${value===.5?'en halv':speakQuantity(value,'st').replace(/ stycken?$/,'')} ${counted}`;
      return amount('recipe-'+id,`เตรียม${ingredient.th}ให้ได้ตามป้ายสูตร`,value,u,`${quantity(value,u)} ${ingredientSv} · ${ingredient.th}`,{
        ingredient:id, target:`${quantity(value,u)} ${counted}`,speech:dimension==='count'?`Ta ${countPhrase}.`:`${dimension==='mass'?'Väg upp':'Mät upp'} ${speakQuantity(value,u)} ${counted}.`,
        allowed:dimension==='volume'?['ml','dl','krm','tsk','msk']:dimension==='mass'?['g','hg','kg']:['st'],capacity:dimension==='count'?Math.max(6,value):Math.max(dimension==='volume'?50:250,value*unit(u).factor*1.5),tare:dimension==='mass'
      });
    });
  }
  function create(id, tasks) {
    if (!tasks?.length) throw new Error('Empty lesson');
    return { version:1,id,index:0,mistakes:0,firstTry:0,solved:false,amount:0,tared:false,runId:Date.now()+':'+Math.random().toString(36).slice(2),assisted:false };
  }
  function add(state, task, value, unitId) {
    if (state.solved || task.type!=='amount' || !task.allowed.includes(unitId) || !Number.isFinite(value) || value<=0 || value>1000) return false;
    if(task.tare&&!state.tared)return false;
    state.amount=Math.round((state.amount+convert(value,unitId,unit(task.unit).dimension==='volume'?'ml':unit(task.unit).dimension==='mass'?'g':'st'))*1e9)/1e9;
    return true;
  }
  function tare(state){if(state.solved||state.amount!==0)return false;state.tared=true;return true;}
  function check(state,task,answer) {
    if (state.solved) return 'already';
    if(task.type==='amount'&&task.tare&&!state.tared) return 'tare';
    const correct=task.type==='choice'?answer===task.answer:Math.abs(state.amount-convert(task.value,task.unit,unit(task.unit).dimension==='volume'?'ml':unit(task.unit).dimension==='mass'?'g':'st'))<1e-7;
    if(!correct){state.mistakes++;return 'retry';} state.solved=true;return 'correct';
  }
  function next(state,tasks) {
    if(!state.solved)return false;
    state.index++;state.solved=false;state.amount=0;state.tared=false;
    return state.index<tasks.length;
  }
  function restore(raw,id,tasks) {
    try { const s=typeof raw==='string'?JSON.parse(raw):raw;
      if(!s||s.version!==1||s.id!==id||!Number.isInteger(s.index)||s.index<0||s.index>=tasks.length||typeof s.runId!=='string')return null;
      return { ...create(id,tasks), index:s.index, runId:s.runId.slice(0,100),mistakes:Number.isSafeInteger(s.mistakes)&&s.mistakes>=0?s.mistakes:0,amount:Number.isFinite(s.amount)&&s.amount>=0?Math.min(s.amount,1e6):0,tared:s.tared===true,solved:s.solved===true,assisted:s.assisted===true };
    }catch(_){return null;}
  }
  const api={units,byId,recipeTerms,lessons,recipeAmounts,convert,format,quantity,speakQuantity,recipeTasks,create,add,tare,check,next,restore};
  if(typeof module==='object'&&module.exports)module.exports=api;else root.KitchenMeasureCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);

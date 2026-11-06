/* Nattnyckeln: serializable game rules, independent of the browser. */
(function (root) {
  'use strict';
  const rooms = [
    { id: 'forest', title: 'Björklunden', subtitle: 'Där skuggorna har öron', chapter: '01',
      story: 'Radion sprakar till. ”Det gamla kodlåset fungerar utan ström”, säger Signe. ”Fyra mässingsmärken visar siffrorna. Läs landskapet så vet du ordningen.”',
      th: 'หาสัตว์สี่ตัว แต่ละตัวมีตัวเลข ใช้ตำแหน่งในภาพช่วยเรียงรหัส',
      puzzleTitle: 'Vaktmästarens kodlås', reward: 'Björksigillet', tool: 'kikare',
      puzzleClue: 'Först den som vakar över stigen. Sedan den som vilar mellan stenarna. Därefter den lilla gästen under bänken. Den buskiga svansen avslutar raden.',
      animals: ['owl', 'lynx', 'hedgehog', 'fox'] },
    { id: 'wetland', title: 'Vassviken', subtitle: 'Allt som speglas är inte stilla', chapter: '02',
      story: 'Bakom björkgrinden ligger viken. Bron är nedsänkt. På slusshuset sitter fyra träskyltar. ”Vattnet minns en ordning”, viskar radion. ”Djurens anteckningar hjälper dig.”',
      th: 'อ่านบันทึกสัตว์ แล้วเรียงขั้นตอนการเปิดสะพานให้ถูกต้อง',
      puzzleTitle: 'Slussens fyra steg', reward: 'Vattensigillet', tool: 'nattlampa',
      puzzleClue: 'Slussen öppnas först när rännan är fylld. Bron kan höjas först efter att slussen öppnats. Lyktan tänds när bron är uppe. Ordna skyltarna och prova mekanismen.',
      animals: ['beaver', 'heron', 'frog', 'otter'] },
    { id: 'greenhouse', title: 'Vinterträdgården', subtitle: 'Den sista meningen', chapter: '03',
      story: 'Dörren till växthuset glider upp. Nattblommorna har slagit ut. I glashusets djup väntar reservnyckeln. ”Tänd nattlampan”, säger Signe. ”Små färger berättar stora hemligheter.”',
      th: 'เปิดไฟกลางคืน มองหาสัตว์อีกสี่ตัว แล้วเรียงประโยคเพื่อเปิดประตู',
      puzzleTitle: 'Nattgrindens lösenord', reward: 'Blomstersigillet', tool: 'nyckel',
      puzzleClue: 'Lyktan lyser. Då kan vi öppna grinden. Sätt ihop tankarna till en mening som börjar med ”När”. Orden från djurens lappar ska alla vara med.',
      animals: ['sloth', 'butterfly', 'snake', 'chameleon'] }
  ];
  const animals = [
    { id: 'owl', room: 'forest', sv: 'en uggla', th: 'นกฮูก', x: 145, y: 89, w: 54, h: 72,
      clue: 'En tyst väktare följer stigen med blicken. Fötterna lämnar aldrig grenen.',
      hints: ['Sök högt, där björken delar sig.', 'Två små ögon gömmer sig i barkens mönster, till vänster i bilden.', 'Titta vid den krokiga grenen, ovanför stigen.'],
      sentence: 'Ugglan sitter ovanför stigen.', position: 'ovanför', choices: ['en uggla', 'en häger', 'en fjäril'],
      note: 'Den som vakar över stigen börjar koden.' },
    { id: 'lynx', room: 'forest', sv: 'ett lodjur', th: 'แมวป่าลิงซ์', x: 615, y: 274, w: 109, h: 72,
      clue: 'Stenen har fått öron. Men bara ett av dem bär en liten svart tofs.',
      hints: ['Följ stenarnas konturer till höger om mitten.', 'Något fläckigt vilar mellan två mossiga stenar.', 'Ett kattansikte smälter in i klippans skugga.'],
      sentence: 'Lodjuret vilar mellan stenarna.', position: 'mellan', choices: ['en räv', 'ett lodjur', 'en utter'],
      note: 'Den som vilar mellan stenarna kommer efter trädets väktare.' },
    { id: 'hedgehog', room: 'forest', sv: 'en igelkott', th: 'เม่นแคระ', x: 312, y: 659, w: 64, h: 52,
      clue: 'Under platsen där trötta besökare vilar finns någon som bär sin egen borste.',
      hints: ['Sök nära marken, på bildens vänstra halva.', 'Bänken har mer än fyra ben i sin skugga.', 'Titta under bänken, intill löven.'],
      sentence: 'Igelkotten gömmer sig under bänken.', position: 'under', choices: ['en bäver', 'en igelkott', 'en groda'],
      note: 'Bänkens lilla gäst står näst sist i koden.' },
    { id: 'fox', room: 'forest', sv: 'en räv', th: 'สุนัขจิ้งจอก', x: 1017, y: 628, w: 94, h: 59,
      clue: 'Höstens färger har kommit för tidigt. Ett rostfärgat löv har en vit svanstipp.',
      hints: ['Blicken ska nedåt, mot bildens högra kant.', 'Röda ormbunkar döljer en buskig svans.', 'Bakom den liggande stammen skymtar ett spetsigt ansikte.'],
      sentence: 'Räven ligger bakom stammen.', position: 'bakom', choices: ['ett lodjur', 'en räv', 'en bäver'],
      note: 'Den buskiga svansen avslutar koden.' },
    { id: 'beaver', room: 'wetland', sv: 'en bäver', th: 'บีเวอร์', x: 246, y: 414, w: 93, h: 68,
      clue: 'Vid stranden ligger träspån. Den som lämnade dem har en svans som en paddel.',
      hints: ['Sök bland drivveden på vänster sida.', 'En brun rygg liknar en del av den gamla stammen.', 'Titta precis intill veden, vid vattenkanten.'],
      sentence: 'Bävern sitter bredvid stammen.', position: 'bredvid', choices: ['en bäver', 'en utter', 'en igelkott'],
      note: 'Fyll rännan innan du öppnar slussen.' },
    { id: 'heron', room: 'wetland', sv: 'en häger', th: 'นกกระสา', x: 1005, y: 343, w: 64, h: 111,
      clue: 'Ett vasstrå står stilla trots vinden. Det har en näbb och två mycket smala ben.',
      hints: ['Sök bland de höga stråna till höger.', 'En lång hals följer vassens lodräta linjer.', 'Den grå fågeln står i öppningen mellan stråna.'],
      sentence: 'Hägern står inne i vassen.', position: 'i', choices: ['en uggla', 'en häger', 'en fjäril'],
      note: 'Öppna slussen innan du höjer bron.' },
    { id: 'frog', room: 'wetland', sv: 'en groda', th: 'กบ', x: 333, y: 605, w: 54, h: 44,
      clue: 'Den lilla mossfläcken på stenen har två ögon och väntar på nästa hopp.',
      hints: ['Leta bland de låga stenarna, till vänster om mitten.', 'Grönt mot grönt är svårt att se. Förstora bilden.', 'På den släta stenen sitter något litet, mellan bladen.'],
      sentence: 'Grodan sitter på stenen.', position: 'på', choices: ['en kameleont', 'en orm', 'en groda'],
      note: 'Höj bron innan du tänder lyktan.' },
    { id: 'otter', room: 'wetland', sv: 'en utter', th: 'นาก', x: 782, y: 630, w: 86, h: 43,
      clue: 'Någon ritar ringar i vattnet. En mörk nos bryter spegeln mellan bladen.',
      hints: ['Titta i vattnet, nedanför bron.', 'Ett huvud och en böjd rygg liknar mörka krusningar.', 'Sök mellan vattenbladen, till höger om mitten.'],
      sentence: 'Uttern simmar framför vassen.', position: 'framför', choices: ['en utter', 'en bäver', 'en orm'],
      note: 'Lyktan är den sista signalen.' },
    { id: 'sloth', room: 'greenhouse', sv: 'en sengångare', th: 'สลอธ', x: 270, y: 163, w: 85, h: 105,
      clue: 'Ett hopvikt knyte hänger utan rep. Tre långa klor håller fast vid grenen.',
      hints: ['Sök bland de hängande grenarna på vänster sida.', 'Pälsen liknar den grågröna mossan.', 'Under en gren, högt upp, göms ett litet ansikte.'],
      sentence: 'Sengångaren hänger under grenen.', position: 'under', choices: ['ett lodjur', 'en sengångare', 'en kameleont'],
      note: 'Lapp 1: ”När” och ”lyktan”.', words: ['När', 'lyktan'] },
    { id: 'butterfly', room: 'greenhouse', sv: 'en fjäril', th: 'ผีเสื้อ', x: 690, y: 192, w: 54, h: 48,
      clue: 'En av orkidéerna har landat på ett blad. Nattljuset avslöjar dess andra färg.',
      hints: ['Sök till höger om glashusets mitt.', 'Tänd nattlampan. Några vingstreck skiftar då färg.', 'Bland de ljusa blommorna vilar ett par små vingar.'],
      sentence: 'Fjärilen vilar ovanpå bladet.', position: 'ovanpå', choices: ['en groda', 'en fjäril', 'en uggla'],
      note: 'Lapp 2: ”lyser” och ”kan”.', words: ['lyser', 'kan'] },
    { id: 'snake', room: 'greenhouse', sv: 'en orm', th: 'งู', x: 196, y: 564, w: 110, h: 52,
      clue: 'En av lianerna fortsätter bakom krukan. Dess yttersta blad har en kluven tunga.',
      hints: ['Leta nära golvet på vänster sida.', 'Följ den tunna gröna linjen runt krukorna.', 'Bakom lerkrukan skymtar ett smalt huvud.'],
      sentence: 'Ormen ringlar bakom krukan.', position: 'bakom', choices: ['en orm', 'en utter', 'en kameleont'],
      note: 'Lapp 3: ”vi” och ”öppna”.', words: ['vi', 'öppna'] },
    { id: 'chameleon', room: 'greenhouse', sv: 'en kameleont', th: 'กิ้งก่าคาเมเลียน', x: 1010, y: 592, w: 93, h: 60,
      clue: 'Grenen har fått en spiral. Ett öga ser åt ett annat håll än resten av kroppen.',
      hints: ['Sök bland ormbunkarna på höger sida.', 'Nattlampan hjälper dig urskilja en krökt svans.', 'På den tjocka grenen gömmer sig en liten grön klättrare.'],
      sentence: 'Kameleonten klättrar längs grenen.', position: 'längs', choices: ['en kameleont', 'en orm', 'en sengångare'],
      note: 'Lapp 4: ”grinden”.', words: ['grinden'] }
  ];
  const byId = Object.fromEntries(animals.map(animal => [animal.id, animal]));
  const sluiceSteps = [
    { id: 'fill', text: 'Fyll rännan' }, { id: 'open', text: 'Öppna slussen' },
    { id: 'raise', text: 'Höj bron' }, { id: 'light', text: 'Tänd lyktan' }
  ];
  const phrase = ['När', 'lyktan', 'lyser', 'kan', 'vi', 'öppna', 'grinden'];
  function shuffle(list, random = Math.random) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function create(random = Math.random) {
    const digits = shuffle([2, 3, 4, 5, 6, 7, 8, 9], random).slice(0, 4);
    return { version: 1, status: 'playing', room: 0, found: [], solved: [],
      marks: Object.fromEntries(rooms[0].animals.map((id, i) => [id, digits[i]])),
      trackOrder: Object.fromEntries(rooms.map(room => [room.id, shuffle(room.animals, random)])),
      hints: {}, hard: true, lamp: false, mistakes: 0, locks: { forest: '', wetland: [], greenhouse: [] },
      wordOrder: shuffle(phrase, random), startedAt: Date.now() };
  }
  function available(state, animalId) {
    return Object.hasOwn(byId, animalId) && rooms.findIndex(room => room.id === byId[animalId].room) <= state.solved.length;
  }
  function foundInRoom(state, roomIndex = state.room) { return rooms[roomIndex].animals.filter(id => state.found.includes(id)); }
  function identify(state, animalId, answer) {
    if (state.status !== 'playing' || !available(state, animalId)) return 'locked';
    if (state.found.includes(animalId)) return 'already';
    if (byId[animalId].sv !== answer) { state.mistakes++; return 'retry'; }
    state.found.push(animalId); return 'found';
  }
  function hint(state, animalId) {
    if (!available(state, animalId) || state.found.includes(animalId)) return null;
    state.hints[animalId] = Math.min(3, (state.hints[animalId] || 0) + 1);
    return byId[animalId].hints[state.hints[animalId] - 1];
  }
  function code(state) { return rooms[0].animals.map(id => state.marks[id]).join(''); }
  function solve(state, roomIndex, answer) {
    if (state.status !== 'playing' || !Number.isInteger(roomIndex) || !rooms[roomIndex] || roomIndex > state.solved.length) return 'locked';
    if (state.solved.includes(rooms[roomIndex].id)) return 'already';
    if (foundInRoom(state, roomIndex).length !== 4) return 'missing';
    const correct = roomIndex === 0 ? String(answer) === code(state) :
      roomIndex === 1 ? Array.isArray(answer) && answer.join('|') === sluiceSteps.map(step => step.id).join('|') :
      Array.isArray(answer) && answer.join('|') === phrase.join('|');
    if (!correct) { state.mistakes++; return 'retry'; }
    state.solved.push(rooms[roomIndex].id);
    if (state.solved.length === 3) state.status = 'escaped';
    return 'solved';
  }
  function go(state, roomIndex) {
    if (!Number.isInteger(roomIndex) || roomIndex < 0 || roomIndex >= rooms.length || roomIndex > state.solved.length) return false;
    state.room = roomIndex; return true;
  }
  function restore(raw) {
    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!data || data.version !== 1 || !Array.isArray(data.found) || !Array.isArray(data.solved)) return null;
      const state = create();
      const marks = rooms[0].animals.map(id => data.marks?.[id]);
      if (marks.some(n => !Number.isInteger(n) || n < 2 || n > 9) || new Set(marks).size !== 4) return null;
      state.marks = Object.fromEntries(rooms[0].animals.map((id, i) => [id, marks[i]]));
      state.found = [...new Set(data.found.filter(id => Object.hasOwn(byId, id)))];
      for (let i = 0; i < 3; i++) {
        if (data.solved[i] === rooms[i].id && foundInRoom(state, i).length === 4) state.solved.push(rooms[i].id);
        else break;
      }
      state.found = state.found.filter(id => available(state, id));
      state.room = Number.isInteger(data.room) ? Math.max(0, Math.min(data.room, state.solved.length, 2)) : 0;
      state.status = state.solved.length === 3 ? 'escaped' : 'playing';
      state.hard = data.hard !== false; state.lamp = data.lamp === true && state.solved.length >= 2;
      for (const room of rooms) {
        const order = data.trackOrder?.[room.id];
        if (Array.isArray(order) && order.length === 4 && new Set(order).size === 4 && order.every(id => room.animals.includes(id))) state.trackOrder[room.id] = order.slice();
      }
      state.mistakes = Number.isSafeInteger(data.mistakes) && data.mistakes >= 0 ? data.mistakes : 0;
      for (const animal of animals) {
        const n = data.hints?.[animal.id];
        if (Number.isInteger(n) && n > 0 && n <= 3) state.hints[animal.id] = n;
      }
      if (Array.isArray(data.wordOrder) && data.wordOrder.length === phrase.length && new Set(data.wordOrder).size === phrase.length && data.wordOrder.every(word => phrase.includes(word))) state.wordOrder = data.wordOrder.slice();
      if (typeof data.locks?.forest === 'string' && /^\d{0,4}$/.test(data.locks.forest)) state.locks.forest = data.locks.forest;
      for (const [key, allowed] of [['wetland', sluiceSteps.map(step => step.id)], ['greenhouse', phrase]]) {
        const values = data.locks?.[key];
        if (Array.isArray(values) && new Set(values).size === values.length && values.every(value => allowed.includes(value))) state.locks[key] = values.slice();
      }
      if (Number.isFinite(data.startedAt) && data.startedAt > 0) state.startedAt = data.startedAt;
      return state;
    } catch (_) { return null; }
  }
  const api = { rooms, animals, byId, sluiceSteps, phrase, create, available, foundInRoom, identify, hint, code, solve, go, restore, shuffle };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ZooCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

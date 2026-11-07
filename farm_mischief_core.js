/* Vocabulary and the illustrated slingshot's virtual trajectory. */
(function (root) {
  'use strict';
  const entries = [
    ['can','en konservburk','konservburken','กระป๋องอาหาร','metal',38,53],
    ['cup','en kopp','koppen','ถ้วยกาแฟ','ceramic',53,36],
    ['ball','en boll','bollen','ลูกบอล','rubber',45,45],
    ['block','en kloss','klossen','บล็อกไม้','wood',43,42],
    ['glass','ett glas','glaset','แก้วน้ำ','glass',37,57],
    ['spoon','en sked','skeden','ช้อน','metal',28,60],
    ['pot','en blomkruka','blomkrukan','กระถางต้นไม้','ceramic',52,44],
    ['box','en kartong','kartongen','กล่องกระดาษ','paper',55,42],
    ['bottle','en flaska','flaskan','ขวด','glass',34,69],
    ['mug','en mugg','muggen','แก้วมัค','ceramic',47,53],
    ['bucket','en hink','hinken','ถัง','metal',53,52],
    ['peg','en tvättklämma','tvättklämman','ไม้หนีบผ้า','wood',26,57],
    ['plate','en tallrik','tallriken','จาน','ceramic',53,54],
    ['jar','en glasburk','glasburken','โหลแก้ว','glass',41,51],
    ['crate','en låda','lådan','ลังไม้','wood',64,42],
    ['sponge','en svamp','svampen','ฟองน้ำ','soft',56,34],
    ['watering','en vattenkanna','vattenkannan','บัวรดน้ำ','plastic',64,48],
    ['pan','en kastrull','kastrullen','หม้อ','metal',63,39],
    ['bowl','en skål','skålen','ชาม','ceramic',58,34],
    ['stick','en pinne','pinnen','กิ่งไม้','wood',28,64],
    ['carton','ett saftpaket','saftpaketet','กล่องน้ำผลไม้','paper',39,59],
    ['eggs','en äggkartong','äggkartongen','แผงไข่กระดาษ','paper',63,31],
    ['lid','ett lock','locket','ฝาปิด','plastic',53,48],
    ['whisk','en visp','vispen','ตะกร้อมือ','metal',33,66],
    ['brush','en borste','borsten','แปรง','wood',55,39],
    ['boot','en stövel','stöveln','รองเท้าบูต','rubber',50,61],
    ['colander','ett durkslag','durkslaget','กระชอน','metal',67,41]
  ];
  const items = entries.map(([id, sv, definite, th, material, width, height]) => ({ id, sv, definite, th, material, width, height }));
  const rounds = [items.slice(0,4), items.slice(4,8), items.slice(8,12), items.slice(12,17), items.slice(17,22), items.slice(22)];
  const world = { width:500, height:426, originX:250, originY:322, table:217, ground:299, pull:91, gravity:670 };
  function round(index) { return rounds[(Math.max(0, Math.floor(index)) || 0) % rounds.length] || rounds[0]; }
  function targets(index) {
    const group = round(index);
    return group.map((item, i) => ({ ...item, x:66 + 368 * ((group.length - i + index + 1) % group.length) / (group.length - 1), y:world.table - item.height / 2 }));
  }
  function draw(x, y) {
    const dx = x - world.originX, dy = y - world.originY;
    const length = Math.hypot(dx,dy);
    const scale = length > world.pull ? world.pull / length : 1;
    return { x:world.originX + dx * scale, y:world.originY + dy * scale, vx:-dx * scale * 8.4, vy:-dy * scale * 7.6, strength:Math.min(1,length / world.pull) };
  }
  function position(shot, time) {
    return { x:shot.x + shot.vx * time, y:shot.y + shot.vy * time + world.gravity * time * time / 2 };
  }
  function intersect(from, to, target) {
    let entry = 0, exit = 1;
    for (const axis of ['x','y']) {
      const radius = (axis === 'x' ? target.width : target.height) / 2 + 3;
      const delta = to[axis] - from[axis];
      const low = target[axis] - radius, high = target[axis] + radius;
      if (!delta) { if (from[axis] < low || from[axis] > high) return null; continue; }
      const a = (low - from[axis]) / delta, b = (high - from[axis]) / delta;
      entry = Math.max(entry, Math.min(a,b)); exit = Math.min(exit, Math.max(a,b));
      if (exit < entry) return null;
    }
    return entry;
  }
  function firstHit(from, to, board) {
    let hit = null;
    for (const target of board) {
      const time = intersect(from, to, target);
      if (time !== null && (!hit || time < hit.time)) hit = { target, time };
    }
    return hit;
  }
  function impact(shot, time, expected, hit) {
    if (shot.strength < .43 || Math.hypot(shot.vx, shot.vy + world.gravity * time) < 118) return 'weak';
    return hit.id === expected ? 'hit' : 'wrong';
  }
  function claimBonus(state, day) {
    if (state.mischiefBonusDay === day) return 0;
    state.mischiefBonusDay = day;
    return 3;
  }
  const api = { items, round, targets, roundCount:rounds.length, world, draw, position, firstHit, impact, claimBonus };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FarmMischiefCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

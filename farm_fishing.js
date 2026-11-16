/* Gong Heng. Finger casts, a responsive reel and Swedish words by the lake. */
(function () {
  'use strict';
  const C = window.FarmFishingCore, A = window.FarmFishingArt, D = window.MiniGameDialogue;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const button = (action,label,extra = '') => `<button type="button" class="gf-button" data-gf="${action}" ${extra}>${label}</button>`;
  const replay = line => `<button type="button" class="mg-replay gf-replay" data-gf="listen" data-line="${esc(line)}">♪ ฟังอีกครั้ง <small>1×</small></button>`;
  const lessons = [
    { sv:'Här är en krok. Hemma har jag en tavelkrok.', th:'นี่คือตะขอเบ็ด ที่บ้านฉันมีตะขอแขวนรูป · krok คือส่วนที่งอไว้เกี่ยวของ', prompt:'Vad hänger du på en tavelkrok?', meaning:'แขวนอะไรไว้บนตะขอแขวนรูป?', yes:'En tavla.', yesTh:'รูปภาพ', no:'En fisk.', noTh:'ปลา', reaction:'Ja, en tavla på väggen.', reactionTh:'ใช่ รูปภาพบนผนัง' },
    { sv:'Linan är tunn. Som en tråd när du syr.', th:'สายเบ็ดเส้นเล็ก คล้ายด้ายตอนเย็บผ้า · en lina คือสาย en tråd คือด้าย', prompt:'Vad använder du när du syr?', meaning:'ตอนเย็บผ้าเราใช้อะไร?', yes:'En tråd.', yesTh:'ด้าย', no:'En tallrik.', noTh:'จาน', reaction:'Ja. Nålen och tråden.', reactionTh:'ใช่ เข็มกับด้าย' },
    { sv:'Vi har torkad räka. Hemma kan vi ha den i maten.', th:'เรามีกุ้งแห้ง ที่บ้านเอาไปทำอาหารได้ · torkad räka คือกุ้งแห้ง', prompt:'Vilket bete vill du prova?', meaning:'อยากลองเหยื่ออะไร?', yes:'Torkad räka, tack.', yesTh:'ขอลองกุ้งแห้ง', no:'En tavelkrok, tack.', noTh:'ขอตะขอแขวนรูป', reaction:'Här får du lite torkad räka.', reactionTh:'นี่จ้า กุ้งแห้งนิดหน่อย' },
    { sv:'Vi sitter på en brygga. Vid huset finns en bänk.', th:'เรานั่งอยู่ที่ท่าน้ำ ที่บ้านมีม้านั่ง · en brygga คือท่าน้ำ en bänk คือม้านั่ง', prompt:'Vad sitter du på i trädgården?', meaning:'ในสวนเรานั่งบนอะไร?', yes:'En bänk.', yesTh:'ม้านั่ง', no:'En krok.', noTh:'ตะขอ', reaction:'Ja, på bänken. Ta en paus.', reactionTh:'ใช่ บนม้านั่ง พักสักหน่อยนะ' }
  ];
  let active;
  function speak(line) { window.SpeechEngine?.speakSwedish?.(line,1); }
  function sound(kind) {
    try {
      const ctx = window.SpeechEngine?.SoundFX?.getContext();
      if (!ctx) return;
      const settings = { splash:[130,54,.23], reel:[420,250,.033], bite:[710,1050,.15], catch:[520,810,.28], break:[230,83,.18] }[kind];
      if (!settings) return;
      const [start,end,duration] = settings;
      const osc = ctx.createOscillator(), gain = ctx.createGain(), time = ctx.currentTime;
      osc.type = kind === 'splash' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(start,time); osc.frequency.exponentialRampToValueAtTime(end,time+duration);
      gain.gain.setValueAtTime(.001,time); gain.gain.exponentialRampToValueAtTime(kind === 'reel' ? .018 : .075,time+.008);
      gain.gain.exponentialRampToValueAtTime(.001,time+duration);
      osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(time+duration+.01);
    } catch (_) { /* Water and line animations also carry the feedback. */ }
  }
  function destroy() {
    if (!active) return;
    active.events.abort(); cancelAnimationFrame(active.frame);
    D.destroy();
    active = null;
    window.SpeechEngine?.stopAudio?.();
  }
  function mount(host,options) {
    destroy();
    const s = { ...options,host,phase:'idle',events:new AbortController(),turns:0,angle:0,clock:0,lastTick:performance.now(),lastReelSound:0,lesson:0 };
    active = s;
    render(s);
    const events = { signal:s.events.signal };
    host.addEventListener('click', event => click(s,event),events);
    host.addEventListener('pointerdown', event => down(s,event),events);
    host.addEventListener('pointermove', event => move(s,event),events);
    for (const kind of ['pointerup','pointercancel','lostpointercapture']) host.addEventListener(kind,event => up(s,event),events);
    host.addEventListener('keydown',event => {
      if (s.phase!=='fight' || !event.target.matches('[data-gf-hold]') || ![' ','Enter'].includes(event.key)) return;
      event.preventDefault();
      s.keyReeling=true;
    },events);
    host.addEventListener('keyup',event => {
      if ([' ','Enter'].includes(event.key)) s.keyReeling=false;
    },events);
    window.addEventListener('blur',() => releaseInput(s),events);
    document.addEventListener('visibilitychange',() => { releaseInput(s); s.lastTick = performance.now(); },events);
    if (s.state.pending) showCatch(s);
    else if (s.state.pendingSpeech) {
      s.lastFish=C.byId[s.state.pendingSpeech];
      setPhase(s,'identified');
      talk(s,true);
    }
    s.frame = requestAnimationFrame(now => tick(s,now));
  }
  function render(s) {
    const selected = s.state.bait || 'shrimp';
    s.host.innerHTML = `<header class="gf-heading"><div><span class="fb-kicker">ท่าตกปลาสวนเบิร์ช</span><h3 tabindex="-1">Gong Heng <small lang="th">กุ้งแห้ง</small></h3></div>${button('album','▤ สมุดปลา')}</header>
      <div class="gf-scene" data-phase="idle">${A.scene()}<div class="gf-scene-caption">ลากนิ้วจากคันเบ็ดขึ้นไปทางน้ำ แล้วปล่อย</div><span class="gf-weather-note">แสงอุ่น ๆ ริมทะเลสาบ</span></div>
      <div class="gf-hud" hidden><label>สายตึง <progress class="gf-tension" max="1" value=".22" aria-label="ความตึงของสายเบ็ด"></progress></label><label>ใกล้ถึงท่า <progress class="gf-distance" max="1" value="0" aria-label="ความคืบหน้าการดึงปลา"></progress></label></div>
      <div class="gf-status" role="status" aria-live="polite">เลือกเหยื่อ แล้วตวัดนิ้วขึ้นเพื่อเหวี่ยงเบ็ดต๊ะ</div>
      <div class="gf-baits" role="group" aria-label="เลือกเหยื่อ">${C.baits.map(bait => `<button type="button" class="gf-bait" data-gf="bait" data-id="${bait.id}" aria-pressed="${bait.id===selected}">${A.bait(bait.id)}<span>${esc(bait.th)}</span><small lang="sv">${esc(bait.sv)}</small></button>`).join('')}</div>
      <div class="gf-controls"><button type="button" class="gf-crank" data-gf-crank aria-label="หมุนรอกเป็นวงกลมเพื่อเก็บสาย"><span class="gf-spool" aria-hidden="true"><i></i><b></b></span><span class="gf-crank-caption">หมุนเป็นวง</span></button>
        <div class="gf-control-buttons">${button('cast','เหวี่ยงเบ็ดให้หน่อย →')}${button('hook','ปลากินเหยื่อ · เกี่ยวเลย!','hidden data-primary')}
        <button type="button" class="gf-button" data-gf-hold hidden>กดค้างเพื่อช่วยหมุน</button>${button('reset','ผูกสายใหม่ แล้วลองอีกครั้ง','hidden')}</div></div>
      <div class="gf-catch" hidden></div><div class="gf-album" hidden></div>
      <section class="gf-dialogue"><span class="fb-kicker">มายานั่งอยู่ข้าง ๆ</span><p class="gf-dialogue-line" lang="sv"></p><p class="gf-dialogue-th"></p><div class="fb-row"><span class="gf-dialogue-replay"></span>${button('talk','คุยกับมายา')}${button('lesson','เรื่องเล่าถัดไป ↻')}</div></section><div class="gf-talk-mount" hidden><div data-gf-talk-content></div></div>`;
    s.scene = s.host.querySelector('.gf-scene');
    s.svg = s.scene.querySelector('svg');
    s.float = s.svg.querySelector('.gf-float');
    s.line = s.svg.querySelector('.gf-line');
    s.ring = s.svg.querySelector('.gf-cast-ring');
    s.shadow = s.svg.querySelector('.gf-fish-shadow');
    s.rod = s.svg.querySelector('.gf-rod');
    s.splash = s.svg.querySelector('.gf-splash');
    s.caption = s.host.querySelector('.gf-scene-caption');
    s.note = s.host.querySelector('.gf-status');
    s.tension = s.host.querySelector('.gf-tension'); s.distance = s.host.querySelector('.gf-distance');
    s.crank = s.host.querySelector('[data-gf-crank]'); s.spool = s.host.querySelector('.gf-spool');
    s.land = {x:390,y:255}; paintFloat(s,390,255);
    setLesson(s);
    setPhase(s,'idle');
  }
  function setLesson(s) {
    const lesson = lessons[s.lesson % lessons.length];
    s.host.querySelector('.gf-dialogue-line').textContent = lesson.sv;
    s.host.querySelector('.gf-dialogue-th').textContent = lesson.th;
    s.host.querySelector('.gf-dialogue-replay').innerHTML = replay(lesson.sv);
  }
  function status(s,message,tone = '') {
    if (s.note.textContent !== message) s.note.textContent = message;
    s.note.dataset.tone = tone;
  }
  function setPhase(s,phase) {
    s.phase = phase; s.scene.dataset.phase = phase; s.phaseTime = 0;
    s.host.querySelector('.gf-baits').hidden = !['idle','retry'].includes(phase);
    s.host.querySelector('.gf-hud').hidden = phase !== 'fight';
    s.host.querySelector('[data-gf="cast"]').hidden = phase !== 'idle';
    s.host.querySelector('[data-gf="hook"]').hidden = phase !== 'bite';
    s.host.querySelector('[data-gf="reset"]').hidden = phase !== 'retry';
    s.host.querySelector('[data-gf-hold]').hidden = phase !== 'fight';
    s.crank.disabled = phase !== 'fight';
    s.crank.setAttribute('aria-disabled',String(phase !== 'fight'));
    s.host.querySelector('.gf-controls').hidden = ['catch','identified'].includes(phase);
    s.host.querySelectorAll('[data-gf="talk"],[data-gf="lesson"]').forEach(b => { b.disabled = !['idle','identified'].includes(phase); });
    const captions = { idle:'ตวัดนิ้วขึ้นจากคันเบ็ดเพื่อเหวี่ยงสาย', aiming:'ปล่อยนิ้วเพื่อเหวี่ยงเบ็ด', casting:'เหวี่ยงสายไปบนผิวน้ำ', wait:'ดูทุ่นกระดุกกระดิก แล้วเกี่ยวปลา', bite:'ทุ่นจมแล้ว! แตะเกี่ยวปลา หรือยกคันเบ็ดขึ้น', fight:'หมุนรอกตอนปลาสงบ · หยุดเมื่อปลาดึงแรง', retry:'สายขาด แต่ลองใหม่ที่เดิมได้เลย', catch:'ได้ปลามาแล้ว มาดูชื่อกัน', identified:'อีกหนึ่งคำในสมุดปลาของเรา' };
    s.caption.textContent = captions[phase] || '';
  }
  function normalize(s,event) {
    const rect = s.svg.getBoundingClientRect();
    return {x:(event.clientX-rect.left)/rect.width,y:(event.clientY-rect.top)/rect.height};
  }
  function down(s,event) {
    if (s.pointer || event.button !== 0 || s.talking) return;
    const crank = event.target.closest('[data-gf-crank]'), hold = event.target.closest('[data-gf-hold]');
    if (s.phase === 'fight' && (crank || hold)) {
      const target = crank || hold;
      s.pointer = {id:event.pointerId,kind:hold ? 'hold' : 'reel',target,angle:null,rect:target.getBoundingClientRect()};
      target.setPointerCapture(event.pointerId); target.classList.add('is-held');
      if (crank) reel(s,event);
      return;
    }
    if (!event.target.closest('.gf-scene') || !['idle','bite'].includes(s.phase)) return;
    s.pointer = {id:event.pointerId,kind:s.phase==='bite'?'hook':'cast',start:normalize(s,event),target:s.svg};
    s.svg.setPointerCapture(event.pointerId);
  }
  function move(s,event) {
    const pointer = s.pointer;
    if (pointer?.id !== event.pointerId) return;
    if (pointer.kind === 'reel') { reel(s,event); return; }
    if (pointer.kind !== 'cast') return;
    const cast = C.cast(pointer.start,normalize(s,event));
    if (!cast.valid) return;
    setPhase(s,'aiming');
    const land = lakePoint(cast);
    s.ring.setAttribute('cx',land.x); s.ring.setAttribute('cy',land.y); s.ring.setAttribute('opacity','.9');
    s.caption.textContent = `ปล่อยเพื่อเหวี่ยง · แรง ${Math.round(cast.power*100)}%`;
    s.rod?.setAttribute('transform',`rotate(${-cast.power*5} 112 448)`);
  }
  function reel(s,event) {
    const p = s.pointer, r = p.rect;
    const dx = event.clientX-r.left-r.width/2, dy = event.clientY-r.top-r.height/2;
    if (Math.hypot(dx,dy) < r.width*.12) { p.angle=null; return; }
    const angle = Math.atan2(dy,dx);
    if (p.angle !== null) {
      const delta = C.angleDelta(p.angle,angle);
      if (Math.abs(delta) <= Math.PI/2) s.turns += Math.abs(delta)/(2*Math.PI);
      s.angle += delta*180/Math.PI;
      s.spool.style.transform = `rotate(${s.angle}deg)`;
    }
    p.angle=angle;
  }
  function up(s,event) {
    const p=s.pointer;
    if (p?.id !== event.pointerId) return;
    const completed=event.type==='pointerup';
    releaseInput(s);
    if (p.kind==='cast') {
      const cast=completed?C.cast(p.start,normalize(s,event)):null;
      if (cast?.valid) castLine(s,cast);
      else { setPhase(s,'idle'); status(s,'ลองลากจากตัวเราไปทางน้ำให้ยาวขึ้นนิด แล้วปล่อย'); }
    }
    if (p.kind==='hook' && completed && p.start.y-normalize(s,event).y>.025) hook(s);
  }
  function releaseInput(s) {
    s.pointer?.target?.classList.remove('is-held');
    s.pointer=null; s.turns=0;
    s.keyReeling=false;
    if (s.phase==='aiming') {
      setPhase(s,'idle');
      s.rod?.removeAttribute('transform');
      s.ring.setAttribute('opacity','0');
    }
  }
  function lakePoint(cast) { return {x:Math.max(85,Math.min(550,cast.x*600)),y:180+(1-cast.distance)*116}; }
  function castLine(s,cast) {
    s.cast=cast; s.land=lakePoint(cast); s.fishId=C.chooseFish(s.state,s.state.bait||'shrimp',cast);
    setPhase(s,'casting'); s.ring.setAttribute('opacity','0');
    s.rod?.removeAttribute('transform');
    s.splash.setAttribute('transform',`translate(${s.land.x} ${s.land.y})`);
    s.scene.classList.remove('is-splash');
    status(s,'เหยื่อตกน้ำแล้วนั่งรอสักนิด ดูทุ่นจ้า');
    window.SpeechEngine?.stopAudio?.();
    sound('reel');
  }
  function hook(s) {
    if (s.phase!=='bite') return;
    s.fight=C.createFight(s.fishId,s.cast.distance); s.turns=0; s.surgeState='';
    setPhase(s,'fight'); sound('splash');
    status(s,'ปลาติดเบ็ดแล้ว! หมุนนิ้วเป็นวงที่รอก พักเมื่อแถบสายเริ่มแดง','good');
    speak('Veva lugnt.');
  }
  function paintFloat(s,x,y) {
    s.float.setAttribute('transform',`translate(${x} ${y})`);
    s.line.setAttribute('d',`M172 262Q${(172+x)/2} ${Math.min(y,262)-12} ${x} ${y}`);
    s.ring.setAttribute('cx',x); s.ring.setAttribute('cy',y+3);
  }
  function tick(s,now) {
    if (active!==s) return;
    const dt=Math.min(.06,Math.max(0,(now-s.lastTick)/1000));
    s.lastTick=now;
    if (!document.hidden && !s.talking) {
      s.clock+=dt; s.phaseTime+=dt;
      if (s.phase==='casting') {
        const t=Math.min(1,s.phaseTime/.72);
        paintFloat(s,172+(s.land.x-172)*t,262+(s.land.y-262)*t-105*Math.sin(Math.PI*t));
        s.rod?.setAttribute('transform',`rotate(${Math.sin(t*Math.PI)*5} 112 448)`);
        if (t===1) { setPhase(s,'wait'); s.scene.classList.add('is-splash'); sound('splash'); }
      } else if (s.phase==='wait') {
        paintFloat(s,s.land.x+Math.sin(s.clock*1.1)*2,s.land.y+Math.sin(s.clock*2.5)*1.5);
        if (s.phaseTime>2.6) { setPhase(s,'bite'); sound('bite'); status(s,'ทุ่นจม! แตะเกี่ยวปลา หรือยกนิ้วขึ้นในภาพ','good'); }
      } else if (s.phase==='bite') {
        paintFloat(s,s.land.x+Math.sin(s.clock*15)*3,s.land.y+Math.sin(s.clock*9)*4+9);
        if (s.phaseTime>7) { setPhase(s,'wait'); status(s,'ปลาปล่อยเหยื่อไปนิด รอให้ทุ่นจมอีกครั้งได้จ้า'); }
      } else if (s.phase==='fight') fightTick(s,dt,now);
    }
    s.frame=requestAnimationFrame(time=>tick(s,time));
  }
  function fightTick(s,dt,now) {
    const assisted=s.pointer?.kind==='hold'||s.keyReeling;
    const turns=s.turns+(assisted?dt*.95:0); s.turns=0;
    const phase=C.tickFight(s.fight,turns,dt);
    if (assisted) { s.angle+=dt*290; s.spool.style.transform=`rotate(${s.angle}deg)`; }
    s.tension.value=s.fight.tension; s.distance.value=s.fight.progress;
    s.tension.dataset.risk=s.fight.tension>.76?'high':s.fight.tension>.55?'medium':'low';
    const mood=s.fight.surge?'surge':s.fight.warning?'warning':'calm';
    s.scene.dataset.mood=mood; s.host.querySelector('.gf-hud').dataset.mood=mood;
    if (mood!==s.surgeState) {
      s.surgeState=mood;
      const notes={calm:'ปลาสงบแล้ว หมุนช้า ๆ เป็นวงต่อได้จ้า',warning:'ปลากำลังจะดึงแรง เตรียมหยุดหมุน',surge:'ปลากระชาก! พักนิ้ว ปล่อยให้สายคลายก่อน'};
      status(s,notes[mood],mood==='surge'?'retry':'');
      if (mood==='surge') { sound('splash'); speak('Släpp lite lina.'); }
    }
    if (turns>.005 && now-s.lastReelSound>170) { sound('reel'); s.lastReelSound=now; }
    const factor=1-s.fight.progress;
    const x=210+(s.land.x-210)*factor+Math.sin(s.clock*(s.fight.surge?12:3))*factor*9;
    const y=344+(s.land.y-344)*factor;
    paintFloat(s,x,y);
    s.shadow.setAttribute('transform',`translate(${x+13} ${y+12}) scale(${.6+factor*.65})`);
    s.line.style.stroke=s.fight.tension>.76?'#c16d45':'#eee3b9';
    if (phase==='broken') {
      releaseInput(s); setPhase(s,'retry'); sound('break');
      status(s,'สายขาดแล้ว ลองผูกใหม่และพักตอนปลากระชากได้เลย เหยื่อยังมีจ้า','retry');
    } else if (phase==='caught') {
      releaseInput(s); C.startCatch(s.state,s.fishId); s.save(); s.onPractice(); sound('catch'); showCatch(s);
    }
  }
  function showCatch(s) {
    const fish=C.byId[s.state.pending];
    if (!fish) return;
    setPhase(s,'catch');
    s.host.querySelector('.gf-catch').hidden=false;
    const alternatives=[fish,...C.fish.filter(item=>item.id!==fish.id).slice((C.fish.indexOf(fish)+1)%5,(C.fish.indexOf(fish)+1)%5+2)];
    const sorted=alternatives.sort((a,b)=>a.name.localeCompare(b.name,'sv'));
    s.host.querySelector('.gf-catch').innerHTML=`<div class="gf-catch-art">${A.fish(fish.id)}</div><div class="gf-catch-question"><span class="fb-kicker">ฟังชื่อแล้วหาคำที่ตรงกัน</span><h4>ปลานี้ชื่ออะไรในภาษาสวีเดน?</h4>${replay(fish.sv)}<div class="gf-answer-options">${sorted.map(item=>button('identify',`<span lang="sv">${esc(item.sv)}</span>`,`data-id="${item.id}"`)).join('')}</div><p class="gf-catch-feedback" role="status" aria-live="polite"></p>${button('fish-hint','ดูชื่อปลาและคำแปล')}</div>`;
    status(s,'ได้ปลาแล้ว ฟังชื่อแล้วเลือกคำให้ตรง จะเก็บลงสมุดให้จ้า','good');
    speak(fish.sv);
    s.host.querySelector('.gf-catch').scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function identify(s,id) {
    if (s.phase!=='catch') return;
    const fish=C.byId[s.state.pending];
    const reward=C.answerCatch(s.state,id,window.LearningProgress.today());
    if (!reward.correct) {
      s.host.querySelector('.gf-catch-feedback').textContent='ยังไม่ใช่จ้า ฟังอีกครั้งหรือเปิดคำใบ้ได้เลย';
      speak(fish.sv); return;
    }
    const xp=reward.xp?window.GameEngine.StateManager.addXP(reward.xp,{source:'game',allowBooster:false}):0;
    s.save(); s.onPractice(); s.lastFish=fish;
    setPhase(s,'identified'); sound('catch');
    s.host.querySelector('.gf-catch-question').innerHTML=`<span class="fb-kicker">${reward.newFish?'ปลาใหม่ในสมุดของเรา':'ได้ทบทวนคำนี้อีกครั้ง'}</span><h4 lang="sv">${esc(fish.sv)}</h4><p>${esc(fish.th)}</p><p lang="sv">${esc(fish.sentence)}</p><p>${esc(fish.sentenceTh)}</p>${replay(fish.sentence)}<p class="gf-catch-feedback">บันทึกแล้ว${xp?` · +${xp} XP`:''}</p>${button('again','ปล่อยปลาคืนแล้วตกต่อ →','data-primary')}`;
    status(s,'เก็บชื่อปลาไว้แล้ว ปล่อยกลับน้ำแล้วลองเหยื่ออีกแบบได้จ้า','good');
    speak(fish.sentence);
  }
  function again(s) {
    if (s.state.pendingSpeech) { talk(s,true); return; }
    s.host.querySelector('.gf-catch').hidden=true;
    s.host.querySelector('.gf-album').hidden=true;
    s.scene.classList.remove('is-splash'); s.scene.dataset.mood=''; s.line.style.stroke='';
    paintFloat(s,390,255); setPhase(s,'idle');
    status(s,'ปลาว่ายกลับไปแล้ว เลือกเหยื่อแล้วตวัดนิ้วขึ้นได้จ้า');
  }
  function talk(s,voice=false) {
    if (s.talking || !['idle','identified'].includes(s.phase)) return;
    releaseInput(s); s.talking=true;
    const wrapper=s.host.querySelector('.gf-talk-mount');
    const host=wrapper.querySelector('[data-gf-talk-content]');
    wrapper.hidden=false;
    const lesson=lessons[s.lesson%lessons.length];
    const turns=voice&&s.lastFish?[{line:'Vad fick du?',meaning:'เมื่อกี้ได้ปลาอะไร?',say:`Jag fick ${s.lastFish.sv}.`,sayTh:`ฉันได้${s.lastFish.th}`,
      word:s.lastFish.name,wordTh:s.lastFish.th,reaction:'Vad fint! Nu simmar den igen.',reactionTh:'ดีจัง ตอนนี้มันกลับไปว่ายน้ำแล้ว'}]:[{line:lesson.prompt,meaning:lesson.meaning,
      replies:[D.reply(lesson.no,lesson.noTh,'Lyssna en gång till.','ลองฟังอีกครั้งนะ'),D.reply(lesson.yes,lesson.yesTh,lesson.reaction,lesson.reactionTh)],wrong:0}];
    D.start(host,{label:'คุยง่าย ๆ ริมน้ำ',guest:D.guests[0],portrait:'<span class="gf-maya" aria-hidden="true">👩🏻‍🌾</span>',turns,
      onDone(){
        s.talking=false;
        wrapper.hidden=true;
        if (voice) C.finishSpeech(s.state);
        s.onPractice();
        if (voice) again(s);
      },
      onWordFallback(){status(s,'ไม่เป็นไร ฝึกคำเดียวก่อนแล้วตกปลาต่อได้จ้า');}});
    wrapper.scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function click(s,event) {
    const target=event.target.closest('[data-gf]');
    if (!target || target.disabled || s.talking) return;
    const {gf,id,line}=target.dataset;
    switch (gf) {
      case 'listen': speak(line); break;
      case 'bait': {
        const bait=C.baits.find(item=>item.id===id);
        if (!bait || !['idle','retry'].includes(s.phase)) return;
        s.state.bait=id;
        s.save();
        s.host.querySelectorAll('.gf-bait').forEach(item=>item.setAttribute('aria-pressed',String(item===target)));
        speak(bait.line);
        status(s,bait.meaning);
        break;
      }
      case 'cast':
        if (s.phase==='idle') castLine(s,C.cast({x:.35,y:.86},{x:.64,y:.32}));
        break;
      case 'hook': hook(s); break;
      case 'reset':
        s.fight=null;
        s.scene.dataset.mood='';
        s.line.style.stroke='';
        setPhase(s,'idle');
        paintFloat(s,390,255);
        status(s,'ผูกสายใหม่แล้ว ลองค่อย ๆ หมุนและพักตอนปลากระชาก');
        break;
      case 'identify': identify(s,id); break;
      case 'fish-hint': {
        const fish=C.byId[s.state.pending];
        if (!fish) return;
        s.host.querySelector('.gf-catch-feedback').textContent=`${fish.sv} · ${fish.th}`;
        speak(fish.sv);
        break;
      }
      case 'again': again(s); break;
      case 'lesson':
        s.lesson++;
        setLesson(s);
        speak(lessons[s.lesson%lessons.length].sv);
        break;
      case 'talk': talk(s); break;
      case 'album': showAlbum(s); break;
    }
  }
  function showAlbum(s) {
    const album=s.host.querySelector('.gf-album');
    album.hidden=!album.hidden;
    const discovered=C.fish.filter(f=>s.state.album?.[f.id]).length;
    album.innerHTML=`<h4>สมุดปลาของเรา · ${discovered} / ${C.fish.length}</h4><div>${C.fish.map(f=>`<article class="${s.state.album?.[f.id]?'':'is-undiscovered'}">${A.fish(f.id)}<strong lang="sv">${esc(f.sv)}</strong><small>${esc(f.th)}</small>${replay(f.sv)}</article>`).join('')}</div>`;
  }
  window.FarmFishing={mount,destroy};
})();

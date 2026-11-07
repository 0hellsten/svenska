/* Measuring school and recipe workbench, hosted inside the existing kitchen dialog. */
(function () {
  'use strict';
  const C=window.KitchenMeasureCore, P=window.LearningProgress, A=window.MiniGameArt;
  const KEY='wilawan_kitchen_measures_v1';
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  let host,config,state,tasks,lesson,abort,revealed=false,bookOpen=false,note='',tone='',wrongAnswer=null;
  const $=selector=>host?.querySelector(selector);
  function readRuns(){try{const parsed=JSON.parse(localStorage.getItem(KEY));return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}catch(_){return{};}}
  function save(){if(!state||!config)return;const runs=readRuns();runs[config.mission]=state;try{localStorage.setItem(KEY,JSON.stringify(runs));}catch(_){} }
  function discard(){const runs=readRuns();delete runs[config.mission];try{localStorage.setItem(KEY,JSON.stringify(runs));}catch(_){} }
  function destroy(){save();abort?.abort();abort=null;host=null;config=null;state=null;}
  function sound(id){window.SpeechEngine?.playSound?.(id);}
  function speak(text){window.SpeechEngine?.speakSwedish?.(text,1);}
  function referenceHTML(){return `<details class="km-reference" ${bookOpen?'open':''}><summary>สมุดตวงวัด · เปิดดูได้ทุกเมื่อ</summary><div class="km-reference-body"><h4>ปริมาตร · <span lang="sv">volym</span></h4><div class="km-ladder" lang="sv"><strong>1 l</strong><span>= 10 dl</span><span>= 100 cl</span><span>= 1 000 ml</span></div><p lang="sv">1 msk = 3 tsk = 15 ml<br>1 tsk = 5 krm = 5 ml · 1 krm = 1 ml</p><h4>น้ำหนัก · <span lang="sv">vikt</span></h4><div class="km-ladder" lang="sv"><strong>1 kg</strong><span>= 10 hg</span><span>= 1 000 g</span></div><p lang="sv">1 g = 1 000 mg</p><div class="km-unit-glossary">${[...C.units,...C.recipeTerms].map(u=>`<button type="button" data-action="word" data-word="${u.sv}" aria-label="ฟังคำว่า ${u.sv}"><strong lang="sv">${u.id} · ${u.sv}</strong><span>${u.th}</span></button>`).join('')}</div><p><strong>จำให้แม่นจ้า:</strong> ml กับ g เป็นคนละชนิดของหน่วย ห้ามแปลงแทนกันอัตโนมัติ แป้งกับน้ำปริมาตรเท่ากันอาจหนักต่างกัน ใช้ช้อนตวงมาตรฐานและปาดเสมอขอบเมื่อสูตรไม่ได้ระบุให้พูน</p><p>½ = 0,5 · ¼ = 0,25 · ¾ = 0,75<br><span lang="sv">halvera</span> = ครึ่งหนึ่ง · <span lang="sv">dubbla</span> = สองเท่า</p><p lang="sv">1 h = 60 min · 1 cm = 10 mm</p><p>เวลา อุณหภูมิ และขนาดพิมพ์เป็นคนละเรื่องกับน้ำหนักและปริมาตร</p><p class="km-sources">ตารางอ้างอิงหน่วยสวีเดน: <a href="https://www.arla.se/recept/mattomvandlare/" target="_blank" rel="noopener noreferrer">Arla</a> · <a href="https://www.ica.se/artikel/omvandlingstabell/" target="_blank" rel="noopener noreferrer">ICA</a></p></div></details>`;}
  function resumable(mission,items){return !!C.restore(readRuns()[mission],mission,items);}
  function mount(options){
    destroy();config=options;host=options.host;tasks=options.tasks;lesson=options.lesson;
    state=C.restore(readRuns()[options.mission],options.mission,tasks)||C.create(options.mission,tasks);
    revealed=false;bookOpen=false;note='';tone='';wrongAnswer=null;
    abort=new AbortController();host.addEventListener('click',click,{signal:abort.signal});
    host.addEventListener('toggle',event=>{if(event.target.matches('.km-reference'))bookOpen=event.target.open;},{signal:abort.signal,capture:true});
    render();host.scrollTop=0;save(); if(tasks[state.index].listen&&!state.solved)speak(tasks[state.index].speech);
  }
  function jar(value,capacity){
    const level=Math.min(1,value/capacity), top=166-level*118;
    return `<svg class="km-instrument" viewBox="0 0 260 200" fill="none" stroke="#8d8a72" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><defs><clipPath id="km-jar-clip"><path d="M47 31h148l-9 126q-2 20-18 20H76q-18 0-20-20z"/></clipPath></defs><ellipse cx="128" cy="183" rx="98" ry="8" fill="#dedfcd" stroke="none"/><path d="M179 37h27q22 6 16 40-5 26-31 25" stroke="#a6b5a8" stroke-width="9"/><path d="M47 31h148l-9 126q-2 20-18 20H76q-18 0-20-20z" fill="#f2f5e9"/><g clip-path="url(#km-jar-clip)">${value>0?`<path d="M45 ${top}q80-9 160 0v140H45z" fill="#b5d2c0" stroke="#91b9a2"/>`:''}</g><path d="M47 31h148l-9 126q-2 20-18 20H76q-18 0-20-20z"/><path d="M48 31l-13-8m160 8 7-7"/><g stroke="#879982">${[0,1,2,3,4].map(i=>`<path d="M72 ${166-i*27}h20"/>`).join('')}</g><text x="104" y="102" fill="#536b56" stroke="none" font-size="20" font-family="sans-serif">${C.format(value)} ml</text><text x="104" y="126" fill="#68836c" stroke="none" font-size="12" font-family="sans-serif">${C.format(value/100)} dl</text></svg>`;
  }
  function scale(value,tared){const display=value+(tared?0:180);return `<svg class="km-instrument" viewBox="0 0 260 200" fill="none" stroke="#8c8671" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="130" cy="185" rx="99" ry="7" fill="#dedfcd" stroke="none"/><path d="M45 96h170l16 70q1 13-13 13H43q-14 0-13-13z" fill="#b8cbb8"/><path d="M54 96h152" stroke-width="5"/><path d="M65 38h130q-3 51-33 55H98Q69 89 65 38z" fill="#f5edda"/><ellipse cx="130" cy="38" rx="65" ry="13" fill="#eee4cd"/><rect x="67" y="120" width="128" height="38" rx="7" fill="#f5f5dc"/><text x="130" y="146" text-anchor="middle" stroke="none" fill="#4f6953" font-size="23" font-family="monospace">${C.format(display)} g</text><circle cx="47" cy="145" r="6" fill="${tared?'#739473':'#d4ad75'}"/></svg>`;}
  function countArt(value){return `<div class="km-count-art" aria-label="จำนวนที่ใส่แล้ว ${C.format(value)} ชิ้น">${Array.from({length:Math.min(12,Math.ceil(value))},(_,i)=>`<span style="opacity:${i<Math.floor(value)?1:.5}">${A.icon(tasks[state.index].ingredient||'egg')}</span>`).join('')||'<span class="km-empty-count">ยังไม่มีของ</span>'}</div>`;}
  function workbench(task){
    const dim=C.byId[task.unit].dimension, base=dim==='volume'?'ml':dim==='mass'?'g':'st';
    const display=state.amount+(task.tare&&!state.tared?180:0);
    return `<div class="km-workbench"><div class="km-instrument-art">${dim==='volume'?jar(state.amount,task.capacity):dim==='mass'?scale(state.amount,!task.tare||state.tared):countArt(state.amount)}</div><div class="km-live-reading" role="status" aria-live="polite"><strong lang="sv">${C.quantity(display,base)}</strong><span>${dim==='mass'&&task.tare&&!state.tared?'ตอนนี้รวมน้ำหนักชามเปล่า 180 g · กดศูนย์ก่อนนะ':dim==='volume'?`${C.quantity(state.amount/100,'dl')} · ${C.quantity(state.amount/1000,'l')}`:'จำนวนวัตถุดิบที่เตรียมไว้'}</span></div>${task.tare?`<button type="button" class="km-tare" data-km="tare" ${state.solved?'disabled':''}><span lang="sv">tara / nollställ</span> · ${state.tared?'ตั้งศูนย์แล้ว ✓':'กดศูนย์เมื่อชามยังว่าง'}</button>`:''}<div class="km-pour-controls"><label>จำนวนต่อครั้ง<input id="km-amount" type="text" inputmode="decimal" value="1" autocomplete="off" aria-label="จำนวนที่ต้องการเพิ่มต่อครั้ง"></label><label>หน่วย<select id="km-unit" aria-label="หน่วยที่ใช้ตวงหรือชั่ง">${task.allowed.map(id=>`<option value="${id}">${id} · ${C.byId[id].sv}</option>`).join('')}</select></label></div><div class="km-fractions" aria-label="เลือกจำนวนที่ใช้บ่อย">${[.25,.5,1,2,5,25,50,100].map(v=>`<button type="button" data-km="quick" data-value="${v}" ${state.solved?'disabled':''}>${v===.25?'¼':v===.5?'½':v}</button>`).join('')}</div><div class="km-bench-actions"><button type="button" class="mg-secondary" data-km="reset" ${state.solved?'disabled':''}>เทออก / เอาออกใหม่</button><button type="button" class="mg-primary" data-km="add" ${state.solved?'disabled':''}>${dim==='mass'?'ใส่บนเครื่องชั่ง':dim==='count'?'เพิ่มจำนวน':'เทลงถ้วย'} +</button></div><button type="button" class="mg-primary km-check" data-km="check" ${state.solved?'disabled':''}>ตรวจปริมาณ →</button></div>`;
  }
  function choices(task){
    // Stable per question, so retrying never moves the answers under a finger.
    let seed=[...state.runId+task.id].reduce((n,ch)=>(Math.imul(n,31)+ch.charCodeAt(0))>>>0,7);
    const ordered=task.choices.slice();for(let i=ordered.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[ordered[i],ordered[j]]=[ordered[j],ordered[i]];}
    return `<div class="km-choices">${ordered.map(c=>`<button type="button" data-km="answer" data-answer="${c.id}" lang="${c.lang}" class="${state.solved&&c.id===task.answer?'km-correct':''} ${!state.solved&&c.id===wrongAnswer?'km-wrong':''}" ${state.solved?'disabled':''}>${esc(c.label)}</button>`).join('')}</div>`;
  }
  function render(){
    const task=tasks[state.index];if(!task)return;
    const hidden=task.listen&&!revealed&&!state.solved;
    host.className='mg-game-content km-course';
    host.innerHTML=`<div class="mg-game-progress"><span>${lesson.th}</span><div class="mg-progress-track" role="progressbar" aria-label="ความคืบหน้าบทตวงวัด" aria-valuemin="0" aria-valuemax="${tasks.length}" aria-valuenow="${state.index+(state.solved?1:0)}"><div class="mg-progress-fill" style="width:${100*(state.index+(state.solved?1:0))/tasks.length}%"></div></div><span>${state.index+1} / ${tasks.length}</span></div><div class="km-lesson"><div class="km-chapter-note"><span class="mg-eyebrow">${config.recipe?'ตวงก่อนผสม · สูตรฝึกภาษา':'โรงเรียนตวงวัดของวิลาวัน'}</span><h3>${lesson.th}</h3>${state.index===0?`<p>${lesson.intro}</p><div class="km-facts">${lesson.facts.map(f=>`<span>${esc(f)}</span>`).join('')}</div>`:''}</div><div class="km-task"><p class="km-prompt">${task.prompt}</p>${task.ingredient?`<div class="km-ingredient-thumb">${A.icon(task.ingredient)}</div>`:''}<strong class="km-target" lang="${hidden||/[ก-๿]/.test(task.clue||task.target)?'th':'sv'}">${hidden?'ฟังคำสั่งจากปุ่มเสียง':esc(task.clue||task.target)}</strong><div class="km-audio"><button type="button" class="mg-replay" data-km="speak">♪ ฟังอีกครั้ง <small>1×</small></button>${task.listen?`<button type="button" class="mg-secondary" data-km="reveal">${revealed?'ซ่อนข้อความช่วย':'ดูข้อความช่วย'}</button>`:''}</div>${task.type==='choice'?choices(task):workbench(task)}</div><div id="km-feedback" class="km-feedback" data-tone="${tone}" role="status" aria-live="polite">${state.solved?`<strong>ถูกต้องแล้ว เก่งจังฮู้! ✓</strong><p>${esc(task.explanation)}</p>${task.listen?`<p lang="sv">${esc(task.target)} · ${esc(task.speech)}</p>`:''}`:esc(note||'ค่อย ๆ ลองได้จ้า เปิดสมุดช่วย หรือฟังซ้ำได้เสมอ')}</div>${state.solved?`<button type="button" class="mg-primary km-next" data-km="next">${state.index===tasks.length-1?'จบบทแล้วเก็บคำศัพท์':'ข้อต่อไป'} →</button>`:''}${referenceHTML()}<button type="button" class="km-back" data-km="back">บันทึกไว้ แล้วกลับไปเลือกบท</button></div>`;
  }
  function feedback(message,type='retry'){note=message;tone=type;const el=$('#km-feedback');if(el){el.textContent=message;el.dataset.tone=type;}}
  function click(event){
    const button=event.target.closest('[data-km]');if(!button||button.disabled)return;
    const action=button.dataset.km,task=tasks[state.index];
    if(action==='back'){save();config.onBack();return;}
    if(action==='speak'){speak(task.speech);return;}
    if(action==='reveal'){revealed=!revealed;state.assisted=true;save();render();return;}
    if(action==='quick'){const input=$('#km-amount');if(input)input.value=C.format(+button.dataset.value);return;}
    if(action==='add'){
      if(task.tare&&!state.tared){feedback('วางชามเปล่าแล้วกด tara / nollställ ให้เป็น 0 g ก่อนเติมนะ');return;}
      const raw=$('#km-amount').value.trim(), value=/^\d+(?:[.,]\d+)?$/.test(raw)?Number(raw.replace(',','.')):NaN, id=$('#km-unit').value;
      if(!Number.isFinite(value)||value<=0||value>1000){feedback('ใส่จำนวนมากกว่า 0 ถึง 1 000 เช่น 0,5 หรือ 25 ใช้คอมม่าหรือจุดทศนิยมก็ได้');return;}
      const dim=C.byId[task.unit].dimension,base=dim==='volume'?'ml':dim==='mass'?'g':'st';
      if(state.amount+C.convert(value,id,base)>Math.max(task.capacity*2,task.value*C.byId[task.unit].factor*2)){feedback('เกินความจุของอุปกรณ์ในเกม ลองเทออกแล้วใช้หน่วยหรือจำนวนน้อยลงนะ');return;}
      C.add(state,task,value,id);note='เพิ่มแล้วจ้า ดูขีดตวงหรือจอเครื่องชั่ง แล้วตรวจเมื่อพร้อม';tone='';save();render();$('#km-amount').value=raw;$('#km-unit').value=id;return;
    }
    if(action==='reset'){state.amount=0;note='เอาวัตถุดิบออกแล้ว ตั้งปริมาณใหม่ได้เลยจ้า';tone='';save();render();return;}
    if(action==='tare'){
      if(state.amount>0){feedback('ก่อนตั้งศูนย์ ชามต้องยังไม่มีวัตถุดิบ กด “เทออก / เอาออกใหม่” ก่อนนะ');return;}
      C.tare(state);note='เครื่องชั่งเป็น 0 g แล้ว น้ำหนักที่เพิ่มต่อจากนี้เป็นวัตถุดิบอย่างเดียว';tone='correct';save();render();return;
    }
    if(action==='check'||action==='answer'){
      const result=C.check(state,task,button.dataset.answer);save();
      if(result==='tare'){feedback('ยังไม่ได้หักน้ำหนักชาม กด tara / nollställ ตอนชามว่างก่อนนะ');return;}
      if(result==='retry'){
        sound('retry');wrongAnswer=button.dataset.answer;note=task.type==='choice'?'ยังไม่ใช่จ้า ลองอ่านความหมายของหน่วย หรือเปิดสมุดตวงวัดก่อนเลือกใหม่':`ปริมาณยังไม่ตรงจ้า เช็กทั้งจำนวนและหน่วย ${task.clue?'ลองใช้ครึ่งหนึ่งหรือสองเท่าตามโจทย์':'เปิดสมุดดูการเปลี่ยนหน่วยได้เสมอ'}`;tone='retry';
        if(task.type==='choice')render();else feedback(note);return;
      }
      if(result==='correct'){sound('correct');wrongAnswer=null;note='';tone='correct';render();$('.km-next')?.focus({preventScroll:true});}
      return;
    }
    if(action==='next'){
      if(!state.solved)return;
      const more=C.next(state,tasks);revealed=false;note='';tone='';wrongAnswer=null;
      if(!more){finish();return;}
      save();render();host.scrollTop=0;$('.km-target')?.setAttribute('tabindex','-1');$('.km-target')?.focus({preventScroll:true});if(tasks[state.index].listen)speak(tasks[state.index].speech);
    }
  }
  function finish(){
    const reward=P.complete(window.GameEngine.StateManager,config.mission,state.runId,tasks.length/(tasks.length+state.mistakes));discard();
    const vocabulary=lesson.id==='recipe-signs'?C.recipeTerms:config.recipe?[...new Set(tasks.map(t=>t.unit))].map(id=>C.byId[id]):C.units.filter(u=>lesson.tasks.some(t=>(t.target||'').includes(u.id)||t.unit===u.id));
    host.innerHTML=`<div class="mg-result km-result"><span class="mg-result-stamp">ฝึกตวงวัดครบ ${tasks.length} ข้อแล้ว ✓</span><div class="km-result-seal">${config.recipe?A.recipe(config.recipe.id):scale(0,true)}</div><h3>${config.recipe?'เตรียมวัตถุดิบครบแล้วจ้า!':'ตวงเป็น ชั่งเป็น เข้าใจคำสวีเดนเพิ่มแล้ว!'}</h3><p>${config.recipe?'เราเตรียมปริมาณตามสูตรฝึกภาษาครบแล้ว ลองพูดจำนวนกับชื่อหน่วยซ้ำอีกครั้งนะ':'กลับมาใช้ความรู้ในขั้นที่ 4 ของแต่ละสูตรได้เลย จะได้ฝึกทั้งภาษาและการใช้ปริมาณจริงในเกม'}</p><div class="mg-result-reward">+${reward.xp} XP${reward.gems?` · +${reward.gems} เพชร`:''}<small>${reward.message}</small></div><div class="km-unit-glossary">${vocabulary.map(u=>`<button type="button" data-action="word" data-word="${u.sv}"><strong lang="sv">${u.id} · ${u.sv}</strong><span>${u.th}</span></button>`).join('')}</div><div class="mg-result-actions"><button type="button" class="mg-primary" data-km-result="next">${lesson.id===C.lessons.at(-1).id?'ไปใช้ในสูตรขนม →':'เลือกภารกิจถัดไป →'}</button><button type="button" class="mg-secondary" data-km-result="back">กลับไปเลือกบท</button></div></div>`;
    const onNext=config.onNext,onBack=config.onBack;abort.abort();host.addEventListener('click',e=>{const button=e.target.closest('[data-km-result]');if(button){state=null;if(button.dataset.kmResult==='next')onNext();else onBack();}},{signal:(abort=new AbortController()).signal});
    state=null;sound('fanfare');host.scrollTop=0;config.onComplete();$('.mg-result h3')?.setAttribute('tabindex','-1');$('.mg-result h3')?.focus({preventScroll:true});
  }
  window.KitchenMeasures={mount,destroy,referenceHTML,resumable};
})();

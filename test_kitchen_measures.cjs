'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const M=require('./kitchen_measures_core.js'),K=require('./mini_games_core.js'),P=require('./learning_progress.js');
test('Standard Swedish kitchen volume and weight relationships are exact',()=>{
  for(const [n,a,b,expected] of [[1,'l','dl',10],[1,'l','ml',1000],[1,'cl','ml',10],[1,'dl','ml',100],[1,'msk','tsk',3],[1,'tsk','krm',5],[1,'krm','ml',1],[1,'kg','g',1000],[1,'kg','hg',10],[1,'hg','g',100],[1,'g','mg',1000],[.5,'tsk','ml',2.5],[.5,'msk','ml',7.5],[.25,'kg','g',250],[2.5,'hg','g',250]])assert.equal(M.convert(n,a,b),expected,`${n} ${a} → ${b}`);
});
test('Volume, mass and counts cannot be silently interchanged; invalid inputs are rejected',()=>{
  for(const [from,to]of[['ml','g'],['dl','g'],['g','st'],['st','dl'],['__proto__','g'],['g','unknown']])assert.throws(()=>M.convert(1,from,to));
  for(const n of[NaN,Infinity,-1])assert.throws(()=>M.convert(n,'g','kg'));
  assert.equal(M.convert(0,'g','kg'),0);
});
test('Ten eight-question lessons are Thai-first and every choice has one unambiguous answer',()=>{
  assert.equal(M.lessons.length,10);assert.equal(M.lessons.reduce((n,l)=>n+l.tasks.length,0),80);
  for(const lesson of M.lessons){
    assert.equal(lesson.tasks.length,8);assert.match(lesson.intro,/[ก-๿]/);assert.equal(lesson.xp,P.byId[`kitchen:measure:${lesson.id}`].xp);
    assert.equal(new Set(lesson.tasks.map(t=>t.id)).size,lesson.tasks.length);
    for(const t of lesson.tasks){assert.match(t.prompt,/[ก-๿]/);assert.ok(t.speech&&t.explanation);if(t.type==='choice'){assert.equal(new Set(t.choices.map(c=>c.label)).size,3,t.id);assert.equal(t.choices.filter(c=>c.id===t.answer).length,1);}}
  }
});
test('Wrong answers allow retry; correct answers and next actions are idempotent',()=>{
  const tasks=M.lessons[0].tasks,s=M.create('test',tasks),q=tasks[0];
  assert.equal(M.next(s,tasks),false);assert.equal(M.check(s,q,'wrong'),'retry');assert.equal(s.mistakes,1);assert.equal(s.index,0);
  assert.equal(M.check(s,q,q.answer),'correct');assert.equal(M.check(s,q,q.answer),'already');assert.equal(M.next(s,tasks),true);assert.equal(s.index,1);
});
test('Measuring accepts equivalent mixed units and does not grant success for incorrect amounts',()=>{
  const q=M.lessons.find(l=>l.id==='volume').tasks.find(t=>t.id==='fill-250'),s=M.create('test',[q]);
  assert.equal(M.add(s,q,2,'dl'),true);assert.equal(M.check(s,q),'retry');assert.equal(M.add(s,q,50,'ml'),true);
  assert.equal(s.amount,250);assert.equal(M.check(s,q),'correct');assert.equal(M.add(s,q,1,'dl'),false);
});
test('Kitchen scales require taring; weight must match independently of the bowl',()=>{
  const q=M.lessons.find(l=>l.id==='weight').tasks.find(t=>t.id==='weigh-150'),s=M.create('test',[q]);
  assert.equal(M.check(s,q),'tare');assert.equal(s.mistakes,0);assert.equal(M.add(s,q,1,'hg'),false);assert.equal(M.tare(s),true);
  M.add(s,q,1,'hg');M.add(s,q,50,'g');assert.equal(s.amount,150);assert.equal(M.check(s,q),'correct');
  assert.equal(M.tare(s),false);
});
test('All 80 school tasks and 56 recipe tasks can be completed with available controls',()=>{
  const taskLists=[...M.lessons.map(l=>l.tasks),...Object.values(K.recipes).map(r=>M.recipeTasks(r,K.byId))];
  assert.equal(taskLists.slice(10).reduce((n,t)=>n+t.length,0),56);
  for(const tasks of taskLists){const s=M.create('test',tasks);for(const task of tasks){assert.equal(task,tasks[s.index]);if(task.type==='amount'){assert.ok(task.allowed.every(u=>M.byId[u].dimension===M.byId[task.unit].dimension));s.tared=true;const selected=task.allowed[0],needed=M.convert(task.value,task.unit,selected);assert.ok(needed<=1000);assert.equal(M.add(s,task,needed,selected),true);}assert.equal(M.check(s,task,task.answer),'correct',task.id);M.next(s,tasks);}assert.equal(s.index,tasks.length);}
});
test('Saved measuring, weighing and solved questions resume without changing the reward run ID',()=>{
  const tasks=M.lessons.find(l=>l.id==='weight').tasks,s=M.create('kitchen:measure:weight',tasks);
  s.index=5;s.tared=true;M.add(s,tasks[5],1,'hg');const r=M.restore(JSON.stringify(s),s.id,tasks);assert.equal(r.amount,100);assert.equal(r.tared,true);assert.equal(r.runId,s.runId);
  assert.equal(M.restore('bad json',s.id,tasks),null);assert.equal(M.restore({...s,index:999},s.id,tasks),null);assert.equal(M.restore({...s,id:'wrong'},s.id,tasks),null);
});
test('Swedish decimal formatting and spoken unit forms are suitable for kitchen instructions',()=>{
  assert.equal(M.quantity(2.5,'dl'),'2,5 dl');assert.equal(M.speakQuantity(1,'g'),'ett gram');assert.equal(M.speakQuantity(.5,'tsk'),'en halv tesked');assert.equal(M.speakQuantity(2,'msk'),'två matskedar');assert.equal(M.speakQuantity(2.5,'hg'),'två och ett halvt hektogram');
  assert.match(M.recipeTasks(K.recipes.cake,K.byId).find(t=>t.ingredient==='strawberry').speech,/jordgubbar/);
  assert.equal(M.recipeTasks(K.recipes.cookies,K.byId).find(t=>t.ingredient==='egg').speech,'Ta ett ägg.');
  assert.equal(M.recipeTasks(K.recipes.lemoncake,K.byId).find(t=>t.ingredient==='lemon').speech,'Ta en citron.');
  for(const lesson of M.lessons.slice(0,2))for(const task of lesson.tasks.filter(t=>t.id.startsWith('name-')))assert.equal(task.speech,M.byId[task.target].sv);
  for(const t of M.lessons.find(l=>l.id==='scaling').tasks.filter(t=>t.clue))assert.notEqual(t.speech,M.speakQuantity(t.value,t.unit),'Scaling audio asks the problem instead of speaking its answer');
});
test('Measuring school is available immediately; all recipe measuring stages follow existing listening stages',()=>{
  const state={};assert.equal(P.stats(state,'kitchen').total,42);assert.equal(P.unlocked(state,'kitchen:measure:volume-names'),true);assert.equal(P.unlocked(state,'kitchen:measure:weight-names'),false);
  for(const r of Object.values(K.recipes)){const mission=P.byId[`kitchen:${r.id}:3`];assert.equal(mission.prerequisite,`kitchen:${r.id}:2`);assert.equal(mission.xp,12);}
  assert.deepEqual(P.CAPS,{xp:180,games:60,gems:20,reviews:3});
});
test('Both portable builds include the measuring school without local script dependencies',()=>{
  const fs=require('node:fs');for(const file of['index.html','svenska_satun_iphone.html']){const html=fs.readFileSync(file,'utf8');assert.ok(html.includes('root.KitchenMeasureCore=api'));assert.ok(html.includes('window.KitchenMeasures='));assert.ok(!html.includes('src="kitchen_measures'));}
});

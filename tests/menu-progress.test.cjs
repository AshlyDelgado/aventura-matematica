const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function progress(saved = new Map(), blocked = false) {
  const items = ['addition','subtraction','multiplication','division','identify','final','game-memory','game-missing'].map(id => ({dataset:{activityProgress:id},classList:{toggle() {}},closest:()=>null}));
  const summary = {};
  const context = vm.createContext({window:{addEventListener() {},localStorage:{getItem:key=>{if(blocked)throw Error('blocked');return saved.get(key)??null;}}},document:{addEventListener() {},querySelectorAll:selector=>selector==='[data-activity-progress]'?items:[summary]}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/menu-progress.js'),'utf8'),context);
  return {...context.window.AventuraMatematicaProgress,items,summary};
}
const levels=(id,scores)=>scores.map((score,index)=>[`aventuraMatematica${id}-${index+1}Best`,String(score)]);
test('menu progress uses each activity threshold and summarizes eight goals',()=>{
  const saved=new Map([...levels('addition',[8,9,10,10]),['aventuraMatematicaIdentifyBest','7'],['aventuraMatematicafinalBest','16'],['aventuraMatematicagame-memoryBest','60'],['aventuraMatematicagame-missingBest','10']]);
  const app=progress(saved);
  assert.equal(app.getOperationProgress('addition').completed,true);
  assert.equal(app.getProgress('identify').completed,false);
  assert.equal(app.getProgress('final').completed,true);
  assert.equal(app.getProgress('game-memory').completed,true);
  assert.equal(app.getProgress('game-missing').percent,83);
  app.render();
  assert.equal(app.summary.textContent,'4 de 8 metas alcanzadas');
  saved.clear();app.render();
  assert.equal(app.summary.textContent,'0 de 8 metas alcanzadas');
});
test('an operation is a completed goal only when its four levels are passed',()=>{
  const saved=new Map(levels('subtraction',[10,8,7,0]));
  const app=progress(saved);
  const partial=app.getOperationProgress('subtraction');
  assert.equal(partial.passed,2);
  assert.equal(partial.total,4);
  assert.equal(partial.completed,false);
  assert.deepEqual(Array.from(partial.levels,level=>level.completed),[true,true,false,false]);
  assert.equal(app.getProgress('subtraction-1').percent,100);
  app.render();
  const card=app.items.find(item=>item.dataset.activityProgress==='subtraction');
  assert.equal(card.textContent,'Niveles superados: 2 de 4');
  assert.equal(app.summary.textContent,'0 de 8 metas alcanzadas');
  saved.set('aventuraMatematicasubtraction-3Best','8');app.render();
  assert.equal(card.textContent,'Niveles superados: 3 de 4');
  assert.equal(app.summary.textContent,'0 de 8 metas alcanzadas');
  saved.set('aventuraMatematicasubtraction-4Best','10');app.render();
  assert.equal(card.textContent,'Niveles superados: 4 de 4');
  assert.equal(app.summary.textContent,'1 de 8 metas alcanzadas');
  assert.equal(app.getOperationProgress('identify'),null);
});
test('menu progress handles blocked storage and invalid saved scores',()=>{
  assert.equal(progress(new Map(),true).getProgress('addition-1').percent,0);
  assert.equal(progress(new Map(),true).getOperationProgress('addition').passed,0);
  assert.equal(progress(new Map([['aventuraMatematicaaddition-1Best','abc']])).getProgress('addition-1').percent,0);
  assert.equal(progress(new Map([['aventuraMatematicaaddition-1Best','-2']])).getProgress('addition-1').percent,0);
  assert.equal(progress(new Map([['aventuraMatematicaaddition-1Best','100']])).getProgress('addition-1').percent,100);
});

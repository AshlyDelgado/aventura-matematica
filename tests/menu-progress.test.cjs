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
test('menu progress uses each activity threshold and summarizes eight goals',()=>{
  const saved=new Map([['aventuraMatematicaadditionBest','8'],['aventuraMatematicaIdentifyBest','7'],['aventuraMatematicafinalBest','16'],['aventuraMatematicagame-memoryBest','60'],['aventuraMatematicagame-missingBest','10']]);
  const app=progress(saved);
  assert.equal(app.getProgress('addition').completed,true);
  assert.equal(app.getProgress('identify').completed,false);
  assert.equal(app.getProgress('final').completed,true);
  assert.equal(app.getProgress('game-memory').completed,true);
  assert.equal(app.getProgress('game-missing').percent,83);
  app.render();
  assert.equal(app.summary.textContent,'4 de 8 metas alcanzadas');
  saved.clear();app.render();
  assert.equal(app.summary.textContent,'0 de 8 metas alcanzadas');
});
test('menu progress handles blocked storage and invalid saved scores',()=>{
  assert.equal(progress(new Map(),true).getProgress('addition').percent,0);
  assert.equal(progress(new Map([['aventuraMatematicaadditionBest','abc']])).getProgress('addition').percent,0);
  assert.equal(progress(new Map([['aventuraMatematicaadditionBest','-2']])).getProgress('addition').percent,0);
  assert.equal(progress(new Map([['aventuraMatematicaadditionBest','100']])).getProgress('addition').percent,100);
});

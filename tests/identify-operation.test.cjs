const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function challenge() {
  const nodes = new Map(), saved = new Map();
  const element = () => ({ hidden:false, disabled:false, dataset:{},style:{},handlers:{},
    classList:{add() {},remove() {},toggle() {}},setAttribute() {},removeAttribute() {},focus() {},
    addEventListener(event,fn) {(this.handlers[event] ||= []).push(fn);},
    click() {(this.handlers.click || []).forEach(fn=>fn({target:this}));},showModal() {this.open=true;},close() {this.open=false;},
  });
  const node = selector => {if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);};
  const progressTrack = element(); progressTrack.attributes = {};
  progressTrack.setAttribute = (name,value) => {progressTrack.attributes[name] = value;};
  node('[data-progress-bar]').parentElement = progressTrack;
  const options = ['suma','resta','multiplicación','división'].map(operation => {const button=element();button.dataset.operation=operation;return button;});
  const images = [element(),element(),element()];
  const context = vm.createContext({ Math:Object.assign(Object.create(Math),{random:()=>.999}),
    window:{requestAnimationFrame:fn=>fn(),localStorage:{getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)}},
    document:{querySelector:node,querySelectorAll:selector=>selector==='[data-operation]'?options:selector==='[data-mati-image]'?images:[node(selector)],addEventListener:(event,fn)=>{if(event==='DOMContentLoaded')fn();}},
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/identify-operation.js'),'utf8'),context);
  const correctOperations = ['suma','resta','multiplicación','división','suma','resta','multiplicación','división','suma','resta'];
  const finish = correctCount => {
    node('[data-start-challenge]').click();
    correctOperations.forEach((correct,index)=>{
      const operation=index<correctCount?correct:(correct==='suma'?'resta':'suma');
      options.find(button=>button.dataset.operation===operation).click();
      node('[data-next-question]').click();
    });
  };
  return {node,finish,saved,options,progressTrack};
}
test('OA1 measures the 80 percent goal and awards only improvements',()=>{
  const app=challenge();
  app.finish(7);
  assert.equal(app.node('[data-result-status]').textContent,'Sigue practicando');
  assert.equal(app.node('[data-result-percent]').textContent,'70%');
  app.finish(8);
  assert.equal(app.node('[data-result-status]').textContent,'¡Objetivo alcanzado!');
  assert.equal(app.saved.get('aventuraMatematicaPoints'),'80');
  app.finish(8);
  assert.equal(app.saved.get('aventuraMatematicaPoints'),'80');
  app.finish(10);
  assert.equal(app.saved.get('aventuraMatematicaPoints'),'100');
  assert.equal(app.node('[data-result-incorrect]').textContent,0);
});
test('OA1 result message states the real result instead of the 80 percent goal',()=>{
  const app=challenge();
  const message=()=>app.node('[data-result-message]').textContent;
  app.finish(10);
  assert.equal(message(),'¡Perfecto! Identificaste correctamente la operación en las 10 situaciones.');
  app.finish(8);
  assert.equal(message(),'Identificaste correctamente la operación en 8 de 10 situaciones (80 %) y la meta era el 80 %.');
  app.finish(7);
  assert.match(message(),/Revisa las pistas/);
});
test('OA1 native exit dialog opens and cancellation preserves the attempt',()=>{
  const app=challenge();
  app.node('[data-start-challenge]').click();
  app.node('[data-menu-warning-open]').click();
  assert.equal(app.node('[data-menu-warning-modal]').open,true);
  app.node('[data-menu-warning-cancel]').click();
  assert.equal(app.node('[data-menu-warning-modal]').open,false);
  assert.equal(app.node('[data-identify-quiz]').hidden,false);
});
test('OA1 progress bar tells assistive technology how many questions were answered',()=>{
  const app=challenge();
  app.node('[data-start-challenge]').click();
  assert.equal(app.progressTrack.attributes['aria-valuenow'],'0');
  app.options[0].click();
  assert.equal(app.progressTrack.attributes['aria-valuenow'],'1');
  app.node('[data-next-question]').click();
  assert.equal(app.progressTrack.attributes['aria-valuenow'],'1');
  app.options[0].click();
  assert.equal(app.progressTrack.attributes['aria-valuenow'],'2');
});

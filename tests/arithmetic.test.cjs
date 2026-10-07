const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
function activity(id, storage = new Map(), blocked = false) {
  const nodes = new Map();
  const node = (key) => {
    if (!nodes.has(key)) nodes.set(key, {
      hidden: ['practice','results'].includes(key), value: '', dataset: {}, disabled: false,
      handlers: {}, addEventListener(name, fn) { (this.handlers[name] ||= []).push(fn); },
      fire(name) { (this.handlers[name] || []).forEach(fn => fn({ preventDefault() {} })); },
      focus() {}, removeAttribute(name) { if (name === 'data-correct') delete this.dataset.correct; },
      showModal() { this.open = true; }, close() { this.open = false; },
    });
    return nodes.get(key);
  };
  const context = vm.createContext({
    window: {}, Math: Object.assign(Object.create(Math), { random: () => .999 }),
    localStorage: { getItem: key => { if (blocked) throw Error('blocked'); return storage.get(key) ?? null; }, setItem: (key,value) => { if (blocked) throw Error('blocked'); storage.set(key,value); } },
    document: { querySelector: selector => node(selector.slice(6,-1)), querySelectorAll: () => [], addEventListener: (event,fn) => fn() },
  });
  vm.runInContext(fs.readFileSync(path.join(root,'js',`${id}.js`),'utf8'),context);
  vm.runInContext(fs.readFileSync(path.join(root,'js','arithmetic.js'),'utf8'),context);
  const answer = value => { node('answer').value = String(value); node('answer-form').fire('submit'); };
  const finish = count => {
    node('start').fire('click');
    context.window.ArithmeticLesson.exercises.forEach((question,index) => {
      answer(index < count ? question.answer : question.answer + 1);
      node('next').fire('click');
    });
  };
  return {node,answer,finish,storage,lesson:context.window.ArithmeticLesson};
}

const operations = {addition:(a,b)=>a+b,subtraction:(a,b)=>a-b,multiplication:(a,b)=>a*b,division:(a,b)=>a/b};
for (const [id,calculate] of Object.entries(operations)) {
  test(`${id}: exercises, threshold, retries and improvement points`, () => {
    const app = activity(id);
    assert.equal(app.lesson.exercises.length,10);
    app.lesson.exercises.forEach(q => { assert.equal(q.answer,calculate(q.a,q.b)); assert.ok(Number.isInteger(q.answer) && q.answer >= 0); });
    app.finish(7);
    assert.equal(app.node('percent').textContent,'70 %');
    assert.equal(app.node('result-title').textContent,'¡Sigue practicando!');
    app.finish(8);
    assert.equal(app.node('result-title').textContent,'¡Objetivo alcanzado!');
    assert.equal(app.storage.get('aventuraMatematicaPoints'),'80');
    app.finish(8);
    assert.equal(app.storage.get('aventuraMatematicaPoints'),'80');
    app.finish(10);
    assert.equal(app.storage.get('aventuraMatematicaPoints'),'100');
    assert.equal(app.node('incorrect').textContent,0);
    assert.equal(app.node('results').hidden,false);
  });
  test(`${id}: invalid input and duplicate answers do not advance or award points`, () => {
    const app = activity(id);
    app.node('start').fire('click');
    for (const value of ['', '-1', '1.5', '1e2', 'Infinity', 'abc']) {
      app.answer(value);
      assert.equal(app.node('next').hidden,true);
    }
    app.node('next').fire('click');
    assert.equal(app.node('counter').textContent,'Ejercicio 1 de 10');
    app.answer(app.lesson.exercises[0].answer);
    app.answer(app.lesson.exercises[0].answer);
    assert.equal(app.node('next').hidden,false);
    assert.equal(app.storage.size,0);
    app.node('leave').fire('click');
    assert.equal(app.node('leave-dialog').open,true);
    app.node('stay').fire('click');
    assert.equal(app.node('leave-dialog').open,false);
  });
  test(`${id}: works when browser storage is unavailable`, () => {
    const app = activity(id,new Map(),true);
    app.finish(10);
    assert.equal(app.node('percent').textContent,'100 %');
  });
}

test('leaving the adventure resets all activity records and points', () => {
  const saved = new Map();
  const context = vm.createContext({ window: { localStorage: { setItem: (key,value) => saved.set(key,value) } }, document: { addEventListener() {}, querySelectorAll: () => [] } });
  vm.runInContext(fs.readFileSync(path.join(root,'js','navigation.js'),'utf8'), context);
  context.window.AventuraMatematicaNavigation.resetStoredProgress();
  assert.equal(saved.size,7);
  for (const key of ['aventuraMatematicaPoints','aventuraMatematicaIdentifyBest', ...[...Object.keys(operations),'final'].map(id => `aventuraMatematica${id}Best`)]) assert.equal(saved.get(key),'0');
});

test('final assessment defers feedback, requires 16 of 20 and reports all operations', () => {
  const app = activity('final-assessment');
  assert.equal(app.lesson.exercises.length,20);
  app.node('start').fire('click');
  app.answer(app.lesson.exercises[0].answer);
  assert.ok(app.node('feedback').textContent.includes('Respuesta guardada'));
  assert.equal(app.node('feedback').dataset.correct,undefined);
  app.finish(15);
  assert.equal(app.node('result-title').textContent,'¡Sigue practicando!');
  app.finish(16);
  assert.equal(app.node('result-title').textContent,'¡Objetivo alcanzado!');
  assert.equal(app.storage.get('aventuraMatematicaPoints'),'160');
  for (const operation of Object.keys(operations)) {
    assert.equal(app.lesson.exercises.filter(q => q.operation === operation).length,5);
    assert.match(app.node(`result-${operation}`).textContent,/de 5/);
  }
  assert.match(app.node('answer-review').textContent,/Tu respuesta:/);
  app.finish(16);
  assert.equal(app.storage.get('aventuraMatematicaPoints'),'160');
});

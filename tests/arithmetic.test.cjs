const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
function activity(id, storage = new Map(), blocked = false) {
  const nodes = new Map();
  let checkedLevel = 0; // Radio buttons of one group: checking a level unchecks the others.
  const node = (key) => {
    if (!nodes.has(key)) {
      const item = {
        hidden: ['practice','results','next-level'].includes(key), value: '', dataset: {}, disabled: false,
        handlers: {}, addEventListener(name, fn) { (this.handlers[name] ||= []).push(fn); },
        fire(name) { (this.handlers[name] || []).forEach(fn => fn({ preventDefault() {} })); },
        focus() { nodes.forEach(other => { other.focused = false; }); this.focused = true; }, removeAttribute(name) { if (name === 'data-correct') delete this.dataset.correct; },
        showModal() { this.open = true; }, close() { this.open = false; },
      };
      const level = /^level="(\d)"$/.exec(key);
      if (level) Object.defineProperty(item, 'checked', { get: () => checkedLevel === Number(level[1]), set: value => { if (value) checkedLevel = Number(level[1]); } });
      nodes.set(key, item);
    }
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
  // The operation modules offer four levels; `level` picks one like the learner does, otherwise the page's own default applies.
  // A locked level is a disabled radio button, which a browser would not let anyone choose.
  const choose = level => {
    const radio = node(`level="${level}"`);
    if (radio.disabled) return false;
    radio.checked = true;
    radio.fire('change');
    return true;
  };
  const selected = () => checkedLevel;
  const exercisesOf = () => context.window.ArithmeticLesson.levels ? context.window.ArithmeticLesson.levels[selected() - 1].exercises : context.window.ArithmeticLesson.exercises;
  const finish = (count, level) => {
    if (level) choose(level);
    node('start').fire('click');
    exercisesOf().forEach((question,index) => {
      answer(index < count ? question.answer : question.answer + 1);
      node('next').fire('click');
    });
  };
  return {node,answer,finish,choose,selected,storage,lesson:context.window.ArithmeticLesson};
}

const operations = {addition:(a,b)=>a+b,subtraction:(a,b)=>a-b,multiplication:(a,b)=>a*b,division:(a,b)=>a/b};
const key = (id,level) => `aventuraMatematica${id}-${level}Best`;
test('practice focuses the question before answering and Mati feedback after submitting', () => {
  const app = activity('addition');
  app.node('start').fire('click');
  assert.equal(app.node('counter').focused,true);
  assert.notEqual(app.node('answer').focused,true);
  app.answer(app.lesson.levels[0].exercises[0].answer);
  assert.equal(app.node('feedback').focused,true);
  app.node('next').fire('click');
  assert.equal(app.node('counter').focused,true);
});
for (const [id,calculate] of Object.entries(operations)) {
  test(`${id}: every level has ten correct exercises`, () => {
    const app = activity(id);
    assert.equal(app.lesson.levels.length,4);
    assert.deepEqual(Array.from(app.lesson.levels, level => level.name),['Fácil','Medio','Difícil','Experto']);
    for (const level of app.lesson.levels) {
      assert.equal(level.exercises.length,10);
      assert.ok(level.description);
      assert.equal(new Set(level.exercises.map(q => `${q.a},${q.b}`)).size,10,'no repeated exercise within a level');
      level.exercises.forEach(q => { assert.equal(q.answer,calculate(q.a,q.b)); assert.ok(Number.isInteger(q.answer) && q.answer >= 0); });
    }
  });
  test(`${id}: exercises, threshold, retries and improvement points`, () => {
    const app = activity(id);
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
    assert.equal(app.node('result-incorrect').textContent,0);
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
    assert.equal(app.node('counter').textContent,'Nivel Fácil · Ejercicio 1 de 10');
    app.answer(app.lesson.levels[0].exercises[0].answer);
    app.answer(app.lesson.levels[0].exercises[0].answer);
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
  assert.equal(saved.size,21);
  const levelIds = Object.keys(operations).flatMap(id => [1,2,3,4].map(level => `${id}-${level}`));
  for (const key of ['aventuraMatematicaPoints','aventuraMatematicaIdentifyBest', ...[...levelIds,'final','game-memory','game-missing'].map(id => `aventuraMatematica${id}Best`)]) assert.equal(saved.get(key),'0');
});

test('each operation starts with very small numbers and grows level by level', () => {
  const digits = n => String(n).length;
  const tables = [[2,5],[3,4],[6,7],[8,9]];
  const largest = level => Math.max(...level.exercises.map(q => Math.max(q.a,q.b,q.answer)));
  for (const id of Object.keys(operations)) {
    const levels = Array.from(activity(id).lesson.levels);
    const [easy,medium,hard,expert] = levels;
    if (id === 'addition') {
      // Easy: tiny sums such as 3 + 1 = 4. Medium: one digit with one digit. Hard: two digits with one. Expert: two with two.
      assert.deepEqual([easy.exercises[0].a,easy.exercises[0].b,easy.exercises[0].answer],[3,1,4],'the very first exercise is 3 + 1');
      easy.exercises.forEach(q => { assert.ok(q.a <= 5 && q.b <= 5 && q.answer <= 8,`addition easy ${q.a} + ${q.b}`); });
      medium.exercises.forEach(q => { assert.equal(digits(q.a),1); assert.equal(digits(q.b),1); assert.ok(q.answer >= 10 && q.answer <= 18,`addition medium ${q.a} + ${q.b}`); });
      hard.exercises.forEach(q => { assert.equal(digits(q.a),2,`addition hard ${q.a}`); assert.equal(digits(q.b),1); });
      expert.exercises.forEach(q => { assert.equal(digits(q.a),2); assert.equal(digits(q.b),2,`addition expert ${q.b}`); });
    } else if (id === 'subtraction') {
      easy.exercises.forEach(q => { assert.ok(q.a <= 8 && q.answer >= 1,`subtraction easy ${q.a} − ${q.b}`); });
      medium.exercises.forEach(q => { assert.equal(digits(q.a),1); assert.equal(digits(q.b),1); });
      hard.exercises.forEach(q => { assert.equal(digits(q.a),2,`subtraction hard ${q.a}`); assert.equal(digits(q.b),1); });
      expert.exercises.forEach(q => { assert.equal(digits(q.a),2); assert.equal(digits(q.b),2,`subtraction expert ${q.b}`); });
    } else {
      // The second factor (or the divisor) is the table the level practices.
      levels.forEach((level,index) => level.exercises.forEach(q => assert.ok(tables[index].includes(q.b),`${id} level ${index + 1}: ${q.a}, ${q.b}`)));
      // The first levels never use 1 as a factor or answer, so the wording ("1 bolsas") stays correct.
      levels.forEach(level => level.exercises.forEach(q => assert.ok(q.a > 1 && q.b > 1 && q.answer > 1,`${id}: ${q.a}, ${q.b}`)));
    }
    // Every level is no easier than the previous one, judged by the largest number it uses.
    levels.slice(1).forEach((level,index) => assert.ok(largest(levels[index]) <= largest(level),`${id}: level ${index + 2} is no easier than level ${index + 1}`));
    // The learner never meets a two-digit operand before the third level of adding or subtracting.
    if (id === 'addition' || id === 'subtraction') [easy,medium].forEach(level => assert.ok(Math.max(...level.exercises.flatMap(q => [q.a,q.b])) < 10));
  }
});

test('levels open one at a time and the picker recommends the first one not passed yet', () => {
  const saved = new Map();
  let app = activity('addition',saved);
  assert.equal(app.selected(),1,'a new learner starts with the easy level');
  assert.equal(app.node('start').textContent,'¡Vamos a practicar el nivel Fácil!');
  assert.equal(app.node('level-name="1"').textContent,'Nivel 1 · Fácil');
  assert.equal(app.node('level-name="4"').textContent,'Nivel 4 · Experto');
  assert.equal(app.node('level-description="2"').textContent,'Un dígito + un dígito (hasta 18)');
  assert.equal(app.node('level-status="1"').textContent,'Empieza por aquí');
  assert.equal(app.node('level="1"').disabled,false);
  for (const number of [2,3,4]) {
    assert.equal(app.node(`level="${number}"`).disabled,true,`level ${number} starts locked`);
    assert.equal(app.node(`level-status="${number}"`).textContent,`🔒 Se abre al superar el nivel ${number - 1}`);
  }
  assert.equal(app.choose(2),false,'a locked level cannot be chosen');
  assert.equal(app.selected(),1);
  app.finish(7);
  assert.equal(app.node('level-status="1"').textContent,'Tu mejor resultado: 7 de 10');
  assert.equal(app.node('level="2"').disabled,true,'7 of 10 does not open the next level');
  assert.equal(app.selected(),1,'repeating stays on the same level');
  app.finish(8);
  assert.equal(saved.get(key('addition',1)),'8');
  assert.equal(saved.has(key('addition',2)),false);
  assert.equal(app.node('level-status="1"').textContent,'¡Superado! 8 de 10');
  assert.equal(app.node('level="1"').dataset.passed,'true');
  assert.equal(app.node('level="2"').disabled,false,'passing level 1 opens level 2');
  assert.equal(app.node('level-status="2"').textContent,'Sigue con este nivel');
  assert.equal(app.node('level="3"').disabled,true,'level 3 still waits for level 2');
  // Coming back later, the page offers the next level and keeps the later ones locked.
  app = activity('addition',saved);
  assert.equal(app.selected(),2);
  assert.equal(app.node('start').textContent,'¡Vamos a practicar el nivel Medio!');
  assert.equal(app.node('level="3"').disabled,true);
  assert.equal(app.node('level="4"').disabled,true);
  app.finish(9);
  assert.equal(saved.get(key('addition',1)),'8','levels do not overwrite each other');
  assert.equal(saved.get(key('addition',2)),'9');
  assert.equal(saved.get('aventuraMatematicaPoints'),'170');
  assert.equal(app.node('level="3"').disabled,false);
  assert.equal(app.node('level="4"').disabled,true);
  app.finish(8,3);
  assert.equal(app.node('level="4"').disabled,false);
  app.finish(8,4);
  // Once every level is passed, the hardest one is offered.
  app = activity('addition',saved);
  assert.equal(app.selected(),4);
  for (const number of [1,2,3,4]) assert.equal(app.node(`level="${number}"`).disabled,false);
});

test('levels still open in order when the browser blocks storage', () => {
  const app = activity('addition',new Map(),true);
  assert.equal(app.node('level="2"').disabled,true);
  app.finish(8);
  assert.equal(app.node('level="2"').disabled,false,'the pass is remembered for this visit');
  assert.equal(app.node('level="3"').disabled,true);
  assert.equal(app.choose(2),true);
  app.finish(10);
  assert.equal(app.node('level="3"').disabled,false);
});

test('passing a level offers the next one and starts it', () => {
  const app = activity('subtraction');
  app.finish(7);
  assert.equal(app.node('result-level').textContent,'Nivel 1 · Fácil');
  assert.equal(app.node('next-level').hidden,true,'a missed goal offers a retry, not the next level');
  app.finish(8);
  assert.equal(app.node('next-level').hidden,false);
  assert.equal(app.node('next-level').textContent,'Pasar al nivel Medio');
  app.node('next-level').fire('click');
  assert.equal(app.selected(),2);
  assert.equal(app.node('practice').hidden,false);
  assert.equal(app.node('counter').textContent,'Nivel Medio · Ejercicio 1 de 10');
  assert.equal(app.node('question').textContent,app.lesson.levels[1].exercises[0].statement);
  app.finish(8);
  assert.equal(app.node('result-level').textContent,'Nivel 2 · Medio');
  assert.equal(app.node('next-level').textContent,'Pasar al nivel Difícil');
  app.finish(8,3);
  assert.equal(app.node('next-level').textContent,'Pasar al nivel Experto');
  app.finish(8,4);
  assert.equal(app.node('result-level').textContent,'Nivel 4 · Experto');
  assert.equal(app.node('next-level').hidden,true,'there is nothing after the last level');
  assert.match(app.node('result-message').textContent,/Completaste el último nivel/);
});

test('the result message states the real result instead of the 80 percent goal', () => {
  const message = app => app.node('result-message').textContent;
  const addition = activity('addition');
  addition.finish(10);
  assert.match(message(addition),/^¡Perfecto! Resolviste correctamente los 10 ejercicios/);
  assert.doesNotMatch(message(addition),/al menos el 80/);
  addition.finish(8);
  assert.ok(message(addition).startsWith('¡Lo lograste! Resolviste correctamente 8 de 10 ejercicios (80 %) y la meta era el 80 %'),message(addition));
  addition.finish(9);
  assert.ok(message(addition).includes('9 de 10 ejercicios (90 %)'),message(addition));
  addition.finish(7);
  assert.match(message(addition),/Necesitas 8 respuestas correctas de 10/);
  const game = activity('missing-number');
  game.finish(12);
  assert.match(message(game),/^¡Perfecto! Resolviste correctamente los 12 ejercicios/);
  game.finish(10);
  assert.ok(message(game).includes('10 de 12 ejercicios (83 %)'),message(game));
  const final = activity('final-assessment');
  final.finish(20);
  assert.match(message(final),/^¡Perfecto! Resolviste correctamente los 20 ejercicios/);
  final.finish(17);
  assert.ok(message(final).includes('17 de 20 ejercicios (85 %)'),message(final));
});

test('the operation pages offer the four levels and the controls the script expects', () => {
  for (const id of Object.keys(operations)) {
    const html = fs.readFileSync(path.join(root,'pages',`${id}.html`),'utf8');
    for (const number of [1,2,3,4]) {
      assert.match(html,new RegExp(`<input type="radio" name="level" value="${number}" data-level="${number}"`),`${id} level ${number}`);
      for (const part of ['name','description','status']) assert.ok(html.includes(`data-level-${part}="${number}"`),`${id} ${part} ${number}`);
    }
    assert.equal(html.includes('data-level="5"'),false);
    for (const attribute of ['data-next-level','data-result-level','data-start','data-retry']) assert.ok(html.includes(attribute),`${id} ${attribute}`);
    assert.ok(html.indexOf(`${id}.js`) < html.indexOf('arithmetic.js'),`${id} data loads before the shared script`);
  }
});

test('every hidden-number exercise is a one-step situation that does not give away the answer', () => {
  const { exercises } = activity('missing-number').lesson;
  const symbols = { '+': 'addition', '−': 'subtraction', '×': 'multiplication', '÷': 'division' };
  const counts = {};
  for (const q of exercises) {
    const [left, result] = q.expression.split(' = ');
    const [a, symbol, b] = left.split(' ');
    const known = [a, b, result].filter(part => part !== '?');
    assert.equal(known.length, 2, q.expression);
    // The situation tells the story of the equation: it is a question about one unknown, and it names both known numbers.
    assert.match(q.statement, /¿[^?]+\?$/, q.statement);
    assert.ok(!q.statement.includes('signo de pregunta'), `${q.expression} still has the generic instruction`);
    for (const number of known) assert.match(q.statement, new RegExp(`(^|\\D)${number}(\\D|$)`), `${q.expression}: ${q.statement}`);
    assert.doesNotMatch(q.statement, new RegExp(`(^|\\D)${q.answer}(\\D|$)`), `${q.expression} reveals its answer`);
    assert.equal(q.topic, symbols[symbol]);
    counts[q.topic] = (counts[q.topic] || 0) + 1;
  }
  assert.equal(new Set(exercises.map(q => q.statement)).size, 12, 'no situation is repeated');
  assert.deepEqual(counts, { addition: 3, subtraction: 3, multiplication: 3, division: 3 });
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

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const element = () => ({ children: [], style: { setProperty() {} }, setAttribute() {}, append(...items) { this.children.push(...items); }, replaceChildren(fragment) { this.children = fragment.children; } });

for (const operation of ['addition','subtraction','multiplication','division']) {
  test(`${operation}: visual objects match all forty exercises of the four levels before and after answering`, () => {
    const context = vm.createContext({ window: {}, document: { createElement: element, createDocumentFragment: element } });
    vm.runInContext(fs.readFileSync(path.join(root,'js',`${operation}.js`),'utf8'),context);
    vm.runInContext(fs.readFileSync(path.join(root,'js','arithmetic-visuals.js'),'utf8'),context);
    const visuals = context.window.ArithmeticVisuals;
    const exercises = context.window.ArithmeticLesson.levels.flatMap(level => level.exercises);
    assert.equal(exercises.length,40);
    for (const q of exercises) {
      for (const answered of [false,true]) {
        const groups = visuals.describe(operation,q,answered);
        const container = element();
        visuals.render(container,operation,q,answered);
        const cards = container.children[1].children;
        assert.equal(cards.length,groups.length);
        groups.forEach((group,index) => assert.equal(cards[index].children[1].children.length,group.count));
        if (operation === 'addition') {
          assert.equal(groups[0].count,q.a);
          assert.equal(groups[1].count,q.b);
        }
        if (operation === 'subtraction') {
          assert.equal(groups[0].count,q.a);
          assert.equal(groups[0].removed,answered ? q.b : 0);
          assert.equal(cards[0].children[1].children.filter(item => item.className.includes('quantity-removed')).length,answered ? q.b : 0);
        }
        if (operation === 'multiplication') {
          assert.equal(groups.length,q.a);
          groups.forEach(group => assert.equal(group.count,q.b));
        }
        if (operation === 'division' && answered) {
          assert.equal(groups.length,q.b);
          groups.forEach(group => assert.equal(group.count,q.answer));
          assert.equal(groups.reduce((total,group) => total + group.count,0),q.a);
        } else if (operation === 'division') {
          assert.equal(groups[0].count,q.a);
          assert.equal(groups[1].count,q.b);
        }
      }
    }
  });
}

test('addition labels use the singular for one sticker', () => {
  const context = vm.createContext({ window: {}, document: { createElement: element, createDocumentFragment: element } });
  vm.runInContext(fs.readFileSync(path.join(root,'js','arithmetic-visuals.js'),'utf8'),context);
  const { describe } = context.window.ArithmeticVisuals;
  assert.deepEqual(Array.from(describe('addition',{ a: 3, b: 1 }),group => group.label),['Ya tienes 3 calcomanías','Recibes 1 calcomanía más']);
  assert.deepEqual(Array.from(describe('addition',{ a: 1, b: 4 }),group => group.label),['Ya tienes 1 calcomanía','Recibes 4 calcomanías más']);
});

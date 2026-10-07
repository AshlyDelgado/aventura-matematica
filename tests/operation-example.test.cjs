const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
for (const operation of ['subtraction','multiplication','division']) {
  test(`${operation}: four paced steps and restart`, () => {
    const nodes = new Map();
    const node = key => { if (!nodes.has(key)) nodes.set(key,{ handlers:{}, addEventListener(event,fn) { this.handlers[event] = fn; }, focus() {} }); return nodes.get(key); };
    const renders = [];
    const context = vm.createContext({ window: { ArithmeticVisuals:{render: (...args) => renders.push(args)} }, document:{ querySelector: () => ({ dataset:{operationExample:operation}, querySelector: selector => node(selector) }), addEventListener: (event,fn) => fn() } });
    vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/operation-example.js'),'utf8'),context);
    const next = node('[data-example-next]');
    const reset = node('[data-example-reset]');
    for (let step = 1; step <= 4; step += 1) {
      next.handlers.click();
      const q = renders.at(-1)[2];
      if (operation === 'division') assert.equal(renders.at(-2)[2].visualTotal + q.a,12);
      assert.equal(operation === 'subtraction' ? q.b : operation === 'multiplication' ? q.a : q.a / q.b, step);
    }
    assert.equal(next.disabled,true);
    const count = renders.length;
    next.handlers.click();
    assert.equal(renders.length,count);
    reset.handlers.click();
    assert.equal(next.disabled,false);
    assert.equal(operation === 'subtraction' ? renders.at(-1)[2].b : renders.at(-1)[2].a,0);
  });
}

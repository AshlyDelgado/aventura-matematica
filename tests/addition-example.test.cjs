const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('apple example counts from five to eight, stops and can restart', () => {
  const element = () => ({
    children: [], attributes: {}, handlers: {}, disabled: false,
    classList: { values: new Set(), add(value) { this.values.add(value); }, remove(value) { this.values.delete(value); } },
    append(...children) { this.children.push(...children); },
    setAttribute(key,value) { this.attributes[key] = value; },
    addEventListener(event,fn) { this.handlers[event] = fn; },
    focus() { this.focused = true; },
  });
  const nodes = new Map();
  const find = key => { if (!nodes.has(key)) nodes.set(key,element()); return nodes.get(key); };
  const example = { querySelector: selector => find(selector.slice(6,-1)) };
  const context = vm.createContext({ document: { querySelector: () => example, createElement: element, addEventListener: (event,fn) => fn() } });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/addition-example.js'),'utf8'),context);
  assert.equal(find('initial-apples').children.length,5);
  assert.equal(find('new-apples').children.length,3);
  for (let added = 1; added <= 3; added += 1) {
    find('apple-next').handlers.click();
    assert.equal(find('apple-equation').textContent,`5 + ${added} = ${5 + added}`);
    assert.equal(find('new-apples').children.filter(apple => apple.classList.values.has('is-added')).length,added);
  }
  assert.equal(find('apple-next').disabled,true);
  find('apple-next').handlers.click();
  assert.equal(find('apple-equation').textContent,'5 + 3 = 8');
  assert.equal(find('apple-reset').focused,true);
  find('apple-reset').handlers.click();
  assert.equal(find('apple-equation').textContent,'5 + 0 = 5');
  assert.equal(find('apple-next').disabled,false);
  assert.equal(find('new-apples').children.filter(apple => apple.classList.values.has('is-waiting')).length,3);
  find('apple-next').handlers.click();
  assert.equal(find('apple-equation').textContent,'5 + 1 = 6');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function logic() {
  const context = vm.createContext({ window:{}, document:{addEventListener() {}} });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/games.js'),'utf8'),context);
  return context.window.MathGames;
}
test('memory contains six unique operation/result pairs and can be completed', () => {
  const game = logic().createMemory(() => .999);
  assert.equal(game.cards.length,12);
  for (let pair = 0; pair < 6; pair += 1) {
    const indices = game.cards.map((card,i) => card.pairId === pair ? i : -1).filter(i => i >= 0);
    assert.equal(indices.length,2);
    assert.equal(game.select(indices[0]).type,'first');
    assert.equal(game.select(indices[0]).type,'ignored');
    assert.equal(game.select(indices[1]).type,pair === 5 ? 'complete' : 'match');
    assert.equal(game.select(indices[0]).type,'ignored');
  }
  assert.equal(game.matches,6);
  assert.equal(game.attempts,6);
});
test('memory mismatch waits for explicit continuation and does not match cards', () => {
  const game = logic().createMemory(() => .999);
  assert.equal(game.select(0).type,'first');
  assert.equal(game.select(2).type,'miss');
  assert.equal(game.select(1).type,'ignored');
  assert.equal(game.matches,0);
  assert.equal(game.clearMiss().length,2);
  assert.equal(game.select(0).type,'first');
  assert.equal(game.select(1).type,'match');
  assert.equal(game.attempts,2);
  assert.equal(game.select(-1).type,'ignored');
});

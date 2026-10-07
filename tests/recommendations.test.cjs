const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function app() {
  const context = vm.createContext({window:{},document:{createElement:()=>({})}});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/recommendations.js'),'utf8'),context);
  return context.window.ArithmeticRecommendations;
}
test('review prioritizes mistake rates and excludes mastered operations',()=>{
  const responses = [
    {question:{operation:'addition'},isCorrect:false},
    {question:{operation:'addition'},isCorrect:true},
    {question:{operation:'division'},isCorrect:false},
    {question:{operation:'subtraction'},isCorrect:true},
  ];
  assert.equal(JSON.stringify(app().getTopics(responses).map(item=>item.id)),JSON.stringify(['division','addition']));
});
test('review recognizes identification, missing-number and lesson topics',()=>{
  for (const question of [{correctOperation:'multiplicación'},{topic:'multiplication'},{}]) {
    assert.equal(app().getTopics([{question,isCorrect:false}],'multiplication')[0].href,'multiplication.html');
  }
});
test('review clears stale links and hides suggestions after a perfect attempt',()=>{
  const api = app();
  const section = {hidden:true};
  const list = {children:[],replaceChildren(){this.children=[];},append(link){this.children.push(link);}};
  api.render(section,list,[{question:{},isCorrect:false}],'addition');
  assert.equal(section.hidden,false);
  assert.equal(list.children[0].href,'addition.html');
  api.render(section,list,[{question:{},isCorrect:true}],'addition');
  assert.equal(section.hidden,true);
  assert.equal(list.children.length,0);
});

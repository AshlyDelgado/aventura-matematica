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
const finalResponses = (hits) => Object.entries(hits).flatMap(([operation,count]) =>
  Array.from({length:5},(_,i) => ({question:{operation},isCorrect:i < count})));
const names = (items) => Array.from(items,item => item.name);
test('performance names the strongest and the weakest operation of the final assessment',()=>{
  const result = app().getPerformance(finalResponses({addition:5,subtraction:4,multiplication:3,division:2}));
  assert.deepEqual(names(result.mastered),['Suma']);
  assert.deepEqual(names(result.reinforce),['División']);
  assert.match(result.masteredText,/^Suma: 5 de 5 aciertos/);
  assert.match(result.reinforceText,/^División: 2 de 5 aciertos/);
});
test('performance lists tied operations and handles perfect or even results',()=>{
  const api = app();
  const tied = api.getPerformance(finalResponses({addition:5,subtraction:5,multiplication:3,division:2}));
  assert.deepEqual(names(tied.mastered),['Suma','Resta']);
  assert.match(tied.masteredText,/^Suma y Resta: 5 de 5 aciertos/);
  const perfect = api.getPerformance(finalResponses({addition:5,subtraction:5,multiplication:5,division:5}));
  assert.equal(perfect.mastered.length,4);
  assert.equal(perfect.reinforce.length,0);
  assert.match(perfect.masteredText,/^¡Dominaste las 4 operaciones!/);
  assert.equal(perfect.reinforceText,'Ninguna. ¡Acertaste todos los ejercicios!');
  const even = api.getPerformance(finalResponses({addition:4,subtraction:4,multiplication:4,division:4}));
  assert.equal(even.mastered.length,4);
  assert.equal(even.reinforce.length,0);
  assert.match(even.reinforceText,/^Ninguna necesita refuerzo urgente/);
});
test('performance reports no mastered operation below 80 percent and ignores empty attempts',()=>{
  const api = app();
  const weak = api.getPerformance(finalResponses({addition:3,subtraction:3,multiplication:2,division:2}));
  assert.equal(weak.mastered.length,0);
  assert.match(weak.masteredText,/^Todavía no hay una operación dominada/);
  assert.deepEqual(names(weak.reinforce),['Multiplicación','División']);
  assert.match(weak.reinforceText,/^Multiplicación y División: 2 de 5 aciertos/);
  const empty = api.getPerformance([]);
  assert.equal(empty.masteredText,'');
  assert.equal(empty.mastered.length + empty.reinforce.length,0);
});
test('performance renders texts and review links, then hides when there is nothing to show',()=>{
  const api = app();
  const nodes = {'[data-performance-mastered]':{},'[data-performance-reinforce]':{},'[data-performance-links]':{children:[],replaceChildren(){this.children=[];},append(link){this.children.push(link);}}};
  const section = {hidden:true,querySelector:selector => nodes[selector]};
  api.renderPerformance(section,finalResponses({addition:5,subtraction:4,multiplication:3,division:2}));
  assert.equal(section.hidden,false);
  assert.match(nodes['[data-performance-mastered]'].textContent,/Suma/);
  assert.equal(nodes['[data-performance-links]'].children.length,1);
  assert.equal(nodes['[data-performance-links]'].children[0].href,'division.html');
  assert.equal(nodes['[data-performance-links]'].children[0].textContent,'Repasar división');
  api.renderPerformance(section,[]);
  assert.equal(section.hidden,true);
  assert.equal(nodes['[data-performance-links]'].children.length,0);
  assert.doesNotThrow(() => api.renderPerformance(null,[]));
});

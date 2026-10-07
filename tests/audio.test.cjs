const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeContext {
  constructor() {
    FakeContext.instances.push(this);
    this.currentTime = 0; this.state = 'running'; this.destination = {}; this.oscillators = []; this.gains = [];
  }
  createOscillator() {
    const oscillator = { frequency: { value: 0 }, type: '', connect() {}, start() {}, stop() {} };
    this.oscillators.push(oscillator);
    return oscillator;
  }
  createGain() {
    const gain = { gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime(value) { this.target = value; } }, connect() {}, disconnect() {} };
    this.gains.push(gain);
    return gain;
  }
  createBiquadFilter() { return { frequency: { value: 0 }, Q: { value: 0 }, type: '', connect() {}, disconnect() {} }; }
  resume() { this.state = 'running'; }
  suspend() { this.state = 'suspended'; }
}
class FakeUtterance { constructor(text) { this.text = text; } }

function timers() {
  const intervals = new Map(); const timeouts = []; let id = 0;
  return {
    setInterval: (fn) => { intervals.set(++id, fn); return id; },
    clearInterval: (key) => { intervals.delete(key); },
    setTimeout: (fn, ms) => { timeouts.push({ fn, ms }); return timeouts.length; },
    clearTimeout() {},
    intervals, timeouts,
    tick() { intervals.forEach((fn) => fn()); },
    flush() { timeouts.splice(0).forEach((item) => item.fn()); },
  };
}

function audio({ stored = null, music = null, blocked = false, context = FakeContext, voices = [], speech = true, session = null, blockedSession = false } = {}) {
  FakeContext.instances = [];
  const storage = new Map();
  if (stored !== null) storage.set('aventuraMatematicaSound', stored);
  if (music !== null) storage.set('aventuraMatematicaMusic', music);
  const saved = new Map(session === null ? [] : [['aventuraMatematicaMusicPosition', JSON.stringify(session)]]);
  const clock = timers();
  const synth = { spoken: [], cancelled: 0, voices, getVoices() { return this.voices; }, cancel() { this.cancelled += 1; }, speak(utterance) { this.spoken.push(utterance); } };
  const window = {
    localStorage: {
      getItem: key => { if (blocked) throw Error('blocked'); return storage.get(key) ?? null; },
      setItem: (key, value) => { if (blocked) throw Error('blocked'); storage.set(key, value); },
    },
    sessionStorage: {
      getItem: key => { if (blockedSession) throw Error('blocked'); return saved.get(key) ?? null; },
      setItem: (key, value) => { if (blockedSession) throw Error('blocked'); saved.set(key, value); },
      removeItem: key => { if (blockedSession) throw Error('blocked'); saved.delete(key); },
    },
  };
  if (context) window.AudioContext = context;
  if (speech) { window.speechSynthesis = synth; window.SpeechSynthesisUtterance = FakeUtterance; }
  const sandbox = vm.createContext({ window, setInterval: clock.setInterval, clearInterval: clock.clearInterval, setTimeout: clock.setTimeout, clearTimeout: clock.clearTimeout });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/audio.js'), 'utf8'), sandbox);
  return { api: window.MatiAudio, storage, saved, synth, clock };
}
const busOf = (app) => FakeContext.instances[0].gains.find(item => item.gain.value === 0.2);
const textElement = (text) => ({ dataset: {}, childNodes: [], cloneNode() { return { querySelectorAll() { return []; }, textContent: text }; } });

test('sound and music are on by default, remember their preferences and survive blocked storage', () => {
  const fresh = audio();
  assert.equal(fresh.api.isEnabled(), true);
  assert.equal(fresh.api.isMusicEnabled(), true);
  assert.equal(audio({ stored: 'off' }).api.isEnabled(), false);
  assert.equal(audio({ music: 'off' }).api.isMusicEnabled(), false);
  fresh.api.setEnabled(false);
  assert.equal(fresh.storage.get('aventuraMatematicaSound'), 'off');
  fresh.api.setEnabled(true);
  assert.equal(fresh.storage.get('aventuraMatematicaSound'), 'on');
  fresh.api.setMusicEnabled(false);
  assert.equal(fresh.storage.get('aventuraMatematicaMusic'), 'off');
  const blocked = audio({ blocked: true });
  assert.equal(blocked.api.isEnabled(), true);
  assert.doesNotThrow(() => blocked.api.setEnabled(false));
  assert.doesNotThrow(() => blocked.api.setMusicEnabled(false));
  assert.equal(blocked.api.isEnabled(), false);
  assert.equal(blocked.api.isMusicEnabled(), false);
});

test('effects schedule their notes and stay silent when muted or unsupported', () => {
  const app = audio({ music: 'off' });
  assert.deepEqual([...app.api.effects].sort(), ['celebrate', 'correct', 'encourage', 'flip', 'match', 'tap', 'wrong']);
  assert.equal(app.api.play('correct'), true);
  assert.equal(FakeContext.instances.length, 1);
  assert.equal(FakeContext.instances[0].oscillators.length, 3);
  assert.equal(app.api.play('celebrate'), true);
  assert.equal(FakeContext.instances.length, 1, 'the audio context is reused');
  assert.equal(FakeContext.instances[0].oscillators.length, 7);
  assert.equal(app.api.play('unknown'), false);
  app.api.setEnabled(false);
  const before = FakeContext.instances[0].oscillators.length;
  assert.equal(app.api.play('correct'), false);
  assert.equal(FakeContext.instances[0].oscillators.length, before);
  assert.equal(audio({ stored: 'off' }).api.play('correct'), false);
  assert.equal(FakeContext.instances.length, 0, 'muted sound never creates an audio context');
  assert.equal(audio({ context: null }).api.play('correct'), false);
  const broken = audio({ context: class { constructor() { throw Error('no audio device'); } } });
  assert.equal(broken.api.play('correct'), false);
});

test('spoken text turns symbols into words a voice can read', () => {
  const { toSpeech } = audio().api;
  assert.equal(toSpeech('5 + ? = 8'), '5 más un número escondido es igual a 8');
  assert.equal(toSpeech('? − 3 = 7'), 'un número escondido menos 3 es igual a 7');
  assert.equal(toSpeech('4 × 4 = 16 y 12 ÷ 3 = 4'), '4 por 4 es igual a 16 y 12 entre 3 es igual a 4');
  assert.equal(toSpeech('¿Cuántas tienes en total?'), '¿Cuántas tienes en total?');
  assert.equal(toSpeech('Meta: 80 % de aciertos ✏️ ★'), 'Meta: 80 por ciento de aciertos');
  assert.equal(toSpeech('  Hola   Mati  '), 'Hola Mati');
});

test('text is split into sentences that keep their position in the original text', () => {
  const { splitSentences } = audio().api;
  const text = 'Tienes 9 calcomanías y recibes 9 más. ¿Cuántas tienes en total?';
  const parts = splitSentences(text);
  assert.equal(parts.length, 2);
  assert.equal(parts[0].text, 'Tienes 9 calcomanías y recibes 9 más.');
  assert.equal(parts[1].text, '¿Cuántas tienes en total?');
  parts.forEach(part => assert.equal(text.slice(part.start, part.end), part.text));
  assert.equal(splitSentences('¡Muy bien! Junta 9 + 9 = 18.').length, 2);
  assert.equal(splitSentences('9 + 9 = 18').length, 1);
  assert.equal(splitSentences('   ').length, 0);
  assert.equal(splitSentences('...').length, 0);
});

test('the question mark of a hidden-number operation is a placeholder, not the end of a sentence', () => {
  const { splitSentences, toSpeech } = audio().api;
  for (const expression of ['? × 2 = 10', '5 + ? = 8', '12 ÷ ? = 4', '? − 3 = 7']) {
    const parts = splitSentences(expression);
    assert.equal(parts.length, 1, expression);
    assert.equal(parts[0].text, expression);
    assert.equal(expression.slice(parts[0].start, parts[0].end), expression);
    assert.match(toSpeech(parts[0].text), /^(un número escondido|\d+ (más|menos|por|entre) un número escondido|\d+ entre un número escondido)/, expression);
  }
  const mixed = splitSentences('Descubre el número que falta. ¿Cuál es? 5 + ? = 8');
  assert.deepEqual(Array.from(mixed, part => part.text), ['Descubre el número que falta.', '¿Cuál es?', '5 + ? = 8']);
});

test('every hidden-number exercise is read as one complete sentence', () => {
  const sandbox = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/missing-number.js'), 'utf8'), sandbox);
  const { splitSentences, toSpeech } = audio().api;
  const exercises = sandbox.window.ArithmeticLesson.exercises;
  assert.equal(exercises.length, 12);
  for (const exercise of exercises) {
    const parts = splitSentences(exercise.expression);
    assert.equal(parts.length, 1, exercise.expression);
    const spoken = toSpeech(parts[0].text);
    assert.match(spoken, /un número escondido/, exercise.expression);
    assert.match(spoken, /es igual a \d+$/, exercise.expression);
    assert.doesNotMatch(spoken, /[?×÷+−=]/, exercise.expression);
  }
});

test('Mati prefers natural Spanish voices, then Google, and favors Costa Rican or Latin American accents', () => {
  const { chooseVoice } = audio().api;
  const synth = (voices) => ({ getVoices: () => voices });
  const desktop = { name: 'Microsoft Helena Desktop', lang: 'es-ES' };
  const google = { name: 'Google español', lang: 'es-ES' };
  const natural = { name: 'Microsoft Dalia Online (Natural) - Spanish (Mexico)', lang: 'es-MX' };
  const english = { name: 'Alex', lang: 'en-US' };
  assert.equal(chooseVoice(synth([english, desktop, google, natural])), natural);
  assert.equal(chooseVoice(synth([english, desktop, google])), google);
  const mexico = { name: 'Voz A', lang: 'es_MX' }, spain = { name: 'Voz B', lang: 'es-ES' }, costaRica = { name: 'Voz C', lang: 'es-CR' };
  assert.equal(chooseVoice(synth([spain, mexico])), mexico, 'Android-style es_MX codes are understood');
  assert.equal(chooseVoice(synth([spain, mexico, costaRica])), costaRica);
  assert.equal(chooseVoice(synth([english])), null);
  assert.equal(chooseVoice({}), null, 'speech engines without a voice list are tolerated');
});

test('narration is expressive: one utterance per sentence, with the tone of a question or an exclamation', () => {
  const costaRica = { name: 'Voz', lang: 'es-CR' };
  const app = audio({ voices: [{ name: 'Alex', lang: 'en-US' }, costaRica] });
  assert.equal(app.api.speak('¡Muy bien! ¿Lo ves? Suma 9 + 9 = 18.'), true);
  assert.equal(app.synth.cancelled, 1, 'previous speech is cancelled before a new one starts');
  const [cheer, ask, tell] = app.synth.spoken;
  assert.equal(app.synth.spoken.length, 3);
  assert.deepEqual([cheer.pitch, ask.pitch, tell.pitch], [1.3, 1.22, 1.1]);
  assert.deepEqual([cheer.rate, ask.rate, tell.rate], [0.95, 0.92, 0.9]);
  assert.equal(tell.text, 'Suma 9 más 9 es igual a 18.');
  [cheer, ask, tell].forEach(utterance => { assert.equal(utterance.voice, costaRica); assert.equal(utterance.lang, 'es-CR'); });
  const fallback = audio({ voices: [{ name: 'Alex', lang: 'en-US' }] });
  fallback.api.speak('hola');
  assert.equal(fallback.synth.spoken[0].voice, undefined);
  assert.equal(fallback.synth.spoken[0].lang, 'es-419');
  app.api.stopSpeaking();
  assert.equal(app.synth.cancelled, 2);
});

test('narration is skipped when muted, empty or unsupported', () => {
  const muted = audio({ stored: 'off' });
  assert.equal(muted.api.speak('hola'), false);
  assert.equal(muted.synth.spoken.length, 0);
  const app = audio();
  assert.equal(app.api.speak('   '), false);
  assert.equal(app.api.speak('✏️'), false);
  assert.equal(audio({ speech: false }).api.speak('hola'), false);
  app.api.speak('hola');
  app.api.setEnabled(false);
  assert.equal(app.synth.cancelled, 2, 'muting stops the voice that is speaking');
});

test('Mati speaks comments on her own after a short pause and the pause can be cancelled', () => {
  const app = audio();
  const comment = textElement('¡Muy bien! Suma 2 + 3.');
  assert.equal(app.api.say(comment, { delay: 500 }), true);
  assert.equal(app.synth.spoken.length, 0, 'waits so the sound effect is not stepped on');
  assert.equal(app.clock.timeouts[0].ms, 500);
  app.clock.flush();
  assert.deepEqual(app.synth.spoken.map(item => item.text), ['¡Muy bien!', 'Suma 2 más 3.']);
  app.api.say(comment, { delay: 500 });
  app.api.stopSpeaking();
  app.clock.flush();
  assert.equal(app.synth.spoken.length, 2, 'moving on cancels a comment that has not started yet');
  const immediate = audio();
  immediate.api.say(comment);
  assert.equal(immediate.synth.spoken.length, 2);
  assert.equal(audio({ stored: 'off' }).api.say(comment), false);
  assert.equal(audio().api.say(null), false);
});

test('background music is scheduled in bars, loops, and respects every preference', () => {
  const app = audio();
  assert.equal(app.api.musicState().playing, false);
  assert.equal(app.api.musicState().contextState, 'none');
  assert.equal(app.api.startMusic(), true);
  assert.equal(app.clock.intervals.size, 1);
  const context = FakeContext.instances[0];
  assert.equal(context.oscillators.length, 15, 'first bar: three pad notes, two bass notes and five melody notes with a bell overtone');
  assert.equal(app.api.startMusic(), false, 'it never starts twice');
  assert.equal(app.clock.intervals.size, 1);
  context.currentTime = 2;
  app.clock.tick();
  assert.ok(context.oscillators.length > 15, 'the next bar is scheduled ahead of time');
  context.currentTime = 41;
  app.clock.tick();
  assert.ok(app.api.musicState().position < 5, 'the 16-bar loop starts over');
  assert.equal(audio({ music: 'off' }).api.startMusic(), false);
  assert.equal(audio({ stored: 'off' }).api.startMusic(), false);
  assert.equal(FakeContext.instances.length, 0, 'muted music never creates an audio context');
  assert.equal(audio({ context: null }).api.startMusic(), false);
});

test('turning music or sound off stops the melody and turning them on brings it back', () => {
  const app = audio();
  app.api.startMusic();
  const bus = busOf(app);
  app.api.setMusicEnabled(false);
  assert.equal(app.clock.intervals.size, 0);
  assert.equal(bus.gain.target, 0, 'the melody fades out');
  assert.equal(app.api.musicState().playing, false);
  app.api.setMusicEnabled(true);
  assert.equal(app.clock.intervals.size, 1);
  assert.equal(app.api.musicState().playing, true);
  app.api.setEnabled(false);
  assert.equal(app.clock.intervals.size, 0, 'silencing the sound also silences the music');
  app.api.setEnabled(true);
  assert.equal(app.clock.intervals.size, 1, 'and it returns with the sound');
  app.api.setMusicEnabled(false);
  app.api.setEnabled(false);
  app.api.setEnabled(true);
  assert.equal(app.clock.intervals.size, 0, 'sound does not revive music that was turned off');
});

test('music lowers its volume while Mati speaks and ignores speech that was cancelled', () => {
  const app = audio();
  app.api.startMusic();
  const bus = busOf(app);
  app.api.speak('Hola Mati. Adiós Mati.');
  const [first, second] = app.synth.spoken;
  first.onstart();
  assert.equal(app.api.musicState().ducked, true);
  assert.equal(bus.gain.target, 0.05);
  first.onend();
  assert.equal(app.api.musicState().ducked, true, 'still talking: the second sentence is next');
  second.onend();
  assert.equal(app.api.musicState().ducked, false);
  assert.equal(bus.gain.target, 0.2);
  app.api.speak('Primera voz.');
  const stale = app.synth.spoken[2];
  stale.onstart();
  app.api.speak('Segunda voz.');
  stale.onend();
  assert.equal(app.api.musicState().ducked, true, 'the cancelled voice cannot restore the volume');
  app.synth.spoken[3].onend();
  assert.equal(app.api.musicState().ducked, false);
});

test('music keeps its place when the page changes and starts over after a long pause', () => {
  const resumed = audio({ session: { position: 10, at: Date.now() - 1000 } });
  resumed.api.startMusic();
  assert.ok(Math.abs(resumed.api.musicState().position - 11) < 0.5, 'continues about a second later');
  assert.equal(resumed.saved.has('aventuraMatematicaMusicPosition'), false, 'the saved place is used only once');
  resumed.api.rememberPosition();
  const stored = JSON.parse(resumed.saved.get('aventuraMatematicaMusicPosition'));
  assert.ok(Math.abs(stored.position - 11) < 0.5);
  const stale = audio({ session: { position: 10, at: Date.now() - 60000 } });
  stale.api.startMusic();
  assert.equal(stale.api.musicState().position, 0);
  const idle = audio();
  idle.api.rememberPosition();
  assert.equal(idle.saved.size, 0, 'nothing is saved when no music is playing');
  const noSession = audio({ blockedSession: true });
  assert.doesNotThrow(() => noSession.api.startMusic());
  assert.doesNotThrow(() => noSession.api.rememberPosition());
  assert.equal(noSession.api.musicState().playing, true);
});

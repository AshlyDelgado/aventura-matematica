/* Audio de Aventura Matemática: efectos, música de fondo y voz de Mati. Todo se genera en el navegador, sin archivos de audio. */
(() => {
  "use strict";
  const SOUND_KEY = "aventuraMatematicaSound";
  const MUSIC_KEY = "aventuraMatematicaMusic";
  const POSITION_KEY = "aventuraMatematicaMusicPosition";
  const VOLUME = 0.18;
  const MUSIC_VOLUME = 0.2;
  const MUSIC_DUCKED_VOLUME = 0.05;
  const readFlag = (key) => {
    try { return window.localStorage.getItem(key) !== "off"; } catch { return true; }
  };
  const writeFlag = (key, value) => {
    try { window.localStorage.setItem(key, value ? "on" : "off"); } catch { /* La preferencia dura mientras la página siga abierta. */ }
  };
  const state = { enabled: readFlag(SOUND_KEY), music: readFlag(MUSIC_KEY), context: null, listening: null, session: 0, sayToken: 0 };
  const toggles = new Set();
  const musicToggles = new Set();
  const listenButtons = new Set();
  let talkingTargets = [];
  let music = null;

  /* ---------- Contexto y efectos de sonido ---------- */
  // Cada nota es [frecuencia en Hz, inicio en segundos, duración en segundos].
  const effects = {
    correct: [[659.25, 0, 0.12], [783.99, 0.1, 0.12], [1046.5, 0.2, 0.24]],
    wrong: [[392, 0, 0.16], [311.13, 0.14, 0.3]],
    tap: [[523.25, 0, 0.07]],
    flip: [[600, 0, 0.05], [800, 0.04, 0.06]],
    match: [[880, 0, 0.1], [1318.5, 0.09, 0.28]],
    celebrate: [[523.25, 0, 0.12], [659.25, 0.12, 0.12], [783.99, 0.24, 0.12], [1046.5, 0.36, 0.4]],
    encourage: [[440, 0, 0.14], [523.25, 0.16, 0.3]],
  };

  function getContext() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    try {
      state.context = state.context || new Context();
      if (state.context.state === "suspended") state.context.resume?.();
      return state.context;
    } catch { return null; }
  }

  function play(name) {
    const notes = effects[name];
    if (!state.enabled || !notes) return false;
    const context = getContext();
    if (!context) return false;
    try {
      const now = context.currentTime;
      for (const [frequency, start, duration] of notes) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = name === "wrong" ? "triangle" : "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + start);
        gain.gain.exponentialRampToValueAtTime(VOLUME, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + start);
        oscillator.stop(now + start + duration + 0.05);
      }
      return true;
    } catch { return false; }
  }

  /* ---------- Música de fondo ---------- */
  // Melodía original en do mayor, a 96 pulsos por minuto: 16 compases (unos 40 segundos) que se repiten.
  const midi = (note) => 440 * 2 ** ((note - 69) / 12);
  const BEAT = 60 / 96;
  const BAR = BEAT * 4;
  const chords = {
    C: { bass: 48, pad: [55, 60, 64] },
    Am: { bass: 45, pad: [57, 60, 64] },
    F: { bass: 41, pad: [57, 60, 65] },
    G: { bass: 43, pad: [55, 59, 62] },
    Em: { bass: 40, pad: [55, 59, 64] },
  };
  const progression = ["C", "Am", "F", "G", "C", "Am", "F", "G", "C", "Em", "F", "G", "Am", "F", "G", "C"];
  const scale = [67, 69, 72, 74, 76, 79, 81, 84];
  // Cada nota de una frase es [pulso dentro del compás, posición en la escala, duración en pulsos].
  const phrases = {
    A: [[0, 4, 1], [1, 3, 0.5], [1.5, 2, 0.5], [2, 4, 1], [3, 5, 1]],
    B: [[0, 5, 1.5], [1.5, 4, 0.5], [2, 3, 1], [3, 2, 1]],
    C: [[0, 2, 0.5], [0.5, 3, 0.5], [1, 4, 1], [2, 6, 1.5], [3.5, 5, 0.5]],
    D: [[0, 4, 2], [2, 3, 0.5], [2.5, 4, 0.5], [3, 5, 1]],
    E: [[0, 5, 1], [1, 4, 1], [2, 2, 2]],
  };
  const melody = "ABACABDCDBACADBE";
  const LOOP = BAR * progression.length;

  function tone(context, bus, type, frequency, start, duration, peak, attack) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(bus);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  function scheduleBar(context, bus, index, when, skip) {
    const chord = chords[progression[index]];
    const padStart = Math.max(when, context.currentTime);
    const padEnd = when + BAR + 0.6;
    if (padEnd - padStart > 0.6) chord.pad.forEach((note) => tone(context, bus, "sine", midi(note), padStart, padEnd - padStart, 0.1, 0.35));
    [[0, chord.bass], [2, chord.bass + 7]].forEach(([beat, note]) => {
      if (beat * BEAT >= skip) tone(context, bus, "triangle", midi(note), when + beat * BEAT, BEAT * 1.6, 0.26, 0.01);
    });
    phrases[melody[index]].forEach(([beat, degree, beats]) => {
      if (beat * BEAT < skip) return;
      const start = when + beat * BEAT;
      const duration = Math.min(beats * BEAT * 0.9 + 0.35, 1.6);
      tone(context, bus, "sine", midi(scale[degree]), start, duration, 0.34, 0.008);
      tone(context, bus, "triangle", midi(scale[degree]) * 2, start, duration * 0.6, 0.07, 0.008);
    });
  }

  function musicPosition() {
    return music && state.context ? (music.startPosition + Math.max(0, state.context.currentTime - music.origin)) % LOOP : 0;
  }

  // La música sigue "donde iba" al cambiar de página si el cambio ocurre en pocos segundos.
  function rememberPosition() {
    if (!music) return;
    try { window.sessionStorage.setItem(POSITION_KEY, JSON.stringify({ position: musicPosition(), at: Date.now() })); } catch { /* Sin almacenamiento, vuelve a empezar. */ }
  }

  function savedPosition() {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(POSITION_KEY) || "null");
      window.sessionStorage.removeItem(POSITION_KEY);
      const gap = saved ? (Date.now() - saved.at) / 1000 : -1;
      if (Number.isFinite(saved?.position) && gap >= 0 && gap < 20) return (saved.position + gap) % LOOP;
    } catch { /* La música empieza desde el principio. */ }
    return 0;
  }

  function tick() {
    const context = state.context;
    if (!music || !context) return;
    while (music.nextBar < context.currentTime + 1.2) {
      scheduleBar(context, music.bus, music.index % progression.length, music.nextBar, Math.max(0, music.origin - music.nextBar));
      music.nextBar += BAR;
      music.index += 1;
    }
  }

  function startMusic() {
    if (music || !state.enabled || !state.music) return false;
    const context = getContext();
    if (!context) return false;
    try {
      const bus = context.createGain();
      bus.gain.value = MUSIC_VOLUME;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 3200;
      filter.Q.value = 0.7;
      bus.connect(filter);
      filter.connect(context.destination);
      const startPosition = savedPosition();
      const index = Math.floor(startPosition / BAR);
      const origin = context.currentTime + 0.1;
      music = { bus, filter, startPosition, origin, index, nextBar: origin - (startPosition - index * BAR), timer: null, ducked: false };
      music.timer = setInterval(tick, 200);
      tick();
      return true;
    } catch { music = null; return false; }
  }

  function stopMusic() {
    if (!music) return;
    const current = music;
    music = null;
    clearInterval(current.timer);
    try { current.bus.gain.setTargetAtTime(0, state.context.currentTime, 0.08); } catch { /* Ya estaba en silencio. */ }
    setTimeout(() => { try { current.bus.disconnect(); current.filter.disconnect(); } catch { /* Nada que desconectar. */ } }, 600);
  }

  // Mientras Mati habla, la música baja para que se entienda la voz.
  function duckMusic(on) {
    if (!music || !state.context) return;
    music.ducked = on;
    try { music.bus.gain.setTargetAtTime(on ? MUSIC_DUCKED_VOLUME : MUSIC_VOLUME, state.context.currentTime, 0.12); } catch { /* Sin música que bajar. */ }
  }

  function musicState() {
    return {
      enabled: state.music,
      playing: Boolean(music),
      ducked: Boolean(music && music.ducked),
      contextState: state.context ? state.context.state : "none",
      position: musicPosition(),
    };
  }

  // Los navegadores solo permiten iniciar el audio tras un toque o una tecla de la persona.
  function armMusic() {
    if (music || !state.enabled || !state.music) return;
    if (typeof navigator !== "undefined" && navigator.userActivation && navigator.userActivation.hasBeenActive) startMusic();
    if (music && state.context && state.context.state === "running") return;
    const events = ["pointerdown", "keydown", "touchstart"];
    const unlock = () => {
      events.forEach((name) => document.removeEventListener(name, unlock, true));
      if (!state.enabled || !state.music) return;
      startMusic();
      state.context?.resume?.();
    };
    events.forEach((name) => document.addEventListener(name, unlock, true));
  }

  /* ---------- Voz de Mati ---------- */
  /* Convierte símbolos y números en texto que una voz sintética pronuncia bien. */
  function toSpeech(text) {
    return String(text)
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, " ")
      .replace(/(^|\s)\?(?=\s|$)/g, "$1un número escondido")
      .replace(/\s[−-]\s/g, " menos ")
      .replace(/\s\+\s/g, " más ")
      .replace(/\s[×*]\s/g, " por ")
      .replace(/\s÷\s/g, " entre ")
      .replace(/\s=\s/g, " es igual a ")
      .replace(/(\d)\s?%/g, "$1 por ciento")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* Divide un texto en oraciones y conserva dónde empieza y termina cada una. */
  function splitSentences(text) {
    const parts = [];
    const pattern = /[^.!?]+(?:[.!?]+["'”»)\]]*)?/g;
    // El "?" suelto de una operación como "5 + ? = 8" es un marcador, no el final de una pregunta.
    const source = String(text).replace(/(^|\s)\?(?=\s|$)/g, "$1\u0001");
    let match;
    while ((match = pattern.exec(source)) !== null) {
      const clean = match[0].trim();
      if (!clean) continue;
      const start = match.index + match[0].indexOf(clean);
      parts.push({ text: clean.replace(/\u0001/g, "?"), start, end: start + clean.length });
    }
    return parts;
  }

  const langRank = { "es-CR": 6, "es-MX": 5, "es-US": 4, "es-419": 4, "es-ES": 2 };
  function voiceScore(voice) {
    const name = String(voice.name || "");
    let score = langRank[String(voice.lang).replace("_", "-")] || 1;
    if (/natural|neural|online/i.test(name)) score += 10;
    else if (/google/i.test(name)) score += 5;
    else if (/premium|enhanced|mejorada|siri/i.test(name)) score += 6;
    if (/desktop/i.test(name)) score -= 3;
    return score;
  }

  /* Elige la voz en español que suene más natural: primero las "naturales", luego las de Google. */
  function pickVoice(synth) {
    const voices = synth.getVoices?.() || [];
    let best = null;
    for (const voice of voices) {
      if (!/^es\b/i.test(String(voice.lang || "").replace("_", "-"))) continue;
      if (!best || voiceScore(voice) > voiceScore(best)) best = voice;
    }
    return best;
  }

  /* Una pregunta sube el tono, una exclamación suena más alegre y el resto va pausado. */
  function prosody(text) {
    if (/\?["'”»)\]]*$/.test(text)) return { rate: 0.92, pitch: 1.22 };
    if (/!["'”»)\]]*$/.test(text)) return { rate: 0.95, pitch: 1.3 };
    return { rate: 0.9, pitch: 1.1 };
  }

  const supportsSpeech = () => Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);

  function setIconName(node, name) { if (typeof document !== "undefined") setIcon(node, name); }

  function setListening(button) {
    state.listening = button;
    listenButtons.forEach((item) => {
      const active = item === button;
      item.setAttribute("aria-pressed", String(active));
      item.querySelector(".sound-label").textContent = active ? "Detener" : "Escuchar";
      setIconName(item.querySelector(".sound-icon"), active ? "stop" : "on");
    });
  }

  // Mati "habla": su imagen se mueve y la oración que se lee se resalta (si el navegador lo permite).
  function setTalking(on) {
    talkingTargets.forEach((target) => target.classList.remove("is-talking"));
    talkingTargets = [];
    if (!on || typeof document === "undefined") return;
    const images = document.querySelectorAll("img[data-mati], img.arithmetic-mati, img.mati-image, .addition-fox img");
    talkingTargets = [...images].filter((image) => image.offsetParent !== null).map((image) => image.closest(".mati-frame, .addition-fox") || image);
    talkingTargets.forEach((target) => target.classList.add("is-talking"));
  }

  function clearHighlight() {
    try { window.CSS?.highlights?.delete("mati-speaking"); } catch { /* El resaltado es opcional. */ }
  }

  function highlight(segment) {
    clearHighlight();
    if (typeof document === "undefined" || !segment.node || !window.CSS?.highlights || typeof window.Highlight !== "function") return;
    try {
      const range = document.createRange();
      range.setStart(segment.node, segment.start);
      range.setEnd(segment.node, segment.end);
      window.CSS.highlights.set("mati-speaking", new window.Highlight(range));
    } catch { /* El resaltado es opcional. */ }
  }

  function finishSpeaking() {
    clearHighlight();
    setTalking(false);
    duckMusic(false);
    if (state.listening) setListening(null);
  }

  function stopSpeaking() {
    state.sayToken += 1;
    state.session += 1;
    try { window.speechSynthesis?.cancel(); } catch { /* No hay nada que detener. */ }
    finishSpeaking();
  }

  function speakSegments(segments, button) {
    if (!state.enabled || !supportsSpeech()) return false;
    const queue = segments.map((segment) => ({ ...segment, spoken: toSpeech(segment.text) })).filter((segment) => segment.spoken);
    if (!queue.length) return false;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      state.sayToken += 1;
      const session = ++state.session;
      const voice = pickVoice(synth);
      setListening(button);
      queue.forEach((segment, position) => {
        const utterance = new window.SpeechSynthesisUtterance(segment.spoken);
        if (voice) utterance.voice = voice;
        utterance.lang = voice ? voice.lang : "es-419";
        Object.assign(utterance, prosody(segment.text));
        utterance.onstart = () => {
          if (state.session !== session) return;
          setTalking(true);
          highlight(segment);
          duckMusic(true);
        };
        const done = () => { if (state.session === session && position === queue.length - 1) finishSpeaking(); };
        utterance.onend = done;
        utterance.onerror = done;
        synth.speak(utterance);
      });
      return true;
    } catch { return false; }
  }

  function speak(text, button = null) {
    return speakSegments(splitSentences(text).map((part) => ({ text: part.text, node: null, start: part.start, end: part.end })), button);
  }

  const sourcesOf = (element) => (element.dataset.speak ? [...document.querySelectorAll(element.dataset.speak)] : [element]);

  function textOf(source) {
    const copy = source.cloneNode(true);
    copy.querySelectorAll(".sound-listen").forEach((button) => button.remove());
    return copy.textContent;
  }

  function segmentsOf(sources) {
    return sources.flatMap((source) => {
      const text = textOf(source);
      const only = source.childNodes.length === 1 && source.firstChild.nodeType === 3 && source.firstChild.data === text;
      return splitSentences(text).map((part) => ({ text: part.text, node: only ? source.firstChild : null, start: part.start, end: part.end }));
    });
  }

  /* Mati lee un elemento por su cuenta (comentarios y resultados), con una breve pausa para no pisar el efecto de sonido. */
  function say(element, { delay = 0 } = {}) {
    if (!element || !state.enabled || !supportsSpeech()) return false;
    const token = ++state.sayToken;
    const run = () => { if (state.sayToken === token) speakSegments(segmentsOf(sourcesOf(element)), null); };
    if (delay > 0) setTimeout(run, delay); else run();
    return true;
  }

  /* ---------- Controles en pantalla ---------- */
  const SVG_NS = "http://www.w3.org/2000/svg";
  const stroke = { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" };
  const speaker = ["path", { d: "M4 9v6h4l5 4V5L8 9H4z", fill: "currentColor" }];
  const note = [["path", { d: "M9 18V6l10-2v11", ...stroke }], ["circle", { cx: "7", cy: "18", r: "3", fill: "currentColor" }], ["circle", { cx: "17", cy: "15", r: "3", fill: "currentColor" }]];
  const iconShapes = {
    on: [speaker, ["path", { d: "M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12", ...stroke }]],
    off: [speaker, ["path", { d: "M16 9l5 6M21 9l-5 6", ...stroke }]],
    stop: [["rect", { x: "6", y: "6", width: "12", height: "12", rx: "2", fill: "currentColor" }]],
    music: note,
    "music-off": [...note, ["path", { d: "M3 3l18 18", ...stroke }]],
  };

  function setIcon(node, name) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    for (const [tag, attributes] of iconShapes[name]) {
      const shape = document.createElementNS(SVG_NS, tag);
      Object.entries(attributes).forEach(([key, value]) => shape.setAttribute(key, value));
      svg.append(shape);
    }
    node.replaceChildren(svg);
  }

  function createButton(className, icon, label) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    const iconNode = document.createElement("span");
    iconNode.className = "sound-icon";
    iconNode.setAttribute("aria-hidden", "true");
    setIcon(iconNode, icon);
    button.append(iconNode);
    if (label) {
      const labelNode = document.createElement("span");
      labelNode.className = "sound-label";
      labelNode.textContent = label;
      button.append(labelNode);
    }
    return button;
  }

  function refreshControls() {
    if (typeof document !== "undefined") document.documentElement.dataset.sound = state.enabled ? "on" : "off";
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(state.enabled));
      setIconName(toggle.querySelector(".sound-icon"), state.enabled ? "on" : "off");
    });
    musicToggles.forEach((toggle) => {
      toggle.disabled = !state.enabled;
      toggle.setAttribute("aria-pressed", String(state.music));
      setIconName(toggle.querySelector(".sound-icon"), state.music ? "music" : "music-off");
    });
  }

  function setEnabled(value) {
    state.enabled = Boolean(value);
    writeFlag(SOUND_KEY, state.enabled);
    if (!state.enabled) { stopSpeaking(); stopMusic(); }
    refreshControls();
    if (state.enabled) { play("tap"); startMusic(); }
  }

  function setMusicEnabled(value) {
    state.music = Boolean(value);
    writeFlag(MUSIC_KEY, state.music);
    if (state.music) startMusic(); else stopMusic();
    refreshControls();
  }

  function mountControls() {
    const host = document.querySelector(".arithmetic-topbar, .menu-top-actions, .identify-topbar");
    const group = document.createElement("div");
    group.className = host ? "sound-controls" : "sound-controls sound-controls-floating";
    const toggle = createButton("sound-toggle", state.enabled ? "on" : "off", "Sonido");
    toggle.title = "Activar o silenciar los sonidos y la voz de Mati";
    toggle.addEventListener("click", () => setEnabled(!state.enabled));
    const musicToggle = createButton("sound-toggle sound-music", state.music ? "music" : "music-off", "");
    musicToggle.setAttribute("aria-label", "Música de fondo");
    musicToggle.title = "Activar o apagar la música de fondo";
    musicToggle.addEventListener("click", () => setMusicEnabled(!state.music));
    toggles.add(toggle);
    musicToggles.add(musicToggle);
    group.append(toggle, musicToggle);
    (host || document.body).append(group);
    refreshControls();
  }

  function attachListen(element) {
    const button = createButton("sound-listen", "on", "Escuchar");
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      if (state.listening === button) stopSpeaking();
      else speakSegments(segmentsOf(sourcesOf(element)), button);
    });
    listenButtons.add(button);
    if (element.dataset.speakMode === "append") element.append(button);
    else element.insertAdjacentElement("afterend", button);
    // Los textos dinámicos (preguntas, comentarios de Mati) ocultan el botón mientras están vacíos.
    const refresh = () => { button.hidden = !sourcesOf(element).some((source) => textOf(source).trim()); };
    refresh();
    if (typeof MutationObserver === "function") {
      const observer = new MutationObserver(refresh);
      sourcesOf(element).forEach((source) => observer.observe(source, { childList: true, characterData: true, subtree: true }));
    }
  }

  window.MatiAudio = {
    play, speak, say, toSpeech, splitSentences, stopSpeaking, setEnabled, setMusicEnabled,
    startMusic, stopMusic, musicState, rememberPosition,
    chooseVoice: pickVoice,
    isEnabled: () => state.enabled,
    isMusicEnabled: () => state.music,
    effects: Object.keys(effects),
  };

  if (typeof document === "undefined") return;
  document.addEventListener("DOMContentLoaded", () => {
    mountControls();
    if (supportsSpeech()) document.querySelectorAll("[data-speak]").forEach(attachListen);
    armMusic();
    window.addEventListener("pagehide", () => { rememberPosition(); stopSpeaking(); });
    document.addEventListener("visibilitychange", () => {
      if (!music || !state.context) return;
      if (document.hidden) state.context.suspend?.(); else state.context.resume?.();
    });
  });
})();

/* Shared behavior for the arithmetic practice, the final assessment and the missing-number game. Each page supplies its lesson data. */
(() => {
  "use strict";
  const lesson = window.ArithmeticLesson;
  if (!lesson) return;
  // The four operation modules practice by level (easy to hard); the other activities have a single set of exercises.
  const levels = lesson.levels || null;
  const pointsKey = "aventuraMatematicaPoints";
  const goalFor = (count) => Math.ceil(count * 0.8);
  const keyFor = (number) => `aventuraMatematica${lesson.id}${levels ? `-${number}` : ""}Best`;
  let exercises, total, passingCorrect, bestKey, level = 1;
  const useLevel = (number) => {
    level = number;
    exercises = levels ? levels[number - 1].exercises : lesson.exercises;
    total = exercises.length;
    passingCorrect = goalFor(total);
    bestKey = keyFor(number);
  };
  useLevel(1);
  const read = (key) => {
    try {
      const value = Number(localStorage.getItem(key));
      return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
    } catch { return 0; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, String(value)); } catch { /* Practice works without storage. */ }
  };
  // Best results of this visit, so levels still unlock in order when the browser blocks storage.
  const visitBest = {};
  document.addEventListener("DOMContentLoaded", () => {
    const find = (name) => document.querySelector(`[data-${name}]`);
    const intro = find("lesson");
    const quiz = find("practice");
    const results = find("results");
    const form = find("answer-form");
    const input = find("answer");
    const submit = find("check");
    const next = find("next");
    const feedback = find("feedback");
    const mati = find("mati");
    let questions = [], index = 0, correct = 0, answered = false;
    let responses = [];
    const show = (section) => {
      [intro, quiz, results].forEach((item) => { item.hidden = item !== section; });
    };
    const levelName = () => levels ? levels[level - 1].name : "";
    const levelInput = (number) => document.querySelector(`[data-level="${number}"]`);
    const levelText = (part, number) => document.querySelector(`[data-level-${part}="${number}"]`);
    const bestAt = (number) => Math.min(levels[number - 1].exercises.length, Math.max(read(keyFor(number)), visitBest[keyFor(number)] || 0));
    const passedAt = (number) => bestAt(number) >= goalFor(levels[number - 1].exercises.length);
    // Levels open one at a time: the first is always open and each next one opens when the one before is passed.
    const unlockedAt = (number) => number === 1 || passedAt(number - 1);
    // The first level whose goal is not reached yet (always open); 0 once the learner has passed them all.
    const pendingLevel = () => levels.findIndex((_, index) => !passedAt(index + 1)) + 1;
    const selectLevel = (number) => {
      if (!unlockedAt(number)) return;
      useLevel(number);
      levelInput(number).checked = true;
      find("start").textContent = `¡Vamos a practicar el nivel ${levelName()}!`;
    };
    const refreshLevels = () => {
      if (!levels) return;
      const pending = pendingLevel();
      levels.forEach((item, index) => {
        const number = index + 1, best = bestAt(number), count = item.exercises.length;
        const open = unlockedAt(number);
        levelText("name", number).textContent = `Nivel ${number} · ${item.name}`;
        levelText("description", number).textContent = item.description;
        levelInput(number).dataset.passed = String(passedAt(number));
        levelInput(number).dataset.locked = String(!open);
        levelInput(number).disabled = !open;
        levelText("status", number).textContent = passedAt(number) ? `¡Superado! ${best} de ${count}`
          : !open ? `🔒 Se abre al superar el nivel ${number - 1}`
          : best > 0 ? `Tu mejor resultado: ${best} de ${count}`
          : number === pending && number === 1 ? "Empieza por aquí" : "Sigue con este nivel";
      });
    };
    const pose = (name, alt) => {
      mati.src = `../assets/images/mati-${name || "encouraging"}.png`;
      mati.alt = alt;
    };
    const render = () => {
      answered = false;
      const question = questions[index];
      find("counter").textContent = `${levels ? `Nivel ${levelName()} · ` : ""}Ejercicio ${index + 1} de ${total}`;
      find("progress").value = index;
      find("question").textContent = question.statement;
      find("expression").textContent = question.expression || `${question.a} ${question.symbol || lesson.symbol} ${question.b} = ?`;
      window.ArithmeticVisuals?.render(find("quantity-visual"), question.operation || lesson.id, question);
      input.value = "";
      input.disabled = false;
      submit.disabled = false;
      next.hidden = true;
      feedback.textContent = "¡Puedes hacerlo! Cuenta los objetos y escribe tu respuesta. Yo te acompaño.";
      feedback.removeAttribute("data-correct");
      next.textContent = index === total - 1 ? "Ver resultados" : "Siguiente ejercicio";
      pose("", "Mati acompaña el ejercicio");
      // Let learners read before opening the mobile keyboard.
      find("counter").tabIndex = -1;
      find("counter").focus();
    };
    const start = () => {
      window.MatiAudio?.stopSpeaking();
      questions = [...exercises];
      for (let i = questions.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      index = 0;
      correct = 0;
      responses = [];
      show(quiz);
      render();
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (answered) return;
      if (!/^\d+$/.test(input.value.trim()) || !Number.isSafeInteger(Number(input.value))) {
        feedback.textContent = "Escribe un número entero mayor o igual a cero.";
        input.focus();
        return;
      }
      const question = questions[index];
      const isCorrect = Number(input.value) === question.answer;
      answered = true;
      if (isCorrect) correct += 1;
      responses.push({ question, answer: Number(input.value), isCorrect });
      if (lesson.deferFeedback) {
        // The final assessment must not reveal whether an answer was right, so its sound is neutral.
        window.MatiAudio?.play("tap");
        feedback.textContent = "¡Respuesta guardada! Sigue con el próximo ejercicio. Al final revisaremos tus resultados juntos.";
      } else {
        window.MatiAudio?.play(isCorrect ? "correct" : "wrong");
        feedback.dataset.correct = String(isCorrect);
        feedback.textContent = `${isCorrect ? "¡Muy bien!" : "Sigamos aprendiendo."} ${question.explanation}`;
        window.ArithmeticVisuals?.render(find("quantity-visual"), question.operation || lesson.id, question, true);
        pose(isCorrect ? "congratulating" : "thinking", isCorrect ? "Mati felicita tu respuesta" : "Mati te ayuda a pensar");
        window.MatiAudio?.say(feedback, { delay: 500 });
      }
      input.disabled = true;
      submit.disabled = true;
      find("progress").value = index + 1;
      next.hidden = false;
      // Keep Mati's explanation in view; Tab then reaches the next action.
      feedback.tabIndex = -1;
      feedback.focus();
    });
    next.addEventListener("click", () => {
      if (!answered) return;
      window.MatiAudio?.stopSpeaking();
      if (index < total - 1) { index += 1; render(); return; }
      const best = Math.min(total, read(bestKey));
      const gained = Math.max(0, correct - best) * 10;
      visitBest[bestKey] = Math.max(visitBest[bestKey] || 0, correct);
      if (correct > best) write(bestKey, correct);
      if (gained > 0) write(pointsKey, read(pointsKey) + gained);
      find("result-title").textContent = correct >= passingCorrect ? "¡Objetivo alcanzado!" : "¡Sigue practicando!";
      find("result-correct").textContent = correct;
      find("result-incorrect").textContent = total - correct;
      find("percent").textContent = `${Math.round(correct / total * 100)} %`;
      find("points-earned").textContent = `${correct * 10} puntos en este intento. ${gained} puntos nuevos para tu aventura.`;
      // The message states the real result: a perfect attempt is not described as "at least 80 %".
      const lastLevel = levels && level === levels.length ? " ¡Completaste el último nivel!" : "";
      find("result-message").textContent = correct === total
        ? `¡Perfecto! Resolviste correctamente los ${total} ejercicios. ¡Estoy muy orgulloso de tu esfuerzo!${lastLevel}`
        : correct >= passingCorrect
          ? `¡Lo lograste! Resolviste correctamente ${correct} de ${total} ejercicios (${Math.round(correct / total * 100)} %) y la meta era el 80 %. ¡Estoy orgulloso de tu esfuerzo!${lastLevel}`
          : `¡Cada intento te ayuda a aprender! Necesitas ${passingCorrect} respuestas correctas de ${total}. Vamos a repasar juntos.`;
      if (levels) {
        const nextLevel = find("next-level");
        find("result-level").textContent = `Nivel ${level} · ${levelName()}`;
        nextLevel.hidden = !(correct >= passingCorrect && level < levels.length);
        if (!nextLevel.hidden) nextLevel.textContent = `Pasar al nivel ${levels[level].name}`;
        refreshLevels();
      }
      const resultMati = find("result-mati");
      if (resultMati) {
        resultMati.src = `../assets/images/mati-${correct >= passingCorrect ? "congratulating" : "encouraging"}.png`;
        resultMati.alt = correct >= passingCorrect ? "Mati celebra que alcanzaste la meta" : "Mati te anima a seguir practicando";
      }
      window.ArithmeticRecommendations?.render(find("review-topics"), find("review-links"), responses, lesson.id);
      window.MatiAudio?.play(correct >= passingCorrect ? "celebrate" : "encourage");
      if (lesson.deferFeedback) {
        window.ArithmeticRecommendations?.renderPerformance(find("performance"), responses);
        for (const operation of ["addition", "subtraction", "multiplication", "division"]) {
          const attempts = responses.filter(response => response.question.operation === operation);
          const hits = attempts.filter(response => response.isCorrect).length;
          find(`result-${operation}`).textContent = `${hits} de ${attempts.length} · ${Math.round(hits / attempts.length * 100)} %`;
        }
        find("answer-review").textContent = responses.map((response, i) =>
          `${i + 1}. ${response.question.a} ${response.question.symbol} ${response.question.b} = ${response.question.answer}. Tu respuesta: ${response.answer}. ${response.isCorrect ? "Correcta." : "Para repasar: " + response.question.explanation}`
        ).join("\n\n");
      }
      window.AventuraMatematicaNavigation?.renderStoredPoints();
      show(results);
      find("result-title").focus();
      window.MatiAudio?.say(find("result-message"), { delay: 900 });
    });
    if (levels) {
      levels.forEach((_, index) => levelInput(index + 1).addEventListener("change", () => selectLevel(index + 1)));
      refreshLevels();
      selectLevel(pendingLevel() || levels.length);
      find("next-level").addEventListener("click", () => { selectLevel(level + 1); start(); });
    }
    find("start").addEventListener("click", start);
    find("retry").addEventListener("click", start);
    find("review").addEventListener("click", () => { window.MatiAudio?.stopSpeaking(); show(intro); find("lesson-title").focus(); });
    const dialog = find("leave-dialog");
    find("leave").addEventListener("click", () => {
      find("leave-confirm").href = lesson.id === "game-missing" ? "games.html" : "menu.html";
      dialog.showModal();
    });
    find("stay").addEventListener("click", () => dialog.close());
    // Guard all outbound links while an attempt is active.
    document.querySelectorAll("a[data-outbound]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (!quiz.hidden) {
          event.preventDefault();
          find("leave-confirm").href = link.href;
          dialog.showModal();
        }
      });
    });
  });
})();

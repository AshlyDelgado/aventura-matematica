/* Shared behavior for the four OA2 activities. Each page supplies its lesson data. */
(() => {
  "use strict";
  const lesson = window.ArithmeticLesson;
  if (!lesson) return;
  const total = lesson.exercises.length;
  const passingCorrect = Math.ceil(total * 0.8);
  const pointsKey = "aventuraMatematicaPoints";
  const bestKey = `aventuraMatematica${lesson.id}Best`;
  const read = (key) => {
    try {
      const value = Number(localStorage.getItem(key));
      return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
    } catch { return 0; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, String(value)); } catch { /* Practice works without storage. */ }
  };
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
    const pose = (name, alt) => {
      mati.src = `../assets/images/mati-${name || "encouraging"}.png`;
      mati.alt = alt;
    };
    const render = () => {
      answered = false;
      const question = questions[index];
      find("counter").textContent = `Ejercicio ${index + 1} de ${total}`;
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
      input.focus();
    };
    const start = () => {
      questions = [...lesson.exercises];
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
        feedback.textContent = "¡Respuesta guardada! Sigue con el próximo ejercicio. Al final revisaremos tus resultados juntos.";
      } else {
        feedback.dataset.correct = String(isCorrect);
        feedback.textContent = `${isCorrect ? "¡Muy bien!" : "Sigamos aprendiendo."} ${question.explanation}`;
        window.ArithmeticVisuals?.render(find("quantity-visual"), question.operation || lesson.id, question, true);
        pose(isCorrect ? "congratulating" : "thinking", isCorrect ? "Mati felicita tu respuesta" : "Mati te ayuda a pensar");
      }
      input.disabled = true;
      submit.disabled = true;
      find("progress").value = index + 1;
      next.hidden = false;
      next.focus();
    });
    next.addEventListener("click", () => {
      if (!answered) return;
      if (index < total - 1) { index += 1; render(); return; }
      const best = Math.min(total, read(bestKey));
      const gained = Math.max(0, correct - best) * 10;
      if (correct > best) write(bestKey, correct);
      if (gained > 0) write(pointsKey, read(pointsKey) + gained);
      find("result-title").textContent = correct >= passingCorrect ? "¡Objetivo alcanzado!" : "¡Sigue practicando!";
      find("correct").textContent = correct;
      find("incorrect").textContent = total - correct;
      find("percent").textContent = `${Math.round(correct / total * 100)} %`;
      find("points-earned").textContent = `${correct * 10} puntos en este intento. ${gained} puntos nuevos para tu aventura.`;
      find("result-message").textContent = correct >= passingCorrect
        ? "Resolviste correctamente al menos el 80 % de los ejercicios."
        : `Vuelve a repasar y practica otra vez. Necesitas ${passingCorrect} respuestas correctas de ${total}.`;
      if (lesson.deferFeedback) {
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
    });
    find("start").addEventListener("click", start);
    find("retry").addEventListener("click", start);
    find("review").addEventListener("click", () => { show(intro); find("lesson-title").focus(); });
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

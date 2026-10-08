(() => {
  "use strict";
  // Each operation is practiced in four levels; it counts as one goal once all of its levels are passed.
  const operations = { addition: "Sumar", subtraction: "Restar", multiplication: "Multiplicar", division: "Dividir" };
  const levelNames = ["Fácil", "Medio", "Difícil", "Experto"];
  const activities = {
    identify: { title: "Identifica la operación", key: "Identify", total: 10, goal: 8 },
    final: { title: "Evaluación final", key: "final", total: 20, goal: 16 },
    "game-memory": { title: "Parejas matemáticas", key: "game-memory", total: 60, goal: 60 },
    "game-missing": { title: "El número escondido", key: "game-missing", total: 12, goal: 10 },
  };
  for (const [id, title] of Object.entries(operations)) {
    levelNames.forEach((name, index) => {
      activities[`${id}-${index + 1}`] = { title: `${title} · ${name}`, key: `${id}-${index + 1}`, total: 10, goal: 8 };
    });
  }
  const goals = [...Object.keys(operations), "identify", "final", "game-memory", "game-missing"];
  function getProgress(id) {
    const activity = activities[id];
    if (!activity) return null;
    let best = 0;
    try {
      const value = Number(window.localStorage.getItem(`aventuraMatematica${activity.key}Best`));
      if (Number.isFinite(value)) best = Math.min(activity.total, Math.max(0, Math.trunc(value)));
    } catch { /* A blocked storage area means there is no saved progress to display. */ }
    return { title: activity.title, best, total: activity.total, percent: Math.round(best / activity.total * 100), completed: best >= activity.goal };
  }
  function getOperationProgress(id) {
    if (!operations[id]) return null;
    const levels = levelNames.map((name, index) => ({ name, ...getProgress(`${id}-${index + 1}`) }));
    const passed = levels.filter(level => level.completed).length;
    return { title: operations[id], levels, passed, total: levels.length, completed: passed === levels.length };
  }
  const isCompleted = id => (getOperationProgress(id) || getProgress(id)).completed;
  function render() {
    document.querySelectorAll("[data-activity-progress]").forEach(element => {
      const id = element.dataset.activityProgress;
      const operation = getOperationProgress(id);
      if (operation) {
        element.textContent = `Niveles superados: ${operation.passed} de ${operation.total}`;
        element.classList.toggle("is-completed", operation.completed);
        return;
      }
      const progress = getProgress(id);
      if (!progress) return;
      element.textContent = id === "game-memory"
        ? `Parejas: ${progress.completed ? "juego completado" : "por completar"}`
        : `${id === "game-missing" ? "Número escondido · " : ""}Mejor resultado: ${progress.percent} % · ${progress.completed ? "Meta alcanzada" : "Por completar"}`;
      element.classList.toggle("is-completed", progress.completed);
    });
    const completed = goals.filter(isCompleted).length;
    document.querySelectorAll("[data-progress-summary]").forEach(element => {
      element.textContent = `${completed} de ${goals.length} metas alcanzadas`;
    });
  }
  window.AventuraMatematicaProgress = { getProgress, getOperationProgress, render };
  document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("storage", render);
  window.addEventListener("pageshow", render);
})();

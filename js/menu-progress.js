(() => {
  "use strict";
  const activities = {
    addition: { title: "Sumar", key: "addition", total: 10, goal: 8 },
    subtraction: { title: "Restar", key: "subtraction", total: 10, goal: 8 },
    multiplication: { title: "Multiplicar", key: "multiplication", total: 10, goal: 8 },
    division: { title: "Dividir", key: "division", total: 10, goal: 8 },
    identify: { title: "Identifica la operación", key: "Identify", total: 10, goal: 8 },
    final: { title: "Evaluación final", key: "final", total: 20, goal: 16 },
    "game-memory": { title: "Parejas matemáticas", key: "game-memory", total: 60, goal: 60 },
    "game-missing": { title: "El número escondido", key: "game-missing", total: 12, goal: 10 },
  };
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
  function render() {
    document.querySelectorAll("[data-activity-progress]").forEach(element => {
      const id = element.dataset.activityProgress;
      const progress = getProgress(id);
      if (!progress) return;
      element.textContent = id === "game-memory"
        ? `Parejas: ${progress.completed ? "juego completado" : "por completar"}`
        : `${id === "game-missing" ? "Número escondido · " : ""}Mejor resultado: ${progress.percent} % · ${progress.completed ? "Meta alcanzada" : "Por completar"}`;
      element.classList.toggle("is-completed", progress.completed);
      const link = element.closest("a");
      if (link && link.querySelectorAll("[data-activity-progress]").length === 1) {
        link.setAttribute("aria-label", `${progress.title}. ${element.textContent}`);
      }
    });
    const completed = Object.keys(activities).filter(id => getProgress(id).completed).length;
    document.querySelectorAll("[data-progress-summary]").forEach(element => {
      element.textContent = `${completed} de ${Object.keys(activities).length} metas alcanzadas`;
    });
  }
  window.AventuraMatematicaProgress = { getProgress, render };
  document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("storage", render);
  window.addEventListener("pageshow", render);
})();

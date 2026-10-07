(() => {
  "use strict";
  const topics = {
    addition: { title: "Repasar suma", href: "addition.html" },
    subtraction: { title: "Repasar resta", href: "subtraction.html" },
    multiplication: { title: "Repasar multiplicación", href: "multiplication.html" },
    division: { title: "Repasar división", href: "division.html" },
  };
  const names = { suma: "addition", resta: "subtraction", multiplicación: "multiplication", división: "division" };
  function getTopics(responses, defaultTopic) {
    const counts = new Map();
    for (const response of responses) {
      const question = response.question;
      const id = question.topic || question.operation || names[question.correctOperation] || defaultTopic;
      if (!topics[id]) continue;
      const stats = counts.get(id) || { attempts: 0, mistakes: 0 };
      stats.attempts += 1;
      if (!response.isCorrect) stats.mistakes += 1;
      counts.set(id, stats);
    }
    return [...counts].filter(([,stats]) => stats.mistakes > 0)
      .sort((a,b) => b[1].mistakes / b[1].attempts - a[1].mistakes / a[1].attempts)
      .map(([id,stats]) => ({ id, ...topics[id], mistakes: stats.mistakes }));
  }
  function render(section, list, responses, defaultTopic) {
    if (!section || !list) return;
    const suggestions = getTopics(responses, defaultTopic);
    list.replaceChildren();
    section.hidden = suggestions.length === 0;
    for (const suggestion of suggestions) {
      const link = document.createElement("a");
      link.className = "arithmetic-button arithmetic-secondary";
      link.href = suggestion.href;
      link.textContent = suggestion.title;
      list.append(link);
    }
  }
  const operationNames = { addition: "Suma", subtraction: "Resta", multiplication: "Multiplicación", division: "División" };
  const masteryRate = 0.8;
  const joinNames = (items) => items.map((item) => item.name).reduce((text, name, index, all) =>
    index === 0 ? name : `${text}${index === all.length - 1 ? " y " : ", "}${name}`, "");
  /* Reconoce la(s) operación(es) dominada(s) y la(s) pendiente(s) de refuerzo según los aciertos por operación. */
  function getPerformance(responses) {
    const stats = Object.keys(operationNames).map((id) => ({ id, name: operationNames[id], href: topics[id].href, attempts: 0, hits: 0 }));
    for (const response of responses) {
      const stat = stats.find((item) => item.id === (response.question.operation || response.question.topic));
      if (!stat) continue;
      stat.attempts += 1;
      if (response.isCorrect) stat.hits += 1;
    }
    const played = stats.filter((stat) => stat.attempts > 0).map((stat) => ({ ...stat, rate: stat.hits / stat.attempts }));
    if (!played.length) return { mastered: [], reinforce: [], masteredText: "", reinforceText: "" };
    const best = Math.max(...played.map((stat) => stat.rate));
    const worst = Math.min(...played.map((stat) => stat.rate));
    const mastered = best >= masteryRate ? played.filter((stat) => stat.rate === best) : [];
    let reinforce;
    if (worst === 1) reinforce = [];
    else if (worst === best) reinforce = best >= masteryRate ? [] : played;
    else reinforce = played.filter((stat) => stat.rate === worst);
    // Las operaciones empatadas comparten la misma proporción, así que basta mostrar el resultado de la primera.
    const describe = (items) => `${joinNames(items)}: ${items[0].hits} de ${items[0].attempts} aciertos`;
    const masteredText = !mastered.length
      ? "Todavía no hay una operación dominada. ¡Con práctica la vas a lograr!"
      : mastered.length === played.length && played.length > 1
        ? `¡Dominaste las ${played.length} operaciones! ${mastered[0].hits} de ${mastered[0].attempts} aciertos en cada una.`
        : `${describe(mastered)}. ¡La dominas!`;
    const reinforceText = worst === 1
      ? "Ninguna. ¡Acertaste todos los ejercicios!"
      : !reinforce.length
        ? "Ninguna necesita refuerzo urgente. Repasa los ejercicios que fallaste para llegar a la meta perfecta."
        : `${describe(reinforce)}. Mati te sugiere repasarla.`;
    return { mastered, reinforce, masteredText, reinforceText };
  }
  function renderPerformance(section, responses) {
    if (!section) return;
    const performance = getPerformance(responses);
    section.hidden = !performance.masteredText;
    section.querySelector("[data-performance-mastered]").textContent = performance.masteredText;
    section.querySelector("[data-performance-reinforce]").textContent = performance.reinforceText;
    const links = section.querySelector("[data-performance-links]");
    links.replaceChildren();
    for (const stat of performance.reinforce) {
      const link = document.createElement("a");
      link.className = "arithmetic-button arithmetic-secondary";
      link.href = stat.href;
      link.textContent = `Repasar ${stat.name.toLowerCase()}`;
      links.append(link);
    }
  }
  window.ArithmeticRecommendations = { getTopics, render, getPerformance, renderPerformance };
})();

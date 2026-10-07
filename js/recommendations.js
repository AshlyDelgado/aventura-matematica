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
  window.ArithmeticRecommendations = { getTopics, render };
})();

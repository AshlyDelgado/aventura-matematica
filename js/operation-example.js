/* Examples advance on demand, so learners control the pace. */
(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const example = document.querySelector("[data-operation-example]");
    if (!example) return;
    const operation = example.dataset.operationExample;
    const visuals = example.querySelector("[data-example-visuals]");
    const message = example.querySelector("[data-example-message]");
    const equation = example.querySelector("[data-example-equation]");
    const next = example.querySelector("[data-example-next]");
    const reset = example.querySelector("[data-example-reset]");
    const config = {
      subtraction: { max: 4, button: "Prestar un lápiz" },
      multiplication: { max: 4, button: "Añadir una bolsa" },
      division: { max: 4, button: "Dar una ficha a cada persona" },
    }[operation];
    if (!config) return;
    let step = 0;
    const render = () => {
      if (operation === "subtraction") {
        window.ArithmeticVisuals.render(visuals, operation, { a: 9, b: step }, true);
        message.textContent = step ? `Prestaste ${step} de los 4 lápices. Te quedan ${9 - step}.` : "Cuenta los 9 lápices. Vamos a prestar 4, uno por uno.";
        equation.textContent = `9 − ${step} = ${9 - step}`;
      } else if (operation === "multiplication") {
        window.ArithmeticVisuals.render(visuals, operation, { a: step, b: 3 });
        message.textContent = step ? `Hay ${step} ${step === 1 ? "bolsa" : "bolsas"} con 3 canicas en cada una. Cuenta las canicas: ${step * 3}.` : "Vamos a juntar 4 bolsas con 3 canicas cada una.";
        equation.textContent = `${step} × 3 = ${step * 3}`;
      } else {
        window.ArithmeticVisuals.render(example.querySelector("[data-example-pool]"), "game-missing", {
          visualTotal: 12 - step * 3, visualLabel: `Fichas por repartir: ${12 - step * 3}`,
        });
        window.ArithmeticVisuals.render(visuals, operation, { a: step * 3, b: 3 }, true);
        message.textContent = `De las 12 fichas, quedan ${12 - step * 3} por repartir. Cada persona tiene ${step}.`;
        equation.textContent = step === 4 ? "12 ÷ 3 = 4" : `Repartidas: ${step * 3} de 12`;
      }
      if (step === config.max) message.textContent += " ¡Así se resuelve!";
      next.disabled = step === config.max;
      next.textContent = next.disabled ? "¡Ejemplo completado!" : config.button;
    };
    next.addEventListener("click", () => { if (step < config.max) { step += 1; render(); if (step === config.max) reset.focus(); } });
    reset.addEventListener("click", () => { step = 0; render(); next.focus(); });
    render();
  });
})();

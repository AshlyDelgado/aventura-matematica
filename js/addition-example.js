/* A paced visual example: every click adds exactly one apple. */
(() => {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const example = document.querySelector("[data-apple-example]");
    if (!example) return;
    const find = (name) => example.querySelector(`[data-${name}]`);
    const initial = find("initial-apples");
    const received = find("new-apples");
    const instruction = find("apple-instruction");
    const equation = find("apple-equation");
    const next = find("apple-next");
    const apples = [];
    let added = 0;
    const createApple = (number, isNew) => {
      const apple = document.createElement("span");
      apple.className = `example-apple${isNew ? " is-waiting" : ""}`;
      const fruit = document.createElement("span");
      fruit.className = "example-apple-fruit";
      fruit.textContent = "🍎";
      const count = document.createElement("span");
      count.className = "example-apple-number";
      count.textContent = number;
      apple.append(fruit, count);
      return apple;
    };
    for (let number = 1; number <= 5; number += 1) initial.append(createApple(number, false));
    for (let number = 6; number <= 8; number += 1) {
      const apple = createApple(number, true);
      apples.push(apple);
      received.append(apple);
    }
    const reset = () => {
      added = 0;
      apples.forEach(apple => { apple.classList.remove("is-added"); apple.classList.add("is-waiting"); });
      instruction.textContent = "Empieza con 5 manzanas. Añade las nuevas una por una.";
      equation.textContent = "5 + 0 = 5";
      equation.setAttribute("aria-label", "Total actual: 5 manzanas");
      next.disabled = false;
      next.textContent = "Añadir una manzana";
    };
    next.addEventListener("click", () => {
      if (added >= apples.length) return;
      const apple = apples[added];
      apple.classList.remove("is-waiting");
      apple.classList.add("is-added");
      added += 1;
      const total = 5 + added;
      equation.textContent = `5 + ${added} = ${total}`;
      equation.setAttribute("aria-label", `Cinco más ${added} es igual a ${total}. Total actual: ${total} manzanas.`);
      instruction.textContent = added === 3
        ? "¡Ahora tienes 8 manzanas! Juntaste las 5 que tenías con las 3 nuevas: 5 + 3 = 8."
        : `Añadiste ${added === 1 ? "la primera manzana" : "la segunda manzana"}. Cuenta: ${total}. Ahora tienes ${total} manzanas.`;
      next.textContent = added === 3 ? "¡Ya juntamos las 8!" : "Añadir otra manzana";
      next.disabled = added === 3;
      if (added === 3) find("apple-reset").focus();
    });
    find("apple-reset").addEventListener("click", () => { reset(); next.focus(); });
  });
})();

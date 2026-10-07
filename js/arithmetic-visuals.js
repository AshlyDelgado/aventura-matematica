/* Quantity models keep every drawing aligned with the exercise operands. */
(() => {
  "use strict";
  function describe(operation, question, answered = false) {
    const { a, b } = question;
    if (operation === "addition") return [
      { label: `Ya tienes ${a} calcomanías`, count: a, kind: "sticker" },
      { label: `Recibes ${b} calcomanías más`, count: b, kind: "sticker", incoming: true },
    ];
    if (operation === "subtraction") return [
      { label: answered ? `Tenías ${a} lápices; prestaste ${b}` : `Tienes ${a} lápices. Vas a prestar ${b}`, count: a, kind: "pencil", removed: answered ? b : 0 },
    ];
    if (operation === "multiplication") return Array.from({ length: a }, (_, index) => ({
      label: `Bolsa ${index + 1}: ${b} canicas`, count: b, kind: "marble", bag: true,
    }));
    if (operation === "division") return answered
      ? Array.from({ length: b }, (_, index) => ({ label: `Persona ${index + 1}: ${a / b} fichas`, count: a / b, kind: "token", person: true }))
      : [{ label: `${a} fichas para repartir`, count: a, kind: "token" },
        { label: `Reparte por igual entre ${b} personas`, count: b, kind: "person" }];
    return [];
  }
  function render(container, operation, question, answered = false) {
    if (!container) return;
    const fragment = document.createDocumentFragment();
    const hint = document.createElement("p");
    hint.className = "quantity-hint";
    hint.textContent = answered ? "Observa cómo se resuelve con los objetos." : "Cada dibujo representa un objeto. Puedes contarlos para ayudarte.";
    fragment.append(hint);
    const groups = document.createElement("div");
    groups.className = `quantity-groups quantity-${operation}`;
    describe(operation, question, answered).forEach(group => {
      const card = document.createElement("div");
      card.className = `quantity-card${group.incoming ? " quantity-incoming" : ""}${group.bag ? " quantity-bag" : ""}`;
      const label = document.createElement("p");
      label.className = "quantity-label";
      label.textContent = group.label;
      const objects = document.createElement("div");
      objects.className = "quantity-objects";
      objects.setAttribute("aria-hidden", "true");
      for (let index = 0; index < group.count; index += 1) {
        const item = document.createElement("span");
        const removed = index >= group.count - (group.removed || 0);
        item.className = `quantity-object quantity-${group.kind}${removed ? " quantity-removed" : ""}`;
        if (group.kind === "sticker") item.textContent = ["★", "♥", "●"][index % 3];
        if (group.kind === "pencil") item.textContent = "✏️";
        if (group.kind === "person") item.textContent = "👤";
        item.style.setProperty("--object-index", index);
        objects.append(item);
      }
      card.append(label, objects);
      groups.append(card);
    });
    fragment.append(groups);
    container.replaceChildren(fragment);
  }
  window.ArithmeticVisuals = { describe, render };
})();

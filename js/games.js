(() => {
  "use strict";
  const pairs = [
    { expression: "3 + 2", result: 5 }, { expression: "9 − 3", result: 6 },
    { expression: "3 × 3", result: 9 }, { expression: "12 ÷ 3", result: 4 },
    { expression: "7 + 4", result: 11 }, { expression: "15 − 7", result: 8 },
  ];
  function createMemory(random = Math.random) {
    const cards = pairs.flatMap((pair, pairId) => [
      { pairId, text: pair.expression, matched: false }, { pairId, text: String(pair.result), matched: false },
    ]);
    for (let i = cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    let selected = [], matches = 0, attempts = 0;
    return {
      cards,
      get matches() { return matches; }, get attempts() { return attempts; },
      select(index) {
        if (!cards[index] || cards[index].matched || selected.includes(index) || selected.length === 2) return { type: "ignored" };
        selected.push(index);
        if (selected.length === 1) return { type: "first" };
        attempts += 1;
        if (cards[selected[0]].pairId !== cards[selected[1]].pairId) return { type: "miss" };
        const indices = [...selected];
        indices.forEach(i => { cards[i].matched = true; });
        selected = [];
        matches += 1;
        return { type: matches === pairs.length ? "complete" : "match", indices };
      },
      clearMiss() { const indices = [...selected]; if (selected.length === 2) selected = []; return indices; },
    };
  }
  window.MathGames = { createMemory };
  document.addEventListener("DOMContentLoaded", () => {
    const find = name => document.querySelector(`[data-${name}]`);
    const hub = find("games-hub");
    const memory = find("memory");
    if (!hub || !memory) return;
    const board = find("memory-board");
    const message = find("game-message");
    const mati = find("game-mati");
    let game, buttons = [], active = false;
    const say = (text, pose = "encouraging", speak = false) => {
      message.textContent = text;
      mati.src = `../assets/images/mati-${pose}.png`;
      mati.alt = pose === "congratulating" ? "Mati celebra tu logro" : "Mati te acompaña en el juego";
      if (speak) window.MatiAudio?.say(message, { delay: 350 });
    };
    const update = () => { find("memory-status").textContent = `${game.matches} de 6 parejas · ${game.attempts} intentos`; };
    function award(key, score) {
      try {
        const read = name => { const n = Number(localStorage.getItem(name)); return Number.isFinite(n) ? Math.max(0,Math.trunc(n)) : 0; };
        const gained = Math.max(0,score - read(key));
        localStorage.setItem(key,String(Math.max(score,read(key))));
        localStorage.setItem("aventuraMatematicaPoints",String(read("aventuraMatematicaPoints") + gained));
        window.AventuraMatematicaNavigation?.renderStoredPoints();
        return gained;
      } catch { return 0; }
    }
    const startMemory = () => {
      window.MatiAudio?.stopSpeaking();
      active = true;
      hub.hidden = true;
      memory.hidden = false;
      find("memory-continue").hidden = true;
      game = createMemory();
      board.replaceChildren();
      buttons = game.cards.map((card,index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "memory-card";
        button.textContent = "?";
        button.setAttribute("aria-label",`Carta ${index + 1}, oculta`);
        button.addEventListener("click", () => {
          const result = game.select(index);
          if (result.type === "ignored") return;
          button.textContent = card.text;
          button.setAttribute("aria-label",card.text);
          button.classList.add("is-revealed");
          if (result.type === "miss") {
            window.MatiAudio?.play("wrong");
            say("Estas cartas no forman pareja. Resuelve la operación y recuerda dónde está cada resultado.","thinking",true);
            find("memory-continue").hidden = false;
            find("memory-continue").focus();
          } else if (result.type === "match" || result.type === "complete") {
            result.indices.forEach(i => { buttons[i].disabled = true; buttons[i].classList.add("is-matched"); });
            // A disabled button keeps keyboard focus but ignores Enter and Space, so move on to the next open card.
            buttons.find(item => !item.disabled)?.focus();
            window.MatiAudio?.play(result.type === "complete" ? "celebrate" : "match");
            say("¡Muy bien! La operación y su resultado forman una pareja.","congratulating",true);
            if (result.type === "complete") {
              active = false;
              const gained = award("aventuraMatematicagame-memoryBest",60);
              say(`¡Encontraste las 6 parejas! Ganaste ${gained} puntos nuevos. Puedes jugar de nuevo para practicar.`,"congratulating",true);
              find("memory-restart").focus();
            }
          } else {
            window.MatiAudio?.play("flip");
            say("Ahora busca la carta que forma pareja con esta.");
          }
          update();
        });
        board.append(button);
        return button;
      });
      say("Elige dos cartas. Busca una operación y su resultado. ¡Sin prisa!");
      update();
      buttons[0].focus();
    };
    find("memory-start").addEventListener("click",startMemory);
    find("memory-restart").addEventListener("click",startMemory);
    find("memory-continue").addEventListener("click", () => {
      window.MatiAudio?.stopSpeaking();
      const indices = game.clearMiss();
      indices.forEach(i => { buttons[i].textContent = "?"; buttons[i].classList.remove("is-revealed"); buttons[i].setAttribute("aria-label",`Carta ${i + 1}, oculta`); });
      find("memory-continue").hidden = true;
      say("¡Vamos de nuevo! Elige otras dos cartas.");
      buttons.find(button => !button.disabled)?.focus();
    });
    const dialog = find("games-leave-dialog");
    const leave = () => { window.MatiAudio?.stopSpeaking(); active = false; memory.hidden = true; hub.hidden = false; dialog.close(); find("memory-start").focus(); };
    find("games-back").addEventListener("click", () => { if (active) dialog.showModal(); else leave(); });
    find("games-stay").addEventListener("click", () => dialog.close());
    find("games-leave-confirm").addEventListener("click",leave);
    const menu = find("games-menu");
    menu.addEventListener("click",event => {
      if (!active) return;
      event.preventDefault();
      // The explicit menu exit uses the same native dialog and keeps the game intact on cancel.
      find("games-menu-confirm").hidden = false;
      find("games-leave-confirm").hidden = true;
      dialog.showModal();
    });
    dialog.addEventListener("close", () => { find("games-menu-confirm").hidden = true; find("games-leave-confirm").hidden = false; });
  });
})();

(() => {
  const POINTS_STORAGE_KEY = "aventuraMatematicaPoints";
  const BEST_STORAGE_KEY = "aventuraMatematicaIdentifyBest";
  const TOTAL_QUESTIONS = 10;
  const POINTS_PER_CORRECT = 10;
  const PASSING_CORRECT = 8;
  const DEFAULT_MATI_POSE = "normal";

  const matiPoses = {
    normal: {
      src: "../assets/images/mati.png",
      alt: "Mati observando la pregunta",
      className: "is-floating",
    },
    encouraging: {
      src: "../assets/images/mati-encouraging.png",
      alt: "Mati animando el reto",
      className: "is-floating",
    },
    congratulating: {
      src: "../assets/images/mati-congratulating.png",
      alt: "Mati felicitando por la respuesta",
      className: "is-celebrating",
    },
    thinking: {
      src: "../assets/images/mati-thinking.png",
      alt: "Mati pensando en la respuesta",
      className: "is-thinking",
    },
    resultCelebration: {
      src: "../assets/images/mati-congratulating.png",
      alt: "Mati celebrando el objetivo alcanzado",
      className: "is-result-celebrating",
    },
  };

  const questions = [
    {
      id: 1,
      statement:
        "Ana tenía 5 manzanas y su mamá le dio 3 más. ¿Qué operación debe utilizar para saber cuántas tiene ahora?",
      correctOperation: "suma",
      explanation: "Cuando una cantidad aumenta porque recibe más elementos, usamos la suma.",
    },
    {
      id: 2,
      statement:
        "En un autobús viajaban 12 personas y bajaron 4. ¿Qué operación permite saber cuántas quedaron?",
      correctOperation: "resta",
      explanation: "Cuando una parte se va o se quita, usamos la resta para saber cuánto queda.",
    },
    {
      id: 3,
      statement:
        "Hay 4 bolsas y cada bolsa contiene 3 canicas. ¿Qué operación permite saber cuántas canicas hay en total?",
      correctOperation: "multiplicación",
      explanation: "Cuando hay grupos iguales, usamos la multiplicación para encontrar el total.",
    },
    {
      id: 4,
      statement:
        "Se deben repartir 12 caramelos por igual entre 3 niños. ¿Qué operación se debe utilizar?",
      correctOperation: "división",
      explanation: "Cuando repartimos una cantidad en partes iguales, usamos la división.",
    },
    {
      id: 5,
      statement:
        "Sofía tenía 7 calcomanías y compró 5 más. ¿Qué operación permite calcular cuántas tiene en total?",
      correctOperation: "suma",
      explanation: "Comprar más calcomanías aumenta la cantidad inicial, por eso se suma.",
    },
    {
      id: 6,
      statement:
        "Había 15 pájaros en un árbol y 6 se fueron volando. ¿Qué operación permite saber cuántos quedaron?",
      correctOperation: "resta",
      explanation: "Si algunos pájaros se fueron, quitamos esa cantidad con una resta.",
    },
    {
      id: 7,
      statement:
        "En el jardín hay 5 filas con 2 plantas en cada fila. ¿Qué operación permite calcular el total de plantas?",
      correctOperation: "multiplicación",
      explanation: "Las filas tienen la misma cantidad de plantas, así que multiplicamos grupos iguales.",
    },
    {
      id: 8,
      statement:
        "La maestra repartirá 20 lápices por igual entre 4 mesas. ¿Qué operación debe utilizar?",
      correctOperation: "división",
      explanation: "Repartir por igual entre mesas se resuelve con una división.",
    },
    {
      id: 9,
      statement:
        "Carlos obtuvo 8 puntos en un juego y después ganó 6 puntos más. ¿Qué operación permite conocer su puntaje total?",
      correctOperation: "suma",
      explanation: "Ganar puntos aumenta el puntaje, entonces usamos una suma.",
    },
    {
      id: 10,
      statement:
        "Había 18 globos y se reventaron 7. ¿Qué operación permite saber cuántos quedan?",
      correctOperation: "resta",
      explanation: "Los globos reventados se quitan del total, por eso usamos la resta.",
    },
  ];

  const operationLabels = {
    suma: "sumar",
    resta: "restar",
    multiplicación: "multiplicar",
    división: "dividir",
  };

  const selectors = {
    start: "[data-identify-start]",
    quiz: "[data-identify-quiz]",
    results: "[data-identify-results]",
    startButton: "[data-start-challenge]",
    retryButton: "[data-retry-challenge]",
    nextButton: "[data-next-question]",
    counter: "[data-question-counter]",
    attemptPoints: "[data-attempt-points]",
    progressBar: "[data-progress-bar]",
    questionTitle: "#identify-question-title",
    statement: "[data-question-statement]",
    options: "[data-operation]",
    feedback: "[data-feedback]",
    resultTitle: "#identify-results-title",
    resultBadge: "[data-result-badge]",
    resultStatus: "[data-result-status]",
    resultMessage: "[data-result-message]",
    resultCorrect: "[data-result-correct]",
    resultIncorrect: "[data-result-incorrect]",
    resultPercent: "[data-result-percent]",
    resultPoints: "[data-result-points]",
    resultNewPoints: "[data-result-new-points]",
    matiImages: "[data-mati-image]",
    menuWarningOpen: "[data-menu-warning-open]",
    menuWarningModal: "[data-menu-warning-modal]",
    menuWarningCancel: "[data-menu-warning-cancel]",
  };

  const elements = {};
  let currentQuestions = [];
  let currentIndex = 0;
  let correctAnswers = 0;
  let hasAnsweredCurrent = false;

  function preloadMatiImages() {
    if (typeof window.Image !== "function") {
      return;
    }

    Object.values(matiPoses).forEach((pose) => {
      const image = new window.Image();
      image.src = pose.src;
    });
  }

  function setMatiPose(poseName) {
    const pose = matiPoses[poseName] || matiPoses[DEFAULT_MATI_POSE];
    const animationClasses = Object.values(matiPoses).map((matiPose) => matiPose.className);

    elements.matiImages.forEach((image) => {
      image.classList.remove(...animationClasses);
      image.src = pose.src;
      image.alt = pose.alt;
      image.dataset.currentPose = poseName;
      image.onerror = () => {
        image.onerror = null;
        image.src = matiPoses.normal.src;
        image.alt = matiPoses.normal.alt;
      };

      // Force a reflow so short reaction animations replay on repeated answers.
      void image.offsetWidth;
      image.classList.add(pose.className);
    });
  }

  function getNumberFromStorage(key) {
    let storedValue;

    try {
      storedValue = window.localStorage.getItem(key);
    } catch (error) {
      return 0;
    }

    if (storedValue === null) {
      return 0;
    }

    const parsedValue = Number(storedValue);

    if (!Number.isFinite(parsedValue)) {
      setNumberInStorage(key, 0);
      return 0;
    }

    return Math.max(0, Math.trunc(parsedValue));
  }

  function setNumberInStorage(key, value) {
    try {
      window.localStorage.setItem(key, String(Math.max(0, Math.trunc(value))));
    } catch (error) {
      // The activity remains usable even when storage is unavailable.
    }
  }

  function updateAllPointDisplays() {
    if (window.AventuraMatematicaNavigation?.renderStoredPoints) {
      window.AventuraMatematicaNavigation.renderStoredPoints();
      return;
    }

    const points = getNumberFromStorage(POINTS_STORAGE_KEY);
    document.querySelectorAll("[data-points]").forEach((element) => {
      element.textContent = points;
    });
  }

  function shuffleQuestions(questionList) {
    const shuffled = [...questionList];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }

  function showSection(sectionToShow) {
    [elements.start, elements.quiz, elements.results].forEach((section) => {
      if (section) {
        section.hidden = section !== sectionToShow;
      }
    });
  }

  function resetOptionStates() {
    elements.options.forEach((option) => {
      option.disabled = false;
      option.classList.remove("is-selected", "is-correct", "is-incorrect");
      option.removeAttribute("aria-pressed");
    });
  }

  function renderQuestion() {
    const question = currentQuestions[currentIndex];
    const questionNumber = currentIndex + 1;
    hasAnsweredCurrent = false;

    elements.counter.textContent = `Pregunta ${questionNumber} de ${TOTAL_QUESTIONS}`;
    elements.attemptPoints.textContent = correctAnswers * POINTS_PER_CORRECT;
    elements.progressBar.style.width = `${((questionNumber - 1) / TOTAL_QUESTIONS) * 100}%`;
    elements.statement.textContent = question.statement;
    elements.feedback.textContent = "";
    elements.nextButton.disabled = true;
    elements.nextButton.textContent = questionNumber === TOTAL_QUESTIONS ? "Ver resultados" : "Siguiente";
    resetOptionStates();
    setMatiPose("normal");

    window.requestAnimationFrame(() => {
      elements.questionTitle.focus();
    });
  }

  function startAttempt() {
    currentQuestions = shuffleQuestions(questions);
    currentIndex = 0;
    correctAnswers = 0;
    showSection(elements.quiz);
    setMatiPose("normal");
    renderQuestion();
  }

  function handleAnswer(option) {
    if (hasAnsweredCurrent) {
      return;
    }

    hasAnsweredCurrent = true;
    const selectedOperation = option.dataset.operation;
    const question = currentQuestions[currentIndex];
    const isCorrect = selectedOperation === question.correctOperation;

    option.classList.add("is-selected", isCorrect ? "is-correct" : "is-incorrect");
    option.setAttribute("aria-pressed", "true");

    if (isCorrect) {
      correctAnswers += 1;
      elements.feedback.textContent = `¡Muy bien! Elegiste la operación correcta. ${question.explanation}`;
      setMatiPose("congratulating");
    } else {
      const correctLabel = operationLabels[question.correctOperation];
      elements.feedback.textContent = `Casi. Para esta situación necesitamos ${correctLabel}. ${question.explanation}`;
      setMatiPose("thinking");
    }

    elements.options.forEach((button) => {
      button.disabled = true;
    });

    elements.attemptPoints.textContent = correctAnswers * POINTS_PER_CORRECT;
    elements.progressBar.style.width = `${((currentIndex + 1) / TOTAL_QUESTIONS) * 100}%`;
    elements.nextButton.disabled = false;
    elements.nextButton.focus();
  }

  function goToNextQuestion() {
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      currentIndex += 1;
      renderQuestion();
      return;
    }

    showResults();
  }

  function openMenuWarning() {
    elements.menuWarningModal.hidden = false;
    elements.menuWarningCancel.focus();
  }

  function closeMenuWarning() {
    elements.menuWarningModal.hidden = true;
    elements.menuWarningOpen.focus();
  }

  function showResults() {
    const incorrectAnswers = TOTAL_QUESTIONS - correctAnswers;
    const percentage = (correctAnswers / TOTAL_QUESTIONS) * 100;
    const attemptPoints = correctAnswers * POINTS_PER_CORRECT;
    const previousBest = Math.min(TOTAL_QUESTIONS, getNumberFromStorage(BEST_STORAGE_KEY));
    const improvement = Math.max(0, correctAnswers - previousBest);
    const newPoints = improvement * POINTS_PER_CORRECT;
    const currentGlobalPoints = getNumberFromStorage(POINTS_STORAGE_KEY);
    const reachedGoal = correctAnswers >= PASSING_CORRECT;

    if (correctAnswers > previousBest) {
      setNumberInStorage(BEST_STORAGE_KEY, correctAnswers);
    }

    if (newPoints > 0) {
      setNumberInStorage(POINTS_STORAGE_KEY, currentGlobalPoints + newPoints);
    } else {
      setNumberInStorage(POINTS_STORAGE_KEY, currentGlobalPoints);
    }

    elements.resultCorrect.textContent = correctAnswers;
    elements.resultIncorrect.textContent = incorrectAnswers;
    elements.resultPercent.textContent = `${percentage}%`;
    elements.resultPoints.textContent = attemptPoints;
    elements.resultNewPoints.textContent =
      newPoints > 0
        ? `Ganaste ${newPoints} puntos nuevos para tu aventura.`
        : "No ganaste puntos nuevos esta vez porque ya habías alcanzado ese resultado.";

    elements.resultStatus.textContent = reachedGoal ? "¡Objetivo alcanzado!" : "Sigue practicando";
    elements.resultMessage.textContent = reachedGoal
      ? "Identificaste correctamente las operaciones en al menos el 80 % de las situaciones."
      : "Revisa las pistas e inténtalo nuevamente. Cada intento te ayuda a aprender.";
    elements.resultBadge.classList.toggle("is-earned", reachedGoal);
    setMatiPose(reachedGoal ? "resultCelebration" : "encouraging");

    showSection(elements.results);
    updateAllPointDisplays();

    window.requestAnimationFrame(() => {
      elements.resultTitle.focus();
    });
  }

  function cacheElements() {
    Object.entries(selectors).forEach(([key, selector]) => {
      if (key === "options") {
        elements[key] = [...document.querySelectorAll(selector)];
        return;
      }

      if (key === "matiImages") {
        elements[key] = [...document.querySelectorAll(selector)];
        return;
      }

      elements[key] = document.querySelector(selector);
    });
  }

  function hasRequiredElements() {
    const requiredKeys = Object.keys(selectors);

    return requiredKeys.every((key) => {
      if (key === "options") {
        return elements.options.length === 4;
      }

      if (key === "matiImages") {
        return elements.matiImages.length >= 3;
      }

      return Boolean(elements[key]);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    cacheElements();

    if (!hasRequiredElements()) {
      return;
    }

    updateAllPointDisplays();
    preloadMatiImages();
    setMatiPose("encouraging");
    elements.startButton.addEventListener("click", startAttempt);
    elements.retryButton.addEventListener("click", startAttempt);
    elements.nextButton.addEventListener("click", goToNextQuestion);
    elements.menuWarningOpen.addEventListener("click", openMenuWarning);
    elements.menuWarningCancel.addEventListener("click", closeMenuWarning);
    elements.menuWarningModal.addEventListener("click", (event) => {
      if (event.target === elements.menuWarningModal) {
        closeMenuWarning();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.menuWarningModal.hidden) {
        closeMenuWarning();
      }
    });

    elements.options.forEach((option) => {
      option.addEventListener("click", () => handleAnswer(option));
    });
  });
})();

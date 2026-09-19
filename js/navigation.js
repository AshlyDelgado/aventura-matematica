const POINTS_STORAGE_KEY = "aventuraMatematicaPoints";
const IDENTIFY_BEST_STORAGE_KEY = "aventuraMatematicaIdentifyBest";

function getStoredPoints() {
  let savedPoints;

  try {
    savedPoints = window.localStorage.getItem(POINTS_STORAGE_KEY);
  } catch (error) {
    return 0;
  }

  if (savedPoints === null) {
    return 0;
  }

  const parsedPoints = Number(savedPoints);

  if (!Number.isFinite(parsedPoints)) {
    try {
      window.localStorage.setItem(POINTS_STORAGE_KEY, "0");
    } catch (error) {
      return 0;
    }

    return 0;
  }

  return Math.max(0, Math.trunc(parsedPoints));
}

function renderStoredPoints() {
  const pointElements = document.querySelectorAll("[data-points]");

  if (!pointElements.length) {
    return;
  }

  const currentPoints = getStoredPoints();

  pointElements.forEach((element) => {
    element.textContent = currentPoints;
  });
}

function resetStoredProgress() {
  try {
    window.localStorage.setItem(POINTS_STORAGE_KEY, "0");
    window.localStorage.setItem(IDENTIFY_BEST_STORAGE_KEY, "0");
  } catch (error) {
    return;
  }

  renderStoredPoints();
}

function setupExitReset() {
  const exitButton = document.querySelector("[data-exit-reset]");
  const exitModal = document.querySelector("[data-exit-modal]");
  const confirmButton = document.querySelector("[data-exit-confirm]");
  const cancelButton = document.querySelector("[data-exit-cancel]");

  if (!exitButton || !exitModal || !confirmButton || !cancelButton) {
    return;
  }

  function openExitModal() {
    exitModal.hidden = false;
    cancelButton.focus();
  }

  function closeExitModal() {
    exitModal.hidden = true;
    exitButton.focus();
  }

  exitButton.addEventListener("click", openExitModal);
  cancelButton.addEventListener("click", closeExitModal);
  confirmButton.addEventListener("click", () => {
    resetStoredProgress();
    window.location.href = "../index.html";
  });

  exitModal.addEventListener("click", (event) => {
    if (event.target === exitModal) {
      closeExitModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !exitModal.hidden) {
      closeExitModal();
    }
  });
}

window.AventuraMatematicaNavigation = {
  getStoredPoints,
  renderStoredPoints,
  resetStoredProgress,
};

document.addEventListener("DOMContentLoaded", () => {
  renderStoredPoints();
  setupExitReset();
});

const POINTS_STORAGE_KEY = "aventuraMatematicaPoints";

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

window.AventuraMatematicaNavigation = {
  getStoredPoints,
  renderStoredPoints,
};

document.addEventListener("DOMContentLoaded", renderStoredPoints);

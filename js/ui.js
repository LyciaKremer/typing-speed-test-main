import { state } from "./state.js";
import { calculateWPM, calculateAccuracy } from "./stats.js";
import { saveBestScore } from "./storage.js";

export function renderUI(startOverlay) {
  const restartButton = document.querySelector(".button-dark");

  showScreen(null);

  startOverlay.classList.toggle("hidden", state.status !== "idle");
  restartButton?.classList.toggle("hidden", state.status !== "running");

  if (state.status === "finished") {
    if (state.screen === "baseline") {
      showScreen(".test-baseline");
    } else if (state.screen === "high-score") {
      showScreen(".test-high-score");
    } else {
      showScreen(".test-complete");
    }
  }
}

export function showScreen(screenClass) {
  const screens = document.querySelectorAll(
    ".test-complete, .test-high-score, .test-baseline",
  );

  screens.forEach((screen) => {
    screen.classList.remove("visible");
  });

  if (screenClass) {
    document.querySelector(screenClass).classList.add("visible");
  }
}

export function finishTest(startOverlay) {
  if (state.status === "finished") return;

  state.status = "finished";

  const timeElement = document.querySelector("[data-time]");
  if (timeElement) {
    timeElement.classList.remove("is-running");
  }

  const results = getResults();
  updateResultUI(results);

  if (state.isFirstTest) {
    state.screen = "baseline";
    state.isFirstTest = false;
    state.bestWPM = results.wpm;
  } else if (results.wpm > state.bestWPM) {
    state.bestWPM = results.wpm;
    state.screen = "high-score";
  } else {
    state.screen = "complete";
  }

  saveBestScore();
  renderUI(startOverlay);
}

function getResults() {
  const wpm = calculateWPM();
  const accuracy = calculateAccuracy();

  let correct = 0;
  for (let i = 0; i < state.typed.length; i++) {
    if (state.typed[i] === state.text[i]) correct++;
  }

  const incorrect = state.typed.length - correct;

  return { wpm, accuracy, correct, incorrect };
}

export function updateResultUI({ wpm, accuracy, correct, incorrect }) {
  const screens = document.querySelectorAll(
    ".test-complete, .test-high-score, .test-baseline",
  );

  screens.forEach((screen) => {
    const blocks = screen.querySelectorAll(".state-block");
    const wpmEl = blocks[0]?.querySelector("span");
    const accuracyEl = blocks[1]?.querySelector("span");
    const correctEl = screen.querySelector(".characters-correct");
    const incorrectEl = screen.querySelector(".characters-incorrect");

    if (wpmEl) wpmEl.textContent = wpm;

    if (accuracyEl) {
      accuracyEl.textContent = `${accuracy}%`;
      accuracyEl.classList.toggle("is-perfect", accuracy === 100);
      accuracyEl.classList.toggle("is-imperfect", accuracy < 100);
    }

    if (correctEl) correctEl.textContent = correct;
    if (incorrectEl) incorrectEl.textContent = incorrect;
  });
}

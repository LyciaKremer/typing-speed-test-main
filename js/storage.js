import { state } from "./state.js";

export function loadBestScore() {
  const saved = localStorage.getItem("bestWPM");

  if (saved) {
    state.bestWPM = Number(saved);
    document.querySelector("span.best-score").textContent = `${saved}WPM`;
  }
}

export function saveBestScore() {
  localStorage.setItem("bestWPM", state.bestWPM);
  document.querySelector("span.best-score").textContent = `${state.bestWPM}WPM`;
}
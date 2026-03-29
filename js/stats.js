import { state } from "./state.js";

export function calculateWPM() {
  if (!state.startTime) return 0;

  const timeInMinutes = (Date.now() - state.startTime) / 60000;
  const words = state.typed.length / 5;

  return Math.round(words / timeInMinutes || 0);
}

export function calculateAccuracy() {
  let correct = 0;

  for (let i = 0; i < state.typed.length; i++) {
    if (state.typed[i] === state.text[i]) correct++;
  }

  return Math.round((correct / state.typed.length) * 100 || 100);
}

export function updateStats(wpmEl, accEl) {
  wpmEl.textContent = calculateWPM();
  accEl.textContent = `${calculateAccuracy()}%`;
}

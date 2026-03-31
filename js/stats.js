import { state } from "./state.js";

function getCorrectCharacterCount() {
  let correct = 0;

  for (let i = 0; i < state.typed.length; i++) {
    if (state.typed[i] === state.text[i]) correct++;
  }

  return correct;
}

function getTypedWordCount() {
  return state.typed.split(/\s+/).filter(Boolean).length;
}

export function calculateWPM() {
  if (!state.startTime || state.typed.length === 0) return 0;

  return getTypedWordCount();
}

export function calculateAccuracy() {
  const correct = getCorrectCharacterCount();

  return Math.round((correct / state.typed.length) * 100 || 100);
}

export function updateStats(wpmEl, accEl) {
  const wpm = calculateWPM();
  const accuracy = calculateAccuracy();
  const shouldHighlightAccuracy =
    state.status !== "idle" && state.typed.length > 0;

  wpmEl.textContent = wpm;
  accEl.textContent = `${accuracy}%`;
  accEl.classList.toggle(
    "is-perfect",
    shouldHighlightAccuracy && accuracy === 100,
  );
  accEl.classList.toggle(
    "is-imperfect",
    shouldHighlightAccuracy && accuracy < 100,
  );
}

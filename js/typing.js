import { state } from "./state.js";
import { updateStats } from "./stats.js";
import { finishTest } from "./ui.js";

export function handleTyping(e, updateVisual, wpmEl, accEl, overlay) {
  if (state.status !== "running") return;

  const key = e.key;

  if (key === " ") e.preventDefault();
  if (key.length > 1 && key !== "Backspace") return;

  if (key === "Backspace") {
    e.preventDefault();
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    state.typed = state.typed.slice(0, -1);
    updateVisual();
    return;
  }

  const expectedChar = state.text[state.currentIndex];

  state.typed += key;
  state.currentIndex++;

  updateVisual();
  updateStats(wpmEl, accEl);

  if (state.currentIndex >= state.text.length) {
    finishTest(overlay);
  }
}

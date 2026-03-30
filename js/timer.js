import { state } from "./state.js";
import { finishTest } from "./ui.js";

export function getInitialTimeDisplay() {
  return state.mode === "timed"
    ? `0:${String(state.timeLimit).padStart(2, "0")}`
    : "0:00";
}

export function updateTimeAppearance(timeElement) {
  timeElement.classList.toggle("is-running", state.status === "running");
}

export function startTimer(timeElement, overlay) {
  timeElement.textContent = getInitialTimeDisplay();
  updateTimeAppearance(timeElement);

  setInterval(() => {
    updateTimeAppearance(timeElement);

    if (state.status !== "running") return;

    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);

    if (state.mode === "timed") {
      const remaining = state.timeLimit - elapsed;

      if (remaining <= 0) {
        timeElement.textContent = "0:00";
        finishTest(overlay);
        updateTimeAppearance(timeElement);
        return;
      }

      timeElement.textContent = formatTime(remaining);
    } else {
      timeElement.textContent = formatTime(elapsed);
    }
  }, 1000);
}

function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${min}:${s}`;
}

import { state } from "./state.js";
import { finishTest } from "./ui.js";

export function startTimer(timeElement, overlay) {
  timeElement.textContent = state.mode === "timed" ? "01:00" : "00:00";

  setInterval(() => {
    if (state.status !== "running") return;

    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);

    if (state.mode === "timed") {
      const remaining = state.timeLimit - elapsed;

      if (remaining <= 0) {
        timeElement.textContent = "00:00";
        finishTest(overlay);
        return;
      }

      timeElement.textContent = formatTime(remaining);
    } else {
      timeElement.textContent = formatTime(elapsed);
    }
  }, 1000);
}

function formatTime(sec) {
  const min = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${min}:${s}`;
}

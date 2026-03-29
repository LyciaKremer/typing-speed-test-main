import { state, updateState } from "./state.js";
import { loadTexts, renderText } from "./text.js";
import { handleTyping } from "./typing.js";
import { updateStats } from "./stats.js";
import { startTimer } from "./timer.js";
import { renderUI, showScreen, updateResultUI } from "./ui.js";
import { loadBestScore } from "./storage.js";
import { initDropdowns } from "./dropdown.js";

const wpmEl = document.querySelector("[data-wpm]");
const accEl = document.querySelector("[data-accuracy]");
const timeEl = document.querySelector("[data-time]");
const textEl = document.querySelector(".text-test p");
const overlay = document.querySelector(".blur-bg-not-started");
const startButton = overlay.querySelector("button");
const textContainer = document.querySelector(".text-test");

await loadTexts();
loadBestScore();
renderText(textEl);
startTimer(timeEl, overlay);
renderUI(overlay);
initDropdowns(
  (key, value) => updateState(key, value, () => renderText(textEl)),
  () => renderUI(overlay),
);

function startTest() {
  if (state.status === "running") return;

  state.status = "running";
  state.currentIndex = 0;
  state.typed = "";
  state.startTime = Date.now();

  updateStats(wpmEl, accEl);
  renderUI(overlay);
}

startButton.addEventListener("click", startTest);
textContainer.addEventListener("click", startTest);

document.addEventListener("keydown", (e) => {
  handleTyping(e, updateVisual, wpmEl, accEl, overlay);
});

function updateVisual() {
  const spans = document.querySelectorAll(".text-test span");

  spans.forEach((span, index) => {
    span.classList.remove("correct", "error", "current");

    const typedChar = state.typed[index];
    const expectedChar = state.text[index];

    if (typedChar === undefined) {
      if (index === state.currentIndex) {
        span.classList.add("current");
      }
      return;
    }

    span.classList.add(typedChar === expectedChar ? "correct" : "error");
  });
}

function resetTest() {
  state.status = "idle";
  state.currentIndex = 0;
  state.typed = "";
  state.startTime = null;
  state.screen = null;

  renderText(textEl);
  updateStats(wpmEl, accEl);
  timeEl.textContent = state.mode === "timed" ? "01:00" : "00:00";
  renderUI(overlay);
}

document
  .querySelectorAll(
    ".test-complete button, .test-high-score button, .test-baseline button",
  )
  .forEach((btn) => {
    btn.addEventListener("click", resetTest);
  });

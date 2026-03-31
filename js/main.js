import { state, updateState } from "./state.js";
import { loadTexts, renderText } from "./text.js";
import { handleTyping } from "./typing.js";
import { updateStats } from "./stats.js";
import {
  getInitialTimeDisplay,
  startTimer,
  updateTimeAppearance,
} from "./timer.js";
import { renderUI, showScreen, updateResultUI } from "./ui.js";
import { loadBestScore } from "./storage.js";
import { initDropdowns } from "./dropdown.js";

const wpmEl = document.querySelector("[data-wpm]");
const accEl = document.querySelector("[data-accuracy]");
const timeEl = document.querySelector("[data-time]");
const textEl = document.querySelector(".text-test p");
const overlay = document.querySelector(".blur-bg-not-started");
const startButton = overlay.querySelector("button");
const textPanel = document.querySelector(".text-panel");
const textContainer = document.querySelector(".text-test");
const restartButton = textContainer.querySelector("button");

await loadTexts();
loadBestScore();
renderText(textEl);
renderIdleStats();
startTimer(timeEl, overlay);
renderUI(overlay);
initDropdowns(
  (key, value) => {
    updateState(key, value, () => renderText(textEl));
    renderIdleStats();
  },
  () => renderUI(overlay),
);

function renderIdleStats() {
  updateStats(wpmEl, accEl);
  timeEl.textContent = getInitialTimeDisplay();
  updateTimeAppearance(timeEl);
}

function startTest() {
  if (state.status === "running") return;

  state.status = "running";
  state.currentIndex = 0;
  state.typed = "";
  state.startTime = Date.now();

  updateStats(wpmEl, accEl);
  updateTimeAppearance(timeEl);
  renderUI(overlay);
}

startButton.addEventListener("click", startTest);
textPanel.addEventListener("click", startTest);
restartButton.addEventListener("click", (e) => {
  e.stopPropagation();
  resetTest();
});

document.addEventListener("keydown", (e) => {
  handleTyping(e, updateVisual, wpmEl, accEl, overlay);
});

function updateVisual() {
  const spans = document.querySelectorAll(".text-test p span");

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

  keepCurrentCharacterVisible(spans);
}

function keepCurrentCharacterVisible(spans) {
  const currentSpan = spans[state.currentIndex];
  const textParagraph = currentSpan?.parentElement;

  if (!currentSpan || !textParagraph) return;
  if (textParagraph.scrollHeight <= textParagraph.clientHeight) return;

  currentSpan.scrollIntoView({
    block: "center",
    inline: "nearest",
  });
}

function resetTest() {
  state.status = "idle";
  state.currentIndex = 0;
  state.typed = "";
  state.startTime = null;
  state.screen = null;

  renderText(textEl);
  renderIdleStats();
  renderUI(overlay);
}

document
  .querySelectorAll(
    ".test-complete button, .test-high-score button, .test-baseline button",
  )
  .forEach((btn) => {
    btn.addEventListener("click", resetTest);
  });

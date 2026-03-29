document.addEventListener("click", (e) => {
  const clickedDropdown = e.target.closest(".dropdown");

  if (!clickedDropdown) {
    document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
      dropdown.classList.remove("open");
    });
    return;
  }

  const content = clickedDropdown.querySelector(".dropdown-content");
  const isOpen = content.classList.contains("open");

  document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
    dropdown.classList.remove("open");
  });

  if (!isOpen) {
    content.classList.add("open");
  }
});

const state = {
  status: "idle",
  difficulty: "easy",
  mode: "timed",
  currentIndex: 0,
  text: "",
  typed: "",
  startTime: null,
  bestWPM: 0,
  isFirstTest: true,
  screen: null,
  timeLimit: 60,
};

const wpmElement = document.querySelector("[data-wpm]");
const accuracyElement = document.querySelector("[data-accuracy]");
const timeElement = document.querySelector("[data-time]");
const textElement = document.querySelector(".text-test p");

let texts = {};

const savedBest = localStorage.getItem("bestWPM");

if (savedBest) {
  state.bestWPM = Number(savedBest);
  document.querySelector(".score").textContent = `${savedBest}WPM`;
}

function renderText() {
  const textData = getRandomText(state.difficulty);
  if (!textData) return;

  state.text = textData.text;

  textElement.innerHTML = state.text
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
}

async function loadTexts() {
  const response = await fetch("./data.json");
  texts = await response.json();

  renderText();
}

loadTexts();

function getRandomText(difficulty) {
  if (!texts[difficulty]) return null;

  const list = texts[difficulty];
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

function updateState(key, value) {
  state[key] = value;

  if (key === "difficulty" || key === "mode") {
    state.status = "idle";
    state.currentIndex = 0;
    state.typed = "";

    renderText();
  }
}

document.querySelectorAll(".dropdown").forEach((dropdown) => {
  const radios = dropdown.querySelectorAll('input[type="radio"]');
  const buttonText = dropdown.querySelector(".selected-value");

  const checkedRadio = dropdown.querySelector('input[type="radio"]:checked');

  if (checkedRadio && buttonText) {
    const label = dropdown.querySelector(`label[for="${checkedRadio.id}"]`);
    buttonText.textContent = label.textContent;

    updateState(checkedRadio.name, checkedRadio.value);
  }

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const label = dropdown.querySelector(`label[for="${radio.id}"]`);

      if (buttonText) {
        buttonText.textContent = label.textContent;
      }

      dropdown.querySelector(".dropdown-content").classList.remove("open");

      updateState(radio.name, radio.value);
      renderUI();
    });
  });
});

const startOverlay = document.querySelector(".blur-bg-not-started");
const startButton = startOverlay.querySelector("button");
const textContainer = document.querySelector(".text-test");

function startTest() {
  if (state.status === "running") return;

  state.status = "running";
  state.currentIndex = 0;
  state.typed = "";
  state.startTime = Date.now();

  updateStats();
  renderUI();
}

startButton.addEventListener("click", startTest);
textContainer.addEventListener("click", startTest);

document.addEventListener("keydown", (e) => {
  if (state.status !== "running") return;

  const key = e.key;

  if (key === " ") {
    e.preventDefault();
  }

  if (key.length > 1 && key !== "Backspace") return;

  if (key === "Backspace") {
    e.preventDefault();

    state.currentIndex = Math.max(0, state.currentIndex - 1);
    state.typed = state.typed.slice(0, -1);

    updateVisual();
    return;
  }

  const expectedChar = state.text[state.currentIndex];

  if (key === expectedChar) {
    console.log("correto");
  } else {
    console.log("erro");
  }

  state.typed += key;
  state.currentIndex++;

  updateVisual();
  updateStats();

  if (state.currentIndex >= state.text.length) {
    finishTest();
  }
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

    if (typedChar === expectedChar) {
      span.classList.add("correct");
    } else {
      span.classList.add("error");
    }
  });
}

function calculateAccuracy() {
  let correct = 0;

  for (let i = 0; i < state.typed.length; i++) {
    if (state.typed[i] === state.text[i]) {
      correct++;
    }
  }

  const total = state.typed.length;

  if (total === 0) return 100;

  return Math.round((correct / total) * 100);
}

function updateStats() {
  wpmElement.textContent = calculateWPM();
  accuracyElement.textContent = `${calculateAccuracy()}%`;
}

function updateTime() {
  if (!state.startTime) return;

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);

  if (state.mode === "timed") {
    const remaining = state.timeLimit - elapsed;

    if (remaining <= 0) {
      timeElement.textContent = "00:00";
      finishTest();
      return;
    }

    const min = String(Math.floor(remaining / 60)).padStart(2, "0");
    const sec = String(remaining % 60).padStart(2, "0");

    timeElement.textContent = `${min}:${sec}`;
  } else {
    const min = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const sec = String(elapsed % 60).padStart(2, "0");

    timeElement.textContent = `${min}:${sec}`;
  }
}

setInterval(() => {
  if (state.status === "running") {
    updateTime();
  }
}, 1000);

function calculateWPM() {
  if (!state.startTime) return 0;

  const timeInMinutes = (Date.now() - state.startTime) / 60000;

  const words = state.typed.length / 5;

  if (timeInMinutes === 0) return 0;

  return Math.round(words / timeInMinutes);
}

function finishTest() {
  if (state.status === "finished") return;

  state.status = "finished";

  const results = getResults();
  updateResultUI(results);

  if (state.isFirstTest) {
    state.screen = "baseline";
    state.isFirstTest = false;

    state.bestWPM = results.wpm;
    localStorage.setItem("bestWPM", state.bestWPM);
  } else if (results.wpm > state.bestWPM) {
    state.bestWPM = results.wpm;

    localStorage.setItem("bestWPM", state.bestWPM);
    state.screen = "high-score";
  } else {
    state.screen = "complete";
  }

  document.querySelector(".score").textContent = `${state.bestWPM}WPM`;

  renderUI();
}

function showScreen(screenClass) {
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

function renderUI() {
  showScreen(null);

  if (state.status === "idle") {
    startOverlay.classList.remove("hidden");
  } else {
    startOverlay.classList.add("hidden");
  }

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

function resetTest() {
  state.status = "idle";
  state.currentIndex = 0;
  state.typed = "";
  state.startTime = null;
  state.screen = null;

  renderText();
  updateStats();
  timeElement.textContent = state.mode === "timed" ? "01:00" : "00:00";
  renderUI();
}

document
  .querySelectorAll(
    ".test-complete button, .test-high-score button, .test-baseline button",
  )
  .forEach((btn) => {
    btn.addEventListener("click", resetTest);
  });

renderUI();

function updateResultUI({ wpm, accuracy, correct, incorrect }) {
  const screens = document.querySelectorAll(
    ".test-complete, .test-high-score, .test-baseline",
  );

  screens.forEach((screen) => {
    screen
      .querySelectorAll(".state-block")[0]
      .querySelector("span").textContent = wpm;

    screen
      .querySelectorAll(".state-block")[1]
      .querySelector("span").textContent = `${accuracy}%`;

    const correctEl = screen.querySelector(".characters-correct");
    const incorrectEl = screen.querySelector(".characters-incorrect");

    if (correctEl) correctEl.textContent = correct;
    if (incorrectEl) incorrectEl.textContent = incorrect;
  });
}

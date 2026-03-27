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
};

let texts = {};

function renderText() {
  const textData = getRandomText(state.difficulty);
  if (!textData) return;

  const textContainer = document.querySelector(".text-test p");

  state.text = textData.text;
  textContainer.textContent = textData.text;
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
    });
  });
});

const textElement = document.querySelector(".text-test p");
state.text = textElement.textContent;
const startOverlay = document.querySelector(".blur-bg-not-started");
const startButton = startOverlay.querySelector("button");
const textContainer = document.querySelector(".text-test");

function startTest() {
  if (state.status === "running") return;

  state.status = "running";
  state.currentIndex = 0;
  state.typed = "";

  startOverlay.style.display = "none";

  console.log("Teste iniciado");
}

startButton.addEventListener("click", startTest);
textContainer.addEventListener("click", startTest);

document.addEventListener("keydown", (e) => {
  if (state.status !== "running") return;

  const key = e.key;

  if (key.length > 1 && key !== "Backspace") return;

  if (key === "Backspace") {
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    state.typed = state.typed.slice(0, -1);
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
});

const expectedChar = state.text[state.currentIndex];

if (key === expectedChar) {
  console.log("correto");
} else {
  console.log("erro");
}

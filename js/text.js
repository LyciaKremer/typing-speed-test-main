import { state } from "./state.js";

let texts = {};

export async function loadTexts() {
  const response = await fetch("./data.json");
  texts = await response.json();
}

export function getRandomText() {
  const list = texts[state.difficulty];
  if (!list) return null;

  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

export function renderText(textElement) {
  const textData = getRandomText();
  if (!textData) return;

  state.text = textData.text;

  textElement.innerHTML = state.text
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
}

export const state = {
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

export function updateState(key, value, renderText) {
  state[key] = value;

  if (key === "difficulty" || key === "mode") {
    state.status = "idle";
    state.currentIndex = 0;
    state.typed = "";

    renderText();
  }
}

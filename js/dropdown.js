import { state } from "./state.js";

export function initDropdowns(updateState, renderUI) {
  document.addEventListener("click", (e) => {
    const clickedDropdown = e.target.closest(".dropdown");

    if (!clickedDropdown) {
      closeAll();
      return;
    }

    const content = clickedDropdown.querySelector(".dropdown-content");
    const isOpen = content.classList.contains("open");

    closeAll();

    if (!isOpen) {
      content.classList.add("open");
    }
  });

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
}

function closeAll() {
  document.querySelectorAll(".dropdown-content").forEach((dropdown) => {
    dropdown.classList.remove("open");
  });
}

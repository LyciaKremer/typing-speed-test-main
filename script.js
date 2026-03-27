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

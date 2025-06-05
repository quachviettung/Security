// main.js
document.querySelectorAll(".nav-link").forEach((item) => {
  item.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-link")
      .forEach((i) => i.classList.remove("active"));
    document
      .querySelectorAll(".framework-module")
      .forEach((c) => c.classList.remove("active"));

    item.classList.add("active");
    const module = item.getAttribute("data-module");
    document.getElementById(`${module}-module`).classList.add("active");
  });
});

// Config card selection
document.querySelectorAll(".config-card").forEach((card) => {
  card.addEventListener("click", () => {
    const parent = card.parentElement;
    parent
      .querySelectorAll(".config-card")
      .forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
  });
});

// Placeholder cho frameworkConfig
function frameworkConfig() {
  alert("Chức năng cấu hình đang được phát triển!");
}

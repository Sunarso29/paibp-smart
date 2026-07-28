const button = document.querySelector(".menu-btn");
const navigation = document.querySelector(".links");
const mobileBreakpoint = window.matchMedia("(max-width: 860px)");

function setMenu(open) {
  if (!button || !navigation) return;

  navigation.classList.toggle("open", open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  button.textContent = open ? "×" : "☰";
}

if (button && navigation) {
  button.addEventListener("click", () => {
    setMenu(!navigation.classList.contains("open"));
  });

  navigation.addEventListener("click", (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest("a") &&
      mobileBreakpoint.matches
    ) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      setMenu(false);
      button.focus();
    }
  });

  const handleBreakpointChange = (event) => {
    if (!event.matches) setMenu(false);
  };

  if (typeof mobileBreakpoint.addEventListener === "function") {
    mobileBreakpoint.addEventListener("change", handleBreakpointChange);
  } else {
    mobileBreakpoint.addListener(handleBreakpointChange);
  }
}

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

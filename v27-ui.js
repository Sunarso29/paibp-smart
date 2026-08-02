(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  const gateway = params.get("portal");
  document.body.dataset.privateGateway = gateway === "guru" || gateway === "editor" ? gateway : "public";

  // Remove private interfaces from the public DOM after core initialization.
  window.setTimeout(() => {
    if (gateway !== "guru") document.querySelector("#panel-teacher")?.remove();
    if (gateway !== "editor") document.querySelector("#panel-editor")?.remove();
    if (gateway !== "editor") document.querySelector("#editor-auth-form")?.remove();
    if (gateway !== "guru") document.querySelector("#teacher-access-form")?.remove();
  }, 700);

  const drawer = document.querySelector("#spensus-ai-drawer-v27");
  const launcher = document.querySelector("#spensus-ai-launcher-v27");
  const openers = [...document.querySelectorAll("[data-ai-open]")];
  const closeDrawer = () => {
    if (!drawer) return;
    drawer.hidden = true;
    document.body.classList.remove("ai-drawer-open-v27");
    openers.forEach((button) => button.classList.remove("is-open"));
    launcher?.focus({ preventScroll:true });
  };
  const openDrawer = () => {
    if (!drawer) return;
    drawer.hidden = false;
    document.body.classList.add("ai-drawer-open-v27");
    openers.forEach((button) => button.classList.add("is-open"));
    window.setTimeout(() => drawer.querySelector("[data-ai-input]")?.focus(), 80);
  };
  openers.forEach((button) => button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openDrawer();
  }));
  drawer?.querySelectorAll("[data-ai-close]").forEach((button) => button.addEventListener("click", closeDrawer));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && drawer && !drawer.hidden) closeDrawer(); });
})();

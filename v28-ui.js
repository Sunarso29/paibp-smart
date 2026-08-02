(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const declared = document.body.dataset.privateGateway;
  const gateway = declared || params.get("portal") || (file === "akses-guru.html" ? "guru" : file === "kendali-editor.html" ? "editor" : "public");
  document.body.dataset.privateGateway = gateway;

  // Defensive cleanup: public source has no private panels; this also protects older cached markup.
  if (gateway !== "guru") {
    document.querySelector("#panel-teacher")?.remove();
    document.querySelector("#teacher-access-form")?.remove();
  }
  if (gateway !== "editor") {
    document.querySelector("#panel-editor")?.remove();
    document.querySelector("#editor-auth-form")?.remove();
    document.querySelector("#gallery-admin")?.remove();
  }

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

  // Private pages open their own authenticated workspace; no private link is exposed publicly.
  if (gateway === "guru" || gateway === "editor") {
    window.setTimeout(() => {
      const trigger = document.querySelector(gateway === "guru" ? "#teacher-gateway-trigger" : "#editor-gateway-trigger");
      trigger?.click();
    }, 350);
  }
})();

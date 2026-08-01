(() => {
  "use strict";
  const body = document.body;
  const portal = document.querySelector("#portal");
  const roleNavItems = [...document.querySelectorAll("[data-role-access]")];
  const PUBLIC_ROLE_KEY = "paibp-smart-public-role-v25";

  function setPortalState(mode, role = body.dataset.portalRole || "umum") {
    body.dataset.portalMode = mode;
    body.dataset.portalRole = role;
    if (mode === "active") sessionStorage.setItem(PUBLIC_ROLE_KEY, role);
    else if (mode === "home") sessionStorage.removeItem(PUBLIC_ROLE_KEY);
    roleNavItems.forEach((item) => {
      const allowed = String(item.dataset.roleAccess || "").split(",").map((value) => value.trim());
      item.hidden = mode !== "active" || !allowed.includes(role);
    });
    if (portal) portal.setAttribute("aria-hidden", String(mode !== "active"));
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-panel]");
    if (!trigger || !portal) return;
    const panel = trigger.dataset.openPanel;
    if (["student", "islamic", "games"].includes(panel)) setPortalState("active", "murid");
    if (panel === "teacher" && sessionStorage.getItem("paibp-smart-visitor-role-v1") === "guru") setPortalState("active", "guru");
    if (panel === "editor" && sessionStorage.getItem("paibp-smart-editor-unlocked") === "yes") setPortalState("active", "editor");
    if (["student", "islamic", "games"].includes(panel)) {
      requestAnimationFrame(() => portal.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
    }
  }, true);

  document.querySelector("#teacher-access-form")?.addEventListener("submit", () => {
    setTimeout(() => {
      if (sessionStorage.getItem("paibp-smart-visitor-role-v1") === "guru") setPortalState("active", "guru");
    }, 30);
  });
  document.querySelector("#editor-auth-form")?.addEventListener("submit", () => {
    setTimeout(() => {
      if (sessionStorage.getItem("paibp-smart-editor-unlocked") === "yes") setPortalState("active", "editor");
    }, 40);
  });
  document.querySelector("[data-close-workspace]")?.addEventListener("click", () => {
    setTimeout(() => {
      setPortalState("home", "umum");
      window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }, 0);
  });

  function updateTicker() {
    const ticker = document.querySelector("#smart-ticker-text");
    if (!ticker) return;
    const latest = document.querySelector("#news-gallery .news-card h4");
    const latestSummary = document.querySelector("#news-gallery .news-card p");
    const school = window.PAIBP_SCHOOL?.school;
    if (latest) ticker.textContent = `Pembaruan terbaru: ${latest.textContent.trim()}${latestSummary?.textContent ? ` — ${latestSummary.textContent.trim()}` : ""}`;
    else ticker.textContent = `Arah Spensus: ${school?.tickerFallback || school?.overview?.[0] || "Belajar, bertumbuh, dan berakhlak mulia."}`;
  }
  const gallery = document.querySelector("#news-gallery");
  if (gallery) new MutationObserver(updateTicker).observe(gallery, { childList: true, subtree: true, characterData: true });
  updateTicker();

  const requestedPanel = location.hash.replace(/^#/, "");
  if (["student", "islamic", "games", "teacher", "editor"].includes(requestedPanel)) {
    setTimeout(() => {
      const target = document.querySelector(`[data-open-panel="${requestedPanel}"]`);
      target?.click();
      history.replaceState(null, "", location.pathname + location.search);
    }, 120);
  }

  setPortalState("home", "umum");
})();

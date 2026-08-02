(() => {
  "use strict";
  const body = document.body;
  const portal = document.querySelector("#portal");
  const roleNavItems = [...document.querySelectorAll("[data-role-access]")];
  const PUBLIC_ROLE_KEY = "paibp-smart-public-role-v26";
  const params = new URLSearchParams(location.search);
  const gateway = params.get("portal");
  const gatewayAllowed = gateway === "guru" || gateway === "editor";

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
    if (panel === "teacher" && gateway !== "guru" && sessionStorage.getItem("paibp-smart-visitor-role-v1") !== "guru") {
      event.preventDefault(); event.stopImmediatePropagation(); return;
    }
    if (panel === "editor" && gateway !== "editor" && sessionStorage.getItem("paibp-smart-editor-unlocked") !== "yes") {
      event.preventDefault(); event.stopImmediatePropagation(); return;
    }
    if (["student", "islamic", "games"].includes(panel)) setPortalState("active", "murid");
    if (panel === "teacher" && sessionStorage.getItem("paibp-smart-visitor-role-v1") === "guru") setPortalState("active", "guru");
    if (panel === "editor" && sessionStorage.getItem("paibp-smart-editor-unlocked") === "yes") setPortalState("active", "editor");
    if (["student", "islamic", "games"].includes(panel)) requestAnimationFrame(() => portal.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  }, true);

  document.querySelector("#teacher-access-form")?.addEventListener("submit", () => setTimeout(() => {
    if (sessionStorage.getItem("paibp-smart-visitor-role-v1") === "guru") setPortalState("active", "guru");
  }, 35));
  document.querySelector("#editor-auth-form")?.addEventListener("submit", () => setTimeout(() => {
    if (sessionStorage.getItem("paibp-smart-editor-unlocked") === "yes") setPortalState("active", "editor");
  }, 45));
  document.querySelector("[data-close-workspace]")?.addEventListener("click", () => setTimeout(() => {
    setPortalState("home", "umum");
    history.replaceState(null, "", "index.html");
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, 0));

  function updateTicker() {
    const ticker = document.querySelector("#smart-ticker-text");
    if (!ticker) return;
    const latest = document.querySelector("#news-gallery .news-card h4");
    const latestSummary = document.querySelector("#news-gallery .news-card p");
    const school = window.PAIBP_SCHOOL?.school;
    ticker.textContent = latest ? `Pembaruan terbaru: ${latest.textContent.trim()}${latestSummary?.textContent ? ` — ${latestSummary.textContent.trim()}` : ""}` : `Arah Spensus: ${school?.tickerFallback || school?.overview?.[0] || "Belajar, bertumbuh, dan berakhlak mulia."}`;
  }
  const gallery = document.querySelector("#news-gallery");
  if (gallery) new MutationObserver(updateTicker).observe(gallery, { childList:true, subtree:true, characterData:true });
  updateTicker();
  setPortalState("home", "umum");

  if (gatewayAllowed) {
    const trigger = document.querySelector(gateway === "guru" ? "#teacher-gateway-trigger" : "#editor-gateway-trigger");
    window.setTimeout(() => trigger?.click(), 180);
  } else {
    const requested = location.hash.replace(/^#/, "");
    if (["student","islamic","games"].includes(requested)) window.setTimeout(() => document.querySelector(`[data-open-panel="${requested}"]`)?.click(), 120);
  }
})();

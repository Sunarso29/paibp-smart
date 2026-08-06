(() => {
  "use strict";
  const VERSION = "64";
  const params = new URLSearchParams(location.search);
  const catLink = params.get("cat") === "1" || params.get("ps_cat") === "1" ||
    ["kelas","cat_class","ps_class","grade","ps_grade"].some((key) => Boolean(params.get(key)));
  const staleKey = /paibp-smart-(?:cat|class(?:-context)?|student-session|focus-session)/i;

  for (const store of [localStorage, sessionStorage]) {
    try {
      for (let index = store.length - 1; index >= 0; index -= 1) {
        const key = store.key(index) || "";
        if (staleKey.test(key)) store.removeItem(key);
      }
    } catch {}
  }

  if (!catLink) {
    const url = new URL(location.href);
    ["cat","ps_cat","kelas","cat_class","ps_class","grade","ps_grade","cat_token","ps_token","ps_scope","ps_teacher","ps_school","ps_duration"].forEach((key) => url.searchParams.delete(key));
    if (url.href !== location.href) history.replaceState({}, "", url.href);
  }

  const removeStale = () => {
    [
      "#v56-class-badge", "#v59-camera-gate", "#v59-expired-screen", "#v59-cat-bar", "#v59-camera-preview",
      "#v60-cat-bar", "#v60-expired-screen", "#v61-cat-bar", "#v61-expired-screen", "#v62-cat-bar", "#v62-expired-screen"
    ].forEach((selector) => document.querySelector(selector)?.remove());

    document.querySelectorAll("body *").forEach((node) => {
      if (node.id === "v63-cat-bar" || node.closest?.("#v63-cat-bar,#v63-student-login,#v63-camera-gate,#v63-expired-screen")) return;
      const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
      if (!/kelas\s+terhubung\s*:/i.test(text) || text.length > 260) return;
      const target = node.closest?.('[class*="class-context"],[class*="connected"],[class*="connection"],[data-class-context],article') || node;
      if (target && !target.matches("body,main,section.container")) target.remove();
    });
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; removeStale(); });
  };

  removeStale();
  const observer = new MutationObserver(schedule);
  const start = () => {
    if (!document.body) return;
    observer.observe(document.body, { childList: true, subtree: true });
    removeStale();
    setTimeout(() => observer.disconnect(), 45000);
  };
  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });

  const style = document.createElement("style");
  style.textContent = `
    a,button,[role="tab"],[data-about-tab],[data-open-panel]{transition-delay:0s!important;transition-duration:.12s!important}
    html{scroll-behavior:auto!important}
    #v56-class-badge,[class*="class-context"][data-stale="true"]{display:none!important}
  `;
  document.head.append(style);

  window.PAIBP_EMERGENCY_V64 = Object.freeze({ version: VERSION, removeStale });
  document.documentElement.dataset.paibpEmergency = VERSION;
})();

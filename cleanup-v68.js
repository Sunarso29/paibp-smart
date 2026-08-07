(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  const isCat = params.get("cat") === "1" || params.get("ps_cat") === "1" || ["kelas","cat_class","ps_class","grade","ps_grade"].some(k => Boolean(params.get(k)));
  const stale = /paibp-smart-(?:cat|class-context|student-session|policy-cache|focus-session)/i;

  if (!isCat) {
    for (const store of [localStorage, sessionStorage]) {
      try {
        for (let i = store.length - 1; i >= 0; i--) {
          const key = store.key(i) || "";
          if (stale.test(key)) store.removeItem(key);
        }
      } catch {}
    }
    const cleanUrl = new URL(location.href);
    ["cat","ps_cat","kelas","cat_class","ps_class","grade","ps_grade","cat_token","ps_token","ps_scope","ps_teacher","ps_school","ps_duration"].forEach(k => cleanUrl.searchParams.delete(k));
    if (cleanUrl.href !== location.href) history.replaceState({}, "", cleanUrl.href);
  }

  window.PAIBP_CAT_V59 = window.PAIBP_CAT_V59 || { version:"68", startFromLegacy(){}, enterStudentRoom(){} };

  function purgeConnected() {
    if (isCat) return;
    const selectors = [
      "#v56-class-badge", "#v56-class-context", "#v59-class-context", "#v60-class-context", "#v61-class-context", "#v63-class-context",
      "[data-class-context]", "[class*='class-context']", "[class*='connected-class']", "[class*='kelas-terhubung']"
    ];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(n => n.remove()));
    document.querySelectorAll("article,aside,main>.container>div,main>.container>section,.hero-v25>.container>div").forEach(node => {
      const text = String(node.textContent || "").replace(/\s+/g," ").trim();
      if (/Kelas\s+terhubung\s*:/i.test(text) && text.length < 280) node.remove();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", purgeConnected, {once:true}); else purgeConnected();
  let count = 0;
  const timer = setInterval(() => { purgeConnected(); if (++count >= 8) clearInterval(timer); }, 600);
})();
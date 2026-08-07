(() => {
  "use strict";
  const params = new URLSearchParams(location.search);
  const isCat = params.get("cat") === "1" || params.get("ps_cat") === "1";
  const force = params.get("reset") === "1";
  const stale = /paibp-smart-(?:cat|class-context|student-session|policy-cache|focus-session)/i;
  const identityKey = "paibp-smart-student-identity-v1";

  if (force || !isCat) {
    for (const store of [localStorage, sessionStorage]) {
      try {
        for (let i = store.length - 1; i >= 0; i--) {
          const key = store.key(i) || "";
          if (key !== identityKey && stale.test(key)) store.removeItem(key);
        }
      } catch {}
    }
    const cleanUrl = new URL(location.href);
    ["cat","ps_cat","kelas","cat_class","ps_class","grade","ps_grade","cat_token","ps_token","ps_scope","ps_teacher","ps_school","ps_duration"].forEach(k => cleanUrl.searchParams.delete(k));
    if (force) cleanUrl.searchParams.delete("reset");
    cleanUrl.searchParams.set("v","69");
    if (cleanUrl.href !== location.href) history.replaceState({}, "", cleanUrl.href);
  }

  const stub = Object.freeze({version:"69",startFromLegacy(){},enterStudentRoom(){},showLogin(){}});
  window.PAIBP_CAT_V59 = stub;
  window.PAIBP_CAT_V60 = stub;
  window.PAIBP_CAT_V61 = stub;
  window.PAIBP_CAT_V63 = stub;

  function purgeConnected() {
    if (isCat) return;
    const selectors = [
      "#v56-class-badge", "#v56-class-context", "#v59-class-context", "#v60-class-context", "#v61-class-context", "#v63-class-context",
      "[data-class-context]", "[class*='class-context']", "[class*='connected-class']", "[class*='kelas-terhubung']"
    ];
    selectors.forEach(sel => document.querySelectorAll(sel).forEach(n => n.remove()));
    document.querySelectorAll("article,aside,section,div").forEach(node => {
      if (node.children.length > 10) return;
      const text = String(node.textContent || "").replace(/\s+/g," ").trim();
      if (/^Kelas\s+terhubung\s*:/i.test(text) && text.length < 220) node.remove();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", purgeConnected, {once:true}); else purgeConnected();
  [250,700,1500,3000].forEach(ms => setTimeout(purgeConnected, ms));
})();
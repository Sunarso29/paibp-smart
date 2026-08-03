(() => {
  "use strict";
  const body = document.body;
  const normalize = (value) => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, " ").trim();
  const OWNER_GATEWAY_KEY = "paibp-smart-owner-gateway-v30";
  const TEACHER_IDENTITY_KEY = "paibp-smart-teacher-identity-v1";
  const fileName = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const gateway = fileName === "akses-guru.html" ? "guru" : fileName === "kendali-editor.html" ? "editor" : String(body.dataset.privateGateway || "public");
  body.dataset.privateGateway = gateway;

  function readIdentity() {
    try { return JSON.parse(localStorage.getItem(TEACHER_IDENTITY_KEY) || "{}"); }
    catch { return {}; }
  }
  function isOwner(identity = readIdentity()) {
    const name = normalize(identity.name);
    const unit = normalize(identity.workUnit);
    return name.includes("sunarso") && unit.includes("smp negeri 1 susukan");
  }

  function placeOwnerControl() {
    const entry = document.querySelector("#owner-editor-entry-v29");
    const panel = document.querySelector("#panel-teacher");
    if (!entry || !panel) return;
    let callout = document.querySelector("#teacher-owner-callout-v30");
    if (!callout) {
      callout = document.createElement("section");
      callout.id = "teacher-owner-callout-v30";
      callout.className = "teacher-owner-callout-v30";
      callout.hidden = true;
      callout.innerHTML = '<div><strong>Kendali Pemilik Portal</strong><span>Khusus Sunarso, S.Pd.I., Gr. untuk mengelola galeri, statistik, komentar, dan konfigurasi portal.</span></div>';
      const heading = panel.querySelector(".panel-heading");
      heading?.insertAdjacentElement("afterend", callout);
      callout.append(entry);
      entry.classList.add("owner-editor-entry-v30");
      entry.textContent = "⚙ Buka Kendali Editor";
    }
    const owner = isOwner();
    callout.hidden = !owner;
    entry.hidden = !owner;
    body.dataset.teacherOwner = owner ? "yes" : "no";
    if (owner) body.dataset.teacherTier = "registered";
  }

  document.addEventListener("click", (event) => {
    const ownerLink = event.target.closest("#owner-editor-entry-v29");
    if (!ownerLink) return;
    if (!isOwner()) {
      event.preventDefault();
      return;
    }
    try { sessionStorage.setItem(OWNER_GATEWAY_KEY, "yes"); } catch {}
  }, true);

  document.querySelector("#teacher-access-form")?.addEventListener("submit", () => {
    window.setTimeout(placeOwnerControl, 220);
  });
  window.addEventListener("storage", placeOwnerControl);

  function guaranteeTeacherGateway() {
    if (gateway !== "guru") return;
    const panel = document.querySelector("#panel-teacher");
    if (!panel) return;
    const auth = document.querySelector("#teacher-auth");
    const trigger = document.querySelector("#teacher-gateway-trigger");
    const active = !panel.hidden || (auth && !auth.hidden);
    if (!active) trigger?.click();
  }

  if (gateway === "guru") {
    const params = new URLSearchParams(location.search);
    if (params.get("editor") === "owner-required") {
      const note = document.createElement("p");
      note.className = "teacher-gateway-message-v30";
      note.textContent = "Kendali Editor hanya dibuka dari Portal Guru setelah identitas pemilik dikenali. Silakan masuk sebagai Sunarso, S.Pd.I., Gr. — SMP Negeri 1 Susukan.";
      document.querySelector("#main")?.prepend(note);
    }
    window.setTimeout(guaranteeTeacherGateway, 260);
    window.setTimeout(guaranteeTeacherGateway, 900);
  }

  placeOwnerControl();

  // Spensus AI v31 berdiri sebagai panel independen. Halaman di sebelah kiri tetap tajam dan interaktif.
  const drawer = document.querySelector("#spensus-ai-drawer-v27");
  if (drawer) {
    const syncDrawerState = () => {
      const open = !drawer.hidden;
      document.documentElement.classList.toggle("ai-drawer-open-v30", open);
      drawer.setAttribute("aria-hidden", String(!open));
      document.querySelector("main")?.removeAttribute("inert");
      document.querySelector("header")?.removeAttribute("inert");
    };
    const observer = new MutationObserver(syncDrawerState);
    observer.observe(drawer, { attributes: true, attributeFilter: ["hidden"] });
    syncDrawerState();
  }

  // Reset posisi launcher lama yang pernah tersimpan di atas kartu akses.
  try {
    if (!localStorage.getItem("paibp-spensus-ai-position-v30")) {
      localStorage.removeItem("paibp-spensus-ai-position-v29");
      localStorage.setItem("paibp-spensus-ai-position-v30", "default");
      const launcher = document.querySelector("#spensus-ai-launcher-v27");
      if (launcher) {
        launcher.style.left = "auto";
        launcher.style.top = "auto";
        launcher.style.right = "18px";
        launcher.style.bottom = "18px";
      }
    }
  } catch {}

  // Portal Guru tidak memuat v34-lite.js dari HTML, jadi bootstrap versi terbaru dipasang di sini.
  if (gateway === "guru" && ![...document.scripts].some((script) => /\/v34-lite\.js(?:\?|$)/.test(script.src))) {
    const loader = document.createElement("script");
    loader.src = "v34-lite.js?v=40";
    loader.async = false;
    loader.dataset.v40Bootstrap = "true";
    document.body.append(loader);
  }
})();

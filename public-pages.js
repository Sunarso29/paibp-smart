(() => {
  "use strict";
  const menuButton = document.querySelector(".menu-btn");
  const navigation = document.querySelector(".links");
  menuButton?.addEventListener("click", () => {
    const open = !navigation?.classList.contains("open");
    navigation?.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "×" : "☰";
  });
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  const activePublicRole = sessionStorage.getItem("paibp-smart-public-role-v24");
  if (activePublicRole === "murid") {
    document.body.dataset.publicRole = "murid";
    document.querySelectorAll(".restricted, .editor-access-banner, .footer-restricted").forEach((element) => element.remove());
  }

  const grid = document.querySelector("#public-directory-grid");
  if (!grid || !window.PAIBP_SCHOOL) return;
  const type = document.body.dataset.directory;
  const source = type === "staff" ? window.PAIBP_SCHOOL.staff : window.PAIBP_SCHOOL.teachers;
  const roleKey = type === "staff" ? "role" : "subject";
  const queryInput = document.querySelector("#directory-search");
  const roleSelect = document.querySelector("#directory-role");
  const count = document.querySelector("#directory-count");
  const roles = [...new Set(source.map((person) => person[roleKey]).filter(Boolean))].sort((a,b) => a.localeCompare(b, "id"));
  if (roleSelect) roleSelect.innerHTML = '<option value="">Semua bidang</option>' + roles.map((role) => `<option value="${role.replace(/"/g,'&quot;')}">${role}</option>`).join("");

  function imageSource(person) {
    return person.image || "logo-spensus.png";
  }
  function fallbackImage(img, path) {
    const fallback = window.PAIBP_STAFF_IMAGES?.[path];
    if (fallback && img.src !== fallback) img.src = fallback;
    else img.src = "logo-spensus.png";
  }
  function render() {
    const q = (queryInput?.value || "").trim().toLocaleLowerCase("id");
    const selectedRole = roleSelect?.value || "";
    const visible = source.filter((person) => {
      const text = `${person.name} ${person[roleKey] || ""}`.toLocaleLowerCase("id");
      return (!q || text.includes(q)) && (!selectedRole || person[roleKey] === selectedRole);
    });
    grid.innerHTML = visible.map((person, index) => `
      <article class="directory-card">
        <div class="directory-photo-wrap"><img src="${imageSource(person)}" data-original-path="${person.image || ""}" alt="${person.name}" loading="lazy"><span>${String(index + 1).padStart(2,"0")}</span></div>
        <div><small>${person[roleKey] || "SMP Negeri 1 Susukan"}</small><h2>${person.name}</h2><p>SMP Negeri 1 Susukan • Banjarnegara</p></div>
      </article>`).join("");
    grid.querySelectorAll("img[data-original-path]").forEach((img) => img.addEventListener("error", () => fallbackImage(img, img.dataset.originalPath), { once: true }));
    if (count) count.textContent = `${visible.length} profil ditampilkan`;
  }
  queryInput?.addEventListener("input", render);
  roleSelect?.addEventListener("change", render);
  render();
})();

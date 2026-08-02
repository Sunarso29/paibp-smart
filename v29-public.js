(() => {
  "use strict";
  const data = window.PAIBP_SCHOOL || { school: {}, teachers: [], staff: [] };
  const embeddedImages = window.PAIBP_STAFF_IMAGES || {};
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  document.querySelectorAll("[data-about-tab]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.aboutTab;
    document.querySelectorAll("[data-about-tab]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    document.querySelectorAll("[data-about-panel]").forEach((panel) => { panel.hidden = panel.dataset.aboutPanel !== id; });
    history.replaceState(null, "", `#${id}`);
  }));

  const overview = document.querySelector("#about-overview-v29");
  if (overview) overview.innerHTML = (data.school?.overview || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("");
  const vision = document.querySelector("#about-vision-v29");
  if (vision && data.school?.tickerFallback) vision.textContent = data.school.tickerFallback;

  function preferredImage(item) {
    const path = String(item?.image || "");
    return embeddedImages[path] || path || "logo-spensus.png";
  }

  function attachImageFallbacks(grid) {
    grid?.querySelectorAll("img[data-original-path]").forEach((image) => {
      image.addEventListener("error", () => {
        const path = image.dataset.originalPath || "";
        const embedded = embeddedImages[path];
        if (embedded && image.src !== embedded) image.src = embedded;
        else if (!image.src.endsWith("logo-spensus.png")) image.src = "logo-spensus.png";
      }, { once: true });
    });
  }

  function render(items, grid, count, query = "") {
    const q = query.trim().toLocaleLowerCase("id");
    const shown = items.filter((item) => `${item.name || ""} ${item.subject || item.role || ""}`.toLocaleLowerCase("id").includes(q));
    if (count) count.textContent = `${shown.length} profil ditampilkan`;
    if (!grid) return;
    grid.innerHTML = shown.map((item, index) => {
      const originalPath = String(item.image || "");
      return `<article class="directory-card directory-card-v30">
        <div class="directory-photo directory-photo-v30"><img src="${esc(preferredImage(item))}" data-original-path="${esc(originalPath)}" alt="Foto ${esc(item.name)}" loading="lazy"><span>${String(index + 1).padStart(2, "0")}</span></div>
        <div><small>${esc(item.subject || item.role || "Keluarga Spensus")}</small><h3>${esc(item.name)}</h3><span>SMP Negeri 1 Susukan</span></div>
      </article>`;
    }).join("");
    attachImageFallbacks(grid);
  }

  const teacherGrid = document.querySelector("#about-teacher-grid-v29");
  const teacherCount = document.querySelector("#about-teacher-count-v29");
  const teacherSearch = document.querySelector("#about-teacher-search-v29");
  const staffGrid = document.querySelector("#about-staff-grid-v29");
  const staffCount = document.querySelector("#about-staff-count-v29");
  const staffSearch = document.querySelector("#about-staff-search-v29");

  render(data.teachers || [], teacherGrid, teacherCount);
  render(data.staff || [], staffGrid, staffCount);
  teacherSearch?.addEventListener("input", () => render(data.teachers || [], teacherGrid, teacherCount, teacherSearch.value));
  staffSearch?.addEventListener("input", () => render(data.staff || [], staffGrid, staffCount, staffSearch.value));
})();

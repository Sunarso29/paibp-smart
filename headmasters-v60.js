(() => {
  "use strict";
  const VERSION = "60";
  const DATA = [
    ["Agus Halim", "1980–1984", "assets/kepala-sekolah/01-agus-halim-1980-1984.jpg"],
    ["Sukmo", "1984–1989", "assets/kepala-sekolah/02-sukmo-1984-1989.jpg"],
    ["Rudiman", "1989–1996", "assets/kepala-sekolah/03-rudiman-1989-1996.jpg"],
    ["Drs. H. Sadimin", "1996–2003", "assets/kepala-sekolah/04-drs-h-sadimin-1996-2003.jpg"],
    ["Drs. Slamet AY", "2003–2006", "assets/kepala-sekolah/05-drs-slamet-ay-2003-2006.jpg"],
    ["Pujianti, S.Pd.", "2006–2010", "assets/kepala-sekolah/06-pujianti-s-pd-2006-2010.jpg"],
    ["Rokhndayani, S.Pd., M.Pd.", "2010–2012", "assets/kepala-sekolah/07-rokhndayani-s-pd-m-pd-2010-2012.jpg"],
    ["Erry Subekti, S.Pd., M.M.", "2012–2014", "assets/kepala-sekolah/08-erry-subekti-s-pd-mm-2012-2014.jpg"],
    ["Bambang Kuseno, S.Pd.", "2014–2016", "assets/kepala-sekolah/09-bambang-kuseno-s-pd-2014-2016.jpg"],
    ["Rojat, S.Pd.", "2016–2024", "assets/kepala-sekolah/10-rojat-s-pd-2016-2024.jpg"],
    ["Drs. H. Akhmad Samiri, M.Pd.", "2024–2026", "assets/kepala-sekolah/11-drs-h-akhmad-samiri-m-pd-2024-2026.jpg"],
    ["Hari Teguh Wibowo, S.Pd., M.Si.", "2026–sekarang", "assets/kepala-sekolah/12-hari-teguh-wibowo-s-pd-msi-2026-s-d-sekarang.jpg", true]
  ];

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];

  function findEducatorSection(main) {
    return $$('section,article', main).find((node) => /tenaga\s+pendidik/i.test(node.querySelector('h1,h2,h3,h4')?.textContent || "")) || null;
  }

  function addTab(section) {
    const candidate = $$('a,button').find((node) => /^\s*tenaga\s+pendidik\s*$/i.test(node.textContent || ""));
    const button = document.createElement("button");
    button.type = "button";
    button.className = "v60-headmaster-tab";
    button.innerHTML = "🏫 <span>Kepala Sekolah dari Masa ke Masa</span>";
    button.addEventListener("click", () => section.scrollIntoView({ behavior: "smooth", block: "start" }));
    if (candidate?.parentElement) candidate.insertAdjacentElement("beforebegin", button);
    else {
      const nav = document.createElement("nav");
      nav.className = "v60-about-tabs";
      nav.setAttribute("aria-label", "Navigasi profil sekolah");
      nav.append(button);
      section.insertAdjacentElement("beforebegin", nav);
    }
  }

  function buildSection() {
    const section = document.createElement("section");
    section.id = "kepala-sekolah-masa-ke-masa";
    section.className = "v60-headmaster-section";
    section.innerHTML = `
      <header class="v60-headmaster-hero">
        <div><span>JEJAK KEPEMIMPINAN SPENSUS</span><h2>Kepala Sekolah dari Masa ke Masa</h2><p>Perjalanan kepemimpinan SMP Negeri 1 Susukan disajikan secara kronologis, dari kepala sekolah pertama hingga kepala sekolah yang menjabat saat ini.</p></div>
        <b>1980–sekarang</b>
      </header>
      <div class="v60-headmaster-timeline">${DATA.map(([name, period, image, current], index) => `
        <article class="v60-headmaster-card${current ? " is-current" : ""}" style="--order:${index + 1}">
          <div class="v60-headmaster-number">${String(index + 1).padStart(2, "0")}</div>
          <figure><img src="${image}" alt="${name}" loading="lazy" decoding="async"></figure>
          <div class="v60-headmaster-copy">
            <span>${current ? "KEPALA SEKOLAH SAAT INI" : "PERIODE KEPEMIMPINAN"}</span>
            <h3>${name}</h3>
            <p>${period}</p>
          </div>
        </article>`).join("")}</div>`;
    return section;
  }

  function init() {
    if (!/about-spensus\.html$/i.test(location.pathname)) return;
    if ($("#kepala-sekolah-masa-ke-masa")) return;
    const main = $("main") || document.body;
    const section = buildSection();
    const educator = findEducatorSection(main);
    if (educator) educator.insertAdjacentElement("beforebegin", section);
    else main.prepend(section);
    addTab(section);
    document.documentElement.dataset.headmastersV60 = VERSION;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

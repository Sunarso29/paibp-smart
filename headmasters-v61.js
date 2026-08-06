(() => {
  "use strict";
  const DATA = [
    ["Agus Halim","1980–1984","assets/kepala-sekolah/01-agus-halim-1980-1984.jpg"],
    ["Sukmo","1984–1989","assets/kepala-sekolah/02-sukmo-1984-1989.jpg"],
    ["Rudiman","1989–1996","assets/kepala-sekolah/03-rudiman-1989-1996.jpg"],
    ["Drs. H. Sadimin","1996–2003","assets/kepala-sekolah/04-drs-h-sadimin-1996-2003.jpg"],
    ["Drs. Slamet AY","2003–2006","assets/kepala-sekolah/05-drs-slamet-ay-2003-2006.jpg"],
    ["Pujianti, S.Pd.","2006–2010","assets/kepala-sekolah/06-pujianti-s-pd-2006-2010.jpg"],
    ["Rokhndayani, S.Pd., M.Pd.","2010–2012","assets/kepala-sekolah/07-rokhndayani-s-pd-m-pd-2010-2012.jpg"],
    ["Erry Subekti, S.Pd., M.M.","2012–2014","assets/kepala-sekolah/08-erry-subekti-s-pd-mm-2012-2014.jpg"],
    ["Bambang Kuseno, S.Pd.","2014–2016","assets/kepala-sekolah/09-bambang-kuseno-s-pd-2014-2016.jpg"],
    ["Rojat, S.Pd.","2016–2024","assets/kepala-sekolah/10-rojat-s-pd-2016-2024.jpg"],
    ["Drs. H. Akhmad Samiri, M.Pd.","2024–2026","assets/kepala-sekolah/11-drs-h-akhmad-samiri-m-pd-2024-2026.jpg"],
    ["Hari Teguh Wibowo, S.Pd., M.Si.","2026–sekarang","assets/kepala-sekolah/12-hari-teguh-wibowo-s-pd-msi-2026-sekarang.jpg",true]
  ];
  const $ = (s,r=document) => r.querySelector(s);
  const $$ = (s,r=document) => [...r.querySelectorAll(s)];

  function cardsHtml() {
    return DATA.map(([name,period,image,current],index)=>`<article class="v61-headmaster-card${current?" is-current":""}">
        <div class="v61-headmaster-order">${String(index+1).padStart(2,"0")}</div>
        <figure><img src="${image}" alt="${name}" loading="lazy" decoding="async"></figure>
        <div><span>${current?"KEPALA SEKOLAH SAAT INI":"MASA JABATAN"}</span><h3>${name}</h3><p>${period}</p></div>
      </article>`).join("");
  }

  function buildPanel() {
    const panel = document.createElement("section");
    panel.className = "about-panel-v29 v61-headmasters-panel";
    panel.dataset.aboutPanel = "headmasters";
    panel.hidden = true;
    panel.innerHTML = `<header class="v61-headmasters-hero"><div><span>JEJAK KEPEMIMPINAN SPENSUS</span><h2>Kepala Sekolah dari Masa ke Masa</h2><p>Urutan perjalanan kepemimpinan SMP Negeri 1 Susukan sejak berdiri hingga sekarang.</p></div><b>1980–sekarang</b></header>
      <div class="v61-headmasters-grid">${cardsHtml()}</div>`;
    return panel;
  }

  function activate(name) {
    $$('[data-about-tab]').forEach((button) => {
      const active = button.dataset.aboutTab === name;
      button.setAttribute("aria-pressed", String(active));
    });
    $$('[data-about-panel]').forEach((panel) => { panel.hidden = panel.dataset.aboutPanel !== name; });
    if (name === "headmasters") $("[data-about-panel='headmasters']")?.scrollIntoView({block:"start",behavior:"smooth"});
  }

  function init() {
    if (!/about-spensus\.html$/i.test(location.pathname)) return;
    const tabs = $(".about-tabs-v29");
    const profilePanel = $("[data-about-panel='profile']");
    if (!tabs || !profilePanel) return;

    let button = $("[data-about-tab='headmasters']", tabs);
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.dataset.aboutTab = "headmasters";
      button.setAttribute("aria-pressed","false");
      button.textContent = "Kepala Sekolah dari Masa ke Masa";
      const teacherButton = $("[data-about-tab='teachers']", tabs);
      tabs.insertBefore(button, teacherButton || null);
    }

    let panel = $("[data-about-panel='headmasters']");
    if (!panel) {
      panel = buildPanel();
      const teacherPanel = $("[data-about-panel='teachers']");
      teacherPanel?.parentElement?.insertBefore(panel, teacherPanel);
    } else {
      const grid = $("#v61-headmasters-static", panel) || $(".v61-headmasters-grid", panel);
      if (grid && !grid.children.length) grid.innerHTML = cardsHtml();
    }

    button.addEventListener("click", () => activate("headmasters"));
    $$('[data-about-tab]:not([data-about-tab="headmasters"])', tabs).forEach((item) => item.addEventListener("click", () => activate(item.dataset.aboutTab)));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true}); else init();
})();

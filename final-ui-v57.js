(() => {
  "use strict";
  const VERSION = "57";
  const MEDIA = window.PAIBP_V56_MEDIA || {};
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];

  function selectedModule(board) {
    return $("[data-v56-module][aria-selected='true']", board)?.dataset.v56Module || "wudhu";
  }

  function mediaKey(moduleId, index) {
    const extension = moduleId === "wudhu" || moduleId === "sholat" ? "webp" : "svg";
    return `${moduleId}-${String(index + 1).padStart(2, "0")}.${extension}`;
  }

  function validDataUri(value) {
    return /^data:image\/(?:webp|svg\+xml|png|jpeg);base64,/i.test(String(value || ""));
  }

  function repairPracticeMedia() {
    const board = $("#v56-practice-board");
    if (!board) return;
    const moduleId = selectedModule(board);

    const poster = $(".v56-poster img", board);
    if (poster && moduleId === "wudhu" && validDataUri(MEDIA["wudhu-poster.webp"])) {
      poster.src = MEDIA["wudhu-poster.webp"];
      poster.hidden = false;
      poster.closest("figure")?.classList.remove("v57-media-error");
    }

    $$(".v56-step-grid .v56-step", board).forEach((card, index) => {
      const image = $("figure img", card);
      const figure = $("figure", card);
      if (!image || !figure) return;
      const source = MEDIA[mediaKey(moduleId, index)];
      if (validDataUri(source)) {
        if (image.src !== source) image.src = source;
        image.hidden = false;
        image.style.removeProperty("display");
        image.style.removeProperty("opacity");
        figure.classList.remove("v57-media-error");
        image.onerror = () => figure.classList.add("v57-media-error");
        image.onload = () => figure.classList.remove("v57-media-error");
      } else {
        figure.classList.add("v57-media-error");
      }
    });
  }

  function repairContrast() {
    const board = $("#v56-practice-board");
    if (!board) return;
    board.dataset.v57Fixed = "true";
    $$(".v56-step-copy", board).forEach((copy) => {
      copy.querySelectorAll("small,h5,p").forEach((node) => {
        node.style.setProperty("color", "#ffffff", "important");
        node.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
      });
    });
  }

  function repair() {
    repairContrast();
    repairPracticeMedia();
  }

  function scheduleRepair() {
    requestAnimationFrame(() => {
      repair();
      setTimeout(repair, 80);
      setTimeout(repair, 350);
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-open-panel='islamic'],[data-islamic-view],[data-v56-module]")) {
      scheduleRepair();
    }
  }, true);

  function init() {
    document.documentElement.dataset.paibpContrastFix = VERSION;
    scheduleRepair();
    const panel = $("#panel-islamic,[data-panel='islamic']");
    if (panel) {
      const observer = new MutationObserver((mutations) => {
        if (mutations.some((item) => item.addedNodes.length || item.type === "attributes")) scheduleRepair();
      });
      observer.observe(panel, { childList:true, subtree:true, attributes:true, attributeFilter:["aria-selected","src"] });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
  else init();

  window.PAIBP_V57 = Object.freeze({ version:VERSION, repair });
})();

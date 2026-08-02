(() => {
  "use strict";
  const body = document.body;
  const normalize = (value) => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  // Slow ticker: newest school update when present, otherwise the vision/mission direction.
  function refreshV29Ticker() {
    const text = document.querySelector("#smart-ticker-text");
    const label = document.querySelector(".ticker-label");
    if (!text) return;
    const news = Array.isArray(window.PAIBP_SCHOOL?.news) ? window.PAIBP_SCHOOL.news.filter((item) => item?.title) : [];
    const latest = news.slice().sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")))[0];
    if (latest) {
      if (label) label.lastChild.textContent = " INFO TERBARU";
      text.textContent = `Pembaruan Spensus • ${latest.title}${latest.summary ? ` — ${latest.summary}` : ""}`;
    } else {
      if (label) label.lastChild.textContent = " VISI & MISI SPENSUS";
      const fallback = window.PAIBP_SCHOOL?.school?.tickerFallback || "Mewujudkan pendidikan berkualitas, berkarakter, berprestasi, dan berakhlak mulia melalui budaya belajar yang aman, ramah, dan kolaboratif.";
      text.textContent = `Visi dan Misi Spensus • ${fallback}`;
    }
  }
  window.addEventListener("DOMContentLoaded", () => setTimeout(refreshV29Ticker, 80));
  window.addEventListener("load", () => setTimeout(refreshV29Ticker, 220));
  const newsGalleryV29 = document.querySelector("#news-gallery");
  if (newsGalleryV29) new MutationObserver(() => setTimeout(refreshV29Ticker, 30)).observe(newsGalleryV29,{childList:true,subtree:true,characterData:true});

  // Draggable but fixed Spensus AI launcher.
  const launcher = document.querySelector("#spensus-ai-launcher-v27");
  if (launcher) {
    if (!launcher.querySelector(".drag-handle-v29")) {
      const handle = document.createElement("span"); handle.className = "drag-handle-v29"; handle.setAttribute("aria-hidden","true"); handle.textContent = "⋮⋮"; launcher.append(handle);
    }
    const key = "paibp-spensus-ai-position-v29";
    const clamp = (value,min,max) => Math.min(Math.max(value,min),max);
    const apply = (x,y) => {
      const rect = launcher.getBoundingClientRect();
      const left = clamp(x, 8, Math.max(8, innerWidth - rect.width - 8));
      const top = clamp(y, 8, Math.max(8, innerHeight - rect.height - 8));
      launcher.style.left = `${left}px`; launcher.style.top = `${top}px`; launcher.style.right = "auto"; launcher.style.bottom = "auto";
      return {left,top};
    };
    try { const saved = JSON.parse(localStorage.getItem(key) || "null"); if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) requestAnimationFrame(() => apply(saved.left,saved.top)); } catch {}
    let drag = null; let suppressClick = false;
    launcher.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      const rect = launcher.getBoundingClientRect();
      drag = {id:event.pointerId, dx:event.clientX-rect.left, dy:event.clientY-rect.top, startX:event.clientX, startY:event.clientY, moved:false};
      launcher.setPointerCapture?.(event.pointerId); launcher.classList.add("is-dragging-v29");
    });
    launcher.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      if (Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>7) drag.moved=true;
      if (drag.moved) { event.preventDefault(); apply(event.clientX-drag.dx,event.clientY-drag.dy); }
    });
    const finish = (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      launcher.releasePointerCapture?.(event.pointerId); launcher.classList.remove("is-dragging-v29");
      if (drag.moved) { const rect=launcher.getBoundingClientRect(); try { localStorage.setItem(key,JSON.stringify({left:rect.left,top:rect.top})); } catch {} suppressClick=true; setTimeout(()=>suppressClick=false,80); }
      drag=null;
    };
    launcher.addEventListener("pointerup",finish); launcher.addEventListener("pointercancel",finish);
    launcher.addEventListener("click",(event)=>{ if(suppressClick){event.preventDefault();event.stopImmediatePropagation();}},true);
    addEventListener("resize",()=>{ if(launcher.style.left){ const r=launcher.getBoundingClientRect(); apply(r.left,r.top); }});
  }

  // Public teacher entry remains visible; once the visitor enters pupil mode it disappears.
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-panel]");
    if (!trigger) return;
    if (["student","islamic","games"].includes(trigger.dataset.openPanel)) body.dataset.portalRole="murid";
  }, true);

  // Owner-only shortcut appears after Sunarso's teacher identity is recognized; editor password is still required.
  const ownerEntry = document.querySelector("#owner-editor-entry-v29");
  function updateOwnerEntry() {
    if (!ownerEntry) return;
    let identity={}; try { identity=JSON.parse(localStorage.getItem("paibp-smart-teacher-identity-v1")||"{}"); } catch {}
    const isOwner = normalize(identity.name).includes("sunarso") && normalize(identity.workUnit).includes("smp negeri 1 susukan");
    ownerEntry.hidden = !isOwner;
  }
  function applyTeacherTierV29() {
    if (!document.querySelector("#panel-teacher")) return;
    let identity={}; try { identity=JSON.parse(localStorage.getItem("paibp-smart-teacher-identity-v1")||"{}"); } catch {}
    if (!identity.name) return;
    const owner = normalize(identity.name).includes("sunarso") && normalize(identity.workUnit).includes("smp negeri 1 susukan");
    const tier = owner || identity.teacherRecognized ? "registered" : "guest";
    body.dataset.teacherTier=tier;
    let banner=document.querySelector(".teacher-tier-banner-v29");
    if (tier==="guest") {
      if (!banner) { banner=document.createElement("div"); banner.className="teacher-tier-banner-v29"; const panel=document.querySelector("#panel-teacher .panel-heading"); panel?.insertAdjacentElement("afterend",banner); }
      banner.innerHTML="<strong>Mode Guru Tamu</strong>Akses perangkat dan sumber pembelajaran tersedia. Rekap murid, publikasi ujian, dan kendali sensitif hanya tersedia bagi guru yang dikenali pada direktori internal sekolah.";
    } else banner?.remove();
  }
  updateOwnerEntry(); applyTeacherTierV29();
  document.querySelector("#teacher-access-form")?.addEventListener("submit",()=>setTimeout(()=>{updateOwnerEntry();applyTeacherTierV29();},150));
  const teacherMenuV29=document.querySelector(".teacher-doc-menu");
  if (teacherMenuV29) new MutationObserver(applyTeacherTierV29).observe(teacherMenuV29,{childList:true,subtree:true});

  // The legacy directory pages can deep-link to the right About tab.
  if (location.pathname.endsWith("about-spensus.html") && location.hash) {
    const requested=location.hash.replace("#","");
    setTimeout(()=>document.querySelector(`[data-about-tab="${requested}"]`)?.click(),80);
  }
})();
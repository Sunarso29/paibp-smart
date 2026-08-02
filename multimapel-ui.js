(() => {
  "use strict";
  const db = window.SPENSUS_MULTIMAPEL;
  if (!db) return;

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  const state = { subject: "all", grade: "all", semester: "all", query: "" };
  const subjectById = Object.fromEntries(db.subjects.map((item) => [item.id, item]));

  function filteredModules() {
    const q = state.query.trim().toLocaleLowerCase("id");
    return db.modules.filter((item) => {
      if (state.subject !== "all" && item.subject !== state.subject) return false;
      if (state.grade !== "all" && item.grade !== state.grade) return false;
      if (state.semester !== "all" && item.semester !== state.semester) return false;
      if (q && !`${item.title} ${item.subjectName} ${item.grade} ${item.semester}`.toLocaleLowerCase("id").includes(q)) return false;
      return true;
    }).sort((a,b) => a.subjectName.localeCompare(b.subjectName,"id") || a.grade.localeCompare(b.grade) || (Number(a.number)||99)-(Number(b.number)||99) || a.title.localeCompare(b.title,"id"));
  }

  function subjectOptions() {
    return [`<option value="all">Semua mata pelajaran</option>`, ...db.subjects.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} (${item.moduleCount})</option>`)].join("");
  }

  function filtersHtml(prefix) {
    return `<div class="multi-filter-v33">
      <label><span>Mata pelajaran</span><select data-mm-subject="${prefix}">${subjectOptions()}</select></label>
      <label><span>Kelas</span><select data-mm-grade="${prefix}"><option value="all">Semua kelas</option><option value="VII">VII</option><option value="VIII">VIII</option><option value="IX">IX</option></select></label>
      <label><span>Semester</span><select data-mm-semester="${prefix}"><option value="all">Semua semester</option><option value="Gasal">Gasal</option><option value="Genap">Genap</option></select></label>
      <label class="multi-search-v33"><span>Cari bab atau topik</span><input data-mm-query="${prefix}" type="search" placeholder="Contoh: aljabar, teks deskripsi, bola basket…"></label>
    </div>`;
  }

  function cardsHtml(items) {
    if (!items.length) return `<div class="multi-empty-v33"><strong>Materi belum ditemukan.</strong><p>Ubah kelas, semester, mata pelajaran, atau kata pencarian.</p></div>`;
    return items.map((item) => {
      const subject = subjectById[item.subject] || { code: "MAP", color: "#087f68" };
      return `<article class="multi-module-card-v33" style="--subject:${escapeHtml(subject.color)}">
        <div class="multi-card-top-v33"><span>${escapeHtml(subject.code)}</span><small>Kelas ${escapeHtml(item.grade)} • Semester ${escapeHtml(item.semester)}</small></div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.subjectName)}</p>
        <div class="multi-card-actions-v33">
          <button type="button" data-mm-open="${escapeHtml(item.id)}">Buka paket belajar</button>
          ${item.page ? `<a href="${escapeHtml(item.page)}">Halaman materi</a>` : ""}${item.source ? `<a href="${escapeHtml(item.source)}" download>Unduh sumber</a>` : ""}
        </div>
      </article>`;
    }).join("");
  }

  function syncControls(root) {
    root.querySelectorAll("[data-mm-subject]").forEach((el) => el.value = state.subject);
    root.querySelectorAll("[data-mm-grade]").forEach((el) => el.value = state.grade);
    root.querySelectorAll("[data-mm-semester]").forEach((el) => el.value = state.semester);
    root.querySelectorAll("[data-mm-query]").forEach((el) => el.value = state.query);
  }

  function render(root) {
    const grid = root.querySelector("[data-mm-grid]");
    const count = root.querySelector("[data-mm-count]");
    const items = filteredModules();
    if (grid) grid.innerHTML = cardsHtml(items);
    if (count) count.textContent = `${items.length} paket belajar ditampilkan dari ${db.moduleCount} paket terintegrasi.`;
    syncControls(root);
  }

  async function openModule(root, id) {
    const meta = db.modules.find((item) => item.id === id);
    if (!meta) return;
    const viewer = root.querySelector("[data-mm-viewer]");
    const library = root.querySelector("[data-mm-library]");
    if (!viewer || !library) return;
    viewer.hidden = false;
    viewer.dataset.mmActive = id;
    library.hidden = true;
    viewer.innerHTML = `<div class="multi-loading-v33"><span></span><strong>Menyiapkan paket belajar…</strong></div>`;
    try {
      const response = await fetch(meta.data, { cache: "force-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const item = await response.json();
      const objectives = (item.objectives || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
      const summary = (item.summary || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
      const worksheet = (item.worksheet || []).map((t,i) => `<label class="multi-task-v33"><span>${i+1}</span><div><p>${escapeHtml(t)}</p><textarea rows="3" placeholder="Tuliskan jawabanmu…" data-mm-answer="${i}"></textarea></div></label>`).join("");
      viewer.innerHTML = `<div class="multi-viewer-head-v33">
        <button type="button" data-mm-back>← Kembali ke daftar</button>
        <div><span>${escapeHtml(item.subjectName)} • Kelas ${escapeHtml(item.grade)} • Semester ${escapeHtml(item.semester)}</span><h2>${escapeHtml(item.title)}</h2></div>
        <div class="multi-viewer-actions-v33">${item.source ? `<a href="${escapeHtml(item.source)}" download>Unduh DOCX sumber</a>` : ""}<button type="button" data-mm-print>Cetak / PDF</button></div>
      </div>
      <div class="multi-tabs-v33" role="tablist">
        <button type="button" aria-pressed="true" data-mm-tab="material">Materi Bab</button>
        <button type="button" aria-pressed="false" data-mm-tab="summary">Ringkasan</button>
        <button type="button" aria-pressed="false" data-mm-tab="worksheet">LKPD</button>
        <button type="button" aria-pressed="false" data-mm-tab="source">Sumber</button>
      </div>
      <article class="multi-document-v33" data-mm-panel="material">
        ${objectives ? `<section class="multi-objectives-v33"><h3>Tujuan Pembelajaran</h3><ul>${objectives}</ul></section>` : ""}
        ${item.materialHtml || "<p>Materi sedang disusun.</p>"}
      </article>
      <article class="multi-document-v33" data-mm-panel="summary" hidden><h3>Ringkasan Inti</h3><ol class="multi-summary-list-v33">${summary}</ol></article>
      <article class="multi-document-v33" data-mm-panel="worksheet" hidden><h3>LKPD Interaktif</h3><p>Jawab secara mandiri, lalu simpan pekerjaan pada perangkat.</p><div class="multi-worksheet-v33">${worksheet}</div><button class="multi-save-v33" type="button" data-mm-save>Simpan jawaban</button><span class="multi-save-status-v33" data-mm-save-status></span></article>
      <article class="multi-document-v33" data-mm-panel="source" hidden><h3>Sumber dan Integritas Konten</h3><p>${escapeHtml(item.note || "")}</p><dl><dt>Dokumen sumber</dt><dd>${escapeHtml(item.sourceName || "Rujukan resmi")}</dd><dt>Lokasi arsip</dt><dd>${escapeHtml(item.sourceOriginal || "Kurikulum Nasional")}</dd></dl>${item.source ? `<a class="multi-source-download-v33" href="${escapeHtml(item.source)}" download>Unduh berkas sumber asli</a>` : `<a class="multi-source-download-v33" href="https://kurikulum.kemendikdasmen.go.id/koding-ka" target="_blank" rel="noopener">Buka rujukan resmi</a>`}</article>`;
      restoreAnswers(viewer, item.id);
      viewer.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      viewer.innerHTML = `<div class="multi-empty-v33"><strong>Paket belum dapat dibuka.</strong><p>${escapeHtml(error.message)}</p><button type="button" data-mm-back>Kembali</button></div>`;
    }
  }

  function storageKey(id) { return `spensus-multimapel-${id}`; }
  function restoreAnswers(viewer,id) {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey(id)) || "{}");
      viewer.querySelectorAll("[data-mm-answer]").forEach((el) => { el.value = data[el.dataset.mmAnswer] || ""; });
    } catch (_) {}
  }
  function saveAnswers(viewer,id) {
    const data = {};
    viewer.querySelectorAll("[data-mm-answer]").forEach((el) => { data[el.dataset.mmAnswer] = el.value; });
    localStorage.setItem(storageKey(id), JSON.stringify(data));
    const status = viewer.querySelector("[data-mm-save-status]");
    if (status) status.textContent = "Jawaban tersimpan di perangkat ini.";
  }

  function bind(root) {
    root.addEventListener("change", (event) => {
      const target = event.target;
      if (target.matches("[data-mm-subject]")) state.subject = target.value;
      else if (target.matches("[data-mm-grade]")) state.grade = target.value;
      else if (target.matches("[data-mm-semester]")) state.semester = target.value;
      else return;
      document.querySelectorAll("[data-multimapel-root]").forEach(render);
    });
    root.addEventListener("input", (event) => {
      if (!event.target.matches("[data-mm-query]")) return;
      state.query = event.target.value;
      document.querySelectorAll("[data-multimapel-root]").forEach(render);
    });
    root.addEventListener("click", (event) => {
      const open = event.target.closest("[data-mm-open]");
      if (open) { openModule(root, open.dataset.mmOpen); return; }
      if (event.target.closest("[data-mm-back]")) {
        const viewer=root.querySelector("[data-mm-viewer]"); const library=root.querySelector("[data-mm-library]");
        if (viewer) { viewer.hidden=true; viewer.innerHTML=""; } if (library) library.hidden=false; return;
      }
      const tab=event.target.closest("[data-mm-tab]");
      if (tab) {
        const viewer=root.querySelector("[data-mm-viewer]");
        viewer.querySelectorAll("[data-mm-tab]").forEach((b)=>b.setAttribute("aria-pressed",String(b===tab)));
        viewer.querySelectorAll("[data-mm-panel]").forEach((p)=>p.hidden=p.dataset.mmPanel!==tab.dataset.mmTab); return;
      }
      if (event.target.closest("[data-mm-print]")) { window.print(); return; }
      if (event.target.closest("[data-mm-save]")) {
        const viewer=root.querySelector("[data-mm-viewer]"); const id=viewer?.dataset.mmActive;
        if (id) saveAnswers(viewer,id); return;
      }
    });
  }

  function initRoot(root) {
    const prefix=root.id || `mm-${Math.random().toString(36).slice(2)}`;
    root.innerHTML = `<div data-mm-library>
      <div class="multi-library-head-v33"><div><span>PORTAL MULTIMAPEL SMP</span><h2>Materi, ringkasan, dan LKPD lintas mata pelajaran</h2><p>Konten dinormalisasi dari ${db.sourceCount} dokumen sumber dan disajikan tanpa nama guru.</p></div><strong>${db.moduleCount}<small>paket terintegrasi</small></strong></div>
      ${filtersHtml(prefix)}
      <div class="multi-count-v33" data-mm-count></div>
      <div class="multi-grid-v33" data-mm-grid></div>
    </div><section data-mm-viewer hidden></section>`;
    bind(root); render(root);
  }

  document.querySelectorAll("[data-multimapel-root]").forEach(initRoot);

  // Ruang Murid: dua perpustakaan dalam satu ruang.
  const paibpLibrary=document.querySelector("#student-library");
  const lessonViewer=document.querySelector("#lesson-viewer");
  const multimapelLibrary=document.querySelector("#student-multimapel-library");
  document.querySelectorAll("[data-student-library-tab]").forEach((button)=>button.addEventListener("click",()=>{
    const mode=button.dataset.studentLibraryTab;
    document.querySelectorAll("[data-student-library-tab]").forEach((b)=>b.setAttribute("aria-pressed",String(b===button)));
    if (paibpLibrary) paibpLibrary.hidden=mode!=="paibp";
    if (lessonViewer) lessonViewer.hidden=true;
    if (multimapelLibrary) multimapelLibrary.hidden=mode!=="multimapel";
  }));
})();

(() => {
  "use strict";

  const BUILD = "83";
  const SOURCE_NAME = "ATP PAI Kelas VII Deep Learning.docx";
  const SOURCE = Object.freeze({
    regulation: "Keputusan Kepala Badan Standar, Kurikulum, dan Asesmen Pendidikan Kemendikdasmen Nomor 071/H/KR/2026 tentang Perubahan atas Keputusan Kepala BSKAP Nomor 046/H/KR/2025 tentang Capaian Pembelajaran PAUD, Pendidikan Dasar, dan Pendidikan Menengah.",
    intro: "Pada akhir Fase D, murid memiliki kemampuan sebagai berikut.",
    elements: [
      ["Al Qur'an dan Hadits", "Murid mampu membaca, menghafal, memahami, menelaah, serta mengaktualisasikan kandungan ayat Al Qur'an dan Hadits secara tekstual maupun kontekstual sebagai pedoman hidup dalam kehidupan pribadi, bermasyarakat, berbangsa, dan bernegara."],
      ["Akidah", "Murid memahami prinsip-prinsip keimanan kepada Alloh Subhanahu Wata'ala, malaikat, kitab-kitab Alloh Subhanahu Wata'ala, rasul-rasul Alloh Subhanahu Wata'ala, hari akhir, dan qada serta qadar sebagai landasan berpikir, bersikap, dan berperilaku sesuai ajaran Islam."],
      ["Akhlak", "Murid memahami, membiasakan, dan merefleksikan perilaku mahmudah, seperti ikhlas, syukur, husnudzon, cinta kepada Rasulullah Sholallohu 'Alaihi Wasallam, kasih sayang kepada sesama manusia dan lingkungan, serta mampu menghindari perilaku mazmumah dalam kehidupan sehari-hari."],
      ["Fikih", "Murid memahami, menerapkan, dan merefleksikan ketentuan ibadah mahdhah maupun ghairu mahdhah, meliputi sholat, sujud, rukhsah, pengurusan jenazah, haji, umrah, kurban, akikah, serta penyembelihan hewan sesuai ketentuan syariat Islam."],
      ["Sejarah Peradaban Islam", "Murid memahami perkembangan sejarah peradaban Islam, mengambil ibrah dari tokoh, peristiwa, dan kemajuan peradaban Islam sebagai inspirasi dalam menghadapi tantangan kehidupan masa kini."]
    ]
  });

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;

  function teacherPanel() {
    return $("#panel-teacher") || $(".teacher-panel-v29");
  }

  function cpButtonActive() {
    const panel = teacherPanel();
    const active = $('[data-teacher-doc="cp"][aria-pressed="true"]', panel);
    if (active) return true;
    return Boolean($('[data-teacher-doc="cp"].active,[data-teacher-doc="cp"].is-active', panel));
  }

  function oldModeActive() {
    const panel = teacherPanel();
    if (String(panel?.dataset?.curriculumMode || "") === "2025") return true;
    return Boolean($('[data-v48-cp-mode="2025"][aria-pressed="true"]'));
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[ch]);
  }

  function sourceDocumentHtml() {
    return `
      <article class="cp26-source-paper" data-cp2026-source="${BUILD}" data-source-name="${esc(SOURCE_NAME)}">
        <h2>CAPAIAN PEMBELAJARAN (CP)</h2>
        <p class="cp26-regulation"><strong>A. Capaian Pembelajaran (CP) Berdasarkan</strong> ${esc(SOURCE.regulation)}</p>
        <p>${esc(SOURCE.intro)}</p>
        <div class="cp26-source-elements">
          ${SOURCE.elements.map(([title, text]) => `
            <section class="cp26-source-element">
              <h3>${esc(title)}</h3>
              <p>${esc(text)}</p>
            </section>`).join("")}
        </div>
      </article>`;
  }

  function render(force = false) {
    const target = $("#teacher-document");
    if (!target || oldModeActive() || !cpButtonActive()) return false;
    if (!force && target.querySelector('[data-cp2026-source="83"]')) return true;
    target.innerHTML = sourceDocumentHtml();
    target.dataset.cp2026Source = BUILD;
    return true;
  }

  let timer = 0;
  function schedule(force = false) {
    clearTimeout(timer);
    timer = setTimeout(() => render(force), 90);
  }

  function boot() {
    document.addEventListener("click", (event) => {
      if (event.target.closest('[data-v48-cp-mode="2025"]')) return;
      if (event.target.closest('[data-teacher-doc="cp"],[data-v48-cp-mode="2026"],[data-teacher-grade]')) schedule(true);
    }, true);

    const target = $("#teacher-document");
    if (target) {
      const observer = new MutationObserver(() => {
        if (!oldModeActive() && cpButtonActive() && !target.querySelector('[data-cp2026-source="83"]')) schedule();
      });
      observer.observe(target, {childList:true, subtree:false});
    }

    [220, 650, 1400].forEach((ms) => setTimeout(() => schedule(), ms));
    window.PAIBP_CP2026_SOURCE_V83 = Object.freeze({build:BUILD, sourceName:SOURCE_NAME, render:() => render(true)});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();

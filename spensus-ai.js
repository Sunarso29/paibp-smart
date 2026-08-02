(() => {
  "use strict";
  const form = document.querySelector("#spensus-ai-form");
  const input = document.querySelector("#spensus-ai-input");
  const messages = document.querySelector("#spensus-ai-messages");
  if (!form || !input || !messages) return;

  const chapters = Array.isArray(window.PAIBP_DATA?.chapters) ? window.PAIBP_DATA.chapters : [];
  const normalize = (value) => String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id");
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));

  function addMessage(role, content, actions = []) {
    const article = document.createElement("article");
    article.className = `ai-message-v26 ${role}`;
    article.innerHTML = `<span class="ai-message-avatar">${role === "user" ? "Anda" : "AI"}</span><div class="ai-message-bubble">${content}${actions.length ? `<div class="ai-message-actions">${actions.map((action) => `<button type="button" data-ai-action="${escapeHtml(action.action)}"${action.value ? ` data-ai-value="${escapeHtml(action.value)}"` : ""}>${escapeHtml(action.label)}</button>`).join("")}</div>` : ""}</div>`;
    messages.append(article);
    messages.scrollTop = messages.scrollHeight;
  }

  function chapterSearch(query) {
    const words = normalize(query).split(/\s+/).filter((word) => word.length > 2 && !["materi","kelas","tolong","jelaskan","tentang","saya","yang","untuk"].includes(word));
    const gradeMatch = query.match(/(?:kelas\s*)?(vii|viii|ix|7|8|9)\b/i)?.[1]?.toUpperCase();
    const grade = ({"7":"VII","8":"VIII","9":"IX"})[gradeMatch] || gradeMatch;
    return chapters.map((chapter) => {
      const haystack = normalize([chapter.title, chapter.overview, chapter.element, ...(chapter.references || []), ...(chapter.objectives || [])].join(" "));
      let score = words.reduce((total, word) => total + (haystack.includes(word) ? 3 : 0), 0);
      if (grade && chapter.grade === grade) score += 4;
      return { chapter, score };
    }).filter((entry) => entry.score > 0).sort((a,b) => b.score - a.score).slice(0,4).map((entry) => entry.chapter);
  }

  function getResponse(raw) {
    const query = raw.trim();
    const q = normalize(query);
    if (!q) return { html: "Silakan tuliskan pertanyaan Anda." };
    if (/^(halo|hai|assalamualaikum|selamat)/.test(q)) {
      return { html: "<strong>Wa'alaikumussalam, selamat datang.</strong>Saya siap membantu mencari materi, membuat rencana belajar, memberikan latihan singkat, dan mengarahkan Anda ke fitur portal." };
    }
    if (q.includes("rencana") || q.includes("jadwal belajar")) {
      return { html: `<strong>Rencana belajar 7 hari</strong><ul><li>Hari 1: pilih satu bab dan baca tujuan pembelajaran.</li><li>Hari 2: pelajari konsep utama dan dalil.</li><li>Hari 3: tulis ringkasan dengan bahasa sendiri.</li><li>Hari 4: kerjakan latihan dan periksa kesalahan.</li><li>Hari 5: selesaikan LKPD atau aktivitas.</li><li>Hari 6: ulangi bagian yang belum dipahami.</li><li>Hari 7: refleksi dan uji diri tanpa melihat catatan.</li></ul>`, actions:[{label:"Buka materi",action:"panel",value:"student"},{label:"Mainkan game",action:"panel",value:"games"}] };
    }
    if (q.includes("latihan") || q.includes("soal")) {
      const sample = chapters[Math.floor(Date.now()/86400000) % Math.max(chapters.length,1)];
      if (!sample) return { html:"Bank materi belum dapat dibaca. Silakan buka Ruang Murid." };
      const qs = (sample.questions || []).slice(0,3);
      return { html:`<strong>Latihan singkat — ${escapeHtml(sample.title)}</strong><ol>${qs.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol><small>Jawab dengan bahasa sendiri, lalu cocokkan dengan materi bab.</small>`, actions:[{label:"Buka bab terkait",action:"chapter",value:sample.id},{label:"Buka game",action:"panel",value:"games"}] };
    }
    if (q.includes("fitur islami") || q.includes("alquran") || q.includes("al qur'an") || q.includes("dzikir") || q.includes("tajwid") || q.includes("bahasa arab") || q.includes("khutbah")) {
      return { html:"<strong>Fitur Islami tersedia dalam satu ruang.</strong>Anda dapat membuka Al Qur'an digital, tajwid praktis, dzikir pagi-petang, Hisnul Muslim, khutbah Jum'at, jadwal sholat, kalender Hijriah, dan Bahasa Arab berjenjang.", actions:[{label:"Buka Fitur Islami",action:"panel",value:"islamic"}] };
    }
    if (q.includes("game") || q.includes("xp") || q.includes("permainan")) {
      return { html:"<strong>Game Edukasi</strong> menyediakan kuis, tantangan waktu, XP, lencana, dan progres. Pilih game setelah memahami materi agar permainan menjadi sarana penguatan.", actions:[{label:"Buka arena",action:"panel",value:"games"}] };
    }
    if (q.includes("guru") || q.includes("editor")) {
      return { html:"Ruang Guru dan Ruang Editor merupakan layanan terpisah yang tidak ditampilkan pada akses murid atau pengunjung. Hubungi pengelola sekolah apabila membutuhkan akses resmi." };
    }
    const results = chapterSearch(query);
    if (results.length) {
      const list = results.map((chapter) => `<li><strong>Kelas ${escapeHtml(chapter.grade)} • Bab ${chapter.number}: ${escapeHtml(chapter.title)}</strong><br><span>${escapeHtml(String(chapter.overview || "").slice(0,180))}${String(chapter.overview || "").length > 180 ? "…" : ""}</span></li>`).join("");
      return { html:`<strong>Materi yang paling relevan</strong><ol>${list}</ol>`, actions:results.slice(0,2).map((chapter) => ({label:`Buka ${chapter.grade}-${chapter.number}`,action:"chapter",value:chapter.id})) };
    }
    return { html:"Saya belum menemukan kecocokan langsung. Coba tuliskan kelas, nomor bab, atau tema yang lebih spesifik, misalnya <em>iman kepada kitab Allah kelas VIII</em>.", actions:[{label:"Lihat semua materi",action:"panel",value:"student"},{label:"Fitur Islami",action:"panel",value:"islamic"}] };
  }

  function ask(prompt) {
    const text = String(prompt || "").trim();
    if (!text) return;
    addMessage("user", escapeHtml(text));
    input.value = "";
    input.style.height = "auto";
    const thinking = document.createElement("article");
    thinking.className = "ai-message-v26 assistant ai-thinking-v26";
    thinking.innerHTML = '<span class="ai-message-avatar">AI</span><div class="ai-message-bubble">Menelusuri materi portal…</div>';
    messages.append(thinking);
    messages.scrollTop = messages.scrollHeight;
    window.setTimeout(() => {
      thinking.remove();
      const response = getResponse(text);
      addMessage("assistant", response.html, response.actions || []);
    }, 280);
  }

  form.addEventListener("submit", (event) => { event.preventDefault(); ask(input.value); });
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight,120)}px`; });
  input.addEventListener("keydown", (event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
  document.querySelectorAll("[data-ai-prompt]").forEach((button) => button.addEventListener("click", () => ask(button.dataset.aiPrompt)));
  document.querySelector("#spensus-ai-reset")?.addEventListener("click", () => {
    messages.innerHTML = "";
    addMessage("assistant", "<strong>Assalamu'alaikum.</strong>Saya Spensus AI, asisten pendidikan di PAIBP SMART SMP. Materi apa yang ingin dipelajari hari ini?");
  });
  messages.addEventListener("click", (event) => {
    const button = event.target.closest("[data-ai-action]");
    if (!button) return;
    if (button.dataset.aiAction === "panel") document.querySelector(`[data-open-panel="${button.dataset.aiValue}"]`)?.click();
    if (button.dataset.aiAction === "chapter") {
      document.querySelector('[data-open-panel="student"]')?.click();
      window.setTimeout(() => document.querySelector(`[data-chapter-id="${button.dataset.aiValue}"], [data-chapter="${button.dataset.aiValue}"]`)?.click(), 500);
    }
  });
  addMessage("assistant", "<strong>Assalamu'alaikum.</strong>Saya Spensus AI, asisten pendidikan di PAIBP SMART SMP. Materi apa yang ingin dipelajari hari ini?");
})();

(() => {
  "use strict";

  const VERSION = "44";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.aiEndpoint || CONFIG.syncEndpoint || CONFIG.realtimeEndpoint || "").trim();
  const AI_TOKEN = String(CONFIG.aiPublicToken || "").trim();
  const REMOTE_READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT) && Boolean(AI_TOKEN);
  const HISTORY_KEY = "paibp-smart-ai-history-v44";
  const SESSION_KEY = "paibp-smart-ai-session-v44";
  const MAX_HISTORY = 12;
  const chapters = Array.isArray(window.PAIBP_DATA?.chapters) ? window.PAIBP_DATA.chapters : [];

  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
  const normalize = (value) => String(value || "").normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id")
    .replace(/[^a-z0-9]+/g, " ").trim();
  const safeParse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const truncate = (value, limit) => String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);

  function getSessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function loadHistory() {
    const value = safeParse(sessionStorage.getItem(HISTORY_KEY), []);
    return Array.isArray(value) ? value.slice(-MAX_HISTORY) : [];
  }

  function saveHistory(history) {
    try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_HISTORY))); } catch {}
  }

  function markdownToHtml(text) {
    const safe = escapeHtml(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
    const lines = safe.split("\n");
    let html = "";
    let list = "";
    const closeList = () => { if (list) { html += `</${list}>`; list = ""; } };
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^###\s+/.test(trimmed)) { closeList(); html += `<h5>${trimmed.replace(/^###\s+/, "")}</h5>`; continue; }
      if (/^##\s+/.test(trimmed)) { closeList(); html += `<h4>${trimmed.replace(/^##\s+/, "")}</h4>`; continue; }
      if (/^#\s+/.test(trimmed)) { closeList(); html += `<h3>${trimmed.replace(/^#\s+/, "")}</h3>`; continue; }
      const bullet = /^[-*]\s+(.+)/.exec(trimmed);
      if (bullet) { if (list !== "ul") { closeList(); list = "ul"; html += "<ul>"; } html += `<li>${bullet[1]}</li>`; continue; }
      const ordered = /^\d+[.)]\s+(.+)/.exec(trimmed);
      if (ordered) { if (list !== "ol") { closeList(); list = "ol"; html += "<ol>"; } html += `<li>${ordered[1]}</li>`; continue; }
      closeList();
      if (trimmed) html += `<p>${trimmed}</p>`;
    }
    closeList();
    return html || "<p>Jawaban belum tersedia.</p>";
  }

  function chapterScore(chapter, query) {
    const words = normalize(query).split(/\s+/).filter((word) => word.length > 2);
    const haystack = normalize([
      chapter.id, chapter.grade, chapter.number, chapter.title, chapter.overview, chapter.element,
      ...(chapter.objectives || []), ...(chapter.references || []),
      ...(chapter.concepts || []).flat(), ...(chapter.applications || []), ...(chapter.questions || []),
    ].join(" "));
    let score = words.reduce((total, word) => total + (haystack.includes(word) ? 2 : 0), 0);
    const gradeMatch = normalize(query).match(/(?:kelas\s*)?(7|8|9|vii|viii|ix)\b/)?.[1];
    const grade = ({ "7": "VII", "8": "VIII", "9": "IX", vii: "VII", viii: "VIII", ix: "IX" })[gradeMatch];
    if (grade && chapter.grade === grade) score += 5;
    if (normalize(query).includes(`bab ${chapter.number}`)) score += 5;
    return score;
  }

  function relevantChapters(query, limit = 4) {
    return chapters.map((chapter) => ({ chapter, score: chapterScore(chapter, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((entry) => entry.chapter);
  }

  function portalContext(query) {
    const matches = relevantChapters(query, 4);
    const visiblePanel = $(".workspace-panel:not([hidden])");
    const pageText = truncate(visiblePanel?.innerText || $("main")?.innerText || "", 1600);
    const chapterText = matches.map((chapter) => {
      const concepts = (chapter.concepts || []).slice(0, 5).map((item) => Array.isArray(item) ? `${item[0]}: ${item[1]}` : item).join(" | ");
      return `Kelas ${chapter.grade} Bab ${chapter.number} — ${chapter.title}. ${chapter.overview || ""}. ${concepts}`;
    }).join("\n");
    return truncate(`HALAMAN AKTIF: ${pageText}\n\nMATERI RELEVAN:\n${chapterText}`, 3300);
  }

  function localAnswer(prompt) {
    const q = normalize(prompt);
    const matches = relevantChapters(prompt, 3);
    if (/^(halo|hai|assalamualaikum|selamat)/.test(q)) {
      return {
        text: "Wa'alaikumussalam. Saya Spensus AI. Saya dapat membantu menjelaskan konten portal, mencari bab, menyusun rencana belajar, membuat latihan, dan—setelah layanan AI daring diaktifkan—menjawab pertanyaan umum secara lebih luas.",
        mode: "offline",
      };
    }
    if (matches.length) {
      const body = matches.map((chapter, index) => `${index + 1}. **Kelas ${chapter.grade} Bab ${chapter.number}: ${chapter.title}**\n${truncate(chapter.overview, 320)}`).join("\n\n");
      return {
        text: `Saya menemukan materi portal yang paling berkaitan:\n\n${body}\n\nBuka bab tersebut untuk membaca materi, latihan, LKPD, dan evaluasi secara utuh.`,
        mode: "offline",
        actions: matches.slice(0, 2).map((chapter) => ({ label: `Buka ${chapter.grade}-${chapter.number}`, type: "chapter", value: chapter.id })),
      };
    }
    if (/rencana|jadwal belajar/.test(q)) {
      return {
        text: "**Rencana belajar terarah**\n1. Baca tujuan dan materi bab.\n2. Tulis ringkasan dengan bahasa sendiri.\n3. Kerjakan seluruh latihan.\n4. Selesaikan LKPD.\n5. Kerjakan evaluasi dan refleksi.\n6. Tandai bab selesai agar bab berikutnya terbuka.",
        mode: "offline",
      };
    }
    return {
      text: REMOTE_READY
        ? "Layanan AI daring sedang tidak dapat dijangkau. Saya tetap dapat mencari konten portal secara luring. Coba ulangi beberapa saat lagi."
        : "Mode luring aktif. Saya dapat menjawab berdasarkan konten portal. Agar pertanyaan umum dapat dijawab oleh model AI daring, lengkapi `aiPublicToken` dan URL Web App pada `app-config.js`, lalu simpan API key hanya di Google Apps Script.",
      mode: "offline",
    };
  }

  function jsonp(params, timeout = 45000) {
    return new Promise((resolve, reject) => {
      const callback = `paibpAiCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const timer = window.setTimeout(() => finish(new Error("Waktu respons AI habis.")), timeout);
      const finish = (error, payload) => {
        window.clearTimeout(timer);
        try { delete window[callback]; } catch { window[callback] = undefined; }
        script.remove();
        error ? reject(error) : resolve(payload);
      };
      window[callback] = (payload) => finish(null, payload);
      const url = new URL(ENDPOINT);
      Object.entries({ ...params, callback }).forEach(([key, value]) => url.searchParams.set(key, String(value ?? "")));
      script.src = url.href;
      script.async = true;
      script.onerror = () => finish(new Error("Layanan AI tidak dapat dihubungi."));
      document.head.append(script);
    });
  }

  async function remoteAnswer(prompt, history) {
    const compactHistory = history.slice(-6).map((item) => ({ role: item.role, text: truncate(item.text, 420) }));
    const payload = await jsonp({
      action: "aiChat",
      prompt: truncate(prompt, 1800),
      context: portalContext(prompt),
      history: JSON.stringify(compactHistory),
      sessionId: getSessionId(),
      aiToken: AI_TOKEN,
      role: document.body?.dataset.portalRole || "umum",
      page: location.pathname,
      origin: location.origin,
    });
    if (!payload?.ok) throw new Error(payload?.error || "Layanan AI belum siap.");
    return {
      text: String(payload.answer || "Jawaban belum tersedia."),
      mode: payload.mode || "online",
      model: payload.model || "AI daring",
      sources: Array.isArray(payload.sources) ? payload.sources : [],
    };
  }

  function enhanceRoot(root) {
    if (!root || root.dataset.aiV44 === "yes") return;
    root.dataset.aiV44 = "yes";

    const oldForm = $("[data-ai-form], #spensus-ai-form", root);
    const oldInput = $("[data-ai-input], #spensus-ai-input", root);
    const oldMessages = $("[data-ai-messages], #spensus-ai-messages", root);
    if (!oldForm || !oldInput || !oldMessages) return;

    // Mengganti node untuk membuang listener chatbot lama tanpa mengubah struktur halaman.
    const form = oldForm.cloneNode(true);
    const input = $("[data-ai-input], #spensus-ai-input", form);
    oldForm.replaceWith(form);
    const messages = oldMessages.cloneNode(false);
    oldMessages.replaceWith(messages);

    root.classList.add("spensus-ai-v44");
    const header = $(".ai-drawer-head-v27, .spensus-ai-head", root);
    if (header && !$(".v44-ai-status", header)) {
      const status = document.createElement("div");
      status.className = "v44-ai-status";
      status.innerHTML = `<span></span><div><strong>Spensus AI Premium</strong><small>${REMOTE_READY ? "AI daring + konteks portal" : "Mode luring berbasis portal"}</small></div>`;
      header.querySelector(".ai-drawer-brand-v27")?.replaceWith(status) || header.prepend(status);
    }

    let tools = $(".v44-ai-tools", root);
    if (!tools) {
      tools = document.createElement("div");
      tools.className = "v44-ai-tools";
      tools.innerHTML = `<button type="button" data-v44-new-chat>＋ Percakapan baru</button><button type="button" data-v44-voice>🎙 Dikte</button><button type="button" data-v44-read>🔊 Bacakan</button><span>${REMOTE_READY ? "Daring" : "Luring"}</span>`;
      messages.insertAdjacentElement("beforebegin", tools);
    }

    let busy = false;
    let lastAnswer = "";
    let history = loadHistory();

    function addMessage(role, text, options = {}) {
      const article = document.createElement("article");
      article.className = `ai-message-v26 ${role} v44-ai-message`;
      const sources = (options.sources || []).slice(0, 5);
      article.innerHTML = `
        <span class="ai-message-avatar">${role === "user" ? "Anda" : "AI"}</span>
        <div class="ai-message-bubble">
          <div class="v44-ai-content">${role === "user" ? `<p>${escapeHtml(text)}</p>` : markdownToHtml(text)}</div>
          ${sources.length ? `<div class="v44-ai-sources"><strong>Sumber daring</strong>${sources.map((source) => `<a href="${escapeHtml(source.url || "#")}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title || source.url || "Sumber")}</a>`).join("")}</div>` : ""}
          ${options.actions?.length ? `<div class="ai-message-actions">${options.actions.map((action) => `<button type="button" data-v44-action="${escapeHtml(action.type)}" data-v44-value="${escapeHtml(action.value || "")}">${escapeHtml(action.label)}</button>`).join("")}</div>` : ""}
          ${role === "assistant" ? `<div class="v44-ai-meta"><span>${escapeHtml(options.model || (options.mode === "online" ? "AI daring" : "Portal luring"))}</span><button type="button" data-v44-copy>Salin jawaban</button></div>` : ""}
        </div>`;
      messages.append(article);
      messages.scrollTop = messages.scrollHeight;
      return article;
    }

    function resetChat() {
      history = [];
      saveHistory(history);
      messages.innerHTML = "";
      addMessage("assistant", "Assalamu'alaikum. Saya **Spensus AI**, asisten pribadi PAIBP SMART SMP. Tanyakan isi materi, minta penjelasan, rencana belajar, latihan, bantuan menulis, atau pertanyaan umum.", { mode: REMOTE_READY ? "online" : "offline" });
    }

    async function ask(raw) {
      const prompt = String(raw || "").trim();
      if (!prompt || busy) return;
      busy = true;
      input.value = "";
      input.style.height = "auto";
      addMessage("user", prompt);
      history.push({ role: "user", text: prompt });
      const thinking = addMessage("assistant", "Menelaah pertanyaan dan mencocokkannya dengan konteks portal…", { mode: "thinking" });
      thinking.classList.add("is-thinking");
      form.classList.add("is-busy");
      try {
        let answer;
        if (REMOTE_READY && navigator.onLine) {
          try { answer = await remoteAnswer(prompt, history); }
          catch (error) {
            answer = localAnswer(prompt);
            answer.text += `\n\nCatatan: ${error.message}`;
          }
        } else answer = localAnswer(prompt);
        thinking.remove();
        lastAnswer = answer.text;
        addMessage("assistant", answer.text, answer);
        history.push({ role: "assistant", text: answer.text });
        saveHistory(history);
      } finally {
        busy = false;
        form.classList.remove("is-busy");
        input.focus({ preventScroll: true });
      }
    }

    form.addEventListener("submit", (event) => { event.preventDefault(); ask(input.value); });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
    });

    root.addEventListener("click", async (event) => {
      const action = event.target.closest("[data-v44-action]");
      if (action) {
        if (action.dataset.v44Action === "chapter") {
          document.querySelector('[data-open-panel="student"]')?.click();
          setTimeout(() => document.querySelector(`[data-chapter="${CSS.escape(action.dataset.v44Value)}"]`)?.click(), 450);
        }
        return;
      }
      if (event.target.closest("[data-v44-new-chat]")) resetChat();
      if (event.target.closest("[data-v44-copy]")) {
        const text = event.target.closest(".ai-message-bubble")?.querySelector(".v44-ai-content")?.innerText || "";
        try { await navigator.clipboard.writeText(text); event.target.textContent = "✓ Tersalin"; }
        catch { event.target.textContent = "Gagal menyalin"; }
      }
      if (event.target.closest("[data-v44-read]") && lastAnswer && "speechSynthesis" in window) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lastAnswer);
        utterance.lang = "id-ID";
        speechSynthesis.speak(utterance);
      }
      if (event.target.closest("[data-v44-voice]")) {
        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Recognition) { input.placeholder = "Dikte suara belum didukung browser ini."; return; }
        const recognition = new Recognition();
        recognition.lang = "id-ID";
        recognition.interimResults = false;
        recognition.onresult = (result) => { input.value = result.results[0][0].transcript; input.focus(); };
        recognition.start();
      }
    });

    $$("[data-ai-prompt]", root).forEach((button) => {
      const clone = button.cloneNode(true);
      button.replaceWith(clone);
      clone.addEventListener("click", () => ask(clone.dataset.aiPrompt));
    });

    messages.innerHTML = "";
    if (history.length) history.forEach((item) => addMessage(item.role, item.text, { mode: item.role === "assistant" ? (REMOTE_READY ? "online" : "offline") : "" }));
    else resetChat();
  }

  function initialize() {
    $$(".spensus-ai-instance").forEach(enhanceRoot);
    new MutationObserver(() => $$(".spensus-ai-instance").forEach(enhanceRoot))
      .observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();

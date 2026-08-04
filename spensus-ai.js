(() => {
  "use strict";
  const VERSION = "49";
  const CONFIG = window.PAIBP_CONFIG || {};
  const ENDPOINT = String(CONFIG.aiEndpoint || CONFIG.syncEndpoint || "").trim();
  const READ_KEY = String(CONFIG.syncReadKey || "").trim();
  const TOKEN = String(CONFIG.aiPublicToken || "").trim();
  const ENDPOINT_READY = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/i.test(ENDPOINT) && Boolean(TOKEN);
  const HISTORY_KEY = "paibp-smart-ai-history-v49";
  const SESSION_KEY = "paibp-smart-ai-session-v49";
  const MAX_HISTORY = 16;
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]);
  const parse = (value, fallback) => { try { return JSON.parse(value); } catch { return fallback; } };
  const truncate = (value, limit) => String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
  const chapters = Array.isArray(window.PAIBP_DATA?.chapters) ? window.PAIBP_DATA.chapters : [];
  let backend = { checked: false, aiConfigured: false, model: "", error: "" };

  function sessionId() {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) { id = `spai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`; sessionStorage.setItem(SESSION_KEY, id); }
    return id;
  }
  function loadHistory() { const value = parse(sessionStorage.getItem(HISTORY_KEY), []); return Array.isArray(value) ? value.slice(-MAX_HISTORY) : []; }
  function saveHistory(value) { try { sessionStorage.setItem(HISTORY_KEY, JSON.stringify(value.slice(-MAX_HISTORY))); } catch {} }

  function markdown(text) {
    const safe = escapeHtml(text || "").replace(/\r\n/g, "\n").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
    const lines = safe.split("\n"); let html = ""; let list = "";
    const close = () => { if (list) { html += `</${list}>`; list = ""; } };
    for (const line of lines) {
      const value = line.trim();
      if (/^###\s+/.test(value)) { close(); html += `<h4>${value.replace(/^###\s+/, "")}</h4>`; continue; }
      if (/^##?\s+/.test(value)) { close(); html += `<h3>${value.replace(/^##?\s+/, "")}</h3>`; continue; }
      const bullet = /^[-*]\s+(.+)/.exec(value); if (bullet) { if (list !== "ul") { close(); list = "ul"; html += "<ul>"; } html += `<li>${bullet[1]}</li>`; continue; }
      const ordered = /^\d+[.)]\s+(.+)/.exec(value); if (ordered) { if (list !== "ol") { close(); list = "ol"; html += "<ol>"; } html += `<li>${ordered[1]}</li>`; continue; }
      close(); if (value) html += `<p>${value}</p>`;
    }
    close(); return html || "<p>Jawaban belum tersedia.</p>";
  }

  function jsonp(params, timeout = 60000) {
    return new Promise((resolve, reject) => {
      if (!ENDPOINT_READY) { reject(new Error("Endpoint Spensus AI belum dikonfigurasi.")); return; }
      const callback = `spensusV48_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const node = document.createElement("script"); let done = false;
      const finish = (error, payload) => { if (done) return; done = true; clearTimeout(timer); try { delete window[callback]; } catch {} node.remove(); error ? reject(error) : resolve(payload); };
      window[callback] = (payload) => finish(null, payload);
      const url = new URL(ENDPOINT);
      Object.entries({ ...params, callback }).forEach(([key, value]) => url.searchParams.set(key, String(value ?? "")));
      node.src = url.href; node.async = true; node.onerror = () => finish(new Error("Server Spensus AI tidak dapat dijangkau."));
      const timer = setTimeout(() => finish(new Error("Respons AI melewati batas waktu.")), timeout);
      document.head.append(node);
    });
  }

  async function checkBackend() {
    if (!ENDPOINT_READY) { backend = { checked: true, aiConfigured: false, model: "", error: "Endpoint belum lengkap." }; return backend; }
    try {
      const info = READ_KEY ? await jsonp({ action: "setupInfo", readKey: READ_KEY }, 12000) : await jsonp({ action: "health" }, 12000);
      backend = {
        checked: true,
        aiConfigured: Boolean(info?.aiConfigured),
        model: String(info?.geminiModel || info?.aiModel || info?.model || "gemini-3.5-flash"),
        error: "",
      };
    } catch (error) {
      backend = { checked: true, aiConfigured: false, model: "", error: error?.message || "Sambungan gagal." };
    }
    document.dispatchEvent(new CustomEvent("paibp-ai-status", { detail: backend }));
    return backend;
  }

  function portalContext(prompt) {
    const words = String(prompt || "").toLocaleLowerCase("id").split(/\W+/).filter((word) => word.length > 3);
    const matches = chapters.map((chapter) => {
      const text = [chapter.title, chapter.overview, chapter.grade, chapter.number, ...(chapter.objectives || []), ...(chapter.applications || [])].join(" ").toLocaleLowerCase("id");
      return { chapter, score: words.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0) };
    }).filter((item) => item.score).sort((a, b) => b.score - a.score).slice(0, 4).map((item) => item.chapter);
    const visible = truncate($(".workspace-panel:not([hidden])")?.innerText || "", 1500);
    const material = matches.map((chapter) => `Kelas ${chapter.grade} Bab ${chapter.number}: ${chapter.title}. ${chapter.overview || ""}`).join("\n");
    return truncate(`HALAMAN AKTIF:\n${visible}\n\nMATERI PORTAL RELEVAN:\n${material}`, 3200);
  }

  async function askRemote(prompt, history) {
    const compact = history.slice(-8).map((item) => ({ role: item.role, text: truncate(item.text, 650) }));
    const payload = await jsonp({
      action: "aiChat", prompt: truncate(prompt, 2200), context: portalContext(prompt),
      history: JSON.stringify(compact), sessionId: sessionId(), aiToken: TOKEN,
      role: document.body?.dataset.portalRole || "umum", page: location.pathname, origin: location.origin,
    });
    if (!payload?.ok) throw new Error(payload?.error || "Layanan AI belum siap.");
    const answer = String(payload.answer || "").trim();
    if (!answer) throw new Error("Gemini mengembalikan jawaban kosong. Coba pertanyaan yang lebih ringkas.");
    return { text: answer, model: payload.model || backend.model || "Google Gemini", sources: Array.isArray(payload.sources) ? payload.sources : [] };
  }

  function offlineAnswer(prompt) {
    const lower = String(prompt || "").toLocaleLowerCase("id");
    const relevant = chapters.filter((chapter) => lower.includes(String(chapter.title || "").toLocaleLowerCase("id").split(" ")[0])).slice(0, 3);
    if (relevant.length) return `Mode luring menemukan materi berikut:\n\n${relevant.map((chapter, index) => `${index + 1}. **Kelas ${chapter.grade} Bab ${chapter.number}: ${chapter.title}**\n${chapter.overview || ""}`).join("\n\n")}`;
    return "Spensus AI penuh belum aktif pada server. Mode luring hanya dapat mencari materi portal. Aktifkan Gemini API gratis di Google Apps Script agar saya dapat menjawab pertanyaan umum, menyusun proposal, membuat naskah, menganalisis, membantu coding, dan kebutuhan lainnya.";
  }

  function wordDownload(text) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Calibri,Arial,sans-serif;line-height:1.6;margin:2.5cm}h1,h2,h3{color:#0b5b4c}</style></head><body>${markdown(text)}</body></html>`;
    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `Spensus_AI_${new Date().toISOString().slice(0,10)}.doc`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function enhance(root) {
    if (!root || root.dataset.aiV48 === "yes") return;
    const oldForm = $("[data-ai-form],#spensus-ai-form", root);
    const oldMessages = $("[data-ai-messages],#spensus-ai-messages", root);
    if (!oldForm || !oldMessages) return;
    root.dataset.aiV48 = "yes"; root.classList.add("spensus-ai-v48");

    const form = oldForm.cloneNode(true); oldForm.replaceWith(form);
    const input = $("[data-ai-input],#spensus-ai-input", form);
    const messages = oldMessages.cloneNode(false); oldMessages.replaceWith(messages);
    let history = loadHistory(); let busy = false; let lastAnswer = "";

    const head = $(".ai-drawer-head-v27,.spensus-ai-head", root);
    let brand = $(".v48-ai-brand", head);
    if (!brand && head) {
      brand = document.createElement("div"); brand.className = "v48-ai-brand";
      brand.innerHTML = `<span>✦</span><div><strong>Spensus AI Premium</strong><small data-v48-ai-state>Memeriksa layanan AI…</small></div>`;
      $(".ai-drawer-brand-v27", head)?.replaceWith(brand) || head.prepend(brand);
    }

    const tools = document.createElement("div"); tools.className = "v48-ai-tools";
    tools.innerHTML = `<button type="button" data-v48-new>＋ Baru</button><button type="button" data-v48-voice>🎙 Dikte</button><button type="button" data-v48-read>🔊 Baca</button><button type="button" data-v48-word>▤ Word</button><span data-v48-mode>Memeriksa…</span>`;
    messages.insertAdjacentElement("beforebegin", tools);

    function updateStatus() {
      const state = $("[data-v48-ai-state]", root); const badge = $("[data-v48-mode]", root);
      if (backend.aiConfigured) {
        if (state) state.textContent = `${backend.model || "Google Gemini"} • pertanyaan umum + konteks portal`;
        if (badge) { badge.textContent = "AI aktif"; badge.dataset.tone = "online"; }
      } else {
        if (state) state.textContent = "API AI belum diaktifkan; pencarian portal tetap tersedia";
        if (badge) { badge.textContent = "Luring"; badge.dataset.tone = "offline"; }
      }
    }

    function add(role, text, options = {}) {
      const node = document.createElement("article"); node.className = `v48-ai-message ${role}`;
      node.innerHTML = `<span>${role === "user" ? "Anda" : "AI"}</span><div><section>${role === "user" ? `<p>${escapeHtml(text)}</p>` : markdown(text)}</section>${options.sources?.length ? `<aside><strong>Sumber</strong>${options.sources.slice(0,5).map((source) => `<a href="${escapeHtml(source.url || "#")}" target="_blank" rel="noopener">${escapeHtml(source.title || source.url || "Sumber")}</a>`).join("")}</aside>` : ""}${role === "assistant" ? `<footer><small>${escapeHtml(options.model || (backend.aiConfigured ? backend.model : "Portal luring"))}</small><button type="button" data-v48-copy>Salin</button></footer>` : ""}</div>`;
      messages.append(node); messages.scrollTop = messages.scrollHeight; return node;
    }

    function reset() {
      history = []; saveHistory(history); messages.innerHTML = "";
      add("assistant", "Assalamu'alaikum. Saya **Spensus AI**. Saat Gemini daring aktif, Anda dapat menanyakan apa saja yang aman dan wajar: materi, proposal, surat, modul, ide, analisis, rencana, kode, ringkasan, serta kebutuhan lainnya.", { model: backend.aiConfigured ? backend.model : "Portal luring" });
    }

    async function ask(value) {
      const prompt = String(value || "").trim(); if (!prompt || busy) return;
      busy = true; input.value = ""; add("user", prompt); history.push({ role: "user", text: prompt });
      const wait = add("assistant", "Sedang menyusun jawaban terbaik…", { model: "Memproses" }); wait.classList.add("thinking"); form.classList.add("busy");
      try {
        let answer;
        if (!backend.checked) await checkBackend();
        if (backend.aiConfigured && navigator.onLine) answer = await askRemote(prompt, history);
        else answer = { text: offlineAnswer(prompt), model: "Portal luring", sources: [] };
        wait.remove(); lastAnswer = answer.text; add("assistant", answer.text, answer);
        history.push({ role: "assistant", text: answer.text }); saveHistory(history);
      } catch (error) {
        wait.remove();
        const message = /Gemini API belum dikonfigurasi|Gemini API key|Gemini API belum/i.test(error?.message || "")
          ? "Gemini API belum diaktifkan pada Google Apps Script. Tempel Gemini API key dari Google AI Studio pada fungsi **aktifkanSpensusAI**, jalankan fungsi tersebut, lalu deploy Versi baru."
          : `Layanan AI gagal: ${error?.message || "kesalahan tidak diketahui"}`;
        lastAnswer = message; add("assistant", message, { model: "Perlu konfigurasi" });
      } finally { busy = false; form.classList.remove("busy"); input.focus(); }
    }

    form.addEventListener("submit", (event) => { event.preventDefault(); ask(input.value); });
    input?.addEventListener("input", () => { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 120)}px`; });
    $("[data-v48-new]", root)?.addEventListener("click", reset);
    $("[data-v48-read]", root)?.addEventListener("click", () => { if (!lastAnswer || !("speechSynthesis" in window)) return; speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(lastAnswer)); });
    $("[data-v48-word]", root)?.addEventListener("click", () => { if (lastAnswer) wordDownload(lastAnswer); });
    $("[data-v48-voice]", root)?.addEventListener("click", () => {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) return;
      const recognition = new Recognition(); recognition.lang = "id-ID"; recognition.interimResults = false;
      recognition.onresult = (event) => { input.value = event.results[0][0].transcript; input.focus(); };
      recognition.start();
    });
    messages.addEventListener("click", async (event) => {
      const copy = event.target.closest("[data-v48-copy]"); if (!copy) return;
      const text = copy.closest(".v48-ai-message")?.querySelector("section")?.innerText || "";
      try { await navigator.clipboard.writeText(text); copy.textContent = "Tersalin"; setTimeout(() => copy.textContent = "Salin", 1000); } catch {}
    });
    $$('[data-ai-prompt]', root).forEach((button) => button.addEventListener("click", () => ask(button.dataset.aiPrompt)));
    document.addEventListener("paibp-ai-status", updateStatus);
    checkBackend().then(() => { updateStatus(); if (!history.length) reset(); else { messages.innerHTML = ""; history.forEach((item) => add(item.role === "user" ? "user" : "assistant", item.text, { model: item.role === "assistant" ? backend.model : "" })); } });
  }

  function initialize() {
    const roots = $$(".spensus-ai-instance,#spensus-ai-drawer-v27"); roots.forEach(enhance);
    const observer = new MutationObserver((records) => {
      for (const record of records) for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches?.(".spensus-ai-instance,#spensus-ai-drawer-v27")) enhance(node);
        $$(".spensus-ai-instance,#spensus-ai-drawer-v27", node).forEach(enhance);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 20000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true }); else initialize();
})();

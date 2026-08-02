(() => {
  "use strict";
  const grid = document.querySelector("#literasi-book-grid");
  if (!grid) return;
  const queryInput = document.querySelector("#literasi-query");
  const languageSelect = document.querySelector("#literasi-language");
  const typeSelect = document.querySelector("#literasi-type");
  const countNode = document.querySelector("#literasi-result-count");
  const preview = document.querySelector("#book-preview");
  const previewBody = document.querySelector("#book-preview-body");
  const pageLabel = document.querySelector("#literasi-page-label");
  const previousButton = document.querySelector("#literasi-prev");
  const nextButton = document.querySelector("#literasi-next");
  const STATS_KEY = "spensus-literasi-stats-v1";
  const PAGE_SIZE = 18;
  let currentPage = 1;
  let currentResults = [];
  let totalFound = 0;

  const fallbackBooks = [
    {title:"Pride and Prejudice",author:"Jane Austen",year:1813,language:["eng"],cover:"https://covers.openlibrary.org/b/id/14399841-M.jpg",source:"Project Gutenberg",readUrl:"https://www.gutenberg.org/ebooks/1342",downloadUrl:"https://www.gutenberg.org/ebooks/1342.epub3.images",subjects:["Fiction","Classic"]},
    {title:"Alice's Adventures in Wonderland",author:"Lewis Carroll",year:1865,language:["eng"],cover:"https://covers.openlibrary.org/b/id/10527843-M.jpg",source:"Project Gutenberg",readUrl:"https://www.gutenberg.org/ebooks/11",downloadUrl:"https://www.gutenberg.org/ebooks/11.epub3.images",subjects:["Fiction","Children"]},
    {title:"The Adventures of Sherlock Holmes",author:"Arthur Conan Doyle",year:1892,language:["eng"],cover:"https://covers.openlibrary.org/b/id/8225261-M.jpg",source:"Project Gutenberg",readUrl:"https://www.gutenberg.org/ebooks/1661",downloadUrl:"https://www.gutenberg.org/ebooks/1661.epub3.images",subjects:["Fiction","Mystery"]},
    {title:"The Prince",author:"Niccolò Machiavelli",year:1532,language:["eng"],cover:"https://covers.openlibrary.org/b/id/12618481-M.jpg",source:"Project Gutenberg",readUrl:"https://www.gutenberg.org/ebooks/1232",downloadUrl:"https://www.gutenberg.org/ebooks/1232.epub3.images",subjects:["Nonfiction","Politics"]},
    {title:"The Republic",author:"Plato",year:-375,language:["eng"],cover:"https://covers.openlibrary.org/b/id/14608101-M.jpg",source:"Project Gutenberg",readUrl:"https://www.gutenberg.org/ebooks/1497",downloadUrl:"https://www.gutenberg.org/ebooks/1497.epub3.images",subjects:["Nonfiction","Philosophy"]},
    {title:"The Metamorphosis",author:"Franz Kafka",year:1915,language:["eng"],cover:"https://covers.openlibrary.org/b/id/8231856-M.jpg",source:"Project Gutenberg",readUrl:"https://www.gutenberg.org/ebooks/5200",downloadUrl:"https://www.gutenberg.org/ebooks/5200.epub3.images",subjects:["Fiction","Literature"]}
  ];

  function readStats() {
    try { return {...{visits:0,searches:0,previews:0,reads:0,downloads:0,borrows:0}, ...JSON.parse(localStorage.getItem(STATS_KEY) || "{}")}; }
    catch { return {visits:0,searches:0,previews:0,reads:0,downloads:0,borrows:0}; }
  }
  function writeStats(stats) { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); renderStats(stats); }
  function increment(name) { const stats=readStats(); stats[name]=(Number(stats[name])||0)+1; writeStats(stats); }
  function renderStats(stats=readStats()) {
    Object.entries(stats).forEach(([key,value]) => document.querySelectorAll(`[data-lit-stat="${key}"]`).forEach((el)=>el.textContent=Number(value).toLocaleString("id-ID")));
  }
  const sessionKey = "spensus-literasi-visited-session";
  if (!sessionStorage.getItem(sessionKey)) { sessionStorage.setItem(sessionKey,"1"); increment("visits"); } else renderStats();

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g,(m)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
  function normalizeBook(doc) {
    const ia = Array.isArray(doc.ia) ? doc.ia[0] : "";
    const key = doc.key || "";
    const workUrl = key ? `https://openlibrary.org${key}` : "https://openlibrary.org/";
    return {
      title: doc.title || "Tanpa judul",
      author: Array.isArray(doc.author_name) ? doc.author_name.join(", ") : (doc.author || "Penulis tidak tercantum"),
      year: doc.first_publish_year || doc.year || "—",
      language: Array.isArray(doc.language) ? doc.language.slice(0,6) : (doc.language || []),
      cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : (doc.cover || ""),
      source: doc.source || "Open Library",
      readUrl: ia ? `https://archive.org/details/${encodeURIComponent(ia)}` : (doc.readUrl || workUrl),
      downloadUrl: doc.downloadUrl || (ia ? `https://archive.org/details/${encodeURIComponent(ia)}` : workUrl),
      previewUrl: workUrl,
      subjects: Array.isArray(doc.subject) ? doc.subject.slice(0,4) : (doc.subjects || []),
      publicAccess: doc.public_scan_b === true || doc.ebook_access === "public" || Boolean(doc.downloadUrl),
    };
  }
  function yearText(value) { return Number(value) < 0 ? `${Math.abs(Number(value))} SM` : value; }
  function cardHtml(book,index) {
    const langs=(book.language||[]).slice(0,2).join(", ").toUpperCase() || "MULTI";
    const tags=(book.subjects||[]).slice(0,2).map((s)=>`<span>${esc(s)}</span>`).join("");
    return `<article class="book-card">
      <div class="book-cover">${book.cover?`<img src="${esc(book.cover)}" alt="Sampul ${esc(book.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><div class="book-cover-fallback" hidden>📖</div>`:`<div class="book-cover-fallback">📖</div>`}<span class="book-badge">${esc(book.source)}</span></div>
      <div class="book-body"><h3>${esc(book.title)}</h3><div class="book-author">${esc(book.author)}</div><div class="book-meta"><span>${esc(yearText(book.year))}</span><span>${esc(langs)}</span>${tags}</div>
      <div class="book-actions"><button type="button" data-book-preview="${index}">Pratinjau</button><a href="${esc(book.readUrl)}" target="_blank" rel="noopener" data-book-read="${index}">Baca online</a><a class="download" href="${esc(book.downloadUrl)}" target="_blank" rel="noopener" data-book-download="${index}">Unduh / sumber resmi</a></div></div>
    </article>`;
  }
  function renderBooks(books, message="") {
    currentResults=books;
    if (!books.length) { grid.innerHTML=`<div class="literasi-empty"><strong>Tidak ada buku terbuka yang ditemukan.</strong><p>Coba kata kunci atau bahasa lain.</p></div>`; return; }
    grid.innerHTML=books.map(cardHtml).join("");
    if (countNode) countNode.textContent=message || `${books.length} buku terbuka ditampilkan`;
  }
  function renderLoading() { grid.innerHTML='<div class="literasi-loading"><span></span><p>Menelusuri katalog terbuka global…</p></div>'; }

  function buildQuery() {
    const raw=queryInput.value.trim() || "education";
    const type=typeSelect.value;
    const lang=languageSelect.value;
    const pieces=[raw,"ebook_access:public"];
    if(type==="fiction") pieces.push("subject:fiction");
    if(type==="nonfiction") pieces.push("-subject:fiction");
    if(lang) pieces.push(`language:${lang}`);
    return pieces.join(" ");
  }
  async function searchBooks(resetPage=false) {
    if(resetPage) currentPage=1;
    renderLoading(); increment("searches");
    const q=buildQuery();
    const fields="key,title,author_name,first_publish_year,cover_i,language,ebook_access,public_scan_b,ia,subject";
    const endpoint=`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&limit=${PAGE_SIZE}&page=${currentPage}`;
    try {
      const response=await fetch(endpoint,{headers:{Accept:"application/json"}});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      totalFound=Number(data.numFound||0);
      const books=(data.docs||[]).map(normalizeBook).filter((b)=>b.publicAccess);
      renderBooks(books,`${totalFound.toLocaleString("id-ID")} rekaman ditemukan • halaman ${currentPage}`);
    } catch (error) {
      totalFound=fallbackBooks.length;
      renderBooks(fallbackBooks.map(normalizeBook),"Katalog contoh luring ditampilkan; pencarian global sedang tidak terhubung.");
    }
    previousButton.disabled=currentPage<=1;
    nextButton.disabled=currentPage*PAGE_SIZE>=totalFound;
    pageLabel.textContent=`Halaman ${currentPage}`;
  }

  function openPreview(book) {
    increment("previews");
    previewBody.innerHTML=`<div class="book-preview-grid"><div class="book-preview-cover">${book.cover?`<img src="${esc(book.cover)}" alt="Sampul ${esc(book.title)}" referrerpolicy="no-referrer">`:'<div class="book-cover-fallback">📖</div>'}</div><div class="book-preview-copy"><span class="literasi-eyebrow">${esc(book.source)}</span><h2>${esc(book.title)}</h2><p><strong>${esc(book.author)}</strong> • ${esc(yearText(book.year))}</p><p>Buku ini ditampilkan melalui katalog federasi. Hak baca dan unduh mengikuti status domain publik atau lisensi terbuka pada penyedia asal. PAIBP SMART SMP tidak menyimpan salinan buku pada server.</p><div class="book-meta">${(book.subjects||[]).map((s)=>`<span>${esc(s)}</span>`).join("")}</div><div class="book-preview-actions"><a href="${esc(book.readUrl)}" target="_blank" rel="noopener" data-preview-read>Baca utuh di sumber</a><a class="secondary" href="${esc(book.downloadUrl)}" target="_blank" rel="noopener" data-preview-download>Unduh / buka sumber</a></div></div></div>`;
    preview.hidden=false;
  }
  function closePreview(){preview.hidden=true;previewBody.innerHTML="";}

  document.querySelector("#literasi-search-form")?.addEventListener("submit",(e)=>{e.preventDefault();searchBooks(true);});
  document.querySelectorAll("[data-lit-query]").forEach((button)=>button.addEventListener("click",()=>{queryInput.value=button.dataset.litQuery;typeSelect.value=button.dataset.litType||"all";searchBooks(true);}));
  previousButton.addEventListener("click",()=>{if(currentPage>1){currentPage--;searchBooks(false);}});
  nextButton.addEventListener("click",()=>{currentPage++;searchBooks(false);});
  grid.addEventListener("click",(event)=>{
    const p=event.target.closest("[data-book-preview]"); if(p){openPreview(currentResults[Number(p.dataset.bookPreview)]);return;}
    if(event.target.closest("[data-book-read]")) increment("reads");
    if(event.target.closest("[data-book-download]")) increment("downloads");
  });
  document.querySelectorAll("[data-literasi-borrow]").forEach((link)=>link.addEventListener("click",()=>increment("borrows")));
  preview.addEventListener("click",(event)=>{
    if(event.target===preview||event.target.closest("[data-preview-close]")) closePreview();
    if(event.target.closest("[data-preview-read]")) increment("reads");
    if(event.target.closest("[data-preview-download]")) increment("downloads");
  });
  document.addEventListener("keydown",(event)=>{if(event.key==="Escape"&&!preview.hidden)closePreview();});
  searchBooks(true);
})();

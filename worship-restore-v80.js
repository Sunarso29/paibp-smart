(() => {
  "use strict";

  const BUILD = "80";
  const STORE = "paibp-smart-worship-progress-v80";
  const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
  const $$ = (selector, root = document) => [...(root?.querySelectorAll?.(selector) || [])];
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  })[c]);

  const MODULES = [
    {
      id:"wudhu", title:"Wudhu", kicker:"BERSUCI", color:"#168bd2", icon:"💧",
      summary:"Visual urutan wudhu dari niat, membasuh anggota wudhu, sampai doa.",
      steps:[
        ["Niat dan basmalah","Berniat wudhu karena Allah Subhanahu Wata'ala di dalam hati, kemudian membaca basmalah."],
        ["Telapak tangan","Membasuh kedua telapak tangan dan membersihkan sela-sela jari."],
        ["Berkumur dan hidung","Berkumur dan membersihkan hidung dengan air secara wajar."],
        ["Membasuh wajah","Membasuh seluruh wajah secara merata."],
        ["Tangan hingga siku","Membasuh tangan kanan kemudian kiri sampai siku."],
        ["Mengusap kepala dan telinga","Mengusap kepala lalu kedua telinga secara tertib."],
        ["Kaki hingga mata kaki","Membasuh kaki kanan kemudian kiri termasuk sela jari dan mata kaki."],
        ["Tertib dan doa","Menjaga urutan, hemat air, kemudian membaca doa setelah wudhu."]
      ]
    },
    {
      id:"tayamum", title:"Tayamum", kicker:"BERSUCI DARURAT", color:"#a8713f", icon:"🖐️",
      summary:"Visual tayamum ketika air tidak tersedia atau tidak dapat digunakan sesuai ketentuan.",
      steps:[
        ["Pastikan sebab","Pastikan terdapat sebab yang membolehkan tayamum sesuai ketentuan yang dipelajari."],
        ["Niat","Berniat tayamum untuk bersuci agar dapat melaksanakan ibadah."],
        ["Media yang suci","Gunakan debu atau permukaan berdebu yang suci sesuai tuntunan."],
        ["Usap wajah","Usapkan kedua telapak tangan pada wajah secara merata."],
        ["Usap kedua tangan","Usap kedua tangan secara tertib sesuai tuntunan yang dipelajari."]
      ]
    },
    {
      id:"sholat-munfarid", title:"Sholat Munfarid", kicker:"SHOLAT", color:"#08745e", icon:"🕌",
      summary:"Gerakan sholat sendiri secara runtut dengan penekanan tuma'ninah.",
      steps:[
        ["Niat dan takbiratul ihram","Berdiri menghadap kiblat, berniat, lalu takbiratul ihram."],
        ["Qiyam dan bacaan","Berdiri membaca Al Fatihah dan bacaan yang disyariatkan."],
        ["Rukuk","Rukuk dengan posisi tenang dan tuma'ninah."],
        ["I'tidal","Bangkit dari rukuk hingga berdiri tegak dan tenang."],
        ["Sujud","Sujud dengan tuma'ninah, duduk di antara dua sujud, lalu sujud kembali."],
        ["Tasyahud","Duduk tasyahud sesuai jumlah rakaat sholat."],
        ["Salam","Mengakhiri sholat dengan salam secara tertib."]
      ]
    },
    {
      id:"sholat-berjamaah", title:"Sholat Berjamaah", kicker:"SHOLAT BERJAMAAH", color:"#178a79", icon:"👥",
      summary:"Visual posisi imam, makmum, shaf, dan cara mengikuti imam.",
      steps:[
        ["Siapkan shaf","Luruskan dan rapatkan shaf dengan tertib."],
        ["Posisi imam dan makmum","Imam berada di depan dan makmum mengikuti di belakang sesuai ketentuan."],
        ["Takbir mengikuti imam","Makmum bertakbir setelah imam dan tidak mendahului gerakannya."],
        ["Ikuti setiap gerakan","Rukuk, i'tidal, sujud, dan duduk dilakukan mengikuti imam."],
        ["Makmum masbuk","Makmum yang terlambat mengikuti imam lalu menyempurnakan rakaat yang kurang setelah imam salam."],
        ["Salam","Mengikuti penyelesaian sholat dengan tertib."]
      ]
    },
    {
      id:"puasa", title:"Puasa", kicker:"PUASA", color:"#d99818", icon:"🌙",
      summary:"Garis waktu ibadah puasa dari niat dan sahur sampai berbuka dan evaluasi diri.",
      steps:[
        ["Niat","Berniat puasa sesuai jenis dan waktunya."],
        ["Sahur","Makan sahur secukupnya dan menjaga adab."],
        ["Mulai waktu puasa","Menahan diri dari hal-hal yang membatalkan sejak waktunya dimulai."],
        ["Menjaga akhlak","Menjaga lisan, perilaku, dan memperbanyak amal baik."],
        ["Berbuka","Berbuka ketika waktunya tiba dan menjaga adab berbuka."],
        ["Muhasabah","Mensyukuri ibadah dan memperbaiki kekurangan."]
      ]
    },
    {
      id:"zakat", title:"Zakat", kicker:"ZAKAT", color:"#7854c7", icon:"🤲",
      summary:"Visual mengenali jenis zakat, perhitungan, mustahik, dan penyalurannya.",
      steps:[
        ["Kenali jenis zakat","Bedakan zakat fitrah dan zakat mal beserta ketentuannya."],
        ["Periksa syarat","Periksa syarat, ukuran, nishab, dan haul bila berlaku."],
        ["Hitung kewajiban","Hitung jumlah yang harus ditunaikan secara benar."],
        ["Niat","Berniat menunaikan zakat karena Allah Subhanahu Wata'ala."],
        ["Salurkan","Serahkan melalui amil atau kepada mustahik yang berhak sesuai ketentuan."],
        ["Catat dan evaluasi","Pastikan jumlah serta penyaluran tercatat dengan tertib."]
      ]
    },
    {
      id:"haji-umroh", title:"Haji & Umroh", kicker:"MANASIK", color:"#d47d22", icon:"🕋",
      summary:"Peta visual miqat, ihram, thawaf, sa'i, tahallul, serta rangkaian pokok haji.",
      steps:[
        ["Miqat dan ihram","Bersiap dari miqat, berniat, memakai ihram sesuai ketentuan, dan menjaga larangan ihram."],
        ["Talbiyah","Memperbanyak talbiyah pada waktunya."],
        ["Thawaf","Mengelilingi Ka'bah tujuh putaran sesuai tuntunan."],
        ["Sa'i","Berjalan antara Shafa dan Marwah tujuh kali."],
        ["Wukuf untuk haji","Pada ibadah haji terdapat wukuf di Arafah pada waktunya."],
        ["Mabit dan jumrah","Rangkaian haji dilanjutkan dengan mabit dan melontar jumrah sesuai ketentuan."],
        ["Tahallul","Mencukur atau memotong rambut sesuai rangkaian ibadah."],
        ["Tertib manasik","Ikuti urutan sesuai jenis haji atau umroh serta arahan pembimbing resmi."]
      ]
    },
    {
      id:"kurban", title:"Kurban", kicker:"UDHIYAH", color:"#b55750", icon:"🐑",
      summary:"Visual persiapan hewan, waktu pelaksanaan, penyembelihan syar'i, dan pembagian daging.",
      steps:[
        ["Niat dan waktu","Berniat berkurban dan memastikan waktu pelaksanaan sesuai ketentuan."],
        ["Pilih hewan","Pastikan jenis, umur, kesehatan, dan kondisi hewan memenuhi syarat."],
        ["Persiapan yang ihsan","Perlakukan hewan dengan baik dan gunakan alat yang layak serta tajam."],
        ["Penyembelihan syar'i","Laksanakan penyembelihan oleh orang yang mampu sesuai tuntunan syariat dan ketentuan kesehatan."],
        ["Pengolahan higienis","Tangani daging dan lingkungan secara bersih dan aman."],
        ["Pembagian","Bagikan daging secara tertib dengan memperhatikan fakir miskin dan kemaslahatan."]
      ]
    },
    {
      id:"aqiqah", title:"Aqiqah", kicker:"AQIQAH", color:"#c94f78", icon:"👶",
      summary:"Visual persiapan aqiqah, penyembelihan, pemberian nama, mencukur rambut, dan berbagi makanan.",
      steps:[
        ["Niat dan persiapan","Keluarga berniat melaksanakan aqiqah sebagai bentuk syukur kepada Allah Subhanahu Wata'ala."],
        ["Periksa waktu dan kemampuan","Pelaksanaan disesuaikan dengan tuntunan, kondisi, dan kemampuan keluarga."],
        ["Pilih hewan yang layak","Pastikan hewan sehat dan memenuhi ketentuan yang dipelajari."],
        ["Penyembelihan syar'i","Penyembelihan dilakukan oleh orang yang mampu dengan cara yang baik, aman, dan sesuai tuntunan."],
        ["Pemberian nama dan mencukur rambut","Laksanakan rangkaian yang berkaitan dengan pemberian nama dan mencukur rambut bayi sesuai tuntunan."],
        ["Pengolahan dan berbagi","Olah makanan secara higienis lalu bagikan kepada keluarga, tetangga, dan pihak yang membutuhkan."],
        ["Doa dan syukur","Tutup rangkaian dengan doa, rasa syukur, dan harapan kebaikan bagi anak."]
      ]
    }
  ];

  function scene(kind, color, label) {
    const common = `viewBox="0 0 520 260" role="img" aria-label="Visual ${esc(label)}"`;
    const bg = `<defs><linearGradient id="g-${kind}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><rect x="2" y="2" width="516" height="256" rx="30" fill="url(#g-${kind})"/><circle cx="445" cy="52" r="58" fill="${color}" opacity=".08"/>`;
    let art = "";
    if (kind === "wudhu") art = `<path d="M125 54c-28 38-47 62-47 91a49 49 0 0 0 98 0c0-29-20-53-51-91Z" fill="#dff4ff" stroke="${color}" stroke-width="7"/><path d="M245 175c45-50 86-53 128-13M246 195c48-28 88-25 126-1" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round"/><path d="M225 160c18-10 30-8 43 7" fill="none" stroke="#8ecfea" stroke-width="9" stroke-linecap="round"/>`;
    else if (kind === "tayamum") art = `<path d="M80 195h365" stroke="#b88959" stroke-width="14" stroke-linecap="round"/><circle cx="150" cy="178" r="12" fill="#c99d70"/><circle cx="205" cy="185" r="8" fill="#c99d70"/><path d="M235 75v85m0-60-34-30m34 28 33-29m-33 60-46 38m46-38 45 38" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round"/>`;
    else if (kind.startsWith("sholat")) art = `<path d="M110 205h300" stroke="${color}" stroke-width="8" opacity=".35"/><circle cx="260" cy="70" r="25" fill="${color}" opacity=".82"/><path d="M260 98v58m0-42-42 40m42-39 45 35m-45 6-35 49m35-49 38 49" fill="none" stroke="${color}" stroke-width="16" stroke-linecap="round"/><path d="M185 210h150" stroke="#d8b867" stroke-width="6" stroke-linecap="round"/>`;
    else if (kind === "puasa") art = `<circle cx="205" cy="118" r="72" fill="#ffe69a"/><circle cx="239" cy="93" r="72" fill="#fffdf7"/><circle cx="360" cy="88" r="7" fill="${color}"/><circle cx="393" cy="125" r="5" fill="${color}"/><path d="M120 208h280" stroke="${color}" stroke-width="10" stroke-linecap="round"/><circle cx="142" cy="208" r="17" fill="#fff" stroke="${color}" stroke-width="6"/><circle cx="378" cy="208" r="17" fill="#fff" stroke="${color}" stroke-width="6"/>`;
    else if (kind === "zakat") art = `<rect x="165" y="86" width="190" height="125" rx="22" fill="#f0eaff" stroke="${color}" stroke-width="7"/><path d="M260 86v125M165 128h190" stroke="${color}" stroke-width="6"/><path d="M215 78c0-35 45-42 45 8 0-50 45-43 45-8" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/>`;
    else if (kind === "haji-umroh") art = `<rect x="185" y="65" width="150" height="150" fill="#242424" rx="4"/><path d="M185 105h150" stroke="#d9b64c" stroke-width="12"/><path d="M235 65v150" stroke="#333" stroke-width="3"/><ellipse cx="260" cy="218" rx="155" ry="24" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="16 12"/>`;
    else if (kind === "kurban") art = `<path d="M150 164c0-53 43-85 101-85 48 0 88 23 103 58l-34 17-9 58h-20l-14-47h-72l-14 47h-20l-8-48Z" fill="#f7e7e2" stroke="${color}" stroke-width="7"/><circle cx="350" cy="126" r="30" fill="#f7e7e2" stroke="${color}" stroke-width="7"/><path d="M365 101c22-18 36 0 25 17" fill="none" stroke="${color}" stroke-width="7"/>`;
    else if (kind === "aqiqah") art = `<path d="M90 168h175c0 45-34 70-87 70s-88-25-88-70Z" fill="#ffe8f0" stroke="${color}" stroke-width="7"/><path d="M108 165c10-55 45-82 105-82 27 0 47 8 62 23" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round"/><circle cx="182" cy="130" r="23" fill="#ffd6b7"/><path d="M315 172c0-42 34-68 78-68 37 0 67 18 79 47l-27 13-7 46h-16l-11-38h-56l-11 38h-16l-6-38Z" fill="#f7e7e2" stroke="${color}" stroke-width="6"/>`;
    else art = `<circle cx="220" cy="82" r="22" fill="${color}"/><circle cx="300" cy="82" r="22" fill="${color}" opacity=".75"/><path d="M220 108v74m0-42-43 35m43-35 42 35m38-67v74m0-42-42 35m42-35 43 35" fill="none" stroke="${color}" stroke-width="13" stroke-linecap="round"/><path d="M160 215h200" stroke="${color}" stroke-width="8" opacity=".3"/>`;
    return `<svg ${common}>${bg}${art}</svg>`;
  }

  function injectStyle() {
    if ($("#v80-worship-style")) return;
    const style = document.createElement("style");
    style.id = "v80-worship-style";
    style.textContent = `
      #v80-worship{display:grid;gap:18px;color:#153d35}
      .v80-worship-hero{position:relative;overflow:hidden;padding:26px;border-radius:28px;background:linear-gradient(135deg,#063f36,#08745e 52%,#176890);color:#fff;box-shadow:0 24px 60px rgba(3,57,48,.18)}
      .v80-worship-hero:after{content:"✦";position:absolute;right:24px;top:-36px;font-size:10rem;opacity:.08}.v80-worship-hero span{font-size:.7rem;font-weight:950;letter-spacing:.14em;color:#dfff9b}.v80-worship-hero h4{margin:8px 0;color:#fff;font-size:clamp(1.7rem,3vw,2.65rem)}.v80-worship-hero p{max-width:900px;margin:0;color:#e3f3ee;line-height:1.65}
      .v80-worship-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.v80-worship-card{min-width:0;border:1px solid rgba(8,116,94,.14);border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 10px 28px rgba(5,66,55,.07)}
      .v80-worship-card button{display:grid;grid-template-rows:126px auto;width:100%;height:100%;padding:0;border:0;background:#fff;text-align:left;cursor:pointer}.v80-worship-card button:hover{background:#f8fcfa}.v80-worship-card button[aria-pressed="true"]{box-shadow:inset 0 0 0 3px var(--v80-color)}
      .v80-card-visual{display:grid;place-items:center;padding:8px;background:linear-gradient(145deg,color-mix(in srgb,var(--v80-color) 10%,#fff),#fff)}.v80-card-visual svg{width:100%;height:118px}.v80-card-copy{display:grid;grid-template-columns:auto 1fr;gap:10px;padding:14px}.v80-card-icon{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:color-mix(in srgb,var(--v80-color) 14%,#fff);font-size:1.25rem}.v80-card-copy strong{display:block;color:#123f36}.v80-card-copy small{display:block;margin-top:4px;color:#657a74;line-height:1.45}
      .v80-worship-detail{padding:18px;border:1px solid rgba(8,116,94,.15);border-radius:24px;background:linear-gradient(145deg,#fff,#f6fbf9);box-shadow:0 14px 34px rgba(4,65,54,.07)}.v80-detail-head{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(280px,.85fr);gap:18px;align-items:center}.v80-detail-copy>span{font-size:.7rem;font-weight:950;letter-spacing:.12em;color:var(--v80-color)}.v80-detail-copy h4{margin:6px 0;color:#103f36;font-size:1.55rem}.v80-detail-copy p{margin:0;color:#5f756e;line-height:1.6}.v80-detail-visual svg{width:100%;height:auto;max-height:230px}
      .v80-progress{height:8px;margin:18px 0 14px;border-radius:999px;background:#e5efeb;overflow:hidden}.v80-progress span{display:block;height:100%;border-radius:inherit;background:var(--v80-color);transition:width .22s ease}.v80-step{display:grid;grid-template-columns:52px 1fr;gap:13px;align-items:start;padding:15px;border:1px solid #d8e6e1;border-radius:17px;background:#fff}.v80-step-num{display:grid;place-items:center;width:46px;height:46px;border-radius:15px;background:var(--v80-color);color:#fff;font-weight:950}.v80-step strong{display:block;color:#123f36;font-size:1rem}.v80-step p{margin:5px 0 0;color:#5d716b;line-height:1.58}.v80-step-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}.v80-step-actions button{min-height:42px;padding:9px 13px;border:1px solid #cee0da;border-radius:12px;background:#fff;color:#14483d;font-weight:850;cursor:pointer}.v80-step-actions button.primary{border-color:var(--v80-color);background:var(--v80-color);color:#fff}.v80-step-actions button:disabled{opacity:.4;cursor:not-allowed}.v80-step-count{margin-left:auto;display:flex;align-items:center;font-weight:900;color:#557068}
      .v80-worship-note{padding:12px 14px;border-radius:15px;background:#fff7d9;color:#69591d;font-size:.78rem;line-height:1.55}
      @media(max-width:920px){.v80-worship-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.v80-detail-head{grid-template-columns:1fr}.v80-detail-visual{order:-1}}
      @media(max-width:620px){.v80-worship-grid{grid-template-columns:1fr}.v80-worship-hero{padding:20px}.v80-worship-card button{grid-template-rows:110px auto}.v80-card-visual svg{height:104px}.v80-step{grid-template-columns:44px 1fr}.v80-step-num{width:40px;height:40px}.v80-step-count{width:100%;margin-left:0}.v80-step-actions button{flex:1 1 calc(50% - 8px)}}
    `;
    document.head.append(style);
  }

  function readProgress() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch { return {}; }
  }

  function saveProgress(moduleId, index) {
    const all = readProgress();
    all[moduleId] = index;
    try { localStorage.setItem(STORE, JSON.stringify(all)); } catch {}
  }

  function mount() {
    const page = $('[data-islamic-page="worship"]');
    if (!page) return false;
    injectStyle();
    if ($("#v80-worship", page)) return true;
    page.innerHTML = `
      <section id="v80-worship">
        <header class="v80-worship-hero">
          <span>SIMULASI IBADAH VISUAL • V80</span>
          <h4>Belajar ibadah melalui visual dan urutan praktik</h4>
          <p>Modul lengkap dikembalikan dalam satu ruang: wudhu, tayamum, sholat, puasa, zakat, haji & umroh, kurban, sampai aqiqah. Visual dibuat ringan agar tetap nyaman digunakan di HP.</p>
        </header>
        <div class="v80-worship-grid">
          ${MODULES.map((item) => `
            <article class="v80-worship-card" style="--v80-color:${item.color}">
              <button type="button" data-v80-module="${item.id}" aria-pressed="false">
                <span class="v80-card-visual">${scene(item.id,item.color,item.title)}</span>
                <span class="v80-card-copy"><i class="v80-card-icon">${item.icon}</i><span><strong>${esc(item.title)}</strong><small>${esc(item.summary)}</small></span></span>
              </button>
            </article>`).join("")}
        </div>
        <section class="v80-worship-detail" id="v80-worship-detail"></section>
        <div class="v80-worship-note">Simulasi ini adalah media pembelajaran. Untuk praktik ibadah nyata, ikuti tuntunan guru, pembimbing, ulama, dan ketentuan resmi yang relevan.</div>
      </section>`;

    const detail = $("#v80-worship-detail", page);
    let activeId = MODULES[0].id;
    let stepIndex = 0;

    function renderDetail(moduleId, requestedIndex = null) {
      const item = MODULES.find((entry) => entry.id === moduleId) || MODULES[0];
      activeId = item.id;
      const saved = readProgress();
      stepIndex = Math.max(0, Math.min(item.steps.length - 1, requestedIndex == null ? Number(saved[item.id] || 0) : Number(requestedIndex || 0)));
      $$("[data-v80-module]", page).forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.v80Module === item.id)));
      const [title, description] = item.steps[stepIndex];
      detail.style.setProperty("--v80-color", item.color);
      detail.innerHTML = `
        <div class="v80-detail-head">
          <div class="v80-detail-copy"><span>${esc(item.kicker)}</span><h4>${esc(item.title)}</h4><p>${esc(item.summary)}</p></div>
          <div class="v80-detail-visual">${scene(item.id,item.color,item.title)}</div>
        </div>
        <div class="v80-progress"><span style="width:${((stepIndex + 1) / item.steps.length) * 100}%"></span></div>
        <article class="v80-step">
          <span class="v80-step-num">${String(stepIndex + 1).padStart(2,"0")}</span>
          <div><strong>${esc(title)}</strong><p>${esc(description)}</p></div>
        </article>
        <div class="v80-step-actions">
          <button type="button" data-v80-prev ${stepIndex === 0 ? "disabled" : ""}>← Sebelumnya</button>
          <button type="button" class="primary" data-v80-understood>✓ Tandai dipahami</button>
          <button type="button" data-v80-next ${stepIndex === item.steps.length - 1 ? "disabled" : ""}>Berikutnya →</button>
          <span class="v80-step-count">${stepIndex + 1}/${item.steps.length}</span>
        </div>`;
      saveProgress(item.id, stepIndex);
      $("[data-v80-prev]", detail)?.addEventListener("click", () => renderDetail(activeId, stepIndex - 1));
      $("[data-v80-next]", detail)?.addEventListener("click", () => renderDetail(activeId, stepIndex + 1));
      $("[data-v80-understood]", detail)?.addEventListener("click", (event) => {
        event.currentTarget.textContent = "✓ Dipahami";
        if (stepIndex < item.steps.length - 1) setTimeout(() => renderDetail(activeId, stepIndex + 1), 450);
      });
    }

    $$("[data-v80-module]", page).forEach((button) => button.addEventListener("click", () => {
      renderDetail(button.dataset.v80Module, null);
      detail.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    renderDetail(activeId, null);
    document.documentElement.dataset.worshipSimulation = "complete-v80";
    return true;
  }

  function connect() {
    if (mount()) return;
    const observer = new MutationObserver(() => {
      if (mount()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 15000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", connect, { once:true });
  else connect();

  window.PAIBP_WORSHIP_V80 = Object.freeze({ mount, modules: MODULES.map(({id,title}) => ({id,title})), build: BUILD });
})();
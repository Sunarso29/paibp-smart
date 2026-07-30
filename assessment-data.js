(() => {
  "use strict";
  const chapters = window.PAIBP_DATA?.chapters || [];
  const byId = Object.fromEntries(chapters.map((chapter) => [chapter.id, chapter]));
  const letters = ["A", "B", "C", "D"];
  const clean = (value) => String(value || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const stableNumber = (value) => {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
  const rotate = (items, seed) => {
    const list = [...items];
    for (let index = list.length - 1; index > 0; index -= 1) {
      const target = stableNumber(`${seed}|${index}`) % (index + 1);
      [list[index], list[target]] = [list[target], list[index]];
    }
    return list;
  };
  const distractorPool = chapters.flatMap((chapter) => (chapter.concepts || []).map((item) => clean(item[0]))).filter(Boolean);
  const applicationPool = chapters.flatMap((chapter) => chapter.applications || []).map(clean).filter(Boolean);

  const verseBank = {
    "VII-1": { text: "يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ", label: "Al Qur'an Surat An-Nisa' ayat 59", tajwid: "Alif Lam Syamsiyah dan Alif Lam Qamariyah" },
    "VII-3": { text: "إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ", label: "Al Qur'an Surat Al-'Ankabut ayat 45", tajwid: "Mad thabi'i" },
    "VII-6": { text: "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ", label: "Al Qur'an Surat Ali 'Imran ayat 190", tajwid: "Alif Lam Syamsiyah" },
    "VII-8": { text: "إِنْ جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا", label: "Al Qur'an Surat Al-Hujurat ayat 6", tajwid: "Ikhfa haqiqi" },
    "VIII-1": { text: "ظَهَرَ الْفَسَادُ فِي الْبَرِّ وَالْبَحْرِ", label: "Al Qur'an Surat Ar-Rum ayat 41", tajwid: "Alif Lam Qamariyah" },
    "VIII-2": { text: "آمَنَ الرَّسُولُ بِمَا أُنْزِلَ إِلَيْهِ مِنْ رَبِّهِ", label: "Al Qur'an Surat Al-Baqarah ayat 285", tajwid: "Mad badal dan ikhfa" },
    "VIII-3": { text: "إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تُؤَدُّوا الْأَمَانَاتِ", label: "Al Qur'an Surat An-Nisa' ayat 58", tajwid: "Ghunnah musyaddadah" },
    "VIII-6": { text: "وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا", label: "Al Qur'an Surat Al-Baqarah ayat 143", tajwid: "Mad thabi'i" },
    "VIII-8": { text: "لَا إِكْرَاهَ فِي الدِّينِ", label: "Al Qur'an Surat Al-Baqarah ayat 256", tajwid: "Mad jaiz munfashil" },
    "VIII-9": { text: "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا", label: "Al Qur'an Surat Al-Baqarah ayat 275", tajwid: "Alif Lam Qamariyah" },
    "IX-1": { text: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنْكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ", label: "Al Qur'an Surat Al-Mujadilah ayat 11", tajwid: "Mad wajib muttashil" },
    "IX-2": { text: "فَمَنْ يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ", label: "Al Qur'an Surat Az-Zalzalah ayat 7", tajwid: "Idzhar halqi" },
    "IX-3": { text: "وَقُولُوا لِلنَّاسِ حُسْنًا", label: "Al Qur'an Surat Al-Baqarah ayat 83", tajwid: "Ghunnah" },
    "IX-6": { text: "هُوَ أَنْشَأَكُمْ مِنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا", label: "Al Qur'an Surat Hud ayat 61", tajwid: "Ikhfa haqiqi" },
    "IX-7": { text: "إِنَّا كُلَّ شَيْءٍ خَلَقْنَاهُ بِقَدَرٍ", label: "Al Qur'an Surat Al-Qamar ayat 49", tajwid: "Ghunnah musyaddadah" },
    "IX-9": { text: "فَاسْأَلُوا أَهْلَ الذِّكْرِ إِنْ كُنْتُمْ لَا تَعْلَمُونَ", label: "Al Qur'an Surat An-Nahl ayat 43", tajwid: "Ikhfa haqiqi" },
  };

  const gradeVerseBank = {
    VII: { text: "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُمْ مِنْ ذَكَرٍ وَأُنْثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا", label: "Al Qur'an Surat Al-Hujurat ayat 13", tajwid: "Mad thabi'i dan ikhfa haqiqi" },
    VIII: { text: "وَكَذَٰلِكَ جَعَلْنَاكُمْ أُمَّةً وَسَطًا لِتَكُونُوا شُهَدَاءَ عَلَى النَّاسِ", label: "Al Qur'an Surat Al-Baqarah ayat 143", tajwid: "Mad thabi'i dan ghunnah" },
    IX: { text: "يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنْكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ", label: "Al Qur'an Surat Al-Mujadilah ayat 11", tajwid: "Mad wajib muttashil dan Alif Lam Syamsiyah" },
  };

  const specs = [
    { id: "VII-PTS-GASAL", grade: "VII", kind: "PTS", semester: "Gasal", title: "Penilaian Tengah Semester Gasal", chapters: ["VII-1","VII-2","VII-3"], mcq: 40, essays: 5 },
    { id: "VII-SAS-GASAL", grade: "VII", kind: "SAS", semester: "Gasal", title: "Sumatif Akhir Semester Gasal", chapters: ["VII-1","VII-2","VII-3","VII-4","VII-5"], mcq: 40, essays: 10 },
    { id: "VII-PTS-GENAP", grade: "VII", kind: "PTS", semester: "Genap", title: "Penilaian Tengah Semester Genap", chapters: ["VII-6","VII-7","VII-8"], mcq: 40, essays: 5 },
    { id: "VII-SAS-GENAP", grade: "VII", kind: "SAS", semester: "Genap", title: "Sumatif Akhir Semester Genap", chapters: ["VII-1","VII-2","VII-3","VII-4","VII-5","VII-6","VII-7","VII-8","VII-9","VII-10"], mcq: 40, essays: 10 },
    { id: "VIII-PTS-GASAL", grade: "VIII", kind: "PTS", semester: "Gasal", title: "Penilaian Tengah Semester Gasal", chapters: ["VIII-1","VIII-2","VIII-3"], mcq: 40, essays: 5 },
    { id: "VIII-SAS-GASAL", grade: "VIII", kind: "SAS", semester: "Gasal", title: "Sumatif Akhir Semester Gasal", chapters: ["VIII-1","VIII-2","VIII-3","VIII-4","VIII-5"], mcq: 40, essays: 10 },
    { id: "VIII-PTS-GENAP", grade: "VIII", kind: "PTS", semester: "Genap", title: "Penilaian Tengah Semester Genap", chapters: ["VIII-6","VIII-7","VIII-8"], mcq: 40, essays: 5 },
    { id: "VIII-SAS-GENAP", grade: "VIII", kind: "SAS", semester: "Genap", title: "Sumatif Akhir Semester Genap", chapters: ["VIII-1","VIII-2","VIII-3","VIII-4","VIII-5","VIII-6","VIII-7","VIII-8","VIII-9","VIII-10"], mcq: 40, essays: 10 },
    { id: "IX-PTS-GASAL", grade: "IX", kind: "PTS", semester: "Gasal", title: "Penilaian Tengah Semester Gasal", chapters: ["IX-1","IX-2","IX-3"], mcq: 40, essays: 5 },
    { id: "IX-SAS-GASAL", grade: "IX", kind: "SAS", semester: "Gasal", title: "Sumatif Akhir Semester Gasal", chapters: ["IX-1","IX-2","IX-3","IX-4","IX-5"], mcq: 40, essays: 10 },
    { id: "IX-PTS-GENAP", grade: "IX", kind: "PTS", semester: "Genap", title: "Penilaian Tengah Semester Genap", chapters: ["IX-6","IX-7","IX-8"], mcq: 40, essays: 5 },
    { id: "IX-UKLN", grade: "IX", kind: "UKLN", semester: "Genap", title: "Uji Kompetensi Literasi dan Numerasi", distribution: { VII: 8, VIII: 8, IX: 24 }, mcq: 40, essays: 10 },
  ];

  function optionsWithAnswer(correct, distractors, seed) {
    const candidates = [clean(correct), ...distractors.map(clean).filter((item) => item && item !== clean(correct))];
    const unique = [...new Set(candidates)].slice(0, 4);
    while (unique.length < 4) unique.push(`Pilihan pengalih ${unique.length + 1}`);
    const shuffled = rotate(unique, seed);
    return { options: shuffled, answer: shuffled.indexOf(clean(correct)) };
  }

  function chapterQuestion(chapter, pattern, index, seed) {
    const concepts = chapter.concepts || [];
    const concept = concepts[(index + pattern) % Math.max(1, concepts.length)] || [chapter.title, chapter.overview];
    const otherConcepts = rotate(distractorPool.filter((item) => item !== clean(concept[0])), `${seed}|concept`).slice(0, 3);
    const app = (chapter.applications || [])[index % Math.max(1, (chapter.applications || []).length)] || `menerapkan nilai ${chapter.title} secara bertanggung jawab`;
    const verse = verseBank[chapter.id] || gradeVerseBank[chapter.grade];
    const ref = (chapter.references || [])[index % Math.max(1, (chapter.references || []).length)] || `Materi Bab ${chapter.number}`;
    const numberBase = 20 + (stableNumber(`${seed}|n`) % 21);
    const achieved = Math.max(1, Math.round(numberBase * (60 + (stableNumber(`${seed}|p`) % 31)) / 100));
    const percent = Math.round((achieved / numberBase) * 100);
    let stem, correct, distractors, stimulus = "", literacy = true, numeracy = false, tajwid = false;
    switch (pattern % 10) {
      case 0:
        stimulus = `Cermati uraian berikut. “${clean(concept[1])}”`;
        stem = "Konsep yang paling tepat untuk menjelaskan uraian tersebut adalah …";
        correct = concept[0]; distractors = otherConcepts; break;
      case 1:
        stimulus = `Dalam kegiatan kelas, guru meminta murid menunjukkan penerapan materi “${clean(chapter.title)}” pada situasi nyata.`;
        stem = "Tindakan yang paling sesuai adalah …";
        correct = app;
        distractors = rotate(applicationPool.filter((item) => item !== clean(app)), `${seed}|app`).slice(0,3); break;
      case 2:
        stimulus = `Bacalah paragraf berikut. ${clean(chapter.overview)}`;
        stem = "Simpulan yang paling logis berdasarkan paragraf tersebut adalah …";
        correct = clean(concept[1]);
        distractors = ["Ajaran cukup diketahui tanpa diamalkan.", "Setiap keputusan boleh dibuat tanpa sumber yang dapat dipercaya.", "Nilai agama hanya berlaku di ruang ibadah."]; break;
      case 3:
        if (verse) {
          stimulus = `<span class="exam-arabic" lang="ar" dir="rtl">${verse.text}</span><small>${verse.label}</small>`;
          stem = "Sikap literasi Al Qur'an yang paling tepat ketika menggunakan potongan ayat tersebut adalah …";
          correct = "membaca ayat secara utuh, memeriksa terjemah dan penjelasan tepercaya, lalu menghubungkannya dengan tindakan";
          distractors = ["memotong sebagian ayat agar sesuai pendapat pribadi", "menyebarkan potongan ayat tanpa memeriksa konteks", "menganggap satu potongan ayat cukup untuk semua persoalan"];
        } else {
          stimulus = `Sumber yang dipelajari pada bab ini antara lain ${clean(ref)}.`;
          stem = "Cara menggunakan sumber tersebut secara bertanggung jawab adalah …";
          correct = "membaca konteks, memeriksa penjelasan tepercaya, lalu menghubungkannya dengan tindakan";
          distractors = ["memotong sebagian teks agar sesuai pendapat pribadi", "menyebarkan kutipan tanpa memeriksa sumber", "menganggap semua tafsir sama tanpa dasar"];
        } break;
      case 4:
        stimulus = `Sebuah kelompok beranggotakan ${numberBase} murid. Sebanyak ${achieved} murid berhasil menyelesaikan proyek terkait “${clean(chapter.title)}” sesuai rubrik.`;
        stem = "Persentase murid yang berhasil, dibulatkan ke bilangan bulat terdekat, adalah …";
        correct = `${percent}%`;
        distractors = [`${Math.max(0,100-percent)}%`, `${Math.min(100,percent+10)}%`, `${Math.max(0,percent-10)}%`]; numeracy = true; break;
      case 5:
        stimulus = `Perhatikan rencana kegiatan: (1) mengumpulkan data; (2) memeriksa sumber; (3) mendiskusikan dampak; (4) menyusun tindakan; (5) mengevaluasi hasil.`;
        stem = `Urutan tersebut paling tepat digunakan untuk mempelajari dan menerapkan materi “${clean(chapter.title)}” karena …`;
        correct = "menghubungkan literasi informasi, penalaran, tindakan, dan refleksi";
        distractors = ["mengutamakan kecepatan tanpa ketelitian", "menghindari kerja sama dan pemeriksaan", "menempatkan kesimpulan sebelum data"]; break;
      case 6:
        if (verse) {
          stimulus = `<span class="exam-arabic" lang="ar" dir="rtl">${verse.text}</span><small>${verse.label}</small>`;
          stem = "Pesan atau hubungan materi yang paling tepat dari potongan ayat tersebut adalah …";
          correct = clean(concept[1]);
          distractors = ["membenarkan tindakan tanpa tanggung jawab", "memisahkan iman dari perilaku", "mengabaikan hak dan kemaslahatan orang lain"];
        } else {
          stimulus = `Perhatikan salah satu tujuan pembelajaran: “${clean((chapter.objectives || [chapter.title])[index % Math.max(1,(chapter.objectives||[]).length)])}”.`;
          stem = "Bukti ketercapaian tujuan tersebut yang paling kuat adalah …";
          correct = app; distractors = rotate(applicationPool.filter((item)=>item!==clean(app)),`${seed}|obj`).slice(0,3);
        }
        break;
      case 7:
        if (verse) {
          stimulus = `<span class="exam-arabic" lang="ar" dir="rtl">${verse.text}</span>`;
          stem = "Kaidah tajwid yang perlu mendapat perhatian dalam latihan potongan ayat tersebut adalah …";
          correct = verse.tajwid; distractors = rotate(["Idgham mimi","Iqlab","Qalqalah kubra","Mad 'aridh lissukun","Ikhfa syafawi","Alif Lam Syamsiyah","Alif Lam Qamariyah"].filter(x=>x!==verse.tajwid),`${seed}|tajwid`).slice(0,3); tajwid = true;
        } else {
          stimulus = `Murid menemukan dua pendapat berbeda ketika membahas “${clean(chapter.title)}”.`;
          stem = "Langkah pertama yang paling tepat adalah …";
          correct = "memeriksa sumber, konteks, dan alasan setiap pendapat dengan adab";
          distractors = ["memilih pendapat yang paling ramai", "menyerang orang yang berbeda", "menghentikan diskusi tanpa klarifikasi"];
        }
        break;
      case 8:
        stimulus = `Dalam satu pekan, sebuah kelompok merencanakan 5 tindakan. Bobot keberhasilan tiap tindakan adalah 20 poin. Kelompok menyelesaikan 4 tindakan sesuai kriteria.`;
        stem = "Skor kelompok tersebut adalah …";
        correct = "80 poin"; distractors = ["20 poin","60 poin","100 poin"]; numeracy = true; break;
      default:
        if (verse) {
          stimulus = `<span class="exam-arabic" lang="ar" dir="rtl">${verse.text}</span><small>${verse.label}</small>`;
          stem = "Pasangan kaidah bacaan dan sikap belajar yang paling tepat adalah …";
          correct = `${verse.tajwid}; membaca tartil, menyimak koreksi, dan memperbaiki bacaan`;
          distractors = ["Qalqalah; membaca secepat mungkin tanpa koreksi", "Iqlab; mengabaikan makhraj karena cukup memahami arti", "Mad wajib; berhenti pada setiap kata tanpa memperhatikan makna"]; tajwid = true;
        } else {
          stimulus = `Seorang murid berkata, “Saya memahami materi ${clean(chapter.title)}, tetapi belum terlihat dalam kebiasaan saya.”`;
          stem = "Tanggapan reflektif yang paling tepat adalah …";
          correct = `memilih satu tindakan nyata, menjalankannya secara konsisten, dan mengevaluasi dampaknya`;
          distractors = ["menunggu sampai semua orang berubah", "cukup menghafal istilah tanpa praktik", "menghindari umpan balik agar tidak dikritik"];
        } break;
    }
    const shaped = optionsWithAnswer(correct, distractors, `${seed}|shuffle`);
    return { id: `${chapter.id}-${pattern}-${index}`, chapterId: chapter.id, chapterTitle: chapter.title, stimulus, stem, options: shaped.options, answer: shaped.answer, literacy, numeracy, tajwid };
  }

  function chapterAllocation(chapterIds, total) {
    const base = Math.floor(total / chapterIds.length);
    let remainder = total % chapterIds.length;
    return chapterIds.map((id) => ({ id, count: base + (remainder-- > 0 ? 1 : 0) }));
  }

  function buildExam(examId, seed = "nasional-2026") {
    const spec = specs.find((item) => item.id === examId) || specs[0];
    let allocation;
    if (spec.kind === "UKLN") {
      allocation = [];
      Object.entries(spec.distribution).forEach(([grade,count]) => {
        const ids = chapters.filter(c=>c.grade===grade).map(c=>c.id);
        const parts = chapterAllocation(ids,count);
        allocation.push(...parts);
      });
    } else allocation = chapterAllocation(spec.chapters, spec.mcq);
    const questions=[];
    allocation.forEach(({id,count}, groupIndex) => {
      const chapter=byId[id];
      for(let i=0;i<count;i+=1) questions.push(chapterQuestion(chapter,(i+groupIndex)%10,i,`${examId}|${seed}|${id}|${i}`));
    });
    const shuffled = rotate(questions, `${examId}|${seed}|exam`).slice(0,spec.mcq).map((q,i)=>({...q,number:i+1}));
    const essaySource = spec.kind === "UKLN"
      ? [...chapters.filter(c=>c.grade==="IX"), ...chapters.filter(c=>c.grade!=="IX")]
      : spec.chapters.map(id=>byId[id]);
    const essays=[];
    for(let i=0;i<spec.essays;i+=1){
      const chapter=essaySource[i%essaySource.length];
      const prompt=(chapter.questions||[])[i%Math.max(1,(chapter.questions||[]).length)] || `Analisislah penerapan ${chapter.title} dalam kehidupan.`;
      essays.push({number:i+1,chapterId:chapter.id,chapterTitle:chapter.title,prompt:`${clean(prompt)} Sertakan alasan, bukti dari materi, dan satu contoh tindakan nyata.`});
    }
    return { spec, questions: shuffled, essays, seed };
  }

  window.PAIBP_ASSESSMENT_BANK = Object.freeze({ specs, buildExam, letters });
})();

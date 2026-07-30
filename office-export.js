(() => {
  "use strict";

  const escapeXml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
  const slug = (value) => String(value || "dokumen").toLocaleLowerCase("id").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function assetToDataUrl(path) {
    try {
      const response = await fetch(new URL(path, document.baseURI).href, { cache: "force-cache" });
      if (!response.ok) return "";
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve("");
        reader.readAsDataURL(blob);
      });
    } catch {
      return "";
    }
  }

  async function logoData(config) {
    return config?.logoData || await assetToDataUrl("./logo-spensus.png");
  }

  function dataUrlParts(dataUrl) {
    const match = String(dataUrl || "").match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/i);
    if (!match) return null;
    const extension = match[1].toLowerCase() === "png" ? "png" : "jpeg";
    return { extension, base64: match[2] };
  }

  function columnName(number) {
    let value = number;
    let output = "";
    while (value > 0) {
      value -= 1;
      output = String.fromCharCode(65 + (value % 26)) + output;
      value = Math.floor(value / 26);
    }
    return output;
  }

  function inlineCell(ref, value, style = 0) {
    return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
  }

  async function exportXlsx({
    filename = "data.xlsx",
    sheetName = "Data",
    title = "Data",
    subtitle = "",
    rows = [],
    logo = "",
  } = {}) {
    if (typeof JSZip === "undefined") throw new Error("Pustaka Excel belum dimuat.");
    const safeRows = Array.isArray(rows) ? rows.map((row) => Array.isArray(row) ? row : [row]) : [];
    const columnCount = Math.max(1, ...safeRows.map((row) => row.length));
    const dataStartRow = 5;
    const sheetRows = [];
    const titleEndColumn = Math.max(2, columnCount);
    sheetRows.push(`<row r="1" ht="30" customHeight="1">${inlineCell("B1", title, 1)}</row>`);
    sheetRows.push(`<row r="2" ht="23" customHeight="1">${inlineCell("B2", subtitle, 2)}</row>`);
    safeRows.forEach((row, rowIndex) => {
      const excelRow = dataStartRow + rowIndex;
      const cells = row.map((cell, columnIndex) => inlineCell(`${columnName(columnIndex + 1)}${excelRow}`, cell, rowIndex === 0 ? 3 : 0)).join("");
      sheetRows.push(`<row r="${excelRow}"${rowIndex === 0 ? ' ht="28" customHeight="1"' : ""}>${cells}</row>`);
    });

    const widths = Array.from({ length: columnCount }, (_, columnIndex) => {
      const maxLength = Math.max(8, ...safeRows.slice(0, 200).map((row) => String(row[columnIndex] ?? "").length));
      return Math.min(columnIndex === 2 ? 48 : 28, Math.max(10, Math.round(maxLength * 0.85)));
    });
    const columnsXml = widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("");
    const mergedEnd = columnName(titleEndColumn);
    const logoParts = dataUrlParts(logo);
    const drawingTag = logoParts ? '<drawing r:id="rId1"/>' : "";
    const worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetViews><sheetView workbookViewId="0"><pane ySplit="${dataStartRow}" topLeftCell="A${dataStartRow + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${columnsXml}</cols><sheetData>${sheetRows.join("")}</sheetData><mergeCells count="2"><mergeCell ref="B1:${mergedEnd}1"/><mergeCell ref="B2:${mergedEnd}2"/></mergeCells><autoFilter ref="A${dataStartRow}:${columnName(columnCount)}${Math.max(dataStartRow, dataStartRow + safeRows.length - 1)}"/><pageMargins left="0.35" right="0.35" top="0.55" bottom="0.55" header="0.2" footer="0.2"/><pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0" paperSize="9"/>${drawingTag}</worksheet>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="11"/><name val="Cambria"/></font><font><b/><sz val="18"/><color rgb="FF063F5C"/><name val="Cambria"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Cambria"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF087F68"/><bgColor indexed="64"/></patternFill></fill><borders count="2"><border/><border><left style="thin"><color rgb="FFB7CDC5"/></left><right style="thin"><color rgb="FFB7CDC5"/></right><top style="thin"><color rgb="FFB7CDC5"/></top><bottom style="thin"><color rgb="FFB7CDC5"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="4"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

    const zip = new JSZip();
    zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${logoParts ? `<Default Extension="${logoParts.extension}" ContentType="image/${logoParts.extension === "jpeg" ? "jpeg" : "png"}"/>` : ""}<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${logoParts ? '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' : ""}</Types>`);
    zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
    zip.folder("xl").file("workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="${escapeXml(String(sheetName).slice(0, 31))}" sheetId="1" r:id="rId1"/></sheets></workbook>`);
    zip.folder("xl/_rels").file("workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
    zip.folder("xl/worksheets").file("sheet1.xml", worksheetXml);
    zip.folder("xl").file("styles.xml", stylesXml);

    if (logoParts) {
      zip.folder("xl/worksheets/_rels").file("sheet1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`);
      zip.folder("xl/drawings").file("drawing1.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>1</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>3</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="Logo Sekolah"/><xdr:cNvPicPr/></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="914400" cy="914400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>`);
      zip.folder("xl/drawings/_rels").file("drawing1.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo.${logoParts.extension}"/></Relationships>`);
      zip.folder("xl/media").file(`logo.${logoParts.extension}`, logoParts.base64, { base64: true });
    }

    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
    downloadBlob(blob, filename.toLowerCase().endsWith(".xlsx") ? filename : `${filename.replace(/\.xls$/i, "")}.xlsx`);
  }

  async function savePptx(pptx, filename) {
    const output = await pptx.write({ outputType: "blob", compression: true });
    const blob = output instanceof Blob ? output : new Blob([output], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
    downloadBlob(blob, filename.toLowerCase().endsWith(".pptx") ? filename : `${filename}.pptx`);
  }

  async function exportAssessmentPpt(exam, config, { withKey = false } = {}) {
    if (typeof PptxGenJS === "undefined") throw new Error("Pustaka PowerPoint belum dimuat.");
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "PAIBP SMART SMP";
    pptx.subject = exam.spec.title;
    pptx.title = `${exam.spec.title} Kelas ${exam.spec.grade}`;
    pptx.company = config.school;
    pptx.lang = "id-ID";
    pptx.defineSlideMaster({
      title: "PAIBP",
      background: { color: "F7FBF9" },
      objects: [
        { rect: { x: 0, y: 0, w: 13.333, h: 0.28, fill: { color: "087F68" }, line: { color: "087F68" } } },
        { text: { text: "PAIBP SMART SMP", options: { x: 0.45, y: 7.13, w: 5, h: 0.2, fontFace: "Cambria", fontSize: 9, color: "5B706A" } } },
        { text: { text: config.school, options: { x: 7.0, y: 7.13, w: 5.7, h: 0.2, fontFace: "Cambria", fontSize: 9, color: "5B706A", align: "right" } } },
      ],
      slideNumber: { x: 12.85, y: 7.1, color: "5B706A", fontSize: 9 },
    });
    const logo = await logoData(config);
    let slide = pptx.addSlide("PAIBP");
    if (logo) slide.addImage({ data: logo, x: 0.55, y: 0.55, w: 1.2, h: 1.2 });
    slide.addText(config.school, { x: 1.9, y: 0.68, w: 10.6, h: 0.5, fontFace: "Cambria", fontSize: 24, bold: true, color: "063F5C", align: "center" });
    slide.addText(exam.spec.title, { x: 1.0, y: 1.65, w: 11.3, h: 0.75, fontFace: "Cambria", fontSize: 29, bold: true, color: "087F68", align: "center", margin: 0.05, fit: "shrink" });
    slide.addText(`Kelas ${exam.spec.grade} • ${exam.spec.semester} • Tahun Ajaran ${config.year}`, { x: 1.1, y: 2.55, w: 11.1, h: 0.38, fontFace: "Cambria", fontSize: 16, color: "39564F", align: "center" });
    slide.addText(`Cakupan: ${exam.spec.kind === "UKLN" ? "Kelas VII 20% • VIII 20% • IX 60%" : (exam.spec.chapters || []).map((id) => `Bab ${id.split("-")[1]}`).join(", ")}`, { x: 1.05, y: 3.12, w: 11.2, h: 0.55, fontFace: "Cambria", fontSize: 15, color: "39564F", align: "center", fit: "shrink" });
    slide.addText(`${exam.questions.length} pilihan ganda • ${exam.essays.length} uraian`, { x: 3.0, y: 4.15, w: 7.3, h: 0.7, fontFace: "Cambria", fontSize: 21, bold: true, color: "FFFFFF", align: "center", valign: "mid", fill: { color: "087F68" }, margin: 0.12 });

    for (let start = 0; start < exam.questions.length; start += 3) {
      const chunk = exam.questions.slice(start, start + 3);
      slide = pptx.addSlide("PAIBP");
      slide.addText(`Pilihan Ganda ${start + 1}–${start + chunk.length}`, { x: 0.55, y: 0.42, w: 12.2, h: 0.4, fontFace: "Cambria", fontSize: 20, bold: true, color: "063F5C" });
      let y = 0.95;
      chunk.forEach((question) => {
        const stimulus = String(question.stimulus || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        const options = question.options.map((option, index) => `${withKey && index === question.answer ? "●" : "○"} ${String.fromCharCode(65 + index)}. ${option}`).join("\n");
        slide.addText(`${question.number}. ${stimulus ? `${stimulus}\n` : ""}${question.stem}`, { x: 0.65, y, w: 12.0, h: 0.72, fontFace: "Cambria", fontSize: 13.2, bold: true, color: "153A33", margin: 0.04, fit: "shrink" });
        slide.addText(options, { x: 0.9, y: y + 0.72, w: 11.55, h: 1.15, fontFace: "Cambria", fontSize: 12, color: "304F48", margin: 0.03, fit: "shrink" });
        y += 1.95;
      });
    }

    for (let start = 0; start < exam.essays.length; start += 3) {
      slide = pptx.addSlide("PAIBP");
      slide.addText(`Uraian ${start + 1}–${Math.min(start + 3, exam.essays.length)}`, { x: 0.55, y: 0.42, w: 12.2, h: 0.4, fontFace: "Cambria", fontSize: 20, bold: true, color: "063F5C" });
      let y = 1.05;
      exam.essays.slice(start, start + 3).forEach((question) => {
        slide.addText(`${question.number}. ${question.prompt}`, { x: 0.72, y, w: 11.9, h: 1.55, fontFace: "Cambria", fontSize: 16, color: "153A33", margin: 0.12, fit: "shrink", fill: { color: "FFFFFF" }, line: { color: "CFE3DC", pt: 1 } });
        y += 1.8;
      });
    }
    await savePptx(pptx, `${slug(exam.spec.id)}-${withKey ? "soal-jawaban" : "soal"}.pptx`);
  }

  async function exportArabicPpt(items) {
    if (typeof PptxGenJS === "undefined") throw new Error("Pustaka PowerPoint belum dimuat.");
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = "PAIBP SMART SMP";
    pptx.title = "Ringkasan Bahasa Arab Praktis";
    pptx.lang = "id-ID";
    let slide = pptx.addSlide();
    slide.background = { color: "063F5C" };
    slide.addText("Ringkasan Bahasa Arab Praktis", { x: 0.7, y: 1.25, w: 12, h: 0.75, fontFace: "Cambria", fontSize: 34, bold: true, color: "FFFFFF", align: "center" });
    slide.addText(`${items.length} materi • pemula sampai mahir`, { x: 1.2, y: 2.25, w: 11, h: 0.5, fontFace: "Cambria", fontSize: 18, color: "DCF5EC", align: "center" });
    for (let start = 0; start < items.length; start += 2) {
      slide = pptx.addSlide();
      slide.background = { color: "F7FBF9" };
      items.slice(start, start + 2).forEach((item, index) => {
        const x = 0.55 + index * 6.25;
        slide.addText(`${item.stage} • ${item.title}`, { x, y: 0.65, w: 5.9, h: 0.55, fontFace: "Cambria", fontSize: 18, bold: true, color: "087F68", fit: "shrink" });
        slide.addText(item.goal, { x, y: 1.3, w: 5.9, h: 0.75, fontFace: "Cambria", fontSize: 12.5, color: "304F48", fit: "shrink" });
        slide.addText(item.arabic, { x, y: 2.15, w: 5.9, h: 0.65, fontFace: "Arial", fontSize: 20, bold: true, color: "063F5C", align: "right", rtlMode: true, fit: "shrink" });
        slide.addText(item.meaning, { x, y: 2.9, w: 5.9, h: 0.55, fontFace: "Cambria", fontSize: 12.5, italic: true, color: "50665F", fit: "shrink" });
        slide.addText(`Pola inti\n${item.formula}`, { x, y: 3.55, w: 5.9, h: 1.0, fontFace: "Cambria", fontSize: 12, color: "153A33", fill: { color: "FFF7DF" }, margin: 0.1, fit: "shrink" });
        slide.addText(`Kosakata: ${(item.vocab || []).join(" • ")}`, { x, y: 4.72, w: 5.9, h: 0.8, fontFace: "Cambria", fontSize: 11.5, color: "304F48", fit: "shrink" });
        slide.addText(`Latihan: ${item.practice}`, { x, y: 5.7, w: 5.9, h: 0.75, fontFace: "Cambria", fontSize: 11.5, bold: true, color: "087F68", fit: "shrink" });
      });
    }
    await savePptx(pptx, "ringkasan-bahasa-arab-praktis.pptx");
  }

  window.PAIBP_OFFICE = Object.freeze({ exportXlsx, exportAssessmentPpt, exportArabicPpt, logoData, downloadBlob });
})();

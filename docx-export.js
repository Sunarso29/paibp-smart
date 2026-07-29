(() => {
  "use strict";

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function escapeXml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&apos;");
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function write16(view, offset, value) {
    view.setUint16(offset, value, true);
  }

  function write32(view, offset, value) {
    view.setUint32(offset, value >>> 0, true);
  }

  function concatBytes(parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      result.set(part, offset);
      offset += part.length;
    }
    return result;
  }

  function zipStore(files) {
    const localParts = [];
    const centralParts = [];
    let localOffset = 0;
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();

    Object.entries(files).forEach(([name, content]) => {
      const filename = encoder.encode(name);
      const data = content instanceof Uint8Array ? content : encoder.encode(String(content));
      const checksum = crc32(data);
      const local = new Uint8Array(30 + filename.length);
      const localView = new DataView(local.buffer);
      write32(localView, 0, 0x04034b50);
      write16(localView, 4, 20);
      write16(localView, 6, 0x0800);
      write16(localView, 8, 0);
      write16(localView, 10, dosTime);
      write16(localView, 12, dosDate);
      write32(localView, 14, checksum);
      write32(localView, 18, data.length);
      write32(localView, 22, data.length);
      write16(localView, 26, filename.length);
      write16(localView, 28, 0);
      local.set(filename, 30);
      localParts.push(local, data);

      const central = new Uint8Array(46 + filename.length);
      const centralView = new DataView(central.buffer);
      write32(centralView, 0, 0x02014b50);
      write16(centralView, 4, 20);
      write16(centralView, 6, 20);
      write16(centralView, 8, 0x0800);
      write16(centralView, 10, 0);
      write16(centralView, 12, dosTime);
      write16(centralView, 14, dosDate);
      write32(centralView, 16, checksum);
      write32(centralView, 20, data.length);
      write32(centralView, 24, data.length);
      write16(centralView, 28, filename.length);
      write16(centralView, 30, 0);
      write16(centralView, 32, 0);
      write16(centralView, 34, 0);
      write16(centralView, 36, 0);
      write32(centralView, 38, 0);
      write32(centralView, 42, localOffset);
      central.set(filename, 46);
      centralParts.push(central);
      localOffset += local.length + data.length;
    });

    const centralBytes = concatBytes(centralParts);
    const end = new Uint8Array(22);
    const endView = new DataView(end.buffer);
    write32(endView, 0, 0x06054b50);
    write16(endView, 4, 0);
    write16(endView, 6, 0);
    write16(endView, 8, Object.keys(files).length);
    write16(endView, 10, Object.keys(files).length);
    write32(endView, 12, centralBytes.length);
    write32(endView, 16, localOffset);
    write16(endView, 20, 0);
    return concatBytes([...localParts, centralBytes, end]);
  }

  function utf8ToBase64(value) {
    const bytes = encoder.encode(String(value));
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  function base64ToUtf8(value) {
    const binary = atob(value);
    return decoder.decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
  }

  function paragraphXml(block, options = {}) {
    const normalized = typeof block === "string" ? { text: block } : (block || {});
    const style = normalized.style || "";
    const bold = Boolean(normalized.bold || /^Heading[123]$/.test(style));
    const size = Number(normalized.size || options.size || (style === "Title" ? 34 : style === "Heading1" ? 30 : style === "Heading2" ? 26 : style === "Heading3" ? 23 : 21));
    const spacingAfter = Number(options.spacingAfter ?? (/^Heading|Title/.test(style) ? 150 : 90));
    const lines = String(normalized.text ?? "").split("\n");
    const runs = lines.map((line, index) => (
      `${index ? "<w:br/>" : ""}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`
    )).join("");
    return `<w:p><w:pPr>${style ? `<w:pStyle w:val="${escapeXml(style)}"/>` : ""}<w:spacing w:after="${spacingAfter}"/>${options.keepNext ? "<w:keepNext/>" : ""}</w:pPr><w:r><w:rPr>${bold ? "<w:b/>" : ""}<w:rFonts w:ascii="Cambria" w:hAnsi="Cambria" w:eastAsia="Cambria"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr>${runs}</w:r></w:p>`;
  }

  function normalizedTableCell(cell) {
    if (cell && typeof cell === "object" && !Array.isArray(cell)) {
      return {
        text: String(cell.text ?? ""),
        header: Boolean(cell.header),
        gridSpan: Math.max(1, Number(cell.gridSpan || 1)),
      };
    }
    return { text: String(cell ?? ""), header: false, gridSpan: 1 };
  }

  function tableColumnCount(block) {
    return Math.max(0, ...(block.rows || []).map((row) => {
      const cells = Array.isArray(row) ? row : (row.cells || []);
      return cells.reduce((total, cell) => total + normalizedTableCell(cell).gridSpan, 0);
    }));
  }

  function tableXml(block) {
    const rows = Array.isArray(block.rows) ? block.rows : [];
    if (!rows.length) return "";
    const columnCount = Math.max(1, tableColumnCount(block));
    const compact = columnCount >= 7;
    const gridWidth = Math.max(720, Math.floor((compact ? 15000 : 9500) / columnCount));
    const grid = Array.from({ length: columnCount }, () => `<w:gridCol w:w="${gridWidth}"/>`).join("");
    const borders = ["top", "left", "bottom", "right", "insideH", "insideV"]
      .map((side) => `<w:${side} w:val="single" w:sz="6" w:space="0" w:color="7FA99C"/>`)
      .join("");
    const body = rows.map((row, rowIndex) => {
      const rowObject = Array.isArray(row) ? { cells: row } : row;
      const isHeaderRow = Boolean(rowObject.header || rowIndex < Number(block.headerRows || 0));
      const cells = (rowObject.cells || []).map((rawCell) => {
        const cell = normalizedTableCell(rawCell);
        const isHeader = isHeaderRow || cell.header;
        const cellProperties = [
          `<w:tcW w:w="0" w:type="auto"/>`,
          cell.gridSpan > 1 ? `<w:gridSpan w:val="${cell.gridSpan}"/>` : "",
          `<w:vAlign w:val="top"/>`,
          isHeader ? `<w:shd w:val="clear" w:color="auto" w:fill="DFF5ED"/>` : "",
        ].join("");
        return `<w:tc><w:tcPr>${cellProperties}</w:tcPr>${paragraphXml(
          { text: cell.text, bold: isHeader },
          { size: compact ? 16 : 18, spacingAfter: 20 },
        )}</w:tc>`;
      }).join("");
      return `<w:tr><w:trPr>${isHeaderRow ? "<w:tblHeader/>" : ""}<w:cantSplit/></w:trPr>${cells}</w:tr>`;
    }).join("");
    return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblLayout w:type="autofit"/><w:tblBorders>${borders}</w:tblBorders><w:tblCellMar><w:top w:w="70" w:type="dxa"/><w:left w:w="90" w:type="dxa"/><w:bottom w:w="70" w:type="dxa"/><w:right w:w="90" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>${paragraphXml({ text: "" }, { spacingAfter: 30 })}`;
  }

  function blockXml(block) {
    if (block?.type === "table") return tableXml(block);
    if (block?.type === "list") {
      return (block.items || []).map((item, index) => (
        paragraphXml({ text: `${block.ordered ? `${index + 1}.` : "•"} ${item}` }, { spacingAfter: 35 })
      )).join("");
    }
    return paragraphXml(block, { keepNext: /^Heading|Title/.test(String(block?.style || "")) });
  }

  function createDocument({ title = "Dokumen PAIBP SMART", blocks = [], customData = null } = {}) {
    const allBlocks = [{ text: title, style: "Title" }, ...blocks];
    const body = allBlocks.map(blockXml).join("");
    const widestTable = Math.max(0, ...blocks.filter((block) => block?.type === "table").map(tableColumnCount));
    const landscape = widestTable >= 7;
    const pageSize = landscape
      ? `<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>`
      : `<w:pgSz w:w="11906" w:h="16838"/>`;
    const pageMargin = landscape
      ? `<w:pgMar w:top="567" w:right="567" w:bottom="567" w:left="567"/>`
      : `<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>`;
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr>${pageSize}${pageMargin}</w:sectPr></w:body></w:document>`;
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Cambria" w:hAnsi="Cambria" w:eastAsia="Cambria"/><w:lang w:val="id-ID"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/></w:style></w:styles>`;
    const customXml = customData === null
      ? null
      : `<?xml version="1.0" encoding="UTF-8"?><paibp-smart><payload encoding="base64">${utf8ToBase64(JSON.stringify(customData))}</payload></paibp-smart>`;
    const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
    const files = {
      "[Content_Types].xml": contentTypes,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
      "word/document.xml": documentXml,
      "word/styles.xml": stylesXml,
      "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`,
    };
    if (customXml) files["customXml/item1.xml"] = customXml;
    return new Blob([zipStore(files)], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  }

  function blocksFromElement(element) {
    if (!element) return [];
    const blocks = [];
    const textFromNode = (node) => String(node.innerText || node.textContent || "").replace(/\u00a0/g, " ").trim();
    element.querySelectorAll("h1,h2,h3,h4,p,ul,ol,table").forEach((node) => {
      if (node.closest(".no-print,[hidden]")) return;
      if (node.tagName !== "TABLE" && node.closest("table")) return;
      if (!["UL", "OL"].includes(node.tagName) && node.closest("ul,ol")) return;
      if (["UL", "OL"].includes(node.tagName) && node.parentElement?.closest("ul,ol")) return;
      if (node.tagName === "TABLE") {
        const rows = [...node.querySelectorAll("tr")].map((row) => ({
          header: Boolean(row.closest("thead")) || [...row.children].every((cell) => cell.tagName === "TH"),
          cells: [...row.children]
            .filter((cell) => ["TH", "TD"].includes(cell.tagName))
            .map((cell) => ({
              text: textFromNode(cell),
              header: cell.tagName === "TH",
              gridSpan: Math.max(1, Number(cell.getAttribute("colspan") || 1)),
            })),
        })).filter((row) => row.cells.length);
        if (rows.length) blocks.push({ type: "table", rows });
        return;
      }
      if (["UL", "OL"].includes(node.tagName)) {
        const items = [...node.children]
          .filter((item) => item.tagName === "LI")
          .map(textFromNode)
          .filter(Boolean);
        if (items.length) blocks.push({ type: "list", ordered: node.tagName === "OL", items });
        return;
      }
      const text = textFromNode(node);
      if (!text) return;
      const style = node.tagName === "H1" ? "Heading1"
        : node.tagName === "H2" ? "Heading1"
          : node.tagName === "H3" ? "Heading2"
            : node.tagName === "H4" ? "Heading3"
              : "";
      blocks.push({ text, style });
    });
    return blocks;
  }

  async function readCustomData(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 0;
    while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
      const method = view.getUint16(offset + 8, true);
      const compressedSize = view.getUint32(offset + 18, true);
      const filenameLength = view.getUint16(offset + 26, true);
      const extraLength = view.getUint16(offset + 28, true);
      const nameStart = offset + 30;
      const name = decoder.decode(bytes.slice(nameStart, nameStart + filenameLength));
      const dataStart = nameStart + filenameLength + extraLength;
      if (name === "customXml/item1.xml") {
        if (method !== 0) throw new Error("Berkas Word telah dikompresi ulang dan tidak lagi dapat diimpor otomatis.");
        const xml = decoder.decode(bytes.slice(dataStart, dataStart + compressedSize));
        const match = xml.match(/<payload encoding="base64">([^<]+)<\/payload>/);
        if (!match) throw new Error("Data tugas PAIBP tidak ditemukan.");
        return JSON.parse(base64ToUtf8(match[1]));
      }
      offset = dataStart + compressedSize;
    }
    throw new Error("Berkas Word ini bukan hasil ekspor tugas PAIBP SMART.");
  }

  window.PAIBP_DOCX = { createDocument, blocksFromElement, readCustomData };
})();

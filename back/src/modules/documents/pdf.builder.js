function escapePdfText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return numeric.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function buildTextBlock(lines, pageNumber, pageCount) {
  const commands = [
    "BT",
    "/F1 11 Tf",
    "40 780 Td",
    "14 TL",
  ];

  lines.forEach((line, index) => {
    if (index === 0) {
      commands.push(`(${escapePdfText(line)}) Tj`);
    } else {
      commands.push("T*");
      commands.push(`(${escapePdfText(line)}) Tj`);
    }
  });

  commands.push("ET");
  commands.push("BT");
  commands.push("/F2 9 Tf");
  commands.push("40 24 Td");
  commands.push(`(Page ${pageNumber} of ${pageCount}) Tj`);
  commands.push("ET");

  return commands.join("\n");
}

export function formatCurrency(value, currency = "RWF") {
  return `${formatNumber(value)} ${currency}`;
}

export function buildPdfTable(headers, rows) {
  const normalizedHeaders = headers.map((header) => String(header));
  const bodyRows = rows.map((row) =>
    row.map((cell) => String(cell ?? ""))
  );

  return [
    normalizedHeaders.join(" | "),
    normalizedHeaders.map(() => "----------------").join(" | "),
    ...bodyRows.map((row) => row.join(" | ")),
  ];
}

export function buildPdfBuffer({
  title,
  subtitle,
  sections,
  stampLines = [],
  producer = "CivilBridge",
}) {
  const allLines = [
    title,
    subtitle || "",
    "CivilBridge",
    "",
  ];

  sections.forEach((section) => {
    allLines.push(section.heading);
    allLines.push(...section.lines);
    allLines.push("");
  });

  if (stampLines.length) {
    allLines.push("Approval Stamp");
    allLines.push(...stampLines);
  }

  const pages = chunkArray(allLines, 46);
  const objects = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  const pageRefs = [];

  pages.forEach((pageLines, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = 4 + index * 2;
    pageRefs.push(`${pageObjectId} 0 R`);
    const stream = buildTextBlock(pageLines, index + 1, pages.length);
    const contentLength = Buffer.byteLength(stream, "utf8");

    objects.push(
      `${pageObjectId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R /F2 ${4 + pages.length * 2} 0 R >> >> /Contents ${contentObjectId} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjectId} 0 obj\n<< /Length ${contentLength} >>\nstream\n${stream}\nendstream\nendobj\n`
    );
  });

  objects.splice(
    1,
    0,
    `2 0 obj\n<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>\nendobj\n`
  );

  const bodyFontId = 3 + pages.length * 2;
  const footerFontId = 4 + pages.length * 2;
  const infoObjectId = 5 + pages.length * 2;

  objects.push(
    `${bodyFontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>\nendobj\n`
  );
  objects.push(
    `${footerFontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`
  );
  objects.push(
    `${infoObjectId} 0 obj\n<< /Producer (${escapePdfText(producer)}) /Title (${escapePdfText(title)}) >>\nendobj\n`
  );

  let body = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(Buffer.byteLength(body, "utf8"));
    body += object;
  });

  const xrefStart = Buffer.byteLength(body, "utf8");
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoObjectId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(body, "utf8");
}

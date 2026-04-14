function escapePdfText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildTextBlock(lines, startY = 760) {
  const commands = ["BT", "/F1 12 Tf", `72 ${startY} Td`, "14 TL"];
  lines.forEach((line, index) => {
    if (index === 0) {
      commands.push(`(${escapePdfText(line)}) Tj`);
    } else {
      commands.push("T*");
      commands.push(`(${escapePdfText(line)}) Tj`);
    }
  });
  commands.push("ET");
  return commands.join("\n");
}

export function buildInvoicePdfBuffer({
  transaction,
  user,
}) {
  const issuedAt = new Date(transaction.receiptIssuedAt || transaction.settledAt || transaction.createdAt);
  const lines = [
    "CivilBridge Payment Invoice",
    `Invoice Number: ${transaction.invoiceNumber || "Pending"}`,
    `Transaction Reference: ${transaction.reference || "N/A"}`,
    `Provider: ${transaction.provider}`,
    `Status: ${transaction.status}`,
    `Service Type: ${transaction.serviceType}`,
    `Service Reference: ${transaction.serviceReference || "N/A"}`,
    `Service Label: ${transaction.serviceLabel || "N/A"}`,
    `Customer: ${user?.fullName || "Unknown User"}`,
    `Customer Email: ${user?.email || "N/A"}`,
    `Customer Phone: ${user?.phone || "N/A"}`,
    `Amount: ${transaction.amount} ${transaction.currency}`,
    `Description: ${transaction.description || "CivilBridge service payment"}`,
    `Issued At: ${issuedAt.toISOString()}`,
  ];

  const stream = buildTextBlock(lines);
  const contentLength = Buffer.byteLength(stream, "utf8");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${contentLength} >>\nstream\n${stream}\nendstream\nendobj\n`,
    `6 0 obj\n<< /Producer (CivilBridge Payments Module) /Title (${escapePdfText(transaction.invoiceNumber || "Invoice")}) >>\nendobj\n`,
  ];

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
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(body, "utf8");
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const htmlEscape = escapeHtml;

export function buildOfflineDocument({ title, subtitle, sections }) {
  const body = sections
    .map((section) => {
      const items = (section.items || [])
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");

      const content = section.html
        ? section.html
        : section.text
          ? `<p>${escapeHtml(section.text)}</p>`
          : `<ol>${items}</ol>`;

      return `
        <section>
          <h2>${escapeHtml(section.heading)}</h2>
          ${content}
        </section>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.5;
        color: #241f1c;
        margin: 28px;
      }
      h1 {
        color: #6b2f25;
        margin-bottom: 6px;
      }
      h2 {
        margin-top: 24px;
        color: #3f3430;
        border-bottom: 1px solid #ddd;
        padding-bottom: 6px;
      }
      .subtitle {
        color: #6f625d;
        margin-bottom: 24px;
      }
      li {
        margin-bottom: 8px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
        vertical-align: top;
      }
      th {
        background: #f6eee8;
      }
      @media print {
        body {
          margin: 18mm;
        }
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<div class="subtitle">${escapeHtml(subtitle)}</div>` : ""}
    ${body}
  </body>
</html>`;
}

export function downloadHtmlDocument(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function openPrintableDocument(html) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) return false;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 250);
  return true;
}

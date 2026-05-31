function escapeValue(value: unknown) {
  return String(value ?? '').replaceAll('"', '""')
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function downloadBlob(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportAsCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => `"${escapeValue(row[header])}"`).join(',')),
  ].join('\n')

  downloadBlob(`${filename}.csv`, csv, 'text/csv;charset=utf-8;')
}

export function exportAsExcel(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return
  }

  const headers = Object.keys(rows[0])
  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${headers
                    .map((header) => `<td>${escapeHtml(row[header])}</td>`)
                    .join('')}</tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  downloadBlob(`${filename}.xls`, html, 'application/vnd.ms-excel;charset=utf-8;')
}

export function exportAsPdf(title: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) {
    return false
  }

  const popup = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=900')
  if (!popup) {
    return false
  }

  const headers = Object.keys(rows[0])
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${headers
          .map((header) => `<td>${escapeHtml(row[header])}</td>`)
          .join('')}</tr>`,
    )
    .join('')

  popup.document.write(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
          h1 { margin-bottom: 8px; }
          p { margin-bottom: 24px; color: #475569; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          th { background: #e2e8f0; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <p>Exportado desde HA Connect.</p>
        <table>
          <thead>
            <tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `)

  popup.document.close()
  popup.focus()
  popup.print()
  return true
}

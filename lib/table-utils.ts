/**
 * Utilities for parsing and serializing markdown tables
 */

export interface TableData {
  headers: string[]
  rows: string[][]
}

/**
 * Parse a markdown table string into a structured format
 * @param markdown - Markdown table string (pipe-delimited format)
 * @returns TableData object with headers and rows
 */
export function parseMarkdownTable(markdown: string): TableData {
  const lines = markdown.split('\n').filter(line => line.trim())

  if (lines.length < 2) {
    // Empty or invalid table
    return { headers: [''], rows: [['']] }
  }

  // Parse header row
  const headers = lines[0]
    .split('|')
    .map(cell => cell.trim())
    .filter(cell => cell !== '')

  // Skip separator line (e.g., |---|---|)
  // Parse data rows (skip first two lines: header and separator)
  const rows = lines.slice(2).map(line => {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell !== '' || line.includes('||')) // Keep empty cells if they exist
      .slice(0, headers.length) // Ensure we don't have more cells than headers
  })

  // Pad rows that have fewer cells than headers
  const paddedRows = rows.map(row => {
    const paddedRow = [...row]
    while (paddedRow.length < headers.length) {
      paddedRow.push('')
    }
    return paddedRow
  })

  return {
    headers: headers.length > 0 ? headers : [''],
    rows: paddedRows.length > 0 ? paddedRows : [['']]
  }
}

/**
 * Serialize table data back to markdown format
 * @param data - TableData object with headers and rows
 * @returns Markdown table string
 */
export function serializeToMarkdown(data: TableData): string {
  const { headers, rows } = data

  // Build header row
  const headerRow = `| ${headers.join(' | ')} |`

  // Build separator row
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`

  // Build data rows
  const dataRows = rows.map(row => {
    // Pad row if it has fewer cells than headers
    const paddedRow = [...row]
    while (paddedRow.length < headers.length) {
      paddedRow.push('')
    }
    return `| ${paddedRow.slice(0, headers.length).join(' | ')} |`
  })

  return [headerRow, separatorRow, ...dataRows].join('\n')
}

/**
 * Add a new row to the table
 */
export function addRow(data: TableData): TableData {
  const emptyRow = new Array(data.headers.length).fill('')
  return {
    ...data,
    rows: [...data.rows, emptyRow]
  }
}

/**
 * Delete a row from the table
 */
export function deleteRow(data: TableData, rowIndex: number): TableData {
  if (data.rows.length <= 1) {
    // Keep at least one row
    return data
  }
  return {
    ...data,
    rows: data.rows.filter((_, index) => index !== rowIndex)
  }
}

/**
 * Add a new column to the table
 */
export function addColumn(data: TableData): TableData {
  return {
    headers: [...data.headers, ''],
    rows: data.rows.map(row => [...row, ''])
  }
}

/**
 * Delete a column from the table
 */
export function deleteColumn(data: TableData, colIndex: number): TableData {
  if (data.headers.length <= 1) {
    // Keep at least one column
    return data
  }
  return {
    headers: data.headers.filter((_, index) => index !== colIndex),
    rows: data.rows.map(row => row.filter((_, index) => index !== colIndex))
  }
}

/**
 * Update a specific cell value
 */
export function updateCell(
  data: TableData,
  rowIndex: number,
  colIndex: number,
  value: string
): TableData {
  const newRows = data.rows.map((row, rIdx) => {
    if (rIdx === rowIndex) {
      return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
    }
    return row
  })
  return { ...data, rows: newRows }
}

/**
 * Update a header value
 */
export function updateHeader(
  data: TableData,
  colIndex: number,
  value: string
): TableData {
  const newHeaders = data.headers.map((header, idx) =>
    idx === colIndex ? value : header
  )
  return { ...data, headers: newHeaders }
}

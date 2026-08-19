/**
 * 通用数据导出工具
 */

export interface ExportOptions {
  filename?: string
  headers?: Record<string, string>
  filenameHint?: string
}

/**
 * 将数组导出为 CSV 并触发下载
 */
export function downloadCsv<T extends Record<string, any>>(
  data: T[],
  options: ExportOptions = {}
): void {
  if (!data.length) return

  const { filename = 'export', headers } = options
  const keys = headers || Object.keys(data[0])

  const csvLines = [
    keys.map(k => `"${headers?.[k] || k}"`).join(','),
    ...data.map(row =>
      keys.map(k => `"${String(row[k] ?? '')}"`).join(',')
    )
  ]

  const csvContent = '\uFEFF' + csvLines.join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

/**
 * 将表格数据转为 CSV 字符串
 */
export function formatCsv<T extends Record<string, any>>(
  data: T[],
  headers?: Record<string, string>
): string {
  if (!data.length) return ''
  const keys = headers || Object.keys(data[0])
  return [
    keys.map(k => `"${headers?.[k] || k}"`).join(','),
    ...data.map(row => keys.map(k => `"${String(row[k] ?? '')}"`).join(','))
  ].join('\n')
}

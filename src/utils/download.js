/**
 * Blob を生成してファイルダウンロードをトリガーする共通ユーティリティ。
 */
export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  try {
    a.click()
  } finally {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

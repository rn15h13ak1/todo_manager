import { generateTimestamp } from './date'

const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' }
const STATUS_LABEL = { todo: '未着手', in_progress: '進行中', done: '完了' }

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function exportHtml(tasks) {
  const rows = tasks
    .map(
      (t) => `
    <tr>
      <td>${escapeHtml(t.title)}</td>
      <td>${escapeHtml(t.description || '')}</td>
      <td>${escapeHtml(t.dueDate || '')}</td>
      <td>${escapeHtml(PRIORITY_LABEL[t.priority] || t.priority)}</td>
      <td>${escapeHtml(STATUS_LABEL[t.status] || t.status)}</td>
      <td>${escapeHtml(t.createdAt ? t.createdAt.slice(0, 10) : '')}</td>
    </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>TODOエクスポート</title>
  <style>
    body { font-family: sans-serif; padding: 24px; background: #f9fafb; color: #111827; }
    h1 { font-size: 1.5rem; font-weight: bold; margin-bottom: 16px; }
    table { border-collapse: collapse; width: 100%; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th, td { border: 1px solid #e5e7eb; padding: 10px 14px; text-align: left; font-size: 0.875rem; }
    th { background: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) td { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>TODOリスト</h1>
  <table>
    <thead>
      <tr>
        <th>タイトル</th>
        <th>説明</th>
        <th>期限日</th>
        <th>優先度</th>
        <th>ステータス</th>
        <th>作成日</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`

  const timestamp = generateTimestamp()

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `todo-manager_${timestamp}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

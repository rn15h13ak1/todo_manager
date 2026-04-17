/**
 * 今日の日付を YYYY-MM-DD 形式の文字列で返す
 */
export function getTodayString() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * YYYY-MM-DD 形式の日付文字列を今日との差を相対表示に変換する
 * 例: 「今日」「昨日」「明日」「3日前」「5日後」「2週間後」「1ヶ月前」
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diffMs = target - today
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今日'
  if (diffDays === 1) return '明日'
  if (diffDays === -1) return '昨日'
  if (diffDays > 0) {
    if (diffDays < 7) return `${diffDays}日後`
    if (diffDays < 14) return '1週間後'
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間後`
    if (diffDays < 60) return '1ヶ月後'
    return `${Math.floor(diffDays / 30)}ヶ月後`
  } else {
    const d = -diffDays
    if (d < 7) return `${d}日前`
    if (d < 14) return '1週間前'
    if (d < 30) return `${Math.floor(d / 7)}週間前`
    if (d < 60) return '1ヶ月前'
    return `${Math.floor(d / 30)}ヶ月前`
  }
}

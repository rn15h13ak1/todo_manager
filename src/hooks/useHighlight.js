import { useState, useCallback } from 'react'
import { HIGHLIGHT_DURATION_MS } from '../utils/constants'

/**
 * タスクの黄色フラッシュハイライトを管理するフック。
 * flashHighlight(id) を呼ぶと HIGHLIGHT_DURATION_MS 後に自動消灯する。
 */
export function useHighlight() {
  const [highlightedTaskId, setHighlightedTaskId] = useState(null)

  const flashHighlight = useCallback((id) => {
    setHighlightedTaskId(id)
    setTimeout(
      () => setHighlightedTaskId((cur) => (cur === id ? null : cur)),
      HIGHLIGHT_DURATION_MS
    )
  }, [])

  return { highlightedTaskId, flashHighlight }
}

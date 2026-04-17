import { useState, useCallback, useRef, useEffect } from 'react'
import { HIGHLIGHT_DURATION_MS } from '../utils/constants'

/**
 * タスクの黄色フラッシュハイライトを管理するフック。
 * flashHighlight(id) を呼ぶと HIGHLIGHT_DURATION_MS 後に自動消灯する。
 * アンマウント時・次回呼び出し時にタイマーをクリアする。
 */
export function useHighlight() {
  const [highlightedTaskId, setHighlightedTaskId] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const flashHighlight = useCallback((id) => {
    clearTimeout(timerRef.current)
    setHighlightedTaskId(id)
    timerRef.current = setTimeout(
      () => setHighlightedTaskId((cur) => (cur === id ? null : cur)),
      HIGHLIGHT_DURATION_MS
    )
  }, [])

  return { highlightedTaskId, flashHighlight }
}

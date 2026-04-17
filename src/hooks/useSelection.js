import { useState, useEffect, useCallback } from 'react'

/**
 * タスク選択状態を管理するフック。
 * selectedIds の管理・操作関数をまとめて返す。
 * tasks が変わった際（フィルター変更・削除）に非表示 ID を自動除外する。
 */
export function useSelection(tasks, onDeleteMany) {
  const [selectedIds, setSelectedIds] = useState([])

  // タスク一覧が変わったとき、表示外の ID を選択から除外
  useEffect(() => {
    const visibleIds = new Set(tasks.map((t) => t.id))
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)))
  }, [tasks])

  const clearSelection = useCallback(() => setSelectedIds([]), [])

  const toggleOne = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length > 0 ? [] : tasks.map((t) => t.id)))
  }, [tasks])

  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`選択した ${selectedIds.length} 件のタスクを削除しますか？`)) return
    onDeleteMany(selectedIds)
    setSelectedIds([])
  }, [selectedIds, onDeleteMany])

  const removeFromSelection = useCallback((id) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }, [])

  return {
    selectedIds,
    clearSelection,
    toggleOne,
    toggleAll,
    deleteSelected,
    removeFromSelection,
  }
}

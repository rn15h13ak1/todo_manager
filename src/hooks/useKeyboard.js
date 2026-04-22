import { useEffect } from 'react'
import { STATUS, PRIORITY, FILTER_STATUS, SORT_KEY, FILTER_COUNT } from '../utils/constants'
import { deleteConfirmMessage } from '../utils/messages'
import { saveCompact } from '../utils/storage'

/**
 * アプリ全体のキーボードショートカットを管理するフック。
 * document レベルの keydown リスナーを登録・解除する。
 */
export function useKeyboard({
  // パネル系
  panelState,
  setPanelState,
  showShortcutModal,
  setShowShortcutModal,
  confirmToggle,
  setConfirmToggle,
  // フィルター系
  filters,
  setFilters,
  sortKey,
  setSortKey,
  filterFocusIndex,
  setFilterFocusIndex,
  isFiltered,
  resetFilters,
  allTags,
  // タスク系
  filteredTasks,
  focusedTaskId,
  setFocusedTaskId,
  // 選択系
  selectedIds,
  clearSelection,
  toggleOne,
  toggleAll,
  deleteSelected,
  // タスク操作
  deleteTask,
  duplicateTask,
  handleQuickUpdate,
  // UI 系
  compact,
  setCompact,
  flashHighlight,
  searchRef,
  // パネルフォーカス
  isPanelFocused,
  focusPanel,
  onAddNew,
  // タグ操作
  openTagModal,
}) {
  useEffect(() => {
    // フィルターフォーカス中に j/k で選択肢を移動する
    function moveFilterOption(delta) {
      if (filterFocusIndex === 0) {
        const opts = [FILTER_STATUS.ALL, FILTER_STATUS.NOT_DONE, STATUS.TODO, STATUS.IN_PROGRESS, STATUS.DONE]
        const next = Math.max(0, Math.min(opts.length - 1, opts.indexOf(filters.status) + delta))
        setFilters((f) => ({ ...f, status: opts[next] }))
      } else if (filterFocusIndex === 1) {
        const opts = [FILTER_STATUS.ALL, PRIORITY.HIGH, PRIORITY.MEDIUM, PRIORITY.LOW]
        const next = Math.max(0, Math.min(opts.length - 1, opts.indexOf(filters.priority) + delta))
        setFilters((f) => ({ ...f, priority: opts[next] }))
      } else if (filterFocusIndex === 2) {
        const opts = [FILTER_STATUS.ALL, ...allTags]
        const next = Math.max(0, Math.min(opts.length - 1, opts.indexOf(filters.tag) + delta))
        setFilters((f) => ({ ...f, tag: opts[next] }))
      } else if (filterFocusIndex === 3) {
        const opts = [SORT_KEY.DUE_DATE_ASC, SORT_KEY.DUE_DATE_DESC, SORT_KEY.PRIORITY, SORT_KEY.CREATED_AT]
        const next = Math.max(0, Math.min(opts.length - 1, opts.indexOf(sortKey) + delta))
        setSortKey(opts[next])
      }
      // index 4 (checkbox) は j/k で操作しない
    }

    function handleKeyDown(e) {
      // Tab: ブラウザのフォーカス移動をアプリ全体で無効化
      if (e.key === 'Tab') { e.preventDefault(); return }

      const tag = document.activeElement?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      // ESC: ショートカットモーダルを閉じる
      if (e.key === 'Escape' && showShortcutModal) {
        setShowShortcutModal(false)
        return
      }

      // ESC: フィルターフォーカス解除 → チェックボックス解除 → フィルターリセット
      if (e.key === 'Escape' && !isPanelFocused) {
        if (filterFocusIndex !== null) { setFilterFocusIndex(null); return }
        if (selectedIds.length > 0) { clearSelection(); return }
        if (isFiltered) resetFilters()
        return
      }

      // f: フィルターフォーカスをトグル（入力中・右パネルフォーカス中は無効）
      if (e.key === 'f' && !isTyping && !isPanelFocused) {
        e.preventDefault()
        setFilterFocusIndex((prev) => prev === null ? 0 : null)
        setFocusedTaskId(null)
        return
      }

      // フィルターフォーカスモード: j/k で項目移動、h/l で値変更、Space でチェックボックス切替
      if (filterFocusIndex !== null) {
        if (e.key === 'j') { e.preventDefault(); setFilterFocusIndex((i) => (i + 1) % FILTER_COUNT); return }
        if (e.key === 'k') { e.preventDefault(); setFilterFocusIndex((i) => (i - 1 + FILTER_COUNT) % FILTER_COUNT); return }
        if (e.key === 'l') { e.preventDefault(); moveFilterOption(1); return }
        if (e.key === 'h') { e.preventDefault(); moveFilterOption(-1); return }
        if (e.key === ' ') {
          e.preventDefault()
          if (filterFocusIndex === 4) setFilters((f) => ({ ...f, overdueOnly: !f.overdueOnly }))
          return
        }
      }

      // l: 右パネルへフォーカス移動（パネルが開いていて入力中でない場合）
      if (e.key === 'l' && panelState !== null && !isTyping) {
        e.preventDefault()
        focusPanel?.()
        return
      }

      // j/k: タスクフォーカス移動（左パネルにフォーカスがある場合はパネルが開いていても有効）
      if ((e.key === 'j' || e.key === 'k') && !isTyping && !isPanelFocused && filterFocusIndex === null && !showShortcutModal && confirmToggle === null) {
        e.preventDefault()
        if (filteredTasks.length === 0) return
        setFocusedTaskId((prev) => {
          const idx = filteredTasks.findIndex((t) => t.id === prev)
          if (e.key === 'j') {
            return idx === -1 || idx === filteredTasks.length - 1
              ? filteredTasks[0].id
              : filteredTasks[idx + 1].id
          } else {
            return idx <= 0
              ? filteredTasks[filteredTasks.length - 1].id
              : filteredTasks[idx - 1].id
          }
        })
        return
      }

      // 以下は入力中・右パネルフォーカス中・モーダル表示中は無効
      if (isTyping || isPanelFocused || showShortcutModal || confirmToggle !== null) return

      // /: 検索欄にフォーカス
      if (e.key === '/') {
        e.preventDefault()
        searchRef.current?.focus()
        return
      }

      // ?: ショートカット一覧モーダルを開く
      if (e.key === '?') {
        e.preventDefault()
        setShowShortcutModal(true)
        return
      }

      // v: コンパクト / 通常表示を切り替え
      if (e.key === 'v') {
        e.preventDefault()
        setCompact((c) => { saveCompact(!c); return !c })
        return
      }

      // n: 新規タスクを作成してフォーカス
      if (e.key === 'n') {
        e.preventDefault()
        onAddNew?.()
        return
      }

      // d: 選択中タスクの一括削除 or フォーカス中タスクの削除
      if (e.key === 'd') {
        if (selectedIds.length > 0) {
          deleteSelected()
        } else if (focusedTaskId) {
          const task = filteredTasks.find((t) => t.id === focusedTaskId)
          if (task && window.confirm(deleteConfirmMessage(task.title))) {
            deleteTask(focusedTaskId)
            setFocusedTaskId(null)
          }
        }
        return
      }

      // Space: フォーカス中タスクのチェックボックスをトグル
      if (e.key === ' ' && filterFocusIndex === null && focusedTaskId) {
        e.preventDefault()
        toggleOne(focusedTaskId)
        return
      }

      // c: フォーカス中タスクの完了状態トグル確認ダイアログ
      if (e.key === 'c' && focusedTaskId) {
        e.preventDefault()
        const task = filteredTasks.find((t) => t.id === focusedTaskId)
        if (task) {
          const newStatus = task.status === STATUS.DONE ? STATUS.TODO : STATUS.DONE
          setConfirmToggle({ id: task.id, title: task.title, newStatus })
        }
        return
      }

      // Enter: フォーカス中タスクの右パネルへフォーカス移動
      if (e.key === 'Enter' && focusedTaskId) {
        e.preventDefault()
        focusPanel?.()
        return
      }

      // t: 選択中 or フォーカス中タスクにタグを追加
      if (e.key === 't' && (selectedIds.length > 0 || focusedTaskId)) {
        e.preventDefault()
        const ids = selectedIds.length > 0 ? selectedIds : [focusedTaskId]
        openTagModal?.('add', ids)
        return
      }

      // T: 選択中 or フォーカス中タスクからタグを削除
      if (e.key === 'T' && (selectedIds.length > 0 || focusedTaskId)) {
        e.preventDefault()
        const ids = selectedIds.length > 0 ? selectedIds : [focusedTaskId]
        openTagModal?.('remove', ids)
        return
      }

      // y: フォーカス中タスクを複製
      if (e.key === 'y' && focusedTaskId) {
        e.preventDefault()
        const task = filteredTasks.find((t) => t.id === focusedTaskId)
        if (task) {
          const newId = duplicateTask(task)
          flashHighlight(newId)
        }
        return
      }

      // a: 全選択 / 全解除トグル
      if (e.key === 'a') {
        e.preventDefault()
        toggleAll()
        return
      }

      // g: 先頭タスクへジャンプ
      if (e.key === 'g') {
        e.preventDefault()
        if (filteredTasks.length > 0) setFocusedTaskId(filteredTasks[0].id)
        return
      }

      // G: 末尾タスクへジャンプ
      if (e.key === 'G') {
        e.preventDefault()
        if (filteredTasks.length > 0) setFocusedTaskId(filteredTasks[filteredTasks.length - 1].id)
        return
      }

      // 1/2/3: フォーカス中タスクの優先度を 高/中/低 に変更
      if ((e.key === '1' || e.key === '2' || e.key === '3') && focusedTaskId) {
        e.preventDefault()
        const priority = e.key === '1' ? PRIORITY.HIGH : e.key === '2' ? PRIORITY.MEDIUM : PRIORITY.LOW
        handleQuickUpdate(focusedTaskId, { priority })
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    panelState, setPanelState,
    showShortcutModal, setShowShortcutModal,
    confirmToggle, setConfirmToggle,
    filters, setFilters,
    sortKey, setSortKey,
    filterFocusIndex, setFilterFocusIndex,
    isFiltered, resetFilters,
    allTags,
    filteredTasks,
    focusedTaskId, setFocusedTaskId,
    selectedIds, clearSelection, toggleOne, toggleAll, deleteSelected,
    deleteTask, duplicateTask, handleQuickUpdate,
    compact, setCompact,
    flashHighlight,
    searchRef,
    isPanelFocused, focusPanel, onAddNew,
    openTagModal,
  ])
}

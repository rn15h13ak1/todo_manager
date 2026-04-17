import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import TaskModal from './components/TaskModal'
import ShortcutModal from './components/ShortcutModal'
import ConfirmModal from './components/ConfirmModal'
import { useTasks } from './hooks/useTasks'

export default function App() {
  const {
    tasks,
    filteredTasks,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    duplicateTask,
    importTasks,
    allTags,
    addTagToTasks,
    removeTagFromTasks,
    isFiltered,
    resetFilters,
  } = useTasks()

  // null = closed, { task: null } = add mode, { task: Task } = edit mode
  const [modalState, setModalState] = useState(null)
  const [showShortcutModal, setShowShortcutModal] = useState(false)
  // c キーの完了トグル確認: null | { id, title, newStatus }
  const [confirmToggle, setConfirmToggle] = useState(null)

  const [compact, setCompact] = useState(false)
  const [highlightedTaskId, setHighlightedTaskId] = useState(null)
  const [focusedTaskId, setFocusedTaskId] = useState(null)
  const [selectionCount, setSelectionCount] = useState(0)
  const clearSelectionRef = useRef(null)
  const toggleOneRef = useRef(null)
  const deleteSelectedRef = useRef(null)
  const toggleAllRef = useRef(null)
  const searchRef = useRef(null)

  // フィルターフォーカス: null=未フォーカス, 0-4=各フィルター要素
  // 0:ステータス 1:優先度 2:タグ 3:ソート 4:期限切れのみ
  const [filterFocusIndex, setFilterFocusIndex] = useState(null)
  const FILTER_COUNT = 5

  // フィルターフォーカス中に j/k で選択肢を移動する
  function moveFilterOption(delta) {
    if (filterFocusIndex === 0) {
      const opts = ['all', 'not_done', 'todo', 'in_progress', 'done']
      const next = Math.max(0, Math.min(opts.length - 1, opts.indexOf(filters.status) + delta))
      setFilters((f) => ({ ...f, status: opts[next] }))
    } else if (filterFocusIndex === 1) {
      const opts = ['all', 'high', 'medium', 'low']
      const next = Math.max(0, Math.min(opts.length - 1, opts.indexOf(filters.priority) + delta))
      setFilters((f) => ({ ...f, priority: opts[next] }))
    } else if (filterFocusIndex === 2) {
      const opts = ['all', ...allTags]
      const next = Math.max(0, Math.min(opts.length - 1, opts.indexOf(filters.tag) + delta))
      setFilters((f) => ({ ...f, tag: opts[next] }))
    } else if (filterFocusIndex === 3) {
      const opts = ['dueDate_asc', 'dueDate_desc', 'priority', 'createdAt']
      const next = Math.max(0, Math.min(opts.length - 1, opts.indexOf(sortKey) + delta))
      setSortKey(opts[next])
    }
    // index 4 (checkbox) は j/k で操作しない
  }

  function handleQuickUpdate(id, updates) {
    updateTask(id, updates)
    setHighlightedTaskId(id)
    setTimeout(() => setHighlightedTaskId((cur) => (cur === id ? null : cur)), 2000)
  }

  // キーボードショートカット
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      // ── ESC: ショートカットモーダルを閉じる ──
      if (e.key === 'Escape' && showShortcutModal) {
        setShowShortcutModal(false)
        return
      }

      // ── ESC: フィルターフォーカス解除 → タスクフォーカス解除 → チェックボックス解除 → フィルターリセット ──
      if (e.key === 'Escape' && modalState === null) {
        if (filterFocusIndex !== null) { setFilterFocusIndex(null); return }
        if (focusedTaskId) { setFocusedTaskId(null); return }
        if (selectionCount > 0) { clearSelectionRef.current?.(); return }
        if (isFiltered) resetFilters()
        return
      }

      // ── f: フィルターフォーカスを循環（入力中・モーダル表示中は無効）──
      if (e.key === 'f' && !isTyping && modalState === null) {
        e.preventDefault()
        setFilterFocusIndex((prev) => prev === null ? 0 : (prev + 1) % FILTER_COUNT)
        setFocusedTaskId(null) // タスクフォーカスは解除
        return
      }

      // ── フィルターフォーカスモード: j/k/Space をフィルター操作に使用 ──
      if (filterFocusIndex !== null) {
        if (e.key === 'j') { e.preventDefault(); moveFilterOption(1); return }
        if (e.key === 'k') { e.preventDefault(); moveFilterOption(-1); return }
        if (e.key === ' ') {
          e.preventDefault()
          if (filterFocusIndex === 4) setFilters((f) => ({ ...f, overdueOnly: !f.overdueOnly }))
          return
        }
        // 上記以外はフィルターフォーカスを抜けずそのまま無視（他キーは通常通り動作させる）
      }

      // ── 以下は入力中・モーダル表示中は無効 ──
      if (isTyping || modalState !== null || showShortcutModal || confirmToggle !== null) return

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
        setCompact((c) => !c)
        return
      }

      // n: タスク追加モーダルを開く
      if (e.key === 'n') {
        e.preventDefault()
        setModalState({ task: null })
        return
      }

      // d: 選択中タスクの一括削除 or フォーカス中タスクの削除
      if (e.key === 'd') {
        if (selectionCount > 0) {
          deleteSelectedRef.current?.()
        } else if (focusedTaskId) {
          const task = filteredTasks.find((t) => t.id === focusedTaskId)
          if (task && window.confirm(`「${task.title}」を削除しますか？`)) {
            deleteTask(focusedTaskId)
            setFocusedTaskId(null)
          }
        }
        return
      }

      // j/k: タスクフォーカス移動（フィルターフォーカスなし時のみ）
      if ((e.key === 'j' || e.key === 'k') && filterFocusIndex === null) {
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

      // Space: フォーカス中タスクのチェックボックスをトグル（フィルターフォーカスなし時のみ）
      if (e.key === ' ' && filterFocusIndex === null && focusedTaskId) {
        e.preventDefault()
        toggleOneRef.current?.(focusedTaskId)
        return
      }

      // c: フォーカス中タスクの完了状態トグル確認ダイアログを表示
      if (e.key === 'c' && focusedTaskId) {
        e.preventDefault()
        const task = filteredTasks.find((t) => t.id === focusedTaskId)
        if (task) {
          const newStatus = task.status === 'done' ? 'todo' : 'done'
          setConfirmToggle({ id: task.id, title: task.title, newStatus })
        }
        return
      }

      // Enter: フォーカス中タスクの編集モーダルを開く
      if (e.key === 'Enter' && focusedTaskId) {
        e.preventDefault()
        const task = filteredTasks.find((t) => t.id === focusedTaskId)
        if (task) {
          setModalState({ task })
          setFocusedTaskId(null)
        }
        return
      }

      // y: フォーカス中タスクを複製
      if (e.key === 'y' && focusedTaskId) {
        e.preventDefault()
        const task = filteredTasks.find((t) => t.id === focusedTaskId)
        if (task) {
          const newId = duplicateTask(task)
          setHighlightedTaskId(newId)
          setTimeout(() => setHighlightedTaskId((cur) => (cur === newId ? null : cur)), 2000)
        }
        return
      }

      // a: 全選択 / 全解除トグル
      if (e.key === 'a') {
        e.preventDefault()
        toggleAllRef.current?.()
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
        const priority = e.key === '1' ? 'high' : e.key === '2' ? 'medium' : 'low'
        handleQuickUpdate(focusedTaskId, { priority })
        return
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [modalState, showShortcutModal, confirmToggle, isFiltered, resetFilters, focusedTaskId, filteredTasks, selectionCount, deleteTask,
      filterFocusIndex, filters, sortKey, allTags, compact])

  function handleSave(formData) {
    if (modalState.task) {
      updateTask(modalState.task.id, formData)
    } else {
      addTask(formData)
    }
    setModalState(null)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-10">
      <Header
        onAdd={() => setModalState({ task: null })}
        allTasks={tasks}
        filteredTasks={filteredTasks}
        onImport={importTasks}
      />
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        sortKey={sortKey}
        setSortKey={setSortKey}
        allTags={allTags}
        isFiltered={isFiltered}
        onReset={resetFilters}
        filterFocusIndex={filterFocusIndex}
        searchRef={searchRef}
      />
      </div>
      <TaskList
        tasks={filteredTasks}
        allTasks={tasks}
        compact={compact}
        onToggleCompact={() => setCompact((c) => !c)}
        allTags={allTags}
        onEdit={(task) => setModalState({ task })}
        onDelete={deleteTask}
        onDeleteMany={deleteTasks}
        onAddTagToMany={addTagToTasks}
        onRemoveTagFromMany={removeTagFromTasks}
        onTagClick={(tag) => setFilters((f) => ({ ...f, tag }))}
        onStatusChange={(id, status) => handleQuickUpdate(id, { status })}
        onPriorityChange={(id, priority) => handleQuickUpdate(id, { priority })}
        onDueDateChange={(id, dueDate) => handleQuickUpdate(id, { dueDate })}
        onTitleChange={(id, title) => handleQuickUpdate(id, { title })}
        onDuplicate={(task) => {
          const newId = duplicateTask(task)
          setHighlightedTaskId(newId)
          setTimeout(() => setHighlightedTaskId((cur) => (cur === newId ? null : cur)), 2000)
        }}
        highlightedTaskId={highlightedTaskId}
        focusedTaskId={focusedTaskId}
        onSelectionChange={setSelectionCount}
        onRegisterClearSelection={(fn) => { clearSelectionRef.current = fn }}
        onRegisterToggleOne={(fn) => { toggleOneRef.current = fn }}
        onRegisterDeleteSelected={(fn) => { deleteSelectedRef.current = fn }}
        onRegisterToggleAll={(fn) => { toggleAllRef.current = fn }}
      />
      {modalState !== null && (
        <TaskModal
          task={modalState.task}
          allTags={allTags}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}
      {showShortcutModal && (
        <ShortcutModal onClose={() => setShowShortcutModal(false)} />
      )}
      {confirmToggle !== null && (
        <ConfirmModal
          message={`「${confirmToggle.title}」を${confirmToggle.newStatus === 'done' ? '完了' : '未着手'}にしますか？`}
          confirmLabel={confirmToggle.newStatus === 'done' ? '完了にする' : '未着手に戻す'}
          onConfirm={() => {
            handleQuickUpdate(confirmToggle.id, { status: confirmToggle.newStatus })
            setConfirmToggle(null)
          }}
          onCancel={() => setConfirmToggle(null)}
        />
      )}
    </div>
  )
}

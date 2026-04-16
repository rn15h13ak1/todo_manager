import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import TaskModal from './components/TaskModal'
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
    importTasks,
    allTags,
    addTagToTasks,
    removeTagFromTasks,
    isFiltered,
    resetFilters,
  } = useTasks()

  // null = closed, { task: null } = add mode, { task: Task } = edit mode
  const [modalState, setModalState] = useState(null)

  const [highlightedTaskId, setHighlightedTaskId] = useState(null)
  const [focusedTaskId, setFocusedTaskId] = useState(null)
  const [selectionCount, setSelectionCount] = useState(0)
  const clearSelectionRef = useRef(null)
  const toggleOneRef = useRef(null)

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

      // ESC: フォーカス解除 → チェックボックス解除 → フィルターリセット の優先順位
      if (e.key === 'Escape' && modalState === null) {
        if (focusedTaskId) {
          setFocusedTaskId(null)
          return
        }
        if (selectionCount > 0) {
          clearSelectionRef.current?.()
          return
        }
        if (isFiltered) resetFilters()
        return
      }

      // n: タスク追加モーダルを開く（入力中・モーダル表示中は無効）
      if (e.key === 'n' && !isTyping && modalState === null) {
        e.preventDefault()
        setModalState({ task: null })
        return
      }

      // j: 次のタスクにフォーカス / k: 前のタスクにフォーカス
      if ((e.key === 'j' || e.key === 'k') && !isTyping && modalState === null) {
        e.preventDefault()
        if (filteredTasks.length === 0) return
        setFocusedTaskId((prev) => {
          const idx = filteredTasks.findIndex((t) => t.id === prev)
          if (e.key === 'j') {
            // 未選択 or 末尾 → 先頭、それ以外 → 次へ
            return idx === -1 || idx === filteredTasks.length - 1
              ? filteredTasks[0].id
              : filteredTasks[idx + 1].id
          } else {
            // 未選択 or 先頭 → 末尾、それ以外 → 前へ
            return idx <= 0
              ? filteredTasks[filteredTasks.length - 1].id
              : filteredTasks[idx - 1].id
          }
        })
        return
      }

      // Space: フォーカス中のタスクのチェックボックスをトグル
      if (e.key === ' ' && !isTyping && modalState === null && focusedTaskId) {
        e.preventDefault()
        toggleOneRef.current?.(focusedTaskId)
        return
      }

      // Enter: フォーカス中のタスクの編集モーダルを開く
      if (e.key === 'Enter' && !isTyping && modalState === null && focusedTaskId) {
        e.preventDefault()
        const task = filteredTasks.find((t) => t.id === focusedTaskId)
        if (task) {
          setModalState({ task })
          setFocusedTaskId(null)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [modalState, isFiltered, resetFilters, focusedTaskId, filteredTasks, selectionCount])

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
      />
      </div>
      <TaskList
        tasks={filteredTasks}
        allTasks={tasks}
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
        highlightedTaskId={highlightedTaskId}
        focusedTaskId={focusedTaskId}
        onSelectionChange={setSelectionCount}
        onRegisterClearSelection={(fn) => { clearSelectionRef.current = fn }}
        onRegisterToggleOne={(fn) => { toggleOneRef.current = fn }}
      />
      {modalState !== null && (
        <TaskModal
          task={modalState.task}
          allTags={allTags}
          onSave={handleSave}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  )
}

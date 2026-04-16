import { useState, useEffect } from 'react'
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

      // ESC: フィルターリセット（モーダルが閉じているときのみ）
      if (e.key === 'Escape' && modalState === null && isFiltered) {
        resetFilters()
      }

      // n: タスク追加モーダルを開く（入力中・モーダル表示中は無効）
      if (e.key === 'n' && !isTyping && modalState === null) {
        e.preventDefault()
        setModalState({ task: null })
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [modalState, isFiltered, resetFilters])

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
        highlightedTaskId={highlightedTaskId}
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

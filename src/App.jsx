import { useState, useRef } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import TaskModal from './components/TaskModal'
import ShortcutModal from './components/ShortcutModal'
import ConfirmModal from './components/ConfirmModal'
import { useTasks } from './hooks/useTasks'
import { useKeyboard } from './hooks/useKeyboard'

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

  function handleQuickUpdate(id, updates) {
    updateTask(id, updates)
    setHighlightedTaskId(id)
    setTimeout(() => setHighlightedTaskId((cur) => (cur === id ? null : cur)), 2000)
  }

  useKeyboard({
    modalState, setModalState,
    showShortcutModal, setShowShortcutModal,
    confirmToggle, setConfirmToggle,
    filters, setFilters,
    sortKey, setSortKey,
    filterFocusIndex, setFilterFocusIndex,
    isFiltered, resetFilters,
    allTags,
    filteredTasks,
    focusedTaskId, setFocusedTaskId,
    selectionCount,
    deleteTask, duplicateTask, handleQuickUpdate,
    compact, setCompact,
    setHighlightedTaskId,
    searchRef, clearSelectionRef, toggleOneRef, deleteSelectedRef, toggleAllRef,
  })

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

import { useState } from 'react'
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
      <Header onAdd={() => setModalState({ task: null })} />
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
        onImport={importTasks}
        onTagClick={(tag) => setFilters((f) => ({ ...f, tag }))}
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

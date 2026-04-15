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
      <Header onAdd={() => setModalState({ task: null })} />
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        sortKey={sortKey}
        setSortKey={setSortKey}
        allTags={allTags}
      />
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

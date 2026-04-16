import { useState } from 'react'
import { Trash2, Tag, X } from 'lucide-react'
import TaskCard from './TaskCard'
import BulkTagModal from './BulkTagModal'

export default function TaskList({
  tasks,
  allTasks,
  allTags,
  onEdit,
  onDelete,
  onDeleteMany,
  onAddTagToMany,
  onRemoveTagFromMany,
  onTagClick,
  onStatusChange,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkTagMode, setBulkTagMode] = useState(null) // null | 'add' | 'remove'

  // フィルター結果が変わったとき、表示外のIDを選択から除外
  const visibleIds = new Set(tasks.map((t) => t.id))
  const validSelected = selectedIds.filter((id) => visibleIds.has(id))
  if (validSelected.length !== selectedIds.length) {
    setSelectedIds(validSelected)
  }

  function toggleOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleAll() {
    setSelectedIds(selectedIds.length > 0 ? [] : tasks.map((t) => t.id))
  }

  function handleDeleteSelected() {
    if (!window.confirm(`選択した ${selectedIds.length} 件のタスクを削除しますか？`)) return
    onDeleteMany(selectedIds)
    setSelectedIds([])
  }

  function handleBulkTagApply(tag) {
    if (bulkTagMode === 'add') onAddTagToMany(selectedIds, tag)
    else onRemoveTagFromMany(selectedIds, tag)
  }

  const allChecked = tasks.length > 0 && selectedIds.length === tasks.length
  const someChecked = selectedIds.length > 0 && selectedIds.length < tasks.length
  const selectedTasks = tasks.filter((t) => selectedIds.includes(t.id))

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {tasks.length === 0 ? (
        <div className="text-center text-gray-400 py-20 text-sm">
          タスクがありません
        </div>
      ) : (
        <>
          {/* 一括操作バー */}
          <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked }}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                />
                {selectedIds.length > 0 ? `${selectedIds.length} 件を選択中` : '全て選択'}
              </label>
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setSelectedIds([])}
                  className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  title="選択を解除"
                >
                  <X size={13} />
                  解除
                </button>
              )}
            </div>
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setBulkTagMode('add')}
                  className="flex items-center gap-1.5 text-sm text-white bg-purple-500 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Tag size={14} />
                  タグを追加
                </button>
                <button
                  onClick={() => setBulkTagMode('remove')}
                  className="flex items-center gap-1.5 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Tag size={14} />
                  タグを削除
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  {selectedIds.length} 件を削除
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedIds.includes(task.id)}
                onToggle={toggleOne}
                onEdit={onEdit}
                onDelete={(id) => {
                  onDelete(id)
                  setSelectedIds((prev) => prev.filter((x) => x !== id))
                }}
                onTagClick={onTagClick}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </>
      )}

      {bulkTagMode && (
        <BulkTagModal
          mode={bulkTagMode}
          selectedTasks={selectedTasks}
          allTags={allTags}
          onApply={handleBulkTagApply}
          onClose={() => setBulkTagMode(null)}
        />
      )}
    </main>
  )
}

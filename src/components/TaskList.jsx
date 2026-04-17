import { useState, useEffect, useCallback, useMemo } from 'react'
import { STATUS } from '../utils/constants'
import { Trash2, Tag, X, LayoutList, AlignJustify, ChevronDown, ChevronRight } from 'lucide-react'
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
  onUpdate,
  onDuplicate,
  highlightedTaskId,
  focusedTaskId,
  compact,
  onToggleCompact,
  selection,
}) {
  const { selectedIds, clearSelection, toggleOne, toggleAll, deleteSelected, removeFromSelection } = selection

  const [bulkTagMode, setBulkTagMode] = useState(null) // null | 'add' | 'remove'
  const [archiveOpen, setArchiveOpen] = useState(false)

  // フォーカスが完了タスクに移動したとき、折りたたみを自動展開する
  useEffect(() => {
    if (focusedTaskId && tasks.some((t) => t.id === focusedTaskId && t.status === STATUS.DONE)) {
      setArchiveOpen(true)
    }
  }, [focusedTaskId, tasks])

  const handleBulkTagApply = useCallback((tag) => {
    if (bulkTagMode === 'add') onAddTagToMany(selectedIds, tag)
    else onRemoveTagFromMany(selectedIds, tag)
  }, [bulkTagMode, onAddTagToMany, onRemoveTagFromMany, selectedIds])

  const handleDelete = useCallback((id) => {
    onDelete(id)
    removeFromSelection(id)
  }, [onDelete, removeFromSelection])

  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== STATUS.DONE), [tasks])
  const doneTasks = useMemo(() => tasks.filter((t) => t.status === STATUS.DONE), [tasks])

  const allChecked = tasks.length > 0 && selectedIds.length === tasks.length
  const someChecked = selectedIds.length > 0 && selectedIds.length < tasks.length
  const selectedTasks = useMemo(
    () => tasks.filter((t) => selectedIds.includes(t.id)),
    [tasks, selectedIds]
  )

  return (
    <main className="px-3">
      {tasks.length === 0 ? (
        <div className="text-center text-gray-400 py-20 text-sm">
          タスクがありません
        </div>
      ) : (
        <>
          {/* 一括操作バー（sticky） */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 -mx-3 px-4 pt-3 pb-2 mb-2 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={onToggleCompact}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 border border-gray-300 hover:border-gray-400 rounded-md px-2 py-1 transition-colors"
              title={compact ? '通常表示に切り替え' : 'コンパクト表示に切り替え'}
            >
              {compact ? <AlignJustify size={13} /> : <LayoutList size={13} />}
              {compact ? '通常' : 'コンパクト'}
            </button>
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
                  onClick={clearSelection}
                  className="flex items-center gap-0.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  title="選択を解除"
                >
                  <X size={13} />
                  解除
                </button>
              )}
            </div>
            {selectedIds.length > 0 && (
              <div className="flex gap-2 flex-wrap">
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
                  onClick={deleteSelected}
                  className="flex items-center gap-1.5 text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  {selectedIds.length} 件を削除
                </button>
              </div>
            )}
          </div>

          {/* アクティブタスク */}
          <div className={`flex flex-col pb-4 ${compact ? 'gap-1' : 'gap-3'}`}>
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedIds.includes(task.id)}
                onToggle={toggleOne}
                onEdit={onEdit}
                onDelete={handleDelete}
                onTagClick={onTagClick}
                onUpdate={onUpdate}
                onDuplicate={onDuplicate}
                highlighted={highlightedTaskId === task.id}
                focused={focusedTaskId === task.id}
                compact={compact}
              />
            ))}
          </div>

          {/* 完了タスク（折りたたみ） */}
          {doneTasks.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setArchiveOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-2"
              >
                {archiveOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                完了済み（{doneTasks.length}件）
              </button>
              {archiveOpen && (
                <div className={`flex flex-col ${compact ? 'gap-1' : 'gap-3'} opacity-70`}>
                  {doneTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      selected={selectedIds.includes(task.id)}
                      onToggle={toggleOne}
                      onEdit={onEdit}
                      onDelete={handleDelete}
                      onTagClick={onTagClick}
                      onUpdate={onUpdate}
                      onDuplicate={onDuplicate}
                      highlighted={highlightedTaskId === task.id}
                      focused={focusedTaskId === task.id}
                      compact={compact}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
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

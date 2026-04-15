import { Pencil, Trash2 } from 'lucide-react'
import { tagColor } from '../utils/tags'

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}
const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' }

const STATUS_BADGE = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
}
const STATUS_LABEL = { todo: '未着手', in_progress: '進行中', done: '完了' }

export default function TaskCard({ task, selected, onToggle, onEdit, onDelete, onTagClick }) {
  const _now = new Date()
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done'

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 flex gap-3 border transition-colors ${
        isOverdue ? 'border-l-4 border-l-red-500 border-gray-200' : 'border-gray-200'
      } ${selected ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-start pt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(task.id)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold flex-1 leading-snug ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
            {task.title}
          </h3>
          <div className="flex gap-1 shrink-0 flex-wrap justify-end">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[task.priority]}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[task.status]}`}>
              {STATUS_LABEL[task.status]}
            </span>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{task.description}</p>
        )}

        {(task.tags || []).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <button
                key={tag}
                onClick={(e) => { e.stopPropagation(); onTagClick?.(tag) }}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag)} hover:opacity-70 hover:ring-1 hover:ring-current transition-opacity cursor-pointer`}
                title={`「${tag}」でフィルター`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {task.dueDate
              ? `期限: ${task.dueDate}${isOverdue ? '（期限切れ）' : ''}`
              : '期限なし'}
          </span>
          <div className="flex gap-4">
            <button
              onClick={() => onEdit(task)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              <Pencil size={12} />
              編集
            </button>
            <button
              onClick={() => {
                if (window.confirm(`「${task.title}」を削除しますか？`)) {
                  onDelete(task.id)
                }
              }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              <Trash2 size={12} />
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

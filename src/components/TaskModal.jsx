import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { tagColor } from '../utils/tags'

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'todo',
  tags: [],
}

export default function TaskModal({ task, allTags, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        tags: task.tags || [],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setTagInput('')
  }, [task])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave(form)
  }

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function addTag(tag) {
    const t = tag.trim()
    if (!t || form.tags.includes(t)) return
    setForm((f) => ({ ...f, tags: [...f.tags, t] }))
    setTagInput('')
  }

  function removeTag(tag) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  const suggestedTags = allTags.filter(
    (t) => !form.tags.includes(t) && t.includes(tagInput)
  )

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">
            {task ? 'タスクを編集' : 'タスクを追加'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="タスクのタイトル"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="説明（任意）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">期限日</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={set('dueDate')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
              <select
                value={form.priority}
                onChange={set('priority')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                value={form.status}
                onChange={set('status')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="done">完了</option>
              </select>
            </div>
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag)}`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:opacity-70"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); addTag(tagInput) }
                }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="タグを入力して Enter"
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                disabled={!tagInput.trim()}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-40 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {/* サジェスト */}
            {tagInput && suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag)} hover:opacity-80`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors font-medium"
            >
              {task ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { tagColor } from '../utils/tags'
import { formatRelativeDate } from '../utils/date'

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
const STATUS_ORDER = ['todo', 'in_progress', 'done']
const PRIORITY_ORDER = ['high', 'medium', 'low']

export default function TaskCard({ task, selected, onToggle, onEdit, onDelete, onTagClick, onStatusChange, onPriorityChange, onDueDateChange, onTitleChange, highlighted, focused, compact }) {
  const _now = new Date()
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done'

  const cardRef = useRef(null)
  // ポップオーバーを外側クリックで閉じた直後にカードクリックが発火しないようにするフラグ
  const blockEditRef = useRef(false)

  // sticky ヘッダー分のオフセットを考慮してカードを見える位置にスクロールする
  function scrollCardIntoView(el) {
    const stickyEl = document.querySelector('.sticky')
    const headerHeight = stickyEl ? stickyEl.getBoundingClientRect().height : 0
    const rect = el.getBoundingClientRect()
    const MARGIN = 8
    if (rect.top < headerHeight + MARGIN) {
      window.scrollTo({ top: window.scrollY + rect.top - headerHeight - MARGIN, behavior: 'smooth' })
    } else if (rect.bottom > window.innerHeight - MARGIN) {
      window.scrollTo({ top: window.scrollY + rect.bottom - window.innerHeight + MARGIN, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (highlighted && cardRef.current) scrollCardIntoView(cardRef.current)
  }, [highlighted])

  useEffect(() => {
    if (focused && cardRef.current) scrollCardIntoView(cardRef.current)
  }, [focused])

  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const statusMenuRef = useRef(null)

  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const priorityMenuRef = useRef(null)

  const [showDueDateMenu, setShowDueDateMenu] = useState(false)
  const dueDateMenuRef = useRef(null)
  const dueDateInputRef = useRef(null)

  // タイトルインライン編集
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef(null)

  useEffect(() => {
    if (!showStatusMenu) return
    function handleClick(e) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setShowStatusMenu(false)
        blockEditRef.current = true
        setTimeout(() => { blockEditRef.current = false }, 0)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showStatusMenu])

  useEffect(() => {
    if (!showPriorityMenu) return
    function handleClick(e) {
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(e.target)) {
        setShowPriorityMenu(false)
        blockEditRef.current = true
        setTimeout(() => { blockEditRef.current = false }, 0)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPriorityMenu])

  useEffect(() => {
    if (!showDueDateMenu) return
    function handleClick(e) {
      if (dueDateMenuRef.current && !dueDateMenuRef.current.contains(e.target)) {
        setShowDueDateMenu(false)
        blockEditRef.current = true
        setTimeout(() => { blockEditRef.current = false }, 0)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showDueDateMenu])

  // いずれかのポップオーバーが開いている間、ESC で閉じる
  useEffect(() => {
    if (!showStatusMenu && !showPriorityMenu && !showDueDateMenu) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setShowStatusMenu(false)
        setShowPriorityMenu(false)
        setShowDueDateMenu(false)
        // App.jsx のフィルターリセット（ESC）が同時に発火しないようにする
        e.stopImmediatePropagation()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showStatusMenu, showPriorityMenu, showDueDateMenu])

  return (
    <div
      ref={cardRef}
      onClick={() => { if (!blockEditRef.current) onEdit(task) }}
      className={`bg-white rounded-lg shadow-sm p-4 flex gap-3 border transition-colors cursor-pointer ${
        isOverdue ? 'border-l-4 border-l-red-500 border-gray-200' : 'border-gray-200'
      } ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'} ${highlighted ? 'task-moved' : ''} ${focused ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
    >
      <div className="flex items-start pt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(task.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation()
                  const trimmed = titleDraft.trim()
                  if (trimmed && trimmed !== task.title) onTitleChange?.(task.id, trimmed)
                  setEditingTitle(false)
                }
                if (e.key === 'Escape') { e.stopPropagation(); setEditingTitle(false) }
              }}
              onBlur={() => {
                const trimmed = titleDraft.trim()
                if (trimmed && trimmed !== task.title) {
                  onTitleChange?.(task.id, trimmed)
                }
                setEditingTitle(false)
              }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`font-semibold flex-1 leading-snug bg-transparent border-b-2 border-blue-400 outline-none ${isOverdue ? 'text-red-600' : 'text-gray-800'} w-full`}
            />
          ) : (
            <h3
              className={`font-semibold flex-1 leading-snug cursor-text ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}
              title="ダブルクリックでタイトルを編集"
              onDoubleClick={(e) => {
                e.stopPropagation()
                blockEditRef.current = true
                setTimeout(() => { blockEditRef.current = false }, 0)
                setTitleDraft(task.title)
                setEditingTitle(true)
                setTimeout(() => titleInputRef.current?.select(), 0)
              }}
            >
              {task.title}
            </h3>
          )}
          <div className="flex gap-1 shrink-0 flex-wrap justify-end">
            <div className="relative" ref={priorityMenuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowPriorityMenu((v) => !v) }}
                className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-current transition-opacity ${PRIORITY_BADGE[task.priority]}`}
                title="クリックで優先度変更"
              >
                {PRIORITY_LABEL[task.priority]}
              </button>
              {showPriorityMenu && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[5rem]">
                  {PRIORITY_ORDER.map((p) => (
                    <button
                      key={p}
                      onClick={(e) => {
                        e.stopPropagation()
                        onPriorityChange?.(task.id, p)
                        setShowPriorityMenu(false)
                      }}
                      className={`w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 transition-colors ${
                        p === task.priority ? 'font-bold' : ''
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${PRIORITY_BADGE[p]}`}>
                        {PRIORITY_LABEL[p]}
                      </span>
                      {p === task.priority && <span className="ml-1 text-gray-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={statusMenuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowStatusMenu((v) => !v) }}
                className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-current transition-opacity ${STATUS_BADGE[task.status]}`}
                title="クリックでステータス変更"
              >
                {STATUS_LABEL[task.status]}
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[6rem]">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation()
                        onStatusChange?.(task.id, s)
                        setShowStatusMenu(false)
                      }}
                      className={`w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 transition-colors ${
                        s === task.status ? 'font-bold' : ''
                      }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[s]}`}>
                        {STATUS_LABEL[s]}
                      </span>
                      {s === task.status && <span className="ml-1 text-gray-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {!compact && task.description && (
          <p className="text-sm text-gray-500 leading-relaxed">{task.description}</p>
        )}

        {!compact && (task.tags || []).length > 0 && (
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

        {!compact && (
        <div className="flex items-center justify-between mt-1">
          <div className="relative" ref={dueDateMenuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDueDateMenu((v) => !v) }}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`text-xs hover:underline cursor-pointer ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}
              title={task.dueDate ? `${task.dueDate}（クリックで期限を変更）` : 'クリックで期限を設定'}
            >
              {task.dueDate
                ? `期限: ${formatRelativeDate(task.dueDate)} (${task.dueDate})${isOverdue ? '（期限切れ）' : ''}`
                : '期限なし'}
            </button>
            {showDueDateMenu && (
              <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex flex-col gap-2 min-w-[11rem]">
                <span className="text-xs text-gray-500 font-medium">期限日</span>
                <input
                  type="date"
                  ref={dueDateInputRef}
                  defaultValue={task.dueDate || ''}
                  className="text-xs border border-gray-300 rounded px-2 py-1 w-full"
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const val = dueDateInputRef.current?.value || null
                      onDueDateChange?.(task.id, val)
                      setShowDueDateMenu(false)
                    }}
                    className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    確定
                  </button>
                  {task.dueDate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDueDateChange?.(task.id, null)
                        setShowDueDateMenu(false)
                      }}
                      className="flex-1 text-xs text-red-500 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      削除
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(task) }}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
            >
              <Pencil size={12} />
              編集
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
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
        )}
      </div>
    </div>
  )
}

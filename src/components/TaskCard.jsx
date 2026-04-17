import { useState, useEffect, useRef, memo } from 'react'
import { Trash2, Copy } from 'lucide-react'
import { tagColor } from '../utils/tags'
import { formatRelativeDate, getTodayString } from '../utils/date'
import { usePopover } from '../hooks/usePopover'
import { PRIORITY_LABEL, PRIORITY_BADGE, PRIORITY_ORDER, STATUS_LABEL, STATUS_BADGE, STATUS_ORDER } from '../utils/labels'
import { STATUS } from '../utils/constants'
import { deleteConfirmMessage } from '../utils/messages'

const TaskCard = memo(function TaskCard({ task, selected, onToggle, onEdit, onDelete, onDuplicate, onTagClick, onUpdate, highlighted, focused, compact }) {
  const today = getTodayString()
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== STATUS.DONE

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
    if ((highlighted || focused) && cardRef.current) scrollCardIntoView(cardRef.current)
  }, [highlighted, focused, compact])

  const statusMenu   = usePopover(blockEditRef)
  const priorityMenu = usePopover(blockEditRef)
  const dueDateMenu  = usePopover(blockEditRef)

  const dueDateInputRef = useRef(null)

  // タイトルインライン編集
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const titleInputRef = useRef(null)

  // いずれかのポップオーバーが開いている間、ESC で閉じる
  useEffect(() => {
    if (!statusMenu.open && !priorityMenu.open && !dueDateMenu.open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        statusMenu.setOpen(false)
        priorityMenu.setOpen(false)
        dueDateMenu.setOpen(false)
        // App.jsx のフィルターリセット（ESC）が同時に発火しないようにする
        e.stopImmediatePropagation()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [statusMenu.open, priorityMenu.open, dueDateMenu.open])

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
                  if (trimmed && trimmed !== task.title) onUpdate?.(task.id, { title: trimmed })
                  setEditingTitle(false)
                }
                if (e.key === 'Escape') { e.stopPropagation(); setEditingTitle(false) }
              }}
              onBlur={() => {
                const trimmed = titleDraft.trim()
                if (trimmed && trimmed !== task.title) {
                  onUpdate?.(task.id, { title: trimmed })
                }
                setEditingTitle(false)
              }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`font-semibold flex-1 leading-snug bg-transparent border-b-2 border-blue-400 outline-none ${isOverdue ? 'text-red-600' : 'text-gray-800'} w-full`}
            />
          ) : (
            <h3
              className={`font-semibold flex-1 leading-snug cursor-text hover:underline decoration-dotted underline-offset-2 ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}
              title="クリックでタイトルを編集"
              onClick={(e) => {
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
            <div className="relative" ref={priorityMenu.ref}>
              <button
                onClick={(e) => { e.stopPropagation(); priorityMenu.setOpen((v) => !v) }}
                className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-current transition-opacity ${PRIORITY_BADGE[task.priority]}`}
                title="クリックで優先度変更"
              >
                {PRIORITY_LABEL[task.priority]}
              </button>
              {priorityMenu.open && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[5rem]">
                  {PRIORITY_ORDER.map((p) => (
                    <button
                      key={p}
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdate?.(task.id, { priority: p })
                        priorityMenu.setOpen(false)
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
            <div className="relative" ref={statusMenu.ref}>
              <button
                onClick={(e) => { e.stopPropagation(); statusMenu.setOpen((v) => !v) }}
                className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-current transition-opacity ${STATUS_BADGE[task.status]}`}
                title="クリックでステータス変更"
              >
                {STATUS_LABEL[task.status]}
              </button>
              {statusMenu.open && (
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[6rem]">
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdate?.(task.id, { status: s })
                        statusMenu.setOpen(false)
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
          <div className="relative" ref={dueDateMenu.ref}>
            <button
              onClick={(e) => { e.stopPropagation(); dueDateMenu.setOpen((v) => !v) }}
              onDoubleClick={(e) => e.stopPropagation()}
              className={`text-xs hover:underline cursor-pointer ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}
              title={task.dueDate ? `${task.dueDate}（クリックで期限を変更）` : 'クリックで期限を設定'}
            >
              {task.dueDate
                ? `期限: ${formatRelativeDate(task.dueDate)} (${task.dueDate})${isOverdue ? '（期限切れ）' : ''}`
                : '期限なし'}
            </button>
            {dueDateMenu.open && (
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
                      onUpdate?.(task.id, { dueDate: val })
                      dueDateMenu.setOpen(false)
                    }}
                    className="flex-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    確定
                  </button>
                  {task.dueDate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdate?.(task.id, { dueDate: null })
                        dueDateMenu.setOpen(false)
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
          <div className="flex gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate?.(task) }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              title="タスクを複製"
            >
              <Copy size={12} />
              複製
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm(deleteConfirmMessage(task.title))) {
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
})

export default TaskCard

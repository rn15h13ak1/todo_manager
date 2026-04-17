import { useState, useRef, useEffect } from 'react'
import { tagColor } from '../utils/tags'
import ModalBackdrop from './ModalBackdrop'

/**
 * タグ追加 / 削除モーダル
 * mode: 'add' | 'remove'
 * currentTags: 対象タスク群が持つタグの和集合（remove 時のサジェスト用）
 * allTags: 全タグ一覧（add 時のサジェスト用）
 */
export default function TagModal({ mode, allTags, currentTags, onConfirm, onClose }) {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const suggestions = mode === 'add'
    ? allTags.filter((t) => !currentTags.includes(t) && t.toLowerCase().includes(input.toLowerCase()))
    : currentTags.filter((t) => t.toLowerCase().includes(input.toLowerCase()))

  function handleConfirm(tag) {
    const t = tag.trim()
    if (!t) return
    onConfirm(t)
    onClose()
  }

  const title = mode === 'add' ? 'タグを追加' : 'タグを削除'
  const placeholder = mode === 'add' ? 'タグ名を入力' : 'タグ名を入力または選択'
  const submitLabel = mode === 'add' ? '追加' : '削除'
  const submitColor = mode === 'add'
    ? 'bg-blue-500 hover:bg-blue-600 text-white'
    : 'bg-red-500 hover:bg-red-600 text-white'

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="px-5 py-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing) return
              if (e.key === 'Enter' && input.trim()) { e.preventDefault(); handleConfirm(input) }
              if (e.key === 'Escape') { e.preventDefault(); onClose() }
            }}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleConfirm(tag)}
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag)} hover:opacity-80 transition-opacity`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          {mode === 'remove' && currentTags.length === 0 && (
            <p className="text-xs text-gray-400 mt-2">対象タスクにタグがありません</p>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg"
          >
            キャンセル
          </button>
          <button
            onClick={() => handleConfirm(input)}
            disabled={!input.trim()}
            className={`text-sm px-3 py-1 rounded-lg disabled:opacity-40 transition-colors ${submitColor}`}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

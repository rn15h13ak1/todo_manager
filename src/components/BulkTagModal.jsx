import { useState } from 'react'
import { X, Plus, ArrowLeft } from 'lucide-react'
import { tagColor } from '../utils/tags'
import ModalBackdrop from './ModalBackdrop'

export default function BulkTagModal({ mode, selectedTasks, allTags, onApply, onClose }) {
  const [input, setInput] = useState('')
  const [pendingTag, setPendingTag] = useState(null)

  // 削除モード: 選択タスクが持つタグの和集合
  const removableTags = [...new Set(selectedTasks.flatMap((t) => t.tags || []))]

  // 追加モード: 入力に一致する既存タグをサジェスト
  const suggestedTags = allTags.filter((t) => t.includes(input))

  function handleAdd() {
    const tag = input.trim()
    if (!tag) return
    setPendingTag(tag)
  }

  function handleConfirm() {
    onApply(pendingTag)
    onClose()
  }

  const title = pendingTag !== null
    ? '確認'
    : mode === 'add'
      ? `タグを一括追加（${selectedTasks.length}件）`
      : `タグを一括削除（${selectedTasks.length}件）`

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ボディ */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {pendingTag !== null ? (
            // 確認ステップ
            <>
              <p className="text-sm text-gray-700">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(pendingTag)} mr-1.5`}>
                  {pendingTag}
                </span>
                を {selectedTasks.length} 件のタスクに
                {mode === 'add' ? '追加' : '削除'}しますか？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingTag(null)}
                  className="flex items-center gap-1.5 flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                >
                  <ArrowLeft size={14} />
                  戻る
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                    mode === 'add' ? 'bg-purple-500 hover:bg-purple-600' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {mode === 'add' ? '追加する' : '削除する'}
                </button>
              </div>
            </>
          ) : mode === 'add' ? (
            // 追加ステップ
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); handleAdd() } }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="タグ名を入力"
                  autoFocus
                />
                <button
                  onClick={handleAdd}
                  disabled={!input.trim()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-40 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {suggestedTags.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1.5">既存のタグから選択</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setPendingTag(tag)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag)} hover:opacity-80 transition-opacity`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                キャンセル
              </button>
            </>
          ) : (
            // 削除ステップ
            <>
              {removableTags.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  選択したタスクにタグがありません
                </p>
              ) : (
                <div>
                  <p className="text-xs text-gray-400 mb-2">削除するタグを選択</p>
                  <div className="flex flex-wrap gap-2">
                    {removableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setPendingTag(tag)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${tagColor(tag)} hover:opacity-80 transition-opacity`}
                      >
                        {tag}
                        <X size={10} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors"
              >
                キャンセル
              </button>
            </>
          )}
        </div>
      </div>
    </ModalBackdrop>
  )
}

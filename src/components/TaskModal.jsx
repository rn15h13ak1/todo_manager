import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { tagColor } from '../utils/tags'
import { STATUS, PRIORITY } from '../utils/constants'
import { PRIORITY_ORDER, PRIORITY_LABEL, STATUS_ORDER, STATUS_LABEL } from '../utils/labels'
import ModalBackdrop from './ModalBackdrop'

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: '',
  priority: PRIORITY.MEDIUM,
  status: STATUS.TODO,
  tags: [],
}

// ナビゲーション項目数: 0=タイトル 1=説明 2=期限日 3=優先度 4=ステータス 5=タグ 6=キャンセル 7=追加/更新
const TOTAL_NAV = 8

export default function TaskModal({ task, allTags, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [navIndex, setNavIndex] = useState(0)
  const [mode, setMode] = useState('nav')   // 'nav' | 'edit'

  const containerRef   = useRef(null)
  const editSnapshotRef = useRef(null)

  // モーダルが開くたびにフォームとナビ状態をリセットしてコンテナをフォーカス
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate || '',
        priority: task.priority || PRIORITY.MEDIUM,
        status: task.status || STATUS.TODO,
        tags: task.tags || [],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setTagInput('')
    setNavIndex(0)
    setMode('nav')
    editSnapshotRef.current = null
    requestAnimationFrame(() => containerRef.current?.focus())
  }, [task])

  function handleSubmit(e) {
    e?.preventDefault()
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

  // ── ナビゲーション ──

  function rowClass(idx) {
    if (navIndex !== idx) return ''
    return mode === 'edit'
      ? 'bg-green-50 ring-1 ring-inset ring-green-200 rounded-lg'
      : 'bg-blue-50 ring-1 ring-inset ring-blue-200 rounded-lg'
  }

  function enterEditMode() {
    const el = containerRef.current?.querySelector(`[data-nav="${navIndex}"]`)
    if (!el) return

    if (el.tagName === 'BUTTON') {
      el.click()
      return
    }

    // React state 全体をスナップショットに保存（DOM値ではなく state を使う）
    editSnapshotRef.current = { form: { ...form }, tagInput }

    setMode('edit')
    el.focus()
    try { if (el.type === 'text' || el.tagName === 'TEXTAREA') el.select() } catch (_) {}
  }

  function confirmEdit() {
    editSnapshotRef.current = null
    setMode('nav')
    requestAnimationFrame(() => containerRef.current?.focus())
  }

  function discardEdit() {
    if (editSnapshotRef.current) {
      // 編集開始時の state に完全復元
      setForm(editSnapshotRef.current.form)
      setTagInput(editSnapshotRef.current.tagInput)
    }
    editSnapshotRef.current = null
    setMode('nav')
    requestAnimationFrame(() => containerRef.current?.focus())
  }

  function handleKeyDown(e) {
    if (e.nativeEvent.isComposing) return

    const activeEl = document.activeElement
    const isTagInput = navIndex === 5
    const isTextarea = activeEl?.tagName === 'TEXTAREA'
    const isSelect   = activeEl?.tagName === 'SELECT'
    const isDate     = activeEl?.tagName === 'INPUT' && activeEl?.type === 'date'

    // ── ナビモード ──
    if (mode === 'nav') {
      if (e.key === 'j') {
        e.preventDefault()
        setNavIndex((i) => (i + 1) % TOTAL_NAV)
        return
      }
      if (e.key === 'k') {
        e.preventDefault()
        setNavIndex((i) => (i - 1 + TOTAL_NAV) % TOTAL_NAV)
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        enterEditMode()
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      return
    }

    // ── 編集モード ──

    // Escape → 変更を破棄してナビモードへ
    if (e.key === 'Escape') {
      e.preventDefault()
      discardEdit()
      return
    }

    // select: j/k でオプション変更、Enter で確定
    if (isSelect) {
      if (e.key === 'j') {
        e.preventDefault()
        activeEl.selectedIndex = Math.min(activeEl.options.length - 1, activeEl.selectedIndex + 1)
        activeEl.dispatchEvent(new Event('change', { bubbles: true }))
        return
      }
      if (e.key === 'k') {
        e.preventDefault()
        activeEl.selectedIndex = Math.max(0, activeEl.selectedIndex - 1)
        activeEl.dispatchEvent(new Event('change', { bubbles: true }))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        confirmEdit()
        return
      }
    }

    // date: j/k で ±1 日、Enter で確定
    if (isDate) {
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault()
        const delta = e.key === 'j' ? 1 : -1
        const base = activeEl.value || new Date().toISOString().slice(0, 10)
        const [y, m, d] = base.split('-').map(Number)
        const dt = new Date(y, m - 1, d + delta)
        const next = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
        setForm((f) => ({ ...f, dueDate: next }))
        return
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        confirmEdit()
        return
      }
    }

    // タグ入力: Enter でタグ追加、空 or Shift+Enter でナビモードへ
    if (isTagInput) {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (tagInput.trim() && !e.shiftKey) {
          addTag(tagInput)   // タグ追加して引き続き編集モード
        } else {
          confirmEdit()      // 空 or Shift+Enter → ナビモードへ
        }
        return
      }
      return  // その他のキーはブラウザデフォルト（文字入力）
    }

    // text input: Enter で確定
    if (!isTextarea && e.key === 'Enter') {
      e.preventDefault()
      confirmEdit()
      return
    }

    // textarea: Shift+Enter で確定（Enter は通常の改行）
    if (isTextarea && e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      confirmEdit()
      return
    }
  }

  const hintText = mode === 'edit'
    ? 'Enter: 確定　Shift+Enter: 確定（textarea）　Esc: 破棄'
    : 'j/k: 移動　Enter: 編集　Esc: 閉じる'

  return (
    <ModalBackdrop onClose={onClose}>
      <div
        ref={containerRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col focus:outline-none"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">
            {task ? 'タスクを編集' : 'タスクを追加'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ヒントバー */}
        <div className={`px-6 py-1.5 border-b text-xs flex justify-between shrink-0 transition-colors ${
          mode === 'edit'
            ? 'bg-green-50 border-green-100'
            : 'bg-blue-50 border-blue-100'
        }`}>
          <span className={`font-medium ${mode === 'edit' ? 'text-green-600' : 'text-blue-500'}`}>
            {mode === 'edit' ? '編集モード' : 'ナビゲーションモード'}
          </span>
          <span className={mode === 'edit' ? 'text-green-400' : 'text-blue-400'}>{hintText}</span>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3 overflow-y-auto">

          {/* 0: タイトル */}
          <div data-navrow="0" className={`-mx-2 px-2 py-1.5 transition-colors ${rowClass(0)}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              data-nav="0"
              type="text"
              value={form.title}
              onChange={set('title')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="タスクのタイトル"
              required
            />
          </div>

          {/* 1: 説明 */}
          <div data-navrow="1" className={`-mx-2 px-2 py-1.5 transition-colors ${rowClass(1)}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              data-nav="1"
              value={form.description}
              onChange={set('description')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="説明（任意）"
            />
          </div>

          {/* 2: 期限日 */}
          <div data-navrow="2" className={`-mx-2 px-2 py-1.5 transition-colors ${rowClass(2)}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">期限日</label>
            <input
              data-nav="2"
              type="date"
              value={form.dueDate}
              onChange={set('dueDate')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            {/* 3: 優先度 */}
            <div data-navrow="3" className={`flex-1 -mx-2 px-2 py-1.5 transition-colors ${rowClass(3)}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
              <select
                data-nav="3"
                value={form.priority}
                onChange={set('priority')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITY_ORDER.map((p) => (
                  <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
                ))}
              </select>
            </div>

            {/* 4: ステータス */}
            <div data-navrow="4" className={`flex-1 -mx-2 px-2 py-1.5 transition-colors ${rowClass(4)}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                data-nav="4"
                value={form.status}
                onChange={set('status')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 5: タグ */}
          <div data-navrow="5" className={`-mx-2 px-2 py-1.5 transition-colors ${rowClass(5)}`}>
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
                data-nav="5"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
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

          {/* 6: キャンセル　7: 追加/更新 */}
          <div className="flex gap-3 pt-1">
            <button
              data-nav="6"
              type="button"
              onClick={onClose}
              className={`flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm transition-colors ${rowClass(6)}`}
            >
              キャンセル
            </button>
            <button
              data-nav="7"
              type="submit"
              className={`flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors font-medium ${rowClass(7)}`}
            >
              {task ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  )
}

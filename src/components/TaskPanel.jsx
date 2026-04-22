import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { X, Plus } from 'lucide-react'
import { tagColor } from '../utils/tags'
import { STATUS, PRIORITY } from '../utils/constants'
import { PRIORITY_ORDER, PRIORITY_LABEL, STATUS_ORDER, STATUS_LABEL } from '../utils/labels'

const EMPTY_FORM = {
  title: '',
  description: '',
  dueDate: '',
  priority: PRIORITY.MEDIUM,
  status: STATUS.TODO,
  tags: [],
}

// ナビゲーション項目数: 0=タイトル 1=説明 2=期限日 3=優先度 4=ステータス 5=タグ
const TOTAL_NAV = 6

export default function TaskPanel({ task, allTags, onSave, onClose, shouldFocus = true, focusTick = 0, onFocusLeft, isActive = true }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [tagInput, setTagInput] = useState('')
  const [navIndex, setNavIndex] = useState(0)
  const [mode, setMode] = useState('nav')   // 'nav' | 'edit'

  const containerRef    = useRef(null)
  const editSnapshotRef = useRef(null)

  // パネルが開くたびにフォームとナビ状態をリセットしてコンテナをフォーカス
  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title       || '',
        description: task.description || '',
        dueDate:     task.dueDate     || '',
        priority:    task.priority    || PRIORITY.MEDIUM,
        status:      task.status      || STATUS.TODO,
        tags:        task.tags        || [],
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setTagInput('')
    setNavIndex(0)
    setMode('nav')
    editSnapshotRef.current = null
    if (shouldFocus) requestAnimationFrame(() => containerRef.current?.focus())
  }, [task])

  // l キーによる右パネルフォーカス要求
  useEffect(() => {
    if (focusTick > 0) requestAnimationFrame(() => containerRef.current?.focus())
  }, [focusTick])

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

  const suggestedTags = useMemo(
    () => allTags.filter((t) => !form.tags.includes(t) && t.includes(tagInput)),
    [allTags, form.tags, tagInput]
  )

  // ── ナビゲーション ──

  // フィールドへの直接クリック・フォーカス時に navIndex と mode を同期する
  function handleFormFocus(e) {
    const navEl = e.target.closest('[data-nav]')
    if (!navEl) return
    const idx = parseInt(navEl.dataset.nav, 10)
    if (!isNaN(idx)) {
      if (navIndex !== idx) {
        // 別フィールドへ移動: 編集中なら現在の内容を確定してから切り替え
        if (mode === 'edit' && form.title.trim()) onSave?.(form)
        editSnapshotRef.current = { form: { ...form }, tagInput }
      }
      setNavIndex(idx)
      setMode('edit')
    }
  }

  // フォーカスがパネル外へ移動したとき編集内容を確定する
  function handleContainerBlur(e) {
    if (mode !== 'edit') return
    if (containerRef.current?.contains(e.relatedTarget)) return
    editSnapshotRef.current = null
    if (form.title.trim()) onSave?.(form)
    setMode('nav')
  }

  function rowClass(idx) {
    if (!isActive || navIndex !== idx) return ''
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

    editSnapshotRef.current = { form: { ...form }, tagInput }

    setMode('edit')
    el.focus()
  }

  function confirmEdit() {
    editSnapshotRef.current = null
    if (form.title.trim()) onSave?.(form)
    setMode('nav')
    requestAnimationFrame(() => containerRef.current?.focus())
  }

  function discardEdit() {
    if (editSnapshotRef.current) {
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
      if (e.key === 'j') { e.preventDefault(); setNavIndex((i) => (i + 1) % TOTAL_NAV); return }
      if (e.key === 'k') { e.preventDefault(); setNavIndex((i) => (i - 1 + TOTAL_NAV) % TOTAL_NAV); return }
      if (e.key === 'h' || e.key === 'Escape') { e.preventDefault(); onFocusLeft?.(); return }
      if (e.key === 'Enter' || e.key === 'i') { e.preventDefault(); enterEditMode(); return }
      return
    }

    // ── 編集モード ──

    if (e.key === 'Escape') { e.preventDefault(); discardEdit(); return }

    if (isSelect) {
      if (e.key === 'l') {
        e.preventDefault()
        activeEl.selectedIndex = Math.min(activeEl.options.length - 1, activeEl.selectedIndex + 1)
        activeEl.dispatchEvent(new Event('change', { bubbles: true }))
        return
      }
      if (e.key === 'h') {
        e.preventDefault()
        activeEl.selectedIndex = Math.max(0, activeEl.selectedIndex - 1)
        activeEl.dispatchEvent(new Event('change', { bubbles: true }))
        return
      }
      if (e.key === 'Enter') { e.preventDefault(); confirmEdit(); return }
    }

    if (isDate) {
      if (e.key === 'l' || e.key === 'h') {
        e.preventDefault()
        const delta = e.key === 'l' ? 1 : -1
        const base = activeEl.value || new Date().toISOString().slice(0, 10)
        const [y, m, d] = base.split('-').map(Number)
        const dt = new Date(y, m - 1, d + delta)
        const next = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
        setForm((f) => ({ ...f, dueDate: next }))
        return
      }
      if (e.key === 'Enter') { e.preventDefault(); confirmEdit(); return }
    }

    if (isTagInput) {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (tagInput.trim() && !e.shiftKey) {
          addTag(tagInput)
        } else {
          confirmEdit()
        }
        return
      }
      return
    }

    if (!isTextarea && e.key === 'Enter') { e.preventDefault(); confirmEdit(); return }
    if (isTextarea && e.key === 'Enter' && e.shiftKey) { e.preventDefault(); confirmEdit(); return }
  }

  const hintText = mode === 'edit'
    ? 'Enter: 確定　Shift+Enter: 確定（textarea）　h/l: 選択肢変更　Esc: 破棄'
    : 'h/Esc: 左パネルへ　j/k: 移動　Enter/i: 編集'

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onBlur={handleContainerBlur}
      className="h-full flex flex-col bg-white focus:outline-none"
    >
      {/* ヒントバー */}
      {isActive ? (
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
      ) : (
        <div className="px-6 py-1.5 border-b border-gray-100 bg-gray-50 text-xs flex justify-between shrink-0">
          <span className="font-medium text-gray-400">非アクティブ</span>
          <span className="text-gray-300">l: このパネルへ</span>
        </div>
      )}

      {/* フォーム（スクロール可） */}
      <form onSubmit={handleSubmit} onFocus={handleFormFocus} className="px-6 py-5 flex flex-col gap-3 overflow-y-auto flex-1">

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
            rows={4}
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
                  <button type="button" onClick={() => removeTag(tag)} className="hover:opacity-70">
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

      </form>
    </div>
  )
}

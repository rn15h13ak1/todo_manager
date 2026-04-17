import { useState, useEffect } from 'react'
import { loadPresets, savePresets } from '../utils/storage'
import { FILTER_STATUS, STATUS, SORT_KEY } from '../utils/constants'
import { PRIORITY_ORDER, PRIORITY_LABEL } from '../utils/labels'
import { usePopover } from '../hooks/usePopover'

// フィルターフォーカスインデックス: 0=ステータス 1=優先度 2=タグ 3=ソート 4=期限切れのみ
const FILTER_FOCUS_RING = 'ring-2 ring-blue-500 outline-none'

export default function FilterBar({ filters, setFilters, sortKey, setSortKey, allTags, isFiltered, onReset, filterFocusIndex, searchRef }) {
  const fi = filterFocusIndex  // 短縮

  const [presets, setPresets] = useState(() => loadPresets())
  const { open: showPresetMenu, setOpen: setShowPresetMenu, ref: presetMenuRef } = usePopover()
  const [savingName, setSavingName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)

  useEffect(() => {
    savePresets(presets)
  }, [presets])

  // メニューが閉じたとき保存フォームもリセット
  useEffect(() => {
    if (!showPresetMenu) { setShowSaveForm(false); setSavingName('') }
  }, [showPresetMenu])

  function applyPreset(preset) {
    setFilters(preset.filters)
    setSortKey(preset.sortKey)
    setShowPresetMenu(false)
  }

  function savePreset() {
    const name = savingName.trim()
    if (!name) return
    const preset = {
      id: crypto.randomUUID(),
      name,
      filters: { ...filters },
      sortKey,
    }
    setPresets((prev) => [...prev, preset])
    setSavingName('')
    setShowSaveForm(false)
    setShowPresetMenu(false)
  }

  function deletePreset(id) {
    setPresets((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center">
        {/* 検索欄 */}
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <input
            ref={searchRef}
            type="text"
            value={filters.searchText}
            onChange={(e) => setFilters((f) => ({ ...f, searchText: e.target.value }))}
            placeholder="🔍 タイトル・説明を検索"
            className="text-sm border border-gray-300 rounded-md px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => {
              // Esc / Enter でフォーカスを外す（検索テキストは維持、j/k 操作に戻れる）
              if (e.key === 'Escape' || e.key === 'Enter') {
                e.stopPropagation()
                searchRef.current?.blur()
              }
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">ステータス</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className={`text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 ${fi === 0 ? FILTER_FOCUS_RING : ''}`}
          >
            <option value={FILTER_STATUS.ALL}>すべて</option>
            <option value={FILTER_STATUS.NOT_DONE}>完了以外</option>
            <option value={STATUS.TODO}>未着手</option>
            <option value={STATUS.IN_PROGRESS}>進行中</option>
            <option value={STATUS.DONE}>完了</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">優先度</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            className={`text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 ${fi === 1 ? FILTER_FOCUS_RING : ''}`}
          >
            <option value={FILTER_STATUS.ALL}>すべて</option>
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">タグ</label>
          <select
            value={filters.tag}
            onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
            className={`text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 ${fi === 2 ? FILTER_FOCUS_RING : ''}`}
          >
            <option value={FILTER_STATUS.ALL}>すべて</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">ソート</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className={`text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 ${fi === 3 ? FILTER_FOCUS_RING : ''}`}
          >
            <option value={SORT_KEY.DUE_DATE_ASC}>期限日（昇順）</option>
            <option value={SORT_KEY.DUE_DATE_DESC}>期限日（降順）</option>
            <option value={SORT_KEY.PRIORITY}>優先度</option>
            <option value={SORT_KEY.CREATED_AT}>作成日（新しい順）</option>
          </select>
        </div>

        <label className={`flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none rounded px-1 ${fi === 4 ? FILTER_FOCUS_RING : ''}`}>
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => setFilters((f) => ({ ...f, overdueOnly: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
          />
          期限切れのみ
        </label>

        {/* プリセットメニュー */}
        <div className="relative" ref={presetMenuRef}>
          <button
            onClick={() => setShowPresetMenu((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 border border-gray-300 hover:border-gray-400 rounded-md px-2.5 py-1 transition-colors"
            title="フィルタープリセット"
          >
            ☆ プリセット{presets.length > 0 ? ` (${presets.length})` : ''}
          </button>
          {showPresetMenu && (
            <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[14rem] py-1">
              {presets.length === 0 && !showSaveForm && (
                <p className="text-xs text-gray-400 px-3 py-2">保存済みプリセットはありません</p>
              )}
              {presets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 group">
                  <button
                    onClick={() => applyPreset(preset)}
                    className="text-sm text-gray-700 hover:text-blue-600 flex-1 text-left"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="text-xs text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                    title="削除"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="border-t border-gray-100 mt-1 pt-1 px-3 pb-2">
                {!showSaveForm ? (
                  <button
                    onClick={() => setShowSaveForm(true)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    ＋ 現在の条件を保存
                  </button>
                ) : (
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      autoFocus
                      type="text"
                      value={savingName}
                      onChange={(e) => setSavingName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') savePreset(); if (e.key === 'Escape') setShowSaveForm(false) }}
                      placeholder="プリセット名"
                      className="text-xs border border-gray-300 rounded px-2 py-1 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                      onClick={savePreset}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      保存
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 border border-gray-300 hover:border-gray-400 rounded-md px-2.5 py-1 transition-colors"
          >
            ✕ フィルターをリセット
          </button>
        )}
      </div>
    </div>
  )
}

export default function FilterBar({ filters, setFilters, sortKey, setSortKey, allTags, isFiltered, onReset }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">ステータス</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">すべて</option>
            <option value="not_done">完了以外</option>
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="done">完了</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">優先度</label>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">すべて</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 whitespace-nowrap">タグ</label>
          <select
            value={filters.tag}
            onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">すべて</option>
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
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="dueDate_asc">期限日（昇順）</option>
            <option value="dueDate_desc">期限日（降順）</option>
            <option value="priority">優先度</option>
            <option value="createdAt">作成日（新しい順）</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={(e) => setFilters((f) => ({ ...f, overdueOnly: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
          />
          期限切れのみ
        </label>

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

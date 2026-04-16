export default function ShortcutModal({ onClose }) {
  const sections = [
    {
      title: '全般',
      shortcuts: [
        { key: 'n', desc: 'タスク追加モーダルを開く' },
        { key: '/', desc: '検索欄にフォーカス（Esc または Enter で解除 → j/k 操作に戻る）' },
        { key: '?', desc: 'このショートカット一覧を表示' },
        { key: 'Esc', desc: 'フィルターフォーカス解除 → タスクフォーカス解除 → 選択解除 → フィルターリセット' },
      ],
    },
    {
      title: 'タスク操作',
      shortcuts: [
        { key: 'j', desc: '次のタスクにフォーカス' },
        { key: 'k', desc: '前のタスクにフォーカス' },
        { key: 'Enter', desc: 'フォーカス中タスクの編集モーダルを開く（タイトル以外をクリックでも開く）' },
        { key: 'c', desc: 'フォーカス中タスクの完了状態をトグル（完了 ↔ 未着手）' },
        { key: 'Space', desc: 'フォーカス中タスクのチェックボックスをトグル' },
        { key: 'd', desc: '選択中タスクの一括削除 または フォーカス中タスクの削除' },
      ],
    },
    {
      title: 'フィルター操作',
      shortcuts: [
        { key: 'f', desc: 'フィルター項目を循環（ステータス→優先度→タグ→ソート→期限切れのみ）' },
        { key: 'j / k', desc: 'フィルターフォーカス中：選択肢を切り替え' },
        { key: 'Space', desc: 'フィルターフォーカス中：「期限切れのみ」チェックボックスをトグル' },
      ],
    },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">キーボードショートカット</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto max-h-[70vh] space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.shortcuts.map(({ key, desc }) => (
                  <div key={key} className="flex items-start gap-3">
                    <kbd className="shrink-0 inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 text-xs font-mono font-semibold bg-gray-100 border border-gray-300 rounded text-gray-700">
                      {key}
                    </kbd>
                    <span className="text-sm text-gray-700 leading-5">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-right">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

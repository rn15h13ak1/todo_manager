import ModalBackdrop from './ModalBackdrop'

export default function ShortcutModal({ onClose }) {
  const sections = [
    {
      title: '全般',
      shortcuts: [
        { key: 'n', desc: '新規タスクを作成して右パネルで編集' },
        { key: 'v', desc: 'コンパクト / 通常表示を切り替え' },
        { key: '/', desc: '検索窓にフォーカス（Enter で確定して左パネルへ戻る）' },
        { key: '?', desc: 'このショートカット一覧を表示' },
        { key: 'Esc', desc: 'フィルターモード解除 → 選択解除 → フィルターリセット' },
      ],
    },
    {
      title: '左パネル（タスク一覧）',
      shortcuts: [
        { key: 'j', desc: '次のタスクにフォーカス' },
        { key: 'k', desc: '前のタスクにフォーカス' },
        { key: 'g', desc: '先頭タスクへジャンプ' },
        { key: 'G', desc: '末尾タスクへジャンプ' },
        { key: 'Enter', desc: '右パネルにフォーカスを移動' },
        { key: 'l', desc: '右パネルにフォーカスを移動' },
        { key: 'c', desc: 'フォーカス中タスクの完了状態をトグル（完了 ↔ 未着手）' },
        { key: '1 / 2 / 3', desc: 'フォーカス中タスクの優先度を 高 / 中 / 低 に変更' },
        { key: 'y', desc: 'フォーカス中タスクを複製' },
        { key: 'Space', desc: 'フォーカス中タスクのチェックボックスをトグル' },
        { key: 'a', desc: '全タスクを選択 / 全解除' },
        { key: 'd', desc: '選択中タスクを一括削除 / フォーカス中タスクを削除' },
        { key: 't', desc: '選択中タスクにタグを一括追加 / フォーカス中タスクにタグを追加' },
        { key: 'T', desc: '選択中タスクからタグを一括削除 / フォーカス中タスクからタグを削除' },
      ],
    },
    {
      title: '右パネル — ナビゲーションモード',
      shortcuts: [
        { key: 'j', desc: '次の項目へ移動' },
        { key: 'k', desc: '前の項目へ移動' },
        { key: 'Enter / i', desc: '編集モードに切り替え' },
        { key: 'h / Esc', desc: '左パネルにフォーカスを戻す' },
      ],
    },
    {
      title: '右パネル — 編集モード',
      shortcuts: [
        { key: 'Enter', desc: '確定してナビゲーションモードへ（textarea は Shift+Enter）' },
        { key: 'h / l', desc: 'プルダウン・日付の値を前 / 次に変更' },
        { key: 'Esc', desc: '変更を破棄してナビゲーションモードへ' },
      ],
    },
    {
      title: 'フィルター操作',
      shortcuts: [
        { key: 'f', desc: 'フィルターモードのトグル（再押しで左パネルへ戻る）' },
        { key: 'j / k', desc: 'フィルター項目間を移動（循環）' },
        { key: 'h / l', desc: '現在項目の値を前 / 次に変更' },
        { key: 'Space', desc: '「期限切れのみ」チェックボックスのオン / オフ' },
      ],
    },
  ]

  return (
    <ModalBackdrop onClose={onClose} className="">
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
    </ModalBackdrop>
  )
}

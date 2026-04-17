/** 優先度の日本語ラベル */
export const PRIORITY_LABEL = { high: '高', medium: '中', low: '低' }

/** ステータスの日本語ラベル */
export const STATUS_LABEL = { todo: '未着手', in_progress: '進行中', done: '完了' }

/** 優先度バッジの Tailwind クラス */
export const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
}

/** ステータスバッジの Tailwind クラス */
export const STATUS_BADGE = {
  todo: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
}

/** 優先度の表示順（ドロップダウン・ポップオーバー用） */
export const PRIORITY_ORDER = ['high', 'medium', 'low']

/** ステータスの表示順（ドロップダウン・ポップオーバー用） */
export const STATUS_ORDER = ['todo', 'in_progress', 'done']

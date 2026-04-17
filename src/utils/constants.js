/** タスクのハイライト（複製・更新時の黄色フラッシュ）を消去するまでの時間（ms） */
export const HIGHLIGHT_DURATION_MS = 2000

/** ステータス値の定数 */
export const STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
}

/** ステータスフィルター専用の追加値（タスクの status フィールドには存在しない） */
export const FILTER_STATUS = {
  ALL: 'all',
  NOT_DONE: 'not_done',
}

/** 優先度値の定数 */
export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

/** ソートキーの定数 */
export const SORT_KEY = {
  DUE_DATE_ASC:  'dueDate_asc',
  DUE_DATE_DESC: 'dueDate_desc',
  PRIORITY:      'priority',
  CREATED_AT:    'createdAt',
}

/** FilterBar のフィルター項目数（0:ステータス 1:優先度 2:タグ 3:ソート 4:期限切れのみ） */
export const FILTER_COUNT = 5

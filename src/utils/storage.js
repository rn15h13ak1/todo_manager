const STORAGE_KEY  = 'todo-manager-tasks'
const PRESETS_KEY  = 'todo-manager-presets'
const COMPACT_KEY  = 'todo-manager-compact'

export function loadTasks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('[storage] タスクの読み込みに失敗しました:', e)
    return []
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('[storage] タスクの保存に失敗しました:', e)
  }
}

export function loadPresets() {
  try {
    const data = localStorage.getItem(PRESETS_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('[storage] プリセットの読み込みに失敗しました:', e)
    return []
  }
}

export function savePresets(presets) {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch (e) {
    console.error('[storage] プリセットの保存に失敗しました:', e)
  }
}

export function loadCompact() {
  try {
    const data = localStorage.getItem(COMPACT_KEY)
    return data ? JSON.parse(data) : false
  } catch (e) {
    console.error('[storage] コンパクト設定の読み込みに失敗しました:', e)
    return false
  }
}

export function saveCompact(compact) {
  try {
    localStorage.setItem(COMPACT_KEY, JSON.stringify(compact))
  } catch (e) {
    console.error('[storage] コンパクト設定の保存に失敗しました:', e)
  }
}

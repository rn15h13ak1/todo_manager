import { useState, useRef, useCallback, useEffect } from 'react'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import TaskList from './components/TaskList'
import TaskPanel from './components/TaskPanel'
import ShortcutModal from './components/ShortcutModal'
import ConfirmModal from './components/ConfirmModal'
import TagModal from './components/TagModal'
import ChangelogModal from './components/ChangelogModal'
import { useTasks } from './hooks/useTasks'
import { useKeyboard } from './hooks/useKeyboard'
import { useSelection } from './hooks/useSelection'
import { useHighlight } from './hooks/useHighlight'
import { STATUS, PRIORITY } from './utils/constants'
import LeftPanelIndicator from './components/LeftPanelIndicator'

export default function App() {
  const {
    tasks,
    filteredTasks,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    duplicateTask,
    importTasks,
    allTags,
    addTagToTasks,
    removeTagFromTasks,
    isFiltered,
    resetFilters,
  } = useTasks()

  // null = closed, { task: null } = add mode, { task: Task } = edit mode
  const [panelState, setPanelState] = useState(null)
  const [showShortcutModal, setShowShortcutModal] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  // c キーの完了トグル確認: null | { id, title, newStatus }
  const [confirmToggle, setConfirmToggle] = useState(null)
  // t/T キーのタグ操作: null | { mode: 'add'|'remove', taskIds: string[], currentTags: string[] }
  const [tagModalState, setTagModalState] = useState(null)

  const [compact, setCompact] = useState(false)
  const { highlightedTaskId, flashHighlight } = useHighlight()
  const [focusedTaskId, setFocusedTaskId] = useState(null)
  const searchRef = useRef(null)
  const leftPanelRef = useRef(null)
  const [panelFocusTick, setPanelFocusTick] = useState(0)
  const [isPanelFocused, setIsPanelFocused] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const initialFocusSet = useRef(false)

  const {
    selectedIds,
    clearSelection,
    toggleOne,
    toggleAll,
    deleteSelected,
    removeFromSelection,
  } = useSelection(filteredTasks, deleteTasks)

  // フィルターフォーカス: null=未フォーカス, 0-4=各フィルター要素
  // 0:ステータス 1:優先度 2:タグ 3:ソート 4:期限切れのみ
  const [filterFocusIndex, setFilterFocusIndex] = useState(null)

  const handleQuickUpdate = useCallback((id, updates) => {
    updateTask(id, updates)
    flashHighlight(id)
  }, [updateTask, flashHighlight])

  const handleDuplicate = useCallback((task) => {
    const newId = duplicateTask(task)
    flashHighlight(newId)
  }, [duplicateTask, flashHighlight])

  const handleTagClick = useCallback((tag) => {
    setFilters((f) => ({ ...f, tag }))
  }, [setFilters])

  const openTagModal = useCallback((mode, taskIds) => {
    const currentTags = [...new Set(taskIds.flatMap((id) => tasks.find((t) => t.id === id)?.tags ?? []))]
    setTagModalState({ mode, taskIds, currentTags })
  }, [tasks])

  // 新規タスクを即時作成してフォーカス
  const handleAddNew = useCallback(() => {
    const newTask = addTask({
      title: '新しいタスク',
      description: '',
      dueDate: '',
      priority: PRIORITY.MEDIUM,
      status: STATUS.TODO,
      tags: [],
    })
    setFocusedTaskId(newTask.id)
    setPanelState({ task: newTask, noFocus: false })
  }, [addTask])

  useKeyboard({
    panelState, setPanelState,
    showShortcutModal, setShowShortcutModal,
    confirmToggle, setConfirmToggle,
    filters, setFilters,
    sortKey, setSortKey,
    filterFocusIndex, setFilterFocusIndex,
    isFiltered, resetFilters,
    allTags,
    filteredTasks,
    focusedTaskId, setFocusedTaskId,
    selectedIds, clearSelection, toggleOne, toggleAll, deleteSelected,
    deleteTask, duplicateTask, handleQuickUpdate,
    compact, setCompact,
    flashHighlight,
    searchRef,
    isPanelFocused,
    openTagModal,
    focusPanel: () => setPanelFocusTick((t) => t + 1),
    onAddNew: handleAddNew,
  })

  // 初期表示: タスクが0件なら1件自動作成、それ以外は最初のタスクへ自動フォーカス
  useEffect(() => {
    if (initialFocusSet.current) return
    if (tasks.length === 0) {
      initialFocusSet.current = true
      const newTask = addTask({
        title: '新しいタスク',
        description: '',
        dueDate: '',
        priority: PRIORITY.MEDIUM,
        status: STATUS.TODO,
        tags: [],
      })
      setFocusedTaskId(newTask.id)
      setPanelState({ task: newTask, noFocus: true })
    } else if (filteredTasks.length > 0) {
      initialFocusSet.current = true
      setFocusedTaskId(filteredTasks[0].id)
    }
  }, [tasks.length, filteredTasks.length])

  // j/k フォーカス移動時に右パネルへ自動表示（フォーカスは左パネルに残す）
  useEffect(() => {
    if (!focusedTaskId) return
    const task = filteredTasks.find((t) => t.id === focusedTaskId)
    if (task) setPanelState({ task, noFocus: true })
  }, [focusedTaskId])

  // フィールド確定時の個別保存（パネルは閉じない）
  const handleSave = useCallback((formData) => {
    if (panelState?.task) updateTask(panelState.task.id, formData)
  }, [panelState, updateTask])

  // Header / FilterBar / TaskPanel へ渡す安定した callbacks
  const handleShowChangelog  = useCallback(() => setShowChangelog(true), [])
  const handleSearchFocus    = useCallback(() => setIsSearchFocused(true), [])
  const handleSearchBlur     = useCallback(() => setIsSearchFocused(false), [])
  const handleSearchConfirm  = useCallback(() => { setIsSearchFocused(false); leftPanelRef.current?.focus() }, [])
  const handleToggleCompact  = useCallback(() => setCompact((c) => !c), [])
  const handleEditTask       = useCallback((task) => setPanelState({ task }), [])
  const handleFocusLeft      = useCallback(() => leftPanelRef.current?.focus(), [])
  const handlePanelFocus     = useCallback(() => setIsPanelFocused(true), [])
  const handlePanelBlur      = useCallback(() => setIsPanelFocused(false), [])

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-gray-100">
      <div id="app-header" className="shrink-0 z-10">
        <Header
          onAdd={handleAddNew}
          allTasks={tasks}
          filteredTasks={filteredTasks}
          onImport={importTasks}
          onShowChangelog={handleShowChangelog}
        />
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          sortKey={sortKey}
          setSortKey={setSortKey}
          allTags={allTags}
          isFiltered={isFiltered}
          onReset={resetFilters}
          filterFocusIndex={filterFocusIndex}
          searchRef={searchRef}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          onSearchConfirm={handleSearchConfirm}
        />
      </div>
      <div className="flex flex-1 min-h-0 isolate">
        {/* 左パネル: タスク一覧 */}
        <div ref={leftPanelRef} tabIndex={-1} className={`flex-col w-full md:w-80 lg:w-96 shrink-0 border-r border-gray-200 bg-white overflow-hidden focus:outline-none ${panelState !== null ? 'hidden md:flex' : 'flex'}`}>
          {/* フォーカスインジケーター（右パネルが開いているときのみ表示） */}
          <LeftPanelIndicator
            show={panelState !== null}
            isSearchFocused={isSearchFocused}
            isPanelFocused={isPanelFocused}
            filterFocusIndex={filterFocusIndex}
          />
          <div className="flex-1 overflow-y-auto min-h-0 [scroll-padding-top:56px]">
          <TaskList
            tasks={filteredTasks}
            allTasks={tasks}
            compact={compact}
            onToggleCompact={handleToggleCompact}
            allTags={allTags}
            onEdit={handleEditTask}
            onDelete={deleteTask}
            onDeleteMany={deleteTasks}
            onAddTagToMany={addTagToTasks}
            onRemoveTagFromMany={removeTagFromTasks}
            onTagClick={handleTagClick}
            onUpdate={handleQuickUpdate}
            onDuplicate={handleDuplicate}
            highlightedTaskId={highlightedTaskId}
            focusedTaskId={focusedTaskId}
            selection={{ selectedIds, clearSelection, toggleOne, toggleAll, deleteSelected, removeFromSelection }}
          />
          </div>
        </div>
        {/* 右パネル: タスク詳細 / 追加 */}
        <div
          className={`flex-1 flex-col overflow-y-auto bg-gray-50 ${panelState !== null ? 'flex' : 'hidden md:flex'}`}
          onFocus={handlePanelFocus}
          onBlur={handlePanelBlur}
        >
          {panelState !== null ? (
            <TaskPanel
              task={panelState.task}
              allTags={allTags}
              onSave={handleSave}
              onClose={() => setPanelState(null)}
              shouldFocus={!panelState.noFocus}
              focusTick={panelFocusTick}
              onFocusLeft={handleFocusLeft}
              isActive={isPanelFocused}
            />
          ) : (
            <div className="hidden md:flex items-center justify-center h-full text-gray-400 text-sm select-none">
              タスクを選択してください
            </div>
          )}
        </div>
      </div>
      {showChangelog && (
        <ChangelogModal onClose={() => setShowChangelog(false)} />
      )}
      {showShortcutModal && (
        <ShortcutModal onClose={() => setShowShortcutModal(false)} />
      )}
      {confirmToggle !== null && (
        <ConfirmModal
          message={`「${confirmToggle.title}」を${confirmToggle.newStatus === STATUS.DONE ? '完了' : '未着手'}にしますか？`}
          confirmLabel={confirmToggle.newStatus === STATUS.DONE ? '完了にする' : '未着手に戻す'}
          onConfirm={() => {
            handleQuickUpdate(confirmToggle.id, { status: confirmToggle.newStatus })
            setConfirmToggle(null)
          }}
          onCancel={() => setConfirmToggle(null)}
        />
      )}
      {tagModalState !== null && (
        <TagModal
          mode={tagModalState.mode}
          allTags={allTags}
          currentTags={tagModalState.currentTags}
          onConfirm={(tag) => {
            if (tagModalState.mode === 'add') addTagToTasks(tagModalState.taskIds, tag)
            else removeTagFromTasks(tagModalState.taskIds, tag)
          }}
          onClose={() => setTagModalState(null)}
        />
      )}
    </div>
  )
}

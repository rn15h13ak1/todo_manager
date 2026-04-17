import { memo, useMemo } from 'react'
import { PlusCircle, ClipboardList } from 'lucide-react'
import HamburgerMenu from './HamburgerMenu'
import { STATUS } from '../utils/constants'

const Header = memo(function Header({ onAdd, allTasks, filteredTasks, onImport, onShowChangelog }) {
  const { todoCount, inProgressCount, doneCount } = useMemo(() => ({
    todoCount:       allTasks.filter((t) => t.status === STATUS.TODO).length,
    inProgressCount: allTasks.filter((t) => t.status === STATUS.IN_PROGRESS).length,
    doneCount:       allTasks.filter((t) => t.status === STATUS.DONE).length,
  }), [allTasks])

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <ClipboardList className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold text-gray-800">todo-manager</h1>
          <button
            onClick={onShowChangelog}
            className="text-xs text-gray-400 font-mono hover:text-blue-500 transition-colors"
          >
            v{__APP_VERSION__}
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
            <span className="text-gray-500">未着手</span>
            <span className="font-semibold text-gray-700">{todoCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-gray-500">進行中</span>
            <span className="font-semibold text-blue-700">{inProgressCount}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-gray-500">完了</span>
            <span className="font-semibold text-green-700">{doneCount}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <PlusCircle size={16} />
            タスク追加
          </button>
          <HamburgerMenu
            allTasks={allTasks}
            filteredTasks={filteredTasks}
            onImport={onImport}
          />
        </div>
      </div>
    </header>
  )
})

export default Header

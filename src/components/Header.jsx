import { useState } from 'react'
import { PlusCircle, ClipboardList } from 'lucide-react'
import ChangelogModal from './ChangelogModal'
import HamburgerMenu from './HamburgerMenu'

export default function Header({ onAdd, allTasks, filteredTasks, onImport }) {
  const [showChangelog, setShowChangelog] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold text-gray-800">todo-manager</h1>
          <button
            onClick={() => setShowChangelog(true)}
            className="text-xs text-gray-400 font-mono hover:text-blue-500 transition-colors"
          >
            v{__APP_VERSION__}
          </button>
        </div>
        {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
        <div className="flex items-center gap-2">
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
}

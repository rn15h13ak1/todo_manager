import { useRef } from 'react'
import { FileDown, FileUp } from 'lucide-react'
import TaskCard from './TaskCard'
import { exportJson } from '../utils/exportJson'
import { exportHtml } from '../utils/exportHtml'

export default function TaskList({ tasks, allTasks, onEdit, onDelete, onImport }) {
  const fileInputRef = useRef(null)

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        if (!Array.isArray(imported)) throw new Error('配列ではありません')
        onImport(imported)
      } catch {
        alert('JSONファイルの読み込みに失敗しました。正しい形式のファイルを選択してください。')
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      {tasks.length === 0 ? (
        <div className="text-center text-gray-400 py-20 text-sm">
          タスクがありません
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          <FileUp size={16} />
          JSONをインポート
        </button>
        <button
          onClick={() => exportJson(allTasks)}
          disabled={allTasks.length === 0}
          className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
        >
          <FileDown size={16} />
          JSONでエクスポート
        </button>
        <button
          onClick={() => exportHtml(tasks)}
          disabled={tasks.length === 0}
          className="flex items-center gap-2 bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
        >
          <FileDown size={16} />
          HTMLでエクスポート
        </button>
      </div>
    </main>
  )
}

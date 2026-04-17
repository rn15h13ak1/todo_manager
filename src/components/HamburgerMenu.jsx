import { useRef } from 'react'
import { Menu, X, FileUp, FileDown } from 'lucide-react'
import { exportJson } from '../utils/exportJson'
import { exportHtml } from '../utils/exportHtml'
import { usePopover } from '../hooks/usePopover'
import { STATUS, PRIORITY } from '../utils/constants'

const VALID_STATUSES  = new Set(Object.values(STATUS))
const VALID_PRIORITIES = new Set(Object.values(PRIORITY))

function isValidTask(t) {
  return (
    t !== null &&
    typeof t === 'object' &&
    typeof t.id === 'string' && t.id.trim() !== '' &&
    typeof t.title === 'string' && t.title.trim() !== '' &&
    VALID_STATUSES.has(t.status) &&
    VALID_PRIORITIES.has(t.priority)
  )
}

export default function HamburgerMenu({ allTasks, filteredTasks, onImport }) {
  const { open, setOpen, ref } = usePopover()
  const fileInputRef = useRef(null)

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result)
        if (!Array.isArray(imported) || !imported.every(isValidTask)) throw new Error()
        onImport(imported)
        setOpen(false)
      } catch {
        alert('JSONファイルの読み込みに失敗しました。正しい形式のファイルを選択してください。')
      } finally {
        e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="メニュー"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
          <p className="text-xs text-gray-400 px-4 pt-2 pb-1">データ管理</p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileUp size={15} className="text-gray-400" />
            JSONをインポート
          </button>

          <button
            onClick={() => { exportJson(allTasks); setOpen(false) }}
            disabled={allTasks.length === 0}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileDown size={15} className="text-gray-400" />
            JSONでエクスポート
          </button>

          <button
            onClick={() => { exportHtml(filteredTasks); setOpen(false) }}
            disabled={filteredTasks.length === 0}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileDown size={15} className="text-gray-400" />
            HTMLでエクスポート
          </button>
        </div>
      )}
    </div>
  )
}

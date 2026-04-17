import { X } from 'lucide-react'
import changelog from '../../CHANGELOG.md?raw'
import ModalBackdrop from './ModalBackdrop'

function renderMarkdown(md) {
  return md.split('\n').map((line, i) => {
    if (line.startsWith('## '))
      return (
        <h2 key={i} className="text-base font-bold text-gray-800 mt-5 mb-1 first:mt-0">
          {line.slice(3)}
        </h2>
      )
    if (line.startsWith('### '))
      return (
        <h3 key={i} className="text-sm font-semibold text-gray-600 mt-3 mb-1">
          {line.slice(4)}
        </h3>
      )
    if (line.startsWith('- '))
      return (
        <li key={i} className="text-sm text-gray-700 ml-4 list-disc">
          {line.slice(2)}
        </li>
      )
    if (line.trim() === '' || line.startsWith('#'))
      return null
    return (
      <p key={i} className="text-sm text-gray-500">
        {line}
      </p>
    )
  })
}

export default function ChangelogModal({ onClose }) {
  return (
    <ModalBackdrop onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-gray-800">変更履歴</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">
          <ul className="space-y-0.5">{renderMarkdown(changelog)}</ul>
        </div>
      </div>
    </ModalBackdrop>
  )
}

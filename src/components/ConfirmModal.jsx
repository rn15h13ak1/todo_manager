import { useEffect, useRef } from 'react'
import ModalBackdrop from './ModalBackdrop'

export default function ConfirmModal({ message, confirmLabel, onConfirm, onCancel }) {
  const confirmBtnRef = useRef(null)

  useEffect(() => {
    // 表示時に確認ボタンにフォーカスして Enter で確定できるようにする
    confirmBtnRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Enter') { e.stopImmediatePropagation(); onConfirm() }
      if (e.key === 'Escape') { e.stopImmediatePropagation(); onCancel() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onConfirm, onCancel])

  return (
    <ModalBackdrop onClose={onCancel} className="">
      <div className="bg-white rounded-xl shadow-xl px-6 py-5 w-full max-w-sm mx-4">
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            キャンセル（Esc）
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            className="text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors"
          >
            {confirmLabel}（Enter）
          </button>
        </div>
      </div>
    </ModalBackdrop>
  )
}

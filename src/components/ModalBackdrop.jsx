/**
 * モーダル共通の背景（オーバーレイ）コンポーネント。
 * 背景クリックで onClose を呼ぶ。
 */
export default function ModalBackdrop({ onClose, className = 'p-4', children }) {
  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {children}
    </div>
  )
}

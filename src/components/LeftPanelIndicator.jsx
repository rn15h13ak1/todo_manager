/**
 * 左パネルの現在状態を示すインジケーターバー。
 * panelState が null のとき（右パネル非表示）は何も表示しない。
 */
export default function LeftPanelIndicator({ show, isSearchFocused, isPanelFocused, filterFocusIndex }) {
  if (!show) return null

  if (isSearchFocused) return (
    <div className="px-4 py-1.5 border-b border-gray-100 bg-gray-50 text-xs flex justify-between shrink-0">
      <span className="font-medium text-gray-400">非アクティブ</span>
      <span className="text-gray-300">Enter: 検索確定して戻る</span>
    </div>
  )

  if (isPanelFocused) return (
    <div className="px-4 py-1.5 border-b border-gray-100 bg-gray-50 text-xs flex justify-between shrink-0">
      <span className="font-medium text-gray-400">非アクティブ</span>
      <span className="text-gray-300">h: このパネルへ</span>
    </div>
  )

  if (filterFocusIndex !== null) return (
    <div className="px-4 py-1.5 border-b border-amber-100 bg-amber-50 text-xs flex justify-between shrink-0">
      <span className="font-medium text-amber-600">フィルター操作中</span>
      <span className="text-amber-400">j/k: 項目移動　h/l: 値変更　f: 戻る</span>
    </div>
  )

  return (
    <div className="px-4 py-1.5 border-b border-blue-100 bg-blue-50 text-xs flex justify-between shrink-0">
      <span className="font-medium text-blue-600">操作中</span>
      <span className="text-blue-400">j/k: 移動　l: 右パネルへ</span>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'

/**
 * ポップオーバー（ドロップダウンメニュー等）の開閉を管理するフック。
 * コンテナ要素の外側をクリックしたときに自動で閉じる。
 *
 * @param {React.MutableRefObject} blockEditRef
 *   外側クリックで閉じた直後にカードクリックが発火しないようにするフラグ ref。
 *   省略可。
 */
export function usePopover(blockEditRef) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        if (blockEditRef) {
          blockEditRef.current = true
          setTimeout(() => { blockEditRef.current = false }, 0)
        }
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  return { open, setOpen, ref }
}

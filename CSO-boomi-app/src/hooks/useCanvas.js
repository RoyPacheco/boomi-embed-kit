import { useEffect, useRef } from 'react'

export function useCanvas(draw) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    draw(ref.current)
  }, [draw])
  return ref
}

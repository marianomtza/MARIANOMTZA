'use client'

import { useEffect, useRef } from 'react'

export function useAnimationLoop(callback: (delta: number, elapsed: number) => void) {
  const previousRef = useRef(0)
  const startedRef = useRef(0)

  useEffect(() => {
    let frame = 0

    const loop = (time: number) => {
      if (!startedRef.current) startedRef.current = time
      const delta = (time - previousRef.current) / 1000
      const elapsed = (time - startedRef.current) / 1000
      previousRef.current = time
      callback(delta, elapsed)
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(frame)
  }, [callback])
}

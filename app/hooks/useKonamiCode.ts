'use client'

import { useEffect, useRef } from 'react'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

export function useKonamiCode(onSuccess: () => void) {
  const indexRef = useRef(0)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const current = KONAMI[indexRef.current]

      if (key === current) {
        indexRef.current += 1
      } else {
        indexRef.current = 0
      }

      if (indexRef.current === KONAMI.length) {
        onSuccess()
        indexRef.current = 0
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSuccess])
}

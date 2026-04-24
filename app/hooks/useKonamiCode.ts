'use client'

import { useEffect, useRef } from 'react'

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
const QUICK = ['m', 'm', 't', 'z', 'a']

export function useKonamiCode(onSuccess: () => void) {
  const konamiIndexRef = useRef(0)
  const quickBufferRef = useRef<string[]>([])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key

      const current = KONAMI[konamiIndexRef.current]
      if (key === current) konamiIndexRef.current += 1
      else konamiIndexRef.current = 0

      if (key.length === 1) {
        quickBufferRef.current = [...quickBufferRef.current.slice(-4), key]
        if (quickBufferRef.current.join('') === QUICK.join('')) {
          onSuccess()
          quickBufferRef.current = []
          konamiIndexRef.current = 0
          return
        }
      }

      if (konamiIndexRef.current === KONAMI.length) {
        onSuccess()
        konamiIndexRef.current = 0
        quickBufferRef.current = []
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSuccess])
}

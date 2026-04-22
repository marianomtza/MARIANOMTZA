import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'

const MotionContext = createContext(null)

export function MotionProvider({ children }) {
  const callbacksRef = useRef(new Set())
  const pointerRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0,
    nx: 0,
    ny: 0,
  })
  const rafRef = useRef(null)
  const prevTimeRef = useRef(0)
  const reducedMotionRef = useRef(false)

  const subscribeFrame = useCallback((callback) => {
    callbacksRef.current.add(callback)
    return () => {
      callbacksRef.current.delete(callback)
    }
  }, [])

  const updatePointer = useCallback((x, y) => {
    pointerRef.current.x = x
    pointerRef.current.y = y
    const width = window.innerWidth || 1
    const height = window.innerHeight || 1
    pointerRef.current.nx = x / width
    pointerRef.current.ny = y / height
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotionRef.current = media.matches
    const onMedia = (event) => {
      reducedMotionRef.current = event.matches
    }
    media.addEventListener('change', onMedia)

    const onPointerMove = (event) => {
      updatePointer(event.clientX, event.clientY)
    }

    const loop = (now) => {
      const dt = prevTimeRef.current ? Math.min(0.05, (now - prevTimeRef.current) / 1000) : 0.016
      prevTimeRef.current = now
      callbacksRef.current.forEach((callback) => {
        callback({
          now,
          dt,
          pointer: pointerRef.current,
          reducedMotion: reducedMotionRef.current,
        })
      })
      rafRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      media.removeEventListener('change', onMedia)
      window.removeEventListener('pointermove', onPointerMove)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [updatePointer])

  const value = useMemo(
    () => ({
      subscribeFrame,
      pointerRef,
    }),
    [subscribeFrame]
  )

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}

export function useMotion() {
  const context = useContext(MotionContext)
  if (!context) {
    throw new Error('useMotion must be used within MotionProvider')
  }
  return context
}

export function useMotionFrame(callback) {
  const callbackRef = useRef(callback)
  const { subscribeFrame } = useMotion()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return subscribeFrame((frame) => {
      callbackRef.current(frame)
    })
  }, [subscribeFrame])
}

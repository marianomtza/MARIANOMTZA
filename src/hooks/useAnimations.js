import { useEffect, useRef } from 'react'

/**
 * useAnimationFrame - Safely track and cleanup RAF
 */
export function useAnimationFrame(callback, isActive = true) {
  const rafRef = useRef(null)

  useEffect(() => {
    if (!isActive) return

    const animate = () => {
      callback()
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [callback, isActive])
}

/**
 * useEventListener - Safely attach and remove event listeners
 */
export function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef()

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = (event) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)

    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

/**
 * useRafLoop - Manage RAF-based animation loop with cleanup
 */
export function useRafLoop(callback, fps = 60) {
  const rafRef = useRef(null)
  const lastTimeRef = useRef(0)
  const frameIntervalRef = useRef(1000 / fps)

  useEffect(() => {
    const animate = (now) => {
      if (now - lastTimeRef.current >= frameIntervalRef.current) {
        callback(now)
        lastTimeRef.current = now
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [callback])
}

/**
 * useTimeout - Safely manage setTimeout
 */
export function useTimeout(callback, delay) {
  const savedCallback = useRef()
  const timeoutRef = useRef(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const tick = () => savedCallback.current()
    if (delay !== null) {
      timeoutRef.current = setTimeout(tick, delay)
      return () => clearTimeout(timeoutRef.current)
    }
  }, [delay])
}

/**
 * useInterval - Safely manage setInterval
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef()
  const intervalRef = useRef(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const tick = () => savedCallback.current()
    if (delay !== null) {
      intervalRef.current = setInterval(tick, delay)
      return () => clearInterval(intervalRef.current)
    }
  }, [delay])
}

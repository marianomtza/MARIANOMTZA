import React, { useRef } from 'react'
import { useMotion, useMotionFrame } from '../contexts/MotionContext'

export function Background3D({ showStars = true }) {
  const layersRef = useRef([])
  const smoothedRef = useRef({ x: 0, y: 0 })
  const { pointerRef } = useMotion()

  useMotionFrame(({ reducedMotion }) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const px = (pointerRef.current.nx - 0.5) * 2
    const py = (pointerRef.current.ny - 0.5) * 2

    const easing = reducedMotion ? 0.03 : 0.08
    smoothedRef.current.x += (px - smoothedRef.current.x) * easing
    smoothedRef.current.y += (py - smoothedRef.current.y) * easing

    layersRef.current.forEach((layer, i) => {
      if (!layer) return
      const depth = 1 + i
      const tx = smoothedRef.current.x * depth * 22
      const ty = smoothedRef.current.y * depth * 18
      const rz = smoothedRef.current.x * depth * 1.2
      layer.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateZ(${rz}deg)`
    })
  })

  return (
    <div className="bg-3d-container">
      <div className="bg-3d-layers">
        <div className="bg-3d-layer layer-1" ref={(el) => (layersRef.current[0] = el)} />
        <div className="bg-3d-layer layer-2" ref={(el) => (layersRef.current[1] = el)} />
        <div className="bg-3d-layer layer-3" ref={(el) => (layersRef.current[2] = el)} />
        {showStars && <div className="bg-3d-stars" />}
      </div>
    </div>
  )
}

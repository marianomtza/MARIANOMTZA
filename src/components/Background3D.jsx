import React, { useEffect, useRef } from 'react'
import { useMotion } from '../contexts/MotionContext'

export function Background3D() {
  const canvasRef = useRef(null)
  const { pointerRef } = useMotion()
  const nodesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    // Generate nodes representing "system / network of talent"
    const nodeCount = window.innerWidth < 800 ? 30 : 60
    const nodes = []
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
      })
    }
    nodesRef.current = nodes

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    let smoothedScroll = window.scrollY
    let smoothedPx = 0
    let smoothedPy = 0

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const targetPx = (pointerRef.current.nx - 0.5) * 120
      const targetPy = (pointerRef.current.ny - 0.5) * 120
      
      smoothedPx += (targetPx - smoothedPx) * 0.05
      smoothedPy += (targetPy - smoothedPy) * 0.05
      smoothedScroll += (window.scrollY - smoothedScroll) * 0.1

      // update
      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        
        if (n.x < -50) n.x = canvas.width + 50
        if (n.x > canvas.width + 50) n.x = -50
        if (n.y < -50) n.y = canvas.height + 50
        if (n.y > canvas.height + 50) n.y = -50
      })

      // draw lines
      ctx.lineWidth = 0.5
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 180) {
            const nx1 = nodes[i].x + smoothedPx * nodes[i].z
            const ny1 = nodes[i].y + smoothedPy * nodes[i].z - smoothedScroll * nodes[i].z * 0.3
            const nx2 = nodes[j].x + smoothedPx * nodes[j].z
            const ny2 = nodes[j].y + smoothedPy * nodes[j].z - smoothedScroll * nodes[j].z * 0.3
            
            ctx.beginPath()
            ctx.moveTo(nx1, ny1)
            ctx.lineTo(nx2, ny2)
            ctx.strokeStyle = `rgba(155, 95, 214, ${(1 - dist/180) * 0.35})`
            ctx.stroke()
          }
        }
      }

      // draw nodes
      nodes.forEach(n => {
        const nx = n.x + smoothedPx * n.z
        const ny = n.y + smoothedPy * n.z - smoothedScroll * n.z * 0.3
        ctx.beginPath()
        ctx.arc(nx, ny, n.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(155, 95, 214, ${0.4 + n.z * 0.2})`
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [pointerRef])

  return (
    <div className="bg-3d-container" style={{ pointerEvents: 'none', zIndex: 0, opacity: 0.6 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}

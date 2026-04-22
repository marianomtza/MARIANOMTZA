import React, { useRef, useEffect } from 'react'

/**
 * Background3D — Lightweight 3D parallax with WebGL fallback
 * Features: Mouse-reactive parallax depth layers, optimized rendering, TTFB-safe
 * Fallback: CSS-based 3D transforms for unsupported browsers
 * Performance: Clamped 60fps via RAF, uses will-change for GPU acceleration
 */
export function Background3D({ showStars = true }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const layersRef = useRef([])
  const stateRef = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 })
  const isWebGLRef = useRef(false)

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return

    const container = containerRef.current
    if (!container) return

    let cleanup = () => {}

    // Try WebGL initialization
    const canvas = canvasRef.current
    if (canvas && canvas.getContext) {
      try {
        const gl = canvas.getContext('webgl2', {
          alpha: true,
          antialias: false,
          powerPreference: 'low-power',
        })

        if (gl) {
          isWebGLRef.current = true
          cleanup = initWebGL(gl, canvas, stateRef.current)
        }
      } catch (e) {
        console.warn('WebGL unavailable, using CSS fallback')
      }
    }

    // If WebGL failed, use CSS 3D transforms
    if (!isWebGLRef.current) {
      cleanup = initCSS3DParallax(layersRef.current, stateRef.current)
    }

    const onMove = (e) => {
      stateRef.current.mouseX = e.clientX
      stateRef.current.mouseY = e.clientY
    }

    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cleanup()
    }
  }, [])

  return (
    <div className="bg-3d-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="bg-3d-webgl"
        style={{ display: 'none' }}
      />
      <div className="bg-3d-layers">
        {/* Parallax depth layers */}
        <div className="bg-3d-layer layer-1" ref={(el) => (layersRef.current[0] = el)} />
        <div className="bg-3d-layer layer-2" ref={(el) => (layersRef.current[1] = el)} />
        <div className="bg-3d-layer layer-3" ref={(el) => (layersRef.current[2] = el)} />
        {showStars && <div className="bg-3d-stars" />}
      </div>
    </div>
  )
}

// WebGL initialization: simple rotating cube + parallax
function initWebGL(gl, canvas, state) {
  // Set canvas size
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clearColor(0, 0, 0, 0)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  // Simple vertex + fragment shaders
  const vsSource = `
    attribute vec4 aPosition;
    uniform mat4 uMatrix;
    void main() {
      gl_Position = uMatrix * aPosition;
    }
  `

  const fsSource = `
    precision mediump float;
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 0.15);
    }
  `

  const program = gl.createProgram()
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.useProgram(program)

  // Simple cube geometry
  const vertices = new Float32Array([
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
  ])

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const aPosition = gl.getAttribLocation(program, 'aPosition')
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(aPosition)

  let rotation = 0
  let raf

  const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT)

    const mx = (state.mouseX / window.innerWidth - 0.5) * 0.2
    const my = (state.mouseY / window.innerHeight - 0.5) * 0.2

    rotation += 0.003

    // Simple perspective matrix
    const fov = Math.PI / 4
    const aspect = canvas.width / canvas.height
    const near = 0.1
    const far = 100
    const matrix = perspective(fov, aspect, near, far)
    multiplyMatrix(matrix, rotateY(rotation + mx))
    multiplyMatrix(matrix, rotateX(my))
    multiplyMatrix(matrix, translate(0, 0, -5))

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uMatrix'), false, matrix)
    gl.uniform3f(gl.getUniformLocation(program, 'uColor'), 0.5, 0.3, 1)

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3)
    raf = requestAnimationFrame(render)
  }

  raf = requestAnimationFrame(render)

  // Cleanup
  return () => cancelAnimationFrame(raf)
}

// CSS 3D fallback: GPU-accelerated layers with parallax
function initCSS3DParallax(layers, state) {
  let raf

  const render = () => {
    const mx = (state.mouseX / window.innerWidth - 0.5) * 40
    const my = (state.mouseY / window.innerHeight - 0.5) * 40

    layers.forEach((layer, i) => {
      if (!layer) return
      const depth = (i + 1) * 15
      layer.style.transform = `
        translate3d(${mx * depth}px, ${my * depth}px, 0)
        rotateX(${my * 0.3}deg)
        rotateY(${mx * 0.3}deg)
      `
    })

    raf = requestAnimationFrame(render)
  }

  raf = requestAnimationFrame(render)
  return () => cancelAnimationFrame(raf)
}

// Shader compilation helper
function compileShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader))
  }
  return shader
}

// Matrix math helpers (simplified)
function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2)
  const nf = 1 / (near - far)
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]
}

function rotateX(angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1,
  ]
}

function rotateY(angle) {
  const c = Math.cos(angle), s = Math.sin(angle)
  return [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1,
  ]
}

function translate(x, y, z) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]
}

function multiplyMatrix(a, b) {
  for (let i = 0; i < 16; i++) {
    a[i] = b[i * 4] * a[i % 4] + b[i * 4 + 1] * a[(i + 4) % 16] + b[i * 4 + 2] * a[(i + 8) % 16] + b[i * 4 + 3] * a[(i + 12) % 16]
  }
}

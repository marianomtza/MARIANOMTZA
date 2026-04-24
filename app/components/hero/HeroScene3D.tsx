'use client'

import React, { memo, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Line, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ResonanceSurface() {
  const meshRef = useRef<THREE.Mesh>(null)
  const baseRef = useRef<Float32Array | null>(null)
  const { mouse } = useThree()

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const geo = mesh.geometry as THREE.PlaneGeometry
    const pos = geo.attributes.position
    if (!baseRef.current) baseRef.current = Float32Array.from(pos.array as ArrayLike<number>)

    for (let i = 0; i < pos.count; i += 1) {
      const ix = i * 3
      const x = baseRef.current[ix]
      const y = baseRef.current[ix + 1]
      const radius = Math.sqrt(x * x + y * y)
      const pulse = Math.sin(radius * 5.2 - state.clock.elapsedTime * 2.4) * 0.11
      const pointerPush = Math.sin((x * mouse.x * 3 + y * mouse.y * 2) * 2 + state.clock.elapsedTime) * 0.05
      pos.array[ix + 2] = pulse + pointerPush
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    mesh.rotation.z = mouse.x * 0.12
    mesh.rotation.x = mouse.y * 0.08
  })

  return (
    <mesh ref={meshRef} rotation={[-1.15, 0, 0]} position={[0, -0.6, -0.8]}>
      <planeGeometry args={[8, 6, 120, 90]} />
      <meshStandardMaterial color="#a78bfa" metalness={0.25} roughness={0.35} transparent opacity={0.58} />
    </mesh>
  )
}

function ResonanceLines() {
  const lines = useMemo(() => {
    return new Array(8).fill(0).map((_, i) => {
      const y = -1.8 + i * 0.46
      return [new THREE.Vector3(-4, y, -1.6), new THREE.Vector3(4, y, -1.2)]
    })
  }, [])

  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="white" lineWidth={0.5} transparent opacity={0.18 - i * 0.01} />
      ))}
    </group>
  )
}

function Dust() {
  const points = useMemo(() => {
    const p = new Float32Array(900)
    for (let i = 0; i < 300; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10
      p[i * 3 + 1] = (Math.random() - 0.5) * 6
      p[i * 3 + 2] = -Math.random() * 4
    }
    return p
  }, [])

  return (
    <Points positions={points} stride={3}>
      <PointMaterial transparent color="#d8b4fe" size={0.03} sizeAttenuation depthWrite={false} opacity={0.26} />
    </Points>
  )
}

function CameraRig() {
  const { camera, mouse } = useThree()
  useFrame(() => {
    camera.position.x += (mouse.x * 0.6 - camera.position.x) * 0.03
    camera.position.y += (mouse.y * 0.25 + 0.1 - camera.position.y) * 0.03
    camera.lookAt(0, -0.4, -0.4)
  })
  return null
}

export const HeroScene3D = memo(function HeroScene3D() {
  return (
    <Canvas className="absolute inset-0" dpr={[1, 1.8]} camera={{ position: [0, 0.1, 4.8], fov: 44 }} gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 4, 3]} intensity={1.2} color="#d8b4fe" />
      <pointLight position={[-3, -1, 2]} intensity={0.55} color="#38bdf8" />
      <pointLight position={[2.8, -0.5, 1]} intensity={0.48} color="#f472b6" />
      <ResonanceSurface />
      <ResonanceLines />
      <Dust />
      <CameraRig />
    </Canvas>
  )
})

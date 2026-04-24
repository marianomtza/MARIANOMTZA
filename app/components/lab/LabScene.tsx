'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Float,
  MeshDistortMaterial,
  MeshTransmissionMaterial,
  Text,
} from '@react-three/drei'
import * as THREE from 'three'
import { ThemeName } from '../../lib/design-tokens'

const THEME_3D: Record<ThemeName, {
  background: string
  fog: string
  lights: [string, string]
  blobs: [string, string, string, string]
  text: string
}> = {
  base: {
    background: '#0a0712',
    fog: '#0a0712',
    lights: ['#a78bfa', '#38bdf8'],
    blobs: ['#8b5cf6', '#38bdf8', '#ef4444', '#f0abfc'],
    text: '#f5f0ff',
  },
  dark: {
    background: '#050505',
    fog: '#050505',
    lights: ['#ffffff', '#8a8a8a'],
    blobs: ['#eeeeee', '#d1d1d1', '#7c7c7c', '#bcbcbc'],
    text: '#ffffff',
  },
  light: {
    background: '#f4f1e8',
    fog: '#f4f1e8',
    lights: ['#232323', '#5b5b5b'],
    blobs: ['#171717', '#6a6a6a', '#8f8f8f', '#303030'],
    text: '#0f0f0f',
  },
  rojo: {
    background: '#100808',
    fog: '#100808',
    lights: ['#ef4444', '#f97316'],
    blobs: ['#dc2626', '#f97316', '#f43f5e', '#fb7185'],
    text: '#fff1f2',
  },
  azul: {
    background: '#07101d',
    fog: '#07101d',
    lights: ['#38bdf8', '#818cf8'],
    blobs: ['#0ea5e9', '#38bdf8', '#2563eb', '#818cf8'],
    text: '#eff6ff',
  },
}

function DistortedSphere({
  position,
  color,
  speed,
  distort,
  scale,
}: {
  position: [number, number, number]
  color: string
  speed: number
  distort: number
  scale: number
}) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.08
    ref.current.rotation.y = state.clock.elapsedTime * 0.1
  })
  return (
    <Float speed={1.1} rotationIntensity={0.35} floatIntensity={0.9}>
      <mesh ref={ref} position={position} scale={scale} castShadow>
        <icosahedronGeometry args={[1, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={speed}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
    </Float>
  )
}

function GlassKnot() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = state.clock.elapsedTime * 0.16
    ref.current.rotation.y = state.clock.elapsedTime * 0.22
  })
  return (
    <mesh ref={ref} position={[0, 0.1, 0]} scale={1.6}>
      <torusKnotGeometry args={[0.75, 0.26, 220, 30]} />
      <MeshTransmissionMaterial
        thickness={0.5}
        roughness={0.04}
        transmission={1}
        ior={1.35}
        chromaticAberration={0.04}
        backside
        samples={6}
        resolution={512}
        distortion={0.25}
        distortionScale={0.2}
        temporalDistortion={0.18}
        color="#ffffff"
      />
    </mesh>
  )
}

function CursorCamera() {
  const { camera, mouse } = useThree()
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  useFrame(() => {
    camera.position.x += (mouse.x * 1.4 - camera.position.x) * 0.04
    camera.position.y += (mouse.y * 0.8 + 0.2 - camera.position.y) * 0.04
    camera.lookAt(target)
  })
  return null
}

function FloatingText({ color }: { color: string }) {
  return (
    <Float speed={0.8} rotationIntensity={0.12} floatIntensity={0.35}>
      <Text
        position={[0, -2.4, -2]}
        fontSize={0.7}
        letterSpacing={-0.04}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.004}
        outlineColor="#0a0712"
        color={color}
        maxWidth={10}
      >
        MARIANOMTZA
      </Text>
    </Float>
  )
}

export function LabScene({
  theme = 'base',
  asBackground = false,
}: {
  theme?: ThemeName
  asBackground?: boolean
}) {
  const palette = THEME_3D[theme] || THEME_3D.base

  return (
    <Canvas
      shadows
      camera={{ position: [0, 0.3, 6], fov: 42 }}
      gl={{
        antialias: true,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={[palette.background]} />
      <fog attach="fog" args={[palette.fog, 5, 20]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.1} castShadow />
      <pointLight position={[-4, 2, -2]} intensity={0.6} color={palette.lights[0]} />
      <pointLight position={[4, -2, 3]} intensity={0.6} color={palette.lights[1]} />

      <GlassKnot />

      <DistortedSphere
        position={[-3.2, 1.6, -1.8]}
        color={palette.blobs[0]}
        speed={1.2}
        distort={0.5}
        scale={0.95}
      />
      <DistortedSphere
        position={[3.4, -1.4, -1.5]}
        color={palette.blobs[1]}
        speed={1.8}
        distort={0.4}
        scale={0.7}
      />
      <DistortedSphere
        position={[2.6, 2.4, -3]}
        color={palette.blobs[2]}
        speed={0.9}
        distort={0.3}
        scale={0.5}
      />
      <DistortedSphere
        position={[-2.8, -2.1, -2.5]}
        color={palette.blobs[3]}
        speed={1.4}
        distort={0.6}
        scale={0.6}
      />

      {!asBackground && <FloatingText color={palette.text} />}

      <Environment preset="city" />

      <CursorCamera />
    </Canvas>
  )
}

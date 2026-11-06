import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

const CATEGORY_HEX = {
  Freelancing: 0x6366f1,
  Placements: 0x3b82f6,
  Finance: 0x22c55e,
  Remote: 0xa855f7,
  default: 0x64748b,
}

const SELECTED_HEX = 0x10b981

function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return h
}

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1)
    t = (t + Math.imul(t ^ (t >>> 7), t | 1)) | 0
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CONSTELLATION_POSITIONS = [
  [-3.5, 1.0, -1.0],
  [-1.5, -1.5, -2.5],
  [2.0, 1.5, 2.0],
  [4.0, -1.0, 0.5],
  [-4.5, -2.0, 1.5],
  [1.5, -3.0, -3.0],
  [-2.0, 3.5, -4.0],
  [4.5, 2.5, -1.5],
]

export default function ArticleNode({ article, selected, visible, onSelect, setCanvasCursor, index }) {
  const meshRef = useRef()
  const ringRef = useRef()
  const [hovered, setHovered] = useState(false)
  const float = useRef(0)

  const color = selected ? SELECTED_HEX : CATEGORY_HEX[article.category] ?? CATEGORY_HEX.default
  const position = CONSTELLATION_POSITIONS[index] ?? [-2 + (index * 1.7), 0, -3 - (index * 0.8)]

  useFrame((state) => {
    try {
      const mesh = meshRef.current
      const ring = ringRef.current
      if (!mesh) return

      float.current += state.delta * (selected ? 2.5 : 1.0)
      const lift = Math.sin(float.current) * (selected ? 0.5 : 0.25)
      const drift = Math.cos(float.current * 0.5) * 0.05

      mesh.position.set(drift, lift, 0)
      mesh.rotation.x += state.delta * 0.04
      mesh.rotation.y += state.delta * 0.07

      if (ring) {
        ring.position.set(0, -0.1 + lift, 0)
        ring.rotation.z += state.delta * 0.025
      }

      const targetScale = !visible ? 0 : selected ? 1.7 : hovered ? 1.3 : 1
      const s = mesh.scale
      const next = s.x + (targetScale - s.x) * 0.15
      s.set(next, next, next)

      const material = mesh.material
      if (hovered) {
        material.color.setHex(color)
        material.opacity = 0.98
        material.transparent = true
      } else if (selected) {
        material.color.setHex(SELECTED_HEX)
        material.opacity = 0.98
        material.transparent = true
      } else {
        material.color.setHex(color)
        material.opacity = 1
        material.transparent = false
      }
      material.needsUpdate = true
    } catch {
      // swallow render errors
    }
  })

  return (
    <group position={position} frustumCulled={false}>
      <mesh
        ref={meshRef}
        onPointerOver={() => { setHovered(true); setCanvasCursor('pointer') }}
        onPointerOut={() => { setHovered(false); setCanvasCursor('default') }}
        onClick={() => onSelect(article)}
      >
        <icosahedronGeometry args={[2.6, 1]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ringRef} frustumCulled={false}>
        <torusKnotGeometry args={[3.4, 1.0, 100, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

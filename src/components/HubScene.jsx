import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import ArticleNode from './ArticleNode'

// Custom starfield — big bright points, never culled, no drei dependency
function Starfield() {
  const pointsRef = useRef()

  useFrame(() => {
    try {
      const points = pointsRef.current
      if (!points) return
      points.rotation.y += 0.0002
      points.rotation.x += 0.0001
    } catch {
      // swallow render errors
    }
  })

  const count = 12000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const r = 150 + Math.random() * 40
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
    colors[i * 3] = 0.6
    colors[i * 3 + 1] = 0.8
    colors[i * 3 + 2] = 1
    sizes[i] = 0.6 + Math.random() * 1.5
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  const material = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
}

export default function HubScene({ articles, filter, selectedId, autoRotate, onArticleSelect, setCanvasCursor }) {
  const [isOrbiting, setIsOrbiting] = useState(false)

  return (
    <div className="absolute inset-0 w-full h-full z-0" style={{ touchAction: 'none' }}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 45, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', background: '#020617' }}
      >
        <ambientLight intensity={0.55} color="#ffe8c7" />
        <pointLight intensity={2.5} color="#4f46e5" position={[6, 8, 5]} />
        <directionalLight intensity={1.8} color="#10b981" position={[-7, 9, -5]} castShadow />

        <Starfield />

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={4}
          maxDistance={12}
          autoRotate={autoRotate && !isOrbiting}
          autoRotateSpeed={0.4}
          enableDamping
          dampingFactor={0.06}
          onStart={() => setIsOrbiting(true)}
          onEnd={() => setIsOrbiting(false)}
        />

        {articles.map((article, index) => (
          <ArticleNode
            key={article.id}
            article={article}
            index={index}
            selected={selectedId === article.id}
            visible={filter === 'All' || article.category === filter}
            onSelect={onArticleSelect}
            setCanvasCursor={setCanvasCursor}
          />
        ))}
      </Canvas>
    </div>
  )
}

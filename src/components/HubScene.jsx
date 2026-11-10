import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { Stars, Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import ArticleNode from './ArticleNode'

// Extend drei components into the THREE namespace for R3F
extend({ Stars, Text })

// Local font file — loaded dynamically so a missing module never crashes the canvas
const FONT_URL = '/fonts/helvetiker_regular.typeface.json'

// Guaranteed-visible starfield using raw THREE.Points
function Starfield() {
  const pointsRef = useRef()

  useFrame(() => {
    const points = pointsRef.current
    if (!points) return
    points.rotation.y += 0.0001
    points.rotation.x += 0.00005
  })

  const count = 6000
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    // Spherical distribution around camera
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const r = 120 + Math.random() * 40
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
    colors[i * 3] = 0.4
    colors[i * 3 + 1] = 0.6
    colors[i * 3 + 2] = 1.0
    sizes[i] = 0.4 + Math.random() * 1.0
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: false,
    depthWrite: false,
  })
  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
}

export default function HubScene({ articles, filter, selectedId, autoRotate, onArticleSelect, setCanvasCursor }) {
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [font, setFont] = useState(null)

  // Load font dynamically — if FontLoader module is unavailable, text labels are skipped
  // but the canvas (stars + article nodes) still renders
  useEffect(() => {
    let cancelled = false
    import('three/examples/jsm/loaders/FontLoader.js')
      .then(({ FontLoader }) => {
        if (cancelled) return
        const loader = new FontLoader()
        loader.load(
          FONT_URL,
          (loadedFont) => { if (!cancelled) setFont(loadedFont) },
          undefined,
          (err) => console.warn('[HubScene] Font load failed, text labels disabled:', err)
        )
      })
      .catch((err) => console.warn('[HubScene] FontLoader module unavailable, text labels disabled:', err))
    return () => { cancelled = true }
  }, [])

  return (
    <div className="absolute inset-0 w-full h-full z-0" style={{ touchAction: 'none' }}>
      <Canvas
        camera={{ position: [0, 2, 12], fov: 45, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', background: '#020617' }}
      >
        {/* Warm ambient light */}
        <ambientLight intensity={0.4} color="#ffffff" />

        {/* Bright point lights for metallic highlights */}
        <pointLight intensity={2.0} color="#6366f1" position={[8, 8, 6]} />
        <pointLight intensity={2.0} color="#10b981" position={[-8, 8, -6]} />

        {/* Guaranteed-visible starfield backdrop */}
        <Starfield />

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={4}
          maxDistance={50}
          autoRotate={autoRotate && !isOrbiting}
          autoRotateSpeed={0.5}
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
            font={font}
          />
        ))}
      </Canvas>
    </div>
  )
}

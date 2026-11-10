import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, extend } from '@react-three/fiber'
import { Stars, Text, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import ArticleNode from './ArticleNode'
import ErrorBoundary from './ErrorBoundary'

// Extend drei components into the THREE namespace for R3F
extend({ Stars, Text })

// Local font file — loaded dynamically so a missing module never crashes the canvas
const FONT_URL = '/fonts/helvetiker_regular.typeface.json'

function CanvasErrorFallback({ error }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-400">
      <div className="text-center">
        <h3 className="text-sm font-bold text-slate-200 mb-2">3D scene temporarily unavailable</h3>
        <p className="text-xs text-slate-500">{error.message}</p>
      </div>
    </div>
  )
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
      <ErrorBoundary fallback={<CanvasErrorFallback error={{ message: 'Three.js scene failed to render' }} />}>
        <Canvas
          camera={{ position: [0, 3, 14], fov: 45, near: 0.1, far: 1000 }}
          gl={{ antialias: true, alpha: false }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', background: '#020617' }}
        >
          {/* Ambient light — base illumination so meshBasicMaterial nodes are always visible */}
          <ambientLight intensity={0.6} color="#ffffff" />

          {/* Directional light — defines shape and depth */}
          <directionalLight intensity={1.2} position={[10, 10, 10]} />

          {/* Bright point lights for metallic highlights */}
          <pointLight intensity={2.0} color="#6366f1" position={[8, 8, 6]} />
          <pointLight intensity={2.0} color="#10b981" position={[-8, 8, -6]} />

          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={4}
            maxDistance={100}
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
      </ErrorBoundary>
    </div>
  )
}

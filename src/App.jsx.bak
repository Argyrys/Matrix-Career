import { useState, useMemo, useCallback, useEffect } from 'react'
import HubScene from './components/HubScene'
import SidebarPanel from './components/SidebarPanel'
import EmailCapture from './components/EmailCapture'
import articles from './data/articles'
import { useAnalytics } from './hooks/useAnalytics'
import AdBlockDetector from './components/AdBlockDetector'

const CATEGORIES = ['All', 'Freelancing', 'Placements', 'Finance', 'Remote Work']

export default function App() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [cursor, setCursor] = useState('default')
  const [showEmail, setShowEmail] = useState(false)

  const { trackArticleOpen, trackArticleClose, trackAdImpression, trackAdClick } = useAnalytics()

  const counts = useMemo(() => {
    const c = { All: articles.length, Freelancing: 0, Placements: 0, Finance: 0, 'Remote Work': 0 }
    for (const article of articles) {
      c[article.category] = (c[article.category] || 0) + 1
    }
    return c
  }, [articles])

  const handleArticleSelect = useCallback((article) => {
    setSelected(article)
    setCanvasBodyCursor('default')
    trackArticleOpen(article.id)
    // Trigger email capture on first article open for list building
    if (!localStorage.getItem('matrix_subscribed')) {
      setShowEmail(true)
    }
  }, [trackArticleOpen])

  const handleClose = useCallback(() => {
    if (selected) trackArticleClose(selected.id)
    setSelected(null)
    setCanvasBodyCursor('default')
  }, [selected, trackArticleClose])

  const setCanvasBodyCursor = useCallback((value) => {
    setCursor(value)
    document.body.style.cursor = value
    document.documentElement.style.cursor = value
  }, [])

  // Track ad impressions when sidebar opens
  useEffect(() => {
    if (selected) {
      trackAdImpression('leaderboard-horizontal')
      trackAdImpression('inline-content-1')
    }
  }, [selected, trackAdImpression])

  // Update document title dynamically for SEO
  useEffect(() => {
    if (selected) {
      document.title = `${selected.title} | Matrix Careers`
    } else {
      document.title = 'Matrix Careers | 3D Finance & Career Content Hub'
    }
  }, [selected])

  return (
    <div
      className="relative w-full h-[100dvh] bg-slate-950 text-slate-200 selection:bg-soul-200/30 overflow-hidden"
      style={{ cursor }}
    >
      <AdBlockDetector />

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Main Header HUD — sticky futuristic top banner with categorized count tracker */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/40"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-[9px] font-bold shadow-lg shadow-indigo-500/40">
            MC
          </div>
          <span className="font-black text-xs tracking-wider text-slate-200 uppercase">Matrix Careers</span>
        </div>
        <div className="flex items-center gap-2.5">
          {CATEGORIES.map((cat) => (
            <span key={cat} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700/50 bg-slate-800/60 text-[10px] font-bold tracking-wider" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setFilter(cat)} onClick={() => setFilter(cat)}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    cat === 'Freelancing' ? '#818cf8' : cat === 'Placements' ? '#60a5fa' : cat === 'Finance' ? '#34d399' : cat === 'Remote Work' ? '#a855f7' : '#94a3b8',
                }}
                aria-hidden="true"
              />
              {cat} <span className="ml-1 text-slate-500">{counts[cat]}</span>
            </span>
          ))}
        </div>
      </header>

      {/* Full-screen WebGL 3D constellation canvas */}
      <section id="main-content" aria-label="Interactive 3D article constellation" tabIndex={-1}>
        <HubScene
          articles={articles}
          filter={filter}
          selectedId={selected?.id}
          autoRotate={!selected}
          onArticleSelect={handleArticleSelect}
          setCanvasCursor={setCanvasBodyCursor}
        />
      </section>

      {/* Category Filtering Hub — floating 3D-styled button panel at bottom center */}
      {!selected && (
        <div
          className="fixed bottom-[12vh] left-1/2 -translate-x-1/2 z-40 flex gap-2 bg-slate-950/90 backdrop-blur-md border border-slate-800/40 p-2 rounded-full shadow-2xl"
          role="radiogroup"
          aria-label="Article category filter"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              role="radio"
              aria-checked={filter === cat}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 ${
                filter === cat
                  ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/40'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Dismiss backdrop behind the slide-in panel */}
      {selected && (
        <div
          className="fixed inset-0 z-45 bg-slate-900/60 backdrop-blur-sm"
          onClick={handleClose}
          onKeyDown={(e) => e.key === 'Escape' && handleClose()}
          role="button"
          tabIndex={0}
          aria-label="Close article sidebar"
        />
      )}

      {/* Interactive Content Sidebar — glassmorphism slide-in panel */}
      {selected && (
        <SidebarPanel
          article={selected}
          articles={articles}
          onClose={handleClose}
          onAdClick={trackAdClick}
        />
      )}

      {/* Email capture modal — shown on article open for audience building */}
      {showEmail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4" role="dialog" aria-modal="true">
          <EmailCapture onClose={() => setShowEmail(false)} />
        </div>
      )}
    </div>
  )
}

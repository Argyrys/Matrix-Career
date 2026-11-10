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
  const [showPwaPrompt, setShowPwaPrompt] = useState(false)

  const { trackArticleOpen, trackArticleClose, trackAdImpression, trackAdClick } = useAnalytics()

  // Track article views in localStorage for live statistics
  useEffect(() => {
    if (selected) {
      const views = localStorage.getItem('matrix_article_views') || '{}'
      const viewCount = JSON.parse(views)
      viewCount[selected.id] = (viewCount[selected.id] || 0) + 1
      localStorage.setItem('matrix_article_views', JSON.stringify(viewCount))
    }
  }, [selected])

  // Count total views across all articles
  const totalViews = useMemo(() => {
    const viewCount = JSON.parse(localStorage.getItem('matrix_article_views') || '{}')
    return Object.values(viewCount).reduce((sum, v) => sum + v, 0)
  }, [])

  // Average read time calculation from localStorage article durations
  const totalReadTime = useMemo(() => {
    const durations = JSON.parse(localStorage.getItem('matrix_read_durations') || '{}')
    return Object.values(durations).reduce((sum, v) => sum + v, 0)
  }, [])

  const avgReadTime = totalReadTime > 0 ? Math.round(totalReadTime / totalViews) : 5

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
    // Trigger email capture on first article open for audience building
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

  // PWA install prompt — detect if app is launched standalone
  useEffect(() => {
    if ((navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) && !showPwaPrompt) {
      // Already launched as PWA, don't show prompt
      return
    }
    // Show install prompt on first visit if not standalone
    setShowPwaPrompt(true)
    // Hide after 30 seconds or if user dismisses
    const timer = setTimeout(() => {
      setShowPwaPrompt(false)
    }, 30000)
    return () => clearTimeout(timer)
  }, [showPwaPrompt])

  return (
    <div
      className="relative w-full h-[100dvh] bg-slate-950 text-slate-200 selection:bg-soul-200/30 overflow-hidden"
      style={{ cursor }}
    >
      <AdBlockDetector />

      {/* PWA Install Prompt — show once per session on mobile */}
      {showPwaPrompt && !navigator.standalone && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-950 border border-slate-700 rounded-xl p-6 max-w-md w-full text-center shadow-xl transform transition-all duration-500" style={{ display: 'block' }}>
          <div className="flex items-center justify-center gap-3">
            <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span className="text-slate-300 text-sm">Add Matrix Careers to your home screen for offline access & faster loading</span>
          </div>
          <button className="mt-3 text-emerald-400 hover:text-emerald-300 text-sm font-medium" onClick={() => setShowPwaPrompt(false)}>Dismiss</button>
        </div>
      )}

      {/* Skip link for keyboard accessibility */}
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

      {/* Hero Section — first screen clarity with prominent CTAs */}
      <section id="hero" className="relative pt-24 pb-12">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-slate-950/90 to-slate-900/90 blur-xl md:h-[400px]"></div>
        <div className="relative flex flex-col items-center justify-center gap-6 md:gap-8 max-w-5xl px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100 mb-4">
              Matrix Careers
            </h1>
            <p className="text-2xl md:text-3xl text-slate-400 max-w-2xl">
              Your interactive 3D Finance & Career Content Hub
            </p>
          </div>

          {/* Primary CTAs — like top careers sites have in first screen */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 justify-center mt-8">
            <a
              href="#main-content"
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-8 py-3 shadow-lg shadow-emerald-500/40 hover:opacity-90 transition-opacity"
              role="button"
              aria-label="Explore article constellation"
              tabIndex={0}
            >
              Explore Articles
            </a>
            <a
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-8 py-3 shadow-lg shadow-emerald-500/40 hover:opacity-90 transition-opacity"
              role="button"
              aria-label="Open salary calculator"
              tabIndex={0}
            >
              Salary Calculator
            </a>
            <a
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-8 py-3 shadow-lg shadow-emerald-500/40 hover:opacity-90 transition-opacity"
              role="button"
              aria-label="Open code sandbox"
              tabIndex={0}
            >
              Code Sandbox
            </a>
            <a
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-8 py-3 shadow-lg shadow-emerald-500/40 hover:opacity-90 transition-opacity"
              role="button"
              aria-label="View category filters"
              tabIndex={0}
            >
              Browse Categories
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section id="main-content" className="relative pt-24 pb-12">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/5 to-transparent blur-xl md:h-[400px]"></div>
        <div className="relative flex flex-col items-center justify-center gap-6 md:gap-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 w-full max-w-4xl">
            {/* Soul green feature cards replacing 3D nodes */}
            {['All', 'Freelancing', 'Placements', 'Finance', 'Remote Work'].map((cat, i) => (
              <div
                key={cat}
                className="group flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700/30 hover:bg-emerald-500/15 transition-all hover:border-emerald-500/30 cursor-pointer p-4 shadow-lg shadow-emerald-500/10"
                onClick={() => {}}
                role="button"
                aria-label={`View ${cat} articles`}
                tabIndex={0}
                onMouseOver={() => {}}
                onMouseOut={() => {}}
                onKeyDown={() => {}}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <line x1="12" y1="19" x2="12" y2="13" />
                    <line x1="12" y1="19" x2="18" y2="19" />
                  </svg>
                </div>
                <h3 className="text-center text-xs font-medium text-slate-300 transition-colors">{cat}</h3>
                <p className="text-xs text-slate-500 mt-0.5">articles</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Filtering Hub — floating soul green button panel at bottom center */}
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
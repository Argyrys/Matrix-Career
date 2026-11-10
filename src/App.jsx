import { useState, useMemo, useCallback, useEffect } from 'react'
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

  // Filtered articles based on selected category
  const filteredArticles = useMemo(() => {
    if (filter === 'All') return articles
    return articles.filter((a) => a.category === filter)
  }, [filter])

  // Get view count for a specific article
  const getArticleViews = useCallback((articleId) => {
    const viewCount = JSON.parse(localStorage.getItem('matrix_article_views') || '{}')
    return viewCount[articleId] || 0
  }, [])

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
      document.title = 'Matrix Careers | Finance & Career Content Hub'
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
              Your interactive Finance & Career Content Hub
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500">
              <span>{articles.length} articles</span>
              <span>•</span>
              <span>{totalViews} total views</span>
              <span>•</span>
              <span>~{avgReadTime} min read</span>
            </div>
          </div>

          {/* Primary CTAs — like top careers sites have in first screen */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 justify-center mt-8">
            <a
              href="#main-content"
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-8 py-3 shadow-lg shadow-emerald-500/40 hover:opacity-90 transition-opacity"
              role="button"
              aria-label="Explore articles"
              tabIndex={0}
            >
              Explore Articles
            </a>
            <a
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-8 py-3 shadow-lg shadow-emerald-500/40 hover:opacity-90 transition-opacity"
              role="button"
              aria-label="Browse categories"
              tabIndex={0}
            >
              Browse Categories
            </a>
            <a
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-8 py-3 shadow-lg shadow-emerald-500/40 hover:opacity-90 transition-opacity"
              role="button"
              aria-label="View statistics"
              tabIndex={0}
            >
              View Stats
            </a>
            <a
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-8 py-3 shadow-lg shadow-emerald-500/40 hover:opacity-90 transition-opacity"
              role="button"
              aria-label="Latest content"
              tabIndex={0}
            >
              Latest Content
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section id="main-content" className="relative pt-24 pb-12">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-500/5 to-transparent blur-xl md:h-[400px]"></div>
        <div className="relative flex flex-col items-center justify-center gap-6 md:gap-8">
          {/* Category Cards with Live Counts */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 w-full max-w-4xl">
            {CATEGORIES.map((cat, i) => (
              <div
                key={cat}
                className={`group flex flex-col items-center justify-center rounded-2xl backdrop-blur-md border cursor-pointer p-4 transition-all shadow-lg ${
                  filter === cat
                    ? 'bg-emerald-500/15 border-emerald-500/30 shadow-emerald-500/20'
                    : 'bg-slate-950/80 border-slate-700/30 hover:bg-emerald-500/10 hover:border-emerald-500/30 shadow-emerald-500/10'
                }`}
                onClick={() => setFilter(cat)}
                role="button"
                aria-label={`View ${cat} articles`}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setFilter(cat)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${filter === cat ? 'bg-emerald-500/30' : 'bg-emerald-500/20'}`}>
                  <svg className={`w-5 h-5 ${filter === cat ? 'text-emerald-300' : 'text-emerald-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <line x1="12" y1="19" x2="12" y2="13" />
                    <line x1="12" y1="19" x2="18" y2="19" />
                  </svg>
                </div>
                <h3 className={`text-center text-xs font-medium transition-colors ${filter === cat ? 'text-emerald-300' : 'text-slate-300'}`}>{cat}</h3>
                <p className={`text-xs mt-0.5 ${filter === cat ? 'text-emerald-400' : 'text-slate-500'}`}>{counts[cat]} articles</p>
              </div>
            ))}
          </div>

          {/* Article List Grid */}
          <div className="w-full max-w-6xl px-4">
            <h2 className="text-lg font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {filter === 'All' ? 'All Articles' : `${filter} Articles`} ({filteredArticles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="group flex flex-col rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700/30 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all cursor-pointer p-6 shadow-lg shadow-emerald-500/10"
                  onClick={() => handleArticleSelect(article)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleArticleSelect(article)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-500">{article.readTime}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{getArticleViews(article.id)} views</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-3 flex-1">
                    {article.summary}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800/40">
                    <span className="text-xs text-slate-500">{article.date}</span>
                    <span className="text-emerald-400 text-sm font-medium group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                      Read Article
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

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
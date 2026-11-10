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
  const [deferredPrompt, setDeferredPrompt] = useState(null)

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
      // Lock background scroll while sidebar is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
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

  // PWA install prompt — show once per session, dismissible and persistently remembered
  useEffect(() => {
    // Capture the browser's install prompt event for the Install button
    const onBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // Don't show if already dismissed, already installed, or in standalone mode
    if (localStorage.getItem('matrix_pwa_dismissed')) return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    if (navigator.standalone) return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    if (window.matchMedia('(display-mode: standalone)').matches) return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)

    const timer = setTimeout(() => setShowPwaPrompt(true), 1500)
    // Auto-hide after 45 seconds
    const autoHide = setTimeout(() => setShowPwaPrompt(false), 46500)
    return () => {
      clearTimeout(timer)
      clearTimeout(autoHide)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
    }
  }, []) // Mount only — never re-run on dismissal

  const dismissPwa = useCallback(() => {
    setShowPwaPrompt(false)
    localStorage.setItem('matrix_pwa_dismissed', '1')
  }, [])

  const installPwa = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPwaPrompt(false)
        localStorage.setItem('matrix_pwa_dismissed', '1')
      }
      setDeferredPrompt(null)
    } else {
      // No native prompt available (iOS/desktop) — just dismiss
      dismissPwa()
    }
  }, [deferredPrompt, dismissPwa])

  return (
    <div
      className="relative w-full min-h-[100dvh] bg-slate-950 text-slate-200 selection:bg-emerald-500/30"
      style={{ cursor }}
    >
      <AdBlockDetector />

      {/* PWA Install Prompt — bottom corner, dismissible, remembered */}
      {showPwaPrompt && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 sm:max-w-sm bg-slate-900 border border-emerald-600/40 rounded-xl p-4 shadow-2xl shadow-emerald-500/20" role="alert">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200">Install Matrix Careers</p>
              <p className="text-xs text-slate-400 mt-0.5">Add to your home screen for offline access & faster loading</p>
              <div className="flex items-center gap-3 mt-2.5">
                <button
                  onClick={installPwa}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                  aria-label="Install app"
                >
                  Install
                </button>
                <button
                  onClick={dismissPwa}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
                  aria-label="Dismiss install prompt"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={dismissPwa}
              className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors p-1 -m-1"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
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
        <div className="hidden md:flex items-center gap-2.5 overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <span key={cat} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700/50 bg-slate-800/60 text-[10px] font-bold tracking-wider cursor-pointer hover:border-emerald-500/50 transition-colors" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setFilter(cat)} onClick={() => setFilter(cat)}>
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
      <section id="hero" className="relative pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Matrix Careers
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
              Your interactive Finance &amp; Career Content Hub
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 text-sm text-slate-500">
              <span>{articles.length} articles</span>
              <span aria-hidden="true">•</span>
              <span>{totalViews} total views</span>
              <span aria-hidden="true">•</span>
              <span>~{avgReadTime} min read</span>
            </div>
          </div>

          {/* Primary CTAs */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 w-full md:w-auto md:grid-cols-4">
            <a
              href="#main-content"
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-6 py-3 text-center shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
              aria-label="Explore articles"
            >
              Explore Articles
            </a>
            <a
              href="#main-content"
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-6 py-3 text-center shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
              aria-label="Browse categories"
            >
              Browse Categories
            </a>
            <a
              href="#hero"
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-6 py-3 text-center shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
              aria-label="View statistics"
            >
              View Stats
            </a>
            <a
              href="#main-content"
              className="btn-soul-green text-[11px] font-bold tracking-wider uppercase rounded-full px-6 py-3 text-center shadow-lg shadow-emerald-500/30 hover:opacity-90 transition-opacity"
              aria-label="Latest content"
            >
              Latest Content
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section id="main-content" className="relative px-4 pb-20">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          {/* Category Cards with Live Counts */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full max-w-4xl">
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className={`group flex flex-col items-center justify-center rounded-2xl backdrop-blur-md border cursor-pointer p-5 transition-all ${
                  filter === cat
                    ? 'bg-emerald-500/15 border-emerald-500/30 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/80 border-slate-700/40 hover:bg-emerald-500/10 hover:border-emerald-500/30'
                }`}
                onClick={() => setFilter(cat)}
                role="button"
                aria-label={`View ${cat} articles`}
                aria-pressed={filter === cat}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setFilter(cat)}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${filter === cat ? 'bg-emerald-500/30' : 'bg-emerald-500/15 group-hover:bg-emerald-500/25'}`}>
                  <svg className={`w-5 h-5 ${filter === cat ? 'text-emerald-300' : 'text-emerald-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className={`text-center text-sm font-semibold transition-colors ${filter === cat ? 'text-emerald-300' : 'text-slate-300'}`}>{cat}</h3>
                <p className={`text-xs mt-1 ${filter === cat ? 'text-emerald-400' : 'text-slate-500'}`}>{counts[cat]} articles</p>
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
          className="fixed inset-0 z-[45] bg-slate-900/60 backdrop-blur-sm"
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
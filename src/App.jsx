import { useState, useMemo, useCallback, useEffect, useRef, Fragment } from 'react'
import { Search, X, Bookmark, BookOpen, Flame, ArrowUp, ArrowRight } from 'lucide-react'
import SidebarPanel from './components/SidebarPanel'
import EmailCapture from './components/EmailCapture'
import StockTips from './components/StockTips'
import AdSlot from './components/AdSlot'
import ErrorBoundary from './components/ErrorBoundary'
import articles from './data/articles'
import { useAnalytics } from './hooks/useAnalytics'
import AdBlockDetector from './components/AdBlockDetector'

// Derived at runtime so canonical/OG/JSON-LD are correct on any host
// (Vercel preview, production domain, Netlify, localhost) — never hardcode.
const SITE_URL = typeof window !== 'undefined' ? window.location.origin : ''

const HOME_META = {
  title: 'Matrix Careers | Finance & Career Content Hub',
  description:
    '20 in-depth guides on freelancing, placements, stocks, personal finance and remote work — with calculators, a code sandbox and interactive tools.',
}

// Resolve a #article-<id> deep link to an article (null when absent/unknown)
function findHashArticle() {
  const raw = window.location.hash
  if (!raw.startsWith('#article-')) return null
  const id = decodeURIComponent(raw.slice('#article-'.length))
  return articles.find((a) => a.id === id) || null
}

function setMetaContent(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

const CATEGORIES = ['All', 'Freelancing', 'Placements', 'Finance', 'Stocks', 'Remote Work']

// Distinct icon per category (Lucide-style path data)
const CATEGORY_ICONS = {
  All: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M14 14h7v7h-7z'],
  Freelancing: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'],
  Placements: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  Finance: ['M3 3v18h18', 'M7 14l4-4 4 4 5-6'],
  Stocks: ['M22 12h-4l-3 9L9 3l-3 9H2'],
  'Remote Work': ['M5 12.55a11 11 0 0 1 14.08 0', 'M8.53 16.11a6 6 0 0 1 6.95 0', 'M12 20h.01'],
}

export default function App() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState('default')
  const [showEmail, setShowEmail] = useState(false)
  const [showPwaPrompt, setShowPwaPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [streak, setStreak] = useState(0)
  const [continueReading, setContinueReading] = useState(null)
  const [searchFocus, setSearchFocus] = useState(false)
  const [bookmarkIds, setBookmarkIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('matrix_bookmarks') || '[]')
    } catch {
      return []
    }
  })
  const searchRef = useRef(null)
  const suppressHash = useRef(false)

  const bookmarkCount = bookmarkIds.length

  // Re-read bookmarks whenever the reader closes (bookmark toggles happen inside it)
  // or when the saved panel is opened
  useEffect(() => {
    try {
      setBookmarkIds(JSON.parse(localStorage.getItem('matrix_bookmarks') || '[]'))
    } catch {
      setBookmarkIds([])
    }
  }, [selected, showBookmarks])

  const { trackArticleOpen, trackArticleClose, trackAdImpression, trackAdClick } = useAnalytics()

  // Track article views in localStorage for live statistics
  useEffect(() => {
    if (selected) {
      const views = localStorage.getItem('matrix_article_views') || '{}'
      const viewCount = JSON.parse(views)
      viewCount[selected.id] = (viewCount[selected.id] || 0) + 1
      localStorage.setItem('matrix_article_views', JSON.stringify(viewCount))
      // Remember the last opened article so returning visitors can resume
      try {
        localStorage.setItem('matrix_last_read', JSON.stringify({ id: selected.id, at: Date.now() }))
      } catch { /* quota */ }
    }
  }, [selected])

  // Reading streak — daily check-in habit loop (localStorage only)
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10)
      const stored = JSON.parse(localStorage.getItem('matrix_streak') || 'null')
      let next = { count: 1, last: today }
      if (stored && typeof stored.count === 'number') {
        if (stored.last === today) {
          next = stored
        } else {
          const prev = new Date(stored.last + 'T00:00:00')
          const diffDays = Math.round((new Date(today + 'T00:00:00') - prev) / 86400000)
          next = diffDays === 1 ? { count: stored.count + 1, last: today } : { count: 1, last: today }
        }
      }
      localStorage.setItem('matrix_streak', JSON.stringify(next))
      setStreak(next.count)
    } catch {
      setStreak(1)
    }
  }, [])

  // "Continue reading" card for return visitors
  useEffect(() => {
    try {
      const last = JSON.parse(localStorage.getItem('matrix_last_read') || 'null')
      if (last && last.id) {
        const article = articles.find((a) => a.id === last.id)
        if (article) setContinueReading(article)
      }
    } catch { /* ignore */ }
  }, [])

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
    const c = {}
    for (const cat of CATEGORIES) c[cat] = 0
    c.All = articles.length
    for (const article of articles) {
      c[article.category] = (c[article.category] || 0) + 1
    }
    return c
  }, [articles])

  // Filtered articles based on selected category + search query
  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = filter === 'All' ? articles : articles.filter((a) => a.category === filter)
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      )
    }
    return list
  }, [filter, query])

  // Get view count for a specific article
  const getArticleViews = useCallback((articleId) => {
    const viewCount = JSON.parse(localStorage.getItem('matrix_article_views') || '{}')
    return viewCount[articleId] || 0
  }, [])

  // Capture the main-page scroll position BEFORE the re-render that unmounts the
  // Continue Reading card (that card sits above the viewport, so removing it shifts
  // scroll anchoring — saving afterwards would store the already-adjusted value).
  const rememberScroll = useCallback(() => {
    if (typeof window.__matrixScrollY !== 'number') window.__matrixScrollY = window.scrollY
  }, [])

  const handleArticleSelect = useCallback((article) => {
    rememberScroll()
    suppressHash.current = true
    setSelected(article)
    setCanvasBodyCursor('default')
    // Deep-linkable URL so shared links land on the article (and back button works)
    const hash = `#article-${encodeURIComponent(article.id)}`
    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash)
    }
    trackArticleOpen(article.id)
    // Trigger email capture on first article open for audience building
    if (!localStorage.getItem('matrix_subscribed')) {
      setShowEmail(true)
    }
    setTimeout(() => { suppressHash.current = false }, 0)
  }, [trackArticleOpen, rememberScroll])

  const handleClose = useCallback(() => {
    if (selected) trackArticleClose(selected.id)
    setSelected(null)
    setCanvasBodyCursor('default')
    // Drop the article hash without adding another history entry
    if (window.location.hash.startsWith('#article-')) {
      suppressHash.current = true
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      setTimeout(() => { suppressHash.current = false }, 0)
    }
  }, [selected, trackArticleClose])

  // Hash deep links: open on load, react to back/forward navigation
  useEffect(() => {
    const syncFromHash = () => {
      if (suppressHash.current) return
      const fromHash = findHashArticle()
      if (fromHash) {
        rememberScroll()
        setSelected((current) => {
          if (current?.id !== fromHash.id) trackArticleOpen(fromHash.id)
          return fromHash
        })
      } else {
        setSelected(null)
      }
    }
    syncFromHash()
    window.addEventListener('popstate', syncFromHash)
    window.addEventListener('hashchange', syncFromHash)
    return () => {
      window.removeEventListener('popstate', syncFromHash)
      window.removeEventListener('hashchange', syncFromHash)
    }
  }, [trackArticleOpen, rememberScroll])

  // Back-to-top visibility
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const setCanvasBodyCursor = useCallback((value) => {
    setCursor(value)
    document.body.style.cursor = value
    document.documentElement.style.cursor = value
  }, [])

  // Track ad impressions when sidebar opens + lock background scroll
  useEffect(() => {
    if (selected) {
      trackAdImpression('leaderboard-horizontal')
      trackAdImpression('inline-content-1')
      // The viewport scrolls via <html> here, so lock both root and body
      if (typeof window.__matrixScrollY !== 'number') window.__matrixScrollY = window.scrollY
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
      // Restore the scroll position the reader was opened from
      const y = window.__matrixScrollY
      window.__matrixScrollY = undefined
      if (typeof y === 'number') {
        requestAnimationFrame(() => window.scrollTo({ top: y, left: 0, behavior: 'auto' }))
      }
    }
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [selected, trackAdImpression])

  // Update document title + social/meta tags dynamically for sharing & SEO
  useEffect(() => {
    const canonical = document.querySelector('link[rel="canonical"]')
    if (selected) {
      const url = `${window.location.origin}${window.location.pathname}#article-${encodeURIComponent(selected.id)}`
      document.title = `${selected.title} | Matrix Careers`
      setMetaContent('name', 'description', selected.summary)
      setMetaContent('property', 'og:type', 'article')
      setMetaContent('property', 'og:url', url)
      setMetaContent('property', 'og:title', selected.title)
      setMetaContent('property', 'og:description', selected.summary)
      setMetaContent('name', 'twitter:title', selected.title)
      setMetaContent('name', 'twitter:description', selected.summary)
      canonical?.setAttribute('href', url)
      // Per-article JSON-LD so crawlers and link previews see real structured data
      let script = document.getElementById('article-jsonld')
      if (!script) {
        script = document.createElement('script')
        script.id = 'article-jsonld'
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: selected.title,
        description: selected.summary,
        url,
        datePublished: new Date(selected.date).toISOString(),
        author: { '@type': 'Organization', name: 'Matrix Careers' },
        publisher: { '@type': 'Organization', name: 'Matrix Careers', url: SITE_URL + '/' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      })
    } else {
      document.title = HOME_META.title
      setMetaContent('name', 'description', HOME_META.description)
      setMetaContent('property', 'og:type', 'website')
      setMetaContent('property', 'og:url', SITE_URL + '/')
      setMetaContent('property', 'og:title', HOME_META.title)
      setMetaContent('property', 'og:description', HOME_META.description)
      setMetaContent('name', 'twitter:title', HOME_META.title)
      setMetaContent('name', 'twitter:description', HOME_META.description)
      canonical?.setAttribute('href', SITE_URL + '/')
      document.getElementById('article-jsonld')?.remove()
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

      {/* Skip link lives in index.html so it is the first focusable element in the DOM */}

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
                    cat === 'Freelancing' ? '#818cf8' : cat === 'Placements' ? '#60a5fa' : cat === 'Finance' ? '#34d399' : cat === 'Stocks' ? '#fbbf24' : cat === 'Remote Work' ? '#a855f7' : '#94a3b8',
                }}
                aria-hidden="true"
              />
              {cat} <span className="ml-1 text-slate-500">{counts[cat]}</span>
            </span>
          ))}
        </div>

        {/* Search + saved articles — keeps users digging through content */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`relative hidden sm:block transition-all ${searchFocus ? 'w-56' : 'w-36'}`}>
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Search articles…"
              aria-label="Search articles"
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 focus:bg-slate-800"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); searchRef.current?.focus() }}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowBookmarks((v) => !v)}
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700/50 bg-slate-800/60 text-[10px] font-bold tracking-wider hover:border-emerald-500/50 transition-colors"
            aria-label={`Saved articles (${bookmarkCount})`}
            aria-expanded={showBookmarks}
          >
            <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden lg:inline">Saved</span>
            {bookmarkCount > 0 && (
              <span className="min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                {bookmarkCount}
              </span>
            )}
          </button>
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
              {streak > 0 && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-semibold" title="Come back daily to keep your streak alive">
                    <Flame className="w-4 h-4" aria-hidden="true" />
                    {streak} day{streak > 1 ? 's' : ''} streak
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Continue Reading — resume card for returning readers */}
          {continueReading && !selected && (
            <button
              onClick={() => handleArticleSelect(continueReading)}
              className="group w-full max-w-xl flex items-center gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 px-5 py-4 text-left transition-colors"
              aria-label={`Continue reading: ${continueReading.title}`}
            >
              <span className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-400" aria-hidden="true" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Continue reading
                </span>
                <span className="block text-sm font-semibold text-slate-200 truncate group-hover:text-emerald-300 transition-colors mt-0.5">
                  {continueReading.title}
                </span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 text-emerald-400 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </button>
          )}

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full max-w-5xl">
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
                  <svg className={`w-5 h-5 ${filter === cat ? 'text-emerald-300' : 'text-emerald-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {(CATEGORY_ICONS[cat] || CATEGORY_ICONS.All).map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </svg>
                </div>
                <h3 className={`text-center text-sm font-semibold transition-colors ${filter === cat ? 'text-emerald-300' : 'text-slate-300'}`}>{cat}</h3>
                <p className={`text-xs mt-1 ${filter === cat ? 'text-emerald-400' : 'text-slate-500'}`}>{counts[cat]} articles</p>
              </div>
            ))}
          </div>

          {/* Top leaderboard ad — above the fold of the content grid for viewability */}
          <ErrorBoundary fallback={<div className="h-24 w-full max-w-5xl bg-slate-900/40 border border-dashed border-slate-700/50 rounded-xl flex items-center justify-center text-xs text-slate-500" role="status">Ad placement loading</div>}>
            <AdSlot
              variant="horizontal"
              slotId="home-leaderboard"
              className="w-full max-w-5xl"
              onClick={trackAdClick}
              onImpression={trackAdImpression}
            />
          </ErrorBoundary>

          {/* Stock Tips — interactive educational carousel */}
          <StockTips />

          {/* Article List Grid */}
          <div className="w-full max-w-6xl px-4">
            <h2 className="text-lg font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {query.trim()
                ? `Search results for “${query.trim()}”`
                : filter === 'All'
                  ? 'All Articles'
                  : `${filter} Articles`} ({filteredArticles.length})
            </h2>

            {/* Mobile search — header search is desktop-only */}
            <div className="relative sm:hidden mb-6">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles…"
                aria-label="Search articles"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/50 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {filteredArticles.length === 0 && (
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-10 text-center">
                <Search className="w-8 h-8 mx-auto text-slate-600 mb-3" aria-hidden="true" />
                <p className="text-slate-300 font-semibold">No articles match your search</p>
                <p className="text-sm text-slate-500 mt-1">Try a different keyword, or clear the filters to browse everything.</p>
                <button
                  onClick={() => { setQuery(''); setFilter('All') }}
                  className="mt-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  Show all articles
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article, index) => (
                <Fragment key={article.id}>
                  <article
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

                  {/* Mid-feed inline ad every 6 cards — in-content viewability */}
                  {(index + 1) % 6 === 0 && index !== filteredArticles.length - 1 && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <ErrorBoundary fallback={<div className="h-32 bg-slate-900/40 border border-dashed border-slate-700/50 rounded-xl flex items-center justify-center text-xs text-slate-500" role="status">Ad placement loading</div>}>
                        <AdSlot
                          variant="inline"
                          slotId={`home-inline-${Math.ceil((index + 1) / 6)}`}
                          onClick={trackAdClick}
                          onImpression={trackAdImpression}
                        />
                      </ErrorBoundary>
                    </div>
                  )}
                </Fragment>
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
          onSelect={handleArticleSelect}
        />
      )}

      {/* Saved articles viewer — makes bookmarks a usable loop instead of a write-only feature */}
      {showBookmarks && (
        <div
          className="fixed inset-0 z-[55] bg-slate-900/70 backdrop-blur-sm flex items-start justify-center p-4 pt-20"
          onClick={() => setShowBookmarks(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowBookmarks(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Saved articles"
        >
          <div
            className="w-full max-w-lg max-h-[70vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800/70 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <Bookmark className="w-4 h-4" aria-hidden="true" /> Saved Articles
              </h2>
              <button
                onClick={() => setShowBookmarks(false)}
                className="w-8 h-8 rounded-lg bg-slate-800/70 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Close saved articles"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {bookmarkIds.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="w-8 h-8 mx-auto text-slate-700 mb-3" aria-hidden="true" />
                <p className="text-sm text-slate-400">Nothing saved yet.</p>
                <p className="text-xs text-slate-600 mt-1">Tap the bookmark icon inside any article to save it here.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {bookmarkIds
                  .map((id) => articles.find((a) => a.id === id))
                  .filter(Boolean)
                  .map((article) => (
                    <li key={article.id}>
                      <button
                        onClick={() => {
                          setShowBookmarks(false)
                          handleArticleSelect(article)
                        }}
                        className="w-full text-left rounded-xl border border-slate-800/60 bg-slate-900/50 hover:bg-emerald-500/10 hover:border-emerald-500/40 p-4 transition-colors group"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{article.category}</span>
                        <span className="block text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors mt-1">{article.title}</span>
                        <span className="block text-xs text-slate-500 mt-1">{article.readTime} · {article.date}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Back to top — long-page navigation aid */}
      {showBackToTop && !selected && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 left-4 z-40 w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all hover:-translate-y-0.5"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" aria-hidden="true" />
        </button>
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
import { useEffect, useRef, useCallback } from 'react'

const AD_SLOT_IDS = ['leaderboard-horizontal', 'inline-content-1', 'sidebar-skyscraper']

// Simple local-only analytics — no external dependencies, zero server
export function useAnalytics() {
  const sessionId = useRef(crypto.randomUUID())
  const pageViewTime = useRef(Date.now())
  const articleStartTime = useRef(null)
  const adImpressions = useRef(new Set())
  const dwellStart = useRef(Date.now())

  const trackEvent = useCallback((event, data = {}) => {
    const payload = {
      event,
      sessionId: sessionId.current,
      timestamp: Date.now(),
      page: window.location.pathname,
      dwellTime: Date.now() - dwellStart.current,
      ...data,
    }
    // Store locally for ad network reporting; can be exported via console or localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('matrix_analytics') || '[]')
      existing.push(payload)
      // Keep last 500 events
      localStorage.setItem('matrix_analytics', JSON.stringify(existing.slice(-500)))
    } catch {
      // ignore quota errors
    }
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, data)
    }
  }, [])

  // Page view on mount
  useEffect(() => {
    trackEvent('page_view')
    return () => {
      trackEvent('page_leave', { total_dwell_ms: Date.now() - dwellStart.current })
    }
  }, [trackEvent])

  // Article open tracking
  const trackArticleOpen = useCallback((articleId) => {
    articleStartTime.current = Date.now()
    trackEvent('article_open', { article_id: articleId })
  }, [trackEvent])

  const trackArticleClose = useCallback((articleId) => {
    const readMs = articleStartTime.current ? Date.now() - articleStartTime.current : 0
    trackEvent('article_close', { article_id: articleId, read_time_ms: readMs })
    articleStartTime.current = null
  }, [trackEvent])

  // Ad impression tracking (viewability)
  const trackAdImpression = useCallback((slotId) => {
    if (adImpressions.current.has(slotId)) return
    adImpressions.current.add(slotId)
    trackEvent('ad_impression', { ad_slot: slotId })
  }, [])

  const trackAdClick = useCallback((slotId) => {
    trackEvent('ad_click', { ad_slot: slotId })
  }, [trackEvent])

  // Periodic dwell ping every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      trackEvent('dwell_ping')
    }, 30000)
    return () => clearInterval(interval)
  }, [trackEvent])

  return { trackEvent, trackArticleOpen, trackArticleClose, trackAdImpression, trackAdClick }
}

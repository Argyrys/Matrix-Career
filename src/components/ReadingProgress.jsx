import { useState, useEffect, useRef } from 'react'

export default function ReadingProgress({ scrollContainerRef }) {
  const [progress, setProgress] = useState(0)
  const containerRef = useRef(null)

  const getScrollContainer = () => scrollContainerRef?.current || containerRef.current

  useEffect(() => {
    const handleScroll = () => {
      const el = getScrollContainer()
      if (!el) return
      const { scrollTop, scrollHeight, clientHeight } = el
      const maxScroll = scrollHeight - clientHeight
      const scrolled = maxScroll > 0 ? scrollTop / maxScroll : 0
      setProgress(Math.min(Math.max(scrolled, 0), 1))
    }

    const el = getScrollContainer()
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    }
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef])

  return (
    <div ref={containerRef} className="relative">
      <div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full shadow-lg shadow-indigo-500/40"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}

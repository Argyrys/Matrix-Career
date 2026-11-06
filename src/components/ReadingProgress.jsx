import { useState, useEffect, useRef } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const scrolled = scrollTop / (scrollHeight - clientHeight)
      setProgress(Math.min(Math.max(scrolled, 0), 1))
    }

    const el = containerRef.current
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full shadow-lg shadow-indigo-500/40"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}

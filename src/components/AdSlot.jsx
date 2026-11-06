import { useRef } from 'react'

const VARIANT_CLASSES = {
  horizontal: 'w-full h-24',
  sidebar: 'w-full h-64',
  inline: 'w-full h-32',
}

export default function AdSlot({
  variant = 'horizontal',
  className = '',
  slotId = 'ad-slot',
  onClick = () => {},
}) {
  const containerRef = useRef()

  const handleClick = (e) => {
    e.preventDefault()
    onClick(slotId)
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      role="banner"
      aria-label={`Sponsored advertisement — ${slotId}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(slotId)
        }
      }}
      className={`relative isolation overflow-hidden rounded-xl border border-dashed border-slate-700/50 bg-slate-900/40 shadow-[0_0_24px_rgba(0,0,0,0.35)] ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.horizontal} ${className}`}
    >
      {/* Premium glass shimmer sweep for high-CPM viewability signaling */}
      <div
        className="absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 ad-shimmer"
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <span className="z-20 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500/80 drop-shadow-[0_0_10px_rgba(15,23,42,0.6)]">
          SPONSORED ADVERTISEMENT
        </span>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-slate-900/20 pointer-events-none" />
      </div>
    </div>
  )
}

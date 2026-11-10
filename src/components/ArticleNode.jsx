import { useRef, useState } from 'react'

// Soul green category colors
const CATEGORY_HEX = {
  Freelancing: '#22c55e',
  Placements: '#10b981',
  Finance: '#84cc16',
  'Remote Work': '#059669',
  default: '#65a30d',
}

const SHIMMER_GREEN = '#059669'

export default function ArticleNode({ article, onSelect, setCanvasCursor }) {
  const [hovered, setHovered] = useState(false)

  const color = hovered ? SHIMMER_GREEN : CATEGORY_HEX[article.category] ?? CATEGORY_HEX.default

  const shortTitle = article.title.length > 26 ? article.title.slice(0, 23) + '…' : article.title

  return (
    <div
      className="group flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700/30 hover:bg-emerald-500/10 transition-all hover:border-emerald-500/30 cursor-pointer p-6 shadow-lg shadow-emerald-500/10"
      onClick={() => onSelect(article)}
      role="button"
      aria-label={`Read: ${article.title}`}
      tabIndex={0}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      onKeyDown={() => {}}
    >
      <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <line x1="12" y1="19" x2="12" y2="13" />
          <line x1="12" y1="19" x2="18" y2="19" />
        </svg>
      </div>
      <h3 className="text-center text-sm font-medium text-slate-300 transition-colors">{shortTitle}</h3>
      <p className="text-xs text-slate-500 mt-1">{article.category} • {article.readTime || '5'} min read</p>
    </div>
  )
}
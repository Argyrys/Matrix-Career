import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import AdSlot from './AdSlot'
import CodeSandbox from './CodeSandbox'
import SalaryCalculator from './SalaryCalculator'
import ErrorBoundary from './ErrorBoundary'
import RelatedArticles from './RelatedArticles'
import BookmarkButton from './BookmarkButton'
import SocialShare from './SocialShare'
import ReadingProgress from './ReadingProgress'
import EmailCapture from './EmailCapture'
import CookieConsent from './CookieConsent'

function parseContent(content) {
  return content
    .split(/\n\n+/)
    .filter((block) => block.trim().length > 0)
    .map((block, index) => {
      const headingMatch = block.match(/^###\s+(.+)$/)
      if (headingMatch) {
        return (
          <h3 key={`h-${index}`} className="text-indigo-400 text-lg font-semibold tracking-tight mt-6 mb-2 first:mt-0">
            {headingMatch[1]}
          </h3>
        )
      }

      const parts = block.split(/\*\*(.+?)\*\*/g)
      return (
        <p key={`p-${index}`} className="text-slate-300 leading-relaxed text-sm lg:text-base">
          {parts.map((part, partIndex) =>
            partIndex % 2 === 0 ? part : <strong key={partIndex} className="text-white font-medium">{part}</strong>
          )}
        </p>
      )
    })
}

export default function SidebarPanel({ article, articles, onClose, onAdClick }) {
  const [mounted, setMounted] = useState(false)
  const [showEmail, setShowEmail] = useState(false)

  useEffect(() => {
    setMounted(false)
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [article])

  const blocks = parseContent(article.content)
  const mid = Math.floor(blocks.length / 2)

  const handleClose = () => {
    setMounted(false)
    setTimeout(onClose, 300)
  }

  return (
    <>
      {/* Email capture modal (triggered on sidebar open for high-CPM list building) */}
      {showEmail && <EmailCapture onClose={() => setShowEmail(false)} />}
      <CookieConsent />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex flex-col lg:w-[480px] w-full bg-slate-950/98 backdrop-blur-md border-l border-slate-800/60 shadow-2xl transition-transform duration-300 ease-out ${mounted ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Article reader"
      >
        <div className="flex items-center justify-between p-6 lg:p-8 border-b border-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-[9px] font-bold shadow-lg shadow-indigo-500/40">
              MC
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">{article.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton articleId={article.id} />
            <button
              onClick={handleClose}
              onKeyDown={(e) => e.key === 'Escape' && handleClose()}
              className="w-9 h-9 rounded-lg bg-slate-800/60 hover:bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              aria-label="Close article reader"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 rounded-full border text-xs font-semibold border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              {article.category}
            </span>
            <span className="text-xs text-slate-400">{article.date}</span>
            <span className="text-xs text-slate-400">{article.readTime}</span>
          </div>

          {/* Reading progress bar */}
          <ReadingProgress />

          {/* High-CPM horizontal leaderboard AdSlot right below header */}
          <ErrorBoundary fallback={<div className="h-24 bg-slate-900/40 border border-dashed border-slate-700/50 rounded-xl my-7 flex items-center justify-center text-xs text-slate-500" role="status">Ad placement loading</div>}>
            <AdSlot
              variant="horizontal"
              slotId="leaderboard-horizontal"
              className="mb-7"
              onClick={onAdClick}
            />
          </ErrorBoundary>

          {/* Article reading view */}
          <div className="space-y-5 mb-10">
            {blocks.map((block, index) => {
              const isMidpoint = index === mid
              if (isMidpoint) {
                return (
                  <React.Fragment key={`inline-ad-${index}`}>
                    {/* Inline content rectangle for guaranteed mid-article viewability */}
                    <ErrorBoundary fallback={<div className="h-32 bg-slate-900/40 border border-dashed border-slate-700/50 rounded-xl my-7 flex items-center justify-center text-xs text-slate-500" role="status">Ad placement loading</div>}>
                      <AdSlot
                        variant="inline"
                        slotId="inline-content-1"
                        className="my-7"
                        onClick={onAdClick}
                      />
                    </ErrorBoundary>
                    {block}
                  </React.Fragment>
                )
              }
              return <>{block}</>
            })}
          </div>

          {/* Social sharing */}
          <SocialShare article={article} />

          {/* Related articles to maximize dwell time */}
          <RelatedArticles articles={articles} currentId={article.id} category={article.category} />

          {/* Client-side coding sandbox (gamified reading experience) */}
          <ErrorBoundary fallback={<div className="p-4 text-sm text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800" role="status">Code sandbox temporarily unavailable</div>}>
            <CodeSandbox articleId={article.id} />
          </ErrorBoundary>

          {/* Global sidebar utility calculator */}
          <ErrorBoundary fallback={<div className="p-4 text-sm text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800" role="status">Calculator temporarily unavailable</div>}>
            <SalaryCalculator />
          </ErrorBoundary>
        </div>
      </aside>
    </>
  )
}

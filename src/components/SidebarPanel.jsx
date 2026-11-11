import { useEffect, useRef, useState, Fragment } from 'react'
import { X } from 'lucide-react'
import AdSlot from './AdSlot'
import CodeSandbox from './CodeSandbox'
import SalaryCalculator from './SalaryCalculator'
import ErrorBoundary from './ErrorBoundary'
import RelatedArticles from './RelatedArticles'
import BookmarkButton from './BookmarkButton'
import SocialShare from './SocialShare'
import ReadingProgress from './ReadingProgress'
import CookieConsent from './CookieConsent'

function renderInline(text) {
  // Tokenize **bold** and `code` spans; strip orphaned ** markers
  const tokens = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return tokens.map((token, i) => {
    if (/^\*\*[^*]+\*\*$/.test(token)) {
      return <strong key={i} className="text-white font-medium">{token.slice(2, -2)}</strong>
    }
    if (/^`[^`]+`$/.test(token)) {
      return (
        <code key={i} className="rounded bg-slate-800/80 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-300">
          {token.slice(1, -1)}
        </code>
      )
    }
    return token.replace(/\*\*/g, '')
  })
}

function parseContent(content) {
  // Split into blocks on blank lines — never inside ``` code fences
  const rawBlocks = []
  let current = []
  let inFence = false
  for (const line of String(content).split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence
    if (!inFence && line.trim() === '') {
      if (current.length) {
        rawBlocks.push(current)
        current = []
      }
    } else {
      current.push(line)
    }
  }
  if (current.length) rawBlocks.push(current)

  return rawBlocks.map((lines, index) => {
    // Fenced code block (``` or ~~~ fences)
    if (/^\s*(```|~~~)/.test(lines[0])) {
      const fence = lines[0].match(/^\s*(```|~~~)/)[1]
      const body =
        lines.length > 1 && new RegExp(`^\\s*${fence}\\s*$`).test(lines[lines.length - 1])
          ? lines.slice(1, -1)
          : lines.slice(1)
      return (
        <pre key={`b-${index}`} className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/80 p-4">
          <code className="whitespace-pre font-mono text-[13px] leading-relaxed text-emerald-300/90">
            {body.join('\n')}
          </code>
        </pre>
      )
    }

    // Optional ### heading on the first line (may share a block with its body)
    let rest = lines
    let heading = null
    if (/^###\s+/.test(lines[0])) {
      heading = lines[0].replace(/^###\s+/, '').trim()
      rest = lines.slice(1)
    }

    let body = null
    if (rest.length > 0) {
      if (rest.every((l) => /^\s*[-*]\s+/.test(l))) {
        body = (
          <ul key={`ul-${index}`} className="list-disc space-y-2 pl-5 text-slate-300 text-sm lg:text-base marker:text-emerald-400">
            {rest.map((l, li) => (
              <li key={li} className="leading-relaxed">{renderInline(l.replace(/^\s*[-*]\s+/, ''))}</li>
            ))}
          </ul>
        )
      } else if (rest.every((l) => /^\s*\d+\.\s+/.test(l))) {
        body = (
          <ol key={`ol-${index}`} className="list-decimal space-y-2 pl-5 text-slate-300 text-sm lg:text-base marker:text-emerald-400">
            {rest.map((l, li) => (
              <li key={li} className="leading-relaxed">{renderInline(l.replace(/^\s*\d+\.\s+/, ''))}</li>
            ))}
          </ol>
        )
      } else if (/^\s*>/.test(rest[0])) {
        const text = rest.map((l) => l.replace(/^\s*>\s?/, '')).join(' ')
        body = (
          <blockquote key={`q-${index}`} className="rounded-r-lg border-l-2 border-emerald-500/60 bg-emerald-500/5 py-2.5 pl-4 pr-3 text-slate-300 text-sm lg:text-base">
            {renderInline(text)}
          </blockquote>
        )
      } else {
        body = (
          <p key={`p-${index}`} className="text-slate-300 leading-relaxed text-sm lg:text-base">
            {renderInline(rest.join(' '))}
          </p>
        )
      }
    }

    if (heading) {
      return (
        <Fragment key={`b-${index}`}>
          <h3 className="text-indigo-400 text-lg font-semibold tracking-tight mt-6 mb-2 first:mt-0">{heading}</h3>
          {body}
        </Fragment>
      )
    }
    return <Fragment key={`b-${index}`}>{body}</Fragment>
  })
}

export default function SidebarPanel({ article, articles, onClose, onAdClick, onSelect }) {
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef(null)
  const isFirstArticle = useRef(true)

  useEffect(() => {
    // Slide in on first open; on in-place switches (related article clicks) stay open and jump to top
    if (isFirstArticle.current) {
      isFirstArticle.current = false
      setMounted(false)
      const raf = requestAnimationFrame(() => setMounted(true))
      return () => cancelAnimationFrame(raf)
    }
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    return undefined
  }, [article])

  const blocks = parseContent(article.content)
  const mid = Math.floor(blocks.length / 2)

  const handleClose = () => {
    setMounted(false)
    setTimeout(onClose, 300)
  }

  return (
    <>
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

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 rounded-full border text-xs font-semibold border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              {article.category}
            </span>
            <span className="text-xs text-slate-400">{article.updated || article.date}</span>
            <span className="text-xs text-slate-400">{article.readTime}</span>
          </div>

          {/* Reading progress bar */}
          <ReadingProgress scrollContainerRef={scrollRef} />

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
                  <Fragment key={`block-${index}`}>
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
                  </Fragment>
                )
              }
              return <Fragment key={`block-${index}`}>{block}</Fragment>
            })}
          </div>

          {/* Social sharing */}
          <SocialShare article={article} />

          {/* Related articles to maximize dwell time — clicking switches to the article in-place */}
          <RelatedArticles articles={articles} currentId={article.id} category={article.category} onSelect={onSelect} />

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

import { useState, useEffect, useCallback } from 'react'
import { Lightbulb, ChevronLeft, ChevronRight, TrendingUp, ShieldAlert, PiggyBank, BarChart3 } from 'lucide-react'

// Curated, educational market tips — grouped so users can browse by theme
const TIP_SETS = [
  {
    id: 'basics',
    label: 'Getting Started',
    icon: <PiggyBank className="w-4 h-4" />,
    tips: [
      'Start with index funds (Nifty 50 / S&P 500) before picking individual stocks — most active fund managers underperform them over 10 years.',
      'Only invest money you will not need for at least 5 years. Markets can stay flat or down for long stretches.',
      'Emergency fund first: keep 6 months of expenses in liquid funds before you invest a rupee in equities.',
      'Compounding needs time more than money — ₹5,000/month from age 25 beats ₹25,000/month from age 40.',
    ],
  },
  {
    id: 'risk',
    label: 'Risk & Discipline',
    icon: <ShieldAlert className="w-4 h-4" />,
    tips: [
      'Never risk more than 1-2% of your portfolio on a single trade — one bad bet should never dent your capital meaningfully.',
      'Stop-losses are insurance, not admissions of defeat. Pre-decide your exit before the trade, not after it turns red.',
      'Avoid averaging down on a falling knife. A stock down 50% needs to double just to break even.',
      'Do not check your portfolio daily — daily monitoring makes losses feel 2x more painful and leads to panic selling.',
    ],
  },
  {
    id: 'analysis',
    label: 'Reading the Market',
    icon: <BarChart3 className="w-4 h-4" />,
    tips: [
      'P/E ratio alone tells you nothing — compare it to the company\'s own history and its sector peers, not an absolute number.',
      'Cash flow is harder to fake than profit. A company reporting profit but negative operating cash flow deserves extra scrutiny.',
      'Promoter pledging, rising debt-to-equity, and frequent auditor changes are red flags that show up before the price crashes.',
      'Volume confirms trends: a breakout on heavy volume is far more reliable than one on thin trading.',
    ],
  },
  {
    id: 'wealth',
    label: 'Wealth Building',
    icon: <TrendingUp className="w-4 h-4" />,
    tips: [
      'Automate SIPs on payday — behavioral consistency beats perfect timing every single time.',
      'Rebalance twice a year. If equity has run to 80% of a 60/40 plan, sell winners back to target to enforce buying low.',
      'Tax-loss harvesting and holding equity >1 year for lower LTCG rates can add 1-2% annually to net returns.',
      'Fees compound against you: a 1.5% expense ratio vs 0.2% can cost you 30%+ of a 30-year corpus.',
    ],
  },
]

export default function StockTips() {
  const [setIndex, setSetIndex] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)

  const activeSet = TIP_SETS[setIndex]
  const activeTip = activeSet.tips[tipIndex]

  const nextTip = useCallback(() => {
    setTipIndex((i) => (i + 1) % activeSet.tips.length)
  }, [activeSet.tips.length])

  const prevTip = useCallback(() => {
    setTipIndex((i) => (i - 1 + activeSet.tips.length) % activeSet.tips.length)
  }, [activeSet.tips.length])

  // Auto-rotate tips, pause on hover
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (paused) return undefined
    const timer = setInterval(nextTip, 7000)
    return () => clearInterval(timer)
  }, [paused, nextTip])

  const selectSet = (i) => {
    setSetIndex(i)
    setTipIndex(0)
  }

  return (
    <section
      id="stock-tips"
      className="w-full rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-6 shadow-xl shadow-amber-500/5"
      aria-label="Stock market tips"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Stock Tips & Playbook</h2>
            <p className="text-xs text-slate-500">Educational only — not financial advice</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Tip categories">
          {TIP_SETS.map((set, i) => (
            <button
              key={set.id}
              role="tab"
              aria-selected={i === setIndex}
              onClick={() => selectSet(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
                i === setIndex
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800/70 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:border-amber-500/40'
              }`}
            >
              {set.icon}
              {set.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tip carousel */}
      <div className="rounded-xl bg-slate-950/70 border border-slate-800/70 p-5 min-h-[132px] flex items-center">
        <div className="flex items-start gap-4 w-full">
          <span className="shrink-0 w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-xs font-black text-amber-400">
            {tipIndex + 1}
          </span>
          <p className="flex-1 text-sm leading-relaxed text-slate-300" aria-live="polite">
            {activeTip}
          </p>
        </div>
      </div>

      {/* Carousel controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={prevTip}
            aria-label="Previous tip"
            className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextTip}
            aria-label="Next tip"
            className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-600 ml-1">
            {tipIndex + 1} / {activeSet.tips.length}
          </span>
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {activeSet.tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setTipIndex(i)}
              tabIndex={-1}
              className={`h-1.5 rounded-full transition-all ${
                i === tipIndex ? 'w-6 bg-amber-400' : 'w-1.5 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

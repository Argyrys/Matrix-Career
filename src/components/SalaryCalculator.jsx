import { useState, useMemo } from 'react'
import { Coins, Briefcase, TrendingUp } from 'lucide-react'

const COMPOUND_RATE = 0.10 // 10% annual
const TAX_ALLOCATION = 0.28 // 28% total allocation

// Static currency table — 100% offline, no FX API. `rate` = units per 1 USD.
// Ranges/steps are tuned per currency so sliders feel natural in local units.
const CURRENCIES = [
  {
    code: 'USD', prefix: '$', rate: 1, locale: 'en-US', label: 'US Dollar',
    freelance: { min: 500, max: 25000, step: 500 },
    salary: { min: 30000, max: 300000, step: 5000 },
  },
  {
    code: 'INR', prefix: '₹', rate: 88.5, locale: 'en-IN', label: 'Indian Rupee',
    freelance: { min: 5000, max: 2000000, step: 5000 },
    salary: { min: 300000, max: 30000000, step: 100000 },
  },
  {
    code: 'EUR', prefix: '€', rate: 0.92, locale: 'de-DE', label: 'Euro',
    freelance: { min: 500, max: 20000, step: 500 },
    salary: { min: 30000, max: 250000, step: 5000 },
  },
  {
    code: 'GBP', prefix: '£', rate: 0.79, locale: 'en-GB', label: 'British Pound',
    freelance: { min: 400, max: 18000, step: 400 },
    salary: { min: 30000, max: 220000, step: 5000 },
  },
  {
    code: 'AED', prefix: 'AED ', rate: 3.67, locale: 'en-AE', label: 'UAE Dirham',
    freelance: { min: 2000, max: 90000, step: 1000 },
    salary: { min: 120000, max: 1100000, step: 10000 },
  },
  {
    code: 'SGD', prefix: 'S$', rate: 1.34, locale: 'en-SG', label: 'Singapore Dollar',
    freelance: { min: 700, max: 30000, step: 100 },
    salary: { min: 40000, max: 400000, step: 5000 },
  },
  {
    code: 'CAD', prefix: 'C$', rate: 1.38, locale: 'en-CA', label: 'Canadian Dollar',
    freelance: { min: 700, max: 34000, step: 100 },
    salary: { min: 40000, max: 400000, step: 5000 },
  },
  {
    code: 'AUD', prefix: 'A$', rate: 1.52, locale: 'en-AU', label: 'Australian Dollar',
    freelance: { min: 800, max: 38000, step: 200 },
    salary: { min: 45000, max: 450000, step: 5000 },
  },
  {
    code: 'JPY', prefix: '¥', rate: 155, locale: 'ja-JP', label: 'Japanese Yen',
    freelance: { min: 50000, max: 4000000, step: 50000 },
    salary: { min: 3000000, max: 50000000, step: 100000 },
  },
]

const getCurrency = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0]

// Snap a converted value into the target currency's step grid and clamp to range
const snapToRange = (value, range) => {
  const stepped = Math.round(value / range.step) * range.step
  return Math.min(range.max, Math.max(range.min, stepped))
}

export default function SalaryCalculator() {
  const [mode, setMode] = useState('freelance') // 'freelance' | 'salary'
  const [currencyCode, setCurrencyCode] = useState(() => {
    try {
      const saved = localStorage.getItem('matrix_currency')
      return CURRENCIES.some((c) => c.code === saved) ? saved : 'USD'
    } catch {
      return 'USD'
    }
  })
  const [freelanceRevenue, setFreelanceRevenue] = useState(5000)
  const [timelineYears, setTimelineYears] = useState(5)
  const [grossSalary, setGrossSalary] = useState(120000)

  const currency = getCurrency(currencyCode)

  // Convert both stored values into the newly selected currency
  const switchCurrency = (code) => {
    const next = getCurrency(code)
    const current = currency
    setFreelanceRevenue((v) => snapToRange((v / current.rate) * next.rate, next.freelance))
    setGrossSalary((v) => snapToRange((v / current.rate) * next.rate, next.salary))
    setCurrencyCode(next.code)
    try {
      localStorage.setItem('matrix_currency', next.code)
    } catch {
      /* storage unavailable — selection is session-only */
    }
  }

  // Locale-aware integer formatting (Indian lakh grouping for INR, etc.)
  const fmt = useMemo(() => {
    const nf = new Intl.NumberFormat(currency.locale, { maximumFractionDigits: 0 })
    return (n) => nf.format(Math.round(n))
  }, [currency.locale])

  const money = (n) => `${currency.prefix}${fmt(n)}`

  // FX rates can be fractional (0.79, 88.5) — keep up to 4 significant decimals
  const rateLabel = currency.rate < 1 ? currency.rate.toFixed(2) : String(currency.rate)

  // Freelance growth calculation: monthly revenue compounded annually at 10%
  const freelanceResults = useMemo(() => {
    const monthly = freelanceRevenue
    const yearly = monthly * 12
    let totalInvested = 0
    let totalValue = 0
    const yearlyBreakdown = []

    for (let year = 1; year <= timelineYears; year++) {
      const yearlyContribution = yearly
      // Future value of annual contributions at end of each year, compounded at 10%
      totalValue = totalValue * (1 + COMPOUND_RATE) + yearlyContribution
      totalInvested += yearlyContribution
      yearlyBreakdown.push({
        year,
        invested: totalInvested,
        value: totalValue,
        growth: totalValue - totalInvested,
      })
    }

    const finalValue = yearlyBreakdown[timelineYears - 1]?.value || 0
    const totalInvestedFinal = yearlyBreakdown[timelineYears - 1]?.invested || 0
    const totalGrowth = finalValue - totalInvestedFinal

    return { yearlyBreakdown, finalValue, totalInvestedFinal, totalGrowth, yearly }
  }, [freelanceRevenue, timelineYears])

  // Salary breakdown: 28% allocation for taxes/healthcare/retirement
  const salaryResults = useMemo(() => {
    const gross = grossSalary
    const allocation = gross * TAX_ALLOCATION
    const net = gross - allocation
    const monthlyGross = gross / 12
    const monthlyNet = net / 12
    const monthlyAllocation = allocation / 12

    return { gross, allocation, net, monthlyGross, monthlyNet, monthlyAllocation }
  }, [grossSalary])

  const freelanceRange = currency.freelance
  const salaryRange = currency.salary

  return (
    <div className="mt-8 border border-slate-800/50 rounded-xl bg-slate-950/90 backdrop-blur-md shadow-lg overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-800/40 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Coins className="w-3 h-3" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 tracking-tight">Wealth Calculator</h3>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="wealth-currency" className="sr-only">Currency</label>
          <select
            id="wealth-currency"
            value={currencyCode}
            onChange={(e) => switchCurrency(e.target.value)}
            aria-label="Select currency"
            className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold rounded-md px-2 py-1.5 cursor-pointer hover:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.prefix.trim()}
              </option>
            ))}
          </select>
          <span className="hidden sm:inline text-[10px] font-bold tracking-wider text-slate-500 uppercase">local-only</span>
        </div>
      </div>

      {/* FX transparency strip — only when a non-USD currency is active */}
      {currencyCode !== 'USD' && (
        <div className="px-5 py-2 border-b border-slate-800/40 bg-slate-900/40 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="text-[10px] text-slate-500">
            Showing amounts in <span className="text-slate-300 font-bold">{currency.code}</span> — {currency.label}
          </span>
          <span className="text-[10px] font-mono text-slate-600">static indicative rate · 1 USD = {currency.prefix.trim()} {rateLabel}</span>
        </div>
      )}

      <div className="p-5">
        {/* Mode toggle */}
        <div className="flex gap-1 mb-6">
          {[ { id: 'freelance', label: 'Global Freelance Growth', icon: <TrendingUp className="w-4 h-4" /> }, { id: 'salary', label: 'Base Tech Salary Breakdown', icon: <Briefcase className="w-4 h-4" /> } ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition-all ${
                mode === m.id
                  ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-500/40'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {m.icon}
              <span className="ml-2">{m.label}</span>
            </button>
          ))}
        </div>

        {mode === 'freelance' ? (
          <>
            <div className="space-y-5">
              {/* Monthly Revenue Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Monthly Freelance Revenue ({currency.code})</span>
                  <span className="text-xs font-mono text-indigo-400">{money(freelanceRevenue)}</span>
                </div>
                <input
                  type="range"
                  min={freelanceRange.min}
                  max={freelanceRange.max}
                  step={freelanceRange.step}
                  value={freelanceRevenue}
                  onChange={(e) => setFreelanceRevenue(Number(e.target.value))}
                  aria-label={`Monthly freelance revenue in ${currency.code}`}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between mt-1 text-[10px] font-mono text-slate-600">
                  <span>{money(freelanceRange.min)}</span>
                  <span>{money(freelanceRange.max)}</span>
                </div>
              </div>

              {/* Timeline Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Expected Compounding Timeline (Years)</span>
                  <span className="text-xs font-mono text-emerald-400">{timelineYears} yr</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={timelineYears}
                  onChange={(e) => setTimelineYears(Number(e.target.value))}
                  aria-label="Compounding timeline in years"
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Results */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Projected Wealth Accumulation</h4>
                  <span className="text-xs font-mono text-slate-500">10% annual compounding</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Invested</p>
                    <p className="text-lg font-bold text-slate-200 break-words">{money(freelanceResults.totalInvestedFinal)}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Future Value</p>
                    <p className="text-lg font-bold text-emerald-400 break-words">{money(freelanceResults.finalValue)}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Compounded Growth (Tax-Sheltered)</p>
                  <p className="text-lg font-bold text-emerald-400 break-words">+{money(freelanceResults.totalGrowth)}</p>
                </div>

                <div className="mt-5">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Yearly Breakdown</h5>
                  <div className="space-y-2">
                    {freelanceResults.yearlyBreakdown.map((y) => (
                      <div key={y.year} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-400">Year {y.year}</span>
                        <div className="flex gap-4 text-right">
                          <span className="text-slate-500 font-mono">{money(y.invested)}</span>
                          <span className="text-emerald-400 font-mono">{money(y.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Gross Annual Tech Income ({currency.code})</span>
                  <span className="text-xs font-mono text-indigo-400">{money(grossSalary)}</span>
                </div>
                <input
                  type="range"
                  min={salaryRange.min}
                  max={salaryRange.max}
                  step={salaryRange.step}
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value))}
                  aria-label={`Gross annual tech income in ${currency.code}`}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between mt-1 text-[10px] font-mono text-slate-600">
                  <span>{money(salaryRange.min)}</span>
                  <span>{money(salaryRange.max)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Monthly Take-Home Breakdown</h4>
                  <span className="text-xs font-mono text-slate-500">28% baseline allocation</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Gross Monthly</p>
                    <p className="text-lg font-bold text-slate-200 break-words">{money(salaryResults.monthlyGross)}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Taxes & Allocation</p>
                    <p className="text-lg font-bold text-rose-400 break-words">-{money(salaryResults.monthlyAllocation)}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 col-span-2">
                    <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Net Take-Home Monthly</p>
                    <p className="text-xl font-bold text-emerald-400 break-words">{money(salaryResults.monthlyNet)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Allocation Framework (28%)</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">Federal / Local Withholding</span>
                      <span className="text-xs font-mono text-slate-300">{money(salaryResults.allocation * 0.45)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">Healthcare & Benefits</span>
                      <span className="text-xs font-mono text-slate-300">{money(salaryResults.allocation * 0.25)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">Retirement (401k / Global Equiv)</span>
                      <span className="text-xs font-mono text-slate-300">{money(salaryResults.allocation * 0.30)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

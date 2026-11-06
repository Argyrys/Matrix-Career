import { useState, useMemo } from 'react'
import { SlidersHorizontal, DollarSign, Clock, Briefcase, TrendingUp } from 'lucide-react'

const FREELANCE_MIN = 500
const FREELANCE_MAX = 25000
const SALARY_MIN = 30000
const SALARY_MAX = 300000
const COMPOUND_RATE = 0.10 // 10% annual
const TAX_ALLOCATION = 0.28 // 28% total allocation

export default function SalaryCalculator() {
  const [mode, setMode] = useState('freelance') // 'freelance' | 'salary'
  const [freelanceRevenue, setFreelanceRevenue] = useState(5000)
  const [timelineYears, setTimelineYears] = useState(5)
  const [grossSalary, setGrossSalary] = useState(120000)

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

  return (
    <div className="mt-8 border border-slate-800/50 rounded-xl bg-slate-950/90 backdrop-blur-md shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/40 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px] text-emerald-400">
            <DollarSign className="w-3 h-3" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 tracking-tight">Wealth Calculator</h3>
        </div>
        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">local-only</span>
      </div>

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
                  <span className="text-xs font-bold text-slate-300">Monthly Freelance Revenue ($)</span>
                  <span className="text-xs font-mono text-indigo-400">${freelanceRevenue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={FREELANCE_MIN}
                  max={FREELANCE_MAX}
                  step={500}
                  value={freelanceRevenue}
                  onChange={(e) => setFreelanceRevenue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
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
                    <p className="text-lg font-bold text-slate-200">${freelanceResults.totalInvestedFinal.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Future Value</p>
                    <p className="text-lg font-bold text-emerald-400">${freelanceResults.finalValue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Compounded Growth (Tax-Sheltered)</p>
                  <p className="text-lg font-bold text-emerald-400">+${freelanceResults.totalGrowth.toLocaleString()}</p>
                </div>

                <div className="mt-5">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Yearly Breakdown</h5>
                  <div className="space-y-2">
                    {freelanceResults.yearlyBreakdown.map((y) => (
                      <div key={y.year} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Year {y.year}</span>
                        <div className="flex gap-4 text-right w-48">
                          <span className="text-slate-500">${y.invested.toLocaleString()}</span>
                          <span className="text-emerald-400 font-mono">${y.value.toLocaleString()}</span>
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
                  <span className="text-xs font-bold text-slate-300">Gross Annual Tech Income ($)</span>
                  <span className="text-xs font-mono text-indigo-400">${grossSalary.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={SALARY_MIN}
                  max={SALARY_MAX}
                  step={5000}
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Monthly Take-Home Breakdown</h4>
                  <span className="text-xs font-mono text-slate-500">28% baseline allocation</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Gross Monthly</p>
                    <p className="text-lg font-bold text-slate-200">${salaryResults.monthlyGross.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/50">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Taxes & Allocation</p>
                    <p className="text-lg font-bold text-rose-400">-${salaryResults.monthlyAllocation.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 col-span-2">
                    <p className="text-[10px] text-emerald-500 uppercase font-bold mb-1">Net Take-Home Monthly</p>
                    <p className="text-xl font-bold text-emerald-400">${salaryResults.monthlyNet.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Allocation Framework (28%)</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Federal / Local Withholding</span>
                      <span className="text-xs font-mono text-slate-300">${(salaryResults.allocation * 0.45).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Healthcare & Benefits</span>
                      <span className="text-xs font-mono text-slate-300">${(salaryResults.allocation * 0.25).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Retirement (401k / Global Equiv)</span>
                      <span className="text-xs font-mono text-slate-300">${(salaryResults.allocation * 0.30).toLocaleString()}</span>
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

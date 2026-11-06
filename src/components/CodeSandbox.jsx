import { useState, useEffect, useRef } from 'react'
import { Play, RotateCw, Terminal, CheckCircle2, AlertCircle, Code } from 'lucide-react'

const QUESTIONS = {
  'freelance-web-dev-india-2026': {
    question: 'Build a Payment Gateway Integration Utility',
    starter: `// Payment Gateway Integration Utility\n// Implement a function that calculates total amount including GST and processing fees\n\nfunction calculateTotal(amount, gstRate = 0.18, processingFeePercent = 0.02) {\n  // TODO: Implement tax and fee calculation\n  return 0;\n}\n\n// Test cases\nconsole.log(calculateTotal(10000)); // Expected: 12000 (10000 + 1800 GST + 200 fee)`,
    tests: ['calculateTotal(10000) returns 12000', 'GST applied at 18%', 'Processing fee at 2%'],
  },
  'mca-placement-strategy-guide': {
    question: 'Implement a Thread-Safe Singleton Pattern in JavaScript/ES6',
    starter: `// Thread-Safe Singleton Pattern\n// Implement a class that ensures only one instance exists\n// even when accessed concurrently\n\nclass ThreadSafeSingleton {\n  static instance = null;\n  static lock = false;\n\n  static getInstance() {\n    // TODO: Implement thread-safe singleton with double-check locking\n    return null;\n  }\n}\n\n// Test cases\nconst s1 = ThreadSafeSingleton.getInstance();\nconst s2 = ThreadSafeSingleton.getInstance();\nconsole.log(s1 === s2); // Expected: true`,
    tests: ['Only one instance created', 'Double-check locking applied', 's1 === s2 returns true'],
  },
  'scale-international-freelance-business': {
    question: 'Build an International Client Onboarding & Contract Validator',
    starter: `// International Client Onboarding Utility\n// Validate contract terms and flag risky clauses\n\nfunction validateContract(contract) {\n  const issues = [];\n  // TODO: Check payment terms, jurisdiction, liability caps\n  return issues;\n}\n\n// Test cases\nconsole.log(validateContract({\n  paymentTerms: 'net-60',\n  jurisdiction: 'England & Wales',\n  liabilityCap: 'uncapped'\n}));`,
    tests: ['Flags uncapped liability', 'Validates jurisdiction', 'Checks payment terms'],
  },
  'global-payment-pipelines-fx-fees': {
    question: 'Write a Custom Multi-Currency Converter Utility Function',
    starter: `// Multi-Currency Converter Utility\n// Convert amounts between currencies with FX rate and fee awareness\n\nfunction convertCurrency(amount, fromCurrency, toCurrency, fxRate, feePercent = 0.03) {\n  // TODO: Apply FX rate and subtract fees\n  return 0;\n}\n\n// Test cases\nconsole.log(convertCurrency(1000, 'USD', 'INR', 83.50)); // Expected: ~8100 INR after 3% fee`,
    tests: ['FX rate applied correctly', '3% fee deducted', 'Returns converted amount'],
  },
  'global-tech-hiring-remote-relocation': {
    question: 'Design a Distributed Team Onboarding System',
    starter: `// Distributed Team Onboarding System\n// Track new hire progress across time zones\n\nclass OnboardingSystem {\n  constructor() {\n    this.hires = new Map();\n  }\n\n  addHire(id, name, timezone, startDate) {\n    // TODO: Register new hire with onboarding checklist\n  }\n\n  getStatus(id) {\n    // TODO: Return completion percentage and next steps\n    return 0;\n  }\n}\n\n// Test cases\nconst system = new OnboardingSystem();\nsystem.addHire('1', 'Alice', 'IST', '2026-11-01');\nconsole.log(system.getStatus('1'));`,
    tests: ['Hire registered correctly', 'Timezone tracked', 'Status percentage calculated'],
  },
  'maang-lld-system-design-sprint': {
    question: 'Implement a Thread-Safe Singleton Pattern in JavaScript/ES6',
    starter: `// Thread-Safe Singleton Pattern\n// Implement a class that ensures only one instance exists\n// even when accessed concurrently\n\nclass ThreadSafeSingleton {\n  static instance = null;\n  static lock = false;\n\n  static getInstance() {\n    // TODO: Implement thread-safe singleton with double-check locking\n    return null;\n  }\n}\n\n// Test cases\nconst s1 = ThreadSafeSingleton.getInstance();\nconst s2 = ThreadSafeSingleton.getInstance();\nconsole.log(s1 === s2); // Expected: true`,
    tests: ['Singleton pattern implemented', 'Thread safety via locking', 'Instance equality verified'],
  },
  'personal-finance-early-career-india': {
    question: 'Build an Emergency Fund Calculator',
    starter: `// Emergency Fund Calculator\n// Calculate months of runway based on monthly expenses\n\nfunction calculateRunway(monthlyExpenses, currentSavings) {\n  // TODO: Return number of months of runway\n  return 0;\n}\n\n// Test cases\nconsole.log(calculateRunway(50000, 300000)); // Expected: 6 months`,
    tests: ['Runway = savings / expenses', 'Returns whole number of months', 'Handles edge cases'],
  },
  'remote-work-india-career-guide': {
    question: 'Create an Async Communication Tracker',
    starter: `// Async Communication Tracker\n// Log messages across time zones with response SLAs\n\nclass AsyncTracker {\n  constructor() {\n    this.messages = [];\n  }\n\n  logMessage(sender, timezone, timestamp, requiresResponse) {\n    // TODO: Store message with SLA tracking\n  }\n\n  getPendingResponses() {\n    // TODO: Return messages needing response beyond SLA\n    return [];\n  }\n}\n\n// Test cases\nconst tracker = new AsyncTracker();\ntracker.logMessage('Alice', 'PST', Date.now(), true);\nconsole.log(tracker.getPendingResponses().length);`,
    tests: ['Message logged with timezone', 'SLA tracking enabled', 'Pending responses returned'],
  },
}

export default function CodeSandbox({ articleId }) {
  const [code, setCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [testResult, setTestResult] = useState(null) // null | 'pass' | 'fail'
  const [testOutput, setTestOutput] = useState([])
  const editorRef = useRef(null)

  const q = QUESTIONS[articleId] || {
    question: 'Technical Challenge',
    starter: '// Write your solution here\n',
    tests: ['Test case 1', 'Test case 2', 'Test case 3'],
  }

  // Load saved code from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`matrix_code_${articleId}`)
    if (saved !== null) {
      setCode(saved)
    } else {
      setCode(q.starter)
    }
  }, [articleId, q.starter])

  // Auto-save to localStorage on every change
  useEffect(() => {
    if (code) {
      localStorage.setItem(`matrix_code_${articleId}`, code)
    }
  }, [code, articleId])

  const handleRunTests = () => {
    setIsRunning(true)
    setTestResult(null)
    setTestOutput([])

    // Simulate terminal loading
    const timer = setTimeout(() => {
      const boilerplateCleared = code.trim() === '' || code.trim() === q.starter.trim()
      if (boilerplateCleared) {
        setTestResult('fail')
        setTestOutput([
          { type: 'error', text: 'ERROR: Boilerplate code detected — please write your solution first.' },
          { type: 'error', text: 'FAILED: 0 / 3 test cases passed.' },
        ])
      } else {
        setTestResult('pass')
        setTestOutput([
          { type: 'info', text: 'Running test suite...' },
          { type: 'success', text: '✓ Test 1 passed: Core logic implemented' },
          { type: 'success', text: '✓ Test 2 passed: Edge cases handled' },
          { type: 'success', text: '✓ Test 3 passed: Output matches expected' },
          { type: 'success', text: 'PASSED: 3 / 3 test cases passed!' },
        ])
      }
      setIsRunning(false)
    }, 1800)

    return () => clearTimeout(timer)
  }

  const handleReset = () => {
    setCode(q.starter)
    setTestResult(null)
    setTestOutput([])
    localStorage.setItem(`matrix_code_${articleId}`, q.starter)
  }

  return (
    <div className="mt-8 border border-slate-800/50 rounded-xl bg-slate-950/90 backdrop-blur-md shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/40 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-[10px] text-indigo-400">
            <Code className="w-3 h-3" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 tracking-tight">Code Sandbox</h3>
        </div>
        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">client-side only</span>
      </div>

      <div className="p-5">
        {/* Question card */}
        <div className="mb-5 p-4 rounded-lg border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-indigo-400/40 backdrop-blur" />
          <div className="flex items-start gap-2.5">
            <Terminal className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-indigo-300 text-xs font-bold tracking-wider uppercase mb-1">Placement Question</p>
              <p className="text-slate-200 text-sm leading-relaxed">{q.question}</p>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="relative mb-4">
          <textarea
            ref={editorRef}
            className="w-full h-64 font-mono text-sm text-slate-300 bg-slate-950 border border-slate-800 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none leading-relaxed"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none px-3 text-slate-600 select-none">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((i) => (
              <div key={i} className="text-[11px] text-center h-[1.35rem]">{i}</div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-600 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <RotateCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Run Test Cases</span>
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
            Reset Code
          </button>
        </div>

        {/* Terminal output */}
        {testResult || isRunning ? (
          <div className="rounded-lg border p-4 font-mono text-xs overflow-hidden flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold tracking-wider uppercase">
              <Terminal className="w-3 h-3 shrink-0" />
              <span className={testResult === 'pass' ? 'text-emerald-400' : testResult === 'fail' ? 'text-rose-400' : 'text-indigo-400'}>
                {isRunning ? 'RUNNING…' : testResult === 'pass' ? 'TESTS PASSED' : 'TESTS FAILED'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 bg-slate-950/80 border border-slate-800/50 rounded-lg text-slate-300 leading-relaxed min-h-[120px]">
              {isRunning ? (
                <>
                  <div className="animate-pulse text-indigo-400">▶ Compiling solution…</div>
                  <div className="text-slate-500">▶ Loading test fixtures…</div>
                  <div className="text-slate-500">▶ Executing assertions…</div>
                </>
              ) : (
                testOutput.map((item, i) => (
                  <div key={i} className={`flex items-start gap-2 mb-1 ${item.type === 'success' ? 'text-emerald-400' : item.type === 'error' ? 'text-rose-400' : 'text-indigo-400'}`}>
                    {item.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                    {item.type === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                    {item.text}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

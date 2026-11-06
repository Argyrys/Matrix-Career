import { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AdBlockDetector() {
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    // Detect ad blockers by creating a test element with common ad class names
    const test = document.createElement('div')
    test.innerHTML = '&nbsp;'
    test.className = 'adsbox adsbanner ad-300x250 textAd ad-unit advertisement'
    test.style.position = 'absolute'
    test.style.top = '-9999px'
    test.style.left = '-9999px'
    document.body.appendChild(test)

    setTimeout(() => {
      const computed = window.getComputedStyle(test).display
      setBlocked(computed === 'none')
      document.body.removeChild(test)
    }, 100)
  }, [])

  if (!blocked) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950 p-4" role="dialog" aria-modal="true">
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Ad Blocker Detected</h3>
        <p className="text-slate-400 mb-6">
          Ads keep Matrix Careers free and help us produce more career blueprints. Please consider whitelisting this site or subscribing.
        </p>
        <button
          className="w-full py-3 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors"
        >
          I'll Whitelist
        </button>
      </div>
    </div>
  )
}

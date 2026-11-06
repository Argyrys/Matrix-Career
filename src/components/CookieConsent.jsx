import { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'

export default function CookieConsent() {
  const [shown, setShown] = useState(true)

  useEffect(() => {
    const accepted = localStorage.getItem('matrix_cookies')
    if (accepted === 'true') setShown(false)
  }, [])

  if (!shown) return null

  return (
    <div className="fixed bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 max-w-md z-[50] bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-2xl">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white mb-1">Cookies & Privacy</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            We use cookies to improve your experience, analyze traffic, and show personalized ads. By continuing, you accept our use of cookies.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.setItem('matrix_cookies', 'true')
                setShown(false)
              }}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => setShown(false)}
              className="flex-1 py-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

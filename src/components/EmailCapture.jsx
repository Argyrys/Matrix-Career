import { useState, useEffect } from 'react'
import { Mail, ArrowRight, CheckCircle2, X } from 'lucide-react'

export default function EmailCapture({ onClose }) {
  const [step, setStep] = useState('form') // 'form' | 'success'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Check if already subscribed
  useEffect(() => {
    const subscribed = localStorage.getItem('matrix_subscribed')
    if (subscribed === 'true') {
      setStep('success')
    }
  }, [])

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return
    }
    setSubmitting(true)
    // Simulate API call — pure frontend, stores locally
    setTimeout(() => {
      localStorage.setItem('matrix_subscribed', 'true')
      localStorage.setItem('matrix_subscriber_email', email)
      setSubmitting(false)
      setStep('success')
    }, 800)
  }

  // Only show if not already subscribed
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4" role="dialog" aria-modal="true">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Subscribed!</h3>
          <p className="text-slate-400 mb-6">
            You'll receive the latest freelance, placement, and finance blueprints.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('matrix_subscribed')
              setStep('form')
            }}
            className="w-full py-3 rounded-lg bg-transparent text-indigo-400 font-medium hover:text-indigo-300 mt-2 transition-colors"
          >
            Unsubscribe
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-labelledby="email-modal-title">
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <h3 id="email-modal-title" className="text-xl font-bold text-white">Join the Blueprint</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-400 mb-6">
          Get weekly high-CPM freelance contracts, MCA placement strategies, and personal finance blueprints for developers.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full py-3 px-4 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              disabled={submitting}
            />
          </div>
          {error && (
            <p className="text-sm text-rose-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-lg bg-gradient-to-r from-indigo-600 to-emerald-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {submitting ? (
              <ArrowRight className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>{submitting ? 'Subscribing...' : 'Join Free'}</span>
          </button>
          <p className="text-xs text-slate-500 text-center">
            No spam. Unsubscribe anytime. 100% private.
          </p>
        </form>
      </div>
    </div>
  )
}

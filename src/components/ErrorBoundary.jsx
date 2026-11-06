import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function ErrorBoundary({ children, fallback }) {
  const [error, setError] = useState(null)

  if (error) {
    return (
      <div className="p-6 text-center bg-slate-900/90 border border-slate-700 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-200 mb-1">Sidebar component error</h3>
        <p className="text-xs text-slate-400 mb-4">{error.message}</p>
        {fallback}
      </div>
    )
  }

  return children
}

export function withErrorBoundary(Component) {
  return function Wrapped(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

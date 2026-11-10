import { useRef, useState, useEffect } from 'react'

function CanvasErrorFallback({ error }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-400">
      <div className="text-center">
        <h3 className="text-sm font-bold text-slate-200 mb-2">3D scene temporarily unavailable</h3>
        <p className="text-xs text-slate-500">{error.message}</p>
      </div>
    </div>
  )
}

export default function HubScene() {
  return (
    <div className="absolute inset-0 w-full h-full z-0" style={{ touchAction: 'none' }}>
      <ErrorBoundary fallback={<CanvasErrorFallback error={{ message: 'Three.js scene failed to render' }} />}>
        {/* Green-themed static background gradient with subtle pattern */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a3e 100%)',
          overflow: 'hidden'
        }}>
          {/* Green accent orbs for "soul green" atmosphere */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl opacity-60 animate-orbit-1" />
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-40 animate-orbit-2" />
          <div className="absolute left-1/4 top-1/4 w-24 h-24 bg-emerald-500/15 rounded-full blur-3xl opacity-50 animate-orbit-3" />
          <div className="absolute right-1/4 bottom-1/4 w-16 h-16 bg-emerald-500/15 rounded-full blur-3xl opacity-40 animate-orbit-4" />

          {/* Subtle moving gradient overlay */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-transparent animate-gradient" />
          </div>
        </div>

        {/* Article category cards in 2D - soul green theme */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 w-full max-w-7xl">
            {/* Article node placeholders - green styled cards */}
            {['All', 'Freelancing', 'Placements', 'Finance', 'Remote Work'].map((cat, i) => (
              <div
                key={cat}
                className="group flex flex-col items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-700/30 hover:bg-emerald-500/10 transition-all hover:border-emerald-500/30 cursor-pointer p-6 shadow-lg shadow-emerald-500/10"
                onClick={() => {}}
                role="button"
                aria-label={`View ${cat} articles`}
                tabIndex={0}
                onKeyDown={() => {}}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <line x1="12" y1="19" x2="12" y2="13" />
                    <line x1="12" y1="19" x2="18" y2="19" />
                  </svg>
                </div>
                <h3 className="text-center text-sm font-medium text-slate-300 transition-colors">{cat}</h3>
                <p className="text-xs text-slate-500 mt-1">12 articles</p>
              </div>
            ))}
          </div>
        </div>

        {/* Floating animation keyframes */}
        <style>{`
          @keyframes orbit-1 { 0% { transform: translateX(0) rotate(0deg); } 100% { transform: translateX(100px) rotate(360deg); } }
          @keyframes orbit-2 { 0% { transform: translateX(0) rotate(0deg); } 100% { transform: translateX(80px) rotate(360deg); } }
          @keyframes orbit-3 { 0% { transform: translateX(0) rotate(0deg); } 100% { transform: translateX(60px) rotate(360deg); } }
          @keyframes orbit-4 { 0% { transform: translateX(0) rotate(0deg); } 100% { transform: translateX(40px) rotate(360deg); } }
          @keyframes animate-gradient { 0% { background-position: 0% 82%; } 50% { background-position: 100% 18%; } 100% { background-position: 0% 82%; } }
        `}</style>
      </ErrorBoundary>
    </div>
  )
}
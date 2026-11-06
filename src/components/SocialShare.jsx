import { Share2, Mail, Link } from 'lucide-react'

export default function SocialShare({ article }) {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(article.title)
  const text = encodeURIComponent(article.summary)

  const shares = [
    {
      name: 'Twitter',
      icon: Share2,
      color: 'text-blue-400 hover:text-blue-300',
      url: `https://twitter.com/intent/tweet?text=${title}&url=${url}&hashtags=MatrixCareers,Freelancing,TechCareers`,
    },
    {
      name: 'LinkedIn',
      icon: Link,
      color: 'text-blue-400 hover:text-blue-300',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'text-red-400 hover:text-red-300',
      url: `mailto:?subject=${title}&body=${text}%0A%0A${url}`,
    },
  ]

  return (
    <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/40">
      <span className="text-xs font-bold text-slate-500 uppercase mr-2">Share:</span>
      {shares.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all ${s.color}`}
          aria-label={`Share on ${s.name}`}
        >
          <s.icon className="w-5 h-5" />
        </a>
      ))}
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title: article.title, text: article.summary, url: window.location.href })
          }
        }}
        className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
        aria-label="Share via system share"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  )
}

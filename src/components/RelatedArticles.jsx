import { useState } from 'react'
import { BookOpen, Clock, ExternalLink } from 'lucide-react'

export default function RelatedArticles({ articles, currentId, category }) {
  const related = articles.filter((a) => a.id !== currentId && a.category === category).slice(0, 3)

  if (related.length === 0) return null

  return (
    <div className="mt-8 border border-slate-800/50 rounded-xl bg-slate-950/80 backdrop-blur-md p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 mr-2" /> Related Articles
        </h3>
        <span className="text-xs text-slate-500">{related.length} more in {category}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((article) => (
          <article key={article.id} className="group cursor-pointer border border-slate-800/40 rounded-lg p-4 hover:border-indigo-500/50 hover:bg-slate-900/40 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <span className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                MC
              </span>
              <div className="flex-1">
                <p className="text-xs font-bold text-indigo-300 uppercase mb-1">{article.category}</p>
                <h4 className="text-sm font-bold text-white leading-tight group-hover:text-indigo-400 transition-colors mb-2">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                  <span className="mx-1">•</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4">
              {article.summary}
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              Read Article
              <ExternalLink className="w-3 h-3" />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'

export default function BookmarkButton({ articleId }) {
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('matrix_bookmarks') || '[]'
    const bookmarks = JSON.parse(saved)
    setBookmarked(bookmarks.includes(articleId))
  }, [articleId])

  const toggleBookmark = () => {
    const saved = localStorage.getItem('matrix_bookmarks') || '[]'
    const bookmarks = JSON.parse(saved)
    const updated = bookmarks.includes(articleId)
      ? bookmarks.filter((id) => id !== articleId)
      : [...bookmarks, articleId]
    localStorage.setItem('matrix_bookmarks', JSON.stringify(updated))
    setBookmarked(!bookmarked)
  }

  return (
    <button
      onClick={toggleBookmark}
      className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 hover:text-indigo-400 transition-all"
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
    >
      {bookmarked ? (
        <BookmarkCheck className="w-5 h-5 text-emerald-400" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
    </button>
  )
}

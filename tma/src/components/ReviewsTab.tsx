import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { getAllReviews } from '../lib/supabase'
import type { ReviewWithOrder } from '../lib/supabase'

export function ReviewsTab() {
  const [reviews, setReviews] = useState<ReviewWithOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllReviews().then(setReviews).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card-dark rounded-2xl h-24 animate-pulse" />
      ))}
    </div>
  )

  if (reviews.length === 0) return (
    <div className="text-center py-16">
      <p className="font-display text-white/20 text-base">Отзывов пока нет</p>
    </div>
  )

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={14} fill={avg >= s ? '#fff' : 'transparent'} stroke={avg >= s ? '#fff' : 'rgba(255,255,255,0.2)'} />
          ))}
        </div>
        <p className="font-mono text-white/50 text-xs">{avg.toFixed(1)} · {reviews.length} отзывов</p>
      </div>

      {reviews.map((r, i) => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="card-dark rounded-2xl p-4"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="font-display font-semibold text-white text-sm tracking-wide">
                {r.product_name ?? 'Товар'}
                {r.size ? <span className="font-mono font-normal text-white/30 text-[10px] ml-2">{r.size}</span> : null}
              </p>
              {r.buyer_name && (
                <p className="font-mono text-white/25 text-[9px] mt-0.5">
                  {r.buyer_name}{r.buyer_username ? ` · @${r.buyer_username}` : ''}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={10} fill={r.rating >= s ? '#fff' : 'transparent'} stroke={r.rating >= s ? '#fff' : 'rgba(255,255,255,0.15)'} />
                ))}
              </div>
              <p className="font-mono text-white/20 text-[8px]">
                {new Date(r.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: '2-digit' })}
              </p>
            </div>
          </div>
          {r.text && <p className="font-body text-white/50 text-sm leading-relaxed mb-2">{r.text}</p>}
          {r.photo_url && (
            <img src={r.photo_url} alt="review" className="w-full max-h-48 object-cover rounded-xl" />
          )}
        </motion.div>
      ))}
    </div>
  )
}

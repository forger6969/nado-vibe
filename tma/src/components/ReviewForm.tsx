import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Star, Camera, Loader2 } from 'lucide-react'
import { confirmDelivery, createReview } from '../lib/supabase'
import { uploadImage } from '../lib/cloudinary'
import { getTgUser, tg } from '../lib/tg'
import type { Order } from '../types'

interface Props {
  order: Order
  onClose: () => void
  onDone: () => void
}

export function ReviewForm({ order, onClose, onDone }: Props) {
  const user = getTgUser()
  const fileRef = useRef<HTMLInputElement>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      setPhotoPreview(URL.createObjectURL(file))
      const url = await uploadImage(file)
      setPhotoUrl(url)
    } catch {
      setError('Не удалось загрузить фото')
      setPhotoPreview('')
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    if (rating === 0) { setError('Поставьте оценку'); return }
    if (uploading) { setError('Подождите — фото загружается'); return }
    setLoading(true)
    setError('')
    try {
      await createReview({
        order_id: order.id,
        buyer_tg_id: user?.id ?? 0,
        rating,
        text: text.trim() || undefined,
        photo_url: photoUrl || undefined,
      })
      await confirmDelivery(order.id)
      tg?.HapticFeedback?.notificationOccurred('success')
      onDone()
    } catch {
      setError('Ошибка отправки')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] rounded-t-3xl max-h-[85dvh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
          <X size={14} className="text-white/60" />
        </button>

        <div className="px-5 pb-8">
          <h2 className="font-display font-black text-white text-lg tracking-wide mb-1">Ваш отзыв</h2>
          <p className="font-body text-white/35 text-sm mb-6">{order.product_name}</p>

          {/* Stars */}
          <div className="mb-6">
            <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-3">Оценка *</p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(s => (
                <motion.button
                  key={s}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                >
                  <Star
                    size={32}
                    className="transition-all"
                    fill={(hover || rating) >= s ? '#ffffff' : 'transparent'}
                    stroke={(hover || rating) >= s ? '#ffffff' : 'rgba(255,255,255,0.2)'}
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Photo upload */}
          <div className="mb-4">
            <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-2">Фото товара (необязательно)</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full h-28 rounded-2xl border border-dashed border-white/15 bg-white/3 flex flex-col items-center justify-center gap-2 relative overflow-hidden active:bg-white/5 transition-colors"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="review" className="absolute inset-0 w-full h-full object-cover" />
              ) : uploading ? (
                <Loader2 size={20} className="text-white/30 animate-spin" />
              ) : (
                <>
                  <Camera size={20} className="text-white/25" />
                  <span className="font-mono text-white/25 text-[9px] tracking-[0.15em]">ЗАГРУЗИТЬ ФОТО</span>
                </>
              )}
            </button>
          </div>

          {/* Text */}
          <div className="mb-5">
            <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-2">Комментарий</p>
            <textarea
              rows={3}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Расскажите о товаре..."
              className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/20 font-body resize-none"
            />
          </div>

          {error && <p className="font-body text-red-400 text-xs mb-4 text-center">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={submit}
            disabled={loading || uploading}
            className="w-full bg-white text-black font-display font-semibold text-sm tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : 'Подтвердить получение'}
          </motion.button>
        </div>
      </motion.div>
    </>
  )
}

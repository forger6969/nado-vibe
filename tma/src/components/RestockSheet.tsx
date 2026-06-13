import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, PackagePlus } from 'lucide-react'
import { restockProduct } from '../lib/supabase'
import type { Product } from '../types'

interface Props {
  product: Product
  onClose: () => void
  onRestocked: () => void
}

export function RestockSheet({ product, onClose, onRestocked }: Props) {
  const [delta, setDelta] = useState<Record<string, string>>(
    Object.fromEntries(product.sizes.map(s => [s, '']))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalAdding = Object.values(delta).reduce((s, v) => s + (parseInt(v) || 0), 0)

  const submit = async () => {
    const parsed = Object.fromEntries(
      Object.entries(delta).map(([s, v]) => [s, parseInt(v) || 0])
    )
    if (Object.values(parsed).every(v => v === 0)) {
      setError('Укажите количество хотя бы для одного размера')
      return
    }
    setLoading(true)
    setError('')
    try {
      await restockProduct(product.id, parsed)
      onRestocked()
    } catch {
      setError('Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40"
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

        <div className="flex items-center justify-between px-5 mb-5">
          <div>
            <h2 className="font-display font-bold text-white text-base tracking-wide">Пополнить склад</h2>
            <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
            <X size={14} className="text-white/60" />
          </button>
        </div>

        <div className="px-5 pb-10">
          {/* Current stock */}
          <div className="bg-white/3 rounded-2xl p-4 mb-5">
            <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-3">Сейчас в наличии</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(s => {
                const qty = product.sizes_stock?.[s] ?? 0
                return (
                  <div key={s} className="flex flex-col items-center gap-0.5 bg-white/5 rounded-xl px-3 py-2">
                    <span className="font-mono text-white text-xs">{s}</span>
                    <span className={`font-mono text-[9px] ${qty === 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {qty} шт
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Delta inputs */}
          <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-3">Добавить</p>
          <div className="flex flex-col gap-2 mb-5">
            {product.sizes.map(s => (
              <div key={s} className="flex items-center gap-3">
                <span className="font-mono text-white text-xs w-10 shrink-0">{s}</span>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={delta[s]}
                  onChange={e => setDelta(prev => ({ ...prev, [s]: e.target.value }))}
                  className="flex-1 bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-white text-sm font-body outline-none focus:border-white/25 transition-colors"
                />
                <span className="font-mono text-white/30 text-xs shrink-0">шт</span>
              </div>
            ))}
          </div>

          {totalAdding > 0 && (
            <p className="font-mono text-white/40 text-[9px] text-right mb-4">
              + {totalAdding} шт → итого {(product.stock ?? 0) + totalAdding} шт
            </p>
          )}

          {error && <p className="font-body text-red-400 text-xs text-center mb-3">{error}</p>}

          <button
            onClick={submit}
            disabled={loading || totalAdding === 0}
            className="w-full bg-white text-black font-display font-semibold text-sm tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : <><PackagePlus size={16} /> Пополнить</>}
          </button>
        </div>
      </motion.div>
    </>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Check } from 'lucide-react'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { tg } from '../lib/tg'

interface Props {
  product: Product | null
  onClose: () => void
}

export function ProductSheet({ product, onClose }: Props) {
  const { add } = useCart()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const handleClose = () => {
    setSelectedSize(null)
    setAdded(false)
    onClose()
  }

  const handleAdd = () => {
    if (!selectedSize || !product) return
    add(product, selectedSize)
    tg?.HapticFeedback?.impactOccurred('light')
    setAdded(true)
    setTimeout(() => { setAdded(false); handleClose() }, 900)
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] rounded-t-3xl overflow-hidden max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center z-10"
            >
              <X size={14} className="text-white/60" />
            </button>

            <div className="px-5 pb-8">
              {/* Image */}
              <div
                className="w-full aspect-[4/3] rounded-2xl mb-5 overflow-hidden flex items-center justify-center"
                style={{ background: 'linear-gradient(145deg,#1a1a1a,#2e2e2e)' }}
              >
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  : <span className="font-display font-black text-white/6 text-7xl">NV</span>
                }
              </div>

              {/* Info */}
              <p className="font-mono text-white/30 text-[9px] tracking-[0.25em] uppercase mb-1">{product.category}</p>
              <h2 className="font-display font-black text-white text-xl tracking-wide mb-1">{product.name}</h2>
              <div className="flex items-center gap-3 mb-4">
                <p className="font-mono text-white font-bold text-lg">{product.price.toLocaleString()} сум</p>
                {product.stock > 0 && (
                  <span className="font-mono text-[9px] text-green-400 border border-green-400/20 px-2 py-0.5 rounded-full">
                    {product.stock} шт в наличии
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="font-mono text-[9px] text-red-400 border border-red-400/20 px-2 py-0.5 rounded-full">
                    нет в наличии
                  </span>
                )}
              </div>

              {product.description && (
                <p className="font-body text-white/40 text-sm leading-relaxed mb-5">{product.description}</p>
              )}

              {/* Size selector */}
              <div className="mb-6">
                <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-3">Выбери размер</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => {
                    const qty = product.sizes_stock?.[s]
                    const outOfStock = qty !== undefined && qty === 0
                    return (
                      <motion.button
                        key={s}
                        whileTap={outOfStock ? undefined : { scale: 0.92 }}
                        onClick={() => !outOfStock && setSelectedSize(s)}
                        disabled={outOfStock}
                        className={`font-mono text-xs px-4 py-2 rounded-xl border transition-all flex flex-col items-center gap-0.5 ${
                          outOfStock
                            ? 'text-white/15 border-white/5 cursor-not-allowed line-through'
                            : selectedSize === s
                              ? 'bg-white text-black border-white'
                              : 'text-white/50 border-white/15 active:border-white/40'
                        }`}
                      >
                        <span>{s}</span>
                        {qty !== undefined && !outOfStock && (
                          <span className="text-[8px] opacity-50 leading-none">{qty} шт</span>
                        )}
                        {outOfStock && (
                          <span className="text-[8px] opacity-50 leading-none">нет</span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Add to cart button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={!selectedSize}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-display font-semibold text-sm tracking-wider transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : selectedSize
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} /> Добавлено!
                    </motion.span>
                  ) : (
                    <motion.span key="add" className="flex items-center gap-2">
                      <ShoppingCart size={16} />
                      {selectedSize ? `В корзину — ${selectedSize}` : 'Выберите размер'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

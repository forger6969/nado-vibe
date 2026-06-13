import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import type { Product } from '../types'
import { OrderForm } from './OrderForm'

interface Props {
  product: Product | null
  onClose: () => void
}

export function ProductSheet({ product, onClose }: Props) {
  const [ordering, setOrdering] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)

  const handleClose = () => {
    setOrdering(false)
    setSelectedSize(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] rounded-t-3xl overflow-hidden max-h-[90dvh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center"
            >
              <X size={14} className="text-white/60" />
            </button>

            {!ordering ? (
              <div className="px-5 pb-8">
                {/* Image */}
                <div
                  className="w-full aspect-[4/3] rounded-2xl mb-5 flex items-center justify-center"
                  style={{ background: 'linear-gradient(145deg,#1a1a1a,#2e2e2e)' }}
                >
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    <span className="font-display font-black text-white/6 text-7xl">NV</span>
                  )}
                </div>

                {/* Info */}
                <p className="font-mono text-white/30 text-[9px] tracking-[0.25em] uppercase mb-1">{product.category}</p>
                <h2 className="font-display font-black text-white text-xl tracking-wide mb-1">{product.name}</h2>
                <p className="font-mono text-white font-bold text-lg mb-4">{product.price.toLocaleString()} сум</p>

                {product.description && (
                  <p className="font-body text-white/40 text-sm leading-relaxed mb-5">{product.description}</p>
                )}

                {/* Size selector */}
                <div className="mb-6">
                  <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-3">Выбери размер</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`font-mono text-xs px-4 py-2 rounded-xl border transition-all ${
                          selectedSize === s
                            ? 'bg-white text-black border-white'
                            : 'text-white/50 border-white/15 active:border-white/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order button */}
                <button
                  onClick={() => {
                    if (selectedSize) setOrdering(true)
                  }}
                  disabled={!selectedSize}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-display font-semibold text-sm tracking-wider transition-all ${
                    selectedSize
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <Send size={16} />
                  {selectedSize ? `Заказать размер ${selectedSize}` : 'Выберите размер'}
                </button>
              </div>
            ) : (
              <OrderForm
                product={product}
                size={selectedSize!}
                onBack={() => setOrdering(false)}
                onSuccess={handleClose}
              />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

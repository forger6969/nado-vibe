import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { CartCheckoutForm } from './CartCheckoutForm'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function CartView() {
  const { items, remove, setQty, total, count } = useCart()
  const [checkout, setCheckout] = useState(false)

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center py-24">
        <div className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center">
          <ShoppingCart size={24} className="text-white/15" />
        </div>
        <div>
          <p className="font-display font-bold text-white/20 text-lg">Корзина пуста</p>
          <p className="font-body text-white/20 text-sm mt-1">Добавьте товары из каталога</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-4">
        <p className="font-mono text-white/30 text-[9px] tracking-[0.3em] uppercase px-4 pt-4 pb-3">
          {count} {count === 1 ? 'товар' : count < 5 ? 'товара' : 'товаров'}
        </p>

        <div className="px-4 flex flex-col gap-3">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04, ease: EASE }}
                className="card-dark rounded-2xl p-3 flex gap-3 items-center"
              >
                {/* Thumbnail */}
                <div
                  className="w-16 h-16 rounded-xl shrink-0 overflow-hidden flex items-center justify-center"
                  style={{ background: 'linear-gradient(145deg,#1a1a1a,#2e2e2e)' }}
                >
                  {item.product.image_url
                    ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    : <span className="font-display font-black text-white/10 text-xs">NV</span>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-white text-sm tracking-wide truncate">{item.product.name}</p>
                  <p className="font-mono text-white/30 text-[9px] tracking-wider">Размер {item.size}</p>
                  <p className="font-mono text-white text-sm font-bold mt-1">
                    {(item.product.price * item.qty).toLocaleString()} сум
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => remove(item.product.id, item.size)}
                    className="w-6 h-6 rounded-lg border border-red-500/20 flex items-center justify-center"
                  >
                    <Trash2 size={10} className="text-red-400/60" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setQty(item.product.id, item.size, item.qty - 1)}
                      className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center active:bg-white/10"
                    >
                      <Minus size={10} className="text-white/50" />
                    </button>
                    <span className="font-mono text-white text-xs w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.product.id, item.size, item.qty + 1)}
                      className="w-6 h-6 rounded-lg border border-white/10 flex items-center justify-center active:bg-white/10"
                    >
                      <Plus size={10} className="text-white/50" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Checkout bar */}
      <div className="px-4 pb-4 pt-2 border-t border-white/8 bg-black">
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-white/40 text-sm">Итого</p>
          <p className="font-mono text-white font-bold text-base">{total.toLocaleString()} сум</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setCheckout(true)}
          className="w-full bg-white text-black font-display font-semibold text-sm tracking-wider py-4 rounded-2xl"
        >
          Оформить заказ →
        </motion.button>
      </div>

      <AnimatePresence>
        {checkout && (
          <CartCheckoutForm onClose={() => setCheckout(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

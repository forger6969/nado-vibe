import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { getMyOrders } from '../lib/supabase'
import { getTgUser } from '../lib/tg'
import type { Order, OrderStatus } from '../types'
import { STATUS_LABELS } from '../types'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const STATUS_DOT: Record<OrderStatus, string> = {
  new: 'bg-white animate-pulse',
  processing: 'bg-yellow-400',
  shipped: 'bg-blue-400',
  delivered: 'bg-green-400',
  cancelled: 'bg-red-400',
}

const STATUS_TEXT: Record<OrderStatus, string> = {
  new: 'text-white',
  processing: 'text-yellow-400',
  shipped: 'text-blue-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400',
}

const STATUS_STEPS: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered']

export function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const user = getTgUser()

  const load = () => {
    if (!user) { setLoading(false); return }
    setLoading(true)
    getMyOrders(user.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-8 py-20">
        <p className="font-display font-black text-white/20 text-2xl">Войдите через TG</p>
        <p className="font-body text-white/25 text-sm">Откройте магазин через Telegram бота</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="font-mono text-white/30 text-[9px] tracking-[0.3em] uppercase">Мои заказы</p>
        <button
          onClick={load}
          className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center active:bg-white/5"
        >
          <RefreshCw size={11} className="text-white/30" />
        </button>
      </div>

      {loading ? (
        <div className="px-4 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-dark rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 px-8 text-center">
          <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center mb-2">
            <span className="font-display font-black text-white/15 text-lg">NV</span>
          </div>
          <p className="font-display font-bold text-white/20 text-lg">Заказов пока нет</p>
          <p className="font-body text-white/20 text-sm">Добавьте товары в корзину и оформите заказ</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-3">
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}
              className="card-dark rounded-2xl overflow-hidden"
            >
              {/* Top */}
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-white text-sm tracking-wide truncate">{o.product_name}</p>
                    <p className="font-mono text-white/30 text-[9px] tracking-wider mt-0.5">Размер {o.size}</p>
                  </div>
                  <p className="font-mono text-white font-bold text-sm shrink-0">{o.price.toLocaleString()} сум</p>
                </div>

                {/* Status + date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[o.status]}`} />
                    <span className={`font-mono text-xs font-medium ${STATUS_TEXT[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                  <p className="font-mono text-white/20 text-[9px]">
                    {new Date(o.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>

              {/* Progress bar — only for non-cancelled */}
              {o.status !== 'cancelled' && (
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-1">
                    {STATUS_STEPS.map((step, idx) => {
                      const stepIdx = STATUS_STEPS.indexOf(o.status as OrderStatus)
                      const done = idx <= stepIdx
                      const active = idx === stepIdx
                      return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <motion.div
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.06 + idx * 0.08 }}
                            className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                              done ? (active ? STATUS_DOT[o.status] : 'bg-white/40') : 'bg-white/10'
                            }`}
                          />
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className="flex-1 h-px mx-1 overflow-hidden rounded-full bg-white/8">
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: done && idx < stepIdx ? 1 : 0 }}
                                transition={{ duration: 0.5, delay: i * 0.06 + idx * 0.1 }}
                                className="h-full bg-white/30 origin-left"
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {STATUS_STEPS.map(step => (
                      <p key={step} className={`font-mono text-[7px] tracking-wide ${
                        STATUS_STEPS.indexOf(o.status as OrderStatus) >= STATUS_STEPS.indexOf(step)
                          ? 'text-white/40' : 'text-white/15'
                      }`}>
                        {STATUS_LABELS[step]}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

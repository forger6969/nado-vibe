import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { createOrders } from '../lib/supabase'
import { getTgUser, tg } from '../lib/tg'
import type { Order } from '../types'

const BOT_URL = import.meta.env.VITE_BOT_NOTIFY_URL as string | undefined
const SECRET = import.meta.env.VITE_NOTIFY_SECRET as string | undefined

async function notifyBot(order: Order) {
  if (!BOT_URL) return
  try {
    await fetch(BOT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(SECRET ? { 'X-Notify-Secret': SECRET } : {}) },
      body: JSON.stringify(order),
    })
  } catch { /* best-effort */ }
}

interface Props {
  onClose: () => void
}

export function CartCheckoutForm({ onClose }: Props) {
  const { items, total, count, clear } = useCart()
  const user = getTgUser()
  const [name, setName] = useState(user?.first_name ?? '')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!phone.trim() || !address.trim()) { setError('Заполните телефон и адрес'); return }
    setLoading(true)
    setError('')
    try {
      const payload = items.map(item => ({
        product_id: item.product.id,
        product_name: `${item.product.name} ×${item.qty}`,
        size: item.size,
        buyer_tg_id: user?.id ?? 0,
        buyer_name: name.trim() || undefined,
        buyer_username: user?.username,
        phone: phone.trim(),
        address: address.trim(),
        price: item.product.price * item.qty,
      }))
      const created = await createOrders(payload)
      tg?.HapticFeedback?.notificationOccurred('success')
      // notify bot for each order
      for (const o of created) void notifyBot(o)
      clear()
      setDone(true)
    } catch {
      setError('Ошибка. Попробуйте снова.')
      tg?.HapticFeedback?.notificationOccurred('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40"
        onClick={done ? onClose : undefined}
      />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] rounded-t-3xl max-h-[85dvh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center"
        >
          <X size={14} className="text-white/60" />
        </button>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="px-5 pb-10 pt-4 flex flex-col items-center text-center gap-4"
          >
            <CheckCircle size={52} className="text-white/60" />
            <h3 className="font-display font-black text-white text-xl tracking-wide">Заказ оформлен!</h3>
            <p className="font-body text-white/40 text-sm leading-relaxed">
              {count} {count === 1 ? 'товар' : 'товара'} · {total.toLocaleString()} сум<br/>
              Мы свяжемся с вами в Telegram
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full bg-white text-black font-display font-semibold text-sm tracking-wider py-4 rounded-2xl"
            >
              Закрыть
            </button>
          </motion.div>
        ) : (
          <div className="px-5 pb-8">
            <h2 className="font-display font-bold text-white text-base tracking-wide mb-5">Оформление заказа</h2>

            {/* Cart summary */}
            <div className="card-dark rounded-2xl p-4 mb-5 flex flex-col gap-2">
              {items.map(item => (
                <div key={`${item.product.id}-${item.size}`} className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-medium text-white text-xs tracking-wide">{item.product.name}</p>
                    <p className="font-mono text-white/30 text-[8px]">Размер {item.size} · {item.qty} шт</p>
                  </div>
                  <p className="font-mono text-white/60 text-xs">{(item.product.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
              <div className="border-t border-white/8 pt-2 mt-1 flex items-center justify-between">
                <p className="font-mono text-white/40 text-xs">Итого</p>
                <p className="font-mono text-white font-bold text-sm">{total.toLocaleString()} сум</p>
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3 mb-5">
              <Field label="Имя" placeholder={user?.first_name ?? 'Ваше имя'} value={name} onChange={setName} />
              <Field label="Телефон *" placeholder="+998 90 000 00 00" value={phone} onChange={setPhone} type="tel" />
              <Field label="Адрес доставки *" placeholder="Город, улица, дом" value={address} onChange={setAddress} multiline />
            </div>

            {error && <p className="font-body text-red-400 text-xs mb-4 text-center">{error}</p>}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-white text-black font-display font-semibold text-sm tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : 'Подтвердить заказ'}
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}

function Field({ label, placeholder, value, onChange, type = 'text', multiline = false }: {
  label: string; placeholder: string; value: string
  onChange: (v: string) => void; type?: string; multiline?: boolean
}) {
  const cls = 'w-full bg-white/5 border border-white/8 rounded-xl px-4 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/25 font-body transition-colors'
  return (
    <div>
      <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-1.5">{label}</p>
      {multiline
        ? <textarea rows={3} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={`${cls} py-3 resize-none`} />
        : <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={`${cls} py-3`} />
      }
    </div>
  )
}

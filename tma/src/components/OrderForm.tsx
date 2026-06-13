import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { createOrder } from '../lib/supabase'
import { getTgUser, tg } from '../lib/tg'
import type { Product } from '../types'

const BOT_NOTIFY_URL = import.meta.env.VITE_BOT_NOTIFY_URL as string | undefined
const NOTIFY_SECRET = import.meta.env.VITE_NOTIFY_SECRET as string | undefined

async function notifyBot(order: import('../types').Order) {
  if (!BOT_NOTIFY_URL) return
  try {
    await fetch(BOT_NOTIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(NOTIFY_SECRET ? { 'X-Notify-Secret': NOTIFY_SECRET } : {}),
      },
      body: JSON.stringify(order),
    })
  } catch {
    // silent — order is saved, notification is best-effort
  }
}

interface Props {
  product: Product
  size: string
  onBack: () => void
  onSuccess: () => void
}

export function OrderForm({ product, size, onBack, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const user = getTgUser()

  const submit = async () => {
    if (!phone.trim() || !address.trim()) {
      setError('Заполните все поля')
      return
    }
    setLoading(true)
    setError('')
    try {
      const order = await createOrder({
        product_id: product.id,
        product_name: product.name,
        size,
        buyer_tg_id: user?.id ?? 0,
        buyer_name: name || user?.first_name,
        buyer_username: user?.username,
        phone: phone.trim(),
        address: address.trim(),
        price: product.price,
      })
      tg?.HapticFeedback?.notificationOccurred('success')
      void notifyBot(order)
      setDone(true)
      setTimeout(onSuccess, 2200)
    } catch (e) {
      setError('Ошибка. Попробуйте снова.')
      tg?.HapticFeedback?.notificationOccurred('error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-5 pb-10 pt-4 flex flex-col items-center text-center gap-4"
      >
        <CheckCircle size={48} className="text-white/60" />
        <h3 className="font-display font-black text-white text-xl tracking-wide">Заказ принят!</h3>
        <p className="font-body text-white/40 text-sm leading-relaxed">
          Мы свяжемся с вами в Telegram в течение часа для подтверждения
        </p>
      </motion.div>
    )
  }

  return (
    <div className="px-5 pb-8 pt-2">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-white/40 mb-5">
        <ArrowLeft size={16} />
        <span className="font-body text-sm">Назад</span>
      </button>

      {/* Summary */}
      <div className="card-dark rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg,#1a1a1a,#2e2e2e)' }}
        >
          <span className="font-display font-black text-white/10 text-sm">NV</span>
        </div>
        <div>
          <p className="font-display font-semibold text-white text-sm">{product.name}</p>
          <p className="font-mono text-white/40 text-xs mt-0.5">Размер: {size}</p>
          <p className="font-mono text-white text-sm font-bold mt-1">{product.price.toLocaleString()} сум</p>
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-3 mb-5">
        <Field
          label="Имя"
          placeholder={user?.first_name ?? 'Ваше имя'}
          value={name}
          onChange={setName}
        />
        <Field
          label="Телефон *"
          placeholder="+998 90 000 00 00"
          value={phone}
          onChange={setPhone}
          type="tel"
        />
        <Field
          label="Адрес доставки *"
          placeholder="Город, улица, дом, квартира"
          value={address}
          onChange={setAddress}
          multiline
        />
      </div>

      {error && <p className="font-body text-red-400 text-xs mb-4 text-center">{error}</p>}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full bg-white text-black font-display font-semibold text-sm tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : (
          'Подтвердить заказ'
        )}
      </button>
    </div>
  )
}

function Field({
  label, placeholder, value, onChange, type = 'text', multiline = false,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
  multiline?: boolean
}) {
  const cls =
    'w-full bg-white/5 border border-white/8 rounded-xl px-4 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/25 font-body transition-colors'

  return (
    <div>
      <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-1.5">{label}</p>
      {multiline ? (
        <textarea
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`${cls} py-3 resize-none`}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`${cls} py-3`}
        />
      )}
    </div>
  )
}

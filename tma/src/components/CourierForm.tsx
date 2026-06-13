import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Truck } from 'lucide-react'

interface Props {
  orderName: string
  onConfirm: (name: string, phone: string) => Promise<void>
  onClose: () => void
}

export function CourierForm({ orderName, onConfirm, onClose }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!name.trim() || !phone.trim()) { setError('Заполните имя и телефон курьера'); return }
    setLoading(true)
    try {
      await onConfirm(name.trim(), phone.trim())
      onClose()
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
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-[#0d0d0d] rounded-3xl p-5 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Truck size={14} className="text-blue-400" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Данные курьера</p>
              <p className="font-mono text-white/30 text-[8px] tracking-wide truncate max-w-[180px]">{orderName}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center">
            <X size={12} className="text-white/40" />
          </button>
        </div>

        <p className="font-body text-white/40 text-xs mb-4 leading-relaxed">
          Клиент получит уведомление в Telegram с именем и телефоном курьера
        </p>

        <div className="flex flex-col gap-3 mb-4">
          <div>
            <p className="font-mono text-white/30 text-[8px] tracking-[0.2em] uppercase mb-1.5">Имя курьера *</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Алишер"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/25 font-body"
            />
          </div>
          <div>
            <p className="font-mono text-white/30 text-[8px] tracking-[0.2em] uppercase mb-1.5">Телефон курьера *</p>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998 90 000 00 00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-white/25 font-body"
            />
          </div>
        </div>

        {error && <p className="font-body text-red-400 text-xs mb-3 text-center">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-white/10 text-white/40 font-display font-semibold text-xs tracking-wider py-3 rounded-2xl"
          >
            Отмена
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 bg-blue-500 text-white font-display font-semibold text-xs tracking-wider py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Truck size={13} /> Отправить</>}
          </button>
        </div>
      </motion.div>
    </>
  )
}

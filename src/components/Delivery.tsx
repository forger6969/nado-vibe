import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, Zap, ShoppingBag, CreditCard } from 'lucide-react'

const steps = [
  {
    icon: ShoppingBag,
    title: 'Открой бота',
    desc: 'Нажми кнопку «Telegram бот» и выбери товары прямо в каталоге.',
  },
  {
    icon: CreditCard,
    title: 'Оформи заказ',
    desc: 'Укажи размер, адрес доставки и номер телефона — всё прямо в боте.',
  },
  {
    icon: Zap,
    title: 'Отправка',
    desc: 'Упаковываем и отправляем. Получаешь трекинг-номер.',
  },
  {
    icon: MapPin,
    title: 'Доставка',
    desc: 'Доставка по Ташкенту 1-2 дня. По Узбекистану 2-5 дней.',
  },
]

export function Delivery() {
  const reduced = useReducedMotion()

  return (
    <section id="delivery" className="py-24 px-6 border-t border-white/8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="font-mono text-white/30 text-[10px] tracking-[0.3em] uppercase mb-3">04 / доставка</p>
          <h2 className="font-display font-black text-white text-3xl sm:text-4xl leading-tight tracking-tight">
            Как сделать{' '}
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.6)' }}>
              заказ
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: reduced ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative card-dark rounded-2xl p-6 flex flex-col gap-5"
              >
                {/* Step number */}
                <span className="font-mono text-white/10 text-5xl font-bold absolute top-4 right-5 leading-none select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-10 h-10 rounded-xl border border-white/12 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white/60" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white text-sm tracking-wide mb-2">{step.title}</h3>
                  <p className="font-body text-white/40 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {[
            { label: 'Оплата', value: 'При получении или картой' },
            { label: 'Возврат', value: '7 дней, без вопросов' },
            { label: 'Поддержка', value: 'Ответ в течение часа' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1 border border-white/8 rounded-xl px-6 py-5"
            >
              <span className="font-mono text-white/25 text-[9px] tracking-[0.25em] uppercase">{label}</span>
              <span className="font-display font-semibold text-white text-sm tracking-wide">{value}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

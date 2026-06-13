import { motion, useReducedMotion } from 'framer-motion'
import { Send, AtSign } from 'lucide-react'

export function CTASection() {
  const reduced = useReducedMotion()

  return (
    <section className="py-32 px-6 border-t border-white/8 relative overflow-hidden">
      {/* Background text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span
          className="font-display font-black leading-none whitespace-nowrap"
          style={{
            fontSize: 'clamp(6rem, 25vw, 20rem)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.025)',
          }}
        >
          ORDER
        </span>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-mono text-white/30 text-[10px] tracking-[0.3em] uppercase mb-8"
        >
          05 / заказ
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: reduced ? 0 : 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-display font-black text-white leading-tight tracking-tight mb-6"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)' }}
        >
          Готов к
          <br />
          <span style={{ color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.7)' }}>
            заказу?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-body text-white/40 text-base leading-relaxed mb-12 max-w-md mx-auto"
        >
          Оформи заказ через нашего Telegram бота или напиши в Instagram — ответим в течение часа
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="https://t.me/nado_vibe_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-full text-sm font-semibold tracking-widest"
          >
            <Send size={16} />
            Telegram бот
          </a>
          <a
            href="https://www.instagram.com/nado_vibe/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-full text-sm font-medium tracking-widest"
          >
            <AtSign size={16} />
            Instagram
          </a>
        </motion.div>
      </div>
    </section>
  )
}

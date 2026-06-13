import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowDown, Send } from 'lucide-react'

function SplitReveal({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <span className={`inline-block overflow-hidden ${className}`}>
      <motion.span
        className="inline-block"
        initial={{ y: reduced ? 0 : '110%', opacity: reduced ? 0 : 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        {text}
      </motion.span>
    </span>
  )
}

export function Hero() {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -120])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: reduced ? 0 : 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  })

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-end pb-16 pt-24 px-6 overflow-hidden grain-overlay"
    >
      {/* Background — subtle radial glow + bottom fade */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(255,255,255,0.03),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Decorative N - parallax */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, 80]) }}
        className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-8 select-none pointer-events-none hidden lg:block"
      >
        <motion.span
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-display font-black text-[28vw] leading-none"
          style={{
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.04)',
          }}
        >
          N
        </motion.span>
      </motion.div>

      {/* Content with parallax */}
      <motion.div style={{ y, opacity }} className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: reduced ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 font-mono text-[10px] text-white/40 tracking-[0.25em] uppercase border border-white/10 px-4 py-2 rounded-full">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-white/60"
            />
            Ташкент · Доставка по всему Узбекистану
          </span>
        </motion.div>

        {/* Main headline */}
        <div className="mb-2 leading-none">
          <h1
            className="font-display font-black leading-[0.9] tracking-tight text-white"
            style={{ fontSize: 'clamp(4rem, 14vw, 14rem)' }}
          >
            <SplitReveal text="NADO" delay={0.15} />
          </h1>
        </div>
        <div className="mb-8 leading-none">
          <h1
            className="font-display font-black leading-[0.9] tracking-tight"
            style={{
              fontSize: 'clamp(4rem, 14vw, 14rem)',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.7)',
            }}
          >
            <SplitReveal text="VIBE" delay={0.22} />
          </h1>
        </div>

        {/* Divider + tagline */}
        <motion.div {...fadeUp(0.4)} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 mb-12">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="h-px w-16 bg-white/20 origin-left"
          />
          <p className="font-body text-white/50 text-base leading-relaxed max-w-sm">
            Мужская одежда нового поколения. Korean &amp; Japanese streetwear, доставка по всему Узбекистану.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div {...fadeUp(0.52)} className="flex flex-wrap items-center gap-4">
          <motion.a
            href="#catalog"
            whileHover={{ scale: reduced ? 1 : 1.03, y: reduced ? 0 : -2 }}
            whileTap={{ scale: reduced ? 1 : 0.97 }}
            className="btn-primary px-8 py-4 rounded-full text-sm font-semibold tracking-wider inline-flex items-center gap-3"
          >
            Смотреть каталог
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowDown size={16} />
            </motion.span>
          </motion.a>
          <motion.a
            href="https://t.me/nado_vibe_bot"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: reduced ? 1 : 1.03, y: reduced ? 0 : -2 }}
            whileTap={{ scale: reduced ? 1 : 0.97 }}
            className="btn-outline px-8 py-4 rounded-full text-sm font-medium tracking-wider inline-flex items-center gap-3"
          >
            <Send size={16} />
            Telegram бот
          </motion.a>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.62)} className="flex items-center gap-10 mt-16 pt-8 border-t border-white/8">
          {[
            { value: 'Ташкент', label: 'Дислокация' },
            { value: 'UZ', label: 'Доставка по всей стране' },
            { value: 'DIRECT', label: 'Быстрый заказ' },
          ].map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: reduced ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
              className="flex flex-col gap-1"
            >
              <span className="font-display font-bold text-white text-lg tracking-wide">{value}</span>
              <span className="font-body text-white/35 text-xs tracking-wide">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ height: ['0%', '100%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="w-px h-12 bg-gradient-to-b from-white/0 to-white/30 origin-top"
        />
        <span className="font-mono text-white/20 text-[9px] tracking-[0.3em] rotate-90 mt-2">SCROLL</span>
      </motion.div>
    </section>
  )
}

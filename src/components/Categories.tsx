import { motion, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

const categories = [
  { id: 'polo', label: 'Поло', desc: 'Классика & спорт', icon: '◉', count: '12' },
  { id: 'shirts', label: 'Рубашки', desc: 'Casual & formal', icon: '◈', count: '8' },
  { id: 'pants', label: 'Брюки', desc: 'Comfort fit', icon: '◆', count: '6' },
  { id: 'jeans', label: 'Джинсы', desc: 'Korean cut', icon: '◇', count: '9' },
  { id: 'sport', label: 'Спорт', desc: 'Active wear', icon: '◎', count: '5' },
  { id: 'accessories', label: 'Аксессуары', desc: 'Details matter', icon: '○', count: '14' },
]

export function Categories() {
  const reduced = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-mono text-white/30 text-[10px] tracking-[0.3em] uppercase mb-3"
            >
              01 / категории
            </motion.p>
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: reduced ? 0 : '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="font-display font-black text-white text-3xl sm:text-4xl leading-tight tracking-tight"
              >
                Что мы{' '}
                <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.6)' }}>
                  предлагаем
                </span>
              </motion.h2>
            </div>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="hidden md:block h-px flex-1 bg-white/8 mx-12 mb-3 origin-left"
          />
        </div>

        {/* Grid */}
        <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.07,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              whileHover={{ scale: reduced ? 1 : 1.04, y: reduced ? 0 : -3 }}
              whileTap={{ scale: reduced ? 1 : 0.96 }}
              className="group relative flex flex-col items-start p-5 card-dark rounded-2xl text-left transition-colors duration-200 cursor-pointer"
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {/* Count badge */}
              <span className="absolute top-3 right-3 font-mono text-white/15 text-[9px] tracking-wider group-hover:text-white/35 transition-colors">
                {cat.count}
              </span>

              {/* Icon */}
              <motion.span
                className="text-2xl text-white/20 group-hover:text-white/50 transition-colors mb-6 font-display"
                whileHover={{ rotate: reduced ? 0 : 180 }}
                transition={{ duration: 0.4 }}
              >
                {cat.icon}
              </motion.span>

              <span className="font-display font-semibold text-white text-sm tracking-wide block mb-1">
                {cat.label}
              </span>
              <span className="font-body text-white/35 text-xs tracking-wide">{cat.desc}</span>

              {/* Hover arrow */}
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                whileHover={{ opacity: 0.4, x: 0 }}
                className="absolute bottom-4 right-4 text-white text-xs font-mono"
              >
                →
              </motion.span>

              {/* Bottom line on hover */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-px bg-white/30 rounded-b-2xl"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}

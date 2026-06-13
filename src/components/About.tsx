import { motion, useReducedMotion } from 'framer-motion'

const values = [
  {
    num: '01',
    title: 'Качество',
    desc: 'Только проверенные материалы. Каждая вещь проходит контроль перед отправкой.',
  },
  {
    num: '02',
    title: 'Стиль',
    desc: 'Korean & Japanese streetwear — актуальные тренды для современного мужчины Ташкента.',
  },
  {
    num: '03',
    title: 'Скорость',
    desc: 'Отвечаем в DIRECT и Telegram в течение часа. Доставка по всему Узбекистану.',
  },
]

export function About() {
  const reduced = useReducedMotion()

  return (
    <section id="about" className="py-24 px-6 border-t border-white/8 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-mono text-white/30 text-[10px] tracking-[0.3em] uppercase mb-6"
            >
              03 / о нас
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: reduced ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="font-display font-black text-white text-3xl sm:text-5xl leading-tight tracking-tight mb-8"
            >
              Городской стиль —{' '}
              <span
                style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.55)' }}
              >
                доступно
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: reduced ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-body text-white/45 text-base leading-relaxed max-w-md"
            >
              Nado Vibe — это Ташкентский бренд мужской одежды, созданный для тех, кто следит за азиатскими трендами.
              Мы делаем корейский и японский streetwear доступным в Узбекистане.
            </motion.p>
          </div>

          {/* Right — values */}
          <div className="flex flex-col gap-px">
            {values.map((v, i) => (
              <motion.div
                key={v.num}
                initial={{ opacity: 0, x: reduced ? 0 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="group flex gap-6 py-7 border-b border-white/8 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 transition-colors rounded-lg"
              >
                <span className="font-mono text-white/15 text-xs pt-1 shrink-0 group-hover:text-white/30 transition-colors">
                  {v.num}
                </span>
                <div>
                  <h3 className="font-display font-bold text-white text-base tracking-wide mb-2">
                    {v.title}
                  </h3>
                  <p className="font-body text-white/40 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

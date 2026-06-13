import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Send, ArrowUpRight, Loader2 } from 'lucide-react'
import { getActiveProducts, type Product } from '../lib/supabase'

const STATIC_PRODUCTS: Product[] = [
  { id: '1', name: 'Polo Classic', category: 'Поло', price: 149000, sizes: ['S', 'M', 'L', 'XL'], active: true, created_at: '' },
  { id: '2', name: 'Korean Shirt', category: 'Рубашка', price: 189000, sizes: ['M', 'L', 'XL'], active: true, created_at: '' },
  { id: '3', name: 'Slim Trousers', category: 'Брюки', price: 229000, sizes: ['S', 'M', 'L'], active: true, created_at: '' },
  { id: '4', name: 'Wide Jeans', category: 'Джинсы', price: 259000, sizes: ['28', '30', '32', '34'], active: true, created_at: '' },
  { id: '5', name: 'Sport Polo ON', category: 'Спорт', price: 199000, sizes: ['S', 'M', 'L', 'XL', 'XXL'], active: true, created_at: '' },
  { id: '6', name: 'Casual Shirt', category: 'Рубашка', price: 169000, sizes: ['M', 'L', 'XL'], active: true, created_at: '' },
]

const CARD_BG = [
  'linear-gradient(145deg,#1a1a1a,#333)',
  'linear-gradient(145deg,#111,#2a2a2a)',
  'linear-gradient(145deg,#1a1a1a,#303030)',
  'linear-gradient(145deg,#111,#252525)',
  'linear-gradient(145deg,#1a1a1a,#2e2e2e)',
  'linear-gradient(145deg,#111,#222)',
]

function ProductCard({ product, index }: { product: Product; index: number }) {
  const reduced = useReducedMotion()
  const bg = product.image_url ? undefined : CARD_BG[index % CARD_BG.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="group flex flex-col"
    >
      <motion.div
        whileHover={{ y: reduced ? 0 : -6 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="relative aspect-[3/4] rounded-2xl mb-4 overflow-hidden cursor-pointer"
        style={{ background: bg }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative"
              whileHover={{ rotate: reduced ? 0 : 15 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 border border-white/10 rounded-full absolute -top-8 -left-8" />
              <div className="w-16 h-16 border border-white/8 rotate-45" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[10px] tracking-[0.2em] text-white/20">
                NV
              </span>
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center"
        >
          <ArrowUpRight size={14} className="text-black" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/30"
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-3 left-3 right-3 z-10"
        >
          <a
            href="https://t.me/nadovibe"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold tracking-wide"
          >
            <Send size={12} />
            Заказать
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex flex-col gap-1.5 px-1"
        whileHover={{ x: reduced ? 0 : 2 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-1">{product.category}</p>
            <h3 className="font-display font-semibold text-white text-sm tracking-wide">{product.name}</h3>
          </div>
          <span className="font-mono text-white font-bold text-sm shrink-0 pt-4">{product.price.toLocaleString()} сум</span>
        </div>

        <div className="flex gap-1.5 flex-wrap mt-1">
          {product.sizes.map((size) => (
            <motion.span
              key={size}
              whileHover={{ borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.7)' }}
              className="font-mono text-[9px] tracking-wider text-white/40 border border-white/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
            >
              {size}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Catalog() {
  const reduced = useReducedMotion()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveProducts()
      .then(data => setProducts(data.length > 0 ? data : STATIC_PRODUCTS))
      .catch(() => setProducts(STATIC_PRODUCTS))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="catalog" className="py-24 px-6 border-t border-white/8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-mono text-white/30 text-[10px] tracking-[0.3em] uppercase mb-3"
            >
              02 / каталог
            </motion.p>
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: reduced ? 0 : '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                className="font-display font-black text-white text-3xl sm:text-4xl leading-tight tracking-tight"
              >
                Новая{' '}
                <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.6)' }}>
                  коллекция
                </span>
              </motion.h2>
            </div>
          </div>
          <motion.a
            href="https://t.me/nadovibe"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, x: reduced ? 0 : -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-outline px-6 py-3 rounded-full text-xs tracking-widest self-start sm:self-auto"
          >
            Все товары в TG →
          </motion.a>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={28} className="text-white/20 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-7">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 text-center"
        >
          <p className="font-body text-white/35 text-sm mb-6">
            Полный каталог доступен в нашем Telegram канале
          </p>
          <motion.a
            href="https://t.me/nadovibe"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: reduced ? 0 : -2 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary inline-flex items-center gap-3 px-10 py-4 rounded-full text-sm tracking-widest"
          >
            <Send size={16} />
            Открыть каталог
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

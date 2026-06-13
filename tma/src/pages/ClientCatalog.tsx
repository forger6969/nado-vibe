import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search } from 'lucide-react'
import { getProducts } from '../lib/supabase'
import type { Product } from '../types'
import { CATEGORIES } from '../types'
import { ProductSheet } from '../components/ProductSheet'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function ClientCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Все')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)

  useEffect(() => {
    getProducts(true)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cats = ['Все', ...CATEGORIES]
  const filtered = products.filter(p => {
    const matchCat = filter === 'Все' || p.category === filter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-black pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-white/8">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-black text-white text-xl leading-none tracking-wide">NADO VIBE</p>
              <p className="font-mono text-white/30 text-[9px] tracking-[0.3em] mt-0.5">MEN'S WEAR</p>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
              <ShoppingBag size={14} className="text-white/50" />
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-white/20 font-body"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {cats.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`shrink-0 font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                  filter === cat
                    ? 'bg-white text-black border-white'
                    : 'text-white/40 border-white/10 hover:border-white/25'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-dark rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-white/20 text-lg">Товаров нет</p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
                  onClick={() => setSelected(p)}
                  className="card-dark rounded-2xl overflow-hidden text-left active:scale-95 transition-transform"
                >
                  {/* Image */}
                  <div
                    className="aspect-[3/4] flex items-center justify-center relative"
                    style={{ background: `linear-gradient(145deg,#1a1a1a,#2a2a2a)` }}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display font-black text-white/8 text-5xl">NV</span>
                    )}
                    {/* Badge */}
                    <span className="absolute top-2 left-2 font-mono text-[8px] tracking-wider text-white/30 border border-white/10 px-2 py-0.5 rounded-full">
                      {p.category}
                    </span>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="font-display font-semibold text-white text-xs tracking-wide mb-1 line-clamp-1">
                      {p.name}
                    </p>
                    <p className="font-mono text-white font-bold text-xs">
                      {p.price.toLocaleString()} сум
                    </p>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {p.sizes.slice(0, 4).map(s => (
                        <span key={s} className="font-mono text-[8px] text-white/30 border border-white/8 px-1.5 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                      {p.sizes.length > 4 && (
                        <span className="font-mono text-[8px] text-white/20">+{p.sizes.length - 4}</span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Product detail sheet */}
      <ProductSheet product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

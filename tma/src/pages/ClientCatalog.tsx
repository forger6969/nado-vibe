import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Grid3X3, ShoppingCart, ClipboardList } from 'lucide-react'
import { getProducts } from '../lib/supabase'
import type { Product } from '../types'
import { CATEGORIES } from '../types'
import { ProductSheet } from '../components/ProductSheet'
import { CartView } from '../components/CartView'
import { MyOrders } from './MyOrders'
import { useCart } from '../context/CartContext'

type Tab = 'catalog' | 'cart' | 'orders'
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export function ClientCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Все')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [tab, setTab] = useState<Tab>('catalog')
  const { count } = useCart()
  const prevTabRef = useRef<Tab>('catalog')
  const tabOrder: Tab[] = ['catalog', 'cart', 'orders']

  useEffect(() => {
    getProducts(true).then(setProducts).catch(console.error).finally(() => setLoading(false))
  }, [])

  const direction = tabOrder.indexOf(tab) > tabOrder.indexOf(prevTabRef.current) ? 1 : -1
  const handleTab = (t: Tab) => { prevTabRef.current = tab; setTab(t) }

  const cats = ['Все', ...CATEGORIES]
  const filtered = products.filter(p => {
    const matchCat = filter === 'Все' || p.category === filter
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-white/8">
        <div className="px-4 pt-4 pb-3">
          {/* Logo row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-display font-black text-white text-xl leading-none tracking-wide">NADO VIBE</p>
              <p className="font-mono text-white/30 text-[8px] tracking-[0.4em] mt-0.5">MEN'S WEAR</p>
            </div>
            <div className="flex items-center gap-2">
              {count > 0 && tab !== 'cart' && (
                <motion.button
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleTab('cart')}
                  className="relative flex items-center gap-1.5 bg-white text-black font-mono text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full"
                >
                  <ShoppingCart size={11} />
                  {count}
                </motion.button>
              )}
            </div>
          </div>

          {/* Search — only on catalog tab */}
          {tab === 'catalog' && (
            <>
              <div className="relative mb-3">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/25 outline-none focus:border-white/20 font-body"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {cats.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`shrink-0 font-mono text-[10px] tracking-wider px-3 py-1.5 rounded-full border transition-all ${
                      filter === cat ? 'bg-white text-black border-white' : 'text-white/40 border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex-1 flex flex-col"
          >
            {tab === 'catalog' && (
              <div className="overflow-y-auto pb-28">
                <div className="px-4 pt-4">
                  {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-2xl aspect-[3/4] animate-pulse" style={{ background: '#111' }} />
                      ))}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                      <p className="font-display text-white/20 text-lg">Товаров нет</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filtered.map((p, i) => (
                        <ProductCard key={p.id} product={p} index={i} onTap={() => setSelected(p)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'cart' && <CartView />}
            {tab === 'orders' && <MyOrders />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-white/8 z-30">
        <div className="flex">
          {([
            { key: 'catalog', label: 'Каталог', icon: Grid3X3 },
            { key: 'cart', label: 'Корзина', icon: ShoppingCart },
            { key: 'orders', label: 'Заказы', icon: ClipboardList },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleTab(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors ${
                tab === key ? 'text-white' : 'text-white/30'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={tab === key ? 2 : 1.5} />
                {key === 'cart' && count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white text-black font-mono text-[7px] font-bold rounded-full flex items-center justify-center"
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </div>
              <span className="font-mono text-[8px] tracking-wider">{label}</span>
              {tab === key && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-white rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Product detail sheet */}
      <ProductSheet product={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function ProductCard({ product, index, onTap }: { product: Product; index: number; onTap: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: EASE }}
      whileTap={{ scale: 0.96 }}
      onClick={onTap}
      className="relative rounded-2xl overflow-hidden text-left"
      style={{ background: 'linear-gradient(145deg,#141414,#1e1e1e)' }}
    >
      {/* Image area */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display font-black text-white/6 text-5xl">NV</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)'
        }} />

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="font-mono text-[7px] tracking-[0.15em] text-white/50 border border-white/10 bg-black/40 px-1.5 py-0.5 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Out of stock */}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2">
            <span className="font-mono text-[7px] text-red-400 bg-black/60 px-1.5 py-0.5 rounded-full">нет</span>
          </div>
        )}

        {/* Name + price on gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-display font-bold text-white text-xs tracking-wide leading-tight line-clamp-1 mb-1">
            {product.name}
          </p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-white/80 text-xs font-bold">
              {product.price.toLocaleString()}
              <span className="text-white/40 text-[8px] ml-0.5">сум</span>
            </p>
            {product.stock > 0 && (
              <span className="font-mono text-[7px] text-white/30">{product.stock} шт</span>
            )}
          </div>
        </div>
      </div>

      {/* Sizes row */}
      <div className="px-2.5 py-2 flex gap-1 flex-wrap">
        {product.sizes.slice(0, 4).map(s => (
          <span key={s} className="font-mono text-[7px] text-white/30 border border-white/8 px-1.5 py-0.5 rounded">
            {s}
          </span>
        ))}
        {product.sizes.length > 4 && (
          <span className="font-mono text-[7px] text-white/20">+{product.sizes.length - 4}</span>
        )}
      </div>
    </motion.button>
  )
}

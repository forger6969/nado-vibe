import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Package, ClipboardList, Trash2, Edit2, ChevronDown } from 'lucide-react'
import { getProducts, getOrders, deleteProduct, updateOrderStatus } from '../lib/supabase'
import type { Product, Order, OrderStatus } from '../types'
import { STATUS_LABELS, STATUS_COLORS } from '../types'
import { ProductForm } from '../components/ProductForm'

type Tab = 'products' | 'orders'

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const load = async () => {
    setLoading(true)
    const [p, o] = await Promise.all([getProducts(false), getOrders()])
    setProducts(p)
    setOrders(o)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return
    await deleteProduct(id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  const newOrders = orders.filter(o => o.status === 'new').length

  return (
    <div className="min-h-screen bg-black pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-md z-20 border-b border-white/8 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-display font-black text-white text-lg tracking-wide">АДМИН</p>
            <p className="font-mono text-white/30 text-[9px] tracking-[0.3em]">NADO VIBE · PANEL</p>
          </div>
          {tab === 'products' && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => { setEditProduct(null); setShowForm(true) }}
              className="flex items-center gap-2 bg-white text-black font-display font-semibold text-xs tracking-wide px-4 py-2 rounded-full"
            >
              <Plus size={14} />
              Добавить
            </motion.button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            { key: 'products', label: 'Товары', icon: Package, badge: products.length },
            { key: 'orders', label: 'Заказы', icon: ClipboardList, badge: newOrders },
          ] as const).map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-wide transition-all border ${
                tab === key
                  ? 'bg-white text-black border-white'
                  : 'text-white/40 border-white/10'
              }`}
            >
              <Icon size={12} />
              {label}
              {badge > 0 && (
                <span className={`text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                  tab === key ? 'bg-black text-white' : 'bg-white/10 text-white/60'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-dark rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : tab === 'products' ? (
          <ProductsList
            products={products}
            onEdit={p => { setEditProduct(p); setShowForm(true) }}
            onDelete={handleDelete}
          />
        ) : (
          <OrdersList orders={orders} onStatusChange={handleStatusChange} />
        )}
      </div>

      {/* Product form modal */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editProduct}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); load() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ProductsList({ products, onEdit, onDelete }: {
  products: Product[]
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-white/20 text-base">Нет товаров</p>
        <p className="font-body text-white/15 text-sm mt-1">Нажмите «Добавить»</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="card-dark rounded-2xl p-4 flex items-center gap-4"
        >
          <div
            className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg,#1a1a1a,#2e2e2e)' }}
          >
            {p.image_url
              ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-xl" />
              : <span className="font-display font-black text-white/10 text-xs">NV</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-display font-semibold text-white text-sm tracking-wide truncate">{p.name}</p>
                <p className="font-mono text-white/30 text-[9px] tracking-wider">{p.category}</p>
              </div>
              <p className="font-mono text-white text-xs font-bold shrink-0">{p.price.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              {!p.active && (
                <span className="font-mono text-[8px] text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded-full">скрыт</span>
              )}
              <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded-full border ${
                p.stock === 0 ? 'text-red-400 border-red-400/20' : 'text-green-400 border-green-400/20'
              }`}>
                {p.stock === 0 ? 'нет в наличии' : `${p.stock} шт`}
              </span>
              <span className="font-mono text-white/20 text-[9px]">{p.sizes.join(' · ')}</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onEdit(p)} className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center">
              <Edit2 size={12} className="text-white/40" />
            </button>
            <button onClick={() => onDelete(p.id)} className="w-8 h-8 rounded-xl border border-red-500/20 flex items-center justify-center">
              <Trash2 size={12} className="text-red-400/60" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function OrdersList({ orders, onStatusChange }: {
  orders: Order[]
  onStatusChange: (id: string, status: OrderStatus) => void
}) {
  const statuses: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled']

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-white/20 text-base">Заказов нет</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {orders.map((o, i) => (
        <motion.div
          key={o.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="card-dark rounded-2xl p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="font-display font-semibold text-white text-sm tracking-wide">{o.product_name}</p>
              <p className="font-mono text-white/30 text-[9px] tracking-wider mt-0.5">Размер: {o.size}</p>
            </div>
            <p className="font-mono text-white text-xs font-bold shrink-0">{o.price.toLocaleString()} сум</p>
          </div>

          <div className="flex flex-col gap-1 mb-3">
            {o.buyer_name && (
              <p className="font-body text-white/40 text-xs">👤 {o.buyer_name}{o.buyer_username ? ` @${o.buyer_username}` : ''}</p>
            )}
            <p className="font-body text-white/40 text-xs">📞 {o.phone}</p>
            <p className="font-body text-white/40 text-xs">📍 {o.address}</p>
            <p className="font-mono text-white/20 text-[9px]">{new Date(o.created_at).toLocaleString('ru')}</p>
          </div>

          {/* Status select */}
          <div className="relative">
            <select
              value={o.status}
              onChange={e => onStatusChange(o.id, e.target.value as OrderStatus)}
              className={`w-full appearance-none font-mono text-xs px-3 py-2 rounded-xl border-0 outline-none cursor-pointer ${STATUS_COLORS[o.status]}`}
            >
              {statuses.map(s => (
                <option key={s} value={s} className="bg-[#111] text-white">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-current opacity-50 pointer-events-none" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

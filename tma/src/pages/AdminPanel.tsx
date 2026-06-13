import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Package, ClipboardList, Trash2, Edit2, ChevronDown, ShoppingBag, PackagePlus, Star, BarChart2 } from 'lucide-react'
import { getProducts, getOrders, deleteProduct, updateOrderStatus, shipOrder } from '../lib/supabase'
import type { Product, Order, OrderStatus } from '../types'
import { STATUS_LABELS, STATUS_COLORS } from '../types'
import { ProductForm } from '../components/ProductForm'
import { CourierForm } from '../components/CourierForm'
import { RestockSheet } from '../components/RestockSheet'
import { ReviewsTab } from '../components/ReviewsTab'
import { AnalyticsTab } from '../components/AnalyticsTab'
import { notifyClient } from '../lib/botNotify'

type Tab = 'products' | 'orders' | 'reviews' | 'analytics'

const TMA_URL = import.meta.env.VITE_TMA_URL as string | undefined

/** Группа заказов из одной корзины */
interface CartGroup {
  cart_id: string
  items: Order[]
  buyer_name?: string
  buyer_username?: string
  buyer_tg_id: number
  phone: string
  address: string
  total: number
  status: OrderStatus
  courier_name?: string
  courier_phone?: string
  confirmed?: boolean
  created_at: string
}

function groupByCarts(orders: Order[]): CartGroup[] {
  const map = new Map<string, Order[]>()
  // Orders without cart_id get their own synthetic group per id
  for (const o of orders) {
    const key = o.cart_id ?? o.id
    const arr = map.get(key) ?? []
    arr.push(o)
    map.set(key, arr)
  }
  return Array.from(map.values()).map(items => {
    const first = items[0]
    return {
      cart_id: first.cart_id ?? first.id,
      items,
      buyer_name: first.buyer_name,
      buyer_username: first.buyer_username,
      buyer_tg_id: first.buyer_tg_id,
      phone: first.phone,
      address: first.address,
      total: items.reduce((s, o) => s + o.price, 0),
      status: first.status,
      courier_name: first.courier_name,
      courier_phone: first.courier_phone,
      confirmed: first.confirmed,
      created_at: first.created_at,
    }
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [restockProduct, setRestockProduct] = useState<Product | null>(null)
  const [courierGroup, setCourierGroup] = useState<CartGroup | null>(null)

  const load = async () => {
    setLoading(true)
    const [p, o] = await Promise.all([getProducts(false), getOrders()])
    setProducts(p)
    setOrders(o)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const cartGroups = useMemo(() => groupByCarts(orders), [orders])

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return
    await deleteProduct(id)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleStatusChange = async (group: CartGroup, status: OrderStatus) => {
    if (status === 'shipped') {
      setCourierGroup(group)
      return
    }
    // Apply status to all items in the cart
    await Promise.all(group.items.map(o => updateOrderStatus(o.id, status)))
    setOrders(prev => prev.map(o =>
      group.items.some(gi => gi.id === o.id) ? { ...o, status } : o
    ))

    if (status === 'delivered' && group.buyer_tg_id) {
      const itemsText = group.items.map(o => `• ${o.product_name} (${o.size})`).join('\n')
      await notifyClient(
        group.buyer_tg_id,
        `📦 <b>Ваш заказ доставлен!</b>\n\n${itemsText}\n\nПожалуйста, подтвердите получение и оставьте отзыв в магазине.`,
        TMA_URL ? { label: '✅ Подтвердить получение', url: TMA_URL } : undefined,
      )
    }
  }

  const handleCourierConfirm = async (courier_name: string, courier_phone: string) => {
    if (!courierGroup) return
    await Promise.all(courierGroup.items.map(o => shipOrder(o.id, courier_name, courier_phone)))
    setOrders(prev => prev.map(o =>
      courierGroup.items.some(gi => gi.id === o.id) ? { ...o, status: 'shipped', courier_name, courier_phone } : o
    ))

    if (courierGroup.buyer_tg_id) {
      const itemsText = courierGroup.items.map(o => `• ${o.product_name} (${o.size})`).join('\n')
      await notifyClient(
        courierGroup.buyer_tg_id,
        `🚚 <b>Ваш заказ в пути!</b>\n\n${itemsText}\n\n👤 Курьер: <b>${courier_name}</b>\n📞 Телефон: <b>${courier_phone}</b>\n\nКурьер свяжется с вами для уточнения деталей доставки.`,
        TMA_URL ? { label: '📋 Мои заказы', url: TMA_URL } : undefined,
      )
    }
    setCourierGroup(null)
  }

  const newOrders = cartGroups.filter(g => g.status === 'new').length

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
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {([
            { key: 'products', label: 'Товары', icon: Package, badge: 0 },
            { key: 'orders', label: 'Заказы', icon: ClipboardList, badge: newOrders },
            { key: 'reviews', label: 'Отзывы', icon: Star, badge: 0 },
            { key: 'analytics', label: 'Статистика', icon: BarChart2, badge: 0 },
          ] as const).map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-mono text-xs tracking-wide transition-all border shrink-0 ${
                tab === key ? 'bg-white text-black border-white' : 'text-white/40 border-white/10'
              }`}
            >
              <Icon size={11} />
              {label}
              {badge > 0 && (
                <span className={`text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center ${
                  tab === key ? 'bg-black text-white' : 'bg-white/10 text-white/60'
                }`}>{badge}</span>
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
            onRestock={p => setRestockProduct(p)}
          />
        ) : tab === 'orders' ? (
          <OrdersList groups={cartGroups} onStatusChange={handleStatusChange} />
        ) : tab === 'reviews' ? (
          <ReviewsTab />
        ) : (
          <AnalyticsTab />
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <ProductForm
            product={editProduct}
            onClose={() => setShowForm(false)}
            onSaved={() => { setShowForm(false); load() }}
          />
        )}
        {restockProduct && (
          <RestockSheet
            product={restockProduct}
            onClose={() => setRestockProduct(null)}
            onRestocked={() => { setRestockProduct(null); load() }}
          />
        )}
        {courierGroup && (
          <CourierForm
            orderName={courierGroup.items.length > 1
              ? `${courierGroup.items.length} товара · ${courierGroup.total.toLocaleString()} сум`
              : `${courierGroup.items[0].product_name} · ${courierGroup.items[0].size}`}
            onConfirm={handleCourierConfirm}
            onClose={() => setCourierGroup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ProductsList({ products, onEdit, onDelete, onRestock }: {
  products: Product[]
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  onRestock: (p: Product) => void
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
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {!p.active && (
                <span className="font-mono text-[8px] text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded-full">скрыт</span>
              )}
              <span className={`font-mono text-[8px] px-1.5 py-0.5 rounded-full border ${
                p.stock === 0 ? 'text-red-400 border-red-400/20' : 'text-green-400 border-green-400/20'
              }`}>
                {p.stock === 0 ? 'нет в наличии' : `${p.stock} шт`}
              </span>
            </div>
            {p.sizes_stock && Object.keys(p.sizes_stock).length > 0 && (
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {p.sizes.map(s => {
                  const qty = p.sizes_stock?.[s] ?? 0
                  return (
                    <span key={s} className={`font-mono text-[8px] px-1.5 py-0.5 rounded-lg ${
                      qty === 0 ? 'text-white/15 bg-white/3' : 'text-white/50 bg-white/5'
                    }`}>
                      {s}: {qty}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => onRestock(p)} className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center" title="Пополнить">
              <PackagePlus size={12} className="text-white/40" />
            </button>
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

function OrdersList({ groups, onStatusChange }: {
  groups: CartGroup[]
  onStatusChange: (group: CartGroup, status: OrderStatus) => void
}) {
  const statuses: OrderStatus[] = ['new', 'processing', 'shipped', 'delivered', 'cancelled']

  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-white/20 text-base">Заказов нет</p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g, i) => (
        <motion.div
          key={g.cart_id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="card-dark rounded-2xl p-4"
        >
          {/* Cart header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                <ShoppingBag size={12} className="text-white/40" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-white/20 text-[8px] tracking-[0.2em] uppercase">
                    Корзина · {g.items.length} {g.items.length === 1 ? 'товар' : 'товара'}
                  </p>
                  <span className="font-mono text-[9px] font-bold text-white/60 bg-white/8 px-1.5 py-0.5 rounded-md tracking-wider">
                    #{g.cart_id.slice(0, 6).toUpperCase()}
                  </span>
                </div>
                <p className="font-mono text-white/15 text-[8px]">{new Date(g.created_at).toLocaleString('ru')}</p>
              </div>
            </div>
            <p className="font-mono text-white font-bold text-sm">{g.total.toLocaleString()} сум</p>
          </div>

          {/* Items list */}
          <div className="bg-white/3 rounded-xl p-3 mb-3 flex flex-col gap-2">
            {g.items.map(o => (
              <div key={o.id} className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-display font-medium text-white text-xs tracking-wide truncate">{o.product_name}</p>
                  <p className="font-mono text-white/30 text-[8px]">Размер {o.size}</p>
                </div>
                <p className="font-mono text-white/50 text-xs shrink-0 ml-2">{o.price.toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Buyer info */}
          <div className="flex flex-col gap-1 mb-3">
            {g.buyer_name && (
              <p className="font-body text-white/40 text-xs">👤 {g.buyer_name}{g.buyer_username ? ` @${g.buyer_username}` : ''}</p>
            )}
            <p className="font-body text-white/40 text-xs">📞 {g.phone}</p>
            <p className="font-body text-white/40 text-xs">📍 {g.address}</p>
            {g.courier_name && (
              <p className="font-body text-blue-400/70 text-xs">🚚 {g.courier_name} · {g.courier_phone}</p>
            )}
            {g.confirmed && (
              <p className="font-mono text-green-400/70 text-[9px] tracking-wide">✅ Клиент подтвердил получение</p>
            )}
          </div>

          {/* Status select */}
          <div className="relative">
            <select
              value={g.status}
              onChange={e => onStatusChange(g, e.target.value as OrderStatus)}
              className={`w-full appearance-none font-mono text-xs px-3 py-2 rounded-xl border-0 outline-none cursor-pointer ${STATUS_COLORS[g.status]}`}
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

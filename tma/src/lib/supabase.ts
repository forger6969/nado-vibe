import { createClient } from '@supabase/supabase-js'
import type { Product, Order, OrderStatus, Review } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(activeOnly = true): Promise<Product[]> {
  let q = supabase.from('products').select('*').order('created_at', { ascending: false })
  if (activeOnly) q = q.eq('active', true)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function createProduct(p: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(p).select().single()
  if (error) throw error
  return data
}

export async function updateProduct(id: string, p: Partial<Product>): Promise<void> {
  const { error } = await supabase.from('products').update(p).eq('id', id)
  if (error) throw error
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createOrder(o: Omit<Order, 'id' | 'created_at' | 'status'>): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...o, status: 'new' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createOrders(
  list: Omit<Order, 'id' | 'created_at' | 'status'>[],
  cartId?: string,
  sizeQtys?: { productId: string; size: string; qty: number }[],
): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .insert(list.map(o => ({ ...o, status: 'new', cart_id: cartId })))
    .select()
  if (error) throw error

  // Decrement sizes_stock for each ordered item (best-effort)
  if (sizeQtys && sizeQtys.length > 0) {
    const byProduct = new Map<string, { size: string; qty: number }[]>()
    for (const s of sizeQtys) {
      const arr = byProduct.get(s.productId) ?? []
      arr.push({ size: s.size, qty: s.qty })
      byProduct.set(s.productId, arr)
    }
    await Promise.allSettled(
      Array.from(byProduct.entries()).map(async ([productId, sizes]) => {
        const { data: p } = await supabase.from('products').select('sizes_stock,stock').eq('id', productId).single()
        if (!p) return
        const stock: Record<string, number> = { ...(p.sizes_stock ?? {}) }
        for (const { size, qty } of sizes) {
          stock[size] = Math.max(0, (stock[size] ?? 0) - qty)
        }
        const total = Object.values(stock).reduce((a, b) => a + b, 0)
        await supabase.from('products').update({ sizes_stock: stock, stock: total }).eq('id', productId)
      })
    )
  }

  return data ?? []
}

export async function restockProduct(id: string, delta: Record<string, number>): Promise<void> {
  const { data: p } = await supabase.from('products').select('sizes_stock,stock,sizes').eq('id', id).single()
  if (!p) throw new Error('Product not found')
  const stock: Record<string, number> = { ...(p.sizes_stock ?? {}) }
  const sizes = new Set<string>(p.sizes ?? [])
  for (const [size, qty] of Object.entries(delta)) {
    if (qty <= 0) continue
    stock[size] = (stock[size] ?? 0) + qty
    sizes.add(size)
  }
  const total = Object.values(stock).reduce((a, b) => a + b, 0)
  await supabase.from('products').update({ sizes_stock: stock, stock: total, sizes: Array.from(sizes) }).eq('id', id)
}

export async function getMyOrders(tgId: number): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_tg_id', tgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function shipOrder(id: string, courier_name: string, courier_phone: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'shipped', courier_name, courier_phone })
    .eq('id', id)
  if (error) throw error
}

export async function confirmDelivery(orderId: string): Promise<void> {
  const { error } = await supabase.from('orders').update({ confirmed: true, status: 'delivered' }).eq('id', orderId)
  if (error) throw error
}

export async function createReview(r: Omit<Review, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('reviews').insert(r)
  if (error) throw error
}

export async function getOrderReview(orderId: string): Promise<Review | null> {
  const { data } = await supabase.from('reviews').select('*').eq('order_id', orderId).single()
  return data ?? null
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export interface ReviewWithOrder extends Review {
  product_name?: string
  size?: string
  buyer_name?: string
  buyer_username?: string
}

export async function getAllReviews(): Promise<ReviewWithOrder[]> {
  const [{ data: reviews }, { data: orders }] = await Promise.all([
    supabase.from('reviews').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('id, product_name, size, buyer_name, buyer_username'),
  ])
  const ordersMap = new Map((orders ?? []).map(o => [o.id, o]))
  return (reviews ?? []).map(r => ({
    ...r,
    ...ordersMap.get(r.order_id),
    id: r.id,
    order_id: r.order_id,
    created_at: r.created_at,
  }))
}

export interface ProductStat {
  product_id: string
  product_name: string
  orders: number
  revenue: number
  sizes: Record<string, number>
  buyers: Set<number>
}

export async function getOrderStats() {
  const { data } = await supabase
    .from('orders')
    .select('product_id, product_name, price, size, buyer_tg_id, status, created_at, cart_id')
  const rows = data ?? []
  const total = rows.filter(r => r.status !== 'cancelled')
  const revenue = total.reduce((s, r) => s + (r.price ?? 0), 0)

  const byProduct = new Map<string, ProductStat>()
  for (const o of total) {
    const s = byProduct.get(o.product_id) ?? {
      product_id: o.product_id, product_name: o.product_name,
      orders: 0, revenue: 0, sizes: {} as Record<string, number>, buyers: new Set<number>(),
    }
    s.orders++
    s.revenue += o.price ?? 0
    s.sizes[o.size as string] = (s.sizes[o.size as string] ?? 0) + 1
    s.buyers.add(o.buyer_tg_id as number)
    byProduct.set(o.product_id, s)
  }

  const byBuyer = new Map<number, { tg_id: number; orders: number; revenue: number }>()
  for (const o of total) {
    const b = byBuyer.get(o.buyer_tg_id) ?? { tg_id: o.buyer_tg_id, orders: 0, revenue: 0 }
    b.orders++
    b.revenue += o.price ?? 0
    byBuyer.set(o.buyer_tg_id, b)
  }

  return {
    totalRevenue: revenue,
    totalOrders: total.length,
    cancelled: rows.filter(r => r.status === 'cancelled').length,
    avgOrder: total.length > 0 ? revenue / total.length : 0,
    products: Array.from(byProduct.values()).sort((a, b) => b.revenue - a.revenue),
    topBuyers: Array.from(byBuyer.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

export async function cancelCartOrders(orderIds: string[]): Promise<void> {
  const { data: orders } = await supabase
    .from('orders')
    .select('id, product_id, size, qty, status')
    .in('id', orderIds)

  const toRestore = (orders ?? []).filter(o => o.status !== 'cancelled')

  if (toRestore.length > 0) {
    const byProduct = new Map<string, { size: string; qty: number }[]>()
    for (const o of toRestore) {
      const arr = byProduct.get(o.product_id) ?? []
      arr.push({ size: o.size as string, qty: (o.qty as number) ?? 1 })
      byProduct.set(o.product_id, arr)
    }
    await Promise.allSettled(
      Array.from(byProduct.entries()).map(async ([productId, sizes]) => {
        const { data: p } = await supabase.from('products').select('sizes_stock,stock').eq('id', productId).single()
        if (!p) return
        const stock: Record<string, number> = { ...(p.sizes_stock as Record<string, number> ?? {}) }
        for (const { size, qty } of sizes) {
          stock[size] = (stock[size] ?? 0) + qty
        }
        const total = Object.values(stock).reduce((a, b) => a + b, 0)
        await supabase.from('products').update({ sizes_stock: stock, stock: total }).eq('id', productId)
      })
    )
  }

  await supabase.from('orders').update({ status: 'cancelled' }).in('id', orderIds)
}

// ── Storage ───────────────────────────────────────────────────────────────────

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return data.publicUrl
}

// ── Admins ────────────────────────────────────────────────────────────────────

export async function isAdmin(tgId: number): Promise<boolean> {
  const { data } = await supabase.from('admins').select('tg_id').eq('tg_id', tgId).single()
  return !!data
}

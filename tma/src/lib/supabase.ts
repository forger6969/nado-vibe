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

export async function createOrders(list: Omit<Order, 'id' | 'created_at' | 'status'>[], cartId?: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .insert(list.map(o => ({ ...o, status: 'new', cart_id: cartId })))
    .select()
  if (error) throw error
  return data ?? []
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

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
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

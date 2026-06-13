export interface Product {
  id: string
  name: string
  category: string
  price: number
  sizes: string[]
  description?: string
  image_url?: string
  stock: number
  active: boolean
  created_at: string
}

export interface Order {
  id: string
  product_id: string
  product_name: string
  size: string
  buyer_tg_id: number
  buyer_name?: string
  buyer_username?: string
  phone: string
  address: string
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  price: number
  created_at: string
}

export type OrderStatus = Order['status']

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

export const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-white/10 text-white',
  processing: 'bg-yellow-500/20 text-yellow-300',
  shipped: 'bg-blue-500/20 text-blue-300',
  delivered: 'bg-green-500/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-400',
}

export const CATEGORIES = ['Поло', 'Рубашки', 'Брюки', 'Джинсы', 'Спорт', 'Аксессуары']

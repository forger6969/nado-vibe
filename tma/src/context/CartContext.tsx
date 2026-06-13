import { createContext, useContext, useEffect, useState } from 'react'
import type { Product } from '../types'

export interface CartItem {
  product: Product
  size: string
  qty: number
}

interface CartCtx {
  items: CartItem[]
  add: (product: Product, size: string) => void
  remove: (productId: string, size: string) => void
  setQty: (productId: string, size: string, qty: number) => void
  clear: () => void
  total: number
  count: number
}

const Ctx = createContext<CartCtx>({} as CartCtx)

const KEY = 'nado_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const add = (product: Product, size: string) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.product.id === product.id && i.size === size)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 }
        return next
      }
      return [...prev, { product, size, qty: 1 }]
    })
  }

  const remove = (productId: string, size: string) =>
    setItems(prev => prev.filter(i => !(i.product.id === productId && i.size === size)))

  const setQty = (productId: string, size: string, qty: number) => {
    if (qty <= 0) { remove(productId, size); return }
    setItems(prev => prev.map(i =>
      i.product.id === productId && i.size === size ? { ...i, qty } : i
    ))
  }

  const clear = () => setItems([])
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return <Ctx.Provider value={{ items, add, remove, setQty, clear, total, count }}>{children}</Ctx.Provider>
}

export const useCart = () => useContext(Ctx)

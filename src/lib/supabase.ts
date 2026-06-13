export interface Product {
  id: string
  name: string
  category: string
  price: number
  sizes: string[]
  description?: string
  image_url?: string
  active: boolean
  created_at: string
}

const API_URL = import.meta.env.VITE_API_URL as string | undefined

export async function getActiveProducts(): Promise<Product[]> {
  if (!API_URL) return []
  const res = await fetch(`${API_URL}/api/products`)
  if (!res.ok) return []
  return res.json() as Promise<Product[]>
}

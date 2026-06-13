import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { createProduct, updateProduct } from '../lib/supabase'
import type { Product } from '../types'
import { CATEGORIES } from '../types'

interface Props {
  product: Product | null
  onClose: () => void
  onSaved: () => void
}

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36']

export function ProductForm({ product, onClose, onSaved }: Props) {
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0])
  const [price, setPrice] = useState(String(product?.price ?? ''))
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? [])
  const [description, setDescription] = useState(product?.description ?? '')
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [active, setActive] = useState(product?.active ?? true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const submit = async () => {
    if (!name.trim() || !price || sizes.length === 0) {
      setError('Заполните название, цену и выберите размеры')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = {
        name: name.trim(),
        category,
        price: parseInt(price),
        sizes,
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        active,
      }
      if (isEdit) {
        await updateProduct(product.id, data)
      } else {
        await createProduct(data)
      }
      onSaved()
    } catch (e) {
      setError('Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] rounded-t-3xl max-h-[92dvh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 mb-5">
          <h2 className="font-display font-bold text-white text-base tracking-wide">
            {isEdit ? 'Редактировать' : 'Новый товар'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
            <X size={14} className="text-white/60" />
          </button>
        </div>

        <div className="px-5 pb-8 flex flex-col gap-4">
          {/* Name */}
          <FormField label="Название *">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Polo Classic"
              className="input-field"
            />
          </FormField>

          {/* Category */}
          <FormField label="Категория *">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="input-field appearance-none"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          {/* Price */}
          <FormField label="Цена (сум) *">
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="149000"
              className="input-field"
            />
          </FormField>

          {/* Sizes */}
          <FormField label="Размеры *">
            <div className="flex flex-wrap gap-2 mt-1">
              {ALL_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    sizes.includes(s)
                      ? 'bg-white text-black border-white'
                      : 'text-white/40 border-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>

          {/* Description */}
          <FormField label="Описание">
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Описание товара (необязательно)"
              className="input-field resize-none"
            />
          </FormField>

          {/* Image URL */}
          <FormField label="Ссылка на фото">
            <input
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="input-field"
            />
          </FormField>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-display font-medium text-white text-sm">Показывать на сайте</p>
              <p className="font-body text-white/30 text-xs mt-0.5">Снимите чтобы скрыть товар</p>
            </div>
            <button
              onClick={() => setActive(!active)}
              className={`relative w-12 h-6 rounded-full transition-colors ${active ? 'bg-white' : 'bg-white/15'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${active ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {error && <p className="font-body text-red-400 text-xs text-center">{error}</p>}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-white text-black font-display font-semibold text-sm tracking-wider py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              : isEdit ? 'Сохранить' : 'Добавить товар'}
          </button>
        </div>
      </motion.div>

      <style>{`.input-field { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 16px; color: white; font-size: 14px; font-family: 'Inter',sans-serif; outline: none; transition: border-color 0.2s; } .input-field:focus { border-color: rgba(255,255,255,0.25); } .input-field::placeholder { color: rgba(255,255,255,0.2); }`}</style>
    </>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-white/30 text-[9px] tracking-[0.2em] uppercase mb-2">{label}</p>
      {children}
    </div>
  )
}

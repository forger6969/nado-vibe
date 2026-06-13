import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, Loader2 } from 'lucide-react'
import { createProduct, updateProduct, uploadProductImage } from '../lib/supabase'
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
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0])
  const [price, setPrice] = useState(String(product?.price ?? ''))
  const [stock, setStock] = useState(String(product?.stock ?? '0'))
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? [])
  const [description, setDescription] = useState(product?.description ?? '')
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [imagePreview, setImagePreview] = useState(product?.image_url ?? '')
  const [active, setActive] = useState(product?.active ?? true)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const localPreview = URL.createObjectURL(file)
      setImagePreview(localPreview)
      const url = await uploadProductImage(file)
      setImageUrl(url)
    } catch {
      setError('Ошибка загрузки фото')
      setImagePreview('')
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    if (!name.trim() || !price || sizes.length === 0) {
      setError('Заполните название, цену и выберите размеры')
      return
    }
    if (uploading) { setError('Подождите — фото загружается'); return }
    setLoading(true)
    setError('')
    try {
      const data = {
        name: name.trim(),
        category,
        price: parseInt(price),
        stock: parseInt(stock) || 0,
        sizes,
        description: description.trim() || undefined,
        image_url: imageUrl || undefined,
        active,
      }
      if (isEdit) {
        await updateProduct(product.id, data)
      } else {
        await createProduct(data)
      }
      onSaved()
    } catch {
      setError('Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-40"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d0d] rounded-t-3xl max-h-[92dvh] overflow-y-auto"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        <div className="flex items-center justify-between px-5 mb-5">
          <h2 className="font-display font-bold text-white text-base tracking-wide">
            {isEdit ? 'Редактировать' : 'Новый товар'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
            <X size={14} className="text-white/60" />
          </button>
        </div>

        <div className="px-5 pb-10 flex flex-col gap-4">

          {/* Photo upload */}
          <FormField label="Фото товара">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="relative w-full aspect-[16/9] rounded-2xl border border-dashed border-white/15 overflow-hidden flex flex-col items-center justify-center gap-2 bg-white/3 active:bg-white/5 transition-colors"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 active:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                </>
              ) : uploading ? (
                <Loader2 size={24} className="text-white/30 animate-spin" />
              ) : (
                <>
                  <Upload size={20} className="text-white/20" />
                  <span className="font-mono text-white/30 text-[9px] tracking-[0.2em]">ЗАГРУЗИТЬ ФОТО</span>
                </>
              )}
            </button>
            {uploading && (
              <p className="font-mono text-white/30 text-[9px] text-center mt-1">Загружается...</p>
            )}
          </FormField>

          {/* Name */}
          <FormField label="Название *">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Polo Classic" className="input-field" />
          </FormField>

          {/* Category */}
          <FormField label="Категория *">
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field appearance-none">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          {/* Price + Stock row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <FormField label="Цена (сум) *">
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="149000" className="input-field" />
              </FormField>
            </div>
            <div className="w-28">
              <FormField label="В наличии">
                <input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="0" className="input-field" />
              </FormField>
            </div>
          </div>

          {/* Sizes */}
          <FormField label="Размеры *">
            <div className="flex flex-wrap gap-2 mt-1">
              {ALL_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    sizes.includes(s) ? 'bg-white text-black border-white' : 'text-white/40 border-white/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>

          {/* Description */}
          <FormField label="Описание">
            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Описание товара (необязательно)" className="input-field resize-none" />
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
            disabled={loading || uploading}
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

import { useEffect, useState } from 'react'
import { getOrderStats } from '../lib/supabase'
import type { ProductStat } from '../lib/supabase'

interface Stats {
  totalRevenue: number
  totalOrders: number
  cancelled: number
  avgOrder: number
  products: ProductStat[]
  topBuyers: { tg_id: number; orders: number; revenue: number }[]
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-dark rounded-2xl p-4 flex flex-col gap-1">
      <p className="font-mono text-white/25 text-[9px] tracking-[0.2em] uppercase">{label}</p>
      <p className="font-display font-black text-white text-lg tracking-wide">{value}</p>
    </div>
  )
}

export function AnalyticsTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderStats().then(s => setStats(s as Stats)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card-dark rounded-2xl h-16 animate-pulse" />)}
    </div>
  )

  if (!stats) return null

  return (
    <div className="flex flex-col gap-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KPI label="Выручка" value={stats.totalRevenue.toLocaleString() + ' сум'} />
        <KPI label="Заказов" value={String(stats.totalOrders)} />
        <KPI label="Средний чек" value={Math.round(stats.avgOrder).toLocaleString() + ' сум'} />
        <KPI label="Отменено" value={String(stats.cancelled)} />
      </div>

      {/* Top products */}
      {stats.products.length > 0 && (
        <div className="card-dark rounded-2xl p-4">
          <p className="font-mono text-white/25 text-[9px] tracking-[0.2em] uppercase mb-3">Топ товаров</p>
          <div className="flex flex-col gap-2">
            {stats.products.map((p, i) => (
              <div key={p.product_id} className="flex items-center gap-3">
                <span className="font-mono text-white/20 text-xs w-5 shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-white text-xs tracking-wide truncate">{p.product_name}</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="font-mono text-white/30 text-[9px]">{p.orders} заказов</span>
                    <span className="font-mono text-white/15 text-[9px]">·</span>
                    <span className="font-mono text-white/30 text-[9px]">
                      {Object.entries(p.sizes).map(([s, n]) => `${s}:${n}`).join(' ')}
                    </span>
                  </div>
                </div>
                <p className="font-mono text-white text-xs shrink-0">{p.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top buyers */}
      {stats.topBuyers.length > 0 && (
        <div className="card-dark rounded-2xl p-4">
          <p className="font-mono text-white/25 text-[9px] tracking-[0.2em] uppercase mb-3">Топ покупателей</p>
          <div className="flex flex-col gap-2">
            {stats.topBuyers.map((b, i) => (
              <div key={b.tg_id} className="flex items-center gap-3">
                <span className="font-mono text-white/20 text-xs w-5 shrink-0">#{i + 1}</span>
                <div className="flex-1">
                  <p className="font-mono text-white/50 text-xs">TG {b.tg_id}</p>
                  <p className="font-mono text-white/25 text-[9px]">{b.orders} заказов</p>
                </div>
                <p className="font-mono text-white text-xs">{b.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="font-mono text-white/15 text-[8px] text-center pb-2">
        * статистика по оформленным заказам (без отменённых)
      </p>
    </div>
  )
}

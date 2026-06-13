import { useEffect, useState } from 'react'
import './index.css'
import { initTg, getTgUser } from './lib/tg'
import { isAdmin } from './lib/supabase'
import { ClientCatalog } from './pages/ClientCatalog'
import { AdminPanel } from './pages/AdminPanel'
import { CartProvider } from './context/CartContext'

export default function App() {
  const [adminMode, setAdminMode] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    initTg()
    const user = getTgUser()
    if (!user) { setChecking(false); return }
    isAdmin(user.id)
      .then(setAdminMode)
      .catch(() => setAdminMode(false))
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <p className="font-display font-black text-white text-2xl tracking-widest">NADO VIBE</p>
          <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return adminMode
    ? <AdminPanel />
    : <CartProvider><ClientCatalog /></CartProvider>
}

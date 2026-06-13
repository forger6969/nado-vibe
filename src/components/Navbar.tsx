import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Каталог', href: '#catalog' },
    { label: 'О нас', href: '#about' },
    { label: 'Доставка', href: '#delivery' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md border-b border-white/8' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex flex-col leading-none group">
          <span className="font-display text-white text-lg font-black tracking-widest group-hover:text-white/80 transition-colors">
            NADO VIBE
          </span>
          <span className="font-mono text-white/40 text-[9px] tracking-[0.3em]">MEN'S WEAR</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                className="font-body text-sm text-white/50 hover:text-white transition-colors tracking-wide"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="https://t.me/nado_vibe_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-2 btn-primary text-sm px-5 py-2.5 rounded-full"
        >
          <Send size={14} />
          Заказать
        </a>

        {/* Mobile burger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/8 px-6 py-6 flex flex-col gap-6">
          {links.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="font-display text-xl font-medium text-white/80 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            href="https://t.me/nado_vibe_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-center py-3 rounded-full text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Заказать в Telegram
          </a>
        </div>
      )}
    </header>
  )
}

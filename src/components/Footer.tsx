import { Send, AtSign } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/8 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex flex-col leading-none">
            <span className="font-display text-white text-lg font-black tracking-widest">NADO VIBE</span>
            <span className="font-mono text-white/30 text-[9px] tracking-[0.3em] mt-0.5">MEN'S WEAR · TASHKENT</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://www.instagram.com/nado_vibe/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/35 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <AtSign size={18} />
            </a>
            <a
              href="https://t.me/nadovibe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/35 hover:text-white transition-colors"
              aria-label="Telegram"
            >
              <Send size={18} />
            </a>
          </div>

          {/* Copyright */}
          <p className="font-mono text-white/20 text-[10px] tracking-wider">
            © {year} NADO VIBE
          </p>
        </div>
      </div>
    </footer>
  )
}

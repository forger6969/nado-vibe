export function Marquee() {
  const items = [
    'MEN\'S WEAR',
    'NADO VIBE',
    'STREETWEAR',
    'KOREAN STYLE',
    'TASHKENT',
    'UZBEKISTAN',
    'FREE DELIVERY',
    'NEW COLLECTION',
  ]

  const repeated = [...items, ...items]

  return (
    <div className="border-y border-white/8 py-4 overflow-hidden bg-white/[0.02]">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="font-display font-black text-xs tracking-[0.3em] text-white/20 uppercase px-8">
              {item}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/15 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  )
}

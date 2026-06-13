import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export function PageEntrance() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="entrance"
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <p className="font-display font-black text-white text-3xl tracking-widest">NADO VIBE</p>
            <p className="font-mono text-white/30 text-[10px] tracking-[0.4em] mt-1">MEN'S WEAR</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

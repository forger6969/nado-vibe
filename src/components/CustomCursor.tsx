import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function CustomCursor() {
  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)

  const blobX = useMotionValue(-100)
  const blobY = useMotionValue(-100)

  const springBlobX = useSpring(blobX, { stiffness: 60, damping: 18 })
  const springBlobY = useSpring(blobY, { stiffness: 60, damping: 18 })

  const isHover = useRef(false)
  const blobScale = useMotionValue(1)
  const blobScaleSpring = useSpring(blobScale, { stiffness: 180, damping: 22 })
  const blobOpacity = useMotionValue(0.18)
  const blobOpacitySpring = useSpring(blobOpacity, { stiffness: 120, damping: 20 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX - 3)
      dotY.set(e.clientY - 3)
      blobX.set(e.clientX - 28)
      blobY.set(e.clientY - 28)
    }

    const onEnter = () => {
      isHover.current = true
      blobScale.set(2.4)
      blobOpacity.set(0.28)
    }
    const onLeave = () => {
      isHover.current = false
      blobScale.set(1)
      blobOpacity.set(0.18)
    }

    window.addEventListener('mousemove', onMove)

    const attachHover = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    attachHover()

    // Re-attach on DOM changes
    const observer = new MutationObserver(attachHover)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
    }
  }, [dotX, dotY, blobX, blobY, blobScale, blobOpacity])

  return (
    <>
      {/* Precise dot — immediate */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{ x: dotX, y: dotY }}
      />

      {/* Trailing soft blob */}
      <motion.div
        className="fixed top-0 left-0 w-14 h-14 rounded-full pointer-events-none z-[9998]"
        style={{
          x: springBlobX,
          y: springBlobY,
          scale: blobScaleSpring,
          opacity: blobOpacitySpring,
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
        }}
      />
    </>
  )
}

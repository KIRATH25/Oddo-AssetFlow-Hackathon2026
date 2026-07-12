import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, History, KeyRound } from 'lucide-react'

const TAGLINES = [
  "Every asset, always accounted for.",
  "Precision tracking for modern enterprise operations.",
  "Streamline resources, eliminate allocation waste."
]

export const AuthLeftPanel: React.FC = () => {
  const [taglineIndex, setTaglineIndex] = useState(0)

  // Rotate taglines every 5 seconds for a dynamic, alive feel
  useEffect(() => {
    const timer = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div 
      className="hidden lg:flex flex-col justify-between w-[45%] h-screen p-48 relative overflow-hidden select-none"
      style={{
        background: 'radial-gradient(circle at 30% 30%, rgba(124, 90, 120, 0.08) 0%, rgba(124, 90, 120, 0.02) 100%), var(--color-bg)'
      }}
    >
      {/* Abstract background geometric pattern (grid + dots) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" />
            </pattern>
            <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="var(--color-primary)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#dots)" opacity="0.6" />
        </svg>
      </div>

      {/* Top Section: Logo Wordmark */}
      <div className="z-10 flex items-center gap-16">
        {/* Beautiful isometric abstract asset logo */}
        <svg className="w-32 h-32 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="text-[20px] font-bold tracking-tight text-text-primary">
          Asset<span className="text-primary">Flow</span>
        </span>
      </div>

      {/* Mid Section: Headlines & trust items */}
      <div className="z-10 flex flex-col gap-40 max-w-[400px]">
        {/* Dynamic Tagline */}
        <div className="h-[90px] flex items-end">
          <AnimatePresence mode="wait">
            <motion.h1
              key={taglineIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="text-[40px] leading-[48px] font-heading text-primary font-bold"
            >
              {TAGLINES[taglineIndex]}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* 3 Trust Bullets */}
        <div className="flex flex-col gap-24">
          <div className="flex items-start gap-16">
            <div className="p-8 bg-card rounded-control border border-border/60 text-primary flex items-center justify-center shadow-soft">
              <Layers size={18} />
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-text-primary">Zero double-allocations</h4>
              <p className="text-[13px] text-text-secondary mt-2">Smart locks prevent simultaneous booking of critical inventory.</p>
            </div>
          </div>

          <div className="flex items-start gap-16">
            <div className="p-8 bg-card rounded-control border border-border/60 text-primary flex items-center justify-center shadow-soft">
              <History size={18} />
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-text-primary">Real-time audit trails</h4>
              <p className="text-[13px] text-text-secondary mt-2">Immutable records tracking asset custody updates instantly.</p>
            </div>
          </div>

          <div className="flex items-start gap-16">
            <div className="p-8 bg-card rounded-control border border-border/60 text-primary flex items-center justify-center shadow-soft">
              <KeyRound size={18} />
            </div>
            <div>
              <h4 className="text-[15px] font-semibold text-text-primary">Role-based access control</h4>
              <p className="text-[13px] text-text-secondary mt-2">Enforce secure permissions for checkout policies across departments.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Abstract Line Art Illustration depicting network connections */}
      <div className="absolute right-0 bottom-64 w-[280px] h-[280px] opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" stroke="var(--color-primary)" strokeWidth="1">
          <circle cx="100" cy="100" r="80" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="50" />
          <circle cx="100" cy="100" r="20" fill="var(--color-primary)" fillOpacity="0.1" />
          <line x1="100" y1="20" x2="100" y2="180" />
          <line x1="20" y1="100" x2="180" y2="100" />
          <polygon points="100,60 140,100 100,140 60,100" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* Bottom Section: Footer Trust Label */}
      <div className="z-10 text-[13px] text-text-secondary/70">
        Trusted by operations teams
      </div>
    </div>
  )
}

export default AuthLeftPanel

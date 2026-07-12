import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AuthLeftPanel from './AuthLeftPanel'

interface AuthShellProps {
  children: React.ReactNode;
  activeKey: string;
}

export const AuthShell: React.FC<AuthShellProps> = ({ children, activeKey }) => {
  return (
    <div className="min-h-screen w-full flex bg-bg text-text-primary">
      {/* Left panel: 45% width, static (hidden below lg: 1024px) */}
      <AuthLeftPanel />

      {/* Right panel: 55% width on desktop, 100% on mobile */}
      <div className="w-full lg:w-[55%] min-h-screen bg-card flex flex-col justify-center items-center py-32 px-24 lg:px-[64px] overflow-y-auto">
        <div className={`w-full flex flex-col gap-24 transition-all duration-200 ${activeKey === 'signup' ? 'max-w-[500px]' : 'max-w-[420px]'}`}>
          {/* Animate page transitions (Login <-> Signup) inside the right panel container */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full flex flex-col gap-24"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default AuthShell

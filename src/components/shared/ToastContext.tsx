import React, { createContext, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, message }])
    
    // Clear toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-32 right-32 z-[9999] flex flex-col gap-12 pointer-events-none select-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-16 py-12 rounded-card border shadow-lg flex items-center gap-12 text-[13px] font-bold pointer-events-auto max-w-[360px] transition-all duration-300 animate-fade-in ${
              t.type === 'success'
                ? 'bg-green-500/10 border-green-200/40 text-green-600 dark:bg-green-950/20 dark:border-green-800/40 dark:text-green-400'
                : t.type === 'error'
                ? 'bg-red-500/10 border-red-200/40 text-red-600 dark:bg-red-950/20 dark:border-red-800/40 dark:text-red-400'
                : 'bg-primary/10 border-primary/20 text-primary dark:bg-primary/20 dark:text-primary-light'
            }`}
          >
            {t.type === 'success' && (
              <svg className="w-16 h-16 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg className="w-16 h-16 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

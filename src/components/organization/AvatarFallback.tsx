import React from 'react'

interface AvatarFallbackProps {
  name: string;
  userId: string;
  className?: string;
}

const PASTEL_PALETTES = [
  'bg-red-500/10 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40',
  'bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/40',
  'bg-amber-500/10 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40',
  'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40',
  'bg-teal-500/10 text-teal-600 border-teal-200 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/40',
  'bg-sky-500/10 text-sky-600 border-sky-200 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/40',
  'bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/40',
  'bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/40',
]

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ name, userId, className = 'w-44 h-44 text-[14px]' }) => {
  // Deterministic palette hash
  const getPalette = (uid: string) => {
    let hash = 0
    const str = uid || 'fallback'
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const idx = Math.abs(hash) % PASTEL_PALETTES.length
    return PASTEL_PALETTES[idx]
  }

  const getInitials = (val: string) => {
    if (!val) return 'U'
    const parts = val.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold border select-none shrink-0 ${className} ${getPalette(userId)}`}
    >
      <span>{getInitials(name)}</span>
    </div>
  )
}

export default AvatarFallback

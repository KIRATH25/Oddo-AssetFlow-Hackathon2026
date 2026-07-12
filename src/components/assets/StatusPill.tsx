import React from 'react'

export type AssetStatus = 
  | 'Available' 
  | 'Allocated' 
  | 'Reserved' 
  | 'Under Maintenance' 
  | 'Lost' 
  | 'Retired' 
  | 'Disposed'

interface StatusPillProps {
  status: AssetStatus;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-success/8 dark:bg-emerald-500/10 border-success/20 dark:border-emerald-500/20 text-success dark:text-emerald-400',
          dot: 'bg-success dark:bg-emerald-400'
        }
      case 'Allocated':
        return {
          bg: 'bg-primary/8 dark:bg-fuchsia-500/10 border-primary/20 dark:border-fuchsia-500/20 text-primary dark:text-fuchsia-400',
          dot: 'bg-primary dark:bg-fuchsia-400'
        }
      case 'Reserved':
        return {
          bg: 'bg-info/8 dark:bg-blue-500/10 border-info/20 dark:border-blue-500/20 text-info dark:text-blue-400',
          dot: 'bg-info dark:bg-blue-400'
        }
      case 'Under Maintenance':
        return {
          bg: 'bg-warning/8 dark:bg-amber-500/10 border-warning/20 dark:border-amber-500/20 text-warning dark:text-amber-400',
          dot: 'bg-warning dark:bg-amber-400'
        }
      case 'Lost':
        return {
          bg: 'bg-danger/8 dark:bg-rose-500/10 border-danger/20 dark:border-rose-500/20 text-danger dark:text-rose-400',
          dot: 'bg-danger dark:bg-rose-400'
        }
      case 'Retired':
        return {
          bg: 'bg-zinc-100 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400',
          dot: 'bg-zinc-400 dark:bg-zinc-500'
        }
      case 'Disposed':
        return {
          bg: 'bg-zinc-100/60 dark:bg-zinc-800/20 border-zinc-200/60 dark:border-zinc-800/60 text-zinc-400 dark:text-zinc-500 line-through',
          dot: 'bg-zinc-300 dark:bg-zinc-600'
        }
      default:
        return {
          bg: 'bg-zinc-100 border-zinc-200 text-zinc-600',
          dot: 'bg-zinc-400'
        }
    }
  }

  const styles = getStyles()

  return (
    <div
      className={`inline-flex items-center gap-6 px-10 h-24 border text-[11px] font-bold rounded-full select-none leading-none tracking-wide ${styles.bg} ${className}`}
    >
      <span className={`w-6 h-6 rounded-full flex-shrink-0 ${styles.dot}`} />
      <span>{status}</span>
    </div>
  )
}

export default StatusPill

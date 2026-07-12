import React from 'react'
import { Calendar, User, CornerDownRight } from 'lucide-react'
import type { AllocationHistoryEntry } from '../../hooks/useAssetHistory'
import { format } from 'date-fns'

interface AllocationHistoryListProps {
  entries: AllocationHistoryEntry[];
}

export const AllocationHistoryList: React.FC<AllocationHistoryListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center select-none border border-dashed border-border/40 rounded-control bg-bg/20">
        <span className="text-[12px] text-text-secondary italic">No allocation history yet.</span>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="flex flex-col gap-12 select-none">
      {entries.map((entry) => {
        const isActive = entry.status === 'active' || !entry.returned_at
        return (
          <div
            key={entry.id}
            className={`border rounded-control p-12 text-[12px] relative flex flex-col gap-8 transition-all
              ${isActive
                ? 'border-primary/20 bg-primary/[0.02]'
                : 'border-border/60 bg-card dark:border-zinc-800'
              }
            `}
          >
            {/* Status indicators */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6 font-bold text-text-primary dark:text-zinc-200">
                <User size={14} className="text-text-secondary" />
                <span>{entry.full_name}</span>
              </div>
              <span
                className={`px-8 py-2 rounded-full text-[9px] font-bold uppercase tracking-wider
                  ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }
                `}
              >
                {isActive ? 'Current' : 'Returned'}
              </span>
            </div>

            {/* Date range */}
            <div className="flex items-center gap-6 text-text-secondary dark:text-zinc-400 text-[11px]">
              <Calendar size={12} />
              <span>
                {formatDate(entry.allocated_at)} –{' '}
                {entry.returned_at ? formatDate(entry.returned_at) : 'Active'}
              </span>
            </div>

            {/* Return condition detail */}
            {!isActive && entry.condition_on_return && (
              <div className="flex items-center gap-4 text-text-secondary dark:text-zinc-500 text-[11px] border-t border-border/40 dark:border-zinc-800/40 pt-6">
                <CornerDownRight size={10} />
                <span>Returned Condition: <strong className="font-semibold text-text-primary dark:text-zinc-400">{entry.condition_on_return}</strong></span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default AllocationHistoryList

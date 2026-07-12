import React from 'react'
import { Calendar, Wrench, CheckCircle2 } from 'lucide-react'
import type { MaintenanceHistoryEntry } from '../../hooks/useAssetHistory'
import { format } from 'date-fns'

interface MaintenanceHistoryListProps {
  entries: MaintenanceHistoryEntry[];
}

export const MaintenanceHistoryList: React.FC<MaintenanceHistoryListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center select-none border border-dashed border-border/40 rounded-control bg-bg/20">
        <span className="text-[12px] text-text-secondary italic">No maintenance records yet.</span>
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-success/10 text-success'
      case 'in_progress':
        return 'bg-warning/10 text-warning'
      case 'requested':
        return 'bg-info/10 text-info'
      case 'cancelled':
        return 'bg-zinc-100 text-zinc-500'
      default:
        return 'bg-zinc-100 text-zinc-500'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ')
  }

  return (
    <div className="flex flex-col gap-12 select-none">
      {entries.map((entry) => {
        const isResolved = entry.status === 'resolved'
        return (
          <div
            key={entry.id}
            className={`border rounded-control p-12 text-[12px] flex flex-col gap-8 transition-all
              ${isResolved
                ? 'border-success/15 bg-success/[0.01]'
                : 'border-border/60 bg-card dark:border-zinc-800'
              }
            `}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6 font-bold text-text-primary dark:text-zinc-200">
                <Wrench size={14} className="text-text-secondary" />
                <span className="capitalize">Ticket #{entry.id.substring(0, 5)}</span>
              </div>
              <span
                className={`px-8 py-2 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(
                  entry.status
                )}`}
              >
                {getStatusLabel(entry.status)}
              </span>
            </div>

            {/* Description */}
            <p className="text-[12px] text-text-primary dark:text-zinc-300 leading-relaxed font-medium">
              {entry.issue_description}
            </p>

            {/* Dates */}
            <div className="flex flex-col gap-4 text-text-secondary dark:text-zinc-500 text-[11px] border-t border-border/40 dark:border-zinc-800/40 pt-6">
              <div className="flex items-center gap-6">
                <Calendar size={12} />
                <span>Requested: {formatDate(entry.created_at)}</span>
              </div>
              {entry.resolved_at && (
                <div className="flex items-center gap-6 text-success">
                  <CheckCircle2 size={12} />
                  <span>Resolved: {formatDate(entry.resolved_at)}</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MaintenanceHistoryList

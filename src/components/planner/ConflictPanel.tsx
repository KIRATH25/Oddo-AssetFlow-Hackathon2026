import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, Trash2 } from 'lucide-react'
import { useSchedulingConflictsQuery } from '../../hooks/useSchedulingConflicts'
import { useCancelBookingMutation } from '../../hooks/useCreateBooking'
import { useToast } from '../shared/ToastContext'

export const ConflictPanel: React.FC = () => {
  const { toast } = useToast()
  const { data: conflicts = [], isLoading } = useSchedulingConflictsQuery()
  const cancelMutation = useCancelBookingMutation()
  
  // Selected conflict for resolution popup
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  const handleResolve = async (bookingId: string) => {
    try {
      await cancelMutation.mutateAsync(bookingId)
      toast('success', 'Overlapping booking successfully cancelled.')
      setResolvingId(null)
    } catch (err: any) {
      toast('error', err.message || 'Failed to cancel conflict.')
    }
  }

  if (isLoading) {
    return (
      <div className="border border-border dark:border-zinc-800 rounded-card p-16 bg-card dark:bg-zinc-900 animate-pulse flex flex-col gap-8">
        <div className="h-12 w-80 bg-border/60 rounded" />
        <div className="h-16 w-[70%] bg-border/40 rounded mt-4" />
      </div>
    )
  }

  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-8 text-[12px] font-bold text-text-secondary dark:text-zinc-500 py-8 select-none">
        <CheckCircle size={14} className="text-success" />
        <span>No scheduling conflicts detected</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12 select-none">
      <div className="border border-danger/20 bg-danger/5 dark:bg-rose-500/5 rounded-card p-16 flex flex-col gap-12 shadow-xs">
        <div className="flex items-center gap-8 text-danger font-bold text-[13px]">
          <AlertTriangle size={16} />
          <span>{conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''} Detected</span>
        </div>

        <div className="flex flex-col gap-12">
          {conflicts.map((c) => (
            <div
              key={c.id}
              className="bg-card dark:bg-zinc-900 border border-danger/10 dark:border-rose-950 p-12 rounded-control text-[12px] flex flex-col gap-6"
            >
              <div className="font-bold text-text-primary dark:text-zinc-200">
                {c.asset_name} ({c.asset_tag})
              </div>
              <p className="text-[11px] text-text-secondary dark:text-zinc-400 leading-relaxed">
                Double-booked on <strong className="text-text-primary dark:text-zinc-300 font-semibold">{c.date_label}</strong> at {c.time_label}.
              </p>
              
              <button
                type="button"
                onClick={() => setResolvingId(resolvingId === c.id ? null : c.id)}
                className="text-[11px] text-danger hover:underline font-bold text-left self-start mt-4 cursor-pointer"
              >
                Resolve Now
              </button>

              {/* Collapsible Action Selector */}
              {resolvingId === c.id && (
                <div className="flex flex-col gap-8 border-t border-border/40 dark:border-zinc-800/40 pt-8 mt-6 select-none animate-fadeIn">
                  <span className="text-[10px] font-bold text-text-secondary dark:text-zinc-500 uppercase tracking-wider">
                    Select Booking to Cancel:
                  </span>
                  <div className="flex flex-col gap-4">
                    <button
                      type="button"
                      onClick={() => handleResolve(c.booking1.id)}
                      className="h-28 px-8 bg-danger/5 hover:bg-danger/10 border border-danger/10 text-danger rounded text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span>Cancel Booking 1: "{c.booking1.title || 'Untitled'}"</span>
                      <Trash2 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(c.booking2.id)}
                      className="h-28 px-8 bg-danger/5 hover:bg-danger/10 border border-danger/10 text-danger rounded text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span>Cancel Booking 2: "{c.booking2.title || 'Untitled'}"</span>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ConflictPanel

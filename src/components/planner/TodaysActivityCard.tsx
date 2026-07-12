import React from 'react'
import { CalendarCheck } from 'lucide-react'
import { useTodaysBookingsQuery } from '../../hooks/useTodaysBookings'

export const TodaysActivityCard: React.FC = () => {
  const { data: activity, isLoading } = useTodaysBookingsQuery()

  if (isLoading) {
    return (
      <div className="border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 rounded-card p-16 animate-pulse flex flex-col gap-12 select-none">
        <div className="h-16 w-[40%] bg-border/60 rounded" />
        <div className="h-12 w-full bg-border/40 rounded mt-4" />
      </div>
    )
  }

  const count = activity?.todaysBookingsCount || 0
  const ongoing = activity?.ongoingBooking || null

  return (
    <div className="border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 rounded-card p-16 flex flex-col gap-16 select-none shadow-xs">
      
      {/* Title Header */}
      <div className="flex items-center gap-8 border-b border-border/40 dark:border-zinc-800/40 pb-8 select-none">
        <CalendarCheck size={16} className="text-primary" />
        <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">
          Today's Activity
        </span>
      </div>

      {/* Main summary indicator */}
      <div className="flex flex-col gap-4">
        <span className="text-[20px] font-bold text-text-primary dark:text-zinc-100">
          {count} {count === 1 ? 'booking' : 'bookings'} today
        </span>
      </div>

      {/* Ongoing Pulsing treatment if active */}
      {ongoing ? (
        <div className="bg-success/5 border border-success/15 rounded-control p-12 flex flex-col gap-4 relative overflow-hidden select-none animate-pulse">
          <div className="flex items-center gap-6 text-success font-bold text-[11px]">
            <span className="relative flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-success"></span>
            </span>
            <span>Happening Now</span>
          </div>
          <span className="text-[12px] font-bold text-text-primary dark:text-zinc-200 leading-tight mt-2 truncate w-full">
            {ongoing.title}
          </span>
          <span className="text-[10px] text-text-secondary dark:text-zinc-500 font-semibold uppercase tracking-wider">
            In {ongoing.assetName}
          </span>
        </div>
      ) : count === 0 ? (
        <span className="text-[12px] text-text-secondary dark:text-zinc-500 italic py-4">
          Nothing booked for today
        </span>
      ) : null}

    </div>
  )
}

export default TodaysActivityCard

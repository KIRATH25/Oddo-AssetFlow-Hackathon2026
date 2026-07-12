import React from 'react'
import { CalendarCheck, Building, Car, Box } from 'lucide-react'
import { useTodaysBookingsQuery } from '../../hooks/useTodaysBookings'
import { format } from 'date-fns'

export const UpcomingTodayList: React.FC = () => {
  const { data: activity, isLoading } = useTodaysBookingsQuery()

  const getIcon = (categoryName: string) => {
    const low = categoryName.toLowerCase()
    if (low.includes('room') || low.includes('conference') || low.includes('office') || low.includes('space')) {
      return <Building size={12} className="text-text-secondary/60 flex-shrink-0" />
    }
    if (low.includes('vehicle') || low.includes('car') || low.includes('truck')) {
      return <Car size={12} className="text-text-secondary/60 flex-shrink-0" />
    }
    return <Box size={12} className="text-text-secondary/60 flex-shrink-0" />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-12 select-none animate-pulse">
        <div className="h-14 w-[50%] bg-border/60 rounded" />
        <div className="h-44 w-full bg-border/30 rounded" />
        <div className="h-44 w-full bg-border/30 rounded" />
      </div>
    )
  }

  const upcomingList = activity?.upcomingTodayList || []

  return (
    <div className="flex flex-col gap-16 select-none">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center border-b border-border/40 dark:border-zinc-800/40 pb-8">
        <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200 flex items-center gap-6">
          <CalendarCheck size={16} className="text-primary" />
          Upcoming Today
        </span>
        {upcomingList.length > 0 && (
          <span className="px-8 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {upcomingList.length}
          </span>
        )}
      </div>

      {upcomingList.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-[12px] text-text-secondary dark:text-zinc-500 italic">
            No more bookings today
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {upcomingList.map((item) => (
            <div
              key={item.id}
              className="border-l-[3px] border-primary border border-border/60 dark:border-zinc-800 bg-card dark:bg-zinc-900 rounded-control p-12 flex flex-col gap-6 shadow-xs"
            >
              <div className="flex justify-between items-start">
                <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200 line-clamp-1 max-w-[160px]" title={item.title}>
                  {item.title}
                </span>
                <span className="text-[11px] font-bold text-primary flex-shrink-0">
                  {item.is_all_day ? 'All Day' : format(new Date(item.start_time), 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center gap-6 text-[11px] text-text-secondary dark:text-zinc-500 font-semibold mt-2">
                {getIcon(item.categoryName)}
                <span className="truncate">{item.assetName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default UpcomingTodayList

import React from 'react'
import { CalendarCheck, Box } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import { isToday, format } from 'date-fns'

interface TodayBooking {
  id: string;
  title: string | null;
  start_time: string;
  end_time: string;
  assetName: string;
  assetTag: string;
}

export const UpcomingTodayPanel: React.FC = () => {
  const { data: todayBookings = [], isLoading } = useQuery<TodayBooking[]>({
    queryKey: ['upcoming-today-bookings'],
    queryFn: async () => {
      // 1. Fetch asset names map
      const { data: assets } = await supabase
        .from('assets')
        .select('id, name, asset_tag')
      const assetsMap = new Map((assets || []).map(a => [a.id, a]))

      // 2. Fetch all upcoming/ongoing bookings
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['upcoming', 'ongoing'])

      if (error) throw error
      if (!bookings) return []

      // 3. Filter for today's bookings client-side
      const filtered = bookings.filter((b) => isToday(new Date(b.start_time)))

      // Sort by start_time
      filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

      return filtered.map((b) => {
        const assetInfo = assetsMap.get(b.asset_id)
        return {
          id: b.id,
          title: b.title || 'Untitled Booking',
          start_time: b.start_time,
          end_time: b.end_time,
          assetName: assetInfo?.name || 'Unknown Resource',
          assetTag: assetInfo?.asset_tag || 'AF-xxxx'
        }
      })
    }
  })

  const formatTime = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr)
      const e = new Date(endStr)
      
      // Check if it spans more than 23 hours (considered All Day)
      const diffMs = e.getTime() - s.getTime()
      if (diffMs >= 23 * 60 * 60 * 1000) {
        return 'All Day'
      }

      return format(s, 'h:mm a')
    } catch {
      return 'All Day'
    }
  }

  if (isLoading) {
    return (
      <div className="border border-border dark:border-zinc-800 rounded-card p-16 bg-card dark:bg-zinc-900 animate-pulse flex flex-col gap-12">
        <div className="h-12 w-[30%] bg-border/60 rounded" />
        <div className="h-28 w-full bg-border/40 rounded mt-4" />
        <div className="h-28 w-full bg-border/40 rounded" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-16 select-none">
      {/* Header Panel */}
      <div className="flex justify-between items-center select-none border-b border-border/40 dark:border-zinc-800/40 pb-8">
        <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200 flex items-center gap-6">
          <CalendarCheck size={16} className="text-primary" />
          Upcoming Today
        </span>
        {todayBookings.length > 0 && (
          <span className="px-8 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {todayBookings.length}
          </span>
        )}
      </div>

      {todayBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center select-none">
          <CalendarCheck size={28} className="text-text-secondary/30 dark:text-zinc-600 mb-8" />
          <span className="text-[12px] text-text-secondary dark:text-zinc-500 italic">Nothing scheduled for today</span>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {todayBookings.map((b) => (
            <div
              key={b.id}
              className="border border-border/60 dark:border-zinc-800 bg-card dark:bg-zinc-900 rounded-control p-12 flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200 line-clamp-1 max-w-[200px]">
                  {b.title}
                </span>
                <span className="text-[11px] font-bold text-primary flex-shrink-0">
                  {formatTime(b.start_time, b.end_time)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-text-secondary dark:text-zinc-500 text-[11px] font-semibold">
                <Box size={12} className="text-text-secondary/60 flex-shrink-0" />
                <span className="truncate">{b.assetName} ({b.assetTag})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UpcomingTodayPanel

import React from 'react'
import { Link } from 'react-router-dom'
import { format, isToday, startOfDay, endOfDay } from 'date-fns'
import type { Asset } from '../../hooks/useAssets'
import type { Booking } from '../../hooks/useBookingsForRange'
import BookingChip from './BookingChip'
import { Calendar, Box } from 'lucide-react'

interface CalendarGridProps {
  days: Date[];
  resources: Asset[];
  bookings: Booking[];
  loading: boolean;
  onCellClick: (resourceId: string, date: Date) => void;
  onEventClick: (booking: Booking, assetName: string, assetTag: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  resources,
  bookings,
  loading,
  onCellClick,
  onEventClick
}) => {

  const getCellBookings = (resourceId: string, day: Date) => {
    const dayStart = startOfDay(day).getTime()
    const dayEnd = endOfDay(day).getTime()

    return bookings.filter((b) => {
      if (b.asset_id !== resourceId) return false
      if (b.status === 'cancelled') return false // skip cancelled in active grid view
      
      const bStart = new Date(b.start_time).getTime()
      const bEnd = new Date(b.end_time).getTime()
      
      // Overlap calculation: start1 < end2 && end1 > start2
      return bStart < dayEnd && bEnd > dayStart
    })
  }

  // Parse category capacity or details based on real schema
  const getResourceMetadata = (r: Asset) => {
    if (r.custom_fields && Array.isArray(r.custom_fields)) {
      const capField = r.custom_fields.find(
        (f) => f && f.label && f.label.toLowerCase().includes('capacity')
      )
      if (capField && capField.value) {
        return `Cap: ${capField.value}`
      }
    }
    // Return category name or fallback description, no mock capacity
    return r.categoryName || 'Equipment'
  }

  if (loading) {
    return (
      <div className="border border-border dark:border-zinc-800 rounded-card bg-card dark:bg-zinc-900 shadow-sm p-48 flex items-center justify-center min-h-[300px] select-none">
        <div className="flex flex-col items-center gap-16 text-center">
          <svg className="animate-spin h-32 w-32 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-[13px] font-bold text-text-secondary animate-pulse">Loading schedule grid...</span>
        </div>
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <div className="border border-border dark:border-zinc-800 rounded-card bg-card dark:bg-zinc-900 shadow-sm p-48 flex flex-col items-center justify-center min-h-[320px] text-center select-none">
        <Calendar size={48} className="text-text-secondary/30 dark:text-zinc-600 mb-16" />
        <h3 className="text-[16px] font-bold text-text-primary dark:text-zinc-200">No bookable resources yet</h3>
        <p className="text-[13px] text-text-secondary dark:text-zinc-500 max-w-[280px] mt-4 mb-20 leading-relaxed">
          Mark an asset as &apos;shared/bookable&apos; in the Asset Directory to start scheduling it here.
        </p>
        <Link
          to="/assets"
          className="h-36 px-16 bg-primary text-white hover:bg-primary/95 text-[12px] font-bold rounded-control flex items-center gap-8 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Box size={14} />
          <span>Go to Assets</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="border border-border dark:border-zinc-800 rounded-card bg-card dark:bg-zinc-900 shadow-sm overflow-hidden select-none">
      
      {/* Calendar Header Column Labels */}
      <div 
        className="border-b border-border dark:border-zinc-800 bg-bg/50 dark:bg-zinc-950/20 text-center text-[11px] font-bold text-text-secondary uppercase tracking-wider"
        style={{
          display: 'grid',
          gridTemplateColumns: `140px repeat(${days.length}, minmax(0, 1fr))`
        }}
      >
        <div className="p-12 text-left font-bold border-r border-border dark:border-zinc-800 flex items-center">
          Resource
        </div>
        {days.map((day) => {
          const isDayToday = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className={`p-12 flex flex-col gap-2 justify-center items-center select-none
                ${isDayToday 
                  ? 'bg-primary/5 text-primary border-b-[2px] border-primary font-bold' 
                  : ''
                }
              `}
            >
              <span className="opacity-80">{format(day, 'eee')}</span>
              <span className="text-[13px] font-bold mt-2">{format(day, 'd')}</span>
            </div>
          )
        })}
      </div>

      {/* Schedule Rows */}
      <div className="divide-y divide-border/60 dark:divide-zinc-800/60">
        {resources.map((resource) => (
          <div
            key={resource.id}
            style={{
              display: 'grid',
              gridTemplateColumns: `140px repeat(${days.length}, minmax(0, 1fr))`
            }}
            className="hover:bg-bg/10 dark:hover:bg-zinc-800/10 transition-all select-none"
          >
            {/* Resource row metadata */}
            <div className="flex flex-col gap-4 text-left p-16 select-none justify-center h-full min-h-[76px] w-[140px] border-r border-border dark:border-zinc-800 bg-bg/20 dark:bg-zinc-950/10">
              <span className="text-[14px] font-medium text-text-primary dark:text-zinc-100 truncate w-full" title={resource.name}>
                {resource.name}
              </span>
              <span className="text-[10px] font-semibold text-text-secondary dark:text-zinc-500 uppercase tracking-wide">
                {getResourceMetadata(resource)}
              </span>
            </div>

            {/* Daily cells */}
            {days.map((day) => {
              const cellBookings = getCellBookings(resource.id, day)
              const isDayToday = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => onCellClick(resource.id, day)}
                  className={`p-8 border-r border-border/40 dark:border-zinc-800/40 min-h-[76px] flex flex-col gap-6 cursor-pointer transition-all hover:bg-bg/30 dark:hover:bg-zinc-800/20 relative group
                    ${isDayToday ? 'bg-primary/[0.01]' : ''}
                  `}
                >
                  {/* Plus trigger overlay */}
                  <div className="absolute inset-0 items-center justify-center hidden group-hover:flex bg-primary/[0.02] pointer-events-none select-none">
                    <span className="text-primary opacity-30 text-[20px] font-bold">+</span>
                  </div>

                  {cellBookings.map((b) => (
                    <BookingChip
                      key={b.id}
                      booking={b}
                      onClick={(e) => {
                        e.stopPropagation() // block quick add cellular triggers
                        onEventClick(b, resource.name, resource.asset_tag)
                      }}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarGrid

import React from 'react'
import type { Booking } from '../../hooks/useBookingsForRange'
import { format } from 'date-fns'

interface BookingChipProps {
  booking: Booking;
  onClick: (e: React.MouseEvent) => void;
}

export const BookingChip: React.FC<BookingChipProps> = ({ booking, onClick }) => {
  const getStyleClass = () => {
    switch (booking.status) {
      case 'ongoing':
        return 'bg-success/10 border-success/20 hover:bg-success/15 text-success'
      case 'completed':
        return 'bg-secondary/10 border-secondary/20 hover:bg-secondary/15 text-text-secondary dark:text-zinc-400'
      case 'cancelled':
        return 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 text-text-secondary/60 line-through dark:border-zinc-700'
      case 'upcoming':
      default:
        return 'bg-primary/10 border-primary/20 hover:bg-primary/15 text-primary'
    }
  }

  const formatTimeRange = () => {
    if (booking.is_all_day) return 'All Day'
    try {
      const s = format(new Date(booking.start_time), 'HH:mm')
      const e = format(new Date(booking.end_time), 'HH:mm')
      return `${s} - ${e}`
    } catch {
      return ''
    }
  }

  return (
    <div
      onClick={onClick}
      className={`border rounded-control p-8 flex flex-col gap-4 text-left transition-all active:scale-[0.98] select-none cursor-pointer w-full shadow-xs relative overflow-hidden group
        ${getStyleClass()}
      `}
    >
      {/* Ongoing Pulsing Dot Indicator */}
      {booking.status === 'ongoing' && (
        <span className="absolute top-8 right-8 flex h-6 w-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
          <span className="relative inline-flex rounded-full h-6 w-6 bg-success"></span>
        </span>
      )}

      <span className="text-[11px] font-bold truncate leading-tight pr-12">
        {booking.title || 'Untitled Booking'}
      </span>
      
      <span className="text-[9px] font-bold opacity-80 tracking-wider">
        {formatTimeRange()}
      </span>
    </div>
  )
}

export default BookingChip

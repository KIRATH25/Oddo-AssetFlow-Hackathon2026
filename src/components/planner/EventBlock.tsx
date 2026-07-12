import React from 'react'
import type { Booking } from '../../hooks/useBookingsForRange'
import { format } from 'date-fns'

interface EventBlockProps {
  booking: Booking;
  onClick: (e: React.MouseEvent) => void;
}

export const EventBlock: React.FC<EventBlockProps> = ({ booking, onClick }) => {
  const getColors = () => {
    switch (booking.status) {
      case 'upcoming':
        return 'bg-primary/10 border-primary/20 hover:bg-primary/15 text-primary'
      case 'ongoing':
        return 'bg-info/10 border-info/20 hover:bg-info/15 text-info'
      case 'completed':
        return 'bg-success/8 border-success/15 hover:bg-success/12 text-success'
      case 'cancelled':
        return 'bg-zinc-100/80 border-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700 hover:opacity-90 line-through'
      default:
        return 'bg-zinc-100 border-zinc-200 text-zinc-600'
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      return format(new Date(timeStr), 'h:mm a')
    } catch {
      return ''
    }
  }

  return (
    <div
      onClick={onClick}
      className={`border rounded-control p-8 flex flex-col gap-4 text-left transition-all active:scale-[0.98] select-none cursor-pointer w-full shadow-xs
        ${getColors()}
      `}
    >
      <span className="text-[11px] font-bold truncate leading-tight">
        {booking.title || 'Untitled Booking'}
      </span>
      <span className="text-[9px] font-bold opacity-80 uppercase tracking-wider">
        {formatTime(booking.start_time)}
      </span>
    </div>
  )
}

export default EventBlock

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths
} from 'date-fns'

interface MiniCalendarProps {
  selectedDate: Date;
  rangeStart: Date;
  rangeEnd: Date;
  onDateSelect: (date: Date) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  rangeStart,
  rangeEnd,
  onDateSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Monday indexed calendar
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const isWithinViewRange = (day: Date) => {
    const dTime = day.getTime()
    // Compare day values
    return dTime >= rangeStart.getTime() && dTime <= rangeEnd.getTime()
  }

  return (
    <div className="border border-border dark:border-zinc-800 rounded-card p-16 bg-card dark:bg-zinc-900 select-none shadow-xs">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12 select-none">
        <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className="flex items-center gap-8">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-4 hover:bg-bg dark:hover:bg-zinc-800 rounded text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-4 hover:bg-bg dark:hover:bg-zinc-800 rounded text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Days header labels */}
      <div className="grid grid-cols-7 gap-y-4 text-center mb-6">
        {weekdays.map((wd, index) => (
          <span key={index} className="text-[10px] font-bold text-text-secondary dark:text-zinc-500">
            {wd}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-4 text-center select-none">
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentToday = isToday(day)
          const inRange = isWithinViewRange(day)

          return (
            <div
              key={index}
              className={`relative flex items-center justify-center py-2
                ${inRange && !isSelected ? 'bg-primary/8 text-primary' : ''}
                ${inRange && isSameDay(day, rangeStart) ? 'rounded-l-full' : ''}
                ${inRange && isSameDay(day, rangeEnd) ? 'rounded-r-full' : ''}
              `}
            >
              <button
                type="button"
                onClick={() => onDateSelect(day)}
                className={`w-28 h-28 rounded-full text-[11px] font-bold flex items-center justify-center transition-all cursor-pointer outline-none relative z-10
                  ${!isCurrentMonth 
                    ? 'text-text-secondary/30 dark:text-zinc-700' 
                    : isSelected ? 'text-white' : 'text-text-primary dark:text-zinc-300'
                  }
                  ${isCurrentToday ? 'bg-primary text-white shadow-xs' : ''}
                  ${isSelected && !isCurrentToday ? 'border border-primary bg-primary/20 text-primary' : ''}
                  ${!isCurrentToday && !isSelected ? 'hover:bg-bg dark:hover:bg-zinc-800' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            </div>
          )
        })}
      </div>

    </div>
  )
}

export default MiniCalendar

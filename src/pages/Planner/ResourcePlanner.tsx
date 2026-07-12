import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths
} from 'date-fns'

import useBookableResourcesQuery from '../../hooks/useBookableResources'
import useBookingsForRangeQuery, { type Booking } from '../../hooks/useBookingsForRange'
import { getRangeForView } from '../../lib/dateRange'
import CalendarGrid from '../../components/planner/CalendarGrid'
import ViewToggle from '../../components/planner/ViewToggle'
import MiniCalendar from '../../components/planner/MiniCalendar'
import TodaysActivityCard from '../../components/planner/TodaysActivityCard'
import UpcomingTodayList from '../../components/planner/UpcomingTodayList'
import BookResourceModal from '../../components/planner/BookResourceModal'
import BookingPopover from '../../components/planner/BookingPopover'

export const ResourcePlanner: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. Calendar view state (persisted in URL query params, default to week)
  const view = (searchParams.get('view') as 'day' | 'week' | 'month') || 'week'
  const search = searchParams.get('search') || searchParams.get('q') || ''

  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date())

  // Modal triggers
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [preselectedResId, setPreselectedResId] = useState<string | null>(null)
  const [preselectedDateStr, setPreselectedDateStr] = useState<string | null>(null)
  const [preselectedTimeStr, setPreselectedTimeStr] = useState<string | null>(null)

  // Selected Booking details popover trigger
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedBookingResName, setSelectedBookingResName] = useState('')
  const [selectedBookingResTag, setSelectedBookingResTag] = useState('')

  // Event listener to trigger booking modal from sidebar QuickAction button
  useEffect(() => {
    const handleOpenModal = () => {
      setPreselectedResId(null)
      setPreselectedDateStr(null)
      setPreselectedTimeStr(null)
      setIsCreateOpen(true)
    }
    window.addEventListener('open-create-booking-modal', handleOpenModal)
    return () => {
      window.removeEventListener('open-create-booking-modal', handleOpenModal)
    }
  }, [])

  // 2. Calculate start/end date ranges based on view/anchor Date via dateRange helper
  const { start, end, days } = getRangeForView(view, anchorDate)

  // 3. Fetch data matching calculations
  const { data: resources = [], isLoading: loadingResources } = useBookableResourcesQuery()
  const { data: bookings = [], isLoading: loadingBookings } = useBookingsForRangeQuery(
    start.toISOString(),
    end.toISOString()
  )

  // Handle navigation chevrons
  const handlePrev = () => {
    if (view === 'day') setAnchorDate(subDays(anchorDate, 1))
    else if (view === 'month') setAnchorDate(subMonths(anchorDate, 1))
    else setAnchorDate(subWeeks(anchorDate, 1))
  }

  const handleNext = () => {
    if (view === 'day') setAnchorDate(addDays(anchorDate, 1))
    else if (view === 'month') setAnchorDate(addMonths(anchorDate, 1))
    else setAnchorDate(addWeeks(anchorDate, 1))
  }

  const handleJumpToToday = () => {
    setAnchorDate(new Date())
  }

  const handleViewChange = (newView: 'day' | 'week' | 'month') => {
    const params = new URLSearchParams(searchParams)
    params.set('view', newView)
    setSearchParams(params)
  }

  const handleCellClick = (resourceId: string, date: Date) => {
    setPreselectedResId(resourceId)
    setPreselectedDateStr(format(date, 'yyyy-MM-dd'))
    
    // Default prefilled time slots based on current hour
    const currentHour = new Date().getHours()
    const defaultStart = currentHour >= 8 && currentHour < 18 ? `${String(currentHour).padStart(2, '0')}:00` : '09:00'
    setPreselectedTimeStr(defaultStart)

    setIsCreateOpen(true)
  }

  const handleEventClick = (booking: Booking, assetName: string, assetTag: string) => {
    setSelectedBooking(booking)
    setSelectedBookingResName(assetName)
    setSelectedBookingResTag(assetTag)
  }

  const getDateRangeLabel = () => {
    if (view === 'day') {
      return format(anchorDate, 'MMMM d, yyyy')
    }
    if (view === 'month') {
      return format(anchorDate, 'MMMM yyyy')
    }
    // Week View: Oct 23 - 29, 2023
    return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
  }

  // Filter resources based on top search bar parameter
  const filteredResources = resources.filter((r) => {
    if (!search) return true
    return r.name.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-24 min-h-screen pb-48 select-none">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center select-none">
        <h2 className="text-[36px] font-heading font-bold text-primary leading-none">
          Resource Planner
        </h2>
      </div>

      {/* Main Grid & Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-24 items-start select-none">
        
        {/* Left main grid column */}
        <div className="lg:col-span-3 flex flex-col gap-16 select-none">
          
          {/* Controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-12 bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-12 rounded-card shadow-xs">
            {/* View toggle segmented control */}
            <ViewToggle currentView={view} onChange={handleViewChange} />

            {/* Nav range headers */}
            <div className="flex items-center gap-12 select-none">
              <button
                type="button"
                onClick={handlePrev}
                className="p-8 border border-border dark:border-zinc-700 bg-bg/20 dark:bg-zinc-800 rounded-control text-text-secondary hover:text-text-primary cursor-pointer hover:bg-bg/40"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center gap-8">
                <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200 min-w-[120px] text-center select-none">
                  {getDateRangeLabel()}
                </span>
                <button
                  type="button"
                  onClick={handleJumpToToday}
                  className="text-[12px] font-bold text-primary hover:underline cursor-pointer select-none"
                >
                  Today
                </button>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="p-8 border border-border dark:border-zinc-700 bg-bg/20 dark:bg-zinc-800 rounded-control text-text-secondary hover:text-text-primary cursor-pointer hover:bg-bg/40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Calendar Grid component */}
          <CalendarGrid
            days={days}
            resources={filteredResources}
            bookings={bookings}
            loading={loadingResources || loadingBookings}
            onCellClick={handleCellClick}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Right Sidebar columns layout */}
        <div className="flex flex-col gap-20 select-none">
          {/* Mini Calendar Monthly layout */}
          <MiniCalendar
            selectedDate={anchorDate}
            rangeStart={start}
            rangeEnd={end}
            onDateSelect={(day) => {
              setAnchorDate(day)
              handleViewChange('day') // jump to day view directly
            }}
          />

          {/* Today's consolidated activities counts */}
          <TodaysActivityCard />

          {/* Today's upcoming list */}
          <UpcomingTodayList />
        </div>

      </div>

      {/* Bookings creation modal */}
      <BookResourceModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false)
          setPreselectedResId(null)
          setPreselectedDateStr(null)
          setPreselectedTimeStr(null)
        }}
        preselectedResourceId={preselectedResId}
        preselectedDate={preselectedDateStr}
        preselectedStartTime={preselectedTimeStr}
      />

      {/* Booking detailed popovers */}
      <BookingPopover
        booking={selectedBooking}
        assetName={selectedBookingResName}
        assetTag={selectedBookingResTag}
        onClose={() => setSelectedBooking(null)}
      />

    </div>
  )
}

export default ResourcePlanner

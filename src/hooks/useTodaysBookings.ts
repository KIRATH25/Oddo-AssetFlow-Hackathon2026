import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { startOfDay, endOfDay } from 'date-fns'

export interface TodaysActivity {
  todaysBookingsCount: number;
  ongoingBooking: {
    id: string;
    title: string;
    assetName: string;
    assetTag: string;
  } | null;
  upcomingTodayList: Array<{
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    is_all_day: boolean;
    assetName: string;
    assetTag: string;
    categoryName: string;
  }>;
}

/**
 * Hook to retrieve consolidated bookings scheduled for today,
 * determining active counts, current events, and future queues.
 */
export function useTodaysBookingsQuery() {
  return useQuery<TodaysActivity>({
    queryKey: ['todays-bookings-sidebar'],
    queryFn: async () => {
      const now = new Date()
      const todayStart = startOfDay(now).toISOString()
      const todayEnd = endOfDay(now).toISOString()

      // 1. Fetch assets details map for category joins
      const { data: assets } = await supabase.from('assets').select('id, name, asset_tag, category_id')
      const { data: categories } = await supabase.from('categories').select('id, name')
      const catsMap = new Map((categories || []).map(c => [c.id, c.name]))
      const assetsMap = new Map((assets || []).map(a => [a.id, {
        name: a.name,
        tag: a.asset_tag,
        cat: a.category_id ? catsMap.get(a.category_id) || 'Equipment' : 'Equipment'
      }]))

      // 2. Fetch bookings matching today's bounds
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('start_time', todayStart)
        .lte('start_time', todayEnd)

      if (error) throw error

      const activeBookings = (bookings || []).filter(b => b.status !== 'cancelled')

      // Total count
      const todaysBookingsCount = activeBookings.length

      // Ongoing reservation checks
      const nowTime = now.getTime()
      const ongoing = activeBookings.find(b => {
        const start = new Date(b.start_time).getTime()
        const end = new Date(b.end_time).getTime()
        return start <= nowTime && end >= nowTime
      })

      let ongoingBooking = null
      if (ongoing) {
        const assetInfo = assetsMap.get(ongoing.asset_id)
        ongoingBooking = {
          id: ongoing.id,
          title: ongoing.title || 'Untitled Booking',
          assetName: assetInfo?.name || 'Unknown Resource',
          assetTag: assetInfo?.tag || 'AF-xxxx'
        }
      }

      // Upcoming today
      const upcoming = activeBookings
        .filter(b => new Date(b.start_time).getTime() > nowTime && b.status === 'upcoming')
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 5)

      const upcomingTodayList = upcoming.map(b => {
        const assetInfo = assetsMap.get(b.asset_id)
        return {
          id: b.id,
          title: b.title || 'Untitled Booking',
          start_time: b.start_time,
          end_time: b.end_time,
          is_all_day: !!b.is_all_day,
          assetName: assetInfo?.name || 'Unknown Resource',
          assetTag: assetInfo?.tag || 'AF-xxxx',
          categoryName: assetInfo?.cat || 'Equipment'
        }
      })

      return {
        todaysBookingsCount,
        ongoingBooking,
        upcomingTodayList
      }
    },
    refetchInterval: 20000 // Refresh frequently to update happening-now items
  })
}
export default useTodaysBookingsQuery

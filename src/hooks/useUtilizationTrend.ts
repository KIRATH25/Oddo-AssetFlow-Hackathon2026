import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function useUtilizationTrend() {
  return useQuery({
    queryKey: ['metrics', 'utilization-trend'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('bookings')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo)

      if (error) throw error
      if (!data) return []

      // Generate a contiguous map of the last 30 days (pre-seeded with 0 bookings)
      const dailyMap: Record<string, { date: string; bookings: number; rawDate: string }> = {}
      for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const key = d.toISOString().split('T')[0]
        dailyMap[key] = { date: dateLabel, bookings: 0, rawDate: key }
      }

      // Group records into matching day buckets
      data.forEach((booking) => {
        if (booking.created_at) {
          const key = booking.created_at.split('T')[0]
          if (dailyMap[key]) {
            dailyMap[key].bookings += 1
          }
        }
      })

      return Object.values(dailyMap)
    }
  })
}

export default useUtilizationTrend

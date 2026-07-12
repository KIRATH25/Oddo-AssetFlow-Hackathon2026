import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export interface Booking {
  id: string;
  asset_id: string;
  user_id: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  title: string | null;
  is_all_day: boolean;
  created_at: string;
  userName?: string;
}

/**
 * Hook to retrieve bookings within a specific start and end ISO time boundary
 */
export function useBookingsForRangeQuery(startISO: string, endISO: string) {
  return useQuery<Booking[]>({
    queryKey: ['bookings-range', startISO, endISO],
    queryFn: async () => {
      // 1. Fetch user names map
      const profilesRes = await supabase.from('profiles').select('id, full_name')
      const profilesMap = new Map((profilesRes.data || []).map(p => [p.id, p.full_name]))

      // 2. Fetch overlapping bookings
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('end_time', startISO)
        .lte('start_time', endISO)

      if (error) throw error

      return (data || []).map((b: any) => ({
        ...b,
        is_all_day: !!b.is_all_day,
        userName: profilesMap.get(b.user_id) || 'Unknown Requester'
      })) as Booking[]
    }
  })
}
export default useBookingsForRangeQuery

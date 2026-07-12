import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { format } from 'date-fns'

export interface ConflictRecord {
  id: string;
  asset_name: string;
  asset_tag: string;
  date_label: string;
  time_label: string;
  booking1: any;
  booking2: any;
}

/**
 * Hook to retrieve all scheduling conflicts where an active bookable asset has overlapping bookings.
 */
export function useSchedulingConflictsQuery() {
  return useQuery<ConflictRecord[]>({
    queryKey: ['scheduling-conflicts'],
    queryFn: async () => {
      // 1. Fetch asset names map
      const { data: assets } = await supabase
        .from('assets')
        .select('id, name, asset_tag')
        .eq('is_bookable', true)
      
      const assetsMap = new Map((assets || []).map(a => [a.id, a]))

      // 2. Fetch all upcoming/ongoing bookings
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .in('status', ['upcoming', 'ongoing'])

      if (error) throw error
      if (!bookings) return []

      const conflicts: ConflictRecord[] = []

      // 3. Client-side self-join overlap detection (safe against PostgREST limits)
      for (let i = 0; i < bookings.length; i++) {
        const b1 = bookings[i]
        const s1 = new Date(b1.start_time).getTime()
        const e1 = new Date(b1.end_time).getTime()

        for (let j = i + 1; j < bookings.length; j++) {
          const b2 = bookings[j]
          
          // Same resource asset, different bookings
          if (b1.asset_id !== b2.asset_id) continue

          const s2 = new Date(b2.start_time).getTime()
          const e2 = new Date(b2.end_time).getTime()

          // Overlap condition: start1 < end2 && end1 > start2
          if (s1 < e2 && e1 > s2) {
            const assetInfo = assetsMap.get(b1.asset_id)
            const name = assetInfo?.name || 'Unknown Resource'
            const tag = assetInfo?.asset_tag || 'AF-xxxx'

            // Format date-fns clashing time labels
            const dateStr = format(new Date(b1.start_time), 'eee MMM d')
            const t1 = format(new Date(b1.start_time), 'h:mm a')
            const t2 = format(new Date(b2.start_time), 'h:mm a')

            conflicts.push({
              id: `${b1.id}-${b2.id}`,
              asset_name: name,
              asset_tag: tag,
              date_label: dateStr,
              time_label: `${t1} & ${t2}`,
              booking1: b1,
              booking2: b2
            })
          }
        }
      }

      return conflicts
    }
  })
}
export default useSchedulingConflictsQuery

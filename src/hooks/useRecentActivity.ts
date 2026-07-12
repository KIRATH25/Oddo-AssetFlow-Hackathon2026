import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { ActivityLog } from '../lib/types'

export function useRecentActivity() {
  return useQuery<ActivityLog[]>({
    queryKey: ['metrics', 'recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) throw error
      return (data || []) as ActivityLog[]
    }
  })
}

export default useRecentActivity

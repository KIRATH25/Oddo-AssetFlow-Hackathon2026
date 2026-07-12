import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { MaintenanceRequest } from '../lib/types'

export function useMaintenanceSchedule() {
  return useQuery<MaintenanceRequest[]>({
    queryKey: ['metrics', 'maintenance-schedule'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*, assets (name)')
        .neq('status', 'resolved')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return (data || []) as MaintenanceRequest[]
    }
  })
}

export default useMaintenanceSchedule

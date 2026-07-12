import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export interface AllocationHistoryEntry {
  id: string;
  user_id: string;
  full_name: string;
  allocated_at: string;
  returned_at: string | null;
  expected_return_date: string | null;
  status: 'active' | 'returned' | 'overdue';
  condition_on_return: string | null;
}

export interface MaintenanceHistoryEntry {
  id: string;
  issue_description: string;
  status: 'requested' | 'in_progress' | 'resolved' | 'cancelled';
  created_at: string;
  resolved_at: string | null;
}

export interface AssetHistory {
  allocations: AllocationHistoryEntry[];
  maintenance: MaintenanceHistoryEntry[];
}

/**
 * Hook to retrieve the history lists for a specific asset
 */
export function useAssetHistoryQuery(assetId?: string | null) {
  return useQuery<AssetHistory>({
    queryKey: ['asset-history', assetId],
    queryFn: async () => {
      if (!assetId) return { allocations: [], maintenance: [] }

      // 1. Fetch allocation history
      const { data: allocs, error: allocErr } = await supabase
        .from('allocations')
        .select('*')
        .eq('asset_id', assetId)
        .order('allocated_at', { ascending: false })

      let allocations: AllocationHistoryEntry[] = []
      if (!allocErr && allocs && allocs.length > 0) {
        const uids = Array.from(new Set(allocs.map(a => a.user_id)))
        
        // Fetch matching profile names
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', uids)

        const nameMap = new Map((profiles || []).map(p => [p.id, p.full_name]))
        allocations = allocs.map(a => ({
          id: a.id,
          user_id: a.user_id,
          full_name: nameMap.get(a.user_id) || 'Unknown Holder',
          allocated_at: a.allocated_at,
          returned_at: a.returned_at,
          expected_return_date: a.expected_return_date,
          status: a.status,
          condition_on_return: a.condition_on_return
        }))
      }

      // 2. Fetch maintenance history
      const { data: maints, error: maintErr } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('asset_id', assetId)
        .order('created_at', { ascending: false })

      let maintenance: MaintenanceHistoryEntry[] = []
      if (!maintErr && maints) {
        maintenance = maints.map(m => ({
          id: m.id,
          issue_description: m.issue_description,
          status: m.status,
          created_at: m.created_at,
          resolved_at: m.resolved_at
        }))
      }

      return { allocations, maintenance }
    },
    enabled: !!assetId
  })
}

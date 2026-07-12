import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Asset } from './useAssets'

export interface CurrentAllocation {
  id: string;
  user_id: string;
  allocated_at: string;
  expected_return_date: string;
  full_name: string;
  departmentName?: string | null;
}

export interface AssetDetail {
  asset: Asset;
  currentAllocation: CurrentAllocation | null;
}

/**
 * Hook to retrieve a single asset details with active allocation joins
 */
export function useAssetDetailQuery(assetId?: string | null) {
  return useQuery<AssetDetail | null>({
    queryKey: ['asset-detail', assetId],
    queryFn: async () => {
      if (!assetId) return null

      // 1. Fetch asset record
      const { data: asset, error: assetErr } = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .single()
      
      if (assetErr) throw assetErr
      if (!asset) return null

      // Resolve category and department names client side
      const [catsRes, deptsRes] = await Promise.all([
        supabase.from('categories').select('id, name'),
        supabase.from('departments').select('id, name')
      ])
      const catsMap = new Map((catsRes.data || []).map(c => [c.id, c.name]))
      const deptsMap = new Map((deptsRes.data || []).map(d => [d.id, d.name]))

      const mappedAsset: Asset = {
        ...asset,
        categoryName: asset.category_id ? catsMap.get(asset.category_id) || 'Unknown Category' : null,
        departmentName: asset.department_id ? deptsMap.get(asset.department_id) || 'Unknown Department' : null
      }

      // 2. Fetch current active allocation details if status is Allocated
      let currentAllocation: CurrentAllocation | null = null
      if (mappedAsset.status === 'Allocated') {
        const { data: allocs, error: allocErr } = await supabase
          .from('allocations')
          .select('id, user_id, allocated_at, expected_return_date')
          .eq('asset_id', assetId)
          .eq('status', 'active')
          .limit(1)

        if (!allocErr && allocs && allocs.length > 0) {
          const alloc = allocs[0]
          
          // Query holder profiles details
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, department_id')
            .eq('id', alloc.user_id)
            .single()

          if (profile) {
            currentAllocation = {
              id: alloc.id,
              user_id: alloc.user_id,
              allocated_at: alloc.allocated_at,
              expected_return_date: alloc.expected_return_date,
              full_name: profile.full_name,
              departmentName: profile.department_id ? deptsMap.get(profile.department_id) : null
            }
          }
        }
      }

      return {
        asset: mappedAsset,
        currentAllocation
      }
    },
    enabled: !!assetId
  })
}

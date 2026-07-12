import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { Asset } from './useAssets'

/**
 * Hook to retrieve all assets marked as bookable resources,
 * excluding retired and disposed assets, sorted by category and name.
 */
export function useBookableResourcesQuery() {
  return useQuery<Asset[]>({
    queryKey: ['bookable-resources'],
    queryFn: async () => {
      // 1. Fetch categories
      const catsRes = await supabase.from('categories').select('id, name')
      const catsMap = new Map((catsRes.data || []).map(c => [c.id, c.name]))

      // 2. Fetch assets filtering by bookable and active statuses
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('is_bookable', true)
        .not('status', 'in', '("Retired","Disposed")')

      if (error) throw error

      const mapped: Asset[] = (data || []).map((a: any) => ({
        ...a,
        categoryName: a.category_id ? catsMap.get(a.category_id) || 'Unknown Category' : null
      }))

      // Sort by category name, then asset name
      mapped.sort((a, b) => {
        const catA = a.categoryName || ''
        const catB = b.categoryName || ''
        const catComp = catA.localeCompare(catB)
        if (catComp !== 0) return catComp
        return a.name.localeCompare(b.name)
      })

      return mapped
    }
  })
}
export default useBookableResourcesQuery

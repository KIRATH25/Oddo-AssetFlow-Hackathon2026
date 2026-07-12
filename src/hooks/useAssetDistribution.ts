import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function useAssetDistribution() {
  return useQuery({
    queryKey: ['metrics', 'asset-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('category_id, categories (name)')

      if (error) throw error
      if (!data || data.length === 0) return []

      const distribution = data.reduce((acc: Record<string, { name: string; value: number }>, item) => {
        // Handle categories join type resolution safely
        const categoriesData = item.categories as any
        const categoryName = categoriesData?.name || 'Uncategorized'
        if (!acc[categoryName]) {
          acc[categoryName] = { name: categoryName, value: 0 }
        }
        acc[categoryName].value += 1
        return acc
      }, {})

      return Object.values(distribution)
    }
  })
}
export default useAssetDistribution

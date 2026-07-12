import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  category_id: string | null;
  status: 'Available' | 'Allocated' | 'Reserved' | 'Under Maintenance' | 'Lost' | 'Retired' | 'Disposed';
  serial_number: string | null;
  location: string | null;
  purchase_date: string | null;
  cost: number | null;
  description: string | null;
  photo_url: string | null;
  is_bookable: boolean;
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  department_id: string | null;
  custom_fields?: any[] | null;
  created_at: string;
  categoryName?: string | null;
  departmentName?: string | null;
}

/**
 * React Query hook to list assets with filters and sorting parameters
 */
export function useAssetsQuery(
  search?: string,
  categoryId?: string | null,
  statuses?: string[], // Multi-select array of statuses
  deptId?: string | null,
  locationFilter?: string,
  sortBy?: string
) {
  return useQuery<Asset[]>({
    queryKey: ['assets', search, categoryId, statuses, deptId, locationFilter, sortBy],
    queryFn: async () => {
      // 1. Fetch categories and departments for fast local maps
      const [catsRes, deptsRes] = await Promise.all([
        supabase.from('categories').select('id, name'),
        supabase.from('departments').select('id, name')
      ])

      const catsMap = new Map((catsRes.data || []).map(c => [c.id, c.name]))
      const deptsMap = new Map((deptsRes.data || []).map(d => [d.id, d.name]))

      // 2. Build assets query
      let query = supabase.from('assets').select('*')

      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId)
      }
      if (deptId && deptId !== 'all') {
        query = query.eq('department_id', deptId)
      }
      if (locationFilter && locationFilter.trim()) {
        query = query.ilike('location', `%${locationFilter.trim()}%`)
      }
      if (statuses && statuses.length > 0) {
        query = query.in('status', statuses)
      }

      const { data: assets, error } = await query
      if (error) throw error

      let mapped: Asset[] = (assets || []).map((a: any) => ({
        ...a,
        categoryName: a.category_id ? catsMap.get(a.category_id) || 'Unknown Category' : null,
        departmentName: a.department_id ? deptsMap.get(a.department_id) || 'Unknown Department' : null
      }))

      // Apply search over Name, Tag, and Serial Number
      if (search && search.trim()) {
        const searchLow = search.trim().toLowerCase()
        mapped = mapped.filter(
          a =>
            (a.name && a.name.toLowerCase().includes(searchLow)) ||
            (a.asset_tag && a.asset_tag.toLowerCase().includes(searchLow)) ||
            (a.serial_number && a.serial_number.toLowerCase().includes(searchLow))
        )
      }

      // Apply sorting
      if (sortBy) {
        if (sortBy === 'name_asc') {
          mapped.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortBy === 'name_desc') {
          mapped.sort((a, b) => b.name.localeCompare(a.name))
        } else if (sortBy === 'tag_asc') {
          mapped.sort((a, b) => a.asset_tag.localeCompare(b.asset_tag))
        } else if (sortBy === 'tag_desc') {
          mapped.sort((a, b) => b.asset_tag.localeCompare(a.asset_tag))
        } else if (sortBy === 'newest') {
          mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }
      }

      return mapped
    }
  })
}

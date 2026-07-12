import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export interface CustomField {
  label: string;
  type: 'text' | 'number' | 'date';
}

export interface Category {
  id: string;
  name: string;
  type: 'Asset Category' | 'CSR Activity' | 'Challenge';
  status: 'active' | 'inactive';
  custom_fields: CustomField[];
  created_at: string;
}

/**
 * Fetch categories with local search, filters and sort parameters
 */
export function useCategoriesQuery(search?: string, typeFilter?: string, sortBy?: string) {
  return useQuery<Category[]>({
    queryKey: ['categories', search, typeFilter, sortBy],
    queryFn: async () => {
      let query = supabase.from('categories').select('*')

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter)
      }
      if (search) {
        query = query.ilike('name', `%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      const mapped = (data || []).map((cat: any) => {
        let fields: CustomField[] = []
        if (cat.custom_fields) {
          // Parse JSONB if returned as a string, else use as object
          fields = typeof cat.custom_fields === 'string' 
            ? JSON.parse(cat.custom_fields) 
            : cat.custom_fields
        }
        return {
          ...cat,
          custom_fields: fields
        } as Category
      })

      // Apply sorting logic
      if (sortBy) {
        if (sortBy === 'name_asc') {
          mapped.sort((a, b) => a.name.localeCompare(b.name))
        } else if (sortBy === 'name_desc') {
          mapped.sort((a, b) => b.name.localeCompare(a.name))
        } else if (sortBy === 'newest') {
          mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }
      }

      return mapped
    }
  })
}

/**
 * mutation to insert new category
 * -- relies on RLS: only admin can insert into categories
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (category: { name: string; type: string; custom_fields: CustomField[]; status?: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

/**
 * mutation to edit existing category
 * -- relies on RLS: only admin can update categories
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; type?: string; custom_fields?: CustomField[]; status?: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    }
  })
}

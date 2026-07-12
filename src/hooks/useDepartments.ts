import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export interface Department {
  id: string;
  name: string;
  head_user_id: string | null;
  parent_department_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  headName?: string | null;
  parentName?: string | null;
  employeeCount?: number;
}

/**
 * Fetch departments with client-side resolves for maximum resilience
 */
export function useDepartmentsQuery(search?: string, statusFilter?: string, sortBy?: string) {
  return useQuery<Department[]>({
    queryKey: ['departments', search, statusFilter, sortBy],
    queryFn: async () => {
      // 1. Fetch departments
      let deptQuery = supabase.from('departments').select('*')
      
      if (statusFilter && statusFilter !== 'all') {
        deptQuery = deptQuery.eq('status', statusFilter.toLowerCase())
      }
      if (search) {
        deptQuery = deptQuery.ilike('name', `%${search}%`)
      }

      const { data: depts, error: deptErr } = await deptQuery
      if (deptErr) throw deptErr

      if (!depts || depts.length === 0) return []

      // 2. Fetch profiles to resolve Head Names and count employees
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, department_id')

      if (profErr) throw profErr

      const profilesMap = new Map((profiles || []).map(p => [p.id, p.full_name]))
      const deptEmployeesMap = new Map<string, number>()

      if (profiles) {
        profiles.forEach(p => {
          if (p.department_id) {
            deptEmployeesMap.set(p.department_id, (deptEmployeesMap.get(p.department_id) || 0) + 1)
          }
        })
      }

      // Map departments details
      const mapped = depts.map((d: any) => {
        const parent = depts.find(p => p.id === d.parent_department_id)
        return {
          ...d,
          headName: d.head_user_id ? profilesMap.get(d.head_user_id) || 'Unknown Head' : null,
          parentName: parent ? parent.name : null,
          employeeCount: deptEmployeesMap.get(d.id) || 0
        } as Department
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
 * mutation to insert new department records
 * -- relies on RLS: only admin can insert into departments
 */
export function useCreateDepartmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dept: { name: string; head_user_id?: string | null; parent_department_id?: string | null; status?: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('departments')
        .insert([dept])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    }
  })
}

/**
 * mutation to edit existing department
 * -- relies on RLS: only admin can update departments
 */
export function useUpdateDepartmentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; head_user_id?: string | null; parent_department_id?: string | null; status?: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    }
  })
}

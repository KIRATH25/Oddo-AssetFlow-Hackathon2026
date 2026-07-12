import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

interface PromoteParams {
  employeeId: string;
  targetRole: 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee';
  departmentId?: string | null; // Required for Department Head
}

/**
 * Hook to update employee roles and sync department head relations
 * -- relies on RLS: only admin can modify user roles or assign department heads
 */
export function usePromoteRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ employeeId, targetRole, departmentId }: PromoteParams) => {
      // 1. If demoting from Department Head, we must clear head_user_id references on departments
      if (targetRole === 'Employee') {
        const { error: clearHeadErr } = await supabase
          .from('departments')
          .update({ head_user_id: null })
          .eq('head_user_id', employeeId)
        if (clearHeadErr) throw clearHeadErr
      }

      // 2. Perform Profile Update
      const profileUpdates: any = { role: targetRole }
      if (targetRole === 'Department Head' && departmentId) {
        profileUpdates.department_id = departmentId
      }
      
      const { error: profErr } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', employeeId)
      
      if (profErr) throw profErr

      // 3. If promoting to Department Head, update the head_user_id on that department
      if (targetRole === 'Department Head' && departmentId) {
        // Clear any old head references for this department if applicable
        const { error: deptErr } = await supabase
          .from('departments')
          .update({ head_user_id: employeeId })
          .eq('id', departmentId)
        
        if (deptErr) throw deptErr
      }

      return { success: true }
    },
    onSuccess: () => {
      // Invalidate queries to reload all views
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    }
  })
}

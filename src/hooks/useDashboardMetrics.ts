import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

/**
 * 1. Count of Available Assets
 */
export function useAvailableCount() {
  return useQuery({
    queryKey: ['metrics', 'available'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Available')
      if (error) throw error
      return count || 0
    }
  })
}

/**
 * 2. Count of Allocated Assets
 */
export function useAllocatedCount() {
  return useQuery({
    queryKey: ['metrics', 'allocated'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Allocated')
      if (error) throw error
      return count || 0
    }
  })
}

/**
 * 3. Count of Maintenance Requests (Total active and Pending-only)
 */
export function useMaintenanceCount() {
  return useQuery({
    queryKey: ['metrics', 'maintenance'],
    queryFn: async () => {
      const { count: total, error: err1 } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'approved', 'assigned', 'inProgress'])

      const { count: pending, error: err2 } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      if (err1) throw err1
      if (err2) throw err2

      return { total: total || 0, pending: pending || 0 }
    }
  })
}

/**
 * 4. Count of Upcoming Returns (active allocations returning within 7 days)
 */
export function useReturnsCount() {
  return useQuery({
    queryKey: ['metrics', 'returns'],
    queryFn: async () => {
      const now = new Date().toISOString()
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count, error } = await supabase
        .from('allocations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('expected_return_date', now)
        .lte('expected_return_date', nextWeek)
      if (error) throw error
      return count || 0
    }
  })
}

/**
 * 5. Count of Transfer Requests (requested transfers)
 */
export function useTransfersCount() {
  return useQuery({
    queryKey: ['metrics', 'transfers'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('transfer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'requested')
      if (error) throw error
      return count || 0
    }
  })
}

/**
 * 6. Count of Active/Upcoming Bookings
 */
export function useBookingsCount() {
  return useQuery({
    queryKey: ['metrics', 'bookings'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['upcoming', 'ongoing'])
      if (error) throw error
      return count || 0
    }
  })
}

/**
 * 7. Count of Overdue Allocations (expected return date in past)
 */
export function useOverdueCount() {
  return useQuery({
    queryKey: ['metrics', 'overdue'],
    queryFn: async () => {
      const now = new Date().toISOString()
      const { count, error } = await supabase
        .from('allocations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .lt('expected_return_date', now)
      if (error) throw error
      return count || 0
    }
  })
}

/**
 * 8. Count of Open Audit Cycles
 */
export function useAuditCount() {
  return useQuery({
    queryKey: ['metrics', 'audit'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('audit_cycles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open')
      if (error) throw error
      return count || 0
    }
  })
}

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { checkBookingOverlap } from '../lib/overlapCheck'

export interface CreateBookingPayload {
  asset_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  title: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  is_all_day?: boolean;
}

/**
 * Mutation hook to register booking requests, running overlap checks before insertion.
 */
export function useCreateBookingMutation() {
  const queryClient = useQueryClient()

  return useMutation<any, Error, CreateBookingPayload>({
    mutationFn: async (payload) => {
      // 1. Immediate pre-save overlap checks
      const { data: existing, error: qErr } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('asset_id', payload.asset_id)
        .in('status', ['upcoming', 'ongoing'])

      if (qErr) throw qErr

      const intervals = (existing || []).map((b: any) => ({
        start: b.start_time,
        end: b.end_time
      }))

      const hasOverlap = checkBookingOverlap(payload.start_time, payload.end_time, intervals)
      if (hasOverlap) {
        throw new Error('Requested time conflicts with an existing booking')
      }

      // 2. Perform insert
      const { data, error } = await supabase
        .from('bookings')
        .insert([payload])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings-range'] })
      queryClient.invalidateQueries({ queryKey: ['scheduling-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpi'] })
    }
  })
}

/**
 * Mutation hook to cancel bookings by updating status to 'cancelled'
 */
export function useCancelBookingMutation() {
  const queryClient = useQueryClient()

  return useMutation<any, Error, string>({
    mutationFn: async (bookingId) => {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings-range'] })
      queryClient.invalidateQueries({ queryKey: ['scheduling-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpi'] })
    }
  })
}

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, AlertTriangle } from 'lucide-react'
import { useBookableResourcesQuery } from '../../hooks/useBookableResources'
import { useCreateBookingMutation } from '../../hooks/useCreateBooking'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../shared/ToastContext'
import { format } from 'date-fns'

const bookingSchema = z.object({
  asset_id: z.string().min(1, 'Resource selection is required'),
  title: z.string().min(2, 'Purpose/Title must be at least 2 characters'),
  date: z.string().min(1, 'Date selection is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_all_day: z.boolean(),
  user_id: z.string().min(1, 'Booked by is required')
})

type BookingFormValues = z.infer<typeof bookingSchema>

interface BookResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedResourceId?: string | null;
  preselectedDate?: string | null;
  preselectedStartTime?: string | null;
}

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
]

export const BookResourceModal: React.FC<BookResourceModalProps> = ({
  isOpen,
  onClose,
  preselectedResourceId = null,
  preselectedDate = null,
  preselectedStartTime = null
}) => {
  const { toast } = useToast()
  const { data: resources = [] } = useBookableResourcesQuery()
  const createMutation = useCreateBookingMutation()

  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
  const [isAdminOrManager, setIsAdminOrManager] = useState(false)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  
  // Inline validation conflict error banner state
  const [conflictError, setConflictError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      asset_id: '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00',
      is_all_day: false,
      user_id: ''
    }
  })

  const isAllDay = watch('is_all_day')

  useEffect(() => {
    if (isOpen) {
      setConflictError(null)
      // 1. Fetch current profile
      const demoProfileStr = localStorage.getItem('assetflow_demo_profile')
      if (demoProfileStr) {
        const demoProfile = JSON.parse(demoProfileStr)
        setCurrentUserProfile(demoProfile)
        setValue('user_id', demoProfile.id)
        
        const isManager = ['admin', 'assetmanager', 'departmenthead', 'Admin', 'Asset Manager', 'Department Head'].includes(demoProfile.role)
        setIsAdminOrManager(isManager)
      } else {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            setValue('user_id', session.user.id)
            supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setCurrentUserProfile(data)
                  const isManager = ['admin', 'assetmanager', 'departmenthead', 'Admin', 'Asset Manager', 'Department Head'].includes(data.role)
                  setIsAdminOrManager(isManager)
                }
              })
          }
        })
      }

      // 2. Fetch list of users for delegation dropdown
      supabase
        .from('profiles')
        .select('id, full_name')
        .eq('status', 'Active')
        .then(({ data }) => {
          if (data) setUsers(data)
        })

      // 3. Pre-fill selections
      reset({
        asset_id: preselectedResourceId || '',
        title: '',
        date: preselectedDate || new Date().toISOString().split('T')[0],
        start_time: preselectedStartTime || '09:00',
        end_time: preselectedStartTime 
          ? TIME_SLOTS[TIME_SLOTS.indexOf(preselectedStartTime) + 2] || '10:00'
          : '10:00',
        is_all_day: false,
        user_id: currentUserProfile?.id || ''
      })
    }
  }, [isOpen, preselectedResourceId, preselectedDate, preselectedStartTime, reset])

  const onSubmit = async (values: BookingFormValues) => {
    setConflictError(null)

    // Construct full ISO timestamps
    let startISO = ''
    let endISO = ''

    if (values.is_all_day) {
      startISO = new Date(`${values.date}T00:00:00`).toISOString()
      endISO = new Date(`${values.date}T23:59:59`).toISOString()
    } else {
      if (!values.start_time || !values.end_time) {
        toast('error', 'Please select start and end times.')
        return
      }
      startISO = new Date(`${values.date}T${values.start_time}:00`).toISOString()
      endISO = new Date(`${values.date}T${values.end_time}:00`).toISOString()
    }

    const startMs = new Date(startISO).getTime()
    const endMs = new Date(endISO).getTime()

    if (startMs >= endMs) {
      toast('error', 'End time must be after start time.')
      return
    }

    try {
      // 1. Run local client-side query overlap checks to match strict requirements
      // select * from bookings where asset_id = {selected} and status in ('upcoming','ongoing') and start_time < {newEnd} and end_time > {newStart}
      const { data: existing, error: queryErr } = await supabase
        .from('bookings')
        .select('title, start_time, end_time')
        .eq('asset_id', values.asset_id)
        .in('status', ['upcoming', 'ongoing'])

      if (queryErr) throw queryErr

      const clash = (existing || []).find((b: any) => {
        const eStart = new Date(b.start_time).getTime()
        const eEnd = new Date(b.end_time).getTime()
        // Overlap rule: newStart < existingEnd && newEnd > existingStart
        return startMs < eEnd && endMs > eStart
      })

      if (clash) {
        const t1 = format(new Date(clash.start_time), 'h:mm a')
        const t2 = format(new Date(clash.end_time), 'h:mm a')
        setConflictError(`This slot conflicts with an existing booking: '${clash.title || 'Untitled'}' from ${t1} to ${t2}.`)
        return
      }

      // 2. Perform insert (the server has exclusion constraints configured as defense-in-depth:
      // ALTER TABLE bookings ADD CONSTRAINT bookings_overlap_exclusion 
      // EXCLUDE USING gist (asset_id with =, tsrange(start_time, end_time) with &&) WHERE (status IN ('upcoming','ongoing'));
      await createMutation.mutateAsync({
        asset_id: values.asset_id,
        user_id: values.user_id,
        start_time: startISO,
        end_time: endISO,
        title: values.title,
        status: 'upcoming',
        is_all_day: values.is_all_day
      })

      toast('success', 'Resource booked successfully.')
      onClose()
    } catch (err: any) {
      toast('error', err.message || 'Time slot overlaps with an existing booking.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-50">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-16 md:p-24 overflow-y-auto">
            <DialogPanel className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card w-full max-w-[460px] shadow-xl overflow-hidden">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="p-24 md:p-32"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-16 border-b border-border/60 dark:border-zinc-800/60 select-none">
                  <DialogTitle className="text-[18px] font-bold text-text-primary dark:text-zinc-100 flex items-center gap-8">
                    <Calendar size={18} className="text-primary" />
                    Book Resource
                  </DialogTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-8 hover:bg-bg dark:hover:bg-zinc-800 rounded-full text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <Description className="sr-only">
                  Form panel to create new resource reservation.
                </Description>

                {/* Inline Error Banner */}
                {conflictError && (
                  <div className="mt-16 p-12 bg-danger/10 border border-danger/20 rounded-control flex items-start gap-8 select-none animate-fadeIn">
                    <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-[2px]" />
                    <span className="text-[12px] font-bold text-danger leading-relaxed">
                      {conflictError}
                    </span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-16 mt-16">
                  
                  {/* Select Resource */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Select Resource</label>
                    <select
                      {...register('asset_id')}
                      className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                    >
                      <option value="">-- Choose Bookable Resource --</option>
                      {resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.categoryName || 'Equipment'})
                        </option>
                      ))}
                    </select>
                    {errors.asset_id && (
                      <span className="text-[11px] text-danger font-medium mt-2">{errors.asset_id.message}</span>
                    )}
                  </div>

                  {/* Booking Title / Purpose */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Purpose / Title</label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g. Weekly Design Standup"
                      className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                    />
                    {errors.title && (
                      <span className="text-[11px] text-danger font-medium mt-2">{errors.title.message}</span>
                    )}
                  </div>

                  {/* Date selection */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Date</label>
                    <input
                      type="date"
                      {...register('date')}
                      className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control text-text-primary dark:text-zinc-100"
                    />
                    {errors.date && (
                      <span className="text-[11px] text-danger font-medium mt-2">{errors.date.message}</span>
                    )}
                  </div>

                  {/* All Day Toggle */}
                  <div className="flex justify-between items-center py-4 select-none">
                    <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">All-Day Booking</span>
                    <input
                      type="checkbox"
                      {...register('is_all_day')}
                      className="w-18 h-18 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </div>

                  {/* Start / End Time Row */}
                  {!isAllDay && (
                    <div className="grid grid-cols-2 gap-16 animate-fadeIn">
                      <div className="flex flex-col gap-6">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Start Time</label>
                        <select
                          {...register('start_time')}
                          className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-6">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">End Time</label>
                        <select
                          {...register('end_time')}
                          className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Booked on behalf of */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Booked By</label>
                    <select
                      disabled={!isAdminOrManager}
                      {...register('user_id')}
                      className={`h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100
                        ${!isAdminOrManager ? 'opacity-70 cursor-not-allowed bg-bg/50 dark:bg-zinc-950/20' : ''}
                      `}
                    >
                      {!isAdminOrManager && currentUserProfile ? (
                        <option value={currentUserProfile.id}>{currentUserProfile.full_name}</option>
                      ) : (
                        <>
                          <option value="">-- Choose Booker --</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.full_name}</option>
                          ))}
                        </>
                      )}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer flex items-center justify-center gap-8 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending && (
                      <svg className="animate-spin h-16 w-16 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    Confirm Booking
                  </button>
                </form>
              </motion.div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default BookResourceModal

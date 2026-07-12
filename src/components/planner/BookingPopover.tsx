import React, { useEffect, useState } from 'react'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, User, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Booking } from '../../hooks/useBookingsForRange'
import { useCancelBookingMutation } from '../../hooks/useCreateBooking'
import { useToast } from '../shared/ToastContext'

interface BookingPopoverProps {
  booking: Booking | null;
  assetName: string;
  assetTag: string;
  onClose: () => void;
}

export const BookingPopover: React.FC<BookingPopoverProps> = ({
  booking,
  assetName,
  assetTag,
  onClose
}) => {
  const { toast } = useToast()
  const cancelMutation = useCancelBookingMutation()
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (booking) {
      setShowConfirm(false)
      const demoProfileStr = localStorage.getItem('assetflow_demo_profile')
      if (demoProfileStr) {
        setCurrentUserProfile(JSON.parse(demoProfileStr))
      }
    }
  }, [booking])

  if (!booking) return null

  const isOwner = currentUserProfile && currentUserProfile.id === booking.user_id
  const isManager = currentUserProfile && ['admin', 'assetmanager', 'departmenthead', 'Admin', 'Asset Manager', 'Department Head'].includes(currentUserProfile.role)
  const canCancel = (isOwner || isManager) && (booking.status === 'upcoming' || booking.status === 'ongoing')

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(booking.id)
      toast('success', 'Booking successfully cancelled.')
      onClose()
    } catch (err: any) {
      toast('error', err.message || 'Failed to cancel booking.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-primary/10 text-primary border-primary/20'
      case 'ongoing': return 'bg-success/10 text-success border-success/20'
      case 'completed': return 'bg-secondary/10 text-text-secondary border-secondary/20 dark:bg-zinc-800'
      case 'cancelled': return 'bg-zinc-100 text-zinc-500 border-zinc-200 line-through dark:bg-zinc-800 dark:border-zinc-700'
      default: return 'bg-zinc-100 text-zinc-500 border-zinc-200'
    }
  }

  return (
    <AnimatePresence>
      <Dialog static open={!!booking} onClose={onClose} className="relative z-50 select-none">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" aria-hidden="true" />

        {/* Popover Card */}
        <div className="fixed inset-0 flex items-center justify-center p-16 overflow-y-auto">
          <DialogPanel className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card w-full max-w-[360px] shadow-xl overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="p-20 md:p-24 flex flex-col gap-16"
            >
              {/* Header */}
              <div className="flex justify-between items-start select-none">
                <div className="flex flex-col gap-4">
                  <span className={`px-8 py-2 rounded-full border text-[9px] font-bold uppercase tracking-wider self-start ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <DialogTitle className="text-[16px] font-bold text-text-primary dark:text-zinc-100 mt-4 leading-snug line-clamp-2 pr-12">
                    {booking.title || 'Untitled Booking'}
                  </DialogTitle>
                </div>
                <button
                  onClick={onClose}
                  className="p-4 hover:bg-bg dark:hover:bg-zinc-800 rounded-full text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <Description className="sr-only">
                Popover panel containing details of the selected resource reservation.
              </Description>

              {/* Details List */}
              <div className="flex flex-col gap-12 text-[12px] border-t border-border/40 dark:border-zinc-800/40 pt-16 mt-4 select-none">
                {/* Resource Info */}
                <div className="flex items-start gap-12">
                  <Calendar size={14} className="text-text-secondary flex-shrink-0 mt-[2px]" />
                  <div className="flex flex-col gap-2">
                    <span className="text-text-secondary dark:text-zinc-400 font-medium">Resource</span>
                    <span className="font-bold text-text-primary dark:text-zinc-200">{assetName} ({assetTag})</span>
                  </div>
                </div>

                {/* Time range */}
                <div className="flex items-start gap-12">
                  <Clock size={14} className="text-text-secondary flex-shrink-0 mt-[2px]" />
                  <div className="flex flex-col gap-2">
                    <span className="text-text-secondary dark:text-zinc-400 font-medium">Schedule Time</span>
                    <span className="font-bold text-text-primary dark:text-zinc-200">
                      {format(new Date(booking.start_time), 'eee MMM d')} · {booking.is_all_day ? 'All Day' : `${format(new Date(booking.start_time), 'h:mm a')} – ${format(new Date(booking.end_time), 'h:mm a')}`}
                    </span>
                  </div>
                </div>

                {/* Booked By */}
                <div className="flex items-start gap-12">
                  <User size={14} className="text-text-secondary flex-shrink-0 mt-[2px]" />
                  <div className="flex flex-col gap-2">
                    <span className="text-text-secondary dark:text-zinc-400 font-medium">Booked By</span>
                    <span className="font-bold text-text-primary dark:text-zinc-200">{booking.userName || 'Unknown Requester'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canCancel ? (
                <div className="flex flex-col gap-8 mt-16 border-t border-border/40 dark:border-zinc-800/40 pt-16 select-none animate-fadeIn">
                  {!showConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(true)}
                      className="w-full h-36 bg-danger/10 hover:bg-danger/15 text-danger rounded-control text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-6"
                    >
                      <Trash2 size={14} />
                      <span>Cancel Booking</span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-10">
                      <span className="text-[11px] text-danger font-semibold">Are you sure you want to cancel this booking?</span>
                      <div className="flex gap-8">
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                          className="w-full h-32 bg-danger text-white hover:bg-danger/95 rounded text-[11px] font-bold cursor-pointer transition-all"
                        >
                          Yes, Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirm(false)}
                          className="w-full h-32 border border-border dark:border-zinc-700 hover:bg-bg dark:hover:bg-zinc-800 rounded text-[11px] font-bold cursor-pointer transition-all"
                        >
                          No, Keep
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-text-secondary italic text-center border-t border-border/40 dark:border-zinc-800/40 pt-16 mt-8">
                  Read-only reservation details.
                </div>
              )}
            </motion.div>
          </DialogPanel>
        </div>
      </Dialog>
    </AnimatePresence>
  )
}

export default BookingPopover

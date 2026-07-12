import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail } from 'lucide-react'
import { useInviteEmployeeMutation } from '../../hooks/useEmployees'
import type { Department } from '../../hooks/useDepartments'
import { useToast } from '../shared/ToastContext'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  department_id: z.string().nullable().optional()
})

type InviteFormValues = z.infer<typeof inviteSchema>

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
}

export const InviteEmployeeModal: React.FC<InviteEmployeeModalProps> = ({
  isOpen,
  onClose,
  departments
}) => {
  const { toast } = useToast()
  const inviteMutation = useInviteEmployeeMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      department_id: ''
    }
  })

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      reset({
        email: '',
        department_id: ''
      })
    }
  }, [isOpen, reset])

  const onSubmit = async (values: InviteFormValues) => {
    const payload = {
      email: values.email,
      department_id: values.department_id || null
    }

    try {
      await inviteMutation.mutateAsync(payload)
      toast('success', `Invitation successfully sent to "${payload.email}".`)
      onClose()
    } catch (err: any) {
      toast('error', err.message || 'An error occurred while sending the invite.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog 
          static 
          open={isOpen} 
          onClose={onClose} 
          className="relative z-50"
        >
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-16 md:p-24 overflow-y-auto">
            <DialogPanel
              className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card w-full max-w-[440px] shadow-xl overflow-hidden"
            >
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
                    <Mail size={18} className="text-primary" />
                    Invite Team Member
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
                  Enter user email to send account signup invite.
                </Description>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-20 mt-20">
                  <p className="text-[12px] text-text-secondary dark:text-zinc-400 leading-relaxed select-none">
                    Employees must create their own accounts via signup. This form triggers a secure onboarding email with pre-assigned department parameters.
                  </p>

                  {/* Email Input */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Email Address</label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="e.g. employee@company.com"
                      className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                    />
                    {errors.email && (
                      <span className="text-[11px] text-danger font-medium mt-2">{errors.email.message}</span>
                    )}
                  </div>

                  {/* Department Selection */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">
                      Pre-assign Department
                    </label>
                    <select
                      {...register('department_id')}
                      className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                    >
                      <option value="">-- No Pre-assignment (Optional) --</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={inviteMutation.isPending}
                    className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer flex items-center justify-center gap-8"
                  >
                    {inviteMutation.isPending && (
                      <svg className="animate-spin h-16 w-16 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    Send Invitation
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

export default InviteEmployeeModal

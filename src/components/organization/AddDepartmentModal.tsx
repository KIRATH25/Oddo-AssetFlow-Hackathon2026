import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '../../hooks/useDepartments'
import type { Department } from '../../hooks/useDepartments'
import { useToast } from '../shared/ToastContext'

const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  head_user_id: z.string().nullable().optional(),
  parent_department_id: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive'])
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deptToEdit?: Department | null;
  existingDepts: Department[];
}

interface ProfileOption {
  id: string;
  full_name: string;
  role: string;
}

export const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  isOpen,
  onClose,
  deptToEdit = null,
  existingDepts
}) => {
  const { toast } = useToast()
  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)

  const createMutation = useCreateDepartmentMutation()
  const updateMutation = useUpdateDepartmentMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      head_user_id: '',
      parent_department_id: '',
      status: 'active'
    }
  })

  // Load eligible heads
  useEffect(() => {
    if (isOpen) {
      setLoadingProfiles(true)
      supabase
        .from('profiles')
        .select('id, full_name, role')
        .in('role', ['Admin', 'Asset Manager', 'Department Head'])
        .eq('status', 'Active')
        .then(({ data, error }) => {
          if (!error && data) {
            setProfiles(data)
          }
          setLoadingProfiles(false)
        })
    }
  }, [isOpen])

  // Reset form when deptToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (deptToEdit) {
        reset({
          name: deptToEdit.name,
          head_user_id: deptToEdit.head_user_id || '',
          parent_department_id: deptToEdit.parent_department_id || '',
          status: deptToEdit.status
        })
      } else {
        reset({
          name: '',
          head_user_id: '',
          parent_department_id: '',
          status: 'active'
        })
      }
    }
  }, [isOpen, deptToEdit, reset])

  const onSubmit = async (values: DepartmentFormValues) => {
    const payload = {
      name: values.name,
      head_user_id: values.head_user_id === '' ? null : values.head_user_id,
      parent_department_id: values.parent_department_id === '' ? null : values.parent_department_id,
      status: values.status
    }

    try {
      if (deptToEdit) {
        await updateMutation.mutateAsync({ id: deptToEdit.id, ...payload })
        toast('success', `Department "${payload.name}" updated successfully.`)
      } else {
        await createMutation.mutateAsync(payload)
        toast('success', `Department "${payload.name}" created successfully.`)
      }
      onClose()
    } catch (err: any) {
      toast('error', err.message || 'An error occurred while saving.')
    }
  }

  // Filter out self from parent options to avoid circular reference
  const parentOptions = existingDepts.filter(d => !deptToEdit || d.id !== deptToEdit.id)

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog 
          static 
          open={isOpen} 
          onClose={onClose} 
          className="relative z-50"
        >
          {/* Backdrop blur overlay */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-16 md:p-24 overflow-y-auto">
            <DialogPanel
              className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card w-full max-w-[460px] shadow-xl overflow-hidden"
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
                  <DialogTitle className="text-[18px] font-bold text-text-primary dark:text-zinc-100">
                    {deptToEdit ? 'Edit Department' : 'Add Department'}
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
                  Add department details including Head and Parent department assignments.
                </Description>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-20 mt-20">
                  
                  {/* Department Name */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Department Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. Sales & Account Management"
                      className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                    />
                    {errors.name && (
                      <span className="text-[11px] text-danger font-medium mt-2">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Head of Department Selection */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">
                      Department Head
                    </label>
                    <select
                      {...register('head_user_id')}
                      className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                    >
                      <option value="">-- Choose Head (Optional) --</option>
                      {loadingProfiles ? (
                        <option disabled>Loading eligible personnel...</option>
                      ) : (
                        profiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name} ({p.role})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Parent Department Selection */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">
                      Parent Department
                    </label>
                    <select
                      {...register('parent_department_id')}
                      className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                    >
                      <option value="">-- Select Parent Department (Optional) --</option>
                      {parentOptions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Toggle */}
                  <div className="flex justify-between items-center py-8">
                    <div className="flex flex-col gap-2 select-none">
                      <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Status</span>
                      <span className="text-[11px] text-text-secondary dark:text-zinc-400">Set department availability status</span>
                    </div>
                    <select
                      {...register('status')}
                      className="h-40 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer flex items-center justify-center gap-8"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <svg className="animate-spin h-16 w-16 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {deptToEdit ? 'Save Changes' : 'Create Department'}
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

export default AddDepartmentModal

import React, { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '../../hooks/useCategories'
import type { Category } from '../../hooks/useCategories'
import { useToast } from '../shared/ToastContext'

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  status: z.enum(['active', 'inactive']),
  type: z.enum(['Asset Category', 'CSR Activity', 'Challenge']),
  custom_fields: z.array(
    z.object({
      label: z.string().min(1, 'Field name is required'),
      type: z.enum(['text', 'number', 'date'])
    })
  )
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  catToEdit?: Category | null;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  catToEdit = null
}) => {
  const { toast } = useToast()
  
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      status: 'active',
      type: 'Asset Category',
      custom_fields: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'custom_fields'
  })

  // Reset form when catToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (catToEdit) {
        reset({
          name: catToEdit.name,
          status: catToEdit.status,
          type: catToEdit.type || 'Asset Category',
          custom_fields: catToEdit.custom_fields || []
        })
      } else {
        reset({
          name: '',
          status: 'active',
          type: 'Asset Category',
          custom_fields: []
        })
      }
    }
  }, [isOpen, catToEdit, reset])

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (catToEdit) {
        await updateMutation.mutateAsync({ id: catToEdit.id, ...values })
        toast('success', `Category "${values.name}" updated successfully.`)
      } else {
        await createMutation.mutateAsync(values)
        toast('success', `Category "${values.name}" created successfully.`)
      }
      onClose()
    } catch (err: any) {
      toast('error', err.message || 'An error occurred while saving.')
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
          {/* Backdrop blur overlay */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-16 md:p-24 overflow-y-auto">
            <DialogPanel
              className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card w-full max-w-[480px] shadow-xl overflow-hidden"
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
                    {catToEdit ? 'Edit Category' : 'Add Category'}
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
                  Add or edit category with custom fields.
                </Description>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-20 mt-20">
                  
                  {/* Category Name */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Category Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="e.g. IT Electronics"
                      className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                    />
                    {errors.name && (
                      <span className="text-[11px] text-danger font-medium mt-2">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Category Type */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Category Type</label>
                    <select
                      {...register('type')}
                      className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                    >
                      <option value="Asset Category">Asset Category</option>
                      <option value="CSR Activity">CSR Activity</option>
                      <option value="Challenge">Challenge</option>
                    </select>
                  </div>

                  {/* Status Selection */}
                  <div className="flex flex-col gap-6">
                    <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Status</label>
                    <select
                      {...register('status')}
                      className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Custom Fields Section */}
                  <div className="flex flex-col gap-12 border-t border-border/40 dark:border-zinc-800/40 pt-16">
                    <div className="flex justify-between items-center select-none">
                      <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Custom Attributes</span>
                      <button
                        type="button"
                        onClick={() => append({ label: '', type: 'text' })}
                        className="px-12 py-6 rounded-control border border-primary/20 hover:border-primary text-primary text-[11px] font-bold flex items-center gap-4 transition-all cursor-pointer bg-primary/5 hover:bg-primary/10"
                      >
                        <Plus size={14} /> Add Field
                      </button>
                    </div>

                    {fields.length === 0 ? (
                      <span className="text-[12px] text-text-secondary italic dark:text-zinc-400 py-8 select-none">
                        No custom fields added yet. Add attributes like "Warranty (months)" or "Serial Format".
                      </span>
                    ) : (
                      <div className="max-h-[160px] overflow-y-auto flex flex-col gap-8 pr-4">
                        {fields.map((field, index) => (
                          <div key={field.id} className="flex gap-8 items-center">
                            <input
                              type="text"
                              placeholder="Field Label"
                              {...register(`custom_fields.${index}.label` as const)}
                              className="h-38 flex-grow px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[12px] rounded-control text-text-primary dark:text-zinc-100"
                            />
                            <select
                              {...register(`custom_fields.${index}.type` as const)}
                              className="h-38 px-8 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[12px] rounded-control focus:outline-none text-text-primary dark:text-zinc-100"
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-8 text-text-secondary hover:text-danger rounded-full hover:bg-danger/5 transition-all cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {catToEdit ? 'Save Changes' : 'Create Category'}
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

export default AddCategoryModal

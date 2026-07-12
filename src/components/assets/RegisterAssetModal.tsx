import React, { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UploadCloud, Trash2 } from 'lucide-react'
import { useCategoriesQuery } from '../../hooks/useCategories'
import { useDepartmentsQuery } from '../../hooks/useDepartments'
import { useCreateAssetMutation, useUpdateAssetMutation, uploadAssetPhoto } from '../../hooks/useRegisterAsset'
import type { Asset } from '../../hooks/useAssets'
import { useToast } from '../shared/ToastContext'

const assetSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters'),
  category_id: z.string().min(1, 'Category selection is required'),
  serial_number: z.string().optional(),
  purchase_date: z.string().min(1, 'Acquisition date is required'),
  cost: z.number().min(0, 'Cost must be 0 or positive').optional(),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']),
  location: z.string().optional(),
  department_id: z.string().optional(),
  is_bookable: z.boolean(),
  description: z.string().optional()
})

type AssetFormValues = z.infer<typeof assetSchema>

interface RegisterAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetToEdit?: Asset | null;
}

export const RegisterAssetModal: React.FC<RegisterAssetModalProps> = ({
  isOpen,
  onClose,
  assetToEdit = null
}) => {
  const { toast } = useToast()
  const { data: categories = [] } = useCategoriesQuery()
  const { data: departments = [] } = useDepartmentsQuery()

  const createMutation = useCreateAssetMutation()
  const updateMutation = useUpdateAssetMutation()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [customFieldsValues, setCustomFieldsValues] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      category_id: '',
      serial_number: '',
      purchase_date: new Date().toISOString().split('T')[0],
      cost: undefined,
      condition: 'Good',
      location: '',
      department_id: '',
      is_bookable: false,
      description: ''
    }
  })

  const selectedCategoryId = watch('category_id')
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
  const categoryCustomFields = selectedCategory?.custom_fields || []

  // Pre-fill form if editing
  useEffect(() => {
    if (isOpen) {
      if (assetToEdit) {
        reset({
          name: assetToEdit.name,
          category_id: assetToEdit.category_id || '',
          serial_number: assetToEdit.serial_number || '',
          purchase_date: assetToEdit.purchase_date || '',
          cost: assetToEdit.cost || undefined,
          condition: assetToEdit.condition || 'Good',
          location: assetToEdit.location || '',
          department_id: assetToEdit.department_id || '',
          is_bookable: assetToEdit.is_bookable || false,
          description: assetToEdit.description || ''
        })
        setPhotoUrl(assetToEdit.photo_url || null)
        
        // Parse custom fields values
        const parsedVals: Record<string, string> = {}
        if (assetToEdit.custom_fields && Array.isArray(assetToEdit.custom_fields)) {
          assetToEdit.custom_fields.forEach((f: any) => {
            if (f && f.label) parsedVals[f.label] = f.value || ''
          })
        }
        setCustomFieldsValues(parsedVals)
      } else {
        reset({
          name: '',
          category_id: '',
          serial_number: '',
          purchase_date: new Date().toISOString().split('T')[0],
          cost: undefined,
          condition: 'Good',
          location: '',
          department_id: '',
          is_bookable: false,
          description: ''
        })
        setPhotoUrl(null)
        setCustomFieldsValues({})
      }
      setUploadProgress(null)
      setUploading(false)
    }
  }, [isOpen, assetToEdit, reset])

  // Handle file drops / selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const url = await uploadAssetPhoto(file, (percent) => {
        setUploadProgress(percent)
      })
      setPhotoUrl(url)
      toast('success', 'Asset photo uploaded successfully.')
    } catch (err: any) {
      toast('error', err.message || 'Failed to upload photo.')
      setUploadProgress(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const url = await uploadAssetPhoto(file, (percent) => {
        setUploadProgress(percent)
      })
      setPhotoUrl(url)
      toast('success', 'Asset photo uploaded successfully.')
    } catch (err: any) {
      toast('error', err.message || 'Failed to upload photo.')
      setUploadProgress(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoUrl(null)
    setUploadProgress(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (values: AssetFormValues) => {
    // Structure custom fields values as an array of objects to save in jsonb column
    const customFieldsPayload = categoryCustomFields.map((field) => ({
      label: field.label,
      value: customFieldsValues[field.label] || '',
      type: field.type
    }))

    const payload = {
      name: values.name,
      category_id: values.category_id || null,
      serial_number: values.serial_number || null,
      purchase_date: values.purchase_date || null,
      cost: values.cost || null,
      condition: values.condition,
      location: values.location || null,
      department_id: values.department_id || null,
      is_bookable: values.is_bookable,
      description: values.description || null,
      photo_url: photoUrl,
      custom_fields: customFieldsPayload,
      status: assetToEdit ? assetToEdit.status : 'Available'
    }

    try {
      if (assetToEdit) {
        await updateMutation.mutateAsync({ id: assetToEdit.id, ...payload })
        toast('success', `Asset "${payload.name}" updated successfully.`)
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast('success', `Asset registered successfully with tag: ${created.asset_tag}`)
      }
      onClose()
    } catch (err: any) {
      toast('error', err.message || 'An error occurred while saving the asset.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={onClose} className="relative z-50">
          {/* Backdrop Blur */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-16 md:p-24 overflow-y-auto">
            <DialogPanel className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card w-full max-w-[580px] shadow-xl overflow-hidden">
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
                    {assetToEdit ? 'Edit Asset' : 'Register Asset'}
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
                  Form panel to register a new physical asset or update existing properties.
                </Description>

                {/* Form Content */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-20 mt-20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-20 max-h-[440px] overflow-y-auto pr-4">
                    
                    {/* Asset Name */}
                    <div className="flex flex-col gap-6 md:col-span-2">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Asset Name</label>
                      <input
                        type="text"
                        {...register('name')}
                        placeholder="e.g. MacBook Pro M3 16-inch"
                        className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                      />
                      {errors.name && (
                        <span className="text-[11px] text-danger font-medium mt-2">{errors.name.message}</span>
                      )}
                    </div>

                    {/* Asset Tag (Read-only Sequence indicator) */}
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Asset Tag</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={assetToEdit ? assetToEdit.asset_tag : 'Will be auto-generated (e.g. AF-xxxx)'}
                        className="h-44 px-16 border border-border/80 dark:border-zinc-850 bg-bg/50 dark:bg-zinc-950/20 text-[13px] rounded-control text-text-secondary dark:text-zinc-500 font-medium select-none cursor-not-allowed"
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Category</label>
                      <select
                        {...register('category_id')}
                        className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                      >
                        <option value="">-- Select Category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <span className="text-[11px] text-danger font-medium mt-2">{errors.category_id.message}</span>
                      )}
                    </div>

                    {/* Serial Number */}
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Serial Number</label>
                      <input
                        type="text"
                        {...register('serial_number')}
                        placeholder="e.g. C02X87HGJG87"
                        className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                      />
                    </div>

                    {/* Acquisition Date */}
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Acquisition Date</label>
                      <input
                        type="date"
                        {...register('purchase_date')}
                        className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control text-text-primary dark:text-zinc-100"
                      />
                      {errors.purchase_date && (
                        <span className="text-[11px] text-danger font-medium mt-2">{errors.purchase_date.message}</span>
                      )}
                    </div>

                    {/* Acquisition Cost */}
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200 font-bold">Acquisition Cost</label>
                      <div className="relative">
                        <span className="absolute left-16 top-1/2 -translate-y-1/2 text-text-secondary text-[13px] font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          {...register('cost', { valueAsNumber: true })}
                          placeholder="0.00"
                          className="w-full h-44 pl-32 pr-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                        />
                      </div>
                      {errors.cost && (
                        <span className="text-[11px] text-danger font-medium mt-2">{errors.cost.message}</span>
                      )}
                    </div>

                    {/* Condition */}
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Condition</label>
                      <select
                        {...register('condition')}
                        className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                      >
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Location</label>
                      <input
                        type="text"
                        {...register('location')}
                        placeholder="e.g. HQ — Floor 3 — Room B"
                        className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                      />
                    </div>

                    {/* Department Assign (Optional) */}
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Department Owner</label>
                      <select
                        {...register('department_id')}
                        className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                      >
                        <option value="">-- Select Department (Optional) --</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Shared Toggle */}
                    <div className="flex justify-between items-center py-8 md:col-span-2 select-none">
                      <div className="flex flex-col gap-2">
                        <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Shared/Bookable Resource</span>
                        <span className="text-[11px] text-text-secondary dark:text-zinc-500">Allow team members to request reservations/bookings</span>
                      </div>
                      <input
                        type="checkbox"
                        {...register('is_bookable')}
                        className="w-18 h-18 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-6 md:col-span-2">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Description</label>
                      <textarea
                        {...register('description')}
                        rows={3}
                        placeholder="Add secondary comments or structural specifications..."
                        className="p-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500 focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Dynamic Category Custom Fields payoff! */}
                    {categoryCustomFields.length > 0 && (
                      <div className="md:col-span-2 flex flex-col gap-16 border-t border-dashed border-border/60 dark:border-zinc-800/60 pt-16 mt-8">
                        <span className="text-[12px] font-bold text-primary tracking-wider uppercase">Category-Specific Attributes</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                          {categoryCustomFields.map((field) => (
                            <div key={field.label} className="flex flex-col gap-6">
                              <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">{field.label}</label>
                              <input
                                type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                                value={customFieldsValues[field.label] || ''}
                                onChange={(e) => setCustomFieldsValues(prev => ({ ...prev, [field.label]: e.target.value }))}
                                className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control text-text-primary dark:text-zinc-100"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Drag and Drop photo zone */}
                    <div className="md:col-span-2 flex flex-col gap-8 border-t border-border/40 dark:border-zinc-800/40 pt-16">
                      <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200 select-none">Asset Photo</span>
                      
                      {photoUrl ? (
                        <div className="relative border border-border dark:border-zinc-800 rounded-card overflow-hidden aspect-video bg-bg max-w-[280px]">
                          <img src={photoUrl} alt="Asset preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="absolute top-12 right-12 p-8 bg-danger text-white hover:bg-danger/90 rounded-full transition-all cursor-pointer shadow-md"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className="border-[2px] border-dashed border-border dark:border-zinc-800 hover:border-primary/60 dark:hover:border-primary/45 rounded-card p-24 text-center cursor-pointer flex flex-col items-center justify-center gap-12 bg-bg/20 dark:bg-zinc-950/10 transition-all select-none"
                        >
                          <UploadCloud size={32} className="text-text-secondary/60 dark:text-zinc-500" />
                          <div className="flex flex-col gap-2">
                            <span className="text-[13px] font-semibold text-text-primary dark:text-zinc-300">
                              {uploading ? 'Uploading Photo...' : 'Drag and drop an image here'}
                            </span>
                            <span className="text-[11px] text-text-secondary dark:text-zinc-500">
                              Supports JPG, PNG (Max 5MB) — Click to browse files
                            </span>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      )}

                      {/* Real Progress indicator */}
                      {uploading && uploadProgress !== null && (
                        <div className="flex flex-col gap-4 max-w-[280px] mt-4">
                          <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary select-none">
                            <span>Uploading photo...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full h-6 bg-border dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-150"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Submit actions */}
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || uploading}
                    className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer flex items-center justify-center gap-8 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <svg className="animate-spin h-16 w-16 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {assetToEdit ? 'Save Changes' : 'Register Asset'}
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

export default RegisterAssetModal

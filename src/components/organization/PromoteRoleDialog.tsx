import React, { useState, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert } from 'lucide-react'
import { usePromoteRole } from '../../hooks/usePromoteRole'
import type { Employee } from '../../hooks/useEmployees'
import type { Department } from '../../hooks/useDepartments'
import { useToast } from '../shared/ToastContext'

interface PromoteRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  targetRole: 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee' | null;
  departments: Department[];
}

export const PromoteRoleDialog: React.FC<PromoteRoleDialogProps> = ({
  isOpen,
  onClose,
  employee,
  targetRole,
  departments
}) => {
  const { toast } = useToast()
  const promoteMutation = usePromoteRole()
  const [selectedDeptId, setSelectedDeptId] = useState('')
  const [error, setError] = useState('')

  // Clear state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setSelectedDeptId(employee?.department_id || '')
      setError('')
    }
  }, [isOpen, employee])

  if (!employee || !targetRole) return null

  const handleConfirm = async () => {
    setError('')

    if (targetRole === 'Department Head' && !selectedDeptId) {
      setError('Please assign a department to the Department Head.')
      return
    }

    try {
      await promoteMutation.mutateAsync({
        employeeId: employee.id,
        targetRole,
        departmentId: targetRole === 'Department Head' ? selectedDeptId : null
      })

      const roleLabel = targetRole === 'Employee' ? 'revoked to Employee' : `promoted to ${targetRole}`
      toast('success', `Role for ${employee.full_name} successfully ${roleLabel}.`)
      onClose()
    } catch (err: any) {
      toast('error', err.message || 'An error occurred during promotion.')
    }
  }

  const getDialogTitle = () => {
    if (targetRole === 'Employee') {
      return `Revoke Role`
    }
    return `Promote Role`
  }

  const getConfirmText = () => {
    if (targetRole === 'Employee') {
      return `Are you sure you want to revoke ${employee.full_name}'s role and demote them back to standard Employee status?`
    }
    return `Are you sure you want to promote ${employee.full_name} to the role of ${targetRole}?`
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
          {/* Backdrop Overlay */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-16 md:p-24 overflow-y-auto">
            <DialogPanel
              className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card w-full max-w-[420px] shadow-xl overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="p-24 md:p-32"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-16 border-b border-border/60 dark:border-zinc-800/60 select-none">
                  <DialogTitle className="text-[16px] font-bold text-text-primary dark:text-zinc-100 flex items-center gap-8">
                    <ShieldAlert size={18} className="text-warning" />
                    {getDialogTitle()}
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
                  Confirm employee role promotion or demotion parameters.
                </Description>

                {/* Form Content */}
                <div className="flex flex-col gap-20 mt-20">
                  <p className="text-[13px] text-text-primary dark:text-zinc-300 leading-relaxed select-none">
                    {getConfirmText()}
                  </p>

                  {/* Additional selector for Department Head */}
                  {targetRole === 'Department Head' && (
                    <div className="flex flex-col gap-6">
                      <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">
                        Assign to Head Department
                      </label>
                      <select
                        value={selectedDeptId}
                        onChange={(e) => {
                          setSelectedDeptId(e.target.value)
                          setError('')
                        }}
                        className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                      >
                        <option value="">-- Select Department --</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                      {error && (
                        <span className="text-[11px] text-danger font-medium mt-2">{error}</span>
                      )}
                    </div>
                  )}

                  {/* Buttons Actions */}
                  <div className="flex gap-12 mt-12 select-none">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 h-40 border border-border dark:border-zinc-700 rounded-control text-[13px] font-bold hover:bg-bg dark:hover:bg-zinc-800 transition-all cursor-pointer text-text-secondary dark:text-zinc-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={promoteMutation.isPending}
                      className="flex-1 h-40 bg-primary text-white hover:bg-primary/95 rounded-control text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-8"
                    >
                      {promoteMutation.isPending && (
                        <svg className="animate-spin h-16 w-16 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      Confirm
                    </button>
                  </div>
                </div>
              </motion.div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

export default PromoteRoleDialog

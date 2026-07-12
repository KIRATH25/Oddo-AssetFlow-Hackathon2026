import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useDepartmentsQuery, useUpdateDepartmentMutation } from '../../hooks/useDepartments'
import type { Department } from '../../hooks/useDepartments'
import DepartmentCard from '../../components/organization/DepartmentCard'
import AddDepartmentModal from '../../components/organization/AddDepartmentModal'
import EmptyState from '../../components/dashboard/EmptyState'
import CardSkeleton from '../../components/shared/CardSkeleton'
import { useToast } from '../../components/shared/ToastContext'

export const DepartmentsTab: React.FC = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const search = searchParams.get('q') || ''
  const statusFilter = searchParams.get('status') || 'all'
  const sortBy = searchParams.get('sort') || 'name_asc'

  // Fetch departments data
  const { data: departments = [], isLoading, error } = useDepartmentsQuery(search, statusFilter, sortBy)
  const updateMutation = useUpdateDepartmentMutation()

  // Local state for editing department
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const handleEditClick = (dept: Department) => {
    setDeptToEdit(dept)
    setIsEditOpen(true)
  }

  const handleToggleStatus = async (dept: Department) => {
    const nextStatus = dept.status === 'active' ? 'inactive' : 'active'
    try {
      await updateMutation.mutateAsync({
        id: dept.id,
        status: nextStatus
      })
      toast('success', `Department "${dept.name}" status updated to ${nextStatus}.`)
    } catch (err: any) {
      toast('error', err.message || 'An error occurred during update.')
    }
  }

  const handleViewEmployees = (deptId: string) => {
    // Route to Employees tab pre-filtered with dept query param
    navigate(`/organization/employees?dept=${deptId}`)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-24 mt-8">
        <CardSkeleton variant="department" />
        <CardSkeleton variant="department" />
        <CardSkeleton variant="department" />
        <CardSkeleton variant="department" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-[13px] text-danger border border-danger/10 bg-danger/5 rounded-card p-16 mt-8 font-semibold select-none">
        Failed to load departments: {error.message}
      </div>
    )
  }

  if (departments.length === 0) {
    return (
      <div className="mt-8 border border-border bg-card dark:border-zinc-800 rounded-card p-40 flex items-center justify-center">
        <EmptyState
          icon={<Building2 />}
          title="No departments yet"
          subtitle="Departments are the foundation of your organization — add your first one to get started."
          actionLabel="Add Department"
          onActionClick={() => setIsAddOpen(true)}
        />
        
        <AddDepartmentModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          existingDepts={departments}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-24 mt-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-24">
        {departments.map((dept) => (
          <DepartmentCard
            key={dept.id}
            department={dept}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleStatus}
            onViewEmployees={handleViewEmployees}
          />
        ))}
      </div>

      {/* Edit Department Modal Dialog */}
      <AddDepartmentModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setDeptToEdit(null)
        }}
        deptToEdit={deptToEdit}
        existingDepts={departments}
      />
    </div>
  )
}

export default DepartmentsTab

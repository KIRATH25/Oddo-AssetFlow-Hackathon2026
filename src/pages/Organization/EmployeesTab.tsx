import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { User, Plus } from 'lucide-react'
import { useEmployeesQuery } from '../../hooks/useEmployees'
import type { Employee } from '../../hooks/useEmployees'
import { useDepartmentsQuery } from '../../hooks/useDepartments'
import EmployeeCard from '../../components/organization/EmployeeCard'
import PromoteRoleDialog from '../../components/organization/PromoteRoleDialog'
import InviteEmployeeModal from '../../components/organization/InviteEmployeeModal'
import EmptyState from '../../components/dashboard/EmptyState'
import CardSkeleton from '../../components/shared/CardSkeleton'
import { useToast } from '../../components/shared/ToastContext'
import { supabase } from '../../lib/supabaseClient'

export const EmployeesTab: React.FC = () => {
  const { toast } = useToast()
  const [searchParams] = useSearchParams()

  const search = searchParams.get('q') || ''
  const roleFilter = searchParams.get('role') || 'all'
  const deptFilter = searchParams.get('dept') || 'all'
  const statusFilter = searchParams.get('status') || 'all'
  const sortBy = searchParams.get('sort') || 'name_asc'

  // Fetch employees list
  const { data: employees = [], isLoading, error, refetch } = useEmployeesQuery(
    search,
    roleFilter,
    deptFilter,
    statusFilter,
    sortBy
  )

  // Fetch departments list for the promote dialog selector
  const { data: departments = [] } = useDepartmentsQuery()

  // Local dialog/modal states
  const [activeEmp, setActiveEmp] = useState<Employee | null>(null)
  const [targetRole, setTargetRole] = useState<'Admin' | 'Asset Manager' | 'Department Head' | 'Employee' | null>(null)
  const [isPromoteOpen, setIsPromoteOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const handlePromoteClick = (emp: Employee, role: 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee') => {
    setActiveEmp(emp)
    setTargetRole(role)
    setIsPromoteOpen(true)
  }

  const handleToggleStatus = async (emp: Employee) => {
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active'
    try {
      // -- relies on RLS: only Admin can update profiles.status
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ status: nextStatus })
        .eq('id', emp.id)

      if (updateErr) throw updateErr
      
      toast('success', `Status for ${emp.full_name} updated to ${nextStatus}.`)
      refetch()
    } catch (err: any) {
      toast('error', err.message || 'Failed to update status.')
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-24 mt-8">
        <CardSkeleton variant="employee" />
        <CardSkeleton variant="employee" />
        <CardSkeleton variant="employee" />
        <CardSkeleton variant="employee" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-[13px] text-danger border border-danger/10 bg-danger/5 rounded-card p-16 mt-8 font-semibold select-none">
        Failed to load employees directory: {error.message}
      </div>
    )
  }

  if (employees.length === 0) {
    return (
      <div className="mt-8 border border-border bg-card dark:border-zinc-800 rounded-card p-40 flex items-center justify-center">
        <EmptyState
          icon={<User />}
          title="No team members yet"
          subtitle="Invite employees to start allocating assets and managing your organization."
          actionLabel="Invite Employee"
          onActionClick={() => setIsInviteOpen(true)}
        />

        <InviteEmployeeModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          departments={departments}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-24 mt-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-24">
        {employees.map((emp) => (
          <EmployeeCard
            key={emp.id}
            employee={emp}
            onPromote={handlePromoteClick}
            onToggleStatus={handleToggleStatus}
          />
        ))}

        {/* Trailing "+" Add-Tile shortcut */}
        <button
          onClick={() => setIsInviteOpen(true)}
          className="border-2 border-dashed border-border dark:border-zinc-800 hover:border-primary/50 dark:hover:border-purple-500/50 bg-card/40 dark:bg-zinc-900/40 rounded-card p-24 flex flex-col items-center justify-center gap-12 text-center transition-all hover:scale-[1.01] hover:bg-card/70 group min-h-[260px] cursor-pointer focus:outline-none"
        >
          <div className="p-12 bg-bg dark:bg-zinc-800 rounded-full text-text-secondary group-hover:text-primary group-hover:bg-primary/5 transition-all">
            <Plus size={20} />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Add Team Member</span>
            <span className="text-[11px] text-text-secondary dark:text-zinc-500">Invite to AssetFlow</span>
          </div>
        </button>
      </div>

      {/* Role Promotion Dialog */}
      <PromoteRoleDialog
        isOpen={isPromoteOpen}
        onClose={() => {
          setIsPromoteOpen(false)
          setActiveEmp(null)
          setTargetRole(null)
        }}
        employee={activeEmp}
        targetRole={targetRole}
        departments={departments}
      />

      {/* Invite Modal */}
      <InviteEmployeeModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        departments={departments}
      />
    </div>
  )
}

export default EmployeesTab

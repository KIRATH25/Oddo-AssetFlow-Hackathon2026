import React from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { MoreVertical, Building, Mail, Phone, Shield, UserX, UserCheck, ArrowUpCircle } from 'lucide-react'
import type { Employee } from '../../hooks/useEmployees'
import { AvatarFallback } from './AvatarFallback'
import { RoleBadge } from './RoleBadge'

interface EmployeeCardProps {
  employee: Employee;
  onPromote: (emp: Employee, role: 'Admin' | 'Asset Manager' | 'Department Head' | 'Employee') => void;
  onToggleStatus: (emp: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onPromote,
  onToggleStatus
}) => {
  const isEmployeeActive = employee.status === 'Active'
  const isStandardEmployee = employee.role.toLowerCase() === 'employee'
  const isPromotable = isStandardEmployee
  const isRevokable = 
    employee.role.toLowerCase() === 'department head' || 
    employee.role.toLowerCase() === 'depthead' ||
    employee.role.toLowerCase() === 'asset manager' ||
    employee.role.toLowerCase() === 'assetmanager'

  const isAdmin = employee.role.toLowerCase() === 'admin'

  return (
    <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800/80 rounded-card p-24 shadow-soft hover:-translate-y-2 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[260px] relative select-none">
      
      {/* Upper Area */}
      <div className="flex flex-col gap-16">
        
        {/* Profile Card Header Row */}
        <div className="flex justify-between items-start gap-12">
          {/* Avatar and Info */}
          <div className="flex items-center gap-12">
            <div className="relative shrink-0 select-none">
              {employee.avatar_url ? (
                <img 
                  src={employee.avatar_url} 
                  alt={employee.full_name} 
                  className="w-48 h-48 rounded-full object-cover border border-border dark:border-zinc-800"
                />
              ) : (
                <AvatarFallback name={employee.full_name} userId={employee.id} className="w-48 h-48 text-[15px]" />
              )}
              {/* Corner status dot badge */}
              <span 
                className={`absolute bottom-0 right-0 w-12 h-12 rounded-full border-2 border-card ${
                  isEmployeeActive ? 'bg-success' : 'bg-secondary'
                }`}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <h4 className="text-[15px] font-bold text-text-primary dark:text-zinc-100 max-w-[160px] truncate leading-tight">
                {employee.full_name}
              </h4>
              <RoleBadge role={employee.role} />
            </div>
          </div>

          {/* Context Dropdown Menu */}
          <Menu as="div" className="relative shrink-0 z-10">
            <MenuButton className="p-6 rounded-full hover:bg-bg dark:hover:bg-zinc-800 text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 transition-all focus:outline-none cursor-pointer">
              <MoreVertical size={16} />
            </MenuButton>

            <MenuItems 
              anchor="bottom end"
              className="w-220 mt-4 origin-top-right rounded-card border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 p-6 shadow-xl focus:outline-none z-20 text-[13px] font-semibold text-text-primary dark:text-zinc-200"
            >
              <div className="flex flex-col gap-2">
                {/* Promote to Dept Head (only for employee) */}
                {isPromotable && (
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => onPromote(employee, 'Department Head')}
                        className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                          focus ? 'bg-bg dark:bg-zinc-800 text-primary' : ''
                        }`}
                      >
                        <ArrowUpCircle size={14} className="text-warning shrink-0" />
                        Promote to Department Head
                      </button>
                    )}
                  </MenuItem>
                )}

                {/* Promote to Asset Manager (only for employee) */}
                {isPromotable && (
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => onPromote(employee, 'Asset Manager')}
                        className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                          focus ? 'bg-bg dark:bg-zinc-800 text-primary' : ''
                        }`}
                      >
                        <Shield size={14} className="text-info shrink-0" />
                        Promote to Asset Manager
                      </button>
                    )}
                  </MenuItem>
                )}

                {/* Revoke Role (only for Dept Head or Asset Manager) */}
                {isRevokable && !isAdmin && (
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => onPromote(employee, 'Employee')}
                        className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                          focus ? 'bg-bg dark:bg-zinc-800 text-danger' : ''
                        }`}
                      >
                        <UserX size={14} className="shrink-0" />
                        Revoke Role (set to Employee)
                      </button>
                    )}
                  </MenuItem>
                )}

                {/* Deactivate/Reactivate */}
                {!isAdmin && (
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => onToggleStatus(employee)}
                        className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left border-t border-border/30 dark:border-zinc-800/30 pt-8 transition-all ${
                          focus 
                            ? isEmployeeActive ? 'bg-red-500/5 text-danger' : 'bg-green-500/5 text-success'
                            : ''
                        }`}
                      >
                        {isEmployeeActive ? (
                          <>
                            <UserX size={14} className="shrink-0" />
                            Deactivate Account
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} className="shrink-0" />
                            Reactivate Account
                          </>
                        )}
                      </button>
                    )}
                  </MenuItem>
                )}

                {isAdmin && (
                  <div className="px-10 py-8 text-[11px] text-text-secondary italic dark:text-zinc-500 select-none">
                    Admin access cannot be demoted from here.
                  </div>
                )}
              </div>
            </MenuItems>
          </Menu>
        </div>

        {/* Detailed Metadata rows */}
        <div className="flex flex-col gap-8 text-[12px] text-text-secondary dark:text-zinc-400 select-text">
          {/* Department Row */}
          <div className="flex items-center gap-8">
            <Building size={14} className="shrink-0 opacity-70" />
            <span className="truncate">
              {employee.departmentName || <span className="italic opacity-60">No Department assigned</span>}
            </span>
          </div>

          {/* Email Row */}
          {employee.email && (
            <div className="flex items-center gap-8">
              <Mail size={14} className="shrink-0 opacity-70" />
              <span className="truncate hover:underline cursor-pointer" title={employee.email}>
                {employee.email}
              </span>
            </div>
          )}

          {/* Phone Row */}
          {employee.phone && (
            <div className="flex items-center gap-8">
              <Phone size={14} className="shrink-0 opacity-70" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>

      </div>

      {/* Footer Pill Status Indicator */}
      <div className="flex justify-between items-center mt-24 border-t border-border/40 dark:border-zinc-800/40 pt-12 select-none">
        <span className="text-[11px] text-text-secondary dark:text-zinc-500">
          Joined {new Date(employee.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
        </span>

        <span 
          className={`px-8 py-2 rounded-full border text-[11px] font-bold ${
            isEmployeeActive 
              ? 'bg-green-500/10 border-green-200/40 text-green-600 dark:bg-green-950/20 dark:border-green-800/40 dark:text-green-400' 
              : 'bg-secondary/15 border-secondary/20 text-text-secondary'
          }`}
        >
          {isEmployeeActive ? 'Active' : 'Inactive'}
        </span>
      </div>

    </div>
  )
}

export default EmployeeCard

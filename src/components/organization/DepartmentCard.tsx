import React from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { MoreVertical, Edit2, Users, ArrowRightLeft, Power, Eye } from 'lucide-react'
import type { Department } from '../../hooks/useDepartments'

interface DepartmentCardProps {
  department: Department;
  onEdit: (dept: Department) => void;
  onToggleStatus: (dept: Department) => void;
  onViewEmployees: (deptId: string) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit,
  onToggleStatus,
  onViewEmployees
}) => {
  const isActive = department.status === 'active'

  return (
    <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800/80 rounded-card p-24 shadow-soft hover:-translate-y-2 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[200px] relative group select-none">
      
      {/* Upper Section */}
      <div className="flex flex-col gap-12">
        {/* Title and Dropdown */}
        <div className="flex justify-between items-start gap-12">
          <h4 className="text-[15px] font-bold text-text-primary dark:text-zinc-100 leading-snug">
            {department.name}
          </h4>

          {/* Context Dropdown */}
          <Menu as="div" className="relative shrink-0 z-10">
            <MenuButton className="p-6 rounded-full hover:bg-bg dark:hover:bg-zinc-800 text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 transition-all focus:outline-none cursor-pointer">
              <MoreVertical size={16} />
            </MenuButton>
            
            <MenuItems 
              anchor="bottom end"
              className="w-180 mt-4 origin-top-right rounded-card border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 p-6 shadow-xl focus:outline-none z-20 text-[13px] font-semibold text-text-primary dark:text-zinc-200"
            >
              <div className="flex flex-col gap-2">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => onEdit(department)}
                      className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                        focus ? 'bg-bg dark:bg-zinc-800 text-primary' : ''
                      }`}
                    >
                      <Edit2 size={14} />
                      Edit Department
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => onToggleStatus(department)}
                      className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                        focus 
                          ? isActive ? 'bg-red-500/5 text-danger' : 'bg-green-500/5 text-success'
                          : ''
                      }`}
                    >
                      <Power size={14} />
                      {isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => onViewEmployees(department.id)}
                      className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                        focus ? 'bg-bg dark:bg-zinc-800 text-info' : ''
                      }`}
                    >
                      <Eye size={14} />
                      View Members
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>

        {/* Head of Department */}
        <div className="text-[12px] text-text-secondary dark:text-zinc-400">
          <span className="font-bold">Head:</span>{' '}
          {department.headName ? (
            <span className="font-medium text-text-primary dark:text-zinc-200">{department.headName}</span>
          ) : (
            <span className="italic opacity-60">No head assigned</span>
          )}
        </div>

        {/* Parent Department Chip */}
        {department.parentName && (
          <div className="flex items-center gap-4 text-[11px] text-text-secondary dark:text-zinc-400 select-none">
            <ArrowRightLeft size={10} className="rotate-90 shrink-0" />
            <span className="font-bold">Parent:</span>
            <span className="px-6 py-2 bg-bg dark:bg-zinc-800 rounded border border-border dark:border-zinc-700/60 font-semibold max-w-[150px] truncate">
              {department.parentName}
            </span>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="flex justify-between items-center mt-24 border-t border-border/40 dark:border-zinc-800/40 pt-12 select-none">
        {/* Personnel Counter */}
        <div className="flex items-center gap-6 text-text-secondary dark:text-zinc-400">
          <Users size={15} />
          <span className="text-[12px] font-bold">{department.employeeCount} team members</span>
        </div>

        {/* Status Pill */}
        <span 
          className={`px-8 py-2 rounded-full border text-[11px] font-bold ${
            isActive 
              ? 'bg-green-500/10 border-green-200/40 text-green-600 dark:bg-green-950/20 dark:border-green-800/40 dark:text-green-400' 
              : 'bg-secondary/15 border-secondary/20 text-text-secondary'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

    </div>
  )
}

export default DepartmentCard

import React, { useState } from 'react'
import { Shield, Wrench, Users, User } from 'lucide-react'
import { signInWithDemoAccount } from '../../lib/auth'
import type { UserRole, UserProfile } from '../../lib/auth'

interface DemoAccessPanelProps {
  onSuccess: (profile: UserProfile | null) => void;
  onError: (errMessage: string) => void;
}

export const DemoAccessPanel: React.FC<DemoAccessPanelProps> = ({ onSuccess, onError }) => {
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null)

  const rolesList: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'admin', label: 'Admin', icon: <Shield size={16} /> },
    { role: 'assetManager', label: 'Asset Manager', icon: <Wrench size={16} /> },
    { role: 'departmentHead', label: 'Dept Head', icon: <Users size={16} /> },
    { role: 'employee', label: 'Employee', icon: <User size={16} /> },
  ]

  const handleDemoClick = async (role: UserRole) => {
    setLoadingRole(role)
    try {
      const { profile } = await signInWithDemoAccount(role)
      onSuccess(profile)
    } catch (err: any) {
      onError(err.message || `An error occurred during demo sign-in. Make sure you check .env values.`)
    } finally {
      setLoadingRole(null)
    }
  }

  return (
    <div className="border-t border-dashed border-border pt-24 flex flex-col gap-16 w-full">
      <div className="text-[12px] font-bold text-text-secondary uppercase tracking-wider select-none">
        Demo access (for reviewers)
      </div>
      <div className="grid grid-cols-2 gap-16">
        {rolesList.map(({ role, label, icon }) => (
          <button
            key={role}
            type="button"
            disabled={loadingRole !== null}
            onClick={() => handleDemoClick(role)}
            className="flex items-center gap-8 px-16 h-40 rounded-control border border-border bg-card text-text-secondary hover:text-text-primary hover:border-primary hover:bg-bg transition-all duration-150 text-[13px] font-medium disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] outline-none focus:ring-[2px] focus:ring-primary/20"
          >
            {loadingRole === role ? (
              <svg className="animate-spin h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              icon
            )}
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default DemoAccessPanel

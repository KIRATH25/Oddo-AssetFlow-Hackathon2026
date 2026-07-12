import React from 'react'

interface RoleBadgeProps {
  role: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const getBadgeStyle = (r: string) => {
    switch (r.toLowerCase()) {
      case 'admin':
        return 'bg-primary/8 border-primary/15 text-primary'
      case 'asset manager':
      case 'assetmanager':
        return 'bg-info/8 border-info/15 text-info'
      case 'department head':
      case 'depthead':
      case 'head':
        return 'bg-warning/8 border-warning/15 text-warning'
      case 'employee':
      default:
        return 'bg-secondary/15 border-secondary/20 text-text-secondary'
    }
  }

  const getRoleLabel = (r: string) => {
    if (r.toLowerCase() === 'depthead') return 'Department Head'
    if (r.toLowerCase() === 'assetmanager') return 'Asset Manager'
    return r.charAt(0).toUpperCase() + r.slice(1)
  }

  return (
    <span 
      className={`px-8 py-2 rounded-full border text-[11px] font-bold select-none inline-block whitespace-nowrap ${getBadgeStyle(role)}`}
    >
      {getRoleLabel(role)}
    </span>
  )
}

export default RoleBadge

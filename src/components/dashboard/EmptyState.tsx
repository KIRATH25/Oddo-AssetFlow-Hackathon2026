import React from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  actionHref,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-32 gap-16 min-h-[300px] select-none w-full h-full">
      <div className="p-16 bg-bg border border-border/60 rounded-full text-text-secondary flex items-center justify-center shadow-soft">
        {React.cloneElement(icon as React.ReactElement<{ size?: number; className?: string }>, { 
          size: 32, 
          className: 'stroke-[1.5] text-text-secondary' 
        })}
      </div>
      <div className="flex flex-col gap-8 max-w-[320px]">
        <h4 className="text-[15px] font-semibold text-text-primary">{title}</h4>
        <p className="text-[13px] text-text-secondary leading-relaxed">{subtitle}</p>
      </div>
      {actionLabel && (
        actionHref ? (
          <Link
            to={actionHref}
            className="mt-8 px-16 h-36 border border-border bg-card rounded-control text-text-secondary hover:text-text-primary hover:bg-bg/40 font-medium text-[13px] flex items-center justify-center transition-colors active:scale-[0.98] focus:outline-none cursor-pointer"
          >
            {actionLabel}
          </Link>
        ) : onActionClick ? (
          <button
            onClick={onActionClick}
            className="mt-8 px-16 h-36 border border-border bg-card rounded-control text-text-secondary hover:text-text-primary hover:bg-bg/40 font-medium text-[13px] flex items-center justify-center transition-colors active:scale-[0.98] focus:outline-none cursor-pointer"
          >
            {actionLabel}
          </button>
        ) : null
      )}
    </div>
  )
}

export default EmptyState

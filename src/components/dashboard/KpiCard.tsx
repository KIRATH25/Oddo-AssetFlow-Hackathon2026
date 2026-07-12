import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

interface KpiCardProps {
  label: string;
  icon: React.ReactNode;
  value: number | string | undefined;
  subtitle?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'danger';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  icon,
  value,
  subtitle,
  isLoading = false,
  isError = false,
  onRetry,
  trend,
  variant = 'default',
}) => {
  const isDanger = variant === 'danger'

  return (
    <div
      className={`relative min-h-[120px] rounded-card border p-24 flex flex-col justify-between transition-all duration-200 select-none shadow-soft
        ${isDanger 
          ? 'bg-danger/5 border-danger/20 text-danger' 
          : 'bg-card border-border text-text-primary'
        }
      `}
    >
      {/* Label Row */}
      <div className="flex items-center justify-between gap-8 select-none">
        <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-inherit">
          <span className={`${isDanger ? 'text-danger' : 'text-text-secondary'}`}>
            {React.cloneElement(icon as React.ReactElement<{ size?: number; className?: string }>, { 
              size: 16,
              className: isDanger ? 'text-danger' : 'text-text-secondary'
            })}
          </span>
          <span className={isDanger ? 'text-danger' : 'text-text-secondary'}>
            {label}
          </span>
        </div>

        {/* Dynamic Trend Badge */}
        {!isLoading && !isError && trend && trend.value !== '+0%' && (
          <span
            className={`text-[11px] font-bold px-8 py-2 rounded-full border select-none
              ${trend.isPositive 
                ? 'bg-success/8 border-success/15 text-success' 
                : 'bg-danger/8 border-danger/15 text-danger'
              }
            `}
          >
            {trend.value}
          </span>
        )}
      </div>

      {/* Number Row / States */}
      <div className="mt-16 flex flex-col gap-4">
        {isLoading ? (
          // Metric loading skeleton
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col gap-8 w-full"
          >
            <div className="h-32 w-16 bg-border/80 rounded" />
            {subtitle && <div className="h-12 w-24 bg-border/40 rounded" />}
          </motion.div>
        ) : isError ? (
          // Card inline error state
          <div className="flex items-center gap-8 py-4 text-danger">
            <AlertCircle size={16} className="flex-shrink-0" />
            <div className="flex items-center gap-4 text-[12px] font-medium leading-none">
              <span>Failed</span>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="font-bold underline flex items-center gap-2 hover:opacity-80 focus:outline-none cursor-pointer"
                >
                  <RefreshCw size={10} className="animate-hover" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          // Normal state
          <>
            <span className="text-[28px] font-bold tracking-tight leading-none text-inherit">
              {typeof value === 'number' ? value.toLocaleString() : value ?? '0'}
            </span>
            {subtitle && (
              <span className={`text-[12px] font-medium leading-none ${isDanger ? 'text-danger/80' : 'text-text-secondary'}`}>
                {subtitle}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default KpiCard

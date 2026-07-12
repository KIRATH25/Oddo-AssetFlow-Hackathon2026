import React from 'react'
import { Link } from 'react-router-dom'
import { Bell, AlertCircle, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import useRecentActivity from '../../hooks/useRecentActivity'
import EmptyState from './EmptyState'
import PanelSkeleton from './PanelSkeleton'

export const RecentActivityPanel: React.FC = () => {
  const { data, isLoading, isError, refetch } = useRecentActivity()

  const getActivityDotColor = (type: string) => {
    switch (type) {
      case 'allocation':
        return 'bg-primary'
      case 'booking':
        return 'bg-info'
      case 'maintenance':
        return 'bg-warning'
      case 'transfer':
        return 'bg-secondary'
      default:
        return 'bg-secondary'
    }
  }

  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  return (
    <div className="bg-card rounded-card border border-border p-24 min-h-[420px] flex flex-col justify-between shadow-soft select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-16">
        <h3 className="text-[16px] font-semibold text-text-primary">Recent Activity</h3>
        <Link 
          to="/organization" // Routes to /notifications (we map it or link to /organization/notifications placeholder)
          className="text-[13px] font-semibold text-primary hover:underline focus:outline-none cursor-pointer"
        >
          View All
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex-grow flex items-start justify-center mt-16 min-h-[300px]">
        {isLoading ? (
          <PanelSkeleton variant="list" />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-32 gap-16 text-danger select-none w-full h-full">
            <AlertCircle size={32} />
            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold">Couldn't load activity feed</h4>
              <p className="text-[12px] text-text-secondary">Please check your database connectivity.</p>
            </div>
            <button
              onClick={() => refetch()}
              className="mt-8 px-16 h-32 border border-danger/20 bg-danger/5 rounded-control text-danger hover:bg-danger/10 font-medium text-[12px] flex items-center gap-8 transition-colors cursor-pointer focus:outline-none"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<Bell />}
            title="No recent activity"
            subtitle="Actions across AssetFlow will show up here as allocations and bookings occur."
          />
        ) : (
          <div className="w-full flex flex-col max-h-[300px] overflow-y-auto pr-8">
            {data.map((item) => (
              <div 
                key={item.id} 
                className="flex items-start gap-16 py-12 border-b border-border/40 last:border-b-0 hover:bg-bg/20 transition-colors px-8 rounded-control"
              >
                {/* Colored Action Dot Indicator */}
                <div 
                  className={`w-8 h-8 rounded-full mt-6 flex-shrink-0 shadow-sm ${getActivityDotColor(item.action_type)}`}
                  title={`Action: ${item.action_type}`}
                />
                
                {/* Description and Date */}
                <div className="flex flex-col gap-4 select-text">
                  <p className="text-[13px] text-text-primary leading-relaxed font-medium">
                    <span className="font-semibold text-primary">{item.actor_name}</span>{' '}
                    {item.description}
                  </p>
                  <span className="text-[11px] text-text-secondary select-none font-medium">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default RecentActivityPanel

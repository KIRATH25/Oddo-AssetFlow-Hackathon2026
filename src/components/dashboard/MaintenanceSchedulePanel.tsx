import React from 'react'
import { Wrench, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react'
import useMaintenanceSchedule from '../../hooks/useMaintenanceSchedule'
import EmptyState from './EmptyState'
import PanelSkeleton from './PanelSkeleton'

export const MaintenanceSchedulePanel: React.FC = () => {
  const { data, isLoading, isError, refetch } = useMaintenanceSchedule()

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-danger/8 border-danger/15 text-danger'
      case 'high':
        return 'bg-warning/10 border-warning/20 text-warning font-semibold'
      case 'medium':
        return 'bg-info/8 border-info/15 text-info'
      case 'low':
      default:
        return 'bg-secondary/15 border-secondary/20 text-text-secondary'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 border-warning/20 text-warning'
      case 'approved':
        return 'bg-info/8 border-info/15 text-info'
      case 'inProgress':
        return 'bg-primary/8 border-primary/15 text-primary'
      case 'resolved':
      default:
        return 'bg-success/8 border-success/15 text-success'
    }
  }

  const getStatusLabel = (status: string) => {
    if (status === 'inProgress') return 'In Progress'
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="bg-card rounded-card border border-border p-24 min-h-[420px] flex flex-col justify-between shadow-soft select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-16">
        <h3 className="text-[16px] font-semibold text-text-primary">Maintenance Schedule</h3>
        <button 
          className="p-8 text-text-secondary hover:text-text-primary rounded-control hover:bg-bg/40 transition-colors focus:outline-none cursor-pointer"
          aria-label="Panel filter"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-grow flex items-start justify-center mt-16 overflow-x-auto min-h-[300px]">
        {isLoading ? (
          <PanelSkeleton variant="grid" />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-32 gap-16 text-danger select-none w-full h-full">
            <AlertCircle size={32} />
            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold">Couldn't load maintenance requests</h4>
              <p className="text-[12px] text-text-secondary">Please check database permissions.</p>
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
            icon={<Wrench />}
            title="No maintenance requests"
            subtitle="All assets are in good standing. No urgent orders raised."
          />
        ) : (
          <div className="w-full overflow-y-auto max-h-[300px] pr-8">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-border text-text-secondary font-medium">
                  <th className="pb-12 pr-16 font-semibold select-none">Asset</th>
                  <th className="pb-12 pr-16 font-semibold select-none">Issue</th>
                  <th className="pb-12 pr-16 font-semibold select-none">Priority</th>
                  <th className="pb-12 pr-16 font-semibold select-none">Status</th>
                  <th className="pb-12 font-semibold select-none">Requested</th>
                </tr>
              </thead>
              <tbody>
                {data.map((req) => (
                  <tr key={req.id} className="border-b border-border/40 hover:bg-bg/20 transition-colors group">
                    <td className="py-12 pr-16 font-medium text-text-primary select-text">
                      {req.assets?.name || 'Unknown Asset'}
                    </td>
                    <td className="py-12 pr-16 text-text-secondary select-text truncate max-w-[150px]">
                      {req.issue}
                    </td>
                    <td className="py-12 pr-16">
                      <span className={`px-8 py-2 rounded-full border text-[11px] font-bold uppercase select-none ${getPriorityBadge(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-12 pr-16">
                      <span className={`px-8 py-2 rounded-full border text-[11px] font-bold select-none ${getStatusBadge(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className="py-12 text-text-secondary select-none">
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}

export default MaintenanceSchedulePanel

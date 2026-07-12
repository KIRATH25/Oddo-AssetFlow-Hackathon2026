import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, MoreHorizontal, AlertCircle, RefreshCw } from 'lucide-react'
import useUtilizationTrend from '../../hooks/useUtilizationTrend'
import EmptyState from './EmptyState'
import PanelSkeleton from './PanelSkeleton'

export const UtilizationRatesPanel: React.FC = () => {
  const { data, isLoading, isError, refetch } = useUtilizationTrend()

  // Empty state check: check if there are no bookings at all in the 30-day period
  const totalBookings = data?.reduce((sum, item) => sum + item.bookings, 0) ?? 0
  const isEmptyState = totalBookings === 0

  return (
    <div className="bg-card rounded-card border border-border p-24 min-h-[420px] flex flex-col justify-between shadow-soft select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-16">
        <h3 className="text-[16px] font-semibold text-text-primary">Utilization Rates</h3>
        <button 
          className="p-8 text-text-secondary hover:text-text-primary rounded-control hover:bg-bg/40 transition-colors focus:outline-none cursor-pointer"
          aria-label="Panel options"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-grow flex items-center justify-center mt-16 min-h-[300px]">
        {isLoading ? (
          <PanelSkeleton variant="chart" />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center text-center p-32 gap-16 text-danger select-none">
            <AlertCircle size={32} />
            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold">Couldn't load utilization trend</h4>
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
        ) : isEmptyState ? (
          <EmptyState
            icon={<TrendingUp />}
            title="No activity yet"
            subtitle="Utilization will appear here once assets are booked or allocated."
          />
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 16, right: 16, left: -24, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-text-secondary)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="var(--color-text-secondary)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '12px',
                    color: 'var(--color-text-primary)',
                    boxShadow: '0 4px 24px rgba(31,31,31,0.06)'
                  }}
                  itemStyle={{ color: 'var(--color-primary)', fontWeight: 600 }}
                  labelStyle={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-primary)' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  )
}

export default UtilizationRatesPanel

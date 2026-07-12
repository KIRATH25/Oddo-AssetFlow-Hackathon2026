import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Box, MoreHorizontal, AlertCircle, RefreshCw } from 'lucide-react'
import useAssetDistribution from '../../hooks/useAssetDistribution'
import EmptyState from './EmptyState'
import PanelSkeleton from './PanelSkeleton'

// Premium tailored HSL colors from AssetFlow palette
const COLORS = ['#7C5A78', '#A8A098', '#9B7297', '#C8BFB8', '#63455F', '#8C8278']

export const AssetDistributionPanel: React.FC = () => {
  const { data, isLoading, isError, refetch } = useAssetDistribution()

  return (
    <div className="bg-card rounded-card border border-border p-24 min-h-[420px] flex flex-col justify-between shadow-soft select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-16">
        <h3 className="text-[16px] font-semibold text-text-primary">Asset Distribution</h3>
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
              <h4 className="text-[14px] font-semibold">Couldn't load asset distribution</h4>
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
            icon={<Box />}
            title="No assets registered yet"
            subtitle="Distribution graphs will populate once you register assets in your inventory."
            actionLabel="Register your first asset"
            actionHref="/assets"
          />
        ) : (
          <div className="w-full h-[300px] flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '12px',
                    color: 'var(--color-text-primary)',
                    boxShadow: '0 4px 24px rgba(31,31,31,0.06)'
                  }}
                  itemStyle={{ color: 'var(--color-text-primary)', fontWeight: 500 }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', paddingTop: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  )
}

export default AssetDistributionPanel

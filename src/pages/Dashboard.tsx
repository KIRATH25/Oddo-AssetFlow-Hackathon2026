import React from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import KpiRow from '../components/dashboard/KpiRow'
import AssetDistributionPanel from '../components/dashboard/AssetDistributionPanel'
import UtilizationRatesPanel from '../components/dashboard/UtilizationRatesPanel'
import MaintenanceSchedulePanel from '../components/dashboard/MaintenanceSchedulePanel'
import RecentActivityPanel from '../components/dashboard/RecentActivityPanel'

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-text-primary flex">
      {/* Sidebar fixed menu left */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow pl-[260px] flex flex-col">
        {/* Top Header Bar */}
        <TopBar />

        {/* Scrollable Main Grid */}
        <main className="mt-[72px] p-32 flex-grow overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col gap-24 max-w-[1400px] mx-auto"
          >
            {/* Page Header (reserved for Caveat headliner per specifications) */}
            <div className="flex flex-col gap-8">
              <h1 className="text-[36px] font-heading font-bold text-primary select-none">
                Executive Overview
              </h1>
              <p className="text-[14px] text-text-secondary select-none">
                Real-time operational KPIs and asset utilization metrics.
              </p>
            </div>

            {/* Metrics KPI Row */}
            <KpiRow />

            {/* 2x2 Panels Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-24">
              {/* Asset Distribution */}
              <AssetDistributionPanel />

              {/* Utilization Rates */}
              <UtilizationRatesPanel />

              {/* Maintenance Schedule */}
              <MaintenanceSchedulePanel />

              {/* Recent Activity */}
              <RecentActivityPanel />
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard

import React from 'react'
import { CheckCircle2, Link as LinkIcon, Wrench, Calendar, RefreshCw, Clock, AlertTriangle, ClipboardCheck } from 'lucide-react'
import KpiCard from './KpiCard'
import {
  useAvailableCount,
  useAllocatedCount,
  useMaintenanceCount,
  useReturnsCount,
  useTransfersCount,
  useBookingsCount,
  useOverdueCount,
  useAuditCount,
} from '../../hooks/useDashboardMetrics'

export const KpiRow: React.FC = () => {
  // Query Supabase live aggregates
  const availableQ = useAvailableCount()
  const allocatedQ = useAllocatedCount()
  const maintenanceQ = useMaintenanceCount()
  const returnsQ = useReturnsCount()
  const transfersQ = useTransfersCount()
  const bookingsQ = useBookingsCount()
  const overdueQ = useOverdueCount()
  const auditQ = useAuditCount()

  return (
    <div className="grid gap-24 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] select-none">
      {/* 1. Available KPI */}
      <KpiCard
        label="Available"
        icon={<CheckCircle2 />}
        value={availableQ.data}
        isLoading={availableQ.isLoading}
        isError={availableQ.isError}
        onRetry={() => availableQ.refetch()}
        trend={{ value: '+2%', isPositive: true }}
      />

      {/* 2. Allocated KPI */}
      <KpiCard
        label="Allocated"
        icon={<LinkIcon />}
        value={allocatedQ.data}
        isLoading={allocatedQ.isLoading}
        isError={allocatedQ.isError}
        onRetry={() => allocatedQ.refetch()}
        trend={{ value: '+5%', isPositive: true }}
      />

      {/* 3. Maintenance KPI */}
      <KpiCard
        label="Maint."
        icon={<Wrench />}
        value={maintenanceQ.data?.total}
        subtitle={`${maintenanceQ.data?.pending ?? 0} Pend`}
        isLoading={maintenanceQ.isLoading}
        isError={maintenanceQ.isError}
        onRetry={() => maintenanceQ.refetch()}
      />

      {/* 4. Returns KPI */}
      <KpiCard
        label="Returns"
        icon={<Calendar />}
        value={returnsQ.data}
        isLoading={returnsQ.isLoading}
        isError={returnsQ.isError}
        onRetry={() => returnsQ.refetch()}
      />

      {/* 5. Transfers KPI */}
      <KpiCard
        label="Transfers"
        icon={<RefreshCw />}
        value={transfersQ.data}
        isLoading={transfersQ.isLoading}
        isError={transfersQ.isError}
        onRetry={() => transfersQ.refetch()}
      />

      {/* 6. Bookings KPI */}
      <KpiCard
        label="Bookings"
        icon={<Clock />}
        value={bookingsQ.data}
        isLoading={bookingsQ.isLoading}
        isError={bookingsQ.isError}
        onRetry={() => bookingsQ.refetch()}
      />

      {/* 7. Overdue KPI (Danger Theme) */}
      <KpiCard
        label="Overdue"
        icon={<AlertTriangle />}
        value={overdueQ.data}
        isLoading={overdueQ.isLoading}
        isError={overdueQ.isError}
        onRetry={() => overdueQ.refetch()}
        variant="danger"
      />

      {/* 8. Audit KPI */}
      <KpiCard
        label="Audit"
        icon={<ClipboardCheck />}
        value={auditQ.data}
        isLoading={auditQ.isLoading}
        isError={auditQ.isError}
        onRetry={() => auditQ.refetch()}
      />
    </div>
  )
}

export default KpiRow

import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, List, Plus, MapPin, Wrench, Box } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAssetsQuery } from '../../hooks/useAssets'
import type { Asset } from '../../hooks/useAssets'
import AssetCard from '../../components/assets/AssetCard'
import AssetListTable from '../../components/assets/AssetListTable'
import AssetDetailPanel from '../../components/assets/AssetDetailPanel'
import RegisterAssetModal from '../../components/assets/RegisterAssetModal'
import AssetFilterPopover from '../../components/assets/AssetFilterPopover'
import EmptyState from '../..//components/dashboard/EmptyState'
import CardSkeleton from '../../components/shared/CardSkeleton'
import { useToast } from '../../components/shared/ToastContext'

export const AssetDirectory: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. Search, View choices and filters from URL SearchParams / LocalStorage
  const search = searchParams.get('search') || searchParams.get('q') || ''
  const categoryId = searchParams.get('category')
  const deptId = searchParams.get('department')
  const locationFilter = searchParams.get('location') || ''
  
  // Parse multi-select statuses
  const statusParam = searchParams.get('statuses')
  const currentStatuses = statusParam ? statusParam.split(',') : []

  const sortBy = searchParams.get('sort') || 'newest'

  // Persistent Choice of Grid vs List View in LocalStorage
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('assetflow_directory_view') as 'grid' | 'list') || 'grid'
  })

  // Selected asset for Detail Panel slide-in
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  // Edit mode / creation modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null)

  // Persist View Mode Choice
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('assetflow_directory_view', mode)
  }

  // 2. Fetch Assets directory
  const { data: assets = [], isLoading: loadingAssets, error: assetsError } = useAssetsQuery(
    search,
    categoryId,
    currentStatuses,
    deptId,
    locationFilter,
    sortBy
  )

  // 3. Query KPI aggregate data
  const { data: totalActive = 0, isLoading: loadingActive } = useQuery({
    queryKey: ['kpi-total-active'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '("Retired","Disposed")')
      if (error) throw error
      return count || 0
    }
  })

  const { data: pendingMaint = 0, isLoading: loadingMaint } = useQuery({
    queryKey: ['kpi-pending-maint'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'resolved')
      if (error) throw error
      return count || 0
    }
  })

  const { data: locationsCount = 0, isLoading: loadingLocations } = useQuery({
    queryKey: ['kpi-locations-count'],
    queryFn: async () => {
      const { data, error } = await supabase.from('assets').select('location')
      if (error) throw error
      const unique = new Set((data || []).map(a => a.location).filter(Boolean))
      return unique.size
    }
  })

  // Apply filters updating URL params
  const handleApplyFilters = (filters: {
    category: string;
    dept: string;
    location: string;
    statuses: string[];
  }) => {
    const params = new URLSearchParams(searchParams)
    
    if (filters.category && filters.category !== 'all') {
      params.set('category', filters.category)
    } else {
      params.delete('category')
    }

    if (filters.dept && filters.dept !== 'all') {
      params.set('department', filters.dept)
    } else {
      params.delete('department')
    }

    if (filters.location.trim()) {
      params.set('location', filters.location.trim())
    } else {
      params.delete('location')
    }

    if (filters.statuses.length > 0) {
      params.set('statuses', filters.statuses.join(','))
    } else {
      params.delete('statuses')
    }

    setSearchParams(params)
  }

  const handleClearFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    setSearchParams(params)
  }

  const handleOpenEdit = (asset: Asset) => {
    setAssetToEdit(asset)
    setIsRegisterOpen(true)
  }

  const handleOpenCreate = () => {
    setAssetToEdit(null)
    setIsRegisterOpen(true)
  }

  // Sticky filters check
  const hasFiltersApplied =
    (categoryId && categoryId !== 'all') ||
    (deptId && deptId !== 'all') ||
    locationFilter.trim() ||
    currentStatuses.length > 0

  return (
    <div className="flex flex-col gap-24 min-h-screen pb-48 select-none">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-16 select-none">
        <div className="flex flex-col gap-6">
          <h2 className="text-[36px] font-heading font-bold text-primary leading-none">
            Asset Directory
          </h2>
          <p className="text-[14px] text-text-secondary">
            Manage and track enterprise assets across all facilities.
          </p>
        </div>

        {/* View togglers & Popovers */}
        <div className="flex items-center gap-12 select-none self-end md:self-auto">
          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-4 rounded-control">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-8 rounded-control transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-primary/8 text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-8 rounded-control transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-primary/8 text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          {/* Filter Popover */}
          <AssetFilterPopover
            currentCategory={categoryId || 'all'}
            currentDept={deptId || 'all'}
            currentLocation={locationFilter}
            currentStatuses={currentStatuses}
            onApply={handleApplyFilters}
          />

          {/* Create Button */}
          <button
            onClick={handleOpenCreate}
            className="h-40 px-16 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control flex items-center gap-8 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-20 select-none">
        
        {/* Total Active Assets */}
        <div className="border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 rounded-card p-20 flex items-center justify-between shadow-xs">
          <div className="flex flex-col gap-6">
            <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Total Active Assets
            </span>
            {loadingActive ? (
              <div className="h-32 w-80 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              <span className="text-[28px] font-bold text-text-primary dark:text-zinc-100 leading-none">
                {totalActive.toLocaleString()}
              </span>
            )}
          </div>
          <div className="w-48 h-48 rounded-full bg-primary/8 text-primary flex items-center justify-center">
            <Box size={24} />
          </div>
        </div>

        {/* Pending Maintenance */}
        <div
          className={`border rounded-card p-20 flex items-center justify-between transition-all shadow-xs
            ${!loadingMaint && pendingMaint > 0
              ? 'border-warning/30 bg-warning/5 text-warning dark:bg-amber-500/5'
              : 'border-border dark:border-zinc-800 bg-card dark:bg-zinc-900'
            }
          `}
        >
          <div className="flex flex-col gap-6">
            <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Pending Maintenance
            </span>
            {loadingMaint ? (
              <div className="h-32 w-80 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              <span className="text-[28px] font-bold text-text-primary dark:text-zinc-100 leading-none">
                {pendingMaint}
              </span>
            )}
          </div>
          <div
            className={`w-48 h-48 rounded-full flex items-center justify-center
              ${!loadingMaint && pendingMaint > 0
                ? 'bg-warning/15 text-warning'
                : 'bg-primary/8 text-primary'
              }
            `}
          >
            <Wrench size={24} />
          </div>
        </div>

        {/* Locations Monitored */}
        <div className="border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 rounded-card p-20 flex items-center justify-between shadow-xs">
          <div className="flex flex-col gap-6">
            <span className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
              Locations Monitored
            </span>
            {loadingLocations ? (
              <div className="h-32 w-80 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded" />
            ) : (
              <span className="text-[28px] font-bold text-text-primary dark:text-zinc-100 leading-none">
                {locationsCount}
              </span>
            )}
          </div>
          <div className="w-48 h-48 rounded-full bg-primary/8 text-primary flex items-center justify-center">
            <MapPin size={24} />
          </div>
        </div>

      </div>

      {/* Primary Directory List Grid */}
      {loadingAssets ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} variant="grid" />
          ))}
        </div>
      ) : assetsError ? (
        <div className="border border-danger/10 bg-danger/[0.02] p-24 text-center rounded-card">
          <span className="text-[13px] font-bold text-danger">Failed to fetch enterprise assets registry.</span>
        </div>
      ) : assets.length === 0 ? (
        // Distinguish empty state: true-zero vs search filters
        hasFiltersApplied || search ? (
          <EmptyState
            icon={<Box size={48} />}
            title="No assets match your filters"
            subtitle="Adjust your search criteria or clear status, category, and location filters."
            actionLabel="Clear filters"
            onActionClick={handleClearFilters}
          />
        ) : (
          <EmptyState
            icon={<Box size={48} />}
            title="No assets registered yet"
            subtitle="Start building your asset registry to track allocation, maintenance, and location."
            actionLabel="Register Asset"
            onActionClick={handleOpenCreate}
          />
        )
      ) : (
        <div className="transition-all select-none">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-20">
              {assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onClick={() => setSelectedAssetId(asset.id)}
                />
              ))}
            </div>
          ) : (
            <AssetListTable
              assets={assets}
              sortBy={sortBy}
              onSortChange={(newSort) => {
                const params = new URLSearchParams(searchParams)
                params.set('sort', newSort)
                setSearchParams(params)
              }}
              onRowClick={(asset) => setSelectedAssetId(asset.id)}
            />
          )}
        </div>
      )}

      {/* Asset Detail slide-in overlay Panel */}
      <AssetDetailPanel
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(null)}
        onEditClick={(asset) => {
          setSelectedAssetId(null)
          handleOpenEdit(asset)
        }}
        onScheduleMaintenanceClick={(asset) => {
          setSelectedAssetId(null)
          toast('info', `Scheduling maintenance for ${asset.asset_tag}...`)
          // In practice, this redirects or opens maintenance dialog
          navigate(`/planner?asset=${asset.asset_tag}`)
        }}
        onViewAllocationClick={(asset) => {
          setSelectedAssetId(null)
          toast('info', `Viewing allocation details for ${asset.asset_tag}...`)
          navigate(`/planner?asset=${asset.asset_tag}`)
        }}
      />

      {/* Register / Edit details form dialog */}
      <RegisterAssetModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false)
          setAssetToEdit(null)
        }}
        assetToEdit={assetToEdit}
      />

    </div>
  )
}

export default AssetDirectory

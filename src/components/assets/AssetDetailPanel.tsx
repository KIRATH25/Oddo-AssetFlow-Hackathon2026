import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Info, ShieldCheck, MapPin, ArrowUpRight } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { format } from 'date-fns'
import type { Asset } from '../../hooks/useAssets'
import { useAssetDetailQuery } from '../../hooks/useAssetDetail'
import { useAssetHistoryQuery } from '../../hooks/useAssetHistory'
import StatusPill from './StatusPill'
import AllocationHistoryList from './AllocationHistoryList'
import MaintenanceHistoryList from './MaintenanceHistoryList'

interface AssetDetailPanelProps {
  assetId: string | null;
  onClose: () => void;
  onEditClick: (asset: Asset) => void;
  onScheduleMaintenanceClick: (asset: Asset) => void;
  onViewAllocationClick: (asset: Asset) => void;
}

export const AssetDetailPanel: React.FC<AssetDetailPanelProps> = ({
  assetId,
  onClose,
  onEditClick,
  onScheduleMaintenanceClick,
  onViewAllocationClick
}) => {
  const { data: detailData, isLoading: loadingDetail } = useAssetDetailQuery(assetId)
  const { data: historyData, isLoading: loadingHistory } = useAssetHistoryQuery(assetId)
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')
  const [historySubTab, setHistorySubTab] = useState<'allocations' | 'maintenance'>('allocations')

  if (!assetId) return null

  const formatCost = (val?: number | null) => {
    if (val === undefined || val === null) return 'Not set'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
  }

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Not set'
    try {
      return format(new Date(dateStr), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const asset = detailData?.asset
  const currentAllocation = detailData?.currentAllocation

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 overflow-hidden select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-xs"
        />

        {/* Panel body */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 h-full w-full max-w-[420px] bg-card dark:bg-zinc-900 border-l border-border dark:border-zinc-800 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-20 md:p-24 border-b border-border/60 dark:border-zinc-800/60 flex items-start justify-between">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-mono font-bold tracking-wider text-text-secondary dark:text-zinc-500">
                {asset?.asset_tag || 'AF-xxxx'}
              </span>
              <h3 className="text-[18px] font-bold text-text-primary dark:text-zinc-100 leading-tight max-w-[280px]">
                {asset?.name || 'Loading Asset Details...'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-8 hover:bg-bg dark:hover:bg-zinc-800 rounded-full text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-grow overflow-y-auto p-20 md:p-24 flex flex-col gap-24">
            {loadingDetail ? (
              <div className="flex flex-col gap-20 py-40 items-center justify-center">
                <svg className="animate-spin h-32 w-32 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-[12px] font-semibold text-text-secondary">Loading asset...</span>
              </div>
            ) : asset ? (
              <>
                {/* QR block and Status Row */}
                <div className="flex flex-col items-center gap-12 text-center">
                  <div className="bg-primary/5 p-16 rounded-card border border-primary/10 flex items-center justify-center w-[120px] h-[120px]">
                    <QRCodeSVG
                      value={`https://app.assetflow.com/assets/${asset.id}`}
                      size={88}
                      fgColor="#7C5A78"
                      bgColor="transparent"
                    />
                  </div>
                  <StatusPill status={asset.status} />
                </div>

                {/* Switcher Tab header */}
                <div className="flex border-b border-border/40 dark:border-zinc-800/40 select-none">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 pb-10 text-[13px] font-bold text-center border-b-[2px] transition-all cursor-pointer
                      ${activeTab === 'details'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200'
                      }
                    `}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 pb-10 text-[13px] font-bold text-center border-b-[2px] transition-all cursor-pointer
                      ${activeTab === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200'
                      }
                    `}
                  >
                    History
                  </button>
                </div>

                {activeTab === 'details' ? (
                  <div className="flex flex-col gap-20">
                    
                    {/* SPECIFICATIONS card */}
                    <div className="border border-border dark:border-zinc-800 rounded-card p-16 flex flex-col gap-12 bg-card dark:bg-zinc-900/50">
                      <h4 className="text-[12px] font-bold text-text-secondary dark:text-zinc-500 uppercase tracking-wider select-none border-b border-border/40 dark:border-zinc-800/40 pb-6">
                        Details
                      </h4>
                      <div className="flex flex-col gap-10 text-[12px]">
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary dark:text-zinc-400 font-medium">Category</span>
                          <span className="font-bold text-text-primary dark:text-zinc-200">{asset.categoryName || 'Uncategorized'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary dark:text-zinc-400 font-medium">Serial Number</span>
                          <span className="font-mono text-text-primary dark:text-zinc-200 font-bold">{asset.serial_number || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary dark:text-zinc-400 font-medium">Acquisition Date</span>
                          <span className="font-bold text-text-primary dark:text-zinc-200">{formatDate(asset.purchase_date)}</span>
                        </div>
                        <div className="flex justify-between items-start flex-col gap-2">
                          <div className="flex justify-between w-full items-center">
                            <span className="text-text-secondary dark:text-zinc-400 font-medium">Acquisition Cost</span>
                            <span className="font-bold text-text-primary dark:text-zinc-200">{formatCost(asset.cost)}</span>
                          </div>
                          <span className="text-[10px] text-text-secondary/80 dark:text-zinc-500 italic flex items-center gap-4">
                            <Info size={10} /> For reporting only — not linked to accounting
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary dark:text-zinc-400 font-medium">Condition</span>
                          <span className="px-8 py-2 rounded bg-bg dark:bg-zinc-800 border border-border/60 dark:border-zinc-700 text-[11px] font-bold text-text-primary dark:text-zinc-200">
                            {asset.condition || 'Good'}
                          </span>
                        </div>

                        {/* Shared toggle */}
                        {asset.is_bookable && (
                          <div className="flex items-center gap-6 mt-6 px-10 py-6 bg-info/5 dark:bg-blue-500/5 border border-info/10 dark:border-blue-500/10 rounded-control text-[11px] text-info dark:text-blue-400 font-bold justify-center">
                            <ShieldCheck size={14} />
                            <span>Bookable resource</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CURRENT HOLDER card */}
                    <div className="border border-border dark:border-zinc-800 rounded-card p-16 flex flex-col gap-12 bg-card dark:bg-zinc-900/50">
                      <h4 className="text-[12px] font-bold text-text-secondary dark:text-zinc-500 uppercase tracking-wider border-b border-border/40 dark:border-zinc-800/40 pb-6">
                        Active Assignment
                      </h4>
                      {currentAllocation ? (
                        <div className="flex flex-col gap-8 text-[12px]">
                          <div className="flex justify-between items-center">
                            <span className="text-text-secondary dark:text-zinc-400 font-medium">Assignee</span>
                            <span className="font-bold text-text-primary dark:text-zinc-200">{currentAllocation.full_name}</span>
                          </div>
                          {currentAllocation.departmentName && (
                            <div className="flex justify-between items-center">
                              <span className="text-text-secondary dark:text-zinc-400 font-medium">Department</span>
                              <span className="font-bold text-text-primary dark:text-zinc-200">{currentAllocation.departmentName}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-text-secondary dark:text-zinc-400 font-medium">Assigned Since</span>
                            <span className="font-bold text-text-primary dark:text-zinc-200">{formatDate(currentAllocation.allocated_at)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-text-secondary dark:text-zinc-400 font-medium">Expected Return</span>
                            <span className="font-bold text-text-primary dark:text-zinc-200">
                              {currentAllocation.expected_return_date ? formatDate(currentAllocation.expected_return_date) : 'Not set'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[12px] text-text-secondary italic dark:text-zinc-400 py-6">
                          Currently unassigned / in stock
                        </span>
                      )}
                    </div>

                    {/* LOCATION card */}
                    <div className="border border-border dark:border-zinc-800 rounded-card p-16 flex flex-col gap-12 bg-card dark:bg-zinc-900/50">
                      <h4 className="text-[12px] font-bold text-text-secondary dark:text-zinc-500 uppercase tracking-wider border-b border-border/40 dark:border-zinc-800/40 pb-6">
                        Location Tracking
                      </h4>
                      <div className="flex flex-col gap-8">
                        <div className="flex items-start gap-8 bg-bg dark:bg-zinc-800/50 p-12 rounded-control border border-border dark:border-zinc-800">
                          <MapPin size={16} className="text-primary flex-shrink-0 mt-[2px]" />
                          <div className="flex flex-col gap-2">
                            <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">
                              {asset.location || 'Not Assigned'}
                            </span>
                            {asset.location && (
                              <span className="text-[11px] text-text-secondary dark:text-zinc-500">
                                {asset.location.split('—').join(' > ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="flex flex-col gap-16">
                    {/* History Sub-tabs */}
                    <div className="flex bg-bg dark:bg-zinc-950/40 p-4 rounded-control border border-border/40 dark:border-zinc-800/60 select-none">
                      <button
                        onClick={() => setHistorySubTab('allocations')}
                        className={`flex-1 py-6 text-[11px] font-bold rounded-control text-center cursor-pointer transition-all
                          ${historySubTab === 'allocations'
                            ? 'bg-card dark:bg-zinc-900 text-primary shadow-xs'
                            : 'text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200'
                          }
                        `}
                      >
                        Allocations
                      </button>
                      <button
                        onClick={() => setHistorySubTab('maintenance')}
                        className={`flex-1 py-6 text-[11px] font-bold rounded-control text-center cursor-pointer transition-all
                          ${historySubTab === 'maintenance'
                            ? 'bg-card dark:bg-zinc-900 text-primary shadow-xs'
                            : 'text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200'
                          }
                        `}
                      >
                        Maintenance
                      </button>
                    </div>

                    {loadingHistory ? (
                      <div className="flex justify-center py-40">
                        <svg className="animate-spin h-24 w-24 text-primary" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-12">
                        {historySubTab === 'allocations' ? (
                          <AllocationHistoryList entries={historyData?.allocations || []} />
                        ) : (
                          <MaintenanceHistoryList entries={historyData?.maintenance || []} />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <span className="text-[12px] text-danger font-medium py-32 text-center">Asset detail mismatch</span>
            )}
          </div>

          {/* Footer Sticky Actions */}
          {!loadingDetail && asset && (
            <div className="p-20 md:p-24 border-t border-border dark:border-zinc-800 bg-bg/50 dark:bg-zinc-950/20 flex flex-col gap-12 select-none">
              
              {/* Contextual link to view active allocation */}
              {asset.status === 'Allocated' && (
                <button
                  type="button"
                  onClick={() => onViewAllocationClick(asset)}
                  className="w-full h-38 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-control text-primary text-[12px] font-bold flex items-center justify-center gap-6 cursor-pointer transition-all"
                >
                  <span>View Current Allocation</span>
                  <ArrowUpRight size={14} />
                </button>
              )}

              <div className="flex gap-12">
                <button
                  type="button"
                  onClick={() => onScheduleMaintenanceClick(asset)}
                  className="flex-1 h-40 border border-border dark:border-zinc-700 rounded-control text-text-primary dark:text-zinc-300 hover:bg-bg dark:hover:bg-zinc-800 text-[13px] font-bold transition-all cursor-pointer"
                >
                  Schedule Maint.
                </button>
                <button
                  type="button"
                  onClick={() => onEditClick(asset)}
                  className="flex-1 h-40 bg-primary text-white hover:bg-primary/95 rounded-control text-[13px] font-bold transition-all cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AssetDetailPanel

import React from 'react'
import { ArrowUpDown, MapPin, Box, Eye } from 'lucide-react'
import type { Asset } from '../../hooks/useAssets'
import StatusPill from './StatusPill'

interface AssetListTableProps {
  assets: Asset[];
  sortBy: string;
  onSortChange: (newSort: string) => void;
  onRowClick: (asset: Asset) => void;
}

export const AssetListTable: React.FC<AssetListTableProps> = ({
  assets,
  sortBy,
  onSortChange,
  onRowClick
}) => {
  const handleSortToggle = (field: string) => {
    if (field === 'name') {
      onSortChange(sortBy === 'name_asc' ? 'name_desc' : 'name_asc')
    } else if (field === 'tag') {
      onSortChange(sortBy === 'tag_asc' ? 'tag_desc' : 'tag_asc')
    }
  }

  const renderSortIndicator = (field: string) => {
    const isCurrent = (field === 'name' && sortBy.startsWith('name')) || 
                      (field === 'tag' && sortBy.startsWith('tag'))
    return (
      <ArrowUpDown 
        size={14} 
        className={`ml-4 transition-colors flex-shrink-0
          ${isCurrent ? 'text-primary' : 'text-text-secondary/40 group-hover:text-text-secondary'}
        `} 
      />
    )
  }

  return (
    <div className="w-full overflow-x-auto border border-border dark:border-zinc-800 rounded-card bg-card dark:bg-zinc-900 shadow-sm">
      <table className="w-full text-left border-collapse select-none">
        <thead>
          <tr className="border-b border-border/80 dark:border-zinc-800/80 bg-bg/50 dark:bg-zinc-950/20 text-[11px] font-bold text-text-secondary dark:text-zinc-400 uppercase tracking-wider h-44">
            <th className="px-16 md:px-24 w-60 text-center font-bold">Photo</th>
            <th 
              onClick={() => handleSortToggle('tag')}
              className="px-16 cursor-pointer hover:bg-bg/60 dark:hover:bg-zinc-800/40 select-none group h-full"
            >
              <div className="flex items-center h-full">
                <span>Asset Tag</span>
                {renderSortIndicator('tag')}
              </div>
            </th>
            <th 
              onClick={() => handleSortToggle('name')}
              className="px-16 cursor-pointer hover:bg-bg/60 dark:hover:bg-zinc-800/40 select-none group h-full"
            >
              <div className="flex items-center h-full">
                <span>Name</span>
                {renderSortIndicator('name')}
              </div>
            </th>
            <th className="px-16">Category</th>
            <th className="px-16">Status</th>
            <th className="px-16">Location</th>
            <th className="px-16">Department</th>
            <th className="px-16 md:px-24 text-right w-80">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40 dark:divide-zinc-800/40 text-[13px] text-text-primary dark:text-zinc-300 font-medium">
          {assets.map((asset) => (
            <tr
              key={asset.id}
              onClick={() => onRowClick(asset)}
              className="hover:bg-primary/[0.02] dark:hover:bg-zinc-800/20 transition-all cursor-pointer group"
            >
              {/* Photo Thumbnail */}
              <td className="px-16 md:px-24 py-10 w-60 text-center">
                <div className="w-36 h-36 rounded bg-bg dark:bg-zinc-950 border border-border/60 dark:border-zinc-800 flex items-center justify-center overflow-hidden mx-auto">
                  {asset.photo_url ? (
                    <img 
                      src={asset.photo_url} 
                      alt={asset.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Box size={16} className="text-text-secondary/40" />
                  )}
                </div>
              </td>

              {/* Asset Tag */}
              <td className="px-16 py-10 font-mono font-bold tracking-wider text-[12px] text-text-primary dark:text-zinc-200">
                {asset.asset_tag || 'AF-xxxx'}
              </td>

              {/* Name */}
              <td className="px-16 py-10 max-w-[200px] truncate font-bold text-text-primary dark:text-zinc-100 group-hover:text-primary transition-colors">
                {asset.name}
              </td>

              {/* Category */}
              <td className="px-16 py-10 text-text-secondary dark:text-zinc-400">
                {asset.categoryName || 'Uncategorized'}
              </td>

              {/* Status */}
              <td className="px-16 py-10">
                <StatusPill status={asset.status} />
              </td>

              {/* Location */}
              <td className="px-16 py-10 text-text-secondary dark:text-zinc-400">
                <div className="flex items-center gap-4">
                  <MapPin size={12} className="text-text-secondary/60 flex-shrink-0" />
                  <span className="truncate">{asset.location || 'Not set'}</span>
                </div>
              </td>

              {/* Department */}
              <td className="px-16 py-10 text-text-secondary dark:text-zinc-400">
                {asset.departmentName || 'Not Assigned'}
              </td>

              {/* Actions */}
              <td className="px-16 md:px-24 py-10 text-right w-80">
                <button
                  type="button"
                  className="p-8 hover:bg-bg dark:hover:bg-zinc-800 text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 rounded-full cursor-pointer transition-all focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRowClick(asset)
                  }}
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AssetListTable

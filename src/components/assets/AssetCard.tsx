import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Box, Laptop, Armchair, Truck, Tv } from 'lucide-react'
import type { Asset } from '../../hooks/useAssets'
import StatusPill from './StatusPill'

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
}

const getCategoryIcon = (categoryName?: string | null) => {
  if (!categoryName) return <Box size={36} className="text-text-secondary/30 dark:text-zinc-600" />
  const low = categoryName.toLowerCase()
  if (low.includes('electronic') || low.includes('it') || low.includes('computer') || low.includes('tech')) {
    return <Laptop size={36} className="text-text-secondary/30 dark:text-zinc-600" />
  }
  if (low.includes('vehicle') || low.includes('car') || low.includes('truck') || low.includes('fleet')) {
    return <Truck size={36} className="text-text-secondary/30 dark:text-zinc-600" />
  }
  if (low.includes('furniture') || low.includes('chair') || low.includes('desk') || low.includes('table') || low.includes('office')) {
    return <Armchair size={36} className="text-text-secondary/30 dark:text-zinc-600" />
  }
  if (low.includes('media') || low.includes('tv') || low.includes('screen') || low.includes('display')) {
    return <Tv size={36} className="text-text-secondary/30 dark:text-zinc-600" />
  }
  return <Box size={36} className="text-text-secondary/30 dark:text-zinc-600" />
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4, boxShadow: '0 12px 20px -8px rgba(124, 90, 120, 0.12)' }}
      transition={{ duration: 0.2 }}
      className="border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 rounded-card overflow-hidden flex flex-col justify-between cursor-pointer select-none group"
    >
      {/* Photo Thumbnail on top (16:9) */}
      <div className="relative w-full aspect-video bg-bg dark:bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-border/40 dark:border-zinc-800/40">
        {asset.photo_url ? (
          <img
            src={asset.photo_url}
            alt={asset.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // If image fails to load, fallback to outline icon
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-8 text-center p-16">
            {getCategoryIcon(asset.categoryName)}
          </div>
        )}

        {/* Sequential Tag badge overlaid top-right */}
        <div className="absolute top-12 right-12 px-10 py-4 bg-white/95 dark:bg-zinc-900/95 border border-border dark:border-zinc-800 rounded-full shadow-sm text-[11px] font-mono font-bold text-text-primary dark:text-zinc-200 tracking-wider">
          {asset.asset_tag || 'AF-xxxx'}
        </div>
      </div>

      {/* Details Container */}
      <div className="p-16 flex flex-col gap-12 flex-grow">
        <div className="flex flex-col gap-4">
          {/* Subtitle: Category name + Location */}
          <span className="text-[11px] font-bold uppercase text-text-secondary dark:text-zinc-500 tracking-wider">
            {asset.categoryName || 'Uncategorized'}
          </span>
          {/* Asset Name */}
          <h4 className="text-[14px] font-bold text-text-primary dark:text-zinc-100 group-hover:text-primary transition-colors leading-snug line-clamp-2">
            {asset.name}
          </h4>
        </div>
      </div>

      {/* Card Footer Row */}
      <div className="px-16 pb-16 pt-8 border-t border-border/40 dark:border-zinc-800/40 flex justify-between items-center bg-bg/10 dark:bg-zinc-950/10">
        {/* Status Pill */}
        <StatusPill status={asset.status} />

        {/* Location badge */}
        <div className="flex items-center gap-4 text-text-secondary dark:text-zinc-400 text-[11px] font-semibold max-w-[120px] truncate">
          <MapPin size={12} className="text-text-secondary/60 flex-shrink-0" />
          <span className="truncate">{asset.location || 'Not set'}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default AssetCard

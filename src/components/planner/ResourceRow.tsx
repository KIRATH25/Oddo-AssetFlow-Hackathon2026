import React from 'react'
import type { Asset } from '../../hooks/useAssets'

interface ResourceRowProps {
  resource: Asset;
}

export const ResourceRow: React.FC<ResourceRowProps> = ({ resource }) => {
  const getMetadataLabel = () => {
    const categoryName = resource.categoryName || 'Equipment'
    const low = categoryName.toLowerCase()

    // 1. Look for custom capacity values in JSONB custom fields
    if (resource.custom_fields && Array.isArray(resource.custom_fields)) {
      const capField = resource.custom_fields.find(
        (f) => f && f.label && f.label.toLowerCase().includes('capacity')
      )
      if (capField && capField.value) {
        return `Cap: ${capField.value}`
      }
    }

    // 2. Fallbacks based on category naming
    if (low.includes('room') || low.includes('conference') || low.includes('office')) {
      return 'Cap: 12' // Mock default capacity if not defined
    }
    if (low.includes('vehicle') || low.includes('car') || low.includes('transit') || low.includes('truck')) {
      return 'Transit'
    }
    if (low.includes('electronic') || low.includes('tv') || low.includes('display') || low.includes('projector')) {
      return 'AV Equip'
    }
    return categoryName
  }

  return (
    <div className="flex flex-col gap-4 text-left p-16 select-none justify-center h-full min-h-[76px] w-[140px] border-r border-border dark:border-zinc-800 bg-bg/20 dark:bg-zinc-950/10">
      <span className="text-[14px] font-bold text-text-primary dark:text-zinc-100 truncate w-full" title={resource.name}>
        {resource.name}
      </span>
      <span className="text-[11px] font-semibold text-text-secondary dark:text-zinc-500 uppercase tracking-wide">
        {getMetadataLabel()}
      </span>
    </div>
  )
}

export default ResourceRow

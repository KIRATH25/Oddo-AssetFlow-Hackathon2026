import React from 'react'
import { motion } from 'framer-motion'

interface PanelSkeletonProps {
  variant: 'chart' | 'grid' | 'list';
}

export const PanelSkeleton: React.FC<PanelSkeletonProps> = ({ variant }) => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      className="w-full h-full flex flex-col select-none"
    >
      {variant === 'chart' && (
        <div className="flex flex-col gap-24 w-full h-[320px] justify-between py-16">
          {/* Mock Chart Bar Heights for Visual Realism */}
          <div className="flex gap-16 items-end h-[240px] px-8">
            {[75, 45, 60, 90, 30, 80, 50, 65].map((heightPct, idx) => (
              <div 
                key={idx} 
                className="flex-1 bg-border rounded-t-control" 
                style={{ height: `${heightPct}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between border-t border-border/60 pt-16 px-8">
            <div className="h-12 w-48 bg-border rounded" />
            <div className="h-12 w-48 bg-border rounded" />
            <div className="h-12 w-48 bg-border rounded" />
          </div>
        </div>
      )}

      {variant === 'grid' && (
        <div className="flex flex-col gap-16 w-full">
          {/* Header columns */}
          <div className="flex gap-16 pb-16 border-b border-border">
            <div className="h-16 w-48 bg-border rounded" />
            <div className="h-16 w-64 bg-border rounded" />
            <div className="h-16 w-32 bg-border rounded" />
            <div className="h-16 w-32 bg-border rounded" />
          </div>
          {/* Data row shapes */}
          {[1, 2, 3, 4, 5].map((idx) => (
            <div key={idx} className="flex gap-16 py-12 border-b border-border/40 items-center justify-between">
              <div className="h-16 w-64 bg-border rounded" />
              <div className="h-16 w-80 bg-border rounded" />
              <div className="h-16 w-48 bg-border rounded" />
              <div className="h-20 w-64 bg-border rounded-full" />
            </div>
          ))}
        </div>
      )}

      {variant === 'list' && (
        <div className="flex flex-col gap-16 w-full">
          {/* List list rows */}
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="flex gap-16 items-center py-12 border-b border-border/40">
              <div className="w-8 h-8 rounded-full bg-border flex-shrink-0" />
              <div className="flex flex-col gap-8 flex-grow">
                <div className="h-14 w-full bg-border rounded" />
                <div className="h-10 w-32 bg-border rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default PanelSkeleton

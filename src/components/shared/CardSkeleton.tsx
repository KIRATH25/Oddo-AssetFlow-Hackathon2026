import React from 'react'
import { motion } from 'framer-motion'

interface CardSkeletonProps {
  variant: 'department' | 'category' | 'employee' | 'grid';
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ variant }) => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      className="bg-card rounded-card border border-border dark:border-zinc-800 p-24 shadow-soft flex flex-col justify-between min-h-[220px] select-none"
    >
      {variant === 'department' && (
        <div className="flex flex-col gap-12 w-full">
          <div className="h-16 w-[60%] bg-border/80 rounded" />
          <div className="h-14 w-[40%] bg-border/40 rounded mt-8" />
          <div className="h-14 w-[50%] bg-border/40 rounded" />
          <div className="h-20 w-24 bg-border/60 rounded-full mt-16" />
        </div>
      )}

      {variant === 'category' && (
        <div className="flex flex-col gap-12 w-full">
          <div className="h-16 w-[50%] bg-border/80 rounded" />
          <div className="h-14 w-[30%] bg-border/40 rounded-full mt-8" />
          <div className="flex gap-8 mt-16">
            <div className="h-20 w-20 bg-border/50 rounded-full" />
            <div className="h-20 w-24 bg-border/50 rounded-full" />
          </div>
        </div>
      )}

      {variant === 'employee' && (
        <div className="flex flex-col gap-16 w-full items-center">
          <div className="w-64 h-64 rounded-full bg-border/80" />
          <div className="h-16 w-[70%] bg-border/80 rounded mt-8" />
          <div className="h-14 w-[40%] bg-border/40 rounded-full" />
          <div className="flex flex-col gap-8 w-full mt-16">
            <div className="h-12 w-full bg-border/30 rounded" />
            <div className="h-12 w-[80%] bg-border/30 rounded" />
          </div>
        </div>
      )}

      {variant === 'grid' && (
        <div className="flex flex-col gap-12 w-full h-full justify-between">
          <div className="w-full h-100 bg-border/30 dark:bg-zinc-800 rounded" />
          <div className="flex flex-col gap-8">
            <div className="h-12 w-[40%] bg-border/20 dark:bg-zinc-800/40 rounded mt-4" />
            <div className="h-16 w-[85%] bg-border/60 dark:bg-zinc-700 rounded" />
          </div>
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-border/20 dark:border-zinc-850">
            <div className="h-20 w-50 bg-border/50 dark:bg-zinc-850 rounded-full" />
            <div className="h-12 w-[30%] bg-border/30 dark:bg-zinc-800 rounded" />
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default CardSkeleton

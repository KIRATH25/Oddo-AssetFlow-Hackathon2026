import React, { useState, useEffect } from 'react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Filter, RotateCcw } from 'lucide-react'
import { useCategoriesQuery } from '../../hooks/useCategories'
import { useDepartmentsQuery } from '../../hooks/useDepartments'

interface AssetFilterPopoverProps {
  currentCategory: string;
  currentDept: string;
  currentLocation: string;
  currentStatuses: string[];
  onApply: (filters: {
    category: string;
    dept: string;
    location: string;
    statuses: string[];
  }) => void;
}

const LIFECYCLE_STATUSES = [
  'Available',
  'Allocated',
  'Reserved',
  'Under Maintenance',
  'Lost',
  'Retired',
  'Disposed'
]

export const AssetFilterPopover: React.FC<AssetFilterPopoverProps> = ({
  currentCategory,
  currentDept,
  currentLocation,
  currentStatuses,
  onApply
}) => {
  const { data: categories = [] } = useCategoriesQuery()
  const { data: departments = [] } = useDepartmentsQuery()

  // Local filter states
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'all')
  const [selectedDept, setSelectedDept] = useState(currentDept || 'all')
  const [selectedLocation, setSelectedLocation] = useState(currentLocation || '')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(currentStatuses || [])

  // Update local states when props change
  useEffect(() => {
    setSelectedCategory(currentCategory || 'all')
    setSelectedDept(currentDept || 'all')
    setSelectedLocation(currentLocation || '')
    setSelectedStatuses(currentStatuses || [])
  }, [currentCategory, currentDept, currentLocation, currentStatuses])

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== status))
    } else {
      setSelectedStatuses([...selectedStatuses, status])
    }
  }

  const handleApply = (close: () => void) => {
    onApply({
      category: selectedCategory,
      dept: selectedDept,
      location: selectedLocation,
      statuses: selectedStatuses
    })
    close()
  }

  const handleReset = (close: () => void) => {
    setSelectedCategory('all')
    setSelectedDept('all')
    setSelectedLocation('')
    setSelectedStatuses([])
    onApply({
      category: 'all',
      dept: 'all',
      location: '',
      statuses: []
    })
    close()
  }

  const isFilterActive =
    (currentCategory && currentCategory !== 'all') ||
    (currentDept && currentDept !== 'all') ||
    currentLocation ||
    (currentStatuses && currentStatuses.length > 0)

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <PopoverButton
            className={`h-40 px-16 rounded-control border text-[13px] font-bold flex items-center gap-8 transition-all hover:bg-bg select-none outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer
              ${isFilterActive 
                ? 'border-primary/30 bg-primary/5 text-primary' 
                : 'border-border bg-card text-text-primary dark:text-zinc-300 dark:border-zinc-800 dark:bg-zinc-900'
              }
            `}
          >
            <Filter size={16} />
            <span>Filter</span>
            {isFilterActive && (
              <span className="w-18 h-18 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {Number(!!(currentCategory && currentCategory !== 'all')) +
                  Number(!!(currentDept && currentDept !== 'all')) +
                  Number(!!currentLocation) +
                  currentStatuses.length}
              </span>
            )}
          </PopoverButton>

          <PopoverPanel className="absolute right-0 mt-8 w-[320px] bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card shadow-xl p-24 z-40 flex flex-col gap-16 select-none">
            {/* Category Select */}
            <div className="flex flex-col gap-6">
              <label className="text-[12px] font-bold text-text-primary dark:text-zinc-200">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-38 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[12px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Select */}
            <div className="flex flex-col gap-6">
              <label className="text-[12px] font-bold text-text-primary dark:text-zinc-200">Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-38 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[12px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Query */}
            <div className="flex flex-col gap-6">
              <label className="text-[12px] font-bold text-text-primary dark:text-zinc-200">Location</label>
              <input
                type="text"
                placeholder="e.g. Headquarters"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="h-38 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[12px] rounded-control text-text-primary dark:text-zinc-100 placeholder-text-secondary/60"
              />
            </div>

            {/* Lifecycle status checkboxes */}
            <div className="flex flex-col gap-8">
              <label className="text-[12px] font-bold text-text-primary dark:text-zinc-200">Statuses</label>
              <div className="max-h-[140px] overflow-y-auto border border-border/60 dark:border-zinc-800 rounded-control p-8 flex flex-col gap-6 bg-bg/50 dark:bg-zinc-950/20">
                {LIFECYCLE_STATUSES.map((status) => {
                  const isChecked = selectedStatuses.includes(status)
                  return (
                    <label
                      key={status}
                      className="flex items-center gap-8 text-[12px] text-text-primary dark:text-zinc-300 font-medium cursor-pointer py-2 hover:text-primary transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStatus(status)}
                        className="w-14 h-14 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <span>{status}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex gap-12 pt-8 border-t border-border/40 dark:border-zinc-800/40">
              <button
                type="button"
                onClick={() => handleReset(close)}
                className="h-36 px-12 border border-border dark:border-zinc-750 text-text-secondary hover:bg-bg text-[11px] font-bold rounded-control flex items-center gap-4 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={() => handleApply(close)}
                className="flex-1 h-36 bg-primary text-white hover:bg-primary/95 text-[11px] font-bold rounded-control cursor-pointer flex items-center justify-center"
              >
                Apply Filters
              </button>
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  )
}

export default AssetFilterPopover

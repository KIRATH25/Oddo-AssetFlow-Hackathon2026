import React from 'react'

interface ViewToggleProps {
  currentView: 'day' | 'week' | 'month';
  onChange: (view: 'day' | 'week' | 'month') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onChange }) => {
  const options: ('day' | 'week' | 'month')[] = ['day', 'week', 'month']

  return (
    <div className="flex items-center bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-4 rounded-control select-none">
      {options.map((option) => {
        const isActive = currentView === option
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`px-16 h-32 rounded-control text-[12px] font-bold capitalize transition-all cursor-pointer select-none
              ${isActive
                ? 'bg-primary/8 text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200'
              }
            `}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default ViewToggle

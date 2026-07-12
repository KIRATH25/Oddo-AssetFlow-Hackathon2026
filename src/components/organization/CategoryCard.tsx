import React from 'react'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { MoreVertical, Edit2, Power, Eye, Tag } from 'lucide-react'
import type { Category } from '../../hooks/useCategories'

interface CategoryCardProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onToggleStatus: (cat: Category) => void;
  onViewAssets: (catId: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onToggleStatus,
  onViewAssets
}) => {
  const isActive = category.status === 'active'

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'CSR Activity':
        return 'bg-purple-500/10 border-purple-200/40 text-purple-600 dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-purple-400'
      case 'Challenge':
        return 'bg-amber-500/10 border-amber-200/40 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400'
      case 'Asset Category':
      default:
        return 'bg-blue-500/10 border-blue-200/40 text-blue-600 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400'
    }
  }

  return (
    <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800/80 rounded-card p-24 shadow-soft hover:-translate-y-2 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[190px] relative group select-none">
      
      {/* Upper Area */}
      <div className="flex flex-col gap-12">
        {/* Title and Action menu */}
        <div className="flex justify-between items-start gap-12">
          <div className="flex items-center gap-8">
            <Tag size={16} className="text-primary shrink-0" />
            <h4 className="text-[15px] font-bold text-text-primary dark:text-zinc-100 leading-snug">
              {category.name}
            </h4>
          </div>

          <Menu as="div" className="relative shrink-0 z-10">
            <MenuButton className="p-6 rounded-full hover:bg-bg dark:hover:bg-zinc-800 text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 transition-all focus:outline-none cursor-pointer">
              <MoreVertical size={16} />
            </MenuButton>
            
            <MenuItems 
              anchor="bottom end"
              className="w-180 mt-4 origin-top-right rounded-card border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 p-6 shadow-xl focus:outline-none z-20 text-[13px] font-semibold text-text-primary dark:text-zinc-200"
            >
              <div className="flex flex-col gap-2">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => onEdit(category)}
                      className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                        focus ? 'bg-bg dark:bg-zinc-800 text-primary' : ''
                      }`}
                    >
                      <Edit2 size={14} />
                      Edit Category
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => onToggleStatus(category)}
                      className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                        focus 
                          ? isActive ? 'bg-red-500/5 text-danger' : 'bg-green-500/5 text-success'
                          : ''
                      }`}
                    >
                      <Power size={14} />
                      {isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </MenuItem>

                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => onViewAssets(category.id)}
                      className={`w-full flex items-center gap-8 px-10 py-8 rounded-control text-left transition-all ${
                        focus ? 'bg-bg dark:bg-zinc-800 text-info' : ''
                      }`}
                    >
                      <Eye size={14} />
                      View Assets
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>

        {/* Type Badge */}
        <div className="mt-4">
          <span className={`px-8 py-2 rounded-full border text-[10px] font-extrabold tracking-wider uppercase select-none ${getTypeBadgeStyle(category.type)}`}>
            {category.type || 'Asset Category'}
          </span>
        </div>

        {/* Custom Fields chips list */}
        {category.custom_fields && category.custom_fields.length > 0 && (
          <div className="flex flex-col gap-6 mt-8 select-none">
            <span className="text-[11px] font-bold text-text-secondary dark:text-zinc-500 uppercase tracking-wider">Custom Fields:</span>
            <div className="flex flex-wrap gap-6">
              {category.custom_fields.map((f, i) => (
                <span 
                  key={i} 
                  className="px-8 py-3 bg-bg dark:bg-zinc-800/80 border border-border dark:border-zinc-700/60 rounded text-[10px] font-bold text-text-primary dark:text-zinc-300"
                >
                  {f.label} ({f.type})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Pill Status */}
      <div className="flex justify-end items-center mt-24 border-t border-border/40 dark:border-zinc-800/40 pt-12 select-none">
        <span 
          className={`px-8 py-2 rounded-full border text-[11px] font-bold ${
            isActive 
              ? 'bg-green-500/10 border-green-200/40 text-green-600 dark:bg-green-950/20 dark:border-green-800/40 dark:text-green-400' 
              : 'bg-secondary/15 border-secondary/20 text-text-secondary'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

    </div>
  )
}

export default CategoryCard

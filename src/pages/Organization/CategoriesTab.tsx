import React, { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Tag } from 'lucide-react'
import { useCategoriesQuery, useUpdateCategoryMutation } from '../../hooks/useCategories'
import type { Category } from '../../hooks/useCategories'
import CategoryCard from '../../components/organization/CategoryCard'
import AddCategoryModal from '../../components/organization/AddCategoryModal'
import EmptyState from '../../components/dashboard/EmptyState'
import CardSkeleton from '../../components/shared/CardSkeleton'
import { useToast } from '../../components/shared/ToastContext'

export const CategoriesTab: React.FC = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const search = searchParams.get('q') || ''
  const typeFilter = searchParams.get('type') || 'all'
  const sortBy = searchParams.get('sort') || 'name_asc'

  // Fetch categories data
  const { data: categories = [], isLoading, error } = useCategoriesQuery(search, typeFilter, sortBy)
  const updateMutation = useUpdateCategoryMutation()

  // Local state for editing category
  const [catToEdit, setCatToEdit] = useState<Category | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const handleEditClick = (cat: Category) => {
    setCatToEdit(cat)
    setIsEditOpen(true)
  }

  const handleToggleStatus = async (cat: Category) => {
    const nextStatus = cat.status === 'active' ? 'inactive' : 'active'
    try {
      await updateMutation.mutateAsync({
        id: cat.id,
        status: nextStatus
      })
      toast('success', `Category "${cat.name}" status updated to ${nextStatus}.`)
    } catch (err: any) {
      toast('error', err.message || 'An error occurred during status update.')
    }
  }

  const handleViewAssets = (catId: string) => {
    // Route to Assets table pre-filtered by category
    navigate(`/assets?category=${catId}`)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-24 mt-8">
        <CardSkeleton variant="category" />
        <CardSkeleton variant="category" />
        <CardSkeleton variant="category" />
        <CardSkeleton variant="category" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-[13px] text-danger border border-danger/10 bg-danger/5 rounded-card p-16 mt-8 font-semibold select-none">
        Failed to load categories: {error.message}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="mt-8 border border-border bg-card dark:border-zinc-800 rounded-card p-40 flex items-center justify-center">
        <EmptyState
          icon={<Tag />}
          title="No categories yet"
          subtitle="Categories organize your assets and unlock custom tracking fields per type."
          actionLabel="Add Category"
          onActionClick={() => setIsAddOpen(true)}
        />
        
        <AddCategoryModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-24 mt-8">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-24">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            onEdit={handleEditClick}
            onToggleStatus={handleToggleStatus}
            onViewAssets={handleViewAssets}
          />
        ))}
      </div>

      {/* Edit Category Modal Dialog */}
      <AddCategoryModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setCatToEdit(null)
        }}
        catToEdit={catToEdit}
      />
    </div>
  )
}

export default CategoriesTab

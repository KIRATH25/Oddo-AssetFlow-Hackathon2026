import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'
import { Popover, PopoverButton, PopoverPanel, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import { useToast } from '../../components/shared/ToastContext'
import { useDepartmentsQuery } from '../../hooks/useDepartments'
import AddDepartmentModal from '../../components/organization/AddDepartmentModal'
import AddCategoryModal from '../../components/organization/AddCategoryModal'
import InviteEmployeeModal from '../../components/organization/InviteEmployeeModal'

export const OrganizationLayout: React.FC = () => {
  const { toast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Get active tab from path
  const currentTab = location.pathname.split('/').pop() || 'departments'

  // Search input state
  const [searchVal, setSearchVal] = useState(searchParams.get('q') || '')

  // Dialog States
  const [isDeptOpen, setIsDeptOpen] = useState(false)
  const [isCatOpen, setIsCatOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  // Load departments for pre-assign invite dropdowns and parent selectors
  const { data: departmentsList = [] } = useDepartmentsQuery()

  // Handle Toast redirect alerts from RequireRole
  useEffect(() => {
    if (location.state?.alert) {
      toast('error', location.state.alert)
      // Clean up state
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, toast, navigate])

  // Sync searchVal with query param on search value change
  useEffect(() => {
    setSearchVal(searchParams.get('q') || '')
  }, [searchParams])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(prev => {
      if (searchVal.trim()) {
        prev.set('q', searchVal.trim())
      } else {
        prev.delete('q')
      }
      return prev
    })
  }

  const handleTabChange = (tab: string) => {
    // Preserve filters/sorting on tab change, or clear search
    const newParams = new URLSearchParams()
    navigate(`/organization/${tab}?${newParams.toString()}`)
  }

  const handleSortChange = (sortBy: string) => {
    setSearchParams(prev => {
      prev.set('sort', sortBy)
      return prev
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(prev => {
      if (value && value !== 'all') {
        prev.set(key, value)
      } else {
        prev.delete(key)
      }
      return prev
    })
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
    setSearchVal('')
  }

  const getActiveTabButtonLabel = () => {
    switch (currentTab) {
      case 'categories':
        return 'Add Category'
      case 'employees':
        return 'Invite Employee'
      case 'departments':
      default:
        return 'Add Department'
    }
  }

  const handleActiveTabButtonClick = () => {
    switch (currentTab) {
      case 'categories':
        setIsCatOpen(true)
        break;
      case 'employees':
        setIsInviteOpen(true)
        break;
      case 'departments':
      default:
        setIsDeptOpen(true)
        break;
    }
  }

  const tabs = [
    { id: 'departments', label: 'Departments' },
    { id: 'categories', label: 'Categories' },
    { id: 'employees', label: 'Employees' }
  ]

  // Filter selections per active tab
  const activeStatusFilter = searchParams.get('status') || 'all'
  const activeTypeFilter = searchParams.get('type') || 'all'
  const activeRoleFilter = searchParams.get('role') || 'all'
  const activeDeptFilter = searchParams.get('dept') || 'all'
  const activeSort = searchParams.get('sort') || 'name_asc'

  return (
    <div className="min-h-screen bg-bg text-text-primary flex">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-grow pl-[260px] flex flex-col">
        {/* Top Header navbar */}
        <TopBar />

        {/* Scrollable Layout Context */}
        <main className="mt-[72px] p-32 flex-grow overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-24 max-w-[1400px] mx-auto"
          >
            {/* Title Grid */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 select-none">
              <div className="flex flex-col gap-4">
                <h1 className="text-[36px] font-heading font-bold text-primary leading-tight">
                  Organization
                </h1>
                <p className="text-[14px] text-text-secondary">
                  Manage your company structure, departments, and personnel directory.
                </p>
              </div>

              {/* Header Row Actions (Search and Main Action button) */}
              <div className="flex flex-col sm:flex-row gap-12 w-full md:w-auto items-stretch sm:items-center">
                {/* Search box (400px max) */}
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-[320px] md:w-[400px]">
                  <input
                    type="text"
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder={`Search ${currentTab}...`}
                    className="w-full h-40 pl-40 pr-16 bg-card border border-border dark:border-zinc-800 rounded-control text-[13px] text-text-primary dark:text-zinc-100 placeholder-text-secondary focus-ring-glow focus:outline-none"
                  />
                  <Search size={16} className="absolute left-16 top-12 text-text-secondary/70 pointer-events-none" />
                </form>

                {/* Tab Context Button */}
                <button
                  onClick={handleActiveTabButtonClick}
                  className="h-40 px-16 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control transition-all cursor-pointer flex items-center justify-center gap-8 shrink-0 shadow-sm"
                >
                  {getActiveTabButtonLabel()}
                </button>
              </div>
            </div>

            {/* Tab navigation links */}
            <div className="border-b border-border dark:border-zinc-800/80 flex gap-24 relative select-none">
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`pb-12 text-[14px] font-bold transition-all relative focus:outline-none cursor-pointer ${
                      isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-2 bg-primary rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Filters Row */}
            <div className="flex justify-between items-center gap-12 select-none">
              <div className="flex items-center gap-12">
                {/* Filter Popover */}
                <Popover className="relative">
                  <PopoverButton className="h-36 px-12 border border-border dark:border-zinc-800 rounded-control bg-card text-[12px] font-bold text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-bg dark:hover:bg-zinc-850 transition-all flex items-center gap-6 focus:outline-none cursor-pointer">
                    <SlidersHorizontal size={14} />
                    Filter
                  </PopoverButton>

                  <PopoverPanel className="absolute left-0 mt-8 w-260 z-30 rounded-card border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 p-20 shadow-xl flex flex-col gap-16 text-[13px] text-text-primary dark:text-zinc-200">
                    <h5 className="font-bold border-b border-border/60 pb-8 select-none">Filter Options</h5>

                    {/* DEPARTMENTS FILTERS */}
                    {currentTab === 'departments' && (
                      <div className="flex flex-col gap-6">
                        <label className="font-bold text-[11px] text-text-secondary uppercase">Status</label>
                        <select
                          value={activeStatusFilter}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="h-38 px-8 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 rounded-control focus:outline-none text-[12px]"
                        >
                          <option value="all">All Departments</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    )}

                    {/* CATEGORIES FILTERS */}
                    {currentTab === 'categories' && (
                      <div className="flex flex-col gap-6">
                        <label className="font-bold text-[11px] text-text-secondary uppercase">Type</label>
                        <select
                          value={activeTypeFilter}
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                          className="h-38 px-8 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 rounded-control focus:outline-none text-[12px]"
                        >
                          <option value="all">All Types</option>
                          <option value="Asset Category">Asset Category</option>
                          <option value="CSR Activity">CSR Activity</option>
                          <option value="Challenge">Challenge</option>
                        </select>
                      </div>
                    )}

                    {/* EMPLOYEES FILTERS */}
                    {currentTab === 'employees' && (
                      <div className="flex flex-col gap-12">
                        {/* Role Filter */}
                        <div className="flex flex-col gap-4">
                          <label className="font-bold text-[11px] text-text-secondary uppercase">System Role</label>
                          <select
                            value={activeRoleFilter}
                            onChange={(e) => handleFilterChange('role', e.target.value)}
                            className="h-36 px-8 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 rounded-control focus:outline-none text-[12px]"
                          >
                            <option value="all">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Asset Manager">Asset Manager</option>
                            <option value="Department Head">Department Head</option>
                            <option value="Employee">Employee</option>
                          </select>
                        </div>

                        {/* Department Filter */}
                        <div className="flex flex-col gap-4">
                          <label className="font-bold text-[11px] text-text-secondary uppercase">Department</label>
                          <select
                            value={activeDeptFilter}
                            onChange={(e) => handleFilterChange('dept', e.target.value)}
                            className="h-36 px-8 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 rounded-control focus:outline-none text-[12px]"
                          >
                            <option value="all">All Departments</option>
                            {departmentsList.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        {/* Status Filter */}
                        <div className="flex flex-col gap-4">
                          <label className="font-bold text-[11px] text-text-secondary uppercase">Status</label>
                          <select
                            value={activeStatusFilter}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="h-36 px-8 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 rounded-control focus:outline-none text-[12px]"
                          >
                            <option value="all">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Clear Button */}
                    <button
                      onClick={clearFilters}
                      className="w-full h-34 bg-bg dark:bg-zinc-800 hover:bg-border/60 text-[11px] font-bold rounded-control transition-all cursor-pointer border border-border/80 dark:border-zinc-700 mt-4 text-text-secondary dark:text-zinc-300"
                    >
                      Reset Filters
                    </button>
                  </PopoverPanel>
                </Popover>

                {/* Reset helper display */}
                {(activeStatusFilter !== 'all' || 
                  activeTypeFilter !== 'all' || 
                  activeRoleFilter !== 'all' || 
                  activeDeptFilter !== 'all' || 
                  searchParams.get('q')) && (
                  <button 
                    onClick={clearFilters}
                    className="text-[11px] font-bold text-primary hover:underline focus:outline-none cursor-pointer"
                  >
                    Clear Active Filters
                  </button>
                )}
              </div>

              {/* Sorting Menu Dropdown */}
              <Menu as="div" className="relative">
                <MenuButton className="h-36 px-12 border border-border dark:border-zinc-800 rounded-control bg-card text-[12px] font-bold text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-bg dark:hover:bg-zinc-850 transition-all flex items-center gap-6 focus:outline-none cursor-pointer">
                  <ArrowUpDown size={14} />
                  Sort
                </MenuButton>

                <MenuItems 
                  anchor="bottom end"
                  className="w-180 mt-8 origin-top-right rounded-card border border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 p-6 shadow-xl focus:outline-none z-30 text-[12px] font-semibold text-text-primary dark:text-zinc-200"
                >
                  <div className="flex flex-col gap-2">
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => handleSortChange('name_asc')}
                          className={`w-full text-left px-10 py-8 rounded-control transition-all ${
                            activeSort === 'name_asc' ? 'text-primary bg-primary/5' : focus ? 'bg-bg dark:bg-zinc-800' : ''
                          }`}
                        >
                          Name: A to Z
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => handleSortChange('name_desc')}
                          className={`w-full text-left px-10 py-8 rounded-control transition-all ${
                            activeSort === 'name_desc' ? 'text-primary bg-primary/5' : focus ? 'bg-bg dark:bg-zinc-800' : ''
                          }`}
                        >
                          Name: Z to A
                        </button>
                      )}
                    </MenuItem>
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={() => handleSortChange('newest')}
                          className={`w-full text-left px-10 py-8 rounded-control transition-all ${
                            activeSort === 'newest' ? 'text-primary bg-primary/5' : focus ? 'bg-bg dark:bg-zinc-800' : ''
                          }`}
                        >
                          Newest First
                        </button>
                      )}
                    </MenuItem>
                  </div>
                </MenuItems>
              </Menu>
            </div>

            {/* Nested Outlet Render (with fade transition) */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="w-full flex flex-col"
            >
              <Outlet context={{ searchParams, departmentsList }} />
            </motion.div>

          </motion.div>
        </main>
      </div>

      {/* Shared creation modals */}
      <AddDepartmentModal
        isOpen={isDeptOpen}
        onClose={() => setIsDeptOpen(false)}
        existingDepts={departmentsList}
      />

      <AddCategoryModal
        isOpen={isCatOpen}
        onClose={() => setIsCatOpen(false)}
      />

      <InviteEmployeeModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        departments={departmentsList}
      />

    </div>
  )
}

export default OrganizationLayout

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  Package,
  UserCheck,
  Calendar,
  Wrench,
  ShieldAlert,
  FileBarChart2,
  Bell,
  Settings,
  Search,
  MessageSquare,
  ChevronDown,
  Plus,
  LogOut,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Sparkles,
  Globe,
  Activity,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react'
import type { UserProfile } from '../lib/auth'

interface ExecutiveDashboardProps {
  userProfile: UserProfile;
  onSignOut: () => void;
}

// ----------------------------------------------------
// Mock Initial Database Types & Data
// ----------------------------------------------------
interface Asset {
  id: string;
  name: string;
  tag: string;
  category: 'Laptops' | 'Vehicles' | 'Office Space' | 'Licenses' | 'Servers';
  department: 'Engineering' | 'Sales' | 'HR' | 'Marketing' | 'Operations';
  status: 'Available' | 'Allocated' | 'Maintenance' | 'Overdue';
  value: number;
  assignedTo: string | null;
  dateAdded: string;
}

interface Allocation {
  id: string;
  assetId: string;
  assetName: string;
  employeeName: string;
  department: string;
  allocatedDate: string;
  returnDate: string;
  status: 'Active' | 'Overdue' | 'Returned';
}

interface Booking {
  id: string;
  resourceName: string;
  bookedBy: string;
  date: string;
  timeSlot: string;
  status: 'Active' | 'Completed';
}

interface MaintenanceTicket {
  id: string;
  assetId: string;
  assetName: string;
  issue: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Resolved';
  cost: number;
  reportedAt: string;
}

interface AuditIssue {
  id: string;
  assetTag: string;
  assetName: string;
  finding: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Open' | 'Resolved';
}

interface ActivityLog {
  id: string;
  type: 'asset' | 'allocation' | 'booking' | 'maintenance' | 'audit' | 'transfer';
  message: string;
  user: string;
  time: string;
  timestamp: Date;
}

const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: 'MacBook Pro M3 Max 16"', tag: 'AST-1001', category: 'Laptops', department: 'Engineering', status: 'Allocated', value: 3499, assignedTo: 'Sarah Jenkins', dateAdded: '2026-01-10' },
  { id: '2', name: 'ThinkPad X1 Carbon Gen 11', tag: 'AST-1002', category: 'Laptops', department: 'Sales', status: 'Allocated', value: 1899, assignedTo: 'Michael Scott', dateAdded: '2026-02-15' },
  { id: '3', name: 'Model Y - Logistics Fleet 4', tag: 'AST-1003', category: 'Vehicles', department: 'Operations', status: 'Maintenance', value: 48000, assignedTo: null, dateAdded: '2025-11-20' },
  { id: '4', name: 'Figma Enterprise License - UI Team', tag: 'AST-1004', category: 'Licenses', department: 'Engineering', status: 'Available', value: 1200, assignedTo: null, dateAdded: '2026-03-01' },
  { id: '5', name: 'HQ Conference Room A (12p)', tag: 'AST-1005', category: 'Office Space', department: 'Operations', status: 'Available', value: 15000, assignedTo: null, dateAdded: '2025-05-10' },
  { id: '6', name: 'Dell PowerEdge R760 Server', tag: 'AST-1006', category: 'Servers', department: 'Engineering', status: 'Overdue', value: 12500, assignedTo: 'Alex Mercer', dateAdded: '2025-08-12' },
  { id: '7', name: 'iPad Pro 12.9" - Design Lead', tag: 'AST-1007', category: 'Laptops', department: 'Marketing', status: 'Allocated', value: 1299, assignedTo: 'Lana Del', dateAdded: '2026-04-05' },
  { id: '8', name: 'Creative Cloud All Apps', tag: 'AST-1008', category: 'Licenses', department: 'Marketing', status: 'Available', value: 960, assignedTo: null, dateAdded: '2026-01-22' },
  { id: '9', name: 'Salesforce CRM License', tag: 'AST-1009', category: 'Licenses', department: 'Sales', status: 'Allocated', value: 1800, assignedTo: 'Jim Halpert', dateAdded: '2026-02-01' },
  { id: '10', name: 'Vite Premium Hosting node', tag: 'AST-1010', category: 'Servers', department: 'Engineering', status: 'Available', value: 4500, assignedTo: null, dateAdded: '2026-05-18' }
]

const INITIAL_ALLOCATIONS: Allocation[] = [
  { id: 'all-1', assetId: '1', assetName: 'MacBook Pro M3 Max 16"', employeeName: 'Sarah Jenkins', department: 'Engineering', allocatedDate: '2026-01-11', returnDate: '2026-12-11', status: 'Active' },
  { id: 'all-2', assetId: '2', assetName: 'ThinkPad X1 Carbon Gen 11', employeeName: 'Michael Scott', department: 'Sales', allocatedDate: '2026-02-16', returnDate: '2026-08-16', status: 'Active' },
  { id: 'all-3', assetId: '6', assetName: 'Dell PowerEdge R760 Server', employeeName: 'Alex Mercer', department: 'Engineering', allocatedDate: '2025-08-13', returnDate: '2026-07-01', status: 'Overdue' }
]

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'bk-1', resourceName: 'HQ Conference Room A (12p)', bookedBy: 'Sarah Jenkins', date: '2026-07-12', timeSlot: '10:00 - 11:30', status: 'Active' },
  { id: 'bk-2', resourceName: 'HQ Conference Room A (12p)', bookedBy: 'Dwight Schrute', date: '2026-07-12', timeSlot: '14:00 - 15:00', status: 'Active' }
]

const INITIAL_MAINTENANCE: MaintenanceTicket[] = [
  { id: 'mnt-1', assetId: '3', assetName: 'Model Y - Logistics Fleet 4', issue: 'Brake pad replacement & tire rotation', priority: 'High', status: 'In Progress', cost: 650, reportedAt: '2026-07-12' },
  { id: 'mnt-2', assetId: '6', assetName: 'Dell PowerEdge R760 Server', issue: 'Power supply unit fault', priority: 'High', status: 'Pending', cost: 350, reportedAt: '2026-07-12' }
]

const INITIAL_AUDITS: AuditIssue[] = [
  { id: 'aud-1', assetTag: 'AST-1006', assetName: 'Dell PowerEdge R760 Server', finding: 'Missing physical asset tag label', severity: 'Warning', status: 'Open' },
  { id: 'aud-2', assetTag: 'AST-1003', assetName: 'Model Y - Logistics Fleet 4', finding: 'Insurance certificate expired last week', severity: 'Critical', status: 'Open' },
  { id: 'aud-3', assetTag: 'AST-1001', assetName: 'MacBook Pro M3 Max 16"', finding: 'Remote MDM agent inactive for 30 days', severity: 'Warning', status: 'Open' }
]

const INITIAL_ACTIVITIES: ActivityLog[] = [
  { id: 'act-1', type: 'asset', message: 'New Server asset added: Vite Premium Hosting node', user: 'System Admin', time: '10 mins ago', timestamp: new Date(Date.now() - 10 * 60 * 1000) },
  { id: 'act-2', type: 'maintenance', message: 'Raised High Priority ticket for Dell PowerEdge R760 Server', user: 'Sarah Jenkins', time: '42 mins ago', timestamp: new Date(Date.now() - 42 * 60 * 1000) },
  { id: 'act-3', type: 'booking', message: 'Resource reserved: HQ Conference Room A for Sarah Jenkins', user: 'Sarah Jenkins', time: '1 hour ago', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
  { id: 'act-4', type: 'allocation', message: 'Asset assigned: ThinkPad X1 Carbon Gen 11 to Michael Scott', user: 'Asset Manager', time: '3 hours ago', timestamp: new Date(Date.now() - 180 * 60 * 1000) },
  { id: 'act-5', type: 'audit', message: 'Audit raised: Insurance certificate expired on Model Y Fleet 4', user: 'Compliance Officer', time: '5 hours ago', timestamp: new Date(Date.now() - 300 * 60 * 1000) }
]

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ userProfile, onSignOut }) => {
  // ----------------------------------------------------
  // Dashboard & Navigation States
  // ----------------------------------------------------
  const [activeTab, setActiveTab] = useState<string>('Dashboard')
  const [activeWorkspace, setActiveWorkspace] = useState<string>('Main HQ Workspace')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  // Dropdown menus
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState<boolean>(false)
  const [showNotificationsMenu, setShowNotificationsMenu] = useState<boolean>(false)
  const [showMessagesMenu, setShowMessagesMenu] = useState<boolean>(false)
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false)
  const [showQuickCreateMenu, setShowQuickCreateMenu] = useState<boolean>(false)

  // Drawer / Modal overlay controllers
  const [activeDrawer, setActiveDrawer] = useState<'register' | 'allocate' | 'book' | 'maintenance' | 'audit' | null>(null)

  // Toast Notifications State
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'error' | 'info'; message: string }[]>([])

  // Live Mock Database
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [allocations, setAllocations] = useState<Allocation[]>(INITIAL_ALLOCATIONS)
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS)
  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>(INITIAL_MAINTENANCE)
  const [auditIssues, setAuditIssues] = useState<AuditIssue[]>(INITIAL_AUDITS)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITIES)

  // ----------------------------------------------------
  // Form submission state hooks
  // ----------------------------------------------------
  // Register Asset Form
  const [regName, setRegName] = useState('')
  const [regCategory, setRegCategory] = useState<'Laptops' | 'Vehicles' | 'Office Space' | 'Licenses' | 'Servers'>('Laptops')
  const [regDept, setRegDept] = useState<'Engineering' | 'Sales' | 'HR' | 'Marketing' | 'Operations'>('Engineering')
  const [regValue, setRegValue] = useState('')
  const [regStatus, setRegStatus] = useState<'Available' | 'Allocated' | 'Maintenance'>('Available')

  // Allocate Asset Form
  const [allocAssetId, setAllocAssetId] = useState('')
  const [allocEmployee, setAllocEmployee] = useState('')
  const [allocDept, setAllocDept] = useState<'Engineering' | 'Sales' | 'HR' | 'Marketing' | 'Operations'>('Engineering')
  const [allocReturnDate, setAllocReturnDate] = useState('')

  // Book Resource Form
  const [bookResource, setBookResource] = useState('HQ Conference Room A (12p)')
  const [bookEmployee, setBookEmployee] = useState('')
  const [bookTimeSlot, setBookTimeSlot] = useState('09:00 - 10:00')

  // Raise Maintenance Form
  const [maintAssetId, setMaintAssetId] = useState('')
  const [maintIssue, setMaintIssue] = useState('')
  const [maintPriority, setMaintPriority] = useState<'High' | 'Medium' | 'Low'>('Medium')

  // Run Audit Form
  const [auditScope, setAuditScope] = useState('All Assets')
  const [auditAuditor, setAuditAuditor] = useState('')
  const [auditFindings, setAuditFindings] = useState('')

  // Helper to add notification toasts
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // ----------------------------------------------------
  // Calculated KPIs
  // ----------------------------------------------------
  const kpiStats = useMemo(() => {
    const available = assets.filter((a) => a.status === 'Available').length
    const allocated = assets.filter((a) => a.status === 'Allocated').length
    const maintenanceToday = maintenance.filter((m) => m.status !== 'Resolved').length
    const overdueCount = assets.filter((a) => a.status === 'Overdue').length
    const auditIssuesCount = auditIssues.filter((a) => a.status === 'Open').length
    const activeBookingsCount = bookings.filter((b) => b.status === 'Active').length
    const upcomingReturnsCount = allocations.filter((al) => al.status === 'Active').length // mock representation
    const pendingTransfers = 15 // Mock fixed statistic from design

    return {
      available,
      allocated,
      maintenanceToday,
      upcomingReturnsCount,
      pendingTransfers,
      activeBookingsCount,
      overdueCount,
      auditIssuesCount
    }
  }, [assets, allocations, bookings, maintenance, auditIssues])

  // ----------------------------------------------------
  // Form Submission Handlers
  // ----------------------------------------------------
  const handleRegisterAsset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || !regValue) {
      addToast('error', 'Please fill out all fields.')
      return
    }

    const tag = `AST-${Math.floor(1000 + Math.random() * 9000)}`
    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      name: regName,
      tag,
      category: regCategory,
      department: regDept,
      status: regStatus,
      value: Number(regValue),
      assignedTo: null,
      dateAdded: new Date().toISOString().split('T')[0]
    }

    setAssets((prev) => [newAsset, ...prev])
    setActivityLogs((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'asset',
        message: `Registered new asset: ${newAsset.name} (${newAsset.tag})`,
        user: userProfile.full_name,
        time: 'Just now',
        timestamp: new Date()
      },
      ...prev
    ])

    addToast('success', `Asset "${regName}" registered successfully!`)
    setActiveDrawer(null)
    // Reset form
    setRegName('')
    setRegValue('')
    setRegStatus('Available')
  }

  const handleAllocateAsset = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allocAssetId || !allocEmployee.trim() || !allocReturnDate) {
      addToast('error', 'Please select an asset and supply employee details.')
      return
    }

    const asset = assets.find((a) => a.id === allocAssetId)
    if (!asset) return

    // Update asset status
    setAssets((prev) =>
      prev.map((a) => (a.id === allocAssetId ? { ...a, status: 'Allocated', assignedTo: allocEmployee } : a))
    )

    // Add allocation
    const newAllocation: Allocation = {
      id: `all-${Math.random().toString(36).substr(2, 9)}`,
      assetId: allocAssetId,
      assetName: asset.name,
      employeeName: allocEmployee,
      department: allocDept,
      allocatedDate: new Date().toISOString().split('T')[0],
      returnDate: allocReturnDate,
      status: 'Active'
    }

    setAllocations((prev) => [newAllocation, ...prev])
    setActivityLogs((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'allocation',
        message: `Allocated ${asset.name} to ${allocEmployee} (${allocDept})`,
        user: userProfile.full_name,
        time: 'Just now',
        timestamp: new Date()
      },
      ...prev
    ])

    addToast('success', `Asset "${asset.name}" allocated to ${allocEmployee}!`)
    setActiveDrawer(null)
    setAllocAssetId('')
    setAllocEmployee('')
    setAllocReturnDate('')
  }

  const handleBookResource = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookEmployee.trim()) {
      addToast('error', 'Please supply employee name for booking.')
      return
    }

    const newBooking: Booking = {
      id: `bk-${Math.random().toString(36).substr(2, 9)}`,
      resourceName: bookResource,
      bookedBy: bookEmployee,
      date: new Date().toISOString().split('T')[0],
      timeSlot: bookTimeSlot,
      status: 'Active'
    }

    setBookings((prev) => [newBooking, ...prev])
    setActivityLogs((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'booking',
        message: `Booked "${bookResource}" for ${bookEmployee} (${bookTimeSlot})`,
        user: userProfile.full_name,
        time: 'Just now',
        timestamp: new Date()
      },
      ...prev
    ])

    addToast('success', `Booked ${bookResource} for ${bookEmployee}!`)
    setActiveDrawer(null)
    setBookEmployee('')
  }

  const handleRaiseMaintenance = (e: React.FormEvent) => {
    e.preventDefault()
    if (!maintAssetId || !maintIssue.trim()) {
      addToast('error', 'Please select an asset and write the issue description.')
      return
    }

    const asset = assets.find((a) => a.id === maintAssetId)
    if (!asset) return

    // Update asset status to Maintenance
    setAssets((prev) =>
      prev.map((a) => (a.id === maintAssetId ? { ...a, status: 'Maintenance' } : a))
    )

    const newTicket: MaintenanceTicket = {
      id: `mnt-${Math.random().toString(36).substr(2, 9)}`,
      assetId: maintAssetId,
      assetName: asset.name,
      issue: maintIssue,
      priority: maintPriority,
      status: 'Pending',
      cost: 0,
      reportedAt: new Date().toISOString().split('T')[0]
    }

    setMaintenance((prev) => [newTicket, ...prev])
    setActivityLogs((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'maintenance',
        message: `Maintenance raised for ${asset.name}: ${maintIssue}`,
        user: userProfile.full_name,
        time: 'Just now',
        timestamp: new Date()
      },
      ...prev
    ])

    addToast('success', `Maintenance ticket raised for ${asset.name}!`)
    setActiveDrawer(null)
    setMaintAssetId('')
    setMaintIssue('')
    setMaintPriority('Medium')
  }

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!auditAuditor.trim()) {
      addToast('error', 'Please specify the lead auditor.')
      return
    }

    // Generate random finding if findings are empty
    const findingText = auditFindings.trim() || 'No discrepancies found during standard inventory count.'
    const isIssueFlagged = auditFindings.trim().length > 0

    if (isIssueFlagged) {
      const newIssue: AuditIssue = {
        id: `aud-${Math.random().toString(36).substr(2, 9)}`,
        assetTag: 'AST-' + Math.floor(1000 + Math.random() * 9000),
        assetName: 'Various Assets - ' + auditScope,
        finding: findingText,
        severity: 'Warning',
        status: 'Open'
      }
      setAuditIssues((prev) => [newIssue, ...prev])
    }

    setActivityLogs((prev) => [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'audit',
        message: `Inventory Audit ran on scope "${auditScope}" by ${auditAuditor}. ${isIssueFlagged ? 'Issues flagged.' : 'Passed.'}`,
        user: userProfile.full_name,
        time: 'Just now',
        timestamp: new Date()
      },
      ...prev
    ])

    addToast('success', `Audit executed. Results logged to timeline.`)
    setActiveDrawer(null)
    setAuditAuditor('')
    setAuditFindings('')
  }

  // Filter logs via global search
  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activityLogs
    const q = searchQuery.toLowerCase()
    return activityLogs.filter(
      (act) =>
        act.message.toLowerCase().includes(q) ||
        act.user.toLowerCase().includes(q) ||
        act.type.toLowerCase().includes(q)
    )
  }, [activityLogs, searchQuery])

  // Filter assets via search query for selection lists
  const availableAssetsList = useMemo(() => {
    return assets.filter((a) => a.status === 'Available')
  }, [assets])

  return (
    <div className={`min-h-screen font-body flex transition-colors duration-200 ${isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-bg text-text-primary'}`}>
      
      {/* Toast Alert Banner Stack */}
      <div className="fixed top-24 right-24 z-50 flex flex-col gap-16 w-80">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-16 rounded-control border shadow-soft flex items-start gap-12 text-[13px] font-medium leading-relaxed backdrop-blur-md ${
                t.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : t.type === 'error'
                  ? 'bg-danger/10 border-danger/20 text-danger dark:text-rose-400'
                  : 'bg-info/10 border-info/20 text-info dark:text-sky-400'
              }`}
            >
              {t.type === 'success' && <CheckCircle2 size={16} className="mt-[2px] flex-shrink-0" />}
              {t.type === 'error' && <AlertCircle size={16} className="mt-[2px] flex-shrink-0" />}
              {t.type === 'info' && <Activity size={16} className="mt-[2px] flex-shrink-0" />}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ----------------------------------------------------
          Sidebar Navigation Panel (Odoo Style)
          ---------------------------------------------------- */}
      <aside className="w-240 border-r border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div className="flex flex-col gap-32 p-24 pb-8 overflow-y-auto flex-1">
          {/* Logo Brand area */}
          <div className="flex flex-col gap-4 select-none">
            <div className="flex items-center gap-12">
              <svg className="w-28 h-28 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="text-[28px] font-heading font-bold text-primary dark:text-purple-300 leading-none">AssetFlow</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary dark:text-zinc-500 pl-4">Enterprise ERP</span>
          </div>

          {/* Quick Action Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickCreateMenu(!showQuickCreateMenu)}
              className="w-full bg-primary text-white hover:bg-primary/95 transition-all text-[13px] font-semibold h-44 rounded-control shadow-soft flex items-center justify-center gap-8 active:scale-[0.98] focus:outline-none cursor-pointer"
            >
              <Plus size={16} />
              <span>Quick Action</span>
            </button>

            <AnimatePresence>
              {showQuickCreateMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowQuickCreateMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-48 left-0 right-0 z-40 bg-card dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-control shadow-lg py-8 flex flex-col"
                  >
                    {[
                      { label: 'Register Asset', action: 'register' },
                      { label: 'Allocate Asset', action: 'allocate' },
                      { label: 'Book Resource', action: 'book' },
                      { label: 'Raise Maintenance', action: 'maintenance' },
                      { label: 'Run Audit', action: 'audit' }
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setActiveDrawer(item.action as any)
                          setShowQuickCreateMenu(false)
                        }}
                        className="px-16 py-10 hover:bg-bg dark:hover:bg-zinc-700 text-left text-[13px] font-medium text-text-primary dark:text-zinc-200 transition-colors focus:outline-none"
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-4">
            {[
              { name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { name: 'Organization', icon: <Building2 size={18} /> },
              { name: 'Assets', icon: <Package size={18} /> },
              { name: 'Allocation', icon: <UserCheck size={18} /> },
              { name: 'Bookings', icon: <Calendar size={18} /> },
              { name: 'Maintenance', icon: <Wrench size={18} /> },
              { name: 'Audit', icon: <ShieldAlert size={18} /> },
              { name: 'Reports', icon: <FileBarChart2 size={18} /> },
              { name: 'Notifications', icon: <Bell size={18} /> },
              { name: 'Settings', icon: <Settings size={18} /> }
            ].map((tab) => {
              const isActive = activeTab === tab.name
              return (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name)
                    addToast('info', `Navigated to ${tab.name} view`)
                  }}
                  className={`flex items-center gap-12 px-12 h-40 rounded-control transition-all duration-[120ms] text-[13px] font-medium border-l-[3px] focus:outline-none ${
                    isActive
                      ? 'bg-primary/5 text-primary border-primary font-semibold dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-300'
                      : 'text-text-secondary dark:text-zinc-400 border-transparent hover:text-text-primary dark:hover:text-zinc-200 hover:bg-bg dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className={isActive ? 'text-primary dark:text-purple-300' : 'text-text-secondary dark:text-zinc-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-24 border-t border-border dark:border-zinc-800 flex flex-col gap-12">
          <div className="flex items-center gap-12 select-none">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[12px] font-bold dark:bg-purple-900/30 dark:text-purple-300">
              {userProfile.full_name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-semibold text-text-primary dark:text-zinc-200 truncate">{userProfile.full_name}</span>
              <span className="text-[11px] text-text-secondary dark:text-zinc-500 truncate">{userProfile.role}</span>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-8 text-[13px] text-text-secondary dark:text-zinc-400 hover:text-danger dark:hover:text-red-400 transition-colors w-full py-8 focus:outline-none font-medium cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ----------------------------------------------------
          Main Layout Page Content Container
          ---------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* ----------------------------------------------------
            Top Header Panel (Stripe Style)
            ---------------------------------------------------- */}
        <header className="h-72 border-b border-border dark:border-zinc-800 bg-card dark:bg-zinc-900 flex items-center justify-between px-24 md:px-32 sticky top-0 z-20 shadow-sm">
          
          {/* Breadcrumb + Workspace Selector */}
          <div className="flex items-center gap-16 text-[13px] font-medium text-text-secondary dark:text-zinc-400 select-none">
            <div className="relative">
              <button
                onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
                className="flex items-center gap-6 px-10 py-6 hover:bg-bg dark:hover:bg-zinc-800 rounded-control transition-colors font-semibold text-text-primary dark:text-zinc-200 focus:outline-none"
              >
                <Globe size={15} className="text-primary dark:text-purple-400" />
                <span>{activeWorkspace}</span>
                <ChevronDown size={14} className="mt-[1px]" />
              </button>

              <AnimatePresence>
                {showWorkspaceMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowWorkspaceMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="absolute top-36 left-0 z-40 w-200 bg-card dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-control shadow-lg py-8 flex flex-col"
                    >
                      {['Main HQ Workspace', 'Berlin Tech Hub', 'APAC Logistics Center'].map((w) => (
                        <button
                          key={w}
                          onClick={() => {
                            setActiveWorkspace(w)
                            setShowWorkspaceMenu(false)
                            addToast('success', `Switched to ${w}`)
                          }}
                          className="px-16 py-8 hover:bg-bg dark:hover:bg-zinc-700 text-left text-[13px] font-medium text-text-primary dark:text-zinc-200 transition-colors"
                        >
                          {w}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <ChevronRight size={14} className="text-border dark:text-zinc-700" />
            <span className="text-text-primary dark:text-zinc-200 font-semibold">{activeTab}</span>
          </div>

          {/* Right Header Navigation Panel */}
          <div className="flex items-center gap-16">
            
            {/* Global Search Bar */}
            <div className="relative w-180 md:w-280 hidden sm:block">
              <span className="absolute left-12 top-[50%] -translate-y-[50%] text-text-secondary dark:text-zinc-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs, actions, assets..."
                className="w-full h-40 bg-bg dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-full pl-36 pr-16 text-[13px] text-text-primary dark:text-zinc-200 placeholder-text-secondary dark:placeholder-zinc-500 focus-ring-glow transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-12 top-[50%] -translate-y-[50%] text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Action Button for Mobile Devices */}
            <button
              onClick={() => setActiveDrawer('register')}
              className="sm:hidden p-8 hover:bg-bg dark:hover:bg-zinc-800 rounded-full text-text-secondary dark:text-zinc-300 focus:outline-none"
              title="Quick Create"
            >
              <Plus size={20} />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-8 hover:bg-bg dark:hover:bg-zinc-800 rounded-full text-text-secondary dark:text-zinc-300 focus:outline-none cursor-pointer"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
            </button>

            {/* Notifications Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className="p-8 hover:bg-bg dark:hover:bg-zinc-800 rounded-full text-text-secondary dark:text-zinc-300 focus:outline-none relative cursor-pointer"
              >
                <Bell size={18} />
                {auditIssues.length > 0 && (
                  <span className="absolute top-6 right-6 w-8 h-8 rounded-full bg-danger animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotificationsMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowNotificationsMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-40 w-320 bg-card dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-card shadow-lg py-12 z-40"
                    >
                      <div className="px-16 pb-8 border-b border-border dark:border-zinc-700 flex justify-between items-center">
                        <span className="text-[13px] font-bold text-text-primary dark:text-zinc-100">Audit & Alerts ({auditIssues.length})</span>
                        <span className="text-[11px] text-primary dark:text-purple-300 font-semibold cursor-pointer">Mark all read</span>
                      </div>
                      <div className="max-h-240 overflow-y-auto flex flex-col pt-8">
                        {auditIssues.slice(0, 3).map((issue) => (
                          <div key={issue.id} className="px-16 py-10 hover:bg-bg dark:hover:bg-zinc-700 flex items-start gap-12 border-b border-border/40 dark:border-zinc-700/40 last:border-b-0">
                            <span className="w-8 h-8 mt-6 rounded-full bg-danger shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12px] font-semibold text-text-primary dark:text-zinc-200 truncate">{issue.finding}</span>
                              <span className="text-[10px] text-text-secondary dark:text-zinc-500 mt-2">{issue.assetName} • Status: {issue.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Messages Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowMessagesMenu(!showMessagesMenu)}
                className="p-8 hover:bg-bg dark:hover:bg-zinc-800 rounded-full text-text-secondary dark:text-zinc-300 focus:outline-none relative cursor-pointer"
              >
                <MessageSquare size={18} />
                <span className="absolute top-6 right-6 w-8 h-8 rounded-full bg-info" />
              </button>

              <AnimatePresence>
                {showMessagesMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowMessagesMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-40 w-320 bg-card dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-card shadow-lg py-12 z-40"
                    >
                      <div className="px-16 pb-8 border-b border-border dark:border-zinc-700 flex justify-between items-center">
                        <span className="text-[13px] font-bold text-text-primary dark:text-zinc-100">Messages (1)</span>
                        <span className="text-[11px] text-primary dark:text-purple-300 font-semibold cursor-pointer">New message</span>
                      </div>
                      <div className="p-16 flex items-start gap-12 hover:bg-bg dark:hover:bg-zinc-700 transition-colors">
                        <div className="w-32 h-32 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-[12px]">
                          AM
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-semibold text-text-primary dark:text-zinc-200">Asset Manager</span>
                          <span className="text-[11px] text-text-secondary dark:text-zinc-400 mt-2 truncate">The model Y insurance documents have been updated.</span>
                          <span className="text-[9px] text-text-secondary mt-4">2 hours ago</span>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar & Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-36 h-36 rounded-full bg-primary/10 dark:bg-purple-900/30 flex items-center justify-center text-primary dark:text-purple-300 font-bold border border-border dark:border-zinc-700 hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
              >
                {userProfile.full_name.charAt(0)}
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-44 w-220 bg-card dark:bg-zinc-800 border border-border dark:border-zinc-700 rounded-card shadow-lg py-8 z-40 select-none"
                    >
                      <div className="px-16 py-10 border-b border-border dark:border-zinc-700 flex flex-col">
                        <span className="text-[13px] font-bold text-text-primary dark:text-zinc-100 truncate">{userProfile.full_name}</span>
                        <span className="text-[11px] text-text-secondary dark:text-zinc-400 truncate">{userProfile.email}</span>
                      </div>
                      <button
                        onClick={() => {
                          addToast('info', 'Viewing account profile settings')
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-16 py-10 hover:bg-bg dark:hover:bg-zinc-700 text-[13px] font-medium text-text-primary dark:text-zinc-200 transition-colors"
                      >
                        Profile Settings
                      </button>
                      <button
                        onClick={() => {
                          addToast('info', 'Opening enterprise directory')
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-16 py-10 hover:bg-bg dark:hover:bg-zinc-700 text-[13px] font-medium text-text-primary dark:text-zinc-200 transition-colors"
                      >
                        Organization Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false)
                          onSignOut()
                        }}
                        className="w-full text-left px-16 py-10 hover:bg-bg dark:hover:bg-zinc-700 text-[13px] font-medium text-danger hover:text-red-600 dark:hover:text-red-400 transition-colors border-t border-border dark:border-zinc-700"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* ----------------------------------------------------
            Dashboard Main Content Frame
            ---------------------------------------------------- */}
        <main className="p-24 md:p-32 flex flex-col gap-32 max-w-1600 w-full mx-auto">
          
          {/* Welcome Alert Widget (Role Specific) */}
          <div className="bg-gradient-to-r from-primary/10 to-indigo-500/5 dark:from-purple-900/20 dark:to-zinc-900 border border-primary/10 dark:border-purple-500/20 p-20 rounded-card flex flex-col md:flex-row justify-between items-start md:items-center gap-16 shadow-sm select-none">
            <div className="flex items-center gap-16">
              <div className="p-10 bg-primary/10 dark:bg-purple-900/40 rounded-control text-primary dark:text-purple-300">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[16px] font-bold text-text-primary dark:text-zinc-100">Welcome to Executive Control Panel</h2>
                <p className="text-[13px] text-text-secondary dark:text-zinc-400 mt-2">
                  Role: <span className="font-semibold text-primary dark:text-purple-400">{userProfile.role}</span>. Complete visibility over assets, bookings, and compliance.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-8 self-end md:self-auto">
              <span className="text-[12px] bg-white dark:bg-zinc-800 px-12 py-6 rounded-control border border-border dark:border-zinc-700 text-text-secondary dark:text-zinc-400 font-semibold shadow-sm">
                Active System Status: 100% Operational
              </span>
            </div>
          </div>

          {/* ----------------------------------------------------
              Top Section: Large KPI Grid (8 Cards)
              ---------------------------------------------------- */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-24">
            
            {/* Card 1: Available Assets */}
            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-20 rounded-card flex flex-col justify-between hover:shadow-soft transition-all duration-[180ms] group relative overflow-hidden select-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] uppercase tracking-wider text-text-secondary dark:text-zinc-500 font-bold">Available Assets</span>
                  <span className="text-[26px] font-bold text-text-primary dark:text-zinc-100 tracking-tight mt-4">
                    {kpiStats.available}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="p-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-control">
                    <Package size={16} />
                  </span>
                  <span className="text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-6 py-2 rounded-control flex items-center gap-2">
                    <ArrowUpRight size={10} />
                    <span>+2%</span>
                  </span>
                </div>
              </div>
              <div className="mt-16 h-28 w-full">
                {/* SVG Mini Chart Sparkline */}
                <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0 8 Q 25 2, 50 6 T 100 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Allocated Assets */}
            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-20 rounded-card flex flex-col justify-between hover:shadow-soft transition-all duration-[180ms] group relative overflow-hidden select-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] uppercase tracking-wider text-text-secondary dark:text-zinc-500 font-bold">Allocated Assets</span>
                  <span className="text-[26px] font-bold text-text-primary dark:text-zinc-100 tracking-tight mt-4">
                    {kpiStats.allocated}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="p-8 bg-purple-500/10 text-primary dark:text-purple-300 rounded-control">
                    <UserCheck size={16} />
                  </span>
                  <span className="text-[11px] font-bold bg-purple-500/15 text-primary dark:text-purple-300 px-6 py-2 rounded-control flex items-center gap-2">
                    <ArrowUpRight size={10} />
                    <span>+5%</span>
                  </span>
                </div>
              </div>
              <div className="mt-16 h-28 w-full">
                <svg className="w-full h-full text-primary dark:text-purple-300" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0 9 Q 20 6, 40 8 T 80 4 T 100 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Maintenance Today */}
            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-20 rounded-card flex flex-col justify-between hover:shadow-soft transition-all duration-[180ms] group relative overflow-hidden select-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] uppercase tracking-wider text-text-secondary dark:text-zinc-500 font-bold">Maint. Today</span>
                  <span className="text-[26px] font-bold text-text-primary dark:text-zinc-100 tracking-tight mt-4">
                    {kpiStats.maintenanceToday}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="p-8 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-control">
                    <Wrench size={16} />
                  </span>
                  <span className="text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 px-6 py-2 rounded-control">
                    {maintenance.filter(m => m.status === 'Pending').length} Pending
                  </span>
                </div>
              </div>
              <div className="mt-16 h-28 w-full">
                <svg className="w-full h-full text-amber-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0 4 Q 30 8, 60 2 T 100 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 4: Upcoming Returns */}
            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-20 rounded-card flex flex-col justify-between hover:shadow-soft transition-all duration-[180ms] group relative overflow-hidden select-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] uppercase tracking-wider text-text-secondary dark:text-zinc-500 font-bold">Upcoming Returns</span>
                  <span className="text-[26px] font-bold text-text-primary dark:text-zinc-100 tracking-tight mt-4">
                    {kpiStats.upcomingReturnsCount}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="p-8 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 rounded-control">
                    <Clock size={16} />
                  </span>
                  <span className="text-[11px] font-bold bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 px-6 py-2 rounded-control flex items-center gap-2">
                    <ArrowDownRight size={10} />
                    <span>-4%</span>
                  </span>
                </div>
              </div>
              <div className="mt-16 h-28 w-full">
                <svg className="w-full h-full text-zinc-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0 2 Q 25 7, 50 4 T 100 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 5: Pending Transfers */}
            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-20 rounded-card flex flex-col justify-between hover:shadow-soft transition-all duration-[180ms] group relative overflow-hidden select-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] uppercase tracking-wider text-text-secondary dark:text-zinc-500 font-bold">Pending Transfers</span>
                  <span className="text-[26px] font-bold text-text-primary dark:text-zinc-100 tracking-tight mt-4">
                    {kpiStats.pendingTransfers}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="p-8 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-control">
                    <ArrowRightLeft size={16} />
                  </span>
                  <span className="text-[11px] font-bold bg-sky-500/15 text-sky-600 dark:text-sky-400 px-6 py-2 rounded-control">
                    Active
                  </span>
                </div>
              </div>
              <div className="mt-16 h-28 w-full">
                <svg className="w-full h-full text-sky-400" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0 5 Q 33 2, 66 8 T 100 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 6: Active Bookings */}
            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-20 rounded-card flex flex-col justify-between hover:shadow-soft transition-all duration-[180ms] group relative overflow-hidden select-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] uppercase tracking-wider text-text-secondary dark:text-zinc-500 font-bold">Active Bookings</span>
                  <span className="text-[26px] font-bold text-text-primary dark:text-zinc-100 tracking-tight mt-4">
                    {kpiStats.activeBookingsCount}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="p-8 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-control">
                    <Calendar size={16} />
                  </span>
                  <span className="text-[11px] font-bold bg-teal-500/15 text-teal-600 dark:text-teal-400 px-6 py-2 rounded-control flex items-center gap-2">
                    <ArrowUpRight size={10} />
                    <span>+12%</span>
                  </span>
                </div>
              </div>
              <div className="mt-16 h-28 w-full">
                <svg className="w-full h-full text-teal-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0 9 Q 25 5, 50 3 T 100 1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 7: Overdue Assets */}
            <div className="bg-card dark:bg-zinc-900 border border-danger/30 dark:border-red-900/40 p-20 rounded-card flex flex-col justify-between hover:shadow-soft transition-all duration-[180ms] group relative overflow-hidden select-none bg-gradient-to-tr from-transparent to-danger/5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] uppercase tracking-wider text-danger dark:text-red-400 font-bold">Overdue Assets</span>
                  <span className="text-[26px] font-bold text-danger dark:text-red-400 tracking-tight mt-4">
                    {kpiStats.overdueCount}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="p-8 bg-danger/10 text-danger rounded-control">
                    <AlertCircle size={16} />
                  </span>
                  <span className="text-[11px] font-bold bg-danger/15 text-danger px-6 py-2 rounded-control">
                    Action Req.
                  </span>
                </div>
              </div>
              <div className="mt-16 h-28 w-full">
                <svg className="w-full h-full text-danger" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0 3 Q 25 9, 50 2 T 100 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 8: Audit Issues */}
            <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 p-20 rounded-card flex flex-col justify-between hover:shadow-soft transition-all duration-[180ms] group relative overflow-hidden select-none">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-6">
                  <span className="text-[11px] uppercase tracking-wider text-text-secondary dark:text-zinc-500 font-bold">Audit Issues</span>
                  <span className="text-[26px] font-bold text-text-primary dark:text-zinc-100 tracking-tight mt-4">
                    {kpiStats.auditIssuesCount}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-6">
                  <span className="p-8 bg-zinc-500/10 text-text-secondary dark:text-zinc-400 rounded-control">
                    <ShieldAlert size={16} />
                  </span>
                  <span className="text-[11px] font-bold bg-zinc-500/15 text-text-secondary dark:text-zinc-400 px-6 py-2 rounded-control">
                    {auditIssues.filter(i => i.severity === 'Critical').length} Critical
                  </span>
                </div>
              </div>
              <div className="mt-16 h-28 w-full">
                <svg className="w-full h-full text-text-secondary dark:text-zinc-500" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M 0 5 Q 30 2, 60 8 T 100 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

          </section>

          {/* ----------------------------------------------------
              Second Section: Visualizations Grid (Charts & Lists)
              ---------------------------------------------------- */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-24 md:gap-32">
            
            {/* Asset Distribution (Donut style) & Utilization (Bar) - Column 8 */}
            <div className="lg:col-span-8 flex flex-col gap-24 md:gap-32">
              
              {/* Asset Distribution Card */}
              <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card p-24 md:p-32 flex flex-col gap-24 shadow-sm">
                <div className="flex justify-between items-center select-none border-b border-border/60 dark:border-zinc-800/80 pb-16">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[16px] font-bold text-text-primary dark:text-zinc-100">Asset Distribution & Utilization</h3>
                    <p className="text-[12px] text-text-secondary dark:text-zinc-400">Physical stock values and utilization per resource department</p>
                  </div>
                  <span className="text-[11px] font-bold text-primary dark:text-purple-300 bg-primary/5 dark:bg-purple-500/10 px-10 py-6 rounded-control">
                    Value View: $103,417
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                  
                  {/* Custom SVG Donut Graphic */}
                  <div className="flex flex-col items-center justify-center relative select-none">
                    <svg className="w-200 h-200" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-border)" strokeWidth="3" className="dark:stroke-zinc-800" />
                      {/* Segment 1: Laptops (40%) - primary */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="25" />
                      {/* Segment 2: Vehicles (30%) - indigo */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366F1" strokeWidth="3" strokeDasharray="30 70" strokeDashoffset="85" />
                      {/* Segment 3: Servers (15%) - sky */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0EA5E9" strokeWidth="3" strokeDasharray="15 85" strokeDashoffset="115" />
                      {/* Segment 4: Licenses (15%) - emerald */}
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="15 85" strokeDashoffset="130" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-[28px] font-bold text-text-primary dark:text-zinc-100">{assets.length}</span>
                      <span className="text-[10px] uppercase font-bold text-text-secondary dark:text-zinc-500 tracking-wider">Total Assets</span>
                    </div>
                  </div>

                  {/* Legend Table details */}
                  <div className="flex flex-col gap-12 text-[13px]">
                    {[
                      { label: 'Laptops', percentage: '40%', value: '$7,996', colorBg: 'bg-primary' },
                      { label: 'Vehicles', percentage: '30%', value: '$48,000', colorBg: 'bg-indigo-500' },
                      { label: 'Servers', percentage: '15%', value: '$17,000', colorBg: 'bg-sky-500' },
                      { label: 'Licenses & Software', percentage: '15%', value: '$3,960', colorBg: 'bg-emerald-500' }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-6 border-b border-border/40 dark:border-zinc-800/40 last:border-0 select-none">
                        <div className="flex items-center gap-12">
                          <span className={`w-10 h-10 rounded-full ${item.colorBg}`} />
                          <span className="font-medium text-text-primary dark:text-zinc-200">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-16 text-text-secondary dark:text-zinc-400">
                          <span className="font-semibold">{item.percentage}</span>
                          <span>{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Department Utilization & Booking Heatmap side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-24 md:gap-32">
                
                {/* Department Utilization (Horizontal bar chart) */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card p-24 shadow-sm flex flex-col gap-16 select-none">
                  <div className="flex flex-col gap-4 border-b border-border/60 dark:border-zinc-800/80 pb-12">
                    <h4 className="text-[14px] font-bold text-text-primary dark:text-zinc-100">Department Utilization</h4>
                    <p className="text-[11px] text-text-secondary dark:text-zinc-500">Asset utilization percentages by team</p>
                  </div>
                  
                  <div className="flex flex-col gap-16 mt-8">
                    {[
                      { name: 'Engineering', percentage: 88, color: 'bg-primary' },
                      { name: 'Operations', percentage: 92, color: 'bg-indigo-500' },
                      { name: 'Sales', percentage: 75, color: 'bg-sky-500' },
                      { name: 'Marketing', percentage: 64, color: 'bg-emerald-500' },
                      { name: 'Human Resources', percentage: 50, color: 'bg-amber-500' }
                    ].map((dept) => (
                      <div key={dept.name} className="flex flex-col gap-6 text-[12px]">
                        <div className="flex justify-between font-semibold text-text-primary dark:text-zinc-200">
                          <span>{dept.name}</span>
                          <span>{dept.percentage}%</span>
                        </div>
                        <div className="h-8 w-full bg-border dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${dept.color}`} style={{ width: `${dept.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Heatmap (Weekly Schedule density) */}
                <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card p-24 shadow-sm flex flex-col gap-16 select-none">
                  <div className="flex flex-col gap-4 border-b border-border/60 dark:border-zinc-800/80 pb-12">
                    <h4 className="text-[14px] font-bold text-text-primary dark:text-zinc-100">Booking Heatmap</h4>
                    <p className="text-[11px] text-text-secondary dark:text-zinc-500">Resource reservations by weekday & hour</p>
                  </div>

                  <div className="flex flex-col gap-8 mt-8">
                    <div className="grid grid-cols-8 gap-4 text-[9px] uppercase font-bold text-text-secondary dark:text-zinc-500 text-center">
                      <span></span>
                      <span>M</span>
                      <span>T</span>
                      <span>W</span>
                      <span>T</span>
                      <span>F</span>
                      <span>S</span>
                      <span>S</span>
                    </div>

                    {[
                      { hour: '09:00', density: [4, 6, 2, 8, 3, 0, 0] },
                      { hour: '11:00', density: [7, 9, 5, 6, 4, 1, 0] },
                      { hour: '13:00', density: [2, 3, 1, 4, 2, 0, 0] },
                      { hour: '15:00', density: [8, 7, 9, 8, 5, 2, 0] },
                      { hour: '17:00', density: [5, 4, 3, 6, 4, 1, 0] }
                    ].map((row) => (
                      <div key={row.hour} className="grid grid-cols-8 gap-4 items-center">
                        <span className="text-[9px] font-semibold text-text-secondary dark:text-zinc-500 text-right pr-6">{row.hour}</span>
                        {row.density.map((val, idx) => {
                          let color = 'bg-zinc-100 dark:bg-zinc-800'
                          if (val > 7) color = 'bg-primary dark:bg-purple-600'
                          else if (val > 4) color = 'bg-primary/60 dark:bg-purple-500/60'
                          else if (val > 0) color = 'bg-primary/20 dark:bg-purple-500/20'

                          return (
                            <div
                              key={idx}
                              className={`h-16 rounded-[4px] ${color} hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer`}
                              title={`${val} active bookings at this hour`}
                            />
                          )
                        })}
                      </div>
                    ))}
                    
                    <div className="flex justify-end gap-12 mt-8 text-[9px] font-bold text-text-secondary dark:text-zinc-500">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-[2px] bg-zinc-100 dark:bg-zinc-800" />
                        <span>Idle</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-[2px] bg-primary/20" />
                        <span>Low</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-[2px] bg-primary" />
                        <span>Peak</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Maintenance Trend Line chart */}
              <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card p-24 md:p-32 shadow-sm flex flex-col gap-16 select-none">
                <div className="flex justify-between items-center border-b border-border/60 dark:border-zinc-800/80 pb-16">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[15px] font-bold text-text-primary dark:text-zinc-100">Maintenance Trend</h4>
                    <p className="text-[12px] text-text-secondary dark:text-zinc-400">Total volume of resolved vs raised tickets (Jan - Jun)</p>
                  </div>
                  <div className="flex gap-16 text-[12px] font-semibold text-text-secondary dark:text-zinc-400">
                    <div className="flex items-center gap-6">
                      <span className="w-10 h-10 rounded-full bg-primary" />
                      <span>Raised</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="w-10 h-10 rounded-full bg-emerald-500" />
                      <span>Resolved</span>
                    </div>
                  </div>
                </div>

                <div className="h-200 mt-16 relative">
                  {/* SVG Wavy Line Graph */}
                  <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient-raised" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="gradient-resolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="600" y2="50" stroke="var(--color-border)" strokeWidth="0.5" className="dark:stroke-zinc-800" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="600" y2="100" stroke="var(--color-border)" strokeWidth="0.5" className="dark:stroke-zinc-800" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="var(--color-border)" strokeWidth="0.5" className="dark:stroke-zinc-800" strokeDasharray="4 4" />
                    
                    {/* Raised Area / Path */}
                    <path d="M 0 160 Q 120 120, 240 140 T 480 60 T 600 80 L 600 200 L 0 200 Z" fill="url(#gradient-raised)" />
                    <path d="M 0 160 Q 120 120, 240 140 T 480 60 T 600 80" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />

                    {/* Resolved Area / Path */}
                    <path d="M 0 180 Q 120 150, 240 170 T 480 90 T 600 110 L 600 200 L 0 200 Z" fill="url(#gradient-resolved)" />
                    <path d="M 0 180 Q 120 150, 240 170 T 480 90 T 600 110" fill="none" stroke="#10B981" strokeWidth="2.5" />
                  </svg>
                  
                  {/* X Axis Months */}
                  <div className="flex justify-between mt-12 text-[10px] font-bold text-text-secondary dark:text-zinc-500 uppercase px-6">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sidebar Column (Column 4) - Recent Activity & Actions */}
            <div className="lg:col-span-4 flex flex-col gap-24 md:gap-32">
              
              {/* Quick Actions Card */}
              <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card p-24 shadow-sm flex flex-col gap-20 select-none">
                <div className="flex flex-col gap-4 border-b border-border/60 dark:border-zinc-800/80 pb-12">
                  <h3 className="text-[15px] font-bold text-text-primary dark:text-zinc-100">Quick Actions</h3>
                  <p className="text-[12px] text-text-secondary dark:text-zinc-400">Launch workflows or trigger operations instantly</p>
                </div>
                
                <div className="flex flex-col gap-12">
                  {[
                    { label: 'Register Asset', desc: 'Add new hardware or licenses', action: 'register', badge: 'New Item' },
                    { label: 'Allocate Asset', desc: 'Assign custody to employees', action: 'allocate', badge: 'Transfer' },
                    { label: 'Book Resource', desc: 'Reserve rooms or project equipment', action: 'book', badge: 'Planner' },
                    { label: 'Raise Maintenance', desc: 'Report issues and request services', action: 'maintenance', badge: 'Support' },
                    { label: 'Run Inventory Audit', desc: 'Execute compliance checklist', action: 'audit', badge: 'Verify' }
                  ].map((act) => (
                    <button
                      key={act.label}
                      onClick={() => setActiveDrawer(act.action as any)}
                      className="w-full p-12 bg-bg dark:bg-zinc-800/60 hover:bg-primary/5 dark:hover:bg-purple-900/10 border border-border/60 dark:border-zinc-800 rounded-control text-left hover:border-primary/30 transition-all group flex items-start gap-12 focus:outline-none cursor-pointer"
                    >
                      <span className="p-8 bg-card dark:bg-zinc-800 border border-border/80 dark:border-zinc-700 rounded-control text-text-secondary group-hover:text-primary dark:group-hover:text-purple-300 transition-colors shrink-0">
                        <Plus size={16} />
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200 group-hover:text-primary dark:group-hover:text-purple-300 transition-colors">{act.label}</span>
                          <span className="text-[9px] font-bold px-6 py-2 rounded-full bg-border dark:bg-zinc-700 text-text-secondary dark:text-zinc-400">{act.badge}</span>
                        </div>
                        <span className="text-[11px] text-text-secondary dark:text-zinc-400 mt-2 line-clamp-1">{act.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alerts & Notifications Section */}
              <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card p-24 shadow-sm flex flex-col gap-20">
                <div className="flex flex-col gap-4 border-b border-border/60 dark:border-zinc-800/80 pb-12 select-none">
                  <h3 className="text-[15px] font-bold text-text-primary dark:text-zinc-100">Operational Health & Alerts</h3>
                  <p className="text-[12px] text-text-secondary dark:text-zinc-400">Issues requiring administrative overview</p>
                </div>

                <div className="flex flex-col gap-12">
                  {/* Transfer request item */}
                  <div className="p-12 border border-border/60 dark:border-zinc-800 bg-bg/40 dark:bg-zinc-900 rounded-control flex items-start gap-12">
                    <span className="p-8 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-control mt-2 shrink-0">
                      <ArrowRightLeft size={16} />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Transfer Request</span>
                      <span className="text-[11px] text-text-secondary dark:text-zinc-400 mt-2">
                        Sarah Jenkins requested to transfer AST-1001 to Jim Halpert.
                      </span>
                      <div className="flex gap-12 mt-12">
                        <button
                          onClick={() => addToast('success', 'Transfer approved')}
                          className="px-10 py-4 bg-primary text-white text-[11px] font-bold rounded-control hover:bg-primary/95 focus:outline-none"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => addToast('info', 'Transfer rejected')}
                          className="px-10 py-4 border border-border text-text-secondary text-[11px] font-bold rounded-control hover:bg-bg focus:outline-none"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Audit Finding alerts list */}
                  {auditIssues.slice(0, 2).map((issue) => (
                    <div key={issue.id} className="p-12 border border-danger/20 bg-danger/5 dark:bg-rose-950/10 rounded-control flex items-start gap-12">
                      <span className="p-8 bg-danger/10 text-danger rounded-control mt-2 shrink-0">
                        <ShieldAlert size={16} />
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-bold text-danger dark:text-rose-400 flex items-center gap-8">
                          <span>Audit Discrepancy</span>
                          <span className="text-[9px] uppercase font-extrabold px-6 py-2 rounded-full bg-danger/10 text-danger">
                            {issue.severity}
                          </span>
                        </span>
                        <span className="text-[11px] text-text-secondary dark:text-zinc-400 mt-2">{issue.finding}</span>
                        <span className="text-[10px] text-text-secondary dark:text-zinc-500 font-semibold mt-6">{issue.assetName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Timeline Card */}
              <div className="bg-card dark:bg-zinc-900 border border-border dark:border-zinc-800 rounded-card p-24 shadow-sm flex flex-col gap-20">
                <div className="flex flex-col gap-4 border-b border-border/60 dark:border-zinc-800/80 pb-12 select-none">
                  <h3 className="text-[15px] font-bold text-text-primary dark:text-zinc-100">Recent Activity Timeline</h3>
                  <p className="text-[12px] text-text-secondary dark:text-zinc-400">Live operational event log for workspace</p>
                </div>

                <div className="flex flex-col gap-16 relative pl-16 border-l border-border dark:border-zinc-800 max-h-360 overflow-y-auto">
                  {filteredActivities.length === 0 ? (
                    <span className="text-[12px] text-text-secondary py-12 italic select-none">No matches found for search.</span>
                  ) : (
                    filteredActivities.map((act) => {
                      let color = 'bg-primary'
                      if (act.type === 'maintenance') color = 'bg-amber-500'
                      if (act.type === 'booking') color = 'bg-teal-500'
                      if (act.type === 'allocation') color = 'bg-indigo-500'
                      if (act.type === 'audit') color = 'bg-danger'

                      return (
                        <div key={act.id} className="relative group text-[12px] select-none">
                          {/* Timeline dot */}
                          <span className={`absolute -left-22 top-4 w-10 h-10 rounded-full ${color} ring-4 ring-card dark:ring-zinc-900`} />
                          
                          <div className="flex flex-col gap-4">
                            <span className="text-[11px] text-text-secondary dark:text-zinc-500 font-semibold">{act.time}</span>
                            <span className="font-semibold text-text-primary dark:text-zinc-200 leading-normal">{act.message}</span>
                            <span className="text-[10px] text-text-secondary dark:text-zinc-500">Triggered by: {act.user}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

            </div>

          </section>

        </main>
      </div>

      {/* ----------------------------------------------------
          Interactive Right Drawer overlays (Framer Motion)
          ---------------------------------------------------- */}
      <AnimatePresence>
        {activeDrawer && (
          <>
            {/* Backdrop cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDrawer(null)}
              className="fixed inset-0 bg-black z-40 cursor-pointer"
            />

            {/* Slide-out Panel body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-[460px] bg-card dark:bg-zinc-900 border-l border-border dark:border-zinc-800 p-32 lg:p-40 z-50 shadow-2xl flex flex-col justify-between overflow-y-auto"
            >
              
              {/* Drawer Content */}
              <div className="flex flex-col gap-32">
                {/* Header title */}
                <div className="flex justify-between items-center border-b border-border/60 pb-16 select-none">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[18px] font-bold text-text-primary dark:text-zinc-100 capitalize">
                      {activeDrawer === 'register' && 'Register Asset'}
                      {activeDrawer === 'allocate' && 'Allocate Asset'}
                      {activeDrawer === 'book' && 'Book Resource'}
                      {activeDrawer === 'maintenance' && 'Raise Maintenance'}
                      {activeDrawer === 'audit' && 'Run Inventory Audit'}
                    </h3>
                    <p className="text-[12px] text-text-secondary dark:text-zinc-400">
                      {activeDrawer === 'register' && 'Add physical equipment or digital licenses to register'}
                      {activeDrawer === 'allocate' && 'Transfer custody of an available asset to an employee'}
                      {activeDrawer === 'book' && 'Submit short-term reservation scheduling'}
                      {activeDrawer === 'maintenance' && 'Raise a request to assign hardware services'}
                      {activeDrawer === 'audit' && 'Log inventory verify inspection and document findings'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveDrawer(null)}
                    className="p-8 hover:bg-bg dark:hover:bg-zinc-800 rounded-full text-text-secondary hover:text-text-primary dark:text-zinc-400 dark:hover:text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form fields depending on selected action */}
                <div className="flex flex-col gap-24">
                  
                  {/* REGISTER ASSET FORM */}
                  {activeDrawer === 'register' && (
                    <form onSubmit={handleRegisterAsset} className="flex flex-col gap-24">
                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Asset Name</label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. MacBook Air M2 13 inch"
                          className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100 placeholder-text-secondary dark:placeholder-zinc-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-16">
                        <div className="flex flex-col gap-8">
                          <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Category</label>
                          <select
                            value={regCategory}
                            onChange={(e) => setRegCategory(e.target.value as any)}
                            className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                          >
                            <option value="Laptops">Laptops</option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="Office Space">Office Space</option>
                            <option value="Licenses">Licenses</option>
                            <option value="Servers">Servers</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-8">
                          <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Department</label>
                          <select
                            value={regDept}
                            onChange={(e) => setRegDept(e.target.value as any)}
                            className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                          >
                            <option value="Engineering">Engineering</option>
                            <option value="Sales">Sales</option>
                            <option value="HR">HR</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operations">Operations</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-16">
                        <div className="flex flex-col gap-8">
                          <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Value ($)</label>
                          <input
                            type="number"
                            required
                            value={regValue}
                            onChange={(e) => setRegValue(e.target.value)}
                            placeholder="e.g. 1499"
                            className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100"
                          />
                        </div>

                        <div className="flex flex-col gap-8">
                          <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Initial Status</label>
                          <select
                            value={regStatus}
                            onChange={(e) => setRegStatus(e.target.value as any)}
                            className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                          >
                            <option value="Available">Available</option>
                            <option value="Allocated">Allocated</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer"
                      >
                        Register Asset
                      </button>
                    </form>
                  )}

                  {/* ALLOCATE ASSET FORM */}
                  {activeDrawer === 'allocate' && (
                    <form onSubmit={handleAllocateAsset} className="flex flex-col gap-24">
                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Select Available Asset</label>
                        <select
                          required
                          value={allocAssetId}
                          onChange={(e) => setAllocAssetId(e.target.value)}
                          className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                        >
                          <option value="">-- Choose Asset --</option>
                          {availableAssetsList.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.name} ({asset.tag}) - ${asset.value}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Employee Name</label>
                        <input
                          type="text"
                          required
                          value={allocEmployee}
                          onChange={(e) => setAllocEmployee(e.target.value)}
                          placeholder="e.g. Dwight Schrute"
                          className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-16">
                        <div className="flex flex-col gap-8">
                          <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Department</label>
                          <select
                            value={allocDept}
                            onChange={(e) => setAllocDept(e.target.value as any)}
                            className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                          >
                            <option value="Engineering">Engineering</option>
                            <option value="Sales">Sales</option>
                            <option value="HR">HR</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operations">Operations</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-8">
                          <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Expected Return Date</label>
                          <input
                            type="date"
                            required
                            value={allocReturnDate}
                            onChange={(e) => setAllocReturnDate(e.target.value)}
                            className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer"
                      >
                        Allocate Asset
                      </button>
                    </form>
                  )}

                  {/* BOOK RESOURCE FORM */}
                  {activeDrawer === 'book' && (
                    <form onSubmit={handleBookResource} className="flex flex-col gap-24">
                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Resource Name</label>
                        <select
                          value={bookResource}
                          onChange={(e) => setBookResource(e.target.value)}
                          className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                        >
                          <option value="HQ Conference Room A (12p)">HQ Conference Room A (12p)</option>
                          <option value="Berlin Standup Cabin B">Berlin Standup Cabin B</option>
                          <option value="Logistics Fleet Model Y">Logistics Fleet Model Y</option>
                          <option value="3D Printer - R&D Office">3D Printer - R&D Office</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Employee Name</label>
                        <input
                          type="text"
                          required
                          value={bookEmployee}
                          onChange={(e) => setBookEmployee(e.target.value)}
                          placeholder="e.g. Pam Beesly"
                          className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100"
                        />
                      </div>

                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Time Slot</label>
                        <select
                          value={bookTimeSlot}
                          onChange={(e) => setBookTimeSlot(e.target.value)}
                          className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                        >
                          <option value="09:00 - 10:00">09:00 - 10:00</option>
                          <option value="10:00 - 11:30">10:00 - 11:30</option>
                          <option value="12:00 - 13:00">12:00 - 13:00</option>
                          <option value="14:00 - 15:00">14:00 - 15:00</option>
                          <option value="16:00 - 17:30">16:00 - 17:30</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer"
                      >
                        Book Resource
                      </button>
                    </form>
                  )}

                  {/* RAISE MAINTENANCE FORM */}
                  {activeDrawer === 'maintenance' && (
                    <form onSubmit={handleRaiseMaintenance} className="flex flex-col gap-24">
                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Select Asset to Service</label>
                        <select
                          required
                          value={maintAssetId}
                          onChange={(e) => setMaintAssetId(e.target.value)}
                          className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                        >
                          <option value="">-- Choose Asset --</option>
                          {assets.map((asset) => (
                            <option key={asset.id} value={asset.id}>
                              {asset.name} ({asset.tag}) - Status: {asset.status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Priority Level</label>
                        <div className="grid grid-cols-3 gap-12">
                          {['Low', 'Medium', 'High'].map((pri) => (
                            <button
                              key={pri}
                              type="button"
                              onClick={() => setMaintPriority(pri as any)}
                              className={`h-40 rounded-control border text-[13px] font-bold transition-all focus:outline-none ${
                                maintPriority === pri
                                  ? 'bg-primary text-white border-primary shadow-sm dark:bg-purple-600 dark:border-purple-600'
                                  : 'bg-bg dark:bg-zinc-800 border-border dark:border-zinc-700 text-text-secondary dark:text-zinc-400 hover:text-text-primary'
                              }`}
                            >
                              {pri}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Issue / Failure Description</label>
                        <textarea
                          required
                          rows={4}
                          value={maintIssue}
                          onChange={(e) => setMaintIssue(e.target.value)}
                          placeholder="Please write diagnostic details (e.g. cracked screen, won't turn on, fan spinning loudly)..."
                          className="p-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100 placeholder-text-secondary resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer"
                      >
                        Raise Maintenance
                      </button>
                    </form>
                  )}

                  {/* RUN INVENTORY AUDIT FORM */}
                  {activeDrawer === 'audit' && (
                    <form onSubmit={handleRunAudit} className="flex flex-col gap-24">
                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Audit Scope Selection</label>
                        <select
                          value={auditScope}
                          onChange={(e) => setAuditScope(e.target.value)}
                          className="h-44 px-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus:outline-none focus:border-primary text-text-primary dark:text-zinc-100"
                        >
                          <option value="All Assets">All Physical Assets</option>
                          <option value="Hardware only">Hardware Laptops & Devices Only</option>
                          <option value="Software Licenses">Software SaaS Subscriptions & Licenses</option>
                          <option value="Logistics Fleet Vehicles">Logistics Fleet Vehicles</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Auditor Name</label>
                        <input
                          type="text"
                          required
                          value={auditAuditor}
                          onChange={(e) => setAuditAuditor(e.target.value)}
                          placeholder="Lead compliance auditor"
                          className="h-44 px-16 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100"
                        />
                      </div>

                      <div className="flex flex-col gap-8">
                        <label className="text-[13px] font-bold text-text-primary dark:text-zinc-200">Discrepancy Findings (Optional)</label>
                        <textarea
                          rows={4}
                          value={auditFindings}
                          onChange={(e) => setAuditFindings(e.target.value)}
                          placeholder="Write down details if any hardware is missing or details are invalid. Leave empty to pass the audit without warnings."
                          className="p-12 border border-border dark:border-zinc-700 bg-bg dark:bg-zinc-800 text-[13px] rounded-control focus-ring-glow text-text-primary dark:text-zinc-100 placeholder-text-secondary resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full h-44 bg-primary text-white hover:bg-primary/95 text-[13px] font-bold rounded-control mt-12 transition-all cursor-pointer"
                      >
                        Run Inventory Audit
                      </button>
                    </form>
                  )}

                </div>
              </div>

              {/* Drawer footer details */}
              <div className="text-center text-[11px] text-text-secondary dark:text-zinc-500 pt-24 select-none border-t border-border/40 dark:border-zinc-800/40 mt-32">
                <span>AssetFlow Enterprise Security Protocol Active</span>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}

export default ExecutiveDashboard

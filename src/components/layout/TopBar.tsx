import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'
import QuickActionMenu from './QuickActionMenu'

export const TopBar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchVal, setSearchVal] = useState('')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [userProfile, setUserProfile] = useState<{ full_name: string; avatar_url?: string } | null>(null)

  // Retrieve user profiles details on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUserProfile(data)
            } else {
              setUserProfile({ full_name: session.user.user_metadata?.full_name || 'User' })
            }
          })
      }
    })
  }, [])

  // Manage dark mode toggles on html tag
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Query notifications count (safe fallback if table does not exist)
  const { data: unreadNotificationsCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) return 0

        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('read', false)

        if (error) return 0
        return count || 0
      } catch {
        return 0
      }
    },
    refetchInterval: 30000 // Refetch every 30s
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchVal.trim()) {
      // Navigate to assets route with search parameter
      navigate(`/assets?search=${encodeURIComponent(searchVal.trim())}`)
    }
  }

  // Dynamic Page Breadcrumbs Title
  const getBreadcrumbName = (path: string) => {
    if (path === '/dashboard') return 'Executive Dashboard'
    if (path.startsWith('/assets')) return 'Assets Management'
    if (path.startsWith('/planner')) return 'Resource Planner'
    if (path.startsWith('/analytics')) return 'Analytics & Reports'
    if (path.startsWith('/settings')) return 'System Settings'
    if (path.startsWith('/organization')) return 'Organization'
    if (path.startsWith('/profile')) return 'User Profile'
    return 'Overview'
  }

  // Initials generator
  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  }

  return (
    <header className="h-[72px] fixed top-0 left-[260px] right-0 bg-bg border-b border-border flex items-center justify-between px-32 select-none z-20">
      
      {/* Left: Global Controlled Search Form */}
      <form onSubmit={handleSearchSubmit} className="relative w-[400px]">
        <div className="absolute left-16 text-text-secondary flex items-center justify-center h-full pointer-events-none">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search..."
          className="w-full h-40 bg-card border border-border rounded-control pl-48 pr-16 text-[14px] text-text-primary placeholder:text-text-secondary/50 transition-all outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15"
        />
      </form>

      {/* Center: Dynamic breadcrumbs */}
      <div className="text-[14px] font-medium flex items-center gap-8">
        <span className="text-text-secondary">Workspace</span>
        <span className="text-text-secondary/50 font-normal select-none">&gt;</span>
        <span className="text-text-primary font-semibold">{getBreadcrumbName(location.pathname)}</span>
      </div>

      {/* Right: Quick Action Dropdown + Theme + Notification Bell + Avatar */}
      <div className="flex items-center gap-16">
        
        {/* Secondary Quick Action Button */}
        <div className="w-[170px]">
          <QuickActionMenu />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-8 border border-border bg-card rounded-control text-text-secondary hover:text-text-primary hover:bg-bg/40 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="p-8 border border-border bg-card rounded-control text-text-secondary hover:text-text-primary hover:bg-bg/40 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-0 w-8 h-8 bg-danger border-[2px] border-card rounded-full" />
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="w-40 h-40 rounded-full border border-border bg-primary/10 flex items-center justify-center overflow-hidden font-semibold text-primary text-[14px] select-none shadow-soft">
          {userProfile?.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile.full_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Remove img element on fail to show initials
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          ) : (
            <span>{getInitials(userProfile?.full_name || 'User')}</span>
          )}
        </div>

      </div>

    </header>
  )
}

export default TopBar

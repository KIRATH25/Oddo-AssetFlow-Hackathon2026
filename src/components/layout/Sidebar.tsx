import { useLocation, Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, Box, Calendar, BarChart3, Settings, Building2, UserCircle2, LogOut } from 'lucide-react'
import QuickActionMenu from './QuickActionMenu'
import { supabase } from '../../lib/supabaseClient'

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname

  const handleSignOut = async () => {
    localStorage.removeItem('assetflow_demo_profile')
    await supabase.auth.signOut()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutGrid size={20} /> },
    { label: 'Assets', path: '/assets', icon: <Box size={20} /> },
    { label: 'Planner', path: '/planner', icon: <Calendar size={20} /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ]

  const bottomItems = [
    { label: 'Organization', path: '/organization', icon: <Building2 size={20} /> },
    { label: 'Profile', path: '/profile', icon: <UserCircle2 size={20} /> },
  ]

  const renderItem = (item: { label: string; path: string; icon: React.ReactNode }) => {
    // Exact path matching or starting path matching for subroutes
    const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path))

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center gap-16 h-44 px-16 rounded-control relative font-medium text-[14px] transition-all group select-none outline-none focus:ring-1 focus:ring-primary/10 cursor-pointer
          ${isActive 
            ? 'bg-primary/8 text-primary font-semibold' 
            : 'text-text-secondary hover:bg-border/40 hover:text-text-primary'
          }
        `}
      >
        {/* Left Border Indicator for Active State (3px wide) */}
        {isActive && (
          <div className="absolute left-0 top-8 bottom-8 w-[3px] bg-primary rounded-r" />
        )}
        <span className={`${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'} transition-colors`}>
          {item.icon}
        </span>
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 bg-bg border-r border-border flex flex-col justify-between p-24 select-none z-30">
      <div className="flex flex-col gap-32">
        {/* Wordmark branding in Caveat font */}
        <div className="flex flex-col gap-8">
          <span className="text-[28px] font-heading font-bold text-primary leading-none">
            AssetFlow
          </span>
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.1em]">
            Enterprise ERP
          </span>
        </div>

        {/* Quick Action Dropdown */}
        <QuickActionMenu />

        {/* Navigation list */}
        <nav className="flex flex-col gap-8">
          {navItems.map(renderItem)}
        </nav>
      </div>

      {/* Bottom Pinned Items */}
      <div className="flex flex-col gap-8 border-t border-border/60 pt-16">
        {bottomItems.map(renderItem)}
        
        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-16 h-44 px-16 rounded-control relative font-medium text-[14px] text-danger hover:bg-danger/8 transition-all group select-none outline-none focus:ring-1 focus:ring-danger/10 cursor-pointer w-full text-left"
        >
          <span className="text-danger flex items-center justify-center">
            <LogOut size={20} />
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

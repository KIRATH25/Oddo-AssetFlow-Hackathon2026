import { useState, useEffect } from 'react'
import AuthShell from './components/auth/AuthShell'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuthRedirect } from './lib/auth'
import type { UserProfile } from './lib/auth'
import { supabase } from './lib/supabaseClient'
import { Shield, Wrench, Users, User as UserIcon, LogOut, CheckCircle2, Package, Clock, FileText } from 'lucide-react'

function App() {
  const [route, setRoute] = useState<string>('login')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  // Listen to path on mount to support redirect URL callbacks from OAuth
  useEffect(() => {
    const path = window.location.pathname
    if (path.includes('/auth/callback')) {
      setRoute('auth/callback')
      // Simulate resolving callback
      const timer = setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session && session.user) {
            setUserProfile({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'Google User',
              email: session.user.email || '',
              role: 'employee', // Default Google role
              department_id: null,
              status: 'active'
            })
            setRoute('dashboard')
          } else {
            setRoute('login')
          }
        })
      }, 1500)
      return () => clearTimeout(timer)
    } else {
      // Check active session on mount
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          // If session exists, fetch profile
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data, error }) => {
              if (!error && data) {
                setUserProfile(data as UserProfile)
              } else {
                setUserProfile({
                  id: session.user.id,
                  full_name: session.user.user_metadata?.full_name || 'User',
                  email: session.user.email || '',
                  role: (session.user.user_metadata?.role as any) || 'employee',
                  department_id: null,
                  status: 'active'
                })
              }
              setRoute('dashboard')
              setIsCheckingSession(false)
            })
        } else {
          setIsCheckingSession(false)
        }
      })
    }
  }, [])

  // Auto redirect already logged in users using our custom hook
  useAuthRedirect((profile) => {
    setUserProfile(profile)
    setRoute('dashboard')
    setIsCheckingSession(false)
  })

  const handleAuthSuccess = (profile: UserProfile | null) => {
    setUserProfile(profile)
    setRoute('dashboard')
  }

  const handleSignOut = async () => {
    setIsCheckingSession(true)
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Error signing out:', e)
    }
    setUserProfile(null)
    setRoute('login')
    setIsCheckingSession(false)
  }

  // Pulsing skeleton loading state
  const FormSkeleton = () => (
    <div className="flex flex-col gap-32 animate-pulse w-full select-none">
      {/* Title skeleton */}
      <div className="flex flex-col gap-8">
        <div className="h-32 w-48 bg-border rounded-control" />
        <div className="h-16 w-64 bg-border rounded-control" />
      </div>
      {/* Inputs skeleton */}
      <div className="flex flex-col gap-24 mt-16">
        <div className="flex flex-col gap-8">
          <div className="h-16 w-24 bg-border rounded-control" />
          <div className="h-48 w-full bg-border rounded-control" />
        </div>
        <div className="flex flex-col gap-8">
          <div className="h-16 w-24 bg-border rounded-control" />
          <div className="h-48 w-full bg-border rounded-control" />
        </div>
        <div className="flex justify-between items-center mt-8">
          <div className="h-16 w-24 bg-border rounded-control" />
          <div className="h-16 w-32 bg-border rounded-control" />
        </div>
        <div className="h-48 w-full bg-border rounded-control mt-16" />
      </div>
      {/* Divider & Google skeleton */}
      <div className="flex items-center gap-16 py-8">
        <div className="flex-grow h-[1px] bg-border" />
        <div className="h-16 w-32 bg-border rounded-control" />
        <div className="flex-grow h-[1px] bg-border" />
      </div>
      <div className="h-48 w-full bg-border rounded-control" />
    </div>
  )

  // 1. Session check loading shell
  if (isCheckingSession && route !== 'dashboard') {
    return (
      <AuthShell activeKey="skeleton">
        <FormSkeleton />
      </AuthShell>
    )
  }

  // 2. Auth Callback View (Google OAuth landing)
  if (route === 'auth/callback') {
    return (
      <AuthShell activeKey="callback">
        <div className="flex flex-col items-center justify-center gap-24 py-32 text-center">
          <svg className="animate-spin h-40 w-40 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="flex flex-col gap-8">
            <h3 className="text-[20px] font-semibold text-text-primary">Authenticating...</h3>
            <p className="text-[14px] text-text-secondary">Securing your session with Google OAuth</p>
          </div>
        </div>
      </AuthShell>
    )
  }

  // 3. Authenticated Dashboard View (Role-aware mock)
  if (route === 'dashboard' && userProfile) {
    const getRoleConfig = (role: string) => {
      switch (role) {
        case 'admin':
          return {
            label: 'Administrator',
            color: 'bg-danger/10 border-danger/20 text-danger',
            icon: <Shield size={16} />,
            desc: 'Full read/write permissions over company assets, access configuration, and user audits.'
          }
        case 'assetManager':
          return {
            label: 'Asset Manager',
            color: 'bg-primary/10 border-primary/20 text-primary',
            icon: <Wrench size={16} />,
            desc: 'Authorized to add new physical assets, assign custodians, and update asset status.'
          }
        case 'departmentHead':
          return {
            label: 'Department Head',
            color: 'bg-info/10 border-info/20 text-info',
            icon: <Users size={16} />,
            desc: 'View reports, approve asset requests, and allocate budget limits for resources.'
          }
        case 'employee':
        default:
          return {
            label: 'Employee',
            color: 'bg-secondary/15 border-secondary/20 text-text-secondary',
            icon: <UserIcon size={16} />,
            desc: 'Submit new checkout requests, track your active physical assets, and report damage.'
          }
      }
    }

    const roleConfig = getRoleConfig(userProfile.role)

    return (
      <div className="min-h-screen w-full bg-bg flex items-center justify-center p-24">
        <div className="w-full max-w-[640px] bg-card rounded-card border border-border p-32 lg:p-48 shadow-soft flex flex-col gap-32">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-24">
            <div className="flex items-center gap-16">
              <svg className="w-24 h-24 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="text-[16px] font-bold text-text-primary">AssetFlow</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-8 px-16 h-40 border border-border rounded-control text-text-secondary hover:text-text-primary hover:bg-bg transition-colors text-[13px] font-medium active:scale-[0.98] focus:outline-none"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>

          {/* User Info Card */}
          <div className="flex flex-col gap-16">
            <span className="text-[32px] font-heading font-bold text-primary select-none">
              Welcome, {userProfile.full_name}
            </span>
            <div className="flex items-center gap-16 flex-wrap">
              <span className="text-[14px] text-text-secondary">{userProfile.email}</span>
              <div className={`flex items-center gap-8 px-12 py-[4px] rounded-full border text-[12px] font-semibold tracking-wide uppercase select-none ${roleConfig.color}`}>
                {roleConfig.icon}
                <span>{roleConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-bg/40 border border-border/40 p-16 rounded-control text-[14px] text-text-secondary leading-relaxed">
            <p className="font-semibold text-text-primary mb-[4px]">Role Access Scope:</p>
            {roleConfig.desc}
          </div>

          {/* Dummy stats / action blocks to feel premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 select-none">
            <div className="bg-card border border-border p-16 rounded-control flex flex-col gap-8">
              <Package size={20} className="text-primary" />
              <span className="text-[20px] font-bold text-text-primary">12</span>
              <span className="text-[12px] text-text-secondary">Assigned Assets</span>
            </div>
            <div className="bg-card border border-border p-16 rounded-control flex flex-col gap-8">
              <Clock size={20} className="text-warning" />
              <span className="text-[20px] font-bold text-text-primary">2</span>
              <span className="text-[12px] text-text-secondary">Pending Requests</span>
            </div>
            <div className="bg-card border border-border p-16 rounded-control flex flex-col gap-8">
              <FileText size={20} className="text-success" />
              <span className="text-[20px] font-bold text-text-primary">98%</span>
              <span className="text-[12px] text-text-secondary">Compliance Score</span>
            </div>
          </div>

          {/* Action Callout */}
          <div className="border-t border-border/60 pt-24 flex items-center justify-between text-[13px] text-text-secondary font-medium">
            <div className="flex items-center gap-8 text-success">
              <CheckCircle2 size={16} />
              <span>Supabase Session Active</span>
            </div>
            <span>v1.0.0 (SaaS Preview)</span>
          </div>
        </div>
      </div>
    )
  }

  // 4. Default Guest Auth screens
  return (
    <AuthShell activeKey={route}>
      {route === 'login' ? (
        <Login onNavigate={setRoute} onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Signup onNavigate={setRoute} />
      )}
    </AuthShell>
  )
}

export default App

import { useState, useEffect } from 'react'
import AuthShell from './components/auth/AuthShell'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { useAuthRedirect } from './lib/auth'
import type { UserProfile } from './lib/auth'
import { supabase } from './lib/supabaseClient'
import ExecutiveDashboard from './pages/ExecutiveDashboard'


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
      // Check localStorage for offline demo session first
      const localDemo = localStorage.getItem('assetflow_demo_profile')
      if (localDemo) {
        try {
          const profile = JSON.parse(localDemo)
          setUserProfile(profile)
          setRoute('dashboard')
          setIsCheckingSession(false)
          return
        } catch (e) {
          localStorage.removeItem('assetflow_demo_profile')
        }
      }
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
    if (profile) {
      localStorage.setItem('assetflow_demo_profile', JSON.stringify(profile))
    }
    setUserProfile(profile)
    setRoute('dashboard')
  }

  const handleSignOut = async () => {
    setIsCheckingSession(true)
    localStorage.removeItem('assetflow_demo_profile')
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
    return (
      <ExecutiveDashboard
        userProfile={userProfile}
        onSignOut={handleSignOut}
      />
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

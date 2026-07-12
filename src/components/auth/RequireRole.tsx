import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

interface RequireRoleProps {
  role: string;
  children: React.ReactElement;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ role, children }) => {
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    let active = true

    async function checkRole() {
      try {
        // 1. Check local storage demo profile fallback first
        const demoProfileStr = localStorage.getItem('assetflow_demo_profile')
        if (demoProfileStr) {
          try {
            const demoProfile = JSON.parse(demoProfileStr)
            if (demoProfile?.role) {
              if (active) {
                setHasAccess(demoProfile.role.toLowerCase() === role.toLowerCase())
                setLoading(false)
              }
              return
            }
          } catch (e) {
            console.error('Failed to parse cached demo profile:', e)
          }
        }

        // 2. Fetch real Supabase session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          if (active) {
            setHasAccess(false)
            setLoading(false)
          }
          return
        }

        // 3. Query profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (error || !profile) {
          // Fallback to user metadata role inside session (in case database table is not initialized yet)
          const metaRole = session.user.user_metadata?.role
          if (metaRole && metaRole.toLowerCase() === role.toLowerCase()) {
            if (active) {
              setHasAccess(true)
              setLoading(false)
            }
            return
          }

          if (active) {
            setHasAccess(false)
            setLoading(false)
          }
          return
        }

        if (active) {
          setHasAccess(profile.role.toLowerCase() === role.toLowerCase())
          setLoading(false)
        }
      } catch {
        if (active) {
          setHasAccess(false)
          setLoading(false)
        }
      }
    }

    checkRole()
    return () => {
      active = false
    }
  }, [role])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center select-none">
        <svg className="animate-spin h-32 w-32 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  if (!hasAccess) {
    // Redirect with route alert state parameters
    return <Navigate to="/dashboard" replace state={{ alert: "You don't have access to this page." }} />
  }

  return children
}

export default RequireRole

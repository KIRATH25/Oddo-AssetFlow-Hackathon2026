import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthShell from './components/auth/AuthShell'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import { supabase } from './lib/supabaseClient'
import { motion } from 'framer-motion'
import type { UserProfile } from './lib/auth'
import { ToastProvider } from './components/shared/ToastContext'
import RequireRole from './components/auth/RequireRole'
import OrganizationLayout from './pages/Organization/OrganizationLayout'
import DepartmentsTab from './pages/Organization/DepartmentsTab'
import CategoriesTab from './pages/Organization/CategoriesTab'
import EmployeesTab from './pages/Organization/EmployeesTab'
import AssetDirectory from './pages/Assets/AssetDirectory'
import ResourcePlanner from './pages/Planner/ResourcePlanner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true)
      } else {
        const demoProfile = localStorage.getItem('assetflow_demo_profile')
        setIsAuthenticated(!!demoProfile)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true)
      } else {
        const demoProfile = localStorage.getItem('assetflow_demo_profile')
        setIsAuthenticated(!!demoProfile)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <svg className="animate-spin h-32 w-32 text-primary" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
               5.291A7.962 7.962 0 014 12H0c0
               3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route Guard (Redirects away from auth pages if logged in)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true)
      } else {
        const demoProfile = localStorage.getItem('assetflow_demo_profile')
        setIsAuthenticated(!!demoProfile)
      }
    })
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <svg className="animate-spin h-32 w-32 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

// Module Placeholder Screen
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-screen bg-bg text-text-primary flex">
    <Sidebar />
    <div className="flex-grow pl-[260px] flex flex-col">
      <TopBar />
      <main className="mt-[72px] p-32 flex-grow flex items-center justify-center">
        <div className="bg-card rounded-card border border-border p-48 text-center shadow-soft flex flex-col gap-16 select-none max-w-sm">
          <h2 className="text-[28px] font-heading font-bold text-primary">{title}</h2>
          <p className="text-[13px] text-text-secondary">
            This module is currently undergoing system staging and will be ready for production soon.
          </p>
        </div>
      </main>
    </div>
  </div>
)

// Auth Callback Router resolution
const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    })
  }, [])

  if (status === 'loading') {
    return (
      <AuthShell activeKey="callback">
        <div className="flex flex-col items-center justify-center gap-24 py-32 text-center">
          <svg className="animate-spin h-40 w-40 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h3 className="text-[20px] font-semibold text-text-primary">Authenticating...</h3>
        </div>
      </AuthShell>
    )
  }

  if (status === 'success') {
    return <Navigate to="/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export function App() {
  const handleAuthSuccess = (profile: UserProfile | null) => {
    if (profile) {
      localStorage.setItem('assetflow_demo_profile', JSON.stringify(profile))
    } else {
      localStorage.removeItem('assetflow_demo_profile')
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthShell activeKey="login">
                    <Login onAuthSuccess={handleAuthSuccess} />
                  </AuthShell>
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <AuthShell activeKey="signup">
                    <Signup />
                  </AuthShell>
                </PublicRoute>
              }
            />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected Dashboard and Modules */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-bg text-text-primary flex">
                    <Sidebar />
                    <div className="flex-grow pl-[260px] flex flex-col">
                      <TopBar />
                      <main className="mt-[72px] p-32 flex-grow overflow-y-auto">
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="flex flex-col gap-24 max-w-[1400px] mx-auto"
                        >
                          <AssetDirectory />
                        </motion.div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-bg text-text-primary flex">
                    <Sidebar />
                    <div className="flex-grow pl-[260px] flex flex-col">
                      <TopBar />
                      <main className="mt-[72px] p-32 flex-grow overflow-y-auto">
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                          className="flex flex-col gap-24 max-w-[1400px] mx-auto"
                        >
                          <ResourcePlanner />
                        </motion.div>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Analytics & Reports" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="System Settings" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organization"
              element={
                <ProtectedRoute>
                  <RequireRole role="Admin">
                    <OrganizationLayout />
                  </RequireRole>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="departments" replace />} />
              <Route path="departments" element={<DepartmentsTab />} />
              <Route path="categories" element={<CategoriesTab />} />
              <Route path="employees" element={<EmployeesTab />} />
            </Route>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="User Profile" />
                </ProtectedRoute>
              }
            />

            {/* Root Redirect Fallbacks */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App

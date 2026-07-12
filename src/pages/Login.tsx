import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import DemoAccessPanel from '../components/auth/DemoAccessPanel'
import { signInWithEmail, signInWithGoogle } from '../lib/auth'
import type { UserProfile } from '../lib/auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional()
})

type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginProps {
  onNavigate: (route: string) => void;
  onAuthSuccess: (profile: UserProfile | null) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate, onAuthSuccess }) => {
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDemoPanel, setShowDemoPanel] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  })

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true)
    setGlobalError(null)
    try {
      const { profile } = await signInWithEmail(data.email, data.password)
      onAuthSuccess(profile)
    } catch (err: any) {
      setGlobalError(err.message || 'Incorrect email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setGlobalError(null)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setGlobalError(err.message || 'Google authentication failed.')
      setIsLoading(false)
    }
  }

  const handleDemoSuccess = (profile: UserProfile | null) => {
    onAuthSuccess(profile)
  }

  const handleDemoError = (errMsg: string) => {
    setGlobalError(errMsg)
  }

  return (
    <div className="flex flex-col gap-32">
      {/* Headings */}
      <div className="flex flex-col gap-8">
        <h2 className="text-[36px] font-heading font-bold text-primary select-none">
          Welcome back
        </h2>
        <p className="text-[14px] text-text-secondary select-none">
          Sign in to your AssetFlow workspace
        </p>
      </div>

      {/* Global Error Banner */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="p-16 bg-danger/10 border border-danger/20 text-danger rounded-control flex items-start gap-16 relative"
          >
            <AlertCircle size={20} className="flex-shrink-0 mt-[2px]" />
            <div className="text-[13px] font-medium pr-24 leading-normal select-none">
              {globalError}
            </div>
            <button 
              type="button"
              onClick={() => setGlobalError(null)}
              className="absolute right-16 top-16 text-danger hover:opacity-75 focus:outline-none flex items-center justify-center"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-24">
        {/* Email */}
        <Input
          {...register('email')}
          label="Email address"
          type="email"
          id="login-email"
          placeholder="you@company.com"
          icon={<Mail />}
          error={errors.email?.message}
          autoComplete="email"
        />

        {/* Password */}
        <Input
          {...register('password')}
          label="Password"
          type="password"
          id="login-password"
          placeholder="••••••••"
          icon={<Lock />}
          error={errors.password?.message}
          autoComplete="current-password"
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-[13px] select-none">
          <label className="flex items-center gap-8 font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-16 h-16 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <a
            href="#forgot-password"
            onClick={(e) => e.preventDefault()}
            className="font-medium text-primary hover:underline transition-all"
          >
            Forgot password?
          </a>
        </div>

        {/* Sign In Button */}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex py-8 items-center select-none">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-16 text-text-secondary text-[13px] font-medium">
          or continue with
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Google Sign In */}
      <Button 
        type="button" 
        variant="google" 
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        Continue with Google
      </Button>

      {/* Demo Access Panel Toggle */}
      <div className="flex flex-col gap-16">
        <button
          type="button"
          onClick={() => setShowDemoPanel(!showDemoPanel)}
          className="text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-8 self-center select-none focus:outline-none"
        >
          <span>Try a demo role</span>
          {showDemoPanel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {showDemoPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden w-full"
            >
              <div className="py-8">
                <DemoAccessPanel 
                  onSuccess={handleDemoSuccess} 
                  onError={handleDemoError} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation Link */}
      <div className="text-center text-[14px] text-text-secondary select-none">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => onNavigate('signup')}
          className="font-semibold text-primary hover:underline focus:outline-none"
        >
          Sign up
        </button>
      </div>
    </div>
  )
}

export default Login

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, AlertCircle, X, Info, CheckCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter'
import { signUpWithEmail, signInWithGoogle } from '../lib/auth'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a symbol'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

type SignupFormInputs = z.infer<typeof signupSchema>;

interface SignupProps {}

export const Signup: React.FC<SignupProps> = () => {
  const navigate = useNavigate()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    }
  })

  // Watch password field to update the strength meter in real-time
  const watchedPassword = watch('password', '')

  // Handle countdown timer for resending verification email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const onSubmit = async (data: SignupFormInputs) => {
    setIsLoading(true)
    setGlobalError(null)
    try {
      await signUpWithEmail(data.fullName, data.email, data.password)
      setRegisteredEmail(data.email)
      setIsSuccess(true)
    } catch (err: any) {
      setGlobalError(err.message || 'An error occurred during sign up. Please try again.')
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

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return
    setResendCooldown(60) // Cooldown for 60 seconds
    try {
      // Stub resend call (Supabase auth has sign up email resend mechanisms if needed)
      // e.g. await supabase.auth.resend({ type: 'signup', email: registeredEmail })
      console.log('Resending verification email to:', registeredEmail)
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to resend verification email.')
    }
  }

  // Render success panel when email confirmation is triggered
  if (isSuccess) {
    return (
      <div className="flex flex-col gap-32 text-center items-center py-16">
        <div className="p-16 bg-success/10 rounded-full text-success flex items-center justify-center shadow-soft">
          <CheckCircle size={48} className="stroke-[1.5]" />
        </div>

        <div className="flex flex-col gap-8">
          <h2 className="text-[36px] font-heading font-bold text-primary select-none">
            Check your email
          </h2>
          <p className="text-[14px] text-text-secondary leading-relaxed max-w-[340px] select-none">
            We've sent a verification link to <span className="font-semibold text-text-primary">{registeredEmail}</span>. 
            Please confirm your email address to activate your account.
          </p>
        </div>

        <div className="flex flex-col gap-16 w-full">
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleResendEmail}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend verification email'}
          </Button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-8 text-[14px] font-semibold text-text-secondary hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to sign in</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-16">
      {/* Headings */}
      <div className="flex flex-col gap-8">
        <h2 className="text-[36px] font-heading font-bold text-primary select-none">
          Create your account
        </h2>
        <p className="text-[14px] text-text-secondary select-none">
          Get started with AssetFlow today
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
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-16">
        {/* Full Name & Work Email Row */}
        <div className="grid grid-cols-2 gap-16">
          <Input
            {...register('fullName')}
            label="Full name"
            type="text"
            id="signup-name"
            placeholder="John Doe"
            icon={<User />}
            error={errors.fullName?.message}
            autoComplete="name"
          />

          <Input
            {...register('email')}
            label="Work email"
            type="email"
            id="signup-email"
            placeholder="you@company.com"
            icon={<Mail />}
            error={errors.email?.message}
            autoComplete="email"
          />
        </div>

        {/* Password & Confirm Password Row */}
        <div className="grid grid-cols-2 gap-16 items-start">
          <div>
            <Input
              {...register('password')}
              label="Password"
              type="password"
              id="signup-password"
              placeholder="••••••••"
              icon={<Lock />}
              error={errors.password?.message}
              autoComplete="new-password"
            />
            {/* Real-time Strength Meter */}
            <PasswordStrengthMeter password={watchedPassword} />
          </div>

          <Input
            {...register('confirmPassword')}
            label="Confirm password"
            type="password"
            id="signup-confirm-password"
            placeholder="••••••••"
            icon={<Lock />}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />
        </div>

        {/* Static Info Banner (Tinted blue) */}
        <div className="py-8 px-16 bg-info/5 border border-info/15 text-info rounded-control flex items-center gap-16 select-none">
          <Info size={16} className="flex-shrink-0 text-info" />
          <p className="text-[12px] font-medium leading-normal text-left">
            Your account will be created as an Employee. An admin can grant additional access later.
          </p>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex flex-col gap-8 select-none">
          <label className="flex items-start gap-8 font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
            <input
              type="checkbox"
              {...register('terms')}
              className={`w-16 h-16 rounded border-border text-primary focus:ring-primary/20 mt-[4px] cursor-pointer
                ${errors.terms ? 'border-danger focus:ring-danger/20' : ''}
              `}
            />
            <span className="text-[13px] leading-relaxed">
              I agree to the{' '}
              <a href="#terms" onClick={(e) => e.preventDefault()} className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-primary hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="text-[13px] text-danger font-medium">
              {errors.terms.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Create account
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

      {/* Footer Navigation Link */}
      <div className="text-center text-[14px] text-text-secondary select-none">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-semibold text-primary hover:underline focus:outline-none cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}

export default Signup

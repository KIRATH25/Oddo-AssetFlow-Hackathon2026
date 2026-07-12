import React, { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type
    const errorId = error ? `${id || label}-error` : undefined

    return (
      <div className="flex flex-col gap-8 w-full">
        <label htmlFor={id} className="text-[14px] font-medium text-text-primary select-none">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-16 text-text-secondary pointer-events-none flex items-center justify-center w-24 h-24">
              {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 })}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId}
            className={`w-full min-h-[44px] bg-card border rounded-control text-text-primary placeholder:text-text-secondary/50 transition-all duration-200 outline-none
              ${icon ? 'pl-48' : 'pl-16'}
              ${isPassword ? 'pr-48' : 'pr-16'}
              ${error 
                ? 'border-danger focus:border-danger focus:ring-danger/15' 
                : 'border-border focus:border-primary focus:ring-primary/15'
              }
              focus:ring-[3px] focus:outline-none
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-16 text-text-secondary hover:text-text-primary transition-colors focus:outline-none flex items-center justify-center w-24 h-24"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <p id={errorId} className="text-[13px] text-danger font-medium select-none">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input

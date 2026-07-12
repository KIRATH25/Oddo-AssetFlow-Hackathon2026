import React from 'react'

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const getStrength = (val: string) => {
    let score = 0
    if (!val) return score

    if (val.length >= 8) score++
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++
    if (/[0-9]/.test(val)) score++
    if (/[^A-Za-z0-9]/.test(val)) score++

    return score
  }

  const score = getStrength(password)

  // Weak (<=1) -> Danger, Medium (2 or 3) -> Warning, Strong (4) -> Success
  const getStrengthColor = (s: number) => {
    if (s <= 1) return 'bg-danger'
    if (s <= 3) return 'bg-warning'
    return 'bg-success'
  }

  const colorClass = getStrengthColor(score)

  return (
    <div className="flex flex-col gap-8 w-full mt-8">
      <div className="flex gap-8 w-full">
        {[1, 2, 3, 4].map((seg) => (
          <div
            key={seg}
            className={`h-8 flex-1 rounded-full transition-all duration-300 ${
              seg <= score ? colorClass : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="text-[12px] text-text-secondary select-none">
        Use 8+ characters with a number and symbol
      </p>
    </div>
  )
}

export default PasswordStrengthMeter

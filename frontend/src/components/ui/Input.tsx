import React from 'react'
import { cn } from '@/utils/cn'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
  containerClassName?: string
  required?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, containerClassName, className, type, required, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const inputId = id || props.name
    const isPassword = type === 'password'

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400',
              'border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none',
              'transition-all duration-150',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              leftIcon && 'pl-10',
              (isPassword || rightElement) && 'pr-10',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
          {rightElement && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Select component — accepts either children (native <option>) or options array
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  options?: { value: string; label: string }[]
  placeholder?: string
  containerClassName?: string
  children?: React.ReactNode
}

export function Select({ label, error, hint, required, options, placeholder, containerClassName, className, id, children, ...props }: SelectProps) {
  const selectId = id || props.name
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900',
          'border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none',
          'transition-all duration-150',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {children ?? (
          <>
            {placeholder && <option value="">{placeholder}</option>}
            {options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </>
        )}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

// Textarea
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string; error?: string; hint?: string; required?: boolean; containerClassName?: string
}>(({ label, error, hint, required, containerClassName, className, id, ...props }, ref) => {
  const textId = id || props.name
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label htmlFor={textId} className="block text-sm font-medium text-slate-700">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textId}
        className={cn(
          'block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400',
          'border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none',
          'transition-all resize-none',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

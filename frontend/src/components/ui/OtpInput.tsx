import React, { useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  error?: boolean
  autoFocus?: boolean
  disabled?: boolean
}

export function OtpInput({ length = 6, value, onChange, error, autoFocus, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length)

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus()
  }, [autoFocus])

  const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = val
    onChange(next.join(''))
    if (val && idx < length - 1) refs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        const next = [...digits]
        next[idx - 1] = ''
        onChange(next.join(''))
        refs.current[idx - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus()
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      refs.current[idx + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted.padEnd(length, ''))
    const focusIdx = Math.min(pasted.length, length - 1)
    refs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { refs.current[idx] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          disabled={disabled}
          className={cn(
            'w-11 h-13 text-center text-lg font-semibold rounded-lg border-2 bg-white transition-all duration-150 outline-none',
            'focus:border-green-500 focus:ring-2 focus:ring-green-100',
            digit && 'border-green-500 bg-green-50 text-green-700',
            !digit && 'border-slate-200 text-slate-900',
            error && 'border-red-400 bg-red-50 shake',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
          style={{ width: '48px', height: '56px' }}
        />
      ))}
    </div>
  )
}
